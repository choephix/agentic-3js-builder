import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Helix-9 Riot Interceptor",
  description:
    "Corporate riot-control armoured interceptor with a roof water cannon, tank, plow bumper and neon light bars, in Cyberpunk 2077 style.",
};

// ---------------------------------------------------------------- palette
const CYAN = "#19f2ff";
const MAG = "#ff2bd6";
const RED = "#ff2a3d";
const YEL = "#ffd400";
const AMBER = "#ffa51f";
const WHITE = "#d9dde3";
const CHAR = "#1c1f26";
const MID = "#3a3f4a";
const BLACK = "#0d0e12";
const STEEL = "#7b8494";
const TIRE = "#14151a";
const TANK = "#8fb4c8";

// ---------------------------------------------------------------- textures
const SIDE = svg(
  `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
  <polygon points="60,12 100,34 100,82 60,104 20,82 20,34" fill="${RED}" stroke="#101216" stroke-width="5"/>
  <text x="60" y="80" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="62" fill="#fff">9</text>
  <text x="118" y="64" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="46" fill="#14161c">RIOT CONTROL</text>
  <text x="120" y="92" font-family="Arial, sans-serif" font-weight="bold" font-size="15" letter-spacing="2" fill="#3a3f4a">HELIX-9 · CROWD SUPPRESSION UNIT</text>
  <rect x="118" y="14" width="250" height="5" fill="#00c8d8"/>
  <polygon points="372,20 392,20 376,104 356,104" fill="${MAG}"/>
  <polygon points="344,20 358,20 342,104 328,104" fill="#00c8d8"/>
  <g fill="#14161c"><rect x="120" y="100" width="3" height="12"/><rect x="127" y="100" width="6" height="12"/><rect x="137" y="100" width="2" height="12"/><rect x="143" y="100" width="5" height="12"/><rect x="152" y="100" width="3" height="12"/><rect x="160" y="100" width="7" height="12"/></g>
</svg>`,
  { size: 768 },
);

const WIND = svg(
  `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16394d"/><stop offset="1" stop-color="#050b12"/></linearGradient></defs>
  <rect width="200" height="90" rx="6" fill="url(#g)"/>
  <rect width="200" height="12" fill="#ffb21f" opacity="0.45"/>
  <polygon points="30,0 60,0 20,90 -10,90" fill="#fff" opacity="0.09"/>
  <polygon points="90,0 105,0 65,90 50,90" fill="#fff" opacity="0.06"/>
  <polygon points="150,0 190,0 150,90 110,90" fill="#19f2ff" opacity="0.07"/>
  <text x="12" y="82" font-family="Courier New, monospace" font-size="8" fill="#19f2ff" opacity="0.75">TGT LOCK 0.92 // CROWD DENS 7.4</text>
  <rect x="150" y="68" width="40" height="14" fill="none" stroke="#ff2a3d" stroke-width="1" opacity="0.8"/>
</svg>`,
  { size: 512 },
);

const SIDEWIN = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#143247"/><stop offset="1" stop-color="#050a10"/></linearGradient></defs>
  <rect width="100" height="50" rx="5" fill="url(#g)" stroke="#0a0b0e" stroke-width="3"/>
  <polygon points="20,2 38,2 22,48 4,48" fill="#fff" opacity="0.1"/>
  <polygon points="52,2 60,2 44,48 36,48" fill="#19f2ff" opacity="0.12"/>
</svg>`,
  { size: 256 },
);

const REAR = svg(
  `<svg viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="90" fill="#120a02"/>
  <rect x="4" y="4" width="292" height="82" fill="none" stroke="${AMBER}" stroke-width="4"/>
  <text x="150" y="48" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="38" fill="${AMBER}">DISPERSE</text>
  <text x="150" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" letter-spacing="6" fill="#ff5a2a">STAND BACK 50M</text>
</svg>`,
  { size: 512 },
);

const DROP = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#10161c" stroke="${CYAN}" stroke-width="4"/>
  <path d="M50 14 C66 38 76 50 76 62 A26 26 0 0 1 24 62 C24 50 34 38 50 14Z" fill="${CYAN}"/>
  <path d="M38 58 C38 66 44 72 52 72" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

const PLATE = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="40" rx="4" fill="#e9e4c8" stroke="#101216" stroke-width="3"/>
  <rect x="3" y="3" width="94" height="8" fill="#0a5fa8"/>
  <text x="50" y="34" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="22" fill="#14161c">H9-07</text>
</svg>`,
  { size: 192 },
);

const WARN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,6 96,90 4,90" fill="${YEL}" stroke="#101216" stroke-width="6" stroke-linejoin="round"/>
  <path d="M50 32 C60 48 64 54 64 62 A14 14 0 0 1 36 62 C36 54 40 48 50 32Z" fill="#101216"/>
  <rect x="30" y="76" width="40" height="4" fill="#101216"/>
</svg>`,
  { size: 192 },
);

const HEAD = svg(
  `<svg viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bff8ff"/><stop offset="1" stop-color="${CYAN}"/></linearGradient></defs>
  <polygon points="0,4 100,0 94,24 6,20" fill="#06161a"/>
  <polygon points="6,8 94,5 91,17 9,16" fill="url(#g)"/>
  <circle cx="14" cy="12" r="4" fill="#fff"/>
</svg>`,
  { size: 256 },
);

const LOGO = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="${RED}" stroke="#101216" stroke-width="5"/>
  <polygon points="50,18 80,34 80,66 50,82 20,66 20,34" fill="none" stroke="#fff" stroke-width="3"/>
  <text x="50" y="66" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="44" fill="#fff">9</text>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- paints
const hull = paint((p, n) => {
  const nz = noise(p, 0.3, 3);
  let c = p.y < 1.0 ? mix("#15171d", "#2a2e38", nz) : mix("#c9ced6", "#eef1f5", nz * 0.7 + 0.15 * n.y);
  if (Math.abs(n.x) > 0.6) {
    const f = (((p.z / 0.85) % 1) + 1) % 1;
    if (f < 0.012) c = mix(c, BLACK, 0.8);
  }
  const dirt = smoothstep(1.2, 0.5, p.y) * (0.25 + 0.4 * noise(p, 0.15, 9));
  c = mix(c, "#2a251e", dirt * 0.5);
  if (p.y > 1.0 && p.y < 1.14 && Math.abs(n.x) > 0.6) c = mix(c, CHAR, 0.85);
  return c;
});

const hazard = paint((_p, n, s) => {
  if (s[1] < 0.55 && n.z > 0.5) return Math.floor((s[0] + s[1]) / 0.12) % 2 === 0 ? YEL : BLACK;
  return mix(MID, "#59606e", noise(new THREE.Vector3(s[0], s[1], 0), 0.2, 4));
});

const armour = paint((p) => mix("#23262e", "#3a3f4a", noise(p, 0.2, 5)));

// ---------------------------------------------------------------- builder & helpers
const b = createBuilder({ name: "riot_interceptor" });

type Opt = { rotation?: [number, number, number]; texture?: THREE.Texture };
const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: Opt = {}) =>
  b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
const gbox = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, k = 1, o: Opt = {}) =>
  glow(box(w, h, d, color, x, y, z, o), k);
const cyl = (r: number, len: number, color: any, x: number, y: number, z: number, rot: [number, number, number], seg = 10) =>
  b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], rotation: rot });
const plane = (
  tex: THREE.Texture,
  w: number,
  h: number,
  at: [number, number, number],
  dir: [number, number, number],
  up?: [number, number, number],
) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });

// ---------------------------------------------------------------- hull
b.extrude(
  [
    [-2.62, 0.5],
    [2.55, 0.5],
    [2.66, 0.9],
    [2.5, 1.25],
    [1.5, 1.45],
    [0.9, 2.05],
    [-1.6, 2.1],
    [-2.55, 2.02],
    [-2.66, 1.0],
  ],
  { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.05, color: hull },
);
// underbody & axles
box(1.8, 0.2, 5.2, BLACK, 0, 0.45, 0);
for (const z of [1.65, -1.65]) cyl(0.08, 2.4, STEEL, 0, 0.55, z, [0, 0, 90], 8);

// windshield (sloped glass)
{
  const th = (Math.atan2(0.55, 0.6) * 180) / Math.PI;
  const nrm = new THREE.Vector3(0, 0.74, 0.67).normalize();
  plane(WIND, 1.78, 0.82, [0, 1.775 + nrm.y * 0.012, 1.2 + nrm.z * 0.012], [nrm.x, nrm.y, nrm.z]);
  void th;
  // armoured frame
  box(1.9, 0.07, 0.1, CHAR, 0, 2.06, 0.9);
  for (const s of [1, -1]) {
    b.rod([s * 0.93, 1.5, 1.5], [s * 0.93, 2.05, 0.9], 0.035, CHAR);
  }
  box(1.9, 0.06, 0.1, CHAR, 0, 1.47, 1.5, { rotation: [-42, 0, 0] });
}

// hood details
for (let i = 0; i < 4; i++) box(0.5, 0.012, 0.05, BLACK, 0, 1.4 - i * 0.01, 1.7 + i * 0.18, { rotation: [-10, 0, 0] });
plane(LOGO, 0.3, 0.3, [0, 1.17, 2.56], [0, 0.3, 1]);
for (const s of [1, -1]) {
  plane(HEAD, 0.6, 0.15, [s * 0.74, 1.1, 2.578], [0, 0.3, 1]);
  glow(
    b.part(new THREE.PlaneGeometry(0.6, 0.15), "#ffffff", {
      at: [s * 0.74, 1.1, 2.58],
      dir: [0, 0.3, 1],
      axis: "z",
      texture: HEAD,
    }),
    1.6,
  );
  gbox(0.5, 0.04, 0.04, CYAN, s * 0.74, 1.27, 2.52, 1.4, { rotation: [-16, 0, 0] });
}
for (let i = 0; i < 3; i++) gbox(0.3, 0.025, 0.03, RED, 0, 1.05 + i * 0.05, 2.585 - i * 0.015, 1.2);

// plow bumper
b.extrude(
  [
    [-1.15, 0.28],
    [1.15, 0.28],
    [1.22, 0.8],
    [1.0, 1.0],
    [-1.0, 1.0],
    [-1.22, 0.8],
  ],
  { at: [0, 0, 2.78], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.35, bevel: 0.03, color: hazard },
);
gbox(1.9, 0.05, 0.02, RED, 0, 0.88, 2.962, 1.6);
plane(PLATE, 0.5, 0.2, [0, 0.55, 2.962], [0, 0, 1]);
for (const s of [1, -1]) {
  box(0.12, 0.5, 0.5, MID, s * 0.5, 0.45, 2.6);
  box(0.1, 0.1, 0.3, STEEL, s * 1.1, 0.38, 2.9);
}

// ---------------------------------------------------------------- wheels & fenders
const hubAngles = [0, 60, 120, 180, 240, 300];
for (const s of [1, -1]) {
  for (const z of [1.65, -1.65]) {
    const x = s * 1.12;
    cyl(0.55, 0.45, TIRE, x, 0.55, z, [0, 0, 90], 14);
    cyl(0.4, 0.04, MID, s * 1.35, 0.55, z, [0, 0, 90], 14);
    cyl(0.27, 0.06, STEEL, s * 1.36, 0.55, z, [0, 0, 90], 12);
    cyl(0.08, 0.09, CHAR, s * 1.38, 0.55, z, [0, 0, 90], 8);
    glow(
      b.part(new THREE.TorusGeometry(0.34, 0.022, 4, 20), MAG, {
        at: [s * 1.365, 0.55, z],
        rotation: [0, 90, 0],
      }),
      1.5,
    );
    for (const a of hubAngles) {
      const r = (a * Math.PI) / 180;
      cyl(0.022, 0.05, BLACK, s * 1.395, 0.55 + Math.cos(r) * 0.17, z + Math.sin(r) * 0.17, [0, 0, 90], 6);
    }
    box(0.55, 0.12, 1.4, armour, s * 1.12, 1.12, z);
    box(0.04, 0.3, 1.3, armour, s * 1.385, 1.0, z);
    box(0.5, 0.05, 1.42, BLACK, s * 1.12, 1.19, z);
  }
  // side trims, sill & underglow
  box(0.1, 0.16, 3.4, CHAR, s * 1.03, 0.58, 0);
  gbox(0.04, 0.05, 3.3, CYAN, s * 1.06, 0.5, 0, 1.6);
  gbox(0.02, 0.04, 4.7, MAG, s * 1.006, 1.0, 0, 1.4);
  gbox(0.02, 0.025, 4.7, CYAN, s * 1.006, 0.96, 0, 1.4);
  // side livery & window
  plane(SIDE, 2.1, 0.63, [s * 1.01, 1.38, -1.2], [s, 0, 0]);
  plane(SIDEWIN, 0.72, 0.36, [s * 1.01, 1.66, 0.36], [s, 0, 0]);
  for (const z of [0.1, 0.27, 0.43, 0.6]) box(0.025, 0.36, 0.02, BLACK, s * 1.02, 1.66, z);
  box(0.02, 0.9, 0.015, BLACK, s * 1.006, 1.55, 0.82);
  box(0.02, 0.9, 0.015, BLACK, s * 1.006, 1.55, -0.18);
  box(0.03, 0.04, 0.2, STEEL, s * 1.015, 1.3, 0.55);
  // warning decal
  plane(WARN, 0.26, 0.26, [s * 1.01, 1.48, 1.12], [s, 0, 0]);
  // mirrors
  b.rod([s * 1.0, 1.75, 1.1], [s * 1.2, 1.8, 1.1], 0.02, CHAR);
  box(0.1, 0.22, 0.3, CHAR, s * 1.24, 1.8, 1.08);
  gbox(0.02, 0.03, 0.12, AMBER, s * 1.295, 1.72, 1.08, 1.6);
  // spotlight pod
  box(0.12, 0.12, 0.2, CHAR, s * 0.97, 1.56, 1.46, { rotation: [0, 0, 0] });
  gbox(0.1, 0.1, 0.03, "#eaffff", s * 0.97, 1.56, 1.575, 1.8);
  // rear side vents
  for (let i = 0; i < 4; i++) box(0.02, 0.03, 0.4, BLACK, s * 1.006, 1.75 - i * 0.07, -2.3);
}

// ---------------------------------------------------------------- roof: light bar, cannon, tank
box(1.76, 0.08, 0.3, BLACK, 0, 2.1, 0.55);
const barCols = [CYAN, CYAN, RED, RED, MAG, MAG, CYAN, CYAN];
barCols.forEach((c, i) => gbox(0.2, 0.1, 0.25, c, -0.7 + i * 0.2, 2.19, 0.55, 1.8));
for (const s of [1, -1]) {
  box(0.06, 0.16, 0.34, CHAR, s * 0.92, 2.16, 0.55);
  gbox(0.05, 0.06, 0.2, AMBER, s * 0.96, 2.18, 0.55, 1.5);
}
// roof ribs
for (const z of [-0.75, -2.1]) box(1.9, 0.03, 0.08, CHAR, 0, 2.1, z);
// tank
box(1.5, 0.1, 0.55, CHAR, 0, 2.13, -1.45);
cyl(0.34, 1.5, TANK, 0, 2.46, -1.45, [0, 0, 90], 12);
for (const x of [-0.5, 0.5]) cyl(0.35, 0.07, MID, x, 2.46, -1.45, [0, 0, 90], 12);
gbox(0.9, 0.07, 0.03, CYAN, 0, 2.46, -1.115, 1.6);
for (const s of [1, -1]) {
  plane(DROP, 0.4, 0.4, [s * 0.756, 2.46, -1.45], [s, 0, 0]);
  box(0.06, 0.15, 0.15, STEEL, s * 0.78, 2.46, -1.45);
}
// hose
b.sweep(
  [
    [0.15, 2.5, -1.15],
    [0.3, 2.4, -0.9],
    [0.2, 2.4, -0.55],
    [0.05, 2.55, -0.4],
  ],
  0.035,
  { color: BLACK, sides: 6 },
);
// turret
b.lathe(
  [
    [0, 0],
    [0.34, 0],
    [0.34, 0.1],
    [0.27, 0.2],
    [0, 0.22],
  ],
  { at: [0, 2.12, -0.35], color: MID, segments: 12 },
);
cyl(0.36, 0.05, MAG, 0, 2.14, -0.35, [0, 0, 0], 12);
glow(b.part(new THREE.TorusGeometry(0.33, 0.015, 4, 16), MAG, { at: [0, 2.17, -0.35], rotation: [90, 0, 0] }), 1.5);
for (const s of [1, -1]) box(0.08, 0.4, 0.34, CHAR, s * 0.19, 2.5, -0.38);
{
  const dir = new THREE.Vector3(0, 0.16, 1).normalize();
  const A = new THREE.Vector3(0, 2.52, -0.55);
  const L = 1.9;
  const T = A.clone().addScaledVector(dir, L);
  b.rod(A.toArray() as [number, number, number], T.toArray() as [number, number, number], [0.13, 0.1], WHITE);
  for (const t of [0.25, 0.55, 0.8]) {
    const P = A.clone().addScaledVector(dir, L * t);
    b.part(new THREE.CylinderGeometry(0.14 - t * 0.03, 0.14 - t * 0.03, 0.06, 10), RED, {
      at: P.toArray() as [number, number, number],
      dir: dir.toArray() as [number, number, number],
    });
  }
  // cylinder pivot
  cyl(0.1, 0.5, STEEL, 0, 2.52, -0.38, [0, 0, 90], 8);
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.15, 0.12],
      [0.17, 0.22],
      [0.12, 0.22],
      [0, 0.2],
    ],
    { at: T.toArray() as [number, number, number], axis: dir.toArray() as [number, number, number], color: CHAR, segments: 10 },
  );
  const tip = T.clone().addScaledVector(dir, 0.215);
  glow(
    b.part(new THREE.CircleGeometry(0.1, 10), CYAN, {
      at: tip.toArray() as [number, number, number],
      dir: dir.toArray() as [number, number, number],
      axis: "z",
    }),
    2,
  );
  // top sight
  gbox(0.05, 0.05, 0.18, RED, 0, 2.66, 0.1, 1.5, { rotation: [9, 0, 0] });
}
// antennas, camera dome
for (const s of [1, -1]) {
  b.rod([s * 0.88, 2.1, -2.25], [s * 0.88, 2.95, -2.25], [0.02, 0.008], CHAR);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [s * 0.88, 2.96, -2.25] }), 2);
}
b.part(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), BLACK, { at: [0, 2.1, -2.2] });
glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), CYAN, { at: [0, 2.2, -2.08] }), 2);

// ---------------------------------------------------------------- rear
glow(
  b.part(new THREE.PlaneGeometry(1.5, 0.45), "#ffffff", {
    at: [0, 1.55, -2.62],
    dir: [0, 0, -1],
    axis: "z",
    texture: REAR,
  }),
  1.5,
);
box(0.02, 1.1, 0.03, BLACK, 0, 1.25, -2.64);
plane(WARN, 0.22, 0.22, [0.65, 1.05, -2.66], [0, 0, -1]);
plane(PLATE, 0.46, 0.18, [-0.65, 1.05, -2.66], [0, 0, -1]);
box(2.3, 0.3, 0.28, CHAR, 0, 0.62, -2.72);
box(2.3, 0.06, 0.3, YEL, 0, 0.8, -2.72);
for (const s of [1, -1]) {
  gbox(0.55, 0.12, 0.06, RED, s * 0.72, 0.95, -2.67, 1.8);
  gbox(0.2, 0.08, 0.06, AMBER, s * 0.95, 1.15, -2.66, 1.3);
  cyl(0.06, 0.3, STEEL, s * 0.45, 0.42, -2.75, [90, 0, 0], 8);
  b.rod([s * 1.0, 1.45, -2.66], [s * 1.0, 1.9, -2.66], 0.025, STEEL);
  box(0.06, 0.1, 0.5, CHAR, s * 1.0, 0.45, -2.5);
}
gbox(1.9, 0.04, 0.04, MAG, 0, 0.78, -2.88, 1.5);

b.root.userData.dimensions = "5.9m x 2.8m x 3.0m";
export default function build() {
  return b.root;
}
