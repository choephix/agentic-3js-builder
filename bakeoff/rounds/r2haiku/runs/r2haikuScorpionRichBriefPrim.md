```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V = [number, number, number];

export const meta = {
  name: "desert-scorpion",
  description:
    "Threatening desert scorpion: glossy amber armour with dark joint bands, forward pincers, eight thin legs, arched segmented tail with a bulbous stinger, and a cluster of black eyes.",
};

const AMBER = "#d98a1e";
const AMBER_LIGHT = "#f0b043";
const AMBER_DARK = "#b06a16";
const BAND = "#5a2c10";
const LEG = "#8a4a12";
const PINCER = "#e09a2a";
const STINGER = "#2b1a0f";
const EYE = "#050505";

export default function build() {
  const b = createBuilder({ name: "desert-scorpion" });

  // Joint helper: a named joint at a model-space point, optionally parented.
  const J = (name: string, at: V, parent?: any): any =>
    parent ? b.joint(name, { at, parent }) : b.joint(name, { at });

  // A tapered cylinder segment from a to c, riding a bone.
  const seg = (a: V, c: V, r1: number, r2: number, color: string, bone: any) => {
    const d: V = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const mid: V = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    const dir: V = [d[0] / len, d[1] / len, d[2] / len];
    b.part(new THREE.CylinderGeometry(r2, r1, len, 8), color, { at: mid, bone, dir });
  };

  // ---- Body skeleton -------------------------------------------------------
  const body = J("body", [0, 0.05, 0]);

  // Body shell, all boxy primitives on the root bone.
  b.part(new THREE.BoxGeometry(0.056, 0.032, 0.058), AMBER, { at: [0, 0.062, 0.04], bone: body });
  // Head shield, darker plate over the front of the prosoma.
  b.part(new THREE.BoxGeometry(0.05, 0.01, 0.03), AMBER_DARK, { at: [0, 0.08, 0.062], bone: body });
  // Light highlight stripe on the carapace for a glossy read.
  b.part(new THREE.BoxGeometry(0.016, 0.004, 0.06), AMBER_LIGHT, { at: [0, 0.079, 0.035], bone: body });

  // Mesosoma and pre-abdomen rings with dark bands at each joint.
  b.part(new THREE.BoxGeometry(0.048, 0.03, 0.04), AMBER, { at: [0, 0.058, -0.02], bone: body });
  b.part(new THREE.BoxGeometry(0.044, 0.028, 0.036), AMBER, { at: [0, 0.056, -0.056], bone: body });
  b.part(new THREE.BoxGeometry(0.052, 0.036, 0.008), BAND, { at: [0, 0.06, 0.0], bone: body });
  b.part(new THREE.BoxGeometry(0.05, 0.034, 0.008), BAND, { at: [0, 0.058, -0.038], bone: body });
  b.part(new THREE.BoxGeometry(0.048, 0.032, 0.008), BAND, { at: [0, 0.058, 0.07], bone: body });

  // Cluster of tiny black eyes on the head shield.
  const eyes: V[] = [
    [-0.02, 0.09, 0.078],
    [-0.01, 0.095, 0.082],
    [0.0, 0.097, 0.084],
    [0.01, 0.095, 0.082],
    [0.02, 0.09, 0.078],
    [0.0, 0.088, 0.09],
  ];
  for (const e of eyes) {
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), EYE, { at: e, bone: body });
  }

  // ---- Eight legs (four per side) -----------------------------------------
  const zs = [0.035, 0.008, -0.02, -0.046];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = zs[i];
      const hipAt: V = [s * 0.022, 0.052, z];
      const kneeAt: V = [s * (0.072 + i * 0.004), 0.085 - i * 0.002, z + 0.004];
      const footAt: V = [s * (0.115 + i * 0.006), 0.0, z - 0.016];

      const hip = J(`hip${side}${i}`, hipAt, body);
      const knee = J(`knee${side}${i}`, kneeAt, hip);
      const foot = J(`foot${side}${i}`, footAt, knee);

      seg(hipAt, kneeAt, 0.0065, 0.005, LEG, hip);
      seg(kneeAt, footAt, 0.005, 0.0035, LEG, knee);
      // Dark joint knuckles on each leg.
      b.part(new THREE.SphereGeometry(0.0055, 6, 5), BAND, { at: kneeAt, bone: knee });
      b.part(new THREE.SphereGeometry(0.004, 6, 5), BAND, { at: footAt, bone: foot });
    }
  }

  // ---- Pedipalps with crab-like pincers held forward -----------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderAt: V = [s * 0.03, 0.07, 0.085];
    const elbowAt: V = [s * 0.06, 0.06, 0.13];
    const wristAt: V = [s * 0.04, 0.055, 0.19];

    const shoulder = J(`palpShoulder${side}`, shoulderAt, body);
    const elbow = J(`palpElbow${side}`, elbowAt, shoulder);
    const wrist = J(`palpWrist${side}`, wristAt, elbow);

    seg(shoulderAt, elbowAt, 0.008, 0.007, AMBER, shoulder);
    seg(elbowAt, wristAt, 0.007, 0.0065, AMBER, elbow);
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), BAND, { at: elbowAt, bone: elbow });

    // Chunky pincer hand.
    b.part(new THREE.BoxGeometry(0.032, 0.03, 0.04), PINCER, {
      at: [s * 0.04, 0.055, wristAt[2] + 0.02],
      bone: wrist,
    });
    // Two fingers, slightly apart, reaching forward.
    b.part(new THREE.BoxGeometry(0.009, 0.013, 0.07), PINCER, {
      at: [s * 0.052, 0.055, 0.25],
      bone: wrist,
    });
    b.part(new THREE.BoxGeometry(0.009, 0.013, 0.07), PINCER, {
      at: [s * 0.03, 0.055, 0.25],
      bone: wrist,
    });
    // Dark fingertips.
    b.part(new THREE.SphereGeometry(0.0065, 6, 5), BAND, {
      at: [s * 0.052, 0.055, 0.285],
      bone: wrist,
    });
    b.part(new THREE.SphereGeometry(0.0065, 6, 5), BAND, {
      at: [s * 0.03, 0.055, 0.285],
      bone: wrist,
    });
  }

  // ---- Segmented tail arched high over the back ---------------------------
  const tailPts: V[] = [
    [0, 0.07, -0.075],
    [0, 0.11, -0.105],
    [0, 0.165, -0.12],
    [0, 0.215, -0.11],
    [0, 0.24, -0.07],
    [0, 0.238, -0.03],
  ];
  const tail: any[] = [];
  for (let i = 0; i < tailPts.length; i++) {
    const parent = i === 0 ? body : tail[i - 1];
    tail.push(J(`tail${i + 1}`, tailPts[i], parent));
  }

  for (let i = 0; i < tailPts.length - 1; i++) {
    const t = i / (tailPts.length - 2);
    const r1 = 0.017 - 0.006 * t;
    const r2 = 0.016 - 0.006 * t;
    seg(tailPts[i], tailPts[i + 1], r1, r2, AMBER, tail[i]);
    // Dark band ring at each segment joint.
    const dA = tailPts[i + 1];
    b.part(new THREE.TorusGeometry(r2 + 0.002, 0.0028, 5, 10), BAND, {
      at: dA,
      bone: tail[i + 1],
    });
  }

  // Bulbous dark stinger at the tail tip, with a sharp barb pointing forward.
  const tip = tailPts[tailPts.length - 1];
  b.part(new THREE.SphereGeometry(0.022, 10, 8), STINGER, { at: tip, bone: tail[tail.length - 1] });
  const barbAt: V = [0, 0.215, 0.0];
  seg(tip, barbAt, 0.006, 0.0012, STINGER, tail[tail.length - 1]);

  return b.root;
}
```