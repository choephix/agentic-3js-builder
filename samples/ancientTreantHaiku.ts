// Ancient treant: a walking tree guardian in the Blizzard/Warcraft manner. Chunky heroic proportions (huge shoulders,
// oversized branch hands, a broad carved face), hand-painted bark with painted light and shadow, saturated moss and
// leaf greens, riveted iron bands, a leather bandolier with gold fittings, and glowing eyes and a heart of sap.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { Paint, countershade, grain, mottle, paint, rgb, smoothstep } from "../src/paint";
import type { ColorInput, Rgb, SurfaceCoords } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A walking tree guardian about 8.9 m tall: a bark giant with moss-crowned shoulders, a leafy canopy, root feet, oversized branch hands, riveted iron bands and glowing green eyes.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

// Flat colours (few, saturated).
const IRON = "#4d5560";
const IRON_LIGHT = "#b9c2cc";
const GOLD = "#e3ad43";
const LEATHER = "#5c3520";
const GLOW_EYE = "#9dffb4";
const GLOW_AMBER = "#ffc65a";
const DARK = "#120a04";
const TOOTH = "#ece2c6";
const CLAW = "#d9cfb2";

// Bark, moss and leaf colours (these feed paints, which do not count as flat colours).
const BARK_A = "#7a5130";
const BARK_B = "#94643a";
const BARK_C = "#5b3b22";
const BARK_CRACK = "#261709";
const MOSS_A = "#7cc23e";
const MOSS_B = "#3b7d28";
const LEAF_DARK = "#2c6e2a";

// The key light: upper front-left. Paints read it to put light and shadow on the bark.
const KEY = new THREE.Vector3(-0.35, 0.8, 0.5).normalize();

function tone(base: ColorInput, p: THREE.Vector3, n: THREE.Vector3, s: SurfaceCoords): Rgb {
  return base instanceof Paint ? base.at(p, n, s) : rgb(base);
}

/** Hand-painted light: a shadow side, a lit side and a bright painted edge facing the key light. */
function sculpt(base: ColorInput, strength = 0.3) {
  return paint((p, n, s) => {
    const [r, g, b] = tone(base, p, n, s);
    const l = n.dot(KEY);
    const f = 1 - strength + 2 * strength * smoothstep(-0.6, 0.8, l) + 0.18 * smoothstep(0.7, 0.95, l);
    const out: Rgb = [Math.min(1, r * f), Math.min(1, g * f), Math.min(1, b * f)];
    return out;
  });
}

// Vertical bark streaks with moss on the upward-facing shoulders and crown.
const trunkPaint = sculpt(
  countershade(mottle(MOSS_A, MOSS_B, { size: 0.5, seed: 3 }), grain(BARK_B, BARK_C, { size: 0.12, axis: "y", seed: 5 }), {
    level: 0.75,
    soft: 0.2,
  }),
);
const woodPaint = sculpt(grain(BARK_A, BARK_CRACK, { size: 0.07, axis: "y", seed: 2 }));
const rootPaint = sculpt(grain(BARK_B, BARK_C, { size: 0.06, axis: "z", seed: 4 }));
const leafPaint = sculpt(mottle(MOSS_B, LEAF_DARK, { size: 0.35, seed: 8 }), 0.35);

/** Leaves drawn in colour: a body, a lit half, a pale midrib and veins. */
const leafGreen = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
<path d="M20 2 C38 18 38 46 20 62 C2 46 2 18 20 2 Z" fill="#63b93c"/>
<path d="M20 2 C30 18 30 46 20 62 C26 46 26 20 20 2 Z" fill="#a7e06a" opacity="0.6"/>
<path d="M20 6 L20 58 M20 20 L10 30 M20 20 L30 30 M20 38 L9 48 M20 38 L31 48" stroke="#2c6e2a" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);
const leafGold = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
<path d="M20 2 C38 18 38 46 20 62 C2 46 2 18 20 2 Z" fill="#d6a23a"/>
<path d="M20 2 C30 18 30 46 20 62 C26 46 26 20 20 2 Z" fill="#f2d27a" opacity="0.6"/>
<path d="M20 6 L20 58 M20 20 L10 30 M20 20 L30 30 M20 38 L9 48 M20 38 L31 48" stroke="#8a5a1c" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);
const tuft = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
<path d="M6 40 Q10 16 3 6 Q20 18 18 40 Z" fill="#4d8a2a"/>
<path d="M22 40 Q24 10 34 2 Q34 22 40 40 Z" fill="#6aa83a"/>
<path d="M40 40 Q46 18 60 12 Q50 26 52 40 Z" fill="#3d7524"/>
</svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "ancientTreant", paintSize: 2048 });

  // Skeleton: hips, a spine chain up the trunk (waist, chest, shoulders, neck), a head and a hinged jaw.
  const hips = b.joint("hips", { at: [0, 2.25, 0] });
  const spine = b.chain("spine", catmull([[0, 2.6, 0], [0, 3.5, 0.02], [0, 4.4, 0.05], [0, 5.1, 0.06]]), {
    parent: hips,
    names: ["waist", "chest", "shoulders", "neck"],
    role: "spine",
  });
  const [waist, chest, shoulders, neck] = spine.joints;
  const head = b.joint("head", { parent: neck, at: [0, 5.7, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 5.62, -0.05], role: "jaw" });

  // Trunk, head and jaw bodies.
  const trunk = b.loft(
    [
      { at: [0, 1.85, 0.02], w: 2.0, h: 1.4 },
      { at: [0, 2.6, 0.02], w: 1.75, h: 1.2 },
      { at: [0, 3.5, 0.03], w: 2.05, h: 1.45 },
      { at: [0, 4.4, 0.05], w: 2.35, h: 1.5 },
      { at: [0, 5.0, 0.06], w: 1.7, h: 1.15 },
      { at: [0, 5.25, 0.07], w: 1.25, h: 0.95 },
    ],
    { bone: spine, color: trunkPaint },
  );
  const headBody = b.loft(
    [
      { at: [0, 5.5, 0.12], w: 1.5, h: 1.1 },
      { at: [0, 5.95, 0.14], w: 2.18, h: 1.32 },
      { at: [0, 6.3, 0.12], w: 1.96, h: 1.16 },
      { at: [0, 6.6, 0.06], w: 1.2, h: 0.83 },
    ],
    { bone: head, color: trunkPaint },
  );
  b.loft(
    [
      { at: [0, 5.55, 0.3], w: 1.0, h: 0.5 },
      { at: [0, 5.3, 0.5], w: 0.75, h: 0.4 },
      { at: [0, 5.15, 0.55], w: 0.5, h: 0.3 },
    ],
    { bone: jaw, color: trunkPaint },
  );

  // Root flares: thick roots wrap the trunk's base on the back half and dive into the ground.
  for (const a of [2.4, 2.9, 3.14, -2.9, -2.4]) {
    b.sweep(
      catmull([
        [Math.sin(a) * 1.0, 1.7, Math.cos(a) * 1.0],
        [Math.sin(a) * 1.3, 0.5, Math.cos(a) * 1.3],
        [Math.sin(a) * 1.7, 0.1, Math.cos(a) * 1.7],
      ]),
      (t) => 0.3 - 0.18 * t,
      { bone: hips, color: rootPaint, caps: { end: "point" } },
    );
  }

  // Face: brow shelf, cheek creases, a nose knot, sunken sockets with glowing eyes, dark carved mouth with teeth.
  const face = b.surface(headBody);
  const onFace = (x: number, y: number) => {
    const hit = face.ray([x, y, 4], [0, 0, -1]);
    if (!hit) throw new Error(`no face at ${x}, ${y}`);
    return hit;
  };
  const brow = [-0.72, -0.42, -0.14, 0.14, 0.42, 0.72].map((x) => onFace(x, 6.2 + 0.16 * (1 - (x / 0.8) ** 2)));
  b.sweep(catmull(brow), 0.12, { bone: head, color: trunkPaint });
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.13, 8, 6).scale(1.2, 0.9, 0.8), trunkPaint, onFace(0.74 * s, 6.22), {
      embed: 0.4,
    });
    b.sweep(
      catmull([onFace(0.62 * s, 6.05), onFace(0.74 * s, 5.85), onFace(0.66 * s, 5.68)]),
      0.03,
      { bone: head, color: woodPaint, caps: { end: "point" } },
    );
    b.stick(new THREE.CylinderGeometry(0.22, 0.24, 0.05, 10), DARK, onFace(0.42 * s, 6.02), { embed: 0.3 });
    b.stick(new THREE.TorusGeometry(0.22, 0.05, 6, 12).rotateX(Math.PI / 2), woodPaint, onFace(0.42 * s, 6.02), {
      embed: 0.25,
    });
    glow(b.stick(new THREE.SphereGeometry(0.12, 10, 8), GLOW_EYE, onFace(0.42 * s, 6.02), { embed: 0.55 }), 2);
  }
  b.stick(new THREE.SphereGeometry(0.16, 8, 6).scale(1, 1.3, 0.9), trunkPaint, onFace(0, 5.9), { embed: 0.4 });
  const mouth = [-0.6, -0.33, 0, 0.33, 0.6].map((x) => onFace(x, 5.66 + 0.12 * x * x));
  b.sweep(catmull(mouth), 0.055, { bone: head, color: DARK });
  for (const x of [-0.45, -0.22, 0, 0.22, 0.45]) {
    const at = onFace(x, 5.62 + 0.12 * x * x);
    b.spike(at, [0, 0.45, 1], 0.14, 0.03, { color: TOOTH });
  }

  // Chest heart: a sap gem in a gold ring, on the trunk's front face.
  const chestFace = b.surface(trunk).ray([0, 3.7, 4], [0, 0, -1]);
  if (!chestFace) throw new Error("no chest face");
  b.stick(new THREE.TorusGeometry(0.26, 0.05, 6, 14).rotateX(Math.PI / 2), GOLD, chestFace, { embed: 0.2 });
  glow(b.stick(new THREE.OctahedronGeometry(0.17, 0), GLOW_AMBER, chestFace, { embed: 0.35 }), 2);

  // Bandolier: a leather strap across the chest with gold buckle plates.
  const strap = b
    .surface(trunk)
    .drape(
      catmull([
        [0.95, 4.3, 0.9],
        [0, 3.25, 1.0],
        [-0.9, 2.2, 0.9],
      ]),
      { lift: 0.03 },
    );
  b.sweep(strap, 0.045, { color: LEATHER });
  const buckle = b.surface(trunk).nearest([0, 3.25, 0.9]);
  b.stick(new THREE.BoxGeometry(0.22, 0.26, 0.05), GOLD, buckle, { embed: 0.3 });

  // Iron bands and gold trim with rivets round the trunk.
  const chestBand = b.surface(trunk).loop(chest, { lift: 0.035 });
  b.sweep(chestBand, 0.05, { color: IRON });
  b.along(chestBand, 22, (at) => b.stick(new THREE.SphereGeometry(0.05, 6, 4), IRON_LIGHT, at, { embed: 0.4 }));
  const waistBand = b.surface(trunk).loop(waist, { lift: 0.03 });
  b.sweep(waistBand, 0.05, { color: GOLD });
  b.along(waistBand, 20, (at) => b.stick(new THREE.SphereGeometry(0.04, 6, 4), GOLD, at, { embed: 0.4 }));
  const neckBand = b.surface(trunk).loop(neck, { lift: 0.03 });
  b.sweep(neckBand, 0.04, { color: IRON });
  b.along(neckBand, 16, (at) => b.stick(new THREE.SphereGeometry(0.045, 6, 4), IRON_LIGHT, at, { embed: 0.4 }));

  // Bark knots scattered over the trunk.
  for (const k of b.surface(trunk).scatter(16, { rng: rng(7), minDist: 0.45, filter: (h) => h.n.y < 0.5 })) {
    b.stick(new THREE.SphereGeometry(0.16, 8, 6).scale(1.2, 0.8, 0.8), woodPaint, k, { embed: 0.5 });
  }

  // Legs: trunk-thick thighs and shins through a knee, root feet splayed on the ground.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const legPts = limb([0.55 * s, 2.25, 0], [0.55 * s, 0.32, 0.02], [1.3, 1.15], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, (t) => 0.55 - 0.2 * t, { color: woodPaint });
    b.part(new THREE.SphereGeometry(0.36, 10, 8), trunkPaint, { bone: leg.joints[1] });
    b.part(new THREE.TorusGeometry(0.34, 0.05, 6, 14).rotateX(Math.PI / 2), GOLD, { bone: leg.joints[1] });
    for (const k of [-0.4, 0, 0.4]) {
      const x = 0.55 * s;
      b.sweep(
        catmull([
          [x, 0.3, 0],
          [x + 0.35 * k, 0.15, 0.4],
          [x + 0.8 * k, 0.07, 0.9],
        ]),
        (t) => 0.22 - 0.14 * t,
        { bone: leg.joints[2], color: rootPaint, caps: { end: "point" } },
      );
    }
  }

  // Arms: long bark limbs, pauldron domes with gold rims and rivets, oversized branch hands.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const armPts = limb([1.35 * s, 4.45, 0], [2.3 * s, 2.3, 0.35], [1.5, 1.35], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: shoulders,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, (t) => 0.46 - 0.16 * t, { color: woodPaint });
    const dome = b.part(new THREE.SphereGeometry(0.7, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), trunkPaint, {
      bone: arm.joints[0],
    });
    b.part(new THREE.TorusGeometry(0.7, 0.06, 6, 16).rotateX(Math.PI / 2), GOLD, { bone: arm.joints[0] });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.05, 6, 4), IRON_LIGHT, {
        bone: arm.joints[0],
        at: [1.35 * s + 0.7 * Math.cos(a), 4.45, 0.7 * Math.sin(a)],
      });
    }
    b.cards(b.surface(dome).scatter(30, { rng: rng(40 + s), minDist: 0.12, filter: (h) => h.n.y > 0.3 }), tuft, {
      size: 0.24,
      lean: 15,
      rng: rng(41 + s),
    });

    const wrist = arm.joints[2];
    b.loft(
      [
        { at: [2.3 * s, 2.2, 0.35], w: 0.36, h: 0.8 },
        { at: [2.34 * s, 1.95, 0.36], w: 0.32, h: 0.9 },
        { at: [2.38 * s, 1.72, 0.37], w: 0.26, h: 0.7 },
      ],
      { bone: wrist, color: woodPaint },
    );
    for (const [i, z] of [-0.3, -0.1, 0.1, 0.28].entries()) {
      const f = b.chain(
        `finger${side}${i}`,
        catmull([
          [2.38 * s, 1.78, z],
          [2.44 * s, 1.4, z + 0.05],
          [2.5 * s, 1.08, z + 0.12],
        ]),
        { parent: wrist, names: [`finger${side}${i}a`, `finger${side}${i}b`, `finger${side}${i}c`], role: "digit" },
      );
      b.sweep(f, (t) => 0.1 - 0.04 * t, { color: woodPaint, caps: { end: "point" } });
      b.part(new THREE.SphereGeometry(0.1, 8, 6), woodPaint, { bone: f.joints[1] });
      b.spike([2.5 * s, 1.08, z + 0.12], [0, -1, 0.15], 0.12, 0.03, { color: CLAW });
    }
    const thumb = b.chain(
      `thumb${side}`,
      catmull([
        [2.36 * s, 2.05, 0.5],
        [2.44 * s, 1.8, 0.66],
        [2.5 * s, 1.5, 0.78],
      ]),
      { parent: wrist, names: [`thumb${side}a`, `thumb${side}b`, `thumb${side}c`], role: "digit" },
    );
    b.sweep(thumb, (t) => 0.12 - 0.05 * t, { color: woodPaint, caps: { end: "point" } });
    b.spike([2.5 * s, 1.5, 0.78], [0, -0.6, 1], 0.12, 0.03, { color: CLAW });
  }

  // Canopy: a leafy crown on the head, two branch limbs with leaf clusters, and a shower of leaf cards.
  const canopy = b.part(new THREE.SphereGeometry(1, 14, 10), leafPaint, {
    bone: head,
    at: [0, 7.25, -0.05],
    scale: [1.5, 1.0, 1.1],
  });
  const crown = b.surface(canopy);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = crown.around([0, 7.25, -0.05]).at(s * 70, 30);
    if (!hit) throw new Error("no canopy hit");
    const branch = b.sprout(
      `branch${side}`,
      hit,
      catmull([
        [s * 1.3, 7.9, -0.1],
        [s * 2.0, 8.3, -0.25],
        [s * 2.5, 8.45, -0.4],
      ]),
      [0.22, 0.06],
      { count: 2, names: [`branch${side}`, `branch${side}Tip`], color: woodPaint },
    );
    b.cards(
      b.surface(branch.sweep).scatter(60, { rng: rng(30 + s), minDist: 0.12, filter: (h) => h.n.y > -0.2 }),
      [leafGreen, leafGold],
      { size: [0.4, 0.5], lean: 40, bend: 20, vary: 0.3, rng: rng(31 + s) },
    );
  }
  b.cards(
    crown.scatter(260, { rng: rng(11), minDist: 0.2, filter: (h) => h.n.y > -0.5 }),
    [leafGreen, leafGold],
    { size: [0.5, 0.62], lean: 30, bend: 25, vary: 0.3, rng: rng(12) },
  );

  // Moss tufts round the root feet.
  const ground = rng(21);
  const tufts = Array.from({ length: 36 }, () => {
    const a = ground() * Math.PI * 2;
    const d = 1.3 + ground() * 1.3;
    return frame([Math.cos(a) * d, 0, Math.sin(a) * d], [0, 1, 0]);
  });
  b.cards(tufts, tuft, { size: 0.5, lean: 90, flow: [1, 0, 0], mirror: true, rng: rng(22), vary: 0.2 });

  return b.root;
}
