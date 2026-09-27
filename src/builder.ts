// Entry point: `createBuilder()` composes every helper around one shared context. Return `b.root` from a
// creature module; it satisfies the creature-lab contract (joint/bone/group tags, one root joint, no joint scale).
import type { BufferGeometry } from "three";
import { Ctx } from "./context";
import { membrane, slab } from "./membrane";
import type { MembraneEdge, MembraneOptions, SlabOptions } from "./membrane";
import type { V3 } from "./math";
import { part } from "./parts";
import type { PartOptions } from "./parts";
import type { PathLike } from "./path";
import { Region } from "./region";
import type { RegionOptions } from "./region";
import { createChain, createJoint } from "./skeleton";
import type { Chain, ChainOptions, JointOptions } from "./skeleton";
import { capsule, frustumBox, loft, rod, spike } from "./sugar";
import type { Station } from "./sugar";
import { stick, Surface } from "./surface";
import type { Hit, StickOptions, SurfaceTarget } from "./surface";
import { sweep } from "./sweep";
import type { Radius, SweepOptions } from "./sweep";

export class Builder {
  private readonly ctx: Ctx;

  constructor(name = "creature") {
    this.ctx = new Ctx(name);
  }

  /** The Group to return from the creature module. */
  get root() {
    return this.ctx.root;
  }

  /** The shared matte material for `color`. */
  material(color: string) {
    return this.ctx.material(color);
  }

  joint(name: string, options: JointOptions) {
    return createJoint(this.ctx, name, options);
  }

  chain(name: string, path: PathLike, options: ChainOptions) {
    return createChain(this.ctx, name, path, options);
  }

  part(geometry: BufferGeometry, color: string, options?: PartOptions) {
    return part(this.ctx, geometry, color, options);
  }

  sweep(source: PathLike | Chain, radius: Radius, options?: SweepOptions) {
    return sweep(this.ctx, source, radius, options);
  }

  rod(a: V3, b: V3, r: number | readonly [number, number], options?: SweepOptions) {
    return rod(this.ctx, a, b, r, options);
  }

  capsule(a: V3, b: V3, r: number | readonly [number, number], options?: SweepOptions) {
    return capsule(this.ctx, a, b, r, options);
  }

  spike(base: V3, dirOrTip: V3, len: number | null, r: number, options?: SweepOptions) {
    return spike(this.ctx, base, dirOrTip, len, r, options);
  }

  frustumBox(a: V3, b: V3, start: readonly [number, number], end: readonly [number, number], options?: SweepOptions) {
    return frustumBox(this.ctx, a, b, start, end, options);
  }

  loft(stations: readonly Station[], options?: SweepOptions & { chain?: Chain }) {
    return loft(this.ctx, stations, options);
  }

  surface(targets: SurfaceTarget) {
    return new Surface(this.ctx, targets);
  }

  stick(geometry: BufferGeometry, color: string, hit: Hit, options?: StickOptions) {
    return stick(this.ctx, geometry, color, hit, options);
  }

  membrane(edgeA: MembraneEdge, edgeB: MembraneEdge, options: MembraneOptions) {
    return membrane(this.ctx, edgeA, edgeB, options);
  }

  slab(points: readonly V3[], options: SlabOptions) {
    return slab(this.ctx, points, options);
  }

  region(options: RegionOptions) {
    return new Region(this.ctx, options);
  }
}

export function createBuilder(options: { name?: string } = {}) {
  return new Builder(options.name);
}
