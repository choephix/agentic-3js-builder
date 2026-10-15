import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Joint } from "../../../../src/skeleton";
import { limb } from "../../../../src/ik";
import { lerp, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { countershade, gradient, grain, mottle, spots, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, chunky swamp troll with big hands, jutting tusks, a flaming mohawk, mossy back and a haul of bone fetishes, painted Warcraft-style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const GREEN = "#5f8f3c";
const GREEN2 = "#47702f";
const BELLY = "#a3b560";
const MUD = "#3d3b21";
const BONE = "#e9dfc0";
const TUSK = "#f1e8c8";
const TUSKTIP = "#d9c795";
const CLAW = "#3a2f22";
const LEATHER = "#5a3a22";
const DARKLEATHER = "#3b2616";
const BRASS = "#c8993a";
const HAIR1 = "#c2301d";
const HAIR2 = "#f08a1d";
const DARKRED = "#6e1c14";
const MOSSC = "#5d7a2c";
const EYE = "#ffd62e";
const BLACK = "#140c08";
const MOUTH = "#5a1d22";
const NOSE = "#35502a";
const WART = "#7ea24b";
const FEATHER = "#2ea6a0";
const FEATHER2 = "#d6402b";
const CORD = "#4a3320";

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const rand = rng(11);

  const SKIN = countershade(mottle(GREEN, GREEN2, { size: 0.18, seed: 3 }), BELLY, { level: -0.15, soft: 0.4 });
  const LEGSKIN = gradient(SKIN, MUD, [0, 0.6, 0], [0, 0.06, 0]);
  const MOSS = mottle(MOSSC, "#3e5a22", { size: 0.08, seed: 9 });
  const WOOD = grain("#6e4c2c", "#4a301a", { size: 0.03, axis: "y" });
  const CLOTH = stripes("#8c3b22", "#d8b45a", { size: 0.07, axis: "x", width: 0.4, wobble: 0.2 });
  const CAP = spots("#c0392b", "#f5ecd0", { size: 0.045, amount: 0.5 });

  const blob = (bone: Joint, at: number[], r: number[], color: string | Paint, extra: { rotation?: number[] } = {}) =>
    b.part(new THREE.SphereGeometry(1, 12, 8), color, { bone, at, scale: r, ...extra });
  const torus = (at: THREE.Vector3 | number[], r: number, tube: number, dir: number[], color: string, bone?: Joint) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 12), color, { at, dir, axis: "z", ...(bone ? { bone } : {}) });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.15, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.15, 0],
      [0, 1.6, 0.18],
      [0, 2.05, 0.32],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const belly1 = spine.joints[0];
  const chestJ = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.05, 0.32],
      [0, 2.25, 0.52],
      [0, 2.33, 0.7],
    ]),
    { parent: chestJ, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.33, 0.7], dir: [0, -0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.26, 0.78], aim: [0, 2.2, 1.1], role: "jaw" });

  // ---------------------------------------------------------------- torso
  b.sweep(neck, [0.27, 0.23, 0.2], { color: SKIN });
  const chest = blob(chestJ, [0, 1.98, 0.3], [0.55, 0.42, 0.45], SKIN);
  const belly = blob(belly1, [0, 1.45, 0.32], [0.5, 0.45, 0.52], SKIN);
  const pelvis = blob(hips, [0, 1.15, 0.02], [0.42, 0.3, 0.36], SKIN);
  const hump = blob(chestJ, [0, 2.15, -0.12], [0.4, 0.3, 0.3], SKIN);

  // ---------------------------------------------------------------- arms and hands
  const wrists: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const S = [s * 0.7, 2.08, 0.22];
    const E = [s * 1.0, 1.55, 0.3];
    const W = [s * 1.0, 1.0, 0.5];
    blob(chestJ, [s * 0.62, 2.1, 0.22], [0.28, 0.27, 0.27], SKIN);
    const arm = b.chain(`arm${sd}`, catmull([S, E, W]), {
      parent: chestJ,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    b.sweep(arm, [0.22, 0.2, 0.17], { color: SKIN });
    const hand = arm.tip!;
    wrists[sd] = hand;
    blob(hand, [s * 1.0, 0.92, 0.55], [0.18, 0.19, 0.16], SKIN);
    for (let i = -1; i <= 1; i++) {
      const x = s * 1.0 + i * 0.075;
      const pts = [
        [x, 0.9, 0.66],
        [x, 0.77, 0.8],
        [x, 0.63, 0.82],
      ];
      const f = b.chain(`finger${i + 1}${sd}`, polyline(pts), {
        parent: hand,
        names: [`finger${i + 1}${sd}a`, `finger${i + 1}${sd}b`],
        role: "digit",
      });
      b.sweep(f, [0.055, 0.045, 0.035], { color: SKIN });
      b.spike([x, 0.64, 0.82], [0, -1, 0.25], 0.1, 0.035, { color: CLAW });
    }
    const th = b.chain(
      `thumb${sd}`,
      polyline([
        [s * 0.85, 0.96, 0.6],
        [s * 0.78, 0.85, 0.7],
        [s * 0.75, 0.76, 0.76],
      ]),
      { parent: hand, names: [`thumb${sd}a`, `thumb${sd}b`], role: "digit" },
    );
    b.sweep(th, [0.055, 0.045, 0.035], { color: SKIN });
    b.spike([s * 0.75, 0.76, 0.76], [0, -1, 0.3], 0.09, 0.033, { color: CLAW });
    // cuffs and bangles
    const armDir = [s * 0.3, -0.53, 0.08];
    torus(lerp(S, E, 0.45), 0.21, 0.035, armDir, LEATHER, chestJ);
    torus([s * 1.0, 1.15, 0.46], 0.175, 0.035, [0, -1, 0.1], LEATHER, hand);
    torus([s * 1.0, 1.05, 0.5], 0.17, 0.03, [0, -1, 0.1], BONE, hand);
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(0.022, 6, 4), BRASS, { at: [s * 1.0 + k * 0.1, 1.15, 0.46 + 0.14 * (1 - Math.abs(k) * 0.4)], bone: hand });
    // shoulder bone spikes
    const sc = [s * 0.62, 2.1, 0.22];
    const dirs: Array<[number[], number]> = [
      [[s * 0.5, 1, 0], 0.3],
      [[s * 0.95, 0.65, 0.2], 0.24],
      [[s * 0.3, 0.9, -0.5], 0.22],
    ];
    for (const [d, len] of dirs) {
      const n = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      b.spike([sc[0] + n.x * 0.24, sc[1] + n.y * 0.24, sc[2] + n.z * 0.24], n, len, 0.055, { color: BONE, bone: chestJ });
    }
    torus([sc[0], sc[1] + 0.08, sc[2]], 0.27, 0.03, [s * 0.4, 1, 0], DARKLEATHER, chestJ);
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = limb([s * 0.3, 1.1, 0], [s * 0.36, 0.11, 0.12], [0.55, 0.55], [[0, 0, 1]]);
    const leg = b.chain(`leg${sd}`, pts, { parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`], role: "leg" });
    b.sweep(leg, [0.27, 0.23, 0.17], { color: LEGSKIN });
    const foot = leg.tip!;
    blob(foot, [s * 0.36, 0.1, 0.2], [0.18, 0.1, 0.28], LEGSKIN);
    for (let i = -1; i <= 1; i++) {
      const x = s * 0.36 + i * 0.1;
      b.capsule([x, 0.075, 0.36], [x * 1.04 - s * 0.01, 0.075, 0.5], 0.058, { color: LEGSKIN, bone: foot });
      b.spike([x, 0.07, 0.54], [0, 0.0, 1], 0.1, 0.038, { color: CLAW, bone: foot });
    }
    const cuffAt = lerp(pts[1], pts[2], 0.72);
    torus(cuffAt, 0.2, 0.035, [0, 1, 0.05], LEATHER);
    const bandAt = lerp(pts[1], pts[2], 0.6);
    torus(bandAt, 0.205, 0.025, [0, 1, 0.05], BONE);
    // knee bone spike
    b.spike([pts[1].x + s * 0.05, pts[1].y, pts[1].z + 0.2], [s * 0.2, 0.2, 1], 0.14, 0.05, { color: BONE });
  }

  // ---------------------------------------------------------------- head
  const skull = blob(head, [0, 2.38, 0.82], [0.27, 0.23, 0.27], SKIN);
  blob(head, [0, 2.29, 1.0], [0.2, 0.13, 0.17], SKIN);
  blob(head, [0, 2.22, 0.98], [0.15, 0.04, 0.14], MOUTH);
  blob(head, [0, 2.31, 1.15], [0.085, 0.06, 0.06], NOSE);
  blob(jaw, [0, 2.17, 0.97], [0.2, 0.09, 0.18], SKIN);
  blob(jaw, [0, 2.14, 1.1], [0.12, 0.07, 0.08], SKIN);
  for (const s of [1, -1]) {
    blob(head, [s * 0.2, 2.28, 0.9], [0.1, 0.1, 0.1], SKIN);
    blob(head, [s * 0.03, 2.3, 1.19], [0.025, 0.02, 0.02], BLACK);
    b.capsule([s * 0.24, 2.48, 0.93], [s * 0.05, 2.44, 1.03], 0.055, { color: GREEN2, bone: head });
    blob(head, [s * 0.11, 2.4, 1.03], [0.055, 0.055, 0.055], BLACK);
    glow(blob(head, [s * 0.11, 2.4, 1.05], [0.04, 0.04, 0.04], EYE), 1.2);
    blob(head, [s * 0.11, 2.4, 1.087], [0.018, 0.026, 0.012], BLACK);
    // tusks
    const x = s * 0.12;
    b.sweep(bezier([x, 2.2, 1.0], [x * 1.25, 2.33, 1.15], [x, 2.52, 1.1]), [0.052, 0.008], {
      color: TUSK,
      bands: [
        [0.7, TUSK],
        [1, TUSKTIP],
      ],
      bone: jaw,
      caps: { start: "flat", end: "point" },
    });
    torus([x * 1.07, 2.26, 1.04], 0.045, 0.012, [0.1, 1, 0.3], BRASS, jaw);
    b.spike([s * 0.08, 2.25, 1.1], [0, -1, 0.1], 0.07, 0.022, { color: TUSK, bone: head });
    // ears
    b.spike([s * 0.25, 2.4, 0.78], [s * 0.6, 2.56, 0.6], null, 0.09, { color: SKIN, bone: head });
    torus([s * 0.33, 2.41, 0.74], 0.045, 0.01, [s, 0, 0.2], BRASS, head);
    torus([s * 0.4, 2.43, 0.7], 0.04, 0.01, [s, 0, 0.2], BRASS, head);
    // side braids
    b.sweep(bezier([s * 0.2, 2.55, 0.7], [s * 0.4, 2.45, 0.6], [s * 0.45, 2.15, 0.55]), [0.032, 0.02], {
      color: DARKRED,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), BONE, { at: [s * 0.45, 2.13, 0.55], bone: head });
  }
  for (let i = -3; i <= 3; i++)
    b.spike([i * 0.045, 2.2, 1.1 - Math.abs(i) * 0.012 - 0.02], [0, 1, 0.05], 0.045, 0.014, { color: BONE, bone: jaw });

  // mohawk
  const crest = catmull([
    [0, 2.55, 0.97],
    [0, 2.63, 0.8],
    [0, 2.58, 0.62],
    [0, 2.47, 0.5],
    [0, 2.44, 0.3],
    [0, 2.46, 0.0],
    [0, 2.38, -0.25],
  ]);
  b.sweep(crest, 0.035, { color: DARKRED, caps: "round", bone: head });
  const MOH = 20;
  for (let i = 0; i < MOH; i++) {
    const t = (i + 0.5) / MOH;
    const p = crest.at(t);
    const len = 0.3 - 0.1 * Math.abs(t - 0.35) + 0.05 * (rand() - 0.5);
    b.spike(p, [0, 1, -0.3 - t * 0.2], len, 0.05, { color: i % 2 ? HAIR2 : HAIR1, bone: t < 0.45 ? head : chestJ });
  }

  // face paint and chest tattoo
  const WARPAINT = svg(
    `<svg viewBox="0 0 100 60"><path d="M8 8 L48 24" stroke="#b02a1c" stroke-width="9" stroke-linecap="round"/><path d="M6 26 L50 38" stroke="#b02a1c" stroke-width="9" stroke-linecap="round"/><path d="M10 44 L46 52" stroke="#e9dfc0" stroke-width="7" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(skull, WARPAINT, { at: [s * 0.17, 2.34, 1.0], dir: [s * 0.5, 0, 1], size: [0.16, 0.1], mirror: s > 0 });
  const RUNE = svg(
    `<svg viewBox="0 0 100 100"><path d="M50 50 m0 0 a6 6 0 1 1 8 6 a14 14 0 1 1 -22 -10 a24 24 0 1 1 40 12" fill="none" stroke="#d3e6a4" stroke-width="6" stroke-linecap="round"/><path d="M50 4 L50 20 M12 78 L26 70 M88 78 L74 70" stroke="#d3e6a4" stroke-width="6" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  b.decal(chest, RUNE, { at: [0, 2.05, 0.74], dir: [0, 0, 1], size: [0.4, 0.4] });

  // ---------------------------------------------------------------- bone necklace
  const neckCord = catmull([
    [0.42, 2.22, 0.5],
    [0.28, 2.0, 0.74],
    [0, 1.88, 0.8],
    [-0.28, 2.0, 0.74],
    [-0.42, 2.22, 0.5],
  ]);
  b.sweep(neckCord, 0.015, { color: CORD, bone: chestJ });
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    if (Math.abs(t - 0.5) < 0.06) continue;
    const p = neckCord.at(t);
    if (i % 2)
      b.part(new THREE.CapsuleGeometry(0.02, 0.1, 3, 6), BONE, { at: [p.x, p.y - 0.07, p.z + 0.01], bone: chestJ });
    else
      b.part(new THREE.ConeGeometry(0.025, 0.1, 6), TUSK, { at: [p.x, p.y - 0.06, p.z + 0.01], bone: chestJ, rotation: [180, 0, 0] });
  }
  blob(chestJ, [0, 1.77, 0.83], [0.075, 0.085, 0.075], BONE);
  blob(chestJ, [0, 1.71, 0.84], [0.05, 0.035, 0.05], BONE);
  for (const s of [1, -1]) blob(chestJ, [s * 0.03, 1.79, 0.89], [0.018, 0.022, 0.012], BLACK);

  // ---------------------------------------------------------------- belt, loincloth, trophies
  const skin = b.surface(belly);
  const belt = skin.loop([0, 1.25, 0.32], { lift: 0.02 });
  b.sweep(belt, 0.045, { color: LEATHER, bone: belly1 });
  const studs = skin.loop([0, 1.25, 0.32], { lift: 0.05 });
  b.along(studs, 16, (at) => b.part(new THREE.SphereGeometry(0.018, 6, 4), BRASS, { at }));
  blob(belly1, [0, 1.25, 0.87], [0.085, 0.095, 0.07], BONE);
  for (const s of [1, -1]) blob(belly1, [s * 0.03, 1.27, 0.93], [0.02, 0.025, 0.012], BLACK);
  b.spike([0, 1.2, 0.9], [0, -1, 0], 0.06, 0.03, { color: BONE, bone: belly1 });
  for (let i = 1; i < 12; i++) {
    if (i === 6) continue;
    const p = belt.at(i / 12);
    const len = 0.1 + 0.04 * (i % 3);
    b.part(new THREE.CapsuleGeometry(0.018, len, 3, 6), i % 2 ? BONE : TUSKTIP, {
      at: [p.x, p.y - 0.08 - len * 0.4, p.z],
      bone: belly1,
    });
  }
  const flap = [
    [-0.2, 0],
    [0.2, 0],
    [0.2, -0.35],
    [0, -0.5, "sharp"],
    [-0.2, -0.35],
  ] as Array<[number, number] | [number, number, "sharp"]>;
  b.extrude(flap, { at: [0, 1.22, 0.84], x: [1, 0, 0], thickness: 0.035, bevel: 0.01, color: CLOTH, bone: belly1 });
  b.extrude(flap, { at: [0, 1.3, -0.4], x: [-1, 0, 0], thickness: 0.04, bevel: 0.01, color: CLOTH, bone: hips });
  for (const k of [-1, 0, 1]) b.part(new THREE.SphereGeometry(0.025, 6, 4), BONE, { at: [k * 0.1, 0.85 + (k === 0 ? -0.0 : 0.1) - 0.07, 0.86], bone: belly1 });

  // ---------------------------------------------------------------- swamp growth
  blob(chestJ, [0.15, 2.4, -0.12], [0.22, 0.09, 0.2], MOSS);
  blob(chestJ, [-0.12, 2.38, -0.2], [0.2, 0.08, 0.18], MOSS);
  blob(chestJ, [-0.7, 2.33, 0.05], [0.2, 0.09, 0.18], MOSS);
  for (const [x, z] of [
    [0.3, -0.22],
    [-0.25, -0.05],
  ]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.024, 0.09, 6), "#e8d9b0", { at: [x, 2.4, z], bone: chestJ });
    b.part(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAP, { at: [x, 2.44, z], bone: chestJ });
  }
  const warts = b.surface([belly, chest, hump, pelvis]).scatter(26, { rng: rng(7), minDist: 0.1 });
  for (const hit of warts) b.stick(new THREE.SphereGeometry(0.025, 6, 4), WART, hit, { embed: 0.4 });

  // ---------------------------------------------------------------- bone totem staff (right hand)
  const grip = wrists.R;
  const px = -1.0;
  const pz = 0.74;
  b.rod([px, 0, pz], [px, 2.6, pz], 0.045, { color: WOOD, bone: grip });
  for (const y of [1.2, 1.5, 1.75, 2.3, 2.5]) torus([px, y, pz], 0.052, 0.016, [0, 1, 0], y > 2 ? HAIR1 : CORD, grip);
  blob(grip, [px, 2.72, pz], [0.1, 0.11, 0.1], BONE);
  blob(grip, [px, 2.65, pz + 0.03], [0.06, 0.04, 0.07], BONE);
  for (const s of [1, -1]) {
    glow(blob(grip, [px + s * 0.04, 2.74, pz + 0.085], [0.025, 0.03, 0.02], "#9dff6a"), 1.5);
    b.sweep(bezier([px + s * 0.08, 2.78, pz], [px + s * 0.2, 2.82, pz], [px + s * 0.22, 2.98, pz]), [0.03, 0.005], {
      color: BONE,
      bone: grip,
      caps: "point",
    });
  }
  b.sweep(bezier([px, 2.62, pz], [px - 0.22, 2.5, pz], [px - 0.28, 2.2, pz]), [0.035, 0], { color: FEATHER, bone: grip, caps: "point" });
  b.sweep(bezier([px, 2.62, pz], [px + 0.2, 2.5, pz], [px + 0.26, 2.22, pz]), [0.035, 0], { color: FEATHER2, bone: grip, caps: "point" });
  b.rod([px - 0.3, 2.35, pz], [px + 0.3, 2.35, pz], 0.022, { color: BONE, bone: grip });
  for (const k of [-0.3, -0.15, 0.15, 0.3]) {
    b.rod([px + k, 2.35, pz], [px + k, 2.2, pz], 0.006, { color: CORD, bone: grip });
    b.part(new THREE.CapsuleGeometry(0.02, 0.09, 3, 6), Math.abs(k) > 0.2 ? BONE : TUSK, { at: [px + k, 2.14, pz], bone: grip });
  }
  b.sweep(
    catmull([
      [px + 0.04, 1.75, pz],
      [px + 0.05, 1.55, pz],
      [px, 1.4, pz],
    ]),
    [0.02, 0],
    { color: HAIR2, bone: grip, caps: "point" },
  );

  return b.root;
}
