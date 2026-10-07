```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  smoothstep,
  noise,
  catmull,
  aim,
} from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed toucan on a mossy branch",
  description:
    "A rigged keel-billed toucan with a rainbow beak, yellow bib and blue feet, perched on a mossy branch beside a pink orchid.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "toucan" });
  const rand = rng(11);
  const SPH = new THREE.SphereGeometry(1, 10, 8);
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 14);
  const ICO = new THREE.IcosahedronGeometry(0.01, 0);

  const BLACK = "#0c0d11";
  const BLUE = "#2f6fe0";
  const BARK = "#5a3d28";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.03, 0] });
  const pelvis = b.joint("pelvis", { parent: "root", at: [0, 0.17, -0.04], dir: [0, 1, 0.3] });
  const spine = b.chain("spine", [[0, 0.17, -0.04], [0, 0.25, 0.01], [0, 0.33, 0.06]], {
    parent: pelvis, role: "spine", names: ["spine1", "spine2"],
  });
  const neck = b.chain("neck", [[0, 0.33, 0.06], [0, 0.385, 0.09]], {
    parent: spine.joints[1], role: "neck", names: ["neck1"],
  });
  const head = b.joint("head", { parent: "neck1", at: [0, 0.4, 0.1], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 0.385, 0.13], dir: [0, -0.05, 1], role: "jaw" });
  const tail = b.chain("tail", [[0, 0.16, -0.06], [0, 0.12, -0.2], [0, 0.075, -0.33]], {
    parent: pelvis, role: "tail", names: ["tail1", "tail2"],
  });

  // ---------- paints ----------
  const sheen = paint((p, n) => mix("#0c0d11", "#1d2742", smoothstep(0.1, 0.9, n.y)));
  const bodyPaint = paint((p, n) => {
    const base = mix("#0c0d11", "#1d2742", smoothstep(0.1, 0.9, n.y));
    const v = Math.hypot(p.x / 0.06, (p.y - 0.31) / 0.07);
    const f = n.z > -0.1 ? smoothstep(1.05, 0.9, v) * smoothstep(-0.1, 0.4, n.z) : 0;
    const bib = mix("#ffd91a", "#fff6c0", smoothstep(0.3, 0.38, p.y));
    return mix(base, bib, f);
  });
  const beakPaint = (upper: boolean) =>
    paint((p, n) => {
      const t = Math.min(Math.max((p.z - 0.115) / 0.18, 0), 1);
      let c: [number, number, number];
      if (upper) {
        c = mix("#ff8f1f", "#8ed61f", smoothstep(0.35, 0.75, n.y)) as [number, number, number];
        c = mix(c, "#38b6ec", smoothstep(-0.2, -0.6, n.y)) as [number, number, number];
        c = mix(c, "#2a2018", smoothstep(-0.8, -0.97, n.y)) as [number, number, number];
      } else {
        c = mix("#3aa9e6", "#ff9a2a", smoothstep(0.1, 0.5, n.y)) as [number, number, number];
        c = mix(c, "#7fd8f2", smoothstep(-0.3, -0.9, n.y) * 0.5) as [number, number, number];
      }
      c = mix(c, "#d4122a", smoothstep(0.8, 0.9, t)) as [number, number, number];
      c = mix(c, "#16130f", smoothstep(0.07, 0.03, t)) as [number, number, number];
      return c;
    });
  const mossPaint = paint((p, n) => {
    const k = smoothstep(0.35, 0.65, 0.35 + 0.5 * n.y + (noise(p, 0.04, 5) - 0.5) * 0.9);
    const moss = mix("#4d7a2a", "#86b83c", noise(p, 0.015, 2));
    const bark = mix("#4a3322", "#6b4a30", noise(p, 0.01, 8));
    return mix(bark, moss, k);
  });

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.15, -0.12], w: 0.05, h: 0.05 },
      { at: [0, 0.18, -0.05], w: 0.12, h: 0.11 },
      { at: [0, 0.26, 0.02], w: 0.13, h: 0.12 },
      { at: [0, 0.34, 0.07], w: 0.1, h: 0.09 },
      { at: [0, 0.385, 0.09], w: 0.07, h: 0.07 },
    ],
    { color: bodyPaint, bone: [tail, spine, neck], name: "body" },
  );
  // scarlet patch under the tail
  b.part(SPH, "#e0201c", { at: [0, 0.135, -0.115], scale: [0.036, 0.02, 0.042], bone: "pelvis", name: "undertail" });
  // tail
  b.sweep(tail, (t) => [0.026 + 0.014 * t, 0.008 - 0.003 * t], { color: sheen, name: "tailFeathers" });

  // ---------- head ----------
  b.part(SPH, BLACK, { at: [0, 0.41, 0.1], scale: [0.048, 0.05, 0.056], bone: "head", name: "skull" });
  b.part(SPH, "#ffe45a", { at: [0, 0.375, 0.102], scale: [0.038, 0.032, 0.04], bone: "head", name: "throat" });
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const dir: [number, number, number] = [s, 0.05, 0.25];
    b.part(CYL, "#6fd0ee", { at: [s * 0.043, 0.42, 0.114], dir, scale: [0.031, 0.01, 0.031], bone: "head", name: "eyeBlue" + S });
    b.part(CYL, "#9be22a", { at: [s * 0.045, 0.42, 0.115], dir, scale: [0.024, 0.012, 0.024], bone: "head", name: "eyeRing" + S });
    b.part(SPH, "#07080a", { at: [s * 0.0485, 0.42, 0.118], scale: 0.0105, bone: "head", name: "eye" + S });
    b.part(SPH, "#ffffff", { at: [s * 0.0575, 0.4245, 0.1225], scale: 0.003, bone: "head", name: "glint" + S });
    b.part(SPH, "#1a1410", { at: [s * 0.0255, 0.428, 0.14], scale: [0.004, 0.004, 0.006], bone: "head", name: "nostril" + S });
  }

  // ---------- beak ----------
  const upperPath = catmull([[0, 0.42, 0.11], [0, 0.418, 0.18], [0, 0.405, 0.25], [0, 0.378, 0.295]]);
  b.sweep(
    upperPath,
    (t) => [0.03 * (1 - 0.75 * Math.pow(t, 1.5)) + 0.002, 0.04 * (1 - 0.85 * Math.pow(t, 1.3)) + 0.003],
    { color: beakPaint(true), bone: "head", sides: 10, name: "upperBeak" },
  );
  const lowerPath = catmull([[0, 0.368, 0.12], [0, 0.362, 0.18], [0, 0.362, 0.24], [0, 0.372, 0.29]]);
  b.sweep(
    lowerPath,
    (t) => [0.022 * (1 - 0.8 * Math.pow(t, 1.5)) + 0.002, 0.026 * (1 - 0.8 * t) + 0.003],
    { color: beakPaint(false), bone: "jaw", sides: 10, name: "lowerBeak" },
  );

  // ---------- wings, legs, toes ----------
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const wing = b.chain(
      "wing" + S,
      [[s * 0.065, 0.285, -0.005], [s * 0.105, 0.265, -0.05], [s * 0.125, 0.215, -0.11], [s * 0.135, 0.125, -0.19]],
      { parent: spine.joints[1], role: "wing", names: ["shoulder" + S, "elbow" + S, "wrist" + S, "wingtip" + S] },
    );
    b.membrane(
      wing,
      [[s * 0.06, 0.235, -0.03], [s * 0.1, 0.19, -0.08], [s * 0.125, 0.12, -0.15], [s * 0.14, 0.065, -0.21]],
      { color: sheen, thickness: 0.007, rows: 4, scallop: 0.08, name: "wingSkin" + S },
    );
    const leg = b.chain(
      "leg" + S,
      [[s * 0.04, 0.15, -0.01], [s * 0.045, 0.105, 0.015], [s * 0.04, 0.07, 0.01]],
      { parent: pelvis, role: "leg", names: ["hip" + S, "knee" + S, "foot" + S] },
    );
    b.sweep(leg, 0.011, { color: BLUE, name: "leg" + S });
    const toes: Array<[string, [number, number, number]]> = [
      ["toeF1", [s * 0.058, 0.05, 0.042]],
      ["toeF2", [s * 0.03, 0.05, 0.042]],
      ["toeB1", [s * 0.055, 0.05, -0.04]],
      ["toeB2", [s * 0.028, 0.05, -0.04]],
    ];
    for (const [n, tip] of toes) {
      b.sprout(n + S, leg.tip!, tip, [0.008, 0.005], { color: BLUE, role: "digit", count: 1 });
    }
  }

  // ---------- branch ----------
  const branch = b.sweep(
    catmull([[-0.34, 0.03, 0.01], [-0.1, 0.03, 0.0], [0.1, 0.03, -0.005], [0.28, 0.03, 0.01]]),
    (t) => 0.03 - 0.005 * Math.pow(2 * t - 1, 2),
    { color: mossPaint, bone: "root", sides: 10, name: "branch" },
  );
  b.rod([0.2, 0.04, 0], [0.245, 0.1, -0.02], [0.011, 0.007], { color: BARK, bone: "root", name: "stub" });
  const surf = b.surface(branch);
  const tufts = surf.scatter(16, { rng: rng(5), minDist: 0.03, filter: (h) => h.n.y > 0.3 });
  const greens = ["#5e9a2c", "#7bb83a", "#4a8a2a"];
  tufts.forEach((h, i) => {
    b.stick(ICO, greens[i % 3], h, { embed: 0.3, scale: 0.7 + rand() * 0.9, bone: "root", name: "moss" });
  });

  // ---------- orchid ----------
  b.rod([-0.24, 0.05, 0], [-0.265, 0.19, 0.005], [0.007, 0.004], { color: "#4f8a2c", bone: "root", name: "orchidStem" });
  b.capsule([-0.265, 0.19, 0.005], [-0.28, 0.27, -0.01], [0.004, 0.002], { color: "#4f8a2c", bone: "root", name: "orchidSpike" });
  b.part(SPH, "#ff9fcf", { at: [-0.272, 0.24, -0.006], scale: 0.007, bone: "root", name: "bud" });
  b.part(SPH, "#e86fae", { at: [-0.28, 0.275, -0.01], scale: 0.005, bone: "root", name: "bud" });
  b.part(SPH, "#2f7d32", { at: [-0.245, 0.075, 0.02], dir: [-0.5, 0.5, 1], axis: "z", scale: [0.016, 0.004, 0.06], bone: "root", name: "leaf" });
  b.part(SPH, "#2f7d32", { at: [-0.255, 0.08, -0.02], dir: [0.2, 0.5, -1], axis: "z", scale: [0.016, 0.004, 0.055], bone: "root", name: "leaf" });

  const flower = b.region({ at: [-0.27, 0.2, 0.03], quat: aim([0.35, 0.1, 1], [0, 1, 0], "z"), bone: "root" });
  const petal = (color: string, at: [number, number, number], scale: [number, number, number], rz = 0) =>
    flower.part(SPH, color, { at, scale, rotation: [0, 0, rz], bone: "root", name: "petal" });
  flower.part(SPH, "#4f8a2c", { at: [0, 0, -0.01], scale: [0.006, 0.006, 0.006], bone: "root", name: "calyx" });
  petal("#ffd0e6", [0, 0.028, 0], [0.014, 0.024, 0.0035]);
  petal("#ff74b8", [0.028, 0.006, 0.003], [0.03, 0.024, 0.0035], 15);
  petal("#ff74b8", [-0.028, 0.006, 0.003], [0.03, 0.024, 0.0035], -15);
  petal("#ffc2e0", [0.014, -0.03, 0.001], [0.013, 0.025, 0.0035], 20);
  petal("#ffc2e0", [-0.014, -0.03, 0.001], [0.013, 0.025, 0.0035], -20);
  petal("#c4177c", [0, -0.01, 0.007], [0.011, 0.016, 0.005]);
  petal("#9b0f63", [0, -0.024, 0.006], [0.006, 0.01, 0.003]);
  petal("#fff1a8", [0, 0.004, 0.011], [0.005, 0.005, 0.006]);

  // ---------- finish ----------
  const root = b.root;
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (m && !Array.isArray(m)) {
      m.roughness = 0.45;
      m.side = THREE.DoubleSide;
    }
  });
  return root;
}
```