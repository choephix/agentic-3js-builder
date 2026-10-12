// The lab page's loaded data with its indexes, the viewer's stars and blind mode, and the build card every view
// draws.
import type { Arm } from "./bakeoff-files";
import {
  ARM_COLORS,
  OUTCOMES,
  esc,
  model,
  outcome,
  roundInfo,
  runnerLabel,
  title,
  type LabBuild,
  type LabData,
  type LabRound,
  type LabSubject,
} from "./lab-model";

export const store = {
  data: { generated: "", arms: [], subjects: [], rounds: [], builds: [] } as LabData,
  bySlug: new Map<string, LabBuild>(),
  rounds: new Map<string, LabRound>(),
  /** Rounds in the order they ran. */
  roundList: [] as LabRound[],
  subjects: new Map<string, LabSubject>(),
  arms: new Map<string, Arm>(),
  /** `round|subject|level|arm` → build. */
  cell: new Map<string, LabBuild>(),
};

export function load(data: LabData) {
  const order = (id: string) => roundInfo(id).order;
  data.rounds.sort((a, b) => order(a.id) - order(b.id));
  const subjectOrder = new Map(data.subjects.map((subject, index) => [subject.id, index]));
  const armOrder = new Map(data.arms.map((arm, index) => [arm.id, index]));
  data.builds.sort(
    (a, b) =>
      order(a.round) - order(b.round) ||
      (subjectOrder.get(a.subject) ?? 0) - (subjectOrder.get(b.subject) ?? 0) ||
      (a.level === b.level ? 0 : a.level === "terse" ? -1 : 1) ||
      (armOrder.get(a.arm) ?? 0) - (armOrder.get(b.arm) ?? 0),
  );
  store.data = data;
  store.bySlug = new Map(data.builds.map((build) => [build.slug, build]));
  store.rounds = new Map(data.rounds.map((round) => [round.id, round]));
  store.roundList = data.rounds;
  store.subjects = new Map(data.subjects.map((subject) => [subject.id, subject]));
  store.arms = new Map(data.arms.map((arm) => [arm.id, arm]));
  store.cell = new Map(
    data.builds.map((build) => [`${build.round}|${build.subject}|${build.level}|${build.arm}`, build]),
  );
}

export const builds = (rounds?: string[]) =>
  rounds ? store.data.builds.filter((build) => rounds.includes(build.round)) : store.data.builds;
export const find = (round: string, subject: string, level: string, arm: string) =>
  store.cell.get(`${round}|${subject}|${level}|${arm}`);
export const roundOf = (build: LabBuild) => store.rounds.get(build.round)!;
export const arm = (id: string) => store.arms.get(id);
export const armLetter = (id: string) => store.arms.get(id)?.letter ?? "?";
export const subjectName = (id: string) => title(id);
/** Every round but the re-check, whose replies (and spend) are round 1's. */
export const original = (build: LabBuild) => build.round !== "r1resdk";

// ── Stars and blind mode ─────────────────────────────────────────────────────────────────────────────────────────

/** The viewer's stars, kept in this browser. The first visit starts from any stars given on /bakeoff. */
const STAR_KEY = "lab-stars";
export const stars = new Set<string>();
(() => {
  const own = localStorage.getItem(STAR_KEY);
  if (own !== null) {
    try {
      for (const slug of JSON.parse(own) as string[]) stars.add(slug);
    } catch {
      // A broken entry starts empty.
    }
    return;
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) ?? "";
    if (!key.startsWith("bakeoff-stars:")) continue;
    try {
      for (const slug of JSON.parse(localStorage.getItem(key) ?? "[]") as string[]) stars.add(slug);
    } catch {
      // Skip a broken entry.
    }
  }
})();
export function toggleStar(slug: string) {
  if (stars.has(slug)) stars.delete(slug);
  else stars.add(slug);
  localStorage.setItem(STAR_KEY, JSON.stringify([...stars].sort()));
  for (const element of document.querySelectorAll<HTMLElement>(`[data-star="${slug}"]`))
    element.classList.toggle("on", stars.has(slug));
  dispatchEvent(new CustomEvent("lab-stars"));
}

export const ui = {
  /** Blind mode: no model, arm, round or cost anywhere a build is shown, and shuffled orders. */
  blind: localStorage.getItem("lab-blind") === "1",
  /** Builds revealed one by one in blind mode. */
  revealed: new Set<string>(),
};
export const hidden = (build: LabBuild) => ui.blind && !ui.revealed.has(build.slug);

/** A shuffle that stays put between renders: the same seed and list give the same order. */
export function shuffled<T>(items: T[], seed: string) {
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;
  const rand = () => (state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── Cards ────────────────────────────────────────────────────────────────────────────────────────────────────────

export const VIEWS = ["three-quarter", "front", "side", "back", "top"] as const;
export type View = (typeof VIEWS)[number];

export function thumbFor(build: LabBuild, view: string = "three-quarter") {
  if (view !== "three-quarter" && build.thumbViews.includes(view)) return `lab-thumbs/${build.slug}-${view}.webp`;
  return build.thumb;
}

/** Who made a build, in a few words, for tooltips. */
export function identity(build: LabBuild) {
  const round = roundOf(build);
  return `${model(build.model).name} ${build.effort} · ${armLetter(build.arm)} ${arm(build.arm)?.name ?? build.arm} · ${build.round}${round && roundInfo(round.id).label ? ` (${roundInfo(round.id).label})` : ""}`;
}

export const modelDot = (id: string) => `<i class="mdot" style="--c:${model(id).color}"></i>`;
export const armChip = (id: string) =>
  `<b class="arm-chip" style="--c:${ARM_COLORS[id] ?? "#888"}" title="${esc(arm(id)?.name ?? id)}">${esc(armLetter(id))}</b>`;
export const runnerChip = (round: LabRound) =>
  `<span class="runner" style="--c:${model(round.model).color}">${modelDot(round.model)}${esc(runnerLabel(round))}</span>`;

/**
 * One build as a tile: its render (or what stopped it), its subject, and badges for model, arm and pitch level.
 * `caption` picks the caption; badges hide in blind mode.
 */
export function card(
  build: LabBuild,
  options: { view?: string; caption?: "subject" | "runner" | "arm" | "none" } = {},
) {
  const state = outcome(build);
  const blind = hidden(build);
  const src = thumbFor(build, options.view);
  const subject = subjectName(build.subject);
  const caption =
    options.caption === "none"
      ? ""
      : options.caption === "runner" && !blind
        ? runnerLabel(roundOf(build))
        : options.caption === "arm" && !blind
          ? (arm(build.arm)?.name ?? build.arm)
          : subject;
  const tip = blind
    ? `${subject}, ${build.level}`
    : `${subject}, ${build.level} · ${identity(build)} · ${OUTCOMES[state].name}`;
  const body = src
    ? `<img loading="lazy" decoding="async" src="${src}" alt="">`
    : `<span class="nothumb"><span>${state === "nocode" ? "∅" : state === "unchecked" ? "…" : "✕"}</span>${esc(
        OUTCOMES[state].name,
      )}${build.crash && !blind ? `<small>${esc(build.crash.slice(0, 90))}</small>` : ""}</span>`;
  return (
    `<div class="card o-${state}" data-slug="${build.slug}" data-tip="${esc(tip)}" tabindex="0">${body}` +
    (blind
      ? ""
      : `<span class="badges">${modelDot(build.model)}${armChip(build.arm)}<em>${build.level === "rich" ? "R" : "T"}</em></span>`) +
    (state === "clean"
      ? ""
      : `<span class="flag" style="--c:${OUTCOMES[state].color}">${esc(OUTCOMES[state].short)}</span>`) +
    `<button class="star${stars.has(build.slug) ? " on" : ""}" data-star="${build.slug}" title="Star (S)">★</button>` +
    (caption ? `<span class="caption">${esc(caption)}</span>` : "") +
    `</div>`
  );
}
