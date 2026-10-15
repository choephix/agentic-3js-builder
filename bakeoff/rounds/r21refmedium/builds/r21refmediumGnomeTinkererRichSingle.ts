import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill, JointRef } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { grain, mottle } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, spiral } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A stout gnome inventor in a floppy red hat with goggles, a huge white beard and a trunk-sized backpack bristling with gadgets: boiler, chimney, gears, clock, lantern, potion, scroll and a spinning propeller.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// ---- palette -------------------------------------------------------------------------------------------------
const SKIN = "#eaa585";
const SKIN_D = "#d98f6e";
const NOSE = "#e8907c";
const CHEEK = "#f08a84";
const BEARD = "#f1ecdf";
const BEARD_D = "#cfc6b0";
const HAIR = "#ece6d6";
const HAT = "#c3463b";
const HAT_D = "#8f2f2d";
const LEATHER = "#8a5a33";
const LEATHER_D = "#5a371e";
const LEATHER_L = "#b07a46";
const TUNIC = "#a8743d";
const TUNIC_D = "#8a5c2e";
const SHIRT = "#e8dcb8";
const SHIRT_D = "#cdbf97";
const PANTS = "#6f7a3c";
const PANTS_D = "#58632e";
const BRASS = "#d1a23a";
const BRASS_D = "#8f6a22";
const COPPER = "#c0693a";
const STEEL = "#aab4bc";
const STEEL_D = "#6f7a84";
const TEAL = "#38d6b4";
const AMBER = "#ffb347";
const LENS = "#69b8ff";
const PURPLE = "#c36bdc";
const PARCH = "#e9d9aa";
const WOOD = "#9a6a3a";
const WOOD_D = "#6e4624";
const INK = "#2a1a12";
const WHITE = "#ffffff";
const RED = "#d83c3c";
const MOUTH = "#7a2d2d";
const PUFF = "#e4e8ea";

// ---- drawings --------------------------------------------------------------------------------------------------
const polar = (r: number, deg: number) => [50 + r * Math.sin((deg * Math.PI) / 180), 50 - r * Math.cos((deg * Math.PI) / 180)];
const line = (a: number[], c: number[], w: number, col: string) =>
  `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
const arcPath = (a0: number, a1: number, r: number, col: string) => {
  const p0 = polar(r, a0);
  const p1 = polar(r, a1);
  return `<path d="M${p0[0]} ${p0[1]} A${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}" stroke="${col}" stroke-width="9" fill="none"/>`;
};

const clockTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#f3ead2"/><circle cx="50" cy="50" r="47" fill="none" stroke="#6b4a1e" stroke-width="4"/>${Array.from(
    { length: 12 },
    (_, i) => line(polar(35, i * 30), polar(43, i * 30), i % 3 === 0 ? 6 : 3.5, "#4a2f14"),
  ).join("")}${line([50, 50], polar(24, 300), 5, "#2a1a12")}${line([50, 50], polar(34, 60), 4, "#2a1a12")}${line([50, 50], polar(36, 190), 2.5, "#c0392b")}<circle cx="50" cy="50" r="5" fill="#8f6a22"/></svg>`,
  { size: 256 },
);

const gaugeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#efe6cf"/>${arcPath(-120, -40, 36, "#3aa655")}${arcPath(-40, 40, 36, "#e5c13a")}${arcPath(40, 120, 36, "#d9473b")}${Array.from(
    { length: 9 },
    (_, i) => line(polar(24, -120 + i * 30), polar(29, -120 + i * 30), 3.5, "#2a1a12"),
  ).join("")}${line([50, 50], polar(30, 35), 4, "#2a1a12")}<circle cx="50" cy="50" r="5" fill="#2a1a12"/></svg>`,
  { size: 256 },
);

const patchTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="12" fill="#d9b054"/><rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="#5b3a1a" stroke-width="4" stroke-dasharray="9 7"/><circle cx="50" cy="50" r="24" fill="none" stroke="#5b3a1a" stroke-width="12" stroke-dasharray="7 6.2"/><circle cx="50" cy="50" r="19" fill="none" stroke="#5b3a1a" stroke-width="5"/><circle cx="50" cy="50" r="7" fill="#5b3a1a"/></svg>`,
  { size: 192 },
);

// ---- shapes ----------------------------------------------------------------------------------------------------
function gearOutline(rIn: number, rOut: number, teeth: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  const step = (Math.PI * 2) / teeth;
  const pol = (r: number, a: number): OutlinePoint => [r * Math.cos(a), r * Math.sin(a)];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    pts.push(pol(rIn, a), pol(rOut, a + 0.14 * step), pol(rOut, a + 0.36 * step), pol(rIn, a + 0.5 * step));
  }
  return pts;
}

const wrenchOutline: OutlinePoint[] = [
  [-0.012, 0],
  [0.012, 0],
  [0.012, 0.09],
  [0.028, 0.105],
  [0.028, 0.145],
  [0.01, 0.16],
  [0, 0.128],
  [-0.01, 0.16],
  [-0.028, 0.145],
  [-0.028, 0.105],
  [-0.012, 0.09],
];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });
  const rnd = rng(11);

  const put = (
    bone: JointRef,
    geo: THREE.BufferGeometry,
    color: Fill,
    at: THREE.Vector3 | number[],
    o: PartOptions = {},
  ) => b.part(geo, color, { bone, at, flat: true, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const ball = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);
  const torus = (r: number, t: number, seg = 10) => new THREE.TorusGeometry(r, t, 4, seg);

  // paints
  const leather = mottle(LEATHER, LEATHER_D, { size: 0.06, seed: 3 });
  const leatherL = mottle(LEATHER_L, LEATHER, { size: 0.05, seed: 4 });
  const leatherD = mottle(LEATHER_D, "#47291a", { size: 0.04, seed: 8 });
  const tunic = mottle(TUNIC, TUNIC_D, { size: 0.08, seed: 5 });
  const shirt = mottle(SHIRT, SHIRT_D, { size: 0.05, seed: 6 });
  const pants = mottle(PANTS, PANTS_D, { size: 0.06, seed: 7 });
  const woodPaint = grain(WOOD, WOOD_D, { size: 0.015, axis: "y", seed: 2 });
  const hatPaint = mottle(HAT, HAT_D, { size: 0.07, seed: 9, contrast: 0.7 });
  const skinPaint = mottle(SKIN, SKIN_D, { size: 0.04, seed: 12, contrast: 0.5 });
  const beardPaint = grain(BEARD, BEARD_D, { size: 0.012, axis: "y", seed: 13 });
  const brassPaint = mottle(BRASS, BRASS_D, { size: 0.03, seed: 14, contrast: 0.6 });

  // ---- skeleton --------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.44, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.44, 0],
      [0, 0.6, 0.01],
      [0, 0.76, 0.02],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  b.chain(
    "neck",
    [
      [0, 0.76, 0.02],
      [0, 0.85, 0.04],
    ],
    { parent: "chest", names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: "neck", at: [0, 0.85, 0.04], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.92, 0.09], aim: [0, 0.9, 0.2], role: "jaw" });
  const pack = b.joint("pack", { parent: "chest", at: [0, 0.68, -0.2], aim: [0, 0.9, -0.2] });
  const lid = b.joint("packLid", { parent: pack, at: [0, 0.885, -0.32], aim: [0, 0.885, -0.12], role: "hinge" });
  const gear1 = b.joint("gear1", { parent: pack, at: [0.07, 0.66, -0.33], aim: [0.07, 0.66, -0.5], role: "hinge" });
  const gear2 = b.joint("gear2", { parent: pack, at: [0, 0.77, -0.318], aim: [0, 0.77, -0.5], role: "hinge" });
  const prop = b.joint("propeller", { parent: pack, at: [0, 1.0, -0.31], dir: [0, 1, 0], role: "hinge" });

  // hat: a floppy chain
  const hatPts = [V(0, 1.05, 0.02), V(0, 1.12, 0.0), V(0, 1.2, -0.06), V(0, 1.24, -0.19)];
  const hatPath = catmull(hatPts);
  const hat = b.chain("hat", hatPath, { parent: head, names: ["hat1", "hat2", "hat3"], role: "tail" });

  // ---- legs & boots ----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      [V(s * 0.09, 0.44, 0), V(s * 0.095, 0.27, 0.02), V(s * 0.09, 0.09, 0.01)],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, [0.092, 0.086, 0.07], { color: pants, sides: 8 });
    const toe = b.joint(`toe${S}`, {
      parent: `ankle${S}`,
      at: [s * 0.09, 0.05, 0.09],
      aim: [s * 0.09, 0.045, 0.18],
      role: "hinge",
    });
    const ankle = `ankle${S}`;
    put(ankle, cyl(0.075, 0.068, 0.17, 8), leather, [s * 0.09, 0.165, 0.01]);
    put(ankle, cyl(0.086, 0.078, 0.045, 8), leatherL, [s * 0.09, 0.248, 0.01]);
    put(ankle, torus(0.075, 0.009), leatherD, [s * 0.09, 0.16, 0.01], { rotation: [90, 0, 0] });
    put(ankle, box(0.03, 0.03, 0.012), BRASS, [s * 0.09, 0.16, 0.088]);
    put(ankle, box(0.016, 0.016, 0.014), INK, [s * 0.09, 0.16, 0.089]);
    put(ankle, box(0.15, 0.025, 0.3), INK, [s * 0.09, 0.0125, 0.045]);
    put(ankle, box(0.05, 0.03, 0.04), LEATHER_D, [s * 0.09, 0.04, -0.06]);
    put(toe, ball(0.075), leather, [s * 0.09, 0.052, 0.07], { scale: [1, 0.7, 1.55] });
    put(toe, ball(0.04), leatherL, [s * 0.09, 0.055, 0.16], { scale: [1.1, 0.7, 0.8] });
    for (const k of [-1, 1]) put(ankle, ball(0.009, 6, 4), BRASS, [s * 0.09 + k * 0.045, 0.2, 0.065]);
    put(ankle, ball(0.01, 6, 4), BRASS, [s * 0.09, 0.248, 0.095]);
    for (let i = 0; i < 3; i++)
      put(toe, box(0.05, 0.006, 0.008), PARCH, [s * 0.09, 0.098 - i * 0.0, 0.105 + i * 0.02], {
        rotation: [-35, 0, 0],
      });
  }

  // ---- torso -----------------------------------------------------------------------------------------------------
  const torso = b.sweep(spine, [0.145, 0.16, 0.115], { color: tunic, sides: 10 });
  put(hips, cyl(0.17, 0.22, 0.2, 10), tunic, [0, 0.39, 0]);
  put(hips, torus(0.222, 0.012, 12), BRASS, [0, 0.292, 0], { rotation: [90, 0, 0] });
  put(hips, cyl(0.172, 0.172, 0.05, 12), leatherD, [0, 0.515, 0]);
  put(hips, box(0.075, 0.058, 0.014), BRASS, [0, 0.515, 0.18]);
  put(hips, box(0.045, 0.03, 0.014), INK, [0, 0.515, 0.188]);
  put(hips, box(0.012, 0.03, 0.016), BRASS, [0, 0.515, 0.19]);
  for (const s of [1, -1]) {
    put(hips, box(0.125, 0.19, 0.016), leatherL, [s * 0.075, 0.385, 0.21], { rotation: [-14, 0, 0] });
    put(hips, box(0.125, 0.012, 0.02), BRASS, [s * 0.075, 0.298, 0.23], { rotation: [-14, 0, 0] });
    put(hips, ball(0.011, 6, 4), BRASS, [s * 0.075, 0.45, 0.22]);
    put(hips, ball(0.011, 6, 4), BRASS, [s * 0.075, 0.37, 0.24]);
  }
  put("neck", cyl(0.06, 0.07, 0.1, 8), SKIN, [0, 0.83, 0.035]);
  put("neck", cyl(0.085, 0.1, 0.05, 8), shirt, [0, 0.81, 0.035]);

  // bandolier with glowing vials
  const skin = b.surface(torso);
  const band = skin.drape(
    catmull([V(-0.11, 0.8, 0.06), V(-0.08, 0.72, 0.15), V(0, 0.64, 0.18), V(0.09, 0.56, 0.17), V(0.15, 0.5, 0.08)]),
    { lift: 0.012 },
  );
  b.sweep(band, () => [0.02, 0.006], { section: "box", color: leatherD, caps: "flat", bone: "chest" });
  const vialCols = [TEAL, AMBER, PURPLE, TEAL, AMBER];
  let vi = 0;
  b.along(band, 5, (at) => {
    const c = vialCols[vi % vialCols.length];
    vi++;
    glow(put("chest", cyl(0.012, 0.012, 0.05, 6), c, at.at.clone().add(V(0, 0.01, 0.014))), 0.8);
    put("chest", cyl(0.014, 0.014, 0.012, 6), BRASS, at.at.clone().add(V(0, 0.04, 0.014)));
    put("chest", cyl(0.014, 0.014, 0.008, 6), BRASS, at.at.clone().add(V(0, -0.017, 0.014)));
  });

  // pack straps
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.1, 0.82, -0.13],
        [s * 0.13, 0.82, 0.0],
        [s * 0.115, 0.75, 0.12],
        [s * 0.1, 0.62, 0.15],
        [s * 0.12, 0.52, 0.05],
        [s * 0.12, 0.5, -0.12],
      ]),
      () => [0.021, 0.006],
      { section: "box", color: leather, caps: "flat", bone: "chest" },
    );
    put("chest", box(0.04, 0.03, 0.012), BRASS, [s * 0.108, 0.64, 0.158]);
    put("chest", box(0.024, 0.018, 0.014), INK, [s * 0.108, 0.64, 0.16]);
  }

  // ---- arms ------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.17, 0.72, 0);
    const el = V(s * 0.3, 0.59, 0.02);
    const wr = V(s * 0.36, 0.46, 0.09);
    const arm = b.chain(`arm${S}`, [sh, el, wr], {
      parent: "chest",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.072, 0.066, 0.054], { color: shirt, sides: 8 });
    const d = wr.clone().sub(el).normalize();
    const wrist = `wrist${S}`;
    put(`shoulder${S}`, ball(0.085, 8, 6), leatherD, sh.clone().add(V(s * 0.015, 0.03, 0)), { scale: [1, 0.6, 1.05] });
    put(`shoulder${S}`, ball(0.012, 6, 4), BRASS, sh.clone().add(V(s * 0.05, 0.06, 0.02)));
    // cuff
    const cuff = wr.clone().addScaledVector(d, -0.03);
    put(wrist, cyl(0.076, 0.064, 0.065, 8), leatherL, cuff, { dir: d });
    put(wrist, ball(0.01, 6, 4), BRASS, cuff.clone().add(V(s * 0.072, 0, 0)));
    put(wrist, ball(0.01, 6, 4), BRASS, cuff.clone().add(V(0, 0, 0.072)));
    put(wrist, torus(0.07, 0.007, 8), BRASS_D, cuff.clone().addScaledVector(d, 0.03), { dir: d, axis: "z" });
    // hand
    const hc = wr.clone().addScaledVector(d, 0.05);
    put(wrist, ball(0.058), leather, hc, { scale: [1.05, 1, 0.9] });
    const fingers = b.joint(`fingers${S}`, {
      parent: wrist,
      at: hc,
      aim: hc.clone().addScaledVector(d, 0.05),
      role: "digit",
    });
    const dirF = d.clone().add(V(0, 0, 0.35)).normalize();
    for (let i = 0; i < 4; i++) {
      const base = hc
        .clone()
        .addScaledVector(d, 0.05)
        .add(V((i - 1.5) * 0.022, 0, 0.012));
      put(fingers, box(0.021, 0.055, 0.026), leather, base.clone().addScaledVector(dirF, 0.015), { dir: dirF });
      put(fingers, ball(0.014, 6, 4), leatherL, base.clone().addScaledVector(dirF, 0.003));
    }
    const thumb = b.joint(`thumb${S}`, {
      parent: wrist,
      at: hc.clone().add(V(-s * 0.02, 0.02, 0.045)),
      aim: hc.clone().add(V(-s * 0.02, -0.02, 0.075)),
      role: "digit",
    });
    const tdir = V(0, -0.5, 0.6).normalize();
    put(thumb, box(0.025, 0.05, 0.027), leather, hc.clone().add(V(-s * 0.02, 0.0, 0.065)), { dir: tdir });
  }

  // ---- head ------------------------------------------------------------------------------------------------------
  const HC = V(0, 0.97, 0.04);
  const hp = (nx: number, ny: number, nz: number, r: number) => HC.clone().addScaledVector(V(nx, ny, nz).normalize(), r);
  put(head, ball(0.115, 12, 9), skinPaint, HC, { scale: [1.05, 1, 1] });
  put(jaw, ball(0.05, 8, 6), SKIN, [0, 0.915, 0.1], { scale: [1.5, 0.7, 1.4] });
  put(jaw, box(0.05, 0.012, 0.02), MOUTH, [0, 0.925, 0.145]);
  put(head, ball(0.036), NOSE, hp(0, -0.12, 1, 0.15));
  for (const s of [1, -1]) {
    put(head, ball(0.024, 8, 6), WHITE, hp(s * 0.42, 0.3, 0.85, 0.105));
    put(head, ball(0.0135, 6, 4), INK, hp(s * 0.42, 0.3, 0.85, 0.125));
    put(head, ball(0.005, 4, 3), WHITE, hp(s * 0.42, 0.3, 0.85, 0.125).add(V(s * 0.004, 0.006, 0.008)));
    put(head, ball(0.03, 6, 4), CHEEK, hp(s * 0.65, -0.25, 0.72, 0.108), { scale: [1, 0.8, 0.6] });
    put(head, ball(0.055, 7, 5), BEARD, [s * 0.095, 0.93, 0.06]);
    b.sweep(
      catmull([hp(s * 0.1, 0.55, 0.8, 0.118), hp(s * 0.38, 0.6, 0.7, 0.118), hp(s * 0.7, 0.5, 0.5, 0.118)]),
      [0.017, 0.022, 0.01],
      { color: BEARD, sides: 5, bone: head },
    );
    b.sweep(
      catmull([
        hp(s * 0.05, -0.28, 1, 0.125),
        hp(s * 0.35, -0.3, 0.9, 0.128),
        hp(s * 0.6, -0.15, 0.7, 0.125),
        hp(s * 0.75, 0.0, 0.5, 0.125),
      ]),
      [0.024, 0.022, 0.015, 0.008],
      { color: BEARD, sides: 6, bone: head },
    );
    // ears
    const earAt = V(s * 0.108, 0.985, 0.03);
    b.extrude(
      [
        [0, -0.035],
        [0.06, -0.03],
        [0.15, 0.07, "sharp"],
        [0.05, 0.05],
        [0, 0.035],
      ],
      { at: earAt, x: [s, 0, 0], thickness: 0.011, color: SKIN, bone: head },
    );
    b.extrude(
      [
        [0.01, -0.018],
        [0.05, -0.016],
        [0.1, 0.05, "sharp"],
        [0.04, 0.03],
        [0.01, 0.02],
      ],
      { at: earAt.clone().add(V(0, 0, 0)), x: [s, 0, 0], thickness: 0.015, color: NOSE, bone: head },
    );
  }
  // beard
  b.loft(
    [
      { at: [0, 0.94, 0.07], w: 0.24, h: 0.1 },
      { at: [0, 0.86, 0.15], w: 0.26, h: 0.14 },
      { at: [0, 0.75, 0.2], w: 0.22, h: 0.13 },
      { at: [0, 0.64, 0.2], w: 0.14, h: 0.1 },
      { at: [0, 0.55, 0.18], w: 0.05, h: 0.05 },
    ],
    { bone: jaw, color: beardPaint, sides: 8 },
  );
  const locks: Array<[number, number, number, number]> = [
    [-0.07, 0.74, 0.225, -0.03],
    [0.07, 0.74, 0.225, 0.03],
    [-0.04, 0.64, 0.235, -0.015],
    [0.04, 0.64, 0.235, 0.015],
    [-0.1, 0.84, 0.2, -0.04],
    [0.1, 0.84, 0.2, 0.04],
  ];
  for (const [x, y, z, dx] of locks)
    b.spike([x, y, z], [x + dx, y - 0.1, z + 0.02], null, 0.026, { color: BEARD_D, sides: 5, bone: jaw });

  // hair tufts peeking under the hat
  for (let a = -125; a <= 125; a += 20) {
    const th = (a * Math.PI) / 180;
    const j = rnd() * 0.012;
    const base = V(0.1 * Math.sin(th), 1.045, 0.035 + 0.1 * Math.cos(th));
    const tip = V((0.175 + j) * Math.sin(th), 1.0 - j, 0.035 + (0.175 + j) * Math.cos(th));
    b.spike(base, tip, null, 0.02, { color: HAIR, sides: 4, bone: head });
  }

  // ---- hat, band and goggles ---------------------------------------------------------------------------------------
  const hatTube = b.sweep(hat, [0.152, 0.125, 0.085, 0.045, 0.01], {
    color: hatPaint,
    sides: 8,
    caps: { start: "flat", end: "point" },
  });
  put("hat1", torus(0.15, 0.018, 10), HAT_D, [0, 1.052, 0.02], { rotation: [90, 0, 0] });
  const bandPts: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2;
    bandPts.push(V(0.14 * Math.sin(th), 1.09, 0.012 + 0.14 * Math.cos(th)));
  }
  b.sweep(catmull(bandPts, { closed: true }), 0.011, { color: leatherD, sides: 6, bone: "hat1" });
  put("hat1", box(0.045, 0.04, 0.012), BRASS, [0, 1.09, 0.157]);
  put("hat1", box(0.026, 0.022, 0.014), INK, [0, 1.09, 0.158]);
  for (const s of [1, -1]) {
    put("hat1", cyl(0.044, 0.044, 0.028, 8), brassPaint, [s * 0.056, 1.115, 0.158], { dir: [0, 0.15, 1] });
    glow(put("hat1", cyl(0.033, 0.033, 0.03, 8), LENS, [s * 0.056, 1.116, 0.163], { dir: [0, 0.15, 1] }), 1.2);
    put("hat1", ball(0.008, 4, 3), WHITE, [s * 0.045, 1.13, 0.18]);
    put("hat1", torus(0.044, 0.006, 8), BRASS_D, [s * 0.056, 1.115, 0.17], { dir: [0, 0.15, 1], axis: "z" });
    put("hat1", ball(0.008, 5, 4), BRASS, [s * 0.1, 1.09, 0.13]);
  }
  put("hat1", box(0.03, 0.012, 0.014), BRASS_D, [0, 1.117, 0.162]);
  b.part(ball(0.022, 6, 5), BRASS, { bone: "hat3", at: hatPts[3], flat: true });
  b.decal(hatTube, patchTex, { at: [0.1, 1.12, 0.0], dir: [1, 0.15, 0], size: [0.07, 0.07], bone: "hat2" });

  // ---- backpack --------------------------------------------------------------------------------------------------
  put(pack, box(0.34, 0.4, 0.2), woodPaint, [0, 0.68, -0.22]);
  for (const y of [0.56, 0.8]) {
    put(pack, box(0.352, 0.035, 0.212), leather, [0, y, -0.22]);
    for (let i = -2; i <= 2; i++) put(pack, ball(0.008, 6, 4), BRASS, [i * 0.07, y, -0.328]);
  }
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      for (const sz of [1, -1]) put(pack, box(0.04, 0.04, 0.04), BRASS_D, [sx * 0.16, 0.68 + sy * 0.19, -0.22 + sz * 0.09]);
  put(pack, box(0.2, 0.28, 0.01), WOOD_D, [0, 0.68, -0.325]);
  put(lid, box(0.35, 0.05, 0.21), leather, [0, 0.905, -0.22]);
  put(lid, box(0.36, 0.012, 0.22), BRASS_D, [0, 0.882, -0.22]);
  put(lid, new THREE.TorusGeometry(0.03, 0.007, 4, 8, Math.PI), BRASS, [0, 0.93, -0.22]);
  put(lid, box(0.04, 0.03, 0.012), BRASS, [0, 0.9, -0.118]);
  put(pack, cyl(0.01, 0.01, 0.34, 6), BRASS, [0, 0.88, -0.322], { dir: [1, 0, 0] });

  // gears
  const gearA = b.extrude(gearOutline(0.068, 0.088, 12), {
    at: [0.07, 0.66, -0.33],
    x: [1, 0, 0],
    thickness: 0.02,
    bevel: 0.003,
    color: brassPaint,
    bone: gear1,
  });
  void gearA;
  put(gear1, cyl(0.022, 0.022, 0.03, 8), BRASS_D, [0.07, 0.66, -0.343], { dir: [0, 0, 1] });
  for (let k = 0; k < 3; k++)
    put(gear1, box(0.13, 0.012, 0.006), BRASS_D, [0.07, 0.66, -0.341], { rotation: [0, 0, 60 * k] });
  b.extrude(gearOutline(0.04, 0.054, 9), {
    at: [0, 0.77, -0.318],
    x: [1, 0, 0],
    thickness: 0.018,
    bevel: 0.003,
    color: COPPER,
    bone: gear2,
  });
  put(gear2, cyl(0.014, 0.014, 0.026, 6), BRASS_D, [0, 0.77, -0.33], { dir: [0, 0, 1] });

  // pressure gauge and copper pipe
  put(pack, cyl(0.04, 0.04, 0.03, 10), BRASS, [-0.09, 0.54, -0.335], { dir: [0, 0, 1] });
  put(pack, torus(0.042, 0.007, 10), BRASS_D, [-0.09, 0.54, -0.35], { dir: [0, 0, 1], axis: "z" });
  b.part(new THREE.CircleGeometry(0.036, 14), "#ffffff", {
    bone: pack,
    at: [-0.09, 0.54, -0.352],
    dir: [0, 0, -1],
    axis: "z",
    texture: gaugeTex,
  });
  b.sweep(
    catmull([
      [-0.09, 0.575, -0.34],
      [-0.1, 0.65, -0.36],
      [-0.12, 0.78, -0.36],
      [-0.11, 0.86, -0.3],
      [-0.1, 0.92, -0.26],
    ]),
    0.01,
    { color: COPPER, sides: 6, bone: pack },
  );
  for (const y of [0.64, 0.78]) put(pack, torus(0.014, 0.005, 6), BRASS, [-0.1 - (y - 0.64) * 0.14, y, -0.36], { rotation: [90, 0, 0] });

  // boiler, chimney, valve, puff
  put(pack, ball(0.085, 10, 7), brassPaint, [-0.1, 0.96, -0.26], { scale: [1, 0.9, 1] });
  put(pack, torus(0.086, 0.008, 10), BRASS_D, [-0.1, 0.96, -0.26], { rotation: [90, 0, 0] });
  put(pack, cyl(0.022, 0.026, 0.14, 8), BRASS_D, [-0.1, 1.07, -0.26]);
  put(pack, torus(0.028, 0.007, 8), BRASS, [-0.1, 1.1, -0.26], { rotation: [90, 0, 0] });
  put(pack, new THREE.ConeGeometry(0.04, 0.04, 8), BRASS, [-0.1, 1.16, -0.26]);
  put(pack, cyl(0.01, 0.01, 0.04, 6), STEEL, [-0.03, 1.03, -0.2]);
  put(pack, ball(0.016, 6, 4), RED, [-0.03, 1.06, -0.2]);
  put(pack, ball(0.025, 6, 4), PUFF, [-0.12, 1.23, -0.28]);
  put(pack, ball(0.016, 6, 4), PUFF, [-0.1, 1.27, -0.29]);

  // copper coil
  put(pack, cyl(0.035, 0.04, 0.03, 8), BRASS_D, [0.13, 0.94, -0.26]);
  const coil = spiral([0.13, 0.95, -0.26], [0.16, 0.95, -0.26], [0, 1, 0], { turns: 4, r1: 0.03, pitch: 0.022 });
  const coilEnd = coil.at(1);
  const arch = catmull([
    coilEnd,
    coilEnd.clone().add(V(0, 0.05, 0)),
    coilEnd.clone().add(V(0.03, 0.09, -0.03)),
    coilEnd.clone().add(V(0.08, 0.08, -0.06)),
  ]);
  b.sweep(coil.concat(arch), 0.006, { color: COPPER, sides: 5, bone: pack });
  put(pack, ball(0.014, 6, 4), BRASS, coilEnd.clone().add(V(0.08, 0.08, -0.06)));

  // propeller
  put(pack, cyl(0.01, 0.01, 0.13, 6), STEEL_D, [0, 0.995, -0.31]);
  put(prop, cyl(0.016, 0.016, 0.02, 6), BRASS, [0, 1.065, -0.31]);
  for (const s of [1, -1])
    b.extrude(
      [
        [0, -0.012],
        [0.05, -0.02],
        [0.1, -0.005],
        [0.1, 0.012],
        [0.05, 0.02],
        [0, 0.012],
      ],
      { at: [0, 1.062, -0.31], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.006, color: s > 0 ? RED : HAT_D, bone: prop },
    );

  // clock on the left flank
  put(pack, cyl(0.065, 0.065, 0.035, 10), BRASS, [0.185, 0.78, -0.2], { dir: [1, 0, 0] });
  put(pack, torus(0.064, 0.008, 10), BRASS_D, [0.2, 0.78, -0.2], { dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.CircleGeometry(0.056, 14), "#ffffff", {
    bone: pack,
    at: [0.205, 0.78, -0.2],
    dir: [1, 0, 0],
    axis: "z",
    texture: clockTex,
  });
  put(pack, cyl(0.012, 0.012, 0.03, 6), BRASS, [0.185, 0.855, -0.2]);
  put(pack, ball(0.016, 6, 4), BRASS_D, [0.185, 0.875, -0.2]);

  // lantern
  b.rod([0.17, 0.6, -0.2], [0.25, 0.6, -0.2], 0.008, BRASS_D, { bone: pack, sides: 6 });
  put(pack, torus(0.015, 0.005, 6), BRASS, [0.25, 0.595, -0.2], { dir: [0, 0, 1], axis: "z" });
  glow(put(pack, cyl(0.034, 0.034, 0.07, 6), AMBER, [0.25, 0.54, -0.2]), 1.5);
  put(pack, cyl(0.04, 0.036, 0.02, 6), BRASS_D, [0.25, 0.495, -0.2]);
  put(pack, new THREE.ConeGeometry(0.046, 0.04, 6), BRASS, [0.25, 0.595, -0.2]);
  put(pack, cyl(0.046, 0.046, 0.01, 6), BRASS_D, [0.25, 0.578, -0.2]);
  for (let i = 0; i < 6; i++) {
    const th = (i / 6) * Math.PI * 2;
    const x = 0.25 + 0.035 * Math.sin(th);
    const z = -0.2 + 0.035 * Math.cos(th);
    b.rod([x, 0.505, z], [x, 0.575, z], 0.0045, BRASS_D, { bone: pack, sides: 4 });
  }

  // potion flask on the right flank
  b.rod([-0.17, 0.62, -0.2], [-0.19, 0.62, -0.2], 0.008, BRASS_D, { bone: pack, sides: 6 });
  glow(put(pack, ball(0.045, 8, 6), TEAL, [-0.225, 0.62, -0.2]), 1.2);
  glow(put(pack, cyl(0.016, 0.016, 0.05, 6), TEAL, [-0.225, 0.675, -0.2]), 1.2);
  put(pack, cyl(0.02, 0.016, 0.025, 6), LEATHER_L, [-0.225, 0.715, -0.2]);
  put(pack, torus(0.046, 0.007, 8), BRASS, [-0.225, 0.6, -0.2], { rotation: [90, 0, 0] });
  put(pack, torus(0.019, 0.005, 6), BRASS_D, [-0.225, 0.66, -0.2], { rotation: [90, 0, 0] });

  // spyglass on the back
  b.rod([-0.15, 0.5, -0.34], [-0.15, 0.62, -0.34], 0.026, STEEL_D, { bone: pack, sides: 8 });
  b.rod([-0.15, 0.62, -0.34], [-0.15, 0.75, -0.34], 0.022, BRASS, { bone: pack, sides: 8 });
  b.rod([-0.15, 0.75, -0.34], [-0.15, 0.86, -0.34], 0.018, STEEL, { bone: pack, sides: 8 });
  glow(put(pack, cyl(0.015, 0.015, 0.008, 8), LENS, [-0.15, 0.862, -0.34]), 0.9);
  for (const y of [0.62, 0.75]) put(pack, torus(0.025, 0.005, 8), BRASS_D, [-0.15, y, -0.34], { rotation: [90, 0, 0] });
  put(pack, box(0.05, 0.02, 0.012), leatherD, [-0.15, 0.56, -0.368]);

  // scroll tied under the pack
  put(pack, cyl(0.032, 0.032, 0.34, 8), PARCH, [0, 0.485, -0.3], { dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    put(pack, cyl(0.034, 0.034, 0.012, 8), WOOD_D, [s * 0.18, 0.485, -0.3], { dir: [1, 0, 0] });
    put(pack, torus(0.035, 0.006, 8), RED, [s * 0.08, 0.485, -0.3], { dir: [1, 0, 0], axis: "z" });
    put(pack, torus(0.02, 0.01, 6), PARCH, [s * 0.172, 0.485, -0.3], { dir: [1, 0, 0], axis: "z" });
  }
  put(pack, box(0.03, 0.04, 0.012), RED, [0.08, 0.452, -0.3]);

  // back pouch
  put(pack, box(0.1, 0.08, 0.04), leather, [0.09, 0.52, -0.35]);
  put(pack, box(0.105, 0.04, 0.046), leatherL, [0.09, 0.552, -0.35]);
  put(pack, ball(0.009, 6, 4), BRASS, [0.09, 0.545, -0.375]);

  // ---- belt pouches and tools --------------------------------------------------------------------------------------
  const pouch = (deg: number, cy: number, kind: "wrench" | "drivers") => {
    const th = (deg * Math.PI) / 180;
    const R = 0.2;
    const w = (lx: number, ly: number, lz: number) =>
      V((R + lz) * Math.sin(th) + lx * Math.cos(th), cy + ly, (R + lz) * Math.cos(th) - lx * Math.sin(th));
    const rot = [0, deg, 0];
    put("hips", box(0.13, 0.1, 0.06), leather, w(0, 0, 0), { rotation: rot });
    put("hips", box(0.135, 0.045, 0.066), leatherL, w(0, 0.04, 0), { rotation: rot });
    put("hips", box(0.02, 0.1, 0.068), leatherD, w(0, 0, 0), { rotation: rot });
    put("hips", ball(0.011, 6, 4), BRASS, w(0, 0.03, 0.036));
    put("hips", box(0.012, 0.03, 0.01), BRASS_D, w(0.04, 0.02, 0.033), { rotation: rot });
    const xdir = V(Math.cos(th), 0, -Math.sin(th));
    if (kind === "wrench") {
      b.extrude(wrenchOutline, {
        at: w(0.03, -0.02, 0),
        x: xdir.toArray(),
        y: [0, 1, 0],
        thickness: 0.01,
        color: STEEL,
        bone: "hips",
      });
      b.rod(w(-0.03, 0.03, 0), w(-0.032, 0.115, 0), 0.016, RED, { bone: "hips", sides: 6 });
      b.rod(w(-0.032, 0.115, 0), w(-0.033, 0.125, 0), 0.008, STEEL_D, { bone: "hips", sides: 6 });
    } else {
      b.rod(w(-0.035, 0.03, 0), w(-0.04, 0.12, 0), 0.016, WOOD, { bone: "hips", sides: 6 });
      b.rod(w(0.03, 0.03, 0), w(0.034, 0.115, 0), 0.015, TEAL, { bone: "hips", sides: 6 });
      b.rod(w(0.0, 0.03, 0), w(0.0, 0.11, 0), 0.008, STEEL, { bone: "hips", sides: 6 });
    }
  };
  pouch(-38, 0.44, "wrench");
  pouch(48, 0.44, "drivers");

  // hammer hanging at the left hip
  b.rod([0.188, 0.505, -0.03], [0.205, 0.34, -0.03], 0.012, WOOD, { bone: "hips", sides: 6 });
  put("hips", box(0.03, 0.04, 0.1), STEEL, [0.205, 0.335, -0.03]);
  put("hips", box(0.034, 0.012, 0.04), STEEL_D, [0.205, 0.318, -0.03]);
  put("hips", torus(0.014, 0.005, 6), BRASS, [0.188, 0.5, -0.03], { rotation: [0, 90, 0] });

  return b.root;
}
