import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { limb } from "../../../../src/ik";
import type { FrameInput } from "../../../../src/math";
import { catmull, polyline, spiral } from "../../../../src/path";
import type { PartOptions } from "../../../../src/parts";
import { gradient, grain, mottle, paint, stripes } from "../../../../src/paint";
import type { StickOptions } from "../../../../src/surface";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A knee-high gnome inventor with a floppy goggled hat, a snowy beard and a huge leather backpack bristling with gadgets: spinning propeller, spyglass, antenna coil, pressure gauge, cogs, wrench, lantern and kettle.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SKIN = "#f2b48f";
const SKIN_D = "#d98f6e";
const NOSE = "#ee8478";
const BLUSH = "#f0766f";
const WHITE = "#fffaf0";
const DARK = "#2b2230";
const MOUTH = "#8c2f3c";
const BEARD = "#f4eee0";
const BEARD_S = "#d9d4cd";
const HAT = "#d8453a";
const HAT_D = "#a92f36";
const TUNIC = "#e6a938";
const TUNIC_D = "#c58422";
const TEAL = "#2f8f9d";
const TEAL_D = "#22707c";
const OLIVE = "#7d9250";
const OLIVE_D = "#617637";
const BOOT = "#7a4a2c";
const BOOT_D = "#4f2f1c";
const CREAM = "#f6e7c1";
const LEATHER = "#a56a38";
const LEATHER_D = "#7a4723";
const LEATHER_L = "#c28a50";
const BRASS = "#e0aa3e";
const BRASS_D = "#b57e24";
const COPPER = "#d2733e";
const STEEL = "#8d99a6";
const STEEL_D = "#5d6874";
const GLASS = "#8be8ff";
const AMBER = "#ffc65a";
const RED = "#e0463c";
const PENCIL = "#f2cf3a";

type Pts = number[][];

const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const addv = (p: number[], d: THREE.Vector3, k = 1) => [p[0] + d.x * k, p[1] + d.y * k, p[2] + d.z * k];

/** Piecewise-linear interpolation through [t, value] keys. */
function pl(keys: number[][], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const f = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * f;
    }
  }
  return keys[keys.length - 1][1];
}

function gearOutline(teeth: number, ro: number, ri: number): OutlinePoint[] {
  const out: OutlinePoint[] = [];
  const w = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * w;
    for (const [da, r] of [
      [-0.3, ri],
      [-0.16, ro],
      [0.16, ro],
      [0.3, ri],
    ]) {
      out.push([Math.cos(a + da * w) * r, Math.sin(a + da * w) * r]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const polar = (deg: number, r: number) => [50 + Math.cos((deg * Math.PI) / 180) * r, 50 + Math.sin((deg * Math.PI) / 180) * r];
const wedge = (a0: number, a1: number, fill: string) => {
  const p0 = polar(a0, 44);
  const p1 = polar(a1, 44);
  return `<path d="M50 50 L${p0[0]} ${p0[1]} A44 44 0 0 1 ${p1[0]} ${p1[1]} Z" fill="${fill}"/>`;
};
const gaugeSvg = (() => {
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const a = -215 + i * 25;
    const p0 = polar(a, i % 5 === 0 ? 29 : 33);
    const p1 = polar(a, 40);
    ticks += `<line x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}" stroke="#2b2230" stroke-width="3"/>`;
  }
  const n = polar(-215 + 6.4 * 25, 34);
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#f7efd8"/>
${wedge(-215, -95, "#8fd18a")}${wedge(-95, -45, "#f4cf55")}${wedge(-45, 35, "#e8584c")}
<circle cx="50" cy="50" r="30" fill="#f7efd8"/>${ticks}
<line x1="50" y1="50" x2="${n[0]}" y2="${n[1]}" stroke="#c0392b" stroke-width="4"/>
<circle cx="50" cy="50" r="6" fill="#2b2230"/></svg>`,
    { size: 128 },
  );
})();

const patchSvg = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="1" y="1" width="38" height="38" rx="5" fill="#2f8f9d"/>
<rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="#f6e7c1" stroke-width="2" stroke-dasharray="4 3"/>
<polygon points="20,9 23.5,16.5 31.5,17.5 25.5,23 27.5,31 20,27 12.5,31 14.5,23 8.5,17.5 16.5,16.5" fill="#f6e7c1"/></svg>`,
  { size: 128 },
);

const badgeSvg = (() => {
  let cog = "";
  for (let i = 0; i < 8; i++)
    cog += `<rect x="-3" y="-18" width="6" height="8" fill="#2b2230" transform="translate(32 32) rotate(${i * 45})"/>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e0aa3e"/><circle cx="32" cy="32" r="26" fill="#f6e7c1"/>
${cog}<circle cx="32" cy="32" r="12" fill="#2b2230"/><circle cx="32" cy="32" r="5" fill="#f6e7c1"/></svg>`,
    { size: 128 },
  );
})();

const swirlSvg = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#f6e7c1"/>
<path d="M32 29 a3 3 0 1 1 -3 3 a7 7 0 1 1 7 7 a11 11 0 1 1 -11 -11 a15 15 0 1 1 15 15 a19 19 0 1 1 -19 -19 a23 23 0 1 1 23 23" fill="none" stroke="#2f8f9d" stroke-width="3"/></svg>`,
  { size: 128 },
);

const tagSvg = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect x="1" y="1" width="46" height="30" rx="4" fill="#f6e7c1" stroke="#7a4723" stroke-width="2"/>
<path d="M8 22 L14 10 L20 22 M10.5 18 H17.5" stroke="#d8453a" stroke-width="3" fill="none"/>
<path d="M26 12 H40 M26 18 H38 M26 24 H34" stroke="#7a4723" stroke-width="2.5"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });

  const P = (geo: THREE.BufferGeometry, color: Fill, opts: PartOptions = {}) =>
    b.part(geo, color, { flat: true, ...opts });
  const S = (geo: THREE.BufferGeometry, color: Fill, on: FrameInput, opts: StickOptions = {}) =>
    b.stick(geo, color, on, { flat: true, ...opts });
  /** Many equal studs on one bone as one part. */
  const studs = (pts: Pts, r: number, color: Fill, bone: PartOptions["bone"]) =>
    P(mergeGeometries(pts.map((p) => sph(r, 5, 4).translate(p[0], p[1], p[2])))!, color, { bone, at: [0, 0, 0] });
  /** A screwdriver-like tool: handle then shaft. */
  const tool = (base: number[], dir: number[], handleLen: number, shaftLen: number, handle: Fill, bone: PartOptions["bone"]) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const mid = addv(base, d, handleLen);
    b.rod(base, mid, 0.011, handle, { sides: 6, bone, caps: "round" });
    b.rod(mid, addv(mid, d, shaftLen), 0.0045, STEEL, { sides: 5, bone, caps: "flat" });
  };

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, 0],
      [0, 0.5, 0.01],
      [0, 0.62, 0],
      [0, 0.74, -0.01],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const belly = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.74, -0.01], aim: [0, 0.82, 0.01], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.82, 0.01], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.83, 0.07], aim: [0, 0.795, 0.17], role: "jaw" });

  // ------------------------------------------------------------------------------------------------------------
  // Torso with a painted leather apron, tunic skirt, belt
  const tunicPaint = mottle(TUNIC, TUNIC_D, { size: 0.1, contrast: 0.7, seed: 4 });
  const bodyPaint = paint((p, n) => {
    const halfW = 0.085 + (0.66 - p.y) * 0.34;
    const dx = Math.abs(p.x);
    const inside = p.z > 0.02 && n.z > 0.1 && p.y < 0.665 && p.y > 0.4 && dx < halfW;
    if (inside) {
      const edge = Math.min(halfW - dx, p.y - 0.4, 0.665 - p.y);
      if (edge < 0.012) return LEATHER_D;
      if (edge < 0.022 && Math.floor(p.y / 0.014 + p.x / 0.014) % 2 === 0) return CREAM;
      return LEATHER;
    }
    if (p.y < 0.36) return OLIVE;
    return tunicPaint;
  });
  const torsoX = [
    [0, 0.15],
    [0.3, 0.195],
    [0.65, 0.18],
    [0.9, 0.14],
    [1, 0.085],
  ];
  const torsoZ = [
    [0, 0.15],
    [0.3, 0.185],
    [0.65, 0.16],
    [0.9, 0.12],
    [1, 0.08],
  ];
  const torso = b.sweep(spine, (t) => [pl(torsoX, t), pl(torsoZ, t)], {
    shift: (t) => [0, -0.03 * Math.sin(Math.PI * Math.min(t * 1.1, 1))],
    sides: 8,
    smooth: false,
    color: bodyPaint,
  });
  const skin = b.surface(torso);

  const skirtPaint = paint((p) => {
    if (p.y < 0.335) return Math.floor((p.x + p.z + 1) / 0.04) % 2 ? CREAM : TEAL;
    if (p.y < 0.35) return TEAL_D;
    return tunicPaint;
  });
  b.lathe(
    [
      [0.2, 0.0],
      [0.225, -0.012],
      [0.255, -0.15],
      [0.24, -0.155],
      [0.19, -0.125],
      [0.165, -0.03],
    ],
    { at: [0, 0.465, 0.0], bone: belly, segments: 8, color: skirtPaint },
  );

  // belt, buckle, pouches
  const beltLoop = skin.loop([0, 0.462, 0], { lift: 0.012 });
  b.sweep(beltLoop, 0.021, { color: LEATHER_D, sides: 6, bone: belly });
  const buckleHit = skin.nearest([0, 0.462, 0.4]);
  const buckle = S(box(0.07, 0.016, 0.055), BRASS, buckleHit, { embed: 0.3 });
  S(box(0.045, 0.012, 0.032), LEATHER_D, b.surface(buckle).nearest([0, 0.462, 0.5]), { embed: 0.3 });
  for (const t of [0.075, 0.925]) {
    const hit = skin.nearest(beltLoop.at(t));
    const pouch = S(box(0.085, 0.045, 0.075), LEATHER, hit, { embed: 0.25 });
    S(box(0.09, 0.02, 0.05), LEATHER_D, hit.moved({ up: 0.0, forward: 0.0 }), { embed: -0.9 });
    S(sph(0.011, 5, 4), BRASS, b.surface(pouch).nearest(hit.at.clone().add(V(0, 0.02, 0.2))), { embed: 0.3 });
  }
  // hammer on the left hip loop
  {
    const hit = skin.nearest(beltLoop.at(0.22));
    const base = [hit.at.x + 0.03, 0.43, hit.at.z + 0.0];
    b.rod(base, [base[0] + 0.03, 0.31, base[2]], 0.011, BOOT, { sides: 6, bone: belly });
    P(box(0.03, 0.03, 0.075), STEEL_D, { bone: belly, at: [base[0] + 0.035, 0.305, base[2]], rotation: [0, 0, 8] });
    S(box(0.04, 0.012, 0.04), LEATHER_D, hit, { embed: 0.2 });
  }
  // keyring on the right hip
  {
    const hit = skin.nearest(beltLoop.at(0.78));
    S(sph(0.012, 5, 4), BRASS, hit, { embed: 0.2 });
    b.sweep(catmull([hit.at.toArray(), addv(hit.at.toArray(), V(-0.01, -0.03, 0.01)), addv(hit.at.toArray(), V(-0.01, -0.06, 0.0))]), 0.004, {
      color: BRASS_D,
      sides: 4,
      bone: belly,
    });
    for (let k = 0; k < 3; k++)
      P(box(0.012, 0.045, 0.006), k === 1 ? BRASS : STEEL, {
        bone: belly,
        at: [hit.at.x - 0.012 - k * 0.002, hit.at.y - 0.085, hit.at.z + 0.012 + (k - 1) * 0.012],
        rotation: [0, 0, (k - 1) * 14],
      });
  }
  // apron pocket and tools
  {
    const hit = skin.nearest([0, 0.52, 0.4]);
    S(box(0.12, 0.02, 0.085), LEATHER_L, hit, { embed: 0.35 });
    S(box(0.126, 0.024, 0.02), LEATHER_D, hit.moved({ up: 0.045 }), { embed: 0.0 });
    studs([addv(hit.at.toArray(), V(0.045, 0.012, 0.045)), addv(hit.at.toArray(), V(-0.045, 0.012, 0.045))], 0.008, BRASS, belly);
    const base = hit.at.toArray();
    tool(addv(base, V(-0.035, 0.0, 0.0), 1), [-0.2, 1, 0.2], 0.05, 0.05, RED, belly);
    tool(addv(base, V(0.0, 0.0, 0.0), 1), [0.0, 1, 0.25], 0.055, 0.045, TEAL, belly);
    tool(addv(base, V(0.035, 0.0, 0.0), 1), [0.2, 1, 0.2], 0.05, 0.055, PENCIL, belly);
  }
  // suspenders and chest strap
  for (const s of [1, -1]) {
    const route = catmull([
      [s * 0.1, 0.775, -0.17],
      [s * 0.115, 0.79, -0.04],
      [s * 0.125, 0.77, 0.07],
      [s * 0.115, 0.68, 0.17],
      [s * 0.105, 0.55, 0.215],
      [s * 0.1, 0.47, 0.215],
    ]);
    b.sweep(skin.drape(route, { lift: 0.008 }), () => [0.021, 0.008], { color: LEATHER_D, caps: "flat" });
    b.rod([s * 0.1, 0.74, -0.19], [s * 0.1, 0.77, -0.13], 0.017, LEATHER_D, { sides: 6, bone: chest });
    const slide = skin.nearest([s * 0.11, 0.6, 0.4]);
    S(box(0.05, 0.014, 0.035), BRASS, slide, { embed: 0.3 });
  }
  b.sweep(
    skin.drape(
      catmull([
        [0.115, 0.64, 0.17],
        [0.06, 0.635, 0.2],
        [0, 0.63, 0.21],
        [-0.06, 0.635, 0.2],
        [-0.115, 0.64, 0.17],
      ]),
      { lift: 0.006 },
    ),
    () => [0.012, 0.006],
    { color: BOOT_D, caps: "flat" },
  );
  S(box(0.04, 0.012, 0.035), BRASS, skin.nearest([0, 0.635, 0.4]), { embed: 0.3 });

  // ------------------------------------------------------------------------------------------------------------
  // Legs and boots
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.085, 0.4, 0], [s * 0.095, 0.1, 0], [0.155, 0.155], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.095, 0, 0.03],
    });
    const ankle = leg.tip!;
    const trousers = stripes(OLIVE, OLIVE_D, { size: 0.045, axis: "y", width: 0.5, wobble: 0.12, seed: 3 });
    const legTube = b.sweep(leg, [0.066, 0.056], { color: trousers, sides: 8, smooth: false });
    S(cyl(0.035, 0.035, 0.012, 6), LEATHER_L, b.surface(legTube).nearest([s * 0.09, pts[1].y, 0.3]), { embed: 0.4 });

    const x = s * 0.095;
    // boot
    b.rod([x, 0.05, 0], [x, 0.2, 0], 0.076, gradient(BOOT, BOOT_D, [0, 0.2, 0], [0, 0.03, 0]), { sides: 8, bone: ankle });
    b.rod([x, 0.17, 0], [x, 0.215, 0], 0.085, LEATHER_L, { sides: 8, bone: ankle });
    b.rod([x, 0.12, 0], [x, 0.135, 0], 0.08, BOOT_D, { sides: 8, bone: ankle });
    S(box(0.04, 0.014, 0.03), BRASS, b.surface(b.root).nearest([x, 0.128, 0.4]), { embed: 0.2 });
    studs(
      [0.06, 0.09, 0.15].flatMap((y) => [-1, 1].map((k) => [x + k * 0.016, y, 0.078])),
      0.007,
      BRASS,
      ankle,
    );
    b.sweep(
      polyline([
        [x, 0.075, -0.065],
        [x, 0.075, 0.07],
      ]),
      0.072,
      { sides: 6, color: BOOT, bone: ankle, smooth: false },
    );
    const toe = b.joint(`toe${L}`, { parent: ankle, at: [x, 0.07, 0.07], aim: [x, 0.07, 0.17] });
    P(sph(0.068, 7, 5), BOOT_D, { bone: toe, at: [x, 0.07, 0.092], scale: [1, 0.95, 1.1] });
    b.spike([x, 0.085, 0.14], [0, 0.45, 1], 0.1, 0.048, { color: BOOT, bone: toe, sides: 6 });
    P(sph(0.014, 5, 4), BRASS, { bone: toe, at: [x, 0.14, 0.245] });
    P(sph(0.052, 6, 4), "#a3693d", { bone: toe, at: [x, 0.098, 0.1], scale: [0.9, 0.3, 1.0] });
    b.extrude(
      [
        [-0.085, -0.09],
        [0.085, -0.09],
        [0.098, 0.0],
        [0.09, 0.1],
        [0.055, 0.17],
        [-0.055, 0.17],
        [-0.09, 0.1],
        [-0.098, 0.0],
      ],
      { at: [x, 0.008, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.016, bevel: 0.004, color: CREAM, bone: ankle },
    );
  }

  // ------------------------------------------------------------------------------------------------------------
  // Arms, hands
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.2, 0.67, 0], [s * 0.32, 0.41, 0.05], [0.15, 0.15], [[0, 0, -1]]);
    const arm = b.chain(`arm${L}`, pts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    const wrist = arm.tip!;
    P(sph(0.075, 7, 5), TUNIC, { bone: arm.joints[0], at: [s * 0.2, 0.675, 0] });
    const sleeve = b.sweep(arm, [0.062, 0.05], {
      bands: [
        [0.85, stripes(TEAL, TEAL_D, { size: 0.05, axis: [0, 1, 0], width: 0.4, wobble: 0.1, seed: 9 })],
        [1, LEATHER_D],
      ],
      sides: 8,
      smooth: false,
    });
    P(cyl(0.057, 0.066, 0.04, 8), LEATHER, { frame: arm.at(0.9), bone: wrist });
    S(cyl(0.032, 0.032, 0.012, 6), LEATHER_L, b.surface(sleeve).nearest([s * 0.25, pts[1].y, -0.3]), { embed: 0.4 });
    // hand
    const d = pts[2].clone().sub(pts[1]).normalize();
    const palmC = pts[2].clone().addScaledVector(d, 0.035);
    P(sph(0.052, 7, 5), LEATHER, { bone: wrist, at: palmC, scale: [0.8, 1, 1.0] });
    const inward = V(-s, 0, 0);
    const fingers: [string, number, number][] = [
      ["index", 0.026, 0.04],
      ["middle", 0.008, 0.046],
      ["ring", -0.011, 0.042],
      ["pinky", -0.03, 0.034],
    ];
    for (const [nm, z0, len] of fingers) {
      const p0 = palmC.clone().addScaledVector(d, 0.03).add(V(0, 0, z0));
      const p1 = p0.clone().addScaledVector(d, len);
      const p2 = p1.clone().addScaledVector(d.clone().add(inward.clone().multiplyScalar(0.55)).normalize(), len * 0.9);
      const c = b.chain(`${nm}${L}`, [p0.toArray(), p1.toArray(), p2.toArray()], {
        parent: wrist,
        names: [`${nm}${L}1`, `${nm}${L}2`, `${nm}${L}3`],
        role: "digit",
      });
      b.sweep(c, [0.019, 0.014], { color: SKIN, sides: 5, caps: { start: "flat", end: "round" } });
    }
    {
      const p0 = palmC.clone().add(V(-s * 0.012, 0, 0.04));
      const p1 = p0.clone().add(d.clone().multiplyScalar(0.7).add(V(0, 0, 0.55)).normalize().multiplyScalar(0.036));
      const p2 = p1.clone().add(d.clone().multiplyScalar(0.7).add(V(-s * 0.25, 0, 0.3)).normalize().multiplyScalar(0.032));
      const c = b.chain(`thumb${L}`, [p0.toArray(), p1.toArray(), p2.toArray()], {
        parent: wrist,
        names: [`thumb${L}1`, `thumb${L}2`, `thumb${L}3`],
        role: "digit",
      });
      b.sweep(c, [0.021, 0.016], { color: SKIN, sides: 5, caps: { start: "flat", end: "round" } });
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Head
  const H = [0, 0.89, 0.03];
  const headPart = P(sph(0.15, 10, 7), SKIN, { bone: head, at: H, scale: [1, 0.94, 1] });
  const face = b.surface(headPart);

  // beard first so the mouth can sit on it
  const beardPaint = stripes(BEARD, BEARD_S, { size: 0.05, axis: "x", width: 0.28, wobble: 0.9, seed: 5 });
  const beardX = [
    [0, 0.09],
    [0.25, 0.135],
    [0.6, 0.12],
    [0.85, 0.06],
    [1, 0.0],
  ];
  const beardZ = [
    [0, 0.07],
    [0.3, 0.085],
    [0.7, 0.07],
    [1, 0.0],
  ];
  const beard = b.sweep(
    catmull([
      [0, 0.8, 0.075],
      [0, 0.72, 0.13],
      [0, 0.6, 0.185],
      [0, 0.45, 0.205],
    ]),
    (t) => [pl(beardX, t), pl(beardZ, t)],
    { color: beardPaint, sides: 8, smooth: false, caps: { start: "flat", end: "point" }, bone: head },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.12, 0.9, -0.01],
        [s * 0.135, 0.84, 0.04],
        [s * 0.105, 0.785, 0.115],
        [s * 0.05, 0.765, 0.16],
      ]),
      [0.035, 0.03],
      { color: BEARD, sides: 6, smooth: false, bone: head },
    );
  }
  // locks of beard
  const beardSkin = b.surface(beard);
  [
    [-0.075, 0.74, 0.7],
    [-0.035, 0.7, 1.0],
    [0.0, 0.66, 1.3],
    [0.04, 0.7, 1.0],
    [0.078, 0.74, 0.75],
  ].forEach(([x, y, k]) => {
    const hit = beardSkin.nearest([x, y, 0.6]);
    b.extrude(
      [
        [0, 0],
        [0.034 * k, -0.025],
        [0.036 * k, -0.12 * k],
        [0, -0.21 * k, "sharp"],
        [-0.036 * k, -0.12 * k],
        [-0.034 * k, -0.025],
      ],
      {
        at: hit.at.clone().add(V(0, 0, 0.004)),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.005,
        smoothing: 1,
        color: gradient(BEARD, BEARD_S, [0, y, 0], [0, y - 0.2, 0]),
        bone: head,
      },
    );
  });
  // beard bead and ring
  P(sph(0.018, 6, 4), BRASS, { bone: head, at: [0, 0.505, 0.22] });
  P(cyl(0.024, 0.024, 0.012, 8), BRASS_D, { bone: head, at: [0, 0.49, 0.222], dir: [0, 1, 0] });

  // eyes
  for (const s of [1, -1]) {
    const eye = S(sph(0.034, 8, 6).scale(1, 0.8, 1), WHITE, face.nearest([s * 0.063, 0.905, 0.4]), { embed: 0.35 });
    const pupil = S(sph(0.02, 6, 5).scale(1, 0.7, 1), DARK, b.surface(eye).nearest([s * 0.05, 0.9, 0.5]), { embed: 0.25 });
    S(sph(0.008, 4, 3), WHITE, b.surface(pupil).nearest([s * 0.04, 0.925, 0.6]), { embed: 0.2 });
    // lid line
    b.sweep(
      catmull([
        [s * 0.098, 0.91, 0.15],
        [s * 0.063, 0.936, 0.19],
        [s * 0.03, 0.915, 0.188],
      ]),
      0.005,
      { color: SKIN_D, sides: 4, bone: head },
    );
    // brows
    b.sweep(
      catmull([
        [s * 0.108, 0.935, 0.135],
        [s * 0.075, 0.955, 0.17],
        [s * 0.03, 0.94, 0.19],
      ]),
      [0.01, 0.021, 0.011],
      { color: BEARD, sides: 5, smooth: false, bone: head },
    );
    // cheeks and freckles
    S(cyl(0.03, 0.03, 0.012, 7), BLUSH, face.nearest([s * 0.108, 0.86, 0.4]), { embed: 0.5 });
    for (const [fx, fy] of [
      [0.075, 0.845],
      [0.095, 0.835],
      [0.115, 0.85],
    ])
      S(cyl(0.006, 0.006, 0.006, 5), SKIN_D, face.nearest([s * fx, fy, 0.4]), { embed: 0.3 });
    // ears
    const out = V(s, 0, -0.25);
    b.extrude(
      [
        [0, -0.045],
        [0.07, -0.05],
        [0.135, 0.06, "sharp"],
        [0.06, 0.045],
        [0, 0.045],
      ],
      {
        at: [s * 0.14, 0.885, 0.015],
        x: out,
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.004,
        smoothing: 1,
        color: SKIN,
        bone: head,
      },
    );
    b.extrude(
      [
        [0.012, -0.024],
        [0.06, -0.03],
        [0.105, 0.04, "sharp"],
        [0.052, 0.03],
        [0.012, 0.024],
      ],
      {
        at: [s * 0.142, 0.887, 0.015],
        x: out,
        y: [0, 1, 0],
        thickness: 0.021,
        smoothing: 1,
        color: NOSE,
        bone: head,
      },
    );
    // mustache
    b.sweep(
      catmull([
        [s * 0.006, 0.848, 0.205],
        [s * 0.06, 0.836, 0.2],
        [s * 0.118, 0.846, 0.165],
        [s * 0.145, 0.88, 0.115],
      ]),
      [0.03, 0.028, 0.016, 0.005],
      { color: BEARD, sides: 6, smooth: false, bone: head },
    );
    S(cyl(0.012, 0.012, 0.006, 5), BEARD_S, b.surface(beard).nearest([s * 0.05, 0.62, 0.4]), { embed: 0.0 });
  }
  // pencil behind the right ear
  b.rod([-0.135, 0.93, -0.03], [-0.19, 0.99, 0.09], 0.009, PENCIL, { sides: 6, bone: head });
  b.spike([-0.19, 0.99, 0.09], [-0.5, 0.6, 0.9], 0.026, 0.009, { color: CREAM, sides: 6, bone: head });
  b.spike([-0.2, 1.0, 0.11], [-0.5, 0.6, 0.9], 0.012, 0.004, { color: DARK, sides: 6, bone: head });

  // nose
  const nose = S(new THREE.IcosahedronGeometry(0.052, 1).scale(1, 0.9, 1.1), NOSE, face.nearest([0, 0.875, 0.5]), {
    embed: 0.45,
  });
  S(sph(0.014, 4, 3), "#ffb3a8", b.surface(nose).nearest([0.02, 0.915, 0.6]), { embed: 0.2 });

  // mouth (on the beard top), lip and teeth
  const mouth = S(sph(0.04, 7, 5).scale(1.4, 0.45, 0.7), MOUTH, beardSkin.nearest([0, 0.795, 0.5]), { embed: 0.35 });
  S(sph(0.022, 5, 4).scale(1.2, 0.4, 0.8), NOSE, b.surface(mouth).nearest([0, 0.78, 0.5]), { embed: 0.2 });
  for (const x of [-0.011, 0.011])
    S(box(0.019, 0.01, 0.02), WHITE, b.surface(mouth).nearest([x, 0.825, 0.5]), { embed: 0.3 });
  P(sph(0.065, 7, 5), SKIN, { bone: jaw, at: [0, 0.79, 0.105], scale: [1, 0.7, 0.9] });
  P(sph(0.026, 5, 4), SKIN_D, { bone: jaw, at: [0, 0.783, 0.16], scale: [1.6, 0.5, 0.8] });

  // ------------------------------------------------------------------------------------------------------------
  // Hat
  const hatPath = catmull([
    [0, 0.975, 0.0],
    [0, 1.085, -0.01],
    [0, 1.195, -0.06],
    [0, 1.27, -0.17],
    [0, 1.265, -0.3],
  ]);
  const hatChain = b.chain("hat", hatPath, { parent: head, names: ["hat1", "hat2", "hat3", "hat4"] });
  const hatPaint = mottle(HAT, HAT_D, { size: 0.09, contrast: 0.6, seed: 12 });
  const hat = b.sweep(hatChain, [0.175, 0.13, 0.09, 0.05, 0.0], {
    color: hatPaint,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "point" },
  });
  const hatSkin = b.surface(hat);
  P(sph(0.026, 6, 4), BRASS, { bone: hatChain.joints[3], at: [0, 1.265, -0.305] });
  P(cyl(0.012, 0.012, 0.012, 6), BRASS_D, { bone: hatChain.joints[3], at: [0, 1.28, -0.3] });
  // hat band
  const bandLoop = hatSkin.loop([0, 1.0, 0], { lift: 0.008 });
  b.sweep(bandLoop, 0.016, { color: LEATHER_D, sides: 6, smooth: false, bone: hatChain.joints[0] });
  const hatBuckle = S(box(0.052, 0.014, 0.046), BRASS, hatSkin.nearest([0, 1.0, 0.5]), { embed: 0.3 });
  S(box(0.03, 0.016, 0.024), LEATHER_D, b.surface(hatBuckle).nearest([0, 1.0, 0.6]), { embed: 0.3 });
  b.decal(hat, patchSvg, { at: [-0.1, 1.07, 0.07], dir: [-0.7, 0.2, 0.65], size: [0.075, 0.075], segments: 6 });
  // goggles on the hat front
  const gogHits = [1, -1].map((s) => hatSkin.nearest([s * 0.058, 1.05, 0.5]));
  gogHits.forEach((hit) => {
    const rim = S(cyl(0.045, 0.045, 0.024, 8), BRASS, hit, { embed: 0.3 });
    S(cyl(0.038, 0.038, 0.01, 8), BRASS_D, b.surface(rim).nearest(hit.at.clone().add(hit.n.clone().multiplyScalar(0.3))), { embed: 0.2 });
    glow(S(cyl(0.031, 0.031, 0.012, 8), GLASS, b.surface(rim).nearest(hit.at.clone().add(hit.n.clone().multiplyScalar(0.4))), { embed: 0.2 }));
  });
  b.rod(gogHits[0].at, gogHits[1].at, 0.01, BRASS_D, { sides: 6, bone: hatChain.joints[0] });

  // ------------------------------------------------------------------------------------------------------------
  // Backpack
  const pack = [0, 0.6, -0.27];
  const packOutline: OutlinePoint[] = [
    [-0.2, -0.17],
    [0.2, -0.17],
    [0.225, 0.05],
    [0.17, 0.17],
    [-0.17, 0.17],
    [-0.225, 0.05],
  ];
  b.extrude(packOutline, {
    at: pack,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.18,
    bevel: 0.025,
    smoothing: 1,
    bone: chest,
    color: grain(LEATHER, LEATHER_D, { size: 0.025, axis: "y", seed: 2 }),
  });
  // rivets round the back face
  {
    const inset = packOutline.map(([x, y]) => [x * 0.86, y * 0.86]);
    const pts: Pts = [];
    for (let i = 0; i < inset.length; i++) {
      const a = inset[i];
      const c = inset[(i + 1) % inset.length];
      const n = Math.max(2, Math.round(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.05));
      for (let k = 0; k < n; k++) pts.push([a[0] + ((c[0] - a[0]) * k) / n, pack[1] + a[1] + ((c[1] - a[1]) * k) / n, -0.362]);
    }
    studs(pts, 0.0065, BRASS, chest);
  }
  // lid: hinged at the front-top edge, folding over the top and down the back
  const lid = b.joint("packLid", { parent: chest, at: [0, 0.78, -0.185], aim: [0, 0.78, -0.375], role: "hinge" });
  b.extrude(
    [
      [0, -0.2],
      [0.17, -0.2],
      [0.19, -0.18],
      [0.19, 0.18],
      [0.17, 0.2],
      [0, 0.2],
    ],
    { at: [0, 0.78, -0.185], x: [0, 0, -1], y: [1, 0, 0], thickness: 0.03, bevel: 0.008, smoothing: 1, color: grain(LEATHER_L, LEATHER, { size: 0.025, axis: "x", seed: 3 }), bone: lid },
  );
  b.extrude(
    [
      [-0.205, 0.085],
      [0.205, 0.085],
      [0.205, -0.04],
      [0.12, -0.087],
      [-0.12, -0.087],
      [-0.205, -0.04],
    ],
    {
      at: [0, 0.7, -0.375],
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      color: grain(LEATHER_L, LEATHER, { size: 0.025, axis: "y", seed: 4 }),
      bone: lid,
    },
  );
  for (const x of [-0.125, 0.125]) {
    P(box(0.036, 0.15, 0.012), LEATHER_D, { bone: lid, at: [x, 0.695, -0.396] });
    P(box(0.058, 0.04, 0.014), BRASS, { bone: lid, at: [x, 0.65, -0.4] });
    P(box(0.03, 0.02, 0.018), LEATHER_D, { bone: lid, at: [x, 0.65, -0.402] });
  }
  studs(
    [-0.16, -0.09, 0.09, 0.16].map((x) => [x, 0.76, -0.397]),
    0.007,
    BRASS,
    lid,
  );
  // wind-up key
  const key = b.joint("windKey", { parent: lid, at: [0, 0.71, -0.4], aim: [0, 0.71, -0.5], role: "hinge" });
  P(cyl(0.009, 0.009, 0.04, 6), BRASS_D, { bone: key, at: [0, 0.71, -0.42], dir: [0, 0, -1] });
  const bow: OutlinePoint[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 0.034 * (1 + 0.35 * Math.cos(2 * a));
    bow.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.extrude(bow, { at: [0, 0.71, -0.445], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: BRASS, bone: key });
  P(cyl(0.008, 0.008, 0.015, 6), DARK, { bone: key, at: [0, 0.71, -0.452], dir: [0, 0, -1] });
  // gauge
  {
    const g = [-0.09, 0.53, -0.372];
    P(cyl(0.064, 0.064, 0.03, 10), BRASS, { bone: chest, at: g, dir: [0, 0, -1] });
    P(cyl(0.058, 0.058, 0.008, 10), BRASS_D, { bone: chest, at: [g[0], g[1], g[2] - 0.014], dir: [0, 0, -1] });
    P(new THREE.CircleGeometry(0.052, 12), "#ffffff", {
      bone: chest,
      at: [g[0], g[1], g[2] - 0.0205],
      dir: [0, 0, -1],
      axis: "z",
      texture: gaugeSvg,
    });
    studs(
      [0, 1, 2, 3, 4, 5].map((i) => [g[0] + Math.cos(i * 1.047) * 0.058, g[1] + Math.sin(i * 1.047) * 0.058, g[2] - 0.019]),
      0.005,
      STEEL_D,
      chest,
    );
    b.sweep(
      polyline([
        [g[0], g[1] - 0.06, -0.378],
        [g[0], 0.455, -0.383],
      ]),
      0.012,
      { color: COPPER, sides: 6, bone: chest },
    );
    P(cyl(0.02, 0.02, 0.014, 8), COPPER, { bone: chest, at: [g[0], 0.445, -0.386], dir: [0, 0, -1] });
    P(cyl(0.03, 0.03, 0.006, 8), RED, { bone: chest, at: [g[0], 0.445, -0.399], dir: [0, 0, -1] });
    P(box(0.06, 0.008, 0.008), RED, { bone: chest, at: [g[0], 0.445, -0.404] });
    P(box(0.008, 0.06, 0.008), RED, { bone: chest, at: [g[0], 0.445, -0.404] });
  }
  // cogs
  const cog = (name: string, c: number[], teeth: number, ro: number, ri: number, col: Fill) => {
    const j = b.joint(name, { parent: chest, at: [c[0], c[1], -0.362], aim: [c[0], c[1], -0.5], role: "hinge" });
    b.extrude(gearOutline(teeth, ro, ri), { at: [c[0], c[1], -0.368], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.003, color: col, bone: j });
    P(cyl(ri * 0.35, ri * 0.35, 0.01, 8), DARK, { bone: j, at: [c[0], c[1], -0.382], dir: [0, 0, -1] });
    P(cyl(ri * 0.16, ri * 0.16, 0.014, 6), STEEL, { bone: j, at: [c[0], c[1], -0.384], dir: [0, 0, -1] });
    return j;
  };
  cog("cogBig", [0.08, 0.54], 10, 0.075, 0.06, BRASS);
  cog("cogSmall", [0.17, 0.472], 7, 0.047, 0.037, COPPER);
  // decals
  P(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", { bone: chest, at: [-0.165, 0.49, -0.3635], dir: [0, 0, -1], axis: "z", texture: patchSvg });
  P(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", { bone: chest, at: [0.03, 0.465, -0.3635], dir: [0, 0, -1], axis: "z", texture: badgeSvg });
  P(new THREE.PlaneGeometry(0.075, 0.05), "#ffffff", { bone: chest, at: [0.0, 0.5, -0.3635], dir: [0, 0, -1], axis: "z", texture: tagSvg, rotation: [0, 0, 0] });

  // bedroll under the pack
  {
    const roll = b.rod([-0.235, 0.4, -0.31], [0.235, 0.4, -0.31], 0.062, TEAL, { sides: 8, bone: chest });
    void roll;
    for (const s of [1, -1])
      P(cyl(0.056, 0.056, 0.01, 8), "#ffffff", { bone: chest, at: [s * 0.241, 0.4, -0.31], dir: [s, 0, 0], texture: swirlSvg });
    for (const x of [-0.12, 0.12]) {
      P(cyl(0.067, 0.067, 0.026, 8), LEATHER_D, { bone: chest, at: [x, 0.4, -0.31], dir: [1, 0, 0] });
      P(box(0.03, 0.03, 0.012), BRASS, { bone: chest, at: [x, 0.4, -0.375] });
    }
  }

  // left side pouch with tools
  {
    const c = [0.248, 0.555, -0.27];
    P(box(0.075, 0.14, 0.14), LEATHER, { bone: chest, at: c });
    P(box(0.082, 0.05, 0.148), LEATHER_D, { bone: chest, at: [c[0], c[1] + 0.055, c[2]] });
    P(sph(0.011, 5, 4), BRASS, { bone: chest, at: [c[0] + 0.039, c[1] + 0.04, c[2]] });
    tool([c[0], c[1] + 0.07, c[2] + 0.03], [0.1, 1, 0.1], 0.05, 0.06, TEAL, chest);
    tool([c[0], c[1] + 0.07, c[2]], [0.0, 1, 0.0], 0.05, 0.07, RED, chest);
    tool([c[0], c[1] + 0.07, c[2] - 0.03], [-0.1, 1, -0.1], 0.05, 0.055, PENCIL, chest);
  }
  // wrench strapped to the right side
  {
    const wrenchOutline: OutlinePoint[] = [
      [-0.014, 0],
      [0.014, 0],
      [0.016, 0.3],
      [0.046, 0.34],
      [0.052, 0.42],
      [0.034, 0.46],
      [0.014, 0.455],
      [0.014, 0.4],
      [-0.014, 0.4],
      [-0.014, 0.455],
      [-0.034, 0.46],
      [-0.052, 0.42],
      [-0.046, 0.34],
      [-0.016, 0.3],
    ];
    b.extrude(wrenchOutline, {
      at: [-0.252, 0.42, -0.27],
      x: [0, 0, 1],
      y: [-0.12, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      bone: chest,
      color: paint((_p, _n, s) => (s[1] < 0.14 ? RED : s[1] < 0.16 ? STEEL_D : STEEL)),
    });
    for (const y of [0.5, 0.68]) {
      P(cyl(0.028, 0.028, 0.03, 8), LEATHER_D, { bone: chest, at: [-0.255 + (y - 0.42) * -0.12 * 0.0, y, -0.27], dir: [0, 1, 0] });
      P(box(0.012, 0.03, 0.058), BRASS, { bone: chest, at: [-0.28 - (y - 0.5) * 0.05, y, -0.27] });
    }
  }
  // lantern hanging bottom left
  {
    const hookP = catmull([
      [0.215, 0.5, -0.27],
      [0.25, 0.525, -0.27],
      [0.305, 0.51, -0.27],
      [0.315, 0.465, -0.27],
    ]);
    b.sweep(hookP, 0.007, { color: BRASS_D, sides: 5, bone: chest });
    const lc = [0.315, 0.39, -0.27];
    P(cyl(0.012, 0.042, 0.04, 6), BRASS_D, { bone: chest, at: [lc[0], lc[1] + 0.056, lc[2]] });
    P(sph(0.016, 5, 4), BRASS, { bone: chest, at: [lc[0], lc[1] + 0.082, lc[2]] });
    glow(P(cyl(0.034, 0.034, 0.08, 6), AMBER, { bone: chest, at: lc }), 1.3);
    glow(P(sph(0.02, 5, 4), "#fff4c0", { bone: chest, at: lc }), 1.6);
    P(cyl(0.04, 0.032, 0.022, 6), BRASS_D, { bone: chest, at: [lc[0], lc[1] - 0.05, lc[2]] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      P(box(0.006, 0.084, 0.006), BRASS, { bone: chest, at: [lc[0] + Math.cos(a) * 0.036, lc[1], lc[2] + Math.sin(a) * 0.036] });
    }
  }
  // kettle hanging bottom right
  {
    const kc = [-0.31, 0.355, -0.27];
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.064, 0.03],
        [0.052, 0.072],
        [0.03, 0.092],
        [0, 0.098],
      ],
      { at: [kc[0], kc[1] - 0.045, kc[2]], bone: chest, segments: 8, color: gradient(COPPER, "#a8532a", [0, 0.4, 0], [0, 0.3, 0]) },
    );
    P(cyl(0.012, 0.03, 0.025, 8), COPPER, { bone: chest, at: [kc[0], kc[1] + 0.06, kc[2]] });
    P(sph(0.013, 5, 4), BRASS, { bone: chest, at: [kc[0], kc[1] + 0.082, kc[2]] });
    b.sweep(
      catmull([
        [kc[0] - 0.045, kc[1] - 0.025, kc[2]],
        [kc[0] - 0.09, kc[1] + 0.0, kc[2]],
        [kc[0] - 0.115, kc[1] + 0.04, kc[2]],
      ]),
      [0.018, 0.008],
      { color: COPPER, sides: 6, bone: chest, caps: "flat" },
    );
    b.sweep(
      catmull([
        [kc[0] - 0.055, kc[1] + 0.0, kc[2]],
        [kc[0] - 0.02, kc[1] + 0.105, kc[2]],
        [kc[0] + 0.02, kc[1] + 0.105, kc[2]],
        [kc[0] + 0.055, kc[1] + 0.0, kc[2]],
      ]),
      0.006,
      { color: BOOT_D, sides: 5, bone: chest },
    );
    b.sweep(
      catmull([
        [-0.215, 0.47, -0.27],
        [-0.25, 0.5, -0.27],
        [kc[0], kc[1] + 0.1, kc[2]],
      ]),
      0.006,
      { color: BRASS_D, sides: 5, bone: chest },
    );
  }
  // spyglass on the upper left
  {
    const A = V(0.15, 0.72, -0.33);
    const D = V(0.45, 0.8, 0.25).normalize();
    const at = (k: number) => addv(A.toArray(), D, k);
    b.rod(at(0), at(0.14), 0.036, LEATHER_D, { sides: 8, bone: chest, caps: "flat" });
    b.rod(at(0.14), at(0.28), 0.03, BRASS, { sides: 8, bone: chest, caps: "flat" });
    b.rod(at(0.28), at(0.4), 0.024, BRASS_D, { sides: 8, bone: chest, caps: "flat" });
    for (const k of [0.0, 0.14, 0.28, 0.4]) P(cyl(0.04 - k * 0.02, 0.04 - k * 0.02, 0.014, 8), STEEL_D, { bone: chest, at: at(k), dir: D.toArray() });
    glow(P(cyl(0.021, 0.021, 0.012, 8), GLASS, { bone: chest, at: at(0.405), dir: D.toArray() }));
    for (const k of [0.045, 0.1]) P(cyl(0.045, 0.045, 0.024, 8), LEATHER, { bone: chest, at: at(k), dir: D.toArray() });
    P(box(0.03, 0.03, 0.02), BRASS, { bone: chest, at: [0.12, 0.73, -0.355] });
  }
  // antenna with coil and dish on the upper right
  {
    const B = V(-0.13, 0.79, -0.3);
    const m = V(-0.22, 1, 0.06).normalize();
    const T = addv(B.toArray(), m, 0.32);
    b.rod(B, T, 0.008, STEEL, { sides: 5, bone: chest, caps: "round" });
    P(cyl(0.022, 0.03, 0.025, 8), STEEL_D, { bone: chest, at: B.toArray() });
    const perp = m.clone().cross(V(0, 0, 1)).normalize().multiplyScalar(0.03);
    const c0 = addv(B.toArray(), m, 0.07);
    const coil = spiral(c0, addv(c0, perp, 1), m, { turns: 6, r1: 0.03, pitch: 0.032 });
    b.sweep(coil, 0.0055, { color: COPPER, sides: 4, bone: chest });
    const dishDir = V(m.x * 0.5, m.y, m.z - 0.7).normalize();
    b.lathe(
      [
        [0, 0],
        [0.058, 0.032],
        [0.06, 0.037],
        [0, 0.01],
      ],
      { at: addv(T, m, 0.01), axis: dishDir.toArray(), bone: chest, segments: 8, color: BRASS },
    );
    P(sph(0.012, 5, 4), RED, { bone: chest, at: addv(T, dishDir, 0.04) });
    b.rod(addv(T, m, 0.01), addv(T, dishDir, 0.04), 0.004, STEEL, { sides: 4, bone: chest });
  }
  // propeller
  {
    const hub = [0, 0.925, -0.27];
    b.rod([0, 0.79, -0.27], hub, 0.013, STEEL, { sides: 6, bone: chest });
    P(cyl(0.03, 0.03, 0.014, 8), BRASS_D, { bone: chest, at: [0, 0.795, -0.27] });
    const prop = b.joint("propeller", { parent: chest, at: hub, dir: [0, 1, 0], role: "hinge" });
    P(sph(0.026, 6, 4), BRASS, { bone: prop, at: [0, 0.93, -0.27] });
    P(cone(0.012, 0.03), BRASS_D, { bone: prop, at: [0, 0.96, -0.27] });
    for (let k = 0; k < 3; k++) {
      const a = (-90 + k * 120) * (Math.PI / 180);
      const d = V(Math.cos(a), 0, Math.sin(a));
      const p = V(-Math.sin(a), 0, Math.cos(a));
      const tilt = 0.3;
      const y = p.clone().multiplyScalar(Math.cos(tilt)).add(V(0, Math.sin(tilt), 0));
      b.extrude(
        [
          [0, -0.014],
          [0.05, -0.024],
          [0.12, -0.03],
          [0.14, 0, "sharp"],
          [0.12, 0.03],
          [0.05, 0.024],
          [0, 0.014],
        ],
        { at: [0 + d.x * 0.012, 0.93, -0.27 + d.z * 0.012], x: d, y, thickness: 0.006, smoothing: 1, color: paint((_p, _n, s) => (s[0] > 0.1 ? RED : CREAM)), bone: prop },
      );
    }
  }
  // megaphone horn
  b.lathe(
    [
      [0.008, 0],
      [0.011, 0.02],
      [0.05, 0.085],
      [0.053, 0.088],
      [0.015, 0.016],
      [0.01, -0.002],
    ],
    { at: [0.05, 0.795, -0.3], axis: [0.35, 0.45, -1], bone: chest, segments: 8, color: BRASS_D },
  );

  return b.root;

  function cone(r: number, h: number) {
    return new THREE.ConeGeometry(r, h, 6);
  }
}
