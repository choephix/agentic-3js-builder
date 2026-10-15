import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Builder, OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { mix, mottle, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { Chain, Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A towering, hunched swamp troll with huge hands, curved lower tusks, a flaming mohawk and bone fetishes: skull necklace, spiked bracers, belt charms and feathered totems. Mossy hand-painted hide.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette
const SKIN = "#5f8f6a";
const SKIN_D = "#3d6a55";
const BELLY = "#b4b57c";
const BELLY_D = "#8f9a62";
const MOSS = "#4d7a30";
const MUD = "#4a3a24";
const WART = "#8fae6c";
const BONE = "#eadfb8";
const BONE_D = "#b8a47a";
const LEATHER = "#74482a";
const LEATHER_D = "#472c18";
const BRASS = "#d1a23c";
const CLAW = "#2c2a22";
const DARK = "#241c15";
const MOH = "#d23a2a";
const MOH2 = "#f59a2a";
const MOH_D = "#8e1f1c";
const EYE = "#ffd83a";

/** Hand-painted look: lighter on top-facing surfaces, cooler and darker underneath. */
function painted(base: ColorInput, hi: string, lo: string) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const up = smoothstep(0.35, 0.95, n.y);
    const dn = smoothstep(-0.2, -0.9, n.y);
    return mix(mix(c, hi, up * 0.4), lo, dn * 0.45);
  });
}

const SKIN_BASE = paint((p, _n) => {
  const base = mottle(SKIN, SKIN_D, { size: 0.3, seed: 3 });
  return noise(p, 0.45, 9) > 0.68 ? MOSS : base;
});
const SKIN_P = painted(SKIN_BASE, "#9cc58a", "#2c4a48");
const BELLY_BASE = mottle(BELLY, BELLY_D, { size: 0.2, seed: 6 });
const TORSO = painted(
  paint((p, n) => {
    const base = resolve(SKIN_BASE, p, n);
    const bel = resolve(BELLY_BASE, p, n);
    const t = smoothstep(0.1, 0.5, n.z) * (1 - smoothstep(1.95, 2.15, p.y));
    return mix(base, bel, t * 0.9);
  }),
  "#a5cc90",
  "#2c4a48",
);
const LEG_P = paint((p, n) => {
  const c = resolve(SKIN_P, p, n);
  return mix(c, MUD, (1 - smoothstep(0.05, 0.6, p.y)) * 0.8);
});
const LEATHER_P = painted(mottle(LEATHER, LEATHER_D, { size: 0.1, seed: 4 }), "#a27040", "#2a170c");
const BONE_P = painted(mottle(BONE, BONE_D, { size: 0.08, seed: 5 }), "#fff6d8", "#8c7650");
const CLOTH = paint((_p, _n, s) => {
  if (s[1] < -0.38) return Math.abs(Math.floor(s[0] / 0.06)) % 2 === 0 ? "#e0b44a" : "#2c2a28";
  return mix("#8e2a22", "#6a1c18", Math.min(1, Math.max(0, -s[1] * 1.2)));
});

const last = (c: Chain): Joint => c.joints[c.joints.length - 1];

function fetishSkull(b: Builder, c: [number, number, number], r: number, bone: Joint) {
  b.part(new THREE.SphereGeometry(r, 8, 6), BONE_P, { bone, at: c, scale: [0.9, 0.95, 1] });
  b.part(new THREE.BoxGeometry(r * 1.0, r * 0.45, r * 0.9), BONE_P, {
    bone,
    at: [c[0], c[1] - r * 0.85, c[2] + r * 0.25],
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(r * 0.27, 6, 4), DARK, {
      bone,
      at: [c[0] + s * r * 0.4, c[1] - r * 0.05, c[2] + r * 0.8],
    });
  b.part(new THREE.BoxGeometry(r * 0.2, r * 0.3, r * 0.15), DARK, { bone, at: [c[0], c[1] - r * 0.4, c[2] + r * 0.95] });
}

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const random = rng(11);

  // Textures
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 C21 20 31 34 28 64 L4 64 C1 34 11 20 16 0Z" fill="#d23a2a"/><path d="M16 14 C19 26 24 38 22 64 L10 64 C8 38 13 26 16 14Z" fill="#f59a2a"/></svg>`,
    { size: 128 },
  );
  const FEATHER = svg(
    `<svg viewBox="0 0 24 64"><path d="M12 0 C22 14 24 40 12 64 C0 40 2 14 12 0Z" fill="#2f9a8e"/><path d="M12 2 L12 62" stroke="#e8e0b8" stroke-width="2.5"/><path d="M12 0 C17 8 18 18 12 26 C6 18 7 8 12 0Z" fill="#e0b44a"/></svg>`,
    { size: 128 },
  );
  const WAR = svg(
    `<svg viewBox="0 0 64 64"><path d="M14 8 L26 56 M30 6 L40 58 M46 10 L54 54" stroke="#b3261e" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="32" cy="32" r="24" stroke="#b3261e" stroke-width="4" fill="none"/></svg>`,
    { size: 256 },
  );

  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.15, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.15, 0],
      [0, 1.5, 0.1],
      [0, 1.85, 0.2],
      [0, 2.15, 0.28],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.15, 0.28],
      [0, 2.3, 0.42],
      [0, 2.42, 0.6],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.42, 0.6], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.38, 0.74], aim: [0, 2.34, 1.05], role: "jaw" });

  // Torso
  const torso = b.loft(
    [
      { at: [0, 1.1, 0], w: 0.8, h: 0.55 },
      { at: [0, 1.45, 0.1], w: 1.0, h: 0.75 },
      { at: [0, 1.85, 0.2], w: 1.25, h: 0.75 },
      { at: [0, 2.15, 0.28], w: 1.3, h: 0.6 },
    ],
    { bone: [hips, spine], color: TORSO },
  );
  const skin = b.surface(torso);
  b.sweep(neck, [0.27, 0.23, 0.21], { color: SKIN_P });
  b.part(new THREE.SphereGeometry(1, 10, 7), SKIN_P, { bone: chest, at: [0, 2.15, 0.05], scale: [0.5, 0.3, 0.38] });

  // Back spikes, warts, war paint
  b.along(torso, 6, (at) => {
    b.spike(at, at, 0.16, 0.05, BONE_P);
  });
  for (const hit of skin.scatter(22, { rng: rng(3), minDist: 0.14 }))
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), WART, hit, { embed: 0.5 });
  b.decal(torso, WAR, { at: [0, 1.95, 0.6], dir: [0, 0, 1], size: [0.4, 0.4] });

  // Head
  const hc: [number, number, number] = [0, 2.52, 0.72];
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN_P, { bone: head, at: hc, scale: [0.32, 0.28, 0.32] });
  b.frustumBox([0, 2.5, 0.85], [0, 2.47, 1.08], [0.34, 0.2], [0.38, 0.16], { bone: head, color: SKIN_P });
  b.frustumBox([0, 2.33, 0.78], [0, 2.32, 1.06], [0.34, 0.12], [0.42, 0.14], { bone: jaw, color: SKIN_P });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), SKIN_P, { bone: jaw, at: [0, 2.3, 1.05], scale: [1.4, 0.8, 0.9] });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), SKIN_P, { bone: head, at: [0, 2.49, 1.09], scale: [1.3, 0.8, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 5, 4), DARK, { bone: head, at: [s * 0.04, 2.47, 1.18] });
    b.part(new THREE.SphereGeometry(0.055, 6, 5), DARK, { bone: head, at: [s * 0.12, 2.57, 0.95] });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 5), EYE, { bone: head, at: [s * 0.125, 2.57, 0.985] }), 1.2);
    b.part(new THREE.BoxGeometry(0.012, 0.04, 0.01), DARK, { bone: head, at: [s * 0.125, 2.57, 1.018] });
    b.capsule([s * 0.03, 2.6, 1.0], [s * 0.26, 2.66, 0.9], 0.06, SKIN_P, { bone: head });
    b.part(new THREE.SphereGeometry(0.1, 7, 5), SKIN_P, { bone: head, at: [s * 0.2, 2.42, 0.95], scale: [1, 0.7, 1] });
    // ears
    const ear = b.extrude(
      [
        [0, -0.07],
        [0.12, -0.04],
        [0.3, 0.15, "sharp"],
        [0.14, 0.08],
        [0, 0.08],
      ] as OutlinePoint[],
      { at: [s * 0.28, 2.55, 0.62], x: [s, 0, 0], thickness: 0.03, bevel: 0.008, color: SKIN_P, bone: head },
    );
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 6), "#7a3a3a", {
      bone: head,
      at: ear.local([0.14, 0.02, 0.016]),
      dir: [0, 0, 1],
      axis: "y",
    });
    // tusks
    const tp = bezier([s * 0.16, 2.34, 1.0], [s * 0.2, 2.5, 1.16], [s * 0.18, 2.74, 1.1]);
    b.sweep(tp, [0.055, 0], { color: BONE_P, bone: jaw, caps: { start: "flat", end: "point" } });
    b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), BRASS, { bone: jaw, at: tp.at(0.3), dir: tp.tangentAt(0.3), axis: "z" });
    // small upper fangs and lower teeth
    b.spike([s * 0.08, 2.4, 1.07], [0, -1, 0.1], 0.07, 0.02, BONE_P, { bone: head });
    for (let k = 0; k < 3; k++)
      b.spike([s * (0.04 + 0.04 * k), 2.39, 1.02 - 0.06 * k], [0, 1, 0], 0.05, 0.014, BONE_P, { bone: jaw });
    // warts on face
    b.part(new THREE.SphereGeometry(0.022, 5, 4), WART, { bone: head, at: [s * 0.13, 2.66, 0.98] });
  }
  b.part(new THREE.SphereGeometry(0.03, 5, 4), WART, { bone: head, at: [0.03, 2.55, 1.17] });
  // gold earring
  b.part(new THREE.TorusGeometry(0.045, 0.01, 5, 10), BRASS, { bone: head, at: [0.3, 2.47, 0.62], dir: [1, 0, 0], axis: "z" });

  // Mohawk
  const crest = catmull([
    [0, 2.72, 0.88],
    [0, 2.79, 0.68],
    [0, 2.68, 0.44],
    [0, 2.5, 0.3],
    [0, 2.35, 0.25],
    [0, 2.25, 0.2],
  ]);
  const N = 13;
  const fringe: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = crest.at(t);
    const bone = t < 0.5 ? head : neck.joints[1];
    const len = 0.2 + 0.18 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.05));
    const dir = [0, 1, 0.3 - 0.9 * t];
    b.spike(p, dir, len, 0.065, i % 2 ? MOH2 : MOH, { bone });
    for (const s of [1, -1])
      b.spike([p.x + s * 0.05, p.y - 0.01, p.z], [s * 0.35, 1, dir[2]], len * 0.65, 0.04, MOH_D, { bone });
    fringe.push(frame(p, [0, 1, -0.2]));
  }
  b.cards(fringe, TUFT, { size: [0.14, 0.28], lean: 20, flow: [0, 0, -1], cross: true, vary: 0.25, rng: rng(5), bone: head });

  // Necklace of teeth with skull pendant
  const rough = catmull(
    Array.from({ length: 12 }, (_, k) => {
      const a = (k / 12) * Math.PI * 2;
      const fr = Math.max(0, Math.cos(a));
      return [Math.sin(a) * 0.75, 2.12 - 0.33 * fr * fr, 0.25 + Math.cos(a) * 0.7];
    }),
    { closed: true },
  );
  const necklace = skin.drape(rough, { lift: 0.03 });
  b.sweep(necklace, 0.02, LEATHER_P);
  b.along(necklace, 18, (at) => {
    b.spike(at, [0, -1, 0.2], 0.1, 0.022, BONE_P);
  });
  const np = necklace.at(0);
  fetishSkull(b, [np.x, np.y - 0.1, np.z + 0.05], 0.065, chest);

  // Belt, loincloth, belt fetishes
  const belt = skin.loop([0, 1.3, 0.05], { lift: 0.03 });
  b.sweep(belt, 0.04, LEATHER_P);
  b.along(skin.loop([0, 1.3, 0.05], { lift: 0.065 }), 16, (at) => {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { at, bone: hips });
  });
  const f0 = belt.at(0);
  const f1 = belt.at(0.5);
  fetishSkull(b, [f0.x, f0.y, f0.z + 0.07], 0.07, hips);
  const FLAP: OutlinePoint[] = [
    [-0.28, 0],
    [0.28, 0],
    [0.27, -0.5],
    [0.14, -0.42],
    [0, -0.58],
    [-0.14, -0.42],
    [-0.27, -0.5],
  ];
  b.extrude(FLAP, { at: [f0.x, f0.y - 0.05, f0.z + 0.03], x: [1, 0, 0], thickness: 0.04, bevel: 0.01, color: CLOTH, bone: hips });
  b.extrude(FLAP, { at: [f1.x, f1.y - 0.05, f1.z - 0.03], x: [1, 0, 0], thickness: 0.04, bevel: 0.01, color: CLOTH, bone: hips });
  const featherFrames: ReturnType<typeof frame>[] = [];
  [0.12, 0.88, 0.28, 0.72].forEach((t, k) => {
    const p = belt.at(t);
    const end = [p.x, p.y - 0.18, p.z + 0.04];
    b.rod(p, end, 0.012, LEATHER_P, { bone: hips });
    for (let j = 0; j < 3; j++)
      b.capsule(end, [p.x + (j - 1) * 0.07, p.y - 0.42 - 0.04 * j, p.z + 0.06], 0.022, BONE_P, { bone: hips });
    if (k < 2) fetishSkull(b, [p.x, p.y - 0.24, p.z + 0.1], 0.05, hips);
    b.part(new THREE.SphereGeometry(0.025, 6, 4), BRASS, { bone: hips, at: end });
    featherFrames.push(frame([p.x + 0.04, p.y - 0.2, p.z + 0.05], [0, 1, 0]));
  });
  b.cards(featherFrames, FEATHER, { size: [0.07, 0.26], lean: 180, flow: [0, 0, 1], vary: 0.2, rng: rng(8), bone: hips, cross: true });

  // Limbs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // Legs
    const pts = limb([s * 0.38, 1.15, 0], [s * 0.44, 0.2, 0.08], [0.58, 0.52], [[0, 0, 1]]);
    const leg = b.chain(`leg${sd}`, catmull(pts), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
    });
    b.sweep(leg, [0.27, 0.23, 0.18, 0.15], { color: LEG_P });
    const ankle = last(leg);
    b.part(new THREE.BoxGeometry(0.34, 0.14, 0.42), LEG_P, { bone: ankle, at: [s * 0.44, 0.07, 0.1] });
    for (const dx of [-0.11, 0, 0.11]) {
      b.part(new THREE.SphereGeometry(0.065, 6, 5), LEG_P, { bone: ankle, at: [s * 0.44 + dx, 0.07, 0.3] });
      b.spike([s * 0.44 + dx, 0.07, 0.34], [0, -0.1, 1], 0.12, 0.04, CLAW, { bone: ankle });
    }
    const ab = leg.at(0.93);
    b.part(new THREE.TorusGeometry(0.17, 0.035, 6, 12), LEATHER_P, { at: ab, dir: ab, axis: "z" });
    b.part(new THREE.TorusGeometry(0.17, 0.02, 5, 12), BRASS, { at: ab.at.clone().add(new THREE.Vector3(0, 0.06, 0)), dir: ab, axis: "z" });
    const knee = leg.joints[1];
    b.spike(offset(knee.at, [0, 0, 1], 0.17), [0, 0.2, 1], 0.14, 0.055, BONE_P, { bone: knee });
    b.part(new THREE.SphereGeometry(0.1, 7, 5), LEATHER_P, { bone: knee, at: offset(knee.at, [0, 0, 1], 0.14), scale: [1, 1, 0.6] });

    // Arms
    const wp: [number, number, number] = [s * 1.08, 0.95, 0.55];
    const arm = b.chain(
      `arm${sd}`,
      catmull([
        [s * 0.8, 2.08, 0.3],
        [s * 1.05, 1.5, 0.35],
        wp,
      ]),
      { parent: chest, names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`], role: "arm" },
    );
    b.sweep(arm, [0.2, 0.18, 0.21, 0.16], { color: SKIN_P });
    const wrist = last(arm);
    b.part(new THREE.SphereGeometry(1, 9, 7), SKIN_P, { bone: arm.joints[0], at: [s * 0.85, 2.1, 0.3], scale: 0.3 });
    b.spike([s * 1.12, 1.5, 0.2], [s * 0.4, 0.2, -1], 0.2, 0.06, BONE_P, { bone: arm.joints[1] });
    // spiked bracer
    const cp = arm.at(0.78);
    b.part(new THREE.TorusGeometry(0.19, 0.035, 6, 12), BONE_P, { at: cp, dir: cp, axis: "z" });
    b.part(new THREE.TorusGeometry(0.185, 0.04, 6, 12), LEATHER_P, { at: arm.at(0.72), dir: arm.at(0.72), axis: "z" });
    b.ring(cp, { count: 6, radius: 0.18, tilt: 20 }, (it) => {
      b.spike(it, it, 0.09, 0.025, BONE_P);
    });
    // shoulder pad with spikes
    b.part(new THREE.SphereGeometry(1, 10, 7), LEATHER_P, { bone: chest, at: [s * 0.85, 2.32, 0.27], scale: [0.36, 0.2, 0.34] });
    b.part(new THREE.TorusGeometry(0.33, 0.02, 5, 14), BRASS, { bone: chest, at: [s * 0.85, 2.3, 0.27], dir: [s * 0.2, 1, 0], axis: "z" });
    b.ring(frame([s * 0.85, 2.4, 0.27], [s * 0.35, 1, 0.1]), { count: 5, radius: 0.2, tilt: 45 }, (it) => {
      b.spike(it, it, 0.16, 0.045, BONE_P, { bone: chest });
    });
    if (s < 0) fetishSkull(b, [-0.95, 2.52, 0.4], 0.07, chest);
    // hand
    const [wx, wy, wz] = wp;
    b.part(new THREE.BoxGeometry(0.34, 0.3, 0.24), SKIN_P, { bone: wrist, at: [wx, wy - 0.12, wz + 0.03] });
    [-0.11, 0, 0.11].forEach((dx, i) => {
      const x = wx + dx;
      const fc = b.chain(
        `fing${i}${sd}`,
        [
          [x, 0.74, wz + 0.03],
          [x, 0.58, wz + 0.09],
          [x, 0.44, wz + 0.15],
        ],
        { parent: wrist, names: [`fing${i}${sd}a`, `fing${i}${sd}b`], role: "digit" },
      );
      b.sweep(fc, [0.052, 0.042, 0.03], { color: SKIN_P });
      b.part(new THREE.SphereGeometry(0.06, 6, 5), SKIN_P, { bone: wrist, at: [x, 0.76, wz + 0.04] });
      b.spike([x, 0.44, wz + 0.15], [0, -0.7, 0.5], 0.1, 0.03, CLAW, { bone: last(fc) });
    });
    const tx = wx - s * 0.17;
    const th = b.chain(
      `thumb${sd}`,
      [
        [tx, 0.85, wz + 0.03],
        [tx - s * 0.03, 0.72, wz + 0.11],
        [tx - s * 0.01, 0.6, wz + 0.19],
      ],
      { parent: wrist, names: [`thumb${sd}a`, `thumb${sd}b`], role: "digit" },
    );
    b.sweep(th, [0.055, 0.045, 0.032], { color: SKIN_P });
    b.spike([tx - s * 0.01, 0.6, wz + 0.19], [0, -0.7, 0.5], 0.1, 0.03, CLAW, { bone: last(th) });
  }

  void random;
  return b.root;
}
