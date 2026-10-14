import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  lerp,
  paint,
  mottle,
  spots,
  grain,
  stripes,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Oak Treehouse Diorama",
  description:
    "A cozy treehouse diorama: an old oak with a leafy crown on a grassy round plinth, a plank cabin with a red shingle roof, round window, bunting and pennant, a lantern by the door, a rope ladder, a wooden swing, mushrooms, an owl in a knothole and a bicycle with a flower basket.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(42);

  const P = (geo: THREE.BufferGeometry, color: any, opts: any = {}) =>
    b.part(geo, color, { bone: root, ...opts });
  const rod = (a: any, c: any, r: number, color: any, extra: any = {}) =>
    b.rod(a, c, r, { color, bone: root, sides: 6, ...extra });

  // ---------- palette ----------
  const GRASS = "#6aac3e";
  const SOIL = "#6e4526";
  const WOODDARK = "#4e321d";
  const TRIM = "#f1e3c6";
  const ROPE = "#d9bb7e";
  const BRASS = "#d9a93a";
  const RED = "#d23a2f";
  const CREAM = "#f4ead2";
  const GLOW = "#ffd65c";
  const SHUTTER = "#3f8a78";

  // ---------- paints ----------
  const plank = (axis: "x" | "y" | "z", w: number, cols: string[], line: string) =>
    paint((p) => {
      const v = axis === "x" ? p.x : axis === "y" ? p.y : p.z;
      const k = v / w;
      const f = k - Math.floor(k);
      if (f < 0.08) return line;
      const i = Math.floor(k);
      const h = Math.abs(Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1;
      return cols[Math.floor(h * cols.length) % cols.length];
    });
  const wallPaint = plank("y", 0.2, ["#dba56a", "#cf9659", "#e3b37a"], "#8a5a33");
  const deckPaint = plank("x", 0.2, ["#a8713f", "#9a6536", "#b47c48"], "#5a3a22");
  const doorPaint = plank("x", 0.12, ["#8c5530", "#7d4a29", "#965d36"], "#4a2c18");
  const seatPaint = plank("z", 0.1, ["#b47c48", "#a8713f"], "#5a3a22");
  const shingle = paint((p) => {
    const rowH = 0.14;
    const r = p.y / rowH;
    const row = Math.floor(r);
    const fy = r - row;
    const u = p.z / 0.22 + (Math.abs(row) % 2) * 0.5;
    const col = Math.floor(u);
    const fu = u - col;
    if (fy < 0.16 || fu < 0.07) return "#7e1f1c";
    const h = Math.abs(Math.sin(row * 7.1 + col * 3.7) * 43758.5) % 1;
    return h < 0.33 ? "#c7372f" : h < 0.66 ? "#b12d27" : "#d64a38";
  });
  const bark = grain("#6b4428", "#46291a", { size: 0.09, axis: "y", seed: 3 });
  const soilPaint = stripes(SOIL, "#4f3019", { size: 0.1, axis: "y", wobble: 0.6, seed: 4 });

  // ---------- textures ----------
  const winTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#ffc24f"/>
      <circle cx="32" cy="38" r="22" fill="#ffe9a8"/>
      <path d="M0 0 H22 Q14 30 6 64 H0Z" fill="#d1453b"/>
      <path d="M64 0 H42 Q50 30 58 64 H64Z" fill="#d1453b"/>
      <rect x="0" y="0" width="64" height="7" fill="#a8322b"/>
      <rect x="29" y="0" width="6" height="64" fill="#5a3a22"/>
      <rect x="0" y="29" width="64" height="6" fill="#5a3a22"/>
    </svg>`,
    { size: 128 },
  );
  const roundTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#ffbf4a"/>
      <circle cx="32" cy="34" r="20" fill="#fff0b8"/>
      <rect x="29" y="0" width="6" height="64" fill="#5a3a22"/>
      <rect x="0" y="29" width="64" height="6" fill="#5a3a22"/>
    </svg>`,
    { size: 128 },
  );
  const signTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 72">
      <rect width="160" height="72" rx="8" fill="#c88a4f"/>
      <rect x="6" y="6" width="148" height="60" rx="5" fill="#e0aa6c"/>
      <path d="M10 26 H150 M10 48 H150" stroke="#b97d45" stroke-width="3"/>
      <text x="80" y="46" font-size="25" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" fill="#4a2814">TREEHOUSE</text>
      <circle cx="14" cy="14" r="3" fill="#5a3a22"/><circle cx="146" cy="14" r="3" fill="#5a3a22"/>
    </svg>`,
    { size: 320 },
  );
  const plaqueTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 22">
      <rect width="220" height="22" rx="3" fill="#c9962f"/>
      <rect x="2" y="2" width="216" height="18" rx="2" fill="#e6bd57"/>
      <text x="110" y="16" font-size="13" text-anchor="middle" font-family="Georgia, serif" font-style="italic" fill="#4a3210">Oakwood Hollow</text>
    </svg>`,
    { size: 512 },
  );
  const leafA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 62 C30 50 18 52 16 44 C24 42 12 34 14 28 C22 30 18 18 24 14 C28 20 30 8 32 2 C34 8 36 20 40 14 C46 18 42 30 50 28 C52 34 40 42 48 44 C46 52 34 50 32 62Z" fill="#ffffff"/>
      <path d="M32 60 L32 8" stroke="#a0a0a0" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  const leafB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 62 C14 46 12 22 32 2 C52 22 50 46 32 62Z" fill="#e8e8e8"/>
      <path d="M32 60 L32 8 M32 40 L22 30 M32 40 L42 30 M32 26 L25 18 M32 26 L39 18" stroke="#9a9a9a" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  const tuftTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M6 64 L13 20 L20 64Z M18 64 L28 4 L35 64Z M33 64 L44 12 L48 64Z M46 64 L58 26 L62 64Z" fill="#ffffff"/>
      <path d="M12 64 L22 30 L26 64Z" fill="#bdbdbd"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- base / plinth ----------
  b.lathe(
    [
      [0, 0],
      [6.3, 0],
      [6.3, 0.12],
      [6.2, 0.16],
      [0, 0.16],
    ],
    { at: [0, 0, 0], segments: 32, color: WOODDARK, bone: root, name: "plinth" },
  );
  P(new THREE.PlaneGeometry(1.1, 0.09), "#ffffff", {
    at: [0, 0.065, 6.31],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaqueTex,
    name: "plaque",
  });
  b.lathe(
    [
      [5.7, 0.15],
      [6.0, 0.15],
      [6.05, 0.3],
      [6.0, 0.44],
      [5.7, 0.44],
    ],
    { at: [0, 0, 0], segments: 32, color: soilPaint, bone: root, name: "soil" },
  );
  P(new THREE.CylinderGeometry(5.75, 5.75, 0.29, 24), SOIL, { at: [0, 0.295, 0], name: "soilFill" });
  const G = 0.52;
  const grassCap = b.lathe(
    [
      [0, 0.38],
      [6.05, 0.38],
      [6.13, 0.46],
      [6.0, G],
      [0, G],
    ],
    { at: [0, 0, 0], segments: 32, color: GRASS, bone: root, name: "grass" },
  );

  // ---------- trunk & roots ----------
  const trunkPath = catmull([
    [0, 0.25, 0],
    [0.06, 2, -0.05],
    [-0.05, 4, -0.25],
    [-0.1, 6, -0.45],
    [0, 7.8, -0.6],
  ]);
  const trunk = b.sweep(trunkPath, [1.0, 0.64, 0.52, 0.42, 0.3], {
    color: bark,
    sides: 10,
    bone: root,
    caps: { start: "flat", end: "round" },
    name: "trunk",
  });
  for (let i = 0; i < 7; i++) {
    const a = (i * 2 * Math.PI) / 7 + 0.3;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const L = 1 + R() * 0.35;
    b.sweep(
      catmull([
        [ca * 0.3, 1.3, sa * 0.3],
        [ca * 0.95, 0.88, sa * 0.95],
        [ca * 1.6 * L, 0.58, sa * 1.6 * L],
        [ca * 2.1 * L, 0.42, sa * 2.1 * L],
      ]),
      [0.4, 0.24, 0.1, 0.04],
      { color: bark, sides: 7, bone: root, name: `root${i}` },
    );
  }

  // owl peeking from a knothole
  const hole = b.surface(trunk).around([0, 2.2, 0]).at(15, 0);
  if (hole) {
    b.stick(new THREE.CylinderGeometry(0.19, 0.22, 0.1, 9), "#4a2d18", hole, { scale: [1, 1, 1.35], bone: root });
    b.stick(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 9), "#1b100a", hole, {
      scale: [1, 1, 1.35],
      embed: 0.3,
      bone: root,
    });
    for (const s of [1, -1]) {
      P(new THREE.SphereGeometry(0.04, 8, 6), GLOW, { at: hole.local([s * 0.055, 0.08, 0.03]) });
      P(new THREE.SphereGeometry(0.02, 6, 4), "#111111", { at: hole.local([s * 0.055, 0.115, 0.03]) });
    }
    P(new THREE.ConeGeometry(0.02, 0.05, 4), "#e08a2a", {
      at: hole.local([0, 0.09, -0.02]),
      dir: [0, -1, 0],
    });
  }

  // ---------- crown ----------
  const clusters: { p: number[]; r: number }[] = [
    { p: [0, 9.6, -0.7], r: 2.4 },
    { p: [-2.3, 8.5, -0.5], r: 1.9 },
    { p: [2.4, 8.7, -0.9], r: 1.9 },
    { p: [-1.0, 9.0, -2.3], r: 1.9 },
    { p: [1.3, 9.9, -1.8], r: 1.8 },
    { p: [-3.4, 7.3, -0.8], r: 1.4 },
    { p: [3.5, 7.2, 0.1], r: 1.3 },
    { p: [0.3, 11.0, -0.6], r: 1.5 },
    { p: [-1.9, 10.3, 0.2], r: 1.3 },
    { p: [2.0, 10.4, 0.0], r: 1.2 },
  ];
  const greens = ["#4f9a3a", "#3f8a35", "#5fae42", "#367c30"];
  const crownParts: any[] = [];
  clusters.forEach((c, i) => {
    crownParts.push(
      P(new THREE.IcosahedronGeometry(c.r, 1), greens[i % greens.length], {
        at: c.p,
        flat: true,
        rotation: [R() * 60, R() * 90, R() * 60],
        name: `crown${i}`,
      }),
    );
    const t = Math.min(0.97, Math.max(0.7, 0.6 + 0.35 * ((c.p[1] - 7) / 4)));
    const start = trunkPath.at(t);
    const m = lerp(start, c.p, 0.5);
    m.y += 0.4;
    b.sweep(catmull([start, m, c.p]), [0.27, 0.1], { color: bark, sides: 7, bone: root, name: `branch${i}` });
  });

  // ---------- swing branch & swing ----------
  const swingPath = catmull([
    [0.3, 2.6, 0.1],
    [1.5, 3.2, 0.4],
    [2.8, 3.5, 0.6],
    [4.0, 3.9, 0.6],
  ]);
  b.sweep(swingPath, [0.32, 0.12], { color: bark, sides: 8, bone: root, name: "swingBranch" });
  crownParts.push(
    P(new THREE.IcosahedronGeometry(0.95, 1), "#4f9a3a", { at: [4.15, 4.4, 0.6], flat: true, name: "crownSwing" }),
  );
  const top1 = swingPath.at(swingPath.closestT([2.4, 3.45, 0.55]));
  const top2 = swingPath.at(swingPath.closestT([3.1, 3.6, 0.6]));
  const swingJ = b.joint("swing", {
    parent: root,
    at: [(top1.x + top2.x) / 2, (top1.y + top2.y) / 2, (top1.z + top2.z) / 2],
    dir: [0, -1, 0],
    role: "hinge",
  });
  const SEAT_Y = 1.25;
  const seatZ = (top1.z + top2.z) / 2;
  for (const tp of [top1, top2]) {
    b.rod(tp, [tp.x, SEAT_Y, seatZ], 0.022, { color: ROPE, bone: swingJ, sides: 5 });
    b.part(new THREE.TorusGeometry(0.14, 0.03, 5, 10), ROPE, {
      bone: swingJ,
      at: [tp.x, tp.y, tp.z],
      rotation: [0, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), ROPE, { bone: swingJ, at: [tp.x, SEAT_Y + 0.06, seatZ] });
  }
  b.part(new THREE.BoxGeometry(Math.abs(top2.x - top1.x) + 0.2, 0.06, 0.32), seatPaint, {
    bone: swingJ,
    at: [(top1.x + top2.x) / 2, SEAT_Y, seatZ],
    name: "swingSeat",
  });

  // ---------- deck ----------
  const DECK_TOP = 4.3;
  P(new THREE.BoxGeometry(3.4, 0.2, 3.6), deckPaint, { at: [0, 4.2, 0.8], name: "deck" });
  for (const z of [-0.6, 0.8, 2.2]) P(new THREE.BoxGeometry(3.5, 0.14, 0.14), WOODDARK, { at: [0, 4.03, z] });
  for (const c of [
    [1.5, 4.05, 2.4],
    [-1.5, 4.05, 2.4],
    [1.5, 4.05, -0.8],
    [-1.5, 4.05, -0.8],
  ])
    rod([0.02, 2.9, -0.1], c, 0.09, WOODDARK);

  // railing
  const railSeg = (a: number[], c: number[], skipTrunk = false) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const n = Math.max(1, Math.round(len / 0.45));
    for (let i = 0; i <= n; i++) {
      const x = a[0] + ((c[0] - a[0]) * i) / n;
      const z = a[1] + ((c[1] - a[1]) * i) / n;
      if (skipTrunk && Math.abs(x) < 0.55) continue;
      P(new THREE.BoxGeometry(0.08, 0.62, 0.08), "#9a6536", { at: [x, DECK_TOP + 0.31, z] });
    }
    rod([a[0], DECK_TOP + 0.6, a[1]], [c[0], DECK_TOP + 0.6, c[1]], 0.045, "#b47c48");
    rod([a[0], DECK_TOP + 0.3, a[1]], [c[0], DECK_TOP + 0.3, c[1]], 0.03, "#9a6536");
  };
  railSeg([1.2, 2.6], [1.7, 2.6]);
  railSeg([-1.7, 2.6], [0.6, 2.6]);
  railSeg([1.7, 2.6], [1.7, -1.0]);
  railSeg([-1.7, 2.6], [-1.7, -1.0]);
  railSeg([-1.7, -1.0], [1.7, -1.0], true);

  // potted plant on the porch
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.15, 0.22],
      [0.17, 0.22],
      [0.17, 0.26],
      [0, 0.26],
    ],
    { at: [1.42, DECK_TOP, 2.3], segments: 8, color: "#c2643a", bone: root, name: "pot" },
  );
  P(new THREE.IcosahedronGeometry(0.2, 0), "#4c9a3c", { at: [1.42, DECK_TOP + 0.38, 2.3], flat: true });
  for (let i = 0; i < 4; i++)
    P(new THREE.SphereGeometry(0.04, 6, 4), "#f06a8a", {
      at: [1.42 + Math.cos(i * 1.7) * 0.15, DECK_TOP + 0.45 + (i % 2) * 0.08, 2.3 + Math.sin(i * 1.7) * 0.15],
    });

  // ---------- cabin ----------
  const WALL_TOP = 6.1;
  const FRONT = 1.8;
  const BACK = 0.1;
  P(new THREE.BoxGeometry(2.2, 1.8, FRONT - BACK), wallPaint, { at: [0, 5.2, (FRONT + BACK) / 2], name: "walls" });
  for (const sx of [1, -1])
    for (const z of [BACK, FRONT]) P(new THREE.BoxGeometry(0.14, 1.82, 0.14), TRIM, { at: [sx * 1.1, 5.2, z] });
  P(new THREE.BoxGeometry(2.32, 0.1, FRONT - BACK + 0.12), "#8a5a33", { at: [0, DECK_TOP + 0.05, (FRONT + BACK) / 2] });
  for (const z of [FRONT - 0.06, BACK + 0.06])
    b.extrude(
      [
        [-1.1, 0],
        [1.1, 0],
        [0, 0.9],
      ],
      { at: [0, WALL_TOP, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, color: wallPaint, bone: root },
    );

  // roof
  const ang = Math.atan2(0.9, 1.1);
  const panelLen = 1.4 / Math.cos(ang);
  for (const s of [1, -1]) {
    P(new THREE.BoxGeometry(panelLen + 0.04, 0.1, 2.15), shingle, {
      at: [s * 0.7, WALL_TOP + 0.9 - 0.7 * Math.tan(ang) + 0.06, 1.0],
      rotation: [0, 0, (-s * ang * 180) / Math.PI],
      name: s > 0 ? "roofL" : "roofR",
    });
    rod([0, WALL_TOP + 0.95, 2.1], [s * 1.42, WALL_TOP - 0.2, 2.1], 0.05, TRIM);
  }
  P(new THREE.BoxGeometry(0.2, 0.2, 2.2), "#7e1f1c", { at: [0, WALL_TOP + 0.98, 1.0], rotation: [0, 0, 45] });

  // round window in the gable
  P(new THREE.TorusGeometry(0.25, 0.055, 6, 16), TRIM, { at: [0, WALL_TOP + 0.33, FRONT + 0.03] });
  P(new THREE.CircleGeometry(0.25, 16), "#ffffff", {
    at: [0, WALL_TOP + 0.33, FRONT + 0.015],
    dir: [0, 0, 1],
    axis: "z",
    texture: roundTex,
  });

  // door
  P(new THREE.BoxGeometry(0.62, 1.3, 0.06), doorPaint, { at: [-0.45, DECK_TOP + 0.65, FRONT + 0.03], name: "door" });
  P(new THREE.BoxGeometry(0.78, 0.08, 0.08), TRIM, { at: [-0.45, DECK_TOP + 1.34, FRONT + 0.04] });
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.07, 1.36, 0.08), TRIM, { at: [-0.45 + s * 0.35, DECK_TOP + 0.67, FRONT + 0.04] });
  P(new THREE.SphereGeometry(0.035, 6, 4), BRASS, { at: [-0.22, DECK_TOP + 0.65, FRONT + 0.08] });
  for (const y of [DECK_TOP + 0.3, DECK_TOP + 1.0])
    P(new THREE.BoxGeometry(0.16, 0.05, 0.02), "#2e2620", { at: [-0.67, y, FRONT + 0.07] });
  P(new THREE.BoxGeometry(0.7, 0.02, 0.4), stripes("#c0543a", "#e8c070", { size: 0.12, axis: "x" }), {
    at: [-0.45, DECK_TOP + 0.01, FRONT + 0.3],
  });

  // windows
  const windowOn = (c: number[], side: "front" | "left", w: number, h: number, shutters: boolean) => {
    const at = (u: number, v: number, d: number) =>
      side === "front" ? [c[0] + u, c[1] + v, c[2] + d] : [c[0] + d, c[1] + v, c[2] - u];
    const rot = side === "front" ? [0, 0, 0] : [0, 90, 0];
    const nrm = side === "front" ? [0, 0, 1] : [1, 0, 0];
    P(new THREE.PlaneGeometry(w, h), "#ffffff", { at: at(0, 0, 0.015), dir: nrm, axis: "z", texture: winTex });
    const t = 0.07;
    for (const s of [1, -1]) {
      P(new THREE.BoxGeometry(w + 2 * t, t, 0.08), TRIM, { at: at(0, s * (h / 2 + t / 2), 0.03), rotation: rot });
      P(new THREE.BoxGeometry(t, h, 0.08), TRIM, { at: at(s * (w / 2 + t / 2), 0, 0.03), rotation: rot });
      if (shutters)
        P(new THREE.BoxGeometry(w * 0.5, h + 0.08, 0.04), SHUTTER, {
          at: at(s * (w / 2 + t + w * 0.25 + 0.01), 0, 0.03),
          rotation: rot,
        });
    }
    P(new THREE.BoxGeometry(w + 0.16, 0.13, 0.16), "#9a6536", { at: at(0, -h / 2 - 0.14, 0.09), rotation: rot });
    const fl = ["#f06a8a", "#ffd54a", "#ffffff", "#b77ce0"];
    for (let i = 0; i < 5; i++) {
      const u = -w / 2 + ((i + 0.5) * w) / 5;
      P(new THREE.SphereGeometry(0.05, 6, 4), "#4c9a3c", { at: at(u, -h / 2 - 0.06, 0.09) });
      P(new THREE.SphereGeometry(0.035, 6, 4), fl[i % fl.length], { at: at(u + 0.02, -h / 2 - 0.02, 0.13) });
    }
  };
  windowOn([0.6, 5.25, FRONT], "front", 0.42, 0.46, false);
  windowOn([1.1, 5.25, (FRONT + BACK) / 2], "left", 0.5, 0.5, true);

  // lantern by the door
  rod([0.06, 5.58, FRONT], [0.06, 5.58, 2.06], 0.018, "#2e2620");
  P(new THREE.TorusGeometry(0.03, 0.008, 4, 8), "#2e2620", { at: [0.06, 5.53, 2.06] });
  P(new THREE.ConeGeometry(0.11, 0.1, 6), "#2e2620", { at: [0.06, 5.46, 2.06], flat: true });
  P(new THREE.BoxGeometry(0.13, 0.17, 0.13), GLOW, { at: [0.06, 5.33, 2.06], name: "lanternGlow" });
  P(new THREE.BoxGeometry(0.16, 0.03, 0.16), "#2e2620", { at: [0.06, 5.235, 2.06] });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      P(new THREE.BoxGeometry(0.02, 0.19, 0.02), "#2e2620", { at: [0.06 + sx * 0.065, 5.33, 2.06 + sz * 0.065] });

  // bunting across the front
  const bunt = bezier([1.0, 6.22, 2.13], [0.4, 5.85, 2.18], [-0.4, 5.85, 2.18], [-1.0, 6.22, 2.13]);
  b.sweep(bunt, 0.008, { color: "#f4efe1", bone: root, sides: 4 });
  const buntCols = ["#e94b3c", "#ffd54a", "#3d8fd6", "#5cbf5a", "#f28ab2"];
  let bi = 0;
  b.along(bunt, 9, (at) => {
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0, -0.17, "sharp"],
      ],
      { at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, color: buntCols[bi++ % buntCols.length], bone: root },
    );
  });

  // pennant on the roof
  const poleBase = [0, WALL_TOP + 0.95, 2.0];
  const poleTop = [0, WALL_TOP + 2.0, 2.0];
  rod(poleBase, poleTop, 0.025, "#5a3a22");
  P(new THREE.SphereGeometry(0.05, 8, 6), BRASS, { at: [0, WALL_TOP + 2.03, 2.0] });
  const flagJ = b.joint("flag", { parent: root, at: [0, WALL_TOP + 1.95, 2.0], dir: [1, 0, 0] });
  b.extrude(
    [
      [0, 0],
      [0.85, 0.18, "sharp"],
      [0, 0.36],
    ],
    {
      at: [0, WALL_TOP + 1.6, 2.0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      color: paint((_p, _n, s) =>
        s[0] < 0.14 ? "#f2c94c" : Math.floor((s[0] - 0.14) / 0.16) % 2 === 0 ? "#d23a2f" : "#f4efe1",
      ),
      bone: flagJ,
      name: "pennant",
    },
  );

  // ---------- rope ladder ----------
  for (const x of [0.68, 1.12])
    b.sweep(
      catmull([
        [x, DECK_TOP, 2.62],
        [x, 2.4, 2.82],
        [x, 0.62, 2.98],
      ]),
      0.022,
      { color: ROPE, bone: root, sides: 5 },
    );
  for (let y = 4.0; y > 0.75; y -= 0.32) {
    const z = 2.62 + ((DECK_TOP - y) / (DECK_TOP - 0.62)) * 0.36;
    rod([0.63, y, z], [1.17, y, z], 0.032, "#b47c48");
    for (const x of [0.68, 1.12]) P(new THREE.SphereGeometry(0.04, 6, 4), ROPE, { at: [x, y, z] });
  }

  // ---------- ground details ----------
  // stepping stones
  [
    [1.0, 3.6],
    [1.3, 4.3],
    [1.5, 5.0],
    [1.6, 5.6],
  ].forEach(([x, z], i) =>
    P(new THREE.CylinderGeometry(0.26, 0.3, 0.1, 7), i % 2 ? "#9a9890" : "#b2afa5", {
      at: [x, G + 0.01, z],
      flat: true,
      rotation: [0, R() * 60, 0],
      scale: [1 + R() * 0.2, 1, 0.85],
    }),
  );

  // signpost
  rod([2.3, G - 0.05, 3.3], [2.3, G + 1.0, 3.3], 0.045, "#7d4a29");
  P(new THREE.BoxGeometry(0.84, 0.4, 0.05), "#9a6536", { at: [2.3, G + 0.85, 3.34] });
  P(new THREE.PlaneGeometry(0.8, 0.36), "#ffffff", {
    at: [2.3, G + 0.85, 3.37],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTex,
  });

  // mushrooms
  const mushroom = (x: number, z: number, h: number, r: number, cap: string) => {
    b.lathe(
      [
        [0, 0],
        [r * 0.38, 0],
        [r * 0.3, h * 0.8],
        [0, h * 0.85],
      ],
      { at: [x, G - 0.02, z], segments: 8, color: CREAM, bone: root },
    );
    b.lathe(
      [
        [0, 0],
        [r, 0],
        [r * 0.95, r * 0.25],
        [r * 0.6, r * 0.6],
        [0, r * 0.7],
      ],
      {
        at: [x, G + h * 0.72, z],
        segments: 10,
        smoothing: 1,
        color: spots(cap, "#fff6e6", { size: r * 0.5, amount: 0.3, seed: Math.round(x * 10) }),
        bone: root,
      },
    );
  };
  mushroom(1.7, 1.3, 0.34, 0.27, RED);
  mushroom(2.2, 1.2, 0.2, 0.17, RED);
  mushroom(1.45, 1.75, 0.14, 0.12, RED);
  mushroom(-1.2, -1.9, 0.3, 0.25, "#d9822b");
  mushroom(-2.1, -1.1, 0.18, 0.15, "#d9822b");
  mushroom(2.6, -0.9, 0.27, 0.22, RED);

  // ---------- bicycle ----------
  const BX = -2.6;
  const BZ = 2.5;
  const bp = (x: number, y: number, z = 0) => [BX + x, G + y, BZ + z];
  const FR = "#2f9e8f";
  const TIRE = "#2a2624";
  const CHROME = "#c9cdd2";
  for (const wx of [-0.52, 0.52]) {
    P(new THREE.TorusGeometry(0.33, 0.035, 6, 22), TIRE, { at: bp(wx, 0.37) });
    P(new THREE.TorusGeometry(0.295, 0.012, 4, 22), CHROME, { at: bp(wx, 0.37) });
    P(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 8), CHROME, { at: bp(wx, 0.37), rotation: [90, 0, 0] });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      rod(bp(wx, 0.37), bp(wx + Math.cos(a) * 0.29, 0.37 + Math.sin(a) * 0.29), 0.005, CHROME, { sides: 3 });
    }
  }
  const RH = bp(-0.52, 0.37);
  const FH = bp(0.52, 0.37);
  const BB = bp(-0.06, 0.3);
  const ST = bp(-0.16, 0.86);
  const HT = bp(0.36, 0.88);
  const HB = bp(0.41, 0.7);
  for (const [a, c] of [
    [RH, BB],
    [RH, ST],
    [BB, ST],
    [ST, HT],
    [BB, HB],
    [HB, FH],
  ])
    rod(a, c, 0.022, FR);
  rod(HT, HB, 0.03, FR);
  rod(ST, bp(-0.18, 0.96), 0.016, CHROME);
  P(new THREE.BoxGeometry(0.25, 0.05, 0.13), "#5a3320", { at: bp(-0.19, 0.99) });
  rod(HT, bp(0.33, 1.0), 0.018, CHROME);
  rod(bp(0.33, 1.0, -0.26), bp(0.33, 1.0, 0.26), 0.014, CHROME);
  for (const s of [1, -1])
    b.capsule(bp(0.33, 1.0, s * 0.18), bp(0.33, 1.0, s * 0.27), 0.022, { color: "#5a3320", bone: root, sides: 6 });
  P(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { at: bp(0.33, 1.04, 0.12) });
  P(new THREE.SphereGeometry(0.04, 6, 4), "#fff6c8", { at: bp(0.46, 0.8) });
  P(new THREE.TorusGeometry(0.09, 0.014, 4, 12), CHROME, { at: bp(-0.06, 0.3, 0.05) });
  rod(bp(-0.06, 0.3, 0.06), bp(0.06, 0.2, 0.08), 0.012, CHROME);
  P(new THREE.BoxGeometry(0.08, 0.02, 0.06), "#2a2624", { at: bp(0.06, 0.2, 0.12) });
  rod(BB, bp(-0.22, -0.01, -0.16), 0.012, CHROME);
  // flower basket
  const wicker = paint((p) =>
    (Math.floor(p.y / 0.04) + Math.floor((p.x + p.z) / 0.04)) % 2 ? "#c8995a" : "#a87a42",
  );
  P(new THREE.BoxGeometry(0.3, 0.2, 0.34), wicker, { at: bp(0.64, 0.98), name: "basket" });
  rod(HB, bp(0.6, 0.88), 0.012, CHROME);
  const bf = ["#f06a8a", "#ffd54a", "#ffffff", "#b77ce0", "#ff8a3d"];
  for (let i = 0; i < 6; i++) {
    const at = bp(0.58 + (i % 3) * 0.06, 1.1 + (i % 2) * 0.05, -0.1 + Math.floor(i / 2) * 0.1);
    P(new THREE.SphereGeometry(0.05, 6, 4), bf[i % bf.length], { at });
  }
  P(new THREE.IcosahedronGeometry(0.1, 0), "#4c9a3c", { at: bp(0.64, 1.08), flat: true });

  // ---------- grass tufts & flowers ----------
  const grassSurf = b.surface(grassCap);
  const onLawn = (h: any) => {
    const d = Math.hypot(h.at.x, h.at.z);
    return h.n.y > 0.9 && d > 1.4 && d < 5.85;
  };
  b.cards(grassSurf.scatter(190, { rng: rng(7), minDist: 0.35, filter: onLawn }), tuftTex, {
    size: [0.36, 0.3],
    cross: true,
    vary: 0.35,
    spin: 90,
    rng: rng(8),
    color: mottle("#7cc04a", "#4f9334", { size: 1.4, seed: 6 }),
    bone: root,
  });
  const flowerCols = ["#ffffff", "#ffd54a", "#f28ab2", "#b77ce0"];
  grassSurf.scatter(34, { rng: rng(9), minDist: 0.5, filter: onLawn }).forEach((h, i) => {
    b.stick(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 3), "#3f7d2e", h, { bone: root, embed: 0.1 });
    P(new THREE.SphereGeometry(0.055, 6, 4), flowerCols[i % flowerCols.length], {
      at: h.local([0, 0.16, 0]),
      scale: [1, 0.6, 1],
    });
    P(new THREE.SphereGeometry(0.025, 5, 3), "#f2a93a", { at: h.local([0, 0.19, 0]) });
  });

  // ---------- leaf cards over the crown ----------
  const crownSurf = b.surface(crownParts);
  b.cards(crownSurf.scatter(520, { rng: rng(12), minDist: 0.32 }), [leafA, leafB, leafA], {
    size: [0.5, 0.55],
    lean: 45,
    bend: 25,
    vary: 0.35,
    spin: 50,
    rng: rng(13),
    color: mottle("#78c84c", "#3b8a34", { size: 1.6, seed: 9 }),
    bone: root,
  });

  return b.root;
}
