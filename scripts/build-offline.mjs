import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = process.cwd();
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? filesIn(join(directory, entry.name))
          : join(directory, entry.name),
      ),
    )
  ).flat();
}
const buildId = (await readFile(join(root, ".next/BUILD_ID"), "utf8")).trim();
const staticFiles = (await filesIn(join(root, ".next/static")))
  .filter((file) => /\.(js|css|woff2)$/.test(file))
  .map(
    (file) =>
      `/_next/static/${relative(join(root, ".next/static"), file).split(sep).join("/")}`,
  );
const publicFiles = (
  await Promise.all(
    ["brand", "samples", "images"].map(async (folder) =>
      (await filesIn(join(root, "public", folder))).map(
        (file) =>
          `/${relative(join(root, "public"), file).split(sep).join("/")}`,
      ),
    ),
  )
).flat();
const routes = [
  "/",
  "/coba",
  "/masuk",
  "/lacak",
  "/tentang/model",
  "/kub",
  "/kub/darat",
  "/kub/bayar",
  "/kub/dampak",
  "/nelayan",
  "/pembeli",
  "/pembeli/pesan",
  "/umkm",
  "/offline.html",
];
const template = await readFile(
  join(root, "scripts/service-worker.template.js"),
  "utf8",
);
const worker = template
  .replace('"__CACHE_NAME__"', JSON.stringify(`nelayanku-${buildId}`))
  .replace(
    '"__PRECACHE_URLS__"',
    JSON.stringify([...routes, ...staticFiles, ...publicFiles]),
  );
await writeFile(join(root, "public/sw.js"), worker);
console.log(
  `Offline: ${routes.length} pages and ${staticFiles.length + publicFiles.length} assets prepared`,
);
