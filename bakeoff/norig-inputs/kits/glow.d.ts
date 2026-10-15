import type { Mesh } from "three";

export type Glowing = Mesh | readonly Mesh[] | {
    readonly mesh: Mesh;
} | {
    readonly meshes: readonly Mesh[];
};

export declare function glow<T extends Glowing>(target: T, strength?: number): T;
