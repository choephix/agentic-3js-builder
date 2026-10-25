import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot Interceptor VX-7",
  description:
    "Corporate riot-control interceptor truck with a roof water cannon, rear water tank and neon light bars, in a Cyberpunk 2077 style.",
};

// ---------- palette ----------
const MAGENTA = "#ff2a9d";
const CYAN = "#19f3ff";
const YELLOW = "#f5e642";
const RED = "#ff2640";
const BLUE = "#2a5bff";
const WHITE = "#f2f6ff";
const DARK = "#0b0d16";
const STEEL = "#3a4156";
const TIRE = "#111218";
const RUBBER = "#1a1c26";

// ---------- paints ----------
const ARMOR = paint((p, n) => {
  const top = smoothstep(0.2, 0.9, n.y);
  let c = mix("#1b1f2e", "#2f3756", top * 0.75 + noise(p, 0.6, 3) * 0.25);
  const sideways = Math.abs(n.x) > Math.abs(n.z);
  const u = sideways ? p.z : p.x;
  const du = (((u / 0.9) % 1) + 1) % 1;
  const dv = (((p.y / 0.45) % 1) + 1) % 1;
  if (du < 0.012 || du > 0.988 || dv < 0.02) c = mix(c, "#05060b", 0.85);
  else if (du < 0.03 || dv > 0.975) c = mix(c, "#6a7498", 0.25);
  c = mix(c, "#3b352a", smoothstep(1.0, 0.55, p.y) * 0.7 * noise(p, 0.25, 5));
  c = mix(c, "#0a0b10", 0.25 * smoothstep(0.55, 0.9, noise(p, 0.12, 8)));
  return c;
});

const HAZARD = paint((p) => {
  const k = Math.floor((p.x + p.y * 1.0) / 0.12);
  return k % 2 === 0 ? "#f5e642" : "#14141a";
});

const TANKPAINT = paint((p, n) => {
  let c = mix("#aab2c6", "#dfe5f2", smoothstep(-0.4, 0.9, n.y));
  const z = p.z;
  if (Math.abs(z + 1.7) > 0.62 || Math.abs(z + 1.7) < 0.08)
    c = mix(c, "#1d2a52", Math.abs(z + 1.7) > 0.62 ? 0.9 : 0);
  c = mix(c, "#35302a", smoothstep(1.7, 1.3, p.y) * 0.5 * noise(p, 0.3, 2));
  c = mix(c, "#5a6075", 0.3 * smoothstep(0.6, 0.85, noise(p, 0.1, 4)));
  return c;
});

const TIREPAINT = paint((p, n) => mix("#15161d", "#0a0a0f", noise(p, 0.05, 2) * 0.6 + (n.y < -0.5 ? 0.3 : 0)));

// ---------- textures ----------
const WINDOW_TEX = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="60" fill="#06141c"/>
  <polygon points="0,60 40,0 55,0 15,60" fill="#0f5a73" opacity="0.55"/>
  <polygon points="45,60 85,0 92,0 52,60" fill="#0f5a73" opacity="0.4"/>
  <g stroke="#19f3ff" stroke-width="0.8" opacity="0.5">
   <path d="M4 8 H30 M4 13 H20 M70 50 H96 M80 55 H96"/>
  </g>
  <path d="M6 54 L14 54 L14 48" stroke="#ff2a9d" stroke-width="1.4" fill="none"/>
  <rect x="1" y="1" width="98" height="58" fill="none" stroke="#02070b" stroke-width="3"/>
 </svg>`,
  { size: 256 },
);

const SIGN_TEX = svg(
  `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="40" rx="3" fill="#0a0c16"/>
  <rect x="2" y="2" width="196" height="36" rx="3" fill="none" stroke="#ff2a9d" stroke-width="2"/>
  <rect x="6" y="6" width="22" height="28" fill="#f5e642"/>
  <path d="M10 10 L17 30 L24 10" stroke="#0a0c16" stroke-width="4" fill="none"/>
  <text x="36" y="19" font-family="Arial Black, Arial, sans-serif" font-weight="bold" font-size="13" fill="#19f3ff">VANTAGE CIVIL ORDER</text>
  <text x="36" y="33" font-family="Arial, sans-serif" font-size="9" fill="#ff2a9d">RIOT SUPPRESSION // UNIT 07</text>
  <rect x="160" y="8" width="32" height="4" fill="#f5e642"/><rect x="160" y="16" width="22" height="4" fill="#f5e642"/>
  <rect x="160" y="24" width="32" height="4" fill="#19f3ff"/>
 </svg>`,
  { size: 512 },
);

const DOOR_TEX = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="40" fill="#0a0c16"/>
  <rect x="1.5" y="1.5" width="77" height="37" fill="none" stroke="#19f3ff" stroke-width="1.5"/>
  <text x="40" y="20" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="bold" font-size="14" fill="#f2f6ff">07</text>
  <text x="40" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" fill="#ff2a9d">COMPLY</text>
 </svg>`,
  { size: 256 },
);

const LOGO_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#0a0c16" stroke="#ff2a9d" stroke-width="5"/>
  <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" fill="none" stroke="#19f3ff" stroke-width="2"/>
  <path d="M28 30 L50 72 L72 30" stroke="#f5e642" stroke-width="10" fill="none" stroke-linejoin="miter"/>
  <circle cx="50" cy="50" r="5" fill="#ff2a9d"/>
 </svg>`,
  { size: 256 },
);

const GAUGE_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#0a0c16" stroke="#6a7498" stroke-width="5"/>
  <path d="M20 72 A36 36 0 1 1 80 72" stroke="#19f3ff" stroke-width="4" fill="none"/>
  <path d="M68 28 A36 36 0 0 1 80 72" stroke="#ff2640" stroke-width="5" fill="none"/>
  <path d="M50 50 L36 30" stroke="#f2f6ff" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="5" fill="#ff2a9d"/>
 </svg>`,
  { size: 128 },
);

const VENT_TEX = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="60" fill="#07080d"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="6" y="${5 + i * 6.8}" width="88" height="3.2" fill="#262c42"/>`).join("")}
  <rect x="6" y="56" width="88" height="2" fill="#ff2a9d"/>
 </svg>`,
  { size: 256 },
);

const REAR_TEX = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="60" fill="#0d0f1a"/>
  <rect x="3" y="3" width="94" height="54" fill="none" stroke="#2f3756" stroke-width="2"/>
  <rect x="48.5" y="3" width="3" height="54" fill="#05060b"/>
  <rect x="8" y="8" width="34" height="8" fill="#f5e642"/><rect x="58" y="8" width="34" height="8" fill="#f5e642"/>
  <text x="25" y="14.5" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="6" fill="#0d0f1a">STAND CLEAR</text>
  <text x="75" y="14.5" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="6" fill="#0d0f1a">STAND CLEAR</text>
  <rect x="38" y="44" width="24" height="9" fill="#e8ecf5"/>
  <text x="50" y="51" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="6.5" fill="#0d0f1a">VX-0707</text>
 </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const gbox = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, s = 1.2) =>
    glow(box(w, h, d, c, x, y, z), s);
  const cyl = (r: number, h: number, c: any, at: number[], dir: number[], seg = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, dir, ...o });
  const gcyl = (r: number, h: number, c: string, at: number[], dir: number[], seg = 12, s = 1.3) =>
    glow(cyl(r, h, c, at, dir, seg), s);
  const SIDES = [1, -1];

  // ---------- hull ----------
  box(2.3, 0.7, 5.4, ARMOR, 0, 0.95, 0);
  // chassis underbelly
  box(1.9, 0.2, 5.0, DARK, 0, 0.55, 0);

  // cab + hood profile (z, y)
  b.extrude(
    [
      [-0.7, 1.3],
      [-0.7, 2.5],
      [0.4, 2.5],
      [1.1, 1.85],
      [1.3, 1.65],
      [2.6, 1.65],
      [2.6, 1.3],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.1, bevel: 0.04, color: ARMOR },
  );

  // windshield
  const ws = [0, 0.73, 0.68];
  b.part(new THREE.PlaneGeometry(1.9, 0.95), "#ffffff", {
    at: [0, 2.175 + ws[1] * 0.03, 0.75 + ws[2] * 0.03],
    rotation: [-47, 0, 0],
    texture: WINDOW_TEX,
    name: "windshield",
  });
  b.part(new THREE.BoxGeometry(2.0, 0.07, 0.07), STEEL, { at: [0, 2.52, 0.4] });
  b.part(new THREE.BoxGeometry(2.0, 0.07, 0.07), STEEL, { at: [0, 1.67, 1.18], rotation: [-47, 0, 0] });
  for (const s of SIDES) {
    // side window
    glow(
      b.part(new THREE.PlaneGeometry(0.95, 0.55), "#ffffff", {
        at: [s * 1.056, 2.08, -0.1],
        dir: [s, 0, 0],
        axis: "z",
        texture: WINDOW_TEX,
      }),
      0.35,
    );
    // door sign + number
    b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", {
      at: [s * 1.058, 1.52, 0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: DOOR_TEX,
    });
    // door seams
    box(0.02, 1.15, 0.03, DARK, s * 1.055, 1.9, 0.55);
    box(0.02, 1.15, 0.03, DARK, s * 1.055, 1.9, -0.65);
    box(0.03, 0.05, 0.22, STEEL, s * 1.07, 1.78, 0.38);
    // large corporate sign on the lower hull
    b.part(new THREE.PlaneGeometry(2.6, 0.52), "#ffffff", {
      at: [s * 1.157, 0.98, 0.55],
      dir: [s, 0, 0],
      axis: "z",
      texture: SIGN_TEX,
    });
    glow(box(0.04, 0.05, 4.9, MAGENTA, s * 1.165, 0.68, 0), 1.4);
    glow(box(0.04, 0.03, 4.9, CYAN, s * 1.165, 0.62, 0), 1.2);
    // roof edge neon
    glow(box(0.04, 0.04, 1.1, CYAN, s * 1.06, 2.46, -0.15), 1.3);
    glow(box(0.04, 0.04, 1.2, MAGENTA, s * 0.7, 1.67, 2.0), 1.0).mesh.visible = true;
    // mirrors
    box(0.5, 0.05, 0.05, STEEL, s * 1.3, 1.9, 0.78);
    box(0.08, 0.34, 0.22, DARK, s * 1.55, 1.9, 0.78);
    gbox(0.02, 0.28, 0.16, CYAN, s * 1.6, 1.9, 0.78, 0.8);
    // side steps
    box(0.25, 0.06, 0.9, STEEL, s * 1.25, 0.82, 1.15);
    box(0.25, 0.06, 0.9, STEEL, s * 1.25, 0.82, -0.2);
    // riot shield racks on the cab side
    box(0.06, 0.55, 0.9, "#26304f", s * 1.1, 1.52, -0.35);
    gbox(0.02, 0.08, 0.7, BLUE, s * 1.14, 1.52, -0.35, 1.0);

    // headlights
    gbox(0.6, 0.14, 0.06, WHITE, s * 0.7, 1.46, 2.62, 1.8);
    gbox(0.2, 0.05, 0.06, CYAN, s * 1.0, 1.55, 2.62, 1.4);
    // taillights
    gbox(0.18, 0.5, 0.06, RED, s * 1.0, 1.05, -2.72, 1.6);
    // front tow hooks
    box(0.12, 0.12, 0.25, YELLOW, s * 0.95, 0.65, 3.0);
  }
  // hood: vents, ridge, DRL
  b.part(new THREE.PlaneGeometry(1.4, 0.8), "#ffffff", {
    at: [0, 1.656, 1.85],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: VENT_TEX,
  });
  gbox(1.0, 0.04, 0.05, MAGENTA, 0, 1.5, 2.62, 1.5);
  box(0.12, 0.05, 1.5, STEEL, 0.75, 1.68, 1.85);
  box(0.12, 0.05, 1.5, STEEL, -0.75, 1.68, 1.85);

  // grille slits
  for (let i = 0; i < 6; i++) gbox(1.6 - i * 0.04, 0.035, 0.04, MAGENTA, 0, 0.72 + i * 0.1, 2.71, 0.9);

  // ---------- ram / bull bar ----------
  b.extrude(
    [
      [-1.3, 0],
      [1.3, 0],
      [1.15, 0.75],
      [-1.15, 0.75],
    ],
    { at: [0, 0.45, 2.85], x: [1, 0, 0], thickness: 0.3, bevel: 0.03, color: HAZARD },
  );
  box(2.4, 0.08, 0.34, STEEL, 0, 1.22, 2.87);
  for (const x of [-0.6, 0, 0.6]) {
    b.rod([x, 0.55, 3.03], [x, 1.5, 2.98], 0.045, { color: STEEL });
  }
  gbox(1.4, 0.07, 0.06, CYAN, 0, 1.4, 3.0, 1.6);
  b.rod([-0.62, 1.5, 2.98], [0.62, 1.5, 2.98], 0.05, { color: STEEL });

  // ---------- roof gear ----------
  // main light bar
  box(1.95, 0.12, 0.24, DARK, 0, 2.56, 0.12);
  const lens = [BLUE, RED, BLUE, RED, BLUE, RED];
  lens.forEach((c, i) => {
    const x = -0.78 + i * 0.312;
    gbox(0.27, 0.1, 0.26, c, x, 2.64, 0.12, 1.8);
    gbox(0.27, 0.07, 0.04, c, x, 2.56, 0.26, 1.5);
  });
  gbox(0.4, 0.04, 0.26, WHITE, 0, 2.7, 0.12, 1.5);
  // rear roof bar
  box(1.6, 0.1, 0.18, DARK, 0, 2.55, -0.55);
  for (let i = 0; i < 4; i++) gbox(0.36, 0.08, 0.2, i % 2 ? MAGENTA : CYAN, -0.6 + i * 0.4, 2.6, -0.55, 1.5);
  // loudspeaker horns
  for (const s of SIDES) {
    b.lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.09, 0.08],
        [0.24, 0.42],
        [0.24, 0.44],
        [0.0, 0.44],
      ],
      { at: [s * 0.8, 2.72, 0.0], axis: [0, 0, 1], segments: 8, color: STEEL },
    );
    box(0.1, 0.25, 0.1, DARK, s * 0.8, 2.6, 0.0);
    b.rod([s * 0.95, 2.5, -0.62], [s * 0.95, 3.3, -0.62], 0.012, { color: DARK });
    gbox(0.04, 0.04, 0.04, RED, s * 0.95, 3.3, -0.62, 2);
  }
  // camera dome
  b.part(new THREE.SphereGeometry(0.14, 8, 6), DARK, { at: [0.65, 2.58, -0.5] });
  gbox(0.1, 0.05, 0.06, RED, 0.65, 2.6, -0.4, 2);

  // ---------- water cannon ----------
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.42, 0.06],
      [0.3, 0.12],
      [0.3, 0.22],
      [0, 0.22],
    ],
    { at: [0, 2.5, -0.25], segments: 12, color: STEEL },
  );
  box(0.62, 0.45, 0.72, ARMOR, 0, 2.95, -0.25);
  box(0.66, 0.08, 0.5, STEEL, 0, 3.2, -0.3);
  gbox(0.5, 0.05, 0.04, CYAN, 0, 2.95, 0.12, 1.5);
  for (const s of SIDES) {
    b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
      at: [s * 0.311, 2.95, -0.35],
      dir: [s, 0, 0],
      axis: "z",
      texture: GAUGE_TEX,
    });
  }
  // barrel
  b.rod([0, 3.05, 0.1], [0, 3.05, 1.75], [0.13, 0.11], { color: "#434b66", sides: 10 });
  for (const z of [0.4, 0.9, 1.4]) cyl(0.155, 0.1, STEEL, [0, 3.05, z], [0, 0, 1], 10);
  // nozzle
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.13, 0.08],
      [0.21, 0.2],
      [0.22, 0.42],
      [0.15, 0.44],
      [0, 0.44],
    ],
    { at: [0, 3.05, 1.7], axis: [0, 0, 1], segments: 10, color: "#59627f" },
  );
  gcyl(0.225, 0.05, CYAN, [0, 3.05, 1.98], [0, 0, 1], 10, 1.8);
  gcyl(0.13, 0.03, WHITE, [0, 3.05, 2.14], [0, 0, 1], 10, 1.5);
  // support struts
  for (const s of SIDES) b.rod([s * 0.25, 3.0, -0.1], [s * 0.08, 3.05, 0.6], 0.03, { color: STEEL });
  // feed hose
  b.sweep(
    [
      [0.45, 2.1, -0.8],
      [0.8, 2.4, -0.55],
      [0.5, 2.7, -0.4],
      [0.2, 2.82, -0.3],
    ],
    0.05,
    { color: RUBBER, sides: 6 },
  );
  gcyl(0.06, 0.03, CYAN, [0.45, 2.1, -0.8], [0.3, -0.3, 0.4].map((v) => v), 8, 1.2);

  // ---------- water tank ----------
  const tank = b.lathe(
    [
      [0, -0.95],
      [0.5, -0.95],
      [0.72, -0.82],
      [0.8, -0.6],
      [0.8, 0.6],
      [0.72, 0.82],
      [0.5, 0.95],
      [0, 0.95],
    ],
    { at: [0, 2.05, -1.7], axis: [0, 0, 1], segments: 16, color: TANKPAINT },
  );
  for (const z of [-1.2, -1.7, -2.2]) {
    b.lathe(
      [
        [0, -0.04],
        [0.835, -0.04],
        [0.835, 0.04],
        [0, 0.04],
      ],
      { at: [0, 2.05, z], axis: [0, 0, 1], segments: 16, color: STEEL },
    );
  }
  for (const s of SIDES) {
    b.decal(tank, LOGO_TEX, { at: [s * 0.8, 2.15, -1.7], dir: [s, 0, 0], size: [0.9, 0.9], mirror: s < 0 });
    gbox(0.05, 0.9, 0.1, CYAN, s * 0.81, 1.85, -2.45, 1.6);
    // cradle
    box(0.15, 0.6, 1.9, STEEL, s * 0.5, 1.4, -1.7);
  }
  // tank top hatch + filler
  cyl(0.2, 0.1, STEEL, [0, 2.86, -1.7], [0, 1, 0], 10);
  cyl(0.1, 0.12, DARK, [0, 2.93, -1.7], [0, 1, 0], 8);
  gcyl(0.04, 0.14, MAGENTA, [0.0, 3.0, -1.7], [0, 1, 0], 6, 1.5);
  // rear valve wheel
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.15],
      [0, 0.15],
    ],
    { at: [0, 1.55, -2.65], axis: [0, 0, -1], segments: 8, color: STEEL },
  );
  glow(cyl(0.15, 0.04, RED, [0, 1.55, -2.8], [0, 0, 1], 8), 1.2);
  // ladder
  for (const x of [-0.25, 0.25]) b.rod([x, 1.3, -2.74], [x, 2.7, -2.74], 0.025, { color: STEEL });
  for (let i = 0; i < 7; i++) b.rod([-0.25, 1.45 + i * 0.2, -2.74], [0.25, 1.45 + i * 0.2, -2.74], 0.018, { color: STEEL });

  // ---------- rear ----------
  b.part(new THREE.PlaneGeometry(2.0, 0.6), "#ffffff", {
    at: [0, 1.0, -2.705],
    dir: [0, 0, -1],
    axis: "z",
    texture: REAR_TEX,
  });
  box(2.4, 0.2, 0.3, STEEL, 0, 0.62, -2.8);
  gbox(1.6, 0.05, 0.05, MAGENTA, 0, 0.78, -2.72, 1.5);
  gbox(0.5, 0.08, 0.06, RED, 0, 1.4, -2.72, 1.4);

  // ---------- wheels ----------
  const WZ = [1.8, -0.45, -1.95];
  for (const z of WZ) {
    for (const s of SIDES) {
      const x = s * 1.3;
      cyl(0.55, 0.5, TIREPAINT, [x, 0.55, z], [1, 0, 0], 14);
      cyl(0.36, 0.52, STEEL, [x, 0.55, z], [1, 0, 0], 12);
      gcyl(0.38, 0.03, s > 0 ? CYAN : MAGENTA, [x + s * 0.255, 0.55, z], [1, 0, 0], 14, 1.6);
      cyl(0.27, 0.07, "#262b3e", [x + s * 0.27, 0.55, z], [1, 0, 0], 10);
      cyl(0.07, 0.1, YELLOW, [x + s * 0.3, 0.55, z], [1, 0, 0], 6);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.025, 0.1, "#9aa3bf", [x + s * 0.3, 0.55 + Math.cos(a) * 0.19, z + Math.sin(a) * 0.19], [1, 0, 0], 5);
      }
      // fender
      box(0.7, 0.1, 1.5, ARMOR, x, 1.17, z);
      box(0.7, 0.1, 0.35, ARMOR, x, 1.1, z + 0.78, { rotation: [-30, 0, 0] });
      box(0.7, 0.1, 0.35, ARMOR, x, 1.1, z - 0.78, { rotation: [30, 0, 0] });
    }
    // axle
    cyl(0.1, 2.6, DARK, [0, 0.55, z], [1, 0, 0], 8);
  }

  return b.root;
}
