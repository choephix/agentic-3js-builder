// Local endpoints and their static-build equivalents for sample sources, harness renders (`npm run snap`) and the
// sidebar thumbnails. Development serves renders and GLBs through `/@fs/`; production copies the referenced render
// images into the build as WebP and ships no GLBs. Thumbnails live in the public folder, so both serve them as
// `/thumbs/`.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { watch } from "node:fs";
import { copyFile, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { defineConfig, searchForWorkspaceRoot, transformWithOxc } from "vite";
import { bakeoffRoot, bakeoffRound, bakeoffRounds, bakeoffSlugs } from "./bakeoff-data.mjs";
import { labData } from "./lab-data.mjs";
import { roundLog } from "./round-log.mjs";
import { storageStudy } from "./storage-data.mjs";

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

/** `meta = { name: "…" }` at the top of a sample: its name as a double-quoted string literal. */
const META_NAME = /export const meta\s*=\s*\{[^}]*?\bname:\s*("(?:[^"\\\n]|\\.)*")/;

/**
 * Each sample's display name (`meta.name`), read from its source so the sample list can show names without
 * importing every sample module. A sample whose name is not a double-quoted literal is left out and listed by slug.
 */
async function sampleNames() {
  const files = (await list(sampleRoot)).filter((file) => file.endsWith(".ts"));
  const names = {};
  for (const file of files) {
    const literal = (await readFile(join(sampleRoot, file), "utf8")).match(META_NAME)?.[1];
    if (literal) names[basename(file, ".ts")] = JSON.parse(literal);
  }
  return names;
}

/** Every build record in samples/ (`Build` in builds.ts), in one file for the Builds table. */
async function buildRecords() {
  const files = (await list(sampleRoot)).filter((file) => file.endsWith(".build.json"));
  return Promise.all(files.map(async (file) => JSON.parse(await readFile(join(sampleRoot, file), "utf8"))));
}

/**
 * What the sample list uses from each build record (`BuildSummary` in builds.ts), so the page loads a sample's full
 * record only when the sample opens.
 */
const buildSummaries = (records) =>
  Object.fromEntries(
    records.map(({ slug, builder, cost, wallSeconds, tags, caveats }) => [
      slug,
      {
        builder: builder && {
          agent: builder.agent,
          model: builder.model,
          effort: builder.effort,
          scope: builder.scope,
        },
        cost,
        wallSeconds,
        tags,
        caveats: caveats.cost ? { cost: caveats.cost } : {},
      },
    ]),
  );

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

// ── WebP renders for the static build ───────────────────────────────────────────────────────────────────────────
// Production ships every render image as WebP, encoded by cwebp with settings per image kind (its filename suffix).
// Encoded files are kept in a cache outside the repo, mirroring the render folder, named with a short id of their
// encoder settings, so a settings change encodes again.

const webpRoot = resolve(snapshotRoot, "..", "snaps-webp");
const runFile = promisify(execFile);
const WEBP_LOSSLESS = ["-lossless", "-exact"];
const WEBP_VIEW = ["-q", "85", "-sharp_yuv", "-alpha_q", "100"];
const WEBP_SKELETON = ["-q", "92", "-alpha_q", "100"];
// Matched in order against the end of the filename, so `-skeleton-side` is tried before `-side`.
const WEBP_KINDS = [
  ["-sheet.jpg", ["-q", "85", "-sharp_yuv"]],
  ["-atlas.png", WEBP_LOSSLESS],
  ["-bones.png", WEBP_LOSSLESS],
  ["-groups.png", WEBP_LOSSLESS],
  ["-head.png", ["-q", "92", "-sharp_yuv", "-alpha_q", "100"]],
  ["-skeleton-side.png", WEBP_SKELETON],
  ["-skeleton.png", WEBP_SKELETON],
  ...["front", "back", "side", "three-quarter", "top", "low", "flex-a", "flex-b"].map((view) => [
    `-${view}.png`,
    WEBP_VIEW,
  ]),
];
const RENDER_IMAGE = /\.(png|jpg)$/;

/** The cwebp arguments for a render image, by its filename; an unknown kind encodes lossless, warning once. */
function webpArgs(path, warned) {
  const name = basename(path);
  const kind = WEBP_KINDS.find(([suffix]) => name.endsWith(suffix));
  if (kind) return kind[1];
  const suffix = name.slice(Math.max(0, name.lastIndexOf("-")));
  if (!warned.has(suffix)) {
    warned.add(suffix);
    console.warn(`renders: no WebP setting for *${suffix}, encoding lossless`);
  }
  return WEBP_LOSSLESS;
}

/** A render image's cached WebP, encoded with `args` unless the cached file is at least as new as the source. */
async function cachedWebp(source, args) {
  const id = createHash("sha1").update(args.join(" ")).digest("hex").slice(0, 8);
  const cached = join(webpRoot, `${relative(snapshotRoot, source).replace(RENDER_IMAGE, "")}.${id}.webp`);
  const [input, kept] = await Promise.all([stat(source), mtime(cached)]);
  if (kept && kept.mtimeMs >= input.mtimeMs)
    return { path: cached, bytesIn: input.size, bytesOut: kept.size, encoded: false };
  await mkdir(dirname(cached), { recursive: true });
  const temp = `${cached}.${process.pid}.tmp`;
  try {
    await runFile("cwebp", [...args, source, "-o", temp]);
    await rename(temp, cached);
  } catch (error) {
    await rm(temp, { force: true });
    throw new Error(`cwebp could not encode ${source}: ${error.message}`, { cause: error });
  }
  return { path: cached, bytesIn: input.size, bytesOut: (await stat(cached)).size, encoded: true };
}

/** Encode (or reuse) every render image and copy its WebP to its route, a few cwebp processes at a time. */
async function shipWebp(images, copy) {
  const jobs = [...images];
  const totals = { encoded: 0, reused: 0, bytesIn: 0, bytesOut: 0 };
  let next = 0;
  let failed = false;
  const worker = async () => {
    while (!failed && next < jobs.length) {
      const [route, { source, args }] = jobs[next++];
      try {
        const webp = await cachedWebp(source, args);
        await copy(webp.path, route);
        totals[webp.encoded ? "encoded" : "reused"] += 1;
        totals.bytesIn += webp.bytesIn;
        totals.bytesOut += webp.bytesOut;
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(12, availableParallelism()) }, worker));
  const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;
  console.log(
    `renders: ${totals.encoded} WebP images encoded, ${totals.reused} reused; ${mb(totals.bytesIn)} in, ${mb(totals.bytesOut)} out`,
  );
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
    // Bake-off builds have no sample file, only renders; their page reads the same render indexes.
    const bakeoffIds = await bakeoffRounds();
    const bakeoffBuilds = (await Promise.all(bakeoffIds.map(bakeoffSlugs))).flat();
    const indexed = new Map();
    // Every render image the indexes point to, by route: its source and cwebp arguments.
    const images = new Map();
    const warned = new Set();
    await json("__sample-created", created);
    await json("__sample-names", await sampleNames());
    const records = await buildRecords();
    await json("__build-records", records);
    await json("__build-summaries", buildSummaries(records));
    for (const slug of new Set([...Object.keys(created), ...owned, ...bakeoffBuilds])) {
      if (slug in created) await copy(join(sampleRoot, `${slug}.ts`), `__sample-source/${slug}`);
      const assets = new Map();
      const fileUrl = (path) => {
        // No GLB ships: the index's downloads are emptied below.
        if (path.endsWith(".glb")) return null;
        const file = relative(snapshotRoot, path).split(sep).join("/");
        if (RENDER_IMAGE.test(path)) {
          const route = `renders/${file.replace(RENDER_IMAGE, ".webp")}`;
          images.set(route, { source: path, args: webpArgs(path, warned) });
          return `/${route}`;
        }
        const route = `renders/${file}`;
        assets.set(route, path);
        return `/${route}`;
      };
      const sourceUrl = (arm, tag) => {
        const route = `__render-source/${slug}/${arm}/${tag}`;
        assets.set(route, join(snapshotRoot, slug, arm, "snaps", `${tag}-creature.ts`));
        return `/${route}`;
      };
      indexed.set(slug, { ...(await snapshots(slug, fileUrl, sourceUrl)), downloads: [] });
      await json(`__snapshots/${slug}`, indexed.get(slug));
      for (const [route, path] of assets) await copy(path, route);
    }
    // The phase-2 one-shot gap page (bakeoff/gap2_page.py) is static HTML reading WebP renders shipped here.
    const gap = await runFile("python3", ["bakeoff/gap2_page.py", "--publish", buildDirectory]);
    for (const path of JSON.parse(gap.stdout)) {
      const route = `renders/${relative(snapshotRoot, path).split(sep).join("/").replace(RENDER_IMAGE, ".webp")}`;
      images.set(route, { source: path, args: webpArgs(path, warned) });
    }
    await shipWebp(images, copy);
    for (const id of bakeoffIds)
      await json(`__bakeoff/${id}`, await bakeoffRound(id, (slug) => indexed.get(slug) ?? { tags: [], downloads: [] }));
    await json("lab.json", await labData((slug) => indexed.get(slug) ?? { tags: [], downloads: [] }));
    await json("__storage-study", await storageStudy(sampleRoot, snapshotRoot));
    for (const round of rounds) await json(`__round/${round.id}`, await roundLog(round, resolve(".")));
    await json("__thumbs", await thumbIndex());
  },
  configureServer(server) {
    // The report and experiment routes are pages, as on Netlify; otherwise Vite answers with their .ts files.
    server.middlewares.use((request, _response, next) => {
      const [path, query] = (request.url ?? "").split("?");
      if (["/round", "/bakeoff", "/lab", "/storage", "/assemble", "/assemble-loading"].includes(path))
        request.url = `${path}.html${query ? `?${query}` : ""}`;
      next();
    });
    // samples/ sits outside the Vite root, so only files already loaded are watched. Watching the folder lets the
    // `samples/*` globs in catalog.ts and builds.ts see files being added or removed.
    server.watcher.add(sampleRoot);
    // The round page's markdown and toolkit globs, which builders add files to while a round runs.
    server.watcher.add([experimentRoot, resolve("src")]);
    // Bake-off rounds fill in while they run: the page's globs (bakeoff-files.ts) see new builds and replies, and a
    // `bakeoff` event tells it to fetch the run and check records again.
    server.watcher.add(bakeoffRoot);
    let bakeoffTimer;
    const bakeoffChanged = new Set();
    server.watcher.on("all", (_event, path) => {
      if (!path.startsWith(`${bakeoffRoot}${sep}`)) return;
      bakeoffChanged.add(relative(bakeoffRoot, path).split(sep)[0]);
      clearTimeout(bakeoffTimer);
      bakeoffTimer = setTimeout(() => {
        for (const round of bakeoffChanged) server.ws.send({ type: "custom", event: "bakeoff", data: { round } });
        bakeoffChanged.clear();
      }, 400);
    });
    server.middlewares.use(
      "/__bakeoff",
      byName(async ([id], response) => {
        const data = await bakeoffRound(id, (slug) => snapshots(slug));
        if (!data) throw new Error(`No bake-off round ${id}`);
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(data));
      }),
    );
    // Every bake-off round in one table, for the lab page (lab-data.mjs), and the rounds' modules and replies as text.
    server.middlewares.use("/lab.json", async (request, response, next) => {
      if ((request.url?.split("?")[0] ?? "/") !== "/") return next();
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(await labData((slug) => snapshots(slug))));
    });
    server.middlewares.use("/lab-rounds", async (request, response, next) => {
      const [round, kind, file, ...rest] = (request.url?.split("?")[0] ?? "").split("/").slice(1);
      const ok =
        !rest.length &&
        SLUG.test(round ?? "") &&
        (kind === "builds" || kind === "runs") &&
        /^[A-Za-z0-9]+\.(ts|md)$/.test(file ?? "");
      if (!ok) return next();
      await sendText(response, join(bakeoffRoot, round, kind, file)).catch(() => next());
    });
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
    // Each sample's display name, for the sample list; see `sampleNames`.
    server.middlewares.use("/__sample-names", async (_request, response) => {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(await sampleNames()));
    });
    // The sample list's model filter and tooltips, and the Builds table; see `buildSummaries`, `buildRecords`.
    server.middlewares.use("/__build-summaries", async (_request, response) => {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(buildSummaries(await buildRecords())));
    });
    server.middlewares.use("/__build-records", async (_request, response) => {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(await buildRecords()));
    });
    server.middlewares.use("/__storage-study", async (_request, response, next) => {
      try {
        const study = await storageStudy(sampleRoot, snapshotRoot);
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(study));
      } catch (error) {
        next(error);
      }
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

// A bake-off build is one unedited model reply: it may not parse or may import a module that doesn't exist. A saved
// version (`<tag>-creature.ts` from `npm run snap`) is a sample as it was, run against today's SDK, which may have
// dropped something it imports. Either failure becomes a module that throws when its page imports it, so the page
// shows the failure and the static build still succeeds (a missing named export: `shimMissingExports` below).
const BAKEOFF_BUILD = /[\\/]bakeoff[\\/]rounds[\\/][^\\/]+[\\/]builds[\\/][^\\/]+\.ts$/;
const VERSION_SOURCE = /[\\/][AB][\\/]snaps[\\/][^\\/]+-creature\.ts$/;
const isVersionSource = (id) => id.startsWith(`${snapshotRoot}${sep}`) && VERSION_SOURCE.test(id);
const MISSING = "\0missing-import:";
const thrower = (message) => `throw new Error(${JSON.stringify(message)});\nexport default undefined;\n`;

const untrustedGuard = {
  name: "untrusted-guard",
  enforce: "pre",
  resolveId(source, importer) {
    if (!importer) return null;
    const version = isVersionSource(importer);
    if (!version && !BAKEOFF_BUILD.test(importer)) return null;
    // A saved version's imports (`../src/…`, `three`) resolve from samples/, where it was written.
    const from = version ? join(sampleRoot, basename(importer)) : importer;
    return this.resolve(source, from, { skipSelf: true }).then((found) => found ?? `${MISSING}${source}`);
  },
  load(id) {
    if (id.startsWith(MISSING)) return thrower(`Cannot find module "${id.slice(MISSING.length)}".`);
  },
  async transform(code, id) {
    if (!BAKEOFF_BUILD.test(id) && !isVersionSource(id)) return null;
    try {
      await transformWithOxc(code, id);
      return null;
    } catch (error) {
      // oxc's message is coloured for a terminal.
      return thrower(String(error?.message ?? error).replace(/\x1b\[[0-9;]*m/g, ""));
    }
  },
};

const VERSION_MODULES = "virtual:version-modules";
let serving = false;

/**
 * `versionModule(slug, arm, tag)`: a sample's module as saved at one render, for the Versions panel's viewer. The dev
 * server imports any saved source through `/@fs/`; the static build bundles every sample's saved sources, each its
 * own chunk, loaded on demand.
 */
const versionModules = {
  name: "version-modules",
  configResolved(config) {
    serving = config.command === "serve";
  },
  resolveId(source, importer) {
    if (source === VERSION_MODULES) return `\0${VERSION_MODULES}`;
    if (importer === `\0${VERSION_MODULES}` && isVersionSource(source)) return source;
  },
  async load(id) {
    if (id !== `\0${VERSION_MODULES}`) return null;
    if (serving)
      return `export const versionModule = (slug, arm, tag) =>\n  import(/* @vite-ignore */ \`/@fs${snapshotRoot}/\${slug}/\${arm}/snaps/\${tag}-creature.ts\`);\n`;
    const entries = [];
    for (const file of (await list(sampleRoot)).filter((name) => name.endsWith(".ts"))) {
      const slug = basename(file, ".ts");
      for (const arm of ["A", "B"]) {
        const directory = join(snapshotRoot, slug, arm, "snaps");
        for (const name of (await list(directory)).filter((item) => item.endsWith("-creature.ts"))) {
          const key = `${slug}/${arm}/${name.slice(0, -"-creature.ts".length)}`;
          entries.push(`  ${JSON.stringify(key)}: () => import(${JSON.stringify(join(directory, name))}),`);
        }
      }
    }
    return [
      `const modules = {\n${entries.join("\n")}\n};`,
      "export const versionModule = (slug, arm, tag) =>",
      "  modules[`${slug}/${arm}/${tag}`]?.() ?? Promise.reject(new Error(`No saved source for ${slug} ${tag}.`));",
      "",
    ].join("\n");
  },
};

// The dependency scan reads every module the pages' globs reach, and one unparseable bake-off build fails it, so
// the dev server skips pre-bundling. The scan leaves bake-off builds out: their imports are three and src/, which
// the samples already reach.
const bakeoffScanSkip = {
  name: "bakeoff-scan-skip",
  resolveId(source) {
    if (BAKEOFF_BUILD.test(source)) return { id: source, external: true };
  },
};

export default defineConfig({
  server: { fs: { allow: [searchForWorkspaceRoot(process.cwd()), snapshotRoot] } },
  optimizeDeps: { rolldownOptions: { plugins: [bakeoffScanSkip] } },
  // The sample viewer, experiment round, prompt bake-off, lab report, measured storage study and the two assembly
  // animations (showpiece and loading).
  build: {
    rolldownOptions: {
      input: {
        main: resolve("showcase/index.html"),
        round: resolve("showcase/round.html"),
        bakeoff: resolve("showcase/bakeoff.html"),
        lab: resolve("showcase/lab.html"),
        storage: resolve("showcase/storage.html"),
        assemble: resolve("showcase/assemble.html"),
        "assemble-loading": resolve("showcase/assemble-loading.html"),
      },
      // A bake-off build or a saved version may import a name its module no longer exports: undefined at run time,
      // as the page shows it, instead of failing the whole build. Samples are typechecked, so they never rely on this.
      shimMissingExports: true,
    },
  },
  plugins: [untrustedGuard, versionModules, showcaseData],
});
