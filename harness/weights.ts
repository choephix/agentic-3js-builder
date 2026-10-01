import type { Assembly } from "./assemble";
const LARGE_PART_DIAGONAL = 0.2;
const DOMINANT_BONE_SHARE = 0.9;
const MOVING_BONE_SHARE = 0.05;
const INSIDE_MARGIN = 0.2;
/** Share of a part's surface past a pivot, toward the pivot's child, for the pivot to count as bending inside it. */
const BEYOND_SHARE = 0.25;
type Point = [number, number, number];
type Triangle = { a: Point; b: Point; c: Point };
type PartVolume = { triangles: Triangle[]; edges: Map<string, number>; closed: boolean };

const pointKey = (point: Point) =>
  `${Math.round(point[0] * 1e5)},${Math.round(point[1] * 1e5)},${Math.round(point[2] * 1e5)}`;
const edgeKey = (a: Point, b: Point) => {
  const first = pointKey(a);
  const second = pointKey(b);
  return first < second ? `${first}|${second}` : `${second}|${first}`;
};
const triangleKey = (triangle: Triangle) =>
  [pointKey(triangle.a), pointKey(triangle.b), pointKey(triangle.c)].sort().join("|");
const subtract = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Point, b: Point) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Point, b: Point): Point => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

function pointInsideVolume(point: Point, volume: PartVolume, min: Point, max: Point) {
  if (
    point[0] < min[0] ||
    point[0] > max[0] ||
    point[1] < min[1] ||
    point[1] > max[1] ||
    point[2] < min[2] ||
    point[2] > max[2]
  )
    return false;
  const direction: Point = [1, 1.234567e-7, 2.345679e-7];
  let hits = 0;
  for (const triangle of volume.triangles) {
    const edge1 = subtract(triangle.b, triangle.a);
    const edge2 = subtract(triangle.c, triangle.a);
    const h = cross(direction, edge2);
    const determinant = dot(edge1, h);
    if (Math.abs(determinant) < 1e-12) continue;
    const inverse = 1 / determinant;
    const s = subtract(point, triangle.a);
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

/** Share of the volume's surface area on the far side of the plane through `pivot` facing `toward`. */
function beyond(volume: PartVolume, pivot: Point, toward: Point) {
  const direction = subtract(toward, pivot);
  let far = 0;
  let total = 0;
  for (const { a, b, c } of volume.triangles) {
    const area = Math.hypot(...cross(subtract(b, a), subtract(c, a))) / 2;
    const centre: Point = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
    total += area;
    if (dot(subtract(centre, pivot), direction) > 0) far += area;
  }
  return total > 0 ? far / total : 0;
}

/** Share of the given parts' vertex weight per bone, largest first. */
export function bonesOf(assembly: Assembly, parts: number[]): Array<{ bone: string; share: number }> {
  const positions = assembly.geometry.getAttribute("position");
  const partAttribute = assembly.geometry.getAttribute("_part");
  const skinIndex = assembly.geometry.getAttribute("skinIndex");
  const skinWeight = assembly.geometry.getAttribute("skinWeight");
  if (!positions || !partAttribute || !skinIndex || !skinWeight || !parts.length) return [];
  const wanted = new Set(parts);
  const sums = new Float64Array(assembly.joints.length);
  let total = 0;
  for (let vertex = 0; vertex < positions.count; vertex++) {
    const part = Math.round(partAttribute.getX(vertex));
    if (!wanted.has(part)) continue;
    for (let slot = 0; slot < 4; slot++) {
      const weight = skinWeight.getComponent(vertex, slot);
      const bone = skinIndex.getComponent(vertex, slot);
      if (bone < sums.length && weight > 0) {
        sums[bone] += weight;
        total += weight;
      }
    }
  }
  if (!(total > 0)) return [];
  const result: Array<{ bone: string; share: number }> = [];
  for (let bone = 0; bone < sums.length; bone++)
    if (sums[bone] > 0) result.push({ bone: assembly.joints[bone].name, share: sums[bone] / total });
  result.sort((a, b) => b.share - a.share || a.bone.localeCompare(b.bone));
  return result;
}

export type Stiff = { part: number; bone: string; share: number; joints: string[] };

/** Large parts moved (almost) entirely by one bone although other joints sit well inside them. */
export function stiffParts(assembly: Assembly): Stiff[] {
  const positions = assembly.geometry.getAttribute("position");
  const partAttribute = assembly.geometry.getAttribute("_part");
  const skinIndex = assembly.geometry.getAttribute("skinIndex");
  const skinWeight = assembly.geometry.getAttribute("skinWeight");
  if (!positions || !partAttribute || !skinIndex || !skinWeight || assembly.joints.length < 2) return [];
  const modelMin = assembly.bounds.min;
  const modelMax = assembly.bounds.max;
  const modelDiagonal = Math.hypot(modelMax[0] - modelMin[0], modelMax[1] - modelMin[1], modelMax[2] - modelMin[2]);
  if (!(modelDiagonal > 0)) return [];
  const mins = Array.from(
    { length: assembly.parts.length },
    () => [Infinity, Infinity, Infinity] as [number, number, number],
  );
  const maxs = Array.from(
    { length: assembly.parts.length },
    () => [-Infinity, -Infinity, -Infinity] as [number, number, number],
  );
  const counts = new Uint32Array(assembly.parts.length);
  const sums = Array.from({ length: assembly.parts.length }, () => new Float64Array(assembly.joints.length));
  for (let vertex = 0; vertex < positions.count; vertex++) {
    const part = Math.round(partAttribute.getX(vertex));
    if (part < 0 || part >= assembly.parts.length) continue;
    const x = positions.getX(vertex);
    const y = positions.getY(vertex);
    const z = positions.getZ(vertex);
    const min = mins[part];
    const max = maxs[part];
    if (x < min[0]) min[0] = x;
    if (y < min[1]) min[1] = y;
    if (z < min[2]) min[2] = z;
    if (x > max[0]) max[0] = x;
    if (y > max[1]) max[1] = y;
    if (z > max[2]) max[2] = z;
    counts[part]++;
    for (let slot = 0; slot < 4; slot++) {
      const weight = skinWeight.getComponent(vertex, slot);
      const bone = skinIndex.getComponent(vertex, slot);
      if (bone < assembly.joints.length && weight > 0) sums[part][bone] += weight;
    }
  }
  const candidates = new Uint8Array(assembly.parts.length);
  const dominantBones = new Int16Array(assembly.parts.length).fill(-1);
  const shares = new Float64Array(assembly.parts.length);
  const totals = new Float64Array(assembly.parts.length);
  for (let part = 0; part < assembly.parts.length; part++) {
    if (!counts[part]) continue;
    const min = mins[part];
    const max = maxs[part];
    const extentX = max[0] - min[0];
    const extentY = max[1] - min[1];
    const extentZ = max[2] - min[2];
    if (Math.hypot(extentX, extentY, extentZ) < modelDiagonal * LARGE_PART_DIAGONAL) continue;
    let dominant = -1;
    let dominantWeight = 0;
    let total = 0;
    for (let bone = 0; bone < assembly.joints.length; bone++) {
      const weight = sums[part][bone];
      total += weight;
      if (weight > dominantWeight) {
        dominantWeight = weight;
        dominant = bone;
      }
    }
    if (!(total > 0) || dominant < 0 || dominantWeight / total < DOMINANT_BONE_SHARE) continue;
    candidates[part] = 1;
    dominantBones[part] = dominant;
    shares[part] = dominantWeight / total;
    totals[part] = total;
  }
  // Keep unique triangles so double-sided parts still have one surface for the closed-volume parity test.
  const volumes = Array.from({ length: assembly.parts.length }, () => null as PartVolume | null);
  const seenTriangles = Array.from({ length: assembly.parts.length }, () => null as Set<string> | null);
  for (let part = 0; part < assembly.parts.length; part++) {
    if (!candidates[part]) continue;
    volumes[part] = { triangles: [], edges: new Map<string, number>(), closed: false };
    seenTriangles[part] = new Set<string>();
  }
  const addTriangle = (first: number, second: number, third: number) => {
    const part = Math.round(partAttribute.getX(first));
    if (part < 0 || part >= volumes.length || !candidates[part]) return;
    const triangle: Triangle = {
      a: [positions.getX(first), positions.getY(first), positions.getZ(first)],
      b: [positions.getX(second), positions.getY(second), positions.getZ(second)],
      c: [positions.getX(third), positions.getY(third), positions.getZ(third)],
    };
    const key = triangleKey(triangle);
    const seen = seenTriangles[part]!;
    if (seen.has(key)) return;
    seen.add(key);
    const volume = volumes[part]!;
    volume.triangles.push(triangle);
    for (const [a, b] of [
      [triangle.a, triangle.b],
      [triangle.b, triangle.c],
      [triangle.c, triangle.a],
    ] as Array<[Point, Point]>) {
      const edge = edgeKey(a, b);
      volume.edges.set(edge, (volume.edges.get(edge) ?? 0) + 1);
    }
  };
  const index = assembly.geometry.index;
  if (index)
    for (let i = 0; i + 2 < index.count; i += 3) addTriangle(index.getX(i), index.getX(i + 1), index.getX(i + 2));
  else for (let i = 0; i + 2 < positions.count; i += 3) addTriangle(i, i + 1, i + 2);
  for (const volume of volumes)
    if (volume)
      volume.closed = volume.triangles.length > 0 && [...volume.edges.values()].every((count) => count % 2 === 0);
  const hasChild = new Uint8Array(assembly.joints.length);
  const parentOf = assembly.joints.map((joint) =>
    assembly.joints.findIndex((candidate) => candidate.name === joint.parent),
  );
  for (const parent of parentOf) if (parent >= 0) hasChild[parent] = 1;
  // Only a joint below the part's bone pivots while the part stays put; an ancestor carries the whole part along.
  const below = (joint: number, bone: number) => {
    for (let at = parentOf[joint]; at >= 0; at = parentOf[at]) if (at === bone) return true;
    return false;
  };
  const stiff: Stiff[] = [];
  for (let part = 0; part < assembly.parts.length; part++) {
    const volume = volumes[part];
    if (!candidates[part] || !volume?.closed) continue;
    const min = mins[part];
    const max = maxs[part];
    const extentX = max[0] - min[0];
    const extentY = max[1] - min[1];
    const extentZ = max[2] - min[2];
    const dominant = dominantBones[part];
    const total = totals[part];
    const share = shares[part];
    const inside: string[] = [];
    for (let joint = 0; joint < assembly.joints.length; joint++) {
      if (
        !hasChild[joint] ||
        joint === dominant ||
        !below(joint, dominant) ||
        sums[part][joint] / total >= MOVING_BONE_SHARE
      )
        continue;
      const position = assembly.joints[joint].position;
      if (
        position[0] > min[0] + extentX * INSIDE_MARGIN &&
        position[0] < max[0] - extentX * INSIDE_MARGIN &&
        position[1] > min[1] + extentY * INSIDE_MARGIN &&
        position[1] < max[1] - extentY * INSIDE_MARGIN &&
        position[2] > min[2] + extentZ * INSIDE_MARGIN &&
        position[2] < max[2] - extentZ * INSIDE_MARGIN &&
        pointInsideVolume(position, volume, min, max) &&
        // The part reaches well past the pivot toward the joint's child (a torso above a spine pivot), not just around
        // the root of an appendage (an ear, trunk or turret rooted in a skull or shell).
        parentOf.some(
          (parent, child) =>
            parent === joint && beyond(volume, position, assembly.joints[child].position) >= BEYOND_SHARE,
        )
      )
        inside.push(assembly.joints[joint].name);
    }
    if (inside.length) stiff.push({ part, bone: assembly.joints[dominant].name, share, joints: inside });
  }
  stiff.sort((a, b) => b.share - a.share || b.part - a.part);
  return stiff;
}
