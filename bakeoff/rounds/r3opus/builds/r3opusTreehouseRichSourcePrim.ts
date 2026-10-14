import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  frame,
  paint,
  mottle,
  spots,
  grain,
  noise,
  countershade,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cozy Treehouse Diorama",
  description:
    "A thick old oak on a grassy round base with a red-shingled cabin in its branches, porch, round window, lantern, bunting, rope ladder, swing, pennant, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  b.joint("swing", { parent: "root", at: [-2.4, 3.0, -0.47], dir: [0, -1, 0], role: "hinge" });
  b.joint("flag", { parent: "root", at: [0, 6.5, 1.95], dir: [0, 1, 0] });

  const P = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: "root", ...o });
  const rod = (a: number[], c: number[], r: number | [number, number], color: any, bone = "root") =>
    b.rod(a, c, r, { color, bone });

  const frac = (x: number) => x - Math.floor(x);
  const h2 = (a: number, c: number) => frac(Math.sin(a * 127.1 + c * 311.7) * 43758.5453);

  // ---------- materials with glow ----------
  const GLOW = "#ffd27a";
  const glowMat = b.material(GLOW);
  glowMat.emissive = new THREE.Color("#ffb347");
  glowMat.emissiveIntensity = 0.9;

  // ---------- paints ----------
  const barkBase = grain("#6e4a2e", "#553722", { size: 0.07, axis: "y", seed: 2 });
  const bark = paint((p, n) => {
    const m = noise(p, 0.5, 3);
    return p.y < 1.0 + m * 1.2 && n.y > -0.3 && m > 0.47 ? "#71913c" : barkBase;
  });
  const planks = paint((p) => {
    const v = p.y / 0.17;
    const row = Math.floor(v);
    if (frac(v) < 0.09) return "#6a3f22";
    const u = (p.x + p.z) / 0.9 + h2(row, 1) * 3;
    if (frac(u) < 0.012) return "#7a4a28";
    return ["#c98f55", "#bb8048", "#d6a065"][Math.floor(h2(row, Math.floor(u)) * 3)];
  });
  const doorPaint = paint((p) => {
    const u = (p.x + 5) / 0.15;
    if (frac(u) < 0.1) return "#4a2a16";
    return h2(Math.floor(u), 3) < 0.5 ? "#8a4f2b" : "#7d4625";
  });
  const shingles = paint((p) => {
    const v = p.y / 0.13;
    const row = Math.floor(v);
    const u = p.z / 0.2 + (row % 2) * 0.5;
    const col = Math.floor(u);
    if (frac(v) < 0.12 || frac(u) < 0.06) return "#7d1f17";
    const t = h2(row, col);
    const top = frac(v) > 0.75;
    return t < 0.33 ? (top ? "#cf4a38" : "#c23b2c") : t < 0.66 ? (top ? "#be3c2c" : "#b03024") : top ? "#df5a42" : "#d24a35";
  });
  const grassTop = mottle("#6db04a", "#55973a", { size: 0.9, seed: 4 });
  const soil = spots(mottle("#6b4a2f", "#563a24", { size: 0.35, seed: 5 }), ["#9a8a78", "#7f7468"], {
    size: 0.22,
    amount: 0.25,
    seed: 6,
  });
  const plinth = grain("#4a2f1e", "#3a2416", { size: 0.05, axis: "x", seed: 8 });
  const leafPaint = countershade(mottle("#5c9a3e", "#4a8434", { size: 1.1, seed: 11 }), "#2f5e2a", {
    level: -0.15,
    soft: 0.5,
  });
  const leafPaint2 = countershade(mottle("#6fae46", "#5a9a3c", { size: 0.9, seed: 12 }), "#356630", {
    level: -0.15,
    soft: 0.5,
  });
  const capPaint = spots("#d8352a", "#fff4e0", { size: 0.09, amount: 0.45, seed: 13 });

  // ---------- base ----------
  P(new THREE.CylinderGeometry(6.3, 6.4, 0.2, 48), plinth, { at: [0, 0.1, 0] });
  P(new THREE.CylinderGeometry(6.0, 6.0, 0.36, 48), soil, { at: [0, 0.38, 0] });
  P(new THREE.CylinderGeometry(6.05, 6.05, 0.15, 48), grassTop, { at: [0, 0.625, 0] });
  const lip = rng(21);
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2 + lip() * 0.05;
    P(new THREE.IcosahedronGeometry(0.13 + lip() * 0.05, 0), lip() < 0.5 ? "#5fa241" : "#4f8f36", {
      at: [Math.sin(a) * 6.02, 0.58, Math.cos(a) * 6.02],
      rotation: [lip() * 90, lip() * 90, 0],
      flat: true,
    });
  }

  // ---------- tree ----------
  const TZ = -0.8;
  b.sweep(
    catmull([
      [0, 0.4, TZ],
      [0.05, 2, TZ - 0.05],
      [-0.1, 4, TZ - 0.1],
      [0.1, 6, TZ - 0.1],
      [0, 7.6, TZ - 0.2],
    ]),
    [1.0, 0.78, 0.64, 0.55, 0.38],
    { color: bark, bone: "root", sides: 10 },
  );
  // roots
  for (const deg of [25, 100, 165, 235, 300]) {
    const a = deg * (Math.PI / 180);
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      catmull([
        [c * 0.5, 1.3, TZ + s * 0.5],
        [c * 1.3, 0.85, TZ + s * 1.3],
        [c * 2.2, 0.64, TZ + s * 2.2],
      ]),
      [0.38, 0.2, 0.05],
      { color: bark, bone: "root", sides: 7 },
    );
  }
  // knot hole
  P(new THREE.SphereGeometry(0.16, 10, 8), "#2e1b0f", { at: [0.15, 1.95, -0.06], scale: [1, 1.4, 0.4] });
  // branches into crown
  const branch = (pts: number[][], r: number[]) =>
    b.sweep(catmull(pts), r, { color: bark, bone: "root", sides: 8 });
  branch([[0.3, 4.8, -0.8], [1.6, 5.6, -0.5], [2.4, 7.0, -0.6], [2.5, 7.9, -1.0]], [0.32, 0.22, 0.14, 0.08]);
  branch([[-0.3, 4.6, -0.8], [-1.7, 5.5, -0.6], [-2.5, 6.9, -0.8], [-2.6, 7.8, -1.0]], [0.32, 0.22, 0.14, 0.08]);
  branch([[0, 5.4, -1.0], [0.2, 6.8, -2.0], [0, 8.0, -2.6]], [0.3, 0.18, 0.08]);
  branch([[0.1, 6.4, -0.8], [0.9, 7.6, 0.2], [1.2, 8.2, 0.6]], [0.22, 0.14, 0.07]);
  // swing branch
  branch([[-0.4, 2.6, -0.8], [-1.6, 3.0, -0.6], [-2.8, 3.15, -0.4], [-3.6, 3.6, -0.3]], [0.3, 0.2, 0.14, 0.08]);
  // platform support branches
  branch([[0.2, 2.9, -0.5], [1.0, 3.25, 0.4], [1.5, 3.35, 1.0]], [0.22, 0.15, 0.09]);
  branch([[-0.2, 2.9, -0.5], [-1.0, 3.25, 0.4], [-1.5, 3.35, 1.0]], [0.22, 0.15, 0.09]);

  // crown
  const blobs: number[][] = [
    [0, 9.2, -1.2, 2.0],
    [1.8, 8.6, -1.0, 1.6],
    [-1.9, 8.7, -1.1, 1.7],
    [0.9, 9.8, -0.4, 1.4],
    [-1.0, 9.9, -0.6, 1.4],
    [0, 8.4, -2.6, 1.6],
    [2.4, 7.6, -2.0, 1.2],
    [-2.6, 7.7, -1.8, 1.3],
    [-3.4, 8.4, -0.6, 1.1],
    [3.3, 8.2, -0.4, 1.1],
    [1.4, 8.0, 0.6, 1.2],
    [-1.5, 8.1, 0.5, 1.25],
    [0, 8.9, 0.5, 1.3],
    [0, 10.6, -1.0, 1.2],
    [1.6, 9.6, -2.2, 1.2],
    [-1.6, 9.5, -2.3, 1.2],
    [-3.75, 3.95, -0.3, 0.6],
  ];
  const cr = rng(31);
  const crownParts = blobs.map(([x, y, z, r], i) =>
    P(new THREE.IcosahedronGeometry(r, 1), i % 2 ? leafPaint : leafPaint2, {
      at: [x, y, z],
      rotation: [cr() * 60, cr() * 60, cr() * 60],
      scale: [1, 0.85, 1],
    }),
  );
  const leafA = svg(
    `<svg viewBox="0 0 64 64"><g fill="#4e8c34"><ellipse cx="32" cy="30" rx="12" ry="24"/><circle cx="20" cy="18" r="8"/><circle cx="44" cy="18" r="8"/><circle cx="19" cy="34" r="8"/><circle cx="45" cy="34" r="8"/><circle cx="23" cy="48" r="6"/><circle cx="41" cy="48" r="6"/></g><path d="M32 62 L32 8" stroke="#2f5a22" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const leafB = svg(
    `<svg viewBox="0 0 64 64"><g fill="#7cb84c"><ellipse cx="32" cy="30" rx="12" ry="24"/><circle cx="20" cy="18" r="8"/><circle cx="44" cy="18" r="8"/><circle cx="19" cy="34" r="8"/><circle cx="45" cy="34" r="8"/><circle cx="23" cy="48" r="6"/><circle cx="41" cy="48" r="6"/></g><path d="M32 62 L32 8" stroke="#3c6a28" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const leafHits = b.surface(crownParts).scatter(280, { rng: rng(5), minDist: 0.25 });
  b.cards(leafHits, [leafA, leafB, leafA], {
    size: 0.55,
    lean: 55,
    flow: [0, -1, 0],
    vary: 0.3,
    spin: 180,
    bend: 20,
    rng: rng(9),
    bone: "root",
  });
  // acorns peeking from the crown
  const ac = rng(41);
  for (let i = 0; i < 10; i++) {
    const h = leafHits[Math.floor(ac() * leafHits.length)];
    if (h.n.y > 0) continue;
    const at = h.at.addScaledVector(h.n, 0.05);
    P(new THREE.SphereGeometry(0.07, 8, 6), "#9b6a2f", { at: [at.x, at.y, at.z], scale: [1, 1.3, 1] });
    P(new THREE.SphereGeometry(0.075, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#5b3a1c", {
      at: [at.x, at.y + 0.04, at.z],
    });
  }

  // ---------- platform ----------
  const PT = 3.59;
  for (let i = 0; i < 8; i++)
    P(new THREE.BoxGeometry(0.38, 0.12, 3.0), i % 2 ? "#9a6a3e" : "#a8774a", { at: [-1.4 + i * 0.4, PT - 0.06, 1.1] });
  for (const z of [0.0, 2.45]) P(new THREE.BoxGeometry(3.3, 0.16, 0.16), "#6b4226", { at: [0, PT - 0.2, z] });
  for (const s of [-1, 1]) rod([s * 0.3, 2.3, -0.45], [s * 1.35, PT - 0.2, 2.35], 0.06, "#6b4226");
  // railing
  const RAIL = "#7a4b2a";
  const post = (x: number, z: number) => P(new THREE.BoxGeometry(0.08, 0.62, 0.08), RAIL, { at: [x, PT + 0.31, z] });
  for (const x of [-1.55, -0.95, -0.35, 0.25, 0.65, 1.55]) post(x, 2.55);
  for (const s of [-1, 1]) for (const z of [1.85, 2.2]) post(s * 1.55, z);
  P(new THREE.BoxGeometry(2.3, 0.06, 0.1), RAIL, { at: [-0.45, PT + 0.6, 2.55] });
  P(new THREE.BoxGeometry(2.3, 0.04, 0.05), RAIL, { at: [-0.45, PT + 0.32, 2.55] });
  for (const s of [-1, 1]) {
    P(new THREE.BoxGeometry(0.1, 0.06, 0.8), RAIL, { at: [s * 1.55, PT + 0.6, 2.17] });
    P(new THREE.BoxGeometry(0.05, 0.04, 0.8), RAIL, { at: [s * 1.55, PT + 0.32, 2.17] });
  }

  // ---------- cabin ----------
  const CT = PT + 1.7;
  P(new THREE.BoxGeometry(2.2, 1.7, 1.6), planks, { at: [0, PT + 0.85, 1.0] });
  for (const x of [-1.1, 1.1]) for (const z of [0.2, 1.8])
    P(new THREE.BoxGeometry(0.13, 1.75, 0.13), "#6b4226", { at: [x, PT + 0.87, z] });
  for (const z of [1.75, 0.25])
    b.extrude(
      [
        [-1.1, 0],
        [1.1, 0],
        [0, 0.95],
      ],
      { color: planks, at: [0, CT, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, bone: "root" },
    );
  // roof
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(1.85, 0.1, 2.45), shingles, { at: [s * 0.675, 5.72, 1.0], rotation: [0, 0, -s * 39] });
    for (const z of [2.24, -0.24])
      P(new THREE.BoxGeometry(1.85, 0.12, 0.05), "#f3ead8", { at: [s * 0.675, 5.68, z], rotation: [0, 0, -s * 39] });
  }
  P(new THREE.BoxGeometry(0.2, 0.2, 2.5), "#8e2219", { at: [0, 6.27, 1.0], rotation: [0, 0, 45] });
  // stove pipe and smoke
  P(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), "#4a4a4a", { at: [-0.6, 6.05, 0.7] });
  P(new THREE.ConeGeometry(0.16, 0.12, 8), "#3a3a3a", { at: [-0.6, 6.56, 0.7] });
  P(new THREE.IcosahedronGeometry(0.11, 0), "#f2f2ee", { at: [-0.55, 6.8, 0.75], flat: true });
  P(new THREE.IcosahedronGeometry(0.15, 0), "#f2f2ee", { at: [-0.42, 7.05, 0.86], flat: true });

  // door
  const FZ = 1.8;
  P(new THREE.BoxGeometry(0.6, 1.12, 0.05), doorPaint, { at: [-0.45, PT + 0.56, FZ + 0.03] });
  P(new THREE.BoxGeometry(0.74, 0.08, 0.08), "#5a3520", { at: [-0.45, PT + 1.16, FZ + 0.04] });
  for (const x of [-0.79, -0.11]) P(new THREE.BoxGeometry(0.07, 1.16, 0.08), "#5a3520", { at: [x, PT + 0.58, FZ + 0.04] });
  for (const y of [0.25, 0.9]) P(new THREE.BoxGeometry(0.22, 0.05, 0.02), "#2b2b2b", { at: [-0.65, PT + y, FZ + 0.065] });
  P(new THREE.SphereGeometry(0.035, 8, 6), "#e2b13c", { at: [-0.22, PT + 0.55, FZ + 0.08] });
  P(new THREE.BoxGeometry(0.75, 0.06, 0.2), "#8a5a34", { at: [-0.45, PT + 0.03, FZ + 0.12] });

  // round window
  const RW: [number, number, number] = [0.5, PT + 0.96, FZ + 0.03];
  P(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16), GLOW, { at: RW, rotation: [90, 0, 0] });
  P(new THREE.TorusGeometry(0.24, 0.045, 6, 18), "#f3ead8", { at: [RW[0], RW[1], RW[2] + 0.02] });
  P(new THREE.BoxGeometry(0.44, 0.03, 0.03), "#f3ead8", { at: [RW[0], RW[1], RW[2] + 0.03] });
  P(new THREE.BoxGeometry(0.03, 0.44, 0.03), "#f3ead8", { at: [RW[0], RW[1], RW[2] + 0.03] });
  // flower box
  P(new THREE.BoxGeometry(0.56, 0.12, 0.15), "#3f7f8c", { at: [0.5, PT + 0.64, FZ + 0.1] });
  const fl = rng(51);
  for (let i = 0; i < 7; i++) {
    const x = 0.27 + i * 0.077;
    P(new THREE.IcosahedronGeometry(0.045, 0), "#4f8f36", { at: [x, PT + 0.72, FZ + 0.1], flat: true });
    P(new THREE.IcosahedronGeometry(0.035, 0), ["#ff6b9a", "#ffd23f", "#ffffff", "#ff8c42"][Math.floor(fl() * 4)], {
      at: [x, PT + 0.77 + fl() * 0.04, FZ + 0.12],
      flat: true,
    });
  }
  // side window with shutters
  P(new THREE.BoxGeometry(0.04, 0.45, 0.45), GLOW, { at: [1.11, PT + 0.95, 1.0] });
  P(new THREE.BoxGeometry(0.05, 0.05, 0.55), "#f3ead8", { at: [1.13, PT + 1.2, 1.0] });
  P(new THREE.BoxGeometry(0.05, 0.05, 0.55), "#f3ead8", { at: [1.13, PT + 0.7, 1.0] });
  P(new THREE.BoxGeometry(0.05, 0.45, 0.03), "#f3ead8", { at: [1.13, PT + 0.95, 1.0] });
  P(new THREE.BoxGeometry(0.05, 0.03, 0.45), "#f3ead8", { at: [1.13, PT + 0.95, 1.0] });
  for (const s of [-1, 1])
    P(new THREE.BoxGeometry(0.04, 0.5, 0.23), "#3f7f8c", { at: [1.15, PT + 0.95, 1.0 + s * 0.4] });

  // lantern
  const LX = 0.05;
  rod([LX, PT + 1.12, FZ], [LX, PT + 1.12, FZ + 0.24], 0.015, "#2b2b2b");
  rod([LX, PT + 1.12, FZ + 0.22], [LX, PT + 1.02, FZ + 0.22], 0.008, "#2b2b2b");
  P(new THREE.ConeGeometry(0.1, 0.09, 6), "#2b2b2b", { at: [LX, PT + 0.98, FZ + 0.22] });
  P(new THREE.CylinderGeometry(0.065, 0.065, 0.16, 6), GLOW, { at: [LX, PT + 0.86, FZ + 0.22] });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    P(new THREE.BoxGeometry(0.015, 0.17, 0.015), "#2b2b2b", {
      at: [LX + Math.cos(a) * 0.07, PT + 0.86, FZ + 0.22 + Math.sin(a) * 0.07],
    });
  }
  P(new THREE.BoxGeometry(0.15, 0.03, 0.15), "#2b2b2b", { at: [LX, PT + 0.77, FZ + 0.22] });

  // bunting across the front
  const bunt = catmull([
    [-1.35, 5.08, 2.17],
    [0, 4.93, 2.22],
    [1.35, 5.08, 2.17],
  ]);
  b.sweep(bunt, 0.008, { color: "#f3ead8", bone: "root" });
  const BC = ["#e94e3c", "#f4c542", "#3f9fb5", "#7bc96f", "#f28fb0"];
  for (let i = 0; i < 9; i++) {
    const p = bunt.at((i + 0.5) / 9);
    b.slab(
      [
        [p.x - 0.08, p.y + 0.01, p.z],
        [p.x, p.y - 0.17, p.z],
        [p.x + 0.08, p.y + 0.01, p.z],
      ],
      { color: BC[i % 5], thickness: 0.012, bone: "root" },
    );
  }

  // pennant flag on the roof
  rod([0, 6.2, 1.95], [0, 7.15, 1.95], 0.025, "#3a2a1e", "flag");
  P(new THREE.SphereGeometry(0.05, 8, 6), "#e2b13c", { at: [0, 7.18, 1.95], bone: "flag" });
  b.slab(
    [
      [0.02, 7.1, 1.95],
      [0.02, 6.74, 1.95],
      [0.8, 6.92, 1.95],
    ],
    {
      color: paint((p) => (p.x < 0.22 ? "#e94e3c" : p.x < 0.3 ? "#fff4e0" : "#f4c542")),
      thickness: 0.025,
      bone: "flag",
    },
  );

  // ---------- rope ladder ----------
  const ROPE = "#d9b77a";
  const ladderPath = (x: number) =>
    catmull([
      [x, PT, 2.6],
      [x, 2.2, 2.75],
      [x, 0.95, 2.86],
    ]);
  const lp = [ladderPath(0.8), ladderPath(1.3)];
  for (const p of lp) b.sweep(p, 0.022, { color: ROPE, bone: "root", sides: 6 });
  for (let i = 0; i < 8; i++) {
    const t = 0.08 + (i / 7) * 0.86;
    const a = lp[0].at(t);
    const c = lp[1].at(t);
    P(new THREE.BoxGeometry(0.62, 0.05, 0.09), i % 2 ? "#a8774a" : "#9a6a3e", { at: [(a.x + c.x) / 2, a.y, a.z] });
    for (const q of [a, c]) P(new THREE.SphereGeometry(0.035, 6, 4), ROPE, { at: [q.x, q.y + 0.03, q.z] });
  }

  // ---------- swing ----------
  for (const x of [-2.75, -2.05]) rod([x, 3.05, -0.47], [x, 1.37, -0.47], 0.018, ROPE, "swing");
  P(new THREE.BoxGeometry(0.88, 0.07, 0.34), "#b5834f", { at: [-2.4, 1.34, -0.47], bone: "swing" });
  P(new THREE.BoxGeometry(0.9, 0.02, 0.05), "#6b4226", { at: [-2.4, 1.38, -0.33], bone: "swing" });

  // ---------- mushrooms ----------
  const mush = (x: number, z: number, s: number) => {
    const g = 0.7;
    P(new THREE.CylinderGeometry(0.035 * s, 0.05 * s, 0.2 * s, 8), "#f3e6c8", { at: [x, g + 0.1 * s, z] });
    P(new THREE.SphereGeometry(0.13 * s, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), capPaint, {
      at: [x, g + 0.18 * s, z],
      scale: [1, 0.75, 1],
    });
    P(new THREE.CircleGeometry(0.125 * s, 12), "#e8d6b0", { at: [x, g + 0.18 * s, z], rotation: [90, 0, 0] });
  };
  mush(-1.35, 0.4, 1.4);
  mush(-1.05, 0.75, 0.9);
  mush(0.95, 0.45, 1.1);
  mush(-0.9, -2.4, 1.2);
  mush(1.15, -2.0, 0.8);
  mush(-3.5, 1.5, 1.6);
  mush(-3.2, 1.75, 0.9);

  // ---------- bicycle ----------
  const BX = 2.6;
  const WY = 1.065;
  const FR = "#3a8fb7";
  for (const z of [0.6, 1.65]) {
    P(new THREE.TorusGeometry(0.33, 0.035, 6, 20), "#2b2b2b", { at: [BX, WY, z], rotation: [0, 90, 0] });
    P(new THREE.TorusGeometry(0.29, 0.012, 4, 20), "#c9c9c9", { at: [BX, WY, z], rotation: [0, 90, 0] });
    for (const a of [0, 45, 90, 135])
      P(new THREE.BoxGeometry(0.008, 0.58, 0.008), "#c9c9c9", { at: [BX, WY, z], rotation: [a, 0, 0] });
    P(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), "#888888", { at: [BX, WY, z], rotation: [0, 0, 90] });
  }
  const RH = [BX, WY, 0.6];
  const FH = [BX, WY, 1.65];
  const BB = [BX, 1.0, 1.05];
  const ST = [BX, 1.58, 0.86];
  const HT = [BX, 1.62, 1.45];
  const HB = [BX, 1.45, 1.5];
  rod(BB, ST, 0.025, FR);
  rod(ST, HT, 0.025, FR);
  rod(BB, HB, 0.028, FR);
  rod(HB, HT, 0.03, FR);
  rod(HB, FH, 0.02, FR);
  rod(RH, BB, 0.018, FR);
  rod(RH, ST, 0.018, FR);
  rod(ST, [BX, 1.66, 0.83], 0.015, "#c9c9c9");
  P(new THREE.BoxGeometry(0.13, 0.06, 0.26), "#4a2a16", { at: [BX, 1.69, 0.82] });
  rod(HT, [BX, 1.76, 1.42], 0.016, "#c9c9c9");
  rod([BX - 0.27, 1.76, 1.4], [BX + 0.27, 1.76, 1.4], 0.014, "#c9c9c9");
  for (const s of [-1, 1]) b.capsule([BX + s * 0.22, 1.76, 1.4], [BX + s * 0.3, 1.76, 1.4], 0.022, { color: "#4a2a16", bone: "root" });
  P(new THREE.TorusGeometry(0.08, 0.012, 4, 14), "#c9c9c9", { at: [BX + 0.03, 1.0, 1.05], rotation: [0, 90, 0] });
  rod([BX + 0.05, 1.0, 1.05], [BX + 0.05, 0.86, 1.12], 0.012, "#888888");
  rod([BX - 0.05, 1.0, 1.05], [BX - 0.05, 1.14, 0.98], 0.012, "#888888");
  P(new THREE.BoxGeometry(0.09, 0.02, 0.05), "#2b2b2b", { at: [BX + 0.1, 0.86, 1.12] });
  P(new THREE.BoxGeometry(0.09, 0.02, 0.05), "#2b2b2b", { at: [BX - 0.1, 1.14, 0.98] });
  rod([BX + 0.02, 1.0, 0.95], [BX + 0.25, 0.71, 0.82], 0.012, "#888888");
  // basket with flowers
  P(new THREE.BoxGeometry(0.32, 0.2, 0.26), grain("#c9a46a", "#a9834c", { size: 0.02, axis: "x" }), {
    at: [BX, 1.56, 1.73],
  });
  for (let i = 0; i < 5; i++)
    P(new THREE.IcosahedronGeometry(0.045, 0), ["#ff6b9a", "#ffd23f", "#ffffff"][i % 3], {
      at: [BX - 0.1 + i * 0.05, 1.69 + (i % 2) * 0.03, 1.7 + (i % 3) * 0.03],
      flat: true,
    });

  // ---------- path stones and rocks ----------
  const stones = [
    [1.05, 3.25],
    [1.35, 3.85],
    [1.55, 4.45],
    [1.85, 5.05],
    [2.1, 5.6],
  ];
  stones.forEach(([x, z], i) =>
    P(new THREE.CylinderGeometry(0.27 - i * 0.01, 0.29, 0.06, 7), i % 2 ? "#a9a49a" : "#bdb8ad", {
      at: [x, 0.715, z],
      rotation: [0, i * 23, 0],
      flat: true,
    }),
  );
  const rk = rng(61);
  for (const [x, z, r] of [
    [-4.3, -2.6, 0.35],
    [-4.0, -2.2, 0.2],
    [4.2, -2.5, 0.3],
    [-2.4, 4.6, 0.25],
  ])
    P(new THREE.DodecahedronGeometry(r, 0), "#9a958c", {
      at: [x, 0.7 + r * 0.3, z],
      rotation: [rk() * 90, rk() * 90, 0],
      scale: [1, 0.7, 1],
      flat: true,
    });

  // ---------- grass tufts and flowers ----------
  const grassTex = svg(
    `<svg viewBox="0 0 64 64"><path d="M8 64 C10 40 6 24 2 8 C12 26 16 44 18 64Z M24 64 C24 36 28 18 34 2 C34 24 32 44 34 64Z M40 64 C42 42 48 26 60 12 C52 30 50 48 50 64Z" fill="#5f9e3c"/><path d="M28 64 C30 46 36 30 44 22 C40 36 38 50 40 64Z" fill="#82c04e"/></svg>`,
    { size: 128 },
  );
  const flowerTex = svg(
    `<svg viewBox="0 0 64 64"><path d="M31 64 L31 22 L33 22 L33 64Z" fill="#4f8f36"/><path d="M32 46 C22 40 18 34 20 30 C26 34 30 40 32 46Z" fill="#5fa241"/><g fill="#ffffff"><circle cx="32" cy="10" r="6"/><circle cx="42" cy="18" r="6"/><circle cx="38" cy="29" r="6"/><circle cx="26" cy="29" r="6"/><circle cx="22" cy="18" r="6"/></g><circle cx="32" cy="20" r="5" fill="#ffc93c"/></svg>`,
    { size: 128 },
  );
  const flowerTex2 = svg(
    `<svg viewBox="0 0 64 64"><path d="M31 64 L31 22 L33 22 L33 64Z" fill="#4f8f36"/><g fill="#ff7aa8"><circle cx="32" cy="12" r="7"/><circle cx="41" cy="20" r="7"/><circle cx="23" cy="20" r="7"/><circle cx="32" cy="27" r="7"/></g><circle cx="32" cy="20" r="4" fill="#fff4b0"/></svg>`,
    { size: 128 },
  );
  const gr = rng(71);
  const tufts = [];
  for (let i = 0; i < 400 && tufts.length < 170; i++) {
    const r = 5.8 * Math.sqrt(gr());
    const a = gr() * Math.PI * 2;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (Math.hypot(x, z - TZ) < 1.2) continue;
    if (stones.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 0.35)) continue;
    if (Math.abs(x - BX) < 0.3 && z > 0.2 && z < 2.0) continue;
    tufts.push(frame([x, 0.68, z], [0, 1, 0]));
  }
  b.cards(tufts, [grassTex, grassTex, grassTex, grassTex, flowerTex, flowerTex2], {
    size: [0.36, 0.32],
    cross: true,
    vary: 0.35,
    spin: 180,
    sink: 0.05,
    rng: rng(72),
    bone: "root",
  });

  return b.root;
}
