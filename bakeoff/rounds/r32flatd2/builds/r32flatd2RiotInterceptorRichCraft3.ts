import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, stripes, countershade, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Riot-Control Interceptor",
  description:
    "Cyberpunk corporate riot-suppression armored truck with a roof water cannon, tear-gas launchers, ram bumper and neon light bars.",
};

// ---------- palette ----------
const CYAN = "#27f3ff";
const MAG = "#ff2bd6";
const RED = "#ff2a3a";
const BLUE = "#2a62ff";
const AMBER = "#ffb02a";
const WHITE = "#e8fbff";
const YELLOW = "#f6c91c";
const DARK = "#0b0c14";
const STEEL = "#3a3f58";
const TIRE = "#0e0f14";

type V = [number, number, number];

// ---------- textures ----------
const LOGO = svg(
  `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <polygon points="22,8 52,8 67,34 52,60 22,60 7,34" fill="#10121c" stroke="${YELLOW}" stroke-width="5"/>
  <polygon points="26,22 48,22 56,34 48,46 26,46 18,34" fill="${MAG}"/>
  <path d="M30 28 L44 28 L38 34 L44 40 L30 40 Z" fill="#10121c"/>
  <text x="78" y="32" font-family="sans-serif" font-weight="bold" font-size="26" fill="${WHITE}" stroke="#10121c" stroke-width="1.5">KIRODYNE</text>
  <rect x="78" y="38" width="118" height="5" fill="${CYAN}"/>
  <text x="78" y="58" font-family="sans-serif" font-weight="bold" font-size="14" fill="${YELLOW}">RIOT CONTROL DIV.</text>
  <rect x="7" y="72" width="190" height="10" fill="${YELLOW}"/>
  <path d="M10 72 l12 0 l-8 10 l-12 0z M34 72 l12 0 l-8 10 l-12 0z M58 72 l12 0 l-8 10 l-12 0z M82 72 l12 0 l-8 10 l-12 0z M106 72 l12 0 l-8 10 l-12 0z M130 72 l12 0 l-8 10 l-12 0z M154 72 l12 0 l-8 10 l-12 0z M178 72 l12 0 l-8 10 l-12 0z" fill="#10121c"/>
  </svg>`,
  { size: 512 },
);

const HUD = svg(
  `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06222e"/><stop offset="0.6" stop-color="#050b16"/><stop offset="1" stop-color="#1a0a2c"/></linearGradient></defs>
  <rect width="180" height="100" fill="url(#g)"/>
  <path d="M0 80 L70 0 L84 0 L10 100 L0 100Z" fill="#ffffff" opacity="0.07"/>
  <g stroke="${CYAN}" stroke-width="1" opacity="0.5">
   <path d="M0 25H180M0 50H180M0 75H180M30 0V100M60 0V100M90 0V100M120 0V100M150 0V100"/>
  </g>
  <circle cx="90" cy="50" r="18" fill="none" stroke="${MAG}" stroke-width="2"/>
  <path d="M90 26V40M90 60V74M66 50H80M100 50H114" stroke="${MAG}" stroke-width="2"/>
  <text x="8" y="14" font-family="monospace" font-size="8" fill="${CYAN}">CROWD 0412 // HOSTILE 37%</text>
  <text x="8" y="94" font-family="monospace" font-size="8" fill="${AMBER}">AQUA 82%  PSI 340</text>
  <text x="120" y="14" font-family="monospace" font-size="8" fill="${RED}">LOCK ◄ ►</text>
  <rect x="120" y="84" width="52" height="8" fill="none" stroke="${CYAN}"/>
  <rect x="122" y="86" width="36" height="4" fill="${CYAN}"/>
  </svg>`,
  { size: 384 },
);

const SIDE_GLASS = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="40" fill="#07131d"/>
  <path d="M0 40 L30 0 L42 0 L12 40Z" fill="${CYAN}" opacity="0.18"/>
  <g stroke="#000" stroke-width="1" opacity="0.7"><path d="M0 10H80M0 20H80M0 30H80M10 0V40M20 0V40M30 0V40M40 0V40M50 0V40M60 0V40M70 0V40"/></g>
  <rect x="1" y="1" width="78" height="38" fill="none" stroke="${MAG}" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const REAR_SCREEN = svg(
  `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="40" fill="#10020c"/>
  <path d="M4 8 l8 12 l-8 12 M14 8 l8 12 l-8 12" stroke="${RED}" stroke-width="3" fill="none"/>
  <path d="M156 8 l-8 12 l8 12 M146 8 l-8 12 l8 12" stroke="${RED}" stroke-width="3" fill="none"/>
  <text x="80" y="19" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="${MAG}">DISPERSE NOW</text>
  <text x="80" y="33" text-anchor="middle" font-family="monospace" font-size="8" fill="${CYAN}">NON-LETHAL FORCE AUTHORIZED</text>
  </svg>`,
  { size: 512 },
);

const TANK_LABEL = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="40" rx="4" fill="#0c1a2e"/>
  <path d="M0 30 Q10 22 20 30 T40 30 T60 30 T80 30 T100 30 T120 30 V40 H0Z" fill="${BLUE}"/>
  <text x="60" y="17" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="${WHITE}">AQUA-SUPPRESS</text>
  <rect x="0" y="0" width="120" height="3" fill="${YELLOW}"/>
  </svg>`,
  { size: 256 },
);

const HOOD_ID = svg(
  `<svg viewBox="0 0 100 36" xmlns="http://www.w3.org/2000/svg">
  <text x="50" y="28" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="${YELLOW}" stroke="#10121c" stroke-width="1.5">RC-07</text>
  </svg>`,
  { size: 256 },
);

// ---------- paints ----------
const HULL = paint((p, n) => {
  const base = n.y > 0.6 ? "#2d3659" : "#191d36";
  if (Math.abs(n.x) > 0.5 && p.y > 0.6 && p.y < 0.74)
    return ((Math.floor((p.z + p.y) / 0.14) % 2) + 2) % 2 ? YELLOW : "#10121c";
  if (Math.abs(n.x) > 0.5 && (p.z / 0.8 - Math.floor(p.z / 0.8)) < 0.014 && p.y > 0.75) return "#06070d";
  const grime = smoothstep(1.0, 0.45, p.y) * (0.5 + 0.5 * noise(p, 0.3, 3));
  let c = mix(base, "#07080f", grime * 0.7);
  if (n.y < -0.3 && p.y < 0.8) c = mix(c, MAG, 0.15);
  c = mix(c, "#4a5a8c", 0.18 * smoothstep(0.6, 1, n.y) * noise(p, 0.15, 8));
  return c;
});
const IRON = paint((p) => mix("#2b2d3c", "#0e0f16", noise(p, 0.12, 5)));
const TANK = countershade(stripes("#dfe8f5", "#2a62ff", { size: 0.4, axis: "z", width: 0.28, wobble: 0 }), "#7f8db0");
const HAZARD = stripes("#10121c", YELLOW, { size: 0.12, axis: "x", width: 0.5, wobble: 0 });
const CHASSIS = paint((p) => mix("#0a0b12", "#1a1c28", noise(p, 0.1, 2)));

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  const box = (size: V, at: V, color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...opts });
  const neon = (size: V, at: V, color: string, s = 1.5) => glow(box(size, at, color), s);
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, opts: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...opts });
  const cyl = (r: number, len: number, at: V, dir: V, color: any, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir });

  // ----- undercarriage -----
  box([1.7, 0.3, 4.6], [0, 0.4, 0], CHASSIS);
  for (const z of [1.7, -0.9, -1.9]) cyl(0.08, 2.4, [0, 0.54, z], [1, 0, 0], STEEL, 8);

  // ----- main hull: side profile extruded across the width -----
  b.extrude(
    [
      [-2.5, 0.45],
      [2.45, 0.45],
      [2.6, 0.6],
      [2.6, 1.15],
      [2.0, 1.4],
      [1.65, 1.45],
      [0.95, 2.2],
      [0.8, 2.3],
      [-2.4, 2.3],
      [-2.5, 2.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.1, bevel: 0.05, color: HULL, name: "hull" },
  );

  // windshield (sloped, HUD glass)
  const wn: V = [0, 0.68, 0.73];
  glow(
    plane(1.8, 1.02, HUD, [0, 1.825 + wn[1] * 0.025, 1.3 + wn[2] * 0.025], wn, { up: [0, 1, -0.2] }),
    0.9,
  );
  // windshield frame
  box([1.9, 0.07, 0.07], [0, 1.45, 1.66], DARK);
  box([1.9, 0.07, 0.07], [0, 2.22, 0.93], DARK);

  // side windows + door seams + handles
  for (const s of [1, -1]) {
    plane(0.85, 0.42, SIDE_GLASS, [s * 1.058, 1.85, 0.72], [s, 0, 0]);
    box([0.02, 1.3, 0.03], [s * 1.055, 1.3, 0.2], DARK);
    box([0.02, 1.0, 0.03], [s * 1.055, 1.12, 1.25], DARK);
    box([0.03, 0.06, 0.22], [s * 1.065, 1.55, 0.35], STEEL);
    // mirrors
    b.rod([s * 1.05, 1.75, 1.3], [s * 1.28, 1.8, 1.4], 0.025, STEEL);
    box([0.06, 0.26, 0.16], [s * 1.3, 1.82, 1.42], DARK);
    neon([0.02, 0.2, 0.1], [s * 1.332, 1.82, 1.42], CYAN, 1.2);
    // flank neon strips
    neon([0.014, 0.035, 2.5], [s * 1.054, 1.04, -1.1], MAG, 1.8);
    neon([0.014, 0.03, 2.3], [s * 1.054, 2.12, -1.2], CYAN, 1.8);
    neon([0.014, 0.03, 0.6], [s * 1.054, 1.5, 0.8], CYAN, 1.2);
    // underglow
    neon([0.05, 0.03, 4.4], [s * 0.98, 0.44, 0], MAG, 2);
    // corporate logo
    plane(1.75, 0.79, LOGO, [s * 1.058, 1.65, -1.2], [s, 0, 0]);
    // running board
    box([0.2, 0.06, 1.1], [s * 1.12, 0.62, 0.35], STEEL);
    // camera pods
    box([0.12, 0.1, 0.14], [s * 1.1, 2.1, 0.45], DARK);
    glow(b.part(new THREE.CircleGeometry(0.03, 8), RED, { at: [s * 1.17, 2.1, 0.45], dir: [s, 0, 0], axis: "z" }), 2);
  }

  // ----- hood details -----
  plane(0.9, 0.32, HOOD_ID, [0, 1.44, 1.88], [0, 1, 0], { up: [0, 0, -1] });
  box([1.9, 0.06, 0.4], [0, 1.43, 1.4], DARK);
  for (let i = -3; i <= 3; i++) box([0.04, 0.03, 0.3], [i * 0.12, 1.455, 1.4], STEEL);

  // ----- front fascia -----
  for (const s of [1, -1]) {
    neon([0.36, 0.12, 0.05], [s * 0.82, 1.03, 2.6], WHITE, 2);
    neon([0.12, 0.12, 0.05], [s * 1.0, 1.03, 2.6], AMBER, 1.6);
  }
  neon([0.9, 0.05, 0.05], [0, 1.1, 2.61], CYAN, 2);
  for (let i = -2; i <= 2; i++) neon([0.05, 0.14, 0.04], [i * 0.14, 0.98, 2.61], MAG, 1.6);
  // ram bumper
  b.part(new THREE.BoxGeometry(2.3, 0.46, 0.42), IRON, { at: [0, 0.72, 2.62] });
  box([2.0, 0.14, 0.03], [0, 0.72, 2.84], HAZARD);
  box([2.3, 0.1, 0.5], [0, 0.45, 2.6], DARK);
  for (const s of [1, -1]) {
    b.rod([s * 0.75, 0.9, 2.75], [s * 0.75, 1.55, 2.7], 0.05, STEEL);
    b.rod([s * 0.35, 0.9, 2.75], [s * 0.35, 1.55, 2.7], 0.05, STEEL);
    neon([0.08, 0.06, 0.05], [s * 1.12, 0.72, 2.84], RED, 1.6);
  }
  b.rod([-0.78, 1.55, 2.7], [0.78, 1.55, 2.7], 0.045, STEEL);
  b.rod([-0.78, 1.2, 2.74], [0.78, 1.2, 2.74], 0.04, STEEL);
  for (let i = -5; i <= 5; i++) cyl(0.014, 0.03, [i * 0.2, 0.85, 2.84], [0, 0, 1], YELLOW, 6);

  // ----- rear -----
  box([2.2, 0.3, 0.32], [0, 0.6, -2.62], IRON);
  box([0.04, 1.5, 0.03], [0, 1.2, -2.51], DARK);
  box([2.0, 0.03, 0.03], [0, 0.55 + 0.7, -2.51], DARK);
  glow(plane(1.6, 0.4, REAR_SCREEN, [0, 1.75, -2.515], [0, 0, -1]), 1.4);
  box([1.7, 0.45, 0.02], [0, 1.75, -2.505], DARK);
  for (const s of [1, -1]) {
    neon([0.5, 0.12, 0.05], [s * 0.75, 1.1, -2.53], RED, 2);
    neon([0.1, 0.9, 0.05], [s * 1.0, 1.55, -2.53], RED, 1.8);
    cyl(0.04, 0.2, [s * 0.9, 0.9, -2.58], [0, 0, 1], STEEL, 6);
  }
  box([1.0, 0.06, 0.4], [0, 0.4, -2.75], STEEL);
  neon([1.9, 0.04, 0.04], [0, 0.46, -2.79], MAG, 2);

  // ----- wheels -----
  const wheelZ = [1.7, -0.9, -1.9];
  for (const z of wheelZ)
    for (const s of [1, -1]) {
      const x = s * 1.15;
      cyl(0.55, 0.36, [x, 0.54, z], [1, 0, 0], TIRE, 14);
      cyl(0.32, 0.38, [x, 0.54, z], [1, 0, 0], STEEL, 10);
      cyl(0.27, 0.04, [s * 1.34, 0.54, z], [1, 0, 0], "#20253c", 10);
      glow(
        b.part(new THREE.TorusGeometry(0.34, 0.025, 5, 16), CYAN, { at: [s * 1.345, 0.54, z], dir: [s, 0, 0], axis: "z" }),
        2,
      );
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        cyl(0.025, 0.03, [s * 1.355, 0.54 + Math.cos(a) * 0.15, z + Math.sin(a) * 0.15], [s, 0, 0], YELLOW, 6);
      }
      // fender
      box([0.55, 0.08, 1.4], [s * 1.12, 1.18, z], HULL);
      box([0.55, 0.3, 0.06], [s * 1.12, 1.02, z + 0.7], HULL);
      box([0.55, 0.3, 0.06], [s * 1.12, 1.02, z - 0.7], HULL);
      if (z < 0) box([0.4, 0.4, 0.03], [s * 1.12, 0.35, z - 0.78], DARK);
    }

  // ----- roof -----
  // light bar
  box([1.6, 0.12, 0.26], [0, 2.36, 0.55], DARK);
  for (let i = 0; i < 8; i++) {
    const c = i < 4 ? RED : BLUE;
    neon([0.18, 0.11, 0.22], [-0.7 + i * 0.2, 2.44, 0.55], c, 2.4);
  }
  neon([1.5, 0.03, 0.03], [0, 2.36, 0.69], CYAN, 2);
  for (const s of [1, -1]) {
    box([0.2, 0.14, 0.2], [s * 0.92, 2.37, 0.7], DARK);
    neon([0.16, 0.1, 0.04], [s * 0.92, 2.37, 0.81], WHITE, 2.5);
  }
  // rails
  for (const s of [1, -1]) {
    b.rod([s * 0.98, 2.5, -2.3], [s * 0.98, 2.5, 0.3], 0.025, STEEL);
    for (const z of [-2.3, -1.4, -0.5, 0.3]) b.rod([s * 0.98, 2.3, z], [s * 0.98, 2.5, z], 0.02, STEEL);
  }
  // sensor dome
  b.part(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#12141f", { at: [-0.6, 2.3, 0.2] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [-0.6, 2.42, 0.31] }), 2.5);
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.85, 2.3, -2.25], [s * 0.85, 3.3, -2.25], [0.025, 0.012], STEEL);
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { at: [s * 0.85, 3.32, -2.25] }), 3);
  }
  // water tank
  b.lathe(
    [
      [0, -0.9],
      [0.25, -0.88],
      [0.4, -0.7],
      [0.4, 0.7],
      [0.25, 0.88],
      [0, 0.9],
    ],
    { at: [0, 2.72, -1.5], axis: [0, 0, 1], segments: 12, smoothing: 1, color: TANK, name: "tank" },
  );
  for (const z of [-2.1, -1.5, -0.9]) cyl(0.415, 0.07, [0, 2.72, z], [0, 0, 1], DARK, 12);
  for (const s of [1, -1]) plane(0.8, 0.27, TANK_LABEL, [s * 0.42, 2.74, -1.5], [s, 0, 0]);
  box([0.9, 0.12, 0.3], [0, 2.34, -1.9], DARK);
  box([0.9, 0.12, 0.3], [0, 2.34, -1.1], DARK);
  neon([0.05, 0.05, 1.5], [0, 3.14, -1.5], CYAN, 1.6);
  // fill port
  cyl(0.07, 0.1, [0, 3.14, -2.2], [0, 1, 0], STEEL, 8);

  // gas launchers
  for (const s of [1, -1]) {
    box([0.34, 0.2, 0.55], [s * 0.75, 2.4, -0.35], IRON);
    for (const i of [-1, 1])
      for (const j of [-1, 1]) {
        const a: V = [s * 0.75 + i * 0.08, 2.5, -0.35 + j * 0.12];
        b.rod(a, [a[0], a[1] + 0.3, a[2] + 0.14], 0.045, STEEL);
        glow(
          b.part(new THREE.CircleGeometry(0.035, 6), AMBER, { at: [a[0], a[1] + 0.31, a[2] + 0.144], dir: [0, 0.3, 0.14], axis: "z" }),
          2,
        );
      }
  }

  // ----- water cannon turret -----
  cyl(0.46, 0.14, [0, 2.37, 0.0], [0, 1, 0], IRON, 12);
  glow(b.part(new THREE.TorusGeometry(0.46, 0.02, 4, 18), MAG, { at: [0, 2.44, 0], dir: [0, 1, 0], axis: "z" }), 2);
  b.part(new THREE.BoxGeometry(0.72, 0.42, 0.78), paint((p) => mix("#2d3659", "#10121c", noise(p, 0.2, 6))), {
    at: [0, 2.7, 0.0],
  });
  box([0.8, 0.1, 0.5], [0, 2.95, -0.05], DARK);
  for (const s of [1, -1]) {
    box([0.04, 0.3, 0.5], [s * 0.38, 2.7, 0.05], HAZARD);
    // sight cam
    box([0.14, 0.14, 0.2], [s * 0.45, 2.85, 0.2], DARK);
    glow(b.part(new THREE.CircleGeometry(0.04, 8), CYAN, { at: [s * 0.45, 2.85, 0.305], dir: [0, 0, 1], axis: "z" }), 2);
  }
  // supply pipe
  b.sweep(catmull([[0, 2.55, -0.62], [0, 2.7, -0.5], [0, 2.72, -0.38]]), 0.07, { color: STEEL, sides: 6 });
  // barrel
  const d = new THREE.Vector3(0, 0.12, 1).normalize();
  const base = new THREE.Vector3(0, 2.76, 0.3);
  const P = (t: number): V => {
    const q = base.clone().addScaledVector(d, t);
    return [q.x, q.y, q.z];
  };
  b.rod(P(-0.1), P(1.4), 0.1, STEEL, { sides: 8 });
  b.rod(P(0.1), P(0.85), 0.155, "#1d2238", { sides: 8 });
  b.rod(P(0.85), P(0.95), 0.17, YELLOW, { sides: 8 });
  b.rod(P(1.4), P(1.75), [0.14, 0.2], DARK, { sides: 8 });
  glow(b.part(new THREE.TorusGeometry(0.19, 0.025, 5, 14), CYAN, { at: P(1.76), dir: [d.x, d.y, d.z], axis: "z" }), 2.5);
  glow(b.part(new THREE.CircleGeometry(0.15, 10), "#5ad8ff", { at: P(1.745), dir: [d.x, d.y, d.z], axis: "z" }), 2);
  neon([0.03, 0.03, 0.6], [0, P(0.5)[1] + 0.17, P(0.5)[2]], CYAN, 2);
  // elevation arms
  for (const s of [1, -1]) b.rod([s * 0.3, 2.6, 0.1], P(0.15), 0.035, STEEL);

  // bumper rivets
  for (let i = -5; i <= 5; i++) cyl(0.015, 0.03, [i * 0.2, 0.52, 2.83], [0, 0, 1], STEEL, 6);

  return b.root;
}
