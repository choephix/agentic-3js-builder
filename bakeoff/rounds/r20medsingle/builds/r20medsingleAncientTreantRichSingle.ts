import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { countershade, grain, mottle, noise, paint, spots } from "../../../../src/paint";
import type { Part } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import type { Chain } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: gnarled bark body with mossy shoulders, huge twig-fingered hands, glowing amber eyes, antlered crown with a bird's nest, a leafy canopy on its back and a glowing rune carved into a heartwood chest plate.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette: warm hand-painted bark, saturated greens, one teal magic accent, amber eyes.
const BARK = "#6a4426";
const BARK_D = "#3b2415";
const BARK_L = "#a06f3d";
const MOSS = "#6fae2f";
const MOSS_D = "#3f7d2b";
const LEAF1 = "#86c53a";
const LEAF2 = "#4f9a34";
const LEAF3 = "#c7d23a";
const AUTUMN = "#e98a2b";
const AMBER = "#ffb429";
const TEAL = "#43f0c6";
const IVORY = "#e9dcb4";
const BRASS = "#e0b040";
const VINE = "#3f6a25";
const RED = "#d8402f";
const CREAM = "#fff1d6";
const DARK = "#1a0f08";

// Paints: grain streaks, light on top and dark underneath, moss creeping over upward faces.
const MOSS_P = mottle(MOSS, MOSS_D, { size: 0.12, seed: 3 });
const BARK_TOP = grain(BARK_L, BARK, { size: 0.05, axis: "y", seed: 2 });
const BARK_LOW = grain(BARK, BARK_D, { size: 0.05, axis: "y", seed: 4 });
const BARK_P = countershade(BARK_TOP, BARK_LOW, { level: -0.1, soft: 0.7 });
const MOSSY = paint((p, n) => (noise(p, 0.3, 9) + 0.3 * n.y + 0.03 * p.y > 0.9 ? MOSS_P : BARK_P));
const LIMB = paint((p, n) => (noise(p, 0.25, 5) + 0.25 * n.y > 0.9 ? MOSS_P : BARK_P));
const ROOT_P = grain(BARK_D, "#1e120a", { size: 0.04, axis: "y", seed: 6 });
const HEART_P = grain("#e0aa62", "#b57a3a", { size: 0.04, axis: "x", seed: 8 });
const CAP_P = spots(RED, CREAM, { size: 0.045, amount: 0.6, seed: 2 });
const MUSH_P = paint((_p, _n, s) => (s[0] > 0.098 ? CAP_P : "#efe3c2"));

const MUSH: [number, number][] = [
  [0, 0],
  [0.03, 0],
  [0.03, 0.09],
  [0.09, 0.1],
  [0.1, 0.13],
  [0.07, 0.17],
  [0, 0.19],
];

const SHIELD: OutlinePoint[] = [
  [-0.42, 0.3],
  [-0.5, 0.05],
  [-0.38, -0.3],
  [0, -0.45],
  [0.38, -0.3],
  [0.5, 0.05],
  [0.42, 0.3],
  [0, 0.38],
];
const BAND: OutlinePoint[] = [
  [-0.5, 0.12],
  [-0.56, -0.05],
  [-0.3, -0.14],
  [0, -0.18],
  [0.3, -0.14],
  [0.56, -0.05],
  [0.5, 0.12],
  [0, 0.16],
];

const leafTex = (fill: string, hi: string, vein: string) =>
  svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
<path d="M20 63 C1 46 3 15 20 1 C37 15 39 46 20 63Z" fill="${fill}" stroke="${vein}" stroke-width="2"/>
<path d="M20 60 C8 44 9 20 20 6Z" fill="${hi}"/>
<path d="M20 62 L20 8 M20 44 L10 34 M20 44 L30 34 M20 30 L12 21 M20 30 L28 21" stroke="${vein}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`,
    { size: 128 },
  );

const TUFT = svg(
  `<svg viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg">
<path d="M6 40 Q8 20 2 6 Q16 16 20 40Z" fill="${MOSS_D}"/>
<path d="M14 40 Q16 14 14 0 Q28 12 30 40Z" fill="${MOSS}"/>
<path d="M26 40 Q32 18 44 8 Q42 28 38 40Z" fill="${LEAF3}"/>
<path d="M20 40 Q22 22 30 14 Q32 28 34 40Z" fill="${MOSS}"/>
</svg>`,
  { size: 96 },
);

const HANG = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
<path d="M2 64 Q8 34 15 2 Q22 34 30 64Z" fill="${MOSS_D}"/>
<path d="M10 64 Q14 40 16 14 Q20 40 24 64Z" fill="${MOSS}"/>
<circle cx="15" cy="40" r="2.5" fill="${LEAF3}"/>
</svg>`,
  { size: 128 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="60" r="38" stroke="${TEAL}" stroke-width="5" fill="none"/>
<path d="M50 14 L50 106 M50 60 L26 36 M50 60 L74 36 M50 82 L32 66 M50 82 L68 66" stroke="${TEAL}" stroke-width="6" stroke-linecap="round" fill="none"/>
<circle cx="50" cy="60" r="7" fill="${TEAL}"/>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "ancientTreant" });
  const rand = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const leaves = [leafTex(LEAF1, "#a9de58", "#2f6a22"), leafTex(LEAF2, "#6cb94a", "#27561e"), leafTex(AUTUMN, "#f5b34a", "#8a4a14")];
  const leafList = [leaves[0], leaves[0], leaves[1], leaves[1], leaves[2]];

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.45, 0] });
  const SPINE = [
    [0, 1.45, 0],
    [0, 1.95, 0.04],
    [0, 2.45, 0.09],
    [0, 2.92, 0.1],
  ];
  const spine = b.chain("spine", catmull(SPINE), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const NK = [
    [0, 2.92, 0.1],
    [0, 3.1, 0.2],
    [0, 3.28, 0.33],
  ];
  const neck = b.chain("neck", catmull(NK), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 3.28, 0.33], dir: [0, 0.15, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.2, 0.62], aim: [0, 3.17, 1.0], role: "jaw", group: "head" });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: SPINE[0], w: 1.05, h: 0.8 },
      { at: SPINE[1], w: 1.15, h: 0.9 },
      { at: SPINE[2], w: 1.6, h: 1.0 },
      { at: SPINE[3], w: 1.9, h: 0.9 },
    ],
    { bone: [hips, spine], color: MOSSY },
  );
  b.sweep(neck, [0.26, 0.22, 0.2], { color: BARK_P });

  // bark ridges running down the trunk
  for (const [i, a] of [20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320, 350].entries())
    b.sweep(torso.line(a, 0.012), (t) => 0.012 + 0.028 * Math.sin(Math.PI * t), {
      color: i % 2 ? BARK_D : BARK_L,
      bone: [hips, spine],
      sides: 5,
    });

  // armour plates of heartwood and bark
  const skinT = b.surface(torso);
  const plate = (y: number, outline: OutlinePoint[], joint: typeof chest, col: typeof HEART_P | string, t: number) => {
    const h = skinT.ray([0, y, 3], [0, 0, -1]);
    const z = h ? h.at.z : 0.5;
    return b.extrude(outline, {
      at: [0, y, z - 0.03],
      x: [1, 0, 0],
      thickness: t,
      bevel: 0.025,
      smoothing: 1,
      color: col,
      bone: joint,
    });
  };
  const chestPlate = plate(2.42, SHIELD, chest, HEART_P, 0.14);
  glow(
    b.decal(chestPlate, RUNE, {
      at: chestPlate.local([0, 0, 0.07]),
      dir: [0, 0, 1],
      size: [0.42, 0.5],
    }),
  );
  plate(1.62, BAND, spine.joints[1], BARK_P, 0.12);
  plate(1.4, BAND, spine.joints[0], BARK_L, 0.1);

  // belt of vine with brass studs and a glowing gem
  const beltPath = skinT.loop(spine.joints[1], { lift: 0.03 });
  b.sweep(beltPath, 0.055, { color: VINE, bone: spine.joints[1] });
  b.along(beltPath, 14, (at) => {
    b.part(new THREE.SphereGeometry(0.04, 5, 4), BRASS, { at });
  });
  const bp = beltPath.at(0);
  b.part(new THREE.SphereGeometry(0.1, 7, 5), BRASS, { at: [bp.x, bp.y, bp.z + 0.02], bone: spine.joints[1], scale: [1, 1, 0.45] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 5), TEAL, { at: [bp.x, bp.y, bp.z + 0.06], bone: spine.joints[1], scale: [1, 1.1, 0.6] }));

  // burls on the trunk
  const burlGeo = new THREE.SphereGeometry(0.07, 6, 4);
  for (const hit of skinT.scatter(18, { rng: rng(3), minDist: 0.25, filter: (h) => Math.abs(h.n.y) < 0.6 }))
    b.stick(burlGeo, BARK_L, hit, { embed: 0.5, scale: [1, 0.6, 1] });

  // root skirt around the hips
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.5, 1.3, Math.sin(a) * 0.4], [Math.cos(a) * 0.5, -1, Math.sin(a) * 0.5], 0.5, 0.09, BARK_D, { bone: hips });
  }

  // mossy collar
  const collar = b.part(new THREE.TorusGeometry(0.44, 0.12, 6, 12), MOSS_P, {
    at: [0, 3.0, 0.13],
    bone: chest,
    rotation: [90, 0, 0],
    scale: [1.35, 1, 1],
  });

  // ---------------------------------------------------------------- legs
  const legR = (t: number) => 0.3 - 0.1 * t;
  const ringOn = (chain: Chain, t: number, radius: number, tube: number, color: string) => {
    const at = chain.at(t);
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 12), color, { at, dir: at, axis: "z" });
  };
  const legTubes: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.45, 1.4, 0], [s * 0.55, 0.26, 0.12], [0.72, 0.72], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    legTubes.push(b.sweep(leg, legR, { color: LIMB }));
    b.part(new THREE.SphereGeometry(0.27, 8, 6), LIMB, { at: pts[1], bone: leg.joints[1], scale: [1, 0.9, 0.95] });
    ringOn(leg, 0.7, legR(0.7) + 0.02, 0.045, VINE);
    ringOn(leg, 0.88, legR(0.88) + 0.02, 0.04, MOSS_D);
    // root-foot
    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), ROOT_P, { at: [s * 0.55, 0.14, 0.2], bone: ankle, scale: [0.3, 0.14, 0.38] });
    [-0.28, 0, 0.28].forEach((dx, i) => {
      b.sprout(`toe${i}${S}`, ankle, [s * (0.55 + dx), 0.05, 0.12 + 0.6 - Math.abs(dx) * 0.5], [0.1, 0.04], {
        role: "digit",
        color: ROOT_P,
      });
    });
    b.sprout(`heel${S}`, ankle, [s * 0.55, 0.05, -0.38], [0.1, 0.04], { role: "digit", color: ROOT_P });
  }
  const legSkin = b.surface(legTubes);
  for (const hit of legSkin.scatter(14, { rng: rng(12), minDist: 0.2, filter: (h) => h.n.y > -0.3 }))
    b.stick(burlGeo, BARK_L, hit, { embed: 0.5, scale: [1, 0.6, 1] });

  // ---------------------------------------------------------------- arms
  const armR = (t: number) => 0.27 - 0.1 * t + 0.12 * Math.max(0, t - 0.55);
  const mossParts: Part[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.95, 2.85, 0.05], [s * 2.4, 2.2, 0.45], [0.95, 0.95], [[0, -1, -0.4]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const hand = arm.joints[2];
    b.sweep(arm, armR, { color: LIMB });
    b.part(new THREE.SphereGeometry(0.25, 8, 6), LIMB, { at: pts[1], bone: arm.joints[1] });
    ringOn(arm, 0.3, armR(0.3) + 0.02, 0.045, VINE);
    ringOn(arm, 0.7, armR(0.7) + 0.02, 0.04, MOSS_D);
    glow(ringOn(arm, 0.82, armR(0.82) + 0.025, 0.03, TEAL));

    // pauldron: bark dome, moss cap, branch stubs and mushrooms
    b.part(new THREE.SphereGeometry(1, 9, 7), BARK_P, { at: [s * 1.08, 3.0, 0], bone: shoulder, scale: [0.5, 0.34, 0.46] });
    const cap = b.part(new THREE.SphereGeometry(1, 9, 6), MOSS_P, { at: [s * 1.08, 3.2, 0], bone: shoulder, scale: [0.42, 0.2, 0.38] });
    mossParts.push(cap);
    for (const z of [-0.25, 0, 0.25])
      b.spike([s * 1.3, 3.1, z], [s * 0.8, 1, 0], 0.38, 0.07, BARK_D, { bone: shoulder });
    const capSurf = b.surface(cap);
    for (const [x, z, k] of [
      [0.9, 0.1, 1.0],
      [1.15, -0.12, 0.7],
      [1.05, 0.22, 0.55],
    ]) {
      const h = capSurf.ray([s * x, 6, z], [0, -1, 0]);
      if (h)
        b.lathe(
          MUSH.map(([px, py]): [number, number] => [px * k, py * k]),
          { at: [h.at.x, h.at.y - 0.02, h.at.z], bone: shoulder, color: MUSH_P, segments: 8 },
        );
    }

    // great twig-fingered hand
    const fwd = pts[2].clone().sub(pts[1]).normalize();
    const hc = pts[2].clone().addScaledVector(fwd, 0.12);
    b.part(new THREE.SphereGeometry(1, 8, 6), BARK_P, { at: hc, bone: hand, dir: fwd, axis: "x", scale: [0.3, 0.16, 0.3] });
    const digits: Array<[number, THREE.Vector3, THREE.Vector3, [number, number], number]> = [];
    [-0.16, -0.05, 0.06, 0.17].forEach((zo, i) => {
      digits.push([
        i,
        hc.clone().addScaledVector(fwd, 0.2).add(V(0, -0.03, zo)),
        fwd.clone().add(V(0, -0.25, zo * 0.6)).normalize(),
        [0.26, 0.22],
        0.35,
      ]);
    });
    digits.push([4, hc.clone().addScaledVector(fwd, 0.05).add(V(0, 0, 0.22)), fwd.clone().multiplyScalar(0.5).add(V(0, -0.1, 1)).normalize(), [0.16, 0.14], 0.3]);
    for (const [i, base, dir, lens, curl] of digits) {
      const p1 = base.clone().addScaledVector(dir, lens[0]);
      const d2 = dir.clone().add(V(0, -curl, 0)).normalize();
      const p2 = p1.clone().addScaledVector(d2, lens[1]);
      const finger = b.chain(`finger${i}${S}`, catmull([base, p1, p2]), {
        parent: hand,
        names: [`finger${i}${S}a`, `finger${i}${S}b`, `finger${i}${S}c`],
        role: "digit",
      });
      b.sweep(finger, i === 4 ? [0.07, 0.035] : [0.08, 0.04], { color: i % 2 ? BARK_P : LIMB });
      b.spike(p2, d2, 0.13, 0.04, BARK_D);
    }
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), BARK_P, { at: [0, 3.42, 0.5], bone: head, scale: [0.36, 0.34, 0.36] });
  const skullSurf = b.surface(skull);
  for (const hit of skullSurf.scatter(14, { rng: rng(5), minDist: 0.14, filter: (h) => h.n.z < 0.5 && h.n.y < 0.8 }))
    b.stick(burlGeo, BARK_L, hit, { embed: 0.5, scale: [0.8, 0.6, 0.8] });
  // heavy brow, slanted
  b.sweep(
    catmull([
      [-0.34, 3.57, 0.62],
      [-0.17, 3.52, 0.82],
      [0, 3.48, 0.85],
      [0.17, 3.52, 0.82],
      [0.34, 3.57, 0.62],
    ]),
    [0.04, 0.07, 0.08, 0.07, 0.04],
    { color: BARK_D, bone: head },
  );
  b.cards(
    [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map((x) => frame([x, 3.58 - Math.abs(x) * 0.1, 0.78 - Math.abs(x) * 0.5], [0, 1, 0])),
    TUFT,
    { size: [0.08, 0.1], lean: 20, flow: [0, 0, -1], vary: 0.3, rng: rand, bone: head },
  );
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 7, 5), DARK, { at: [s * 0.16, 3.43, 0.76], bone: head });
    glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), AMBER, { at: [s * 0.16, 3.43, 0.79], bone: head, scale: [1, 0.7, 0.6] }), 1.4);
    b.part(new THREE.BoxGeometry(0.02, 0.07, 0.01), DARK, { at: [s * 0.16, 3.43, 0.83], bone: head });
  }
  // nose knot, upper jaw, teeth
  b.sweep(
    [
      [0, 3.42, 0.86],
      [0, 3.3, 1.02],
    ],
    [0.08, 0.045],
    { color: BARK_P, bone: head },
  );
  b.frustumBox([0, 3.3, 0.7], [0, 3.28, 1.0], [0.36, 0.12], [0.3, 0.1], { color: BARK_P, bone: head });
  for (const s of [1, -1])
    for (const z of [0.8, 0.9, 0.98])
      b.spike([s * 0.13, 3.25, z], [0, -1, 0], 0.06, 0.018, IVORY, { bone: head });
  // lower jaw with tusks and a mossy beard
  b.frustumBox([0, 3.17, 0.66], [0, 3.15, 0.98], [0.34, 0.12], [0.26, 0.1], { color: BARK_P, bone: jaw });
  for (const s of [1, -1]) {
    b.spike([s * 0.12, 3.19, 0.95], [0, 1, 0], 0.13, 0.026, IVORY, { bone: jaw });
    b.spike([s * 0.1, 3.19, 0.8], [0, 1, 0], 0.07, 0.02, IVORY, { bone: jaw });
  }
  const chin = [-0.16, -0.08, 0, 0.08, 0.16].flatMap((x) => [0.72, 0.86, 0.98].map((z) => frame([x, 3.12, z], [0, 1, 0])));
  b.cards(chin, HANG, { size: [0.1, 0.3], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: jaw });

  // antlers with tines and hanging vines
  const antlerVines: ReturnType<typeof frame>[] = [];
  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.22, 3.62, 0.5],
      [s * 0.42, 4.0, 0.42],
      [s * 0.6, 4.35, 0.45],
      [s * 0.72, 4.7, 0.5],
    ]);
    b.sweep(path, [0.075, 0.03], { color: BARK_P, bone: head });
    for (const t of [0.35, 0.6, 0.85]) {
      const p = path.at(t);
      b.spike(p, [s * 0.6, 0.6, 0.2], 0.28, 0.035, BARK_L, { bone: head });
      b.spike(p, [s * 0.2, 0.5, 0.9], 0.24, 0.03, BARK_L, { bone: head });
      antlerVines.push(frame([p.x, p.y, p.z], [0, 1, 0]));
    }
  }
  b.cards(antlerVines, HANG, { size: [0.08, 0.28], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: head });
  // nest, eggs and a small bird on the crown
  b.part(new THREE.TorusGeometry(0.17, 0.05, 5, 10), "#8a6a3a", { at: [0, 3.77, 0.48], bone: head, rotation: [90, 0, 0], scale: [1, 1.2, 1] });
  for (const [x, z] of [
    [-0.06, 0.44],
    [0.06, 0.5],
    [-0.02, 0.54],
  ])
    b.part(new THREE.SphereGeometry(0.035, 6, 4), "#8fd6e8", { at: [x, 3.8, z], bone: head, scale: [0.8, 1, 0.8] });
  b.part(new THREE.SphereGeometry(0.06, 7, 5), "#d9473a", { at: [0, 3.9, 0.46], bone: head, scale: [1, 0.85, 1.3] });
  b.part(new THREE.SphereGeometry(0.04, 6, 5), "#d9473a", { at: [0, 3.96, 0.54], bone: head });
  b.spike([0, 3.96, 0.57], [0, 0, 1], 0.04, 0.015, AMBER, { bone: head });
  b.spike([0, 3.9, 0.4], [0, 0.3, -1], 0.1, 0.02, "#a8322a", { bone: head });

  // ---------------------------------------------------------------- canopy on the back
  const foliage: Part[] = [];
  const greens = [LEAF2, LEAF1, LEAF2, LEAF3, MOSS_D];
  const clump = (c: [number, number, number], r: number, bone: typeof chest) => {
    foliage.push(
      b.part(new THREE.IcosahedronGeometry(r, 1), greens[Math.floor(rand() * greens.length)], {
        at: c,
        bone,
        flat: true,
        scale: [1, 0.8, 1],
      }),
    );
  };
  const branchDefs: number[][][] = [
    [[0, 2.7, -0.25], [0, 3.3, -0.5], [0, 3.9, -0.5], [0.05, 4.45, -0.4]],
    [[0.45, 2.8, -0.2], [0.8, 3.3, -0.45], [1.15, 3.9, -0.5], [1.5, 4.35, -0.4]],
    [[0.85, 2.95, -0.1], [1.4, 3.3, -0.3], [2.0, 3.6, -0.35], [2.5, 3.75, -0.3]],
  ];
  const sides = [1, -1];
  branchDefs.forEach((def, bi) => {
    for (const s of bi === 0 ? [1] : sides) {
      const path = catmull(def.map(([x, y, z]) => [x * s, y, z]));
      b.sweep(path, [0.17, 0.05], { color: LIMB, bone: chest });
      for (const t of [0.5, 0.75]) {
        const p = path.at(t);
        b.spike(p, [s * 0.5, 1, -0.2], 0.55, 0.06, BARK_P, { bone: chest });
        clump([p.x + s * 0.3, p.y + 0.4, p.z - 0.05], 0.3, chest);
      }
      for (const t of [0.55, 0.8, 1.0]) {
        const p = path.at(t);
        clump([p.x + (rand() - 0.5) * 0.3, p.y + 0.15 + rand() * 0.2, p.z + (rand() - 0.5) * 0.3], 0.34 + 0.2 * t, chest);
      }
    }
  });
  // crown foliage behind the head
  for (const [x, y, z, r] of [
    [-0.3, 3.8, 0.1, 0.25],
    [0.3, 3.8, 0.1, 0.25],
    [0, 3.9, 0.0, 0.3],
  ])
    clump([x, y, z], r, head);

  const leafHits = b.surface(foliage).scatter(380, { rng: rng(21), minDist: 0.1, filter: (h) => h.n.y > -0.2 });
  b.cards(leafHits, leafList, { size: [0.2, 0.3], lean: 50, bend: 25, flow: [0, -1, 0], vary: 0.3, spin: 180, rng: rng(22) });

  // moss tufts on the shoulder caps and collar
  mossParts.push(collar);
  const mossHits = b.surface(mossParts).scatter(90, { rng: rng(31), minDist: 0.08, filter: (h) => h.n.y > 0 });
  b.cards(mossHits, TUFT, { size: [0.14, 0.14], lean: 15, vary: 0.3, spin: 180, rng: rng(32) });
  // vines hanging from the shoulders
  const shoulderVines = [1, -1].flatMap((s) => [0.95, 1.2, 1.45].flatMap((x) => [-0.2, 0.15].map((z) => frame([s * x, 2.78, z], [0, 1, 0]))));
  b.cards(shoulderVines, HANG, { size: [0.1, 0.4], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand });

  return b.root;
}
