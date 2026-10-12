```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";

type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;

export const meta = {
  name: "Crab",
  description:
    "A stylised orange crab in a rest pose: a domed shell with a dorsal ridge and tubercles, eyes on stalks, pincers held open in front, and four jointed walking legs a side.",
};

// Written in design units at roughly 1:1. S sets the real size: a 0.24 m carapace.
const S = 0.75;
const m = (v: number) => v * S;
const P = (x: number, y: number, z: number): number[] => [m(x), m(y), m(z)];
// Mirror a design point to a side: s = +1 is the left (+X), s = -1 is the right.
const side = (s: number, v: number[]): number[] => P(s * v[0], v[1], v[2]);

// Carapace ellipsoid, design units
const RX = 0.16;
const RY = 0.055;
const RZ = 0.13;
const CY = 0.08;

function ball(r: number, w = 10, h = 7) {
  return new THREE.SphereGeometry(m(r), w, h);
}

function ellipsoid(rx: number, ry: number, rz: number, w: number, h: number) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(m(rx), m(ry), m(rz));
  return g;
}

// A point on the shell and its outward normal. phi runs from the top (0) down
// to the underside (PI); theta goes round the shell, with PI/2 at the front.
function onShell(phi: number, theta: number) {
  const sp = Math.sin(phi);
  const cp = Math.cos(phi);
  const dx = RX * sp * Math.cos(theta);
  const dy = RY * cp;
  const dz = RZ * sp * Math.sin(theta);
  const n = [dx / (RX * RX), dy / (RY * RY), dz / (RZ * RZ)];
  const len = Math.hypot(n[0], n[1], n[2]);
  return { p: P(dx, CY + dy, dz), n: n.map((v) => v / len) };
}

// A cone standing on `base`, pointing along `dir` (dir.y must not be negative).
function spike(
  b: Builder,
  color: string,
  base: number[],
  dir: number[],
  len: number,
  r: number,
  bone?: Joint,
) {
  const n = Math.hypot(dir[0], dir[1], dir[2]);
  const d = dir.map((v) => v / n);
  const pitch = Math.asin(d[2]);
  const yaw = Math.asin(Math.max(-1, Math.min(1, -d[0] / Math.cos(pitch))));
  const g = new THREE.ConeGeometry(m(r), m(len), 7, 1);
  g.rotateX(pitch);
  g.rotateZ(yaw);
  const at = base.map((v, i) => v + (d[i] * m(len)) / 2);
  b.part(g, color, { at, bone });
}

export default function build() {
  const b = createBuilder({ name: "crab" });
  const rand = rng(7);

  const SHELL = "#e4572e";
  const SHELL_DARK = "#a33210";
  const LEG = "#c94a1c";
  const CLAW = "#ff7d3c";
  const TIP = "#2a140e";
  const CREAM = "#ffe0ad";
  const JAW = "#f2c98a";
  const EYE = "#fff8ec";
  const PUPIL = "#120b09";

  // Skeleton root: the shell. Everything else hangs from it.
  const body = b.joint("body", { at: P(0, CY, 0) });

  // Shell, tucked-under abdomen and a two-part mouth
  b.part(ellipsoid(RX, RY, RZ, 20, 12), SHELL, { at: P(0, CY, 0), bone: body });
  b.part(ellipsoid(0.075, 0.03, 0.07, 12, 8), SHELL_DARK, {
    at: P(0, 0.05, -0.09),
    bone: body,
  });
  b.part(ellipsoid(0.05, 0.028, 0.03, 10, 7), CREAM, {
    at: P(0, 0.06, 0.12),
    bone: body,
  });
  const jaw = b.joint("jaw", { at: P(0, 0.052, 0.115), parent: body });
  b.part(ellipsoid(0.04, 0.02, 0.025, 10, 6), JAW, {
    at: P(0, 0.046, 0.125),
    bone: jaw,
  });

  // Dorsal ridge running from the rostrum to the rear of the shell
  const ridge = [-1.05, -0.5, 0, 0.5, 1.05].map(
    (phi) => onShell(phi, Math.PI / 2).p,
  );
  b.sweep(ridge, m(0.01), { color: SHELL_DARK, bone: body });

  // Rostrum between the eye stalks
  spike(b, SHELL_DARK, P(0, 0.086, 0.118), [0, 0.22, 1], 0.04, 0.016, body);

  // Tubercles sunk into the shell, cream against the orange
  const rows: [number, number][] = [
    [0.42, 8],
    [0.85, 6],
  ];
  for (const [phi, count] of rows) {
    for (let k = 0; k < count; k++) {
      const theta = ((k + 0.5) / count) * Math.PI * 2;
      if (phi > 0.6 && Math.sin(theta) > 0.9) continue; // keep the front centre clear
      const { p, n } = onShell(phi, theta);
      b.stick(ball(0.0095 + 0.003 * rand(), 8, 6), CREAM, frame(p, n));
    }
  }

  // Pointed spines on the front and rear edges, one of each per side
  for (const s of [1, -1]) {
    for (const [phi, th] of [
      [1.15, 0.5],
      [1.25, -0.8],
    ]) {
      const theta = s > 0 ? th : Math.PI - th;
      const { p, n } = onShell(phi, theta);
      spike(b, SHELL_DARK, p, n, 0.035, 0.013, body);
    }
  }

  // Eyes on two-segment stalks
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const base = side(s, [0.05, 0.1, 0.09]);
    const mid = side(s, [0.06, 0.135, 0.12]);
    const tip = side(s, [0.07, 0.165, 0.135]);

    const stalkA = b.joint(`eyeStalk${L}A`, { at: base, parent: body });
    const stalkB = b.joint(`eyeStalk${L}B`, { at: mid, parent: stalkA });
    const eyeTip = b.joint(`eyeTip${L}`, { at: tip, parent: stalkB });

    b.sweep([base, mid], m(0.013), { color: SHELL, bone: stalkA });
    b.sweep([mid, tip], m(0.011), { color: SHELL, bone: stalkB });
    b.part(ball(0.024, 14, 9), EYE, {
      at: side(s, [0.072, 0.172, 0.148]),
      bone: eyeTip,
    });
    b.part(ball(0.0125, 8, 6), PUPIL, {
      at: side(s, [0.075, 0.176, 0.17]),
      bone: eyeTip,
    });
  }

  // Walking legs: hip, knee and ankle joints, four a side, front to back
  const LEGS = [
    { hip: [0.1, 0.075, 0.03], knee: [0.22, 0.115, 0.08], ankle: [0.31, 0.03, 0.14], tip: [0.35, 0.008, 0.19] },
    { hip: [0.11, 0.075, -0.02], knee: [0.25, 0.11, 0.0], ankle: [0.34, 0.03, 0.0], tip: [0.38, 0.008, 0.01] },
    { hip: [0.1, 0.075, -0.07], knee: [0.24, 0.11, -0.08], ankle: [0.32, 0.03, -0.14], tip: [0.35, 0.008, -0.18] },
    { hip: [0.09, 0.075, -0.11], knee: [0.19, 0.105, -0.16], ankle: [0.25, 0.03, -0.22], tip: [0.27, 0.008, -0.27] },
  ];

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    LEGS.forEach((leg, i) => {
      const hipP = side(s, leg.hip);
      const kneeP = side(s, leg.knee);
      const ankleP = side(s, leg.ankle);
      const tipP = side(s, leg.tip);

      const hip = b.joint(`leg${L}${i}Hip`, { at: hipP, parent: body });
      const knee = b.joint(`leg${L}${i}Knee`, { at: kneeP, parent: hip });
      const ankle = b.joint(`leg${L}${i}Ankle`, { at: ankleP, parent: knee });

      b.sweep([hipP, kneeP], m(0.012), { color: LEG, bone: hip });
      b.sweep([kneeP, ankleP], m(0.01), { color: LEG, bone: knee });
      b.sweep([ankleP, tipP], m(0.008), { color: LEG, bone: ankle });

      b.part(ball(0.02, 10, 7), SHELL_DARK, { at: hipP, bone: hip });
      b.part(ball(0.015, 9, 6), CREAM, { at: kneeP, bone: knee });

      // Dactyl: a short dark claw continuing the foot, tipped up a little
      const fx = tipP[0] - ankleP[0];
      const fz = tipP[2] - ankleP[2];
      const fl = Math.hypot(fx, fz) || 1;
      spike(b, TIP, tipP, [fx / fl, 0.15, fz / fl], 0.03, 0.007, ankle);
    });
  }

  // Pincers: shoulder, elbow, wrist, a palm, and two fingers held open
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shP = side(s, [0.085, 0.078, 0.105]);
    const elP = side(s, [0.17, 0.115, 0.22]);
    const wrP = side(s, [0.13, 0.1, 0.34]);
    const paP = side(s, [0.12, 0.095, 0.4]);
    const mbP = side(s, [0.15, 0.095, 0.44]);
    const mmP = side(s, [0.14, 0.095, 0.5]);
    const mtP = side(s, [0.11, 0.09, 0.57]);
    const fbP = side(s, [0.085, 0.09, 0.44]);
    const fmP = side(s, [0.09, 0.09, 0.5]);
    const ftP = side(s, [0.07, 0.085, 0.57]);

    const shoulder = b.joint(`arm${L}Shoulder`, { at: shP, parent: body });
    const elbow = b.joint(`arm${L}Elbow`, { at: elP, parent: shoulder });
    const wrist = b.joint(`arm${L}Wrist`, { at: wrP, parent: elbow });
    const palm = b.joint(`claw${L}Palm`, { at: paP, parent: wrist });
    const mBase = b.joint(`claw${L}MoveBase`, { at: mbP, parent: palm });
    const mMid = b.joint(`claw${L}MoveMid`, { at: mmP, parent: mBase });
    const fBase = b.joint(`claw${L}FixBase`, { at: fbP, parent: palm });
    const fMid = b.joint(`claw${L}FixMid`, { at: fmP, parent: fBase });

    b.sweep([shP, elP], m(0.016), { color: LEG, bone: shoulder });
    b.sweep([elP, wrP], m(0.014), { color: LEG, bone: elbow });
    b.sweep([wrP, paP], m(0.012), { color: LEG, bone: wrist });
    b.part(ball(0.017, 10, 7), CREAM, { at: elP, bone: elbow });

    b.part(ellipsoid(0.06, 0.05, 0.065, 14, 9), CLAW, { at: paP, bone: palm });

    b.sweep([mbP, mmP], m(0.011), { color: CLAW, bone: mBase });
    b.sweep([mmP, mtP], m(0.01), { color: CLAW, bone: mMid });
    b.part(ball(0.014, 8, 6), TIP, { at: mtP, bone: mMid });

    b.sweep([fbP, fmP], m(0.011), { color: CLAW, bone: fBase });
    b.sweep([fmP, ftP], m(0.01), { color: CLAW, bone: fMid });
    b.part(ball(0.014, 8, 6), TIP, { at: ftP, bone: fMid });
  }

  return b.root;
}
```