import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { countershade, gradient, mottle } from "../src/paint";
import type { Hit } from "../src/surface";
import { svg } from "../src/texture";

export const meta = {
  name: "Warthog · Sonnet",
  description:
    "Common warthog, 0.75 m at the shoulder: long flat head with cheek warts, two pairs of curved tusks, separate lower jaw, " +
    "bristly mane down neck and spine, upright tufted tail, sparse grey-brown hide, cloven hooves. Standing rest pose.",
};

const HIDE_A = "#8c8074";
const HIDE_B = "#5f5349";
const BELLY = "#b3a392";
const WART = "#8b7467";
const SNOUT = "#3d3633";
const HOOF = "#2a2321";
const IVORY = "#efe4c6";
const TUSK_ROOT = "#a48c62";
const EYE = "#16100e";
const MANE_DARK = "#2b2421";
const WHISKER = "#e9e1cf";

// a clump of tapered, curved strands; fill is a colour or "url(#g)" for the dark-root, sandy-tip gradient
function clumpSvg(fill: string) {
  const strands = [
    [7, 2],
    [13, 9],
    [19, 19],
    [25, 29],
    [31, 36],
    [35, 39],
  ]
    .map(
      ([bx, tx]) =>
        `<path d="M${bx - 3.8} 64 Q${bx + (tx - bx) * 0.2} 30 ${tx} 1 Q${bx + (tx - bx) * 0.2 + 4.5} 32 ${bx + 3.8} 64 Z" fill="${fill}"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 40 64"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="0">
    <stop offset="0" stop-color="#2b2421"/><stop offset="0.4" stop-color="#6a574a"/><stop offset="1" stop-color="#e0d3b3"/>
  </linearGradient></defs>${strands}</svg>`;
}
const BRISTLE = svg(clumpSvg("url(#g)"), { size: 192 });
const CLUMP = svg(clumpSvg("#ffffff"), { size: 192 });
// one grey strand, tinted by the part colour
const STRAND = svg(
  `<svg viewBox="0 0 16 64"><path d="M4 64 C6 42 8 20 11 1 C12 24 12 46 13 64 Z" fill="#ffffff"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "warthog" });
  const rand = rng(11);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.49, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.49, -0.4],
      [0, 0.495, -0.12],
      [0, 0.505, 0.15],
      [0, 0.52, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.52, 0.3],
      [0, 0.545, 0.36],
      [0, 0.55, 0.42],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const SNOUT_TIP: [number, number, number] = [0, 0.42, 0.82];
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.55, 0.42], aim: SNOUT_TIP, role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.455, 0.5],
    aim: [0, 0.385, 0.74],
    role: "jaw",
  });

  // ---------------------------------------------------------------- body
  const hide = countershade(mottle(HIDE_A, HIDE_B, { size: 0.16, contrast: 0.6 }), BELLY, { level: -0.45 });
  const body = b.loft(
    [
      { at: [0, 0.535, -0.6], w: 0.17, h: 0.2 },
      { at: [0, 0.52, -0.5], w: 0.27, h: 0.33 },
      { at: [0, 0.515, -0.3], w: 0.3, h: 0.34 },
      { at: [0, 0.5, -0.05], w: 0.31, h: 0.37 },
      { at: [0, 0.495, 0.15], w: 0.33, h: 0.43 },
      { at: [0, 0.52, 0.3], w: 0.28, h: 0.38 },
      { at: [0, 0.545, 0.42], w: 0.21, h: 0.27 },
    ],
    { bone: [hips, spine, neck], color: hide, sides: 10, name: "body" },
  );

  // ---------------------------------------------------------------- head
  const skull = b.loft(
    [
      { at: [0, 0.575, 0.36], w: 0.2, h: 0.24 },
      { at: [0, 0.57, 0.46], w: 0.235, h: 0.25 },
      { at: [0, 0.535, 0.58], w: 0.18, h: 0.18 },
      { at: [0, 0.485, 0.69], w: 0.145, h: 0.135 },
      { at: [0, 0.45, 0.76], w: 0.15, h: 0.12 },
    ],
    { bone: head, color: hide, sides: 8, caps: { start: "round", end: "flat" }, name: "skull" },
  );
  const snoutDir: [number, number, number] = [0, -0.3, 0.95];
  const pad = b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.045, 10), SNOUT, {
    bone: head,
    at: [0, 0.447, 0.777],
    dir: snoutDir,
    scale: [1, 1, 0.62],
    name: "nosePad",
  });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.008, 6), "#0c0908", {
      bone: head,
      at: pad.local([-s * 0.034, 0.0225, 0.004]),
      dir: snoutDir,
      name: "nostril",
    });

  const jawBox = b.loft(
    [
      { at: [0, 0.44, 0.48], w: 0.14, h: 0.09 },
      { at: [0, 0.405, 0.6], w: 0.115, h: 0.065 },
      { at: [0, 0.385, 0.71], w: 0.09, h: 0.05 },
    ],
    { bone: jaw, color: countershade(hide, BELLY, { level: 0.6 }), sides: 8, caps: { start: "round", end: "flat" }, name: "lowerJaw" },
  );

  const skullSkin = b.surface(skull);
  const jawSkin = b.surface(jawBox);
  const bigWart = new THREE.CylinderGeometry(0.01, 0.034, 0.07, 6);
  const midWart = new THREE.CylinderGeometry(0.006, 0.021, 0.045, 6);
  const smallWart = new THREE.CylinderGeometry(0.004, 0.013, 0.03, 5);
  const tilt = (hit: Hit, x: number, y: number, z: number) => frame(hit, hit.n.clone().add(new THREE.Vector3(x, y, z)).normalize());
  for (const s of [1, -1]) {
    const cheek = skullSkin.nearest([s * 0.16, 0.49, 0.53]);
    b.stick(bigWart, WART, tilt(cheek, 0, -0.55, 0.35), { embed: 0.25, flat: true, name: "wartCheek" });
    const snoutWart = skullSkin.nearest([s * 0.1, 0.53, 0.675]);
    b.stick(midWart, WART, tilt(snoutWart, 0, -0.2, 0.5), { embed: 0.25, flat: true, name: "wartSnout" });
    const chin = jawSkin.nearest([s * 0.07, 0.385, 0.62]);
    b.stick(smallWart, WART, tilt(chin, 0, -0.3, 0.3), { embed: 0.25, flat: true, name: "wartJaw" });
    const brow = skullSkin.nearest([s * 0.11, 0.6, 0.43]);
    b.stick(smallWart, WART, tilt(brow, 0, 0.1, 0.3), { embed: 0.3, flat: true, name: "wartBrow" });
  }

  // skin folds across the muzzle
  for (const z of [0.56, 0.6, 0.64]) {
    const fold = skullSkin.drape(
      catmull([
        [-0.085, 0.53, z],
        [-0.06, 0.59, z],
        [0, 0.64, z],
        [0.06, 0.59, z],
        [0.085, 0.53, z],
      ]),
      { lift: 0.001 },
    );
    b.sweep(catmull([0, 0.25, 0.5, 0.75, 1].map((t) => fold.at(t))), [0.0038, 0.002], { bone: head, color: "#5a4d44", sides: 3, caps: "flat", name: "fold" });
  }

  // tusks: upper pair long, swinging out then up; lower pair short and upright behind them
  for (const s of [1, -1]) {
    const up0: [number, number, number] = [s * 0.06, 0.43, 0.7];
    b.sweep(bezier(up0, [s * 0.15, 0.34, 0.75], [s * 0.25, 0.42, 0.79], [s * 0.2, 0.6, 0.76]), [0.03, 0.005], {
      bone: head,
      color: gradient(TUSK_ROOT, IVORY, up0, [s * 0.16, 0.38, 0.76]),
      caps: { start: "flat", end: "point" },
      sides: 7,
      name: "tuskUpper",
    });
    const lo0: [number, number, number] = [s * 0.05, 0.385, 0.655];
    b.sweep(bezier(lo0, [s * 0.09, 0.4, 0.68], [s * 0.1, 0.46, 0.7], [s * 0.095, 0.52, 0.69]), [0.016, 0.003], {
      bone: jaw,
      color: gradient(TUSK_ROOT, IVORY, lo0, [s * 0.09, 0.45, 0.69]),
      caps: { start: "flat", end: "point" },
      sides: 6,
      name: "tuskLower",
    });
  }

  // eyes, small and high on the head, each in a skin-coloured socket lump
  for (const s of [1, -1]) {
    const hit = skullSkin.nearest([s * 0.11, 0.625, 0.5]);
    b.stick(new THREE.SphereGeometry(0.027, 8, 5), HIDE_B, hit, { embed: 0.45, scale: [1, 0.7, 1.15], name: "socket" });
    b.stick(new THREE.SphereGeometry(0.016, 5, 4), EYE, hit.moved([0, 0.004, 0]), { embed: 0.45, name: "eye" });
    b.stick(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", hit.moved([s * 0.004, 0.017, 0.004]), { embed: 0.4, name: "glint" });
  }

  // ears: short, rounded, tipped out and forward
  for (const s of [1, -1]) {
    const up = new THREE.Vector3(s * 0.75, 0.62, -0.25).normalize();
    const out = new THREE.Vector3(s * 0.3, 0.5, 0.8);
    out.addScaledVector(up, -out.dot(up)).normalize();
    const across = up.clone().cross(out);
    const base: [number, number, number] = [s * 0.07, 0.66, 0.4];
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: base, dir: up.toArray(), role: "hinge" });
    b.extrude(
      [
        [-0.034, 0],
        [0.034, 0],
        [0.04, 0.06],
        [0.012, 0.125],
        [-0.022, 0.12],
        [-0.04, 0.06],
      ],
      { at: base, x: across.toArray(), y: up.toArray(), thickness: [0.014, 0.006], bevel: 0.003, smoothing: 1, color: hide, bone: ear, name: "ear" },
    );
    b.extrude(
      [
        [-0.021, 0.02],
        [0.021, 0.02],
        [0.026, 0.06],
        [0.008, 0.098],
        [-0.014, 0.094],
        [-0.027, 0.06],
      ],
      { at: new THREE.Vector3(...base).addScaledVector(out, 0.005), x: across.toArray(), y: up.toArray(), thickness: 0.004, smoothing: 1, color: "#a98879", bone: ear, name: "earInner" },
    );
    const rim = [0.2, 0.4, 0.6, 0.8].map((k) =>
      frame(new THREE.Vector3(...base).addScaledVector(up, 0.125 * k).addScaledVector(across, -0.04 * (1 - k * 0.5)), across.clone().negate()),
    );
    b.cards(rim, STRAND, { size: [0.022, 0.05], lean: 55, flow: up.toArray(), color: WHISKER, bone: ear, vary: 0.2, rng: rand, cross: true });
  }

  // ---------------------------------------------------------------- legs
  const FOOT_Y = 0.056;
  const legHide = gradient(hide, "#4a4039", [0, 0.26, 0], [0, 0.07, 0]);
  const toeShape: OutlinePoint[] = [
    [-0.03, 0.012],
    [0.012, 0.012],
    [0.044, -0.056],
    [-0.032, -0.056],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fx = s * 0.105;
    const hx = s * 0.105;
    const defs = [
      {
        pts: limb([fx, 0.46, 0.2], [fx, FOOT_Y, 0.225], [0.17, 0.15, 0.11], [[0, 0, -1], [0, 0, 1]]),
        parent: spine.joints[2],
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hoofF${S}`],
        radii: [0.072, 0.058, 0.045, 0.034, 0.031, 0.033],
      },
      {
        pts: limb([hx, 0.47, -0.43], [hx, FOOT_Y, -0.45], [0.2, 0.16, 0.12], [[0, 0, 1], [0, 0, -1]]),
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `hock${S}`, `hoofB${S}`],
        radii: [0.085, 0.065, 0.047, 0.035, 0.032, 0.034],
      },
    ];
    for (const d of defs) {
      const leg = b.chain(`leg${d.names[3].slice(4)}`, catmull(d.pts), { parent: d.parent, names: d.names, role: "leg" });
      b.sweep(leg, d.radii, { color: legHide, sides: 7, name: "leg" });
      const foot = d.pts[d.pts.length - 1];
      const hoofBone = leg.tip ?? leg.joints[leg.joints.length - 1];
      for (const t of [1, -1]) {
        const tx = foot.x + t * 0.0165;
        const toe = b.joint(`toe${t > 0 ? "Out" : "In"}${d.names[3].slice(4)}`, {
          parent: hoofBone,
          at: [tx, foot.y - 0.02, foot.z],
          aim: [tx, 0, foot.z + 0.045],
          role: "digit",
        });
        b.extrude(toeShape, { at: [tx, foot.y, foot.z], thickness: 0.031, bevel: 0.005, color: HOOF, bone: toe, name: "hoof" });
      }
      b.part(new THREE.SphereGeometry(0.012, 5, 4), HOOF, {
        bone: hoofBone,
        at: [foot.x, foot.y + 0.03, foot.z - 0.03],
        name: "dewclaw",
      });
      // carpal / hock knob
      b.part(new THREE.SphereGeometry(0.036, 6, 4), legHide, {
        bone: leg.joints[2],
        at: [d.pts[2].x, d.pts[2].y, d.pts[2].z + (d.parent === hips ? -0.012 : 0.012)],
        scale: [0.8, 1.1, 1],
        name: "joint",
      });
    }
  }

  // ---------------------------------------------------------------- tail
  const tailPath = catmull([
    [0, 0.6, -0.67],
    [0, 0.69, -0.735],
    [0, 0.79, -0.745],
    [0, 0.87, -0.715],
    [0, 0.92, -0.68],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  b.sweep(tail, [0.028, 0.009], { color: HIDE_B, sides: 6, caps: "round", name: "tail" });
  const tuft = b.ring(tail.at(1), { count: 6, radius: 0.006 }, () => {}).items;
  b.cards(tuft, CLUMP, {
    size: [0.07, 0.13],
    lean: 10,
    bend: 80,
    flow: [0, -0.25, -1],
    color: MANE_DARK,
    vary: 0.2,
    spin: 50,
    rng: rand,
    cross: true,
    name: "tuft",
  });

  // ---------------------------------------------------------------- mane
  const topSkin = b.surface([body, skull]);
  const bands: { from: number; to: number; size: [number, number]; lean: number; bend: number }[] = [
    { from: 0.52, to: 0.4, size: [0.075, 0.1], lean: 50, bend: 30 },
    { from: 0.39, to: 0.22, size: [0.09, 0.17], lean: 48, bend: 45 },
    { from: 0.21, to: 0.02, size: [0.085, 0.15], lean: 52, bend: 45 },
    { from: 0.01, to: -0.25, size: [0.07, 0.11], lean: 57, bend: 40 },
    { from: -0.26, to: -0.6, size: [0.06, 0.075], lean: 62, bend: 30 },
  ];
  for (const band of bands) {
    const hits = [];
    const n = Math.max(2, Math.round(Math.abs(band.to - band.from) / 0.04));
    for (let i = 0; i <= n; i++) {
      const z = band.from + ((band.to - band.from) * i) / n;
      for (const off of [-0.025, 0.025]) {
        const h = topSkin.ray([off + (rand() - 0.5) * 0.02, 1.4, z], [0, -1, 0]);
        if (h) hits.push(h);
      }
    }
    b.cards(hits, BRISTLE, {
      size: band.size,
      lean: band.lean,
      bend: band.bend,
      flow: [0, -0.15, -1],
      vary: 0.2,
      spin: 10,
      rng: rand,
      cross: true,
      name: "mane",
    });
  }

  // sparse short bristles over the hide, a beard of pale tufts on the cheeks
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(120, { rng: rng(5), minDist: 0.065, filter: (h) => h.n.y > -0.35 && h.at.z < 0.3 }),
    STRAND,
    { size: [0.012, 0.04], lean: 68, bend: 15, flow: [0, -0.2, -1], color: "#574a41", vary: 0.3, rng: rand },
  );
  b.cards(
    skullSkin.scatter(26, { rng: rng(9), minDist: 0.04, filter: (h) => Math.abs(h.at.x) > 0.07 && h.at.y < 0.54 && h.n.y < 0.3 }),
    CLUMP,
    { size: [0.026, 0.05], lean: 62, bend: 25, flow: [0, -0.5, -1], color: "#cfc5b0", vary: 0.25, rng: rand, name: "beard" },
  );

  return b.root;
}
