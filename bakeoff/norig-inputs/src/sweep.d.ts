import { Vector3 } from "three";
import type { Mesh } from "three";
import { Capture } from "./context";
import type { Ctx, Fill, Tags, Weights } from "./context";
import { Spot } from "./frame";
import type { DirectionInput } from "./math";
import type { Corner, Frames, Path, PathInput, Twist } from "./path";

export type Skin = "smooth" | "rigid";
export type Cap = "round" | "flat" | "point" | "none";
export type Section = "circle" | "box" | {
    ngon: number;
};

export interface Contour {
    
    readonly sides: number;
    
    readonly smooth: boolean;
    
    reach(t: number): readonly [number, number, number, number];
    
    keys(t: number): readonly number[];
    
    readonly knots: readonly number[];
    
    polygon(t: number, sides: number): Array<[number, number]>;
}

export type Radius = number | readonly number[] | ((t: number) => number | readonly [number, number]) | Contour;
export type SweepOptions = Tags & {
    
    color?: Fill | ((t: number) => Fill);
    
    bands?: ReadonlyArray<readonly [number, Fill]>;
    
    
    ;
    
    from?: number;
    to?: number;
    section?: Section;
    
    sides?: number;
    
    detail?: number;
    
    smooth?: boolean;
    caps?: Cap | {
        start?: Cap;
        end?: Cap;
    };
    
    ;
    
    extend?: number | readonly [number, number];
    
    sectors?: ReadonlyArray<Sector>;
    
    shift?: readonly [number, number] | ((t: number) => readonly [number, number]);
    
    up?: DirectionInput;
    
    twist?: Twist;
};
export type Sector = readonly [number, number, Fill] | readonly [number, number, Fill, number, number];

export declare class SweepPoint extends Spot {
    readonly t: number;
    
    readonly radius: number;
    constructor(t: number, at: Vector3, n: Vector3, tangent: Vector3, 
    
    radius: number, weights: Weights, capture: Capture);
    get n(): Vector3;
    get tangent(): Vector3;
}
type Shape = {
    pts: Array<[number, number]>;
    smooth: boolean;
    contour?: Contour;
};

type Tube = {
    path: Path;
    frames: Frames;
    from: number;
    to: number;
    
    radius: (t: number) => [number, number];
    
    shift: (t: number) => readonly [number, number];
    shape: Shape;
    
    contour: Contour | null;
    corners: Corner[];
    closed: boolean;
    
    seam: Vector3 | null;
    
    fillets: Array<{
        s0: number;
        s1: number;
        p0: Vector3;
        c: Vector3;
        p1: Vector3;
    }>;
    
    capture: Capture;
    
    refAt: ((t: number, raw: number) => number) | null;
};

export declare function interpolate(xs: readonly number[], ys: readonly number[], x: number): number;
export declare function radiusFn(radius: Radius): (t: number) => [number, number];

export type WithRadius<O, R = Radius> = O & {
    radius: R;
};

export declare function radiusArgs<R, O extends object>(call: string, radius: R | WithRadius<O, R>, options?: O | Fill, more?: O): [R, O];
export declare class Sweep {
    private readonly tube;
    
    private readonly weightAt;
    
    private readonly knots;
    readonly meshes: Mesh[];
    constructor(tube: Tube, 
    
    weightAt: (u: number) => Weights, 
    
    knots: number[]);
    
    
    get from(): number;
    get to(): number;
    
    get frame(): Spot;
    
    curve(): Path;
    
    at(t: number, angleDeg?: number, lift?: number): SweepPoint;
    
    private atU;
    
    line(angleDeg: number, lift?: number): Path;
}
export declare function sweep(ctx: Ctx, source: PathInput, radius: Radius, options?: SweepOptions): Sweep;
export {};
