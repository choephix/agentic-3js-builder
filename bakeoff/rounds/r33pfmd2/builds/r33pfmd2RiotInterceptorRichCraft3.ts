import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg, lerp, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "MCO Riot Interceptor",
  description:
    "Cyberpunk corporate riot-control interceptor: armored 4-wheeler with a roof water cannon, neon light bars, strobes, hazard ram bumper and corporate decals.",
};

// ---------- palette ----------
const CYAN = "#19f2ff";
const MAGENTA = "#ff2bd6";
const YELLOW = "#ffd400";
const RED = "#ff2038";
const BLUE = "#2a62ff";
const WHITE = "#eaffff";
const DARK = "#14161c";
const DARK2 = "#1f232c";
const STEEL = "#5d6676";
const TYRE = "#101114";
const GLASS = "#ffffff";

const fr = (x: number) => x - Math.floor(x);

// ---------- paints ----------
const ARMOR = paint((p, n) => {
  const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
  const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
  let c = mix("#1b202a", "#3d4759", 0.65 * smoothstep(-0.3, 1, n.y) + 0.35 * noise(p, 0.35, 3));
  const du = fr(u / 0.9) * 0.9;
  const dv = fr(v / 0.6) * 0.6;
  if (du < 0.012 || dv < 0.012) c = mix(c, "#090b0f", 0.8);
  else if (du < 0.026 || dv < 0.026) c = mix(c, "#8a97b0", 0.12);
  const dirt = smoothstep(0.95, 0.4, p.y) * smoothstep(0.35, 0.75, noise(p, 0.2, 8));
  return mix(c, "#15110f", dirt * 0.7);
});
const TANK = paint((p, n) => {
  let c = mix("#7e90a4", "#b4c2d0", 0.5 * smoothstep(-0.2, 1, n.y) + 0.4 * noise(p, 0.3, 5));
  if (p.z < -1.78 && p.z > -1.92) c = fr((p.x + p.y) / 0.16) < 0.5 ? "#ffd400" : "#14161c";
  return mix(c, "#222", smoothstep(2.3, 2.15, p.y) * 0.4);
}) as any;

// ---------- textures ----------
let hz = "";
for (let i = -2; i < 18; i++) hz += `<polygon points="${i * 8},8 ${i * 8 + 4},0 ${i * 8 + 8},0 ${i * 8 + 4},8" fill="#ffd400"/>`;
const HAZARD = svg(`<svg viewBox="0 0 128 8" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="8" fill="#0d0d10"/>${hz}</svg>`, { size: 512 });

let slits = "";
for (let i = 0; i < 9; i++) slits += `<rect x="6" y="${4 + i * 3.1}" width="98" height="1.5" fill="#19f2ff" opacity="${0.35 + (i % 3) * 0.2}"/>`;
const GRILLE = svg(`<svg viewBox="0 0 110 34" xmlns="http://www.w3.org/2000/svg"><rect width="110" height="34" rx="3" fill="#0a0c10" stroke="#3a4558" stroke-width="2"/>${slits}<rect x="48" y="0" width="14" height="34" fill="#0a0c10"/><polygon points="55,6 62,17 55,28 48,17" fill="#ffd400"/></svg>`, { size: 384 });

const HOOD = svg(`<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
<polygon points="50,3 90,25 90,48 50,67 10,48 10,25" fill="#0b0d12" stroke="#ffd400" stroke-width="4"/>
<polygon points="50,12 80,28 80,44 50,58 20,44 20,28" fill="none" stroke="#19f2ff" stroke-width="1.5"/>
<path d="M28 46 L28 26 L40 38 L50 24 L60 38 L72 26 L72 46" fill="none" stroke="#ffd400" stroke-width="5" stroke-linejoin="round"/>
<path d="M36 52 L50 58 L64 52" fill="none" stroke="#ff2bd6" stroke-width="2.5"/></svg>`, { size: 384 });

let bars = "";
for (let i = 0; i < 22; i++) bars += `<rect x="${142 + i * 2.4}" y="46" width="${i % 3 ? 1 : 1.8}" height="16" fill="#9fb0c8"/>`;
const SIDE = svg(`<svg viewBox="0 0 200 75" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="198" height="73" rx="6" fill="#0b0d12" stroke="#19f2ff" stroke-width="2"/>
<polygon points="26,10 46,21 46,43 26,54 6,43 6,21" fill="#0b0d12" stroke="#ffd400" stroke-width="3"/>
<path d="M14 40 L14 27 L21 34 L26 26 L31 34 L38 27 L38 40" fill="none" stroke="#ffd400" stroke-width="3" stroke-linejoin="round"/>
<text x="56" y="34" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="22" fill="#ffffff">MERIDIAN</text>
<text x="57" y="48" font-family="Arial, sans-serif" font-weight="bold" font-size="9.5" fill="#19f2ff">CIVIL ORDER DIVISION</text>
<text x="57" y="62" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#ff2bd6">// PACIFICATION UNIT 07</text>
${bars}<rect x="6" y="64" width="40" height="5" fill="#ffd400"/></svg>`, { size: 768 });

const REAR = svg(`<svg viewBox="0 0 120 54" xmlns="http://www.w3.org/2000/svg">
<rect width="120" height="54" rx="4" fill="#0b0d12" stroke="#3a4558" stroke-width="2"/>
<rect x="6" y="6" width="108" height="20" fill="#ffd400"/>
<text x="60" y="22" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="15" fill="#0b0d12">RIOT CONTROL</text>
<path d="M8 32 l8 6 -8 6 M18 32 l8 6 -8 6 M28 32 l8 6 -8 6" stroke="#ff2bd6" stroke-width="2.5" fill="none"/>
<text x="112" y="38" text-anchor="end" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#19f2ff">KEEP 20M BACK</text>
<text x="112" y="50" text-anchor="end" font-family="Arial, sans-serif" font-weight="bold" font-size="8" fill="#ffffff">MCO-07 // LETHAL-LITE</text></svg>`, { size: 512 });

const WINDSHIELD = svg(`<svg viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16465a"/><stop offset="1" stop-color="#050c14"/></linearGradient></defs>
<rect width="160" height="60" fill="url(#g)"/>
<polygon points="20,0 38,0 14,60 -4,60" fill="#7ff" opacity="0.12"/><polygon points="50,0 56,0 32,60 26,60" fill="#7ff" opacity="0.10"/>
<g stroke="#19f2ff" stroke-width="0.8" fill="none" opacity="0.9"><circle cx="110" cy="30" r="10"/><path d="M110 15 v6 M110 39 v6 M95 30 h6 M119 30 h6"/></g>
<text x="8" y="12" font-family="monospace" font-size="6" fill="#19f2ff">HOSTILES: 14</text>
<text x="8" y="20" font-family="monospace" font-size="5" fill="#ff2bd6">CANNON 87% // LOCK</text>
<text x="8" y="54" font-family="monospace" font-size="5" fill="#ffd400">SPD 000 KPH</text>
<rect x="0" y="0" width="160" height="60" fill="none" stroke="#000" stroke-width="3"/></svg>`, { size: 512 });

let spokes = "";
for (let i = 0; i < 6; i++) spokes += `<rect x="47" y="8" width="6" height="34" fill="#2b303b" transform="rotate(${i * 60} 50 50)"/>`;
const HUB = svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="49" fill="#59616f"/><circle cx="50" cy="50" r="40" fill="#161920"/>${spokes}
<circle cx="50" cy="50" r="14" fill="#8c97aa"/><circle cx="50" cy="50" r="6" fill="#ffd400"/>
<circle cx="50" cy="50" r="44" fill="none" stroke="#ff2bd6" stroke-width="2"/></svg>`, { size: 256 });

const GAUGE = svg(`<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="60" rx="5" fill="#06090d" stroke="#19f2ff" stroke-width="2"/>
<text x="10" y="22" font-family="Arial Black, sans-serif" font-size="14" fill="#19f2ff">H2O 87%</text>
<rect x="10" y="30" width="80" height="10" fill="#0b2a33" stroke="#19f2ff" stroke-width="1"/><rect x="11" y="31" width="68" height="8" fill="#19f2ff"/>
<text x="10" y="54" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffd400">HIGH PRESSURE</text></svg>`, { size: 384 });

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });

  const P = (geo: THREE.BufferGeometry, color: any, at: any, o: any = {}) => b.part(geo, color, { at, ...o });
  const box = (sx: number, sy: number, sz: number, color: any, at: any, o: any = {}) => P(new THREE.BoxGeometry(sx, sy, sz), color, at, o);
  const gbox = (sx: number, sy: number, sz: number, color: string, at: any, str = 1.4, o: any = {}) => glow(box(sx, sy, sz, color, at, o), str);
  const decal = (w: number, h: number, tex: THREE.Texture, at: any, dir: any, up?: any) =>
    P(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, ...(up ? { up } : {}) });

  const ROOF = 2.22;
  const HW = 1.1; // hull half width

  // ===== hull =====
  b.extrude(
    [[-2.6, 0.45], [2.45, 0.45], [2.6, 0.6], [2.6, 1.1], [1.9, 1.45], [-2.6, 1.45]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: HW * 2, bevel: 0.05, color: ARMOR },
  );
  // cabin
  b.extrude(
    [[-2.4, 1.45], [-2.4, 2.1], [-2.2, ROOF], [0.5, ROOF], [1.5, 1.45]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.05, color: ARMOR },
  );

  // windshield on slope (0.5,2.22)->(1.5,1.45)
  decal(1.62, 0.78, WINDSHIELD, [0, 1.86, 1.02], [0, 0.792, 0.61]);
  box(1.74, 0.07, 0.07, DARK, [0, 2.21, 0.55], { rotation: [-52, 0, 0] });
  for (const s of [1, -1]) {
    // A pillars
    box(0.1, 0.1, 1.05, DARK2, [s * 0.88, 1.84, 1.02], { rotation: [-52, 0, 0] });
    // side windows with bars
    box(0.05, 0.36, 0.8, "#0b2230", [s * 0.965, 1.86, 0.35]);
    for (let k = 0; k < 4; k++) box(0.07, 0.38, 0.03, DARK, [s * 0.975, 1.86, 0.0 + k * 0.23]);
    gbox(0.03, 0.025, 0.82, CYAN, [s * 0.975, 1.66, 0.35]);
    // door seam + handle
    box(0.02, 0.7, 0.02, "#07080b", [s * 0.955, 1.82, -0.1]);
    box(0.04, 0.05, 0.22, STEEL, [s * 0.97, 1.7, -0.25]);
    // spotlights on pillars
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 8), DARK, [s * 1.03, 2.0, 0.62], { dir: [0, 0, 1], flat: true });
    glow(P(new THREE.CircleGeometry(0.085, 10), WHITE, [s * 1.03, 2.0, 0.745], { dir: [0, 0, 1], axis: "z" }), 1.6);
    box(0.1, 0.1, 0.1, DARK, [s * 1.0, 1.95, 0.5]);
    // mirrors with cameras
    b.rod([s * 0.95, 1.7, 1.0], [s * 1.28, 1.72, 1.12], 0.02, STEEL);
    box(0.1, 0.24, 0.14, DARK, [s * 1.3, 1.72, 1.12]);
    glow(P(new THREE.SphereGeometry(0.03, 6, 4), RED, [s * 1.3, 1.78, 1.2]), 2);
    // hull-side panels
    decal(2.0, 0.75, SIDE, [s * (HW + 0.006), 1.05, 0], [s, 0, 0]);
    // skirt + neon
    box(0.08, 0.3, 2.0, DARK2, [s * 1.14, 0.55, 0]);
    gbox(0.03, 0.05, 1.96, CYAN, [s * 1.185, 0.55, 0], 1.6);
    gbox(0.03, 0.04, 1.96, MAGENTA, [s * 1.185, 0.47, 0], 1.5);
    // ram horns + guard
    box(0.14, 0.62, 0.2, DARK2, [s * 0.98, 0.86, 2.7]);
    gbox(0.05, 0.14, 0.04, YELLOW, [s * 0.98, 1.0, 2.805], 1.5);
    // headlights and corner lights
    gbox(0.5, 0.12, 0.04, WHITE, [s * 0.78, 0.95, 2.61], 1.8);
    gbox(0.16, 0.12, 0.04, "#ffa31a", [s * 1.0, 0.95, 2.61], 1.4);
    // front siren inserts
    gbox(0.28, 0.06, 0.04, s > 0 ? RED : BLUE, [s * 0.42, 1.08, 2.58], 1.8);
    // rear lights
    gbox(0.5, 0.1, 0.04, RED, [s * 0.78, 1.25, -2.61], 1.6);
    gbox(0.1, 0.5, 0.03, RED, [s * 0.8, 1.8, -2.41], 1.5);
    // antenna
    b.rod([s * 0.8, ROOF, -2.0], [s * 0.85, 3.05, -2.1], [0.018, 0.008], DARK);
    glow(P(new THREE.SphereGeometry(0.035, 6, 4), MAGENTA, [s * 0.85, 3.07, -2.1]), 2);
    // loudspeaker horns
    box(0.12, 0.16, 0.2, DARK, [s * 0.6, 2.3, -0.25]);
    P(new THREE.CylinderGeometry(0.17, 0.07, 0.38, 8), DARK2, [s * 0.6, 2.43, -0.2], { dir: [0, 0, 1], flat: true });
    glow(P(new THREE.CircleGeometry(0.13, 8), CYAN, [s * 0.6, 2.43, -0.005], { dir: [0, 0, 1], axis: "z" }), 0.8);
    // fenders
    box(0.6, 0.1, 1.5, DARK2, [s * 1.22, 1.28, 1.65]);
    box(0.6, 0.1, 1.5, DARK2, [s * 1.22, 1.28, -1.65]);
    box(0.06, 0.2, 1.5, DARK2, [s * 1.47, 1.17, 1.65]);
    box(0.06, 0.2, 1.5, DARK2, [s * 1.47, 1.17, -1.65]);
    // mud flaps
    box(0.4, 0.3, 0.04, "#0b0c0f", [s * 1.22, 0.3, 2.28]);
    box(0.4, 0.3, 0.04, "#0b0c0f", [s * 1.22, 0.3, -2.28]);
    // roof edge strip and fender neon
    gbox(0.03, 0.03, 1.4, MAGENTA, [s * 1.505, 1.28, 1.65], 1.3);
    gbox(0.03, 0.03, 1.4, MAGENTA, [s * 1.505, 1.28, -1.65], 1.3);
    // cabin rear lower side vents
    for (let k = 0; k < 4; k++) box(0.03, 0.05, 0.4, "#07080b", [s * 0.955, 1.65 + k * 0.1, -1.7]);
  }

  // ===== wheels =====
  const wheel = (s: number, z: number) => {
    const x = s * 1.22;
    P(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 14), TYRE, [x, 0.6, z], { dir: [1, 0, 0], flat: true });
    P(new THREE.CylinderGeometry(0.37, 0.37, 0.44, 10), STEEL, [x, 0.6, z], { dir: [1, 0, 0], flat: true });
    P(new THREE.CircleGeometry(0.36, 14), "#ffffff", [x + s * 0.224, 0.6, z], { dir: [s, 0, 0], axis: "z", texture: HUB });
    glow(P(new THREE.TorusGeometry(0.4, 0.018, 4, 16), MAGENTA, [x + s * 0.2, 0.6, z], { rotation: [0, 90, 0] }), 1.6);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      box(0.41, 0.1, 0.12, "#08090b", [x, 0.6 + Math.sin(a) * 0.58, z + Math.cos(a) * 0.58], { rotation: [(-a * 180) / Math.PI, 0, 0] });
    }
  };
  for (const s of [1, -1]) {
    wheel(s, 1.65);
    wheel(s, -1.65);
  }

  // ===== front =====
  box(2.3, 0.34, 0.3, DARK2, [0, 0.62, 2.7]);
  decal(2.2, 0.15, HAZARD, [0, 0.535, 2.853], [0, 0, 1]);
  gbox(2.1, 0.05, 0.03, CYAN, [0, 0.69, 2.86], 1.8);
  decal(1.1, 0.32, GRILLE, [0, 0.95, 2.605], [0, 0, 1]);
  decal(0.7, 0.5, HOOD, [0, 1.286, 2.255], [0, 0.894, 0.447]);
  // bumper lower splitter
  box(2.0, 0.06, 0.4, "#0b0c0f", [0, 0.42, 2.7]);
  gbox(1.9, 0.03, 0.03, MAGENTA, [0, 0.46, 2.88], 1.6);
  // roof camera dome
  P(new THREE.SphereGeometry(0.13, 8, 6), DARK, [0, 2.26, -0.25], { flat: true });
  glow(P(new THREE.SphereGeometry(0.045, 6, 4), RED, [0, 2.3, -0.14]), 2.5);

  // ===== lightbar =====
  box(1.85, 0.08, 0.36, DARK, [0, 2.26, 0.22]);
  const lens = [[-0.7, BLUE], [-0.24, BLUE], [0.24, RED], [0.7, RED]] as [number, string][];
  for (const [x, c] of lens) {
    gbox(0.42, 0.15, 0.28, c, [x, 2.37, 0.22], 2);
  }
  gbox(0.2, 0.06, 0.1, WHITE, [0, 2.34, 0.22], 2);
  for (const s of [1, -1]) box(0.08, 0.17, 0.32, DARK, [s * 0.95, 2.34, 0.22]);
  gbox(1.8, 0.04, 0.03, CYAN, [0, 2.27, 0.41], 1.8);
  gbox(1.9, 0.03, 0.03, MAGENTA, [0, 2.23, 0.52], 1.5);

  // ===== turret =====
  P(new THREE.CylinderGeometry(0.46, 0.5, 0.14, 12), STEEL, [0, ROOF + 0.07, -0.75], { flat: true });
  glow(P(new THREE.TorusGeometry(0.47, 0.014, 4, 18), CYAN, [0, ROOF + 0.15, -0.75], { rotation: [90, 0, 0] }), 1.6);
  b.extrude([[-0.38, 0], [0.38, 0], [0.34, 0.5], [-0.34, 0.5]], { at: [0, ROOF + 0.14, -0.75], x: [0, 0, 1], thickness: 0.8, bevel: 0.04, color: ARMOR });
  box(0.8, 0.06, 0.78, DARK2, [0, ROOF + 0.66, -0.75]);
  const A = new THREE.Vector3(0, 2.82, -0.95);
  const B = new THREE.Vector3(0, 2.99, 1.5);
  const d = B.clone().sub(A).normalize();
  b.rod(A, lerp(A, B, 0.25), [0.24, 0.24], DARK2);
  b.rod(lerp(A, B, 0.2), B, [0.16, 0.14], STEEL, { sides: 8 });
  for (const t of [0.3, 0.46, 0.62, 0.78]) glow(b.rod(lerp(A, B, t), lerp(A, B, t + 0.02), 0.185, CYAN, { sides: 8 }), 1.8);
  const N0 = B.clone();
  const N1 = B.clone().addScaledVector(d, 0.5);
  b.rod(N0, N1, [0.15, 0.26], DARK2, { sides: 8 });
  b.rod(N1, N1.clone().addScaledVector(d, 0.06), 0.28, YELLOW, { sides: 8 });
  glow(P(new THREE.CircleGeometry(0.2, 10), CYAN, N1.clone().addScaledVector(d, 0.065), { dir: d, axis: "z" }), 2.2);
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), STEEL, [s * 0.46, 2.82, -0.65], { dir: [1, 0, 0], flat: true });
    // hoses from tank
    b.sweep(
      catmull([[s * 0.5, 2.55, -1.28], [s * 0.64, 2.85, -1.1], [s * 0.5, 2.75, -0.85], [s * 0.4, 2.7, -0.72]]),
      0.04, { color: DARK, sides: 6 },
    );
    glow(b.sweep(catmull([[s * 0.5, 2.55, -1.28], [s * 0.64, 2.85, -1.1]]), 0.015, { color: CYAN, sides: 4 }), 1.2);
  }
  // scope on the barrel
  box(0.1, 0.1, 0.4, DARK, [0.2, 3.04, 0.2], { rotation: [-4, 0, 0] });
  glow(P(new THREE.CircleGeometry(0.035, 6), RED, [0.2, 3.04, 0.41], { dir: [0, 0, 1], axis: "z" }), 2);

  // ===== water tank =====
  b.extrude(
    [[-0.48, -0.2], [-0.3, -0.4], [0.3, -0.4], [0.48, -0.2], [0.48, 0.2], [0.3, 0.4], [-0.3, 0.4], [-0.48, 0.2]],
    { at: [0, ROOF + 0.4, -1.72], x: [0, 0, 1], thickness: 1.3, bevel: 0.03, color: TANK },
  );
  for (const s of [1, -1]) {
    decal(0.7, 0.42, GAUGE, [s * 0.655, 2.64, -1.72], [s, 0, 0]);
    glow(P(new THREE.PlaneGeometry(0.7, 0.42), "#ffffff", [s * 0.657, 2.64, -1.72], { dir: [s, 0, 0], axis: "z", texture: GAUGE }), 1.1);
    box(0.04, 0.5, 0.06, STEEL, [s * 0.66, 2.4, -2.1]);
  }
  gbox(1.0, 0.03, 0.03, CYAN, [0, 3.04, -1.72], 1.6);
  P(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 6), STEEL, [0, 3.07, -1.5], { flat: true });

  // ===== rear =====
  decal(1.9, 0.86, REAR, [0, 0.95, -2.605], [0, 0, -1]);
  box(2.2, 0.2, 0.2, DARK2, [0, 0.55, -2.68]);
  gbox(2.0, 0.07, 0.04, RED, [0, 1.36, -2.61], 1.6);
  gbox(2.1, 0.03, 0.03, MAGENTA, [0, 0.43, -2.78], 1.5);
  box(0.03, 0.9, 0.03, "#07080b", [0, 0.95, -2.62]);

  // underglow plate
  gbox(1.7, 0.03, 3.4, MAGENTA, [0, 0.43, 0], 1.0);

  return b.root;
}
