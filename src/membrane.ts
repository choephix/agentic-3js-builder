// Thin closed skins: `membrane()` between two edges (split per bone) and `slab()` from one polygon.
import { ShapeUtils, Vector2, Vector3 } from "three";
import { meshFromWorld, resolveJoint } from "./context";
import type { Ctx, JointRef, Tags } from "./context";
import { aim, vec } from "./math";
import type { V3 } from "./math";
import { toPath } from "./path";
import type { PathLike } from "./path";
import { Chain } from "./skeleton";
import type { Joint } from "./skeleton";

export type MembraneEdge = Chain | PathLike;

export type MembraneOptions = Tags & {
  color: string;
  /** Total thickness; the skin is offset ± thickness/2 along its normal and closed with side walls. */
  thickness: number;
  /** Cells between the edges (default 4 × the builder's `detail`). */
  rows?: number;
  /** Cells along the edges (default from the aspect ratio); every bone span boundary also gets a column. */
  cols?: number;
  /** Trailing-edge inset between the two edge tips, as a fraction of the edge length (0.25 = a deep scallop). */
  scallop?: number;
  /** Which bone owns a cell: "mid" = the nearer edge's joint at that t, "a" / "b" = always that edge. */
  split?: "mid" | "a" | "b";
  /**
   * Owner of cells on Path / point edges (default: the other edge's joints, else the root joint). A Chain gives
   * each cell to the chain joint nearest to it: a fin on `sweep.line(0)` follows the spine.
   */
  bone?: JointRef | Chain;
};

/** Grid vertices P[i][j]: `i` along the edges, `j` from edge A (0) to edge B (rows). */
type Grid = Vector3[][];

/**
 * Closed prism triangles for a set of grid cells, appended to positions (world). Cells are [i, j]; `normals` are
 * per-vertex unit normals. Walls are built on every cell edge whose neighbour is not in the set.
 */
function prism(grid: Grid, normals: Grid, cells: Array<[number, number]>, half: number) {
  const positions: number[] = [];
  const index: number[] = [];
  const inSet = new Set(cells.map(([i, j]) => `${i},${j}`));
  const top = (i: number, j: number) => grid[i][j].clone().addScaledVector(normals[i][j], half);
  const bottom = (i: number, j: number) => grid[i][j].clone().addScaledVector(normals[i][j], -half);
  const tri = (a: Vector3, b: Vector3, c: Vector3) => {
    const base = positions.length / 3;
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    index.push(base, base + 1, base + 2);
  };
  for (const [i, j] of cells) {
    // Counter-clockwise around the cell when seen from +normal: (i,j) → (i+1,j) → (i+1,j+1) → (i,j+1).
    const ring: Array<[number, number]> = [
      [i, j],
      [i + 1, j],
      [i + 1, j + 1],
      [i, j + 1],
    ];
    tri(top(...ring[0]), top(...ring[1]), top(...ring[2]));
    tri(top(...ring[0]), top(...ring[2]), top(...ring[3]));
    tri(bottom(...ring[0]), bottom(...ring[2]), bottom(...ring[1]));
    tri(bottom(...ring[0]), bottom(...ring[3]), bottom(...ring[2]));
    const neighbours = [
      [i, j - 1],
      [i + 1, j],
      [i, j + 1],
      [i - 1, j],
    ];
    for (let e = 0; e < 4; e++) {
      if (inSet.has(`${neighbours[e][0]},${neighbours[e][1]}`)) continue;
      const a = ring[e];
      const b = ring[(e + 1) % 4];
      tri(top(...b), top(...a), bottom(...a));
      tri(top(...b), bottom(...a), bottom(...b));
    }
  }
  return { positions, index };
}

export function membrane(ctx: Ctx, edgeA: MembraneEdge, edgeB: MembraneEdge, options: MembraneOptions) {
  const chainA = edgeA instanceof Chain ? edgeA : null;
  const chainB = edgeB instanceof Chain ? edgeB : null;
  const pathA = chainA ? null : toPath(edgeA as PathLike);
  const pathB = chainB ? null : toPath(edgeB as PathLike);
  // Chain edges are read in their current pose.
  const pointA = (t: number) => (chainA ? chainA.at(t).p : pathA!.at(t));
  const pointB = (t: number) => (chainB ? chainB.at(t).p : pathB!.at(t));
  const rows = options.rows ?? Math.max(1, Math.round(4 * ctx.detail));
  const scallop = options.scallop ?? 0;
  const split = options.split ?? "mid";
  const owner = options.bone;
  const jointFor = (side: "a" | "b", t: number, at: Vector3): Joint => {
    const own = side === "a" ? chainA : chainB;
    const other = side === "a" ? chainB : chainA;
    if (own) return own.jointAt(t);
    if (owner instanceof Chain) return owner.nearestJoint(at);
    if (owner !== undefined) return resolveJoint(ctx, owner);
    return other?.jointAt(t) ?? resolveJoint(ctx);
  };

  let width = 0;
  for (let k = 0; k <= 8; k++) width += pointA(k / 8).distanceTo(pointB(k / 8)) / 9;
  const length = Math.max((chainA ?? pathA!).length, (chainB ?? pathB!).length);
  const cols =
    options.cols ?? Math.min(ctx.segments(24), Math.max(4, Math.round((length / Math.max(width, 1e-6)) * rows)));
  const us = new Set<number>();
  for (let i = 0; i <= cols; i++) us.add(i / cols);
  for (const chain of [chainA, chainB]) for (const t of chain?.ts ?? []) us.add(t);
  const columns = [...us].sort((x, y) => x - y).filter((u, i, all) => i === 0 || u - all[i - 1] > 1e-4);

  const tMax = (s: number) => 1 - scallop * 4 * s * (1 - s);
  const grid: Grid = columns.map((u) =>
    Array.from({ length: rows + 1 }, (_, j) => {
      const s = j / rows;
      const t = u * tMax(s);
      return pointA(t).lerp(pointB(t), s);
    }),
  );

  // Per-vertex normals: area-weighted cell normals (robust where the two edges meet at a shared root).
  const normals: Grid = grid.map((col) => col.map(() => new Vector3()));
  const total = new Vector3();
  for (let i = 0; i < columns.length - 1; i++)
    for (let j = 0; j < rows; j++) {
      const d1 = grid[i + 1][j + 1].clone().sub(grid[i][j]);
      const d2 = grid[i][j + 1].clone().sub(grid[i + 1][j]);
      const n = new Vector3().crossVectors(d1, d2);
      total.add(n);
      for (const [a, b] of [
        [i, j],
        [i + 1, j],
        [i + 1, j + 1],
        [i, j + 1],
      ])
        normals[a][b].add(n);
    }
  for (const col of normals) for (const n of col) (n.lengthSq() > 1e-16 ? n : n.copy(total)).normalize();

  // Assign cells to bones and build one closed prism per bone.
  const byJoint = new Map<Joint, Array<[number, number]>>();
  for (let i = 0; i < columns.length - 1; i++)
    for (let j = 0; j < rows; j++) {
      const s = (j + 0.5) / rows;
      const t = ((columns[i] + columns[i + 1]) / 2) * tMax(s);
      const side = split === "mid" ? (s < 0.5 ? "a" : "b") : split;
      const centre = grid[i][j]
        .clone()
        .add(grid[i + 1][j + 1])
        .multiplyScalar(0.5);
      const joint = jointFor(side, t, centre);
      const list = byJoint.get(joint);
      if (list) list.push([i, j]);
      else byJoint.set(joint, [[i, j]]);
    }
  return [...byJoint].map(([joint, cells]) => {
    const { positions, index } = prism(grid, normals, cells, options.thickness / 2);
    return meshFromWorld(ctx, positions, index, options.color, joint, false, {
      name: options.name ?? "membrane",
      group: options.group,
    });
  });
}

export type SlabOptions = Tags & { color: string; thickness: number; bone?: JointRef };

/** A (roughly) planar polygon as a thin closed prism: fins, leaves, plates, ears. */
export function slab(ctx: Ctx, points: readonly V3[], options: SlabOptions) {
  const pts = points.map(vec);
  if (pts.length < 3) throw new Error("slab() needs at least 3 points");
  // Newell normal.
  const n = new Vector3();
  const center = new Vector3();
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    n.x += (p.y - q.y) * (p.z + q.z);
    n.y += (p.z - q.z) * (p.x + q.x);
    n.z += (p.x - q.x) * (p.y + q.y);
    center.add(p);
  });
  n.normalize();
  center.divideScalar(pts.length);
  // In-plane basis with u × v = n, so the contour is counter-clockwise seen from +n (Newell guarantees it).
  const frame = aim(n, undefined, "z");
  const u = new Vector3(1, 0, 0).applyQuaternion(frame);
  const v = new Vector3(0, 1, 0).applyQuaternion(frame);
  const contour = pts.map((p) => new Vector2(p.clone().sub(center).dot(u), p.clone().sub(center).dot(v)));
  const faces = ShapeUtils.triangulateShape(contour, []);
  const half = options.thickness / 2;
  const top = pts.map((p) => p.clone().addScaledVector(n, half));
  const bottom = pts.map((p) => p.clone().addScaledVector(n, -half));
  const positions: number[] = [];
  const index: number[] = [];
  const tri = (a: Vector3, b: Vector3, c: Vector3) => {
    const base = positions.length / 3;
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    index.push(base, base + 1, base + 2);
  };
  for (const [a, b, c] of faces) {
    const ccw = ShapeUtils.area([contour[a], contour[b], contour[c]]) > 0;
    const [i, j, k] = ccw ? [a, b, c] : [a, c, b];
    tri(top[i], top[j], top[k]);
    tri(bottom[i], bottom[k], bottom[j]);
  }
  for (let i = 0; i < pts.length; i++) {
    const a = i;
    const b = (i + 1) % pts.length;
    tri(top[b], top[a], bottom[a]);
    tri(top[b], bottom[a], bottom[b]);
  }
  return meshFromWorld(ctx, positions, index, options.color, resolveJoint(ctx, options.bone), false, {
    name: options.name ?? "slab",
    group: options.group,
  });
}
