```ts
import * as THREE from "three";
import { createBuilder, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Elephant",
  description: "A stylised African elephant: rounded blocky body, pillar legs, big ears, long curling trunk and ivory tusks.",
};

export default function elephant() {
  const b = createBuilder({ name: "elephant" });

  const SKIN = mottle("#7b7d85", "#93959b", { size: 0.9, seed: 3, contrast: 0.8 });
  const EAR = mottle("#a98d92", "#c2a7a9", { size: 0.6, seed: 9, contrast: 0.6 });
  const IVORY = "#efe6cc";
  const DARK = "#17171a";
  const NAIL = "#e6dfcb";

  // ---- Skeleton -------------------------------------------------------------
  // Root: the pelvis. The spine runs pelvis -> chest -> neck -> head.
  b.joint("pelvis", { at: [0, 2.3, -1.0], dir: [0, 0.05, 1] });
  b.joint("chest", { parent: "pelvis", at: [0, 2.45, 0.6], dir: [0, 0.1, 1], role: "spine" });
  b.joint("neck", { parent: "chest", at: [0, 2.9, 1.2], dir: [0, 0.5, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 3.0, 1.5], dir: [0, -0.1, 1], role: "head" });

  // Legs: a shoulder/hip, a knee/elbow and a foot joint, one chain per leg.
  const leg = (side: "L" | "R", x: number, z: number, front: boolean) => {
    const s = side === "L" ? 1 : -1;
    const top = front ? 2.3 : 2.2;
    const parent = front ? "chest" : "pelvis";
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
      : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const knee = front ? [x, 1.2, z + 0.1] : [x, 1.2, z + 0.05];
    const foot = [x, 0.25, z + 0.05];
    const chain = b.chain(
      front ? `frontLeg${side}` : `hindLeg${side}`,
      [[x, top, z], knee, foot],
      { parent, names, role: "leg" },
    );
    b.sweep(chain, { radius: (t: number) => 0.27 - 0.07 * t, color: SKIN });

    // Round foot and three toenails along its front.
    const footName = names[2];
    b.part(new THREE.CylinderGeometry(0.27, 0.3, 0.3, b.segments(12)), SKIN, {
      at: [x, 0.15, z + 0.05],
      bone: footName,
    });
    for (const dx of [-0.12, 0, 0.12]) {
      b.part(new THREE.SphereGeometry(0.06, b.segments(6), b.segments(5)), NAIL, {
        at: [x + dx, 0.04, z + 0.33],
        bone: footName,
        scale: [1, 0.7, 0.8],
      });
    }
    return s;
  };
  leg("L", 0.6, 1.1, true);
  leg("R", -0.6, 1.1, true);
  leg("L", 0.55, -1.05, false);
  leg("R", -0.55, -1.05, false);

  // ---- Body -----------------------------------------------------------------
  // A lofted barrel from rump to chest, skinned across the pelvis and chest joints.
  b.loft(
    [
      { at: [0, 2.2, -1.45], w: 1.5, h: 1.75 },
      { at: [0, 2.15, -0.2], w: 1.85, h: 2.0 },
      { at: [0, 2.2, 0.7], w: 1.9, h: 2.0 },
      { at: [0, 2.4, 1.35], w: 1.25, h: 1.5 },
    ],
    { color: SKIN, bone: ["pelvis", "chest"], name: "body" },
  );

  // ---- Tail -----------------------------------------------------------------
  const tail = b.chain(
    "tail",
    [
      [0, 2.25, -1.6],
      [0, 2.05, -2.0],
      [0, 1.6, -2.2],
      [0, 1.2, -2.25],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, { radius: (t: number) => 0.09 - 0.05 * t, color: SKIN });
  b.part(new THREE.SphereGeometry(0.09, b.segments(7), b.segments(5)), DARK, {
    at: [0, 1.2, -2.25],
    bone: "tail3",
  });

  // ---- Head -----------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.6, b.segments(14), b.segments(10)), SKIN, {
    at: [0, 3.0, 1.6],
    bone: "head",
    scale: [0.95, 1, 1.1],
    name: "skull",
  });
  // Domed forehead, the bump that makes an elephant read at a glance.
  b.part(new THREE.SphereGeometry(0.38, b.segments(10), b.segments(8)), SKIN, {
    at: [0, 3.35, 1.5],
    bone: "head",
    scale: [1, 0.85, 0.9],
    name: "forehead",
  });

  // Ears: broad, flat discs hanging out to each side.
  for (const x of [0.62, -0.62]) {
    b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.05, b.segments(14)), EAR, {
      at: [x, 2.98, 1.35],
      rotation: [0, 0, 90],
      bone: "head",
      name: x > 0 ? "earL" : "earR",
    });
  }

  // Eyes.
  for (const x of [0.42, -0.42]) {
    b.part(new THREE.SphereGeometry(0.07, b.segments(8), b.segments(6)), DARK, {
      at: [x, 3.12, 2.1],
      bone: "head",
    });
  }

  // Tusks: ivory cones curving down and out from the upper lip.
  for (const x of [0.28, -0.28]) {
    b.spike([x, 2.7, 1.95], [x * 0.4, -0.45, 1], 0.9, 0.07, {
      color: IVORY,
      bone: "head",
      name: x > 0 ? "tuskL" : "tuskR",
    });
  }

  // ---- Trunk ----------------------------------------------------------------
  const trunk = b.chain(
    "trunk",
    [
      [0, 2.7, 2.0],
      [0, 2.2, 2.35],
      [0, 1.6, 2.45],
      [0, 1.0, 2.3],
    ],
    { parent: "head", names: ["trunk1", "trunk2", "trunk3"], role: "tentacle" },
  );
  b.sweep(trunk, { radius: (t: number) => 0.22 - 0.13 * t, color: SKIN, name: "trunk" });
  // Finger-like tip, a small dark pad at the end.
  b.part(new THREE.SphereGeometry(0.07, b.segments(7), b.segments(5)), DARK, {
    at: [0, 1.0, 2.3],
    bone: "trunk3",
  });

  return b.root;
}
```