#!/usr/bin/env bun
/** Reproduce the pre-first-write context, an app-shaped imitation, and fresh craft3 controls.
 * Run: bun bakeoff/replay.ts [--experiment2] [--prepare-only] [--batches v1a,v1b,v2a,v2b,v3a,v3b]
 * Every API batch (including crash repairs) is gated by omp's Anthropic 5-hour usage.
 * R's archived tools are NAMES ONLY: definitions are recovered from installed OMP,
 * with find/wait reconstructed below. This limitation is recorded, never called exact replay.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { gateway, wireImports, results, capture, systemPrompt } from "../scripts/bakeoff.ts";
import { AppSandbox } from "./app-sandbox.ts";
import { staticContext } from "./norig.ts";

const ROOT = resolve(import.meta.dir, "..");
const BASE = join(ROOT, "bakeoff");
const EXPERIMENT2 = process.argv.includes("--experiment2");
const APP = process.argv.includes("--app");
const SINGLE = process.argv.includes("--single");
const SINGLE_REF = process.argv.includes("--ref");
if (SINGLE_REF && (!SINGLE || process.argv.includes("--craft"))) throw Error("--ref requires --single without --craft");
const SINGLE_ARM = process.argv.includes("--craft") ? "craft" : "single";
const SINGLE_EFFORT = process.argv.includes("--effort") ? process.argv[process.argv.indexOf("--effort") + 1] : "high";
if (SINGLE && !["low", "medium", "high"].includes(SINGLE_EFFORT)) throw Error("--effort must be low, medium or high");
const SINGLE_WORKERS = process.argv.includes("--workers")
  ? Number(process.argv[process.argv.indexOf("--workers") + 1])
  : 16;
if (SINGLE && !(SINGLE_WORKERS >= 1 && SINGLE_WORKERS <= 64)) throw Error("--workers must be 1–64");
const singleOption = (flag: string) =>
  process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : undefined;
const MODEL = SINGLE ? (singleOption("--model") ?? "anthropic/claude-sonnet-5-5") : "anthropic/claude-sonnet-5-5";
const ARGON = SINGLE && MODEL === "google-antigravity/gemini-4-argon";
if (SINGLE && /(?:^|\/)cursor(?:\/|$)/i.test(MODEL)) throw Error("Cursor providers/models are forbidden for this run");
const SINGLE_PROMPT = singleOption("--prompt-file");
const SINGLE_NORIG = process.argv.includes("--no-rig");
const SINGLE_NO_THINKING = process.argv.includes("--no-thinking");
const SINGLE_THINKING_BUDGET = Number(singleOption("--thinking-budget") ?? 0);
if (
  singleOption("--thinking-budget") !== undefined &&
  (!Number.isInteger(SINGLE_THINKING_BUDGET) || SINGLE_THINKING_BUDGET < 1024 || SINGLE_THINKING_BUDGET >= 120000)
)
  throw Error("--thinking-budget must be an integer from 1024 through 119999");
if (SINGLE_THINKING_BUDGET)
  console.warn(
    "Sonnet 5.5's gateway normalizes explicit thinking budgets to adaptive thinking; the numeric budget is not enforced.",
  );
const SINGLE_ROUND =
  singleOption("--round") ??
  (ARGON
    ? "r23argon" + SINGLE_EFFORT
    : SINGLE_REF
      ? "r21ref" + SINGLE_EFFORT
      : (SINGLE_EFFORT === "high" ? "r19" : "r20" + (SINGLE_EFFORT === "medium" ? "med" : "low")) + SINGLE_ARM);
const GAP3 = /^r22(asset|norig|lean|cap|nothink)$/.test(SINGLE_ROUND);
const SINGLE_CAP = GAP3 ? 70 : SINGLE_REF ? 40 : SINGLE_EFFORT === "high" ? 60 : 90;
const APP_ROUND = process.argv.includes("--app-round")
  ? process.argv[process.argv.indexOf("--app-round") + 1]
  : "r18app";
const APP_SUBJECTS = (singleOption("--only") ?? singleOption("--subjects"))?.split(",") ?? [];
const INPUT = join(
  BASE,
  SINGLE
    ? SINGLE_ROUND + "-inputs"
    : APP
      ? APP_ROUND === "r18app"
        ? "app-inputs"
        : APP_ROUND + "-inputs"
      : EXPERIMENT2
        ? "replay2-inputs"
        : "replay-inputs",
);
const SUBJECTS = ["africanElephant", "capybara", "koala", "redPanda", "treasureHoard", "soulScythe"];
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const save = (path: string, data: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
};
const text = (path: string, value: string) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
};
const allPitches = ["pitches-r7.json", "pitches-r5.json"]
  .flatMap((p) => json(join(BASE, p)).subjects)
  .filter((s) => (APP || SINGLE ? !APP_SUBJECTS.length || APP_SUBJECTS.includes(s.id) : SUBJECTS.includes(s.id)));
const craft = json(join(BASE, "arms-r12.json")).arms.find((a) => a.id === "craft3");
const shapedSystem = systemPrompt(craft);
const caveat =
  "session_init.tools stores names only, not historical descriptions/schemas. Most definitions recovered from installed @oh-my-pi source; find/wait reconstructed from the available current tool interface. This is conversation replay with reconstructed tool definitions, NOT exact provider-request replay.";

async function definitions() {
  const lib = join(homedir(), ".bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src");
  // Installed OMP is platform-local, outside this project's dependency graph.
  const m = await import(join(lib, "tools/index.ts"));
  const { Settings } = await import(join(lib, "config/settings.ts"));
  const settings = await Settings.loadReadOnly({ cwd: ROOT });
  const session: any = {
    cwd: ROOT,
    settings,
    enableLsp: false,
    taskDepth: 1,
    enableIrc: false,
    getSessionId: () => "replay-schema",
    getSessionFile: () => undefined,
    getSessionSpawns: () => "*",
  };
  const reconstructed: any = {
    find: {
      name: "find",
      description:
        "Describe behavior, get implementing files and line ranges. query is plain language, not regex. Scope path to one directory or file.",
      parameters: {
        type: "object",
        properties: {
          i: { type: "string" },
          query: { type: "string" },
          grep_keywords: { type: "array", items: { type: "string" } },
          path: { type: "string" },
        },
        required: ["query", "grep_keywords"],
      },
    },
    wait: {
      name: "wait",
      description:
        "Wait only when blocked with nothing else to do. Blocks on background jobs/services you started; returns on the first result or message.",
      parameters: { type: "object", properties: { i: { type: "string" } } },
    },
  };
  const out: any[] = [];
  for (const n of [
    "read",
    "bash",
    "edit",
    "eval",
    "glob",
    "grep",
    "find",
    "task",
    "wait",
    "web_search",
    "write",
    "yield",
  ]) {
    if (reconstructed[n]) {
      out.push({ ...reconstructed[n], schemaSource: "reconstructed current interface" });
      continue;
    }
    const t = await (m.BUILTIN_TOOLS[n] ?? m.HIDDEN_TOOLS[n])(session);
    if (!t) throw Error("Tool factory returned no definition: " + n);
    const parameters =
      typeof t.parameters === "function"
        ? t.parameters["~standard"].jsonSchema.input({ target: "draft-07" })
        : t.parameters;
    // OMP's intent trace is added around tool definitions by its agent runtime.
    parameters.properties = { i: { type: "string", description: "Concise intent" }, ...parameters.properties };
    out.push({ name: n, description: t.description, parameters, schemaSource: join(lib, "tools") });
  }
  return out;
}

function archived(subject: string) {
  const build = json(join(ROOT, "samples", subject + "Sonnet.build.json"));
  const sessionFile = join(homedir(), build.builder.session);
  const records = readFileSync(sessionFile, "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  const init = records.find((r) => r.type === "session_init");
  const messages = records.filter((r) => r.type === "message").map((r) => r.message);
  const end = messages.findIndex(
    (m) =>
      m.role === "assistant" &&
      m.content.some(
        (c) => c.type === "toolCall" && c.name === "write" && String(c.arguments.path).endsWith(subject + "Sonnet.ts"),
      ),
  );
  if (end < 0) throw Error("No first sample write: " + subject);
  const write = messages[end].content.find(
    (c) => c.type === "toolCall" && c.name === "write" && String(c.arguments.path).endsWith(subject + "Sonnet.ts"),
  );
  return {
    sessionFile,
    init,
    messages: messages.slice(0, end),
    firstDraft: write.arguments.content,
    firstWrite: write,
  };
}

async function prepare() {
  const tools = await definitions();
  save(join(INPUT, "tools.json"), tools);
  save(join(INPUT, "pitches.json"), { subjects: allPitches });
  text(join(ROOT, "scratch/bakeoff/craft3.md"), shapedSystem);
  const manifest: any = {
    model: MODEL,
    effort: "high",
    maxTokens: 120000,
    subjects: SUBJECTS,
    caveat,
    encoding:
      "Anthropic /v1/messages: system text blocks; assistant tool_use and signed thinking blocks; user tool_result blocks with verbatim content; adjacent same-role blocks merged; tool definitions as input_schema. Canonical input JSON is retained separately. Native /v1/pi/stream rejected the provider-qualified model selector.",
    created: new Date().toISOString(),
    subjectsMetadata: {},
  };
  for (const subject of SUBJECTS) {
    const a = archived(subject);
    const active =
      a.messages.filter((m) => m.role === "assistant").at(-1)?.requestControls?.tools?.active ?? a.init.tools;
    const defs = tools.filter((t) => active.includes(t.name)).map(({ schemaSource, ...t }) => t);
    const R = {
      modelId: MODEL,
      stream: false,
      context: { systemPrompt: a.init.systemPrompt, messages: a.messages, tools: defs },
      options: { reasoning: "high", maxTokens: 120000 },
    };
    const files = new Set<string>(["GUIDE.md", "docs/api.md", "docs/conventions.md"]);
    for (const m of a.messages)
      for (const c of m.content ?? [])
        if (c.type === "toolCall") {
          if (c.name === "read") {
            const p = String(c.arguments.path)
              .replace(/^.*\/(GUIDE\.md|docs\/|kits\/|src\/)/, "$1")
              .replace(/:\d.*$/, "");
            if (/^(GUIDE\.md|docs\/|kits\/|src\/)/.test(p) && existsSync(join(ROOT, p))) files.add(p);
          }
          for (const match of JSON.stringify(c.arguments).matchAll(/(?:src|kits)\/[A-Za-z][A-Za-z0-9_-]*\.(?:ts|md)/g))
            if (existsSync(join(ROOT, match[0]))) files.add(match[0]);
        }
    const pitch = allPitches.find((p) => p.id === subject).rich;
    const messages: any[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              pitch +
              '\n\nDeliver the complete module by calling write with path "samples/' +
              subject +
              '.ts" and content containing the TypeScript module. This tool delivery replaces the fenced-block delivery format; no other tools need to run.',
          },
        ],
        timestamp: 0,
      },
    ];
    const calls = [...files].map((p, i) => ({
      type: "toolCall",
      id: "replay_read_" + i,
      name: "read",
      arguments: { path: p },
    }));
    messages.push({
      role: "assistant",
      api: "anthropic-messages",
      provider: "anthropic",
      model: "claude-sonnet-5-5",
      content: calls,
      stopReason: "toolUse",
      timestamp: 0,
      usage: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 0,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      },
    });
    for (const c of calls)
      messages.push({
        role: "toolResult",
        toolCallId: c.id,
        toolName: "read",
        content: [{ type: "text", text: readFileSync(join(ROOT, c.arguments.path), "utf8") }],
        isError: false,
        timestamp: 0,
      });
    const S = {
      modelId: MODEL,
      stream: false,
      context: { systemPrompt: [shapedSystem], messages, tools: defs },
      options: { reasoning: "high", maxTokens: 120000 },
    };
    save(join(INPUT, subject + "-R.json"), R);
    save(join(INPUT, subject + "-S.json"), S);
    text(join(INPUT, subject + "-agent-first.ts"), a.firstDraft);
    manifest.subjectsMetadata[subject] = {
      session: a.sessionFile,
      prewriteMessages: a.messages.length,
      thinkingBlocks: a.messages.flatMap((m) => m.content).filter((c) => c.type === "thinking").length,
      activeTools: active,
      shapedFiles: [...files],
      firstWritePath: a.firstWrite.arguments.path,
    };
  }
  save(join(INPUT, "manifest.json"), manifest);
  console.log("Prepared archived/synthetic conversations; " + caveat);
}

async function prepareAblations() {
  const original = join(BASE, "replay-inputs");
  const originalManifest = json(join(original, "manifest.json"));
  const wizard = archived("wizardBookshelf");
  const tools = json(join(original, "tools.json"));
  const active =
    wizard.messages.filter((m) => m.role === "assistant").at(-1)?.requestControls?.tools?.active ?? wizard.init.tools;
  const wizardTools = tools.filter((t) => active.includes(t.name)).map(({ schemaSource, ...t }) => t);
  const strippedWizard = structuredClone(wizard.messages);
  for (const message of strippedWizard)
    if (message.role === "assistant")
      message.content = message.content.filter((block) => !["thinking", "redactedThinking"].includes(block.type));
  const manifest = {
    ...originalManifest,
    created: new Date().toISOString(),
    experiment: "replay2",
    cannedSession: wizard.sessionFile,
    variants: {
      V1: "Own archived prefix from R with every prior thinking/redactedThinking block removed.",
      V2: "One fixed wizardBookshelf system and pre-write tool conversation, thinking removed; only first user message replaced verbatim by subject's own archived first user message.",
      V3: "S synthetic full-file reads, wizardBookshelf system, subject's own archived first user message verbatim.",
    },
    thinkingFallback:
      "On a thinking/signature rejection, retain the verbatim error and retry the same request with thinking.type=disabled; never fabricate historical thinking.",
  };
  save(join(INPUT, "manifest.json"), manifest);
  save(join(INPUT, "pitches.json"), json(join(original, "pitches.json")));
  save(join(INPUT, "tools.json"), tools);
  save(join(INPUT, "wizard-prefix-without-thinking.json"), {
    systemPrompt: wizard.init.systemPrompt,
    messages: strippedWizard,
    tools: wizardTools,
  });
  for (const subject of SUBJECTS) {
    const own = archived(subject);
    const firstUser = own.messages.find((message) => message.role === "user");
    const V1 = json(join(original, subject + "-R.json"));
    for (const message of V1.context.messages)
      if (message.role === "assistant")
        message.content = message.content.filter((block) => !["thinking", "redactedThinking"].includes(block.type));
    const V2 = structuredClone(V1);
    V2.context = {
      systemPrompt: wizard.init.systemPrompt,
      messages: structuredClone(strippedWizard),
      tools: wizardTools,
    };
    V2.context.messages[V2.context.messages.findIndex((message) => message.role === "user")] =
      structuredClone(firstUser);
    const V3 = json(join(original, subject + "-S.json"));
    V3.context.systemPrompt = wizard.init.systemPrompt;
    V3.context.messages[V3.context.messages.findIndex((message) => message.role === "user")] =
      structuredClone(firstUser);
    for (const [variant, input] of Object.entries({ V1, V2, V3 }))
      save(join(INPUT, subject + "-" + variant + ".json"), input);
    text(join(INPUT, subject + "-agent-first.ts"), own.firstDraft);
  }
  text(join(ROOT, "scratch/bakeoff/craft3.md"), shapedSystem);
  console.log("Prepared V1/V2/V3 ablations; historical tool-definition caveat remains unchanged.");
}

async function guard(label: string) {
  const u = await capture(join(homedir(), ".local/bin/omp"), ["usage", "-p", "anthropic"], 60000);
  console.log(u.stdout);
  const values = [...u.stdout.matchAll(/5 Hour[^\n]*?([\d.]+)%\s*used/g)].map((m) => Number(m[1]));
  const path = join(INPUT, "usage-" + Date.now() + ".json");
  save(path, { label, at: new Date().toISOString(), ...u, values });
  if (u.status !== 0 || !values.length) throw Error("Usage guard could not parse 5 Hour line; stopped before " + label);
  if (values.some((v) => v > 50)) {
    save(join(INPUT, "stopped.json"), {
      label,
      values,
      at: new Date().toISOString(),
      reason: "Anthropic 5 Hour above 50%",
    });
    return false;
  }
  return true;
}

function wireArchived(code: string, buildFile: string) {
  const to = (p: string) => relative(dirname(buildFile), join(ROOT, p)).split("\\").join("/");
  return wireImports(code, buildFile).replace(
    /(["'])(?:\.\.\/)+(src\/[A-Za-z0-9_-]+|kits\/[A-Za-z0-9_-]+)(?:\.ts)?\1/g,
    (_m, q, p) => q + to(p) + q,
  );
}

function anthropicRequest(context: any) {
  const messages: any[] = [];
  for (const m of context.messages) {
    const content =
      m.role === "toolResult"
        ? [{ type: "tool_result", tool_use_id: m.toolCallId, content: m.content, is_error: m.isError === true }]
        : m.content.map((c) => {
            if (c.type === "toolCall") return { type: "tool_use", id: c.id, name: c.name, input: c.arguments };
            if (c.type === "thinking")
              return { type: "thinking", thinking: c.thinking, signature: c.thinkingSignature };
            if (c.type === "redactedThinking") return { type: "redacted_thinking", data: c.data };
            return c;
          });
    const role = m.role === "toolResult" ? "user" : m.role;
    if (messages.at(-1)?.role === role) messages.at(-1).content.push(...content);
    else messages.push({ role, content });
  }
  return {
    model: MODEL,
    max_tokens: 120000,
    stream: false,
    thinking: SINGLE_NO_THINKING
      ? { type: "disabled" }
      : SINGLE_THINKING_BUDGET
        ? { type: "enabled", budget_tokens: SINGLE_THINKING_BUDGET }
        : { type: "adaptive" },
    output_config: { effort: SINGLE ? SINGLE_EFFORT : "high" },
    system: context.systemPrompt.map((t) => ({ type: "text", text: t })),
    messages,
    tools: context.tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })),
  };
}

const HISTORICAL = join(homedir(), "tmp-archive/replay-sdk-88fc1f0");

async function readOnlyCall(call: any, repository = HISTORICAL) {
  const args = call.input ?? {};
  const remap = (value: string) =>
    value
      .replace(/(?:~|\/home\/cx)\/tmp-archive\/sonnet-100\/[A-Za-z0-9_-]+/g, repository)
      .replaceAll(ROOT, repository);
  try {
    if (call.name === "read") {
      const original = remap(String(args.path));
      const match = original.match(/^(.*?)(?::(\d+)(?:-(\d+))?)?$/)!;
      const path = resolve(repository, match[1]);
      if (!path.startsWith(repository + "/")) throw Error("Only repository files may be read");
      const content = readFileSync(path, "utf8").split("\n");
      const start = match[2] ? Number(match[2]) : 1,
        end = match[3] ? Number(match[3]) : match[2] ? Number(match[2]) + 299 : content.length;
      return {
        text: content
          .slice(start - 1, end)
          .map((line, i) => start + i + ":" + line)
          .join("\n"),
        isError: false,
      };
    }
    if (call.name === "grep") {
      const path = resolve(repository, remap(String(args.path ?? ".")).replace(/:\d.*$/, ""));
      if (!path.startsWith(repository)) throw Error("Only repository files may be searched");
      const out = await capture("grep", ["-R", "-n", "-E", "--", String(args.pattern), path], 60000);
      return { text: out.stdout + out.stderr || "(no matches)", isError: out.status !== 0 && out.status !== 1 };
    }
    if (call.name === "glob") {
      const pattern = remap(String(args.path ?? "**/*")).replace(repository + "/", "");
      const paths = [];
      for await (const p of new Bun.Glob(pattern).scan({ cwd: repository, dot: false })) paths.push(p);
      return { text: paths.join("\n") || "(no matches)", isError: false };
    }
    if (call.name === "bash") {
      let command = remap(String(args.command ?? ""));
      if (/[`$]/.test(command)) throw Error("Shell expansion is disabled in read-only replay");
      if (/\bsed(?!\s+-n\s+['"]?\d+(?:,\d+)?p['"]?(?:\s|$))/.test(command))
        throw Error("Only sed -n numeric line-range reads are allowed");
      const unquoted = command.replace(/'(?:[^']*)'|"(?:\\.|[^"])*"/g, "quoted");
      const stripped = unquoted.replace(/2>\s*\/dev\/null/g, "").replace(/2>&1/g, "");
      if (/[`$<>]/.test(stripped)) throw Error("Expansion and file redirection are disabled in read-only replay");
      const allowed =
        /^(?:cd|pwd|echo|ls|wc|head|tail|cat|grep|rg|cut|sort|uniq|file|readlink|stat|basename|dirname|du|sed|git)$/;
      for (const part of stripped.split(/[;&|\n]+/)) {
        const words = part.trim().split(/\s+/);
        if (!words[0]) continue;
        if (!allowed.test(words[0])) throw Error("Read-only replay refuses command: " + words[0]);
        if (
          words[0] === "sed" &&
          (!words.includes("-n") || words.some((w) => w === "-i" || w.startsWith("--in-place")))
        )
          throw Error("Only sed -n reads are allowed");
        if (words[0] === "git" && !/^(?:show|ls-tree|log|rev-parse|diff|status)$/.test(words[1] ?? ""))
          throw Error("Only read-only git queries are allowed");
      }
      const cwd = resolve(repository, remap(String(args.cwd ?? ".")));
      if (!cwd.startsWith(repository)) throw Error("Only repository cwd is allowed");
      const out = await capture("bash", ["-lc", "cd " + JSON.stringify(cwd) + " && " + command], 60000);
      return { text: out.stdout + out.stderr || "(no output)", isError: out.status !== 0 };
    }
    throw Error(
      "Read-only replay only executes read, grep, glob and safe inspection bash; writes, renders and other tools are refused",
    );
  } catch (error) {
    return { text: "Tool error: " + String(error), isError: true };
  }
}

async function conversationBatch(batch: string) {
  const variant = EXPERIMENT2 ? batch.slice(0, 2).toUpperCase() : batch[0] === "r" ? "R" : "S",
    arm = EXPERIMENT2 ? variant.toLowerCase() : variant === "R" ? "replay" : "shaped";
  if (!existsSync(join(HISTORICAL, "GUIDE.md"))) {
    const worktree = await capture("git", ["worktree", "add", "--detach", HISTORICAL, "88fc1f0"], 120000);
    if (worktree.status !== 0) throw Error(worktree.stderr || worktree.stdout);
  }
  const round = EXPERIMENT2 ? "r17" + batch : "r16" + (variant === "R" ? "replay" : "shaped") + batch[1],
    dir = join(BASE, "rounds", round);
  const manifest = json(join(INPUT, "manifest.json"));
  save(join(dir, "round.json"), {
    id: round,
    started: existsSync(join(dir, "round.json"))
      ? (json(join(dir, "round.json")).started ?? new Date().toISOString())
      : new Date().toISOString(),
    model: MODEL,
    effort: "high",
    maxTokens: 120000,
    arms: [{ ...craft, id: arm, name: EXPERIMENT2 ? manifest.variants[variant] : arm }],
    subjects: allPitches,
    replayEncoding: manifest.encoding,
    replayCaveat: caveat,
    continuations: { maxExtraCalls: 8, sdkCommit: "88fc1f0", readOnly: true },
    repairSystem: "craft3",
  });
  mkdirSync(join(dir, "builds"), { recursive: true });
  mkdirSync(join(dir, "checks"), { recursive: true });
  const gw = gateway();
  try {
    await Promise.all(
      SUBJECTS.map(async (subject) => {
        const slug = round + subject[0].toUpperCase() + subject.slice(1) + "Rich" + arm[0].toUpperCase() + arm.slice(1),
          runPath = join(dir, "runs", slug + ".json");
        const previous = existsSync(runPath) ? json(runPath) : null;
        if (previous && (previous.hasCode || previous.extraCalls >= 8)) return;
        if (previous?.status === 404)
          save(join(dir, "routing-attempts", slug + ".json"), {
            run: previous,
            request: json(join(dir, "requests", slug + ".json")),
            reply: json(join(dir, "replies", slug + "-initial.json")),
          });
        const input = json(join(INPUT, subject + "-" + variant + ".json"));
        let body = anthropicRequest(input.context);
        text(join(dir, "prompts", arm + ".md"), input.context.systemPrompt.join("\n\n"));
        let thinkingPassed = !EXPERIMENT2 && variant === "R" && manifest.subjectsMetadata[subject].thinkingBlocks > 0,
          extraCalls = 0;
        let thinkingDisabledFallback = false;
        const apiRejections: { stage: string; status: number; body: unknown }[] = [];
        const responses: any[] = [];
        let reply: any;
        const started = previous?.status === 200 ? Date.parse(previous.started) : Date.now();
        if (previous?.status === 200) {
          reply = json(join(dir, "replies", slug + "-initial.json"));
          body = json(join(dir, "requests", slug + ".json"));
        } else {
          save(join(dir, "requests", slug + ".json"), body);
          reply = await gw.send("/v1/messages", body);
          save(join(dir, "replies", slug + "-initial.json"), reply);
        }
        if (reply.status !== 200) apiRejections.push({ stage: "initial", status: reply.status, body: reply.body });
        if (
          reply.status !== 200 &&
          /thinking|signature/i.test(JSON.stringify(reply.body)) &&
          (thinkingPassed || EXPERIMENT2)
        ) {
          if (EXPERIMENT2) {
            body.thinking = { type: "disabled" };
            thinkingDisabledFallback = true;
            save(join(dir, "requests", slug + "-thinking-disabled.json"), body);
            reply = await gw.send("/v1/messages", body);
            save(join(dir, "replies", slug + "-thinking-disabled.json"), reply);
          } else {
            for (const m of body.messages)
              if (m.role === "assistant") m.content = m.content.filter((c) => c.type !== "thinking");
            thinkingPassed = false;
            save(join(dir, "requests", slug + "-without-thinking.json"), body);
            reply = await gw.send("/v1/messages", body);
            save(join(dir, "replies", slug + "-without-thinking.json"), reply);
          }
          if (reply.status !== 200)
            apiRejections.push({ stage: "thinking fallback", status: reply.status, body: reply.body });
        }
        responses.push(reply);
        while (existsSync(join(dir, "replies", slug + "-continuation-" + (extraCalls + 1) + ".json"))) {
          extraCalls++;
          body = json(join(dir, "requests", slug + "-continuation-" + extraCalls + ".json"));
          reply = json(join(dir, "replies", slug + "-continuation-" + extraCalls + ".json"));
          responses.push(reply);
        }
        const expected = EXPERIMENT2 || variant === "R" ? subject + "Sonnet.ts" : subject + ".ts";
        let write = reply.body?.content?.find(
          (c) => c.type === "tool_use" && c.name === "write" && String(c.input?.path ?? "").endsWith(expected),
        );
        while (!write && reply.status === 200 && extraCalls < 8) {
          const calls = (reply.body?.content ?? []).filter((c) => c.type === "tool_use");
          if (!calls.length) break;
          const toolResults = [];
          for (const call of calls) {
            const result = await readOnlyCall(call);
            const content =
              result.text.length > 100000
                ? result.text.slice(0, 100000) + "\n[Read-only replay output truncated at 100000 characters]"
                : result.text;
            toolResults.push({
              type: "tool_result",
              tool_use_id: call.id,
              content: [{ type: "text", text: content }],
              is_error: result.isError,
            });
          }
          if (!(await guard(slug + " continuation " + (extraCalls + 1)))) break;
          body.messages.push(
            { role: "assistant", content: reply.body.content },
            { role: "user", content: toolResults },
          );
          extraCalls++;
          save(join(dir, "requests", slug + "-continuation-" + extraCalls + ".json"), body);
          reply = await gw.send("/v1/messages", body);
          save(join(dir, "replies", slug + "-continuation-" + extraCalls + ".json"), reply);
          if (reply.status !== 200)
            apiRejections.push({ stage: "continuation " + extraCalls, status: reply.status, body: reply.body });
          responses.push(reply);
          write = reply.body?.content?.find(
            (c) => c.type === "tool_use" && c.name === "write" && String(c.input?.path ?? "").endsWith(expected),
          );
        }
        const code = typeof write?.input?.content === "string" ? write.input.content : null;
        const usage: any = {
          input_tokens: 0,
          output_tokens: 0,
          cache_read_input_tokens: 0,
          cache_creation_input_tokens: 0,
        };
        for (const response of responses)
          for (const key of Object.keys(usage)) usage[key] += response.body?.usage?.[key] ?? 0;
        usage.prompt_tokens = usage.input_tokens + usage.cache_read_input_tokens + usage.cache_creation_input_tokens;
        usage.completion_tokens = usage.output_tokens;
        const costUsd =
          (usage.input_tokens * 2 +
            usage.cache_read_input_tokens * 0.1 +
            usage.cache_creation_input_tokens * 2.5 +
            usage.output_tokens * 10) /
          1e6;
        const blocks = reply.body?.content ?? [];
        const run = {
          slug,
          subject,
          arm,
          level: "rich",
          pitch: allPitches.find((s) => s.id === subject).rich,
          model: MODEL,
          effort: "high",
          started: new Date(started).toISOString(),
          wallMs: Date.now() - started,
          status: reply.status,
          error:
            reply.status === 200
              ? code
                ? null
                : "No sample write after " + extraCalls + " extra calls"
              : JSON.stringify(reply.body),
          finishReason: reply.body?.stop_reason ?? null,
          usage,
          costUsd,
          hasCode: Boolean(code),
          thinkingPassed,
          thinkingBlocksBefore: EXPERIMENT2 ? 0 : manifest.subjectsMetadata[subject].thinkingBlocks,
          thinkingDisabledFallback,
          apiRejections,
          replayCaveat: caveat,
          encoding: manifest.encoding,
          extraCalls,
          sdkCommit: "88fc1f0",
          finalWriteUsage: code ? (reply.body?.usage ?? null) : null,
          returnedTools: blocks
            .filter((c) => c.type === "tool_use")
            .map((c) => ({ name: c.name, path: c.input?.path })),
          outputThinkingTokens: null,
          outputTextTokens: null,
        };
        if (code) text(join(dir, "builds", slug + ".ts"), wireArchived(code, join(dir, "builds", slug + ".ts")));
        save(runPath, run);
        text(
          join(dir, "runs", slug + ".md"),
          blocks
            .filter((c) => c.type === "text")
            .map((c) => c.text)
            .join("\n"),
        );
        console.log(
          slug,
          reply.status,
          code ? Buffer.byteLength(code) + " bytes" : "NO SAMPLE WRITE",
          extraCalls,
          "extra calls",
          usage.completion_tokens,
          "out",
          costUsd,
        );
      }),
    );
  } finally {
    gw.close();
  }
  results(round);
  return round;
}

async function cmd(args: string[]) {
  console.log("npm run bakeoff -- " + args.join(" "));
  const out = await capture("npm", ["run", "bakeoff", "--", ...args], 3600000);
  console.log(out.stdout);
  if (out.status !== 0) throw Error(out.stderr || out.stdout);
}
async function checkedAndRepaired(round: string) {
  await cmd(["check", round, "--skip-typecheck", "--concurrency", "2"]);
  for (let turn = 1; turn <= 2; turn++) {
    const sources = turn === 1 ? [round] : [round + "fix", round];
    const latest = new Map<string, any>();
    for (const r of sources)
      for (const e of existsSync(join(BASE, "rounds", r, "results.json"))
        ? json(join(BASE, "rounds", r, "results.json"))
        : [])
        if (!latest.has(e.subject)) latest.set(e.subject, e);
    const failed = [...latest.values()].filter((entry) =>
      GAP3 ? !entry.hasCode || entry.check?.rendered === false : entry.hasCode && entry.check?.rendered === false,
    );
    if (!failed.length) break;
    if (!(await guard(round + " repair " + turn))) return false;
    if (SINGLE) {
      const crashes = failed.length;
      if (singleSpend() + crashes * 1.8 > SINGLE_CAP) {
        save(join(INPUT, "stopped.json"), {
          reason: "$" + SINGLE_CAP + " repair budget guard",
          round,
          turn,
          spent: singleSpend(),
        });
        return false;
      }
    }
    if (GAP3) {
      const next = round + (turn === 1 ? "fix" : "fix2");
      await repairGap3(round, next, sources, failed);
      await cmd(["check", next, "--skip-typecheck", "--concurrency", "2"]);
      continue;
    }
    const next = round + (turn === 1 ? "fix" : "fix2");
    await cmd([
      "refine",
      next,
      "--from",
      sources.join(","),
      "--repair-only",
      "--max-tokens",
      "120000",
      "--effort",
      SINGLE ? SINGLE_EFFORT : "high",
      "--concurrency",
      "2",
      "--system-prompt",
      GAP3 ? relative(ROOT, join(BASE, "rounds", round, "prompts", SINGLE_ARM + ".md")) : "scratch/bakeoff/craft3.md",
    ]);
    await cmd(["check", next, "--skip-typecheck", "--concurrency", "2"]);
  }
  return true;
}

const APP_STYLE_KITS: Record<string, string[]> = {
  "pixel art": ["pixel"],
  "Genshin Impact": ["toon", "glow"],
  "high-fantasy anime": ["toon", "glow"],
  "League of Legends": ["toon", "glow"],
  Overwatch: ["toon", "glow"],
  "Blizzard/Warcraft": ["toon", "glow"],
  whimsical: ["toon"],
  "low-poly": [],
};
const APP_UNAVAILABLE =
  "Renders are unavailable in this environment. Finish the file; it is rendered after you end your turn.";
type AppCall = { id: string; name: string; input: Record<string, unknown> };

async function prepareApp() {
  const wizard = archived("wizardBookshelf");
  const original = wizard.messages
    .find((message) => message.role === "user")
    .content.find((block) => block.type === "text").text;
  const template = original
    .replaceAll("wizardBookshelfSonnet", "{slug}")
    .replaceAll("~/tmp-archive/sonnet-100/{slug}/", "{sandbox}")
    .replace(/^Category:.*$/m, "Category: {category}")
    .replace(/^Subject:.*$/m, "Subject: {subject}")
    .replace(/^Style:.*$/m, "Style: {style}.")
    .replaceAll('"high-fantasy anime"', '"{style}"');
  const tools = json(join(BASE, "replay-inputs/tools.json")).map(({ schemaSource, ...tool }) => tool);
  const manifest = {
    model: MODEL,
    effort: "high",
    maxTokens: 120000,
    maxExtraCalls: 16,
    subjects: allPitches,
    systemSource: wizard.sessionFile,
    systemPrompt: wizard.init.systemPrompt,
    briefTemplate: template,
    tools,
    styleKitMapping: APP_STYLE_KITS,
    additionalKits: {
      clockwork: "Style or subject contains steampunk, clockwork, gears, brass: add clockwork doc and source.",
      glow: "Fantasy/anime/game styles map above; also add glow for magic, fire/flame, light/lantern/candle, crystal/orb, neon, molten/lava, rune or spirit features.",
    },
    toolPolicy:
      "Current repo reads; virtual sample writes and native hashline edits; harmless scratch commands succeed; real targeted typecheck; no rendering; continue until natural/yield or 17 total calls.",
    caveat,
  };
  save(join(INPUT, "manifest.json"), manifest);
  save(join(INPUT, "pitches.json"), { subjects: allPitches });
  text(join(ROOT, "scratch/bakeoff/craft3.md"), shapedSystem);
  for (const subject of allPitches) {
    const field = (name: string) => subject.rich.match(new RegExp("^" + name + ":\\s*(.*)$", "m"))[1];
    const style = field("Style").replace(/\.$/, "");
    const workspace = join(ROOT, "scratch/replay-app", subject.id);
    const brief = template
      .replaceAll("{slug}", subject.id)
      .replaceAll("{sandbox}", workspace + "/")
      .replaceAll("{category}", field("Category"))
      .replaceAll("{subject}", field("Subject"))
      .replaceAll("{style}", style);
    const kits = new Set(APP_STYLE_KITS[style] ?? []);
    if (/steampunk|clockwork|gears?|brass/i.test(subject.rich)) kits.add("clockwork");
    if (/magic|fire|flame|light|lantern|candle|crystal|orb|neon|molten|lava|rune|spirit/i.test(subject.rich))
      kits.add("glow");
    const files = [
      "GUIDE.md",
      "docs/api.md",
      "docs/conventions.md",
      ...[...kits].flatMap((kit) =>
        kit === "glow" ? ["kits/glow.md"] : ["kits/" + kit + ".md", "kits/" + kit + ".ts"],
      ),
      "src/paint.ts",
      "src/math.ts",
    ];
    const calls = files.map((path, i) => ({
      type: "toolCall",
      id: "app_read_" + i,
      name: "read",
      arguments: { path },
    }));
    const messages = [
      { role: "user", content: [{ type: "text", text: brief }], timestamp: 0 },
      {
        role: "assistant",
        api: "anthropic-messages",
        provider: "anthropic",
        model: "claude-sonnet-5-5",
        content: calls,
        stopReason: "toolUse",
        timestamp: 0,
      },
      ...calls.map((call) => ({
        role: "toolResult",
        toolCallId: call.id,
        toolName: "read",
        content: [{ type: "text", text: readFileSync(join(ROOT, call.arguments.path), "utf8") }],
        isError: false,
        timestamp: 0,
      })),
    ];
    save(join(INPUT, subject.id + ".json"), {
      context: { systemPrompt: wizard.init.systemPrompt, messages, tools },
      files,
      kits: [...kits],
      workspace,
    });
  }
  console.log(
    "Prepared one fixed campaign template and current-repo synthetic reads for " + allPitches.length + " app briefs.",
  );
}

/** Reuse the frozen app prefix verbatim, then prefill the lookups its live loop usually makes. */
async function prepareSingle() {
  if (ARGON) {
    const frozen = join(BASE, "r19single-inputs");
    const manifest = json(join(frozen, "manifest.json"));
    for (const subject of manifest.subjects) {
      const input = json(join(frozen, subject.id + ".json"));
      for (const message of input.context.messages)
        if (message.role === "assistant")
          message.content = message.content.filter(
            (block: { type: string }) => !["thinking", "redactedThinking", "redacted_thinking"].includes(block.type),
          );
      save(join(INPUT, subject.id + ".json"), input);
    }
    save(join(INPUT, "manifest.json"), {
      ...manifest,
      model: MODEL,
      effort: SINGLE_EFFORT,
      maxTokens: 65536,
      source: "bakeoff/r19single-inputs (frozen app-inputs + r19 prefill); only Anthropic thinking removed",
      removedBlocks: ["thinking", "redactedThinking", "redacted_thinking"],
    });
    save(join(INPUT, "pitches.json"), json(join(frozen, "pitches.json")));
    return;
  }
  if (SINGLE_PROMPT || SINGLE_NORIG || GAP3) {
    const source = join(BASE, "r19" + SINGLE_ARM + "-inputs");
    const manifest = json(join(source, "manifest.json"));
    const dropped = ["elvenArcher", "cyborgMedic", "gnomeTinkerer"];
    const subjects = manifest.subjects.filter((s: { id: string }) => !GAP3 || !dropped.includes(s.id));
    for (const subject of subjects) {
      let input = json(join(source, subject.id + ".json"));
      if (SINGLE_PROMPT) {
        const slot = input.context.messages.find((m) => m.role === "toolResult" && m.toolCallId === "single_read_8");
        if (!slot) throw Error("--prompt-file requires the --craft prefilled slot");
        slot.content[0].text = readFileSync(resolve(ROOT, SINGLE_PROMPT), "utf8");
        for (const message of input.context.messages)
          for (const block of message.content)
            if (block.type === "toolCall" && block.id === "single_read_8") block.arguments.path = SINGLE_PROMPT;
        input.files = input.files.map((p: string) => (p === "bakeoff/prompts/craft3.md" ? SINGLE_PROMPT : p));
      }
      if (SINGLE_NORIG) input = staticContext(ROOT, input);
      save(join(INPUT, subject.id + ".json"), input);
    }
    const first = json(join(INPUT, subjects[0].id + ".json"));
    save(join(INPUT, "manifest.json"), {
      ...manifest,
      subjects,
      effort: SINGLE_EFFORT,
      promptFile: SINGLE_PROMPT ?? "bakeoff/prompts/craft3.md",
      noRig: SINGLE_NORIG,
      thinkingBudget: SINGLE_THINKING_BUDGET || null,
      systemPrompt: first.context.systemPrompt,
      thinkingNotRequested: SINGLE_NO_THINKING,
      effectiveThinking: SINGLE_NO_THINKING
        ? "thinking not requested (gateway omits the thinking param, effort pinned low; API default applies)"
        : "adaptive + effort " + SINGLE_EFFORT,
      label:
        SINGLE_ROUND === "r22cap"
          ? "C, second draw (adaptive + effort low, budget dropped by gateway)"
          : SINGLE_NO_THINKING
            ? "thinking not requested (gateway omits the thinking param, effort pinned low; API default applies)"
            : SINGLE_ROUND,
      lookups: manifest.lookups.map((p: string) => (p === "bakeoff/prompts/craft3.md" ? (SINGLE_PROMPT ?? p) : p)),
      source: "bakeoff/app-inputs via frozen r19 prefix",
    });
    save(join(INPUT, "pitches.json"), { subjects });
    return;
  }
  if (SINGLE_REF || SINGLE_EFFORT !== "high") {
    const frozen = join(BASE, "r19" + SINGLE_ARM + "-inputs");
    const manifest = json(join(frozen, "manifest.json"));
    for (const name of [
      "manifest.json",
      "pitches.json",
      ...manifest.subjects.map((subject: { id: string }) => subject.id + ".json"),
    ])
      save(join(INPUT, name), json(join(frozen, name)));
    const references: Record<string, { variant: string; file: string; path: string; sandboxPath: string }> = {};
    if (SINGLE_REF) {
      const neutral: Record<string, true> = {
        wizardBookshelf: true,
        grayWolf: true,
        phoenix: true,
        chopperMotorbike: true,
        frostAxe: true,
        dwarfRifleman: true,
        desertOasisDiorama: true,
        pixelDungeonProps: true,
        africanElephant: true,
        floatingIslandDiorama: true,
        qilin: true,
      };
      const refs = json(join(BASE, "refs-manifest.json"));
      for (const subject of manifest.subjects) {
        const input = json(join(INPUT, subject.id + ".json"));
        const variant = neutral[subject.id] ? "neutral" : "styled";
        const image = refs.entries.find((entry: { slug: string }) => entry.slug === subject.id)[variant];
        const sandboxPath = input.workspace + "/refs/" + subject.id + ".png";
        references[subject.id] = { variant, file: image.file, path: image.path, sandboxPath };
        const final = input.context.messages.pop();
        input.context.messages.push(
          {
            role: "assistant",
            timestamp: 0,
            content: [{ type: "toolCall", id: "single_reference", name: "read", arguments: { path: sandboxPath } }],
          },
          {
            role: "toolResult",
            timestamp: 0,
            toolCallId: "single_reference",
            toolName: "read",
            isError: false,
            content: [
              { type: "text", text: "Reference sheet for this build." },
              {
                type: "image",
                source: { type: "base64", media_type: "image/png", data: readFileSync(image.path).toString("base64") },
              },
            ],
          },
          final,
        );
        final.content[0].text +=
          " The reference sheet shows the intended design: match its silhouette, proportions, palette and signature features; the brief's staging still applies.";
        input.files.push(sandboxPath);
        input.reference = references[subject.id];
        save(join(INPUT, subject.id + ".json"), input);
      }
    }
    save(join(INPUT, "manifest.json"), { ...manifest, effort: SINGLE_EFFORT, ...(SINGLE_REF ? { references } : {}) });
    text(join(ROOT, "scratch/bakeoff/craft3.md"), shapedSystem);
    console.log("Reused " + manifest.subjects.length + " frozen r19 " + SINGLE_ARM + " single-run inputs.");
    return;
  }
  const source = join(BASE, "app-inputs");
  const manifest = json(join(source, "manifest.json"));
  const lookups = [
    "src/index.ts",
    "src/sweep.ts",
    "src/parts.ts",
    "src/cards.ts",
    "src/sugar.ts",
    "src/builder.ts",
    "kits/glow.md",
    "kits/glow.ts",
    ...(SINGLE_ARM === "craft" ? ["bakeoff/prompts/craft3.md"] : []),
  ];
  save(join(INPUT, "manifest.json"), {
    ...manifest,
    arm: SINGLE_ARM,
    source: "bakeoff/app-inputs",
    maxExtraCalls: 0,
    lookups,
    toolPolicy:
      "One request and reply; automatic tool choice; extract the complete sample write; no returned tool results. One fresh redraw permitted after a reply without a sample write.",
  });
  save(join(INPUT, "pitches.json"), { subjects: manifest.subjects });
  text(join(ROOT, "scratch/bakeoff/craft3.md"), shapedSystem);
  for (const subject of manifest.subjects) {
    const input = json(join(source, subject.id + ".json"));
    const calls = [
      { type: "toolCall", id: "single_pwd", name: "bash", arguments: { command: "pwd" } },
      { type: "toolCall", id: "single_ls", name: "bash", arguments: { command: "ls" } },
      ...lookups.map((path, i) => ({
        type: "toolCall",
        id: "single_read_" + i,
        name: "read",
        arguments: { path },
      })),
    ];
    input.context.messages.push(
      { role: "assistant", content: calls, timestamp: 0 },
      ...calls.map((call) => ({
        role: "toolResult",
        toolCallId: call.id,
        toolName: call.name,
        isError: false,
        timestamp: 0,
        content: [
          {
            type: "text",
            text:
              call.name === "read"
                ? readFileSync(
                    join(
                      ROOT,
                      "path" in call.arguments && typeof call.arguments.path === "string" ? call.arguments.path : "",
                    ),
                    "utf8",
                  )
                : call.id === "single_pwd"
                  ? input.workspace + "\n"
                  : readdirSync(ROOT)
                      .filter((name) => !name.startsWith("."))
                      .sort()
                      .join("\n") + "\n",
          },
        ],
      })),
      {
        role: "user",
        timestamp: 0,
        content: [
          {
            type: "text",
            text:
              "All orientation and SDK lookups are already provided above. This is a single-run environment: there will be exactly one reply, and no tool results or further turns will be returned. In this reply, use write to write the entire finished module to samples/" +
              subject.id +
              ".ts. Put the complete file content in that write, not a starter to extend later. Rendering, typechecking and any crash repairs happen separately after your reply; do not request them here. This environment constraint replaces the assignment's two-render requirement; all other subject, style and quality requirements are unchanged.",
          },
        ],
      },
    );
    input.files.push(...lookups);
    save(join(INPUT, subject.id + ".json"), input);
  }
  console.log("Prepared " + manifest.subjects.length + " " + SINGLE_ARM + " single-run inputs.");
}

function singleSpend() {
  const probeSpend = GAP3
    ? ["r22cap-inputs/thinking-probe.json", "r22nothink-inputs/thinking-disabled-probe.json"].reduce((sum, path) => {
        if (!existsSync(join(BASE, path))) return sum;
        const used = json(join(BASE, path)).response.body?.usage ?? {};
        return sum + ((used.input_tokens ?? 0) * 2 + (used.output_tokens ?? 0) * 10) / 1e6;
      }, 0)
    : 0;
  return readdirSync(join(BASE, "rounds"))
    .filter((name) =>
      (GAP3
        ? /^r22(asset|norig|lean|cap|nothink)(fix2?)?$/
        : SINGLE_REF
          ? /^r21ref(low|medium|high)(fix2?)?$/
          : SINGLE_EFFORT === "high"
            ? /^r19(single|craft)(fix2?)?$/
            : /^r20(med|low)(single|craft)(fix2?)?$/
      ).test(name),
    )
    .flatMap((round) => {
      const runs = join(BASE, "rounds", round, "runs");
      return existsSync(runs)
        ? readdirSync(runs)
            .filter((name) => name.endsWith(".json"))
            .map((name) => json(join(runs, name)).costUsd ?? 0)
        : [];
    })
    .reduce(
      (sum, amount) => sum + amount,
      GAP3
        ? (existsSync(join(BASE, "r22lean-inputs/discarded-pilot.json"))
            ? json(join(BASE, "r22lean-inputs/discarded-pilot.json")).costUsd
            : 0) + probeSpend
        : 0,
    );
}

async function reserveGap3(slug: string) {
  const budget = join(BASE, "gap3-budget");
  mkdirSync(budget, { recursive: true });
  const lock = join(budget, "lock");
  while (true) {
    try {
      mkdirSync(lock);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      await Bun.sleep(50);
      continue;
    }
    let pending = 0;
    try {
      pending = readdirSync(budget).filter((name) => name.endsWith(".json")).length;
      if (singleSpend() + (pending + 1) * 1.6 <= SINGLE_CAP - 2) {
        const reservation = join(budget, slug + ".json");
        save(reservation, { reservedUsd: 1.6, at: new Date().toISOString() });
        return reservation;
      }
      if (!pending) return null;
    } finally {
      rmSync(lock, { recursive: true });
    }
    await Bun.sleep(1000);
  }
}

type Gap3Entry = {
  slug: string;
  from?: string;
  subject: string;
  arm: string;
  pitch: string;
  error?: string;
  costUsd?: number;
  chainCostUsd?: number;
  check?: { renderError?: string };
};

async function repairGap3(round: string, next: string, sources: string[], entries: Gap3Entry[]) {
  const dir = join(BASE, "rounds", next);
  save(join(dir, "round.json"), {
    ...json(join(BASE, "rounds", round, "round.json")),
    id: next,
    refineFrom: sources.join(","),
  });
  mkdirSync(join(dir, "builds"), { recursive: true });
  mkdirSync(join(dir, "checks"), { recursive: true });
  const gw = gateway();
  try {
    for (const entry of entries) {
      const slug = next + entry.slug.slice(sources.find((source) => entry.slug.startsWith(source))!.length);
      if (existsSync(join(dir, "runs", slug + ".json"))) continue;
      if (!(await guard(next + " " + entry.subject + " repair"))) break;
      let sourceSlug = entry.slug;
      let source = sources.find((source) => existsSync(join(BASE, "rounds", source, "builds", sourceSlug + ".ts")));
      if (!source && entry.from) {
        sourceSlug = entry.from;
        source = sources.find((source) => existsSync(join(BASE, "rounds", source, "builds", sourceSlug + ".ts")));
      }
      if (!source) throw Error("Repair has no prior module: " + entry.slug);
      const current = readFileSync(join(BASE, "rounds", source, "builds", sourceSlug + ".ts"), "utf8");
      const checked = json(join(BASE, "rounds", source, "checks", sourceSlug + ".json"));
      const input = json(join(INPUT, entry.subject + ".json"));
      input.context.messages.at(-1).content[0].text +=
        "\nRepair only this module's render crash, preserving its design. Write the complete corrected module in one write call.\nError:\n" +
        (entry.check?.renderError ?? checked.renderError ?? entry.error ?? "render failed") +
        (sourceSlug !== entry.slug
          ? "\nThe previous repair requested inspection tools instead of writing. No tool results will be returned; use the supplied signatures and write the entire corrected module."
          : "") +
        "\nCurrent module:\n```ts\n" +
        current +
        "\n```";
      const body = anthropicRequest(input.context);
      const reservation = await reserveGap3(slug);
      if (!reservation) break;
      save(join(dir, "requests", slug + "-1.json"), body);
      const started = Date.now();
      const reply = await gw.send("/v1/messages", body);
      save(join(dir, "replies", slug + "-1.json"), reply);
      const used = reply.body?.usage ?? {};
      const costUsd =
        ((used.input_tokens ?? 0) * 2 +
          (used.cache_read_input_tokens ?? 0) * 0.1 +
          (used.cache_creation_input_tokens ?? 0) * 2.5 +
          (used.output_tokens ?? 0) * 10) /
        1e6;
      const write = singleTools(reply.body?.content)
        .filter(
          (block) =>
            block.name === "write" &&
            typeof block.input.content === "string" &&
            typeof block.input.path === "string" &&
            block.input.path.endsWith("/" + entry.subject + ".ts"),
        )
        .at(-1);
      const code = typeof write?.input.content === "string" ? write.input.content : null;
      save(join(dir, "runs", slug + ".json"), {
        slug,
        from: entry.slug,
        mode: "repair",
        arm: entry.arm,
        subject: entry.subject,
        level: "rich",
        pitch: entry.pitch,
        model: MODEL,
        effort: SINGLE_EFFORT,
        thinkingBudget: SINGLE_THINKING_BUDGET || null,
        started: new Date(started).toISOString(),
        wallMs: Date.now() - started,
        status: reply.status,
        generationSeconds: (Date.now() - started) / 1000,
        replyHadThinkingBlock: (reply.body?.content ?? []).some(
          (block) => block.type === "thinking" || block.type === "redacted_thinking",
        ),
        usage: { ...used, completion_tokens: used.output_tokens },
        costUsd,
        chainCostUsd: (entry.chainCostUsd ?? entry.costUsd ?? 0) + costUsd,
        hasCode: Boolean(code),
        moduleBytes: code ? Buffer.byteLength(code) : 0,
        error: code ? null : JSON.stringify(reply.body),
        modelCalls: 1,
      });
      if (code) text(join(dir, "builds", slug + ".ts"), wireArchived(code, join(dir, "builds", slug + ".ts")));
      rmSync(reservation);
      console.log(slug, code ? "repaired module" : "NO WRITE", "$" + costUsd.toFixed(3));
    }
  } finally {
    gw.close();
  }
  results(next);
}

type SingleAttempt = {
  request: number;
  kind: string;
  status: number;
  wallMs: number;
  costUsd: number;
  hasCode: boolean;
  finishReason: string | null;
  error: string | null;
  returnedTools: { name: string; path: unknown }[];
};

function singleTools(content: unknown): AppCall[] {
  if (!Array.isArray(content)) return [];
  return content.flatMap((block: unknown) => {
    if (
      !block ||
      typeof block !== "object" ||
      !("type" in block) ||
      block.type !== "tool_use" ||
      !("name" in block) ||
      typeof block.name !== "string" ||
      !("id" in block) ||
      typeof block.id !== "string" ||
      !("input" in block) ||
      !block.input ||
      typeof block.input !== "object" ||
      Array.isArray(block.input)
    )
      return [];
    return [{ id: block.id, name: block.name, input: Object.fromEntries(Object.entries(block.input)) }];
  });
}

async function runSingle() {
  if (!(await guard(SINGLE_ROUND + " single-run arm"))) return;
  const round = SINGLE_ROUND,
    dir = join(BASE, "rounds", round);
  const manifest = json(join(INPUT, "manifest.json"));
  save(join(dir, "round.json"), {
    id: round,
    started: existsSync(join(dir, "round.json")) ? json(join(dir, "round.json")).started : new Date().toISOString(),
    model: MODEL,
    effort: SINGLE_EFFORT,
    maxTokens: 120000,
    maxExtraCalls: 0,
    subjects: manifest.subjects,
    arms: [
      {
        ...craft,
        id: SINGLE_ARM,
        name:
          manifest.label ??
          (SINGLE_ARM === "craft"
            ? "Sonnet · agent framing + craft, single-run"
            : "Sonnet · agent framing, single-run"),
      },
    ],
    source: manifest.source,
    lookups: manifest.lookups,
    promptFile: manifest.promptFile,
    noRig: manifest.noRig,
    thinkingBudget: manifest.thinkingBudget,
    label: manifest.label,
    thinkingNotRequested: manifest.thinkingNotRequested,
    effectiveThinking: manifest.effectiveThinking,
    ...(SINGLE_REF ? { references: manifest.references } : {}),
    toolPolicy: manifest.toolPolicy,
  });
  text(join(dir, "prompts", SINGLE_ARM + ".md"), manifest.systemPrompt.join("\n\n"));
  mkdirSync(join(dir, "builds"), { recursive: true });
  mkdirSync(join(dir, "checks"), { recursive: true });
  const gw = gateway();
  let active = 0,
    paused = "";
  const budgetWaiters: (() => void)[] = [];
  const queue = allPitches
    .filter((subject) => manifest.subjects.some((s: { id: string }) => s.id === subject.id))
    .filter(
      (subject) =>
        !existsSync(
          join(
            dir,
            "runs",
            round +
              subject.id[0].toUpperCase() +
              subject.id.slice(1) +
              "Rich" +
              SINGLE_ARM[0].toUpperCase() +
              SINGLE_ARM.slice(1) +
              ".json",
          ),
        ),
    );
  async function build(subject: (typeof allPitches)[number]) {
    const slug =
      round +
      subject.id[0].toUpperCase() +
      subject.id.slice(1) +
      "Rich" +
      SINGLE_ARM[0].toUpperCase() +
      SINGLE_ARM.slice(1);
    const input = json(join(INPUT, subject.id + ".json"));
    const body = anthropicRequest(input.context);
    const started = Date.now();
    const attempts: SingleAttempt[] = [];
    const usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
    let code: string | null = null,
      costUsd = 0;
    for (let attempt = 1; attempt <= 2; attempt++) {
      // Reserve output plus input headroom, keeping $2 for separate crash repairs.
      if (!(await guard(slug + (attempt === 1 ? " generation" : " fresh redraw")))) {
        paused = "Anthropic 5 Hour above 50%";
        break;
      }
      const reservation = GAP3 ? await reserveGap3(slug) : undefined;
      while (!GAP3 && !paused && active > 0 && singleSpend() + (active + 1) * 1.8 > SINGLE_CAP - 2)
        await new Promise<void>((resolve) => budgetWaiters.push(resolve));
      if (paused || (GAP3 ? reservation === null : singleSpend() + (active + 1) * 1.8 > SINGLE_CAP - 2)) {
        paused ||= "Budget guard: $" + SINGLE_CAP + " total cap, including repair reserve";
        break;
      }
      const sent = Date.now();
      save(join(dir, "requests", slug + "-" + attempt + ".json"), body);
      active++;
      const reply = await gw.send("/v1/messages", body);
      save(join(dir, "replies", slug + "-" + attempt + ".json"), reply);
      const used = reply.body?.usage ?? {};
      for (const key of [
        "input_tokens",
        "output_tokens",
        "cache_read_input_tokens",
        "cache_creation_input_tokens",
      ] as const)
        usage[key] += used[key] ?? 0;
      const amount =
        ((used.input_tokens ?? 0) * 2 +
          (used.cache_read_input_tokens ?? 0) * 0.1 +
          (used.cache_creation_input_tokens ?? 0) * 2.5 +
          (used.output_tokens ?? 0) * 10) /
        1e6;
      costUsd += amount;
      const calls = singleTools(reply.body?.content);
      const write = calls
        .filter(
          (block) =>
            block.name === "write" &&
            typeof block.input.path === "string" &&
            /(?:^|\/)samples\/[^/]+\.ts$/.test(block.input.path) &&
            block.input.path.endsWith("/" + subject.id + ".ts") &&
            typeof block.input.content === "string",
        )
        .at(-1);
      code = typeof write?.input.content === "string" ? write.input.content : null;
      attempts.push({
        request: attempt,
        kind: attempt === 1 ? "generation" : "redraw",
        status: reply.status,
        wallMs: Date.now() - sent,
        costUsd: amount,
        hasCode: Boolean(code),
        finishReason: reply.body?.stop_reason ?? null,
        error: reply.status === 200 ? (code ? null : "Reply contained no sample write") : JSON.stringify(reply.body),
        returnedTools: calls.map((block) => ({ name: block.name, path: block.input.path })),
      });
      // Persist accounting before another worker reserves its next request.
      save(join(dir, "runs", slug + ".json"), {
        slug,
        arm: SINGLE_ARM,
        subject: subject.id,
        level: "rich",
        pitch: subject.rich,
        model: MODEL,
        effort: SINGLE_EFFORT,
        started: new Date(started).toISOString(),
        wallMs: Date.now() - started,
        generationSeconds: (Date.now() - started) / 1000,
        moduleBytes: code ? Buffer.byteLength(code) : 0,
        replyHadThinkingBlock: (reply.body?.content ?? []).some(
          (block) => block.type === "thinking" || block.type === "redacted_thinking",
        ),
        status: reply.status,
        hasCode: Boolean(code),
        error: attempts.at(-1).error,
        stopReason: reply.body?.stop_reason ?? null,
        finishReason: reply.body?.stop_reason ?? null,
        modelCalls: attempts.length,
        generationCalls: 1,
        redrawCalls: attempts.length - 1,
        noWriteReplies: attempts.filter((item) => !item.hasCode).length,
        attempts,
        costUsd,
        usage: {
          ...usage,
          prompt_tokens: usage.input_tokens + usage.cache_read_input_tokens + usage.cache_creation_input_tokens,
          completion_tokens: usage.output_tokens,
        },
      });
      if (reservation) rmSync(reservation);
      active--;
      for (const resume of budgetWaiters.splice(0)) resume();
      if (code) {
        const file = join(dir, "builds", slug + ".ts");
        text(file, wireArchived(code, file));
        break;
      }
    }
    console.log(
      slug,
      code ? Buffer.byteLength(code) + " bytes" : "FAILED",
      attempts.length + " requests",
      "$" + costUsd.toFixed(3),
    );
  }
  try {
    await Promise.all(
      Array.from({ length: SINGLE_WORKERS }, async () => {
        while (queue.length && !paused) {
          const subject = queue.shift();
          if (subject) await build(subject);
        }
      }),
    );
  } finally {
    gw.close();
  }
  results(round);
  if (paused) {
    save(join(INPUT, "stopped.json"), { reason: paused, spent: singleSpend(), at: new Date().toISOString() });
    console.log("PAUSED: " + paused);
    return;
  }
  if (!process.argv.includes("--generation-only")) {
    await checkedAndRepaired(round);
    console.log("Single-run total including repairs: $" + singleSpend().toFixed(3));
  }
}

async function runApp() {
  if (!/^r18app[a-z0-9]*$/.test(APP_ROUND)) throw Error("Invalid app round: " + APP_ROUND);
  const round = APP_ROUND,
    dir = join(BASE, "rounds", round),
    manifest = json(join(INPUT, "manifest.json"));
  save(join(dir, "round.json"), {
    id: round,
    started: existsSync(join(dir, "round.json"))
      ? (json(join(dir, "round.json")).started ?? new Date().toISOString())
      : new Date().toISOString(),
    model: MODEL,
    effort: "high",
    maxTokens: 120000,
    maxExtraCalls: 16,
    subjects: allPitches,
    arms: [
      {
        ...craft,
        id: "app",
        name: "Agent framing (app)",
        idea: "Fixed campaign template, current docs, virtual write/edit/typecheck loop, no renders.",
      },
    ],
    styleKitMapping: manifest.styleKitMapping,
    additionalKits: manifest.additionalKits,
    briefTemplate: manifest.briefTemplate,
    toolPolicy: manifest.toolPolicy,
    systemSource: manifest.systemSource,
    visiblePaths: [
      "src/",
      "kits/",
      "docs/",
      "scripts/",
      "GUIDE.md",
      "package.json",
      "tsconfig*.json",
      "samples/<own-slug>.ts only",
    ],
    renderRefusalNudgeAfter: 3,
  });
  text(join(dir, "prompts/app.md"), manifest.systemPrompt.join("\n\n"));
  mkdirSync(join(dir, "builds"), { recursive: true });
  mkdirSync(join(dir, "checks"), { recursive: true });
  // OMP's native editor is platform-local. Using it preserves the reconstructed hashline schema's exact semantics.
  const lib = join(homedir(), ".bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/src");
  const { ReadTool, EditTool } = await import(join(lib, "tools/index.ts"));
  const { Settings } = await import(join(lib, "config/settings.ts"));
  const { getEditStore } = await import(join(lib, "edit/store.ts"));
  const settings = await Settings.loadReadOnly({ cwd: ROOT });
  settings.override("edit.autoRepair.enabled", false);
  let spent = readdirSync(join(BASE, "rounds"))
    .filter((name) => name.startsWith("r18app"))
    .flatMap((r) =>
      existsSync(join(BASE, "rounds", r, "runs"))
        ? readdirSync(join(BASE, "rounds", r, "runs"))
            .filter((name) => name.endsWith(".json"))
            .map((name) => json(join(BASE, "rounds", r, "runs", name)).costUsd ?? 0)
        : [],
    )
    .reduce((a, b) => a + b, 0);
  let activeRequests = 0,
    paused = "";
  const gw = gateway();
  const queue = allPitches.filter(
    (subject) =>
      !existsSync(join(dir, "runs", round + subject.id[0].toUpperCase() + subject.id.slice(1) + "RichApp.json")),
  );
  async function build(subject: (typeof allPitches)[number]) {
    const slug = round + subject.id[0].toUpperCase() + subject.id.slice(1) + "RichApp";
    const input = json(join(INPUT, subject.id + ".json")),
      workspace = input.workspace;
    const sandbox = new AppSandbox(ROOT, workspace, subject.id);
    const logicalSample = sandbox.logicalSample,
      sample = sandbox.sample;
    const session = {
      cwd: workspace,
      settings,
      enableLsp: false,
      hasEditTool: true,
      taskDepth: 1,
      enableIrc: false,
      getSessionId: () => slug,
      getSessionFile: () => undefined,
      getSessionSpawns: () => "*",
    };
    const reader = new ReadTool(session),
      editor = new EditTool(session, "hashline"),
      store = getEditStore(session);
    const counts = {
      writes: 0,
      edits: 0,
      editCalls: 0,
      failedEdits: 0,
      typecheckCalls: 0,
      refusedCalls: 0,
      renderRefusals: 0,
      scratchCalls: 0,
    };
    const toolLog: { call: AppCall; text: string; isError: boolean }[] = [];
    const body = anthropicRequest(input.context);
    const started = Date.now(),
      usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
    let costUsd = 0,
      modelCalls = 0,
      stopReason = "cap",
      status = 200,
      error: string | null = null;
    const ownFile = (path: string) => sandbox.isSample(path);
    async function handle(call: AppCall): Promise<{ text: string; isError: boolean; renderRefused?: boolean }> {
      const args = call.input;
      try {
        if (call.name === "yield") return { text: "", isError: false };
        if (call.name === "write") {
          if (!ownFile(String(args.path ?? ""))) {
            counts.refusedCalls++;
            return {
              text: String(args.path ?? "").includes("scratch/")
                ? APP_UNAVAILABLE
                : "No such file or directory: " + String(args.path ?? ""),
              isError: true,
              renderRefused: String(args.path ?? "").includes("scratch/"),
            };
          }
          const content = String(args.content ?? "");
          text(sample, content);
          counts.writes++;
          const lines = content ? content.split("\n").length - (content.endsWith("\n") ? 1 : 0) : 0;
          const tag = store.recordSnapshot(
            sample,
            content,
            Array.from({ length: lines }, (_, i) => i + 1),
          );
          return {
            text: "Wrote " + lines + " lines" + (tag ? "\n[" + logicalSample + "#" + tag + "]" : ""),
            isError: false,
          };
        }
        if (call.name === "edit") {
          counts.editCalls++;
          const patch = String(args.input ?? "");
          const headers = [...patch.matchAll(/^\[([^\]\n]+)#([A-Fa-f0-9]{4})\]\s*$/gm)];
          if (!headers.length || headers.some((header) => !ownFile(header[1])))
            throw Error("Edits may only target " + logicalSample + " using its read snapshot.");
          for (const move of patch.matchAll(/^MV\s+(.+)$/gm))
            if (!ownFile(move[1].replace(/^['"]|['"]$/g, "")))
              throw Error("The sample may not be moved outside its delivery path.");
          const mapped = patch
            .replace(/^\[([^\]\n]+)#([A-Fa-f0-9]{4})\]\s*$/gm, (_match, _path, tag) => "[" + sample + "#" + tag + "]")
            .replace(/^MV\s+.+$/gm, "MV " + sample);
          const result = await editor.execute(call.id, { input: mapped });
          const output = result.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n")
            .replaceAll(sample, logicalSample);
          if (result.isError) counts.failedEdits++;
          else counts.edits++;
          return { text: output, isError: result.isError === true };
        }
        if (call.name === "read") {
          const raw = String(args.path ?? "");
          const selector = raw.match(/:(?:\d|-|raw|img|conflicts).*$/)?.[0] ?? "",
            base = selector ? raw.slice(0, -selector.length) : raw;
          const physical = sandbox.path(base);
          const result = await reader.execute(call.id, { path: physical + selector });
          return {
            text: result.content
              .filter((block) => block.type === "text")
              .map((block) => block.text)
              .join("\n")
              .replaceAll(sample, logicalSample),
            isError: result.isError === true,
          };
        }
        if (call.name === "glob") {
          const files = await sandbox.glob(String(args.path ?? "*"));
          return { text: files.join("\n") || "(no matches)", isError: false };
        }
        if (call.name === "grep") {
          const path = sandbox.path(String(args.path ?? ".").replace(/:\d.*$/, ""));
          const result = await capture("grep", ["-R", "-n", "-E", "--", String(args.pattern ?? ""), path], 60000);
          return {
            text: (result.stdout + result.stderr).replaceAll(workspace + "/", "") || "(no matches)",
            isError: result.status !== 0 && result.status !== 1,
          };
        }
        if (call.name === "bash") {
          const inspection = await sandbox.inspect(
            String(args.command ?? ""),
            typeof args.cwd === "string" ? args.cwd : undefined,
          );
          if (inspection.kind === "typecheck") {
            counts.typecheckCalls++;
            if (!existsSync(sample)) return { text: "No stored sample exists yet: " + logicalSample, isError: true };
            const temporary = join(workspace, "typecheck.ts");
            text(temporary, wireArchived(readFileSync(sample, "utf8"), temporary));
            const result = await capture(
              join(ROOT, "node_modules/.bin/tsx"),
              ["scripts/typecheck.ts", temporary],
              180000,
            );
            rmSync(temporary, { force: true });
            const output = (result.stdout + result.stderr)
              .replaceAll(temporary, logicalSample)
              .replaceAll(relative(ROOT, temporary), logicalSample);
            if (inspection.renderRequested) {
              counts.refusedCalls++;
              return { text: output + "\n" + APP_UNAVAILABLE, isError: true, renderRefused: true };
            }
            return { text: output, isError: result.status !== 0 };
          }
          if (inspection.kind === "unavailable") {
            counts.refusedCalls++;
            return { text: APP_UNAVAILABLE, isError: true, renderRefused: inspection.renderRequested === true };
          }
          if (inspection.kind === "scratch") counts.scratchCalls++;
          return { text: inspection.text, isError: inspection.isError };
        }
        counts.refusedCalls++;
        return { text: APP_UNAVAILABLE, isError: true, renderRefused: true };
      } catch (failure) {
        if (call.name === "edit") counts.failedEdits++;
        return { text: "Tool error: " + String(failure), isError: true };
      }
    }
    try {
      for (let turn = 0; turn <= 16; turn++) {
        if (paused) {
          stopReason = paused;
          break;
        }
        if (spent + (activeRequests + 1) * 1.6 > 87) {
          paused = "spend guard: approaching $90 including repair reserve";
          save(join(INPUT, "stopped.json"), { reason: paused, spent, slug, at: new Date().toISOString() });
          stopReason = paused;
          break;
        }
        if (!(await guard(slug + " model call " + (turn + 1)))) {
          paused = "usage guard";
          stopReason = paused;
          break;
        }
        save(join(dir, "requests", slug + "-" + (turn + 1) + ".json"), body);
        activeRequests++;
        const reply = await gw.send("/v1/messages", body);
        activeRequests--;
        modelCalls++;
        status = reply.status;
        save(join(dir, "replies", slug + "-" + (turn + 1) + ".json"), reply);
        const used = reply.body?.usage ?? {};
        for (const key of Object.keys(usage)) usage[key] += used[key] ?? 0;
        const amount =
          ((used.input_tokens ?? 0) * 2 +
            (used.cache_read_input_tokens ?? 0) * 0.1 +
            (used.cache_creation_input_tokens ?? 0) * 2.5 +
            (used.output_tokens ?? 0) * 10) /
          1e6;
        spent += amount;
        costUsd += amount;
        save(join(INPUT, "spend.json"), { spent, at: new Date().toISOString() });
        if (reply.status !== 200) {
          error = JSON.stringify(reply.body);
          stopReason = "API error";
          break;
        }
        const calls: AppCall[] = (reply.body.content ?? [])
          .filter((block) => block.type === "tool_use")
          .map((block) => ({ id: block.id, name: block.name, input: block.input ?? {} }));
        if (!calls.length) {
          stopReason = "natural";
          break;
        }
        const toolResults = [];
        for (const call of calls) {
          const result = await handle(call);
          if (result.renderRefused) {
            counts.renderRefusals++;
            if (counts.renderRefusals >= 3)
              result.text +=
                "\nRendering is impossible in this environment. If the file is complete, end your turn with a one-line summary.";
          }
          toolLog.push({ call, ...result });
          toolResults.push({
            type: "tool_result",
            tool_use_id: call.id,
            content: result.text,
            is_error: result.isError,
          });
        }
        save(join(dir, "tools", slug + ".json"), toolLog);
        if (calls.some((call) => call.name === "yield")) {
          stopReason = "yield";
          break;
        }
        body.messages.push({ role: "assistant", content: reply.body.content }, { role: "user", content: toolResults });
      }
      const code = existsSync(sample) ? readFileSync(sample, "utf8") : null;
      const buildFile = join(dir, "builds", slug + ".ts");
      if (code) text(buildFile, wireArchived(code, buildFile));
      save(join(dir, "runs", slug + ".json"), {
        slug,
        arm: "app",
        subject: subject.id,
        level: "rich",
        pitch: subject.rich,
        model: MODEL,
        effort: "high",
        started: new Date(started).toISOString(),
        wallMs: Date.now() - started,
        status,
        error: error ?? (code ? null : "No stored sample at end of turn"),
        hasCode: Boolean(code),
        stopReason,
        modelCalls,
        extraCalls: Math.max(0, modelCalls - 1),
        ...counts,
        costUsd,
        usage: {
          ...usage,
          prompt_tokens: usage.input_tokens + usage.cache_read_input_tokens + usage.cache_creation_input_tokens,
          completion_tokens: usage.output_tokens,
        },
      });
      console.log(
        slug,
        stopReason,
        modelCalls + " calls",
        counts.writes + "/" + counts.edits + " writes/edits",
        code ? Buffer.byteLength(code) + " bytes" : "NO CODE",
        "$" + costUsd.toFixed(3),
      );
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  }
  try {
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (queue.length && !paused) {
          const subject = queue.shift();
          if (subject) await build(subject);
        }
      }),
    );
  } finally {
    gw.close();
  }
  results(round);
  if (!paused) await checkedAndRepaired(round);
  else {
    await cmd(["check", round, "--skip-typecheck", "--concurrency", "2"]);
    console.log("PAUSED: " + paused + ", spent $" + spent.toFixed(3));
  }
}

// Argon keeps the frozen single-run conversation, with independent transport and quota accounting.
type ArgonBlock = { type: string; text?: string; id?: string; name?: string; arguments?: Record<string, unknown> };
type ArgonContext = {
  systemPrompt: string[];
  messages: { role: string; content: ArgonBlock[]; toolCallId?: string; isError?: boolean }[];
  tools: { name: string; description: string; parameters: Record<string, unknown> }[];
};
type ArgonTokens = {
  input_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
  output_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  reasoning_tokens: number | null;
};
type ArgonExtraction = {
  code: string | null;
  moduleSource: string | null;
  returnedTools: { name: string; path: unknown }[];
  usage: ArgonTokens;
  providerUsage: unknown;
  stopReason: string | null;
  capHit: boolean;
  costUsd: number;
};
type ArgonAttempt = Omit<ArgonExtraction, "code"> & {
  request: number;
  kind: string;
  path: string;
  status: number;
  started: string;
  wallMs: number;
  timeToFirstByteMs: null;
  timeToFirstByteNote: string;
  hasCode: boolean;
  retry: boolean;
  transportFallback: boolean;
  error: string | null;
  backoffMs?: number;
};
type ArgonResponse = { code: string | null; moduleSource: string | null; attempts: ArgonAttempt[]; status: number };
const argonUsage = { stopped: false };
async function guardArgon(label: string) {
  if (argonUsage.stopped) return false;
  const poolPath = process.env.OMP_AUTH_BROKER_ACCOUNT_POOL_FILE;
  const identities: string[] | undefined = poolPath ? json(poolPath)["google-antigravity"] : undefined;
  if (poolPath)
    await capture(join(homedir(), ".local/bin/omp"), ["usage", "invalidate", "-p", "google-antigravity"], 60000);
  const reading = await capture(
    join(homedir(), ".local/bin/omp"),
    ["usage", "-p", "google-antigravity", "--json"],
    60000,
  );
  if (reading.status !== 0) throw Error("Could not read Gemini quota; no further requests sent");
  const data = JSON.parse(reading.stdout);
  const allReports = data.reports ?? [];
  const selected = allReports.filter(
    (report: { metadata?: { email?: string } }) =>
      !identities || identities.includes("email:" + report.metadata?.email),
  );
  const values: number[] = [];
  const weeklyValues: number[] = [];
  for (const report of selected)
    for (const limit of report.limits ?? []) {
      if (limit.label !== "Gemini") continue;
      if (limit.window?.id === "5h" && typeof limit.amount?.used === "number") values.push(limit.amount.used);
      if (limit.window?.id === "weekly" && typeof limit.amount?.used === "number") weeklyValues.push(limit.amount.used);
    }
  save(join(INPUT, "usage-" + Date.now() + ".json"), {
    label,
    at: new Date().toISOString(),
    ...reading,
    values,
    weeklyValues,
    accountPool: identities ?? null,
    reports: selected,
    unavailableAccounts: selected.filter(
      (report: { limits: { label: string; window?: { id: string } }[] }) =>
        !report.limits.some((limit) => limit.label === "Gemini" && limit.window?.id === "5h"),
    ).length,
  });
  if (!selected.length || (!values.length && !weeklyValues.length))
    throw Error("No selected-account Gemini quota reported; no request sent");
  if (values.some((v) => v > 80) || (identities && weeklyValues.some((v) => v > 60))) {
    argonUsage.stopped = true;
    save(join(INPUT, "stopped.json"), {
      reason: "Gemini quota guard (5 Hour >80% or selected-account Weekly >60%)",
      label,
      values,
      weeklyValues,
      accountPool: identities,
    });
  }
  return !argonUsage.stopped;
}
function argonRequest(context: ArgonContext, path: string) {
  if (path === "/v1/messages") {
    const request = anthropicRequest(context);
    return { ...request, max_tokens: 65536 };
  }
  const messages: Record<string, unknown>[] = [{ role: "system", content: context.systemPrompt.join("\n\n") }];
  for (const message of context.messages) {
    if (message.role === "toolResult") {
      messages.push({
        role: "tool",
        tool_call_id: message.toolCallId,
        content: message.content.map((block) => block.text ?? "").join("\n"),
      });
    } else {
      const calls = message.content.filter((block) => block.type === "toolCall");
      messages.push({
        role: message.role,
        content:
          message.content
            .filter((block) => block.type === "text")
            .map((block) => block.text ?? "")
            .join("\n") || null,
        ...(calls.length
          ? {
              tool_calls: calls.map((block) => ({
                id: block.id,
                type: "function",
                function: { name: block.name, arguments: JSON.stringify(block.arguments) },
              })),
            }
          : {}),
      });
    }
  }
  return {
    model: MODEL,
    max_tokens: 65536,
    stream: false,
    reasoning_effort: SINGLE_EFFORT,
    messages,
    tools: context.tools.map((tool) => ({
      type: "function",
      function: { name: tool.name, description: tool.description, parameters: tool.parameters },
    })),
    tool_choice: "auto",
  };
}
// The existing gateway owns JSON parsing; retain the complete raw body, then normalize only measured fields.
function argonExtract(body: unknown, subject: string): ArgonExtraction {
  const parsed = JSON.parse(JSON.stringify(body));
  const message = parsed?.choices?.[0]?.message;
  const calls: AppCall[] = message
    ? (message.tool_calls ?? []).flatMap((call: { id: string; function?: { name: string; arguments: string } }) => {
        try {
          const input: unknown = JSON.parse(call.function?.arguments ?? "{}");
          return input && typeof input === "object" && !Array.isArray(input) && call.function?.name
            ? [{ id: call.id, name: call.function.name, input: Object.fromEntries(Object.entries(input)) }]
            : [];
        } catch {
          return [];
        }
      })
    : singleTools(parsed?.content);
  const write = calls
    .filter(
      (call) =>
        call.name === "write" &&
        typeof call.input.path === "string" &&
        /(?:^|\/)samples\/[^/]+\.ts$/.test(call.input.path) &&
        call.input.path.endsWith("/" + subject + ".ts") &&
        typeof call.input.content === "string",
    )
    .at(-1);
  const prose =
    message?.content ??
    (parsed?.content ?? [])
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("\n");
  const fences =
    typeof prose === "string"
      ? [...prose.matchAll(/```(?:ts|typescript|tsx|js|javascript)?[^\n]*\n([\s\S]*?)```/g)]
          .map((m) => m[1])
          .sort((a, b) => b.length - a.length)
      : [];
  const code = typeof write?.input.content === "string" ? write.input.content : (fences[0] ?? null);
  const raw = parsed?.usage ?? {};
  const cached: number = raw.cache_read_input_tokens ?? raw.prompt_tokens_details?.cached_tokens ?? 0;
  const input: number = raw.input_tokens ?? Math.max(0, (raw.prompt_tokens ?? 0) - cached);
  const output: number = raw.output_tokens ?? raw.completion_tokens ?? 0;
  const cacheWrite: number = raw.cache_creation_input_tokens ?? 0;
  const reasoning: number | null =
    raw.reasoning_tokens ??
    raw.completion_tokens_details?.reasoning_tokens ??
    raw.output_tokens_details?.reasoning_tokens ??
    null;
  const stop: string | null = parsed?.stop_reason ?? parsed?.choices?.[0]?.finish_reason ?? null;
  return {
    code,
    moduleSource: write ? "tool_call" : code ? "fenced_text" : null,
    returnedTools: calls.map((call) => ({ name: call.name, path: call.input.path })),
    usage: {
      input_tokens: input,
      cache_read_input_tokens: cached,
      cache_creation_input_tokens: cacheWrite,
      output_tokens: output,
      prompt_tokens: input + cached + cacheWrite,
      completion_tokens: output,
      reasoning_tokens: reasoning,
    },
    providerUsage: raw,
    stopReason: stop,
    capHit: output >= 65536 || ["length", "max_tokens"].includes(stop ?? ""),
    costUsd: ((input + cacheWrite) * 2 + cached * 0.1 + output * 10) / 1e6,
  };
}
async function argonCall(
  gw: { send(path: string, body: unknown): Promise<{ status: number; body: unknown }> },
  dir: string,
  slug: string,
  subject: string,
  context: ArgonContext,
  kind: string,
): Promise<ArgonResponse> {
  const roundPath = join(dir, "round.json");
  const round = json(roundPath);
  let path: string = round.transport ?? "/v1/messages";
  const existingPath = join(dir, "runs", slug + ".json");
  const previous = process.argv.includes("--retry-blocked") && existsSync(existingPath) ? json(existingPath) : null;
  const partialPath = join(dir, "replies", slug + "-attempts.json");
  const attempts: ArgonAttempt[] = previous?.attempts
    ? [...previous.attempts]
    : process.argv.includes("--retry-blocked") && existsSync(partialPath)
      ? json(partialPath)
      : [];
  const priorRequestNumbers = readdirSync(join(dir, "requests")).flatMap((name) => {
    const match = name.match(new RegExp("^" + slug + "-(\\d+)\\.json$"));
    return match ? [Number(match[1])] : [];
  });
  const offset = Math.max(attempts.length, ...priorRequestNumbers);
  for (let attempt = 1; attempt <= 8; attempt++) {
    if (!(await guardArgon(slug + " " + kind + " request " + attempt))) break;
    const body = argonRequest(context, path);
    const sent = Date.now();
    save(join(dir, "requests", slug + "-" + (offset + attempt) + ".json"), body);
    const reply = await gw.send(path, body);
    save(join(dir, "replies", slug + "-" + (offset + attempt) + ".json"), reply);
    const extracted = argonExtract(reply.body, subject);
    const retryable =
      reply.status === 429 ||
      reply.status >= 500 ||
      /overload|rate.?limit/i.test(reply.status === 200 ? "" : JSON.stringify(reply.body));
    const fallback =
      path === "/v1/messages" &&
      !retryable &&
      (reply.status !== 200 || (!extracted.code && !extracted.returnedTools.length));
    const { code, ...measurements } = extracted;
    attempts.push({
      request: offset + attempt,
      kind,
      path,
      status: reply.status,
      started: new Date(sent).toISOString(),
      wallMs: Date.now() - sent,
      timeToFirstByteMs: null,
      timeToFirstByteNote: "Not observable: gateway stdio returns a buffered non-streaming reply",
      ...measurements,
      hasCode: Boolean(code),
      retry: retryable,
      transportFallback: fallback,
      error:
        reply.status !== 200 ? JSON.stringify(reply.body) : !code ? "Reply contained no complete sample module" : null,
    });
    const manifest = json(roundPath);
    manifest.providerResponses ??= {};
    manifest.providerResponses[slug] = attempts.map((item) => ({
      request: item.request,
      path: item.path,
      status: item.status,
      sent:
        item.path === "/v1/messages"
          ? { max_tokens: 65536, thinking: { type: "adaptive" }, output_config: { effort: SINGLE_EFFORT } }
          : { max_tokens: 65536, reasoning_effort: SINGLE_EFFORT, tool_choice: "auto" },
      usage: item.providerUsage,
      stopReason: item.stopReason,
    }));
    if (reply.status === 200 && code) manifest.transport = path;
    save(roundPath, manifest);
    if (reply.status === 200 && code)
      return { code, moduleSource: extracted.moduleSource, attempts, status: reply.status };
    if (fallback) {
      path = "/v1/chat/completions";
      continue;
    }
    if (retryable && attempt < 8) {
      const delay = Math.min(120000, 10000 * 2 ** (attempt - 1));
      attempts[attempts.length - 1].backoffMs = delay;
      save(join(dir, "replies", slug + "-attempts.json"), attempts);
      await Bun.sleep(delay);
      continue;
    }
    // One fresh no-write redraw, never a continuation with tool results.
    if (
      kind === "generation" &&
      reply.status === 200 &&
      attempts.filter((item) => item.status === 200 && !item.transportFallback).length < 2
    )
      continue;
    return { code, moduleSource: extracted.moduleSource, attempts, status: reply.status };
  }
  return { code: null, moduleSource: null, attempts, status: attempts.at(-1)?.status ?? 0 };
}
function saveArgonRun(
  dir: string,
  slug: string,
  subject: { id: string; rich: string },
  started: number,
  response: ArgonResponse,
  from?: string,
) {
  const usage: ArgonTokens = {
    input_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
    output_tokens: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    reasoning_tokens: null,
  };
  for (const attempt of response.attempts) {
    for (const key of [
      "input_tokens",
      "cache_read_input_tokens",
      "cache_creation_input_tokens",
      "output_tokens",
      "prompt_tokens",
      "completion_tokens",
    ] as const)
      usage[key] += attempt.usage[key];
    if (attempt.usage.reasoning_tokens !== null)
      usage.reasoning_tokens = (usage.reasoning_tokens ?? 0) + attempt.usage.reasoning_tokens;
  }
  const previousPath = join(dir, "runs", slug + ".json");
  const previous = existsSync(previousPath) ? json(previousPath) : null;
  const run = {
    slug,
    arm: "single",
    subject: subject.id,
    level: "rich",
    pitch: subject.rich,
    model: MODEL,
    effort: SINGLE_EFFORT,
    started: previous?.started ?? new Date(started).toISOString(),
    wallMs: (previous?.wallMs ?? 0) + Date.now() - started,
    status: response.status,
    from,
    mode: from ? "repair" : "generation",
    hasCode: Boolean(response.code),
    moduleBytes: response.code ? Buffer.byteLength(response.code) : 0,
    moduleSource: response.moduleSource,
    usage,
    costUsd: response.attempts.reduce((sum, attempt) => sum + attempt.costUsd, 0),
    modelCalls: response.attempts.length,
    generationCalls: from ? 0 : 1,
    redrawCalls: Math.max(
      0,
      response.attempts.filter((a) => a.status === 200 && !a.hasCode && !a.transportFallback).length,
    ),
    attempts: response.attempts,
    retries: response.attempts.filter((a) => a.retry),
    capHit: response.attempts.some((a) => a.capHit),
    stopReason: response.attempts.at(-1)?.stopReason ?? null,
    finishReason: response.attempts.at(-1)?.stopReason ?? null,
    error: response.code ? null : (response.attempts.at(-1)?.error ?? "Stopped by usage guard"),
  };
  save(join(dir, "runs", slug + ".json"), run);
  if (response.code) {
    const file = join(dir, "builds", slug + ".ts");
    text(file, wireArchived(response.code, file));
  }
  console.log(
    slug,
    run.hasCode ? run.moduleBytes + " bytes" : run.error,
    run.modelCalls + " requests",
    "$" + run.costUsd.toFixed(4),
  );
}
function initArgonRound(round: string, from?: string) {
  const dir = join(BASE, "rounds", round);
  for (const name of ["builds", "checks", "replies", "requests", "runs"])
    mkdirSync(join(dir, name), { recursive: true });
  const previous = existsSync(join(dir, "round.json")) ? json(join(dir, "round.json")) : {};
  const manifest = json(join(INPUT, "manifest.json"));
  save(join(dir, "round.json"), {
    ...previous,
    id: round,
    started: previous.started ?? new Date().toISOString(),
    model: MODEL,
    effort: SINGLE_EFFORT,
    maxTokens: 65536,
    workers: SINGLE_WORKERS,
    subjects: manifest.subjects,
    source: manifest.source,
    refineFrom: from ?? null,
    arms: [{ ...craft, id: "single", name: "Gemini 4 Argon · " + SINGLE_EFFORT + " · single-run" }],
    requestPolicy:
      "Frozen r19single context; signed Anthropic thinking removed; messages first, chat-completions fallback on rejection or malformed tool reply; automatic write or fenced module extraction",
    requestedControls: {
      messages: { thinking: { type: "adaptive" }, output_config: { effort: SINGLE_EFFORT }, max_tokens: 65536 },
      chatCompletions: { reasoning_effort: SINGLE_EFFORT, max_tokens: 65536 },
    },
    reasoningEvidence:
      "providerResponses preserves exact reported usage; null reasoning tokens mean not reported, not zero",
    effortEvidence:
      "omp models lists low, medium, high for this selector; gateway anthropic-messages-server maps output_config.effort to options.reasoning; openai-chat-server maps reasoning_effort likewise. Provider reply does not echo its effective effort.",
    providerEchoedEffort: null,
    reasoningReportLimitation:
      "The gateway messages adapter encodeUsage exposes input/output/cache counts but omits internal reasoningTokens. Reasoning counts are unavailable through this successful transport; estimated non-code residual is recorded separately.",
    pricingUsdPerMillion: { input: 2, output: 10, cacheRead: 0.1 },
  });
  return dir;
}
async function runArgon() {
  const dir = initArgonRound(SINGLE_ROUND);
  const gw = gateway();
  try {
    const queue = allPitches.filter((subject) => {
      const path = join(
        dir,
        "runs",
        SINGLE_ROUND + subject.id[0].toUpperCase() + subject.id.slice(1) + "RichSingle.json",
      );
      return !existsSync(path) || (process.argv.includes("--retry-blocked") && !json(path).hasCode);
    });
    await Promise.all(
      Array.from({ length: SINGLE_WORKERS }, async () => {
        while (queue.length && !argonUsage.stopped) {
          const subject = queue.shift();
          if (!subject) continue;
          const slug = SINGLE_ROUND + subject.id[0].toUpperCase() + subject.id.slice(1) + "RichSingle";
          const started = Date.now();
          const response = await argonCall(
            gw,
            dir,
            slug,
            subject.id,
            json(join(INPUT, subject.id + ".json")).context,
            "generation",
          );
          saveArgonRun(dir, slug, subject, started, response);
        }
      }),
    );
  } finally {
    gw.close();
  }
  results(SINGLE_ROUND);
  if (!process.argv.includes("--generation-only") && !argonUsage.stopped) await checkArgon();
}
async function checkArgon() {
  await cmd(["check", SINGLE_ROUND, "--skip-typecheck", "--concurrency", "2"]);
  for (let turn = 1; turn <= 2 && !argonUsage.stopped; turn++) {
    const latest = new Map();
    for (const round of turn === 1 ? [SINGLE_ROUND] : [SINGLE_ROUND + "fix", SINGLE_ROUND]) {
      const path = join(BASE, "rounds", round, "results.json");
      for (const entry of existsSync(path) ? json(path) : [])
        if (!latest.has(entry.subject) || (!latest.get(entry.subject).entry.hasCode && entry.hasCode))
          latest.set(entry.subject, { round, entry });
    }
    const failures = [...latest.values()].filter(({ entry }) => !entry.hasCode || entry.check?.rendered === false);
    if (!failures.length) break;
    const next = SINGLE_ROUND + (turn === 1 ? "fix" : "fix2");
    const dir = initArgonRound(next, SINGLE_ROUND);
    const gw = gateway();
    try {
      for (const { round, entry } of failures) {
        const slug = next + entry.slug.slice(round.length);
        const runPath = join(dir, "runs", slug + ".json");
        if (existsSync(runPath) && (!process.argv.includes("--retry-blocked") || json(runPath).hasCode)) continue;
        const input = json(join(INPUT, entry.subject + ".json"));
        let file = join(BASE, "rounds", round, "builds", entry.slug + ".ts");
        if (!existsSync(file) && entry.from) {
          const previous = [SINGLE_ROUND + "fix", SINGLE_ROUND].find((source) =>
            existsSync(join(BASE, "rounds", source, "builds", entry.from + ".ts")),
          );
          if (previous) file = join(BASE, "rounds", previous, "builds", entry.from + ".ts");
        }
        input.context.messages.at(-1).content[0].text +=
          "\nRepair only this module's render crash, preserving the design. Return the entire corrected module in one write.\nError:\n" +
          (entry.check?.renderError ?? entry.error ?? "No complete module returned") +
          (existsSync(file) ? "\nCurrent module:\n```ts\n" + readFileSync(file, "utf8") + "\n```" : "");
        const started = Date.now();
        const response = await argonCall(gw, dir, slug, entry.subject, input.context, "repair");
        saveArgonRun(dir, slug, { id: entry.subject, rich: entry.pitch }, started, response, entry.slug);
      }
    } finally {
      gw.close();
    }
    results(next);
    await cmd(["check", next, "--skip-typecheck", "--concurrency", "2"]);
  }
}
async function reportArgon() {
  await capture(join(homedir(), ".local/bin/omp"), ["usage", "invalidate", "-p", "google-antigravity"], 60000);
  await guardArgon(SINGLE_ROUND + " after");
  const script = String.raw`
import json, statistics, sys
from pathlib import Path
import tiktoken
base = Path("bakeoff")
enc = tiktoken.get_encoding("o200k_base")
def load(path, fallback=None):
    return json.loads(path.read_text()) if path.exists() else fallback
def dist(values):
    values = [v for v in values if v is not None]
    return {"median": statistics.median(values), "range": [min(values), max(values)]} if values else None
def summarize(round_name):
    manifest = load(base / (round_name + "-inputs") / "manifest.json", {})
    subjects = [s["id"] for s in manifest.get("subjects", [])]
    blocker = load(base / (round_name + "-inputs") / "stopped.json")
    by_subject = {s: [] for s in subjects}
    for suffix in ("", "fix", "fix2"):
        source = round_name + suffix
        root = base / "rounds" / source
        saved = [(path, load(path)) for path in sorted((root / "runs").glob("*.json"))]
        known = {run["slug"] for _, run in saved}
        for ledger in sorted((root / "replies").glob("*-attempts.json")):
            slug = ledger.name.removesuffix("-attempts.json")
            if slug in known:
                continue
            attempts = load(ledger, [])
            subject = next((s for s in subjects if slug == source + s[0].upper() + s[1:] + "RichSingle"), None)
            if not attempts or subject is None:
                continue
            saved.append((root / "runs" / (slug + ".json"), {"slug": slug, "subject": subject,
                "hasCode": False, "status": attempts[-1]["status"], "attempts": attempts,
                "modelCalls": len(attempts), "interrupted": True, "error": attempts[-1].get("error"),
                "wallMs": sum(a["wallMs"] + a.get("backoffMs", 0) for a in attempts),
                "usage": {key: sum(a.get("usage", {}).get(key, 0) or 0 for a in attempts) for key in
                    ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens", "output_tokens")},
                "costUsd": sum(a.get("costUsd", 0) for a in attempts)}))
        for path, run in saved:
            subject = run["subject"]
            build = path.parent.parent / "builds" / (run["slug"] + ".ts")
            check = load(path.parent.parent / "checks" / (run["slug"] + ".json"), {})
            usage = run.get("usage", {})
            output = usage.get("output_tokens", usage.get("completion_tokens"))
            code_tokens = len(enc.encode(build.read_text())) if build.exists() else None
            reported_reasoning = usage.get("reasoning_tokens")
            raw_input = usage.get("input_tokens", 0) + usage.get("cache_creation_input_tokens", 0)
            cached = usage.get("cache_read_input_tokens", 0)
            attempts = run.get("attempts", [])
            item = {"round": source, "slug": run["slug"], "subject": subject, "repair": bool(suffix),
                "wall_seconds": run.get("wallMs", 0) / 1000,
                "request_wall_seconds": [a["wallMs"] / 1000 for a in attempts],
                "time_to_first_byte_ms": None, "time_to_first_byte_note": "Not observable in buffered gateway replies",
                "input_tokens": raw_input, "cached_input_tokens": cached, "output_tokens": output,
                "reasoning_tokens": reported_reasoning,
                "reasoning_share": reported_reasoning / output if reported_reasoning is not None and output else None,
                "estimated_code_tokens": code_tokens,
                "estimated_non_code_share": 1 - code_tokens / output if code_tokens is not None and output else None,
                "estimated_cost_usd": run.get("costUsd"),
                "list_price_cost_usd": (raw_input * 2 + cached * .1 + (output or 0) * 10) / 1e6,
                "module_bytes": build.stat().st_size if build.exists() else 0,
                "parts": (check.get("report") or {}).get("parts"),
                "triangles": (check.get("report") or {}).get("triangles"),
                "textures": (check.get("report") or {}).get("textures"),
                "has_code": run.get("hasCode", build.exists()), "status": run.get("status"),
                "rendered": check.get("rendered", False if not run.get("hasCode") else None), "render_error": check.get("renderError") or run.get("error"),
                "stop_reason": run.get("stopReason", run.get("finishReason")),
                "cap_hit": run.get("capHit", (output or 0) >= (120000 if round_name == "r19single" else 65536)),
                "retries": run.get("retries", [a for a in attempts if a.get("status", 200) == 429 or a.get("status", 200) >= 500]),
                "retry_requests": [a for index, a in enumerate(attempts) if index > 0 and
                    (attempts[index-1].get("status", 200) == 429 or attempts[index-1].get("status", 200) >= 500)],
                "api_error_replies": [a for a in attempts if a.get("status", 200) != 200],
                "module_source": run.get("moduleSource", "tool_call" if run.get("hasCode") else None),
                "requests": run.get("modelCalls", 1), "attempts": attempts}
            by_subject.setdefault(subject, []).append(item)
    builds = []
    for subject, chain in by_subject.items():
        initial = chain[0] if chain else None
        final = next((x for x in reversed(chain) if x["has_code"]), chain[-1] if chain else None)
        builds.append({"subject": subject, "attempted": bool(chain),
            "initial": initial, "repairs": chain[1:], "final": final,
            "initial_crash": (initial["rendered"] is False) if initial and initial["has_code"] else None,
            "initial_crash_error": initial["render_error"] if initial and initial["has_code"] and initial["rendered"] is False else None,
            "repair_count": sum(any(a.get("status") == 200 for a in x["attempts"]) for x in chain[1:]),
            "repair_stages_attempted": max(0, len(chain)-1), "final_rendered": final["rendered"] if final else None,
            "blocked_by_quota": bool(final and final["rendered"] is not True and
                ((blocker or {}).get("reason") == "blocked: quota" or (chain and chain[-1]["status"] == 429))),
            "outcome": "rendered" if final and final["rendered"] is True else "blocked: quota" if blocker else "not rendered",
            "pipeline_cost_usd": sum(x["estimated_cost_usd"] or 0 for x in chain),
            "pipeline_wall_seconds": sum(x["wall_seconds"] for x in chain)})
    initial = [b["initial"] for b in builds if b["initial"]]
    final = [b["final"] for b in builds if b["final"]]
    all_calls = [x for chain in by_subject.values() for x in chain]
    metrics = ["wall_seconds", "input_tokens", "cached_input_tokens", "output_tokens", "reasoning_tokens", "reasoning_share",
        "estimated_code_tokens", "estimated_non_code_share", "estimated_cost_usd", "list_price_cost_usd", "module_bytes", "parts", "triangles", "textures"]
    summary = {key: dist([x[key] for x in initial]) for key in metrics}
    summary.update({"request_wall_seconds": dist([v for x in all_calls for v in x["request_wall_seconds"]]),
        "successful_request_wall_seconds": dist([a["wallMs"] / 1000 for x in all_calls for a in x["attempts"] if a.get("status") == 200]),
        "api_error_request_wall_seconds": dist([a["wallMs"] / 1000 for x in all_calls for a in x["attempts"] if a.get("status", 200) != 200]),
        "final_module_bytes": dist([x["module_bytes"] for x in final]),
        "final_parts": dist([x["parts"] for x in final]), "final_triangles": dist([x["triangles"] for x in final]),
        "final_textures": dist([x["textures"] for x in final]),
        "pipeline_cost_usd": dist([b["pipeline_cost_usd"] for b in builds if b["attempted"]]),
        "pipeline_wall_seconds": dist([b["pipeline_wall_seconds"] for b in builds if b["attempted"]]),
        "attempted": len(initial), "subjects": len(builds), "rendered": sum(b["final_rendered"] is True for b in builds),
        "generated_modules": sum(x["has_code"] for x in initial),
        "initial_crashes": [b["subject"] for b in builds if b["initial_crash"]],
        "repairs": sum(b["repair_count"] for b in builds),
        "repair_subjects": [b["subject"] for b in builds if b["repair_count"]],
        "repair_stages_attempted": sum(b["repair_stages_attempted"] for b in builds),
        "blocked_by_quota": [b["subject"] for b in builds if b["blocked_by_quota"]],
        "failed": [b["subject"] for b in builds if b["final_rendered"] is False],
        "unchecked": [b["subject"] for b in builds if b["final_rendered"] is None],
        "cap_hits": [x["slug"] for x in all_calls if x["cap_hit"]],
        "retries": [{"slug": x["slug"], "request": a.get("request"), "status": a["status"]} for x in all_calls for a in x["retry_requests"]],
        "api_error_reply_count": sum(len(x["api_error_replies"]) for x in all_calls),
        "api_error_status_counts": {str(status): sum(a["status"] == status for x in all_calls for a in x["api_error_replies"])
            for status in sorted({a["status"] for x in all_calls for a in x["api_error_replies"]})},
        "module_sources": {source: sum(x["module_source"] == source for x in all_calls) for source in ("tool_call", "fenced_text")},
        "total_cost_usd": sum(x["estimated_cost_usd"] or 0 for x in all_calls),
        "total_list_price_cost_usd": sum(x["list_price_cost_usd"] for x in all_calls),
        "requests": sum(x["requests"] for x in all_calls)})
    usage = [load(path) for path in sorted((base / (round_name + "-inputs")).glob("usage-*.json"))]
    return {"round": round_name, "summary": summary, "builds": builds,
        "usage_before": usage[0] if usage else None, "usage_after": usage[-1] if usage else None,
        "blocker": blocker,
        "usage_note": "Zero normalized usage on API errors means the gateway supplied no usage, not proof that upstream compute was free; every raw reply and request is retained.",
        "token_estimator": "tiktoken 0.14.0 o200k_base on import-wired generated modules, same as r20",
        "reasoning_note": "reasoning_tokens/share are provider-reported only; null means unavailable. Gateway /v1/messages encodeUsage omits internal reasoningTokens. Estimated non-code share includes tokenizer mismatch, prose and tool JSON overhead and is not exact reasoning.",
        "cost_note": "List-price estimate input $2/M, cache-read $0.10/M, output $10/M. Historical Sonnet estimated_cost_usd retains original recorded cache-write price; list_price_cost_usd reprices at requested common rates.",
        "packaging": load(base / "rounds" / round_name / "round.json", {})}
baseline = summarize("r19single")
for round_name in sys.argv[1:]:
    report = summarize(round_name)
    report["comparison"] = {"r19single": baseline["summary"]}
    (base / (round_name + "-inputs") / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"round": round_name, **report["summary"]}))
print(json.dumps({"round": "r19single", **baseline["summary"]}))
comparison = [load(base / (name + "-inputs") / "report.json", {}).get("summary", {}) for name in ("r23argonhigh", "r23argonlow")] + [baseline["summary"]]
print("| Metric (median [min, max]) | Argon high | Argon low | Sonnet high r19single |")
print("|---|---:|---:|---:|")
for key in ("wall_seconds", "successful_request_wall_seconds", "request_wall_seconds", "input_tokens", "cached_input_tokens", "output_tokens", "reasoning_tokens", "reasoning_share", "estimated_code_tokens", "estimated_non_code_share", "estimated_cost_usd", "module_bytes", "final_module_bytes", "final_parts", "final_triangles", "final_textures", "pipeline_cost_usd", "pipeline_wall_seconds"):
    cells = []
    for summary in comparison:
        value = summary.get(key)
        cells.append("not reported" if value is None else f'{value["median"]:,.3f} [{value["range"][0]:,.3f}, {value["range"][1]:,.3f}]')
    print("| " + key + " | " + " | ".join(cells) + " |")
for key in ("attempted", "rendered", "initial_crashes", "repairs", "cap_hits", "retries", "module_sources", "total_cost_usd", "requests"):
    print("| " + key + " | " + " | ".join(str(summary.get(key)) for summary in comparison) + " |")
`;
  const report = await capture(
    "uv",
    ["run", "--with", "tiktoken==0.14.0", "python", "-c", script, SINGLE_ROUND],
    600000,
  );
  if (report.status !== 0) throw Error(report.stderr || report.stdout);
  console.log(report.stdout);
}

const args = process.argv.slice(2);
if (SINGLE) {
  if (!existsSync(join(INPUT, "manifest.json")) || args.includes("--prepare-only")) await prepareSingle();
  if (ARGON) {
    if (args.includes("--check-only")) await checkArgon();
    else if (!args.includes("--prepare-only") && !args.includes("--report-only")) await runArgon();
    if (!args.includes("--prepare-only")) await reportArgon();
  } else if (args.includes("--check-only")) await checkedAndRepaired(SINGLE_ROUND);
  else if (!args.includes("--prepare-only")) await runSingle();
} else if (APP) {
  if (!existsSync(join(INPUT, "manifest.json")) || args.includes("--prepare-only")) await prepareApp();
  if (!args.includes("--prepare-only")) await runApp();
} else {
  if (args.includes("--backfill-started")) {
    for (const name of readdirSync(join(BASE, "rounds")).filter((name) =>
      name.startsWith(EXPERIMENT2 ? "r17" : "r16"),
    )) {
      const dir = join(BASE, "rounds", name),
        path = join(dir, "round.json");
      if (!existsSync(path)) continue;
      const timestamps = existsSync(join(dir, "runs"))
        ? readdirSync(join(dir, "runs"))
            .filter((file) => file.endsWith(".json"))
            .map((file) => json(join(dir, "runs", file)).started)
            .filter((value) => typeof value === "string")
            .sort()
        : [];
      const started = timestamps[0] ?? new Date(statSync(path).mtimeMs).toISOString();
      save(path, { ...json(path), started });
      console.log(
        name +
          ": started " +
          started +
          (timestamps.length ? " (earliest run)" : " (pending round; manifest timestamp)"),
      );
    }
  }
  if (
    !args.includes("--backfill-started") &&
    (!existsSync(join(INPUT, "manifest.json")) || args.includes("--prepare-only"))
  ) {
    if (EXPERIMENT2) await prepareAblations();
    else await prepare();
  }
  if (!args.includes("--prepare-only") && !args.includes("--backfill-started")) {
    const selected = args.includes("--batches")
      ? args[args.indexOf("--batches") + 1].split(",")
      : args.includes("--batch")
        ? [args[args.indexOf("--batch") + 1]]
        : EXPERIMENT2
          ? ["v1a", "v1b", "v2a", "v2b", "v3a", "v3b"]
          : ["ra", "rb", "sa", "sb", "ca", "cb"];
    for (const batch of selected) {
      if (!(EXPERIMENT2 ? /^v[123][ab]$/ : /^[rsc][ab]$/).test(batch)) throw Error("Unknown batch " + batch);
      if (!(await guard(batch))) break;
      let round: string;
      if (batch[0] === "c") {
        round = "r16c" + batch[1];
        await cmd([
          "run",
          round,
          "--arm-set",
          "arms-r12.json",
          "--arms",
          "craft3",
          "--levels",
          "rich",
          "--pitches",
          "replay-inputs/pitches.json",
          "--subjects",
          SUBJECTS.join(","),
          "--max-tokens",
          "120000",
          "--effort",
          "high",
          "--concurrency",
          "6",
        ]);
      } else round = await conversationBatch(batch);
      if (!(await checkedAndRepaired(round))) break;
    }
  }
}
