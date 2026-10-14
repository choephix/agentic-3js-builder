// Bake lab (experiment): builds a sample again off the main thread and sends back its paint sheets. Paints are the
// sample's own functions, so they can't be posted here; the worker imports the sample and runs it. svg() textures
// stay blank in a worker (no document); only the paint sheets are used.
import { Ctx } from "../src/context";
import { bake, drain, pack } from "./bake-lab-sheet";
import type { Sheet } from "./bake-lab-sheet";

export type Request = { kind: "preload"; slugs: string[] } | { kind: "bake"; slug: string };
export type Baked = { sheets: Array<Sheet & { uvs: Float32Array[] }>; buildMs: number; bakeMs: number };
export type Reply = ({ kind: "ok" } & Partial<Baked>) | { kind: "error"; message: string };

const modules = import.meta.glob<{ default: () => unknown }>("../samples/*.ts");
const load = (slug: string) => modules[`../samples/${slug}.ts`]!();

let built: Ctx[] = [];
Ctx.prototype.bake = function (this: Ctx) {
  if (!built.includes(this)) built.push(this);
};

const reply = (message: Reply, transfer: Transferable[] = []) => self.postMessage(message, { transfer });

self.onmessage = async ({ data: request }: MessageEvent<Request>) => {
  try {
    if (request.kind === "preload") {
      await Promise.all(request.slugs.map(load));
      reply({ kind: "ok" });
      return;
    }
    const module = await load(request.slug);
    built = [];
    const start = performance.now();
    module.default();
    const geometry = performance.now();
    const sheets = built
      .filter((ctx) => ctx.paints.length)
      .map((ctx) => ({
        ...drain(bake(pack(ctx.paints, ctx.paintSize))),
        uvs: ctx.paints.map((entry) => entry.mesh.geometry.getAttribute("uv").array as Float32Array),
      }));
    const end = performance.now();
    reply(
      { kind: "ok", sheets, buildMs: geometry - start, bakeMs: end - geometry },
      sheets.map((sheet) => sheet.data.buffer),
    );
  } catch (error) {
    reply({ kind: "error", message: error instanceof Error ? (error.stack ?? error.message) : String(error) });
  }
};
