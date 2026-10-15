import type { BufferGeometry, Texture } from "three";
import type { CardOptions } from "./cards";
import { Ctx } from "./context";
import type { Fill } from "./context";
import type { DecalOptions } from "./decal";
import { along } from "./distribute";
import type { RingItem, RingOptions } from "./distribute";
import type { MembraneEdge, MembraneOptions, SlabOptions } from "./membrane";
import type { FrameInput, PointInput } from "./math";
import type { ExtrudeOptions, LatheOptions, OutlineInput } from "./outline";
import type { Part, PartOptions, PartSpec } from "./parts";
import type { PathInput } from "./path";
import { Region } from "./region";
import type { RegionOptions } from "./region";
import { Surface } from "./surface";
import type { StickOptions, SurfaceTarget } from "./surface";
import type { Radius, Sweep, SweepOptions, WithRadius } from "./sweep";
export type { OutlinePoint } from "./outline";

type TubeRadius = number | readonly [number, number];
export declare class Builder {
    
    readonly ctx: Ctx;
    constructor(name?: string, detail?: number, paintSize?: number);
    
    get root(): import("three").Group<import("three").Object3DEventMap>;
    
    get detail(): number;
    
    segments(n: number, detail?: number): number;
    
    material(color: string): import("three").MeshStandardMaterial;
    ring(line: FrameInput, options: RingOptions, fn?: (item: RingItem) => void): {
        items: RingItem[];
    };
    
    readonly along: typeof along;
    
    part(spec: PartSpec): Part;
    part(geometry: BufferGeometry, color: Fill, options?: PartOptions): Part;
    
    sweep(source: PathInput, options: WithRadius<SweepOptions>): Sweep;
    sweep(source: PathInput, radius: Radius, color: Fill, options?: SweepOptions): Sweep;
    sweep(source: PathInput, radius: Radius, options?: SweepOptions): Sweep;
    rod(a: PointInput, b: PointInput, options: WithRadius<SweepOptions, TubeRadius>): Sweep;
    rod(a: PointInput, b: PointInput, r: TubeRadius, color: Fill, options?: SweepOptions): Sweep;
    rod(a: PointInput, b: PointInput, r: TubeRadius, options?: SweepOptions): Sweep;
    capsule(a: PointInput, b: PointInput, options: WithRadius<SweepOptions, TubeRadius>): Sweep;
    capsule(a: PointInput, b: PointInput, r: TubeRadius, color: Fill, options?: SweepOptions): Sweep;
    capsule(a: PointInput, b: PointInput, r: TubeRadius, options?: SweepOptions): Sweep;
    spike(base: PointInput, dirOrTip: PointInput, len: number | null, options: WithRadius<SweepOptions, number>): Sweep;
    spike(base: PointInput, dirOrTip: PointInput, len: number | null, r: number, color: Fill, options?: SweepOptions): Sweep;
    spike(base: PointInput, dirOrTip: PointInput, len: number | null, r: number, options?: SweepOptions): Sweep;
    frustumBox(a: PointInput, b: PointInput, start: readonly [number, number], end: readonly [number, number], options?: SweepOptions): Sweep;
    loft(stations: readonly Station[], options?: SweepOptions): Sweep;
    surface(targets: SurfaceTarget): Surface;
    
    stick(geometry: BufferGeometry, color: Fill, on: FrameInput, options?: StickOptions): Part;
    decal(target: Surface | SurfaceTarget, texture: Texture, options: DecalOptions): Part;
    cards(on: readonly FrameInput[], texture: Texture | readonly Texture[], options: CardOptions): import("three").Mesh<BufferGeometry<import("three").NormalBufferAttributes, import("three").BufferGeometryEventMap>, import("three").Material<import("three").MaterialEventMap>[] | import("three").Material<import("three").MaterialEventMap>, import("three").Object3DEventMap>[];
    membrane(edgeA: MembraneEdge, edgeB: MembraneEdge, options?: MembraneOptions): import("three").Mesh<BufferGeometry<import("three").NormalBufferAttributes, import("three").BufferGeometryEventMap>, import("three").MeshStandardMaterial, import("three").Object3DEventMap>[];
    slab(points: readonly PointInput[], options?: SlabOptions): Part;
    extrude(points: OutlineInput, options: ExtrudeOptions): Part;
    lathe(points: OutlineInput, options: LatheOptions): Part;
    region(options: RegionOptions): Region;
}

export declare function createBuilder(options?: {
    name?: string;
    detail?: number;
    paintSize?: number;
}): Builder;
