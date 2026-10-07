import * as THREE from "three";
import { catmull, createBuilder, mottle, rng, spots, grain, svg } from "../../../../src/index";

export const meta = {
  name: "Forest spirit",
  description: "A stout moss-and-bark forest spirit with a branching antler crown, root tail, leaf cards and glowing eyes.",
};

const leafMarkup = (fill: string, vein: string) =>
  `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">` +
  `<path d="M50 4 C92 40 96 110 50 156 C4 110 8 40 50 4 Z" fill="${fill}"/>` +
  `<path d="M50 14 L50 150 M50 60 L72 44 M50 60 L28 44 M50 100 L74 84 M50 100 L26 84" stroke="${vein}" stroke-width="5" stroke-linecap="round" fill="none"/>` +
  `</svg>`;

const runeMarkup =
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">` +
  `<path d="M50 50 m-4 0 a4 4 0 1 1 8 0 a12 12 0 1 1 -24 0 a20 20 0 1 1 40 0" fill="none" stroke="#c4ff8a" stroke-width="4" stroke-linecap="round"/>` +
  `</svg>`;

export default function build() {
  const b = createBuilder({ name: "forest-spirit", paintSize: 1024 });

  // Paints: every colour is a function of place, so patterns run across parts at one scale.
  const bark = mottle("#5b4329", "#7d5f3a", { size: 0.16, seed: 3 });
  const moss = mottle("#3e6a2b", "#78a546", { size: 0.12, seed: 8 });
  const body = mottle(bark, moss, { size: 0.24, seed: 5, contrast: 1.1 });
  const face = mottle(moss, "#b7c97a", { size: 0.09, seed: 11 });
  const antler = grain("#e2d6b4", "#a08c63", { size: 0.025, seed: 2 });
  const toadstool = spots("#b8382a", "#f4ecd2", { size: 0.035, amount: 0.45, seed: 4 });
  const glow = "#b6ffe0";

  const leafA = svg(leafMarkup("#8fd16a", "#2f5a25"), { size: 128 });
  const leafB = svg(leafMarkup("#5fae52", "#244d22"), { size: 128 });
  const rune = svg(runeMarkup, { size: 256 });

  // Skeleton: pelvis root, spine, neck and head, tail, then limbs mirrored about x = 0.
  const pelvis = b.joint("pelvis", { at: [0, 0.98, 0], dir: [0, 1, 0], role: "spine" });

  const spine = b.chain("spine", catmull([[0, 0.98, 0], [0, 1.2, 0.01], [0, 1.44, 0.02]]), {
    names: ["spine1", "spine2", "chest"],
    parent: pelvis,
    role: "spine",
  });

  const neck = b.chain("neck", catmull([[0, 1.44, 0.02], [0, 1.58, 0.05], [0, 1.7, 0.08]]), {
    names: ["neck1", "neck2", "head"],
    parent: "chest",
    role: "neck",
  });
  const head = neck.tip!;

  const tail = b.chain(
    "tail",
    [[0, 0.98, -0.02], [0, 0.92, -0.22], [0, 0.8, -0.42], [0, 0.7, -0.56]],
    { names: ["tail1", "tail2", "tail3", "tailTip"], parent: "pelvis", role: "tail" },
  );

  // Torso: one smooth body that bends with the spine.
  const torso = b.loft(
    [
      { at: [0, 0.98, 0], w: 0.26, h: 0.22 },
      { at: [0, 1.14, 0], w: 0.27, h: 0.24 },
      { at: [0, 1.3, 0.01], w: 0.34, h: 0.27 },
      { at: [0, 1.44, 0.02], w: 0.26, h: 0.2 },
      { at: [0, 1.55, 0.03], w: 0.13, h: 0.13 },
    ],
    { color: body, bone: spine, name: "torso" },
  );

  b.sweep(tail, { radius: [0.06, 0.045, 0.03, 0.012], color: bark, name: "tail" });
  b.sweep(neck, { radius: [0.08, 0.065, 0.06], color: bark, name: "neck" });

  // Head: a tall stylised skull with a pale mossy face.
  const skull = b.part(new THREE.SphereGeometry(0.13, 16, 12), face, {
    at: [0, 1.8, 0.06],
    bone: head,
    scale: [0.92, 1.08, 1.0],
    name: "skull",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), glow, {
      at: [0.055 * s, 1.81, 0.175],
      bone: head,
      name: s > 0 ? "eyeL" : "eyeR",
    });
  }

  // Antlers: branching twigs sprouted from the skull, mirrored, each with a tine.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mirror = (pts: number[][]) => pts.map(([x, y, z]) => [x * s, y, z]);
    const main = b.sprout(
      `antler${side}`,
      head,
      mirror([[0.05, 1.9, 0.0], [0.13, 2.04, -0.02], [0.2, 2.2, -0.05], [0.27, 2.3, -0.08]]),
      [0.03, 0.01],
      { color: antler },
    );
    b.sprout(
      `tine${side}`,
      main.chain!.joints[2],
      mirror([[0.13, 2.04, -0.02], [0.2, 2.1, -0.1], [0.22, 2.17, -0.16]]),
      [0.012, 0.004],
      { color: antler },
    );
  }

  // Arms and legs: each is a chain carrying a bark sweep, extremities added on their joint.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const arm = b.chain(
      `arm${side}`,
      [[0.15 * s, 1.4, 0], [0.34 * s, 1.2, 0.03], [0.44 * s, 1.0, 0.08]],
      { names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], parent: "chest", role: "arm" },
    );
    b.sweep(arm, { radius: [0.05, 0.04, 0.028], color: bark, name: `arm${side}` });
    const wrist = arm.tip!;
    const fingers: Array<[number, number, number]> = [
      [0.35 * s, -0.8, 0.2],
      [0.1 * s, -0.9, 0.3],
      [-0.12 * s, -0.9, 0.1],
    ];
    for (const dir of fingers) b.spike(wrist, dir, 0.12, 0.014, { color: bark, bone: wrist });

    const leg = b.chain(
      `leg${side}`,
      [[0.12 * s, 0.98, 0], [0.13 * s, 0.5, 0.04], [0.12 * s, 0.07, 0]],
      { names: [`hip${side}`, `knee${side}`, `ankle${side}`], parent: "pelvis", role: "leg" },
    );
    b.sweep(leg, { radius: [0.08, 0.05, 0.035], color: bark, name: `leg${side}` });
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.22), moss, {
      at: [0.12 * s, 0.035, 0.07],
      bone: leg.tip!,
      name: `foot${side}`,
    });
  }

  // Leaves on the shoulders and skull.
  const shoulderHits = b.surface(torso).scatter(30, {
    rng: rng(5),
    filter: (h) => h.at.y > 1.15 && h.n.y > -0.3,
  });
  b.cards(shoulderHits, [leafA, leafB], {
    size: 0.16,
    vary: 0.3,
    lean: 40,
    flow: [0, 1, 0],
    spin: 180,
    rng: rng(9),
    name: "leaves",
  });

  const crownHits = b.surface(skull).scatter(14, {
    rng: rng(21),
    filter: (h) => h.n.y > 0.2,
  });
  b.cards(crownHits, [leafA, leafB], {
    size: 0.13,
    vary: 0.25,
    lean: 55,
    flow: [0, 1, 0],
    rng: rng(22),
    name: "crown",
  });

  // Toadstools growing on the torso.
  const shrooms = b.surface(torso).scatter(6, {
    rng: rng(33),
    minDist: 0.12,
    filter: (h) => h.n.z > 0.3 && h.at.y < 1.3,
  });
  for (const hit of shrooms) {
    b.stick(new THREE.CylinderGeometry(0.012, 0.016, 0.05, 6), "#ebe0c4", hit, { embed: 0.1 });
    b.stick(new THREE.SphereGeometry(0.045, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), toadstool, hit, {
      embed: 0.2,
    });
  }

  // A glowing rune drawn on the chest.
  b.decal(torso, rune, { at: [0, 1.25, 0.4], dir: [0, 0, 1], size: [0.16, 0.16] });

  return b.root;
}
