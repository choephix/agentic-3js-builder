```ts
import * as THREE from "three";
import { createBuilder, patches, stripes, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Vanta NX-77 Armored Hauler",
  description: "Low-poly cyberpunk 6x6 militarized truck from 2077: reactive armor cab, rocket pod, twin reactors, neon underglow.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  // ---------- palette ----------
  const CYAN = "#37f2ff";
  const MAG = "#ff2bd6";
  const AMBER = "#ffa31a";
  const RED = "#ff2438";
  const DARK = "#12141a";
  const TIRE = "#1b1c21";
  const STEEL = "#4a505c";
  const OLIVE = "#2f3629";
  const OLIVE2 = "#3b4332";
  const BLACKGLASS = "#0a1218";

  const CAMO = patches("#262b33", ["#2f3640", "#1d2128", "#3a4030", "#2a2f38"], { size: 0.55, gap: 0.04, seed: 5 });
  const BODY = panelled(CAMO, { size: 0.45, rivets: 0.07 });
  const PLATE = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.35, rivets: 0.06 });
  const HAZ = stripes("#d9a520", "#101010", { size: 0.14, axis: [1, 1, 0], width: 0.5, wobble: 0.02 });
  const HUB = metal("steel", { polish: 0.3 });
  const GUN = metal("blued", { tarnish: 0.4 });

  // ---------- textures ----------
  const HUD = svg(
    `<svg viewBox="0 0 220 80"><rect width="220" height="80" fill="#07131b"/>
    <path d="M0 0H220V80H0Z" fill="#0c2a36" opacity="0.5"/>
    <g stroke="#37f2ff" stroke-width="2" fill="none">
    <circle cx="110" cy="40" r="20"/><path d="M110 10V28M110 52V70M80 40H98M122 40H140"/>
    <path d="M10 14H60L70 24M210 14H160L150 24" stroke="#ff2bd6"/>
    <path d="M10 66H50M170 66H210"/></g>
    <text x="14" y="30" font-family="monospace" font-size="9" fill="#37f2ff">TGT LOCK 0.83</text>
    <text x="150" y="60" font-family="monospace" font-size="9" fill="#ff2bd6">V 092 KPH</text>
    <path d="M0 0L60 80H40L0 30Z" fill="#9ff" opacity="0.12"/></svg>`,
    { size: 256 },
  );
  const GLASS = svg(
    `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#0a1a24"/>
    <path d="M0 40L30 0H42L12 40Z" fill="#37f2ff" opacity="0.18"/>
    <path d="M30 40L60 0H66L36 40Z" fill="#ff2bd6" opacity="0.15"/>
    <rect x="1" y="1" width="78" height="38" fill="none" stroke="#37f2ff" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100">
    <path d="M50 4L92 20V52C92 76 70 92 50 98C30 92 8 76 8 52V20Z" fill="#101218" stroke="#ff2bd6" stroke-width="5"/>
    <path d="M50 18L80 34L50 80L20 34Z" fill="none" stroke="#37f2ff" stroke-width="4"/>
    <path d="M14 40L34 46L26 58M86 40L66 46L74 58" stroke="#37f2ff" stroke-width="3" fill="none"/>
    <text x="50" y="58" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#ffa31a">77</text></svg>`,
    { size: 192 },
  );
  const PLATEX = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="#0d1016" stroke="#37f2ff" stroke-width="3"/>
    <text x="60" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#37f2ff">NX-2077</text>
    <path d="M8 34H112" stroke="#ff2bd6" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const SIDE = svg(
    `<svg viewBox="0 0 240 50"><rect width="240" height="50" fill="#14161c"/>
    <path d="M0 0H30L14 50H0Z M210 0H240V50H196Z" fill="#d9a520"/>
    <text x="120" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#37f2ff">VANTA // ARMORED LOGISTICS</text>
    <text x="120" y="42" text-anchor="middle" font-family="monospace" font-size="10" fill="#ff2bd6">HEAVY HAULER NX-77 · DO NOT APPROACH</text>
    <rect x="1" y="1" width="238" height="48" fill="none" stroke="#37f2ff" stroke-width="1.5"/></svg>`,
    { size: 512 },
  );
  const CRATE = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#3a3f2c"/>
    <rect x="4" y="4" width="56" height="56" fill="none" stroke="#ffa31a" stroke-width="3"/>
    <text x="32" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#ffa31a">AMMO</text>
    <path d="M12 42H52M12 50H52" stroke="#ffa31a" stroke-width="3"/>
    <path d="M4 4L60 60M60 4L4 60" stroke="#222" stroke-width="1" opacity="0.5"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...o });
  const lit = (w: number, h: number, d: number, color: string, at: V, k = 1.3, o: any = {}) =>
    glow(box(w, h, d, color, at, o), k);
  const plane = (w: number, h: number, tex: any, at: any, dir: any, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const SIDES = [1, -1];

  // ---------- chassis ----------
  for (const s of SIDES) {
    box(0.28, 0.32, 7.8, PLATE, [s * 0.8, 0.9, -0.05]);
    lit(0.05, 0.04, 6.2, MAG, [s * 0.8, 0.72, -0.1], 1.6);
    box(0.5, 0.06, 7.8, DARK, [s * 0.8, 0.72, -0.05]);
  }
  for (const z of [3.3, 1.6, 0.4, -1.6, -3.3]) box(1.8, 0.2, 0.25, PLATE, [0, 0.95, z]);
  box(1.7, 0.55, 2.4, PLATE, [0, 1.18, 2.8]); // engine block
  cyl(0.06, 0.06, 5.4, 8, STEEL, [0, 0.7, 0.2], { dir: [0, 0, 1] });
  for (const z of [2.7, -0.9, -2.3]) {
    cyl(0.12, 0.12, 2.6, 8, STEEL, [0, 0.65, z], { dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), PLATE, { at: [0, 0.65, z] });
  }

  // ---------- wheels ----------
  for (const s of SIDES)
    for (const z of [2.7, -0.9, -2.3]) {
      const x = s * 1.2;
      cyl(0.62, 0.62, 0.6, 12, TIRE, [x, 0.65, z], { dir: [1, 0, 0] });
      for (let k = 0; k < 12; k++) {
        const th = (k / 12) * Math.PI * 2;
        box(0.64, 0.12, 0.2, DARK, [x, 0.65 + Math.cos(th) * 0.63, z + Math.sin(th) * 0.63], {
          rotation: [(th * 180) / Math.PI, 0, 0],
        });
      }
      cyl(0.36, 0.36, 0.64, 8, HUB, [x, 0.65, z], { dir: [1, 0, 0] });
      cyl(0.16, 0.2, 0.1, 8, DARK, [x + s * 0.33, 0.65, z], { dir: [1, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.43, 0.03, 6, 16), CYAN, { at: [x + s * 0.32, 0.65, z], dir: [1, 0, 0], axis: "z" }), 1.4);
      // arch cover, lip, mud flap
      box(0.82, 0.07, 1.6, PLATE, [x, 1.36, z]);
      box(0.06, 0.28, 1.6, PLATE, [s * 1.6, 1.25, z]);
      box(0.6, 0.5, 0.05, DARK, [x, 0.92, z - 0.8]);
      lit(0.5, 0.05, 0.06, AMBER, [x, 1.14, z - 0.8], 1);
    }

  // fuel tanks and straps
  for (const s of SIDES) {
    cyl(0.3, 0.3, 1.7, 10, OLIVE2, [s * 1.1, 0.78, 0.9], { dir: [0, 0, 1] });
    for (const z of [0.35, 1.45]) cyl(0.32, 0.32, 0.07, 10, DARK, [s * 1.1, 0.78, z], { dir: [0, 0, 1] });
    lit(0.1, 0.06, 0.4, CYAN, [s * 1.1, 0.5, 0.9], 1);
  }

  // ---------- cab ----------
  b.extrude(
    [
      [1.6, 1.45],
      [3.95, 1.45],
      [3.95, 2.0],
      [3.25, 2.1],
      [2.8, 2.9],
      [1.6, 2.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.06, color: BODY },
  );
  glow(plane(2.2, 0.85, HUD, [0, 2.5, 3.025 + 0.012], [0, 0.49, 0.871]), 0.9);
  for (const s of SIDES) {
    glow(plane(0.8, 0.55, GLASS, [s * 1.212, 2.52, 2.35], [s, 0, 0]), 0.6);
    plane(0.62, 0.62, EMBLEM, [s * 1.214, 1.85, 2.2], [s, 0, 0]);
    // reactive armor tiles
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 2; j++)
        box(0.05, 0.17, 0.22, (i + j) % 2 ? OLIVE : OLIVE2, [s * 1.225, 1.62 + j * 0.2, 2.95 + i * 0.25]);
    lit(0.03, 0.04, 2.3, CYAN, [s * 1.21, 1.5, 2.8], 1.4);
    box(0.04, 0.05, 0.22, STEEL, [s * 1.22, 2.05, 1.95]); // door handle
    // mirrors
    b.rod([s * 1.2, 2.4, 3.0], [s * 1.58, 2.55, 3.12], 0.025, { color: STEEL });
    box(0.1, 0.4, 0.26, DARK, [s * 1.62, 2.55, 3.12]);
    lit(0.02, 0.3, 0.18, CYAN, [s * 1.565, 2.55, 3.12], 0.9);
    // exhaust stacks
    cyl(0.1, 0.1, 2.1, 8, STEEL, [s * 1.0, 2.55, 1.5]);
    cyl(0.14, 0.14, 0.9, 8, PLATE, [s * 1.0, 2.1, 1.5]);
    glow(cyl(0.08, 0.08, 0.06, 8, AMBER, [s * 1.0, 3.62, 1.5]), 1.6);
    // headlights
    lit(0.4, 0.15, 0.06, "#e8ffff", [s * 0.85, 1.85, 3.98], 1.6);
    lit(0.12, 0.12, 0.06, AMBER, [s * 1.08, 1.66, 3.98], 1.3);
    // roof extras
    cyl(0.3, 0.3, 0.15, 8, PLATE, [s * 0.6, 3.05, 2.2]);
  }
  // hood vents + grille
  for (let i = 0; i < 4; i++) {
    const z = 3.45 + i * 0.13;
    box(1.6, 0.04, 0.07, DARK, [0, 2.0 + ((3.95 - z) / 0.7) * 0.1 + 0.015, z]);
  }
  box(2.0, 0.45, 0.05, DARK, [0, 1.7, 3.97]);
  for (let i = -3; i <= 3; i++) lit(0.04, 0.38, 0.03, i % 2 ? MAG : CYAN, [i * 0.22, 1.7, 4.0], 1.2);
  lit(2.3, 0.05, 0.05, CYAN, [0, 1.97, 3.99], 1.5);
  plane(0.5, 0.17, PLATEX, [0, 1.52, 3.97], [0, 0, 1]);

  // roof gear
  box(2.0, 0.08, 1.1, PLATE, [0, 3.0, 2.2]);
  lit(1.8, 0.1, 0.12, MAG, [0, 3.06, 2.78], 1.5);
  for (const s of SIDES) lit(0.2, 0.1, 0.12, s > 0 ? RED : CYAN, [s * 0.95, 3.1, 2.78], 1.8);
  // remote weapon station
  cyl(0.3, 0.3, 0.15, 8, PLATE, [0.6, 3.12, 2.2]);
  box(0.5, 0.3, 0.55, GUN, [0.6, 3.34, 2.2]);
  cyl(0.05, 0.05, 1.1, 8, GUN, [0.6, 3.36, 2.95], { dir: [0, 0, 1] });
  cyl(0.08, 0.08, 0.3, 8, DARK, [0.6, 3.36, 2.55], { dir: [0, 0, 1] });
  lit(0.1, 0.08, 0.06, RED, [0.6, 3.44, 2.5], 2);
  // radar dish
  cyl(0.05, 0.05, 0.3, 6, STEEL, [-0.6, 3.19, 2.1]);
  b.lathe(
    [
      [0, 0.02],
      [0.38, 0.22],
      [0.38, 0.25],
      [0, 0.07],
    ],
    { at: [-0.6, 3.38, 2.1], axis: [0, 0.6, 0.8], color: PLATE, segments: 10 },
  );
  b.rod([-0.6, 3.4, 2.1], [-0.6 + 0, 3.4 + 0.3 * 0.6, 2.1 + 0.3 * 0.8], 0.012, { color: STEEL });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), CYAN, { at: [-0.6, 3.64, 2.34] }), 1.6);
  // antennas
  b.rod([-0.95, 3.04, 1.8], [-0.95, 4.4, 1.8], [0.025, 0.008], { color: STEEL });
  b.rod([0.95, 3.04, 1.8], [0.95, 3.9, 1.8], [0.025, 0.008], { color: STEEL });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [-0.95, 4.42, 1.8] }), 2);

  // ---------- plow / bumper ----------
  b.extrude(
    [
      [-1.45, 0],
      [1.45, 0],
      [1.25, 0.95],
      [-1.25, 0.95],
    ],
    { at: [0, 0.5, 4.1], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.45, 0.12], bevel: 0.04, color: HAZ },
  );
  lit(2.4, 0.05, 0.05, CYAN, [0, 1.46, 4.14], 1.5);
  for (let i = -3; i <= 3; i++) b.spike([i * 0.4, 0.62, 4.28], [0, -0.1, 1], 0.28, 0.07, { color: STEEL });
  box(2.0, 0.2, 0.3, PLATE, [0, 0.95, 3.95]);

  // ---------- bed ----------
  box(2.7, 0.16, 5.4, PLATE, [0, 1.5, -1.25]);
  for (const s of SIDES) {
    box(0.14, 0.8, 5.3, BODY, [s * 1.3, 1.98, -1.25]);
    lit(0.05, 0.05, 5.3, CYAN, [s * 1.3, 2.41, -1.25], 1.4);
    box(0.1, 0.12, 5.3, PLATE, [s * 1.3, 2.34, -1.25]);
    for (let i = 0; i < 8; i++) {
      const z = 1.1 - i * 0.68;
      if (Math.abs(z + 1.8) < 1.25) continue;
      box(0.05, 0.7, 0.1, PLATE, [s * 1.37, 1.98, z]);
    }
    plane(2.2, 0.46, SIDE, [s * 1.41, 1.98, -1.8], [s, 0, 0]);
    // floodlights
    lit(0.1, 0.16, 0.2, "#e8ffff", [s * 1.3, 2.5, 1.2], 1.6);
    lit(0.1, 0.16, 0.2, "#e8ffff", [s * 1.3, 2.5, -3.7], 1.6);
  }
  box(2.7, 0.8, 0.14, BODY, [0, 1.98, -3.9]);
  box(2.0, 0.8, 0.14, BODY, [0, 1.98, 1.4]);
  plane(0.62, 0.21, PLATEX, [0, 1.75, -3.98], [0, 0, -1]);
  for (const s of SIDES) {
    lit(0.4, 0.12, 0.05, RED, [s * 1.0, 2.2, -3.98], 1.7);
    lit(0.3, 0.1, 0.05, AMBER, [s * 1.0, 1.95, -3.98], 1.2);
  }
  box(2.8, 0.35, 0.3, HAZ, [0, 1.0, -4.0]);
  box(1.8, 0.2, 0.2, PLATE, [0, 1.25, -3.95]);

  // turntable and rocket pod
  b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [0.95, 0.12],
      [0.7, 0.2],
      [0, 0.2],
    ],
    { at: [0, 1.58, -1.6], color: PLATE, segments: 12 },
  );
  glow(b.part(new THREE.TorusGeometry(0.9, 0.02, 4, 24), MAG, { at: [0, 1.6, -1.6], rotation: [90, 0, 0] }), 1.4);
  for (const s of SIDES) box(0.14, 1.2, 0.5, PLATE, [s * 0.66, 2.2, -1.6]);
  const ang = (35 * Math.PI) / 180;
  const D = new THREE.Vector3(0, Math.sin(ang), -Math.cos(ang));
  const U = new THREE.Vector3(0, Math.cos(ang), Math.sin(ang));
  const C = new THREE.Vector3(0, 2.9, -1.6);
  const P = (x: number, y: number, z: number) =>
    new THREE.Vector3(x, 0, 0).add(U.clone().multiplyScalar(y)).add(D.clone().multiplyScalar(z)).add(C);
  b.part(new THREE.BoxGeometry(1.1, 0.7, 3.0), BODY, { at: C, dir: D, axis: "z" });
  b.part(new THREE.BoxGeometry(1.2, 0.8, 0.3), HAZ, { at: P(0, 0, -1.4), dir: D, axis: "z" });
  b.part(new THREE.BoxGeometry(1.2, 0.8, 0.15), PLATE, { at: P(0, 0, 1.45), dir: D, axis: "z" });
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++) {
      const x = (i - 1.5) * 0.26;
      const y = (j - 0.5) * 0.3;
      b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 8), DARK, { at: P(x, y, 1.53), dir: D });
      if (j === 1) {
        b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 6), "#aab0a0", { at: P(x, y, 1.62), dir: D });
        b.part(new THREE.ConeGeometry(0.08, 0.22, 6), RED, { at: P(x, y, 1.88), dir: D });
      } else glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6), AMBER, { at: P(x, y, 1.56), dir: D }), 1.5);
    }
  for (const s of SIDES) lit(0.04, 0.05, 2.6, MAG, [0, 0, 0], 1.4, { at: P(s * 0.57, 0.1, 0), dir: D, axis: "z" });
  b.rod([0, 1.7, -0.8], P(0, -0.35, 0.5), 0.07, { color: STEEL });
  b.rod([0, 1.7, -0.8], [0, 2.1, -1.0], 0.1, { color: PLATE });

  // reactors
  for (const s of SIDES) {
    const x = s * 0.7;
    cyl(0.46, 0.5, 0.14, 8, PLATE, [x, 1.65, 0.7]);
    glow(cyl(0.3, 0.3, 0.9, 8, CYAN, [x, 2.15, 0.7]), 1.5);
    cyl(0.4, 0.4, 0.1, 8, PLATE, [x, 2.66, 0.7]);
    for (const [dx, dz] of [[0.36, 0], [-0.36, 0], [0, 0.36], [0, -0.36]])
      cyl(0.03, 0.03, 1.0, 5, STEEL, [x + dx, 2.15, 0.7 + dz]);
    glow(cyl(0.38, 0.38, 0.04, 8, MAG, [x, 2.4, 0.7]), 1.3);
    box(0.3, 0.3, 0.3, DARK, [x, 2.78, 0.7]);
    lit(0.18, 0.18, 0.03, AMBER, [x, 2.78, 0.86], 1.5);
  }

  // crates
  for (const s of SIDES)
    for (const z of [-3.2, -2.5]) {
      box(0.6, 0.6, 0.6, "#ffffff", [s * 0.9, 1.88, z], { texture: CRATE });
      box(0.64, 0.05, 0.64, DARK, [s * 0.9, 2.2, z]);
    }

  // rear mast
  b.rod([1.0, 1.58, -3.6], [1.0, 4.6, -3.6], [0.05, 0.02], { color: STEEL });
  for (const y of [2.6, 3.2, 3.8]) cyl(0.12, 0.12, 0.05, 6, PLATE, [1.0, y, -3.6]);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), MAG, { at: [1.0, 4.62, -3.6] }), 2);

  // underglow
  lit(2.2, 0.04, 0.05, MAG, [0, 0.6, 3.95], 1.5);
  lit(2.2, 0.04, 0.05, MAG, [0, 0.6, -3.9], 1.5);

  return b.root;
}
```