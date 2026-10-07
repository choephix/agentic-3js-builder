import * as THREE from "three";
import { createBuilder, arc, catmull, spiral, paint } from "../../../../src/index";

export const meta = {
  name: "Dutch city bicycle",
  description:
    "Vintage mint-green omafiets-style city bike with upright bars, sprung leather saddle, chrome mudguards, chain case, whitewall tyres and a wicker basket of sunflowers and a baguette.",
};

const MINT = "#8fd4b8";
const CREAM = "#f3ead2";
const CHROME = "#d9dde0";
const BROWN = "#7a4a28";
const TYRE = "#1d1d1f";
const WHITE = "#f4f1e8";
const WICKER = "#c99a5b";
const WICKERDK = "#a87a3e";
const YELLOW = "#f5c518";
const GOLD = "#e8a400";
const SEED = "#4a2c14";
const GREEN = "#4f8a3a";
const BREAD = "#d8a05a";
const CRUMB = "#f1d29a";
const BRASS = "#c9a24a";
const RED = "#d32f2f";
const BLACK = "#2a2a2a";

export default function build() {
  const b = createBuilder({ name: "dutchBike" });

  // ---------- skeleton ----------
  const frm = b.joint("frame", { at: [0, 0.6, 0], role: "spine" });
  const rearWheel = b.joint("rearWheel", { parent: frm, at: [0, 0.35, -0.55], role: "hinge" });
  const steer = b.joint("steer", { parent: frm, at: [0, 0.89, 0.415], dir: [0, 1, 0.15], role: "hinge" });
  const frontWheel = b.joint("frontWheel", { parent: steer, at: [0, 0.35, 0.55], role: "hinge" });
  const crank = b.joint("crank", { parent: frm, at: [0, 0.3, -0.05], role: "hinge" });

  const cap = (a: number[], c: number[], r: number, bone: any, color = MINT) =>
    b.capsule(a, c, r, { color, bone });

  // ---------- wheels ----------
  function wheel(bone: any, z: number) {
    const y = 0.35;
    b.part(new THREE.TorusGeometry(0.32, 0.032, 8, 32), TYRE, { at: [0, y, z], dir: [1, 0, 0], axis: "z", bone, flat: true });
    for (const s of [1, -1])
      b.part(new THREE.TorusGeometry(0.305, 0.007, 5, 32), WHITE, { at: [s * 0.028, y, z], dir: [1, 0, 0], axis: "z", bone });
    b.part(new THREE.TorusGeometry(0.284, 0.01, 6, 32), CHROME, { at: [0, y, z], dir: [1, 0, 0], axis: "z", bone });
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.12, 10), CHROME, { at: [0, y, z], dir: [1, 0, 0], bone });
    for (const s of [1, -1])
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 10), CHROME, { at: [s * 0.03, y, z], dir: [1, 0, 0], bone });
    for (let i = 0; i < 24; i++) {
      const a = (i * 15 * Math.PI) / 180;
      const ah = a + (i % 4 < 2 ? 0.55 : -0.55);
      const fx = i % 2 ? 0.03 : -0.03;
      b.rod(
        [fx, y + 0.04 * Math.cos(ah), z + 0.04 * Math.sin(ah)],
        [0, y + 0.28 * Math.cos(a), z + 0.28 * Math.sin(a)],
        0.0022,
        { color: CHROME, bone, sides: 3 },
      );
    }
  }
  wheel(rearWheel, -0.55);
  wheel(frontWheel, 0.55);

  // ---------- frame ----------
  const BB = [0, 0.3, -0.05];
  const seatTop = [0, 0.96, -0.28];
  const headLow = [0, 0.8, 0.4];
  const headUp = [0, 0.99, 0.43];
  cap(BB, seatTop, 0.018, frm);
  cap([0, 0.86, -0.245], [0, 0.92, 0.42], 0.017, frm);
  cap(BB, [0, 0.83, 0.405], 0.02, frm);
  for (const s of [1, -1]) {
    cap([s * 0.02, 0.86, -0.245], [s * 0.055, 0.35, -0.55], 0.01, frm);
    cap([s * 0.03, 0.3, -0.05], [s * 0.055, 0.35, -0.55], 0.011, frm);
    // fork
    cap([s * 0.045, 0.8, 0.4], [s * 0.05, 0.35, 0.55], 0.014, steer);
    // carrier stays
    b.rod([s * 0.055, 0.35, 0.55], [s * 0.1, 0.8, 0.66], 0.004, { color: CHROME, bone: steer, sides: 5 });
    b.rod([s * 0.06, 0.35, -0.55], [s * 0.065, 0.78, -0.68], 0.005, { color: BLACK, bone: frm, sides: 5 });
  }
  cap([-0.05, 0.8, 0.4], [0.05, 0.8, 0.4], 0.016, steer);
  b.rod([-0.07, 0.35, 0.55], [0.07, 0.35, 0.55], 0.007, { color: CHROME, bone: frontWheel });
  b.rod([-0.07, 0.35, -0.55], [0.07, 0.35, -0.55], 0.007, { color: CHROME, bone: rearWheel });
  cap([0, 0.79, 0.4], headUp, 0.025, steer);
  for (const p of [BB, seatTop, [0, 0.83, 0.405], [0, 0.92, 0.42], [0, 0.86, -0.245]])
    b.part(new THREE.SphereGeometry(0.024, 8, 6), MINT, { at: p, bone: frm });
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.004, 12), BRASS, { at: [0, 0.89, 0.446], dir: [0, 0.15, 1], bone: steer });

  // ---------- crank & pedals ----------
  b.rod([-0.13, 0.3, -0.05], [0.13, 0.3, -0.05], 0.012, { color: CHROME, bone: crank });
  const pedalY: Record<string, number> = { "1": 0.13, "-1": 0.47 };
  for (const s of [1, -1]) {
    const py = pedalY[String(s)];
    cap([s * 0.12, 0.3, -0.05], [s * 0.12, py, -0.05], 0.012, crank, CHROME);
    b.rod([s * 0.12, py, -0.05], [s * 0.18, py, -0.05], 0.006, { color: CHROME, bone: crank });
    b.part(new THREE.BoxGeometry(0.09, 0.02, 0.1), BLACK, { at: [s * 0.18, py, -0.05], bone: crank });
  }

  // ---------- chain guard ----------
  b.extrude(
    [
      [-0.62, 0.35], [-0.58, 0.4], [-0.3, 0.375], [-0.08, 0.42], [0.03, 0.39],
      [0.07, 0.3], [0.03, 0.21], [-0.08, 0.185], [-0.3, 0.3], [-0.58, 0.3],
    ],
    { at: [-0.09, 0, 0], thickness: 0.045, bevel: 0.008, smoothing: 1, color: MINT, bone: frm },
  );

  // ---------- mudguards ----------
  const rearFender = arc([0, 0.35, -0.55], [0, 0.35 + 0.375 * Math.cos(1.22), -0.55 + 0.375 * Math.sin(1.22)], [1, 0, 0], -170);
  b.sweep(rearFender, () => [0.042, 0.004], { section: "box", color: CHROME, bone: frm, caps: "flat" });
  const frontFender = arc([0, 0.35, 0.55], [0, 0.35 + 0.375 * Math.cos(-0.7), 0.55 + 0.375 * Math.sin(-0.7)], [1, 0, 0], 145);
  b.sweep(frontFender, () => [0.042, 0.004], { section: "box", color: CHROME, bone: steer, caps: "flat" });
  b.rod([0, 0.8, 0.4], [0, 0.6, 0.27], 0.005, { color: CHROME, bone: steer, sides: 5 });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), RED, { at: [0, 0.32, -0.93], scale: [1.4, 1, 0.8], bone: frm });

  // rear rack
  b.part(new THREE.BoxGeometry(0.15, 0.012, 0.3), BLACK, { at: [0, 0.785, -0.68], bone: frm });

  // ---------- saddle ----------
  cap([0, 0.94, -0.27], [0, 1.0, -0.3], 0.014, frm, CHROME);
  b.rod([-0.065, 1.005, -0.36], [0.065, 1.005, -0.36], 0.007, { color: CHROME, bone: frm });
  b.rod([0, 1.0, -0.3], [0, 1.005, -0.36], 0.007, { color: CHROME, bone: frm });
  for (const s of [1, -1]) {
    const coil = spiral([s * 0.06, 1.012, -0.36], [s * 0.06 + 0.03, 1.012, -0.36], [0, 1, 0], { turns: 5, pitch: 0.0165 });
    b.sweep(coil, 0.0035, { color: CHROME, bone: frm, sides: 4 });
  }
  b.loft(
    [
      { at: [0, 1.13, -0.42], w: 0.2, h: 0.05 },
      { at: [0, 1.135, -0.31], w: 0.21, h: 0.06 },
      { at: [0, 1.13, -0.19], w: 0.11, h: 0.045 },
      { at: [0, 1.125, -0.08], w: 0.04, h: 0.035 },
    ],
    { color: BROWN, bone: frm },
  );
  b.rod([0.0, 1.08, -0.12], [0.0, 1.1, -0.2], 0.006, { color: CHROME, bone: frm });

  // ---------- handlebars ----------
  const bar = catmull([
    [-0.34, 1.07, 0.12], [-0.31, 1.12, 0.26], [-0.22, 1.16, 0.37], [0, 1.17, 0.4],
    [0.22, 1.16, 0.37], [0.31, 1.12, 0.26], [0.34, 1.07, 0.12],
  ]);
  b.sweep(bar, 0.011, { color: CHROME, bone: steer, sides: 8 });
  b.sweep(bar.slice(0, 0.2), 0.0172, { color: CREAM, bone: steer, sides: 8 });
  b.sweep(bar.slice(0.8, 1), 0.0172, { color: CREAM, bone: steer, sides: 8 });
  cap(headUp, [0, 1.16, 0.4], 0.014, steer, CHROME);
  for (const s of [1, -1]) cap([s * 0.3, 1.105, 0.22], [s * 0.32, 1.04, 0.1], 0.005, steer, BLACK);
  // bell
  b.part(new THREE.SphereGeometry(0.036, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), CHROME, { at: [0.14, 1.195, 0.395], bone: steer });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.008, 10), CHROME, { at: [0.14, 1.19, 0.395], bone: steer });
  b.part(new THREE.SphereGeometry(0.007, 6, 4), CHROME, { at: [0.14, 1.233, 0.395], bone: steer });
  // lamp
  cap([-0.12, 1.17, 0.39], [-0.12, 1.205, 0.41], 0.005, steer, CHROME);
  b.part(new THREE.CylinderGeometry(0.03, 0.025, 0.06, 10), CHROME, { at: [-0.12, 1.23, 0.42], dir: [0, 0, 1], bone: steer });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 10), CREAM, { at: [-0.12, 1.23, 0.452], dir: [0, 0, 1], bone: steer });

  // ---------- basket ----------
  const wick = paint((_p, _n, s) =>
    (Math.floor(s[0] / 0.025) + Math.floor((((s[1] % 360) + 360) % 360) / 18)) % 2 ? WICKER : WICKERDK,
  );
  b.lathe(
    [[0, 0], [0.15, 0], [0.2, 0.24], [0.185, 0.24], [0.14, 0.03], [0, 0.03]],
    { at: [0, 0.78, 0.62], axis: [0, 1, 0], segments: 14, color: wick, bone: steer },
  );
  b.part(new THREE.TorusGeometry(0.1925, 0.012, 5, 14), WICKERDK, { at: [0, 1.02, 0.62], dir: [0, 1, 0], axis: "z", bone: steer });
  b.rod([0, 0.96, 0.44], [0, 0.9, 0.5], 0.006, { color: CHROME, bone: steer, sides: 5 });
  for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.025, 0.005, 5, 8), BROWN, { at: [s * 0.2, 0.95, 0.62], dir: [1, 0, 0], axis: "z", bone: steer });

  // sunflowers
  const flowers: [number[], number[]][] = [
    [[0.07, 1.14, 0.7], [0.4, 0.7, 0.6]],
    [[-0.08, 1.18, 0.64], [-0.3, 0.8, 0.4]],
    [[0.0, 1.12, 0.79], [0, 0.5, 0.9]],
    [[-0.17, 1.09, 0.68], [-0.7, 0.5, 0.5]],
  ];
  for (const [h, d] of flowers) {
    const L = Math.hypot(d[0], d[1], d[2]);
    const n = d.map((v) => v / L);
    b.rod([h[0] * 0.3, 0.88, 0.62], [h[0] - n[0] * 0.01, h[1] - n[1] * 0.01, h[2] - n[2] * 0.01], 0.005, { color: GREEN, bone: steer, sides: 4 });
    b.part(new THREE.CylinderGeometry(0.04, 0.03, 0.01, 10), GREEN, { at: [h[0] - n[0] * 0.012, h[1] - n[1] * 0.012, h[2] - n[2] * 0.012], dir: d, bone: steer });
    const disc = b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.018, 10), SEED, { at: h, dir: d, bone: steer });
    b.ring(disc, { count: 14, radius: 0.03 }, (it) => b.spike(it, it, 0.05, 0.012, { color: YELLOW, sides: 5 }));
    b.ring(disc, { count: 14, radius: 0.02, tilt: 30 }, (it) => b.spike(it, it, 0.04, 0.011, { color: GOLD, sides: 5 }));
  }
  for (let i = 0; i < 7; i++) {
    const th = (i / 7) * Math.PI * 2 + 0.3;
    b.part(new THREE.SphereGeometry(1, 6, 4), GREEN, {
      at: [Math.sin(th) * 0.16, 1.05, 0.62 + Math.cos(th) * 0.16],
      dir: [Math.sin(th) * 0.6, 0.7, Math.cos(th) * 0.6],
      axis: "z",
      scale: [0.03, 0.004, 0.07],
      bone: steer,
    });
  }

  // baguette
  const loaf = b.sweep([[0.04, 0.84, 0.56], [0.2, 1.24, 0.82]], [0.03, 0.026], { color: BREAD, bone: steer, sides: 8, caps: "round" });
  b.along(loaf, 5, (at) => b.stick(new THREE.SphereGeometry(0.012, 6, 4), CRUMB, at, { scale: [0.8, 0.45, 2.4], embed: 0.4 }), { from: 0.45, to: 0.95 });

  return b.root;
}
