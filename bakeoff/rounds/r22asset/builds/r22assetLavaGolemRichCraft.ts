import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mottle, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A 3.3 m basalt golem with molten seams, a pyro core ringed in gold filigree, glowing eyes, gold trims and flame wisps, cel-shaded in the Genshin Impact manner.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const LAVA = "#ff7a1a";
const HOT = "#ffd23c";
const EMBER = "#ff4a14";

// Cel-shaded basalt: scale-plated stone with painted lava cracks running through it.
const STONE = cel(scales(["#5d5878", "#6a6486", "#524d6c"], "#2c2840", { size: 0.22, width: 0.1, seed: 4 }));
const ROCK = paint((p, n) => {
  const c = cells(p, 0.3, 5);
  const e = c.d2 - c.d1;
  if (e < 0.045) return "#ffb12e";
  if (e < 0.085) return "#e0461a";
  return STONE;
});
const PLATE = cel(mottle("#7a7498", "#625c80", { size: 0.14, seed: 11 }), "#3d3858");
const OBS = cel("#2b2540", "#1a1630");
const GOLD = cel("#f4c64e", "#bf802a");
const TUSK = cel("#efe0bc", "#c9a97c");

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const ico = () => new THREE.IcosahedronGeometry(1, 1);

const EYE = svg(
  `<svg viewBox="0 0 64 32">
    <path d="M3 25 L55 3 L61 11 L17 30 Z" fill="#ffd84a"/>
    <path d="M3 25 L55 3 L58 7 L10 27 Z" fill="#fff4b0"/>
    <path d="M30 17 L41 12 L42 18 L32 22 Z" fill="#5a1400"/>
  </svg>`,
  { size: 128 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#f4c64e" stroke-width="3.5"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="#f4c64e" stroke-width="2.5"/>
    <g fill="none" stroke="#f4c64e" stroke-width="3" stroke-linecap="round">
      <path d="M50 4 Q58 20 50 30 Q42 20 50 4"/>
      <path d="M50 96 Q58 80 50 70 Q42 80 50 96"/>
      <path d="M4 50 Q20 58 30 50 Q20 42 4 50"/>
      <path d="M96 50 Q80 58 70 50 Q80 42 96 50"/>
      <path d="M17 17 Q30 24 36 36 Q24 30 17 17"/>
      <path d="M83 17 Q70 24 64 36 Q76 30 83 17"/>
      <path d="M17 83 Q30 76 36 64 Q24 70 17 83"/>
      <path d="M83 83 Q70 76 64 64 Q76 70 83 83"/>
    </g>
    <g fill="#f4c64e">
      <circle cx="50" cy="50" r="2"/><circle cx="50" cy="12" r="2.5"/><circle cx="50" cy="88" r="2.5"/>
      <circle cx="12" cy="50" r="2.5"/><circle cx="88" cy="50" r="2.5"/>
    </g>
  </svg>`,
  { size: 512 },
);

const FLAME = svg(
  `<svg viewBox="0 0 40 80">
    <path d="M20 78 C2 62 6 40 18 26 C16 40 24 44 24 30 C26 14 20 8 22 2 C34 16 40 48 34 62 C32 70 26 76 20 78 Z" fill="#ff6a1a"/>
    <path d="M20 76 C10 64 14 50 21 40 C22 50 28 52 28 60 C28 68 24 74 20 76 Z" fill="#ffd23c"/>
  </svg>`,
  { size: 128 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
    <rect x="9" y="0" width="6" height="8" fill="#f4c64e"/>
    <circle cx="12" cy="13" r="6" fill="#f4c64e"/>
    <path d="M5 18 L19 18 L21 62 L3 62 Z" fill="#ff5a1c"/>
    <path d="M9 18 L11 62 M15 18 L13 62" stroke="#f4c64e" stroke-width="2"/>
    <rect x="4" y="22" width="16" height="3" fill="#f4c64e"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.3, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, 0],
      [0, 1.7, 0.02],
      [0, 2.15, 0.06],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.25, 0.05],
      [0, 2.42, 0.14],
      [0, 2.52, 0.24],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.52, 0.24], aim: [0, 2.62, 0.5], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.55, 0.3], aim: [0, 2.5, 0.6], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 1.15, 0], w: 0.75, h: 0.55 },
      { at: [0, 1.5, 0], w: 0.7, h: 0.55 },
      { at: [0, 1.95, 0.05], w: 1.2, h: 0.85 },
      { at: [0, 2.3, 0.08], w: 1.1, h: 0.7 },
    ],
    { bone: [hips, spine], color: ROCK, sides: 8, smooth: false },
  );
  const skin = b.surface(torso);
  const plateHits = skin.scatter(26, { rng: rng(3), minDist: 0.22, filter: (h) => Math.abs(h.n.z) > 0.25 });
  plateHits.forEach((h, i) => {
    b.stick(box(0.2, 0.07, 0.17), PLATE, h, { embed: 0.3, flow: [0, -1, 0], spin: (i % 5) * 14 - 28 });
  });

  // seams of molten stone between the plates
  const seamLines = [
    [
      [-0.3, 2.3, 0.6],
      [-0.2, 2.05, 0.6],
      [-0.32, 1.75, 0.5],
      [-0.12, 1.4, 0.4],
    ],
    [
      [0.32, 2.28, 0.6],
      [0.22, 2.0, 0.6],
      [0.34, 1.7, 0.5],
      [0.1, 1.35, 0.4],
    ],
    [
      [-0.05, 1.3, -0.4],
      [0.1, 1.7, -0.5],
      [-0.1, 2.0, -0.55],
      [0.05, 2.3, -0.4],
    ],
  ];
  for (const pts of seamLines) {
    glow(b.sweep(skin.drape(catmull(pts), { lift: 0.04 }), 0.018, { color: LAVA, sides: 5, bone: spine }), 1.4);
  }

  // pyro core and gold filigree
  b.decal(torso, FILIGREE, { at: [0, 2.0, 0.5], dir: [0, 0, 1], size: [0.6, 0.6], lift: 0.012 });
  glow(b.part(new THREE.IcosahedronGeometry(0.17, 1), HOT, { bone: "chest", at: [0, 2.0, 0.5], flat: true }), 1.6);
  b.part(new THREE.TorusGeometry(0.21, 0.035, 6, 16), GOLD, { bone: "chest", at: [0, 2.0, 0.5], dir: [0, 0, 1], axis: "z" });

  // collar and belt
  b.sweep(
    catmull(
      [
        [0.58, 2.28, 0],
        [0.4, 2.28, 0.34],
        [0, 2.28, 0.44],
        [-0.4, 2.28, 0.34],
        [-0.58, 2.28, 0],
        [-0.4, 2.28, -0.3],
        [0, 2.28, -0.4],
        [0.4, 2.28, -0.3],
      ],
      { closed: true },
    ),
    0.04,
    { color: GOLD, bone: "chest", sides: 6 },
  );
  b.sweep(
    catmull(
      [
        [0.42, 1.3, 0],
        [0.3, 1.3, 0.3],
        [0, 1.3, 0.37],
        [-0.3, 1.3, 0.3],
        [-0.42, 1.3, 0],
        [-0.3, 1.3, -0.3],
        [0, 1.3, -0.36],
        [0.3, 1.3, -0.3],
      ],
      { closed: true },
    ),
    0.05,
    { color: GOLD, bone: hips, sides: 6 },
  );
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), GOLD, { bone: hips, at: [0, 1.3, 0.4], dir: [0, 0, 1] });
  glow(b.part(new THREE.IcosahedronGeometry(0.055, 0), EMBER, { bone: hips, at: [0, 1.3, 0.43], flat: true }), 1.3);
  for (let i = -2; i <= 2; i++) {
    b.part(box(0.2, 0.34, 0.06), PLATE, {
      bone: hips,
      at: [i * 0.17, 1.1 - Math.abs(i) * 0.02, 0.33 - Math.abs(i) * 0.04],
      rotation: [8, 0, i * 4],
    });
  }
  b.cards(
    [-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => frame([x, 1.27, 0.38 - Math.abs(x) * 0.25 + (i % 2) * 0.01], [0, 1, 0])),
    TASSEL,
    { size: [0.07, 0.26], lean: 180, flow: [0, 0, 1], bone: hips },
  );

  // dorsal fins of obsidian with a hot tip
  for (let i = 0; i < 5; i++) {
    const y = 1.6 + i * 0.16;
    const z = -0.2 - i * 0.05;
    b.spike([0, y, z], [0, 1, -0.7], 0.3 - i * 0.015, 0.07, OBS, { bone: spine, sides: 5 });
    glow(
      b.spike([0, y + 0.19, z - 0.15], [0, 1, -0.7], 0.12, 0.03, LAVA, { bone: spine, sides: 5 }),
      1.2,
    );
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.2, 0), LAVA, { bone: spine, at: [0, 1.95, -0.4], flat: true }), 1.3);

  // ---------------------------------------------------------------- neck & head
  b.sweep(neck, 0.2, { color: ROCK, sides: 6, smooth: false });
  const skull = b.part(ico(), ROCK, { bone: head, at: [0, 2.7, 0.3], scale: [0.34, 0.28, 0.32], flat: true });
  b.part(box(0.5, 0.1, 0.36), PLATE, { bone: head, at: [0, 2.9, 0.3], rotation: [-8, 0, 0] });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: [s * 0.14, 2.72, 0.6], dir: [0, 0, 1], size: [0.15, 0.075], mirror: s < 0, lift: 0.006 });
    const eyeMesh = b.part(box(0.01, 0.01, 0.01), "#000000", { bone: head, at: [s * 0.14, 2.72, 0.1] });
    eyeMesh.mesh.visible = false;
    b.part(box(0.22, 0.06, 0.1), OBS, { bone: head, at: [s * 0.14, 2.81, 0.56], rotation: [-12, 0, s * 20] });
    b.part(box(0.1, 0.1, 0.1), PLATE, { bone: head, at: [s * 0.3, 2.66, 0.3], rotation: [0, 0, s * 15] });
    // horns
    const base: [number, number, number] = [s * 0.2, 2.9, 0.28];
    b.sweep(bezier(base, [s * 0.5, 3.02, 0.22], [s * 0.52, 3.32, 0.0]), [0.075, 0], {
      color: OBS,
      bone: head,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    b.part(new THREE.TorusGeometry(0.085, 0.022, 5, 10), GOLD, {
      bone: head,
      at: [s * 0.27, 2.95, 0.27],
      dir: [s * 0.8, 0.3, -0.1],
      axis: "z",
    });
    // tusks
    b.spike([s * 0.12, 2.47, 0.5], [s * 0.1, 1, 0.5], 0.14, 0.035, TUSK, { bone: jaw, sides: 5 });
  }
  // lower jaw, molten mouth
  glow(b.part(box(0.3, 0.05, 0.22), LAVA, { bone: head, at: [0, 2.52, 0.48] }), 1.3);
  b.part(box(0.36, 0.1, 0.34), ROCK, { bone: jaw, at: [0, 2.45, 0.45] });
  b.part(box(0.2, 0.06, 0.08), PLATE, { bone: jaw, at: [0, 2.42, 0.62] });
  for (let i = -2; i <= 2; i++) b.spike([i * 0.06, 2.5, 0.58], [0, 1, 0.1], 0.06, 0.02, TUSK, { bone: jaw, sides: 4 });
  // skull crest
  for (let i = 0; i < 5; i++) {
    b.spike([0, 2.93 - 0.03 * i, 0.22 - 0.09 * i], [0, 1, -0.6], 0.2 - i * 0.015, 0.045, OBS, { bone: head, sides: 5 });
  }
  b.cards([frame([0, 3.0, 0.1], [0, 1, 0])], FLAME, { size: [0.18, 0.34], cross: true, bone: head });
  glow(
    b.cards([frame([0, 2.98, 0.14], [0, 1, 0]), frame([0, 2.96, 0.02], [0, 1, 0])], FLAME, {
      size: [0.14, 0.26],
      cross: true,
      bone: head,
    }),
    1.2,
  );

  // ---------------------------------------------------------------- arms
  const armR = (t: number) => (t < 0.45 ? 0.21 - 0.04 * (t / 0.45) : 0.17 + 0.07 * ((t - 0.45) / 0.55));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.88, 2.15, 0],
        [s * 1.2, 1.55, 0.08],
        [s * 1.3, 1.0, 0.28],
      ]),
      { parent: spine, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    const armSweep = b.sweep(arm, armR, { color: ROCK, sides: 6, smooth: false });
    const armSkin = b.surface(armSweep);
    for (const h of armSkin.scatter(8, { rng: rng(20 + (s > 0 ? 1 : 2)), minDist: 0.16, filter: (hh) => hh.at.y < 1.9 })) {
      b.stick(box(0.15, 0.06, 0.13), PLATE, h, { embed: 0.3, flow: [0, -1, 0] });
    }
    // pauldron
    b.part(ico(), PLATE, { bone: `shoulder${S}`, at: [s * 0.88, 2.38, 0], scale: [0.36, 0.27, 0.36], flat: true });
    b.part(new THREE.TorusGeometry(0.33, 0.03, 6, 14), GOLD, {
      bone: `shoulder${S}`,
      at: [s * 0.88, 2.3, 0],
      dir: [0, 1, 0],
      axis: "z",
    });
    for (let k = 0; k < 3; k++) {
      b.spike([s * (0.78 + 0.14 * k), 2.58 - 0.05 * k, 0], [s * 0.4 * k, 1, -0.1], 0.3 - 0.04 * k, 0.06, OBS, {
        bone: `shoulder${S}`,
        sides: 5,
      });
    }
    glow(b.cards([frame([s * 0.88, 2.6, -0.05], [0, 1, 0])], FLAME, { size: [0.15, 0.3], cross: true, bone: `shoulder${S}` }), 1.2);
    // molten rings and gold cuff
    const ringA = arm.at(0.28);
    glow(
      b.part(new THREE.TorusGeometry(armR(0.28) + 0.015, 0.02, 5, 12), LAVA, {
        at: ringA.at,
        dir: ringA.tangent,
        axis: "z",
        bone: ringA.bone ?? undefined,
      }),
      1.3,
    );
    const cuff = arm.at(0.8);
    b.part(new THREE.TorusGeometry(armR(0.8) + 0.02, 0.04, 6, 12), GOLD, {
      at: cuff.at,
      dir: cuff.tangent,
      axis: "z",
      bone: cuff.bone ?? undefined,
    });
    // elbow spike
    b.spike([s * 1.28, 1.55, 0.0], [s * 0.7, 0.2, -1], 0.26, 0.07, OBS, { bone: `elbow${S}`, sides: 5 });
    // fist
    b.part(ico(), ROCK, { bone: `wrist${S}`, at: [s * 1.3, 0.82, 0.3], scale: [0.27, 0.25, 0.26], flat: true });
    for (let i = 0; i < 4; i++) {
      b.part(box(0.085, 0.15, 0.1), PLATE, { bone: `wrist${S}`, at: [s * 1.3 + (i - 1.5) * 0.09, 0.76, 0.5] });
      glow(b.part(box(0.012, 0.1, 0.01), LAVA, { bone: `wrist${S}`, at: [s * 1.3 + (i - 1) * 0.09, 0.77, 0.555] }), 1.2);
    }
    b.part(new THREE.CapsuleGeometry(0.06, 0.12, 3, 6), PLATE, {
      bone: `wrist${S}`,
      at: [s * 1.12, 0.84, 0.42],
      rotation: [60, 0, 0],
    });
    b.spike([s * 1.45, 0.86, 0.3], [s, 0.2, 0.1], 0.16, 0.05, OBS, { bone: `wrist${S}`, sides: 5 });
  }

  // ---------------------------------------------------------------- legs
  const legR = (t: number) => (t < 0.5 ? 0.28 - 0.07 * (t / 0.5) : 0.21 + 0.03 * ((t - 0.5) / 0.5));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.4, 1.25, 0],
        [s * 0.44, 0.72, 0.1],
        [s * 0.44, 0.28, -0.02],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    const legSweep = b.sweep(leg, legR, { color: ROCK, sides: 6, smooth: false });
    const legSkin = b.surface(legSweep);
    for (const h of legSkin.scatter(8, { rng: rng(40 + (s > 0 ? 1 : 2)), minDist: 0.17, filter: (hh) => hh.n.z > -0.2 })) {
      b.stick(box(0.16, 0.06, 0.14), PLATE, h, { embed: 0.3, flow: [0, -1, 0] });
    }
    const thighRing = leg.at(0.22);
    glow(
      b.part(new THREE.TorusGeometry(legR(0.22) + 0.02, 0.02, 5, 12), LAVA, {
        at: thighRing.at,
        dir: thighRing.tangent,
        axis: "z",
        bone: thighRing.bone ?? undefined,
      }),
      1.3,
    );
    // knee guard and shin plate
    b.part(ico(), PLATE, { bone: `knee${S}`, at: [s * 0.44, 0.74, 0.3], scale: [0.18, 0.17, 0.12], flat: true });
    b.part(new THREE.TorusGeometry(0.14, 0.025, 5, 12), GOLD, {
      bone: `knee${S}`,
      at: [s * 0.44, 0.74, 0.31],
      dir: [0, 0, 1],
      axis: "z",
    });
    b.spike([s * 0.44, 0.76, 0.34], [0, 0.2, 1], 0.14, 0.05, OBS, { bone: `knee${S}`, sides: 5 });
    b.part(box(0.2, 0.34, 0.06), PLATE, { bone: `knee${S}`, at: [s * 0.44, 0.45, 0.17], rotation: [-6, 0, 0] });
    glow(b.part(box(0.012, 0.3, 0.01), LAVA, { bone: `knee${S}`, at: [s * 0.44, 0.45, 0.205] }), 1.2);
    // foot
    b.part(box(0.5, 0.22, 0.72), ROCK, { bone: `ankle${S}`, at: [s * 0.44, 0.11, 0.13] });
    b.part(box(0.42, 0.1, 0.5), PLATE, { bone: `ankle${S}`, at: [s * 0.44, 0.26, 0.1] });
    for (let i = -1; i <= 1; i++) {
      b.part(box(0.15, 0.16, 0.16), PLATE, { bone: `ankle${S}`, at: [s * 0.44 + i * 0.16, 0.09, 0.52] });
      glow(b.part(box(0.01, 0.1, 0.01), LAVA, { bone: `ankle${S}`, at: [s * 0.44 + i * 0.16 + 0.08, 0.09, 0.545] }), 1.2);
    }
    b.part(box(0.4, 0.08, 0.04), GOLD, { bone: `ankle${S}`, at: [s * 0.44, 0.28, 0.36] });
  }

  // ---------------------------------------------------------------- floating embers
  const r = rng(9);
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2;
    const rad = 1.5 + r() * 0.4;
    glow(
      b.part(new THREE.OctahedronGeometry(0.03 + r() * 0.03, 0), i % 2 ? HOT : LAVA, {
        bone: spine,
        at: [Math.cos(a) * rad, 1.3 + r() * 1.7, Math.sin(a) * rad * 0.8],
        flat: true,
      }),
      1.4,
    );
  }

  return b.root;
}
