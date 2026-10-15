// Gnome tinkerer: a ~1 m gnome in a floppy red hat, huge white beard and a backpack bristling with gadgets.
// Whimsical low-poly mix: soft chubby proportions, giant nose/beard/hat, faceted flat-shaded primitives,
// painted tunic/trousers/leather, a few glowing lenses and a lantern.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { gradient, grain, mottle, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, polyline, spiral } from "../../../../src/path";
import type { Chain, Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A chubby 1 m gnome tinkerer with a drooping red hat, goggles, monocle, huge beard, apron full of tools and a backpack of spinning gadgets.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

const SKIN = "#f0b48e";
const NOSE = "#e9776b";
const NOSEHI = "#f6a79a";
const CHEEK = "#f29a8a";
const WHITE = "#f7f5ee";
const BEARD2 = "#d9dde8";
const BROW = "#e8e6de";
const EYE = "#fffdf6";
const IRIS = "#5a3a22";
const PUPIL = "#1d1410";
const HAT = "#d9382c";
const HAT2 = "#b02820";
const TUNIC = "#49a863";
const TUNIC2 = "#3a8c52";
const TRIM = "#f3c64a";
const SCARF = "#f08a2e";
const TROUSER = "#3f6fb8";
const TROUSER2 = "#315892";
const BOOT = "#7a4a2a";
const BOOTCUFF = "#a56a3a";
const LEATHER = "#8e5b33";
const LEATHER2 = "#6e4325";
const LEATHER3 = "#b0763f";
const BRASS = "#dba73f";
const COPPER = "#c76a3a";
const STEEL = "#9fb0bf";
const IRON = "#3a3f47";
const GLASS = "#8fe3ff";
const LAMP = "#ffd96b";
const CREAM = "#f2e4c0";
const RED = "#c9362a";
const TEAL = "#2fb5a8";
const JAR = "#7affc8";
const BLACK = "#2a2020";

const ol = (p: Array<[number, number]>): OutlinePoint[] => p;
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s, 1);
const tor = (r: number, t: number, rs = 4, ts = 8) => new THREE.TorusGeometry(r, t, rs, ts);
const vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const svgGauge = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="31" fill="#f7f1dc"/>
<path d="M11 45 A23 23 0 0 1 17 18" fill="none" stroke="#3aa65a" stroke-width="5"/>
<path d="M22 12 A23 23 0 0 1 43 12" fill="none" stroke="#f3c64a" stroke-width="5"/>
<path d="M47 18 A23 23 0 0 1 53 45" fill="none" stroke="#c9362a" stroke-width="5"/>
<g stroke="#3a3f47" stroke-width="2.5"><path d="M32 6 L32 12"/><path d="M12 14 L16 18"/><path d="M52 14 L48 18"/><path d="M6 32 L12 32"/><path d="M58 32 L52 32"/></g>
<path d="M32 36 L46 20 L36 33 Z" fill="#c9362a"/>
<circle cx="32" cy="34" r="4.5" fill="#3a3f47"/>
<rect x="24" y="46" width="16" height="6" rx="2" fill="#3a3f47"/>
</svg>`,
  { size: 128 },
);

const svgSticker = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
<rect width="64" height="48" rx="5" fill="#2b4f8f"/>
<rect x="3" y="3" width="58" height="42" rx="3" fill="none" stroke="#f7f5ee" stroke-width="1.5" stroke-dasharray="4 2"/>
<circle cx="22" cy="24" r="10" fill="none" stroke="#f7f5ee" stroke-width="3"/>
<circle cx="22" cy="24" r="3" fill="#f3c64a"/>
<path d="M22 10 V14 M22 34 V38 M8 24 H12 M32 24 H36" stroke="#f7f5ee" stroke-width="3"/>
<path d="M40 14 H58 M40 22 H54 M40 30 H58 M40 38 H50" stroke="#8fe3ff" stroke-width="2.5"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer", detail: 0.8 });
  const R = rng(11);

  // ------------------------------------------------------------------ helpers
  const P = (g: THREE.BufferGeometry, color: Fill, at: V3, bone: Joint, o: PartOptions = {}) =>
    b.part(g, color, { flat: true, at, bone, ...o });
  const rod = (p: V3, q: V3, r: number, color: Fill, bone: Joint, sides = 6) =>
    b.rod(p, q, r, color, { bone, sides, smooth: false });
  const tip = (c: Chain) => c.joints[c.joints.length - 1];

  const tunic = mottle(TUNIC, TUNIC2, { size: 0.05, contrast: 0.7, seed: 3 });
  const skin = mottle(SKIN, "#e79c78", { size: 0.05, contrast: 0.5, seed: 5 });
  const trouser = stripes(TROUSER, TROUSER2, { size: 0.035, axis: "x", width: 0.3, wobble: 0.1, seed: 2 });
  const hatPaint = stripes(HAT, HAT2, { size: 0.06, axis: "y", width: 0.4, wobble: 0.25, seed: 4 });
  const leather = grain(LEATHER, LEATHER2, { size: 0.012, axis: "x", seed: 6 });
  const beardPaint = gradient(WHITE, BEARD2, [0, 0.88, 0], [0, 0.6, 0]);

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.42, 0], dir: [0, 1, 0], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.48, 0.005], dir: [0, 1, 0], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.62, 0.015], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 0.72, 0.02], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.82, 0.03], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.885, 0.06], dir: [0, -0.15, 1], role: "jaw" });

  // ------------------------------------------------------------------ torso, skirt, belt, apron
  b.sweep(
    catmull([
      [0, 0.42, 0],
      [0, 0.55, 0.02],
      [0, 0.67, 0.01],
    ]),
    [0.1, 0.145, 0.115],
    { color: tunic, bone: [hips, spine1, spine2], sides: 8, smooth: false },
  );
  b.lathe(
    ol([
      [0, 0],
      [0.152, 0],
      [0.152, 0.025],
      [0.128, 0.15],
      [0, 0.15],
    ]),
    { at: [0, 0.33, 0.01], color: tunic, bone: hips, segments: 8 },
  );
  b.lathe(
    ol([
      [0.148, 0.002],
      [0.157, 0.002],
      [0.157, 0.03],
      [0.148, 0.03],
    ]),
    { at: [0, 0.33, 0.01], color: TRIM, bone: hips, segments: 8 },
  );
  b.lathe(
    ol([
      [0.15, 0],
      [0.162, 0],
      [0.162, 0.04],
      [0.15, 0.04],
    ]),
    { at: [0, 0.5, 0.018], color: LEATHER2, bone: spine1, segments: 8 },
  );
  P(box(0.055, 0.05, 0.012), BRASS, [0, 0.52, 0.182], spine1);
  P(box(0.03, 0.026, 0.014), IRON, [0, 0.52, 0.184], spine1);

  b.extrude(
    ol([
      [-0.1, 0],
      [0.1, 0],
      [0.11, 0.1],
      [0.095, 0.25],
      [0.055, 0.33],
      [-0.055, 0.33],
      [-0.095, 0.25],
      [-0.11, 0.1],
    ]),
    { at: [0, 0.35, 0.172], x: [1, 0, 0], thickness: 0.014, bevel: 0.003, color: LEATHER3, bone: spine1 },
  );
  for (const s of [1, -1]) {
    // bib straps over the shoulders and round the back
    b.sweep(
      polyline([
        [s * 0.055, 0.68, 0.17],
        [s * 0.07, 0.755, 0.1],
        [s * 0.1, 0.74, -0.04],
        [s * 0.09, 0.6, -0.125],
      ]),
      0.012,
      { color: LEATHER2, bone: spine2, sides: 4, smooth: false },
    );
    P(sph(0.014, 5, 4), BRASS, [s * 0.058, 0.67, 0.182], spine2);
    // pockets
    P(box(0.075, 0.07, 0.012), LEATHER2, [s * 0.058, 0.47, 0.184], spine1);
    P(box(0.08, 0.014, 0.016), BRASS, [s * 0.058, 0.507, 0.186], spine1);
  }
  // pocket tools: screwdriver + pencil (left), pliers (right), tape measure
  rod([0.05, 0.49, 0.188], [0.05, 0.57, 0.192], 0.006, STEEL, spine1);
  rod([0.05, 0.56, 0.192], [0.05, 0.63, 0.194], 0.012, RED, spine1);
  rod([0.072, 0.49, 0.188], [0.078, 0.58, 0.192], 0.006, TRIM, spine1);
  b.spike([0.078, 0.58, 0.192], [0.1, 1, 0.1], 0.025, 0.006, BLACK, { bone: spine1, sides: 5 });
  rod([-0.05, 0.49, 0.188], [-0.075, 0.6, 0.192], 0.008, COPPER, spine1);
  rod([-0.068, 0.49, 0.188], [-0.04, 0.6, 0.192], 0.008, COPPER, spine1);
  P(box(0.04, 0.03, 0.01), STEEL, [-0.058, 0.615, 0.194], spine1, { rotation: [0, 0, 8] });
  P(cyl(0.03, 0.03, 0.026, 8), TRIM, [0, 0.4, 0.19], spine1, { dir: [0, 0, 1] });
  P(cyl(0.012, 0.012, 0.03, 6), IRON, [0, 0.4, 0.19], spine1, { dir: [0, 0, 1] });

  // hip gear: hammer (left), pouch (right)
  rod([0.15, 0.47, 0.06], [0.17, 0.34, 0.08], 0.011, LEATHER3, hips);
  P(box(0.075, 0.036, 0.036), IRON, [0.172, 0.325, 0.082], hips);
  P(box(0.02, 0.04, 0.04), STEEL, [0.21, 0.325, 0.082], hips);
  P(box(0.03, 0.02, 0.02), LEATHER2, [0.155, 0.48, 0.062], hips);
  P(sph(0.055, 7, 5), LEATHER2, [-0.15, 0.44, 0.07], hips, { scale: [0.8, 1, 0.9] });
  P(box(0.07, 0.03, 0.08), LEATHER, [-0.15, 0.47, 0.07], hips);
  P(sph(0.012, 5, 4), BRASS, [-0.15, 0.45, 0.115], hips);

  // neck, scarf
  b.capsule([0, 0.72, 0.02], [0, 0.82, 0.03], 0.045, skin, { bone: neck, sides: 6, smooth: false });
  b.lathe(
    ol([
      [0.09, 0],
      [0.13, 0],
      [0.13, 0.05],
      [0.09, 0.05],
    ]),
    { at: [0, 0.715, 0.012], color: SCARF, bone: spine2, segments: 8 },
  );
  P(sph(0.032, 6, 4), SCARF, [0.06, 0.72, 0.125], spine2);
  b.extrude(
    ol([
      [-0.02, 0],
      [0.02, 0],
      [0.028, -0.13],
      [0, -0.16],
      [-0.028, -0.13],
    ]),
    { at: [0.07, 0.72, 0.135], x: [1, 0, 0], thickness: 0.012, color: SCARF, bone: spine2 },
  );

  // ------------------------------------------------------------------ legs and boots
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.088;
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [x, 0.41, 0],
        [x * 1.03, 0.23, 0.015],
        [x * 1.03, 0.078, 0],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, [0.06, 0.056, 0.047, 0.043], { color: trouser, sides: 7, smooth: false });
    const ankle = tip(leg);
    const knee = leg.joints[1];
    P(box(0.085, 0.07, 0.03), LEATHER3, [x * 1.03, 0.23, 0.058], knee, { rotation: [-6, 0, 0] });
    for (const dx of [-0.028, 0.028])
      for (const dy of [-0.024, 0.024]) rod([x * 1.03 + dx, 0.23 + dy, 0.074], [x * 1.03 + dx, 0.23 + dy, 0.078], 0.004, RED, knee, 4);
    // boot
    P(box(0.11, 0.06, 0.15), BOOT, [x, 0.03, 0.035], ankle);
    P(box(0.115, 0.012, 0.2), LEATHER2, [x, 0.006, 0.04], ankle);
    P(cyl(0.056, 0.056, 0.09, 8), BOOT, [x, 0.11, 0], ankle);
    P(cyl(0.064, 0.064, 0.03, 8), BOOTCUFF, [x, 0.15, 0], ankle);
    P(box(0.03, 0.025, 0.01), BRASS, [x, 0.1, 0.06], ankle);
    const toe = b.joint(`toe${S}`, { parent: ankle, at: [x, 0.04, 0.075], dir: [0, 0, 1], role: "hinge" });
    P(sph(0.056, 7, 5), BOOT, [x, 0.04, 0.11], toe, { scale: [0.95, 0.72, 1.05] });
    b.spike([x, 0.048, 0.14], [0, 0.45, 1], 0.09, 0.04, BOOT, { bone: toe, sides: 6, smooth: false });
    P(sph(0.012, 5, 4), BRASS, [x, 0.065, 0.16], toe);
  }

  // ------------------------------------------------------------------ arms and hands
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.165, 0.67, 0];
    const el = [s * 0.255, 0.575, 0.03];
    const wr = [s * 0.3, 0.485, 0.115];
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: spine2,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.058, 0.053, 0.046], { color: tunic, sides: 7, smooth: false });
    const w = tip(arm);
    P(sph(0.066, 7, 5), tunic, sh, arm.joints[0]);
    P(sph(0.042, 6, 4), LEATHER3, [s * 0.272, 0.585, 0.0], arm.joints[1], { scale: [0.9, 1, 0.55] });
    const wv = vec(wr[0], wr[1], wr[2]);
    const d = wv.clone().sub(vec(el[0], el[1], el[2])).normalize();
    const lat = new THREE.Vector3().crossVectors(d, vec(1, 0, 0)).normalize();
    const palm = wv.clone().addScaledVector(d, 0.042);
    P(cyl(0.054, 0.059, 0.045, 7), TRIM, wv.clone().addScaledVector(d, -0.012), w, { dir: d });
    P(sph(0.044, 7, 5), skin, palm, w);
    for (let k = 0; k < 4; k++) {
      const off = (k - 1.5) * 0.0165;
      const base = palm.clone().addScaledVector(lat, off).addScaledVector(d, 0.025);
      const end = base.clone().addScaledVector(d, 0.04);
      b.capsule(base, end, 0.0105, SKIN, { bone: w, sides: 5, smooth: false });
    }
    const tb = palm.clone().add(vec(-s * 0.032, 0.012, 0.005));
    b.capsule(tb, tb.clone().add(vec(-s * 0.012, -0.025, 0.02)), 0.012, SKIN, { bone: w, sides: 5, smooth: false });

    if (s > 0) {
      // lantern hanging from the left hand
      const lx = palm.x;
      const lz = palm.z;
      rod([lx, palm.y, lz], [lx, 0.43, lz], 0.004, BRASS, w, 4);
      P(tor(0.013, 0.003, 4, 6), BRASS, [lx, 0.432, lz], w, { rotation: [90, 0, 0] });
      glow(P(box(0.06, 0.07, 0.06), LAMP, [lx, 0.355, lz], w), 1.3);
      P(cyl(0.005, 0.05, 0.035, 4), BRASS, [lx, 0.408, lz], w, { rotation: [0, 45, 0] });
      P(box(0.072, 0.012, 0.072), BRASS, [lx, 0.316, lz], w);
      for (const cx of [-1, 1])
        for (const cz of [-1, 1]) rod([lx + cx * 0.03, 0.32, lz + cz * 0.03], [lx + cx * 0.03, 0.39, lz + cz * 0.03], 0.0045, IRON, w, 4);
    } else {
      // big wrench used as a walking stick in the right hand
      const wx = palm.x;
      const wz = palm.z;
      rod([wx, 0, wz], [wx, 0.64, wz], 0.012, STEEL, w, 6);
      rod([wx, 0.4, wz], [wx, 0.53, wz], 0.017, RED, w, 6);
      rod([wx, 0.395, wz], [wx, 0.405, wz], 0.02, BRASS, w, 6);
      b.extrude(
        ol([
          [-0.016, 0],
          [0.016, 0],
          [0.016, 0.03],
          [0.05, 0.06],
          [0.05, 0.11],
          [0.025, 0.13],
          [0.025, 0.095],
          [-0.025, 0.095],
          [-0.025, 0.13],
          [-0.05, 0.11],
          [-0.05, 0.06],
          [-0.016, 0.03],
        ]),
        { at: [wx, 0.63, wz], x: [1, 0, 0], thickness: 0.018, bevel: 0.003, color: STEEL, bone: w },
      );
      P(cyl(0.008, 0.008, 0.024, 6), IRON, [wx, 0.64, wz], w, { dir: [0, 0, 1] });
    }
  }

  // ------------------------------------------------------------------ head
  P(sph(0.13, 10, 7), skin, [0, 0.93, 0.04], head, { scale: [1.05, 0.97, 1] });
  // nose
  P(sph(0.042, 7, 5), NOSE, [0, 0.905, 0.19], head, { scale: [1, 0.95, 1.05] });
  P(sph(0.012, 5, 4), NOSEHI, [0.012, 0.918, 0.228], head);
  for (const s of [1, -1]) {
    // ears
    b.spike([s * 0.125, 0.93, 0.03], [s, 0.4, -0.3], 0.11, 0.036, SKIN, { bone: head, sides: 5, smooth: false });
    b.spike([s * 0.13, 0.93, 0.045], [s, 0.4, -0.3], 0.08, 0.02, CHEEK, { bone: head, sides: 5, smooth: false });
    // eyes
    P(sph(0.024, 7, 5), EYE, [s * 0.05, 0.94, 0.152], head);
    P(sph(0.014, 6, 4), IRIS, [s * 0.05, 0.94, 0.167], head);
    P(sph(0.008, 5, 4), PUPIL, [s * 0.05, 0.94, 0.178], head);
    P(sph(0.004, 4, 3), "#ffffff", [s * 0.05 + 0.005, 0.947, 0.183], head);
    // brows, cheeks
    b.capsule([s * 0.012, 0.98, 0.165], [s * 0.085, 0.99, 0.128], 0.016, BROW, { bone: head, sides: 5, smooth: false });
    P(sph(0.03, 6, 4), CHEEK, [s * 0.085, 0.895, 0.125], head);
    // moustache
    b.sweep(
      catmull([
        [s * 0.005, 0.89, 0.172],
        [s * 0.06, 0.878, 0.176],
        [s * 0.115, 0.887, 0.152],
        [s * 0.15, 0.915, 0.125],
      ]),
      [0.03, 0.028, 0.02, 0.008],
      { color: WHITE, bone: head, sides: 6, smooth: false },
    );
    // side beard locks
    b.spike([s * 0.095, 0.9, 0.07], [s * 0.4, -1, 0.3], 0.13, 0.035, WHITE, { bone: jaw, sides: 5, smooth: false });
  }
  // monocle on the left eye
  P(tor(0.036, 0.006, 4, 8), BRASS, [0.05, 0.94, 0.18], head);
  glow(P(new THREE.CircleGeometry(0.033, 8), GLASS, [0.05, 0.94, 0.183], head, { dir: [0, 0, 1], axis: "z" }), 0.5);

  // beard (on the jaw so it opens with it)
  P(sph(0.1, 8, 6), WHITE, [0, 0.845, 0.085], jaw, { scale: [1.1, 1, 0.85] });
  for (let i = -3; i <= 3; i++) {
    const a = Math.abs(i);
    b.spike([i * 0.032, 0.87 - a * 0.008, 0.125 - a * 0.012], [i * 0.09, -1, 0.22], 0.2 - a * 0.018 + R() * 0.03, 0.042 - a * 0.003, beardPaint, {
      bone: jaw,
      sides: 5,
      smooth: false,
    });
  }
  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    b.spike([i * 0.04, 0.84, 0.1], [i * 0.12, -1, 0.1], 0.27 - a * 0.035, 0.046 - a * 0.004, BEARD2, {
      bone: jaw,
      sides: 5,
      smooth: false,
    });
  }
  // little brass bead on the beard tip
  P(sph(0.014, 5, 4), BRASS, [0, 0.585, 0.12], jaw);

  // ------------------------------------------------------------------ hat
  const hatPath = catmull([
    [0, 1.0, 0.03],
    [0, 1.11, 0.03],
    [0, 1.2, 0.0],
    [0, 1.26, -0.07],
    [0, 1.27, -0.15],
  ]);
  b.sweep(hatPath, [0.13, 0.1, 0.07, 0.04, 0], {
    color: hatPaint,
    bone: head,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "point" },
  });
  b.lathe(
    ol([
      [0, 0],
      [0.175, 0],
      [0.175, 0.014],
      [0.12, 0.032],
      [0, 0.032],
    ]),
    { at: [0, 1.0, 0.035], color: HAT2, bone: head, segments: 9 },
  );
  b.lathe(
    ol([
      [0.108, 0],
      [0.132, 0],
      [0.132, 0.022],
      [0.108, 0.022],
    ]),
    { at: [0, 1.032, 0.03], color: LEATHER2, bone: head, segments: 8 },
  );
  P(box(0.03, 0.026, 0.01), BRASS, [0, 1.043, 0.162], head);
  P(sph(0.032, 6, 4), BRASS, [0, 1.245, -0.17], head);
  P(sph(0.008, 4, 3), IRON, [0, 1.212, -0.17], head);
  b.spike([-0.105, 1.045, 0.03], [-0.45, 1, -0.5], 0.17, 0.018, TEAL, { bone: head, sides: 4, smooth: false });
  P(sph(0.014, 5, 4), TRIM, [-0.105, 1.045, 0.03], head);
  // goggles pushed up on the hat
  for (const s of [1, -1]) {
    P(tor(0.03, 0.008, 4, 8), BRASS, [s * 0.045, 1.09, 0.152], head);
    P(tor(0.036, 0.005, 4, 8), IRON, [s * 0.045, 1.09, 0.149], head);
    glow(P(new THREE.CircleGeometry(0.029, 8), GLASS, [s * 0.045, 1.09, 0.154], head, { dir: [0, 0, 1], axis: "z" }), 0.7);
  }
  rod([-0.018, 1.09, 0.15], [0.018, 1.09, 0.15], 0.006, BRASS, head, 5);

  // ------------------------------------------------------------------ backpack
  const pk = spine2;
  const lid = b.joint("packLid", { parent: spine2, at: [0, 0.83, -0.305], dir: [0, 0, 1], role: "hinge" });
  P(box(0.34, 0.38, 0.17), leather, [0, 0.64, -0.215], pk);
  P(box(0.35, 0.02, 0.18), LEATHER2, [0, 0.45, -0.215], pk);
  for (const sx of [1, -1])
    for (const sy of [1, -1]) P(box(0.05, 0.05, 0.02), LEATHER3, [sx * 0.15, 0.64 + sy * 0.17, -0.305], pk);
  // lid with telescope strapped on top
  P(box(0.36, 0.04, 0.19), LEATHER3, [0, 0.85, -0.21], lid);
  P(box(0.3, 0.016, 0.15), LEATHER, [0, 0.875, -0.21], lid);
  P(box(0.362, 0.012, 0.012), BRASS, [0, 0.838, -0.115], lid);
  P(box(0.04, 0.045, 0.014), BRASS, [0, 0.835, -0.112], lid);
  rod([-0.17, 0.83, -0.305], [0.17, 0.83, -0.305], 0.012, BRASS, lid, 6);
  rod([-0.27, 0.905, -0.2], [-0.08, 0.905, -0.2], 0.03, BRASS, lid, 7);
  rod([-0.08, 0.905, -0.2], [0.12, 0.905, -0.2], 0.026, COPPER, lid, 7);
  rod([0.12, 0.905, -0.2], [0.25, 0.905, -0.2], 0.021, BRASS, lid, 7);
  rod([-0.305, 0.905, -0.2], [-0.27, 0.905, -0.2], 0.017, IRON, lid, 7);
  rod([0.25, 0.905, -0.2], [0.285, 0.905, -0.2], 0.027, IRON, lid, 7);
  for (const x of [-0.08, 0.12]) rod([x - 0.006, 0.905, -0.2], [x + 0.006, 0.905, -0.2], 0.034, TRIM, lid, 7);
  glow(P(new THREE.CircleGeometry(0.021, 8), GLASS, [0.2862, 0.905, -0.2], lid, { dir: [1, 0, 0], axis: "z" }), 0.8);
  for (const x of [-0.14, 0.17]) {
    P(box(0.022, 0.078, 0.078), LEATHER2, [x, 0.905, -0.2], lid);
    P(box(0.026, 0.016, 0.014), BRASS, [x, 0.905, -0.158], lid);
  }

  // rivets along the back edges (one merged part)
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= 6; i++) {
    const x = -0.15 + i * 0.05;
    rivets.push(sph(0.008, 5, 4).translate(x, 0.47, -0.301));
    rivets.push(sph(0.008, 5, 4).translate(x, 0.81, -0.301));
  }
  for (let j = 1; j <= 5; j++) {
    const y = 0.47 + j * 0.0567;
    rivets.push(sph(0.008, 5, 4).translate(-0.15, y, -0.301));
    rivets.push(sph(0.008, 5, 4).translate(0.15, y, -0.301));
  }
  const rivetGeo = mergeGeometries(rivets);
  if (rivetGeo) b.part(rivetGeo, BRASS, { bone: pk, at: [0, 0, 0], flat: true });

  // pressure gauge
  P(cyl(0.052, 0.052, 0.03, 8), BRASS, [0, 0.76, -0.315], pk, { dir: [0, 0, -1] });
  P(tor(0.05, 0.008, 4, 8), COPPER, [0, 0.76, -0.33], pk);
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: pk,
    at: [0, 0.76, -0.3325],
    dir: [0, 0, -1],
    axis: "z",
    texture: svgGauge,
  });
  // sticker
  b.part(new THREE.PlaneGeometry(0.09, 0.0675), "#ffffff", {
    bone: pk,
    at: [0.11, 0.7, -0.3015],
    dir: [0, 0, -1],
    axis: "z",
    texture: svgSticker,
  });

  // spinning gears on the back
  const makeGear = (name: string, at: V3, r: number, n: number, body: Fill, hub: Fill) => {
    const joint = b.joint(name, { parent: spine2, at, dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
    const pts: OutlinePoint[] = [];
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++)
      for (const [f, k] of [
        [0.8, 0],
        [1, 0.12],
        [1, 0.42],
        [0.8, 0.54],
      ] as const) {
        const an = i * step + k * step;
        pts.push([Math.cos(an) * r * f, Math.sin(an) * r * f]);
      }
    b.extrude(pts, { at, x: [1, 0, 0], thickness: 0.014, color: body, bone: joint });
    P(cyl(r * 0.58, r * 0.58, 0.018, 8), IRON, at, joint, { dir: [0, 0, 1] });
    P(cyl(r * 0.3, r * 0.3, 0.024, 6), hub, at, joint, { dir: [0, 0, 1] });
    return joint;
  };
  makeGear("gearA", [-0.075, 0.59, -0.312], 0.075, 10, COPPER, BRASS);
  makeGear("gearB", [0.065, 0.57, -0.312], 0.055, 8, BRASS, STEEL);

  // coil spring along the bottom
  const springPath = spiral([-0.14, 0.475, -0.325], [-0.14, 0.5, -0.325], [1, 0, 0], { turns: 4, r1: 0.025, pitch: 0.03 });
  b.sweep(springPath, 0.005, { color: STEEL, bone: pk, sides: 4, smooth: false });

  // frame rods, mast, propeller, dish, pennant
  for (const s of [1, -1]) {
    rod([s * 0.15, 0.78, -0.28], [s * 0.15, 1.0, -0.28], 0.011, COPPER, pk, 6);
    P(sph(0.017, 5, 4), BRASS, [s * 0.15, 1.0, -0.28], pk);
  }
  rod([-0.15, 1.0, -0.28], [0.15, 1.0, -0.28], 0.011, COPPER, pk, 6);
  rod([0, 1.0, -0.28], [0, 1.13, -0.28], 0.008, STEEL, pk, 6);
  const prop = b.joint("propeller", { parent: spine2, at: [0, 1.14, -0.28], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  for (const s of [1, -1])
    b.extrude(
      ol([
        [0.01, -0.015],
        [0.07, -0.028],
        [0.13, -0.02],
        [0.14, 0],
        [0.13, 0.02],
        [0.07, 0.028],
        [0.01, 0.015],
      ]),
      { at: [0, 1.14, -0.28], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.006, color: s > 0 ? TRIM : TEAL, bone: prop },
    );
  P(sph(0.02, 6, 4), RED, [0, 1.14, -0.28], prop);
  b.spike([0, 1.145, -0.28], [0, 1, 0], 0.03, 0.008, BRASS, { bone: prop, sides: 5 });
  rod([-0.15, 1.0, -0.28], [-0.15, 1.065, -0.28], 0.007, STEEL, pk, 5);
  const dish = b.joint("dish", { parent: spine2, at: [-0.15, 1.07, -0.28], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  b.lathe(
    ol([
      [0, 0],
      [0.035, 0.004],
      [0.06, 0.022],
      [0.06, 0.028],
      [0.033, 0.012],
      [0, 0.009],
    ]),
    { at: [-0.15, 1.075, -0.28], axis: [0, 0.8, 0.6], color: STEEL, bone: dish, segments: 9 },
  );
  rod([-0.15, 1.075, -0.28], [-0.15, 1.075 + 0.04, -0.28 + 0.03], 0.004, IRON, dish, 4);
  P(sph(0.008, 4, 3), RED, [-0.15, 1.075 + 0.04, -0.28 + 0.03], dish);
  rod([0.15, 1.0, -0.28], [0.15, 1.12, -0.28], 0.005, STEEL, pk, 5);
  P(sph(0.01, 5, 4), BRASS, [0.15, 1.125, -0.28], pk);
  b.extrude(
    ol([
      [0, 0],
      [0.09, -0.02],
      [0, -0.045],
    ]),
    { at: [0.15, 1.115, -0.28], x: [0, 0, -1], thickness: 0.004, color: TEAL, bone: pk },
  );

  // steam pipe with valve and puffs on the right
  const pipe = catmull([
    [0.16, 0.66, -0.22],
    [0.235, 0.67, -0.24],
    [0.26, 0.75, -0.27],
    [0.22, 0.86, -0.29],
    [0.2, 0.94, -0.29],
  ]);
  b.sweep(pipe, 0.014, { color: COPPER, bone: pk, sides: 6, smooth: false });
  b.along(pipe, 4, (at) => {
    P(sph(0.02, 6, 4), BRASS, at, pk);
  });
  P(cyl(0.012, 0.022, 0.03, 6), BRASS, [0.2, 0.955, -0.29], pk);
  P(tor(0.025, 0.005, 4, 8), RED, [0.268, 0.7, -0.25], pk, { rotation: [0, 90, 0] });
  P(sph(0.008, 4, 3), BRASS, [0.268, 0.7, -0.25], pk);
  P(sph(0.02, 6, 4), "#ffffff", [0.2, 0.99, -0.29], pk);
  P(sph(0.028, 6, 4), "#ffffff", [0.21, 1.03, -0.3], pk);
  P(sph(0.036, 6, 4), "#ffffff", [0.225, 1.08, -0.29], pk);

  // crank handle (spins)
  const crank = b.joint("crank", { parent: spine2, at: [0.17, 0.52, -0.2], dir: [0, 1, 0], up: [0, 0, 1], role: "hinge" });
  rod([0.17, 0.52, -0.2], [0.225, 0.52, -0.2], 0.012, IRON, crank, 6);
  rod([0.225, 0.52, -0.2], [0.225, 0.585, -0.2], 0.011, BRASS, crank, 6);
  rod([0.225, 0.585, -0.2], [0.265, 0.585, -0.2], 0.014, RED, crank, 6);
  P(sph(0.016, 5, 4), BRASS, [0.225, 0.52, -0.2], crank);

  // rolled blueprint scroll on the left
  rod([-0.255, 0.46, -0.215], [-0.255, 0.84, -0.215], 0.03, CREAM, pk, 7);
  rod([-0.255, 0.455, -0.215], [-0.255, 0.465, -0.215], 0.034, BRASS, pk, 7);
  rod([-0.255, 0.835, -0.215], [-0.255, 0.845, -0.215], 0.034, BRASS, pk, 7);
  for (const y of [0.54, 0.74]) {
    P(box(0.072, 0.022, 0.072), LEATHER2, [-0.255, y, -0.215], pk);
    P(box(0.012, 0.026, 0.014), BRASS, [-0.255, y, -0.178], pk);
  }
  rod([-0.255, 0.64, -0.215], [-0.255, 0.66, -0.215], 0.034, RED, pk, 7);
  rod([-0.17, 0.62, -0.215], [-0.23, 0.62, -0.215], 0.006, LEATHER2, pk, 4);

  // hanging pot and glowing jar under the pack
  rod([0.1, 0.45, -0.24], [0.1, 0.41, -0.24], 0.005, CREAM, pk, 4);
  P(sph(0.055, 7, 5), COPPER, [0.1, 0.36, -0.24], pk, { scale: [1, 0.85, 1] });
  P(cyl(0.03, 0.045, 0.02, 7), BRASS, [0.1, 0.405, -0.24], pk);
  P(tor(0.032, 0.004, 4, 7), IRON, [0.1, 0.41, -0.24], pk, { rotation: [90, 0, 0] });
  rod([0.155, 0.37, -0.24], [0.18, 0.39, -0.24], 0.006, IRON, pk, 4);
  rod([-0.1, 0.45, -0.24], [-0.1, 0.41, -0.24], 0.005, CREAM, pk, 4);
  glow(P(cyl(0.032, 0.032, 0.06, 7), JAR, [-0.1, 0.375, -0.24], pk), 1.2);
  P(cyl(0.036, 0.036, 0.014, 7), BRASS, [-0.1, 0.41, -0.24], pk);
  P(cyl(0.036, 0.036, 0.01, 7), BRASS, [-0.1, 0.342, -0.24], pk);
  for (const sx of [-1, 1]) rod([-0.1 + sx * 0.034, 0.345, -0.24], [-0.1 + sx * 0.034, 0.407, -0.24], 0.004, IRON, pk, 4);

  // shoulder straps of the pack
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.085, 0.7, -0.125],
        [s * 0.09, 0.77, -0.06],
        [s * 0.1, 0.775, 0.06],
        [s * 0.09, 0.7, 0.14],
        [s * 0.085, 0.56, 0.15],
      ]),
      [0.016, 0.016, 0.016, 0.014, 0.014],
      { color: LEATHER2, bone: spine2, sides: 4, smooth: false },
    );
  rod([-0.085, 0.62, 0.15], [0.085, 0.62, 0.15], 0.01, LEATHER2, spine2, 4);
  P(box(0.03, 0.026, 0.01), BRASS, [0, 0.62, 0.162], spine2);

  // toy clockwork robot riding the left shoulder
  P(box(0.05, 0.05, 0.04), TEAL, [0.175, 0.795, 0.0], spine2);
  P(box(0.042, 0.036, 0.036), STEEL, [0.175, 0.838, 0.0], spine2);
  for (const dx of [-0.01, 0.01]) glow(P(box(0.01, 0.01, 0.004), LAMP, [0.175 + dx, 0.84, 0.019], spine2), 1.2);
  rod([0.175, 0.856, 0], [0.175, 0.885, 0], 0.003, IRON, spine2, 4);
  P(sph(0.008, 4, 3), RED, [0.175, 0.89, 0], spine2);
  rod([0.2, 0.805, 0], [0.222, 0.79, 0.01], 0.006, STEEL, spine2, 4);
  rod([0.15, 0.805, 0], [0.128, 0.79, 0.01], 0.006, STEEL, spine2, 4);
  P(box(0.018, 0.012, 0.03), IRON, [0.16, 0.766, 0.0], spine2);
  P(box(0.018, 0.012, 0.03), IRON, [0.19, 0.766, 0.0], spine2);
  rod([0.175, 0.77, -0.02], [0.175, 0.77, -0.045], 0.004, BRASS, spine2, 4);

  return b.root;
}
