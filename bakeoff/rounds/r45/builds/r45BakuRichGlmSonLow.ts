import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, limb, vec } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Baku, the Dream-Eater",
  "description": "A stocky dream-eating baku spirit — an indigo tapir with a short trunk, cream saddle and gold trappings — built in flat ukiyo-e woodblock colours, with glowing dream wisps curling toward its trunk."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  indigo: "#2e4a72",
  indigoDeep: "#1f3352",
  indigoInk: "#141f33",
  cream: "#f2e6c9",
  creamShade: "#d9c8a3",
  gold: "#d9a441",
  vermillion: "#c1442e",
  sumi: "#221a2e",
  mist: "#bcd3de",
  mistDeep: "#8fa9b8",
  coral: "#e8896b",
  dreamGlow: "#ffe9a8",
};
const M = {
  neckMount: [0, 1.42, 1.35] as [number, number, number],
  socketFL: [0.5, 0.95, 0.95] as [number, number, number],
  socketFR: [-0.5, 0.95, 0.95] as [number, number, number],
  socketHL: [0.5, 0.98, -1] as [number, number, number],
  socketHR: [-0.5, 0.98, -1] as [number, number, number],
  tailMount: [0, 1.35, -1.3] as [number, number, number],
  maneMount: [0, 1.85, 0.1] as [number, number, number],
  trunkMouth: [0, 0.62, 2.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // coreBody
  (() => {
function buildCoreBody({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const spine = J.spine, chest = J.chest;
  const bodyBones = [spine, chest];

  // Barrel body: stack of boxy-round slices along z, each flat coloured by place (hard breaks, no gradients).
  const zs = [-1.35, -1.1, -0.6, 0, 0.6, 1.05, 1.3];
  const halfW = [0.42, 0.58, 0.64, 0.65, 0.64, 0.6, 0.5];
  const top = [1.6, 1.8, 1.85, 1.85, 1.85, 1.8, 1.7];
  const bot = [0.9, 0.62, 0.56, 0.55, 0.56, 0.62, 0.8];
  const st = zs.map((z, i) => ({
    at: [0, (top[i] + bot[i]) / 2, z] as [number, number, number],
    w: halfW[i] * 2,
    h: top[i] - bot[i],
  }));
  b.loft(st, {
    bone: bodyBones,
    color: P.indigo,
    sectors: [
      [100, 260, P.cream],
      [-30, 30, P.indigoDeep],
    ],
    bands: [],
  });

  // Saddle band: cream sleeve between z -0.15..0.65
  const sad = [-0.15, 0.25, 0.65].map((z) => ({
    at: [0, 1.2, z] as [number, number, number],
    w: 1.34,
    h: 1.33,
  }));
  b.loft(sad, { bone: bodyBones, color: P.cream, sectors: [[100, 260, P.creamShade]] });

  // Zig-zag ink strips along top and bottom edges of saddle (both sides)
  for (const z0 of [-0.15, 0.65]) {
    for (const s of [1, -1]) {
      const pts: number[][] = [];
      for (let i = 0; i <= 14; i++) {
        const y = 0.75 + (i / 14) * 1.05;
        pts.push([s * (0.655 + 0.01), y, z0 + (i % 2 ? 0.05 : -0.05) * (z0 < 0 ? 1 : -1)]);
      }
      b.sweep(catmull(pts), 0.012, { bone: chest, color: P.sumi });
    }
  }

  // Gold bands (behind shoulder, under saddle edge) with studs
  const bands: [number, string][] = [[0.95, P.gold], [-0.3, P.gold]];
  for (const [z] of bands) {
    b.part(new THREE.TorusGeometry(0.72, 0.022, 6, 20), P.gold, {
      bone: bodyBones[z > 0 ? 1 : 0], at: [0, 1.2, z], dir: [0, 0, 1], axis: "z", scale: [0.92, 1, 1],
    });
    for (const s of [1, -1])
      for (const y of [0.8, 1.2, 1.65])
        b.part(new THREE.SphereGeometry(0.035, 6, 4), P.gold, {
          bone: z > 0 ? chest : spine, at: [s * 0.66, y, z],
        });
  }

  // Wave-scroll swirls on each flank
  const comma: [number, number][] = [[0, 0], [0.22, 0.06], [0.28, 0.2], [0.18, 0.3], [0.06, 0.26], [0.1, 0.16], [0.16, 0.14], [0.14, 0.08], [0.04, 0.1]];
  const swirl = (s: number, z: number, y: number, c: string, sc: number, lift: number, bone: any) =>
    b.extrude(comma.map(([x, yy]) => [x * sc, yy * sc] as [number, number]), {
      at: [s * (0.66 + lift), y, z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, color: c, bone,
    });
  for (const s of [1, -1]) {
    const spots: [number, number][] = [[-0.5, 1.55], [-0.2, 1.62], [0.3, 1.6], [0.75, 1.5]];
    spots.forEach(([z, y], i) => {
      const bone = z > 0.4 ? chest : spine;
      const flip = s;
      swirl(s, z - 0.12 * flip * 0, y, P.sumi, 1.15, 0.0, bone);
      swirl(s, z, y + 0.01, P.mist, 1.0, 0.012, bone);
    });
    // seigaiha discs arcing along the back
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const z = -1 + t * 2.1;
      const y = 1.82 - Math.abs(t - 0.5) * 0.12;
      const x = s * 0.3;
      const bone = z > 0.5 ? chest : spine;
      b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.015, 10), P.gold, { bone, at: [x, y, z] });
      b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 10), P.cream, { bone, at: [x, y + 0.004, z] });
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.024, 8), P.mist, { bone, at: [x, y + 0.008, z] });
    }
  }

  // Vermillion crest emblems on shoulders
  for (const s of [1, -1]) {
    const at: [number, number, number] = [s * 0.66, 1.55, 1.0];
    const d: [number, number, number] = [s, 0, 0];
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 14), P.gold, { bone: chest, at, dir: d });
    b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.04, 14), P.vermillion, { bone: chest, at: [at[0] + s * 0.005, at[1], at[2]], dir: d });
    b.part(new THREE.TorusGeometry(0.07, 0.014, 5, 12, Math.PI * 1.6), P.sumi, { bone: chest, at: [at[0] + s * 0.03, at[1], at[2]], dir: d, axis: "z" });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.sumi, { bone: chest, at: [at[0] + s * 0.03, at[1] + 0.02, at[2]] });
  }

  // Mane strip along topline
  b.sweep(catmull([[0, 1.87, -1.2], [0, 1.9, -0.4], [0, 1.9, 0.6], [0, 1.84, 1.2]]), 0.04, { bone: bodyBones, color: P.sumi });

  // Belly seam lines (indigoInk) where belly meets flank
  for (const s of [1, -1])
    b.sweep(catmull([[s * 0.5, 0.72, -1.2], [s * 0.6, 0.78, -0.4], [s * 0.62, 0.78, 0.5], [s * 0.52, 0.8, 1.2]]), 0.014, {
      bone: bodyBones, color: P.indigoInk,
    });
  // belly low cream shade
  b.part(new THREE.BoxGeometry(0.7, 0.03, 2.1), P.creamShade, { bone: spine, at: [0, 0.56, 0] });

  // Leg socket shadow rings
  for (const k of ["FL", "FR", "HL", "HR"]) {
    const m = M["socket" + k];
    const bone = k[0] === "F" ? chest : spine;
    b.part(new THREE.TorusGeometry(0.22, 0.03, 5, 14), P.indigoInk, {
      bone, at: [m[0], m[1] - 0.02, m[2]], dir: [0, 1, 0], axis: "z",
    });
  }
}
    return buildCoreBody;
  })(),
  // headAndTrunk
  (() => {
function buildHeadAndTrunk({ b, J, P, M }: any) {
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const hp = head.at;
  const L = (x: number, y: number, z: number) => head.local({ right: -x, up: y, forward: z });

  // neck tube
  const nPath = catmull([[0, 1.2, 0.75], [0, 1.42, 1.35], [hp.x, hp.y, hp.z]]);
  b.sweep(nPath, [0.28, 0.24], { color: P.indigo, bone: [J.chest, neck, head], sides: 8 });
  // throat patch
  b.part(new THREE.BoxGeometry(0.3, 0.06, 0.4), P.cream, { bone: neck, at: [0, 1.2, 1.5] });
  // collar
  b.part(new THREE.TorusGeometry(0.29, 0.03, 5, 12), P.gold, { bone: neck, at: M.neckMount, dir: [0, 0.35, 1], axis: "z" });
  for (const s of [1, -1, 0.5, -0.5])
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.gold, { bone: neck, at: [s * 0.27, 1.42 + 0.05, 1.37] });

  // skull
  b.part(new THREE.BoxGeometry(0.62, 0.5, 0.6), P.indigo, { bone: head, at: [0, 1.7, 1.78] });
  b.part(new THREE.BoxGeometry(0.5, 0.14, 0.5), P.indigo, { bone: head, at: [0, 1.99, 1.76] });
  b.part(new THREE.BoxGeometry(0.4, 0.34, 0.4), P.indigoDeep, { bone: head, at: [0, 1.58, 2.0] });
  // blaze
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.56), P.cream, { bone: head, at: [0, 2.07, 1.8] });
  b.part(new THREE.BoxGeometry(0.09, 0.3, 0.02), P.cream, { bone: head, at: [0, 1.82, 2.04], rotation: [-20, 0, 0] });
  // seams
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.04, 0.5), P.sumi, { bone: head, at: [s * 0.32, 1.55, 1.78] });
    b.part(new THREE.BoxGeometry(0.02, 0.4, 0.03), P.sumi, { bone: neck, at: [s * 0.2, 1.62, 1.55] });
    // eyes
    const ex = s * 0.3;
    b.part(new THREE.BoxGeometry(0.03, 0.12, 0.2), P.sumi, { bone: head, at: [ex, 1.76, 1.88] });
    glow(b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), P.gold, { bone: head, at: [ex + s * 0.02, 1.76, 1.88], dir: [s, 0, 0] }), 1.2);
    b.part(new THREE.BoxGeometry(0.02, 0.08, 0.015), P.sumi, { bone: head, at: [ex + s * 0.04, 1.76, 1.88] });
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.24), P.sumi, { bone: head, at: [ex, 1.84, 1.88] });
    // ears
    const ear = J[s > 0 ? "earL" : "earR"];
    const o = [[0, 0], [0.12, 0.08], [0.17, 0.3], [0.1, 0.5], [0, 0.55], [-0.1, 0.5], [-0.17, 0.3], [-0.12, 0.08]];
    b.extrude(o, { at: ear.at, x: [1, 0, 0], thickness: [0.05, 0.01], color: P.indigoDeep, bone: ear });
    b.extrude(o.map(([x, y]: number[]) => [x * 0.7, y * 0.8 + 0.04]), { at: [ear.at.x, ear.at.y, ear.at.z + 0.03], x: [1, 0, 0], thickness: 0.01, color: P.coral, bone: ear });
    b.part(new THREE.BoxGeometry(0.03, 0.5, 0.03), P.gold, { bone: ear, at: [ear.at.x + s * 0.17, ear.at.y + 0.3, ear.at.z] });
    const r = rng(s + 5);
    for (let i = 0; i < 4; i++)
      b.spike([ear.at.x + (r() - 0.5) * 0.1, ear.at.y, ear.at.z], [(r() - 0.5) * 0.6, 1, -0.2], 0.12, 0.03, { color: P.indigo, bone: ear });
    // tusks
    b.spike([s * 0.16, 1.4, 2.0], [0, 1, 0.2], 0.1, 0.025, { color: P.cream, bone: jaw });
  }

  // trunk
  const tr = b.sprout("trunk", J.head, catmull([[0, 1.5, 1.95], [0, 1.25, 2.15], [0, 0.9, 2.28], [0, 0.55, 2.24], [0, 0.45, 2.15]]), [0.16, 0.09], { color: P.indigoDeep, count: 0, bone: J.trunk1, sides: 8 });
  for (const [y, z] of [[1.28, 2.12], [1.0, 2.25], [0.7, 2.26]])
    b.part(new THREE.TorusGeometry(0.14, 0.015, 4, 10), P.gold, { bone: J.trunk2, at: [0, y, z], dir: [0, -1, 0.3], axis: "z" });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.02, 5, 4), P.sumi, { bone: J.trunk3, at: [s * 0.04, 0.46, 2.15] });

  // lower jaw
  b.frustumBox([0, 1.38, 1.8], [0, 1.36, 2.1], [0.4, 0.1], [0.28, 0.1], { color: P.indigo, bone: jaw });
  b.part(new THREE.BoxGeometry(0.3, 0.02, 0.28), P.vermillion, { bone: jaw, at: [0, 1.44, 1.95] });
  b.part(new THREE.BoxGeometry(0.16, 0.05, 0.1), P.cream, { bone: jaw, at: [0, 1.33, 2.1] });
  b.part(new THREE.BoxGeometry(0.4, 0.015, 0.02), P.sumi, { bone: head, at: [0, 1.46, 2.0] });
}
    return buildHeadAndTrunk;
  })(),
  // legsHooves
  (() => {
function buildLegsHooves({ b, J, P, M }: any) {
  const legs = [
    { n: "FL", s: 1, z: 0.98, hz: 0.95 },
    { n: "FR", s: -1, z: 0.98, hz: 0.95 },
    { n: "HL", s: 1, z: -1, hz: -1 },
    { n: "HR", s: -1, z: -1, hz: -1 },
  ];
  for (const L of legs) {
    const hip = J["hip" + L.n];
    const knee = J["knee" + L.n];
    const ankle = J["ankle" + L.n];
    const s = L.s;
    const rear = L.n[0] === "H";
    const pts = [hip.at.clone(), knee.at.clone(), ankle.at.clone()];
    const path = catmull(pts.map((p: any) => [p.x, p.y, p.z]));
    const leg = b.sweep(path, [0.19, 0.13], {
      bone: [hip, knee, ankle],
      color: P.indigo,
      sides: 8,
    });
    // thigh bulge
    b.part(new THREE.SphereGeometry(0.21, 8, 6), P.indigo, {
      bone: hip,
      at: [s * 0.52, 0.88, L.hz],
    });
    // banding on thigh and knee
    [0.12, 0.26, 0.4, 0.54].forEach((t, i) => {
      const p = leg.at(t);
      const r = 0.2 - t * 0.09;
      b.part(new THREE.CylinderGeometry(r + 0.012, r + 0.012, 0.03, 8), i % 2 ? P.cream : P.vermillion, {
        bone: t < 0.4 ? hip : knee,
        at: p.at,
      });
    });
    // front sumi strip
    b.rod([s * 0.55, 0.85, L.hz + 0.2], [s * 0.56, 0.2, L.z + 0.12], 0.012, P.sumi, { bone: knee });
    if (rear)
      b.part(new THREE.SphereGeometry(0.13, 8, 6), P.cream, {
        bone: hip,
        at: [s * 0.66, 0.88, L.hz - 0.05],
        scale: [0.4, 1, 1],
      });
    // gold cuff
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 8), P.gold, {
      bone: ankle,
      at: [s * 0.56, 0.26, L.z],
    });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), P.gold, {
      bone: ankle,
      at: [s * 0.56, 0.26, L.z + 0.15],
    });
    // paw pad
    b.part(new THREE.BoxGeometry(0.34, 0.18, 0.44), P.cream, {
      bone: ankle,
      at: [s * 0.56, 0.09, L.z + 0.07],
    });
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.06, 8), P.creamShade, {
      bone: ankle,
      at: [s * 0.56, 0.03, L.z],
    });
    // toes
    for (let i = -1; i <= 1; i++) {
      const x = s * 0.56 + i * 0.1;
      b.part(new THREE.BoxGeometry(0.09, 0.1, 0.12), P.cream, {
        bone: ankle,
        at: [x, 0.05, L.z + 0.3],
      });
      b.part(new THREE.BoxGeometry(0.09, 0.09, 0.06), P.sumi, {
        bone: ankle,
        at: [x, 0.045, L.z + 0.38],
      });
      b.part(new THREE.ConeGeometry(0.025, 0.07, 5), P.sumi, {
        bone: ankle,
        at: [x, 0.035, L.z + 0.44],
        dir: [0, -0.3, 1],
      });
    }
  }
}
    return buildLegsHooves;
  })(),
  // tailAndMane
  (() => {
function buildTailAndMane({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const spine = J.spine;
  const chest = J.chest;

  // ---- Mane base ridge ----
  const topPts: number[][] = [];
  for (let i = 0; i <= 6; i++) {
    const z = 1.2 - (i * 2.4) / 6;
    const y = 1.86 + 0.02 * Math.sin((i / 6) * Math.PI);
    topPts.push([0, y, z]);
  }
  const ridge = catmull(topPts);
  b.sweep(ridge, [0.07, 0.07], {
    bone: [spine, chest],
    color: P.indigoDeep,
    caps: "round",
  });
  // sumi strip along topline
  b.sweep(catmull(topPts.map((p) => [0, p[1] + 0.06, p[2]])), 0.018, {
    bone: [spine, chest],
    color: P.sumi,
  });

  // ---- Mane blades ----
  const N = 11;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const z = 1.2 - t * 2.4;
    const y = 1.88 + 0.02 * Math.sin(t * Math.PI);
    const h = 0.3 + 0.08 * Math.sin(t * Math.PI) + R() * 0.03;
    const w = 0.24;
    const bone = z > 0.05 ? chest : spine;
    const at: [number, number, number] = [0, y, z];
    const blade = (u: number, col: string, sc: number, th: number, dz: number) =>
      b.extrude(
        [
          [-w * sc / 2, 0],
          [w * sc / 2, 0],
          [w * 0.2 * sc - 0.04 * sc, h * u * 0.7],
          [-0.12 * sc - 0.05, h * u, "sharp"],
        ],
        { at: [0, y, z + dz], x: [0, 0, 1], y: [0, 1, -0.35], thickness: th, color: col, bone },
      );
    blade(1, P.indigoDeep, 1, 0.05, 0);
    blade(0.72, P.indigo, 0.8, 0.056, 0.0);
    // sumi tip
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [-0.01, 0.1],
      ],
      { at: [0, y + h * 0.9, z - h * 0.32], x: [0, 0, 1], y: [0, 1, -0.35], thickness: 0.06, color: P.sumi, bone },
    );
    if (i % 3 === 0) {
      b.extrude(
        [
          [-w / 2 - 0.01, 0],
          [-w / 2 + 0.02, 0],
          [-0.09, h * 0.7],
          [-0.12, h * 0.98],
        ],
        { at: [0, y, z], x: [0, 0, 1], y: [0, 1, -0.35], thickness: 0.062, color: P.gold, bone },
      );
    }
  }

  // ---- Tail ----
  const tp = [
    [0, 1.35, -1.3],
    [0, 1.55, -1.65],
    [0, 1.7, -1.9],
    [0, 1.98, -1.98],
  ];
  const tailPath = catmull(tp);
  const tailChain = b.chain("tailAndManeTailCurve", tailPath, {
    parent: J.tail3,
    names: ["tailAndManeT1", "tailAndManeT2"],
    role: "tail",
  });
  b.sweep(tailPath, [0.09, 0.05], {
    bone: [J.tail1, J.tail2, J.tail3],
    color: P.indigo,
    caps: "round",
  });
  for (const t of [0.4, 0.75]) {
    const c = tailPath.at(t);
    const tg = tailPath.tangentAt(t);
    b.part(new THREE.CylinderGeometry(0.1 - 0.04 * t, 0.1 - 0.04 * t, 0.035, 8), P.gold, {
      at: c,
      dir: tg,
      bone: t < 0.5 ? J.tail2 : J.tail3,
    });
  }
  // seam where tail meets rump
  b.part(new THREE.TorusGeometry(0.1, 0.014, 5, 10), P.sumi, {
    at: [0, 1.37, -1.31],
    dir: [0, 0.4, -1],
    bone: J.tail1,
  });

  // ---- Tuft ----
  const tip = tailPath.at(1);
  const cols = [P.cream, P.dreamGlow, P.cream, P.dreamGlow, P.cream, P.dreamGlow, P.cream];
  cols.forEach((col, i) => {
    const a = (i / (cols.length - 1) - 0.5) * 2;
    const dir: [number, number, number] = [a * 0.55, 0.8 - Math.abs(a) * 0.3, -0.45 - Math.abs(a) * 0.1];
    const base = [tip.x, tip.y, tip.z];
    const end = [base[0] + dir[0] * 0.3, base[1] + dir[1] * 0.3, base[2] + dir[2] * 0.3];
    const mid = [base[0] + dir[0] * 0.16, base[1] + dir[1] * 0.2 + 0.05, base[2] + dir[2] * 0.2 - 0.03];
    const s = b.sweep(catmull([base, mid, end]), [0.055, 0], {
      bone: J.tail3,
      color: col,
      caps: { start: "flat", end: "point" },
    });
    if (col === P.dreamGlow) glow(s, 1.0);
  });

  // ---- Rump patches ----
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.cream, {
      at: [s * 0.4, 1.45, -1.25],
      scale: [0.3, 1, 0.8],
      bone: spine,
    });
  }
}
    return buildTailAndMane;
  })(),
  // dreamAura
  (() => {
function buildDreamAura({ b, P, M }: Ctx) {
  const R = rng(11);

  // Classic woodblock cloud: a flat outline with a curled end, drawn in the XY plane.
  const cloudOutline = (w: number, h: number, curl: number): [number, number][] => {
    const pts: [number, number][] = [];
    // bottom edge, left to right
    pts.push([0, 0], [w * 0.5, -h * 0.05], [w, 0]);
    // right bumps going up
    pts.push([w * 1.06, h * 0.35], [w * 0.92, h * 0.7], [w * 0.7, h * 0.85]);
    // curled end: a hook that rises and rolls back inward
    pts.push([w * 0.55, h * (0.85 + curl)], [w * 0.38, h * (0.8 + curl)], [w * 0.36, h * 0.6]);
    pts.push([w * 0.48, h * 0.55], [w * 0.5, h * 0.42], [w * 0.3, h * 0.45]);
    // left bumps going down
    pts.push([w * 0.1, h * 0.5], [-w * 0.05, h * 0.3]);
    return pts;
  };

  const cloud = (at: [number, number, number], w: number, h: number, flip: number, side: number, curl = 0.25) => {
    const out = cloudOutline(w, h, curl).map(([x, y]) => [x * flip, y] as [number, number]);
    if (flip < 0) out.reverse();
    // Outline (mistDeep) slightly larger and thicker, then the mist fill on top.
    const dir: [number, number, number] = [0, 0, 1];
    const x: [number, number, number] = [0, 0, side];
    // Flank clouds are drawn side-on so the scroll reads from the side.
    const edge = b.extrude(out, { at, x, y: [0, 1, 0], thickness: 0.026, smoothing: 2, color: P.mistDeep });
    const sc = 0.9;
    const inner = out.map(([px, py]) => [(px - w * 0.5 * flip) * sc + w * 0.5 * flip, (py - h * 0.4) * sc + h * 0.4] as [number, number]);
    const a2: [number, number, number] = [at[0] + side * 0, at[1], at[2]];
    // offset the fill outward along the x-axis (the thickness direction) so it sits proud
    a2[0] = at[0] + (side > 0 ? 0.0 : 0.0);
    b.extrude(inner, {
      at: [at[0] + 0.0, at[1], at[2]],
      x,
      y: [0, 1, 0],
      thickness: 0.034,
      smoothing: 2,
      color: P.mist,
    });
    void edge;
    void dir;
  };

  // Flank clouds: outside the body half-width (~0.65) plus legs, so x around +-1.0 .. 1.1.
  // Extrude x axis runs along z so the cloud reads from the side.
  cloud([1.05, 0.95, -0.9], 1.0, 0.38, 1, 1, 0.3);
  cloud([-1.05, 1.15, 0.35], 0.9, 0.34, -1, -1, 0.3);
  cloud([1.08, 1.2, 0.5], 0.8, 0.3, 1, 1, 0.35);
  cloud([-1.05, 0.7, -1.2], 0.9, 0.32, 1, -1, 0.25);
  // Low bank near front left foot (x+, z+), kept beyond the leg box
  cloud([1.0, 0.1, 1.5], 0.7, 0.2, 1, 1, 0.2);

  // Small thin streaks that read as trailing wisps behind the clouds
  for (const s of [1, -1]) {
    b.capsule([s * 1.1, 0.5, -1.6], [s * 1.1, 0.5, -1.15], 0.018, P.mistDeep);
    b.capsule([s * 1.12, 0.62, -1.9], [s * 1.12, 0.62, -1.45], 0.014, P.mist);
  }

  // Dream motes spiralling toward the trunk tip
  const tip = M.trunkMouth;
  const motes: [number, number, number][] = [
    [tip[0] + 0.0, tip[1] + 0.12, tip[2] + 0.12],
    [tip[0] + 0.42, tip[1] + 0.42, tip[2] - 0.05],
    [tip[0] + 0.85, tip[1] + 0.6, tip[2] - 0.5],
  ];
  const sizes = [0.045, 0.06, 0.075];
  motes.forEach((p, i) => {
    glow(
      b.part(new THREE.OctahedronGeometry(sizes[i], 0), P.dreamGlow, {
        at: p,
        rotation: [R() * 60, R() * 60, R() * 60],
      }),
      1.4,
    );
    // trail beads behind each mote, further out along the spiral
    const next = i < 2 ? motes[i + 1] : [p[0] + 0.45, p[1] + 0.15, p[2] - 0.5];
    for (let k = 1; k <= 2; k++) {
      const t = k * 0.28;
      b.part(new THREE.SphereGeometry(0.018 - k * 0.003, 6, 4), P.gold, {
        at: [p[0] + (next[0] - p[0]) * t, p[1] + (next[1] - p[1]) * t, p[2] + (next[2] - p[2]) * t],
      });
    }
  });
}
    return buildDreamAura;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bakuSpirit" });
  const J: Record<string, Joint> = {};
  J["spine"] = b.joint("spine", { at: [0,1.15,-0.1], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,1.2,0.75], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.42,1.35], dir: [0,0.35,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.62,1.72], dir: [0,0.15,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.5,1.78], dir: [0,-0.6,1], role: "jaw" });
  J["trunk1"] = b.joint("trunk1", { parent: J["head"], at: [0,1.5,1.95], dir: [0,-0.35,1], role: "tentacle" });
  J["trunk2"] = b.joint("trunk2", { parent: J["trunk1"], at: [0,1.28,2.15], dir: [0,-0.6,0.8], role: "tentacle" });
  J["trunk3"] = b.joint("trunk3", { parent: J["trunk2"], at: [0,1,2.25], dir: [0,-1,0.3], role: "tentacle" });
  J["earL"] = b.joint("earL", { parent: J["head"], at: [0.34,2.02,1.62], dir: [0.5,0.8,-0.1], role: "hinge" });
  J["earR"] = b.joint("earR", { parent: J["head"], at: [-0.34,2.02,1.62], dir: [-0.5,0.8,-0.1], role: "hinge" });
  J["tail1"] = b.joint("tail1", { parent: J["spine"], at: [0,1.35,-1.3], dir: [0,0.4,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.55,-1.65], dir: [0,0.7,-0.7], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.7,-1.9], dir: [0,0.9,-0.4], role: "tail" });
  J["hipFL"] = b.joint("hipFL", { parent: J["chest"], at: [0.5,0.95,0.95], dir: [0,-1,0], role: "leg" });
  J["kneeFL"] = b.joint("kneeFL", { parent: J["hipFL"], at: [0.56,0.5,1.02], dir: [0,-1,0], role: "leg" });
  J["ankleFL"] = b.joint("ankleFL", { parent: J["kneeFL"], at: [0.56,0.18,0.98], dir: [0,-1,0], role: "leg" });
  J["hipFR"] = b.joint("hipFR", { parent: J["chest"], at: [-0.5,0.95,0.95], dir: [0,-1,0], role: "leg" });
  J["kneeFR"] = b.joint("kneeFR", { parent: J["hipFR"], at: [-0.56,0.5,1.02], dir: [0,-1,0], role: "leg" });
  J["ankleFR"] = b.joint("ankleFR", { parent: J["kneeFR"], at: [-0.56,0.18,0.98], dir: [0,-1,0], role: "leg" });
  J["hipHL"] = b.joint("hipHL", { parent: J["spine"], at: [0.5,0.98,-1], dir: [0,-1,0], role: "leg" });
  J["kneeHL"] = b.joint("kneeHL", { parent: J["hipHL"], at: [0.54,0.5,-1.06], dir: [0,-1,0], role: "leg" });
  J["ankleHL"] = b.joint("ankleHL", { parent: J["kneeHL"], at: [0.54,0.18,-1], dir: [0,-1,0], role: "leg" });
  J["hipHR"] = b.joint("hipHR", { parent: J["spine"], at: [-0.5,0.98,-1], dir: [0,-1,0], role: "leg" });
  J["kneeHR"] = b.joint("kneeHR", { parent: J["hipHR"], at: [-0.54,0.5,-1.06], dir: [0,-1,0], role: "leg" });
  J["ankleHR"] = b.joint("ankleHR", { parent: J["kneeHR"], at: [-0.54,0.18,-1], dir: [0,-1,0], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
