// The showcase page. One sample at a time in one viewer; everything else (data panels, legends, the bend bar) is a
// key or a click away and lives in the URL: `#redFox?mode=bones&skeleton&bend=40&seed=11&panel=tree&focus=bone:neck1`.
import * as catalog from "./catalog";
import type { Catalog, SampleModule } from "./catalog";
import { h } from "./dom";
import type { Child } from "./dom";
import { inspect } from "./inspect";
import type { Inspection } from "./inspect";
import { age, count, delta, Lightbox, loadReport, loadSnapshots, loadText, versionsPanel } from "./renders";
import type { Snapshots } from "./renders";
import { diffListing, listing, originalLine } from "./source";
import { FLEX_DEGREES, Viewer } from "./viewer";
import type { ColorMode, Focus } from "./viewer";

type Panel = "info" | "tree" | "rig" | "code" | "versions";
const PANELS: Array<{ id: Panel; label: string; key: string }> = [
  { id: "info", label: "Info", key: "i" },
  { id: "tree", label: "Tree", key: "t" },
  { id: "rig", label: "Rig", key: "r" },
  { id: "code", label: "Code", key: "c" },
  { id: "versions", label: "Versions", key: "v" },
];
const MODES: Array<{ id: ColorMode; label: string; key: string; tip: string }> = [
  { id: "shaded", label: "Shaded", key: "1", tip: "Sample colours" },
  { id: "bones", label: "Bones", key: "2", tip: "False colour by owning bone; skinned parts blend by weight" },
  { id: "groups", label: "Groups", key: "3", tip: "False colour by part group" },
];

type State = {
  slug: string;
  mode: ColorMode;
  skeleton: boolean;
  wire: boolean;
  /** Bend amount (-1 to 1) while the bend bar is open, else null (rest). */
  bend: number | null;
  seed: number;
  wiggle: boolean;
  panel: Panel | null;
  /** `bone:<name>`, `group:<name>`, `part:<index>`, `chain:<name>` or `ring:<name>`. */
  focus: string | null;
  /** Code panel: `<from>..<to>`; an empty from shows `to` alone; `to` is a tag or `live`. */
  compare: string | null;
  /** Versions panel: the selected tag. */
  tag: string | null;
};

type Entry = { slug: string; path: string; name: string; failed: boolean; latest: string | null };
type Loaded = {
  slug: string;
  meta: SampleModule["meta"];
  source: string | null;
  info: Inspection | null;
  error: unknown;
  phase: "import" | "build" | null;
  ms: number | null;
  snaps: Snapshots;
};

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const slugOf = (path: string) => path.slice(path.lastIndexOf("/") + 1, -".ts".length);

let current: Catalog = { modules: catalog.modules, sources: catalog.sources };
let entries: Entry[] = [];
let loaded: Loaded | null = null;
let loading = 0;
let preview: string | null = null;
let liveBend = 0;
const snapshotsBySlug = new Map<string, Snapshots>();

const viewer = new Viewer($("viewport"));
const lightbox = new Lightbox();
document.body.append(lightbox.element);

// ── URL state ────────────────────────────────────────────────────────────────────────────────────────────────────

function parse(): State {
  const [slug = "", query = ""] = location.hash.slice(1).split("?");
  const params = new URLSearchParams(query);
  const number = (key: string, fallback: number) => {
    const value = Number(params.get(key));
    return params.has(key) && Number.isFinite(value) ? value : fallback;
  };
  const mode = params.get("mode");
  const panel = params.get("panel");
  return {
    slug: decodeURIComponent(slug),
    mode: MODES.some((entry) => entry.id === mode) ? (mode as ColorMode) : "shaded",
    skeleton: params.has("skeleton"),
    wire: params.has("wire"),
    bend: params.has("bend") ? Math.max(-1, Math.min(1, number("bend", 0) / 100)) : null,
    seed: Math.max(1, Math.round(number("seed", 11))),
    wiggle: params.has("wiggle"),
    panel: PANELS.some((entry) => entry.id === panel) ? (panel as Panel) : null,
    focus: params.get("focus"),
    compare: params.get("compare"),
    tag: params.get("tag"),
  };
}

function format(state: State) {
  const params: string[] = [];
  const add = (key: string, value?: string | number) =>
    params.push(value === undefined ? key : `${key}=${encodeURIComponent(value)}`);
  if (state.mode !== "shaded") add("mode", state.mode);
  if (state.skeleton) add("skeleton");
  if (state.wire) add("wire");
  if (state.bend !== null) add("bend", Math.round(state.bend * 100));
  if (state.bend !== null && state.seed !== 11) add("seed", state.seed);
  if (state.wiggle) add("wiggle");
  if (state.panel) add("panel", state.panel);
  if (state.focus) add("focus", state.focus);
  if (state.compare) add("compare", state.compare);
  if (state.tag) add("tag", state.tag);
  return `#${state.slug}${params.length ? `?${params.join("&")}` : ""}`;
}

let state = parse();

/** Apply a change, mirror it in the URL (a new history entry for a new sample) and refresh what it touches. */
function set(patch: Partial<State>) {
  const before = state;
  state = { ...state, ...patch };
  const hash = format(state);
  if (hash !== location.hash)
    history[patch.slug && patch.slug !== before.slug ? "pushState" : "replaceState"](null, "", hash);
  if (state.slug !== before.slug) {
    void run(false);
    return;
  }
  if (state.wiggle !== before.wiggle) viewer.wiggle(state.wiggle);
  if (state.bend !== before.bend || state.seed !== before.seed) viewer.pose(state.bend ?? 0, state.seed);
  if (state.panel !== before.panel) document.body.classList.toggle("with-panel", state.panel !== null);
  const panelChanged = state.panel !== before.panel || state.compare !== before.compare || state.tag !== before.tag;
  if (panelChanged) renderPanel();
  syncViewer();
  renderChrome();
}

// ── Sample list ──────────────────────────────────────────────────────────────────────────────────────────────────

async function refreshEntries() {
  const paths = Object.keys(current.modules);
  const [modules, created] = await Promise.all([
    Promise.allSettled(paths.map((path) => current.modules[path]())),
    fetch("/__sample-created")
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({})) as Promise<Record<string, number>>,
  ]);
  entries = paths
    .map((path, i) => {
      const result = modules[i];
      const slug = slugOf(path);
      const name = result.status === "fulfilled" ? (result.value.meta?.name ?? slug) : slug;
      const previous = entries.find((entry) => entry.slug === slug);
      return {
        slug,
        path,
        name,
        failed: result.status === "rejected" || (previous?.failed ?? false),
        latest: snapshotsBySlug.get(slug)?.tags[0]?.tag ?? null,
      };
    })
    // Newest sample first; name order among samples with no known creation time.
    .sort((a, b) => (created[b.slug] ?? 0) - (created[a.slug] ?? 0) || a.name.localeCompare(b.name));
  renderList();
  for (const entry of entries) if (!snapshotsBySlug.has(entry.slug)) void refreshSnapshots(entry.slug);
}

async function refreshSnapshots(slug: string) {
  const snaps = await loadSnapshots(slug);
  snapshotsBySlug.set(slug, snaps);
  const entry = entries.find((item) => item.slug === slug);
  if (entry) entry.latest = snaps.tags[0]?.tag ?? null;
  renderList();
  if (loaded?.slug === slug) {
    loaded.snaps = snaps;
    if (state.panel === "versions" || state.panel === "info" || state.panel === "code") renderPanel();
  }
}

const filter = $<HTMLInputElement>("filter");

function visibleEntries() {
  const query = filter.value.trim().toLowerCase();
  return entries.filter((entry) => !query || `${entry.name} ${entry.slug}`.toLowerCase().includes(query));
}

function renderList() {
  const shown = visibleEntries();
  $("count").textContent = String(entries.length);
  $("list").replaceChildren(
    ...shown.map((entry) =>
      h(
        "a",
        {
          class: `item${entry.slug === state.slug ? " on" : ""}${entry.failed ? " failed" : ""}`,
          href: format({ ...state, slug: entry.slug, focus: null, compare: null, tag: null }),
          onclick: (event: MouseEvent) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey) return;
            event.preventDefault();
            select(entry.slug);
          },
        },
        h("span", { class: "name" }, entry.name),
        entry.failed ? h("span", { class: "dot", "data-tip": "Threw on its last run" }) : null,
        entry.latest ? h("span", { class: "latest" }, entry.latest) : null,
      ),
    ),
    ...(shown.length ? [] : [h("div", { class: "none" }, "No match")]),
  );
  $("list").querySelector(".on")?.scrollIntoView({ block: "nearest" });
}

function select(slug: string) {
  document.body.classList.remove("menu");
  set({ slug, focus: null, compare: null, tag: null });
}

function step(by: number) {
  const shown = visibleEntries();
  if (!shown.length) return;
  const at = shown.findIndex((entry) => entry.slug === state.slug);
  select(shown[(at + by + shown.length) % shown.length].slug);
}

// ── Loading a sample ─────────────────────────────────────────────────────────────────────────────────────────────

async function run(keepCamera: boolean) {
  const token = ++loading;
  if (!state.slug && entries.length) {
    state = { ...state, slug: entries[0].slug };
    history.replaceState(null, "", format(state));
  }
  const slug = state.slug;
  const entry = entries.find((item) => item.slug === slug);
  const next: Loaded = {
    slug,
    meta: undefined,
    source: null,
    info: null,
    error: null,
    phase: null,
    ms: null,
    snaps: snapshotsBySlug.get(slug) ?? { tags: [], downloads: [] },
  };
  const [module, source, snaps] = await Promise.allSettled([
    entry ? current.modules[entry.path]() : Promise.reject(new Error(`No sample "${slug}" in samples/.`)),
    entry ? current.sources[entry.path]() : Promise.resolve(null),
    loadSnapshots(slug),
  ]);
  if (token !== loading) return;
  if (source.status === "fulfilled") next.source = source.value;
  if (snaps.status === "fulfilled") {
    next.snaps = snaps.value;
    snapshotsBySlug.set(slug, snaps.value);
  }
  let root = null;
  if (module.status === "rejected") {
    next.error = module.reason;
    next.phase = "import";
  } else {
    next.meta = module.value.meta;
    try {
      const started = performance.now();
      root = module.value.default();
      next.ms = performance.now() - started;
      if (!root?.isObject3D) throw new Error(`samples/${slug}.ts: the default export must return a THREE.Object3D.`);
      next.info = inspect(root);
    } catch (reason) {
      root = null;
      next.error = reason;
      next.phase = "build";
    }
  }
  if (entry) {
    entry.failed = next.error !== null;
    entry.latest = next.snaps.tags[0]?.tag ?? null;
  }
  const sameSample = loaded?.slug === slug;
  loaded = next;
  try {
    viewer.show(root, next.info, keepCamera && sameSample);
  } catch (reason) {
    // A shape the viewer cannot stage is still this sample's problem to show, not the page's.
    viewer.show(null, null);
    next.error = reason;
    next.phase = "build";
    next.info = null;
  }
  viewer.pose(state.bend ?? 0, state.seed);
  viewer.wiggle(state.wiggle && viewer.rigged);
  if (!sameSample) $("tip").hidden = true;
  document.title = `${next.meta?.name ?? slug} · samples`;
  renderList();
  renderHeader();
  renderError();
  renderPanel();
  syncViewer();
  renderChrome();
}

// ── Viewer sync ──────────────────────────────────────────────────────────────────────────────────────────────────

function focusOf(key: string | null): Focus | null {
  if (!key || !loaded?.info) return null;
  const at = key.indexOf(":");
  const kind = key.slice(0, at);
  const name = key.slice(at + 1);
  const rig = loaded.info.rig;
  if (kind === "bone") return { bones: [name] };
  if (kind === "group") return { groups: [name] };
  if (kind === "part") return { part: Number(name) };
  if (kind === "chain") return { bones: rig?.chains.find((chain) => chain.name === name)?.joints ?? [] };
  if (kind === "ring")
    return { bones: rig?.rings.find((ring) => ring.name === name)?.joints.map((j) => j.joint) ?? [] };
  return null;
}

function focusLabel(key: string) {
  const at = key.indexOf(":");
  const kind = key.slice(0, at);
  const name = key.slice(at + 1);
  const label = kind === "part" ? (loaded?.info?.parts[Number(name)]?.name ?? name) : name;
  return [kind[0].toUpperCase() + kind.slice(1), label];
}

function syncViewer() {
  const key = preview ?? state.focus;
  viewer.setDisplay({ mode: state.mode, skeleton: state.skeleton, wire: state.wire, focus: focusOf(key) });
  const chain = key?.startsWith("chain:") ? [key.slice(6)] : [];
  viewer.setRigMarkers(state.panel === "rig", chain);
  for (const element of document.querySelectorAll<HTMLElement>("[data-focus]"))
    element.classList.toggle("on", element.dataset.focus === state.focus);
}

// ── Chrome: header, tools, stats, legend, bend bar, focus chip ───────────────────────────────────────────────────

function renderHeader() {
  const meta = loaded?.meta;
  $("name").textContent = meta?.name ?? state.slug;
  $("desc").textContent = meta?.description ?? "";
  $("by").textContent = meta?.builtBy ? `by ${meta.builtBy}` : "";
  $("desc").title = meta?.description ?? "";
}

function renderChrome() {
  const rigged = viewer.rigged;
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-mode]")) {
    button.classList.toggle("on", button.dataset.mode === state.mode);
    button.disabled = !loaded?.info || (button.dataset.mode === "bones" && !rigged);
  }
  const toggle = (id: string, on: boolean, enabled: boolean) => {
    const button = $<HTMLButtonElement>(id);
    button.classList.toggle("on", on);
    button.disabled = !enabled;
  };
  toggle("t-skeleton", state.skeleton && rigged, rigged);
  toggle("t-wire", state.wire, Boolean(loaded?.info));
  toggle("t-bend", state.bend !== null && rigged, rigged);
  toggle("t-panel", state.panel !== null, true);
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-panel]"))
    button.classList.toggle("on", button.dataset.panel === state.panel);
  document.body.classList.toggle("with-panel", state.panel !== null);

  const info = loaded?.info;
  $("stats").replaceChildren(
    ...(info
      ? [
          `${count(info.parts.length)} parts`,
          `${count(info.triangles)} tris`,
          `${info.joints.length} joints`,
          `${info.colors.length} colours`,
          `${info.size
            .toArray()
            .map((v) => v.toFixed(2))
            .join(" × ")} m`,
          loaded?.ms !== null && loaded?.ms !== undefined ? `built in ${Math.round(loaded.ms)} ms` : "",
        ]
          .filter(Boolean)
          .map((text) => h("span", null, text))
      : loaded?.error
        ? [h("span", { class: "bad" }, loaded.phase === "import" ? "failed to load" : "threw while building")]
        : []),
  );

  renderBendBar();
  renderLegend();
  renderFocusChip();
}

function renderBendBar() {
  const open = state.bend !== null && viewer.rigged;
  $("bendbar").hidden = !open;
  if (!open) return;
  $("wiggle").textContent = state.wiggle ? "❚❚" : "▶";
  $("wiggle").dataset.tip = state.wiggle ? "Pause · Space" : "Wiggle · Space";
  $("wiggle").classList.toggle("on", state.wiggle);
  if (!state.wiggle) showBend(state.bend ?? 0);
  const seed = $<HTMLInputElement>("seed");
  if (document.activeElement !== seed) seed.value = String(state.seed);
}

function showBend(amount: number) {
  liveBend = amount;
  $<HTMLInputElement>("bend").value = String(Math.round(amount * 100));
  const degrees = Math.round(Math.abs(amount) * FLEX_DEGREES);
  $("bend-value").textContent = degrees === 0 ? "rest" : `${amount > 0 ? "+" : "−"}${degrees}°`;
}

function renderLegend() {
  const legend = $("legend");
  const info = loaded?.info;
  const show = info && state.mode !== "shaded" && state.panel !== "tree";
  legend.hidden = !show;
  if (!show) return;
  const rows =
    state.mode === "bones"
      ? info.joints.map((joint) => ({ key: `bone:${joint.name}`, name: joint.name, parts: joint.parts + joint.skins }))
      : info.groups.map((group) => ({ key: `group:${group.name}`, name: group.name, parts: group.parts }));
  legend.replaceChildren(
    h("div", { class: "legend-head" }, state.mode === "bones" ? `${rows.length} bones` : `${rows.length} groups`),
    h(
      "div",
      { class: "legend-rows" },
      ...rows.map((row) =>
        h(
          "button",
          { class: `legend-row${row.key === state.focus ? " on" : ""}`, "data-focus": row.key },
          h("span", {
            class: "swatch",
            style: `background:${viewer.colorOf(state.mode === "bones" ? "bones" : "groups", row.name)}`,
          }),
          h("span", { class: "name" }, row.name),
          h("span", { class: "muted" }, row.parts || ""),
        ),
      ),
    ),
  );
}

function renderFocusChip() {
  const chip = $("focus-chip");
  chip.hidden = !state.focus;
  if (!state.focus) return;
  const [kind, label] = focusLabel(state.focus);
  chip.replaceChildren(
    h("span", { class: "muted" }, kind),
    h("strong", null, label),
    h("button", { class: "x", onclick: () => set({ focus: null }), "data-tip": "Clear · Esc" }, "×"),
  );
}

function renderError() {
  const box = $("error");
  box.hidden = !loaded?.error;
  if (!loaded?.error) return;
  const error = loaded.error;
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const stack = error instanceof Error ? (error.stack ?? "") : "";
  // Frames in the sample and the SDK, with generated positions mapped back to source lines; the showcase's own
  // frames are noise here.
  const frames = stack
    .split("\n")
    .map((line) =>
      /^\s*at (?:(.*?) \()?(https?:\/\/\S+?\/((?:src|samples)\/[\w./-]+?\.ts)(?:\?[^:]*)?):(\d+):(\d+)\)?$/.exec(line),
    )
    .filter((match) => match !== null)
    .map(([, where, url, file, generated, column]) => {
      const own = file === `samples/${loaded!.slug}.ts`;
      const place = h("span", null, `${file}`);
      const item = h("li", { class: own ? "own" : "" }, where ? h("span", null, `${where} `) : null, place);
      void originalLine(url, Number(generated), Number(column)).then((line) => {
        if (!line) return;
        place.replaceWith(
          own
            ? h(
                "button",
                { class: "link", onclick: () => openCode(line), "data-tip": "Show in Code" },
                `${file}:${line}`,
              )
            : h("span", { class: "muted" }, `${file}:${line}`),
        );
      });
      return item;
    });
  box.replaceChildren(
    h(
      "div",
      { class: "error-card" },
      h(
        "div",
        { class: "error-head" },
        h("strong", null, loaded.phase === "import" ? "Failed to load" : "Threw while building"),
        h("span", { class: "muted" }, `samples/${loaded.slug}.ts`),
      ),
      h("pre", { class: "message" }, message),
      frames.length ? h("ol", { class: "frames" }, ...frames) : null,
      h("p", { class: "muted" }, "Fix the sample and save: it reloads here. Other samples are unaffected."),
    ),
  );
}

let jumpLine: number | undefined;
function openCode(line: number) {
  jumpLine = line;
  if (state.panel === "code" && !state.compare) renderPanel();
  else set({ panel: "code", compare: null });
}

// ── Panels ───────────────────────────────────────────────────────────────────────────────────────────────────────

const section = (title: Child, ...children: Child[]) => h("section", null, h("h3", null, title), ...children);
const chip = (text: string, kind = "") => h("span", { class: `chip ${kind}` }, text);
const vec = (v: readonly number[]) => `(${v.map((x) => (Math.abs(x) < 5e-5 ? "0" : x.toFixed(3))).join(", ")})`;

function renderPanel() {
  const body = $("panel-body");
  const scroll = body.scrollTop;
  const panel = state.panel;
  if (!panel || !loaded) {
    body.replaceChildren();
    return;
  }
  const content =
    panel === "info"
      ? infoPanel(loaded)
      : panel === "tree"
        ? treePanel(loaded)
        : panel === "rig"
          ? rigPanel(loaded)
          : panel === "code"
            ? codePanel(loaded)
            : versionsPanel(loaded.slug, loaded.snaps, state.tag, {
                select: (tag) => set({ tag }),
                compare: (from, to) => set({ panel: "code", compare: `${from}..${to}` }),
                lightbox: (items, index) => lightbox.show(items, index),
              });
  const same = body.dataset.panel === `${panel}:${loaded.slug}`;
  body.dataset.panel = `${panel}:${loaded.slug}`;
  body.replaceChildren(content);
  if (same && panel !== "code") body.scrollTop = scroll;
  else if (panel !== "code" || !jumpLine) body.scrollTop = 0;
  syncViewer();
}

function missing(text: string) {
  return h("div", { class: "empty-state" }, h("p", null, text));
}

function infoPanel(sample: Loaded) {
  const info = sample.info;
  const meta = sample.meta;
  const latest = sample.snaps.tags[0];
  const body = h(
    "div",
    { class: "info" },
    h(
      "section",
      { class: "meta" },
      h("h2", null, meta?.name ?? sample.slug),
      meta?.description ? h("p", null, meta.description) : null,
      h(
        "p",
        { class: "muted small" },
        h("code", null, `samples/${sample.slug}.ts`),
        meta?.builtBy ? ` · built by ${meta.builtBy}` : "",
      ),
    ),
  );
  if (info) {
    const skinned = info.parts.filter((part) => part.skin).length;
    const cells: Array<[string, Child]> = [
      ["Parts", `${count(info.parts.length)}${skinned ? ` · ${skinned} skinned` : ""}`],
      ["Triangles", count(info.triangles)],
      ["Vertices", count(info.vertices)],
      ["Joints", String(info.joints.length)],
      ["Groups", String(info.groups.length)],
      [
        "Size",
        `${info.size
          .toArray()
          .map((v) => v.toFixed(2))
          .join(" × ")} m`,
      ],
      ["Min", vec(info.bounds.min.toArray())],
      ["Max", vec(info.bounds.max.toArray())],
      ["Build", sample.ms === null ? "" : `${Math.round(sample.ms)} ms`],
    ];
    if (info.rig)
      cells.push([
        "Rig",
        `${info.rig.chains.length} chains · ${info.rig.joints.length} hinged · ${info.rig.rings.length} rings`,
      ]);
    body.append(
      section(
        "Live",
        h("dl", { class: "grid" }, ...cells.flatMap(([label, value]) => [h("dt", null, label), h("dd", null, value)])),
        h(
          "div",
          { class: "swatches" },
          ...info.colors.map((color) =>
            h("span", { class: "swatch", style: `background:${color}`, "data-tip": color }),
          ),
        ),
      ),
    );
  }
  if (latest) {
    const three = latest.shots.find((shot) => shot.name === "three-quarter") ?? latest.shots[0];
    const card = h(
      "button",
      { class: "render-card", onclick: () => set({ panel: "versions", tag: latest.tag }) },
      three ? h("img", { src: three.url, alt: "", loading: "lazy" }) : null,
      h(
        "span",
        { class: "render-text" },
        h("strong", null, latest.tag),
        h(
          "span",
          { class: "muted" },
          `${age(latest.time)} · ${sample.snaps.tags.length} version${sample.snaps.tags.length > 1 ? "s" : ""}`,
        ),
        h("span", { class: "nums" }),
      ),
    );
    const issues = h("div");
    body.append(section("Latest render", card, issues));
    void loadReport(latest.report, latest.time).then((report) => {
      if (!report) return;
      if (info) {
        const parts = delta(info.parts.length, report.parts);
        const tris = delta(info.triangles, report.triangles);
        card
          .querySelector(".nums")!
          .replaceWith(
            parts || tris
              ? h(
                  "span",
                  { class: "nums" },
                  h("span", { class: "muted" }, "live since:"),
                  parts,
                  parts ? "parts" : null,
                  tris,
                  tris ? "tris" : null,
                )
              : h("span", { class: "nums muted" }, "live build matches this render"),
          );
      }
      issues.replaceChildren(
        report.issues.length
          ? h(
              "ul",
              { class: "issues" },
              ...report.issues.map((issue) => h("li", { class: issue.level }, issue.message)),
            )
          : h("p", { class: "ok" }, "Harness report: no issues."),
      );
    });
  } else
    body.append(
      section(
        "Latest render",
        h("p", { class: "muted" }, "Not rendered yet: ", h("code", null, `npm run snap -- ${sample.slug} v01`)),
      ),
    );
  return body;
}

function roles(info: Inspection) {
  const byJoint = new Map<string, string>();
  for (const chain of info.rig?.chains ?? [])
    for (const joint of chain.joints) byJoint.set(joint, `${chain.role}${chain.side === "C" ? "" : ` ${chain.side}`}`);
  for (const joint of info.rig?.joints ?? [])
    byJoint.set(joint.name, `${joint.role}${joint.side === "C" ? "" : ` ${joint.side}`}`);
  for (const ring of info.rig?.rings ?? []) for (const joint of ring.joints) byJoint.set(joint.joint, ring.role);
  return byJoint;
}

function treePanel(sample: Loaded) {
  const info = sample.info;
  if (!info) return missing("Nothing built.");
  const body = h("div", { class: "tree" });
  if (info.joints.length) {
    const role = roles(info);
    const rows: HTMLElement[] = [];
    const walk = (name: string) => {
      const joint = info.joints.find((entry) => entry.name === name)!;
      rows.push(
        h(
          "button",
          { class: "tree-row", "data-focus": `bone:${joint.name}`, style: `--depth:${joint.depth}` },
          h("span", { class: "swatch", style: `background:${viewer.colorOf("bones", joint.name)}` }),
          h("span", { class: "name" }, joint.name),
          role.get(joint.name) ? chip(role.get(joint.name)!) : null,
          h(
            "span",
            {
              class: "muted count",
              "data-tip": `${joint.parts} parts on this bone${joint.skins ? `, ${joint.skins} more skinned to it` : ""}`,
            },
            joint.parts || "",
            joint.skins ? h("span", { class: "skins" }, `+${joint.skins}`) : null,
          ),
        ),
      );
      for (const child of joint.children) walk(child);
    };
    for (const root of info.joints.filter((joint) => joint.parent === null)) walk(root.name);
    body.append(section(`Skeleton · ${info.joints.length} joints`, h("div", { class: "rows" }, ...rows)));
  } else body.append(section("Skeleton", h("p", { class: "muted" }, "No joints: this sample is a plain object.")));

  body.append(
    section(
      `Groups · ${info.groups.length}`,
      h(
        "div",
        { class: "rows" },
        ...info.groups.map((group) =>
          h(
            "button",
            { class: "tree-row", "data-focus": `group:${group.name}` },
            h("span", { class: "swatch", style: `background:${viewer.colorOf("groups", group.name)}` }),
            h("span", { class: "name" }, group.name),
            h("span", { class: "muted count" }, group.parts),
          ),
        ),
      ),
    ),
  );

  const parts = h(
    "details",
    { class: "parts" },
    h("summary", null, `Parts · ${info.parts.length}`),
    h(
      "div",
      { class: "rows table" },
      ...info.parts.map((part) =>
        h(
          "button",
          { class: "part-row", "data-focus": `part:${part.index}` },
          h("span", { class: "swatch", style: `background:${part.color ?? "#ccc"}` }),
          h("span", { class: "name" }, part.name),
          h("span", { class: "muted" }, part.skin ? `${part.bone} +${part.skin.length - 1}` : (part.bone ?? "—")),
          h("span", { class: "muted" }, part.group),
          h("span", { class: "muted num" }, count(part.triangles)),
        ),
      ),
    ),
  );
  body.append(h("section", null, parts));
  return body;
}

function rigPanel(sample: Loaded) {
  const rig = sample.info?.rig;
  if (!rig)
    return missing(
      sample.info?.joints.length
        ? "No rig answer key: SDK builds write one to root.userData.rig."
        : "No skeleton, so no rig answer key.",
    );
  const side = (value: string) => chip(value === "L" ? "left" : value === "R" ? "right" : "centre", `side-${value}`);
  const joint = (name: string) => h("span", { class: "joint", "data-focus": `bone:${name}` }, name);
  const body = h(
    "div",
    { class: "rig" },
    h(
      "p",
      { class: "muted small" },
      "The skeleton's semantics as the SDK knows them, for scoring auto-riggers. Model space, metres; ",
      "floor rings mark contacts, violet lines hinge axes.",
    ),
  );
  body.append(
    section(
      `Chains · ${rig.chains.length}`,
      ...rig.chains.map((chain) =>
        h(
          "div",
          { class: "rig-row", "data-focus": `chain:${chain.name}` },
          h("div", { class: "rig-title" }, h("strong", null, chain.name), chip(chain.role), side(chain.side)),
          h(
            "div",
            { class: "path" },
            ...chain.joints.flatMap((name, i) =>
              i ? [h("span", { class: "arrow" }, "→"), joint(name)] : [joint(name)],
            ),
          ),
          chain.contact ? h("div", { class: "muted small" }, `contact ${vec(chain.contact)}`) : null,
        ),
      ),
    ),
  );
  if (rig.joints.length)
    body.append(
      section(
        `Hinged joints · ${rig.joints.length}`,
        ...rig.joints.map((record) =>
          h(
            "div",
            { class: "rig-row", "data-focus": `bone:${record.name}` },
            h("div", { class: "rig-title" }, h("strong", null, record.name), chip(record.role), side(record.side)),
            record.hinge ? h("div", { class: "muted small" }, `hinge axis ${vec(record.hinge)}`) : null,
          ),
        ),
      ),
    );
  if (rig.rings.length)
    body.append(
      section(
        `Rings · ${rig.rings.length}`,
        ...rig.rings.map((ring) =>
          h(
            "div",
            { class: "rig-row", "data-focus": `ring:${ring.name}` },
            h("div", { class: "rig-title" }, h("strong", null, ring.name), chip(ring.role), side(ring.side)),
            h("div", { class: "muted small" }, `pivot ${vec(ring.pivot)} · axis ${vec(ring.axis)}`),
            h(
              "div",
              { class: "path" },
              ...ring.joints.map((entry) =>
                h("span", null, joint(entry.joint), h("span", { class: "muted" }, ` ×${entry.items} `)),
              ),
            ),
          ),
        ),
      ),
    );
  return body;
}

function codePanel(sample: Loaded) {
  const tags = sample.snaps.tags.filter((tag) => tag.source);
  const [from = "", to = "live"] = (state.compare ?? "").split("..");
  const option = (value: string, label: string, selected: boolean) => h("option", { value, selected }, label);
  const choose = (next: { from?: string; to?: string }) => {
    const f = next.from ?? from;
    const t = next.to ?? to;
    set({ compare: f || t !== "live" ? `${f}..${t}` : null });
  };
  const fromSelect = h(
    "select",
    {
      onchange: (event: Event) => choose({ from: (event.target as HTMLSelectElement).value }),
      "data-tip": "Compare from",
    },
    option("", "no diff", from === ""),
    ...tags.map((tag) => option(tag.tag, tag.tag, tag.tag === from)),
  );
  const toSelect = h(
    "select",
    { onchange: (event: Event) => choose({ to: (event.target as HTMLSelectElement).value }), "data-tip": "Show" },
    option("live", "live", to === "live"),
    ...tags.map((tag) => option(tag.tag, tag.tag, tag.tag === to)),
  );
  const summary = h("span", { class: "muted" });
  const copy = h(
    "button",
    {
      class: "link",
      onclick: async () => {
        const text = await textOf(to);
        if (text !== null) await navigator.clipboard?.writeText(text).catch(() => {});
        copy.textContent = "copied";
        setTimeout(() => (copy.textContent = "copy"), 1200);
      },
    },
    "copy",
  );
  const view = h("div", { class: "code-view" });
  const body = h(
    "div",
    { class: "code" },
    h(
      "div",
      { class: "code-bar" },
      tags.length
        ? h("span", { class: "compare" }, fromSelect, h("span", { class: "muted" }, "→"), toSelect)
        : h("code", null, `samples/${sample.slug}.ts`),
      summary,
      copy,
    ),
    view,
  );
  const textOf = (tag: string) =>
    tag === "live" ? Promise.resolve(sample.source) : loadText(tags.find((entry) => entry.tag === tag)?.source ?? null);
  void Promise.all([from ? textOf(from) : null, textOf(to)]).then(([before, after]) => {
    if (after === null) {
      view.replaceChildren(missing("Source unavailable."));
      return;
    }
    if (before === null) {
      summary.textContent = `${after.replace(/\n$/, "").split("\n").length} lines`;
      const line = to === "live" ? jumpLine : undefined;
      jumpLine = undefined;
      view.replaceChildren(listing(after, line));
      return;
    }
    const result = diffListing(before, after);
    summary.replaceChildren(
      h("span", { class: "delta up" }, `+${result.added}`),
      " ",
      h("span", { class: "delta down" }, `−${result.removed}`),
    );
    view.replaceChildren(result.element);
  });
  return body;
}

// ── Hover tooltip and picking ────────────────────────────────────────────────────────────────────────────────────

const tip = $("tip");
viewer.onHover = (hit, x, y) => {
  const wanted = hit && (state.mode !== "shaded" || state.skeleton || hit.kind === "joint");
  tip.hidden = !wanted;
  viewer.canvas.style.cursor = hit ? "pointer" : "";
  if (!wanted || !hit) return;
  if (hit.kind === "joint") {
    const role = loaded?.info ? roles(loaded.info).get(hit.joint.name) : undefined;
    tip.replaceChildren(
      h("strong", null, hit.joint.name),
      h("div", { class: "muted" }, `joint${role ? ` · ${role}` : ""} · ${hit.joint.parts} parts`),
    );
  } else {
    const part = hit.part;
    tip.replaceChildren(
      h("strong", null, part.name),
      h("div", { class: "muted" }, `bone ${part.bone ?? "—"} · group ${part.group}`),
      ...(hit.weights ?? []).map(([bone, weight]) =>
        h(
          "div",
          { class: "weight" },
          h("span", { class: "swatch", style: `background:${viewer.colorOf("bones", bone)}` }),
          h("span", { class: "name" }, bone),
          h("span", { class: "bar" }, h("span", { style: `width:${Math.round(weight * 100)}%` })),
          h("span", { class: "muted" }, `${Math.round(weight * 100)}%`),
        ),
      ),
    );
  }
  const stage = $("stage").getBoundingClientRect();
  const left = Math.min(x - stage.left + 14, stage.width - tip.offsetWidth - 8);
  const top = Math.min(y - stage.top + 14, stage.height - tip.offsetHeight - 8);
  tip.style.transform = `translate(${left}px, ${top}px)`;
};

/** Click a part: its bone in Bones view, its group in Groups view, else the part itself. Click a joint: its bone. */
viewer.onPick = (hit) => {
  if (!hit) return set({ focus: null });
  const key =
    hit.kind === "joint"
      ? `bone:${hit.joint.name}`
      : state.mode === "bones" && hit.part.bone
        ? `bone:${hit.weights?.[0]?.[0] ?? hit.part.bone}`
        : state.mode === "groups"
          ? `group:${hit.part.group}`
          : `part:${hit.part.index}`;
  set({ focus: state.focus === key ? null : key });
};

viewer.onBend = (amount) => showBend(amount);

/** Rows with `data-focus` preview their focus on hover and pin it on click, in panels and the legend alike. */
for (const host of [$("panel-body"), $("legend")]) {
  host.addEventListener("pointerover", (event) => {
    const key = (event.target as HTMLElement).closest<HTMLElement>("[data-focus]")?.dataset.focus ?? null;
    if (key === preview) return;
    preview = key;
    syncViewer();
  });
  host.addEventListener("pointerleave", () => {
    preview = null;
    syncViewer();
  });
  host.addEventListener("click", (event) => {
    const key = (event.target as HTMLElement).closest<HTMLElement>("[data-focus]")?.dataset.focus;
    if (key) set({ focus: state.focus === key ? null : key });
  });
}

// ── Controls and keys ────────────────────────────────────────────────────────────────────────────────────────────

const toggleBend = () => set(state.bend === null ? { bend: 0 } : { bend: null, wiggle: false });
const toggleWiggle = () =>
  set(state.wiggle ? { wiggle: false, bend: liveBend } : { wiggle: true, bend: state.bend ?? 0 });
const nudgeBend = (by: number) =>
  set({
    wiggle: false,
    bend: Math.max(-1, Math.min(1, Math.round(((state.wiggle ? liveBend : (state.bend ?? 0)) + by) * 10) / 10)),
  });
// A new seed from rest would show nothing, so it also bends.
const reseed = () =>
  set({
    seed: 1 + Math.floor(Math.random() * 9999),
    bend: state.wiggle || Math.abs(state.bend ?? 0) >= 0.05 ? (state.bend ?? 0) : 0.6,
  });
const togglePanel = (panel: Panel) => set({ panel: state.panel === panel ? null : panel });

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-mode]"))
  button.onclick = () => set({ mode: button.dataset.mode as ColorMode });
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-panel]"))
  button.onclick = () => togglePanel(button.dataset.panel as Panel);
$("t-skeleton").onclick = () => set({ skeleton: !state.skeleton });
$("t-wire").onclick = () => set({ wire: !state.wire });
$("t-bend").onclick = toggleBend;
$("t-panel").onclick = () => set({ panel: state.panel ? null : "info" });
$("panel-close").onclick = () => set({ panel: null });
$("frame").onclick = () => viewer.frame();
$("menu").onclick = () => document.body.classList.toggle("menu");
$("scrim").onclick = () => document.body.classList.remove("menu");
$("wiggle").onclick = toggleWiggle;
$("rest").onclick = () => set({ bend: 0, wiggle: false });
$("reseed").onclick = reseed;
$("bend-close").onclick = toggleBend;
$<HTMLInputElement>("bend").oninput = (event) =>
  set({ wiggle: false, bend: Number((event.target as HTMLInputElement).value) / 100 });
$<HTMLInputElement>("seed").onchange = (event) =>
  set({ seed: Math.max(1, Math.round(Number((event.target as HTMLInputElement).value) || 11)) });
$("help-button").onclick = () => ($("help").hidden = !$("help").hidden);
$("help").onclick = (event) => event.target === $("help") && ($("help").hidden = true);
// A mouse click leaves no focus behind, so Space and Enter stay shortcuts instead of re-pressing the last button.
addEventListener("click", (event) => {
  if (event.detail > 0) (event.target as HTMLElement).closest("button")?.blur();
});
filter.oninput = () => renderList();
filter.onkeydown = (event) => {
  if (event.key === "Enter") {
    const first = visibleEntries()[0];
    if (first) select(first.slug);
    filter.blur();
  } else if (event.key === "Escape") {
    filter.value = "";
    renderList();
    filter.blur();
    document.body.classList.remove("menu");
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    step(event.key === "ArrowDown" ? 1 : -1);
  }
};

const KEYS: Record<string, () => void> = {
  ArrowDown: () => step(1),
  ArrowUp: () => step(-1),
  j: () => step(1),
  k: () => step(-1),
  "/": () => {
    document.body.classList.add("menu");
    filter.focus();
  },
  "1": () => set({ mode: "shaded" }),
  "2": () => viewer.rigged && set({ mode: "bones" }),
  "3": () => set({ mode: "groups" }),
  s: () => viewer.rigged && set({ skeleton: !state.skeleton }),
  w: () => set({ wire: !state.wire }),
  f: () => viewer.frame(),
  b: () => viewer.rigged && toggleBend(),
  " ": () => viewer.rigged && toggleWiggle(),
  "[": () => viewer.rigged && nudgeBend(-0.1),
  "]": () => viewer.rigged && nudgeBend(0.1),
  "0": () => viewer.rigged && set({ bend: 0, wiggle: false }),
  n: () => viewer.rigged && reseed(),
  i: () => togglePanel("info"),
  t: () => togglePanel("tree"),
  r: () => togglePanel("rig"),
  c: () => togglePanel("code"),
  v: () => togglePanel("versions"),
  "?": () => ($("help").hidden = !$("help").hidden),
};

addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target as HTMLElement;
  if (target.matches("input, select, textarea")) {
    if (event.key === "Escape") target.blur();
    return;
  }
  if (lightbox.open) {
    if (event.key === "Escape") lightbox.close();
    else if (event.key === "ArrowLeft") lightbox.step(-1);
    else if (event.key === "ArrowRight") lightbox.step(1);
    else return;
    event.preventDefault();
    return;
  }
  if (event.key === "Escape") {
    if (!$("help").hidden) $("help").hidden = true;
    else if (document.body.classList.contains("menu")) document.body.classList.remove("menu");
    else if (state.focus) set({ focus: null });
    else if (state.panel) set({ panel: null });
    return;
  }
  const action = KEYS[event.key.length === 1 ? event.key.toLowerCase() : event.key];
  if (!action) return;
  event.preventDefault();
  action();
});

addEventListener("popstate", () => {
  const next = parse();
  const sampleChanged = next.slug !== state.slug;
  state = next;
  if (sampleChanged) void run(false);
  else {
    viewer.wiggle(state.wiggle && viewer.rigged);
    viewer.pose(state.bend ?? 0, state.seed);
    renderPanel();
    syncViewer();
    renderChrome();
  }
});

// ── Live reload ──────────────────────────────────────────────────────────────────────────────────────────────────

function flash(text: string) {
  const live = $("live");
  live.textContent = text;
  live.classList.add("flash");
  setTimeout(() => {
    live.classList.remove("flash");
    live.textContent = "live";
  }, 1600);
}

addEventListener("catalog", (event) => {
  current = (event as CustomEvent<Catalog>).detail;
  void refreshEntries().then(() => run(true).then(() => flash("reloaded")));
});
import.meta.hot?.on("snapshots", ({ slug }: { slug: string }) => void refreshSnapshots(slug));

// Help sheet: the same table the keys run on, grouped for reading.
$("help-body").replaceChildren(
  ...[
    [
      "Samples",
      [
        ["↑ ↓ J K", "Previous / next"],
        ["/", "Filter"],
      ],
    ],
    [
      "View",
      [
        ["1 2 3", "Shaded · Bones · Groups"],
        ["S", "Skeleton x-ray"],
        ["W", "Wireframe"],
        ["F", "Frame"],
      ],
    ],
    [
      "Bend test",
      [
        ["B", "Bend bar"],
        ["Space", "Wiggle"],
        ["[ ]", "Bend − / +"],
        ["0", "Rest"],
        ["N", "New random pose"],
      ],
    ],
    ["Panels", PANELS.map((panel) => [panel.key.toUpperCase(), panel.label])],
    [
      "Anywhere",
      [
        ["Click", "Focus a part, bone or group"],
        ["Esc", "Clear focus · close"],
        ["?", "This sheet"],
      ],
    ],
  ].map(([title, rows]) =>
    h(
      "section",
      null,
      h("h3", null, title as string),
      ...(rows as string[][]).map(([key, label]) =>
        h(
          "div",
          { class: "key-row" },
          h("span", null, label),
          h("span", null, ...key.split(" ").map((k) => h("kbd", null, k))),
        ),
      ),
    ),
  ),
);

// Tooltips for `data-tip`: "Label · K" shows K as a key. They wait a moment so passing the pointer by stays quiet.
const tooltip = $("tooltip");
let tipTimer = 0;
addEventListener("pointerover", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tip]");
  clearTimeout(tipTimer);
  tooltip.hidden = true;
  if (!target) return;
  tipTimer = window.setTimeout(() => {
    if (!target.isConnected) return;
    const text = target.dataset.tip ?? "";
    const at = text.lastIndexOf(" · ");
    const keys = at < 0 && text.length <= 2 ? text : text.slice(at + 3);
    const isKey = (at >= 0 || text.length <= 2) && keys.split(" ").every((key) => key.length <= 5);
    tooltip.replaceChildren(
      isKey ? text.slice(0, Math.max(at, 0)) : text,
      ...(isKey ? keys.split(" ").map((key) => h("kbd", null, key)) : []),
    );
    tooltip.hidden = false;
    const rect = target.getBoundingClientRect();
    const width = tooltip.offsetWidth;
    const below = rect.bottom + 6 + tooltip.offsetHeight < innerHeight;
    tooltip.style.left = `${Math.max(6, Math.min(innerWidth - width - 6, rect.left + rect.width / 2 - width / 2))}px`;
    tooltip.style.top = `${below ? rect.bottom + 6 : rect.top - 6 - tooltip.offsetHeight}px`;
  }, 450);
});
addEventListener("pointerdown", () => {
  clearTimeout(tipTimer);
  tooltip.hidden = true;
});

void refreshEntries().then(() => run(false));
