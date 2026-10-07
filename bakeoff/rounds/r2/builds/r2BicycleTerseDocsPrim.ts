import * as THREE from "three";
import { createBuilder, arc, catmull } from "../../../../src/index";

export const meta = {
  name: "Vintage Bicycle",
  description: "A classic green roadster with leather saddle and grips, fenders, spoked wheels, chain guard, bell and lamp.",
};

const GREEN = "#1f5a46";
const CREAM = "#efe3c0";
const CHROME = "#c8ccd0";
const TIRE = "#1c1c1c";
const LEATHER = "#7a4a22";
const BRASS = "#b8923a";
const BLACK = "#222426";
const RED = "#b3262b";
const GLASS = "#fff2b0";

export default function build() {
  const b = createBuilder({ name: "vintageBicycle" });

  const AY = 0.36; // axle height
  const RZ = -0.5;
  const FZ = 0.5;
  const BB: [number, number, number] = [0, 0.3, -0.08];

  const frame = b.joint("frame", { at: [0, 0.6, 0] });
  const steer = b.joint("steer", { parent: frame, at: [0, 0.82, 0.4], aim: [0, 0.97, 0.37] });
  const wheelR = b.joint("wheelR", { parent: frame, at: [0, AY, RZ], dir: [1, 0, 0], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: [0, AY, FZ], dir: [1, 0, 0], role: "hinge" });
  const crank = b.joint("crank", { parent: frame, at: BB, dir: [1, 0, 0], role: "hinge" });
  const pedalR = b.joint("pedalR", { parent: crank, at: [-0.09, BB[1] - 0.17, BB[2]], dir: [-1, 0, 0] });
  const pedalL = b.joint("pedalL", { parent: crank, at: [0.09, BB[1] + 0.17, BB[2]], dir: [1, 0, 0] });

  const tube = (a: number[], c: number[], r: number | [number, number], color: string, bone: any, sides = 8) =>
    b.rod(a, c, r, { color, bone, sides });

  // ---- frame ----
  const seatTop = [0, 0.93, -0.23];
  const headTop = [0, 0.97, 0.37];
  const headBot = [0, 0.82, 0.4];
  tube(BB, seatTop, 0.0155, GREEN, frame);
  tube([0, 0.89, -0.215], headTop.map((v, i) => (i === 1 ? 0.93 : v)), 0.015, GREEN, frame);
  tube(BB, headBot, 0.019, GREEN, frame);
  tube(headBot, headTop, 0.024, GREEN, steer);
  for (const y of [0.822, 0.968]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), CHROME, { bone: steer, at: [0, y, 0.4 - (y - 0.82) * 0.2], dir: [0, 0.15, -0.03] });
  }
  // badge
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 12), BRASS, { bone: steer, at: [0, 0.9, 0.428], dir: [0, 0, 1], axis: "y", rotation: [90, 0, 0] });

  for (const s of [1, -1]) {
    const axle = [s * 0.055, AY, RZ];
    tube([s * 0.012, BB[1], BB[2] - 0.02], axle, 0.0105, GREEN, frame);
    tube([s * 0.01, 0.87, -0.215], axle, 0.009, GREEN, frame);
    // rear dropout
    b.part(new THREE.BoxGeometry(0.012, 0.04, 0.03), GREEN, { bone: frame, at: [s * 0.055, AY + 0.01, RZ] });
    // fork blade
    tube([s * 0.05, 0.8, 0.405], [s * 0.05, AY, FZ], [0.015, 0.009], GREEN, steer);
    // pedal + crank
    const rightSide = s < 0;
    const pedalJ = rightSide ? pedalR : pedalL;
    const py = rightSide ? BB[1] - 0.17 : BB[1] + 0.17;
    tube([s * 0.07, BB[1], BB[2]], [s * 0.085, py, BB[2]], [0.014, 0.011], CHROME, crank);
    b.part(new THREE.BoxGeometry(0.1, 0.02, 0.07), BLACK, { bone: pedalJ, at: [s * 0.14, py, BB[2]] });
    tube([s * 0.085, py, BB[2]], [s * 0.19, py, BB[2]], 0.006, CHROME, pedalJ, 6);
  }
  // fork crown + bottom bracket shell
  tube([-0.055, 0.8, 0.405], [0.055, 0.8, 0.405], 0.016, GREEN, steer);
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.1, 10), CHROME, { bone: frame, at: BB, rotation: [0, 0, 90] });
  tube([0, 0.37, -0.5], [0, 0.37, -0.5 + 0.0001], 0.001, GREEN, frame, 3);

  // ---- chain drive ----
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.006, 18), CHROME, { bone: crank, at: [-0.05, BB[1], BB[2]], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.108, 0.108, 0.004, 20), BLACK, { bone: frame, at: [-0.068, BB[1], BB[2]], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 12), CHROME, { bone: wheelR, at: [-0.04, AY, RZ], rotation: [0, 0, 90] });
  const cx = -0.047;
  b.sweep(
    catmull(
      [
        [cx, 0.385, BB[2]],
        [cx, 0.4, RZ],
        [cx, 0.32, RZ],
        [cx, 0.215, BB[2]],
      ],
      { closed: true, tension: 0.5 },
    ),
    0.004,
    { color: BLACK, bone: frame, sides: 5 },
  );

  // ---- wheels ----
  const wheel = (bone: any, cz: number) => {
    b.part(new THREE.TorusGeometry(0.335, 0.025, 8, 36), TIRE, { bone, at: [0, AY, cz], rotation: [0, 90, 0] });
    b.part(new THREE.TorusGeometry(0.318, 0.011, 6, 36), CHROME, { bone, at: [0, AY, cz], rotation: [0, 90, 0] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 10), CHROME, { bone, at: [0, AY, cz], rotation: [0, 0, 90] });
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 12), CHROME, { bone, at: [s * 0.04, AY, cz], rotation: [0, 0, 90] });
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6), CHROME, { bone, at: [s * 0.075, AY, cz], rotation: [0, 0, 90] });
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const o = a + s * 0.3;
        const hub = [s * 0.04, AY + 0.033 * Math.cos(o), cz + 0.033 * Math.sin(o)];
        const rim = [0, AY + 0.312 * Math.cos(a), cz + 0.312 * Math.sin(a)];
        b.rod(hub, rim, 0.0022, { color: CHROME, bone, sides: 4 });
      }
    }
  };
  wheel(wheelR, RZ);
  wheel(wheelF, FZ);

  // ---- fenders ----
  const fw = (t: number) => [0.04, 0.004] as [number, number];
  const rearArc = arc([0, AY, RZ], [0, AY + 0.4 * Math.cos(0.5), RZ + 0.4 * Math.sin(0.5)], [1, 0, 0], -135);
  b.sweep(rearArc, fw, { color: GREEN, bone: frame, section: "box", caps: "flat" });
  const frontArc = arc([0, AY, FZ], [0, AY + 0.4 * Math.cos(1.15), FZ + 0.4 * Math.sin(1.15)], [1, 0, 0], -150);
  b.sweep(frontArc, fw, { color: GREEN, bone: steer, section: "box", caps: "flat" });
  // fender stays
  for (const s of [1, -1]) {
    b.rod([s * 0.04, AY + 0.4 * Math.cos(0.5), RZ + 0.4 * Math.sin(0.5)], [s * 0.055, AY, RZ], 0.003, { color: CHROME, bone: frame, sides: 4 });
    b.rod([s * 0.035, AY + 0.4 * Math.cos(1.15), FZ + 0.4 * Math.sin(1.15)], [s * 0.05, AY, FZ], 0.003, { color: CHROME, bone: steer, sides: 4 });
  }
  const tail = rearArc.at(1);
  b.part(new THREE.BoxGeometry(0.05, 0.03, 0.01), RED, { bone: frame, at: [tail.x, tail.y + 0.01, tail.z - 0.005] });
  b.part(new THREE.BoxGeometry(0.082, 0.012, 0.03), CREAM, { bone: steer, at: [0, AY + 0.4 * Math.cos(1.15) , FZ + 0.4 * Math.sin(1.15)] });

  // ---- handlebar ----
  tube(headTop, [0, 1.08, 0.35], 0.012, CHROME, steer);
  b.sweep(
    catmull([
      [0.22, 1.04, 0.17],
      [0.3, 1.07, 0.3],
      [0.2, 1.09, 0.37],
      [0, 1.09, 0.37],
      [-0.2, 1.09, 0.37],
      [-0.3, 1.07, 0.3],
      [-0.22, 1.04, 0.17],
    ]),
    0.0105,
    { color: CHROME, bone: steer, sides: 8 },
  );
  b.rod([0, 1.08, 0.35], [0, 1.09, 0.37], 0.016, { color: CHROME, bone: steer, sides: 8 });
  for (const s of [1, -1]) {
    b.rod([s * 0.22, 1.04, 0.17], [s * 0.27, 1.06, 0.25], 0.0165, { color: LEATHER, bone: steer, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8), BRASS, { bone: steer, at: [s * 0.215, 1.038, 0.155], dir: [-s * 0.5, -0.2, -0.8] });
    b.rod([s * 0.285, 1.075, 0.29], [s * 0.2, 1.1, 0.2], 0.005, { color: CHROME, bone: steer, sides: 5 });
  }
  // bell
  b.part(new THREE.SphereGeometry(0.03, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), BRASS, { bone: steer, at: [0.08, 1.1, 0.37] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), CHROME, { bone: steer, at: [0.08, 1.09, 0.37] });

  // ---- lamp ----
  tube([0, 0.86, 0.425], [0, 0.89, 0.465], 0.006, CHROME, steer, 6);
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.06, 12), BLACK, { bone: steer, at: [0, 0.91, 0.48], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.036, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: steer, at: [0, 0.91, 0.51], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.04, 0.005, 5, 14), CHROME, { bone: steer, at: [0, 0.91, 0.51] });

  // ---- saddle ----
  tube([0, 0.9, -0.225], [0, 1.045, -0.255], 0.0125, CHROME, frame);
  b.part(new THREE.BoxGeometry(0.05, 0.02, 0.05), CHROME, { bone: frame, at: [0, 1.05, -0.26] });
  for (const s of [1, -1]) {
    b.rod([s * 0.03, 1.055, -0.34], [s * 0.025, 1.06, -0.17], 0.004, { color: CHROME, bone: frame, sides: 5 });
    b.rod([s * 0.05, 1.075, -0.33], [s * 0.04, 1.075, -0.18], 0.005, { color: CHROME, bone: frame, sides: 5 });
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.TorusGeometry(0.018, 0.0035, 4, 8), CHROME, { bone: frame, at: [s * 0.04, 1.068, -0.33 + k * 0.045], rotation: [0, 90, 0] });
    }
  }
  b.part(new THREE.SphereGeometry(0.1, 10, 6), LEATHER, { bone: frame, at: [0, 1.105, -0.29], scale: [0.85, 0.28, 1.15] });
  b.part(new THREE.SphereGeometry(0.06, 8, 5), LEATHER, { bone: frame, at: [0, 1.1, -0.17], scale: [0.4, 0.3, 1.5] });
  b.part(new THREE.BoxGeometry(0.19, 0.004, 0.04), BRASS, { bone: frame, at: [0, 1.087, -0.405] });

  return b.root;
}
