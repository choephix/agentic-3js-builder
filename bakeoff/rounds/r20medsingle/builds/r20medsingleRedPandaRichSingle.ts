import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { mottle, noise, paint, spots } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded anime red panda with a big ringed tail, teal scarf and gold trims, balancing on a mossy boulder with a glowing dendro rune, mushrooms and drifting leaf sprites.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#e2582a";
const RED_HI = "#f4873b";
const BELLY = "#4b2326";
const CREAM = "#fff0d4";
const GOLD = cel("#ffcf55", "#d8892f");
const TEAL = cel("#2fd0c0", "#2a8fb0");
const TEAL_DK = cel("#1b9fa8", "#1f6a95");
const LEG = cel("#4a2428", "#2e1524");
const PAW = cel("#2f171d", "#1f1018");
const CREAM_C = cel(CREAM, "#f1c79a");
const NOSE = "#26121f";
const MOSS = mottle("#62b84c", "#93dc5c", { size: 0.06, seed: 6 });
const ROCK = mottle("#9096ab", "#6c718a", { size: 0.09, seed: 4 });

const tailColor = (t: number) => (t > 0.92 ? "#4a2528" : Math.floor(t * 9) % 2 === 0 ? "#f48a3e" : "#c64a22");

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const random = rng(7);

  // ---------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.645, -0.22], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.645, -0.22],
      [0, 0.67, -0.08],
      [0, 0.66, 0.1],
      [0, 0.665, 0.26],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.665, 0.26],
      [0, 0.7, 0.33],
      [0, 0.74, 0.38],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.74, 0.38], dir: [0, -0.08, 1], role: "head" });
  const H = (l: number, u: number, f: number) => head.local({ left: l, up: u, forward: f });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.045, 0.06), aim: H(0, -0.05, 0.15), role: "jaw" });

  const tailPts: number[][] = [
    [0, 0.65, -0.26],
    [0, 0.7, -0.38],
    [0, 0.82, -0.5],
    [0, 0.97, -0.52],
    [0, 1.07, -0.44],
  ];
  const tail = b.chain("tail", catmull(tailPts), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });

  // ---------------------------------------------------------------------------------------------------------
  // The stone (static props ride the root)
  const S = { bone: hips };
  const STONE = cel(
    paint((p, n) => {
      const m = n.y * 0.9 + (noise(p, 0.12, 3) - 0.5) * 0.9 + (p.y - 0.2) * 0.8;
      return m > 0.62 ? MOSS : ROCK;
    }),
  );
  const stone = b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.4, 0.05],
      [0.43, 0.14],
      [0.41, 0.24],
      [0.33, 0.32],
      [0.27, 0.38],
      [0.18, 0.41],
      [0, 0.42],
    ],
    { at: [0, -0.004, 0], segments: 9, color: STONE, name: "stone", ...S },
  );
  const mossCap = b.part(new THREE.SphereGeometry(1, 12, 6), cel(mottle("#6cc04c", "#9be25e", { size: 0.07, seed: 9 })), {
    at: [0, 0.4, 0],
    scale: [0.33, 0.045, 0.29],
    name: "mossCap",
    ...S,
  });
  const rocks: Array<[number, number, number, number, number, number]> = [
    [0.36, 0.2, 0.14, 0.1, 0.12, 0.2],
    [-0.35, 0.12, 0.12, 0.08, 0.13, 0.15],
    [0.1, -0.4, 0.15, 0.08, 0.1, 0.12],
    [-0.22, 0.38, 0.11, 0.07, 0.1, 0.1],
    [-0.15, -0.38, 0.1, 0.07, 0.09, 0.2],
  ];
  for (const [x, z, rx, ry, rz, yaw] of rocks)
    b.part(new THREE.SphereGeometry(1, 6, 4), STONE, {
      at: [x, ry - 0.005, z],
      scale: [rx, ry, rz],
      rotation: [0, yaw * 100, 0],
      flat: true,
      name: "boulder",
      ...S,
    });
  for (let i = 0; i < 7; i++) {
    const a = random() * Math.PI * 2;
    const d = 0.5 + random() * 0.15;
    const r = 0.02 + random() * 0.025;
    b.part(new THREE.SphereGeometry(1, 5, 4), ROCK, {
      at: [Math.cos(a) * d, r * 0.5 - 0.004, Math.sin(a) * d],
      scale: [r * 1.3, r * 0.6, r],
      flat: true,
      name: "pebble",
      ...S,
    });
  }

  // Glowing dendro rune and a crack on the stone
  const RUNE = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#8dffb4" stroke-width="4"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="#4fe08a" stroke-width="2.5"/>
      <path d="M50 20 C70 36 70 62 50 80 C30 62 30 36 50 20Z" fill="none" stroke="#b6ffd0" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 28 L50 74 M50 46 L38 38 M50 58 L62 50" stroke="#8dffb4" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M50 4 L50 12 M50 88 L50 96 M4 50 L12 50 M88 50 L96 50" stroke="#8dffb4" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const CRACK = svg(
    `<svg viewBox="0 0 40 64"><path d="M22 0 L18 14 L26 24 L16 38 L22 50 L18 64 M26 24 L36 30 M16 38 L6 44" fill="none" stroke="#3b3d4f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
  const stoneSkin = b.surface(stone);
  const runeHit = stoneSkin.around([0, 0.2, 0]).at(0, 6);
  if (runeHit) glow(b.decal(stoneSkin, RUNE, { at: runeHit, size: [0.17, 0.17], name: "rune", ...S }), 1.3);
  const crackHit = stoneSkin.around([0, 0.2, 0]).at(-55, 12);
  if (crackHit) b.decal(stoneSkin, CRACK, { at: crackHit, size: [0.1, 0.16], name: "crack", ...S });

  // Cards: moss clumps, grass, flowers
  const GRASS = svg(
    `<svg viewBox="0 0 40 40">
      <path d="M4 40 Q8 18 6 4 Q16 16 14 40Z" fill="#4fa03a"/>
      <path d="M12 40 Q16 14 20 0 Q26 16 24 40Z" fill="#6fc24a"/>
      <path d="M22 40 Q28 20 34 8 Q36 22 32 40Z" fill="#9be065"/>
      <path d="M17 40 Q19 22 20 8" stroke="#b8f080" stroke-width="1.6" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 32 64">
      <path d="M16 64 Q14 48 16 34" stroke="#4fa03a" stroke-width="2.6" fill="none"/>
      <path d="M16 54 Q6 50 4 44 Q12 44 16 52Z" fill="#6fc24a"/>
      <g fill="#ffd1e0"><circle cx="16" cy="22" r="6"/><circle cx="16" cy="38" r="6"/><circle cx="8" cy="30" r="6"/><circle cx="24" cy="30" r="6"/></g>
      <circle cx="16" cy="30" r="5" fill="#ffcf55"/>
    </svg>`,
    { size: 128 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 2 C30 14 30 34 16 46 C2 34 2 14 16 2Z" fill="#8effb0"/><path d="M16 8 L16 44 M16 22 L9 16 M16 32 L23 26" stroke="#2bbf78" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const mossHits = stoneSkin.scatter(60, {
    rng: rng(5),
    minDist: 0.05,
    filter: (h) => h.at.y > 0.22 && h.n.y > 0.1,
  });
  b.cards(mossHits, GRASS, { size: [0.06, 0.06], lean: 20, vary: 0.3, spin: 180, cross: true, rng: rng(15), bone: hips });
  const capHits = b.surface(mossCap).scatter(40, { rng: rng(25), minDist: 0.06, filter: (h) => h.n.y > 0.3 });
  b.cards(capHits, GRASS, { size: [0.05, 0.05], lean: 10, vary: 0.3, spin: 180, cross: true, rng: rng(26), bone: hips });
  const floorFrames = Array.from({ length: 64 }, () => {
    const a = random() * Math.PI * 2;
    const d = 0.44 + random() * 0.2;
    return frame([Math.cos(a) * d, 0, Math.sin(a) * d], [0, 1, 0]);
  });
  b.cards(floorFrames, GRASS, { size: [0.07, 0.09], vary: 0.4, spin: 180, cross: true, rng: rng(16), bone: hips });
  const flowerFrames = Array.from({ length: 9 }, () => {
    const a = random() * Math.PI * 2;
    const d = 0.46 + random() * 0.18;
    return frame([Math.cos(a) * d, 0, Math.sin(a) * d], [0, 1, 0]);
  });
  b.cards(flowerFrames, FLOWER, { size: [0.045, 0.09], vary: 0.3, spin: 180, cross: true, rng: rng(17), bone: hips });

  // Mushrooms on the moss
  const mushroom = (x: number, z: number, r: number, h: number, cap: Paint) => {
    const y = 0.43;
    b.part(new THREE.CylinderGeometry(r * 0.35, r * 0.45, h, 6), CREAM_C, { at: [x, y + h / 2, z], name: "stem", ...S });
    b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), cap, {
      at: [x, y + h, z],
      scale: [1, 0.7, 1],
      name: "cap",
      ...S,
    });
  };
  const CAP = cel(spots("#ff6a55", "#fff3d8", { size: 0.02, amount: 0.5, seed: 2 }));
  mushroom(0.22, -0.02, 0.032, 0.05, CAP);
  mushroom(0.27, 0.08, 0.02, 0.035, CAP);
  mushroom(0.19, 0.1, 0.016, 0.03, CAP);
  for (const [x, z, r, h] of [
    [-0.22, 0.05, 0.03, 0.05],
    [-0.27, -0.04, 0.02, 0.035],
    [-0.19, -0.08, 0.017, 0.028],
  ]) {
    b.part(new THREE.CylinderGeometry(r * 0.35, r * 0.45, h, 6), CREAM_C, { at: [x, 0.43 + h / 2, z], name: "stem", ...S });
    glow(
      b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#3de0c8", {
        at: [x, 0.43 + h, z],
        scale: [1, 0.7, 1],
        name: "glowCap",
        ...S,
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------------------------------------------------------
  // Body
  const COAT = cel(furEdge(mottle(RED, RED_HI, { size: 0.1, contrast: 0.8, seed: 2 }), BELLY, { level: -0.2, teeth: 0.22, period: 0.028 }));
  const bodyTube = b.sweep(spine, (t) => 0.082 + 0.026 * Math.sin(Math.PI * t) + 0.01 * t, { color: COAT, name: "body" });
  b.sweep(neck, [0.078, 0.072], { color: COAT, name: "neckTube" });

  // dorsal tufts
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 C24 20 30 44 26 64 L6 64 C2 44 8 20 16 0Z" fill="#ffffff"/><path d="M16 8 C17 28 17 44 16 64" stroke="#d2d2d2" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const backHits = b.surface(bodyTube).scatter(60, { rng: rng(21), minDist: 0.04, filter: (h) => h.n.y > 0.5 });
  b.cards(backHits, TUFT, { size: [0.04, 0.06], lean: 50, bend: 20, flow: [0, 0, -1], vary: 0.25, rng: rng(22), color: "#f48a3e" });

  // Tail
  const tailTube = b.sweep(tail, [0.045, 0.07, 0.082, 0.07, 0.04], {
    color: cel(paint((_p, _n, s) => tailColor(s[0]))),
    name: "tailTube",
  });
  const tailHits = b.surface(tailTube).scatter(150, { rng: rng(31), minDist: 0.03 });
  const byColor = new Map<string, typeof tailHits>();
  for (const h of tailHits) {
    const c = tailColor(tail.path.closestT(h.at));
    byColor.set(c, [...(byColor.get(c) ?? []), h]);
  }
  for (const [c, hits] of byColor)
    b.cards(hits, TUFT, {
      size: [0.045, 0.075],
      lean: 55,
      bend: 25,
      flow: (f) => tail.path.tangentAt(tail.path.closestT(f.at)),
      vary: 0.25,
      spin: 20,
      rng: rng(32),
      color: c,
    });
  b.sweep(catmull(b.ring(tail.at(0.2), { count: 10, radius: 0.068 }).items, { closed: true }), 0.008, { color: GOLD, name: "tailBand" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: tail.at(0.2).at, bone: tail.joints[0], name: "tailBead" });

  // ---------------------------------------------------------------------------------------------------------
  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fore = b.chain(
      `foreleg${side}`,
      limb([s * 0.08, 0.62, 0.2], [s * 0.09, 0.445, 0.25], [0.1, 0.1], [0, 0, -1]),
      { parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "leg" },
    );
    b.sweep(fore, [0.05, 0.04, 0.034], { color: LEG, name: "foreleg" });
    const hind = b.chain(
      `hindleg${side}`,
      limb(
        [s * 0.08, 0.62, -0.2],
        [s * 0.09, 0.445, -0.25],
        [0.075, 0.075, 0.05],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
      ),
      { parent: spine.joints[0], names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(hind, [0.056, 0.048, 0.04, 0.034], { color: LEG, name: "hindleg" });

    for (const [leg, zc] of [
      [fore, 0.275],
      [hind, -0.225],
    ] as const) {
      const tip = leg.tip!;
      b.part(new THREE.SphereGeometry(1, 8, 6), PAW, { bone: tip, at: [s * 0.09, 0.455, zc], scale: [0.036, 0.024, 0.05], name: "paw" });
      for (const k of [-1, 0, 1]) {
        const x = s * 0.09 + k * 0.02;
        const z = zc + 0.045 - Math.abs(k) * 0.006;
        b.part(new THREE.SphereGeometry(1, 6, 4), PAW, { bone: tip, at: [x, 0.452, z], scale: 0.014, name: "toe" });
        b.spike([x, 0.45, z + 0.008], [0, -0.15, 1], 0.02, 0.005, { color: "#f4e6cc", bone: tip, name: "claw" });
      }
      b.sweep(catmull(b.ring(leg.at(0.82), { count: 8, radius: 0.04 }).items, { closed: true }), 0.006, { color: GOLD, name: "anklet" });
    }
  }

  // ---------------------------------------------------------------------------------------------------------
  // Head
  const hc = H(0, 0, 0.05);
  const FACE = cel(
    paint((p, _n) => {
      const dx = p.x - hc.x;
      const dy = p.y - hc.y;
      const dz = p.z - hc.z;
      const zig = zigzag(dx / 0.024);
      const line = -0.01 + 0.014 * zig + 0.45 * Math.max(0, Math.abs(dx) - 0.05);
      if (dz > -0.03 && dy < line) return CREAM;
      return mottle(RED, RED_HI, { size: 0.07, seed: 3 });
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FACE, { bone: head, at: hc, scale: [0.1, 0.085, 0.09], name: "skull" });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM_C, { bone: head, at: H(0, -0.028, 0.105), scale: [0.05, 0.036, 0.055], name: "muzzle" });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: H(0, -0.02, 0.157), scale: [0.02, 0.014, 0.016], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM_C, { bone: jaw, at: H(0, -0.052, 0.11), scale: [0.032, 0.014, 0.045], name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#ff8aa0", { bone: jaw, at: H(0, -0.046, 0.115), scale: [0.02, 0.006, 0.03], name: "tongue" });

  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#3ccfa0" });
  const TEAR = svg(
    `<svg viewBox="0 0 20 40"><path d="M4 0 Q18 6 12 40 Q8 20 4 0Z" fill="#8a2e18"/></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1]) {
    const eyeHit = skin.around(skull.at).at(s * 36, 6);
    if (eyeHit) b.decal(skin, EYE, { at: eyeHit, size: [0.05, 0.068], mirror: s > 0, name: "eye" });
    const tearHit = skin.around(skull.at).at(s * 42, -24);
    if (tearHit) b.decal(skin, TEAR, { at: tearHit, size: [0.022, 0.05], mirror: s > 0, name: "tear" });

    // ears: red back, cream inner
    const earBase = H(s * 0.068, 0.062, -0.005);
    b.extrude(
      [
        [-0.045, 0],
        [0.045, 0],
        [0.038, 0.05],
        [0, 0.085],
        [-0.038, 0.05],
      ],
      { at: earBase, x: [1, 0, 0], y: [s * 0.5, 1, 0.1], thickness: 0.018, bevel: 0.004, smoothing: 1, color: cel(RED), bone: head, name: "ear" },
    );
    b.extrude(
      [
        [-0.028, 0.008],
        [0.028, 0.008],
        [0.022, 0.04],
        [0, 0.065],
        [-0.022, 0.04],
      ],
      {
        at: H(s * 0.068, 0.062, 0.006),
        x: [1, 0, 0],
        y: [s * 0.5, 1, 0.1],
        thickness: 0.01,
        smoothing: 1,
        color: CREAM_C,
        bone: head,
        name: "earInner",
      },
    );
    // brow spot
    b.part(new THREE.SphereGeometry(1, 6, 4), CREAM_C, { bone: head, at: H(s * 0.05, 0.052, 0.1), scale: [0.013, 0.008, 0.013], name: "browSpot" });
    // fangs and smile
    b.spike(H(s * 0.015, -0.045, 0.14), [0, -1, 0], 0.012, 0.004, { color: "#fffaf0", bone: head, name: "fang" });
    b.rod(H(s * 0.003, -0.04, 0.162), H(s * 0.03, -0.052, 0.15), 0.0025, { color: INK, bone: head, name: "smile" });
    // whiskers
    for (const k of [-1, 0, 1])
      b.rod(H(s * 0.035, -0.03, 0.14), H(s * 0.12, -0.02 + k * 0.02, 0.15), 0.0018, { color: "#fff6e0", bone: head, name: "whisker" });
  }
  const cheekHits = skin.scatter(40, {
    rng: rng(11),
    minDist: 0.02,
    filter: (h) => Math.abs(h.at.x - hc.x) > 0.05 && h.at.y < hc.y - 0.005 && h.n.z > -0.2,
  });
  b.cards(cheekHits, TUFT, {
    size: [0.035, 0.05],
    lean: 70,
    bend: 20,
    flow: (f) => [(f.at.x > hc.x ? 1 : -1) * 0.8, -0.3, -0.7],
    vary: 0.3,
    spin: 15,
    rng: rng(12),
    color: "#fff4dc",
  });

  // ---------------------------------------------------------------------------------------------------------
  // Scarf, gold trim and bell
  const cp = neck.at(0.35).at;
  b.sweep(catmull(b.ring(neck.at(0.35), { count: 12, radius: 0.09 }).items, { closed: true }), 0.022, { color: TEAL, name: "scarf" });
  b.sweep(catmull(b.ring(neck.at(0.47), { count: 12, radius: 0.088 }).items, { closed: true }), 0.007, { color: GOLD, name: "scarfTrim" });
  const K: number[] = [0.04, cp.y - 0.025, cp.z + 0.08];
  b.part(new THREE.SphereGeometry(0.03, 8, 6), TEAL_DK, { bone: neck.joints[0], at: K, name: "scarfKnot" });
  b.extrude(
    [
      [-0.026, 0],
      [0.026, 0],
      [0.022, -0.1],
      [0, -0.125, "sharp"],
      [-0.022, -0.1],
    ],
    { at: [K[0], K[1] - 0.01, K[2] + 0.005], x: [1, 0, 0], y: [0, 1, 0.3], thickness: 0.012, bevel: 0.003, color: TEAL, bone: neck.joints[0], name: "scarfTail" },
  );
  b.extrude(
    [
      [-0.023, -0.085],
      [0.023, -0.085],
      [0.022, -0.1],
      [-0.022, -0.1],
    ],
    { at: [K[0], K[1] - 0.01, K[2] + 0.009], x: [1, 0, 0], y: [0, 1, 0.3], thickness: 0.012, color: GOLD, bone: neck.joints[0], name: "scarfStripe" },
  );
  b.part(new THREE.SphereGeometry(0.016, 8, 6), GOLD, { bone: neck.joints[0], at: [K[0], K[1] - 0.14, K[2] - 0.035], name: "bell" });
  b.rod([K[0], K[1] - 0.14, K[2] - 0.035], [K[0], K[1] - 0.12, K[2] - 0.03], 0.003, { color: GOLD, bone: neck.joints[0], name: "bellCord" });

  // ---------------------------------------------------------------------------------------------------------
  // Dendro sprites: drifting glowing leaves and motes
  const leafFrames = [
    [0.28, 0.78, -0.38],
    [-0.3, 0.95, -0.25],
    [0.34, 0.6, 0.34],
    [-0.3, 0.72, 0.42],
    [0.2, 1.05, -0.2],
    [-0.24, 0.58, -0.4],
  ].map((p) => frame(p, [0, 1, 0]));
  glow(
    b.cards(leafFrames, LEAF, { size: [0.045, 0.07], lean: 40, flow: [1, 0, 0.5], spin: 180, vary: 0.25, rng: rng(41), bone: hips }),
    1.2,
  );
  for (const p of [
    [0.34, 0.9, -0.3],
    [-0.36, 0.8, -0.05],
    [0.3, 0.7, 0.3],
    [-0.14, 1.0, 0.2],
    [0.14, 0.95, 0.35],
    [-0.28, 0.62, -0.3],
  ])
    glow(b.part(new THREE.IcosahedronGeometry(0.012, 0), "#a6ffb8", { bone: hips, at: p, name: "mote" }), 1.4);

  return b.root;
}
