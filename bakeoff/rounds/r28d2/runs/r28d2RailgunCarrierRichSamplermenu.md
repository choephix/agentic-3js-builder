```ts
import * as THREE from "three";
import { createBuilder, frame, rng, paint, noise, mix, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled sci-fi military railgun carrier braced on four stabiliser legs, low-poly.",
};

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const HULL = paint((p, n) => {
    const base = mix("#4d5a48", "#7d8a6c", noise(p, 0.5, 3));
    return mix(base, "#2a3226", n.y < -0.3 ? 0.5 : 0);
  });
  const DARK = "#1c1f24", STEEL = "#8d96a3", TYRE = "#17181b", YEL = "#e8b81c", CY = "#38e8ff", RED = "#d8402c";
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

  const chassis = b.joint("chassis", { at: [0, 0.9, 0] });
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at, flat: true, ...o });

  // hull
  P(box(2.3, 0.5, 6.6), HULL, [0, 0.95, 0]);
  P(box(2.0, 0.5, 2.4), HULL, [0, 1.4, 1.5]);
  P(box(1.9, 0.12, 2.2), "#3a4636", [0, 1.7, 1.5]);
  // sloped nose
  b.frustumBox([0, 1.0, 3.3], [0, 1.0, 3.9], [2.2, 0.6], [1.9, 0.3], { bone: chassis, color: HULL });
  // cab windows
  const WIN = svg(
    `<svg viewBox="0 0 100 30"><rect width="100" height="30" rx="4" fill="#0a2a33"/><rect x="4" y="4" width="92" height="22" fill="#38e8ff" opacity="0.7"/><path d="M10 26 L30 4 M40 26 L60 4" stroke="#fff" stroke-width="3" opacity="0.5"/></svg>`,
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.7, 0.4), "#ffffff", {
      bone: chassis, at: [0, 1.45, 2.72], dir: [0, 0.3, 1], axis: "z", texture: WIN,
    }),
    0.8,
  );
  // side armour skirts and hazard stripes
  for (const s of [1, -1]) {
    P(box(0.1, 0.5, 5.6), "#3a4636", [s * 1.2, 0.8, 0]);
    P(box(0.12, 0.08, 5.0), YEL, [s * 1.24, 1.0, 0]);
    P(box(0.2, 0.22, 0.6), DARK, [s * 1.1, 1.3, 1.5]);
    // headlights
    glow(P(box(0.3, 0.14, 0.08), CY, [s * 0.7, 0.95, 3.9]), 1.4);
    // sensor mast
    P(cyl(0.025, 0.7, 6), STEEL, [s * 0.9, 2.1, 0.9]);
    glow(P(new THREE.SphereGeometry(0.06, 6, 4), RED, [s * 0.9, 2.5, 0.9]), 1.5);
  }
  // rear deck with gun cradle
  P(box(2.0, 0.3, 3.6), "#3a4636", [0, 1.35, -1.6]);
  P(box(0.7, 0.35, 3.2), DARK, [0, 1.6, -1.6]);
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.8, -1.2], dir: [0, 1, 0] });
  b.part(cyl(0.9, 0.15, 12), DARK, { bone: yaw, at: [0, 1.82, -1.2], flat: true });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.2, -1.2], dir: [0, 0, 1], role: "hinge" });
  for (const s of [1, -1]) b.part(box(0.18, 0.7, 1.4), HULL, { bone: pitch, at: [s * 0.55, 2.2, -1.2], flat: true });
  b.part(box(0.9, 0.6, 1.8), "#59664f", { bone: pitch, at: [0, 2.25, -1.4], flat: true });
  // railgun rails
  for (const s of [1, -1]) {
    b.part(box(0.14, 0.2, 5.4), STEEL, { bone: pitch, at: [s * 0.2, 2.3, 1.6], flat: true });
    glow(b.part(box(0.04, 0.04, 5.2), CY, { bone: pitch, at: [s * 0.2, 2.42, 1.6] }), 1.6);
  }
  P(box(0.1, 0.1, 0.1), DARK, [0, 0, 0], { scale: [0.001, 0.001, 0.001] });
  for (let i = 0; i < 6; i++) {
    b.part(cyl(0.3 - i * 0.015, 0.14, 8), DARK, { bone: pitch, at: [0, 2.3, 0.2 + i * 0.7], dir: [0, 0, 1], flat: true });
    glow(b.part(new THREE.TorusGeometry(0.3 - i * 0.015, 0.025, 4, 10), CY, { bone: pitch, at: [0, 2.3, 0.28 + i * 0.7] }), 1.5);
  }
  b.part(cyl(0.2, 0.6, 8), STEEL, { bone: pitch, at: [0, 2.3, 4.5], dir: [0, 0, 1], flat: true });
  // capacitor drums on deck
  for (let i = 0; i < 3; i++)
    P(cyl(0.28, 1.4, 8), YEL, [0.75, 1.75, -2.4 + i * 0.7], { dir: [1, 0, 0], axis: "y" });

  // wheels: 3 axles, 6 wheels
  const rnd = rng(5);
  const zs = [2.4, 0, -2.4];
  const names = ["F", "M", "R"];
  zs.forEach((z, zi) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const susp = b.joint(`susp${names[zi]}${side}`, { parent: chassis, at: [s * 1.2, 0.55, z], dir: [s, 0, 0] });
      const wheel = b.joint(`wheel${names[zi]}${side}`, { parent: susp, at: [s * 1.3, 0.55, z], dir: [s, 0, 0], role: "hinge" });
      const w = { bone: wheel, flat: true };
      b.part(cyl(0.55, 0.5, 12), TYRE, { ...w, at: [s * 1.3, 0.55, z], dir: [1, 0, 0] });
      b.part(cyl(0.3, 0.52, 8), STEEL, { ...w, at: [s * 1.3, 0.55, z], dir: [1, 0, 0] });
      b.part(cyl(0.1, 0.56, 6), YEL, { ...w, at: [s * 1.3, 0.55, z], dir: [1, 0, 0] });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(cyl(0.025, 0.58, 5), DARK, { ...w, at: [s * 1.3, 0.55 + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2], dir: [1, 0, 0] });
      }
      b.part(box(0.1, 0.1, 0.9), DARK, { bone: susp, at: [s * 1.25, 0.55, z], flat: true });
      b.part(box(0.9, 0.15, 0.2), DARK, { bone: susp, at: [s * 0.75, 0.75, z], flat: true });
      b.part(box(0.9, 0.1, 0.6), "#3a4636", { bone: chassis, at: [s * 0.8, 1.0, z], flat: true });
      void rnd;
    }
  });
  // stabiliser legs (deployed)
  for (const fz of [2.9, -2.9]) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hz = fz > 0 ? "F" : "R";
      const arm = b.joint(`stab${hz}${side}`, { parent: chassis, at: [s * 1.1, 1.1, fz], aim: [s * 2.0, 0.6, fz * 1.12], role: "leg" });
      const foot = b.joint(`stabFoot${hz}${side}`, { parent: arm, at: [s * 2.0, 0.6, fz * 1.12], dir: [0, -1, 0], role: "leg" });
      b.rod([s * 1.1, 1.1, fz], [s * 2.0, 0.6, fz * 1.12], 0.1, DARK, { bone: arm, sides: 6 });
      b.part(box(0.35, 0.3, 0.35), YEL, { bone: arm, at: [s * 2.0, 0.65, fz * 1.12], flat: true });
      b.rod([s * 2.0, 0.6, fz * 1.12], [s * 2.0, 0.07, fz * 1.12], 0.09, STEEL, { bone: foot, sides: 6 });
      b.part(cyl(0.38, 0.08, 8), DARK, { bone: foot, at: [s * 2.0, 0.04, fz * 1.12], flat: true });
      b.rod([s * 1.7, 1.0, fz * 1.08], [s * 2.0, 0.5, fz * 1.12], 0.04, STEEL, { bone: arm, sides: 5 });
      glow(b.part(box(0.08, 0.08, 0.08), RED, { bone: arm, at: [s * 2.0, 0.85, fz * 1.12] }), 1.3);
    }
  }
  // rear taillights, antenna, decal
  glow(P(box(1.6, 0.1, 0.06), RED, [0, 1.0, -3.32]), 1.2);
  const UNIT = svg(
    `<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="none" stroke="#fff" stroke-width="3"/><text x="30" y="30" font-size="26" font-family="monospace" font-weight="bold" fill="#fff" text-anchor="middle">RG-6</text></svg>`,
  );
  b.part(new THREE.PlaneGeometry(0.7, 0.45), "#ffffff", {
    bone: chassis, at: [1.26, 1.2, 0.2], dir: [1, 0, 0], axis: "z", texture: UNIT,
  });
  P(cyl(0.02, 1.2, 5), STEEL, [-0.8, 2.3, 1.0]);
  b.part(new THREE.SphereGeometry(0.01), DARK, { bone: chassis, at: [0, 0.05, 0] });
  void frame;
  return b.root;
}
```