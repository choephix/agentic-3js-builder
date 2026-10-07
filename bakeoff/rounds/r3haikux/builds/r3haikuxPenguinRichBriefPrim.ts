import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Emperor penguin and chick",
  description:
    "A proud emperor penguin with a fluffy grey chick peeking out from between its big black feet.",
};

const NAVY = "#1a2236";
const WHITE = "#f4f2ec";
const GOLD = "#f2b42c";
const EYE = "#040507";
const BEAK = "#17181d";
const PINK = "#f2846a";
const FEET = "#0f1116";
const DOWN = "#9aa2ad";
const DOWN_LIGHT = "#c9cfd8";
const CHICK_BEAK = "#2d3039";
const CHICK_FEET = "#5a616c";

/** Ellipsoid: a unit sphere stretched to the given radii. */
function ell(rx: number, ry: number, rz: number, seg = 16, rings = 12) {
  const g = new THREE.SphereGeometry(1, seg, rings);
  g.scale(rx, ry, rz);
  return g;
}

/** Turns a geometry built along +Y so that its +Y runs along `dir`. */
function aimed(g: THREE.BufferGeometry, dir: number[]) {
  const y = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const ref =
    Math.abs(y.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  return g;
}

/** A capsule segment from a to c, returned with its midpoint. */
function segment(a: number[], c: number[], r: number) {
  const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const len = Math.hypot(d[0], d[1], d[2]);
  return {
    g: aimed(new THREE.CapsuleGeometry(r, len - 2 * r, 4, 8), d),
    at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
  };
}

const sph = (r: number, seg = 8, rings = 6) => new THREE.SphereGeometry(r, seg, rings);

export default function build() {
  const b = createBuilder({ name: "emperor-penguin-chick" });

  // ---- skeleton ----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.36, 0] });
  const chest = b.joint("chest", { at: [0, 0.66, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.9, 0.03], parent: chest });
  const head = b.joint("head", { at: [0, 1.0, 0.04], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.953, 0.15], parent: head });
  const tail = b.joint("tail", { at: [0, 0.34, -0.18], parent: hips });
  const chick = b.joint("chick", { at: [0, 0.13, 0.08], parent: hips });
  const chickHead = b.joint("chickHead", { at: [0, 0.27, 0.17], parent: chick });

  // ---- body: blue-black back, white front --------------------------------
  b.part(ell(0.2, 0.42, 0.2, 20, 14), NAVY, { at: [0, 0.62, -0.02], bone: chest });
  const belly = b.part(ell(0.16, 0.36, 0.14, 18, 12), WHITE, {
    at: [0, 0.64, 0.1],
    bone: chest,
  });
  b.part(ell(0.05, 0.08, 0.025, 10, 8), NAVY, { at: [0, 0.36, -0.19], bone: tail });
  const headP = b.part(ell(0.125, 0.135, 0.13, 18, 14), NAVY, {
    at: [0, 1.0, 0.04],
    bone: head,
  });

  // ---- golden patches, eyes ----------------------------------------------
  const headSurf = b.surface(headP);
  const bellySurf = b.surface(belly);
  for (const s of [1, -1]) {
    // ear patch on the side of the head, just behind the eye
    b.stick(ell(0.05, 0.035, 0.05, 12, 8), GOLD, headSurf.nearest([s * 0.14, 1.02, 0.0]));
    // neck patch sweeping down into the white front
    b.stick(ell(0.05, 0.03, 0.05, 12, 8), GOLD, bellySurf.nearest([s * 0.1, 0.94, 0.2]));
    b.stick(ell(0.035, 0.025, 0.035, 10, 6), GOLD, bellySurf.nearest([s * 0.11, 0.84, 0.2]));
    // eye
    b.stick(sph(0.022, 10, 8), EYE, headSurf.nearest([s * 0.068, 1.03, 0.16]));
  }

  // ---- long slender beak with orange-pink flashes -------------------------
  const beakAxis = [0, 0.02, 1];
  const beakC = [0, 0.992, 0.26];
  b.part(aimed(new THREE.CylinderGeometry(0.012, 0.032, 0.24, 12, 1), beakAxis), BEAK, {
    at: beakC,
    bone: head,
  });
  for (const start of [Math.PI / 2 - 0.22, (3 * Math.PI) / 2 - 0.22]) {
    b.part(
      aimed(
        new THREE.CylinderGeometry(0.0145, 0.0345, 0.24, 12, 1, true, start, 0.44),
        beakAxis,
      ),
      PINK,
      { at: beakC, bone: head },
    );
  }
  b.part(aimed(new THREE.CylinderGeometry(0.008, 0.026, 0.2, 12, 1), [0, -0.02, 1]), BEAK, {
    at: [0, 0.953, 0.25],
    bone: jaw,
  });

  // ---- legs, webbed feet, stubby flippers ---------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = {
      hip: [s * 0.13, 0.3, -0.02],
      knee: [s * 0.15, 0.17, 0.01],
      ankle: [s * 0.18, 0.04, 0.05],
    };
    const hip = b.joint(`hip${side}`, { at: P.hip, parent: hips });
    const knee = b.joint(`knee${side}`, { at: P.knee, parent: hip });
    const ankle = b.joint(`ankle${side}`, { at: P.ankle, parent: knee });

    const thigh = segment(P.hip, P.knee, 0.03);
    b.part(thigh.g, FEET, { at: thigh.at, bone: hip });
    const shin = segment(P.knee, P.ankle, 0.022);
    b.part(shin.g, FEET, { at: shin.at, bone: knee });

    // webbed foot: a three-sided plate with the toe forward, splayed a touch
    const foot = new THREE.CylinderGeometry(0.115, 0.115, 0.03, 3, 1);
    foot.rotateY(s * 0.25);
    b.part(foot, FEET, { at: [s * 0.18, 0.015, 0.05], bone: ankle });

    // stubby flipper, held slightly out from the body
    const wing = b.joint(`wing${side}`, { at: [s * 0.16, 0.9, 0], parent: chest });
    const fin = new THREE.CylinderGeometry(0.06, 0.02, 0.28, 8, 1);
    fin.translate(0, -0.14, 0);
    fin.scale(0.4, 1, 1);
    fin.rotateZ(s * 0.3);
    b.part(fin, NAVY, { at: [s * 0.16, 0.9, 0], bone: wing });
  }

  // ---- fluffy grey chick, tucked between the feet ------------------------
  const cBody = b.part(ell(0.12, 0.13, 0.12, 14, 10), DOWN, {
    at: [0, 0.13, 0.08],
    bone: chick,
  });
  const cHead = b.part(ell(0.1, 0.1, 0.1, 14, 10), DOWN, {
    at: [0, 0.27, 0.17],
    bone: chickHead,
  });

  const bodyFluff = b.surface(cBody);
  const bodyC = [0, 0.13, 0.08];
  for (let i = 0; i < 44; i++) {
    const y = 0.9 - 1.2 * ((i + 0.5) / 44);
    const hit = bodyFluff.around(bodyC).at(i * 2.39996, Math.asin(y));
    b.stick(sph(0.03 + (i % 3) * 0.006), i % 3 === 0 ? DOWN_LIGHT : DOWN, hit);
  }

  const headFluff = b.surface(cHead);
  const headC = [0, 0.27, 0.17];
  for (let i = 0; i < 26; i++) {
    const y = 0.95 - 1.1 * ((i + 0.5) / 26);
    const hit = headFluff.around(headC).at(i * 2.39996 + 0.5, Math.asin(y));
    b.stick(sph(0.024 + (i % 2) * 0.006), i % 2 ? DOWN_LIGHT : DOWN, hit);
  }

  for (const s of [1, -1]) {
    b.stick(sph(0.013, 8, 6), EYE, headFluff.nearest([s * 0.045, 0.29, 0.255]));
  }

  b.part(aimed(new THREE.CylinderGeometry(0.004, 0.016, 0.05, 6, 1), [0, -0.3, 1]), CHICK_BEAK, {
    at: [0, 0.25, 0.275],
    bone: chickHead,
  });

  for (const s of [1, -1]) {
    const f = new THREE.CylinderGeometry(0.035, 0.035, 0.015, 3, 1);
    f.rotateY(s * 0.3);
    b.part(f, CHICK_FEET, { at: [s * 0.05, 0.0075, 0.19], bone: chick });
  }

  return b.root;
}
