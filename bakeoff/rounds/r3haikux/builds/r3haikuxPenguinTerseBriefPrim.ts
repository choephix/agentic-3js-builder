import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "penguin",
  description:
    "A king penguin at rest: black back and head, white belly, gold breast and ear patches, orange beak and webbed feet.",
};

type P = [number, number, number];

const INK = "#1c222c"; // back and head
const SLATE = "#283240"; // flippers and tail, a shade lighter than the back
const SNOW = "#f5f2ea"; // belly and eye rings
const GOLD = "#f4b33a"; // breast and ear patches
const BEAK = "#f28b2b"; // upper beak and feet
const BEAK_LOW = "#d4701f"; // lower beak and legs
const JET = "#0b0d11"; // pupils

const vec = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);
const mid = (a: P, c: P): P => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

// Turns a geometry centred on its origin so its +Y axis runs from a to c.
function aimAlong(g: THREE.BufferGeometry, a: P, c: P): THREE.BufferGeometry {
  const y = vec(c).sub(vec(a)).normalize();
  const side = Math.abs(y.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  const z = new THREE.Vector3().crossVectors(side, y).normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  return g;
}

// Capsule from a to c. `flat` squashes it before it is turned, so the first
// axis is the thickness across the flipper.
function capsuleGeo(a: P, c: P, r: number, flat: P = [1, 1, 1]) {
  const len = vec(a).distanceTo(vec(c));
  const g = new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.01), 4, 8);
  g.scale(flat[0], flat[1], flat[2]);
  return aimAlong(g, a, c);
}

// Cone with its round base at `base` and its point at `apex`.
function coneGeo(base: P, apex: P, r: number, flat: P = [1, 1, 1]) {
  const len = vec(base).distanceTo(vec(apex));
  const g = new THREE.ConeGeometry(r, len, 8, 1);
  g.scale(flat[0], flat[1], flat[2]);
  return aimAlong(g, base, apex);
}

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Skeleton: hips at the root, spine up the middle, head and jaw on top,
  // a short tail, and a shoulder/wrist and hip/ankle pair on each side.
  const hips = b.joint("hips", { at: [0, 0.13, 0] });
  const spine = b.joint("spine", { at: [0, 0.4, 0], parent: hips });
  const head = b.joint("head", { at: [0, 0.69, 0.01], parent: spine });
  const jaw = b.joint("jaw", { at: [0, 0.662, 0.13], parent: head });
  const tail = b.joint("tail", { at: [0, 0.15, -0.09], parent: hips });

  // Body: a black egg with a white belly bulging out of the front.
  const torsoGeo = new THREE.SphereGeometry(1, 18, 12);
  torsoGeo.scale(0.19, 0.3, 0.19);
  const torso = b.part(torsoGeo, INK, { at: [0, 0.4, 0], bone: spine });

  const bellyGeo = new THREE.SphereGeometry(1, 18, 12);
  bellyGeo.scale(0.165, 0.24, 0.15);
  b.part(bellyGeo, SNOW, { at: [0, 0.33, 0.09], bone: spine });

  // Head: a black ball with white eye rings, gold ear patches and the beak.
  const headPart = b.part(new THREE.SphereGeometry(0.15, 18, 12), INK, {
    at: [0, 0.69, 0.01],
    bone: head,
  });
  const skull = b.surface(headPart);

  for (const s of [1, -1]) {
    const eye = skull.nearest([0.1 * s, 0.72, 0.115]);
    const ring = new THREE.SphereGeometry(0.034, 12, 8);
    ring.scale(1, 0.45, 1);
    b.stick(ring, SNOW, eye);
    b.stick(new THREE.SphereGeometry(0.02, 10, 8), JET, eye);

    const ear = new THREE.SphereGeometry(0.05, 14, 10);
    ear.scale(1, 0.35, 1.3);
    b.stick(ear, GOLD, skull.nearest([0.14 * s, 0.7, -0.02]));
  }

  // Beak: a flattened upper mandible on the head and a lower one on the jaw.
  const beakTop: P = [0, 0.69, 0.13];
  const beakTip: P = [0, 0.675, 0.27];
  b.part(coneGeo(beakTop, beakTip, 0.045, [1, 1, 0.6]), BEAK, {
    at: mid(beakTop, beakTip),
    bone: head,
  });

  const jawBase: P = [0, 0.662, 0.13];
  const jawTip: P = [0, 0.648, 0.235];
  b.part(coneGeo(jawBase, jawTip, 0.036, [1, 1, 0.5]), BEAK_LOW, {
    at: mid(jawBase, jawTip),
    bone: jaw,
  });

  // Tail: a small wide fan tucked under the back.
  const tailBase: P = [0, 0.16, -0.09];
  const tailTip: P = [0, 0.07, -0.2];
  b.part(coneGeo(tailBase, tailTip, 0.05, [1.4, 1, 0.6]), SLATE, {
    at: mid(tailBase, tailTip),
    bone: tail,
  });

  // Flippers, legs and feet on each side.
  for (const [s, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const sh: P = [0.155 * s, 0.57, 0];
    const wr: P = [0.195 * s, 0.4, -0.01];
    const tip: P = [0.225 * s, 0.25, -0.03];
    const hp: P = [0.07 * s, 0.13, 0];
    const ak: P = [0.08 * s, 0.035, 0.04];

    const shoulder = b.joint(`shoulder${tag}`, { at: sh, parent: spine });
    const wrist = b.joint(`wrist${tag}`, { at: wr, parent: shoulder });
    const hip = b.joint(`hip${tag}`, { at: hp, parent: hips });
    const ankle = b.joint(`ankle${tag}`, { at: ak, parent: hip });

    // Flipper: a flattened paddle, rounded at the shoulder, pointed at the tip.
    b.part(capsuleGeo(sh, wr, 0.042, [0.45, 1, 1]), SLATE, {
      at: mid(sh, wr),
      bone: shoulder,
    });
    b.part(coneGeo(wr, tip, 0.042, [0.45, 1, 1]), SLATE, {
      at: mid(wr, tip),
      bone: wrist,
    });

    // Short orange leg and a flat webbed foot resting on the floor.
    b.part(capsuleGeo(hp, ak, 0.022), BEAK_LOW, { at: mid(hp, ak), bone: hip });
    const foot = new THREE.SphereGeometry(0.05, 12, 6);
    foot.scale(1, 0.22, 1.6);
    b.part(foot, BEAK, { at: [0.08 * s, 0.011, 0.05], bone: ankle });
  }

  // Gold breast band on the black chest, just above the white belly.
  const chest = b.surface(torso);
  const breast = new THREE.SphereGeometry(0.1, 16, 10);
  breast.scale(1.2, 0.3, 0.7);
  b.stick(breast, GOLD, chest.nearest([0, 0.6, 0.2]));

  return b.root;
}
