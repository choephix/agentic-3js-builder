import * as THREE from "three";
import {
  createBuilder,
  frame,
  offset,
  rng,
  svg,
  mottle,
  countershade,
  limb,
  catmull,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "forest-spirit",
  description: "A small forest spirit, part deer and part mossy river stone, with a pale wooden mask and glowing green eyes.",
};

const STONE = "#7b8087";
const STONE_DARK = "#4f545b";
const MOSS = "#6aa650";
const MOSS_DARK = "#3f7a3a";
const WOOD = "#9c6b41";
const PALE = "#eadcc2";
const HOOF = "#2e2219";
const ANTLER = "#e6dcc4";
const FLOWER = "#fff8ec";
const EYE = "#86ff5e";
const FIREFLY = "#fff27a";

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  // Paint: moss on top, river stone underneath.
  const coat = countershade(
    mottle(MOSS, MOSS_DARK, { size: 0.09, contrast: 0.7 }),
    mottle(STONE, STONE_DARK, { size: 0.18 }),
    { level: -0.1 },
  );

  // Textures: a leaf and a little moss tuft, drawn as cards.
  const leaf = svg(
    '<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 Q32 22 16 47 Q0 22 16 1Z" fill="#79b65a"/><path d="M16 4 L16 44" stroke="#3f7a3a" stroke-width="2"/></svg>',
    { size: 128 },
  );
  const tuft = svg(
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4 32 Q8 12 14 4 Q14 18 16 32Z" fill="#6fb35a"/><path d="M14 32 Q16 10 26 6 Q20 20 20 32Z" fill="#4d8f3f"/></svg>',
    { size: 128 },
  );

  // Skeleton: hips, spine, chest.
  const hips = b.joint("hips", { at: [0, 1.0, -0.5] });
  const bodyPath = catmull([
    [0, 1.0, -0.5],
    [0, 1.03, -0.22],
    [0, 1.04, 0.08],
    [0, 1.0, 0.36],
  ]);
  const spine = b.chain("spine", bodyPath, { parent: hips, names: ["spine1", "spine2", "chest"] });
  const chest = spine.joints[spine.joints.length - 1];

  // Stone body: a faceted, slightly barrel-shaped tube along the spine.
  const body = b.sweep(
    spine,
    (t: number) => [0.19 + 0.025 * Math.sin(Math.PI * t), 0.17 + 0.02 * Math.sin(Math.PI * t)],
    { color: coat, section: { ngon: 8 } },
  );

  // Slender wooden legs with hooves, solved to plant on the floor.
  const leg = (
    side: string,
    sx: number,
    z: number,
    parent: typeof hips,
    bend: [number, number, number],
  ) => {
    const hip: [number, number, number] = [sx, 0.98, z];
    const foot: [number, number, number] = [sx, 0.035, z];
    const pts = limb(hip, foot, [0.5, 0.46], [bend]);
    const c = b.chain(`leg${side}`, pts, {
      parent,
      names: [`hip${side}`, `knee${side}`, `hoof${side}`],
    });
    b.sweep(c, (t: number) => 0.042 - 0.018 * t, { color: WOOD, section: { ngon: 6 } });
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.05, 7), HOOF, {
      bone: c.joints[c.joints.length - 1],
      at: [sx, 0.025, z],
    });
  };
  for (const sx of [0.14, -0.14]) {
    const tag = sx > 0 ? "L" : "R";
    leg(`HF${tag}`, sx, 0.3, chest, [0, 0, 1]);
    leg(`HH${tag}`, sx, -0.5, hips, [0, 0, -1]);
  }

  // Neck rising from the chest to the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.3],
      [0, 1.2, 0.48],
      [0, 1.38, 0.68],
    ]),
    { parent: chest, names: ["neck1", "neck2"] },
  );
  b.sweep(neck, [0.115, 0.095], { color: coat, section: { ngon: 8 } });

  // Head: a rounded stone skull, then a small pale wooden jaw under the mask.
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.42, 0.76],
  });
  b.sweep(
    [
      [0, 1.42, 0.76],
      [0, 1.44, 0.8],
    ],
    [0.14, 0.13],
    { bone: head, color: coat, section: { ngon: 8 } },
  );
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.06, up: -0.15 }) });
  b.capsule(jaw, jaw.local({ forward: 0.1, up: -0.01 }), 0.024, { color: PALE });

  // Antlers: find the skull hits first, then grow each antler from its hit.
  const surf = b.surface(head);
  const hits = [1, -1].map((s) => surf.around(head.at).at(s * 50, 62));
  [1, -1].forEach((s, i) => {
    const hit = hits[i];
    if (!hit) return;
    const tag = s > 0 ? "L" : "R";
    const antler = b.sweep(
      catmull([
        hit,
        [s * 0.13, 1.66, 0.74],
        [s * 0.24, 1.88, 0.7],
        [s * 0.3, 2.0, 0.64],
      ]),
      [0.03, 0.008],
      { color: ANTLER, section: { ngon: 6 } },
    );

    // Two tines branching off the main beam.
    const tA = antler.at(0.5);
    const tipA = offset(antler.at(0.5), [s * 0.5, 0.7, 0.3], 0.16);
    b.sprout(`tineA${tag}`, tA, tipA, [0.016, 0.005], { count: 0, color: ANTLER });
    const tB = antler.at(0.8);
    const tipB = offset(antler.at(0.8), [s * 0.4, 1, 0.1], 0.14);
    b.sprout(`tineB${tag}`, tB, tipB, [0.014, 0.005], { count: 0, color: ANTLER });

    // Tiny white flowers clustered at the tine tips.
    for (const tip of [tipA, tipB, antler.at(1)]) {
      b.part(new THREE.SphereGeometry(0.024, 6, 4), FLOWER, { at: tip });
      b.ring(frame(tip, [0, 1, 0]), { count: 4, radius: 0.022 }, (f) =>
        b.part(new THREE.SphereGeometry(0.013, 5, 4), FLOWER, { at: f }),
      );
    }

    // Flowers and leaves along the beam.
    const nodes = b.along(
      antler,
      5,
      (at) => {
        b.stick(new THREE.SphereGeometry(0.018, 6, 4), FLOWER, at, { embed: 0.3 });
      },
      { from: 0.25, to: 0.95 },
    );
    b.cards(nodes, leaf, { size: [0.06, 0.09], lean: 55, bend: 25 });
  });

  // Pale wooden mask on the face, with a moulded outline.
  const maskOutline: OutlinePoint[] = [
    [0, 0.13],
    [0.09, 0.08],
    [0.1, -0.02],
    [0.05, -0.12],
    [0, -0.14],
    [-0.05, -0.12],
    [-0.1, -0.02],
    [-0.09, 0.08],
  ];
  b.extrude(maskOutline, {
    at: head.local({ forward: 0.16 }),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.006,
    smoothing: 2,
    color: PALE,
    bone: head,
  });

  // Glowing green eyes set into the mask.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.032, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.03, forward: 0.18 }),
    });
  }

  // Moss tufts scattered over the stone body.
  const bodyHits = b.surface(body).scatter(42, {
    rng: rng(3),
    minDist: 0.07,
    filter: (h) => h.n.y > -0.2,
  });
  b.cards(bodyHits, tuft, { size: [0.05, 0.08], lean: 25, bend: 15 });

  // Fireflies circling the head.
  b.ring(frame([0, 1.55, 0.78], [0, 1, 0]), { count: 5, radius: 0.33 }, (f) =>
    b.part(new THREE.SphereGeometry(0.022, 6, 4), FIREFLY, { at: f }),
  );
  b.ring(frame([0, 1.72, 0.74], [0, 1, 0]), { count: 3, radius: 0.22 }, (f) =>
    b.part(new THREE.SphereGeometry(0.018, 6, 4), FIREFLY, { at: f }),
  );

  return b.root;
}
