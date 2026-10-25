```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

const HULL = "#5b6b4a";
const HULL2 = "#46543a";
const DARK = "#23272b";
const STEEL = "#8a9299";
const TIRE = "#17181a";
const HAZARD = "#e0b020";
const GLOW = "#4fd8ff";
const WHITE = "#e8ecef";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const R = rng(5);

  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const turret = b.joint("turret", { parent: chassis, at: [0, 1.5, -0.6], dir: [0, 1, 0] });
  const elev = b.joint("elevation", { parent: turret, at: [0, 0.75, 0.2], dir: [0, 0, 1], role: "hinge" });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = chassis, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });

  // Hull
  box(2.6, 0.7, 7.2, HULL, [0, 1.15, 0]);
  box(2.2, 0.35, 6.6, HULL2, [0, 0.7, 0]);
  // sloped front glacis
  b.extrude([[0, 0], [2.6, 0], [2.6, 0.5], [0, 0.9]].map(([x, y]) => [x, y] as [number, number]), {
    at: [0, 0.8, 3.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: HULL, bone: chassis,
  });
  b.part(new THREE.CylinderGeometry(0.0, 1, 1, 4), HULL, { bone: chassis, at: [0, 1.5, 3.9], scale: [1.4, 0.01, 0.01], rotation: [0, 45, 0] });
  b.extrude([[-1.3, 0], [1.3, 0], [1.1, 0.5], [-1.1, 0.5]], {
    at: [0, 1.5, 3.6], x: [1, 0, 0], y: [0, 0.3, 1], thickness: 0.7, color: HULL2, bone: chassis,
  });
  // cab
  box(1.9, 0.8, 1.6, HULL2, [0, 1.95, 2.5]);
  box(1.7, 0.35, 0.08, GLOW, [0, 2.05, 3.32], chassis, [-12, 0, 0]);
  glow(b.part(new THREE.BoxGeometry(1.6, 0.3, 0.05), GLOW, { bone: chassis, at: [0, 2.08, 3.33], rotation: [-12, 0, 0] }), 1.2);
  // side skirts + hazard stripes
  for (const s of [1, -1]) {
    box(0.15, 0.55, 6.4, HULL2, [s * 1.38, 1.0, 0]);
    for (let i = 0; i < 6; i++)
      box(0.17, 0.5, 0.18, i % 2 ? HAZARD : DARK, [s * 1.4, 1.0, -2.8 + i * 0.35 + 5.3 * 0], chassis, [0, 0, 0]);
    box(0.2, 0.2, 5.5, DARK, [s * 1.3, 0.55, 0]);
  }
  // rear deck, vents
  box(2.2, 0.25, 2.2, STEEL, [0, 1.6, -2.7]);
  for (let i = 0; i < 5; i++) box(1.8, 0.05, 0.1, DARK, [0, 1.75, -3.4 + i * 0.3]);
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 2.3, 2.0], [s * 0.9, 3.4, 1.9], 0.025, STEEL, { bone: chassis });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), HAZARD, { bone: chassis, at: [s * 0.9, 3.42, 1.9] });
  }
  // Headlights
  for (const s of [1, -1]) glow(b.part(new THREE.BoxGeometry(0.3, 0.14, 0.05), WHITE, { bone: chassis, at: [s * 0.95, 1.05, 3.62] }), 1.5);

  // Wheels: 3 axles
  const zs = [2.5, 0, -2.5];
  const rim = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#777"/><circle cx="32" cy="32" r="22" fill="#333"/><circle cx="32" cy="32" r="10" fill="#aaa"/><g stroke="#999" stroke-width="4"><path d="M32 12V52M12 32H52M18 18L46 46M46 18L18 46"/></g></svg>`, { size: 128 });
  for (const s of [1, -1])
    zs.forEach((z, i) => {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: chassis, at: [s * 1.55, 0.62, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10), TIRE, { bone: w, at: [s * 1.55, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CircleGeometry(0.4, 10), "#ffffff", { bone: w, at: [s * 1.84, 0.62, z], dir: [s, 0, 0], axis: "z", texture: rim });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), STEEL, { bone: w, at: [s * 1.86, 0.62, z], dir: [1, 0, 0] });
      box(0.5, 0.12, 0.9, DARK, [s * 1.2, 0.95, z]);
      b.part(new THREE.BoxGeometry(0.75, 0.1, 1.4), HULL, { bone: chassis, at: [s * 1.62, 1.28, z], rotation: [0, 0, 0] });
    });

  // Stabiliser legs
  const feet: [number, number][] = [[1, 3.3], [-1, 3.3], [1, -3.3], [-1, -3.3]];
  feet.forEach(([s, z], i) => {
    const side = s > 0 ? "L" : "R";
    const tag = `${side}${z > 0 ? "F" : "B"}`;
    const hip = [s * 1.4, 1.0, z * 0.85];
    const knee = [s * 2.3, 1.1, z * 1.0];
    const foot = [s * 2.9, 0.08, z * 1.05];
    const ch = b.chain(`stab${tag}`, [hip, knee, foot], { parent: chassis, names: [`stabHip${tag}`, `stabLeg${tag}`], role: "leg" });
    b.sweep(ch, [0.14, 0.12], { color: HULL2, sides: 6 });
    b.rod(knee, [knee[0], knee[1] - 0.05, knee[2]], 0.18, DARK, { bone: ch.joints[0] });
    b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.14, 8), STEEL, { bone: ch.joints[1], at: [foot[0], 0.07, foot[2]] });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), HAZARD, { bone: ch.joints[1], at: [foot[0], 0.16, foot[2]] });
    // hydraulic piston
    b.rod([s * 1.6, 1.5, z * 0.85], [s * 2.5, 0.7, z * 1.0], 0.05, STEEL, { bone: ch.joints[0] });
  });

  // Turret
  b.part(new THREE.CylinderGeometry(1.25, 1.35, 0.2, 12), DARK, { bone: chassis, at: [0, 1.58, -0.6] });
  b.part(new THREE.CylinderGeometry(1.0, 1.2, 0.7, 8), HULL, { bone: turret, at: [0, 1.95, -0.6] });
  box(1.8, 0.5, 1.6, HULL2, [0, 2.5, -0.9], turret);
  for (const s of [1, -1]) {
    box(0.5, 1.0, 1.8, HULL, [s * 1.1, 2.55, -0.3], turret);
    box(0.1, 0.5, 0.9, HAZARD, [s * 1.37, 2.55, -0.3], turret);
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8), STEEL, { bone: turret, at: [s * 1.3, 2.4, 0.7], dir: [1, 0, 0] });
  }
  // sensor head
  b.part(new THREE.SphereGeometry(0.22, 8, 6), DARK, { bone: turret, at: [0.6, 3.0, -1.0] });
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), GLOW, { bone: turret, at: [0.6, 3.0, -0.82] }), 2);

  // Railgun on elevation hinge
  b.part(new THREE.BoxGeometry(1.0, 0.8, 1.6), DARK, { bone: elev, at: [0, 2.7, 0.3] });
  for (const s of [1, -1]) {
    b.rod([s * 0.38, 2.7, 0.8], [s * 0.38, 2.7, 6.6], 0.14, STEEL, { bone: elev, sides: 4 });
    b.rod([s * 0.38, 2.7, 6.6], [s * 0.38, 2.7, 6.85], 0.18, HAZARD, { bone: elev, sides: 4 });
  }
  // coils along the rails
  for (let i = 0; i < 7; i++) {
    const z = 1.5 + i * 0.75;
    b.part(new THREE.BoxGeometry(1.2, 0.6, 0.22), i % 2 ? HULL : DARK, { bone: elev, at: [0, 2.7, z] });
    glow(b.part(new THREE.BoxGeometry(0.5, 0.08, 0.24), GLOW, { bone: elev, at: [0, 2.7, z] }), 1.5 + R() * 0.5);
  }
  // capacitor banks on rear
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.9, 6), i % 2 ? STEEL : HULL, { bone: elev, at: [-0.3 + i * 0.2, 3.25, 0.5], dir: [0, 0, 1], axis: "y" });
  }
  glow(b.part(new THREE.BoxGeometry(0.3, 0.05, 5), GLOW, { bone: elev, at: [0, 2.7, 4.2] }), 1);

  // Roman-numeral decal plate
  const tag = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8ecef"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#23272b" stroke-width="2"/><text x="32" y="23" text-anchor="middle" font-size="18" font-family="monospace" font-weight="bold" fill="#23272b">RG-06</text></svg>`, { size: 128 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", { bone: chassis, at: [s * 1.47, 1.2, -1.2], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: tag });

  return b.root;
}
```