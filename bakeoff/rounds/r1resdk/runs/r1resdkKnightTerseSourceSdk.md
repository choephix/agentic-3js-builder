```ts
import * as THREE from "three";
import { createBuilder, catmull, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A stylized full-plate knight in an A-pose rest pose, with a great helm and plume, gold trim, a red cloak and tabard, a heater shield and a sword. Rigged with spine, neck, head, jaw, arm and leg chains.",
};

export default function build() {
  const b = createBuilder({ name: "knight" });

  const STEEL = "#aab4c0";
  const DARK = "#5d6874";
  const GOLD = "#d4a537";
  const RED = "#a3202a";
  const LEATHER = "#5a3a22";
  const BLACK = "#1d1f24";
  const steelPaint = mottle("#98a3b0", "#c3ccd6", { size: 0.07, seed: 3 });
  const darkPaint = mottle("#566170", "#6f7b89", { size: 0.06, seed: 5 });

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sph = (r: number, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
  const torus = (r: number, t: number, s = 14) => new THREE.TorusGeometry(r, t, 5, s);

  // ---------------- skeleton ----------------
  b.joint("hips", { at: [0, 0.98, 0], dir: [0, 1, 0] });
  const spine = b.chain("spine", [v(0, 0.98, 0), v(0, 1.18, 0), v(0, 1.38, 0)], {
    parent: "hips",
    role: "spine",
    names: ["spine1", "spine2", "spine3"],
  });
  const neck = b.chain("neck", [v(0, 1.52, 0), v(0, 1.66, 0)], {
    parent: "spine3",
    role: "neck",
    names: ["neck", "head"],
  });
  b.joint("jaw", { parent: "head", at: [0, 1.67, 0.06], dir: [0, 0, 1], role: "jaw" });

  // ---------------- torso ----------------
  b.loft(
    [
      { at: v(0, 0.98, 0), w: 0.34, h: 0.24 },
      { at: v(0, 1.12, 0), w: 0.3, h: 0.21 },
      { at: v(0, 1.34, 0), w: 0.42, h: 0.27 },
      { at: v(0, 1.5, 0), w: 0.38, h: 0.24 },
    ],
    { color: steelPaint, bone: spine, up: [0, 0, 1], name: "torso" },
  );
  // breastplate
  b.part(sph(1, 12, 8), steelPaint, { at: [0, 1.36, 0.075], scale: [0.225, 0.19, 0.15], bone: "spine3" });
  b.part(box(0.025, 0.3, 0.03), GOLD, { at: [0, 1.36, 0.225], bone: "spine3" });
  b.part(sph(1, 10, 6), steelPaint, { at: [0, 1.38, -0.07], scale: [0.2, 0.17, 0.12], bone: "spine3" });
  // belt
  b.part(torus(0.17, 0.022), GOLD, { at: [0, 1.06, 0], rotation: [90, 0, 0], scale: [1.1, 0.85, 1], bone: "hips" });
  b.part(box(0.06, 0.06, 0.03), GOLD, { at: [0, 1.06, 0.2], bone: "hips" });
  // gorget
  b.part(cyl(0.085, 0.105, 0.12, 10), steelPaint, { at: [0, 1.54, 0], bone: "neck" });
  b.part(torus(0.1, 0.015), GOLD, { at: [0, 1.5, 0], rotation: [90, 0, 0], bone: "spine3" });
  // skirt
  b.lathe(
    [
      [0.18, 0.04],
      [0.2, 0.04],
      [0.3, -0.3],
      [0.27, -0.3],
    ],
    { at: [0, 0.98, 0], color: darkPaint, segments: 10, bone: "hips", name: "skirt" },
  );
  b.part(torus(0.295, 0.012, 12), GOLD, { at: [0, 0.68, 0], rotation: [90, 0, 0], bone: "hips" });
  // tabard
  for (const z of [0.285, -0.285]) {
    b.part(box(0.2, 0.52, 0.018), RED, { at: [0, 0.76, z], rotation: [z > 0 ? 6 : -6, 0, 0], bone: "hips" });
    b.part(box(0.024, 0.2, 0.02), GOLD, { at: [0, 0.78, z * 1.04], bone: "hips" });
    b.part(box(0.1, 0.024, 0.02), GOLD, { at: [0, 0.82, z * 1.04], bone: "hips" });
  }
  // cloak
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.3, -0.6],
      [0.33, -0.98],
      [-0.33, -0.98],
      [-0.3, -0.6],
    ],
    { at: [0, 1.5, -0.17], x: [1, 0, 0], y: [0, 1, 0.25], thickness: 0.014, color: RED, bone: "spine3", name: "cloak" },
  );

  // ---------------- head ----------------
  b.part(sph(1, 14, 10), steelPaint, { at: [0, 1.73, 0.01], scale: [0.135, 0.145, 0.15], bone: "head", name: "skull" });
  b.part(box(0.17, 0.02, 0.03), BLACK, { at: [0, 1.745, 0.15], bone: "head" });
  b.part(box(0.028, 0.14, 0.03), GOLD, { at: [0, 1.7, 0.155], bone: "head" });
  b.part(torus(0.125, 0.012, 14), GOLD, { at: [0, 1.79, 0.01], rotation: [90, 0, 0], bone: "head" });
  b.part(sph(1, 12, 8), steelPaint, { at: [0, 1.645, 0.035], scale: [0.125, 0.07, 0.13], bone: "jaw", name: "bevor" });
  for (let i = -1; i <= 1; i++) b.part(box(0.012, 0.012, 0.02), BLACK, { at: [i * 0.04, 1.65, 0.158], bone: "jaw" });
  b.sweep(catmull([v(0, 1.84, 0.1), v(0, 1.94, 0.03), v(0, 1.95, -0.08), v(0, 1.82, -0.2)]), (t) => [0.012, 0.05 * (1 - 0.4 * t)], {
    color: RED,
    bone: "head",
    caps: "round",
    name: "plume",
  });

  // ---------------- arms ----------------
  const arm = (sx: number, S: string) => {
    const sh = v(sx * 0.26, 1.48, 0);
    const el = v(sx * 0.44, 1.24, 0);
    const wr = v(sx * 0.61, 1.02, 0.03);
    const tip = v(sx * 0.66, 0.94, 0.04);
    const ch = b.chain("arm" + S, [sh, el, wr, tip].slice(0, 3).concat([tip]), {
      parent: "spine3",
      role: "arm",
      names: ["shoulder" + S, "elbow" + S, "wrist" + S, "hand" + S],
    });
    b.sweep(ch, (t) => 0.052 - 0.012 * t, { color: darkPaint, name: "armSleeve" + S, to: 0.85 });
    // plates
    b.capsule(el, wr, [0.058, 0.044], { color: steelPaint, bone: "elbow" + S, name: "vambrace" + S });
    b.capsule(sh.clone().lerp(el, 0.15), el.clone().lerp(sh, 0.1), [0.056, 0.058], {
      color: steelPaint,
      bone: "shoulder" + S,
      name: "rerebrace" + S,
    });
    b.part(sph(1, 10, 8), GOLD, { at: el, scale: [0.06, 0.06, 0.06], bone: "elbow" + S });
    // pauldron
    b.part(sph(1, 12, 8), steelPaint, { at: [sx * 0.3, 1.52, 0], scale: [0.115, 0.085, 0.11], bone: "shoulder" + S });
    b.part(torus(0.1, 0.014, 12), GOLD, { at: [sx * 0.31, 1.47, 0], rotation: [90, sx * 15, 0], bone: "shoulder" + S });
    b.part(new THREE.ConeGeometry(0.025, 0.07, 6), GOLD, { at: [sx * 0.31, 1.6, 0], bone: "shoulder" + S });
    // gauntlet
    const dir = tip.clone().sub(wr).normalize();
    const hc = wr.clone().lerp(tip, 0.7);
    b.part(box(0.075, 0.12, 0.05), steelPaint, { at: hc, dir, bone: "hand" + S, name: "gauntlet" + S });
    b.part(box(0.08, 0.025, 0.055), GOLD, { at: wr, dir, bone: "wrist" + S });
    b.capsule(hc.clone().add(v(0, 0.01, 0.03)), hc.clone().add(v(sx * -0.0, -0.06, 0.07)), 0.015, {
      color: DARK,
      bone: "hand" + S,
      name: "thumb" + S,
    });
  };
  arm(1, "L");
  arm(-1, "R");

  // ---------------- legs ----------------
  const leg = (sx: number, S: string) => {
    const hip = v(sx * 0.12, 0.98, 0);
    const kn = v(sx * 0.13, 0.52, 0.02);
    const an = v(sx * 0.13, 0.1, 0);
    const toe = v(sx * 0.13, 0.06, 0.2);
    const ch = b.chain("leg" + S, [hip, kn, an, toe], {
      parent: "hips",
      role: "leg",
      names: ["hip" + S, "knee" + S, "ankle" + S, "toe" + S],
    });
    b.sweep(ch, (t) => (t < 0.34 ? 0.085 - 0.03 * (t / 0.34) : 0.058 - 0.015 * Math.min(1, (t - 0.34) / 0.31)), {
      color: steelPaint,
      to: 0.65,
      name: "legArmor" + S,
    });
    b.capsule(kn.clone().add(v(0, -0.02, 0.03)), an.clone().add(v(0, 0.04, 0.025)), [0.063, 0.05], {
      color: darkPaint,
      bone: "knee" + S,
      name: "greave" + S,
    });
    b.part(sph(1, 10, 8), GOLD, { at: [sx * 0.13, 0.52, 0.06], scale: [0.075, 0.07, 0.06], bone: "knee" + S });
    b.part(box(0.025, 0.2, 0.02), GOLD, { at: [sx * 0.13, 0.3, 0.065], bone: "knee" + S });
    // sabaton
    b.part(box(0.115, 0.09, 0.2), darkPaint, { at: [sx * 0.13, 0.06, 0.07], bone: "ankle" + S, name: "boot" + S });
    b.part(sph(1, 10, 8), darkPaint, { at: [sx * 0.13, 0.055, 0.17], scale: [0.058, 0.045, 0.07], bone: "toe" + S });
    b.part(box(0.12, 0.012, 0.3), BLACK, { at: [sx * 0.13, 0.006, 0.09], bone: "ankle" + S });
  };
  leg(1, "L");
  leg(-1, "R");

  // ---------------- sword (left hip) ----------------
  b.capsule([0.22, 0.99, 0], [0.29, 0.45, -0.1], 0.024, { color: LEATHER, bone: "hips", name: "scabbard" });
  b.part(sph(1, 8, 6), GOLD, { at: [0.29, 0.43, -0.105], scale: [0.03, 0.04, 0.03], bone: "hips" });
  b.part(box(0.15, 0.022, 0.032), GOLD, { at: [0.22, 1.0, 0], rotation: [0, 0, -6], bone: "hips", name: "guard" });
  b.capsule([0.22, 1.01, 0], [0.225, 1.14, 0.0], 0.014, { color: LEATHER, bone: "hips", name: "grip" });
  b.part(sph(0.025, 8, 6), GOLD, { at: [0.225, 1.155, 0], bone: "hips" });

  // ---------------- shield (right forearm) ----------------
  b.extrude(
    [
      [-0.2, 0.28],
      [0.2, 0.28],
      [0.2, 0.02],
      [0.12, -0.2],
      [0, -0.32],
      [-0.12, -0.2],
      [-0.2, 0.02],
    ],
    {
      at: [-0.6, 1.14, 0.11],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.01,
      smoothing: 1,
      color: RED,
      bone: "elbowR",
      name: "shield",
    },
  );
  b.part(box(0.05, 0.4, 0.014), GOLD, { at: [-0.6, 1.15, 0.13], bone: "elbowR" });
  b.part(box(0.28, 0.05, 0.014), GOLD, { at: [-0.6, 1.2, 0.13], bone: "elbowR" });
  b.part(sph(1, 10, 6), GOLD, { at: [-0.6, 1.2, 0.13], scale: [0.045, 0.045, 0.025], bone: "elbowR" });

  return b.root;
}
```