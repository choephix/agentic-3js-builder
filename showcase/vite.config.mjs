// Local endpoints and their static-build equivalents for sample sources and harness renders (`npm run snap`).
// Development serves renders through `/@fs/`; production copies the referenced files into the build.
import { watch } from "node:fs";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { defineConfig, searchForWorkspaceRoot } from "vite";

const sampleRoot = resolve("samples");
const snapshotRoot = resolve("/home/cx/tmp/public/nilo/agentic-3js-builder/snaps");
const SLUG = /^[A-Za-z0-9_-]+$/;

const url = (path) => `/@fs${path}`;
const list = (directory) => readdir(directory).catch(() => []);
const mtime = (path) =>
  stat(path).then(
    (details) => details,
    () => null,
  );

/**
 * Every tag of every arm, newest first: the contact sheet, the single shots, the report and the source as it was
 * at that tag; plus the latest exported GLBs per arm.
 */
async function snapshots(slug, fileUrl = url, sourceUrl = (arm, tag) => `/__render-source/${slug}/${arm}/${tag}`) {
  const root = resolve(snapshotRoot, slug);
  const tags = [];
  const downloads = [];
  if (!root.startsWith(`${snapshotRoot}${sep}`)) return { tags, downloads };
  for (const arm of ["B", "A"]) {
    const directory = join(root, arm, "snaps");
    const files = await list(directory);
    for (const sheet of files.filter((name) => name.endsWith("-sheet.jpg"))) {
      const tag = basename(sheet, "-sheet.jpg");
      const details = await mtime(join(directory, sheet));
      if (!details) continue; // A render can vanish while the harness rewrites it.
      const own = (suffix) => (files.includes(`${tag}${suffix}`) ? fileUrl(join(directory, `${tag}${suffix}`)) : null);
      const shots = files
        .filter((name) => name.startsWith(`${tag}-`) && name.endsWith(".png"))
        .map((name) => ({ name: name.slice(tag.length + 1, -".png".length), url: fileUrl(join(directory, name)) }))
        // A longer tag sharing this prefix ("v13" and "v13-final") owns its own shots.
        .filter((shot) => !files.includes(`${tag}-${shot.name.split("-")[0]}-sheet.jpg`));
      tags.push({
        tag,
        arm,
        time: details.mtimeMs,
        sheet: fileUrl(join(directory, sheet)),
        report: own("-report.json"),
        source: files.includes(`${tag}-creature.ts`) ? sourceUrl(arm, tag) : null,
        shots,
      });
    }
    const out = join(root, arm, "out");
    for (const name of (await list(out)).filter((file) => file.endsWith(".glb"))) {
      const details = await mtime(join(out, name));
      if (details) downloads.push({ name, arm, bytes: details.size, url: fileUrl(join(out, name)) });
    }
  }
  tags.sort((a, b) => b.time - a.time);
  return { tags, downloads };
}

/** A middleware for `/<name>/…` paths whose every segment is a plain name; anything else falls through. */
const byName = (handle) => async (request, response, next) => {
  const names = (request.url?.split("?")[0] ?? "").split("/").slice(1).map(decodeURIComponent);
  if (!names.length || !names.every((name) => SLUG.test(name))) return next();
  try {
    await handle(names, response);
  } catch {
    next();
  }
};

const sendText = async (response, path) => {
  const text = await readFile(path, "utf8");
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end(text);
};

async function sampleCreated() {
  const files = (await list(sampleRoot)).filter((file) => file.endsWith(".ts"));
  const times = await Promise.all(files.map((file) => stat(join(sampleRoot, file))));
  return Object.fromEntries(files.map((file, i) => [basename(file, ".ts"), times[i].birthtimeMs || times[i].mtimeMs]));
}

let buildDirectory;

const showcaseData = {
  name: "showcase-data",
  configResolved(config) {
    buildDirectory = resolve(config.root, config.build.outDir);
  },
  async writeBundle() {
    const destination = (route) => join(buildDirectory, route);
    const copy = async (source, route) => {
      const target = destination(route);
      await mkdir(dirname(target), { recursive: true });
      await copyFile(source, target);
    };
    const json = async (route, value) => {
      const target = destination(route);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, JSON.stringify(value));
    };
    const created = await sampleCreated();
    await json("__sample-created", created);
    for (const slug of Object.keys(created)) {
      await copy(join(sampleRoot, `${slug}.ts`), `__sample-source/${slug}`);
      const assets = new Map();
      const fileUrl = (path) => {
        const route = `renders/${relative(snapshotRoot, path).split(sep).join("/")}`;
        assets.set(route, path);
        return `/${route}`;
      };
      const sourceUrl = (arm, tag) => {
        const route = `__render-source/${slug}/${arm}/${tag}`;
        assets.set(route, join(snapshotRoot, slug, arm, "snaps", `${tag}-creature.ts`));
        return `/${route}`;
      };
      await json(`__snapshots/${slug}`, await snapshots(slug, fileUrl, sourceUrl));
      for (const [route, path] of assets) await copy(path, route);
    }
  },
  configureServer(server) {
    // samples/ sits outside the Vite root, so only files already loaded are watched. Watching the folder lets the
    // `samples/*` globs in catalog.ts and builds.ts see files being added or removed.
    server.watcher.add(sampleRoot);
    // Sources go out as raw text: a `.ts` file fetched through `/@fs/` would come back transformed.
    server.middlewares.use(
      "/__sample-source",
      byName(([slug], response) => sendText(response, join(sampleRoot, `${slug}.ts`))),
    );
    // When each sample file was created (newest first in the sample list). Falls back to mtime where the
    // filesystem records no birth time.
    server.middlewares.use("/__sample-created", async (_request, response) => {
      const created = await sampleCreated();
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(created));
    });
    server.middlewares.use(
      "/__render-source",
      byName(([slug, arm, tag], response) =>
        sendText(response, join(snapshotRoot, slug, arm, "snaps", `${tag}-creature.ts`)),
      ),
    );
    server.middlewares.use(
      "/__snapshots",
      byName(async ([slug], response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(await snapshots(slug)));
      }),
    );
    let timer;
    const changed = new Set();
    try {
      const watcher = watch(snapshotRoot, { recursive: true }, (_event, file) => {
        if (!file) return;
        changed.add(String(file).split(sep)[0]);
        clearTimeout(timer);
        timer = setTimeout(() => {
          for (const slug of changed) server.ws.send({ type: "custom", event: "snapshots", data: { slug } });
          changed.clear();
        }, 400);
      });
      server.httpServer?.on("close", () => watcher.close());
    } catch {
      // No render folder yet: the page just has no renders to show.
    }
  },
};

export default defineConfig({
  server: { fs: { allow: [searchForWorkspaceRoot(process.cwd()), snapshotRoot] } },
  plugins: [showcaseData],
});
