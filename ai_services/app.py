"""FastAPI entry point: python -m uvicorn ai_services.app:app."""

import asyncio
import hmac
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal
from uuid import uuid4

from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .image_pipeline import MAX_IMAGE_BYTES, ImageRejected
from .inference import FreshnessBundle

logger = logging.getLogger("nelayanku.ai")


class BodyLimit:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        total = 0

        async def bounded_receive():
            nonlocal total
            message = await receive()
            total += len(message.get("body", b""))
            if total > MAX_IMAGE_BYTES + 64 * 1024:
                raise HTTPException(413, "Request melebihi batas ukuran")
            return message

        await self.app(scope, bounded_receive, send)


def create_app(manifest_path: Path | None = None) -> FastAPI:
    token = os.getenv("AI_SERVICE_TOKEN", "")
    if os.getenv("AI_ENV") == "production" and not token:
        raise RuntimeError("AI_SERVICE_TOKEN is required in production")
    model_path = manifest_path or Path(os.getenv("AI_MANIFEST", "ai_services/artifacts/manifest.json"))
    running: set[asyncio.Task] = set()

    @asynccontextmanager
    async def lifespan(application):
        application.state.bundle = None
        application.state.capacity = asyncio.Semaphore(2)
        try:
            application.state.bundle = await asyncio.to_thread(FreshnessBundle, model_path)
        except Exception:
            logger.exception("AI bundle unavailable")
        yield
        if running:
            await asyncio.gather(*running, return_exceptions=True)

    application = FastAPI(title="Nelayanku Freshness API", version="1.0.0", lifespan=lifespan)
    application.add_middleware(BodyLimit)

    @application.middleware("http")
    async def request_identity(request, call_next):
        request.state.request_id = str(uuid4())
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        return response

    def error(request, status, code, message):
        return JSONResponse(status_code=status, content={"requestId": request.state.request_id, "code": code, "message": message})

    @application.exception_handler(ImageRejected)
    async def image_error(request, exc):
        return error(request, exc.status, exc.code, str(exc))

    @application.exception_handler(RequestValidationError)
    async def validation_error(request, exc):
        return error(request, 422, "invalid_fields", "Periksa part, species dan berkas image")

    @application.exception_handler(HTTPException)
    async def http_error(request, exc):
        return error(request, exc.status_code, f"http_{exc.status_code}", str(exc.detail))

    @application.get("/healthz")
    async def health():
        return {"status": "ok"}

    @application.get("/readyz")
    async def ready(request: Request):
        bundle = request.app.state.bundle
        if bundle is None:
            raise HTTPException(503, "Model belum siap")
        return {"status": "ready", "modelVersion": bundle.version}

    @application.post("/v1/freshness/predict")
    async def predict(request: Request, image: Annotated[UploadFile, File()],
                      part: Annotated[Literal["eye", "gill"], Form()],
                      species: Annotated[Literal["kembung", "tongkol", "cakalang"], Form()],
                      authorization: Annotated[str | None, Header()] = None):
        if token and not hmac.compare_digest(authorization or "", f"Bearer {token}"):
            raise HTTPException(401, "Kredensial layanan diperlukan")
        bundle = request.app.state.bundle
        if bundle is None:
            raise HTTPException(503, "Model belum siap")
        try:
            raw = await image.read(MAX_IMAGE_BYTES + 1)
        finally:
            await image.close()
        if len(raw) > MAX_IMAGE_BYTES:
            raise ImageRejected(413, "image_too_large", "Foto melebihi 5 MiB")
        semaphore = request.app.state.capacity
        try:
            await asyncio.wait_for(semaphore.acquire(), timeout=0.01)
        except TimeoutError:
            raise HTTPException(429, "Layanan sedang sibuk")

        async def infer():
            try:
                return await asyncio.to_thread(bundle.predict, raw, part, species)
            finally:
                semaphore.release()

        task = asyncio.create_task(infer())
        running.add(task)
        task.add_done_callback(running.discard)
        # A timed-out thread retains its capacity until inference actually ends.
        try:
            result = await asyncio.wait_for(asyncio.shield(task), timeout=15)
        except TimeoutError:
            raise HTTPException(503, "Waktu penilaian terlampaui")
        except ImageRejected:
            raise
        except Exception:
            logger.exception("Inference failed for request %s", request.state.request_id)
            raise HTTPException(503, "Penilaian belum tersedia")
        return {"requestId": request.state.request_id, **result}

    return application


app = create_app()
