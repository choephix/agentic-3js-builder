// Entry point: `createBuilder()` composes every helper around one shared context. Return `b.root` from a
// creature module; it satisfies the creature-lab contract (joint/bone/group tags, one root joint, no joint scale),
// carries the rig answer key in `userData.rig`, and has every painted part baked into the paint sheet.
import type { BufferGeometry, Texture } from "three";
import { cards } from "./cards";
import type { CardOptions } from "./cards";
import { Ctx } from "./context";
import type { Fill, JointRef } from "./context";
import { along, ring } from "./distribute";
import type { RingItem, RingOptions } from "./distribute";
import { membrane, slab } from "./membrane";
import type { MembraneEdge, MembraneOptions, SlabOptions } from "./membrane";
import type { FrameInput, PointInput } from "./math";
import { extrude, lathe } from "./outline";
import type { ExtrudeOptions, LatheOptions, OutlinePoint } from "./outline";
import { part } from "./parts";
import type { PartOptions } from "./parts";
import type { PathInput } from "./path";
import { Region } from "./region";
import type { RegionOptions } from "./region";
import { rigBlock } from "./rig";
import { createChain, createJoint, pose } from "./skeleton";
import type { Chain, ChainOptions, JointOptions, PoseRotation } from "./skeleton";
import { capsule, frustumBox, loft, rod, spike, sprout } from "./sugar";
import type { SproutOptions, Station } from "./sugar";
import { stick, Surface } from "./surface";
import type { StickOptions, SurfaceTarget } from "./surface";
import { sweep } from "./sweep";
import type { Radius, SweepOptions } from "./sweep";

export class Builder {
  private readonly ctx: Ctx;

  constructor(name = "creature", detail = 1) {
    this.ctx = new Ctx(name, detail);
  }

  /**
   * The Group to return from the creature module. Reading it (re)writes the rig answer key for the current pose and
   * bakes the paints of parts painted since the last read.
   */
  get root() {
    this.ctx.root.userData.rig = rigBlock(this.ctx.rig);
    this.ctx.bake();
    return this.ctx.root;
  }

  /** The tessellation multiplier given to `createBuilder`. */
  get detail() {
    return this.ctx.detail;
  }

  /** `n` segments scaled by `detail` (at least 3), for your own geometry: `new SphereGeometry(r, b.segments(12), b.segments(8))`. */
  segments(n: number) {
    return this.ctx.segments(n);
  }

  /** The shared matte material for `color`. */
  material(color: string) {
    return this.ctx.material(color);
  }

  joint(name: string, options: JointOptions) {
    return createJoint(this.ctx, name, options);
  }

  chain(name: string, path: PathInput, options: ChainOptions = {}) {
    return createChain(this.ctx, name, path, options);
  }

  ring(line: FrameInput, options: RingOptions, fn?: (item: RingItem) => void) {
    return ring(this.ctx, line, options, fn);
  }

  /** Frames along a chain (`chain.at`), a sweep (`sweep.at`, dorsal) or any path input. */
  readonly along = along;

  pose(joint: JointRef, rotation: PoseRotation) {
    return pose(this.ctx, joint, rotation);
  }

  part(geometry: BufferGeometry, color: Fill, options?: PartOptions) {
    return part(this.ctx, geometry, color, options);
  }

  sweep(source: PathInput | Chain, radius: Radius, options?: SweepOptions) {
    return sweep(this.ctx, source, radius, options);
  }

  rod(a: PointInput, b: PointInput, r: number | readonly [number, number], options?: SweepOptions) {
    return rod(this.ctx, a, b, r, options);
  }

  capsule(a: PointInput, b: PointInput, r: number | readonly [number, number], options?: SweepOptions) {
    return capsule(this.ctx, a, b, r, options);
  }

  spike(base: PointInput, dirOrTip: PointInput, len: number | null, r: number, options?: SweepOptions) {
    return spike(this.ctx, base, dirOrTip, len, r, options);
  }

  frustumBox(
    a: PointInput,
    b: PointInput,
    start: readonly [number, number],
    end: readonly [number, number],
    options?: SweepOptions,
  ) {
    return frustumBox(this.ctx, a, b, start, end, options);
  }

  loft(stations: readonly Station[], options?: SweepOptions) {
    return loft(this.ctx, stations, options);
  }

  sprout(name: string, on: FrameInput, pathOrTip: PathInput | PointInput, radius: Radius, options?: SproutOptions) {
    return sprout(this.ctx, name, on, pathOrTip, radius, options);
  }

  surface(targets: SurfaceTarget) {
    return new Surface(this.ctx, targets);
  }

  stick(geometry: BufferGeometry, color: Fill, on: FrameInput, options?: StickOptions) {
    return stick(this.ctx, geometry, color, on, options);
  }

  cards(on: readonly FrameInput[], texture: Texture | readonly Texture[], options: CardOptions) {
    return cards(this.ctx, on, texture, options);
  }

  membrane(edgeA: MembraneEdge, edgeB: MembraneEdge, options: MembraneOptions) {
    return membrane(this.ctx, edgeA, edgeB, options);
  }

  slab(points: readonly PointInput[], options: SlabOptions) {
    return slab(this.ctx, points, options);
  }

  extrude(points: readonly OutlinePoint[], options: ExtrudeOptions) {
    return extrude(this.ctx, points, options);
  }

  lathe(points: readonly OutlinePoint[], options: LatheOptions) {
    return lathe(this.ctx, points, options);
  }

  region(options: RegionOptions) {
    return new Region(this.ctx, options);
  }
}

/** `detail` scales the SDK's default tessellation (sides, ring spacing, membrane cells): 0.5 halves it. */
export function createBuilder(options: { name?: string; detail?: number } = {}) {
  return new Builder(options.name, options.detail);
}
