```ts
import * as THREE from "three";
import { createBuilder, svg, mottle, spots, grain, stripes, gradient } from "agentic-3js-builder";

export const meta = {
  name: "Battle-Worn Knight",
  description:
    "Plate-armoured knight with a plumed great helm, gold-filigreed layered pauldrons, a blue griffin surcoat, a kite shield, a broadsword and a torn crimson cape.",
};

const GOLD = "#d4a62a";
const GOLD_D = "#9c7416";
const CRIMSON = "#a8141f";
const CRIMSON_D = "#7d0e18";
const BLUE = "#17338a";
const LEATHER = "#4a2f1c";
const DARK = "#0b0d12";

const griffinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
<g stroke="#232a3a" stroke-width="2.4" stroke-linejoin="round" fill="#dfe5ef">
<path d="M60 92 C84 98 92 78 82 58 C98 76 92 106 62 112 Z"/>
<path d="M44 64 C22 52 10 32 6 6 C22 16 34 14 48 8 C38 20 34 30 34 40 C42 38 50 34 58 32 C48 42 46 52 52 62 Z"/>
<path d="M62 90 L74 120 L60 122 L50 98 Z"/>
<ellipse cx="48" cy="86" rx="24" ry="17"/>
<path d="M34 98 L20 112 L28 118 L42 106 Z"/>
<path d="M40 84 L24 96 L32 102 L46 92 Z"/>
<path d="M34 76 C32 58 34 46 40 40 L58 40 C62 50 58 68 54 84 Z"/>
<circle cx="46" cy="30" r="12"/>
</g>
<path d="M36 28 L18 38 L38 42 Z" fill="#d9a82b" stroke="#232a3a" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M40 20 L36 6 L48 16 Z" fill="#dfe5ef" stroke="#232a3a" stroke-width="2.4" stroke-linejoin="round"/>
<circle cx="44" cy="28" r="2.4" fill="#232a3a"/>
<path d="M44 66 L58 66 M42 74 L56 74" stroke="#232a3a" stroke-width="1.6" fill="none"/>
</svg>`;

const filigreeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70">
<g fill="none" stroke="#e0b030" stroke-width="3.2" stroke-linecap="round">
<path d="M6 35 C20 5 40 5 50 35 C60 65 80 65 94 35"/>
<path d="M6 35 C20 65 40 65 50 35 C60 5 80 5 94 35"/>
<circle cx="25" cy="20" r="5"/><circle cx="75" cy="50" r="5"/>
<circle cx="25" cy="50" r="5"/><circle cx="75" cy="20" r="5"/>
<path d="M50 8 L50 62"/><path d="M2 35 L10 35 M90 35 L98 35"/>
</g></svg>`;

const nrm = (v: number[]) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => x / l);
};

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 2048 });

  const steel = mottle(
    spots(grain("#b0b8c5", "#8d96a4", { size: 0.012, axis: "x", seed: 2 }), "#626a76", {
      size: 0.11,
      amount: 0.22,
      seed: 4,
    }),
    "#7a8391",
    { size: 0.16, contrast: 0.5, seed: 7 },
  );
  const griffin = svg(griffinSvg, { size: 256 });
  const filigree = svg(filigreeSvg, { size: 256 });

  const S = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const Bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const Cy = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);
  const Cn = (r: number, h: number, n = 6) => new THREE.ConeGeometry(r, h, n);
  const T = (r: number, t: number, n = 12) => new THREE.TorusGeometry(r, t, 5, n);
  const add = (g: THREE.BufferGeometry, c: any, at: number[], bone: string, o: any = {}) =>
    b.part(g, c, { at, bone, ...o });
  const band = (p: number[], d: number[], r: number, t: number, col: string, bone: string) =>
    b.part(T(r, t), col, { at: p, dir: d, axis: "z", bone });
  const dent = (p: number[], n: number[], r: number, bone: string) =>
    add(S(1, 6, 4), "#555d68", p, bone, { scale: [r, r, r * 0.25], dir: n, axis: "z" });
  const scratch = (p: number[], len: number, deg: number, bone: string, col = "#d3dae4") =>
    add(Bx(len, 0.0025, 0.004), col, p, bone, { rotation: [0, 0, deg] });

  // ---------------- skeleton ----------------
  b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  b.chain(
    "spine",
    [
      [0, 1.0, 0],
      [0, 1.17, 0],
      [0, 1.34, 0],
      [0, 1.5, 0],
    ],
    { parent: "hips", names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  b.chain(
    "neck",
    [
      [0, 1.5, 0],
      [0, 1.6, 0],
    ],
    { parent: "spine3", names: ["neck"], role: "neck" },
  );
  b.joint("head", { parent: "neck", at: [0, 1.6, 0], dir: [0, 1, 0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.64, -0.03], dir: [0, 0, 1], role: "jaw" });

  // ---------------- torso ----------------
  add(Bx(0.36, 0.14, 0.24), steel, [0, 0.93, 0], "hips");
  b.frustumBox([0, 1.5, 0], [0, 1.0, 0], [0.4, 0.23], [0.32, 0.2], { color: steel, bone: "spine2", name: "cuirass" });
  const front = b.frustumBox([0, 1.38, 0.125], [0, 0.46, 0.12], [0.3, 0.03], [0.36, 0.03], {
    color: BLUE,
    bone: "spine2",
    name: "surcoatFront",
  });
  b.frustumBox([0, 1.38, -0.125], [0, 0.46, -0.12], [0.3, 0.03], [0.36, 0.03], {
    color: BLUE,
    bone: "spine2",
    name: "surcoatBack",
  });
  add(Bx(0.37, 0.026, 0.04), GOLD, [0, 0.47, 0.12], "spine1");
  add(Bx(0.37, 0.026, 0.04), GOLD_D, [0, 0.47, -0.12], "spine1");
  add(Bx(0.36, 0.06, 0.3), LEATHER, [0, 1.03, 0], "spine1", { name: "belt" });
  add(Bx(0.065, 0.055, 0.02), GOLD, [0, 1.03, 0.155], "spine1");
  add(Bx(0.03, 0.03, 0.022), LEATHER, [0, 1.03, 0.158], "spine1");
  for (const s of [1, -1]) {
    add(Bx(0.025, 0.2, 0.16), steel, [s * 0.2, 0.88, 0], "hips", { rotation: [0, 0, s * 8] });
    add(Bx(0.025, 0.1, 0.15), steel, [s * 0.215, 0.76, 0], "hips", { rotation: [0, 0, s * 10] });
    add(S(0.025), GOLD, [s * 0.13, 1.5, 0.115], "spine3");
  }
  b.rod([-0.13, 1.5, 0.115], [0.13, 1.5, 0.115], 0.006, { color: GOLD, bone: "spine3" });
  b.decal(front, griffin, { at: [0, 1.17, 0.14], dir: [0, 0, 1], size: [0.2, 0.26], segments: [8, 10] });

  // gorget
  add(Cy(0.09, 0.125, 0.09, 10), steel, [0, 1.5, 0], "neck");
  const collar = T(0.105, 0.01, 10);
  collar.rotateX(Math.PI / 2);
  add(collar, GOLD, [0, 1.545, 0], "neck");

  // ---------------- cape ----------------
  const cx = [
    [-0.29, 1.55], [0.29, 1.55], [0.35, 1.1], [0.34, 0.8], [0.3, 0.6], [0.26, 0.62], [0.22, 0.42], [0.16, 0.55],
    [0.1, 0.36], [0.03, 0.5], [-0.04, 0.3], [-0.11, 0.46], [-0.19, 0.4], [-0.24, 0.58], [-0.31, 0.5],
    [-0.35, 0.8], [-0.36, 1.1],
  ];
  const capePaint = gradient(
    stripes(CRIMSON, CRIMSON_D, { size: 0.07, axis: "x", width: 0.5, wobble: 0.6, seed: 3 }),
    "#4e090f",
    [0, 1.3, 0],
    [0, 0.35, 0],
  );
  b.slab(
    cx.map(([x, y]) => [x, y, -0.16 - (1.55 - y) * 0.12]),
    { color: capePaint, thickness: 0.012, bone: "spine3", name: "cape" },
  );
  add(Bx(0.52, 0.07, 0.05), CRIMSON, [0, 1.52, -0.14], "spine3");

  // ---------------- helm ----------------
  const helm = b.lathe(
    [[0, 0], [0.113, 0], [0.12, 0.04], [0.12, 0.17], [0.108, 0.23], [0.07, 0.265], [0, 0.275]],
    { color: steel, at: [0, 1.62, 0], bone: "head", segments: 10, spin: 18, name: "helm" },
  );
  void helm;
  b.lathe([[0, 0], [0.09, 0], [0.105, 0.04], [0.112, 0.09], [0.113, 0.1], [0, 0.1]], {
    color: steel, at: [0, 1.53, 0], bone: "jaw", segments: 10, spin: 18, name: "bevor",
  });
  for (const y of [1.712, 1.758])
    b.lathe([[0.118, -0.008], [0.127, -0.008], [0.127, 0.008], [0.118, 0.008]], {
      color: "#59616d", at: [0, y, 0], bone: "head", segments: 10, spin: 18,
    });
  add(Bx(0.075, 0.016, 0.02), DARK, [0, 1.735, 0.108], "head", { name: "eyeSlit" });
  add(Bx(0.02, 0.24, 0.012), "#59616d", [0, 1.745, 0.12], "head");
  for (const y of [1.56, 1.58, 1.6])
    for (const x of [-0.018, 0.018]) add(Bx(0.01, 0.01, 0.01), DARK, [x, y, 0.103], "jaw");
  const rimTop = T(0.113, 0.008, 10);
  rimTop.rotateX(Math.PI / 2);
  add(rimTop, GOLD, [0, 1.625, 0], "head", { rotation: [0, 18, 0] });
  // plume
  add(Bx(0.03, 0.025, 0.26), "#59616d", [0, 1.89, -0.02], "head");
  for (let i = 0; i < 11; i++) {
    const a = (15 + (i * 150) / 10) * (Math.PI / 180);
    const deg = a / (Math.PI / 180);
    const len = 0.13 + (deg > 120 ? 0.05 : 0) + (deg < 40 ? -0.02 : 0);
    const cy = 1.885 + Math.sin(a) * 0.11;
    const cz = -0.03 + Math.cos(a) * 0.11;
    add(S(1, 6, 5), ["#b3131f", "#8c0f1b", "#c4222c"][i % 3], [0, cy, cz], "head", {
      scale: [0.022, len, 0.05],
      rotation: [90 - deg, 0, 0],
    });
  }

  // ---------------- limbs ----------------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    // legs
    const hip = [s * 0.1, 0.95, 0], knee = [s * 0.115, 0.5, 0.015], ankle = [s * 0.125, 0.09, 0];
    b.chain(`leg${n}`, [hip, knee, ankle], {
      parent: "hips", names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg",
    });
    b.joint(`toe${n}`, { parent: `ankle${n}`, at: [s * 0.125, 0.04, 0.1], dir: [0, 0, 1] });
    b.capsule(hip, knee, [0.078, 0.064], { color: steel, bone: `hip${n}`, name: `thigh${n}` });
    b.capsule(knee, ankle, [0.058, 0.046], { color: steel, bone: `knee${n}`, name: `shin${n}` });
    add(S(0.07), steel, [knee[0], knee[1], knee[2] + 0.035], `knee${n}`);
    add(Cn(0.025, 0.07), GOLD, [knee[0], knee[1], knee[2] + 0.11], `knee${n}`, { dir: [0, 0, 1] });
    band([knee[0], knee[1] - 0.09, knee[2]], [0, -1, 0], 0.06, 0.008, GOLD, `knee${n}`);
    add(Bx(0.1, 0.08, 0.15), steel, [s * 0.125, 0.04, 0.045], `ankle${n}`);
    add(S(1, 8, 6), steel, [s * 0.125, 0.04, 0.12], `toe${n}`, { scale: [0.05, 0.04, 0.055] });
    dent([knee[0] + s * 0.03, knee[1] - 0.2, 0.052], [0, 0.1, 1], 0.025, `knee${n}`);

    // arms
    const S_ = [s * 0.26, 1.44, 0], E = [s * 0.34, 1.17, -0.02], W = [s * 0.41, 1.0, 0.2];
    const H = [s * 0.43, 0.96, 0.25];
    const dF = nrm([W[0] - E[0], W[1] - E[1], W[2] - E[2]]);
    b.chain(`arm${n}`, [S_, E, W], {
      parent: "spine3", names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "arm",
    });
    b.capsule(S_, E, [0.058, 0.05], { color: steel, bone: `shoulder${n}`, name: `upperArm${n}` });
    b.capsule(E, W, [0.05, 0.043], { color: steel, bone: `elbow${n}`, name: `forearm${n}` });
    add(S(0.062), steel, E, `elbow${n}`);
    add(Cn(0.022, 0.07), GOLD, [E[0], E[1], E[2] - 0.08], `elbow${n}`, { dir: [0, 0, -1] });
    band(W, dF, 0.05, 0.009, GOLD, `elbow${n}`);
    band(E, dF, 0.056, 0.008, GOLD, `elbow${n}`);

    // pauldrons
    const tilt = -s * 22;
    const lames: Array<[number, number, number]> = [[0.1, 1.545, 0.22], [0.125, 1.5, 0.255], [0.15, 1.455, 0.285]];
    lames.forEach(([r, y, x], i) => {
      const g = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
      const lame = add(g, steel, [s * x, y, 0], `shoulder${n}`, {
        scale: [r, r * 0.62, r * 1.05],
        rotation: [0, 0, tilt],
      });
      const tr = new THREE.TorusGeometry(1, 0.06, 4, 12);
      tr.rotateX(Math.PI / 2);
      add(tr, GOLD, [s * x, y, 0], `shoulder${n}`, { scale: [r, r, r * 1.05], rotation: [0, 0, tilt] });
      if (i > 0) {
        const alpha = i === 2 ? 0.9 : 1.0;
        const u = new THREE.Vector3(s * Math.sin(alpha), Math.cos(alpha), 0).applyAxisAngle(
          new THREE.Vector3(0, 0, 1),
          (tilt * Math.PI) / 180,
        );
        b.decal(lame, filigree, {
          at: [s * x + u.x * r, y + u.y * r * 0.62, 0],
          dir: [u.x, u.y, 0],
          up: [0, 0, 1],
          size: [0.12, 0.085],
          mirror: s < 0,
          segments: [8, 6],
        });
      }
    });
    dent([s * 0.38, 1.5, 0.06], [s * 0.6, 0.7, 0.4], 0.025, `shoulder${n}`);

    // hand
    add(Bx(0.085, 0.1, 0.04), steel, [H[0], H[1], H[2] - 0.035], `wrist${n}`, { name: `palm${n}` });
    for (let i = 0; i < 4; i++) {
      const y = H[1] + (i - 1.5) * 0.026;
      const j = b.joint(`finger${i + 1}${n}`, { parent: `wrist${n}`, at: [H[0], y, H[2]], dir: [0, 0, 1], role: "digit" });
      add(Bx(0.075, 0.023, 0.045), steel, [H[0], y, H[2] + 0.03], j.name);
    }
    const th = b.joint(`thumb${n}`, { parent: `wrist${n}`, at: [H[0], H[1] + 0.068, H[2] - 0.03], dir: [0, 0, 1], role: "digit" });
    add(Bx(0.035, 0.03, 0.07), steel, [H[0], H[1] + 0.068, H[2] + 0.005], th.name);

    if (s < 0) {
      // broadsword
      const bn = `wrist${n}`;
      add(Cy(0.018, 0.018, 0.2, 6), LEATHER, H, bn, { name: "swordGrip" });
      add(S(0.032, 6, 5), GOLD, [H[0], H[1] - 0.115, H[2]], bn);
      add(Bx(0.26, 0.03, 0.04), GOLD, [H[0], H[1] + 0.115, H[2]], bn, { name: "crossguard" });
      for (const k of [1, -1]) add(S(0.024, 6, 5), GOLD, [H[0] + k * 0.13, H[1] + 0.115, H[2]], bn);
      const by = H[1] + 0.13;
      b.extrude(
        [
          [-0.03, 0], [0.03, 0], [0.03, 0.28], [0.021, 0.3], [0.03, 0.32], [0.03, 0.6], [0, 0.76],
          [-0.03, 0.6], [-0.03, 0.45], [-0.022, 0.43], [-0.03, 0.41],
        ],
        { color: "#cfd6e0", at: [H[0], by, H[2]], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.014, 0.006], bone: bn, name: "blade" },
      );
      add(Bx(0.01, 0.45, 0.02), "#a9b2bf", [H[0], by + 0.3, H[2]], bn);
    } else {
      // kite shield
      const bn = `elbow${n}`;
      const outline: any[] = [
        [-0.25, 0.5], [0.25, 0.5], [0.25, 0.25], [0.17, -0.1], [0, -0.55, "sharp"], [-0.17, -0.1], [-0.25, 0.25],
      ];
      const k = 0.88;
      const inner = outline.map((p) => (p[2] ? [p[0] * k, p[1] * k - 0.02, "sharp"] : [p[0] * k, p[1] * k - 0.02]));
      const org = [0.37, 0.98, 0.33];
      b.extrude(outline, { color: GOLD_D, at: org, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.036, bevel: 0.01, smoothing: 1, bone: bn, name: "shieldRim" });
      const face = b.extrude(inner, { color: BLUE, at: org, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.008, smoothing: 1, bone: bn, name: "shieldFace" });
      b.decal(face, griffin, { at: [0.37, 1.08, 0.36], dir: [0, 0, 1], size: [0.3, 0.39], segments: [8, 10] });
      add(Cy(0.012, 0.012, 0.16, 6), LEATHER, H, bn);
      for (const [px, py] of [[0.2, 1.42], [0.54, 1.42], [0.37, 1.46]]) add(S(0.014, 5, 4), GOLD, [px, py, 0.36], bn);
      scratch([0.3, 0.8, 0.358], 0.12, 35, bn);
      scratch([0.47, 0.95, 0.358], 0.09, -50, bn);
      scratch([0.34, 1.3, 0.358], 0.1, 70, bn, "#8ea3d0");
      scratch([0.45, 0.7, 0.358], 0.07, 15, bn, "#8ea3d0");
      dent([0.5, 1.2, 0.357], [0, 0, 1], 0.03, bn);
    }
  }

  // helm and chest battle damage
  dent([0.118, 1.72, 0.03], [1, 0, 0.2], 0.025, "head");
  dent([-0.06, 1.8, 0.1], [-0.3, 0.3, 1], 0.02, "head");
  scratch([0.07, 1.8, 0.1], 0.07, 60, "head");
  scratch([-0.03, 1.68, 0.115], 0.05, -35, "head");
  scratch([0.1, 1.44, 0.117], 0.08, 25, "spine3");
  dent([-0.1, 1.45, 0.118], [0, 0, 1], 0.025, "spine3");

  return b.root;
}
```