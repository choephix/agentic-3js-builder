// The files an experiment round is made of: its manifest (rounds.ts), its brief, arm guides and builder notes, and
// the toolkits under `src/experimental/`. Builders change them while the round runs, so an update arrives as a
// `round-files` window event (like catalog.ts) instead of reloading the page.
import { manifests } from "./rounds";

export type RoundFiles = { manifests: typeof manifests; markdown: typeof markdown; toolkits: typeof toolkits };

export { manifests };
export const markdown = import.meta.glob<string>("../experiments/**/*.md", { query: "?raw", import: "default" });
export const toolkits = import.meta.glob<string>("../src/experimental/*.ts", { query: "?raw", import: "default" });

if (import.meta.hot)
  import.meta.hot.accept((next) => {
    if (next) dispatchEvent(new CustomEvent<RoundFiles>("round-files", { detail: next as unknown as RoundFiles }));
  });
