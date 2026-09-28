// The rig answer key: what the SDK knows about the skeleton's semantics (limb kinds, sides, ground contacts,
// hinges, ring joint groups), written to `root.userData.rig` so a benchmark can score auto-riggers against it.
import type { Vector3 } from "three";
import type { Joint } from "./skeleton";

/** What a joint, chain or ring group is. "jaw" and "hinge" (lids, wing cases, flaps) record their hinge axis. */
export type Role =
  | "spine"
  | "neck"
  | "head"
  | "jaw"
  | "hinge"
  | "tail"
  | "leg"
  | "arm"
  | "wing"
  | "digit"
  | "tentacle"
  | "fan";

/** "L" = the creature's left (+X), "R" = right (-X), "C" = on the mid-plane. */
export type Side = "L" | "R" | "C";
type Tuple = [number, number, number];

export type RigChain = { name: string; role: Role; side: Side; joints: string[]; contact?: Tuple };
export type RigJoint = { name: string; role: Role; side: Side; hinge?: Tuple };
/** A `ring(..., { joints })` group: items spread about `axis` through `pivot`, each run owned by one joint. */
export type RigRing = {
  name: string;
  role: Role;
  side: Side;
  pivot: Tuple;
  axis: Tuple;
  joints: Array<{ joint: string; items: number }>;
};
export type RigRecord = { chain: RigChain } | { joint: RigJoint } | { ring: RigRing };

/** `userData.rig` on the root. Model space, meters: +Y up, the creature faces +Z, its left is +X. */
export type RigBlock = { version: 1; chains: RigChain[]; joints: RigJoint[]; rings: RigRing[] };

export const tuple = (v: Vector3): Tuple => [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)];

/** "L" / "R" when every joint currently sits on that side of the mid-plane (1 mm margin), else "C". */
export function sideOf(joints: readonly Joint[]): Side {
  const xs = joints.map((joint) => joint.at.x);
  return xs.every((x) => x > 1e-3) ? "L" : xs.every((x) => x < -1e-3) ? "R" : "C";
}

/** Evaluate every registered record against the current pose. */
export function rigBlock(records: ReadonlyArray<() => RigRecord>): RigBlock {
  const block: RigBlock = { version: 1, chains: [], joints: [], rings: [] };
  for (const record of records.map((read) => read())) {
    if ("chain" in record) block.chains.push(record.chain);
    else if ("joint" in record) block.joints.push(record.joint);
    else block.rings.push(record.ring);
  }
  return block;
}
