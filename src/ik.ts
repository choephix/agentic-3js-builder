// Limb IK: joint positions for a chain of fixed segment lengths that ends exactly on a target (feet planted on
// the floor). One solver for 2-bone arms, digitigrade 3-segment hind legs, 4-segment insect legs and curls.
import { Vector3 } from "three";
import { flatten, toDirection, toPoint } from "./math";
import type { DirectionInput, PointInput } from "./math";

/** In-plane segment angles for equal turns of `k` radians, each joint turning away from its side. */
function turned(sides: readonly number[], k: number) {
  const angles = [0];
  for (const side of sides) angles.push(angles[angles.length - 1] - side * k);
  return angles;
}

/** End of a planar chain with these segment angles, as [along, across]. */
function end(lengths: readonly number[], angles: readonly number[]) {
  let x = 0;
  let y = 0;
  lengths.forEach((l, i) => {
    x += l * Math.cos(angles[i]);
    y += l * Math.sin(angles[i]);
  });
  return [x, y] as const;
}

/**
 * Equal-turn fold: every joint turns by the same angle toward its side, and the whole chain rotates so it ends on
 * the line at `dist`. Too far: straight. Too close: folded as far as equal turns go. Angles are from the line.
 */
function fold(lengths: readonly number[], sides: readonly number[], dist: number) {
  const reach = (k: number) => Math.hypot(...end(lengths, turned(sides, k)));
  let k = 0;
  if (dist < lengths.reduce((sum, l) => sum + l, 0)) {
    let previous = 0;
    let tightest = 0;
    k = NaN;
    for (let i = 1; i <= 90 && Number.isNaN(k); i++) {
      const next = (i / 90) * Math.PI;
      if (reach(next) <= dist) {
        let lo = previous;
        let hi = next;
        for (let n = 0; n < 50; n++) {
          const m = (lo + hi) / 2;
          if (reach(m) > dist) lo = m;
          else hi = m;
        }
        k = (lo + hi) / 2;
      } else if (reach(next) < reach(tightest)) tightest = next;
      previous = next;
    }
    if (Number.isNaN(k)) k = tightest;
  }
  const angles = turned(sides, k);
  const [x, y] = end(lengths, angles);
  const rotation = -Math.atan2(y, x);
  return angles.map((angle) => angle + rotation);
}

/**
 * Joint positions `[root, ..., end]` for segments of exactly `lengths` from `root` to `target`. `bends` is one
 * direction per inner joint (or one for all) saying which way that joint points: alternate them for a digitigrade
 * leg (knee forward, hock back). The limb is planar: the plane holds root, target and the first hint.
 *
 * Rule for the extra freedom of 3+ segments: the last segment runs parallel to root→target (a vertical cannon
 * under a hip) when that respects its hint and reach; otherwise every joint turns by the same angle. Out of reach:
 * straight toward the target. `sole`: the last segment points exactly along `sole` (a flat foot along the floor)
 * and the rest solves to its heel; the joint above the sole segment is set by `sole`, so it takes one bend hint
 * fewer. With two lengths this is classic two-bone IK.
 */
export function limb(
  root: PointInput,
  target: PointInput,
  lengths: readonly number[],
  bends: DirectionInput | readonly DirectionInput[],
  options: { sole?: DirectionInput } = {},
): Vector3[] {
  const n = lengths.length;
  const hints =
    Array.isArray(bends) && typeof bends[0] !== "number"
      ? (bends as readonly DirectionInput[]).map((d) => toDirection(d, "limb()"))
      : lengths.slice(1).map(() => toDirection(bends as DirectionInput, "limb()"));
  const needed = options.sole ? n - 2 : n - 1;
  if (hints.length < needed)
    throw new Error(
      `limb(): ${needed} bend hints needed (one per inner joint${options.sole ? " above the sole segment" : ""}), got ${hints.length}`,
    );
  if (options.sole) {
    const sole = toDirection(options.sole, "limb()").normalize();
    const last = lengths[n - 1];
    const upper = limb(
      root,
      toPoint(target, "limb()").addScaledVector(sole, -last),
      lengths.slice(0, -1),
      hints.slice(0, n - 2),
    );
    return [...upper, upper[upper.length - 1].clone().addScaledVector(sole, last)];
  }
  const a = toPoint(root, "limb()");
  const toTarget = toPoint(target, "limb()").sub(a);
  const d = toTarget.length();
  const dir = d > 1e-9 ? toTarget.normalize() : new Vector3(0, -1, 0);
  let across = flatten(hints[0] ?? new Vector3(0, 0, 1), dir);
  if (across.lengthSq() < 1e-10) across = flatten(new Vector3(0, 0, 1), dir);
  if (across.lengthSq() < 1e-10) across = flatten(new Vector3(1, 0, 0), dir);
  across.normalize();
  const sides = hints.slice(0, n - 1).map((h) => Math.sign(flatten(h, dir).dot(across)) || 1);

  let angles = fold(lengths, sides, d);
  if (n >= 3) {
    const upperLengths = lengths.slice(0, -1);
    const heel = d - lengths[n - 1];
    const upper = fold(upperLengths, sides.slice(0, -1), heel);
    const [x, y] = end(upperLengths, upper);
    const reached = heel > 0 && Math.abs(x - heel) < 1e-6 && Math.abs(y) < 1e-6;
    const lean = upper[upper.length - 1];
    if (reached && (Math.abs(lean) < 1e-9 || Math.sign(lean) === sides[n - 2])) angles = [...upper, 0];
  }
  const points = [a];
  angles.forEach((angle, i) => {
    const step = dir.clone().multiplyScalar(Math.cos(angle)).addScaledVector(across, Math.sin(angle));
    points.push(points[i].clone().addScaledVector(step, lengths[i]));
  });
  return points;
}
