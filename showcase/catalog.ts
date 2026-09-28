// Every sample and its source, discovered from `samples/*.ts`. Editing a sample (or anything it imports) updates
// this module in place; the new tables are announced with a `catalog` window event so the page re-runs the sample.
import type { Object3D } from "three";

/** The sample contract: a default-exported function returning an Object3D, plus optional `meta`. */
export type SampleModule = { default: () => Object3D; meta?: { name?: string; description?: string } };
export type Catalog = { modules: typeof modules; sources: typeof sources };

export const modules = import.meta.glob<SampleModule>("../samples/*.ts");
export const sources = import.meta.glob<string>("../samples/*.ts", { query: "?raw", import: "default" });

if (import.meta.hot)
  import.meta.hot.accept((next) => {
    if (next) dispatchEvent(new CustomEvent<Catalog>("catalog", { detail: next as unknown as Catalog }));
  });
