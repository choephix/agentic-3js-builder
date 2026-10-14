import * as THREE from "three";
import { createBuilder, catmull, patches, countershade, paint } from "../../../../src/index";

export const meta = {
  name: "Giraffe",
  description: "Stylized rigged giraffe with patchwork coat, long neck, ossicones, mane and hooves, in a rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "giraffe" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const coat = patches(
    countershade("#dcc08a", "#efe0b8", { level: -0.2, soft: 0.4 }),
    ["#8f4d22", "#a65f2b", "#76401c"],
    { size: 0.4, gap: 0.09, seed: 5 },
  );
  const legCoat = paint((p) => (p.y < 0.8 ? "#e6d3a3" : coat));
  const headCoat = paint((p) => (p.z > 2.3 ? "#7a6552" : coat));
  const DARK = "#3a2414";

  // Skeleton
  b.joint("root", { at: [0, 2.5, -0.2] });
  const spine = b.chain("spine", catmull([[0, 2.5, -1.0], [0, 2.62, -0.2], [0, 2.75, 0.6]]), {
    parent: "root",
    role: "spine",
    names: ["spine1", "spine2", "chest"],
  });
  const neck = b.chain(
    "neck",
    catmull([[0, 2.75, 0.6], [0, 3.4, 1.0], [0, 4.1, 1.5], [0, 4.62, 1.85]]),
    { parent: "chest", role: "neck", names: ["neck1", "neck2", "neck3", "head"] },
  );
  b.joint("jaw", { parent: "head", at: [0, 4.58, 1.95], dir: [0, 0, 1], role: "jaw" });

  // Body
  b.loft(
    [
      { at: [0, 2.45, -1.05], w: 0.5, h: 0.8 },
      { at: [0, 2.55, -0.5], w: 0.62, h: 1.0 },
      { at: [0, 2.65, 0.2], w: 0.64, h: 1.15 },
      { at: [0, 2.82, 0.68], w: 0.55, h: 1.0 },
    ],
    { bone: spine, color: coat, name: "body" },
  );
  b.sweep(neck, (t) => 0.25 - 0.14 * t, { color: coat, extend: [0.15, 0], name: "neck" });

  // Legs
  const leg = (s: number, front: boolean) => {
    const sd = s > 0 ? "L" : "R";
    const x = s * 0.27;
    const pts = front
      ? [[x, 2.4, 0.5], [x, 1.25, 0.55], [x, 0.28, 0.56], [x, 0.12, 0.56]]
      : [[x, 2.4, -0.85], [x, 1.55, -0.7], [x, 0.98, -0.92], [x, 0.28, -0.86], [x, 0.12, -0.85]];
    const names = front
      ? [`shoulder${sd}`, `knee${sd}`, `fetlockF${sd}`, `hoofF${sd}`]
      : [`hip${sd}`, `stifle${sd}`, `hock${sd}`, `fetlockH${sd}`, `hoofH${sd}`];
    const c = b.chain(`leg${front ? "F" : "H"}${sd}`, catmull(pts), {
      parent: front ? "spine2" : "root",
      role: "leg",
      names,
    });
    b.sweep(c, front ? [0.15, 0.1, 0.075, 0.06, 0.075] : [0.17, 0.11, 0.08, 0.06, 0.075], {
      color: legCoat,
    });
    const z = pts[pts.length - 1][2];
    b.part(new THREE.BoxGeometry(0.15, 0.14, 0.22), "#2b2220", {
      at: [x, 0.07, z + 0.02],
      bone: names[names.length - 1],
    });
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 2.6, -1.05], [0, 2.0, -1.25], [0, 1.4, -1.3]]), {
    parent: "root",
    role: "tail",
    names: ["tail1", "tail2", "tail3"],
  });
  b.sweep(tail, [0.045, 0.03, 0.025], { color: coat });
  b.capsule([0, 1.45, -1.3], [0, 0.95, -1.3], [0.05, 0.04], { color: DARK, bone: "tail3" });

  // Head
  b.loft(
    [
      { at: [0, 4.72, 1.84], w: 0.22, h: 0.28 },
      { at: [0, 4.7, 2.15], w: 0.2, h: 0.2 },
      { at: [0, 4.63, 2.4], w: 0.17, h: 0.16 },
      { at: [0, 4.6, 2.52], w: 0.19, h: 0.15 },
    ],
    { bone: "head", color: headCoat, name: "skull" },
  );
  b.loft(
    [
      { at: [0, 4.54, 1.98], w: 0.13, h: 0.07 },
      { at: [0, 4.5, 2.3], w: 0.14, h: 0.08 },
      { at: [0, 4.48, 2.5], w: 0.16, h: 0.08 },
    ],
    { bone: "jaw", color: "#7a6552", name: "lowerJaw" },
  );

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.045, 6, 5), "#140c08", { at: [s * 0.115, 4.8, 2.0], bone: "head" });
    b.part(new THREE.SphereGeometry(0.012, 4, 3), "#ffffff", { at: [s * 0.15, 4.82, 2.03], bone: "head" });
    // nostrils
    b.part(new THREE.SphereGeometry(0.02, 4, 3), "#1e1410", { at: [s * 0.05, 4.62, 2.6], bone: "head" });
    // ears
    b.part(new THREE.SphereGeometry(0.1, 6, 5), "#9a6a3c", {
      at: [s * 0.2, 4.85, 1.82],
      rotation: [0, 0, -s * 60],
      scale: [0.4, 1.3, 0.7],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.07, 5, 4), "#e8a79a", {
      at: [s * 0.22, 4.86, 1.84],
      rotation: [0, 0, -s * 60],
      scale: [0.2, 1.2, 0.5],
      bone: "head",
    });
    // ossicones
    b.capsule([s * 0.07, 4.85, 1.8], [s * 0.09, 5.18, 1.74], [0.04, 0.028], { color: "#b08a5a", bone: "head" });
    b.part(new THREE.SphereGeometry(0.055, 6, 5), DARK, { at: [s * 0.09, 5.21, 1.74], bone: "head" });
  }
  b.capsule([0, 4.82, 2.0], [0, 4.92, 2.04], [0.03, 0.02], { color: "#b08a5a", bone: "head" });

  // Mane along the back of the neck
  const maneGeo = new THREE.BoxGeometry(0.045, 0.15, 0.06);
  for (let i = 0; i < 15; i++) {
    const t = 0.04 + (i / 14) * 0.94;
    const p = neck.at(t).at;
    const r = 0.25 - 0.14 * t;
    b.part(maneGeo, i % 2 ? "#3a2414" : "#5a361c", {
      at: V(p.x, p.y + 0.04, p.z - r * 0.95),
      rotation: [-35, 0, 0],
      bone: neck.jointAt(t),
    });
  }

  return b.root;
}
