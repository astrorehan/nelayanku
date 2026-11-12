FROM python:3.10-slim
WORKDIR /app
COPY ai_services/requirements-runtime.lock /app/ai_services/requirements-runtime.lock
RUN pip install --no-cache-dir -r ai_services/requirements-runtime.lock
COPY ai_services /app/ai_services
ENV AI_ENV=production AI_MANIFEST=/models/manifest.json PYTHONUNBUFFERED=1
EXPOSE 8000
USER 65534:65534
CMD ["python", "-m", "uvicorn", "ai_services.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--limit-concurrency", "16", "--timeout-keep-alive", "5"]
