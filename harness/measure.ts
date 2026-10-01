import type { Assembly } from "./assemble";

export type Vec3 = [number, number, number];
export type Gap = {
  distance: number;
  overlap: boolean;
  a: { part: number; point: Vec3 };
  b: { part: number; point: Vec3 };
};
export type Loose = { parts: number[]; area: number; nearest: Gap; onFloor: boolean; flat: boolean };

export type MeasureIndex = {
  triangles: Triangle[];
  partTriangles: Triangle[][];
  partBounds: Bounds[];
  partClosed: boolean[];
  bounds: Bounds;
  diagonal: number;
  cellSize: number;
  cells: Map<string, number[]>;
  scratch: Int32Array;
  stamp: number;
  areas: number[];
  cutout: boolean[];
};

type Bounds = { min: Vec3; max: Vec3 };
type Triangle = {
  id: number;
  part: number;
  a: Vec3;
  b: Vec3;
  c: Vec3;
  min: Vec3;
  max: Vec3;
};
type Pair = { distance: number; a: Vec3; b: Vec3; overlap: boolean };

const ZERO: Vec3 = [0, 0, 0];
const boundsDistance = (a: Bounds, b: Bounds) => {
  const x = Math.max(a.min[0] - b.max[0], b.min[0] - a.max[0], 0);
  const y = Math.max(a.min[1] - b.max[1], b.min[1] - a.max[1], 0);
  const z = Math.max(a.min[2] - b.max[2], b.min[2] - a.max[2], 0);
  return Math.hypot(x, y, z);
};
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, n: number): Vec3 => [a[0] * n, a[1] * n, a[2] * n];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const length2 = (a: Vec3) => dot(a, a);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

function makeBounds(): Bounds {
  return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}
function addPoint(bounds: Bounds, p: Vec3) {
  for (let k = 0; k < 3; k++) {
    bounds.min[k] = Math.min(bounds.min[k], p[k]);
    bounds.max[k] = Math.max(bounds.max[k], p[k]);
  }
}
function triangleBounds(a: Vec3, b: Vec3, c: Vec3): Bounds {
  const result = makeBounds();
  addPoint(result, a);
  addPoint(result, b);
  addPoint(result, c);
  return result;
}
function pointAt(array: ArrayLike<number>, index: number): Vec3 {
  return [array[index * 3], array[index * 3 + 1], array[index * 3 + 2]];
}
function edgeKey(a: Vec3, b: Vec3) {
  const key = (p: Vec3) => `${Math.round(p[0] * 1e5)},${Math.round(p[1] * 1e5)},${Math.round(p[2] * 1e5)}`;
  const x = key(a);
  const y = key(b);
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}

function partIsClosed(triangles: Triangle[], diagonal: number) {
  if (!triangles.length) return false;
  const bounds = makeBounds();
  const edges = new Map<string, number>();
  let volumeAbsolute = 0;
  const centre: Vec3 = [0, 0, 0];
  for (const triangle of triangles) {
    addPoint(bounds, triangle.a);
    addPoint(bounds, triangle.b);
    addPoint(bounds, triangle.c);
    for (const [a, b] of [
      [triangle.a, triangle.b],
      [triangle.b, triangle.c],
      [triangle.c, triangle.a],
    ] as Array<[Vec3, Vec3]>)
      edges.set(edgeKey(a, b), (edges.get(edgeKey(a, b)) ?? 0) + 1);
  }
  for (let k = 0; k < 3; k++) centre[k] = (bounds.min[k] + bounds.max[k]) / 2;
  for (const triangle of triangles) {
    const a = sub(triangle.a, centre);
    const b = sub(triangle.b, centre);
    const c = sub(triangle.c, centre);
    const contribution = dot(a, cross(b, c)) / 6;
    volumeAbsolute += Math.abs(contribution);
  }
  const extent = [bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]];
  const flat = Math.min(...extent) <= 1e-5 * Math.max(...extent, diagonal * 1e-8);
  return (
    !flat &&
    volumeAbsolute > Math.max(diagonal ** 3 * 1e-12, 1e-12) &&
    [...edges.values()].every((count) => count % 2 === 0)
  );
}

function cellKey(x: number, y: number, z: number) {
  return `${x},${y},${z}`;
}
function cellRange(bounds: Bounds, index: MeasureIndex, padding: number, visit: (id: number) => void) {
  const minX = Math.floor((bounds.min[0] - index.bounds.min[0]) / index.cellSize) - Math.ceil(padding / index.cellSize);
  const minY = Math.floor((bounds.min[1] - index.bounds.min[1]) / index.cellSize) - Math.ceil(padding / index.cellSize);
  const minZ = Math.floor((bounds.min[2] - index.bounds.min[2]) / index.cellSize) - Math.ceil(padding / index.cellSize);
  const maxX = Math.floor((bounds.max[0] - index.bounds.min[0]) / index.cellSize) + Math.ceil(padding / index.cellSize);
  const maxY = Math.floor((bounds.max[1] - index.bounds.min[1]) / index.cellSize) + Math.ceil(padding / index.cellSize);
  const maxZ = Math.floor((bounds.max[2] - index.bounds.min[2]) / index.cellSize) + Math.ceil(padding / index.cellSize);
  for (let x = minX; x <= maxX; x++)
    for (let y = minY; y <= maxY; y++)
      for (let z = minZ; z <= maxZ; z++) for (const id of index.cells.get(cellKey(x, y, z)) ?? []) visit(id);
}

export function measureIndex(assembly: Assembly): MeasureIndex {
  const positions = assembly.geometry.getAttribute("position");
  const indices = assembly.geometry.index;
  const partAttribute = assembly.geometry.getAttribute("_part");
  const triangles: Triangle[] = [];
  const partTriangles = Array.from({ length: assembly.parts.length }, () => [] as Triangle[]);
  const partBounds = Array.from({ length: assembly.parts.length }, makeBounds);
  const seen = Array.from({ length: assembly.parts.length }, () => new Set<string>());
  const addTriangle = (ia: number, ib: number, ic: number) => {
    const part = partAttribute ? Math.round(partAttribute.getX(ia)) : 0;
    if (part < 0 || part >= partTriangles.length) return;
    const a = pointAt(positions.array, ia);
    const b = pointAt(positions.array, ib);
    const c = pointAt(positions.array, ic);
    const triangleBoundsValue = triangleBounds(a, b, c);
    addPoint(partBounds[part], a);
    addPoint(partBounds[part], b);
    addPoint(partBounds[part], c);
    if (length2(cross(sub(b, a), sub(c, a))) < 1e-18) return;
    // Back copies and unwelded UV seams are the same surface, not a second ray crossing.
    const key = [a, b, c]
      .map((p) => p.join(","))
      .sort()
      .join("|");
    if (seen[part].has(key)) return;
    seen[part].add(key);
    const triangle: Triangle = {
      id: triangles.length,
      part,
      a,
      b,
      c,
      min: triangleBoundsValue.min,
      max: triangleBoundsValue.max,
    };
    triangles.push(triangle);
    partTriangles[part].push(triangle);
  };
  if (indices)
    for (let i = 0; i + 2 < indices.count; i += 3)
      addTriangle(indices.getX(i), indices.getX(i + 1), indices.getX(i + 2));
  else for (let i = 0; i + 2 < positions.count; i += 3) addTriangle(i, i + 1, i + 2);
  const bounds: Bounds = { min: [...assembly.bounds.min] as Vec3, max: [...assembly.bounds.max] as Vec3 };
  const diagonal = Math.hypot(
    bounds.max[0] - bounds.min[0],
    bounds.max[1] - bounds.min[1],
    bounds.max[2] - bounds.min[2],
  );
  const cellSize = Math.max(diagonal / 32, 1e-5);
  const cells = new Map<string, number[]>();
  const index = {
    triangles,
    partTriangles,
    partBounds,
    partClosed: [],
    bounds,
    diagonal,
    cellSize,
    cells,
    scratch: new Int32Array(triangles.length),
    stamp: 0,
    areas: assembly.parts.map((part) => part.area),
    cutout: assembly.parts.map((part) => part.cutout),
  } as MeasureIndex;
  for (const triangle of triangles) {
    const minX = Math.floor((triangle.min[0] - bounds.min[0]) / cellSize);
    const minY = Math.floor((triangle.min[1] - bounds.min[1]) / cellSize);
    const minZ = Math.floor((triangle.min[2] - bounds.min[2]) / cellSize);
    const maxX = Math.floor((triangle.max[0] - bounds.min[0]) / cellSize);
    const maxY = Math.floor((triangle.max[1] - bounds.min[1]) / cellSize);
    const maxZ = Math.floor((triangle.max[2] - bounds.min[2]) / cellSize);
    for (let x = minX; x <= maxX; x++)
      for (let y = minY; y <= maxY; y++)
        for (let z = minZ; z <= maxZ; z++) {
          const key = cellKey(x, y, z);
          let bucket = cells.get(key);
          if (!bucket) cells.set(key, (bucket = []));
          bucket.push(triangle.id);
        }
  }
  index.partClosed = partTriangles.map((part) => partIsClosed(part, diagonal));
  return index;
}

function pointTriangle(point: Vec3, triangle: Triangle): { point: Vec3; distance2: number } {
  const ab = sub(triangle.b, triangle.a);
  const ac = sub(triangle.c, triangle.a);
  const ap = sub(point, triangle.a);
  const d1 = dot(ab, ap);
  const d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return { point: triangle.a, distance2: length2(sub(point, triangle.a)) };
  const bp = sub(point, triangle.b);
  const d3 = dot(ab, bp);
  const d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return { point: triangle.b, distance2: length2(sub(point, triangle.b)) };
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    const closest = lerp(triangle.a, triangle.b, v);
    return { point: closest, distance2: length2(sub(point, closest)) };
  }
  const cp = sub(point, triangle.c);
  const d5 = dot(ab, cp);
  const d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return { point: triangle.c, distance2: length2(sub(point, triangle.c)) };
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    const closest = lerp(triangle.a, triangle.c, w);
    return { point: closest, distance2: length2(sub(point, closest)) };
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
    const closest = lerp(triangle.b, triangle.c, w);
    return { point: closest, distance2: length2(sub(point, closest)) };
  }
  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  const closest = add(triangle.a, add(scale(ab, v), scale(ac, w)));
  return { point: closest, distance2: length2(sub(point, closest)) };
}

function segmentSegment(a: Vec3, b: Vec3, c: Vec3, d: Vec3) {
  const u = sub(b, a);
  const v = sub(d, c);
  const w = sub(a, c);
  const aa = dot(u, u);
  const bb = dot(u, v);
  const cc = dot(v, v);
  const dd = dot(u, w);
  const ee = dot(v, w);
  const denom = aa * cc - bb * bb;
  let s = 0;
  let t = 0;
  if (denom > 1e-20) {
    s = clamp((bb * ee - cc * dd) / denom, 0, 1);
    t = clamp((aa * ee - bb * dd) / denom, 0, 1);
  } else if (cc > 1e-20) t = clamp(ee / cc, 0, 1);
  s = clamp((bb * t - dd) / (aa || 1), 0, 1);
  t = clamp((bb * s + ee) / (cc || 1), 0, 1);
  const pa = lerp(a, b, s);
  const pb = lerp(c, d, t);
  return { a: pa, b: pb, distance2: length2(sub(pa, pb)) };
}

function segmentTriangle(a: Vec3, b: Vec3, triangle: Triangle): Vec3 | null {
  const direction = sub(b, a);
  const edge1 = sub(triangle.b, triangle.a);
  const edge2 = sub(triangle.c, triangle.a);
  const h = cross(direction, edge2);
  const determinant = dot(edge1, h);
  if (Math.abs(determinant) < 1e-12 * Math.sqrt(length2(direction) * length2(cross(edge1, edge2)))) return null;
  const inverse = 1 / determinant;
  const s = sub(a, triangle.a);
  const u = inverse * dot(s, h);
  if (u < -1e-8 || u > 1 + 1e-8) return null;
  const q = cross(s, edge1);
  const v = inverse * dot(direction, q);
  if (v < -1e-8 || u + v > 1 + 1e-8) return null;
  const distance = inverse * dot(edge2, q);
  if (distance < -1e-8 || distance > 1 + 1e-8) return null;
  return add(a, scale(direction, distance));
}

function dominantAxis(normal: Vec3) {
  const absolute = normal.map(Math.abs);
  return absolute[0] > absolute[1] && absolute[0] > absolute[2] ? 0 : absolute[1] > absolute[2] ? 1 : 2;
}
function flat2(point: Vec3, axis: number): [number, number] {
  return axis === 0 ? [point[1], point[2]] : axis === 1 ? [point[0], point[2]] : [point[0], point[1]];
}
function orient2(a: [number, number], b: [number, number], c: [number, number]) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
function pointIn2(point: [number, number], tri: Array<[number, number]>) {
  const signs = tri.map((entry, i) => orient2(entry, tri[(i + 1) % 3], point));
  return signs.every((value) => value >= -1e-9) || signs.every((value) => value <= 1e-9);
}
function coplanarIntersection(first: Triangle, second: Triangle): Vec3 | null {
  const normal = cross(sub(first.b, first.a), sub(first.c, first.a));
  const axis = dominantAxis(normal);
  const a = [first.a, first.b, first.c].map((point) => flat2(point, axis));
  const b = [second.a, second.b, second.c].map((point) => flat2(point, axis));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const p = a[i],
        r = [a[(i + 1) % 3][0] - p[0], a[(i + 1) % 3][1] - p[1]] as [number, number];
      const q = b[j],
        s = [b[(j + 1) % 3][0] - q[0], b[(j + 1) % 3][1] - q[1]] as [number, number];
      const denominator = r[0] * s[1] - r[1] * s[0];
      const qp = [q[0] - p[0], q[1] - p[1]] as [number, number];
      if (Math.abs(denominator) > 1e-12) {
        const u = (qp[0] * r[1] - qp[1] * r[0]) / denominator;
        const t = (qp[0] * s[1] - qp[1] * s[0]) / denominator;
        if (u >= -1e-8 && u <= 1 + 1e-8 && t >= -1e-8 && t <= 1 + 1e-8)
          return lerp([first.a, first.b, first.c][i], [first.a, first.b, first.c][(i + 1) % 3], t);
      }
    }
  }
  for (let i = 0; i < 3; i++) if (pointIn2(a[i], b)) return [first.a, first.b, first.c][i];
  for (let i = 0; i < 3; i++) if (pointIn2(b[i], a)) return [second.a, second.b, second.c][i];
  return null;
}

function trianglePair(first: Triangle, second: Triangle): Pair {
  const normalA = cross(sub(first.b, first.a), sub(first.c, first.a));
  const normalB = cross(sub(second.b, second.a), sub(second.c, second.a));
  const crossNormals = cross(normalA, normalB);
  if (length2(crossNormals) < 1e-20 * length2(normalA) * length2(normalB)) {
    const planeDistance = Math.abs(dot(normalA, sub(second.a, first.a)));
    if (planeDistance < 1e-9 * Math.sqrt(length2(normalA))) {
      const hit = coplanarIntersection(first, second);
      if (hit) return { distance: 0, a: hit, b: hit, overlap: true };
    }
  }
  for (const [a, b] of [
    [first.a, first.b],
    [first.b, first.c],
    [first.c, first.a],
  ] as Array<[Vec3, Vec3]>) {
    const hit = segmentTriangle(a, b, second);
    if (hit) return { distance: 0, a: hit, b: hit, overlap: true };
  }
  for (const [a, b] of [
    [second.a, second.b],
    [second.b, second.c],
    [second.c, second.a],
  ] as Array<[Vec3, Vec3]>) {
    const hit = segmentTriangle(a, b, first);
    if (hit) return { distance: 0, a: hit, b: hit, overlap: true };
  }
  let best: Pair = { distance: Infinity, a: ZERO, b: ZERO, overlap: false };
  const consider = (a: Vec3, b: Vec3, distance2: number) => {
    if (distance2 < best.distance * best.distance) best = { distance: Math.sqrt(distance2), a, b, overlap: false };
  };
  for (const point of [first.a, first.b, first.c]) {
    const result = pointTriangle(point, second);
    consider(point, result.point, result.distance2);
  }
  for (const point of [second.a, second.b, second.c]) {
    const result = pointTriangle(point, first);
    consider(result.point, point, result.distance2);
  }
  for (const [a, b] of [
    [first.a, first.b],
    [first.b, first.c],
    [first.c, first.a],
  ] as Array<[Vec3, Vec3]>)
    for (const [c, d] of [
      [second.a, second.b],
      [second.b, second.c],
      [second.c, second.a],
    ] as Array<[Vec3, Vec3]>) {
      const result = segmentSegment(a, b, c, d);
      consider(result.a, result.b, result.distance2);
    }
  return best;
}

function inside(point: Vec3, triangles: Triangle[], bounds: Bounds) {
  if (
    point[0] < bounds.min[0] ||
    point[0] > bounds.max[0] ||
    point[1] < bounds.min[1] ||
    point[1] > bounds.max[1] ||
    point[2] < bounds.min[2] ||
    point[2] > bounds.max[2]
  )
    return false;
  const direction: Vec3 = [1, 1.234567e-7, 2.345679e-7];
  let hits = 0;
  for (const triangle of triangles) {
    const edge1 = sub(triangle.b, triangle.a);
    const edge2 = sub(triangle.c, triangle.a);
    const h = cross(direction, edge2);
    const det = dot(edge1, h);
    if (Math.abs(det) < 1e-12) continue;
    const inverse = 1 / det;
    const s = sub(point, triangle.a);
    const u = inverse * dot(s, h);
    if (u < 0 || u > 1) continue;
    const q = cross(s, edge1);
    const v = inverse * dot(direction, q);
    if (v < 0 || u + v > 1) continue;
    const t = inverse * dot(edge2, q);
    if (t > 1e-9) hits++;
  }
  return hits % 2 === 1;
}

export function gap(index: MeasureIndex, a: number[], b: number[], limit = Infinity): Gap {
  const left = [...new Set(a)].filter((part) => part >= 0 && part < index.partTriangles.length);
  const right = [...new Set(b)].filter((part) => part >= 0 && part < index.partTriangles.length);
  const empty: Gap = {
    distance: Infinity,
    overlap: false,
    a: { part: left[0] ?? -1, point: [...ZERO] as Vec3 },
    b: { part: right[0] ?? -1, point: [...ZERO] as Vec3 },
  };
  if (!left.length || !right.length) return empty;
  const leftTriangles = left.flatMap((part) => index.partTriangles[part]);
  const rightTriangles = right.flatMap((part) => index.partTriangles[part]);
  if (!leftTriangles.length || !rightTriangles.length) return empty;
  const swapped = leftTriangles.length > rightTriangles.length;
  const first = swapped ? right : left;
  const second = swapped ? left : right;
  const firstTriangles = swapped ? rightTriangles : leftTriangles;
  const secondTriangles = swapped ? leftTriangles : rightTriangles;
  const allowed = new Uint8Array(index.partTriangles.length);
  for (const part of second) allowed[part] = 1;
  let best: Pair = { distance: limit, a: ZERO, b: ZERO, overlap: false };
  let bestPartA = first[0];
  let bestPartB = second[0];
  let foundCandidate = false;
  const inspect = (firstTriangle: Triangle, radius: number) => {
    const queryStamp = ++index.stamp;
    const queryBounds: Bounds = {
      min: [firstTriangle.min[0] - radius, firstTriangle.min[1] - radius, firstTriangle.min[2] - radius],
      max: [firstTriangle.max[0] + radius, firstTriangle.max[1] + radius, firstTriangle.max[2] + radius],
    };
    cellRange(queryBounds, index, 0, (id) => {
      const candidate = index.triangles[id];
      if (best.distance === 0 || !candidate || !allowed[candidate.part] || index.scratch[id] === queryStamp) return;
      index.scratch[id] = queryStamp;
      foundCandidate = true;
      if (
        boundsDistance({ min: firstTriangle.min, max: firstTriangle.max }, { min: candidate.min, max: candidate.max }) >
        best.distance
      )
        return;
      const pair = trianglePair(firstTriangle, candidate);
      if (pair.distance < best.distance || pair.overlap) {
        best = pair;
        bestPartA = firstTriangle.part;
        bestPartB = candidate.part;
      }
    });
  };
  const initialRadius = Number.isFinite(limit) ? limit : index.cellSize * 2;
  for (const triangle of firstTriangles) {
    inspect(triangle, initialRadius);
    if (best.distance === 0) {
      const result: Gap = {
        distance: 0,
        overlap: true,
        a: { part: bestPartA, point: best.a },
        b: { part: bestPartB, point: best.b },
      };
      return swapped ? { ...result, a: result.b, b: result.a } : result;
    }
  }
  if (!foundCandidate && !Number.isFinite(limit)) {
    for (const firstTriangle of firstTriangles)
      for (const secondTriangle of secondTriangles) {
        if (
          boundsDistance(
            { min: firstTriangle.min, max: firstTriangle.max },
            { min: secondTriangle.min, max: secondTriangle.max },
          ) > best.distance
        )
          continue;
        const pair = trianglePair(firstTriangle, secondTriangle);
        if (pair.distance < best.distance || pair.overlap) {
          best = pair;
          bestPartA = firstTriangle.part;
          bestPartB = secondTriangle.part;
        }
      }
  } else if (Number.isFinite(best.distance) && best.distance < limit) {
    for (const firstTriangle of firstTriangles) {
      const refinementStamp = ++index.stamp;
      const queryBounds: Bounds = {
        min: [
          firstTriangle.min[0] - best.distance,
          firstTriangle.min[1] - best.distance,
          firstTriangle.min[2] - best.distance,
        ],
        max: [
          firstTriangle.max[0] + best.distance,
          firstTriangle.max[1] + best.distance,
          firstTriangle.max[2] + best.distance,
        ],
      };
      cellRange(queryBounds, index, 0, (id) => {
        const candidate = index.triangles[id];
        if (!candidate || !allowed[candidate.part] || index.scratch[id] === refinementStamp) return;
        index.scratch[id] = refinementStamp;
        if (
          boundsDistance(
            { min: firstTriangle.min, max: firstTriangle.max },
            { min: candidate.min, max: candidate.max },
          ) > best.distance
        )
          return;
        const pair = trianglePair(firstTriangle, candidate);
        if (pair.distance < best.distance || pair.overlap) {
          best = pair;
          bestPartA = firstTriangle.part;
          bestPartB = candidate.part;
        }
      });
    }
  }
  // A closed shell containing another part has no positive surface gap; flat/open parts are not marked closed.
  const contained = (insideParts: number[], shellParts: number[]) => {
    for (const shell of shellParts)
      if (index.partClosed[shell]) {
        for (const part of insideParts) {
          const triangle = index.partTriangles[part][0];
          if (triangle && inside(triangle.a, index.partTriangles[shell], index.partBounds[shell]))
            return { part, shell, point: triangle.a };
        }
      }
    return null;
  };
  const forwardContainment = contained(first, second);
  const containment = forwardContainment ?? contained(second, first);
  if (containment) {
    const firstPart = forwardContainment ? containment.part : containment.shell;
    const secondPart = forwardContainment ? containment.shell : containment.part;
    const result: Gap = {
      distance: 0,
      overlap: true,
      a: { part: firstPart, point: containment.point },
      b: { part: secondPart, point: containment.point },
    };
    return swapped ? { ...result, a: result.b, b: result.a } : result;
  }
  if (!Number.isFinite(best.distance) || (Number.isFinite(limit) && best.distance >= limit)) return empty;
  const result: Gap = {
    distance: best.distance,
    overlap: best.overlap,
    a: { part: bestPartA, point: best.a },
    b: { part: bestPartB, point: best.b },
  };
  return swapped ? { ...result, a: result.b, b: result.a } : result;
}

function boundsOverlap(a: Bounds, b: Bounds) {
  return (
    a.min[0] <= b.max[0] &&
    b.min[0] <= a.max[0] &&
    a.min[1] <= b.max[1] &&
    b.min[1] <= a.max[1] &&
    a.min[2] <= b.max[2] &&
    b.min[2] <= a.max[2]
  );
}

function expandedBounds(bounds: Bounds, padding: number): Bounds {
  return {
    min: [bounds.min[0] - padding, bounds.min[1] - padding, bounds.min[2] - padding],
    max: [bounds.max[0] + padding, bounds.max[1] + padding, bounds.max[2] + padding],
  };
}

function overlapBounds(a: Bounds, b: Bounds): Bounds {
  return {
    min: [Math.max(a.min[0], b.min[0]), Math.max(a.min[1], b.min[1]), Math.max(a.min[2], b.min[2])],
    max: [Math.min(a.max[0], b.max[0]), Math.min(a.max[1], b.max[1]), Math.min(a.max[2], b.max[2])],
  };
}

function triangleInBounds(triangle: Triangle, bounds: Bounds) {
  return (
    triangle.min[0] <= bounds.max[0] &&
    triangle.max[0] >= bounds.min[0] &&
    triangle.min[1] <= bounds.max[1] &&
    triangle.max[1] >= bounds.min[1] &&
    triangle.min[2] <= bounds.max[2] &&
    triangle.max[2] >= bounds.min[2]
  );
}

function localCellRange(bounds: Bounds, box: Bounds, cellSize: Vec3, visit: (x: number, y: number, z: number) => void) {
  const min = [
    Math.max(0, Math.floor((bounds.min[0] - box.min[0]) / cellSize[0])),
    Math.max(0, Math.floor((bounds.min[1] - box.min[1]) / cellSize[1])),
    Math.max(0, Math.floor((bounds.min[2] - box.min[2]) / cellSize[2])),
  ];
  const max = [
    Math.min(15, Math.floor((bounds.max[0] - box.min[0]) / cellSize[0])),
    Math.min(15, Math.floor((bounds.max[1] - box.min[1]) / cellSize[1])),
    Math.min(15, Math.floor((bounds.max[2] - box.min[2]) / cellSize[2])),
  ];
  if (min[0] > max[0] || min[1] > max[1] || min[2] > max[2]) return;
  for (let x = min[0]; x <= max[0]; x++)
    for (let y = min[1]; y <= max[1]; y++) for (let z = min[2]; z <= max[2]; z++) visit(x, y, z);
}

function surfacesTouch(index: MeasureIndex, first: number, second: number, tolerance: number, box: Bounds) {
  const firstTriangles = index.partTriangles[first].filter((triangle) => triangleInBounds(triangle, box));
  const secondTriangles = index.partTriangles[second].filter((triangle) => triangleInBounds(triangle, box));
  if (!firstTriangles.length || !secondTriangles.length) return false;
  const product = firstTriangles.length * secondTriangles.length;
  const test = (a: Triangle, b: Triangle) => {
    if (boundsDistance({ min: a.min, max: a.max }, { min: b.min, max: b.max }) > tolerance) return false;
    const nearest = trianglePair(a, b);
    return nearest.overlap || nearest.distance <= tolerance;
  };
  if (product <= 32768) {
    for (const a of firstTriangles) for (const b of secondTriangles) if (test(a, b)) return true;
    return false;
  }
  const extent: Vec3 = [
    Math.max(0, box.max[0] - box.min[0]),
    Math.max(0, box.max[1] - box.min[1]),
    Math.max(0, box.max[2] - box.min[2]),
  ];
  const cellSize: Vec3 = [
    Math.max(tolerance, extent[0] / 16),
    Math.max(tolerance, extent[1] / 16),
    Math.max(tolerance, extent[2] / 16),
  ];
  const grid = new Map<string, number[]>();
  for (const triangle of secondTriangles)
    localCellRange(triangle, box, cellSize, (x, y, z) => {
      const key = cellKey(x, y, z);
      const bucket = grid.get(key);
      if (bucket) bucket.push(triangle.id);
      else grid.set(key, [triangle.id]);
    });
  for (const a of firstTriangles) {
    const stamp = ++index.stamp;
    const query = {
      min: [a.min[0] - tolerance, a.min[1] - tolerance, a.min[2] - tolerance] as Vec3,
      max: [a.max[0] + tolerance, a.max[1] + tolerance, a.max[2] + tolerance] as Vec3,
    };
    let contact = false;
    localCellRange(query, box, cellSize, (x, y, z) => {
      if (contact) return;
      for (const id of grid.get(cellKey(x, y, z)) ?? []) {
        if (index.scratch[id] === stamp) continue;
        index.scratch[id] = stamp;
        const b = index.triangles[id];
        if (test(a, b)) {
          contact = true;
          return;
        }
      }
    });
    if (contact) return true;
  }
  return false;
}

function pairContains(index: MeasureIndex, first: number, second: number) {
  const firstPoint = index.partTriangles[first][0]?.a;
  if (
    firstPoint &&
    index.partClosed[second] &&
    inside(firstPoint, index.partTriangles[second], index.partBounds[second])
  )
    return true;
  const secondPoint = index.partTriangles[second][0]?.a;
  return (
    !!secondPoint && index.partClosed[first] && inside(secondPoint, index.partTriangles[first], index.partBounds[first])
  );
}
export function looseClusters(index: MeasureIndex): { tolerance: number; main: number[]; loose: Loose[] } {
  const tolerance = Math.max(0.002, index.diagonal * 0.0025);
  const count = index.partTriangles.length;
  const parent = Array.from({ length: count }, (_, part) => part);
  const find = (part: number): number => {
    while (parent[part] !== part) {
      parent[part] = parent[parent[part]];
      part = parent[part];
    }
    return part;
  };
  const join = (a: number, b: number) => {
    const left = find(a),
      right = find(b);
    if (left !== right) parent[right] = left;
  };
  const active = index.partTriangles.map((triangles) => triangles.length > 0);
  const partBoxes = index.partBounds.map((bounds) => expandedBounds(bounds, tolerance));
  const entries = Array.from({ length: count }, (_, part) => part)
    .filter((part) => active[part])
    .sort((a, b) => partBoxes[a].min[0] - partBoxes[b].min[0]);
  const candidates: Array<{ first: number; second: number; volume: number }> = [];
  for (let i = 0; i < entries.length; i++) {
    const first = entries[i],
      firstBox = partBoxes[first];
    for (let j = i + 1; j < entries.length && partBoxes[entries[j]].min[0] <= firstBox.max[0]; j++) {
      const second = entries[j],
        secondBox = partBoxes[second];
      if (!boundsOverlap(firstBox, secondBox)) continue;
      const dx = Math.max(0, Math.min(firstBox.max[0], secondBox.max[0]) - Math.max(firstBox.min[0], secondBox.min[0]));
      const dy = Math.max(0, Math.min(firstBox.max[1], secondBox.max[1]) - Math.max(firstBox.min[1], secondBox.min[1]));
      const dz = Math.max(0, Math.min(firstBox.max[2], secondBox.max[2]) - Math.max(firstBox.min[2], secondBox.min[2]));
      candidates.push({ first, second, volume: dx * dy * dz });
    }
  }
  candidates.sort((a, b) => b.volume - a.volume);
  for (const candidate of candidates) {
    if (find(candidate.first) === find(candidate.second)) continue;
    if (boundsDistance(index.partBounds[candidate.first], index.partBounds[candidate.second]) > tolerance) continue;
    const box = overlapBounds(partBoxes[candidate.first], partBoxes[candidate.second]);
    if (
      surfacesTouch(index, candidate.first, candidate.second, tolerance, box) ||
      pairContains(index, candidate.first, candidate.second)
    )
      join(candidate.first, candidate.second);
  }
  const groups = new Map<number, number[]>();
  for (let part = 0; part < count; part++)
    if (active[part]) {
      const root = find(part);
      const members = groups.get(root) ?? [];
      members.push(part);
      groups.set(root, members);
    }
  const clusters = [...groups.values()]
    .map((parts) => ({ parts, area: parts.reduce((sum, part) => sum + index.areas[part], 0) }))
    .sort((a, b) => b.area - a.area);
  if (clusters.length <= 1) return { tolerance, main: clusters[0]?.parts ?? [], loose: [] };
  const main = clusters[0].parts;
  const loose = clusters.slice(1).map(({ parts, area }) => {
    const nearest = gap(index, parts, main);
    let minY = Infinity;
    for (const part of parts)
      for (const triangle of index.partTriangles[part])
        minY = Math.min(minY, triangle.a[1], triangle.b[1], triangle.c[1]);
    const flat = parts.every((part) => {
      const extent = index.partBounds[part];
      const size = [extent.max[0] - extent.min[0], extent.max[1] - extent.min[1], extent.max[2] - extent.min[2]];
      return Math.min(...size) < 0.02 * Math.max(...size);
    });
    return { parts, area, nearest, onFloor: Math.abs(minY) <= tolerance, flat };
  });
  return { tolerance, main, loose };
}
