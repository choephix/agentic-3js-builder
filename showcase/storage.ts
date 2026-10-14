// The storage study loads byte measurements only: no sample execution or WebGL is needed to read it.
import { h } from "./dom";
import type { StorageRow, StorageStudy } from "./storage-model";

type Sort = "slug" | "sourceBytes" | "glbBytes" | "saved" | "ratio" | "reduction";
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const number = new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const integer = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const name = (slug: string) => {
  const words = slug.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return words[0].toUpperCase() + words.slice(1);
};
const saved = (row: StorageRow) => row.glbBytes - row.sourceBytes;
const ratio = (row: StorageRow) => (row.sourceBytes ? row.glbBytes / row.sourceBytes : null);
const reduction = (row: StorageRow) => (row.glbBytes ? (saved(row) / row.glbBytes) * 100 : null);
const raw = (bytes: number) => `${integer.format(bytes)} bytes`;
const cell = (bytes: number, unit: number) => h("td", { title: raw(bytes) }, number.format(bytes / unit));
let study: StorageStudy;
let sort: Sort = "saved";
let ascending = false;

function value(row: StorageRow, key: Exclude<Sort, "slug">) {
  if (key === "saved") return saved(row);
  if (key === "ratio") return ratio(row) ?? 0;
  if (key === "reduction") return reduction(row) ?? 0;
  return row[key];
}

function renderRows() {
  const query = $<HTMLInputElement>("search").value.trim().toLowerCase();
  const rows = study.rows
    .filter((row) => `${row.slug} ${name(row.slug)}`.toLowerCase().includes(query))
    .sort((a, b) => {
      const difference = sort === "slug" ? a.slug.localeCompare(b.slug) : value(a, sort) - value(b, sort);
      return (ascending ? difference : -difference) || a.slug.localeCompare(b.slug);
    });
  $("model-rows").replaceChildren(
    ...rows.map((row) =>
      h(
        "tr",
        null,
        h(
          "th",
          { scope: "row" },
          h("a", { href: `/#${row.slug}?panel=versions` }, name(row.slug)),
          h(
            "a",
            {
              class: "source-link",
              href: `/__sample-source/${row.slug}`,
              title: `Measured source: ${raw(row.sourceBytes)}`,
            },
            "source",
          ),
        ),
        cell(row.sourceBytes, 1000),
        cell(row.glbBytes, 1_000_000),
        h("td", { class: "saving", title: raw(saved(row)) }, number.format(saved(row) / 1_000_000)),
        h("td", null, ratio(row) === null ? "—" : `${compact.format(ratio(row)!)}×`),
        h("td", null, reduction(row) === null ? "—" : `${percent.format(reduction(row)!)}%`),
      ),
    ),
  );
  if (!rows.length)
    $("model-rows").append(h("tr", null, h("td", { colspan: 6, class: "empty" }, "No models match this search.")));
  $("row-count").textContent = `${rows.length} of ${study.rows.length} measured models`;
  for (const header of document.querySelectorAll<HTMLElement>("[data-sort]")) {
    const selected = header.dataset.sort === sort;
    header.setAttribute("aria-sort", selected ? (ascending ? "ascending" : "descending") : "none");
    header.querySelector("span")!.textContent = selected ? (ascending ? "↑" : "↓") : "↕";
  }
}

function download() {
  const columns = [
    "model",
    "source_bytes",
    "glb_bytes",
    "saved_bytes",
    "glb_divided_by_code",
    "reduction_percent",
    "export_arm",
    "export_filename",
    "source_modified_at",
    "export_modified_at",
    "measured_at",
  ];
  const values: Array<Array<string | number>> = study.rows.map((row) => [
    row.slug,
    row.sourceBytes,
    row.glbBytes,
    saved(row),
    ratio(row) ?? "",
    reduction(row) ?? "",
    row.glbArm,
    row.glbName,
    row.sourceModifiedAt,
    row.glbModifiedAt,
    study.measuredAt,
  ]);
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [columns, ...values].map((row) => row.map(quote).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = h("a", { href: url, download: `code-vs-glb-${study.measuredAt.slice(0, 10)}.csv` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function start() {
  try {
    const response = await fetch("/__storage-study");
    if (!response.ok) throw new Error(`Measurements returned HTTP ${response.status}.`);
    study = (await response.json()) as StorageStudy;
    $("measurement").textContent =
      `File snapshot · ${new Date(study.measuredAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" })} UTC`;
    if (!study.rows.length) {
      $("summary-caption").textContent = "No models have a matching final GLB export yet.";
    } else {
      const code = study.rows.reduce((total, row) => total + row.sourceBytes, 0);
      const glb = study.rows.reduce((total, row) => total + row.glbBytes, 0);
      $("summary-caption").textContent =
        `The complete matched library · ${study.rows.length} of ${study.sampleCount} source files`;
      $("summary-body").append(
        h(
          "tr",
          null,
          cell(code, 1_000_000),
          cell(glb, 1_000_000),
          h("td", { class: "saving", title: raw(glb - code) }, number.format((glb - code) / 1_000_000)),
          h("td", { class: "saving" }, glb ? `${percent.format(((glb - code) / glb) * 100)}%` : "—"),
        ),
      );
    }
    $("summary-wrap").hidden = false;
    if (study.unmatched.length) {
      $("unmatched").textContent =
        `Excluded from totals: ${study.unmatched.length} source files without a final export (${study.unmatched.join(", ")}).`;
      $("unmatched").hidden = false;
    }
    $<HTMLInputElement>("search").disabled = false;
    $<HTMLButtonElement>("download").disabled = false;
    $("search").addEventListener("input", renderRows);
    $("download").addEventListener("click", download);
    for (const header of document.querySelectorAll<HTMLElement>("[data-sort]")) {
      header.querySelector("button")!.addEventListener("click", () => {
        const next = header.dataset.sort as Sort;
        ascending = sort === next ? !ascending : next === "slug";
        sort = next;
        renderRows();
      });
    }
    renderRows();
  } catch (error) {
    $("measurement").textContent = "File measurements unavailable.";
    $("study-error").textContent =
      `The study could not load its measured data. ${error instanceof Error ? error.message : String(error)}`;
    $("study-error").hidden = false;
  }
}
void start();
