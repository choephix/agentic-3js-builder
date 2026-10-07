// The prompt bake-off page (bakeoff.html): one round of `npm run bakeoff`, where the same pitches went through
// different system prompts (arms) and each reply is one module, built once. A grid of renders, pitches by arms; a
// build in detail, live in 3D with its contact sheet, reply and source; one pitch with every arm live side by side;
// a per-arm scoreboard; the system prompts. Blind mode hides the arms and shuffles each row, so builds can be starred
// before it is known which prompt made them.
import { marked } from "marked";
import { duration, tokens as tokenText } from "./builds";
import { builds, manifests, prompts, replies, sources } from "./bakeoff-files";
import type { Arm, BakeoffFiles, Round, Subject } from "./bakeoff-files";
import { h } from "./dom";
import type { Child } from "./dom";
import { inspect } from "./inspect";
import { Lightbox, count } from "./renders";
import type { Snapshot } from "./renders";
import { listing, originalLine } from "./source";
import { Viewer } from "./viewer";

// ── Types ────────────────────────────────────────────────────────────────────────────────────────────────────────

type Level = "terse" | "rich";
type Usage = { prompt_tokens: number; completion_tokens: number; prompt_tokens_details?: { cached_tokens?: number } };
type Check = {
  typeErrors: number;
  typeErrorSample: string[];
  rendered: boolean;
  lane: "A" | "B" | null;
  renderError: string | null;
  report: {
    parts: number;
    triangles: number;
    colors: number;
    textures: number;
    joints: number;
    size: [number, number, number];
    issues: Array<{ level: "error" | "warning"; message: string }>;
    fine: number;
  } | null;
};
/** A run record (without its reasoning text) with its check record and its `v01` render; see bakeoff-data.mjs. */
type Build = {
  slug: string;
  arm: string;
  subject: string;
  level: Level;
  pitch: string;
  model: string;
  effort: string;
  started: string;
  wallMs: number;
  status: number | null;
  error: string | null;
  finishReason: string | null;
  usage: Usage | null;
  costUsd: number | null;
  hasCode: boolean;
  reasoningChars: number;
  check: Check | null;
  render: Snapshot | null;
};
type RoundData = { id: string; prompts: Record<string, number | null>; builds: Build[] };
type Pitch = { subject: Subject; level: Level; key: string };
/** What came of a build: not asked yet, API failure, a reply without code, waiting for its check, or the check. */
type Outcome = "pending" | "api" | "nocode" | "checking" | "crashed" | "rendered";

type Tab = "grid" | "compare" | "scoreboard" | "prompts";
const TABS: Array<[Tab, string]> = [
  ["grid", "Grid"],
  ["compare", "Compare"],
  ["scoreboard", "Scoreboard"],
  ["prompts", "Prompts"],
];
const LEVELS: Level[] = ["terse", "rich"];
const ARM_COLORS = ["#c2255c", "#e67700", "#1c7ed6", "#0c8599", "#2b8a3e", "#7048e8", "#5c6370"];
const BLIND_COLOR = "#495057";
/** The harness's view shots first, in its order. */
const VIEWS = ["front", "three-quarter", "side", "back", "top", "low"];
/** Characters per token, roughly, for prompt sizes. */
const CHARS_PER_TOKEN = 3.6;

// ── State ────────────────────────────────────────────────────────────────────────────────────────────────────────

let files: BakeoffFiles = { manifests, builds, sources, replies, prompts };
const params = new URLSearchParams(location.search);
const rounds = () => Object.values(files.manifests).sort((a, b) => (a.started < b.started ? 1 : -1));
const isSmoke = (item: Round) => /^smoke/i.test(item.id);
let round: Round | undefined =
  rounds().find((item) => item.id === params.get("round")) ?? rounds().find((item) => !isSmoke(item)) ?? rounds()[0];

const state = {
  tab: (TABS.find(([id]) => id === params.get("tab"))?.[0] ?? "grid") as Tab,
  /** The build open in the detail view, or "". */
  build: params.get("build") ?? "",
  /** The compared pitch, `<subject>-<level>`. */
  pitch: params.get("pitch") ?? "",
  blind: localStorage.getItem("bakeoff-blind") === "1",
  sort: { key: "letter", up: true },
  /** Pitch rows whose text is shown in full. */
  expanded: new Set<string>(),
  wiggle: false,
  skeleton: false,
};

function save() {
  if (!round) return;
  const next = new URLSearchParams({ round: round.id, tab: state.tab });
  if (state.tab === "compare" && state.pitch) next.set("pitch", state.pitch);
  // A build's slug names its arm, so blind mode keeps it out of the address bar.
  if (state.build && !state.blind) next.set("build", state.build);
  history.replaceState(null, "", `?${next}`);
}

function setBlind(on: boolean) {
  state.blind = on;
  localStorage.setItem("bakeoff-blind", on ? "1" : "0");
  render();
}

// ── Data ─────────────────────────────────────────────────────────────────────────────────────────────────────────

let data: RoundData = { id: "", prompts: {}, builds: [] };
let bySlug = new Map<string, Build>();

async function refreshData() {
  if (!round) return;
  const response = await fetch(`/__bakeoff/${round.id}`).catch(() => null);
  if (!response?.ok) return;
  data = (await response.json()) as RoundData;
  bySlug = new Map(data.builds.map((build) => [build.slug, build]));
}

/** The runner's slugs: `r1`, `fennec`, `terse`, `docs-sdk` → `r1FennecTerseDocsSdk`. */
const camel = (first: string, ...rest: string[]) =>
  first + rest.map((word) => word[0].toUpperCase() + word.slice(1)).join("");
const slugOf = (pitch: Pitch, arm: Arm) => camel(round!.id, pitch.subject.id, pitch.level, ...arm.id.split("-"));
const buildPath = (slug: string) => `../bakeoff/rounds/${round!.id}/builds/${slug}.ts`;
const title = (id: string) => id[0].toUpperCase() + id.slice(1);

const pitches = (): Pitch[] =>
  round!.subjects.flatMap((subject) => LEVELS.map((level) => ({ subject, level, key: `${subject.id}-${level}` })));
const pitchText = (pitch: Pitch) => pitch.subject[pitch.level];
const runsOf = (pitch: Pitch) => round!.arms.filter((arm) => bySlug.has(slugOf(pitch, arm))).length;

function outcome(build: Build | undefined): Outcome {
  if (!build) return "pending";
  if (build.status !== 200 || build.error) return "api";
  if (!build.hasCode) return "nocode";
  if (build.render || build.check?.rendered) return "rendered";
  if (!build.check) return "checking";
  return "crashed";
}

/** The line of a harness log that says what went wrong. */
function firstError(text: string | null | undefined) {
  const lines = (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    lines.find((line) => /\b[A-Za-z]*Error: /.test(line)) ??
    lines.find((line) => !line.startsWith("at ") && !line.startsWith("Node.js v")) ??
    "No error output."
  );
}

/** What an API failure said, short. */
function apiError(build: Build) {
  const text = build.error ?? "";
  const message = /"message"\s*:\s*"((?:\\.|[^"\\])*)"/.exec(text)?.[1] ?? text;
  return `${build.status ?? "no status"}${message ? `: ${message.slice(0, 160)}` : ""}`;
}

// ── Blind order and stars ────────────────────────────────────────────────────────────────────────────────────────

function hash(text: string) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619);
  return value >>> 0;
}

function seeded(seed: number) {
  let value = seed >>> 0 || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

/** A pitch row's arms in display order: as listed, or shuffled when blind, stably per round and pitch. */
function order(pitch: Pitch) {
  const arms = [...round!.arms];
  if (!state.blind) return arms;
  const random = seeded(hash(`${round!.id}:${pitch.key}`));
  for (let i = arms.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arms[i], arms[j]] = [arms[j], arms[i]];
  }
  return arms;
}

const armColor = (arm: Arm) => (state.blind ? BLIND_COLOR : ARM_COLORS[round!.arms.indexOf(arm) % ARM_COLORS.length]);
const armLabel = (arm: Arm, position: number) =>
  state.blind ? `Build ${position + 1}` : `${arm.letter} · ${arm.name}`;
const armBadge = (arm: Arm, position: number) =>
  state.blind
    ? h("span", { class: "badge anon" }, String(position + 1))
    : h("span", { class: "badge", style: `--arm:${armColor(arm)}` }, arm.letter);

let stars = new Set<string>();
const starKey = () => `bakeoff-stars:${round!.id}`;
function loadStars() {
  try {
    stars = new Set(JSON.parse(localStorage.getItem(starKey()) ?? "[]") as string[]);
  } catch {
    stars = new Set();
  }
}

function toggleStar(slug: string) {
  if (stars.has(slug)) stars.delete(slug);
  else stars.add(slug);
  localStorage.setItem(starKey(), JSON.stringify([...stars].sort()));
  for (const button of document.querySelectorAll<HTMLElement>(`[data-star="${slug}"]`)) paintStar(button, slug);
  renderHead();
  if (state.tab === "scoreboard") renderBody();
}

function paintStar(button: HTMLElement, slug: string) {
  const on = stars.has(slug);
  button.classList.toggle("on", on);
  button.textContent = on ? "★" : "☆";
}

function starButton(slug: string) {
  const button = h("button", {
    class: "bo-star",
    "data-star": slug,
    "data-tip": "Star · S in the detail view",
    onclick: (event: Event) => {
      event.stopPropagation();
      toggleStar(slug);
    },
  });
  paintStar(button, slug);
  return button;
}

/** The stars as a JSON file, to commit next to the round. */
function exportStars() {
  const list = [...stars].sort().map((slug) => {
    const build = bySlug.get(slug);
    const arm = round!.arms.find((item) => item.id === build?.arm);
    return {
      slug,
      arm: build?.arm ?? null,
      letter: arm?.letter ?? null,
      subject: build?.subject ?? null,
      level: build?.level ?? null,
    };
  });
  const body = { round: round!.id, model: round!.model, exported: new Date().toISOString(), stars: list };
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(body, null, 2)}\n`], { type: "application/json" }));
  h("a", { href: url, download: `stars-${round!.id}.json` }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Formatting ───────────────────────────────────────────────────────────────────────────────────────────────────

const money = (value: number) => `$${value.toFixed(2)}`;
const cents = (value: number) => `$${value.toFixed(3)}`;
const mean = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const shotOf = (render: Snapshot, shot: string) => render.shots.find((item) => item.name === shot)?.url ?? render.sheet;

function md(text: string) {
  const element = h("div", { class: "md" });
  element.innerHTML = marked.parse(text, { async: false }) as string;
  return element;
}

function section(name: string, ...children: Array<Child | Child[]>) {
  return h("section", { class: "block" }, h("h2", null, name), ...children);
}

/** A failed or unfinished build's card, in place of its render. */
function outcomeCard(kind: Outcome, build: Build | undefined) {
  const card = (name: string, detail: Child, tip?: string) =>
    h("div", { class: `bo-card ${kind}`, "data-tip": tip ?? null }, h("b", null, name), h("span", null, detail));
  if (kind === "pending") return card("not run yet", "");
  if (kind === "api") return card("API error", apiError(build!), build!.error ?? undefined);
  if (kind === "nocode") return card("no code", `finish: ${build!.finishReason ?? "?"}`);
  if (kind === "checking") return card("not rendered yet", "waiting for its check");
  if (kind === "crashed")
    return card("crashed", firstError(build!.check?.renderError), build!.check?.renderError ?? "");
  return card("rendered", "no image found");
}

/** Triangles, output tokens and cost; cost is left out when blind, since prompt size shows in it. */
function metricLine(build: Build | undefined) {
  if (!build) return h("div", { class: "bo-metrics muted" }, "—");
  const report = build.check?.report;
  return h(
    "div",
    { class: "bo-metrics" },
    report ? h("span", { "data-tip": "triangles" }, `${count(report.triangles)} tris`) : null,
    build.usage ? h("span", { "data-tip": "output tokens" }, `${tokenText(build.usage.completion_tokens)} out`) : null,
    build.costUsd !== null && !state.blind ? h("span", { "data-tip": "estimated cost" }, cents(build.costUsd)) : null,
    build.check?.typeErrors
      ? h("span", { class: "warn", "data-tip": build.check.typeErrorSample.join("\n") }, `${build.check.typeErrors} TS`)
      : null,
  );
}

// ── Header ───────────────────────────────────────────────────────────────────────────────────────────────────────

const headElement = document.getElementById("round-head")!;
const bodyElement = document.getElementById("round-body")!;
const detailElement = document.getElementById("bo-detail")!;

function renderHead() {
  if (!round) return;
  const expected = round.subjects.length * LEVELS.length * round.arms.length;
  const rendered = data.builds.filter((build) => outcome(build) === "rendered").length;
  const started = new Date(round.started);
  headElement.replaceChildren(
    h(
      "div",
      { class: "rh-top" },
      h(
        "div",
        { class: "rh-title" },
        h("h1", null, "Prompt bake-off"),
        h(
          "select",
          {
            onchange: (event: Event) => {
              location.search = `?round=${(event.target as HTMLSelectElement).value}`;
            },
          },
          ...rounds().map((item) =>
            h(
              "option",
              { value: item.id, selected: item.id === round!.id },
              `${item.id} · ${item.started.slice(0, 10)}`,
            ),
          ),
        ),
        h(
          "p",
          { class: "question" },
          `${round.arms.length} system prompts, ${round.subjects.length} subjects at two pitch levels; ` +
            "one reply per build, no iterations.",
        ),
      ),
      h(
        "div",
        { class: "rh-meta" },
        h("span", null, h("b", null, round.model), ` · ${round.effort} effort`),
        h(
          "span",
          { "data-tip": started.toISOString() },
          `started ${started.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`,
        ),
        h("span", { "data-tip": `${rendered} rendered` }, `${data.builds.length} / ${expected} builds`),
        h("span", null, `${money(sum(data.builds.map((build) => build.costUsd ?? 0)))} estimated`),
        h("span", { class: "sep" }),
        h(
          "button",
          {
            class: `tog ${state.blind ? "on" : ""}`,
            "data-tip": "Hide the arms and shuffle every row · B",
            onclick: () => setBlind(!state.blind),
          },
          "Blind",
        ),
        state.blind ? h("button", { class: "tog", onclick: () => setBlind(false) }, "Reveal") : null,
        h("span", { class: "bo-starcount" }, `★ ${stars.size}`),
        h(
          "button",
          { class: "tog", "data-tip": "Download the stars as JSON", disabled: !stars.size, onclick: exportStars },
          "Export",
        ),
        h("a", { class: "link", href: "/" }, "showcase ↗"),
      ),
    ),
    ...(state.blind
      ? []
      : [
          h(
            "div",
            { class: "rh-arms" },
            ...round.arms.map((arm) =>
              h(
                "span",
                { class: "arm-pill", style: `--arm:${armColor(arm)}`, "data-tip": arm.idea },
                armBadge(arm, 0),
                arm.name,
              ),
            ),
          ),
        ]),
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
  // The grid's column heads stick under the header.
  document.documentElement.style.setProperty("--bo-head", `${headElement.offsetHeight}px`);
}

// ── Grid ─────────────────────────────────────────────────────────────────────────────────────────────────────────

function gridCell(pitch: Pitch, arm: Arm) {
  const slug = slugOf(pitch, arm);
  const build = bySlug.get(slug);
  const kind = outcome(build);
  const media =
    kind === "rendered" && build?.render
      ? h(
          "div",
          { class: "bo-crop" },
          h("img", { src: shotOf(build.render, "three-quarter"), alt: "", loading: "lazy" }),
        )
      : outcomeCard(kind, build);
  return h(
    "div",
    { class: `bo-cell ${kind}`, style: `--arm:${armColor(arm)}` },
    h(
      "button",
      {
        class: "bo-media",
        "data-tip": state.blind ? null : `${arm.letter} · ${arm.name}`,
        onclick: () => openDetail(slug),
      },
      media,
    ),
    build ? starButton(slug) : null,
    metricLine(build),
  );
}

function grid() {
  const r = round!;
  const head = h(
    "div",
    { class: "bo-row bo-colhead" },
    h("div", { class: "bo-corner muted" }, state.blind ? "Shuffled per row" : "Pitch"),
    ...r.arms.map((arm, position) =>
      h(
        "div",
        { class: "bo-col", "data-tip": state.blind ? null : arm.idea },
        armBadge(arm, position),
        h("b", null, state.blind ? "" : arm.name),
      ),
    ),
  );
  const rows: Child[] = [];
  for (const subject of r.subjects) {
    const own = pitches().filter((pitch) => pitch.subject === subject);
    const done = sum(own.map(runsOf));
    rows.push(
      h(
        "div",
        { class: "bo-subject" },
        h("h3", null, title(subject.id)),
        h("span", { class: "chip" }, subject.kind),
        h("span", { class: "muted" }, `${done} / ${own.length * r.arms.length} builds`),
      ),
    );
    for (const pitch of own) {
      const open = state.expanded.has(pitch.key);
      const label = h(
        "button",
        {
          class: `bo-pitch ${open ? "open" : ""}`,
          "data-tip": open ? null : "Show the whole pitch",
          onclick: () => {
            if (open) state.expanded.delete(pitch.key);
            else state.expanded.add(pitch.key);
            renderBody();
          },
        },
        h("span", { class: `chip level ${pitch.level}` }, pitch.level),
        h("span", { class: "bo-pitch-text" }, pitchText(pitch)),
      );
      if (!runsOf(pitch)) {
        rows.push(h("div", { class: "bo-row empty" }, label, h("div", { class: "bo-none muted" }, "not run yet")));
        continue;
      }
      rows.push(h("div", { class: "bo-row" }, label, ...order(pitch).map((arm) => gridCell(pitch, arm))));
    }
  }
  return h("div", { class: "bo-grid", style: `--cols:${r.arms.length}` }, head, ...rows);
}

// ── Live builds ──────────────────────────────────────────────────────────────────────────────────────────────────

type Loaded = { error: unknown; phase: "import" | "build" | null };

/** Run a build's module into a viewer; whatever it throws comes back instead. */
async function loadLive(viewer: Viewer, slug: string): Promise<Loaded> {
  const loader = files.builds[buildPath(slug)];
  if (!loader) {
    viewer.show(null, null);
    return { error: new Error("No module for this build (yet)."), phase: "import" };
  }
  let module: Awaited<ReturnType<typeof loader>>;
  try {
    module = await loader();
  } catch (error) {
    viewer.show(null, null);
    return { error, phase: "import" };
  }
  try {
    if (typeof module.default !== "function") throw new Error("The module has no default export function.");
    const root = module.default();
    if (!root?.isObject3D) throw new Error("The default export must return a THREE.Object3D.");
    viewer.show(root, inspect(root));
    viewer.setDisplay({ skeleton: state.skeleton });
    viewer.wiggle(state.wiggle);
    if (!state.wiggle) viewer.pose(0);
    return { error: null, phase: null };
  } catch (error) {
    viewer.show(null, null);
    return { error, phase: "build" };
  }
}

const errorMessage = (error: unknown) => (error instanceof Error ? `${error.name}: ${error.message}` : String(error));

/** The error with its frames in the build and the SDK, mapped back to source lines; `jump` opens a build line. */
function errorCard(slug: string, loaded: Loaded, jump: (line: number) => void) {
  const stack = loaded.error instanceof Error ? (loaded.error.stack ?? "") : "";
  const frames = stack
    .split("\n")
    .map((line) =>
      /^\s*at (?:(.*?) \()?(https?:\/\/\S+?\/((?:src|bakeoff\/rounds\/\w+\/builds)\/[\w./-]+?\.ts)(?:\?[^:]*)?):(\d+):(\d+)\)?$/.exec(
        line,
      ),
    )
    .filter((match) => match !== null)
    .slice(0, 8)
    .map(([, where, url, file, generated, column]) => {
      const own = file.endsWith(`/${slug}.ts`);
      const name = own ? `${slug}.ts` : file;
      const place = h("span", null, name);
      void originalLine(url, Number(generated), Number(column)).then((line) => {
        if (!line) return;
        place.replaceWith(
          own
            ? h(
                "button",
                { class: "link", onclick: () => jump(line), "data-tip": "Show in the source" },
                `${name}:${line}`,
              )
            : h("span", { class: "muted" }, `${name}:${line}`),
        );
      });
      return h("li", { class: own ? "own" : "" }, where ? h("span", null, `${where} `) : null, place);
    });
  return h(
    "div",
    { class: "error-card" },
    h(
      "div",
      { class: "error-head" },
      h("strong", null, loaded.phase === "import" ? "Failed to load" : "Threw while building"),
    ),
    h("pre", { class: "message" }, errorMessage(loaded.error)),
    frames.length ? h("ol", { class: "frames" }, ...frames) : null,
  );
}

function liveToggle(text: string, key: "wiggle" | "skeleton", viewers: () => Array<Viewer | null>) {
  return h(
    "button",
    {
      class: `tog ${state[key] ? "on" : ""}`,
      onclick: (event: Event) => {
        state[key] = !state[key];
        for (const viewer of viewers())
          if (key === "wiggle") viewer?.wiggle(state.wiggle);
          else viewer?.setDisplay({ skeleton: state.skeleton });
        (event.currentTarget as HTMLElement).classList.toggle("on", state[key]);
      },
    },
    text,
  );
}

// ── Detail ───────────────────────────────────────────────────────────────────────────────────────────────────────

const detail = {
  host: h("div", { class: "live-host" }),
  error: h("div", { class: "bo-live-error" }),
  viewer: null as Viewer | null,
  /** The slug the viewer shows, and what loading it gave. */
  slug: "",
  loaded: null as Loaded | null,
  /** The record the panel was drawn from, to redraw only when it changes. */
  drawn: "",
  source: h("div"),
};

/** Where a slug sits on the grid: its pitch row and its position in the row. */
function locate(slug: string) {
  const list = pitches();
  for (let row = 0; row < list.length; row++) {
    const arms = order(list[row]);
    const column = arms.findIndex((arm) => slugOf(list[row], arm) === slug);
    if (column >= 0) return { pitch: list[row], arm: arms[column], row, column };
  }
  return null;
}

/** The cell next to a build on the grid, skipping rows nothing has run in. */
function neighbour(slug: string, rows: number, columns: number) {
  const at = locate(slug);
  if (!at) return null;
  const list = pitches();
  let row = at.row;
  if (rows)
    do row += rows;
    while (row >= 0 && row < list.length && !runsOf(list[row]));
  const column = at.column + columns;
  if (row < 0 || row >= list.length || column < 0 || column >= round!.arms.length) return null;
  return slugOf(list[row], order(list[row])[column]);
}

function openDetail(slug: string) {
  state.build = slug;
  detail.drawn = "";
  renderDetail();
  save();
}

function closeDetail() {
  state.build = "";
  detailElement.hidden = true;
  document.body.classList.remove("bo-detail-open");
  detail.viewer?.show(null, null);
  detail.slug = "";
  save();
}

function renderDetail() {
  if (!state.build || !round) return closeDetail();
  const slug = state.build;
  const at = locate(slug);
  if (!at) return closeDetail();
  const build = bySlug.get(slug);
  const signature = JSON.stringify([build, state.blind, stars.has(slug)]);
  if (signature === detail.drawn && !detailElement.hidden) return;
  detail.drawn = signature;
  const kind = outcome(build);
  const live = kind === "rendered" || kind === "crashed" || kind === "checking";
  const move = (rows: number, columns: number, arrow: string, name: string) => {
    const next = neighbour(slug, rows, columns);
    return h(
      "button",
      { class: "icon", disabled: !next, "data-tip": `${name} · ${arrow}`, onclick: () => next && openDetail(next) },
      arrow,
    );
  };

  const bar = h(
    "div",
    { class: "bo-detail-bar" },
    armBadge(at.arm, at.column),
    h("b", null, armLabel(at.arm, at.column)),
    h("span", { class: "muted" }, `${title(at.pitch.subject.id)} · ${at.pitch.level}`),
    state.blind ? null : h("span", { class: "muted mono" }, slug),
    h("span", { class: "grow" }),
    move(0, -1, "←", "Previous in the row"),
    move(0, 1, "→", "Next in the row"),
    move(-1, 0, "↑", "Same column, pitch above"),
    move(1, 0, "↓", "Same column, pitch below"),
    h("span", { class: "sep" }),
    build ? starButton(slug) : null,
    h("button", { class: "link", onclick: closeDetail }, "Close  Esc"),
  );

  const viewerBox = live
    ? h(
        "div",
        { class: "bo-live" },
        detail.host,
        detail.error,
        h(
          "div",
          { class: "bo-live-tools" },
          liveToggle("Wiggle", "wiggle", () => [detail.viewer]),
          liveToggle("Skeleton", "skeleton", () => [detail.viewer]),
          h("button", { class: "tog", onclick: () => detail.viewer?.frame() }, "Reset camera"),
        ),
      )
    : h("div", { class: "bo-live bo-live-none" }, outcomeCard(kind, build));
  // Every render tile carries its slug, which names the arm: blind, the shots show cropped and don't open full size.
  const render = build?.render;
  const sheet = !render
    ? null
    : state.blind
      ? h(
          "div",
          { class: "bo-shots" },
          ...render.shots
            .filter((shot) => shot.name !== "atlas")
            .sort((a, b) => (VIEWS.indexOf(a.name) + 1 || 99) - (VIEWS.indexOf(b.name) + 1 || 99))
            .map((shot) =>
              h("div", { class: "bo-crop" }, h("img", { src: shot.url, alt: shot.name, loading: "lazy" })),
            ),
        )
      : h(
          "button",
          {
            class: "bo-sheet",
            "data-tip": "Every shot, full size",
            onclick: () =>
              lightbox.show(
                [
                  { url: render.sheet, caption: "contact sheet" },
                  ...render.shots.map((shot) => ({ url: shot.url, caption: shot.name })),
                ],
                0,
              ),
          },
          h("img", { src: render.sheet, alt: "contact sheet" }),
        );

  const report = build?.check?.report;
  const usage = build?.usage;
  const row = (name: string, value: Child, tip?: string) => [
    h("dt", null, name),
    h("dd", { "data-tip": tip ?? null }, value),
  ];
  const metrics = build
    ? h(
        "dl",
        { class: "bo-dl" },
        row(
          "Outcome",
          kind === "rendered" ? h("span", { class: "good" }, "rendered") : h("span", { class: "bad" }, kind),
        ),
        state.blind ? null : row("Arm", `${at.arm.letter} · ${at.arm.name}`, at.arm.idea),
        row("Model", `${build.model} · ${build.effort}`),
        row("Finish", build.finishReason ?? "—"),
        usage && !state.blind
          ? row(
              "Prompt",
              `${count(usage.prompt_tokens)} tokens, ${count(usage.prompt_tokens_details?.cached_tokens ?? 0)} cached`,
            )
          : null,
        usage ? row("Output", `${count(usage.completion_tokens)} tokens`) : null,
        build.reasoningChars ? row("Reasoning", `${count(build.reasoningChars)} chars`) : null,
        row("Wall time", duration(Math.round(build.wallMs / 1000))),
        build.costUsd !== null && !state.blind ? row("Cost", cents(build.costUsd)) : null,
        build.check ? row("Type errors", String(build.check.typeErrors)) : null,
        report
          ? [
              row("Triangles", count(report.triangles)),
              row("Parts", String(report.parts)),
              row("Joints", String(report.joints)),
              row("Colours", `${report.colors}${report.textures ? `, ${report.textures} textures` : ""}`),
              row("Size", report.size.map((value) => value.toFixed(2)).join(" × ") + " m"),
              row(
                "Issues",
                report.issues.length ? `${report.issues.length}` : h("span", { class: "good" }, "none"),
                report.issues.map((issue) => `${issue.level}: ${issue.message}`).join("\n"),
              ),
            ].flat()
          : null,
      )
    : h("p", { class: "muted" }, "Not run yet.");

  const typeErrors = build?.check?.typeErrors
    ? h(
        "details",
        { class: "code-block", open: true },
        h("summary", null, `Type errors (${build.check.typeErrors})`),
        h("pre", { class: "bo-pre" }, build.check.typeErrorSample.join("\n")),
      )
    : null;
  const renderError =
    kind === "crashed"
      ? h(
          "details",
          { class: "code-block", open: true },
          h("summary", null, "Render crash (harness)"),
          h("pre", { class: "bo-pre" }, build?.check?.renderError ?? ""),
        )
      : null;
  const apiFailure =
    kind === "api"
      ? h(
          "details",
          { class: "code-block", open: true },
          h("summary", null, "API error"),
          h("pre", { class: "bo-pre" }, build?.error ?? ""),
        )
      : null;

  detail.source = h("div", { class: "muted bo-loading" }, "Loading…");
  const sourceBlock = h(
    "details",
    { class: "code-block", open: true },
    h("summary", null, "Module source"),
    detail.source,
  );
  const reply = h("div", { class: "muted bo-loading" }, "Loading…");
  const replyBlock = h("details", { class: "code-block" }, h("summary", null, "Reply text"), reply);

  detailElement.replaceChildren(
    bar,
    h(
      "div",
      { class: "bo-detail-body" },
      h("div", { class: "bo-detail-left" }, viewerBox, sheet),
      h(
        "div",
        { class: "bo-detail-right" },
        h(
          "p",
          { class: "bo-pitch-full" },
          h("span", { class: `chip level ${at.pitch.level}` }, at.pitch.level),
          " ",
          pitchText(at.pitch),
        ),
        metrics,
        apiFailure,
        renderError,
        typeErrors,
        sourceBlock,
        replyBlock,
      ),
    ),
  );
  detailElement.hidden = false;
  document.body.classList.add("bo-detail-open");

  const showSource = (line?: number) => {
    const load = files.sources[buildPath(slug)];
    if (!load)
      return void detail.source.replaceChildren(h("p", { class: "muted" }, "No module: the reply had no code."));
    void load().then((text) => {
      if (state.build !== slug) return;
      const next = listing(text, line);
      detail.source.replaceWith(next);
      detail.source = next;
      if (line) sourceBlock.open = true;
    });
  };
  showSource();
  const loadReply = files.replies[`../bakeoff/rounds/${round.id}/runs/${slug}.md`];
  if (loadReply)
    void loadReply().then((text) =>
      reply.replaceWith(text.trim() ? md(text) : h("p", { class: "muted" }, "Empty reply.")),
    );
  else reply.replaceWith(h("p", { class: "muted" }, "No reply."));

  const showError = () => {
    const loaded = detail.loaded;
    detail.error.replaceChildren(loaded?.error ? errorCard(slug, loaded, (line) => showSource(line)) : "");
  };
  if (!live) return;
  if (!detail.viewer) detail.viewer = new Viewer(detail.host);
  if (detail.slug === slug) return showError();
  detail.slug = slug;
  detail.loaded = null;
  showError();
  void loadLive(detail.viewer, slug).then((loaded) => {
    if (detail.slug !== slug) return;
    detail.loaded = loaded;
    showError();
  });
}

// ── Compare ──────────────────────────────────────────────────────────────────────────────────────────────────────

type Slot = { host: HTMLDivElement; error: HTMLDivElement; viewer: Viewer; slug: string; loaded: Loaded | null };
const slots: Slot[] = [];
function slot(index: number) {
  while (slots.length <= index) {
    const host = h("div", { class: "live-host" });
    const viewer = new Viewer(host);
    const own: Slot = { host, error: h("div", { class: "live-error" }), viewer, slug: "", loaded: null };
    viewer.onView = (view) => {
      for (const other of slots) if (other !== own) other.viewer.setView(view);
    };
    slots.push(own);
  }
  return slots[index];
}

/** Frame the first build that stands and put every other view on its camera, so sizes compare too. */
function shareCamera(shown: Slot[]) {
  const first = shown.find((item) => item.loaded && !item.loaded.error);
  if (!first) return;
  first.viewer.frame();
  for (const item of shown) if (item !== first) item.viewer.setView(first.viewer.view);
}

function comparePitch() {
  const list = pitches();
  return list.find((pitch) => pitch.key === state.pitch) ?? list.find((pitch) => runsOf(pitch)) ?? list[0];
}

function compare() {
  const r = round!;
  const pitch = comparePitch();
  state.pitch = pitch.key;
  const seg = (options: Array<[string, string]>, current: string, set: (value: string) => void) =>
    h(
      "div",
      { class: "seg" },
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
      r.subjects.map((subject) => [subject.id, title(subject.id)]),
      pitch.subject.id,
      (value) => (state.pitch = `${value}-${pitch.level}`),
    ),
    seg(
      LEVELS.map((level) => [level, level]),
      pitch.level,
      (value) => (state.pitch = `${pitch.subject.id}-${value}`),
    ),
    h("span", { class: "sep" }),
    liveToggle("Wiggle", "wiggle", () => slots.map((item) => item.viewer)),
    liveToggle("Skeleton", "skeleton", () => slots.map((item) => item.viewer)),
    h(
      "button",
      {
        class: "tog",
        "data-tip": "One camera for all",
        onclick: () => shareCamera(shown),
      },
      "Reset camera",
    ),
  );
  const shown: Slot[] = [];
  const loads: Array<Promise<void>> = [];
  const cells = order(pitch).map((arm, position) => {
    const slug = slugOf(pitch, arm);
    const build = bySlug.get(slug);
    const kind = outcome(build);
    const live = kind === "rendered" || kind === "crashed" || kind === "checking";
    let media: HTMLElement;
    if (live) {
      const target = slot(position);
      shown.push(target);
      if (target.slug !== slug) {
        target.slug = slug;
        target.loaded = null;
        target.error.textContent = "";
        loads.push(
          loadLive(target.viewer, slug).then((loaded) => {
            if (target.slug !== slug) return;
            target.loaded = loaded;
            target.error.textContent = loaded.error ? errorMessage(loaded.error) : "";
          }),
        );
      }
      media = h("div", { class: "media live" }, target.host, target.error);
    } else media = h("div", { class: "media bo-media-card" }, outcomeCard(kind, build));
    return h(
      "div",
      { class: "cell", style: `--arm:${armColor(arm)}` },
      h(
        "div",
        { class: "cell-head" },
        armBadge(arm, position),
        h("b", null, armLabel(arm, position)),
        h("span", { class: "grow" }),
        build ? starButton(slug) : null,
        build ? h("button", { class: "link", onclick: () => openDetail(slug) }, "detail") : null,
      ),
      media,
      h("div", { class: "cell-foot" }, metricLine(build)),
    );
  });
  if (loads.length) void Promise.all(loads).then(() => shareCamera(shown));
  return [
    toolbar,
    h(
      "p",
      { class: "bo-pitch-full" },
      h("span", { class: `chip level ${pitch.level}` }, pitch.level),
      " ",
      pitchText(pitch),
    ),
    h("div", { class: "bo-compare" }, ...cells),
  ];
}

// ── Scoreboard ───────────────────────────────────────────────────────────────────────────────────────────────────

type ArmStats = Record<string, number | null> & { letter: number };
type Column = { key: string; name: string; tip: string; text: (value: number) => string };

function armStats(arm: Arm, index: number): ArmStats {
  const list = data.builds.filter((build) => build.arm === arm.id);
  const kinds = list.map(outcome);
  const reports = list.map((build) => build.check?.report).filter((report) => report != null);
  const chars = data.prompts[arm.id] ?? null;
  const costs = list.map((build) => build.costUsd).filter((value) => value !== null);
  return {
    letter: index,
    chars,
    tokens: chars === null ? null : chars / CHARS_PER_TOKEN,
    builds: list.length,
    nocode: kinds.filter((kind) => kind === "nocode").length,
    api: kinds.filter((kind) => kind === "api").length,
    crashed: kinds.filter((kind) => kind === "crashed").length,
    rendered: kinds.filter((kind) => kind === "rendered").length,
    typeErrors: mean(list.flatMap((build) => (build.check ? [build.check.typeErrors] : []))),
    triangles: mean(reports.map((report) => report.triangles)),
    parts: mean(reports.map((report) => report.parts)),
    joints: mean(reports.map((report) => report.joints)),
    output: mean(list.flatMap((build) => (build.usage ? [build.usage.completion_tokens] : []))),
    wall: mean(list.map((build) => build.wallMs / 1000)),
    cost: costs.length ? sum(costs) : null,
    meanCost: mean(costs),
    stars: list.filter((build) => stars.has(build.slug)).length,
  };
}

const whole = (value: number) => count(value);
const one = (value: number) => value.toFixed(1);
const COLUMNS: Column[] = [
  { key: "chars", name: "Prompt", tip: "System prompt, characters", text: whole },
  { key: "tokens", name: "≈ tokens", tip: `System prompt, at ${CHARS_PER_TOKEN} characters per token`, text: whole },
  { key: "builds", name: "Builds", tip: "Replies so far", text: whole },
  { key: "nocode", name: "No code", tip: "Replies without a code block", text: whole },
  { key: "api", name: "API err", tip: "Requests that failed", text: whole },
  { key: "crashed", name: "Crashed", tip: "Code that threw or failed to render", text: whole },
  { key: "rendered", name: "Rendered", tip: "Builds the harness rendered", text: whole },
  { key: "typeErrors", name: "Type err", tip: "Mean type errors per checked build", text: one },
  { key: "triangles", name: "Tris", tip: "Mean triangles per rendered build", text: whole },
  { key: "parts", name: "Parts", tip: "Mean parts per rendered build", text: one },
  { key: "joints", name: "Joints", tip: "Mean joints per rendered build", text: one },
  { key: "output", name: "Out tokens", tip: "Mean output tokens per reply", text: whole },
  { key: "wall", name: "Wall", tip: "Mean seconds per reply", text: (value) => `${value.toFixed(0)} s` },
  { key: "cost", name: "Cost", tip: "Estimated total", text: money },
  { key: "meanCost", name: "Per build", tip: "Estimated mean per build", text: cents },
  { key: "stars", name: "★", tip: "Builds you starred", text: whole },
];

function blindNotice(what: string) {
  return h(
    "div",
    { class: "bo-blind-note" },
    h("p", null, `${what} names the arms, so it is hidden in blind mode.`),
    h("button", { class: "tog", onclick: () => setBlind(false) }, "Reveal"),
  );
}

function scoreboard() {
  if (state.blind) return blindNotice("The scoreboard");
  const r = round!;
  const rows = r.arms.map((arm, index) => ({ arm, stats: armStats(arm, index) }));
  const { key, up } = state.sort;
  rows.sort((a, b) => {
    const x = a.stats[key];
    const y = b.stats[key];
    if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
    return up ? x - y : y - x;
  });
  const sortBy = (next: string) => {
    state.sort = state.sort.key === next ? { key: next, up: !state.sort.up } : { key: next, up: next === "letter" };
    renderBody();
  };
  const arrow = (column: string) => (state.sort.key === column ? (state.sort.up ? " ▲" : " ▼") : "");
  const table = h(
    "table",
    { class: "score bo-score" },
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        h("th", null, h("button", { class: "bo-sort", onclick: () => sortBy("letter") }, `Arm${arrow("letter")}`)),
        ...COLUMNS.map((column) =>
          h(
            "th",
            { class: "num" },
            h(
              "button",
              { class: "bo-sort", "data-tip": column.tip, onclick: () => sortBy(column.key) },
              `${column.name}${arrow(column.key)}`,
            ),
          ),
        ),
      ),
    ),
    h(
      "tbody",
      null,
      ...rows.map(({ arm, stats }) =>
        h(
          "tr",
          null,
          h("th", { "data-tip": arm.idea }, armBadge(arm, 0), ` ${arm.name}`),
          ...COLUMNS.map((column) => {
            const value = stats[column.key];
            return h("td", { class: "num" }, value === null ? "—" : column.text(value));
          }),
        ),
      ),
    ),
  );
  return [
    section("Per arm", h("div", { class: "scroll-x" }, table)),
    h(
      "p",
      { class: "muted small" },
      "Click a column to sort. Means over the builds that have the value: type errors over checked builds; " +
        "triangles, parts and joints over rendered ones. Stars are this browser's, per round.",
    ),
  ];
}

// ── Prompts ──────────────────────────────────────────────────────────────────────────────────────────────────────

function promptsView() {
  if (state.blind) return blindNotice("The prompt list");
  const r = round!;
  return r.arms.map((arm) => {
    const chars = data.prompts[arm.id] ?? null;
    const body = h("div", { class: "bo-prompt" });
    const load = files.prompts[`../bakeoff/rounds/${r.id}/prompts/${arm.id}.md`];
    return h(
      "div",
      { class: "bo-arm", style: `--arm:${armColor(arm)}` },
      h(
        "div",
        { class: "bo-arm-head" },
        armBadge(arm, 0),
        h("b", null, arm.name),
        h(
          "span",
          { class: "muted" },
          chars === null
            ? "no prompt in this round"
            : `${count(chars)} chars · ≈ ${tokenText(Math.round(chars / CHARS_PER_TOKEN))} tokens`,
        ),
      ),
      h("p", { class: "idea" }, arm.idea),
      h(
        "p",
        { class: "muted small" },
        `contract ${arm.contract} · reference: ${arm.context} · taste ${arm.taste ?? "none"}`,
      ),
      load
        ? h(
            "details",
            {
              class: "code-block",
              ontoggle: (event: Event) => {
                if (!(event.currentTarget as HTMLDetailsElement).open || body.childElementCount) return;
                body.append(h("p", { class: "muted" }, "Loading…"));
                void load().then((text) => body.replaceChildren(h("pre", { class: "bo-pre" }, text)));
              },
            },
            h("summary", null, "System prompt"),
            body,
          )
        : null,
    );
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const lightbox = new Lightbox();
document.body.append(lightbox.element);

function renderBody() {
  if (!round) {
    bodyElement.replaceChildren(h("p", { class: "muted" }, "No rounds yet: run npm run bakeoff -- run <round>."));
    return;
  }
  const scroll = scrollY;
  const views: Record<Tab, () => Child | Child[]> = { grid, compare, scoreboard, prompts: promptsView };
  bodyElement.replaceChildren(
    ...[views[state.tab]()].flat(2).filter((child): child is Node | string => Boolean(child)),
  );
  scrollTo(0, scroll);
}

/** What a re-render would show differently. */
function signature() {
  return JSON.stringify([
    data.builds.length,
    data.builds.map((build) => [outcome(build), build.render?.time ?? 0]),
    Object.values(data.prompts),
  ]);
}

let lastSignature = "";
function render() {
  if (round) document.title = `${round.id} · bake-off`;
  renderHead();
  renderBody();
  if (state.build) {
    detail.drawn = "";
    renderDetail();
  }
  save();
  lastSignature = signature();
}

/** Redraw after new data, keeping open prompts and live views in place unless something they show changed. */
async function update() {
  await refreshData();
  renderHead();
  if (signature() !== lastSignature && state.tab !== "prompts") renderBody();
  lastSignature = signature();
  if (state.build) renderDetail();
}

// Tooltips for anything with `data-tip`.
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
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (lightbox.open) {
    if (event.key === "Escape") lightbox.close();
    if (event.key === "ArrowLeft") lightbox.step(-1);
    if (event.key === "ArrowRight") lightbox.step(1);
    return;
  }
  if ((event.target as HTMLElement).closest("input, select, textarea")) return;
  if (state.build) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      const next = neighbour(state.build, ...move);
      if (next) openDetail(next);
    }
    if (event.key === "Escape") closeDetail();
    if (event.key === "s" && bySlug.has(state.build)) toggleStar(state.build);
    return;
  }
  const tab = TABS[Number(event.key) - 1];
  if (tab) {
    state.tab = tab[0];
    render();
  }
  if (event.key === "b") setBlind(!state.blind);
});

let refreshTimer = 0;
const refreshSoon = () => {
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => void update(), 300);
};
if (import.meta.hot) {
  import.meta.hot.on("bakeoff", ({ round: id }: { round: string }) => id === round?.id && refreshSoon());
  import.meta.hot.on("snapshots", ({ slug }: { slug: string }) => {
    if (round && slug.startsWith(round.id) && /^[A-Z]/.test(slug.slice(round.id.length))) refreshSoon();
  });
}
addEventListener("bakeoff-files", (event) => {
  files = (event as CustomEvent<BakeoffFiles>).detail;
  round = rounds().find((item) => item.id === round?.id) ?? round;
  refreshSoon();
});
addEventListener("resize", () =>
  document.documentElement.style.setProperty("--bo-head", `${headElement.offsetHeight}px`),
);

if (round) loadStars();
await refreshData();
render();
