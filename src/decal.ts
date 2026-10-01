// `decal()`: a texture conformed onto a curved built surface. A grid of rays shot against the facing direction lands a
// sheet of quads on the surface's real triangles, lifted slightly off it; every vertex takes the skin weights of the
// point it landed on, so the decal bends with the bones under it.
import { Box3, Vector3 } from "three";
import type { Texture } from "three";
import { meshFromWorld, resolveJoint, rigid } from "./context";
import type { Ctx, JointRef, Tags, Weights } from "./context";
import { Frame } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint } from "./math";
import type { DirectionInput, PointInput } from "./math";
import { Part } from "./parts";
import { Surface } from "./surface";
import type { Hit, SurfaceTarget } from "./surface";

export type DecalOptions = Tags & {
  /** A point on or near the surface where the decal's centre lands (a surface hit works). */
  at: PointInput;
  /**
   * The way the drawing faces, out of the surface toward its viewer (a decal on a face looking forward: `[0, 0, 1]`).
   * Rays travel the opposite way, onto the surface. Default: `at`'s facing axis when `at` is a frame (a hit's normal).
   */
  dir?: DirectionInput;
  /** Which way is up in the drawing, seen from the front (default world +Y, else world +Z when `dir` is vertical). */
  up?: DirectionInput;
  /** Width and height of the drawing in meters, measured on the plane facing `dir`. */
  size: readonly [number, number];
  /** Grid quads across and up (default 10 along the longer side, in proportion along the shorter). */
  segments?: number | readonly [number, number];
  /** Distance the sheet floats off the surface (default 0.0015 m); cells spanning a fold float higher to clear it. */
  lift?: number;
  /** Degrees the drawing turns counter-clockwise, seen from the front. */
  roll?: number;
  /** Flip the drawing left-right (the other eye of a pair). */
  mirror?: boolean;
  /** Tint multiplied into the texture (default "#ffffff": as drawn). */
  color?: string;
  /** Rigid on this bone. Default: every vertex rides the skin weights of the surface point under it. */
  bone?: JointRef;
};

export function decal(ctx: Ctx, target: Surface | SurfaceTarget, texture: Texture, options: DecalOptions) {
  const skin = target instanceof Surface ? target : new Surface(ctx, target);
  const center = toPoint(options.at, "decal()");
  const { at } = options;
  const facing = options.dir
    ? toDirection(options.dir, "decal()")
    : at instanceof Frame || (typeof at === "object" && "frame" in at)
      ? toFrame(at).axis
      : null;
  if (!facing || facing.lengthSq() < 1e-12)
    throw new Error("decal(): give `dir`, the way the drawing faces (out of the surface)");
  // The rays travel against the facing direction, onto the surface; `dir` below is their direction.
  const dir = facing.negate().normalize();

  let up = options.up ? toDirection(options.up, "decal()") : new Vector3(0, 1, 0);
  let right = dir.clone().cross(up);
  if (right.lengthSq() < 1e-10) {
    up = new Vector3(0, 0, 1);
    right = dir.clone().cross(up);
  }
  right.normalize();
  up = right.clone().cross(dir).normalize();
  if (options.roll) {
    right.applyAxisAngle(dir, -options.roll * DEG);
    up.applyAxisAngle(dir, -options.roll * DEG);
  }

  const [w, h] = options.size;
  const [cols, rows] =
    options.segments === undefined
      ? w >= h
        ? [10, Math.max(1, Math.round((10 * h) / w))]
        : [Math.max(1, Math.round((10 * w) / h)), 10]
      : typeof options.segments === "number"
        ? [options.segments, options.segments]
        : options.segments;
  const lift = options.lift ?? 0.0015;

  // Rays start outside everything in the surface, so the first hit is the outermost face along `dir`.
  const box = new Box3();
  for (const mesh of skin.meshes) box.expandByObject(mesh);
  const back = box.distanceToPoint(center) + box.getSize(new Vector3()).length() + Math.max(w, h);

  const uvs: number[] = [];
  const hits: Hit[] = [];
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const v = j / rows;
      const flat = center
        .clone()
        .addScaledVector(right, (u - 0.5) * w)
        .addScaledVector(up, (v - 0.5) * h);
      const hit = skin.ray(flat.clone().addScaledVector(dir, -back), dir) ?? skin.nearest(flat);
      hits.push(hit);
      uvs.push(options.mirror ? 1 - u : u, v);
    }
  const index: number[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      index.push(a, a + 1, a + cols + 2, a, a + cols + 2, a + cols + 1);
    }
  // A sheet edge spanning a convex fold of the surface dips below it by at most (L/2)·tan(φ/2), L the edge length
  // and φ the turn between the end normals: both ends float that much higher so ridges never poke through. Sharp
  // turns (past 60°: a sheet wrapping a silhouette, or a missed ray) keep the plain lift.
  const rise = hits.map(() => lift);
  for (let t = 0; t < index.length; t += 3)
    for (let k = 0; k < 3; k++) {
      const a = index[t + k];
      const b = index[t + ((k + 1) % 3)];
      const turn = hits[a].n.angleTo(hits[b].n);
      if (turn > Math.PI / 3) continue;
      const sag = lift + (hits[a].at.distanceTo(hits[b].at) / 2) * Math.tan(turn / 2);
      rise[a] = Math.max(rise[a], sag);
      rise[b] = Math.max(rise[b], sag);
    }
  const positions: number[] = [];
  hits.forEach((hit, i) => hit.at.addScaledVector(hit.n, rise[i]).toArray(positions, i * 3));

  const fixed = options.bone === undefined ? null : rigid(resolveJoint(ctx, options.bone));
  const weightAt = (vertex: number): Weights => fixed ?? hits[vertex].weights;
  const mesh = meshFromWorld(
    ctx,
    positions,
    index,
    options.color ?? "#ffffff",
    weightAt,
    true,
    { ...options, kind: "decal" },
    {
      uvs,
      texture,
    },
  );
  const middle = hits[Math.floor(rows / 2) * (cols + 1) + Math.floor(cols / 2)];
  return new Part(mesh, middle.at.clone(), aim(dir.clone().negate(), up), fixed ?? middle.weights, [0, 1, 0]);
}
