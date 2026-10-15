import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { grain, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby storybook barnstormer biplane: red-and-yellow wings, cream round-cheeked fuselage with scalloped nose band, spinning wooden prop, open cockpit with a waving scarfed pilot, wire-braced struts, fat tyres and a pennant on the fin.",
  style: "whimsical",
  commit: "88fc1f0",
};

type Col = string | Paint;

// Palette ---------------------------------------------------------------------------------------------------------
const CREAM = cel("#f8ecc6");
const BELLY = cel("#ecd9a2");
const LINE = cel("#cdb98a");
const RED = cel("#d9372b");
const YEL = cel("#f6b92e");
const YELDEEP = cel("#e39a1c");
const WOODS = cel(grain("#b8702f", "#97592a", { size: 0.05, axis: "y" }));
const WOODB = cel(grain("#a8632f", "#8a4d22", { size: 0.04, axis: "y" }));
const METAL = "#9aa0aa";
const STEEL = "#5d626d";
const DARK = "#2c2626";
const BRASS = "#e0a63e";
const LEATHER = "#7b4527";
const GLASS = "#c4ecff";
const SKIN = "#f3b48c";
const SKIN2 = "#e99a78";
const RUBBER = "#2a2425";
const LENS = "#ffd75e";
const PINK = "#f08a8a";
const SCARF = "#e03a2c";
const EXH = "#4a4a54";
const TEAL = "#2fa7c8";

const O = (pts: Array<[number, number]>): OutlinePoint[] => pts;

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#d9372b" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="50" r="36" fill="#f8ecc6"/>
    <circle cx="50" cy="50" r="29" fill="${TEAL}"/>
    <polygon points="50,24 56,42 75,42 60,53 66,72 50,60 34,72 40,53 25,42 44,42" fill="#f6b92e" stroke="${INK}" stroke-width="2"/>
  </svg>`,
  { size: 192 },
);

const NUMBER = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#f6b92e" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="50" r="38" fill="#d9372b"/>
    <text x="50" y="68" font-size="52" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#f8ecc6">7</text>
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });

  // Skeleton ------------------------------------------------------------------------------------------------------
  const body = b.joint("body", { at: [0, 1.3, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.35, 2.0], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.45, -2.9], dir: [0, 1, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.16, -2.8], dir: [1, 0, 0], role: "hinge" });
  const pilotHead = b.joint("pilotHead", { parent: body, at: [0, 2.27, -0.55], dir: [0, 0, 1], role: "head" });
  const wheels: Record<number, Joint> = {};
  const elevs: Record<number, Joint> = {};
  const ails: Record<number, Joint> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    wheels[s] = b.joint(`wheel${side}`, { parent: body, at: [s * 1.0, 0.49, 1.35], dir: [s, 0, 0], role: "hinge" });
    elevs[s] = b.joint(`elevator${side}`, { parent: body, at: [0, 1.42, -2.7], dir: [s, 0, 0], role: "hinge" });
    ails[s] = b.joint(`aileron${side}`, { parent: body, at: [s * 2.1, 2.35, 0.05], dir: [s, 0, 0], role: "hinge" });
  }

  const P = (geo: THREE.BufferGeometry, color: Col, bone: Joint, o: PartOptions = {}) =>
    b.part(geo, color, { bone, ...o });
  const R = (a: number[], c: number[], r: number, color: Col, bone: Joint, o: SweepOptions = {}) =>
    b.rod(a, c, r, color, { bone, sides: 6, ...o });

  // Fuselage ------------------------------------------------------------------------------------------------------
  const fusPaint = paint((p, n) => {
    const edge = 0.98 + 0.08 * zigzag((p.y + p.x) / 0.24);
    if (p.z > edge) return RED;
    if (p.z > edge - 0.05) return YEL;
    const side = Math.abs(n.x) > 0.25;
    const w = 0.03 + 0.17 * Math.min(Math.max((p.z + 3.0) / 3.6, 0), 1);
    const dy = Math.abs(p.y - 1.32);
    if (side && dy < w) return RED;
    if (side && dy < w + 0.04) return YEL;
    if (n.y > 0.7 && Math.abs(p.x) < 0.12 && p.z > -2.9) return RED;
    if (p.y < 0.98) return BELLY;
    const f = (((p.z / 0.5) % 1) + 1) % 1;
    if (f < 0.012) return LINE;
    return CREAM;
  });
  const fus = b.loft(
    [
      { at: [0, 1.35, 1.55], w: 1.2, h: 1.2 },
      { at: [0, 1.34, 0.9], w: 1.28, h: 1.3 },
      { at: [0, 1.3, -0.2], w: 1.1, h: 1.2 },
      { at: [0, 1.3, -1.4], w: 0.75, h: 0.9 },
      { at: [0, 1.38, -2.5], w: 0.32, h: 0.45 },
      { at: [0, 1.45, -3.15], w: 0.12, h: 0.28 },
    ],
    { bone: body, color: fusPaint, sides: 10 },
  );

  // Cowl and engine ---------------------------------------------------------------------------------------------------
  b.lathe(
    O([
      [0.5, 0.0],
      [0.68, 0.0],
      [0.74, 0.2],
      [0.7, 0.45],
      [0.6, 0.58],
      [0.52, 0.52],
      [0.5, 0.3],
    ]),
    {
      at: [0, 1.35, 1.35],
      axis: [0, 0, 1],
      smoothing: 1,
      segments: 16,
      bone: body,
      color: paint((_p, _n, s) => (s[0] > 0.5 ? YEL : RED)),
    },
  );
  P(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 14), DARK, body, { at: [0, 1.35, 1.42], dir: [0, 0, 1] });
  P(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10), STEEL, body, { at: [0, 1.35, 1.65], dir: [0, 0, 1] });
  P(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), METAL, body, { at: [0, 1.35, 1.95], dir: [0, 0, 1] });
  for (let i = 0; i < 7; i++) {
    const a = (i * 2 * Math.PI) / 7;
    const c = Math.cos(a);
    const s = Math.sin(a);
    P(new THREE.CylinderGeometry(0.085, 0.085, 0.24, 8), METAL, body, { at: [c * 0.33, 1.35 + s * 0.33, 1.62], dir: [c, s, 0] });
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), STEEL, body, { at: [c * 0.3, 1.35 + s * 0.3, 1.62], dir: [c, s, 0] });
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), STEEL, body, { at: [c * 0.38, 1.35 + s * 0.38, 1.62], dir: [c, s, 0] });
    P(new THREE.SphereGeometry(0.075, 6, 4), STEEL, body, { at: [c * 0.46, 1.35 + s * 0.46, 1.62] });
    R([c * 0.4, 1.35 + s * 0.4, 1.62], [c * 0.2, 1.35 + s * 0.2, 1.82], 0.012, DARK, body, { sides: 4 });
  }

  // cowl rivets and louvres (merged per colour)
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i * 2 * Math.PI) / 18;
    rivets.push(new THREE.SphereGeometry(0.02, 5, 4).translate(Math.cos(a) * 0.71, 1.35 + Math.sin(a) * 0.71, 1.4));
  }
  const slits: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const k of [-1, 0, 1])
      slits.push(new THREE.BoxGeometry(0.03, 0.035, 0.24).translate(s * 0.735, 1.35 + k * 0.12, 1.62));
  const rivetMerged = mergeGeometries(rivets);
  const slitMerged = mergeGeometries(slits);
  if (rivetMerged) P(rivetMerged, BRASS, body, { at: [0, 0, 0] });
  if (slitMerged) P(slitMerged, DARK, body, { at: [0, 0, 0] });

  // exhausts
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.55, 1.15, 1.75],
        [s * 0.74, 1.1, 1.55],
        [s * 0.76, 1.05, 1.1],
      ]),
      [0.06, 0.05],
      EXH,
      { bone: body, sides: 6 },
    );

  // Propeller -------------------------------------------------------------------------------------------------------
  const bladeOutline = O([
    [-0.07, 0.05],
    [0.07, 0.05],
    [0.17, 0.55],
    [0.14, 1.05],
    [0, 1.15],
    [-0.14, 1.05],
    [-0.17, 0.55],
  ]);
  const bladePaint = paint((_p, _n, s) => (s[1] > 1.0 ? YEL : s[1] > 0.93 ? DARK : WOODB));
  for (const d of [1, -1])
    b.extrude(bladeOutline, {
      at: [0, 1.35, 2.0],
      x: [d, 0, 0],
      y: [0, d, 0],
      thickness: 0.05,
      bevel: 0.015,
      smoothing: 1,
      bone: prop,
      color: bladePaint,
    });
  b.lathe(
    O([
      [0, 0],
      [0.23, 0],
      [0.24, 0.06],
      [0.17, 0.2],
      [0, 0.3],
    ]),
    {
      at: [0, 1.35, 1.98],
      axis: [0, 0, 1],
      segments: 12,
      bone: prop,
      color: paint((_p, _n, s) => (s[0] < 0.05 ? YEL : RED)),
    },
  );
  P(new THREE.SphereGeometry(0.04, 6, 4), BRASS, prop, { at: [0, 1.35, 2.3] });

  // Wings ---------------------------------------------------------------------------------------------------------
  const wingPaint = (half: number, chord: number) =>
    paint((_p, n, s) => {
      if (Math.abs(n.y) < 0.6) return RED;
      const lead = chord - 0.22 + 0.05 * zigzag(s[0] / 0.4);
      const tip = half - 0.4 + 0.05 * zigzag(s[1] / 0.3);
      if (s[1] > lead || s[1] < -chord + 0.12 || Math.abs(s[0]) > tip) return RED;
      const f = (Math.abs(s[0]) / 0.55) % 1;
      if (f < 0.03 || f > 0.97) return YELDEEP;
      return YEL;
    });
  b.extrude(
    O([
      [-3.8, 0.1],
      [-3.4, 0.66],
      [0, 0.72],
      [3.4, 0.66],
      [3.8, 0.1],
      [3.3, -0.66],
      [0, -0.72],
      [-3.3, -0.66],
    ]),
    {
      at: [0, 2.35, 0.45],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.14,
      bevel: 0.04,
      smoothing: 2,
      bone: body,
      color: wingPaint(3.8, 0.72),
    },
  );
  b.extrude(
    O([
      [-3.3, 0.1],
      [-2.95, 0.58],
      [0, 0.64],
      [2.95, 0.58],
      [3.3, 0.1],
      [2.85, -0.58],
      [0, -0.64],
      [-2.85, -0.58],
    ]),
    {
      at: [0, 0.95, 0.35],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.13,
      bevel: 0.04,
      smoothing: 2,
      bone: body,
      color: wingPaint(3.3, 0.64),
    },
  );

  // ailerons on the upper wing (hinge at their leading edge)
  const ailPaint = paint((_p, n, s) => {
    if (Math.abs(n.y) < 0.6) return RED;
    return Math.abs(s[1] - 0.16) < 0.045 ? RED : YEL;
  });
  for (const s of [1, -1])
    b.extrude(
      O([
        [0, 0],
        [1.1, 0],
        [1.1, 0.32],
        [0, 0.32],
      ]),
      {
        at: [s * 2.1, 2.35, 0.05],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.17,
        bevel: 0.02,
        smoothing: 0,
        bone: ails[s],
        color: ailPaint,
      },
    );

  // roundels and wing lights
  for (const s of [1, -1]) {
    P(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", body, {
      at: [s * 2.55, 2.425, 0.6],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: ROUNDEL,
    });
    P(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", body, {
      at: [s * 2.5, 0.884, 0.35],
      dir: [0, -1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: ROUNDEL,
    });
    glow(P(new THREE.SphereGeometry(0.07, 6, 5), "#ffdf6e", body, { at: [s * 3.72, 2.35, 0.55] }), 1.4);
    b.decal(fus, NUMBER, { at: [s * 0.55, 1.3, -1.0], dir: [s, 0, 0], size: [0.5, 0.5] });
  }

  // Struts, cabane, wires ---------------------------------------------------------------------------------------
  const fittings: THREE.BufferGeometry[] = [];
  const strut = (a: number[], c: number[]) => {
    b.sweep([a, c], () => [0.035, 0.07], WOODS, { bone: body, caps: "flat" });
    for (const p of [a, c]) fittings.push(new THREE.BoxGeometry(0.12, 0.05, 0.12).translate(p[0], p[1], p[2]));
  };
  const wire = (a: number[], c: number[]) => R(a, c, 0.012, STEEL, body, { sides: 4 });
  for (const s of [1, -1]) {
    // interplane struts
    strut([s * 2.0, 2.28, 0.8], [s * 2.0, 1.02, 0.7]);
    strut([s * 2.0, 2.28, -0.05], [s * 1.95, 1.02, -0.05]);
    strut([s * 3.1, 2.28, 0.65], [s * 3.1, 1.02, 0.5]);
    strut([s * 3.1, 2.28, 0.15], [s * 3.1, 1.02, 0.0]);
    // cabane
    strut([s * 0.35, 1.8, 0.75], [s * 0.7, 2.28, 0.8]);
    strut([s * 0.35, 1.8, 0.0], [s * 0.55, 2.28, 0.1]);
    // bracing wires
    wire([s * 2.0, 2.28, 0.8], [s * 3.1, 1.02, 0.5]);
    wire([s * 3.1, 2.28, 0.65], [s * 2.0, 1.02, 0.7]);
    wire([s * 2.0, 2.28, -0.05], [s * 3.1, 1.02, 0.0]);
    wire([s * 3.1, 2.28, 0.15], [s * 1.95, 1.02, -0.05]);
    wire([s * 0.7, 2.28, 0.8], [s * 2.0, 1.02, 0.7]);
    wire([s * 0.55, 2.28, 0.1], [s * 1.95, 1.02, -0.05]);
    // tail bracing
    wire([s * 1.05, 1.4, -2.7], [s * 0.05, 2.45, -2.75]);
    wire([s * 1.05, 1.4, -2.7], [0, 1.1, -2.6]);
  }

  // Landing gear -------------------------------------------------------------------------------------------------
  R([-1.0, 0.49, 1.35], [1.0, 0.49, 1.35], 0.04, WOODS, body, { sides: 6 });
  for (const s of [1, -1]) {
    const w = wheels[s];
    const at = [s * 1.0, 0.49, 1.35];
    P(new THREE.TorusGeometry(0.37, 0.12, 6, 14), RUBBER, w, { at, dir: [s, 0, 0], axis: "z" });
    P(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), RED, w, { at, dir: [1, 0, 0] });
    P(new THREE.CylinderGeometry(0.2, 0.2, 0.23, 10), CREAM, w, { at, dir: [1, 0, 0] });
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.26, 8), YEL, w, { at, dir: [1, 0, 0] });
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), BRASS, w, { at, dir: [1, 0, 0] });
    R([s * 0.3, 0.85, 1.2], [s * 0.95, 0.52, 1.35], 0.05, RED, body);
    R([s * 0.35, 0.85, 0.5], [s * 0.95, 0.52, 1.35], 0.05, RED, body);
    fittings.push(new THREE.BoxGeometry(0.14, 0.1, 0.14).translate(s * 0.95, 0.52, 1.35));
  }

  // tail wheel and skid strut
  R([0, 1.25, -2.4], [0, 0.2, -2.8], 0.035, METAL, body);
  P(new THREE.TorusGeometry(0.1, 0.06, 6, 10), RUBBER, tailWheel, { at: [0, 0.16, -2.8], dir: [1, 0, 0], axis: "z" });
  P(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), YEL, tailWheel, { at: [0, 0.16, -2.8], dir: [1, 0, 0] });

  const fitMerged = mergeGeometries(fittings);
  if (fitMerged) P(fitMerged, METAL, body, { at: [0, 0, 0] });

  // Tail surfaces ----------------------------------------------------------------------------------------------------
  const stripeV = paint((_p, n, s) => {
    if (Math.abs(n.dot(new THREE.Vector3(1, 0, 0))) < 0.5) return RED;
    return s[1] > 0.5 && s[1] < 0.75 ? YEL : RED;
  });
  b.extrude(
    O([
      [0, 0],
      [0.6, 0],
      [0.6, 1.25],
      [0.4, 1.3],
      [0.15, 0.8],
    ]),
    {
      at: [0, 1.45, -2.3],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.1,
      bevel: 0.025,
      smoothing: 1,
      bone: body,
      color: stripeV,
    },
  );
  b.extrude(
    O([
      [0, 0],
      [0.42, 0.05],
      [0.5, 0.5],
      [0.38, 1.0],
      [0.15, 1.28],
      [0, 1.3],
    ]),
    {
      at: [0, 1.45, -2.9],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.09,
      bevel: 0.02,
      smoothing: 1,
      bone: rudder,
      color: stripeV,
    },
  );
  b.extrude(
    O([
      [-1.3, 0],
      [-1.0, 0.4],
      [1.0, 0.4],
      [1.3, 0],
    ]),
    {
      at: [0, 1.42, -2.7],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.02,
      smoothing: 1,
      bone: body,
      color: wingPaint(1.3, 0.4),
    },
  );
  for (const s of [1, -1])
    b.extrude(
      O([
        [0, 0],
        [1.3, 0],
        [1.25, 0.3],
        [0.9, 0.48],
        [0, 0.5],
      ]),
      {
        at: [0, 1.42, -2.7],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.06,
        bevel: 0.015,
        smoothing: 1,
        bone: elevs[s],
        color: wingPaint(1.3, 0.5),
      },
    );

  // pennant on the fin
  R([0, 2.7, -2.62], [0, 3.0, -2.62], 0.012, METAL, body, { sides: 4 });
  b.extrude(
    O([
      [0, 0],
      [0.6, -0.06],
      [0, -0.16],
    ]),
    {
      at: [0, 2.98, -2.62],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.015,
      bone: body,
      color: paint((_p, _n, s) => (s[0] > 0.38 ? YEL : RED)),
    },
  );

  // Cockpit and pilot -----------------------------------------------------------------------------------------------
  P(new THREE.TorusGeometry(0.26, 0.05, 6, 14), LEATHER, body, { at: [0, 1.9, -0.55], rotation: [-90, 0, 0], scale: [1, 1.5, 1] });
  P(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 12), DARK, body, { at: [0, 1.88, -0.55], scale: [1, 1, 1.5] });
  P(new THREE.SphereGeometry(1, 8, 6), RED, body, { at: [0, 1.78, -1.2], scale: [0.3, 0.2, 0.55] });

  // windscreen
  b.extrude(
    O([
      [-0.22, 0],
      [0.22, 0],
      [0.18, 0.3],
      [-0.18, 0.3],
    ]),
    { at: [0, 1.94, -0.12], x: [1, 0, 0], y: [0, 0.95, -0.3], thickness: 0.02, bone: body, color: GLASS },
  );
  for (const s of [1, -1]) R([s * 0.22, 1.94, -0.12], [s * 0.18, 2.226, -0.21], 0.012, METAL, body, { sides: 4 });
  R([-0.18, 2.226, -0.21], [0.18, 2.226, -0.21], 0.012, METAL, body, { sides: 4 });

  // pilot
  b.capsule([0, 1.85, -0.55], [0, 2.05, -0.55], 0.22, LEATHER, { bone: body, sides: 8 });
  P(new THREE.SphereGeometry(0.19, 10, 8), SKIN, pilotHead, { at: [0, 2.27, -0.55] });
  P(new THREE.SphereGeometry(0.205, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), LEATHER, pilotHead, {
    at: [0, 2.28, -0.57],
    rotation: [-10, 0, 0],
  });
  P(new THREE.TorusGeometry(0.195, 0.018, 4, 12), BRASS, pilotHead, { at: [0, 2.32, -0.55], rotation: [90, 0, 0] });
  P(new THREE.SphereGeometry(0.035, 6, 4), SKIN2, pilotHead, { at: [0, 2.25, -0.35] });
  P(new THREE.TorusGeometry(0.055, 0.01, 4, 8, Math.PI), DARK, pilotHead, { at: [0, 2.19, -0.36], rotation: [0, 0, 180] });
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 10), BRASS, pilotHead, { at: [s * 0.085, 2.31, -0.37], dir: [0, 0, 1] });
    P(new THREE.CylinderGeometry(0.05, 0.05, 0.055, 10), LENS, pilotHead, { at: [s * 0.085, 2.31, -0.365], dir: [0, 0, 1] });
    P(new THREE.SphereGeometry(0.06, 6, 4), LEATHER, pilotHead, { at: [s * 0.19, 2.24, -0.55], scale: [0.4, 1, 1] });
    P(new THREE.SphereGeometry(0.035, 6, 4), PINK, pilotHead, { at: [s * 0.12, 2.21, -0.4], scale: [1, 1, 0.4] });
  }
  b.sweep(
    catmull([
      [0, 2.12, -0.6],
      [0.05, 2.16, -0.85],
      [-0.05, 2.25, -1.15],
      [0.05, 2.2, -1.5],
      [0, 2.28, -1.8],
    ]),
    [0.06, 0.015],
    SCARF,
    { bone: pilotHead, sides: 6 },
  );
  // waving left arm, resting right arm
  b.capsule([0.2, 2.0, -0.55], [0.48, 2.28, -0.55], 0.06, LEATHER, { bone: body, sides: 6 });
  b.capsule([0.48, 2.28, -0.55], [0.62, 2.55, -0.5], 0.055, LEATHER, { bone: body, sides: 6 });
  P(new THREE.SphereGeometry(0.08, 8, 6), LEATHER, body, { at: [0.65, 2.62, -0.5] });
  b.capsule([-0.2, 2.0, -0.55], [-0.3, 1.94, -0.25], 0.06, LEATHER, { bone: body, sides: 6 });
  P(new THREE.SphereGeometry(0.075, 8, 6), LEATHER, body, { at: [-0.3, 1.94, -0.22] });

  return b.root;
}
