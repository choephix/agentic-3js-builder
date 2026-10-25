```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured convoy hauler: six-wheel armoured cab with roof turret and neon trim, guarding a sealed hazard cargo pod on a cradled bed.",
};

// ---------- palette ----------
const MAGENTA = "#ff2f9a";
const CYAN = "#34f0ff";
const AMBER = "#ffb02e";
const RED = "#ff2b3a";
const TIRE = "#14161a";
const DARK = "#0d1015";
const GUN = "#1c2128";
const YELLOW = "#f2c418";

// ---------- paints ----------
const armorBase = paint((p, n) => {
  const base = mix("#262c36", "#38414f", noise(p, 0.5, 3));
  const top = mix(base, "#53627a", smoothstep(0.5, 1, n.y) * 0.5);
  const mud = smoothstep(1.3, 0.4, p.y) * smoothstep(0.4, 0.7, noise(p, 0.2, 9));
  return mix(top, "#3a3126", mud * 0.7);
});
const cabBase = paint((p, n) => (n.y > 0.55 && Math.abs(p.x) < 0.16 ? "#d41b7a" : armorBase));
const ARM = panelled(armorBase, { size: 0.55, aspect: 0.7, rivets: 0.14, seam: "#07090c" });
const CAB = panelled(cabBase, { size: 0.6, aspect: 0.7, rivets: 0.14, seam: "#07090c" });
const podBase = paint((p, n) => {
  const base = mix("#aab4bf", "#d3dae0", noise(p, 0.6, 5));
  const shade = mix(base, "#5c6874", smoothstep(0.2, -0.9, n.y) * 0.8);
  const grime = smoothstep(2.2, 1.3, p.y) * smoothstep(0.35, 0.7, noise(p, 0.25, 11));
  return mix(shade, "#4a4036", grime * 0.6);
});
const POD = panelled(podBase, { size: 0.7, aspect: 0.8, rivets: 0.2, seam: "#1a1e24" });
const IRON = metal("iron");
const STEEL = metal("steel", { tarnish: 0.3 });

// ---------- textures ----------
let stripes = "";
for (let i = -2; i < 20; i++) stripes += `<polygon points="${i * 6},16 ${i * 6 + 3},16 ${i * 6 + 11},0 ${i * 6 + 8},0" fill="${YELLOW}"/>`;
const HAZARD = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#1b1d22"/>${stripes}</svg>`, { size: 256 });

const VISOR = svg(
  `<svg viewBox="0 0 100 32"><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f5f78"/><stop offset="1" stop-color="#06202c"/></linearGradient></defs>
  <rect x="1" y="1" width="98" height="30" rx="4" fill="url(#v)" stroke="#071016" stroke-width="2"/>
  <path d="M6 24 L30 24 L36 18 L64 18 L70 24 L94 24" stroke="${CYAN}" stroke-width="1.6" fill="none"/>
  <circle cx="50" cy="12" r="6" fill="none" stroke="${MAGENTA}" stroke-width="1.4"/><path d="M50 3v5M50 16v5M41 12h5M54 12h5" stroke="${MAGENTA}" stroke-width="1.2"/>
  <path d="M8 8h18M8 12h10M74 8h18M82 12h10" stroke="${CYAN}" stroke-width="1.2" opacity="0.8"/></svg>`,
  { size: 384 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 60 30"><rect x="1" y="1" width="58" height="28" rx="3" fill="#0a2a3a" stroke="#05090c" stroke-width="2"/>
  <path d="M5 22 L55 8" stroke="${CYAN}" stroke-width="1.5" opacity="0.7"/><path d="M5 27 L55 13" stroke="${MAGENTA}" stroke-width="1" opacity="0.6"/></svg>`,
  { size: 192 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 60 20"><rect width="60" height="20" fill="#070a0d"/>${[3, 7, 11, 15].map((y) => `<rect x="3" y="${y}" width="54" height="2" fill="${CYAN}"/>`).join("")}</svg>`,
  { size: 192 },
);
const TAIL = svg(
  `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#3a0509"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${2 + i * 6.2}" y="1" width="4.6" height="6" fill="${i % 3 === 1 ? "#ff7a86" : RED}"/>`).join("")}</svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 24"><rect x="1" y="1" width="58" height="22" rx="3" fill="#d8dde2" stroke="#0b0d10" stroke-width="2"/>
  <text x="30" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#16191d">CV-77</text></svg>`,
  { size: 192 },
);
const DOOR = svg(
  `<svg viewBox="0 0 80 40"><rect x="1" y="1" width="78" height="38" rx="3" fill="#161a20" stroke="${MAGENTA}" stroke-width="2"/>
  <text x="40" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="${MAGENTA}">ESCORT</text>
  <text x="40" y="33" text-anchor="middle" font-family="monospace" font-size="10" fill="${CYAN}">UNIT 77-H</text></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="8" fill="#12161b" stroke="${YELLOW}" stroke-width="4"/>
  <polygon points="50,12 86,66 14,66" fill="${YELLOW}" stroke="#000" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="50" cy="46" r="7" fill="none" stroke="#111" stroke-width="3.5"/>
  <path d="M50 39v-9M44 51l-8 5M56 51l8 5" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>
  <text x="50" y="82" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="${MAGENTA}">SEALED</text>
  <text x="50" y="94" text-anchor="middle" font-family="monospace" font-size="8" fill="${CYAN}">CARGO-09</text></svg>`,
  { size: 384 },
);

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, ...o });
  const neon = (w: number, h: number, d: number, color: string, at: number[], k = 1.5, o: any = {}) =>
    glow(box(w, h, d, color, at, o), k);
  const plane = (tex: any, w: number, h: number, at: number[], dir: number[], k = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
    if (k) glow(p, k);
    return p;
  };

  // ---------- chassis ----------
  box(1.9, 0.4, 8.8, GUN, [0, 0.95, -0.2]);
  box(1.4, 0.2, 8.4, IRON, [0, 0.72, -0.2]);
  const axles = [3.1, -2.2, -3.75];
  for (const z of axles) cyl(0.12, 2.6, 8, IRON, [0, 0.65, z], [1, 0, 0]);

  // ---------- wheels ----------
  for (const s of [1, -1]) {
    for (const z of axles) {
      const x = s * 1.25;
      cyl(0.65, 0.55, 12, TIRE, [x, 0.65, z], [1, 0, 0]);
      cyl(0.46, 0.58, 12, STEEL, [x, 0.65, z], [1, 0, 0]);
      glow(cyl(0.38, 0.6, 12, MAGENTA, [x, 0.65, z], [1, 0, 0]), 1.6);
      cyl(0.27, 0.64, 8, IRON, [x, 0.65, z], [1, 0, 0]);
      cyl(0.08, 0.7, 6, STEEL, [x, 0.65, z], [1, 0, 0]);
    }
    // rear fenders
    box(0.85, 0.1, 3.2, ARM, [s * 1.25, 1.42, -2.98]);
    box(0.06, 0.28, 3.2, ARM, [s * 1.66, 1.3, -2.98]);
    neon(0.05, 0.07, 0.3, AMBER, [s * 1.7, 1.32, -1.45], 1.6);
    neon(0.05, 0.07, 0.3, RED, [s * 1.7, 1.32, -4.5], 1.6);
    // mud flaps
    box(0.7, 0.5, 0.04, TIRE, [s * 1.25, 0.75, -4.5]);
    // fuel / battery tanks
    cyl(0.3, 1.8, 8, STEEL, [s * 1.35, 0.75, -0.4], [0, 0, 1]);
    for (const k of [-1, 0, 1]) cyl(0.32, 0.1, 8, IRON, [s * 1.35, 0.75, -0.4 + k * 0.6], [0, 0, 1]);
  }

  // ---------- cab ----------
  const cab = b.extrude(
    [
      [-1.0, 0], [-1.0, 2.0], [0.1, 2.2], [0.9, 1.6], [1.6, 1.3], [1.7, 0.9], [1.7, 0.3], [1.45, 0],
    ],
    { at: [0, 1.25, 2.6], x: [0, 0, 1], thickness: 2.5, bevel: 0.06, color: CAB },
  );
  void cab;
  plane(VISOR, 2.25, 0.8, [0, 3.166, 3.112], [0, 0.8, 0.6], 0.9);
  for (const s of [1, -1]) {
    plane(SIDEWIN, 1.1, 0.55, [s * 1.27, 3.0, 2.3], [s, 0, 0], 0.7);
    plane(DOOR, 0.9, 0.45, [s * 1.27, 2.1, 2.3], [s, 0, 0]);
    neon(0.05, 0.05, 2.4, MAGENTA, [s * 1.27, 1.45, 2.9], 1.7);
    // headlights
    neon(0.55, 0.14, 0.06, "#eaffff", [s * 0.9, 2.0, 4.32], 2.2);
    neon(0.55, 0.04, 0.06, MAGENTA, [s * 0.9, 1.85, 4.32], 1.6);
    // mirrors
    box(0.05, 0.05, 0.5, GUN, [s * 1.4, 2.8, 3.2], { rotation: [0, 0, 0] });
    box(0.1, 0.4, 0.28, GUN, [s * 1.62, 2.8, 3.3]);
    neon(0.02, 0.3, 0.2, CYAN, [s * 1.675, 2.8, 3.3], 1.2);
    // exhaust stacks
    cyl(0.1, 3.0, 8, STEEL, [s * 1.0, 2.9, 1.45], [0, 1, 0]);
    cyl(0.14, 0.12, 8, IRON, [s * 1.0, 4.4, 1.45], [0, 1, 0]);
    cyl(0.14, 0.1, 8, IRON, [s * 1.0, 2.0, 1.45], [0, 1, 0]);
    // side armour plates + neon skirts
    for (const z of [0.6, -0.8]) {
      box(0.08, 0.55, 1.0, ARM, [s * 1.42, 1.75, z], { rotation: [0, 0, -s * 8] });
      neon(0.04, 0.05, 0.9, CYAN, [s * 1.47, 1.42, z], 1.4);
    }
  }
  // grille and brush guard
  plane(GRILLE, 1.0, 0.4, [0, 1.85, 4.315], [0, 0, 1], 0.8);
  for (const x of [-0.45, 0, 0.45]) b.rod([x, 1.33, 4.55], [x, 2.25, 4.4], 0.04, IRON);
  b.rod([-0.5, 2.25, 4.4], [0.5, 2.25, 4.4], 0.04, IRON);
  // bumper
  box(2.9, 0.55, 0.45, ARM, [0, 1.05, 4.5]);
  plane(HAZARD, 2.8, 0.4, [0, 1.05, 4.735], [0, 0, 1]);
  neon(0.18, 0.1, 0.1, AMBER, [1.35, 1.05, 4.75], 1.6);
  neon(0.18, 0.1, 0.1, AMBER, [-1.35, 1.05, 4.75], 1.6);

  // ---------- roof: light bar, turret, antenna ----------
  box(1.95, 0.08, 0.3, DARK, [0, 3.5, 2.55]);
  for (let i = 0; i < 6; i++) neon(0.28, 0.1, 0.16, i % 2 ? CYAN : RED, [-0.8 + i * 0.32, 3.58, 2.55], 2);
  cyl(0.45, 0.25, 8, IRON, [0, 3.5, 1.95], [0, 1, 0]);
  box(0.95, 0.42, 1.0, ARM, [0, 3.88, 1.95]);
  box(0.6, 0.22, 0.5, GUN, [0, 4.2, 1.85]);
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 3.9, 2.4], [s * 0.3, 3.9, 3.5], 0.065, GUN);
    cyl(0.1, 0.3, 6, IRON, [s * 0.3, 3.9, 3.0], [0, 0, 1]);
    neon(0.08, 0.08, 0.04, AMBER, [s * 0.3, 3.9, 3.52], 2);
  }
  glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), CYAN, { at: [0, 4.25, 2.1] }), 2);
  b.rod([-1.0, 3.3, 1.75], [-1.0, 4.7, 1.75], 0.025, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [-1.0, 4.74, 1.75] }), 2.2);
  b.part(new THREE.CylinderGeometry(0.28, 0.05, 0.12, 8), STEEL, { at: [0.95, 3.7, 1.8], dir: [0.5, 0.8, 0.3] });

  // ---------- cargo pod ----------
  const PZ = -1.5;
  for (const z of [-0.2, -1.6, -3.0]) box(1.8, 0.3, 0.5, IRON, [0, 1.3, z]);
  const pod = b.lathe(
    [[0, -2.8], [0.6, -2.7], [1.0, -2.3], [1.15, -1.8], [1.15, 1.8], [1.0, 2.3], [0.6, 2.7], [0, 2.8]],
    { at: [0, 2.4, PZ], axis: [0, 0, 1], segments: 8, color: POD },
  );
  for (const k of [-1.3, 0, 1.3]) cyl(1.28, 0.16, 8, STEEL, [0, 2.4, PZ + k], [0, 0, 1]);
  for (const k of [-0.65, 0.65]) glow(cyl(1.26, 0.06, 8, MAGENTA, [0, 2.4, PZ + k], [0, 0, 1]), 1.6);
  neon(0.12, 0.08, 3.2, MAGENTA, [0, 3.54, PZ], 1.6);
  for (const z of [-0.2, -2.8]) {
    box(0.8, 0.18, 0.3, IRON, [0, 3.55, z]);
    neon(0.1, 0.06, 0.1, RED, [0, 3.66, z], 2.2);
  }
  for (const s of [1, -1]) {
    b.decal(pod, EMBLEM, { at: [s * 1.1, 2.4, PZ], dir: [s, 0, 0], size: [1.05, 1.05] });
    plane(PLATE, 0.0 + 0.0001, 0.0001, [0, -5, 0], [0, 0, 1]); // inert placeholder removed below
  }
  // rear pod tip lock lights
  neon(0.2, 0.12, 0.12, RED, [0, 2.4, PZ - 2.82], 2);

  // ---------- rear ----------
  box(2.4, 0.4, 0.3, ARM, [0, 0.85, -4.75]);
  plane(TAIL, 2.2, 0.2, [0, 0.95, -4.91], [0, 0, -1], 1.4);
  plane(PLATE, 0.6, 0.24, [0, 0.68, -4.91], [0, 0, -1]);
  b.rod([-0.9, 1.1, -4.7], [-0.9, 2.2, -4.2], 0.04, IRON);
  b.rod([0.9, 1.1, -4.7], [0.9, 2.2, -4.2], 0.04, IRON);

  return b.root;
}
```