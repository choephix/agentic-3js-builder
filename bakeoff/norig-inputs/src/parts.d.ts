import { Euler, Quaternion, Vector3 } from "three";
import type { BufferGeometry, Mesh, Texture } from "three";
import type { Ctx, Fill, Tags, Weights } from "./context";
import { Spot } from "./frame";
import type { Axis, DirectionInput, FrameInput, PointInput, V3 } from "./math";

export declare class Part extends Spot {
    readonly mesh: Mesh;
    constructor(mesh: Mesh, at: Vector3, quat: Quaternion, weights: Weights, facing: V3);
    
    get position(): Vector3;
    
    get rotation(): Euler;
    
    get scale(): Vector3;
}
export type PartOptions = Tags & {
    
    ;
    
    frame?: FrameInput;
    
    at?: PointInput;
    
    quat?: Quaternion;
    aim?: PointInput;
    dir?: DirectionInput;
    up?: DirectionInput;
    
    axis?: Axis;
    
    rotation?: V3;
    scale?: number | V3;
    
    texture?: Texture;
    
    flat?: boolean;
};

export type PartSpec = PartOptions & {
    geometry: BufferGeometry;
    color?: Fill;
};

export declare function partArgs(first: BufferGeometry | PartSpec, color?: Fill, options?: PartOptions): [BufferGeometry, Fill | undefined, PartOptions];
export declare function part(ctx: Ctx, geometry: BufferGeometry, color: Fill | undefined, options?: PartOptions): Part;
