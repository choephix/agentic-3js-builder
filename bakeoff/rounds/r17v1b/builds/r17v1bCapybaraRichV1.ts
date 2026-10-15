import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with a bird on its head",
  description:
    "A chubby, sleepy-eyed storybook capybara with shaggy fur tufts, rosy cheeks and a blade of grass in its mouth, wearing a round little bluebird on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---- palette ----
const FUR = "#a8703c";
const FUR_DARK = "#6e4426";
const FUR_WARM = "#b97d44";
const BELLY = "#dcb87e";
const NOSE = "#4a2c22";
const NOSTRIL = "#241410";
const PAW = "#5c3a22";
const NAIL = "#2e1c12";
const EYE = "#24140e";
const SPARK = "#fff8ee";
const PINK = "#e8907f";
const EAR_IN = "#e9a893";
const TOOTH = "#f4e6c0";
const WHISKER = "#d9bc8a";
const GRASS = "#6fbf3c";
const GRASS_DARK = "#4e9a2c";
const BIRD_BLUE = "#4fb2e8";
const BIRD_BLUE_DARK = "#2f78c4";
const BIRD_BLUE_LIGHT = "#8fd6f4";
const BIRD_ORANGE = "#f29a4a";
const BIRD_CREAM = "#fbefd8";
const BEAK = "#ffb43a";
const BIRD_EYE = "#1b1220";
const LEG = "#f0883a";
const PETAL = "#fffaf0";
const PETAL_EDGE = "#f6c9d8";
const DAISY = "#ffc83a";

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rnd = rng(7);

  // =============== SKELETON ===============
  const hips = b.joint("hips", { at: [0, 0.36, -0.3] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, -0.3],
      [0, 0.37, -0.05],
      [0, 0.375, 0.15],
      [0, 0.385, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.36, -0.3],
      [0, 0.34, -0.46],
      [0, 0.31, -0.54],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.385, 0.3],
      [0, 0.4, 0.38],
      [0, 0.43, 0.46],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.43, 0.46],
    aim: [0, 0.41, 0.75],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.3, 0.44], aim: [0, 0.255, 0.64], role: "jaw" });

  const ears: Record<string, ReturnType<typeof b.joint>> = {};
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    ears[side] = b.joint(`ear${side}`, {
      parent: head,
      at: [sx * 0.125, 0.585, 0.365],
      aim: [sx * 0.15, 0.665, 0.37],
      role: "hinge",
    });
  }

  // legs: front 2-bone, rear 3-bone with a bent hock
  const legs: Record<string, { chain: ReturnType<typeof b.chain>; rear: boolean }> = {};
  const toeBases: Record<string, ReturnType<typeof b.joint>> = {};
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const front = limb(
      [sx * 0.19, 0.3, 0.17],
      [sx * 0.19, 0.04, 0.2],
      [0.14, 0.14],
      [0, 0, -1],
    );
    legs[`F${side}`] = {
      chain: b.chain(`legF${side}`, front, {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "leg",
      }),
      rear: false,
    };
    const rearPts = limb(
      [sx * 0.2, 0.31, -0.28],
      [sx * 0.2, 0.04, -0.33],
      [0.15, 0.14, 0.07],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    legs[`H${side}`] = {
      chain: b.chain(`legH${side}`, rearPts, {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
        role: "leg",
      }),
      rear: true,
    };
  }

  // toes
  const toeJoints: { toe: ReturnType<typeof b.joint>; a: THREE.Vector3; tip: THREE.Vector3 }[] = [];
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    for (const key of ["F", "H"] as const) {
      const lg = legs[`${key}${side}`];
      const paw = lg.chain.tip!;
      toeBases[`${key}${side}`] = paw;
      const offs = key === "F" ? [-0.033, -0.011, 0.011, 0.033] : [-0.027, 0, 0.027];
      offs.forEach((dx, i) => {
        const a = new THREE.Vector3(paw.at.x + dx, 0.03, paw.at.z + 0.045);
        const tip = new THREE.Vector3(paw.at.x + dx * 1.15, 0.026, paw.at.z + 0.095);
        const toe = b.joint(`toe${key}${side}${i + 1}`, { parent: paw, at: a, aim: tip, role: "digit" });
        toeJoints.push({ toe, a, tip });
      });
    }
  }

  // =============== COAT PAINTS ===============
  const furA = mottle(FUR, FUR_WARM, { size: 0.16, contrast: 0.7, seed: 3 });
  const furB = mottle("#8e5a30", "#7c4c28", { size: 0.16, contrast: 0.7, seed: 3 });
  const fur = grain(furA, furB, { size: 0.02, axis: "z", seed: 5 });
  const bellyPaint = mottle(BELLY, "#cfa46a", { size: 0.14, seed: 9 });
  const coat = countershade(fur, bellyPaint, { level: -0.15, soft: 0.3 });
  const legCoat = gradient(coat, PAW, [0, 0.2, 0], [0, 0.04, 0]);
  const headCoat = gradient(coat, "#5e3b28", [0, 0.4, 0.55], [0, 0.4, 0.74]);

  // =============== BODY ===============
  const body = b.loft(
    [
      { at: [0, 0.33, -0.4], w: 0.2, h: 0.22 },
      { at: [0, 0.35, -0.32], w: 0.4, h: 0.4 },
      { at: [0, 0.36, -0.15], w: 0.5, h: 0.46 },
      { at: [0, 0.37, 0.05], w: 0.54, h: 0.48 },
      { at: [0, 0.375, 0.2], w: 0.5, h: 0.46 },
      { at: [0, 0.38, 0.3], w: 0.4, h: 0.38 },
    ],
    { bone: [tail, hips, spine], color: coat, sides: 12, name: "body" },
  );
  b.sweep(neck, [0.17, 0.16], { color: coat, sides: 10, name: "neckTube" });

  // legs
  const legMeshes: THREE.Mesh[] = [];
  for (const [key, lg] of Object.entries(legs)) {
    const sw = b.sweep(lg.chain, lg.rear ? [0.095, 0.052] : [0.082, 0.05], {
      color: legCoat,
      sides: 8,
      name: `leg${key}`,
    });
    legMeshes.push(...sw.meshes);
    const paw = lg.chain.tip!;
    b.part(new THREE.SphereGeometry(0.058, 10, 7), PAW, {
      at: [paw.at.x, 0.037, paw.at.z + 0.018],
      bone: paw,
      scale: [1.0, 0.64, 1.1],
      name: `paw${key}`,
    });
  }
  // hammy thighs
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    b.part(new THREE.SphereGeometry(0.13, 12, 8), coat, {
      at: [sx * 0.2, 0.3, -0.3],
      bone: legs[`H${side}`].chain.joints[0],
      scale: [0.85, 1.1, 1.05],
      name: `thigh${side}`,
    });
  }
  // toes + nails
  for (const { toe, a, tip } of toeJoints) {
    b.capsule(a, tip, 0.017, { bone: toe, color: PAW, sides: 6, name: "toe" });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), NAIL, {
      at: [tip.x, tip.y + 0.002, tip.z + 0.014],
      bone: toe,
      scale: [1.1, 0.8, 1.0],
      name: "nail",
    });
  }

  // =============== HEAD ===============
  const skull = b.loft(
    [
      { at: [0, 0.455, 0.3], w: 0.28, h: 0.28 },
      { at: [0, 0.465, 0.4], w: 0.34, h: 0.34 },
      { at: [0, 0.45, 0.5], w: 0.35, h: 0.33 },
      { at: [0, 0.43, 0.59], w: 0.31, h: 0.28 },
    ],
    { bone: head, color: headCoat, sides: 12, name: "skull" },
  );
  // lower jaw (separate, opens)
  b.loft(
    [
      { at: [0, 0.275, 0.44], w: 0.2, h: 0.1 },
      { at: [0, 0.27, 0.56], w: 0.19, h: 0.095 },
      { at: [0, 0.265, 0.64], w: 0.15, h: 0.085 },
    ],
    { bone: jaw, color: "#c7a06e", sides: 8, name: "lowerJaw" },
  );
  // snout pad, nostrils
  b.part(new THREE.SphereGeometry(0.075, 12, 8), NOSE, {
    at: [0, 0.415, 0.7],
    bone: head,
    scale: [1.08, 0.66, 0.85],
    name: "nosePad",
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), NOSTRIL, {
      at: [sx * 0.032, 0.438, 0.745],
      bone: head,
      scale: [1.0, 0.7, 1.2],
      name: "nostril",
    });
    // whisker pad bumps
    b.part(new THREE.SphereGeometry(0.05, 8, 6), "#c79a68", {
      at: [sx * 0.09, 0.375, 0.66],
      bone: head,
      scale: [1, 0.8, 1.2],
      name: "whiskerPad",
    });
  }
  // teeth
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.022, 0.04, 0.014), TOOTH, {
      at: [sx * 0.013, 0.29, 0.72],
      bone: head,
      name: "incisor",
    });
    b.part(new THREE.BoxGeometry(0.016, 0.026, 0.012), TOOTH, {
      at: [sx * 0.01, 0.285, 0.665],
      bone: jaw,
      name: "lowerIncisor",
    });
  }

  // eyes
  const skullSurf = b.surface(skull);
  for (const [, sx] of [["L", 1], ["R", -1]] as const) {
    const hit = skullSurf.nearest([sx * 0.3, 0.55, 0.5]);
    const c = hit.at.clone().addScaledVector(hit.n, 0.002);
    b.part(new THREE.SphereGeometry(0.034, 10, 8), EYE, { at: c, bone: head, name: "eye" });
    const spark = c.clone().addScaledVector(hit.n, 0.028).add(new THREE.Vector3(0, 0.012, 0.011));
    b.part(new THREE.SphereGeometry(0.011, 6, 4), SPARK, { at: spark, bone: head, name: "eyeSpark" });
    const spark2 = c.clone().addScaledVector(hit.n, 0.03).add(new THREE.Vector3(0, -0.012, -0.008));
    b.part(new THREE.SphereGeometry(0.005, 5, 4), SPARK, { at: spark2, bone: head, name: "eyeSpark2" });
    // sleepy lid
    const lid = c.clone().add(new THREE.Vector3(0, 0.02, 0.004)).addScaledVector(hit.n, 0.004);
    b.part(new THREE.SphereGeometry(0.037, 10, 6), FUR, { at: lid, bone: head, scale: [1, 0.75, 1], name: "lid" });
    // brow
    const bA = c.clone().add(new THREE.Vector3(0, 0.05, -0.04)).addScaledVector(hit.n, 0.0);
    const bB = c.clone().add(new THREE.Vector3(0, 0.045, 0.04)).addScaledVector(hit.n, 0.0);
    b.capsule(bA, bB, 0.007, { bone: head, color: FUR_DARK, sides: 5, name: "brow" });
  }

  // cheek blush
  const blush = svg(
    `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="12" rx="19" ry="11" fill="#e8907f"/><ellipse cx="20" cy="12" rx="13" ry="7" fill="#f0a28f"/></svg>`,
    { size: 160 },
  );
  for (const sx of [1, -1]) {
    b.decal(skull, blush, {
      at: [sx * 0.17, 0.4, 0.5],
      dir: [sx, 0.12, 0.25],
      size: [0.085, 0.05],
      mirror: sx < 0,
      bone: head,
      name: "blush",
    });
  }
  // smile lines
  for (const sx of [1, -1]) {
    const smile = skullSurf.drape(
      [
        [sx * 0.03, 0.315, 0.705],
        [sx * 0.09, 0.305, 0.665],
        [sx * 0.14, 0.31, 0.6],
        [sx * 0.158, 0.33, 0.545],
      ],
      { lift: 0.004 },
    );
    b.sweep(smile, 0.0045, { bone: head, color: FUR_DARK, sides: 4, name: "smile" });
  }
  // whiskers
  for (const sx of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const y = 0.37 + i * 0.012;
      b.sweep(
        catmull([
          [sx * 0.12, y, 0.67],
          [sx * 0.19, y + 0.012 + i * 0.004, 0.68],
          [sx * 0.26, y + 0.005 - i * 0.008, 0.66],
        ]),
        [0.003, 0.0012],
        { bone: head, color: WHISKER, sides: 4, caps: "point", name: "whisker" },
      );
    }
  }
  // freckle dots on the snout
  for (const sx of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.006, 5, 4), "#5b3a28", {
        at: [sx * (0.055 + 0.015 * i), 0.455 - 0.004 * i, 0.675 - 0.025 * i],
        bone: head,
        scale: [1, 0.7, 1],
        name: "freckle",
      });
    }
  }

  // ears
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const ear = ears[side];
    b.part(new THREE.SphereGeometry(0.05, 10, 8), FUR, {
      at: [sx * 0.135, 0.605, 0.36],
      bone: ear,
      scale: [0.55, 1, 0.85],
      dir: [sx * 0.15, 1, 0],
      name: "earOuter",
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), EAR_IN, {
      at: [sx * 0.138, 0.605, 0.372],
      bone: ear,
      scale: [0.4, 0.9, 0.7],
      name: "earInner",
    });
  }

  // grass blade held in the mouth
  {
    const w = 0.011;
    const centre: [number, number][] = [
      [0, 0],
      [0.06, 0.012],
      [0.115, -0.006],
      [0.15, -0.05],
      [0.165, -0.105],
    ];
    const up = centre.map(([x, y]) => [x, y + w] as [number, number]);
    const dn = centre.map(([x, y]) => [x, y - w] as [number, number]);
    const outline: [number, number, "sharp"?][] = [...up.slice(0, -1), [centre[4][0], centre[4][1], "sharp"], ...dn.slice(0, -1).reverse()] as never;
    const blade = b.extrude(outline as never, {
      at: [0.095, 0.292, 0.64],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.005,
      smoothing: 1,
      color: GRASS,
      bone: jaw,
      name: "grassBlade",
    });
    void blade;
    b.sweep(
      [
        [0.098, 0.292, 0.64],
        [0.098, 0.292, 0.745],
      ],
      0.0018,
      { bone: jaw, color: GRASS_DARK, sides: 4, name: "grassVein", caps: "none" },
    );
  }

  // =============== FUR TUFTS ===============
  const tuft = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M5 64 Q8 30 1 4 Q15 26 15 64Z" fill="#ffffff"/><path d="M11 64 Q14 24 16 0 Q24 28 21 64Z" fill="#e4e4e4"/><path d="M18 64 Q22 34 31 8 Q30 36 27 64Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const bodySurf = b.surface(body);
  const bodyHits = bodySurf.scatter(430, { rng: rnd, minDist: 0.04, filter: (h) => h.n.y > -0.5 });
  b.cards(bodyHits, tuft, { size: [0.055, 0.1], lean: 72, bend: 30, vary: 0.3, rng: rng(4), spin: 20, color: coat, name: "furBody" });
  const eyeKeepOut = (p: THREE.Vector3) =>
    Math.hypot(Math.abs(p.x) - 0.15, p.y - 0.53, p.z - 0.5) < 0.09 || p.z > 0.52 || p.y < 0.3;
  const headHits = skullSurf.scatter(90, { rng: rng(21), minDist: 0.04, keepOut: eyeKeepOut, filter: (h) => h.n.y > -0.2 });
  b.cards(headHits, tuft, { size: [0.04, 0.075], lean: 70, bend: 25, vary: 0.3, rng: rng(5), spin: 20, color: headCoat, name: "furHead" });
  const legSurf = b.surface(legMeshes);
  const legHits = legSurf.scatter(120, { rng: rng(33), minDist: 0.035, filter: (h) => h.at.y > 0.1 && Math.abs(h.n.y) < 0.9 });
  b.cards(legHits, tuft, { size: [0.04, 0.07], lean: 72, bend: 25, vary: 0.3, rng: rng(6), spin: 20, color: legCoat, name: "furLegs" });

  // =============== DAISY behind the right ear ===============
  {
    const hit = skullSurf.nearest([-0.17, 0.63, 0.46]);
    const centre = hit.at.clone().addScaledVector(hit.n, 0.004);
    const f = frame(centre, hit.n);
    b.ring(f, { count: 7, radius: 0.0 }, (petal) =>
      b.spike(petal, petal, 0.04, 0.012, { color: PETAL, bone: head, caps: "point", sides: 5 }),
    );
    b.part(new THREE.SphereGeometry(0.014, 8, 6), DAISY, {
      at: centre.clone().addScaledVector(hit.n, 0.006),
      bone: head,
      name: "daisyHeart",
    });
    void PETAL_EDGE;
  }

  // =============== BIRD ===============
  const topHit = skullSurf.ray([0, 1.2, 0.43], [0, -1, 0])!;
  const footY = topHit.at.y - 0.004;
  const C = new THREE.Vector3(0, footY + 0.082, 0.43);
  const birdRoot = b.joint("birdRoot", { parent: head, at: C, dir: [0, 0, 1] });
  const birdHead = b.joint("birdHead", {
    parent: birdRoot,
    at: [0, C.y + 0.05, C.z + 0.04],
    dir: [0, 0, 1],
  });
  const beakU = b.joint("birdBeak", {
    parent: birdHead,
    at: [0, C.y + 0.05, C.z + 0.075],
    aim: [0, C.y + 0.047, C.z + 0.11],
  });
  const beakL = b.joint("birdJaw", {
    parent: birdHead,
    at: [0, C.y + 0.04, C.z + 0.072],
    aim: [0, C.y + 0.038, C.z + 0.103],
    role: "jaw",
  });
  const birdWings: Record<string, ReturnType<typeof b.joint>> = {};
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    birdWings[side] = b.joint(`birdWing${side}`, {
      parent: birdRoot,
      at: [sx * 0.052, C.y + 0.016, C.z + 0.025],
      aim: [sx * 0.058, C.y - 0.005, C.z - 0.06],
      role: "wing",
    });
  }
  const birdTail = b.joint("birdTail", {
    parent: birdRoot,
    at: [0, C.y - 0.005, C.z - 0.05],
    aim: [0, C.y + 0.012, C.z - 0.15],
    role: "tail",
  });
  const birdLegs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    birdLegs[side] = b.chain(
      `birdLeg${side}`,
      [
        [sx * 0.022, C.y - 0.045, C.z + 0.005],
        [sx * 0.022, footY + 0.008, C.z + 0.008],
      ],
      { parent: birdRoot, names: [`birdLeg${side}`, `birdFoot${side}`], role: "leg" },
    );
  }

  // bird paints
  const birdBack = mottle(BIRD_BLUE, "#42a2dd", { size: 0.04, seed: 12 });
  const birdBelly = gradient(BIRD_ORANGE, BIRD_CREAM, [0, C.y + 0.015, 0], [0, C.y - 0.04, 0]);
  const birdCoat = countershade(birdBack, birdBelly, { level: -0.1, soft: 0.25 });
  const birdHeadCoat = countershade(birdBack, gradient(BIRD_ORANGE, BIRD_CREAM, [0, C.y + 0.1, 0], [0, C.y + 0.04, 0]), {
    level: -0.35,
    soft: 0.2,
  });

  b.part(new THREE.SphereGeometry(0.06, 12, 9), birdCoat, {
    at: C,
    bone: birdRoot,
    scale: [0.95, 0.88, 1.2],
    name: "birdBody",
  });
  b.part(new THREE.SphereGeometry(0.044, 12, 9), birdHeadCoat, {
    at: [0, C.y + 0.052, C.z + 0.04],
    bone: birdHead,
    name: "birdHeadSphere",
  });
  // beak
  b.part(new THREE.ConeGeometry(0.014, 0.034, 6), BEAK, {
    at: [0, C.y + 0.05, C.z + 0.09],
    dir: [0, 0, 1],
    bone: beakU,
    name: "beakUpper",
  });
  b.part(new THREE.ConeGeometry(0.01, 0.026, 6), "#f29c28", {
    at: [0, C.y + 0.039, C.z + 0.085],
    dir: [0, 0, 1],
    bone: beakL,
    name: "beakLower",
  });
  // eyes
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0095, 6, 5), BIRD_EYE, {
      at: [sx * 0.033, C.y + 0.062, C.z + 0.062],
      bone: birdHead,
      name: "birdEye",
    });
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), SPARK, {
      at: [sx * 0.037, C.y + 0.066, C.z + 0.067],
      bone: birdHead,
      name: "birdEyeSpark",
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), "#f4a090", {
      at: [sx * 0.037, C.y + 0.04, C.z + 0.05],
      bone: birdHead,
      scale: [0.7, 0.8, 0.6],
      name: "birdBlush",
    });
  }
  // crest
  for (let i = -1; i <= 1; i++) {
    b.spike([i * 0.01, C.y + 0.088, C.z + 0.035 - Math.abs(i) * 0.008], [i * 0.25, 1, -0.9], 0.034 - Math.abs(i) * 0.008, 0.009, {
      bone: birdHead,
      color: i === 0 ? BIRD_BLUE_DARK : BIRD_BLUE,
      sides: 5,
      name: "crest",
    });
  }
  // wings
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const wingOutline: [number, number][] = [
      [0, 0.03],
      [0.025, 0.04],
      [0.07, 0.02],
      [0.11, -0.025],
      [0.125, -0.05],
      [0.08, -0.045],
      [0.03, -0.04],
      [0, -0.015],
    ];
    const wj = birdWings[side];
    b.extrude(wingOutline, {
      at: [sx * 0.05, C.y + 0.012, C.z + 0.03],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: BIRD_BLUE_DARK,
      bone: wj,
      name: "wing",
    });
    const tipOutline: [number, number][] = [
      [0.07, 0.016],
      [0.11, -0.028],
      [0.127, -0.054],
      [0.082, -0.048],
      [0.065, -0.02],
    ];
    b.extrude(tipOutline, {
      at: [sx * 0.056, C.y + 0.012, C.z + 0.03],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.006,
      color: BIRD_BLUE_LIGHT,
      bone: wj,
      name: "wingTip",
    });
  }
  // tail feathers
  for (let i = -1; i <= 1; i++) {
    b.frustumBox(
      [i * 0.006, C.y - 0.002, C.z - 0.05],
      [i * 0.04, C.y + 0.01 + (i === 0 ? 0.004 : 0), C.z - 0.145],
      [0.026, 0.006],
      [0.02, 0.005],
      { bone: birdTail, color: i === 0 ? BIRD_BLUE_DARK : BIRD_BLUE, name: "tailFeather" },
    );
  }
  // legs and toes
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const lg = birdLegs[side];
    b.sweep(lg, 0.0055, { color: LEG, sides: 5, name: `birdLeg${side}` });
    const foot = lg.tip!;
    for (const dx of [-0.011, 0, 0.011]) {
      b.capsule(
        [sx * 0.022, footY + 0.006, C.z + 0.008],
        [sx * 0.022 + dx, footY + 0.005, C.z + 0.038],
        0.0045,
        { bone: foot, color: LEG, sides: 5, name: "birdToe" },
      );
    }
    b.capsule([sx * 0.022, footY + 0.006, C.z + 0.008], [sx * 0.022, footY + 0.005, C.z - 0.016], 0.0045, {
      bone: foot,
      color: LEG,
      sides: 5,
      name: "birdHallux",
    });
  }

  return b.root;
}
