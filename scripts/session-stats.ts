// Build cost and time for one builder agent, read from its omp session log. Copied from the Creature Lab
// (nilo-creature-lab site/scripts/stats.ts at 12f5eb6); this repo owns its copy.
//
// Every assistant message records its model, token usage and cost at API list
// prices. Active time counts only the time an agent was producing a model reply or running a
// tool (the gap before each assistant message, tool start and tool result).
// Waiting is left out: results of tools that block on other agents, and
// anything after a turn ended, a result was submitted or the session exited.
import { readFile } from "node:fs/promises";

export type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number; total: number };

export type BuildStats = {
  model: string;
  /** Reasoning effort the builder ran at ("low", "xhigh", ...), or "unknown" when its log never recorded one. */
  effort: string;
  calls: number;
  /** Active seconds: producing replies or running tools, not waiting. */
  seconds: number;
  tokens: Tokens;
  /** USD at list prices. */
  cost: number;
  /** The builder submitted a result after its last prompt. */
  finished: boolean;
};

export type NoteSection = { title: string; lines: string[] };

type ContentPart = { type: string; id?: string; name?: string; text?: string; arguments?: { op?: string } };
type Usage = {
  input?: number;
  output?: number;
  cacheRead?: number;
  cacheWrite?: number;
  totalTokens?: number;
  cost?: { total?: number };
};
type Message = {
  role?: string;
  model?: string;
  usage?: Usage;
  content?: ContentPart[] | string;
  toolName?: string;
  toolCallId?: string;
  details?: { data?: unknown };
};
type Entry = { type?: string; customType?: string; timestamp?: string; message?: Message; thinkingLevel?: string };

/** Display names for logged model ids; provenance in agentic-3js-builder names each snapshot's model with it. */
export const MODEL_NAMES: Record<string, string> = {
  "gpt-6-astra": "GPT-6 Astra",
  "gpt-6-sol": "GPT-6 Sol",
  "claude-opus-5-5": "Claude Opus 5.5",
  "claude-sonnet-5-5": "Claude Sonnet 5.5",
  "gemini-3.8-flash": "Gemini 3.8 Flash",
  "google/gemini-3.7-flash": "Gemini 3.7 Flash",
};
const WAIT_TOOLS: Record<string, true> = { wait: true, task: true };
const TOKEN_KEYS = ["input", "output", "cacheRead", "cacheWrite"] as const;

function parts(message: Message) {
  return Array.isArray(message.content) ? message.content : [];
}

/** After this entry the agent sits idle until someone wakes it. */
function turnEnded(entry: Entry) {
  if (entry.type === "custom" && entry.customType === "session_exit") return true;
  if (entry.type !== "message" || !entry.message) return false;
  const { message } = entry;
  if (message.role === "toolResult") return message.toolName === "yield";
  if (message.role === "assistant") return !parts(message).some((part) => part.type === "toolCall");
  return false;
}

function label(key: string) {
  const words = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The builder's free-text notes from its last submitted result: every string list and every long string. */
function notesFrom(data: unknown): NoteSection[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [];
  const sections: NoteSection[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length && value.every((item) => typeof item === "string"))
      sections.push({ title: label(key), lines: value });
    else if (typeof value === "string" && value.length > 40 && !value.startsWith("/"))
      sections.push({ title: label(key), lines: [value] });
  }
  return sections;
}

export async function collectSession(path: string): Promise<{ stats: BuildStats; notes: NoteSection[] } | null> {
  const text = await readFile(path, "utf8").catch(() => null);
  if (text === null) return null;
  const entries: Entry[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    // A builder may be mid-write on the last line; skip anything unparsable.
    try {
      const entry = JSON.parse(line) as Entry;
      if (entry.timestamp) entries.push(entry);
    } catch {
      continue;
    }
  }
  entries.sort((a, b) => (a.timestamp! < b.timestamp! ? -1 : a.timestamp! > b.timestamp! ? 1 : 0));

  const tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 };
  const models = new Map<string, number>();
  // Model calls per reasoning effort, so a mid-build change counts for the calls it covered.
  const efforts = new Map<string, number>();
  let effort: string | null = null;
  const waits = new Set<string>();
  let calls = 0;
  let cost = 0;
  let milliseconds = 0;
  let previous: Entry | null = null;
  let lastPrompt = "";
  let lastYield = "";
  let yieldData: unknown = null;
  let lastText = "";
  let lastToolCall = "";

  for (const entry of entries) {
    const message = entry.type === "message" ? entry.message : undefined;
    const role = message?.role;
    if (role === "assistant")
      for (const part of parts(message!))
        if (
          part.type === "toolCall" &&
          part.id &&
          ((part.name && WAIT_TOOLS[part.name]) ||
            (part.name === "hub" && (part.arguments?.op === "wait" || part.arguments?.op === "jobs")))
        )
          waits.add(part.id);
    const started = entry.type === "custom" && entry.customType === "tool_execution_start";
    const working = started || role === "assistant" || (role === "toolResult" && !waits.has(message!.toolCallId ?? ""));
    if (previous && working && !turnEnded(previous))
      milliseconds += Date.parse(entry.timestamp!) - Date.parse(previous.timestamp!);
    previous = entry;

    if (entry.type === "thinking_level_change" && entry.thinkingLevel) effort = entry.thinkingLevel;
    if (role === "user" || entry.type === "custom_message") lastPrompt = entry.timestamp!;
    if (role === "toolResult" && message!.toolName === "yield") {
      lastYield = entry.timestamp!;
      // Short re-yields (acknowledging a notice) must not replace the real final notes.
      const data = message!.details?.data;
      if (data !== undefined && JSON.stringify(data).length >= JSON.stringify(yieldData ?? "").length * 0.6)
        yieldData = data;
    }
    if (role !== "assistant") continue;
    const texts = parts(message!).filter((part) => part.type === "text" && part.text?.trim());
    if (texts.length) lastText = texts.map((part) => part.text).join("\n");
    if (parts(message!).some((part) => part.type === "toolCall")) lastToolCall = entry.timestamp!;
    const usage = message!.usage ?? {};
    calls++;
    for (const key of TOKEN_KEYS) tokens[key] += usage[key] ?? 0;
    tokens.total += usage.totalTokens ?? TOKEN_KEYS.reduce((sum, key) => sum + (usage[key] ?? 0), 0);
    cost += usage.cost?.total ?? 0;
    const model = message!.model ?? "unknown";
    models.set(model, (models.get(model) ?? 0) + 1);
    if (effort) efforts.set(effort, (efforts.get(effort) ?? 0) + 1);
  }

  const topModel = [...models.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
  const notes = notesFrom(yieldData);
  if (!notes.length && lastYield && lastText)
    notes.push({ title: "Final reply", lines: lastText.split(/\n+/).filter((line) => line.trim()) });
  return {
    stats: {
      model: MODEL_NAMES[topModel] ?? topModel,
      effort: [...efforts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? effort ?? "unknown",
      calls,
      seconds: Math.round(milliseconds / 1000),
      tokens,
      cost: Number(cost.toFixed(4)),
      // A prompt the agent answered without any tool call (e.g. a broadcast
      // notice) doesn't reopen a finished build.
      finished: lastYield !== "" && (lastYield > lastPrompt || lastToolCall < lastPrompt),
    },
    notes,
  };
}
