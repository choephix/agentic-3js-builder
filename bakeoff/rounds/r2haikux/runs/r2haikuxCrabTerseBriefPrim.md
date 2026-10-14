```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "crab",
  description:
    "A stylised red crab: domed carapace with a cream rim and spined sides, periscope eyes, raised claws and four banded walking legs a side.",
};

type V = [number, number, number];

const SHELL = "#e2491f";
const SHELL_DARK = "#9f2a14";
const LEG = "#f2822f";
const CREAM = "#f7e8c8";
const INK = "#1c1412";
const WHITE = "#fff9ee";

const dist = (a: V, c: V) => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
const mid = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
const cone = (r: number, h: number) => new THREE.ConeGeometry(r, h, 6).translate(0, h / 2, 0);

// Walking legs, front to back: z of the hip, knee, ankle and dactyl tip.
const LEGS = [
  { z: 0.055, knee: 0.075, ankle: 0.085, tip: 0.105 },
  { z: 0.01, knee: 0.02, ankle: 0.0, tip: -0.005 },
  { z: -0.04, knee: -0.045, ankle: -0.075, tip: -0.09 },
  { z: -0.085, knee: -0.105, ankle: -0.14, tip: -0.165 },
];

export default function build() {
  const b = createBuilder({ name: "crab" });
  type Joint = ReturnType<typeof b.joint>;

  // A tapered segment from a to c: radius rA at a, rC at c, aimed along the limb.
  const tube = (a: V, c: V, rA: number, rC: number, color: string, bone: Joint) =>
    b.part(new THREE.CylinderGeometry(rC, rA, dist(a, c), 8), color, {
      at: mid(a, c),
      aim: c,
      bone,
    });

  // ---- Body and carapace ----
  const body = b.joint("body", { at: [0, 0.105, 0] });
  const shell = b.part(new THREE.SphereGeometry(1, 16, 10).scale(0.16, 0.05, 0.12), SHELL, {
    at: [0, 0.105, 0],
    bone: body,
  });
  const shellSurf = b.surface(shell);

  // Cream rim traced round the carapace equator.
  const rim: V[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    rim.push([0.159 * Math.cos(a), 0.106, 0.119 * Math.sin(a)]);
  }
  b.sweep(rim, 0.0055, { color: CREAM });

  // Rostrum between the eyes, and a stud on the crown.
  b.part(new THREE.BoxGeometry(0.075, 0.026, 0.035), SHELL_DARK, {
    at: [0, 0.11, 0.125],
    bone: body,
  });
  b.stick(ball(0.014), SHELL_DARK, shellSurf.nearest([0, 0.19, 0.03]));

  // Mouth: a fixed upper plate and a separate lower jaw.
  b.part(new THREE.BoxGeometry(0.07, 0.014, 0.03), SHELL_DARK, {
    at: [0, 0.088, 0.108],
    bone: body,
  });
  const jaw = b.joint("jaw", { at: [0, 0.07, 0.112], parent: body });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.028), CREAM, { at: [0, 0.07, 0.112], bone: jaw });

  // Folded abdomen tucked under the back.
  const abdomen = b.joint("abdomen", { at: [0, 0.062, -0.085], parent: body });
  b.part(new THREE.SphereGeometry(1, 12, 8).scale(0.05, 0.02, 0.065), CREAM, {
    at: [0, 0.062, -0.085],
    bone: abdomen,
  });

  for (const [s, t] of [[1, "L"], [-1, "R"]] as const) {
    // Left side is +X; the right side mirrors it.
    const P = (x: number, y: number, z: number): V => [s * x, y, z];

    // Spines and studs seated on the carapace.
    b.stick(cone(0.008, 0.028), CREAM, shellSurf.nearest(P(0.068, 0.1, 0.13)));
    b.stick(cone(0.011, 0.045), CREAM, shellSurf.nearest(P(0.15, 0.125, 0.0)));
    b.stick(cone(0.011, 0.04), CREAM, shellSurf.nearest(P(0.13, 0.125, -0.08)));
    b.stick(ball(0.012), SHELL_DARK, shellSurf.nearest(P(0.06, 0.17, 0.005)));
    b.stick(ball(0.011), SHELL_DARK, shellSurf.nearest(P(0.1, 0.15, -0.07)));

    // Eyes on stalks: stalk tube, white eyeball, black pupil, catchlight.
    const stalkP = P(0.05, 0.12, 0.1);
    const eyeP = P(0.06, 0.205, 0.135);
    const stalk = b.joint(`eyeStalk${t}`, { at: stalkP, parent: body });
    const eye = b.joint(`eye${t}`, { at: eyeP, parent: stalk });
    tube(stalkP, eyeP, 0.013, 0.01, SHELL, stalk);
    b.part(ball(0.03, 14, 10), WHITE, { at: eyeP, bone: eye });
    b.part(new THREE.SphereGeometry(0.016, 10, 8).scale(1, 1, 0.7), INK, {
      at: P(0.06, 0.207, 0.158),
      bone: eye,
    });
    b.part(ball(0.005, 6, 4), WHITE, { at: P(0.066, 0.216, 0.168), bone: eye });

    // Four walking legs: hip, knee, ankle, dactyl. Cream knuckles band the leg.
    LEGS.forEach((leg, k) => {
      const hipP = P(0.12, 0.085, leg.z);
      const kneeP = P(0.235, 0.135, leg.knee);
      const ankleP = P(0.32, 0.05, leg.ankle);
      const tipP = P(0.345, 0.002, leg.tip);
      const hip = b.joint(`leg${t}${k}Hip`, { at: hipP, parent: body });
      const knee = b.joint(`leg${t}${k}Knee`, { at: kneeP, parent: hip });
      const ankle = b.joint(`leg${t}${k}Ankle`, { at: ankleP, parent: knee });
      b.joint(`leg${t}${k}Tip`, { at: tipP, parent: ankle });
      tube(hipP, kneeP, 0.017, 0.013, LEG, hip);
      b.part(ball(0.0135), CREAM, { at: kneeP, bone: knee });
      tube(kneeP, ankleP, 0.013, 0.0095, LEG, knee);
      b.part(ball(0.0105), CREAM, { at: ankleP, bone: ankle });
      tube(ankleP, tipP, 0.0095, 0.003, INK, ankle);
    });

    // Raised claw: shoulder, elbow, wrist, palm, and two pincers.
    const shoulderP = P(0.105, 0.088, 0.095);
    const elbowP = P(0.15, 0.12, 0.2);
    const wristP = P(0.16, 0.135, 0.31);
    const handP = P(0.15, 0.13, 0.36);
    const fixA = P(0.125, 0.125, 0.395);
    const fixB = P(0.12, 0.12, 0.44);
    const fixC = P(0.12, 0.115, 0.49);
    const movA = P(0.175, 0.125, 0.395);
    const movB = P(0.18, 0.12, 0.44);
    const movC = P(0.195, 0.115, 0.49);

    const shoulder = b.joint(`shoulder${t}`, { at: shoulderP, parent: body });
    const elbow = b.joint(`elbow${t}`, { at: elbowP, parent: shoulder });
    const wrist = b.joint(`wrist${t}`, { at: wristP, parent: elbow });
    const hand = b.joint(`hand${t}`, { at: handP, parent: wrist });
    const pincer = b.joint(`pincer${t}`, { at: fixA, parent: hand });
    b.joint(`pincerMove${t}`, { at: movA, parent: hand });
    const pincerMove = b.joint(`pincerMove${t}`, { at: movA, parent: hand });

    b.part(ball(0.024), SHELL_DARK, { at: shoulderP, bone: shoulder });
    tube(shoulderP, elbowP, 0.024, 0.02, SHELL, shoulder);
    b.part(ball(0.021), SHELL_DARK, { at: elbowP, bone: elbow });
    tube(elbowP, wristP, 0.019, 0.016, SHELL, elbow);
    b.part(ball(0.017), SHELL_DARK, { at: wristP, bone: wrist });

    const palm = b.part(new THREE.SphereGeometry(1, 14, 10).scale(0.05, 0.042, 0.055), SHELL, {
      at: handP,
      bone: hand,
    });
    const palmSurf = b.surface(palm);
    for (const p of [P(0.15, 0.2, 0.355), P(0.12, 0.185, 0.34), P(0.185, 0.18, 0.37)]) {
      b.stick(cone(0.007, 0.022), SHELL_DARK, palmSurf.nearest(p));
    }

    // Fingers: cream bases, ink tips.
    tube(fixA, fixB, 0.016, 0.011, CREAM, pincer);
    tube(fixB, fixC, 0.011, 0.003, INK, pincer);
    tube(movA, movB, 0.016, 0.011, CREAM, pincerMove);
    tube(movB, movC, 0.011, 0.003, INK, pincerMove);
  }

  return b.root;
}
```