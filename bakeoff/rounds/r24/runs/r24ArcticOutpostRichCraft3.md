```ts
import * as THREE from "three";
import { catmull, createBuilder, mix, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "Firewatch-style flat-colour diorama of a polar research station at sunset: stilted red hut, corrugated teal lab, radio mast, dish, wind turbine, solar panels, snowmobile and sled, ice drill, a researcher, long violet shadows and layered mountains under a banded sky with a faint aurora.",
};

// ------------------------------------------------------------------------------------------------
// Constants and palette

const D2R = Math.PI / 180;
const G = 0.4; // snow surface height

const SUN = new THREE.Vector3(0.5, 0.3, -0.8).normalize();

/** Firewatch light: warm on top and on the sun side, cool violet on the faces turned to the viewer and below. */
function lit(base: string, lo = "#6c5ea0", warm = "#ffd8a8") {
  return paint((_p, n) => {
    const up = smoothstep(0.4, 0.95, n.y);
    const rim = smoothstep(0.15, 0.85, n.dot(SUN));
    const front = smoothstep(0.2, 0.95, n.z) * (1 - up);
    const under = smoothstep(0.1, -0.8, n.y);
    let c = mix(base, lo, Math.min(1, 0.3 * front + 0.35 * under));
    c = mix(c, warm, 0.32 * up + 0.26 * rim);
    return c;
  });
}

/** Horizontal clapboard grooves on a lit base. */
function siding(base: string, groove: string, period = 0.026) {
  const a = lit(base);
  const g = lit(groove);
  return paint((p, n) => (Math.abs(n.y) < 0.6 && (((p.y / period) % 1) + 1) % 1 < 0.15 ? g : a));
}

const SNOW = lit("#f8ece6", "#aeaadc", "#fff1d6");
const S_A = lit("#fbefe8", "#aeaadc", "#fff1d6");
const S_B = lit("#e6e0f5", "#aeaadc", "#fff1d6");
const SNOWG = paint((p, n) => (n.y > 0.5 && noise(p, 0.5, 2) > 0.6 ? S_B : S_A));

const RK = [lit("#352a47"), lit("#4a3b60"), lit("#614b72")];
const ROCKL = paint((p) => {
  const y = p.y + 0.03 * (noise(p, 0.3, 4) - 0.5);
  return y < 0.045 ? RK[0] : y < 0.095 ? RK[1] : RK[2];
});
const IC = [lit("#8ccbe2"), lit("#c6edf6"), lit("#6fa9cc")];
const ICEL = paint((p) => {
  const t = noise(p, 0.14, 4);
  return t > 0.62 ? IC[1] : t < 0.3 ? IC[2] : IC[0];
});
const ROCKP = lit("#4d3d5e");
const RED_WALL = siding("#c9442c", "#9a2f2c");
const TEAL_WALL = siding("#3f8a8a", "#2f6b72");
const CREAMP = lit("#ecd9b4");
const ROOFP = lit("#3a3550");
const WOODP = lit("#8a5634");
const WOODDP = lit("#563024");
const TEALP = lit("#3f8a8a");
const TEALDP = lit("#2c5d68");
const IRONP = lit("#3a3340");
const STEELP = lit("#a7aec4");
const WHITEP = lit("#f4efee");
const REDP = lit("#d24a32");
const ORANGEP = lit("#f07a2a");
const MUSTARDP = lit("#e3a22f");
const PINEP = lit("#2f6058");
const ICELP = lit("#bfe9f5");

// sky: banded gradient
const SKY: [number, string][] = [
  [0.4, "#ffd9a8"],
  [0.8, "#fcae82"],
  [1.2, "#ee7f7c"],
  [1.55, "#bb5f8c"],
  [1.9, "#7b4f95"],
  [2.25, "#40397a"],
];
const SKYP = paint((p) => {
  const y = 0.4 + Math.floor(Math.max(p.y - 0.4, 0) / 0.09) * 0.09 + 0.045;
  for (let i = 1; i < SKY.length; i++) {
    if (y <= SKY[i][0]) {
      const [y0, c0] = SKY[i - 1];
      const [y1, c1] = SKY[i];
      return mix(c0, c1, (y - y0) / (y1 - y0));
    }
  }
  return SKY[SKY.length - 1][1];
});

// ------------------------------------------------------------------------------------------------
// Textures

const WINDOW = svg(
  `<svg viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdc86"/><stop offset="1" stop-color="#ff9a48"/></linearGradient></defs>
  <rect width="40" height="32" fill="#35242e"/>
  <rect x="2.5" y="2.5" width="35" height="27" fill="url(#g)"/>
  <path d="M8 2.5V8" stroke="#35242e" stroke-width="1"/>
  <path d="M5 12 L8 7.5 L11 12Z" fill="#35242e"/>
  <rect x="23" y="21" width="6" height="8.5" fill="#7a3a2a"/>
  <rect x="30" y="24" width="5" height="5.5" fill="#a9552f"/>
  <path d="M2.5 2.5 L10 2.5 Q8 13 2.5 18Z" fill="#c9442c"/>
  <path d="M37.5 2.5 L30 2.5 Q32 13 37.5 18Z" fill="#c9442c"/>
  <path d="M20 2.5V29.5M2.5 16H37.5" stroke="#35242e" stroke-width="2"/>
  </svg>`,
  { size: 160 },
);

const SIGN = svg(
  `<svg viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="78" height="30" rx="3" fill="#f0dcb0" stroke="#5a3424" stroke-width="2"/>
  <rect x="5" y="5" width="70" height="22" fill="none" stroke="#c9442c" stroke-width="1"/>
  <text x="40" y="16" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="9.5" fill="#3a2230">POLAR STATION</text>
  <text x="40" y="24.5" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="6" fill="#c9442c">NO. 7 - ICE &amp; WEATHER</text>
  </svg>`,
  { size: 320 },
);

const FLAG = svg(
  `<svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="30" fill="#2d3f7a"/>
  <rect y="22" width="48" height="4" fill="#f08a2c"/>
  <g stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"><path d="M24 4V21M16.6 8.5L31.4 16.5M31.4 8.5L16.6 16.5"/></g>
  <circle cx="24" cy="12.5" r="2.4" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);

function auroraMarkup() {
  let rays = "";
  for (let i = 0; i < 34; i++) {
    const x = 6 + i * 7 + (i % 3) * 1.5;
    const y1 = 28 + 14 * Math.sin(i * 0.7);
    rays += `<path d="M${x} ${y1} V${y1 + 28 + (i % 4) * 5}" stroke="#b9ffe2" stroke-width="1.4"/>`;
  }
  return `<svg viewBox="0 0 240 90" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8af0c0"/><stop offset="1" stop-color="#3a9fb0"/></linearGradient>
   <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c78af0"/><stop offset="1" stop-color="#5fd0c0"/></linearGradient>
  </defs>
  <path d="M0 22 C40 2 80 40 120 18 S200 0 240 20 L240 36 C200 22 160 52 120 36 S40 50 0 38Z" fill="url(#b)"/>
  <path d="M0 40 C40 14 80 58 120 32 S200 8 240 38 L240 68 C200 48 160 84 120 62 S40 84 0 66Z" fill="url(#a)"/>
  <g>${rays}</g>
  </svg>`;
}
const AURORA = svg(auroraMarkup(), { size: 512 });

const LABEL = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="30" height="30" rx="2" fill="#f3ead6" stroke="#222" stroke-width="1.6"/>
  <path d="M16 3 L25 12 L16 21 L7 12Z" fill="#f2c230" stroke="#222" stroke-width="1.2"/>
  <path d="M16 7.5V14" stroke="#222" stroke-width="2"/><circle cx="16" cy="17" r="1.1" fill="#222"/>
  <text x="16" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="#222">FUEL</text>
  </svg>`,
  { size: 128 },
);

const STENCIL = svg(
  `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="8" fill="#f3e6c4">ICE CORE</text>
  <text x="20" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="6" fill="#f3e6c4">SET 7 ^ UP</text>
  </svg>`,
  { size: 192 },
);

const DISPLAY = svg(
  `<svg viewBox="0 0 50 24" xmlns="http://www.w3.org/2000/svg">
  <rect width="50" height="24" rx="2" fill="#1b1722"/>
  <rect x="1.5" y="1.5" width="47" height="21" rx="1.5" fill="#241e2c" stroke="#5a4a66" stroke-width="1"/>
  <text x="25" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#ff9a3c">-31 C</text>
  <text x="25" y="21" text-anchor="middle" font-family="monospace" font-size="4.2" fill="#ffd08a">WIND 14 KT   NW</text>
  </svg>`,
  { size: 200 },
);

// ------------------------------------------------------------------------------------------------

type Opt = Record<string, any>;
type P2 = [number, number];
type PT = THREE.Vector3 | [number, number, number];

function hull(pts: P2[]): P2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P2, a: P2, c: P2) => (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]);
  const lo: P2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: P2[] = [];
  for (const q of [...p].reverse()) {
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}

export default function build() {
  const b = createBuilder({ name: "arctic_outpost", paintSize: 2048 });
  const R = rng(11);

  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const box = (w: number, h: number, d: number, c: ColorInput, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    c: ColorInput,
    x: number,
    y: number,
    z: number,
    o: Opt = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], flat: true, ...o });
  const ball = (r: number, c: ColorInput, x: number, y: number, z: number, o: Opt = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z], flat: true, ...o });
  const rod = (a: PT, e: PT, r: number, c: ColorInput) => b.rod(a, e, r, c, { sides: 5 });
  const plane = (
    w: number,
    h: number,
    tex: THREE.Texture,
    x: number,
    y: number,
    z: number,
    dir: [number, number, number] = [0, 0, 1],
    o: Opt = {},
  ) => b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex, ...o });
  const slab = (pts: P2[], y: number, th: number, c: ColorInput) =>
    b.extrude(pts, { at: [0, y, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: th, color: c });

  /** A rotated local frame for assemblies (vehicle, person). */
  const rig = (ox: number, oy: number, oz: number, yaw: number) => {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D2R);
    const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(v3(ox, oy, oz));
    const put = (
      geo: THREE.BufferGeometry,
      c: ColorInput,
      x: number,
      y: number,
      z: number,
      rot: [number, number, number] = [0, 0, 0],
      o: Opt = {},
    ) => {
      const lq = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D2R, rot[1] * D2R, rot[2] * D2R));
      return b.part(geo, c, { at: P(x, y, z), quat: q.clone().multiply(lq), flat: true, ...o });
    };
    return { P, put };
  };

  // ==============================================================================================
  // Backdrop: frame, sky, sun, aurora, stars, mountain layers

  b.extrude(
    [
      [-1.72, 0],
      [1.72, 0],
      [1.72, 2.15],
      [-1.72, 2.15],
    ],
    { at: [0, 0, -1.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: SKYP },
  );
  const FRAME = "#2c2338";
  box(0.06, 2.2, 0.08, FRAME, -1.75, 1.1, -1.19);
  box(0.06, 2.2, 0.08, FRAME, 1.75, 1.1, -1.19);
  box(3.56, 0.06, 0.08, FRAME, 0, 2.17, -1.19);

  glow(b.part(new THREE.CircleGeometry(0.52, 28), "#ffc08a", { at: [0.55, 0.88, -1.176], dir: [0, 0, 1], axis: "z" }), 0.55);
  glow(b.part(new THREE.CircleGeometry(0.3, 28), "#ffe3a8", { at: [0.55, 0.88, -1.172], dir: [0, 0, 1], axis: "z" }), 1.2);
  glow(plane(2.4, 0.9, AURORA, -0.2, 1.7, -1.168), 0.55);
  for (let i = 0; i < 18; i++) {
    const sx = -1.6 + 3.2 * R();
    const sy = 1.62 + 0.5 * R();
    glow(
      b.part(new THREE.OctahedronGeometry(0.006 + 0.006 * R(), 0), "#fff3d6", { at: [sx, sy, -1.168] }),
      1.6,
    );
  }

  const ridges = [
    { z: -1.15, col: "#f19c8e", base: 0.62, amp: 0.46, ph: 0.3, cap: 0.82 },
    { z: -1.11, col: "#d37e92", base: 0.5, amp: 0.4, ph: 1.7, cap: 0.7 },
    { z: -1.07, col: "#a65f86", base: 0.36, amp: 0.34, ph: 2.9, cap: 99 },
    { z: -1.03, col: "#6c4a7c", base: 0.24, amp: 0.26, ph: 4.1, cap: 99 },
  ];
  ridges.forEach((r, i) => {
    const pts: P2[] = [[-1.72, 0]];
    const n = 22;
    for (let k = 0; k <= n; k++) {
      const peak = 0.5 + 0.5 * Math.sin(k * (1.1 + 0.2 * i) + r.ph);
      pts.push([-1.72 + (3.44 * k) / n, r.base + r.amp * (0.25 + 0.75 * peak) * (0.55 + 0.45 * R())]);
    }
    pts.push([1.72, 0]);
    const body = r.col;
    const mist = "#ffcfa6";
    const rp = paint((p, _n, s) => {
      if (s[1] > r.cap + 0.035 * Math.sin(p.x * 53 + i)) return "#fbe8e4";
      return mix(body, mist, 0.65 * smoothstep(0.45, 0.0, s[1]));
    });
    b.extrude(pts, { at: [0, G - 0.06, r.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: rp });
  });

  // ==============================================================================================
  // Ground block

  const rim = (sx: number, sz: number, rr: number, wob: number, seg: number) => {
    const pts: P2[] = [];
    const cx = sx - rr;
    const cz = sz - rr;
    const arc = (ccx: number, ccz: number, a0: number) => {
      for (let k = 0; k <= 3; k++) {
        const a = (a0 + k * 30) * D2R;
        pts.push([ccx + rr * Math.cos(a), ccz + rr * Math.sin(a)]);
      }
    };
    arc(cx, cz, 0);
    for (let k = 1; k < seg; k++) pts.push([cx - (2 * cx * k) / seg, sz - wob * R()]);
    arc(-cx, cz, 90);
    arc(-cx, -cz, 180);
    arc(cx, -cz, 270);
    return pts;
  };
  const gx = [1, 0, 0] as [number, number, number];
  const gy = [0, 0, 1] as [number, number, number];
  b.extrude(rim(1.7, 1.22, 0.3, 0, 6), { at: [0, 0.07, 0], x: gx, y: gy, thickness: 0.14, color: ROCKL });
  b.extrude(rim(1.67, 1.19, 0.3, 0, 6), { at: [0, 0.2, 0], x: gx, y: gy, thickness: 0.12, color: ICEL });
  b.extrude(rim(1.72, 1.24, 0.3, 0.05, 10), {
    at: [0, 0.33, 0],
    x: gx,
    y: gy,
    thickness: 0.14,
    bevel: 0.025,
    color: SNOWG,
  });
  for (let i = 0; i < 16; i++) {
    const x = -1.55 + (3.1 * (i + R() * 0.6)) / 16;
    const len = 0.03 + 0.05 * R();
    b.part(new THREE.ConeGeometry(0.012, len, 5), ICELP, { at: [x, 0.272 - len / 2, 1.2], rotation: [180, 0, 0], flat: true });
  }

  // snow drifts
  const drift = (x: number, z: number, a: number, h: number, c: number, ry = 0) =>
    b.part(new THREE.SphereGeometry(1, 9, 5), SNOW, { at: [x, G - 0.006, z], scale: [a, h, c], rotation: [0, ry, 0], flat: true });
  drift(-0.9, 0.2, 0.28, 0.05, 0.13, 10);
  drift(-0.55, -0.5, 0.3, 0.07, 0.1);
  drift(0.12, 0.2, 0.22, 0.04, 0.1, -8);
  drift(0.96, -0.06, 0.2, 0.06, 0.12, 20);
  drift(1.1, 0.5, 0.3, 0.05, 0.12);
  drift(-1.45, 0.9, 0.3, 0.07, 0.16, -15);
  drift(0.95, 1.0, 0.34, 0.06, 0.13, 6);
  drift(-0.3, 1.0, 0.3, 0.05, 0.12);
  drift(1.5, -0.2, 0.22, 0.08, 0.16, 30);
  drift(-1.1, -0.2, 0.2, 0.05, 0.1);

  // ==============================================================================================
  // Long shadows (cast away from the low sun, toward the viewer)

  const SHADOW = "#9a93c9";
  const castShadow = (pts: P2[], h: number) => {
    const off: P2 = [-0.42 * h, 0.85 * h];
    const cl = (p: P2): P2 => [Math.max(-1.62, Math.min(1.62, p[0])), Math.max(-1.12, Math.min(1.12, p[1]))];
    const all = [...pts, ...pts.map((p): P2 => [p[0] + off[0], p[1] + off[1]])].map(cl);
    slab(hull(all), G + 0.004, 0.006, SHADOW);
  };
  const rectPts = (cx: number, cz: number, w: number, d: number): P2[] => [
    [cx - w / 2, cz - d / 2],
    [cx + w / 2, cz - d / 2],
    [cx + w / 2, cz + d / 2],
    [cx - w / 2, cz + d / 2],
  ];
  const discPts = (cx: number, cz: number, r: number): P2[] => {
    const o: P2[] = [];
    for (let i = 0; i < 8; i++) o.push([cx + r * Math.cos(i * 45 * D2R), cz + r * Math.sin(i * 45 * D2R)]);
    return o;
  };

  // ==============================================================================================
  // Main hut (red clapboard on stilts)

  const HX = -0.35;
  const HZ = -0.2;
  const HW = 0.84;
  const HD = 0.5;
  const HWALL = 0.3;
  const HROOF = 0.17;
  const F = 0.07;
  const Y0 = G + F;
  const HFRONT = HZ + HD / 2;

  castShadow(rectPts(HX, HZ, HW, HD), 0.42);
  castShadow(rectPts(0.62, -0.2, 0.6, 0.4), 0.3);
  castShadow(rectPts(0.195, -0.2, 0.29, 0.15), 0.18);
  castShadow(discPts(-1.25, -0.55, 0.06), 0.55);
  castShadow(discPts(1.45, -0.7, 0.025), 0.5);
  castShadow(discPts(0.28, 0.2, 0.01), 0.45);
  castShadow(rectPts(0.2, 0.62, 0.12, 0.09), 0.16);
  castShadow(discPts(-0.15, 0.75, 0.03), 0.2);
  castShadow(rectPts(-0.82, 0.62, 0.1, 0.34), 0.14);
  castShadow(discPts(0.45, 0.95, 0.1), 0.25);
  const treeSpots: [number, number, number][] = [
    [-1.55, -0.85, 0.85],
    [-0.62, -0.8, 0.75],
    [0.18, -0.82, 0.8],
    [0.42, -0.86, 0.65],
    [1.0, -0.85, 0.7],
  ];
  for (const [tx, tz, ts] of treeSpots) castShadow(discPts(tx, tz, 0.08 * ts), 0.35 * ts);
  for (const dx of [-0.95, -0.99, -0.88]) castShadow(discPts(dx, dx === -0.95 ? 0.02 : 0.12, 0.04), 0.11);

  // stilts and floor
  for (const sx of [-1, 0, 1])
    for (const sz of [-1, 1])
      box(0.04, F + 0.03, 0.04, WOODDP, HX + sx * (HW / 2 - 0.03), G - 0.02 + (F + 0.03) / 2, HZ + sz * (HD / 2 - 0.03));
  box(HW + 0.04, 0.03, HD + 0.04, WOODDP, HX, Y0 - 0.015, HZ);

  // body: gable profile, ridge along x
  b.extrude(
    [
      [-HD / 2, 0],
      [HD / 2, 0],
      [HD / 2, HWALL],
      [0, HWALL + HROOF],
      [-HD / 2, HWALL],
    ],
    { at: [HX, Y0, HZ], x: [0, 0, 1], y: [0, 1, 0], thickness: HW, color: RED_WALL },
  );
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.026, HWALL, 0.026, CREAMP, HX + (sx * HW) / 2, Y0 + HWALL / 2, HZ + (sz * HD) / 2);

  // roof
  const th = Math.atan2(HROOF, HD / 2);
  const slope = Math.hypot(HD / 2, HROOF);
  const RL = slope + 0.07;
  const ridgeP = v3(HX, Y0 + HWALL + HROOF, HZ);
  let eaveFront = v3(0, 0, 0);
  for (const s of [1, -1]) {
    const dir = v3(0, -HROOF / slope, (s * (HD / 2)) / slope);
    const nor = v3(0, HD / 2 / slope, (s * HROOF) / slope);
    const c = ridgeP.clone().addScaledVector(dir, RL / 2 - 0.015).addScaledVector(nor, 0.012);
    b.part(new THREE.BoxGeometry(HW + 0.08, 0.024, RL), ROOFP, { at: c, rotation: [(s * th) / D2R, 0, 0] });
    const sl = RL - 0.03;
    const cs = ridgeP.clone().addScaledVector(dir, sl / 2 - 0.02).addScaledVector(nor, 0.012 + 0.0175);
    b.part(new THREE.BoxGeometry(HW + 0.05, 0.035, sl), SNOW, { at: cs, rotation: [(s * th) / D2R, 0, 0], flat: true });
    if (s === 1) eaveFront = ridgeP.clone().addScaledVector(dir, RL - 0.015);
  }
  for (let i = 0; i < 9; i++) {
    const len = 0.025 + 0.035 * R();
    b.part(new THREE.ConeGeometry(0.008, len, 5), ICELP, {
      at: [HX - HW / 2 + 0.05 + (i * (HW - 0.1)) / 8, eaveFront.y - 0.03 - len / 2, eaveFront.z],
      rotation: [180, 0, 0],
      flat: true,
    });
  }

  // chimney and smoke
  const CPX = HX - 0.26;
  const CPZ = HZ - 0.05;
  box(0.07, 0.03, 0.07, IRONP, CPX, Y0 + 0.45, CPZ);
  cyl(0.02, 0.02, 0.2, 8, IRONP, CPX, Y0 + 0.55, CPZ);
  cyl(0.034, 0.02, 0.025, 8, IRONP, CPX, Y0 + 0.66, CPZ);
  const smokeC = ["#f6e4e0", "#efd9dc", "#e8cfd8", "#e2c6d4", "#dcbfd0"];
  for (let k = 0; k < 5; k++)
    b.part(new THREE.IcosahedronGeometry(0.028 + 0.012 * k, 1), lit(smokeC[k], "#b9a3c8", "#fff0e0"), {
      at: [CPX - 0.04 - 0.055 * k * (1 + 0.15 * k), Y0 + 0.72 + 0.065 * k, CPZ],
      flat: true,
    });

  // door, porch, lantern
  const DX = HX + 0.22;
  box(0.18, 0.265, 0.012, CREAMP, DX, Y0 + 0.1325, HFRONT + 0.002);
  box(0.13, 0.23, 0.016, TEALDP, DX, Y0 + 0.115, HFRONT + 0.006);
  box(0.05, 0.05, 0.004, "#2a2234", DX, Y0 + 0.17, HFRONT + 0.015);
  glow(plane(0.04, 0.04, WINDOW, DX, Y0 + 0.17, HFRONT + 0.0175), 1.1);
  ball(0.009, "#d9a640", DX + 0.045, Y0 + 0.11, HFRONT + 0.017);
  box(0.34, 0.02, 0.15, WOODP, DX, Y0 - 0.01, HFRONT + 0.075);
  box(0.2, 0.035, 0.06, WOODDP, DX, G + 0.0175, HFRONT + 0.18);
  for (const s of [-1, 1]) {
    box(0.016, 0.1, 0.016, CREAMP, DX + s * 0.16, Y0 + 0.05, HFRONT + 0.14);
    rod(v3(DX + s * 0.16, Y0 + 0.09, HFRONT + 0.14), v3(DX + s * 0.16, Y0 + 0.09, HFRONT + 0.005), 0.006, CREAMP);
  }
  box(0.27, 0.012, 0.16, ROOFP, DX, Y0 + 0.285, HFRONT + 0.07, { rotation: [10, 0, 0] });
  box(0.26, 0.02, 0.15, SNOW, DX, Y0 + 0.3, HFRONT + 0.07, { rotation: [10, 0, 0] });
  rod(v3(DX - 0.12, Y0 + 0.275, HFRONT + 0.14), v3(DX - 0.12, Y0 + 0.22, HFRONT + 0.14), 0.006, WOODDP);
  rod(v3(DX + 0.12, Y0 + 0.275, HFRONT + 0.14), v3(DX + 0.12, Y0 + 0.22, HFRONT + 0.14), 0.006, WOODDP);
  const LNX = DX + 0.14;
  rod(v3(LNX, Y0 + 0.22, HFRONT), v3(LNX, Y0 + 0.22, HFRONT + 0.04), 0.004, IRONP);
  glow(cyl(0.014, 0.014, 0.035, 6, "#ffc65a", LNX, Y0 + 0.195, HFRONT + 0.04), 1.6);
  cyl(0.003, 0.018, 0.012, 6, IRONP, LNX, Y0 + 0.22, HFRONT + 0.04);

  // windows
  const windowFront = (x: number, y: number, z: number, w: number, h: number) => {
    box(w + 0.035, h + 0.035, 0.012, CREAMP, x, y, z + 0.004);
    glow(plane(w, h, WINDOW, x, y, z + 0.0115), 1.1);
    box(w + 0.05, 0.012, 0.03, CREAMP, x, y - h / 2 - 0.02, z + 0.014);
    box(w + 0.04, 0.014, 0.026, SNOW, x, y - h / 2 - 0.007, z + 0.014);
    for (const s of [1, -1]) box(0.048, h + 0.02, 0.008, TEALDP, x + s * (w / 2 + 0.043), y, z + 0.008);
  };
  windowFront(HX - 0.0, Y0 + 0.17, HFRONT, 0.13, 0.12);
  windowFront(HX - 0.24, Y0 + 0.17, HFRONT, 0.13, 0.12);
  windowFront(HX - 0.0 + 0, Y0 + 0.17, HFRONT, 0.0001, 0.0001);

  // anemometer-free sign + station number plate
  cyl(0.008, 0.008, 0.2, 5, WOODDP, 0.7, G + 0.08, 0.38);
  cyl(0.008, 0.008, 0.2, 5, WOODDP, 0.5, G + 0.08, 0.38);
  b.part(new THREE.BoxGeometry(0.26, 0.1, 0.012), "#ffffff", { at: [0.6, G + 0.17, 0.386], texture: SIGN });

  // flagpole
  cyl(0.006, 0.008, 0.62, 6, WHITEP, 0.28, G + 0.31, 0.2);
  ball(0.012, "#d9a640", 0.28, G + 0.635, 0.2);
  b.part(new THREE.BoxGeometry(0.17, 0.106, 0.004), "#ffffff", {
    at: [0.28 - 0.088, G + 0.57, 0.2],
    texture: FLAG,
    rotation: [0, 8, -4],
  });

  // ==============================================================================================
  // Lab: corrugated teal quonset on stilts, linked by a covered corridor

  const LX = 0.62;
  const LZ = -0.2;
  const LEN = 0.6;
  const LR = 0.2;
  const LS = 0.14;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.04, F + 0.03, 0.04, WOODDP, LX + sx * (LEN / 2 - 0.04), G - 0.02 + (F + 0.03) / 2, LZ + sz * (LR - 0.04));
  box(LEN + 0.04, 0.03, 2 * LR + 0.04, WOODDP, LX, Y0 - 0.015, LZ);

  const arch: P2[] = [[LR, 0]];
  for (let a = 0; a <= 180; a += 20) arch.push([LR * Math.cos(a * D2R), LS + LR * Math.sin(a * D2R)]);
  arch.push([-LR, 0]);
  const LB = lit("#3f8a8a");
  const LD = lit("#2f6b72");
  const LSN = lit("#f8ece6", "#aeaadc", "#fff1d6");
  const LABP = paint((p, n) => {
    const t = n.y + 0.25 * (noise(p, 0.12, 6) - 0.5);
    if (t > 0.66) return LSN;
    if (Math.abs(n.x) < 0.5 && (((p.x / 0.04) % 1) + 1) % 1 < 0.18) return LD;
    return LB;
  });
  b.extrude(arch, { at: [LX, Y0, LZ], x: [0, 0, 1], y: [0, 1, 0], thickness: LEN, color: LABP });

  for (const px of [-0.18, 0, 0.18]) {
    const x = LX + px;
    const z = LZ + LR;
    b.part(new THREE.TorusGeometry(0.037, 0.008, 5, 12), STEELP, { at: [x, Y0 + 0.085, z + 0.002], flat: true });
    glow(b.part(new THREE.CircleGeometry(0.034, 12), "#ffffff", { at: [x, Y0 + 0.085, z + 0.003], dir: [0, 0, 1], axis: "z", texture: WINDOW }), 1.1);
  }
  // end door
  const LEX = LX + LEN / 2;
  box(0.012, 0.22, 0.13, CREAMP, LEX + 0.002, Y0 + 0.11, LZ);
  box(0.016, 0.2, 0.1, ORANGEP, LEX + 0.006, Y0 + 0.1, LZ);
  box(0.07, 0.02, 0.16, WOODP, LEX + 0.035, Y0 - 0.01, LZ);
  box(0.05, 0.035, 0.12, WOODDP, LEX + 0.09, G + 0.0175, LZ);
  glow(ball(0.012, "#ffc65a", LEX + 0.02, Y0 + 0.235, LZ), 1.6);
  // roof vents
  for (const vx of [-0.15, 0.1]) {
    cyl(0.02, 0.02, 0.07, 8, STEELP, LX + vx, Y0 + 0.335, LZ - 0.04);
    b.part(new THREE.ConeGeometry(0.032, 0.025, 8), IRONP, { at: [LX + vx, Y0 + 0.38, LZ - 0.04], flat: true });
  }
  // anemometer
  const AX = LX + 0.2;
  const AY = Y0 + 0.4;
  rod(v3(AX, Y0 + 0.33, LZ), v3(AX, AY, LZ), 0.004, STEELP);
  rod(v3(AX - 0.045, AY, LZ), v3(AX + 0.045, AY, LZ), 0.003, STEELP);
  rod(v3(AX, AY, LZ - 0.045), v3(AX, AY, LZ + 0.045), 0.003, STEELP);
  const cups: [number, number][] = [
    [-0.045, 0],
    [0.045, 0],
    [0, -0.045],
    [0, 0.045],
  ];
  cups.forEach(([dx, dz], i) =>
    b.part(new THREE.SphereGeometry(0.014, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), i === 0 ? REDP : WHITEP, {
      at: [AX + dx, AY - 0.004, LZ + dz],
      rotation: [dz === 0 ? 0 : 90 * Math.sign(dz) * 0 + 90, 0, dz === 0 ? 90 : 0],
      flat: true,
    }),
  );

  // corridor
  b.part(new THREE.BoxGeometry(0.29, 0.2, 0.15), TEAL_WALL, { at: [0.195, Y0 + 0.1, LZ] });
  box(0.3, 0.03, 0.17, SNOW, 0.195, Y0 + 0.215, LZ);
  box(0.29, 0.02, 0.15, WOODDP, 0.195, Y0 - 0.01, LZ);
  glow(plane(0.1, 0.048, DISPLAY, 0.195, Y0 + 0.12, LZ + 0.0755), 1.2);
  box(0.11, 0.058, 0.006, IRONP, 0.195, Y0 + 0.12, LZ + 0.073);

  // ==============================================================================================
  // Radio mast

  const MX = -1.25;
  const MZ = -0.55;
  const MH = 1.05;
  const NL = 6;
  const legPt = (i: number, y: number) => {
    const a = (90 + 120 * i) * D2R;
    const r = 0.08 * (1 - 0.72 * (y / MH));
    return v3(MX + r * Math.cos(a), G + y, MZ + r * Math.sin(a));
  };
  for (let k = 0; k < NL; k++) {
    const y0 = (MH * k) / NL;
    const y1 = (MH * (k + 1)) / NL;
    const col = k % 2 === 0 ? REDP : WHITEP;
    for (let i = 0; i < 3; i++) {
      rod(legPt(i, y0), legPt(i, y1), 0.006, col);
      rod(legPt(i, y1), legPt((i + 1) % 3, y1), 0.0035, STEELP);
      rod(legPt(i, y0), legPt((i + 1) % 3, y1), 0.0035, STEELP);
    }
  }
  for (let i = 0; i < 3; i++) rod(legPt(i, 0), legPt((i + 1) % 3, 0), 0.0035, STEELP);
  cyl(0.1, 0.12, 0.03, 6, IRONP, MX, G + 0.0, MZ);
  rod(v3(MX, G + MH, MZ), v3(MX, G + MH + 0.16, MZ), 0.003, STEELP);
  glow(ball(0.014, "#ff5040", MX, G + MH + 0.17, MZ), 2.2);
  // yagi
  rod(v3(MX, G + 0.86, MZ - 0.06), v3(MX, G + 0.86, MZ + 0.14), 0.004, STEELP);
  [0.12, 0.1, 0.085, 0.07].forEach((l, i) => rod(v3(MX - l / 2, G + 0.86, MZ + 0.0 + i * 0.045), v3(MX + l / 2, G + 0.86, MZ + i * 0.045), 0.0025, STEELP));
  // guy wires
  for (let i = 0; i < 3; i++) {
    const a = (90 + 120 * i) * D2R;
    const ax = MX + 0.4 * Math.cos(a);
    const az = MZ + 0.4 * Math.sin(a);
    rod(legPt(i, 0.7), v3(ax, G + 0.01, az), 0.0016, "#3a3340");
    cyl(0.01, 0.01, 0.03, 5, IRONP, ax, G + 0.0, az);
  }

  // ==============================================================================================
  // Satellite dish

  const dishAt = v3(1.32, G + 0.17, 0.22);
  const ax = v3(-0.3, 0.8, 0.5).normalize();
  const DR = 0.16;
  const DF = 0.12;
  cyl(0.07, 0.08, 0.02, 8, IRONP, 1.32, G + 0.005, 0.22);
  cyl(0.018, 0.026, 0.14, 8, STEELP, 1.32, G + 0.07, 0.22);
  rod(v3(1.32, G + 0.14, 0.22), dishAt.clone().addScaledVector(ax, -0.012), 0.012, STEELP);
  const dish: P2[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = (DR * i) / 8;
    dish.push([x, (x * x) / (4 * DF)]);
  }
  for (let i = 8; i >= 0; i--) {
    const x = (DR * i) / 8;
    dish.push([x, (x * x) / (4 * DF) - 0.008]);
  }
  b.lathe(dish, { at: dishAt, axis: [ax.x, ax.y, ax.z], segments: 14, color: lit("#ece7f0") });
  const focus = dishAt.clone().addScaledVector(ax, DF);
  rod(dishAt, focus, 0.004, STEELP);
  b.part(new THREE.CylinderGeometry(0.012, 0.008, 0.03, 8), IRONP, { at: focus, dir: [ax.x, ax.y, ax.z], flat: true });
  const upv = Math.abs(ax.y) > 0.9 ? v3(1, 0, 0) : v3(0, 1, 0);
  const Uv = new THREE.Vector3().crossVectors(ax, upv).normalize();
  const Vv = new THREE.Vector3().crossVectors(ax, Uv).normalize();
  for (let k = 0; k < 3; k++) {
    const a = k * 120 * D2R + 0.5;
    const rimPt = dishAt.clone().addScaledVector(Uv, DR * Math.cos(a)).addScaledVector(Vv, DR * Math.sin(a)).addScaledVector(ax, (DR * DR) / (4 * DF));
    rod(rimPt, focus, 0.003, STEELP);
  }

  // ==============================================================================================
  // Wind turbine

  const TX = 1.45;
  const TZ = -0.7;
  b.part(new THREE.CylinderGeometry(0.012, 0.024, 0.8, 8), WHITEP, { at: [TX, G + 0.4, TZ], flat: true });
  box(0.04, 0.036, 0.1, WHITEP, TX, G + 0.815, TZ + 0.0);
  const hub = v3(TX, G + 0.815, TZ + 0.07);
  b.part(new THREE.SphereGeometry(0.02, 7, 5), REDP, { at: hub, flat: true });
  b.part(new THREE.ConeGeometry(0.018, 0.04, 7), REDP, { at: [hub.x, hub.y, hub.z + 0.03], rotation: [90, 0, 0], flat: true });
  const bladeOutline: P2[] = [
    [0.02, -0.014],
    [0.1, -0.026],
    [0.3, -0.007],
    [0.3, 0.005],
    [0.1, 0.014],
    [0.02, 0.014],
  ];
  const BLADEP = paint((_p, _n, s) => (s[0] > 0.23 ? REDP : WHITEP));
  [90, 210, 330].forEach((deg) => {
    const a = deg * D2R;
    b.extrude(bladeOutline, {
      at: hub,
      x: [Math.cos(a), Math.sin(a), 0],
      y: [-Math.sin(a), Math.cos(a), 0],
      thickness: 0.008,
      color: BLADEP,
    });
  });

  // ==============================================================================================
  // Solar array

  const PANEL = paint((_p, _n, s) => {
    const u = (((s[0] * 6) % 1) + 1) % 1;
    const v = (((s[1] * 4) % 1) + 1) % 1;
    if (u < 0.05 || v < 0.06) return "#8fa8dc";
    return mix("#27407e", "#4a68b0", s[1]);
  });
  const phi = 50;
  [0.85, 1.15, 1.45].forEach((px) => {
    const cy = G + 0.04 + 0.1 * Math.sin(phi * D2R);
    const cz = 0.72;
    box(0.3, 0.008, 0.22, STEELP, px, cy - 0.006, cz, { rotation: [phi, 0, 0] });
    b.part(new THREE.BoxGeometry(0.28, 0.01, 0.2), PANEL, { at: [px, cy, cz], rotation: [phi, 0, 0] });
    for (const s of [-1, 1]) {
      rod(v3(px + s * 0.12, cy + 0.1 * Math.sin(phi * D2R), cz - 0.1 * Math.cos(phi * D2R)), v3(px + s * 0.12, G, cz - 0.12), 0.005, STEELP);
      rod(v3(px + s * 0.12, cy - 0.1 * Math.sin(phi * D2R), cz + 0.1 * Math.cos(phi * D2R)), v3(px + s * 0.12, G, cz + 0.11), 0.005, STEELP);
    }
  });

  // ==============================================================================================
  // Weather screen (Stevenson)

  const SCX = 0.2;
  const SCZ = 0.62;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) rod(v3(SCX + sx * 0.045, G - 0.01, SCZ + sz * 0.035), v3(SCX + sx * 0.045, G + 0.1, SCZ + sz * 0.035), 0.006, WOODP);
  b.part(new THREE.BoxGeometry(0.12, 0.11, 0.09), siding("#f1ece8", "#9d94b8", 0.012), { at: [SCX, G + 0.155, SCZ] });
  box(0.14, 0.014, 0.11, WHITEP, SCX, G + 0.222, SCZ);
  b.part(new THREE.BoxGeometry(0.13, 0.02, 0.1), SNOW, { at: [SCX, G + 0.24, SCZ], flat: true });

  // ==============================================================================================
  // Researcher in an orange parka

  const RS = rig(-0.15, G, 0.75, 30);
  const PANTS = "#38405e";
  const BOOT = "#2b2230";
  for (const s of [-1, 1]) {
    RS.put(new THREE.BoxGeometry(0.03, 0.026, 0.055), BOOT, s * 0.02, 0.013, 0.008);
    b.capsule(RS.P(s * 0.02, 0.03, 0), RS.P(s * 0.02, 0.1, 0), 0.017, PANTS, { sides: 6 });
  }
  RS.put(new THREE.CylinderGeometry(0.036, 0.05, 0.1, 8), ORANGEP, 0, 0.13, 0, [0, 0, 0], { scale: [1, 1, 0.78] });
  b.capsule(RS.P(0.05, 0.165, 0), RS.P(0.045, 0.125, 0.065), 0.016, ORANGEP, { sides: 6 });
  b.capsule(RS.P(-0.05, 0.165, 0), RS.P(-0.058, 0.105, 0.03), 0.016, ORANGEP, { sides: 6 });
  RS.put(new THREE.SphereGeometry(0.016, 6, 4), "#4a3040", 0.045, 0.122, 0.072);
  RS.put(new THREE.SphereGeometry(0.016, 6, 4), "#4a3040", -0.058, 0.1, 0.034);
  RS.put(new THREE.BoxGeometry(0.052, 0.003, 0.07), "#efe3c8", 0.045, 0.13, 0.095, [-35, 0, 0]);
  RS.put(new THREE.BoxGeometry(0.075, 0.1, 0.04), TEALDP, 0, 0.13, -0.05);
  RS.put(new THREE.TorusGeometry(0.034, 0.011, 5, 10), lit("#1f7f86"), 0, 0.18, 0.0, [90, 0, 0]);
  RS.put(new THREE.SphereGeometry(0.043, 8, 6), ORANGEP, 0, 0.222, -0.006);
  RS.put(new THREE.SphereGeometry(0.03, 7, 5), "#e9b08c", 0, 0.22, 0.016);
  RS.put(new THREE.TorusGeometry(0.033, 0.01, 5, 10), "#f1dcc4", 0, 0.22, 0.03);
  for (const s of [-1, 1]) RS.put(new THREE.SphereGeometry(0.004, 4, 3), "#2a2234", s * 0.011, 0.224, 0.043);
  RS.put(new THREE.BoxGeometry(0.044, 0.012, 0.01), "#2a2234", 0, 0.252, 0.03, [-10, 0, 0]);

  // ==============================================================================================
  // Snowmobile and sled

  const SM = rig(-0.82, G, 0.62, -35);
  SM.put(new THREE.BoxGeometry(0.06, 0.056, 0.2), "#2a2531", 0, 0.03, -0.07);
  for (const z of [-0.17, 0.03]) SM.put(new THREE.CylinderGeometry(0.028, 0.028, 0.062, 8), "#2a2531", 0, 0.03, z, [0, 0, 90]);
  for (let i = 0; i < 4; i++) SM.put(new THREE.BoxGeometry(0.064, 0.058, 0.008), "#3c3446", 0, 0.03, -0.14 + i * 0.045);
  const SMBODY = paint((_p, _n, s) => {
    const d = ((((s[1] % 360) + 540) % 360) - 180);
    return Math.abs(d) < 16 ? CREAMP : MUSTARDP;
  });
  b.loft(
    [
      { at: SM.P(0, 0.08, -0.16), w: 0.075, h: 0.05 },
      { at: SM.P(0, 0.085, -0.04), w: 0.095, h: 0.07 },
      { at: SM.P(0, 0.09, 0.07), w: 0.1, h: 0.075 },
      { at: SM.P(0, 0.085, 0.17), w: 0.06, h: 0.045 },
    ],
    { color: SMBODY, detail: 0.7 },
  );
  SM.put(new THREE.BoxGeometry(0.07, 0.022, 0.13), "#2b2330", 0, 0.13, -0.06);
  SM.put(new THREE.BoxGeometry(0.075, 0.065, 0.004), "#bfe6f2", 0, 0.165, 0.085, [-30, 0, 0]);
  rod(SM.P(0, 0.1, 0.07), SM.P(0, 0.148, 0.05), 0.005, IRONP);
  rod(SM.P(-0.055, 0.148, 0.05), SM.P(0.055, 0.148, 0.05), 0.005, IRONP);
  for (const s of [-1, 1]) {
    SM.put(new THREE.SphereGeometry(0.008, 5, 4), "#2b2330", s * 0.058, 0.148, 0.05);
    SM.put(new THREE.BoxGeometry(0.026, 0.01, 0.17), "#2b2330", s * 0.065, 0.012, 0.14);
    SM.put(new THREE.BoxGeometry(0.026, 0.01, 0.05), "#2b2330", s * 0.065, 0.024, 0.247, [-28, 0, 0]);
    rod(SM.P(s * 0.045, 0.08, 0.1), SM.P(s * 0.065, 0.02, 0.14), 0.004, STEELP);
  }
  glow(SM.put(new THREE.SphereGeometry(0.014, 7, 5), "#fff0b0", 0, 0.092, 0.185), 1.8);
  glow(SM.put(new THREE.BoxGeometry(0.03, 0.01, 0.006), "#ff4a3a", 0, 0.1, -0.188), 1.5);
  // sled
  for (const s of [-1, 1]) SM.put(new THREE.BoxGeometry(0.012, 0.014, 0.22), WOODDP, s * 0.05, 0.012, -0.36);
  SM.put(new THREE.BoxGeometry(0.12, 0.012, 0.2), WOODP, 0, 0.028, -0.36);
  rod(SM.P(0, 0.04, -0.17), SM.P(0, 0.035, -0.255), 0.004, IRONP);
  SM.put(new THREE.BoxGeometry(0.09, 0.05, 0.07), CRATEP_LIKE(), 0, 0.059, -0.31);
  SM.put(new THREE.CylinderGeometry(0.026, 0.026, 0.1, 8), ORANGEP, 0, 0.072, -0.405, [90, 0, 0]);
  rod(SM.P(-0.05, 0.034, -0.46), SM.P(0.05, 0.065, -0.3), 0.002, "#e8d6b0");

  function CRATEP_LIKE() {
    return CRATEP;
  }

  // ==============================================================================================
  // Fuel drums

  const drum = (x: number, z: number, c: ColorInput) => {
    const d = cyl(0.04, 0.04, 0.11, 12, c, x, G + 0.055, z);
    for (const y of [0.03, 0.08]) cyl(0.0425, 0.0425, 0.008, 12, IRONP, x, G + y, z);
    cyl(0.034, 0.034, 0.006, 12, STEELP, x, G + 0.112, z);
    ball(0.008, IRONP, x + 0.014, G + 0.118, z);
    return d;
  };
  const d1 = drum(-0.95, 0.02, ORANGEP);
  drum(-0.99, 0.12, lit("#3b6fb0"));
  drum(-0.88, 0.12, lit("#c9442c"));
  b.decal(d1, LABEL, { at: [-0.95, G + 0.06, 0.06], dir: [0, 0, 1], size: [0.05, 0.05] });

  // crates
  const crate = (w: number, h: number, d: number, x: number, y: number, z: number, ry: number, stencil: boolean) => {
    box(w, h, d, CRATEP, x, y, z, { rotation: [0, ry, 0] });
    if (stencil) {
      const r = ry * D2R;
      plane(w * 0.8, h * 0.8 * 0.6, STENCIL, x + Math.sin(r) * (d / 2 + 0.002), y, z + Math.cos(r) * (d / 2 + 0.002), [Math.sin(r), 0, Math.cos(r)]);
    }
  };
  crate(0.1, 0.07, 0.08, -1.3, G + 0.035, 0.32, 0, true);
  crate(0.08, 0.06, 0.07, -1.17, G + 0.03, 0.36, -8, true);
  crate(0.08, 0.055, 0.07, -1.28, G + 0.0975, 0.32, 12, true);

  // ==============================================================================================
  // Ice drill and core tray

  const DRX = 0.45;
  const DRZ = 0.95;
  cyl(0.05, 0.05, 0.006, 12, "#16253f", DRX, G + 0.003, DRZ);
  b.part(new THREE.TorusGeometry(0.052, 0.008, 5, 12), ICELP, { at: [DRX, G + 0.008, DRZ], rotation: [90, 0, 0], flat: true });
  for (let i = 0; i < 3; i++) {
    const a = (90 + 120 * i) * D2R;
    rod(v3(DRX + 0.1 * Math.cos(a), G, DRZ + 0.1 * Math.sin(a)), v3(DRX, G + 0.46, DRZ), 0.006, WOODP);
  }
  box(0.04, 0.03, 0.04, IRONP, DRX, G + 0.46, DRZ);
  rod(v3(DRX, G + 0.45, DRZ), v3(DRX, G + 0.03, DRZ), 0.003, "#2a2234");
  const AUG = paint((p) => (((p.y / 0.025) % 1) + 1) % 1 < 0.5 ? ORANGEP : lit("#c9442c"));
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), AUG, { at: [DRX, G + 0.22, DRZ], flat: true });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 6), STEELP, { at: [DRX, G + 0.092, DRZ], rotation: [180, 0, 0], flat: true });
  box(0.2, 0.012, 0.06, WOODP, 0.2, G + 0.006, 1.02);
  for (let i = 0; i < 5; i++) b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), ICELP, { at: [0.2, G + 0.02, 1.0 + i * 0.01 + 0.01], rotation: [0, 0, 90], flat: true });

  // ==============================================================================================
  // Trees and rocks

  const tree = (x: number, z: number, s: number) => {
    cyl(0.02 * s, 0.028 * s, 0.1 * s, 6, WOODDP, x, G + 0.04 * s, z);
    const tiers: [number, number, number][] = [
      [0.19, 0.22, 0.07],
      [0.155, 0.2, 0.2],
      [0.12, 0.19, 0.33],
      [0.08, 0.17, 0.45],
    ];
    tiers.forEach(([r, h, y], i) => {
      b.part(new THREE.ConeGeometry(r * s, h * s, 7), PINEP, { at: [x, G + (y + h / 2) * s, z], rotation: [0, 17 * i, 0], flat: true });
      const k = 0.62;
      b.part(new THREE.ConeGeometry(r * s * k * 1.07, h * s * k, 7), SNOW, {
        at: [x, G + (y + h - (h * k) / 2) * s + 0.003 * s, z],
        rotation: [0, 17 * i, 0],
        flat: true,
      });
    });
  };
  for (const [tx, tz, ts] of treeSpots) tree(tx, tz, ts);

  const rock = (x: number, z: number, r: number, ry: number) => {
    b.part(new THREE.IcosahedronGeometry(r, 0), ROCKP, { at: [x, G + r * 0.35, z], scale: [1.2, 0.8, 1], rotation: [0, ry, 0], flat: true });
    b.part(new THREE.IcosahedronGeometry(r * 0.8, 0), SNOW, { at: [x, G + r * 1.05, z], scale: [1.15, 0.35, 0.95], rotation: [0, ry, 0], flat: true });
  };
  rock(-1.55, 0.6, 0.1, 20);
  rock(-1.45, 0.72, 0.06, 70);
  rock(1.62, -0.25, 0.09, 40);
  rock(0.05, -0.85, 0.07, 10);

  // ==============================================================================================
  // Light pools, footprints, tracks

  const pool = (x: number, z0: number, w0: number, len: number, w1: number) =>
    slab(
      [
        [x - w0 / 2, z0],
        [x + w0 / 2, z0],
        [x + w1 / 2, z0 + len],
        [x - w1 / 2, z0 + len],
      ],
      G + 0.0075,
      0.005,
      "#f9d5a0",
    );
  pool(HX, HFRONT + 0.01, 0.13, 0.22, 0.22);
  pool(HX - 0.24, HFRONT + 0.01, 0.13, 0.22, 0.22);
  pool(DX, HFRONT + 0.2, 0.12, 0.2, 0.2);

  const trail = catmull(
    [
      [DX, 0.3],
      [DX - 0.08, 0.45],
      [-0.12, 0.54],
      [-0.15, 0.68],
    ].map(([x, z]) => v3(x, G, z)),
  );
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const pos = trail.at(t);
    const tan = trail.tangentAt(t);
    const side = i % 2 ? 1 : -1;
    const len = Math.hypot(tan.x, tan.z) || 1;
    const px = pos.x + (tan.z / len) * 0.016 * side;
    const pz = pos.z - (tan.x / len) * 0.016 * side;
    cyl(0.011, 0.011, 0.006, 6, "#b7b1dc", px, G + 0.009, pz, {
      rotation: [0, Math.atan2(tan.x, tan.z) / D2R, 0],
      scale: [0.8, 1, 1.7],
    });
  }
  // sled track from the snowmobile toward the lab
  const sledTail = SM.P(0, 0, -0.5);
  const hitchPath = catmull([sledTail, v3(-0.55, G, 0.45), v3(-0.45, G, 0.62), v3(-0.38, G, 0.9)]);
  for (const off of [-0.025, 0.025]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const p = hitchPath.at(t);
      const tg = hitchPath.tangentAt(t);
      const l = Math.hypot(tg.x, tg.z) || 1;
      pts.push(v3(p.x + (tg.z / l) * off, G + 0.0085, p.z - (tg.x / l) * off));
    }
    b.sweep(catmull(pts), () => [0.011, 0.0018], { section: "box", caps: "flat", color: "#b7b1dc" });
  }

  return b.root;
}

// ------------------------------------------------------------------------------------------------
// Crate paint (uses uv coordinates of box faces)

const CR_D = lit("#563024");
const CR_L = lit("#b98a58");
const CRATEP = paint((_p, _n, s) => {
  const e = s[0] < 0.09 || s[0] > 0.91 || s[1] < 0.09 || s[1] > 0.91 || Math.abs(s[0] - s[1]) < 0.05;
  return e ? CR_D : CR_L;
});
```