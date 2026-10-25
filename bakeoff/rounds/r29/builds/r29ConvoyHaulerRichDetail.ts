import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured 6-wheel convoy hauler with a roof turret, guarding a sealed glowing cargo pod.",
};

// ---------- palette ----------
const TIRE = "#15151b", STEEL = "#8a93a6", DARK = "#1b1e27", GUN = "#2b2f3b";
const CYAN = "#27f0ff", MAG = "#ff2bd6", RED = "#ff3350", AMBER = "#ffb02e", GLASS = "#0c3144";
const YEL = "#f2c418", BLK = "#101014", RUBBER = "#24242c";

// ---------- paints ----------
const hull = paint((p, n) => {
  let c = mix("#4a5a82", "#2d3652", noise(p, 0.6, 3));
  if (n.y > 0.6) c = mix(c, "#7d8fbd", 0.35);
  const fx = (p.z / 0.8) % 1, fy = (p.y / 0.5) % 1;
  if (Math.abs(n.y) < 0.6 && (Math.abs(fx) < 0.025 || Math.abs(fy) < 0.025)) c = mix(c, "#0c0f18", 0.8);
  const dirt = smoothstep(1.0, 0.3, p.y) * (0.5 + 0.5 * noise(p, 0.25, 8));
  return mix(c, "#2a2520", dirt * 0.75);
});
const podPaint = paint((p, n) => {
  let c = mix("#d8dfe8", "#aab4c4", noise(p, 0.5, 5));
  if (n.y > 0.5) c = mix(c, "#f4f8ff", 0.4);
  const f = (((p.z + 3.5) / 0.7) % 1 + 1) % 1;
  if (f < 0.03 || f > 0.97) c = mix(c, "#2a3040", 0.7);
  const streak = smoothstep(0.55, 0.9, noise(new THREE.Vector3(p.x * 6, 0, p.z), 0.4, 11)) * smoothstep(3.0, 1.5, p.y);
  c = mix(c, "#6a4a38", streak * 0.4);
  return mix(c, "#3a342c", smoothstep(1.9, 1.2, p.y) * 0.5);
});
const chassisPaint = paint((p) => mix("#1d2029", "#33384a", noise(p, 0.3, 2)));

// ---------- textures ----------
const GRILLE = svg(`<svg viewBox="0 0 160 50"><rect width="160" height="50" fill="#0b0c12" stroke="#000" stroke-width="3"/>
${[0,1,2,3,4,5,6].map(i=>`<rect x="${8+i*22}" y="6" width="14" height="38" fill="#1c2030" stroke="#27f0ff" stroke-width="1.5"/>`).join("")}
<path d="M0 25H160" stroke="#ff2bd6" stroke-width="3"/></svg>`, { size: 256 });
const HAZARD = svg(`<svg viewBox="0 0 120 20"><rect width="120" height="20" fill="#f2c418"/>
${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${i*18} 20 L${i*18+9} 0 L${i*18+18} 0 L${i*18+9} 20Z" fill="#101014"/>`).join("")}</svg>`, { size: 256 });
const POD_LABEL = svg(`<svg viewBox="0 0 120 80"><rect width="120" height="80" rx="6" fill="#10131c" stroke="#27f0ff" stroke-width="3"/>
<g transform="translate(34 38)" fill="none" stroke="#ff2bd6" stroke-width="4"><circle r="20"/><path d="M0-20L0 20M-17 10L17-10M-17-10L17 10"/><circle r="6" fill="#ff2bd6"/></g>
<text x="66" y="30" font-family="monospace" font-weight="bold" font-size="13" fill="#27f0ff">CARGO</text>
<text x="66" y="48" font-family="monospace" font-weight="bold" font-size="13" fill="#27f0ff">7-KAPPA</text>
<text x="10" y="74" font-family="monospace" font-size="8" fill="#ffb02e">SEALED // DO NOT OPEN</text></svg>`, { size: 256 });
const SEAL = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0d1018" stroke="#27f0ff" stroke-width="4"/>
<path d="M50 14L81 32V68L50 86L19 68V32Z" fill="none" stroke="#ff2bd6" stroke-width="4"/>
<path d="M50 30L66 40V60L50 70L34 60V40Z" fill="#27f0ff" opacity="0.85"/><circle cx="50" cy="50" r="7" fill="#0d1018"/></svg>`, { size: 256 });
const VISOR = svg(`<svg viewBox="0 0 120 30"><rect width="120" height="30" fill="#0a2a3c"/>
<path d="M0 8H120M0 22H120" stroke="#27f0ff" stroke-width="1" opacity="0.5"/><path d="M10 15H40M80 15H110M60 4V26" stroke="#27f0ff" stroke-width="1.5"/>
<text x="46" y="28" font-family="monospace" font-size="6" fill="#ff2bd6">LOCK 03</text></svg>`, { size: 256 });
const NUM = svg(`<svg viewBox="0 0 50 36"><rect width="50" height="36" fill="none"/>
<text x="25" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="#f4f4f4" stroke="#101014" stroke-width="2">09</text></svg>`, { size: 128 });
const WARN = svg(`<svg viewBox="0 0 40 40"><path d="M20 3L38 36H2Z" fill="#f2c418" stroke="#101014" stroke-width="3"/><rect x="18" y="14" width="4" height="12" fill="#101014"/><rect x="18" y="29" width="4" height="4" fill="#101014"/></svg>`, { size: 96 });

export default function build() {
  const b = createBuilder({ name: "hauler" });

  const P = (geo: THREE.BufferGeometry, color: any, at: number[], opt: any = {}) => b.part(geo, color, { at, ...opt });
  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, opt: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, [x, y, z], opt);
  const cyl = (r1: number, r2: number, len: number, seg: number, color: any, at: number[], dir: number[], opt: any = {}) =>
    P(new THREE.CylinderGeometry(r1, r2, len, seg), color, at, { dir, ...opt });
  const decal = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], g = 0) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
    if (g) glow(part, g);
    return part;
  };
  const rivetRow = (n: number, x0: number, x1: number, y: number, z: number, color = STEEL) => {
    for (let i = 0; i < n; i++) box(0.05, 0.05, 0.03, color, x0 + ((x1 - x0) * i) / (n - 1), y, z);
  };

  // ---------- chassis ----------
  box(2.0, 0.4, 7.2, chassisPaint, 0, 0.75, -0.3);
  box(2.0, 0.1, 5.0, hull, 0, 1.0, -1.5);          // flatbed deck
  box(1.2, 0.25, 6.6, DARK, 0, 0.45, -0.2);        // belly
  for (const s of [1, -1]) {
    box(0.08, 0.06, 6.4, GLOW_BOX(), s * 1.02, 0.3, -0.2);
    box(0.08, 0.5, 1.5, hull, s * 1.05, 0.8, -3.15);          // side skirt rear
    box(0.3, 0.5, 1.2, hull, s * 1.15, 0.6, 0.85);              // tool box
    box(0.06, 0.12, 0.5, AMBER, s * 1.31, 0.6, 0.85);
    cyl(0.3, 0.3, 0.6, 8, "#4b5568", [s * 1.2, 0.62, -1.5], [0, 0, 1]);          // fuel tank
    cyl(0.31, 0.31, 0.06, 8, DARK, [s * 1.2, 0.62, -1.3], [0, 0, 1]);
    cyl(0.31, 0.31, 0.06, 8, DARK, [s * 1.2, 0.62, -1.7], [0, 0, 1]);
    decal(0.3, 0.3, WARN, [s * 1.32, 0.62, 0.3], [s, 0, 0]);
    // exhaust stacks
    cyl(0.1, 0.1, 1.9, 8, GUN, [s * 1.1, 2.2, 0.95], [0, 1, 0]);
    cyl(0.14, 0.12, 0.12, 8, STEEL, [s * 1.1, 3.17, 0.95], [0, 1, 0]);
    for (let k = 0; k < 3; k++) cyl(0.125, 0.125, 0.06, 8, AMBER, [s * 1.1, 1.5 + k * 0.5, 0.95], [0, 1, 0]);
  }
  function GLOW_BOX() { return MAG; }
  // glow underglow strips
  b.root.children.length; // (strips coloured magenta; glow applied below)

  // ---------- wheels ----------
  const wheel = (s: number, z: number) => {
    const x = s * 1.35, cy = 0.55;
    cyl(0.55, 0.55, 0.5, 10, TIRE, [x, cy, z], [1, 0, 0]);
    for (let i = 0; i < 10; i++) {
      const a = (i * 36 * Math.PI) / 180;
      box(0.46, 0.1, 0.14, RUBBER, x, cy + 0.53 * Math.cos(a), z + 0.53 * Math.sin(a), { rotation: [i * 36, 0, 0] });
    }
    cyl(0.31, 0.31, 0.52, 10, STEEL, [x, cy, z], [1, 0, 0]);
    glow(cyl(0.22, 0.22, 0.54, 10, CYAN, [x, cy, z], [1, 0, 0]), 1.2);
    cyl(0.17, 0.17, 0.56, 10, DARK, [x, cy, z], [1, 0, 0]);
    cyl(0.08, 0.08, 0.62, 8, STEEL, [x, cy, z], [1, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 * Math.PI) / 180;
      box(0.06, 0.045, 0.045, STEEL, x + s * 0.31, cy + 0.13 * Math.cos(a), z + 0.13 * Math.sin(a), { rotation: [i * 60, 0, 0] });
    }
    cyl(0.03, 0.03, 0.1, 6, AMBER, [x + s * 0.3, cy + 0.27, z + 0.05], [1, 0, 0]); // valve stem
  };
  for (const z of [2.3, -0.6, -2.4]) for (const s of [1, -1]) {
    wheel(s, z);
    box(0.75, 0.1, 1.45, hull, s * 1.35, 1.25, z);                 // fender
    box(0.75, 0.3, 0.1, hull, s * 1.35, 1.1, z + 0.72);
    box(0.75, 0.3, 0.1, hull, s * 1.35, 1.1, z - 0.72);
    rivetRow(4, s * 1.35 - 0.25, s * 1.35 + 0.25, 1.31, z + 0.5);
    box(0.7, 0.4, 0.04, RUBBER, s * 1.35, 0.35, z - 0.8);          // mud flap
  }
  // axles
  for (const z of [2.3, -0.6, -2.4]) cyl(0.09, 0.09, 2.7, 8, GUN, [0, 0.55, z], [1, 0, 0]);

  // ---------- cab ----------
  box(2.4, 1.2, 1.7, hull, 0, 2.0, 1.95);
  box(2.4, 0.8, 1.4, hull, 0, 1.5, 3.0);                       // hood
  box(2.2, 0.08, 1.2, "#6578a8", 0, 1.94, 3.0);                // hood plate
  box(0.5, 0.12, 0.5, DARK, 0, 2.0, 3.0);                      // hood intake
  glow(box(0.4, 0.04, 0.08, CYAN, 0, 2.06, 3.0), 1.2);
  box(2.5, 0.12, 1.8, DARK, 0, 2.64, 1.95);                    // roof plate
  rivetRow(7, -1.0, 1.0, 1.96, 3.62, STEEL);
  rivetRow(7, -1.0, 1.0, 1.96, 2.45, STEEL);
  // front face
  decal(1.5, 0.48, GRILLE, [0, 1.45, 3.71], [0, 0, 1]);
  box(1.0, 0.08, 0.1, DARK, 0, 1.2, 3.72);
  for (const s of [1, -1]) {
    glow(box(0.32, 0.16, 0.06, "#e8fbff", s * 0.97, 1.6, 3.72), 2);
    box(0.4, 0.04, 0.1, GUN, s * 0.97, 1.72, 3.72);
    glow(box(0.1, 0.1, 0.05, AMBER, s * 1.1, 1.3, 3.72), 1.4);
    // door
    box(0.05, 0.9, 0.9, "#38456a", s * 1.2, 1.98, 1.7);
    glow(box(0.04, 0.3, 0.8, GLASS, s * 1.24, 2.2, 2.1), 0.7);
    box(0.06, 0.05, 0.25, STEEL, s * 1.25, 1.85, 1.45);   // handle
    decal(0.5, 0.36, NUM, [s * 1.26, 1.65, 1.95], [s, 0, 0]);
    // mirror
    box(0.06, 0.4, 0.06, GUN, s * 1.5, 2.2, 2.55);
    box(0.08, 0.3, 0.2, DARK, s * 1.52, 2.2, 2.6);
    glow(box(0.02, 0.22, 0.14, CYAN, s * 1.57, 2.2, 2.6), 0.8);
  }
  glow(decal(2.0, 0.5, VISOR, [0, 2.2, 2.81], [0, 0, 1]), 0.9);
  box(2.2, 0.08, 0.14, DARK, 0, 2.52, 2.82);    // visor brow
  box(2.2, 0.08, 0.14, DARK, 0, 1.92, 2.82);

  // bumper / ram
  box(2.6, 0.45, 0.4, hull, 0, 0.85, 3.9);
  decal(2.4, 0.28, HAZARD, [0, 0.85, 4.11], [0, 0, 1]);
  box(2.0, 0.12, 0.3, DARK, 0, 0.55, 4.0);
  for (const s of [1, -1]) {
    box(0.12, 0.55, 0.12, GUN, s * 1.1, 1.15, 3.95);
    box(0.4, 0.4, 0.3, DARK, s * 1.2, 0.85, 3.7);
  }
  glow(box(1.0, 0.04, 0.05, MAG, 0, 0.62, 4.17), 1.6);

  // roof light bar
  box(1.5, 0.1, 0.25, GUN, 0, 2.75, 2.55);
  for (let i = 0; i < 6; i++) glow(box(0.2, 0.1, 0.14, i % 2 ? MAG : CYAN, -0.6 + i * 0.24, 2.82, 2.6), 1.8);
  // antennas
  for (const s of [1, -1]) {
    cyl(0.015, 0.015, 1.4, 6, STEEL, [s * 1.0, 3.3, 1.1], [0, 1, 0]);
    glow(P(new THREE.SphereGeometry(0.04, 6, 4), RED, [s * 1.0, 4.0, 1.1]), 2);
  }

  // ---------- turret ----------
  cyl(0.45, 0.5, 0.18, 8, GUN, [0, 2.78, 1.5], [0, 1, 0]);
  cyl(0.38, 0.38, 0.06, 8, AMBER, [0, 2.88, 1.5], [0, 1, 0]);
  box(0.95, 0.45, 1.0, hull, 0, 3.12, 1.5);
  box(0.95, 0.12, 0.8, DARK, 0, 3.38, 1.45);
  glow(box(0.2, 0.14, 0.06, MAG, 0, 3.12, 2.02), 2);
  for (const s of [1, -1]) {
    box(0.18, 0.3, 0.7, GUN, s * 0.55, 3.12, 1.55);
    cyl(0.07, 0.07, 1.4, 8, GUN, [s * 0.25, 3.1, 2.55], [0, 0, 1]);
    cyl(0.1, 0.1, 0.3, 8, DARK, [s * 0.25, 3.1, 2.0], [0, 0, 1]);
    cyl(0.1, 0.1, 0.18, 8, STEEL, [s * 0.25, 3.1, 3.2], [0, 0, 1]);
    glow(cyl(0.05, 0.05, 0.04, 8, CYAN, [s * 0.25, 3.1, 3.3], [0, 0, 1]), 2);
    decal(0.2, 0.2, WARN, [s * 0.48, 3.15, 1.2], [s, 0, 0]);
  }
  box(0.04, 0.3, 0.04, STEEL, 0.4, 3.5, 1.2);

  // ---------- cargo pod ----------
  const PZ = -1.6, PY = 2.15;
  cyl(1.0, 1.0, 4.2, 8, podPaint, [0, PY, PZ], [0, 0, 1]);
  cyl(0.72, 1.0, 0.5, 8, podPaint, [0, PY, 0.75], [0, 0, 1]);
  cyl(0.72, 1.0, 0.5, 8, podPaint, [0, PY, -3.95], [0, 0, -1]);
  cyl(0.74, 0.74, 0.05, 8, DARK, [0, PY, 1.02], [0, 0, 1]);
  glow(decal(1.0, 1.0, SEAL, [0, PY, -4.22], [0, 0, -1]), 1.4);
  for (let i = 0; i < 6; i++) {
    const z = -3.5 + i * 0.7;
    cyl(1.04, 1.04, 0.16, 8, GUN, [0, PY, z], [0, 0, 1]);
    glow(cyl(1.055, 1.055, 0.04, 8, CYAN, [0, PY, z + 0.1], [0, 0, 1]), 1.6);
    box(0.34, 0.1, 0.2, STEEL, 0, PY + 1.03, z);          // top latch
    box(0.14, 0.04, 0.12, AMBER, 0, PY + 1.1, z);
  }
  // cradle & straps
  for (const z of [-0.1, -1.6, -3.1]) {
    box(1.9, 0.2, 0.3, GUN, 0, 1.1, z);
    for (const s of [1, -1]) box(0.14, 0.7, 0.3, GUN, s * 0.95, 1.4, z, { rotation: [0, 0, s * -25] });
  }
  for (const s of [1, -1]) {
    box(0.12, 0.9, 1.3, DARK, s * 1.0, PY, PZ);
    decal(1.2, 0.8, POD_LABEL, [s * 1.07, PY + 0.1, PZ], [s, 0, 0], 0.7);
    decal(0.4, 0.4, WARN, [s * 1.05, PY - 0.5, -2.8], [s, 0, 0]);
    for (let i = 0; i < 4; i++) glow(box(0.04, 0.05, 0.14, AMBER, s * 1.06, PY - 0.3 + i * 0, -3.35 + i * 0.15 - 0.0), 1.2);
    // side grab rails
    cyl(0.03, 0.03, 3.0, 6, STEEL, [s * 1.1, 1.5, PZ], [0, 0, 1]);
    box(0.05, 0.3, 0.05, STEEL, s * 1.07, 1.65, 0.0);
    box(0.05, 0.3, 0.05, STEEL, s * 1.07, 1.65, -3.2);
  }
  // pod beacon
  cyl(0.02, 0.02, 0.9, 6, STEEL, [0, PY + 1.5, -3.2], [0, 1, 0]);
  glow(P(new THREE.OctahedronGeometry(0.1), MAG, [0, PY + 2.0, -3.2]), 2.2);
  // top solar/vent panel
  box(0.9, 0.05, 1.2, DARK, 0, PY + 1.0, -1.0);
  for (let i = 0; i < 4; i++) glow(box(0.7, 0.02, 0.1, CYAN, 0, PY + 1.04, -1.4 + i * 0.25), 0.8);

  // ---------- rear ----------
  box(2.3, 0.35, 0.3, hull, 0, 0.75, -3.95);
  decal(2.1, 0.22, HAZARD, [0, 0.75, -4.11], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.3, 0.15, 0.06, RED, s * 0.9, 1.15, -4.12), 2);
    box(0.38, 0.22, 0.04, DARK, s * 0.9, 1.15, -4.09);
  }
  glow(box(1.0, 0.04, 0.05, MAG, 0, 0.55, -4.12), 1.6);
  // underglow
  for (const s of [1, -1]) glow(box(0.08, 0.06, 6.4, MAG, s * 1.02, 0.3, -0.2), 1.6);

  return b.root;
}
