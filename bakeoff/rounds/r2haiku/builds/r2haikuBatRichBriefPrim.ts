import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { membrane } from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Fruit Bat",
  description:
    "A golden-brown fruit bat with wings spread wide, big dark eyes and a moist black nose, holding a half-eaten fig in its feet.",
};

const FUR = "#b07a3a";
const FUR_D = "#7a4a22";
const FUR_L = "#dcae62";
const WING = "#2f2f36";
const WING_BONE = "#1d1b1f";
const EYE = "#0c0a08";
const WHITE = "#fff8ee";
const NOSE = "#120e0c";
const EAR_IN = "#c98a6a";
const CLAW = "#e8dcc0";
const FIG = "#5b2a4a";
const FIG_D = "#3d5a2a";
const FIG_IN = "#d9566a";

export default function build() {
  const b = createBuilder({ name: "fruit-bat" });
  const rnd = rng(11);

  // ---------- helpers ----------
  const sph = (joint: any, at: V, r: number, color: string, scale?: V) =>
    b.part(new THREE.SphereGeometry(r, 14, 10), color, {
      at,
      bone: joint,
      ...(scale ? { scale } : {}),
    } as any);

  const bone = (joint: any, a: V, c: V, r0: number, r1: number, color: string) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const L = A.distanceTo(B);
    const d = B.clone().sub(A).normalize();
    const m = A.clone().lerp(B, 0.5);
    const geo = new THREE.CylinderGeometry(r1, r0, L, 7, 1);
    b.part(geo, color, {
      at: [m.x, m.y, m.z],
      dir: [d.x, d.y, d.z],
      bone: joint,
    } as any);
  };

  // ---------- skeleton: body ----------
  const hips = b.joint("hips", { at: [0, 0.3, 0] } as any);
  const spine = b.joint("spine", { at: [0, 0.42, 0.02], parent: hips } as any);
  const neck = b.joint("neck", { at: [0, 0.52, 0.08], parent: spine } as any);
  const head = b.joint("head", { at: [0, 0.62, 0.12], parent: neck } as any);
  const tail = b.joint("tail", { at: [0, 0.3, -0.12], parent: hips } as any);

  // body: fluffy golden ball
  sph(spine, [0, 0.36, 0.02], 0.15, FUR, [1, 1.05, 1.1]);
  // pale chest patch
  sph(spine, [0, 0.36, 0.1], 0.11, FUR_L, [0.9, 0.95, 0.55]);
  // hips, rump
  sph(hips, [0, 0.27, -0.04], 0.1, FUR_D, [1.1, 0.9, 1.0]);
  // short stubby tail under the rump
  bone(tail, [0, 0.28, -0.1], [0, 0.22, -0.2], 0.03, 0.02, FUR_D);

  // fluff tufts scattered over the body (deterministic)
  for (let i = 0; i < 26; i++) {
    let x = rnd() * 2 - 1;
    let y = rnd() * 2 - 1;
    let z = rnd() * 2 - 1;
    const len = Math.hypot(x, y, z) || 1;
    x /= len;
    y /= len;
    z /= len;
    if (z > 0.55 || y < -0.5) continue; // keep the face and underside clear
    const rr = 0.16 + rnd() * 0.02;
    const at: V = [x * rr, 0.36 + y * rr * 1.05, 0.02 + z * rr * 1.1];
    const col = rnd() > 0.5 ? FUR : FUR_L;
    sph(spine, at, 0.045 + rnd() * 0.02, col);
  }

  // ---------- neck & head ----------
  sph(neck, [0, 0.54, 0.09], 0.07, FUR, [1, 1, 1]);
  sph(head, [0, 0.64, 0.14], 0.12, FUR, [1, 0.95, 1]);
  // cheek fluff
  sph(head, [-0.085, 0.6, 0.17], 0.05, FUR_L);
  sph(head, [0.085, 0.6, 0.17], 0.05, FUR_L);
  // fox-like snout
  bone(head, [0, 0.62, 0.22], [0, 0.6, 0.32], 0.05, 0.034, FUR);
  // moist black nose
  sph(head, [0, 0.62, 0.335], 0.035, NOSE, [1.25, 0.8, 0.9]);
  sph(head, [0.012, 0.628, 0.345], 0.012, "#4a4a55");

  // big dark eyes with glints
  for (const s of [-1, 1]) {
    sph(head, [s * 0.06, 0.665, 0.245], 0.04, EYE, [1, 1.1, 0.7]);
    sph(head, [s * 0.066, 0.678, 0.27], 0.013, WHITE);
  }

  // pointed ears, leaning back, with a pale inner
  for (const s of [-1, 1]) {
    const ear = new THREE.ConeGeometry(0.05, 0.17, 6);
    b.part(ear, FUR_D, {
      at: [s * 0.07, 0.78, 0.1],
      dir: [s * 0.25, 1, -0.12],
      bone: head,
    } as any);
    const inner = new THREE.ConeGeometry(0.028, 0.11, 6);
    b.part(inner, EAR_IN, {
      at: [s * 0.07, 0.775, 0.115],
      dir: [s * 0.22, 1, -0.06],
      bone: head,
    } as any);
  }

  // ---------- wings (left = +X, right mirrored) ----------
  const wing = (s: number) => {
    const P = (x: number, y: number, z: number): V => [x * s, y, z];

    const shoulder = b.joint(`shoulder${s > 0 ? "L" : "R"}`, {
      at: P(0.12, 0.66, 0.0),
      parent: spine,
    } as any);
    const elbow = b.joint(`elbow${s > 0 ? "L" : "R"}`, {
      at: P(0.4, 0.84, -0.04),
      parent: shoulder,
    } as any);
    const wrist = b.joint(`wrist${s > 0 ? "L" : "R"}`, {
      at: P(0.66, 0.92, 0.0),
      parent: elbow,
    } as any);

    const S = P(0.12, 0.66, 0.0);
    const E = P(0.4, 0.84, -0.04);
    const W = P(0.66, 0.92, 0.0);
    const F1 = P(1.0, 0.98, 0.04);
    const F2 = P(0.98, 0.86, -0.12);
    const F3 = P(0.84, 0.7, -0.22);
    const F4 = P(0.6, 0.5, -0.26);
    const HB = P(0.1, 0.36, -0.06);
    const AN = P(0.16, 0.2, -0.14);

    // arm bones
    bone(shoulder, S, E, 0.028, 0.022, WING_BONE);
    bone(elbow, E, W, 0.024, 0.02, WING_BONE);
    // long finger bones fanning from the wrist
    for (const tip of [F1, F2, F3, F4]) {
      bone(wrist, W, tip, 0.018, 0.009, WING_BONE);
    }
    // small hooked thumb claw at the elbow
    b.spike(
      P(0.44, 0.86, 0.02) as any,
      [0.25 * s, 0.5, 0.6] as any,
      0.05,
      0.01,
    );

    // leathery membrane between the arm, fingers and body
    membrane(
      [S, E, W, F1] as any,
      [HB, AN, F4] as any,
      { color: WING } as any,
    );

    // soft scalloped trailing edge: small claws at finger tips
    for (const tip of [F1, F2, F3, F4]) {
      sph(wrist, tip, 0.012, CLAW);
    }
  };
  wing(1);
  wing(-1);

  // ---------- legs & feet holding the fig ----------
  for (const s of [-1, 1]) {
    const L = s > 0 ? "L" : "R";
    const hip = b.joint(`hip${L}`, { at: [s * 0.08, 0.3, 0.0], parent: hips } as any);
    const knee = b.joint(`knee${L}`, { at: [s * 0.11, 0.16, 0.1], parent: hip } as any);
    const ankle = b.joint(`ankle${L}`, { at: [s * 0.07, 0.06, 0.16], parent: knee } as any);

    bone(hip, [s * 0.08, 0.3, 0.0], [s * 0.11, 0.16, 0.1], 0.03, 0.022, FUR_D);
    bone(knee, [s * 0.11, 0.16, 0.1], [s * 0.07, 0.06, 0.16], 0.022, 0.016, FUR_D);

    // foot: pad and three toes curling around the fig
    sph(ankle, [s * 0.07, 0.04, 0.18], 0.03, FUR_D, [1, 0.8, 1.4]);
    for (const tx of [-0.022, 0, 0.022]) {
      const toeAt: V = [s * 0.07 + tx * s, 0.03, 0.215];
      sph(ankle, toeAt, 0.014, FUR_D);
      b.spike(
        [toeAt[0], toeAt[1] + 0.005, toeAt[2] + 0.01] as any,
        [0, -0.4, 1] as any,
        0.025,
        0.006,
      );
    }
  }

  // ---------- the half-eaten fig ----------
  const figC: V = [0, 0.12, 0.2];
  sph(spine, figC, 0.075, FIG, [1, 1.1, 1]);
  // bitten-away bite showing pink flesh
  sph(spine, [0.03, 0.16, 0.262], 0.028, FIG_IN);
  sph(spine, [0.045, 0.148, 0.268], 0.012, FIG_IN);
  // seeds dotting the flesh
  sph(spine, [0.02, 0.165, 0.275], 0.005, "#2a1a10");
  sph(spine, [0.04, 0.155, 0.28], 0.005, "#2a1a10");
  // stem and leaf
  bone(spine, [0, 0.19, 0.2], [0, 0.23, 0.2], 0.008, 0.006, FIG_D);
  b.part(new THREE.SphereGeometry(0.03, 8, 6), FIG_D, {
    at: [0.03, 0.235, 0.2],
    scale: [1.6, 0.5, 0.9],
    bone: spine,
  } as any);

  return b.root;
}
