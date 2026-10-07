```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "telescope",
  description: "A stylized refractor telescope on an adjustable wooden tripod with brass fittings, finder scope and eyepiece.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });

  const WOOD = "#8a5a33";
  const WOOD_D = "#6b4224";
  const BRASS = "#c9993a";
  const BRASS_D = "#9a722a";
  const TUBE = "#f1ece0";
  const NAVY = "#1f3a5f";
  const DARK = "#1b1b1f";
  const GLASS = "#8fd3ff";
  const RED = "#b3342b";

  // Skeleton
  const base = b.joint("base", { at: [0, 1.05, 0] });
  const mount = b.joint("mount", { parent: base, at: [0, 1.15, 0], aim: [0, 1.3, 0] });
  const tube = b.joint("tube", { parent: mount, at: [0, 1.28, 0], aim: [0, 1.28, 1] });
  const focus = b.joint("focuser", { parent: tube, at: [0, 1.28, -0.55], aim: [0, 1.28, -0.8] });

  // Tripod legs, splayed
  const legTop = 1.05;
  const legs = [0, 120, 240];
  legs.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const top: [number, number, number] = [Math.sin(a) * 0.06, legTop, Math.cos(a) * 0.06];
    const foot: [number, number, number] = [Math.sin(a) * 0.62, 0.0, Math.cos(a) * 0.62];
    const mid: [number, number, number] = [
      top[0] + (foot[0] - top[0]) * 0.55,
      0.5,
      top[2] + (foot[2] - top[2]) * 0.55,
    ];
    b.rod(top, mid, 0.028, { color: WOOD, bone: base, sides: 4 });
    b.rod(mid, foot, [0.024, 0.017], { color: WOOD_D, bone: base, sides: 4 });
    // brass clamp at extension joint
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.06, 8), BRASS, { at: mid, bone: base });
    // rubber foot
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.04, 8), DARK, { at: [foot[0], 0.015, foot[2]], bone: base });
    // brace to central spreader
    const bp: [number, number, number] = [top[0] + (foot[0] - top[0]) * 0.4, legTop - 0.4, top[2] + (foot[2] - top[2]) * 0.4];
    b.rod([0, 0.58, 0], bp, 0.01, { color: BRASS_D, bone: base, sides: 5 });
    void i;
  });
  // Spreader hub
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6), BRASS_D, { at: [0, 0.58, 0], bone: base });
  // Tripod head
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.08, 6), WOOD_D, { at: [0, 1.07, 0], bone: base });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10), BRASS, { at: [0, 1.13, 0], bone: base });

  // Mount column and fork
  b.rod([0, 1.13, 0], [0, 1.24, 0], 0.035, { color: BRASS_D, bone: mount, sides: 8 });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.12), NAVY, { at: [0, 1.22, 0], bone: mount });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.1), NAVY, { at: [s * 0.095, 1.29, 0], bone: mount });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), BRASS, {
      at: [s * 0.12, 1.28, 0], dir: [1, 0, 0], bone: mount,
    });
  }
  // Tilt knob
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), RED, { at: [0.16, 1.28, 0], dir: [1, 0, 0], bone: mount });

  // Main tube (z forward)
  const z0 = -0.55, z1 = 0.7;
  b.rod([0, 1.28, z0], [0, 1.28, z1], 0.07, { color: TUBE, bone: tube, sides: 12 });
  // navy bands
  for (const z of [-0.35, 0.35]) {
    b.part(new THREE.CylinderGeometry(0.076, 0.076, 0.04, 12), NAVY, { at: [0, 1.28, z], dir: [0, 0, 1], bone: tube });
  }
  // brass rings at ends
  b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 12), BRASS, { at: [0, 1.28, z0 + 0.02], dir: [0, 0, 1], bone: tube });
  // Dew shield (wider, forward)
  b.rod([0, 1.28, z1 - 0.02], [0, 1.28, z1 + 0.32], [0.09, 0.105], { color: NAVY, bone: tube, sides: 12, caps: "flat" });
  b.part(new THREE.TorusGeometry(0.105, 0.012, 5, 14), BRASS, { at: [0, 1.28, z1 + 0.32], bone: tube });
  // Objective glass
  b.part(new THREE.CircleGeometry(0.09, 12), GLASS, { at: [0, 1.28, z1 + 0.22], dir: [0, 0, 1], axis: "z", bone: tube });
  // Side pivot band
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.1, 12), BRASS_D, { at: [0, 1.28, 0], dir: [0, 0, 1], bone: tube });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 6), BRASS, { at: [0, 1.28, 0], dir: [1, 0, 0], bone: tube });

  // Focuser and eyepiece
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 10), BRASS, { at: [0, 1.28, z0 - 0.04], dir: [0, 0, 1], bone: focus });
  b.rod([0, 1.28, z0 - 0.08], [0, 1.28, z0 - 0.26], 0.028, { color: DARK, bone: focus, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.04, 0.034, 0.06, 10), RED, { at: [0, 1.28, z0 - 0.28], dir: [0, 0, 1], bone: focus });
  b.part(new THREE.CircleGeometry(0.022, 8), GLASS, { at: [0, 1.28, z0 - 0.312], dir: [0, 0, -1], axis: "z", bone: focus });
  // focus knobs
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), BRASS_D, { at: [s * 0.075, 1.28, z0 - 0.05], dir: [1, 0, 0], bone: focus });
  }

  // Finder scope on top
  const fy = 1.4;
  b.rod([0, fy, -0.25], [0, fy, 0.3], 0.02, { color: DARK, bone: tube, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.028, 0.022, 0.07, 8), DARK, { at: [0, fy, 0.32], dir: [0, 0, 1], bone: tube });
  b.part(new THREE.CircleGeometry(0.024, 8), GLASS, { at: [0, fy, 0.356], dir: [0, 0, 1], axis: "z", bone: tube });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 8), BRASS, { at: [0, fy, -0.27], dir: [0, 0, 1], bone: tube });
  for (const z of [-0.12, 0.18]) {
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), BRASS, { at: [0, fy, z], bone: tube });
    b.rod([0, 1.345, z], [0, fy - 0.025, z], 0.01, { color: BRASS, bone: tube, sides: 4 });
  }

  return b.root;
}
```