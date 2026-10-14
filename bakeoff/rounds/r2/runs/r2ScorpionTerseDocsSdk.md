```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, limb, paint, countershade, mottle, rng } from "agentic-3js-builder";

export const meta = {
  name: "Scorpion",
  description: "A desert scorpion in a rest pose, with curled segmented tail, jointed pincers, eight legs and a hinged jaw.",
};

const AMBER = "#d19a35";
const AMBER_D = "#a8691c";
const DARK = "#5a3213";
const CLAW = "#b5561e";
const LEG = "#c88a2c";
const BLACK = "#140c08";
const TELSON = "#e2b552";
const STING = "#2a1208";

export default function build() {
  const b = createBuilder({ name: "scorpion" });
  const root = b.joint("root", { at: [0, 0.03, 0] });

  // ---- spine / body ----
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.03, -0.05],
      [0, 0.03, 0.02],
      [0, 0.032, 0.09],
    ]),
    { parent: root, count: 5, role: "spine" },
  );
  const coat = countershade(mottle(AMBER, AMBER_D, { size: 0.02, seed: 3 }), "#8a5a1a", { level: -0.2 });
  const body = b.sweep(spine, (t) => [0.026 + 0.014 * Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.014], { color: coat });

  // tergite plates
  b.along(
    body,
    6,
    (at) => b.stick(new THREE.BoxGeometry(0.058, 0.005, 0.011), DARK, at, { embed: 0.35 }),
    { from: 0.04, to: 0.58 },
  );

  // carapace
  const frontJoint = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", {
    parent: frontJoint,
    at: [0, 0.034, 0.07],
    aim: [0, 0.034, 0.12],
    role: "head",
  });
  const carapace = b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
    bone: head,
    at: [0, 0.036, 0.062],
    scale: [0.034, 0.017, 0.042],
  });
  // granules on carapace
  const csurf = b.surface(carapace);
  for (const h of csurf.scatter(26, { rng: rng(5), minDist: 0.009, filter: (hh) => hh.n.y > 0.3 }))
    b.stick(new THREE.SphereGeometry(0.0028, 5, 4), DARK, h, { embed: 0.4 });
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), BLACK, { bone: head, at: [s * 0.007, 0.052, 0.066] });
    b.part(new THREE.SphereGeometry(0.003, 5, 4), BLACK, { bone: head, at: [s * 0.024, 0.043, 0.08] });
    b.part(new THREE.SphereGeometry(0.0025, 5, 4), BLACK, { bone: head, at: [s * 0.022, 0.041, 0.09] });
  }
  b.part(new THREE.BoxGeometry(0.004, 0.003, 0.01), DARK, { bone: head, at: [0, 0.054, 0.066] });

  // jaw (chelicerae)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.027, 0.097],
    aim: [0, 0.024, 0.12],
    role: "jaw",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.008, 0.007, 0.016), CLAW, { bone: jaw, at: [s * 0.007, 0.025, 0.11] });
    b.part(new THREE.ConeGeometry(0.003, 0.008, 5), BLACK, {
      bone: jaw,
      at: [s * 0.007, 0.023, 0.123],
      dir: [0, 0, 1],
    });
  }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.034, -0.05],
      [0, 0.036, -0.095],
      [0, 0.06, -0.13],
      [0, 0.1, -0.14],
      [0, 0.135, -0.11],
      [0, 0.145, -0.06],
      [0, 0.14, -0.02],
    ]),
    { parent: spine.joints[0], count: 7, role: "tail" },
  );
  const tailPaint = paint((_p, _n, s) => ((s[0] * 7) % 1 < 0.13 ? DARK : AMBER));
  b.sweep(tail, (t) => 0.0105 * (1 - 0.3 * t) * (1 + 0.1 * Math.cos(t * 7 * Math.PI * 2)), {
    color: tailPaint,
    sides: 8,
  });
  const lastTail = tail.joints[tail.joints.length - 1];
  b.part(new THREE.SphereGeometry(1, 8, 6), TELSON, {
    bone: lastTail,
    at: [0, 0.14, -0.005],
    scale: [0.011, 0.011, 0.017],
  });
  b.sweep(bezier([0, 0.14, 0.005], [0, 0.15, 0.03], [0, 0.123, 0.042]), [0.006, 0], {
    bone: lastTail,
    color: STING,
    caps: { end: "point" },
    sides: 6,
  });

  // ---- legs ----
  const hipZ = [0.06, 0.035, 0.01, -0.015];
  const footZ = [0.105, 0.068, 0.0, -0.06];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    hipZ.forEach((hz, i) => {
      const hipP: [number, number, number] = [s * 0.022, 0.03, hz];
      const pts = limb(hipP, [s * 0.088, 0.003, footZ[i]], [0.05, 0.05], [0, 1, 0]);
      const leg = b.chain(`leg${side}${i + 1}`, pts, {
        parent: spine.nearestJoint(hipP),
        names: [`hip${side}${i + 1}`, `knee${side}${i + 1}`, `foot${side}${i + 1}`],
        role: "leg",
      });
      b.sweep(leg, [0.0085, 0.003], { color: LEG, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0072, 6, 4), DARK, { bone: leg.joints[1], at: pts[1] });
    });
  }

  // ---- pincers ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts: [number, number, number][] = [
      [s * 0.025, 0.03, 0.085],
      [s * 0.055, 0.032, 0.12],
      [s * 0.05, 0.03, 0.165],
    ];
    const arm = b.chain(`arm${side}`, pts, {
      parent: frontJoint,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.009, 0.007], { color: CLAW, sides: 6 });
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), DARK, { bone: arm.joints[1], at: pts[1] });
    const wrist = arm.tip ?? arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6), CLAW, {
      bone: wrist,
      at: [s * 0.047, 0.03, 0.188],
      scale: [0.017, 0.012, 0.027],
    });
    // fixed finger
    b.sweep(bezier([s * 0.043, 0.03, 0.205], [s * 0.04, 0.03, 0.235], [s * 0.026, 0.03, 0.25]), [0.0085, 0], {
      bone: wrist,
      color: CLAW,
      caps: { end: "point" },
      sides: 6,
    });
    // movable finger
    const pj = b.joint(`pincerJaw${side}`, {
      parent: wrist,
      at: [s * 0.058, 0.032, 0.2],
      aim: [s * 0.05, 0.032, 0.235],
      role: "jaw",
    });
    b.sweep(bezier([s * 0.058, 0.032, 0.2], [s * 0.066, 0.032, 0.236], [s * 0.028, 0.032, 0.252]), [0.007, 0], {
      bone: pj,
      color: AMBER_D,
      caps: { end: "point" },
      sides: 6,
    });
  }

  return b.root;
}
```