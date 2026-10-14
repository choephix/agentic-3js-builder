import * as THREE from "three";
import { createBuilder, rng, paint, mottle, grain, countershade, catmull } from "../../../../src/index";

export const meta = {
  name: "Moss Stone Forest Spirit",
  description:
    "A small deer-like forest spirit with a river-stone body under soft moss, slender wooden legs and hooves, flowering antlers, a pale wooden mask face with glowing green eyes, and fireflies circling its head.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "mossSpirit" });
  const rand = rng(11);

  // ---------- paints ----------
  const stone = mottle("#8b9190", "#6c7273", { size: 0.07, seed: 1 });
  const moss = mottle("#4e8a3a", "#76b04f", { size: 0.045, seed: 2, contrast: 1.4 });
  const bodyPaint = countershade(moss, stone, { level: 0.05, soft: 0.3 });
  const legWood = grain("#c9a87a", "#9c7a4e", { size: 0.01, axis: "y" });
  const maskWood = grain("#efe0bd", "#d8c398", { size: 0.012, axis: "y" });
  const antlerWood = grain("#6b4a2e", "#8e6942", { size: 0.01, axis: "y" });
  const DARK = "#2c2119";

  const sphere = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
  const unit = new THREE.SphereGeometry(1, 8, 6);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.62, 0], dir: [0, 0, 1], role: "spine" });
  b.chain(
    "spine",
    [
      [0, 0.64, -0.28],
      [0, 0.66, 0],
      [0, 0.68, 0.28],
    ],
    { names: ["spine1", "spine2"], parent: "root", role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.72, 0.26],
      [0, 0.86, 0.33],
      [0, 1.0, 0.42],
    ],
    { names: ["neck1", "neck2"], parent: "spine2", role: "neck" },
  );
  b.joint("head", { parent: "neck2", at: [0, 1.0, 0.42], dir: [0, 0.25, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.985, 0.5], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.68, -0.32],
      [0, 0.72, -0.42],
      [0, 0.76, -0.52],
    ],
    { names: ["tail1", "tail2"], parent: "spine1", role: "tail" },
  );

  // ---------- body of stone and moss ----------
  const main = b.part({ geometry: unit, color: bodyPaint, at: [0, 0.62, 0], scale: [0.2, 0.19, 0.36], bone: "root", flat: true });
  const rump = b.part({ geometry: unit, color: bodyPaint, at: [0, 0.62, -0.2], scale: [0.19, 0.19, 0.19], bone: "root", flat: true });
  const chest = b.part({ geometry: unit, color: bodyPaint, at: [0, 0.65, 0.2], scale: [0.19, 0.2, 0.2], bone: "root", flat: true });
  // stone lumps on the back
  b.part({ geometry: unit, color: bodyPaint, at: [0.07, 0.8, -0.06], scale: [0.09, 0.07, 0.11], bone: "root", rotation: [10, 25, 8], flat: true });
  b.part({ geometry: unit, color: bodyPaint, at: [-0.08, 0.79, 0.1], scale: [0.08, 0.06, 0.09], bone: "root", rotation: [-8, -20, 5], flat: true });

  // moss clumps and flowers seated on the body
  const surf = b.surface([main.mesh, rump.mesh, chest.mesh]);
  const greens = ["#4a8636", "#5f9a42", "#78b552", "#3f7430"];
  const clumpG = sphere(0.035, 6, 4);
  surf.scatter(30, { rng: rng(5), minDist: 0.07, filter: (h) => h.n.y > 0.25 }).forEach((h, i) => {
    b.stick(clumpG, greens[i % greens.length], h, { embed: 0.45, scale: [1, 0.6, 1], bone: "root" });
  });
  const petalG = sphere(0.011, 5, 4);
  const centerG = sphere(0.008, 5, 4);
  surf.scatter(7, { rng: rng(9), minDist: 0.12, filter: (h) => h.n.y > 0.6 }).forEach((h) => {
    b.stick(petalG, "#ffffff", h, { embed: 0.3, bone: "root" });
    b.stick(centerG, "#ffd54a", h.moved([0, 0.012, 0]), { embed: 0.2, bone: "root" });
  });

  // ---------- legs ----------
  const legSpec: Array<[string, number, number[][]]> = [
    ["F", 1, [[0.11, 0.52, 0.22], [0.11, 0.3, 0.25], [0.11, 0.14, 0.22], [0.11, 0.05, 0.23]]],
    ["H", 1, [[0.11, 0.52, -0.22], [0.11, 0.32, -0.19], [0.11, 0.15, -0.27], [0.11, 0.05, -0.25]]],
  ];
  const hoofG = new THREE.CylinderGeometry(0.026, 0.036, 0.05, 6);
  for (const [tag, , pts] of legSpec)
    for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
      const path = pts.map(([x, y, z]) => [x * sx, y, z]);
      const leg = b.chain(`leg${tag}${side}`, path, {
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`, `hoof${tag}${side}`],
        parent: "root",
        role: "leg",
      });
      b.sweep(leg, { radius: [0.036, 0.026, 0.018, 0.02], color: legWood, caps: "round" });
      // knee knobs
      b.part(sphere(0.026), legWood, { at: path[1], bone: leg.joints[1] });
      b.part(hoofG, DARK, { at: [path[3][0], 0.025, path[3][2]], bone: leg.tip! });
    }

  // ---------- neck ----------
  b.sweep(neck, { radius: [0.09, 0.065, 0.052], color: bodyPaint, caps: "round" });
  // moss mane on the neck
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    b.part(sphere(0.03, 6, 4), greens[i % 4], {
      at: [0, 0.78 + 0.2 * t, 0.29 + 0.11 * t],
      scale: [0.9, 1, 1],
      bone: i < 2 ? "neck1" : "neck2",
    });
  }

  // ---------- head: wooden mask ----------
  b.part({ geometry: unit, color: maskWood, at: [0, 1.04, 0.45], scale: [0.07, 0.08, 0.1], bone: "head", flat: true });
  b.capsule([0, 1.02, 0.5], [0, 0.995, 0.62], { radius: [0.05, 0.03], color: maskWood, bone: "head" });
  b.capsule([0, 0.97, 0.5], [0, 0.96, 0.61], { radius: [0.03, 0.022], color: maskWood, bone: "jaw" });
  b.part(sphere(0.014), DARK, { at: [0, 1.0, 0.635], bone: "head" });
  // mossy cap
  b.part({ geometry: unit, color: moss, at: [0, 1.105, 0.41], scale: [0.075, 0.035, 0.07], bone: "head", flat: true });
  // brow ridges
  for (const sx of [1, -1]) {
    b.part({ geometry: unit, color: DARK, at: [sx * 0.05, 1.085, 0.52], scale: [0.03, 0.006, 0.012], bone: "head", rotation: [0, 0, sx * -15] });
    // eyes: dark socket and green glow
    b.part({ geometry: unit, color: DARK, at: [sx * 0.05, 1.06, 0.508], scale: [0.03, 0.03, 0.016], bone: "head" });
    b.part(sphere(0.02, 8, 6), "#7dff6a", { at: [sx * 0.05, 1.06, 0.518], bone: "head" });
    b.part(sphere(0.008, 5, 4), "#eaffd8", { at: [sx * 0.05, 1.063, 0.536], bone: "head" });
    // ears
    b.part({ geometry: unit, color: legWood, at: [sx * 0.08, 1.115, 0.4], scale: [0.012, 0.045, 0.022], bone: "head", rotation: [0, 0, sx * -38] });
    b.part({ geometry: unit, color: "#e8b9a0", at: [sx * 0.08, 1.115, 0.41], scale: [0.006, 0.034, 0.014], bone: "head", rotation: [0, 0, sx * -38] });
  }

  // ---------- antlers with flowers and leaves ----------
  const leafColors = ["#5aa045", "#7cc15a", "#3f8a3a"];
  const flower = (at: number[]) => {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(petalG, "#ffffff", { at: [at[0] + Math.cos(a) * 0.013, at[1] + Math.sin(a) * 0.013, at[2]], scale: [0.8, 0.8, 0.5], bone: "head" });
    }
    b.part(centerG, "#ffd54a", { at: [at[0], at[1], at[2] + 0.004], bone: "head" });
  };
  const leaf = (at: number[]) => {
    b.part({
      geometry: unit,
      color: leafColors[Math.floor(rand() * 3)],
      at,
      scale: [0.007, 0.003, 0.02],
      rotation: [rand() * 120 - 60, rand() * 360, rand() * 60 - 30],
      bone: "head",
    });
  };
  for (const sx of [1, -1]) {
    const P = [[0.04, 1.09, 0.41], [0.09, 1.2, 0.39], [0.13, 1.3, 0.36], [0.12, 1.41, 0.37]].map(([x, y, z]) => [x * sx, y, z]);
    b.sweep(catmull(P), { radius: [0.016, 0.012, 0.008, 0.004], color: antlerWood, bone: "head", caps: "round" });
    const tines: Array<[number[], number[]]> = [
      [P[1], [0.2 * sx, 1.3, 0.46]],
      [P[1], [0.15 * sx, 1.29, 0.28]],
      [P[2], [0.24 * sx, 1.41, 0.38]],
      [P[2], [0.07 * sx, 1.42, 0.46]],
      [P[3], [0.18 * sx, 1.5, 0.4]],
    ];
    tines.forEach(([a, tip], i) => {
      b.capsule(a, tip, { radius: [0.009, 0.003], color: antlerWood, bone: "head" });
      if (i % 2 === 0) flower([tip[0], tip[1] + 0.008, tip[2] + 0.008]);
      else leaf([tip[0], tip[1] + 0.005, tip[2]]);
      leaf([(a[0] + tip[0]) / 2, (a[1] + tip[1]) / 2 + 0.006, (a[2] + tip[2]) / 2]);
    });
    flower([P[3][0], P[3][1] + 0.02, P[3][2]]);
    leaf([P[2][0], P[2][1] - 0.03, P[2][2] + 0.01]);
  }

  // ---------- tail ----------
  b.sweep(tail, { radius: [0.03, 0.045, 0.012], color: moss, caps: "round" });

  // ---------- fireflies ----------
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const at = [Math.sin(a) * 0.3, 1.0 + 0.12 * Math.sin(a * 2 + 1) + 0.08, 0.45 + Math.cos(a) * 0.3];
    b.part(sphere(0.016, 6, 5), "#f6ff8a", { at, bone: "root" });
    b.part(sphere(0.008, 5, 4), "#4a4a2a", { at: [at[0], at[1] - 0.012, at[2]], bone: "root" });
    for (const w of [1, -1])
      b.part({ geometry: unit, color: "#ffffff", at: [at[0] + w * 0.014, at[1] + 0.012, at[2]], scale: [0.012, 0.002, 0.008], rotation: [0, 0, w * 25], bone: "root" });
  }

  return b.root;
}
