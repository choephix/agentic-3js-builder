import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Warden HX-77 Armored Hauler",
  description:
    "Low-poly cyberpunk 2077 militarized six-wheel truck: armored cab, roof turret, missile pods, neon underglow, ribbed cargo container.",
};

// ---------- palette ----------
const HULL = "#2b323e";
const HULL2 = "#3c4657";
const HULL3 = "#4a5568";
const PLATE = "#161a22";
const OLIVE = "#55583f";
const TRIM = "#ffb400";
const BLACK = "#0c0e13";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const RED = "#ff2d3b";
const GLASS = "#0b3042";
const RUBBER = "#101216";
const RIM = "#8a94a6";
const STEEL = "#6b7385";
const WARM = "#fff1c2";
const ORANGE = "#ff7a1a";

const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "warden_hx77" });

  // ---------- helpers ----------
  type V = [number, number, number];
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, rot: V = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (
    x: number, y: number, z: number, r: number, len: number, color: string,
    axis: "x" | "y" | "z" = "y", seg = 8, r2?: number,
  ) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, len, seg), color, {
      at: [x, y, z],
      rotation: axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0],
      flat: true,
    });
  const lamp = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, str = 1.2, rot: V = [0, 0, 0]) =>
    glow(box(x, y, z, w, h, d, color, rot), str);
  const aimCyl = (at: V, dir: V, r: number, len: number, color: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir, flat: true });
  const loc = (c: V, e: V, v: V): V => {
    const p = new THREE.Vector3(...v).applyEuler(new THREE.Euler(e[0] * DEG, e[1] * DEG, e[2] * DEG));
    return [p.x + c[0], p.y + c[1], p.z + c[2]];
  };
  const hazard = (x: number, y: number, z: number, w: number, h: number, d: number, n: number) => {
    const seg = w / n;
    for (let i = 0; i < n; i++)
      box(x - w / 2 + seg * (i + 0.5), y, z, seg, h, d, i % 2 ? BLACK : TRIM);
  };

  const PLATE_TEX = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="#0b0f18"/><rect x="2" y="2" width="96" height="36" fill="none" stroke="#ff2bd6" stroke-width="2"/><text x="50" y="29" text-anchor="middle" font-size="26" font-family="monospace" font-weight="bold" fill="#19f0ff">2077</text></svg>`,
    { size: 256 },
  );
  const LOGO_TEX = svg(
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#0b0f18" opacity="0.92"/><polygon points="30,8 54,8 66,40 54,72 30,72 18,40" fill="none" stroke="#19f0ff" stroke-width="4"/><path d="M30 56 L42 20 L54 56 M34 44 H50" stroke="#ff2bd6" stroke-width="5" fill="none"/><text x="78" y="38" font-size="24" font-family="monospace" font-weight="bold" fill="#ff2bd6">WARDEN</text><text x="78" y="62" font-size="18" font-family="monospace" fill="#19f0ff">HX-77 // ARMD</text></svg>`,
    { size: 512 },
  );

  // ---------- chassis ----------
  for (const s of [1, -1]) {
    box(s * 0.7, 0.85, -0.1, 0.22, 0.28, 8.7, PLATE);
    box(s * 0.7, 0.68, -0.1, 0.1, 0.1, 8.5, HULL3);
  }
  for (let i = 0; i < 6; i++) box(0, 0.85, -3.8 + i * 1.45, 1.4, 0.2, 0.2, HULL3); // cross members
  // underglow
  lamp(0, 0.5, -0.1, 2.3, 0.04, 8.2, MAG, 1.4);
  lamp(0, 0.5, -0.1, 0.5, 0.045, 8.0, CYAN, 1.2);
  // driveshaft
  cyl(0, 0.78, -1.2, 0.07, 6, STEEL, "z", 6);
  // diffs
  for (const z of [2.9, -1.4, -3.1]) {
    cyl(0, 0.65, z, 0.1, 2.7, PLATE, "x", 8);
    b.part(new THREE.SphereGeometry(0.28, 8, 6), HULL3, { at: [0, 0.65, z], flat: true });
  }

  // ---------- wheels ----------
  const wheel = (s: number, z: number) => {
    const cy = 0.65;
    cyl(s * 1.3, cy, z, 0.65, 0.55, RUBBER, "x", 12);
    for (let i = 0; i < 8; i++) {
      const a = i * 45;
      const ar = a * DEG;
      box(s * 1.3, cy + 0.68 * Math.cos(ar), z + 0.68 * Math.sin(ar), 0.5, 0.1, 0.2, BLACK, [a, 0, 0]);
    }
    cyl(s * 1.3, cy, z, 0.4, 0.58, RIM, "x", 10);
    cyl(s * 1.3, cy, z, 0.2, 0.64, PLATE, "x", 8);
    const out = s * 1.62;
    glow(
      b.part(new THREE.TorusGeometry(0.46, 0.028, 4, 14), CYAN, { at: [out - s * 0.02, cy, z], rotation: [0, 90, 0] }),
      1.3,
    );
    for (let i = 0; i < 6; i++) {
      const ar = i * 60 * DEG;
      cyl(out, cy + 0.29 * Math.cos(ar), z + 0.29 * Math.sin(ar), 0.032, 0.06, STEEL, "x", 5);
    }
    cyl(out + s * 0.02, cy, z, 0.08, 0.06, TRIM, "x", 6);
  };
  const axles = [2.9, -1.4, -3.1];
  for (const s of [1, -1]) for (const z of axles) wheel(s, z);

  // fenders / arches
  for (const s of [1, -1]) {
    for (const z of axles) {
      box(s * 1.45, 1.38, z, 0.22, 0.12, 1.55, HULL2);
      box(s * 1.55, 1.3, z + 0.82, 0.2, 0.3, 0.14, HULL3, [0, 0, 0]);
      box(s * 1.55, 1.3, z - 0.82, 0.2, 0.3, 0.14, HULL3);
      lamp(s * 1.57, 1.46, z, 0.04, 0.04, 1.4, ORANGE, 1.1);
      // mud flap
      box(s * 1.35, 0.35, z - 0.78, 0.7, 0.45, 0.04, BLACK);
    }
  }

  // ---------- hood & front hull ----------
  box(0, 1.45, 2.7, 2.8, 0.9, 3.0, HULL);
  box(0, 1.95, 3.5, 2.5, 0.12, 1.4, HULL2); // hood plate
  box(0, 2.03, 3.5, 0.5, 0.06, 1.3, HULL3); // centre ridge
  // chamfers
  for (const s of [1, -1]) {
    box(s * 1.35, 1.88, 2.9, 0.18, 0.12, 2.6, HULL3, [0, 0, s * 25]);
    box(s * 1.2, 1.5, 4.18, 0.5, 0.9, 0.12, HULL2, [0, s * 20, 0]);
    // hood vents
    for (let i = 0; i < 4; i++) box(s * 0.95, 2.03, 3.1 + i * 0.28, 0.5, 0.04, 0.1, BLACK);
    lamp(s * 0.95, 2.02, 3.55, 0.45, 0.02, 0.02, ORANGE, 0.8, [0, 0, 0]);
  }
  // sloped nose plate
  box(0, 1.35, 4.22, 2.5, 0.8, 0.14, HULL2);
  // grille
  box(0, 1.3, 4.3, 1.1, 0.6, 0.06, BLACK);
  for (let i = -4; i <= 4; i++) box(i * 0.11, 1.3, 4.34, 0.04, 0.54, 0.04, HULL3);
  lamp(0, 1.65, 4.32, 1.1, 0.04, 0.04, MAG, 1.4);
  // headlights
  for (const s of [1, -1]) {
    box(s * 0.98, 1.58, 4.29, 0.72, 0.28, 0.1, PLATE);
    lamp(s * 0.98, 1.58, 4.35, 0.62, 0.1, 0.04, WARM, 1.5);
    lamp(s * 0.98, 1.46, 4.35, 0.62, 0.035, 0.04, CYAN, 1.3);
    // fog / aux lamp pods
    cyl(s * 1.1, 1.0, 4.45, 0.09, 0.1, WARM, "z", 8);
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 8), WARM, { at: [s * 1.1, 1.0, 4.51], rotation: [90, 0, 0] }), 1.5);
  }
  // ram bumper
  box(0, 0.8, 4.4, 3.0, 0.5, 0.5, PLATE);
  box(0, 0.8, 4.66, 2.8, 0.3, 0.1, HULL3);
  hazard(0, 1.06, 4.5, 2.8, 0.06, 0.3, 14);
  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.ConeGeometry(0.1, 0.4, 4), STEEL, { at: [i * 0.4, 0.8, 4.92], rotation: [90, 0, 0], flat: true });
  }
  // winch
  cyl(0, 0.62, 4.5, 0.12, 0.9, TRIM, "x", 8);
  // tow hooks
  for (const s of [1, -1]) box(s * 1.15, 0.55, 4.55, 0.1, 0.12, 0.25, ORANGE);

  // ---------- cab ----------
  box(0, 2.4, 1.775, 2.8, 1.0, 1.15, HULL);
  box(0, 2.95, 1.7, 3.0, 0.1, 1.5, PLATE); // roof plate
  box(0, 3.02, 1.75, 2.2, 0.05, 1.0, HULL3);
  // windshield
  box(0, 2.4, 2.58, 2.5, 0.06, 1.1, GLASS, [-29, 0, 0]);
  glow(box(0, 2.39, 2.6, 2.3, 0.02, 0.96, "#12586f", [-29, 0, 0]), 0.5);
  for (const s of [-1, 0, 1]) box(s * 0.9, 2.42, 2.57, 0.06, 0.08, 1.14, PLATE, [-29, 0, 0]);
  // visor brow
  box(0, 2.95, 2.4, 2.9, 0.1, 0.3, PLATE, [-10, 0, 0]);
  lamp(0, 2.9, 2.55, 2.6, 0.03, 0.03, CYAN, 1.3);
  // cab sides
  for (const s of [1, -1]) {
    box(s * 1.41, 2.45, 1.85, 0.04, 0.45, 0.9, GLASS);
    glow(box(s * 1.43, 2.45, 1.85, 0.01, 0.4, 0.84, "#12586f"), 0.4);
    box(s * 1.43, 2.45, 1.85, 0.02, 0.05, 0.9, PLATE);
    box(s * 1.42, 2.2, 1.85, 0.04, 0.08, 1.0, HULL3); // door seam
    // door seam vertical
    box(s * 1.42, 2.0, 2.28, 0.03, 1.6, 0.04, BLACK);
    box(s * 1.42, 2.0, 1.2, 0.03, 1.6, 0.04, BLACK);
    // handle
    box(s * 1.45, 2.0, 1.55, 0.05, 0.05, 0.25, STEEL);
    // armor skirt plates
    box(s * 1.43, 1.6, 1.85, 0.06, 0.4, 1.1, HULL2);
    hazard(s * 1.47, 1.35, 1.85, 0.0 + 1.0, 0.05, 0.05, 6);
    // step
    box(s * 1.5, 1.1, 1.95, 0.3, 0.06, 0.6, PLATE);
    // mirrors
    box(s * 1.55, 2.6, 2.4, 0.3, 0.04, 0.04, STEEL);
    box(s * 1.7, 2.55, 2.35, 0.1, 0.34, 0.2, PLATE);
    lamp(s * 1.76, 2.55, 2.35, 0.02, 0.28, 0.14, CYAN, 1.0);
    // side neon
    lamp(s * 1.43, 1.85, 2.4, 0.03, 0.03, 1.9, MAG, 1.3);
    // exhaust stacks
    cyl(s * 1.2, 2.5, 0.98, 0.1, 2.5, STEEL, "y", 8);
    cyl(s * 1.2, 3.8, 0.98, 0.13, 0.12, PLATE, "y", 8);
    cyl(s * 1.2, 2.05, 0.98, 0.14, 0.12, TRIM, "y", 8);
    cyl(s * 1.2, 2.9, 0.98, 0.14, 0.12, TRIM, "y", 8);
    glow(b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), ORANGE, { at: [s * 1.2, 3.86, 0.98] }), 1.4);
    box(s * 1.2, 1.5, 1.08, 0.18, 1.2, 0.08, PLATE); // stack bracket
  }
  // cab rear wall & back panel
  box(0, 2.4, 1.15, 2.7, 0.9, 0.06, PLATE);
  // roof lightbar
  box(0, 3.1, 2.3, 2.0, 0.1, 0.18, PLATE);
  for (let i = 0; i < 8; i++) lamp(-0.85 + i * 0.24, 3.17, 2.3, 0.18, 0.07, 0.14, i % 2 ? MAG : CYAN, 1.5);

  // ---------- roof turret ----------
  cyl(0, 3.12, 1.4, 0.5, 0.1, PLATE, "y", 10);
  cyl(0, 3.2, 1.4, 0.4, 0.08, HULL3, "y", 10);
  box(0, 3.45, 1.4, 0.8, 0.4, 0.9, HULL2);
  box(0, 3.45, 1.9, 0.9, 0.3, 0.3, HULL);
  box(0, 3.66, 1.35, 0.5, 0.1, 0.6, PLATE, [0, 0, 0]);
  for (const s of [1, -1]) {
    aimCyl([s * 0.2, 3.45, 2.7], [0, 0, 1], 0.055, 1.6, PLATE);
    aimCyl([s * 0.2, 3.45, 3.5], [0, 0, 1], 0.08, 0.2, STEEL);
    aimCyl([s * 0.2, 3.45, 2.3], [0, 0, 1], 0.1, 0.5, HULL3);
    box(s * 0.5, 3.4, 1.4, 0.2, 0.3, 0.6, OLIVE); // ammo can
    lamp(s * 0.62, 3.4, 1.4, 0.02, 0.06, 0.4, ORANGE, 1.0);
  }
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), RED, { at: [0, 3.5, 2.37] }), 1.8);
  box(0, 3.45, 2.33, 0.34, 0.16, 0.06, BLACK);

  // ---------- cargo container ----------
  box(0, 2.2, -1.8, 2.9, 2.0, 5.4, HULL);
  box(0, 3.25, -1.8, 3.0, 0.1, 5.5, PLATE); // top rim
  box(0, 1.15, -1.8, 3.0, 0.1, 5.5, PLATE); // bottom rim
  for (const s of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const z = 0.6 - i * 0.62;
      box(s * 1.48, 2.2, z, 0.08, 1.8, 0.14, HULL2);
    }
    box(s * 1.49, 2.2, -1.8, 0.04, 0.12, 5.2, PLATE);
    lamp(s * 1.5, 2.95, -1.8, 0.03, 0.04, 5.0, CYAN, 1.3);
    lamp(s * 1.5, 1.45, -1.8, 0.03, 0.04, 5.0, MAG, 1.3);
    // side logo
    glow(
      b.part(new THREE.PlaneGeometry(2.0, 0.8), "#ffffff", {
        at: [s * 1.51, 2.2, -1.2], dir: [s, 0, 0], axis: "z", texture: LOGO_TEX,
      }),
      1.0,
    );
    // armor plate lowers with hazard
    hazard(s * 1.5, 1.3, -1.8, 0.0 + 0.01, 0.01, 0.01, 1);
    for (let i = 0; i < 6; i++) box(s * 1.51, 1.3, 0.2 - i * 0.9, 0.04, 0.14, 0.45, i % 2 ? BLACK : TRIM, [0, 0, 0]);
    // side access hatch
    box(s * 1.49, 2.0, -3.6, 0.04, 1.0, 0.8, PLATE);
    box(s * 1.51, 2.0, -3.6, 0.03, 0.9, 0.7, HULL3);
    box(s * 1.54, 2.0, -3.4, 0.05, 0.08, 0.2, STEEL);
    // fuel tanks
    cyl(s * 1.2, 0.85, 0.7, 0.3, 2.0, OLIVE, "z", 8);
    for (const dz of [-0.7, 0.7]) box(s * 1.2, 0.85, 0.7 + dz, 0.64, 0.64, 0.08, STEEL);
    lamp(s * 1.2, 1.17, 0.7, 0.1, 0.03, 1.4, ORANGE, 1.0);
    // battery/power cells
    for (let i = 0; i < 3; i++) {
      box(s * 1.2, 0.8, -2.15 + i * 0.28 + 0.0, 0.5, 0.5, 0.22, PLATE);
      lamp(s * 1.2, 0.8, -2.15 + i * 0.28, 0.54, 0.1, 0.1, CYAN, 1.2);
    }
  }
  // front face of container
  box(0, 2.2, 0.92, 2.8, 1.8, 0.1, PLATE);
  for (let i = 0; i < 5; i++) lamp(-1.0 + i * 0.5, 3.0, 0.98, 0.3, 0.04, 0.03, i % 2 ? MAG : CYAN, 1.1);
  // roof ribs and hardware
  for (let i = 0; i < 7; i++) box(0, 3.35, 0.5 - i * 0.75, 2.8, 0.06, 0.14, HULL2);
  // top hatches
  box(-0.7, 3.4, -2.8, 0.9, 0.08, 0.9, PLATE);
  box(-0.7, 3.46, -2.8, 0.7, 0.05, 0.7, HULL3);
  lamp(-0.7, 3.5, -2.8, 0.3, 0.02, 0.3, RED, 1.4);

  // cooling fans on roof
  for (const z of [-4.0, -3.1]) {
    cyl(0.75, 3.38, z, 0.38, 0.1, PLATE, "y", 10);
    for (let k = 0; k < 4; k++) box(0.75, 3.45, z, 0.7, 0.02, 0.1, STEEL, [0, k * 45, 0]);
    glow(b.part(new THREE.TorusGeometry(0.36, 0.02, 4, 12), CYAN, { at: [0.75, 3.44, z], rotation: [90, 0, 0] }), 1.2);
  }

  // missile pods (tilted up)
  for (const s of [1, -1]) {
    const c: V = [s * 0.95, 3.7, -0.5];
    const e: V = [-22, 0, 0];
    b.part(new THREE.BoxGeometry(1.0, 0.7, 1.7), PLATE, { at: c, rotation: e });
    b.part(new THREE.BoxGeometry(1.05, 0.12, 1.75), HULL3, { at: loc(c, e, [0, 0.4, 0]), rotation: e });
    box(s * 0.95, 3.4, -0.5, 0.3, 0.3, 0.5, HULL3);
    const dir: V = [0, Math.sin(22 * DEG), Math.cos(22 * DEG)];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++) {
        const p = loc(c, e, [-0.3 + i * 0.3, -0.17 + j * 0.34, 0.86]);
        aimCyl(p, dir, 0.11, 0.06, BLACK, 8);
        const q = loc(c, e, [-0.3 + i * 0.3, -0.17 + j * 0.34, 0.88]);
        aimCyl(q, dir, 0.07, 0.05, (i + j) % 2 ? RED : ORANGE, 6);
      }
    lamp(s * 0.95, 3.83, -0.6, 0.06, 0.03, 1.2, MAG, 1.2, e);
  }

  // radar dish & antennas
  cyl(0, 3.55, -0.6, 0.05, 0.4, STEEL, "y", 6);
  b.part(new THREE.ConeGeometry(0.4, 0.2, 10), HULL3, { at: [0, 3.82, -0.5], rotation: [-100, 0, 0], flat: true });
  cyl(0, 3.9, -0.42, 0.03, 0.3, STEEL, "z", 5);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0, 3.9, -0.27] }), 1.8);
  for (const s of [1, -1]) {
    cyl(s * 1.3, 4.0, -4.2, 0.02, 1.6, STEEL, "y", 5);
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), s > 0 ? MAG : CYAN, { at: [s * 1.3, 4.82, -4.2] }), 2);
    box(s * 1.3, 3.3, -4.2, 0.16, 0.14, 0.16, PLATE);
  }
  cyl(-1.3, 3.8, 0.6, 0.015, 1.2, STEEL, "y", 4);

  // ---------- rear ----------
  box(0, 2.2, -4.53, 2.8, 1.8, 0.08, PLATE);
  box(0, 2.2, -4.6, 0.06, 1.8, 0.04, BLACK); // door seam
  for (const s of [1, -1]) {
    box(s * 0.7, 2.3, -4.6, 1.2, 1.4, 0.04, HULL2);
    box(s * 0.12, 2.2, -4.64, 0.05, 0.4, 0.05, STEEL); // handle
    lamp(s * 1.2, 1.5, -4.6, 0.3, 0.2, 0.05, RED, 1.6);
    lamp(s * 1.2, 2.9, -4.6, 0.3, 0.06, 0.05, RED, 1.4);
    // hinges
    for (const y of [1.6, 2.8]) box(s * 1.38, y, -4.58, 0.08, 0.16, 0.1, STEEL);
  }
  hazard(0, 1.25, -4.62, 2.8, 0.2, 0.04, 14);
  box(0, 0.75, -4.55, 3.0, 0.4, 0.3, PLATE); // rear bumper
  hazard(0, 0.98, -4.6, 2.8, 0.05, 0.12, 12);
  glow(b.part(new THREE.PlaneGeometry(0.9, 0.36), "#ffffff", { at: [0, 1.0, -4.72], dir: [0, 0, -1], axis: "z", texture: PLATE_TEX }), 1.0);
  lamp(0, 2.9, -4.6, 0.5, 0.05, 0.05, MAG, 1.3);
  // tow pin & rear light bar
  cyl(0, 0.75, -4.8, 0.06, 0.2, STEEL, "z", 6);
  // rear mud guards & exhaust cutout
  for (const s of [1, -1]) {
    box(s * 1.35, 0.45, -3.9, 0.7, 0.45, 0.04, BLACK);
  }

  // ---------- final detail: cab hardware ----------
  // roof sensors
  for (const s of [1, -1]) {
    box(s * 1.2, 3.1, 1.2, 0.3, 0.12, 0.3, HULL3);
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [s * 1.2, 3.2, 1.2] }), 1.6);
    cyl(s * 1.35, 3.3, 1.9, 0.02, 0.5, STEEL, "y", 4);
  }
  // headlamp visor lines & front emblem
  lamp(0, 1.05, 4.35, 2.4, 0.03, 0.03, CYAN, 1.2);
  box(0, 1.42, 4.38, 0.34, 0.34, 0.03, PLATE, [0, 0, 45]);
  lamp(0, 1.42, 4.41, 0.18, 0.18, 0.02, ORANGE, 1.3, [0, 0, 45]);

  return b.root;
}
