import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { DEG } from "../src/math";
import { bezier, catmull, spiral } from "../src/path";
import { limb } from "../src/ik";
import { countershade, paint, scales } from "../src/paint";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import { frame } from "../src/frame";
import { svg } from "../src/texture";

export const meta = {
  name: "Qilin",
  description:
    "A scaled, hooved qilin: gold-amber scales over a cream belly, a branching antler crown, a cloud mane and tail tuft, a gold harness and a teal jewel on the brow.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

// Palette. The coat is gold-amber scales over a cream belly; antlers are ivory with gold tips; the mane is cloud white.
const COAT_HI = "#f7b340";
const COAT_EDGE = "#d4651f";
const BELLY = "#fff2cc";
const GOLD = "#ffd467";
const GOLD_SHADE = "#c98b2b";
const IVORY = "#fff7e4";
const IVORY_SHADE = "#dcbc86";
const CLOUD_LIT = "#f4fbff";
const CLOUD_SHADE = "#9ec2ea";
const SOCK = "#4b3275";
const JEWEL = "#7ff3ff";
const IRIS = "#ffb03a";

const coatBase = countershade(scales(COAT_HI, COAT_EDGE, { size: 0.05, width: 0.22, seed: 7 }), BELLY, {
  level: -0.3,
  soft: 0.2,
});
const COAT = cel(coatBase);
const HEAD = cel(
  furEdge(BELLY, coatBase, { axis: [0, 0, 1], by: "position", level: 1.27, teeth: 0.02, period: 0.03, along: [0, 1, 0] }),
);
const JAW = cel(BELLY, "#e3bf8c");
const SOCKS = cel(SOCK, "#2b1b4d");
const GOLD_C = cel(GOLD, GOLD_SHADE);
const IVORY_C = cel(IVORY, IVORY_SHADE);
const ANTLER = paint((_p, _n, s) => (s[0] > 0.8 ? GOLD_C : IVORY_C));
const CLOUD = cel(CLOUD_LIT, CLOUD_SHADE);
const HOOF = cel("#4a2e3c", "#2c1a2a");
const EYE = animeEye({ iris: IRIS });
const LEG = paint((_p, _n, s) => (s[0] > 0.55 ? SOCKS : COAT));
const EAR = paint((_p, _n, s) => (s[1] > 0.2 ? GOLD_C : COAT));

// Cloud puff: a scalloped outline in metres (x forward, y up). Its bottom sinks into what it sits on.
const PUFF: [number, number][] = [
  [-0.17, -0.04],
  [-0.21, 0.05],
  [-0.17, 0.14],
  [-0.09, 0.17],
  [-0.07, 0.27],
  [0.02, 0.3],
  [0.07, 0.2],
  [0.16, 0.18],
  [0.22, 0.08],
  [0.18, -0.02],
  [0.0, -0.05],
];
const puff = (k: number): OutlinePoint[] => PUFF.map(([x, y]) => [x * k, y * k] as const);

const EAR_OUTLINE: OutlinePoint[] = [
  [-0.05, 0],
  [-0.065, 0.1],
  [-0.04, 0.22],
  [0, 0.3, "sharp"],
  [0.04, 0.21],
  [0.055, 0.09],
  [0.04, 0],
];

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });

  // Body centreline: rump, hips, barrel, chest, neck, poll. The body loft and every chain share this curve.
  const STATIONS = [
    { at: [0, 1.34, -0.98], w: 0.36, h: 0.44 },
    { at: [0, 1.33, -0.6], w: 0.56, h: 0.58 },
    { at: [0, 1.3, -0.12], w: 0.6, h: 0.62 },
    { at: [0, 1.32, 0.34], w: 0.54, h: 0.62 },
    { at: [0, 1.5, 0.6], w: 0.36, h: 0.4 },
    { at: [0, 1.7, 0.8], w: 0.26, h: 0.3 },
    { at: [0, 1.86, 0.93], w: 0.2, h: 0.24 },
  ];
  const SPINE = catmull(STATIONS.map((s) => s.at));
  const tHips = SPINE.closestT([0, 1.33, -0.6]);
  const tChest = SPINE.closestT([0, 1.32, 0.34]);

  // Skeleton: root hips, rump, spine, neck, head, jaw, tail, and four legs.
  const hips = b.joint("hips", { at: [0, 1.33, -0.6], role: "spine" });
  const rump = b.chain("rump", SPINE.slice(tHips, 0), { parent: hips, names: ["rump"] });
  const spine = b.chain("spine", SPINE.slice(tHips, tChest), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", SPINE.slice(tChest, 1), {
    parent: spine.joints[spine.joints.length - 1],
    names: ["neck1", "neck2", "neck3", "neck4"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.86, 0.93],
    aim: [0, 1.74, 1.36],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.0, up: -0.08 }),
    aim: head.local({ forward: 0.42, up: -0.12 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.3, -0.9],
      [0, 1.36, -1.22],
      [0, 1.48, -1.5],
      [0, 1.42, -1.76],
      [0, 1.22, -1.9],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  const legs = [1, -1].map((s) => {
    const L = s > 0 ? "L" : "R";
    const foreChain = b.chain(
      `foreLeg${L}`,
      limb([s * 0.17, 1.24, 0.42], [s * 0.17, 0.08, 0.46], [0.5, 0.44, 0.24], [
        [0, 0, -1],
        [0, 0, 1],
      ]),
      {
        parent: spine.joints[1],
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hoof${L}`],
        role: "leg",
      },
    );
    const hindChain = b.chain(
      `hindLeg${L}`,
      limb([s * 0.2, 1.3, -0.56], [s * 0.2, 0.08, -0.7], [0.52, 0.48, 0.26], [
        [0, 0, 1],
        [0, 0, -1],
      ]),
      {
        parent: hips,
        names: [`hip${L}`, `stifle${L}`, `hock${L}`, `hindHoof${L}`],
        role: "leg",
      },
    );
    return { s, foreChain, hindChain };
  });

  // Body: one loft through the stations, skinned over rump, hips, spine and neck.
  const bodyLoft = b.loft(STATIONS, { bone: [rump, hips, spine, neck], sides: 14, color: COAT });
  const bodySurf = b.surface(bodyLoft);

  // Gold dorsal spikes along the withers and back, each seated on the built skin.
  for (const t of [0.1, 0.25, 0.4, 0.55, 0.7, 0.85]) {
    const hit = bodySurf.nearest(spine.at(t).moved({ up: 0.4 }));
    b.stick(new THREE.ConeGeometry(0.03, 0.11, 6), GOLD_C, hit, { embed: 0.25 });
  }
  // Gold spiral tracery on each flank, over the hips and the barrel.
  for (const s of [1, -1]) {
    for (const [z, y] of [
      [-0.45, 1.38],
      [-0.05, 1.42],
    ] as const) {
      b.sweep(spiral([s * 0.3, y, z], [s * 0.3, y + 0.07, z], [1, 0, 0], { turns: 1.5, r1: 0.02 }), [0.007, 0.003], {
        color: GOLD_C,
        sides: 6,
      });
    }
  }

  // Tail: a thinning ox-like tube with a cloud tuft at the tip.
  const tailTube = b.sweep(tail, [0.07, 0.06, 0.046, 0.036, 0.03], { color: COAT, sides: 9 });

  // Legs: tapering tubes, socks below the knee, a hoof with a gold cap, and a gold bracelet at the wrist and hock.
  for (const { s, foreChain, hindChain } of legs) {
    const foreTube = b.sweep(foreChain, [0.12, 0.085, 0.07, 0.06], { color: LEG, sides: 9 });
    const hindTube = b.sweep(hindChain, [0.15, 0.1, 0.075, 0.06], { color: LEG, sides: 9 });
    const foreHoof = foreChain.joints[foreChain.joints.length - 1];
    const hindHoof = hindChain.joints[hindChain.joints.length - 1];
    b.lathe(
      [
        [0, 0],
        [0.072, 0],
        [0.084, 0.05],
        [0.076, 0.1],
        [0.058, 0.13],
        [0, 0.13],
      ],
      { at: [s * 0.17, 0, 0.46], bone: foreHoof, color: HOOF, segments: 8 },
    );
    b.lathe(
      [
        [0, 0.1],
        [0.08, 0.095],
        [0.088, 0.11],
        [0.07, 0.135],
        [0, 0.135],
      ],
      { at: [s * 0.17, 0, 0.46], bone: foreHoof, color: GOLD_C, segments: 8 },
    );
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.08, 0.05],
        [0.07, 0.1],
        [0, 0.1],
      ],
      { at: [s * 0.2, 0, -0.7], bone: hindHoof, color: HOOF, segments: 8 },
    );
    b.lathe(
      [
        [0, 0.1],
        [0.078, 0.095],
        [0.086, 0.11],
        [0.068, 0.13],
        [0, 0.13],
      ],
      { at: [s * 0.2, 0, -0.7], bone: hindHoof, color: GOLD_C, segments: 8 },
    );
    const wristBand = b.surface(foreTube).loop(foreChain.joints[2], { lift: 0.01 });
    b.sweep(wristBand, 0.012, { color: GOLD_C, sides: 8 });
    const hockBand = b.surface(hindTube).loop(hindChain.joints[2], { lift: 0.01 });
    b.sweep(hockBand, 0.012, { color: GOLD_C, sides: 8 });
  }

  // Head: a loft from the back of the skull to the nose, with a jaw loft on its own bone.
  const headLoft = b.loft(
    [
      { at: head.local({ forward: -0.12, up: 0.02 }), w: 0.22, h: 0.22 },
      { at: head.local({ forward: 0.02, up: 0.05 }), w: 0.27, h: 0.26 },
      { at: head.local({ forward: 0.2, up: 0.0 }), w: 0.21, h: 0.2 },
      { at: head.local({ forward: 0.33, up: -0.03 }), w: 0.145, h: 0.145 },
      { at: head.local({ forward: 0.44, up: -0.02 }), w: 0.1, h: 0.1 },
      { at: head.local({ forward: 0.5, up: -0.01 }), w: 0.066, h: 0.075 },
    ],
    { bone: head, sides: 12, color: HEAD },
  );
  const skin = b.surface(headLoft);

  b.loft(
    [
      { at: head.local({ forward: -0.08, up: -0.1 }), w: 0.12, h: 0.06 },
      { at: head.local({ forward: 0.18, up: -0.12 }), w: 0.1, h: 0.05 },
      { at: head.local({ forward: 0.36, up: -0.12 }), w: 0.06, h: 0.04 },
      { at: head.local({ forward: 0.46, up: -0.1 }), w: 0.03, h: 0.03 },
    ],
    { bone: jaw, sides: 10, color: JAW },
  );

  // Anime eyes, nostrils, and a gold circlet round the skull with a teal jewel on the brow.
  for (const s of [1, -1]) {
    const hit = skin.around(head.local({ forward: 0.1, up: 0.02 })).at(s * 28, 4)!;
    b.decal(skin, EYE, { at: hit, size: [0.11, 0.15], mirror: s > 0 });
    const nostril = skin.nearest(head.local({ forward: 0.5, up: 0.0, left: s * 0.022 }));
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), INK, nostril, { embed: 0.2 });
  }
  const circlet = skin.loop(head.local({ forward: 0.03, up: 0.12 }), { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(circlet, 0.011, { color: GOLD_C, sides: 8 });
  const brow = skin.nearest(head.local({ forward: 0.08, up: 0.14 }));
  b.stick(new THREE.CylinderGeometry(0.042, 0.05, 0.02, 8), GOLD_C, brow, { embed: 0.5 });
  glow(b.stick(new THREE.OctahedronGeometry(0.032, 0), JEWEL, brow, { embed: 0.25 }), 1.4);

  // Whiskers: long dragon-like feelers from the muzzle and chin, tipped in gold.
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        head.local({ forward: 0.4, up: 0.0, left: s * 0.04 }),
        head.local({ forward: 0.52, up: 0.05, left: s * 0.12 }),
        head.local({ forward: 0.5, up: 0.16, left: s * 0.22 }),
      ),
      [0.009, 0.002],
      { bone: head, color: GOLD_C, sides: 6 },
    );
    b.sweep(
      bezier(
        head.local({ forward: 0.3, up: -0.06, left: s * 0.05 }),
        head.local({ forward: 0.38, up: -0.14, left: s * 0.12 }),
        head.local({ forward: 0.2, up: -0.26, left: s * 0.2 }),
      ),
      [0.01, 0.002],
      { bone: head, color: GOLD_C, sides: 6 },
    );
  }

  // Antlers: a deer-like beam with a brow tine and a top tine on each side.
  for (const s of [1, -1]) {
    const P = (f: number, u: number, l: number) => head.local({ forward: f, up: u, left: s * l });
    const beam = bezier(P(0.0, 0.14, 0.07), P(0.04, 0.3, 0.12), P(-0.02, 0.42, 0.2), P(-0.1, 0.5, 0.25));
    b.sweep(beam, [0.028, 0.008], { bone: head, color: ANTLER, sides: 8, caps: { start: "round", end: "point" } });
    const browTine = bezier(beam.at(0.36), P(0.06, 0.34, 0.24), P(0.12, 0.42, 0.34));
    b.sweep(browTine, [0.016, 0.004], { bone: head, color: ANTLER, sides: 6, caps: { start: "round", end: "point" } });
    const topTine = bezier(beam.at(0.72), P(-0.12, 0.52, 0.26), P(-0.2, 0.58, 0.3));
    b.sweep(topTine, [0.016, 0.004], { bone: head, color: ANTLER, sides: 6, caps: { start: "round", end: "point" } });
  }

  // Ears: long leaf-shaped ears with gold tips, flaring back and out.
  for (const s of [1, -1]) {
    const base = head.moved({ forward: 0.0, up: 0.1, left: s * 0.11 });
    b.extrude(EAR_OUTLINE, {
      at: base,
      x: [0, 0, 1],
      y: [s * 0.5, 1, -0.2],
      thickness: 0.026,
      bevel: 0.008,
      smoothing: 1,
      color: EAR,
    });
  }

  // Harness: a gold collar at the chest and a dark girth with gold studs at the barrel.
  const collar = bodySurf.loop(neck.joints[0], { lift: 0.014 });
  b.sweep(collar, 0.014, { color: GOLD_C, sides: 8 });
  b.along(collar, 16, (at) => b.stick(new THREE.SphereGeometry(0.016, 6, 4), GOLD_C, at, { embed: 0.3 }));
  const girth = bodySurf.loop(spine.joints[1], { lift: 0.02 });
  b.sweep(girth, 0.02, { color: SOCKS, sides: 8 });
  b.along(girth, 12, (at) => b.stick(new THREE.SphereGeometry(0.014, 6, 4), GOLD_C, at, { embed: 0.4 }));
  // Gold tassel fringe hanging from the lower girth.
  const tassel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48"><path d="M3 3 H13 M5 5 L3 46 M8 5 L8 46 M11 5 L13 46" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const drops = [];
  for (let i = 0; i < 40; i++) {
    const p = girth.at(i / 40);
    if (p.y < 1.15) drops.push(frame(p, [0, 1, 0]));
  }
  b.cards(drops, tassel, { size: [0.07, 0.17], lean: 180, flow: [0, 0, 1], color: GOLD });

  // Cloud mane: two staggered rows of puffs flaring out from the crest, withers to poll. Each puff is a
  // pillowed slab (bevelled) with a gold curl on its outer face.
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const t = 0.05 + i * 0.12;
      const k = 1.22 - i * 0.05 + (i % 2) * 0.08;
      const f = neck.at(t).moved({ left: s * 0.07, up: 0.1 });
      b.extrude(puff(k), {
        at: f,
        x: [0, 0, 1],
        y: [s * 0.3, 1, -0.5],
        thickness: 0.09,
        bevel: 0.035,
        detail: 0.6,
        smoothing: 2,
        color: CLOUD,
      });
      b.sweep(
        spiral(f.local({ up: 0.12 * k, left: s * 0.06 }), f.local({ up: 0.18 * k, left: s * 0.06 }), [1, 0, 0], {
          turns: 1.6,
          r1: 0.02,
        }),
        [0.006, 0.003],
        { color: GOLD_C, sides: 6, detail: 0.6 },
      );
    }
  }

  // Tail tuft: five cloud puffs fanned from the tail tip.
  const tailTip = tail.at(1);
  for (const [deg, k] of [
    [-70, 0.9],
    [-35, 1.2],
    [0, 1.3],
    [35, 1.2],
    [70, 0.9],
  ] as const) {
    const a = deg * DEG;
    b.extrude(puff(k), {
      at: tailTip,
      x: [0, 0, 1],
      y: [Math.sin(a), Math.cos(a), 0],
      thickness: 0.09,
      bevel: 0.035,
      detail: 0.6,
      smoothing: 2,
      color: CLOUD,
    });
  }
  const tailRing = b.surface(tailTube).loop(tail.joints[3], { lift: 0.01 });
  b.sweep(tailRing, 0.012, { color: GOLD_C, sides: 8 });

  return b.root;
}
