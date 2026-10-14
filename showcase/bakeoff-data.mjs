// One prompt bake-off round as the bakeoff page (bakeoff.html) reads it: every run record without its reasoning,
// merged with its check record and its render, plus the size of each arm's system prompt. Read from
// `bakeoff/rounds/<id>/` on every request rather than from results.json, which the runner only writes at the end, so
// builds show up while a round runs. The dev server serves it at `/__bakeoff/<id>`; the static build writes the same
// JSON. Shape: `RoundData` in showcase/bakeoff.ts.
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

export const bakeoffRoot = resolve("bakeoff/rounds");

const list = (directory) => readdir(directory).catch(() => []);
// A record the runner is still writing reads as missing until the next request.
const json = (path) => readFile(path, "utf8").then(JSON.parse, () => null);

/** Every round id with a manifest. */
export async function bakeoffRounds() {
  const ids = [];
  for (const id of await list(bakeoffRoot)) if (await json(join(bakeoffRoot, id, "round.json"))) ids.push(id);
  return ids;
}

/** Every build slug a round has asked for so far. */
export async function bakeoffSlugs(id) {
  return (await list(join(bakeoffRoot, id, "runs")))
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -5));
}

/**
 * The round's data. `renders(slug)` is the render index of a slug (`snapshots` in vite.config.mjs); a build shows
 * its `v01` render, from the lane its check names when there are two.
 */
export async function bakeoffRound(id, renders) {
  const dir = join(bakeoffRoot, id);
  const manifest = await json(join(dir, "round.json"));
  if (!manifest) return null;
  const prompts = {};
  for (const arm of manifest.arms) {
    const text = await readFile(join(dir, "prompts", `${arm.id}.md`), "utf8").catch(() => null);
    prompts[arm.id] = text === null ? null : text.length;
  }
  const builds = await Promise.all(
    (await bakeoffSlugs(id)).map(async (slug) => {
      const run = await json(join(dir, "runs", `${slug}.json`));
      if (!run) return null;
      const { reasoning, ...rest } = run;
      const check = await json(join(dir, "checks", `${slug}.json`));
      const { tags } = run.hasCode ? await renders(slug) : { tags: [] };
      const v01 = tags.filter((tag) => tag.tag === "v01");
      const render = v01.find((tag) => tag.arm === check?.lane) ?? v01[0] ?? null;
      return { ...rest, reasoningChars: reasoning?.length ?? 0, check, render };
    }),
  );
  return { id, prompts, builds: builds.filter(Boolean) };
}
