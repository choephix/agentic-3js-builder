import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  name: "Vantage VX-7 Riot Interceptor",
  description:
    "Corporate riot-control interceptor: armoured white-and-graphite hull, roof water cannon on a yawing turret with twin tanks, neon light bars, underglow, tear-gas launchers and cyberpunk decals.",
};

type V3 = [number, number, number];

const WHITE = "#dfe3ea";
const GRAPH = "#3a3d4a";
const NAVY = "#1b1d2b";
const BLACK = "#0e0f15";
const YEL = "#fcee0a";
const MAG = "#ff2bd6";
const CYA = "#27f3ff";
const RED = "#ff2a3c";
const STEEL = "#7d8494";
const TYRE = "#17181d";
const GLASS = "#0b1822";
const DIRT = "#4a4538";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

// ---------------------------------------------------------------- textures
const LOGO = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="196" height="76" rx="10" fill="#0e0f15" stroke="#fcee0a" stroke-width="4"/>
  <polygon points="40,10 64,23 64,57 40,70 16,57 16,23" fill="#1b1d2b" stroke="#fcee0a" stroke-width="3"/>
  <path d="M27 28 L40 54 L53 28" stroke="#27f3ff" stroke-width="6" fill="none" stroke-linejoin="round"/>
  <text x="76" y="38" font-family="Arial, sans-serif" font-weight="bold" font-size="25" fill="#ffffff">VANTAGE</text>
  <rect x="76" y="44" width="112" height="3" fill="#fcee0a"/>
  <text x="76" y="63" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#27f3ff">CIVIC DEFENSE</text>
  </svg>`,
  { size: 512 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill="#0e0f15" stroke="#fcee0a" stroke-width="5"/>
  <path d="M22 26 L40 58 L58 26" stroke="#27f3ff" stroke-width="8" fill="none" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);
const PLAQUE = svg(
  `<svg viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="156" height="32" rx="6" fill="#0e0f15" stroke="#fcee0a" stroke-width="3"/>
  <text x="80" y="23" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#fcee0a">RIOT CONTROL  U-07</text>
  </svg>`,
  { size: 256 },
);
const hazardPolys = Array.from({ length: 11 }, (_, k) => {
  const i = k - 2;
  return `<polygon points="${i * 16},24 ${i * 16 + 8},24 ${i * 16 + 24},0 ${i * 16 + 16},0" fill="#fcee0a"/>`;
}).join("");
const HAZARD = svg(
  `<svg viewBox="0 0 128 24" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="24" fill="#0e0f15"/>${hazardPolys}</svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 256 56" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="56" fill="#07060d"/>
  <text x="128" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="#ff2bd6">STAND DOWN</text>
  <text x="128" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#27f3ff">DISPERSE // COMPLIANCE IS SAFETY</text>
  <rect x="6" y="6" width="244" height="3" fill="#ff2bd6"/><rect x="6" y="50" width="244" height="2" fill="#27f3ff"/>
  </svg>`,
  { size: 512 },
);
const WIND = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16394a"/><stop offset="1" stop-color="#050b12"/></linearGradient></defs>
  <rect width="200" height="80" fill="url(#g)"/>
  <polygon points="10,80 60,0 80,0 30,80" fill="#27f3ff" opacity="0.18"/>
  <polygon points="110,80 150,0 160,0 120,80" fill="#ff2bd6" opacity="0.15"/>
  <path d="M20 66 H70 M130 66 H180" stroke="#27f3ff" stroke-width="1.5"/>
  <circle cx="100" cy="62" r="9" fill="none" stroke="#27f3ff" stroke-width="1.2"/>
  <text x="100" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#27f3ff">TARGETING // 3 HOSTILES</text>
  </svg>`,
  { size: 512 },
);
const GAUGE = gaugeTexture({ needle: 72, label: "BAR", size: 192 });

// ---------------------------------------------------------------- paints
const hullBase = paint((p, n) => {
  let c: string;
  if (p.y < 1.18) c = NAVY;
  else if (p.y < 1.25) c = YEL;
  else if (p.y < 1.5) c = GRAPH;
  else c = WHITE;
  const low = smoothstep(1.0, 0.5, p.y);
  const g = Math.min(1, low * 0.8 + 0.25 * smoothstep(0.55, 0.85, noise(p, 0.35, 3)));
  let col = mix(c, DIRT, g * 0.55);
  if (n.y < -0.5) col = mix(col, BLACK, 0.5);
  return col;
});
const HULL = panelled(hullBase, { size: 0.55, aspect: 0.8, rivets: 0.07 });
const TANK = paint((p) => {
  const k = ((p.z + 3) % 0.7) / 0.7;
  const band = k < 0.1 || (k > 0.45 && k < 0.5);
  return band ? YEL : mix(WHITE, "#9fa6b5", 0.3 * noise(p, 0.3, 8));
});

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const chassis = b.joint("chassis", { at: [0, 0.8, 0], role: "spine" });
  const K = (geo: THREE.BufferGeometry, color: any, at: V3, o: Record<string, any> = {}) =>
    b.part(geo, color, { bone: chassis, at, ...o });
  const decal = (tex: any, w: number, h: number, at: V3, dir: V3, color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { bone: chassis, at, dir, axis: "z", texture: tex });
  const rod = (a: V3, c: V3, r: number, color: any, bone: any = chassis, sides = 6) =>
    b.rod(a, c, r, color, { bone, sides });

  // ---------------------------------------------------------- hull
  const profile: [number, number][] = [
    [-2.7, 0.6],
    [2.75, 0.6],
    [2.8, 1.1],
    [2.4, 1.45],
    [1.5, 1.6],
    [0.9, 2.3],
    [-2.0, 2.3],
    [-2.7, 2.1],
  ];
  b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: HULL, bone: chassis });

  // underbody
  K(box(2.0, 0.15, 4.6), BLACK, [0, 0.55, 0]);
  for (const z of [1.75, -1.65]) {
    rod([-1.25, 0.52, z], [1.25, 0.52, z], 0.07, STEEL, chassis, 8);
    K(new THREE.SphereGeometry(0.16, 8, 6), GRAPH, [0, 0.52, z], { flat: true });
  }
  rod([0, 0.5, 1.75], [0, 0.5, -1.65], 0.045, STEEL, chassis, 8);

  // windscreen with HUD reflections, pillars, visor
  decal(WIND, 1.95, 0.9, [0, 1.965, 1.215], [0, 0.65, 0.76]);
  for (const s of [1, -1]) {
    K(box(0.12, 1.0, 0.1), GRAPH, [s * 1.03, 1.95, 1.2], { rotation: [-40.6, 0, 0] });
  }
  K(box(2.2, 0.1, 0.3), GRAPH, [0, 2.34, 0.97], { rotation: [4, 0, 0] });
  glow(K(box(1.9, 0.03, 0.02), MAG, [0, 2.33, 1.13]), 1.6);
  K(box(2.0, 0.06, 0.06), STEEL, [0, 1.62, 1.55]); // wiper rail
  for (const s of [1, -1]) rod([s * 0.2, 1.64, 1.5], [s * 0.7, 1.9, 1.3], 0.012, BLACK);

  // hood vents and ridge
  K(box(0.2, 0.03, 0.8), STEEL, [0, 1.54, 1.95], { rotation: [9.5, 0, 0] });
  for (const x of [-0.55, 0.55])
    for (let i = 0; i < 5; i++)
      K(box(0.5, 0.03, 0.04), BLACK, [x, 1.545, 1.62 + i * 0.12], { rotation: [9.5, 0, 0] });

  // nose: grille, emblem, DRLs
  K(box(1.5, 0.36, 0.05), BLACK, [0, 0.88, 2.8]);
  for (let i = 0; i < 5; i++) glow(K(box(1.4, 0.015, 0.02), CYA, [0, 0.74 + i * 0.07, 2.83]), 1.3);
  decal(EMBLEM, 0.3, 0.3, [0, 0.95, 2.835], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(K(box(0.5, 0.05, 0.03), CYA, [s * 0.9, 1.2, 2.66], { rotation: [-38, 0, 0] }), 1.6);
    K(box(0.56, 0.1, 0.05), BLACK, [s * 0.9, 1.2, 2.62], { rotation: [-38, 0, 0] });
  }

  // push bumper
  K(box(2.5, 0.5, 0.35), GRAPH, [0, 0.82, 2.97]);
  K(box(2.56, 0.06, 0.4), STEEL, [0, 1.08, 2.97]);
  decal(HAZARD, 2.3, 0.28, [0, 0.78, 3.151], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(K(box(0.46, 0.14, 0.04), CYA, [s * 1.0, 0.99, 3.15]), 2);
    K(box(0.5, 0.18, 0.03), BLACK, [s * 1.0, 0.99, 3.14]);
    K(box(0.2, 0.3, 0.2), STEEL, [s * 1.27, 0.82, 2.9]);
    b.part(new THREE.TorusGeometry(0.06, 0.015, 5, 8, Math.PI), STEEL, {
      bone: chassis,
      at: [s * 0.55, 0.52, 3.15],
      rotation: [0, 0, 180],
    });
    for (let i = 0; i < 3; i++) b.spike([s * (0.2 + i * 0.35), 0.58, 3.14], [0, -0.3, 1], 0.14, 0.04, STEEL, { bone: chassis, sides: 5 });
  }

  // ---------------------------------------------------------- flanks
  for (const s of [1, -1]) {
    const x = s * 1.1;
    const out = s * 1;
    // door seams, window with cage bars, plate, handle
    for (const z of [0.75, -0.35]) K(box(0.014, 0.82, 0.025), BLACK, [x + out * 0.004, 1.74, z]);
    K(box(0.03, 0.36, 0.85), GLASS, [x + out * 0.01, 1.92, 0.2]);
    for (const z of [-0.1, 0.1, 0.3, 0.5]) rod([x + out * 0.035, 1.74, z], [x + out * 0.035, 2.1, z], 0.014, BLACK);
    K(box(0.04, 0.1, 1.0), GRAPH, [x + out * 0.02, 2.17, 0.2]);
    K(box(0.05, 0.05, 0.22), STEEL, [x + out * 0.03, 1.55, -0.2]);
    for (const z of [0.7, -0.3]) K(cyl(0.025, 0.06, 6), STEEL, [x + out * 0.02, 1.4, z], { rotation: [0, 0, 90] });
    decal(PLAQUE, 0.8, 0.18, [x + out * 0.006, 1.42, 0.2], [out, 0, 0]);
    // logo
    decal(LOGO, 1.5, 0.6, [x + out * 0.006, 1.88, -1.35], [out, 0, 0]);
    // vents behind door
    for (let i = 0; i < 4; i++) K(box(0.03, 0.03, 0.4), BLACK, [x + out * 0.012, 1.5 + i * 0.07, -0.75]);
    // neon sill + skirt
    glow(K(box(0.03, 0.045, 1.6), CYA, [x + out * 0.012, 0.97, 0]), 1.8);
    K(box(0.05, 0.28, 1.6), GRAPH, [x + out * 0.02, 0.82, 0]);
    for (let i = 0; i < 4; i++) K(cyl(0.02, 0.03, 6), STEEL, [x + out * 0.05, 0.9, -0.65 + i * 0.43], { rotation: [0, 0, 90] });
    K(box(0.28, 0.05, 0.9), BLACK, [s * 1.22, 0.7, 0.55]); // step
    // fender flares and mud flaps
    for (const z of [1.75, -1.65]) {
      K(box(0.55, 0.1, 1.35), GRAPH, [s * 1.27, 1.14, z]);
      K(box(0.05, 0.22, 1.3), GRAPH, [s * 1.52, 1.0, z]);
      K(box(0.4, 0.34, 0.04), BLACK, [s * 1.27, 0.62, z - 0.7 * (z > 0 ? 1 : 1)]);
    }
    // mirrors
    rod([x, 1.95, 1.0], [s * 1.45, 1.98, 1.15], 0.02, STEEL);
    rod([x, 1.8, 1.0], [s * 1.45, 1.86, 1.15], 0.02, STEEL);
    K(box(0.07, 0.32, 0.22), BLACK, [s * 1.5, 1.92, 1.15]);
    glow(K(cyl(0.025, 0.03, 6), CYA, [s * 1.5, 1.92, 1.27], { rotation: [90, 0, 0] }), 1.5);
    // tear gas launchers
    K(box(0.34, 0.08, 0.34), BLACK, [s * 1.28, 1.24, 1.75]);
    for (let i = -1; i <= 1; i++) {
      const bx = s * 1.28 + i * 0.1;
      rod([bx, 1.3, 1.65], [bx, 1.52, 1.95], 0.04, GRAPH, chassis, 7);
      K(cyl(0.05, 0.03, 7), BLACK, [bx, 1.53, 1.96], { rotation: [-36, 0, 0] });
    }
  }

  // underglow
  for (const s of [1, -1]) glow(K(box(0.06, 0.03, 3.0), MAG, [s * 1.0, 0.46, 0]), 2);
  glow(K(box(1.6, 0.03, 0.06), MAG, [0, 0.46, 2.4]), 2);

  // ---------------------------------------------------------- rear
  K(box(0.02, 1.3, 0.02), BLACK, [0, 1.35, -2.705]);
  for (const s of [1, -1]) {
    K(box(0.42, 0.26, 0.02), GLASS, [s * 0.5, 1.75, -2.71]);
    for (const dx of [-0.12, 0, 0.12]) rod([s * 0.5 + dx, 1.62, -2.73], [s * 0.5 + dx, 1.88, -2.73], 0.012, BLACK);
    K(box(0.05, 0.2, 0.05), STEEL, [s * 0.1, 1.3, -2.73]);
    for (const y of [0.95, 1.9]) K(cyl(0.025, 0.1, 6), STEEL, [s * 0.95, y, -2.72], { rotation: [0, 0, 90] });
    glow(K(box(0.12, 0.8, 0.03), RED, [s * 1.0, 1.4, -2.71]), 2);
    // exhaust tips and rear bumper step
    K(cyl(0.07, 0.2, 8), BLACK, [s * 0.7, 0.42, -2.9], { rotation: [90, 0, 0] });
    rod([s * 0.7, 0.45, -2.2], [s * 0.7, 0.42, -2.85], 0.045, STEEL, chassis, 8);
  }
  glow(decal(SCREEN, 1.3, 0.28, [0, 1.15, -2.712], [0, 0, -1]), 1.3);
  decal(HAZARD, 2.1, 0.26, [0, 0.74, -2.712], [0, 0, -1]);
  K(box(2.3, 0.18, 0.3), GRAPH, [0, 0.68, -2.85]);
  b.part(new THREE.TorusGeometry(0.08, 0.02, 5, 8), STEEL, { bone: chassis, at: [0, 0.68, -3.02], rotation: [90, 0, 0] });

  // ---------------------------------------------------------- roof
  // neon light bar
  K(box(1.9, 0.14, 0.24), BLACK, [0, 2.4, 0.6]);
  for (const s of [1, -1]) K(box(0.06, 0.1, 0.14), STEEL, [s * 0.9, 2.33, 0.6]);
  for (let i = 0; i < 8; i++) {
    const x = -0.77 + i * 0.22;
    const col = i < 4 ? MAG : CYA;
    glow(K(box(0.2, 0.07, 0.03), col, [x, 2.4, 0.735]), 2.2);
    glow(K(box(0.2, 0.07, 0.03), col, [x, 2.4, 0.465]), 2.2);
    glow(K(box(0.2, 0.02, 0.18), col, [x, 2.475, 0.6]), 1.5);
  }
  // LRAD loudspeakers
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0, 0],
        [0.08, 0],
        [0.08, 0.1],
        [0.22, 0.34],
        [0, 0.3],
      ],
      { at: [s * 0.78, 2.5, 0.05], axis: [0, 0.3, 1], segments: 10, bone: chassis, color: GRAPH },
    );
    K(box(0.16, 0.2, 0.16), BLACK, [s * 0.78, 2.4, 0.0]);
    glow(K(cyl(0.05, 0.02, 8), CYA, [s * 0.78, 2.52, 0.2], { rotation: [72, 0, 0] }), 1.4);
    rod([s * 0.95, 2.3, -0.3], [s * 0.95, 2.3, 0.75], 0.02, STEEL); // rails
    // antennas
    b.spike([s * 0.95, 2.3, -1.95], [0, 1, 0], 1.3, 0.02, STEEL, { bone: chassis, sides: 5 });
    K(new THREE.SphereGeometry(0.03, 6, 4), RED, [s * 0.95, 3.62, -1.95]);
    K(cyl(0.06, 0.08, 8), BLACK, [s * 0.95, 2.34, -1.95]);
  }
  // sensor dome and beacon
  K(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [0.78, 2.3, -0.55], { flat: true });
  K(cyl(0.22, 0.05, 10), STEEL, [0.78, 2.3, -0.55]);
  glow(K(new THREE.SphereGeometry(0.05, 6, 4), CYA, [0.78, 2.4, -0.48]), 2);
  const beacon = b.joint("beacon", { parent: chassis, at: [-0.78, 2.34, -0.55], dir: [0, 1, 0], role: "hinge" });
  b.part(cyl(0.12, 0.05, 10), BLACK, { bone: chassis, at: [-0.78, 2.33, -0.55] });
  glow(b.part(new THREE.SphereGeometry(0.11, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), YEL, { bone: beacon, at: [-0.78, 2.36, -0.55], flat: true }), 2);
  b.part(box(0.1, 0.08, 0.02), STEEL, { bone: beacon, at: [-0.78, 2.4, -0.5] });

  // water tanks, pump, gauge, hose
  for (const s of [1, -1]) {
    b.capsule([s * 0.62, 2.6, -0.95], [s * 0.62, 2.6, -1.85], 0.32, TANK, { bone: chassis, sides: 12 });
    for (const z of [-1.1, -1.7]) {
      b.part(new THREE.TorusGeometry(0.33, 0.02, 5, 12), STEEL, { bone: chassis, at: [s * 0.62, 2.6, z] });
      K(box(0.5, 0.18, 0.1), GRAPH, [s * 0.62, 2.35, z]);
    }
    glow(K(box(0.03, 0.5, 0.05), CYA, [s * 0.95, 2.6, -1.4]), 1.7);
    K(box(0.05, 0.56, 0.09), BLACK, [s * 0.945, 2.6, -1.4]);
    K(cyl(0.05, 0.12, 8), STEEL, [s * 0.62, 2.9, -1.4]); // filler cap
    rod([s * 0.4, 2.62, -1.95], [s * 0.4, 3.1, -2.0], 0.04, STEEL); // vent pipe
  }
  K(box(0.5, 0.4, 0.8), GRAPH, [0, 2.5, -1.4]);
  decal(GAUGE, 0.3, 0.3, [0, 2.52, -1.801], [0, 0, -1]);
  K(cyl(0.05, 0.14, 8), STEEL, [0, 2.78, -1.4]);
  b.sweep(catmull([[0, 2.78, -1.4], [0, 3.0, -0.9], [0, 2.78, -0.5]]), 0.045, { bone: chassis, color: BLACK, sides: 7 });
  b.part(new THREE.TorusGeometry(0.047, 0.012, 5, 8), YEL, { bone: chassis, at: [0, 2.9, -0.9], rotation: [0, 90, 0] });

  // ---------------------------------------------------------- water cannon turret
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.32, -0.15], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.78, -0.15], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.42, 0.035, 6, 16), STEEL, { bone: chassis, at: [0, 2.33, -0.15], rotation: [90, 0, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(cyl(0.02, 0.03, 6), BLACK, { bone: chassis, at: [0.42 * Math.cos(a), 2.37, -0.15 + 0.42 * Math.sin(a)] });
  }
  b.part(cyl(0.36, 0.26, 12), WHITE, { bone: yaw, at: [0, 2.46, -0.15], flat: true });
  b.part(cyl(0.37, 0.04, 12), YEL, { bone: yaw, at: [0, 2.4, -0.15], flat: true });
  for (const s of [1, -1]) {
    b.part(box(0.07, 0.42, 0.6), WHITE, { bone: yaw, at: [s * 0.22, 2.74, -0.15] });
    b.part(cyl(0.06, 0.04, 8), STEEL, { bone: yaw, at: [s * 0.27, 2.78, -0.15], rotation: [0, 0, 90] });
    glow(b.part(box(0.01, 0.04, 0.3), CYA, { bone: yaw, at: [s * 0.26, 2.62, -0.15] }), 1.6);
  }
  b.part(box(0.4, 0.28, 0.5), GRAPH, { bone: pitch, at: [0, 2.78, -0.35] }); // breech
  b.rod([0, 2.78, -0.5], [0, 2.78, 0.75], 0.13, WHITE, { bone: pitch, sides: 10 });
  for (const z of [-0.1, 0.25, 0.6])
    b.part(new THREE.TorusGeometry(0.14, 0.025, 5, 10), z === 0.25 ? YEL : STEEL, { bone: pitch, at: [0, 2.78, z] });
  b.part(cyl(0.05, 0.4, 7), STEEL, { bone: pitch, at: [0, 2.96, 0.2], rotation: [90, 0, 0] }); // sight rail
  b.part(box(0.1, 0.1, 0.16), BLACK, { bone: pitch, at: [0, 3.0, 0.3] });
  glow(b.part(cyl(0.03, 0.02, 8), CYA, { bone: pitch, at: [0, 3.0, 0.39], rotation: [90, 0, 0] }), 2);
  b.lathe(
    [
      [0.11, 0],
      [0.15, 0.05],
      [0.1, 0.4],
      [0.14, 0.46],
      [0.09, 0.46],
      [0.06, 0.4],
      [0.1, 0.05],
    ],
    { at: [0, 2.78, 0.72], axis: [0, 0, 1], segments: 10, bone: pitch, color: GRAPH },
  );
  glow(b.part(cyl(0.065, 0.02, 10), CYA, { bone: pitch, at: [0, 2.78, 1.0], rotation: [90, 0, 0] }), 2.5);
  for (const s of [1, -1]) b.rod([s * 0.1, 2.78, -0.2], [s * 0.3, 2.62, -0.45], 0.02, BLACK, pitch);

  // ---------------------------------------------------------- wheels
  for (const s of [1, -1] as const) {
    for (const z of [1.75, -1.65]) {
      const front = z > 0;
      const suf = `${front ? "F" : "R"}${s > 0 ? "L" : "R"}`;
      const hub: V3 = [s * 1.25, 0.52, z];
      const parent = front
        ? b.joint(`steer${suf}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" })
        : chassis;
      const spin = b.joint(`wheel${suf}`, { parent, at: hub, dir: [s, 0, 0], role: "hinge" });
      const W = (geo: THREE.BufferGeometry, color: any, dx: number, o: Record<string, any> = {}) =>
        b.part(geo, color, { bone: spin, at: [hub[0] + s * dx, hub[1], hub[2]], ...o });
      W(cyl(0.5, 0.42, 16), TYRE, 0, { rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        b.part(box(0.4, 0.07, 0.13), TYRE, {
          bone: spin,
          at: [hub[0], hub[1] + 0.52 * Math.cos(a), hub[2] + 0.52 * Math.sin(a)],
          rotation: [(a * 180) / Math.PI, 0, 0],
          flat: true,
        });
      }
      W(cyl(0.3, 0.44, 12), STEEL, 0, { rotation: [0, 0, 90], flat: true });
      W(cyl(0.28, 0.04, 12), GRAPH, 0.2, { rotation: [0, 0, 90], flat: true });
      W(cyl(0.09, 0.1, 8), STEEL, 0.23, { rotation: [0, 0, 90] });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.part(cyl(0.022, 0.03, 6), STEEL, {
          bone: spin,
          at: [hub[0] + s * 0.225, hub[1] + 0.2 * Math.cos(a), hub[2] + 0.2 * Math.sin(a)],
          rotation: [0, 0, 90],
        });
      }
      glow(W(new THREE.TorusGeometry(0.33, 0.014, 5, 20), MAG, 0.215, { rotation: [0, 90, 0] }), 2.2);
    }
  }

  // ---------------------------------------------------------- rest pose
  b.pose(pitch, { axis: [1, 0, 0], deg: -8 });
  return b.root;
}
