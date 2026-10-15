import type { Ctx } from "./context";
import type { FrameInput, PointInput } from "./math";
import type { PathInput } from "./path";
import type { Radius, SweepOptions } from "./sweep";

export declare function rod(ctx: Ctx, a: PointInput, b: PointInput, r: number | readonly [number, number], options?: SweepOptions): import("./sweep").Sweep;

export declare function capsule(ctx: Ctx, a: PointInput, b: PointInput, r: number | readonly [number, number], options?: SweepOptions): import("./sweep").Sweep;

export declare function spike(ctx: Ctx, base: PointInput, dirOrTip: PointInput, len: number | null, r: number, options?: SweepOptions): import("./sweep").Sweep;

export declare function frustumBox(ctx: Ctx, a: PointInput, b: PointInput, [w0, h0]: readonly [number, number], [w1, h1]: readonly [number, number], options?: SweepOptions): import("./sweep").Sweep;
export type Station = {
    at: PointInput;
    w: number;
    h: number;
};

export declare function loft(ctx: Ctx, stations: readonly Station[], options?: SweepOptions): import("./sweep").Sweep;
    
    count?: number;
    
    bury?: number;
};

    sweep: import("./sweep").Sweep;
};
