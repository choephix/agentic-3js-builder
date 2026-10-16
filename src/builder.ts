// Entry point: `createBuilder()` composes every helper around one shared context. Return `b.root` from a
// creature module; it satisfies the creature-lab contract (joint/bone/group tags, one root joint, no joint scale),
// carries the rig answer key in `userData.rig`, and has every painted part baked into the paint sheet.
import type { BufferGeometry, Texture } from "three";
import { cards } from "./cards";
import type { CardOptions } from "./cards";
import { Ctx } from "./context";
import type { Fill, JointRef } from "./context";
import { decal } from "./decal";
import type { DecalOptions } from "./decal";
import { along, ring } from "./distribute";
import type { RingItem, RingOptions } from "./distribute";
import { membrane, slab } from "./membrane";
import type { MembraneEdge, MembraneOptions, SlabOptions } from "./membrane";
import type { FrameInput, PointInput } from "./math";
import { extrude, lathe } from "./outline";
import type { ExtrudeOptions, LatheOptions, OutlineInput } from "./outline";
import { part, partArgs } from "./parts";
import type { Part, PartOptions, PartSpec } from "./parts";
import type { PathInput } from "./path";
import { Region } from "./region";
import type { RegionOptions } from "./region";
import { rigBlock } from "./rig";
import { createChain, createJoint, Joint, pose } from "./skeleton";
import type { Chain, ChainOptions, JointOptions, PoseRotation } from "./skeleton";
import { capsule, frustumBox, loft, rod, spike, sprout } from "./sugar";
import type { SproutOptions, Station } from "./sugar";
import { stick, Surface } from "./surface";
import type { StickOptions, SurfaceTarget } from "./surface";
import { radiusArgs, sweep } from "./sweep";
import type { Radius, Sweep, SweepOptions, WithRadius } from "./sweep";

export type { OutlinePoint } from "./outline";

/** A straight tube's radius: one number, or `[r0, r1]` for a taper. */
type TubeRadius = number | readonly [number, number];

export class Builder {
  /** The shared context, for layers built on the SDK (src/experimental/sculpt.ts); samples don't use it. */
  readonly ctx: Ctx;

  constructor(name = "creature", detail = 1, paintSize = 1024) {
    this.ctx = new Ctx(name, detail, paintSize, (ctx) => new Joint(ctx.root.name, ctx.root, null, ctx));
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

  /**
   * `n` segments scaled by `detail` (at least 3), for your own geometry: `new SphereGeometry(r, b.segments(12),
   * b.segments(8))`. Pass a second `detail` to scale one part on its own: `b.segments(12, 0.5)`.
   */
  segments(n: number, detail?: number) {
    return this.ctx.segments(n, this.ctx.detailOf("segments()", detail));
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

  /**
   * `b.part(geometry, color, options)`, or the same in one object: `b.part({ geometry, color, ...options })`. A
   * missing colour (undefined) takes the nearest built part's.
   */
  part(spec: PartSpec): Part;
  part(geometry: BufferGeometry, color: Fill, options?: PartOptions): Part;
  part(geometry: BufferGeometry | PartSpec, color?: Fill, options?: PartOptions) {
    return part(this.ctx, ...partArgs(geometry, color, options));
  }

  /**
   * The radius goes second, or inside the options: `b.sweep(path, { radius, color })`. A colour may come right after
   * the radius, before the options: `b.sweep(path, 0.05, SKIN, { bone })`.
   */
  sweep(source: PathInput | Chain, options: WithRadius<SweepOptions>): Sweep;
  sweep(source: PathInput | Chain, radius: Radius, color: Fill, options?: SweepOptions): Sweep;
  sweep(source: PathInput | Chain, radius: Radius, options?: SweepOptions): Sweep;
  sweep(
    source: PathInput | Chain,
    radius: Radius | WithRadius<SweepOptions>,
    options?: SweepOptions | Fill,
    more?: SweepOptions,
  ) {
    return sweep(this.ctx, source, ...radiusArgs("sweep()", radius, options, more));
  }

  rod(a: PointInput, b: PointInput, options: WithRadius<SweepOptions, TubeRadius>): Sweep;
  rod(a: PointInput, b: PointInput, r: TubeRadius, color: Fill, options?: SweepOptions): Sweep;
  rod(a: PointInput, b: PointInput, r: TubeRadius, options?: SweepOptions): Sweep;
  rod(
    a: PointInput,
    b: PointInput,
    r: TubeRadius | WithRadius<SweepOptions, TubeRadius>,
    options?: SweepOptions | Fill,
    more?: SweepOptions,
  ) {
    return rod(this.ctx, a, b, ...radiusArgs("rod()", r, options, more));
  }

  capsule(a: PointInput, b: PointInput, options: WithRadius<SweepOptions, TubeRadius>): Sweep;
  capsule(a: PointInput, b: PointInput, r: TubeRadius, color: Fill, options?: SweepOptions): Sweep;
  capsule(a: PointInput, b: PointInput, r: TubeRadius, options?: SweepOptions): Sweep;
  capsule(
    a: PointInput,
    b: PointInput,
    r: TubeRadius | WithRadius<SweepOptions, TubeRadius>,
    options?: SweepOptions | Fill,
    more?: SweepOptions,
  ) {
    return capsule(this.ctx, a, b, ...radiusArgs("capsule()", r, options, more));
  }

  spike(base: PointInput, dirOrTip: PointInput, len: number | null, options: WithRadius<SweepOptions, number>): Sweep;
  spike(
    base: PointInput,
    dirOrTip: PointInput,
    len: number | null,
    r: number,
    color: Fill,
    options?: SweepOptions,
  ): Sweep;
  spike(base: PointInput, dirOrTip: PointInput, len: number | null, r: number, options?: SweepOptions): Sweep;
  spike(
    base: PointInput,
    dirOrTip: PointInput,
    len: number | null,
    r: number | WithRadius<SweepOptions, number>,
    options?: SweepOptions | Fill,
    more?: SweepOptions,
  ) {
    return spike(this.ctx, base, dirOrTip, len, ...radiusArgs("spike()", r, options, more));
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

  sprout(
    name: string,
    on: FrameInput,
    pathOrTip: PathInput | PointInput,
    options: WithRadius<SproutOptions>,
  ): ReturnType<typeof sprout>;
  sprout(
    name: string,
    on: FrameInput,
    pathOrTip: PathInput | PointInput,
    radius: Radius,
    color: Fill,
    options?: SproutOptions,
  ): ReturnType<typeof sprout>;
  sprout(
    name: string,
    on: FrameInput,
    pathOrTip: PathInput | PointInput,
    radius: Radius,
    options?: SproutOptions,
  ): ReturnType<typeof sprout>;
  sprout(
    name: string,
    on: FrameInput,
    pathOrTip: PathInput | PointInput,
    radius: Radius | WithRadius<SproutOptions>,
    options?: SproutOptions | Fill,
    more?: SproutOptions,
  ) {
    return sprout(this.ctx, name, on, pathOrTip, ...radiusArgs("sprout()", radius, options, more));
  }

  surface(targets: SurfaceTarget) {
    return new Surface(this.ctx, targets);
  }

  /** A missing colour (undefined) takes the nearest built part's. */
  stick(geometry: BufferGeometry, color: Fill, on: FrameInput, options?: StickOptions) {
    return stick(this.ctx, geometry, color, on, options);
  }

  decal(target: Surface | SurfaceTarget, texture: Texture, options: DecalOptions) {
    return decal(this.ctx, target, texture, options);
  }

  cards(on: readonly FrameInput[], texture: Texture | readonly Texture[], options: CardOptions) {
    return cards(this.ctx, on, texture, options);
  }

  membrane(edgeA: MembraneEdge, edgeB: MembraneEdge, options: MembraneOptions = {}) {
    return membrane(this.ctx, edgeA, edgeB, options);
  }

  slab(points: readonly PointInput[], options: SlabOptions = {}) {
    return slab(this.ctx, points, options);
  }

  extrude(points: OutlineInput, options: ExtrudeOptions) {
    return extrude(this.ctx, points, options);
  }

  lathe(points: OutlineInput, options: LatheOptions) {
    return lathe(this.ctx, points, options);
  }

  region(options: RegionOptions) {
    return new Region(this.ctx, options);
  }
}

/**
 * `detail` scales the SDK's default tessellation (sides, ring spacing, membrane cells): 0.5 halves it. `paintSize`
 * is the paint sheet's width in texels (512, 1024 or 2048; default 1024).
 */
export function createBuilder(options: { name?: string; detail?: number; paintSize?: number } = {}) {
  return new Builder(options.name, options.detail, options.paintSize);
}
