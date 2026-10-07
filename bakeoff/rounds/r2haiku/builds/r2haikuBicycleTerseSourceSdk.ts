import * as THREE from "three";
import { catmull, createBuilder, mottle, stripes } from "../../../../src/index";
import type { Joint } from "../../../../src/index";

export const meta = {
  name: "Vintage bicycle",
  description:
    "A 1930s roadster: green enamel diamond frame, whitewall tyres, leather saddle, chrome spokes, brass lamp and bell, wicker front basket.",
};

type P = [number, number, number];

const GREEN = "#1f5a43";
const CREAM = "#eadfc4";
const CHROME = "#c9ced3";
const BLACK = "#1d1d1d";
const BRASS = "#b08a3e";
const BROWN = "#6b3f1d";

const leather = mottle("#5a3418", "#8c5a2b", { size: 0.05, contrast: 1.2 });
const wicker = stripes("#d8b878", "#8a5a2b", { size: 0.018, axis: "y", width: 0.45 });

export default function bicycle() {
  const b = createBuilder({ name: "vintage bicycle" });

  // Joints: the frame is the root; the fork steers, the rear wheel and crank turn.
  const frame = b.joint("frame", { at: [0, 0, 0] });
  const fork = b.joint("fork", { parent: frame, at: [0, 0.82, 0.27] });
  const crank = b.joint("crank", { parent: frame, at: [0, 0.28, -0.02], dir: [1, 0, 0], up: [0, 0, 1] });
  const wheelF = b.joint("wheelF", { parent: fork, at: [0, 0.33, 0.52], dir: [1, 0, 0], up: [0, 0, 1] });
  const wheelR = b.joint("wheelR", { parent: frame, at: [0, 0.33, -0.5], dir: [1, 0, 0], up: [0, 0, 1] });
  const saddle = b.joint("saddle", { parent: frame, at: [0, 0.82, -0.18] });

  const tube = (a: P, c: P, r: number, color: string, bone: Joint = frame) => b.rod(a, c, r, { color, bone });

  // ---- Frame ------------------------------------------------------------------------------
  tube([0, 0.28, -0.02], [0, 0.815, -0.183], 0.017, GREEN); // seat tube
  tube([0, 0.815, -0.18], [0, 0.93, 0.21], 0.017, GREEN); // top tube
  tube([0, 0.82, 0.27], [0, 0.28, -0.02], 0.021, GREEN); // down tube
  tube([0, 0.82, 0.27], [0, 0.96, 0.22], 0.024, GREEN); // head tube

  for (const s of [1, -1]) {
    tube([s * 0.045, 0.28, -0.03], [s * 0.06, 0.33, -0.5], 0.011, GREEN); // chainstays
    tube([s * 0.02, 0.72, -0.155], [s * 0.06, 0.33, -0.5], 0.009, GREEN); // seat stays
    tube([s * 0.05, 0.8, 0.27], [s * 0.06, 0.33, 0.52], 0.013, GREEN, fork); // fork legs
  }
  tube([-0.06, 0.8, 0.27], [0.06, 0.8, 0.27], 0.02, GREEN, fork); // fork crown

  // Lugs at the joints.
  for (const at of [[0, 0.28, -0.02], [0, 0.82, 0.27], [0, 0.96, 0.22], [0, 0.815, -0.183]] as P[])
    b.part(new THREE.SphereGeometry(0.028, 12, 8), GREEN, { at, bone: frame });

  // Bottom bracket shell.
  const shell = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 12);
  shell.rotateZ(Math.PI / 2);
  b.part(shell, GREEN, { at: [0, 0.28, -0.02], bone: crank });

  // ---- Wheels -----------------------------------------------------------------------------
  const spokes = (joint: Joint, z: number) => {
    const at = (r: number, a: number): P => [0, 0.33 + r * Math.sin(a), z + r * Math.cos(a)];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      b.rod(at(0.03, a + 0.7), at(0.25, a), 0.0018, { color: CHROME, bone: joint });
    }
  };
  const wheel = (joint: Joint, z: number) => {
    const hub: P = [0, 0.33, z];
    const tyre = new THREE.TorusGeometry(0.29, 0.04, 8, 40);
    tyre.rotateY(Math.PI / 2);
    b.part(tyre, CREAM, { at: hub, bone: joint });
    const hubGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12);
    hubGeo.rotateZ(Math.PI / 2);
    b.part(hubGeo, CHROME, { at: hub, bone: joint });
    spokes(joint, z);
  };
  wheel(wheelF, 0.52);
  wheel(wheelR, -0.5);

  // Rear sprocket on the hub.
  const sprocket = new THREE.CylinderGeometry(0.045, 0.045, 0.01, 18);
  sprocket.rotateZ(Math.PI / 2);
  b.part(sprocket, CHROME, { at: [-0.06, 0.33, -0.5], bone: wheelR });

  // Mudguards: half-cylinders over each wheel, one piece each.
  for (const z of [0.52, -0.5]) {
    const guard = new THREE.CylinderGeometry(0.36, 0.36, 0.075, 28, 1, true, 0, Math.PI);
    guard.rotateZ(Math.PI / 2);
    b.part(guard, GREEN, { at: [0, 0.33, z], bone: frame });
  }

  // ---- Drive ------------------------------------------------------------------------------
  const ring = new THREE.CylinderGeometry(0.095, 0.095, 0.008, 36);
  ring.rotateZ(Math.PI / 2);
  b.part(ring, CHROME, { at: [-0.06, 0.28, -0.02], bone: crank });

  // Chain: top and bottom runs.
  b.rod([-0.06, 0.375, -0.02], [-0.06, 0.375, -0.5], 0.006, { color: BLACK, bone: frame });
  b.rod([-0.06, 0.185, -0.02], [-0.06, 0.285, -0.5], 0.006, { color: BLACK, bone: frame });

  // Cranks and pedals.
  b.rod([0.095, 0.28, -0.02], [0.095, 0.12, -0.02], 0.012, { color: CHROME, bone: crank });
  b.rod([-0.095, 0.28, -0.02], [-0.095, 0.44, -0.02], 0.012, { color: CHROME, bone: crank });
  for (const at of [[0.095, 0.12, -0.02], [-0.095, 0.44, -0.02]] as P[])
    b.part(new THREE.BoxGeometry(0.09, 0.02, 0.1), BLACK, { at, bone: crank });

  // ---- Saddle -----------------------------------------------------------------------------
  b.rod([0, 0.815, -0.183], [0, 0.85, -0.2], 0.014, { color: CHROME, bone: frame });
  b.sweep(
    catmull([
      [0, 0.86, -0.22],
      [0, 0.88, -0.05],
      [0, 0.86, 0.08],
    ]),
    {
      radius: (t: number): [number, number] => [0.055 * (1 - 0.6 * t) + 0.01, 0.022],
      color: leather,
      caps: "round",
      bone: saddle,
    },
  );

  // ---- Steering: stem, bars, grips, lamp, bell, basket -------------------------------------
  b.rod([0, 0.96, 0.22], [0, 1.0, 0.26], 0.014, { color: CHROME, bone: fork });
  const bars = catmull([
    [0.2, 1.07, 0.05],
    [0.17, 1.0, 0.22],
    [0, 1.0, 0.27],
    [-0.17, 1.0, 0.22],
    [-0.2, 1.07, 0.05],
  ]);
  b.sweep(bars, { radius: 0.012, color: CHROME, bone: fork });
  for (const s of [1, -1])
    b.rod([s * 0.2, 1.07, 0.05], [s * 0.2, 1.07, -0.1], 0.018, { color: BLACK, bone: fork });

  // Headlamp on a bracket at the fork crown.
  b.rod([0, 0.82, 0.27], [0, 0.8, 0.31], 0.012, { color: BRASS, bone: fork });
  const lamp = new THREE.CylinderGeometry(0.05, 0.055, 0.07, 18);
  lamp.rotateX(Math.PI / 2);
  b.part(lamp, BRASS, { at: [0, 0.8, 0.33], bone: fork });

  // Bell on the left bar, squashed into a dome.
  b.part(new THREE.SphereGeometry(0.03, 14, 10), BRASS, {
    at: [0.12, 1.04, 0.24],
    scale: [1, 0.8, 1],
    bone: fork,
  });

  // Wicker basket on a rack from the fork.
  b.rod([0, 0.84, 0.28], [0, 0.92, 0.5], 0.01, { color: CHROME, bone: fork });
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.14, 0.06],
      [0.16, 0.13],
      [0.165, 0.15],
      [0, 0.15],
    ],
    { color: wicker, at: [0, 0.92, 0.5], bone: fork },
  );
  const rim = new THREE.TorusGeometry(0.165, 0.009, 6, 28);
  rim.rotateX(Math.PI / 2);
  b.part(rim, BROWN, { at: [0, 1.07, 0.5], bone: fork });

  return b.root;
}
