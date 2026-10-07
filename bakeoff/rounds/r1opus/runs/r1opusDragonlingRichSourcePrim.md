```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  scales,
  stripes,
  spots,
  smoothstep,
  mix,
  resolve,
  catmull,
} from "agentic-3js-builder";
import type { SweepPoint } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon Hatchling",
  description:
    "A house-cat-sized baby dragon standing proudly beside its broken speckled egg: teal scales fading to a buttery belly, soft orange spines, stubby horns, oversized amber-membraned wings, a chubby spade-tipped tail, big amber eyes, a toothy grin and a curl of smoke from one nostril.",
};

const TEAL = "#2fb5a5";
const TEAL2 = "#27a597";
const TEAL3 = "#3fc6b3";
const TEAL_EDGE = "#17766f";
const TEAL_DARK = "#1b7f78";
const BUTTER = "#ffe39c";
const BUTTER_D = "#f0c46a";
const ORANGE = "#ff8a3d";
const ORANGE_D = "#ee6a2c";
const HORN = "#f7e9c8";
const HORN_D = "#d6b384";
const CLAW = "#fff4dc";
const MEMBRANE = "#ffab38";
const INK = "#2a1414";
const TOOTH = "#fffaf0";

export default function build() {
  const b = createBuilder({ name: "babyDragon", paintSize: 1024 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sph = (w = 12, h = 8) => new THREE.SphereGeometry(1, w, h);
  const R = rng(11);

  // ---------------------------------------------------------------- paints
  const scaleCoat = scales([TEAL, TEAL2, TEAL3], TEAL_EDGE, { size: 0.02, width: 0.16, seed: 3 });
  const bellyCoat = stripes(BUTTER, BUTTER_D, { size: 0.026, axis: "z", width: 0.16, wobble: 0.05, seed: 2 });
  const skin = paint((p, n) => {
    const under = smoothstep(-0.1, -0.6, n.y);
    const ax = Math.abs(p.x);
    const chest =
      p.z > 0.1 && p.y > 0.08 && p.y < 0.33 ? smoothstep(0.35, 0.8, n.z) * smoothstep(0.075, 0.035, ax) : 0;
    const t = Math.max(under, chest);
    const top = resolve(scaleCoat, p, n);
    const dark = mix(top, TEAL_EDGE, 0.3 * smoothstep(0.6, 1, n.y));
    if (t <= 0) return dark;
    return mix(dark, resolve(bellyCoat, p, n), t);
  });
  const eyePaint = (d: THREE.Vector3) =>
    paint((p, n) => {
      const c = n.dot(d);
      if (c > 0.6) return mix("#ffd43a", "#ff8800", smoothstep(0.97, 0.66, c));
      return mix("#ff8800", "#5a2400", smoothstep(0.6, 0.45, c));
    });
  const shellOut = spots("#fbf0d9", ["#7b5536", "#2a9d8f", "#b8643a"], { size: 0.03, amount: 0.45, seed: 9 });
  const eggPaint = (cx: number, cz: number, bowlUp = false) =>
    paint((p, n) => {
      const rx = p.x - cx;
      const rz = p.z - cz;
      const l = Math.hypot(rx, rz) || 1;
      const radial = (n.x * rx + n.z * rz) / l;
      if (radial < -0.2 || (bowlUp && n.y > 0.5 && radial < 0.3)) return "#fff6e2";
      return shellOut;
    });

  // ---------------------------------------------------------------- skeleton: trunk
  const hips = b.joint("hips", { at: [0, 0.16, -0.06], dir: [0, 0, 1] });
  const spine = b.chain("spine", [V(0, 0.17, -0.04), V(0, 0.205, 0.07), V(0, 0.24, 0.17)], {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", [V(0, 0.24, 0.17), V(0, 0.305, 0.205), V(0, 0.36, 0.22)], {
    parent: "spine2",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const H = V(0, 0.375, 0.235);
  const h = (x: number, y: number, z: number) => H.clone().add(V(x, y, z));
  const head = b.joint("head", { parent: "neck2", at: H, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: h(0, -0.03, 0.025), dir: [0, -0.12, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    [V(0, 0.15, -0.13), V(0, 0.11, -0.25), V(0, 0.07, -0.36), V(0, 0.05, -0.46), V(0, 0.055, -0.55)],
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------------------------------------------------------------- body
  const torso = b.loft(
    [
      { at: [0, 0.15, -0.15], w: 0.1, h: 0.1 },
      { at: [0, 0.165, -0.05], w: 0.17, h: 0.16 },
      { at: [0, 0.195, 0.06], w: 0.165, h: 0.165 },
      { at: [0, 0.24, 0.17], w: 0.12, h: 0.13 },
    ],
    { color: skin, bone: [hips, spine], name: "torso" },
  );
  const neckTube = b.sweep(neck, [0.055, 0.042], { color: skin, name: "neckTube" });
  const tailTube = b.sweep(tail, (t: number) => 0.05 + (0.017 - 0.05) * Math.pow(t, 0.8), {
    color: skin,
    name: "tailTube",
  });

  // spade
  b.extrude(
    [
      [0, 0.008],
      [0.02, 0.035],
      [0.045, 0.04],
      [0.09, 0, "sharp"],
      [0.045, -0.04],
      [0.02, -0.035],
      [0, -0.008],
    ],
    {
      color: ORANGE,
      at: V(0, 0.054, -0.545),
      x: [0, 0.05, -1],
      y: [1, 0, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      bone: "tail4",
      name: "tailSpade",
    },
  );

  // soft orange back spines
  const addSpine = (pt: SweepPoint, r: number, len: number, color: string) => {
    const dir = pt.axis.clone().add(V(0, 0, -0.6)).normalize();
    const center = pt.at.addScaledVector(dir, len * 0.33);
    b.part(new THREE.ConeGeometry(r, len, 5), color, { frame: pt, at: center, dir, flat: true });
  };
  [0.3, 0.6, 0.88].forEach((t, i) => addSpine(neckTube.at(t, 0), 0.011, 0.028, i % 2 ? ORANGE_D : ORANGE));
  [0.18, 0.34, 0.5, 0.66, 0.82].forEach((t, i) =>
    addSpine(torso.at(t, 0), 0.014 + 0.004 * Math.sin(Math.PI * t), 0.04, i % 2 ? ORANGE_D : ORANGE),
  );
  [0.08, 0.22, 0.36, 0.5, 0.64, 0.78].forEach((t, i) =>
    addSpine(tailTube.at(t, 0), 0.013 * (1 - 0.6 * t), 0.034 * (1 - 0.55 * t), i % 2 ? ORANGE : ORANGE_D),
  );

  // ---------------------------------------------------------------- head
  b.part(sph(14, 10), skin, { bone: head, at: h(0, 0.01, -0.005), scale: [0.07, 0.066, 0.07], name: "cranium" });
  b.part(sph(12, 8), skin, { bone: head, at: h(0, -0.005, 0.075), scale: [0.045, 0.028, 0.058], name: "snout" });
  b.part(sph(12, 8), skin, { bone: jaw, at: h(0, -0.045, 0.062), scale: [0.032, 0.014, 0.048], name: "lowerJaw" });
  b.part(sph(8, 6), "#e8607a", { bone: jaw, at: h(0, -0.036, 0.06), scale: [0.02, 0.006, 0.03], name: "tongue" });

  // teeth: upper fangs hang over the jaw, little lower teeth poke up
  for (let k = 0; k < 7; k++) {
    const a = ((-70 + (140 * k) / 6) * Math.PI) / 180;
    const big = k === 1 || k === 5;
    b.part(new THREE.ConeGeometry(big ? 0.0055 : 0.0042, big ? 0.018 : 0.013, 5), TOOTH, {
      bone: head,
      at: h(0.036 * Math.sin(a), -0.022, 0.075 + 0.046 * Math.cos(a)),
      dir: [0, -1, 0],
      flat: true,
    });
  }
  for (let k = 0; k < 4; k++) {
    const a = ((-55 + (110 * k) / 3) * Math.PI) / 180;
    b.part(new THREE.ConeGeometry(0.0035, 0.01, 5), TOOTH, {
      bone: jaw,
      at: h(0.027 * Math.sin(a), -0.031, 0.062 + 0.041 * Math.cos(a)),
      dir: [0, 1, 0],
      flat: true,
    });
  }

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // eyes
    const E = h(0.043 * s, 0.022, 0.042);
    const d = V(0.55 * s, 0.15, 0.82).normalize();
    b.part(sph(12, 10), eyePaint(d), { bone: head, at: E, scale: 0.026, name: `eye${L}` });
    b.part(sph(8, 6), INK, {
      bone: head,
      at: E.clone().addScaledVector(d, 0.022),
      dir: d,
      scale: [0.006, 0.005, 0.013],
      name: `pupil${L}`,
    });
    b.part(sph(6, 4), "#ffffff", {
      bone: head,
      at: E.clone().addScaledVector(d, 0.021).add(V(-0.006 * s, 0.011, 0.004)),
      scale: 0.0055,
    });
    b.part(sph(6, 4), "#ffffff", {
      bone: head,
      at: E.clone().addScaledVector(d, 0.024).add(V(0.004 * s, -0.007, 0.0)),
      scale: 0.0028,
    });
    // proud brow
    b.capsule(h(0.022 * s, 0.05, 0.062), h(0.064 * s, 0.047, 0.028), 0.0085, {
      color: TEAL_DARK,
      bone: head,
      sides: 6,
    });
    // stubby horns
    b.spike(h(0.03 * s, 0.058, -0.03), [0.25 * s, 0.55, -0.8], 0.058, 0.015, {
      bands: [
        [0.4, HORN_D],
        [1, HORN],
      ],
      bone: head,
      sides: 6,
    });
    b.spike(h(0.055 * s, 0.03, -0.045), [0.65 * s, 0.25, -0.75], 0.032, 0.009, {
      bands: [
        [0.4, HORN_D],
        [1, HORN],
      ],
      bone: head,
      sides: 6,
    });
    // cheek frills
    b.slab([h(0.058 * s, 0.0, -0.015), h(0.08 * s, 0.035, -0.065), h(0.09 * s, -0.025, -0.06)], {
      color: ORANGE,
      thickness: 0.004,
      bone: head,
    });
    b.slab([h(0.055 * s, -0.02, -0.01), h(0.085 * s, -0.025, -0.06), h(0.07 * s, -0.05, -0.04)], {
      color: ORANGE_D,
      thickness: 0.004,
      bone: head,
    });
    // nostrils
    b.part(sph(6, 4), INK, { bone: head, at: h(0.014 * s, 0.012, 0.115), scale: [0.0045, 0.003, 0.004] });
  }
  // little nose bumps and head crest
  b.part(sph(6, 4), TEAL_DARK, { bone: head, at: h(0, 0.022, 0.095), scale: [0.008, 0.006, 0.01], flat: true });
  b.part(sph(6, 4), TEAL_DARK, { bone: head, at: h(0, 0.025, 0.07), scale: [0.007, 0.005, 0.009], flat: true });
  [
    [0.074, -0.025, 0.012, 0.03],
    [0.064, -0.055, 0.011, 0.026],
    [0.044, -0.077, 0.009, 0.022],
  ].forEach(([y, z, r, len], i) => {
    const dir = V(0, 0.75, -0.7).normalize();
    b.part(new THREE.ConeGeometry(r, len, 5), i % 2 ? ORANGE_D : ORANGE, {
      bone: head,
      at: h(0, y, z).addScaledVector(dir, len * 0.3),
      dir,
      flat: true,
    });
  });

  // wisp of smoke curling from the left nostril
  const N = h(0.016, 0.016, 0.12);
  const smokePath = catmull([
    N,
    N.clone().add(V(0.006, 0.025, 0.012)),
    N.clone().add(V(0.022, 0.05, 0.008)),
    N.clone().add(V(0.03, 0.075, -0.012)),
    N.clone().add(V(0.012, 0.095, -0.02)),
    N.clone().add(V(-0.004, 0.088, -0.004)),
    N.clone().add(V(0.004, 0.075, 0.004)),
  ]);
  b.sweep(smokePath, (t: number) => 0.003 + 0.008 * Math.sin(Math.PI * t) * (1 - 0.3 * t), {
    color: (t: number) => (t < 0.3 ? "#9aa3a8" : t < 0.65 ? "#c3cacd" : "#e6eaeb"),
    bone: head,
    sides: 6,
    name: "smoke",
  });
  [
    [0.45, 0.012, 0.006],
    [0.7, -0.012, 0.005],
    [0.95, 0.01, 0.0045],
  ].forEach(([t, dx, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), "#eef2f3", {
      bone: head,
      at: smokePath.at(t).add(V(dx, 0.006, 0)),
      flat: true,
    }),
  );

  // ---------------------------------------------------------------- legs, wings
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // front leg
    const front = b.chain(
      `frontLeg${L}`,
      [V(0.07 * s, 0.2, 0.14), V(0.085 * s, 0.11, 0.12), V(0.085 * s, 0.04, 0.155), V(0.085 * s, 0.024, 0.2)],
      { parent: "spine2", names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`], role: "leg" },
    );
    b.sweep(front, [0.033, 0.026, 0.022, 0.019], { color: skin });
    b.part(sph(10, 6), skin, { bone: `wrist${L}`, at: V(0.085 * s, 0.02, 0.19), scale: [0.03, 0.02, 0.035] });
    for (const dx of [-0.015, 0, 0.015])
      b.spike(V(0.085 * s + dx, 0.014, 0.217), [0, -0.4, 1], 0.016, 0.005, {
        color: CLAW,
        bone: `wrist${L}`,
        sides: 5,
      });

    // hind leg
    const hind = b.chain(
      `hindLeg${L}`,
      [V(0.075 * s, 0.15, -0.05), V(0.105 * s, 0.1, 0.02), V(0.1 * s, 0.045, -0.035), V(0.1 * s, 0.024, 0.035)],
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(hind, [0.045, 0.032, 0.024, 0.021], { color: skin });
    b.part(sph(12, 8), skin, { bone: `hip${L}`, at: V(0.088 * s, 0.13, -0.02), scale: [0.045, 0.055, 0.06] });
    b.part(sph(10, 6), skin, { bone: `ankle${L}`, at: V(0.1 * s, 0.02, 0.025), scale: [0.032, 0.02, 0.042] });
    for (const dx of [-0.016, 0, 0.016])
      b.spike(V(0.1 * s + dx, 0.014, 0.06), [0, -0.4, 1], 0.017, 0.0055, {
        color: CLAW,
        bone: `ankle${L}`,
        sides: 5,
      });

    // wing: arm, three fingers, amber membranes
    const WS = V(0.05 * s, 0.27, 0.1);
    const WE = V(0.17 * s, 0.33, 0.05);
    const WW = V(0.29 * s, 0.38, 0.01);
    const arm = b.chain(`wing${L}`, [WS, WE, WW], {
      parent: "spine2",
      names: [`wingShoulder${L}`, `wingElbow${L}`, `wingWrist${L}`],
      role: "wing",
    });
    b.sweep(arm, [0.017, 0.013, 0.011], { color: TEAL_DARK });
    b.part(sph(8, 6), TEAL_DARK, { bone: `wingWrist${L}`, at: WW, scale: 0.015, flat: true });
    b.part(sph(8, 6), TEAL_DARK, { bone: `wingElbow${L}`, at: WE, scale: 0.016, flat: true });
    b.spike(WW, [0.25 * s, 0.45, 1], 0.026, 0.006, { color: CLAW, bone: `wingWrist${L}`, sides: 5 });

    const tips = [
      [V(0.4 * s, 0.43, -0.01), V(0.52 * s, 0.45, -0.04)],
      [V(0.4 * s, 0.35, -0.08), V(0.5 * s, 0.3, -0.17)],
      [V(0.34 * s, 0.28, -0.13), V(0.38 * s, 0.2, -0.26)],
    ];
    const fingers = tips.map(([mid, tip], k) => {
      const f = b.chain(`wingFinger${k + 1}${L}`, [WW, mid, tip], {
        parent: `wingWrist${L}`,
        names: [`wingFinger${k + 1}a${L}`, `wingFinger${k + 1}b${L}`],
        role: "digit",
      });
      b.sweep(f, [0.009, 0.006, 0.0035], { color: TEAL_DARK, caps: { start: "round", end: "point" }, sides: 6 });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { color: MEMBRANE, thickness: 0.003, scallop: 0.22 });
    b.membrane(fingers[1], fingers[2], { color: MEMBRANE, thickness: 0.003, scallop: 0.22 });
    b.membrane(arm, [V(0.06 * s, 0.22, -0.08), V(0.21 * s, 0.23, -0.14), tips[2][1]], {
      color: MEMBRANE,
      thickness: 0.003,
    });
  }
  const mem = b.material(MEMBRANE);
  mem.transparent = true;
  mem.opacity = 0.86;
  mem.emissive = new THREE.Color("#a04600");
  mem.emissiveIntensity = 0.35;
  mem.side = THREE.DoubleSide;

  // ---------------------------------------------------------------- broken egg
  const EX = -0.27;
  const EZ = 0.22;
  b.joint("egg", { parent: hips, at: [EX, 0, EZ] });
  b.lathe(
    [
      [0, 0],
      [0.045, 0.004],
      [0.075, 0.025],
      [0.088, 0.06],
      [0.09, 0.092],
      [0.084, 0.092],
      [0.082, 0.06],
      [0.07, 0.03],
      [0.042, 0.012],
      [0, 0.008],
    ],
    { color: eggPaint(EX, EZ), at: [EX, 0, EZ], segments: 10, bone: "egg", name: "eggShell" },
  );
  const rr = 0.087;
  for (let k = 0; k < 10; k++) {
    const a = ((18 + 36 * k) * Math.PI) / 180;
    const dl = (18 * Math.PI) / 180;
    const top = 0.1 + 0.012 + R() * 0.035;
    b.slab(
      [
        V(EX + rr * Math.sin(a - dl), 0.088, EZ + rr * Math.cos(a - dl)),
        V(EX + rr * Math.sin(a + dl), 0.088, EZ + rr * Math.cos(a + dl)),
        V(EX + rr * Math.sin(a + (R() - 0.5) * 0.3), top, EZ + rr * Math.cos(a)),
      ],
      { color: eggPaint(EX, EZ), thickness: 0.005, bone: "egg" },
    );
  }
  // the hatched-off cap, upturned on the floor
  const CX = -0.43;
  const CZ = 0.05;
  b.lathe(
    [
      [0, 0.06],
      [0.032, 0.054],
      [0.056, 0.036],
      [0.068, 0.012],
      [0.068, 0.0],
      [0.062, 0.0],
      [0.062, 0.012],
      [0.05, 0.033],
      [0.028, 0.049],
      [0, 0.054],
    ],
    { color: eggPaint(CX, CZ, true), at: [CX, 0.059, CZ], axis: [0, -1, 0], segments: 8, bone: "egg", name: "eggCap" },
  );
  // scattered shell chips
  [
    [-0.15, 0.33, 0.022],
    [-0.38, 0.34, 0.028],
    [-0.21, 0.4, 0.018],
    [-0.47, 0.2, 0.02],
  ].forEach(([cx, cz, size]) => {
    const n = 4 + Math.floor(R() * 2);
    const start = R() * Math.PI * 2;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = start + (i / n) * Math.PI * 2;
      const r = size * (0.6 + 0.5 * R());
      return V(cx + r * Math.cos(a), 0.002, cz + r * Math.sin(a));
    });
    b.slab(pts, { color: eggPaint(EX, EZ), thickness: 0.004, bone: "egg" });
  });

  return b.root;
}
```