import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, stripes, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Kurogane Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured 6-wheel convoy hauler with a plough bumper, roof turret and a ribbed, neon-trimmed sealed cargo pod with a hinged seal door.",
};

type V = [number, number, number];

const DARK = "#10151c";
const STEEL = "#56606e";
const STEEL2 = "#3a4350";
const RUBBER = "#15171b";
const CYAN = "#19f2ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb020";
const RED = "#ff2244";
const YELLOW = "#f2c200";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

// ---------------------------------------------------------------- textures
const LOGO = svg(
  `<svg viewBox="0 0 260 82" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="256" height="78" rx="8" fill="#071018" stroke="#19f2ff" stroke-width="3"/>
  <polygon points="36,12 60,26 60,56 36,70 12,56 12,26" fill="none" stroke="#ff2bd6" stroke-width="4"/>
  <rect x="25" y="38" width="22" height="16" fill="#ff2bd6"/>
  <path d="M29 38 v-7 a7 7 0 0 1 14 0 v7" stroke="#19f2ff" stroke-width="4" fill="none"/>
  <text x="72" y="42" font-size="27" font-weight="900" fill="#19f2ff" font-family="Arial Black, sans-serif">KUROGANE</text>
  <text x="73" y="64" font-size="11" fill="#ff2bd6" font-family="monospace">SEALED FREIGHT // CLASS-9</text>
  <rect x="214" y="14" width="4" height="26" fill="#e8f6ff"/><rect x="221" y="14" width="2" height="26" fill="#e8f6ff"/>
  <rect x="226" y="14" width="6" height="26" fill="#e8f6ff"/><rect x="235" y="14" width="3" height="26" fill="#e8f6ff"/>
  <rect x="241" y="14" width="5" height="26" fill="#e8f6ff"/>
  <path d="M214 50 h32 M214 58 h32 M214 66 h20" stroke="#19f2ff" stroke-width="3"/>
</svg>`,
  { size: 640 },
);

function sealSvg() {
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r0 = i % 2 ? 74 : 70;
    ticks += `<path d="M${100 + Math.sin(a) * r0} ${100 - Math.cos(a) * r0} L${100 + Math.sin(a) * 84} ${100 - Math.cos(a) * 84}" stroke="#ff2244" stroke-width="4"/>`;
  }
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="96" fill="#1a0509" stroke="#ff2244" stroke-width="5"/>
  ${ticks}
  <circle cx="100" cy="100" r="60" fill="none" stroke="#ff2bd6" stroke-width="4" stroke-dasharray="14 8"/>
  <polygon points="100,52 142,76 142,124 100,148 58,124 58,76" fill="#2a0a14" stroke="#ff2244" stroke-width="5"/>
  <circle cx="100" cy="100" r="22" fill="none" stroke="#19f2ff" stroke-width="4"/>
  <circle cx="100" cy="100" r="8" fill="#ff2244"/>
  <path d="M100 78 v-14 M100 122 v14 M78 100 h-14 M122 100 h14" stroke="#19f2ff" stroke-width="4"/>
</svg>`;
}
const SEAL = svg(sealSvg(), { size: 512 });

let hz = "";
for (let i = 0; i < 9; i++)
  hz += `<polygon points="${i * 16},24 ${i * 16 + 8},24 ${i * 16 + 20},0 ${i * 16 + 12},0" fill="#111418"/>`;
const HAZ = svg(`<svg viewBox="0 0 96 24" xmlns="http://www.w3.org/2000/svg"><rect width="96" height="24" fill="#f2c200"/>${hz}</svg>`, { size: 384 });

const WIND = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a3a4a"/><stop offset="1" stop-color="#03121a"/></linearGradient></defs>
  <rect width="200" height="100" fill="url(#g)"/>
  <polygon points="20,0 60,0 30,100 -10,100" fill="#ffffff" opacity="0.10"/>
  <polygon points="120,0 140,0 110,100 90,100" fill="#ffffff" opacity="0.07"/>
  <circle cx="50" cy="48" r="16" fill="none" stroke="#19f2ff" stroke-width="2.5"/>
  <path d="M50 28 v8 M50 60 v8 M30 48 h8 M62 48 h8" stroke="#19f2ff" stroke-width="2.5"/>
  <circle cx="150" cy="48" r="16" fill="none" stroke="#ff2bd6" stroke-width="2.5"/>
  <path d="M10 92 L44 70 M190 92 L156 70" stroke="#19f2ff" stroke-width="2.5"/>
  <text x="10" y="16" font-size="10" fill="#19f2ff" font-family="monospace">087 KM/H</text>
  <text x="128" y="16" font-size="10" fill="#ff2bd6" font-family="monospace">CONVOY 3/5</text>
  <rect x="97" y="0" width="6" height="100" fill="#02080c"/>
  <rect x="1" y="1" width="198" height="98" fill="none" stroke="#02080c" stroke-width="4"/>
</svg>`,
  { size: 512 },
);

const FACE = svg(
  `<svg viewBox="0 0 200 56" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="56" fill="#05080c"/>
  <polygon points="8,8 74,14 70,28 12,24" fill="#fff6c0" stroke="#ffb020" stroke-width="3"/>
  <polygon points="192,8 126,14 130,28 188,24" fill="#fff6c0" stroke="#ffb020" stroke-width="3"/>
  <rect x="82" y="10" width="36" height="16" rx="3" fill="#1a0008" stroke="#ff2244" stroke-width="3"/>
  <rect x="86" y="17" width="28" height="3" fill="#ff2244"/>
  <circle cx="100" cy="18" r="4" fill="#ff2244"/>
  <rect x="14" y="36" width="172" height="4" fill="#19f2ff"/>
  <rect x="14" y="44" width="172" height="4" fill="#2a3340"/>
  <text x="84" y="34" font-size="8" fill="#ff2bd6" font-family="monospace">KG-07</text>
</svg>`,
  { size: 512 },
);

const DOOR = svg(
  `<svg viewBox="0 0 70 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="68" height="38" rx="3" fill="#0b1220" stroke="#ffb020" stroke-width="2.5"/>
  <text x="8" y="28" font-size="22" font-weight="900" fill="#ffb020" font-family="Arial Black, sans-serif">K-07</text>
  <path d="M50 8 l8 6 l-8 6 M58 8 l8 6 l-8 6" stroke="#ff2bd6" stroke-width="2.5" fill="none"/>
</svg>`,
  { size: 256 },
);

const TAIL = svg(
  `<svg viewBox="0 0 220 30" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="30" fill="#2a0008"/>
  <rect x="4" y="6" width="62" height="18" fill="#ff1744"/><rect x="154" y="6" width="62" height="18" fill="#ff1744"/>
  <rect x="78" y="3" width="64" height="24" rx="2" fill="#e8f6ff"/>
  <text x="84" y="21" font-size="14" font-weight="bold" fill="#10151c" font-family="monospace">HX-0742</text>
</svg>`,
  { size: 512 },
);

const TOP = svg(
  `<svg viewBox="0 0 80 260" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="76" height="256" rx="4" fill="#0b1220" stroke="#f2c200" stroke-width="4"/>
  <polygon points="40,14 66,58 14,58" fill="none" stroke="#f2c200" stroke-width="5"/>
  <rect x="37" y="28" width="6" height="16" fill="#f2c200"/><rect x="37" y="48" width="6" height="5" fill="#f2c200"/>
  <text transform="translate(50,160) rotate(-90)" text-anchor="middle" font-size="26" font-weight="900" fill="#f2c200" font-family="Arial Black, sans-serif">DO NOT OPEN</text>
  <path d="M16 214 l24 -14 l24 14 M16 234 l24 -14 l24 14" stroke="#ff2bd6" stroke-width="5" fill="none"/>
</svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------- paints
const GRIME = paint((p, n) => {
  const base = mix("#222c3a", "#425570", smoothstep(0.2, 1, n.y) * 0.8 + 0.2 * noise(p, 0.5, 2));
  const dirt = smoothstep(1.3, 0.3, p.y) * 0.55 * (0.5 + noise(p, 0.25, 5));
  return mix(base, "#2a2118", dirt);
});
const HULL = panelled(GRIME, { size: 0.55, aspect: 0.7, rivets: 0.07 });
const PODPAINT = panelled(
  paint((p, n) => mix(mix("#2b3d46", "#4a6670", smoothstep(0, 1, n.y) * 0.7 + 0.3 * noise(p, 0.7, 7)), "#1c1a17", smoothstep(2.2, 1.2, p.y) * 0.5)),
  { size: 0.8, aspect: 0.5, rivets: 0.1 },
);
const RIB = metal("iron", { tarnish: 0.5 });
const PLOW = stripes(YELLOW, "#111418", { size: 0.3, axis: [1, 0, 1], width: 0.5, wobble: 0.05 });

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const put = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { bone: chassis, at, ...o });
  const rd = (a: V, c: V, r: number, color: any, o: any = {}) => b.rod(a, c, r, color, { bone: chassis, sides: 6, ...o });
  const decal = (tex: any, at: V, dir: V, w: number, h: number, str: number, o: any = {}) =>
    glow(b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o }), str);
  const r = rng(5);

  // ------------------------------------------------------------ chassis
  put(box(2.0, 0.5, 7.8), DARK, [0, 0.85, -0.2]);
  for (const s of [1, -1]) {
    put(box(0.14, 0.3, 7.8), STEEL2, [s * 0.95, 0.7, -0.2]);
    rd([s * 0.9, 0.5, -3.8], [s * 0.9, 0.5, 3.4], 0.035, CYAN, { sides: 5 });
  }
  glow(rd([0.9, 0.5, -3.8], [0.9, 0.5, 3.4], 0.04, CYAN, { sides: 5 }), 1.5);
  glow(rd([-0.9, 0.5, -3.8], [-0.9, 0.5, 3.4], 0.04, CYAN, { sides: 5 }), 1.5);
  put(box(2.2, 0.12, 5.3), STEEL, [0, 1.16, -1.45]); // pod cradle
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1;
    put(box(0.1 + r() * 0.15, 0.1 + r() * 0.1, 0.15 + r() * 0.3), i % 3 ? STEEL2 : DARK, [s * 1.12, 1.08, -3.7 + i * 0.45]);
  }
  put(box(2.3, 0.4, 0.5), DARK, [0, 0.7, 3.9]); // front beam

  // ------------------------------------------------------------ wheels
  const WX = 1.35;
  function wheel(name: string, s: number, z: number, steer: boolean) {
    const hub: V = [s * WX, 0.55, z];
    const parent = steer ? b.joint(`steer${name}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : chassis;
    const j = b.joint(`wheel${name}`, { parent, at: hub, dir: [s, 0, 0], role: "hinge" });
    const wp = (g: THREE.BufferGeometry, c: any, dx: number, o: any = {}) => b.part(g, c, { bone: j, at: [s * (WX + dx), 0.55, z], ...o });
    wp(cyl(0.5, 0.5, 14), RUBBER, 0, { rotation: [0, 0, 90], flat: true });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(box(0.52, 0.11, 0.22), RUBBER, {
        bone: j,
        at: [s * WX, 0.55 + 0.5 * Math.cos(a), z + 0.5 * Math.sin(a)],
        rotation: [(a * 180) / Math.PI, 0, 0],
        flat: true,
      });
    }
    wp(cyl(0.3, 0.12, 10), STEEL, s * 0.0 + 0.24, { rotation: [0, 0, 90], flat: true });
    wp(cyl(0.2, 0.06, 10), DARK, 0.3, { rotation: [0, 0, 90], flat: true });
    glow(wp(new THREE.TorusGeometry(0.27, 0.022, 5, 14), CYAN, 0.31, { rotation: [0, 90, 0] }), 1.4);
    wp(cyl(0.09, 0.14, 8), STEEL2, 0.33, { rotation: [0, 0, 90] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cyl(0.022, 0.05, 6), "#9aa4b2", {
        bone: j,
        at: [s * (WX + 0.34), 0.55 + 0.15 * Math.cos(a), z + 0.15 * Math.sin(a)],
        rotation: [0, 0, 90],
      });
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      b.part(box(0.04, 0.2, 0.07), STEEL2, {
        bone: j,
        at: [s * (WX + 0.3), 0.55 + 0.22 * Math.cos(a), z + 0.22 * Math.sin(a)],
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // fender, flap, axle
    put(box(0.7, 0.1, 1.45), HULL, [s * WX, 1.22, z]);
    put(box(0.06, 0.2, 1.45), STEEL2, [s * (WX + 0.34), 1.14, z]);
    put(box(0.5, 0.42, 0.04), RUBBER, [s * WX, 0.45, z - 0.66]);
    put(box(0.3, 0.05, 0.03), YELLOW, [s * WX, 0.3, z - 0.69]);
    rd([s * 0.2, 0.55, z], [s * (WX - 0.2), 0.55, z], 0.08, DARK, { sides: 8 });
    put(box(0.12, 0.08, 0.9), STEEL, [s * 0.75, 0.82, z]);
  }
  wheel("FL", 1, 2.9, true);
  wheel("FR", -1, 2.9, true);
  wheel("ML", 1, -1.0, false);
  wheel("MR", -1, -1.0, false);
  wheel("RL", 1, -2.6, false);
  wheel("RR", -1, -2.6, false);
  for (const z of [2.9, -1.0, -2.6]) put(new THREE.SphereGeometry(0.2, 6, 4), DARK, [0, 0.55, z], { flat: true });

  // ------------------------------------------------------------ cab
  b.extrude(
    [[1.4, 0.9], [4.1, 0.9], [4.15, 1.55], [3.45, 1.85], [2.75, 2.65], [1.6, 2.65], [1.4, 2.5]] as any,
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.06, color: HULL, bone: chassis },
  );
  decal(FACE, [0, 1.22, 4.14], [0, 0, 1], 2.1, 0.58, 1.0);
  decal(WIND, [0, 2.265, 3.115], [0, 0.658, 0.753], 2.0, 0.95, 0.8);
  put(box(2.3, 0.05, 0.05), DARK, [0, 2.69, 2.68]);
  // hood vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const z = 3.55 + i * 0.12;
      const y = 1.55 + (4.15 - z) * 0.4286 + 0.02;
      put(box(0.5, 0.03, 0.07), i % 2 ? DARK : STEEL2, [s * 0.6, y, z], { rotation: [23, 0, 0] });
    }
  glow(put(box(0.04, 0.02, 0.6), AMBER, [0, 1.74, 3.8], { rotation: [23, 0, 0] }), 1.2);
  // plough
  b.extrude([[-1.35, 4.0], [1.35, 4.0], [1.25, 4.4], [0, 4.75, "sharp"], [-1.25, 4.4]] as any, {
    at: [0, 0.6, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.35, bevel: 0.03, color: PLOW, bone: chassis,
  });
  for (let i = 0; i < 7; i++) {
    const x = -1.05 + i * 0.35;
    const zv = 4.75 - 0.35 * (Math.abs(x) / 1.25) * 1.0 - 0.05;
    b.spike([x, 0.55, zv], [0, 0, 1], 0.25, 0.06, STEEL, { bone: chassis, sides: 4 });
  }
  for (const s of [1, -1]) {
    put(cyl(0.05, 0.3, 6), STEEL, [s * 0.9, 0.62, 4.1], { rotation: [90, 0, 0] });
    put(new THREE.TorusGeometry(0.07, 0.02, 5, 8), STEEL, [s * 0.9, 0.62, 4.28]);
  }
  // doors, windows, handles
  for (const s of [1, -1]) {
    put(box(0.05, 1.05, 1.15), HULL, [s * 1.17, 1.5, 2.1]);
    put(box(0.06, 1.05, 0.03), DARK, [s * 1.18, 1.5, 1.52]);
    put(box(0.06, 1.05, 0.03), DARK, [s * 1.18, 1.5, 2.68]);
    put(box(0.07, 0.05, 0.22), STEEL, [s * 1.2, 1.75, 1.75]);
    decal(DOOR, [s * 1.205, 1.3, 2.15], [s, 0, 0], 0.7, 0.4, 0.7);
    decal(WIND, [s * 1.18, 2.32, 2.1], [s, 0, 0], 0.95, 0.5, 0.6);
    put(box(0.04, 0.5, 0.05), DARK, [s * 1.19, 2.32, 1.6]);
    put(box(0.04, 0.5, 0.05), DARK, [s * 1.19, 2.32, 2.62]);
    // mirrors
    rd([s * 1.15, 2.1, 2.65], [s * 1.6, 2.0, 2.8], 0.03, STEEL);
    put(box(0.07, 0.45, 0.3), DARK, [s * 1.65, 1.95, 2.8]);
    glow(put(box(0.02, 0.38, 0.04), CYAN, [s * 1.7, 1.95, 2.8]), 1.2);
    // steps and rail
    put(box(0.3, 0.06, 0.6), STEEL2, [s * 1.3, 0.85, 1.9]);
    put(box(0.3, 0.06, 0.6), STEEL2, [s * 1.3, 1.15, 1.9]);
    rd([s * 1.2, 1.2, 1.55], [s * 1.2, 2.0, 1.55], 0.025, YELLOW);
    // fuel tank
    put(cyl(0.3, 1.3, 8), STEEL, [s * 1.0, 0.72, 0.5], { rotation: [90, 0, 0], flat: true });
    for (const z of [0.1, 0.9]) put(box(0.64, 0.05, 0.08), DARK, [s * 1.0, 0.72, z]);
    glow(put(box(0.04, 0.2, 0.04), AMBER, [s * 1.3, 0.72, 0.5]), 1.0);
    // exhaust stack
    rd([s * 1.05, 1.2, 1.25], [s * 1.05, 3.25, 1.25], 0.09, STEEL, { sides: 8 });
    put(cyl(0.12, 0.8, 8), STEEL2, [s * 1.05, 1.8, 1.25]);
    glow(put(new THREE.TorusGeometry(0.08, 0.02, 5, 8), AMBER, [s * 1.05, 3.27, 1.25], { rotation: [90, 0, 0] }), 1.2);
    put(box(0.2, 0.03, 0.2), DARK, [s * 1.05, 3.34, 1.25], { rotation: [-15, 0, 0] });
    // cab bolts / armour strip
    put(box(0.05, 0.12, 2.5), STEEL2, [s * 1.17, 1.0, 2.7]);
  }
  // bellows and cables
  put(box(1.7, 1.0, 0.35), RUBBER, [0, 1.7, 1.25]);
  for (let i = 0; i < 4; i++) put(box(1.74, 0.05, 0.4), DARK, [0, 1.35 + i * 0.22, 1.25]);
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.5, 2.5, 1.4], [s * 0.6, 2.3, 1.25], [s * 0.45, 2.0, 1.1]]), 0.03, { color: MAG, bone: chassis, sides: 5 });

  // ------------------------------------------------------------ roof gear
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.65, 1.95], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.05, 1.95], dir: [0, 0, 1], role: "hinge" });
  put(new THREE.TorusGeometry(0.42, 0.04, 5, 14), STEEL, [0, 2.69, 1.95], { rotation: [90, 0, 0] });
  b.part(cyl(0.34, 0.2, 10), STEEL2, { bone: yaw, at: [0, 2.78, 1.95], flat: true });
  b.part(box(0.7, 0.35, 0.7), HULL, { bone: yaw, at: [0, 3.0, 1.95] });
  for (const s of [1, -1]) {
    b.part(box(0.28, 0.36, 0.5), DARK, { bone: yaw, at: [s * 0.52, 2.98, 1.9] });
    glow(b.part(box(0.2, 0.03, 0.03), AMBER, { bone: yaw, at: [s * 0.52, 3.08, 2.16] }), 1.2);
    b.rod([s * 0.18, 3.05, 2.0], [s * 0.18, 3.05, 3.3], 0.05, STEEL, { bone: pitch, sides: 8 });
    b.part(cyl(0.08, 0.26, 8), DARK, { bone: pitch, at: [s * 0.18, 3.05, 3.3], rotation: [90, 0, 0] });
    glow(b.part(cyl(0.04, 0.03, 6), RED, { bone: pitch, at: [s * 0.18, 3.05, 3.45], rotation: [90, 0, 0] }), 1.4);
    b.part(box(0.1, 0.12, 0.8), STEEL2, { bone: pitch, at: [s * 0.18, 3.05, 2.4] });
  }
  b.part(new THREE.SphereGeometry(0.13, 6, 4), DARK, { bone: yaw, at: [0.2, 3.28, 1.8], flat: true });
  glow(b.part(cyl(0.05, 0.03, 6), RED, { bone: yaw, at: [0.2, 3.28, 1.92], rotation: [90, 0, 0] }), 1.4);
  // light bar
  put(box(1.6, 0.1, 0.22), DARK, [0, 2.7, 2.55]);
  for (let i = 0; i < 8; i++) glow(put(box(0.17, 0.07, 0.05), i < 4 ? MAG : CYAN, [-0.7 + i * 0.2, 2.78, 2.65]), 1.5);
  // antennas and dish
  for (const x of [0.95, -0.95]) b.spike([x, 2.65, 1.6], [0, 1, 0], 1.3, 0.025, STEEL, { bone: chassis, sides: 5 });
  glow(put(new THREE.SphereGeometry(0.04, 5, 4), RED, [0.95, 3.97, 1.6]), 1.5);
  rd([-0.65, 2.65, 1.7], [-0.65, 2.95, 1.7], 0.04, STEEL);
  b.lathe([[0, 0], [0.3, 0.12], [0.3, 0.14], [0, 0.03]], { at: [-0.65, 3.0, 1.7], axis: [0, 0.8, -0.6], segments: 12, bone: chassis, color: HULL });
  rd([-0.65, 3.05, 1.68], [-0.65, 3.3, 1.5], 0.012, STEEL, { sides: 4 });

  // ------------------------------------------------------------ cargo pod
  b.sweep([[0, 2.35, -4.0], [0, 2.35, 1.1]], 1.15, { sides: 8, caps: "flat", color: PODPAINT, bone: chassis });
  for (const z of [-3.9, -3.0, 0.0, 0.85]) {
    b.sweep([[0, 2.35, z], [0, 2.35, z + 0.22]], 1.21, { sides: 8, caps: "flat", color: RIB, bone: chassis });
    for (const s of [1, -1]) {
      put(box(0.1, 0.16, 0.16), STEEL, [s * 1.23, 1.95, z + 0.11]);
      glow(put(box(0.03, 0.05, 0.05), AMBER, [s * 1.29, 1.95, z + 0.11]), 1.3);
    }
  }
  for (const s of [1, -1]) {
    decal(LOGO, [s * 1.17, 2.35, -1.39], [s, 0, 0], 2.6, 0.82, 0.8);
    glow(rd([s * 1.2, 1.88, -2.75], [s * 1.2, 1.88, -0.05], 0.03, MAG, { sides: 5 }), 1.6);
    glow(rd([s * 1.2, 2.82, -2.75], [s * 1.2, 2.82, -0.05], 0.03, CYAN, { sides: 5 }), 1.6);
    decal(HAZ, [s * 0.827, 1.523, -1.39], [s * 0.707, -0.707, 0], 2.6, 0.3, 0.5);
    for (let i = 0; i < 6; i++)
      glow(put(box(0.1, 0.08, 0.14), AMBER, [s * 0.83, 3.18, -2.45 + i * 0.45], { rotation: [0, 0, -s * 45] }), 1.3);
  }
  decal(TOP, [0, 3.515, -1.4], [0, 1, 0], 0.8, 2.6, 0.7, { up: [0, 0, 1] });
  for (const x of [-0.25, 0.25]) glow(put(box(0.06, 0.04, 2.6), CYAN, [x + Math.sign(x) * 0.28, 3.52, -1.4]), 1.2);
  // front lamps
  for (const x of [-0.5, 0.5]) glow(put(box(0.3, 0.12, 0.04), AMBER, [x, 2.9, 1.12]), 1.2);

  // rear seal door
  const door = b.joint("podDoor", { parent: chassis, at: [1.0, 2.35, -4.1], dir: [0, 1, 0], role: "hinge" });
  b.part(cyl(0.95, 0.14, 8), STEEL2, { bone: door, at: [0, 2.35, -4.08], rotation: [90, 0, 0], flat: true });
  b.part(new THREE.TorusGeometry(0.86, 0.06, 5, 8), STEEL, { bone: door, at: [0, 2.35, -4.17] });
  glow(b.part(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", { bone: door, at: [0, 2.35, -4.16], dir: [0, 0, -1], axis: "z", texture: SEAL }), 1.0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.39;
    b.part(cyl(0.05, 0.1, 6), "#9aa4b2", { bone: door, at: [0.9 * Math.sin(a) * 0.95, 2.35 + 0.9 * Math.cos(a) * 0.95, -4.2], rotation: [90, 0, 0] });
  }
  for (const y of [1.6, 3.1]) b.part(cyl(0.07, 0.4, 6), STEEL, { bone: door, at: [0.98, y - 0.0, -4.1] });
  b.part(box(1.9, 0.12, 0.08), DARK, { bone: door, at: [0, 2.35, -4.2] });
  for (const s of [1, -1]) glow(b.part(box(0.1, 0.1, 0.04), RED, { bone: door, at: [s * 0.92, 2.35, -4.25] }), 1.5);

  // rear bumper / tail
  put(box(2.4, 0.35, 0.3), DARK, [0, 0.85, -4.2]);
  decal(TAIL, [0, 0.85, -4.36], [0, 0, -1], 2.2, 0.3, 0.9);
  put(cyl(0.06, 0.2, 8), STEEL, [0, 0.6, -4.3]);
  put(new THREE.SphereGeometry(0.1, 6, 4), STEEL, [0, 0.72, -4.3], { flat: true });
  for (const s of [1, -1]) decal(HAZ, [s * 1.0, 1.1, -4.12], [0, 0, -1], 0.4, 0.14, 0.4);

  return b.root;
}
