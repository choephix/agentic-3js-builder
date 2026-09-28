// The showcase page: a sample list, one viewer, a stats line, source and skeleton toggles, in-page errors. The
// selected sample lives in the URL hash.
import * as catalog from "./catalog";
import type { Catalog, SampleModule } from "./catalog";
import { stats, Viewer } from "./viewer";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const list = $<HTMLUListElement>("samples");
const title = $("title");
const description = $("description");
const builder = $("builder");
const statsLine = $("stats");
const errorBox = $("error");
const history = $("history");
const historyList = $<HTMLDivElement>("history-list");
const source = $("source");
const sourceToggle = $<HTMLButtonElement>("toggle-source");
const skeletonToggle = $<HTMLButtonElement>("toggle-skeleton");
const viewer = new Viewer($("viewer"));

type Snapshot = { tag: string; arm: "A" | "B"; url: string };

let current: Catalog = { modules: catalog.modules, sources: catalog.sources };
let showSource = false;
let showSkeleton = false;
let joints = 0;
let loading = 0;

const slugOf = (path: string) => path.slice(path.lastIndexOf("/") + 1, -".ts".length);
const pathOf = (slug: string) => Object.keys(current.modules).find((path) => slugOf(path) === slug);
const selected = () =>
  decodeURIComponent(location.hash.slice(1)) || slugOf(Object.keys(current.modules).sort()[0] ?? "");
const message = (reason: unknown) => (reason instanceof Error ? (reason.stack ?? reason.message) : String(reason));

/** Sample names come from `meta.name`, falling back to the slug; a sample that fails to load keeps its slug. */
async function renderList() {
  const paths = Object.keys(current.modules).sort();
  const names = await Promise.all(
    paths.map((path) =>
      current.modules[path]()
        .then((module) => module.meta?.name ?? slugOf(path))
        .catch(() => slugOf(path)),
    ),
  );
  list.replaceChildren(
    ...paths.map((path, i) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${slugOf(path)}`;
      link.textContent = names[i];
      link.classList.toggle("active", slugOf(path) === selected());
      item.append(link);
      return item;
    }),
  );
}

async function loadHistory(slug: string): Promise<Snapshot[]> {
  try {
    const response = await fetch(`/__snapshot-index/${encodeURIComponent(slug)}`);
    return response.ok ? ((await response.json()) as Snapshot[]) : [];
  } catch {
    return [];
  }
}

function renderHistory(items: Snapshot[]) {
  history.hidden = items.length === 0;
  historyList.replaceChildren(
    ...items.map((item) => {
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.title = `${item.tag} · arm ${item.arm}`;

      const image = document.createElement("img");
      image.src = item.url;
      image.alt = `${item.tag} snapshot`;

      const label = document.createElement("span");
      label.textContent = item.tag;
      link.append(image, label);
      return link;
    }),
  );
}

async function run() {
  const token = ++loading;
  const slug = selected();
  const path = pathOf(slug);
  const historyPromise = loadHistory(slug);
  for (const link of list.querySelectorAll("a")) link.classList.toggle("active", link.hash === `#${slug}`);
  errorBox.hidden = true;
  title.textContent = slug;
  description.textContent = "";
  builder.textContent = "";
  renderHistory([]);
  try {
    if (!path) throw new Error(`No sample "${slug}" in samples/`);
    const [module, text] = await Promise.all([current.modules[path](), current.sources[path]()]);
    if (token !== loading) return;
    source.textContent = text;
    title.textContent = module.meta?.name ?? slug;
    description.textContent = module.meta?.description ?? "";
    builder.textContent = module.meta?.builtBy ? `Built by ${module.meta.builtBy}` : "";
    const built = (module as SampleModule).default();
    if (!built?.isObject3D) throw new Error(`samples/${slug}.ts: the default export must return a THREE.Object3D`);
    viewer.show(built);
    const s = stats(built);
    joints = s.joints;
    statsLine.textContent = [
      `${s.meshes} meshes`,
      `${Math.round(s.triangles).toLocaleString("en")} triangles`,
      `${s.joints} joints`,
      `${s.colors} colours`,
      `${s.size
        .toArray()
        .map((v) => v.toFixed(2))
        .join(" × ")} m`,
    ].join(" · ");
    const snapshots = await historyPromise;
    if (token !== loading) return;
    renderHistory(snapshots);
  } catch (reason) {
    if (token !== loading) return;
    viewer.show(null);
    joints = 0;
    statsLine.textContent = "";
    errorBox.textContent = message(reason);
    errorBox.hidden = false;
    renderHistory(await historyPromise);
  }
  skeletonToggle.hidden = joints === 0;
  viewer.setSkeleton(showSkeleton && joints > 0);
}

sourceToggle.onclick = () => {
  showSource = !showSource;
  document.body.classList.toggle("with-source", showSource);
  sourceToggle.classList.toggle("on", showSource);
};
skeletonToggle.onclick = () => {
  showSkeleton = !showSkeleton;
  skeletonToggle.classList.toggle("on", showSkeleton);
  viewer.setSkeleton(showSkeleton);
};
addEventListener("hashchange", run);
addEventListener("catalog", (event) => {
  current = (event as CustomEvent<Catalog>).detail;
  void renderList().then(run);
});
void renderList().then(run);
