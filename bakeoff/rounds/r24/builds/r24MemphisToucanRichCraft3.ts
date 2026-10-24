import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  paint,
  svg,
  mix,
  smoothstep,
  cells,
  stripes,
  scales,
} from "../../../../src/index";

export const meta = {
  name: "Memphis Toucan",
  description:
    "A 1980s Memphis Group toucan: black confetti-terrazzo body, zig-zag banded beak, squiggle bib, rainbow flight feathers, blue scaled legs. Rigged with jaw, wings, tail, legs and zygodactyl toes.",
};

// ---------------------------------------------------------------- palette
const INKC = "#1a1626";
const NAVY = "#1d1a2e";
const INKW = "#2b2650";
const CREAM = "#fff0c2";
const PINK = "#ff4f9a";
const TEAL = "#12c4b4";
const YELLOW = "#ffd62e";
const BLUE = "#2c55f0";
const ORANGE = "#ff7b1c";
const LILAC = "#b79bff";
const WHITE = "#ffffff";
const CONF = [PINK, TEAL, YELLOW, BLUE, ORANGE];

type RGB = readonly [number, number, number];

const zig = (x: number) => Math.abs((((x % 1) + 1) % 1) * 2 - 1);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

// piecewise smooth profile: keys of [t, rx, ry]
const keyed = (keys: number[][]) => (t: number): [number, number] => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const k0 = keys[i - 1];
      const k1 = keys[i];
      const u = Math.min(Math.max((t - k0[0]) / (k1[0] - k0[0]), 0), 1);
      const e = u * u * (3 - 2 * u);
      return [k0[1] + (k1[1] - k0[1]) * e, k0[2] + (k1[2] - k0[2]) * e];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};

// ---------------------------------------------------------------- textures
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${BLUE}" stroke="${INKC}" stroke-width="3.5"/>
    <circle cx="50" cy="50" r="43" fill="none" stroke="${WHITE}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="35" fill="${PINK}" stroke="${INKC}" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="26" fill="${YELLOW}" stroke="${INKC}" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="17" fill="${INKC}"/>
    <circle cx="43" cy="43" r="6.5" fill="${WHITE}"/>
    <circle cx="58" cy="59" r="3" fill="${WHITE}"/>
  </svg>`,
  { size: 192 },
);

const BIB = svg(
  `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 H68 Q78 2 78 12 V58 Q78 98 40 98 Q2 98 2 58 V12 Q2 2 12 2Z" fill="${CREAM}" stroke="${INKC}" stroke-width="3.5"/>
    <path d="M12 20 q5.5 -9 11 0 t11 0 t11 0 t11 0 t11 0" fill="none" stroke="${PINK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 36 q5.5 -9 11 0 t11 0 t11 0 t11 0 t11 0" fill="none" stroke="${TEAL}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="12,64 28,64 20,48" fill="${BLUE}" stroke="${INKC}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="44" cy="56" r="7" fill="${YELLOW}" stroke="${INKC}" stroke-width="2.5"/>
    <polygon points="56,64 70,64 63,50" fill="${PINK}" stroke="${INKC}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M10 82 l7 -9 l7 9 l7 -9 l7 9 l7 -9 l7 9 l7 -9 l7 9" fill="none" stroke="${INKC}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="24" cy="91" r="2.5" fill="${PINK}"/><circle cx="40" cy="92" r="2.5" fill="${TEAL}"/><circle cx="56" cy="91" r="2.5" fill="${BLUE}"/>
  </svg>`,
  { size: 192 },
);

const SQUIG = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 14 q9 -14 18 0 t18 0 t18 0 t18 0 t18 0 t18 0" stroke="${WHITE}" stroke-width="10"/>
      <path d="M6 14 q9 -14 18 0 t18 0 t18 0 t18 0 t18 0 t18 0" stroke="${INKC}" stroke-width="5"/>
      <path d="M6 48 q9 -14 18 0 t18 0 t18 0 t18 0 t18 0 t18 0" stroke="${WHITE}" stroke-width="10"/>
      <path d="M6 48 q9 -14 18 0 t18 0 t18 0 t18 0 t18 0 t18 0" stroke="${INKC}" stroke-width="5"/>
    </g>
    <circle cx="30" cy="31" r="6" fill="${WHITE}" stroke="${INKC}" stroke-width="3"/>
    <polygon points="56,38 74,38 65,22" fill="${WHITE}" stroke="${INKC}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="94" cy="31" r="6" fill="${WHITE}" stroke="${INKC}" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const BACK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 3 L97 50 L50 97 L3 50Z" fill="${YELLOW}" stroke="${INKC}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="19" fill="${TEAL}" stroke="${INKC}" stroke-width="3"/>
    <polygon points="38,60 62,60 50,38" fill="${PINK}" stroke="${INKC}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 50 l8 -8 l8 8 M66 50 l8 -8 l8 8" fill="none" stroke="${INKC}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M30 80 q5 -8 10 0 t10 0 t10 0 t10 0" fill="none" stroke="${BLUE}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="16" r="3.5" fill="${INKC}"/><circle cx="50" cy="86" r="3.5" fill="${INKC}"/>
  </svg>`,
  { size: 192 },
);

const CHEEK = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 40 q6 -14 12 0 t12 0 t12 0 t12 0" fill="none" stroke="${INKC}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="8,24 24,24 16,8" fill="${PINK}" stroke="${INKC}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="42" cy="17" r="7" fill="${TEAL}" stroke="${INKC}" stroke-width="3"/>
    <circle cx="30" cy="53" r="3" fill="${BLUE}"/>
  </svg>`,
  { size: 128 },
);

const fluff = (col: string, accent: string) =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 63 C3 46 2 20 16 2 C30 20 29 46 16 63Z" fill="${col}" stroke="${INKC}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M16 60 V12" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M16 46 L8 38 M16 46 L24 38 M16 32 L9 25 M16 32 L23 25" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
const FLUFF_PINK = fluff(PINK, WHITE);
const FLUFF_TEAL = fluff(TEAL, YELLOW);

// ---------------------------------------------------------------- paints
const confettiBlack = (p: THREE.Vector3, n: THREE.Vector3): string | RGB => {
  const c = cells(p, 0.06, 7);
  if (c.id < 0.25 && c.d1 < 0.17) return CONF[Math.floor((c.id / 0.25) * CONF.length) % CONF.length];
  return mix(NAVY, "#403a78", smoothstep(-0.2, 0.9, n.y) * 0.8);
};

const bodyPaint = paint((p, n) => {
  const edge = 0.325 + 0.02 * zig(p.x / 0.04);
  const front = p.z > -0.03 && n.z > 0;
  if (front && p.y > edge && Math.abs(p.x) < 0.07 + 0.01 * zig(p.y / 0.03)) return CREAM;
  if (front && p.y > edge - 0.016 && Math.abs(p.x) < 0.08) return PINK;
  if (p.z < -0.05 + 0.014 * zig(p.x / 0.03)) return n.y > 0.1 ? YELLOW : PINK;
  return confettiBlack(p, n);
});

const blackPaint = paint((p, n) => confettiBlack(p, n));

const headPaint = paint((p, n) => {
  const e = 0.54 + 0.013 * zig(p.z / 0.036);
  if (p.y > e || (n.z < -0.25 && p.y > 0.5)) return INKC;
  if (p.y > e - 0.011) return YELLOW;
  const c = cells(p, 0.04, 3);
  if (c.id < 0.14 && c.d1 < 0.14) return c.id < 0.07 ? TEAL : PINK;
  return n.y < -0.5 ? mix(CREAM, PINK, 0.4) : CREAM;
});

const BANDS: [number, string][] = [
  [0.07, INKC],
  [0.26, YELLOW],
  [0.43, PINK],
  [0.59, TEAL],
  [0.75, ORANGE],
  [0.9, LILAC],
  [1.1, INKC],
];
const beakPaint = paint((_p, _n, s) => {
  const tt = s[0] + 0.055 * zig(s[1] / 72);
  let col = INKC;
  let edge = 1;
  for (let i = 0; i < BANDS.length; i++) {
    if (tt < BANDS[i][0]) {
      col = BANDS[i][1];
      edge = Math.min(i ? tt - BANDS[i - 1][0] : 1, BANDS[i][0] - tt);
      break;
    }
  }
  if (edge < 0.011) return INKC;
  if ((s[1] < 12 || s[1] > 348) && col !== INKC) return mix(col, WHITE, 0.5);
  return col;
});

const legPaint = scales(["#2f6bff", "#19b4ea"], INKC, { size: 0.022, width: 0.18, seed: 4 });
const thighPaint = stripes(CREAM, [TEAL, PINK], { size: 0.03, axis: "y", width: 0.4, seed: 2 });

const featherPaints = new Map<string, ReturnType<typeof paint>>();
function featherPaint(col: string, tip: string, len: number) {
  const key = `${col}|${tip}|${len.toFixed(3)}`;
  let p = featherPaints.get(key);
  if (!p) {
    p = paint((_p, _n, s) => {
      const x = s[0];
      if (x > len * 0.8) return tip;
      if (Math.abs(s[1]) < 0.0035 && x > len * 0.1) return mix(col, WHITE, 0.45);
      if (x < len * 0.18) return mix(col, INKC, 0.45);
      return col;
    });
    featherPaints.set(key, p);
  }
  return p;
}

const featherOutline = (L: number, w: number): [number, number][] => [
  [0, -0.3 * w],
  [0.25 * L, -0.5 * w],
  [0.75 * L, -0.5 * w],
  [0.93 * L, -0.3 * w],
  [L, 0],
  [0.93 * L, 0.3 * w],
  [0.75 * L, 0.5 * w],
  [0.25 * L, 0.5 * w],
  [0, 0.3 * w],
];

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "toucan" });

  // generic helpers --------------------------------------------------
  const feather = (
    bone: any,
    at: THREE.Vector3,
    d: THREE.Vector3,
    len: number,
    wid: number,
    col: string,
    tip: string = INKC,
    nrm: THREE.Vector3 = UP,
    thick = 0.005,
  ) => {
    const x = d.clone().normalize();
    const n = nrm.clone().addScaledVector(x, -nrm.dot(x)).normalize();
    const y = n.clone().cross(x).normalize();
    return b.extrude(featherOutline(len, wid), {
      at,
      x: [x.x, x.y, x.z],
      y: [y.x, y.y, y.z],
      thickness: thick,
      bevel: 0.0015,
      smoothing: 1,
      color: featherPaint(col, tip, len),
      bone,
    });
  };

  const chipGeo = (i: number): THREE.BufferGeometry => {
    switch (i % 4) {
      case 0:
        return new THREE.ConeGeometry(0.014, 0.018, 3);
      case 1:
        return new THREE.TorusGeometry(0.01, 0.004, 4, 8).rotateX(Math.PI / 2);
      case 2:
        return new THREE.CylinderGeometry(0.011, 0.011, 0.006, 8);
      default:
        return new THREE.BoxGeometry(0.02, 0.006, 0.012);
    }
  };
  const confettiOn = (target: any, count: number, seed: number, minDist: number, filter: (h: any) => boolean) => {
    const hits = b.surface(target).scatter(count, { rng: rng(seed), minDist, filter });
    hits.forEach((h, i) => {
      b.stick(chipGeo(i + seed), CONF[(i + seed) % CONF.length], h, { embed: 0.4, flat: true, spin: i * 47 });
    });
  };

  // skeleton ---------------------------------------------------------
  const P0 = V(0, 0.22, -0.1);
  const P1 = V(0, 0.25, -0.03);
  const P2 = V(0, 0.31, 0.05);
  const P3 = V(0, 0.39, 0.1);
  const Pn = V(0, 0.445, 0.115);
  const P4 = V(0, 0.5, 0.13);

  const hips = b.joint("hips", { at: P0 });
  const body = b.chain("spine", catmull([P0, P1, P2, P3]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = body.joints[2];
  const neck = b.chain("neck", catmull([P3, Pn, P4]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: P4, dir: [0, 0.25, 1], role: "head" });
  const HP = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: HP(0.06, -0.03), aim: HP(0.25, -0.03), role: "jaw" });

  const tail = b.chain("tail", catmull([P0, V(0, 0.19, -0.17), V(0, 0.14, -0.26), V(0, 0.09, -0.33)]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // body & tail skins -------------------------------------------------
  const bodyRad = keyed([
    [0, 0.035, 0.035],
    [0.1, 0.07, 0.07],
    [0.3, 0.082, 0.085],
    [0.5, 0.085, 0.09],
    [0.66, 0.072, 0.075],
    [0.8, 0.048, 0.05],
    [1, 0.044, 0.046],
  ]);
  const bodyTube = b.sweep(catmull([P0, P1, P2, P3, Pn, P4]), bodyRad, {
    bone: [body, neck],
    color: bodyPaint,
  });
  b.sweep(tail, (t: number): [number, number] => [0.05 - 0.025 * t, 0.04 - 0.02 * t], { color: bodyPaint });

  // chest bib + back plate decals
  b.decal(bodyTube, BIB, { at: V(0, 0.345, 0.14), dir: [0, 0.15, 1], size: [0.1, 0.125], segments: 12 });
  b.decal(bodyTube, BACK, { at: V(0, 0.4, 0.0), dir: [0, 1, -0.15], size: [0.12, 0.12], segments: 12 });

  // body confetti chips (terrazzo bits)
  confettiOn(bodyTube, 26, 3, 0.06, (h) => h.n.z < 0.35 && h.n.y > -0.25 && Math.abs(h.at.x) < 0.09 && h.at.y > 0.2);

  // tail feather fan --------------------------------------------------
  const tail1 = tail.joints[0];
  const tailRoot = V(0, 0.205, -0.12);
  [-18, 0, 18].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    feather(tail1, tailRoot.clone().add(V(0, -0.01, 0)), V(Math.sin(a) * 0.9, -0.34, -Math.cos(a)), 0.22, 0.05, BLUE, PINK, UP, 0.005);
    void i;
  });
  const tailCols = [TEAL, PINK, YELLOW, PINK, TEAL];
  [-36, -18, 0, 18, 36].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const len = 0.26 - 0.02 * Math.abs(i - 2);
    feather(tail1, tailRoot.clone().add(V(0, 0.003 + 0.0035 * (2 - Math.abs(i - 2)), 0)), V(Math.sin(a) * 0.9, -0.38, -Math.cos(a)), len, 0.052, tailCols[i], INKC, UP, 0.005);
  });

  // skull -------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(0.06, 12, 9), headPaint, {
    bone: head,
    at: HP(0.03, 0.035),
    scale: [0.95, 0.92, 1.05],
  });
  const skin = b.surface(skull);
  const eyelid = () => new THREE.TorusGeometry(0.034, 0.0055, 5, 14).rotateX(Math.PI / 2);
  for (const s of [1, -1]) {
    const hit = skin.around(skull.at).at(s * 76, 6);
    if (hit) {
      b.decal(skin, EYE, { at: hit, size: [0.07, 0.07], segments: 10 });
      b.stick(eyelid(), PINK, hit, { embed: 0.25, flat: true });
    }
    const cheek = skin.around(skull.at).at(s * 72, -30);
    if (cheek) b.decal(skin, CHEEK, { at: cheek, size: [0.05, 0.05], segments: 8, roll: s * 10 });
    const brow = skin.around(skull.at).at(s * 52, 40);
    if (brow) b.stick(new THREE.ConeGeometry(0.012, 0.022, 3), TEAL, brow, { embed: 0.3, flat: true, spin: s * 30 });
  }
  confettiOn(skull, 7, 11, 0.035, (h) => h.n.y > 0.1 && h.n.z < 0.4);

  // crown plume -------------------------------------------------------
  const crownCols = [TEAL, PINK, YELLOW];
  [-1, 0, 1].forEach((k, i) => {
    feather(head, HP(0.0, 0.072, k * 0.012), V(k * 0.4, 1, -0.55), 0.085 - 0.012 * Math.abs(k), 0.032, crownCols[i], INKC, V(0, 0.3, 1), 0.006);
  });

  // beak --------------------------------------------------------------
  const upperPath = bezier(HP(0.06, 0.015), HP(0.15, 0.045), HP(0.25, 0.04), HP(0.31, -0.03));
  const upper = b.sweep(
    upperPath,
    keyed([
      [0, 0.036, 0.052],
      [0.35, 0.034, 0.048],
      [0.75, 0.022, 0.028],
      [1, 0.004, 0.004],
    ]),
    { bone: head, color: beakPaint, caps: { start: "flat", end: "round" }, sides: 8 },
  );
  const lower = b.sweep(
    catmull([HP(0.06, -0.035), HP(0.14, -0.04), HP(0.22, -0.035), HP(0.27, -0.018)]),
    keyed([
      [0, 0.03, 0.034],
      [0.5, 0.026, 0.03],
      [1, 0.004, 0.003],
    ]),
    { bone: jaw, color: beakPaint, caps: { start: "flat", end: "round" }, sides: 8 },
  );
  // collar at beak base
  b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 14), CREAM, {
    bone: head,
    at: HP(0.092, 0.018),
    scale: [1, 1.35, 1],
    flat: true,
  });
  // beak details
  b.along(upper, 5, (at) => b.stick(new THREE.SphereGeometry(0.0065, 5, 4), CREAM, at, { embed: 0.4 }), {
    from: 0.15,
    to: 0.85,
  });
  for (let i = 0; i < 7; i++) {
    b.stick(new THREE.ConeGeometry(0.006, 0.011, 3), INKC, upper.at(0.22 + 0.075 * i, 180), { embed: 0.3, flat: true });
  }
  for (const s of [1, -1]) {
    const deg = s > 0 ? 270 : 90;
    b.stick(new THREE.SphereGeometry(0.0085, 6, 4), INKC, upper.at(0.17, deg), { embed: 0.55 });
    b.decal(upper, SQUIG, {
      at: upper.at(0.5, deg),
      dir: [s, 0, 0],
      size: [0.13, 0.065],
      segments: 14,
      up: [0, 1, 0],
      mirror: s > 0,
    });
  }

  // neck ruff (cards) ------------------------------------------------
  const ruff = b.ring(neck.at(0.15), { count: 11, radius: 0.055 }).items;
  b.cards(ruff, [FLUFF_PINK, FLUFF_TEAL], {
    size: [0.034, 0.055],
    lean: 70,
    bend: 20,
    rng: rng(5),
    vary: 0.2,
    flow: [0, -0.5, -1],
  });

  // wings ------------------------------------------------------------
  const secCols = [PINK, YELLOW, TEAL];
  const priCols = [BLUE, PINK, TEAL, YELLOW, BLUE, PINK];
  const priLens = [0.12, 0.135, 0.145, 0.15, 0.14, 0.12];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = V(s * 0.07, 0.36, 0.03);
    const el = V(s * 0.115, 0.368, -0.02);
    const wr = V(s * 0.165, 0.375, 0.0);
    const hd = V(s * 0.205, 0.378, 0.02);
    const arm = b.chain(`wing${L}`, catmull([sh, el, wr, hd]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "wing",
    });
    const armTube = b.sweep(arm, (t: number): [number, number] => [0.032 - 0.014 * t, 0.028 - 0.012 * t], {
      color: blackPaint,
    });
    confettiOn(armTube, 6, 20 + (s > 0 ? 0 : 5), 0.035, (h) => h.n.y > 0.2);

    // secondaries, greater and median coverts
    for (let i = 0; i < 6; i++) {
      const u = 0.1 + i * 0.15;
      const pt = arm.at(u).at;
      const j = arm.jointAt(u);
      const dx = s * (0.05 + 0.04 * i);
      feather(j, V(pt.x, pt.y + 0.002 + i * 0.0035, pt.z - 0.02), V(dx, 0, -1), 0.17, 0.05, secCols[i % 3], INKC);
      feather(j, V(pt.x, pt.y + 0.012 + i * 0.0035, pt.z - 0.018), V(dx, 0, -1), 0.1, 0.046, INKW, secCols[(i + 1) % 3]);
      feather(j, V(pt.x, pt.y + 0.019 + i * 0.0035, pt.z - 0.014), V(dx, 0, -1), 0.06, 0.04, NAVY, YELLOW);
    }
    // primaries and their coverts
    const hand = arm.joints[arm.joints.length - 1];
    for (let i = 0; i < 6; i++) {
      const th = ((14 + i * 12) * Math.PI) / 180;
      const d = V(s * Math.sin(th), 0.02, -Math.cos(th));
      feather(hand, hd.clone().add(V(0, i * 0.0035, -0.008)), d, priLens[i], 0.044, priCols[i], INKC);
      feather(hand, hd.clone().add(V(0, 0.011 + i * 0.0035, -0.006)), d, 0.075, 0.04, INKW, priCols[(i + 2) % 6]);
    }
    // alula
    feather(arm.joints[2], wr.clone().add(V(0, 0.012, 0.012)), V(s * 0.9, 0.05, 0.4), 0.055, 0.025, ORANGE, INKC);
    // wrist cuff
    const wp = arm.at(0.78);
    b.part(new THREE.TorusGeometry(0.02, 0.0055, 5, 10), PINK, {
      bone: arm.jointAt(0.78),
      at: wp.at,
      dir: wp.tangent,
      axis: "z",
      flat: true,
    });
  }

  // legs & feet -------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hipP = V(s * 0.05, 0.2, 0.0);
    const ankP = V(s * 0.05, 0.022, 0.03);
    const pts = limb(hipP, ankP, [0.1, 0.11], [[0, 0, -1]]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: body.joints[0],
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.05, 0, 0.07],
    });
    b.sweep(leg, [0.017, 0.012], { color: legPaint });
    const ankle = leg.joints[leg.joints.length - 1];
    const A = V(pts[2].x, pts[2].y, pts[2].z);
    b.part(new THREE.SphereGeometry(0.017, 7, 5), legPaint, { bone: ankle, at: A });
    const ap = leg.at(0.55);
    b.part(new THREE.TorusGeometry(0.02, 0.0055, 5, 10), TEAL, {
      bone: leg.jointAt(0.55),
      at: ap.at,
      dir: ap.tangent,
      axis: "z",
      flat: true,
    });
    // zygodactyl toes: two forward, two back
    const toes: { a: number; fwd: boolean }[] = [
      { a: -22, fwd: true },
      { a: 22, fwd: true },
      { a: -26, fwd: false },
      { a: 26, fwd: false },
    ];
    toes.forEach((t, i) => {
      const a = (t.a * Math.PI) / 180;
      const dir = V(Math.sin(a), 0, t.fwd ? Math.cos(a) : -Math.cos(a)).normalize();
      const len = t.fwd ? 0.07 : 0.052;
      const tip = A.clone().addScaledVector(dir, len);
      tip.y = 0.009;
      const tj = b.joint(`toe${L}${i + 1}`, { parent: ankle, at: A, aim: tip, role: "digit" });
      b.capsule(A, tip, [0.012, 0.009], { color: legPaint, bone: tj, sides: 6 });
      b.spike(tip, [dir.x, -0.1, dir.z], 0.024, 0.007, { color: INKC, bone: tj, sides: 5 });
    });
    // thigh fluff
    const thigh = b.part(new THREE.SphereGeometry(0.055, 10, 7), thighPaint, {
      bone: body.joints[0],
      at: V(s * 0.062, 0.2, 0.0),
      scale: [0.8, 1.15, 1],
    });
    const hits = b.surface(thigh).scatter(12, { rng: rng(30 + L.charCodeAt(0)), minDist: 0.025, filter: (h) => h.n.y > -0.4 });
    b.cards(hits, [FLUFF_PINK, FLUFF_TEAL], {
      size: [0.03, 0.05],
      lean: 60,
      bend: 20,
      flow: [0, -0.5, -1],
      rng: rng(40),
      vary: 0.2,
    });
  }

  return b.root;
}
