```ts
import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, polyline, rng, scales, svg } from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "qilin",
  description:
    "A scaled hooved chimera: a golden-scaled qilin with a dragon-fine head, branching antlers, a cloud mane and a cloud tail, standing on jade-dark hooves.",
};

// Scale constant for the head: every head position and size is derived from it.
const H = 1.0;

// Cloud drawing for the mane and tail tufts: blue-grey outlines under white puffs.
const CLOUD_SVG = `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
  <g fill="#6f97d0">
    <circle cx="26" cy="50" r="22"/><circle cx="52" cy="36" r="27"/>
    <circle cx="76" cy="52" r="20"/><circle cx="46" cy="60" r="19"/>
  </g>
  <g fill="#ffffff">
    <circle cx="26" cy="48" r="19"/><circle cx="52" cy="34" r="24"/>
    <circle cx="76" cy="50" r="17"/><circle cx="46" cy="58" r="16"/>
  </g>
  <g fill="#dfeafc"><circle cx="44" cy="62" r="9"/><circle cx="20" cy="56" r="6"/></g>
</svg>`;

// Outline of a pointed, leaf-like ear drawn in its own plane (x = along the head, y = up).
const EAR: [number, number][] = [
  [0, 0],
  [0.07, 0.05],
  [0.035, 0.17],
  [-0.05, 0.04],
];

export default function build() {
  const b = createBuilder({ name: "qilin" });

  // Paints: golden scaled coat with a cream belly, dark jade legs, ivory antlers, dark hooves.
  const COAT = scales(["#f2b44e", "#e89c3c", "#f7c766"], "#8a4f1c", { size: 0.06, width: 0.2 });
  const BODY = cel(countershade(COAT, "#fff0cf", { level: -0.3, soft: 0.25 }));
  const LEG = cel(scales(["#2f7d66", "#3a8f74"], "#173d33", { size: 0.045, width: 0.2 }));
  const HOOF = cel("#2a2030");
  const ANTLER = cel("#efe2bd", "#c9b28a");
  const CLOUD = svg(CLOUD_SVG, { size: 192 });
  const EYE = animeEye({ iris: "#2fd3c0", ink: "#1b1030" });

  // ---- Skeleton ------------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 1.3, -0.6], role: "spine" });

  const spinePath = catmull([
    [0, 1.3, -0.6],
    [0, 1.38, -0.1],
    [0, 1.42, 0.35],
    [0, 1.5, 0.6],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 1.5, 0.6],
    [0, 1.72, 0.8],
    [0, 1.95, 0.98],
    [0, 2.06, 1.12],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 2.06, 1.12],
    dir: [0, 0.25, 1],
    role: "head",
  });
  const hp = (forward: number, up: number, left = 0) => head.local({ forward, up, left });

  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0.02, -0.06),
    dir: [0, -0.3, 1],
    role: "jaw",
  });

  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 1.28, -0.7],
      [0, 1.2, -1.1],
      [0, 1.12, -1.45],
      [0, 1.02, -1.72],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---- Body, neck, tail ----------------------------------------------------------------------

  const bodySweep = b.sweep(
    catmull([
      [0, 1.28, -1.02],
      [0, 1.34, -0.6],
      [0, 1.42, -0.1],
      [0, 1.5, 0.5],
    ]),
    (t: number) => 0.14 + 0.13 * Math.sin(Math.PI * (0.15 + 0.8 * t)),
    { bone: [hips, spine], color: BODY },
  );

  const neckSweep = b.sweep(neckChainRef(neck), (t: number) => 0.1 - 0.035 * t, { color: BODY });

  b.sweep(tailChain, (t: number) => 0.075 * (1 - t) + 0.025, { color: LEG });

  // ---- Legs: hip, knee, hock or ankle, hoof ----------------------------------------------------

  for (const s of [1, -1]) {
    const sfx = s > 0 ? "L" : "R";
    const x = s * 0.15;
    // Forelegs hang from the chest, hind legs from the hips with the hock bent back.
    const front = [
      [x, 1.36, 0.46],
      [x, 0.7, 0.5],
      [x, 0.16, 0.44],
      [x, 0.04, 0.5],
    ] as [number, number, number][];
    const hind = [
      [s * 0.14, 1.3, -0.5],
      [s * 0.14, 0.74, -0.42],
      [s * 0.14, 0.2, -0.6],
      [s * 0.14, 0.04, -0.56],
    ] as [number, number, number][];

    const legs: [string, [number, number, number][], Parameters<typeof b.chain>[2]][] = [
      ["F", front, { parent: spine.joints[2] }],
      ["H", hind, { parent: hips }],
    ];
    for (const [tag, pts, opts] of legs) {
      const name = `${tag}${sfx}`;
      const chain = b.chain(`leg${name}`, polyline(pts), {
        ...opts,
        names: [`hip${name}`, `knee${name}`, `ankle${name}`, `hoof${name}`],
        role: "leg",
      });
      b.sweep(chain, (t: number) => 0.085 - 0.04 * t, { color: LEG });
      const tip = chain.tip ?? chain.joints[chain.joints.length - 1];
      const foot = pts[3];
      b.part(new THREE.CylinderGeometry(0.055, 0.062, 0.07, 8), HOOF, {
        bone: tip,
        at: [foot[0], 0.035, foot[2]],
      });
      // A gold band above the hoof on each leg.
      b.sweep(
        polyline([
          [foot[0] - 0.06, 0.12, foot[2]],
          [foot[0] + 0.06, 0.12, foot[2]],
        ]),
        0.046,
        { bone: tip, color: "#e7b547", caps: "flat" },
      );
    }
  }

  // ---- Head ----------------------------------------------------------------------------------

  const skull = b.part(new THREE.SphereGeometry(0.15 * H, 16, 12), BODY, {
    bone: head,
    at: hp(0.02, 0.03),
    scale: [0.95, 0.92, 1.2],
  });

  // Upper muzzle on the head, lower jaw on its own joint so it can open.
  b.sweep(bezier(hp(0.0, 0.0), hp(0.1, -0.01), hp(0.2, 0.0)), [0.085, 0.07], {
    bone: head,
    color: BODY,
  });
  b.sweep(bezier(hp(0.0, -0.07), hp(0.1, -0.08), hp(0.17, -0.08)), [0.05, 0.035], {
    bone: jaw,
    color: BODY,
    caps: "round",
  });
  // A dark mouth line and a pair of nostrils on the muzzle.
  b.sweep(bezier(hp(0.02, -0.03, 0.05), hp(0.1, -0.035, 0.05), hp(0.18, -0.02, 0.04)), 0.008, {
    bone: head,
    color: INK_COLOR,
    caps: "round",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), INK_COLOR, {
      bone: head,
      at: hp(0.19, 0.03, s * 0.03),
    });
  }

  // Ears: leaf-shaped, set back and up from the temples.
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: hp(-0.06, 0.1, s * 0.1),
      x: [0, 0, 1],
      thickness: 0.025,
      bevel: 0.006,
      color: BODY,
      bone: head,
    });
  }

  // Antlers: each a sweeping beam with a branch, ivory with a gold tip.
  for (const s of [1, -1]) {
    const beam = bezier(hp(0.0, 0.1, s * 0.075), hp(-0.03, 0.25, s * 0.12), hp(-0.12, 0.36, s * 0.22), hp(-0.2, 0.5, s * 0.25));
    b.sweep(beam, [0.03, 0.008], { bone: head, color: ANTLER, caps: { end: "point" } });
    b.sweep(bezier(hp(-0.07, 0.3, s * 0.17), hp(-0.05, 0.36, s * 0.26), hp(-0.04, 0.4, s * 0.34)), [0.018, 0.006], {
      bone: head,
      color: ANTLER,
      caps: { end: "point" },
    });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), "#e7b547", {
      bone: head,
      at: hp(-0.2, 0.5, s * 0.25),
    });
  }

  // Eyes: big anime drawings conformed onto the skull.
  const skin = b.surface(skull);
  const headCentre = hp(0.02, 0.03);
  for (const s of [1, -1]) {
    const hit = skin.around(headCentre).at(s * 40, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.06, 0.08], mirror: s > 0 });
  }

  // A glowing jade gem on the forehead.
  const brow = skin.around(headCentre).at(0, 58);
  if (brow) glow(b.stick(new THREE.OctahedronGeometry(0.032, 0), "#7dffd8", brow), 1.5);

  // ---- Cloud mane and tail -------------------------------------------------------------------

  const mane = b.surface(neckSweep).scatter(34, {
    rng: rng(11),
    minDist: 0.075,
    filter: (h) => h.n.y > -0.1,
  });
  b.cards(mane, CLOUD, {
    size: [0.14, 0.17],
    lean: 35,
    flow: [0, 0.6, -1],
    vary: 0.25,
    rng: rng(12),
    bend: 15,
    color: "#ffffff",
  });

  const backTufts = b.surface(bodySweep).scatter(18, {
    rng: rng(21),
    minDist: 0.11,
    filter: (h) => h.n.y > 0.55,
  });
  b.cards(backTufts, CLOUD, {
    size: [0.13, 0.15],
    lean: 30,
    flow: [0, 0.3, -1],
    vary: 0.2,
    rng: rng(22),
    color: "#ffffff",
  });

  const tufts = b.along(tailChain, 6, () => {}, { from: 0.4, to: 1 });
  b.cards(tufts, CLOUD, {
    size: [0.16, 0.2],
    lean: 25,
    flow: [0, 0.2, -1],
    vary: 0.25,
    rng: rng(31),
    bend: 10,
    color: "#ffffff",
  });

  return b.root;
}

// The neck's chain is passed straight to `sweep`; this keeps the call site readable.
function neckChainRef<T>(chain: T): T {
  return chain;
}

const INK_COLOR = "#22112f";
```