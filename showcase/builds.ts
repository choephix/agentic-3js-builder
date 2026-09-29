// How each sample was built: the agent that first wrote it, its model, effort, cost, time, tokens and render rounds.
// `npm run provenance` (scripts/provenance.ts) extracts these from the omp session logs and the harness reports
// into `samples/<slug>.build.json`; builders never write them. A value the logs can't give is null, and `caveats`
// holds the reason under the field's name; a value that is only a lower bound keeps its number and a caveat too.
// Shown in the Info panel's Build section, the sample list's tooltips and the Builds table.
import { h } from "./dom";
import type { Child } from "./dom";

export type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number; total: number };

export type Builder = {
  /** Subagent name, or the session title (or id) for a top-level session. */
  agent: string;
  /** Session log, relative to ~/.omp/profiles/nilo/agent/sessions. */
  session: string;
  /** The session it was spawned or forked from, same form; null when none. */
  parent: string | null;
  /** Display name of the model behind most of its calls. */
  model: string | null;
  /** `provider/model` as logged; the provider is the account that served it. */
  modelId: string | null;
  api: string | null;
  /** Reasoning effort, the level that covered most calls. */
  effort: string | null;
  /** "sample": the session wrote only this sample. "shared": it also wrote other files, so its usage can't be split. */
  scope: "sample" | "shared";
};

/** A shared session's whole-log numbers, for context: they cover every file it wrote, not this sample. */
export type SessionTotals = {
  wallSeconds: number;
  activeSeconds: number;
  cost: number;
  tokens: Tokens;
  calls: number;
  toolCalls: number;
  /** Samples the session created. */
  samples: string[];
  /** Other files it wrote or edited in the repo. */
  otherFiles: number;
};

export type Render = { tag: string; errors: number; warnings: number; note?: string };
/** What the rendering session spent, from the logged model calls in a time window. */
export type Spend = { cost: number; tokens: number; calls: number; seconds: number };
/** One rendered version (an `npm run snap` tag) and the session and model that rendered it. */
export type Version = {
  tag: string;
  arm: "A" | "B";
  /** When its contact sheet was written. */
  rendered: string;
  /** The session that ran the render, as in `Builder`; all null with a `note` when no logged session did. */
  agent: string | null;
  session: string | null;
  /** Display name of the model that issued the render command. */
  model: string | null;
  /** `provider/model` as logged. */
  modelId: string | null;
  /** Reasoning effort in force at that command. */
  effort: string | null;
  /**
   * This iteration: the rendering session's model calls since its previous render of this sample (or since it
   * started), up to this render. Null when that session also worked on other samples, so its usage can't be split.
   */
  spent: Spend | null;
  /** If the build had stopped here: `spent` summed over this and every earlier version. Null when any is null. */
  total: Spend | null;
  note?: string;
};

export type Build = {
  slug: string;
  builder: Builder | null;
  /** The logged write that created the file (possibly under an earlier name from git history). */
  created: string | null;
  /** First log entry and final reply. */
  started: string | null;
  ended: string | null;
  wallSeconds: number | null;
  /** Producing replies or running tools, not waiting (creature-lab stats.ts). */
  activeSeconds: number | null;
  /** USD at API list prices, as logged per call. */
  cost: number | null;
  tokens: Tokens | null;
  /** Model calls (assistant messages). */
  calls: number | null;
  toolCalls: number | null;
  /** Successful write/edit calls on the sample file. Edits made through shell commands aren't counted. */
  edits: number | null;
  typechecks: number | null;
  /** `npm run snap` runs for this slug, and the tags they rendered in first-run order. */
  snaps: number | null;
  tags: string[];
  finalTag: string | null;
  /** Harness report issues for each of the builder's tags. */
  renders: Render[];
  /** Model calls that failed, and when the next prompt resumed the run. */
  interruptions: Array<{ at: string; error: string; resumed: string | null }>;
  compactions: number | null;
  /** The builder submitted a result after its last prompt. */
  finished: boolean | null;
  session: SessionTotals | null;
  /** Every rendered version on disk, oldest first, whoever rendered it. */
  versions: Version[];
  /** Other sessions that edited the file afterwards, with write/edit calls. */
  laterEdits: Array<{
    agent: string;
    session: string;
    model: string | null;
    first: string;
    last: string;
    edits: number;
  }>;
  caveats: Record<string, string>;
};

export const builds: Record<string, Build> = Object.fromEntries(
  Object.values(import.meta.glob<Build>("../samples/*.build.json", { eager: true, import: "default" })).map((build) => [
    build.slug,
    build,
  ]),
);

const money = (value: number) => `$${value.toFixed(2)}`;

export function duration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
  return `${Math.floor(seconds / 3600)}h ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}m`;
}

export function tokens(value: number) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${Math.round(value / 1e3)}k`;
  return String(value);
}

/** `text`, or "?" when the logs can't give it; a caveat shows on hover, and marks a present value as a lower bound. */
function known(build: Build, field: string, text: string | null): Child {
  const caveat = build.caveats[field];
  if (!caveat) return text ?? "—";
  return h("span", { class: "caveat", "data-tip": caveat }, text === null ? "?" : `≥ ${text}`);
}

const utc = (iso: string) => `${iso.slice(0, 16).replace("T", " ")} UTC`;

/** One line for the sample list's tooltip, or null without a record. */
export function buildTip(build: Build | undefined) {
  const builder = build?.builder;
  if (!build || !builder) return null;
  return [
    `${builder.model ?? "unknown model"}${builder.effort ? ` ${builder.effort}` : ""}`,
    builder.scope === "shared" ? `${builder.agent}, shared session` : null,
    build.cost === null ? null : `${build.caveats.cost ? "≥ " : ""}${money(build.cost)}`,
    build.wallSeconds === null ? null : duration(build.wallSeconds),
    build.tags.length ? `${build.tags.length} tags` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Who built the sample, from its build record: the builder's model and effort, then any other models that rendered
 * later versions ("Claude Opus 5.5 high, then GPT-6 Sol"). Null without a record naming a model.
 */
export function builtBy(build: Build | undefined) {
  if (!build) return null;
  const first = build.builder?.model ?? build.versions.find((version) => version.model)?.model ?? null;
  if (!first) return null;
  const effort = build.builder?.model ? build.builder.effort : null;
  const later = [...new Set(build.versions.map((version) => version.model))].filter(
    (model): model is string => model !== null && model !== first,
  );
  return `${first}${effort ? ` ${effort}` : ""}${later.length ? `, then ${later.join(", ")}` : ""}`;
}

function issueText(build: Build) {
  const flagged = build.renders.filter((render) => render.errors || render.warnings);
  return flagged
    .map(
      (render) =>
        `${render.tag}: ${[render.errors ? `${render.errors} errors` : "", render.warnings ? `${render.warnings} warnings` : ""].filter(Boolean).join(", ")}`,
    )
    .join("; ");
}

// The Build section stays as the reader left it across samples and re-renders.
let sectionOpen = false;

/** The Info panel's Build section, collapsed until opened. */
export function buildSection(build: Build | undefined) {
  const rows: Array<[string, Child]> = [];
  const builder = build?.builder;
  if (build && builder) {
    const shared = builder.scope === "shared";
    rows.push(
      [
        "Builder",
        h(
          "span",
          { "data-tip": builder.session },
          builder.agent,
          shared ? h("span", { class: "chip" }, "shared") : null,
        ),
      ],
      ["Model", h("span", { "data-tip": builder.modelId ?? "" }, builder.model ?? "?")],
      ["Effort", known(build, "effort", builder.effort)],
      ["Provider", `${builder.modelId?.split("/")[0] ?? "?"}${builder.api ? ` · ${builder.api}` : ""}`],
      ["Created", build.created ? utc(build.created) : "—"],
      ["Cost", known(build, "cost", build.cost === null ? null : money(build.cost))],
      ["Wall", known(build, "wallSeconds", build.wallSeconds === null ? null : duration(build.wallSeconds))],
      ["Active", known(build, "activeSeconds", build.activeSeconds === null ? null : duration(build.activeSeconds))],
      ["Tokens", known(build, "tokens", build.tokens ? tokens(build.tokens.total) : null)],
    );
    if (build.tokens)
      rows.push(
        ["In · out", `${tokens(build.tokens.input)} · ${tokens(build.tokens.output)}`],
        ["Cache", `${tokens(build.tokens.cacheRead)} read · ${tokens(build.tokens.cacheWrite)} write`],
      );
    rows.push(
      ["Calls", known(build, "calls", build.calls === null ? null : String(build.calls))],
      ["Tool calls", known(build, "toolCalls", build.toolCalls === null ? null : String(build.toolCalls))],
      ["Edits", known(build, "edits", build.edits === null ? null : String(build.edits))],
      ["Typechecks", known(build, "typechecks", build.typechecks === null ? null : String(build.typechecks))],
      ["Renders", known(build, "tags", build.tags.length ? `${build.tags.length} tags · ${build.snaps} snaps` : null)],
      ["Final", build.finalTag ?? "—"],
      ["Issues", build.renders.length ? issueText(build) || `none in ${build.renders.length} reports` : "—"],
    );
    for (const render of build.renders)
      if (render.note) rows.push(["", h("span", { class: "muted" }, `${render.tag}: ${render.note}`)]);
    for (const stop of build.interruptions)
      rows.push([
        "Dropped",
        h(
          "span",
          { "data-tip": stop.error },
          `${stop.at.slice(11, 19)}${stop.resumed ? `, resumed ${stop.resumed.slice(11, 19)}` : ", not resumed"}`,
        ),
      ]);
    rows.push(["Submitted", known(build, "finished", build.finished === null ? null : build.finished ? "yes" : "no")]);
    if (build.session)
      rows.push(
        [
          "Session",
          `${money(build.session.cost)} · ${duration(build.session.activeSeconds)} active · ${build.session.calls} calls`,
        ],
        ["Covers", `${build.session.samples.length} samples · ${build.session.otherFiles} other files`],
      );
    for (const [i, edit] of build.laterEdits.entries())
      rows.push([
        i ? "" : "Edited by",
        h(
          "span",
          { "data-tip": `${edit.session}, ${utc(edit.first)} to ${utc(edit.last)}` },
          `${edit.agent} `,
          h("span", { class: "muted" }, `${edit.model ?? "?"} · ${edit.edits}`),
        ),
      ]);
  }
  const details = h(
    "details",
    { class: "parts build", open: sectionOpen, ontoggle: () => (sectionOpen = details.open) },
    h("summary", null, "Build"),
    rows.length
      ? h("dl", { class: "grid" }, ...rows.flatMap(([label, value]) => [h("dt", null, label), h("dd", null, value)]))
      : h(
          "p",
          { class: "muted" },
          build ? "No logged session wrote this sample." : "No build record: npm run provenance",
        ),
  );
  return details;
}

type Column = {
  label: string;
  tip?: string;
  /** Sort key; null sorts last. */
  key: (build: Build) => number | string | null;
  cell: (build: Build) => Child;
  numeric?: boolean;
};

const shared = (build: Build, value: Child): Child =>
  build.session
    ? h(
        "span",
        {
          class: "caveat muted",
          "data-tip": `${build.builder?.agent} session: ${money(build.session.cost)}, ${duration(build.session.activeSeconds)} active, ${build.session.calls} calls for the SDK, ${build.session.samples.length} samples and ${build.session.otherFiles} other files`,
        },
        "shared",
      )
    : value;

const COLUMNS: Column[] = [
  { label: "Sample", key: (build) => build.slug, cell: (build) => build.slug },
  { label: "Builder", key: (build) => build.builder?.agent ?? null, cell: (build) => build.builder?.agent ?? "?" },
  { label: "Model", key: (build) => build.builder?.model ?? null, cell: (build) => build.builder?.model ?? "?" },
  {
    label: "Effort",
    key: (build) => build.builder?.effort ?? null,
    cell: (build) => known(build, "effort", build.builder?.effort ?? null),
  },
  {
    label: "Cost",
    numeric: true,
    key: (build) => build.cost,
    cell: (build) => shared(build, known(build, "cost", build.cost === null ? null : money(build.cost))),
  },
  {
    label: "Wall",
    numeric: true,
    key: (build) => build.wallSeconds,
    cell: (build) =>
      shared(build, known(build, "wallSeconds", build.wallSeconds === null ? null : duration(build.wallSeconds))),
  },
  {
    label: "Active",
    numeric: true,
    key: (build) => build.activeSeconds,
    cell: (build) =>
      shared(build, known(build, "activeSeconds", build.activeSeconds === null ? null : duration(build.activeSeconds))),
  },
  {
    label: "Tokens",
    numeric: true,
    key: (build) => build.tokens?.total ?? null,
    cell: (build) => shared(build, known(build, "tokens", build.tokens ? tokens(build.tokens.total) : null)),
  },
  {
    label: "Out",
    tip: "Output tokens",
    numeric: true,
    key: (build) => build.tokens?.output ?? null,
    cell: (build) => shared(build, known(build, "tokens", build.tokens ? tokens(build.tokens.output) : null)),
  },
  {
    label: "Calls",
    tip: "Model calls",
    numeric: true,
    key: (build) => build.calls,
    cell: (build) => shared(build, known(build, "calls", build.calls === null ? null : String(build.calls))),
  },
  {
    label: "Edits",
    tip: "Write and edit calls on the sample file",
    numeric: true,
    key: (build) => build.edits,
    cell: (build) => known(build, "edits", build.edits === null ? null : String(build.edits)),
  },
  {
    label: "Tags",
    tip: "Snapshot tags the builder rendered",
    numeric: true,
    key: (build) => (build.tags.length ? build.tags.length : null),
    cell: (build) => known(build, "tags", build.tags.length ? String(build.tags.length) : null),
  },
  { label: "Final", key: (build) => build.finalTag, cell: (build) => build.finalTag ?? "—" },
  {
    label: "Issues",
    tip: "Harness report warnings and errors over the builder's tags",
    numeric: true,
    key: (build) =>
      build.renders.length ? build.renders.reduce((sum, render) => sum + render.errors + render.warnings, 0) : null,
    cell: (build) => {
      if (!build.renders.length) return "—";
      const total = build.renders.reduce((sum, render) => sum + render.errors + render.warnings, 0);
      return total ? h("span", { class: "warn", "data-tip": issueText(build) }, String(total)) : "0";
    },
  },
];

// Sort order survives closing and reopening the table.
let sortBy = 2;
let descending = false;

/** Every sample's build side by side; a row click picks that sample. */
export function buildsTable(selected: string, choose: (slug: string) => void): HTMLElement {
  const column = COLUMNS[sortBy];
  const rows = Object.values(builds).sort((a, b) => {
    const [x, y] = [column.key(a), column.key(b)];
    if (x === y) return a.slug.localeCompare(b.slug);
    if (x === null) return 1;
    if (y === null) return -1;
    return (x < y ? -1 : 1) * (descending ? -1 : 1);
  });
  const table: HTMLElement = h(
    "table",
    { class: "builds" },
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        ...COLUMNS.map((item, i) =>
          h(
            "th",
            {
              class: `${item.numeric ? "num" : ""}${i === sortBy ? (descending ? " sorted down" : " sorted") : ""}`,
              "data-tip": item.tip,
              onclick: () => {
                descending = i === sortBy ? !descending : Boolean(item.numeric);
                sortBy = i;
                table.replaceWith(buildsTable(selected, choose));
              },
            },
            item.label,
          ),
        ),
      ),
    ),
    h(
      "tbody",
      null,
      ...rows.map((build) =>
        h(
          "tr",
          { class: build.slug === selected ? "on" : "", onclick: () => choose(build.slug) },
          ...COLUMNS.map((item) => h("td", { class: item.numeric ? "num" : "" }, item.cell(build))),
        ),
      ),
    ),
  );
  return table;
}
