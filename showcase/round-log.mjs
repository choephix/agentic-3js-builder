// What each builder of an experiment round did, read from its omp session log: spend, timeline, renders,
// typechecks, file edits, phases and final reply. The dev server serves it live at `/__round/<id>`; the static
// build writes the same JSON. Shape: `RoundLog` in showcase/round.ts.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, relative, resolve, sep } from "node:path";

const text = (content) =>
  Array.isArray(content) ? content.map((part) => (part.type === "text" ? (part.text ?? "") : "")).join("\n") : "";

const seconds = (from, to) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 1000));

/** The phase a repo path or sample slug belongs to, for this arm. */
function phaseOf(target, arm) {
  const name = arm.id[0].toUpperCase() + arm.id.slice(1);
  if (/^src\//.test(target)) return "toolkit";
  if (target.includes(`${arm.id}Test`)) return "test";
  if (target.includes("notes/")) return "notes";
  if (target.includes("scratch/")) return null;
  const match = /(?:^|\/)([a-z]+)([A-Z][a-zA-Z]*?)(?:\.ts)?$/.exec(target);
  if (match && match[2] === name) return match[1];
  return null;
}

/** Shell commands, classified. A command can chain several renders (`snap a v03 && snap b v02`): each is listed. */
function shell(command) {
  const snaps = [];
  for (const part of command.split(/&&|\|\||[;\n]/)) {
    const snap = /(?:npm run (?:-s |--silent )?snap|snap\.ts)\s+(?:--\s+)?([A-Za-z0-9_-]+)\s+([A-Za-z0-9_.-]+)/.exec(
      part,
    );
    if (snap) snaps.push({ slug: snap[1], tag: snap[2], reportOnly: part.includes("--report-only") });
  }
  if (snaps.length) return { kind: "snap", slug: snaps[0].slug, snaps };
  if (/npm run (?:-s |--silent )?typecheck|\btsc\b/.test(command)) return { kind: "typecheck" };
  if (/prettier/.test(command)) return { kind: "format" };
  return { kind: "shell" };
}

/** Parse one builder log. `repo` is the repository root; `arm` is the manifest entry. */
function parse(lines, repo, arm) {
  const entries = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.timestamp) entries.push(entry);
    } catch {
      // The last line may be mid-write.
    }
  }
  entries.sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
  const head = entries.find((entry) => entry.type === "session");
  const init = entries.find((entry) => entry.type === "session_init");
  const cwd = head?.cwd ?? repo;
  const name = arm.id[0].toUpperCase() + arm.id.slice(1);
  const own = (path) =>
    path.includes(name) || path.includes(`experimental/${arm.id}`) || path.includes(`${arm.id}Test`);

  const tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 };
  let cost = 0;
  let calls = 0;
  let effort = null;
  let model = null;
  let phase = "setup";
  const phases = [];
  const enter = (id, at) => {
    const last = phases.at(-1);
    if (last?.id === id) return;
    if (last) last.end = at;
    phases.push({ id, start: at, end: at, cost: 0, calls: 0 });
  };
  enter("setup", entries[0]?.timestamp ?? new Date(0).toISOString());
  const spend = [];
  const events = [];
  const pending = new Map();
  const toolsByName = {};
  const edits = {};
  const errors = [];
  let compactions = 0;
  let finalReply = null;
  let exited = false;
  let lastStop = null;
  /** A subagent finishes by calling `yield`; its reply is the call's data, else the last thing it said. */
  let submitted = false;
  let lastText = null;

  for (const entry of entries) {
    const message = entry.message;
    if (entry.type === "thinking_level_change" && entry.thinkingLevel) effort = entry.thinkingLevel;
    if (/compact/i.test(entry.type ?? "") || /compact/i.test(entry.customType ?? "")) compactions++;
    if (entry.customType === "session_exit") exited = true;
    if (entry.type === "message" && message?.role === "assistant") {
      calls++;
      lastStop = message.stopReason ?? null;
      if (message.provider && message.model) model = `${message.provider}/${message.model}`;
      const usage = message.usage ?? {};
      for (const key of ["input", "output", "cacheRead", "cacheWrite"]) tokens[key] += usage[key] ?? 0;
      tokens.total += usage.totalTokens ?? 0;
      const callCost = usage.cost?.total ?? 0;
      cost += callCost;
      spend.push([entry.timestamp, Math.round(cost * 10000) / 10000]);
      if (message.stopReason === "error")
        errors.push({ at: entry.timestamp, message: message.errorMessage ?? "model call failed" });
      const parts = Array.isArray(message.content) ? message.content : [];
      // A call belongs to the phase of what it touches; otherwise to the phase in force.
      for (const part of parts) {
        if (part.type !== "toolCall") continue;
        const args = part.arguments ?? {};
        let target = null;
        if (typeof args.path === "string") target = args.path;
        if (typeof args.input === "string") target = /^\[(.+)#[0-9A-F]{4}\]$/m.exec(args.input)?.[1] ?? target;
        if (typeof args.command === "string") {
          const kind = shell(args.command);
          if (kind.kind === "snap") target = kind.slug;
        }
        if (target && ["write", "edit", "bash"].includes(part.name)) {
          const next = phaseOf(target.replace(/^\/.*?agentic-3js-builder\//, ""), arm);
          if (next) phase = next;
        }
        pending.set(part.id, { name: part.name, args, at: entry.timestamp });
      }
      enter(phase, entry.timestamp);
      phases.at(-1).cost += callCost;
      phases.at(-1).calls++;
      const said = text(parts).trim();
      if (said) lastText = said;
      if (message.stopReason === "stop" && said) finalReply = said;
      continue;
    }
    if (entry.type === "message" && message?.role === "toolResult" && message.toolCallId) {
      const call = pending.get(message.toolCallId);
      if (!call) continue;
      pending.delete(message.toolCallId);
      toolsByName[call.name] = (toolsByName[call.name] ?? 0) + 1;
      if (call.name === "yield" && message.isError !== true) {
        submitted = true;
        const data = call.args.data ?? call.args.result;
        finalReply =
          data === undefined
            ? lastText
            : typeof data === "string"
              ? data
              : "```json\n" + JSON.stringify(data, null, 2) + "\n```";
      }
      const output = text(message.content);
      const failed = message.isError === true;
      const base = { at: call.at, end: entry.timestamp, ok: !failed, phase: phases.at(-1).id };
      if (call.name === "write" || call.name === "edit") {
        const targets = [];
        if (typeof call.args.path === "string") targets.push(call.args.path);
        if (typeof call.args.input === "string")
          for (const match of call.args.input.matchAll(/^\[(.+)#[0-9A-F]{4}\]$/gm)) targets.push(match[1]);
        const added =
          typeof call.args.content === "string"
            ? call.args.content.split("\n").length
            : typeof call.args.input === "string"
              ? call.args.input.split("\n").filter((line) => line.startsWith("+")).length
              : 0;
        for (const target of targets) {
          if (/^[a-z]+:\/\//.test(target)) continue;
          const path = resolve(cwd, target.replace(/^~(?=\/)/, homedir()));
          const file = path.startsWith(repo + sep) ? relative(repo, path) : path;
          if (!failed) edits[file] = (edits[file] ?? 0) + 1;
          events.push({ ...base, kind: call.name, path: file, lines: added, label: `${call.name} ${file}` });
        }
        continue;
      }
      if (call.name === "bash" && typeof call.args.command === "string") {
        const kind = shell(call.args.command);
        if (kind.kind === "snap") {
          const gpu = /WebGL|context lost|context loss|BindToCurrentSequence|reading 'gpu'/i.test(output);
          const ok = !failed && !/^Error|\bfailed\b/im.test(output.slice(-400));
          for (const snap of kind.snaps)
            events.push({
              ...base,
              kind: snap.reportOnly ? "report" : "snap",
              slug: snap.slug,
              tag: snap.tag,
              ok,
              gpu,
              label: `${snap.reportOnly ? "report" : "snap"} ${snap.slug} ${snap.tag}`,
              detail: output.slice(-1500),
            });
          continue;
        }
        if (kind.kind === "typecheck") {
          const lines = output.split("\n").filter((line) => /error TS\d+/.test(line));
          const mine = lines.filter(own);
          events.push({
            ...base,
            kind: "typecheck",
            ok: mine.length === 0,
            errors: lines.length,
            ownErrors: mine.length,
            label: `typecheck: ${mine.length ? `${mine.length} own errors` : "clean"}${lines.length > mine.length ? ` (${lines.length - mine.length} elsewhere)` : ""}`,
            detail: mine.slice(0, 20).join("\n"),
          });
          continue;
        }
        events.push({ ...base, kind: kind.kind, label: call.args.command.split("\n")[0].slice(0, 160) });
        continue;
      }
      const subject = call.args.path ?? call.args.pattern ?? call.args.query ?? "";
      events.push({ ...base, kind: call.name === "read" ? "read" : "other", label: `${call.name} ${subject}`.trim() });
    }
  }
  const started = entries[0]?.timestamp ?? null;
  const ended = entries.at(-1)?.timestamp ?? null;
  if (phases.length && ended) phases.at(-1).end = ended;
  const status =
    submitted || exited || (lastStop === "stop" && finalReply) ? "done" : lastStop === "error" ? "failed" : "running";

  // Each render's share of the spend: since this arm's previous render of the same sample (or the phase start).
  const spentAt = (at) => {
    let value = 0;
    for (const [time, total] of spend) if (time <= at) value = total;
    return value;
  };
  const last = new Map();
  for (const event of events) {
    if (event.kind !== "snap") continue;
    const before = last.get(event.slug) ?? spentAt(phases.find((item) => item.id === event.phase)?.start ?? started);
    const now = spentAt(event.at);
    event.cost = Math.round((now - before) * 100) / 100;
    event.total = Math.round(now * 100) / 100;
    last.set(event.slug, now);
  }

  return {
    agent: arm.agent,
    status,
    task: init?.task ?? null,
    model,
    effort,
    started,
    ended,
    wallSeconds: started && ended ? seconds(started, ended) : 0,
    cost: Math.round(cost * 100) / 100,
    tokens,
    calls,
    toolCalls: Object.values(toolsByName).reduce((sum, value) => sum + value, 0),
    toolsByName,
    edits,
    compactions,
    errors,
    phases: phases.map((item) => ({ ...item, cost: Math.round(item.cost * 100) / 100 })),
    spend,
    events,
    finalReply: status === "done" ? finalReply : null,
  };
}

/** Every arm of the round in `manifest` (the parsed round.json). */
export async function roundLog(manifest, repo) {
  const directory = join(homedir(), manifest.logDir);
  const arms = {};
  for (const arm of manifest.arms) {
    const file = join(directory, `${arm.agent}.jsonl`);
    if (!existsSync(file)) {
      arms[arm.id] = { agent: arm.agent, status: "waiting" };
      continue;
    }
    arms[arm.id] = parse((await readFile(file, "utf8")).split("\n"), repo, arm);
  }
  return { generated: new Date().toISOString(), arms };
}
