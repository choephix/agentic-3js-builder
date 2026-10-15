import { BoxGeometry, Vector3 } from "three";
import type { Texture } from "three";
import type { V3 } from "../src/math";
import type { ColorInput, Paint, Rgb, SurfaceCoords } from "../src/paint";

export type Rect = readonly [number, number, number, number];

export declare class PixelGrid {
    readonly w: number;
    readonly h: number;
    private readonly cells;
    constructor(w: number, h: number);
    
    get(x: number, y: number): string;
    
    set(x: number, y: number, color: string): void;
    
    fill(fn: (x: number, y: number, w: number, h: number) => string | undefined, rect?: Rect): void;
    
    stamp(x: number, y: number, rows: readonly string[], palette: Readonly<Record<string, string>>): void;
}

export declare function pixelTexture(w: number, h: number, draw: (g: PixelGrid) => void): Texture;

export declare function pixelArt(rows: readonly string[], palette: Readonly<Record<string, string>>): Texture;

export type BoxFace = "px" | "nx" | "py" | "ny" | "pz" | "nz";

export declare function tileBox(size: V3, tile: Texture, texel: number, options?: {
    rand?: () => number;
    step?: number | readonly [number, number];
}): BoxGeometry;

export type SkinFaces = Readonly<Record<BoxFace, Rect>>;

export declare function skinFaces(x: number, y: number, [w, h, d]: readonly [number, number, number]): SkinFaces;

export declare function skinLayout<K extends string>(boxes: Readonly<Record<K, readonly [number, number, number]>>, width?: number): {
    size: [number, number];
    faces: Record<K, SkinFaces>;
};

export declare function skinBox(sheet: Texture, faces: SkinFaces, scale: number | V3): BoxGeometry;

export declare function bayer(x: number, y: number): number;

export declare function pick<C>(ramp: readonly C[], value: number, threshold?: number): C;

export declare function snapColor(color: string | Rgb, palette: readonly (string | Rgb)[] | number): string;

export declare class Cell {
    
    readonly at: Vector3;
    
    readonly u: number;
    readonly v: number;
    
    readonly depth: number;
    
    readonly axis: 0 | 1 | 2;
    
    readonly n: Vector3;
    readonly s: SurfaceCoords;
    
    readonly threshold: number;
    constructor(
    
    at: Vector3, 
    
    u: number, v: number, 
    
    depth: number, 
    
    axis: 0 | 1 | 2, 
    
    n: Vector3, s: SurfaceCoords, 
    
    threshold: number);
    
    pick<C>(ramp: readonly C[], value: number): C;
    
    random(seed?: number): number;
}

export declare function cellPaint(size: number, fn: (c: Cell) => ColorInput, options?: {
    dither?: boolean;
}): Paint;

export declare function stepped(spans: readonly (readonly [number, number])[], cell: number | readonly [number, number], options?: {
    rows?: boolean;
    start?: number;
}): [number, number, "sharp"][];
