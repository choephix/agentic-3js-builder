import { Quaternion, Vector3 } from "three";
import type { Mesh } from "three";
import type { Frame } from "./frame";

export type V3 = Vector3 | readonly number[];
export type Axis = "x" | "y" | "z";

export type HasFrame = {
    readonly frame: Frame;
};

export type FrameInput = Frame | HasFrame;

export type PointInput = V3 | Mesh | FrameInput;

export type DirectionInput = V3 | FrameInput;
export declare const DEG: number;

export declare function vec(p: V3, call?: string): Vector3;

export declare function axisVector(a: Axis | V3, call: string): Vector3;

export declare function toFrame(x: FrameInput, call?: string): Frame;

export declare function toPoint(x: PointInput, call?: string): Vector3;

export declare function toDirection(x: DirectionInput, call?: string): Vector3;
export declare function lerp(a: PointInput, b: PointInput, t: number): Vector3;
export declare function mid(a: PointInput, b: PointInput): Vector3;

export declare function offset(p: PointInput, dir: DirectionInput, dist: number): Vector3;

export declare function flatten(v: Vector3, n: Vector3): Vector3;

export declare function aim(dir: DirectionInput, up?: DirectionInput, axis?: Axis): Quaternion;

export declare function rng(seed: number): () => number;
