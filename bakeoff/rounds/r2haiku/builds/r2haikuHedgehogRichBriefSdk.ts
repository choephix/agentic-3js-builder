import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "hedgehog",
  description: "A plump chestnut hedgehog on an autumn walk, with cream-tipped spines, a fawn pointed snout, a black button nose, and a red maple leaf stuck on its back.",
};

const C = {
  chestnut: "#7a4a2a",
  cream: "#f1e3c2",
  fawn: "#d9b07a",
  belly: "#c9a06a",
  ear: "#b98a5c",
  earIn: "#e0a9a0",
  black: "#1a1412",
  pink: "#e8a0a0",
  red: "#c0282d",
  stem: "#5a3520",
  white: "#ffffff",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const rand = rng(11);

  // Skeleton: a root at the body centre, then a spine chain running rump to head.
  b.joint("hips", { at: [0, 0.07, -0.02] });
  const spine = b.chain("spine", [
    [0, 0.065, -0.13],
    [0, 0.075, -0.05],
    [0, 0.075, 0.02],
    [0, 0.065, 0.085],
  ]);

  // Plump body, fawn underneath where the spines don't reach.
  const body = b.sweep(spine, 0.062, { color: C.belly });

  // Dome of spines: rings of points on an ellipsoid over the back, pulled onto
  // the body surface by nearest(). Front (face) area is skipped.
  const surf = b.surface(body);
  const cx = 0, cy = 0.072, cz = -0.02;
  const ax = 0.075, ay = 0.088, az = 0.14;
  const rows = 7;
  const cols = 16;
  for (let r = 0; r < rows; r++) {
    const alpha = 0.35 + (r / (rows - 1)) * 1.0 + (rand() - 0.5) * 0.08;
    for (let c = 0; c < cols; c++) {
      const t = (c / cols) * Math.PI * 2 + (r % 2) * (Math.PI / cols) + (rand() - 0.5) * 0.2;
      const p: [number, number, number] = [
        cx + ax * Math.sin(alpha) * Math.sin(t),
        cy + ay * Math.cos(alpha),
        cz + az * Math.sin(alpha) * Math.cos(t),
      ];
      if (p[2] > 0.0) continue; // keep the face clear
      const hit = surf.nearest(p);
      const len = 0.03 + rand() * 0.02;
      const cream = rand() < 0.4;
      b.part(b.spike(hit, hit, len, 0.0055), cream ? C.cream : C.chestnut);
    }
  }

  // Head: a fawn ball with a pointed, elongated snout.
  b.part(new THREE.SphereGeometry(0.05, 14, 10), C.fawn, {
    at: [0, 0.08, 0.13],
    scale: [1, 0.95, 1.1],
  });
  const snout = new THREE.ConeGeometry(0.032, 0.09, 8);
  snout.rotateX(Math.PI / 2); // tip points to +Z
  b.part(snout, C.fawn, { at: [0, 0.072, 0.185] });

  // Shiny black button nose.
  b.part(new THREE.SphereGeometry(0.013, 10, 8), C.black, {
    at: [0, 0.078, 0.228],
    scale: [1.2, 0.8, 1],
  });

  // Bright beady eyes with a small highlight.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 10, 8), C.black, {
      at: [s * 0.03, 0.095, 0.158],
    });
    b.part(new THREE.SphereGeometry(0.003, 6, 5), C.white, {
      at: [s * 0.033, 0.098, 0.165],
    });
  }

  // Tiny round ears with pink insides.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, 10, 8), C.ear, {
      at: [s * 0.043, 0.117, 0.105],
      scale: [0.5, 1, 0.35],
    });
    b.part(new THREE.SphereGeometry(0.009, 8, 6), C.earIn, {
      at: [s * 0.045, 0.117, 0.108],
      scale: [0.5, 1, 0.35],
    });
  }

  // Little pink paws, touching the floor.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 10, 8), C.pink, {
      at: [s * 0.036, 0.012, 0.075],
      scale: [1, 0.55, 1.25],
    });
    b.part(new THREE.SphereGeometry(0.022, 10, 8), C.pink, {
      at: [s * 0.04, 0.012, -0.12],
      scale: [1, 0.55, 1.25],
    });
  }

  // A red maple leaf impaled on a stem of spines on top of the back.
  b.part(b.spike([0, 0.15, -0.05], [0, 1, 0], 0.06, 0.004), C.stem);
  const outline: number[][] = [];
  for (let k = 0; k < 10; k++) {
    const ang = ((90 + k * 36) * Math.PI) / 180;
    const r = k % 2 === 0 ? 0.045 : 0.02;
    outline.push([r * Math.cos(ang), r * Math.sin(ang)]);
  }
  const leaf = b.extrude(outline, {
    at: [0, 0.21, -0.05],
    x: [0.7, 0, 0.7],
    y: [-0.7, 0, 0.7],
  });
  b.part(leaf, C.red);

  return b.root;
}
