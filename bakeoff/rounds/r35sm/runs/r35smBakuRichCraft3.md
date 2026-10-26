```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, paint, svg } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baku",
  description:
    "Dream-eating tapir spirit in ukiyo-e woodblock style: indigo fore, cream hind with seigaiha waves, elephant trunk, flame mane, tiger paws, ox tail tuft.",
};

// Woodblock palette
const INDIGO = "#1f3d73";
const WAVEBLUE = "#4a78b4";
const CREAM = "#f2e6c4";
const CREAMSH = "#cdbf94";
const VERMIL = "#d9442b";
const GOLD = "#d9a52e";
const BONE = "#f6efd8";

// Seigaiha wave paint
const wave = (bg: string, line: string, size: number) =>
  paint((p, n) => {
    if (Math.abs(n.y) > 0.9) return bg;
    const v = p.y / (size * 0.5);
    const row = Math.floor(v);
    const fy = v - row;
    const u = p.z / size + (row & 1 ? 0.5 : 0);
    const fx = u - Math.floor(u) - 0.5;
    const d = Math.hypot(fx, fy);
    const k = d * 4 - Math.floor(d * 4);
    return d < 0.55 && k < 0.2 ? line : bg;
  });

const FORE = wave(INDIGO, WAVEBLUE, 0.07);
const HIND = wave(CREAM, CREAMSH, 0.07);
const coatRaw = paint((p) => {
  const edge = -0.12 + 0.04 * Math.sin(p.y * 22) + 0.03 * Math.sin(p.y * 9 + 1);
  return p.z < edge ? HIND : FORE;
});
const COAT = cel(coatRaw);
const LEG = cel(
  paint((p) => (p.y < 0.2 && p.y > 0.15 ? VERMIL : p.y < 0.145 && p.y > 0.125 ? GOLD : coatRaw)),
);
const HEADC = cel(INDIGO);
const CREAMC = cel(CREAM);
const REDC = cel(VERMIL);
const GOLDC = cel(GOLD);

// Textures
const EYE = svg(
  `<svg viewBox="0 0 60 40">
  <path d="M3 15 Q30 1 57 13" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M3 15 Q30 3 57 13" stroke="${VERMIL}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M3 27 Q30 9 57 25 Q30 39 3 27Z" fill="#f4ead0" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <circle cx="31" cy="25" r="9.5" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
  <circle cx="31" cy="25" r="5" fill="${INK}"/>
  <circle cx="28" cy="22" r="2.2" fill="#fff"/>
  <path d="M3 27 L-1 31" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const CLOUD = svg(
  `<svg viewBox="0 0 80 50">
  <g fill="${CREAM}" stroke="${INK}" stroke-width="2.6">
    <circle cx="20" cy="30" r="14"/><circle cx="40" cy="22" r="16"/><circle cx="60" cy="30" r="14"/>
    <rect x="20" y="30" width="40" height="14" stroke="none"/>
  </g>
  <g fill="none" stroke="${VERMIL}" stroke-width="3" stroke-linecap="round">
    <path d="M20 30 c0 -5 7 -5 7 0 c0 6 -11 6 -11 -2"/>
    <path d="M40 22 c0 -5 7 -5 7 0 c0 6 -11 6 -11 -2"/>
    <path d="M60 30 c0 -5 7 -5 7 0 c0 6 -11 6 -11 -2"/>
  </g>
  <path d="M8 44 H72" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="29" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="${VERMIL}" stroke-width="2"/>
  <path d="M38 12 A21 21 0 1 0 38 52 A16 16 0 1 1 38 12Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
  <circle cx="44" cy="32" r="3.4" fill="${VERMIL}" stroke="${INK}" stroke-width="1.4"/>
</svg>`,
  { size: 192 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 48 48">
  <path id="s" d="M24 24 c0 -4 6 -4 6 0 c0 8 -14 8 -14 -2 c0 -14 22 -14 22 2 c0 18 -30 18 -30 -4" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M24 24 c0 -4 6 -4 6 0 c0 8 -14 8 -14 -2 c0 -14 22 -14 22 2 c0 18 -30 18 -30 -4" stroke="${VERMIL}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

const flameSvg = (main: string, inner: string) =>
  svg(
    `<svg viewBox="0 0 32 64">
  <path d="M4 63 C1 44 10 34 12 22 C12 14 16 8 20 1 C22 14 30 24 29 42 C29 52 30 58 28 63 Z" fill="${main}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M10 62 C8 48 15 40 17 30 C19 38 24 44 23 54 C23 58 23 60 22 62 Z" fill="${inner}"/>
  <path d="M16 56 C15 50 18 46 19 42" stroke="${INK}" stroke-width="1.4" fill="none"/>
</svg>`,
    { size: 128 },
  );
const FLAME_R = flameSvg(VERMIL, GOLD);
const FLAME_G = flameSvg(GOLD, CREAM);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
  <path d="M4 56 L6 8 M9 56 L10 4 M14 56 L14 2 M19 56 L18 6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M4 56 L6 8 M9 56 L10 4 M14 56 L14 2 M19 56 L18 6" stroke="${VERMIL}" stroke-width="2.6" stroke-linecap="round"/>
  <rect x="3" y="52" width="18" height="9" rx="3" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

// helpers
const ell = (rx: number, ry: number, n: number, cy = 0): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * rx, cy + Math.sin(a) * ry] as [number, number];
  });

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(11);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.93, -0.45] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.93, -0.45],
      [0, 0.98, -0.1],
      [0, 1.0, 0.22],
      [0, 0.99, 0.45],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.45],
      [0, 1.08, 0.6],
      [0, 1.15, 0.74],
    ]),
    { parent: spine.joints[2], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.15, 0.74],
    dir: [0, -0.2, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, down: 0.1 }),
    aim: head.local({ forward: 0.3, down: 0.12 }),
    role: "jaw",
  });

  // ---- body
  const body = b.sweep(spine, (t) => [0.25 + 0.03 * (1 - t), 0.29 + 0.01 * Math.sin(t * 3)], {
    color: COAT,
  });
  const neckTube = b.sweep(neck, [0.2, 0.165], { color: COAT, caps: "none" });

  // ---- head
  const HS = 1;
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADC, {
    bone: head,
    at: head.local({ forward: 0.1 * HS }),
    scale: [0.17 * HS, 0.17 * HS, 0.2 * HS],
  });
  // brow ridges
  for (const s of [1, -1]) {
    b.capsule(
      head.local({ left: s * 0.04, up: 0.125, forward: 0.15 }),
      head.local({ left: s * 0.15, up: 0.1, forward: 0.09 }),
      0.024,
      INK,
      { bone: head },
    );
    b.capsule(
      head.local({ left: s * 0.045, up: 0.14, forward: 0.15 }),
      head.local({ left: s * 0.14, up: 0.115, forward: 0.1 }),
      0.012,
      VERMIL,
      { bone: head },
    );
  }
  // eyes
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.145, up: 0.05, forward: 0.1 }),
      dir: [s * 0.85, 0.1, 0.5],
      size: [0.1, 0.067],
      mirror: s > 0,
    });
    b.decal(skull, SWIRL, {
      at: head.local({ left: s * 0.16, down: 0.03, forward: 0.0 }),
      dir: [s, -0.05, 0.1],
      size: [0.085, 0.085],
      mirror: s > 0,
      roll: s * 20,
    });
  }
  // forehead dream emblem
  glow(
    b.decal(skull, EMBLEM, {
      at: head.local({ up: 0.16, forward: 0.14 }),
      dir: [0, 0.75, 0.6],
      size: [0.09, 0.09],
    }),
    0.5,
  );
  // ears: cream-rimmed round
  for (const s of [1, -1]) {
    const at = head.local({ left: s * 0.11, up: 0.15, back: 0.05 });
    b.extrude(ell(0.062, 0.07, 10, 0.05), {
      at,
      x: [s, 0, 0],
      y: [s * 0.35, 1, 0],
      thickness: 0.02,
      bevel: 0.004,
      color: CREAMC,
      bone: head,
    });
    b.extrude(ell(0.042, 0.05, 10, 0.045), {
      at,
      x: [s, 0, 0],
      y: [s * 0.35, 1, 0],
      thickness: 0.03,
      color: cel("#142a55"),
      bone: head,
    });
  }

  // ---- trunk
  const trunk = b.chain(
    "trunk",
    catmull([
      head.local({ forward: 0.2, up: -0.03 }),
      head.local({ forward: 0.38, down: 0.0 }),
      head.local({ forward: 0.5, down: 0.1 }),
      head.local({ forward: 0.52, down: 0.27 }),
    ]),
    { parent: head, role: "tentacle" },
  );
  const trunkTube = b.sweep(trunk, [0.1, 0.078, 0.06, 0.05], {
    color: HEADC,
    bands: [
      [0.78, HEADC],
      [1, CREAMC],
    ],
  });
  for (const k of [-1, 1])
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), INK, trunkTube.at(0.96, 180 + k * 28), {
      embed: 0.3,
    });
  // wrinkle rings on trunk
  for (const t of [0.25, 0.4, 0.55, 0.7]) {
    const r = 0.1 - 0.05 * t;
    b.sweep(
      catmull(b.ring(trunk.at(t), { count: 8, radius: r * 0.88 }).items, { closed: true }),
      0.007,
      { color: cel("#16305f"), bone: trunk.jointAt(t) },
    );
  }
  // tusks and whiskers
  for (const s of [1, -1]) {
    b.spike(head.local({ left: s * 0.075, forward: 0.22, down: 0.06 }), [s * 0.3, -0.7, 0.4], 0.12, 0.025, {
      color: BONE,
      bone: head,
    });
    for (let k = 0; k < 2; k++) {
      b.sweep(
        catmull([
          head.local({ left: s * 0.05, forward: 0.23, up: -0.01 - k * 0.02 }),
          head.local({ left: s * (0.18 + k * 0.06), forward: 0.32, up: 0.0 - k * 0.04 }),
          head.local({ left: s * (0.34 + k * 0.1), forward: 0.28, down: 0.08 + k * 0.1 }),
        ]),
        [0.008, 0.002],
        { color: BONE, bone: head },
      );
    }
  }
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAMC, {
    bone: jaw,
    at: head.local({ forward: 0.2, down: 0.13 }),
    scale: [0.085, 0.045, 0.13],
  });
  for (const s of [1, -1])
    b.spike(head.local({ left: s * 0.05, forward: 0.25, down: 0.1 }), [0, 1, 0.1], 0.04, 0.012, {
      color: BONE,
      bone: jaw,
    });

  // ---- legs
  const legBuild = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.2;
    const hipP: [number, number, number] = front ? [x, 0.82, 0.3] : [x, 0.82, -0.5];
    const footZ = front ? 0.3 : -0.55;
    const foot: [number, number, number] = [x, 0.065, footZ];
    const pts = limb(
      hipP,
      foot,
      front ? [0.4, 0.4] : [0.42, 0.42],
      front ? [[0, 0, -1]] : [[0, 0, 1]],
    );
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
      : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const leg = b.chain(`leg${front ? "F" : "H"}${side}`, catmull(pts), {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [x, 0, footZ + 0.04],
    });
    b.sweep(leg, front ? [0.13, 0.1, 0.075] : [0.15, 0.1, 0.075], { color: LEG });
    const tip = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 9, 6), LEG, {
      bone: tip,
      at: [x, 0.065, footZ + 0.04],
      scale: [0.1, 0.066, 0.14],
    });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.SphereGeometry(0.03, 6, 4), CREAM, {
        bone: tip,
        at: [x + k * 0.05, 0.04, footZ + 0.16 - Math.abs(k) * 0.015],
      });
      b.spike([x + k * 0.05, 0.035, footZ + 0.185], [0, -0.15, 1], 0.04, 0.011, {
        color: INK,
        bone: tip,
      });
    }
  };
  for (const s of [1, -1]) {
    legBuild(s, true);
    legBuild(s, false);
  }

  // ---- tail (ox tail with flame tuft)
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.95, -0.55],
      [0, 0.9, -0.78],
      [0, 0.78, -0.98],
      [0, 0.62, -1.08],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.07, 0.03], { color: HIND === null ? CREAM : cel(CREAM) });
  b.part(new THREE.SphereGeometry(0.055, 7, 5), CREAMC, { bone: tail.joints[2], at: tail.at(1).at });
  const tuft = b.ring(tail.at(1), { count: 7, radius: 0.03, tilt: 30 }).items;
  b.cards(tuft, [FLAME_R, FLAME_G], {
    size: [0.1, 0.32],
    lean: 35,
    bend: 40,
    flow: [0, -1, -0.5],
    rng: rng(21),
    vary: 0.2,
    sink: 0.2,
  });

  // ---- flame mane
  const neckHits = b
    .surface(neckTube)
    .scatter(34, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > 0.15 });
  const bodyHits = b
    .surface(body)
    .scatter(46, { rng: rng(6), minDist: 0.07, filter: (h) => h.n.y > 0.45 && h.at.z > -0.3 });
  b.cards([...neckHits, ...bodyHits], [FLAME_R, FLAME_G, FLAME_R], {
    size: [0.1, 0.24],
    lean: 55,
    bend: 30,
    vary: 0.3,
    spin: 15,
    rng: rng(7),
    sink: 0.25,
  });
  // head crest between ears
  b.cards(
    b.surface(skull).scatter(10, { rng: rng(8), minDist: 0.05, filter: (h) => h.n.y > 0.7 && h.at.z < head.at.z + 0.12 }),
    [FLAME_G, FLAME_R],
    { size: [0.07, 0.15], lean: 60, bend: 20, rng: rng(9) },
  );

  // ---- clouds on flanks
  const skin = b.surface(body);
  for (const s of [1, -1]) {
    for (const [z, y, w] of [
      [-0.28, 1.0, 0.42],
      [0.22, 0.98, 0.36],
    ] as const) {
      const hit = skin.around([0, y, z]).at(s * 90, 5);
      if (hit)
        b.decal(skin, CLOUD, {
          at: hit,
          dir: [s, 0, 0],
          size: [w, w * 0.62],
          mirror: s < 0,
        });
    }
  }

  // ---- ceremonial collar: rope, gold beads, tassel
  const loop = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(loop, 0.02, { color: REDC });
  b.along(b.surface(neckTube).loop(neck.joints[1], { lift: 0.03 }), 14, (at) =>
    b.part(new THREE.SphereGeometry(0.024, 6, 4), GOLD, { at }),
  );
  const front = b.surface(neckTube).nearest(neck.joints[1].local({ forward: 0.25, down: 0.12 }));
  b.part(new THREE.SphereGeometry(0.04, 7, 5), GOLDC, { at: front.moved([0, 0.03, 0]).at, bone: front.bone ?? neck.joints[1] });
  b.cards([frame(front, [0, 1, 0])], TASSEL, { size: [0.08, 0.26], lean: 180, flow: [0, 0, 1], sink: 0, bone: neck.joints[1] });

  return b.root;
}
```