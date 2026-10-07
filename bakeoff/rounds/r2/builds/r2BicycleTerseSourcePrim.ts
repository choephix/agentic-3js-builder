import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Vintage Bicycle",
  description: "A green roadster with chrome fork, leather saddle, swept bars, fenders, chain and spoked wheels.",
};

export default function build() {
  const b = createBuilder({ name: "vintage_bicycle" });

  const GREEN = "#1f5a46", CREAM = "#eadfbe", CHROME = "#c9ced1", DARK = "#1c1c1e";
  const LEATHER = "#7a4524", RUBBER = "#151515", BRASS = "#b58a3a", RED = "#b3222a";

  const BB: [number, number, number] = [0, 0.3, -0.05];
  const RA: [number, number, number] = [0, 0.34, -0.55];
  const FA: [number, number, number] = [0, 0.34, 0.55];

  const frame = b.joint("frame", { at: [0, 0.34, 0] });
  const fork = b.joint("fork", { parent: frame, at: [0, 0.88, 0.44], dir: [0, -0.12, 0.04] });
  const wheelF = b.joint("wheelF", { parent: fork, at: FA });
  const wheelR = b.joint("wheelR", { parent: frame, at: RA });
  const crank = b.joint("crank", { parent: frame, at: BB });
  const pedalL = b.joint("pedalL", { parent: crank, at: [0.09, 0.13, -0.05] });
  const pedalR = b.joint("pedalR", { parent: crank, at: [-0.09, 0.47, -0.05] });

  // ---- wheels
  const wheel = (j: any, c: [number, number, number]) => {
    b.part(new THREE.TorusGeometry(0.315, 0.025, 8, 36), RUBBER, { at: c, rotation: [0, 90, 0], bone: j });
    b.part(new THREE.TorusGeometry(0.287, 0.009, 6, 36), CHROME, { at: c, rotation: [0, 90, 0], bone: j, scale: [1, 1, 2] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10), CHROME, { at: c, rotation: [0, 0, 90], bone: j });
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 10), CHROME, { at: [s * 0.04, c[1], c[2]], rotation: [0, 0, 90], bone: j });
    for (let i = 0; i < 24; i++) {
      const th = (i * 15 * Math.PI) / 180;
      const x = i % 2 ? 0.014 : -0.014;
      b.part(new THREE.CylinderGeometry(0.0032, 0.0032, 0.26, 3), "#d8dcde", {
        at: [x, c[1] + 0.1575 * Math.cos(th), c[2] + 0.1575 * Math.sin(th)],
        rotation: [i * 15, 0, 0],
        bone: j,
      });
    }
    // cream sidewall stripe
    b.part(new THREE.TorusGeometry(0.31, 0.004, 4, 36), CREAM, { at: [0.021, c[1], c[2]], rotation: [0, 90, 0], bone: j });
    b.part(new THREE.TorusGeometry(0.31, 0.004, 4, 36), CREAM, { at: [-0.021, c[1], c[2]], rotation: [0, 90, 0], bone: j });
  };
  wheel(wheelF, FA);
  wheel(wheelR, RA);

  // ---- frame tubes
  const seatTop: [number, number, number] = [0, 0.93, -0.16];
  const headTop: [number, number, number] = [0, 1.0, 0.41];
  const headBot: [number, number, number] = [0, 0.84, 0.45];
  b.rod(BB, seatTop, 0.014, { color: GREEN, bone: frame });
  b.rod([0, 0.9, -0.15], [0, 0.97, 0.41], 0.013, { color: GREEN, bone: frame }); // top tube (slight slope)
  b.rod(BB, [0, 0.87, 0.44], 0.017, { color: GREEN, bone: frame }); // down tube
  b.rod(headBot, headTop, 0.02, { color: GREEN, bone: frame }); // head tube
  for (const s of [1, -1]) {
    b.rod(BB, [s * 0.055, 0.34, -0.55], 0.009, { color: GREEN, bone: frame });
    b.rod([0, 0.86, -0.15], [s * 0.05, 0.34, -0.55], 0.007, { color: GREEN, bone: frame });
    b.rod([0, 0.88, 0.44], [s * 0.05, 0.34, 0.55], [0.011, 0.007], { color: CHROME, bone: fork });
  }
  b.rod([-0.055, 0.34, -0.55], [0.055, 0.34, -0.55], 0.007, { color: CHROME, bone: frame });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GREEN, { at: BB, bone: frame });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8), CHROME, { at: BB, rotation: [0, 0, 90], bone: crank });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 8), CREAM, { at: [0, 0.885, 0.44], bone: frame, rotation: [0, 0, 0], scale: [1.1, 1, 1.1] });
  b.rod([0, 0.94, 0.425], [0, 0.99, 0.41], 0.026, { color: CREAM, bone: frame }); // head badge band

  // fork crown + stem + bars
  b.part(new THREE.BoxGeometry(0.13, 0.03, 0.04), CHROME, { at: [0, 0.83, 0.455], bone: fork });
  b.rod([0, 0.95, 0.425], [0, 1.1, 0.4], 0.011, { color: CHROME, bone: fork });
  const bars = new THREE.CatmullRomCurve3(
    [[-0.23, 1.04, 0.28], [-0.25, 1.08, 0.37], [-0.13, 1.11, 0.4], [0, 1.115, 0.4], [0.13, 1.11, 0.4], [0.25, 1.08, 0.37], [0.23, 1.04, 0.28]].map(
      (p) => new THREE.Vector3(...p),
    ),
  ).getPoints(14);
  b.sweep(bars.map((v) => [v.x, v.y, v.z]), 0.0105, { color: CHROME, bone: fork, sides: 6 });
  for (const s of [1, -1]) {
    b.rod([s * 0.23, 1.04, 0.28], [s * 0.225, 1.025, 0.2], 0.016, { color: LEATHER, bone: fork });
    b.rod([s * 0.2, 1.1, 0.395], [s * 0.2, 1.06, 0.34], 0.006, { color: DARK, bone: fork });
  }
  b.part(new THREE.SphereGeometry(0.025, 8, 6), BRASS, { at: [0.12, 1.14, 0.4], bone: fork, scale: [1, 0.8, 1] }); // bell
  // headlamp
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 10), CHROME, { at: [0, 0.99, 0.54], rotation: [90, 0, 0], bone: fork });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 10), "#fff3b0", { at: [0, 0.99, 0.578], rotation: [90, 0, 0], bone: fork });
  b.rod([0, 0.95, 0.44], [0, 0.98, 0.52], 0.006, { color: CHROME, bone: fork });

  // ---- saddle
  b.rod([0, 0.9, -0.155], [0, 1.0, -0.175], 0.012, { color: CHROME, bone: frame });
  b.part(new THREE.SphereGeometry(1, 10, 6), LEATHER, { at: [0, 1.04, -0.2], scale: [0.085, 0.032, 0.13], bone: frame });
  b.part(new THREE.SphereGeometry(1, 8, 6), LEATHER, { at: [0, 1.04, -0.06], scale: [0.04, 0.025, 0.12], bone: frame });
  for (const s of [1, -1]) b.rod([s * 0.04, 1.01, -0.3], [s * 0.02, 1.01, -0.05], 0.004, { color: CHROME, bone: frame });
  for (const s of [1, -1]) b.rod([s * 0.04, 1.01, -0.2], [s * 0.012, 0.99, -0.17], 0.004, { color: CHROME, bone: frame });

  // ---- drivetrain
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.008, 16), CHROME, { at: [0.05, BB[1], BB[2]], rotation: [0, 0, 90], bone: crank });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 10), CHROME, { at: [0.045, RA[1], RA[2]], rotation: [0, 0, 90], bone: wheelR });
  b.rod([0.045, 0.395, -0.05], [0.045, 0.38, -0.55], 0.004, { color: DARK, bone: frame });
  b.rod([0.045, 0.205, -0.05], [0.045, 0.3, -0.55], 0.004, { color: DARK, bone: frame });
  b.rod([0.075, 0.3, -0.05], [0.075, 0.13, -0.05], 0.009, { color: CHROME, bone: crank });
  b.rod([-0.075, 0.3, -0.05], [-0.075, 0.47, -0.05], 0.009, { color: CHROME, bone: crank });
  for (const [j, p] of [[pedalL, [0.12, 0.13, -0.05]], [pedalR, [-0.12, 0.47, -0.05]]] as const) {
    b.part(new THREE.BoxGeometry(0.08, 0.02, 0.1), DARK, { at: p as any, bone: j });
  }

  // ---- fenders & reflector
  const fender = (r: number, c: number[], arc: number, j: any, rot = 0) =>
    b.part(new THREE.TorusGeometry(r, 0.01, 4, 20, arc).rotateZ(Math.PI / 2 - arc / 2 + rot), GREEN, {
      at: c as any, rotation: [0, 90, 0], scale: [1, 1, 5], bone: j,
    });
  fender(0.355, FA, 2.0, fork, 0.35);
  fender(0.355, RA, 2.3, frame, -0.3);
  b.part(new THREE.BoxGeometry(0.03, 0.045, 0.012), RED, { at: [0, 0.5, -0.88], rotation: [20, 0, 0], bone: frame });
  // rear rack
  b.rod([0, 0.72, -0.2], [0, 0.72, -0.62], 0.005, { color: CHROME, bone: frame });
  b.part(new THREE.BoxGeometry(0.11, 0.008, 0.2), CHROME, { at: [0, 0.73, -0.45], bone: frame });
  // kickstand
  b.rod([0.04, 0.34, -0.5], [0.07, 0.04, -0.58], 0.005, { color: DARK, bone: frame });

  return b.root;
}
