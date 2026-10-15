// The virtual module from `versionModules` in `vite.config.mjs`.
declare module "virtual:version-modules" {
  import type { SampleModule } from "./catalog";
  /** A sample as saved at one harness render (`<tag>-creature.ts`), built against today's SDK. */
  export function versionModule(slug: string, arm: "A" | "B", tag: string): Promise<SampleModule>;
}
