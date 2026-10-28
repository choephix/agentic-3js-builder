```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Boreal Station 7",
  description:
    "Firewatch-style arctic research outpost diorama: a rust-orange stilted cabin with glowing windows and porch, a teal instrument shed with dish, striped radio mast with guy wires, radome, weather station, fuel drums, snowmobile and sled, bunting and flag, set on a chunk of sunset-lit ice under layered violet peaks, with long cast shadows.",
};

type V = [number, number, number];
type P2 = [number, number];
const D2R = Math.PI / 180;
const GY = 0.6; // snow surface height on the plinth

// ---- palette (flat, sunset-warm lights, violet shadows) ----
const SNOW_LIT = "#f9e9dc";
const SNOW_MID = "#f0d5cd";
const SNOW_SH = "#b1a4d2";
const ICE = "#8fc4d2";
const ICE_MID = "#6aa2c0";
const ICE_DEEP = "#3e5f94";
const SHADOW = "#9a8cc4";
const PATH = "#e8c8c6";
const WALL_LIT = "#dd5a2e";
const WALL_SH = "#a53a3a";
const TEAL_LIT = "#3f9097";
const TEAL_SH = "#2c5f78";
const TRIM = "#f7e5c2";
const TRIM_SH = "#d9bfa0";
const ROOF_LIT = "#4a3a66";
const ROOF_SH = "#2b2248";
const DARK = "#2b2142";
const WOOD = "#9a6a44";
const WOOD_D = "#5e3d34";
const ORANGE = "#e5602f";
const SHUTTER = "#2f6f7a";
const DOOR = "#2d5876";
const GOLD = "#e8b24a";
const METAL = "#4a4160";
const ICICLE = "#c4e8f2";

const SUN = new THREE.Vector3(-0.8, 0.7, 0.1).normalize();
const cel2 = (lit: string, shade: string, thr = -0.05) => paint((_p, n) => (n.dot(SUN) > thr ? lit : shade));

const siding = (lit: string, shade: string, lineLit: string, lineShade: string) =>
  paint((p, n) => {
    const isLit = n.dot(SUN) > -0.05;
    const f = ((((p.y - GY) / 0.3) % 1) + 1) % 1;
    const c = f < 0.1 ? (isLit ? lineLit : lineShade) : isLit ? lit : shade;
    return mix(c, "#5a2a55", 0.3 * smoothstep(1.6, 0.7, p.y - GY));
  });

// ---- shadow hull helper ----
function hull(pts: P2[]): P2[] {
  const p = [...pts].sort((a, c) => a[0] - c[0] || a[1] - c[1]);
  const cross = (o: P2, a: P2, c: P2) => (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]);
  const lower: P2[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 1e-9) lower.pop();
    lower.push(q);
  }
  const upper: P2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 1e-9) upper.pop();
    upper.push(q);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}
const rect = (x0: number, x1: number, z0: number, z1: number): P2[] => [
  [x0, z0],
  [x1, z0],
  [x1, z1],
  [x0, z1],
];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "boreal-station-7", paintSize: 2048 });
  const rand = rng(11);

  // ---------- placement helpers (heights are metres above the snow) ----------
  const up = (p: V): V => [p[0], p[1] + GY, p[2]];
  const put = (geo: THREE.BufferGeometry, color: any, p: V, o: any = {}) =>
    b.part(geo, color, { at: up(p), flat: true, ...o });
  const box = (w: number, h: number, d: number, color: any, p: V, o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, p, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, p: V, o: any = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, p, o);
  const cone = (r: number, h: number, seg: number, color: any, p: V, o: any = {}) =>
    put(new THREE.ConeGeometry(r, h, seg), color, p, o);
  const ball = (r: number, color: any, p: V, o: any = {}, ws = 8, hs = 5) =>
    put(new THREE.SphereGeometry(r, ws, hs), color, p, o);
  const plane = (w: number, h: number, tex: THREE.Texture, p: V, rot: V = [0, 0, 0], tint = "#ffffff") =>
    put(new THREE.PlaneGeometry(w, h), tint, p, { texture: tex, rotation: rot });
  const rod = (a: V, c: V, r: number, color: string, sides = 5) => b.rod(up(a), up(c), r, color, { sides });

  const makeLocal = (ox: number, oz: number, yaw: number) => {
    const c = Math.cos(yaw * D2R);
    const s = Math.sin(yaw * D2R);
    const yq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D2R);
    const P = (l: V): V => [ox + l[0] * c + l[2] * s, l[1], oz - l[0] * s + l[2] * c];
    const put2 = (geo: THREE.BufferGeometry, color: any, l: V, rot: V = [0, 0, 0], o: any = {}) => {
      const q = yq
        .clone()
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D2R, rot[1] * D2R, rot[2] * D2R, "XYZ")));
      return b.part(geo, color, { at: up(P(l)), quat: q, flat: true, ...o });
    };
    return {
      P,
      box: (w: number, h: number, d: number, color: any, l: V, rot: V = [0, 0, 0], o: any = {}) =>
        put2(new THREE.BoxGeometry(w, h, d), color, l, rot, o),
      cyl: (rt: number, rb: number, h: number, seg: number, color: any, l: V, rot: V = [0, 0, 0], o: any = {}) =>
        put2(new THREE.CylinderGeometry(rt, rb, h, seg), color, l, rot, o),
      ball: (r: number, color: any, l: V, o: any = {}) => put2(new THREE.SphereGeometry(r, 8, 5), color, l, [0, 0, 0], o),
    };
  };

  // ---------- long cast shadows ----------
  const SHX = 1.1;
  const SHZ = -0.14;
  const castShadow = (layers: [P2[], number][]) => {
    const pts: P2[] = [];
    for (const [ps, h] of layers) for (const q of ps) pts.push([q[0] + h * SHX, q[1] + h * SHZ]);
    const poly = hull(pts);
    if (poly.length < 3) return;
    b.extrude(poly, { at: [0, GY + 0.045, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, color: SHADOW });
  };
  const strip = (pts: P2[], w: number, color: string) => {
    const L: P2[] = [];
    const R: P2[] = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)];
      const c = pts[Math.min(pts.length - 1, i + 1)];
      let dx = c[0] - a[0];
      let dz = c[1] - a[1];
      const l = Math.hypot(dx, dz) || 1;
      dx /= l;
      dz /= l;
      const hw = w / 2;
      L.push([p[0] - dz * hw, p[1] + dx * hw]);
      R.push([p[0] + dz * hw, p[1] - dx * hw]);
    });
    b.extrude([...L, ...R.reverse()], { at: [0, GY + 0.02, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.02, color });
  };

  // ---------- textures ----------
  const WINDOW = svg(
    `<svg viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdc8e"/><stop offset="1" stop-color="#ff9a3c"/></linearGradient></defs>
      <rect width="60" height="50" fill="url(#g)"/>
      <polygon points="0,0 15,0 0,32" fill="#d9502e"/><polygon points="60,0 45,0 60,32" fill="#d9502e"/>
      <rect x="38" y="31" width="14" height="19" fill="#8a4a2a"/>
      <path d="M8 50 L8 38 Q8 33 14 33 Q20 33 20 38 L20 50Z" fill="#7a3a24"/>
      <rect x="28" y="0" width="4" height="50" fill="#5b3040"/><rect x="0" y="23" width="60" height="4" fill="#5b3040"/>
      <rect x="1.5" y="1.5" width="57" height="47" fill="none" stroke="#5b3040" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="157" height="33" rx="4" fill="#24415f" stroke="#f6e2bd" stroke-width="3"/>
      <polygon points="9,10 17,18 9,26" fill="#e8692e"/><polygon points="151,10 143,18 151,26" fill="#e8692e"/>
      <text x="80" y="23.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="14" fill="#f6e2bd" letter-spacing="1">BOREAL STATION 7</text>
    </svg>`,
    { size: 512 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><circle cx="50" cy="50" r="44"/></clipPath></defs>
      <circle cx="50" cy="50" r="47" fill="#2c4a6b" stroke="#f6e2bd" stroke-width="5"/>
      <g clip-path="url(#c)">
        <circle cx="50" cy="62" r="24" fill="#f0883a"/>
        <polygon points="0,78 28,42 42,58 58,30 100,78" fill="#3b2f5a"/>
        <polygon points="58,30 50,43 58,41 65,46" fill="#f6e2bd"/>
        <rect x="0" y="76" width="100" height="30" fill="#3b2f5a"/>
      </g>
      <path d="M50 12 V28 M42 16 L58 24 M58 16 L42 24" stroke="#f6e2bd" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const FLAG = svg(
    `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
      <rect width="90" height="60" fill="#2c6f7e"/><rect y="36" width="90" height="24" fill="#e8692e"/>
      <circle cx="70" cy="18" r="7" fill="#ffd27a"/>
      <polygon points="0,36 20,16 34,30 52,10 90,36" fill="#2b2547"/>
      <polygon points="52,10 45,19 52,17 58,21" fill="#f6e2bd"/>
      <rect x="0" y="34" width="90" height="4" fill="#f6e2bd"/>
    </svg>`,
    { size: 256 },
  );
  const DRUM = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="64" fill="#ffffff"/>
      <rect y="5" width="128" height="4" fill="#9a9a9a"/><rect y="30" width="128" height="3" fill="#b4b4b4"/><rect y="55" width="128" height="4" fill="#9a9a9a"/>
      <rect x="38" y="15" width="52" height="30" rx="3" fill="#f0f0f0"/>
      <text x="64" y="38" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="18" fill="#3a3a3a">FUEL</text>
    </svg>`,
    { size: 256 },
  );
  const SOLAR = svg(
    `<svg viewBox="0 0 80 52" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="52" fill="#c9c5d8"/><rect x="3" y="3" width="74" height="46" fill="#1f3f86"/>
      <path d="M3 18 H77 M3 33 H77 M21 3 V49 M40 3 V49 M59 3 V49" stroke="#7f9fe0" stroke-width="1.3" fill="none"/>
      <polygon points="3,3 40,3 3,34" fill="#ffffff" fill-opacity="0.13"/>
    </svg>`,
    { size: 256 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="40" fill="#0d1f1a"/>
      <path d="M4 12 H60 M4 22 H60 M4 32 H60 M16 4 V36 M32 4 V36 M48 4 V36" stroke="#1f5a44" stroke-width="1" fill="none"/>
      <path d="M4 30 L14 24 L22 27 L32 14 L42 19 L52 9 L60 12" stroke="#6dff9a" stroke-width="2.4" fill="none" stroke-linejoin="round"/>
      <text x="6" y="10" font-family="Arial, sans-serif" font-weight="bold" font-size="8" fill="#9bffc0">-27 C</text>
    </svg>`,
    { size: 192 },
  );
  const BEAR = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,3 97,50 50,97 3,50" fill="#f2b63a" stroke="#2a1f3a" stroke-width="5" stroke-linejoin="round"/>
      <g fill="#2a1f3a">
        <ellipse cx="46" cy="52" rx="20" ry="10"/><circle cx="68" cy="44" r="8"/><ellipse cx="77" cy="47" rx="6" ry="3.6"/>
        <circle cx="66" cy="37" r="3"/>
        <rect x="30" y="56" width="6" height="14" rx="2"/><rect x="38" y="58" width="6" height="12" rx="2"/>
        <rect x="52" y="58" width="6" height="12" rx="2"/><rect x="60" y="56" width="6" height="14" rx="2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const snowCel = cel2(SNOW_LIT, SNOW_SH);
  const woodCel = cel2(WOOD, "#6b4a44");
  const roofCel = cel2(ROOF_LIT, ROOF_SH);
  const trimCel = cel2(TRIM, TRIM_SH);

  // =====================================================================
  // PLINTH
  // =====================================================================
  const plinthPaint = paint((p, n) => {
    if (n.y > 0.75) {
      const t = noise(p, 3.2, 4);
      const r = Math.hypot(p.x, p.z);
      const rim = smoothstep(11.0, 12.2, r);
      return mix(mix(SNOW_LIT, SNOW_MID, smoothstep(0.4, 0.75, t)), SNOW_SH, rim * 0.5);
    }
    const k = Math.floor(p.y * 5 + noise(p, 1.6, 8) * 2.2);
    return mix(k % 2 === 0 ? ICE : ICE_MID, ICE_DEEP, smoothstep(0.5, 0.0, p.y) * 0.8);
  });
  b.lathe(
    [
      [0, 0],
      [11.7, 0],
      [12.4, 0.32],
      [12.2, GY],
      [0, GY],
    ],
    { at: [0, 0, 0], segments: 18, color: plinthPaint },
  );

  // =====================================================================
  // LAYERED PEAKS (Firewatch ridgelines, far = pale, near = deep violet)
  // =====================================================================
  type Pal = { lit: string; shade: string; capLit: string; capShade: string; haze: string };
  const FAR: Pal = { lit: "#f2ab90", shade: "#c8809e", capLit: "#fff0e2", capShade: "#e6bccb", haze: "#f9c7b4" };
  const MID: Pal = { lit: "#b8708f", shade: "#7d5a93", capLit: "#f5cfc4", capShade: "#b793b5", haze: "#d79aa4" };
  const NEAR: Pal = { lit: "#6f5a9a", shade: "#43406f", capLit: "#dcb8c6", capShade: "#8d82b3", haze: "#8d6f9f" };
  const peak = (x: number, z: number, r: number, h: number, sides: number, pal: Pal, yaw = 0, snow = 0.5) => {
    const col = paint((p, n) => {
      const hh = (p.y - GY) / h;
      const a = Math.atan2(p.x - x, p.z - z);
      const w = ((((a * sides) / (2 * Math.PI)) % 1) + 1) % 1;
      const tri = Math.abs(w * 2 - 1);
      const cap = hh > snow + 0.12 * tri;
      const lit = n.dot(SUN) > -0.05;
      const c = cap ? (lit ? pal.capLit : pal.capShade) : lit ? pal.lit : pal.shade;
      return mix(c, pal.haze, 0.55 * smoothstep(0.3, 0.0, hh));
    });
    b.part(new THREE.ConeGeometry(r, h, sides, 1), col, {
      at: [x, GY + h / 2 - 0.15, z],
      rotation: [0, yaw, 0],
      flat: true,
    });
  };
  peak(-6.5, -7.5, 2.1, 7.0, 5, FAR, 10);
  peak(-2.4, -9.3, 2.2, 9.0, 5, FAR, 30);
  peak(3.2, -9.2, 2.2, 7.8, 6, FAR, 0);
  peak(7.6, -6.6, 1.9, 6.3, 5, FAR, 20);
  peak(-9.6, -3.5, 1.8, 5.5, 5, FAR, 5);
  peak(9.9, -1.8, 1.7, 4.6, 5, FAR, 40);
  peak(0.5, -10.4, 1.4, 6.0, 4, FAR, 15);
  peak(-4.6, -6.4, 2.0, 4.4, 5, MID, 25, 0.55);
  peak(0.9, -7.6, 2.5, 5.6, 6, MID, 12, 0.5);
  peak(5.4, -7.2, 1.8, 3.8, 5, MID, 33, 0.55);
  peak(-9.4, 0.8, 1.3, 2.8, 5, MID, 8, 0.6);
  peak(-3.6, -5.2, 1.4, 2.4, 5, NEAR, 18, 0.6);
  peak(2.4, -5.6, 1.5, 2.2, 5, NEAR, 4, 0.62);
  peak(8.6, -5.2, 1.2, 2.4, 5, NEAR, 22, 0.6);

  // =====================================================================
  // GROUND: paths, drifts
  // =====================================================================
  strip([[0.7, 2.9], [0.0, 3.6], [-1.4, 4.0], [-3.0, 3.9]], 0.75, PATH);
  strip([[1.0, 2.7], [2.2, 3.7], [3.8, 4.2], [5.6, 4.2], [7.2, 4.2]], 0.7, PATH);
  strip([[1.95, 1.9], [2.4, 0.8], [2.8, -0.6], [3.2, -1.8], [3.5, -2.6]], 0.6, PATH);

  const drifts: [number, number, number, number, number][] = [
    [-4.1, -3.2, 1.6, 0.35, 0.9],
    [-0.2, -3.4, 1.8, 0.3, 0.8],
    [2.4, 0.3, 0.9, 0.3, 0.8],
    [-4.5, 1.1, 0.9, 0.3, 0.7],
    [-6.4, -3.0, 1.6, 0.4, 0.8],
    [-7.6, -0.8, 0.9, 0.4, 1.4],
    [-6.0, 3.5, 1.3, 0.3, 0.8],
    [3.6, -3.0, 1.1, 0.3, 1.1],
    [8.4, 0.8, 2.0, 0.5, 1.5],
    [5.4, 5.6, 2.2, 0.45, 1.1],
    [-1.0, 7.0, 2.4, 0.5, 1.2],
    [-8.0, 5.0, 1.8, 0.45, 1.2],
    [9.2, -3.8, 1.6, 0.4, 1.0],
    [7.3, -2.4, 2.2, 0.35, 2.2],
  ];
  for (const [x, z, sx, sy, sz] of drifts) ball(1, snowCel, [x, 0, z], { scale: [sx, sy, sz] }, 8, 5);

  // =====================================================================
  // MAIN CABIN
  // =====================================================================
  const CX = -1.2;
  const CZ = -1.0;
  const CW = 6.0;
  const CD = 3.8;
  const FLOOR = 0.7;
  const WH = 2.7;
  const TOP = FLOOR + WH;
  const RH = 1.3;
  const FRONT = CZ + CD / 2;

  const wallPaint = siding(WALL_LIT, WALL_SH, "#c04a29", "#8a2f36");
  box(CW, WH, CD, wallPaint, [CX, FLOOR + WH / 2, CZ]);
  box(CW - 0.3, FLOOR, CD - 0.3, DARK, [CX, FLOOR / 2, CZ]);
  for (const px of [-2.6, -0.87, 0.87, 2.6])
    for (const sz of [-1, 1]) cyl(0.13, 0.13, 0.78, 6, WOOD_D, [CX + px, 0.37, CZ + sz * 1.82]);
  box(CW + 0.12, 0.18, CD + 0.12, trimCel, [CX, FLOOR + 0.09, CZ]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.16, WH, 0.16, trimCel, [CX + sx * (CW / 2), FLOOR + WH / 2, CZ + sz * (CD / 2)]);
  b.extrude(
    [
      [-CW / 2, 0],
      [CW / 2, 0],
      [0, RH],
    ],
    { at: up([CX, TOP, CZ]), x: [1, 0, 0], thickness: CD, color: wallPaint },
  );

  const roofPlane = (
    cx: number, topY: number, cz: number, halfW: number, rh: number, ov: number,
    len: number, thick: number, color: any, baseOff: number, x0: number, x1?: number,
  ) => {
    const tan = rh / halfW;
    const th = Math.atan(tan);
    const xe = x1 ?? halfW + ov;
    const length = (xe - x0) / Math.cos(th);
    const xm = (x0 + xe) / 2;
    const ym = rh - xm * tan;
    const off = baseOff + thick / 2;
    for (const s of [1, -1])
      box(length, thick, len, color, [
        cx + s * (xm + Math.sin(th) * off),
        topY + ym + Math.cos(th) * off,
        cz,
      ], { rotation: [0, 0, -s * th / D2R] });
  };
  roofPlane(CX, TOP, CZ, CW / 2, RH, 0.4, CD + 0.8, 0.14, roofCel, 0, -0.05);
  roofPlane(CX, TOP, CZ, CW / 2, RH, 0.25, CD + 0.6, 0.2, snowCel, 0.14, 0.0, CW / 2 + 0.2);
  roofPlane(CX, TOP, FRONT + 0.41, CW / 2, RH, 0.4, 0.06, 0.26, trimCel, -0.1, -0.05);
  roofPlane(CX, TOP, CZ - CD / 2 - 0.41, CW / 2, RH, 0.4, 0.06, 0.26, trimCel, -0.1, -0.05);

  // windows
  const frontWindow = (x: number, shutterSide: number) => {
    box(1.3, 1.15, 0.1, trimCel, [x, 1.95, FRONT + 0.03]);
    glow(plane(1.1, 0.95, WINDOW, [x, 1.95, FRONT + 0.085]), 1.1);
    box(1.5, 0.08, 0.26, trimCel, [x, 1.33, FRONT + 0.1]);
    box(1.4, 0.1, 0.22, snowCel, [x, 2.58, FRONT + 0.1]);
    box(0.3, 1.15, 0.06, SHUTTER, [x + shutterSide * 0.8, 1.95, FRONT + 0.04]);
  };
  frontWindow(CX - 2.0, -1);
  frontWindow(CX - 0.55, 1);

  const sideWindow = (side: number, z: number) => {
    const x = CX + side * (CW / 2);
    box(0.1, 1.15, 1.3, trimCel, [x + side * 0.03, 1.95, z]);
    glow(plane(0.95, 1.1, WINDOW, [x + side * 0.085, 1.95, z], [0, side * 90, 0]), 1.1);
    box(0.26, 0.08, 1.5, trimCel, [x + side * 0.1, 1.33, z]);
    box(0.22, 0.1, 1.4, snowCel, [x + side * 0.1, 2.58, z]);
  };
  sideWindow(1, CZ + 0.7);
  sideWindow(-1, CZ + 0.7);
  plane(0.95, 0.95, EMBLEM, [CX + CW / 2 + 0.03, 2.3, CZ - 0.95], [0, 90, 0]);
  plane(0.85, 0.85, EMBLEM, [CX, TOP + 0.55, FRONT + 0.02]);

  // sign
  box(2.65, 0.7, 0.05, "#3a2a2f", [CX - 1.5, 3.0, FRONT + 0.02]);
  plane(2.5, 0.563, SIGN, [CX - 1.5, 3.0, FRONT + 0.05]);

  // door
  const DXX = CX + 1.9;
  box(1.15, 2.1, 0.1, trimCel, [DXX, 1.85, FRONT + 0.03]);
  box(0.95, 1.95, 0.08, DOOR, [DXX, 1.78, FRONT + 0.07]);
  box(0.7, 0.7, 0.02, "#244760", [DXX, 1.2, FRONT + 0.12]);
  glow(plane(0.55, 0.5, WINDOW, [DXX, 2.25, FRONT + 0.115]), 1.1);
  ball(0.045, GOLD, [DXX + 0.32, 1.75, FRONT + 0.14], {}, 6, 4);

  // porch
  const PX = DXX;
  const PZ = FRONT + 0.65;
  box(2.0, 0.12, 1.3, woodCel, [PX, 0.72, PZ]);
  for (const sx of [-0.9, 0.9]) for (const sz of [-0.5, 0.5]) cyl(0.09, 0.09, 0.7, 6, WOOD_D, [PX + sx, 0.35, PZ + sz]);
  for (let i = 0; i < 3; i++) {
    const top = 0.58 - i * 0.2;
    box(1.2, top, 0.32, woodCel, [PX, top / 2, FRONT + 1.3 + 0.16 + i * 0.32]);
  }
  for (const sx of [-0.95, 0.95]) {
    box(0.07, 0.07, 1.3, trimCel, [PX + sx, 0.78 + 0.9, PZ]);
    box(0.06, 0.06, 1.3, trimCel, [PX + sx, 0.78 + 0.5, PZ]);
    for (const sz of [-0.62, 0.62]) box(0.08, 0.9, 0.08, trimCel, [PX + sx, 0.78 + 0.45, PZ + sz]);
  }
  for (const sx of [-0.8, 0.8]) cyl(0.05, 0.05, 2.3, 6, trimCel, [PX + sx, 0.78 + 1.15, FRONT + 1.25]);
  box(2.0, 0.1, 1.5, roofCel, [PX, 3.12, FRONT + 0.7], { rotation: [6, 0, 0] });
  box(1.9, 0.14, 1.4, snowCel, [PX, 3.27, FRONT + 0.7], { rotation: [6, 0, 0] });
  // porch lantern
  box(0.05, 0.05, 0.16, METAL, [DXX + 0.78, 2.35, FRONT + 0.08]);
  glow(ball(0.1, "#ffd27a", [DXX + 0.78, 2.28, FRONT + 0.2], {}, 6, 4), 1.6);

  // chimney and smoke
  const CHX = CX - 1.5;
  const CHZ = CZ - 0.3;
  cyl(0.13, 0.13, 1.9, 7, METAL, [CHX, TOP + 1.65, CHZ]);
  cyl(0.2, 0.2, 0.1, 7, "#6b5a80", [CHX, TOP + 1.2, CHZ]);
  cone(0.24, 0.24, 7, METAL, [CHX, TOP + 2.7, CHZ]);
  const smoke: [number, number, number, number, string][] = [
    [0.12, 2.98, 0.0, 0.17, "#f2e1e0"],
    [0.45, 3.45, 0.05, 0.26, "#e8d2d8"],
    [1.0, 3.98, 0.0, 0.36, "#dcc4d2"],
    [1.7, 4.55, -0.05, 0.46, "#d0b8cc"],
  ];
  for (const [dx, dy, dz, r, c] of smoke) ball(r, c, [CHX + dx, TOP + dy, CHZ + dz], {}, 7, 5);

  // firewood stack
  const logRows: [number, number][] = [
    [0.98, 0.11], [1.2, 0.11], [1.42, 0.11], [1.09, 0.31], [1.31, 0.31], [1.2, 0.51],
  ];
  logRows.forEach(([z, y], i) =>
    cyl(0.1, 0.1, 1.3, 7, i % 2 ? "#a8754a" : "#8a5a3e", [CX - 2.0, y, z], { rotation: [0, 0, 90] }),
  );

  // icicles
  for (const side of [1, -1]) {
    const n = side > 0 ? 14 : 9;
    for (let i = 0; i < n; i++) {
      const len = 0.15 + rand() * 0.3;
      const z = CZ - 1.7 + (i * 3.4) / (n - 1);
      cone(0.035, len, 5, ICICLE, [CX + side * 3.36, TOP - 0.15 - len / 2, z], { rotation: [180, 0, 0] });
    }
  }

  // =====================================================================
  // INSTRUMENT SHED
  // =====================================================================
  const SX = -5.65;
  const SZ = -1.0;
  const SW = 2.9;
  const SD = 3.0;
  const SB = 0.3;
  const SHH = 2.1;
  const shedPaint = siding(TEAL_LIT, TEAL_SH, "#2f7480", "#234b63");
  box(SW, SHH, SD, shedPaint, [SX, SB + SHH / 2, SZ]);
  for (const sx of [-1.1, 1.1]) box(0.2, 0.22, SD + 0.5, WOOD_D, [SX + sx, 0.11, SZ]);
  box(SW + 0.5, 0.12, SD + 0.5, roofCel, [SX, SB + SHH + 0.12, SZ], { rotation: [0, 0, 5] });
  box(SW + 0.4, 0.18, SD + 0.4, snowCel, [SX, SB + SHH + 0.3, SZ], { rotation: [0, 0, 5] });
  const SFZ = SZ + SD / 2;
  box(1.0, 1.8, 0.06, trimCel, [SX - 0.6, SB + 0.9, SFZ + 0.02]);
  box(0.85, 1.7, 0.08, "#d9552d", [SX - 0.6, SB + 0.85, SFZ + 0.05]);
  ball(0.04, GOLD, [SX - 0.3, SB + 0.85, SFZ + 0.11], {}, 6, 4);
  box(1.1, 0.3, 0.5, woodCel, [SX - 0.6, 0.15, SFZ + 0.3]);
  box(0.9, 0.75, 0.08, trimCel, [SX + 0.7, 1.55, SFZ + 0.03]);
  glow(plane(0.75, 0.6, WINDOW, [SX + 0.7, 1.55, SFZ + 0.075]), 1.1);
  box(0.6, 0.4, 0.2, METAL, [SX + 1.0, 0.4, SFZ + 0.15]);
  cyl(0.03, 0.03, 1.6, 6, "#e6d6c6", [SX - 0.9, 3.25, SZ - 0.5]);
  ball(0.06, GOLD, [SX - 0.9, 4.1, SZ - 0.5], {}, 6, 4);
  cyl(0.05, 0.05, 0.6, 6, METAL, [SX + 0.5, 2.95, SZ - 0.3]);
  b.lathe(
    [
      [0, 0],
      [0.25, 0.04],
      [0.5, 0.16],
      [0.5, 0.19],
      [0.25, 0.075],
      [0, 0.035],
    ],
    { at: up([SX + 0.5, 3.3, SZ - 0.3]), axis: [0.25, 0.75, 0.6], segments: 10, color: trimCel },
  );
  rod([SX + 0.5, 3.3, SZ - 0.3], [SX + 0.7, 3.62, SZ + 0.15], 0.02, METAL, 4);
  ball(0.05, ORANGE, [SX + 0.7, 3.64, SZ + 0.17], {}, 6, 4);

  // =====================================================================
  // FUEL DRUMS
  // =====================================================================
  box(1.6, 0.14, 1.35, woodCel, [-7.0, 0.07, 2.35]);
  const drum = (x: number, z: number, y0: number, tint: string, yaw: number) => {
    put(new THREE.CylinderGeometry(0.29, 0.29, 0.88, 10), tint, [x, y0 + 0.44, z], { texture: DRUM, rotation: [0, yaw, 0] });
    cyl(0.3, 0.3, 0.04, 10, "#3a3550", [x, y0 + 0.9, z]);
    cyl(0.06, 0.06, 0.05, 6, "#c9c0d0", [x + 0.12, y0 + 0.94, z]);
  };
  drum(-7.35, 2.05, 0.14, "#d8412f", 20);
  drum(-6.7, 2.05, 0.14, "#3f95a0", 80);
  drum(-7.35, 2.68, 0.14, "#e5902f", 140);
  drum(-6.7, 2.68, 0.14, "#d8412f", 200);
  drum(-5.95, 2.3, 0, "#3f95a0", 260);
  castShadow([[rect(-7.8, -6.4, 1.75, 3.0), 0], [rect(-7.8, -6.4, 1.75, 3.0), 1.0]]);

  // =====================================================================
  // SNOWMOBILE + SLED
  // =====================================================================
  const SM = { x: -4.6, z: 3.5, yaw: -70 };
  const sm = makeLocal(SM.x, SM.z, SM.yaw);
  const bodyCel = cel2("#e5622f", "#a8393a");
  const SKI = "#2a2540";
  const TRACK = "#1f1a2c";
  for (const sx of [1, -1]) {
    sm.box(0.13, 0.07, 1.25, SKI, [sx * 0.48, 0.1, 0.85]);
    sm.box(0.13, 0.07, 0.34, SKI, [sx * 0.48, 0.2, 1.55], [-32, 0, 0]);
    sm.box(0.07, 0.5, 0.07, METAL, [sx * 0.4, 0.38, 0.7], [0, 0, sx * -8]);
  }
  sm.box(0.55, 0.28, 1.5, TRACK, [0, 0.22, -0.55]);
  sm.cyl(0.2, 0.2, 0.56, 8, "#3a3350", [0, 0.22, -1.3], [0, 0, 90]);
  sm.cyl(0.2, 0.2, 0.56, 8, "#3a3350", [0, 0.22, 0.2], [0, 0, 90]);
  sm.box(0.78, 0.42, 1.3, bodyCel, [0, 0.62, -0.5]);
  sm.box(0.85, 0.34, 1.0, bodyCel, [0, 0.55, 0.55]);
  sm.box(0.7, 0.3, 0.9, bodyCel, [0, 0.82, 0.6], [12, 0, 0]);
  sm.box(0.14, 0.02, 1.6, TRIM, [0, 0.99, 0.2]);
  sm.box(0.46, 0.14, 1.0, "#2c2538", [0, 0.9, -0.55]);
  sm.box(0.56, 0.4, 0.05, "#86bccd", [0, 1.15, 0.2], [-25, 0, 0]);
  sm.cyl(0.04, 0.04, 0.35, 6, METAL, [0, 0.9, 0.3]);
  sm.cyl(0.03, 0.03, 0.85, 6, METAL, [0, 1.07, 0.3], [0, 0, 90]);
  for (const sx of [1, -1]) sm.cyl(0.045, 0.045, 0.16, 6, "#1b1626", [sx * 0.42, 1.07, 0.3], [0, 0, 90]);
  glow(sm.box(0.36, 0.14, 0.06, "#fff0b8", [0, 0.82, 1.06], [12, 0, 0]), 1.4);
  glow(sm.box(0.3, 0.07, 0.04, "#ff4a3a", [0, 0.7, -1.17]), 1.3);
  sm.box(0.7, 0.06, 0.6, METAL, [0, 0.88, -1.4]);
  sm.box(0.5, 0.3, 0.42, "#e8a233", [0, 1.1, -1.4]);
  sm.box(0.52, 0.04, 0.44, "#6b4a30", [0, 1.27, -1.4]);
  sm.box(0.06, 0.06, 0.7, METAL, [0, 0.3, -1.85]);
  castShadow([[[[-0.5, -1.5], [0.5, -1.5], [0.5, 1.6], [-0.5, 1.6]].map((l) => { const q = sm.P([l[0], 0, l[1]]); return [q[0], q[2]] as P2; }), 0],
    [[[-0.4, -1.4], [0.4, -1.4], [0.4, 1.0], [-0.4, 1.0]].map((l) => { const q = sm.P([l[0], 0, l[1]]); return [q[0], q[2]] as P2; }), 1.2]]);

  const sledAt = sm.P([0, 0, -3.0]);
  const sl = makeLocal(sledAt[0], sledAt[2], SM.yaw);
  for (const sx of [1, -1]) {
    sl.box(0.1, 0.1, 2.0, WOOD_D, [sx * 0.4, 0.07, 0]);
    sl.box(0.1, 0.1, 0.3, WOOD_D, [sx * 0.4, 0.15, 1.1], [-35, 0, 0]);
    sl.box(0.06, 0.3, 1.8, WOOD, [sx * 0.46, 0.34, 0]);
  }
  sl.box(0.95, 0.06, 1.8, woodCel, [0, 0.2, 0]);
  sl.box(0.8, 0.45, 0.8, "#3f8f7a", [0, 0.48, 0.4]);
  sl.box(0.82, 0.04, 0.82, "#2a6a5e", [0, 0.72, 0.4]);
  sl.box(0.85, 0.3, 0.7, "#2e5c7a", [0, 0.38, -0.55], [4, 0, 0]);
  sl.box(0.05, 0.34, 0.74, "#f6e2bd", [0, 0.39, -0.55]);
  sl.box(0.9, 0.04, 0.04, "#e8c88a", [0, 0.58, -0.55]);
  castShadow([[[[-0.5, -1.0], [0.5, -1.0], [0.5, 1.0], [-0.5, 1.0]].map((l) => { const q = sl.P([l[0], 0, l[1]]); return [q[0], q[2]] as P2; }), 0],
    [[[-0.4, -0.9], [0.4, -0.9], [0.4, 0.8], [-0.4, 0.8]].map((l) => { const q = sl.P([l[0], 0, l[1]]); return [q[0], q[2]] as P2; }), 0.8]]);

  // =====================================================================
  // RADIO MAST
  // =====================================================================
  const MX = 3.6;
  const MZ = -3.0;
  const MH = 8.4;
  const legR = (y: number) => 0.62 * (1 - 0.55 * (y / MH));
  const legPt = (i: number, y: number): V => {
    const a = (90 + i * 120) * D2R;
    return [MX + legR(y) * Math.cos(a), y, MZ + legR(y) * Math.sin(a)];
  };
  const levels = [0, 1.4, 2.8, 4.2, 5.6, 7.0, 8.4];
  for (let k = 0; k < 6; k++)
    for (let i = 0; i < 3; i++) {
      rod(legPt(i, levels[k]), legPt(i, levels[k + 1]), 0.05, k % 2 === 0 ? ORANGE : TRIM, 5);
      rod(legPt(i, levels[k]), legPt((i + 1) % 3, levels[k + 1]), 0.024, "#3a2f4f", 4);
    }
  for (let k = 0; k < 7; k++)
    for (let i = 0; i < 3; i++) rod(legPt(i, levels[k]), legPt((i + 1) % 3, levels[k]), 0.03, "#3a2f4f", 4);
  for (let i = 0; i < 3; i++) {
    const p = legPt(i, 0);
    box(0.34, 0.22, 0.34, "#b9aec8", [p[0], 0.1, p[2]]);
  }
  cyl(0.72, 0.72, 0.07, 3, METAL, [MX, 4.2, MZ]);
  rod([MX, 8.4, MZ], [MX, 10.3, MZ], 0.022, "#3a2f4f", 4);
  rod([MX - 0.65, 9.1, MZ], [MX + 0.65, 9.1, MZ], 0.02, "#3a2f4f", 4);
  for (const dx of [-0.6, -0.2, 0.2, 0.6]) rod([MX + dx, 8.85, MZ], [MX + dx, 9.35, MZ], 0.015, TRIM, 4);
  glow(ball(0.1, "#ff3b2e", [MX, 10.4, MZ], {}, 6, 4), 1.8);
  rod([MX, 6.3, MZ + 0.3], [MX, 6.3, MZ + 0.75], 0.03, METAL, 4);
  b.lathe(
    [
      [0, 0],
      [0.2, 0.03],
      [0.4, 0.13],
      [0.4, 0.16],
      [0.2, 0.065],
      [0, 0.03],
    ],
    { at: up([MX, 6.3, MZ + 0.78]), axis: [0, 0.35, 1], segments: 10, color: trimCel },
  );
  const anchors: [number, number][] = [[3.6, 0.4], [0.66, -4.7], [6.54, -4.7]];
  anchors.forEach(([ax, az], i) => {
    rod(legPt(i, 7.0), [ax, 0.12, az], 0.018, "#2b2438", 4);
    box(0.34, 0.24, 0.34, "#b9aec8", [ax, 0.08, az]);
  });
  castShadow([[[[MX - 0.4, MZ - 0.3], [MX + 0.4, MZ + 0.3]] as P2[], 0], [[[MX - 0.1, MZ - 0.1], [MX + 0.1, MZ + 0.1]] as P2[], 6.2]]);

  // =====================================================================
  // RADOME
  // =====================================================================
  const RX = 7.3;
  const RZ = -2.4;
  cyl(1.7, 1.75, 0.5, 12, "#cfc3d8", [RX, 0.25, RZ]);
  const radomePaint = paint((p, n) => {
    const lit = n.dot(SUN) > -0.05;
    const ang = Math.atan2(p.x - RX, p.z - RZ);
    const alt = (Math.floor(ang / (Math.PI / 5)) + Math.floor((p.y - GY - 0.5) / 0.45)) % 2 !== 0;
    return lit ? (alt ? "#fff3e8" : "#f6ddd2") : alt ? "#c9b4d6" : "#b4a0cc";
  });
  put(new THREE.SphereGeometry(1.5, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), radomePaint, [RX, 0.5, RZ]);
  cyl(1.53, 1.53, 0.12, 10, "#8a7aa8", [RX, 0.58, RZ]);
  box(0.6, 0.9, 0.2, DARK, [RX, 0.95, RZ + 1.33]);
  box(0.74, 1.0, 0.08, trimCel, [RX, 0.98, RZ + 1.25]);
  glow(ball(0.1, "#ff3b2e", [RX, 2.08, RZ], {}, 6, 4), 1.8);
  const circ: P2[] = [];
  for (let i = 0; i < 10; i++) circ.push([RX + 1.6 * Math.cos((i / 10) * Math.PI * 2), RZ + 1.6 * Math.sin((i / 10) * Math.PI * 2)]);
  castShadow([[circ, 0], [circ.map(([x, z]) => [RX + (x - RX) * 0.5, RZ + (z - RZ) * 0.5] as P2), 1.5]]);

  // =====================================================================
  // WEATHER STATION
  // =====================================================================
  const louvre = paint((p, n) => {
    const lit = n.dot(SUN) > -0.05;
    const f = ((((p.y - GY) / 0.07) % 1) + 1) % 1;
    const slat = f < 0.35;
    return lit ? (slat ? "#d9c6c8" : "#fbefe2") : slat ? "#9a8cba" : "#c8bbdc";
  });
  const SVX = 4.6;
  const SVZ = 2.4;
  for (const sx of [-0.3, 0.3]) for (const sz of [-0.2, 0.2]) cyl(0.04, 0.04, 0.95, 5, "#6b5a80", [SVX + sx, 0.47, SVZ + sz]);
  box(0.75, 0.55, 0.55, louvre, [SVX, 1.2, SVZ]);
  box(0.86, 0.07, 0.66, trimCel, [SVX, 1.52, SVZ], { rotation: [4, 0, 0] });
  box(0.86, 0.05, 0.66, snowCel, [SVX, 1.58, SVZ], { rotation: [4, 0, 0] });
  ball(0.035, GOLD, [SVX + 0.25, 1.2, SVZ + 0.29], {}, 5, 4);
  castShadow([[rect(SVX - 0.35, SVX + 0.35, SVZ - 0.3, SVZ + 0.3), 0], [rect(SVX - 0.4, SVX + 0.4, SVZ - 0.3, SVZ + 0.3), 1.6]]);

  // data logger
  cyl(0.04, 0.04, 1.0, 5, METAL, [3.2, 0.5, 2.0]);
  box(0.55, 0.4, 0.2, "#3c3a4e", [3.2, 1.2, 2.0]);
  glow(plane(0.42, 0.27, SCREEN, [3.2, 1.22, 2.105]), 1.2);
  // rain gauge
  cyl(0.12, 0.12, 0.5, 8, "#f3e7d8", [5.4, 0.25, 2.9]);
  cone(0.13, 0.12, 8, "#d9552d", [5.4, 0.56, 2.9]);

  // anemometer mast
  const AX = 6.0;
  const AZ = 1.2;
  cyl(0.05, 0.06, 3.4, 6, "#e6d6c6", [AX, 1.7, AZ]);
  const an = makeLocal(AX, AZ, 0);
  an.ball(0.07, METAL, [0, 3.45, 0]);
  for (let i = 0; i < 3; i++) {
    const a = i * 120 * D2R;
    const ex = Math.cos(a) * 0.24;
    const ez = Math.sin(a) * 0.24;
    const [wx, , wz] = an.P([ex, 0, ez]);
    rod([AX, 3.45, AZ], [wx, 3.45, wz], 0.016, METAL, 4);
    ball(0.075, ORANGE, [wx, 3.45, wz], { scale: [1, 0.8, 1] }, 6, 4);
  }
  rod([AX, 3.05, AZ - 0.35], [AX, 3.05, AZ + 0.35], 0.02, METAL, 4);
  cone(0.05, 0.14, 5, ORANGE, [AX, 3.05, AZ + 0.42], { rotation: [90, 0, 0] });
  box(0.02, 0.22, 0.26, ORANGE, [AX, 3.07, AZ - 0.32]);
  castShadow([[[[AX - 0.05, AZ - 0.05], [AX + 0.05, AZ + 0.05]] as P2[], 0], [[[AX - 0.05, AZ - 0.05], [AX + 0.05, AZ + 0.05]] as P2[], 3.4]]);

  // snow stake
  const stakePaint = paint((p) => (Math.floor((p.y - GY) / 0.2) % 2 === 0 ? "#d9402d" : "#f8ecdd"));
  cyl(0.035, 0.035, 1.6, 5, stakePaint, [1.4, 0.8, 4.4]);

  // =====================================================================
  // FLAGPOLE, BUNTING, BEAR SIGN
  // =====================================================================
  const FX = 2.9;
  const FZ = 3.2;
  cyl(0.18, 0.2, 0.15, 7, "#d9ccd8", [FX, 0.07, FZ]);
  cyl(0.045, 0.05, 5.2, 6, "#f3e7d8", [FX, 2.6, FZ]);
  ball(0.08, GOLD, [FX, 5.28, FZ], {}, 6, 4);
  box(1.1, 0.72, 0.02, "#ffffff", [FX + 0.6, 4.55, FZ], { texture: FLAG, rotation: [0, 6, 0] });
  castShadow([[[[FX - 0.05, FZ - 0.05], [FX + 0.05, FZ + 0.05]] as P2[], 0], [[[FX - 0.05, FZ - 0.05], [FX + 0.05, FZ + 0.05]] as P2[], 5.0]]);

  const A: V = [FX, 3.7, FZ];
  const B2: V = [AX, 2.9, AZ];
  const sag = 0.45;
  const at = (t: number): V => [A[0] + (B2[0] - A[0]) * t, A[1] + (B2[1] - A[1]) * t - sag * 4 * t * (1 - t), A[2] + (B2[2] - A[2]) * t];
  for (let i = 0; i < 12; i++) rod(at(i / 12), at((i + 1) / 12), 0.012, "#3a2f4f", 4);
  const dirx = B2[0] - A[0];
  const dirz = B2[2] - A[2];
  const dl = Math.hypot(dirx, dirz);
  const flagCols = ["#e5603a", "#f2b455", "#5ea6a6", "#8a6bb0", "#f6e2bd"];
  for (let i = 0; i < 8; i++) {
    const q = at((i + 0.5) / 8);
    b.extrude(
      [[-0.14, 0], [0.14, 0], [0, -0.3]],
      { at: up(q), x: [dirx / dl, 0, dirz / dl], thickness: 0.012, color: flagCols[i % flagCols.length] },
    );
  }

  cyl(0.05, 0.05, 1.9, 5, "#3a2f4f", [0.6, 0.95, 5.2]);
  box(0.95, 0.95, 0.04, "#ffffff", [0.6, 2.15, 5.2], { texture: BEAR, rotation: [0, -10, 0] });
  castShadow([[[[0.55, 5.15], [0.65, 5.25]] as P2[], 0], [[[0.55, 5.15], [0.65, 5.25]] as P2[], 2.5]]);

  // =====================================================================
  // SOLAR ARRAY
  // =====================================================================
  const SOLX = 8.2;
  const SOLZ = 3.0;
  const tilt = -50;
  const nrm: V = [0, Math.sin(50 * D2R), Math.cos(50 * D2R)];
  for (let i = -1; i <= 1; i++) {
    const cx = SOLX + i * 1.28;
    box(1.2, 0.9, 0.06, "#8f86a8", [cx, 0.72, SOLZ], { rotation: [tilt, 0, 0] });
    box(1.14, 0.84, 0.04, "#ffffff", [cx + nrm[0] * 0.04, 0.72 + nrm[1] * 0.04, SOLZ + nrm[2] * 0.04], {
      texture: SOLAR,
      rotation: [tilt, 0, 0],
    });
  }
  for (const px of [-1.9, 0, 1.9]) {
    cyl(0.045, 0.045, 0.45, 5, METAL, [SOLX + px, 0.22, SOLZ + 0.36]);
    cyl(0.045, 0.045, 1.0, 5, METAL, [SOLX + px, 0.5, SOLZ - 0.34]);
  }
  rod([SOLX - 1.9, 0.4, SOLZ + 0.36], [SOLX + 1.9, 0.4, SOLZ + 0.36], 0.03, METAL, 4);

  // =====================================================================
  // CAST SHADOWS OF CABIN AND SHED
  // =====================================================================
  const cab = rect(CX - CW / 2, CX + CW / 2, CZ - CD / 2, CZ + CD / 2);
  castShadow([
    [cab, 0],
    [cab, TOP],
    [[[CX, CZ - 2.15], [CX, CZ + 2.15]] as P2[], TOP + RH],
  ]);
  const shd = rect(SX - SW / 2, SX + SW / 2, SZ - SD / 2, SZ + SD / 2);
  castShadow([[shd, 0], [shd, SB + SHH + 0.3]]);

  return b.root;
}
```