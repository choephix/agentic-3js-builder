// Every prompt bake-off round in one flat table, as the lab page (lab.html) reads it from `lab.json`: one row per build with its
// round, model, arm, pitch, request numbers, check and render, plus the arms, every pitch set and each arm's prompt
// size. The dev server serves it at `/lab.json`; the static build and `npm run lab-export` write the same JSON. Shape: `LabData` in
// showcase/lab.ts. Thumbnails come from `npm run lab-thumbs` (scripts/lab-thumbs.ts).
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { bakeoffRound, bakeoffRounds } from "./bakeoff-data.mjs";

const bakeoffDir = resolve("bakeoff");
export const labThumbRoot = resolve("showcase/public/lab-thumbs");
/** Views with a `<slug>-<view>.webp` thumbnail besides the three-quarter `<slug>.webp` (scripts/lab-thumbs.ts). */
const THUMB_VIEWS = ["front", "side", "back", "top"];

const json = (path) => readFile(path, "utf8").then(JSON.parse, () => null);

/** The pitch files, oldest first; a subject belongs to the first set that lists it. */
const PITCH_SETS = [
  ["r1", "pitches.json"],
  ["r2", "pitches-r2.json"],
  ["r3", "pitches-r3.json"],
  ["r4", "pitches-r4.json"],
];

/** The first error line of a crash's stack, and where it was thrown: an SDK file, the build itself or the harness. */
function crash(text) {
  if (!text) return { message: null, where: null };
  const line = text.split("\n").find((row) => /^\w*Error\b|^Build or render failed|^Built in the page/.test(row));
  const at = /^(?:file:\/\/)?(\S+?):\d+$/m.exec(text.split("\n")[0])?.[1] ?? "";
  const where = /\/src\//.test(at)
    ? `src/${at.split("/src/")[1]}`
    : /\/builds\//.test(at)
      ? "build"
      : /playwright|targetInfo/.test(text)
        ? "browser"
        : at
          ? "harness"
          : null;
  return { message: (line ?? text.split("\n")[0]).slice(0, 400), where };
}

/**
 * A build's `v01` renders straight from the render folder, shaped like the dev server's render index
 * (`snapshots` in vite.config.mjs): for exports that run without it. `url` turns a file path into its address.
 */
export async function v01Renders(slug, root, url) {
  const tags = [];
  for (const arm of ["B", "A"]) {
    const dir = join(root, slug, arm, "snaps");
    const files = await readdir(dir).catch(() => []);
    if (!files.includes("v01-sheet.jpg")) continue;
    const shots = files
      .filter((name) => name.startsWith("v01-") && name.endsWith(".png"))
      .map((name) => ({ name: name.slice(4, -4), url: url(join(dir, name)) }));
    tags.push({ tag: "v01", arm, sheet: url(join(dir, "v01-sheet.jpg")), shots });
  }
  return { tags, downloads: [] };
}

/** `bakeoffUrl`: where a build's live 3D view is, `/bakeoff` on the showcase. */
export async function labData(renders, bakeoffUrl = "/bakeoff") {
  const arms = (await json(join(bakeoffDir, "arms.json"))).arms;
  const subjects = [];
  const seen = new Set();
  for (const [set, file] of PITCH_SETS) {
    const pitches = await json(join(bakeoffDir, file));
    for (const subject of pitches?.subjects ?? [])
      if (!seen.has(subject.id)) (seen.add(subject.id), subjects.push({ ...subject, set }));
  }
  const thumbs = new Set(await readdir(labThumbRoot).catch(() => []));
  const rounds = [];
  const builds = [];
  for (const id of await bakeoffRounds()) {
    if (/^smoke/i.test(id)) continue;
    const manifest = await json(join(bakeoffDir, "rounds", id, "round.json"));
    const data = await bakeoffRound(id, renders);
    if (!manifest || !data) continue;
    const { arms: _arms, subjects: roundSubjects, ...rest } = manifest;
    rounds.push({ ...rest, subjects: roundSubjects.map((subject) => subject.id), prompts: data.prompts });
    for (const build of data.builds) {
      const check = build.check;
      const report = check?.report ?? null;
      const issues = report?.issues ?? [];
      const shots = Object.fromEntries((build.render?.shots ?? []).map((shot) => [shot.name, shot.url]));
      const { message, where } = crash(check?.renderError);
      builds.push({
        slug: build.slug,
        round: id,
        model: build.model,
        effort: build.effort,
        arm: build.arm,
        subject: build.subject,
        level: build.level,
        started: build.started,
        wallMs: build.wallMs,
        status: build.status,
        apiError: build.error ?? null,
        finish: build.finishReason,
        hasCode: build.hasCode,
        input: build.usage?.prompt_tokens ?? null,
        cached: build.usage?.prompt_tokens_details?.cached_tokens ?? null,
        output: build.usage?.completion_tokens ?? null,
        reasoningChars: build.reasoningChars,
        cost: build.costUsd ?? null,
        checked: Boolean(check),
        typeErrors: check?.typeErrors ?? null,
        typeErrorSample: check?.typeErrorSample?.slice(0, 3) ?? [],
        rendered: check?.rendered ?? false,
        lane: check?.lane ?? null,
        crash: message,
        crashWhere: where,
        parts: report?.parts ?? null,
        triangles: report?.triangles ?? null,
        colors: report?.colors ?? null,
        textures: report?.textures ?? null,
        joints: report?.joints ?? null,
        size: report?.size ?? null,
        errorCount: issues.filter((issue) => issue.level === "error").length,
        errors: issues
          .filter((issue) => issue.level === "error")
          .slice(0, 3)
          .map((issue) => issue.message.slice(0, 300)),
        warnings: issues.filter((issue) => issue.level === "warning").length,
        thumb: thumbs.has(`${build.slug}.webp`) ? `lab-thumbs/${build.slug}.webp` : null,
        thumbViews: THUMB_VIEWS.filter((view) => thumbs.has(`${build.slug}-${view}.webp`)),
        sheet: build.render?.sheet ?? null,
        shots,
      });
    }
  }
  return { generated: new Date().toISOString(), bakeoffUrl, arms, subjects, rounds, builds };
}
