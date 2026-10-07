```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep } from "agentic-3js-builder";
import type { OutlinePoint, Joint } from "agentic-3js-builder";

export const meta = {
  name: "Red-eyed tree frog on a leaf",
  description:
    "A lime-green red-eyed tree frog with blue and cream barred flanks, orange toes with round sticky pads and big ruby eyes with slit pupils, clinging to a veined leaf on a stem. Rigged with spine, head, jaw, eyes, four limbs and toes.",
};

const LIME = "#74d62a";
const LIME2 = "#58c01f";
const CREAM = "#f6efd6";
const BLUE = "#2f63d6";
const ORANGE = "#ff7b12";
const PAD = "#ff9a2a";

const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "redEyedTreeFrog", paintSize: 2048 });

  // ---------- paints ----------
  const bodyPaint = paint((p, n) => {
    if (n.y < -0.55) return CREAM;
    if (Math.abs(n.x) > 0.45 && p.z < 0.03 && n.y < 0.22) {
      if (n.y > 0.1) return CREAM;
      const bar = ((p.z + 1) / 0.0085 + n.y * 0.8) % 1;
      return bar < 0.62 ? BLUE : CREAM;
    }
    return mix(LIME, LIME2, smoothstep(0.35, 0.65, noise(p, 0.012, 3)));
  });
  const headPaint = paint((p, n) =>
    n.y < -0.5 ? CREAM : mix(LIME, LIME2, smoothstep(0.35, 0.65, noise(p, 0.01, 5))),
  );
  const limbPaint = paint((p, n) =>
    n.y < -0.35 ? "#efe3b8" : mix(LIME, LIME2, smoothstep(0.35, 0.65, noise(p, 0.01, 8))),
  );

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.04, -0.03] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.046, -0.036],
      [0, 0.048, -0.012],
      [0, 0.051, 0.012],
      [0, 0.054, 0.03],
    ]),
    { parent: "root", role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.0545, 0.03],
    dir: [0, 0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0443, 0.03], dir: [0, 0, 1], role: "jaw" });

  // ---------- body ----------
  b.sweep(
    spine,
    (t: number): [number, number] => {
      const w = Math.sin(Math.PI * (0.12 + 0.8 * t));
      return [0.006 + 0.017 * w, 0.006 + 0.012 * w];
    },
    { color: bodyPaint, sides: 10, name: "body" },
  );

  // ---------- head ----------
  b.part(sph(1, 14, 9), headPaint, {
    at: [0, 0.0565, 0.041],
    scale: [0.021, 0.016, 0.0185],
    bone: head,
    name: "head",
  });
  b.part(sph(1, 12, 6), headPaint, {
    at: [0, 0.0443, 0.0415],
    scale: [0.0125, 0.0038, 0.0115],
    bone: jaw,
    name: "lowerJaw",
  });
  for (const s of [1, -1]) {
    b.part(sph(0.0009, 6, 4), "#1c3b14", {
      at: [s * 0.0045, 0.0605, 0.0582],
      bone: head,
      name: "nostril",
    });
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const center = new THREE.Vector3(s * 0.0165, 0.067, 0.036);
    const d = new THREE.Vector3(s * 0.5, 0.12, 0.86).normalize();
    const eye = b.joint("eye" + L, { parent: head, at: center.toArray(), dir: d.toArray() });
    b.part(sph(0.0125, 14, 10), "#c8102e", { at: center.toArray(), bone: eye, name: "eyeball" });
    b.part(sph(0.0065, 10, 6), "#ff6a1a", {
      at: center.clone().addScaledVector(d, 0.0113).toArray(),
      dir: d.toArray(),
      up: [0, 1, 0],
      scale: [1, 0.3, 1],
      bone: eye,
      name: "iris",
    });
    b.part(sph(1, 8, 6), "#050505", {
      at: center.clone().addScaledVector(d, 0.0123).toArray(),
      dir: d.toArray(),
      up: [0, 1, 0],
      scale: [0.0016, 0.0012, 0.0055],
      bone: eye,
      name: "pupil",
    });
    const d2 = new THREE.Vector3(s * 0.35, 0.7, 0.6).normalize();
    b.part(sph(0.0012, 6, 4), "#ffffff", {
      at: center.clone().addScaledVector(d2, 0.0123).toArray(),
      bone: eye,
      name: "glint",
    });
  }

  // ---------- limbs ----------
  const toes = (parent: Joint, tag: string, base: number[], s: number, angles: number[], lens: number[]) =>
    angles.forEach((a, i) => {
      const r = (a * Math.PI) / 180;
      const tip = [base[0] + s * Math.sin(r) * lens[i], base[1], base[2] + Math.cos(r) * lens[i]];
      const nm = `toe${tag}${i + 1}`;
      const ch = b.chain(nm, [base, tip], { parent, names: [nm], role: "digit" });
      b.sweep(ch, [0.0016, 0.0012], { color: ORANGE, sides: 6 });
      b.part(sph(0.0037, 10, 6), PAD, { at: tip, bone: ch.joints[0], scale: [1, 0.55, 1], name: "stickyPad" });
    });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const X = (x: number, y: number, z: number) => [s * x, y, z];

    // hind leg, folded
    const hp = [X(0.022, 0.044, -0.022), X(0.043, 0.046, 0.006), X(0.034, 0.0375, -0.026), X(0.037, 0.0365, -0.012)];
    const hind = b.chain(`legH${L}`, hp, {
      parent: spine.joints[0],
      names: [`hipH${L}`, `kneeH${L}`, `ankleH${L}`, `footH${L}`],
      role: "leg",
    });
    b.sweep(hind, [0.0085, 0.0068, 0.0046, 0.0036], {
      bands: [
        [0.75, limbPaint],
        [1, ORANGE],
      ],
      sides: 8,
      name: `hindLeg${L}`,
    });
    toes(hind.tip!, `H${L}`, X(0.037, 0.0338, -0.012), s, [-32, -11, 11, 32], [0.012, 0.015, 0.015, 0.012]);

    // front arm
    const ap = [X(0.019, 0.046, 0.02), X(0.03, 0.039, 0.012), X(0.031, 0.0355, 0.03)];
    const arm = b.chain(`armF${L}`, ap, {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.0055, 0.0042, 0.0036], {
      bands: [
        [0.88, limbPaint],
        [1, ORANGE],
      ],
      sides: 8,
      name: `foreLeg${L}`,
    });
    toes(arm.tip!, `F${L}`, X(0.031, 0.0338, 0.03), s, [-36, -12, 12, 36], [0.009, 0.0105, 0.0105, 0.009]);
  }

  // ---------- leaf ----------
  const outline: OutlinePoint[] = [
    [0, -0.09, "sharp"],
    [0.045, -0.06],
    [0.085, 0.0],
    [0.09, 0.05],
    [0.065, 0.11],
    [0.03, 0.16],
    [0, 0.2, "sharp"],
    [-0.03, 0.16],
    [-0.065, 0.11],
    [-0.09, 0.05],
    [-0.085, 0.0],
    [-0.045, -0.06],
  ];
  b.extrude(outline, {
    color: "#2f8a2a",
    at: [0, 0.03, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.003,
    smoothing: 1,
    bevel: 0.0008,
    bone: "root",
    name: "leaf",
  });
  b.rod([0, 0.0318, -0.09], [0, 0.0318, 0.19], { radius: [0.002, 0.0008], color: "#7cc65a", bone: "root", sides: 6, name: "midrib" });
  const zs = [-0.04, 0, 0.04, 0.08, 0.12];
  const ws = [0.035, 0.07, 0.075, 0.055, 0.03];
  zs.forEach((z, i) => {
    for (const s of [1, -1])
      b.rod([0, 0.0318, z], [s * ws[i], 0.0318, z + 0.035], {
        radius: [0.0011, 0.0006],
        color: "#6fb94f",
        bone: "root",
        sides: 5,
        name: "vein",
      });
  });

  // stem and soil mound reaching the floor
  b.sweep(
    catmull([
      [0, 0.029, -0.085],
      [0, 0.024, -0.115],
      [0, 0.012, -0.14],
      [0, 0.006, -0.16],
    ]),
    0.0035,
    { color: "#4a7a2a", bone: "root", sides: 7, name: "stem" },
  );
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.026, 0.006],
      [0, 0.007],
    ],
    { color: "#5a4026", at: [0, 0, -0.16], segments: 10, bone: "root", name: "soil" },
  );

  return b.root;
}
```