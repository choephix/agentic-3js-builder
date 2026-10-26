```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Spitfire Cyanotype",
  description:
    "Supermarine Spitfire Mk I in a cyanotype blueprint style: Prussian-blue airframe with white panel lines, ribs, rivets and roundels.",
};

// Palette: cyanotype (prussian blue ground, white linework)
const DEEP = "#0b2f6b";
const MID = "#1456a8";
const LIGHT = "#3a86d4";
const PALE = "#a9d6f5";
const WHITE = "#f1f8ff";
const TIRE = "#071f4a";
const GLASS = "#8fd8ff";

const BODY = countershade(DEEP, "#2a74c6", { level: -0.15 });
const WING = countershade("#0f3f86", "#3584d2", { level: 0 });

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const R = rng(5);
  const Y = 1.9; // thrust-line height

  // ---------- helpers ----------
  const line = (a: number[], c: number[], r = 0.012, col = WHITE) => b.rod(a, c, r, col);
  const box = (w: number, h: number, d: number, col: string, at: number[], dir?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at, dir });
  const roundel = (c: number[], n: number[], rad: number) => {
    const rings: [number, string][] = [
      [1, WHITE],
      [0.76, DEEP],
      [0.5, WHITE],
      [0.22, DEEP],
    ];
    rings.forEach(([k, col], i) => {
      const at = [c[0] + n[0] * 0.004 * i, c[1] + n[1] * 0.004 * i, c[2] + n[2] * 0.004 * i];
      b.part(new THREE.CylinderGeometry(rad * k, rad * k, 0.008, 24), col, { at, dir: n });
    });
  };

  // ---------- fuselage ----------
  const fus = b.loft(
    [
      { at: [0, 2.1, -5.6], w: 0.08, h: 0.25 },
      { at: [0, 2.05, -4.5], w: 0.22, h: 0.5 },
      { at: [0, 1.98, -3.0], w: 0.5, h: 0.85 },
      { at: [0, 1.9, -1.5], w: 0.8, h: 1.15 },
      { at: [0, 1.85, 0.0], w: 0.95, h: 1.3 },
      { at: [0, 1.88, 1.2], w: 0.9, h: 1.2 },
      { at: [0, 1.9, 2.4], w: 0.8, h: 1.0 },
      { at: [0, 1.9, 3.2], w: 0.7, h: 0.85 },
    ],
    { color: BODY },
  );
  const skin = b.surface(fus);

  // panel rings
  for (const z of [-4.3, -3.6, -2.9, -1.6, -0.9, 0.9, 1.8, 2.5, 3.1]) {
    try {
      const ring = skin.loop([0, Y, z], { dir: [0, 0, 1], lift: 0.006 });
      b.sweep(ring, 0.01, { color: WHITE });
    } catch (e) {
      /* ring misses the surface */
    }
  }
  // side seam and centre-line dashes
  for (const s of [1, -1]) {
    try {
      b.sweep(fus.line(s * 90, 0.006).slice(0.08, 0.97), 0.009, { color: PALE });
    } catch (e) {
      /* skip */
    }
  }
  b.along(fus, 26, (at) => {
    b.stick(new THREE.BoxGeometry(0.035, 0.02, 0.18), WHITE, at, { embed: 0.6 });
  }, { from: 0.04, to: 0.96 });

  // rivet rows on cowl
  for (const s of [1, -1])
    for (let i = 0; i < 9; i++) {
      const h = skin.ray([s * 2, 2.0, 2.0 + i * 0.12], [-s, 0, 0]);
      if (h) b.stick(new THREE.SphereGeometry(0.018, 5, 4), WHITE, h, { embed: 0.4 });
    }

  // fuselage roundels
  for (const s of [1, -1]) {
    const h = skin.ray([s * 2, 2.0, -2.25], [-s, 0, 0]);
    const x = h ? h.at.x : s * 0.3;
    roundel([x, 2.0, -2.25], [s, 0, 0], 0.4);
  }

  // exhaust stacks
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const h = skin.ray([s * 2, 2.08, 1.95 + i * 0.2], [-s, 0, 0]);
      const x = h ? h.at.x : s * 0.4;
      b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.2, 7), LIGHT, {
        at: [x + s * 0.05, 2.08, 1.95 + i * 0.2],
        dir: [s, 0.1, 0],
      });
    }

  // ---------- canopy ----------
  glow(
    b.part(new THREE.SphereGeometry(1, 12, 8), GLASS, { at: [0, 2.5, -0.2], scale: [0.36, 0.34, 1.0] }),
    0.55,
  );
  for (const [z, f] of [
    [-0.7, 0.87],
    [-0.2, 1],
    [0.3, 0.87],
  ] as [number, number][])
    b.part(new THREE.TorusGeometry(1, 0.07, 5, 14), WHITE, {
      at: [0, 2.5, z],
      scale: [0.37 * f, 0.35 * f, 0.3],
    });
  line([0, 2.84, -0.95], [0, 2.84, 0.55], 0.014);
  // windscreen block + headrest
  box(0.5, 0.08, 0.4, MID, [0, 2.46, 0.78], [0, 0.3, 1]);
  box(0.3, 0.3, 0.12, LIGHT, [0, 2.42, -1.3]);

  // ---------- nose, spinner, propeller ----------
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 14), WHITE, { at: [0, Y, 3.22], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.3, 0.8, 12), LIGHT, { at: [0, Y, 3.6], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.305, 0.305, 0.03, 12), WHITE, { at: [0, Y, 3.35], dir: [0, 0, 1] });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.35;
    const d = [Math.sin(a), Math.cos(a), 0];
    const at = [d[0] * 0.85, Y + d[1] * 0.85, 3.5];
    b.part(new THREE.BoxGeometry(0.2, 1.3, 0.04), PALE, { at, dir: d });
    b.part(new THREE.BoxGeometry(0.205, 0.22, 0.045), WHITE, {
      at: [d[0] * 1.4, Y + d[1] * 1.4, 3.5],
      dir: d,
    });
    b.part(new THREE.BoxGeometry(0.06, 1.2, 0.045), MID, { at, dir: d });
  }

  // ---------- wings ----------
  const WY = 1.4;
  const WT = 0.14;
  const k = (u: number, span = 5.65) => Math.sqrt(Math.max(0, 1 - (u / span) ** 2));
  const wingOutline = () => {
    const us = [0, 1, 2, 3, 4, 5, 5.4];
    const pts: [number, number][] = us.map((u) => [u, 0.9 * k(u)]);
    pts.push([5.55, 0.0]);
    for (let i = us.length - 1; i >= 0; i--) pts.push([us[i], -1.6 * k(us[i])]);
    return pts;
  };
  const top = WY + WT / 2;
  for (const s of [1, -1]) {
    b.extrude(wingOutline(), { at: [0, WY, 0.25], x: [s, 0, 0], y: [0, 0, 1], thickness: WT, color: WING });
    // ribs
    for (let u = 0.8; u < 5.1; u += 0.45) {
      const z0 = -1.6 * k(u) + 0.06;
      const z1 = 0.9 * k(u) - 0.06;
      box(0.022, 0.008, z1 - z0, WHITE, [s * u, top + 0.003, 0.25 + (z0 + z1) / 2]);
    }
    // flap & aileron hinge lines
    const hz = (u: number) => 0.25 - 1.6 * k(u) * 0.62;
    line([s * 0.9, top + 0.004, hz(0.9)], [s * 3.0, top + 0.004, hz(3.0)], 0.01);
    line([s * 3.1, top + 0.004, hz(3.1)], [s * 5.2, top + 0.004, hz(5.2)], 0.01);
    line([s * 0.9, top + 0.004, hz(0.9)], [s * 0.9, top + 0.004, 0.25 - 1.6 * k(0.9)], 0.01);
    line([s * 3.05, top + 0.004, hz(3.05)], [s * 3.05, top + 0.004, 0.25 - 1.6 * k(3.05)], 0.01);
    // leading-edge strip
    for (let u = 0.2; u < 5.2; u += 0.5) {
      box(0.3, 0.01, 0.04, PALE, [s * u, top + 0.004, 0.25 + 0.9 * k(u) - 0.1]);
    }
    // roundel on upper wing
    roundel([s * 3.6, top + 0.002, -0.05], [0, 1, 0], 0.45);
    // guns
    for (const u of [1.6, 2.1]) {
      b.rod([s * u, WY, 1.0], [s * u, WY, 1.8], 0.025, WHITE);
      b.part(new THREE.SphereGeometry(0.04, 6, 4), PALE, { at: [s * u, WY, 1.8] });
    }
    // wingtip light
    b.part(new THREE.SphereGeometry(0.07, 6, 5), WHITE, { at: [s * 5.55, WY, 0.25] });
    // radiators
    box(0.55, 0.3, 0.8, MID, [s * 2.7, 1.15, 0.35]);
    box(0.5, 0.26, 0.04, LIGHT, [s * 2.7, 1.15, 0.77]);
    for (let i = -2; i <= 2; i++) box(0.018, 0.22, 0.045, WHITE, [s * 2.7 + i * 0.09, 1.15, 0.78]);
    // landing gear
    const wx = s * 1.3;
    line([s * 1.1, 1.38, 0.4], [wx, 0.4, 0.45], 0.05, LIGHT);
    line([s * 1.12, 1.3, 0.62], [wx, 0.5, 0.5], 0.025, WHITE);
    b.part(new THREE.CylinderGeometry(0.35, 0.35, 0.16, 14), TIRE, { at: [wx + s * 0.1, 0.35, 0.45], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.19, 10), PALE, { at: [wx + s * 0.1, 0.35, 0.45], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 8), DEEP, { at: [wx + s * 0.1, 0.35, 0.45], dir: [1, 0, 0] });
    // gear door
    box(0.03, 0.9, 0.3, MID, [s * 1.45, 0.9, 0.5], [s * 0.1, 1, 0]);
  }
  // wing root fairing
  box(1.2, 0.08, 1.4, MID, [0, 1.38, 0.3]);

  // ---------- tail ----------
  const finOutline: [number, number][] = [
    [-3.4, 0],
    [-3.9, 1.0],
    [-4.2, 1.5],
    [-4.7, 1.55],
    [-5.2, 1.25],
    [-5.35, 0.3],
    [-5.4, 0],
  ];
  b.extrude(finOutline, { at: [0, 2.05, 0], x: [0, 0, 1], thickness: 0.07, color: WING });
  line([0.045, 2.1, -4.75], [0.045, 3.5, -4.72], 0.012);
  line([-0.045, 2.1, -4.75], [-0.045, 3.5, -4.72], 0.012);
  for (let i = 0; i < 6; i++) {
    const y = 2.3 + i * 0.2;
    line([0.045, y, -4.7], [0.045, y, -5.2 + (i > 4 ? 0.3 : 0)], 0.007);
  }
  for (const s of [1, -1]) {
    const tpts: [number, number][] = [];
    const us = [0, 0.6, 1.2, 1.8, 2.2, 2.4];
    us.forEach((u) => tpts.push([u, 0.5 * k(u, 2.5)]));
    for (let i = us.length - 1; i >= 0; i--) tpts.push([us[i], -0.75 * k(us[i], 2.5)]);
    b.extrude(tpts, { at: [0, 2.02, -4.7], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.05, color: WING });
    line([s * 0.2, 2.05, -4.7 - 0.75 * k(0.2, 2.5) * 0.4], [s * 2.3, 2.05, -4.7 - 0.75 * k(2.3, 2.5) * 0.4], 0.009);
    for (let u = 0.5; u < 2.2; u += 0.4) {
      box(0.018, 0.008, 1.0 * k(u, 2.5), WHITE, [s * u, 2.05, -4.7 - 0.12 * k(u, 2.5)]);
    }
  }
  // tail wheel
  line([0, 1.85, -4.6], [0, 0.2, -4.9], 0.04, LIGHT);
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 10), TIRE, { at: [0, 0.15, -4.9], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), PALE, { at: [0, 0.15, -4.9], dir: [1, 0, 0] });

  // tiny scatter of rivets on wing tops for blueprint feel
  for (const s of [1, -1])
    for (let i = 0; i < 14; i++) {
      const u = 0.5 + R() * 4.6;
      const z = 0.25 - 1.5 * k(u) * (0.2 + 0.5 * R());
      b.part(new THREE.SphereGeometry(0.014, 4, 3), PALE, { at: [s * u, top + 0.002, z] });
    }

  return b.root;
}
```