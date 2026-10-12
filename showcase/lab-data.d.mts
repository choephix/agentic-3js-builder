// Types for lab-data.mjs, for scripts that import it (scripts/lab-export.ts).
import type { LabData } from "./lab-model";

type Renders = {
  tags: Array<{ tag: string; arm: string; sheet: string; shots: Array<{ name: string; url: string }> }>;
  downloads: Array<{ name: string; arm: string; url: string }>;
};
export declare const labThumbRoot: string;
export declare function v01Renders(slug: string, root: string, url: (path: string) => string): Promise<Renders>;
export declare function labData(
  renders: (slug: string) => Promise<Renders> | Renders,
  bakeoffUrl?: string,
): Promise<LabData>;
