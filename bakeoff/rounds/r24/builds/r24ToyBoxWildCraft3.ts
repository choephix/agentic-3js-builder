// STYLE: "Memphis Group toy chest". 1980s Milan postmodern design: flat saturated pastels, confetti
// terrazzo, squiggles, zigzags and triangles, thick black outlines, and clashing stripes. The chest,
// the lid art, the toys and the confetti on the floor all use the same candy-bright confetti language.
import * as THREE from "three";
import { createBuilder, frame, rng, paint, cells, svg, catmull } from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil, gearGeometry } from "../../../../kits/clockwork";

export const meta = {
  name: "Memphis Toy Chest",
  description:
    "An open wooden toy chest in 1980s Memphis-design style (terrazzo confetti, zigzags, squiggles) with its lid thrown back, spilling alphabet blocks, a beach ball, a spinning top, rubber ducks, a tin robot, a jack-in-the-box clown, a teddy bear, a rainbow slinky, a toy train, ring stacker, marbles and confetti.",
};

// ---------------------------------------------------------------- palette
const CREAM = "#fff1d6";
const PINK = "#ff5fa2";
const HOT = "#ff86b8";
const TEAL = "#14c9b4";
const YELLOW = "#ffd23f";
const BLUE = "#2d3fe0";
const PURPLE = "#7a3cff";
const RED = "#ff4a3d";
const INK = "#16121f";
const ORANGE = "#ff8a2b";
const MINT = "#9df0d2";
const NAVY = "#2a2370";
const WHITE = "#ffffff";
const SKIN = "#ffc2a8";
const DEG = Math.PI / 180;

type Col = string | Paint;
type V3t = [number, number, number];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const eul = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * DEG, y * DEG, z * DEG));

// ---------------------------------------------------------------- textures (the character lives here)
const star = (cx: number, cy: number, R: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * DEG;
    const rad = i % 2 ? r : R;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return pts.join(" ");
};

const blockSvg = (bg: string, content: string) =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="60" rx="7" fill="${bg}" stroke="${INK}" stroke-width="4"/>
      <circle cx="10" cy="10" r="2.5" fill="${INK}"/><circle cx="54" cy="10" r="2.5" fill="${INK}"/>
      <circle cx="10" cy="54" r="2.5" fill="${INK}"/><circle cx="54" cy="54" r="2.5" fill="${INK}"/>
      ${content}
    </svg>`,
    { size: 128 },
  );
const letter = (ch: string, fg: string) =>
  `<text x="32" y="46" text-anchor="middle" font-family="Arial Black, Impact, Arial, sans-serif" font-weight="900" font-size="42" fill="${fg}" stroke="${INK}" stroke-width="3" paint-order="stroke">${ch}</text>`;

const BLK_A = blockSvg(PINK, letter("A", YELLOW));
const BLK_B = blockSvg(TEAL, letter("B", PINK));
const BLK_1 = blockSvg(YELLOW, letter("1", BLUE));
const BLK_STAR = blockSvg(
  PURPLE,
  `<polygon points="${star(32, 34, 21, 9)}" fill="${YELLOW}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
);

const zigPts = Array.from({ length: 19 }, (_, i) => `${i * 10},${i % 2 ? 8 : 2}`).join(" ");
const ZIG = svg(
  `<svg viewBox="0 0 180 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="180" height="10" fill="${YELLOW}"/>
    <polyline points="${zigPts}" fill="none" stroke="${TEAL}" stroke-width="3.2" transform="translate(0,-1)"/>
    <polyline points="${zigPts}" fill="none" stroke="${INK}" stroke-width="1.5"/>
  </svg>`,
  { size: 900 },
);

const FRONT = svg(
  `<svg viewBox="0 0 140 60" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round" stroke-linecap="round">
    <circle cx="30" cy="28" r="20" fill="${YELLOW}" stroke="${INK}" stroke-width="2.6"/>
    <path d="M14 28 a16 16 0 0 1 32 0z" fill="${PINK}" stroke="${INK}" stroke-width="2"/>
    <polygon points="58,52 82,6 106,52" fill="${PINK}" stroke="${INK}" stroke-width="2.6"/>
    <polygon points="74,40 82,24 90,40" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
    <path d="M6 56 q6 -10 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="${BLUE}" stroke-width="3.2"/>
    <rect x="108" y="8" width="26" height="26" rx="2" fill="${TEAL}" stroke="${INK}" stroke-width="2.6" transform="rotate(15 121 21)"/>
    <circle cx="121" cy="21" r="5" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
    <path d="M114 46 h16 M122 38 v16" stroke="${INK}" stroke-width="3.4"/>
    <circle cx="48" cy="8" r="2.6" fill="${INK}"/><circle cx="100" cy="10" r="2.6" fill="${INK}"/>
    <circle cx="52" cy="50" r="2.6" fill="${PURPLE}" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="136" cy="52" r="2.6" fill="${INK}"/>
  </svg>`,
  { size: 700 },
);

const LID = svg(
  `<svg viewBox="0 0 150 94" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round" stroke-linecap="round">
    <rect x="1.5" y="1.5" width="147" height="91" rx="6" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <rect x="8" y="8" width="134" height="78" rx="3" fill="none" stroke="${PINK}" stroke-width="2" stroke-dasharray="6 4"/>
    <polygon points="12,82 30,44 48,82" fill="${TEAL}" stroke="${INK}" stroke-width="2.6"/>
    <circle cx="124" cy="24" r="14" fill="${YELLOW}" stroke="${INK}" stroke-width="2.6"/>
    <path d="M96 82 q7 -12 14 0 t14 0 t14 0" fill="none" stroke="${BLUE}" stroke-width="4"/>
    <rect x="114" y="44" width="20" height="20" fill="${PURPLE}" stroke="${INK}" stroke-width="2.6" transform="rotate(20 124 54)"/>
    <polygon points="${star(24, 22, 11, 5)}" fill="${ORANGE}" stroke="${INK}" stroke-width="2"/>
    <text x="79" y="60" text-anchor="middle" font-family="Arial Black, Impact, Arial, sans-serif" font-weight="900" font-size="36" fill="${PINK}" stroke="${INK}" stroke-width="3" paint-order="stroke">TOYS</text>
    <text x="77" y="58" text-anchor="middle" font-family="Arial Black, Impact, Arial, sans-serif" font-weight="900" font-size="36" fill="${YELLOW}" stroke="${INK}" stroke-width="3" paint-order="stroke">TOYS</text>
    <text x="77" y="74" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="8" letter-spacing="2" fill="${INK}">PLAY ALL DAY!</text>
    <circle cx="60" cy="20" r="2.5" fill="${INK}"/><circle cx="72" cy="14" r="2.5" fill="${INK}"/><circle cx="84" cy="20" r="2.5" fill="${INK}"/>
  </svg>`,
  { size: 720 },
);

const ROBOT = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="96" height="66" rx="9" fill="#1b1230" stroke="${INK}" stroke-width="3"/>
    <rect x="12" y="10" width="28" height="26" rx="4" fill="#43f0ff"/>
    <rect x="60" y="10" width="28" height="26" rx="4" fill="#43f0ff"/>
    <rect x="21" y="17" width="10" height="13" fill="#1b1230"/>
    <rect x="69" y="17" width="10" height="13" fill="#1b1230"/>
    <rect x="20" y="44" width="60" height="17" rx="3" fill="${YELLOW}"/>
    ${[28, 36, 44, 52, 60, 68, 76].map((x) => `<rect x="${x - 1}" y="44" width="2.4" height="17" fill="#1b1230"/>`).join("")}
    <circle cx="8" cy="48" r="3" fill="${PINK}"/><circle cx="92" cy="48" r="3" fill="${PINK}"/>
  </svg>`,
  { size: 400 },
);

const CLOWN = svg(
  `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round" stroke-linecap="round">
    <circle cx="16" cy="56" r="10" fill="${PINK}"/><circle cx="84" cy="56" r="10" fill="${PINK}"/>
    <ellipse cx="32" cy="32" rx="13" ry="11" fill="${WHITE}" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="68" cy="32" rx="13" ry="11" fill="${WHITE}" stroke="${INK}" stroke-width="3"/>
    <polygon points="32,23 38,32 32,41 26,32" fill="${BLUE}"/>
    <polygon points="68,23 74,32 68,41 62,32" fill="${BLUE}"/>
    <path d="M16 17 Q32 5 46 17 M54 17 Q68 5 84 17" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M20 60 Q50 90 80 60 Q50 72 20 60Z" fill="${RED}" stroke="${INK}" stroke-width="3"/>
    <circle cx="30" cy="45" r="1.8" fill="${INK}"/><circle cx="70" cy="45" r="1.8" fill="${INK}"/>
  </svg>`,
  { size: 400 },
);

const DIE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="60" height="60" rx="11" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
    ${[
      [18, 18],
      [46, 18],
      [32, 32],
      [18, 46],
      [46, 46],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${PINK}" stroke="${INK}" stroke-width="2"/>`)
      .join("")}
  </svg>`,
  { size: 128 },
);

// confetti pieces: pure greys so a tint colours them
const TRI = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,6 58,56 6,56" fill="#ffffff" stroke="#222222" stroke-width="6" stroke-linejoin="round"/></svg>`,
  { size: 96 },
);
const SQUIG = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 40 q7 -22 13 0 t13 0 t13 0" stroke="#222222" stroke-width="15"/>
    <path d="M6 40 q7 -22 13 0 t13 0 t13 0" stroke="#ffffff" stroke-width="8"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- paints
const bands = (a: string, c: string, size: number, axis: "x" | "y" | "z") =>
  paint((p) => (Math.floor(p[axis] / size + 1000) % 2 === 0 ? a : c));

const CHIPS = [PINK, TEAL, YELLOW, BLUE, PURPLE, INK];
const TERRAZZO = paint((p) => {
  const c = cells(p, 0.06, 5);
  if (c.id > 0.45) return CREAM;
  const k = Math.floor((c.id / 0.45) * 6) % 6;
  const rad = 0.16 + 0.14 * ((c.id * 53) % 1);
  return c.d1 < rad ? CHIPS[k] : CREAM;
});

const BALL_C = V(0.62, 0.075, 0.68);
const BA = V(0.3, 1, 0.2).normalize();
const BU = V(0, 0, 1).cross(BA).normalize();
const BV = BA.clone().cross(BU);
const BALL_COLS = [PINK, YELLOW, TEAL, WHITE, PURPLE, ORANGE];
const BALL = paint((p) => {
  const q = p.clone().sub(BALL_C);
  if (Math.abs(q.dot(BA)) > 0.064) return RED;
  const ang = Math.atan2(q.dot(BV), q.dot(BU));
  const k = Math.floor((ang / (2 * Math.PI) + 0.5) * 6);
  return BALL_COLS[Math.min(5, Math.max(0, k))];
});

const TOP_O = V(0.15, 0.036, 0.5);
const TOP_D = V(-0.95, 0.2, 0.2).normalize();
const TOP_PAINT = paint((p) => {
  const h = p.clone().sub(TOP_O).dot(TOP_D);
  return [PINK, CREAM, TEAL][Math.floor(h / 0.018 + 300) % 3];
});

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "memphis_toy_chest" });

  type Pose = { at: THREE.Vector3; q: THREE.Quaternion; s: number };
  const pose = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s = 1): Pose => ({
    at: V(x, y, z),
    q: eul(rx, ry, rz),
    s,
  });
  const ID = pose(0, 0, 0);
  const world = (P: Pose, loc: V3t) => V(...loc).multiplyScalar(P.s).applyQuaternion(P.q).add(P.at);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const put = (
    geo: THREE.BufferGeometry,
    color: Col,
    P: Pose,
    loc: V3t,
    rot: V3t = [0, 0, 0],
    size: V3t = [1, 1, 1],
    extra: Record<string, any> = {},
  ) =>
    b.part(geo, color, {
      at: world(P, loc),
      quat: P.q.clone().multiply(eul(...rot)),
      scale: [size[0] * P.s, size[1] * P.s, size[2] * P.s],
      flat: true,
      ...extra,
    });
  const sph = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
  const ball = (color: Col, P: Pose, loc: V3t, r: number | V3t, rot: V3t = [0, 0, 0]) =>
    put(sph(), color, P, loc, rot, typeof r === "number" ? [r, r, r] : r);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blk = (color: Col, P: Pose, loc: V3t, size: V3t, rot: V3t = [0, 0, 0], extra: Record<string, any> = {}) =>
    put(new THREE.BoxGeometry(1, 1, 1), color, P, loc, rot, size, extra);
  const cyl = (color: Col, P: Pose, loc: V3t, r: number, h: number, rot: V3t = [0, 0, 0], seg = 10) =>
    put(new THREE.CylinderGeometry(1, 1, 1, seg), color, P, loc, rot, [r, h, r]);
  const cone = (color: Col, P: Pose, loc: V3t, r: number, h: number, rot: V3t = [0, 0, 0], seg = 8) =>
    put(new THREE.ConeGeometry(1, 1, seg), color, P, loc, rot, [r, h, r]);

  const restY = (size: V3t, rot: V3t) => {
    const q = eul(...rot);
    let m = Infinity;
    for (const sx of [-1, 1])
      for (const sy of [-1, 1])
        for (const sz of [-1, 1])
          m = Math.min(m, V((sx * size[0]) / 2, (sy * size[1]) / 2, (sz * size[2]) / 2).applyQuaternion(q).y);
    return -m;
  };

  // ============================================================ THE CHEST
  const W = 0.66;
  const D = 0.4;
  const BH = 0.38;
  const T = 0.03;
  const WALL_LO = 0.04;
  const hgt = BH - WALL_LO;
  const midY = (WALL_LO + BH) / 2;

  // feet and plinth
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      blk(PINK, ID, [sx * (W / 2 - 0.02), 0.02, sz * (D / 2 - 0.02)], [0.06, 0.04, 0.06]);
  blk(TEAL, ID, [0, 0.065, 0], [W + 0.02, 0.05, D + 0.02]);
  // inner walls (deep indigo)
  blk(NAVY, ID, [0, midY, D / 2 - T / 2], [W - 2 * T, hgt, T]);
  blk(NAVY, ID, [0, midY, -D / 2 + T / 2], [W - 2 * T, hgt, T]);
  for (const s of [1, -1]) blk(NAVY, ID, [s * (W / 2 - T / 2), midY, 0], [T, hgt, D]);
  blk("#3a2fa0", ID, [0, 0.095, 0], [W - 2 * T, 0.01, D - 2 * T]);
  // terrazzo outer skin
  blk(TERRAZZO, ID, [0, 0.2, D / 2 + 0.006], [W - 0.1, 0.26, 0.012]);
  blk(TERRAZZO, ID, [0, 0.2, -D / 2 - 0.006], [W - 0.1, 0.26, 0.012]);
  for (const s of [1, -1]) blk(TERRAZZO, ID, [s * (W / 2 + 0.006), 0.2, 0], [0.012, 0.26, D - 0.1]);
  // corner posts, striped
  const POST = bands(YELLOW, INK, 0.035, "y");
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) blk(POST, ID, [sx * (W / 2 - 0.005), midY + 0.03, sz * (D / 2 - 0.005)], [0.05, hgt + 0.06, 0.05]);
  // rim
  const RIM_X = bands(PINK, CREAM, 0.04, "x");
  const RIM_Z = bands(PINK, CREAM, 0.04, "z");
  blk(RIM_X, ID, [0, BH + 0.005, D / 2 - 0.005], [W + 0.04, 0.035, 0.05]);
  blk(RIM_X, ID, [0, BH + 0.005, -D / 2 + 0.005], [W + 0.04, 0.035, 0.05]);
  for (const s of [1, -1]) blk(RIM_Z, ID, [s * (W / 2 - 0.005), BH + 0.005, 0], [0.05, 0.035, D]);

  // art planes on the chest
  const plane = (tex: THREE.Texture, at: THREE.Vector3, dir: V3t, w: number, h: number) =>
    b.part(new THREE.PlaneGeometry(w, h), WHITE, { at, dir, axis: "z", texture: tex });
  plane(FRONT, V(0, 0.21, D / 2 + 0.015), [0, 0, 1], W - 0.14, (W - 0.14) * (60 / 140));
  plane(ZIG, V(0, 0.343, D / 2 + 0.015), [0, 0, 1], W - 0.1, 0.034);
  for (const s of [1, -1]) {
    plane(FRONT, V(s * (W / 2 + 0.015), 0.2, 0), [s, 0, 0], D - 0.1, (D - 0.1) * (60 / 140) * 1.0);
    plane(ZIG, V(s * (W / 2 + 0.015), 0.343, 0), [s, 0, 0], D - 0.1, 0.034);
  }
  plane(ZIG, V(0, 0.343, -D / 2 - 0.015), [0, 0, -1], W - 0.1, 0.034);

  // ---- toys heaped inside the chest
  {
    const r = rng(11);
    const cols = [PINK, TEAL, YELLOW, PURPLE, ORANGE, BLUE, MINT, RED];
    for (let i = 0; i < 16; i++) {
      const x = (r() - 0.5) * (W - 0.14);
      const z = (r() - 0.5) * (D - 0.1);
      const y = 0.27 + r() * 0.1;
      const c = cols[i % cols.length];
      if (i % 3 === 0) {
        const sz = 0.07 + r() * 0.03;
        blk(c, ID, [x, y, z], [sz, sz, sz], [r() * 60, r() * 90, r() * 60]);
      } else ball(c, ID, [x, y, z], 0.04 + r() * 0.02);
    }
  }

  // ---- the lid, thrown back on its hinge
  const LIDA = -102;
  const HINGE = V(0, BH + 0.025, -D / 2);
  const qLid = eul(LIDA, 0, 0);
  const lidPos = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(qLid).add(HINGE);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lidPart = (geo: THREE.BufferGeometry, color: Col, loc: V3t, size: V3t, rot: V3t = [0, 0, 0], extra: Record<string, any> = {}) =>
    b.part(geo, color, { at: lidPos(...loc), quat: qLid.clone().multiply(eul(...rot)), scale: size, flat: true, ...extra });
  const LW = W + 0.05;
  const LD = D + 0.04;
  const unitBox = () => new THREE.BoxGeometry(1, 1, 1);
  lidPart(unitBox(), BLUE, [0, 0.0175, D / 2 + 0.01], [LW, 0.035, LD]);
  lidPart(unitBox(), TERRAZZO, [0, 0.04, D / 2 + 0.01], [LW - 0.04, 0.012, LD - 0.04]);
  lidPart(unitBox(), PINK, [0, 0.0175, D + 0.035], [LW, 0.04, 0.014]);
  lidPart(unitBox(), PINK, [0, 0.0175, -0.005], [LW, 0.04, 0.014]);
  for (const s of [1, -1]) lidPart(unitBox(), YELLOW, [s * (LW / 2 - 0.005), 0.0175, D / 2 + 0.01], [0.014, 0.042, LD]);
  lidPart(sph(), PINK, [0, 0.055, D * 0.78], [0.024, 0.024, 0.024]);
  lidPart(new THREE.PlaneGeometry(1, 1), WHITE, [0, -0.003, D / 2 + 0.01], [LW - 0.03, LD - 0.014, 1], [90, 0, 0], {
    texture: LID,
    flat: false,
  });
  // hinge barrels
  for (const x of [-0.22, 0, 0.22]) cyl(PURPLE, ID, [x, HINGE.y + 0.005, HINGE.z], 0.016, 0.1, [0, 0, 90], 8);
  // lid stays
  for (const s of [1, -1]) {
    const a = lidPos(s * 0.35, 0.0175, D * 0.8);
    const c = V(s * 0.347, BH - 0.05, 0.02);
    b.rod(a, c, 0.004, INK);
    b.part(sph(6, 4), YELLOW, { at: a, scale: [0.012, 0.012, 0.012], flat: true });
    b.part(sph(6, 4), YELLOW, { at: c, scale: [0.012, 0.012, 0.012], flat: true });
  }

  // ============================================================ ROBOT (tin, popping out)
  const R = pose(-0.2, 0.33, 0, 14, 12, -6);
  blk(BLUE, R, [0, 0.01, 0], [0.12, 0.06, 0.09]);
  blk(RED, R, [0, 0.11, 0], [0.15, 0.15, 0.11]);
  blk(YELLOW, R, [0, 0.115, 0.058], [0.105, 0.105, 0.006]);
  put(gearGeometry({ teeth: 10, module: 0.005, thickness: 0.008, bore: 0.004 }), PINK, R, [0, 0.12, 0.066], [90, 0, 0]);
  [-0.03, 0, 0.03].forEach((x, i) =>
    cyl([TEAL, ORANGE, PURPLE][i], R, [x, 0.07, 0.063], 0.0085, 0.01, [90, 0, 0], 8),
  );
  for (const s of [1, -1]) {
    cyl(PURPLE, R, [s * 0.09, 0.16, 0], 0.025, 0.04, [0, 0, 90], 8);
    blk(TEAL, R, [s * 0.125, 0.2, 0.02], [0.03, 0.1, 0.03], [0, 0, -25 * s]);
    blk(YELLOW, R, [s * 0.146, 0.254, 0.032], [0.022, 0.034, 0.01], [0, 0, -25 * s]);
    blk(YELLOW, R, [s * 0.146, 0.254, 0.008], [0.022, 0.034, 0.01], [0, 0, -25 * s]);
    cyl(BLUE, R, [s * 0.067, 0.255, 0.005], 0.02, 0.02, [0, 0, 90], 8);
  }
  cyl(INK, R, [0, 0.2, 0], 0.02, 0.03, [0, 0, 0], 8);
  blk(ORANGE, R, [0, 0.255, 0.005], [0.115, 0.09, 0.09]);
  blk(PINK, R, [0, 0.305, 0.005], [0.1, 0.012, 0.08]);
  glow(
    put(new THREE.PlaneGeometry(1, 1), WHITE, R, [0, 0.255, 0.0535], [0, 0, 0], [0.1, 0.07, 1], {
      texture: ROBOT,
      flat: false,
    }),
    1.2,
  );
  cyl(INK, R, [0, 0.33, 0.005], 0.004, 0.04, [0, 0, 0], 6);
  glow(ball(PINK, R, [0, 0.355, 0.005], 0.014), 1.1);
  // wind-up key
  cyl(INK, R, [0, 0.12, -0.06], 0.006, 0.03, [90, 0, 0], 6);
  blk(YELLOW, R, [0, 0.12, -0.082], [0.05, 0.012, 0.008]);
  ball(YELLOW, R, [0.025, 0.12, -0.082], 0.014);
  ball(YELLOW, R, [-0.025, 0.12, -0.082], 0.014);

  // ============================================================ JACK-IN-THE-BOX CLOWN on a spring
  const C = pose(0.2, 0.3, 0.0, 9, -18, 7);
  cyl(TEAL, C, [0, 0.0, 0], 0.045, 0.04, [0, 0, 0], 8);
  b.sweep(coil(world(C, [0, 0.02, 0]), world(C, [0, 0.27, 0]), 0.034, 7), 0.0055, { color: PURPLE, sides: 5 });
  const head = ball(SKIN, C, [0, 0.34, 0], 0.066);
  b.decal(head, CLOWN, {
    at: world(C, [0, 0.345, 0.062]),
    dir: world(C, [0, 0, 1]).sub(C.at).toArray() as V3t,
    size: [0.115, 0.104],
  });
  ball(RED, C, [0, 0.332, 0.068], 0.014);
  for (const s of [1, -1]) {
    ball(ORANGE, C, [s * 0.07, 0.35, -0.005], 0.034);
    ball(SKIN, C, [s * 0.066, 0.335, 0.0], 0.014);
  }
  ball(ORANGE, C, [0, 0.35, -0.05], 0.045);
  torusAt(C, 0.06, 0.02, 0.272, TEAL);
  torusAt(C, 0.045, 0.017, 0.25, PINK);
  cyl(PINK, C, [0, 0.4, 0], 0.062, 0.01, [0, 0, 0], 10);
  cone(bands(YELLOW, PINK, 0.03, "y"), C, [0, 0.455, -0.005], 0.05, 0.1, [-10, 0, 0]);
  ball(RED, C, [0, 0.51, -0.018], 0.02);

  function torusAt(P: Pose, R_: number, tube: number, y: number, col: Col) {
    return put(new THREE.TorusGeometry(R_, tube, 5, 10), col, P, [0, y, 0], [90, 0, 0]);
  }

  // ============================================================ SPILLED TOYS
  // ---- alphabet blocks
  const BS: V3t = [0.075, 0.075, 0.075];
  const bloc = (tex: THREE.Texture, x: number, z: number, rot: V3t, lift = 0) =>
    blk(WHITE, ID, [x, restY(BS, rot) + lift, z], BS, rot, { texture: tex });
  bloc(BLK_A, -0.24, 0.42, [0, 15, 0]);
  bloc(BLK_B, -0.235, 0.42, [0, -12, 0], 0.075);
  bloc(BLK_1, -0.13, 0.4, [0, 40, 26]);
  bloc(BLK_STAR, 0.07, 0.36, [0, 35, 0]);
  blk(WHITE, ID, [0.3, BH + 0.05, 0.19], BS, [25, 25, 15], { texture: BLK_B });
  blk(WHITE, ID, [0.17, 0.025 + 0.0, 0.45], [0.05, 0.05, 0.05], [0, 25, 0], { texture: DIE });

  // ---- beach ball
  put(sph(12, 8), BALL, ID, [BALL_C.x, BALL_C.y, BALL_C.z], [0, 0, 0], [0.075, 0.075, 0.075]);

  // ---- spinning top, on its side
  b.lathe(
    [
      [0, 0],
      [0.006, 0],
      [0.03, 0.035],
      [0.046, 0.065],
      [0.046, 0.08],
      [0.025, 0.095],
      [0.007, 0.105],
      [0.007, 0.14],
      [0.012, 0.145],
      [0.0, 0.148],
    ],
    { at: TOP_O, axis: TOP_D, segments: 10, color: TOP_PAINT },
  );

  // ---- rubber ducks
  const duck = (P: Pose, body: string, beak: string, hat = false) => {
    ball(body, P, [0, 0.05, 0], [0.05, 0.044, 0.064]);
    cone(body, P, [0, 0.07, -0.078], 0.022, 0.05, [-70, 0, 0], 6);
    ball(body, P, [0, 0.115, 0.04], 0.038);
    ball(beak, P, [0, 0.109, 0.082], [0.02, 0.007, 0.02]);
    ball(beak, P, [0, 0.1, 0.078], [0.016, 0.005, 0.015]);
    for (const s of [1, -1]) {
      ball(INK, P, [s * 0.02, 0.126, 0.068], 0.007);
      ball(WHITE, P, [s * 0.019, 0.1285, 0.0745], 0.0028);
      ball(HOT, P, [s * 0.03, 0.108, 0.062], 0.008);
      ball(body, P, [s * 0.048, 0.056, -0.005], [0.01, 0.03, 0.042], [0, 0, -s * 12]);
    }
    if (hat) {
      cone(TEAL, P, [0, 0.168, 0.04], 0.02, 0.045, [-8, 0, 0], 6);
      ball(YELLOW, P, [0, 0.192, 0.036], 0.009);
    }
  };
  duck(pose(-0.08, 0, 0.6, 0, 25, 0), YELLOW, ORANGE);
  duck(pose(-0.12, 0.4, 0.195, -8, -30, 6), HOT, YELLOW, true);

  // ---- teddy bear in pink
  {
    const P = pose(0.34, 0, 0.64, 0, -20, 0);
    ball(HOT, P, [0, 0.1, 0], [0.085, 0.1, 0.075]);
    ball(CREAM, P, [0, 0.095, 0.052], [0.055, 0.07, 0.035]);
    ball(HOT, P, [0, 0.255, 0.012], [0.082, 0.072, 0.07]);
    ball(CREAM, P, [0, 0.238, 0.068], [0.036, 0.028, 0.03]);
    ball(INK, P, [0, 0.25, 0.095], [0.012, 0.008, 0.008]);
    blk(INK, P, [0, 0.224, 0.094], [0.004, 0.014, 0.003]);
    blk(INK, P, [-0.008, 0.217, 0.092], [0.016, 0.004, 0.003], [0, 0, 15]);
    blk(INK, P, [0.008, 0.217, 0.092], [0.016, 0.004, 0.003], [0, 0, -15]);
    for (const s of [1, -1]) {
      ball(INK, P, [s * 0.032, 0.272, 0.07], 0.0105);
      ball(WHITE, P, [s * 0.029, 0.276, 0.078], 0.004);
      ball(HOT, P, [s * 0.06, 0.32, 0.0], 0.03);
      ball(PINK, P, [s * 0.06, 0.32, 0.014], [0.018, 0.018, 0.012]);
      ball(HOT, P, [s * 0.118, 0.1, 0.02], [0.03, 0.065, 0.03], [0, 0, s * 35]);
      ball(CREAM, P, [s * 0.14, 0.062, 0.02], 0.02);
      ball(HOT, P, [s * 0.062, 0.04, 0.07], [0.036, 0.04, 0.055]);
      ball(CREAM, P, [s * 0.062, 0.04, 0.123], [0.024, 0.026, 0.006]);
      cone(TEAL, P, [s * 0.026, 0.19, 0.068], 0.018, 0.034, [0, 0, -s * 90], 4);
    }
    ball(TEAL, P, [0, 0.19, 0.068], 0.011);
    blk(YELLOW, P, [0.05, 0.08, 0.057], [0.032, 0.032, 0.006], [0, 20, 10]);
    blk(INK, P, [0.05, 0.08, 0.061], [0.02, 0.003, 0.002], [0, 20, 10]);
    blk(INK, P, [0.05, 0.08, 0.061], [0.003, 0.02, 0.002], [0, 20, 10]);
  }

  // ---- toy train + wagon
  {
    const P = pose(-0.12, 0, 0.9, 0, 65, 0);
    blk(BLUE, P, [0, 0.045, 0], [0.085, 0.03, 0.24]);
    cyl(RED, P, [0, 0.1, 0.045], 0.04, 0.12, [90, 0, 0], 10);
    cyl(WHITE, P, [0, 0.1, 0.03], 0.0415, 0.012, [90, 0, 0], 10);
    cyl(WHITE, P, [0, 0.1, 0.07], 0.0415, 0.012, [90, 0, 0], 10);
    put(new THREE.CylinderGeometry(0.02, 0.012, 1, 8), INK, P, [0, 0.17, 0.085], [0, 0, 0], [1, 0.07, 1]);
    cyl(YELLOW, P, [0, 0.208, 0.085], 0.026, 0.01, [0, 0, 0], 8);
    ball(YELLOW, P, [0, 0.142, 0.0], 0.022);
    blk(YELLOW, P, [0, 0.105, -0.075], [0.085, 0.09, 0.07]);
    blk(PINK, P, [0, 0.157, -0.075], [0.1, 0.012, 0.09]);
    for (const s of [1, -1]) blk(INK, P, [s * 0.043, 0.11, -0.075], [0.004, 0.035, 0.03]);
    blk(PINK, P, [0, 0.036, 0.135], [0.07, 0.015, 0.04], [20, 0, 0]);
    glow(ball(YELLOW, P, [0, 0.1, 0.108], 0.012), 1.3);
    const wheels = (z: number, col: string) => {
      for (const s of [1, -1]) {
        cyl(col, P, [s * 0.05, 0.032, z], 0.032, 0.014, [0, 0, 90], 10);
        cyl(YELLOW, P, [s * 0.056, 0.032, z], 0.012, 0.01, [0, 0, 90], 6);
      }
    };
    wheels(0.07, TEAL);
    wheels(-0.07, TEAL);
    // wagon
    blk(BLUE, P, [0, 0.045, -0.26], [0.085, 0.03, 0.17]);
    blk(INK, P, [0, 0.045, -0.155], [0.012, 0.012, 0.045]);
    for (const s of [1, -1]) blk(PINK, P, [s * 0.0425, 0.085, -0.26], [0.008, 0.05, 0.17]);
    blk(TEAL, P, [0, 0.085, -0.345], [0.085, 0.05, 0.008]);
    blk(TEAL, P, [0, 0.085, -0.175], [0.085, 0.05, 0.008]);
    wheels(-0.2, MINT);
    wheels(-0.32, MINT);
    blk(YELLOW, P, [0.01, 0.085, -0.24], [0.04, 0.04, 0.04], [0, 20, 0]);
    ball(PURPLE, P, [-0.012, 0.09, -0.29], 0.025);
  }

  // ---- ring stacker
  {
    const P = pose(0.6, 0, 0.34);
    cyl(BLUE, P, [0, 0.01, 0], 0.068, 0.02, [0, 0, 0], 10);
    put(new THREE.CylinderGeometry(0.006, 0.012, 0.17, 8), YELLOW, P, [0, 0.105, 0]);
    [PINK, TEAL, ORANGE].forEach((c, i) =>
      put(new THREE.TorusGeometry([0.058, 0.05, 0.042][i], 0.016, 6, 10), c, P, [0, 0.036 + i * 0.03, 0], [90, 0, 0]),
    );
    ball(PINK, P, [0, 0.205, 0], 0.02);
    put(new THREE.TorusGeometry(0.036, 0.016, 6, 10), PURPLE, ID, [0.43, 0.016, 0.22], [90, 0, 0]);
    put(new THREE.TorusGeometry(0.03, 0.016, 6, 10), RED, ID, [0.76, 0.036, 0.5], [70, 30, 0]);
  }

  // ---- yo-yo with a wandering string
  {
    const P = pose(0.42, 0, 0.92);
    put(new THREE.CylinderGeometry(0.015, 0.04, 0.014, 12), PURPLE, P, [0, 0.007, 0]);
    put(new THREE.CylinderGeometry(0.04, 0.015, 0.014, 12), PINK, P, [0, 0.021, 0]);
    cyl(YELLOW, P, [0, 0.014, 0], 0.012, 0.016, [0, 0, 0], 6);
    b.sweep(
      catmull([
        [0.46, 0.006, 0.92],
        [0.52, 0.006, 0.95],
        [0.57, 0.006, 0.89],
        [0.64, 0.006, 0.92],
      ]),
      0.003,
      { color: INK, sides: 4 },
    );
  }

  // ---- marbles
  const MARBLES: [number, number][] = [
    [0.22, 0.98],
    [0.27, 1.02],
    [0.3, 0.94],
    [0.14, 0.86],
    [0.0, 0.7],
    [-0.4, 0.3],
    [-0.46, 0.25],
    [0.74, 0.3],
    [0.55, 0.12],
    [-0.62, 0.62],
    [0.05, 1.05],
    [-0.32, 1.08],
  ];
  MARBLES.forEach(([x, z], i) => {
    const c = [TEAL, PINK, YELLOW, PURPLE, ORANGE, BLUE][i % 6];
    b.part(new THREE.SphereGeometry(0.014, 7, 5), c, { at: V(x, 0.014, z), flat: true });
  });

  // ---- rainbow slinky arcing out of the chest
  {
    const path = catmull([
      [-0.3, 0.42, 0.1],
      [-0.36, 0.52, 0.25],
      [-0.44, 0.38, 0.42],
      [-0.5, 0.16, 0.56],
      [-0.52, 0.062, 0.68],
      [-0.52, 0.058, 0.76],
    ]);
    const RAINBOW = [RED, ORANGE, YELLOW, MINT, TEAL, BLUE, PURPLE, PINK];
    let si = 0;
    b.along(path, 28, (at) => {
      b.part(new THREE.TorusGeometry(0.052, 0.006, 5, 14), RAINBOW[si++ % 8], {
        at: at.at,
        dir: at.axis,
        axis: "z",
        flat: true,
      });
    });
  }

  // ---- confetti on the floor
  {
    const r = rng(23);
    const make = (n: number) =>
      Array.from({ length: n }, () => frame(V(-0.8 + r() * 1.6, 0.003, 0.28 + r() * 0.8), [0, 1, 0]));
    const opts = (seed: number, color: string) => ({
      size: 0.07,
      lean: 90,
      flow: [0, 0, 1] as V3t,
      mirror: true,
      spin: 180,
      rng: rng(seed),
      color,
    });
    b.cards(make(9), TRI, opts(1, PINK));
    b.cards(make(8), TRI, opts(2, TEAL));
    b.cards(make(8), SQUIG, opts(3, YELLOW));
    b.cards(make(7), SQUIG, opts(4, PURPLE));
  }

  return b.root;
}
