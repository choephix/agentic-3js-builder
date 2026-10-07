// Prompt bake-off: the same pitches through different system prompts (arms), one model reply each, as an app would
// run it: one system prompt, one pitch, one TypeScript module back. Calls go through `omp auth-gateway stdio`, which
// uses the stored omp logins and adds almost nothing to the prompt.
//
//   npm run bakeoff -- prompt <arm>                       write the arm's system prompt to scratch/ and print its size
//   npm run bakeoff -- run <round> [options]              ask the model for every missing (arm, subject, level) build
//   npm run bakeoff -- check <round>                      typecheck and render every build without a render yet
//   npm run bakeoff -- results <round>                    rebuild results.json from the run and check records
//
// run options: --model <provider/id> (anthropic/claude-sonnet-5-5) --effort <low|medium|high> (medium)
//   --arms a,b --subjects x,y --levels terse,rich --concurrency 8 --max-tokens 64000
//   --arm-set <file in bakeoff/> (arms.json) --pitches <file in bakeoff/> (pitches.json); `prompt` takes --arm-set too
//   --prompts-from <round>: reuse that round's system prompts verbatim
//
// Everything lands in bakeoff/rounds/<round>/: round.json (model, effort, arms, pitches as run), prompts/<arm>.md
// (the exact system prompts), runs/<slug>.json (request, reply, usage, cost, timing), runs/<slug>.md (the reply),
// builds/<slug>.ts (the module, with the SDK import pointed at src/index), checks/<slug>.json (type errors, render
// report), results.json (all of it, for the showcase's bakeoff page). Renders go where `npm run snap` puts them.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BAKEOFF = join(ROOT, "bakeoff");
const SNAPS = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");
const OMP = join(homedir(), ".local/bin/omp");
const SDK_NAME = "agentic-3js-builder";

type Arm = {
  id: string;
  letter: string;
  name: string;
  idea: string;
  contract: string;
  context: "source" | "docs" | "brief" | "none";
  taste: string | null;
};
type Subject = { id: string; kind: string; terse: string; rich: string };
type Level = "terse" | "rich";
type Job = { slug: string; arm: Arm; subject: Subject; level: Level };

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path: string, data: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};
// `--arm-set <file>` and `--pitches <file>` (in bakeoff/) pick other sets; the defaults are arms.json and pitches.json.
const cli = process.argv.slice(2);
const pick = (name: string, fallback: string) =>
  cli.includes(`--${name}`) ? cli[cli.indexOf(`--${name}`) + 1] : fallback;
const arms = () => readJson<{ arms: Arm[] }>(join(BAKEOFF, pick("arm-set", "arms.json"))).arms;
const pitches = () => readJson<{ subjects: Subject[] }>(join(BAKEOFF, pick("pitches", "pitches.json"))).subjects;
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

// ---------------------------------------------------------------------------------------------------------------
// Prompts

/** The docs as a model outside this repo reads them: one import name, no pointers to files it doesn't have. */
function cleanDoc(text: string) {
  return text
    .replace(/\/home\/cx\/noodlespace\/agentic-3js-builder\/src\/[a-z]+/g, SDK_NAME)
    .replace(/^Read with it:.*\n\n/m, "")
    .replace(/^`snap\.ts` bundles .*\n\n/m, "");
}

function context(kind: Arm["context"]) {
  if (kind === "none") return "";
  if (kind === "source") {
    const files = readdirSync(join(ROOT, "src"))
      .filter((name) => name.endsWith(".ts"))
      .sort();
    const body = files
      .map((name) => `## src/${name}\n\n\`\`\`ts\n${read(`src/${name}`).trimEnd()}\n\`\`\``)
      .join("\n\n");
    return `# SDK source\n\nThe complete source of the SDK. \`src/index.ts\` is the module \`"${SDK_NAME}"\`.\n\n${body}`;
  }
  const api = cleanDoc(read("docs/api.md"));
  if (kind === "brief")
    return `# SDK reference\n\n${api.slice(0, api.indexOf("\n## Frames")).replace(/^# API\n\n/, "")}`;
  return `# SDK reference\n\n${api.replace(/^# API\n\n/, "")}\n\n${cleanDoc(read("docs/conventions.md")).replace(/^# Conventions/, "## Conventions")}`;
}

function systemPrompt(arm: Arm) {
  const parts = [read(`bakeoff/prompts/${arm.contract}`)];
  if (arm.taste) parts.push(read(`bakeoff/prompts/${arm.taste}`));
  const ref = context(arm.context);
  if (ref) parts.push(ref);
  return `${parts.map((part) => part.trim()).join("\n\n")}\n`;
}

// ---------------------------------------------------------------------------------------------------------------
// The gateway: one JSON request per line on stdin, one response per line on stdout, answered in completion order.

type GatewayReply = { id: number; status: number; body: any };

function gateway() {
  const child = spawn(OMP, ["auth-gateway", "stdio"], { stdio: ["pipe", "pipe", "pipe"] });
  const waiting = new Map<number, (reply: GatewayReply) => void>();
  let next = 1;
  let buffer = "";
  let ready: () => void;
  const isReady = new Promise<void>((resolve) => (ready = resolve));
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const message = JSON.parse(line);
      if (message.ready) ready();
      else waiting.get(message.id)?.(message);
      waiting.delete(message.id);
    }
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk: string) => (stderr = (stderr + chunk).slice(-4000)));
  child.on("exit", (code) => {
    for (const resolve of waiting.values())
      resolve({ id: 0, status: 599, body: { error: `gateway exited ${code}: ${stderr}` } });
  });
  return {
    async send(path: string, body: unknown): Promise<GatewayReply> {
      await isReady;
      const id = next++;
      return new Promise((resolve) => {
        waiting.set(id, resolve);
        child.stdin.write(`${JSON.stringify({ id, path, body })}\n`);
      });
    },
    close: () => child.stdin.end(),
  };
}

async function pricing(model: string) {
  const out = await capture(OMP, ["models", "--json"]);
  const list = JSON.parse(out.stdout);
  const found = (Array.isArray(list) ? list : list.models).find((entry: any) => entry.selector === model);
  return found?.cost as { input: number; output: number; cacheRead: number; cacheWrite: number } | undefined;
}

// ---------------------------------------------------------------------------------------------------------------
// Replies → modules

/** The longest fenced code block, or null. */
function extractCode(text: string) {
  const blocks = [...text.matchAll(/```(?:ts|typescript|tsx|js|javascript)?[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);
  return blocks.sort((a, b) => b.length - a.length)[0] ?? null;
}

/** Points the SDK import name (and any subpath) at this repo's src/index.ts, relative to the build file. */
function wireImports(code: string, buildFile: string) {
  const index = relative(dirname(buildFile), join(ROOT, "src/index")).split("\\").join("/");
  return code.replace(/(["'])agentic-3js-builder(?:\/[^"']*)?\1/g, `"${index}"`);
}

// ---------------------------------------------------------------------------------------------------------------
// Commands

function option(args: string[], name: string, fallback: string) {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : fallback;
}
const list = (value: string) => (value ? value.split(",").map((item) => item.trim()) : []);

/** The harness takes alphanumeric slugs: `r1`, `fennec`, `terse`, `docs-sdk` → `r1FennecTerseDocsSdk`. */
const camel = (first: string, ...rest: string[]) =>
  first + rest.map((word) => word[0].toUpperCase() + word.slice(1)).join("");

function jobs(round: string, args: string[]): Job[] {
  if (!/^[A-Za-z0-9]+$/.test(round)) throw new Error(`Round id "${round}" must be letters and digits.`);
  const armIds = list(option(args, "arms", ""));
  const subjectIds = list(option(args, "subjects", ""));
  const levels = list(option(args, "levels", "terse,rich")) as Level[];
  const out: Job[] = [];
  for (const subject of pitches().filter((s) => !subjectIds.length || subjectIds.includes(s.id)))
    for (const level of levels)
      for (const arm of arms().filter((a) => !armIds.length || armIds.includes(a.id)))
        out.push({ slug: camel(round, subject.id, level, ...arm.id.split("-")), arm, subject, level });
  return out;
}

async function pool<T>(items: T[], size: number, work: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) await work(item);
    }),
  );
}

async function run(round: string, args: string[]) {
  const dir = join(BAKEOFF, "rounds", round);
  const model = option(args, "model", "anthropic/claude-sonnet-5-5");
  const effort = option(args, "effort", "medium");
  const maxTokens = Number(option(args, "max-tokens", "64000"));
  const concurrency = Number(option(args, "concurrency", "8"));
  const todo = jobs(round, args).filter((job) => !existsSync(join(dir, "runs", `${job.slug}.json`)));
  const cost = await pricing(model);

  const manifestPath = join(dir, "round.json");
  const manifest = existsSync(manifestPath)
    ? readJson<any>(manifestPath)
    : { id: round, started: new Date().toISOString() };
  const sdkCommit = (await capture("git", ["rev-parse", "--short", "HEAD"])).stdout.trim();
  writeJson(manifestPath, {
    ...manifest,
    model,
    effort,
    sdkCommit,
    promptsFrom: option(args, "prompts-from", "") || null,
    maxTokens,
    pricing: cost ?? null,
    arms: arms(),
    subjects: pitches(),
  });
  for (const arm of new Set(todo.map((job) => job.arm))) {
    const path = join(dir, "prompts", `${arm.id}.md`);
    mkdirSync(dirname(path), { recursive: true });
    // `--prompts-from <round>` reuses that round's exact system prompts, to compare models on identical input.
    const from = option(args, "prompts-from", "");
    writeFileSync(
      path,
      from ? readFileSync(join(BAKEOFF, "rounds", from, "prompts", `${arm.id}.md`), "utf8") : systemPrompt(arm),
    );
  }
  console.log(`${todo.length} builds to ask ${model} (${effort}) for, ${concurrency} at a time.`);

  const gw = gateway();
  let done = 0;
  await pool(todo, concurrency, async (job) => {
    if (existsSync(join(dir, "runs", `${job.slug}.json`))) return; // another runner got it first
    const system = readFileSync(join(dir, "prompts", `${job.arm.id}.md`), "utf8");
    const pitch = job.subject[job.level];
    const body = {
      model,
      reasoning_effort: effort,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: pitch },
      ],
    };
    let reply: GatewayReply | undefined;
    const started = Date.now();
    for (let attempt = 1; attempt <= 3; attempt++) {
      reply = await gw.send("/v1/chat/completions", body);
      if (reply.status === 200 || ![429, 500, 502, 503, 529, 599].includes(reply.status)) break;
      await new Promise((resolve) => setTimeout(resolve, 20_000 * attempt));
    }
    const wallMs = Date.now() - started;
    const message = reply?.body?.choices?.[0]?.message;
    const text: string = message?.content ?? "";
    const usage = reply?.body?.usage ?? null;
    const code = text ? extractCode(text) : null;
    const buildFile = join(dir, "builds", `${job.slug}.ts`);
    if (code) {
      mkdirSync(dirname(buildFile), { recursive: true });
      writeFileSync(buildFile, wireImports(code, buildFile));
    }
    const cached = usage?.prompt_tokens_details?.cached_tokens ?? 0;
    const costUsd =
      usage && cost
        ? ((usage.prompt_tokens - cached) * cost.input +
            cached * cost.cacheRead +
            usage.completion_tokens * cost.output) /
          1e6
        : null;
    writeJson(join(dir, "runs", `${job.slug}.json`), {
      slug: job.slug,
      arm: job.arm.id,
      subject: job.subject.id,
      level: job.level,
      pitch,
      model,
      effort,
      started: new Date(started).toISOString(),
      wallMs,
      status: reply?.status ?? null,
      error: reply?.status === 200 ? null : JSON.stringify(reply?.body).slice(0, 2000),
      finishReason: reply?.body?.choices?.[0]?.finish_reason ?? null,
      usage,
      costUsd,
      hasCode: Boolean(code),
      reasoning: message?.reasoning_content ?? null,
    });
    writeFileSync(join(dir, "runs", `${job.slug}.md`), text);
    done++;
    const tokens = usage ? `${usage.prompt_tokens} in / ${usage.completion_tokens} out` : "no usage";
    console.log(
      `[${done}/${todo.length}] ${job.slug}: ${reply?.status} ${code ? "code" : "NO CODE"}, ${tokens}, ` +
        `${(wallMs / 1000).toFixed(0)} s${costUsd != null ? `, $${costUsd.toFixed(3)}` : ""}`,
    );
  });
  gw.close();
  results(round);
}

function capture(command: string, args: string[], timeoutMs = 600_000) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(command, args, { cwd: ROOT, env: { ...process.env, SNAP_RENDER_ON_ERROR: "1" } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.on("close", (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr });
    });
  });
}

function findReport(slug: string) {
  for (const lane of ["B", "A"]) {
    const path = join(SNAPS, slug, lane, "snaps", "v01-report.json");
    if (existsSync(path)) return { lane, path };
  }
  return null;
}

async function check(round: string, args: string[]) {
  const dir = join(BAKEOFF, "rounds", round);
  const tsx = join(ROOT, "node_modules/.bin/tsx");
  const builds = readdirSync(join(dir, "builds"))
    .filter((name) => name.endsWith(".ts"))
    .map((name) => name.slice(0, -3))
    .filter((slug) => !existsSync(join(dir, "checks", `${slug}.json`)));
  console.log(`${builds.length} builds to check.`);
  let done = 0;
  await pool(builds, Number(option(args, "concurrency", "2")), async (slug) => {
    const file = join(dir, "builds", `${slug}.ts`);
    const types = await capture(tsx, ["scripts/typecheck.ts", file], 180_000);
    // Unused names (TS6133) are style, not API mistakes.
    const typeErrors = [...`${types.stdout}\n${types.stderr}`.matchAll(/^.*error TS(?!6133)\d+:.*$/gm)].map(
      (m) => m[0],
    );
    let render = await capture(tsx, ["scripts/snap.ts", file, "v01"]);
    // A dropped connection to the shared browser is not the build's fault: try once more.
    if (/do not launch your own browser/.test(render.stdout + render.stderr)) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      render = await capture(tsx, ["scripts/snap.ts", file, "v01"]);
    }
    const found = findReport(slug);
    const output = `${render.stdout}\n${render.stderr}`;
    const report = found ? readJson<any>(found.path) : null;
    writeJson(join(dir, "checks", `${slug}.json`), {
      slug,
      typeErrors: typeErrors.length,
      typeErrorSample: typeErrors.slice(0, 8).map((line) => line.replace(`${ROOT}/`, "")),
      rendered: Boolean(report),
      lane: found?.lane ?? null,
      renderError: report ? null : output.trim().split("\n").slice(-25).join("\n"),
      report: report && {
        parts: report.parts,
        triangles: report.triangles,
        colors: report.colors,
        textures: report.textures,
        joints: report.joints?.length ?? 0,
        size: report.size,
        issues: report.issues,
        fine: report.fine?.length ?? 0,
      },
    });
    done++;
    console.log(
      `[${done}/${builds.length}] ${slug}: ${typeErrors.length} type errors, ${report ? `rendered (${report.triangles} tris)` : "RENDER FAILED"}`,
    );
  });
  results(round);
}

function results(round: string) {
  const dir = join(BAKEOFF, "rounds", round);
  const runs = existsSync(join(dir, "runs"))
    ? readdirSync(join(dir, "runs")).filter((name) => name.endsWith(".json"))
    : [];
  const entries = runs.map((name) => {
    const runRecord = readJson<any>(join(dir, "runs", name));
    const checkPath = join(dir, "checks", name);
    const { reasoning: _reasoning, ...rest } = runRecord;
    return { ...rest, check: existsSync(checkPath) ? readJson<any>(checkPath) : null };
  });
  writeJson(join(dir, "results.json"), entries);
  const total = entries.reduce((sum, entry) => sum + (entry.costUsd ?? 0), 0);
  console.log(`results.json: ${entries.length} builds, $${total.toFixed(2)} estimated.`);
}

const [command, target, ...rest] = process.argv.slice(2);
if (command === "prompt") {
  const arm = arms().find((a) => a.id === target);
  if (!arm)
    throw new Error(
      `No arm "${target}". Arms: ${arms()
        .map((a) => a.id)
        .join(", ")}`,
    );
  const text = systemPrompt(arm);
  const out = join(ROOT, "scratch", "bakeoff", `${arm.id}.md`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, text);
  console.log(`${out}: ${text.length} chars, about ${Math.round(text.length / 3.6 / 1000)}k tokens`);
} else if (command === "run" && target) await run(target, rest);
else if (command === "check" && target) await check(target, rest);
else if (command === "results" && target) results(target);
else {
  console.error("Usage: npm run bakeoff -- prompt <arm> | run <round> [options] | check <round> | results <round>");
  process.exit(2);
}
