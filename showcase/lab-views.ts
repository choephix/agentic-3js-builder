// The lab page's tabs besides the story: scoreboard, gallery, compare, charts, failures, pitches and method. Each
// renders into the page's main element from `store`; filters live in the address bar's hash (`#gallery?arms=…`).
import contractPlain from "../bakeoff/prompts/contract-plain.md?raw";
import contract from "../bakeoff/prompts/contract.md?raw";
import tastePrimitives from "../bakeoff/prompts/taste-primitives.md?raw";
import tasteSdk from "../bakeoff/prompts/taste-sdk.md?raw";
import { axisFor, heat, scatter, stacks, strip, type StripGroup } from "./lab-charts";
import {
  ARM_COLORS,
  OUTCOMES,
  SETS,
  crashClass,
  duration,
  esc,
  groupBy,
  int,
  median,
  model,
  money,
  outcome,
  pct,
  roundInfo,
  runnerLabel,
  speed,
  tally,
  title,
  tokens,
  type LabBuild,
  type LabRound,
  type Outcome,
} from "./lab-model";
import {
  VIEWS,
  armChip,
  builds,
  card,
  find,
  hidden,
  modelDot,
  original,
  runnerChip,
  shuffled,
  stars,
  store,
  ui,
} from "./lab-store";

/** Rewrites the hash without a navigation (filters change on every click). */
export function setQuery(tab: string, params: Record<string, string | number | boolean | string[] | Set<string>>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const text =
      value instanceof Set || Array.isArray(value)
        ? [...value].join(",")
        : typeof value === "boolean"
          ? value
            ? "1"
            : ""
          : String(value);
    if (text) query.set(key, text);
  }
  const hash = `#${tab}${query.size ? `?${query}` : ""}`;
  history.replaceState(null, "", hash);
}
const list = (params: URLSearchParams, key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
export const galleryLink = (params: Record<string, string>) => `#gallery?${new URLSearchParams(params)}`;

const roundRows = () => store.roundList;
const sectionHead = (titleText: string, lead = "") =>
  `<header class="sec-head"><h2>${titleText}</h2>${lead ? `<p>${lead}</p>` : ""}</header>`;

function outcomeBar(builds: LabBuild[]) {
  const t = tally(builds);
  return `<div class="obar">${(Object.keys(OUTCOMES) as Outcome[])
    .filter((key) => t.counts[key])
    .map(
      (key) =>
        `<span style="flex:${t.counts[key]};background:${OUTCOMES[key].color}" data-tip="${esc(`${OUTCOMES[key].name}: ${t.counts[key]}`)}"></span>`,
    )
    .join("")}</div>`;
}

// ── Scoreboard ───────────────────────────────────────────────────────────────────────────────────────────────────

export function renderScores(root: HTMLElement) {
  const rows = roundRows().map((round) => {
    const own = builds([round.id]);
    const t = tally(own);
    return { round, own, t };
  });
  const head = `<tr><th>Round</th><th>Model · effort</th><th>Pitches</th><th>Checked on SDK</th><th class="n">Builds</th>
    <th>Outcomes</th><th class="n">Rendered</th><th class="n">Spend</th><th class="n">Per build</th>
    <th class="n">Time (median · p90)</th><th class="n">Output tokens</th><th class="n">Speed</th><th class="n">Triangles</th></tr>`;
  const body = rows
    .map(
      ({ round, own, t }) => `<tr${round.id === "r1resdk" ? ' class="muted"' : ""}>
      <td><a href="${galleryLink({ rounds: round.id })}"><code>${round.id}</code></a></td>
      <td>${runnerChip(round)}</td>
      <td>${esc(SETS[roundInfo(round.id).set] ?? "")}<small> · ${round.subjects.length} subjects</small></td>
      <td><code>${roundInfo(round.id).checkedOn}</code></td>
      <td class="n">${t.n}</td>
      <td class="w">${outcomeBar(own)}</td>
      <td class="n"><b>${t.rendered}</b>/${t.n} <small>${pct(t.rate)}</small></td>
      <td class="n">${round.id === "r1resdk" ? "<small>r1's</small>" : money(t.cost)}</td>
      <td class="n">${money(t.costPer)}</td>
      <td class="n">${duration(t.wallMedian)} · ${duration(t.wallP90)}</td>
      <td class="n">${tokens(t.outputMedian)}</td>
      <td class="n">${int(t.speedMedian)} tok/s</td>
      <td class="n">${tokens(t.trianglesMedian)}</td></tr>`,
    )
    .join("");
  const all = store.data.builds.filter(original);
  const byModel = [...groupBy(all, (build) => `${build.model}|${build.effort}`)].map(([key, list]) => {
    const [id, effort] = key.split("|");
    return { id, effort, t: tally(list), list };
  });
  const modelRows = byModel
    .sort((a, b) => b.t.rate - a.t.rate)
    .map(
      ({
        id,
        effort,
        t,
        list,
      }) => `<tr><td>${modelDot(id)} ${esc(model(id).name)}</td><td>${effort}</td><td class="n">${t.n}</td>
      <td class="w">${outcomeBar(list)}</td><td class="n"><b>${pct(t.rate)}</b></td><td class="n">${money(t.cost)}</td>
      <td class="n">${money(t.costPer)}</td><td class="n">${duration(t.wallMedian)}</td><td class="n">${tokens(t.outputMedian)}</td>
      <td class="n">${t.counts.nocode}</td></tr>`,
    )
    .join("");
  root.innerHTML = `
    ${sectionHead("Scoreboard", "Every round in the order it ran. “Rendered” counts builds that built and rendered, including those whose rig check failed (orange: some meshes hang on no bone). Click a round to see its builds. Quality is not scored.")}
    <div class="table-wrap"><table class="scores">${head}${body}</table></div>
    ${sectionHead("By model and effort", "All rounds pooled, without the re-check. Each model ran different pitch sets, so use the per-round rows for like-for-like comparisons.")}
    <div class="table-wrap"><table class="scores"><tr><th>Model</th><th>Effort</th><th class="n">Builds</th><th>Outcomes</th><th class="n">Rendered</th><th class="n">Spend</th><th class="n">Per build</th><th class="n">Median time</th><th class="n">Median output</th><th class="n">Out of tokens</th></tr>${modelRows}</table></div>
    ${sectionHead("Render rate by round and arm", "Each cell: rendered of built, coloured from red (50% or less) to green (100%). Click a cell for its builds.")}
    ${armHeat(roundRows().map((round) => ({ label: runnerLabel(round), sub: round.id, round: round.id, color: model(round.model).color })))}
    ${starTally()}
  `;
}

function armHeat(rows: Array<{ label: string; sub: string; round: string | string[]; color: string }>) {
  const arms = store.data.arms;
  const head = `<tr><th></th>${arms.map((arm) => `<th>${armChip(arm.id)}<small>${esc(arm.name)}</small></th>`).join("")}<th>All</th></tr>`;
  const body = rows
    .map((row) => {
      const ids = Array.isArray(row.round) ? row.round : [row.round];
      const own = builds(ids);
      const cells = arms.map((arm) => {
        const group = own.filter((build) => build.arm === arm.id);
        if (!group.length) return `<td class="empty"></td>`;
        const t = tally(group);
        return `<td style="background:${heat(t.rate)}"><a href="${galleryLink({ rounds: ids.join(","), arms: arm.id })}" data-tip="${esc(`${row.label} · ${arm.name}: ${t.rendered} of ${t.n} rendered, ${money(t.costPer)} per build`)}">${t.rendered}/${t.n}</a></td>`;
      });
      const t = tally(own);
      return `<tr><th class="rowh">${modelDot(own[0]?.model ?? "")} ${esc(row.label)}<small>${esc(row.sub)}</small></th>${cells.join("")}<td style="background:${heat(t.rate)}"><b>${pct(t.rate)}</b></td></tr>`;
    })
    .join("");
  return `<div class="table-wrap"><table class="heat">${head}${body}</table></div>`;
}

function starTally() {
  const starred = store.data.builds.filter((build) => stars.has(build.slug));
  if (!starred.length)
    return `${sectionHead("Your stars", "Star builds anywhere on this page (★ on a tile, or S in the viewer). Your tallies by model, arm and pitch level show up here. Stars stay in this browser.")}`;
  const tallyBy = (key: (build: LabBuild) => string, label: (key: string) => string) =>
    [...groupBy(starred, key)]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([k, list]) => `<span class="pill">${label(k)} <b>${list.length}</b></span>`)
      .join("");
  return `${sectionHead(`Your stars (${starred.length})`, `<a href="${galleryLink({ starred: "1" })}">Open them in the gallery</a>. Counts only; the share of builds starred depends on how many each group has.`)}
    <div class="pills"><span class="pill-head">Model</span>${tallyBy(
      (build) => `${build.model}|${build.effort}`,
      (k) => `${modelDot(k.split("|")[0])}${esc(model(k.split("|")[0]).short)} ${esc(k.split("|")[1])}`,
    )}</div>
    <div class="pills"><span class="pill-head">Arm</span>${tallyBy(
      (build) => build.arm,
      (k) => `${armChip(k)} ${esc(store.arms.get(k)?.name ?? k)}`,
    )}</div>
    <div class="pills"><span class="pill-head">Pitch</span>${tallyBy(
      (build) => build.level,
      (k) => k,
    )}</div>`;
}

// ── Gallery ──────────────────────────────────────────────────────────────────────────────────────────────────────

type GalleryState = {
  rounds: Set<string>;
  arms: Set<string>;
  levels: Set<string>;
  kinds: Set<string>;
  outcomes: Set<string>;
  subject: string;
  starred: boolean;
  sort: string;
  group: string;
  size: number;
  view: string;
};
export const gallery: GalleryState = {
  rounds: new Set(),
  arms: new Set(),
  levels: new Set(),
  kinds: new Set(),
  outcomes: new Set(),
  subject: "",
  starred: false,
  sort: "round",
  group: "none",
  size: 190,
  view: "three-quarter",
};
export function readGallery(params: URLSearchParams) {
  gallery.rounds = new Set(list(params, "rounds"));
  gallery.arms = new Set(list(params, "arms"));
  gallery.levels = new Set(list(params, "levels"));
  gallery.kinds = new Set(list(params, "kinds"));
  gallery.outcomes = new Set(list(params, "outcomes"));
  gallery.subject = params.get("subject") ?? "";
  gallery.starred = params.get("starred") === "1";
  gallery.sort = params.get("sort") ?? "round";
  gallery.group = params.get("group") ?? "none";
  gallery.size = Number(params.get("size")) || 190;
  gallery.view = params.get("view") ?? "three-quarter";
}
const saveGallery = () =>
  setQuery("gallery", {
    ...gallery,
    size: gallery.size === 190 ? "" : gallery.size,
    sort: gallery.sort === "round" ? "" : gallery.sort,
    group: gallery.group === "none" ? "" : gallery.group,
    view: gallery.view === "three-quarter" ? "" : gallery.view,
  });

export function galleryBuilds() {
  const g = gallery;
  let out = store.data.builds.filter(
    (build) =>
      (g.rounds.size ? g.rounds.has(build.round) : original(build)) &&
      (!g.arms.size || g.arms.has(build.arm)) &&
      (!g.levels.size || g.levels.has(build.level)) &&
      (!g.kinds.size || g.kinds.has(store.subjects.get(build.subject)?.kind ?? "")) &&
      (!g.outcomes.size || g.outcomes.has(outcome(build))) &&
      (!g.subject || build.subject === g.subject) &&
      (!g.starred || stars.has(build.slug)),
  );
  const by = (key: (build: LabBuild) => number) => (out = out.slice().sort((a, b) => key(b) - key(a)));
  if (ui.blind) out = shuffled(out, "gallery");
  else if (g.sort === "subject") out = out.slice().sort((a, b) => a.subject.localeCompare(b.subject));
  else if (g.sort === "cost") by((build) => build.cost ?? 0);
  else if (g.sort === "time") by((build) => build.wallMs);
  else if (g.sort === "output") by((build) => build.output ?? 0);
  else if (g.sort === "triangles") by((build) => build.triangles ?? -1);
  else if (g.sort === "parts") by((build) => build.parts ?? -1);
  else if (g.sort === "random") out = shuffled(out, String(Date.now() >> 16));
  return out;
}

function chipRow(label: string, key: keyof GalleryState, items: Array<{ id: string; html: string; tip?: string }>) {
  const selected = gallery[key] as Set<string>;
  return `<div class="chips" data-key="${key}"><span class="chips-label">${label}</span>
    <button class="chip${selected.size ? "" : " on"}" data-all>All</button>
    ${items.map((item) => `<button class="chip${selected.has(item.id) ? " on" : ""}" data-id="${item.id}"${item.tip ? ` data-tip="${esc(item.tip)}"` : ""}>${item.html}</button>`).join("")}</div>`;
}

export function renderGallery(root: HTMLElement, rerender: () => void) {
  const shown = galleryBuilds();
  const sets = groupBy(store.roundList, (round) => roundInfo(round.id).set);
  const models = [...new Set(store.roundList.map((round) => round.model))];
  const roundChips = [...sets]
    .map(
      ([set, rounds]) =>
        `<span class="chip-set">${esc(SETS[set] ?? set)}</span>` +
        rounds
          .map(
            (round) =>
              `<button class="chip${gallery.rounds.has(round.id) ? " on" : ""}${round.id === "r1resdk" ? " faint" : ""}" data-id="${round.id}" data-tip="${esc(`${round.id}: ${model(round.model).name} ${round.effort}${roundInfo(round.id).note ? ` · ${roundInfo(round.id).note}` : ""}`)}">${modelDot(round.model)}${esc(runnerLabel(round).replace(" (re-checked)", " ↻"))}</button>`,
          )
          .join(""),
    )
    .join("");
  const subjects = [...groupBy(store.data.subjects, (subject) => subject.set)]
    .map(
      ([set, list]) =>
        `<optgroup label="${esc(SETS[set] ?? set)}">${list.map((subject) => `<option value="${subject.id}"${gallery.subject === subject.id ? " selected" : ""}>${esc(title(subject.id))}</option>`).join("")}</optgroup>`,
    )
    .join("");
  const option = (value: string, label: string, current: string) =>
    `<option value="${value}"${value === current ? " selected" : ""}>${label}</option>`;
  const groups =
    gallery.group === "none" || ui.blind
      ? [["", shown] as [string, LabBuild[]]]
      : [
          ...groupBy(shown, (build) =>
            gallery.group === "round"
              ? build.round
              : gallery.group === "subject"
                ? build.subject
                : gallery.group === "arm"
                  ? build.arm
                  : gallery.group === "level"
                    ? build.level
                    : gallery.group === "model"
                      ? `${build.model}|${build.effort}`
                      : outcome(build),
          ),
        ];
  const groupTitle = (key: string, list: LabBuild[]) => {
    const t = tally(list);
    const stats = `<small>${list.length} builds · ${t.rendered} rendered${ui.blind ? "" : ` · ${money(t.costPer)} per build · ${duration(t.wallMedian)} median`}</small>`;
    if (gallery.group === "round") return `${runnerChip(store.rounds.get(key)!)} <code>${key}</code> ${stats}`;
    if (gallery.group === "subject")
      return `${esc(title(key))} <span class="kind">${esc(store.subjects.get(key)?.kind ?? "")}</span> ${stats}`;
    if (gallery.group === "arm") return `${armChip(key)} ${esc(store.arms.get(key)?.name ?? key)} ${stats}`;
    if (gallery.group === "model")
      return `${modelDot(key.split("|")[0])} ${esc(model(key.split("|")[0]).name)} ${esc(key.split("|")[1])} ${stats}`;
    if (gallery.group === "outcome") return `${esc(OUTCOMES[key as Outcome]?.name ?? key)} ${stats}`;
    return `${esc(key)} ${stats}`;
  };
  root.innerHTML = `
    <div class="controls">
      <div class="chips" data-key="rounds"><span class="chips-label">Runs</span>
        <button class="chip${gallery.rounds.size ? "" : " on"}" data-all>All</button>
        ${models.map((id) => `<button class="chip quick" data-model="${id}">${modelDot(id)}${esc(model(id).short)}</button>`).join("")}
        <span class="chip-break"></span>${roundChips}</div>
      ${chipRow(
        "Arm",
        "arms",
        store.data.arms.map((arm) => ({ id: arm.id, html: `${armChip(arm.id)} ${esc(arm.name)}`, tip: arm.idea })),
      )}
      <div class="chip-line">
        ${chipRow("Pitch", "levels", [
          { id: "terse", html: "Terse" },
          { id: "rich", html: "Rich" },
        ])}
        ${chipRow(
          "Kind",
          "kinds",
          ["creature", "humanoid", "prop", "diorama"].map((kind) => ({ id: kind, html: title(kind) })),
        )}
      </div>
      ${chipRow(
        "Outcome",
        "outcomes",
        (Object.keys(OUTCOMES) as Outcome[]).map((key) => ({
          id: key,
          html: `<i class="odot" style="--c:${OUTCOMES[key].color}"></i>${esc(OUTCOMES[key].name)}`,
        })),
      )}
      <div class="tools">
        <label>Subject <select data-field="subject"><option value="">All subjects</option>${subjects}</select></label>
        <label>Sort <select data-field="sort">${option("round", "Run order", gallery.sort)}${option("subject", "Subject", gallery.sort)}${option("cost", "Cost", gallery.sort)}${option("time", "Time", gallery.sort)}${option("output", "Output tokens", gallery.sort)}${option("triangles", "Triangles", gallery.sort)}${option("parts", "Parts", gallery.sort)}${option("random", "Shuffle", gallery.sort)}</select></label>
        <label>Group <select data-field="group">${option("none", "None", gallery.group)}${option("round", "Round", gallery.group)}${option("model", "Model", gallery.group)}${option("subject", "Subject", gallery.group)}${option("arm", "Arm", gallery.group)}${option("level", "Pitch", gallery.group)}${option("outcome", "Outcome", gallery.group)}</select></label>
        <label>View <select data-field="view">${VIEWS.map((view) => option(view, title(view), gallery.view)).join("")}</select></label>
        <label>Size <input type="range" min="110" max="420" step="10" value="${gallery.size}" data-field="size"></label>
        <label class="check"><input type="checkbox" data-field="starred"${gallery.starred ? " checked" : ""}> ★ only</label>
        <span class="count"><b>${shown.length}</b> builds${ui.blind ? " · blind, shuffled" : ""}</span>
      </div>
    </div>
    <div class="gallery" style="--tile:${gallery.size}px">${groups
      .map(
        ([key, list]) =>
          `${key ? `<h3 class="group-title">${groupTitle(key, list)}</h3>` : ""}<div class="tiles nav-scope">${list.map((build) => card(build, { view: gallery.view })).join("")}</div>`,
      )
      .join(
        "",
      )}${shown.length ? "" : `<p class="empty-note">No builds match. <a href="#gallery">Clear the filters</a>.</p>`}</div>`;

  root.querySelectorAll<HTMLElement>(".chips").forEach((row) =>
    row.addEventListener("click", (event) => {
      const chip = (event.target as HTMLElement).closest<HTMLButtonElement>("button.chip");
      if (!chip) return;
      const key = row.dataset.key as keyof GalleryState;
      const set = gallery[key] as Set<string>;
      if (chip.dataset.all !== undefined) set.clear();
      else if (chip.dataset.model) {
        const ids = store.roundList
          .filter((round) => round.model === chip.dataset.model && round.id !== "r1resdk")
          .map((round) => round.id);
        const only = ids.length === set.size && ids.every((id) => set.has(id));
        set.clear();
        if (!only) ids.forEach((id) => set.add(id));
      } else if ((event as MouseEvent).altKey || (event as MouseEvent).metaKey) {
        set.clear();
        set.add(chip.dataset.id!);
      } else if (set.has(chip.dataset.id!)) set.delete(chip.dataset.id!);
      else set.add(chip.dataset.id!);
      saveGallery();
      rerender();
    }),
  );
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-field]").forEach((input) =>
    input.addEventListener(input.type === "range" ? "input" : "change", () => {
      const field = input.dataset.field!;
      if (field === "size") {
        gallery.size = Number(input.value);
        root.querySelector<HTMLElement>(".gallery")!.style.setProperty("--tile", `${gallery.size}px`);
        saveGallery();
        return;
      }
      if (field === "starred") gallery.starred = (input as HTMLInputElement).checked;
      else (gallery as unknown as Record<string, string>)[field] = input.value;
      saveGallery();
      rerender();
    }),
  );
}

// ── Compare ──────────────────────────────────────────────────────────────────────────────────────────────────────

export type Dim = "subject" | "round" | "arm" | "level";
const DIMS: Array<[Dim, string]> = [
  ["subject", "Subject"],
  ["round", "Model run"],
  ["arm", "Arm"],
  ["level", "Pitch"],
];
type CompareState = {
  set: string;
  rows: Dim;
  cols: Dim;
  pick: Record<Dim, string[]>;
  view: string;
  size: number;
  text: boolean;
};
export const compare: CompareState = {
  set: "r4",
  rows: "subject",
  cols: "round",
  pick: { subject: [], round: [], arm: ["docs-sdk"], level: ["rich"] },
  view: "three-quarter",
  size: 200,
  text: true,
};

export const PRESETS: Record<
  string,
  { name: string; lead: string; state: Partial<CompareState> & { pick: Record<Dim, string[]> } }
> = {
  heldout: {
    name: "App vs agent · held-out",
    lead: "12 unseen subjects: Sonnet and Sol, before and after two critique turns. Agent finals are in chapter 13's contact sheet.",
    state: {
      set: "r7",
      rows: "subject",
      cols: "round",
      pick: { subject: [], round: ["r7", "r7c2", "r7sol", "r7solc2"], arm: ["auto"], level: ["rich"] },
    },
  },
  critique: {
    name: "Dev · Sonnet critique chain",
    lead: "Craft first draft → three self-critique turns, on the 16 development briefs.",
    state: {
      set: "r5",
      rows: "subject",
      cols: "round",
      pick: { subject: [], round: ["r6", "r6c1", "r6c2", "r6c3"], arm: ["craft"], level: ["rich"] },
    },
  },
  solchain: {
    name: "Dev · Sol critique chain",
    lead: "Sol's craft2 first draft and two critique turns, on the same development briefs.",
    state: {
      set: "r5",
      rows: "subject",
      cols: "round",
      pick: { subject: [], round: ["r9sol", "r9solc1", "r9solc2"], arm: ["craft2"], level: ["rich"] },
    },
  },
  models: {
    name: "Five models, one prompt",
    lead: "Round 4's pitches with the docs, SDK-first prompt: Sonnet and Astra and Sol at xhigh, Opus at high, Haiku at xhigh.",
    state: {
      set: "r4",
      rows: "subject",
      cols: "round",
      pick: {
        subject: [],
        round: ["r4sonnet", "r4opus", "r4haiku", "r4astra", "r4sol"],
        arm: ["docs-sdk"],
        level: ["rich"],
      },
    },
  },
  trio: {
    name: "Sonnet · Opus · Haiku",
    lead: "Round 3's ten subjects at medium effort, byte-identical prompts.",
    state: {
      set: "r3",
      rows: "subject",
      cols: "round",
      pick: { subject: [], round: ["r3", "r3opus", "r3haiku"], arm: ["docs-sdk"], level: ["rich"] },
    },
  },
  arms: {
    name: "Seven prompts",
    lead: "Round 2 on Sonnet medium: one pitch, every arm from the whole source to plain three.js.",
    state: { set: "r2", rows: "subject", cols: "arm", pick: { subject: [], round: ["r2"], arm: [], level: ["rich"] } },
  },
  levels: {
    name: "Terse vs rich",
    lead: "The same subject from a one-line pitch and from a detailed one (Opus medium, docs SDK-first).",
    state: {
      set: "r3",
      rows: "subject",
      cols: "level",
      pick: { subject: [], round: ["r3opus"], arm: ["docs-sdk"], level: [] },
    },
  },
  effort: {
    name: "Medium vs xhigh",
    lead: "Round 1's prompts on Haiku at medium and at xhigh, with Sonnet medium for reference.",
    state: {
      set: "r1",
      rows: "subject",
      cols: "round",
      pick: { subject: [], round: ["r1", "r1haiku", "r1haikux"], arm: ["docs-sdk"], level: ["rich"] },
    },
  },
  sdkfix: {
    name: "SDK fix, before and after",
    lead: "Round 1's Sonnet replies on the brief SDK-first arm, built on SDK cb52341 and again on 6cc54cd. The replies are identical.",
    state: {
      set: "r1",
      rows: "subject",
      cols: "round",
      pick: { subject: [], round: ["r1", "r1resdk"], arm: ["brief-sdk"], level: ["terse"] },
    },
  },
  everything: {
    name: "One subject, every run × arm",
    lead: "The fennec, rich pitch: every model run of round 1 across all seven arms.",
    state: {
      set: "r1",
      rows: "round",
      cols: "arm",
      pick: { subject: ["fennec"], round: [], arm: [], level: ["rich"] },
    },
  },
};

export function readCompare(params: URLSearchParams) {
  const preset = PRESETS[params.get("preset") ?? ""];
  if (preset) {
    Object.assign(compare, { view: "three-quarter", size: 200, text: true }, structuredClone(preset.state));
    return;
  }
  if (!params.size) return;
  compare.set = params.get("set") ?? compare.set;
  compare.rows = (params.get("rows") as Dim) ?? compare.rows;
  compare.cols = (params.get("cols") as Dim) ?? compare.cols;
  for (const [dim] of DIMS) if (params.has(dim)) compare.pick[dim] = list(params, dim);
  compare.view = params.get("view") ?? compare.view;
  compare.size = Number(params.get("size")) || compare.size;
  compare.text = params.get("text") !== "0";
}
const saveCompare = () =>
  setQuery("compare", {
    set: compare.set,
    rows: compare.rows,
    cols: compare.cols,
    ...Object.fromEntries(DIMS.map(([dim]) => [dim, compare.pick[dim]])),
    view: compare.view === "three-quarter" ? "" : compare.view,
    size: compare.size === 200 ? "" : compare.size,
    text: compare.text ? "" : "0",
  });

function available(dim: Dim): string[] {
  const rounds = store.roundList.filter((round) => roundInfo(round.id).set === compare.set);
  if (dim === "round") return rounds.map((round) => round.id);
  if (dim === "subject")
    return store.data.subjects.filter((subject) => subject.set === compare.set).map((subject) => subject.id);
  if (dim === "level") return ["terse", "rich"];
  const used = new Set(builds(rounds.map((round) => round.id)).map((build) => build.arm));
  const arms = store.data.arms.filter((arm) => used.has(arm.id)).map((arm) => arm.id);
  // Some model pipelines use different arms (held-out Sonnet uses craft; Sol uses craft2).
  if (compare.rows !== "arm" && compare.cols !== "arm") arms.push("auto");
  return arms;
}
function dimLabel(dim: Dim, value: string, long = false) {
  if (dim === "round") {
    const round = store.rounds.get(value)!;
    return `${runnerChip(round)}${long ? ` <code>${value}</code>` : ""}`;
  }
  if (dim === "arm")
    return value === "auto" ? "Each run's arm" : `${armChip(value)} ${esc(store.arms.get(value)?.name ?? value)}`;
  if (dim === "subject") return esc(title(value));
  return esc(title(value));
}

export function renderCompare(root: HTMLElement, rerender: () => void) {
  if (compare.rows === compare.cols) compare.cols = DIMS.find(([dim]) => dim !== compare.rows)![0];
  const axis = (dim: Dim) => {
    const all = available(dim);
    const picked = compare.pick[dim].filter((value) => all.includes(value));
    return picked.length ? picked : all;
  };
  const fixed = (dim: Dim) => {
    const all = available(dim);
    return compare.pick[dim].find((value) => all.includes(value)) ?? all[0];
  };
  const rowValues = axis(compare.rows);
  const colValues = axis(compare.cols);
  const lookup = (rowValue: string, colValue: string) => {
    const v: Record<Dim, string> = { subject: "", round: "", arm: "", level: "" };
    for (const [dim] of DIMS) v[dim] = dim === compare.rows ? rowValue : dim === compare.cols ? colValue : fixed(dim);
    if (v.arm === "auto")
      return store.data.builds.find(
        (build) => build.round === v.round && build.subject === v.subject && build.level === v.level,
      );
    return find(v.round, v.subject, v.level, v.arm);
  };
  const blindCols = ui.blind && (compare.cols === "round" || compare.cols === "arm");
  const pitchText = (rowValue: string) => {
    if (!compare.text) return "";
    const subjectId = compare.rows === "subject" ? rowValue : compare.cols === "subject" ? "" : fixed("subject");
    const level = compare.rows === "level" ? rowValue : compare.cols === "level" ? "" : fixed("level");
    const subject = store.data.subjects.find((subject) => subject.id === subjectId && subject.set === compare.set);
    if (!subject) return "";
    if (!level)
      return `<p class="pitch-text"><b>Terse:</b> ${esc(subject.terse)}<br><b>Rich:</b> ${esc(subject.rich)}</p>`;
    return `<p class="pitch-text">${esc(subject[level as "terse" | "rich"])}</p>`;
  };
  const dimControls = DIMS.map(([dim, label]) => {
    const isAxis = dim === compare.rows || dim === compare.cols;
    const values = available(dim);
    const current = isAxis ? new Set(axis(dim)) : new Set([fixed(dim)]);
    const allOn = isAxis && compare.pick[dim].filter((value) => values.includes(value)).length === 0;
    return `<div class="chips" data-dim="${dim}"><span class="chips-label">${label}<small>${isAxis ? (dim === compare.rows ? "rows" : "columns") : "fixed"}</small></span>
      ${isAxis ? `<button class="chip${allOn ? " on" : ""}" data-all>All</button>` : ""}
      ${values.map((value) => `<button class="chip${!allOn && current.has(value) ? " on" : ""}" data-id="${value}">${dimLabel(dim, value)}</button>`).join("")}</div>`;
  }).join("");
  const select = (field: "rows" | "cols") =>
    `<select data-field="${field}">${DIMS.map(([dim, label]) => `<option value="${dim}"${compare[field] === dim ? " selected" : ""}>${label}</option>`).join("")}</select>`;
  const grid = rowValues
    .map((rowValue) => {
      let cells = colValues.map((colValue) => ({ colValue, build: lookup(rowValue, colValue) }));
      if (blindCols) cells = shuffled(cells, `${rowValue}|${compare.set}|${compare.cols}`);
      return (
        `<div class="cmp-rowhead">${dimLabel(compare.rows, rowValue, true)}${pitchText(rowValue)}</div>` +
        cells
          .map(({ build }, index) =>
            build
              ? `<div class="cmp-cell">${blindCols && hidden(build) ? `<span class="blind-letter">${String.fromCharCode(65 + index)}</span>` : ""}${card(build, { view: compare.view, caption: "none" })}</div>`
              : `<div class="cmp-cell none">not run</div>`,
          )
          .join("")
      );
    })
    .join("");
  const header =
    `<div class="cmp-corner"></div>` +
    colValues
      .map((value) => `<div class="cmp-colhead">${blindCols ? "?" : dimLabel(compare.cols, value)}</div>`)
      .join("");
  root.innerHTML = `
    ${sectionHead("Compare", "Lay builds side by side: pick what goes in the rows and the columns, and fix the rest. The presets are good starting points.")}
    <div class="presets">${Object.entries(PRESETS)
      .map(
        ([id, preset]) =>
          `<a class="preset" href="#compare?preset=${id}"><b>${esc(preset.name)}</b><small>${esc(preset.lead)}</small></a>`,
      )
      .join("")}</div>
    <div class="controls">
      <div class="tools">
        <span class="seg">${Object.keys(SETS)
          .map(
            (set) => `<button class="${compare.set === set ? "on" : ""}" data-set="${set}">${esc(SETS[set])}</button>`,
          )
          .join("")}</span>
        <label>Rows ${select("rows")}</label><label>Columns ${select("cols")}</label>
        <label>View <select data-field="view">${VIEWS.map((view) => `<option value="${view}"${compare.view === view ? " selected" : ""}>${title(view)}</option>`).join("")}</select></label>
        <label>Size <input type="range" min="120" max="460" step="10" value="${compare.size}" data-field="size"></label>
        <label class="check"><input type="checkbox" data-field="text"${compare.text ? " checked" : ""}> Pitch text</label>
      </div>
      ${dimControls}
    </div>
    <div class="cmp nav-scope" style="--tile:${compare.size}px;grid-template-columns:minmax(150px,${compare.text ? 260 : 170}px) repeat(${colValues.length}, var(--tile))">${header}${grid}</div>`;

  root.querySelectorAll<HTMLButtonElement>("[data-set]").forEach((button) =>
    button.addEventListener("click", () => {
      compare.set = button.dataset.set!;
      compare.pick.round = [];
      compare.pick.subject = [];
      saveCompare();
      rerender();
    }),
  );
  root.querySelectorAll<HTMLElement>(".chips[data-dim]").forEach((row) =>
    row.addEventListener("click", (event) => {
      const chip = (event.target as HTMLElement).closest<HTMLButtonElement>("button.chip");
      if (!chip) return;
      const dim = row.dataset.dim as Dim;
      const isAxis = dim === compare.rows || dim === compare.cols;
      if (chip.dataset.all !== undefined) compare.pick[dim] = [];
      else if (!isAxis) compare.pick[dim] = [chip.dataset.id!];
      else {
        const shown = new Set(compare.pick[dim].filter((value) => available(dim).includes(value)));
        const id = chip.dataset.id!;
        if ((event as MouseEvent).altKey) compare.pick[dim] = [id];
        else {
          if (shown.has(id)) shown.delete(id);
          else shown.add(id);
          compare.pick[dim] = available(dim).filter((value) => shown.has(value));
        }
      }
      saveCompare();
      rerender();
    }),
  );
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-field]").forEach((input) =>
    input.addEventListener(input.type === "range" ? "input" : "change", () => {
      const field = input.dataset.field!;
      if (field === "size") {
        compare.size = Number(input.value);
        root.querySelector<HTMLElement>(".cmp")!.style.setProperty("--tile", `${compare.size}px`);
        saveCompare();
        return;
      }
      if (field === "text") compare.text = (input as HTMLInputElement).checked;
      else if (field === "rows" || field === "cols") {
        const other = field === "rows" ? "cols" : "rows";
        if (compare[other] === input.value) compare[other] = compare[field];
        compare[field] = input.value as Dim;
      } else compare.view = input.value;
      saveCompare();
      rerender();
    }),
  );
}

// ── Charts ───────────────────────────────────────────────────────────────────────────────────────────────────────

const tipOf = (build: LabBuild, value: string) =>
  `${title(build.subject)}, ${build.level} · ${model(build.model).short} ${build.effort} · ${store.arms.get(build.arm)?.letter} · ${value}`;

/** One strip row per round, coloured by model. */
export function roundStrip(
  value: (build: LabBuild) => number,
  format: (value: number) => string,
  log: boolean,
  rounds = roundRows().filter((round) => round.id !== "r1resdk"),
) {
  const groups: StripGroup[] = rounds.map((round: LabRound) => ({
    label: runnerLabel(round),
    sub: `${round.id} · ${SETS[roundInfo(round.id).set] ?? ""}`,
    color: model(round.model).color,
    points: builds([round.id]).map((build) => ({
      v: value(build),
      slug: build.slug,
      tip: tipOf(build, format(value(build))),
    })),
  }));
  return strip(
    groups,
    axisFor(
      groups.flatMap((group) => group.points.map((point) => point.v)),
      log,
      format,
      { time: format === duration },
    ),
  );
}

export function tokenScatter(rounds?: string[]) {
  const list = store.data.builds.filter(
    (build) => original(build) && build.output && (!rounds || rounds.includes(build.round)),
  );
  const points = list.map((build) => ({
    x: build.output!,
    y: build.wallMs / 1000,
    color: model(build.model).color,
    slug: build.slug,
    ring: !build.hasCode,
    tip: tipOf(
      build,
      `${tokens(build.output!)} tokens in ${duration(build.wallMs / 1000)} (${int(speed(build))} tok/s)${build.hasCode ? "" : ", out of tokens"}`,
    ),
  }));
  const xAxis = axisFor(
    points.map((point) => point.x),
    true,
    tokens,
  );
  const yAxis = axisFor(
    points.map((point) => point.y),
    true,
    duration,
    { time: true },
  );
  return scatter(points, xAxis, yAxis, {
    xLabel: "Output tokens (thinking and reply)",
    yLabel: "Wall time per build",
    guides: [10, 25, 50, 100, 200].map((rate) => ({ k: 1 / rate, label: `${rate} tok/s` })),
  });
}

function legendModels() {
  return `<div class="legend">${Object.entries(
    Object.fromEntries(store.roundList.map((round) => [round.model, model(round.model)])),
  )
    .map(([id, info]) => `<span>${modelDot(id)}${esc(info.name)}</span>`)
    .join("")}</div>`;
}

export function renderCharts(root: HTMLElement) {
  const rounds = roundRows().filter((round) => round.id !== "r1resdk");
  const runners = [...groupBy(rounds, (round) => `${round.model}|${round.effort}`)];
  const sonnetArms = builds(["r2"]);
  const armInputs: StripGroup[] = store.data.arms.map((arm) => ({
    label: `${arm.letter} · ${arm.name}`,
    color: ARM_COLORS[arm.id],
    points: store.data.builds
      .filter((build) => original(build) && build.arm === arm.id && build.input)
      .map((build) => ({
        v: build.input!,
        slug: build.slug,
        color: model(build.model).color,
        tip: tipOf(build, `${tokens(build.input!)} input tokens`),
      })),
  }));
  const armSize = (value: (build: LabBuild) => number | null, format: (value: number) => string) => {
    const groups: StripGroup[] = store.data.arms.map((arm) => ({
      label: `${arm.letter} · ${arm.name}`,
      color: ARM_COLORS[arm.id],
      points: store.data.builds
        .filter((build) => original(build) && build.arm === arm.id && build.rendered && (value(build) ?? 0) > 0)
        .map((build) => ({
          v: value(build)!,
          slug: build.slug,
          color: model(build.model).color,
          tip: tipOf(build, format(value(build)!)),
        })),
    }));
    return strip(
      groups,
      axisFor(
        groups.flatMap((group) => group.points.map((point) => point.v)),
        true,
        format,
      ),
    );
  };
  const levelRows = runners
    .map(([key, list]) => {
      const [id, effort] = key.split("|");
      const all = builds(list.map((round) => round.id));
      const at = (level: string, value: (build: LabBuild) => number) =>
        median(all.filter((build) => build.level === level).map(value));
      const cells = [
        [(b: LabBuild) => b.output ?? NaN, tokens],
        [(b: LabBuild) => (b.rendered ? (b.parts ?? NaN) : NaN), int],
        [(b: LabBuild) => (b.rendered ? (b.triangles ?? NaN) : NaN), tokens],
        [(b: LabBuild) => b.cost ?? NaN, money],
        [(b: LabBuild) => b.wallMs / 1000, duration],
      ] as Array<[(b: LabBuild) => number, (v: number) => string]>;
      return `<tr><td>${modelDot(id)} ${esc(model(id).short)} ${effort}</td>${cells
        .map(([value, format]) => {
          const terse = at("terse", value);
          const rich = at("rich", value);
          return `<td class="n">${format(terse)} → <b>${format(rich)}</b> <small>×${(rich / terse).toFixed(2)}</small></td>`;
        })
        .join("")}</tr>`;
    })
    .join("");
  root.innerHTML = `
    ${sectionHead("Charts", "Every dot is one build: hover for what it is, click to open it. Colours are models.")}
    ${legendModels()}
    <section class="chart-box"><h3>What came of each build</h3>${stacks(
      roundRows().map((round) => {
        const t = tally(builds([round.id]));
        return {
          label: `${runnerLabel(round)}`,
          sub: round.id,
          segments: (Object.keys(OUTCOMES) as Outcome[]).map((key) => ({
            value: t.counts[key],
            color: OUTCOMES[key].color,
            tip: `${round.id} · ${OUTCOMES[key].name}: ${t.counts[key]}`,
          })),
          note: `${pct(t.rate)}`,
        };
      }),
    )}<div class="legend">${(Object.keys(OUTCOMES) as Outcome[]).map((key) => `<span><i class="odot" style="--c:${OUTCOMES[key].color}"></i>${OUTCOMES[key].name}</span>`).join("")}</div></section>
    <section class="chart-box"><h3>Render rate by model, effort and arm</h3><p>All pitch sets pooled per model and effort; the scoreboard splits them by round.</p>${armHeat(
      runners.map(([key, list]) => ({
        label: `${model(key.split("|")[0]).short} ${key.split("|")[1]}`,
        sub: list.map((round) => round.id).join(" "),
        round: list.map((round) => round.id),
        color: model(key.split("|")[0]).color,
      })),
    )}</section>
    <section class="chart-box"><h3>Time per build</h3><p>From request to the full reply, queueing included; log scale. The tick is the median. Round 4 sent 40 requests per model at once, and the two GPT models slowed down under that burst.</p>${roundStrip((build) => build.wallMs / 1000, duration, true)}</section>
    <section class="chart-box"><h3>Output tokens against time</h3><p>Output counts hidden thinking too. The diagonals are constant speeds: a build far above its model's line was slowed by the provider, not by thinking longer. Rings are replies that ran out of tokens.</p>${tokenScatter()}</section>
    <section class="chart-box"><h3>Streaming speed</h3><p>Output tokens per second of wall time.</p>${roundStrip(speed, (value) => `${Math.round(value)}`, false)}</section>
    <section class="chart-box"><h3>Output tokens per build</h3><p>Medium effort writes 8–30k tokens; xhigh writes 50–128k. 64k was the cap for medium rounds and 128k for xhigh.</p>${roundStrip((build) => build.output ?? NaN, tokens, true)}</section>
    <section class="chart-box"><h3>Cost per build</h3><p>Estimated from list prices (uncached input, cached input, output); calls over a model's long-context threshold are priced at its long-context rates.</p>${roundStrip((build) => build.cost ?? NaN, money, true)}</section>
    <section class="chart-box"><h3>What each prompt costs to send</h3><p>Input tokens per call, by arm (dots coloured by model): as Claude counts them, the whole source is about 113k tokens, the docs about 33k, the brief about 5k and plain about 1k; the GPT models count fewer for the same text. On round 2, Sonnet medium spent ${money(tally(sonnetArms.filter((b) => b.arm === "source-sdk")).costPer)} per build on arm A, ${money(tally(sonnetArms.filter((b) => b.arm === "docs-sdk")).costPer)} on C, ${money(tally(sonnetArms.filter((b) => b.arm === "brief-sdk")).costPer)} on E and ${money(tally(sonnetArms.filter((b) => b.arm === "plain")).costPer)} on plain three.js.</p>${strip(
      armInputs,
      axisFor(
        armInputs.flatMap((group) => group.points.map((point) => point.v)),
        true,
        tokens,
      ),
    )}</section>
    <section class="chart-box"><h3>Build size by arm: parts</h3><p>Meshes in the rendered model, as the harness counts them. A measure of how much was built, not of quality.</p>${armSize((build) => build.parts, int)}</section>
    <section class="chart-box"><h3>Build size by arm: triangles</h3>${armSize((build) => build.triangles, tokens)}</section>
    <section class="chart-box"><h3>Build size by arm: joints</h3><p>Plain three.js builds have no SDK skeleton.</p>${armSize((build) => build.joints, int)}</section>
    <section class="chart-box"><h3>Terse → rich</h3><p>Medians per model and effort, terse pitch → rich pitch, with the ratio.</p>
      <div class="table-wrap"><table class="scores"><tr><th>Model</th><th class="n">Output tokens</th><th class="n">Parts</th><th class="n">Triangles</th><th class="n">Cost</th><th class="n">Time</th></tr>${levelRows}</table></div></section>
  `;
}

// ── Failures ─────────────────────────────────────────────────────────────────────────────────────────────────────

export function renderFailures(root: HTMLElement) {
  const all = store.data.builds.filter(original);
  const crashed = all.filter((build) => outcome(build) === "crashed");
  const nocode = all.filter((build) => outcome(build) === "nocode");
  const rigless = all.filter((build) => outcome(build) === "rigless");
  const classes = [...groupBy(crashed, (build) => crashClass(build.crash))].sort((a, b) => b[1].length - a[1].length);
  const chip = (build: LabBuild) =>
    `<button class="fchip" data-slug="${build.slug}" data-tip="${esc(build.crash ?? build.errors[0] ?? "")}">${hidden(build) ? "" : modelDot(build.model)}${esc(title(build.subject))} <small>${build.level === "rich" ? "R" : "T"}${hidden(build) ? "" : ` · ${store.arms.get(build.arm)?.letter} · ${build.round}`}</small></button>`;
  const classRows = classes
    .map(([key, list]) => {
      const where = [...new Set(list.map((build) => build.crashWhere ?? "?"))].join(", ");
      return `<tr><td class="n"><b>${list.length}</b></td><td><code class="err">${esc(key)}</code><small class="where">thrown in ${esc(where)}</small><div class="fchips nav-scope">${list.map(chip).join("")}</div></td></tr>`;
    })
    .join("");
  const perRound = roundRows()
    .map((round) => {
      const own = builds([round.id]);
      const t = tally(own);
      return { round, t };
    })
    .filter(({ t }) => t.counts.crashed + t.counts.nocode + t.counts.rigless + t.counts.unchecked);
  // Round 1 before and after SDK 6cc54cd: the same replies.
  const before = builds(["r1"]).filter((build) => outcome(build) !== "clean");
  const pairs = before.map((build) => ({ build, after: store.bySlug.get(build.slug.replace(/^r1/, "r1resdk")) }));
  const pairRows = pairs
    .map(({ build, after }) => {
      const a = after ? outcome(after) : "unchecked";
      return `<div class="pair"><div class="pair-head">${esc(title(build.subject))} <small>${build.level} · ${armChip(build.arm)}</small></div>
        <div class="pair-row nav-scope">${card(build, { caption: "none" })}<span class="arrow">→</span>${after ? card(after, { caption: "none" }) : ""}</div>
        <div class="pair-note"><span style="color:${OUTCOMES[outcome(build)].color}">${OUTCOMES[outcome(build)].name}</span> → <span style="color:${OUTCOMES[a].color}">${OUTCOMES[a].name}</span><br><small>${esc(build.crash ?? build.errors[0] ?? "")}</small></div></div>`;
    })
    .join("");
  const nocodeRows = [...groupBy(nocode, (build) => build.round)]
    .map(
      ([round, list]) =>
        `<tr><td>${runnerChip(store.rounds.get(round)!)} <code>${round}</code></td><td class="n"><b>${list.length}</b> of ${builds([round]).length}</td><td>${[...groupBy(list, (build) => build.arm)].map(([armId, l]) => `${armChip(armId)}×${l.length}`).join(" ")}</td><td class="fchips nav-scope">${list.map(chip).join("")}</td></tr>`,
    )
    .join("");
  const riglessClasses = [...groupBy(rigless, (build) => crashClass(build.errors[0] ?? ""))].sort(
    (a, b) => b[1].length - a[1].length,
  );
  root.innerHTML = `
    ${sectionHead("Failures", `Of ${all.length} builds (without the re-check), <b>${crashed.length}</b> crashed, <b>${nocode.length}</b> ran out of tokens before writing code, and <b>${rigless.length}</b> rendered but failed the rig check. A single-run build never sees its error, so every crash is a lost build: these lists drove the two SDK passes.`)}
    <section class="chart-box"><h3>Per round</h3>${stacks(
      perRound.map(({ round, t }) => ({
        label: runnerLabel(round),
        sub: round.id,
        segments: (["crashed", "nocode", "rigless", "unchecked"] as Outcome[]).map((key) => ({
          value: t.counts[key],
          color: OUTCOMES[key].color,
          tip: `${OUTCOMES[key].name}: ${t.counts[key]}`,
        })),
        note: `${t.counts.crashed + t.counts.nocode} lost of ${t.n}`,
      })),
    )}</section>
    <section class="chart-box"><h3>Crashes by message</h3><p>Names and numbers are folded together. Where the error was thrown: an SDK file, the build's own code, or the browser.</p>
      <div class="table-wrap"><table class="fails">${classRows}</table></div></section>
    <section class="chart-box"><h3>Out of tokens</h3><p>The reply used its whole budget (64k at medium, 128k at xhigh) on thinking and never wrote the code block. All but one are at xhigh.</p>
      <div class="table-wrap"><table class="fails">${nocodeRows}</table></div></section>
    <section class="chart-box"><h3>Rendered, rig rejected</h3><p>These build and render, as a static mesh where the skeleton fails, which is how an app would show them, but they can't be exported as rigged characters.</p>
      <div class="table-wrap"><table class="fails">${riglessClasses
        .map(
          ([key, list]) =>
            `<tr><td class="n"><b>${list.length}</b></td><td><code class="err">${esc(key)}</code><div class="fchips nav-scope">${list.map(chip).join("")}</div></td></tr>`,
        )
        .join("")}</table></div></section>
    <section class="chart-box"><h3>Round 1, before and after the first SDK pass</h3><p>Each of round 1's ${before.length} non-clean builds, rebuilt from the same reply on SDK 6cc54cd (round r1resdk).</p><div class="pairs">${pairRows}</div></section>
  `;
}

// ── Pitches ──────────────────────────────────────────────────────────────────────────────────────────────────────

export function renderPitches(root: HTMLElement) {
  const sets = groupBy(store.data.subjects, (subject) => subject.set);
  root.innerHTML = `${sectionHead("Pitches", `${store.data.subjects.length} briefs in ${sets.size} sets. Rounds 1–4 pair terse and rich pitches; the gap study uses the agent's exact Category/Subject/Style brief. The strips show the docs SDK-first arm in the original rounds, craft on the development set and each held-out pipeline's arm.`)}
  ${[...sets]
    .map(([set, subjects]) => {
      const rounds = store.roundList.filter((round) => roundInfo(round.id).set === set && round.id !== "r1resdk");
      const kinds = [...groupBy(subjects, (subject) => subject.kind)]
        .map(([kind, list]) => `${list.length} ${kind}${list.length > 1 ? "s" : ""}`)
        .join(", ");
      return `<section class="pitch-set"><h3>${esc(SETS[set])} <small>${subjects.length} subjects: ${kinds} · run by ${rounds.map((round) => runnerChip(round)).join(" ")}</small></h3>
        <div class="pitch-grid">${subjects
          .map((subject) => {
            const strip = (level: "terse" | "rich") =>
              `<div class="pitch-strip nav-scope">${(ui.blind ? shuffled(rounds, subject.id + level) : rounds)
                .map((round) =>
                  find(
                    round.id,
                    subject.id,
                    level,
                    set === "r5"
                      ? "craft"
                      : set === "r7"
                        ? round.id.startsWith("r7sol")
                          ? "craft2"
                          : "craft"
                        : "docs-sdk",
                  ),
                )
                .filter((build): build is LabBuild => Boolean(build))
                .map((build) => card(build, { caption: "none" }))
                .join("")}</div>`;
            return `<article class="pitch-card"><h4><a href="#compare?set=${set}&rows=round&cols=arm&subject=${subject.id}&level=rich&round=&arm=">${esc(title(subject.id))}</a> <span class="kind">${esc(subject.kind)}</span></h4>
              <p class="terse"><b>Terse</b> ${esc(subject.terse)}</p>${strip("terse")}
              <p class="rich"><b>Rich</b> ${esc(subject.rich)}</p>${strip("rich")}</article>`;
          })
          .join("")}</div></section>`;
    })
    .join("")}`;
}

// ── Method ───────────────────────────────────────────────────────────────────────────────────────────────────────

export function renderMethod(root: HTMLElement) {
  const r2 = store.rounds.get("r2");
  const size = (armId: string) => {
    const inputs = store.data.builds
      .filter((build) => build.arm === armId && build.input && roundInfo(build.round).set !== "r1")
      .map((build) => build.input!);
    return median(inputs);
  };
  const armCell = (id: string) => {
    const arm = store.arms.get(id)!;
    return `<div class="arm-cell" style="--c:${ARM_COLORS[id]}"><b>${arm.letter}</b><span>${esc(arm.name)}</span><small>${esc(arm.idea)}</small><em>${tokens(size(id))} tokens in · ${r2?.prompts[id] ? `${int(r2.prompts[id])} chars` : ""}</em></div>`;
  };
  const md = (text: string) => `<pre class="prompt">${esc(text)}</pre>`;
  root.innerHTML = `
    ${sectionHead("Method", "How a build is made and checked, exactly as an application would run the SDK.")}
    <section class="chart-box"><h3>One build</h3>
      <div class="pipeline">
        <div><b>System prompt</b><small>contract + taste + reference, per arm</small></div><i>+</i>
        <div><b>Pitch</b><small>the user message, terse or rich</small></div><i>→</i>
        <div><b>Model</b><small>one API request; no tools, no second turn</small></div><i>→</i>
        <div><b>Module</b><small>the longest fenced code block; its SDK import points at <code>src/index.ts</code></small></div><i>→</i>
        <div><b>Typecheck</b><small>counted, never blocking (unused names ignored)</small></div><i>→</i>
        <div><b>Render</b><small><code>npm run snap</code> on the RTX 3060 Chromium: shots, report, GLB</small></div>
      </div>
      <ul class="facts">
        <li><b>Single-run builds.</b> The original rounds use one API request and one reply, with no tool calls. On an API error (429, 5xx) the runner resends the identical request up to 3 times; nothing the model wrote is fed back within that run. Later feedback chains and tool-using rounds are separate experiments.</li>
        <li><b>Rendered</b> means the module built a model and the harness rendered it. A model that fails the rig check (some meshes on no bone, say) still renders, as a static mesh when its skeleton fails, the way an app would show it: that is “rendered, rig rejected”.</li>
        <li><b>Out of tokens</b>: the reply hit its cap (64k at medium, 128k at xhigh) with no code block.</li>
        <li><b>Cost</b> is estimated from list prices for uncached input, cached input and output. Cache writes aren't reported, so they're priced as plain input. Calls over a long-context threshold (Haiku: 100k) are priced at the long-context rates.</li>
        <li><b>Time</b> is wall time from request to the end of the reply, queueing included. Rounds ran 20–40 requests at once, so time is not pure latency.</li>
        <li><b>Effort</b>: rounds 1–3 ran at medium; round 4 at xhigh (Opus at high, the top level available for it); Haiku at each round's effort, plus xhigh copies of rounds 1–3.</li>
        <li><b>Same prompts</b>: a later model on an earlier round's pitches reuses that round's exact system prompts (<code>--prompts-from</code>).</li>
        <li><b>Checked on</b>: builds are typechecked and rendered on the SDK of the day. Later SDKs accept more guesses, so later checks are kinder: the scoreboard lists each round's SDK.</li>
        <li><b>Quality is not scored.</b> No model judges the builds; the gallery, compare views, blind mode and stars are there to judge them by eye.</li>
      </ul></section>
    <section class="chart-box"><h3>Seven arms</h3><p>Each arm is a reference crossed with a taste; plain three.js is the control.</p>
      <div class="arm-grid">
        <div></div><div class="arm-colhead">SDK-first<small>build with the SDK throughout</small></div><div class="arm-colhead">Primitives-first<small>simple primitives; SDK only where they fall short</small></div>
        <div class="arm-rowhead">Source<small>every <code>src/*.ts</code> file</small></div>${armCell("source-sdk")}${armCell("source-prim")}
        <div class="arm-rowhead">Docs<small><code>docs/api.md</code> + <code>conventions.md</code></small></div>${armCell("docs-sdk")}${armCell("docs-prim")}
        <div class="arm-rowhead">Brief<small>top of <code>api.md</code>: helper map, cheat sheet, target, module</small></div>${armCell("brief-sdk")}${armCell("brief-prim")}
        <div class="arm-rowhead">None<small>three.js only, no rig</small></div>${armCell("plain")}<div class="arm-skip">Round 4 ran only A, C, E and G.</div>
      </div></section>
    <section class="chart-box"><h3>The prompt parts</h3>
      <div class="prompt-cols">
        <div><h4>Contract, SDK arms <small>bakeoff/prompts/contract.md</small></h4>${md(contract)}</div>
        <div><h4>Contract, plain three.js <small>contract-plain.md</small></h4>${md(contractPlain)}</div>
        <div><h4>Taste: SDK-first <small>taste-sdk.md</small></h4>${md(tasteSdk)}<h4>Taste: primitives-first <small>taste-primitives.md</small></h4>${md(tastePrimitives)}</div>
      </div>
      <p>The contract line “Every piece of geometry joins the model through the builder…” was added after round 1, so round 1's prompts don't have it. Each round's full system prompts, reference included, are kept with its results.</p></section>
    <section class="chart-box"><h3>Reproduce</h3>
      <pre class="prompt">npm run bakeoff -- run r5 --model anthropic/claude-sonnet-5-5 --effort medium --pitches pitches-r4.json --concurrency 30
npm run bakeoff -- run r5opus --model anthropic/claude-opus-5-5 --effort high --prompts-from r5
npm run bakeoff -- check r5        # typecheck and render every build without a check
npm run lab-thumbs                 # thumbnails for this page</pre>
      <p>Details in <code>bakeoff/README.md</code>; the SDK changes the rounds drove are in <code>docs/DESIGN.md</code> (“Bake-off r1” and “Bake-off r2 and r3”).</p></section>
  `;
}
