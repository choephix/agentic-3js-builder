#!/usr/bin/env bun
/** Reproduce the pre-first-write context, an app-shaped imitation, and fresh craft3 controls.
 * Run: bun bakeoff/replay.ts [--experiment2] [--prepare-only] [--batches v1a,v1b,v2a,v2b,v3a,v3b]
 * Every API batch (including crash repairs) is gated by omp's Anthropic 5-hour usage.
 * R's archived tools are NAMES ONLY: definitions are recovered from installed OMP,
 * with find/wait reconstructed below. This limitation is recorded, never called exact replay.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { gateway, wireImports, results, capture, systemPrompt } from "../scripts/bakeoff.ts";

const ROOT = resolve(import.meta.dir, "..");
const BASE = join(ROOT, "bakeoff");
const EXPERIMENT2 = process.argv.includes("--experiment2");
const INPUT = join(BASE, EXPERIMENT2 ? "replay2-inputs" : "replay-inputs");
const MODEL = "anthropic/claude-sonnet-5-5";
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
  .filter((s) => SUBJECTS.includes(s.id));
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
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: context.systemPrompt.map((t) => ({ type: "text", text: t })),
    messages,
    tools: context.tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })),
  };
}

const HISTORICAL = join(homedir(), "tmp-archive/replay-sdk-88fc1f0");

async function readOnlyCall(call: any) {
  const args = call.input ?? {};
  const remap = (value: string) =>
    value
      .replace(/(?:~|\/home\/cx)\/tmp-archive\/sonnet-100\/[A-Za-z0-9_-]+/g, HISTORICAL)
      .replaceAll(ROOT, HISTORICAL);
  try {
    if (call.name === "read") {
      const original = remap(String(args.path));
      const match = original.match(/^(.*?)(?::(\d+)(?:-(\d+))?)?$/)!;
      const path = resolve(HISTORICAL, match[1]);
      if (!path.startsWith(HISTORICAL + "/")) throw Error("Only historical repository files may be read");
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
      const path = resolve(HISTORICAL, remap(String(args.path ?? ".")).replace(/:\d.*$/, ""));
      if (!path.startsWith(HISTORICAL)) throw Error("Only historical repository files may be searched");
      const out = await capture("grep", ["-R", "-n", "-E", "--", String(args.pattern), path], 60000);
      return { text: out.stdout + out.stderr || "(no matches)", isError: out.status !== 0 && out.status !== 1 };
    }
    if (call.name === "glob") {
      const pattern = remap(String(args.path ?? "**/*")).replace(HISTORICAL + "/", "");
      const paths = [];
      for await (const p of new Bun.Glob(pattern).scan({ cwd: HISTORICAL, dot: false })) paths.push(p);
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
      const cwd = resolve(HISTORICAL, remap(String(args.cwd ?? ".")));
      if (!cwd.startsWith(HISTORICAL)) throw Error("Only historical repository cwd is allowed");
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
    if (![...latest.values()].some((e) => e.hasCode && e.check?.rendered === false)) break;
    if (!(await guard(round + " repair " + turn))) return false;
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
      "high",
      "--concurrency",
      "2",
      "--system-prompt",
      "scratch/bakeoff/craft3.md",
    ]);
    await cmd(["check", next, "--skip-typecheck", "--concurrency", "2"]);
  }
  return true;
}

const args = process.argv.slice(2);
if (args.includes("--backfill-started")) {
  for (const name of readdirSync(join(BASE, "rounds")).filter((name) => name.startsWith(EXPERIMENT2 ? "r17" : "r16"))) {
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
      name + ": started " + started + (timestamps.length ? " (earliest run)" : " (pending round; manifest timestamp)"),
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
