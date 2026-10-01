// Draws every missing or stale sidebar thumbnail before a showcase build.
//
//   npm run thumbs
//
// Thumbnails are a cache of each sample's picture, kept out of git in showcase/public/thumbs/ and named by a key over
// the sample, the SDK and the drawing code (showcase/vite.config.mjs). This starts the showcase dev server, opens it
// in the shared headless Chromium on :9333 and lets the page draw what is missing, exactly as browsing it would, until
// every listed sample is fresh or nothing new has arrived for a while. Without the browser it says so and leaves the
// thumbnails as they are: the built site then draws missing ones in the visitor's browser.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const CDP_URL = "http://127.0.0.1:9333";
/** Give up on the rest once no thumbnail has arrived for this long (a heavy sample builds in a few seconds). */
const QUIET_MS = 45_000;

type Kept = { key: string; fresh: boolean; url: string | null };

// A round's samples belong to the round page, not the sample list, so the page never draws them (showcase/rounds.ts).
const roundSlugs = new Set<string>();
for (const id of readdirSync("experiments", { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  let round: { subjects: { id: string }[]; arms: { id: string }[] };
  try {
    round = JSON.parse(readFileSync(join("experiments", id.name, "round.json"), "utf8"));
  } catch {
    continue;
  }
  for (const arm of round.arms) {
    const suffix = arm.id[0].toUpperCase() + arm.id.slice(1);
    roundSlugs.add(`${arm.id}Test`);
    for (const subject of round.subjects) roundSlugs.add(`${subject.id}${suffix}`);
  }
}

const browser = await chromium.connectOverCDP(CDP_URL).catch(() => null);
if (!browser) {
  console.log(`Thumbnails: no shared Chromium at ${CDP_URL}; keeping the ones on disk (the site draws missing ones).`);
  process.exit(0);
}

// Drawing uses WebGL, so it holds one of the shared GPU slots (lock files naming our pid), like `npm run snap`.
const slotDir = join(homedir(), "tmp/public/nilo/creature-lab/.gpu-slots");
mkdirSync(slotDir, { recursive: true });
let slotPath: string | null = null;
process.on("exit", () => {
  if (slotPath) rmSync(slotPath, { force: true });
});
for (let waited = 0; !slotPath; waited++) {
  for (let i = 0; i < 3 && !slotPath; i++) {
    const path = join(slotDir, `slot-${i}`);
    try {
      writeFileSync(path, String(process.pid), { flag: "wx" });
      slotPath = path;
    } catch {
      const owner = Number(readFileSync(path, "utf8") || 0);
      let alive = false;
      try {
        alive = owner > 0 && process.kill(owner, 0);
      } catch {}
      if (!alive) rmSync(path, { force: true });
    }
  }
  if (!slotPath) {
    if (waited === 0) console.log("Thumbnails: waiting for a free GPU slot…");
    await setTimeout(1000);
  }
}
const server = await createServer({
  configFile: "showcase/vite.config.mjs",
  root: "showcase",
  logLevel: "error",
  server: { port: 0, strictPort: false, host: "127.0.0.1" },
});
await server.listen();
const base = server.resolvedUrls!.local[0];
const index = async () => (await (await fetch(`${base}__thumbs`)).json()) as Record<string, Kept>;
const stale = async () =>
  Object.entries(await index())
    .filter(([slug, kept]) => !kept.fresh && !roundSlugs.has(slug))
    .map(([slug]) => slug);

const started = Date.now();
const before = await stale();
let remaining = before;
if (before.length) {
  console.log(
    `Thumbnails: drawing ${before.length} (${before.slice(0, 6).join(", ")}${before.length > 6 ? ", …" : ""})`,
  );
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  try {
    const page = await context.newPage();
    await page.goto(base);
    let last = Date.now();
    while (remaining.length && Date.now() - last < QUIET_MS) {
      await setTimeout(1000);
      const now = await stale();
      if (now.length < remaining.length) last = Date.now();
      remaining = now;
    }
  } finally {
    await context.close();
  }
}
await server.close();
const drawn = before.length - remaining.length;
console.log(
  `Thumbnails: ${drawn} drawn in ${((Date.now() - started) / 1000).toFixed(0)} s` +
    (remaining.length ? `; still missing or stale (they did not build): ${remaining.join(", ")}` : "; all fresh"),
);
process.exit(0);
