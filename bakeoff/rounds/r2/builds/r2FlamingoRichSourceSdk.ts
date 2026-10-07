import * as THREE from "three";
import { createBuilder, catmull, polyline, gradient, mottle } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "Candy-pink flamingo wading in shallow water: S-curved neck, bent pale beak with black tip, coral wings with black flight feathers, knobby-kneed rose legs and webbed feet.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "flamingo" });
  const PINK = "#f7a3b9";
  const PALE = "#f9c9d4";
  const BLACK = "#1c1a22";
  const LEG = "#e0607a";
  const LEGD = "#cf4b69";
  const WEB = "#f08fa5";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.88, 0] });
  const spine = b.chain("spine", catmull([[0, 0.88, -0.18], [0, 0.92, 0.02], [0, 1.0, 0.22]]), {
    parent: "root", role: "spine",
  });
  const tail = b.chain("tail", catmull([[0, 0.88, -0.2], [0, 0.87, -0.36], [0, 0.85, -0.5]]), {
    parent: "spine1", role: "tail",
  });
  const neck = b.chain(
    "neck",
    catmull([[0, 1.02, 0.22], [0, 1.12, 0.37], [0, 1.27, 0.3], [0, 1.41, 0.2], [0, 1.52, 0.25]]),
    { parent: spine, role: "neck" },
  );
  b.joint("head", { parent: neck, at: [0, 1.52, 0.25], dir: [0, 0.4, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.55, 0.31], dir: [0, 0, 1], role: "jaw" });

  // ---------- body ----------
  const bodyPaint = mottle(PINK, "#f593ac", { size: 0.14, seed: 3, contrast: 0.8 });
  b.loft(
    [
      { at: [0, 0.87, -0.4], w: 0.04, h: 0.04 },
      { at: [0, 0.88, -0.25], w: 0.17, h: 0.2 },
      { at: [0, 0.92, -0.02], w: 0.22, h: 0.27 },
      { at: [0, 0.97, 0.17], w: 0.18, h: 0.24 },
      { at: [0, 1.03, 0.26], w: 0.1, h: 0.12 },
    ],
    { color: bodyPaint, bone: spine },
  );
  b.sweep(neck, (t) => 0.048 - 0.026 * t, {
    color: mottle("#f9b2c4", "#f7a3b9", { size: 0.1, seed: 5 }),
  });

  // tail plate
  b.extrude([[0, 0.05], [0.15, 0.07], [0.22, 0.02], [0.2, -0.03], [0.14, -0.07], [0, -0.05]], {
    color: "#f48aa2", at: [0, 0.885, -0.33], x: [0, -0.05, -1], y: [1, 0, 0], thickness: 0.014,
    smoothing: 1, bone: "tail1",
  });

  // ---------- head & beak ----------
  b.part(new THREE.SphereGeometry(0.038, 10, 8), PINK, { at: [0, 1.565, 0.29], scale: [0.9, 1, 1.2], bone: "head" });
  b.sweep(
    [[0, 1.56, 0.3], [0, 1.56, 0.37], [0, 1.545, 0.43], [0, 1.5, 0.475], [0, 1.45, 0.49]],
    (t) => [0.026 * (1 - t) + 0.006, 0.021 * (1 - t) + 0.006],
    { bands: [[0.62, PALE], [1, BLACK]], bone: "head", sides: 6, caps: "round" },
  );
  b.sweep(
    [[0, 1.545, 0.3], [0, 1.54, 0.37], [0, 1.525, 0.42], [0, 1.49, 0.455]],
    (t) => [0.02 * (1 - t) + 0.005, 0.01 * (1 - t) + 0.004],
    { bands: [[0.68, PALE], [1, BLACK]], bone: "jaw", sides: 6, caps: "round" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 8, 6), "#f5e58a", { at: [s * 0.032, 1.575, 0.315], bone: "head" });
    b.part(new THREE.SphereGeometry(0.0055, 6, 5), BLACK, { at: [s * 0.04, 1.576, 0.322], bone: "head" });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), "#e9788f", { at: [s * 0.03, 1.595, 0.31], scale: [1, 0.35, 1.3], bone: "head" });
  }

  // ---------- wings ----------
  const wingPaint = gradient("#f59aad", "#ee6a5c", [0, 1.0, 0.1], [0, 0.9, -0.35]);
  const feathers = [
    [0.26, 0.06], [0.3, 0.025], [0.32, -0.01], [0.31, -0.045], [0.28, -0.08], [0.23, -0.115],
  ];
  for (const s of [1, -1]) {
    const suf = s > 0 ? "L" : "R";
    b.chain(
      `wing${suf}`,
      polyline([[s * 0.1, 1.04, 0.12], [s * 0.115, 0.99, -0.1], [s * 0.1, 0.94, -0.3]]),
      { parent: "spine2", role: "wing", names: [`shoulder${suf}`, `elbow${suf}`] },
    );
    b.extrude(
      [[0, 0.07], [0.1, 0.11], [0.24, 0.09], [0.36, 0.03], [0.4, -0.04], [0.28, -0.1], [0.1, -0.13], [0, -0.06]],
      {
        color: wingPaint, at: [s * 0.105, 1.0, 0.13], x: [0, -0.1, -1], y: [0, 1, 0],
        thickness: 0.035, smoothing: 1, bone: `shoulder${suf}`,
      },
    );
    // coral covert layer
    b.extrude([[0.02, 0.04], [0.12, 0.08], [0.26, 0.05], [0.3, -0.03], [0.16, -0.08], [0.04, -0.04]], {
      color: "#f0675c", at: [s * 0.108, 0.985, 0.12], x: [0, -0.1, -1], y: [0, 1, 0],
      thickness: 0.04, smoothing: 1, bone: `shoulder${suf}`,
    });
    // black flight feathers
    feathers.forEach(([len, dy], i) => {
      const a: [number, number, number] = [s * 0.106, 1.0 + dy - 0.0, -0.2 - 0.01 * i];
      const d = new THREE.Vector3(0, -0.12 - 0.01 * i, -1).normalize();
      const e = new THREE.Vector3(...a).addScaledVector(d, len);
      b.frustumBox(a, [e.x, e.y, e.z], [0.01, 0.055], [0.004, 0.025], { color: BLACK, bone: `elbow${suf}` });
    });
  }

  // ---------- legs & feet ----------
  const toes = [
    { d: [0.45, 0, 1], len: 0.12 },
    { d: [0, 0, 1], len: 0.15 },
    { d: [-0.45, 0, 1], len: 0.12 },
  ];
  for (const s of [1, -1]) {
    const suf = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${suf}`,
      catmull([[s * 0.07, 0.86, 0.02], [s * 0.075, 0.6, 0.04], [s * 0.075, 0.4, -0.03], [s * 0.075, 0.014, 0.05]]),
      {
        parent: "root", role: "leg",
        names: [`hip${suf}`, `knee${suf}`, `ankle${suf}`, `toeBase${suf}`],
      },
    );
    b.sweep(leg, (t) => 0.016 - 0.006 * Math.min(1, t * 1.5) + 0.004 * Math.exp(-(((t - 0.56) / 0.04) ** 2)), {
      color: LEG, sides: 6,
    });
    b.part(new THREE.IcosahedronGeometry(0.02, 1), LEGD, { at: [s * 0.075, 0.6, 0.04], bone: `knee${suf}`, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.023, 1), LEGD, { at: [s * 0.075, 0.4, -0.03], bone: `ankle${suf}`, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.02, 1), LEG, { at: [s * 0.07, 0.84, 0.02], bone: `hip${suf}`, scale: [1.3, 1.5, 1.3], flat: true });

    const base = new THREE.Vector3(s * 0.075, 0.014, 0.05);
    const tips: THREE.Vector3[] = [];
    toes.forEach((t, i) => {
      const d = new THREE.Vector3(s * t.d[0], 0, t.d[2]).normalize();
      b.joint(`toe${i + 1}${suf}`, { parent: `toeBase${suf}`, at: base, dir: d });
      b.spike(base, d, t.len, 0.0085, { color: LEG, bone: `toe${i + 1}${suf}`, sides: 5 });
      tips.push(base.clone().addScaledVector(d, t.len * 0.85));
    });
    for (let i = 0; i < 2; i++) {
      b.slab(
        [[base.x, 0.008, base.z], [tips[i].x, 0.008, tips[i].z], [tips[i + 1].x, 0.008, tips[i + 1].z]],
        { color: WEB, thickness: 0.004, bone: `toeBase${suf}` },
      );
    }
    b.spike(base, [0, 0, -1], 0.05, 0.007, { color: LEG, bone: `toeBase${suf}`, sides: 5 });

    for (const r of [0.06, 0.1]) {
      b.part(new THREE.TorusGeometry(r, 0.0025, 4, 20), "#d9f3f6", {
        at: [s * 0.075, 0.013, 0.08], rotation: [90, 0, 0], bone: "root",
      });
    }
  }

  // ---------- water ----------
  b.part(new THREE.CylinderGeometry(0.9, 0.9, 0.022, 28), "#7fc8d6", { at: [0, 0.001, 0], bone: "root" });

  return b.root;
}
