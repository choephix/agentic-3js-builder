```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  polyline,
  limb,
  paint,
  scales,
  mottle,
  grain,
  noise,
  offset,
  frame,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "A stylized keel-billed toucan perched on a short mossy branch, wings spread to show off its rainbow beak, lemon bib and scarlet undertail, with a pink orchid blooming beside it.",
};

type P3 = [number, number, number];
const DG = Math.PI / 180;
const B = 0.11; // bird height offset above the perch

function v(a: ArrayLike<number>) {
  return new THREE.Vector3(a[0], a[1], a[2]);
}
function nrm(a: ArrayLike<number>): P3 {
  const x = v(a).normalize();
  return [x.x, x.y, x.z];
}
function crs(a: ArrayLike<number>, c: ArrayLike<number>): P3 {
  const x = v(a).cross(v(c));
  return [x.x, x.y, x.z];
}
function lerp3(a: ArrayLike<number>, c: ArrayLike<number>, t: number): P3 {
  return [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
}
function add(a: ArrayLike<number>, c: ArrayLike<number>, k = 1): P3 {
  return [a[0] + c[0] * k, a[1] + c[1] * k, a[2] + c[2] * k];
}

// palette
const LIME = "#9be22d";
const SKY = "#3fb8f0";
const ORANGE = "#ff8a1f";
const CHERRY = "#e0162b";
const SCARLET = "#ea1f2c";
const LEGS_C = "#3c7ee6";
const CLAW = "#2a2c36";

function featherOutline(L: number, w: number): OutlinePoint[] {
  return [
    [0, -w * 0.6],
    [L * 0.35, -w],
    [L * 0.85, -w * 0.85],
    [L, 0],
    [L * 0.85, w * 0.85],
    [L * 0.35, w],
    [0, w * 0.6],
  ];
}

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---------- paints ----------
  const blackScales = scales("#17191f", "#0b0c10", { size: 0.016, seed: 3 });
  const bib = scales("#ffe02a", "#f4b70c", { size: 0.012, seed: 5 });
  const plumage = paint((p, n) => {
    const w = (noise(p, 0.04, 9) - 0.5) * 0.02;
    const y = p.y + w;
    if (y < 0.255 && n.y < -0.25) return SCARLET;
    if (y > 0.335 && y < 0.475) {
      const lim = y > 0.41 ? -0.45 : 0.1;
      if (n.z > lim) return bib;
    }
    if (y > 0.32 && y <= 0.335 && n.z > 0.15) return "#d81c2a";
    if (y > 0.475 && n.z < -0.2) return "#2b1519";
    return blackScales;
  });
  const featherPaint = paint((_p, _n, s) => (Math.abs(s[1]) < 0.0013 && s[0] > 0.004 ? "#34405e" : "#121318"));
  const covertPaint = paint((_p, _n, s) => (Math.abs(s[1]) < 0.0012 && s[0] > 0.003 ? "#3b4968" : "#1a1f2d"));
  const tailPaint = paint((p) => {
    const u = (((p.x + 1) / 0.013) % 1 + 1) % 1;
    return Math.abs(u - 0.5) > 0.44 ? "#2a3042" : "#121419";
  });
  const upperBeak = paint((_p, _n, s) => {
    const t = s[0];
    const d = ((s[1] % 360) + 360) % 360;
    const c = Math.cos(d * DG);
    if (t > 0.86 - 0.03 * c) return CHERRY;
    if (t < 0.045) return "#22301a";
    if (d > 165 && d < 195 && t < 0.82) return "#1a2414";
    const side = d > 60 && d < 300;
    const edge = 0.3 + 0.08 * c;
    if (side && t > edge && t < 0.78) return ORANGE;
    if (side && t > edge - 0.06 && t <= edge) return SKY;
    return LIME;
  });
  const lowerBeak = paint((_p, _n, s) => {
    const t = s[0];
    if (t > 0.82) return CHERRY;
    if (t > 0.74) return ORANGE;
    if (t < 0.2) return LIME;
    return SKY;
  });
  const legPaint = scales(LEGS_C, "#2a5cb8", { size: 0.006, seed: 8 });
  const redFeathers = scales("#e81f2c", "#b8101e", { size: 0.01, seed: 12 });

  const bark = grain("#5b3e28", "#3a2717", { size: 0.012, axis: "x", seed: 4 });
  const moss = mottle("#5e8f2a", "#a2cc4a", { size: 0.03, seed: 2 });
  const branchPaint = paint((p, n) => (n.y + (noise(p, 0.06, 4) - 0.5) * 0.9 > 0.35 ? moss : bark));
  const leafPaint = paint((_p, _n, s) => (Math.abs(s[1]) < 0.0016 ? "#a8d060" : "#3f8a2c"));
  const orchidPaint = paint((_p, _n, s) => {
    const r = Math.hypot(s[0], s[1]);
    if (r < 0.007) return "#fff0f6";
    const ang = Math.atan2(s[1], s[0]);
    if (Math.abs(Math.sin(ang * 22)) < 0.14 && r > 0.01) return "#e0559e";
    return r > 0.033 ? "#ffb3d9" : "#f78cc3";
  });
  const lipPaint = paint((_p, _n, s) => {
    if (s[0] < 0.013) return Math.abs(s[1]) < 0.003 ? "#ffd83a" : "#c4126a";
    return s[0] > 0.028 ? "#e2479b" : "#b0105e";
  });

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const H: P3 = [0, 0.165 + B, -0.045];
  const S1: P3 = [0, 0.215 + B, -0.002];
  const S2: P3 = [0, 0.27 + B, 0.035];
  const N: P3 = [0, 0.315 + B, 0.052];
  const HD: P3 = [0, 0.355 + B, 0.06];
  const hips = b.joint("hips", { parent: root, at: H, aim: S1, role: "spine" });
  const spine = b.chain("spine", polyline([S1, S2, N]), { parent: hips, names: ["spine", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neckC = b.chain("neck", polyline([N, HD]), { parent: chest, names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neckC.joints[0], at: HD, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.338 + B, 0.085],
    aim: [0, 0.324 + B, 0.235],
    role: "jaw",
  });
  const R: P3 = [0, 0.125 + B, -0.095];
  const tail = b.chain(
    "tail",
    polyline([R, [0, 0.09 + B, -0.135], [0, 0.055 + B, -0.175], [0, 0.02 + B, -0.215]]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- body ----------
  b.loft(
    [
      { at: R, w: 0.05, h: 0.04 },
      { at: [0, 0.165 + B, -0.05], w: 0.11, h: 0.115 },
      { at: [0, 0.22 + B, 0.0], w: 0.125, h: 0.135 },
      { at: [0, 0.272 + B, 0.033], w: 0.1, h: 0.105 },
      { at: [0, 0.318 + B, 0.05], w: 0.072, h: 0.07 },
      { at: [0, 0.352 + B, 0.058], w: 0.06, h: 0.06 },
    ],
    { bone: [hips, spine, neckC], color: plumage, group: "body", name: "body" },
  );

  const HC: P3 = [0, 0.36 + B, 0.066];
  const headBall = b.part(new THREE.SphereGeometry(0.05, 12, 9), plumage, {
    bone: head,
    at: HC,
    scale: [0.92, 1, 1.08],
    group: "head",
    name: "skull",
  });

  // beak
  const up = (z: number, c: number, h: number, w: number) => ({ at: [0, c + B, z] as P3, w, h });
  b.loft(
    [
      up(0.08, 0.369, 0.052, 0.042),
      up(0.13, 0.37, 0.056, 0.036),
      up(0.17, 0.3645, 0.051, 0.028),
      up(0.21, 0.3525, 0.039, 0.019),
      up(0.24, 0.3355, 0.019, 0.009),
      up(0.255, 0.325, 0.011, 0.004),
    ],
    { bone: head, color: upperBeak, caps: { start: "flat", end: "round" }, group: "head", name: "beakUpper" },
  );
  b.loft(
    [
      up(0.082, 0.331, 0.026, 0.038),
      up(0.13, 0.3325, 0.021, 0.032),
      up(0.17, 0.3315, 0.017, 0.024),
      up(0.21, 0.328, 0.012, 0.015),
      up(0.235, 0.324, 0.008, 0.007),
    ],
    { bone: jaw, color: lowerBeak, caps: { start: "flat", end: "round" }, group: "head", name: "beakLower" },
  );

  // eyes with lime skin ring
  const headSurf = b.surface(headBall);
  for (const s of [1, -1]) {
    const hit = headSurf.around(HC).at(s * 76, 16);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.019, 12, 6).scale(1, 0.32, 1), LIME, hit, { bone: head, embed: 0.3, group: "head" });
    b.stick(new THREE.SphereGeometry(0.0095, 10, 6).scale(1, 0.5, 1), "#24452e", hit.moved([0, 0.004, 0]), {
      bone: head,
      embed: 0.5,
      group: "head",
    });
    b.stick(new THREE.SphereGeometry(0.0055, 8, 5).scale(1, 0.5, 1), "#06070a", hit.moved([0, 0.0068, 0]), {
      bone: head,
      embed: 0.5,
      group: "head",
    });
    b.stick(new THREE.SphereGeometry(0.0022, 6, 4), "#ffffff", hit.moved([0, 0.0088, 0.0032]), {
      bone: head,
      embed: 0.3,
      group: "head",
    });
  }

  // ---------- tail ----------
  b.sweep(tail, (t: number) => [0.026 + 0.016 * t, 0.0055], {
    section: "box",
    caps: { start: "flat", end: "flat" },
    color: tailPaint,
    group: "tail",
    name: "tailFan",
  });
  b.part(new THREE.SphereGeometry(0.032, 10, 7), redFeathers, {
    bone: hips,
    at: [0, 0.228, -0.07],
    scale: [1.1, 0.65, 1.25],
    group: "tail",
    name: "undertail",
  });
  const tdir = nrm([0, -0.6, -0.8]);
  [-0.013, 0, 0.013].forEach((x, i) => {
    b.extrude(featherOutline(0.06 - Math.abs(x) * 0.8, 0.012), {
      at: [x, 0.226 - i * 0.001, -0.082],
      x: tdir,
      y: [1, 0, 0],
      thickness: 0.003,
      bevel: 0.001,
      smoothing: 1,
      color: redFeathers,
      bone: tail.joints[0],
      group: "tail",
    });
  });

  // ---------- wings, legs, toes ----------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh: P3 = [s * 0.045, 0.275 + B, 0.01];
    const el: P3 = [s * 0.12, 0.292 + B, -0.012];
    const wr: P3 = [s * 0.2, 0.286 + B, -0.002];
    const tp: P3 = [s * 0.265, 0.272 + B, -0.025];
    const wing = b.chain(`wing${sd}`, polyline([sh, el, wr, tp]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `wingTip${sd}`],
      role: "wing",
    });
    b.sweep(wing, [0.02, 0.009], { color: "#14161c", group: "wing" });

    const NF = 10;
    for (let i = 0; i < NF; i++) {
      const u = i / (NF - 1);
      const t = Math.min(0.08 + 0.92 * u, 0.995);
      const cp = wing.at(t);
      const d = nrm(lerp3([0, -0.3, -1], [s * 1.1, -0.25, -0.55], Math.pow(u, 1.6)));
      const yd = nrm(crs(d, [0, 1, 0]));
      b.extrude(featherOutline(0.085 + 0.055 * u, 0.017), {
        at: offset(cp.at, [0, 1, 0], -0.0018 * i),
        x: d,
        y: yd,
        thickness: 0.004,
        bevel: 0.0015,
        smoothing: 1,
        color: featherPaint,
        bone: wing.jointAt(t),
        group: "wing",
      });
    }
    const NC = 8;
    for (let i = 0; i < NC; i++) {
      const u = i / (NC - 1);
      const t = 0.05 + 0.85 * u;
      const cp = wing.at(t);
      const d = nrm(lerp3([0, -0.25, -1], [s * 0.9, -0.2, -0.6], Math.pow(u, 1.6)));
      const yd = nrm(crs(d, [0, 1, 0]));
      b.extrude(featherOutline(0.045 + 0.018 * u, 0.014), {
        at: offset(cp.at, [0, 1, 0], 0.005 - 0.0012 * i),
        x: d,
        y: yd,
        thickness: 0.0035,
        bevel: 0.0012,
        smoothing: 1,
        color: covertPaint,
        bone: wing.jointAt(t),
        group: "wing",
      });
    }

    // leg
    const hip: P3 = [s * 0.03, 0.155 + B, -0.012];
    const F: P3 = [s * 0.032, 0.083 + B, 0.002];
    const pts = limb(hip, F, [0.04, 0.036], [0, 0, -1]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `foot${sd}`],
      role: "leg",
      contact: [s * 0.032, 0.185, 0.002],
    });
    b.sweep(leg, [0.011, 0.0085], { color: legPaint, group: "legs" });
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];

    const toeDefs: { k: string; pts: P3[] }[] = [
      { k: "A", pts: [F, add(F, [s * 0.007, -0.004, 0.018]), add(F, [s * 0.009, -0.018, 0.033]), add(F, [s * 0.01, -0.037, 0.041])] },
      { k: "B", pts: [F, add(F, [-s * 0.007, -0.004, 0.018]), add(F, [-s * 0.009, -0.018, 0.033]), add(F, [-s * 0.01, -0.037, 0.041])] },
      { k: "C", pts: [F, add(F, [s * 0.006, -0.005, -0.016]), add(F, [s * 0.007, -0.019, -0.031]), add(F, [s * 0.008, -0.036, -0.039])] },
      { k: "D", pts: [F, add(F, [-s * 0.006, -0.005, -0.016]), add(F, [-s * 0.007, -0.019, -0.031]), add(F, [-s * 0.008, -0.036, -0.039])] },
    ];
    for (const td of toeDefs) {
      const path = catmull(td.pts);
      const toe = b.chain(`toe${td.k}${sd}`, path, { parent: foot, count: 2, role: "digit" });
      b.sweep(toe, [0.0065, 0.0042], { color: legPaint, group: "legs" });
      b.spike(path.at(1), path.tangentAt(1), 0.012, 0.0042, {
        color: CLAW,
        bone: toe.joints[toe.joints.length - 1],
        group: "legs",
      });
    }
  }

  // ---------- mossy branch ----------
  const branchPath = catmull([
    [-0.335, 0.016, 0.05],
    [-0.25, 0.115, 0.005],
    [0, 0.15, 0],
    [0.22, 0.132, -0.01],
    [0.32, 0.016, 0.045],
  ]);
  const branch = b.sweep(branchPath, [0.026, 0.034, 0.037, 0.034, 0.026], {
    bone: root,
    color: branchPaint,
    caps: "flat",
    sides: 9,
    group: "branch",
    name: "branch",
  });

  // cut stub
  const stub = branch.at(0.66, -50);
  b.rod(stub.moved([0, -0.012, 0]), stub.moved([0, 0.03, 0]), [0.016, 0.013], { color: bark, bone: root, group: "branch" });
  b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.003, 9), "#d4b483", {
    bone: root,
    at: stub.local([0, 0.0305, 0]),
    dir: stub,
    group: "branch",
  });

  // twig with leaves
  const tw = branch.at(0.17, -35);
  const twigEnd: P3 = [tw.at.x - 0.05, tw.at.y + 0.1, tw.at.z - 0.06];
  b.sweep(bezier(tw.moved([0, -0.01, 0]), tw.moved([0, 0.04, 0]), twigEnd), [0.011, 0.004], {
    bone: root,
    color: bark,
    group: "branch",
  });
  const leafShape: OutlinePoint[] = [
    [0, 0],
    [0.03, 0.018],
    [0.07, 0.012],
    [0.09, 0, "sharp"],
    [0.07, -0.012],
    [0.03, -0.018],
  ];
  for (const d0 of [[-0.6, 0.5, 0.4], [0.2, 0.7, -0.6], [-0.3, 0.8, -0.2]]) {
    const d = nrm(d0);
    b.extrude(leafShape, {
      at: twigEnd,
      x: d,
      y: nrm(crs(d, [0, 1, 0])),
      thickness: 0.003,
      bevel: 0.001,
      smoothing: 2,
      color: leafPaint,
      bone: root,
      group: "branch",
    });
  }

  // moss mounds where the branch meets the ground
  for (const x of [-0.33, 0.315]) {
    b.part(new THREE.SphereGeometry(0.045, 10, 6), moss, {
      bone: root,
      at: [x, 0.008, 0.05],
      scale: [1.2, 0.4, 1],
      group: "branch",
    });
  }

  // moss lumps and tufts
  const branchSurf = b.surface(branch);
  for (const hit of branchSurf.scatter(10, { rng: rng(21), minDist: 0.05, filter: (h) => h.n.y > 0.55 && Math.abs(h.at.x) > 0.06 })) {
    b.stick(new THREE.IcosahedronGeometry(0.014, 0).scale(1, 0.5, 1), moss, hit, { bone: root, flat: true, embed: 0.4, group: "branch" });
  }
  const mossTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="#ffffff"><path d="M1 32 L5 12 L9 32Z"/><path d="M7 32 L12 3 L17 32Z"/><path d="M14 32 L19 9 L23 32Z"/><path d="M20 32 L26 6 L30 32Z"/></g><g fill="#cfcfcf"><circle cx="12" cy="5" r="2.2"/><circle cx="26" cy="8" r="2.2"/></g></svg>`,
    { size: 64 },
  );
  const mossHits = branchSurf.scatter(170, {
    rng: rng(11),
    minDist: 0.012,
    filter: (h) => h.n.y > 0.45 && Math.abs(h.at.x) > 0.055,
  });
  b.cards(mossHits, mossTex, { size: [0.018, 0.022], lean: 20, vary: 0.4, spin: 40, rng: rng(12), color: moss, bone: root });

  const strandTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48"><g stroke="#ffffff" stroke-width="2" fill="none"><path d="M4 0 Q2 16 5 30 T4 48"/><path d="M10 0 Q13 18 9 32 T11 46"/></g></svg>`,
    { size: 96 },
  );
  const hangFrames = [0.28, 0.35, 0.6, 0.7].map((t) => frame(branch.at(t, 180).at, [0, 1, 0]));
  b.cards(hangFrames, strandTex, { size: [0.025, 0.06], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(13), color: "#b9c79a", bone: root });

  // ---------- orchid ----------
  const ob = branch.at(0.33, 25);
  const FC: P3 = [-0.185, 0.29, 0.085];
  const stemPath = bezier(
    ob.moved([0, -0.004, 0]),
    [ob.at.x - 0.005, ob.at.y + 0.07, ob.at.z],
    [FC[0] + 0.01, FC[1] + 0.03, FC[2] - 0.04],
    [FC[0], FC[1] - 0.005, FC[2] - 0.01],
  );
  b.sweep(stemPath, [0.0045, 0.003], { bone: root, color: "#4f8a32", group: "orchid" });
  const budAt = stemPath.at(0.62);
  b.part(new THREE.SphereGeometry(0.009, 8, 6), "#f08ac0", {
    bone: root,
    at: [budAt.x + 0.008, budAt.y, budAt.z + 0.004],
    scale: [0.8, 1.3, 0.8],
    group: "orchid",
  });

  const Nf = nrm([0.15, 0.25, 1]);
  const e1 = nrm(crs([0, 1, 0], Nf));
  const e2 = crs(Nf, e1);
  const inPlane = (a: number) => {
    const c = Math.cos(a * DG);
    const s = Math.sin(a * DG);
    return {
      d: nrm([e1[0] * c + e2[0] * s, e1[1] * c + e2[1] * s, e1[2] * c + e2[2] * s]),
      y: nrm([-e1[0] * s + e2[0] * c, -e1[1] * s + e2[1] * c, -e1[2] * s + e2[2] * c]),
    };
  };
  const sepal = (L: number, w: number): OutlinePoint[] => [
    [0, -0.004],
    [L * 0.4, -w],
    [L, 0, "sharp"],
    [L * 0.4, w],
    [0, 0.004],
  ];
  const petalO = (L: number, w: number): OutlinePoint[] => [
    [0, -0.003],
    [L * 0.35, -w * 0.8],
    [L * 0.8, -w],
    [L, 0],
    [L * 0.8, w],
    [L * 0.35, w * 0.8],
    [0, 0.003],
  ];
  const lipO = (L: number, w: number): OutlinePoint[] => [
    [0, -0.004],
    [L * 0.45, -w * 0.55],
    [L * 0.9, -w],
    [L, -w * 0.3],
    [L * 0.93, 0],
    [L, w * 0.3],
    [L * 0.9, w],
    [L * 0.45, w * 0.55],
    [0, 0.004],
  ];
  for (const a of [90, 210, 330]) {
    const { d, y } = inPlane(a);
    b.extrude(sepal(0.046, 0.009), {
      at: FC, x: d, y, thickness: 0.0025, bevel: 0.001, smoothing: 2, color: orchidPaint, bone: root, group: "orchid",
    });
  }
  for (const a of [22, 158]) {
    const { d, y } = inPlane(a);
    b.extrude(petalO(0.043, 0.016), {
      at: add(FC, Nf, 0.0028), x: d, y, thickness: 0.0025, bevel: 0.001, smoothing: 2, color: orchidPaint, bone: root, group: "orchid",
    });
  }
  {
    const { d, y } = inPlane(270);
    const dl = nrm(add(d, Nf, 0.35));
    b.extrude(lipO(0.036, 0.016), {
      at: add(FC, Nf, 0.0055), x: dl, y, thickness: 0.0025, bevel: 0.001, smoothing: 1, color: lipPaint, bone: root, group: "orchid",
    });
  }
  b.capsule(add(FC, Nf, 0.004), add(add(FC, Nf, 0.017), e2, 0.004), 0.0035, { color: "#fff4f8", bone: root, group: "orchid" });

  // orchid leaves and aerial roots
  const leafStrap: OutlinePoint[] = [
    [0, -0.008],
    [0.05, -0.016],
    [0.11, -0.01],
    [0.125, 0],
    [0.11, 0.01],
    [0.05, 0.016],
    [0, 0.008],
  ];
  for (const d0 of [[-0.4, 0.25, 0.9], [-0.9, 0.15, 0.35]]) {
    const d = nrm(d0);
    b.extrude(leafStrap, {
      at: ob.moved([0, -0.003, 0]),
      x: d,
      y: nrm(crs(d, [0, 1, 0])),
      thickness: 0.004,
      bevel: 0.0015,
      smoothing: 2,
      color: leafPaint,
      bone: root,
      group: "orchid",
    });
  }
  for (const [dx, a0, a1] of [[-0.012, -10, 170], [0.01, 20, 200]]) {
    const c = branch.at(0.33, 0);
    const cy = c.at.y - 0.035;
    const rootPts: P3[] = [];
    for (let k = 0; k <= 5; k++) {
      const a = (a0 + ((a1 - a0) * k) / 5) * DG;
      rootPts.push([c.at.x + dx + k * 0.003, cy + 0.04 * Math.cos(a), c.at.z + 0.04 * Math.sin(a)]);
    }
    b.sweep(catmull(rootPts), 0.0028, { bone: root, color: "#b8c4a8", group: "orchid" });
  }

  return b.root;
}
```