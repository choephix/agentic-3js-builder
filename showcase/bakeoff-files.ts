// The files a prompt bake-off round is made of, `bakeoff/rounds/<id>/`: its manifest, each arm's system prompt, each
// build's module and source, and the model's reply. The runner adds files while a round runs, so an update arrives
// as a `bakeoff-files` window event (like round-files.ts) instead of reloading the page. Run and check records come
// from the dev server instead (`/__bakeoff/<id>`, bakeoff-data.mjs), without the reasoning text.
import type { Object3D } from "three";

export type Arm = {
  id: string;
  letter: string;
  name: string;
  idea: string;
  /** The contract and taste prompt files, under bakeoff/prompts/; taste is null for the control. */
  contract: string;
  context: "source" | "docs" | "brief" | "none";
  taste: string | null;
};
export type Subject = { id: string; kind: string; terse: string; rich: string };
export type Round = {
  id: string;
  started: string;
  model: string;
  effort: string;
  maxTokens: number;
  pricing: { input: number; output: number; cacheRead: number; cacheWrite: number } | null;
  arms: Arm[];
  subjects: Subject[];
};
/** A build module: its default export returns the model's object (and may throw). */
export type BuildModule = { default?: () => Object3D };
export type BakeoffFiles = {
  manifests: typeof manifests;
  builds: typeof builds;
  sources: typeof sources;
  replies: typeof replies;
  prompts: typeof prompts;
};

export const manifests = import.meta.glob<Round>("../bakeoff/rounds/*/round.json", { eager: true, import: "default" });
export const builds = import.meta.glob<BuildModule>("../bakeoff/rounds/*/builds/*.ts");
export const sources = import.meta.glob<string>("../bakeoff/rounds/*/builds/*.ts", {
  query: "?raw",
  import: "default",
});
export const replies = import.meta.glob<string>("../bakeoff/rounds/*/runs/*.md", { query: "?raw", import: "default" });
export const prompts = import.meta.glob<string>("../bakeoff/rounds/*/prompts/*.md", {
  query: "?raw",
  import: "default",
});

if (import.meta.hot)
  import.meta.hot.accept((next) => {
    if (next)
      dispatchEvent(new CustomEvent<BakeoffFiles>("bakeoff-files", { detail: next as unknown as BakeoffFiles }));
  });
