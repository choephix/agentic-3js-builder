// Experiment rounds: the same subjects built by several builders at once, each arm with its own toolkit. One page
// shows how a round went: live status and spend, the renders side by side (blind if wanted), the models live in 3D
// under one camera, a timeline of every edit, typecheck and render, and each builder's prompt, notes, toolkit and
// sources. Data: rounds.ts and round-files.ts (manifest, markdown, toolkits), `/__round/<id>` (round-log.mjs, from
// the builders' session logs), `/__snapshots/<slug>` with the reports it points at, and `/__sample-source/<slug>`.
import { marked } from "marked";
import { duration, tokens as tokenText } from "./builds";
import { modules as sampleModules } from "./catalog";
import type { Catalog } from "./catalog";
import { h } from "./dom";
import type { Child } from "./dom";
import { inspect } from "./inspect";
import { Lightbox, count, loadReport, loadSnapshots, loadText } from "./renders";
import type { Report, Snapshot } from "./renders";
import { manifests, markdown, toolkits } from "./round-files";
import type { RoundFiles } from "./round-files";
import { slugOf, testSlug } from "./rounds";
import type { Arm, Round, Subject } from "./rounds";
import { diffListing, listing } from "./source";
import { Viewer } from "./viewer";

// ── Round log (round-log.mjs) ────────────────────────────────────────────────────────────────────────────────────

type Phase = { id: string; start: string; end: string; cost: number; calls: number };
type LogEvent = {
  at: string;
  end: string;
  kind: "write" | "edit" | "snap" | "report" | "typecheck" | "format" | "shell" | "read" | "other";
  ok: boolean;
  phase: string;
  label: string;
  path?: string;
  lines?: number;
  slug?: string;
  tag?: string;
  gpu?: boolean;
  errors?: number;
  ownErrors?: number;
  detail?: string;
  /** Renders: spend since this arm's previous render of the sample, and the arm's total so far. */
  cost?: number;
  total?: number;
};
type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number; total: number };
type ArmLog = {
  agent: string;
  status: "waiting" | "running" | "done" | "failed";
  task: string | null;
  model: string | null;
  effort: string | null;
  started: string | null;
  ended: string | null;
  wallSeconds: number;
  cost: number;
  tokens: Tokens;
  calls: number;
  toolCalls: number;
  toolsByName: Record<string, number>;
  edits: Record<string, number>;
  compactions: number;
  errors: Array<{ at: string; message: string }>;
  phases: Phase[];
  spend: Array<[string, number]>;
  events: LogEvent[];
  finalReply: string | null;
};
type RoundLog = { generated: string; arms: Record<string, Partial<ArmLog>> };

const EMPTY: ArmLog = {
  agent: "",
  status: "waiting",
  task: null,
  model: null,
  effort: null,
  started: null,
  ended: null,
  wallSeconds: 0,
  cost: 0,
  tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  calls: 0,
  toolCalls: 0,
  toolsByName: {},
  edits: {},
  compactions: 0,
  errors: [],
  phases: [],
  spend: [],
  events: [],
  finalReply: null,
};

// ── State ────────────────────────────────────────────────────────────────────────────────────────────────────────

type Tab = "overview" | "compare" | "timeline" | "builders" | "brief";
const TABS: Array<[Tab, string]> = [
  ["overview", "Overview"],
  ["compare", "Compare"],
  ["timeline", "Timeline"],
  ["builders", "Builders"],
  ["brief", "Brief"],
];
/** The harness shots in its order, then the whole contact sheet. */
const SHOTS = [
  "three-quarter",
  "front",
  "side",
  "back",
  "top",
  "low",
  "head",
  "flex-a",
  "flex-b",
  "bones",
  "skeleton",
  "skeleton-side",
  "atlas",
  "sheet",
];
const ARM_COLORS = ["#5c6370", "#c2255c", "#1c7ed6", "#2b8a3e", "#e67700", "#7048e8"];
const SUBJECT_COLORS = ["#e8590c", "#0c8599", "#9c36b5", "#5c940d"];
const FIXED_PHASES: Record<string, { color: string; name: string }> = {
  setup: { color: "#adb5bd", name: "Reading" },
  toolkit: { color: "#7048e8", name: "Toolkit" },
  test: { color: "#b197fc", name: "Toolkit test" },
  notes: { color: "#868e96", name: "Notes" },
};

let files: RoundFiles = { manifests, markdown, toolkits };
let modules: Catalog["modules"] = sampleModules;
const params = new URLSearchParams(location.search);
const rounds = () => Object.values(files.manifests).sort((a, b) => (a.started < b.started ? 1 : -1));
let round: Round | undefined = rounds().find((item) => item.id === params.get("round")) ?? rounds()[0];

const state = {
  tab: (TABS.find(([id]) => id === params.get("tab"))?.[0] ?? "overview") as Tab,
  subject: params.get("subject") ?? "",
  shot: SHOTS.includes(params.get("shot") ?? "") ? params.get("shot")! : "three-quarter",
  /** "final" or a 1-based render index. */
  step: params.get("step") ?? "final",
  view: params.get("view") === "live" ? "live" : "renders",
  blind: params.get("blind") === "1",
  seed: Number(params.get("seed") ?? 1) || 1,
  revealed: false,
  arm: params.get("arm") ?? "",
  events: params.get("events") ?? "work",
  eventArm: params.get("eventArm") ?? "all",
  wiggle: false,
  bones: false,
  skeleton: false,
};

function save() {
  if (!round) return;
  const next = new URLSearchParams({ round: round.id, tab: state.tab });
  if (state.tab === "compare") {
    next.set("subject", state.subject);
    next.set("shot", state.shot);
    next.set("step", state.step);
    if (state.view === "live") next.set("view", "live");
    if (state.blind) (next.set("blind", "1"), next.set("seed", String(state.seed)));
  }
  if (state.tab === "builders") next.set("arm", state.arm);
  if (state.tab === "timeline") (next.set("events", state.events), next.set("eventArm", state.eventArm));
  history.replaceState(null, "", `?${next}`);
}

// ── Data ─────────────────────────────────────────────────────────────────────────────────────────────────────────

let log: RoundLog = { generated: "", arms: {} };
let fetched = 0;
/** Every render of a slug, oldest first. */
const snaps = new Map<string, Snapshot[]>();
const reports = new Map<string, Report | null>();
const sources = new Map<string, string | null>();
const texts = new Map<string, string | null>();

const armLog = (arm: Arm): ArmLog => ({ ...EMPTY, agent: arm.agent, ...log.arms[arm.id] }) as ArmLog;
const armColor = (arm: Arm) => ARM_COLORS[round!.arms.indexOf(arm) % ARM_COLORS.length];
const subjectOf = () => round!.subjects.find((subject) => subject.id === state.subject) ?? round!.subjects[0];
const armOf = () => round!.arms.find((arm) => arm.id === state.arm) ?? round!.arms[0];
const phaseInfo = (id: string) => {
  const fixed = FIXED_PHASES[id];
  if (fixed) return fixed;
  const index = round!.subjects.findIndex((subject) => subject.id === id);
  return index < 0
    ? { color: "#ced4da", name: id }
    : { color: SUBJECT_COLORS[index % SUBJECT_COLORS.length], name: round!.subjects[index].name };
};

function allSlugs() {
  if (!round) return [];
  return round.arms.flatMap((arm) => [...round!.subjects.map((subject) => slugOf(subject, arm)), testSlug(arm)]);
}

const reportKey = (snap: Snapshot) => `${snap.report}#${snap.time}`;
const reportOf = (snap: Snapshot | undefined) => (snap?.report ? (reports.get(reportKey(snap)) ?? null) : null);
const shotOf = (snap: Snapshot, shot: string) =>
  shot === "sheet" ? snap.sheet : (snap.shots.find((item) => item.name === shot)?.url ?? snap.sheet);

async function refreshFiles() {
  if (!round) return;
  const prefix = `../experiments/${round.id}/`;
  const jobs: Array<Promise<void>> = [];
  for (const [path, load] of Object.entries(files.markdown))
    if (path.startsWith(prefix)) jobs.push(load().then((text) => void texts.set(path.slice(prefix.length), text)));
  for (const arm of round.arms) {
    const load = arm.toolkit ? files.toolkits[`../${arm.toolkit}`] : undefined;
    if (arm.toolkit) texts.set(arm.toolkit, null);
    if (load) jobs.push(load().then((text) => void texts.set(arm.toolkit!, text)));
  }
  await Promise.all(jobs);
}

async function refreshData() {
  if (!round) return;
  const response = await fetch(`/__round/${round.id}`).catch(() => null);
  if (response?.ok) log = (await response.json()) as RoundLog;
  const slugs = allSlugs();
  await Promise.all(
    slugs.map(async (slug) => {
      const found = await loadSnapshots(slug);
      snaps.set(
        slug,
        found.tags.filter((tag) => tag.arm === "B" || found.tags.every((other) => other.arm === "A")).reverse(),
      );
    }),
  );
  await Promise.all(
    slugs.flatMap((slug) =>
      (snaps.get(slug) ?? [])
        .filter((snap) => snap.report && !reports.has(reportKey(snap)))
        .map(async (snap) => void reports.set(reportKey(snap), await loadReport(snap.report, snap.time))),
    ),
  );
  await Promise.all(
    slugs.map(async (slug) => {
      const text = await fetch(`/__sample-source/${encodeURIComponent(slug)}`)
        // A sample not written yet falls through to the dev server's HTML fallback.
        .then((result) =>
          result.ok && !result.headers.get("content-type")?.includes("text/html") ? result.text() : null,
        )
        .catch(() => null);
      sources.set(slug, text);
    }),
  );
  fetched = Date.now();
}

/** What a re-render would show differently, cheaply. */
function signature() {
  return JSON.stringify([
    round?.arms.map((arm) => {
      const item = armLog(arm);
      return [item.status, item.events.length, item.cost, item.finalReply?.length];
    }),
    allSlugs().map((slug) => snaps.get(slug)?.length ?? 0),
  ]);
}

// ── Formatting ───────────────────────────────────────────────────────────────────────────────────────────────────

const money = (value: number) => `$${value.toFixed(2)}`;
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const lines = (text: string | null | undefined) => (text ? text.replace(/\n$/, "").split("\n").length : 0);
const secondsBetween = (from: string, to: string) =>
  Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 1000));
function sinceStart(iso: string) {
  const total = Math.round((Date.parse(iso) - startTime()) / 1000);
  const sign = total < 0 ? "−" : "+";
  const value = Math.abs(total);
  return `${sign}${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}
function startTime() {
  const starts = round!.arms.map((arm) => armLog(arm).started).filter((value): value is string => Boolean(value));
  return starts.length ? Math.min(...starts.map((value) => Date.parse(value))) : Date.parse(round!.started);
}
function endTime() {
  const running = round!.arms.some((arm) => ["running", "waiting"].includes(armLog(arm).status));
  const ends = round!.arms.map((arm) => armLog(arm).ended).filter((value): value is string => Boolean(value));
  const last = ends.length ? Math.max(...ends.map((value) => Date.parse(value))) : startTime();
  return running ? Math.max(last, Date.now()) : last;
}

function md(text: string | null | undefined, empty = "Not written yet.") {
  const element = h("div", { class: "md" });
  if (text) element.innerHTML = marked.parse(text, { async: false }) as string;
  else element.append(h("p", { class: "muted" }, empty));
  return element;
}

const STATUS_TEXT = { waiting: "not started", running: "running", done: "done", failed: "failed" } as const;
const statusDot = (status: ArmLog["status"]) => h("span", { class: `dot ${status}`, "data-tip": STATUS_TEXT[status] });

function armBadge(arm: Arm, label?: string) {
  return h("span", { class: "badge", style: `--arm:${armColor(arm)}` }, label ?? arm.letter);
}

function section(title: string, ...children: Array<Child | Child[]>) {
  return h("section", { class: "block" }, h("h2", null, title), ...children);
}

/** Current phase of a running arm: its last phase, with how long it has been in it. */
function currentPhase(item: ArmLog) {
  const phase = item.phases.at(-1);
  if (!phase) return null;
  return `${phaseInfo(phase.id).name} for ${duration(secondsBetween(phase.start, item.status === "running" ? new Date().toISOString() : phase.end))}`;
}

// ── Renders and blind order ──────────────────────────────────────────────────────────────────────────────────────

/** The render a column shows: the last one, or the n-th (clamped, with the real index). */
function pick(slug: string): { snap: Snapshot | undefined; index: number; total: number } {
  const list = snaps.get(slug) ?? [];
  if (!list.length) return { snap: undefined, index: 0, total: 0 };
  const wanted = state.step === "final" ? list.length : Math.min(Number(state.step), list.length);
  return { snap: list[wanted - 1], index: wanted, total: list.length };
}

/** The builder's render event for a slug and tag (spend up to it), if logged. */
function renderEvent(arm: Arm, slug: string, tag: string) {
  return armLog(arm)
    .events.filter((event) => event.kind === "snap" && event.slug === slug && event.tag === tag && event.ok)
    .at(-1);
}

function seeded(seed: number) {
  let value = seed >>> 0 || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

/** Arms in display order: as listed, or shuffled by the seed when blind. */
function ordered() {
  const arms = [...round!.arms];
  if (!state.blind) return arms;
  const random = seeded(state.seed);
  for (let i = arms.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arms[i], arms[j]] = [arms[j], arms[i]];
  }
  return arms;
}
const hidden = () => state.blind && !state.revealed;
const label = (arm: Arm, index: number) => (hidden() ? `Builder ${index + 1}` : `${arm.letter} · ${arm.name}`);

const lightbox = new Lightbox();
document.body.append(lightbox.element);
addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "Escape") lightbox.close();
  if (event.key === "ArrowLeft") lightbox.step(-1);
  if (event.key === "ArrowRight") lightbox.step(1);
  event.stopImmediatePropagation();
});

function reportStats(report: Report | null) {
  if (!report) return h("div", { class: "stats muted" }, "no report");
  const errors = report.issues.filter((issue) => issue.level === "error").length;
  const warnings = report.issues.length - errors;
  return h(
    "div",
    { class: "stats" },
    h("span", { "data-tip": "triangles" }, `${count(report.triangles)} tris`),
    h("span", { "data-tip": "parts" }, `${count(report.parts)} parts`),
    h("span", { "data-tip": "joints" }, `${report.joints.length} joints`),
    h("span", { "data-tip": "flat colours" }, `${report.colors} col`),
    h("span", { "data-tip": "size x × y × z, meters" }, `${report.size[1].toFixed(2)} m tall`),
    errors || warnings
      ? h(
          "span",
          {
            class: errors ? "bad" : "warn",
            "data-tip": report.issues.map((issue) => `${issue.level}: ${issue.message}`).join("\n"),
          },
          `${errors ? `${errors} err` : ""}${errors && warnings ? " " : ""}${warnings ? `${warnings} warn` : ""}`,
        )
      : h("span", { class: "good" }, "no issues"),
  );
}

// ── Header ───────────────────────────────────────────────────────────────────────────────────────────────────────

const headElement = document.getElementById("round-head")!;
const bodyElement = document.getElementById("round-body")!;

function renderHead() {
  if (!round) return;
  const running = round.arms.some((arm) => armLog(arm).status === "running");
  const total = round.arms.reduce((sum, arm) => sum + armLog(arm).cost, 0);
  const effort = [...new Set(round.arms.map((arm) => armLog(arm).effort).filter(Boolean))].join(", ");
  headElement.replaceChildren(
    h(
      "div",
      { class: "rh-top" },
      h(
        "div",
        { class: "rh-title" },
        h("h1", null, round.title),
        rounds().length > 1
          ? h(
              "select",
              {
                onchange: (event: Event) => {
                  location.search = `?round=${(event.target as HTMLSelectElement).value}`;
                },
              },
              ...rounds().map((item) => h("option", { value: item.id, selected: item.id === round!.id }, item.title)),
            )
          : null,
        h("p", { class: "question" }, round.question),
      ),
      h(
        "div",
        { class: "rh-meta" },
        h("span", null, h("b", null, round.model), effort ? ` · ${effort} thinking` : ""),
        h("span", null, `started ${clock(new Date(startTime()).toISOString())}`),
        h(
          "span",
          null,
          `${running ? "running for" : "took"} ${duration(Math.round((endTime() - startTime()) / 1000))}`,
        ),
        h("span", null, `${money(total)} so far`),
        h(
          "button",
          {
            class: "tog",
            "data-tip": fetched
              ? `Logs read ${new Date(fetched).toLocaleTimeString("en-GB")}; every 15 s while running`
              : "",
            onclick: async () => {
              await refreshData();
              render();
            },
          },
          running ? "● live" : "refresh",
        ),
        h("a", { class: "link", href: "/" }, "showcase ↗"),
      ),
    ),
    h(
      "div",
      { class: "rh-arms" },
      ...round.arms.map((arm) => {
        const item = armLog(arm);
        return h(
          "button",
          {
            class: "arm-pill",
            style: `--arm:${armColor(arm)}`,
            onclick: () => {
              state.tab = "builders";
              state.arm = arm.id;
              render();
            },
          },
          armBadge(arm),
          h("b", null, arm.name),
          statusDot(item.status),
          h("span", { class: "muted" }, item.status === "waiting" ? "not started" : (currentPhase(item) ?? "")),
          h("span", null, money(item.cost)),
        );
      }),
    ),
    h(
      "nav",
      { class: "rh-tabs" },
      ...TABS.map(([id, name], index) =>
        h(
          "button",
          {
            class: id === state.tab ? "on" : "",
            "data-tip": `${index + 1}`,
            onclick: () => {
              state.tab = id;
              render();
            },
          },
          name,
        ),
      ),
    ),
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────────────────────────────────────────

function latestRender(arm: Arm) {
  const all = [...round!.subjects.map((subject) => slugOf(subject, arm)), testSlug(arm)].flatMap((slug) =>
    (snaps.get(slug) ?? []).map((snap) => ({ slug, snap })),
  );
  return all.sort((a, b) => b.snap.time - a.snap.time)[0];
}

function overview() {
  const r = round!;
  const cards = r.arms.map((arm) => {
    const item = armLog(arm);
    const latest = latestRender(arm);
    const renders = item.events.filter((event) => event.kind === "snap" && event.ok).length;
    return h(
      "div",
      { class: "arm-card", style: `--arm:${armColor(arm)}` },
      h(
        "div",
        { class: "arm-card-head" },
        armBadge(arm),
        h("b", null, arm.name),
        statusDot(item.status),
        h("span", { class: "muted" }, STATUS_TEXT[item.status]),
      ),
      h("p", { class: "idea" }, arm.idea),
      latest
        ? h(
            "button",
            {
              class: "thumb",
              onclick: () =>
                lightbox.show([{ url: latest.snap.sheet, caption: `${latest.slug} · ${latest.snap.tag}` }], 0),
            },
            h("img", { src: shotOf(latest.snap, "three-quarter"), alt: "", loading: "lazy" }),
            h("span", { class: "cap" }, `${latest.slug} ${latest.snap.tag}`),
          )
        : h("div", { class: "thumb empty" }, "no render yet"),
      h(
        "dl",
        null,
        h("dt", null, "Now"),
        h("dd", null, item.status === "running" ? (currentPhase(item) ?? "—") : STATUS_TEXT[item.status]),
        h("dt", null, "Spend"),
        h("dd", null, `${money(item.cost)} · ${item.calls} calls · ${tokenText(item.tokens.total)} tokens`),
        h("dt", null, "Time"),
        h("dd", null, item.started ? duration(item.wallSeconds) : "—"),
        h("dt", null, "Renders"),
        h("dd", null, String(renders)),
      ),
    );
  });

  const finals = r.subjects.map((subject) =>
    h(
      "div",
      { class: "finals" },
      h(
        "div",
        { class: "finals-head" },
        h("h3", null, subject.name),
        h("span", { class: "muted" }, subject.summary),
        h(
          "button",
          {
            class: "tog",
            onclick: () => {
              state.tab = "compare";
              state.subject = subject.id;
              render();
            },
          },
          "Compare →",
        ),
      ),
      h(
        "div",
        { class: "finals-row" },
        ...r.arms.map((arm) => {
          const slug = slugOf(subject, arm);
          const list = snaps.get(slug) ?? [];
          const last = list.at(-1);
          return h(
            "figure",
            { style: `--arm:${armColor(arm)}` },
            last
              ? h(
                  "button",
                  {
                    class: "thumb",
                    onclick: () =>
                      lightbox.show(
                        r.arms
                          .map((other) => ({ other, snap: snaps.get(slugOf(subject, other))?.at(-1) }))
                          .filter((entry) => entry.snap)
                          .map((entry) => ({
                            url: shotOf(entry.snap!, "three-quarter"),
                            caption: `${entry.other.letter} · ${entry.other.name} · ${entry.snap!.tag}`,
                          })),
                        r.arms.filter((other) => snaps.get(slugOf(subject, other))?.length).indexOf(arm),
                      ),
                  },
                  h("img", { src: shotOf(last, "three-quarter"), alt: "", loading: "lazy" }),
                )
              : h("div", { class: "thumb empty" }, "no render yet"),
            h(
              "figcaption",
              null,
              armBadge(arm),
              ` ${arm.name}`,
              h("span", { class: "muted" }, last ? ` ${last.tag}` : ""),
            ),
          );
        }),
      ),
    ),
  );

  return [
    section("Builders", h("div", { class: "arm-cards" }, ...cards)),
    section("Latest renders", ...finals),
    section("Scoreboard", scoreboard()),
  ];
}

type Metric = {
  name: string;
  value: (arm: Arm) => number | null;
  show?: (value: number, arm: Arm) => Child;
  better?: "low" | "high";
  group?: string;
};

function phaseTotals(item: ArmLog, ids: string[]) {
  const phases = item.phases.filter((phase) => ids.includes(phase.id));
  if (!phases.length) return null;
  return {
    cost: phases.reduce((sum, phase) => sum + phase.cost, 0),
    seconds: phases.reduce((sum, phase) => sum + secondsBetween(phase.start, phase.end), 0),
  };
}

function scoreboard() {
  const r = round!;
  const metrics: Metric[] = [
    { group: "Whole run", name: "Cost", value: (arm) => armLog(arm).cost || null, show: money, better: "low" },
    {
      name: "Wall time",
      value: (arm) => armLog(arm).wallSeconds || null,
      show: (value) => duration(value),
      better: "low",
    },
    { name: "Model calls", value: (arm) => armLog(arm).calls || null, better: "low" },
    { name: "Tool calls", value: (arm) => armLog(arm).toolCalls || null },
    {
      name: "Tokens",
      value: (arm) => armLog(arm).tokens.total || null,
      show: (value) => tokenText(value),
    },
    {
      name: "Typechecks",
      value: (arm) => armLog(arm).events.filter((event) => event.kind === "typecheck").length || null,
      show: (value, arm) => {
        const failing = armLog(arm).events.filter((event) => event.kind === "typecheck" && !event.ok).length;
        return `${value}${failing ? ` (${failing} with own errors)` : ""}`;
      },
    },
    {
      name: "Failed renders",
      value: (arm) => armLog(arm).events.filter((event) => event.kind === "snap" && !event.ok).length,
      show: (value, arm) => {
        const gpu = armLog(arm).events.filter((event) => event.kind === "snap" && event.gpu).length;
        return `${value}${gpu ? ` (${gpu} GPU)` : ""}`;
      },
      better: "low",
    },
    {
      group: "Toolkit",
      name: "Building it",
      value: (arm) => phaseTotals(armLog(arm), ["toolkit", "test"])?.cost ?? null,
      show: (value, arm) => `${money(value)} · ${duration(phaseTotals(armLog(arm), ["toolkit", "test"])!.seconds)}`,
    },
    {
      name: "Module lines",
      value: (arm) => (arm.toolkit ? lines(texts.get(arm.toolkit)) || null : null),
    },
    {
      name: "Module edits",
      value: (arm) => (arm.toolkit ? (armLog(arm).edits[arm.toolkit] ?? null) : null),
    },
  ];
  for (const subject of r.subjects) {
    const slug = (arm: Arm) => slugOf(subject, arm);
    const final = (arm: Arm) => reportOf(snaps.get(slug(arm))?.at(-1));
    metrics.push(
      {
        group: subject.name,
        name: "Spend on it",
        value: (arm) => phaseTotals(armLog(arm), [subject.id])?.cost ?? null,
        show: (value, arm) => `${money(value)} · ${duration(phaseTotals(armLog(arm), [subject.id])!.seconds)}`,
        better: "low",
      },
      {
        name: "Renders",
        value: (arm) => snaps.get(slug(arm))?.length || null,
        show: (value, arm) => `${value} (${snaps.get(slug(arm))!.at(-1)!.tag})`,
      },
      { name: "Sample lines", value: (arm) => lines(sources.get(slug(arm))) || null },
      { name: "Triangles", value: (arm) => final(arm)?.triangles ?? null, show: (value) => count(value) },
      { name: "Parts", value: (arm) => final(arm)?.parts ?? null },
      { name: "Joints", value: (arm) => final(arm)?.joints.length ?? null },
      { name: "Colours", value: (arm) => final(arm)?.colors ?? null },
      {
        name: "Height",
        value: (arm) => final(arm)?.size[1] ?? null,
        show: (value) => `${value.toFixed(2)} m`,
      },
      {
        name: "Report issues",
        value: (arm) => final(arm)?.issues.length ?? null,
        show: (value, arm) =>
          value
            ? h(
                "span",
                {
                  class: "bad",
                  "data-tip": final(arm)!
                    .issues.map((issue) => issue.message)
                    .join("\n"),
                },
                value,
              )
            : h("span", { class: "good" }, "0"),
        better: "low",
      },
    );
  }
  let group = "";
  const rows: HTMLElement[] = [];
  for (const metric of metrics) {
    if (metric.group && metric.group !== group) {
      group = metric.group;
      rows.push(h("tr", { class: "group" }, h("th", { colspan: r.arms.length + 1 }, group)));
    }
    const values = r.arms.map((arm) => metric.value(arm));
    const present = values.filter((value): value is number => value !== null);
    const best =
      metric.better && present.length > 1 && new Set(present).size > 1
        ? metric.better === "low"
          ? Math.min(...present)
          : Math.max(...present)
        : null;
    rows.push(
      h(
        "tr",
        null,
        h("th", null, metric.name),
        ...r.arms.map((arm, index) => {
          const value = values[index];
          return h(
            "td",
            { class: value !== null && value === best ? "best" : "" },
            value === null ? h("span", { class: "muted" }, "—") : metric.show ? metric.show(value, arm) : count(value),
          );
        }),
      ),
    );
  }
  return h(
    "table",
    { class: "score" },
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        h("th", null, ""),
        ...r.arms.map((arm) => h("th", { style: `--arm:${armColor(arm)}` }, armBadge(arm), ` ${arm.name}`)),
      ),
    ),
    h("tbody", null, ...rows),
  );
}

// ── Compare ──────────────────────────────────────────────────────────────────────────────────────────────────────

type Slot = {
  host: HTMLDivElement;
  viewer: Viewer | null;
  slug: string | null;
  error: string | null;
  loading: boolean;
};
const slots: Slot[] = [];
function slot(index: number) {
  while (slots.length <= index)
    slots.push({ host: h("div", { class: "live-host" }), viewer: null, slug: null, error: null, loading: false });
  const found = slots[index];
  if (!found.viewer) {
    const viewer = new Viewer(found.host);
    viewer.onView = (view) => {
      for (const other of slots) if (other !== found) other.viewer?.setView(view);
    };
    found.viewer = viewer;
  }
  return found;
}

async function loadLive(target: Slot, slug: string, keepCamera = false) {
  target.slug = slug;
  target.error = null;
  target.loading = true;
  const loader = modules[`../samples/${slug}.ts`];
  try {
    if (!loader) throw new Error("No sample file (yet).");
    const module = await loader();
    const root = module.default();
    target.viewer!.show(root, inspect(root), keepCamera);
    target.viewer!.setDisplay({ mode: state.bones ? "bones" : "shaded", skeleton: state.skeleton });
    target.viewer!.wiggle(state.wiggle);
    if (!state.wiggle) target.viewer!.pose(0);
  } catch (error) {
    target.error = error instanceof Error ? error.message : String(error);
    target.viewer!.show(null, null);
  }
  target.loading = false;
  target.host.dataset.error = target.error ?? "";
}

function compare() {
  const r = round!;
  const subject = subjectOf();
  const arms = ordered();
  const most = Math.max(0, ...r.arms.map((arm) => snaps.get(slugOf(subject, arm))?.length ?? 0));
  const seg = <T extends string>(options: Array<[T, string]>, current: string, set: (value: T) => void, tip = "") =>
    h(
      "div",
      { class: "seg", "data-tip": tip || null },
      ...options.map(([value, text]) =>
        h(
          "button",
          {
            class: value === current ? "on" : "",
            onclick: () => {
              set(value);
              render();
            },
          },
          text,
        ),
      ),
    );

  const toolbar = h(
    "div",
    { class: "toolbar" },
    seg(
      r.subjects.map((item) => [item.id, item.name] as [string, string]),
      subject.id,
      (value) => (state.subject = value),
    ),
    seg(
      [
        ["renders", "Renders"],
        ["live", "Live 3D"],
      ],
      state.view,
      (value) => (state.view = value),
      "Live 3D runs each sample's current file, one camera for all",
    ),
    state.view === "renders"
      ? seg(
          [
            ["final", "Final"],
            ...Array.from({ length: most }, (_, i) => [String(i + 1), `#${i + 1}`] as [string, string]),
          ],
          state.step,
          (value) => (state.step = value),
          "Each builder's last render, or its n-th",
        )
      : null,
    h("span", { class: "sep" }),
    h(
      "button",
      {
        class: `tog ${state.blind ? "on" : ""}`,
        "data-tip": "Hide who built what and shuffle the columns · B",
        onclick: () => {
          state.blind = !state.blind;
          state.revealed = false;
          render();
        },
      },
      "Blind",
    ),
    state.blind
      ? [
          h(
            "button",
            {
              class: "tog",
              onclick: () => {
                state.seed = Math.floor(Math.random() * 1e6) + 1;
                state.revealed = false;
                render();
              },
            },
            "Shuffle",
          ),
          h(
            "button",
            {
              class: `tog ${state.revealed ? "on" : ""}`,
              onclick: () => {
                state.revealed = !state.revealed;
                render();
              },
            },
            state.revealed ? "Hide" : "Reveal",
          ),
        ]
      : null,
    state.view === "live"
      ? [
          h("span", { class: "sep" }),
          liveToggle("Wiggle", "wiggle", (on) => slots.forEach((item) => item.viewer?.wiggle(on) ?? 0)),
          liveToggle("Bones", "bones", (on) =>
            slots.forEach((item) => item.viewer?.setDisplay({ mode: on ? "bones" : "shaded" })),
          ),
          liveToggle("Skeleton", "skeleton", (on) =>
            slots.forEach((item) => item.viewer?.setDisplay({ skeleton: on })),
          ),
          h(
            "button",
            {
              class: "tog",
              onclick: () => {
                slots[0]?.viewer?.frame();
                const view = slots[0]?.viewer?.view;
                if (view) for (const item of slots.slice(1)) item.viewer?.setView(view);
              },
            },
            "Reset camera",
          ),
        ]
      : null,
  );

  const shotBar =
    state.view === "renders"
      ? h(
          "div",
          { class: "toolbar shots" },
          ...SHOTS.map((shot) =>
            h(
              "button",
              {
                class: `chip-btn ${shot === state.shot ? "on" : ""}`,
                onclick: () => {
                  state.shot = shot;
                  render();
                },
              },
              shot,
            ),
          ),
          h("span", { class: "muted small" }, "← → change shot · click an image to flip between builders"),
        )
      : null;

  const cells = arms.map((arm, index) => {
    const slug = slugOf(subject, arm);
    const item = armLog(arm);
    const head = h(
      "div",
      { class: "cell-head" },
      hidden() ? h("span", { class: "badge anon" }, String(index + 1)) : armBadge(arm),
      h("b", null, label(arm, index)),
      hidden() ? null : statusDot(item.status),
    );
    if (state.view === "live") {
      const target = slot(index);
      if (target.slug !== slug) void loadLive(target, slug).then(() => renderLiveErrors());
      return h(
        "div",
        { class: "cell", style: hidden() ? "" : `--arm:${armColor(arm)}` },
        head,
        h("div", { class: "media live" }, target.host, h("div", { class: "live-error" })),
        h("div", { class: "stats muted" }, hidden() ? "current file" : `${slug}.ts, current file`),
      );
    }
    const { snap, index: at, total } = pick(slug);
    const event = snap && !hidden() ? renderEvent(arm, slug, snap.tag) : undefined;
    const media = snap
      ? h(
          "button",
          {
            class: "media",
            onclick: () => openAcross(subject, arms, state.shot, arms.indexOf(arm)),
          },
          h("img", { src: shotOf(snap, state.shot), alt: "", loading: "lazy" }),
        )
      : h("div", { class: "media empty" }, item.status === "waiting" ? "not started" : "no render yet");
    return h(
      "div",
      { class: "cell", style: hidden() ? "" : `--arm:${armColor(arm)}` },
      head,
      media,
      h(
        "div",
        { class: "cell-foot" },
        snap
          ? h(
              "div",
              { class: "tagline" },
              h("b", null, snap.tag),
              h("span", { class: "muted" }, ` render ${at} of ${total}`),
              state.step !== "final" && Number(state.step) > total
                ? h("span", { class: "warn" }, " (stopped earlier)")
                : null,
              event?.total !== undefined
                ? h(
                    "span",
                    { class: "muted", "data-tip": "This version (since its previous render) · builder total so far" },
                    ` · ${money(event.cost ?? 0)} · ${money(event.total)} total`,
                  )
                : null,
            )
          : null,
        reportStats(reportOf(snap)),
      ),
    );
  });

  const blocks: Child[] = [toolbar, shotBar, h("div", { class: `grid n${arms.length}` }, ...cells)];

  if (state.view === "renders" && arms.some((arm) => pick(slugOf(subject, arm)).snap)) {
    const table = h(
      "table",
      { class: "matrix" },
      h("thead", null, h("tr", null, h("th", null, ""), ...arms.map((arm, index) => h("th", null, label(arm, index))))),
      h(
        "tbody",
        null,
        ...SHOTS.filter((shot) => shot !== "sheet").map((shot) =>
          h(
            "tr",
            null,
            h("th", null, shot),
            ...arms.map((arm, index) => {
              const { snap } = pick(slugOf(subject, arm));
              return h(
                "td",
                null,
                snap
                  ? h(
                      "button",
                      { class: "thumb", onclick: () => openAcross(subject, arms, shot, index) },
                      h("img", { src: shotOf(snap, shot), alt: "", loading: "lazy" }),
                    )
                  : null,
              );
            }),
          ),
        ),
      ),
    );
    blocks.push(section("Every shot", table));
  }
  return blocks;
}

function liveToggle(text: string, key: "wiggle" | "bones" | "skeleton", apply: (on: boolean) => void) {
  return h(
    "button",
    {
      class: `tog ${state[key] ? "on" : ""}`,
      onclick: (event: Event) => {
        state[key] = !state[key];
        apply(state[key]);
        (event.currentTarget as HTMLElement).classList.toggle("on", state[key]);
      },
    },
    text,
  );
}

function renderLiveErrors() {
  for (const item of slots) {
    const box = item.host.parentElement?.querySelector(".live-error");
    if (box) box.textContent = item.error ?? "";
  }
}

/** One shot of the shown step across builders, in the lightbox. */
function openAcross(subject: Subject, arms: Arm[], shot: string, index: number) {
  const items = arms
    .map((arm, position) => ({ arm, position, snap: pick(slugOf(subject, arm)).snap }))
    .filter((entry) => entry.snap)
    .map((entry) => ({
      url: shotOf(entry.snap!, shot),
      caption: `${label(entry.arm, entry.position)} · ${hidden() ? "" : `${entry.snap!.tag} · `}${shot}`,
    }));
  const start = arms.slice(0, index).filter((arm) => pick(slugOf(subject, arm)).snap).length;
  lightbox.show(items, Math.min(start, items.length - 1));
}

// ── Timeline ─────────────────────────────────────────────────────────────────────────────────────────────────────

const SVG = "http://www.w3.org/2000/svg";
function s(
  tag: string,
  attributes: Record<string, string | number | null | undefined>,
  ...children: Array<Node | string>
) {
  const element = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes))
    if (value !== null && value !== undefined) element.setAttribute(key, String(value));
  element.append(...children);
  return element;
}

function timeline() {
  const r = round!;
  const width = Math.max(720, bodyElement.clientWidth - 52);
  const left = 128;
  const right = 16;
  const t0 = startTime();
  const t1 = Math.max(endTime(), t0 + 60_000);
  const x = (iso: string | number) =>
    left + (((typeof iso === "number" ? iso : Date.parse(iso)) - t0) / (t1 - t0)) * (width - left - right);
  const lane = 74;
  const top = 26;
  const height = top + lane * r.arms.length + 8;
  const svg = s("svg", { class: "lanes", width, height, viewBox: `0 0 ${width} ${height}` });

  // Minute grid.
  const minutes = (t1 - t0) / 60_000;
  const stepMinutes = [1, 2, 5, 10, 15, 20, 30, 60].find((step) => minutes / step <= 14) ?? 120;
  for (let minute = 0; minute <= minutes; minute += stepMinutes) {
    const at = x(t0 + minute * 60_000);
    svg.append(
      s("line", { x1: at, x2: at, y1: top - 6, y2: height, class: "grid-line" }),
      s("text", { x: at, y: 14, class: "axis", "text-anchor": "middle" }, `${minute}m`),
    );
  }

  r.arms.forEach((arm, index) => {
    const item = armLog(arm);
    const y = top + index * lane;
    svg.append(
      s("rect", { x: 0, y, width, height: lane - 6, class: index % 2 ? "lane odd" : "lane" }),
      s("text", { x: 10, y: y + 20, class: "lane-name", fill: armColor(arm) }, `${arm.letter} · ${arm.name}`),
      s("text", { x: 10, y: y + 36, class: "axis" }, `${money(item.cost)} · ${STATUS_TEXT[item.status]}`),
    );
    for (const phase of item.phases) {
      const info = phaseInfo(phase.id);
      const from = x(phase.start);
      const to = Math.max(from + 1, x(phase.end));
      const rect = s("rect", {
        x: from,
        y: y + 6,
        width: to - from,
        height: 16,
        rx: 2,
        fill: info.color,
        "data-tip": `${info.name}: ${duration(secondsBetween(phase.start, phase.end))}, ${money(phase.cost)}, ${phase.calls} calls`,
      });
      svg.append(rect);
      if (to - from > 56) svg.append(s("text", { x: from + 4, y: y + 18, class: "phase-name" }, info.name));
    }
    let lastLabel = -Infinity;
    for (const event of item.events) {
      const at = x(event.at);
      const tip = `${sinceStart(event.at)}  ${event.label}${event.detail ? `\n${event.detail.slice(-600)}` : ""}`;
      if (event.kind === "write" || event.kind === "edit") {
        svg.append(
          s("line", {
            x1: at,
            x2: at,
            y1: y + 27,
            y2: y + 37,
            class: "tick",
            stroke: phaseInfo(phaseFromPath(event.path ?? "", arm) ?? event.phase).color,
            "data-tip": `${sinceStart(event.at)}  ${event.label}${event.lines ? ` (+${event.lines} lines)` : ""}`,
          }),
        );
      } else if (event.kind === "typecheck") {
        svg.append(s("circle", { cx: at, cy: y + 47, r: 3.5, class: event.ok ? "tc ok" : "tc bad", "data-tip": tip }));
      } else if (event.kind === "snap" || event.kind === "report") {
        const size = event.kind === "snap" ? 6 : 3.5;
        const marker = s("path", {
          d: `M${at} ${y + 47 - size}L${at + size} ${y + 47}L${at} ${y + 47 + size}L${at - size} ${y + 47}Z`,
          class: `snapmark ${event.kind} ${event.ok ? "ok" : event.gpu ? "gpu" : "bad"}`,
          "data-tip": tip,
        });
        if (event.kind === "snap" && event.ok && event.slug && event.tag) {
          const found = snaps.get(event.slug)?.find((snap) => snap.tag === event.tag);
          if (found) {
            marker.addEventListener("click", () =>
              lightbox.show([{ url: found.sheet, caption: `${event.slug} · ${event.tag}` }], 0),
            );
            marker.classList.add("clickable");
          }
          if (at - lastLabel > 34) {
            svg.append(s("text", { x: at, y: y + 64, class: "axis", "text-anchor": "middle" }, event.tag));
            lastLabel = at;
          }
        }
        svg.append(marker);
      }
    }
    for (const error of item.errors)
      svg.append(
        s(
          "text",
          { x: x(error.at), y: y + 51, class: "err-mark", "text-anchor": "middle", "data-tip": error.message },
          "!",
        ),
      );
  });

  // Now line while running.
  if (r.arms.some((arm) => armLog(arm).status === "running"))
    svg.append(s("line", { x1: x(Date.now()), x2: x(Date.now()), y1: top - 6, y2: height, class: "now" }));

  const legend = h(
    "div",
    { class: "legend" },
    ...["setup", "toolkit", "test", ...r.subjects.map((subject) => subject.id), "notes"].map((id) =>
      h("span", null, h("i", { style: `background:${phaseInfo(id).color}` }), phaseInfo(id).name),
    ),
    h("span", null, h("i", { class: "l-tick" }), "edit"),
    h("span", null, h("i", { class: "l-tc" }), "typecheck (red: own errors)"),
    h("span", null, h("i", { class: "l-snap" }), "render (click: sheet; orange: GPU failure)"),
    h("span", null, h("i", { class: "l-report" }), "report only"),
  );

  return [
    section("Timeline", legend, h("div", { class: "scroll-x" }, svg)),
    section("Spend over time", spendChart(width, t0, t1, x)),
    section("Time and spend per phase", phaseTable()),
    section("Events", eventsTable()),
  ];
}

function phaseFromPath(path: string, arm: Arm) {
  if (path.startsWith("src/")) return "toolkit";
  if (path.includes(`${arm.id}Test`)) return "test";
  if (path.includes("notes/")) return "notes";
  const subject = round!.subjects.find((item) => path.includes(slugOf(item, arm)));
  return subject?.id ?? null;
}

function spendChart(width: number, t0: number, t1: number, x: (iso: string | number) => number) {
  const r = round!;
  const height = 200;
  const top = 12;
  const bottom = 24;
  const most = Math.max(1, ...r.arms.map((arm) => armLog(arm).cost));
  const stepDollars = [0.5, 1, 2, 5, 10, 20, 50].find((step) => most / step <= 6) ?? 100;
  const ceiling = Math.ceil(most / stepDollars) * stepDollars;
  const y = (value: number) => top + (1 - value / ceiling) * (height - top - bottom);
  const svg = s("svg", { class: "spend", width, height, viewBox: `0 0 ${width} ${height}` });
  for (let value = 0; value <= ceiling + 1e-9; value += stepDollars)
    svg.append(
      s("line", { x1: 128, x2: width - 16, y1: y(value), y2: y(value), class: "grid-line" }),
      s("text", { x: 120, y: y(value) + 4, class: "axis", "text-anchor": "end" }, money(value)),
    );
  const minutes = (t1 - t0) / 60_000;
  const stepMinutes = [1, 2, 5, 10, 15, 20, 30, 60].find((step) => minutes / step <= 14) ?? 120;
  for (let minute = 0; minute <= minutes; minute += stepMinutes)
    svg.append(
      s("text", { x: x(t0 + minute * 60_000), y: height - 6, class: "axis", "text-anchor": "middle" }, `${minute}m`),
    );
  const labels: Array<{ arm: Arm; x: number; y: number; text: string }> = [];
  for (const arm of r.arms) {
    const item = armLog(arm);
    if (!item.spend.length) continue;
    let path = `M${x(item.started ?? item.spend[0][0])} ${y(0)}`;
    let last = 0;
    for (const [at, total] of item.spend) {
      path += `L${x(at)} ${y(last)}L${x(at)} ${y(total)}`;
      last = total;
    }
    const end = item.status === "running" ? Date.now() : Date.parse(item.ended ?? item.spend.at(-1)![0]);
    path += `L${x(end)} ${y(last)}`;
    svg.append(s("path", { d: path, class: "spend-line", stroke: armColor(arm) }));
    labels.push({ arm, x: Math.min(x(end) + 4, width - 60), y: y(last) - 4, text: `${arm.letter} ${money(last)}` });
  }
  // Lines that end close together keep their labels 12 px apart, top down.
  labels.sort((a, b) => a.y - b.y);
  labels.forEach((item, index) => {
    if (index) item.y = Math.max(item.y, labels[index - 1].y + 12);
    svg.append(s("text", { x: item.x, y: item.y, class: "axis", fill: armColor(item.arm) }, item.text));
  });
  return h("div", { class: "scroll-x" }, svg);
}

function phaseTable() {
  const r = round!;
  const ids = ["setup", "toolkit", "test", ...r.subjects.map((subject) => subject.id), "notes"].filter((id) =>
    r.arms.some((arm) => armLog(arm).phases.some((phase) => phase.id === id)),
  );
  return h(
    "table",
    { class: "score phases" },
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        h("th", null, ""),
        ...ids.map((id) =>
          h(
            "th",
            null,
            h("i", { class: "swatch", style: `background:${phaseInfo(id).color}` }),
            ` ${phaseInfo(id).name}`,
          ),
        ),
        h("th", null, "Total"),
      ),
    ),
    h(
      "tbody",
      null,
      ...r.arms.map((arm) => {
        const item = armLog(arm);
        return h(
          "tr",
          null,
          h("th", null, armBadge(arm), ` ${arm.name}`),
          ...ids.map((id) => {
            const totals = phaseTotals(item, [id]);
            return h(
              "td",
              null,
              totals ? `${duration(totals.seconds)} · ${money(totals.cost)}` : h("span", { class: "muted" }, "—"),
            );
          }),
          h("td", null, `${duration(item.wallSeconds)} · ${money(item.cost)}`),
        );
      }),
    ),
  );
}

const EVENT_FILTERS: Array<[string, string, (event: LogEvent) => boolean]> = [
  ["work", "Work", (event) => !["read", "other", "shell"].includes(event.kind)],
  ["renders", "Renders", (event) => event.kind === "snap" || event.kind === "report"],
  ["edits", "Edits", (event) => event.kind === "write" || event.kind === "edit"],
  ["typechecks", "Typechecks", (event) => event.kind === "typecheck"],
  ["failures", "Failures", (event) => !event.ok],
  ["all", "Everything", () => true],
];

function eventsTable() {
  const r = round!;
  const filter = EVENT_FILTERS.find(([id]) => id === state.events) ?? EVENT_FILTERS[0];
  const rows = r.arms
    .filter((arm) => state.eventArm === "all" || state.eventArm === arm.id)
    .flatMap((arm) =>
      armLog(arm)
        .events.filter(filter[2])
        .map((event) => ({ arm, event })),
    )
    .sort((a, b) => (a.event.at < b.event.at ? -1 : 1));
  const shown = rows.slice(-800);
  const bar = h(
    "div",
    { class: "toolbar" },
    h(
      "div",
      { class: "seg" },
      ...EVENT_FILTERS.map(([id, text]) =>
        h(
          "button",
          {
            class: id === filter[0] ? "on" : "",
            onclick: () => {
              state.events = id;
              render();
            },
          },
          text,
        ),
      ),
    ),
    h(
      "div",
      { class: "seg" },
      ...[["all", "All"], ...r.arms.map((arm) => [arm.id, `${arm.letter} ${arm.name}`])].map(([id, text]) =>
        h(
          "button",
          {
            class: id === state.eventArm ? "on" : "",
            onclick: () => {
              state.eventArm = id;
              render();
            },
          },
          text,
        ),
      ),
    ),
    h(
      "span",
      { class: "muted small" },
      `${rows.length} events${rows.length > shown.length ? `, last ${shown.length} shown` : ""}`,
    ),
  );
  const table = h(
    "table",
    { class: "events" },
    h(
      "tbody",
      null,
      ...shown.map(({ arm, event }) =>
        h(
          "tr",
          { class: event.ok ? "" : "failed" },
          h(
            "td",
            { class: "mono muted", "data-tip": new Date(event.at).toLocaleTimeString("en-GB") },
            sinceStart(event.at),
          ),
          h("td", null, armBadge(arm)),
          h(
            "td",
            null,
            h("i", {
              class: "swatch",
              style: `background:${phaseInfo(event.phase).color}`,
              "data-tip": phaseInfo(event.phase).name,
            }),
          ),
          h("td", { class: "kind" }, event.kind),
          h(
            "td",
            { class: "label" },
            event.detail
              ? h("details", null, h("summary", null, event.label), h("pre", null, event.detail))
              : event.label,
            event.lines ? h("span", { class: "muted" }, ` +${event.lines}`) : null,
            event.kind === "snap" && event.total !== undefined
              ? h("span", { class: "muted" }, ` · ${money(event.cost ?? 0)} this version`)
              : null,
          ),
          h(
            "td",
            null,
            event.ok ? h("span", { class: "good" }, "✓") : h("span", { class: "bad" }, event.gpu ? "GPU" : "✗"),
          ),
        ),
      ),
    ),
  );
  return [bar, table];
}

// ── Builders ─────────────────────────────────────────────────────────────────────────────────────────────────────

function builders() {
  const r = round!;
  const arm = armOf();
  const item = armLog(arm);
  const picker = h(
    "div",
    { class: "toolbar" },
    h(
      "div",
      { class: "seg" },
      ...r.arms.map((other) =>
        h(
          "button",
          {
            class: other === arm ? "on" : "",
            onclick: () => {
              state.arm = other.id;
              render();
            },
          },
          `${other.letter} · ${other.name}`,
        ),
      ),
    ),
  );
  const tools = Object.entries(item.toolsByName).sort((a, b) => b[1] - a[1]);
  const most = Math.max(1, ...tools.map(([, value]) => value));
  const summary = h(
    "div",
    { class: "arm-summary", style: `--arm:${armColor(arm)}` },
    h(
      "div",
      null,
      h(
        "h2",
        { class: "arm-title" },
        armBadge(arm),
        ` ${arm.name}`,
        statusDot(item.status),
        h("span", { class: "muted" }, ` ${STATUS_TEXT[item.status]}`),
      ),
      h("p", { class: "idea" }, arm.idea),
      h(
        "dl",
        null,
        h("dt", null, "Agent"),
        h(
          "dd",
          null,
          `${arm.agent}${item.model ? ` · ${item.model}` : ""}${item.effort ? ` · ${item.effort} thinking` : ""}`,
        ),
        h("dt", null, "Spend"),
        h(
          "dd",
          null,
          `${money(item.cost)} · ${item.calls} model calls · ${item.toolCalls} tool calls`,
          item.compactions ? ` · ${item.compactions} compactions` : "",
        ),
        h("dt", null, "Tokens"),
        h(
          "dd",
          null,
          `${tokenText(item.tokens.total)} total: ${tokenText(item.tokens.input)} in, ${tokenText(item.tokens.cacheRead)} cache read, ${tokenText(item.tokens.cacheWrite)} cache write, ${tokenText(item.tokens.output)} out`,
        ),
        h("dt", null, "Time"),
        h(
          "dd",
          null,
          item.started
            ? `${clock(item.started)} → ${item.ended ? clock(item.ended) : "…"} · ${duration(item.wallSeconds)}`
            : "—",
        ),
        item.errors.length
          ? [h("dt", null, "Errors"), h("dd", { class: "bad" }, item.errors.map((error) => error.message).join("; "))]
          : null,
      ),
    ),
    h(
      "div",
      { class: "tool-bars" },
      h("h3", null, "Tool calls"),
      ...tools.map(([name, value]) =>
        h(
          "div",
          { class: "bar-row" },
          h("span", null, name),
          h("i", { style: `width:${(value / most) * 100}%` }),
          h("b", null, value),
        ),
      ),
    ),
  );

  const versionStrip = (slug: string, title: string) => {
    const list = snaps.get(slug) ?? [];
    if (!list.length) return null;
    const figures = list.map((snap, index) => {
      const report = reportOf(snap);
      const event = renderEvent(arm, slug, snap.tag);
      return h(
        "figure",
        { class: "version" },
        h(
          "button",
          {
            class: "thumb",
            onclick: () =>
              lightbox.show(
                list.map((other) => ({ url: other.sheet, caption: `${slug} · ${other.tag}` })),
                index,
              ),
          },
          h("img", { src: shotOf(snap, "three-quarter"), alt: "", loading: "lazy" }),
        ),
        h(
          "figcaption",
          null,
          h("b", null, snap.tag),
          event?.total !== undefined ? h("span", { class: "muted" }, ` ${money(event.cost ?? 0)}`) : null,
          report
            ? h(
                "div",
                { class: "muted small" },
                `${count(report.triangles)} tris · ${report.issues.length ? `${report.issues.length} issues` : "clean"}`,
              )
            : null,
          h(
            "div",
            { class: "links" },
            snap.source ? h("button", { class: "link", onclick: () => showSource(slug, snap) }, "source") : null,
            index && snap.source && list[index - 1].source
              ? h("button", { class: "link", onclick: () => showDiff(slug, list[index - 1], snap) }, "diff")
              : null,
          ),
        ),
      );
    });
    return h("div", { class: "strip" }, h("h3", null, title), h("div", { class: "strip-row" }, ...figures));
  };

  const guide = texts.get(arm.guide);
  const toolkit = arm.toolkit ? texts.get(arm.toolkit) : null;
  return [
    picker,
    summary,
    h(
      "div",
      { class: "two" },
      section("Notes", md(texts.get(`notes/${arm.id}.md`), "The builder hasn't written its notes yet.")),
      section("Final reply", md(item.finalReply, item.status === "running" ? "Still running." : "No final reply.")),
    ),
    section(
      "Renders",
      ...r.subjects.map((subject) => versionStrip(slugOf(subject, arm), subject.name)),
      versionStrip(testSlug(arm), "Toolkit test"),
      r.subjects.every((subject) => !snaps.get(slugOf(subject, arm))?.length) && !snaps.get(testSlug(arm))?.length
        ? h("p", { class: "muted" }, "No renders yet.")
        : null,
    ),
    arm.toolkit
      ? section(
          `Toolkit · ${arm.toolkit}`,
          toolkit
            ? h(
                "details",
                { class: "code-block" },
                h("summary", null, `${lines(toolkit)} lines · ${item.edits[arm.toolkit] ?? 0} edits · show source`),
                listing(toolkit),
              )
            : h("p", { class: "muted" }, "Not written yet."),
        )
      : null,
    section(
      "Sources now",
      ...r.subjects.map((subject) => {
        const slug = slugOf(subject, arm);
        const text = sources.get(slug);
        return text
          ? h(
              "details",
              { class: "code-block" },
              h(
                "summary",
                null,
                `samples/${slug}.ts · ${lines(text)} lines · ${item.edits[`samples/${slug}.ts`] ?? 0} edits`,
              ),
              listing(text),
            )
          : h("p", { class: "muted" }, `samples/${slug}.ts: not written yet.`);
      }),
    ),
    section(
      "Prompt",
      h("h3", null, "Task (as the agent received it)"),
      item.task ? h("pre", { class: "task" }, item.task) : h("p", { class: "muted" }, "—"),
      h("h3", null, `Arm guide · ${arm.guide}`),
      md(guide),
    ),
  ];
}

function modal(title: string, content: Node) {
  const element = h(
    "div",
    {
      class: "modal",
      onclick: (event: Event) => event.target === element && element.remove(),
    },
    h(
      "div",
      { class: "modal-box" },
      h(
        "div",
        { class: "modal-head" },
        h("b", null, title),
        h("button", { class: "link", onclick: () => element.remove() }, "Close  Esc"),
      ),
      h("div", { class: "modal-body" }, content),
    ),
  );
  document.body.append(element);
}
addEventListener("keydown", (event) => {
  if (event.key === "Escape") document.querySelector(".modal")?.remove();
});

async function showSource(slug: string, snap: Snapshot) {
  const text = await loadText(snap.source, snap.time);
  modal(`${slug} · ${snap.tag}`, text ? listing(text) : h("p", null, "Source not found."));
}

async function showDiff(slug: string, before: Snapshot, after: Snapshot) {
  const [a, b] = await Promise.all([loadText(before.source, before.time), loadText(after.source, after.time)]);
  modal(
    `${slug} · ${before.tag} → ${after.tag}`,
    a !== null && b !== null ? diffListing(a, b).element : h("p", null, "Source not found."),
  );
}

// ── Brief ────────────────────────────────────────────────────────────────────────────────────────────────────────

function brief() {
  const r = round!;
  return [
    section("Shared brief", md(texts.get(r.brief))),
    section(
      "Arm guides",
      h(
        "div",
        { class: `guides n${r.arms.length}` },
        ...r.arms.map((arm) =>
          h(
            "div",
            { class: "guide", style: `--arm:${armColor(arm)}` },
            h("h3", null, armBadge(arm), ` ${arm.name}`),
            md(texts.get(arm.guide)),
          ),
        ),
      ),
    ),
  ];
}

// ── Page ─────────────────────────────────────────────────────────────────────────────────────────────────────────

function renderBody() {
  if (!round) {
    bodyElement.replaceChildren(h("p", { class: "muted" }, "No rounds: add experiments/<id>/round.json."));
    return;
  }
  const scroll = scrollY;
  const views: Record<Tab, () => Child | Child[]> = { overview, compare, timeline, builders, brief };
  bodyElement.replaceChildren(
    ...[views[state.tab]()].flat(2).filter((child): child is Node | string => Boolean(child)),
  );
  if (state.tab === "compare" && state.view === "live") renderLiveErrors();
  scrollTo(0, scroll);
}

let lastSignature = "";
function render() {
  if (round) {
    if (!round.subjects.some((subject) => subject.id === state.subject)) state.subject = round.subjects[0].id;
    if (!round.arms.some((arm) => arm.id === state.arm)) state.arm = round.arms[0].id;
    document.title = `${round.title} · round`;
  }
  renderHead();
  renderBody();
  save();
  lastSignature = signature();
}

// Tooltips for anything with `data-tip`, HTML or SVG.
const tip = h("div", { class: "round-tip", hidden: true });
document.body.append(tip);
addEventListener("pointerover", (event) => {
  const target = (event.target as Element).closest?.("[data-tip]");
  const text = target?.getAttribute("data-tip");
  tip.hidden = !text;
  if (text) tip.textContent = text;
});
addEventListener("pointermove", (event) => {
  if (tip.hidden) return;
  const x = Math.min(event.clientX + 14, innerWidth - tip.offsetWidth - 8);
  const y =
    event.clientY + 18 + tip.offsetHeight > innerHeight ? event.clientY - tip.offsetHeight - 10 : event.clientY + 18;
  tip.style.transform = `translate(${x}px, ${y}px)`;
});

addEventListener("keydown", (event) => {
  if (lightbox.open || event.metaKey || event.ctrlKey || event.altKey) return;
  if ((event.target as HTMLElement).closest("input, select, textarea")) return;
  const tab = TABS[Number(event.key) - 1];
  if (tab) {
    state.tab = tab[0];
    render();
    return;
  }
  if (state.tab !== "compare") return;
  if (event.key === "b") {
    state.blind = !state.blind;
    state.revealed = false;
    render();
  }
  if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && state.view === "renders") {
    const index = SHOTS.indexOf(state.shot);
    state.shot = SHOTS[(index + (event.key === "ArrowRight" ? 1 : SHOTS.length - 1)) % SHOTS.length];
    render();
  }
});

let resizeTimer = 0;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => state.tab === "timeline" && renderBody(), 200);
});

/** Re-render after new data, unless the reader is in a view that would lose its place (open code, notes). */
async function poll() {
  await refreshData();
  renderHead();
  if (signature() !== lastSignature && (state.tab !== "builders" || !document.querySelector("details[open]"))) {
    if (!(state.tab === "compare" && state.view === "live")) renderBody();
    lastSignature = signature();
  }
}
setInterval(() => {
  if (document.visibilityState !== "visible" || !round) return;
  const running = round.arms.some((arm) => ["running", "waiting"].includes(armLog(arm).status));
  if (running) void poll();
}, 15_000);

addEventListener("round-files", async (event) => {
  files = (event as CustomEvent<RoundFiles>).detail;
  round = rounds().find((item) => item.id === round?.id) ?? rounds()[0];
  await refreshFiles();
  if (state.tab !== "compare") renderBody();
});

let liveTimer = 0;
addEventListener("catalog", (event) => {
  modules = (event as CustomEvent<Catalog>).detail.modules;
  if (state.tab !== "compare" || state.view !== "live") return;
  clearTimeout(liveTimer);
  liveTimer = window.setTimeout(() => {
    for (const item of slots)
      if (item.slug && item.viewer) void loadLive(item, item.slug, true).then(() => renderLiveErrors());
  }, 1500);
});

if (import.meta.hot)
  import.meta.hot.on("snapshots", async ({ slug }: { slug: string }) => {
    if (!allSlugs().includes(slug)) return;
    await refreshData();
    renderHead();
    if (!(state.tab === "compare" && state.view === "live") && state.tab !== "builders") renderBody();
  });

render();
await Promise.all([refreshFiles(), refreshData()]);
render();
