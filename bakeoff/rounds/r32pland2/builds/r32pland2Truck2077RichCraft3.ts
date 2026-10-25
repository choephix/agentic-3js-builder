import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { mottle } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Ares-77 Siege Hauler",
  description:
    "Low-poly cyberpunk 6x6 armored military truck from 2077: plated cab with plow, neon trim, roof turret, missile pods, radar, glowing hubs and livery decals.",
};

type V = [number, number, number];

// ---------- palette ----------
const GUN = "#272c36";
const GUN2 = "#1a1d25";
const STEEL = "#707988";
const TYRE = "#14161b";
const CYAN = "#19f0ff";
const MAG = "#ff2fa8";
const ORANGE = "#ff8a1c";
const RED = "#ff2a2a";
const YEL = "#f2c21a";
const GLASS = "#0e3a52";

// ---------- textures ----------
const HAZARD = svg(
  `<svg viewBox="0 0 80 12"><rect width="80" height="12" fill="#f2c21a"/>${Array.from(
    { length: 12 },
    (_, i) => `<polygon points="${i * 8 - 4},12 ${i * 8},12 ${i * 8 + 8},0 ${i * 8 + 4},0" fill="#15161a"/>`,
  ).join("")}</svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 360 90">
  <rect width="360" height="90" rx="5" fill="#1f2735"/>
  <rect width="360" height="7" fill="#ff2fa8"/><rect y="83" width="360" height="7" fill="#19f0ff"/>
  <polygon points="45,12 75,28 75,62 45,78 15,62 15,28" fill="#0d1018" stroke="#19f0ff" stroke-width="3"/>
  <polygon points="45,24 62,45 45,66 28,45" fill="#ff2fa8"/>
  <circle cx="45" cy="45" r="7" fill="#0d1018"/>
  <text x="95" y="52" font-family="monospace" font-weight="bold" font-size="40" fill="#f2f4ff">ARES-77</text>
  <text x="97" y="72" font-family="monospace" font-size="14" fill="#19f0ff">// NEO-DIVISION · HEAVY LOGISTICS</text>
  <g fill="#f2f4ff">${Array.from({ length: 16 }, (_, i) => `<rect x="${268 + i * 5}" y="16" width="${i % 3 === 0 ? 3 : 2}" height="14"/>`).join("")}</g>
  <text x="268" y="44" font-family="monospace" font-size="9" fill="#ff8a1c">SN 2077-0419-X</text>
  <polygon points="312,56 332,56 322,40" fill="none" stroke="#f2c21a" stroke-width="3"/>
  <path d="M338 50 l10 12 l-10 12 M348 50 l10 12 l-10 12" stroke="#ff2fa8" stroke-width="3" fill="none"/>
</svg>`,
  { size: 768 },
);

const DOOR = svg(
  `<svg viewBox="0 0 90 100">
  <rect x="2" y="2" width="86" height="96" rx="6" fill="#2b3342" stroke="#0d1018" stroke-width="3"/>
  <polygon points="10,10 78,10 70,46 10,46" fill="#0e3a52" stroke="#0d1018" stroke-width="3"/>
  <polygon points="16,14 34,14 22,42 16,42" fill="#2f8fb0"/><polygon points="40,14 48,14 36,42 28,42" fill="#1d6f8c"/>
  <rect x="58" y="52" width="22" height="6" rx="3" fill="#707988"/>
  <rect x="8" y="62" width="74" height="5" fill="#ff2fa8"/>
  <text x="12" y="92" font-family="monospace" font-weight="bold" font-size="24" fill="#f2f4ff">07</text>
  <path d="M52 94 l8 -10 l8 10 l8 -10" stroke="#f2c21a" stroke-width="3" fill="none"/>
</svg>`,
  { size: 256 },
);

const WINDSHIELD = svg(
  `<svg viewBox="0 0 200 80">
  <rect width="200" height="80" fill="#0b2230"/>
  <polygon points="20,0 60,0 30,80 0,80" fill="#1b5a75" opacity="0.7"/>
  <polygon points="80,0 95,0 65,80 50,80" fill="#1b5a75" opacity="0.5"/>
  <g stroke="#19f0ff" stroke-width="1.6" fill="none"><path d="M120 18 h-12 v12 M180 18 h12 v12 M120 64 h-12 v-12 M180 64 h12 v-12" transform="translate(-22 0)"/>
  <path d="M100 40 h14 M130 40 h14 M122 30 v6 M122 44 v6"/></g>
  <text x="108" y="14" font-family="monospace" font-size="7" fill="#19f0ff">TGT LOCK 98%</text>
  <rect x="150" y="52" width="40" height="3" fill="#ff2fa8"/><rect x="150" y="58" width="26" height="3" fill="#19f0ff"/>
</svg>`,
  { size: 512 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 150 40"><rect width="150" height="40" rx="3" fill="#0d1018"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="6" y="${4 + i * 5}" width="138" height="2.4" fill="#444c5c"/>`).join("")}
  <rect x="6" y="18.5" width="138" height="3" fill="#19f0ff"/></svg>`,
  { size: 256 },
);

const TUBES = svg(
  `<svg viewBox="0 0 82 62"><rect width="82" height="62" fill="#262c36"/>
  ${[0, 1]
    .map((r) =>
      [0, 1, 2]
        .map(
          (c) =>
            `<circle cx="${14 + c * 27}" cy="${16 + r * 30}" r="11" fill="#0d1018" stroke="#707988" stroke-width="2.5"/><circle cx="${14 + c * 27}" cy="${16 + r * 30}" r="6" fill="#c42a2a"/><circle cx="${14 + c * 27}" cy="${16 + r * 30}" r="2.5" fill="#f2c21a"/>`,
        )
        .join(""),
    )
    .join("")}</svg>`,
  { size: 256 },
);

const REARDOOR = svg(
  `<svg viewBox="0 0 210 140"><rect width="210" height="140" fill="#2a3140"/>
  <rect x="4" y="4" width="98" height="132" fill="#232a37" stroke="#0d1018" stroke-width="3"/>
  <rect x="108" y="4" width="98" height="132" fill="#232a37" stroke="#0d1018" stroke-width="3"/>
  <rect x="20" y="30" width="6" height="80" fill="#707988"/><rect x="184" y="30" width="6" height="80" fill="#707988"/>
  <rect x="4" y="110" width="202" height="24" fill="#f2c21a"/>
  ${Array.from({ length: 14 }, (_, i) => `<polygon points="${i * 15},134 ${i * 15 + 7},134 ${i * 15 + 15},110 ${i * 15 + 8},110" fill="#15161a"/>`).join("")}
  <text x="105" y="76" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="38" fill="#ff2fa8">2077</text>
  <text x="105" y="95" text-anchor="middle" font-family="monospace" font-size="11" fill="#19f0ff">AUTH CARGO ONLY</text></svg>`,
  { size: 512 },
);

const VENT = svg(
  `<svg viewBox="0 0 80 50"><rect width="80" height="50" rx="3" fill="#10131a" stroke="#4a5262" stroke-width="3"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="6" y="${6 + i * 5.2}" width="68" height="2.6" fill="#3a4252"/>`).join("")}</svg>`,
  { size: 192 },
);

const SCREEN = svg(
  `<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#04141a" stroke="#19f0ff" stroke-width="2"/>
  <path d="M4 22 L14 12 L22 18 L34 6 L44 16 L56 8" stroke="#19f0ff" stroke-width="2" fill="none"/>
  <rect x="4" y="25" width="30" height="2" fill="#ff2fa8"/><text x="38" y="28" font-family="monospace" font-size="5" fill="#19f0ff">ONLINE</text></svg>`,
  { size: 192 },
);

// ---------- paints ----------
const HULL = panelled(mottle("#2b313d", "#363e4d", { size: 0.6, seed: 3 }), { size: 0.4, aspect: 0.55, rivets: 0.08 });
const ARMOR = panelled(metal("iron", { tarnish: 0.3 }), { size: 0.25, rivets: 0.06 });

export default function build() {
  const b = createBuilder({ name: "ares77" });

  // ---------- helpers ----------
  const box = (s: V, color: any, at: V, o: any = {}) => b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at, ...o });
  const cyl = (r: number, h: number, color: any, at: V, dir: V = [0, 1, 0], seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const neon = (s: V, color: string, at: V, k = 1.3) => glow(box(s, color, at), k);

  // ---------- wheels ----------
  const AX = [2.3, -0.9, -2.35];
  const TR = 1.3;
  const WR = 0.65;
  for (const z of AX) {
    cyl(0.09, TR * 2, GUN2, [0, WR, z], [1, 0, 0], 8);
    b.part(new THREE.SphereGeometry(0.24, 8, 6), GUN, { at: [0, WR, z] });
    for (const s of [1, -1]) {
      const x = s * TR;
      cyl(WR, 0.46, TYRE, [x, WR, z], [1, 0, 0], 14);
      for (let i = 0; i < 12; i++) {
        const t = (i * 30 * Math.PI) / 180;
        box([0.48, 0.1, 0.2], "#0b0c0f", [x, WR + Math.cos(t) * 0.66, z + Math.sin(t) * 0.66], { rotation: [i * 30, 0, 0] });
      }
      cyl(0.4, 0.06, STEEL, [x + s * 0.24, WR, z], [1, 0, 0], 12);
      glow(cyl(0.26, 0.08, CYAN, [x + s * 0.27, WR, z], [1, 0, 0], 12), 1.3);
      cyl(0.12, 0.1, GUN2, [x + s * 0.3, WR, z], [1, 0, 0], 8);
      for (let i = 0; i < 6; i++) {
        const t = (i * 60 * Math.PI) / 180;
        cyl(0.035, 0.06, STEEL, [x + s * 0.285, WR + Math.cos(t) * 0.33, z + Math.sin(t) * 0.33], [1, 0, 0], 6);
      }
      // fender flare and mud flap
      box([0.62, 0.1, 1.5], ARMOR, [x, 1.42, z]);
      box([0.62, 0.3, 0.08], GUN2, [x + s * 0.0, 1.28, z + 0.74]);
      box([0.5, 0.45, 0.05], GUN2, [x, 0.55, z - 0.82]);
      neon([0.5, 0.03, 0.04], MAG, [x, 1.485, z + 0.76], 1.2);
    }
  }
  cyl(0.07, 5.0, GUN2, [0, 0.8, -0.9], [0, 0, 1], 6);

  // ---------- chassis ----------
  box([1.8, 0.3, 7.5], GUN, [0, 0.95, -0.1]);
  for (const s of [1, -1]) {
    box([0.12, 0.34, 7.5], GUN2, [s * 0.78, 0.95, -0.1]);
    neon([0.04, 0.05, 6.0], CYAN, [s * 0.9, 0.82, -0.2], 1.2);
    // fuel tanks and straps
    cyl(0.3, 1.3, STEEL, [s * 1.0, 0.85, 0.7], [0, 0, 1], 10);
    for (const dz of [-0.4, 0.4]) cyl(0.31, 0.06, GUN2, [s * 1.0, 0.85, 0.7 + dz], [0, 0, 1], 10);
    glow(box([0.05, 0.1, 0.9], ORANGE, [s * 1.3, 0.85, 0.7]), 1.1);
    // cab steps and handrails
    box([0.3, 0.06, 0.8], GUN2, [s * 1.2, 0.95, 1.3]);
    b.rod([s * 1.12, 1.6, 1.15], [s * 1.12, 2.45, 1.15], 0.025, STEEL);
  }
  box([1.7, 0.03, 6.2], CYAN, [0, 0.78, -0.2]);
  glow(box([1.7, 0.03, 6.2], CYAN, [0, 0.77, -0.2]), 0.9);

  // ---------- cab ----------
  b.extrude(
    [
      [0, 0],
      [0, 1.5],
      [0.85, 1.55],
      [1.3, 0.9],
      [2.0, 0.8],
      [2.3, 0.45],
      [2.3, 0],
    ],
    { at: [0, 1.15, 1.0], x: [0, 0, 1], thickness: 2.1, bevel: 0.05, color: HULL },
  );
  // windshield
  glow(plane(2.0, 0.79, WINDSHIELD, [0, 2.386, 2.091], [0, 0.57, 0.82]), 0.7);
  // roof plate, hood details
  box([1.9, 0.08, 0.9], ARMOR, [0, 2.72, 1.42]);
  box([0.9, 0.1, 0.7], ARMOR, [0, 2.0, 2.65]);
  plane(0.8, 0.5, VENT, [0, 2.056, 2.65], [0, 1, 0], { up: [0, 0, 1] });
  for (const s of [1, -1]) {
    box([0.05, 0.1, 0.9], ARMOR, [s * 0.5, 2.0, 2.65]);
    // side door, armor strip
    plane(0.9, 1.0, DOOR, [s * 1.056, 1.95, 1.7], [s, 0, 0]);
    box([0.06, 0.4, 1.9], ARMOR, [s * 1.07, 1.4, 2.15]);
    neon([0.03, 0.04, 1.8], CYAN, [s * 1.105, 1.22, 2.15], 1.2);
    // mirrors
    b.rod([s * 1.05, 2.3, 2.15], [s * 1.4, 2.35, 2.3], 0.02, STEEL);
    box([0.06, 0.4, 0.24], GUN2, [s * 1.43, 2.35, 2.3]);
    // headlights and fog lights
    neon([0.5, 0.14, 0.06], "#f4fbff", [s * 0.7, 1.7, 3.32], 1.6);
    neon([0.2, 0.1, 0.06], ORANGE, [s * 0.95, 1.3, 3.32], 1.2);
    // headlight shrouds
    box([0.6, 0.06, 0.16], GUN2, [s * 0.7, 1.82, 3.3]);
    // antennas behind cab roof
    b.rod([s * 0.9, 2.76, 1.1], [s * 0.9, 4.0, 1.1], 0.015, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), s > 0 ? CYAN : MAG, { at: [s * 0.9, 4.02, 1.1] }), 1.5);
    // exhaust stacks
    cyl(0.1, 2.0, GUN2, [s * 0.95, 2.4, 0.75], [0, 1, 0], 8);
    for (const y of [1.8, 2.5]) cyl(0.125, 0.12, STEEL, [s * 0.95, y, 0.75], [0, 1, 0], 8);
    glow(cyl(0.08, 0.05, ORANGE, [s * 0.95, 3.42, 0.75], [0, 1, 0], 8), 1.5);
  }
  neon([1.6, 0.04, 0.05], CYAN, [0, 1.52, 3.32], 1.2);
  plane(1.5, 0.38, GRILLE, [0, 1.36, 3.305], [0, 0, 1]);
  // roof light bar
  for (let i = 0; i < 6; i++) neon([0.26, 0.1, 0.16], i % 2 ? MAG : CYAN, [-0.65 + i * 0.26, 2.82, 1.9], 1.5);
  box([1.7, 0.04, 0.2], GUN2, [0, 2.76, 1.9]);

  // bumper, plow, winch
  b.part(new THREE.BoxGeometry(2.4, 0.3, 0.46), "#ffffff", { at: [0, 1.0, 3.45], texture: HAZARD });
  b.extrude(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.15],
      [0.12, 0.7],
      [0, 0.7],
    ],
    { at: [0, 0.2, 3.5], x: [0, 0, 1], thickness: 2.3, bevel: 0.03, color: ARMOR },
  );
  cyl(0.1, 0.8, STEEL, [0, 1.2, 3.55], [1, 0, 0], 8);
  box([0.2, 0.05, 0.05], YEL, [0, 0.7, 3.95]);
  for (const s of [1, -1]) neon([0.1, 0.1, 0.05], RED, [s * 1.0, 0.45, 3.99], 1.2);

  // ---------- roof turret ----------
  cyl(0.38, 0.12, GUN2, [0, 2.82, 1.4], [0, 1, 0], 10);
  box([0.74, 0.34, 0.7], ARMOR, [0, 3.05, 1.4]);
  box([0.5, 0.18, 0.5], GUN, [0, 3.3, 1.35]);
  for (const s of [1, -1]) {
    b.rod([s * 0.16, 3.05, 1.75], [s * 0.16, 3.05, 3.0], 0.045, STEEL);
    cyl(0.07, 0.2, GUN2, [s * 0.16, 3.05, 3.05], [0, 0, 1], 6);
    box([0.18, 0.2, 0.3], GUN2, [s * 0.5, 3.0, 1.5]);
    box([0.08, 0.12, 0.34], YEL, [s * 0.6, 3.0, 1.5]);
  }
  b.part(new THREE.SphereGeometry(0.1, 7, 5), GUN2, { at: [0, 3.46, 1.35] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0, 3.47, 1.44] }), 2);
  // sensor mast with whip
  b.rod([-0.7, 2.74, 1.55], [-0.7, 3.6, 1.55], 0.02, STEEL);
  box([0.2, 0.12, 0.12], GUN2, [-0.7, 3.62, 1.55]);
  glow(box([0.1, 0.06, 0.02], CYAN, [-0.7, 3.62, 1.62]), 1.5);

  // ---------- cargo container ----------
  box([2.3, 1.6, 4.1], HULL, [0, 2.25, -1.55]);
  for (const x of [1.13, -1.13])
    for (const z of [0.45, -3.55]) box([0.16, 1.7, 0.16], ARMOR, [x, 2.25, z]);
  for (const s of [1, -1]) {
    box([0.14, 0.1, 4.2], ARMOR, [s * 1.14, 3.05, -1.55]);
    box([0.14, 0.1, 4.2], ARMOR, [s * 1.14, 1.45, -1.55]);
    plane(3.6, 0.9, EMBLEM, [s * 1.156, 2.62, -1.55], [s, 0, 0]);
    for (let i = 0; i < 5; i++) box([0.06, 0.62, 0.1], GUN2, [s * 1.17, 1.98, -3.2 + i * 0.85]);
    plane(1.0, 0.5, VENT, [s * 1.158, 1.9, -0.55], [s, 0, 0]);
    plane(1.0, 0.5, VENT, [s * 1.158, 1.9, -2.55], [s, 0, 0]);
    glow(plane(0.7, 0.35, SCREEN, [s * 1.158, 1.9, -1.55], [s, 0, 0]), 1.2);
    neon([0.04, 0.05, 3.9], MAG, [s * 1.165, 1.6, -1.55], 1.3);
    neon([0.04, 0.04, 4.0], CYAN, [s * 1.165, 3.0, -1.55], 1.3);
  }
  // rear doors, lights, bumper
  plane(2.1, 1.4, REARDOOR, [0, 2.25, -3.606], [0, 0, -1]);
  box([2.4, 0.3, 0.3], ARMOR, [0, 1.0, -3.7]);
  for (const s of [1, -1]) neon([0.3, 0.15, 0.06], RED, [s * 0.9, 1.05, -3.87], 1.5);
  box([2.3, 0.1, 0.1], GUN2, [0, 1.38, -3.62]);
  // roof details
  box([2.3, 0.05, 4.1], GUN2, [0, 3.07, -1.55]);
  for (let i = 0; i < 3; i++) box([0.5, 0.14, 0.4], ARMOR, [0, 3.14, 0.1 - i * 0.55]);
  box([0.3, 0.1, 0.3], GUN, [0, 3.15, -3.2]);

  // missile pods
  for (const s of [1, -1]) {
    const px = s * 0.6;
    box([0.2, 0.5, 0.2], ARMOR, [px, 3.3, -2.35]);
    box([1.0, 0.1, 1.2], GUN2, [px, 3.12, -2.35]);
    box([0.85, 0.6, 1.3], ARMOR, [px, 3.65, -2.0], { rotation: [-25, 0, 0] });
    const n = new THREE.Vector3(0, Math.sin((25 * Math.PI) / 180), Math.cos((25 * Math.PI) / 180));
    const c = new THREE.Vector3(px, 3.65, -2.0).addScaledVector(n, 0.652);
    plane(0.8, 0.58, TUBES, [c.x, c.y, c.z], [n.x, n.y, n.z]);
    neon([0.04, 0.04, 0.9], ORANGE, [px + s * 0.43, 3.65, -2.0], 1.2);
  }
  // radar
  b.rod([0.8, 3.1, 0.0], [0.8, 3.55, 0.0], 0.04, STEEL);
  b.lathe(
    [
      [0, 0],
      [0.38, 0.14],
      [0.4, 0.14],
      [0.4, 0.16],
      [0, 0.04],
    ],
    { at: [0.8, 3.58, 0.0], axis: [0.2, 0.8, 0.55], segments: 10, color: STEEL },
  );
  b.rod([0.8, 3.6, 0.0], [0.88, 3.9, 0.2], 0.012, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { at: [0.88, 3.92, 0.2] }), 1.8);
  // whip antenna on container
  b.rod([-1.0, 3.1, -3.3], [-1.0, 4.4, -3.3], 0.015, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), MAG, { at: [-1.0, 4.42, -3.3] }), 1.5);

  return b.root;
}
