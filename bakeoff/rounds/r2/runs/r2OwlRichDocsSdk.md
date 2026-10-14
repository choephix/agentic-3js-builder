```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, paint, mottle, stripes, grain } from "agentic-3js-builder";

export const meta = {
  name: "Great Horned Owl",
  description: "A great horned owl perched on a gnarled branch: barred and mottled plumage, tall ear tufts, a rimmed facial disc, big orange eyes, a hooked beak and feathered legs with black talons.",
};

const BROWN = "#6b4a2f";
const DARKB = "#3b2818";
const BUFF = "#c9a56e";
const TAWNY = "#b98a4e";
const PALE = "#efe3c8";
const ORANGE = "#f08a12";
const BLACK = "#15110e";
const GREY = "#7d8084";
const BARK = "#5b4634";

export default function build() {
  const b = createBuilder({ name: "greatHornedOwl" });
  const rand = rng(11);

  // ---------- paints ----------
  const back = stripes(mottle(BROWN, "#4d3622", { size: 0.035, seed: 2 }), DARKB, { size: 0.03, axis: "y", width: 0.22, wobble: 0.4, seed: 3 });
  const chest = stripes(mottle(BUFF, TAWNY, { size: 0.04, seed: 5 }), "#6b4a30", { size: 0.026, axis: "y", width: 0.25, wobble: 0.5, seed: 4 });
  const coat = paint((_p, n, _s) => (n.z > 0.15 ? chest : back));
  const legPaint = stripes(BUFF, "#8a6a44", { size: 0.022, axis: "y", width: 0.3, seed: 8 });
  const tailPaint = stripes(BROWN, DARKB, { size: 0.05, axis: [0, -1, -0.35], width: 0.4, seed: 9 });
  const barkPaint = grain(mottle(BARK, "#3d2e22", { size: 0.02, seed: 6 }), "#2e2219", { size: 0.012, axis: "x" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.2, -0.06] });
  const perch = b.joint("perch", { parent: hips, at: [0, 0.05, 0], dir: [1, 0, 0] });
  const spine = b.chain("spine", catmull([[0, 0.2, -0.06], [0, 0.28, -0.04], [0, 0.37, 0.0]]), {
    parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine",
  });
  const spineTop = spine.joints[2];
  const head = b.joint("head", { parent: spineTop, at: [0, 0.43, 0.02], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.445, 0.12], dir: [0, -0.05, 1], role: "jaw" });
  const tail = b.joint("tail1", { parent: hips, at: [0, 0.24, -0.12], dir: [0, -1, -0.35], role: "tail" });

  // ---------- body ----------
  const body = b.sweep(spine, (t) => {
    const w = 0.095 + 0.06 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1));
    return [w * 1.05, w * 0.95] as [number, number];
  }, { color: coat, sides: 10 });

  const palette = [BUFF, BROWN, "#4a3322", TAWNY];
  const skin = b.surface(body);
  for (const hit of skin.scatter(90, { rng: rand, minDist: 0.035, filter: (h) => h.n.y > -0.5 })) {
    const front = hit.n.z > 0.15;
    const c = front ? (rand() < 0.5 ? BUFF : "#8a6a44") : palette[Math.floor(rand() * 4)];
    b.stick(new THREE.SphereGeometry(0.022, 5, 3), c, hit, { scale: [1, 0.4, 1.4], flow: [0, -1, 0], embed: 0.3 });
  }

  // bib
  b.part(new THREE.SphereGeometry(0.06, 10, 8), stripes(PALE, "#8a6a48", { size: 0.03, axis: "y", width: 0.1 }), {
    bone: spineTop, at: [0, 0.385, 0.105], scale: [1, 0.9, 0.5],
  });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.1, 12, 9), coat, { bone: head, at: [0, 0.465, 0.04], scale: [1.25, 0.95, 1] });
  for (const s of [1, -1]) {
    // facial disc with black rim
    b.part(new THREE.SphereGeometry(0.082, 12, 8), BLACK, { bone: head, at: [s * 0.058, 0.465, 0.113], scale: [1, 1.08, 0.28] });
    b.part(new THREE.SphereGeometry(0.075, 12, 8), TAWNY, { bone: head, at: [s * 0.058, 0.465, 0.12], scale: [1, 1.05, 0.3] });
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const x = s * 0.058 + 0.08 * Math.cos(a);
      if (Math.abs(x) < 0.022) continue;
      b.part(new THREE.SphereGeometry(0.014, 5, 4), i % 2 ? BLACK : "#5a3f27", {
        bone: head, at: [x, 0.465 + 0.087 * Math.sin(a), 0.112], scale: [1, 1, 0.7],
      });
    }
    // eyes
    b.part(new THREE.SphereGeometry(0.04, 8, 6), BLACK, { bone: head, at: [s * 0.052, 0.475, 0.13], scale: [1, 1, 0.5] });
    b.part(new THREE.SphereGeometry(0.03, 10, 8), ORANGE, { bone: head, at: [s * 0.052, 0.475, 0.135] });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), BLACK, { bone: head, at: [s * 0.052, 0.475, 0.158] });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", { bone: head, at: [s * 0.058, 0.482, 0.173] });
    // brow
    b.rod([s * 0.016, 0.525, 0.125], [s * 0.088, 0.505, 0.118], 0.011, { bone: head, color: DARKB });
    b.rod([s * 0.008, 0.512, 0.135], [s * 0.026, 0.495, 0.14], 0.009, { bone: head, color: PALE });
    // ear tuft
    const X: [number, number, number] = [s, 0, 0];
    const Y: [number, number, number] = [s * 0.25, 1, 0.1];
    b.extrude(
      [[-0.025, 0], [0.025, 0], [0.03, 0.05], [0.02, 0.11], [0, 0.16, "sharp"], [-0.015, 0.1], [-0.028, 0.05]],
      { at: [s * 0.06, 0.525, 0.06], x: X, y: Y, thickness: 0.02, color: back, bone: head },
    );
    b.extrude(
      [[-0.01, 0.01], [0.012, 0.01], [0.014, 0.09], [0, 0.145], [-0.01, 0.09]],
      { at: [s * 0.06, 0.525, 0.06], x: X, y: Y, thickness: 0.026, color: BLACK, bone: head },
    );
  }

  // beak
  b.sweep(bezier([0, 0.452, 0.125], [0, 0.462, 0.16], [0, 0.45, 0.185], [0, 0.418, 0.192]), [0.024, 0.002], {
    bone: head, color: GREY, sides: 6, caps: "point",
  });
  b.sweep([[0, 0.438, 0.125], [0, 0.43, 0.16]], [0.016, 0.006], { bone: jaw, color: "#5f6266", sides: 6, caps: "round" });

  // ---------- wings ----------
  const wingParts = [];
  for (const s of [1, -1]) {
    const wing = b.extrude(
      [[0, 0], [0.1, 0.015], [0.2, -0.04], [0.3, -0.17], [0.35, -0.27, "sharp"], [0.25, -0.22], [0.12, -0.2], [0.03, -0.15], [-0.01, -0.07]],
      { at: [s * 0.16, 0.42, 0.07], x: [0, 0, -1], y: [0, 1, 0], thickness: [0.045, 0.025], bevel: 0.008, smoothing: 1,
        color: stripes(mottle(BROWN, "#4d3622", { size: 0.04, seed: 12 }), DARKB, { size: 0.032, axis: "y", width: 0.25, seed: 13 }),
        bone: spineTop },
    );
    wingParts.push(wing);
  }
  const wsk = b.surface(wingParts);
  for (const hit of wsk.scatter(46, { rng: rand, minDist: 0.04, filter: (h) => Math.abs(h.n.x) > 0.7 })) {
    b.stick(new THREE.SphereGeometry(0.024, 5, 3), palette[Math.floor(rand() * 4)], hit, { scale: [1, 0.35, 1.6], flow: [0, -1, 0], embed: 0.3 });
  }

  // ---------- tail ----------
  b.extrude(
    [[-0.05, 0], [0.05, 0], [0.075, 0.12], [0.07, 0.2], [0.03, 0.24], [-0.03, 0.24], [-0.07, 0.2], [-0.075, 0.12]],
    { at: [0, 0.24, -0.12], x: [1, 0, 0], y: [0, -1, -0.35], thickness: [0.03, 0.012], bevel: 0.004, color: tailPaint, bone: tail },
  );

  // ---------- legs and talons ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.08, 0.21, 0.02], [s * 0.055, 0.1, 0.015], [0.09, 0.08], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg",
    });
    b.sweep(leg, [0.05, 0.036], { color: legPaint, sides: 8 });
    const ankle = leg.joints[2];
    const fx = s * 0.055;
    const toes: { d: number; path: number[][]; dir: number[] }[] = [
      { d: -0.028, path: [[fx - 0.014, 0.098, 0.015], [fx - 0.028, 0.088, 0.045], [fx - 0.034, 0.062, 0.064]], dir: [-0.1, -0.85, 0.5] },
      { d: 0, path: [[fx, 0.098, 0.015], [fx, 0.09, 0.047], [fx, 0.062, 0.066]], dir: [0, -0.85, 0.5] },
      { d: 0.028, path: [[fx + 0.014, 0.098, 0.015], [fx + 0.028, 0.088, 0.045], [fx + 0.034, 0.062, 0.064]], dir: [0.1, -0.85, 0.5] },
      { d: 0, path: [[fx, 0.098, 0.0], [fx, 0.088, -0.04], [fx, 0.062, -0.058]], dir: [0, -0.85, -0.5] },
    ];
    toes.forEach((t, k) => {
      const toe = b.chain(`toe${k}${side}`, catmull(t.path), {
        parent: ankle, count: 2, names: (i) => `toe${k}${side}${i + 1}`, role: "digit",
      });
      b.sweep(toe, [0.012, 0.009], { color: "#a08258", sides: 6 });
      b.spike(toe.at(1), t.dir, 0.038, 0.009, { color: BLACK, sides: 6 });
    });
  }

  // ---------- branch ----------
  const bpath = catmull([[-0.6, 0.07, 0.02], [-0.3, 0.055, -0.02], [0, 0.05, 0], [0.3, 0.06, 0.03], [0.6, 0.1, 0]]);
  const branch = b.sweep(bpath, (t) => 0.05 - 0.016 * Math.pow(Math.abs(2 * t - 1), 2) + 0.004 * Math.sin(t * 25), {
    bone: perch, color: barkPaint, sides: 7, smooth: false,
  });
  b.sweep(bezier([0.34, 0.07, 0.03], [0.4, 0.14, 0.04], [0.5, 0.22, 0.0]), [0.025, 0.008], { bone: perch, color: barkPaint, sides: 6, caps: "point" });
  b.sweep(bezier([0.43, 0.15, 0.03], [0.46, 0.19, 0.06], [0.5, 0.24, 0.08]), [0.012, 0.004], { bone: perch, color: BARK, sides: 5, caps: "point" });
  b.sweep(bezier([-0.3, 0.06, -0.01], [-0.33, 0.15, -0.04], [-0.4, 0.2, -0.08]), [0.026, 0.01], { bone: perch, color: barkPaint, sides: 6, caps: "flat" });
  b.sweep(bezier([-0.5, 0.075, 0.02], [-0.55, 0.05, 0.08], [-0.6, 0.02, 0.1]), [0.014, 0.004], { bone: perch, color: BARK, sides: 5, caps: "point" });
  const bsk = b.surface(branch);
  for (const hit of bsk.scatter(14, { rng: rng(21), minDist: 0.08, filter: (h) => h.n.y > -0.2 && Math.abs(h.at.x) > 0.12 })) {
    b.stick(new THREE.SphereGeometry(0.02 + rand() * 0.012, 6, 4), rand() < 0.5 ? "#4a382a" : "#6b5440", hit, { scale: [1, 0.7, 1], embed: 0.4, bone: perch });
  }

  return b.root;
}
```