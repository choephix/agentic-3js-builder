import * as THREE from "three";
import {
  createBuilder,
  rng,
  frame,
  catmull,
  bezier,
  polyline,
  arc,
  limb,
  lerp,
  offset,
  paint,
  mottle,
  grain,
  noise,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Keel-billed Toucan on a Mossy Branch",
  description:
    "A glossy black keel-billed toucan with a rainbow beak, lemon bib, lime eye rings and blue feet, wings flared and tail cocked, showing off on a short mossy branch beside a pink orchid.",
};

const BLACK = "#14151b";
const SHEEN = "#262d40";
const MAROON = "#3e1c27";
const YELLOW = "#ffe03a";
const RED = "#e3202c";
const CHERRY = "#c40f2f";
const ORANGE = "#ff8a1c";
const LIME = "#9be23a";
const LIME_HI = "#cdf57a";
const SKY = "#4fb8f2";
const TEAL = "#4fd0b0";
const TOMIUM = "#24180f";
const BLUE = "#3f7fe8";
const CLAW = "#2a2d3a";
const PINK = "#ff6fb5";
const PINK_PALE = "#ffd3ec";
const VEIN = "#e2408f";
const LEAF = "#3f8f3a";
const LEAF_HI = "#79c25a";
const STEM = "#5c8f3a";
const ROOTC = "#b9c6a8";

const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.17, -0.03], dir: [0, 0.75, 0.66], role: "spine" });

  const body = catmull([
    [0, 0.14, -0.09],
    [0, 0.17, -0.03],
    [0, 0.245, 0.012],
    [0, 0.31, 0.035],
  ]);
  const rootT = body.closestT(hips.at);
  const front = b.chain("spine", body.slice(rootT, 1), { parent: hips, count: 2, names: ["spine1", "spine2"], role: "spine" });
  const back = b.chain("rump", body.slice(rootT, 0), { parent: hips, count: 1, names: ["rump"] });

  const HC: [number, number, number] = [0, 0.352, 0.055];
  const neck = b.joint("neck", { parent: front.joints[1], at: body.at(1), aim: [0, 0.345, 0.06], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.345, 0.06], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.327, 0.082], aim: [0, 0.298, 0.245], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.145, -0.085],
      [0, 0.168, -0.15],
      [0, 0.215, -0.2],
      [0, 0.285, -0.225],
    ]),
    { parent: back.joints[0], count: 3, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- paints ----------
  const gloss = mottle(BLACK, SHEEN, { size: 0.035, seed: 2 });
  const maroonGloss = mottle(MAROON, BLACK, { size: 0.03, seed: 5 });

  const bodyPaint = paint((p, _n, s) => {
    const t = s[0];
    const d = ((s[1] % 360) + 360) % 360;
    const fromFront = Math.abs(d - 180);
    const w = (noise(p, 0.025, 3) - 0.5) * 0.06;
    if (t > 0.6 + w && fromFront < 78) return YELLOW;
    if (t > 0.56 + w && fromFront < 78) return RED;
    if (t < 0.17 && fromFront < 70) return RED;
    if (t > 0.86 && fromFront > 115) return maroonGloss;
    return gloss;
  });

  const headPaint = paint((p) => {
    const dy = p.y - HC[1];
    const dz = p.z - HC[2];
    const edge = -0.004 + 0.32 * dz + (noise(p, 0.02, 4) - 0.5) * 0.008;
    if (dz > -0.035 && dy < edge) return YELLOW;
    if (dz < -0.02 && dy < 0.02) return maroonGloss;
    return gloss;
  });

  const upperPaint = paint((p, _n, s) => {
    const t = s[0];
    const d = ((s[1] % 360) + 360) % 360;
    const side = Math.min(Math.abs(d - 90), Math.abs(d - 270));
    const top = Math.min(d, 360 - d);
    const w = (noise(p, 0.03, 7) - 0.5) * 0.12;
    if (t < 0.045) return TOMIUM;
    if (t > 0.84 + w * 0.5) return CHERRY;
    if (t > 0.3 + w && t < 0.7 + w && side < 40) return ORANGE;
    if (top < 22 && t > 0.08 && t < 0.72) return LIME_HI;
    if (top > 140 && t > 0.12 && t < 0.62) return SKY;
    return LIME;
  });

  const lowerPaint = paint((p, _n, s) => {
    const t = s[0];
    const w = (noise(p, 0.03, 8) - 0.5) * 0.1;
    if (t < 0.05) return TOMIUM;
    if (t > 0.8 + w * 0.5) return CHERRY;
    if (t < 0.22 + w) return TEAL;
    return SKY;
  });

  const tailPaint = paint((p) => (Math.abs(p.x) % 0.013 < 0.0013 ? "#2f3850" : gloss));

  const featherPaint = (len: number) =>
    paint((_p, _n, s) =>
      Math.abs(s[1]) < 0.0013 && s[0] < len * 0.9 ? "#4a5470" : s[0] > len * 0.68 ? "#1f2638" : BLACK,
    );

  const bark = grain("#6b4a32", "#4a3222", { size: 0.012, axis: "x", seed: 3 });
  const moss = mottle("#5c8a28", "#93ba3e", { size: 0.03, seed: 9 });
  const branchPaint = paint((p, n) => (n.y + (noise(p, 0.06, 11) - 0.5) * 0.9 > 0.42 ? moss : bark));

  // ---------- body ----------
  const rad = (t: number): [number, number] => {
    const r = t < 0.45 ? 0.032 + 0.036 * Math.sin((Math.PI / 2) * (t / 0.45)) : 0.068 - 0.022 * Math.pow((t - 0.45) / 0.55, 1.2);
    return [r * 0.92, r * 1.05];
  };
  const bodySweep = b.sweep(body, rad, { bone: [back, hips, front], color: bodyPaint });

  // breast feather cards on the bib
  const featherTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 32 C3 24 4 7 16 1 C28 7 29 24 16 32 Z" fill="#ffffff"/><path d="M16 30 L16 8" stroke="#bbbbbb" stroke-width="2"/></svg>`,
    { size: 64 },
  );
  const bibHits = b
    .surface(bodySweep)
    .scatter(46, { rng: rng(21), minDist: 0.014, filter: (h) => h.n.z > 0.45 && h.at.y > 0.24 && h.at.y < 0.315 });
  b.cards(bibHits, featherTex, { size: [0.016, 0.02], lean: 72, flow: [0, -1, 0.15], vary: 0.25, rng: rng(22), color: "#ffd21f" });

  // scarlet undertail
  b.part(new THREE.SphereGeometry(0.028, 8, 6), RED, { bone: back.joints[0], at: [0, 0.128, -0.07], scale: [1.1, 0.7, 1.25] });

  // tail, cocked up
  b.sweep(tail, (t) => [0.024 + 0.014 * t, 0.0065], { section: "box", caps: "flat", color: tailPaint });

  // ---------- head ----------
  const headPart = b.part(new THREE.SphereGeometry(0.05, 12, 9), headPaint, { bone: head, at: HC, scale: [0.92, 1, 1.08] });
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const hit = headSurf.around(HC).at(s * 72, 16);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.019, 0.02, 0.006, 10), LIME, hit, { embed: 0.5, bone: head });
    b.ring(hit, { count: 10, radius: 0.019 }).items.forEach((it) =>
      b.stick(new THREE.SphereGeometry(0.0034, 5, 4), LIME_HI, it, { embed: 0.4, bone: head }),
    );
    b.stick(new THREE.SphereGeometry(0.0095, 8, 6), "#1a0f14", hit.moved([0, 0.002, 0]), { embed: 0.3, bone: head });
    b.stick(new THREE.SphereGeometry(0.0028, 6, 4), "#ffffff", hit.moved([s * 0.003, 0.0105, 0.0035]), { embed: 0.2, bone: head });
  }

  // ---------- beak ----------
  const upper = b.loft(
    [
      { at: [0, 0.358, 0.083], w: 0.042, h: 0.062 },
      { at: [0, 0.356, 0.13], w: 0.036, h: 0.056 },
      { at: [0, 0.345, 0.18], w: 0.028, h: 0.045 },
      { at: [0, 0.328, 0.225], w: 0.018, h: 0.03 },
      { at: [0, 0.307, 0.252], w: 0.008, h: 0.012 },
    ],
    { bone: head, color: upperPaint, sides: 10 },
  );
  b.loft(
    [
      { at: [0, 0.326, 0.085], w: 0.036, h: 0.03 },
      { at: [0, 0.32, 0.14], w: 0.03, h: 0.028 },
      { at: [0, 0.31, 0.19], w: 0.022, h: 0.022 },
      { at: [0, 0.302, 0.23], w: 0.012, h: 0.012 },
      { at: [0, 0.298, 0.245], w: 0.005, h: 0.006 },
    ],
    { bone: jaw, color: lowerPaint, sides: 10 },
  );
  for (const d of [148, 212]) {
    const edge = upper.line(d, 0.0008).slice(0.1, 0.85);
    b.sweep(edge, 0.0016, { bone: head, color: TOMIUM });
    b.along(edge, 7, (at) => b.spike(at, [0, -1, 0.2], 0.005, 0.0018, { color: TOMIUM, bone: head }));
  }

  // ---------- legs and toes ----------
  const toeCirc = (x: number, th: number): number[] => [x, 0.05 + 0.055 * Math.cos(th * DEG), 0.055 * Math.sin(th * DEG)];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const foot = [s * 0.03, 0.106, 0.006];
    const pts = limb([s * 0.026, 0.15, 0.0], foot, [0.028, 0.026], [0, 0, -1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `foot${L}`],
      role: "leg",
      contact: [s * 0.03, 0.1, 0.006],
    });
    b.sweep(leg, [0.009, 0.0055], { color: (t) => (t < 0.45 ? BLACK : BLUE) });
    const toes = [
      { dx: s * 0.008, sg: 1 },
      { dx: -s * 0.004, sg: 1 },
      { dx: s * 0.007, sg: -1 },
      { dx: -s * 0.005, sg: -1 },
    ];
    toes.forEach((tdef, k) => {
      const x = foot[0];
      const path = catmull([
        foot,
        toeCirc(x + tdef.dx * 0.4, tdef.sg * 20),
        toeCirc(x + tdef.dx * 0.8, tdef.sg * 46),
        toeCirc(x + tdef.dx, tdef.sg * 70),
      ]);
      const toe = b.chain(`toe${k + 1}${L}`, path, { parent: leg.tip!, count: 1, names: [`toe${k + 1}${L}`], role: "digit" });
      b.sweep(toe, [0.0045, 0.003], { color: BLUE });
      b.spike(path.at(1), path.tangentAt(1), 0.009, 0.0026, { color: CLAW, bone: toe.joints[0] });
    });
  }

  // ---------- wings, flared ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const wpts = [
      [s * 0.045, 0.29, 0.0],
      [s * 0.11, 0.315, -0.03],
      [s * 0.175, 0.325, -0.04],
      [s * 0.235, 0.318, -0.055],
    ];
    const wing = b.chain(`wing${L}`, polyline(wpts), {
      parent: front.joints[1],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `wingTip${L}`],
      role: "wing",
    });
    b.sweep(wing, [0.02, 0.009], { color: gloss });
    b.membrane(
      wing,
      polyline([
        [s * 0.05, 0.272, -0.05],
        [s * 0.11, 0.295, -0.085],
        [s * 0.175, 0.305, -0.09],
        [s * 0.235, 0.31, -0.07],
      ]),
      { thickness: 0.008, color: gloss, scallop: 0.1 },
    );

    const up = new THREE.Vector3(0, 1, 0);
    const feather = (at: THREE.Vector3, dir: THREE.Vector3, len: number, bone: (typeof wing.joints)[number]) => {
      const x = dir.clone().normalize();
      const y = new THREE.Vector3().crossVectors(up, x).normalize();
      const outline: OutlinePoint[] = [
        [0, -0.008],
        [len * 0.5, -0.011],
        [len, -0.004],
        [len + 0.004, 0.004],
        [len * 0.5, 0.011],
        [0, 0.008],
      ];
      b.extrude(outline, { at, x, y, thickness: 0.004, bevel: 0.0012, smoothing: 1, color: featherPaint(len), bone });
    };
    const elbowP = new THREE.Vector3(...(wpts[1] as [number, number, number]));
    const wristP = new THREE.Vector3(...(wpts[2] as [number, number, number]));
    const tipP = new THREE.Vector3(...(wpts[3] as [number, number, number]));
    const shoulderP = new THREE.Vector3(...(wpts[0] as [number, number, number]));
    for (let i = 0; i < 4; i++) {
      const at = lerp(lerp(shoulderP, elbowP, 0.6), wristP, i / 3).add(new THREE.Vector3(0, -0.004 - i * 0.0015, -0.01));
      feather(at, new THREE.Vector3(s * (0.1 + 0.05 * i), -0.12, -1), 0.1 + i * 0.004, wing.joints[1]);
    }
    const lens = [0.11, 0.12, 0.125, 0.12, 0.108];
    for (let i = 0; i < 5; i++) {
      const u = i / 4;
      const at = lerp(wristP, tipP, u).add(new THREE.Vector3(0, -0.006 - i * 0.0015, -0.008));
      const dir = lerp([s * 0.35, -0.1, -1], [s * 1, -0.06, -0.35], u);
      feather(at, dir, lens[i], wing.joints[2]);
    }
  }

  // ---------- branch ----------
  const branchPath = catmull([
    [-0.36, 0.046, 0.035],
    [-0.12, 0.05, 0.0],
    [0.12, 0.05, 0.0],
    [0.36, 0.054, -0.03],
  ]);
  const branch = b.sweep(branchPath, [0.042, 0.05, 0.05, 0.04], { bone: root, color: branchPaint, caps: "flat", sides: 10 });

  const ringTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#d3a86e"/><circle cx="32" cy="32" r="29" fill="none" stroke="#5a3a22" stroke-width="3"/><circle cx="33" cy="31" r="21" fill="none" stroke="#a87c48" stroke-width="2.5"/><circle cx="33" cy="32" r="13" fill="none" stroke="#a87c48" stroke-width="2.5"/><circle cx="33" cy="32" r="6" fill="none" stroke="#a87c48" stroke-width="2"/><circle cx="33" cy="32" r="2" fill="#7a5530"/></svg>`,
    { size: 128 },
  );
  for (const [t, r, sgn] of [
    [0, 0.041, -1],
    [1, 0.039, 1],
  ] as const) {
    const tan = branchPath.tangentAt(t).clone().multiplyScalar(sgn);
    b.part(new THREE.CircleGeometry(r, 10), "#ffffff", {
      bone: root,
      at: offset(branchPath.at(t), tan, 0.0015),
      dir: tan,
      axis: "z",
      texture: ringTex,
    });
  }

  // twig stub with two leaves
  b.sweep(bezier([-0.2, 0.07, 0.01], [-0.24, 0.12, 0.03], [-0.27, 0.165, 0.07]), [0.014, 0.006], {
    bone: root,
    color: bark,
    caps: { start: "flat", end: "round" },
  });
  const leafOutline: OutlinePoint[] = [
    [0, 0],
    [0.02, -0.014],
    [0.05, -0.01],
    [0.07, 0, "sharp"],
    [0.05, 0.01],
    [0.02, 0.014],
  ];
  const leafPaint = paint((_p, _n, s) => (Math.abs(s[1]) < 0.0015 ? LEAF_HI : LEAF));
  for (const dx of [
    [-0.7, 0.45, 0.4],
    [0.1, 0.55, 0.8],
  ]) {
    const x = new THREE.Vector3(...(dx as [number, number, number])).normalize();
    const y = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), x).normalize();
    b.extrude(leafOutline, { at: [-0.268, 0.163, 0.068], x, y, thickness: 0.003, smoothing: 2, color: leafPaint, bone: root });
  }

  // moss lumps and tufts
  const branchSurf = b.surface(branch);
  const lumps = branchSurf.scatter(30, { rng: rng(9), minDist: 0.035, filter: (h) => h.n.y > 0.6 && Math.abs(h.at.x) > 0.07 });
  lumps.slice(0, 12).forEach((h, i) =>
    b.stick(new THREE.DodecahedronGeometry(0.011 + (i % 3) * 0.003, 0), i % 2 ? "#6f9a2e" : "#86b23a", h, {
      embed: 0.5,
      scale: [1.2, 0.55, 1.1],
      flat: true,
      bone: root,
    }),
  );
  const tuftTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M2 32 L6 10 L9 32 Z M13 32 L18 6 L20 32 Z M23 32 L30 16 L30 32 Z" fill="#ffffff"/><path d="M7 32 L12 2 L15 32 Z M18 32 L25 12 L26 32 Z" fill="#cfcfcf"/></svg>`,
    { size: 64 },
  );
  const tufts = branchSurf.scatter(90, { rng: rng(5), minDist: 0.02, filter: (h) => h.n.y > 0.45 && Math.abs(h.at.x) > 0.065 });
  b.cards(tufts, tuftTex, { size: [0.028, 0.022], lean: 25, vary: 0.35, spin: 40, rng: rng(6), color: "#7fb03c" });

  // ---------- orchid ----------
  const stemBase = [0.2, 0.095, 0.015];
  const F = new THREE.Vector3(0.215, 0.205, 0.045);
  b.sweep(bezier(stemBase, [0.19, 0.16, 0.02], [0.205, 0.2, 0.03], F), 0.0035, { bone: root, color: STEM });
  b.sweep(bezier([0.205, 0.172, 0.027], [0.228, 0.183, 0.03], [0.245, 0.176, 0.036]), 0.0024, { bone: root, color: STEM });
  b.part(new THREE.SphereGeometry(0.009, 8, 6), PINK, { bone: root, at: [0.252, 0.172, 0.038], scale: [0.8, 0.8, 1.3] });

  const dirF = new THREE.Vector3(-0.25, 0.1, 1).normalize();
  const petals = b.ring(frame(F, dirF), { count: 5, radius: 0.003 }).items;
  petals.forEach((item, i) => {
    const broad = i === 1 || i === 4;
    const Lp = broad ? 0.046 : 0.042;
    const W = broad ? 0.017 : 0.009;
    const out = new THREE.Vector3().copy(item.outward);
    const x = out.clone().multiplyScalar(0.92).addScaledVector(dirF, 0.3).normalize();
    const y = new THREE.Vector3().crossVectors(dirF, x).normalize();
    const outline: OutlinePoint[] = [
      [0, 0],
      [Lp * 0.3, -W],
      [Lp * 0.75, -W * 0.85],
      [Lp, 0],
      [Lp * 0.75, W * 0.85],
      [Lp * 0.3, W],
    ];
    const petalPaint = paint((_p, _n, s) =>
      Math.abs(s[1]) < 0.0013 && s[0] < Lp * 0.8 ? VEIN : s[0] < Lp * 0.25 ? PINK_PALE : PINK,
    );
    b.extrude(outline, { at: item, x, y, thickness: 0.0025, smoothing: 2, color: petalPaint, bone: root });
  });
  b.lathe(
    [
      [0, 0],
      [0.006, 0.001],
      [0.014, 0.012],
      [0.018, 0.022],
      [0.015, 0.024],
      [0.011, 0.013],
      [0.004, 0.006],
      [0, 0.005],
    ],
    {
      at: offset(F, [0, -1, 0], 0.008),
      axis: [-0.2, -0.45, 1],
      segments: 10,
      bone: root,
      color: paint((_p, _n, s) => (s[0] < 0.009 ? "#ffd84a" : s[0] > 0.019 ? "#ff5fae" : "#c2187a")),
    },
  );
  b.capsule(F, offset(F, dirF, 0.012), 0.003, { color: "#fff4c8", bone: root });

  // orchid leaves on the branch
  const bigLeaf: OutlinePoint[] = [
    [0, 0],
    [0.03, -0.022],
    [0.08, -0.016],
    [0.11, 0, "sharp"],
    [0.08, 0.016],
    [0.03, 0.022],
  ];
  const bigLeafPaint = paint((p, _n, s) =>
    Math.abs(s[1]) < 0.0018 ? LEAF_HI : noise(p, 0.02, 14) > 0.62 ? "#357a30" : "#4a9a3e",
  );
  for (const xd of [
    [1, 0.12, 0.4],
    [0.9, 0.16, -0.5],
  ]) {
    const x = new THREE.Vector3(...(xd as [number, number, number])).normalize();
    const y = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), x).normalize();
    b.extrude(bigLeaf, { at: [0.19, 0.1, 0.012], x, y, thickness: 0.0035, bevel: 0.001, smoothing: 2, color: bigLeafPaint, bone: root });
  }

  // aerial roots hugging the branch
  b.sweep(arc([0.27, 0.052, -0.01], [0.27, 0.105, -0.01], [1, 0.08, 0], 215), 0.003, { bone: root, color: ROOTC });
  b.sweep(arc([0.16, 0.05, 0.0], [0.16, 0.104, 0.0], [1, -0.1, 0], -150), 0.0028, { bone: root, color: ROOTC });

  return b.root;
}
