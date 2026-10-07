import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Emperor penguin and chick",
  description:
    "A proud emperor penguin parent with a fluffy grey chick peeking out from between its feet.",
};

type Vec3 = [number, number, number];

// Palette: one flat colour per string.
const BLUE_BLACK = "#1b2440";
const WHITE = "#f4f7fa";
const GOLD = "#f4b63e";
const BEAK = "#23252d";
const PINK = "#f38b6c";
const FOOT = "#0d0f14";
const EYE = "#07080c";
const GLINT = "#ffffff";
const DOWN = "#a8b0b9";
const DOWN_LIGHT = "#d2d8de";
const DOWN_DARK = "#8a939d";

/** Ellipsoid centred on the origin with radii along x, y, z. */
function ellipsoid(r: Vec3, seg = 14): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.max(5, Math.round(seg * 0.7)));
  g.scale(r[0], r[1], r[2]);
  return g;
}

/** Tapered beak with its tip towards +Z, optional droop and vertical flattening. */
function beak(
  tipR: number,
  baseR: number,
  len: number,
  droop: number,
  flatten: number,
): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(tipR, baseR, len, 8, 1);
  g.rotateX(Math.PI / 2 + droop);
  g.scale(1, flatten, 1);
  return g;
}

/** Webbed foot: a fan-shaped plate lying flat, heel at the origin, toes towards +Z. */
function webFoot(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-0.085, 0.13);
  s.lineTo(-0.035, 0.2);
  s.lineTo(0, 0.165);
  s.lineTo(0.035, 0.2);
  s.lineTo(0.085, 0.13);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: false });
  g.rotateX(Math.PI / 2); // shape y becomes +Z (forward), extrusion points down
  g.translate(0, 0.022, 0); // rest on the floor
  return g;
}

export default function build() {
  const b = createBuilder({ name: "emperor-penguin" });

  // Skeleton: pelvis at the root, up through chest, neck and head.
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const chest = b.joint("chest", { at: [0, 0.6, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.9, 0.03], parent: chest });
  const head = b.joint("head", { at: [0, 0.98, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.97, 0.12], parent: head });
  const wingL = b.joint("wingL", { at: [0.24, 0.8, 0], parent: chest });
  const wingR = b.joint("wingR", { at: [-0.24, 0.8, 0], parent: chest });
  const legL = b.joint("legL", { at: [0.13, 0.2, 0], parent: hips });
  const legR = b.joint("legR", { at: [-0.13, 0.2, 0], parent: hips });
  const footL = b.joint("footL", { at: [0.13, 0.02, -0.02], parent: legL });
  const footR = b.joint("footR", { at: [-0.13, 0.02, -0.02], parent: legR });
  const tail = b.joint("tail", { at: [0, 0.28, -0.2], parent: hips });
  const chick = b.joint("chick", { at: [0, 0.13, 0.13], parent: hips });

  // Torso: blue-black back with a white front that bulges past it.
  b.part(ellipsoid([0.27, 0.43, 0.25], 16), BLUE_BLACK, { at: [0, 0.58, 0], bone: chest });
  b.part(ellipsoid([0.22, 0.37, 0.22], 14), WHITE, { at: [0, 0.56, 0.1], bone: chest });

  // Head.
  b.part(ellipsoid([0.13, 0.14, 0.13], 14), BLUE_BLACK, { at: [0, 0.98, 0.03], bone: head });

  for (const s of [1, -1]) {
    // Gold ear patch on the side of the head.
    b.part(ellipsoid([0.04, 0.075, 0.07], 10), GOLD, {
      at: [s * 0.115, 0.965, -0.005],
      bone: head,
    });
    // Gold neck patch sitting on the join between black side and white front.
    b.part(ellipsoid([0.06, 0.1, 0.085], 10), GOLD, { at: [s * 0.14, 0.87, 0.1], bone: neck });

    // Eye with a glint.
    b.part(ellipsoid([0.022, 0.022, 0.022], 8), EYE, { at: [s * 0.07, 1.0, 0.135], bone: head });
    b.part(ellipsoid([0.007, 0.007, 0.007], 6), GLINT, {
      at: [s * 0.078, 1.008, 0.152],
      bone: head,
    });

    // Orange-pink band along the sides of the lower mandible.
    b.part(ellipsoid([0.009, 0.02, 0.085], 8), PINK, { at: [s * 0.017, 0.952, 0.2], bone: jaw });
  }

  // Slender beak: upper mandible on the head, lower mandible on the jaw.
  b.part(beak(0.007, 0.034, 0.25, 0.12, 0.6), BEAK, { at: [0, 0.997, 0.225], bone: head });
  b.part(beak(0.006, 0.026, 0.22, 0.1, 0.5), BEAK, { at: [0, 0.955, 0.22], bone: jaw });

  // Stubby flippers, held a little out from the sides.
  for (const s of [1, -1]) {
    const a = s * THREE.MathUtils.degToRad(22);
    const g = ellipsoid([0.018, 0.13, 0.06], 10);
    g.rotateZ(a); // the long axis leans out from the body
    const sh = s * 0.24;
    const at: Vec3 = [sh + Math.sin(a) * 0.115, 0.8 - Math.cos(a) * 0.115, 0];
    b.part(g, BLUE_BLACK, { at, bone: s > 0 ? wingL : wingR });
  }

  // Legs and big black webbed feet.
  for (const s of [1, -1]) {
    const x = s * 0.13;
    const leg = s > 0 ? legL : legR;
    const foot = s > 0 ? footL : footR;
    b.part(new THREE.CylinderGeometry(0.03, 0.024, 0.2, 8), FOOT, { at: [x, 0.12, 0], bone: leg });
    b.part(webFoot(), FOOT, { at: [x, 0, -0.02], bone: foot });
  }

  // Short tail nub.
  b.part(ellipsoid([0.06, 0.04, 0.05], 8), BLUE_BLACK, { at: [0, 0.27, -0.21], bone: tail });

  // Chick: fluffy grey down, tucked under the belly between the feet.
  b.part(ellipsoid([0.085, 0.13, 0.1], 12), DOWN, { at: [0, 0.13, 0.13], bone: chick });
  b.part(ellipsoid([0.075, 0.075, 0.075], 10), DOWN_LIGHT, { at: [0, 0.26, 0.2], bone: chick });

  // Down bumps across the chick, placed on its surface.
  const fluffPalette = [DOWN, DOWN_LIGHT, DOWN_DARK];
  const puff = (c: Vec3, r: Vec3, n: number, size: number, floor: number) => {
    for (let i = 0; i < n; i++) {
      const t = Math.acos(1 - (2 * (i + 0.5)) / n);
      const p = i * 2.39996;
      const at: Vec3 = [
        c[0] + r[0] * Math.sin(t) * Math.cos(p),
        c[1] + r[1] * Math.cos(t),
        c[2] + r[2] * Math.sin(t) * Math.sin(p),
      ];
      if (at[1] < floor || at[2] < c[2] - 0.05) continue;
      b.part(ellipsoid([size, size, size], 6), fluffPalette[i % 3], { at, bone: chick });
    }
  };
  puff([0, 0.13, 0.13], [0.085, 0.13, 0.1], 22, 0.03, 0.03);
  puff([0, 0.26, 0.2], [0.075, 0.075, 0.075], 12, 0.02, 0.31);

  // Crown tufts.
  const tufts: [number, number, number, number][] = [
    [0, 0.335, 0.19, 0],
    [0.035, 0.325, 0.185, -0.4],
    [-0.035, 0.325, 0.185, 0.4],
  ];
  for (const [x, y, z, lean] of tufts) {
    const g = new THREE.ConeGeometry(0.022, 0.07, 6);
    g.rotateX(-0.5); // sweep back
    g.rotateZ(lean); // splay sideways
    b.part(g, DOWN_DARK, { at: [x, y, z], bone: chick });
  }

  // Chick eyes and tiny beak.
  for (const s of [1, -1]) {
    b.part(ellipsoid([0.012, 0.012, 0.012], 6), EYE, { at: [s * 0.035, 0.27, 0.262], bone: chick });
  }
  b.part(beak(0.002, 0.011, 0.035, 0, 0.8), BEAK, { at: [0, 0.25, 0.283], bone: chick });

  return b.root;
}
