```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "telescope",
  description: "A brass refractor telescope on a wooden tripod with finder scope, focuser and eyepiece.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });

  const brass = "#c89b3c";
  const dark = "#2a2a30";
  const white = "#e8e4d8";
  const wood = "#7a4a2a";
  const woodDark = "#5a3419";
  const blue = "#2c4a7a";
  const lens = "#6fb5d9";

  const baseH = 1.0;
  const mount = b.joint("mount", { at: [0, baseH, 0] });
  const tube = b.joint("tube", { at: [0, baseH + 0.12, 0], parent: mount });

  // Tripod legs
  const legTopY = baseH;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const top: [number, number, number] = [Math.cos(a) * 0.05, legTopY, Math.sin(a) * 0.05];
    const bot: [number, number, number] = [Math.cos(a) * 0.55, 0.0, Math.sin(a) * 0.55];
    b.rod(top, bot, 0.025, woodDark, { bone: mount });
    // foot
    b.part(new THREE.CylinderGeometry(0.035, 0.03, 0.04, 6), dark, { at: [bot[0], 0.02, bot[2]], bone: mount });
    // brace
    const mid: [number, number, number] = [Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3];
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), brass, { at: mid, bone: mount });
  }

  // Tripod head
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.06, 6), dark, { at: [0, baseH + 0.01, 0], bone: mount });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), brass, { at: [0, baseH + 0.08, 0], bone: mount });

  // Fork / yoke
  b.part(new THREE.BoxGeometry(0.05, 0.2, 0.08), dark, { at: [0.1, baseH + 0.2, 0], bone: mount });
  b.part(new THREE.BoxGeometry(0.05, 0.2, 0.08), dark, { at: [-0.1, baseH + 0.2, 0], bone: mount });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), brass, {
    at: [0, baseH + 0.25, 0], bone: tube, dir: [1, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), brass, { at: [0.16, baseH + 0.25, 0], bone: tube });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), brass, { at: [-0.16, baseH + 0.25, 0], bone: tube });

  // Main tube (pointing +Z, tilted up slightly)
  const cy = baseH + 0.25;
  const tilt = 0.25;
  const tg = new THREE.Group();
  const ty = (z: number, y = 0): [number, number, number] => [
    0,
    cy + Math.sin(tilt) * z + Math.cos(tilt) * y,
    Math.cos(tilt) * z - Math.sin(tilt) * y,
  ];
  const axis: [number, number, number] = [0, Math.sin(tilt), Math.cos(tilt)];

  const seg = (z0: number, z1: number, r: number, col: string) => {
    b.part(new THREE.CylinderGeometry(r, r, z1 - z0, 16), col, {
      at: ty((z0 + z1) / 2), dir: axis, bone: tube,
    });
  };
  // main body white with brass bands
  seg(-0.3, 0.7, 0.07, white);
  // dew shield
  b.part(new THREE.CylinderGeometry(0.095, 0.085, 0.3, 16, 1, true), blue, {
    at: ty(0.85), dir: axis, bone: tube,
  });
  // lens cell
  seg(0.7, 0.72, 0.09, brass);
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), lens, { at: ty(0.78), dir: axis, bone: tube });
  // bands
  for (const z of [-0.25, 0.1, 0.45, 0.7]) {
    b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 16), brass, { at: ty(z), dir: axis, bone: tube });
  }
  // rear cell
  b.part(new THREE.CylinderGeometry(0.09, 0.07, 0.1, 12), dark, { at: ty(-0.35), dir: axis, bone: tube });
  // focuser
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 10), brass, { at: ty(-0.5), dir: axis, bone: tube });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.03), dark, { at: ty(-0.46), dir: axis, bone: tube });
  // focus knobs
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), dark, {
    at: ty(-0.46), dir: [1, 0, 0], bone: tube,
  });
  // eyepiece
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 10), dark, { at: ty(-0.65), dir: axis, bone: tube });
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.04, 10), brass, { at: ty(-0.72), dir: axis, bone: tube });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 10), lens, { at: ty(-0.745), dir: axis, bone: tube });

  // Finder scope on top
  const fy = (z: number): [number, number, number] => ty(z, 0.14);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 10), dark, { at: fy(0.0), dir: axis, bone: tube });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), brass, { at: fy(0.15), dir: axis, bone: tube });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 10), lens, { at: fy(0.17), dir: axis, bone: tube });
  b.part(new THREE.CylinderGeometry(0.025, 0.02, 0.05, 10), brass, { at: fy(-0.17), dir: axis, bone: tube });
  for (const z of [-0.08, 0.08]) {
    b.part(new THREE.BoxGeometry(0.02, 0.07, 0.03), brass, { at: ty(z, 0.1), dir: axis, bone: tube });
    b.part(new THREE.TorusGeometry(0.025, 0.007, 5, 10), brass, { at: fy(z), dir: axis, bone: tube });
  }

  return b.root;
}
```