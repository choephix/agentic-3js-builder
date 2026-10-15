import { Vector3 } from "three";
import type { Axis, PointInput, V3 } from "./math";

export type Rgb = readonly [number, number, number];

export type ColorInput = string | Rgb | Paint;

export type Colors = ColorInput | readonly ColorInput[];

export type SurfaceCoords = readonly [number, number];
export type PaintFn = (p: Vector3, n: Vector3, s: SurfaceCoords) => ColorInput;

export declare class Paint {
    private readonly fn;
    readonly id: number;
    constructor(fn: PaintFn);
    at(p: Vector3, n: Vector3, s?: SurfaceCoords): Rgb;
    
    toString(): string;
}

export declare function paint(fn: PaintFn): Paint;

export declare function rgb(color: string | Rgb): Rgb;

export declare function resolve(c: ColorInput, p: Vector3, n: Vector3): Rgb;

export declare function mix(a: string | Rgb, b: string | Rgb, t: number): Rgb;

export declare function smoothstep(e0: number, e1: number, x: number): number;

export declare function noise(p: Vector3, size: number, seed?: number): number;

export type Cell = {
    
    d1: number;
    
    d2: number;
    
    id: number;
    
    center: Vector3;
};

export declare function cells(p: Vector3, size: number, seed?: number): Cell;

export declare function mottle(a: ColorInput, b: ColorInput, options: {
    size: number;
    seed?: number;
    contrast?: number;
}): Paint;

export declare function spots(base: ColorInput, spot: Colors, options: {
    size: number;
    amount?: number;
    rosette?: boolean;
    seed?: number;
}): Paint;

export declare function stripes(base: ColorInput, stripe: Colors, options: {
    size: number;
    axis?: Axis | V3;
    width?: number;
    wobble?: number;
    seed?: number;
}): Paint;

export declare function patches(base: ColorInput, patch: Colors, options: {
    size: number;
    gap?: number;
    seed?: number;
}): Paint;

export declare function scales(base: Colors, edge: ColorInput, options: {
    size: number;
    width?: number;
    seed?: number;
}): Paint;

export declare function countershade(back: ColorInput, belly: ColorInput, options?: {
    level?: number;
    soft?: number;
}): Paint;

export declare function gradient(a: ColorInput, b: ColorInput, from: PointInput, to: PointInput): Paint;

export declare function grain(a: ColorInput, b: ColorInput, options: {
    size: number;
    axis?: Axis | V3;
    seed?: number;
}): Paint;
