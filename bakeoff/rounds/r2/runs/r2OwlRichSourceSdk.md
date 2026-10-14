```ts
import * as THREE from "three";
import { createBuilder, catmull, gradient, mottle, stripes, spots, paint } from "agentic-3js-builder";

export const meta = {
  name: "Great Horned Owl",
  description:
    "A great horned owl perched on a gnarled branch: barred bark-brown and buff plumage, pale throat bib, tall ear tufts, black-rimmed tawny facial discs, huge orange eyes, hooked beak and black talons gripping the wood.",
};

export default function build() {
  const b = createBuilder({ name: "greatHornedOwl" });

  const BROWN = "#6b4a2f";
  const MID = "#8c6a44";
  const BUFF = "#c9a46a";
  const DARK = "#2a1d14";
  const CREAM = "#efe3c8";
  const TAWNY = "#c98f4a";

  // ---------- skeleton ----------
  b.joint("pelvis", { at: [0, 0.28, -0.04], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.28, -0.04],
      [0, 0.38, 0.0],
      [0, 0.48, 0.04],
    ],
    { parent: "pelvis", names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  b.chain(
    "neck",
    [
      [0, 0.48, 0.04],
      [0, 0.53, 0.055],
      [0, 0.56, 0.065],
    ],
    { parent: "spine3", names: ["neck1", "neck2"], role: "neck" },
  );
  b.joint("head", { parent: "neck2", at: [0, 0.56, 0.065], dir: [0, 0.3, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.54, 0.11], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    [
      [0, 0.25, -0.07],
      [0, 0.14, -0.15],
      [0, 0.04, -0.21],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- paints ----------
  const back = stripes(mottle(BROWN, MID, { size: 0.035, seed: 2 }), DARK, { size: 0.03, axis: "y", width: 0.2, seed: 3 });
  const belly = stripes(BUFF, DARK, { size: 0.022, axis: "y", width: 0.3, wobble: 0.7, seed: 5 });
  const bodyPaint = paint((p, n) => (n.z > 0.2 ? belly : back));
  const headPaint = stripes(mottle(BROWN, MID, { size: 0.03, seed: 8 }), DARK, { size: 0.02, axis: "y", width: 0.18 });
  const wingPaint = stripes(mottle(BROWN, MID, { size: 0.03, seed: 4 }), DARK, { size: 0.028, axis: "y", width: 0.3 });
  const covertPaint = spots(BROWN, [CREAM, BUFF], { size: 0.03, amount: 0.5, seed: 6 });
  const tailPaint = stripes(MID, DARK, { size: 0.032, axis: "y", width: 0.32 });
  const legPaint = stripes(BUFF, MID, { size: 0.014, axis: "y", width: 0.3 });
  const tuftPaint = stripes(
    gradient(BROWN, DARK, [0, 0.62, 0], [0, 0.73, 0]),
    "#d9bd86",
    { size: 0.025, axis: "y", width: 0.2 },
  );

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.22, -0.08], w: 0.1, h: 0.1 },
      { at: [0, 0.3, -0.04], w: 0.2, h: 0.2 },
      { at: [0, 0.4, 0.0], w: 0.25, h: 0.24 },
      { at: [0, 0.48, 0.03], w: 0.2, h: 0.19 },
      { at: [0, 0.52, 0.05], w: 0.12, h: 0.12 },
    ],
    { color: bodyPaint, bone: spine, name: "body" },
  );
  // pale bib
  b.part(new THREE.SphereGeometry(1, 10, 8), stripes(CREAM, "#cdbb94", { size: 0.015, axis: "y", width: 0.2 }), {
    at: [0, 0.495, 0.1],
    scale: [0.058, 0.045, 0.045],
    bone: "spine3",
    name: "bib",
  });

  // ---------- tail ----------
  b.sweep(tail, (t) => [0.055 - 0.012 * t, 0.012], {
    color: tailPaint,
    caps: { start: "round", end: "flat" },
    name: "tailFeathers",
  });

  // ---------- head ----------
  const headPart = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, {
    at: [0, 0.575, 0.065],
    scale: [0.11, 0.085, 0.09],
    bone: "head",
    name: "headMass",
  });
  const surf = b.surface(headPart);
  const rimGeo = () => new THREE.CylinderGeometry(1, 1, 0.012, 14).scale(0.083, 1, 0.093);
  const discGeo = () => new THREE.CylinderGeometry(1, 1, 0.016, 14).scale(0.074, 1, 0.084);
  const discPaint = mottle(TAWNY, "#dcab6c", { size: 0.02, seed: 11 });
  for (const s of [1, -1]) {
    const hit = surf.ray([0.052 * s, 0.57, 0.5], [0, 0, -1])!;
    b.stick(rimGeo(), "#17110c", hit, { embed: 0.6, bone: "head", name: "discRim" });
    b.stick(discGeo(), discPaint, hit, { embed: 0.3, bone: "head", name: "disc" });
    const eh = surf.ray([0.045 * s, 0.585, 0.5], [0, 0, -1])!;
    b.stick(new THREE.SphereGeometry(0.032, 12, 8), "#f08a1a", eh, { embed: 0.5, bone: "head", name: "eye" });
    const n = eh.n;
    const c = eh.at;
    b.part(new THREE.SphereGeometry(0.019, 8, 6), "#0b0908", {
      at: c.clone().addScaledVector(n, 0.017),
      bone: "head",
      name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.005, 6, 5), "#fff6e0", {
      at: c.clone().addScaledVector(n, 0.034).add(new THREE.Vector3(-0.006 * s, 0.009, 0)),
      bone: "head",
      name: "glint",
    });
    // ear tuft
    b.sweep(
      catmull([
        [0.06 * s, 0.62, 0.04],
        [0.075 * s, 0.67, 0.035],
        [0.085 * s, 0.725, 0.02],
      ]),
      (t) => [0.024 * (1 - t) + 0.004, 0.012 * (1 - t) + 0.004],
      { color: tuftPaint, bone: "head", caps: { start: "flat", end: "point" }, name: "earTuft" },
    );
    // bristles by the beak
    for (const k of [0, 1]) {
      b.spike([0.014 * s, 0.548 - k * 0.008, 0.135], [0.5 * s, -0.2 - k * 0.3, 1], 0.03, 0.006, {
        color: CREAM,
        bone: "head",
      });
    }
  }

  // beak
  b.sweep(
    catmull([
      [0, 0.56, 0.12],
      [0, 0.555, 0.168],
      [0, 0.53, 0.196],
    ]),
    [0.02, 0.014, 0.003],
    {
      color: gradient("#a0a5aa", "#4a4d52", [0, 0.56, 0.14], [0, 0.53, 0.2]),
      bone: "head",
      caps: { start: "flat", end: "point" },
      name: "beakUpper",
    },
  );
  b.sweep(
    catmull([
      [0, 0.545, 0.115],
      [0, 0.537, 0.16],
      [0, 0.531, 0.182],
    ]),
    [0.015, 0.011, 0.004],
    { color: "#7b8086", bone: "jaw", caps: { start: "flat", end: "round" }, name: "beakLower" },
  );

  // ---------- wings, legs, toes ----------
  const wingOutline: number[][] = [
    [0, 0.0],
    [0.04, 0.035],
    [0.1, 0.03],
    [0.15, -0.04],
    [0.19, -0.14],
    [0.24, -0.25],
    [0.27, -0.33],
    [0.2, -0.3],
    [0.14, -0.25],
    [0.08, -0.17],
    [0.03, -0.09],
  ];
  const covertOutline: number[][] = [
    [0.01, 0.0],
    [0.06, 0.03],
    [0.12, 0.0],
    [0.15, -0.08],
    [0.12, -0.14],
    [0.07, -0.12],
    [0.03, -0.06],
  ];
  const frontToe = [
    [0.103, 0.04],
    [0.102, 0.07],
    [0.08, 0.094],
    [0.052, 0.1],
  ];
  const backToe = [
    [0.103, 0.04],
    [0.1, 0.01],
    [0.078, -0.014],
    [0.052, -0.02],
  ];

  for (const s of [1, -1]) {
    const suf = s > 0 ? "L" : "R";
    b.chain(
      "wing" + suf,
      [
        [0.115 * s, 0.5, 0.04],
        [0.12 * s, 0.4, -0.04],
        [0.12 * s, 0.3, -0.14],
      ],
      { parent: "spine3", names: ["shoulder" + suf, "elbow" + suf, "wrist" + suf], role: "wing" },
    );
    b.extrude(wingOutline as any, {
      color: wingPaint,
      at: [0.115 * s, 0.5, 0.05],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: [0.015, 0.05],
      bevel: 0.01,
      bone: "shoulder" + suf,
      name: "wing" + suf,
    });
    b.extrude(covertOutline as any, {
      color: covertPaint,
      at: [0.118 * s, 0.5, 0.05],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: [0.05, 0.062],
      bevel: 0.012,
      bone: "shoulder" + suf,
      name: "coverts" + suf,
    });

    const x = 0.06 * s;
    const leg = b.chain(
      "leg" + suf,
      [
        [x, 0.27, 0.0],
        [x, 0.17, 0.03],
        [x, 0.098, 0.04],
      ],
      { parent: "pelvis", names: ["hip" + suf, "knee" + suf, "ankle" + suf], role: "leg" },
    );
    b.sweep(leg, [0.05, 0.04, 0.03], { color: legPaint, name: "leg" + suf });

    const toes: Array<[number[][], number, number]> = [
      [frontToe, -0.022, 1],
      [frontToe, 0.022, 1],
      [backToe, -0.014, -1],
      [backToe, 0.014, -1],
    ];
    toes.forEach(([prof, dx, dir], i) => {
      const pts = prof.map(([y, z], k) => [x + dx * (1 + k * 0.1), y, z]);
      const nm = ["a", "b", "c", "d"].map((c) => `toe${suf}${i + 1}${c}`);
      const toe = b.chain(`toe${suf}${i + 1}`, pts, { parent: "ankle" + suf, names: nm, role: "digit" });
      b.sweep(toe, [0.011, 0.01, 0.009, 0.006], { color: "#d2b98f", name: `toe${suf}${i + 1}` });
      b.spike(pts[3], [0, -1, dir * -0.5 * -1 * (dir > 0 ? -1 : -1)], 0.035, 0.0085, {
        color: "#1a1a1c",
        bone: nm[3],
        name: "talon",
      });
    });
  }

  // ---------- branch ----------
  const barkPaint = mottle(
    mottle("#4a3a2c", "#6a5440", { size: 0.02, seed: 21 }),
    "#7d8a5a",
    { size: 0.06, seed: 22, contrast: 0.7 },
  );
  b.sweep(
    catmull([
      [-0.6, 0.07, 0.06],
      [-0.32, 0.06, 0.03],
      [-0.1, 0.052, 0.045],
      [0.12, 0.052, 0.04],
      [0.34, 0.06, 0.06],
      [0.6, 0.1, 0.02],
    ]),
    [0.03, 0.043, 0.047, 0.045, 0.04, 0.026],
    { color: barkPaint, bone: "pelvis", name: "branch", sides: 9 },
  );
  // twigs and knots
  b.sweep(
    catmull([
      [0.32, 0.07, 0.06],
      [0.42, 0.18, 0.02],
      [0.5, 0.3, -0.02],
    ]),
    [0.016, 0.01, 0.003],
    { color: barkPaint, bone: "pelvis", name: "twig", sides: 6 },
  );
  b.sweep(
    catmull([
      [-0.34, 0.07, 0.03],
      [-0.4, 0.16, 0.0],
      [-0.46, 0.2, -0.05],
    ]),
    [0.014, 0.009, 0.003],
    { color: barkPaint, bone: "pelvis", name: "twig2", sides: 6 },
  );
  b.part(new THREE.IcosahedronGeometry(0.03, 0), "#4a3a2c", { at: [-0.22, 0.09, 0.04], bone: "pelvis", name: "knot" });
  b.part(new THREE.IcosahedronGeometry(0.025, 0), "#3e3025", { at: [0.2, 0.025, 0.07], bone: "pelvis", name: "knot2" });

  return b.root;
}
```