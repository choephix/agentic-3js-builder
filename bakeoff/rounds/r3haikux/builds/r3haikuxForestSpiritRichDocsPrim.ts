import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";
import { arc, bezier, catmull, limb, offset } from "../../../../src/index";
import { grain, mottle, noise, paint, svg } from "../../../../src/index";

export const meta = {
  name: "moss-stone-forest-spirit",
  description:
    "A small forest spirit: a moss-backed river-stone body on slender wooden deer legs, a pale wooden mask face with glowing green eyes, branching antlers with white blossom and leaves, and fireflies circling its head.",
};

// ---- palette -------------------------------------------------------------
const STONE = mottle("#8d9189", "#6b7069", { size: 0.14, seed: 4 });
const MOSS = mottle("#3f7d36", "#6ca643", { size: 0.06, seed: 9 });
const BODY = paint((p, n) => (n.y + (noise(p, 0.12, 3) - 0.5) * 0.7 > 0.35 ? MOSS : STONE));
const WOOD = grain("#7d5c3d", "#58402a", { size: 0.02, axis: "y", seed: 2 });
const ANTLER = grain("#b09a74", "#7d6548", { size: 0.015, axis: "y", seed: 5 });
const MASK = grain("#efe3c9", "#d4c19b", { size: 0.012, axis: "y", seed: 6 });
const SOCKET = "#22180f";
const EYE = "#8dff6a";
const HOOF = "#2b2019";
const FIREFLY = "#f5ff8f";

// ---- textures ------------------------------------------------------------
const FLOWER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <g fill="#fbfaf2">
      <circle cx="32" cy="14" r="11"/>
      <circle cx="49.1" cy="26.4" r="11"/>
      <circle cx="42.6" cy="46.6" r="11"/>
      <circle cx="21.4" cy="46.6" r="11"/>
      <circle cx="14.9" cy="26.4" r="11"/>
    </g>
    <circle cx="32" cy="32" r="7.5" fill="#f0c64a"/>
  </svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32 3 C52 19 54 45 32 61 C10 45 12 19 32 3 Z" fill="#5fae48"/>
    <path d="M32 9 L32 55" stroke="#2d6a34" stroke-width="2.6" fill="none"/>
    <path d="M32 24 L44 17 M32 35 L47 27 M32 24 L20 17 M32 35 L17 27" stroke="#2d6a34" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 128 },
);

const GLOW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g">
        <stop offset="0" stop-color="#f4ffe0"/>
        <stop offset="0.35" stop-color="#9dff78"/>
        <stop offset="1" stop-color="#9dff78" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#g)"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "moss-stone-forest-spirit" });

  // ---- skeleton --------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, -0.42], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.42],
      [0, 0.99, -0.14],
      [0, 1.02, 0.1],
      [0, 1.05, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.05, 0.3],
      [0, 1.2, 0.42],
      [0, 1.36, 0.52],
      [0, 1.5, 0.6],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 1.5, 0.6], aim: [0, 1.46, 0.9], role: "head" });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: -0.02, up: -0.07 }),
    aim: head.local({ forward: 0.1, up: -0.13 }),
    role: "jaw",
  });

  // ---- body and neck: one smooth skin over the spine ------------------
  const body = b.sweep(spine, (t) => [0.2 - 0.04 * t, 0.19 - 0.03 * t], {
    section: { ngon: 8 },
    color: BODY,
  });

  b.sweep(neck, (t) => 0.085 - 0.02 * t, { color: BODY });

  // ---- skull, mask and lower jaw --------------------------------------
  b.part(new THREE.DodecahedronGeometry(0.13, 0), BODY, {
    bone: head,
    at: head.local({ forward: -0.06, up: 0.02 }),
    scale: [1, 0.95, 1.15],
    flat: true,
  });

  const maskAt = head.local({ forward: 0.09, up: 0.02 });
  const maskX = head.dir([-1, 0, 0]);
  const maskY = head.dir([0, 0, 1]);

  const mask = b.extrude(
    [
      [0, 0.1],
      [0.07, 0.085],
      [0.095, 0.03],
      [0.088, 0],
      [-0.088, 0],
      [-0.095, 0.03],
      [-0.07, 0.085],
    ],
    { at: maskAt, x: maskX, y: maskY, thickness: 0.03, bevel: 0.006, smoothing: 1, color: MASK, bone: head },
  );

  b.extrude(
    [
      [-0.085, -0.004],
      [0.085, -0.004],
      [0.07, -0.05],
      [0, -0.1, "sharp"],
      [-0.07, -0.05],
    ],
    { at: maskAt, x: maskX, y: maskY, thickness: 0.026, bevel: 0.005, smoothing: 1, color: MASK, bone: jaw },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), SOCKET, {
      bone: head,
      at: mask.local([s * 0.045, 0.035, 0]),
      scale: [1, 1, 0.45],
      flat: true,
    });
    const eye = mask.local([s * 0.045, 0.035, 0.02]);
    b.part(new THREE.SphereGeometry(0.02, 8, 6), EYE, { bone: head, at: eye, flat: true });
    b.decal(mask, GLOW, { at: eye, dir: [0, 0, 1], size: [0.1, 0.1], lift: 0.004 });
  }

  // ---- antlers, blossom, leaves and ears ------------------------------
  for (const s of [1, -1]) {
    const P = (left: number, up: number, back = 0) => head.local({ left: s * left, up, back });

    const beam = catmull([P(0.05, 0.1, 0), P(0.1, 0.22, 0.02), P(0.15, 0.36, 0.06), P(0.19, 0.5, 0.1)]);
    b.sweep(beam, (t) => 0.032 - 0.02 * t, { bone: head, color: ANTLER });
    b.sweep(bezier(beam.at(0.42), P(0.24, 0.3, -0.02), P(0.33, 0.37, 0)), (t) => 0.02 - 0.012 * t, {
      bone: head,
      color: ANTLER,
    });
    b.sweep(bezier(beam.at(0.7), P(0.2, 0.5, 0.12), P(0.12, 0.6, 0.2)), (t) => 0.018 - 0.01 * t, {
      bone: head,
      color: ANTLER,
    });
    b.sweep(bezier(beam.at(0.92), P(0.22, 0.6, 0.18), P(0.2, 0.7, 0.14)), (t) => 0.014 - 0.009 * t, {
      bone: head,
      color: ANTLER,
    });

    const blossom = [
      beam.at(0.3),
      beam.at(0.62),
      beam.at(0.9),
      P(0.33, 0.37, 0),
      P(0.12, 0.6, 0.2),
      P(0.2, 0.7, 0.14),
    ];
    b.cards(
      blossom.map((p) => frame(p, [0, 1, 0])),
      FLOWER,
      { size: 0.07, cross: true, bone: head },
    );

    const leafSpots = [beam.at(0.2), beam.at(0.5), beam.at(0.8), P(0.22, 0.6, 0.18)];
    const leaves = leafSpots.map((p, i) => frame(p, [s * 0.9, 0.35, i % 2 ? -0.2 : 0.3]));
    b.cards(leaves, LEAF, { size: [0.07, 0.1], lean: 40, cross: true, bone: head });

    b.extrude(
      [
        [0, 0],
        [0.06, 0.035],
        [0.15, 0, "sharp"],
        [0.06, -0.035],
      ],
      {
        at: P(0.1, 0.02, -0.02),
        x: [s * 0.85, 0.25, -0.5],
        y: [0, 1, 0],
        thickness: 0.018,
        smoothing: 2,
        color: BODY,
        bone: head,
      },
    );
  }

  // ---- river stones with moss caps on the back ------------------------
  const bodySkin = b.surface(body);
  const stones: [number, number, number][] = [
    [165, 45, 0.13],
    [100, 22, 0.09],
    [235, 28, 0.1],
  ];
  for (const [az, el, r] of stones) {
    const hit = bodySkin.around([0, 1.0, -0.05]).at(az, el);
    if (!hit) continue;
    b.stick(new THREE.DodecahedronGeometry(r, 0), STONE, hit, { embed: 0.35, flat: true });
    b.stick(
      new THREE.SphereGeometry(r * 0.8, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      MOSS,
      hit.moved([0, r * 0.45, 0]),
      { embed: 0.4, scale: [1, 0.5, 1] },
    );
  }

  // ---- slender wooden legs with hooves --------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const fore = limb([s * 0.12, 0.9, 0.22], [s * 0.12, 0.03, 0.27], [0.45, 0.45], [0, 0, 1]);
    const foreLeg = b.chain(`fore${side}`, fore, {
      parent: spine,
      names: [`shoulder${side}`, `wrist${side}`, `hoofF${side}`],
      role: "leg",
    });
    b.sweep(foreLeg, (t) => 0.04 - 0.018 * t, { color: WOOD });
    b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.05, 6), HOOF, {
      bone: foreLeg.tip!,
      at: [s * 0.12, 0.025, 0.27],
      flat: true,
    });

    const hind = limb([s * 0.12, 0.9, -0.4], [s * 0.12, 0.03, -0.36], [0.36, 0.34, 0.2], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hindLeg = b.chain(`hind${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `footH${side}`],
      role: "leg",
    });
    b.sweep(hindLeg, (t) => 0.045 - 0.022 * t, { color: WOOD });
    b.part(new THREE.CylinderGeometry(0.03, 0.036, 0.05, 6), HOOF, {
      bone: hindLeg.tip!,
      at: [s * 0.12, 0.025, -0.36],
      flat: true,
    });
  }

  // a tuft of moss for a tail
  b.part(new THREE.DodecahedronGeometry(0.07, 0), MOSS, { bone: hips, at: [0, 1.0, -0.64], flat: true });

  // ---- fireflies on orbit trails around the head ----------------------
  const H = head.local({ forward: -0.02, up: 0.1 });
  const orbits = [
    arc(H, offset(H, [1, 0, 0], 0.2), [0, 1, 0.25], 320),
    arc(H, offset(H, [0, 0, 1], 0.24), [0.35, 1, 0], 300),
    arc(H, offset(H, [1, 0, 0], 0.16), [0, 0.4, 1], 340),
  ];
  for (const o of orbits) b.sweep(o, 0.004, { bone: head, color: FIREFLY });

  const flies: [number, number][] = [
    [0, 0.1],
    [0, 0.6],
    [1, 0.35],
    [1, 0.85],
    [2, 0.5],
  ];
  for (const [i, t] of flies) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), FIREFLY, { bone: head, at: orbits[i].at(t) });
  }

  return b.root;
}
