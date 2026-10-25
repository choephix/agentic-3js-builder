import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured six-wheel hauler guarding a sealed cargo pod, with turrets and neon underglow.",
};

const GUN = "#2b3038";
const ARMOR = "#434d5c";
const ARMOR_HI = "#5a6678";
const DARK = "#12151a";
const YEL = "#f2b705";
const CYAN = "#19e6ff";
const MAG = "#ff2bd6";
const RED = "#ff3355";
const POD = "#c3ccd6";
const POD_DK = "#8d99a8";
const TEAL = "#1f8f9a";
const ORANGE = "#ff7a1a";

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const rand = rng(11);

  type O = { rot?: [number, number, number]; g?: number; flat?: boolean };
  const place = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], o: O = {}) => {
    const p = b.part(geo, color, { at, rotation: o.rot, flat: o.flat ?? true });
    if (o.g) glow(p, o.g);
    return p;
  };
  const box = (s: [number, number, number], color: string, at: [number, number, number], o: O = {}) =>
    place(new THREE.BoxGeometry(s[0], s[1], s[2]), color, at, o);
  // cylinder with axis along Z / X / Y
  const cyl = (r0: number, r1: number, len: number, seg: number, color: string, at: [number, number, number], axis: "x" | "y" | "z", o: O = {}) => {
    const rot: [number, number, number] = axis === "z" ? [90, 0, 0] : axis === "x" ? [0, 0, -90] : [0, 0, 0];
    return place(new THREE.CylinderGeometry(r0, r1, len, seg), color, at, { ...o, rot });
  };

  // ---------- chassis ----------
  box([2.4, 0.55, 9.6], GUN, [0, 1.12, -0.2]);
  box([1.6, 0.3, 9.2], DARK, [0, 0.75, -0.2]);
  // frame rails and cross members
  for (const s of [1, -1]) box([0.14, 0.2, 9.4], ARMOR, [s * 0.7, 0.62, -0.2]);
  for (const z of [3.8, 1.6, -0.2, -2.2, -4.2]) box([1.6, 0.14, 0.2], ARMOR, [0, 0.66, z]);

  // ---------- wheels ----------
  const axles = [3.0, -1.2, -3.6];
  for (const z of axles) {
    cyl(0.1, 0.1, 3.2, 8, ARMOR_HI, [0, 0.75, z], "x");
    for (const s of [1, -1]) {
      const x = s * 1.5;
      cyl(0.75, 0.75, 0.62, 10, DARK, [x, 0.75, z], "x");
      cyl(0.5, 0.5, 0.66, 10, GUN, [x, 0.75, z], "x");
      cyl(0.3, 0.3, 0.1, 10, ARMOR_HI, [s * 1.82, 0.75, z], "x");
      cyl(0.12, 0.12, 0.14, 6, YEL, [s * 1.88, 0.75, z], "x");
      // lug bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.12, 5, GUN, [s * 1.85, 0.75 + Math.sin(a) * 0.22, z + Math.cos(a) * 0.22], "x");
      }
      // tread blocks
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        box([0.64, 0.14, 0.2], "#1c2026", [x, 0.75 + Math.sin(a) * 0.76, z + Math.cos(a) * 0.76], { rot: [-(a * 180) / Math.PI + 90, 0, 0] });
      }
      // fender + mudflap
      box([0.8, 0.12, 1.9], ARMOR, [x, 1.62, z]);
      box([0.8, 0.5, 0.1], DARK, [x, 1.38, z + 0.95]);
      box([0.8, 0.1, 0.12], YEL, [x, 1.62, z - 0.95]);
    }
  }

  // ---------- side skirts and fuel tanks ----------
  for (const s of [1, -1]) {
    cyl(0.33, 0.33, 1.7, 8, ARMOR, [s * 1.2, 0.95, 1.0], "z");
    cyl(0.34, 0.34, 0.12, 8, YEL, [s * 1.2, 0.95, 0.5], "z");
    cyl(0.34, 0.34, 0.12, 8, YEL, [s * 1.2, 0.95, 1.5], "z");
    box([0.12, 0.5, 2.6], ARMOR, [s * 1.26, 1.0, -2.4]);
    box([0.14, 0.5, 0.12], YEL, [s * 1.27, 1.0, -1.2 + 0.4]);
    // underglow
    glow(box([0.08, 0.06, 8.6], s > 0 ? CYAN : MAG, [s * 1.2, 0.58, -0.2]), 1.6);
  }
  glow(box([1.9, 0.06, 0.08], MAG, [0, 0.58, 4.4]), 1.5);
  glow(box([1.9, 0.06, 0.08], CYAN, [0, 0.58, -4.9]), 1.5);

  // ---------- cab ----------
  const cab = b.extrude(
    [
      [1.9, 1.4],
      [4.4, 1.4],
      [4.4, 2.3],
      [3.6, 3.2],
      [1.9, 3.2],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.05, color: ARMOR },
  );
  void cab;
  // hood plate and roof plate
  box([2.0, 0.08, 2.4], ARMOR_HI, [0, 2.34, 3.2 + 0.0], { rot: [0, 0, 0] });
  box([2.2, 0.1, 1.9], ARMOR_HI, [0, 3.24, 2.85]);
  // windscreen (sloped)
  glow(box([1.9, 1.15, 0.06], "#0e5f78", [0, 2.78, 4.03], { rot: [-41.6, 0, 0] }), 0.7);
  box([2.05, 0.1, 0.1], DARK, [0, 3.2, 3.62], { rot: [-41.6, 0, 0] });
  for (const s of [1, -1]) {
    glow(box([0.05, 0.7, 1.1], "#0e5f78", [s * 1.21, 2.65, 3.05]), 0.7);
    box([0.07, 0.08, 1.25], DARK, [s * 1.21, 3.04, 3.05]);
    box([0.07, 0.08, 1.25], DARK, [s * 1.21, 2.26, 3.05]);
    // door armour
    box([0.08, 0.7, 0.8], ARMOR_HI, [s * 1.21, 1.9, 2.4]);
    box([0.1, 0.1, 0.35], YEL, [s * 1.23, 1.9, 2.1]);
    // wing mirrors
    box([0.08, 0.04, 0.32], DARK, [s * 1.45, 2.7, 3.6]);
    box([0.1, 0.34, 0.2], GUN, [s * 1.62, 2.7, 3.7]);
    glow(box([0.04, 0.26, 0.14], CYAN, [s * 1.68, 2.7, 3.7]), 1.2);
    // headlights
    glow(box([0.5, 0.2, 0.1], "#fff6c8", [s * 0.82, 1.85, 4.43]), 2);
    box([0.6, 0.3, 0.06], DARK, [s * 0.82, 1.85, 4.4]);
    // exhaust stacks
    cyl(0.12, 0.12, 2.2, 8, "#9aa3b0", [s * 1.3, 2.8, 1.65], "y");
    cyl(0.16, 0.16, 0.1, 8, DARK, [s * 1.3, 3.9, 1.65], "y");
    cyl(0.14, 0.14, 0.08, 8, ORANGE, [s * 1.3, 2.0, 1.65], "y");
    box([0.3, 1.8, 0.1], ARMOR, [s * 1.3, 2.4, 1.78]);
  }
  // front grille + bumper
  box([2.0, 0.7, 0.1], DARK, [0, 1.75, 4.42]);
  for (let i = 0; i < 5; i++) glow(box([1.7, 0.04, 0.04], CYAN, [0, 1.55 + i * 0.13, 4.47]), 1.2);
  box([2.6, 0.6, 0.45], GUN, [0, 1.1, 4.45]);
  for (let i = 0; i < 12; i++) box([0.22, 0.6, 0.06], i % 2 ? DARK : YEL, [-1.2 + i * 0.218, 1.1, 4.7]);
  // ram wedge
  box([2.2, 0.35, 0.3], ARMOR_HI, [0, 0.82, 4.75], { rot: [18, 0, 0] });
  // headlight bar on roof
  glow(box([1.7, 0.12, 0.14], "#fff6c8", [0, 3.34, 3.45]), 1.8);
  for (const s of [1, -1]) {
    glow(box([0.35, 0.1, 0.14], s > 0 ? RED : CYAN, [s * 0.95, 3.32, 3.45]), 2);
  }
  // roof vents + antenna
  for (let i = 0; i < 3; i++) box([0.5, 0.08, 0.14], DARK, [0.55, 3.33, 2.35 - i * 0.22]);
  cyl(0.02, 0.02, 1.4, 5, GUN, [-0.85, 3.95, 2.15], "y");
  glow(place(new THREE.SphereGeometry(0.06, 6, 4), RED, [-0.85, 4.68, 2.15]), 2);
  cyl(0.015, 0.015, 0.9, 5, GUN, [-0.55, 3.7, 2.4], "y");
  box([0.35, 0.3, 0.05], GUN, [0.25, 3.45, 2.0], { rot: [0, 20, 0] }); // radar dish plate
  glow(box([0.2, 0.16, 0.06], MAG, [0.25, 3.45, 2.04], { rot: [0, 20, 0] }), 1.4);

  // ---------- turret helper ----------
  const turret = (x: number, y: number, z: number, sc: number, yaw = 0) => {
    cyl(0.4 * sc, 0.46 * sc, 0.2 * sc, 8, GUN, [x, y + 0.1 * sc, z], "y");
    box([0.7 * sc, 0.4 * sc, 0.8 * sc], ARMOR_HI, [x, y + 0.4 * sc, z], { rot: [0, yaw, 0] });
    box([0.5 * sc, 0.2 * sc, 0.5 * sc], ARMOR, [x, y + 0.7 * sc, z - 0.05 * sc]);
    glow(box([0.3 * sc, 0.08 * sc, 0.06 * sc], RED, [x, y + 0.45 * sc, z + 0.42 * sc]), 2);
    for (const s of [1, -1]) {
      cyl(0.06 * sc, 0.06 * sc, 1.0 * sc, 6, DARK, [x + s * 0.2 * sc, y + 0.38 * sc, z + 0.85 * sc], "z");
      cyl(0.09 * sc, 0.09 * sc, 0.25 * sc, 6, GUN, [x + s * 0.2 * sc, y + 0.38 * sc, z + 1.35 * sc], "z");
      glow(cyl(0.04 * sc, 0.04 * sc, 0.05, 6, ORANGE, [x + s * 0.2 * sc, y + 0.38 * sc, z + 1.5 * sc], "z"), 2);
    }
  };
  turret(0, 3.3, 2.5, 1.0);

  // ---------- cargo deck ----------
  box([2.5, 0.16, 6.9], ARMOR, [0, 1.48, -1.55]);
  for (let i = 0; i < 9; i++) box([2.3, 0.02, 0.08], DARK, [0, 1.57, 1.6 - i * 0.78]);
  for (const s of [1, -1]) {
    box([0.1, 0.5, 6.9], ARMOR_HI, [s * 1.25, 1.8, -1.55]);
    for (let i = 0; i < 6; i++) box([0.12, 0.5, 0.5], i % 2 ? DARK : YEL, [s * 1.27, 1.8, 1.4 - i * 1.1]);
    // cargo cradles
    for (const z of [0.2, -1.6, -3.4]) {
      box([0.35, 0.55, 0.9], GUN, [s * 0.95, 1.85, z], { rot: [0, 0, s * 20] });
    }
  }
  for (const z of [0.2, -1.6, -3.4]) box([1.8, 0.2, 0.9], GUN, [0, 1.65, z]);

  // ---------- sealed cargo pod ----------
  const PZ = -1.6;
  const PY = 2.55;
  cyl(1.0, 1.0, 4.6, 8, POD, [0, PY, PZ], "z");
  // dirt/wear belly strip
  box([1.1, 0.06, 4.2], POD_DK, [0, PY - 0.93, PZ]);
  cyl(0.62, 1.0, 0.5, 8, POD, [0, PY, PZ + 2.55], "z");
  cyl(1.0, 0.62, 0.5, 8, POD, [0, PY, PZ - 2.55], "z");
  // reinforcement bands
  for (let i = 0; i < 5; i++) {
    const z = PZ - 1.9 + i * 0.95;
    cyl(1.08, 1.08, 0.2, 8, i % 2 ? ARMOR : ORANGE, [0, PY, z], "z");
    glow(box([0.3, 0.05, 0.12], i % 2 ? CYAN : MAG, [0, PY + 1.08, z]), 1.5);
  }
  // top seal strip
  glow(box([0.14, 0.14, 4.0], MAG, [0, PY + 0.88, PZ]), 1.8);
  // side readout panels
  for (const s of [1, -1]) {
    glow(box([0.06, 0.55, 3.0], TEAL, [s * 0.97, PY, PZ + 0.2]), 1.2);
    box([0.08, 0.6, 0.08], DARK, [s * 0.98, PY, PZ + 0.2 - 1.5]);
    box([0.08, 0.6, 0.08], DARK, [s * 0.98, PY, PZ + 0.2 + 1.5]);
    // data bars
    for (let i = 0; i < 7; i++) {
      const h = 0.1 + rand() * 0.35;
      box([0.09, h, 0.14], i % 3 ? CYAN : YEL, [s * 0.98, PY - 0.25 + h / 2, PZ - 1.1 + i * 0.4], { g: 1.8 });
    }
    // hazard triangle plates
    box([0.08, 0.5, 0.5], YEL, [s * 0.9, PY + 0.55, PZ - 1.8], { rot: [0, 0, s * 20] });
    box([0.1, 0.2, 0.2], DARK, [s * 0.9, PY + 0.55, PZ - 1.8], { rot: [0, 0, s * 20] });
    // locking clamps
    for (const z of [PZ + 1.7, PZ - 1.7]) {
      box([0.3, 0.3, 0.3], ARMOR, [s * 1.02, PY - 0.5, z]);
      glow(box([0.1, 0.12, 0.12], RED, [s * 1.2, PY - 0.5, z]), 2);
    }
  }
  // rear hatch and front sensor
  cyl(0.5, 0.5, 0.12, 8, DARK, [0, PY, PZ - 2.85], "z");
  glow(cyl(0.33, 0.33, 0.08, 8, MAG, [0, PY, PZ - 2.9], "z"), 1.8);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 360 + 45;
    const r = (a * Math.PI) / 180;
    box([0.08, 0.08, 0.1], YEL, [Math.sin(r) * 0.42, PY + Math.cos(r) * 0.42, PZ - 2.9]);
  }
  glow(cyl(0.2, 0.2, 0.1, 8, CYAN, [0, PY, PZ + 2.85], "z"), 1.8);
  // pod identity stencil: stacked bars on the front shoulder
  for (let i = 0; i < 3; i++) box([0.8 - i * 0.2, 0.06, 0.08], DARK, [0, PY + 0.55 - i * 0.12, PZ + 2.5 + i * 0.01]);

  // ---------- rear ----------
  box([2.6, 0.5, 0.4], GUN, [0, 1.1, -5.05]);
  for (let i = 0; i < 12; i++) box([0.22, 0.5, 0.06], i % 2 ? DARK : YEL, [-1.2 + i * 0.218, 1.1, -5.28]);
  for (const s of [1, -1]) {
    glow(box([0.5, 0.2, 0.1], RED, [s * 0.9, 1.5, -5.0]), 2);
    turret(s * 1.0, 1.58, -4.6, 0.7, 180);
  }
  // mudguard rear light bar
  glow(box([1.0, 0.08, 0.06], RED, [0, 1.5, -5.02]), 1.8);

  // ---------- stray details: cables on cab roof, plates ----------
  for (const s of [1, -1]) {
    box([0.08, 1.1, 0.1], GUN, [s * 1.0, 2.5, 1.95]);
    glow(box([0.04, 0.9, 0.04], s > 0 ? CYAN : MAG, [s * 1.0, 2.5, 2.02]), 1.5);
  }
  // neon sign strip on cab front pillar
  glow(box([1.4, 0.05, 0.05], MAG, [0, 2.32, 4.43]), 1.6);

  return b.root;
}
