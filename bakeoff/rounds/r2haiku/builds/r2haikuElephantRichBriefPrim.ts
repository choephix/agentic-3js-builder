import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";

const SKIN = "#6f6b69";
const DUST = "#9c6b57";
const DEEP = "#55504d";
const PINK = "#e9a29b";
const IVORY = "#f2ead6";
const NAIL = "#efe6d2";
const EYE = "#2b1a10";
const WHITE = "#ffffff";
const LASH = "#2a2220";
const TUFT = "#3b2a20";

export const meta = {
  name: "African elephant calf",
  description: "A gentle, dust-dappled African elephant calf with huge ears, a curling trunk and kind brown eyes.",
};

export default function build() {
  const b = createBuilder({ name: "elephant-calf" });
  const r = rng(7);

  // ---- Skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.78, 0] });
  const neck = b.joint("neck", { at: [0, 0.95, 0.5], parent: hips });
  const head = b.joint("head", { at: [0, 1.0, 0.7], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.86, 0.86], parent: head });
  const earL = b.joint("earL", { at: [0.3, 1.0, 0.6], parent: head });
  const earR = b.joint("earR", { at: [-0.3, 1.0, 0.6], parent: head });

  const legs = {};
  const knees = {};
  const legSpecs = [
    { key: "FL", s: 1, z: 0.3 },
    { key: "FR", s: -1, z: 0.3 },
    { key: "BL", s: 1, z: -0.3 },
    { key: "BR", s: -1, z: -0.3 },
  ];
  for (const L of legSpecs) {
    const x = L.s * 0.22;
    legs[L.key] = b.joint("leg" + L.key, { at: [x, 0.76, L.z], parent: hips });
    knees[L.key] = b.joint("knee" + L.key, { at: [x, 0.4, L.z], parent: legs[L.key] });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.44],
      [0, 0.78, -0.6],
      [0, 0.6, -0.66],
      [0, 0.45, -0.64],
    ]),
    { role: "tail" },
  );

  // ---- Body -----------------------------------------------------------
  const bodyG = new THREE.SphereGeometry(0.36, 14, 10);
  bodyG.scale(1, 0.9, 1.35);
  b.part(bodyG, SKIN, { at: [0, 0.78, 0], bone: hips });

  // Dusty reddish patches on the back, placed on the body surface.
  const hipY = 0.78;
  const surfY = (x: number, z: number) => {
    const q = 1 - (x / 0.36) ** 2 - (z / 0.486) ** 2;
    return hipY + 0.324 * Math.sqrt(Math.max(0, q));
  };
  for (let i = 0; i < 12; i++) {
    const x = (r() - 0.5) * 0.5;
    const z = (r() - 0.5) * 0.6;
    const q = 1 - (x / 0.36) ** 2 - (z / 0.486) ** 2;
    if (q < 0.2) continue;
    const dg = new THREE.SphereGeometry(0.06 + r() * 0.04, 7, 5);
    dg.scale(1, 0.3, 1);
    b.part(dg, DUST, { at: [x, surfY(x, z) - 0.01, z], bone: hips });
  }

  // Soft wrinkle folds at the neck.
  for (const zz of [0.52, 0.6]) {
    const wg = new THREE.TorusGeometry(0.25, 0.014, 5, 12);
    b.part(wg, DEEP, { at: [0, 0.98, zz], bone: neck });
  }

  // ---- Legs -----------------------------------------------------------
  for (const L of legSpecs) {
    const x = L.s * 0.22;
    const upperG = new THREE.CylinderGeometry(0.12, 0.1, 0.36, 8);
    b.part(upperG, SKIN, { at: [x, 0.58, L.z], bone: legs[L.key] });

    const ringG = new THREE.TorusGeometry(0.12, 0.012, 5, 10);
    ringG.rotateX(Math.PI / 2);
    b.part(ringG, DEEP, { at: [x, 0.7, L.z], bone: legs[L.key] });

    const lowerG = new THREE.CylinderGeometry(0.1, 0.085, 0.3, 8);
    b.part(lowerG, SKIN, { at: [x, 0.25, L.z], bone: knees[L.key] });

    const footG = new THREE.SphereGeometry(0.13, 10, 7);
    footG.scale(1.05, 0.5, 1.0);
    b.part(footG, SKIN, { at: [x, 0.07, L.z + 0.03], bone: knees[L.key] });

    for (const dx of [-0.05, 0, 0.05]) {
      const nG = new THREE.SphereGeometry(0.03, 6, 4);
      nG.scale(1, 0.7, 0.6);
      b.part(nG, NAIL, { at: [x + dx, 0.06, L.z + 0.15], bone: knees[L.key] });
    }
  }

  // ---- Head -----------------------------------------------------------
  const headG = new THREE.SphereGeometry(0.27, 14, 10);
  headG.scale(1, 1, 1.05);
  b.part(headG, SKIN, { at: [0, 1.0, 0.7], bone: head });

  // Dust on the crown and forehead.
  for (let i = 0; i < 4; i++) {
    const dg = new THREE.SphereGeometry(0.05, 6, 4);
    dg.scale(1, 0.35, 1);
    const a = (r() - 0.5) * 0.9;
    b.part(dg, DUST, { at: [a * 0.2, 1.24 - Math.abs(a) * 0.1, 0.7 + (r() - 0.5) * 0.1], bone: head });
  }

  // Ears: broad flared fans with pink insides.
  for (const E of [
    { s: 1, joint: earL },
    { s: -1, joint: earR },
  ]) {
    const outerG = new THREE.SphereGeometry(1, 14, 10);
    outerG.scale(0.04, 0.36, 0.32);
    b.part(outerG, SKIN, { at: [E.s * 0.34, 1.0, 0.6], bone: E.joint });

    const innerG = new THREE.SphereGeometry(1, 12, 8);
    innerG.scale(0.012, 0.3, 0.26);
    b.part(innerG, PINK, { at: [E.s * 0.292, 1.0, 0.6], bone: E.joint });
  }

  // Eyes, highlights and lashes.
  for (const s of [1, -1]) {
    const eyeG = new THREE.SphereGeometry(0.035, 10, 8);
    b.part(eyeG, EYE, { at: [s * 0.15, 1.04, 0.915], bone: head });

    const hlG = new THREE.SphereGeometry(0.011, 6, 4);
    b.part(hlG, WHITE, { at: [s * 0.162, 1.055, 0.942], bone: head });

    for (let k = 0; k < 5; k++) {
      const lg = new THREE.BoxGeometry(0.006, 0.03, 0.008);
      lg.rotateZ(s * (0.35 - k * 0.15));
      const lx = s * (0.15 + (k - 2) * 0.018 + k * 0.004);
      b.part(lg, LASH, { at: [lx, 1.08 + (k === 2 ? 0.004 : 0), 0.928], bone: head });
    }
  }

  // Jaw and mouth.
  const jawG = new THREE.SphereGeometry(0.14, 10, 7);
  jawG.scale(0.8, 0.3, 0.9);
  b.part(jawG, DEEP, { at: [0, 0.8, 0.86], bone: jaw });

  // Stubby ivory tusks, forward and slightly down.
  for (const s of [1, -1]) {
    const tg = new THREE.ConeGeometry(0.028, 0.12, 7);
    tg.rotateX(Math.PI / 2 + 0.4);
    b.part(tg, IVORY, { at: [s * 0.09, 0.797, 1.005], bone: jaw });
  }

  // Trunk curling forward and up at the tip.
  const trunkPath = catmull([
    [0, 0.9, 0.92],
    [0, 0.78, 1.08],
    [0, 0.6, 1.18],
    [0, 0.5, 1.24],
    [0, 0.42, 1.22],
    [0, 0.36, 1.14],
    [0.02, 0.4, 1.09],
  ]);
  b.chain("trunk", trunkPath, { role: "neck" });
  b.sweep(trunkPath, 0.06, { color: SKIN });

  // ---- Tail -----------------------------------------------------------
  b.sweep(tail, 0.022, { color: SKIN });
  for (let i = 0; i < 6; i++) {
    const tuftG = new THREE.ConeGeometry(0.012, 0.09, 4);
    tuftG.rotateX(Math.PI);
    const dx = (r() - 0.5) * 0.03;
    const dz = (r() - 0.5) * 0.03;
    b.part(tuftG, TUFT, { at: [dx, 0.4, -0.64 + dz], bone: tail });
  }

  return b.root;
}
