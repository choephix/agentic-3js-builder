import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "African elephant calf",
  description: "A gentle African elephant calf with dusty slate-grey skin, big fan ears, a curling trunk and small tusks.",
};

const SLATE = "#77736f";
const SLATE_DARK = "#625e5a";
const DUST = "#93705c";
const INNER_EAR = "#e0a097";
const IVORY = "#efe5cc";
const NAIL = "#ece6da";
const EYE = "#2a1a12";
const WHITE = "#ffffff";
const LASH = "#2a2423";

// Ellipsoid built from a unit sphere, scaled per axis.
function ellipsoid(rx: number, ry: number, rz: number, w = 14, h = 10) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "elephant-calf" });

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.8, -0.05] });
  const chest = b.joint("chest", { at: [0, 0.84, 0.22], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.95, 0.4], parent: chest });
  const head = b.joint("head", { at: [0, 0.98, 0.52], parent: neck });

  const trunk1 = b.joint("trunk1", { at: [0, 0.9, 0.7], parent: head });
  const trunk2 = b.joint("trunk2", { at: [0, 0.8, 0.82], parent: trunk1 });
  const trunk3 = b.joint("trunk3", { at: [0, 0.7, 0.92], parent: trunk2 });
  const trunk4 = b.joint("trunk4", { at: [0.05, 0.64, 1.0], parent: trunk3 });

  const earL = b.joint("earL", { at: [0.2, 0.98, 0.42], parent: head });
  const earR = b.joint("earR", { at: [-0.2, 0.98, 0.42], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.78, -0.3], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.72, -0.46], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.6, -0.5], parent: tail2 });

  const legs = [
    { side: "FL", x: 0.2, z: 0.25 },
    { side: "FR", x: -0.2, z: 0.25 },
    { side: "BL", x: 0.2, z: -0.2 },
    { side: "BR", x: -0.2, z: -0.2 },
  ];
  const legPts: Record<string, { hip: [number, number, number]; knee: [number, number, number]; ankle: [number, number, number] }> = {};
  for (const L of legs) {
    const hip: [number, number, number] = [L.x, 0.62, L.z];
    const knee: [number, number, number] = [L.x, 0.34, L.z + 0.01];
    const ankle: [number, number, number] = [L.x, 0.09, L.z];
    b.joint("hip" + L.side, { at: hip, parent: hips });
    b.joint("knee" + L.side, { at: knee, parent: b.root === undefined ? hips : hips });
    b.joint("ankle" + L.side, { at: ankle, parent: hips });
    legPts[L.side] = { hip, knee, ankle };
  }

  // ---------- Body ----------
  const bodyPath: [number, number, number][] = [
    [0, 0.78, -0.3],
    [0, 0.8, 0],
    [0, 0.84, 0.25],
  ];
  b.sweep(bodyPath, 0.26, { color: SLATE });

  // Belly and rump volume.
  b.part(ellipsoid(0.24, 0.2, 0.3), SLATE, { at: [0, 0.68, -0.05] });
  b.part(ellipsoid(0.2, 0.2, 0.22), SLATE, { at: [0, 0.82, -0.25] });

  // Wrinkle folds round the barrel body.
  const bodyRings: [number, number][] = [
    [0.78, -0.2],
    [0.8, -0.05],
    [0.82, 0.1],
  ];
  for (const [y, z] of bodyRings) {
    const ring = new THREE.TorusGeometry(0.27, 0.012, 5, 22);
    b.part(ring, SLATE_DARK, { at: [0, y, z] });
  }

  // Dusty reddish patches from rolling in the dirt.
  b.part(ellipsoid(0.15, 0.07, 0.13, 10, 8), DUST, { at: [0.12, 1.0, -0.02] });
  b.part(ellipsoid(0.12, 0.06, 0.1, 10, 8), DUST, { at: [-0.14, 0.98, -0.12] });
  b.part(ellipsoid(0.06, 0.1, 0.12, 10, 8), DUST, { at: [0.25, 0.76, 0.0] });
  b.part(ellipsoid(0.06, 0.1, 0.12, 10, 8), DUST, { at: [-0.25, 0.8, -0.18] });

  // ---------- Head ----------
  b.part(ellipsoid(0.21, 0.22, 0.22, 16, 12), SLATE, { at: [0, 0.98, 0.52] });
  // Brow and forehead bulge.
  b.part(ellipsoid(0.16, 0.1, 0.12, 12, 8), SLATE, { at: [0, 1.12, 0.5] });
  b.part(ellipsoid(0.1, 0.07, 0.1, 10, 8), DUST, { at: [0.05, 1.18, 0.5] });
  // Head wrinkle above the eyes.
  b.part(new THREE.TorusGeometry(0.12, 0.01, 5, 14, Math.PI), SLATE_DARK, { at: [0, 1.1, 0.6] });

  // ---------- Eyes and lashes ----------
  for (const s of [1, -1]) {
    const ex = s * 0.18;
    b.part(ellipsoid(0.03, 0.032, 0.026, 10, 8), EYE, { at: [ex, 1.03, 0.6] });
    b.part(ellipsoid(0.009, 0.009, 0.008, 6, 6), WHITE, { at: [ex + s * 0.005, 1.04, 0.62] });
    for (let i = 0; i < 5; i++) {
      const lash = new THREE.BoxGeometry(0.008, 0.035, 0.008);
      lash.translate(0, 0.0175, 0);
      lash.rotateZ(s * (0.5 - i * 0.22));
      b.part(lash, LASH, { at: [ex + s * (i - 2) * 0.008, 1.05, 0.62] });
    }
  }

  // ---------- Ears (fan-shaped, pink inside) ----------
  for (const s of [1, -1]) {
    const outer = new THREE.CircleGeometry(0.2, 20);
    outer.scale(1, 1.15, 1);
    outer.rotateY((s * Math.PI) / 2);
    b.part(outer, SLATE, { at: [s * 0.23, 0.98, 0.42] });

    const inner = new THREE.CircleGeometry(0.16, 18);
    inner.scale(1, 1.1, 1);
    inner.rotateY((-s * Math.PI) / 2);
    b.part(inner, INNER_EAR, { at: [s * 0.215, 0.98, 0.42] });

    // Ear rim veins as slim darker folds.
    const rim = new THREE.TorusGeometry(0.19, 0.008, 4, 20, Math.PI);
    rim.rotateY((s * Math.PI) / 2);
    b.part(rim, SLATE_DARK, { at: [s * 0.235, 0.98, 0.42] });
  }

  // ---------- Trunk (curling forward) ----------
  const trunkPath: [number, number, number][] = [
    [0, 0.92, 0.66],
    [0, 0.9, 0.7],
    [0, 0.8, 0.82],
    [0, 0.7, 0.92],
    [0.05, 0.64, 1.0],
    [0.11, 0.7, 1.03],
  ];
  b.sweep(trunkPath, 0.075, { color: SLATE });
  // Trunk tip with two finger nubs.
  b.part(ellipsoid(0.05, 0.05, 0.05, 10, 8), SLATE, { at: [0.12, 0.7, 1.04] });
  for (const s of [1, -1]) {
    b.part(ellipsoid(0.014, 0.014, 0.02, 6, 6), DUST, { at: [0.12 + s * 0.02, 0.73, 1.07] });
  }

  // ---------- Tusks (stubby, ivory) ----------
  for (const s of [1, -1]) {
    const tusk = new THREE.ConeGeometry(0.022, 0.12, 10);
    tusk.translate(0, 0.06, 0);
    tusk.rotateX(Math.PI / 2 + 0.35);
    b.part(tusk, IVORY, { at: [s * 0.1, 0.84, 0.7] });
  }

  // ---------- Tail with tuft ----------
  b.sweep(
    [
      [0, 0.8, -0.3],
      [0, 0.72, -0.46],
      [0, 0.6, -0.5],
    ],
    0.02,
    { color: SLATE }
  );
  b.part(ellipsoid(0.05, 0.06, 0.05, 10, 8), DUST, { at: [0, 0.56, -0.52] });
  for (let i = 0; i < 4; i++) {
    const hair = new THREE.CylinderGeometry(0.005, 0.003, 0.07, 5);
    hair.translate(0, 0.035, 0);
    hair.rotateZ((i - 1.5) * 0.25);
    b.part(hair, DUST, { at: [0, 0.5, -0.52] });
  }

  // ---------- Legs and round padded feet ----------
  for (const L of legs) {
    const p = legPts[L.side];
    b.sweep([p.hip, p.knee, p.ankle], 0.1, { color: SLATE });
    // Knee wrinkle rings around the leg (horizontal around the Y axis).
    const kneeRing = new THREE.TorusGeometry(0.105, 0.01, 4, 16);
    kneeRing.rotateX(Math.PI / 2);
    b.part(kneeRing, SLATE_DARK, { at: [L.x, 0.36, L.z + 0.01] });

    // Padded foot.
    b.part(ellipsoid(0.12, 0.07, 0.12, 12, 8), SLATE, { at: [L.x, 0.06, L.z + 0.01] });
    // Pale toenails across the front of the foot.
    for (let k = -1; k <= 1; k++) {
      b.part(ellipsoid(0.025, 0.02, 0.016, 6, 6), NAIL, {
        at: [L.x + k * 0.04, 0.03, L.z + 0.12],
      });
    }
  }

  return b.root;
}
