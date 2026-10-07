import * as THREE from "three";
import {
  arc,
  bezier,
  catmull,
  createBuilder,
  grain,
  mottle,
  noise,
  paint,
  rng,
  scales,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

// Palette
const STONE_A = "#8f969c";
const STONE_B = "#7e858c";
const STONE_C = "#9da3a9";
const STONE_EDGE = "#596067";
const MOSS_DARK = "#33602b";
const MOSS_LIGHT = "#6ea247";
const LEG_A = "#8a6642";
const LEG_B = "#5e4329";
const HOOF = "#2c2420";
const MASK_A = "#ead9b6";
const MASK_B = "#dcc39c";
const MASK_EDGE = "#b59c70";
const MASK_LINE = "#7b5d3c";
const SOCKET = "#2a221c";
const ANTLER_A = "#d9c8a2";
const ANTLER_B = "#bca47a";
const FLOWER = "#fbf9f1";
const FLOWER_CORE = "#f2c748";
const LEAF = "#6aa84f";
const EAR = "#5f9a46";
const GLOW = "#c2ff62";
const FIREFLY = "#eaff86";
const TRAIL = "#d6ff9c";

const MASK_T = 0.035;

const MASK_OUTLINE: OutlinePoint[] = [
  [0, 0.085],
  [0.04, 0.08],
  [0.075, 0.065],
  [0.085, 0.02],
  [0.08, -0.03],
  [0.065, -0.07],
  [0.035, -0.095],
  [0, -0.102],
  [-0.035, -0.095],
  [-0.065, -0.07],
  [-0.08, -0.03],
  [-0.085, 0.02],
  [-0.075, 0.065],
  [-0.04, 0.08],
];

const EAR_OUTLINE: OutlinePoint[] = [
  [0, -0.026],
  [0.06, -0.03],
  [0.13, 0, "sharp"],
  [0.06, 0.03],
  [0, 0.026],
];

const LEAF_OUTLINE: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.03, 0.016],
  [0.07, 0, "sharp"],
  [0.03, -0.016],
];

export const meta = {
  name: "Moss Stone Forest Spirit",
  description:
    "A small part-deer, part-mossy-stone forest spirit with a pale wooden mask face, glowing green eyes, flowering antlers and circling fireflies.",
};

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  // ---- paints ----
  const stoneCells = scales([STONE_A, STONE_B, STONE_C], STONE_EDGE, { size: 0.08, width: 0.16, seed: 4 });
  const moss = mottle(MOSS_DARK, MOSS_LIGHT, { size: 0.06, contrast: 0.7, seed: 2 });
  const coat = paint((p, n) => (n.y * 0.9 + noise(p, 0.16, 7) * 0.6 > 0.55 ? moss : stoneCells));
  const legWood = grain(LEG_A, LEG_B, { size: 0.025, axis: "y" });
  const antlerWood = grain(ANTLER_A, ANTLER_B, { size: 0.03, axis: "y" });
  const maskWood = grain(MASK_A, MASK_B, { size: 0.03, axis: "x" });
  const maskPaint = paint((_p, n, s) => {
    if (n.z < 0.5) return MASK_EDGE;
    const [u = 0, v = 0] = s;
    if (Math.hypot(u + 0.035, v - 0.01) < 0.027 || Math.hypot(u - 0.035, v - 0.01) < 0.027) return SOCKET;
    const brow =
      Math.abs(u) > 0.012 && Math.abs(u) < 0.078 && Math.abs(v - (0.055 + 0.15 * Math.abs(u))) < 0.0045;
    if (brow) return MASK_LINE;
    if (Math.abs(u) < 0.004 && v < -0.005 && v > -0.06) return MASK_LINE;
    if (Math.abs(u) < 0.02 && Math.abs(v + 0.072) < 0.004) return SOCKET;
    return maskWood;
  });
  const glowTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="g"><stop offset="0" stop-color="#f4ffd6"/><stop offset="0.3" stop-color="#b8ff5e"/><stop offset="0.65" stop-color="#4bc948" stop-opacity="0.85"/><stop offset="1" stop-color="#2f9a3a" stop-opacity="0"/></radialGradient></defs><circle cx="32" cy="32" r="31" fill="url(#g)"/></svg>`,
    { size: 128 },
  );

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.8, -0.36], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.3],
      [0, 0.82, -0.02],
      [0, 0.85, 0.2],
      [0, 0.88, 0.34],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.88, 0.34],
      [0, 1.0, 0.44],
      [0, 1.1, 0.5],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.1, 0.5], aim: [0, 1.1, 0.62], role: "head" });

  // ---- legs with little wooden hooves ----
  const hoof = (leg: ReturnType<typeof b.chain>, x: number, z: number) => {
    b.sweep(leg, (t: number) => 0.026 - 0.008 * t, { color: legWood, section: { ngon: 6 } });
    b.frustumBox([x, 0, z], [x, 0.085, z], [0.046, 0.042], [0.037, 0.034], { color: HOOF, bone: leg.tip! });
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.1;
    const frontLeg = b.chain(
      `legF${S}`,
      catmull([
        [x, 0.7, 0.2],
        [x, 0.36, 0.22],
        [x, 0.075, 0.21],
      ]),
      { parent: spine, names: [`shoulderF${S}`, `kneeF${S}`, `hoofF${S}`], role: "leg" },
    );
    hoof(frontLeg, x, 0.21);
    const hindLeg = b.chain(
      `legH${S}`,
      catmull([
        [x, 0.7, -0.22],
        [x, 0.4, -0.15],
        [x, 0.16, -0.25],
        [x, 0.075, -0.23],
      ]),
      { parent: hips, names: [`hipH${S}`, `stifleH${S}`, `hockH${S}`, `hoofH${S}`], role: "leg" },
    );
    hoof(hindLeg, x, -0.23);
  }

  // ---- river-stone body and neck ----
  const body = b.sweep(
    spine,
    (t: number): [number, number] => {
      const k = Math.sin(Math.PI * Math.pow(t, 0.8));
      return [0.12 + 0.07 * k, 0.13 + 0.05 * k];
    },
    { color: coat, section: { ngon: 9 } },
  );
  b.sweep(neck, (t: number) => 0.1 - 0.025 * t, { color: coat, section: { ngon: 8 } });

  // ---- head: stone skull under a pale wooden mask ----
  b.sweep([head.local({ back: 0.08 }), head.local({ forward: 0.04 })], [0.085, 0.09], {
    bone: head,
    color: coat,
    section: "box",
    caps: { start: "round", end: "flat" },
  });

  for (const s of [1, -1]) {
    b.extrude(EAR_OUTLINE, {
      at: head.local({ left: s * 0.07, up: 0.03 }),
      x: [s * 0.6, 0, -0.8],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: EAR,
      bone: head,
    });
  }

  const maskAt = head.local({ forward: 0.05 });
  const mask = b.extrude(MASK_OUTLINE, {
    at: maskAt,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: MASK_T,
    bevel: 0.008,
    smoothing: 1,
    color: maskPaint,
    bone: head,
  });

  // glowing green eyes
  for (const s of [1, -1]) {
    const eye = (dz: number) => mask.local([s * 0.035, 0.01, MASK_T / 2 + dz]);
    b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", {
      at: eye(0.004),
      dir: [0, 0, 1],
      axis: "z",
      texture: glowTex,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), GLOW, { at: eye(0.01), bone: head });
  }

  // ---- branching antlers with flowers and leaves ----
  const flowerAt = (p: THREE.Vector3) => {
    b.ring(head.moved(p), { count: 5, radius: 0.018 }, (petal) => {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), FLOWER, { at: petal });
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), FLOWER_CORE, { at: p, bone: head });
  };
  const leafAt = (p: THREE.Vector3, angle: number) => {
    b.extrude(LEAF_OUTLINE, {
      at: p,
      x: [Math.cos(angle), 0, Math.sin(angle)],
      y: [0, 1, 0],
      thickness: 0.003,
      smoothing: 2,
      color: LEAF,
      bone: head,
    });
  };

  for (const s of [1, -1]) {
    const P = (left: number, up: number, fwd: number) => head.local({ left: s * left, up, forward: fwd });
    const beam = catmull([P(0.04, 0.05, -0.02), P(0.07, 0.17, -0.04), P(0.12, 0.28, -0.02), P(0.15, 0.38, 0.03)]);
    const tineA = bezier(beam.at(0.4), P(0.2, 0.24, 0.05), P(0.24, 0.34, 0.14));
    const tineB = bezier(beam.at(0.72), P(0.2, 0.36, -0.06), P(0.22, 0.44, -0.1));
    const tineC = bezier(beam.at(0.2), P(0.12, 0.2, -0.1), P(0.15, 0.22, -0.16));

    b.sweep(beam, (t: number) => 0.02 - 0.009 * t, { bone: head, color: antlerWood });
    for (const tine of [tineA, tineB, tineC]) {
      b.sweep(tine, [0.011, 0.004], { bone: head, color: antlerWood });
    }

    flowerAt(beam.at(0.3));
    flowerAt(beam.at(0.62));
    flowerAt(tineA.at(0.6));
    flowerAt(tineB.at(0.5));

    leafAt(beam.at(0.5), s > 0 ? 0.4 : 2.6);
    leafAt(tineA.at(0.75), s > 0 ? 1.9 : 1.2);
    leafAt(tineB.at(0.3), s > 0 ? 3.3 : 0.2);
  }

  // ---- moss tufts on the stone ----
  const tuftsOnBody = b.surface(body).scatter(40, {
    rng: rng(3),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.4,
  });
  tuftsOnBody.forEach((h, i) => {
    const tuft = new THREE.DodecahedronGeometry(i % 3 === 0 ? 0.035 : 0.046, 0).scale(1, 0.6, 1);
    b.stick(tuft, i % 2 === 0 ? MOSS_DARK : MOSS_LIGHT, h, { embed: 0.35 });
  });

  // mossy stub tail
  b.capsule([0, 0.84, -0.38], [0, 0.86, -0.46], [0.05, 0.04], { bone: hips, color: MOSS_LIGHT });

  // ---- fireflies circling the head ----
  const hc = head.local({ up: 0.05, forward: 0.02 });
  const orbits: { axis: [number, number, number]; dir: [number, number, number] }[] = [
    { axis: [0, 1, 0], dir: [1, 0, 0] },
    { axis: [1, 0, 0], dir: [0, 0, 1] },
    { axis: [0.707, 0.707, 0], dir: [-0.707, 0.707, 0] },
    { axis: [0.707, 0, 0.707], dir: [0.707, 0, -0.707] },
  ];
  orbits.forEach((o, i) => {
    const from = hc.clone().add(new THREE.Vector3(...o.dir).multiplyScalar(0.25));
    const orbitPath = arc(hc, from, o.axis, 230 + i * 15);
    b.sweep(orbitPath.slice(0.5, 1), 0.004, { bone: head, color: TRAIL });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), FIREFLY, { at: orbitPath.at(1), bone: head });
  });

  return b.root;
}
