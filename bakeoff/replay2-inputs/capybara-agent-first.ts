import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { countershade, gradient, grain, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Capybara with a Small Bird on its Head",
  description:
    "A plump, sleepy-eyed capybara standing in a patch of clover and daisies, a daisy tucked behind one ear and a round little bluebird perched on its head with wings flung up in delight.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---- palette -------------------------------------------------------------------------------------------------
const FUR_A = "#94623a";
const FUR_B = "#b57d46";
const FUR_DARK = "#5c3722";
const BELLY = "#d9ad72";
const LID = "#7a4a2b";
const NOSE = "#4a2c24";
const NOSTRIL = "#170d0a";
const EYE = "#1a0f0b";
const WHITE = "#fffdf4";
const TEETH = "#f4e6bd";
const EAR_IN = "#e8a08c";
const CLAW = "#2e1d16";
const WHISKER = "#f0dfba";
const MOUTH = "#3a2018";

const BLUE = "#4db4ec";
const BLUE_D = "#2b7ccc";
const BLUE_DD = "#1d4f9a";
const CREAM = "#fff1c2";
const ORANGE = "#ffa928";
const LEG_O = "#ff8f3a";
const BLUSH = "#ff8fa6";
const GOLD = "#ffd43c";

const PETAL = "#fffdf6";
const PETAL_PINK = "#ffb6cc";
const BUTTER = "#ffd23a";
const LEAF = "#69bd57";

function need<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`missing ${what}`);
  return x;
}

/** Piecewise-linear [rx, ry] profile from [t, rx, ry] keys. */
function keyed(keys: number[][]) {
  return (t: number): [number, number] => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const a = keys[i - 1];
        const c = keys[i];
        const u = (t - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  };
}

export default function build() {
  const b = createBuilder({ name: "capybara", paintSize: 2048 });
  const rand = rng(21);
  const UP = new THREE.Vector3(0, 1, 0);

  // ---- fur paint ---------------------------------------------------------------------------------------------
  const backFur = grain(mottle(FUR_A, FUR_B, { size: 0.16, seed: 4, contrast: 0.7 }), FUR_DARK, {
    size: 0.028,
    axis: "z",
    seed: 2,
  });
  const bellyFur = mottle(BELLY, "#e6c18a", { size: 0.12, seed: 7 });
  const coat = countershade(backFur, bellyFur, { level: -0.2, soft: 0.45 });
  const legCoat = gradient(coat, FUR_DARK, [0, 0.2, 0], [0, 0.03, 0]);

  // ---- skeleton: spine, neck, head, jaw, tail ----------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.43, -0.16], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.43, -0.16],
      [0, 0.45, 0.0],
      [0, 0.45, 0.14],
      [0, 0.44, 0.26],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.44, 0.26],
      [0, 0.46, 0.37],
      [0, 0.48, 0.47],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.48, 0.47],
    dir: [0, 0.01, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.385, 0.54], aim: [0, 0.37, 0.74], role: "jaw", group: "head" });
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.4, -0.39],
      [0, 0.39, -0.45],
    ]),
    { parent: hips, names: ["tail1", "tailTip"], role: "tail" },
  );

  // ---- body, neck ----------------------------------------------------------------------------------------------
  const body = b.sweep(
    spine,
    keyed([
      [0, 0.25, 0.26],
      [0.18, 0.285, 0.285],
      [0.5, 0.3, 0.29],
      [0.8, 0.28, 0.275],
      [1, 0.235, 0.235],
    ]),
    { color: coat, sides: 12, shift: [0, -0.012], name: "body" },
  );
  b.sweep(neck, [0.215, 0.18], { color: coat, sides: 10, name: "neck" });

  // ---- head: skull and muzzle loft, jaw -------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: [0, 0.5, 0.47], w: 0.31, h: 0.29 },
      { at: [0, 0.5, 0.55], w: 0.35, h: 0.31 },
      { at: [0, 0.495, 0.62], w: 0.335, h: 0.29 },
      { at: [0, 0.48, 0.68], w: 0.3, h: 0.25 },
      { at: [0, 0.47, 0.72], w: 0.25, h: 0.21 },
    ],
    { bone: head, color: coat, sides: 12, name: "skull" },
  );
  const lowerJaw = b.sweep(
    polyline([
      [0, 0.378, 0.54],
      [0, 0.372, 0.72],
    ]),
    (t) => [0.098 - 0.025 * t, 0.046 - 0.01 * t],
    { bone: jaw, color: coat, sides: 10, name: "lowerJaw" },
  );
  const headSkin = b.surface([skull, lowerJaw]);
  const skullSkin = b.surface(skull);
  const headC: [number, number, number] = [0, 0.49, 0.5];
  const hitAt = (az: number, el: number) => need(skullSkin.around(headC).at(az, el), `skull hit ${az}/${el}`);

  // cheeks, chin, brow: soft rounded masses
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 10, 8), coat, {
      bone: head,
      at: [s * 0.135, 0.44, 0.56],
      scale: [0.95, 0.85, 1.1],
      name: "cheek",
    });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), coat, {
      bone: head,
      at: [s * 0.095, 0.455, 0.7],
      scale: [1, 0.85, 1],
      name: "muzzleSide",
    });
  }
  b.part(new THREE.SphereGeometry(0.045, 8, 6), coat, { bone: jaw, at: [0, 0.355, 0.71], scale: [1.2, 0.7, 1], name: "chin" });

  // mouth: a happy line draped over the lip, with a little smile curl at each end
  const mouthLine = headSkin.drape(
    catmull([
      [-0.135, 0.405, 0.6],
      [-0.108, 0.386, 0.69],
      [-0.05, 0.382, 0.75],
      [0, 0.383, 0.765],
      [0.05, 0.382, 0.75],
      [0.108, 0.386, 0.69],
      [0.135, 0.405, 0.6],
    ]),
    { lift: 0.002 },
  );
  b.sweep(mouthLine, 0.0055, { bone: head, color: MOUTH, sides: 5, caps: "round", name: "mouthLine" });

  // buck teeth peeking over the lower lip
  for (const s of [1, -1]) {
    const t = need(skullSkin.ray([s * 0.014, 0.385, 1.0], [0, 0, -1]), "tooth hit");
    b.stick(new THREE.BoxGeometry(0.022, 0.03, 0.012), TEETH, t.moved([0, -0.002, 0]), { embed: 0.15, bone: head, name: "incisor" });
  }

  // nose pad and nostrils sit high on the blunt snout
  const noseHit = need(skullSkin.around([0, 0.47, 0.6]).at(0, 24), "nose hit");
  b.stick(new THREE.SphereGeometry(0.05, 8, 6), NOSE, noseHit, { embed: 0.45, bone: head, scale: [1.15, 0.6, 1], name: "nosePad" });
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), NOSTRIL, noseHit.moved([s * 0.024, 0.026, 0.004]), {
      embed: 0.5,
      bone: head,
      scale: [1, 0.55, 1.7],
      name: "nostril",
    });
  }

  // eyes: glossy, half-lidded, sleepy and content
  for (const s of [1, -1]) {
    const hit = hitAt(s * 62, 22);
    const n = hit.n.clone();
    const center = hit.at.clone().addScaledVector(n, 0.004);
    b.part(new THREE.SphereGeometry(0.034, 10, 8), EYE, { bone: head, at: center, name: "eye" });
    const lidDir = n.clone().addScaledVector(UP, 0.85).normalize();
    b.part(new THREE.SphereGeometry(0.0395, 10, 5, 0, Math.PI * 2, 0, 1.12), LID, {
      bone: head,
      at: center.clone().addScaledVector(n, 0.001),
      dir: lidDir,
      name: "eyelid",
    });
    b.part(new THREE.SphereGeometry(0.0095, 6, 4), WHITE, {
      bone: head,
      at: center.clone().addScaledVector(n, 0.027).addScaledVector(UP, -0.004).add(new THREE.Vector3(-s * 0.006, 0, 0.007)),
      name: "eyeGlint",
    });
    b.part(new THREE.SphereGeometry(0.0052, 6, 4), WHITE, {
      bone: head,
      at: center.clone().addScaledVector(n, 0.027).addScaledVector(UP, -0.017).add(new THREE.Vector3(s * 0.006, 0, -0.004)),
      name: "eyeGlint",
    });
    // brow bump over the lid
    b.part(new THREE.SphereGeometry(0.03, 8, 5), coat, {
      bone: head,
      at: center.clone().addScaledVector(n, -0.004).addScaledVector(UP, 0.034).add(new THREE.Vector3(0, 0, -0.004)),
      scale: [1.2, 0.8, 1.1],
      name: "brow",
    });
  }

  // ears: small round discs, pink inside
  const daisyAt = new THREE.Vector3(-0.125, 0.585, 0.53);
  for (const s of [1, -1]) {
    const at = new THREE.Vector3(s * 0.105, 0.605, 0.485);
    const normal = new THREE.Vector3(s * 0.75, 0.55, -0.3).normalize();
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: head,
      at,
      dir: normal,
      up: UP,
      scale: [0.046, 0.015, 0.052],
      name: "ear",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), EAR_IN, {
      bone: head,
      at: at.clone().addScaledVector(normal, 0.0085),
      dir: normal,
      up: UP,
      scale: [0.032, 0.01, 0.036],
      name: "earInner",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), FUR_DARK, {
      bone: head,
      at: at.clone().addScaledVector(normal, 0.003).addScaledVector(UP, 0.034),
      dir: normal,
      up: UP,
      scale: [0.03, 0.013, 0.014],
      name: "earRim",
    });
  }

  // daisy behind the right ear
  const daisyDir = new THREE.Vector3(-0.8, 0.5, 0.3).normalize();
  b.stick(new THREE.SphereGeometry(0.013, 8, 6), BUTTER, frame(daisyAt, daisyDir, UP), {
    embed: 0,
    bone: head,
    scale: [1, 0.65, 1],
    name: "daisyCentre",
  });
  b.ring(
    frame(daisyAt, daisyDir, UP),
    { count: 8, radius: 0.022 },
    (item) => {
      b.stick(new THREE.SphereGeometry(0.01, 6, 4), PETAL, item, {
        embed: 0.1,
        bone: head,
        scale: [0.8, 1.9, 0.38],
        name: "daisyPetal",
      });
    },
  );
  b.part(new THREE.SphereGeometry(0.014, 6, 4), LEAF, {
    bone: head,
    at: daisyAt.clone().add(new THREE.Vector3(0.0, -0.03, 0.02)),
    scale: [1.8, 0.4, 1],
    rotation: [0, 0, 20],
    name: "daisyLeaf",
  });

  // whiskers: long cream hairs fanning from the muzzle
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const y0 = 0.435 + k * 0.016;
      b.sweep(
        bezier(
          [s * 0.085, y0, 0.74],
          [s * 0.16, y0 + 0.012 + k * 0.01, 0.78],
          [s * (0.21 + k * 0.012), y0 - 0.02 + k * 0.025, 0.74],
        ),
        [0.0042, 0.0012],
        { bone: head, color: WHISKER, sides: 4, caps: "point", name: "whisker" },
      );
    }
  }

  // ---- bird on the head -----------------------------------------------------------------------------------------
  const bSpine = b.chain(
    "birdSpine",
    catmull([
      [0, 0.69, 0.5],
      [0, 0.705, 0.55],
      [0, 0.725, 0.595],
    ]),
    { parent: head, names: ["birdBody", "birdChest"], role: "spine", group: "bird" },
  );
  const birdBody = b.sweep(
    bSpine,
    keyed([
      [0, 0.05, 0.05],
      [0.45, 0.068, 0.066],
      [1, 0.058, 0.056],
    ]),
    { color: countershade(BLUE, CREAM, { level: -0.1, soft: 0.35 }), sides: 10, name: "birdBody" },
  );
  const bHead = b.joint("birdHead", {
    parent: bSpine.joints[1],
    at: [0, 0.768, 0.604],
    dir: [0.06, 0.3, 1],
    role: "head",
    group: "bird",
  });
  const bJaw = b.joint("birdJaw", { parent: bHead, at: [0, 0.756, 0.652], aim: [0, 0.748, 0.69], role: "jaw", group: "bird" });
  b.part(new THREE.SphereGeometry(0.056, 10, 8), countershade(BLUE, CREAM, { level: -0.35, soft: 0.3 }), {
    bone: bHead,
    at: [0, 0.768, 0.604],
    name: "birdHeadSphere",
  });
  // beak
  b.part(new THREE.ConeGeometry(0.02, 0.05, 7), ORANGE, {
    bone: bHead,
    at: [0, 0.765, 0.668],
    dir: [0, -0.1, 1],
    scale: [1, 1, 0.8],
    name: "beakUpper",
  });
  b.part(new THREE.ConeGeometry(0.0155, 0.038, 7), ORANGE, {
    bone: bJaw,
    at: [0, 0.754, 0.668],
    dir: [0, -0.06, 1],
    scale: [1, 1, 0.6],
    name: "beakLower",
  });
  for (const s of [1, -1]) {
    // eyes, blush
    b.part(new THREE.SphereGeometry(0.0135, 8, 6), EYE, { bone: bHead, at: [s * 0.04, 0.778, 0.642], name: "birdEye" });
    b.part(new THREE.SphereGeometry(0.0052, 6, 4), WHITE, { bone: bHead, at: [s * 0.0425, 0.7855, 0.6515], name: "birdGlint" });
    b.part(new THREE.SphereGeometry(0.0165, 8, 6), BLUSH, {
      bone: bHead,
      at: [s * 0.05, 0.751, 0.627],
      scale: [0.5, 0.9, 1],
      dir: [s, 0, 0.2],
      name: "birdBlush",
    });
    // legs
    const legSide = s > 0 ? "L" : "R";
    const birdLeg = b.chain(
      `birdLeg${legSide}`,
      polyline([
        [s * 0.03, 0.682, 0.55],
        [s * 0.033, 0.655, 0.575],
      ]),
      { parent: bSpine.joints[0], names: [`birdLeg${legSide}`, `birdFoot${legSide}`], role: "leg", group: "bird" },
    );
    b.sweep(birdLeg, 0.0065, { color: LEG_O, sides: 5, name: "birdLeg" });
    const foot = birdLeg.tip ?? birdLeg.joints[1];
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.011;
      const toe = b.joint(`birdToe${k + 1}${legSide}`, {
        parent: foot,
        at: [s * 0.033, 0.655, 0.575],
        aim: [s * 0.033 + s * a * 2, 0.648, 0.607],
        role: "digit",
        group: "bird",
      });
      b.rod(toe, [s * 0.033 + s * a * 2, 0.648, 0.607], [0.0055, 0.0045], { color: LEG_O, sides: 5, name: "birdToe" });
    }
    // wings flung up in delight: a plate on the inner joint, flight feathers on the outer joint
    const wing = b.chain(
      `birdWing${legSide}`,
      polyline([
        [s * 0.05, 0.722, 0.57],
        [s * 0.11, 0.762, 0.57],
        [s * 0.17, 0.802, 0.57],
      ]),
      { parent: bSpine.joints[1], names: [`birdWing${legSide}1`, `birdWing${legSide}2`], role: "wing", group: "bird" },
    );
    const wingX: [number, number, number] = [s, 0.7, 0];
    const wingY: [number, number, number] = [0, 0, -1];
    const platePaint = paint((_p, _n, uv) =>
      uv[1] > 0.066 ? CREAM : uv[1] < 0.028 ? "#69c6f4" : Math.floor(uv[0] / 0.014) % 2 ? BLUE_D : "#3a90d8",
    );
    const plate: OutlinePoint[] = [
      [0, -0.002],
      [0.03, -0.014],
      [0.06, -0.008],
      [0.066, 0.034],
      [0.06, 0.07, "sharp"],
      [0.03, 0.074],
      [0, 0.064],
    ];
    b.extrude(plate, {
      at: wing.joints[0].at,
      x: wingX,
      y: wingY,
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: platePaint,
      bone: wing.joints[0],
      name: "birdWingPlate",
    });
    const featherShape: OutlinePoint[] = [
      [0, -0.012],
      [0.03, -0.0175],
      [0.062, -0.01],
      [0.082, 0, "sharp"],
      [0.062, 0.01],
      [0.03, 0.0175],
      [0, 0.012],
    ];
    const featherPaint = paint((_p, _n, uv) => (uv[0] > 0.066 ? BLUE_DD : uv[0] > 0.03 ? BLUE_D : "#3a90d8"));
    for (let k = 0; k < 4; k++) {
      const phi = ((k - 1.5) * 15 * Math.PI) / 180;
      const base = wing.joints[1].at.clone().add(new THREE.Vector3(0, 0, -0.012 - 0.02 * (k - 1.5) * 0.0 + (k - 1.5) * -0.012));
      b.extrude(featherShape, {
        at: base,
        x: [s * Math.cos(phi), 0.7, -Math.sin(phi)],
        y: [-s * Math.sin(phi), 0, -Math.cos(phi)],
        thickness: 0.008,
        bevel: 0.002,
        color: featherPaint,
        bone: wing.joints[1],
        name: "birdPrimary",
      });
    }
  }
  // tail feathers
  const bTail = b.chain(
    "birdTail",
    polyline([
      [0, 0.7, 0.49],
      [0, 0.718, 0.435],
    ]),
    { parent: bSpine.joints[0], names: ["birdTail1", "birdTailTip"], role: "tail", group: "bird" },
  );
  const tailShape: OutlinePoint[] = [
    [0, -0.014],
    [0.04, -0.02],
    [0.085, -0.012],
    [0.11, 0, "sharp"],
    [0.085, 0.012],
    [0.04, 0.02],
    [0, 0.014],
  ];
  for (let k = 0; k < 4; k++) {
    const phi = ((k - 1.5) * 17 * Math.PI) / 180;
    b.extrude(tailShape, {
      at: bTail.joints[0].at,
      x: [Math.sin(phi), 0.3, -Math.cos(phi)],
      y: [Math.cos(phi), 0, Math.sin(phi)],
      thickness: 0.007,
      bevel: 0.002,
      color: paint((_p, _n, uv) => (uv[0] > 0.085 ? BLUE_DD : BLUE_D)),
      bone: bTail.joints[0],
      name: "birdTailFeather",
    });
  }
  // crest of three golden tufts
  const crestBase: [number, number, number] = [0, 0.812, 0.592];
  for (let k = -1; k <= 1; k++) {
    b.spike(crestBase, [k * 0.35, 1, k === 0 ? -0.35 : -0.15], 0.06 - Math.abs(k) * 0.012, 0.011, {
      bone: bHead,
      color: GOLD,
      sides: 5,
      name: "crest",
    });
  }

  // ---- legs ---------------------------------------------------------------------------------------------------
  const nailGeo = new THREE.SphereGeometry(0.0125, 6, 4);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // forelegs
    const fPts = limb([s * 0.17, 0.32, 0.2], [s * 0.17, 0.062, 0.26], [0.17, 0.15], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${side}`, fPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(fLeg, [0.09, 0.075, 0.052], { color: legCoat, sides: 10, name: `foreleg${side}` });
    const fFoot = fLeg.tip ?? fLeg.joints[2];
    b.rod(fFoot, [s * 0.17, 0.034, 0.34], [0.04, 0.034], {
      bone: fFoot,
      color: legCoat,
      sides: 8,
      caps: "round",
      name: `forepaw${side}`,
    });
    for (let k = 0; k < 4; k++) {
      const off = (k - 1.5) * 0.021;
      const a: [number, number, number] = [s * 0.17 + off, 0.023, 0.325];
      const e: [number, number, number] = [s * 0.17 + off * 1.15, 0.0125, 0.37];
      const toe = b.joint(`toeF${k + 1}${side}`, { parent: fFoot, at: a, aim: e, role: "digit", group: "legs" });
      b.capsule(a, e, 0.0125, { bone: toe, color: legCoat, sides: 6, name: "toe" });
      b.part(nailGeo, CLAW, { bone: toe, at: [e[0], e[1] - 0.001, e[2] + 0.006], scale: [1, 0.7, 0.9], name: "nail" });
    }
    // hind legs
    const hPts = limb(
      [s * 0.18, 0.33, -0.12],
      [s * 0.18, 0.062, -0.14],
      [0.15, 0.14, 0.11],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(hLeg, [0.1, 0.085, 0.06, 0.05], { color: legCoat, sides: 10, name: `hindleg${side}` });
    const hFoot = hLeg.tip ?? hLeg.joints[3];
    b.rod(hFoot, [s * 0.18, 0.036, -0.06], [0.042, 0.036], {
      bone: hFoot,
      color: legCoat,
      sides: 8,
      caps: "round",
      name: `hindpaw${side}`,
    });
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * 0.027;
      const a: [number, number, number] = [s * 0.18 + off, 0.024, -0.075];
      const e: [number, number, number] = [s * 0.18 + off * 1.15, 0.0155, -0.022];
      const toe = b.joint(`toeH${k + 1}${side}`, { parent: hFoot, at: a, aim: e, role: "digit", group: "legs" });
      b.capsule(a, e, 0.0155, { bone: toe, color: legCoat, sides: 6, name: "toe" });
      b.part(new THREE.SphereGeometry(0.0155, 6, 4), CLAW, { bone: toe, at: [e[0], e[1] - 0.001, e[2] + 0.008], scale: [1, 0.7, 0.9], name: "hoof" });
    }
  }

  // tail: a little button nub
  b.sweep(tail, [0.036, 0.024], { color: FUR_DARK, sides: 8, name: "tailNub" });

  // ---- fur tufts ----------------------------------------------------------------------------------------------
  const tuft = svg(
    `<svg viewBox="0 0 24 48"><path d="M3 48 C6 30 10 14 12 2 C14 14 18 30 21 48 Z" fill="#f4f4f4"/><path d="M12 8 L12 48" stroke="#c9c9c9" stroke-width="2" fill="none"/><path d="M7 48 C8 36 10 28 11 20" stroke="#d6d6d6" stroke-width="1.6" fill="none"/></svg>`,
    { size: 96 },
  );
  const bodyHits = b.surface(body).scatter(250, { rng: rng(11), minDist: 0.055, filter: (h) => h.n.y > -0.15 });
  b.cards(bodyHits, tuft, { size: [0.045, 0.075], lean: 72, bend: 25, vary: 0.3, rng: rng(4), color: coat });
  const headHits = skullSkin.scatter(70, { rng: rng(13), minDist: 0.04, filter: (h) => h.n.y > -0.2 && h.at.z < 0.7 });
  b.cards(headHits, tuft, { size: [0.032, 0.052], lean: 62, bend: 20, vary: 0.3, rng: rng(5), color: coat });
  const chinHits = b.surface(lowerJaw).scatter(14, { rng: rng(17), minDist: 0.03, filter: (h) => h.n.y < 0.2 });
  b.cards(chinHits, tuft, { size: [0.028, 0.04], lean: 70, vary: 0.2, rng: rng(6), color: coat });
  // nest of fluff round the bird's feet
  const nestHits = skullSkin.scatter(40, { rng: rng(19), minDist: 0.03, filter: (h) => h.n.y > 0.55 && Math.abs(h.at.x) < 0.085 });
  b.cards(nestHits, tuft, { size: [0.03, 0.05], lean: 25, bend: 20, vary: 0.25, rng: rng(8), color: coat });

  // ---- meadow around the feet -----------------------------------------------------------------------------------
  const grass = svg(
    `<svg viewBox="0 0 48 64"><path d="M4 64 C8 40 10 22 6 4 C16 20 20 42 22 64 Z" fill="#79b84e"/><path d="M18 64 C20 36 24 16 26 2 C32 18 32 42 32 64 Z" fill="#5a9a3c"/><path d="M28 64 C34 44 40 28 46 12 C46 34 42 50 40 64 Z" fill="#8cc85a"/></svg>`,
    { size: 128 },
  );
  const flowerSvg = (petal: string, centre: string) =>
    svg(
      `<svg viewBox="0 0 32 64"><path d="M16 64 L16 26" stroke="#4e9a3a" stroke-width="3.5" fill="none"/><path d="M16 50 C8 48 6 42 5 38 C12 38 15 44 16 50 Z" fill="#69bd57"/><g fill="${petal}"><circle cx="16" cy="9" r="6.5"/><circle cx="24" cy="15" r="6.5"/><circle cx="21" cy="24" r="6.5"/><circle cx="11" cy="24" r="6.5"/><circle cx="8" cy="15" r="6.5"/></g><circle cx="16" cy="17" r="5" fill="${centre}"/></svg>`,
      { size: 128 },
    );
  const spots: number[][] = [];
  while (spots.length < 26) {
    const x = (rand() - 0.5) * 1.5;
    const z = -0.55 + rand() * 1.55;
    if (Math.abs(x) < 0.3 && z > -0.5 && z < 0.5) continue;
    if (Math.abs(x) < 0.26 && z > 0.5 && z < 0.95) continue;
    spots.push([x, z]);
  }
  b.cards(
    spots.map(([x, z]) => frame([x, 0, z], [0, 1, 0])),
    grass,
    { size: [0.09, 0.14], vary: 0.35, cross: true, rng: rng(31), bone: hips, flow: [0, 0, 1] },
  );
  const bloomFrames = [
    [0.38, 0.4],
    [-0.42, 0.55],
    [0.5, -0.35],
    [-0.5, -0.3],
    [0.27, 0.8],
    [-0.3, 0.9],
    [0.62, 0.15],
    [-0.65, 0.1],
  ];
  b.cards(
    bloomFrames.slice(0, 3).map(([x, z]) => frame([x, 0, z], [0, 1, 0])),
    flowerSvg(PETAL, BUTTER),
    { size: [0.07, 0.14], cross: true, bone: hips, flow: [0, 0, 1] },
  );
  b.cards(
    bloomFrames.slice(3, 6).map(([x, z]) => frame([x, 0, z], [0, 1, 0])),
    flowerSvg(PETAL_PINK, BUTTER),
    { size: [0.07, 0.14], cross: true, bone: hips, flow: [0, 0, 1] },
  );
  b.cards(
    bloomFrames.slice(6).map(([x, z]) => frame([x, 0, z], [0, 1, 0])),
    flowerSvg(BUTTER, "#e08a1e"),
    { size: [0.065, 0.13], cross: true, bone: hips, flow: [0, 0, 1] },
  );

  // keep birdBody referenced for later shading tweaks
  void birdBody;
  void catmull;
  return b.root;
}
