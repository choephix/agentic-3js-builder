// The bake-off lab report (`/lab`): the story of every prompt bake-off round, with a scoreboard, gallery, compare
// grid, charts, failures, pitches and method, over one table of every build (`lab.json`, lab-data.mjs). Clicking any
// build opens the viewer: every render view, the numbers, the pitch, the module and the reply.
import {
  OUTCOMES,
  duration,
  esc,
  int,
  money,
  outcome,
  roundInfo,
  speed,
  title,
  tokens,
  type LabBuild,
  type LabData,
} from "./lab-model";
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
      <a class="toggle" href="${store.data.bakeoffUrl}" target="_blank" data-tip="The per-round bake-off page with live 3D">/bakeoff ↗</a>
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
const viewerState = {
  slugs: [] as string[],
  index: 0,
  shot: "three-quarter",
  pane: "info" as "info" | "code" | "reply",
};

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
/** Stops the 3D view, if one is showing. */
let unmount3d: (() => void) | null = null;
let mount3dToken = 0;
function stop3d() {
  mount3dToken++;
  unmount3d?.();
  unmount3d = null;
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
  // "3d": the exported GLB in a live, orbiting view (lab-3d.ts).
  const shots = build.glb ? ["3d", ...images] : images;
  const shot =
    viewerState.shot === "3d" && build.glb ? "3d" : build.shots[viewerState.shot] ? viewerState.shot : images[0];
  const stage =
    shot === "3d"
      ? `<div class="three"><span class="three-status"></span><small class="three-hint">Drag to turn · scroll to zoom · right-drag to pan</small></div>`
      : shot
        ? `<img class="big" src="${build.shots[shot]}" alt="">`
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
      <p class="links"><a href="${store.data.bakeoffUrl}?round=${build.round}&tab=grid&build=${build.slug}" target="_blank">Live 3D on /bakeoff ↗</a>
      <a href="#compare?set=${roundInfo(build.round).set}&rows=subject&cols=round&subject=${build.subject}&arm=${build.arm}&level=${build.level}&round=" data-close>Same prompt, every model</a>
      <a href="#compare?set=${roundInfo(build.round).set}&rows=level&cols=arm&subject=${build.subject}&round=${build.round}&level=&arm=" data-close>Every arm, both pitches</a></p>`;
  stop3d();
  viewer.innerHTML = `
    <div class="v-stage">
      <div class="v-top"><span class="v-count">${viewerState.index + 1} / ${viewerState.slugs.length}</span>
        <span class="v-shots">${shots.map((name) => `<button class="${name === shot ? "on" : ""}" data-shot="${name}">${name === "3d" ? "3D ◆" : esc(title(name))}</button>`).join("")}${build.sheet ? `<a href="${build.sheet}" target="_blank">Sheet ↗</a>` : ""}</span>
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
  if (shot === "3d") void show3d(build.glb!);
}

async function show3d(url: string) {
  const token = ++mount3dToken;
  const host = viewer.querySelector<HTMLElement>(".three");
  const { mount } = await import("./lab-3d");
  if (!host || token !== mount3dToken) return;
  const status = host.querySelector<HTMLElement>(".three-status")!;
  unmount3d = mount(host, url, (text) => {
    status.textContent = text ?? "";
    status.hidden = !text;
  });
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
  const shot = target.closest<HTMLElement>("[data-shot]")?.dataset.shot;
  if (shot) return ((viewerState.shot = shot), drawViewer());
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
    if (event.key === "Escape") closeViewer();
    else if (event.key === "3" || event.key.toLowerCase() === "d") {
      viewerState.shot = viewerState.shot === "3d" ? "three-quarter" : "3d";
      drawViewer();
    } else if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else if (event.key.toLowerCase() === "s") (toggleStar(current().slug), drawViewer());
    else if (event.key.toLowerCase() === "r" && ui.blind) (ui.revealed.add(current().slug), drawViewer());
    else if (event.key.toLowerCase() === "v") {
      const shots = [...(current().glb ? ["3d"] : []), ...SHOTS.filter((name) => current().shots[name])];
      viewerState.shot = shots[(shots.indexOf(viewerState.shot) + 1) % shots.length] ?? "three-quarter";
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
