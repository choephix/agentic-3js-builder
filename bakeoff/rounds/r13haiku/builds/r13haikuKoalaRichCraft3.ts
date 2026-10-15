import * as THREE from "three";
import { catmull, createBuilder, limb, noise, rng, smoothstep } from "../../../../src/index";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "koala",
  description: "Pixel-art koala hugging a eucalyptus branch on a plank stand.",
};

// One texel in metres for every pixel texture and box, so all the pixels match.
const TEXEL = 0.012;

const FUR = ["#3b3a37", "#56534c", "#747064", "#938d7e", "#b3ac9a", "#d4cdb9", "#efe8d6"];
const BARK = ["#383a31", "#55594b", "#7c8270", "#a3a88f", "#c9ccb6", "#e6e7d6"];
const WOOD = ["#4a2c18", "#6b4026", "#8a5a33", "#a8703f"];
const NOSE = "#1d1915";
const CLAW = "#2b2521";
const EAR_IN = "#cbbfa3";
const GUM = "#9aa58c";

// Fur: grey-brown with a cream front and a darker underside, dithered in 12 mm cells.
const coat = cellPaint(
  TEXEL,
  (c) => {
    const grain = noise(c.at, 0.06, 3) - 0.5;
    const chest = smoothstep(0.2, 0.9, c.n.z);
    const underside = smoothstep(0.1, -0.7, c.n.y);
    return c.pick(FUR, 0.3 + 0.5 * grain + 0.36 * chest - 0.18 * underside);
  },
  { dither: true },
);

// Eucalyptus bark: smooth grey-green with pale patches and darker scars.
const bark = cellPaint(
  0.014,
  (c) => {
    const drift = noise(c.at, 0.08, 7) - 0.5;
    const scar = smoothstep(0.6, 0.78, noise(c.at, 0.03, 12));
    return c.pick(BARK, 0.62 + 0.5 * drift - 0.4 * scar);
  },
  { dither: true },
);

// Plank texture for the plinth: four dithered planks with dark seams.
const PLANKS = pixelTexture(40, 24, (g) => {
  g.fill((x, y) => {
    if (y % 6 === 0) return "#2b1a0e";
    const plank = Math.floor(y / 6);
    const ring = ((x * 3 + plank * 5) % 11) / 10;
    return pick(WOOD, ring * 0.8 + 0.1, bayer(x, y));
  });
});

// Pixel eye: dark almond with a two-pixel glint.
const EYE = pixelArt(
  [
    "..kkkk..",
    ".kkkkkk.",
    "kkkkkkkk",
    "kwwkkkkk",
    "kwwkkkkk",
    "kkkkkkkk",
    ".kkkkkk.",
    "..kkkk..",
  ],
  { k: "#140f0b", w: "#ffffff" },
);

// Pixel smile under the nose.
const SMILE = pixelArt(["kk....kk", ".kk..kk.", "..kkkk.."], { k: "#1b1714" });

// Eucalyptus leaf: lanceolate, with a midrib.
const LEAF = pixelArt(
  [
    "...l...",
    "..lml..",
    "..mmm..",
    ".mmvmm.",
    "mmmvmmm",
    "mmmvmmd",
    ".mmvmd.",
    ".dmvdd.",
    "..dvd..",
    "...d...",
  ],
  { m: "#8fa898", d: "#56705f", l: "#c4d6c6", v: "#3f5648" },
);

export default function build() {
  const b = createBuilder({ name: "koala" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // Stand: a plank plinth with a eucalyptus branch rising from it.
  b.part(tileBox([0.44, 0.07, 0.44], PLANKS, TEXEL, { rand: rng(4), step: [1, 6] }), "#ffffff", {
    bone: base,
    at: [0, 0.035, 0],
    texture: PLANKS,
  });
  const trunk = b.sweep(
    catmull([
      [0, 0.03, -0.13],
      [0, 0.6, -0.13],
      [0, 1.2, -0.13],
    ]),
    [0.085, 0.06],
    { bone: base, color: bark },
  );
  // A side limb the koala sits on.
  const stub = b.sweep(
    catmull([
      [-0.02, 0.45, -0.1],
      [0.12, 0.45, -0.04],
      [0.3, 0.4, 0.06],
    ]),
    [0.045, 0.028],
    { bone: base, color: bark },
  );

  // Knots on the trunk.
  const trunkSkin = b.surface(trunk);
  const knot = (center: [number, number, number], az: number, el: number, size: number) => {
    const hit = trunkSkin.around(center).at(az, el);
    if (hit) b.stick(new THREE.SphereGeometry(size, 8, 6), bark, hit, { scale: [1, 0.8, 1.3] });
  };
  knot([0, 0.35, -0.13], 100, 0, 0.03);
  knot([0, 1.0, -0.13], -110, 4, 0.026);

  // Skeleton: torso chain from the hips up to the neck, then the head and jaw.
  const torso = b.chain(
    "torso",
    catmull([
      [0, 0.5, 0.1],
      [0, 0.74, 0.08],
      [0, 0.9, 0.08],
      [0, 1.0, 0.09],
    ]),
    { parent: base, names: ["hips", "spine", "neck"], role: "spine" },
  );
  const [hips, spine, neck] = torso.joints;

  // Body: a loft from a small seat up to the shoulders.
  b.loft(
    [
      { at: [0, 0.5, 0.1], w: 0.16, h: 0.14 },
      { at: [0, 0.6, 0.09], w: 0.26, h: 0.26 },
      { at: [0, 0.74, 0.08], w: 0.3, h: 0.28 },
      { at: [0, 0.87, 0.08], w: 0.27, h: 0.25 },
      { at: [0, 0.98, 0.09], w: 0.19, h: 0.18 },
    ],
    { bone: torso, color: coat },
  );

  // Head: a broad round skull with big round ears, a big nose and a closed lower jaw.
  const head = b.joint("head", { parent: neck, at: [0, 1.03, 0.1], dir: [0, 0.15, 1], role: "head" });
  const skull = b.part(new THREE.SphereGeometry(1, 20, 14), coat, {
    bone: head,
    at: head.at,
    scale: [0.13, 0.118, 0.12],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
      bone: head,
      at: head.local({ left: s * 0.095, up: 0.085 }),
      scale: [0.024, 0.07, 0.068],
    });
    b.part(new THREE.SphereGeometry(1, 10, 6), EAR_IN, {
      bone: head,
      at: head.local({ left: s * 0.118, up: 0.085, forward: -0.005 }),
      scale: [0.01, 0.05, 0.047],
    });
  }
  b.part(new THREE.SphereGeometry(1, 10, 8), NOSE, {
    bone: head,
    at: head.local({ forward: 0.112, up: -0.02 }),
    scale: [0.044, 0.034, 0.032],
  });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.05, up: -0.07 }), dir: [0, -0.3, 1], role: "jaw" });
  b.part(new THREE.SphereGeometry(1, 10, 6), coat, { bone: jaw, at: jaw.at, scale: [0.05, 0.022, 0.045] });

  // Face drawings: pixel eyes and a smile, laid onto the skull.
  const skin = b.surface(skull);
  const onHead = (az: number, el: number) => {
    const hit = skin.around(head.at).at(az, el);
    if (!hit) throw new Error(`koala: no head surface at ${az}, ${el}`);
    return hit;
  };
  for (const s of [1, -1])
    b.decal(skin, EYE, { at: onHead(s * 26, 10), dir: [0, 0, 1], size: [0.04, 0.04], mirror: s < 0 });
  b.decal(skin, SMILE, { at: onHead(0, -32), dir: [0, 0, 1], size: [0.03, 0.014] });

  // Legs: thighs forward, feet hanging over the front of the limb, claws hooked on it.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${L}`, limb([s * 0.07, 0.58, 0.06], [s * 0.1, 0.4, 0.15], [0.16, 0.14], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `foot${L}`],
      role: "leg",
    });
    const foot = leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: foot, at: foot.at, scale: [0.042, 0.036, 0.05] });
    for (let i = -1; i <= 1; i++)
      b.spike(foot.local({ left: i * 0.014, forward: 0.02, up: -0.01 }), [0, -0.4, 1], 0.03, 0.0045, { color: CLAW });
  }

  // Arms: out from the shoulders and round the trunk's sides, paws gripping the bark.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${L}`,
      limb([s * 0.1, 0.84, 0.06], [s * 0.1, 0.9, -0.1], [0.14, 0.12], [[s, 0, 0]]),
      { parent: spine, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" },
    );
    const hand = arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: hand, at: hand.at, scale: [0.045, 0.04, 0.05] });
    for (let i = -1; i <= 1; i++)
      b.spike(hand.local({ left: -s * 0.035, up: i * 0.015, forward: -0.01 }), [-s * 0.9, 0, -0.35], 0.04, 0.0045, {
        color: CLAW,
      });
  }

  // Leaves on the branch tips and the top of the trunk, kept off the koala's face and body.
  const leafHits = b
    .surface([trunk, stub])
    .scatter(70, {
      rng: rng(9),
      minDist: 0.028,
      filter: (h) => h.at.y > 1.08 || h.at.x > 0.2 || (h.at.x < -0.07 && h.at.y < 0.7),
    });
  b.cards(leafHits, LEAF, { size: 0.065, lean: 40, vary: 0.3, rng: rng(12), color: "#ffffff" });

  // Gum nuts on the side limb.
  for (const hit of b.surface(stub).scatter(4, { rng: rng(31), minDist: 0.08, filter: (h) => h.at.x > 0.1 }))
    b.stick(new THREE.CylinderGeometry(0.011, 0.008, 0.014, 6), GUM, hit);

  return b.root;
}
