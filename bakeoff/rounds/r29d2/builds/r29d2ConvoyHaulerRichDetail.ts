import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured six-wheel hauler with roof turret, guarding a sealed cargo pod.",
};

// ---------- palette ----------
const GUN = "#2f3441";
const GUN_D = "#1b1e27";
const STEEL = "#8a93a6";
const PODC = "#cfd6e2";
const MAG = "#ff2fa0";
const CYAN = "#22e6ff";
const AMBER = "#ffb020";
const RED = "#ff2a3a";
const BLACK = "#0d0f14";
const RUBBER = "#15171d";

// ---------- paints ----------
const plate = (base: string, size: number, mud = true) =>
  paint((p, n) => {
    const useX = Math.abs(n.x) > 0.6;
    const u = useX ? p.z : p.x;
    const fu = ((u / size) % 1 + 1) % 1;
    const fv = ((p.y / (size * 0.7)) % 1 + 1) % 1;
    let c = mix(base, "#ffffff", 0.12 * smoothstep(0.2, 1, n.y));
    c = mix(c, "#2a3ea0", 0.18 * smoothstep(0.2, -0.9, n.y));
    const nz = noise(p, 0.25, 3);
    c = mix(c, "#000000", 0.18 * smoothstep(0.55, 0.8, nz));
    if (mud) c = mix(c, "#4a3b33", 0.55 * smoothstep(0.9, 0.3, p.y) * smoothstep(0.3, 0.7, noise(p, 0.15, 8)));
    if (fu < 0.012 || fu > 0.988 || fv < 0.014) return mix(c, "#05060a", 0.8);
    if (fu < 0.03 || fv < 0.035) return mix(c, "#ffffff", 0.18);
    return c;
  });
const HULL = plate(GUN, 0.6);
const ARMOR = plate("#3a4152", 0.45);
const POD = plate(PODC, 0.8, false);

// ---------- textures ----------
const WIND = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#06222c"/>
  <path d="M0 40 L128 20 L128 64 L0 64Z" fill="#0b4a5c"/>
  <g stroke="#22e6ff" stroke-width="2" fill="none"><path d="M10 54 L40 30 L64 44 L96 16 L120 30"/><rect x="6" y="6" width="30" height="14"/><circle cx="100" cy="46" r="9"/></g>
  <path d="M0 0 L40 0 L0 30Z" fill="#ffffff" opacity="0.15"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#071d26"/><path d="M0 40 L36 0 L50 0 L14 40Z" fill="#1b6f86" opacity="0.6"/>
  <rect x="2" y="2" width="60" height="36" fill="none" stroke="#22e6ff" stroke-width="2"/></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0d0f14"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="6" y="${3 + i * 4.6}" width="52" height="2.6" fill="${i % 2 ? "#ff2fa0" : "#22e6ff"}"/>`).join("")}</svg>`,
  { size: 128 },
);
const DOORNUM = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="none"/>
  <text x="32" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#05060a" stroke="#05060a" stroke-width="4">C-07</text>
  <text x="32" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#ffb020">C-07</text></svg>`,
  { size: 192 },
);
const PODLABEL = svg(
  `<svg viewBox="0 0 160 100"><rect width="160" height="100" rx="6" fill="#10131a" stroke="#ff2fa0" stroke-width="4"/>
  <path d="M0 0 L30 0 L0 30Z M160 100 L130 100 L160 70Z" fill="#ffb020"/>
  <path d="M30 70 L50 30 L70 70Z" fill="#ffb020" stroke="#05060a" stroke-width="3"/><rect x="48.5" y="42" width="3" height="14" fill="#05060a"/><circle cx="50" cy="63" r="2" fill="#05060a"/>
  <text x="112" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#22e6ff">SEALED</text>
  <text x="112" y="68" text-anchor="middle" font-family="monospace" font-size="13" fill="#ff2fa0">BIO-CARGO 99</text>
  <rect x="12" y="84" width="136" height="6" fill="#22e6ff" opacity="0.6"/></svg>`,
  { size: 384 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffb020"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 8} 0 L${i * 10} 16Z" fill="#0d0f14"/>`)
    .join("")}</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const R = rng(11);

  const bx = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at: at as any, dir: dir as any });
  const lit = <T,>(p: T, s = 1) => glow(p as any, s) as T;

  // ================= CHASSIS =================
  bx(2.2, 0.45, 8.4, HULL, 0, 0.93, -0.25);
  bx(1.6, 0.25, 8.0, GUN_D, 0, 0.62, -0.25); // underbody
  for (const s of [1, -1]) {
    bx(0.12, 0.3, 8.2, ARMOR, s * 1.15, 0.95, -0.25); // side rails
    lit(bx(0.07, 0.07, 5.2, MAG, s * 1.0, 0.64, -0.3), 1.4); // underglow
    // fuel/battery tank
    cyl(0.3, 0.3, 1.3, 8, plate("#4b5366", 0.4), [s * 1.3, 0.92, 0.35], [0, 0, 1]);
    for (const dz of [-0.4, 0.4]) bx(0.08, 0.55, 0.1, GUN_D, s * 1.3, 0.92, 0.35 + dz); // straps
    lit(bx(0.04, 0.12, 0.3, CYAN, s * 1.6, 0.95, 0.35), 1.2); // gauge
    // fenders
    for (const z of [2.9, -1.6, -3.2]) {
      bx(0.78, 0.12, 1.7, ARMOR, s * 1.45, 1.36, z);
      bx(0.78, 0.3, 0.12, ARMOR, s * 1.45, 1.25, z + 0.85, { rotation: [-25, 0, 0] });
      bx(0.78, 0.3, 0.12, ARMOR, s * 1.45, 1.25, z - 0.85, { rotation: [25, 0, 0] });
      bx(0.05, 0.36, 0.5, RUBBER, s * 1.74, 0.5, z - 0.84); // mudflap
      lit(bx(0.06, 0.06, 0.06, AMBER, s * 1.5, 1.44, z + 0.78), 1.5);
    }
  }
  // cross-members and hitch
  for (const z of [-2.4, 0.2]) bx(2.0, 0.2, 0.25, GUN_D, 0, 0.62, z);
  cyl(0.18, 0.18, 0.3, 8, STEEL, [0, 0.9, -4.55], [0, 0, 1]);
  bx(2.2, 0.5, 0.2, ARMOR, 0, 1.0, -4.5);
  for (const s of [1, -1]) {
    lit(bx(0.4, 0.14, 0.05, RED, s * 0.8, 1.1, -4.62), 1.6);
    lit(bx(0.4, 0.04, 0.05, MAG, s * 0.8, 0.9, -4.62), 1.2);
  }
  b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { at: [0, 0.8, -4.62], dir: [0, 0, -1], axis: "z", texture: HAZARD });

  // ================= WHEELS =================
  const WR = 0.6;
  const wheel = (x: number, z: number, s: number) => {
    const at = [x, WR + 0.05, z];
    const dir = [s, 0, 0];
    b.part(new THREE.CylinderGeometry(WR, WR, 0.5, 12), RUBBER, { at: at as any, dir: dir as any });
    const treads: THREE.BufferGeometry[] = [];
    const lugs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) treads.push(new THREE.BoxGeometry(0.1, 0.54, 0.2).translate(WR + 0.02, 0, 0).rotateY((i / 14) * Math.PI * 2));
    for (let i = 0; i < 6; i++) lugs.push(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6).translate(0.2, 0.27, 0).rotateY((i / 6) * Math.PI * 2));
    b.part(mergeGeometries(treads)!, "#0a0b0f", { at: at as any, dir: dir as any });
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.54, 10), plate("#59627a", 0.3, false), { at: at as any, dir: dir as any });
    b.part(mergeGeometries(lugs)!, STEEL, { at: at as any, dir: dir as any });
    lit(b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.58, 8), CYAN, { at: at as any, dir: dir as any }), 1.3);
    cyl(0.5, 0.5, 0.04, 12, GUN_D, [x + s * 0.27, WR + 0.05, z], dir); // rim disc
  };
  for (const s of [1, -1]) for (const z of [2.9, -1.6, -3.2]) wheel(s * 1.45, z, s);
  for (const z of [2.9, -1.6]) cyl(0.12, 0.12, 2.9, 8, STEEL, [0, 0.65, z], [1, 0, 0]); // axles

  // ================= CAB =================
  const cabOutline: [number, number, string?][] = [
    [0, 0], [2.5, 0], [2.5, 0.85], [1.8, 1.0], [1.2, 1.95], [0, 1.95],
  ];
  b.extrude(cabOutline as any, { at: [0, 1.15, 1.2], x: [0, 0, 1], thickness: 2.3, bevel: 0.05, color: HULL });
  // roof armour and light bar
  bx(2.3, 0.1, 1.3, ARMOR, 0, 3.12, 1.85);
  bx(1.9, 0.1, 0.18, GUN_D, 0, 3.2, 2.45);
  const barCols = [MAG, CYAN, MAG, CYAN, MAG, CYAN];
  barCols.forEach((c, i) => lit(bx(0.28, 0.1, 0.12, c, -0.75 + i * 0.3, 3.28, 2.45), 1.6));
  // windshield & windows
  const wn = new THREE.Vector3(0, 0.534, 0.845);
  const wc = new THREE.Vector3(0, 2.63, 2.7).addScaledVector(wn, 0.03);
  b.part(new THREE.PlaneGeometry(2.0, 1.1), "#ffffff", { at: wc.toArray() as any, dir: wn.toArray() as any, axis: "z", up: [0, 1, 0], texture: WIND });
  bx(2.15, 0.08, 0.1, GUN_D, 0, 3.07, 2.43); // visor
  bx(2.15, 0.08, 0.1, GUN_D, 0, 2.17, 3.0);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.0, 0.62), "#ffffff", { at: [s * 1.17, 2.6, 2.05], dir: [s, 0, 0], axis: "z", texture: SIDEWIN });
    bx(0.04, 0.05, 1.1, GUN_D, s * 1.17, 2.95, 2.05);
    bx(0.04, 0.05, 1.1, GUN_D, s * 1.17, 2.27, 2.05);
    // door: seams, handle, number
    bx(0.03, 1.35, 0.04, BLACK, s * 1.16, 1.85, 1.45);
    bx(0.03, 1.35, 0.04, BLACK, s * 1.16, 1.85, 2.65);
    bx(0.03, 0.04, 1.2, BLACK, s * 1.16, 1.25, 2.05);
    bx(0.08, 0.06, 0.28, STEEL, s * 1.18, 2.1, 1.65);
    b.part(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", { at: [s * 1.17, 1.6, 2.05], dir: [s, 0, 0], axis: "z", texture: DOORNUM });
    // side armour slats on cab flank
    bx(0.1, 0.5, 1.0, ARMOR, s * 1.2, 1.5, 3.1, { rotation: [0, 0, 0] });
    for (let k = 0; k < 4; k++) bx(0.03, 0.03, 0.03, STEEL, s * 1.26, 1.3 + (k % 2) * 0.35, 2.75 + Math.floor(k / 2) * 0.7);
    // step
    bx(0.4, 0.06, 0.9, STEEL, s * 1.35, 1.1, 1.9);
    // mirror
    b.rod([s * 1.2, 2.7, 3.15], [s * 1.62, 2.82, 3.3], 0.02, STEEL);
    bx(0.08, 0.34, 0.22, GUN_D, s * 1.68, 2.82, 3.3);
    lit(bx(0.02, 0.28, 0.16, CYAN, s * 1.72, 2.82, 3.3), 1.2);
    // headlights
    lit(bx(0.5, 0.2, 0.1, "#fff6c8", s * 0.82, 1.7, 3.72), 2);
    lit(bx(0.14, 0.18, 0.1, AMBER, s * 1.1, 1.7, 3.7), 1.5);
    // exhaust stacks
    cyl(0.1, 0.1, 2.6, 8, plate("#59627a", 0.3, false), [s * 1.24, 2.6, 1.05], [0, 1, 0]);
    cyl(0.14, 0.14, 0.1, 8, GUN_D, [s * 1.24, 3.92, 1.05], [0, 1, 0]);
    lit(cyl(0.07, 0.07, 0.04, 8, AMBER, [s * 1.24, 3.96, 1.05], [0, 1, 0]), 1.6);
    for (const y of [1.9, 2.5, 3.1, 3.6]) cyl(0.13, 0.13, 0.06, 8, GUN_D, [s * 1.24, y, 1.05], [0, 1, 0]);
    // fog / aerial
    b.rod([s * 1.0, 3.12, 1.4], [s * 1.0, 4.4, 1.3], 0.012, STEEL);
    lit(b.part(new THREE.SphereGeometry(0.04, 6, 4), s > 0 ? MAG : CYAN, { at: [s * 1.0, 4.42, 1.3] }), 2);
  }
  // hood vents, grille, bumper
  b.part(new THREE.PlaneGeometry(1.7, 0.85), "#ffffff", { at: [0, 1.65, 3.715], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  lit(b.part(new THREE.PlaneGeometry(1.7, 0.85), "#ffffff", { at: [0, 1.65, 3.725], dir: [0, 0, 1], axis: "z", texture: GRILLE }), 1);
  bx(1.8, 0.06, 0.1, GUN_D, 0, 2.1, 3.73);
  bx(1.8, 0.06, 0.1, GUN_D, 0, 1.2, 3.73);
  bx(2.5, 0.5, 0.45, plate("#3a4152", 0.5), 0, 1.0, 3.8, { rotation: [0, 0, 0] });
  bx(2.1, 0.12, 0.5, ARMOR, 0, 1.3, 3.55, { rotation: [-10, 0, 0] });
  for (let i = 0; i < 4; i++) lit(bx(0.4, 0.06, 0.04, i % 2 ? MAG : CYAN, -0.75 + i * 0.5, 1.05, 4.04), 1.4);
  // bull bar
  for (const x of [-0.9, 0.9]) b.rod([x, 0.8, 4.0], [x, 1.9, 3.95], 0.045, STEEL);
  b.rod([-0.95, 1.9, 3.95], [0.95, 1.9, 3.95], 0.045, STEEL);
  b.rod([-0.95, 1.4, 4.0], [0.95, 1.4, 4.0], 0.04, STEEL);
  // winch
  cyl(0.1, 0.1, 0.8, 8, GUN_D, [0, 0.85, 3.95], [1, 0, 0]);
  // hood spikes (armour)
  for (let i = 0; i < 5; i++) b.spike([-0.8 + i * 0.4, 2.0, 3.3], [0, 0.6, 0.8], 0.22, 0.04, { color: STEEL });
  // rivets on bumper
  const rv: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) rv.push(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6).rotateX(Math.PI / 2).translate(-1.1 + i * 0.2, 1.17, 4.04));
  b.part(mergeGeometries(rv)!, STEEL, { at: [0, 0, 0] });

  // ================= TURRET =================
  b.lathe([[0, 0], [0.42, 0], [0.42, 0.12], [0.3, 0.2], [0, 0.2]], { at: [0, 3.17, 1.8], segments: 8, color: GUN_D });
  bx(0.7, 0.34, 0.75, ARMOR, 0, 3.54, 1.8);
  bx(0.5, 0.2, 0.3, GUN_D, 0, 3.55, 2.2, { rotation: [-12, 0, 0] });
  for (const s of [1, -1]) {
    b.rod([s * 0.17, 3.56, 2.1], [s * 0.17, 3.56, 3.35], 0.045, STEEL);
    b.capsule([s * 0.17, 3.56, 3.35], [s * 0.17, 3.56, 3.55], 0.065, GUN_D);
    bx(0.12, 0.12, 0.5, ARMOR, s * 0.17, 3.56, 2.3);
    bx(0.14, 0.24, 0.3, GUN_D, s * 0.42, 3.55, 1.7); // ammo box
    lit(bx(0.03, 0.04, 0.2, AMBER, s * 0.5, 3.58, 1.7), 1.2);
  }
  lit(bx(0.2, 0.08, 0.06, RED, 0, 3.62, 2.2), 2); // sensor eye

  // ================= CARGO POD =================
  const podAt: [number, number, number] = [0, 2.45, -1.6];
  const pod = b.lathe(
    [[0, -2.6], [0.7, -2.5], [1.15, -2.0], [1.15, 2.0], [0.7, 2.5], [0, 2.6]],
    { at: podAt, axis: [0, 0, 1], segments: 8, color: POD },
  );
  for (const z of [-3.4, -2.5, -0.7, 0.2]) {
    b.lathe([[1.12, -0.09], [1.23, -0.07], [1.23, 0.07], [1.12, 0.09]], { at: [0, 2.45, z], axis: [0, 0, 1], segments: 8, color: GUN });
    b.lathe([[1.19, -0.02], [1.245, -0.02], [1.245, 0.02], [1.19, 0.02]], { at: [0, 2.45, z + 0.12], axis: [0, 0, 1], segments: 8, color: GUN_D });
  }
  const pend = (z: number, s: number) => {
    lit(b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 8), s > 0 ? CYAN : MAG, { at: [0, 2.45, z], dir: [0, 0, s] }), 1.4);
  };
  pend(-4.25, -1);
  b.part(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 8), GUN_D, { at: [0, 2.45, -4.2], dir: [0, 0, -1] });
  // seal strip on top
  bx(0.3, 0.12, 4.2, GUN_D, 0, 3.58, -1.6);
  lit(bx(0.12, 0.05, 4.0, MAG, 0, 3.65, -1.6), 1.6);
  for (let i = 0; i < 7; i++) bx(0.36, 0.14, 0.08, STEEL, 0, 3.6, -3.4 + i * 0.6);
  // pod decals
  for (const s of [1, -1]) {
    b.decal(pod, PODLABEL, { at: [s * 1.1, 2.5, -1.6], dir: [s, 0, 0], size: [1.7, 1.06], segments: 8 });
    b.decal(pod, HAZARD, { at: [s * 1.0, 1.8, -3.1], dir: [s, 0.3, 0], size: [1.4, 0.35], segments: 6 });
    // latches & beacon
    for (const z of [-0.3, -2.9]) {
      bx(0.1, 0.4, 0.2, GUN_D, s * 1.1, 2.0, z);
      lit(bx(0.04, 0.1, 0.1, AMBER, s * 1.16, 2.0, z), 1.3);
    }
    cyl(0.1, 0.12, 0.2, 8, GUN_D, [s * 0.6, 3.5, -0.2], [0, 1, 0]);
    lit(b.part(new THREE.SphereGeometry(0.12, 6, 4), AMBER, { at: [s * 0.6, 3.66, -0.2] }), 1.8);
  }
  // cradles
  for (const z of [-0.2, -3.0]) {
    bx(1.9, 0.35, 0.5, ARMOR, 0, 1.33, z);
    bx(1.5, 0.2, 0.5, GUN_D, 0, 1.55, z, { rotation: [0, 0, 0] });
    for (const s of [1, -1]) bx(0.3, 0.7, 0.4, ARMOR, s * 0.85, 1.6, z, { rotation: [0, 0, s * 25] });
  }
  // chain straps over the pod
  for (const z of [-0.7, -3.4]) {
    for (const s of [1, -1]) lit(bx(0.04, 0.04, 0.04, CYAN, s * 1.0, 3.05, z), 1.5);
  }
  // pod rivet rows
  const pr: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    pr.push(new THREE.SphereGeometry(0.03, 5, 3).translate(Math.sin(a) * 1.27, 2.45 + Math.cos(a) * 1.27, -2.5));
  }
  b.part(mergeGeometries(pr)!, STEEL, { at: [0, 0, 0] });

  // ================= side armour skirts & hazard =================
  for (const s of [1, -1]) {
    bx(0.08, 0.35, 3.0, ARMOR, s * 1.2, 0.66, -0.6, { });
    for (let i = 0; i < 5; i++) bx(0.03, 0.2, 0.05, i % 2 ? AMBER : BLACK, s * 1.25, 0.66, -1.9 + i * 0.6);
    // drone pod launch rack hint
    bx(0.1, 0.3, 0.6, GUN_D, s * 1.2, 1.4, -0.4);
    lit(bx(0.02, 0.06, 0.4, CYAN, s * 1.26, 1.4, -0.4), 1.3);
  }
  // scatter greeble bolts on chassis
  const gb: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 20; i++) gb.push(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6).rotateZ(Math.PI / 2).translate(1.22, 1.0 + (R() - 0.5) * 0.15, -4 + i * 0.4));
  b.part(mergeGeometries(gb)!, STEEL, { at: [0, 0, 0] });

  return b.root;
}
