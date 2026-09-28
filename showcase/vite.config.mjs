import { readFile, readdir, stat } from "node:fs/promises";
import { basename, join, resolve, sep } from "node:path";
import { defineConfig } from "vite";

const sampleRoot = resolve("samples");
const snapshotRoot = resolve("/home/cx/tmp/public/nilo/agentic-3js-builder/snaps");

async function listSnapshots(slug) {
  const sampleRoot = resolve(snapshotRoot, slug);
  if (!sampleRoot.startsWith(`${snapshotRoot}${sep}`)) return [];

  const entries = [];
  for (const arm of ["B", "A"]) {
    const directory = join(sampleRoot, arm, "snaps");
    let files;
    try {
      files = await readdir(directory);
    } catch {
      continue;
    }
    for (const file of files.filter((name) => name.endsWith("-sheet.jpg"))) {
      const filePath = join(directory, file);
      try {
        const details = await stat(filePath);
        entries.push({
          tag: basename(file, "-sheet.jpg"),
          arm,
          url: `/@fs/${filePath}`,
          modified: details.mtimeMs,
        });
      } catch {
        // A snapshot can disappear while the builder writes a new one.
      }
    }
  }
  return entries.sort((a, b) => b.modified - a.modified).map(({ tag, arm, url }) => ({ tag, arm, url }));
}

const snapshotIndex = {
  name: "snapshot-index",
  configureServer(server) {
    server.middlewares.use("/__sample-source", async (request, response, next) => {
      const slug = decodeURIComponent(request.url?.slice(1) ?? "");
      if (!/^[A-Za-z0-9_-]+$/.test(slug)) {
        next();
        return;
      }
      try {
        const source = await readFile(join(sampleRoot, `${slug}.ts`), "utf8");
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end(source);
      } catch {
        next();
      }
    });
    server.middlewares.use("/__snapshot-index", async (request, response, next) => {
      const slug = decodeURIComponent(request.url?.slice(1) ?? "");
      if (!/^[A-Za-z0-9_-]+$/.test(slug)) {
        next();
        return;
      }
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(await listSnapshots(slug)));
    });
  },
};

export default defineConfig({
  server: { fs: { allow: [snapshotRoot] } },
  plugins: [snapshotIndex],
});
