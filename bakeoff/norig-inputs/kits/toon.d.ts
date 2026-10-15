import type { Texture } from "three";
import type { V3 } from "../src/math";
import { Paint } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";

export declare const KEY_LIGHT: V3;

export declare const INK = "#22112f";

export declare function shadowOf(color: string | Rgb): Rgb;
export type CelOptions = {
    
    light?: V3;
    
    threshold?: number;
};

export declare function cel(lit: ColorInput, shadow?: ColorInput, options?: CelOptions): Paint;

export declare function zigzag(x: number): number;
export type FurEdgeOptions = {
    
    axis?: V3;
    
    by?: "normal" | "position";
    
    level?: number;
    
    teeth: number;
    
    period: number;
    
    along?: V3;
    
    ink?: ColorInput;
    
    inkWidth?: number;
};

export declare function furEdge(above: ColorInput, below: ColorInput, options: FurEdgeOptions): Paint;
export type InkLinesOptions = {
    
    levels: readonly number[];
    
    width?: number;
    
    axis?: V3;
    
    ink?: ColorInput;
};

export declare function inkLines(base: ColorInput, options: InkLinesOptions): Paint;
export type AnimeEyeOptions = {
    
    iris: string;
    
    irisLight?: string;
    
    irisDark?: string;
    
    ink?: string;
    
    blush?: string | false;
    
    brow?: boolean;
    
    size?: number;
};

export declare function animeEye(options: AnimeEyeOptions): Texture;
