import * as THREE from "three";
import { createBuilder, rng, paint, stripes, gradient } from "../../../../src/index";

export const meta = {
  name: "Telescope",
  description: "A stylized refractor telescope on a wooden tripod with an equatorial-style mount, finder scope and eyepiece.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "telescope" });

  const WHITE = "#f1efe8";
  const NAVY = "#1f3a5f";
  const BRASS = "#c9993a";
  const DARK = "#26272b";
  const WOOD = "#9a6a3c";
  const WOOD2 = "#7d5230";
  const RUBBER = "#18181a";
  const LENS = "#7fc4e8";
  const RED = "#c8402f";

  // Skeleton
  const base = b.joint("base", { at: [0, 0.9, 0] });
  const pan = b.joint("pan", { parent: base, at: [0, 1.25, 0], dir: [0, 1, 0] });
  const tilt = b.joint("tilt", { parent: pan, at: [0, 1.4, 0.0], dir: [0, 0, 1] });
  const focus = b.joint("focus", { parent: tilt, at: [0, 1.4, 0.75], dir: [0, 0, 1], role: "hinge" });

  // Tripod legs
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const top: [number, number, number] = [Math.cos(a) * 0.06, 1.15, Math.sin(a) * 0.06];
    const foot: [number, number, number] = [Math.cos(a) * 0.62, 0.0, Math.sin(a) * 0.62];
    const mid: [number, number, number] = [Math.cos(a) * 0.34, 0.6, Math.sin(a) * 0.34];
    b.rod(top, foot, [0.032, 0.026], { bone: base, color: WOOD, sides: 6 });
    b.rod(mid, foot, [0.0, 0.0001], { bone: base, color: WOOD2 });
    // lower metal sleeve
    const lo: [number, number, number] = [Math.cos(a) * 0.5, 0.25, Math.sin(a) * 0.5];
    b.rod(lo, foot, 0.03, { bone: base, color: DARK, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 8), RUBBER, {
      bone: base,
      at: [foot[0], 0.015, foot[2]],
    });
    // spreader arm
    const sp: [number, number, number] = [Math.cos(a) * 0.3, 0.55, Math.sin(a) * 0.3];
    b.rod([0, 0.5, 0], sp, 0.012, { bone: base, color: BRASS, sides: 6 });
  }
  // spreader hub / tray
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 3), DARK, { bone: base, at: [0, 0.5, 0] });
  // tripod head
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 6), DARK, { bone: base, at: [0, 1.17, 0] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10), BRASS, { bone: base, at: [0, 1.25, 0] });

  // Mount (pan)
  b.part(new THREE.CylinderGeometry(0.08, 0.09, 0.14, 10), NAVY, { bone: pan, at: [0, 1.3, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.3, 0.12), NAVY, { bone: pan, at: [s * 0.12, 1.45, 0] });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), BRASS, {
      bone: pan,
      at: [s * 0.15, 1.5, 0],
      dir: [1, 0, 0],
    });
  }
  // knob
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), RED, { bone: pan, at: [0.19, 1.5, 0], dir: [1, 0, 0] });
  b.rod([0.16, 1.5, 0], [0.2, 1.5, 0], 0.01, { bone: pan, color: BRASS });

  // Main tube
  const bandCol = paint((p) => (Math.floor((p.z + 5) / 0.001) % 2 ? WHITE : WHITE));
  void bandCol;
  b.rod([0, 1.4, -0.35], [0, 1.4, 0.7], 0.1, { bone: tilt, color: WHITE, sides: 12 });
  // dew shield (wider, front)
  b.rod([0, 1.4, 0.7], [0, 1.4, 1.1], [0.125, 0.125], { bone: tilt, color: NAVY, sides: 12 });
  b.lathe(
    [
      [0.1, 0],
      [0.13, 0],
      [0.13, 0.02],
      [0.1, 0.02],
    ],
    { at: [0, 1.4, 1.1], axis: [0, 0, 1], bone: tilt, color: BRASS, segments: 12 },
  );
  // lens glass
  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.015, 14), LENS, {
    bone: tilt,
    at: [0, 1.4, 0.82],
    dir: [0, 0, 1],
    axis: "y",
  });
  // brass rings on tube
  for (const z of [-0.2, 0.1, 0.45]) {
    b.part(new THREE.CylinderGeometry(0.108, 0.108, 0.03, 12), BRASS, {
      bone: tilt,
      at: [0, 1.4, z],
      dir: [0, 0, 1],
    });
  }
  // rear cap
  b.part(new THREE.CylinderGeometry(0.11, 0.1, 0.06, 12), NAVY, { bone: tilt, at: [0, 1.4, -0.38], dir: [0, 0, 1] });

  // Focuser + eyepiece (star diagonal)
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), DARK, { bone: focus, at: [0, 1.4, -0.46], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), BRASS, { bone: focus, at: [0, 1.4, -0.55], dir: [0, 0, 1] });
  b.part(new THREE.BoxGeometry(0.07, 0.08, 0.08), DARK, { bone: focus, at: [0, 1.4, -0.62] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), DARK, { bone: focus, at: [0, 1.31, -0.62] });
  b.part(new THREE.CylinderGeometry(0.036, 0.03, 0.04, 8), RUBBER, { bone: focus, at: [0, 1.24, -0.62] });
  // focus knobs
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), RED, { bone: focus, at: [s * 0.065, 1.4, -0.46], dir: [1, 0, 0] });
  }

  // Finder scope on brackets
  const fz0 = -0.1, fz1 = 0.35;
  b.rod([0, 1.57, fz0], [0, 1.57, fz1], 0.02, { bone: tilt, color: NAVY, sides: 8 });
  b.rod([0, 1.57, fz1], [0, 1.57, fz1 + 0.07], [0.028, 0.028], { bone: tilt, color: DARK, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 8), LENS, { bone: tilt, at: [0, 1.57, fz1 + 0.075], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), RUBBER, { bone: tilt, at: [0, 1.57, fz0 - 0.02], dir: [0, 0, 1] });
  for (const z of [0.0, 0.28]) {
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 8), BRASS, { bone: tilt, at: [0, 1.57, z] });
    b.rod([0, 1.5, z], [0, 1.56, z], 0.008, { bone: tilt, color: BRASS, sides: 6 });
  }

  return b.root;
}
