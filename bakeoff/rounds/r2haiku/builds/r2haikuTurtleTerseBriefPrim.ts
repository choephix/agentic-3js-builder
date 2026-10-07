import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

export const meta = {
  name: "sea turtle",
  description: "A green sea turtle with a domed shell, paddle flippers and a hooked beak, in rest pose.",
};

type V3 = [number, number, number];

const SHELL = "#5f7a34";
const SCUTE = "#3a4f22";
const SCUTE_LT = "#7d9446";
const PLASTRON = "#e9dfb4";
const SKIN = "#8fae63";
const SKIN_D = "#5d7a3e";
const BEAK = "#e0c46e";
const DARK = "#1d2418";
const EYE = "#f4f1e6";
const PUPIL = "#0d0f0a";
const BARNACLE = "#d8d2b8";

// Shell is an ellipsoid: half-widths and centre height.
const SX = 0.42;
const SY = 0.16;
const SZ = 0.5;
const CY = 0.2;

// Point on the upper shell at elevation E (0 = rim, PI/2 = crown) and azimuth A.
function shellPoint(E: number, A: number): V3 {
  const c = Math.cos(E);
  return [SX * c * Math.sin(A), CY + SY * Math.sin(E), SZ * c * Math.cos(A)];
}

// Outward normal of the shell ellipsoid at a point.
function shellNormal(p: V3): V3 {
  const n: V3 = [p[0] / (SX * SX), (p[1] - CY) / (SY * SY), p[2] / (SZ * SZ)];
  const l = Math.hypot(n[0], n[1], n[2]);
  return [n[0] / l, n[1] / l, n[2] / l];
}

export default function build() {
  const b = createBuilder({ name: "sea turtle" });
  const rand = rng(11);

  // Core skeleton.
  const root = b.joint("root", { at: [0, CY, 0] });
  const head = b.joint("head", { at: [0, 0.36, 0.86], parent: root });
  const jaw = b.joint("jaw", { at: [0, 0.31, 0.92], parent: head });

  const shL = b.joint("shoulderL", { at: [0.28, 0.08, 0.2], parent: root });
  const shR = b.joint("shoulderR", { at: [-0.28, 0.08, 0.2], parent: root });
  const hipL = b.joint("hipL", { at: [0.24, 0.08, -0.36], parent: root });
  const hipR = b.joint("hipR", { at: [-0.24, 0.08, -0.36], parent: root });

  // Shell: domed carapace over a flat, pale plastron.
  b.part(
    new THREE.SphereGeometry(0.5, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    SHELL,
    { at: [0, CY, 0], scale: [SX / 0.5, SY / 0.5, SZ / 0.5], bone: root },
  );
  b.part(
    new THREE.SphereGeometry(0.5, 28, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    PLASTRON,
    { at: [0, CY, 0], scale: [SX / 0.5, 0.07 / 0.5, SZ / 0.5], bone: root },
  );

  // Hexagonal scutes laid in rings across the carapace.
  const rings: Array<[number, number, number]> = [
    [0.22, 8, 0],
    [0.62, 6, 0.3],
    [1.02, 4, 0.0],
  ];
  let k = 0;
  for (const [E, n, off] of rings) {
    for (let i = 0; i < n; i++) {
      const A = off + (i * Math.PI * 2) / n;
      const p = shellPoint(E, A);
      const nrm = shellNormal(p);
      const s = 0.92 + rand() * 0.16;
      const col = k % 3 === 0 ? SCUTE_LT : SCUTE;
      b.stick(
        new THREE.CylinderGeometry(0.1 * s, 0.11 * s, 0.025, 6),
        col,
        frame(p, nrm),
      );
      k++;
    }
  }
  // Crown scute.
  b.stick(
    new THREE.CylinderGeometry(0.11, 0.12, 0.025, 6),
    SCUTE_LT,
    frame(shellPoint(1.5, 0), shellNormal(shellPoint(1.5, 0))),
  );

  // A few barnacles on the rim.
  for (let i = 0; i < 6; i++) {
    const A = rand() * Math.PI * 2;
    const p = shellPoint(0.1 + rand() * 0.12, A);
    b.stick(new THREE.SphereGeometry(0.018, 6, 5), BARNACLE, frame(p, shellNormal(p)));
  }

  // Neck and tail as smooth bending tubes on their own chains.
  const neck = b.chain(
    "neck",
    [
      [0, 0.24, 0.36],
      [0, 0.3, 0.5],
      [0, 0.34, 0.66],
      [0, 0.36, 0.8],
    ],
    { role: "neck" },
  );
  b.sweep(neck, 0.075, { color: SKIN });

  const tail = b.chain(
    "tail",
    [
      [0, 0.17, -0.4],
      [0, 0.16, -0.6],
      [0, 0.14, -0.72],
    ],
    { role: "tail" },
  );
  b.sweep(tail, 0.05, { color: SKIN_D });

  // Head.
  b.part(new THREE.SphereGeometry(0.12, 18, 14), SKIN, {
    at: [0, 0.36, 0.86],
    scale: [0.95, 0.9, 1.15],
    bone: head,
  });

  // Hooked beak: upper on the head, lower on the jaw.
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.12), BEAK, {
    at: [0, 0.345, 0.96],
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.035, 0.03, 0.04), DARK, {
    at: [0, 0.335, 1.02],
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.09, 0.04, 0.1), BEAK, {
    at: [0, 0.31, 0.95],
    bone: jaw,
  });

  // Eyes with pupils.
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.028, 12, 10), EYE, {
      at: [0.095 * sx, 0.38, 0.9],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), PUPIL, {
      at: [0.11 * sx, 0.38, 0.92],
      bone: head,
    });
  }

  // Front flippers: flat paddles, outward along +X (mirrored for -X).
  const frontOutline: Array<[number, number]> = [
    [0, -0.07],
    [0.18, -0.1],
    [0.38, -0.06],
    [0.5, 0.03],
    [0.46, 0.1],
    [0.26, 0.1],
    [0.05, 0.07],
  ];
  b.extrude(frontOutline, {
    at: [0.28, 0.05, 0.2],
    x: [1, 0, 0],
    y: [0, 0, 1],
    color: SKIN,
    bone: shL,
  } as any);
  b.extrude(frontOutline, {
    at: [-0.28, 0.05, 0.2],
    x: [-1, 0, 0],
    y: [0, 0, 1],
    color: SKIN,
    bone: shR,
  } as any);

  // Rear flippers: smaller, swept back.
  const rearOutline: Array<[number, number]> = [
    [0, -0.05],
    [0.12, -0.07],
    [0.22, -0.03],
    [0.2, 0.05],
    [0.06, 0.06],
  ];
  b.extrude(rearOutline, {
    at: [0.24, 0.06, -0.36],
    x: [1, 0, 0],
    y: [0, 0, 1],
    color: SKIN_D,
    bone: hipL,
  } as any);
  b.extrude(rearOutline, {
    at: [-0.24, 0.06, -0.36],
    x: [-1, 0, 0],
    y: [0, 0, 1],
    color: SKIN_D,
    bone: hipR,
  } as any);

  return b.root;
}
