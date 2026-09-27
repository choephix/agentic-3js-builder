// `fan()`: many repeated appendages (quills, train feathers, frill ribs, gill stalks, starfish arms) spread about an
// axis and owned by a few bank joints, so the joint count is a number you choose instead of one per item.
import { Vector3 } from "three";
import { resolveJoint } from "./context";
import type { Ctx, JointRef } from "./context";
import { DEG, vec } from "./math";
import type { V3 } from "./math";
import { sideOf, tuple } from "./rig";
import type { Role } from "./rig";
import { Capture, createJoint } from "./skeleton";
import type { Joint } from "./skeleton";

export type FanOptions = {
  parent: JointRef;
  /** Pivot on the axis. Items start `radius` out from it. */
  at: V3;
  axis: V3;
  /** Direction of the first item. A component along `axis` tilts every item into a cone (quill rings on a ball). */
  from: V3;
  /** Spread from the first item to the last, right-hand rule about `axis`. 360 = evenly all round. */
  angleDeg: number;
  count: number;
  /** Bank joints (default: one per 4 items). Each owns a contiguous run of items. */
  banks?: number;
  /** Item base distance from the pivot (default 0: every item starts at the pivot). */
  radius?: number;
  /** Bank joint names from index 0 (default `${name}1..K`). */
  names?: readonly string[] | ((i: number) => string);
  group?: string;
  /** Rig answer key: what the fan is (default "fan"). */
  role?: Role;
};

/** One item: index, position across the fan (0..1), base point, outward direction and owning bank joint. */
export type FanItem = { i: number; t: number; p: Vector3; dir: Vector3; joint: Joint; bank: number };

export class Fan {
  constructor(
    /** The bank joints: the fan's whole joint cost. */
    readonly banks: readonly Joint[],
    private readonly built: readonly FanItem[],
    private readonly capture: Capture,
  ) {}

  /** Every item in the current pose (items follow their bank). */
  get items(): FanItem[] {
    return this.built.map((item) => {
      const motion = this.capture.motion(item.joint);
      return { ...item, p: item.p.clone().applyMatrix4(motion), dir: item.dir.clone().transformDirection(motion) };
    });
  }
}

/**
 * Spread `count` items over `angleDeg` about `axis` and give each run of about count/banks items one bank joint.
 * Bank joints sit `radius` out along their run's centre direction, +Y along it and +Z toward `axis`, so posing a
 * bank about its local X raises or folds its run out of the fan plane and about its local Z swings it within.
 * `build(item)` makes the item's geometry on `item.joint`.
 *
 * Tradeoff (rigid skinning): items move with their bank, so when banks rotate apart, neighbouring items on
 * different banks separate in steps. 3-5 items per bank reads as a smooth fan for moderate poses; 1 per bank
 * is fully articulated and costs a joint per item.
 */
export function fan(ctx: Ctx, name: string, options: FanOptions, build: (item: FanItem) => void) {
  const { count } = options;
  const bankCount = options.banks ?? Math.ceil(count / 4);
  if (!(count >= 1) || !(bankCount >= 1) || bankCount > count)
    throw new Error(`fan "${name}": needs 1 <= banks (${bankCount}) <= count (${count})`);
  const parent = resolveJoint(ctx, options.parent);
  const pivot = vec(options.at);
  const axis = vec(options.axis).normalize();
  const from = vec(options.from).normalize();
  const radius = options.radius ?? 0;
  const full = Math.abs(options.angleDeg) >= 360 - 1e-9;
  const angleOf = (i: number) => options.angleDeg * (full ? i / count : count === 1 ? 0.5 : i / (count - 1)) * DEG;
  const bankOf = (i: number) => Math.floor((i * bankCount) / count);
  const dirAt = (angle: number) => from.clone().applyAxisAngle(axis, angle);
  const { names } = options;

  const banks: Joint[] = [];
  for (let k = 0; k < bankCount; k++) {
    const run = Array.from({ length: count }, (_, i) => i).filter((i) => bankOf(i) === k);
    const dir = dirAt(run.reduce((sum, i) => sum + angleOf(i), 0) / run.length);
    banks.push(
      createJoint(ctx, names === undefined ? `${name}${k + 1}` : typeof names === "function" ? names(k) : names[k], {
        parent,
        at: pivot.clone().addScaledVector(dir, radius),
        dir,
        up: axis,
        group: options.group,
      }),
    );
  }

  const items = Array.from({ length: count }, (_, i): FanItem => {
    const dir = dirAt(angleOf(i));
    return {
      i,
      t: count === 1 ? 0.5 : i / (count - 1),
      p: pivot.clone().addScaledVector(dir, radius),
      dir,
      joint: banks[bankOf(i)],
      bank: bankOf(i),
    };
  });
  const capture = new Capture([parent, ...banks]);
  const result = new Fan(banks, items, capture);
  for (const item of result.items) build(item);

  ctx.rig.push(() => {
    const motion = capture.motion(parent);
    return {
      fan: {
        name,
        role: options.role ?? "fan",
        side: sideOf(banks),
        pivot: tuple(pivot.clone().applyMatrix4(motion)),
        axis: tuple(axis.clone().transformDirection(motion)),
        banks: banks.map((joint, k) => ({ joint: joint.name, items: items.filter((item) => item.bank === k).length })),
      },
    };
  });
  return result;
}
