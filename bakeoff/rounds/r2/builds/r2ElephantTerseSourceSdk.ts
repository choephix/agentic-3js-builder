import * as THREE from "three";
import { createBuilder, catmull, mottle, stripes, paint, mix } from "../../../../src/index";

export const meta = {
  name: "African Elephant",
  description: "Stylized rigged African elephant with a jointed trunk, ears, tusks, legs, tail and a separate jaw.",
};

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const SKIN = "#8b8984";
  const skin = mottle("#8d8b86", "#77746f", { size: 0.35, seed: 3 });
  const wrinkled = stripes(skin, "#6b6863", { size: 0.07, axis: "y", width: 0.3, wobble: 0.25, seed: 2 });
  const legSkin = mottle("#85827d", "#6f6c67", { size: 0.25, seed: 5 });

  b.joint("root", { at: [0, 2.0, -0.3] });

  // Spine and body
  const spine = b.chain(
    "spine",
    catmull([[0, 2.0, -1.35], [0, 2.1, -0.5], [0, 2.05, 0.3], [0, 2.1, 0.95]]),
    { parent: "root", role: "spine", count: 3, names: ["spine1", "spine2", "spine3"] },
  );
  b.sweep(spine, {
    radius: (t: number) => [0.5 + 0.2 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + 0.05, 0.72 + 0.23 * Math.sin(Math.PI * t)],
    color: skin,
    sides: 10,
  });

  // Neck and head
  const neck = b.chain("neck", [[0, 2.3, 0.9], [0, 2.5, 1.25]], {
    parent: "spine3", role: "neck", count: 1, names: ["neck", "head"],
  });
  b.sweep(neck, { radius: 0.45, color: skin, sides: 10 });
  const head = "head";
  b.part(new THREE.SphereGeometry(0.5, 12, 9), skin, { at: [0, 2.5, 1.4], bone: head, scale: [0.85, 1, 0.9] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.27, 9, 7), skin, { at: [0.2 * s, 2.88, 1.3], bone: head });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), "#1c1a19", { at: [0.41 * s, 2.58, 1.6], bone: head });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), skin, { at: [0.3 * s, 2.15, 1.6], bone: head });
  }

  // Jaw
  b.joint("jaw", { parent: head, at: [0, 2.05, 1.45], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.34, 0.12, 0.34), "#6d6a65", { at: [0, 1.99, 1.62], bone: "jaw" });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.2), "#d9a0a0", { at: [0, 2.06, 1.62], bone: "jaw" });

  // Trunk
  const trunk = b.chain(
    "trunk",
    catmull([[0, 2.25, 1.75], [0, 1.85, 2.05], [0, 1.25, 2.2], [0, 0.65, 2.2], [0, 0.25, 2.3], [0, 0.12, 2.6]]),
    { parent: head, role: "tentacle", count: 5 },
  );
  b.sweep(trunk, { radius: (t: number) => 0.22 - 0.14 * t, color: wrinkled, sides: 8 });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.06), "#6b6863", { at: [0, 0.07, 2.62], bone: "trunk5" });

  // Ears
  const earOutline: Array<[number, number]> = [[0, 0.35], [0.25, 0.46], [0.55, 0.3], [0.68, -0.1], [0.47, -0.55], [0.2, -0.62], [0.05, -0.3]];
  const earSkin = mottle("#938f89", "#a38f8a", { size: 0.2, seed: 8 });
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [0.4 * s, 2.7, 1.2],
      x: [0.4 * s, 0, -1],
      y: [0, 1, 0],
      thickness: 0.04,
      smoothing: 1,
      color: earSkin,
      bone: head,
      name: s > 0 ? "earL" : "earR",
    });
  }

  // Tusks
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[0.22 * s, 2.05, 1.7], [0.3 * s, 1.8, 2.0], [0.33 * s, 1.65, 2.45], [0.28 * s, 1.75, 2.85]]),
      { radius: [0.075, 0.012], color: "#efe7d2", bone: head, sides: 6 },
    );
  }

  // Legs
  const leg = (s: number, z: number, names: string[], parent: string) => {
    const c = b.chain(
      names[0] + "Chain",
      catmull([[0.5 * s, 1.7, z], [0.5 * s, 0.85, z + 0.03], [0.5 * s, 0.18, z]]),
      { parent, role: "leg", names },
    );
    b.sweep(c, { radius: (t: number) => 0.32 - 0.07 * t, color: legSkin, sides: 8 });
    const foot = names[2];
    b.part(new THREE.CylinderGeometry(0.29, 0.32, 0.2, 10), legSkin, { at: [0.5 * s, 0.1, z], bone: foot });
    for (let k = 0; k < 4; k++) {
      const a = (k - 1.5) * 0.5;
      b.part(new THREE.BoxGeometry(0.1, 0.09, 0.06), "#d8cfc0", {
        at: [0.5 * s + 0.3 * Math.sin(a), 0.07, z + 0.3 * Math.cos(a)],
        rotation: [0, (a * 180) / Math.PI, 0],
        bone: foot,
      });
    }
  };
  leg(1, 0.6, ["shoulderL", "elbowL", "footFL"], "spine3");
  leg(-1, 0.6, ["shoulderR", "elbowR", "footFR"], "spine3");
  leg(1, -0.9, ["hipL", "kneeL", "footBL"], "spine1");
  leg(-1, -0.9, ["hipR", "kneeR", "footBR"], "spine1");

  // Tail
  const tail = b.chain("tail", catmull([[0, 2.4, -1.8], [0, 2.0, -1.97], [0, 1.5, -1.97], [0, 1.1, -1.9]]), {
    parent: "spine1", role: "tail", count: 3,
  });
  b.sweep(tail, { radius: [0.065, 0.03], color: SKIN, sides: 6 });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    b.spike([0, 1.1, -1.9], [0.12 * Math.cos(a), -1, 0.12 * Math.sin(a) - 0.05], 0.22, 0.025, { color: "#3a3532", bone: "tail3" });
  }

  return b.root;
}
