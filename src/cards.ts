// `cards()`: textured quads rooted on frames, for fur, feathers, grass, leaves, scales, bristles and anything else
// that is many small flat cut-outs. Each card is double-sided, may curl and cross, and takes its frame's bones, so
// a coat of cards bends with the skin under it. All cards of one texture are one mesh.
import { Vector3 } from "three";
import type { Mesh, Texture } from "three";
import { meshFromWorld, weightsFor } from "./context";
import type { Ctx, JointRef, Tags, Weights } from "./context";
import type { Frame } from "./frame";
import { DEG, flatten, rng, toDirection, toFrame } from "./math";
import type { DirectionInput, FrameInput } from "./math";
import { Paint } from "./paint";

export type CardOptions = Tags & {
  /** Card width and length in meters (`[w, h]`), or one number for both. */
  size: number | readonly [number, number];
  /**
   * Degrees the card leans from the frame's facing axis (a hit's normal) toward `flow`: 0 stands straight out
   * (grass, bristles, a crest), 90 lies along the surface (scales, shingles). Default 0.
   */
  lean?: number;
  /**
   * The direction cards lean and curl toward, flattened onto the surface; default [0, -0.3, -1] (back and down). A
   * function gives each card its own: `(frame, i) => direction`.
   */
  flow?: DirectionInput | ((frame: Frame, i: number) => DirectionInput);
  /**
   * Extra degrees each card curls toward `flow` from root to tip, one segment per 20° / `detail` (2 at least, 8 at
   * most). Default 0 (flat, one segment).
   */
  bend?: number;
  /** These cards' own tessellation multiplier for their curl segments (default: the builder's `detail`). */
  detail?: number;
  /** Add a second card at right angles through each one: tufts, grass clumps, leaves seen from any side. */
  cross?: boolean;
  /** Random size change, ± this share (0.3 = 70% to 130%). Default 0. */
  vary?: number;
  /** Random turn about the facing axis, ± degrees. Default 0. */
  spin?: number;
  /** Random source for `vary`, `spin` and picking among several textures (e.g. `rng(7)`); default `rng(1)`. */
  rng?: () => number;
  /**
   * Tint multiplied into the texture: a colour string for all cards, or a Paint read at each card's root, so a coat
   * of cards carries the body's pattern. Default "#ffffff" (the texture as drawn).
   */
  color?: string | Paint;
  /** Rigid on this bone. Default: each frame's bones (cards on a bend bend with it), else the nearest joint. */
  bone?: JointRef;
  /** How far each card's root sinks back into the surface, as a share of its length. Default 0.1. */
  sink?: number;
  /** Flip every drawing left to right: the other side of a body, with the same texture. */
  mirror?: boolean;
};

/** Curl drawn per segment at detail 1. */
const SEGMENT_DEG = 20;

/**
 * One card per frame, built from `texture` (or one picked at random per card from a list; list a texture twice to
 * pick it twice as often); returns the meshes, one per distinct texture.
 */
export function cards(
  ctx: Ctx,
  on: readonly FrameInput[],
  texture: Texture | readonly Texture[],
  options: CardOptions,
): Mesh[] {
  const textures = Array.isArray(texture) ? (texture as readonly Texture[]) : [texture as Texture];
  if (!textures.length) throw new Error("cards(): no texture");
  const distinct = [...new Set(textures)];
  const [w0, h0] = typeof options.size === "number" ? [options.size, options.size] : options.size;
  const random = options.rng ?? rng(1);
  const lean = (options.lean ?? 0) * DEG;
  const bend = (options.bend ?? 0) * DEG;
  const detail = ctx.detailOf("cards()", options.detail);
  const segments = bend ? Math.min(8, Math.max(2, Math.ceil((Math.abs(options.bend!) * detail) / SEGMENT_DEG))) : 1;
  const flowFor = (frame: Frame, i: number) =>
    typeof options.flow === "function"
      ? toDirection(options.flow(frame, i), "cards()")
      : options.flow
        ? toDirection(options.flow, "cards()")
        : new Vector3(0, -0.3, -1);
  const [u0, u1] = options.mirror ? [1, 0] : [0, 1];
  const sink = options.sink ?? 0.1;
  const tint = options.color instanceof Paint ? null : (options.color ?? "#ffffff");
  const tags = { name: options.name ?? "cards", group: options.group };

  type Batch = {
    positions: number[];
    normals: number[];
    uvs: number[];
    colors: number[];
    index: number[];
    weights: Weights[];
  };
  const batches = distinct.map(
    (): Batch => ({ positions: [], normals: [], uvs: [], colors: [], index: [], weights: [] }),
  );

  on.forEach((input, i) => {
    const f = toFrame(input);
    const root = f.at;
    const n = f.axis.normalize();
    const pickT = textures.length > 1 ? Math.min(Math.floor(random() * textures.length), textures.length - 1) : 0;
    const scale = 1 + (options.vary ?? 0) * (2 * random() - 1);
    const turn = (options.spin ?? 0) * (2 * random() - 1) * DEG;
    const w = w0 * scale;
    const h = h0 * scale;
    let t = flatten(flowFor(f, i), n);
    if (t.lengthSq() < 1e-10) t = flatten(new Vector3(0, 0, -1), n);
    if (t.lengthSq() < 1e-10) t = flatten(new Vector3(1, 0, 0), n);
    t.normalize();
    if (turn) t.applyAxisAngle(n, turn).normalize();
    const side = n.clone().cross(t).normalize();
    const weights = weightsFor(ctx, options.bone, [input], root);
    const color = options.color instanceof Paint ? options.color.at(root, n) : null;
    const batch = batches[distinct.indexOf(textures[pickT])];

    // The card's spine: from the sunk root out along the leaning, curling direction.
    const dirAt = (s: number) => {
      const a = lean + bend * s;
      return n.clone().multiplyScalar(Math.cos(a)).addScaledVector(t, Math.sin(a));
    };
    const spine = [
      root
        .clone()
        .addScaledVector(dirAt(0), -sink * h)
        .addScaledVector(n, 0.02 * h),
    ];
    const dirs = [dirAt(0)];
    for (let k = 0; k < segments; k++) {
      const d = dirAt((k + 0.5) / segments);
      spine.push(spine[k].clone().addScaledVector(d, h / segments));
      dirs.push(dirAt((k + 1) / segments));
    }
    const strip = (across: (k: number) => Vector3) => {
      const first = batch.positions.length / 3;
      spine.forEach((p, k) => {
        const half = across(k).multiplyScalar(w / 2);
        for (const [sign, u] of [
          [-1, u0],
          [1, u1],
        ] as const) {
          const q = p.clone().addScaledVector(half, sign);
          batch.positions.push(q.x, q.y, q.z);
          batch.normals.push(n.x, n.y, n.z);
          batch.uvs.push(u, k / segments);
          if (color) batch.colors.push(...linear(color));
          batch.weights.push(weights);
        }
      });
      for (let k = 0; k < segments; k++) {
        const [a, b, c, d] = [first + 2 * k, first + 2 * k + 1, first + 2 * k + 2, first + 2 * k + 3];
        batch.index.push(a, b, d, a, d, c); // front
        batch.index.push(a, d, b, a, c, d); // back
      }
    };
    strip(() => side.clone());
    if (options.cross) strip((k) => dirs[k].clone().cross(side).normalize());
  });

  const meshes: Mesh[] = [];
  batches.forEach((batch, k) => {
    if (!batch.index.length) return;
    meshes.push(
      meshFromWorld(ctx, batch.positions, batch.index, tint ?? "#ffffff", (v) => batch.weights[v], true, tags, {
        normals: batch.normals,
        uvs: batch.uvs,
        colors: tint ? undefined : batch.colors,
        texture: distinct[k],
      }),
    );
  });
  return meshes;
}

/** sRGB 0..1 to the linear values vertex colours hold. */
function linear(c: readonly [number, number, number]) {
  return c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
}
