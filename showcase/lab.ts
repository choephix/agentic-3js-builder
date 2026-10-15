// The bake-off lab report (`/lab`): the story of every prompt bake-off round, with a scoreboard, gallery, compare
// grid, charts, failures, pitches and method, over one table of every build (`lab.json`, lab-data.mjs). Clicking any
// build opens the viewer: every render view, the numbers, the pitch, the module and the reply.
import {
  OUTCOMES,
  duration,
  esc,
  int,
  model,
  money,
  outcome,
  roundInfo,
  speed,
  title,
  tokens,
  type LabBuild,
  type LabData,
} from "./lab-model";
import type { Options } from "./lab-3d";
import { renderStory } from "./lab-story";
import { armChip, load, roundOf, runnerChip, store, stars, toggleStar, ui } from "./lab-store";
import {
  readCompare,
  readGallery,
  renderCharts,
  renderCompare,
  renderFailures,
  renderGallery,
  renderMethod,
  renderPitches,
  renderScores,
} from "./lab-views";

type Tab = "story" | "scores" | "gallery" | "compare" | "charts" | "failures" | "pitches" | "method";
const TABS: Array<[Tab, string]> = [
  ["story", "Story"],
  ["scores", "Scoreboard"],
  ["gallery", "Gallery"],
  ["compare", "Compare"],
  ["charts", "Charts"],
  ["failures", "Failures"],
  ["pitches", "Pitches"],
  ["method", "Method"],
];

const head = document.querySelector<HTMLElement>("#lab-head")!;
const main = document.querySelector<HTMLElement>("#lab-main")!;
const viewer = document.querySelector<HTMLElement>("#lab-viewer")!;
const tooltip = document.querySelector<HTMLElement>("#lab-tip")!;

let tab: Tab = "story";

// ── Routing: `#tab?query`, or `#story/<chapter>` ─────────────────────────────────────────────────────────────────

function parseHash() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  const [name, anchor] = path.split("/");
  return {
    name: (TABS.find(([id]) => id === name)?.[0] ?? "story") as Tab,
    anchor,
    params: new URLSearchParams(query),
  };
}

function route() {
  const { name, anchor, params } = parseHash();
  const changed = name !== tab || !main.childElementCount;
  tab = name;
  if (tab === "gallery") readGallery(params);
  if (tab === "compare") readCompare(params);
  render();
  if (anchor) document.getElementById(`ch-${anchor}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  else if (changed) scrollTo({ top: 0 });
}

function renderHead() {
  const starCount = store.data.builds.filter((build) => stars.has(build.slug)).length;
  head.innerHTML = `
    <a class="brand" href="#story"><span class="logo">◆</span> Bake-off lab</a>
    <nav class="tabs">${TABS.map(([id, label]) => `<a href="#${id}" class="${tab === id ? "on" : ""}">${label}</a>`).join("")}</nav>
    <span class="head-tools">
      <button class="toggle${ui.blind ? " on" : ""}" id="blind-toggle" data-tip="Hide model, arm, round and cost wherever a build is shown, and shuffle orders (B)">${ui.blind ? "◉" : "○"} Blind</button>
      <a class="toggle" href="#gallery?starred=1" data-tip="Your starred builds">★ ${starCount}</a>
    </span>`;
  head.querySelector("#blind-toggle")!.addEventListener("click", () => setBlind(!ui.blind));
}

function setBlind(on: boolean) {
  ui.blind = on;
  ui.revealed.clear();
  localStorage.setItem("lab-blind", on ? "1" : "0");
  document.body.classList.toggle("blind", on);
  render();
}

function render() {
  renderHead();
  main.dataset.tab = tab;
  const rerender = () => render();
  if (tab === "story") renderStory(main);
  else if (tab === "scores") renderScores(main);
  else if (tab === "gallery") renderGallery(main, rerender);
  else if (tab === "compare") renderCompare(main, rerender);
  else if (tab === "charts") renderCharts(main);
  else if (tab === "failures") renderFailures(main);
  else if (tab === "pitches") renderPitches(main);
  else renderMethod(main);
}

// ── Viewer ───────────────────────────────────────────────────────────────────────────────────────────────────────

const SHOTS = [
  "three-quarter",
  "front",
  "side",
  "back",
  "top",
  "low",
  "head",
  "bones",
  "skeleton",
  "skeleton-side",
  "flex-a",
  "flex-b",
];
type Mode = "3d" | "three-quarter" | "sheet";
const MODES: Array<[Mode, string]> = [
  ["3d", "3D ◆"],
  ["three-quarter", "Three-quarter"],
  ["sheet", "Sheet"],
];
const viewerState = {
  slugs: [] as string[],
  index: 0,
  mode: "three-quarter" as Mode,
  /** The sheet view zoomed into one of its shots, or null for the whole sheet. */
  zoom: null as string | null,
  pane: "info" as "info" | "code" | "reply",
};
/** The 3D view's options, kept from build to build. */
const view3d: Options = { turntable: true, wiggle: false, skeleton: false, wire: false };
const TOOLS_3D: Array<[keyof Options, string, string]> = [
  ["turntable", "Turntable", "T"],
  ["wiggle", "Wiggle", "W"],
  ["skeleton", "Skeleton", "K"],
  ["wire", "Wireframe", "F"],
];

function openViewer(slug: string, scope: Element | null) {
  const slugs = scope
    ? [...new Set([...scope.querySelectorAll<HTMLElement>("[data-slug]")].map((element) => element.dataset.slug!))]
    : [slug];
  viewerState.slugs = slugs.includes(slug) ? slugs : [slug];
  viewerState.index = viewerState.slugs.indexOf(slug);
  viewer.hidden = false;
  document.body.classList.add("viewing");
  drawViewer();
}
/** The 3D view showing, if any. */
let live3d: { set(next: Partial<Options>): void; reset(): void; dispose(): void } | null = null;
let mount3dToken = 0;
function stop3d() {
  mount3dToken++;
  live3d?.dispose();
  live3d = null;
}

function closeViewer() {
  stop3d();
  viewer.hidden = true;
  document.body.classList.remove("viewing");
}
const current = () => store.bySlug.get(viewerState.slugs[viewerState.index])!;

function step(delta: number) {
  const count = viewerState.slugs.length;
  viewerState.index = (viewerState.index + delta + count) % count;
  drawViewer();
}

function drawViewer() {
  const build = current();
  const blind = ui.blind && !ui.revealed.has(build.slug);
  const round = roundOf(build);
  const subject = store.subjects.get(build.subject);
  const state = outcome(build);
  const images = SHOTS.filter((name) => build.shots[name]);
  const model3d = build.rig ?? build.glb;
  // A mode the build can't show falls back to the three-quarter render.
  const modes = MODES.filter(([mode]) => (mode === "3d" ? model3d : images.length));
  const mode =
    viewerState.mode === "3d" && model3d
      ? "3d"
      : images.length
        ? viewerState.mode === "3d"
          ? "three-quarter"
          : viewerState.mode
        : null;
  const zoom = viewerState.zoom && build.shots[viewerState.zoom] ? viewerState.zoom : null;
  const tools = TOOLS_3D.map(([key, label, hotkey]) => {
    const off = (key === "wiggle" || key === "skeleton") && !build.rig;
    return `<button class="${view3d[key] && !off ? "on" : ""}" data-tool="${key}"${off ? " disabled" : ""} data-tip="${off ? "This build has no rig" : `${label} (${hotkey})`}">${label}</button>`;
  }).join("");
  const stage =
    mode === "3d"
      ? `<div class="three"><span class="three-status"></span><div class="three-tools">${tools}<button data-tool="reset" data-tip="Frame the model again (0)">Reset view</button></div><small class="three-hint">Drag to turn · scroll to zoom · right-drag to pan</small></div>`
      : mode === "three-quarter"
        ? `<img class="big" src="${build.shots["three-quarter"] ?? build.shots[images[0]]}" alt="">`
        : mode === "sheet" && zoom
          ? `<figure class="sheet-zoom" data-zoom=""><img class="big" src="${build.shots[zoom]}" alt="" data-tip="Back to the sheet (click or Esc)"><figcaption><button data-zoom="">← Sheet</button> ${esc(title(zoom))}</figcaption></figure>`
          : mode === "sheet"
            ? `<div class="sheet-grid">${images.map((name) => `<button data-zoom="${name}"><img src="${build.shots[name]}" alt="" loading="lazy"><span>${esc(title(name))}</span></button>`).join("")}</div>`
            : `<div class="no-render"><span style="color:${OUTCOMES[state].color}">${esc(OUTCOMES[state].name)}</span>${
                build.crash
                  ? `<code>${esc(build.crash)}</code><small>thrown in ${esc(build.crashWhere ?? "?")}</small>`
                  : ""
              }${!build.hasCode ? `<small>The reply ran to ${tokens(build.output ?? NaN)} tokens (finish: ${esc(build.finish ?? "?")}) without a code block.</small>` : ""}</div>`;
  const row = (label: string, value: string) => `<div class="kv"><span>${label}</span><b>${value}</b></div>`;
  const info = blind
    ? `<p class="blind-note">Blind: who made this is hidden.</p><button class="toggle" data-reveal>Reveal (R)</button>`
    : `
      <div class="who">${runnerChip(round)} <code>${build.round}</code></div>
      <div class="who">${armChip(build.arm)} ${esc(store.arms.get(build.arm)?.name ?? build.arm)}<small>${esc(store.arms.get(build.arm)?.idea ?? "")}</small></div>
      <div class="kvs">
        ${row("Outcome", `<span style="color:${OUTCOMES[state].color}">${OUTCOMES[state].name}</span>`)}
        ${row("Cost", money(build.cost ?? NaN))}
        ${build.mode ? row("Feedback", `${esc(build.mode)} ← ${esc(build.from ?? "")}`) : ""}
        ${build.chainCost !== null ? row("Chain cost", money(build.chainCost)) : ""}
        ${build.edits ? row("Edits", build.edits.wholeModule ? "Whole module" : `${build.edits.blocks} blocks · ${build.edits.failed.length} failed`) : ""}
        ${build.critic?.model ? row("Critic", esc(model(build.critic.model).name)) : ""}
        ${row("Time", duration(build.wallMs / 1000))}
        ${row("Input", `${tokens(build.input ?? NaN)} <small>(${tokens(build.cached ?? 0)} cached)</small>`)}
        ${row("Output", `${tokens(build.output ?? NaN)} <small>${int(speed(build))} tok/s</small>`)}
        ${row("Reasoning shown", build.reasoningChars ? `${tokens(build.reasoningChars)} chars` : "none")}
        ${row("Type errors", int(build.typeErrors))}
        ${row("Parts", int(build.parts))}
        ${row("Triangles", int(build.triangles))}
        ${row("Colours", int(build.colors))}
        ${row("Joints", int(build.joints))}
        ${row("Size", build.size ? build.size.map((value) => value.toFixed(2)).join(" × ") + " m" : "–")}
        ${row("Checked on", `SDK ${roundInfo(build.round).checkedOn}`)}
      </div>
      ${build.errorCount ? `<div class="errs"><b>${build.errorCount} rig error${build.errorCount > 1 ? "s" : ""}</b>${build.errors.map((error) => `<code>${esc(error)}</code>`).join("")}</div>` : ""}
      ${build.crash ? `<div class="errs"><b>Crash</b><code>${esc(build.crash)}</code></div>` : ""}
      ${build.typeErrorSample.length ? `<div class="errs"><b>Type errors</b>${build.typeErrorSample.map((error) => `<code>${esc(error)}</code>`).join("")}</div>` : ""}
      <p class="links">
      <a href="#compare?set=${roundInfo(build.round).set}&rows=subject&cols=round&subject=${build.subject}&arm=${build.arm}&level=${build.level}&round=" data-close>Same prompt, every model</a>
      <a href="#compare?set=${roundInfo(build.round).set}&rows=level&cols=arm&subject=${build.subject}&round=${build.round}&level=&arm=" data-close>Every arm, both pitches</a></p>`;
  stop3d();
  viewer.innerHTML = `
    <div class="v-stage">
      <div class="v-top"><span class="v-count">${viewerState.index + 1} / ${viewerState.slugs.length}</span>
        <span class="v-shots">${modes.map(([id, label]) => `<button class="${id === mode ? "on" : ""}" data-mode="${id}">${label}${id === "sheet" ? ` <small>${images.length}</small>` : ""}</button>`).join("")}</span>
        <button class="v-close" data-close title="Close (Esc)">✕</button></div>
      <div class="v-image"><button class="v-nav prev" data-step="-1" title="Previous (←)">‹</button>${stage}<button class="v-nav next" data-step="1" title="Next (→)">›</button></div>
    </div>
    <aside class="v-panel">
      <h2>${esc(title(build.subject))} <span class="kind">${esc(subject?.kind ?? "")}</span> <span class="lvl ${build.level}">${build.level}</span>
        <button class="star${stars.has(build.slug) ? " on" : ""}" data-star="${build.slug}" title="Star (S)">★</button></h2>
      <p class="v-pitch">${esc(subject?.[build.level] ?? "")}</p>
      <div class="v-tabs">${(["info", "code", "reply"] as const).map((pane) => `<button class="${viewerState.pane === pane ? "on" : ""}" data-pane="${pane}">${pane === "info" ? "Numbers" : pane === "code" ? "Module" : "Reply"}</button>`).join("")}</div>
      <div class="v-body">${viewerState.pane === "info" ? info : `<pre class="code">Loading…</pre>`}</div>
      ${blind ? "" : `<p class="v-slug"><code>${build.slug}</code></p>`}
    </aside>`;
  if (viewerState.pane !== "info") void loadText(build);
  if (mode === "3d") void show3d(model3d!);
}

async function show3d(url: string) {
  const token = ++mount3dToken;
  const host = viewer.querySelector<HTMLElement>(".three");
  const { mount } = await import("./lab-3d");
  if (!host || token !== mount3dToken) return;
  const status = host.querySelector<HTMLElement>(".three-status")!;
  live3d = mount(
    host,
    url,
    view3d,
    (text) => {
      status.textContent = text ?? "";
      status.hidden = !text;
    },
    paintTools,
  );
}

/** Light up the 3D toolbar's buttons from the options. */
function paintTools() {
  for (const button of viewer.querySelectorAll<HTMLButtonElement>("[data-tool]")) {
    const key = button.dataset.tool as keyof Options;
    if (key in view3d) button.classList.toggle("on", view3d[key] && !button.disabled);
  }
}

function tool(key: string) {
  if (!live3d) return;
  if (key === "reset") return live3d.reset();
  const option = key as keyof Options;
  const button = viewer.querySelector<HTMLButtonElement>(`[data-tool="${option}"]`);
  if (!button || button.disabled) return;
  live3d.set({ [option]: !view3d[option] });
  paintTools();
}

async function loadText(build: LabBuild) {
  const target = viewer.querySelector<HTMLElement>("pre.code");
  if (!target) return;
  // `lab-rounds/` is bakeoff/rounds/: a dev-server route, a symlink in an export.
  const path =
    viewerState.pane === "code"
      ? `lab-rounds/${build.round}/builds/${build.slug}.ts`
      : `lab-rounds/${build.round}/runs/${build.slug}.md`;
  // `raw`: webshare renders markdown as a page unless asked for the file.
  const response = await fetch(`${path}?raw=1`).catch(() => null);
  const text = response?.ok ? await response.text() : null;
  if (current() !== build) return;
  target.textContent =
    text ?? (viewerState.pane === "code" ? "No module: the reply had no code block." : "No reply file.");
}

viewer.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (target === viewer) return closeViewer();
  const mode = target.closest<HTMLElement>("[data-mode]")?.dataset.mode;
  if (mode) return ((viewerState.mode = mode as Mode), (viewerState.zoom = null), drawViewer());
  const zoom = target.closest<HTMLElement>("[data-zoom]")?.dataset.zoom;
  if (zoom !== undefined) return ((viewerState.zoom = zoom || null), drawViewer());
  const key = target.closest<HTMLElement>("[data-tool]")?.dataset.tool;
  if (key) return tool(key);
  const delta = target.closest<HTMLElement>("[data-step]")?.dataset.step;
  if (delta) return step(Number(delta));
  const pane = target.closest<HTMLElement>("[data-pane]")?.dataset.pane;
  if (pane) return ((viewerState.pane = pane as typeof viewerState.pane), drawViewer());
  if (target.closest("[data-reveal]")) return (ui.revealed.add(current().slug), drawViewer());
  if (target.closest("[data-close]")) closeViewer();
});

// ── Page-wide events: open a build, star it, tooltips, keys ─────────────────────────────────────────────────────

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const star = target.closest<HTMLElement>("[data-star]");
  if (star) {
    event.preventDefault();
    event.stopPropagation();
    toggleStar(star.dataset.star!);
    return;
  }
  if (viewer.contains(target)) return;
  const tile = target.closest<HTMLElement>("[data-slug]");
  if (tile && store.bySlug.has(tile.dataset.slug!)) {
    event.preventDefault();
    openViewer(tile.dataset.slug!, tile.closest(".nav-scope") ?? tile.closest("svg"));
  }
});
addEventListener("lab-stars", () => renderHead());

document.addEventListener("mouseover", (event) => {
  const target = (event.target as Element).closest<HTMLElement | SVGElement>("[data-tip]");
  if (!target) return void (tooltip.hidden = true);
  tooltip.textContent = target.getAttribute("data-tip");
  tooltip.hidden = false;
});
document.addEventListener("mousemove", (event) => {
  if (tooltip.hidden) return;
  const x = Math.min(event.clientX + 14, innerWidth - tooltip.offsetWidth - 8);
  const y =
    event.clientY + 18 + tooltip.offsetHeight > innerHeight
      ? event.clientY - tooltip.offsetHeight - 10
      : event.clientY + 18;
  tooltip.style.transform = `translate(${x}px, ${y}px)`;
});

document.addEventListener("keydown", (event) => {
  if ((event.target as HTMLElement).closest("input, select, textarea") || event.metaKey || event.ctrlKey) return;
  if (!viewer.hidden) {
    const letter = event.key.toLowerCase();
    if (event.key === "Escape") {
      if (viewerState.mode === "sheet" && viewerState.zoom) ((viewerState.zoom = null), drawViewer());
      else closeViewer();
    } else if (event.key === "3" || letter === "d") {
      viewerState.mode = viewerState.mode === "3d" ? "three-quarter" : "3d";
      drawViewer();
    } else if (viewerState.mode === "3d" && live3d && ["t", "w", "k", "f", "0"].includes(letter))
      tool({ t: "turntable", w: "wiggle", k: "skeleton", f: "wire", 0: "reset" }[letter]!);
    else if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    // toggleStar repaints the star itself; a redraw would reload the 3D view.
    else if (letter === "s") toggleStar(current().slug);
    else if (event.key.toLowerCase() === "r" && ui.blind) (ui.revealed.add(current().slug), drawViewer());
    else if (letter === "v") {
      const order = MODES.map(([id]) => id);
      viewerState.mode = order[(order.indexOf(viewerState.mode) + 1) % order.length];
      viewerState.zoom = null;
      drawViewer();
    } else return;
    event.preventDefault();
    return;
  }
  if (event.key.toLowerCase() === "b") setBlind(!ui.blind);
  else if (event.key === "Enter") {
    const tile = (event.target as HTMLElement).closest<HTMLElement>("[data-slug]");
    if (tile) openViewer(tile.dataset.slug!, tile.closest(".nav-scope"));
  }
});

addEventListener("hashchange", route);

// ── Start ────────────────────────────────────────────────────────────────────────────────────────────────────────

async function start() {
  document.body.classList.toggle("blind", ui.blind);
  main.innerHTML = `<p class="loading">Loading every build…</p>`;
  const response = await fetch("lab.json").catch(() => null);
  if (!response?.ok) {
    main.innerHTML = `<p class="loading">Couldn't load <code>lab.json</code>.</p>`;
    return;
  }
  load((await response.json()) as LabData);
  route();
}
void start();
