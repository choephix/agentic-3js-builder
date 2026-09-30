// How every sample was built, from the omp session logs of the agent that first wrote it and the harness reports of
// the tags it rendered, into samples/<slug>.build.json (shape and field meanings: showcase/builds.ts).
//
//   npm run provenance
//
// Same logs and reports, same output. Nothing is guessed: a value the logs can't give is null with its reason in
// `caveats`. Model, effort, calls, active time, tokens and cost come from the creature lab's stats.ts, the parser
// behind its build stats, so both projects count a build the same way.
//
// The builder is the session with the earliest successful write of the file, under its current name or an earlier
// one from `git log --follow`. Only write/edit tool calls count as touching a file; shell edits leave no path.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { Build, Builder, Render, SessionTotals, Spend, Tokens, Version } from "../showcase/builds";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
/** The nilo profile's logs, where earlier builders ran; logs from other profiles are named by their path from home. */
const SESSIONS = join(homedir(), ".omp/profiles/nilo/agent/sessions");
const OTHER_SESSIONS = [join(homedir(), ".omp/agent/sessions")];
const sessionName = (file: string) =>
  file.startsWith(SESSIONS + sep) ? relative(SESSIONS, file) : relative(homedir(), file);
const SNAPS = join(homedir(), "tmp/public/nilo/agentic-3js-builder/snaps");
const STATS = join(homedir(), "workspace/nilo-creature-lab/site/scripts/stats.ts");
const WORKTREES = (() => {
  try {
    return execFileSync("git", ["worktree", "list", "--porcelain"], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .filter((line) => line.startsWith("worktree "))
      .map((line) => line.slice("worktree ".length));
  } catch {
    return [ROOT];
  }
})();
const CHECKOUTS = [...new Set([ROOT, ...WORKTREES])];

function repoRelativePath(path: string, cwd: string) {
  const checkout = CHECKOUTS.find((root) => path === root || path.startsWith(root + sep));
  if (checkout) return relative(checkout, path);
  const parts = cwd.split(sep);
  const marker = parts.lastIndexOf("agentic-3js-builder");
  if (marker < 1) return null;
  const worktree = parts[marker - 1] === "worktrees";
  const main = parts[marker - 1] === "noodlespace" || parts[marker - 1] === "workspace";
  if (!worktree && !main) return null;
  const inferred = parts.slice(0, marker + (worktree ? 2 : 1)).join(sep) || sep;
  return path === inferred || path.startsWith(inferred + sep) ? relative(inferred, path) : null;
}

type Stats = {
  model: string;
  effort: string;
  calls: number;
  seconds: number;
  tokens: Tokens;
  cost: number;
  finished: boolean;
};
// The lab repo is found from the home directory, like snap.ts's LAB_REPO; a static relative specifier would tie
// this checkout's location to the lab's.
const lab: {
  collectSession: (path: string) => Promise<{ stats: Stats } | null>;
  MODEL_NAMES: Record<string, string>;
} = await import(STATS);

type Part = { type: string; id?: string; name?: string; text?: string; arguments?: Record<string, unknown> };
type Message = {
  role?: string;
  provider?: string;
  model?: string;
  api?: string;
  usage?: { input?: number; output?: number; cacheRead?: number; totalTokens?: number; cost?: { total?: number } };
  content?: Part[] | string;
  toolCallId?: string;
  isError?: boolean;
  stopReason?: string;
  errorMessage?: string;
  errorClassificationMessage?: string;
  /** A backgrounded call's result: its job id, whose completion a later entry reports. */
  details?: { async?: { jobId?: string } };
};
type Entry = {
  type?: string;
  customType?: string;
  timestamp?: string;
  message?: Message;
  data?: { toolCallId?: string; toolName?: string; startedAt?: string; args?: Record<string, unknown> };
  purpose?: string;
  title?: string;
  id?: string;
  cwd?: string;
  parentSession?: string;
  thinkingLevel?: string;
};
/** A tool call that ran, with the model that issued it and the reasoning effort in force then. */
type Call = {
  name: string;
  args: Record<string, unknown>;
  at: string;
  ran: boolean;
  failed: boolean;
  model: string | null;
  effort: string | null;
  /** When its result was logged; "~" (after every timestamp) while it is still running. */
  end: string;
  /** The result's text. */
  output: string;
};
/** A successful write or edit of a repo file; `path` is repo-relative. */
type Touch = { path: string; at: string; write: boolean };
type Log = {
  file: string;
  session: string;
  agent: string;
  parent: string | null;
  entries: Entry[];
  calls: Call[];
  touches: Touch[];
};

/**
 * One session log. `seen` holds the ids of entries already read from other logs: a continued session copies its
 * parent's history into a new file, and its subagents' logs with it, and those copies must not count twice.
 */
function parseLog(file: string, text: string, seen: Set<string>): Log {
  const entries: Entry[] = [];
  let title = "";
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line) as Entry;
      if (entry.type === "title" && entry.title) title = entry.title;
      if (entry.id && entry.type !== "session") {
        if (seen.has(entry.id)) continue;
        seen.add(entry.id);
      }
      if (entry.timestamp) entries.push(entry);
    } catch {
      // A session may be mid-write on its last line.
    }
  }
  entries.sort((a, b) => (a.timestamp! < b.timestamp! ? -1 : a.timestamp! > b.timestamp! ? 1 : 0));
  const head = entries.find((entry) => entry.type === "session");
  const cwd = head?.cwd ?? ROOT;

  // A tool call's name and arguments come from the assistant message, its start from tool_execution_start (which
  // carries the name the tool ran under, and arguments cut short), its outcome from the tool result. Only calls
  // that ran count.
  const calls = new Map<string, Call>();
  const call = (id: string, at: string) => {
    let found = calls.get(id);
    if (!found)
      calls.set(
        id,
        (found = {
          name: "",
          args: {},
          at,
          ran: false,
          failed: false,
          model: null,
          effort: null,
          end: "~",
          output: "",
        }),
      );
    return found;
  };
  let effort: string | null = null;
  /** Backgrounded calls waiting for their completion report, by job id. */
  const jobs = new Map<string, Call>();
  for (const entry of entries) {
    const message = entry.message;
    if (entry.type === "thinking_level_change" && entry.thinkingLevel) effort = entry.thinkingLevel;
    if (entry.type === "message" && message?.role === "assistant" && Array.isArray(message.content))
      for (const part of message.content) {
        if (part.type !== "toolCall" || !part.id) continue;
        const found = call(part.id, entry.timestamp!);
        found.name ||= part.name ?? "";
        found.args = { ...found.args, ...part.arguments };
        found.model = message.provider && message.model ? `${message.provider}/${message.model}` : null;
        found.effort = effort;
      }
    if (entry.customType === "tool_execution_start" && entry.data?.toolCallId) {
      const found = call(entry.data.toolCallId, entry.data.startedAt ?? entry.timestamp!);
      found.name = entry.data.toolName ?? found.name;
      found.args = { ...entry.data.args, ...found.args };
      found.at = entry.data.startedAt ?? entry.timestamp!;
      found.ran = true;
    }
    if (entry.type === "message" && message?.role === "toolResult" && message.toolCallId) {
      const found = call(message.toolCallId, entry.timestamp!);
      found.ran = true;
      found.failed = message.isError === true;
      if (Array.isArray(message.content))
        found.output = message.content.map((part) => (part.type === "text" ? (part.text ?? "") : "")).join("\n");
      const job = message.details?.async?.jobId;
      if (job) jobs.set(job, found);
      else found.end = entry.timestamp!;
      continue;
    }
    // A backgrounded job ends where a later entry reports it: a wait result lists it under its own heading, an
    // async-result notice names it.
    if (jobs.size) {
      const text = JSON.stringify(entry.message?.content ?? entry);
      for (const [job, found] of jobs)
        if (text.includes(`### ${job} [`) || text.includes(`Background job ${job} has `)) {
          found.end = entry.timestamp!;
          found.output += `\n${text}`;
          jobs.delete(job);
        }
    }
  }
  // A call with no result stays open-ended ("~"): it may still be running, or its session dropped mid-call.
  const ran = [...calls.values()].filter((item) => item.ran).sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));

  const touches: Touch[] = [];
  for (const item of ran) {
    if (item.failed || (item.name !== "write" && item.name !== "edit")) continue;
    const targets = typeof item.args.path === "string" ? [item.args.path] : [];
    if (typeof item.args.input === "string") {
      // A hashline edit names each file on a `[path#TAG]` line. Its result repeats them resolved to the files it
      // really changed (a mistyped `src/x.ts` anchor resolves to `samples/x.ts`), so the result wins when it has any.
      const headers = (text: string) => [...text.matchAll(/^\[([^\s[\]]+)#[0-9A-F]{4}\]$/gm)].map((match) => match[1]);
      const resolved = headers(item.output);
      targets.push(...(resolved.length ? resolved : headers(item.args.input)));
    }
    for (const target of targets) {
      if (/^[a-z]+:\/\//.test(target)) continue;
      const path = resolve(cwd, target.replace(/^~(?=\/)/, homedir()));
      const repoPath = repoRelativePath(path, cwd);
      if (repoPath === null) continue;
      // cursor-agent rewrites whole files through "edit" with `stream_content`; it logs them as "write".
      touches.push({ path: repoPath, at: item.at, write: item.name === "write" || "content" in item.args });
    }
  }

  // A subagent's log sits in its parent session's folder, named after the agent.
  const subagent = existsSync(`${dirname(file)}.jsonl`);
  return {
    file,
    session: sessionName(file),
    // A top-level session without a title goes by its id's leading, time-ordered part (full path in `session`).
    agent: subagent
      ? basename(file, ".jsonl")
      : title || `session ${head?.id?.slice(0, 13) ?? basename(file, ".jsonl")}`,
    parent: head?.parentSession ? sessionName(head.parentSession) : null,
    entries,
    calls: ran,
    touches,
  };
}

/**
 * Every session log belonging to this repository, whichever checkout recorded it: every log whose session ran in a
 * checkout (its own `cwd`, so removed worktrees count; a subagent filed under this repo's folder that ran in another
 * project does not), and every other log that mentions a checkout's path. Roots keep their order (the nilo profile
 * first) and each root is read in sorted order, because a continued session copies its parent's entries and the first
 * log read owns them.
 */
function loadLogs() {
  const needles = CHECKOUTS.flatMap((path) => [path, relative(homedir(), path)]).map((path) => Buffer.from(path));
  const logs: Log[] = [];
  const seen = new Set<string>();
  for (const root of [SESSIONS, ...OTHER_SESSIONS]) {
    if (!existsSync(root)) continue;
    for (const name of readdirSync(root, { recursive: true, encoding: "utf8" }).sort()) {
      if (!name.endsWith(".jsonl")) continue;
      const file = join(root, name);
      const bytes = readFileSync(file);
      const cwd = /"type":"session"[^\n]*?"cwd":"([^"]*)"/.exec(bytes.subarray(0, 8192).toString("utf8"))?.[1] ?? "";
      if (cwd.split(sep).includes("agentic-3js-builder") || needles.some((needle) => bytes.includes(needle)))
        logs.push(parseLog(file, bytes.toString("utf8"), seen));
    }
  }
  return logs;
}

/** The sample's path and every earlier name git followed it through, repo-relative. */
function pathsOf(slug: string) {
  const current = `samples/${slug}.ts`;
  let history = "";
  try {
    history = execFileSync("git", ["log", "--follow", "--name-only", "--format=", "--", current], {
      cwd: ROOT,
      encoding: "utf8",
    });
  } catch {
    // Not a git checkout: the current name is all there is.
  }
  return new Set([current, ...history.split("\n").filter(Boolean)]);
}

function mostCommon(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]?.[0] ?? null;
}

/** Tags this log rendered for `slug` with `npm run snap`, one per run, and the number of typecheck runs. */
function rounds(log: Log, slug: string) {
  const runs: string[] = [];
  let typechecks = 0;
  for (const item of log.calls) {
    if (item.name !== "bash" || typeof item.args.command !== "string") continue;
    for (const [, name, tag] of item.args.command.matchAll(
      /(?:npm run snap --|scripts\/snap\.ts)\s+(\S+)\s+([^\s;&|]+)/g,
    ))
      if (name === slug) runs.push(tag);
    if (/npm run typecheck|\btsc\b/.test(item.args.command)) typechecks++;
  }
  return { runs, typechecks };
}

function renderOf(slug: string, tag: string, started: string, ended: string): Render {
  for (const lane of ["B", "A"]) {
    const file = join(SNAPS, slug, lane, "snaps", `${tag}-report.json`);
    let written: number;
    try {
      written = statSync(file).mtimeMs;
    } catch {
      continue;
    }
    const report: { issues: Array<{ level: string }> } = JSON.parse(readFileSync(file, "utf8"));
    const issues = report.issues;
    const render: Render = {
      tag,
      errors: issues.filter((issue) => issue.level === "error").length,
      warnings: issues.filter((issue) => issue.level === "warning").length,
    };
    if (written > Date.parse(ended)) render.note = "report rewritten after the build; issues are from the later render";
    else if (written < Date.parse(started)) render.note = "report older than the build";
    return render;
  }
  return { tag, errors: 0, warnings: 0, note: "no report on disk" };
}

/**
 * Pretty JSON in the layout prettier gives it at 120 columns: objects one key per line, arrays of plain values on one
 * line when they fit. `used` is the width the rest of the line takes: indent, key and trailing comma.
 */
function stringify(value: unknown, indent = "", used = 0): string {
  const inner = `${indent}  `;
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const flat = `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    if (value.every((item) => item === null || typeof item !== "object") && used + flat.length <= 120) return flat;
    const items = value.map((item, i) => inner + stringify(item, inner, inner.length + (i < value.length - 1 ? 1 : 0)));
    return `[\n${items.join(",\n")}\n${indent}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.entries(value).filter(([, item]) => item !== undefined);
    if (!keys.length) return "{}";
    const lines = keys.map(([key, item], i) => {
      const prefix = `${inner}${JSON.stringify(key)}: `;
      return prefix + stringify(item, inner, prefix.length + (i < keys.length - 1 ? 1 : 0));
    });
    return `{\n${lines.join(",\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

const logs = loadLogs();
const slugs = readdirSync(join(ROOT, "samples"))
  .filter((name) => name.endsWith(".ts"))
  .map((name) => basename(name, ".ts"))
  .sort();
const pathsBySlug = new Map(slugs.map((slug) => [slug, pathsOf(slug)]));

// The creating write of each sample: the earliest successful write of any of its paths.
const creations = new Map<string, { log: Log; at: string }>();
for (const slug of slugs) {
  const paths = pathsBySlug.get(slug)!;
  for (const log of logs)
    for (const touch of log.touches) {
      const earliest = creations.get(slug);
      if (touch.write && paths.has(touch.path) && (!earliest || touch.at < earliest.at))
        creations.set(slug, { log, at: touch.at });
    }
}

/**
 * Every shell call that ran the harness (`npm run snap`, `scripts/snap.ts` or `harness/snap.ts`) for a render, in any
 * session. A command whose every harness run is `--report-only` renders nothing.
 */
const renderCalls = logs.flatMap((log) =>
  log.calls
    .filter(
      (call) =>
        call.name === "bash" &&
        typeof call.args.command === "string" &&
        call.args.command
          .split(/&&|\|\||[;\n]/)
          .some(
            (part) => /npm run (?:-s |--silent )?snap\b|\bsnap\.ts\b/.test(part) && !part.includes("--report-only"),
          ),
    )
    .map((call) => ({ log, call, text: `${call.args.command}\n${call.output}` })),
);

/** The session's model calls with `after < timestamp <= upTo`, summed. */
function spendBetween(log: Log, after: string, upTo: string): Spend {
  const spend: Spend = { cost: 0, tokens: 0, calls: 0, seconds: 0 };
  for (const entry of log.entries) {
    if (entry.type !== "message" || entry.message?.role !== "assistant") continue;
    if (entry.timestamp! <= after || entry.timestamp! > upTo) continue;
    const usage = entry.message.usage ?? {};
    spend.calls++;
    spend.cost += usage.cost?.total ?? 0;
    spend.tokens += usage.totalTokens ?? (usage.input ?? 0) + (usage.output ?? 0) + (usage.cacheRead ?? 0);
  }
  spend.cost = Number(spend.cost.toFixed(4));
  spend.seconds = Math.max(0, Math.round((Date.parse(upTo) - Date.parse(after)) / 1000));
  return spend;
}

/**
 * Every rendered version of `slug` (a contact sheet on disk, as the showcase lists them) and who rendered it: the
 * shell call that was running the harness when the sheet was written, which holds for loops over samples and computed
 * tags too. When several were running, the one whose command or output names the slug and tag, else the slug.
 */
function versionsOf(slug: string): Version[] {
  const versions: Version[] = [];
  const paths = pathsBySlug.get(slug)!;
  for (const arm of ["B", "A"] as const) {
    const directory = join(SNAPS, slug, arm, "snaps");
    if (!existsSync(directory)) continue;
    for (const name of readdirSync(directory).sort()) {
      if (!name.endsWith("-sheet.jpg")) continue;
      const tag = name.slice(0, -"-sheet.jpg".length);
      if (versions.some((version) => version.tag === tag)) continue;
      const rendered = statSync(join(directory, name)).mtime.toISOString();
      let running = renderCalls.filter(({ call }) => call.at <= rendered && rendered <= call.end);
      const exact = new RegExp(`${slug}/${arm}/snaps/${tag}-|\\b${slug}\\s+(?:[ABC]\\s+)?${tag}(?![\\w.-])`);
      for (const names of [(text: string) => exact.test(text), (text: string) => text.includes(slug)]) {
        const named = running.filter(({ text }) => names(text));
        if (running.length > 1 && named.length) running = named;
      }
      const run = running.length === 1 ? running[0] : null;
      const modelId = run?.call.model ?? null;
      versions.push({
        tag,
        arm,
        rendered,
        agent: run?.log.agent ?? null,
        session: run?.log.session ?? null,
        model: modelId ? (lab.MODEL_NAMES[modelId.slice(modelId.indexOf("/") + 1)] ?? modelId) : null,
        modelId,
        effort: run?.call.effort ?? null,
        spent: null,
        total: null,
        ...(run
          ? {}
          : {
              note: running.length
                ? `${running.length} sessions were rendering ${slug} when this sheet was written.`
                : "No logged session was running the harness when this sheet was written.",
            }),
      });
    }
  }
  versions.sort((a, b) => (a.rendered < b.rendered ? -1 : a.rendered > b.rendered ? 1 : 0));
  // Spend per iteration, from the rendering session's own calls; a session that wrote other samples can't be split.
  const cut = new Map<Log, string>();
  let total: Spend | null = { cost: 0, tokens: 0, calls: 0, seconds: 0 };
  for (const version of versions) {
    const log = logs.find((item) => item.session === version.session);
    if (!log) {
      total = null;
      continue;
    }
    const shared = log.touches.some((touch) => !paths.has(touch.path) && !touch.path.startsWith(`scratch${sep}`));
    const after = cut.get(log) ?? log.entries[0].timestamp!;
    cut.set(log, version.rendered);
    if (shared) {
      version.note ??= `${log.agent} also worked on other samples, so its usage can't be split per version.`;
      total = null;
      continue;
    }
    version.spent = spendBetween(log, after, version.rendered);
    if (total) {
      total = {
        cost: Number((total.cost + version.spent.cost).toFixed(4)),
        tokens: total.tokens + version.spent.tokens,
        calls: total.calls + version.spent.calls,
        seconds: total.seconds + version.spent.seconds,
      };
      version.total = total;
    }
  }
  return versions;
}

// A file assembled by a shell command (`cat parts > sample.ts`) has no logged write; the session that rendered its
// first version built it.
const assembled = new Set<string>();
for (const slug of slugs) {
  if (creations.has(slug)) continue;
  const first = versionsOf(slug).find((version) => version.session);
  const log = first && logs.find((candidate) => candidate.session === first.session);
  if (!log) continue;
  creations.set(slug, { log, at: first.rendered });
  assembled.add(slug);
}

const statsCache = new Map<Log, Stats>();
async function statsOf(log: Log) {
  if (!statsCache.has(log)) {
    const collected = await lab.collectSession(log.file);
    if (!collected) throw new Error(`stats.ts could not read ${log.file}`);
    statsCache.set(log, collected.stats);
  }
  return statsCache.get(log)!;
}

async function buildOf(slug: string): Promise<Build> {
  const paths = pathsBySlug.get(slug)!;
  const creation = creations.get(slug);
  const laterEdits: Build["laterEdits"] = [];
  for (const log of logs) {
    if (log === creation?.log) continue;
    const own = log.touches.filter((touch) => paths.has(touch.path) && (!creation || touch.at > creation.at));
    if (!own.length) continue;
    const model = mostCommon(
      log.entries.filter((entry) => entry.message?.role === "assistant").map((entry) => entry.message!.model ?? ""),
    );
    laterEdits.push({
      agent: log.agent,
      session: log.session,
      model: model || null,
      first: own[0].at,
      last: own[own.length - 1].at,
      edits: own.length,
    });
  }
  laterEdits.sort((a, b) => (a.first < b.first ? -1 : a.first > b.first ? 1 : 0));

  const caveats: Record<string, string> = {};
  if (assembled.has(slug))
    caveats.created =
      "No logged write created this file (a shell command assembled it); the builder is the session that rendered its first version, and `created` is that render.";
  if (!creation) {
    caveats.builder =
      "No logged write created this file (it may have come from a shell command or an unlogged session).";
    return {
      slug,
      builder: null,
      created: null,
      started: null,
      ended: null,
      wallSeconds: null,
      activeSeconds: null,
      cost: null,
      tokens: null,
      calls: null,
      toolCalls: null,
      edits: null,
      typechecks: null,
      snaps: null,
      tags: [],
      finalTag: null,
      renders: [],
      interruptions: [],
      compactions: null,
      finished: null,
      session: null,
      versions: versionsOf(slug),
      laterEdits,
      caveats,
    };
  }

  const { log } = creation;
  const stats = await statsOf(log);
  const replies = log.entries.filter((entry) => entry.type === "message" && entry.message?.role === "assistant");
  const started = log.entries[0].timestamp!;
  const ended = replies.at(-1)?.timestamp ?? log.entries.at(-1)!.timestamp!;
  const topModel = mostCommon(replies.map((entry) => `${entry.message!.provider}/${entry.message!.model}`));
  const api = mostCommon(replies.map((entry) => entry.message!.api ?? ""));

  // Throwaway scripts under scratch/ (gitignored) belong to the build, not to other work.
  const others = new Set(
    log.touches
      .filter((touch) => !paths.has(touch.path) && !touch.path.startsWith(`scratch${sep}`))
      .map((touch) => touch.path),
  );
  const shared = others.size > 0;
  const builder: Builder = {
    agent: log.agent,
    session: log.session,
    parent: log.parent,
    model: stats.model === "unknown" ? null : stats.model,
    modelId: topModel,
    api: api || null,
    effort: stats.effort === "unknown" ? null : stats.effort,
    scope: shared ? "shared" : "sample",
  };
  if (builder.effort === null) {
    const auto = log.entries.filter((entry) => entry.type === "model_usage" && entry.purpose === "auto-thinking");
    caveats.effort = auto.length
      ? `Not logged: no thinking_level_change; the log has ${auto.length} auto-thinking classifier call${auto.length > 1 ? "s" : ""} but not the level chosen.`
      : "Not logged: the session has no thinking_level_change.";
  }

  const { runs, typechecks } = rounds(log, slug);
  const tags = [...new Set(runs)];
  if (!runs.length) caveats.tags = `No \`npm run snap -- ${slug}\` in ${log.agent}'s log.`;

  // stats.ts counts a build finished when it submitted a result; a top-level run has no yield tool to submit with.
  const submits = log.calls.some((item) => item.name === "yield");
  if (!submits)
    caveats.finished = `No yield tool in this session (a top-level run); its last reply ended with stop reason "${replies.at(-1)?.message?.stopReason}".`;

  const interruptions: Build["interruptions"] = [];
  for (const [i, entry] of log.entries.entries()) {
    if (entry.message?.role !== "assistant" || entry.message.stopReason !== "error") continue;
    const next = log.entries
      .slice(i + 1)
      .find((later) => later.type === "custom_message" || (later.type === "message" && later.message?.role === "user"));
    interruptions.push({
      at: entry.timestamp!,
      error: (entry.message.errorClassificationMessage ?? entry.message.errorMessage ?? "error").slice(0, 120),
      resumed: next?.timestamp ?? null,
    });
  }

  const record: Build = {
    slug,
    builder,
    created: creation.at,
    started,
    ended,
    wallSeconds: Math.round((Date.parse(ended) - Date.parse(started)) / 1000),
    activeSeconds: stats.seconds,
    cost: stats.cost,
    tokens: stats.tokens,
    calls: stats.calls,
    toolCalls: log.calls.length,
    edits: log.touches.filter((touch) => paths.has(touch.path)).length,
    typechecks,
    snaps: runs.length,
    tags,
    finalTag: runs.at(-1) ?? null,
    renders: tags.map((tag) => renderOf(slug, tag, started, ended)),
    interruptions,
    compactions: log.entries.filter((entry) => entry.type === "compaction").length,
    finished: submits ? stats.finished : null,
    session: null,
    versions: versionsOf(slug),
    laterEdits,
    caveats,
  };

  // cursor-agent runs its own loop and omp logs one aggregated message per prompt, not one per model call.
  if (replies.some((entry) => entry.message!.api === "cursor-agent")) {
    record.calls = null;
    caveats.calls = `cursor-agent runs its own agent loop; omp logs one message per prompt (${replies.length}), not each model call.`;
  }
  // A dropped run can log its output tokens with no input, cache or cost.
  const unpriced = replies.filter(
    (entry) =>
      !entry.message!.usage?.input && !entry.message!.usage?.cacheRead && entry.message!.stopReason === "error",
  );
  if (unpriced.length) {
    const at = unpriced.map((entry) => entry.timestamp!.slice(11, 19)).join(", ");
    caveats.cost = `Lower bound: the interrupted run (${at} UTC) logged no input, cache or cost.`;
    caveats.tokens = `Lower bound: the interrupted run (${at} UTC) logged output tokens only.`;
  }

  if (shared) {
    const samples = slugs.filter((other) => creations.get(other)?.log === log);
    const samplePaths = new Set(samples.flatMap((other) => [...pathsBySlug.get(other)!]));
    const totals: SessionTotals = {
      wallSeconds: record.wallSeconds!,
      activeSeconds: stats.seconds,
      cost: stats.cost,
      tokens: stats.tokens,
      calls: stats.calls,
      toolCalls: log.calls.length,
      samples,
      otherFiles: [...others].filter((path) => !samplePaths.has(path)).length,
    };
    const why = `Shared: ${log.agent}'s session also wrote ${totals.otherFiles} other files and ${samples.length - 1} other samples, so its usage can't be split per sample; \`session\` has the whole-session totals.`;
    for (const key of ["wallSeconds", "activeSeconds", "cost", "tokens", "calls", "toolCalls", "typechecks"] as const) {
      record[key] = null;
      caveats[key] = why;
    }
    record.session = totals;
  }
  return record;
}

const written = new Set<string>();
for (const slug of slugs) {
  const file = join(ROOT, "samples", `${slug}.build.json`);
  writeFileSync(file, `${stringify(await buildOf(slug))}\n`);
  written.add(file);
}
// Records of samples that no longer exist.
for (const name of readdirSync(join(ROOT, "samples")))
  if (name.endsWith(".build.json") && !written.has(join(ROOT, "samples", name)))
    unlinkSync(join(ROOT, "samples", name));
console.log(`${written.size} build records in samples/ from ${logs.length} session logs.`);
