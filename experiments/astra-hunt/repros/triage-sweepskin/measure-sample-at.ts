import * as THREE from "three";
import { Builder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import type { FrameInput } from "../../../../src/math";
import type { StickOptions } from "../../../../src/surface";
import type { Radius, Sweep, SweepOptions } from "../../../../src/sweep";

interface SweepAtLike {
  readonly t: number;
  readonly at: THREE.Vector3;
  readonly radius: number;
}
const isSweepAt = (value: FrameInput): value is SweepAtLike =>
  typeof value === "object" && value !== null && "t" in value && "at" in value && "radius" in value &&
  typeof value.t === "number" && value.at instanceof THREE.Vector3 && typeof value.radius === "number";

const sample = process.argv[2];
if (!sample) throw new Error("usage: measure-sample-at.ts samples/foo.ts");
const captures = new Map<Builder, SweepAtLike[]>();
const sweeps = new Map<Builder, Sweep[]>();
const originalStick = Builder.prototype.stick;
const originalSweep = Builder.prototype.sweep;
Builder.prototype.stick = function (geometry: THREE.BufferGeometry, color: Fill, on: FrameInput, options?: StickOptions) {
  if (isSweepAt(on)) captures.set(this, [...(captures.get(this) ?? []), on]);
  return originalStick.call(this, geometry, color, on, options);
};
Builder.prototype.sweep = function (source: Parameters<Builder["sweep"]>[0], radius: Radius, options?: SweepOptions) {
  const result = originalSweep.call(this, source, radius, options);
  sweeps.set(this, [...(sweeps.get(this) ?? []), result]);
  return result;
};
// The sample path is selected by the command line, so dynamic import is intentional here.
const imported: unknown = await import(new URL(sample, `file://${process.cwd()}/`).href);
if (typeof imported !== "object" || imported === null || !("default" in imported) || typeof imported.default !== "function")
  throw new Error(`No default build() in ${sample}`);
const root = imported.default();
if (!(root instanceof THREE.Object3D)) throw new Error(`build() did not return Object3D for ${sample}`);
root.updateMatrixWorld(true);
const reports = [...captures].flatMap(([builder, points]) => points.map((on) => {
  let best = { source: Infinity, mesh: Infinity, sweep: -1 };
  for (const [i, sweep] of (sweeps.get(builder) ?? []).entries()) {
    const query = sweep.at(on.t);
    const source = query.at.distanceTo(on.at);
    if (source >= best.source) continue;
    const hit = builder.surface(sweep).nearest(query.at);
    best = { source, mesh: hit.at.distanceTo(query.at), sweep: i };
  }
  return { t: on.t, radius: on.radius, sourceToStick: best.source, atToMesh: best.mesh, sweep: best.sweep };
}));
console.log(JSON.stringify({ sample, captures: reports.length, reports }));
