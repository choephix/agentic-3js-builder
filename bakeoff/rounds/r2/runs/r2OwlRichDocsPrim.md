```ts
import * as THREE from "three";
import { createBuilder, mottle, stripes, paint, grain } from "agentic-3js-builder";

export const meta = {
  name: "Great Horned Owl",
  description: "A great horned owl perched on a gnarled branch, with mottled barred plumage, ear tufts, a rimmed facial disc, orange eyes and black talons.",
};

const BROWN = "#6b4a2f";
const BUFF = "#c9a56b";
const DARK = "#2a1d14";
const TAWNY = "#cf9650";
const CREAM = "#efe3c8";
const ORANGE = "#ff9a1a";
const GREY = "#7d8186";
const BLACK = "#121212";
const BARK = "#5a4632";
const BARK2 = "#3f3022";

export default function build() {
  const b = createBuilder({ name: "greatHornedOwl" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.17, -0.12] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.17, -0.12],
      [0, 0.26, -0.04],
      [0, 0.38, 0.03],
      [0, 0.5, 0.05],
    ],
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const spine3 = spine.joints[2];
  const head = b.joint("head", { parent: spine3, at: [0, 0.54, 0.06], dir: [0, 1, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.572, 0.17], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    [
      [0, 0.19, -0.13],
      [0, 0.14, -0.23],
      [0, 0.1, -0.37],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---------- paints ----------
  const coat = mottle(BROWN, BUFF, { size: 0.05, contrast: 0.9 });
  const bars = stripes(CREAM, DARK, { size: 0.026, axis: "y", width: 0.28 });
  const bodyPaint = paint((p, n) => (n.z > 0.25 && p.y < 0.47 && p.y > 0.18 ? bars : coat));
  const wingPaint = stripes(mottle(BROWN, BUFF, { size: 0.04 }), DARK, { size: 0.034, axis: "z", width: 0.3 });
  const tailPaint = stripes(BROWN, DARK, { size: 0.032, axis: "z", width: 0.35 });
  const barkPaint = grain(BARK, BARK2, { size: 0.02, axis: "x" });

  // ---------- branch ----------
  b.sweep(
    [
      [-0.5, 0.06, 0.02],
      [-0.25, 0.065, -0.01],
      [0, 0.06, 0],
      [0.25, 0.07, 0.015],
      [0.5, 0.075, -0.01],
    ],
    [0.038, 0.048, 0.052, 0.046, 0.032],
    { color: barkPaint, bone: hips, sides: 7, caps: "round" },
  );
  b.sweep([[-0.2, 0.08, 0], [-0.28, 0.14, -0.05], [-0.38, 0.2, -0.07]], [0.02, 0.008], { color: BARK2, bone: hips, sides: 5, caps: "point" });
  b.sweep([[0.32, 0.09, 0.01], [0.4, 0.15, 0.06], [0.46, 0.25, 0.07]], [0.018, 0.006], { color: BARK2, bone: hips, sides: 5, caps: "point" });
  b.part(new THREE.SphereGeometry(0.032, 6, 5), BARK, { at: [0.27, 0.095, 0.015], bone: hips, scale: [1.2, 0.8, 1] });
  b.part(new THREE.SphereGeometry(0.028, 6, 5), BARK2, { at: [-0.34, 0.07, 0.01], bone: hips, scale: [1, 0.9, 1.1] });

  // ---------- body ----------
  b.sweep(spine, [0.075, 0.11, 0.125, 0.095], { color: bodyPaint, sides: 10 });
  // pale bib
  b.part(new THREE.SphereGeometry(0.06, 8, 6), CREAM, { at: [0, 0.49, 0.125], bone: spine3, scale: [1, 1.25, 0.6] });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), "#d9cba8", { at: [0, 0.545, 0.115], bone: spine3, scale: [1.3, 0.6, 0.7] });
  // dark necklace flecks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), DARK, { at: [s * 0.06, 0.505, 0.125], bone: spine3, scale: [0.7, 1.6, 0.6] });
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.1, 10, 8), coat, { at: [0, 0.6, 0.07], bone: head, scale: [1.3, 0.9, 1] });
  for (const s of [1, -1]) {
    // facial disc: black rim then tawny disc
    b.part(new THREE.SphereGeometry(0.078, 10, 8), BLACK, { at: [s * 0.056, 0.6, 0.142], bone: head, scale: [1.0, 1.1, 0.4] });
    b.part(new THREE.SphereGeometry(0.068, 10, 8), TAWNY, { at: [s * 0.056, 0.6, 0.15], bone: head, scale: [1.0, 1.05, 0.4] });
    // eyes
    b.part(new THREE.SphereGeometry(0.03, 8, 6), ORANGE, { at: [s * 0.05, 0.612, 0.174], bone: head });
    b.part(new THREE.SphereGeometry(0.017, 6, 5), BLACK, { at: [s * 0.05, 0.612, 0.197], bone: head });
    // brow
    b.part(new THREE.BoxGeometry(0.05, 0.014, 0.02), DARK, {
      at: [s * 0.058, 0.648, 0.17], bone: head, rotation: [0, 0, s * -22],
    });
    // ear tufts
    b.part(new THREE.ConeGeometry(0.028, 0.14, 5), BROWN, {
      at: [s * 0.07, 0.725, 0.05], bone: head, dir: [s * 0.3, 1, -0.15],
    });
    b.part(new THREE.ConeGeometry(0.014, 0.1, 5), DARK, {
      at: [s * 0.072, 0.72, 0.066], bone: head, dir: [s * 0.3, 1, -0.15],
    });
    b.part(new THREE.ConeGeometry(0.012, 0.08, 4), BUFF, {
      at: [s * 0.058, 0.708, 0.04], bone: head, dir: [s * 0.3, 1, -0.15],
    });
  }
  // beak
  b.part(new THREE.ConeGeometry(0.02, 0.06, 6), GREY, { at: [0, 0.585, 0.2], bone: head, dir: [0, -0.55, 1] });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 6), "#5d6166", { at: [0, 0.563, 0.2], bone: jaw, dir: [0, -0.1, 1] });

  // ---------- wings ----------
  const wingOutline: [number, number, "sharp"?][] = [
    [0, 0.02],
    [0.02, -0.1],
    [0.08, -0.22],
    [0.18, -0.33],
    [0.3, -0.37, "sharp"],
    [0.26, -0.22],
    [0.2, -0.08],
    [0.12, 0.04],
    [0.06, 0.08],
  ];
  for (const s of [1, -1]) {
    const w = b.joint(s > 0 ? "wingL" : "wingR", {
      parent: spine2, at: [s * 0.115, 0.46, 0.06], dir: [s * 0.1, -1, -0.5], role: "wing",
    });
    b.extrude(wingOutline as any, {
      at: [s * 0.122, 0.46, 0.07], x: [0, 0, -1], y: [0, 1, 0],
      thickness: 0.04, bevel: 0.01, smoothing: 1, color: wingPaint, bone: w,
    });
    // shoulder cover
    b.part(new THREE.SphereGeometry(0.06, 7, 5), coat, { at: [s * 0.115, 0.44, 0.03], bone: w, scale: [0.6, 1.1, 1.3] });
  }

  // ---------- tail ----------
  b.sweep(tail, (t) => [0.05 + 0.012 * t, 0.012], { color: tailPaint, section: "box", caps: "flat" });

  // ---------- legs & talons ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.07, 0.2, 0.0],
      [s * 0.07, 0.16, 0.035],
      [s * 0.07, 0.115, 0.01],
    ];
    const leg = b.chain(`leg${side}`, pts, {
      parent: spine1, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg",
    });
    b.sweep(leg, [0.055, 0.032], { color: bodyPaint, sides: 8 });
    b.part(new THREE.SphereGeometry(0.06, 8, 6), BUFF, { at: [s * 0.08, 0.17, 0.03], bone: leg.joints[0], scale: [0.8, 1.1, 1.0] });
    const foot = leg.tip!;
    const fx = s * 0.07;
    const toes: [number, number][] = [[-0.022, 1], [0, 1], [0.022, 1], [0, -1]];
    toes.forEach(([ox, k], i) => {
      const reach = k > 0 ? 0.04 : 0.035;
      const c = [fx + s * ox * 1.2, 0.087, 0.01 + k * reach];
      b.sweep(
        [[fx, 0.115, 0.01], [fx + s * ox * 0.6, 0.106, 0.01 + k * reach * 0.6], c],
        [0.013, 0.011],
        { color: "#b99a6a", bone: foot, sides: 5, caps: "round", name: `toe${side}${i}` },
      );
      b.part(new THREE.ConeGeometry(0.011, 0.04, 5), BLACK, {
        at: [c[0], c[1] - 0.016, c[2] + k * 0.006], bone: foot, dir: [0, -1, k * 0.35],
      });
    });
  }

  return b.root;
}
```