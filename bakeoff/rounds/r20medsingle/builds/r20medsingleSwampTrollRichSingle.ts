import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, gradient, mix, mottle, noise, paint, patches, smoothstep } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, oversized swamp troll with moss-streaked green hide, curved ivory tusks, a crimson mohawk and bone fetishes: skull belt, fang bandolier, crossed-bone back rack, feathered pauldrons.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const BONE = "#e8dcb4";
const BONE_D = "#b8a373";
const CLAW = "#2b2318";
const DARK = "#241a1c";
const BRASS = "#d6a63a";
const EYE = "#ffe14a";
const GLOWG = "#8cff3c";
const PUPIL = "#1a1208";
const TONGUE = "#b8506a";
const MOUTH = "#4a1a22";
const HAIR = "#8d2a26";
const WART = "#9db55a";
const TEETH = "#f6efd8";

// Hand-painted skin: light on top, mid-green on the flanks, pale belly, moss patches on upward surfaces.
const SKIN_TOP = mottle("#a3cf58", "#78a845", { size: 0.14, seed: 11, contrast: 1.2 });
const SKIN_MID = mottle("#639a3e", "#4a7c38", { size: 0.12, seed: 12 });
const SKIN_BEL = mottle("#c9d27a", "#a2b862", { size: 0.1, seed: 13 });
const SKIN_BASE = countershade(SKIN_TOP, countershade(SKIN_MID, SKIN_BEL, { level: -0.25, soft: 0.3 }), {
  level: 0.55,
  soft: 0.3,
});
const MOSS = mottle("#6f9a2c", "#3f6a2a", { size: 0.05, seed: 21 });
const SKIN = paint((p, n) => (n.y > 0.25 && noise(p, 0.28, 31) > 0.64 ? MOSS : SKIN_BASE));
const LEATHER = patches("#3f2616", ["#6b4528", "#7c5230", "#5a3a22"], { size: 0.07, gap: 0.06, seed: 5 });
const BELT = mottle("#3b2616", "#5b3a20", { size: 0.05, seed: 6 });
const MOHAWK = paint((_p, _n, s) => mix("#b3261e", "#ffa02a", smoothstep(0.05, 0.28, s[1])));

const FEATHER = svg(
  `<svg viewBox="0 0 24 64">
    <path d="M12 62 C1 46 1 20 12 2 C23 20 23 46 12 62Z" fill="#2fa8a0"/>
    <path d="M12 62 C6 48 6 24 12 8 C18 24 18 48 12 62Z" fill="#53d4c2"/>
    <path d="M12 62 L12 4" stroke="#17615f" stroke-width="2.4" fill="none"/>
    <path d="M12 44 L4 36 M12 34 L5 26 M12 44 L20 36 M12 34 L19 26" stroke="#17615f" stroke-width="1.8" fill="none"/>
    <circle cx="12" cy="20" r="5.5" fill="#c4262a"/><circle cx="12" cy="20" r="2.6" fill="#ffd84a"/>
  </svg>`,
  { size: 128 },
);
const MOSSTEX = svg(
  `<svg viewBox="0 0 32 48">
    <path d="M4 48 C2 30 6 14 10 2 C14 16 14 34 14 48Z" fill="#4f8a2c"/>
    <path d="M12 48 C12 28 18 12 24 4 C26 20 22 36 22 48Z" fill="#6fae3a"/>
    <path d="M20 48 C22 34 26 22 30 14 C31 28 28 40 28 48Z" fill="#3c6e26"/>
  </svg>`,
  { size: 96 },
);
const WARPAINT = svg(
  `<svg viewBox="0 0 64 64">
    <path d="M8 10 L26 54" stroke="#f3ecd0" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M26 6 L44 50" stroke="#c4262a" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M44 8 L58 44" stroke="#f3ecd0" stroke-width="8" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);
const SPIRAL = svg(
  `<svg viewBox="0 0 64 64">
    <path d="M32 32 m0 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -18 0 a14 14 0 1 1 28 0 a19 19 0 1 1 -38 0" stroke="#2c8f8a" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <circle cx="32" cy="32" r="3" fill="#2c8f8a"/>
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const R = rng(7);
  const pt = (v: THREE.Vector3, dx = 0, dy = 0, dz = 0): number[] => [v.x + dx, v.y + dy, v.z + dz];

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.2, -0.05] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, -0.05],
      [0, 1.45, 0.03],
      [0, 1.75, 0.14],
      [0, 2.0, 0.24],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.0, 0.24],
      [0, 2.12, 0.34],
      [0, 2.2, 0.45],
    ]),
    { parent: chest, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.2, 0.45], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.17, 0.5], aim: [0, 2.12, 0.8], role: "jaw" });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 1.1, -0.08], w: 0.6, h: 0.5 },
      { at: [0, 1.35, 0.0], w: 0.8, h: 0.75 },
      { at: [0, 1.7, 0.1], w: 1.0, h: 0.7 },
      { at: [0, 2.0, 0.2], w: 1.1, h: 0.6 },
      { at: [0, 2.12, 0.25], w: 0.7, h: 0.45 },
    ],
    { bone: [hips, spine], color: SKIN },
  );
  const skin = b.surface(body);
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, {
    at: [0, 2.02, 0.02],
    scale: [0.38, 0.2, 0.28],
    bone: chest,
  });

  // warts
  for (const hit of skin.scatter(26, { rng: rng(5), minDist: 0.15, filter: (h) => h.n.y > -0.4 }))
    b.stick(new THREE.SphereGeometry(0.02, 5, 4), WART, hit, { embed: 0.4 });

  // moss tufts on the back and shoulders
  const mossHits = skin.scatter(44, { rng: rng(9), minDist: 0.07, filter: (h) => h.n.y > 0.45 && h.at.y > 1.7 });
  b.cards(mossHits, MOSSTEX, { size: [0.07, 0.13], lean: 25, bend: 20, vary: 0.3, rng: rng(10), cross: true });

  // spine spikes
  b.along(body, 6, (at) => b.spike(at, at, 0.12, 0.04, { color: BONE_D, sides: 6 }), { from: 0.3, to: 0.85 });

  // chest spirals
  for (const s of [1, -1])
    b.decal(skin, SPIRAL, {
      at: [s * 0.27, 1.84, 0.5],
      dir: [s * 0.2, 0.05, 1],
      size: [0.26, 0.26],
      mirror: s > 0,
    });

  // ---------------------------------------------------------------- neck, head
  b.sweep(neck, [0.22, 0.19, 0.17], { color: SKIN });
  // bead choker with a pendant skull
  const choker = b.ring(neck.at(0.35), { count: 12, radius: 0.19 });
  b.sweep(catmull(choker.items, { closed: true }), 0.012, { color: BELT });
  for (const it of choker.items) b.stick(new THREE.SphereGeometry(0.028, 6, 4), BONE, it, { embed: 0.5 });
  const front = choker.items[6].at;
  skull([front.x, front.y - 0.1, front.z + 0.05], 0.045, chest, 1, true);

  const skullPart = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    at: [0, 2.33, 0.5],
    scale: [0.2, 0.17, 0.2],
    bone: head,
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    at: [0, 2.26, 0.7],
    scale: [0.15, 0.095, 0.14],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: [0, 2.28, 0.83], scale: [0.085, 0.05, 0.05], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 5, 4), DARK, { at: [s * 0.032, 2.275, 0.872], bone: head });
    // cheekbone, brow, eyes
    b.part(new THREE.SphereGeometry(0.06, 7, 5), SKIN, { at: [s * 0.13, 2.27, 0.63], bone: head });
    b.capsule([s * 0.01, 2.40, 0.7], [s * 0.17, 2.435, 0.64], 0.042, SKIN, { bone: head, sides: 6 });
    b.part(new THREE.SphereGeometry(0.036, 7, 5), DARK, { at: [s * 0.085, 2.335, 0.675], bone: head });
    glow(b.part(new THREE.SphereGeometry(0.025, 7, 5), EYE, { at: [s * 0.085, 2.335, 0.69], bone: head }), 0.9);
    b.part(new THREE.SphereGeometry(0.011, 5, 4), PUPIL, { at: [s * 0.085, 2.335, 0.712], bone: head });
    // war paint
    b.decal(skullPart, WARPAINT, {
      at: [s * 0.14, 2.3, 0.62],
      dir: [s * 0.5, 0, 0.85],
      size: [0.1, 0.12],
      mirror: s > 0,
    });
    // ears with ring
    const ear: OutlinePoint[] = [
      [0, 0.04],
      [0.1, 0.1],
      [0.28, 0.22, "sharp"],
      [0.2, 0.04],
      [0.08, -0.06],
    ];
    b.extrude(ear, {
      at: [s * 0.18, 2.36, 0.5],
      x: [s, 0, -0.45],
      thickness: 0.025,
      bevel: 0.006,
      color: SKIN,
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.035, 0.008, 5, 10), BRASS, {
      at: [s * 0.3, 2.34, 0.43],
      dir: [0, 0, 1],
      axis: "z",
      bone: head,
    });
    // tusks rising from the lower jaw
    const tusk = bezier(
      [s * 0.1, 2.09, 0.76],
      [s * 0.15, 2.17, 0.86],
      [s * 0.18, 2.28, 0.86],
      [s * 0.14, 2.4, 0.82],
    );
    b.sweep(tusk, [0.036, 0.004], {
      bone: jaw,
      color: gradient(BONE_D, "#f4ecd2", [0, 2.1, 0.78], [0, 2.4, 0.84]),
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
    b.part(new THREE.TorusGeometry(0.029, 0.011, 5, 8), BRASS, {
      at: tusk.at(0.4),
      dir: tusk.tangentAt(0.4),
      axis: "z",
      bone: jaw,
    });
    // braided beard cord with a bead
    b.sweep(
      catmull([
        [s * 0.05, 2.08, 0.82],
        [s * 0.06, 1.98, 0.85],
        [s * 0.07, 1.86, 0.85],
      ]),
      0.016,
      { color: HAIR, bone: jaw, sides: 6 },
    );
    b.part(new THREE.SphereGeometry(0.03, 6, 4), BONE, { at: [s * 0.07, 1.84, 0.85], bone: jaw });
  }
  // brow band (leather with bone studs)
  const bandPts: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    bandPts.push([0.182 * Math.cos(a), 2.42, 0.5 + 0.186 * Math.sin(a)]);
  }
  b.sweep(catmull(bandPts, { closed: true }), 0.014, { color: BELT, bone: head });
  for (const a of [-60, -30, 0, 30, 60]) {
    const r = (a * Math.PI) / 180;
    b.spike([0.185 * Math.sin(r), 2.42, 0.5 + 0.19 * Math.cos(r)], [Math.sin(r), 0.2, Math.cos(r)], 0.05, 0.016, {
      color: BONE,
      bone: head,
      sides: 6,
    });
  }
  // nose ring
  b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), BRASS, { at: [0, 2.235, 0.885], bone: head });
  // mouth cavity, lower jaw, tongue, teeth
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, { at: [0, 2.17, 0.7], scale: [0.12, 0.045, 0.11], bone: head });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { at: [0, 2.1, 0.7], scale: [0.14, 0.07, 0.15], bone: jaw });
  b.part(new THREE.SphereGeometry(1, 6, 4), TONGUE, { at: [0, 2.13, 0.66], scale: [0.065, 0.02, 0.1], bone: jaw });
  for (let i = -3; i <= 3; i++)
    b.spike([i * 0.034, 2.16, 0.8 - 0.0045 * i * i], [0, 1, 0.1], 0.045, 0.012, {
      color: TEETH,
      bone: jaw,
      sides: 5,
    });
  for (const s of [1, -1])
    for (const k of [0.05, 0.11])
      b.spike([s * k, 2.185, 0.78 - k * 0.2], [0, -1, 0.1], 0.04, 0.011, { color: TEETH, bone: head, sides: 5 });
  void muzzle;

  // mohawk
  const crown = catmull([
    [0, 2.45, 0.64],
    [0, 2.5, 0.5],
    [0, 2.45, 0.36],
    [0, 2.4, 0.32],
  ]);
  const blade = (h: number): OutlinePoint[] => [
    [-0.05, 0],
    [0.07, 0],
    [0.045, h * 0.45],
    [0.1, h, "sharp"],
  ];
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const at = crown.at(t);
    const h = 0.12 + 0.22 * Math.sin(Math.PI * (0.12 + 0.76 * t));
    b.extrude(blade(h), {
      at: [at.x, at.y - 0.03, at.z],
      x: [0, 0, -1],
      thickness: 0.035,
      bevel: 0.006,
      color: MOHAWK,
      bone: head,
    });
  }
  const nape = catmull([
    [0, 2.38, 0.31],
    [0, 2.25, 0.25],
    [0, 2.12, 0.14],
  ]);
  for (let i = 0; i < 5; i++) {
    const at = nape.at(i / 4);
    b.extrude(blade(0.2 - i * 0.025), {
      at: [at.x, at.y - 0.03, at.z],
      x: [0, 0, -1],
      thickness: 0.035,
      bevel: 0.006,
      color: MOHAWK,
      bone: neck.joints[1],
    });
  }

  // ---------------------------------------------------------------- helpers for bone fetishes
  function skull(c: number[], r: number, bone: Joint, f = 1, eyes = true) {
    const [x, y, z] = c;
    b.part(new THREE.SphereGeometry(r, 8, 6), BONE, { at: c, bone, scale: [1, 0.95, 1.05] });
    b.part(new THREE.BoxGeometry(r * 1.1, r * 0.55, r * 0.9), BONE, { at: [x, y - 0.75 * r, z + f * 0.3 * r], bone });
    b.part(new THREE.BoxGeometry(r * 0.85, r * 0.2, r * 0.12), TEETH, {
      at: [x, y - 0.98 * r, z + f * 0.72 * r],
      bone,
    });
    b.part(new THREE.SphereGeometry(r * 0.1, 4, 3), DARK, { at: [x, y - 0.35 * r, z + f * 0.95 * r], bone });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(r * 0.3, 6, 4), DARK, { at: [x + s * 0.4 * r, y - 0.02 * r, z + f * 0.78 * r], bone });
      if (eyes)
        glow(
          b.part(new THREE.SphereGeometry(r * 0.14, 5, 4), GLOWG, {
            at: [x + s * 0.4 * r, y - 0.02 * r, z + f * 0.9 * r],
            bone,
          }),
          1.2,
        );
    }
  }
  const boneRod = (a: number[], c: number[], r: number, bone: Joint) => {
    b.rod(a, c, r, BONE, { bone, sides: 6 });
    for (const e of [a, c]) b.part(new THREE.SphereGeometry(r * 1.7, 6, 4), BONE, { at: e, bone });
  };
  const fetish = (p: THREE.Vector3, bone: Joint) => {
    const top = pt(p, 0, -0.12, 0);
    const bot = pt(p, 0, -0.3, 0);
    b.rod(p, top, 0.006, BELT, { bone, sides: 4 });
    boneRod(top, bot, 0.02, bone);
    for (const dy of [-0.16, -0.2, -0.24])
      b.part(new THREE.TorusGeometry(0.026, 0.008, 5, 8), BELT, {
        at: pt(p, 0, dy, 0),
        dir: [0, 1, 0],
        axis: "z",
        bone,
      });
    b.cards(
      [-0.02, 0.02].map((dx) => frame(pt(p, dx, -0.3, 0), [0, 1, 0])),
      FEATHER,
      { size: [0.05, 0.16], lean: 180, flow: [0, 0, 1], bone },
    );
  };

  // ---------------------------------------------------------------- belt, loincloth, sash
  const belt = skin.loop(frame([0, 1.22, -0.05], [0, 1, 0]), { lift: 0.03 });
  b.sweep(belt, 0.045, { color: BELT, bone: hips });
  const bp = (t: number) => belt.at(t);
  skull(pt(bp(0), 0, 0, 0.08), 0.09, hips, 1, true);
  for (const t of [0.09, 0.91]) skull(pt(bp(t), 0, -0.02, 0.05), 0.05, hips, 1, true);
  for (const t of [0.22, 0.78]) fetish(bp(t), hips);
  for (const t of [0.04, 0.14, 0.34, 0.86, 0.96, 0.66])
    b.spike(bp(t), [0, -1, 0.1], 0.14, 0.02, { color: BONE, bone: hips, sides: 6 });
  const flap: OutlinePoint[] = [
    [-0.2, 0],
    [0.2, 0],
    [0.19, -0.34, "sharp"],
    [0.1, -0.27],
    [0, -0.42, "sharp"],
    [-0.1, -0.27],
    [-0.19, -0.34, "sharp"],
  ];
  b.extrude(flap, { at: pt(bp(0), 0, 0, -0.01), x: [1, 0, 0], y: [0, 1, 0.25], thickness: 0.03, color: LEATHER, bone: hips });
  b.extrude(flap, { at: pt(bp(0.5), 0, 0, 0.01), x: [-1, 0, 0], y: [0, 1, -0.25], thickness: 0.03, color: LEATHER, bone: hips });
  b.part(new THREE.BoxGeometry(0.11, 0.13, 0.07), LEATHER, { at: pt(bp(0.3), 0.05, -0.1, 0), bone: hips });
  b.part(new THREE.BoxGeometry(0.115, 0.04, 0.075), BELT, { at: pt(bp(0.3), 0.05, -0.05, 0), bone: hips });

  // bandolier of fangs with beads
  const sashPath = skin.drape(
    catmull(
      [
        [0.38, 2.08, 0.28],
        [0.15, 1.9, 0.5],
        [-0.15, 1.6, 0.52],
        [-0.45, 1.3, 0.35],
        [-0.5, 1.35, -0.05],
        [-0.2, 1.65, -0.28],
        [0.2, 1.95, -0.25],
      ],
      { closed: true },
    ),
    { lift: 0.02 },
  );
  b.sweep(sashPath, 0.03, { color: LEATHER });
  b.along(sashPath, 14, (at) => b.part(new THREE.SphereGeometry(0.03, 6, 4), BONE, { frame: at }));
  b.along(sashPath, 7, (at) => b.spike(at, [0, -1, 0.15], 0.11, 0.022, { color: BONE, sides: 6 }), {
    from: 0.08,
    to: 0.42,
  });

  // crossed bones with a skull on the back
  boneRod([0.32, 2.0, -0.16], [-0.32, 1.5, -0.37], 0.028, chest);
  boneRod([-0.32, 2.0, -0.16], [0.32, 1.5, -0.37], 0.028, chest);
  skull([0, 1.75, -0.34], 0.07, chest, -1, true);

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.34;
    const pts = limb([s * 0.28, 1.12, -0.04], [x, 0.14, 0.05], [0.55, 0.55], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [x, 0, 0.12],
    });
    const ankle = leg.joints[2];
    b.sweep(leg, [0.23, 0.2, 0.16, 0.15, 0.115], { color: SKIN });
    b.part(new THREE.SphereGeometry(0.15, 8, 6), SKIN, {
      at: [pts[1].x, pts[1].y, pts[1].z + 0.08],
      scale: [0.95, 0.9, 0.85],
    });
    b.sweep(
      leg,
      (t) => 0.182 - 0.1 * (t - 0.55),
      { from: 0.55, to: 0.82, color: LEATHER, caps: "flat" },
    );
    b.sweep(leg, 0.135, { from: 0.9, to: 0.98, color: BELT, caps: "flat" });
    b.ring(leg.at(0.94), { count: 8, radius: 0.125 }, (it) => b.spike(it, it, 0.05, 0.014, { color: BONE, sides: 5 }));
    // foot and toes
    b.sweep(
      [
        [x, 0.1, -0.1],
        [x, 0.1, 0.24],
      ],
      () => [0.14, 0.1],
      { bone: ankle, color: SKIN, sides: 8 },
    );
    for (const o of [-0.095, 0, 0.095]) {
      b.sweep(
        [
          [x + o, 0.075, 0.26],
          [x + o * 1.1, 0.065, 0.4],
        ],
        [0.055, 0.045],
        { bone: ankle, color: SKIN, sides: 6 },
      );
      b.spike([x + o * 1.1, 0.06, 0.43], [0, -0.1, 1], 0.09, 0.04, { color: CLAW, bone: ankle, sides: 6 });
    }
  }

  // ---------------------------------------------------------------- arms and hands
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.55, 1.97, 0.16];
    const el = [s * 0.95, 1.5, 0.2];
    const wr = [s * 1.08, 1.0, 0.38];
    const arm = b.chain(`arm${S}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wrist = arm.joints[arm.joints.length - 1];
    b.sweep(arm, [0.19, 0.2, 0.16, 0.17, 0.15], { color: SKIN });
    const bracer = b.sweep(arm, (t) => 0.188 - 0.03 * (t - 0.62), {
      from: 0.62,
      to: 0.9,
      color: LEATHER,
      caps: "flat",
    });
    for (const t of [0.66, 0.86])
      for (const a of [0, 90, 180, 270])
        b.stick(new THREE.SphereGeometry(0.016, 5, 4), BRASS, bracer.at(t, a), { embed: 0.4 });
    b.spike([s * 1.07, 1.5, 0.12], [s, 0.3, -0.4], 0.2, 0.06, { color: BONE, sides: 6 });

    // pauldron
    const pc = new THREE.Vector3(s * 0.62, 2.0, 0.16);
    const v = new THREE.Vector3(s * 0.55, 1, 0.1).normalize();
    b.lathe(
      [
        [0, 0],
        [0.27, 0],
        [0.29, 0.03],
        [0.24, 0.13],
        [0.13, 0.2],
        [0, 0.22],
      ],
      { at: pc, axis: v, segments: 12, color: LEATHER },
    );
    b.part(new THREE.TorusGeometry(0.285, 0.022, 5, 14), BONE, {
      at: pc.clone().addScaledVector(v, 0.02),
      dir: v,
      axis: "z",
    });
    b.ring(frame(pc.clone().addScaledVector(v, 0.09), v), { count: 6, radius: 0.2, tilt: 40 }, (it) =>
      b.spike(it, it, 0.2, 0.045, { color: BONE, sides: 6 }),
    );
    b.spike(pc.clone().addScaledVector(v, 0.18), v, 0.24, 0.055, { color: BONE, sides: 6 });
    b.cards(
      [-1, 0, 1].map((k) => frame([s * 0.9, 1.97, 0.16 + k * 0.11], [0, 1, 0])),
      FEATHER,
      { size: [0.09, 0.32], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: R },
    );

    // hand: palm, knuckles, fingers, thumb
    b.sweep(
      [
        [s * 1.1, 1.02, 0.38],
        [s * 1.1, 0.86, 0.42],
      ],
      () => [0.15, 0.075],
      { bone: wrist, color: SKIN, sides: 8 },
    );
    for (let i = 0; i < 4; i++) {
      const fx = s * 1.1 + (i - 1.5) * 0.075;
      const f = b.chain(
        `finger${i}${S}`,
        [
          [fx, 0.84, 0.42],
          [fx, 0.7, 0.5],
          [fx, 0.6, 0.47],
        ],
        { parent: wrist, names: [`f${i}${S}a`, `f${i}${S}b`], role: "digit" },
      );
      b.sweep(f, [0.045, 0.038, 0.03], { color: SKIN, sides: 6 });
      b.part(new THREE.SphereGeometry(0.05, 6, 4), SKIN, { at: [fx, 0.85, 0.44], bone: wrist });
      b.spike(f.at(1), [0, -0.8, 0.3], 0.08, 0.03, { color: CLAW, sides: 5 });
    }
    const th = b.chain(
      `thumb${S}`,
      [
        [s * 0.93, 0.95, 0.4],
        [s * 0.9, 0.84, 0.52],
        [s * 0.9, 0.76, 0.58],
      ],
      { parent: wrist, names: [`thumb${S}a`, `thumb${S}b`], role: "digit" },
    );
    b.sweep(th, [0.05, 0.042, 0.032], { color: SKIN, sides: 6 });
    b.spike(th.at(1), [0, -0.6, 0.6], 0.08, 0.032, { color: CLAW, sides: 5 });
  }

  // jaw slightly open for the rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  return b.root;
}
