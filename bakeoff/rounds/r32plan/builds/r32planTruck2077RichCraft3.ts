import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, paint, noise, mix, smoothstep } from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { coil, metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Warhauler 2077",
  description:
    "Six-wheel armoured cyberpunk war truck: wedge cab, neon underglow, railgun turret, missile pods, radar and sensor mast.",
};

type P3 = [number, number, number];
const D = Math.PI / 180;

// ---------------------------------------------------------------- textures
const HAZARD = svg(
  `<svg viewBox="0 0 96 16" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#f2b705"/><rect x="8" width="8" height="16" fill="#101010"/></pattern></defs><rect width="96" height="16" fill="url(#p)"/><rect width="96" height="16" fill="none" stroke="#101010" stroke-width="2"/></svg>`,
  { size: 256 },
);

const SIDE = svg(
  `<svg viewBox="0 0 520 100" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="h" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="24" fill="#f2b705"/><rect x="12" width="12" height="24" fill="#101010"/></pattern></defs>
  <rect width="520" height="100" fill="#171d29"/>
  <g stroke="#3b4a63" stroke-width="3" fill="none"><rect x="2" y="2" width="128" height="96"/><rect x="132" y="2" width="128" height="96"/><rect x="262" y="2" width="128" height="96"/><rect x="392" y="2" width="126" height="96"/></g>
  <text x="66" y="72" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="66" fill="#ff7a1a">07</text>
  <text x="14" y="22" font-family="monospace" font-size="13" fill="#27f3ff">UNIT</text>
  <rect x="142" y="12" width="108" height="26" fill="url(#h)"/>
  <rect x="142" y="62" width="108" height="26" fill="url(#h)"/>
  <path d="M146 50 H246" stroke="#27f3ff" stroke-width="4"/>
  <g stroke="#27f3ff" stroke-width="5"><path d="M276 18 H376"/><path d="M276 32 H376"/><path d="M276 46 H376"/><path d="M276 60 H376"/><path d="M276 74 H376"/><path d="M276 88 H376"/></g>
  <g fill="none" stroke="#ff2fb3" stroke-width="8" stroke-linejoin="round"><path d="M410 22 L440 50 L410 78"/><path d="M440 22 L470 50 L440 78"/></g>
  <text x="508" y="90" text-anchor="end" font-family="monospace" font-weight="bold" font-size="20" fill="#d8fbff">2077</text>
  </svg>`,
  { size: 1024 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill="#10141c" stroke="#ff7a1a" stroke-width="5"/>
  <polygon points="50,13 84,31 84,69 50,87 16,69 16,31" fill="none" stroke="#27f3ff" stroke-width="2.5"/>
  <path d="M20 50 Q50 24 80 50 Q50 76 20 50Z" fill="#05070b" stroke="#ff2fb3" stroke-width="3"/>
  <circle cx="50" cy="50" r="12" fill="#ff2fb3"/>
  <ellipse cx="50" cy="50" rx="3.5" ry="11" fill="#05070b"/>
  <circle cx="46" cy="45" r="2.5" fill="#fff"/>
  <text x="50" y="82" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#ff7a1a">N-77</text>
  </svg>`,
  { size: 256 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="150" height="50" rx="4" fill="#080b11" stroke="#2c3646" stroke-width="3"/>
  <g stroke="#27f3ff" stroke-width="3"><path d="M8 10 H62"/><path d="M8 20 H62"/><path d="M8 30 H62"/><path d="M8 40 H62"/><path d="M88 10 H142"/><path d="M88 20 H142"/><path d="M88 30 H142"/><path d="M88 40 H142"/></g>
  <polygon points="75,4 90,25 75,46 60,25" fill="#10141c" stroke="#ff7a1a" stroke-width="3"/>
  <circle cx="75" cy="25" r="5" fill="#ff2fb3"/>
  </svg>`,
  { size: 256 },
);

const POD = svg(
  `<svg viewBox="0 0 60 55" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="55" fill="#1d232d" stroke="#3b4a63" stroke-width="3"/>
  <g stroke="#ff7a1a" stroke-width="2.5" fill="#05070b">
  <circle cx="14" cy="16" r="9"/><circle cx="30" cy="16" r="9"/><circle cx="46" cy="16" r="9"/>
  <circle cx="14" cy="39" r="9"/><circle cx="30" cy="39" r="9"/><circle cx="46" cy="39" r="9"/></g>
  <g fill="#c0392b"><circle cx="14" cy="16" r="4"/><circle cx="30" cy="16" r="4"/><circle cx="46" cy="16" r="4"/>
  <circle cx="14" cy="39" r="4"/><circle cx="30" cy="39" r="4"/><circle cx="46" cy="39" r="4"/></g>
  </svg>`,
  { size: 256 },
);

const GLASS = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f3a4e"/><stop offset="1" stop-color="#050f18"/></linearGradient></defs>
  <rect width="100" height="70" fill="url(#g)"/>
  <polygon points="10,70 28,0 40,0 22,70" fill="#27f3ff" opacity="0.18"/>
  <polygon points="52,70 68,0 74,0 58,70" fill="#ff2fb3" opacity="0.14"/>
  <path d="M8 56 H92" stroke="#27f3ff" stroke-width="1.5" opacity="0.6"/>
  <path d="M30 56 A20 20 0 0 1 70 56" stroke="#27f3ff" stroke-width="1.5" fill="none" opacity="0.7"/>
  <text x="50" y="52" text-anchor="middle" font-family="monospace" font-size="5" fill="#27f3ff" opacity="0.8">TGT LOCK 0.82km</text>
  <rect x="1" y="1" width="98" height="68" fill="none" stroke="#05070b" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const REAR = svg(
  `<svg viewBox="0 0 180 70" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="h" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="#f2b705"/><rect x="7" width="7" height="14" fill="#101010"/></pattern></defs>
  <rect width="180" height="70" fill="#151b26" stroke="#3b4a63" stroke-width="3"/>
  <text x="90" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#ff7a1a">NOMAD-77</text>
  <rect x="8" y="52" width="164" height="12" fill="url(#h)"/>
  <rect x="55" y="36" width="70" height="13" fill="#e8f4f8"/>
  <text x="90" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" fill="#101010">NX-2077</text>
  <g stroke="#27f3ff" stroke-width="2"><path d="M10 38 H48"/><path d="M10 44 H48"/><path d="M132 38 H170"/><path d="M132 44 H170"/></g>
  </svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------- palette
const HULL_BASE = paint((p, n) => {
  const k = noise(p, 0.5, 3);
  let c = mix("#2c3646", "#3d4a5e", k);
  c = mix(c, "#5b6b82", 0.35 * smoothstep(0.3, 1, n.y));
  c = mix(c, "#1a1f28", 0.5 * smoothstep(0.1, -0.8, n.y));
  c = mix(c, "#4a3f35", 0.7 * smoothstep(1.5, 0.4, p.y) * noise(p, 0.25, 9));
  return c;
});
const HULL = panelled(HULL_BASE, { size: 0.6, aspect: 0.6, rivets: 0.08 });
const ARMOR = metal("iron", { polish: 0.2, tarnish: 0.5, size: 0.2 });
const STEEL = metal("steel", { tarnish: 0.4 });
const DARK = "#12151b";
const TRIM = "#222a36";
const ACC = "#ff7a1a";
const CYAN = "#27f3ff";
const MAG = "#ff2fb3";
const RED = "#ff2a2a";
const LAMP = "#d8fbff";
const TYRE = "#16171b";
const AMBER = "#ffb21a";

export default function build() {
  const b = createBuilder({ name: "warhauler2077", paintSize: 2048 });
  type J = ReturnType<typeof b.joint>;
  type Fill = string | Paint;
  const chassis = b.joint("chassis", { at: [0, 0.9, 0] });
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.6, -1.5], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.25, -0.5], aim: [0, 3.25, 1.7] });

  // ---- helpers
  const box = (
    w: number, h: number, d: number, color: Fill, at: P3,
    o: { bone?: J; rot?: P3; tex?: THREE.Texture; glowK?: number } = {},
  ) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, {
      at,
      bone: o.bone ?? chassis,
      ...(o.rot ? { rotation: o.rot } : {}),
      ...(o.tex ? { texture: o.tex } : {}),
    });
    if (o.glowK) glow(p, o.glowK);
    return p;
  };
  const cyl = (
    r: number, h: number, seg: number, color: Fill, at: P3, dir: P3 = [0, 1, 0],
    o: { bone?: J; glowK?: number; r2?: number } = {},
  ) => {
    const p = b.part(new THREE.CylinderGeometry(o.r2 ?? r, r, h, seg), color, { at, dir, bone: o.bone ?? chassis });
    if (o.glowK) glow(p, o.glowK);
    return p;
  };
  const decal = (tex: THREE.Texture, w: number, h: number, at: P3, dir: P3, bone: J = chassis, g = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, bone });
    if (g) glow(p, g);
    return p;
  };
  const tf = (g: THREE.BufferGeometry, at: P3, rot: P3 = [0, 0, 0]) => {
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(at[0], at[1], at[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    return g;
  };
  const merged = (gs: THREE.BufferGeometry[], color: Fill, bone: J = chassis, glowK = 0) => {
    const p = b.part(mergeGeometries(gs)!, color, { bone, at: [0, 0, 0] });
    if (glowK) glow(p, glowK);
    return p;
  };

  // ---- chassis frame, axles, suspension
  for (const s of [1, -1]) {
    box(0.22, 0.24, 8.4, TRIM, [s * 0.55, 0.85, 0.3]);
    box(0.12, 0.3, 8.4, ARMOR, [s * 0.55, 0.85, 0.3]);
  }
  for (const z of [4.3, 2.4, 1.0, -0.5, -2.1, -3.6]) box(1.3, 0.14, 0.2, TRIM, [0, 0.85, z]);
  b.rod([0, 0.7, 3.6], [0, 0.7, -2.1], 0.06, DARK, { bone: chassis });
  const axles = [3.6, -0.5, -2.1];
  for (const z of axles) {
    cyl(0.1, 2.8, 8, STEEL, [0, 0.62, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), ARMOR, { at: [0, 0.62, z], bone: chassis, scale: [1, 0.9, 1] });
    for (const s of [1, -1]) {
      b.sweep(coil([s * 0.8, 0.68, z], [s * 0.8, 0.93, z], 0.08, 5), 0.014, { bone: chassis, color: ACC, sides: 6 });
      cyl(0.03, 0.4, 6, STEEL, [s * 0.8, 0.8, z]);
    }
  }
  // fuel tanks
  for (const s of [1, -1]) {
    cyl(0.24, 2.0, 10, ARMOR, [s * 0.88, 0.6, 1.6], [0, 0, 1]);
    for (const z of [0.9, 2.3]) cyl(0.255, 0.06, 10, DARK, [s * 0.88, 0.6, z], [0, 0, 1]);
    box(0.06, 0.06, 0.3, AMBER, [s * 0.88, 0.37, 2.7], { glowK: 1.2 });
  }

  // ---- wheels
  const R = 0.6;
  const W = 0.5;
  const treadGeo = () => {
    const gs: THREE.BufferGeometry[] = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.2, W * 0.98, 0.1);
      g.rotateY(a);
      g.translate(Math.sin(a) * (R - 0.02), 0, Math.cos(a) * (R - 0.02));
      gs.push(g);
    }
    return mergeGeometries(gs)!;
  };
  const lugGeo = () => {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6);
      g.translate(Math.sin(a) * 0.17, W / 2 + 0.07, Math.cos(a) * 0.17);
      gs.push(g);
    }
    return mergeGeometries(gs)!;
  };
  for (const s of [1, -1]) {
    axles.forEach((z, i) => {
      const x = s * 1.33;
      const at: P3 = [x, 0.62, z];
      const j = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: chassis, at, dir: [s, 0, 0] });
      const dir: P3 = [s, 0, 0];
      b.part(new THREE.CylinderGeometry(R - 0.04, R - 0.04, W, 14), TYRE, { at, dir, bone: j });
      b.part(treadGeo(), TYRE, { at, dir, bone: j });
      b.part(new THREE.CylinderGeometry(0.4, 0.4, W + 0.02, 10), STEEL, { at, dir, bone: j });
      const o = (k: number): P3 => [x + s * k, 0.62, z];
      glow(b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 10), CYAN, { at: o(W / 2 + 0.01), dir, bone: j }), 1.4);
      b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.05, 10), DARK, { at: o(W / 2 + 0.02), dir, bone: j });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), ARMOR, { at: o(W / 2 + 0.06), dir, bone: j });
      b.part(lugGeo(), STEEL, { at, dir, bone: j });
    });
  }

  // ---- fenders and mud flaps
  for (const s of [1, -1])
    for (const z of axles) {
      box(0.8, 0.07, 1.55, ARMOR, [s * 1.33, 1.36, z]);
      box(0.07, 0.24, 1.55, ARMOR, [s * 1.7, 1.27, z]);
      box(0.7, 0.5, 0.05, DARK, [s * 1.33, 0.95, z - 0.8]);
      box(0.6, 0.03, 0.04, ACC, [s * 1.33, 1.37, z + 0.7], { glowK: 1 });
    }

  // ---- main hull (side profile extruded across the width)
  b.extrude(
    [
      [-3.9, 1.0], [2.05, 1.0], [2.05, 2.45], [1.7, 2.6],
      [-3.4, 2.6], [-3.9, 2.25],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.1, bevel: 0.04, color: HULL, bone: chassis },
  );
  // armoured upper wedge plates along hull top edges
  for (const s of [1, -1]) {
    box(0.4, 0.06, 5.0, ARMOR, [s * 0.9, 2.64, -0.85], { rot: [0, 0, s * -10] });
    b.rod([s * 1.05, 2.6, 1.7], [s * 1.05, 2.6, -3.4], 0.035, ACC, { bone: chassis });
    // side panel decal and ribs
    decal(SIDE, 5.2, 1.0, [s * 1.062, 1.98, -0.85], [s, 0, 0]);
    for (const z of [1.75, 0.45, -0.85, -2.15, -3.45]) box(0.05, 1.05, 0.08, TRIM, [s * 1.075, 1.98, z]);
    // neon lines
    box(0.04, 0.05, 5.5, CYAN, [s * 1.07, 2.52, -0.85], { glowK: 1.6 });
    box(0.05, 0.06, 5.9, MAG, [s * 1.03, 1.04, -0.95], { glowK: 1.8 });
  }

  // ---- cab
  b.extrude(
    [
      [1.95, 1.0], [4.7, 1.0], [4.7, 1.78], [4.35, 1.98],
      [3.55, 2.15], [2.75, 3.25], [1.95, 3.25],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.04, color: HULL, bone: chassis },
  );
  // windshield and pillars
  b.part(new THREE.BoxGeometry(2.0, 1.36, 0.04), "#ffffff", {
    at: [0, 2.715, 3.166], rotation: [-36, 0, 0], texture: GLASS, bone: chassis,
  });
  for (const s of [1, -1]) box(0.14, 1.42, 0.07, DARK, [s * 1.05, 2.715, 3.16], { rot: [-36, 0, 0] });
  box(2.2, 0.1, 0.14, DARK, [0, 3.27, 2.72]);
  for (const s of [1, -1]) {
    b.extrude(
      [[2.25, 2.3], [3.35, 2.3], [2.92, 3.1], [2.25, 3.1]],
      { at: [s * 1.115, 0, 0], x: [0, 0, 1], thickness: 0.04, color: "#0d2b3a", bone: chassis },
    );
    box(0.04, 0.03, 1.1, CYAN, [s * 1.14, 2.3, 2.8], { glowK: 1.2 });
    // door armour plate + emblem
    box(0.06, 0.85, 1.55, ARMOR, [s * 1.13, 1.55, 3.05]);
    decal(EMBLEM, 0.62, 0.62, [s * 1.166, 1.55, 3.05], [s, 0, 0]);
    box(0.05, 0.05, 0.25, ACC, [s * 1.18, 1.8, 2.5]);
    // cab neon + clearance lights
    box(0.05, 0.06, 2.5, MAG, [s * 1.12, 1.04, 3.35], { glowK: 1.8 });
    for (const z of [2.3, 3.0, 3.7, 4.4]) box(0.05, 0.07, 0.12, AMBER, [s * 1.14, 1.98, z], { glowK: 1.6 });
    // headlights
    box(0.4, 0.28, 0.1, DARK, [s * 0.93, 1.48, 4.7]);
    box(0.34, 0.2, 0.06, LAMP, [s * 0.93, 1.48, 4.76], { glowK: 2 });
    box(0.3, 0.05, 0.05, AMBER, [s * 0.93, 1.28, 4.74], { glowK: 1.5 });
    // mirror cameras
    b.rod([s * 1.1, 2.55, 3.35], [s * 1.38, 2.72, 3.4], 0.025, DARK, { bone: chassis });
    box(0.1, 0.22, 0.16, TRIM, [s * 1.4, 2.72, 3.42]);
    box(0.04, 0.1, 0.08, CYAN, [s * 1.4, 2.72, 3.52], { glowK: 2 });
    // exhaust stacks
    cyl(0.09, 2.3, 8, ARMOR, [s * 1.22, 2.4, 1.75]);
    for (const y of [1.6, 2.4, 3.2]) cyl(0.12, 0.06, 8, DARK, [s * 1.22, y, 1.75]);
    cyl(0.1, 0.05, 8, ACC, [s * 1.22, 3.57, 1.75], [0, 1, 0], { glowK: 1.8 });
    box(0.14, 0.1, 0.2, TRIM, [s * 1.14, 1.6, 1.75]);
    box(0.14, 0.1, 0.2, TRIM, [s * 1.14, 3.0, 1.75]);
  }
  // hood
  const hoodY = (z: number) => 1.98 + (4.35 - z) * (0.17 / 0.8);
  box(0.9, 0.18, 0.55, DARK, [0, hoodY(3.95) + 0.09, 3.95], { rot: [12, 0, 0] });
  box(0.7, 0.04, 0.05, CYAN, [0, hoodY(4.2) + 0.12, 4.2], { rot: [12, 0, 0], glowK: 1.6 });
  for (const s of [1, -1])
    for (const z of [3.7, 3.85, 4.0, 4.15])
      box(0.6, 0.02, 0.06, ACC, [s * 0.65, hoodY(z) + 0.015, z], { rot: [12, 0, 0], glowK: 1.4 });
  // roof
  box(2.3, 0.08, 1.0, ARMOR, [0, 3.29, 2.35]);
  box(1.7, 0.1, 0.12, AMBER, [0, 3.36, 2.8], { glowK: 2 });
  box(0.3, 0.1, 0.12, RED, [-0.95, 3.36, 2.8], { glowK: 2 });
  box(0.3, 0.1, 0.12, CYAN, [0.95, 3.36, 2.8], { glowK: 2 });
  // grille and nose
  decal(GRILLE, 1.5, 0.5, [0, 1.45, 4.705], [0, 0, 1], chassis, 1.1);
  // bumper
  box(2.9, 0.6, 0.55, ARMOR, [0, 0.95, 4.955]);
  decal(HAZARD, 2.8, 0.42, [0, 0.95, 5.235], [0, 0, 1]);
  box(2.4, 0.1, 0.14, DARK, [0, 1.92, 4.95]);
  for (const s of [1, -1]) {
    box(0.1, 0.7, 0.1, DARK, [s * 1.0, 1.55, 4.95]);
    b.rod([s * 1.0, 1.92, 4.95], [s * 1.0, 1.95, 4.4], 0.04, DARK, { bone: chassis });
    b.part(new THREE.ConeGeometry(0.14, 0.55, 4), ACC, { at: [s * 1.38, 0.95, 5.45], dir: [0, 0, 1], bone: chassis });
  }
  merged(
    [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((x) => tf(new THREE.ConeGeometry(0.09, 0.3, 4), [x, 0.5, 5.15], [90, 0, 0])),
    STEEL,
  );
  box(0.5, 0.06, 0.06, MAG, [0, 0.62, 5.24], { glowK: 1.8 });

  // ---- roof sensors on hull top deck
  for (const s of [1, -1]) {
    box(0.7, 0.45, 0.6, ARMOR, [s * 0.65, 2.825, 0.45]);
    box(0.64, 0.05, 0.54, ACC, [s * 0.65, 3.07, 0.45]);
    box(0.5, 0.04, 0.04, CYAN, [s * 0.65, 2.8, 0.76], { glowK: 1.6 });
  }
  cyl(0.06, 0.6, 6, DARK, [0.8, 2.9, 1.35]);
  const dishDir = new THREE.Vector3(0.4, 1, 0.6).normalize();
  b.lathe([[0, 0], [0.32, 0.1], [0.32, 0.125], [0, 0.03]], {
    at: [0.8, 3.22, 1.35], axis: [dishDir.x, dishDir.y, dishDir.z], color: STEEL, bone: chassis, segments: 12,
  });
  b.rod([0.8, 3.22, 1.35], [0.8 + dishDir.x * 0.28, 3.22 + dishDir.y * 0.28, 1.35 + dishDir.z * 0.28], 0.02, DARK, { bone: chassis });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { at: [0.8 + dishDir.x * 0.28, 3.22 + dishDir.y * 0.28, 1.35 + dishDir.z * 0.28], bone: chassis }), 2);
  cyl(0.06, 0.4, 6, DARK, [-0.8, 2.8, 1.35]);
  cyl(0.2, 0.18, 8, ARMOR, [-0.8, 3.08, 1.35]);
  b.part(new THREE.SphereGeometry(0.17, 8, 5), TRIM, { at: [-0.8, 3.17, 1.35], bone: chassis });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { at: [-0.8, 3.27, 1.42], bone: chassis }), 2);

  // ---- reactor and missile pods (rear deck)
  cyl(0.3, 0.55, 6, ARMOR, [0, 2.88, -3.0], [0, 1, 0]);
  cyl(0.22, 0.5, 6, CYAN, [0, 2.9, -3.0], [0, 1, 0], { glowK: 2.2 });
  cyl(0.34, 0.06, 6, ACC, [0, 3.18, -3.0]);
  cyl(0.34, 0.06, 6, ACC, [0, 2.65, -3.0]);
  const podN = new THREE.Vector3(0, 0.5, 0.866);
  for (const s of [1, -1]) {
    const c: P3 = [s * 0.8, 3.235, -3.0];
    box(0.65, 0.6, 1.5, ARMOR, c, { rot: [-30, 0, 0] });
    decal(POD, 0.6, 0.55, [c[0], c[1] + 0.375 + podN.y * 0.012, c[2] + 0.65 + podN.z * 0.012], [0, podN.y, podN.z]);
    box(0.08, 0.6, 0.08, TRIM, [s * 0.6, 2.9, -3.7], { rot: [0, 0, 0] });
    box(0.08, 0.6, 0.08, TRIM, [s * 1.0, 2.9, -3.7]);
    box(0.7, 0.12, 0.5, TRIM, [s * 0.8, 2.66, -2.5]);
    b.rod([s * 1.0, 2.6, -3.3], [s * 1.0, 4.1, -3.3], 0.02, DARK, { bone: chassis });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [s * 1.0, 4.1, -3.3], bone: chassis }), 2.2);
  }

  // ---- rear face
  decal(REAR, 1.9, 0.74, [0, 1.65, -3.912], [0, 0, -1]);
  for (const s of [1, -1]) {
    box(0.5, 0.16, 0.06, RED, [s * 0.85, 1.25, -3.93], { glowK: 2 });
    box(0.2, 0.08, 0.06, AMBER, [s * 1.0, 2.0, -3.93], { glowK: 1.5 });
  }
  box(2.6, 0.3, 0.3, ARMOR, [0, 0.9, -4.0]);
  box(2.4, 0.06, 0.04, HAZARD ? ACC : ACC, [0, 0.9, -4.16], { glowK: 0.8 });
  cyl(0.07, 0.4, 8, STEEL, [0, 1.0, -4.3], [0, 0, 1]);
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, { at: [0, 1.0, -4.5], dir: [0, 0, 1], axis: "z", bone: chassis });

  // ---- turret
  b.lathe([[0, 0], [0.85, 0], [0.85, 0.12], [0.7, 0.2], [0, 0.2]], {
    at: [0, 2.6, -1.5], color: STEEL, bone: turret, segments: 12,
  });
  b.extrude(
    [
      [-2.3, 2.78], [-0.7, 2.78], [-0.45, 3.1], [-0.65, 3.5],
      [-1.2, 3.65], [-1.9, 3.55], [-2.35, 3.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.5, bevel: 0.04, color: HULL, bone: turret },
  );
  box(1.4, 0.5, 0.3, ARMOR, [0, 3.25, -0.42], { bone: gun });
  box(1.3, 0.44, 0.4, TRIM, [0, 3.1, -2.45], { bone: turret });
  box(1.1, 0.04, 0.04, MAG, [0, 3.1, -2.67], { bone: turret, glowK: 1.8 });
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 3.25, -0.3], [s * 0.3, 3.25, 1.7], 0.075, STEEL, { bone: gun, sides: 8 });
    box(0.26, 0.26, 0.9, ARMOR, [s * 0.3, 3.25, 0.1], { bone: gun });
    for (const z of [0.7, 1.0, 1.3])
      cyl(0.125, 0.05, 8, CYAN, [s * 0.3, 3.25, z], [0, 0, 1], { bone: gun, glowK: 2.2 });
    box(0.18, 0.18, 0.26, DARK, [s * 0.3, 3.25, 1.8], { bone: gun });
    box(0.5, 0.04, 0.04, ACC, [s * 0.3, 3.38, -0.1], { bone: gun, glowK: 1.2 });
  }
  // ERA tiles and smoke launchers
  const era: THREE.BufferGeometry[] = [];
  const smoke: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) era.push(tf(new THREE.BoxGeometry(0.06, 0.24, 0.3), [s * 0.78, 3.0 + r * 0.3, -2.1 + c * 0.35]));
    for (let k = 0; k < 3; k++)
      smoke.push(tf(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 6), [s * 0.82, 3.38, -1.0 - k * 0.14], [0, 0, -s * 30]));
  }
  merged(era, ACC, turret);
  merged(smoke, DARK, turret);
  cyl(0.28, 0.12, 8, ARMOR, [0.35, 3.7, -1.7], [0, 1, 0], { bone: turret });
  b.part(new THREE.SphereGeometry(0.2, 8, 5), TRIM, { at: [0.35, 3.74, -1.7], bone: turret });
  glow(b.part(new THREE.BoxGeometry(0.16, 0.08, 0.05), RED, { at: [0.35, 3.82, -1.52], bone: turret }), 2.2);
  box(0.4, 0.08, 0.4, ARMOR, [-0.4, 3.68, -1.8], { bone: turret });
  b.rod([-0.4, 3.7, -1.9], [-0.4, 4.5, -2.0], 0.015, DARK, { bone: turret });

  // ---- cargo crates and misc details on hull
  box(1.0, 0.1, 0.5, ACC, [0, 2.65, -2.1], { bone: chassis });
  for (const s of [1, -1]) {
    cyl(0.18, 0.5, 8, TRIM, [s * 0.6, 2.85, -0.4 - 0.0], [0, 0, 1], { bone: chassis });
    box(0.5, 0.05, 0.05, CYAN, [s * 0.65, 2.62, 0.78], { glowK: 1.2 });
  }
  // underside lights
  for (const z of [3.6, -0.5, -2.1]) box(0.5, 0.04, 0.3, CYAN, [0, 0.76, z], { glowK: 1.4 });

  return b.root;
}
