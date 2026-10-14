```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "hedgehog",
  description:
    "A plump hedgehog on an autumn walk: chestnut spine dome with cream tips, a fawn pointed snout, a black button nose, and a red maple leaf stuck on its back.",
};

const CHESTNUT = "#7a3e1d";
const SPINE = "#8a4a24";
const CREAM = "#f3e6c8";
const FAWN = "#dcb98a";
const EAR = "#c4936a";
const BLACK = "#16110e";
const WHITE = "#ffffff";
const PINK = "#f2a0b5";
const RED = "#b8261a";

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const r = rng(11);

  // Skeleton: body, neck, head, four legs.
  const body = b.joint("body", { at: [0, 0.11, 0] });
  const neck = b.joint("neck", { at: [0, 0.12, 0.12], parent: body });
  const head = b.joint("head", { at: [0, 0.14, 0.2], parent: neck });
  const legFL = b.joint("legFL", { at: [0.07, 0.06, 0.07], parent: body });
  const legFR = b.joint("legFR", { at: [-0.07, 0.06, 0.07], parent: body });
  const legBL = b.joint("legBL", { at: [0.07, 0.06, -0.08], parent: body });
  const legBR = b.joint("legBR", { at: [-0.07, 0.06, -0.08], parent: body });

  // Plump body: an ellipsoid built from a unit sphere.
  const shell = b.part(new THREE.SphereGeometry(1, 18, 12), CHESTNUT, {
    at: [0, 0.11, 0],
    bone: body,
    scale: [0.11, 0.1, 0.14],
  });

  // Fawn belly, low and soft, so the underside reads as a different colour.
  b.part(new THREE.SphereGeometry(1, 12, 8), FAWN, {
    at: [0, 0.06, 0.05],
    bone: body,
    scale: [0.09, 0.05, 0.1],
  });

  // Head: fawn face with a pointed snout and a black button nose.
  b.part(new THREE.SphereGeometry(0.07, 14, 10), FAWN, {
    at: [0, 0.14, 0.2],
    bone: head,
    scale: [0.95, 0.9, 1.0],
  });
  b.part(new THREE.ConeGeometry(0.035, 0.1, 10), FAWN, {
    at: [0, 0.14, 0.285],
    dir: [0, 0, 1],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.013, 10, 8), BLACK, {
    at: [0, 0.14, 0.336],
    bone: head,
    scale: [1, 0.8, 0.8],
  });

  // Beady eyes with a small white glint each.
  for (const s of [-1, 1]) {
    const ex = s * 0.038;
    b.part(new THREE.SphereGeometry(0.011, 10, 8), BLACK, {
      at: [ex, 0.165, 0.255],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0035, 6, 5), WHITE, {
      at: [ex + s * 0.003, 0.17, 0.264],
      bone: head,
    });
  }

  // Tiny round ears, flattened against the head.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.022, 10, 8), EAR, {
      at: [s * 0.058, 0.205, 0.18],
      bone: head,
      scale: [1, 1, 0.35],
    });
  }

  // Little pink paws on stubby legs.
  const legs = [
    { joint: legFL, x: 0.07, z: 0.07 },
    { joint: legFR, x: -0.07, z: 0.07 },
    { joint: legBL, x: 0.07, z: -0.08 },
    { joint: legBR, x: -0.07, z: -0.08 },
  ];
  for (const leg of legs) {
    b.part(new THREE.CylinderGeometry(0.024, 0.026, 0.07, 8), CHESTNUT, {
      at: [leg.x, 0.035, leg.z],
      bone: leg.joint,
    });
    b.part(new THREE.SphereGeometry(0.03, 10, 8), PINK, {
      at: [leg.x, 0.016, leg.z + 0.012],
      bone: leg.joint,
      scale: [1, 0.6, 1.2],
    });
  }

  // Spines: short chestnut cones with cream tips, seated on the dome.
  const skin = b.surface(shell);
  const spineBase = new THREE.ConeGeometry(0.005, 0.03, 5);
  spineBase.translate(0, 0.015, 0);
  const spineTip = new THREE.ConeGeometry(0.0026, 0.016, 5);
  spineTip.translate(0, 0.03, 0);

  const rx = 0.11;
  const ry = 0.1;
  const rz = 0.14;
  const cy = 0.11;
  for (let i = 0; i < 9; i++) {
    const phi = 0.2 + i * 0.22;
    for (let j = 0; j < 16; j++) {
      const th = ((j + r() * 0.6) * Math.PI * 2) / 16;
      // Keep the face clear: no spines on the front of the head area.
      if (phi > 1.0 && Math.cos(th) > 0.35) continue;
      const p = [
        rx * Math.sin(phi) * Math.sin(th),
        cy + ry * Math.cos(phi),
        rz * Math.sin(phi) * Math.cos(th),
      ];
      const hit = skin.nearest(p);
      b.stick(spineBase, SPINE, hit);
      b.stick(spineTip, CREAM, hit);
    }
  }

  // Red maple leaf, stuck on the spines on top of the back.
  const pts = [
    [0, 0.05], [0.025, 0.02], [0.055, 0.035], [0.045, 0.005],
    [0.075, -0.01], [0.03, -0.035], [0.005, -0.03], [0, -0.07],
    [-0.005, -0.03], [-0.03, -0.035], [-0.075, -0.01], [-0.045, 0.005],
    [-0.055, 0.035], [-0.025, 0.02],
  ];
  const leafShape = new THREE.Shape();
  leafShape.moveTo(pts[0][0], pts[0][1]);
  for (let k = 1; k < pts.length; k++) leafShape.lineTo(pts[k][0], pts[k][1]);
  leafShape.closePath();
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.004,
    bevelEnabled: false,
  });
  leafGeo.rotateX(-Math.PI / 2); // lay the leaf flat, extrusion becomes +Y
  leafGeo.translate(0, 0.012, 0); // float it just above the spine tips
  const leafHit = skin.nearest([0.04, 0.24, -0.02]);
  b.stick(leafGeo, RED, leafHit);

  return b.root;
}
```