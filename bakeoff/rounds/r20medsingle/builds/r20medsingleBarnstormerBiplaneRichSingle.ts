// Barnstormer biplane, whimsical: a chubby red-and-yellow open-cockpit biplane with a moustached pilot, a goggled
// dog passenger, a streaming scarf, a hanging lucky duck and a little bird perched on the wing.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby whimsical open-cockpit biplane with a moustached pilot, a goggled dog passenger, a streaming scarf, spinning prop, wheels and hinged control surfaces.",
  style: "whimsical",
  commit: "88fc1f0",
};

const RED = "#e5432d";
const CREAM = "#fff0cc";
const YELLOW = "#ffc93c";
const TEAL = "#2bb5ab";
const WOOD = "#c98a4b";
const STEEL = "#a8b4c6";
const DARKM = "#4a4160";
const LEATHER = "#8a512d";
const BRASS = "#e8b64c";
const GLASS = "#bfeaf4";
const SKIN = "#f2b48a";
const TIRE = "#3a3047";
const AMBER = "#ff9d2e";
const PINK = "#ff8fa8";
const FUR = "#e0a25e";
const FUR_D = "#b9783c";
const PANEL = "#b5281b";
const STITCH = "#e0a42a";
const WALK = "#6a5a78";

type Opts = { rotation?: number[]; scale?: number | number[]; dir?: number[] };

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });

  // ---------------------------------------------------------------- skeleton
  const hull = b.joint("hull", { at: [0, 1.5, 0] });
  type J = typeof hull;
  const prop = b.joint("propeller", { parent: hull, at: [0, 1.5, 2.32], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: hull, at: [0, 1.45, -2.65], dir: [0, 1, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: hull, at: [0, 0.17, -2.65], dir: [1, 0, 0], role: "hinge" });
  const pilotHead = b.joint("pilotHead", { parent: hull, at: [0, 2.12, -0.5], dir: [0, 0, 1], role: "head" });
  const dogHead = b.joint("dogHead", { parent: hull, at: [0, 2.1, 0.6], dir: [0, 0, 1], role: "head" });
  const charm = b.joint("charm", { parent: hull, at: [0.45, 2.57, 0.9], dir: [0, -1, 0] });

  const put = (geo: THREE.BufferGeometry, color: string | Paint, at: number[], bone: J, o: Opts = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const ball = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  // ---------------------------------------------------------------- paints
  const RED_C = cel(RED);
  const TEAL_C = cel(TEAL);
  const CREAM_C = cel(CREAM);
  const YELLOW_C = cel(YELLOW);

  const hullPaint = cel(
    paint((p, n) => {
      const z = p.z;
      if (n.y < -0.4 && z > -2.5 && z < 1.4) return CREAM;
      if (z > 0.98 && z < 1.12) return TEAL;
      if (z < -2.3 && z > -2.55) return TEAL;
      const q = (((z / 0.75) % 1) + 1) % 1;
      if (q < 0.018 || q > 0.982) return PANEL;
      if (Math.abs(n.y) < 0.3 && Math.abs(p.y - 1.62) < 0.012) return PANEL;
      return RED;
    }),
  );

  const wingPaint = cel(
    paint((p, n) => {
      const ax = Math.abs(p.x);
      if (ax > 3.78) return RED;
      if (Math.abs(n.y) > 0.6) {
        const cz = p.y > 2 ? 0.8 : 0.6;
        const d = Math.hypot(ax - 2.45, p.z - cz);
        if (d < 0.13) return RED;
        if (d < 0.24) return CREAM;
        if (d < 0.34) return TEAL;
        if (p.y < 2 && n.y > 0 && ax > 0.5 && ax < 1.3 && p.z > -0.1 && p.z < 0.55) return WALK;
        if (p.y > 2 && n.y > 0 && ax > 1.2 && ax < 1.65 && p.z > 0.55 && p.z < 0.95) {
          const edge = Math.min(ax - 1.2, 1.65 - ax, p.z - 0.55, 0.95 - p.z);
          return edge < 0.025 ? STITCH : TEAL;
        }
      }
      const q = (ax / 0.55) % 1;
      if (q < 0.03) return STITCH;
      return YELLOW;
    }),
  );

  const aileronPaint = cel(paint((p) => (Math.floor(Math.abs(p.x) / 0.35) % 2 === 0 ? RED : CREAM)));
  const rudderPaint = cel(
    paint((p) => {
      const m = (((Math.floor(p.y / 0.22) % 3) + 3) % 3) as number;
      return m === 0 ? RED : m === 1 ? CREAM : TEAL;
    }),
  );
  const bladePaint = cel(paint((_p, _n, s) => (s[1] > 0.85 ? YELLOW : s[1] > 0.78 ? RED : WOOD)));
  const scarfPaint = paint((p) => (((Math.floor(p.z / 0.16) % 2) + 2) % 2 === 0 ? RED : CREAM));

  // ---------------------------------------------------------------- fuselage
  const body = b.loft(
    [
      { at: [0, 1.6, -3.1], w: 0.08, h: 0.12 },
      { at: [0, 1.57, -2.3], w: 0.22, h: 0.38 },
      { at: [0, 1.52, -1.2], w: 0.6, h: 0.75 },
      { at: [0, 1.5, 0.0], w: 0.85, h: 0.95 },
      { at: [0, 1.5, 1.0], w: 0.95, h: 1.0 },
      { at: [0, 1.5, 1.8], w: 1.0, h: 1.02 },
    ],
    { color: hullPaint, bone: hull, sides: 12 },
  );
  const skin = b.surface(body);
  const topY = (z: number) => skin.ray([0, 4, z], [0, -1, 0])?.at.y ?? 1.98;

  // rivets along panel lines
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let k = -3; k <= 1; k++)
      for (const dz of [-0.05, 0.05])
        for (let y = 1.15; y <= 1.9; y += 0.15) {
          const h = skin.ray([s * 2, y, k * 0.75 + dz], [-s, 0, 0]);
          if (h) rivets.push(new THREE.SphereGeometry(0.014, 5, 3).translate(h.at.x, h.at.y, h.at.z));
        }
  const rivetGeo = mergeGeometries(rivets);
  if (rivetGeo) b.part(rivetGeo, BRASS, { bone: hull, at: [0, 0, 0] });

  // decals
  const numberTex = svg(
    `<svg viewBox="0 0 100 80"><rect x="3" y="3" width="94" height="74" rx="22" fill="${CREAM}" stroke="${INK}" stroke-width="5"/><text x="50" y="62" font-size="66" font-weight="800" text-anchor="middle" fill="${RED}" font-family="Arial, sans-serif">7</text></svg>`,
    { size: 256 },
  );
  const sunTex = svg(
    `<svg viewBox="0 0 100 100"><g stroke="${INK}" stroke-width="4" stroke-linejoin="round" fill="${AMBER}">
      <polygon points="50,2 58,22 42,22"/><polygon points="50,98 58,78 42,78"/><polygon points="2,50 22,42 22,58"/><polygon points="98,50 78,42 78,58"/>
      <polygon points="16,16 34,24 24,34"/><polygon points="84,16 66,24 76,34"/><polygon points="16,84 34,76 24,66"/><polygon points="84,84 66,76 76,66"/></g>
      <circle cx="50" cy="50" r="28" fill="${YELLOW}" stroke="${INK}" stroke-width="4"/>
      <circle cx="40" cy="45" r="4" fill="${INK}"/><circle cx="60" cy="45" r="4" fill="${INK}"/>
      <path d="M36 57 Q50 72 64 57" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="33" cy="56" rx="5" ry="3" fill="${PINK}"/><ellipse cx="67" cy="56" rx="5" ry="3" fill="${PINK}"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.decal(body, numberTex, { at: [s * 0.25, 1.62, -1.55], dir: [s, 0, 0], size: [0.62, 0.48] });
    b.decal(body, sunTex, { at: [s * 0.45, 1.55, 0.3], dir: [s, 0, 0], size: [0.46, 0.46] });
  }

  // headrest hump and fuel cap
  put(ball(0.26, 10, 6), RED_C, [0, topY(-0.95) + 0.02, -0.95], hull, { scale: [0.75, 0.8, 1.9] });
  put(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8), BRASS, [0, topY(1.3) + 0.01, 1.3], hull);

  // ---------------------------------------------------------------- engine
  const cowlOutline: OutlinePoint[] = [
    [0, 0],
    [0.54, 0],
    [0.57, 0.1],
    [0.57, 0.45],
    [0.52, 0.62],
    [0.3, 0.66],
    [0, 0.66],
  ];
  const cowlPaint = cel(
    paint((p) => {
      if (p.z > 1.62 && p.z < 1.7) return CREAM;
      if (p.z > 2.0 && p.z < 2.05) return CREAM;
      return TEAL;
    }),
  );
  b.lathe(cowlOutline, { at: [0, 1.5, 1.5], axis: [0, 0, 1], bone: hull, color: cowlPaint, segments: 14 });
  const rimOutline: OutlinePoint[] = [
    [0.55, 0.28],
    [0.61, 0.28],
    [0.61, 0.36],
    [0.55, 0.36],
  ];
  b.lathe(rimOutline, { at: [0, 1.5, 1.5], axis: [0, 0, 1], bone: hull, color: BRASS, segments: 14 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    put(new THREE.CylinderGeometry(0.075, 0.09, 0.14, 6), STEEL, [Math.sin(a) * 0.38, 1.5 + Math.cos(a) * 0.38, 2.2], hull, {
      rotation: [90, 0, 0],
    });
    put(ball(0.05, 6, 4), DARKM, [Math.sin(a) * 0.38, 1.5 + Math.cos(a) * 0.38, 2.27], hull);
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.52, 1.38, 1.7],
        [s * 0.68, 1.3, 1.5],
        [s * 0.7, 1.28, 1.25],
      ]),
      [0.06, 0.04],
      { color: DARKM, bone: hull, sides: 6 },
    );
    put(new THREE.CylinderGeometry(0.035, 0.065, 0.1, 6), STEEL, [s * 0.7, 1.28, 1.22], hull, { rotation: [90, 0, 0] });
  }

  // propeller
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.1],
      [0.12, 0.3],
      [0, 0.36],
    ],
    { at: [0, 1.5, 2.16], axis: [0, 0, 1], bone: prop, color: RED_C, segments: 12, smoothing: 1 },
  );
  const bladeOutline: OutlinePoint[] = [
    [-0.06, 0.15],
    [0.06, 0.15],
    [0.14, 0.6],
    [0.12, 0.98],
    [0, 1.05],
    [-0.12, 0.98],
    [-0.14, 0.6],
  ];
  for (const sy of [1, -1])
    b.extrude(bladeOutline, {
      at: [0, 1.5, 2.34],
      x: [1, 0, 0],
      y: [0, sy, 0],
      thickness: 0.045,
      bevel: 0.012,
      smoothing: 1,
      color: bladePaint,
      bone: prop,
    });
  put(ball(0.07, 6, 4), BRASS, [0, 1.5, 2.54], prop);

  // ---------------------------------------------------------------- cockpits, pilot, dog
  const zRear = -0.5;
  const zFront = 0.6;
  for (const z of [zRear, zFront]) {
    const y = topY(z);
    put(new THREE.CylinderGeometry(0.27, 0.27, 0.03, 12), "#2b1d2f", [0, y - 0.02, z], hull, { scale: [1, 1, 1.3] });
    put(new THREE.TorusGeometry(0.27, 0.045, 5, 12), LEATHER, [0, y, z], hull, { rotation: [90, 0, 0], scale: [1, 1.3, 1] });
  }
  for (const z of [-0.12, 0.98]) {
    const y = topY(z);
    put(new THREE.BoxGeometry(0.62, 0.26, 0.03), GLASS, [0, y + 0.1, z], hull, { rotation: [-20, 0, 0] });
    put(new THREE.BoxGeometry(0.66, 0.035, 0.045), BRASS, [0, y + 0.22, z - 0.04], hull, { rotation: [-20, 0, 0] });
  }

  // pilot
  const py = topY(zRear);
  put(ball(0.3, 10, 7), LEATHER, [0, py + 0.02, zRear], hull, { scale: [0.95, 1, 0.8] });
  put(new THREE.TorusGeometry(0.26, 0.03, 5, 12), BRASS, [0, py + 0.1, zRear], hull, { rotation: [90, 0, 0], scale: [1, 0.9, 1] });
  for (const s of [1, -1]) {
    b.capsule([s * 0.26, py + 0.15, zRear], [s * 0.15, py + 0.12, zRear + 0.2], 0.055, LEATHER, { bone: hull, sides: 6 });
    put(ball(0.06, 6, 4), SKIN, [s * 0.15, py + 0.12, zRear + 0.22], hull);
  }
  const hz = zRear;
  put(ball(0.2, 12, 8), SKIN, [0, 2.25, hz], pilotHead);
  put(ball(0.215, 12, 6), LEATHER, [0, 2.27, hz - 0.01], pilotHead, { scale: [1, 0.95, 1] });
  put(new THREE.SphereGeometry(0.215, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), LEATHER, [0, 2.27, hz - 0.01], pilotHead);
  put(ball(0.04, 6, 4), PINK, [0, 2.21, hz + 0.2], pilotHead);
  put(new THREE.TorusGeometry(0.205, 0.022, 5, 14), DARKM, [0, 2.29, hz], pilotHead, { rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    put(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), AMBER, [s * 0.09, 2.29, hz + 0.19], pilotHead, { rotation: [90, 0, 0] });
    put(new THREE.TorusGeometry(0.08, 0.017, 5, 10), BRASS, [s * 0.09, 2.29, hz + 0.2], pilotHead);
    put(ball(0.05, 6, 4), AMBER, [s * 0.06, 2.16, hz + 0.19], pilotHead, { scale: [1.9, 0.45, 0.75], rotation: [0, 0, s * 18] });
    put(ball(0.03, 5, 4), AMBER, [s * 0.15, 2.19, hz + 0.18], pilotHead);
  }
  put(new THREE.TorusGeometry(0.17, 0.045, 5, 12), RED, [0, 2.05, hz], hull, { rotation: [90, 0, 0] });

  const scarf = b.chain(
    "scarf",
    catmull([
      [0, 2.04, -0.55],
      [0.05, 2.12, -0.95],
      [0.15, 2.2, -1.35],
      [0.1, 2.22, -1.75],
    ]),
    { parent: pilotHead, names: ["scarf1", "scarf2", "scarf3"], role: "tentacle", up: [0, 1, 0] },
  );
  b.sweep(scarf, (t) => [0.09 * (1 - 0.25 * t), 0.012], { color: scarfPaint, section: "box" });

  // dog passenger
  const dz = zFront;
  const dy = topY(zFront);
  put(ball(0.2, 8, 6), FUR_D, [0, dy + 0.02, dz - 0.05], hull);
  for (const s of [1, -1]) put(ball(0.06, 6, 4), CREAM, [s * 0.14, dy + 0.08, dz + 0.2], hull, { scale: [1, 0.7, 1.4] });
  put(ball(0.17, 12, 8), FUR, [0, 2.2, dz], dogHead);
  put(new THREE.SphereGeometry(0.18, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.45), LEATHER, [0, 2.21, dz - 0.01], dogHead);
  put(ball(0.085, 8, 6), CREAM, [0, 2.15, dz + 0.16], dogHead, { scale: [1, 0.8, 1.1] });
  put(ball(0.035, 6, 4), INK, [0, 2.18, dz + 0.24], dogHead);
  put(new THREE.BoxGeometry(0.04, 0.012, 0.07), PINK, [0, 2.09, dz + 0.22], dogHead);
  for (const s of [1, -1]) {
    put(ball(0.1, 8, 6), FUR_D, [s * 0.17, 2.14, dz - 0.02], dogHead, { scale: [0.35, 1.1, 0.75], rotation: [0, 0, s * 12] });
    put(ball(0.03, 6, 4), INK, [s * 0.07, 2.24, dz + 0.15], dogHead);
    put(ball(0.012, 4, 3), CREAM, [s * 0.07 + 0.008, 2.255, dz + 0.175], dogHead);
    put(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8), AMBER, [s * 0.075, 2.33, dz + 0.1], dogHead, { rotation: [70, 0, 0] });
  }
  put(new THREE.TorusGeometry(0.19, 0.016, 4, 12), DARKM, [0, 2.3, dz], dogHead, { rotation: [90, 0, 0] });

  // moustache
  for (const s of [1, -1]) {
    put(ball(0.05, 6, 4), AMBER, [s * 0.055, 2.15, hz + 0.19], pilotHead, { scale: [1.6, 0.5, 0.7], rotation: [0, 0, s * 15] });
    put(ball(0.022, 5, 4), AMBER, [s * 0.13, 2.18, hz + 0.18], pilotHead);
  }

  // ---------------------------------------------------------------- wings
  const wingOutline: OutlinePoint[] = [
    [0, -0.25, "sharp"],
    [0, 0.7, "sharp"],
    [3.5, 0.7],
    [4.05, 0.45],
    [4.1, 0.1],
    [3.9, -0.25],
  ];
  const aileronOutline: OutlinePoint[] = [
    [1.7, -0.65],
    [1.7, -0.25],
    [3.9, -0.25],
    [3.85, -0.55],
    [3.5, -0.65],
  ];
  const wings = [
    { tag: "L", y: 1.2, z: 0.3 },
    { tag: "U", y: 2.65, z: 0.5 },
  ];
  for (const w of wings)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      b.extrude(wingOutline, {
        at: [0, w.y, w.z],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.16,
        bevel: 0.05,
        smoothing: 1,
        color: wingPaint,
        bone: hull,
      });
      const ail = b.joint(`aileron${w.tag}${side}`, {
        parent: hull,
        at: [s * 2.8, w.y, w.z - 0.25],
        dir: [0, 0, -1],
        role: "hinge",
      });
      b.extrude(aileronOutline, {
        at: [0, w.y, w.z],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.1,
        bevel: 0.03,
        smoothing: 1,
        color: aileronPaint,
        bone: ail,
      });
      // tip lights
      if (w.tag === "L") {
        glow(
          b.part(ball(0.06, 6, 4), s > 0 ? "#ff4d4d" : "#4dff7a", { bone: hull, at: [s * 4.08, w.y, w.z + 0.12] }),
          1.5,
        );
        glow(b.part(ball(0.075, 6, 4), "#fff6b0", { bone: hull, at: [s * 1.6, w.y, w.z + 0.72] }), 1.5);
      }
    }

  // gas tank on the top wing
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.06],
      [0.2, 0.16],
      [0, 0.2],
    ],
    { at: [0, 2.73, 0.75], bone: hull, color: CREAM_C, segments: 12, smoothing: 1 },
  );
  put(ball(0.045, 6, 4), BRASS, [0, 2.93, 0.75], hull);

  // struts, cabane, wires
  const sleeve = (p: number[]) => put(ball(0.07, 6, 4), BRASS, p, hull);
  for (const s of [1, -1]) {
    for (const [zl, zu] of [
      [0.8, 1.0],
      [0.3, 0.5],
    ]) {
      b.rod([s * 2.0, 1.28, zl], [s * 2.0, 2.57, zu], 0.05, WOOD, { bone: hull, sides: 6 });
      sleeve([s * 2.0, 1.28, zl]);
      sleeve([s * 2.0, 2.57, zu]);
    }
    b.rod([s * 2.0, 1.28, 0.8], [s * 2.0, 2.57, 0.5], 0.012, STEEL, { bone: hull, sides: 4 });
    b.rod([s * 2.0, 1.28, 0.3], [s * 2.0, 2.57, 1.0], 0.012, STEEL, { bone: hull, sides: 4 });
    b.rod([s * 3.5, 2.57, 0.9], [s * 2.0, 1.28, 0.8], 0.012, STEEL, { bone: hull, sides: 4 });
    b.rod([s * 0.4, 1.75, 1.05], [s * 0.7, 2.57, 1.0], 0.045, WOOD, { bone: hull, sides: 6 });
    b.rod([s * 0.4, 1.75, 0.05], [s * 0.75, 2.57, 0.4], 0.045, WOOD, { bone: hull, sides: 6 });
  }

  // little bird on the wing tip
  put(ball(0.09, 8, 6), PINK, [3.3, 2.83, 0.75], hull, { scale: [1, 0.9, 1.3] });
  put(ball(0.06, 8, 6), PINK, [3.3, 2.92, 0.86], hull);
  put(new THREE.ConeGeometry(0.025, 0.06, 5), AMBER, [3.3, 2.91, 0.94], hull, { rotation: [90, 0, 0] });
  put(new THREE.BoxGeometry(0.05, 0.015, 0.12), TEAL, [3.3, 2.83, 0.6], hull, { rotation: [-15, 0, 0] });
  for (const s of [1, -1]) put(ball(0.012, 4, 3), INK, [3.3 + s * 0.04, 2.94, 0.9], hull);

  // lucky duck on a string
  b.rod([0.45, 2.57, 0.9], [0.45, 2.31, 0.9], 0.008, INK, { bone: charm, sides: 4 });
  put(ball(0.07, 8, 6), YELLOW, [0.45, 2.24, 0.9], charm, { scale: [1, 0.9, 1.15] });
  put(ball(0.045, 8, 6), YELLOW, [0.45, 2.31, 0.95], charm);
  put(new THREE.ConeGeometry(0.02, 0.05, 5), AMBER, [0.45, 2.3, 1.0], charm, { rotation: [90, 0, 0] });

  // ---------------------------------------------------------------- tail
  const finOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [-0.75, 0, "sharp"],
    [-0.75, 1.15, "sharp"],
    [-0.45, 1.2],
    [-0.12, 0.55],
  ];
  b.extrude(finOutline, {
    at: [0, 1.45, -1.9],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.1,
    bevel: 0.03,
    smoothing: 1,
    color: RED_C,
    bone: hull,
  });
  const rudderOutline: OutlinePoint[] = [
    [0, -0.05, "sharp"],
    [-0.3, -0.12],
    [-0.6, 0.1],
    [-0.72, 0.6],
    [-0.55, 1.1],
    [-0.25, 1.25],
    [0, 1.2, "sharp"],
  ];
  b.extrude(rudderOutline, {
    at: [0, 1.45, -2.65],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.08,
    bevel: 0.025,
    smoothing: 1,
    color: rudderPaint,
    bone: rudder,
  });
  const stabOutline: OutlinePoint[] = [
    [0, 0.4, "sharp"],
    [0, -0.1, "sharp"],
    [1.3, -0.1, "sharp"],
    [1.4, 0.1],
    [1.15, 0.35],
  ];
  const elevOutline: OutlinePoint[] = [
    [0, -0.1, "sharp"],
    [0, -0.55, "sharp"],
    [1.05, -0.55],
    [1.4, -0.4],
    [1.3, -0.1, "sharp"],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude(stabOutline, {
      at: [0, 1.52, -2.3],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.02,
      smoothing: 1,
      color: RED_C,
      bone: hull,
    });
    const elev = b.joint(`elevator${side}`, { parent: hull, at: [s * 0.7, 1.52, -2.4], dir: [0, 0, -1], role: "hinge" });
    b.extrude(elevOutline, {
      at: [0, 1.52, -2.3],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.06,
      bevel: 0.018,
      smoothing: 1,
      color: TEAL_C,
      bone: elev,
    });
    // tail brace wires
    b.rod([s * 0.9, 1.52, -2.3], [0, 1.9, -1.95], 0.01, STEEL, { bone: hull, sides: 4 });
  }

  // tail wheel
  b.rod([0, 1.4, -2.3], [0, 0.22, -2.65], 0.035, STEEL, { bone: hull, sides: 6 });
  put(new THREE.TorusGeometry(0.1, 0.07, 5, 12), TIRE, [0, 0.17, -2.65], tailWheel, { rotation: [0, 90, 0] });
  put(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), CREAM, [0, 0.17, -2.65], tailWheel, { rotation: [0, 0, 90] });

  // ---------------------------------------------------------------- landing gear
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wc = [s * 1.0, 0.45, 0.62];
    const wheel = b.joint(`wheel${side}`, { parent: hull, at: wc, dir: [s, 0, 0], role: "hinge" });
    put(new THREE.TorusGeometry(0.33, 0.13, 6, 16), TIRE, wc, wheel, { rotation: [0, 90, 0] });
    put(new THREE.CylinderGeometry(0.3, 0.3, 0.17, 16), CREAM, wc, wheel, { rotation: [0, 0, 90] });
    for (let k = 0; k < 3; k++) put(new THREE.BoxGeometry(0.2, 0.56, 0.03), RED, wc, wheel, { rotation: [k * 60, 0, 0] });
    put(new THREE.CylinderGeometry(0.1, 0.1, 0.26, 8), BRASS, wc, wheel, { rotation: [0, 0, 90] });

    for (const [a, c] of [
      [
        [s * 0.34, 1.1, 0.95],
        [s * 0.9, 0.5, 0.67],
      ],
      [
        [s * 0.3, 1.1, 0.25],
        [s * 0.9, 0.5, 0.57],
      ],
    ]) {
      b.rod(a, c, [0.075, 0.055], TEAL, { bone: hull, sides: 6 });
      const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
      put(new THREE.CylinderGeometry(0.095, 0.095, 0.16, 8), BRASS, m, hull, { dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]] });
    }
  }
  b.rod([-0.88, 0.45, 0.62], [0.88, 0.45, 0.62], 0.04, STEEL, { bone: hull, sides: 6 });

  return b.root;
}
