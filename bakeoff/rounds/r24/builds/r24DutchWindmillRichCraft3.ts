import * as THREE from "three";
import { createBuilder, frame, rng, paint, mix, noise, smoothstep, scales, grain, mottle, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A chunky, pastel Animal Crossing style Dutch tower windmill: octagonal cream brick tower on a stone plinth, wooden stage with stairs and lanterns, round shingled red cap with a leaf weathervane, and four cloth-and-lattice sails that carry a leaf emblem. Glowing arched and round windows, flower boxes, a hanging mill sign and flour sacks.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CREAM = "#fff4da";
const TRIM = "#fff8e8";
const ROOF_A = "#d9604f";
const ROOF_B = "#cc5245";
const ROOF_C = "#e67d66";
const ROOF_D = "#9f4140";
const WOOD1 = "#cc9d66";
const WOOD2 = "#b98852";
const WOOD_D = "#8a5c38";
const IRON = "#5b5468";
const GOLD = "#f6c64e";
const LEAF = "#74c276";
const LEAF_D = "#4fa064";
const TERRA = "#dc8d64";
const SACK = "#efdfb8";
const SACK_TIE = "#c9a26a";
const GLASS = "#ffe39a";
const DOOR_C = "#79bfa8";
const SOIL = "#7d5a40";

// ---------------------------------------------------------------------------------------------------------------
// Geometry constants of the tower: an octagonal frustum with a flat face toward +Z.
const COS = Math.cos(Math.PI / 8);
const RAD = Math.PI / 180;
const WALL_TOP = 7.0;
const WALL_BOT = 0.4;
const R_TOP = 1.78; // apothem (flat-face distance) at the top
const R_BOT = 2.7; // apothem at the bottom
const K = (R_BOT - R_TOP) / (WALL_TOP - WALL_BOT);
const apo = (y: number) => R_TOP + (WALL_TOP - y) * K;

type V3 = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const basisQ = (x: V3, y: V3, z: V3) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

/** An octagonal prism or frustum whose flat faces are centred on 0°, 45°, 90°... (apothems given). */
const oct = (apTop: number, apBot: number, h: number) =>
  new THREE.CylinderGeometry(apTop / COS, apBot / COS, h, 8, 1).rotateY(Math.PI / 8);
const cyl = (rt: number, rb: number, h: number, seg = 10) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);

const hash = (a: number, c: number) => {
  const s = Math.sin(a * 127.1 + c * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** The frame lying on the tower wall at angle `adeg` (0 = front, +90 = model's left) and height y. */
function wallFrame(adeg: number, y: number) {
  const a = adeg * RAD;
  const r = apo(y);
  const dir = V(Math.sin(a), 0, Math.cos(a));
  const at = V(dir.x * r, y, dir.z * r);
  const n = V(dir.x, K, dir.z).normalize();
  const t = V(n.z, 0, -n.x).normalize();
  const u = n.clone().cross(t).normalize();
  return { at, n, t, u, q: basisQ(t, u, n), qc: basisQ(t, n, u.clone().negate()), dir };
}
type WF = ReturnType<typeof wallFrame>;
const wp = (w: WF, x: number, y: number, out: number) =>
  w.at.clone().addScaledVector(w.t, x).addScaledVector(w.u, y).addScaledVector(w.n, out);

/** Arched outline, origin at bottom centre. */
const arch = (w: number, h: number, steps = 6): [number, number][] => {
  const r = w / 2;
  const cy = h - r;
  const pts: [number, number][] = [
    [-r, 0],
    [r, 0],
    [r, cy],
  ];
  for (let i = 1; i < steps; i++) {
    const t = (i / steps) * Math.PI;
    pts.push([r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  pts.push([-r, cy]);
  return pts;
};

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BRICK_A = "#f6e3bf";
const BRICK_B = "#efd0a2";
const brickPaint = paint((p, n) => {
  if (Math.abs(n.y) > 0.8) return CREAM;
  const q = Math.PI / 4;
  const phi = Math.round(Math.atan2(n.x, n.z) / q) * q;
  const u = p.x * Math.cos(phi) - p.z * Math.sin(phi);
  const rowF = p.y / 0.15;
  const row = Math.floor(rowF);
  const cu = u / 0.36 + (row % 2 === 0 ? 0 : 0.5);
  const col = Math.floor(cu);
  const fx = cu - col;
  const fy = rowF - row;
  let c = mix(BRICK_A, BRICK_B, hash(row, col + phi * 5));
  if (fy < 0.1 || fx < 0.045) c = mix(c, "#fffaea", 0.8);
  c = mix(c, "#b9cf9a", 0.55 * smoothstep(1.7, 0.5, p.y) * noise(p, 0.5, 3));
  c = mix(c, "#f1c9a6", 0.3 * smoothstep(5.5, 7, p.y));
  return c;
});

const ROOF_COLORS = [ROOF_A, ROOF_B, ROOF_C];
const roofPaint = paint((_p, n, s) => {
  const rh = 0.2;
  const rowF = s[0] / rh;
  const row = Math.floor(rowF);
  const ang = s[1] + (((row % 2) + 2) % 2) * 8;
  const fcol = Math.floor(ang / 16);
  const fc = ang / 16 - fcol;
  const fy = rowF - row;
  const scallop = 0.2 + 0.35 * Math.pow(Math.abs(fc * 2 - 1), 2);
  let c = mix(ROOF_COLORS[Math.floor(hash(row, fcol) * 3) % 3], ROOF_COLORS[0], 0.2);
  if (fy < scallop * 0.45) c = mix(c, ROOF_D, 0.7);
  return mix(c, "#f7b49c", 0.35 * smoothstep(0.2, 1, n.y));
});

const STONE = scales(["#d1cadf", "#c6bed6", "#d9d2c9"], "#9a92ad", { size: 0.42, width: 0.1, seed: 4 });
const DECK = grain(WOOD1, WOOD2, { size: 0.08, axis: "x", seed: 2 });
const SAILWOOD = mottle(WOOD1, WOOD2, { size: 0.3, seed: 9 });
const BUSH = mottle(LEAF, LEAF_D, { size: 0.28, seed: 5 });

// ---------------------------------------------------------------------------------------------------------------
// Textures
const leafSvg = (fill: string, stroke: string) =>
  `<path d="M50 6 C84 28 90 68 50 94 C10 68 16 28 50 6Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M50 99 V34 M50 70 L33 54 M50 56 L67 42" stroke="${stroke}" stroke-width="4" stroke-linecap="round" fill="none"/>`;

const petals = (count: number, rx: number, ry: number, off: number, fill: string, stroke: string) =>
  Array.from({ length: count }, (_, i) => {
    return `<ellipse cx="0" cy="${-off}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" transform="rotate(${(360 / count) * i})"/>`;
  }).join("");

function makeTextures() {
  const lines = [14, 28, 42, 56, 70, 84, 98].map((y) => `M4 ${y}H38`).join("");
  const CLOTH = svg(
    `<svg viewBox="0 0 42 112" xmlns="http://www.w3.org/2000/svg">
      <rect width="42" height="112" fill="#fbf1d6"/>
      <rect x="1.8" y="1.8" width="38.4" height="108.4" fill="none" stroke="#d9604f" stroke-width="3.2"/>
      <path d="${lines}M21 6V106" stroke="#e8d3a2" stroke-width="1.4" fill="none"/>
      <g transform="translate(9 20) scale(0.24)">${leafSvg("#7cc576", "#3d8a58")}</g>
      <g transform="translate(9 66) scale(0.24)">${leafSvg("#a9dc9a", "#4fa064")}</g>
    </svg>`,
    { size: 256 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="d"><path d="M2 100 V32 A28 28 0 0 1 58 32 V100Z"/></clipPath></defs>
      <path d="M2 100 V32 A28 28 0 0 1 58 32 V100Z" fill="${DOOR_C}"/>
      <g clip-path="url(#d)" stroke="#58a08b" stroke-width="1.6">
        <path d="M16 0V100M30 0V100M44 0V100"/>
      </g>
      <rect x="2" y="56" width="22" height="5" rx="2" fill="#7a4f33"/>
      <rect x="2" y="84" width="22" height="5" rx="2" fill="#7a4f33"/>
      <circle cx="30" cy="30" r="9.5" fill="#ffe9a8" stroke="#7a4f33" stroke-width="2.6"/>
      <path d="M30 20.5V39.5M20.5 30H39.5" stroke="#7a4f33" stroke-width="1.8"/>
      <g transform="translate(36 62) scale(0.2)">${leafSvg("#bfe8d6", "#3f7d6c")}</g>
      <circle cx="47" cy="66" r="3.4" fill="#f6c64e" stroke="#b58a2a" stroke-width="1.2"/>
      <path d="M2 100 V32 A28 28 0 0 1 58 32 V100Z" fill="none" stroke="#3f7d6c" stroke-width="2.6"/>
    </svg>`,
    { size: 256 },
  );
  const slats = [30, 40, 50, 60, 70, 80, 90].map((y) => `<path d="M5 ${y}H25" />`).join("");
  const SHUTTER = svg(
    `<svg viewBox="0 0 30 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="27" height="97" rx="4" fill="#8fd1a0" stroke="#4e9f72" stroke-width="2.4"/>
      <g stroke="#5fae80" stroke-width="2.2" stroke-linecap="round">${slats}</g>
      <g transform="translate(7 6) scale(0.16)">${leafSvg("#fff4da", "#4e9f72")}</g>
    </svg>`,
    { size: 192 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="76" height="46" rx="7" fill="#d9a96e" stroke="#8a5c38" stroke-width="3"/>
      <path d="M8 12H72M8 40H72" stroke="#c4925a" stroke-width="1.6"/>
      <g transform="translate(34 5) scale(0.12)">${leafSvg("#7cc576", "#3d8a58")}</g>
      <text x="40" y="35" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="19" fill="#7a4a2c">MILL</text>
    </svg>`,
    { size: 256 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#b8e0d0"/>
      <circle cx="50" cy="50" r="43" fill="none" stroke="#fff4da" stroke-width="5"/>
      <g transform="translate(19 19) scale(0.62)">${leafSvg("#7cc576", "#3d8a58")}</g>
    </svg>`,
    { size: 192 },
  );
  const WIN_ARCH = svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd978"/><stop offset="1" stop-color="#fff0b8"/></linearGradient></defs>
      <path d="M3 58 V22 A17 17 0 0 1 37 22 V58Z" fill="url(#g)" stroke="#6e4a2e" stroke-width="3"/>
      <path d="M5 28 Q5 40 16 48 L5 48Z" fill="#f4a6b8"/>
      <path d="M35 28 Q35 40 24 48 L35 48Z" fill="#f4a6b8"/>
      <path d="M20 5 V58 M3 34 H37" stroke="#6e4a2e" stroke-width="2.6"/>
    </svg>`,
    { size: 192 },
  );
  const WIN_ROUND = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="r" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#ffd270"/></radialGradient></defs>
      <circle cx="20" cy="20" r="18" fill="url(#r)" stroke="#6e4a2e" stroke-width="3"/>
      <path d="M20 3V37M3 20H37" stroke="#6e4a2e" stroke-width="2.6"/>
    </svg>`,
    { size: 128 },
  );
  const flower = (pet: string, penStroke: string, n: number, rx: number, ry: number) =>
    svg(
      `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 55 C20 42 21 34 20 24" stroke="#4fa064" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M20 46 C12 44 8 38 7 33 C14 33 19 38 20 44Z" fill="#74c276" stroke="#3f8a58" stroke-width="1.2"/>
        <path d="M20 41 C28 39 32 34 33 29 C26 29 21 33 20 39Z" fill="#74c276" stroke="#3f8a58" stroke-width="1.2"/>
        <g transform="translate(20 17)">${petals(n, rx, ry, ry * 0.9, pet, penStroke)}</g>
        <circle cx="20" cy="17" r="4.2" fill="#ffd45a" stroke="#d99a2b" stroke-width="1.2"/>
      </svg>`,
      { size: 160 },
    );
  const FLOWER_A = flower("#ff9fc0", "#d9608a", 5, 5.5, 8);
  const FLOWER_B = flower("#ffffff", "#8fa9e0", 7, 3.6, 7);
  return { CLOTH, DOOR, SHUTTER, SIGN, PLAQUE, WIN_ARCH, WIN_ROUND, FLOWER_A, FLOWER_B };
}

// ---------------------------------------------------------------------------------------------------------------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dutch_windmill" });
  const R = rng(11);
  const T = makeTextures();

  // --- skeleton -------------------------------------------------------------------------------------------------
  const HUB = V(0, 8.0, 2.9);
  const wDoor = wallFrame(0, 1.55);
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const cap = b.joint("cap", { parent: base, at: [0, 7, 0], dir: [0, 1, 0] });
  const sails = b.joint("sails", { parent: cap, at: [HUB.x, HUB.y, HUB.z], dir: [0, 0, 1] });
  const vane = b.joint("vane", { parent: cap, at: [0, 9.4, 0], dir: [0, 1, 0] });
  const hingeAt = wp(wDoor, -0.6, 0, 0.07);
  const door = b.joint("door", { parent: base, at: [hingeAt.x, hingeAt.y, hingeAt.z], dir: [0, 1, 0], role: "hinge" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const P = (geo: THREE.BufferGeometry, color: any, bone: any, o: any = {}) => b.part(geo, color, { bone, ...o });

  // --- plinth, tower, stage ---------------------------------------------------------------------------------------
  P(oct(3.0, 3.05, 0.5), STONE, base, { at: [0, 0.25, 0], flat: true });
  P(oct(R_TOP, R_BOT, WALL_TOP - WALL_BOT), brickPaint, base, { at: [0, (WALL_TOP + WALL_BOT) / 2, 0], flat: true });
  for (const y of [2.9, 6.85]) {
    P(oct(apo(y + 0.08) + 0.07, apo(y - 0.08) + 0.07, 0.16), TRIM, base, { at: [0, y, 0], flat: true });
  }

  // Stage deck, braces and railing
  P(oct(3.3, 3.3, 0.3), DECK, base, { at: [0, 1.35, 0], flat: true });
  P(oct(3.36, 3.36, 0.08), WOOD_D, base, { at: [0, 1.22, 0], flat: true });
  for (let k = 1; k < 8; k++) {
    const a = k * 45 * RAD;
    const inner = V(Math.sin(a) * apo(0.75), 0.75, Math.cos(a) * apo(0.75));
    const outer = V(Math.sin(a) * 3.0, 1.2, Math.cos(a) * 3.0);
    b.rod(inner, outer, 0.07, WOOD_D, { bone: base });
  }
  const RV = 3.05 / COS;
  const rv = (k: number): [number, number] => {
    const a = (22.5 + 45 * k) * RAD;
    return [Math.sin(a) * RV, Math.cos(a) * RV];
  };
  const post = (x: number, z: number) => b.rod([x, 1.5, z], [x, 2.4, z], 0.06, WOOD_D, { bone: base });
  const rail = (x1: number, z1: number, x2: number, z2: number, balusters: number) => {
    b.rod([x1, 2.4, z1], [x2, 2.4, z2], 0.045, WOOD2, { bone: base });
    b.rod([x1, 1.95, z1], [x2, 1.95, z2], 0.03, WOOD2, { bone: base });
    for (let i = 1; i <= balusters; i++) {
      const t = i / (balusters + 1);
      const x = x1 + (x2 - x1) * t;
      const z = z1 + (z2 - z1) * t;
      b.rod([x, 1.5, z], [x, 2.38, z], 0.025, TRIM, { bone: base });
    }
  };
  for (let k = 0; k < 8; k++) {
    const [x1, z1] = rv(k);
    post(x1, z1);
    if (k < 7) {
      const [x2, z2] = rv(k + 1);
      rail(x1, z1, x2, z2, 3);
    }
  }
  const [fx0, fz0] = rv(0);
  const [fx7, fz7] = rv(7);
  rail(fx0, fz0, 0.85, 3.05, 1);
  rail(fx7, fz7, -0.85, 3.05, 1);
  post(0.85, 3.05);
  post(-0.85, 3.05);

  // Stairs up to the stage
  for (let i = 0; i < 5; i++) {
    const h = 0.3 * (i + 1);
    P(new THREE.BoxGeometry(1.5, h, 0.45), DECK, base, { at: [0, h / 2, 3.25 + 0.45 * (4 - i) + 0.225] });
  }
  const lantern = (x: number, z: number, y0: number) => {
    P(cyl(0.11, 0.14, 0.08, 8), IRON, base, { at: [x, y0 + 0.04, z], flat: true });
    glow(P(cyl(0.11, 0.11, 0.3, 8), GLASS, base, { at: [x, y0 + 0.23, z], flat: true }), 1.3);
    P(new THREE.ConeGeometry(0.2, 0.17, 8), ROOF_A, base, { at: [x, y0 + 0.46, z], flat: true });
    P(new THREE.SphereGeometry(0.045, 6, 4), GOLD, base, { at: [x, y0 + 0.56, z] });
  };
  for (const s of [1, -1]) {
    b.rod([s * 0.85, 2.4, 3.05], [s * 0.85, 1.1, 5.35], 0.045, WOOD2, { bone: base });
    b.rod([s * 0.85, 0.3, 5.35], [s * 0.85, 1.1, 5.35], 0.055, WOOD_D, { bone: base });
    lantern(s * 0.85, 5.35, 1.1);
  }

  // --- door -------------------------------------------------------------------------------------------------------
  b.extrude(arch(1.5, 2.25), {
    at: wp(wDoor, 0, 0, 0.03),
    x: wDoor.t,
    y: wDoor.u,
    thickness: 0.14,
    bevel: 0.025,
    color: TRIM,
    bone: base,
  });
  b.extrude(arch(1.2, 2.0), {
    at: wp(wDoor, 0, 0, 0.07),
    x: wDoor.t,
    y: wDoor.u,
    thickness: 0.1,
    bevel: 0.015,
    color: DOOR_C,
    bone: door,
  });
  P(new THREE.PlaneGeometry(1.2, 2.0), "#ffffff", door, {
    texture: T.DOOR,
    at: wp(wDoor, 0, 1.0, 0.125),
    quat: wDoor.q,
  });
  P(new THREE.BoxGeometry(1.7, 0.08, 0.3), STONE, base, { at: wp(wDoor, 0, 0.02, 0.15), quat: wDoor.q });

  // --- plaque with the leaf emblem ---------------------------------------------------------------------------------
  const wPl = wallFrame(0, 4.45);
  P(cyl(0.58, 0.58, 0.12, 14), WOOD1, base, { at: wp(wPl, 0, 0, 0.03), quat: wPl.qc, flat: true });
  P(new THREE.PlaneGeometry(0.96, 0.96), "#ffffff", base, { texture: T.PLAQUE, at: wp(wPl, 0, 0, 0.095), quat: wPl.q });

  // --- windows ----------------------------------------------------------------------------------------------------
  const flowersSmall: ReturnType<typeof frame>[] = [];
  const flowersBig: ReturnType<typeof frame>[] = [];

  function archWindow(a: number, y: number, o: { shutters?: boolean; planter?: boolean; h?: number }) {
    const w = wallFrame(a, y);
    b.extrude(arch(0.92, 1.3), {
      at: wp(w, 0, 0, 0.01),
      x: w.t,
      y: w.u,
      thickness: 0.1,
      bevel: 0.02,
      color: TRIM,
      bone: base,
    });
    glow(
      P(new THREE.PlaneGeometry(0.72, 1.08), "#ffffff", base, {
        texture: T.WIN_ARCH,
        at: wp(w, 0, 0.14 + 0.54, 0.065),
        quat: w.q,
      }),
      0.9,
    );
    P(new THREE.BoxGeometry(1.1, 0.1, 0.22), TRIM, base, { at: wp(w, 0, -0.03, 0.07), quat: w.q });
    if (o.shutters) {
      for (const s of [1, -1])
        P(new THREE.BoxGeometry(0.34, 1.1, 0.06), "#ffffff", base, {
          texture: T.SHUTTER,
          at: wp(w, s * 0.66, 0.62, 0.03),
          quat: w.q,
        });
    }
    if (o.planter) {
      P(new THREE.BoxGeometry(0.98, 0.2, 0.28), WOOD_D, base, { at: wp(w, 0, -0.22, 0.14), quat: w.q });
      P(new THREE.IcosahedronGeometry(1, 1), BUSH, base, {
        at: wp(w, 0, -0.1, 0.14),
        quat: w.q,
        scale: [0.48, 0.1, 0.12],
        flat: true,
      });
      for (let i = 0; i < 6; i++) {
        const p = wp(w, -0.4 + i * 0.16 + (R() - 0.5) * 0.04, -0.1, 0.14 + (R() - 0.5) * 0.06);
        flowersSmall.push(frame(p, [0, 1, 0]));
      }
    }
  }

  function roundWindow(a: number, y: number, r = 0.3) {
    const w = wallFrame(a, y);
    P(cyl(r + 0.13, r + 0.13, 0.1, 12), TRIM, base, { at: wp(w, 0, 0, 0.01), quat: w.qc, flat: true });
    glow(
      P(new THREE.PlaneGeometry(r * 2, r * 2), "#ffffff", base, {
        texture: T.WIN_ROUND,
        at: wp(w, 0, 0, 0.065),
        quat: w.q,
      }),
      0.9,
    );
  }

  archWindow(0, 5.35, { planter: true });
  archWindow(45, 3.6, { shutters: true, planter: true });
  archWindow(90, 3.6, { shutters: true, planter: true });
  archWindow(-90, 3.6, { shutters: true, planter: true });
  archWindow(135, 3.6, { shutters: true });
  archWindow(-135, 3.6, { shutters: true });
  archWindow(180, 3.6, { shutters: true, planter: true });
  for (const a of [45, 90, -90, 135, -135, 180, -45]) roundWindow(a, 5.8, 0.28);

  // --- hanging mill sign on the front-right wall -------------------------------------------------------------------
  {
    const ws = wallFrame(-45, 3.5);
    const d = V(Math.sin(-45 * RAD), 0, Math.cos(-45 * RAD));
    const s0 = ws.at.clone().addScaledVector(d, -0.05);
    const e0 = ws.at.clone().addScaledVector(d, 1.0);
    b.rod(s0, e0, 0.04, IRON, { bone: base });
    b.rod(s0.clone().add(V(0, -0.6, 0)), e0.clone().addScaledVector(d, -0.12), 0.03, IRON, { bone: base });
    P(new THREE.SphereGeometry(0.06, 6, 4), GOLD, base, { at: e0 });
    for (const off of [0.12, 0.78]) {
      const top = e0.clone().addScaledVector(d, -off);
      b.rod(top, top.clone().add(V(0, -0.3, 0)), 0.012, IRON, { bone: base });
    }
    const up = V(0, 1, 0);
    const zAx = d.clone().cross(up).normalize();
    const bc = e0.clone().addScaledVector(d, -0.45).add(V(0, -0.55, 0));
    P(new THREE.BoxGeometry(0.8, 0.5, 0.07), "#ffffff", base, { texture: T.SIGN, at: bc, quat: basisQ(d, up, zAx) });
  }

  // --- flour sacks, flower pots and bushes -------------------------------------------------------------------------
  for (const [x, z, s] of [
    [-1.5, 2.72, 1],
    [-1.88, 2.38, 0.85],
  ] as [number, number, number][]) {
    P(new THREE.IcosahedronGeometry(1, 1), SACK, base, { at: [x, 1.5 + 0.3 * s, z], scale: [0.3 * s, 0.32 * s, 0.27 * s], flat: true });
    P(new THREE.ConeGeometry(0.1 * s, 0.16 * s, 7), SACK_TIE, base, { at: [x, 1.5 + 0.66 * s, z], flat: true });
    P(new THREE.PlaneGeometry(0.2 * s, 0.2 * s), "#ffffff", base, {
      texture: T.PLAQUE,
      at: [x, 1.5 + 0.3 * s, z + 0.27 * s],
      dir: [0, 0, 1],
      axis: "z",
    });
  }
  for (const s of [1, -1]) {
    const px = s * 1.35;
    const pz = 3.95;
    P(cyl(0.3, 0.22, 0.4, 10), TERRA, base, { at: [px, 0.2, pz], flat: true });
    P(cyl(0.34, 0.34, 0.07, 10), TERRA, base, { at: [px, 0.43, pz], flat: true });
    P(new THREE.IcosahedronGeometry(1, 1), BUSH, base, { at: [px, 0.6, pz], scale: [0.34, 0.28, 0.34], flat: true });
    for (let i = 0; i < 6; i++) {
      const th = R() * Math.PI * 2;
      const rho = R() * 0.22;
      flowersSmall.push(frame(V(px + Math.cos(th) * rho, 0.8, pz + Math.sin(th) * rho), [0, 1, 0]));
    }
    // big round bush beside the plinth
    const bx = s * 2.35;
    const bz = 3.55;
    P(new THREE.IcosahedronGeometry(1, 1), BUSH, base, { at: [bx, 0.42, bz], scale: [0.62, 0.5, 0.62], flat: true });
    for (let i = 0; i < 8; i++) {
      const th = R() * Math.PI * 2;
      const rho = R() * 0.42;
      const hgt = 0.42 + 0.5 * Math.sqrt(Math.max(0, 1 - (rho / 0.62) ** 2)) - 0.04;
      flowersBig.push(frame(V(bx + Math.cos(th) * rho, hgt, bz + Math.sin(th) * rho), [0, 1, 0]));
    }
  }
  b.cards(flowersSmall, [T.FLOWER_A, T.FLOWER_B], {
    size: [0.16, 0.24],
    lean: 8,
    cross: true,
    vary: 0.25,
    spin: 180,
    rng: R,
    bone: base,
  });
  b.cards(flowersBig, [T.FLOWER_A, T.FLOWER_B], {
    size: [0.22, 0.33],
    lean: 10,
    cross: true,
    vary: 0.25,
    spin: 180,
    rng: R,
    bone: base,
  });

  // --- cap --------------------------------------------------------------------------------------------------------
  P(cyl(2.15, 2.15, 0.3, 16), TRIM, cap, { at: [0, 7.08, 0], flat: true });
  for (let i = 0; i < 20; i++) {
    const th = (i / 20) * 360;
    const a = th * RAD;
    P(new THREE.BoxGeometry(0.16, 0.16, 0.22), WOOD1, cap, {
      at: [Math.sin(a) * 2.02, 6.86, Math.cos(a) * 2.02],
      rotation: [0, th, 0],
    });
  }
  b.lathe(
    [
      [0, 0.2, "sharp"],
      [2.08, 0.2, "sharp"],
      [2.02, 0.55],
      [1.82, 1.0],
      [1.42, 1.55],
      [0.92, 2.0],
      [0.42, 2.3],
      [0, 2.42, "sharp"],
    ],
    { at: [0, 7.0, 0], bone: cap, color: roofPaint, segments: 12, smoothing: 1 },
  );
  // roof edge scallop bumps
  for (let i = 0; i < 16; i++) {
    const a = ((i + 0.5) / 16) * Math.PI * 2;
    P(new THREE.SphereGeometry(0.1, 6, 4), TRIM, cap, { at: [Math.sin(a) * 2.15, 7.0, Math.cos(a) * 2.15] });
  }
  // shaft collar where the windshaft leaves the cap
  P(cyl(0.55, 0.5, 0.3, 12), IRON, cap, { at: [0, 8.0, 1.75], dir: [0, 0, 1], flat: true });

  // --- weathervane ------------------------------------------------------------------------------------------------
  P(new THREE.SphereGeometry(0.17, 8, 6), GOLD, vane, { at: [0, 9.42, 0] });
  b.rod([0, 9.4, 0], [0, 10.35, 0], 0.03, IRON, { bone: vane });
  for (const [dx, dz] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    b.rod([0, 9.8, 0], [dx * 0.42, 9.8, dz * 0.42], 0.022, IRON, { bone: vane });
    P(new THREE.SphereGeometry(0.05, 6, 4), GOLD, vane, { at: [dx * 0.44, 9.8, dz * 0.44] });
  }
  b.extrude(
    [
      [-0.62, 0, "sharp"],
      [-0.25, 0.23],
      [0.25, 0.25],
      [0.78, 0, "sharp"],
      [0.25, -0.25],
      [-0.25, -0.23],
    ],
    { at: [0, 10.15, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, smoothing: 1, color: GOLD, bone: vane },
  );
  P(new THREE.SphereGeometry(0.08, 6, 4), GOLD, vane, { at: [0, 10.15, -0.68] });

  // --- windshaft, hub and sails -----------------------------------------------------------------------------------
  P(cyl(0.28, 0.28, 1.7, 10), WOOD_D, sails, { at: [0, 8.0, 2.15], dir: [0, 0, 1], flat: true });
  P(cyl(0.62, 0.62, 0.4, 12), SAILWOOD, sails, { at: [HUB.x, HUB.y, HUB.z], dir: [0, 0, 1], flat: true });
  P(cyl(0.52, 0.52, 0.1, 12), IRON, sails, { at: [0, 8.0, 3.12], dir: [0, 0, 1], flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.SphereGeometry(0.05, 6, 4), GOLD, sails, { at: [Math.cos(a) * 0.44, 8.0 + Math.sin(a) * 0.44, 3.17] });
  }
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.4, 0],
      [0.46, 0.08],
      [0.4, 0.45],
      [0.18, 0.8],
      [0, 0.95, "sharp"],
    ],
    { at: [0, 8.0, 3.2], axis: [0, 0, 1], bone: sails, color: ROOF_A, segments: 10, smoothing: 1 },
  );

  const A0 = 0.36;
  const bp = (a: number, u: number, v: number, w: number): [number, number, number] => [
    HUB.x + Math.cos(a) * u - Math.sin(a) * v,
    HUB.y + Math.sin(a) * u + Math.cos(a) * v,
    HUB.z + w,
  ];
  for (let k = 0; k < 4; k++) {
    const a = A0 + (k * Math.PI) / 2;
    const rot = a / RAD;
    const box = (w: number, h: number, d: number, color: any, u: number, v: number, wz: number, o: any = {}) =>
      P(new THREE.BoxGeometry(w, h, d), color, sails, { at: bp(a, u, v, wz), rotation: [0, 0, rot], ...o });
    box(0.2, 4.5, 0.2, SAILWOOD, 0, 2.7, 0); // stock
    box(0.12, 3.6, 0.12, SAILWOOD, 1.25, 2.9, 0.0); // outer rail
    for (let i = 0; i < 8; i++) box(1.3, 0.09, 0.09, WOOD2, 0.68, 1.1 + (3.6 * i) / 7, 0.03); // slats
    box(0.95, 2.55, 0.03, "#ffffff", 0.695, 3.375, -0.015, { texture: T.CLOTH }); // cloth
    box(0.28, 0.3, 0.28, ROOF_A, 0, 5.07, 0); // red tip cap
    box(0.3, 0.12, 0.26, GOLD, 0, 0.55, 0.0); // brass collar by the hub
  }

  return b.root;
}
