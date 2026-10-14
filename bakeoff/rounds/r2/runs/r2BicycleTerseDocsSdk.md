```ts
import * as THREE from "three";
import { createBuilder, paint, stripes, catmull, rng } from "agentic-3js-builder";

export const meta = {
  name: "Vintage Bicycle",
  description:
    "A green roadster with cream fenders, swept bars, a sprung leather saddle, a wicker basket, a brass lamp and bell, and spoked wheels. The steering, both wheels and the cranks sit on their own joints.",
};

const GREEN = "#2a6b57";
const CREAM = "#e6dcb4";
const TIRE = "#1c1b1a";
const CHROME = "#c8ccd0";
const BRASS = "#b98a3c";
const LEATHER = "#7b4524";
const DARK = "#2b2a2a";
const RED = "#b3261e";
const GLASS = "#f4efd2";

export default function build() {
  const b = createBuilder({ name: "vintageBicycle" });

  const BB: [number, number, number] = [0, 0.3, -0.1];
  const HB: [number, number, number] = [0, 0.76, 0.45];
  const HT: [number, number, number] = [0, 0.94, 0.39];
  const RH: [number, number, number] = [0, 0.34, -0.55];
  const FH: [number, number, number] = [0, 0.34, 0.57];

  // ---------- skeleton ----------
  const frame = b.joint("frame", { at: BB, dir: [0, 0, 1], role: "spine" });
  const steer = b.joint("steer", { parent: frame, at: HB, aim: HT, role: "hinge" });
  const frontWheel = b.joint("frontWheel", { parent: steer, at: FH, dir: [1, 0, 0], role: "hinge" });
  const rearWheel = b.joint("rearWheel", { parent: frame, at: RH, dir: [1, 0, 0], role: "hinge" });
  const crank = b.joint("crank", { parent: frame, at: BB, dir: [-1, 0, 0], role: "hinge" });

  const tube = (a: number[], c: number[], r: number, bone: any, color = GREEN) =>
    b.rod(a, c, r, { bone, color, sides: 8 });

  // ---------- frame (diamond) ----------
  tube(BB, [0, 0.9, -0.28], 0.018, frame); // seat tube
  tube([0, 0.86, -0.255], [0, 0.91, 0.4], 0.017, frame); // top tube
  tube(BB, [0, 0.79, 0.44], 0.021, frame); // down tube
  tube(HB, HT, 0.024, steer); // head tube
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.13, 10), CHROME, { bone: frame, at: BB, dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    tube([s * 0.03, 0.3, -0.1], [s * 0.06, 0.34, -0.55], 0.011, frame);
    tube([s * 0.02, 0.82, -0.265], [s * 0.06, 0.34, -0.55], 0.009, frame);
  }
  // headset cups
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), CHROME, { bone: steer, at: [0, 0.95, 0.386], aim: HT });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), CHROME, { bone: steer, at: [0, 0.75, 0.453], aim: HT });

  // ---------- saddle ----------
  tube([0, 0.88, -0.275], [0, 1.01, -0.315], 0.013, frame, CHROME);
  b.loft(
    [
      { at: [0, 1.045, -0.44], w: 0.17, h: 0.05 },
      { at: [0, 1.05, -0.34], w: 0.15, h: 0.055 },
      { at: [0, 1.05, -0.24], w: 0.06, h: 0.04 },
      { at: [0, 1.045, -0.17], w: 0.025, h: 0.03 },
    ],
    { bone: frame, color: LEATHER, section: "box" } as any,
  );
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8), CHROME, {
      bone: frame,
      at: [s * 0.04, 1.022, -0.37],
    });
    b.rod([s * 0.04, 1.015, -0.44], [s * 0.02, 1.015, -0.2], 0.005, { bone: frame, color: CHROME, sides: 4 });
  }

  // ---------- fork, stem, handlebars ----------
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.04, 0.76, 0.45],
        [s * 0.055, 0.6, 0.5],
        [s * 0.06, 0.45, 0.55],
        [s * 0.06, 0.34, 0.57],
      ]),
      [0.016, 0.0105],
      { bone: steer, color: GREEN, sides: 8 },
    );
  }
  b.rod([-0.05, 0.765, 0.45], [0.05, 0.765, 0.45], 0.02, { bone: steer, color: GREEN, sides: 8 });
  tube(HT, [0, 1.04, 0.355], 0.014, steer, CHROME);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0, 1.04, 0.355],
        [s * 0.16, 1.045, 0.355],
        [s * 0.3, 1.06, 0.28],
        [s * 0.37, 1.055, 0.17],
      ]),
      0.011,
      { bone: steer, color: CHROME, sides: 8 },
    );
    b.rod([s * 0.37, 1.055, 0.17], [s * 0.38, 1.05, 0.04], 0.018, { bone: steer, color: DARK, sides: 8 });
    b.rod([s * 0.31, 1.07, 0.26], [s * 0.33, 1.1, 0.12], 0.005, { bone: steer, color: CHROME, sides: 4 }); // brake lever
  }
  // bell
  b.part(new THREE.SphereGeometry(0.03, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), BRASS, {
    bone: steer,
    at: [0.1, 1.062, 0.355],
  });
  // headlamp
  b.rod([0, 0.82, 0.42], [0, 0.82, 0.48], 0.008, { bone: steer, color: DARK, sides: 4 });
  b.part(new THREE.SphereGeometry(0.05, 10, 7), BRASS, { bone: steer, at: [0, 0.83, 0.52], scale: [1, 1, 1.1] });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.01, 10), GLASS, {
    bone: steer,
    at: [0, 0.83, 0.572],
    dir: [0, 0, 1],
  });
  // basket
  const wicker = stripes("#b08040", "#8a6128", { size: 0.025, axis: "y" });
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.155, 0.2],
      [0.145, 0.2],
      [0.11, 0.012],
      [0, 0.012],
    ],
    { at: [0, 1.1, 0.46], bone: steer, segments: 12, color: wicker },
  );
  b.part(new THREE.TorusGeometry(0.15, 0.008, 5, 14), "#6e4a20", {
    bone: steer,
    at: [0, 1.3, 0.46],
    dir: [0, 1, 0],
    axis: "z",
  });
  for (const s of [1, -1]) b.rod([s * 0.03, 1.04, 0.36], [s * 0.08, 1.11, 0.43], 0.006, { bone: steer, color: CHROME, sides: 4 });

  // ---------- wheels ----------
  const wheel = (joint: any, hub: number[], fenderBone: any, fenderAngles: number[]) => {
    const [hx, hy, hz] = hub;
    b.part(new THREE.TorusGeometry(0.31, 0.03, 8, 36), TIRE, { bone: joint, at: hub, dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.TorusGeometry(0.285, 0.011, 6, 36), CHROME, { bone: joint, at: hub, dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), CHROME, { bone: joint, at: hub, dir: [1, 0, 0] });
    b.rod([-0.075, hy, hz], [0.075, hy, hz], 0.007, { bone: joint, color: DARK, sides: 6 });
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 10), CHROME, {
        bone: joint,
        at: [hx + s * 0.04, hy, hz],
        dir: [1, 0, 0],
      });
      const N = 18;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const a2 = a + s * (i % 2 ? 0.55 : -0.55);
        b.rod(
          [hx + s * 0.04, hy + 0.035 * Math.cos(a), hz + 0.035 * Math.sin(a)],
          [hx, hy + 0.28 * Math.cos(a2), hz + 0.28 * Math.sin(a2)],
          0.0022,
          { bone: joint, color: CHROME, sides: 4, caps: "flat" },
        );
      }
    }
    const pts = fenderAngles.map((deg) => {
      const th = (deg * Math.PI) / 180;
      return [hx, hy + 0.365 * Math.cos(th), hz + 0.365 * Math.sin(th)];
    });
    b.sweep(catmull(pts), (_t: number) => [0.047, 0.006], { bone: fenderBone, color: CREAM, sides: 8 });
  };
  wheel(frontWheel, FH, steer, [-65, -40, -10, 20, 50, 75]);
  wheel(rearWheel, RH, frame, [45, 15, -15, -45, -75, -100]);

  // rear fender stays/reflector/rack
  b.part(new THREE.BoxGeometry(0.04, 0.025, 0.012), RED, { bone: frame, at: [0, 0.4, -0.905] });
  b.part(new THREE.BoxGeometry(0.12, 0.012, 0.22), DARK, { bone: frame, at: [0, 0.75, -0.55] });
  for (const s of [1, -1]) {
    b.rod([s * 0.06, 0.34, -0.55], [s * 0.05, 0.75, -0.45], 0.004, { bone: frame, color: CHROME, sides: 4 });
    b.rod([s * 0.06, 0.34, -0.55], [s * 0.05, 0.75, -0.65], 0.004, { bone: frame, color: CHROME, sides: 4 });
  }

  // ---------- drivetrain ----------
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.004, 22), CHROME, { bone: crank, at: [-0.045, 0.3, -0.1], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 12), CHROME, {
    bone: rearWheel,
    at: [-0.045, 0.34, -0.55],
    dir: [1, 0, 0],
  });
  for (const [y0, y1] of [
    [0.39, 0.38],
    [0.21, 0.3],
  ]) {
    b.rod([-0.045, y0, -0.1], [-0.045, y1, -0.55], 0.005, { bone: frame, color: DARK, sides: 4 });
  }
  b.rod([-0.06, 0.3, -0.1], [-0.06, 0.14, -0.1], 0.01, { bone: crank, color: CHROME, sides: 6 });
  b.rod([0.06, 0.3, -0.1], [0.06, 0.46, -0.1], 0.01, { bone: crank, color: CHROME, sides: 6 });
  b.rod([-0.06, 0.14, -0.1], [-0.15, 0.14, -0.1], 0.006, { bone: crank, color: CHROME, sides: 4 });
  b.rod([0.06, 0.46, -0.1], [0.15, 0.46, -0.1], 0.006, { bone: crank, color: CHROME, sides: 4 });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.075), DARK, { bone: crank, at: [-0.13, 0.14, -0.1] });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.075), DARK, { bone: crank, at: [0.13, 0.46, -0.1] });

  // small brass rivets on the head tube for character
  const r = rng(3);
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), BRASS, {
      bone: steer,
      at: [(r() - 0.5) * 0.01, 0.8 + i * 0.05, 0.43 - i * 0.017 + 0.025],
    });
  }

  return b.root;
}
```