import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "green-sea-turtle",
  description:
    "A green sea turtle gliding through the water, with an olive and caramel heart-shaped shell, a pale plastron, cream-edged head scales, and a remora riding beneath.",
};

// Palette
const OLIVE = "#5f6b2e";
const CARAMEL = "#b07d45";
const SHELL_LINE = "#3d2a1a";
const PLASTRON = "#efe2a6";
const SKIN = "#7d8a4a";
const HEAD = "#7a8745";
const SCALE_CREAM = "#e9dfb8";
const BEAK = "#5c5a3a";
const EYE = "#120e0a";
const EYE_GLINT = "#fff8e0";
const REMORA = "#3b3a36";
const REMORA_DARK = "#1f1d1a";

// Shell centre and radii (metres), model faces +Z, left is +X
const SHELL_C: [number, number, number] = [0, 0.34, -0.02];
const SHELL_A = 0.47; // half width
const SHELL_H = 0.2; // half height
const SHELL_B = 0.52; // half length

// Point on the shell ellipsoid: th from the top, ph around the shell
function shellPoint(th: number, ph: number): number[] {
  return [
    SHELL_C[0] + SHELL_A * Math.sin(th) * Math.sin(ph),
    SHELL_C[1] + SHELL_H * Math.cos(th),
    SHELL_C[2] + SHELL_B * Math.sin(th) * Math.cos(ph),
  ];
}

// Point on the head ellipsoid, same convention
function headPoint(dx: number, dy: number, dz: number): number[] {
  return [0.0 + dx, 0.37 + dy, 0.86 + dz];
}

export default function build() {
  const b = createBuilder({ name: "green-sea-turtle" });
  const rand = rng(7);

  // ---------- Skeleton: root body ----------
  const hips = b.joint("hips", { at: [0, 0.3, 0] });

  const head = b.joint("head", { at: [0, 0.37, 0.86], parent: hips });
  const jaw = b.joint("jaw", { at: [0, 0.32, 0.98], parent: head });

  const flipperL = b.joint("flipperL", { at: [0.28, 0.26, 0.25], parent: hips });
  const flipperR = b.joint("flipperR", { at: [-0.28, 0.26, 0.25], parent: hips });
  const rearL = b.joint("rearL", { at: [0.24, 0.2, -0.4], parent: hips });
  const rearR = b.joint("rearR", { at: [-0.24, 0.2, -0.4], parent: hips });

  const remora = b.joint("remora", { at: [0.02, 0.12, 0.0], parent: hips });

  // ---------- Shell ----------
  const shell = b.part(new THREE.SphereGeometry(1, 24, 14), OLIVE, {
    at: SHELL_C,
    bone: hips,
    scale: [SHELL_A, SHELL_H, SHELL_B],
  });
  const shellSurf = b.surface(shell);

  // Pale plastron under the shell
  b.part(new THREE.SphereGeometry(1, 18, 8), PLASTRON, {
    at: [0, 0.225, -0.02],
    bone: hips,
    scale: [0.38, 0.09, 0.46],
  });

  // Scutes: hexagonal plates traced in dark brown, alternating olive and caramel
  const rows = [
    { th: 0.0, n: 1, r: 0.1, off: 0 },
    { th: 0.5, n: 6, r: 0.09, off: 0.3 },
    { th: 0.95, n: 10, r: 0.082, off: 0.1 },
    { th: 1.25, n: 12, r: 0.068, off: 0.5 },
  ];
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) {
      const ph = (i / row.n) * Math.PI * 2 + row.off;
      const r = row.r * (0.95 + 0.1 * rand());
      const hit = shellSurf.nearest(shellPoint(row.th, ph));
      const plateColor = (i + ri) % 3 === 0 ? CARAMEL : OLIVE;
      b.stick(new THREE.CylinderGeometry(r * 1.14, r * 1.02, 0.04, 6), SHELL_LINE, hit);
      b.stick(new THREE.CylinderGeometry(r, r * 0.9, 0.03, 6), plateColor, hit);
    }
  });

  // ---------- Neck and head ----------
  const neckPath = [
    [0, 0.34, 0.4],
    [0, 0.37, 0.62],
    [0, 0.38, 0.8],
  ];
  b.chain("neck", neckPath);
  b.sweep(neckPath, 0.1, { color: SKIN });

  const headPart = b.part(new THREE.SphereGeometry(1, 20, 14), HEAD, {
    at: [0, 0.37, 0.86],
    bone: head,
    scale: [0.12, 0.1, 0.15],
  });
  const headSurf = b.surface(headPart);

  // Cream-edged scales scattered on the head
  for (let i = 0; i < 26; i++) {
    const u = rand() * 2 - 1;
    const v = rand() * 2 - 1;
    const w = rand() * 2 - 1;
    const len = Math.hypot(u, v, w) || 1;
    const p = headPoint((u / len) * 0.12, (v / len) * 0.1, (w / len) * 0.15);
    const hit = headSurf.nearest(p);
    b.stick(new THREE.BoxGeometry(0.03, 0.012, 0.03), SCALE_CREAM, hit);
  }

  // Upper beak, gentle and blunt
  b.part(new THREE.SphereGeometry(1, 14, 10), BEAK, {
    at: [0, 0.36, 1.0],
    bone: head,
    scale: [0.08, 0.045, 0.08],
  });

  // Lower jaw
  b.part(new THREE.SphereGeometry(1, 14, 8), SCALE_CREAM, {
    at: [0, 0.32, 0.98],
    bone: jaw,
    scale: [0.07, 0.03, 0.09],
  });

  // Wise eyes: dark, with brow hoods and a small glint
  for (const side of [1, -1]) {
    const ex = 0.1 * side;
    const eyeHit = headSurf.nearest(headPoint(ex, 0.02, 0.09));
    b.stick(new THREE.SphereGeometry(0.024, 12, 10), EYE, eyeHit);

    const glintHit = headSurf.nearest(headPoint(ex + 0.006 * side, 0.04, 0.1));
    b.stick(new THREE.SphereGeometry(0.007, 8, 6), EYE_GLINT, glintHit);

    const broHit = headSurf.nearest(headPoint(ex, 0.055, 0.07));
    b.stick(new THREE.BoxGeometry(0.075, 0.018, 0.035), SHELL_LINE, broHit);
  }

  // ---------- Tail ----------
  const tailPath = [
    [0, 0.29, -0.5],
    [0, 0.28, -0.7],
    [0, 0.27, -0.84],
  ];
  b.chain("tail", tailPath);
  b.sweep(tailPath, 0.045, { color: SKIN });

  // ---------- Front flippers: long flat paddles spread wide ----------
  const paddle = [
    [0, 0.2],
    [0.3, 0.19],
    [0.62, 0.12],
    [0.85, 0.02],
    [0.94, -0.08],
    [0.8, -0.16],
    [0.5, -0.2],
    [0.2, -0.18],
    [0, -0.12],
  ];
  b.extrude(paddle, {
    at: flipperL,
    x: [1, 0, -0.2],
    y: [0, 0, 1],
  });
  b.extrude(paddle, {
    at: flipperR,
    x: [-1, 0, -0.2],
    y: [0, 0, 1],
  });

  // ---------- Rear flippers: short paddles ----------
  const rearPaddle = [
    [0, 0.13],
    [0.2, 0.12],
    [0.38, 0.06],
    [0.46, -0.02],
    [0.34, -0.1],
    [0.12, -0.12],
    [0, -0.08],
  ];
  b.extrude(rearPaddle, {
    at: rearL,
    x: [1, 0, -0.45],
    y: [0, 0, 1],
  });
  b.extrude(rearPaddle, {
    at: rearR,
    x: [-1, 0, -0.45],
    y: [0, 0, 1],
  });

  // ---------- Remora riding under the shell ----------
  b.part(new THREE.SphereGeometry(1, 14, 10), REMORA, {
    at: [0.02, 0.12, 0.0],
    bone: remora,
    scale: [0.035, 0.035, 0.2],
  });
  b.part(new THREE.ConeGeometry(0.045, 0.1, 4).rotateX(Math.PI / 2), REMORA, {
    at: [0.02, 0.12, -0.25],
    bone: remora,
  });
  // Suction disc on top of the head
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), REMORA_DARK, {
    at: [0.02, 0.158, 0.13],
    bone: remora,
  });
  // Small dorsal fin
  b.part(new THREE.BoxGeometry(0.008, 0.03, 0.06), REMORA_DARK, {
    at: [0.02, 0.15, -0.02],
    bone: remora,
  });

  return b.root;
}
