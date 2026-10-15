import type { Mesh, Texture } from "three";
import type { Fill, Tags } from "./context";
import type { Frame } from "./frame";
import type { DirectionInput, FrameInput } from "./math";
import { Paint } from "./paint";
export type CardOptions = Tags & {
    
    size: number | readonly [number, number];
    
    lean?: number;
    
    flow?: DirectionInput | ((frame: Frame, i: number) => DirectionInput);
    
    bend?: number;
    
    detail?: number;
    
    cross?: boolean;
    
    vary?: number;
    
    spin?: number;
    
    rng?: () => number;
    
    color?: string | Paint;
    
    ;
    
    sink?: number;
    
    mirror?: boolean;
};

export declare function cards(ctx: Ctx, on: readonly FrameInput[], texture: Texture | readonly Texture[], options: CardOptions): Mesh[];
