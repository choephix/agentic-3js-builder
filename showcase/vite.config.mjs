// Local endpoints and their static-build equivalents for sample sources, harness renders (`npm run snap`) and the
// sidebar thumbnails. Development serves renders through `/@fs/`; production copies the referenced files into the
// build. Thumbnails live in the public folder, so both serve them as `/thumbs/`.
import { createHash } from "node:crypto";
import { watch } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { roundLog } from "./round-log.mjs";

const sampleRoot = resolve("samples");
const snapshotRoot = resolve("/home/cx/tmp/public/nilo/agentic-3js-builder/snaps");
const experimentRoot = resolve("experiments");
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

/**
 * When each sample was created: the logged write that created it, from its build record (`npm run provenance`),
 * which survives a fresh checkout; else its file's birth time (or mtime where the filesystem records none).
 */
async function sampleCreated() {
 const files = (await list(sampleRoot)).filter((file) => file.endsWith(".ts"));
 const times = await Promise.all(
  files.map(async (file) => {
   const record = await readFile(join(sampleRoot, `${basename(file, ".ts")}.build.json`), "utf8").then(
    (text) => Date.parse(JSON.parse(text).created),
    () => NaN,
   );
   if (Number.isFinite(record)) return record;
   const details = await stat(join(sampleRoot, file));
   return details.birthtimeMs || details.mtimeMs;
  }),
 );
 return Object.fromEntries(files.map((file, i) => [basename(file, ".ts"), times[i]]));
}

// ── Sidebar thumbnails ───────────────────────────────────────────────────────────────────────────────────────────
// The page renders a thumbnail and posts it here; one image per sample is kept in `showcase/public/thumbs/`
// (a cache outside git, filled by `npm run thumbs` before every build and copied into it as `/thumbs/`), named by a
// key that hashes everything the picture depends on: the sample, the SDK and the page code that draws it. A kept
// image whose key no longer matches is stale: the page shows it until its replacement arrives.

const thumbRoot = resolve("showcase/public/thumbs");
const thumbUrl = (file) => `/thumbs/${file}`;
const THUMB_FILE = /^([A-Za-z0-9_-]+)-([0-9a-f]{12})\.(webp|png)$/;
const THUMB_TYPES = { "image/webp": "webp", "image/png": "png" };

async function sharedDigest() {
 const sdk = (await readdir(resolve("src"), { recursive: true }))
  .filter((file) => file.endsWith(".ts"))
  .sort()
  .map((file) => join(resolve("src"), file));
 const hash = createHash("sha1");
 // Paths relative to the repo, so every checkout agrees on the key.
 for (const file of [...sdk, resolve("showcase/viewer.ts"), resolve("showcase/thumbs.ts")])
  hash.update(relative(dirname(sampleRoot), file)).update(await readFile(file));
 return hash.digest("hex");
}

const thumbKey = async (slug, shared) =>
 createHash("sha1")
  .update(shared)
  .update(await readFile(join(sampleRoot, `${slug}.ts`)))
  .digest("hex")
  .slice(0, 12);

/** Per sample: its current key, the kept image (fresh or stale) and whether it is fresh. */
async function thumbIndex() {
 const [slugs, shared, files] = await Promise.all([
  list(sampleRoot).then((names) => names.filter((file) => file.endsWith(".ts")).map((file) => basename(file, ".ts"))),
  sharedDigest(),
  list(thumbRoot),
 ]);
 const index = {};
 for (const slug of slugs) {
  const key = await thumbKey(slug, shared);
  const kept = files.map((file) => THUMB_FILE.exec(file)).filter((match) => match?.[1] === slug);
  const pick = kept.find((match) => match[2] === key) ?? kept[0];
  index[slug] = { key, fresh: pick?.[2] === key, url: pick ? thumbUrl(pick[0]) : null };
 }
 return index;
}

/** Keep a posted thumbnail if it was drawn from the current key, replacing the sample's older image. */
async function keepThumb(slug, key, request) {
 const extension = THUMB_TYPES[request.headers["content-type"]];
 if (!extension) return { status: 415 };
 if (key !== (await thumbKey(slug, await sharedDigest()))) return { status: 409 };
 const chunks = [];
 let size = 0;
 for await (const chunk of request) {
  size += chunk.length;
  if (size > 4 << 20) return { status: 413 };
  chunks.push(chunk);
 }
 const file = `${slug}-${key}.${extension}`;
 await mkdir(thumbRoot, { recursive: true });
 await writeFile(join(thumbRoot, file), Buffer.concat(chunks));
 for (const old of await list(thumbRoot))
  if (old !== file && THUMB_FILE.exec(old)?.[1] === slug) await rm(join(thumbRoot, old), { force: true });
 return { status: 200, body: { url: thumbUrl(file) } };
}
/** Every experiment round's manifest, `experiments/<id>/round.json` (the round page, round.html). */
async function roundManifests() {
 const found = [];
 for (const name of await list(experimentRoot)) {
  const text = await readFile(join(experimentRoot, name, "round.json"), "utf8").catch(() => null);
  if (text) found.push(JSON.parse(text));
 }
 return found;
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
  const rounds = await roundManifests();
  // A round's own samples, toolkit tests included: those are deleted once their builders move on, and their
  // renders stay on the round page.
  const owned = rounds.flatMap((round) =>
   round.arms.flatMap((arm) => [
    ...round.subjects.map((subject) => `${subject.id}${arm.id[0].toUpperCase()}${arm.id.slice(1)}`),
    `${arm.id}Test`,
   ]),
  );
  await json("__sample-created", created);
  for (const slug of new Set([...Object.keys(created), ...owned])) {
   if (slug in created) await copy(join(sampleRoot, `${slug}.ts`), `__sample-source/${slug}`);
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
  for (const round of rounds) await json(`__round/${round.id}`, await roundLog(round, resolve(".")));
  await json("__thumbs", await thumbIndex());
 },
 configureServer(server) {
  // samples/ sits outside the Vite root, so only files already loaded are watched. Watching the folder lets the
  // `samples/*` globs in catalog.ts and builds.ts see files being added or removed.
  server.watcher.add(sampleRoot);
  // The round page's markdown and toolkit globs, which builders add files to while a round runs.
  server.watcher.add([experimentRoot, resolve("src")]);
  // What each builder of a round did, parsed from its session log on every request (round-log.mjs).
  server.middlewares.use(
   "/__round",
   byName(async ([id], response) => {
    const manifest = JSON.parse(await readFile(join(experimentRoot, id, "round.json"), "utf8"));
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(await roundLog(manifest, resolve("."))));
   }),
  );
  // Sources go out as raw text: a `.ts` file fetched through `/@fs/` would come back transformed.
  server.middlewares.use(
   "/__sample-source",
   byName(([slug], response) => sendText(response, join(sampleRoot, `${slug}.ts`))),
  );
  // When each sample joined the library (newest first in the sample list); see `sampleCreated`.
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
  server.middlewares.use("/__thumbs", async (request, response, next) => {
   const path = request.url?.split("?")[0] ?? "";
   const send = (status, body) => {
    response.statusCode = status;
    if (body === undefined) return response.end();
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(body));
   };
   try {
    if (request.method === "GET" && path === "/") return send(200, await thumbIndex());
    const [slug, key, ...rest] = path.split("/").slice(1);
    if (request.method !== "POST" || rest.length || !SLUG.test(slug ?? "") || !/^[0-9a-f]{12}$/.test(key ?? ""))
     return next();
    const { status, body } = await keepThumb(slug, key, request);
    send(status, body);
   } catch {
    send(404);
   }
  });
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
 // Two pages: the sample showcase and the experiment round page (`/round`).
 build: {
  rolldownOptions: { input: { main: resolve("showcase/index.html"), round: resolve("showcase/round.html") } },
 },
 plugins: [showcaseData],
});
