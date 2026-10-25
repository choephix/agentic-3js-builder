import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, catmull, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Pickup HX-7",
  description:
    "A militarized pickup with its wheels torn out and four ducted hover thrusters bolted on. It carries a bed-mounted railgun, bull bar, ERA plating and neon underglow, in low-poly cyberpunk.",
};

// ---------- palette
const MAG = "#ff2a9d";
const CYAN = "#19f0ff";
const YEL = "#ffd400";
const RED = "#ff2438";
const GLASS = "#0a2c3c";
const DARK = "#14161c";
const STEEL = "#6d7684";
const RUBBER = "#1a1b20";
const WHITE = "#f4fbff";

// ---------- paints
const HULL = paint((p, n) => {
  let c = mix("#262b36", "#3b4252", noise(p, 0.3, 3));
  c = mix(c, "#6a7080", 0.25 * smoothstep(0.6, 1, n.y) * noise(p, 0.1, 8));
  c = mix(c, "#0e0f13", 0.65 * smoothstep(1.0, 0.45, p.y)); // road grime
  if (Math.abs(n.x) > 0.5 && ((p.z * 1.4) % 1 + 1) % 1 < 0.025) c = mix(c, "#0a0b0e", 0.9); // panel seams
  if (Math.abs(n.x) > 0.5 && p.y > 0.62 && p.y < 0.68) c = mix(c, MAG, 0.6);
  return c;
});
const ARMOR = paint((p, n) => {
  let c = mix("#434a58", "#2e333f", noise(p, 0.22, 11));
  c = mix(c, "#9aa2b0", 0.35 * smoothstep(0.7, 1, n.y));
  c = mix(c, "#15161b", 0.5 * smoothstep(0.12, 0.0, noise(p, 0.05, 4) - 0.35)); // chips
  return c;
});
const DECK = paint((p) => mix("#1b1d24", "#2a2d37", noise(p, 0.12, 21)));

// ---------- textures
const HAZARD = (() => {
  let s = `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#101114"/>`;
  for (let i = -2; i < 10; i++) s += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#ffd400"/>`;
  return svg(s + `</svg>`, { size: 256 });
})();
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <polygon points="32,3 58,17 58,47 32,61 6,47 6,17" fill="#0d0f14" stroke="#ff2a9d" stroke-width="3"/>
  <polygon points="36,10 20,36 30,36 26,54 44,26 33,26" fill="#19f0ff"/>
  <polygon points="36,10 20,36 30,36 26,54 44,26 33,26" fill="none" stroke="#fff" stroke-width="1"/>
  </svg>`,
  { size: 192 },
);
const TAG = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="36" rx="4" fill="#0d0f14" stroke="#ffd400" stroke-width="3"/>
  <text x="60" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#ffd400">HX-7 //2077</text></svg>`,
  { size: 256 },
);
const NEON = svg(
  `<svg viewBox="0 0 140 44" xmlns="http://www.w3.org/2000/svg">
  <text x="70" y="32" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#ff2a9d" stroke="#ffd0ea" stroke-width="1.2">HOVER</text>
  <rect x="8" y="38" width="124" height="3" fill="#19f0ff"/></svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#031a22"/>
  <path d="M0 22 L10 16 L18 20 L28 8 L38 18 L48 12 L64 20" stroke="#19f0ff" stroke-width="2" fill="none"/>
  <rect x="4" y="4" width="20" height="3" fill="#ff2a9d"/><rect x="4" y="26" width="40" height="2" fill="#19f0ff"/></svg>`,
  { size: 128 },
);

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hover_pickup" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const R = rng(5);
  type V = [number, number, number];
  const add = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: chassis, at, ...o });
  const rod = (a: V, c: V, r: number, col: any, o: any = {}) => b.rod(a, c, r, col, { bone: chassis, sides: 6, ...o });
  const decal = (tex: THREE.Texture, at: V, dir: V, w: number, h: number, bone: any = chassis, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, up });

  // ---------- underbody and frame
  add(box(1.7, 0.28, 4.6), DARK, [0, 0.55, 0]);
  for (const s of [1, -1]) {
    add(box(0.12, 0.2, 4.7), "#222530", [s * 0.7, 0.5, 0]);
    // glowing underglow strips
    glow(add(box(0.06, 0.03, 3.8), MAG, [s * 0.92, 0.38, 0]), 1.6);
    glow(add(box(0.06, 0.03, 3.8), CYAN, [s * 0.5, 0.38, 0]), 1.2);
  }
  glow(add(box(1.0, 0.03, 0.06), CYAN, [0, 0.38, 1.9]), 1.2);
  glow(add(box(1.0, 0.03, 0.06), MAG, [0, 0.38, -1.9]), 1.2);
  // central lift core
  add(cyl(0.3, 0.2, 10), STEEL, [0, 0.36, 0], { flat: true });
  glow(add(cyl(0.22, 0.03, 10), CYAN, [0, 0.25, 0]), 1.4);

  // ---------- lower body
  b.frustumBox([0, 1.0, -2.5], [0, 1.0, 0.8], [2.0, 0.6], [2.15, 0.6], { bone: chassis, color: HULL });
  b.frustumBox([0, 1.0, 0.8], [0, 0.95, 2.5], [2.15, 0.6], [1.85, 0.45], { bone: chassis, color: HULL });
  add(box(2.2, 0.06, 0.1), MAG, [0, 0.73, 0.6]); // belt trim
  glow(add(box(2.2, 0.025, 0.04), MAG, [0, 0.73, 0.66]), 1.4);

  // ---------- cab
  add(box(1.9, 0.62, 1.5), HULL, [0, 1.6, 0.3]);
  add(box(1.92, 0.1, 1.6), ARMOR, [0, 1.95, 0.3]);
  add(box(1.7, 0.6, 0.06), GLASS, [0, 1.6, 1.08], { rotation: [-32, 0, 0] });
  add(box(1.7, 0.45, 0.05), GLASS, [0, 1.6, -0.46]);
  for (const s of [1, -1]) {
    add(box(0.05, 0.4, 1.0), GLASS, [s * 0.96, 1.64, 0.35]);
    add(box(0.07, 0.62, 0.1), ARMOR, [s * 0.94, 1.6, 0.9], { rotation: [-20, 0, 0] });
    add(box(0.07, 0.6, 0.1), ARMOR, [s * 0.94, 1.6, -0.4]);
    add(box(0.07, 0.6, 0.08), ARMOR, [s * 0.96, 1.6, 0.4]);
    add(box(0.05, 0.05, 0.16), STEEL, [s * 0.98, 1.45, 0.25]); // handle
    // armoured window slats
    for (let i = 0; i < 3; i++) add(box(0.03, 0.3, 0.04), DARK, [s * 0.99, 1.64, 0.0 + i * 0.35]);
    // mirrors
    rod([s * 0.95, 1.55, 0.95], [s * 1.2, 1.62, 0.9], 0.02, STEEL);
    add(box(0.05, 0.2, 0.14), DARK, [s * 1.23, 1.62, 0.9]);
    glow(add(box(0.02, 0.05, 0.1), CYAN, [s * 1.26, 1.62, 0.9]), 1.5);
    // doors decals
    decal(EMBLEM, [s * 1.0, 1.1, 0.35], [s, 0, 0], 0.5, 0.5);
    decal(TAG, [s * 1.12, 0.98, -1.05], [s, 0, 0], 0.7, 0.23);
  }
  // dash screen visible through screen
  decal(SCREEN, [0, 1.52, 0.82], [0, 0, -1], 0.5, 0.25);

  // roof kit
  for (const s of [1, -1]) rod([s * 0.8, 2.0, -0.3], [s * 0.8, 2.0, 0.8], 0.025, STEEL);
  add(box(1.5, 0.1, 0.14), DARK, [0, 2.09, 0.85]);
  glow(add(box(0.7, 0.05, 0.03), MAG, [-0.38, 2.09, 0.93]), 1.8);
  glow(add(box(0.7, 0.05, 0.03), CYAN, [0.38, 2.09, 0.93]), 1.8);
  b.spike([-0.8, 2.0, -0.35], [0, 1, 0], 1.3, 0.02, STEEL, { bone: chassis, sides: 5 });
  glow(add(new THREE.SphereGeometry(0.03, 6, 4), RED, [-0.8, 3.33, -0.35]), 2);
  // dish
  add(cyl(0.03, 0.2, 6), STEEL, [0.7, 2.1, -0.3]);
  b.lathe([[0, 0], [0.2, 0.1], [0.2, 0.12], [0, 0.03]], { at: [0.7, 2.22, -0.3], axis: [0.2, 0.7, -0.5], segments: 10, bone: chassis, color: STEEL });

  // ---------- hood and nose
  b.frustumBox([0, 1.35, 1.05], [0, 1.2, 2.45], [1.9, 0.14], [1.7, 0.14], { bone: chassis, color: ARMOR });
  add(box(0.26, 0.06, 1.2), DARK, [0, 1.45, 1.7]); // intake scoop
  for (let i = 0; i < 4; i++) add(box(0.2, 0.025, 0.02), CYAN, [0, 1.49, 1.3 + i * 0.25]);
  // ERA bricks
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++) {
        add(box(0.3, 0.07, 0.25), j % 2 ? "#4b5160" : "#3a404d", [s * (0.38 + j * 0.31), 1.43 - i * 0.015, 1.3 + i * 0.35]);
        add(cyl(0.02, 0.02, 6), STEEL, [s * (0.38 + j * 0.31), 1.48 - i * 0.015, 1.3 + i * 0.35]);
      }
  // grille + headlights
  add(box(1.2, 0.4, 0.1), DARK, [0, 1.0, 2.47]);
  for (let i = 0; i < 5; i++) add(box(1.1, 0.025, 0.04), STEEL, [0, 0.88 + i * 0.08, 2.53]);
  for (const s of [1, -1]) {
    add(box(0.5, 0.18, 0.1), DARK, [s * 0.75, 1.05, 2.4]);
    glow(add(box(0.44, 0.06, 0.03), WHITE, [s * 0.75, 1.06, 2.46]), 2.2);
    glow(add(box(0.44, 0.025, 0.03), MAG, [s * 0.75, 0.97, 2.46]), 1.6);
  }
  // bull bar
  const bar = catmull([[1.0, 0.65, 2.3], [1.0, 0.65, 2.65], [0.55, 0.7, 2.75], [-0.55, 0.7, 2.75], [-1.0, 0.65, 2.65], [-1.0, 0.65, 2.3]]);
  b.sweep(bar, 0.05, STEEL, { bone: chassis, sides: 6, caps: "flat" });
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.68, 2.74], [0, 0, 1], 0.2, 0.04, ARMOR, { bone: chassis, sides: 5 });
  decal(HAZARD, [0, 0.53, 2.56], [0, 0, 1], 1.8, 0.16);

  // ---------- bed
  add(box(1.95, 0.06, 2.0), DECK, [0, 1.32, -1.48]);
  for (const s of [1, -1]) {
    add(box(0.08, 0.45, 2.05), HULL, [s * 0.98, 1.55, -1.48]);
    add(box(0.14, 0.05, 2.05), ARMOR, [s * 0.98, 1.8, -1.48]);
    for (const z of [-2.0, -1.5, -1.0]) add(box(0.1, 0.4, 0.06), ARMOR, [s * 1.03, 1.55, z]); // ribs
    // fins
    b.extrude([[0, 0], [0.55, 0], [0.35, 0.55, "sharp"], [0, 0.55]], {
      at: [s * 1.0, 1.82, -2.45], x: [0, 0, 1], thickness: 0.05, color: ARMOR, bone: chassis,
    });
    glow(add(box(0.03, 0.03, 0.3), MAG, [s * 1.0, 2.2, -2.5]), 1.6);
    // tail lights
    glow(add(box(0.3, 0.1, 0.04), RED, [s * 0.8, 1.55, -2.5]), 2);
    // fuel drums
    add(cyl(0.14, 0.4, 8), "#3b4a2f", [s * 0.7, 1.55, -0.65], { flat: true });
  }
  add(box(1.95, 0.45, 0.06), HULL, [0, 1.55, -2.5]);
  add(box(1.95, 0.4, 0.06), ARMOR, [0, 1.55, -0.52]);
  decal(HAZARD, [0, 1.38, -2.54], [0, 0, -1], 1.6, 0.16);
  decal(TAG, [0, 1.62, -2.545], [0, 0, -1], 0.5, 0.17);
  // ammo crates with glowing handles
  for (let i = 0; i < 3; i++) {
    add(box(0.5, 0.3, 0.4), "#4a5240", [-0.35 + (i % 2) * 0.1, 1.5, -2.1 + i * 0.0 - (i > 1 ? 0.45 : 0)]);
    glow(add(box(0.2, 0.03, 0.03), YEL, [-0.35 + (i % 2) * 0.1, 1.67, -2.3 - (i > 1 ? 0.45 : 0)]), 1.3);
  }
  // neon sign
  glow(decal(NEON, [0.55, 2.05, -2.54], [0, 0, -1], 0.8, 0.25), 1.8);
  rod([0.9, 1.8, -2.5], [0.9, 1.95, -2.5], 0.015, STEEL);
  rod([0.2, 1.8, -2.5], [0.2, 1.95, -2.5], 0.015, STEEL);

  // ---------- railgun turret
  add(cyl(0.24, 0.7, 10), ARMOR, [0, 1.65, -1.5], { flat: true });
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.02, -1.5], dir: [0, 1, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.25, -1.5], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.38, 0.14, 12), ARMOR, { bone: yaw, at: [0, 2.08, -1.5], flat: true });
  for (const s of [1, -1]) b.part(box(0.05, 0.3, 0.4), ARMOR, { bone: yaw, at: [s * 0.22, 2.25, -1.5] });
  const P = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { bone: pitch, at, ...o });
  P(box(0.34, 0.3, 0.5), ARMOR, [0, 2.25, -1.55]);
  for (const s of [1, -1]) {
    P(box(0.05, 0.1, 1.7), STEEL, [s * 0.08, 2.25, -0.55]);
    P(cyl(0.08, 0.35, 8), DARK, [s * 0.24, 2.2, -1.2], { rotation: [90, 0, 0], flat: true });
  }
  glow(P(box(0.1, 0.03, 1.6), CYAN, [0, 2.25, -0.5]), 2);
  for (let i = 0; i < 5; i++) {
    const r = 0.17 - i * 0.012;
    P(new THREE.TorusGeometry(r, 0.02, 5, 10), DARK, [0, 2.25, -1.15 + i * 0.3]);
    glow(P(new THREE.TorusGeometry(r - 0.02, 0.01, 4, 10), MAG, [0, 2.25, -1.1 + i * 0.3]), 1.8);
  }
  P(box(0.7, 0.4, 0.04), ARMOR, [0, 2.3, -1.0], { rotation: [0, 0, 0] }); // gun shield
  decal(HAZARD, [0, 2.12, -0.97], [0, 0, 1], 0.6, 0.1, pitch);
  // power cable from turret to crates
  b.sweep(catmull([[0.1, 2.0, -1.7], [0.3, 1.6, -1.9], [-0.2, 1.38, -2.1]]), 0.02, DARK, { bone: chassis, sides: 5 });

  // ---------- hover thrusters
  const pads: [string, number, number][] = [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]];
  for (const [k, s, z] of pads) {
    const x = s * 1.38;
    const y = 0.68;
    rod([s * 0.95, 0.85, z], [x, y, z], 0.1, ARMOR, { section: "box" });
    add(box(0.5, 0.06, 0.5), DARK, [x, y + 0.22, z]);
    b.lathe([[0.38, -0.25], [0.48, -0.2], [0.48, 0.2], [0.38, 0.25]], { at: [x, y, z], axis: [0, 1, 0], segments: 10, bone: chassis, color: ARMOR });
    add(new THREE.TorusGeometry(0.44, 0.03, 5, 12), STEEL, [x, y - 0.25, z], { rotation: [90, 0, 0] });
    add(new THREE.TorusGeometry(0.44, 0.03, 5, 12), STEEL, [x, y + 0.25, z], { rotation: [90, 0, 0] });
    glow(add(cyl(0.37, 0.02, 14), CYAN, [x, y - 0.18, z], { flat: true }), 1.5);
    add(cyl(0.08, 0.5, 6), STEEL, [x, y, z]);
    const fan = b.joint(`fan${k}`, { parent: chassis, at: [x, y, z], dir: [0, 1, 0], role: "hinge" });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      b.part(box(0.07, 0.015, 0.3), STEEL, {
        bone: fan, at: [x + 0.22 * Math.sin(a), y + 0.02, z + 0.22 * Math.cos(a)], rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
    // vertical guard struts
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      rod([x + 0.4 * Math.sin(a), y - 0.2, z + 0.4 * Math.cos(a)], [x + 0.4 * Math.sin(a), y + 0.2, z + 0.4 * Math.cos(a)], 0.012, DARK, { sides: 4 });
    }
    decal(HAZARD, [x + s * 0.485, y, z], [s, 0, 0], 0.5, 0.1);
    // landing skid (extended: touches ground)
    const lx = s * 0.72;
    const lz = z > 0 ? 1.95 : -1.95;
    rod([lx, 0.5, lz], [lx, 0.06, lz], 0.045, STEEL);
    add(box(0.3, 0.06, 0.55), DARK, [lx, 0.03, lz]);
    add(box(0.2, 0.02, 0.4), YEL, [lx, 0.065, lz]);
  }

  // ---------- main rear thrusters
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.18, 0], [0.14, 0.1], [0.3, 0.5], [0.26, 0.5], [0.11, 0.12], [0, 0.14]], {
      at: [s * 0.55, 1.0, -2.55], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEEL,
    });
    glow(add(cyl(0.1, 0.03, 10), CYAN, [s * 0.55, 1.0, -2.7], { rotation: [90, 0, 0] }), 2);
    add(new THREE.TorusGeometry(0.26, 0.02, 5, 10), DARK, [s * 0.55, 1.0, -2.85]);
  }

  // ---------- side armour skirts and plates
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      add(box(0.05, 0.3, 0.55), ARMOR, [s * 1.12, 0.78, -1.1 + i * 0.7], { rotation: [0, 0, s * 12] });
      for (const dz of [-0.18, 0.18]) add(cyl(0.02, 0.03, 6), STEEL, [s * 1.16, 0.8, -1.1 + i * 0.7 + dz], { rotation: [0, 0, 90] });
    }
    // smoke launchers on fenders
    for (let i = 0; i < 4; i++) {
      rod([s * 0.95 + s * 0.0, 1.5, 1.25 + i * 0.07], [s * 1.0, 1.68, 1.55 + i * 0.07], 0.03, ARMOR);
    }
    // exhaust stacks
    rod([s * 0.9, 1.4, -0.7], [s * 0.9, 2.1, -0.7], 0.05, STEEL);
    add(cyl(0.065, 0.4, 8), ARMOR, [s * 0.9, 1.7, -0.7]);
    glow(add(cyl(0.04, 0.02, 8), YEL, [s * 0.9, 2.12, -0.7]), 1.3);
  }
  // scatter rivets / antenna studs on roof
  for (let i = 0; i < 14; i++)
    add(cyl(0.02, 0.02, 6), STEEL, [(R() - 0.5) * 1.6, 2.01, -0.35 + R() * 1.4]);

  return b.root;
}
