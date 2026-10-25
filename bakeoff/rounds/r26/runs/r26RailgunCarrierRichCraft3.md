```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, countershade } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = "#56603a";
const DARK = "#2a2e24";
const TIRE = "#17181a";
const STEEL = "#7d8590";
const GUN = "#3b4048";
const YEL = "#e0b020";
const GLOW = "#46d8ff";

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const R = rng(5);

  const hull = paint((p, n) => {
    const base = countershade("#6a7548", "#3e4630").at(p, n);
    const m = noise(p, 0.5, 3);
    return mix(base as any, "#3a4228", smoothstep(0.55, 0.8, m) * 0.5);
  });

  const hullBone = b.joint("hull", { at: [0, 0.75, 0] });
  const turret = b.joint("turret", { parent: hullBone, at: [0, 1.2, -0.3], dir: [0, 0, 1] });
  const elev = b.joint("elevation", { parent: turret, at: [0, 1.45, -0.3], dir: [0, 0, 1], role: "hinge" });

  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...extra });

  // chassis
  box(2.1, 0.5, 6.4, hull, [0, 0.8, 0], hullBone);
  box(2.3, 0.18, 6.0, DARK, [0, 0.52, 0], hullBone);
  // sloped nose
  b.frustumBox([0, 1.0, 3.0], [0, 1.0, 3.7], [1.9, 0.5], [1.5, 0.3], { bone: hullBone, color: hull });
  // cab
  box(1.7, 0.7, 1.5, hull, [0, 1.35, 2.0], hullBone);
  box(1.55, 0.3, 0.05, "#1a2a38", [0, 1.5, 2.78], hullBone, { rotation: [-20, 0, 0] });
  glow(box(1.3, 0.08, 0.04, GLOW, [0, 1.45, 2.82], hullBone), 1.2);
  // rear deck / ammo
  box(1.8, 0.35, 1.6, DARK, [0, 1.2, -2.3], hullBone);
  for (const s of [1, -1]) {
    box(0.06, 0.4, 5.0, YEL, [s * 1.07, 0.85, 0], hullBone);
    box(0.5, 0.25, 0.9, STEEL, [s * 1.1, 1.2, 1.2], hullBone);
    b.part(new THREE.SphereGeometry(0.08, 6, 4), "#ff3030", { bone: hullBone, at: [s * 0.8, 1.76, 2.4] });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), "#ffdd88", { bone: hullBone, at: [s * 0.75, 0.9, 3.6] }), 1.5);
  }
  // antenna
  b.rod([0.6, 1.7, 1.4], [0.6, 2.7, 1.2], 0.02, DARK, { bone: hullBone });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), "#ff3030", { bone: hullBone, at: [0.6, 2.72, 1.2] });

  // turret
  b.part(new THREE.CylinderGeometry(1.0, 1.1, 0.3, 8), hull, { bone: turret, at: [0, 1.4, -0.3] });
  box(1.5, 0.7, 1.9, hull, [0, 1.8, -0.3], turret);
  for (const s of [1, -1]) {
    box(0.15, 0.6, 1.5, GUN, [s * 0.82, 1.9, -0.3], turret);
    box(0.4, 0.5, 0.05, YEL, [s * 0.4, 1.85, 0.68], turret);
  }
  // railgun: twin rails with coil rings
  const railZ0 = 0.4, railZ1 = 6.2, ry = 1.95;
  for (const s of [1, -1]) {
    b.rod([s * 0.2, ry, railZ0], [s * 0.2, ry, railZ1], 0.1, GUN, { bone: elev, sides: 6 } as any);
    b.rod([s * 0.2, ry, railZ1], [s * 0.2, ry, railZ1 + 0.15], 0.12, STEEL, { bone: elev });
    glow(b.rod([s * 0.12, ry, railZ0 + 0.3], [s * 0.12, ry, railZ1 - 0.2], 0.025, GLOW, { bone: elev }), 1.6);
  }
  box(0.55, 0.3, 5.6, DARK, [0, ry, 3.3], elev);
  for (let i = 0; i < 8; i++) {
    const z = 1.0 + i * 0.7;
    b.part(new THREE.TorusGeometry(0.3, 0.05, 5, 8), i % 2 ? STEEL : YEL, {
      bone: elev, at: [0, ry, z], rotation: [0, 0, 0],
    });
  }
  box(0.8, 0.6, 1.0, GUN, [0, ry, 0.2], elev);
  b.pose(elev, { axis: [1, 0, 0], deg: -8 });

  // wheels: 3 axles per side
  const zs = [2.4, 0, -2.4];
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const z = zs[i];
      const hub = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: hullBone, at: [s * 1.25, 0.55, z], dir: [s, 0, 0] });
      b.rod([s * 1.0, 0.55, z], [s * 1.25, 0.55, z], 0.08, STEEL, { bone: hullBone });
      b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 10), TIRE, {
        bone: hub, at: [s * 1.4, 0.55, z], dir: [s, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.52, 8), STEEL, { bone: hub, at: [s * 1.41, 0.55, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.56, 6), YEL, { bone: hub, at: [s * 1.42, 0.55, z], dir: [s, 0, 0] });
      box(0.7, 0.1, 1.1, DARK, [s * 1.4, 1.15, z], hullBone);
    }

  // stabiliser legs, deployed
  const feet: [number, number][] = [[1, 2.9], [-1, 2.9], [1, -2.9], [-1, -2.9]];
  feet.forEach(([s, z], i) => {
    const n = `stab${i + 1}`;
    const root = b.joint(n, { parent: hullBone, at: [s * 1.1, 0.8, z * 0.8], dir: [s, -0.3, z > 0 ? 0.4 : -0.4] });
    const knee: number[] = [s * 2.0, 0.9, z * 1.05];
    const foot: number[] = [s * 2.4, 0.08, z * 1.1];
    b.rod([s * 1.1, 0.8, z * 0.8], knee, 0.12, OLIVE, { bone: root });
    b.rod(knee, foot, 0.1, STEEL, { bone: root });
    b.rod([s * 1.1, 1.0, z * 0.8], [s * 1.95, 0.85, z * 1.05], 0.05, YEL, { bone: root });
    b.part(new THREE.CylinderGeometry(0.35, 0.42, 0.1, 8), DARK, { bone: root, at: [foot[0], 0.05, foot[2]] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 6), YEL, { bone: root, at: [foot[0], 0.12, foot[2]] });
  });

  // emblem decal on hull side
  const mark = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#e0b020" stroke-width="5"/><path d="M12 32 H52 M44 24 L52 32 L44 40" stroke="#e0b020" stroke-width="5" fill="none"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", {
      bone: hullBone, at: [s * 1.056, 0.85, -1.2], dir: [s, 0, 0], axis: "z", texture: mark,
    });

  return b.root;
}
```