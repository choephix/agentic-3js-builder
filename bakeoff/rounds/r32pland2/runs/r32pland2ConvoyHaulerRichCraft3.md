```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler Aegis-7",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler with a roof turret, ram bumper, neon underglow and a sealed, glowing cargo pod.",
};

// ---------- palette ----------
const CYAN = "#19e6ff";
const MAG = "#ff2fa8";
const AMBER = "#ffb020";
const RED = "#ff2a2a";
const TIRE = "#14151a";
const TIRE2 = "#23252e";
const STEEL = "#8e9ab0";
const DARK = "#101319";
const GUN = "#2b3340";
const YEL = "#ffc400";

// ---------- paints ----------
const HULL = paint((p, n) => {
  let c = mix("#36435a", "#546680", noise(p, 0.6, 1));
  c = mix(c, "#8fa2bd", 0.55 * smoothstep(0.68, 0.8, noise(p, 0.07, 4)) * (0.4 + 0.6 * smoothstep(0, 1, n.y + 0.4)));
  c = mix(c, "#16181f", 0.65 * smoothstep(1.5, 0.5, p.y));
  c = mix(c, "#7388a8", 0.25 * smoothstep(0.6, 1, n.y));
  return c;
});
const POD = paint((p, n) => {
  let c = mix("#1c2832", "#2b3d4a", noise(p, 0.5, 7));
  c = mix(c, "#0a0d12", 0.6 * smoothstep(1.7, 1.2, p.y));
  c = mix(c, "#4a6578", 0.3 * smoothstep(0.7, 1, n.y));
  c = mix(c, "#6a7f90", 0.35 * smoothstep(0.72, 0.8, noise(p, 0.06, 9)));
  return c;
});
const CAB = panelled(HULL, { size: 0.55, aspect: 0.8, rivets: 0.09, seam: "#07090d" });
const PODP = panelled(POD, { size: 0.95, aspect: 0.62, rivets: 0.1, seam: "#05080c" });
const FRAME = paint((p, n) => mix(mix("#242a35", "#3b4556", noise(p, 0.3, 3)), "#5b6980", 0.3 * smoothstep(0.6, 1, n.y)));

// ---------- textures ----------
let haz = "";
for (let i = -2; i < 10; i++)
  haz += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="${YEL}"/>`;
const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#14161c"/>${haz}</svg>`, { size: 256 });

const EMBLEM = svg(
  `<svg viewBox="0 0 120 100">
  <rect x="2" y="2" width="116" height="96" rx="6" fill="#0b1118" stroke="${MAG}" stroke-width="3"/>
  <rect x="8" y="8" width="104" height="84" rx="3" fill="none" stroke="${CYAN}" stroke-width="1.2" stroke-dasharray="6 3"/>
  <path d="M60 14 L90 24 L90 52 Q90 68 60 80 Q30 68 30 52 L30 24 Z" fill="#12202c" stroke="${CYAN}" stroke-width="3"/>
  <rect x="48" y="40" width="24" height="20" rx="2" fill="${AMBER}"/>
  <path d="M51 40 V34 Q51 24 60 24 Q69 24 69 34 V40" fill="none" stroke="${AMBER}" stroke-width="4"/>
  <circle cx="60" cy="50" r="3.5" fill="#101319"/><rect x="58.8" y="50" width="2.4" height="7" fill="#101319"/>
  <text x="60" y="91" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="${CYAN}">SEALED CARGO // LOT 7-KX</text>
  <path d="M12 14h14M12 18h10M94 14h14M98 18h10" stroke="${MAG}" stroke-width="2"/>
  </svg>`,
  { size: 384 },
);

const HATCH = svg(
  `<svg viewBox="0 0 120 100">
  <rect x="2" y="2" width="116" height="96" rx="6" fill="#0d1218" stroke="${YEL}" stroke-width="4"/>
  <text x="60" y="62" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="46" fill="${YEL}">07</text>
  <text x="60" y="22" text-anchor="middle" font-family="monospace" font-size="9" fill="${CYAN}">AEGIS ESCORT</text>
  <text x="60" y="82" text-anchor="middle" font-family="monospace" font-size="8" fill="${MAG}">PROPERTY OF VANTA CORP</text>
  <path d="M8 90h104" stroke="${CYAN}" stroke-width="1.5" stroke-dasharray="3 2"/>
  </svg>`,
  { size: 384 },
);

const REAR = svg(
  `<svg viewBox="0 0 120 64">
  <rect width="120" height="64" fill="#10161d"/>
  <rect x="3" y="3" width="54" height="58" fill="#1b2630" stroke="#05080c" stroke-width="2"/>
  <rect x="63" y="3" width="54" height="58" fill="#1b2630" stroke="#05080c" stroke-width="2"/>
  <rect x="8" y="27" width="104" height="10" fill="${RED}"/>
  <text x="60" y="35" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#200">DO NOT OPEN // SEAL ACTIVE</text>
  <circle cx="22" cy="14" r="5" fill="none" stroke="${CYAN}" stroke-width="2"/><circle cx="98" cy="14" r="5" fill="none" stroke="${CYAN}" stroke-width="2"/>
  <path d="M3 3 L21 3 L3 21Z M117 3 L99 3 L117 21Z M3 61 L21 61 L3 43Z M117 61 L99 61 L117 43Z" fill="${YEL}"/>
  </svg>`,
  { size: 384 },
);

const WINDSHIELD = svg(
  `<svg viewBox="0 0 100 40"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173a52"/><stop offset="1" stop-color="#050b12"/></linearGradient></defs>
  <rect width="100" height="40" fill="url(#g)"/>
  <path d="M-5 40 L25 0 L33 0 L3 40Z M45 40 L70 0 L74 0 L49 40Z" fill="${CYAN}" opacity="0.22"/>
  <rect x="62" y="22" width="30" height="12" fill="none" stroke="${CYAN}" stroke-width="0.8"/>
  <path d="M65 28h10l3-4 4 6h6" stroke="${MAG}" stroke-width="1" fill="none"/>
  <rect x="0" y="0" width="100" height="3" fill="#07090d"/>
  </svg>`,
  { size: 256 },
);

const SIDEWIN = svg(
  `<svg viewBox="0 0 60 36"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a4660"/><stop offset="1" stop-color="#050b12"/></linearGradient></defs>
  <rect width="60" height="36" fill="url(#g)"/><path d="M8 36 L30 0 L36 0 L14 36Z" fill="${CYAN}" opacity="0.2"/></svg>`,
  { size: 128 },
);

const HEADLIGHT = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" rx="4" fill="#0b0d12"/>
  <rect x="4" y="5" width="56" height="14" rx="3" fill="#e8fdff"/><rect x="4" y="10" width="56" height="4" fill="${CYAN}"/></svg>`,
  { size: 128 },
);
const TAIL = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#220505"/><rect x="3" y="3" width="58" height="10" rx="2" fill="${RED}"/><rect x="3" y="7" width="58" height="2" fill="#ffb0a0"/></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#07090c"/>${[0, 1, 2, 3, 4, 5]
    .map((i) => `<rect x="4" y="${2 + i * 3.6}" width="56" height="1.8" fill="${i % 2 ? CYAN : MAG}"/>`)
    .join("")}</svg>`,
  { size: 128 },
);
const SIGN = svg(
  `<svg viewBox="0 0 120 36"><rect width="120" height="36" rx="4" fill="#0a0710"/><rect x="2" y="2" width="116" height="32" rx="3" fill="none" stroke="${MAG}" stroke-width="2"/>
  <text x="60" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="23" fill="${CYAN}" stroke="#bff" stroke-width="0.6">GUARD 07</text></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 48 16"><rect width="48" height="16" rx="2" fill="#e9e4c8"/><text x="24" y="12.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#1a1a22">KX-0771</text></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg viewBox="0 0 40 16"><rect width="40" height="16" rx="3" fill="#06080c"/><rect x="3" y="4" width="34" height="8" rx="3" fill="${RED}"/><rect x="16" y="2" width="8" height="12" fill="#ffd0d0"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) => b.part(geo, color, { at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r1: number, r2: number, h: number, seg: number, color: any, at: number[], dir: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(r1, r2, h, seg), color, at, { dir, flat: true, ...o });
  const plane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, ...o });
  const lit = (w: number, h: number, d: number, color: string, at: number[], s = 1.4) =>
    glow(box(w, h, d, color, at), s);

  // ---------- chassis ----------
  box(2.2, 0.45, 8.2, FRAME, [0, 0.95, -0.3]);
  box(1.5, 0.3, 7.6, DARK, [0, 0.62, -0.2]);
  for (const z of [2.5, -1.0, -2.6]) cyl(0.12, 0.12, 2.9, 8, GUN, [0, 0.7, z], [1, 0, 0]);
  // underglow
  for (const s of [1, -1]) lit(0.12, 0.05, 7.4, MAG, [s * 1.0, 0.58, -0.2], 1.6);
  lit(1.6, 0.05, 0.12, CYAN, [0, 0.58, 3.6], 1.6);
  lit(1.6, 0.05, 0.12, CYAN, [0, 0.58, -3.9], 1.6);

  // ---------- wheels ----------
  const WY = 0.7;
  const wheel = (x: number, z: number) => {
    const s = Math.sign(x);
    cyl(0.72, 0.72, 0.62, 10, TIRE, [x, WY, z], [1, 0, 0]);
    cyl(0.5, 0.5, 0.64, 10, TIRE2, [x, WY, z], [1, 0, 0]);
    cyl(0.36, 0.36, 0.68, 8, STEEL, [x, WY, z], [1, 0, 0]);
    P(new THREE.TorusGeometry(0.26, 0.025, 4, 12), CYAN, [x + s * 0.37, WY, z], { dir: [s, 0, 0], axis: "z" });
    glow(b.part(new THREE.TorusGeometry(0.26, 0.025, 4, 12), CYAN, { at: [x + s * 0.372, WY, z], dir: [s, 0, 0], axis: "z" }), 1.6);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      box(0.05, 0.07, 0.07, "#cfd6e4", [x + s * 0.36, WY + Math.sin(a) * 0.14, z + Math.cos(a) * 0.14]);
    }
    // fender arch
    const arch: [number, number][] = [
      [-0.98, 0.55], [-0.62, 0.98], [0.62, 0.98], [0.98, 0.55], [0.98, 0.45],
      [0.8, 0.45], [0.55, 0.82], [-0.55, 0.82], [-0.8, 0.45], [-0.98, 0.45],
    ];
    b.extrude(arch, { at: [x, WY, z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.85, bevel: 0.03, color: CAB });
    box(0.9, 0.05, 0.5, YEL, [x, WY + 0.99, z]); // hazard cap
  };
  for (const s of [1, -1]) for (const z of [2.5, -1.0, -2.6]) wheel(s * 1.3, z);
  for (const s of [1, -1]) box(0.7, 0.55, 0.06, DARK, [s * 1.3, 0.55, -3.45]); // mud flaps

  // ---------- cab ----------
  box(2.3, 1.7, 1.6, CAB, [0, 2.05, 1.95]);
  box(2.45, 0.12, 1.9, FRAME, [0, 2.96, 2.0]);
  plane(WINDSHIELD, 2.05, 0.82, [0, 2.5, 2.77], [0, 0.18, 1]);
  glow(plane(WINDSHIELD, 2.05, 0.82, [0, 2.5, 2.775], [0, 0.18, 1]), 0.5);
  box(2.3, 0.1, 0.1, GUN, [0, 2.93, 2.78]);
  for (const s of [1, -1]) {
    glow(plane(SIDEWIN, 1.15, 0.65, [s * 1.16, 2.5, 2.05], [s, 0, 0]), 0.5);
    box(0.08, 0.7, 1.3, GUN, [s * 1.16, 1.55, 1.95]);
    plane(HAZARD, 1.2, 0.2, [s * 1.205, 1.45, 1.95], [s, 0, 0]);
    box(0.06, 0.04, 1.6, DARK, [s * 1.17, 2.12, 1.95]);
    // mirror
    box(0.4, 0.06, 0.06, GUN, [s * 1.35, 2.42, 2.55]);
    box(0.1, 0.5, 0.28, GUN, [s * 1.55, 2.42, 2.55]);
    glow(plane(SIDEWIN, 0.24, 0.42, [s * 1.605, 2.42, 2.55], [s, 0, 0]), 0.8);
    // exhaust stack
    cyl(0.1, 0.1, 2.3, 8, GUN, [s * 1.3, 2.4, 1.3], [0, 1, 0]);
    cyl(0.16, 0.1, 0.18, 8, STEEL, [s * 1.3, 3.65, 1.3], [0, 1, 0]);
    glow(P(new THREE.TorusGeometry(0.13, 0.02, 4, 8), AMBER, [s * 1.3, 3.74, 1.3], { dir: [0, 1, 0], axis: "z" }), 1.8);
    box(0.08, 0.1, 0.3, GUN, [s * 1.22, 1.6, 1.3]);
    cyl(0.12, 0.12, 0.16, 8, GUN, [s * 1.3, 1.5, 1.3], [0, 1, 0]);
    // side fuel tank
    cyl(0.32, 0.32, 1.5, 8, "#53606e", [s * 1.25, 0.85, 0.75], [0, 0, 1]);
    for (const dz of [-0.45, 0.45]) cyl(0.345, 0.345, 0.1, 8, YEL, [s * 1.25, 0.85, 0.75 + dz], [0, 0, 1]);
    // headlights
    box(0.5, 0.3, 0.12, DARK, [s * 0.78, 1.72, 4.0]);
    glow(plane(HEADLIGHT, 0.44, 0.17, [s * 0.78, 1.72, 4.07], [0, 0, 1]), 1.8);
    // corner armour & push bars
    b.extrude([[0, 0], [0.55, 0], [0.75, 0.55], [0.15, 0.7], [0, 0.4]], {
      at: [s * 1.2, 1.15, 3.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.015, color: CAB,
    });
    b.spike([s * 1.05, 1.15, 4.4], [s * 0.35, 0.1, 1], 0.5, 0.08, { color: STEEL });
    b.rod([s * 0.9, 0.75, 4.55], [s * 0.9, 1.6, 4.45], 0.04, GUN);
    // cab roof beacon mast
    b.rod([s * 0.9, 3.02, 1.4], [s * 0.9, 4.0, 1.4], 0.025, GUN);
    glow(box(0.08, 0.08, 0.08, s > 0 ? MAG : CYAN, [s * 0.9, 4.05, 1.4]), 2);
  }
  // hood
  b.frustumBox([0, 1.65, 2.72], [0, 1.6, 4.05], [2.25, 0.9], [2.05, 0.7], { color: CAB });
  box(1.4, 0.06, 1.1, GUN, [0, 2.12, 3.4]);
  for (let k = 0; k < 3; k++) glow(box(1.1, 0.02, 0.06, CYAN, [0, 2.16, 3.0 + k * 0.35]), 1.2);
  glow(plane(GRILLE, 1.1, 0.4, [0, 1.55, 4.1], [0, 0, 1]), 1.0);
  // bumper
  b.frustumBox([0, 0.95, 4.0], [0, 0.95, 4.42], [2.7, 0.5], [2.6, 0.5], { color: FRAME });
  plane(HAZARD, 2.5, 0.28, [0, 0.95, 4.43], [0, 0, 1]);
  b.extrude([[-1.3, 0], [1.3, 0], [1.0, 0.5], [-1.0, 0.5]], {
    at: [0, 0.46, 4.4], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, bevel: 0.015, color: GUN,
  });
  box(0.5, 0.2, 0.04, "#0b0d12", [0, 1.28, 4.44]);
  plane(PLATE, 0.46, 0.15, [0, 1.28, 4.47], [0, 0, 1]);
  for (let k = 0; k < 3; k++) box(0.1, 0.8, 0.1, GUN, [-0.5 + k * 0.5, 1.25, 4.5]);
  b.rod([-0.55, 1.65, 4.5], [0.55, 1.65, 4.5], 0.05, GUN);

  // roof light bar
  [MAG, CYAN, MAG, CYAN].forEach((c, i) => lit(0.4, 0.1, 0.12, c, [-0.6 + i * 0.4, 3.08, 2.75], 1.8));

  // ---------- turret ----------
  b.lathe([[0, 0], [0.52, 0], [0.52, 0.1], [0.4, 0.2], [0.4, 0.3], [0, 0.3]], {
    at: [0, 3.02, 1.85], segments: 8, color: GUN,
  });
  box(0.8, 0.34, 0.9, GUN, [0, 3.48, 1.85]);
  b.frustumBox([0, 3.5, 2.3], [0, 3.5, 2.55], [0.8, 0.34], [0.5, 0.22], { color: STEEL });
  for (const s of [1, -1]) {
    box(0.12, 0.3, 0.5, STEEL, [s * 0.46, 3.5, 1.85]);
    b.rod([s * 0.22, 3.5, 2.5], [s * 0.22, 3.5, 3.6], 0.045, DARK);
    cyl(0.07, 0.07, 0.22, 6, GUN, [s * 0.22, 3.5, 3.55], [0, 0, 1]);
    b.rod([s * 0.22, 3.5, 2.5], [s * 0.22, 3.5, 3.0], 0.075, STEEL);
  }
  glow(plane(EYE, 0.36, 0.14, [0, 3.6, 2.58], [0, 0.35, 1]), 1.6);
  b.rod([-0.3, 3.65, 1.5], [-0.3, 4.3, 1.5], 0.015, GUN);
  glow(box(0.06, 0.06, 0.06, CYAN, [-0.3, 4.33, 1.5]), 2);

  // ---------- cargo pod ----------
  const podProfile: [number, number][] = [
    [-4.3, 1.55], [-4.0, 1.2], [0.65, 1.2], [0.95, 1.55],
    [0.95, 2.75], [0.65, 3.1], [-4.0, 3.1], [-4.3, 2.75],
  ];
  b.extrude(podProfile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: PODP });
  // ribs
  for (const z of [-3.9, -2.0, -0.1]) {
    for (const s of [1, -1]) box(0.12, 1.98, 0.16, FRAME, [s * 1.19, 2.15, z]);
    box(2.5, 0.12, 0.16, FRAME, [0, 3.12, z]);
    box(2.5, 0.12, 0.16, FRAME, [0, 1.2, z]);
    for (const s of [1, -1]) {
      box(0.18, 0.18, 0.2, YEL, [s * 1.19, 3.1, z]);
      box(0.18, 0.18, 0.2, YEL, [s * 1.19, 1.2, z]);
    }
  }
  for (const s of [1, -1]) {
    plane(EMBLEM, 1.5, 1.25, [s * 1.165, 2.3, -1.05], [s, 0, 0]);
    glow(plane(EMBLEM, 1.5, 1.25, [s * 1.17, 2.3, -1.05], [s, 0, 0]), 0.9);
    glow(plane(HATCH, 1.5, 1.25, [s * 1.17, 2.3, -2.95], [s, 0, 0]), 0.6);
    lit(0.04, 0.05, 4.2, s > 0 ? MAG : CYAN, [s * 1.17, 1.5, -2.0], 1.6);
    lit(0.04, 0.05, 4.2, s > 0 ? CYAN : MAG, [s * 1.17, 2.95, -2.0], 1.6);
    plane(HAZARD, 4.0, 0.14, [s * 1.17, 1.32, -2.0], [s, 0, 0]);
    // rear light tower
    box(0.2, 0.7, 0.2, GUN, [s * 1.2, 1.5, -4.2]);
    glow(plane(TAIL, 0.16, 0.5, [s * 1.2, 1.5, -4.31], [0, 0, -1]), 1.6);
  }
  glow(plane(REAR, 2.0, 1.1, [0, 2.15, -4.32], [0, 0, -1]), 0.8);
  box(2.1, 0.08, 0.1, YEL, [0, 2.75, -4.34]);
  // rear bumper
  b.frustumBox([0, 0.95, -4.4], [0, 0.95, -4.7], [2.6, 0.45], [2.5, 0.45], { color: FRAME });
  plane(HAZARD, 2.4, 0.25, [0, 0.95, -4.71], [0, 0, -1]);
  lit(1.2, 0.08, 0.06, RED, [0, 1.25, -4.4], 1.6);
  // top seal
  box(1.2, 0.06, 1.2, GUN, [0, 3.13, -2.0]);
  glow(P(new THREE.TorusGeometry(0.42, 0.04, 4, 8), RED, [0, 3.18, -2.0], { dir: [0, 1, 0], axis: "z" }), 1.8);
  cyl(0.16, 0.16, 0.1, 6, RED, [0, 3.2, -2.0], [0, 1, 0], {});
  // vents
  for (let k = 0; k < 3; k++) glow(box(0.5, 0.04, 0.1, AMBER, [0.7, 3.13, -0.9 - k * 0.25]), 1.3);
  // neon sign
  for (const z of [-3.2, -2.8]) box(0.08, 0.35, 0.08, GUN, [0, 3.28, z]);
  for (const s of [1, -1]) glow(plane(SIGN, 1.5, 0.45, [s * 0.05, 3.7, -3.0], [s, 0, 0]), 1.5);
  // satellite dish & antennas
  b.lathe([[0, 0], [0.34, 0.16], [0.34, 0.2], [0, 0.05]], {
    at: [-0.65, 3.35, -3.5], axis: [0.35, 1, -0.35], segments: 8, color: STEEL,
  });
  b.rod([-0.65, 3.12, -3.5], [-0.65, 3.4, -3.5], 0.04, GUN);
  for (const [x, z, h] of [[0.7, -3.7, 1.0], [0.95, -3.2, 0.7], [-0.9, -0.6, 0.9]] as const) {
    b.rod([x, 3.1, z], [x, 3.1 + h, z], 0.018, GUN);
    glow(box(0.06, 0.06, 0.06, h > 0.8 ? MAG : CYAN, [x, 3.14 + h, z]), 2);
    box(0.25, 0.03, 0.03, GUN, [x, 3.1 + h * 0.6, z]);
  }
  // pod corner guard braces
  for (const s of [1, -1]) {
    b.rod([s * 1.2, 1.2, 0.95], [s * 1.2, 3.1, 0.95], 0.07, GUN);
    b.spike([s * 1.1, 3.1, 0.95], [s * 0.2, 1, 0.3], 0.35, 0.07, { color: STEEL });
  }

  return b.root;
}
```