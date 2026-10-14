```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Vintage Roadster Bicycle",
  description:
    "A green step-over roadster with cream whitewall tyres, fenders, north-road bars, Brooks-style leather saddle, headlamp, rear rack, chain and pedals. Rigged with steer, wheel and crank joints.",
};

const GREEN = "#1f4d3a";
const CREAM = "#efe3c0";
const CHROME = "#c9ccd0";
const DARK = "#2b2b2e";
const LEATHER = "#7a4a26";
const TIRE = "#1f1c1b";

export default function build() {
  const bd = createBuilder({ name: "vintageBicycle" });

  // ---- skeleton ----
  bd.joint("root", { at: [0, 0.3, -0.05] });
  bd.joint("steer", { parent: "root", at: [0, 0.83, 0.375], dir: [0, 0.18, -0.07], role: "hinge" });
  bd.joint("frontWheel", { parent: "steer", at: [0, 0.35, 0.55], dir: [1, 0, 0] });
  bd.joint("rearWheel", { parent: "root", at: [0, 0.35, -0.55], dir: [1, 0, 0] });
  bd.joint("crank", { parent: "root", at: [0, 0.3, -0.05], dir: [1, 0, 0] });
  bd.joint("pedalR", { parent: "crank", at: [-0.14, 0.13, -0.05], dir: [-1, 0, 0] });
  bd.joint("pedalL", { parent: "crank", at: [0.14, 0.47, -0.05], dir: [1, 0, 0] });

  const tube = (
    a: number[], c: number[], r: number | [number, number], color: string, bone = "root", sides = 8,
  ) => bd.rod(a, c, r, { color, bone, sides, caps: "round" });
  const mk = (
    geo: THREE.BufferGeometry, color: string, at: number[], bone: string, rotation?: number[], scale?: number | number[],
  ) => bd.part(geo, color, { at, bone, rotation, scale: scale as any });

  // ---- frame ----
  const bb = [0, 0.3, -0.05];
  const seatTop = [0, 0.86, -0.2];
  const headTop = [0, 0.92, 0.34];
  const headBot = [0, 0.74, 0.41];
  tube(bb, seatTop, 0.0155, GREEN);                         // seat tube
  tube([0, 0.88, -0.19], [0, 0.89, 0.355], 0.0165, GREEN);  // top tube
  tube(bb, [0, 0.77, 0.40], 0.0195, GREEN);                 // down tube
  tube(headBot, headTop, 0.022, GREEN);                     // head tube
  for (const s of [1, -1]) {
    tube([s * 0.03, 0.3, -0.05], [s * 0.06, 0.35, -0.55], 0.0105, GREEN);   // chainstay
    tube([s * 0.015, 0.82, -0.19], [s * 0.06, 0.35, -0.55], 0.009, GREEN);  // seatstay
  }
  // lugs and bottom-bracket shell
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10), CHROME, bb, "root", [0, 0, 90]);
  mk(new THREE.SphereGeometry(0.027, 8, 6), CREAM, seatTop, "root");
  tube([0, 0.9, 0.35], [0, 0.915, 0.343], 0.027, CREAM);
  tube([0, 0.745, 0.408], [0, 0.76, 0.4], 0.027, CREAM);

  // seat post and saddle
  tube([0, 0.84, -0.195], [0, 0.95, -0.225], 0.0105, CHROME);
  bd.extrude(
    [[-0.015, -0.14], [0.015, -0.14], [0.04, -0.05], [0.075, 0.07], [0.05, 0.14],
     [-0.05, 0.14], [-0.075, 0.07], [-0.04, -0.05]],
    { color: LEATHER, at: [0, 0.975, -0.23], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.045, bevel: 0.016, smoothing: 1, bone: "root" },
  );
  for (const s of [1, -1]) {
    tube([s * 0.03, 0.953, -0.15], [s * 0.05, 0.96, -0.3], 0.004, CHROME, "root", 5);
    tube([s * 0.03, 0.953, -0.15], [s * 0.03, 0.97, -0.115], 0.004, CHROME, "root", 5);
  }
  mk(new THREE.BoxGeometry(0.1, 0.016, 0.03), CHROME, [0, 0.948, -0.215], "root");

  // ---- wheels ----
  const wheel = (joint: string, z: number, front: boolean) => {
    mk(new THREE.TorusGeometry(0.325, 0.025, 8, 36), TIRE, [0, 0.35, z], joint, [0, 90, 0]);
    mk(new THREE.TorusGeometry(0.303, 0.009, 5, 36), CHROME, [0, 0.35, z], joint, [0, 90, 0]);
    for (const s of [1, -1])
      mk(new THREE.RingGeometry(0.319, 0.331, 36), CREAM, [s * 0.0238, 0.35, z], joint, [0, s * 90, 0]);
    mk(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 10), CHROME, [0, 0.35, z], joint, [0, 0, 90]);
    for (const s of [1, -1])
      mk(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 10), CHROME, [s * 0.045, 0.35, z], joint, [0, 0, 90]);
    for (let i = 0; i < 36; i++) {
      const a = (i * 10 * Math.PI) / 180;
      const side = i % 2 ? 1 : -1;
      const off = side * 0.2;
      const hub = [side * 0.04, 0.35 + 0.03 * Math.cos(a + off), z + 0.03 * Math.sin(a + off)];
      const rim = [0, 0.35 + 0.3 * Math.cos(a), z + 0.3 * Math.sin(a)];
      bd.rod(hub, rim, 0.0013, { color: CHROME, bone: joint, sides: 3, caps: "flat" });
    }
    // fender
    const arc = front ? 2.2 : 2.4;
    mk(new THREE.TorusGeometry(0.395, 0.035, 5, 20, arc), GREEN, [0, 0.35, z], "root", [0, front ? -90 : 90, 0], [1, 1, 1.5]);
  };
  // fender of the front wheel follows steering
  wheel("frontWheel", 0.55, true);
  wheel("rearWheel", -0.55, false);

  // ---- fork and steering ----
  for (const s of [1, -1]) {
    tube([s * 0.045, 0.74, 0.41], [s * 0.05, 0.35, 0.55], [0.012, 0.007], GREEN, "steer");
    mk(new THREE.SphereGeometry(0.009, 6, 5), CHROME, [s * 0.057, 0.35, 0.55], "steer");
  }
  tube([-0.045, 0.745, 0.41], [0.045, 0.745, 0.41], 0.014, GREEN, "steer");
  tube([0, 0.9, 0.35], [0, 1.02, 0.31], 0.012, CHROME, "steer");
  for (const s of [1, -1]) {
    const pts = [[0, 1.03, 0.31], [s * 0.17, 1.03, 0.31], [s * 0.27, 1.04, 0.26], [s * 0.3, 1.04, 0.17]];
    bd.sweep(catmull(pts), 0.0095, { color: CHROME, bone: "steer", sides: 6 });
    tube([s * 0.3, 1.04, 0.17], [s * 0.31, 1.04, 0.03], 0.0155, LEATHER, "steer", 8);
    tube([s * 0.3, 1.035, 0.2], [s * 0.285, 1.0, 0.27], 0.005, CHROME, "steer", 5);
  }
  // bell
  mk(new THREE.SphereGeometry(0.03, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), CHROME, [-0.1, 1.04, 0.31], "steer");
  // headlamp
  tube([0, 0.9, 0.38], [0, 0.93, 0.46], 0.006, CHROME, "steer", 5);
  mk(new THREE.SphereGeometry(0.05, 10, 8), CHROME, [0, 0.95, 0.5], "steer", undefined, [1, 1, 1.0]);
  mk(new THREE.CylinderGeometry(0.036, 0.036, 0.02, 10), "#f6e7a0", [0, 0.95, 0.545], "steer", [90, 0, 0]);

  // ---- drivetrain ----
  mk(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 18), CHROME, [-0.06, 0.3, -0.05], "crank", [0, 0, 90]);
  mk(new THREE.CylinderGeometry(0.045, 0.045, 0.008, 12), CHROME, [-0.06, 0.35, -0.55], "rearWheel", [0, 0, 90]);
  tube([-0.06, 0.39, -0.05], [-0.06, 0.395, -0.55], 0.006, DARK, "root", 5);
  tube([-0.06, 0.21, -0.05], [-0.06, 0.305, -0.55], 0.006, DARK, "root", 5);
  tube([-0.085, 0.3, -0.05], [0.085, 0.3, -0.05], 0.008, CHROME, "crank", 6);
  tube([-0.085, 0.3, -0.05], [-0.085, 0.13, -0.05], [0.014, 0.01], CHROME, "crank", 6);
  tube([0.085, 0.3, -0.05], [0.085, 0.47, -0.05], [0.014, 0.01], CHROME, "crank", 6);
  mk(new THREE.BoxGeometry(0.1, 0.02, 0.07), DARK, [-0.14, 0.13, -0.05], "pedalR");
  mk(new THREE.BoxGeometry(0.1, 0.02, 0.07), DARK, [0.14, 0.47, -0.05], "pedalL");

  // ---- rear rack and reflector ----
  mk(new THREE.BoxGeometry(0.13, 0.012, 0.28), CHROME, [0, 0.83, -0.52], "root");
  for (const s of [1, -1]) {
    tube([s * 0.055, 0.83, -0.64], [s * 0.055, 0.35, -0.55], 0.004, CHROME, "root", 5);
    tube([s * 0.05, 0.83, -0.4], [s * 0.03, 0.6, -0.37], 0.004, CHROME, "root", 5);
  }
  mk(new THREE.BoxGeometry(0.05, 0.03, 0.01), "#b3202a", [0, 0.82, -0.665], "root");

  return bd.root;
}
```