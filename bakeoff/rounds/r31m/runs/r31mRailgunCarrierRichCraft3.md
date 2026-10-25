```ts
import * as THREE from "three";
import { createBuilder, paint, patches, metal as _unused } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Railgun Carrier RG-6",
  description:
    "Six-wheeled military railgun carrier with a raised rail barrel, glowing capacitor bank and four deployed stabiliser legs, low-poly sci-fi.",
};

void _unused;

// ---------- palette ----------
const OLIVE = "#4d5a38";
const DARK = "#262a22";
const GUN = "#30343a";
const TAN = "#8a7b52";
const BLUE = "#4fd8ff";
const ORANGE = "#ff9a1e";
const GLASS = "#1d4f66";
const RED = "#c8321f";
const CERAMIC = "#c9c2a8";
const CAMO = patches(OLIVE, ["#3b4529", "#7a6c44", "#2b3023"], { size: 0.75, gap: 0, seed: 4 });
const ARMOUR = panelled(CAMO, { size: 0.9, aspect: 0.6, rivets: 0.1 });
const STEEL = metal("steel", { tarnish: 0.3, polish: 0.2 });
const IRON = metal("iron");
const BLUED = metal("blued", { polish: 0.3 });
const TIRE = paint((_p, n, s) =>
  Math.abs(n.x) > 0.6 ? "#1b1b1d" : Math.floor(s[0] * 28) % 2 ? "#26262a" : "#18181a",
);

// ---------- textures ----------
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2b61c"/>
  ${[-8, 4, 16, 28, 40, 52, 64].map((x) => `<path d="M${x} 16 L${x + 16} 0" stroke="#15151a" stroke-width="7"/>`).join("")}</svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1a1d18" stroke="#e8e0c0" stroke-width="3"/>
  <polygon points="32,10 37,26 54,26 40,36 45,52 32,42 19,52 24,36 10,26 27,26" fill="#e8e0c0"/>
  <path d="M8 32 H56" stroke="#4fd8ff" stroke-width="3"/><circle cx="32" cy="32" r="4" fill="#4fd8ff"/></svg>`,
  { size: 128 },
);
const WARNING = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#f2b61c" stroke="#15151a" stroke-width="4"/>
  <path d="M36 8 L16 36 H30 L26 58 L48 26 H34Z" fill="#15151a"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 90 50"><rect width="90" height="50" fill="#06202e"/>
  <path d="M4 36 L16 36 L22 12 L30 40 L38 20 L46 34 L60 34 L68 8 L76 38 L86 30" stroke="#4fd8ff" stroke-width="2.5" fill="none"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${6 + i * 14}" y="44" width="10" height="3" fill="${i < 5 ? "#4fd8ff" : "#ff9a1e"}"/>`).join("")}
  <path d="M0 24 H90" stroke="#1b5a73" stroke-width="0.6"/></svg>`,
  { size: 160 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 20"><rect width="64" height="20" rx="2" fill="#d8d2b0" stroke="#15151a" stroke-width="2"/>
  <text x="32" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#15151a">RG-06</text></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- skeleton ----------
  const hull = b.joint("hull", { at: [0, 1.2, 0], dir: [0, 1, 0], role: "spine" });
  const turret = b.joint("turret", { parent: hull, at: [0, 2.0, -1.8], dir: [0, 1, 0], role: "hinge" });
  const E = (10 * Math.PI) / 180;
  const F = new THREE.Vector3(0, Math.sin(E), Math.cos(E));
  const U = new THREE.Vector3(0, Math.cos(E), -Math.sin(E));
  const O = new THREE.Vector3(0, 2.95, -1.8);
  const gun = b.joint("gun", { parent: turret, at: O.toArray() as [number, number, number], dir: F.toArray() as [number, number, number], role: "hinge" });
  const gp = (d: number, x = 0, y = 0) =>
    O.clone().addScaledVector(F, d).addScaledVector(U, y).add(new THREE.Vector3(x, 0, 0));

  // ---------- helpers ----------
  const box = (size: [number, number, number], color: any, at: number[], bone?: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at: at as [number, number, number], bone, ...extra });
  const cyl = (r: number, h: number, sides: number, color: any, at: number[], dir: number[], bone?: any) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at: at as [number, number, number], dir: dir as [number, number, number], bone });
  const gbox = (size: [number, number, number], color: any, d: number, x = 0, y = 0) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone: gun, at: gp(d, x, y), dir: F, axis: "z" });
  const gcyl = (r: number, len: number, color: any, d: number, x = 0, y = 0, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { bone: gun, at: gp(d, x, y), dir: F });
  const flat = (w: number, h: number, tex: any, at: number[], dir: number[], bone?: any, color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, {
      at: at as [number, number, number], dir: dir as [number, number, number], axis: "z", texture: tex, bone,
    });

  // ---------- hull ----------
  box([2.6, 0.6, 9.4], ARMOUR, [0, 1.2, 0.2], hull);
  box([2.3, 0.35, 9.0], DARK, [0, 0.8, 0.2], hull);
  box([2.7, 0.08, 9.5], IRON, [0, 1.52, 0.2], hull);
  // sloped front glacis and rear plate
  box([2.5, 0.5, 0.5], ARMOUR, [0, 1.15, 4.95], hull, { rotation: [-18, 0, 0] });
  box([2.7, 0.3, 0.3], GUN, [0, 0.85, 5.05], hull);
  box([2.4, 0.4, 0.3], ARMOUR, [0, 1.1, -4.6], hull);
  // side conduits, skirts and tool boxes
  for (const s of [1, -1]) {
    b.rod([s * 1.32, 1.35, -4.2], [s * 1.32, 1.35, 4.4], 0.05, STEEL, { bone: hull });
    b.rod([s * 1.32, 1.05, -4.2], [s * 1.32, 1.05, 4.4], 0.04, DARK, { bone: hull });
    box([0.3, 0.42, 1.4], GUN, [s * 1.45, 1.05, -1.1], hull);
    box([0.04, 0.34, 1.2], TAN, [s * 1.61, 1.05, -1.1], hull);
    flat(0.6, 0.15, HAZARD, [s * 1.62, 1.4, -1.1], [s, 0, 0], hull);
  }
  // front lights and plate
  for (const s of [1, -1]) {
    glow(box([0.4, 0.2, 0.06], "#fff3c0", [s * 0.9, 1.35, 5.2], hull, { rotation: [-18, 0, 0] }), 1.4);
    box([0.5, 0.28, 0.04], DARK, [s * 0.9, 1.35, 5.17], hull, { rotation: [-18, 0, 0] });
    glow(box([0.18, 0.12, 0.05], RED, [s * 1.15, 0.86, -4.76], hull), 1.2);
  }
  flat(0.7, 0.22, PLATE, [0, 0.88, 5.22], [0, 0, 1], hull);
  // tow hooks
  for (const s of [1, -1]) box([0.12, 0.12, 0.35], BLUED, [s * 0.6, 0.62, 5.2], hull);

  // ---------- cab ----------
  const cabProfile: [number, number, "sharp"][] = [
    [-1, 0, "sharp"], [1.2, 0, "sharp"], [1.2, 0.5, "sharp"], [0.7, 1.1, "sharp"], [-0.1, 1.2, "sharp"], [-1, 1.2, "sharp"],
  ];
  b.extrude(cabProfile, { at: [0, 1.56, 3.6], x: [0, 0, 1], thickness: 2.2, bevel: 0.04, color: ARMOUR, bone: hull });
  b.extrude(
    [[-1, 0, "sharp"], [1.0, 0, "sharp"], [0.6, 0.1, "sharp"], [-1, 0.1, "sharp"]],
    { at: [0, 2.75, 3.6], x: [0, 0, 1], thickness: 2.0, color: GUN, bone: hull },
  );
  const nrm = new THREE.Vector3(0, 0.64, 0.77);
  const ws = b.part(new THREE.BoxGeometry(2.0, 0.72, 0.05), GLASS, {
    at: [0, 2.36, 4.55] as any, dir: nrm, axis: "z", bone: hull,
  });
  glow(ws, 0.35);
  box([2.1, 0.06, 0.06], DARK, [0, 2.0, 4.7], hull, { rotation: [-40, 0, 0] });
  for (const s of [1, -1]) {
    glow(box([0.04, 0.5, 0.95], GLASS, [s * 1.1, 2.4, 3.9], hull), 0.35);
    box([0.05, 0.7, 0.9], ARMOUR, [s * 1.11, 2.05, 3.0], hull);
    flat(0.5, 0.5, EMBLEM, [s * 1.15, 2.0, 3.0], [s, 0, 0], hull);
    // mirror
    b.rod([s * 1.1, 2.3, 4.3], [s * 1.5, 2.45, 4.35], 0.025, DARK, { bone: hull });
    box([0.06, 0.3, 0.2], GUN, [s * 1.52, 2.4, 4.35], hull);
    // exhaust stack
    cyl(0.1, 1.5, 8, STEEL, [s * 0.95, 2.3, 2.35], [0, 1, 0], hull);
    cyl(0.14, 0.12, 8, DARK, [s * 0.95, 3.05, 2.35], [0, 1, 0], hull);
    // cab roof beacon
    glow(box([0.16, 0.1, 0.16], ORANGE, [s * 0.5, 2.88, 3.9], hull), 1.5);
  }
  // roof sensors
  b.rod([-0.7, 2.85, 3.2], [-0.7, 4.0, 3.1], 0.018, STEEL, { bone: hull });
  b.rod([0.75, 2.85, 3.2], [0.75, 3.7, 3.15], 0.015, STEEL, { bone: hull });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [-0.7, 4.02, 3.1], bone: hull }), 1.5);
  cyl(0.06, 0.4, 6, GUN, [0.1, 3.0, 3.2], [0, 1, 0], hull);
  b.part(new THREE.CylinderGeometry(0.4, 0.06, 0.14, 10), STEEL, { at: [0.1, 3.28, 3.3], dir: [0, 0.8, 0.6], bone: hull });
  b.part(new THREE.ConeGeometry(0.04, 0.2, 5), CERAMIC, { at: [0.1, 3.3, 3.42], dir: [0, 0.8, 0.6], bone: hull });

  // ---------- wheels ----------
  const rows = [{ n: "F", z: 3.4 }, { n: "M", z: 0.4 }, { n: "R", z: -2.6 }];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const r of rows) {
      const j = b.joint(`wheel${r.n}${side}`, { parent: hull, at: [s * 1.45, 0.71, r.z], dir: [s, 0, 0], group: "wheels" });
      const c = [s * 1.45, 0.71, r.z];
      b.part(new THREE.CylinderGeometry(0.72, 0.72, 0.56, 14), TIRE, { at: c as any, dir: [1, 0, 0], bone: j });
      cyl(0.44, 0.6, 10, IRON, c, [1, 0, 0], j);
      cyl(0.36, 0.62, 10, STEEL, c, [1, 0, 0], j);
      cyl(0.13, 0.7, 8, BLUED, c, [1, 0, 0], j);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.035, 0.68, 6, DARK, [s * 1.45, 0.71 + Math.sin(a) * 0.25, r.z + Math.cos(a) * 0.25], [1, 0, 0], j);
      }
      // fender and mud flap
      box([0.75, 0.08, 1.7], ARMOUR, [s * 1.45, 1.56, r.z], hull);
      box([0.75, 0.3, 0.06], DARK, [s * 1.45, 1.35, r.z - 0.85], hull);
      box([0.75, 0.3, 0.06], DARK, [s * 1.45, 1.35, r.z + 0.85], hull);
    }
  }
  for (const r of rows) {
    b.rod([-1.4, 0.71, r.z], [1.4, 0.71, r.z], 0.09, DARK, { bone: hull });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), GUN, { at: [0, 0.71, r.z], bone: hull });
  }

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    for (const r of [{ n: "F", z: 2.0 }, { n: "R", z: -4.0 }]) {
      const side = s > 0 ? "L" : "R";
      const j = b.joint(`stab${r.n}${side}`, { parent: hull, at: [s * 1.3, 1.15, r.z], dir: [s, 0, 0], group: "stabilisers", role: "leg" });
      box([1.5, 0.36, 0.5], GUN, [s * 2.0, 1.15, r.z], j);
      box([1.5, 0.05, 0.4], ARMOUR, [s * 2.0, 1.35, r.z], j);
      flat(1.2, 0.3, HAZARD, [s * 2.0, 1.385, r.z], [0, 1, 0], j);
      cyl(0.19, 0.8, 8, BLUED, [s * 2.7, 0.85, r.z], [0, 1, 0], j);
      cyl(0.11, 0.7, 8, STEEL, [s * 2.7, 0.4, r.z], [0, 1, 0], j);
      b.rod([s * 1.35, 0.78, r.z], [s * 2.62, 0.6, r.z], 0.06, IRON, { bone: j });
      cyl(0.5, 0.22, 8, DARK, [s * 2.7, 0.1, r.z], [0, 1, 0], j);
      cyl(0.36, 0.1, 8, TAN, [s * 2.7, 0.24, r.z], [0, 1, 0], j);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        box([0.08, 0.1, 0.08], STEEL, [s * 2.7 + Math.cos(a) * 0.4, 0.26, r.z + Math.sin(a) * 0.4], j);
      }
      glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), ORANGE, { at: [s * 2.7, 1.38, r.z + 0.18], bone: j }), 1.5);
    }
  }

  // ---------- capacitor bank ----------
  box([2.1, 0.9, 1.4], ARMOUR, [0, 1.97, -3.8], hull);
  box([2.2, 0.08, 1.5], GUN, [0, 2.45, -3.8], hull);
  for (let i = 0; i < 4; i++) {
    const x = -0.75 + i * 0.5;
    cyl(0.2, 0.5, 8, BLUED, [x, 2.74, -3.8], [0, 1, 0], hull);
    glow(cyl(0.21, 0.06, 8, BLUE, [x, 2.88, -3.8], [0, 1, 0], hull), 1.6);
  }
  for (const s of [1, -1]) {
    glow(flat(0.95, 0.53, SCREEN, [s * 1.07, 2.0, -3.8], [s, 0, 0], hull), 1.1);
    glow(box([0.04, 0.06, 1.2], BLUE, [s * 1.07, 1.65, -3.8], hull), 1.5);
  }
  flat(0.5, 0.5, WARNING, [0, 1.97, -4.51], [0, 0, -1], hull);
  // cable run to turret
  b.sweep([[0.6, 2.3, -3.1], [0.6, 2.0, -2.6], [0.5, 1.8, -2.4]], 0.05, { bone: hull, color: DARK });
  b.sweep([[-0.6, 2.3, -3.1], [-0.6, 2.0, -2.6], [-0.5, 1.8, -2.4]], 0.05, { bone: hull, color: DARK });

  // ---------- turret ----------
  b.part(new THREE.CylinderGeometry(1.15, 1.2, 0.3, 14), ARMOUR, { at: [0, 1.7, -1.8], bone: turret });
  b.part(new THREE.CylinderGeometry(0.95, 1.1, 0.35, 12), GUN, { at: [0, 1.95, -1.8], bone: turret });
  box([2.0, 0.35, 1.2], ARMOUR, [0, 2.2, -2.0], turret);
  for (const s of [1, -1]) {
    box([0.28, 1.2, 1.2], ARMOUR, [s * 0.9, 2.7, -1.8], turret);
    box([0.3, 0.2, 0.9], GUN, [s * 0.9, 3.35, -1.8], turret);
    cyl(0.18, 0.3, 8, STEEL, [s * 1.0, 2.95, -1.8], [1, 0, 0], turret);
    // elevation ram
    b.rod([s * 0.6, 2.35, -2.8], gp(0.4, s * 0.55, -0.5).toArray(), 0.09, STEEL, { bone: turret });
    b.rod([s * 0.6, 2.35, -2.8], gp(-0.3, s * 0.55, -0.5).toArray(), 0.14, BLUED, { bone: turret });
  }
  // hand rail ladder on turret rear
  box([0.9, 0.9, 0.3], ARMOUR, [0, 2.7, -2.7], turret);

  // ---------- railgun ----------
  cyl(0.18, 2.1, 8, STEEL, O.toArray(), [1, 0, 0], gun);
  gbox([1.3, 0.75, 2.2], ARMOUR, 0.2);
  gbox([1.0, 0.5, 0.6], GUN, -1.0);
  gbox([1.35, 0.15, 2.2], GUN, 0.2, 0, 0.4);
  glow(gbox([0.5, 0.06, 0.5], BLUE, -1.0, 0, 0.28), 1.3);
  for (const s of [1, -1]) {
    gcyl(0.1, 2.2, STEEL, 0.4, s * 0.55, -0.5);
    gcyl(0.06, 1.6, IRON, 1.7, s * 0.55, -0.5);
  }
  // rails
  for (const s of [1, -1]) {
    gbox([0.2, 0.36, 8.0], STEEL, 5.3, s * 0.24, 0);
    gbox([0.06, 0.3, 7.8], BLUED, 5.3, s * 0.36, 0);
    gbox([0.08, 0.08, 7.8], CERAMIC, 5.3, s * 0.12, 0.2);
  }
  glow(gbox([0.18, 0.1, 8.0], BLUE, 5.3, 0, 0), 1.8);
  // coil frames along the barrel
  for (let i = 0; i < 6; i++) {
    const d = 2.0 + i * 1.25;
    for (const s of [1, -1]) gbox([0.12, 0.8, 0.28], i % 2 ? GUN : BLUED, d, s * 0.56, 0);
    gbox([1.24, 0.12, 0.28], GUN, d, 0, 0.44);
    gbox([1.24, 0.12, 0.28], GUN, d, 0, -0.44);
    glow(gbox([0.9, 0.05, 0.3], BLUE, d, 0, 0.51), 1.4);
    gbox([0.6, 0.06, 0.06], CERAMIC, d + 0.55, 0, 0.3);
  }
  // spine bracing under the barrel
  gbox([0.3, 0.2, 6.0], GUN, 4.6, 0, -0.32);
  // muzzle
  gbox([0.95, 0.6, 0.55], ARMOUR, 9.35);
  gbox([0.7, 0.4, 0.1], DARK, 9.65);
  glow(gbox([0.18, 0.14, 0.06], BLUE, 9.72), 2);
  for (const s of [1, -1]) {
    gbox([0.08, 0.5, 0.5], STEEL, 9.35, s * 0.5);
    flat(0.5, 0.15, HAZARD, gp(9.0, s * 0.58, 0).toArray(), [s, 0, 0], gun);
  }
  gbox([0.9, 0.06, 0.5], STEEL, 9.35, 0, 0.33);

  // ---------- extras: cab-mounted rear marker lights ----------
  for (const s of [1, -1]) {
    glow(box([0.14, 0.14, 0.05], ORANGE, [s * 1.2, 2.55, 2.58], hull), 1.2);
  }

  return b.root;
}
```