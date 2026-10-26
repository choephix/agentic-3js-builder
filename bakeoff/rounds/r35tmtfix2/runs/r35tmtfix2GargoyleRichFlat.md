Cause: nullable chain tips/bone handles were passed as joint references, `Vector3` values were used as indexed tuples or ring frames, and one unused type import remained.

```ts
<<<<<<< SEARCH
import type { ColorInput } from "agentic-3js-builder";
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: neck.tip,
=======
  const head = b.joint("head", {
    parent: neck,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = hornPath.at(t);
    b.ring(p, { count: 6, radius: 0.005, tilt: 18 }, (r: any) =>
=======
    const p = hornPath.at(t);
    b.ring(frame(p, hornPath.tangentAt(t)), { count: 6, radius: 0.005, tilt: 18 }, (r: any) =>
>>>>>>> REPLACE

<<<<<<< SEARCH
    const paw = leg.at(1).at;
    sphere(0.105, STONE_LIGHT, paw, [1.3, 0.6, 1.45], leg.tip, "broad_paw");
    box([0.18, 0.08, 0.24], STONE_DARK, [paw[0], 0.285, paw[2] + 0.07], leg.tip, "paw_sole");

    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [
        paw[0] + i * 0.055,
        0.31,
        paw[2] + 0.115,
      ];
      const tip: [number, number, number] = [
        paw[0] + i * 0.075,
        0.285,
        paw[2] + 0.26 + Math.abs(i) * 0.025,
      ];
=======
    const paw = leg.at(1).at;
    const foot = leg.tip!;
    sphere(0.105, STONE_LIGHT, paw, [1.3, 0.6, 1.45], foot, "broad_paw");
    box([0.18, 0.08, 0.24], STONE_DARK, [paw.x, 0.285, paw.z + 0.07], foot, "paw_sole");

    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [
        paw.x + i * 0.055,
        0.31,
        paw.z + 0.115,
      ];
      const tip: [number, number, number] = [
        paw.x + i * 0.075,
        0.285,
        paw.z + 0.26 + Math.abs(i) * 0.025,
      ];
>>>>>>> REPLACE

<<<<<<< SEARCH
      toe(base, tip, leg.tip, 1, "rear_claw");
      sphere(0.038, STONE_LIGHT, base, [1, 0.7, 1], leg.tip, "toe_knuckle");
=======
      toe(base, tip, foot, 1, "rear_claw");
      sphere(0.038, STONE_LIGHT, base, [1, 0.7, 1], foot, "toe_knuckle");
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(0.105, STONE_LIGHT, leg.at(0.42).at, [1.05, 0.92, 0.9], leg.joints[1], "knee_cap");
    box([0.12, 0.18, 0.035], EDGE, leg.at(0.57).at, leg.joints[1], "shin_chisel");
=======
    sphere(0.105, STONE_LIGHT, leg.at(0.42).at, [1.05, 0.92, 0.9], leg.joints[1]!, "knee_cap");
    box([0.12, 0.18, 0.035], EDGE, leg.at(0.57).at, leg.joints[1]!, "shin_chisel");
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(0.105, STONE_LIGHT, arm.tip.at, [1.25, 0.8, 1.15], arm.tip, "gripping_hand");

    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [
        arm.tip.at.x + i * 0.043,
        arm.tip.at.y - 0.015,
        arm.tip.at.z + 0.035,
      ];
      const end: [number, number, number] = [
        arm.tip.at.x + i * 0.06,
        0.35,
        arm.tip.at.z + 0.18 + Math.abs(i) * 0.035,
      ];
      toe(base, end, arm.tip, 0.82, "front_claw");
    }
=======
    const hand = arm.tip!;
    sphere(0.105, STONE_LIGHT, hand.at, [1.25, 0.8, 1.15], hand, "gripping_hand");

    for (let i = -1; i <= 1; i++) {
      const base: [number, number, number] = [
        hand.at.x + i * 0.043,
        hand.at.y - 0.015,
        hand.at.z + 0.035,
      ];
      const end: [number, number, number] = [
        hand.at.x + i * 0.06,
        0.35,
        hand.at.z + 0.18 + Math.abs(i) * 0.035,
      ];
      toe(base, end, hand, 0.82, "front_claw");
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: wing.at(t).bone,
=======
        bone: wing.at(t).bone ?? wing.joints[0],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: tail.at(t).bone,
=======
      bone: tail.at(t).bone ?? tail.joints[0],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: spine.at(0.18 + i * 0.15).bone,
=======
      bone: spine.at(0.18 + i * 0.15).bone ?? spine.joints[0],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: wing.at(t).bone,
=======
      bone: wing.at(t).bone ?? wing.joints[0],
>>>>>>> REPLACE
```