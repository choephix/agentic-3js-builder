```ts
import * as THREE from "three";
import { createBuilder, frame, rng, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Hedgehog",
  description:
    "A stylized European hedgehog: a painted loft body, a few hundred scattered cone quills, a pointed snout with a separate jaw, ears, four short legs with toes, and a rigged skeleton.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "hedgehog" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const DARK = "#3b2a20";
  const TAN = "#c9a574";
  const CREAM = "#ead9b8";
  const SKIN = "#d99a8a";
  const BLACK = "#14100d";

  // ---- skeleton ----
  const root = b.joint("root", { at: [0, 0.07, 0], dir: [0, 0, 1], role: "spine" });
  b.joint("spine", { parent: root, at: [0, 0.07, -0.06], dir: [0, 0, -1], role: "spine" });
  b.joint("tail1", { parent: "spine", at: [0, 0.055, -0.14], dir: [0, -0.2, -1], role: "tail" });
  b.joint("neck", { parent: root, at: [0, 0.065, 0.07], dir: [0, 0, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.06, 0.1], dir: [0, -0.1, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.04, 0.115], dir: [0, 0, 1], role: "jaw" });
  b.joint("earL", { parent: "head", at: [0.035, 0.088, 0.1], dir: [0.5, 1, 0] });
  b.joint("earR", { parent: "head", at: [-0.035, 0.088, 0.1], dir: [-0.5, 1, 0] });

  // ---- body ----
  const body = b.loft(
    [
      { at: [0, 0.055, -0.145], w: 0.03, h: 0.03 },
      { at: [0, 0.07, -0.11], w: 0.12, h: 0.11 },
      { at: [0, 0.085, -0.02], w: 0.175, h: 0.15 },
      { at: [0, 0.08, 0.05], w: 0.15, h: 0.13 },
      { at: [0, 0.065, 0.1], w: 0.08, h: 0.075 },
    ],
    { color: countershade(DARK, CREAM, { level: -0.1, soft: 0.3 }), bone: root, sides: 12, name: "body" },
  );

  // ---- head ----
  b.sweep([V(0, 0.062, 0.08), V(0, 0.05, 0.15)], [0.04, 0.019], {
    color: TAN,
    bone: "head",
    caps: { start: "round", end: "round" },
    sides: 8,
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), BLACK, { at: [0, 0.048, 0.173], bone: "head", scale: [1, 0.85, 1.05], name: "nose" });
  b.sweep([V(0, 0.034, 0.1), V(0, 0.032, 0.16)], [0.022, 0.011], {
    color: CREAM,
    bone: "jaw",
    caps: "round",
    sides: 8,
    name: "lowerJaw",
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.0095, 8, 6), BLACK, { at: [0.026 * s, 0.07, 0.132], bone: "head", name: "eye" + side });
    b.part(new THREE.SphereGeometry(0.003, 5, 4), "#ffffff", { at: [0.028 * s, 0.074, 0.14], bone: "head", name: "glint" + side });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), SKIN, {
      at: [0.036 * s, 0.09, 0.103],
      bone: "ear" + side,
      scale: [0.5, 1, 0.8],
      name: "ear" + side,
    });
    // cheek fur tufts
    b.part(new THREE.ConeGeometry(0.01, 0.025, 5), CREAM, {
      at: [0.035 * s, 0.045, 0.11],
      bone: "head",
      rotation: [0, 0, -80 * s],
      name: "cheek" + side,
    });
  }

  // ---- legs ----
  const legs: Array<[string, number, number]> = [
    ["FL", 0.045, 0.06],
    ["FR", -0.045, 0.06],
    ["HL", 0.05, -0.07],
    ["HR", -0.05, -0.07],
  ];
  for (const [id, x, z] of legs) {
    const s = Math.sign(x);
    b.chain("leg" + id, [V(x, 0.055, z), V(x * 1.05, 0.03, z + 0.008), V(x * 1.08, 0.0, z + 0.018)], {
      parent: root,
      names: ["hip" + id, "knee" + id, "foot" + id],
      role: "leg",
    });
    const ch = b.joints ? undefined : undefined;
    void ch;
  }
  for (const [id, x, z] of legs) {
    const s = Math.sign(x);
    const foot = b.ctx.joints.get("foot" + id)!;
    const chain = [b.ctx.joints.get("hip" + id)!, b.ctx.joints.get("knee" + id)!];
    void chain;
    // limb tube from hip to foot tip, bone-bound manually
    b.sweep(
      [V(x, 0.058, z), V(x * 1.05, 0.03, z + 0.008), V(x * 1.08, 0.012, z + 0.018)],
      [0.019, 0.012],
      { color: TAN, bone: [b.ctx.joints.get("hip" + id)!, b.ctx.joints.get("knee" + id)!], caps: "round", sides: 6, name: "limb" + id },
    );
    // paw and toes
    b.part(new THREE.BoxGeometry(0.026, 0.012, 0.03), SKIN, { at: [x * 1.08, 0.006, z + 0.026], bone: foot, name: "paw" + id });
    for (let k = -1; k <= 1; k++)
      b.part(new THREE.SphereGeometry(0.005, 6, 5), BLACK, {
        at: [x * 1.08 + k * 0.008 * s, 0.004, z + 0.043],
        bone: foot,
        scale: [1, 0.8, 1.2],
        name: "toe" + id + k,
      });
  }

  // tail stub
  b.part(new THREE.ConeGeometry(0.01, 0.03, 5), TAN, { at: [0, 0.052, -0.15], bone: "tail1", rotation: [-100, 0, 0], name: "tail" });

  // ---- quills ----
  const cone = new THREE.ConeGeometry(0.008, 0.06, 5);
  cone.translate(0, 0.03, 0);
  const r = rng(11);
  const palette = [DARK, "#6b4a30", "#a58660", "#2e2119", "#8a6a45"];
  const surf = b.surface(body);
  const hits = surf.scatter(400, {
    rng: rng(5),
    minDist: 0.013,
    filter: (h) => h.n.y > -0.2 && h.at.z < 0.07 && h.at.y > 0.035,
  });
  for (const h of hits) {
    const n = h.n;
    const dir = n.clone().add(V(0, 0.1, -0.6)).normalize();
    b.stick(cone, palette[Math.floor(r() * palette.length)], frame(h, dir), {
      scale: 0.75 + r() * 0.6,
      embed: 0.25,
      bone: root,
      name: "quill",
    });
  }

  return b.root;
}
```