```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  gradient,
  mottle,
  countershade,
} from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description:
    "A stylized low-poly male lion in a neutral rest pose: tawny mottled coat, a three-layer faceted mane, amber eyes, whiskers and a dark tail tuft.",
};

export default function build() {
  const b = createBuilder({ name: "lion", paintSize: 1024 });
  const R = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const key = (ks: number[], t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (ks.length - 1);
    const i = Math.min(Math.floor(x), ks.length - 2);
    const f = x - i;
    const g = f * f * (3 - 2 * f);
    return ks[i] + (ks[i + 1] - ks[i]) * g;
  };

  // ---------- palette ----------
  const coat = mottle(
    countershade("#c98a3e", "#f0dcae", { level: -0.3, soft: 0.5 }),
    countershade("#b0722c", "#e2c48e", { level: -0.3, soft: 0.5 }),
    { size: 0.35, contrast: 0.7, seed: 3 },
  );
  const CREAM = "#efdcb4";
  const PAW = "#e3c590";
  const DARK = "#3a1d10";
  const NOSE = "#4a2a22";
  const WHITE = "#f7f1e2";

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.93, -0.68], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.94, -0.6],
      [0, 0.96, -0.12],
      [0, 1.0, 0.36],
    ]),
    { parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.03, 0.4],
      [0, 1.15, 0.57],
      [0, 1.25, 0.7],
    ]),
    { parent: "chest", names: ["neck1", "neck2"], role: "neck" },
  );
  b.joint("head", { parent: "neck2", at: [0, 1.27, 0.74], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.19, 0.82], dir: [0, -0.25, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.95, -0.85],
      [0, 0.88, -1.15],
      [0, 0.74, -1.45],
      [0, 0.62, -1.75],
      [0, 0.56, -1.95],
    ]),
    { parent: "hips", count: 5, role: "tail" },
  );

  // ---------- body ----------
  const rxK = [0.14, 0.19, 0.17, 0.21, 0.17];
  const ryK = [0.19, 0.24, 0.23, 0.28, 0.22];
  b.sweep(
    catmull([
      [0, 0.9, -0.9],
      [0, 0.95, -0.55],
      [0, 0.96, -0.12],
      [0, 1.0, 0.3],
      [0, 1.03, 0.48],
    ]),
    (t: number) => [key(rxK, t), key(ryK, t)] as [number, number],
    { color: coat, bone: ["hips", spine], name: "body" },
  );
  b.sweep(neck, [0.17, 0.14], { color: coat, name: "neckSkin" });
  b.sweep(tail, [0.055, 0.045, 0.035, 0.028], { color: coat, name: "tailSkin" });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(
      `front${side}`,
      polyline([
        [s * 0.2, 0.92, 0.38],
        [s * 0.22, 0.58, 0.3],
        [s * 0.21, 0.2, 0.36],
        [s * 0.21, 0.06, 0.45],
      ]),
      { parent: "chest", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`], role: "leg" },
    );
    b.sweep(front, [0.11, 0.08, 0.065, 0.055], { color: coat });

    const hind = b.chain(
      `hind${side}`,
      polyline([
        [s * 0.17, 0.9, -0.62],
        [s * 0.2, 0.55, -0.45],
        [s * 0.2, 0.24, -0.72],
        [s * 0.2, 0.06, -0.61],
      ]),
      { parent: "hips", names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(hind, [0.15, 0.1, 0.06, 0.055], { color: coat });

    // paws with toes
    const paws: Array<[number, string]> = [
      [0.47, `paw${side}`],
      [-0.58, `foot${side}`],
    ];
    for (const [z, bone] of paws) {
      const x = s * (z > 0 ? 0.21 : 0.2);
      b.part(new THREE.SphereGeometry(0.075, 8, 5), PAW, {
        at: [x, 0.05, z],
        bone,
        scale: [1, 0.7, 1.25],
        flat: true,
      });
      for (const dx of [-0.045, -0.015, 0.015, 0.045]) {
        b.part(new THREE.SphereGeometry(0.026, 6, 4), "#d9b77d", {
          at: [x + dx, 0.025, z + 0.08],
          bone,
          scale: [1, 0.85, 1.1],
          flat: true,
        });
      }
    }
  }

  // ---------- head ----------
  const cranium = b.part(new THREE.SphereGeometry(0.15, 9, 7), coat, {
    at: [0, 1.29, 0.78],
    bone: "head",
    scale: [1, 0.92, 1.05],
    flat: true,
    name: "cranium",
  });
  const crSurf = b.surface(cranium);

  // muzzle, nose bridge, nose
  b.frustumBox([0, 1.245, 0.84], [0, 1.225, 1.0], [0.17, 0.14], [0.13, 0.11], { color: CREAM, bone: "head" });
  b.frustumBox([0, 1.32, 0.86], [0, 1.285, 1.0], [0.1, 0.05], [0.07, 0.035], { color: "#b8782f", bone: "head" });
  b.extrude(
    [
      [-0.036, 0.016],
      [0.036, 0.016],
      [0.007, -0.022],
      [-0.007, -0.022],
    ],
    { color: NOSE, at: [0, 1.272, 1.0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, smoothing: 1, bevel: 0.006, bone: "head" },
  );

  // lower jaw + chin
  b.frustumBox([0, 1.17, 0.85], [0, 1.15, 1.0], [0.12, 0.06], [0.09, 0.045], { color: "#f1e3c2", bone: "jaw" });
  b.spike([0, 1.13, 0.97], [0, -1, 0.2], 0.05, 0.025, { color: CREAM, bone: "jaw", sides: 5, smooth: false });
  b.rod([-0.05, 1.168, 0.995], [0.05, 1.168, 0.995], 0.005, { color: DARK, bone: "head", sides: 4 });

  for (const s of [1, -1]) {
    // eyes
    const hit = crSurf.nearest([s * 0.066, 1.31, 0.95]);
    const n = hit.n;
    b.stick(new THREE.SphereGeometry(0.037, 8, 6), "#2a160c", hit, { embed: 0.6, bone: "head", scale: [1.15, 0.6, 0.9] });
    b.stick(new THREE.SphereGeometry(0.028, 10, 8), "#e0a12a", hit, { embed: 0.45, bone: "head" });
    b.part(new THREE.SphereGeometry(0.012, 8, 6), "#120a06", { at: hit.at.addScaledVector(n, 0.022), bone: "head" });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), "#ffffff", {
      at: hit.at.addScaledVector(n, 0.03).add(V(s * 0.006, 0.008, 0)),
      bone: "head",
    });
    // brow
    b.frustumBox([s * 0.025, 1.36, 0.905], [s * 0.115, 1.345, 0.855], [0.04, 0.03], [0.03, 0.02], {
      color: "#9c5f24",
      bone: "head",
    });
    // tear marks
    b.rod([s * 0.045, 1.29, 0.925], [s * 0.04, 1.245, 0.975], 0.006, { color: "#5a3018", bone: "head", sides: 4 });

    // ears
    const ear = crSurf.nearest([s * 0.1, 1.47, 0.74]);
    b.stick(new THREE.SphereGeometry(0.055, 6, 4), "#b8782f", ear, {
      embed: 0.35,
      bone: "head",
      scale: [1, 1.1, 0.45],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.032, 6, 4), "#4a2a1e", {
      at: ear.at.addScaledVector(ear.n, 0.03).add(V(0, 0, 0.018)),
      bone: "head",
      scale: [1, 1.1, 0.3],
      flat: true,
    });

    // whisker pads, dots and whiskers
    const pad = b.part(new THREE.SphereGeometry(0.05, 8, 6), CREAM, {
      at: [s * 0.036, 1.205, 0.985],
      bone: "head",
      flat: true,
    });
    const padSurf = b.surface(pad);
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 3; i++) {
        const q = padSurf.nearest([s * (0.03 + 0.018 * i), 1.218 - 0.018 * j, 1.06]);
        b.part(new THREE.SphereGeometry(0.0055, 4, 3), "#4a2a1e", { at: q.at, bone: "head" });
        if (i > 0) {
          const dir = V(s, 0.12 - 0.14 * j + (R() - 0.5) * 0.08, 0.3).normalize();
          b.rod(q.at, q.at.addScaledVector(dir, 0.15 + R() * 0.04), 0.0018, { color: WHITE, bone: "head", sides: 3 });
        }
      }

    // fangs
    b.spike([s * 0.022, 1.168, 1.03], [0, -1, 0.1], 0.032, 0.008, { color: WHITE, bone: "head", sides: 5, smooth: false });

    // cheek ruff
    for (let k = 0; k < 3; k++) {
      const base = V(s * 0.12, 1.25 - k * 0.04, 0.8 - k * 0.01);
      b.spike(base, V(s, -0.25 - k * 0.2, -0.35), 0.085, 0.04, {
        color: gradient("#c98a3e", "#e8c48a", base, base.clone().add(V(s * 0.08, -0.03, -0.03))),
        bone: "head",
        sides: 5,
        smooth: false,
      });
    }
  }

  // ---------- mane ----------
  b.part(new THREE.SphereGeometry(0.25, 7, 5), "#6b3416", {
    at: [0, 1.2, 0.55],
    bone: "neck2",
    scale: [1, 1.05, 1],
    flat: true,
    name: "maneMass",
  });
  const layers = [
    { z: 0.66, r: 0.12, count: 14, len: [0.2, 0.26], w: 0.075, tilt: -10, from: 0, root: "#8c4a1b", tip: "#e0a656", bone: "head" },
    { z: 0.56, r: 0.14, count: 16, len: [0.28, 0.35], w: 0.09, tilt: -28, from: 11, root: "#5e2b10", tip: "#bf7430", bone: "neck2" },
    { z: 0.45, r: 0.13, count: 14, len: [0.26, 0.32], w: 0.09, tilt: -50, from: 6, root: "#45200c", tip: "#94501f", bone: "neck2" },
  ];
  for (const L of layers) {
    b.ring(
      frame([0, 1.24, L.z], [0, 0, 1]),
      { count: L.count, radius: L.r, fromDeg: L.from, tilt: L.tilt },
      (item) => {
        const base = item.at;
        const dir = item.outward.clone().normalize();
        const len = L.len[0] + (L.len[1] - L.len[0]) * R();
        const tip = base.clone().addScaledVector(dir, len);
        b.spike(base, dir, len, L.w * (0.85 + 0.3 * R()), {
          color: gradient(L.root, L.tip, base, tip),
          bone: L.bone,
          sides: 5,
          smooth: false,
        });
      },
    );
  }
  // chest fringe
  for (let i = 0; i < 5; i++) {
    const x = -0.1 + i * 0.05;
    const base = V(x, 0.95, 0.58);
    const dir = V(x * 0.8, -1, 0.35).normalize();
    const len = 0.2 + R() * 0.06;
    b.spike(base, dir, len, 0.06, {
      color: gradient("#5e2b10", "#a35d24", base, base.clone().addScaledVector(dir, len)),
      bone: "chest",
      sides: 5,
      smooth: false,
    });
  }

  // ---------- tail tuft ----------
  const end = tail.at(1);
  const endAt = end.at;
  const tan = end.tangent.clone().normalize();
  b.part(new THREE.IcosahedronGeometry(0.065, 0), "#4a230d", {
    at: endAt.clone().addScaledVector(tan, 0.03),
    bone: "tail5",
    flat: true,
  });
  for (let k = 0; k < 7; k++) {
    const dir = tan
      .clone()
      .add(V((R() - 0.5) * 1.2, (R() - 0.5) * 1.2, (R() - 0.5) * 0.4))
      .normalize();
    const base = endAt.clone().addScaledVector(tan, 0.03);
    b.spike(base, dir, 0.11 + R() * 0.04, 0.035, {
      color: gradient("#3a1a0a", "#7a3b16", base, base.clone().addScaledVector(dir, 0.13)),
      bone: "tail5",
      sides: 5,
      smooth: false,
    });
  }

  return b.root;
}
```