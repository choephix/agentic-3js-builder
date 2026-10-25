import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

const HULL = "#3b4a3c";
const DARK = "#14161c";
const STEEL = "#6d7480";
const NEON = "#19f0ff";
const PINK = "#ff2d8a";
const AMBER = "#ffb23a";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const r = rng(5);
  const base = b.joint("chassis", { at: [0, 0.6, 0] });

  const camo = paint((p, n) => {
    const v = noise(p, 0.5, 3);
    const c = mix(mix("#3b4a3c", "#2a3329", smoothstep(0.4, 0.6, v)), "#586450", smoothstep(0.65, 0.8, noise(p, 0.3, 8)));
    return mix(c, "#15171d", smoothstep(0.2, -0.8, n.y) * 0.6);
  });

  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: base, at, ...o });

  // chassis
  box(1.9, 0.25, 4.6, DARK, [0, 0.0, 0]);
  // cab
  box(1.9, 0.6, 1.5, camo, [0, 0.45, 0.9]);
  box(1.7, 0.5, 1.2, camo, [0, 0.95, 0.5]);
  // hood
  box(1.85, 0.4, 1.3, camo, [0, 0.4, 1.9]);
  // hood slope
  b.part(new THREE.BoxGeometry(1.7, 0.1, 1.0), camo, { bone: base, at: [0, 0.65, 1.8], rotation: [-8, 0, 0] });
  // windows
  box(1.55, 0.38, 0.05, "#0b2a3a", [0, 1.0, 1.12]);
  glow(box(1.55, 0.3, 0.05, "#1b6f8f", [0, 1.0, 1.13]), 0.6);
  for (const s of [1, -1]) box(0.04, 0.34, 0.9, "#0b2a3a", [s * 0.86, 1.0, 0.5]);
  // bed
  box(1.9, 0.12, 1.9, DARK, [0, 0.2, -1.4]);
  for (const s of [1, -1]) box(0.1, 0.5, 1.9, camo, [s * 0.9, 0.5, -1.4]);
  box(1.9, 0.5, 0.1, camo, [0, 0.5, -2.35]);
  box(1.9, 0.5, 0.1, camo, [0, 0.5, -0.45]);
  // roll bar
  for (const s of [1, -1]) b.rod([s * 0.85, 0.3, -0.5], [s * 0.85, 1.3, -0.6], 0.04, STEEL, { bone: base });
  b.rod([0.85, 1.3, -0.6], [-0.85, 1.3, -0.6], 0.04, STEEL, { bone: base });

  // pintle gun
  const gunBase = b.part(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 8), STEEL, { bone: base, at: [0, 0.8, -1.2] });
  box(0.3, 0.25, 0.5, DARK, [0, 1.1, -1.2]);
  b.rod([0, 1.12, -1.0], [0, 1.15, 0.0], 0.05, DARK, { bone: base });
  b.rod([0.08, 1.12, -1.0], [0.08, 1.15, -0.1], 0.03, STEEL, { bone: base });
  b.rod([-0.08, 1.12, -1.0], [-0.08, 1.15, -0.1], 0.03, STEEL, { bone: base });
  void gunBase;

  // bumper + plow
  box(2.0, 0.3, 0.2, DARK, [0, 0.15, 2.6]);
  b.extrude([[-1, 0], [1, 0], [0.8, 0.5], [-0.8, 0.5]], {
    at: [0, 0.1, 2.75], x: [1, 0, 0], thickness: 0.08, color: STEEL, bone: base,
  });
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.35, 0.16, 0.06, AMBER, [s * 0.6, 0.45, 2.57]), 1.4);
    glow(box(0.08, 0.1, 0.5, PINK, [s * 0.97, 0.3, -2.0]), 1.2);
  }
  // light bar
  glow(box(1.4, 0.07, 0.07, NEON, [0, 1.35, 0.9]), 1.5);

  // neon underglow
  glow(box(1.6, 0.04, 4.0, NEON, [0, -0.15, 0]), 1.2);
  for (const s of [1, -1]) glow(box(0.05, 0.05, 4.0, PINK, [s * 0.98, 0.1, 0]), 1.2);

  // decal emblem
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#19f0ff" stroke-width="5"/><path d="M14 44 L32 12 L50 44 Z" fill="#ff2d8a"/><rect x="28" y="26" width="8" height="14" fill="#14161c"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone: base, at: [s * 0.96, 0.5, 0.9], dir: [s, 0, 0], axis: "z", texture: emblem,
    }), 0.8);

  // antenna
  b.rod([-0.7, 1.2, -0.5], [-0.9, 2.0, -0.8], 0.015, STEEL, { bone: base });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), PINK, { bone: base, at: [-0.9, 2.0, -0.8] }), 1.5);

  // hover thrusters: four nacelles
  for (const sx of [1, -1])
    for (const z of [1.6, -1.6]) {
      const x = sx * 1.25;
      const hub = b.joint(`thruster_${sx > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`, { parent: base, at: [x, 0.0, z] });
      b.rod([sx * 0.9, 0.05, z], [x, 0.0, z], 0.07, STEEL, { bone: base });
      b.part(new THREE.CylinderGeometry(0.42, 0.34, 0.35, 8), DARK, { bone: hub, at: [x, 0.0, z] });
      b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 8), STEEL, { bone: hub, at: [x, 0.2, z] });
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8), "#0a0c10", { bone: hub, at: [x, -0.19, z] });
      glow(b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 8), NEON, { bone: hub, at: [x, -0.21, z] }), 1.8);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        b.part(new THREE.BoxGeometry(0.06, 0.3, 0.06), PINK, {
          bone: hub, at: [x + Math.cos(a) * 0.44, 0.0, z + Math.sin(a) * 0.44],
        });
      }
    }

  // armor studs on cab roof
  for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), STEEL, {
      bone: base, at: [(r() - 0.5) * 1.2, 1.22, 0.3 + r() * 0.5],
    });

  // roof pod
  box(0.5, 0.15, 0.4, DARK, [0.4, 1.28, 0.2]);

  // ride height: shift model so lowest point is ~0.35 above floor (hover)
  base.object.position.y += 0.0;
  return b.root;
}
