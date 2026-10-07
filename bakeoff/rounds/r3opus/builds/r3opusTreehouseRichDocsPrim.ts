import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  paint,
  mottle,
  grain,
  spots,
  scales,
  countershade,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cozy Treehouse Diorama",
  description:
    "A grassy round diorama base with a thick old oak, a red-shingled wooden cabin with a round window nestled in its branches, rope ladder, swing, pennant, lantern, string lights, mushrooms and a bicycle.",
};

const V = THREE.Vector3;

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const rand = rng(11);
  const root = b.joint("root", { at: [0, 0, 0] });
  const ON = { bone: root };

  // ---------- palette ----------
  const MOSS = "#5f8f3a";
  const GLOW = "#ffd36a";
  const GLOW2 = "#ffe9a8";
  const TRIM = "#f1e4c3";
  const DARKWOOD = "#4a3122";
  const ROPE = "#c9a46a";
  const TEAL = "#2f7d78";
  const RED = "#c63a2c";
  const CREAM = "#f6ecd6";
  const IRON = "#2e2a28";

  // ---------- paints ----------
  const grassTop = mottle("#68a843", "#84bf51", { size: 0.7, seed: 2 });
  const soil = paint((p) => {
    const k = Math.sin(p.y * 26 + noise(p, 0.5, 5) * 6);
    return k > 0.35 ? "#5c3b22" : k < -0.6 ? "#8a6040" : "#74502f";
  });
  const basePaint = paint((p) => (p.y > 0.4 + (noise(p, 0.35, 9) - 0.5) * 0.14 ? grassTop : soil));
  const barkGrain = grain("#7a5638", "#553823", { size: 0.12, axis: "y", seed: 4 });
  const bark = paint((p) => (p.y < 1.7 && noise(p, 0.45, 3) > 0.56 ? MOSS : barkGrain));
  const deckTop = 3.62;
  const siding = paint((p) => {
    const f = ((((p.y - deckTop) / 0.18) % 1) + 1) % 1;
    if (f < 0.12) return "#8a5a34";
    return noise(p, 0.6, 8) > 0.56 ? "#d39a5c" : "#c48a4e";
  });
  const plankA = grain("#b98552", "#9c6a3e", { size: 0.06, axis: "x", seed: 1 });
  const plankB = grain("#a87445", "#86562f", { size: 0.06, axis: "x", seed: 2 });
  const doorPaint = paint((p) => ((((p.x + 10) / 0.165) % 1) < 0.12 ? "#235f5b" : TEAL));
  const shutterPaint = paint((p) => ((((p.y + 10) / 0.07) % 1) < 0.3 ? "#245f5a" : "#3a918a"));
  const crownPaint = countershade(mottle("#6cb84b", "#4b983b", { size: 1.0, seed: 6 }), "#2f6b31", { level: -0.15 });
  const leafTint = mottle("#93d46a", "#58a643", { size: 1.4, seed: 9 });
  const grassTint = mottle("#7fbf4f", "#a8d862", { size: 0.8, seed: 12 });
  const stone = scales("#a69a90", "#665b53", { size: 0.1, seed: 3 });
  const wicker = paint((p) => {
    const a = Math.floor(p.y / 0.035) + Math.floor((p.x + p.z) / 0.035);
    return ((a % 2) + 2) % 2 ? "#c8995a" : "#a87a40";
  });
  const pennant = paint((_p, _n, s) => (Math.abs(s[1] - 0.17) < 0.045 ? "#fff4d6" : "#f2b632"));
  const matPaint = paint((p) => ((((p.z + 10) / 0.08) % 1) < 0.5 ? "#b8433a" : "#e9c46a"));

  // ---------- merge helper ----------
  const groups = new Map<string, { color: any; geos: THREE.BufferGeometry[] }>();
  const add = (key: string, color: any, g: THREE.BufferGeometry) => {
    const ng = g.index ? g.toNonIndexed() : g;
    if (!groups.has(key)) groups.set(key, { color, geos: [] });
    groups.get(key)!.geos.push(ng);
  };
  const bx = (key: string, color: any, s: number[], at: number[], rot: number[] = [0, 0, 0]) => {
    const g = new THREE.BoxGeometry(s[0], s[1], s[2]);
    g.rotateX(rot[0]).rotateY(rot[1]).rotateZ(rot[2]);
    g.translate(at[0], at[1], at[2]);
    add(key, color, g);
  };

  // ---------- base ----------
  const TOP = 0.5;
  const base = b.lathe(
    [
      [0, 0],
      [5.3, 0],
      [5.5, 0.1],
      [5.5, 0.36],
      [5.42, 0.46],
      [5.25, TOP],
      [0, TOP],
    ],
    { at: [0, 0, 0], segments: 28, color: basePaint, bone: root },
  );

  // rim rocks
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + rand() * 0.4;
    const g = new THREE.DodecahedronGeometry(0.22 + rand() * 0.12, 0);
    g.scale(1.2, 0.6, 1);
    b.part(g, i % 2 ? "#9a978c" : "#86837a", {
      at: [Math.sin(a) * 4.95, TOP + 0.04, Math.cos(a) * 4.95],
      rotation: [0, rand() * 360, 0],
      flat: true,
      ...ON,
    });
  }

  // ---------- oak trunk & roots ----------
  const trunkPath = catmull([
    [0, 0.3, -0.9],
    [0.12, 2, -0.95],
    [-0.05, 4, -0.88],
    [0.1, 6, -1.0],
    [0, 7.8, -1.1],
  ]);
  const trunk = b.sweep(trunkPath, [0.9, 0.66, 0.56, 0.48, 0.36], {
    color: bark,
    bone: root,
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "round" },
  });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.4;
    const dx = Math.sin(a), dz = Math.cos(a);
    const reach = 2.0 + rand() * 0.5;
    b.sweep(
      bezier([dx * 0.45, 1.1, -0.9 + dz * 0.45], [dx * 1.3, 0.62, -0.9 + dz * 1.3], [dx * reach, 0.47, -0.9 + dz * reach]),
      [0.34, 0.05],
      { color: bark, bone: root, sides: 7, smooth: false, caps: { start: "flat", end: "point" } },
    );
  }
  // knot hole
  const knot = b.surface(trunk).ray([0.05, 1.7, 3], [0, 0, -1]);
  if (knot) {
    b.stick(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), "#5a3c27", knot, { embed: 0.4, ...ON });
    b.stick(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8), "#1e1410", knot, { embed: 0.2, ...ON });
  }

  // ---------- branches & crown ----------
  const crownParts: any[] = [];
  const blob = (at: number[], r: number) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.scale(1, 0.85, 1);
    crownParts.push(
      b.part(g, crownPaint, { at, rotation: [rand() * 360, rand() * 360, 0], flat: true, ...ON }),
    );
  };
  const branches: number[][][] = [
    [[0.1, 5.5, -1], [1.8, 6.8, -0.8], [2.6, 7.6, -1.1]],
    [[-0.05, 5.2, -1], [-1.6, 6.4, -0.9], [-2.4, 7.4, -1.0]],
    [[0, 6.5, -1.1], [0.4, 7.6, -2.2], [0.2, 8.4, -2.8]],
    [[0, 6.8, -1.0], [-0.7, 8.0, -0.2], [-1.3, 8.6, 0.5]],
    [[0.05, 6.9, -1], [0.9, 8.2, -0.2], [1.4, 8.7, 0.45]],
  ];
  for (const br of branches)
    b.sweep(bezier(br[0], br[1], br[2]), [0.3, 0.12], { color: bark, bone: root, sides: 7, smooth: false });
  const blobs: number[][] = [
    [0, 8.8, -1.2, 2.3], [-2.2, 7.8, -1.0, 1.8], [2.3, 8.0, -1.3, 1.9], [-1.0, 9.8, -0.4, 1.7],
    [1.2, 9.9, -1.8, 1.7], [0, 8.6, -3.0, 1.9], [-3.3, 6.6, -0.8, 1.4], [3.2, 6.9, -0.5, 1.4],
    [-1.6, 8.6, 0.7, 1.3], [1.6, 8.7, 0.6, 1.35], [0, 10.7, -1.0, 1.3], [2.6, 6.4, -2.4, 1.3],
    [-2.5, 6.6, -2.6, 1.3],
  ];
  for (const c of blobs) blob([c[0], c[1], c[2]], c[3]);

  // low branch to the right side (+x) with a leafy tuft
  b.sweep(catmull([[0.25, 2.9, -1.0], [1.4, 3.3, -1.4], [2.6, 3.8, -1.5], [3.3, 4.4, -1.5]]), [0.28, 0.08], {
    color: bark, bone: root, sides: 7, smooth: false, caps: { start: "flat", end: "point" },
  });
  blob([3.4, 4.6, -1.5], 0.7);

  // swing branch to the model's right (-x)
  const swingPath = catmull([[-0.25, 2.5, -0.9], [-1.4, 2.95, -0.75], [-2.6, 3.15, -0.6], [-3.7, 3.45, -0.45]]);
  b.sweep(swingPath, [0.3, 0.09], {
    color: bark, bone: root, sides: 7, smooth: false, caps: { start: "flat", end: "point" },
  });
  blob([-3.85, 3.75, -0.45], 0.55);

  // leaf cards over the crown
  const leafTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="18" cy="36" rx="9" ry="16" transform="rotate(-40 18 36)" fill="#e2e2e2"/>
      <ellipse cx="46" cy="36" rx="9" ry="16" transform="rotate(40 46 36)" fill="#e2e2e2"/>
      <ellipse cx="32" cy="22" rx="11" ry="20" fill="#ffffff"/>
      <path d="M32 64 L32 8 M32 50 L18 38 M32 50 L46 38" stroke="#9a9a9a" stroke-width="2.5" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const leafHits = b.surface(crownParts).scatter(460, { rng: rng(21), minDist: 0.38, filter: (h: any) => h.n.y > -0.45 });
  b.cards(leafHits, leafTex, {
    size: 0.62, lean: 45, bend: 25, vary: 0.3, spin: 40, rng: rng(22), color: leafTint, bone: root,
  });

  // ---------- deck ----------
  const cz = 0.65;
  for (const x of [-1.3, 1.3]) b.rod([x, 3.42, -0.75], [x, 3.42, 2.25], 0.1, { color: DARKWOOD, sides: 6, ...ON });
  b.rod([-1.75, 3.42, 1.95], [1.75, 3.42, 1.95], 0.1, { color: DARKWOOD, sides: 6, ...ON });
  for (const s of [1, -1])
    b.sweep(bezier([s * 0.25, 1.9, -0.45], [s * 0.9, 2.5, 0.6], [s * 1.3, 3.36, 1.95]), [0.16, 0.09], {
      color: bark, bone: root, sides: 6, smooth: false,
    });
  for (let i = 0; i < 15; i++) {
    const z = -0.75 + 0.1 + i * 0.2;
    const pick = rand() < 0.5;
    bx(pick ? "plankA" : "plankB", pick ? plankA : plankB, [3.5 + rand() * 0.12, 0.1, 0.185], [(rand() - 0.5) * 0.06, deckTop - 0.05 + (rand() - 0.5) * 0.012, z]);
  }

  // railing (gap for the ladder between x 0.1 and 1.1)
  const railH = 0.8;
  const posts: number[][] = [[-1.7, 2.18], [-1.1, 2.18], [-0.5, 2.18], [0.1, 2.18], [1.1, 2.18], [1.7, 2.18], [-1.7, 1.62], [1.7, 1.62]];
  for (const p of posts) bx("rail", DARKWOOD, [0.08, railH, 0.08], [p[0], deckTop + railH / 2, p[1]]);
  for (const y of [deckTop + railH, deckTop + 0.4]) {
    bx("rail", DARKWOOD, [1.86, 0.07, 0.07], [-0.8, y, 2.18]);
    bx("rail", DARKWOOD, [0.66, 0.07, 0.07], [1.4, y, 2.18]);
    for (const x of [-1.7, 1.7]) bx("rail", DARKWOOD, [0.07, 0.07, 0.62], [x, y, 1.9]);
  }

  // ---------- cabin ----------
  const wallTop = deckTop + 1.8;
  b.part(new THREE.BoxGeometry(2.4, 1.8, 1.8), siding, { at: [0, deckTop + 0.9, cz], ...ON });
  for (const x of [-1.2, 1.2]) for (const z of [-0.25, 1.55]) bx("posts", DARKWOOD, [0.14, 1.82, 0.14], [x, deckTop + 0.91, z]);
  for (const z of [1.5, -0.2])
    b.extrude(
      [
        [-1.2, 0],
        [1.2, 0],
        [0, 1.15],
      ],
      { at: [0, wallTop, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: siding, bone: root },
    );

  // door
  b.part(new THREE.BoxGeometry(0.66, 1.3, 0.06), doorPaint, { at: [-0.35, deckTop + 0.65, 1.57], ...ON });
  for (const x of [-0.72, 0.02]) bx("trim", TRIM, [0.08, 1.4, 0.08], [x, deckTop + 0.7, 1.58]);
  bx("trim", TRIM, [0.86, 0.09, 0.09], [-0.35, deckTop + 1.38, 1.58]);
  b.part(new THREE.SphereGeometry(0.035, 6, 4), "#d4a83a", { at: [-0.1, deckTop + 0.65, 1.62], ...ON });
  b.part(new THREE.CircleGeometry(0.09, 10), GLOW, { at: [-0.35, deckTop + 1.05, 1.605], dir: [0, 0, 1], axis: "z", ...ON });
  b.part(new THREE.TorusGeometry(0.1, 0.022, 4, 12), "#d4a83a", { at: [-0.35, deckTop + 1.05, 1.61], ...ON });
  b.part(new THREE.BoxGeometry(0.62, 0.02, 0.36), matPaint, { at: [-0.35, deckTop + 0.01, 1.82], ...ON });

  // front square window with open shutters and a flower box
  const wx = 0.62, wy = deckTop + 1.0;
  b.part(new THREE.BoxGeometry(0.46, 0.46, 0.04), GLOW, { at: [wx, wy, 1.56], ...ON });
  for (const s of [1, -1]) {
    bx("trim", TRIM, [0.56, 0.07, 0.07], [wx, wy + s * 0.26, 1.58]);
    bx("trim", TRIM, [0.07, 0.56, 0.07], [wx + s * 0.26, wy, 1.58]);
    b.part(new THREE.BoxGeometry(0.24, 0.52, 0.04), shutterPaint, { at: [wx + s * 0.42, wy, 1.58], ...ON });
  }
  bx("trim", TRIM, [0.04, 0.46, 0.05], [wx, wy, 1.585]);
  bx("trim", TRIM, [0.46, 0.04, 0.05], [wx, wy, 1.585]);
  b.part(new THREE.BoxGeometry(0.62, 0.15, 0.18), "#8a5a34", { at: [wx, wy - 0.33, 1.66], ...ON });
  const flowerCols = ["#ff7aa8", "#ffd84d", "#ffffff", "#b58cff"];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.SphereGeometry(0.05, 6, 4).translate(wx - 0.25 + i * 0.1, wy - 0.22 + rand() * 0.04, 1.66 + (rand() - 0.5) * 0.06);
    add("flower" + (i % 4), flowerCols[i % 4], g);
    add("leaves", "#4f9a3d", new THREE.SphereGeometry(0.045, 5, 3).translate(wx - 0.2 + i * 0.08, wy - 0.25, 1.7));
  }

  // side windows
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.42, 0.42), GLOW, { at: [s * 1.215, deckTop + 1.05, cz], ...ON });
    for (const k of [1, -1]) {
      bx("trim", TRIM, [0.07, 0.07, 0.52], [s * 1.23, deckTop + 1.05 + k * 0.24, cz]);
      bx("trim", TRIM, [0.07, 0.52, 0.07], [s * 1.23, deckTop + 1.05, cz + k * 0.24]);
    }
    bx("trim", TRIM, [0.05, 0.42, 0.04], [s * 1.235, deckTop + 1.05, cz]);
  }

  // round gable window
  const rw = [0, wallTop + 0.42, 1.565];
  b.part(new THREE.CircleGeometry(0.24, 12), GLOW2, { at: rw, dir: [0, 0, 1], axis: "z", ...ON });
  b.part(new THREE.TorusGeometry(0.25, 0.05, 6, 18), TRIM, { at: [rw[0], rw[1], 1.58], ...ON });
  bx("trim", DARKWOOD, [0.04, 0.48, 0.03], [rw[0], rw[1], 1.575]);
  bx("trim", DARKWOOD, [0.48, 0.04, 0.03], [rw[0], rw[1], 1.575]);

  // ---------- roof ----------
  const ridgeY = wallTop + 1.15;
  const eaveY = ridgeY - 1.4375;
  const roofReds = ["#c0392b", "#a93226", "#d4503a"];
  for (const sgn of [1, -1]) {
    const run = 1.5, rise = 1.4375, L = Math.hypot(run, rise);
    const d = new V(sgn * run, -rise, 0).divideScalar(L);
    const n = new V(sgn * rise, run, 0).divideScalar(L);
    const A = new V(0, 0, -sgn);
    const M = new THREE.Matrix4().makeBasis(A, n, d).setPosition(0, ridgeY, cz);
    add("roofboard", "#6b4429", new THREE.BoxGeometry(2.3, 0.07, L + 0.06).translate(0, 0, L / 2).applyMatrix4(M));
    let k = 0;
    for (let v = 0.12; v < L + 0.02; v += 0.17, k++) {
      const off = k % 2 ? 0.13 : 0;
      for (let u = -1.15 + 0.13 - off; u < 1.15; u += 0.26) {
        const u0 = Math.max(u - 0.13, -1.15), u1 = Math.min(u + 0.13, 1.15);
        if (u1 - u0 < 0.06) continue;
        const ci = Math.floor(rand() * 3);
        const g = new THREE.BoxGeometry(u1 - u0 - 0.015, 0.035, 0.26)
          .rotateX(-0.14)
          .translate((u0 + u1) / 2, 0.06, v)
          .applyMatrix4(M);
        add("shingle" + ci, roofReds[ci], g);
      }
    }
  }
  b.rod([0, ridgeY + 0.07, -0.55], [0, ridgeY + 0.07, 1.85], 0.08, { color: "#7e2219", sides: 6, ...ON });

  // chimney with smoke
  b.part(new THREE.BoxGeometry(0.4, 1.35, 0.4), stone, { at: [-0.65, ridgeY - 0.225, 0.15], ...ON });
  b.part(new THREE.BoxGeometry(0.5, 0.08, 0.5), "#5a514b", { at: [-0.65, ridgeY + 0.48, 0.15], ...ON });
  const puffs: number[][] = [[-0.6, ridgeY + 0.78, 0.15, 0.15], [-0.42, ridgeY + 1.08, 0.08, 0.19], [-0.15, ridgeY + 1.42, 0.0, 0.22]];
  for (const p of puffs)
    b.part(new THREE.IcosahedronGeometry(p[3], 0), "#f2efe9", { at: [p[0], p[1], p[2]], rotation: [rand() * 90, rand() * 90, 0], flat: true, ...ON });

  // pennant flag
  b.rod([0, ridgeY + 0.05, 1.72], [0, ridgeY + 1.1, 1.72], 0.025, { color: IRON, sides: 6, ...ON });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), "#e5b53a", { at: [0, ridgeY + 1.13, 1.72], ...ON });
  b.extrude(
    [
      [0, 0],
      [0.78, 0.17],
      [0, 0.34],
    ],
    { at: [0.02, ridgeY + 0.72, 1.72], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: pennant, bone: root },
  );

  // bluebird on the ridge
  const by = ridgeY + 0.15;
  const birdBody = new THREE.SphereGeometry(0.1, 7, 5);
  birdBody.scale(1.2, 0.95, 0.9);
  b.part(birdBody, "#3d7cc9", { at: [0, by + 0.06, 0.1], ...ON });
  b.part(new THREE.SphereGeometry(0.065, 7, 5), "#3d7cc9", { at: [0.1, by + 0.15, 0.1], ...ON });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), "#f08a4b", { at: [0.06, by + 0.05, 0.1], ...ON });
  b.part(new THREE.ConeGeometry(0.022, 0.06, 5), "#f2b632", { at: [0.18, by + 0.15, 0.1], dir: [1, 0, 0], ...ON });
  b.part(new THREE.BoxGeometry(0.12, 0.02, 0.07), "#2c5d9c", { at: [-0.14, by + 0.1, 0.1], rotation: [0, 0, -25], ...ON });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 5, 3), "#111111", { at: [0.13, by + 0.17, 0.1 + s * 0.05], ...ON });

  // string lights under the front eave
  const lights = catmull([
    [-1.45, eaveY - 0.03, 1.82],
    [-0.7, eaveY - 0.22, 1.9],
    [0, eaveY - 0.28, 1.92],
    [0.7, eaveY - 0.22, 1.9],
    [1.45, eaveY - 0.03, 1.82],
  ]);
  b.sweep(lights, 0.01, { color: IRON, sides: 4, ...ON });
  const bulbCols = ["#ffd36a", "#ff8a5c", "#8fe3d0", "#ffb3d1"];
  let bi = 0;
  b.along(lights, 11, (pt: any) => {
    const at = new V().copy(pt.at).add(new V(0, -0.045, 0));
    b.part(new THREE.SphereGeometry(0.04, 6, 4), bulbCols[bi++ % 4], { at, ...ON });
  });

  // potted plant on the porch
  b.part(new THREE.CylinderGeometry(0.16, 0.12, 0.26, 8), "#c8673e", { at: [1.4, deckTop + 0.13, 1.9], flat: true, ...ON });
  b.part(new THREE.IcosahedronGeometry(0.24, 0), "#4f9a3d", { at: [1.4, deckTop + 0.4, 1.9], flat: true, ...ON });

  // ---------- lantern by the door ----------
  const lanternY = deckTop + 1.5;
  b.rod([-1.0, lanternY + 0.12, 1.55], [-1.0, lanternY + 0.12, 1.87], 0.018, { color: IRON, sides: 4, ...ON });
  const lantern = b.joint("lantern", { parent: root, at: [-1.0, lanternY + 0.12, 1.86], dir: [0, -1, 0] });
  const LB = { bone: lantern };
  b.part(new THREE.TorusGeometry(0.03, 0.008, 4, 8), IRON, { at: [-1.0, lanternY + 0.09, 1.86], ...LB });
  b.part(new THREE.ConeGeometry(0.11, 0.1, 4), IRON, { at: [-1.0, lanternY + 0.02, 1.86], rotation: [0, 45, 0], flat: true, ...LB });
  b.part(new THREE.BoxGeometry(0.13, 0.17, 0.13), GLOW, { at: [-1.0, lanternY - 0.12, 1.86], ...LB });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.02, 0.19, 0.02), IRON, { at: [-1.0 + sx * 0.07, lanternY - 0.12, 1.86 + sz * 0.07], ...LB });
  b.part(new THREE.BoxGeometry(0.17, 0.03, 0.17), IRON, { at: [-1.0, lanternY - 0.22, 1.86], ...LB });

  // ---------- rope ladder ----------
  const ladL = catmull([[0.38, deckTop - 0.02, 2.27], [0.38, 2.2, 2.42], [0.38, TOP + 0.04, 2.58]]);
  const ladR = catmull([[0.82, deckTop - 0.02, 2.27], [0.82, 2.2, 2.42], [0.82, TOP + 0.04, 2.58]]);
  for (const p of [ladL, ladR]) b.sweep(p, 0.025, { color: ROPE, sides: 5, ...ON });
  for (let i = 1; i <= 10; i++) {
    const t = i / 11;
    const pa = ladL.at(t), pb = ladR.at(t);
    b.rod(pa, pb, 0.032, { color: "#9c6a3e", sides: 6, ...ON });
    for (const p of [pa, pb]) add("knots", ROPE, new THREE.SphereGeometry(0.04, 5, 3).translate(p.x, p.y, p.z));
  }

  // ---------- swing ----------
  const tAtX = (path: any, x: number) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      if (path.at(m).x > x) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  };
  const tops: THREE.Vector3[] = [];
  for (const x of [-2.35, -2.85]) {
    const t = tAtX(swingPath, x);
    const p = swingPath.at(t) as THREE.Vector3;
    const r = 0.3 - 0.21 * t;
    b.part(new THREE.TorusGeometry(r + 0.01, 0.028, 4, 10), ROPE, { at: p, dir: swingPath.tangentAt(t), axis: "z", ...ON });
    tops.push(new V(p.x, p.y - r * 0.9, p.z));
  }
  const swingTop = new V().addVectors(tops[0], tops[1]).multiplyScalar(0.5);
  const swing = b.joint("swing", { parent: root, at: swingTop, dir: [0, -1, 0] });
  const seatY = 1.15;
  for (const tp of tops) b.rod(tp, [tp.x, seatY + 0.02, swingTop.z], 0.02, { color: ROPE, sides: 5, bone: swing });
  b.part(new THREE.BoxGeometry(0.72, 0.06, 0.3), plankA, { at: [swingTop.x, seatY, swingTop.z], bone: swing });

  // ---------- stepping stones ----------
  const stones: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const x = 0.65 + t * 0.4 + (rand() - 0.5) * 0.2, z = 3.0 + t * 1.9;
    stones.push([x, z]);
    b.part(new THREE.CylinderGeometry(0.27, 0.3, 0.08, 7), i % 2 ? "#a8a498" : "#8f8b80", {
      at: [x, TOP + 0.02, z], rotation: [0, rand() * 60, 0], flat: true, ...ON,
    });
  }

  // ---------- mushrooms ----------
  const mush: number[][] = [[-1.2, 1.6, 0.42, 0.26, 0], [-1.6, 1.35, 0.28, 0.18, 0], [-0.9, 1.95, 0.2, 0.13, 1], [2.4, -2.2, 0.36, 0.22, 0], [2.75, -1.8, 0.22, 0.15, 1]];
  for (let i = 0; i < mush.length; i++) {
    const [x, z, h, r, kind] = mush[i];
    b.lathe(
      [
        [0, 0],
        [r * 0.38, 0],
        [r * 0.28, h * 0.6],
        [r * 0.3, h],
        [0, h],
      ],
      { at: [x, TOP - 0.02, z], segments: 8, color: CREAM, bone: root },
    );
    b.lathe(
      [
        [0, 0],
        [r, 0],
        [r * 0.95, r * 0.35],
        [r * 0.6, r * 0.72],
        [0, r * 0.82],
      ],
      {
        at: [x, TOP + h * 0.88, z], segments: 10, smoothing: 1, bone: root,
        color: kind ? spots("#a0663a", "#e8d2a8", { size: r * 0.6, amount: 0.25, seed: i }) : spots(RED, CREAM, { size: r * 0.6, amount: 0.3, seed: i }),
      },
    );
  }

  // ---------- bicycle ----------
  const bikeO = new V(1.55, TOP, 2.45);
  const F = new V(1, 0, -0.6).normalize();
  const up = new V(0, 1, 0);
  const S0 = new V().crossVectors(F, up).normalize();
  const lean = 0.1;
  const U = up.clone().multiplyScalar(Math.cos(lean)).addScaledVector(S0, Math.sin(lean)).normalize();
  const S = new V().crossVectors(F, U).normalize();
  const bq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(F, U, S));
  const B = (x: number, y: number, z = 0) => bikeO.clone().addScaledVector(F, x).addScaledVector(U, y).addScaledVector(S, z);
  const FRAME = "#3a9e9a", SILVER = "#c9ccd1", TIRE = "#2a2624";
  for (const hx of [0, 1.05]) {
    const hub = B(hx, 0.34);
    b.part(new THREE.TorusGeometry(0.305, 0.04, 6, 20), TIRE, { at: hub, quat: bq, ...ON });
    b.part(new THREE.TorusGeometry(0.27, 0.015, 4, 18), SILVER, { at: hub, quat: bq, ...ON });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6).rotateX(Math.PI / 2), SILVER, { at: hub, quat: bq, ...ON });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.rod(hub, B(hx + 0.27 * Math.cos(a), 0.34 + 0.27 * Math.sin(a)), 0.005, { color: SILVER, sides: 3, ...ON });
    }
    b.part(new THREE.TorusGeometry(0.37, 0.025, 4, 12, 2.3).rotateZ(0.42), FRAME, { at: hub, quat: bq, ...ON });
  }
  const RH = B(0, 0.34), BB = B(0.42, 0.27), ST = B(0.33, 0.8), HT = B(0.86, 0.86), HB = B(0.9, 0.68), FH = B(1.05, 0.34);
  const tubes: THREE.Vector3[][] = [[RH, BB], [RH, ST], [BB, ST], [ST, HT], [BB, HB], [HB, FH]];
  for (const [p, q] of tubes) b.rod(p, q, 0.025, { color: FRAME, sides: 6, ...ON });
  b.rod(HB, HT, 0.035, { color: FRAME, sides: 6, ...ON });
  b.rod(HT, B(0.83, 1.0), 0.02, { color: SILVER, sides: 5, ...ON });
  b.sweep(catmull([B(0.7, 1.03, -0.27), B(0.82, 1.0, -0.12), B(0.84, 1.0, 0), B(0.82, 1.0, 0.12), B(0.7, 1.03, 0.27)]), 0.016, {
    color: SILVER, sides: 5, ...ON,
  });
  for (const s of [-1, 1]) b.capsule(B(0.7, 1.03, s * 0.27), B(0.66, 1.04, s * 0.36), 0.025, { color: CREAM, sides: 6, ...ON });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#f2b632", { at: B(0.82, 1.04, 0.13), ...ON });
  b.rod(ST, B(0.31, 0.9), 0.018, { color: SILVER, sides: 5, ...ON });
  b.part(new THREE.BoxGeometry(0.24, 0.06, 0.13), "#6b3e26", { at: B(0.3, 0.93), quat: bq, ...ON });
  b.part(new THREE.TorusGeometry(0.08, 0.012, 4, 12), SILVER, { at: B(0.42, 0.27, 0.05), quat: bq, ...ON });
  b.rod(B(0.42, 0.35, 0.05), B(0, 0.37, 0.05), 0.007, { color: IRON, sides: 3, ...ON });
  b.rod(B(0.42, 0.19, 0.05), B(0, 0.31, 0.05), 0.007, { color: IRON, sides: 3, ...ON });
  for (const s of [1, -1]) {
    const end = B(0.42 + s * 0.08, 0.27 - s * 0.14, s * 0.07);
    b.rod(B(0.42, 0.27, s * 0.07), end, 0.012, { color: SILVER, sides: 4, ...ON });
    b.part(new THREE.BoxGeometry(0.1, 0.025, 0.07), IRON, { at: B(0.42 + s * 0.08, 0.27 - s * 0.14, s * 0.12), quat: bq, ...ON });
  }
  b.part(new THREE.BoxGeometry(0.3, 0.22, 0.32), wicker, { at: B(1.1, 0.88), quat: bq, ...ON });
  b.rod(B(1.0, 0.8), HB, 0.012, { color: SILVER, sides: 4, ...ON });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.SphereGeometry(0.045, 6, 4), flowerCols[i % 4], { at: B(1.02 + rand() * 0.16, 1.0 + rand() * 0.04, (rand() - 0.5) * 0.22), ...ON });
  const foot = B(0.3, 0, 0);
  foot.y = TOP + 0.01;
  foot.addScaledVector(S0, 0.2);
  b.rod(B(0.38, 0.25, 0.04), foot, 0.012, { color: IRON, sides: 4, ...ON });

  // ---------- grass tufts & wildflowers ----------
  const clearOf = (p: THREE.Vector3) => {
    if (Math.hypot(p.x, p.z + 0.9) < 1.25) return false;
    for (const s of stones) if (Math.hypot(p.x - s[0], p.z - s[1]) < 0.4) return false;
    if (Math.hypot(p.x - 2.0, p.z - 2.15) < 0.75) return false;
    return true;
  };
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M6 64 Q14 34 4 6 Q20 34 18 64 Z" fill="#d8d8d8"/>
      <path d="M20 64 Q30 30 28 0 Q38 32 34 64 Z" fill="#ffffff"/>
      <path d="M34 64 Q42 36 58 10 Q48 40 48 64 Z" fill="#e8e8e8"/>
      <path d="M46 64 Q54 44 62 30 Q58 48 58 64 Z" fill="#cfcfcf"/>
    </svg>`,
    { size: 128 },
  );
  const baseSurf = b.surface(base);
  const grassHits = baseSurf.scatter(300, { rng: rng(5), minDist: 0.28, filter: (h: any) => h.n.y > 0.9 && clearOf(h.at) });
  b.cards(grassHits, grassTex, { size: [0.34, 0.3], cross: true, vary: 0.35, spin: 90, rng: rng(6), color: grassTint, bone: root });
  const flowerHits = baseSurf.scatter(36, { rng: rng(8), minDist: 0.5, filter: (h: any) => h.n.y > 0.9 && clearOf(h.at) });
  flowerHits.forEach((h: any, i: number) => {
    const p = h.at as THREE.Vector3;
    add("stems", "#4f9a3d", new THREE.CylinderGeometry(0.012, 0.012, 0.2, 4).translate(p.x, p.y + 0.1, p.z));
    add("flower" + (i % 4), flowerCols[i % 4], new THREE.SphereGeometry(0.05, 6, 4).translate(p.x, p.y + 0.22, p.z));
  });

  // ---------- flush merged groups ----------
  for (const [key, grp] of groups) {
    const merged = mergeGeometries(grp.geos);
    if (merged) b.part(merged, grp.color, { bone: root, at: [0, 0, 0], name: key });
  }

  return b.root;
}
