```ts
import * as THREE from "three";
import { createBuilder, catmull, spiral, arc, paint, countershade, mottle, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Dutch City Bicycle",
  description:
    "Vintage mint-green Dutch city bike with swept-back bars, cream grips, silver bell, sprung leather saddle, chrome mudguards, chain guard, whitewall tyres and a wicker basket of sunflowers and a baguette.",
};

export default function build() {
  const b = createBuilder({ name: "dutch_bicycle" });

  const MINT = "#9bd9bf";
  const MINT_D = "#80c6a8";
  const CREAM = "#f4ead0";
  const CHROME = "#e2e6e9";
  const STEEL = "#b9bfc4";
  const DARK = "#26262a";
  const LEATHER = "#7a4a22";
  const GREEN = "#4f8f3a";

  // ---------- skeleton ----------
  b.joint("frame", { at: [0, 0.5, 0] });
  b.joint("steer", { parent: "frame", at: [0, 0.72, 0.5], dir: [0, 0.23, -0.07] });
  b.joint("frontWheel", { parent: "steer", at: [0, 0.35, 0.58] });
  b.joint("rearWheel", { parent: "frame", at: [0, 0.35, -0.52] });
  b.joint("crank", { parent: "frame", at: [0, 0.3, 0.02] });
  b.joint("pedalL", { parent: "crank", at: [0.13, 0.2, 0.02] });
  b.joint("pedalR", { parent: "crank", at: [-0.15, 0.4, 0.02] });
  b.joint("bell", { parent: "steer", at: [0.1, 1.1, 0.43] });
  b.joint("saddle", { parent: "frame", at: [0, 1.02, -0.268] });
  b.joint("kickstand", { parent: "frame", at: [0.05, 0.32, -0.2] });

  const tube = (a: number[], c: number[], r: number, color: string, bone: string, sides = 8) =>
    b.capsule(a, c, r, { color, bone, sides });
  const mir = (p: number[]) => [-p[0], p[1], p[2]];

  // ---------- frame ----------
  tube([0, 0.735, 0.497], [0, 0.3, 0.02], 0.02, MINT, "frame");
  b.sweep(
    catmull([
      [0, 0.9, 0.445],
      [0, 0.7, 0.36],
      [0, 0.6, 0.2],
      [0, 0.57, 0.0],
      [0, 0.56, -0.084],
    ]),
    { radius: 0.018, color: MINT, bone: "frame" },
  );
  tube([0, 0.3, 0.02], [0, 0.9, -0.24], 0.017, MINT, "frame");
  b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.1, 8), MINT, { at: [0, 0.3, 0.02], dir: [1, 0, 0], bone: "frame" });
  // head tube
  b.rod([0, 0.71, 0.505], [0, 0.96, 0.425], 0.022, { color: MINT, bone: "frame" });
  b.rod([0, 0.715, 0.503], [0, 0.735, 0.497], 0.0245, { color: CREAM, bone: "frame" });
  b.rod([0, 0.94, 0.43], [0, 0.96, 0.425], 0.0245, { color: CREAM, bone: "frame" });
  for (const s of [1, -1]) {
    tube([s * 0.045, 0.3, 0.02], [s * 0.055, 0.35, -0.52], 0.009, MINT, "frame", 6);
    tube([s * 0.03, 0.8, -0.185], [s * 0.055, 0.35, -0.52], 0.008, MINT, "frame", 6);
    b.part(new THREE.BoxGeometry(0.012, 0.05, 0.04), MINT_D, { at: [s * 0.058, 0.35, -0.52], bone: "frame" });
  }

  // ---------- fork, stem, bars ----------
  tube([-0.055, 0.7, 0.5], [0.055, 0.7, 0.5], 0.016, MINT, "steer");
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.055, 0.7, 0.5],
        [s * 0.052, 0.52, 0.548],
        [s * 0.048, 0.35, 0.58],
      ]),
      { radius: [0.013, 0.009], color: MINT, bone: "steer", sides: 6 },
    );
  }
  b.rod([0, 0.955, 0.427], [0, 1.07, 0.425], 0.012, { color: CHROME, bone: "steer" });
  b.sweep(
    catmull([
      [-0.34, 1.1, 0.2],
      [-0.335, 1.105, 0.26],
      [-0.26, 1.1, 0.38],
      [-0.12, 1.08, 0.43],
      [0, 1.07, 0.43],
      [0.12, 1.08, 0.43],
      [0.26, 1.1, 0.38],
      [0.335, 1.105, 0.26],
      [0.34, 1.1, 0.2],
    ]),
    { radius: 0.0105, color: CHROME, bone: "steer", sides: 6 },
  );
  for (const s of [1, -1]) {
    b.capsule([s * 0.34, 1.1, 0.22], [s * 0.335, 1.1, 0.05], { radius: 0.017, color: CREAM, bone: "steer", sides: 8 });
    b.capsule([s * 0.325, 1.085, 0.17], [s * 0.31, 1.06, 0.29], { radius: 0.004, color: DARK, bone: "steer", sides: 4 });
  }
  // headlamp
  tube([0, 1.07, 0.43], [0, 1.11, 0.49], 0.007, CHROME, "steer", 5);
  b.part(new THREE.SphereGeometry(0.04, 10, 8), CHROME, { at: [0, 1.125, 0.5], scale: [1, 1, 1.25], bone: "steer" });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 10), "#fff2b0", { at: [0, 1.125, 0.55], dir: [0, 0, 1], bone: "steer" });

  // bell
  b.part(new THREE.SphereGeometry(0.04, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0.1, 1.108, 0.43], bone: "bell" });
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 10), CHROME, { at: [0.1, 1.105, 0.43], bone: "bell" });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), CHROME, { at: [0.1, 1.15, 0.43], bone: "bell" });
  tube([0.1, 1.075, 0.43], [0.1, 1.103, 0.43], 0.008, CHROME, "bell", 6);
  tube([0.14, 1.112, 0.44], [0.17, 1.12, 0.5], 0.004, DARK, "bell", 4);

  // ---------- wheels ----------
  const profile: Array<[number, number]> = [
    [0.298, 0.012],
    [0.31, 0.022],
    [0.33, 0.027],
    [0.346, 0.019],
    [0.352, 0],
    [0.346, -0.019],
    [0.33, -0.027],
    [0.31, -0.022],
    [0.298, -0.012],
  ];
  const wheel = (cz: number, bone: string) => {
    const cy = 0.35;
    const tyre = paint((p, n) => {
      const r = Math.hypot(p.y - cy, p.z - cz);
      return Math.abs(n.x) > 0.55 && r > 0.303 && r < 0.338 ? "#f6f2e6" : "#1c1c1f";
    });
    b.lathe(profile, { color: tyre, at: [0, cy, cz], axis: [1, 0, 0], segments: 24, bone });
    b.part(new THREE.TorusGeometry(0.292, 0.008, 5, 24), CHROME, { at: [0, cy, cz], rotation: [0, 90, 0], bone });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 8), CHROME, { at: [0, cy, cz], dir: [1, 0, 0], bone });
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), STEEL, { at: [0, cy, cz], dir: [1, 0, 0], bone });
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.005, 10), CHROME, { at: [s * 0.032, cy, cz], dir: [1, 0, 0], bone });
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const side = i % 2 ? 1 : -1;
      const a2 = a + side * 0.5;
      b.rod(
        [side * 0.034, cy + 0.028 * Math.cos(a), cz + 0.028 * Math.sin(a)],
        [0, cy + 0.292 * Math.cos(a2), cz + 0.292 * Math.sin(a2)],
        0.0013,
        { color: STEEL, bone, sides: 3, caps: "none" },
      );
    }
  };
  wheel(0.58, "frontWheel");
  wheel(-0.52, "rearWheel");

  // ---------- mudguards ----------
  const guard = (cz: number, deg0: number, sweepDeg: number, bone: string) => {
    const a0 = (deg0 * Math.PI) / 180;
    const from = [0, 0.35 + 0.375 * Math.cos(a0), cz + 0.375 * Math.sin(a0)];
    b.sweep(arc([0, 0.35, cz], from, [1, 0, 0], sweepDeg), {
      radius: () => [0.04, 0.004],
      section: "box",
      caps: "flat",
      color: CHROME,
      bone,
    });
  };
  guard(0.58, -40, 115, "steer");
  guard(-0.52, -78, 150, "frame");
  // stays
  for (const s of [1, -1]) {
    tube([s * 0.045, 0.35, 0.58], [s * 0.03, 0.447, 0.942], 0.003, CHROME, "steer", 4);
    tube([s * 0.06, 0.35, -0.52], [s * 0.03, 0.447, -0.882], 0.003, CHROME, "frame", 4);
  }
  // rear light
  b.part(new THREE.BoxGeometry(0.05, 0.02, 0.04), "#d83a3a", {
    at: [0, 0.6, -0.81],
    dir: [0, Math.cos(-0.87), Math.sin(-0.87)],
    bone: "frame",
  });

  // ---------- rear rack ----------
  b.part(new THREE.BoxGeometry(0.15, 0.01, 0.4), CHROME, { at: [0, 0.79, -0.44], bone: "frame" });
  for (const s of [1, -1]) {
    tube([s * 0.06, 0.78, -0.2], [s * 0.06, 0.78, -0.66], 0.005, CHROME, "frame", 5);
    tube([s * 0.06, 0.35, -0.52], [s * 0.06, 0.78, -0.62], 0.004, CHROME, "frame", 5);
  }
  tube([-0.06, 0.78, -0.2], [0.06, 0.78, -0.2], 0.005, CHROME, "frame", 5);

  // ---------- drivetrain ----------
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.26, 8), STEEL, { at: [0, 0.3, 0.02], dir: [1, 0, 0], bone: "crank" });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.006, 16), STEEL, { at: [-0.062, 0.3, 0.02], dir: [1, 0, 0], bone: "crank" });
  tube([0.085, 0.3, 0.02], [0.085, 0.2, 0.02], 0.011, CHROME, "crank", 6);
  tube([-0.108, 0.3, 0.02], [-0.108, 0.4, 0.02], 0.011, CHROME, "crank", 6);
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.09), DARK, { at: [0.14, 0.2, 0.02], bone: "pedalL" });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.09), DARK, { at: [-0.16, 0.4, 0.02], bone: "pedalR" });
  // chain guard
  b.extrude(
    [
      [0.14, 0.3],
      [0.12, 0.38],
      [0.03, 0.42],
      [-0.1, 0.4],
      [-0.3, 0.395],
      [-0.48, 0.39],
      [-0.56, 0.35],
      [-0.52, 0.3],
      [-0.3, 0.28],
      [-0.12, 0.2],
      [-0.02, 0.185],
      [0.09, 0.205],
    ],
    { color: MINT_D, at: [-0.085, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.004, smoothing: 1, bone: "frame" },
  );
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 10), CREAM, { at: [-0.093, 0.335, -0.18], dir: [1, 0, 0], bone: "frame" });

  // ---------- saddle ----------
  tube([0, 0.88, -0.232], [0, 1.02, -0.268], 0.012, CHROME, "frame");
  b.loft(
    [
      { at: [0, 1.115, -0.14], w: 0.04, h: 0.04 },
      { at: [0, 1.12, -0.23], w: 0.12, h: 0.05 },
      { at: [0, 1.125, -0.34], w: 0.22, h: 0.065 },
      { at: [0, 1.12, -0.44], w: 0.24, h: 0.06 },
    ],
    { color: countershade("#8c5a2e", "#4d2c14", { level: -0.1 }), bone: "saddle" },
  );
  tube([0, 1.02, -0.268], [0, 1.1, -0.16], 0.005, CHROME, "saddle", 5);
  tube([-0.07, 1.02, -0.35], [0.07, 1.02, -0.35], 0.006, CHROME, "saddle", 5);
  tube([0, 1.02, -0.268], [0, 1.02, -0.35], 0.006, CHROME, "saddle", 5);
  for (const s of [1, -1]) {
    b.sweep(spiral([s * 0.07, 1.02, -0.35], [s * 0.07 + 0.028, 1.02, -0.35], [0, 1, 0], { turns: 4, r1: 0.03, pitch: 0.02 }), {
      radius: 0.0035,
      color: CHROME,
      bone: "saddle",
      sides: 4,
      caps: "flat",
    });
  }

  // ---------- kickstand ----------
  tube([0.05, 0.32, -0.2], [0.085, 0.007, -0.3], 0.007, DARK, "kickstand", 6);

  // ---------- basket ----------
  const wicker = stripes("#d0a35c", "#a87a3a", { size: 0.035, axis: "y", width: 0.45, wobble: 0.15 });
  b.frustumBox([0, 0.77, 0.66], [0, 0.93, 0.66], [0.3, 0.24], [0.38, 0.3], { color: wicker, bone: "steer" });
  b.frustumBox([0, 0.925, 0.66], [0, 0.965, 0.66], [0.385, 0.31], [0.4, 0.325], { color: "#8a5f2b", bone: "steer" });
  b.frustumBox([0, 0.9655, 0.66], [0, 0.9685, 0.66], [0.34, 0.25], [0.34, 0.25], { color: "#3a2a1a", bone: "steer" });
  for (const s of [1, -1]) {
    tube([s * 0.05, 0.35, 0.58], [s * 0.12, 0.775, 0.6], 0.004, CHROME, "steer", 5);
    tube([s * 0.045, 1.0, 0.43], [s * 0.12, 0.9, 0.53], 0.004, CHROME, "steer", 5);
  }

  // ---------- sunflowers ----------
  const star = (n: number, ro: number, ri: number, depth: number, phase: number) => {
    const sh = new THREE.Shape();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n + phase;
      const r = i % 2 ? ri : ro;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      if (i) sh.lineTo(x, y);
      else sh.moveTo(x, y);
    }
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const petalsA = star(14, 0.07, 0.044, 0.008, 0);
  const petalsB = star(14, 0.058, 0.04, 0.008, Math.PI / 14);
  const sepals = star(8, 0.045, 0.028, 0.006, 0);
  const disc = new THREE.CylinderGeometry(0.032, 0.032, 0.02, 10).rotateX(Math.PI / 2);
  const core = new THREE.CylinderGeometry(0.02, 0.02, 0.026, 8).rotateX(Math.PI / 2);
  const leaf = new THREE.SphereGeometry(1, 6, 4);
  const heads = [
    [0.14, 1.18, 0.8],
    [0.02, 1.31, 0.7],
    [0.17, 1.21, 0.62],
    [-0.04, 1.14, 0.85],
  ];
  const bases = [
    [0.06, 0.975, 0.7],
    [0.0, 0.975, 0.66],
    [0.08, 0.975, 0.62],
    [0.0, 0.975, 0.74],
  ];
  heads.forEach((h, i) => {
    const hp = new THREE.Vector3(...h);
    const bp = new THREE.Vector3(...bases[i]);
    const d = hp.clone().sub(bp).normalize();
    const face = d.clone().add(new THREE.Vector3(0, 0.1, 0.7)).normalize();
    const at = (k: number) => hp.clone().addScaledVector(face, k).toArray();
    tube(bp.toArray(), at(-0.012), 0.006, GREEN, "steer", 5);
    for (const sx of [-1, 1]) {
      const m = bp.clone().lerp(hp, 0.45 + 0.1 * sx).add(new THREE.Vector3(sx * 0.03, 0, 0));
      const ld = d.clone().add(new THREE.Vector3(sx * 0.9, 0, 0.1)).normalize();
      b.part(leaf, "#5fa145", { at: m.toArray(), dir: ld.toArray(), axis: "z", scale: [0.014, 0.004, 0.04], bone: "steer" });
    }
    const common = { dir: face.toArray(), axis: "z" as const, bone: "steer" };
    b.part(sepals, GREEN, { at: at(-0.012), ...common });
    b.part(petalsA, "#ffd21f", { at: at(-0.004), ...common });
    b.part(petalsB, "#f4a91c", { at: at(0.003), ...common });
    b.part(disc, "#5b3a1b", { at: at(0.008), ...common });
    b.part(core, "#3c2512", { at: at(0.011), ...common });
  });

  // ---------- baguette ----------
  const ba = new THREE.Vector3(-0.08, 0.9, 0.62);
  const bb = new THREE.Vector3(-0.3, 1.42, 0.52);
  b.sweep([ba.toArray(), bb.toArray()], {
    radius: (t: number) => {
      const r = 0.034 * Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * t)), 0.4);
      return [r, r];
    },
    color: mottle("#dba556", "#b56d2a", { size: 0.05, contrast: 1.5 }),
    bone: "steer",
    sides: 8,
  });
  const axis = bb.clone().sub(ba).normalize();
  const nrm = new THREE.Vector3().crossVectors(new THREE.Vector3(1, 0, 0), axis).normalize();
  const slit = new THREE.BoxGeometry(0.012, 0.05, 0.008).rotateZ(0.7);
  for (const t of [0.35, 0.47, 0.59, 0.71, 0.83]) {
    const p = ba.clone().lerp(bb, t).addScaledVector(nrm, 0.031);
    b.part(slit, "#8b4e1c", { at: p.toArray(), dir: axis.toArray(), up: nrm.toArray(), bone: "steer" });
  }

  return b.root;
}
```