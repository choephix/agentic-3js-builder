import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Sweep } from "../src/sweep";
import { limb } from "../src/ik";
import { offset, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { countershade, gradient, mottle } from "../src/paint";
import { svg } from "../src/texture";

// ---- palette: grey-brown hide, dark bristles, ivory tusks ----
const HIDE_A = "#84715f"; // warm grey-brown skin
const HIDE_B = "#695748"; // darker mottle
const BELLY = "#a18d75"; // dusty pale underside
const WART = "#93806b"; // pale facial warts
const EAR_C = "#7b695b"; // ears, a shade darker than the hide
const MANE = "#2c211a"; // near-black bristles
const TUSK = "#e8dec4"; // ivory
const HOOF = "#3f332a"; // dark hoof
const NOSE = "#54433a"; // snout disc
const NOSTRIL = "#241b16";
const EYE = "#150f0b";
const MUD = "#4e4036"; // dirt on the lower legs

// wavy hair tuft drawing, reused by the mane and the sparse coat hair
const maneTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 32"><path d="M2.5 1 C1.5 10 3.5 21 2.2 31" fill="none" stroke="#33271e" stroke-width="1.6" stroke-linecap="round"/><path d="M6 0.5 C5 11 7 20 5.8 31.5" fill="none" stroke="#33271e" stroke-width="1.7" stroke-linecap="round"/><path d="M9.5 1 C10.5 9 8.5 22 9.8 31" fill="none" stroke="#33271e" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

// sparse-haired grey-brown hide: mottled skin with fine grain, pale below
const hide = countershade(
  mottle(HIDE_A, HIDE_B, { size: 0.14, contrast: 0.7, seed: 3 }),
  BELLY,
  { level: -0.32, soft: 0.2 },
);
const legHide = (x: number, z: number) => gradient(hide, MUD, [x, 0.3, z], [x, 0.12, z]);

type Key3 = readonly [number, number, number];
/** radius keys [t, rx, ry] interpolated over the swept range */
const keyed =
  (keys: readonly Key3[]) =>
  (t: number): [number, number] => {
    const k = Math.min(Math.max(t, 0), 1);
    let i = 0;
    while (i < keys.length - 2 && k > keys[i + 1][0]) i++;
    const [t0, a0, b0] = keys[i];
    const [t1, a1, b1] = keys[i + 1];
    const f = t1 === t0 ? 0 : (k - t0) / (t1 - t0);
    return [a0 + (a1 - a0) * f, b0 + (b1 - b0) * f];
};

export const meta = {
  name: "Warthog · Ox",
  description:
    "A 0.75 m warthog in rest pose: deep sloping body over four cloven-hooved legs, a long flat head with " +
    "facial warts, two pairs of curved ivory tusks on a hinged lower jaw, small high-set eyes, a bristly mane " +
    "down the neck and spine, and a thin upright tail with a dark tuft.",
};

export default function build() {
  const b = createBuilder({ name: "warthogOx" });

  // ---- spine: one curve cut at the core so the body has no seam ----
  const bodyPath = catmull([
    [0, 0.52, -0.66],
    [0, 0.54, -0.3],
    [0, 0.55, 0.06],
    [0, 0.55, 0.42],
  ]);
  const core = b.joint("core", { at: [0, 0.55, 0.05] });
  const tCore = bodyPath.closestT(core.at);
  const back = b.chain("back", bodyPath.slice(tCore, 0), {
    parent: core,
    count: 3,
    names: ["back", "pelvis", "rump"],
    role: "spine",
  });
  const front = b.chain("front", bodyPath.slice(tCore, 1), {
    parent: core,
    count: 2,
    names: ["chest", "withers"],
    role: "spine",
  });
  // deep chest, belly hanging below the spine, sloping down to the rump
  const body = b.sweep(
    bodyPath,
    keyed([
      [0, 0.15, 0.16],
      [0.3, 0.175, 0.2],
      [0.6, 0.19, 0.225],
      [0.85, 0.185, 0.21],
      [1, 0.16, 0.18],
    ]),
    {
      bone: [back, core, front],
      shift: (t) => [0, -0.018 - 0.012 * Math.sin(Math.PI * t)],
      color: hide,
    },
  );

  // ---- short thick neck and the long flat head ----
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.56, 0.36],
      [0, 0.57, 0.405],
      [0, 0.575, 0.44],
    ]),
    { parent: front.joints[1], count: 2, names: ["neck", "nape"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.58, 0.46], aim: [0, 0.61, 0.75], role: "head" });
  const headPath = catmull([
    [0, 0.565, 0.38],
    [0, 0.575, 0.45],
    [0, 0.595, 0.53],
    [0, 0.605, 0.63],
    [0, 0.61, 0.75],
  ]);
  const skull = b.sweep(
    headPath,
    keyed([
      [0, 0.135, 0.125],
      [0.25, 0.1, 0.085],
      [0.5, 0.092, 0.075],
      [0.75, 0.075, 0.06],
      [1, 0.06, 0.05],
    ]),
    { bone: [neck, head], section: "box", color: hide },
  );

  // ---- separate lower jaw, slightly parted so it reads ----
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.495, 0.43], aim: [0, 0.47, 0.62], role: "jaw" });
  b.sweep(
    catmull([
      [0, 0.49, 0.44],
      [0, 0.49, 0.55],
      [0, 0.505, 0.65],
      [0, 0.52, 0.72],
    ]),
    [0.05, 0.024],
    { bone: jaw, color: hide },
  );

  // ---- snout disc and nostrils ----
  const tip = skull.at(1);
  b.part(new THREE.CylinderGeometry(0.052, 0.064, 0.028, 10), NOSE, {
    bone: head,
    at: offset(tip, tip.tangent, 0.012),
    dir: tip.tangent,
  });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.016, 6), NOSTRIL, {
      bone: head,
      at: offset(tip, tip.tangent, 0.03).add(new THREE.Vector3(s * 0.026, -0.004, 0)),
      dir: tip.tangent,
    });

  // ---- small eyes set high on the head ----
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.018, 6, 4), EYE, { bone: head, at: head.local([s * 0.088, 0.07, 0.062]) });

  // ---- facial warts: big cheek pads and smaller snout warts ----
  const face = b.surface(skull);
  for (const s of [1, -1]) {
    const cheek = face.around().at(s * 42, -18);
    if (cheek) b.stick(new THREE.SphereGeometry(1, 8, 6).scale(0.05, 0.028, 0.06), WART, cheek, { embed: 0.3 });
    const snoutWart = face.around().at(s * 62, 6);
    if (snoutWart) b.stick(new THREE.SphereGeometry(1, 8, 6).scale(0.03, 0.018, 0.036), WART, snoutWart, { embed: 0.3 });
  }

  // ---- leaf-shaped ears on the skull top ----
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.08, 0.014],
        [0.11, 0.08],
        [0.07, 0.135],
        [0.016, 0.088],
      ],
      {
        at: head.local([s * 0.055, 0.045, 0.075]),
        x: [s * 1.05, 0.4, -0.3],
        y: [0.25, 1, 0.1],
        thickness: [0.014, 0.005],
        smoothing: 2,
        color: EAR_C,
      },
    );

  // ---- two pairs of curved tusks ----
  for (const s of [1, -1]) {
    // upper tusks: long crescents curving out and up from the snout sides
    b.sweep(bezier([s * 0.072, 0.585, 0.63], [s * 0.105, 0.6, 0.67], [s * 0.13, 0.72, 0.64]), [0.026, 0.006], {
      bone: head,
      color: TUSK,
      caps: { start: "flat", end: "point" },
    });
    // lower tusks: shorter, sharp, rising past the lip from the jaw
    b.sweep(bezier([s * 0.028, 0.5, 0.665], [s * 0.04, 0.53, 0.69], [s * 0.055, 0.6, 0.685]), [0.015, 0.003], {
      bone: jaw,
      color: TUSK,
      caps: { start: "flat", end: "point" },
    });
  }

  // ---- four legs planted on the floor, with cloven hooves ----
  const hoof = (x: number, z: number, foot: (typeof back.joints)[number]) => {
    for (const t of [1, -1])
      b.frustumBox([x + t * 0.019, 0.095, z], [x + t * 0.019, 0, z], [0.022, 0.052], [0.017, 0.034], {
        bone: foot,
        color: HOOF,
      });
  };
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    // front leg: near-straight column, elbow back, carpus forward
    const fp = limb([s * 0.14, 0.52, 0.22], [s * 0.15, 0.075, 0.24], [0.2, 0.17, 0.1], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const legF = b.chain(`legF${S}`, fp, {
      parent: front.joints[0],
      names: [`shoulder${S}`, `elbow${S}`, `carpus${S}`, `hoof${S}`],
      role: "leg",
      contact: [s * 0.15, 0, 0.252],
    });
    b.sweep(legF, [0.05, 0.036, 0.028], { color: legHide(s * 0.15, 0.23) });
    hoof(s * 0.15, 0.252, legF.tip!);
    // hind leg: knee forward, hock back, vertical cannon
    const hp = limb([s * 0.13, 0.5, -0.42], [s * 0.15, 0.075, -0.4], [0.22, 0.22, 0.15], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const legH = b.chain(`legH${S}`, hp, {
      parent: back.joints[1],
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pastern${S}`],
      role: "leg",
      contact: [s * 0.15, 0, -0.385],
    });
    b.sweep(legH, [0.068, 0.042, 0.03], { color: legHide(s * 0.15, -0.39) });
    hoof(s * 0.15, -0.385, legH.tip!);
  }

  // ---- thin upright tail with a dark tuft ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.63, -0.6],
      [0, 0.66, -0.72],
      [0, 0.75, -0.78],
      [0, 0.86, -0.74],
    ]),
    { parent: back.joints[2], names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  b.sweep(tail, [0.016, 0.006], { color: hide });
  const tuft: [number, number, number][] = [
    [-0.22, -0.12, 0.07],
    [-0.08, 0.04, 0.09],
    [0.05, -0.05, 0.085],
    [0.2, 0.03, 0.07],
    [0, 0.14, 0.08],
  ];
  const tipJoint = tail.tip!;
  for (const [dx, dz, len] of tuft)
    b.spike(tipJoint.moved([0, 0.01, 0]), [dx, 1, dz], len, 0.006, { bone: tipJoint, color: MANE });

// ---- bristly mane: tufts of hair cards along the neck and spine ----
  const maneRng = rng(21);
  const hMane = (t: number) =>
    t < 0.62 ? 0.035 + (t - 0.4) * 0.09 : t < 0.85 ? 0.055 + (t - 0.62) * 0.13 : 0.085 - (t - 0.85) * 0.16;
  const maneTufts = (sw: Sweep, t0: number, t1: number, n: number, hAt: (t: number) => number) => {
    for (let i = 0; i < n; i++) {
      const t = t0 + ((t1 - t0) * (i + 0.5)) / n;
      const h = hAt(t) * (0.85 + maneRng() * 0.3);
      const f = sw.at(t, (maneRng() - 0.5) * 9);
      b.cards([f], maneTex, { size: [0.034, h * 1.55], lean: 50, bend: 25, flow: [0, 0, -1] }); // shags back
      b.cards([f], maneTex, { size: [0.034, h * 1.05], lean: 14, bend: 18, flow: [1, 0, 0] }); // reads from the right
      b.cards([f], maneTex, { size: [0.034, h * 1.05], lean: 14, bend: 18, flow: [-1, 0, 0] }); // reads from the left
    }
  };
  maneTufts(body, 0.41, 0.99, 30, hMane);
  maneTufts(skull, 0.03, 0.27, 6, (t) => 0.095 - t * 0.12);

  // ---- sparse bristly hair over the hide ----
  const coat = b.surface(body);
  const hairs = coat.scatter(85, { rng: rng(11), minDist: 0.055, filter: (h) => h.n.y > -0.25 });
  b.cards(hairs, maneTex, { size: [0.014, 0.055], lean: 74, bend: 16, vary: 0.35, rng: rng(12) });

  return b.root;
}