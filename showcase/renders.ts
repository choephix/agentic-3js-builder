// Harness renders (`npm run snap`): the per-sample index from the dev server, the reports it points at, the
// Versions panel and the image lightbox.
import { h } from "./dom";
import type { RigBlock } from "../src/rig";

export type Shot = { name: string; url: string };
export type Snapshot = {
  tag: string;
  arm: "A" | "B";
  time: number;
  sheet: string;
  report: string | null;
  source: string | null;
  shots: Shot[];
};
export type Download = { name: string; arm: "A" | "B"; bytes: number; url: string };
export type Snapshots = { tags: Snapshot[]; downloads: Download[] };
export type Issue = { level: "error" | "warning"; message: string };
export type Report = {
  tag: string;
  parts: number;
  triangles: number;
  vertices: number;
  colors: number;
  /** Absent in reports from before textures. */
  textures?: number;
  atlas?: { size: number; tiles: number; alpha: boolean };
  size: [number, number, number];
  bounds: { min: number[]; max: number[] };
  groups: Array<{ name: string; parts: number }>;
  joints: Array<{ name: string; parent: string | null; depth: number; parts: number }>;
  rig: RigBlock | null;
  issues: Issue[];
  assembleMs: number;
};

/** The harness shot order: views first, then the checks. */
const SHOT_ORDER = [
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
const NONE: Snapshots = { tags: [], downloads: [] };

export async function loadSnapshots(slug: string): Promise<Snapshots> {
  try {
    const response = await fetch(`/__snapshots/${encodeURIComponent(slug)}`);
    if (!response.ok) return NONE;
    const snapshots = (await response.json()) as Snapshots;
    for (const tag of snapshots.tags) {
      const rank = (shot: Shot) => (SHOT_ORDER.indexOf(shot.name) + 1 || 99) - 1;
      tag.shots.sort((a, b) => rank(a) - rank(b));
    }
    return snapshots;
  } catch {
    return NONE;
  }
}

const reports = new Map<string, Promise<Report | null>>();
/** Reports by URL, cached per page load; a tag's report never changes once written, except by a re-render. */
export function loadReport(url: string | null, time = 0): Promise<Report | null> {
  if (!url) return Promise.resolve(null);
  const key = `${url}#${time}`;
  let report = reports.get(key);
  if (!report)
    reports.set(
      key,
      (report = fetch(url)
        .then((response) => (response.ok ? (response.json() as Promise<Report>) : null))
        .catch(() => null)),
    );
  return report;
}

const texts = new Map<string, Promise<string | null>>();
export function loadText(url: string | null, time = 0): Promise<string | null> {
  if (!url) return Promise.resolve(null);
  const key = `${url}#${time}`;
  let text = texts.get(key);
  if (!text)
    texts.set(
      key,
      (text = fetch(url)
        .then((response) => (response.ok ? response.text() : null))
        .catch(() => null)),
    );
  return text;
}

export function age(time: number) {
  const seconds = Math.max(0, (Date.now() - time) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`;
  return `${Math.round(seconds / 86400)} d ago`;
}

export const count = (value: number) =>
  value >= 10_000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value).toLocaleString("en");

export const bytes = (value: number) =>
  value >= 1 << 20 ? `${(value / (1 << 20)).toFixed(1)} MB` : `${Math.round(value / 1024)} KB`;

/** "+12" / "−3" against an older value, or nothing when equal. */
export function delta(now: number, before: number | undefined) {
  if (before === undefined || now === before) return null;
  const change = now - before;
  return h(
    "span",
    { class: change > 0 ? "delta up" : "delta down" },
    `${change > 0 ? "+" : "−"}${count(Math.abs(change))}`,
  );
}

export type VersionsActions = {
  select(tag: string): void;
  compare(from: string, to: string): void;
  lightbox(items: Array<{ url: string; caption: string }>, index: number): void;
};

/** The Versions panel: GLB downloads, every tag with its numbers, and the selected tag's sheet, shots and report. */
export function versionsPanel(slug: string, snapshots: Snapshots, selected: string | null, actions: VersionsActions) {
  if (!snapshots.tags.length)
    return h(
      "div",
      { class: "empty-state" },
      h("p", null, "No harness renders yet."),
      h("code", null, `npm run snap -- ${slug} v01`),
      h("p", { class: "muted" }, "Sheets, reports, per-version source and GLBs appear here."),
    );
  const current = snapshots.tags.find((tag) => tag.tag === selected) ?? snapshots.tags[0];
  const body = h("div", { class: "versions" });

  if (snapshots.downloads.length)
    body.append(
      h(
        "section",
        null,
        h("h3", null, "Latest export"),
        h(
          "div",
          { class: "downloads" },
          ...snapshots.downloads.map((file) =>
            h(
              "a",
              { class: "download", href: file.url, download: file.name, "data-tip": `Download ${file.name}` },
              h("span", { class: "glyph" }, "↓"),
              file.name.replace(`${slug}-`, "").replace(".glb", ""),
              h("span", { class: "muted" }, `.glb · ${bytes(file.bytes)}`),
            ),
          ),
        ),
      ),
    );

  const table = h(
    "div",
    { class: "tags" },
    h(
      "div",
      { class: "tag-row head" },
      h("span", null, "tag"),
      h("span", null, "rendered"),
      h("span", { class: "n" }, "parts"),
      h("span", { class: "n" }, "tris"),
      h("span", { class: "n" }, "issues"),
    ),
  );
  body.append(
    h("section", null, h("h3", null, `${snapshots.tags.length} version${snapshots.tags.length > 1 ? "s" : ""}`), table),
  );
  snapshots.tags.forEach((snapshot, index) => {
    const older = snapshots.tags[index + 1];
    const parts = h("span", { class: "n" });
    const tris = h("span", { class: "n" });
    const issues = h("span", { class: "n" });
    table.append(
      h(
        "button",
        { class: `tag-row${snapshot === current ? " on" : ""}`, onclick: () => actions.select(snapshot.tag) },
        h("span", { class: "tag" }, snapshot.tag),
        h("span", { class: "muted" }, age(snapshot.time)),
        parts,
        tris,
        issues,
      ),
    );
    void Promise.all([loadReport(snapshot.report, snapshot.time), loadReport(older?.report ?? null, older?.time)]).then(
      ([report, before]) => {
        if (!report) return;
        parts.append(delta(report.parts, before?.parts) ?? "", ` ${report.parts}`);
        tris.append(delta(report.triangles, before?.triangles) ?? "", ` ${count(report.triangles)}`);
        issues.append(
          report.issues.length
            ? h("span", { class: "badge warn" }, report.issues.length)
            : h("span", { class: "muted" }, "–"),
        );
      },
    );
  });

  const index = snapshots.tags.indexOf(current);
  const older = snapshots.tags[index + 1];
  const images = [
    { url: current.sheet, caption: `${slug} · ${current.tag} · contact sheet` },
    ...current.shots.map((shot) => ({ url: shot.url, caption: `${slug} · ${current.tag} · ${shot.name}` })),
  ];
  const detail = h(
    "section",
    { class: "tag-detail" },
    h(
      "div",
      { class: "tag-head" },
      h("h3", null, current.tag),
      h("span", { class: "muted" }, `${age(current.time)} · arm ${current.arm}`),
      h(
        "span",
        { class: "actions" },
        current.source && older?.source
          ? h("button", { class: "link", onclick: () => actions.compare(older.tag, current.tag) }, `diff ${older.tag}`)
          : null,
        current.source
          ? h("button", { class: "link", onclick: () => actions.compare(current.tag, "live") }, "diff live")
          : null,
        current.report
          ? h("a", { class: "link", href: current.report, target: "_blank", rel: "noreferrer" }, "report.json")
          : null,
      ),
    ),
    h(
      "button",
      { class: "sheet", onclick: () => actions.lightbox(images, 0), "data-tip": "Open the contact sheet" },
      h("img", { src: current.sheet, alt: `${current.tag} contact sheet`, loading: "lazy" }),
    ),
    h(
      "div",
      { class: "shots" },
      ...current.shots.map((shot, k) =>
        h(
          "button",
          { class: "shot", onclick: () => actions.lightbox(images, k + 1), "data-tip": shot.name },
          h("img", { src: shot.url, alt: shot.name, loading: "lazy" }),
        ),
      ),
    ),
  );
  body.append(detail);
  void loadReport(current.report, current.time).then((report) => {
    if (report) detail.append(reportSummary(report));
  });
  return body;
}

function reportSummary(report: Report) {
  const vec = (v: number[]) => `(${v.map((x) => +x.toFixed(3)).join(", ")})`;
  const cells: Array<[string, string]> = [
    ["Parts", count(report.parts)],
    ["Triangles", count(report.triangles)],
    ["Vertices", count(report.vertices)],
    ["Colours", String(report.colors)],
    ...(report.textures
      ? ([["Textures", `${report.textures} · atlas ${report.atlas?.size ?? "?"} px`]] as Array<[string, string]>)
      : []),
    ["Joints", String(report.joints.length)],
    ["Size", `${report.size.map((v) => v.toFixed(2)).join(" × ")} m`],
    ["Bounds", `${vec(report.bounds.min)} – ${vec(report.bounds.max)}`],
    ["Assembled", `${report.assembleMs} ms`],
  ];
  if (report.rig)
    cells.push([
      "Rig",
      `${report.rig.chains.length} chains · ${report.rig.joints.length} hinged · ${report.rig.rings.length} rings`,
    ]);
  return h(
    "div",
    { class: "report" },
    h("h3", null, "Harness report"),
    h("dl", { class: "grid" }, ...cells.flatMap(([label, value]) => [h("dt", null, label), h("dd", null, value)])),
    h(
      "div",
      { class: "group-chips" },
      ...report.groups.map((group) =>
        h("span", { class: "chip" }, `${group.name} `, h("span", { class: "muted" }, group.parts)),
      ),
    ),
    report.issues.length
      ? h("ul", { class: "issues" }, ...report.issues.map((issue) => h("li", { class: issue.level }, issue.message)))
      : h("p", { class: "ok" }, "No issues."),
  );
}

/** A full-window image viewer; ←/→ step, Esc closes. */
export class Lightbox {
  private items: Array<{ url: string; caption: string }> = [];
  private index = 0;
  private readonly image = h("img", { alt: "" });
  private readonly caption = h("span", { class: "caption" });
  private readonly counter = h("span", { class: "muted" });
  readonly element = h(
    "div",
    { class: "lightbox", hidden: true, onclick: (event: Event) => event.target === this.element && this.close() },
    h("button", { class: "nav prev", onclick: () => this.step(-1), "aria-label": "Previous" }, "‹"),
    this.image,
    h("button", { class: "nav next", onclick: () => this.step(1), "aria-label": "Next" }, "›"),
    h(
      "div",
      { class: "bar" },
      this.caption,
      this.counter,
      h("button", { class: "link", onclick: () => this.close() }, "Close  Esc"),
    ),
  );

  get open() {
    return !this.element.hidden;
  }

  show(items: Array<{ url: string; caption: string }>, index: number) {
    this.items = items;
    this.index = index;
    this.element.hidden = false;
    this.render();
  }

  step(by: number) {
    this.index = (this.index + by + this.items.length) % this.items.length;
    this.render();
  }

  close() {
    this.element.hidden = true;
  }

  private render() {
    const item = this.items[this.index];
    this.image.src = item.url;
    this.caption.textContent = item.caption;
    this.counter.textContent = `${this.index + 1} / ${this.items.length}`;
  }
}
