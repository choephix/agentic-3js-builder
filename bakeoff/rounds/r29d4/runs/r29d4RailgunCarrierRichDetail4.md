```ts
import * as THREE from "three";
import { createBuilder, mottle, countershade, paint, mix, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

type V3 = [number, number, number];
const OLIVE = "#6a7350", DARK = "#2b2f33", STEEL = "#8a9096", TYRE = "#1d1e21", LIGHT = "#ffe9a0";
const GLASS = "#5fc9e8", CYAN = "#3df0ff", HAZ = "#e8b82a", RED = "#c43a2a", TAN = "#a89a6a";

const HULL = countershade(mottle(OLIVE, "#4d5638", { size: 0.6, seed: 3 }), "#3b4130", { level: -0.5 });
const PLATE = paint((p, n) => {
  const base = mix("#5b6446", "#7a835c", noise(p, 0.35, 8));
  return mix(base, "#25282a", 0.5 * Math.max(0, -n.y) + 0.25 * noise(p, 0.08, 4));
});
const METAL = paint((p, n) => mix("#5c6268", "#a4abb2", 0.5 * noise(p, 0.2, 2) + 0.4 * Math.max(0, n.y)));

const chevrons = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8b82a"/>
  ${[0, 1, 2, 3, 4].map((i) => `<path d="M${i * 16 - 6} 0 L${i * 16 + 4} 0 L${i * 16 + 18} 32 L${i * 16 + 8} 32Z" fill="#1b1b1b"/>`).join("")}</svg>`,
  { size: 128 },
);
const emblem = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1d2024" stroke="#e8b82a" stroke-width="5"/>
  <path d="M20 62 L80 62 M20 50 L80 50" stroke="#3df0ff" stroke-width="6"/>
  <path d="M30 70 L50 22 L70 70Z" fill="none" stroke="#e8b82a" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="5" fill="#c43a2a"/></svg>`,
  { size: 128 },
);
const stencil = svg(
  `<svg viewBox="0 0 120 50"><text x="60" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="42" fill="#e9e6d0" stroke="#111" stroke-width="1.5">RG-6</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const chassis = b.joint("chassis", { at: [0, 1.0, 0], role: "spine" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const put = (g: THREE.BufferGeometry, c: any, at: V3, bone: any = chassis, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });

  // ---- hull
  put(box(3.0, 0.9, 7.6), HULL, [0, 1.35, -0.2]);
  put(box(3.2, 0.12, 7.8), DARK, [0, 0.88, -0.2]); // belly skid
  put(box(2.6, 0.2, 5.4), PLATE, [0, 1.9, -1.0]); // deck plate
  for (const s of [1, -1]) {
    put(box(0.12, 0.7, 6.8), PLATE, [s * 1.55, 1.4, -0.4]); // side armour
    for (let i = 0; i < 6; i++) put(box(0.16, 0.5, 0.05), DARK, [s * 1.6, 1.4, -3.3 + i * 1.2]); // seams
    for (let i = 0; i < 12; i++) put(cyl(0.04, 0.05, 6), STEEL, [s * 1.63, 1.1 + (i % 2) * 0.6, -3.5 + Math.floor(i / 2) * 1.2], chassis, { rotation: [0, 0, 90] });
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", { bone: chassis, at: [s * 1.64, 1.55, -0.6], dir: [s, 0, 0], axis: "z", texture: emblem });
    b.part(new THREE.PlaneGeometry(1.2, 0.5), "#ffffff", { bone: chassis, at: [s * 1.64, 1.1, 1.0], dir: [s, 0, 0], axis: "z", texture: stencil });
    put(box(0.3, 0.12, 2.0), METAL, [s * 1.2, 2.05, 0.7]); // intake grille
    for (let i = 0; i < 5; i++) put(box(0.26, 0.04, 0.05), DARK, [s * 1.2, 2.13, -0.1 + i * 0.4]);
    put(cyl(0.1, 1.0, 8), STEEL, [s * 1.3, 2.4, -3.0]); // exhaust stacks
    put(cyl(0.13, 0.06, 8), DARK, [s * 1.3, 2.93, -3.0]);
    put(box(0.5, 0.1, 0.6), HAZ, [s * 1.3, 2.02, 3.0]);
  }
  // sloped glacis and nose
  b.frustumBox([0, 1.35, 3.6], [0, 1.2, 4.3], [3.0, 0.9], [2.6, 0.6], { bone: chassis, color: HULL });
  put(box(2.4, 0.18, 0.2), DARK, [0, 0.9, 4.45]); // bumper
  for (const s of [1, -1]) {
    glow(put(box(0.4, 0.14, 0.05), LIGHT, [s * 0.9, 1.3, 4.62]));
    put(box(0.5, 0.2, 0.06), DARK, [s * 0.9, 1.3, 4.58]);
    b.part(cyl(0.05, 0.3, 6), STEEL, { bone: chassis, at: [s * 0.6, 0.85, 4.55], rotation: [90, 0, 0] });
  }
  // cab
  put(box(2.4, 0.8, 1.9), HULL, [0, 2.35, 2.5]);
  b.frustumBox([0, 2.75, 2.1], [0, 2.75, 3.5], [2.4, 0.15], [2.2, 0.15], { bone: chassis, color: PLATE });
  for (const s of [1, -1]) {
    put(box(0.05, 0.4, 1.2), GLASS, [s * 1.21, 2.45, 2.5]);
    put(box(0.1, 0.45, 0.08), DARK, [s * 1.21, 2.45, 1.85]);
  }
  put(box(1.9, 0.4, 0.06), GLASS, [0, 2.45, 3.46], chassis, { rotation: [-25, 0, 0] });
  for (let i = -2; i <= 2; i++) put(box(0.05, 0.42, 0.08), DARK, [i * 0.45, 2.45, 3.5], chassis, { rotation: [-25, 0, 0] });
  put(box(1.0, 0.1, 0.5), STEEL, [0, 2.85, 2.8]); // roof light bar
  glow(put(box(0.9, 0.05, 0.05), CYAN, [0, 2.9, 3.05]));
  put(cyl(0.3, 0.12, 8), METAL, [0.6, 2.8, 1.9]); // hatch
  put(cyl(0.03, 1.3, 5), DARK, [-0.9, 3.4, 1.7]); // whip antenna
  put(new THREE.SphereGeometry(0.05, 6, 4), RED, [-0.9, 4.05, 1.7]);

  // ---- rear: radar and tail
  put(box(2.4, 0.9, 0.3), PLATE, [0, 1.4, -4.1]);
  b.part(new THREE.PlaneGeometry(1.5, 0.45), "#ffffff", { bone: chassis, at: [0, 1.0, -4.27], dir: [0, 0, -1], axis: "z", texture: chevrons });
  for (const s of [1, -1]) {
    glow(put(box(0.3, 0.12, 0.05), RED, [s * 0.9, 1.7, -4.28]));
    put(cyl(0.1, 0.5, 6), STEEL, [s * 0.5, 0.95, -4.3], chassis, { rotation: [90, 0, 0] }); // tow eye
  }

  // ---- wheels
  const zs = [2.8, 0.2, -2.4];
  for (const s of [1, -1])
    for (const z of zs) {
      const tag = `${s > 0 ? "L" : "R"}${zs.indexOf(z)}`;
      put(box(0.7, 0.08, 1.5), HULL, [s * 1.85, 1.35, z]); // fender
      put(box(0.7, 0.35, 0.08), HULL, [s * 1.85, 1.2, z + 0.78]);
      put(box(0.7, 0.35, 0.08), HULL, [s * 1.85, 1.2, z - 0.78]);
      b.rod([s * 1.1, 0.7, z], [s * 1.55, 0.6, z], 0.1, DARK, { bone: chassis, sides: 6 }); // axle
      const j = b.joint(`wheel${tag}`, { parent: chassis, at: [s * 1.75, 0.6, z], dir: [0, 1, 0], role: "hinge" });
      const at = (dx = 0): V3 => [s * 1.75 + dx, 0.6, z];
      put(cyl(0.5, 0.5, 14), TYRE, at(), j, { rotation: [0, 0, 90], flat: true });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        put(box(0.52, 0.08, 0.14), TYRE, [s * 1.75, 0.6 + 0.57 * Math.cos(a), z + 0.57 * Math.sin(a)], j, { rotation: [(a * 180) / Math.PI, 0, 0] });
      }
      put(cyl(0.3, 0.56, 10), METAL, at(), j, { rotation: [0, 0, 90], flat: true });
      put(cyl(0.2, 0.1, 10), DARK, at(s * 0.28), j, { rotation: [0, 0, 90] });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        put(cyl(0.025, 0.05, 6), STEEL, [s * 2.05, 0.6 + 0.25 * Math.cos(a), z + 0.25 * Math.sin(a)], j, { rotation: [0, 0, 90] });
      }
      put(cyl(0.07, 0.14, 6), STEEL, at(s * 0.34), j, { rotation: [0, 0, 90] });
    }

  // ---- stabiliser legs
  for (const s of [1, -1])
    for (const z of [1.5, -1.1]) {
      const tag = `${s > 0 ? "L" : "R"}${z > 0 ? "F" : "R"}`;
      const arm = b.joint(`outrigger${tag}`, { parent: chassis, at: [s * 1.5, 1.45, z], dir: [s, 0, 0], role: "hinge" });
      b.rod([s * 1.5, 1.45, z], [s * 2.55, 1.45, z], 0.14, HULL, { bone: arm, section: "box" });
      const leg = b.joint(`leg${tag}`, { parent: arm, at: [s * 2.55, 1.45, z], dir: [0, -1, 0], role: "leg" });
      b.rod([s * 2.55, 1.5, z], [s * 2.65, 0.55, z], 0.17, METAL, { bone: leg, sides: 8 }); // cylinder
      b.rod([s * 2.65, 0.8, z], [s * 2.7, 0.15, z], 0.09, STEEL, { bone: leg, sides: 6 }); // piston
      put(cyl(0.19, 0.1, 8), DARK, [s * 2.65, 0.9, z], leg);
      put(cyl(0.45, 0.12, 10), DARK, [s * 2.7, 0.06, z], leg, { flat: true }); // foot pad
      put(cyl(0.34, 0.06, 10), HAZ, [s * 2.7, 0.14, z], leg, { flat: true });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        put(cyl(0.03, 0.04, 6), STEEL, [s * 2.7 + 0.4 * Math.sin(a) * 0.9, 0.16, z + 0.4 * Math.cos(a) * 0.9], leg);
      }
      b.rod([s * 1.7, 1.15, z], [s * 2.5, 1.4, z], 0.05, STEEL, { bone: arm, sides: 6 }); // brace
      put(box(0.3, 0.3, 0.3), PLATE, [s * 1.5, 1.45, z], arm);
    }

  // ---- turret and railgun
  const ringY = 2.0, tz = -1.4;
  put(new THREE.TorusGeometry(0.95, 0.08, 6, 16), STEEL, [0, ringY + 0.03, tz], chassis, { rotation: [90, 0, 0] });
  const yaw = b.joint("yaw", { parent: chassis, at: [0, ringY + 0.05, tz], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  put(cyl(0.9, 0.45, 12), HULL, [0, ringY + 0.3, tz], yaw, { flat: true });
  for (const s of [1, -1]) {
    put(box(0.25, 1.0, 1.4), PLATE, [s * 0.75, ringY + 0.95, tz], yaw);
    put(box(0.5, 0.4, 0.7), DARK, [s * 1.1, ringY + 0.6, tz - 0.4], yaw);
  }
  put(box(1.4, 0.3, 1.0), HULL, [0, ringY + 0.65, tz - 0.6], yaw);
  const py = ringY + 1.0;
  const pitch = b.joint("pitch", { parent: yaw, at: [0, py, tz], dir: [0, 0, 1], role: "hinge" });
  put(box(1.0, 0.8, 1.6), HULL, [0, py, tz - 0.6], pitch); // breech
  put(box(0.9, 0.6, 0.06), TAN, [0, py, tz - 1.43], pitch);
  for (const s of [1, -1]) {
    put(box(0.18, 0.26, 5.6), METAL, [s * 0.24, py, tz + 2.3], pitch); // rails
    put(box(0.05, 0.1, 5.4), DARK, [s * 0.35, py + 0.17, tz + 2.3], pitch);
    glow(put(box(0.04, 0.12, 4.8), CYAN, [s * 0.14, py, tz + 2.2], pitch));
    for (let i = 0; i < 3; i++) {
      put(cyl(0.22, 0.9, 10), DARK, [s * 0.75, py - 0.15, tz - 0.2 + i * 1.0], pitch, { rotation: [90, 0, 0], flat: true });
      glow(put(new THREE.TorusGeometry(0.2, 0.03, 5, 10), CYAN, [s * 0.75, py - 0.15, tz + 0.27 + i * 1.0], pitch));
    }
  }
  for (let i = 0; i < 5; i++) {
    put(box(0.7, 0.5, 0.1), STEEL, [0, py, tz + 0.6 + i * 1.1], pitch); // clamps
    put(box(0.18, 0.6, 0.12), DARK, [0, py + 0.05, tz + 0.6 + i * 1.1], pitch);
  }
  put(box(0.7, 0.4, 0.4), DARK, [0, py, tz + 5.2], pitch); // muzzle brake
  glow(put(box(0.2, 0.1, 0.05), CYAN, [0, py, tz + 5.42], pitch));
  for (const s of [1, -1])
    b.rod([s * 0.75, py + 0.1, tz - 0.4], [s * 0.3, py + 0.25, tz + 3.0], 0.03, DARK, { bone: pitch, sides: 5 }); // cables
  put(box(0.5, 0.1, 0.8), HAZ, [0, py + 0.45, tz - 0.4], pitch);
  b.pose(pitch, { axis: [1, 0, 0], deg: -6 });

  return b.root;
}
```