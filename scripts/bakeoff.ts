// Prompt bake-off: the same pitches through different system prompts (arms), one model reply each, as an app would
// run it: one system prompt, one pitch, one TypeScript module back. `refine` adds the app's feedback turns: the error
// when a module fails, its renders and measurements when it builds. Calls go through `omp auth-gateway stdio`, which
// uses the stored omp logins and adds almost nothing to the prompt; `anthropic/…` models go to `ANTHROPIC_PROVIDER`.
//
//   npm run bakeoff -- prompt <arm>                       write the arm's system prompt to scratch/ and print its size
//   npm run bakeoff -- run <round> [options]              ask the model for every missing (arm, subject, level) build
//   npm run bakeoff -- check <round>                      typecheck and render every build without a render yet;
//                                                         builds checked with --skip-typecheck get their type errors
//   npm run bakeoff -- refine <round> --from <round>[,…]  one feedback turn for every build of the source round(s)
//   npm run bakeoff -- results <round>                    rebuild results.json from the run and check records
//
// run options: --model <provider/id> (anthropic/claude-sonnet-5-5) --effort <low|medium|high> (medium)
//   --arms a,b --subjects x,y --levels terse,rich --concurrency 8 --max-tokens 64000
//   --arm-set <file in bakeoff/> (arms.json) --pitches <file in bakeoff/> (pitches.json); `prompt` takes --arm-set too
//   --prompts-from <round>: reuse that round's system prompts verbatim
//   an arm with `parallel: { plan, part }` builds through a planning call and concurrent part calls (`parallelBuild`)
// refine options: --model, --effort (high), --max-tokens 64000, --arms, --concurrency 8
//   --views three-quarter,front,side,low (snap shots sent as images) --critique <file in bakeoff/prompts/>
//   (refine-critique.md) --critic <provider/id> (another model writes the change list) --repair-only (failed builds)
//   --types: type errors count as failures and go into the repair turn (refine-types.md); off by default
//
// Everything lands in bakeoff/rounds/<round>/: round.json (model, effort, arms, pitches as run), prompts/<arm>.md
// (the exact system prompts), runs/<slug>.json (request, reply, usage, cost, timing), runs/<slug>.md (the reply),
// builds/<slug>.ts (the module, with the SDK import pointed at src/index), checks/<slug>.json (type errors, render
// report), results.json (all of it, for the showcase's bakeoff page). Renders go where `npm run snap` puts them.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { measure, measuredText, probe } from "./partfit";
import type { PartFit, Probe } from "./partfit";

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
  /** Prompt files from bakeoff/prompts/ appended after the taste. */
  extra?: string[];
  /** Every style kit (doc and source), importable as `agentic-3js-builder/kits/<name>`. */
  kits?: boolean;
  /** SDK source files (names in src/) appended verbatim after the reference. */
  sources?: string[];
  /** The SDK's type declarations (`tsc` output for src/, comments cut): every export's exact shape, no bodies. */
  declarations?: boolean;
  /** Sampler files (names in catalogs/, without `.ts`) appended last as read-only recipes, board code cut. */
  samplers?: string[];
  /** With `samplers`: only each file's header menu (slots and one line per construction), no code. */
  samplerMenu?: boolean;
  /** A prompt file in bakeoff/prompts/: the model first writes a build sheet from it, then the module. */
  plan?: string;
  /** Parallel parts: a planning call writes a shared spec from `plan`, then one call per part writes a function from
   *  `part`, all at once; the runner assembles one module (see `parallelBuild`). With `fit` (a prompt file) the
   *  runner then measures every part against its box and gives each one that sticks out one edit call from it. */
  parallel?: { plan: string; part: string; fit?: string };
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

/** Kit docs and sources as a model outside this repo reads them: kits import from `agentic-3js-builder/kits/<name>`. */
function kitText(text: string) {
  return cleanDoc(text)
    .replace(/(["'])\.\.\/kits\/([a-z]+)\1/g, `"${SDK_NAME}/kits/$2"`)
    .replace(/(["'])\.\.\/src\/[a-z]+\1/g, `"${SDK_NAME}"`)
    .replace(/(["'])\.\/([a-z]+)\1/g, `"${SDK_NAME}/kits/$2"`);
}

function kitsContext() {
  const names = readdirSync(join(ROOT, "kits"))
    .filter((name) => name.endsWith(".ts"))
    .map((name) => name.slice(0, -3))
    .sort();
  const body = names
    .map(
      (name) =>
        `## Kit: ${name}\n\n${kitText(read(`kits/${name}.md`)).trim()}\n\n### Source: kits/${name}.ts\n\n\`\`\`ts\n${kitText(read(`kits/${name}.ts`)).trimEnd()}\n\`\`\``,
    )
    .join("\n\n");
  return `# Style kits\n\nKits sit on top of the SDK and carry a look: their helpers are the tested way to get it. Import a kit from \`"${SDK_NAME}/kits/<name>"\`, e.g. \`import { cel, INK } from "${SDK_NAME}/kits/toon";\`. \`glow\` makes surfaces self-lit in any style.\n\n${body}`;
}

function sourcesContext(files: string[]) {
  const body = files.map((name) => `## src/${name}\n\n\`\`\`ts\n${read(`src/${name}`).trimEnd()}\n\`\`\``).join("\n\n");
  return `# Selected SDK source\n\nThese files are part of the module \`"${SDK_NAME}"\`.\n\n${body}`;
}

function declarationsContext() {
  const out = join(ROOT, "node_modules/.cache/declarations", String(process.pid));
  const config = join(out, "tsconfig.json");
  mkdirSync(out, { recursive: true });
  writeJson(config, { extends: join(ROOT, "tsconfig.json"), files: [join(ROOT, "src/index.ts")], include: [] });
  const tsc = spawnSync(
    join(ROOT, "node_modules/.bin/tsc"),
    ["-p", config, "--noEmit", "false", "--declaration", "--emitDeclarationOnly", "--rootDir", ROOT, "--outDir", out],
    { encoding: "utf8" },
  );
  const dir = join(out, "src");
  if (!existsSync(dir)) throw new Error(`Declaration emit failed:\n${tsc.stdout}${tsc.stderr}`);
  const body = readdirSync(dir)
    .filter((name) => name.endsWith(".d.ts"))
    .sort()
    .map((name) => {
      const text = readFileSync(join(dir, name), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*\n/gm, "")
        .replace(/^\s*\n/gm, "");
      return `## src/${name}\n\n\`\`\`ts\n${text.trimEnd()}\n\`\`\``;
    })
    .join("\n\n");
  rmSync(out, { recursive: true, force: true });
  return `# SDK type declarations\n\nThe exact type of everything the module \`"${SDK_NAME}"\` exports, generated from its source with bodies and comments cut. \`src/index.d.ts\` is the module.\n\n${body}`;
}

/** Samplers as the model reads them: SDK imports renamed, the headers' copy-this instructions and the cull-board
 *  section cut. */
function samplersContext(names: string[], menu = false) {
  const body = names
    .map((name) => {
      const text = cleanDoc(read(`catalogs/${name}.ts`))
        .replace(/^import .* from "\.\/board";\n/gm, "")
        .replace(/(["'])\.\.\/kits\/([a-z]+)\1/g, `"${SDK_NAME}/kits/$2"`)
        .replace(/(["'])\.\.\/src\/[a-z]+\1/g, `"${SDK_NAME}"`)
        .replace(/\n\/\/ -+ boards?\n[\s\S]*$/, "\n")
        .replace(/ \* Pick the parts you like, copy [\s\S]*? per pick\. /, " * ")
        .replace(/: copy them with a variant\./, ".")
        .replace(/ Each recipe is a plain function; copy what you use\./, "");
      if (menu) return `## Sampler menu: catalogs/${name}.ts\n\n${text.slice(0, text.indexOf("\n */") + 4)}`;
      return `## Sampler: catalogs/${name}.ts\n\n\`\`\`ts\n${text.trimEnd()}\n\`\`\``;
    })
    .join("\n\n");
  if (menu) return `# Sampler menus\n\n${body}`;
  return `# Samplers\n\nReference only. Your module imports \`three\` and the SDK.\n\n${body}`;
}

function systemPrompt(arm: Arm) {
  const parts = [read(`bakeoff/prompts/${arm.contract}`)];
  if (arm.taste) parts.push(read(`bakeoff/prompts/${arm.taste}`));
  for (const file of arm.extra ?? []) parts.push(read(`bakeoff/prompts/${file}`));
  const ref = context(arm.context);
  if (ref) parts.push(ref);
  if (arm.kits) parts.push(kitsContext());
  if (arm.sources?.length) parts.push(sourcesContext(arm.sources));
  if (arm.declarations) parts.push(declarationsContext());
  if (arm.samplers?.length) parts.push(samplersContext(arm.samplers, arm.samplerMenu));
  return `${parts.map((part) => part.trim()).join("\n\n")}\n`;
}

// ---------------------------------------------------------------------------------------------------------------
// The gateway: one JSON request per line on stdin, one response per line on stdout, answered in completion order.

/**
 * The omp provider that answers `anthropic/…` models. "anthropic-api" bills the Console API key in Aegis
 * (`anthropic-api-key`); "anthropic" bills the subscription logins. Records keep the `anthropic/…` id either way.
 */
const ANTHROPIC_PROVIDER: "anthropic-api" | "anthropic" = "anthropic-api";
const routed = (model: string) => model.replace(/^anthropic\//, `${ANTHROPIC_PROVIDER}/`);

type GatewayReply = { id: number; status: number; body: any };
type Request = { model: string; [field: string]: unknown };
type Gateway = { send(path: string, body: Request): Promise<GatewayReply>; close(): void };
type Rates = { input: number; output: number; cacheRead: number; cacheWrite: number };
type Pricing = (Rates & { longContext?: Rates & { inputThreshold: number } }) | undefined;

function gateway(): Gateway {
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
    async send(path: string, body: Request): Promise<GatewayReply> {
      await isReady;
      const id = next++;
      return new Promise((resolve) => {
        waiting.set(id, resolve);
        child.stdin.write(`${JSON.stringify({ id, path, body: { ...body, model: routed(body.model) } })}\n`);
      });
    },
    close: () => child.stdin.end(),
  };
}

async function pricing(model: string): Promise<Pricing> {
  const out = await capture(OMP, ["models", "--json"]);
  type Entry = { selector: string; cost?: Pricing };
  const list: Entry[] | { models: Entry[] } = JSON.parse(out.stdout);
  const entry = (Array.isArray(list) ? list : list.models).find((e) => e.selector === routed(model));
  if (!entry && routed(model) !== model)
    throw new Error(
      `${routed(model)} is not in \`omp models\`: add it to the profile's ${ANTHROPIC_PROVIDER} provider.`,
    );
  return entry?.cost;
}

/**
 * The provider refused the account rather than the request: spend limit or tier cap reached, credits spent, key
 * rejected, or no key at all (Aegis locked). Every later call fails the same way, so the round stops without a record.
 */
class Refused extends Error {}

type UpstreamError = { status: number; message: string; raw: string };

/** The gateway reports an upstream error under its own 429 or 502, as `<upstream status> <upstream body>`. */
function upstream(reply: GatewayReply): UpstreamError {
  const raw: string = reply.body?.error?.message ?? "";
  const status = Number(raw.match(/^(\d{3}) /)?.[1]) || reply.status;
  let message = raw;
  try {
    message = JSON.parse(raw.slice(4).split("\n")[0]).error.message;
  } catch {}
  return { status, message, raw };
}

const refused = ({ status, raw }: UpstreamError) =>
  [401, 402, 403].includes(status) || /usage limits|credit balance|enforced_spend_limit/i.test(raw);

/** One chat completion through the gateway, retried on overload, with its estimated cost. */
async function ask(gw: Gateway, body: Request, cost: Pricing) {
  let reply: GatewayReply | undefined;
  const started = Date.now();
  for (let attempt = 1; attempt <= 3; attempt++) {
    reply = await gw.send("/v1/chat/completions", body);
    if (reply.status === 200) break;
    const error = upstream(reply);
    if (refused(error))
      throw new Refused(`${routed(body.model)} refused the account (${error.status}): ${error.message}`);
    if (![429, 500, 502, 503, 529, 599].includes(error.status)) break;
    await sleep(20_000 * attempt);
  }
  const message = reply?.body?.choices?.[0]?.message;
  const usage = reply?.body?.usage ?? null;
  const cached = usage?.prompt_tokens_details?.cached_tokens ?? 0;
  // Some models bill the whole call at higher rates past an input threshold (`longContext`).
  const rates = cost?.longContext && usage?.prompt_tokens > cost.longContext.inputThreshold ? cost.longContext : cost;
  const costUsd =
    usage && rates
      ? ((usage.prompt_tokens - cached) * rates.input +
          cached * rates.cacheRead +
          usage.completion_tokens * rates.output) /
        1e6
      : null;
  const text: string = message?.content ?? "";
  return { reply, started, wallMs: Date.now() - started, message, text, usage, costUsd };
}

// ---------------------------------------------------------------------------------------------------------------
// Replies → modules

/** The longest fenced code block, or null. */
function extractCode(text: string) {
  const blocks = [...text.matchAll(/```(?:ts|typescript|tsx|js|javascript)?[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);
  return blocks.sort((a, b) => b.length - a.length)[0] ?? null;
}

/** Points the SDK import name (and any subpath) at this repo's src/index.ts, and a kit subpath at kits/<name>. */
function wireImports(code: string, buildFile: string) {
  const to = (path: string) => relative(dirname(buildFile), join(ROOT, path)).split("\\").join("/");
  return code
    .replace(/(["'])agentic-3js-builder\/kits\/([a-z]+)(?:\.ts)?\1/g, (_, _q, name) => `"${to(`kits/${name}`)}"`)
    .replace(/(["'])agentic-3js-builder(?:\/[^"']*)?\1/g, `"${to("src/index")}"`);
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

/** Runs `work` over `items`, `size` at a time. After the first error no item starts; the running ones finish. */
async function pool<T>(items: T[], size: number, work: (item: T) => Promise<void>) {
  const queue = [...items];
  const errors: unknown[] = [];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      for (let item = queue.shift(); item !== undefined && !errors.length; item = queue.shift())
        await work(item).catch((error) => errors.push(error));
    }),
  );
  if (errors.length) throw errors[0];
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
    // A parallel-parts arm keeps its plan, part and fit prompts next to the system prompt they extend.
    for (const file of arm.parallel ? [arm.parallel.plan, arm.parallel.part, arm.parallel.fit] : [])
      if (file) writeFileSync(join(dir, "prompts", file), read(`bakeoff/prompts/${file}`));
  }
  console.log(`${todo.length} builds to ask ${model} (${effort}) for, ${concurrency} at a time.`);

  const gw = gateway();
  let done = 0;
  await pool(todo, concurrency, async (job) => {
    if (existsSync(join(dir, "runs", `${job.slug}.json`))) return; // another runner got it first
    const system = readFileSync(join(dir, "prompts", `${job.arm.id}.md`), "utf8");
    const pitch = job.subject[job.level];
    if (job.arm.parallel) {
      const line = await parallelBuild({ gw, cost, dir, job, system, pitch, model, effort, maxTokens });
      console.log(`[${++done}/${todo.length}] ${job.slug}: ${line}`);
      return;
    }
    const messages: { role: string; content: string }[] = [
      { role: "system", content: system },
      { role: "user", content: pitch },
    ];
    // A planning arm asks for the build sheet first (medium effort), then for the module in the same conversation.
    let plan: { text: string; usage: unknown; costUsd: number | null; wallMs: number } | null = null;
    if (job.arm.plan) {
      messages[1].content = `${pitch}\n\n${read(`bakeoff/prompts/${job.arm.plan}`).trim()}`;
      const planned = await ask(gw, { model, reasoning_effort: "medium", max_tokens: 32000, messages }, cost);
      plan = { text: planned.text, usage: planned.usage, costUsd: planned.costUsd, wallMs: planned.wallMs };
      messages.push(
        { role: "assistant", content: planned.text },
        { role: "user", content: "Now write the module that builds this sheet, as one ```ts block." },
      );
    }
    const body = { model, reasoning_effort: effort, max_tokens: maxTokens, messages };
    const built = await ask(gw, body, cost);
    const { reply, started, message, text, usage } = built;
    const wallMs = built.wallMs + (plan?.wallMs ?? 0);
    const costUsd = built.costUsd == null ? null : built.costUsd + (plan?.costUsd ?? 0);
    const code = text ? extractCode(text) : null;
    const buildFile = join(dir, "builds", `${job.slug}.ts`);
    if (code) {
      mkdirSync(dirname(buildFile), { recursive: true });
      writeFileSync(buildFile, wireImports(code, buildFile));
    }
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
      plan,
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

// ---------------------------------------------------------------------------------------------------------------
// Parallel parts: one build's work split across concurrent calls. A planning call writes the shared spec (size,
// palette, mounts, skeleton, 3–6 parts); one call per part, all at once, writes a function that builds its part into
// the shared builder; `assemble` wraps the functions into one module. Every call gets the arm's system prompt; the
// plan and part prompts follow the pitch in the user turn.

type Vec = [number, number, number];
type SpecPart = {
  id: string;
  builds: string;
  box: [Vec, Vec];
  attaches: string;
  joints: string[];
  floor: boolean;
  budget: number;
};
type Spec = {
  name: string;
  description: string;
  builderName?: string;
  size: Vec;
  layout: string;
  palette: Record<string, string>;
  mounts: Record<string, Vec>;
  joints: { name: string; parent?: string; at: Vec; dir?: Vec; role?: string; group?: string }[];
  parts: SpecPart[];
};

/** The reply's ```json block (else its longest fenced block, else the outermost braces) as a spec. Part ids become
 *  unique alphanumeric names, since they prefix the part's joints and name its function. */
function parseSpec(text: string): Spec {
  const block =
    text.match(/```json[^\n]*\n([\s\S]*?)```/)?.[1] ??
    extractCode(text) ??
    text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const spec = JSON.parse(block.replace(/,(\s*[}\]])/g, "$1")) as Spec;
  if (!Array.isArray(spec.parts) || !spec.parts.length) throw new Error("spec has no parts");
  const seen = new Set<string>();
  for (const [i, part] of spec.parts.entries()) {
    let id = String(part.id ?? "").replace(/[^A-Za-z0-9]/g, "") || `part${i + 1}`;
    if (!/^[A-Za-z]/.test(id)) id = `p${id}`;
    while (seen.has(id)) id += i + 1;
    seen.add(id);
    part.id = id;
  }
  spec.palette ??= {};
  spec.mounts ??= {};
  spec.joints ??= [];
  return spec;
}

/** The part prompt with this part's spec entry filled in. */
function partPrompt(template: string, spec: Spec, part: SpecPart) {
  const values: Record<string, string> = {
    spec: JSON.stringify(spec, null, 2),
    id: part.id,
    fn: `build${part.id[0].toUpperCase()}${part.id.slice(1)}`,
    builds: part.builds ?? "",
    box: JSON.stringify(part.box),
    attaches: part.attaches ?? "",
    joints: part.joints?.length ? part.joints.map((name) => `\`${name}\``).join(", ") : "none",
    floor: part.floor
      ? "Its lowest points rest on the floor, y = 0."
      : "It sits above the floor, inside its box; the parts marked `floor` rest on y = 0.",
    budget: String(part.budget ?? Math.floor(900 / spec.parts.length)),
    triangles: String(Math.floor(60_000 / spec.parts.length / 500) * 500),
  };
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
}

type Import = { from: string; item: string; typeOnly: boolean };

/** Strips every code's import statements and merges them by local name, after the `base` imports. Codes can import
 *  one name from different sources (a kit name from the SDK root in one, from its kit in another): one module keeps
 *  one, the kit's when there is one. Returns the import lines (`three` first) and each code without its imports. */
function mergeImports(codes: string[], base: Import[] = []) {
  const imports = new Map<string, Import>(base.map((i) => [i.item.split(" as ").at(-1)!.trim(), { ...i }]));
  const addImport = (from: string, item: string, typeOnly: boolean) => {
    const local = item.split(" as ").at(-1)!.trim();
    const had = imports.get(local);
    if (!had || (had.from === SDK_NAME && from.includes("/kits/")))
      imports.set(local, { from, item, typeOnly: typeOnly && (had?.from !== from || had.typeOnly) });
    else if (had.from === from && had.item === item) had.typeOnly &&= typeOnly;
  };
  const bodies = codes.map((code) =>
    code.replace(/^import\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["'];?[ \t]*\n?/gm, (_, type, what, from) => {
      if (/^\*\s+as\s+THREE$/.test(what.trim())) return "";
      const named = what.match(/\{([\s\S]*)\}/)?.[1] ?? "";
      for (const item of named.split(",").map((s: string) => s.trim().replace(/\s+/g, " "))) {
        if (!item) continue;
        const typeOnly = Boolean(type) || item.startsWith("type ");
        addImport(
          from.startsWith(SDK_NAME) && !from.includes("/kits/") ? SDK_NAME : from,
          item.replace(/^type /, ""),
          typeOnly,
        );
      }
      const rest = what
        .replace(/\{[\s\S]*\}/, "")
        .replace(/,\s*$/, "")
        .trim();
      if (rest) addImport(from, `default as ${rest}`, false);
      return "";
    }),
  );
  const importLines = [`import * as THREE from "three";`];
  const bySource = new Map<string, string[]>();
  for (const { from, item, typeOnly } of imports.values())
    bySource.set(from, [...(bySource.get(from) ?? []), typeOnly ? `type ${item}` : item]);
  for (const [from, items] of bySource) importLines.push(`import { ${items.join(", ")} } from "${from}";`);
  return { importLines, bodies };
}

/** One module from the spec and the part functions: imports merged per source, the spec's palette, mounts and
 *  skeleton, and each part's code in its own scope (so helpers of the same name never collide), called in spec
 *  order. Returns the module with its SDK imports still named `agentic-3js-builder`, and the parts that had no
 *  function. */
function assemble(spec: Spec, parts: { part: SpecPart; code: string | null }[]) {
  const missing: string[] = [];
  const named = parts.flatMap(({ part, code }) => {
    const fn = code?.match(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|export\s+const\s+([A-Za-z_$][\w$]*)/);
    const name = fn?.[1] ?? fn?.[2] ?? code?.match(/function\s+([A-Za-z_$][\w$]*)/)?.[1];
    if (!code || !name) {
      missing.push(part.id);
      return [];
    }
    return [{ part, code, name }];
  });
  const { importLines, bodies } = mergeImports(
    named.map((n) => n.code),
    [
      { from: SDK_NAME, item: "createBuilder", typeOnly: false },
      { from: SDK_NAME, item: "Builder", typeOnly: true },
      { from: SDK_NAME, item: "Joint", typeOnly: true },
    ],
  );
  const scopes = named.map(({ part, name }, i) => {
    const body = bodies[i].replace(/^export\s+(?=(?:async\s+)?function|const|let|class)/gm, "").trim();
    return `  // ${part.id}\n  (() => {\n${body}\n    return ${name};\n  })(),`;
  });
  const key = (name: string) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name));
  const vec = (v: unknown) => `[${(Array.isArray(v) ? v : [0, 0, 0]).join(", ")}] as [number, number, number]`;
  const joints = spec.joints.map((joint) => {
    const options = [
      joint.parent ? `parent: J[${JSON.stringify(joint.parent)}]` : null,
      `at: ${JSON.stringify(joint.at)}`,
      joint.dir ? `dir: ${JSON.stringify(joint.dir)}` : null,
      joint.role ? `role: ${JSON.stringify(joint.role)}` : null,
      joint.group ? `group: ${JSON.stringify(joint.group)}` : null,
    ].filter(Boolean);
    return `  J[${JSON.stringify(joint.name)}] = b.joint(${JSON.stringify(joint.name)}, { ${options.join(", ")} });`;
  });
  const module = [
    ...importLines,
    "",
    `export const meta = ${JSON.stringify({ name: spec.name, description: spec.description }, null, 2)};`,
    "",
    "// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.",
    `const P = {\n${Object.entries(spec.palette)
      .map(([name, color]) => `  ${key(name)}: ${JSON.stringify(color)},`)
      .join("\n")}\n};`,
    `const M = {\n${Object.entries(spec.mounts)
      .map(([name, at]) => `  ${key(name)}: ${vec(at)},`)
      .join("\n")}\n};`,
    "type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };",
    "",
    "// One function per part, each written by its own call.",
    `const PARTS: ((ctx: Ctx) => void)[] = [\n${scopes.join("\n")}\n];`,
    "",
    "export default function build() {",
    `  const b = createBuilder({ name: ${JSON.stringify(spec.builderName || "model")} });`,
    "  const J: Record<string, Joint> = {};",
    ...joints,
    "  for (const part of PARTS) part({ b, J, P, M });",
    "  return b.root;",
    "}",
    "",
  ].join("\n");
  return { module, missing };
}

type Asked = Awaited<ReturnType<typeof ask>>;

/** One parallel-parts build: plan, then every part at once, then the module and a run record shaped like `run`'s.
 *  `wallMs` is the plan's time plus the slowest part's (plus the box check and its repairs with `fit`); tokens and
 *  cost are summed over the calls and listed per call. */
async function parallelBuild(o: {
  gw: Gateway;
  cost: Pricing;
  dir: string;
  job: Job;
  system: string;
  pitch: string;
  model: string;
  effort: string;
  maxTokens: number;
}) {
  const { gw, cost, dir, job, system, pitch, model, effort, maxTokens } = o;
  const files = job.arm.parallel!;
  const prompt = (file: string) => readFileSync(join(dir, "prompts", file), "utf8").trim();
  const body = (user: string) => ({
    model,
    reasoning_effort: effort,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const call = (id: string, asked: Asked, hasCode: boolean) => ({
    id,
    started: new Date(asked.started).toISOString(),
    wallMs: asked.wallMs,
    status: asked.reply?.status ?? null,
    error: asked.reply?.status === 200 ? null : JSON.stringify(asked.reply?.body).slice(0, 2000),
    finishReason: asked.reply?.body?.choices?.[0]?.finish_reason ?? null,
    usage: asked.usage,
    costUsd: asked.costUsd,
    hasCode,
    text: asked.text,
    reasoning: asked.message?.reasoning_content ?? null,
  });
  const planned = await ask(gw, body(`${pitch}\n\n${prompt(files.plan)}`), cost);
  let spec: Spec | null = null;
  let specError: string | null = null;
  try {
    spec = parseSpec(planned.text);
  } catch (error) {
    specError = String(error);
  }
  const calls = [call("plan", planned, Boolean(spec))];
  const parts = spec
    ? await Promise.all(
        spec.parts.map(async (part) => {
          const partUser = `${pitch}\n\n${partPrompt(prompt(files.part), spec!, part)}`;
          const asked = await ask(gw, body(partUser), cost);
          const code = asked.text ? extractCode(asked.text) : null;
          calls.push(call(part.id, asked, Boolean(code)));
          return { part, code, wallMs: asked.wallMs, partUser };
        }),
      )
    : [];
  const elapsedMs = Date.now() - planned.started;
  const slowest = parts.reduce<(typeof parts)[number] | null>((a, p) => (!a || p.wallMs > a.wallMs ? p : a), null);
  const assembled = spec ? assemble(spec, parts) : null;
  const buildFile = join(dir, "builds", `${job.slug}.ts`);
  if (assembled) {
    mkdirSync(dirname(buildFile), { recursive: true });
    writeFileSync(buildFile, wireImports(assembled.module, buildFile));
  }
  // The box check (`fit`): measure every part against its box and the floor without a model; each part reaching more
  // than 15 cm out gets one low-effort edit call, in its own part conversation, all at once; then the module is
  // reassembled and measured again. A repaired part that throws where its original didn't goes back to the original.
  let fit: Record<string, unknown> | null = null;
  let fitMs = 0;
  if (files.fit && spec && assembled) {
    const fitStarted = Date.now();
    const ids = parts.filter((p) => !assembled.missing.includes(p.part.id)).map((p) => p.part.id);
    const brief = (fits: PartFit[]) => fits.map(({ worst, ...rest }) => ({ ...rest, worst: worst.slice(0, 5) }));
    const before = await probe(buildFile, ids, "before");
    const measured = before.error ? [] : measure(spec.parts, before);
    const template = prompt(files.fit);
    const repairs = await Promise.all(
      measured
        .filter((m) => m.misfit)
        .map(async (m) => {
          const p = parts.find((q) => q.part.id === m.id)!;
          const feedback = template.replace(/\{(\w+)\}/g, (whole, key: string) =>
            key === "box"
              ? JSON.stringify(p.part.box)
              : key === "size"
                ? spec!.size.join(" × ")
                : key === "measured"
                  ? measuredText(m)
                  : whole,
          );
          const asked = await ask(
            gw,
            {
              model,
              // Moving pieces to measured numbers is a small edit: low effort, as for crash repairs.
              reasoning_effort: "low",
              max_tokens: maxTokens,
              messages: [
                { role: "system", content: system },
                { role: "user", content: p.partUser },
                { role: "assistant", content: `\`\`\`ts\n${p.code}\n\`\`\`` },
                { role: "user", content: feedback },
              ],
            },
            cost,
          );
          const edited = applyEdits(p.code!, asked.text);
          const code = edited.blocks ? edited.code : (extractCode(asked.text) ?? p.code!);
          calls.push(call(`fit-${m.id}`, asked, code !== p.code));
          return {
            id: m.id,
            code,
            wallMs: asked.wallMs,
            edits: edited.blocks,
            failedEdits: edited.failed.length,
            changed: code !== p.code,
          };
        }),
    );
    const write = (keep: Set<string>) => {
      const repaired = new Map(repairs.filter((r) => keep.has(r.id)).map((r) => [r.id, r.code]));
      const module = assemble(
        spec!,
        parts.map((p) => ({ part: p.part, code: repaired.get(p.part.id) ?? p.code })),
      ).module;
      writeFileSync(buildFile, wireImports(module, buildFile));
    };
    const kept = new Set(repairs.filter((r) => r.changed).map((r) => r.id));
    let after: Probe | null = null;
    const reverted: string[] = [];
    if (kept.size) {
      write(kept);
      after = await probe(buildFile, ids, "after");
      for (const id of kept)
        if ((after.error || after.threw[id]) && !before.threw[id]) {
          kept.delete(id);
          reverted.push(id);
        }
      if (reverted.length) write(kept);
    }
    fitMs = Date.now() - fitStarted;
    fit = {
      fitMs,
      checkMs: before.ms,
      afterMs: after?.ms ?? null,
      repairMs: repairs.length ? Math.max(...repairs.map((r) => r.wallMs)) : 0,
      error: before.error,
      threw: before.threw,
      before: brief(measured),
      after: after && !after.error ? brief(measure(spec.parts, after)) : null,
      afterError: after?.error ?? null,
      afterThrew: after?.threw ?? null,
      repairs: repairs.map(({ code: _code, ...rest }) => rest),
      reverted,
    };
  }
  calls.sort((a, b) => (a.id === "plan" ? -1 : b.id === "plan" ? 1 : 0));
  const sum = (get: (c: (typeof calls)[number]) => number | undefined) =>
    calls.reduce((total, c) => total + (get(c) ?? 0), 0);
  const usage = {
    prompt_tokens: sum((c) => c.usage?.prompt_tokens),
    completion_tokens: sum((c) => c.usage?.completion_tokens),
    total_tokens: sum((c) => c.usage?.total_tokens),
    prompt_tokens_details: { cached_tokens: sum((c) => c.usage?.prompt_tokens_details?.cached_tokens) },
  };
  const costUsd = calls.every((c) => c.costUsd != null) ? sum((c) => c.costUsd!) : null;
  const wallMs = planned.wallMs + (slowest?.wallMs ?? 0) + fitMs;
  const failed = calls.find((c) => c.status !== 200);
  writeJson(join(dir, "runs", `${job.slug}.json`), {
    slug: job.slug,
    arm: job.arm.id,
    subject: job.subject.id,
    level: job.level,
    pitch,
    model,
    effort,
    started: new Date(planned.started).toISOString(),
    wallMs,
    status: failed ? failed.status : 200,
    error: failed ? `${failed.id}: ${failed.error}` : specError,
    finishReason: calls.every((c) => c.finishReason === "stop") ? "stop" : calls.map((c) => c.finishReason).join(","),
    usage,
    costUsd,
    hasCode: Boolean(assembled),
    reasoning: null,
    parallel: {
      planMs: planned.wallMs,
      slowestPartMs: slowest?.wallMs ?? null,
      critical: slowest?.part.id ?? null,
      elapsedMs,
      spec,
      specError,
      missingParts: assembled?.missing ?? [],
      calls: calls.map(({ text: _text, ...rest }) => rest),
      ...(fit ? { fit } : {}),
    },
  });
  writeFileSync(
    join(dir, "runs", `${job.slug}.md`),
    calls.map((c) => `<!-- call: ${c.id} -->\n\n${c.text}`).join("\n\n"),
  );
  const partTimes = calls
    .filter((c) => c.id !== "plan")
    .map((c) => `${c.id} ${(c.wallMs / 1000).toFixed(0)}`)
    .join(", ");
  const repaired = (fit?.repairs as { id: string }[] | undefined)?.map((r) => r.id).join(",");
  return (
    `${failed ? failed.status : 200} ${assembled ? "code" : `NO CODE (${specError})`}` +
    `${assembled?.missing.length ? ` MISSING ${assembled.missing.join(",")}` : ""}, plan ${(planned.wallMs / 1000).toFixed(0)} s + parts [${partTimes}]` +
    `${fit ? ` + fit ${(fitMs / 1000).toFixed(0)} s [${repaired || "no repairs"}]` : ""} → ${(wallMs / 1000).toFixed(0)} s, ` +
    `${usage.completion_tokens} out${costUsd != null ? `, $${costUsd.toFixed(3)}` : ""}`
  );
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
  const skipTypes = args.includes("--skip-typecheck");
  const concurrency = Number(option(args, "concurrency", "2"));
  const checkPath = (slug: string) => join(dir, "checks", `${slug}.json`);
  const typecheck = async (file: string) => {
    const types = await capture(tsx, ["scripts/typecheck.ts", file], 180_000);
    // Unused names (TS6133) are style, not API mistakes.
    return [...`${types.stdout}\n${types.stderr}`.matchAll(/^.*error TS(?!6133)\d+:.*$/gm)].map((m) => m[0]);
  };
  const typeFields = (errors: string[] | null) => ({
    typeErrors: errors ? errors.length : null,
    typecheckSkipped: !errors,
    typeErrorSample: (errors ?? []).slice(0, 20).map((line) => line.replace(`${ROOT}/`, "")),
  });
  const slugs = readdirSync(join(dir, "builds"))
    .filter((name) => name.endsWith(".ts"))
    .map((name) => name.slice(0, -3));
  // Builds rendered by a `--skip-typecheck` check get their type errors filled in, without a new render.
  const untyped = skipTypes
    ? []
    : slugs.filter((slug) => existsSync(checkPath(slug)) && readJson<CheckRecord>(checkPath(slug)).typecheckSkipped);
  if (untyped.length) console.log(`${untyped.length} checked builds to typecheck.`);
  await pool(untyped, concurrency, async (slug) => {
    const errors = await typecheck(join(dir, "builds", `${slug}.ts`));
    writeJson(checkPath(slug), { ...readJson<CheckRecord>(checkPath(slug)), ...typeFields(errors) });
    console.log(`${slug}: ${errors.length} type errors`);
  });
  const builds = slugs.filter((slug) => !existsSync(checkPath(slug)));
  console.log(`${builds.length} builds to check.`);
  let done = 0;
  await pool(builds, concurrency, async (slug) => {
    const file = join(dir, "builds", `${slug}.ts`);
    const typeErrors = skipTypes ? null : await typecheck(file);
    let render = await capture(tsx, ["scripts/snap.ts", file, "v01"]);
    // A dropped connection to the shared browser is not the build's fault: try once more.
    if (/do not launch your own browser/.test(render.stdout + render.stderr)) {
      await sleep(5000);
      render = await capture(tsx, ["scripts/snap.ts", file, "v01"]);
    }
    const found = findReport(slug);
    const output = `${render.stdout}\n${render.stderr}`;
    const report = found ? readJson<any>(found.path) : null;
    // Still no browser: leave the build unchecked so the next `check` renders it, instead of recording a failure.
    if (!report && /do not launch your own browser/.test(output)) {
      console.log(`${slug}: shared browser unreachable, left unchecked`);
      return;
    }
    writeJson(checkPath(slug), {
      slug,
      ...typeFields(typeErrors),
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
      `[${done}/${builds.length}] ${slug}: ${typeErrors ? `${typeErrors.length} type errors` : "typecheck skipped"}, ${report ? `rendered (${report.triangles} tris)` : "RENDER FAILED"}`,
    );
  });
  results(round);
}

// ---------------------------------------------------------------------------------------------------------------
// Refine: one more turn per build of an earlier round, as an app would run it. The conversation is the arm's system
// prompt, the pitch, the current module as the model's own reply, and the app's feedback: the error if the module
// failed, otherwise its renders and measurements. The reply's SEARCH/REPLACE edits (or a whole module) make the build.

type SnapReport = {
  parts: number;
  triangles: number;
  textures: number;
  size: number[];
  issues: { level: string; message: string }[];
  loose?: { clusters: { label: string; gap: number; nearest?: { name: string } }[] };
};
type CheckRecord = {
  rendered: boolean;
  lane: string | null;
  renderError: string | null;
  typeErrors: number | null;
  typecheckSkipped: boolean;
  typeErrorSample: string[];
};
type RunRecord = {
  arm: string;
  subject: string;
  level: Level;
  pitch: string;
  costUsd: number | null;
  chainCostUsd?: number;
};

/** Applies SEARCH/REPLACE blocks in order; a block whose SEARCH is missing or not unique is skipped. */
function applyEdits(code: string, text: string) {
  const blocks = [...text.matchAll(/<{7} SEARCH\n([\s\S]*?)\n?={7}\n([\s\S]*?)\n?>{7} REPLACE/g)];
  const failed: string[] = [];
  for (const [, search, replace] of blocks) {
    const at = code.indexOf(search);
    if (!search || at < 0 || code.indexOf(search, at + 1) >= 0) {
      failed.push(search.split("\n")[0].trim());
      continue;
    }
    code = code.slice(0, at) + replace + code.slice(at + search.length);
  }
  return { code, blocks: blocks.length, failed };
}

function reportText(report: SnapReport) {
  const lines = [
    `Parts ${report.parts}, triangles ${report.triangles}, textures ${report.textures}, size ${report.size.map((v) => v.toFixed(2)).join(" × ")} m (x, y, z).`,
    report.issues.length
      ? `Issues:\n${report.issues.map((issue) => `- ${issue.level}: ${issue.message}`).join("\n")}`
      : "Issues: none.",
  ];
  const loose = report.loose?.clusters ?? [];
  if (loose.length)
    lines.push(
      `Loose parts, touching nothing near the main body (information: change them only where the render shows a fault):\n${loose
        .slice(0, 6)
        .map((c) => `- ${c.label}, ${Math.round(c.gap * 1000)} mm from ${c.nearest?.name ?? "the body"}`)
        .join("\n")}`,
    );
  return lines.join("\n\n");
}

async function refine(round: string, args: string[]) {
  // `--from a,b`: each build continues from the first listed round that has it, so a repair round can lead its source.
  const froms = list(option(args, "from", ""));
  if (!/^[A-Za-z0-9]+$/.test(round) || !froms.length) throw new Error("Usage: refine <round> --from <round>[,<round>]");
  const dir = join(BAKEOFF, "rounds", round);
  const model = option(args, "model", "anthropic/claude-sonnet-5-5");
  const effort = option(args, "effort", "high");
  const maxTokens = Number(option(args, "max-tokens", "64000"));
  const views = list(option(args, "views", "three-quarter,front,side,low"));
  const critique = option(args, "critique", "refine-critique.md");
  const criticModel = option(args, "critic", "");
  const only = list(option(args, "arms", ""));
  // `--types`: a build with type errors counts as failed even when it rendered; the repair turn gets the errors.
  const types = args.includes("--types");
  const failed = (checked: CheckRecord) => !checked.rendered || (types && (checked.typeErrors ?? 0) > 0);
  const sources = new Map<string, { from: string; src: string; slug: string }>();
  for (const from of froms) {
    const src = join(BAKEOFF, "rounds", from);
    for (const name of readdirSync(join(src, "checks"))) {
      const slug = name.slice(0, -5);
      const suffix = slug.slice(from.length);
      if (!name.endsWith(".json") || sources.has(suffix)) continue;
      if (existsSync(join(src, "runs", `${slug}.json`)) && existsSync(join(src, "builds", `${slug}.ts`)))
        sources.set(suffix, { from, src, slug });
    }
  }
  const todo = [...sources.entries()]
    .map(([suffix, source]) => ({ ...source, slugOut: `${round}${suffix}` }))
    .filter(
      ({ src, slug }) => !only.length || only.includes(readJson<RunRecord>(join(src, "runs", `${slug}.json`)).arm),
    )
    .filter(
      ({ src, slug }) =>
        !args.includes("--repair-only") || failed(readJson<CheckRecord>(join(src, "checks", `${slug}.json`))),
    )
    .filter(({ slugOut }) => !existsSync(join(dir, "runs", `${slugOut}.json`)));
  if (types) {
    const untyped = todo.filter(
      ({ src, slug }) => readJson<CheckRecord>(join(src, "checks", `${slug}.json`)).typecheckSkipped,
    );
    if (untyped.length)
      console.log(
        `${untyped.length} source builds were never typechecked (run \`check\` on their round): ${untyped.map((t) => t.slug).join(", ")}`,
      );
  }
  const cost = await pricing(model);
  const criticCost = criticModel ? await pricing(criticModel) : undefined;
  const sourceManifest = readJson<Record<string, unknown>>(join(BAKEOFF, "rounds", froms.at(-1)!, "round.json"));
  writeJson(join(dir, "round.json"), {
    ...sourceManifest,
    id: round,
    started: existsSync(join(dir, "round.json"))
      ? (readJson<{ started?: string }>(join(dir, "round.json")).started ?? new Date().toISOString())
      : new Date().toISOString(),
    refineFrom: froms.join(","),
    model,
    effort,
    maxTokens,
    views,
    critique,
    critic: criticModel || null,
    systemPromptOverride: option(args, "system-prompt", "") || null,
    sdkCommit: (await capture("git", ["rev-parse", "--short", "HEAD"])).stdout.trim(),
  });
  const edits = read("bakeoff/prompts/refine-edits.md").trim();
  console.log(`${todo.length} builds to refine from ${froms.join(", ")} with ${model} (${effort}).`);
  const gw = gateway();
  let done = 0;
  await pool(todo, Number(option(args, "concurrency", "8")), async ({ src, slug, slugOut }) => {
    const previous = readJson<RunRecord>(join(src, "runs", `${slug}.json`));
    const checked = readJson<CheckRecord>(join(src, "checks", `${slug}.json`));
    const override = option(args, "system-prompt", "");
    const system = readFileSync(
      override ? resolve(ROOT, override) : join(src, "prompts", `${previous.arm}.md`),
      "utf8",
    );
    mkdirSync(join(dir, "prompts"), { recursive: true });
    writeFileSync(join(dir, "prompts", `${previous.arm}.md`), system);
    const current = readFileSync(join(src, "builds", `${slug}.ts`), "utf8")
      .replace(/(["'])(?:\.\.\/)+kits\/([a-z]+)\1/g, `"${SDK_NAME}/kits/$2"`)
      .replace(/(["'])(?:\.\.\/)+src\/index\1/g, `"${SDK_NAME}"`);
    const snaps = checked.lane && join(SNAPS, slug, checked.lane, "snaps");
    const mode = failed(checked) || !snaps ? "repair" : "critique";
    const typeErrors = types ? (checked.typeErrors ?? 0) : 0;
    // Props have no head close-up: send the views this build's snap wrote.
    const shown = snaps ? views.filter((view) => existsSync(join(snaps, `v01-${view}.png`))) : [];
    const images = shown.flatMap((view) => [
      { type: "text", text: `Render: ${view}` },
      {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${readFileSync(join(snaps!, `v01-${view}.png`)).toString("base64")}` },
      },
    ]);
    const report = mode === "critique" ? reportText(readJson<SnapReport>(join(snaps!, "v01-report.json"))) : "";
    // `--critic <model>`: another model looks at the renders and writes the change list; the builder makes it.
    let critic: { model: string; text: string; usage: unknown; costUsd: number | null; wallMs: number } | null = null;
    if (criticModel && mode === "critique") {
      const prompt = read("bakeoff/prompts/refine-critic.md")
        .replace("{brief}", previous.pitch)
        .replace("{views}", shown.join(", "))
        .replace("{report}", report)
        .replace("{code}", current.trimEnd());
      const asked = await ask(
        gw,
        {
          model: criticModel,
          reasoning_effort: effort,
          max_tokens: 32000,
          messages: [{ role: "user", content: [...images, { type: "text", text: prompt }] }],
        },
        criticCost,
      );
      critic = {
        model: criticModel,
        text: asked.text,
        usage: asked.usage,
        costUsd: asked.costUsd,
        wallMs: asked.wallMs,
      };
    }
    const feedback =
      mode === "critique"
        ? [
            ...images,
            {
              type: "text",
              text: `${(critic
                ? read("bakeoff/prompts/refine-apply.md").replace("{critique}", critic.text.trim())
                : read(`bakeoff/prompts/${critique}`)
              )
                .replace("{views}", shown.join(", "))
                .replace("{report}", report)
                .trim()}\n\n${edits}`,
            },
          ]
        : typeErrors
          ? `${read("bakeoff/prompts/refine-types.md")
              .replace(
                "{types}",
                [
                  ...checked.typeErrorSample.map((line) => line.replace(/^[^(]*\(/, "module.ts(")),
                  ...(typeErrors > checked.typeErrorSample.length
                    ? [`… ${typeErrors - checked.typeErrorSample.length} more`]
                    : []),
                ].join("\n"),
              )
              .replace(
                "{render}",
                checked.rendered
                  ? "It still renders; make the reported lines match the SDK."
                  : `Running it, the app stopped with this error:\n\n\`\`\`\n${(checked.renderError ?? "no render").replace(`${ROOT}/`, "")}\n\`\`\``,
              )
              .trim()}\n\n${edits}`
          : `${read("bakeoff/prompts/refine-repair.md")
              .replace("{error}", (checked.renderError ?? "no render").replace(`${ROOT}/`, ""))
              .trim()}\n\n${edits}`;
    const body = {
      model,
      reasoning_effort: effort,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: previous.pitch },
        { role: "assistant", content: `\`\`\`ts\n${current.trimEnd()}\n\`\`\`` },
        { role: "user", content: feedback },
      ],
    };
    const built = await ask(gw, body, cost);
    const { reply, started, message, text, usage } = built;
    const wallMs = built.wallMs + (critic?.wallMs ?? 0);
    const costUsd = built.costUsd == null ? null : built.costUsd + (critic?.costUsd ?? 0);
    const edited = applyEdits(current, text);
    const whole = edited.blocks ? null : extractCode(text);
    const code = whole ?? edited.code;
    const buildFile = join(dir, "builds", `${slugOut}.ts`);
    mkdirSync(dirname(buildFile), { recursive: true });
    writeFileSync(buildFile, wireImports(code, buildFile));
    writeJson(join(dir, "runs", `${slugOut}.json`), {
      slug: slugOut,
      from: slug,
      mode,
      ...(typeErrors ? { typeErrorsSent: typeErrors } : {}),
      arm: previous.arm,
      subject: previous.subject,
      level: previous.level,
      pitch: previous.pitch,
      model,
      effort,
      started: new Date(started).toISOString(),
      wallMs,
      status: reply?.status ?? null,
      error: reply?.status === 200 ? null : JSON.stringify(reply?.body).slice(0, 2000),
      finishReason: reply?.body?.choices?.[0]?.finish_reason ?? null,
      usage,
      costUsd,
      chainCostUsd: (previous.chainCostUsd ?? previous.costUsd ?? 0) + (costUsd ?? 0),
      hasCode: true,
      edits: { blocks: edited.blocks, failed: edited.failed, wholeModule: Boolean(whole) },
      reasoning: message?.reasoning_content ?? null,
      critic,
    });
    writeFileSync(join(dir, "runs", `${slugOut}.md`), text);
    done++;
    console.log(
      `[${done}/${todo.length}] ${slugOut} (${mode}): ${reply?.status}, ${whole ? "whole module" : `${edited.blocks - edited.failed.length}/${edited.blocks} edits`}, ` +
        `${usage ? `${usage.prompt_tokens} in / ${usage.completion_tokens} out` : "no usage"}, ${(wallMs / 1000).toFixed(0)} s` +
        `${costUsd != null ? `, $${costUsd.toFixed(3)}` : ""}`,
    );
  });
  gw.close();
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

export {
  gateway,
  ask,
  wireImports,
  results,
  capture,
  systemPrompt,
  pricing,
  pool,
  check,
  applyEdits,
  extractCode,
  reportText,
  mergeImports,
};
export type { Asked, CheckRecord, SnapReport, Gateway, Pricing };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
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
  else if (command === "refine" && target) await refine(target, rest);
  else if (command === "results" && target) results(target);
  else {
    console.error(
      "Usage: npm run bakeoff -- prompt <arm> | run <round> [options] | check <round> | refine <round> --from <round> [options] | results <round>",
    );
    process.exit(2);
  }
}
