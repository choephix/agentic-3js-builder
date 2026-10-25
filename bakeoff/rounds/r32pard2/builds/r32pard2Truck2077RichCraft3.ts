import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, svg, paint, mix, noise, smoothstep } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "AEGIS-X Warhauler 2077",
  description:
    "Six-wheeled armoured cyberpunk war truck: plated cab, neon underglow, roof turret, missile pods, dish and antennas.",
};

// ---------- palette ----------
const DARK = "#1b1e28";
const PLATE = "#2c3245";
const PLATE2 = "#3a4260";
const BLACK = "#0b0c12";
const TIRE = "#14141a";
const MAG = "#ff2bd6";
const CYAN = "#27f3ff";
const AMBER = "#ffb020";
const RED = "#e5322b";
const WHITE = "#eaf6ff";
const OLIVE = "#4a5440";

// ---------- textures ----------
let headS = `<svg viewBox="0 0 200 56" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="56" rx="6" fill="#0d0e16"/>`;
for (let i = 0; i < 6; i++) headS += `<rect x="78" y="${6 + i * 8}" width="44" height="4" fill="#2a2f45"/>`;
headS += `<path d="M6 8 L70 14 L70 36 L6 42Z" fill="#c9fbff" stroke="#27f3ff" stroke-width="2"/>
<path d="M194 8 L130 14 L130 36 L194 42Z" fill="#c9fbff" stroke="#27f3ff" stroke-width="2"/>
<rect x="84" y="22" width="32" height="5" fill="#ff2bd6"/><rect x="10" y="47" width="180" height="3" fill="#ff2bd6"/></svg>`;
const HEAD = svg(headS, { size: 256 });

const WIND = svg(
  `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1830"/><stop offset="1" stop-color="#0e5a6a"/></linearGradient></defs>
<rect width="100" height="56" fill="url(#g)"/><polygon points="10,0 30,0 14,56 -6,56" fill="#ffffff" opacity="0.14"/><polygon points="40,0 48,0 32,56 24,56" fill="#ffffff" opacity="0.1"/>
<path d="M60 40 h30 M60 44 h22 M62 12 h26" stroke="#27f3ff" stroke-width="1" opacity="0.8"/><text x="62" y="36" font-size="5" font-family="monospace" fill="#27f3ff">TGT 042 LOCK</text>
<rect x="0" y="0" width="100" height="56" fill="none" stroke="#06090f" stroke-width="3"/></svg>`,
  { size: 256 },
);

let sideS = `<svg viewBox="0 0 270 95" xmlns="http://www.w3.org/2000/svg"><rect width="270" height="95" rx="6" fill="#141620" stroke="#ff2bd6" stroke-width="3"/>
<rect x="8" y="8" width="60" height="79" fill="#ffb020"/>`;
for (let i = 0; i < 6; i++) sideS += `<polygon points="${8 + i * 12},87 ${20 + i * 12},87 ${8 + i * 12 + 24},8 ${8 + i * 12 + 12},8" fill="#111" opacity="0.85"/>`;
sideS += `<text x="78" y="46" font-size="34" font-weight="bold" font-family="Arial Black, sans-serif" fill="#27f3ff">AEGIS-X</text>
<text x="80" y="70" font-size="17" font-family="monospace" fill="#ff2bd6">UNIT 2077 // HAULER</text>
<circle cx="238" cy="38" r="22" fill="#0b0c12" stroke="#27f3ff" stroke-width="3"/><circle cx="230" cy="34" r="5" fill="#ff2bd6"/><circle cx="246" cy="34" r="5" fill="#ff2bd6"/><path d="M229 49 h18 M233 47 v6 M238 47 v6 M243 47 v6" stroke="#27f3ff" stroke-width="2"/>`;
for (let i = 0; i < 18; i++) sideS += `<rect x="${80 + i * 8}" y="78" width="${i % 3 ? 3 : 5}" height="8" fill="#27f3ff" opacity="0.7"/>`;
sideS += `</svg>`;
const SIDE = svg(sideS, { size: 512 });

let ringS = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#0b1220"/><circle cx="50" cy="50" r="42" fill="none" stroke="#27f3ff" stroke-width="6"/>`;
for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; ringS += `<path d="M50 50 L${50 + 38 * Math.cos(a)} ${50 + 38 * Math.sin(a)}" stroke="#1f6f86" stroke-width="5"/>`; }
ringS += `<circle cx="50" cy="50" r="13" fill="#ff2bd6"/><circle cx="50" cy="50" r="5" fill="#0b1220"/></svg>`;
const RING = svg(ringS, { size: 128 });

const SCREEN = svg(
  `<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="110" rx="5" fill="#04121a" stroke="#27f3ff" stroke-width="3"/>
<circle cx="55" cy="58" r="38" fill="none" stroke="#1aff9a" stroke-width="1.5"/><circle cx="55" cy="58" r="24" fill="none" stroke="#1aff9a" stroke-width="1.5"/><circle cx="55" cy="58" r="10" fill="none" stroke="#1aff9a" stroke-width="1.5"/>
<path d="M55 58 L88 40 A38 38 0 0 0 55 20Z" fill="#1aff9a" opacity="0.35"/><circle cx="70" cy="42" r="3" fill="#ff2bd6"/><circle cx="38" cy="75" r="3" fill="#ffb020"/>
<text x="106" y="30" font-size="9" font-family="monospace" fill="#27f3ff">REAR CAM</text><text x="106" y="46" font-size="8" font-family="monospace" fill="#ff2bd6">ARMED</text>
<rect x="106" y="58" width="44" height="6" fill="#27f3ff"/><rect x="106" y="70" width="30" height="6" fill="#27f3ff" opacity="0.6"/><rect x="106" y="82" width="38" height="6" fill="#27f3ff" opacity="0.4"/></svg>`,
  { size: 256 },
);

let hazS = `<svg viewBox="0 0 320 18" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="18" fill="#ffb020"/>`;
for (let i = -1; i < 30; i++) hazS += `<polygon points="${i * 14},18 ${i * 14 + 7},18 ${i * 14 + 16},0 ${i * 14 + 9},0" fill="#111"/>`;
hazS += `</svg>`;
const HAZ = svg(hazS, { size: 512 });

const BADGE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0e1018" stroke="#ff2bd6" stroke-width="3"/><polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill="none" stroke="#27f3ff" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="bold" font-family="Arial Black, sans-serif" fill="#ffb020">77</text></svg>`,
  { size: 128 },
);

// ---------- paints ----------
const ARMOR = panelled(metal("iron", { tarnish: 0.5, size: 0.4 }), { size: 0.55, aspect: 0.8, rivets: 0.08 });
const cabBase = paint((p, n) => {
  let c = mix("#262c3c", "#3c4766", noise(p, 0.9, 3));
  c = mix(c, "#101218", smoothstep(1.2, 0.65, p.y) * 0.8);
  c = mix(c, "#8396c0", smoothstep(0.5, 1, n.y) * 0.3);
  if (Math.abs(p.x) > 1.0 && n.y < 0.3 && p.y > 1.0 && p.y < 1.08) c = mix(c, "#ff2bd6", 0.8);
  return c;
});
const CABP = panelled(cabBase, { size: 0.6, aspect: 0.9, rivets: 0.1 });
const STEEL = metal("steel", { tarnish: 0.3 });
const BLUED = metal("blued");
const BRASS = metal("brass", { tarnish: 0.6 });

export default function build() {
  const b = createBuilder({ name: "warhauler2077", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 1, 0] });

  // ---------- helpers ----------
  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: chassis, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], dir: number[] = [0, 1, 0], o: any = {}) =>
    P(new THREE.CylinderGeometry(r, r, h, seg), color, at, { dir, ...o });
  const G = (geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    const g = geo.clone();
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    if (rz) g.rotateZ(rz);
    g.translate(x, y, z);
    return g;
  };
  const M = (list: THREE.BufferGeometry[], color: any, bone: any = chassis, o: any = {}) =>
    b.part(mergeGeometries(list)!, color, { bone, at: [0, 0, 0], flat: true, ...o });
  const decal = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone: chassis, at, dir, axis: "z", texture: tex });
  const BX = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---------- frame & underbody ----------
  box(2.2, 0.35, 6.8, DARK, [0, 0.8, -0.05]);
  box(1.6, 0.12, 6.4, BLACK, [0, 0.58, -0.05]);
  for (const z of [-3, -1.9, -0.8, 0.5, 1.6, 2.9]) box(2.5, 0.14, 0.14, PLATE, [0, 0.66, z]);
  cyl(0.06, 5.4, 8, STEEL, [0, 0.62, -0.1], [0, 0, 1]);
  // axles + diffs + springs
  const WR = 0.64;
  const axles = [2.3, -1.4, -2.6];
  for (const z of axles) {
    cyl(0.08, 3.0, 8, STEEL, [0, WR, z], [1, 0, 0]);
    P(new THREE.SphereGeometry(0.24, 8, 6), BLUED, [0, WR, z], { scale: [1, 1, 0.9] });
    for (const s of [1, -1]) box(0.14, 0.1, 1.0, PLATE2, [s * 0.9, 0.9, z]);
  }
  // fuel / battery tanks
  for (const s of [1, -1]) {
    cyl(0.28, 1.1, 10, ARMOR, [s * 1.22, 0.66, 0.0], [0, 0, 1]);
    for (const dz of [-0.35, 0.35]) cyl(0.3, 0.06, 10, BRASS, [s * 1.22, 0.66, dz], [0, 0, 1]);
  }

  // ---------- wheels ----------
  const wheelJoints: any[] = [];
  for (const s of [1, -1]) {
    axles.forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const wj = b.joint(`wheel${side}${i + 1}`, { parent: chassis, at: [s * 1.45, WR, z], dir: [s, 0, 0] });
      wheelJoints.push(wj);
      const cx = s * 1.45;
      const o = { bone: wj };
      cyl(WR, 0.56, 12, TIRE, [cx, WR, z], [1, 0, 0], o);
      const tread: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 + 0.26;
        tread.push(G(BX(0.58, 0.07, 0.22), cx, WR + Math.sin(a) * WR, z + Math.cos(a) * WR, -a));
      }
      M(tread, "#23232c", wj);
      cyl(0.46, 0.6, 12, STEEL, [cx, WR, z], [1, 0, 0], o);
      cyl(0.37, 0.08, 12, DARK, [cx + s * 0.29, WR, z], [1, 0, 0], o);
      const bolts: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        bolts.push(G(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 5), cx + s * 0.34, WR + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3, 0, 0, Math.PI / 2));
      }
      M(bolts, BRASS, wj);
      glow(
        b.part(new THREE.CircleGeometry(0.27, 12), "#ffffff", {
          bone: wj, at: [cx + s * 0.335, WR, z], dir: [s, 0, 0], axis: "z", texture: RING,
        }),
        1,
      );
    });
  }

  // ---------- cab ----------
  const cabOutline: any = [
    [0.5, 0.7], [3.35, 0.7], [3.45, 1.3], [3.2, 1.55], [2.7, 1.75], [1.9, 2.45], [0.5, 2.45],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: CABP, bone: chassis, name: "cab" });
  // armour appliqué on the cab
  for (const s of [1, -1]) {
    box(0.08, 0.5, 1.3, PLATE2, [s * 1.12, 1.0, 1.4], { rotation: [0, 0, 0] });
    box(0.08, 0.5, 0.9, PLATE2, [s * 1.12, 1.0, 2.8]);
    box(0.1, 0.1, 2.9, MAG, [s * 1.13, 0.76, 1.95]);
    glow(box(0.04, 0.05, 2.7, MAG, [s * 1.17, 0.76, 1.95]), 1.2);
  }
  // windshield + side windows
  const N = new THREE.Vector3(0, 0.8, 0.7).normalize();
  b.part(new THREE.PlaneGeometry(2.0, 1.06), "#ffffff", {
    bone: chassis, at: [0, 2.1 + N.y * 0.014, 2.3 + N.z * 0.014], dir: [N.x, N.y, N.z], axis: "z", texture: WIND,
  });
  box(2.1, 0.07, 0.4, BLACK, [0, 2.5, 1.95], { rotation: [-10, 0, 0] });
  for (const s of [1, -1]) {
    decal(0.95, 0.45, WIND, [s * 1.112, 1.8, 1.7], [s, 0, 0]);
    box(0.03, 0.55, 0.05, BLACK, [s * 1.11, 1.8, 1.2]);
    box(0.03, 0.55, 0.05, BLACK, [s * 1.11, 1.8, 2.2]);
    box(0.03, 0.04, 1.1, BLACK, [s * 1.11, 2.05, 1.7]);
    // door seams and handles
    box(0.03, 1.2, 0.03, BLACK, [s * 1.105, 1.35, 1.1]);
    box(0.03, 1.2, 0.03, BLACK, [s * 1.105, 1.35, 2.5]);
    box(0.06, 0.05, 0.28, STEEL, [s * 1.13, 1.45, 1.35]);
    decal(0.36, 0.36, BADGE, [s * 1.114, 1.2, 2.0], [s, 0, 0]);
    // mirrors
    b.rod([s * 1.1, 1.95, 2.45], [s * 1.38, 2.0, 2.55], 0.02, BLACK, { bone: chassis });
    box(0.1, 0.38, 0.24, DARK, [s * 1.43, 2.0, 2.55]);
    glow(box(0.03, 0.3, 0.18, CYAN, [s * 1.485, 2.0, 2.55]), 1);
    // step
    box(0.3, 0.05, 0.6, STEEL, [s * 1.25, 0.72, 1.0]);
  }
  // front fascia
  glow(decal(2.0, 0.58, HEAD, [0, 1.0, 3.41], [0, 0, 1]), 1.3);
  box(2.7, 0.4, 0.5, DARK, [0, 0.6, 3.55]);
  const spikes: THREE.BufferGeometry[] = [];
  for (let k = -4; k <= 4; k++)
    spikes.push(G(new THREE.ConeGeometry(0.07, 0.3, 5), k * 0.3, 0.6, 3.95, Math.PI / 2));
  M(spikes, STEEL);
  for (const s of [1, -1]) {
    glow(box(0.25, 0.1, 0.05, CYAN, [s * 1.0, 0.62, 3.81]), 1.4);
    glow(box(0.2, 0.06, 0.05, AMBER, [s * 1.2, 0.8, 3.7]), 1.2);
  }
  box(0.4, 0.18, 0.3, BRASS, [0, 0.55, 3.8]); // winch
  // hood vents
  const slats: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (let k = 0; k < 4; k++) slats.push(G(BX(0.5, 0.03, 0.07), s * 0.6, 1.66 + k * 0.012, 2.95 - k * 0.12, 0.38));
  M(slats, BLACK);
  // roof gear
  const bars: THREE.BufferGeometry[] = [];
  const bars2: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 10; k++) (k % 2 ? bars2 : bars).push(G(BX(0.16, 0.1, 0.12), -0.8 + k * 0.178, 2.55, 1.75));
  box(1.8, 0.05, 0.2, BLACK, [0, 2.49, 1.75]);
  glow(M(bars, AMBER), 1.6);
  glow(M(bars2, WHITE), 1.6);
  glow(P(new THREE.SphereGeometry(0.12, 8, 6), RED, [0, 2.55, 0.9]), 1.5);
  box(0.5, 0.06, 0.5, PLATE2, [0.5, 2.48, 1.0]);
  for (const s of [1, -1]) {
    cyl(0.09, 2.0, 8, STEEL, [s * 1.0, 2.0, 0.47]);
    for (const y of [1.4, 2.0, 2.5]) cyl(0.115, 0.1, 8, BRASS, [s * 1.0, y, 0.47]);
    glow(cyl(0.07, 0.04, 8, AMBER, [s * 1.0, 3.0, 0.47]), 1.8);
  }

  // ---------- fenders / mudguards ----------
  for (const s of [1, -1]) {
    box(0.7, 0.09, 1.7, PLATE2, [s * 1.5, 1.38, 2.3]);
    box(0.7, 0.09, 0.4, PLATE2, [s * 1.5, 1.28, 3.25], { rotation: [-30, 0, 0] });
    box(0.55, 0.09, 2.6, PLATE2, [s * 1.62, 1.35, -2.0]);
    box(0.08, 0.3, 2.6, DARK, [s * 1.88, 1.25, -2.0]);
    box(0.5, 0.4, 0.06, BLACK, [s * 1.6, 0.6, -3.25]);
    glow(box(0.04, 0.06, 2.9, CYAN, [s * 1.12, 0.6, -0.05]), 1.4);
  }

  // ---------- armoured container ----------
  const boxOutline: any = [
    [-3.3, 1.3], [0.4, 1.3], [0.4, 2.6], [0.1, 2.9], [-3.0, 2.9], [-3.3, 2.6],
  ];
  b.extrude(boxOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.7, bevel: 0.06, color: ARMOR, bone: chassis, name: "container" });
  const dark: THREE.BufferGeometry[] = [];
  const accent: THREE.BufferGeometry[] = [];
  const r = rng(11);
  for (const s of [1, -1]) {
    decal(2.7, 0.95, SIDE, [s * 1.364, 2.05, -1.35], [s, 0, 0]);
    glow(decal(3.3, 0.18, HAZ, [s * 1.364, 1.42, -1.5], [s, 0, 0]), 0.5);
    for (let k = 0; k < 12; k++) dark.push(G(BX(0.05, 0.12, 0.16), s * 1.375, 2.72, -3.0 + k * 0.26));
    for (let k = 0; k < 9; k++) {
      const z = -3.15 + r() * 3.2;
      accent.push(G(BX(0.04, 0.05, 0.1 + r() * 0.1), s * 1.372, 1.55 + r() * 0.05 - 0.03, z));
    }
    for (const z of [-3.2, -2.4, -0.4, 0.3]) dark.push(G(BX(0.1, 1.3, 0.1), s * 1.38, 2.0, z));
    for (let k = 0; k < 8; k++) {
      const z = -3.2 + r() * 0.35;
      dark.push(G(BX(0.1, 0.1 + r() * 0.2, 0.1 + r() * 0.15), s * 1.38, 1.55 + r() * 0.9, z));
    }
    glow(box(0.05, 1.3, 0.05, MAG, [s * 1.36, 2.0, -3.3]), 1.3);
    glow(box(0.05, 0.05, 3.7, MAG, [s * 1.37, 1.3, -1.45]), 1.2);
    // ammo lockers
    box(0.14, 0.4, 0.9, PLATE2, [s * 1.42, 1.62, -0.2]);
  }
  M(dark, DARK);
  glow(M(accent, AMBER), 1);
  // rear face
  decal(1.7, 1.15, SCREEN, [0, 2.05, -3.33], [0, 0, -1]);
  box(1.9, 0.08, 0.06, BLACK, [0, 1.4, -3.33]);
  for (const s of [1, -1]) glow(box(0.5, 0.14, 0.08, RED, [s * 1.0, 2.45, -3.36]), 1.6);
  box(2.4, 0.3, 0.3, DARK, [0, 0.8, -3.55]);
  glow(decal(2.4, 0.22, HAZ, [0, 0.8, -3.71], [0, 0, -1]), 0.5);
  box(0.2, 0.2, 0.3, STEEL, [0, 0.7, -3.8]); // hitch
  // roof deck detail
  const vents: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) vents.push(G(BX(0.8, 0.06, 0.07), 0, 2.93, -2.95 + k * 0.1));
  M(vents, BLACK);
  cyl(0.3, 0.12, 8, PLATE2, [0, 2.96, -2.2]);
  cyl(0.18, 0.15, 8, BLACK, [0, 2.99, -2.2]);
  glow(cyl(0.05, 0.17, 6, CYAN, [0, 3.0, -2.2]), 1.4);

  // ---------- turret ----------
  const T0 = -1.1;
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.9, T0], role: "hinge" });
  cyl(0.62, 0.14, 12, STEEL, [0, 2.97, T0], [0, 1, 0], { bone: turret });
  const tOut: any = [
    [T0 - 0.6, 3.04], [T0 + 0.75, 3.04], [T0 + 0.95, 3.3], [T0 + 0.6, 3.58], [T0 - 0.5, 3.58], [T0 - 0.7, 3.3],
  ];
  b.extrude(tOut, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.1, bevel: 0.05, color: panelled(cabBase, { size: 0.4, rivets: 0.07 }), bone: turret, name: "turretBody" });
  box(0.7, 0.14, 0.7, PLATE2, [0, 3.62, T0 - 0.1], { bone: turret });
  glow(P(new THREE.SphereGeometry(0.1, 8, 6), RED, [0.3, 3.66, T0 + 0.3], { bone: turret }), 1.8);
  cyl(0.12, 0.25, 8, BLACK, [-0.3, 3.7, T0 - 0.2], [0, 1, 0], { bone: turret });
  glow(cyl(0.08, 0.04, 8, CYAN, [-0.3, 3.84, T0 - 0.2], [0, 1, 0], { bone: turret }), 1.4);
  for (const s of [1, -1]) box(0.1, 0.34, 0.5, PLATE2, [s * 0.6, 3.38, T0 + 0.1], { bone: turret });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.33, T0 + 0.7], aim: [0, 3.33, T0 + 2.5], role: "hinge" });
  const go = { bone: gun };
  box(0.7, 0.4, 0.3, DARK, [0, 3.33, T0 + 0.95], go);
  for (const s of [1, -1]) {
    cyl(0.06, 1.8, 8, STEEL, [s * 0.2, 3.33, T0 + 1.8], [0, 0, 1], go);
    cyl(0.1, 0.8, 8, BLUED, [s * 0.2, 3.33, T0 + 1.35], [0, 0, 1], go);
    box(0.14, 0.16, 0.22, BLACK, [s * 0.2, 3.33, T0 + 2.7], go);
    glow(cyl(0.035, 0.02, 6, CYAN, [s * 0.2, 3.33, T0 + 2.82], [0, 0, 1], go), 1.5);
  }

  // ---------- missile pods ----------
  for (const s of [1, -1]) {
    const tubes: THREE.BufferGeometry[] = [];
    const heads: THREE.BufferGeometry[] = [];
    const hous = [G(BX(0.95, 0.66, 1.2), 0, 0, 0)];
    for (let ix = -1; ix <= 1; ix++)
      for (let iy = -1; iy <= 1; iy += 2) {
        tubes.push(G(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 8), ix * 0.29, iy * 0.16, 0.6, Math.PI / 2));
        heads.push(G(new THREE.ConeGeometry(0.08, 0.16, 6), ix * 0.29, iy * 0.16, 0.56, Math.PI / 2));
      }
    const pos = [s * 0.82, 3.2, -2.5];
    const rot = (g: THREE.BufferGeometry) => g.rotateX(-0.5);
    b.part(rot(mergeGeometries(hous)!), PLATE2, { bone: chassis, at: pos, flat: true });
    b.part(rot(mergeGeometries(tubes)!), BLACK, { bone: chassis, at: pos, flat: true });
    glow(b.part(rot(mergeGeometries(heads)!), RED, { bone: chassis, at: pos, flat: true }), 1.2);
    box(0.7, 0.3, 0.8, DARK, [s * 0.82, 3.0, -2.55]);
  }

  // ---------- dish & antennas ----------
  const dA = new THREE.Vector3(-0.3, 0.85, -0.45).normalize();
  const dishAt = new THREE.Vector3(-0.95, 3.1, -0.45);
  cyl(0.07, 0.3, 6, STEEL, [-0.95, 3.0, -0.45]);
  b.lathe(
    [[0, 0], [0.1, 0.02], [0.38, 0.12], [0.38, 0.14], [0.1, 0.05], [0, 0.03]],
    { at: dishAt, axis: [dA.x, dA.y, dA.z], segments: 10, color: STEEL, bone: chassis, name: "dish" },
  );
  const feed = dishAt.clone().addScaledVector(dA, 0.4);
  b.rod(dishAt, feed, 0.015, STEEL, { bone: chassis });
  glow(P(new THREE.SphereGeometry(0.04, 6, 4), AMBER, [feed.x, feed.y, feed.z]), 1.5);
  const whips: [number, number, number][] = [[0.95, 2.95, -3.0], [-0.95, 2.95, -3.1], [0.5, 2.95, -0.3]];
  whips.forEach(([x, y, z], i) => {
    const top: [number, number, number] = [x + 0.08, y + 1.0 - i * 0.15, z - 0.12];
    cyl(0.05, 0.1, 6, DARK, [x, y + 0.04, z]);
    b.rod([x, y, z], top, 0.014, BLACK, { bone: chassis });
    glow(P(new THREE.SphereGeometry(0.035, 6, 4), i % 2 ? MAG : RED, top), 1.8);
  });
  // cab whip
  b.rod([-0.9, 2.45, 0.8], [-0.95, 3.4, 0.7], 0.014, BLACK, { bone: chassis });
  glow(P(new THREE.SphereGeometry(0.035, 6, 4), CYAN, [-0.95, 3.4, 0.7]), 1.8);
  // cables
  b.rod([0.95, 2.95, -3.0], [0.6, 2.95, -2.2], 0.02, BLACK, { bone: chassis });

  // ---------- neon underglow on bumper ----------
  glow(box(2.5, 0.04, 0.04, MAG, [0, 0.42, 3.8]), 1.4);
  glow(box(2.2, 0.04, 0.04, CYAN, [0, 0.64, -3.71]), 1.2);

  // keep a light footprint on rider joints
  wheelJoints.length;
  return b.root;
}
