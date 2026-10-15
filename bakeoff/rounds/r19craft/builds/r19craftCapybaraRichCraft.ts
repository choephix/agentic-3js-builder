// A storybook capybara: barrel body, huge blunt head, sleepy half-lidded eyes, buck teeth and rosy cheeks, with a small
// crested bluebird perched between its ears and a daisy tucked behind one of them. Cel-shaded paints from the toon kit.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { mix, mottle, paint, resolve, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Capybara",
  description:
    "A whimsical storybook capybara with a barrel body, a big blunt head, sleepy half-lidded eyes, buck teeth, rosy cheeks and fur tufts, carrying a small crested bluebird on its head and a daisy behind its ear.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const BROWN_A = "#b9794a";
const BROWN_B = "#a4673e";
const BELLY = "#e8c28c";
const BRIDGE = "#8c5736";
const MUZZLE = "#e8c493";
const BLUSH = "#f2a38a";
const FOOT_DARK = "#6b4330";
const NOSE = "#5e3b2d";
const NOSTRIL = "#1f110c";
const GLOSS = "#d8bdae";
const EYE = "#24150f";
const WHITE = "#ffffff";
const TOOTH = "#ffe8a6";
const WHISKER = "#f5e4c6";
const NAIL = "#2e1b13";
const EAR_IN = "#d98f78";

const BLUE = "#4aa7ee";
const BLUE_D = "#2f6fc4";
const NAVY = "#25418f";
const ORANGE = "#ff9657";
const CREAM = "#fff2d6";
const PINK = "#ffb3a6";
const BEAK = "#ffbb3f";
const BEAK_D = "#e8922c";
const BIRD_LEG = "#f0903a";

const PETAL = "#fffdf2";
const DAISY = "#ffc83a";

const P = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const bodyCoat = furEdge(mottle(BROWN_A, BROWN_B, { size: 0.14, contrast: 0.7, seed: 5 }), BELLY, {
  level: -0.15,
  teeth: 0.2,
  period: 0.035,
  along: [0, 0, 1],
});

const headCoat = paint((p, n) => {
  const ax = Math.abs(p.x);
  const blush = Math.hypot(ax - 0.122, (p.y - 0.5) * 1.3, (p.z - 0.62) * 0.9);
  if (p.z > 0.5 && n.y < 0.6 && blush < 0.032) return BLUSH;
  if (p.z > 0.58 && n.y > 0.45 && ax < 0.028 + 0.012 * zigzag(p.z / 0.035)) return BRIDGE;
  if (p.z > 0.7 && p.y < 0.425) return MUZZLE;
  return bodyCoat;
});

const legCoat = paint((p, n) => mix(resolve(bodyCoat, p, n), FOOT_DARK, smoothstep(0.17, 0.06, p.y)));

const birdCoat = paint((_p, n) => (n.y > 0.3 ? BLUE : n.z > 0.05 ? ORANGE : CREAM));
const birdHeadCoat = paint((p, n) => {
  if (Math.abs(p.x) > 0.02 && p.y < 0.706 && n.z > 0.2 && n.y < 0.5 && p.z > 0.57) return PINK;
  return n.y > 0.25 ? BLUE : CREAM;
});
const wingCoat = paint((_p, _n, s) => (s[0] > 0.092 ? NAVY : s[0] > 0.04 && s[0] < 0.05 ? CREAM : BLUE_D));
const tailCoat = paint((_p, _n, s) => (s[0] > 0.082 ? CREAM : s[0] > 0.03 ? BLUE_D : NAVY));

const COAT = cel(bodyCoat);
const HEAD = cel(headCoat);
const LEGS = cel(legCoat);
const FOOT = cel(FOOT_DARK);
const JAW = cel("#dcb583");
const NOSE_P = cel(NOSE);
const EAR_P = cel(BROWN_A);
const EAR_IN_P = cel(EAR_IN);
const BIRD = cel(birdCoat);
const BIRD_HEAD = cel(birdHeadCoat);
const WING = cel(wingCoat);
const WING_TIP = cel(NAVY);
const TAIL = cel(tailCoat);
const CREST = cel(BLUE_D);

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const TUFT = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M16 0 C20 14 28 34 30 64 L2 64 C4 34 12 14 16 0Z" fill="#ffffff"/>
    <path d="M16 6 C17 24 18 44 17 64" stroke="#d6d6d6" stroke-width="3" fill="none"/>
    <path d="M9 26 C10 40 10 52 9 64 M23 26 C22 40 22 52 23 64" stroke="#e4e4e4" stroke-width="3" fill="none"/>
  </svg>`,
  { size: 128 },
);

const FEATHER: OutlinePoint[] = [
  [0, 0.011],
  [0.04, 0.015],
  [0.085, 0.012],
  [0.11, 0],
  [0.085, -0.012],
  [0.04, -0.015],
  [0, -0.011],
];
const WING_OUT: OutlinePoint[] = [
  [0, 0.03],
  [0.03, 0.04],
  [0.065, 0.034],
  [0.1, 0.012],
  [0.11, -0.008],
  [0.085, -0.03],
  [0.045, -0.04],
  [0.01, -0.03],
];
const PRIMARIES: OutlinePoint[] = [
  [0.07, 0.01],
  [0.13, 0.004],
  [0.165, -0.012],
  [0.135, -0.02],
  [0.09, -0.024],
  [0.06, -0.02],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // ---- Skeleton -------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.37, -0.34], dir: [0, 0.03, 1] });
  type J = typeof hips;

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.34],
      [0, 0.385, -0.04],
      [0, 0.4, 0.24],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.4, 0.24],
      [0, 0.43, 0.33],
      [0, 0.46, 0.42],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.46, 0.42], dir: [0, -0.03, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.37, 0.5], dir: [0, -0.03, 1], role: "jaw" });
  const tail = b.joint("tail", { parent: hips, at: [0, 0.36, -0.5], dir: [0, -0.2, -1], role: "tail" });

  // ---- Body -----------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.37, -0.42], w: 0.24, h: 0.26 },
      { at: [0, 0.375, -0.3], w: 0.4, h: 0.38 },
      { at: [0, 0.385, -0.08], w: 0.44, h: 0.42 },
      { at: [0, 0.395, 0.12], w: 0.44, h: 0.42 },
      { at: [0, 0.405, 0.3], w: 0.38, h: 0.36 },
      { at: [0, 0.415, 0.42], w: 0.27, h: 0.27 },
    ],
    { bone: [hips, spine, neck], color: COAT },
  );

  // stubby tail nub
  b.part(new THREE.SphereGeometry(1, 8, 6), cel("#7d4f35"), { bone: tail, at: P(0, 0.35, -0.56), scale: [0.03, 0.025, 0.035] });

  // ---- Head -----------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 0.46, 0.42], w: 0.26, h: 0.25 },
      { at: [0, 0.475, 0.54], w: 0.28, h: 0.26 },
      { at: [0, 0.47, 0.66], w: 0.25, h: 0.24 },
      { at: [0, 0.455, 0.76], w: 0.23, h: 0.22 },
      { at: [0, 0.445, 0.82], w: 0.22, h: 0.21 },
    ],
    { bone: head, color: HEAD, caps: { start: "round", end: "flat" }, sides: 10 },
  );
  const headSkin = b.surface(skull);

  // jowly cheeks
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 10, 8), HEAD, {
      bone: head,
      at: P(s * 0.1, 0.42, 0.58),
      scale: [0.05, 0.06, 0.075],
    });

  // lower jaw
  b.sweep(
    [
      [0, 0.355, 0.5],
      [0, 0.352, 0.74],
    ],
    (t) => [0.085 - 0.012 * t, 0.036],
    { bone: jaw, color: JAW, sides: 10 },
  );

  // nose pad, nostrils, philtrum, gloss
  b.part(new THREE.SphereGeometry(1, 12, 8), NOSE_P, { bone: head, at: P(0, 0.445, 0.82), scale: [0.108, 0.098, 0.04] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 8, 6), NOSTRIL, {
      bone: head,
      at: P(s * 0.038, 0.485, 0.85),
      scale: [0.015, 0.011, 0.01],
    });
  b.rod(P(0, 0.49, 0.858), P(0, 0.4, 0.856), 0.0035, INK, { bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), GLOSS, { bone: head, at: P(-0.032, 0.505, 0.857), scale: [0.008, 0.006, 0.004] });

  // buck teeth
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.011), TOOTH, { bone: head, at: P(s * 0.0115, 0.33, 0.828) });

  // morrillo bump on the snout
  b.part(new THREE.SphereGeometry(1, 8, 6), cel(BRIDGE), { bone: head, at: P(0, 0.567, 0.74), scale: [0.04, 0.014, 0.05] });

  // smiling mouth lines
  for (const s of [1, -1]) {
    const line = headSkin.drape(
      catmull([
        P(s * 0.09, 0.38, 0.8),
        P(s * 0.11, 0.375, 0.72),
        P(s * 0.12, 0.38, 0.63),
        P(s * 0.115, 0.397, 0.56),
      ]),
      { lift: 0.002 },
    );
    b.sweep(line, 0.0042, INK);
  }

  // whiskers
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++)
      b.rod(P(s * 0.092, 0.4 + k * 0.018, 0.79), P(s * 0.2, 0.395 + k * 0.03, 0.83 - k * 0.03), 0.002, WHISKER, { bone: head });

  // eyes: dark, glossy, half-lidded
  for (const s of [1, -1]) {
    const E = P(s * 0.105, 0.54, 0.64);
    b.part(new THREE.SphereGeometry(0.024, 10, 8), EYE, { bone: head, at: E });
    b.part(new THREE.SphereGeometry(0.0275, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.4), HEAD, {
      bone: head,
      at: P(s * 0.105, 0.5405, 0.639),
      rotation: [15, 0, 0],
    });
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), WHITE, { bone: head, at: P(s * 0.118, 0.542, 0.66) });
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), WHITE, { bone: head, at: P(s * 0.1135, 0.532, 0.6615) });
    // brow ridge
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
      bone: head,
      at: P(s * 0.1, 0.568, 0.64),
      scale: [0.03, 0.01, 0.03],
      rotation: [0, 0, -s * 12],
    });
  }

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: P(s * 0.095, 0.565, 0.465), dir: [s * 0.35, 1, 0], role: "hinge" });
    b.part(new THREE.SphereGeometry(1, 10, 8), EAR_P, {
      bone: ear,
      at: P(s * 0.103, 0.59, 0.468),
      scale: [0.016, 0.045, 0.038],
      rotation: [0, 0, -s * 22],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), EAR_IN_P, {
      bone: ear,
      at: P(s * 0.112, 0.588, 0.472),
      scale: [0.008, 0.032, 0.026],
      rotation: [0, 0, -s * 22],
    });
  }

  // daisy tucked behind the left ear
  {
    const C = P(0.055, 0.585, 0.485);
    for (let i = 0; i < 8; i++) {
      const phi = (i / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(1, 8, 5), PETAL, {
        bone: head,
        at: P(C[0] + 0.017 * Math.cos(phi), C[1], C[2] + 0.017 * Math.sin(phi)),
        scale: [0.016, 0.0045, 0.0075],
        rotation: [0, (-phi * 180) / Math.PI, 0],
      });
    }
    b.part(new THREE.SphereGeometry(1, 8, 6), DAISY, { bone: head, at: P(C[0], C[1] + 0.003, C[2]), scale: [0.011, 0.007, 0.011] });
  }

  // ---- Legs -----------------------------------------------------------------------------------------------
  const paw = (bone: J, cx: number, cz: number, toes: number, w: number) => {
    b.part(new THREE.SphereGeometry(1, 10, 7), FOOT, { bone, at: P(cx, 0.03, cz + 0.02), scale: [w, 0.032, w * 1.35] });
    for (let i = 0; i < toes; i++) {
      const k = toes === 1 ? 0 : i / (toes - 1) - 0.5;
      const tx = cx + k * w * 1.5;
      const tz = cz + 0.02 + w * 1.1 - Math.abs(k) * 0.012;
      b.part(new THREE.SphereGeometry(0.018, 8, 6), FOOT, { bone, at: P(tx, 0.02, tz), scale: [0.9, 0.85, 1.15] });
      b.spike(P(tx, 0.02, tz + 0.01), [0, -0.1, 1], 0.02, 0.0125, { color: NAIL, bone });
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const forePts = limb(P(s * 0.15, 0.3, 0.22), P(s * 0.15, 0.05, 0.25), [0.14, 0.14], [[0, 0, -1]]);
    const fore = b.chain(`fore${side}`, forePts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(fore, [0.07, 0.058, 0.047, 0.044], { color: LEGS });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: fore.joints[0],
      at: P(s * 0.18, 0.31, 0.22),
      scale: [0.07, 0.1, 0.11],
    });
    paw(fore.joints[fore.joints.length - 1], s * 0.15, 0.25, 4, 0.042);

    const hindPts = limb(P(s * 0.17, 0.285, -0.3), P(s * 0.17, 0.05, -0.26), [0.15, 0.14, 0.09], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`hind${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.075, 0.06, 0.048, 0.042, 0.042], { color: LEGS });
    b.part(new THREE.SphereGeometry(1, 12, 8), COAT, {
      bone: hind.joints[0],
      at: P(s * 0.185, 0.29, -0.31),
      scale: [0.085, 0.12, 0.14],
    });
    paw(hind.joints[hind.joints.length - 1], s * 0.17, -0.26, 3, 0.04);
  }

  // ---- Fur tufts ------------------------------------------------------------------------------------------
  const bodySkin = b.surface(body);
  const coatHits = bodySkin.scatter(260, {
    rng: rng(21),
    minDist: 0.075,
    filter: (h) => h.n.y > -0.1 && h.at.z < 0.36,
  });
  b.cards(coatHits, TUFT, {
    size: [0.05, 0.09],
    lean: 72,
    bend: 25,
    vary: 0.25,
    spin: 12,
    rng: rng(22),
    color: bodyCoat,
  });
  const cheekHits = headSkin.scatter(46, {
    rng: rng(31),
    minDist: 0.045,
    filter: (h) => Math.abs(h.n.x) > 0.5 && h.at.z < 0.68 && h.at.y < 0.52,
  });
  b.cards(cheekHits, TUFT, {
    size: [0.035, 0.06],
    lean: 75,
    bend: 20,
    vary: 0.2,
    rng: rng(32),
    color: headCoat,
  });

  // ---- The bird -------------------------------------------------------------------------------------------
  const birdBody = b.joint("birdBody", { parent: head, at: P(0, 0.66, 0.55) });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: P(0, 0.7, 0.575) });
  const birdJaw = b.joint("birdJaw", { parent: birdHead, at: P(0, 0.702, 0.606), dir: [0, -0.05, 1], role: "jaw" });
  const birdTail = b.joint("birdTail", { parent: birdBody, at: P(0, 0.662, 0.505), dir: [0, 0.3, -1], role: "tail" });

  b.part(new THREE.SphereGeometry(1, 10, 8), BIRD, { bone: birdBody, at: P(0, 0.66, 0.55), scale: [0.052, 0.05, 0.063] });
  b.part(new THREE.SphereGeometry(1, 10, 8), BIRD_HEAD, { bone: birdHead, at: P(0, 0.705, 0.58), scale: [0.036, 0.034, 0.036] });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // eyes
    b.part(new THREE.SphereGeometry(0.0075, 6, 5), EYE, { bone: birdHead, at: P(s * 0.029, 0.712, 0.595) });
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), WHITE, { bone: birdHead, at: P(s * 0.033, 0.716, 0.6) });

    // wings
    const wing = b.joint(`birdWing${side}`, {
      parent: birdBody,
      at: P(s * 0.05, 0.68, 0.585),
      dir: [s * 0.3, 0.2, -1],
      role: "wing",
    });
    const wx = [s * 0.12, 0, -0.993];
    b.extrude(WING_OUT, {
      at: P(s * 0.054, 0.665, 0.585),
      x: wx,
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: WING,
      bone: wing,
    });
    b.extrude(PRIMARIES, {
      at: P(s * 0.058, 0.668, 0.585),
      x: wx,
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: WING_TIP,
      bone: wing,
    });

    // legs and toes gripping the fur
    b.rod(P(s * 0.017, 0.617, 0.55), P(s * 0.017, 0.598, 0.552), 0.004, BIRD_LEG, { bone: birdBody });
    b.spike(P(s * 0.017, 0.599, 0.552), [s * 0.2, 0, 1], 0.02, 0.004, { color: BIRD_LEG, bone: birdBody });
    b.spike(P(s * 0.017, 0.599, 0.552), [0, 0, -1], 0.012, 0.004, { color: BIRD_LEG, bone: birdBody });

    // crest side feathers
    b.spike(P(s * 0.009, 0.734, 0.582), [s * 0.3, 0.8, -0.45], 0.038, 0.008, { color: CREST, bone: birdHead });
  }
  b.spike(P(0, 0.735, 0.575), [0, 0.8, -0.6], 0.05, 0.01, { color: CREST, bone: birdHead });

  // beak: upper and lower
  b.spike(P(0, 0.7075, 0.606), [0, -0.12, 1], 0.03, 0.0125, { color: BEAK, bone: birdHead });
  b.spike(P(0, 0.7, 0.608), [0, -0.02, 1], 0.022, 0.0085, { color: BEAK_D, bone: birdJaw });

  // tail fan
  for (const k of [-1, 0, 1]) {
    const xd = new THREE.Vector3(k * 0.22, 0.3, -1).normalize();
    const yd = new THREE.Vector3(1, 0, 0);
    yd.addScaledVector(xd, -yd.dot(xd)).normalize();
    b.extrude(FEATHER, {
      at: P(k * 0.008, 0.662, 0.505),
      x: xd,
      y: yd,
      thickness: 0.006,
      bevel: 0.002,
      color: TAIL,
      bone: birdTail,
    });
  }

  return b.root;
}
