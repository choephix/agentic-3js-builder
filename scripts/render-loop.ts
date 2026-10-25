// Render loop: a model improves its own module from renders, one single call per turn, for a fixed number of turns.
// Each turn renders the current module to the snap's contact sheet (every view in one image), and one call gets the
// module as its own earlier reply, that sheet, from the second turn on also the sheet before the edits that made the
// current module (BEFORE / AFTER), and the measurements `refine` sends. Odd turns fix what is wrong
// (prompts/loop-fix.md), even turns fix and add detail (prompts/loop-add.md); replies are SEARCH/REPLACE edits
// (prompts/refine-edits.md) or a whole module. A turn whose module fails to render gets one repair call
// (prompts/refine-repair.md); still failing, the frame keeps the last rendering module and the next turn starts there.
//
//   npx tsx scripts/render-loop.ts <round> --from <round>[,<round>] [--turns 20] [--model anthropic/claude-haiku-5-5]
//     [--effort low] [--max-tokens 120000]
//
// `--from` names frame 0: the one build of a `run` round, its repair round listed first when it had one
// (`--from r33hlfix,r33hl`). Turns land in bakeoff/rounds/<round>/ like any round (runs/, builds/, checks/, prompts/),
// with slugs `<round>T01<subject…>` and `<round>T01r<subject…>` for a turn's repair, plus frames.json: one entry per
// frame (0…turns) with the module shown, its base, the call, repair and render times, usage, cost, edits applied and
// failed, and the render's counts. An interrupted loop resumes after its last frame.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import {
  applyEdits,
  ask,
  capture,
  check,
  extractCode,
  gateway,
  pricing,
  reportText,
  wireImports,
  type Asked,
  type CheckRecord,
  type SnapReport,
} from "./bakeoff";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROUNDS = join(ROOT, "bakeoff", "rounds");
const SNAPS = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");
const SDK_NAME = "agentic-3js-builder";

type Json = Record<string, any>;
type Call = {
  ms: number;
  usage: Json | null;
  costUsd: number | null;
  status: number | null;
  finishReason: string | null;
};
type Frame = {
  frame: number;
  mode: "build" | "fix" | "add";
  /** The module this frame shows (an attempt, its repair, or the base it kept). */
  shown: { round: string; slug: string };
  /** Frame whose module this turn edited, and the frame shown as BEFORE in its prompt. */
  base: number | null;
  before: number | null;
  attempt: string | null;
  firstRender: boolean;
  repair: string | null;
  repaired: boolean | null;
  kept: boolean;
  call: Call | null;
  repairCall: Call | null;
  edits: { blocks: number; failed: string[]; wholeModule: boolean } | null;
  repairEdits: { blocks: number; failed: string[]; wholeModule: boolean } | null;
  checkMs: number;
  triangles: number | null;
  parts: number | null;
  moduleKb: number;
  sheet: string | null;
};

const readJson = <T = Json>(path: string): T => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path: string, data: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};
const args = process.argv.slice(2);
const option = (name: string, fallback: string) =>
  args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : fallback;

/** The snap's contact sheet, or a montage of its shots when the page wrote none (it skips the sheet on errors). */
async function sheetOf(slug: string, lane: string | null) {
  if (!lane) return null;
  const snaps = join(SNAPS, slug, lane, "snaps");
  if (existsSync(join(snaps, "v01-sheet.jpg"))) return join(snaps, "v01-sheet.jpg");
  const order = ["front", "three-quarter", "side", "back", "top", "low", "bones", "skeleton", "skeleton-side"];
  const shots = order.map((view) => join(snaps, `v01-${view}.png`)).filter(existsSync);
  if (!shots.length) return null;
  const out = join(snaps, "v01-loopsheet.jpg");
  const labelled = shots.flatMap((file) => ["-label", file.slice(file.lastIndexOf("v01-") + 4, -4), file]);
  await capture("montage", [...labelled, "-tile", "3x", "-geometry", "600x600+0+0", "-quality", "88", out]);
  return existsSync(out) ? out : null;
}

const callOf = (asked: Asked): Call => ({
  ms: asked.wallMs,
  usage: asked.usage,
  costUsd: asked.costUsd,
  status: asked.reply?.status ?? null,
  finishReason: asked.reply?.body?.choices?.[0]?.finish_reason ?? null,
});

async function main() {
  const [round] = args;
  const froms = (option("from", "") || "").split(",").filter(Boolean);
  if (!round || !/^[A-Za-z0-9]+$/.test(round) || !froms.length)
    throw new Error("Usage: npx tsx scripts/render-loop.ts <round> --from <round>[,<round>] [--turns 20]");
  const turns = Number(option("turns", "20"));
  const model = option("model", "anthropic/claude-haiku-5-5");
  const effort = option("effort", "low");
  const maxTokens = Number(option("max-tokens", "120000"));
  const dir = join(ROUNDS, round);
  const framesPath = join(dir, "frames.json");

  // Frame 0: the first source round (repair rounds first) that has a check for the build.
  const origin = froms[froms.length - 1];
  const firstSlug = readdirSync(join(ROUNDS, origin, "runs"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -5))[0];
  const suffix = firstSlug.slice(origin.length);
  const run0 = readJson(join(ROUNDS, origin, "runs", `${firstSlug}.json`));
  const system = readFileSync(join(ROUNDS, origin, "prompts", `${run0.arm}.md`), "utf8");
  const pitch: string = run0.pitch;

  const cost = await pricing(model);
  if (!existsSync(join(dir, "round.json")))
    writeJson(join(dir, "round.json"), {
      id: round,
      started: new Date().toISOString(),
      loopFrom: froms.join(","),
      model,
      effort,
      maxTokens,
      turns,
      arm: run0.arm,
      subject: run0.subject,
      level: run0.level,
      prompts: { fix: "loop-fix.md", add: "loop-add.md", edits: "refine-edits.md", repair: "refine-repair.md" },
      pricing: cost ?? null,
      sdkCommit: (await capture("git", ["rev-parse", "--short", "HEAD"])).stdout.trim(),
    });
  mkdirSync(join(dir, "prompts"), { recursive: true });
  writeFileSync(join(dir, "prompts", `${run0.arm}.md`), system);
  for (const file of ["loop-fix.md", "loop-add.md", "refine-edits.md", "refine-repair.md"])
    copyFileSync(join(ROOT, "bakeoff", "prompts", file), join(dir, "prompts", file));
  const prompt = (file: string) => readFileSync(join(dir, "prompts", file), "utf8").trim();

  const loadCheck = (r: string, slug: string) =>
    readJson<CheckRecord & { report: Json | null }>(join(ROUNDS, r, "checks", `${slug}.json`));
  const frames: Frame[] = existsSync(framesPath) ? readJson<Frame[]>(framesPath) : [];
  if (!frames.length) {
    const shownRound = froms.find((r) => existsSync(join(ROUNDS, r, "checks", `${r}${suffix}.json`)));
    if (!shownRound) throw new Error(`No checked build ${suffix} in ${froms.join(", ")}.`);
    const slug = `${shownRound}${suffix}`;
    const checked = loadCheck(shownRound, slug);
    if (!checked.rendered) throw new Error(`Frame 0 (${slug}) did not render; repair it first.`);
    const first = loadCheck(origin, firstSlug);
    frames.push({
      frame: 0,
      mode: "build",
      shown: { round: shownRound, slug },
      base: null,
      before: null,
      attempt: firstSlug,
      firstRender: first.rendered,
      repair: shownRound === origin ? null : slug,
      repaired: shownRound === origin ? null : true,
      kept: false,
      call: {
        ms: run0.wallMs,
        usage: run0.usage,
        costUsd: run0.costUsd,
        status: run0.status,
        finishReason: run0.finishReason,
      },
      repairCall: null, // the stats read repair rounds of frame 0 from their own run records
      edits: null,
      repairEdits: null,
      checkMs: 0,
      triangles: checked.report?.triangles ?? null,
      parts: checked.report?.parts ?? null,
      moduleKb: readFileSync(join(ROUNDS, shownRound, "builds", `${slug}.ts`)).length / 1024,
      sheet: await sheetOf(slug, checked.lane),
    });
    writeJson(framesPath, frames);
  }

  const gw = gateway();
  const ask1 = (messages: Json[]) =>
    ask(gw, { model, reasoning_effort: effort, max_tokens: maxTokens, messages }, cost);
  const image = (path: string) => ({
    type: "image_url",
    image_url: { url: `data:image/jpeg;base64,${readFileSync(path).toString("base64")}` },
  });

  /** Writes a reply's module and run record, renders it, and returns its check. */
  const land = async (slug: string, from: string, mode: string, current: string, asked: Asked) => {
    const edited = applyEdits(current, asked.text);
    const whole = edited.blocks ? null : extractCode(asked.text);
    const code = whole ?? edited.code;
    const buildFile = join(dir, "builds", `${slug}.ts`);
    mkdirSync(dirname(buildFile), { recursive: true });
    writeFileSync(buildFile, wireImports(code, buildFile));
    const edits = { blocks: edited.blocks, failed: edited.failed, wholeModule: Boolean(whole) };
    writeJson(join(dir, "runs", `${slug}.json`), {
      slug,
      from,
      mode,
      arm: run0.arm,
      subject: run0.subject,
      level: run0.level,
      pitch,
      model,
      effort,
      started: new Date(asked.started).toISOString(),
      wallMs: asked.wallMs,
      status: asked.reply?.status ?? null,
      error: asked.reply?.status === 200 ? null : JSON.stringify(asked.reply?.body).slice(0, 2000),
      finishReason: asked.reply?.body?.choices?.[0]?.finish_reason ?? null,
      usage: asked.usage,
      costUsd: asked.costUsd,
      hasCode: true,
      edits,
      reasoning: asked.message?.reasoning_content ?? null,
    });
    writeFileSync(join(dir, "runs", `${slug}.md`), asked.text);
    const started = Date.now();
    await check(round, []);
    const checkMs = Date.now() - started;
    const checkPath = join(dir, "checks", `${slug}.json`);
    // The shared browser was unreachable: `check` left the build unchecked. Try once more after a pause.
    if (!existsSync(checkPath)) {
      await sleep(15_000);
      await check(round, []);
    }
    if (!existsSync(checkPath)) throw new Error(`${slug}: the shared browser stayed unreachable; rerun to resume.`);
    return { checked: loadCheck(round, slug), edits, code, checkMs };
  };

  for (let t = frames.length; t <= turns; t++) {
    const base = [...frames].reverse().find((f) => !f.kept)!;
    const before = base.base == null ? null : frames[base.base];
    const mode = t % 2 ? "fix" : "add";
    // The module as the model wrote it: the runner's relative SDK and kit paths back to the import name.
    const current = readFileSync(join(ROUNDS, base.shown.round, "builds", `${base.shown.slug}.ts`), "utf8")
      .replace(/(["'])(?:\.\.\/)+kits\/([a-z]+)\1/g, `"${SDK_NAME}/kits/$2"`)
      .replace(/(["'])(?:\.\.\/)+src\/index\1/g, `"${SDK_NAME}"`);
    const baseCheck = loadCheck(base.shown.round, base.shown.slug);
    const report = reportText(
      readJson<SnapReport>(join(SNAPS, base.shown.slug, baseCheck.lane!, "snaps", "v01-report.json")),
    );
    const sheets = before?.sheet
      ? "Above are two contact sheets, every view in one image each: BEFORE is the model before the edits that made the current module, AFTER is the current module. Compare them: keep what those edits improved, and correct what they made worse."
      : "Above is its contact sheet: every view of the current module in one image.";
    const images = before?.sheet
      ? [
          { type: "text", text: `BEFORE · frame ${before.frame}` },
          image(before.sheet),
          { type: "text", text: `AFTER · frame ${base.frame} · the current module` },
          image(base.sheet!),
        ]
      : [{ type: "text", text: `Frame ${base.frame} · the current module` }, image(base.sheet!)];
    const text = `${prompt(mode === "fix" ? "loop-fix.md" : "loop-add.md")
      .replace("{sheets}", sheets)
      .replace("{report}", report)}\n\n${prompt("refine-edits.md")}`;
    const conversation = [
      { role: "system", content: system },
      { role: "user", content: pitch },
      { role: "assistant", content: `\`\`\`ts\n${current.trimEnd()}\n\`\`\`` },
    ];
    const tag = `T${String(t).padStart(2, "0")}`;
    const slug = `${round}${tag}${suffix}`;
    const asked = await ask1([...conversation, { role: "user", content: [...images, { type: "text", text }] }]);
    const frame: Frame = {
      frame: t,
      mode,
      shown: { round, slug },
      base: base.frame,
      before: before?.sheet ? before.frame : null,
      attempt: slug,
      firstRender: false,
      repair: null,
      repaired: null,
      kept: false,
      call: callOf(asked),
      repairCall: null,
      edits: null,
      repairEdits: null,
      checkMs: 0,
      triangles: null,
      parts: null,
      moduleKb: 0,
      sheet: null,
    };
    let landed = asked.reply?.status === 200 ? await land(slug, base.shown.slug, mode, current, asked) : null;
    if (landed) {
      frame.edits = landed.edits;
      frame.checkMs = landed.checkMs;
      frame.firstRender = landed.checked.rendered;
    }
    if (landed && !landed.checked.rendered) {
      // One repair call: the crashed module as the model's reply, the error, edits back.
      const repairSlug = `${round}${tag}r${suffix}`;
      const error = (landed.checked.renderError ?? "no render").replace(`${ROOT}/`, "");
      const fixed = await ask1([
        ...conversation.slice(0, 2),
        { role: "assistant", content: `\`\`\`ts\n${landed.code.trimEnd()}\n\`\`\`` },
        {
          role: "user",
          content: `${prompt("refine-repair.md").replace("{error}", error)}\n\n${prompt("refine-edits.md")}`,
        },
      ]);
      frame.repair = repairSlug;
      frame.repairCall = callOf(fixed);
      const repaired = fixed.reply?.status === 200 ? await land(repairSlug, slug, "repair", landed.code, fixed) : null;
      frame.repairEdits = repaired?.edits ?? null;
      frame.repaired = Boolean(repaired?.checked.rendered);
      frame.checkMs += repaired?.checkMs ?? 0;
      if (repaired?.checked.rendered) frame.shown = { round, slug: repairSlug };
      landed = repaired?.checked.rendered ? repaired : null;
    }
    if (landed?.checked.rendered) {
      frame.triangles = landed.checked.report?.triangles ?? null;
      frame.parts = landed.checked.report?.parts ?? null;
      frame.moduleKb = readFileSync(join(dir, "builds", `${frame.shown.slug}.ts`)).length / 1024;
      frame.sheet = await sheetOf(frame.shown.slug, landed.checked.lane);
    }
    if (!frame.sheet) {
      // Still broken (or no reply): the frame keeps the last rendering module; the next turn starts from it.
      Object.assign(frame, {
        kept: true,
        shown: base.shown,
        triangles: base.triangles,
        parts: base.parts,
        moduleKb: base.moduleKb,
        sheet: base.sheet,
      });
    }
    frames.push(frame);
    writeJson(framesPath, frames);
    const out = frame.call?.usage?.completion_tokens ?? 0;
    console.log(
      `${round} frame ${t} (${mode}): ${((frame.call?.ms ?? 0) / 1000).toFixed(0)} s, ${out} out, ` +
        `${frame.edits ? (frame.edits.wholeModule ? "whole module" : `${frame.edits.blocks - frame.edits.failed.length}/${frame.edits.blocks} edits`) : `status ${frame.call?.status}`}` +
        `${frame.firstRender ? "" : frame.repaired ? ", crashed, repaired" : ", crashed, kept the last frame"}` +
        `, ${frame.triangles ?? "–"} tris, ${frame.parts ?? "–"} parts`,
    );
  }
  gw.close();
}

await main();
