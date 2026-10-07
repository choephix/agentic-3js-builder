import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { glow } from "../kits/glow";

export const meta = {
  name: "Broodmother Spider",
  description:
    "A giant broodmother spider, about 1.8 m tall at the abdomen and 4.6 m across the legs: a faceted violet body with a red dotted hourglass and amber dorsal spikes, eight jointed legs with amber knee bands and claws, glowing red eyes, venom-tipped chelicerae, spiderlings crawling on her back, and a brood of speckled cream egg sacs hung under the abdomen and resting in silk on the floor.",
  style: "low-poly",
  commit: "b816db2",
};

type V = [number, number, number];

const CHITIN = "#1c1227";
const PROSOMA = "#2e1d43";
const PROSOMA_LIGHT = "#44295f";
const ABD_A = "#3f2656";
const ABD_B = "#6a3a86";
const ABD_C = "#1f1229";
const RED = "#e0412e";
const AMBER = "#f5b43a";
const ANKLE = "#e07a24";
const LEG = "#2b1b38";
const LEG_LIGHT = "#4a3064";
const KNEE = "#e8912c";
const HAIR = "#120a18";
const EYE = "#ff5a36";
const EYE_RIM = "#0b0610";
const FANG = "#5a3a2a";
const FANG_TIP = "#e6d6a2";
const VENOM = "#a6ff4d";
const CLAW = "#d9c89a";
const EGG = "#e9ddb6";
const EGG_SHADE = "#b9a46f";
const EGG_SPECK = "#5e4426";
const SPIDERLING = "#3a2a4a";
const PALE = "#e8d9a8";
const SILK = "#f5f0e2";
const SPINNERET = "#6e5383";

// Leg joints for the left side (+X): hip on the thorax, knee, ankle, foot on the floor.
const LEG_PLAN: Array<{ id: string; pts: V[] }> = [
  {
    id: "1",
    pts: [
      [0.22, 1.12, 0.62],
      [0.82, 1.98, 0.95],
      [1.42, 1.05, 1.45],
      [1.92, 0.04, 1.42],
    ],
  },
  {
    id: "2",
    pts: [
      [0.26, 1.12, 0.4],
      [1.02, 2.06, 0.46],
      [1.75, 1.0, 0.42],
      [2.22, 0.04, 0.62],
    ],
  },
  {
    id: "3",
    pts: [
      [0.25, 1.1, 0.16],
      [0.98, 1.88, 0.02],
      [1.64, 0.95, -0.22],
      [2.05, 0.04, -0.4],
    ],
  },
  {
    id: "4",
    pts: [
      [0.2, 1.04, -0.14],
      [0.8, 1.62, -0.52],
      [1.38, 0.9, -0.96],
      [1.66, 0.04, -1.26],
    ],
  },
];

// Eight eyes on the head front: position on the head surface and radius.
const EYES: Array<[V, number]> = [
  [[-0.075, 1.3, 1.0], 0.06],
  [[0.075, 1.3, 1.0], 0.06],
  [[-0.15, 1.33, 0.93], 0.05],
  [[0.15, 1.33, 0.93], 0.05],
  [[-0.055, 1.39, 0.95], 0.04],
  [[0.055, 1.39, 0.95], 0.04],
  [[-0.23, 1.27, 0.82], 0.035],
  [[0.23, 1.27, 0.82], 0.035],
];

// Egg sacs: the four hanging ones sit under the abdomen (centre height as given); the floor ones rest on y = 0.
// `lings` spiderlings hatch out on the sac's upper side.
const SACS: Array<{ at: V; r: V; floor: boolean; lings: number }> = [
  { at: [0.0, 0.46, -1.25], r: [0.24, 0.28, 0.24], floor: false, lings: 0 },
  { at: [-0.3, 0.5, -1.0], r: [0.18, 0.2, 0.18], floor: false, lings: 0 },
  { at: [0.3, 0.5, -1.05], r: [0.19, 0.21, 0.19], floor: false, lings: 0 },
  { at: [0.0, 0.42, -1.72], r: [0.16, 0.18, 0.16], floor: false, lings: 0 },
  { at: [0.8, 0, -1.65], r: [0.26, 0.24, 0.26], floor: true, lings: 5 },
  { at: [-0.7, 0, -1.8], r: [0.22, 0.2, 0.22], floor: true, lings: 0 },
  { at: [0.2, 0, -2.2], r: [0.24, 0.22, 0.24], floor: true, lings: 0 },
  { at: [-0.25, 0, -2.4], r: [0.2, 0.18, 0.2], floor: true, lings: 0 },
];

export default function build() {
  const b = createBuilder({ name: "broodmotherSpider" });

  const tether = (a: V, c: V, sag: number) =>
    b.sweep(catmull([a, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - sag, (a[2] + c[2]) / 2], c]), 0.008, {
      sides: 4,
      smooth: false,
      color: SILK,
    });

  // Skeleton: hips (abdomen), chest (thorax), head, and a jaw per chelicera.
  const hips = b.joint("hips", { at: [0, 1.12, -0.5], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.16, 0.4], role: "spine" });
  const head = b.joint("head", { parent: chest, at: [0, 1.2, 0.9], dir: [0, -0.2, 1], role: "head" });

  // Body: faceted lofts, colour bands along each.
  const abdomen = b.loft(
    [
      { at: [0, 1.16, -0.02], w: 0.4, h: 0.34 },
      { at: [0, 1.22, -0.34], w: 0.96, h: 1.0 },
      { at: [0, 1.22, -0.8], w: 1.08, h: 1.06 },
      { at: [0, 1.1, -1.2], w: 0.72, h: 0.74 },
      { at: [0, 1.0, -1.5], w: 0.26, h: 0.28 },
    ],
    { bone: hips, sides: 8, smooth: false, bands: [[0.3, ABD_A], [0.62, ABD_B], [1, ABD_C]] },
  );
  const thorax = b.loft(
    [
      { at: [0, 1.14, -0.1], w: 0.34, h: 0.3 },
      { at: [0, 1.16, 0.12], w: 0.5, h: 0.38 },
      { at: [0, 1.24, 0.3], w: 0.7, h: 0.5 },
      { at: [0, 1.26, 0.52], w: 0.74, h: 0.52 },
      { at: [0, 1.22, 0.72], w: 0.6, h: 0.42 },
    ],
    { bone: chest, sides: 8, smooth: false, bands: [[0.35, PROSOMA], [0.75, PROSOMA_LIGHT], [1, PROSOMA]] },
  );
  const headMesh = b.loft(
    [
      { at: [0, 1.2, 0.7], w: 0.5, h: 0.38 },
      { at: [0, 1.27, 0.86], w: 0.46, h: 0.38 },
      { at: [0, 1.24, 0.97], w: 0.32, h: 0.3 },
      { at: [0, 1.2, 1.05], w: 0.14, h: 0.18 },
    ],
    { bone: head, sides: 8, smooth: false, bands: [[0.55, PROSOMA_LIGHT], [1, CHITIN]] },
  );

  // Eyes: a dark rim and a glowing red lens on the head front.
  const headSkin = b.surface(headMesh);
  for (const [p, r] of EYES) {
    const hit = headSkin.nearest(p);
    b.stick(new THREE.SphereGeometry(r * 1.3, 6, 4), EYE_RIM, hit, { embed: 0.45, flat: true, bone: head });
    glow(
      b.stick(new THREE.SphereGeometry(r * 0.8, 5, 3), EYE, hit.moved([0, r * 0.5, 0]), {
        embed: 0.1,
        flat: true,
        bone: head,
      }),
      1.4,
    );
  }

  // Abdomen markings: dorsal amber spikes, a red dotted hourglass, amber side studs, spinnerets, hairs,
  // and spiderlings crawling on her back.
  const abdSkin = b.surface(abdomen);
  [-0.12, -0.36, -0.6, -0.84, -1.06].forEach((z, i) => {
    const hit = abdSkin.nearest([0, 1.95, z]);
    b.stick(new THREE.ConeGeometry(0.05 - i * 0.007, 0.16 - i * 0.02, 5), AMBER, hit, {
      embed: 0.25,
      flat: true,
      bone: hips,
    });
  });
  const HOURGLASS: Array<[number, number]> = [
    [-0.22, -0.26],
    [0.22, -0.26],
    [-0.1, -0.4],
    [0.1, -0.4],
    [0, -0.5],
    [-0.1, -0.62],
    [0.1, -0.62],
    [-0.26, -0.76],
    [0.26, -0.76],
  ];
  for (const [x, z] of HOURGLASS) {
    const hit = abdSkin.nearest([x, 1.95, z]);
    b.stick(new THREE.SphereGeometry(0.065, 5, 3), RED, hit, { embed: 0.3, flat: true, bone: hips });
  }
  for (const s of [1, -1])
    for (const z of [-0.3, -0.6, -0.9]) {
      const hit = abdSkin.nearest([s * 1.3, 1.2, z]);
      b.stick(new THREE.SphereGeometry(0.055, 5, 3), AMBER, hit, { embed: 0.3, flat: true, bone: hips });
    }
  for (const [x, z] of [
    [-0.25, -0.5],
    [0.12, -0.7],
    [0.3, -0.45],
    [-0.12, -0.95],
    [0.05, -0.3],
  ]) {
    const hit = abdSkin.nearest([x, 1.95, z]);
    b.stick(new THREE.SphereGeometry(0.045, 5, 3), SPIDERLING, hit, { embed: 0.2, flat: true, bone: hips });
  }
  for (const [x, z] of [
    [-0.3, -0.5],
    [0.3, -0.5],
    [-0.25, -0.75],
    [0.25, -0.75],
  ]) {
    const hit = abdSkin.nearest([x, 0.3, z]);
    b.stick(new THREE.SphereGeometry(0.05, 5, 3), PALE, hit, { embed: 0.3, flat: true, bone: hips });
  }
  for (const x of [-0.05, 0, 0.05]) {
    const hit = abdSkin.nearest([x, 0.95, -1.8]);
    b.stick(new THREE.CylinderGeometry(0.03, 0.038, 0.12, 5), SPINNERET, hit, { embed: 0.3, flat: true, bone: hips });
  }
  for (const hit of abdSkin.scatter(44, { rng: rng(3), minDist: 0.1, filter: (h) => h.n.y > -0.2 }))
    b.stick(new THREE.ConeGeometry(0.014, 0.07, 4), HAIR, hit, { embed: 0.3, flat: true, bone: hips });

  // Thorax: an amber chevron and a fur of short hairs.
  const thoraxSkin = b.surface(thorax);
  const CHEVRON: Array<[number, number]> = [
    [0.66, 0.05],
    [0.46, 0.055],
    [0.26, 0.05],
  ];
  for (const [z, r] of CHEVRON) {
    const hit = thoraxSkin.nearest([0, 1.95, z]);
    b.stick(new THREE.ConeGeometry(r, 0.12, 5), AMBER, hit, { embed: 0.25, flat: true, bone: chest });
  }
  for (const hit of thoraxSkin.scatter(30, { rng: rng(5), minDist: 0.09, filter: (h) => h.n.y > -0.3 }))
    b.stick(new THREE.ConeGeometry(0.014, 0.07, 4), HAIR, hit, { embed: 0.3, flat: true, bone: chest });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Chelicera: a jaw joint and a curved fang with a venom drop.
    const jaw = b.joint(`jaw${side}`, {
      parent: head,
      at: [s * 0.07, 1.04, 1.02],
      dir: [s * 0.12, -0.6, 0.5],
      role: "jaw",
    });
    const fang = polyline([
      [s * 0.07, 1.04, 1.02],
      [s * 0.1, 0.94, 1.1],
      [s * 0.12, 0.835, 1.14],
    ]);
    b.sweep(fang, [0.05, 0.03, 0.006], {
      bone: jaw,
      sides: 5,
      smooth: false,
      bands: [
        [0.6, FANG],
        [1, FANG_TIP],
      ],
      caps: { start: "round", end: "point" },
    });
    glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), VENOM, { bone: jaw, at: [s * 0.12, 0.82, 1.14], flat: true }));

    // Pedipalp: a short two-bend feeler with a knob.
    const palp = polyline([
      [s * 0.11, 1.1, 0.95],
      [s * 0.27, 0.86, 1.2],
      [s * 0.3, 0.74, 1.42],
    ]);
    b.sweep(palp, [0.04, 0.03, 0.022], { bone: head, sides: 5, smooth: false, color: PROSOMA_LIGHT });
    b.part(new THREE.IcosahedronGeometry(0.045, 0), ANKLE, { bone: head, at: [s * 0.3, 0.74, 1.42], flat: true });

    // Legs: a four-knot chain per leg, banded at the knee and ankle, hairy, with claws.
    for (const leg of LEG_PLAN) {
      const pts = leg.pts.map(([x, y, z]): V => [s * x, y, z]);
      const id = `${side}${leg.id}`;
      const chain = b.chain(`leg${id}`, polyline(pts), {
        parent: chest,
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        role: "leg",
      });
      const [, kneeT, ankleT] = chain.ts;
      b.sweep(chain, [0.075, 0.055, 0.042, 0.02], {
        sides: 6,
        smooth: false,
        bands: [
          [kneeT - 0.03, LEG],
          [kneeT + 0.03, KNEE],
          [ankleT - 0.03, LEG_LIGHT],
          [ankleT + 0.03, ANKLE],
          [1, LEG],
        ],
      });
      b.part(new THREE.SphereGeometry(0.1, 6, 4), CHITIN, {
        bone: chain.joints[0],
        at: pts[0],
        scale: [1, 0.85, 1.2],
        flat: true,
      });
      [0.14, 0.32, 0.5, 0.7, 0.9].forEach((t, i) => {
        const cp = chain.at(t);
        b.spike(cp, i % 2 ? cp.binormal : cp.normal, 0.1, 0.011, { color: HAIR, sides: 4 });
      });
      const tip = chain.tip;
      if (tip) {
        b.spike(tip, [s * 0.55, -0.2, 0.35], 0.07, 0.011, { color: CLAW, sides: 4 });
        b.spike(tip, [s * 0.55, -0.2, -0.35], 0.07, 0.011, { color: CLAW, sides: 4 });
      }
    }
  }

  // Egg sacs: faceted icosahedron cocoons with a silk band, speckled with eggs, and spiderlings on the floor sac.
  SACS.forEach((sac, i) => {
    const c: V = [sac.at[0], sac.floor ? 0.85 * sac.r[1] : sac.at[1], sac.at[2]];
    const egg = b.part(new THREE.IcosahedronGeometry(1, 0), EGG, { bone: hips, at: c, scale: sac.r, flat: true });
    b.part(new THREE.TorusGeometry(sac.r[0] * 1.03, 0.016, 4, 10), EGG_SHADE, {
      bone: hips,
      at: c,
      rotation: [90, 0, 0],
      flat: true,
    });
    const eggSkin = b.surface(egg);
    for (const hit of eggSkin.scatter(16, { rng: rng(40 + i), minDist: 0.07, filter: (h) => h.n.y > -0.6 }))
      b.stick(new THREE.SphereGeometry(0.034, 4, 3), EGG_SPECK, hit, { embed: 0.4, flat: true, bone: hips });
    for (const hit of eggSkin.scatter(sac.lings, { rng: rng(90 + i), minDist: 0.1, filter: (h) => h.n.y > 0.6 }))
      b.stick(new THREE.SphereGeometry(0.045, 5, 3), SPIDERLING, hit, { embed: 0.2, flat: true, bone: hips });
  });

  // Silk: from the spinnerets and the abdomen to the hanging sacs, sacs to the floor sacs, and a leg tether.
  tether([0, 0.95, -1.8], [0, 0.57, -1.72], 0.03);
  tether([-0.1, 0.72, -0.98], [-0.3, 0.67, -1.0], 0.03);
  tether([0.1, 0.72, -1.0], [0.3, 0.7, -1.05], 0.03);
  tether([0.2, 0.36, -1.3], [0.8, 0.41, -1.65], 0.08);
  tether([-0.35, 0.4, -1.1], [-0.7, 0.34, -1.8], 0.08);
  tether([0.8, 0.05, -1.65], [0.2, 0.05, -2.2], 0.02);
  tether([-0.7, 0.05, -1.8], [-0.25, 0.05, -2.4], 0.02);
  tether([1.38, 0.9, -0.96], [0.8, 0.41, -1.65], 0.1);
  tether([-1.38, 0.9, -0.96], [-0.7, 0.34, -1.8], 0.1);

  return b.root;
}
