import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "koala",
  description:
    "A sitting koala: soft grey fur, cream chest, chin and ear linings, a big black nose, and a eucalyptus sprig in its right paw.",
};

type V3 = [number, number, number];

const FUR = "#8d9299";
const CREAM = "#f0e8d6";
const INK = "#1b1b20";
const SHINE = "#ffffff";
const LEAF = "#6f9886";

/** Ellipsoid with semi-axes rx, ry, rz, centred on the origin, scale baked in. */
function blob(rx: number, ry: number, rz: number, w = 12, h = 9): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

/** Cone with its apex along +Y: a claw once it is seated on a surface. */
function claw(): THREE.BufferGeometry {
  return new THREE.ConeGeometry(0.009, 0.034, 5, 1);
}

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Skeleton ---------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.14, 0] });
  const spine = b.joint("spine", { at: [0, 0.36, 0.01], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.54, 0.03], parent: spine });
  const head = b.joint("head", { at: [0, 0.66, 0.06], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.6, 0.12], parent: head });
  const tail = b.joint("tail", { at: [0, 0.2, -0.2], parent: hips });

  // Body: rump on the floor, chest above, cream front --------------------
  b.part(blob(0.2, 0.2, 0.19), FUR, { at: [0, 0.2, -0.02], bone: hips });
  const chest = b.part(blob(0.18, 0.2, 0.17), FUR, { at: [0, 0.42, 0.02], bone: spine });
  b.part(blob(0.11, 0.14, 0.035, 10, 8), CREAM, {
    at: b.surface(chest).nearest([0, 0.4, 0.2]),
    bone: spine,
  });
  b.part(blob(0.035, 0.035, 0.035, 8, 6), CREAM, { at: [0, 0.2, -0.22], bone: tail });

  // Head: wide and round, black nose, cream chin on the lower jaw ---------
  const headPart = b.part(blob(0.19, 0.16, 0.165, 14, 10), FUR, { at: [0, 0.66, 0.06], bone: head });
  const face = b.surface(headPart);
  b.part(blob(0.055, 0.04, 0.035, 10, 8), INK, { at: face.nearest([0, 0.67, 0.25]), bone: head });
  b.part(blob(0.075, 0.04, 0.05, 10, 7), CREAM, { at: [0, 0.6, 0.18], bone: jaw });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Eyes: dark beads seated on the face, each with a small shine
    const eye = b.part(blob(0.022, 0.026, 0.02, 8, 6), INK, {
      at: face.nearest([0.1 * s, 0.715, 0.2]),
      bone: head,
    });
    b.stick(blob(0.0075, 0.0075, 0.0075, 6, 4), SHINE, b.surface(eye).nearest([0.11 * s, 0.735, 0.24]));

    // Ears: puffy discs tilted out, with a cream lining on the outer face
    const ear = b.joint(`ear${L}`, { at: [0.14 * s, 0.77, 0.02], parent: head });
    const outer = blob(0.03, 0.085, 0.085, 12, 9);
    outer.rotateZ(-s * 0.3);
    b.part(outer, FUR, { at: [0.14 * s, 0.77, 0.02], bone: ear });
    const lining = blob(0.014, 0.06, 0.06, 10, 7);
    lining.rotateZ(-s * 0.3);
    b.part(lining, CREAM, { at: [0.165 * s, 0.762, 0.02], bone: ear });
  }

  // Arms: long and hanging, paws with three claws; right paw holds a sprig
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shoulderP: V3 = [0.15 * s, 0.48, 0.02];
    const elbowP: V3 = [0.22 * s, 0.33, 0.1];
    const wristP: V3 = [0.23 * s, 0.2, 0.17];

    const shoulder = b.joint(`shoulder${L}`, { at: shoulderP, parent: spine });
    const elbow = b.joint(`elbow${L}`, { at: elbowP, parent: shoulder });
    const wrist = b.joint(`wrist${L}`, { at: wristP, parent: elbow });

    b.part(blob(0.06, 0.06, 0.06, 10, 8), FUR, { at: shoulderP, bone: shoulder });
    b.sweep([shoulderP, elbowP], 0.05, { color: FUR });
    b.part(blob(0.05, 0.05, 0.05, 9, 7), FUR, { at: elbowP, bone: elbow });
    b.sweep([elbowP, wristP], 0.045, { color: FUR });

    const paw = b.part(blob(0.055, 0.045, 0.06, 10, 8), FUR, { at: [0.23 * s, 0.18, 0.18], bone: wrist });
    const pawFace = b.surface(paw);
    for (const dx of [-0.03, 0, 0.03]) {
      b.stick(claw(), INK, pawFace.nearest([0.23 * s + dx, 0.1, 0.2]));
    }

    if (s < 0) {
      const leafA = blob(0.028, 0.004, 0.09, 8, 4);
      leafA.rotateX(-0.6);
      b.part(leafA, LEAF, { at: [-0.25, 0.22, 0.2], bone: wrist });

      const leafB = blob(0.024, 0.004, 0.075, 8, 4);
      leafB.rotateX(-0.9);
      leafB.rotateY(0.5);
      b.part(leafB, LEAF, { at: [-0.22, 0.25, 0.24], bone: wrist });
    }
  }

  // Legs: short and folded forward, feet flat on the floor ---------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hipP: V3 = [0.13 * s, 0.13, 0];
    const kneeP: V3 = [0.15 * s, 0.09, 0.17];
    const ankleP: V3 = [0.14 * s, 0.05, 0.27];
    const toeP: V3 = [0.14 * s, 0.03, 0.34];

    const hip = b.joint(`hip${L}`, { at: hipP, parent: hips });
    const knee = b.joint(`knee${L}`, { at: kneeP, parent: hip });
    const ankle = b.joint(`ankle${L}`, { at: ankleP, parent: knee });
    const toe = b.joint(`toe${L}`, { at: toeP, parent: ankle });

    b.part(blob(0.08, 0.08, 0.08, 10, 8), FUR, { at: hipP, bone: hip });
    b.sweep([hipP, kneeP], 0.075, { color: FUR });
    b.part(blob(0.065, 0.065, 0.065, 9, 7), FUR, { at: kneeP, bone: knee });
    b.sweep([kneeP, ankleP], 0.05, { color: FUR });

    const foot = b.part(blob(0.075, 0.03, 0.1, 12, 7), FUR, { at: [0.14 * s, 0.03, 0.31], bone: toe });
    const footFace = b.surface(foot);
    for (const dx of [-0.04, 0, 0.04]) {
      b.stick(claw(), INK, footFace.nearest([0.14 * s + dx, 0.03, 0.42]));
    }
  }

  return b.root;
}
