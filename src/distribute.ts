// Placement helpers without geometry: rings around any axis and evenly spaced stations along a source.
import { Vector3 } from "three";
import { flatten, vec } from "./math";
import type { V3 } from "./math";
import { toPath } from "./path";
import type { PathLike } from "./path";
import { Chain } from "./skeleton";
import type { ChainPoint } from "./skeleton";
import { Sweep } from "./sweep";
import type { SweepPoint } from "./sweep";

/**
 * `count` points on a circle of `radius` around `axis` through `center`. Angle 0 is the in-plane direction
 * closest to world +Y (world +Z when the axis is vertical); angles increase counter-clockwise about `axis`.
 */
export function ring(
  center: V3,
  axis: V3,
  radius: number,
  count: number,
  fn: (p: Vector3, outward: Vector3, i: number) => void,
  options: { startDeg?: number } = {},
) {
  const a = vec(axis).normalize();
  let u = flatten(new Vector3(0, 1, 0), a);
  if (u.lengthSq() < 1e-8) u = flatten(new Vector3(0, 0, 1), a);
  u.normalize();
  const v = a.clone().cross(u);
  const c = vec(center);
  for (let i = 0; i < count; i++) {
    const angle = ((options.startDeg ?? 0) * Math.PI) / 180 + (2 * Math.PI * i) / count;
    const outward = u.clone().multiplyScalar(Math.cos(angle)).addScaledVector(v, Math.sin(angle));
    fn(c.clone().addScaledVector(outward, radius), outward, i);
  }
}

export type PathPoint = { t: number; p: Vector3; tangent: Vector3 };
type AlongOptions = { from?: number; to?: number };

/**
 * `count` evenly spaced stations at the centres of equal parts of [from, to] (default 0..1):
 * Chain → point + frame + joint; Sweep → point on the tube's top surface + normal + joint; Path → point + tangent.
 */
export function along(
  source: Chain,
  count: number,
  fn: (at: ChainPoint, i: number) => void,
  options?: AlongOptions,
): void;
export function along(
  source: Sweep,
  count: number,
  fn: (at: SweepPoint, i: number) => void,
  options?: AlongOptions,
): void;
export function along(
  source: PathLike,
  count: number,
  fn: (at: PathPoint, i: number) => void,
  options?: AlongOptions,
): void;
export function along(
  source: Chain | Sweep | PathLike,
  count: number,
  fn: (at: never, i: number) => void,
  options: AlongOptions = {},
) {
  const from = options.from ?? 0;
  const to = options.to ?? 1;
  const path = source instanceof Chain || source instanceof Sweep ? null : toPath(source);
  for (let i = 0; i < count; i++) {
    const t = from + ((to - from) * (i + 0.5)) / count;
    const at = path ? { t, p: path.at(t), tangent: path.tangentAt(t) } : (source as Chain | Sweep).at(t);
    (fn as (at: unknown, i: number) => void)(at, i);
  }
}
