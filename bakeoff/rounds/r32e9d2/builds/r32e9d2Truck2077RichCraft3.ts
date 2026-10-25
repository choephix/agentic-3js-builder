import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Vanguard-77 Armored Truck",
  description:
    "Low-poly cyberpunk 6x6 militarized truck from 2077: camo armor hull, neon underglow, twin coil railgun turret, missile pods, lidar and radar masts.",
};

type V = [number, number, number];

const CY = "#35f2ff";
const MG = "#ff2fb3";
const ORG = "#ff8a1c";
const RED = "#ff2a3c";
const DARK = "#14161c";
const DARK2 = "#1d2028";
const TIRE = "#17181c";
const YEL = "#f2c418";

// ---------- textures ----------
const GLASS = svg(
  `<svg viewBox="0 0 200 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b3a4a"/><stop offset="1" stop-color="#04121c"/></linearGradient></defs>
<rect width="200" height="100" fill="url(#g)"/>
<polygon points="30,0 70,0 40,100 0,100" fill="#8fe9ff" opacity="0.14"/>
<polygon points="90,0 105,0 75,100 60,100" fill="#8fe9ff" opacity="0.1"/>
<path d="M10 82 H190" stroke="#35f2ff" stroke-width="2" opacity=".7"/>
<circle cx="100" cy="50" r="22" fill="none" stroke="#35f2ff" stroke-width="1.6"/>
<path d="M100 20 V34 M100 66 V80 M70 50 H84 M116 50 H130" stroke="#35f2ff" stroke-width="1.6"/>
<text x="14" y="18" font-size="9" fill="#35f2ff" font-family="monospace">SPD 084 // TGT LOCK</text>
<text x="130" y="94" font-size="8" fill="#ff2fb3" font-family="monospace">NAV 77-ZX</text>
<rect width="200" height="100" fill="none" stroke="#02070a" stroke-width="7"/></svg>`,
  { size: 384 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 140 50"><polygon points="4,48 136,48 120,3 4,3" fill="#082a38" stroke="#02070a" stroke-width="4"/>
<polygon points="20,46 40,46 58,5 38,5" fill="#8fe9ff" opacity="0.18"/>
<path d="M10 40 H110" stroke="#35f2ff" stroke-width="1.5" opacity=".6"/></svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 120 36"><rect width="120" height="36" fill="#0b0d12"/>
${[0, 1, 2, 3, 4].map((i) => `<rect x="6" y="${4 + i * 6.4}" width="108" height="3.4" fill="${i % 2 ? "#35f2ff" : "#1b6a78"}"/>`).join("")}
<rect width="120" height="36" fill="none" stroke="#050609" stroke-width="4"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><path d="M50 4 L92 20 V52 Q92 82 50 97 Q8 82 8 52 V20Z" fill="#12151c" stroke="#35f2ff" stroke-width="4"/>
<path d="M50 14 L82 26 V50 Q82 74 50 87 Q18 74 18 50 V26Z" fill="none" stroke="#ff2fb3" stroke-width="2"/>
<path d="M50 24 L58 44 L78 44 L62 56 L68 76 L50 64 L32 76 L38 56 L22 44 L42 44Z" fill="#f2c418" stroke="#000" stroke-width="1.5"/>
<text x="50" y="94" text-anchor="middle" font-size="12" font-weight="bold" font-family="monospace" fill="#35f2ff">2077</text></svg>`,
  { size: 256 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 120 20"><defs><clipPath id="c"><rect width="120" height="20"/></clipPath></defs>
<rect width="120" height="20" fill="#f2c418"/><g clip-path="url(#c)">
${Array.from({ length: 12 }, (_, i) => `<polygon points="${i * 20 - 10},20 ${i * 20},20 ${i * 20 + 14},0 ${i * 20 + 4},0" fill="#0c0c0c"/>`).join("")}</g>
<rect width="120" height="20" fill="none" stroke="#0c0c0c" stroke-width="2"/></svg>`,
  { size: 256 },
);
const RADAR = svg(
  `<svg viewBox="0 0 100 70"><rect width="100" height="70" rx="4" fill="#041016" stroke="#222a33" stroke-width="4"/>
<circle cx="38" cy="35" r="28" fill="none" stroke="#2cff9a" stroke-width="1.4"/><circle cx="38" cy="35" r="16" fill="none" stroke="#2cff9a" stroke-width="1" opacity=".7"/>
<path d="M38 35 L60 18" stroke="#2cff9a" stroke-width="2"/><path d="M38 35 L60 18 A28 28 0 0 0 52 12Z" fill="#2cff9a" opacity=".3"/>
<circle cx="52" cy="40" r="2.5" fill="#ff2a3c"/><circle cx="26" cy="24" r="2" fill="#ff2a3c"/><circle cx="44" cy="20" r="2" fill="#f2c418"/>
<path d="M74 12 H94 M74 20 H90 M74 28 H94 M74 36 H86" stroke="#35f2ff" stroke-width="2"/>
<rect x="74" y="48" width="20" height="14" fill="none" stroke="#ff2fb3" stroke-width="1.5"/>
<text x="76" y="59" font-size="8" fill="#ff2fb3" font-family="monospace">ARM</text></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 70 24"><rect width="70" height="24" rx="2" fill="#e8e4cf" stroke="#111" stroke-width="2"/>
<rect x="2" y="2" width="66" height="5" fill="#35f2ff"/><text x="35" y="20" text-anchor="middle" font-size="13" font-weight="bold" font-family="monospace" fill="#111">VG-2077</text></svg>`,
  { size: 192 },
);
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#262a33" stroke="#0b0c10" stroke-width="3"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<polygon points="50,50 ${50 + 44 * Math.cos((i * 60 - 12) * Math.PI / 180)},${50 + 44 * Math.sin((i * 60 - 12) * Math.PI / 180)} ${50 + 44 * Math.cos((i * 60 + 12) * Math.PI / 180)},${50 + 44 * Math.sin((i * 60 + 12) * Math.PI / 180)}" fill="#8e97a6"/>`).join("")}
<circle cx="50" cy="50" r="30" fill="none" stroke="#35f2ff" stroke-width="3"/>
<circle cx="50" cy="50" r="12" fill="#0b0c10" stroke="#ff2fb3" stroke-width="3"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${50 + 38 * Math.cos((i * 60 + 30) * Math.PI / 180)}" cy="${50 + 38 * Math.sin((i * 60 + 30) * Math.PI / 180)}" r="2.2" fill="#d6dbe6"/>`).join("")}</svg>`,
  { size: 192 },
);
const HEX = svg(
  `<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#0c0e12"/>
${Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<polygon points="0,-5 4.3,-2.5 4.3,2.5 0,5 -4.3,2.5 -4.3,-2.5" transform="translate(${6 + c * 9 + (r % 2) * 4.5},${6 + r * 7.6})" fill="${(r + c) % 3 === 0 ? "#1b6a78" : "#1a1d25"}" stroke="#35f2ff" stroke-width=".7"/>`).join("")).join("")}
<rect width="80" height="50" fill="none" stroke="#050609" stroke-width="3"/></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#2b3226" stroke="#0b0c10" stroke-width="3"/>
<rect x="4" y="4" width="72" height="8" fill="#f2c418"/><text x="40" y="11" text-anchor="middle" font-size="7" font-weight="bold" font-family="monospace" fill="#111">ORDNANCE</text>
<text x="40" y="26" text-anchor="middle" font-size="9" font-family="monospace" fill="#e8e4cf">RG-40 COIL</text>
<text x="40" y="35" text-anchor="middle" font-size="6" font-family="monospace" fill="#ff8a1c">HANDLE W/ CARE</text></svg>`,
  { size: 192 },
);

// ---------- paints ----------
const CAMO = paint((p, _n) => {
  const t = noise(p, 0.55, 3);
  const base = t > 0.62 ? "#4d5a40" : t > 0.42 ? "#3a4636" : "#262d26";
  const dust = smoothstep(1.9, 1.2, p.y) * 0.4 * noise(p, 0.22, 9);
  return mix(base, "#6b5f4a", dust);
});
const HULL = panelled(CAMO, { size: 0.6, aspect: 0.8, rivets: 0.09 });
const PLATEP = panelled(metal("iron", { tarnish: 0.5, seed: 4 }), { size: 0.4, rivets: 0.07 });
const STEEL = metal("steel", { tarnish: 0.3 });
const GUNM = metal("blued", { polish: 0.5 });
const MUD = paint((p, n) => mix("#25272e", "#4a3f2e", smoothstep(0.9, 0.2, p.y) * (0.5 + 0.5 * noise(p, 0.15, 5)) + 0 * n.y));

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const chassis = b.joint("chassis", { at: [0, 1, 0] });

  // helpers
  const box = (s: V, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { bone: chassis, ...o, at });
  const cyl = (r: number, h: number, sides: number, color: any, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone: chassis, ...o, at, dir });
  const lamp = (s: V, color: string, at: V, k = 1.5, o: any = {}) => glow(box(s, color, at, o), k);
  const plane = (w: number, h: number, tex: any, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, ...o, at, dir, axis: "z", texture: tex });
  const slabE = (outline: any, at: V, x: V, thick: number, color: any, o: any = {}) =>
    b.extrude(outline, { at, x, thickness: thick, bevel: 0.03, color, bone: chassis, ...o });
  const rod = (a: V, c: V, r: number, color: any, o: any = {}) => b.rod(a, c, r, color, { bone: chassis, ...o });

  // ---------- chassis, suspension, wheels ----------
  box([1.9, 0.5, 7.6], DARK2, [0, 1.1, 0]);
  box([1.2, 0.3, 7.2], PLATEP, [0, 0.82, 0]);
  rod([0, 0.85, -3.2], [0, 0.85, 3.2], 0.07, STEEL);
  for (const s of [1, -1]) {
    lamp([0.05, 0.05, 6.2], CY, [s * 0.98, 0.8, 0], 1.6);
    box([0.12, 0.5, 1.7], PLATEP, [s * 1.3, 1.1, 0.9]);
    plane(1.6, 0.22, HAZARD, [s * 1.37, 1.0, 0.9], [s, 0, 0]);
    box([0.12, 0.5, 0.4], PLATEP, [s * 1.3, 1.1, -1.45]);
  }
  const WZ = [2.4, -0.6, -2.3];
  WZ.forEach((z, wi) => {
    rod([-1.4, 0.62, z], [1.4, 0.62, z], 0.09, STEEL);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), PLATEP, { bone: chassis, at: [0, 0.62, z], scale: [1, 0.9, 1] });
    for (const s of [1, -1]) {
      box([0.12, 0.08, 1.1], DARK, [s * 0.7, 0.8, z]);
      rod([s * 0.9, 0.66, z + 0.25], [s * 0.82, 1.1, z + 0.15], 0.04, ORG);
      // fender + lip + mud flap
      box([0.7, 0.1, 1.5], PLATEP, [s * 1.45, 1.32, z]);
      box([0.08, 0.34, 1.5], PLATEP, [s * 1.8, 1.17, z]);
      box([0.55, 0.5, 0.04], DARK, [s * 1.4, 0.82, z - 0.78]);
      lamp([0.3, 0.04, 0.03], ORG, [s * 1.4, 0.62, z - 0.8], 1.2);
      // wheel
      const wj = b.joint(`wheel${s > 0 ? "L" : "R"}${wi + 1}`, {
        parent: chassis,
        at: [s * 1.4, 0.62, z],
        dir: [s, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.58, 0.58, 0.5, 14), TIRE, { bone: wj, at: [s * 1.4, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.54, 10), STEEL, { bone: wj, at: [s * 1.4, 0.62, z], dir: [1, 0, 0] });
      const blocks: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const g = new THREE.BoxGeometry(0.5, 0.08, 0.26);
        g.applyMatrix4(new THREE.Matrix4().makeRotationX(a));
        g.translate(s * 1.4, 0.62 + 0.58 * Math.cos(a), z + 0.58 * Math.sin(a));
        blocks.push(g);
      }
      b.part(mergeGeometries(blocks)!, "#0f1013", { bone: wj, at: [0, 0, 0] });
      b.part(new THREE.CircleGeometry(0.4, 12), "#ffffff", {
        bone: wj,
        at: [s * 1.4 + s * 0.275, 0.62, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: HUB,
      });
    }
  });

  // ---------- cab, hood, bed ----------
  slabE([[-0.4, 1.35], [2.3, 1.35], [2.3, 2.05], [1.3, 2.95], [-0.4, 2.95]] as any, [0, 0, 0], [0, 0, 1], 2.5, HULL);
  slabE([[2.3, 1.35], [3.8, 1.35], [3.8, 1.8], [3.4, 2.0], [2.3, 2.1]] as any, [0, 0, 0], [0, 0, 1], 2.4, HULL);
  slabE(
    [[-3.8, 1.35], [-0.5, 1.35], [-0.5, 2.45], [-3.5, 2.45], [-3.8, 2.2]] as any,
    [0, 0, 0],
    [0, 0, 1],
    2.5,
    HULL,
  );
  // plow / bumper
  slabE([[3.75, 0.62], [4.4, 0.8], [4.4, 1.15], [3.75, 1.3]] as any, [0, 0, 0], [0, 0, 1], 2.6, PLATEP);
  plane(2.4, 0.3, HAZARD, [0, 0.97, 4.41], [0, 0, 1]);
  for (let i = -2; i <= 2; i++) {
    cyl(0.06, 0.32, 6, STEEL, [i * 0.5, 0.97, 4.55], [0, 0, 1]);
    b.part(new THREE.ConeGeometry(0.06, 0.2, 6), "#d6dbe6", { bone: chassis, at: [i * 0.5, 0.97, 4.8], dir: [0, 0, 1] });
  }
  // grille, headlights
  plane(1.2, 0.36, GRILLE, [0, 1.58, 3.815], [0, 0, 1]);
  for (const s of [1, -1]) {
    lamp([0.45, 0.15, 0.06], "#bff6ff", [s * 0.95, 1.63, 3.82], 2.0);
    lamp([0.5, 0.03, 0.03], CY, [s * 0.95, 1.48, 3.82], 1.6);
    lamp([0.3, 0.1, 0.05], "#ffd66a", [s * 1.0, 1.0, 4.42], 1.6);
    box([0.1, 0.1, 0.25], STEEL, [s * 0.5, 0.75, 4.2]);
    plane(0.8, 0.5, HEX, [s * 0.55, 2.07, 2.8], [0, 1, 0], { up: [0, 0, 1] });
  }
  // windshield
  const wn = new THREE.Vector3(0, 1, 0.9).normalize();
  glow(
    plane(2.1, 1.2, GLASS, [0, 2.5 + wn.y * 0.02, 1.8 + wn.z * 0.02], [wn.x, wn.y, wn.z]),
    0.6,
  );
  box([2.3, 0.06, 0.1], PLATEP, [0, 3.0, 1.3], { rotation: [-42, 0, 0] });
  for (const s of [1, -1]) {
    rod([s * 0.15, 2.15, 2.05], [s * 0.9, 2.45, 1.75], 0.02, DARK);
  }
  // roof
  box([2.3, 0.06, 1.2], PLATEP, [0, 2.98, 0.15]);
  box([0.5, 0.18, 0.4], DARK, [0, 3.07, 0.2]);
  lamp([0.3, 0.04, 0.02], CY, [0, 3.07, 0.41], 1.5);
  for (let i = -3; i <= 3; i++)
    lamp([0.28, 0.08, 0.12], i % 2 ? "#2a6cff" : RED, [i * 0.3, 3.06, 1.0], 1.8);

  for (const s of [1, -1]) {
    // cab sides
    glow(plane(1.9, 0.55, SIDEWIN, [s * 1.262, 2.4, 0.65], [s, 0, 0]), 0.4);
    box([0.02, 1.1, 0.03], DARK, [s * 1.255, 2.0, 1.65]);
    box([0.02, 1.45, 0.03], DARK, [s * 1.255, 2.2, -0.05]);
    lamp([0.04, 0.05, 0.2], CY, [s * 1.27, 2.0, 1.4], 1.4);
    slabE([[0, 0], [1.9, 0], [1.9, 0.55], [0, 0.6]] as any, [s * 1.29, 1.45, -0.2], [0, 0, 1], 0.08, PLATEP);
    plane(0.45, 0.45, EMBLEM, [s * 1.335, 1.73, 0.7], [s, 0, 0]);
    // mirrors
    rod([s * 1.25, 2.3, 1.7], [s * 1.52, 2.35, 1.75], 0.02, DARK);
    box([0.05, 0.35, 0.22], "#0e2a33", [s * 1.55, 2.35, 1.75]);
    lamp([0.01, 0.2, 0.03], CY, [s * 1.52, 2.45, 1.86], 1.4);
    // step
    box([0.35, 0.05, 0.9], DARK, [s * 1.3, 1.25, 1.1]);
    // exhaust stacks
    cyl(0.1, 1.9, 8, STEEL, [s * 1.35, 2.35, -0.55], [0, 1, 0]);
    cyl(0.14, 0.08, 8, DARK, [s * 1.35, 3.33, -0.55], [0, 1, 0]);
    lamp([0.1, 0.03, 0.1], ORG, [s * 1.35, 3.38, -0.55], 1.6);
    box([0.06, 1.0, 0.3], PLATEP, [s * 1.28, 2.2, -0.55]);
    // antennas
    rod([s * 1.1, 2.97, -0.3], [s * 1.2, 4.2, -0.5], 0.02, DARK);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: chassis, at: [s * 1.2, 4.22, -0.5] }), 2);
    // missile pods
    const th = -22;
    const C = new THREE.Vector3(s * 0.95, 3.5, 0.25);
    box([0.4, 0.3, 0.7], PLATEP, [s * 0.95, 3.1, 0.2]);
    box([0.55, 0.5, 1.3], HULL, [C.x, C.y, C.z], { rotation: [th, 0, 0] });
    const eul = new THREE.Euler((th * Math.PI) / 180, 0, 0);
    for (const lx of [-0.14, 0.14])
      for (const ly of [-0.14, 0, 0.14]) {
        const w = new THREE.Vector3(lx, ly, 0.66).applyEuler(eul).add(C);
        glow(cyl(0.08, 0.08, 6, ORG, [w.x, w.y, w.z], [0, 0, 1], { rotation: [90 + th, 0, 0], dir: undefined }), 1.3);
      }
    box([0.5, 0.04, 1.2], DARK, [C.x, C.y + 0.26, C.z - 0.1], { rotation: [th, 0, 0] });
  }

  // ---------- bed ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) box([0.06, 0.9, 0.12], PLATEP, [s * 1.28, 1.9, -0.8 - i * 0.7]);
    plane(3.0, 0.22, HAZARD, [s * 1.255, 1.5, -2.1], [s, 0, 0]);
    plane(0.9, 0.5, HEX, [s * 1.255, 2.2, -0.95], [s, 0, 0]);
    lamp([0.04, 0.04, 2.8], s > 0 ? CY : MG, [s * 1.27, 2.4, -2.2], 1.6);
    // racks + crates
    box([0.18, 0.4, 0.9], PLATEP, [s * 1.36, 1.7, -1.7]);
    plane(0.8, 0.38, WARN, [s * 1.456, 1.7, -1.7], [s, 0, 0]);
    box([0.5, 0.35, 0.6], PLATEP, [s * 0.75, 2.63, -3.2]);
    plane(0.5, 0.25, WARN, [s * 0.75, 2.63, -2.89], [0, 0, 1]);
    // tail lights
    lamp([0.35, 0.15, 0.05], RED, [s * 1.0, 1.9, -3.82], 2.0);
    box([0.5, 0.06, 0.08], DARK, [s * 1.0, 2.05, -3.83]);
  }
  plane(1.0, 1.0, EMBLEM, [1.255, 1.95, -2.9], [1, 0, 0]);
  glow(plane(1.2, 0.84, RADAR, [-1.256, 1.95, -2.9], [-1, 0, 0]), 0.8);
  plane(0.7, 0.24, PLATE, [0, 1.6, -3.81], [0, 0, -1]);
  lamp([1.3, 0.04, 0.04], MG, [0, 1.45, -3.82], 1.6);
  box([0.5, 0.2, 0.4], STEEL, [0, 1.2, -3.9]);
  for (let i = -1; i <= 1; i++) plane(0.5, 0.3, HEX, [i * 0.7, 2.465, -0.9], [0, 1, 0], { up: [0, 0, 1] });

  // radar dish mast
  box([0.1, 0.5, 0.1], DARK, [0.85, 2.7, -3.55]);
  b.lathe(
    [[0, 0], [0.35, 0.12], [0.38, 0.14], [0.34, 0.14], [0, 0.03]] as any,
    { at: [0.85, 3.0, -3.55], axis: [0.25, 0.8, -0.35], color: "#cfd6e2", bone: chassis },
  );
  rod([0.85, 2.95, -3.55], [0.9, 3.25, -3.7], 0.02, DARK);
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), MG, { bone: chassis, at: [0.9, 3.27, -3.7] }), 2);

  // lidar
  const lidar = b.joint("lidar", { parent: chassis, at: [0, 2.5, -3.3], dir: [0, 1, 0] });
  cyl(0.28, 0.2, 8, PLATEP, [0, 2.55, -3.3], [0, 1, 0]);
  cyl(0.2, 0.25, 8, DARK, [0, 2.78, -3.3], [0, 1, 0], { bone: lidar });
  glow(cyl(0.215, 0.05, 8, CY, [0, 2.8, -3.3], [0, 1, 0], { bone: lidar }), 1.8);
  cyl(0.1, 0.08, 6, STEEL, [0, 2.95, -3.3], [0, 1, 0], { bone: lidar });

  // ---------- turret ----------
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.5, -2.1], dir: [0, 1, 0] });
  const tb = { bone: turret };
  cyl(0.85, 0.12, 12, PLATEP, [0, 2.51, -2.1], [0, 1, 0], tb);
  glow(cyl(0.87, 0.03, 12, CY, [0, 2.57, -2.1], [0, 1, 0], tb), 1.6);
  box([1.5, 0.6, 1.5], HULL, [0, 2.9, -2.1], tb);
  box([1.4, 0.55, 0.15], PLATEP, [0, 3.05, -1.4], { ...tb, rotation: [-35, 0, 0] });
  box([1.2, 0.08, 1.2], DARK, [0, 3.22, -2.2], tb);
  for (const s of [1, -1]) {
    box([0.12, 0.5, 1.2], PLATEP, [s * 0.8, 2.95, -2.1], tb);
    plane(0.5, 0.25, EMBLEM, [s * 0.865, 2.95, -2.1], [s, 0, 0], tb);
    for (let k = 0; k < 3; k++) {
      cyl(0.05, 0.28, 6, DARK, [s * 0.88, 3.0, -2.45 + k * 0.17], [0, 1, 0], { ...tb, rotation: [0, 0, -s * 30] });
      glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { bone: turret, at: [s * 0.96, 3.15, -2.45 + k * 0.17] }), 1.6);
    }
    rod([s * 0.6, 3.22, -2.7], [s * 0.6, 3.75, -2.8], 0.015, DARK, tb);
    lamp([0.06, 0.06, 0.06], CY, [s * 0.6, 3.77, -2.8], 2, tb);
  }
  box([0.35, 0.2, 0.3], DARK2, [0, 3.34, -2.75], tb);
  lamp([0.2, 0.06, 0.02], MG, [0, 3.36, -2.59], 1.8, tb);

  const gun = b.joint("gun", { parent: turret, at: [0, 3.25, -1.4], dir: [0, 0, 1] });
  const gb = { bone: gun };
  box([1.1, 0.5, 0.4], GUNM, [0, 3.25, -1.3], gb);
  for (const s of [1, -1]) {
    rod([s * 0.28, 3.25, -1.15], [s * 0.28, 3.25, -0.1], 0.16, GUNM, gb);
    rod([s * 0.28, 3.25, -0.1], [s * 0.28, 3.25, 1.85], [0.1, 0.085], STEEL, gb);
    for (let k = 0; k < 6; k++) glow(cyl(0.16, 0.1, 8, CY, [s * 0.28, 3.25, 0.1 + k * 0.28], [0, 0, 1], gb), 1.7);
    box([0.22, 0.22, 0.3], DARK, [s * 0.28, 3.25, 1.95], gb);
    box([0.3, 0.05, 0.2], PLATEP, [s * 0.28, 3.25, 1.95], gb);
  }
  box([0.18, 0.28, 0.3], PLATEP, [0, 3.28, -0.9], gb);
  lamp([0.04, 0.04, 0.05], RED, [0, 3.44, -0.9], 2, gb);

  return b.root;
}
