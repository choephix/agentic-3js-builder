```ts
import * as THREE from "three";
import { createBuilder, catmull, stripes } from "agentic-3js-builder";

export const meta = {
  name: "vintage bicycle",
  description: "A maroon roadster with cream lugs, chrome fittings, a wicker front basket and a brass headlamp.",
};

const MAROON = "#7d1d24";
const CREAM = "#eee2c2";
const CHROME = "#c9ced6";
const RIM = "#dfe3e8";
const BLACK = "#1c1c1f";
const TYRE = "#232326";
const TAN = "#a86b3c";
const SEAT = "#3b2719";
const WICKER = "#c9a06a";
const WICKER_D = "#8a5f32";
const BRASS = "#c9a04a";
const CHAIN = "#5b5f66";

const WHEEL_Y = 0.335; // hub height; tyre outer radius is 0.335 m

export default function build() {
  const b = createBuilder({ name: "vintage bicycle" });

  // Skeleton: frame root, steering head, and both wheel hubs.
  const root = b.joint("frame", { at: [0, 0.5, 0], role: "spine" });
  const rear = b.joint("rearHub", { parent: root, at: [0, WHEEL_Y, -0.5] });
  const steer = b.joint("steer", { parent: root, at: [0, 0.88, 0.41], role: "hinge" });
  const front = b.joint("frontHub", { parent: steer, at: [0, WHEEL_Y, 0.5] });

  const tube = (a: number[], c: number[], r: number, color: string, bone: typeof root = root) =>
    b.rod(a, c, r, { color, bone });

  const lug = (p: number[], bone: typeof root = root) =>
    b.part(new THREE.SphereGeometry(0.03, 8, 6), CREAM, { at: p, bone });

  // ---- Main frame (maroon tubes, cream lugs) ----
  const BB = [0, 0.3, -0.04];
  const SEAT_LUG = [0, 0.84, -0.18];
  const HEAD_TOP = [0, 0.96, 0.38];
  const HEAD_BOT = [0, 0.8, 0.44];

  tube(HEAD_TOP, HEAD_BOT, 0.024, MAROON); // head tube
  tube(BB, SEAT_LUG, 0.018, MAROON); // seat tube
  tube([0, 0.95, 0.38], SEAT_LUG, 0.017, MAROON); // top tube
  tube([0, 0.8, 0.44], BB, 0.02, MAROON); // down tube

  for (const s of [1, -1]) {
    // seat stays and chain stays meet at the dropouts
    tube([s * 0.02, 0.8, -0.18], [s * 0.06, WHEEL_Y, -0.5], 0.01, MAROON);
    tube([s * 0.03, 0.3, -0.04], [s * 0.06, WHEEL_Y, -0.5], 0.011, MAROON);
    // fork blades on the steering head
    tube([s * 0.035, 0.8, 0.44], [s * 0.06, WHEEL_Y, 0.5], 0.013, MAROON, steer);
    // dropouts
    lug([s * 0.06, WHEEL_Y, -0.5]);
    lug([s * 0.06, WHEEL_Y, 0.5], steer);
  }
  tube([-0.05, 0.8, 0.44], [0.05, 0.8, 0.44], 0.012, MAROON, steer); // fork crown

  lug(BB);
  lug(SEAT_LUG);
  lug(HEAD_TOP, steer);
  lug(HEAD_BOT, steer);

  // ---- Wheels ----
  const wheel = (hub: typeof rear, cz: number, bone: typeof rear) => {
    const hy = WHEEL_Y;
    // tyre and rim share the wheel plane (torus lies in YZ after the turn)
    b.part(new THREE.TorusGeometry(0.305, 0.03, 8, 36), TYRE, {
      at: [0, hy, cz],
      rotation: [0, 90, 0],
      bone,
    });
    b.part(new THREE.TorusGeometry(0.27, 0.011, 6, 36), RIM, {
      at: [0, hy, cz],
      rotation: [0, 90, 0],
      bone,
    });
    // spokes, alternating sides of the hub
    for (let i = 0; i < 24; i++) {
      const th = (i / 24) * Math.PI * 2;
      const side = i % 2 ? 1 : -1;
      const hubP = [side * 0.03, hy, cz];
      const rimP = [0, hy + 0.27 * Math.cos(th), cz + 0.27 * Math.sin(th)];
      b.rod(hubP, rimP, 0.0022, { color: CHROME, bone });
    }
    // hub shell and axle
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.09, 8), CHROME, {
      at: [0, hy, cz],
      rotation: [0, 0, 90],
      bone,
    });
    tube([-0.07, hy, cz], [0.07, hy, cz], 0.007, CHROME, bone);
    return hub;
  };
  wheel(rear, -0.5, rear);
  wheel(front, 0.5, front);

  // ---- Mudguards: thin, wide sweeps over each wheel ----
  const arcPts = (cz: number, r: number, angles: number[]) =>
    angles.map((a) => {
      const phi = (a * Math.PI) / 180;
      return [0, WHEEL_Y + r * Math.cos(phi), cz + r * Math.sin(phi)];
    });
  b.sweep(catmull(arcPts(-0.5, 0.36, [-80, -60, -40, -20, 0, 20])), () => [0.05, 0.004], {
    color: MAROON,
    bone: rear,
  });
  b.sweep(catmull(arcPts(0.5, 0.36, [-25, -5, 15, 35, 55, 70])), () => [0.05, 0.004], {
    color: MAROON,
    bone: front,
  });

  // ---- Drivetrain: chainring, cranks, pedals, chain, rear sprocket ----
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 20), CHROME, {
    at: [-0.03, 0.3, -0.04],
    rotation: [0, 0, 90],
    bone: root,
  });
  for (const s of [1, -1]) {
    tube([s * 0.1, 0.3, -0.04], [s * 0.1, 0.2, -0.03], 0.011, BLACK);
    b.part(new THREE.BoxGeometry(0.09, 0.015, 0.05), BLACK, {
      at: [s * 0.11, 0.19, -0.03],
      bone: root,
    });
  }
  tube([-0.03, 0.39, -0.04], [-0.03, 0.37, -0.5], 0.0045, CHAIN);
  tube([-0.03, 0.21, -0.04], [-0.03, 0.3, -0.5], 0.0045, CHAIN);
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 12), CHROME, {
    at: [-0.03, WHEEL_Y, -0.5],
    rotation: [0, 0, 90],
    bone: rear,
  });

  // ---- Handlebars, stem, grips ----
  tube([0, 0.96, 0.38], [0, 1.03, 0.36], 0.017, CHROME, steer);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 1.02, 0.36],
        [s * 0.08, 1.03, 0.38],
        [s * 0.17, 1.02, 0.37],
        [s * 0.2, 0.97, 0.3],
        [s * 0.19, 0.91, 0.2],
      ]),
      0.011,
      { color: CHROME, bone: steer },
    );
    b.capsule([s * 0.2, 0.97, 0.3], [s * 0.19, 0.91, 0.2], 0.017, { color: TAN, bone: steer });
  }

  // ---- Brass headlamp on the fork crown ----
  b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.075, 0.08],
      [0.045, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0.83, 0.5], axis: [0, 0, 1], bone: steer, color: BRASS },
  );

  // ---- Wicker basket on a rack ahead of the bars ----
  tube([0, 0.92, 0.4], [0, 0.93, 0.66], 0.008, CHROME, steer);
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.115, 0.02],
      [0.125, 0.17],
      [0.115, 0.17],
      [0.105, 0.03],
      [0, 0.03],
    ],
    {
      at: [0, 0.93, 0.72],
      bone: steer,
      color: stripes(WICKER, WICKER_D, { size: 0.03, axis: "y" }),
    },
  );

  // ---- Saddle on a chrome seat post ----
  tube([0, 0.82, -0.18], [0, 0.91, -0.22], 0.013, CHROME);
  b.extrude(
    [
      [-0.13, 0.03],
      [-0.05, 0.0],
      [0.05, 0.0],
      [0.13, 0.03],
      [0.14, 0.06],
      [0.05, 0.08],
      [-0.07, 0.08],
      [-0.13, 0.06],
    ],
    {
      at: [0, 0.9, -0.22],
      thickness: 0.07,
      bevel: 0.012,
      smoothing: 1,
      color: SEAT,
      bone: root,
    },
  );

  return b.root;
}
```