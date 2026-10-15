import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { countershade, gradient, grain, mottle, stripes } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with a Little Bird",
  description:
    "A chubby, gentle capybara standing with its head raised and a small blue-and-yellow bird perched on its crown. Storybook proportions, cel-shaded tan coat with fur tufts, dark toed feet, whiskers and a tiny rigged bird.",
  style: "whimsical",
  commit: "88fc1f0",
};

const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // ---------------------------------------------------------------- palette
  const BELLY = "#e0b078";
  const coatBase = mottle(
    grain("#c98a43", "#bb7b37", { size: 0.025, axis: "z", seed: 2 }),
    grain("#b5722f", "#a56529", { size: 0.025, axis: "z", seed: 3 }),
    { size: 0.22, seed: 5 },
  );
  const furTint = countershade(coatBase, BELLY, { level: -0.3, soft: 0.3 });
  const BODYC = cel(furTint);
  const HEADC = cel(gradient(coatBase, "#d9a56b", [0, 0.6, 0.5], [0, 0.58, 0.78]));
  const LEGC = cel(gradient(coatBase, "#6d4228", [0, 0.32, 0], [0, 0.14, 0]));
  const TOE = "#5a3622";
  const NAIL = "#2e1b11";
  const NOSE = "#6e4638";
  const EAR = "#9a5f33";
  const EARIN = "#c98e78";
  const CHIN = "#e3b983";

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.44, -0.35], dir: [0, 0.02, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.44, -0.35],
      [0, 0.45, -0.1],
      [0, 0.46, 0.12],
      [0, 0.5, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.5, 0.3],
      [0, 0.58, 0.42],
    ],
    { parent: spine.joints[2], names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.58, 0.42], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.54, 0.5], aim: [0, 0.52, 0.72], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.46, -0.52],
      [0, 0.43, -0.6],
    ],
    { parent: hips, names: ["tail"], role: "tail" },
  );

  // ---------------------------------------------------------------- body and head
  const body = b.loft(
    [
      { at: [0, 0.43, -0.38], w: 0.3, h: 0.3 },
      { at: [0, 0.44, -0.28], w: 0.5, h: 0.48 },
      { at: [0, 0.45, -0.08], w: 0.55, h: 0.5 },
      { at: [0, 0.46, 0.14], w: 0.54, h: 0.5 },
      { at: [0, 0.5, 0.3], w: 0.46, h: 0.45 },
      { at: [0, 0.56, 0.4], w: 0.38, h: 0.38 },
    ],
    { bone: [spine, neck], color: BODYC, sides: 12, name: "body" },
  );

  const skull = b.loft(
    [
      { at: [0, 0.58, 0.4], w: 0.34, h: 0.34 },
      { at: [0, 0.6, 0.5], w: 0.33, h: 0.33 },
      { at: [0, 0.59, 0.59], w: 0.29, h: 0.28 },
      { at: [0, 0.58, 0.65], w: 0.26, h: 0.24 },
    ],
    { bone: head, color: HEADC, sides: 10, name: "skull" },
  );
  const skin = b.surface(skull);

  // nose pad, nostrils, mouth
  b.part(sph(1, 10, 8), NOSE, { at: [0, 0.585, 0.745], scale: [0.105, 0.075, 0.045], bone: head, name: "nosePad" });
  for (const s of [1, -1])
    b.part(sph(0.013, 6, 5), INK, { at: [s * 0.035, 0.59, 0.785], scale: [1, 0.7, 0.8], bone: head, name: "nostril" });
  const mouth = skin.drape(
    catmull([
      [0.09, 0.54, 0.68],
      [0.055, 0.52, 0.72],
      [0, 0.53, 0.755],
      [-0.055, 0.52, 0.72],
      [-0.09, 0.54, 0.68],
    ]),
    { lift: 0.003 },
  );
  b.sweep(mouth, 0.005, { color: "#4a2d20", sides: 5, name: "mouthLine" });

  // lower jaw with buck teeth
  b.part(sph(1, 10, 8), CHIN, { at: [0, 0.52, 0.68], scale: [0.08, 0.04, 0.075], bone: jaw, name: "chin" });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.02, 0.03, 0.01), "#fff4dc", { at: [s * 0.012, 0.505, 0.75], bone: jaw, name: "tooth" });

  // eyes, whiskers dots, cheeks
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.2, 0.66, 0.55]);
    b.stick(sph(0.03, 10, 8), INK, hit, { embed: 0.45 });
    const hp = hit.at
      .clone()
      .addScaledVector(hit.axis, 0.022)
      .add(new THREE.Vector3(-s * 0.004, 0.013, 0.012));
    b.part(sph(0.01, 6, 5), "#ffffff", { at: hp, bone: head, name: "eyeShine" });
    const hp2 = hit.at
      .clone()
      .addScaledVector(hit.axis, 0.02)
      .add(new THREE.Vector3(s * 0.006, -0.012, -0.006));
    b.part(sph(0.005, 5, 4), "#ffffff", { at: hp2, bone: head, name: "eyeShine2" });
    // brow tuft
    const brow = skin.nearest([s * 0.17, 0.72, 0.56]);
    b.stick(sph(0.03, 6, 5), "#a8692f", brow, { embed: 0.4, scale: [1.2, 0.45, 0.8] });
    // blush
    const cheek = skin.nearest([s * 0.18, 0.57, 0.62]);
    b.stick(sph(0.036, 8, 6), "#e59a78", cheek, { embed: 0.6, scale: [1, 0.3, 1] });
    // ears
    b.part(sph(1, 8, 6), EAR, {
      at: [s * 0.11, 0.75, 0.45],
      scale: [0.034, 0.05, 0.02],
      rotation: [0, s * 35, -s * 25],
      bone: head,
      name: "ear",
    });
    b.part(sph(1, 8, 6), EARIN, {
      at: [s * 0.118, 0.748, 0.465],
      scale: [0.021, 0.034, 0.01],
      rotation: [0, s * 35, -s * 25],
      bone: head,
      name: "earInner",
    });
    // whiskers
    for (let k = 0; k < 4; k++) {
      const a: [number, number, number] = [s * 0.09, 0.6 - k * 0.012, 0.7];
      const dir = new THREE.Vector3(s * 1, (k - 1.5) * 0.28, 0.55).normalize();
      const tip: [number, number, number] = [a[0] + dir.x * 0.15, a[1] + dir.y * 0.15, a[2] + dir.z * 0.15];
      b.rod(a, tip, [0.0026, 0.0007], "#5a3b25", { sides: 4, bone: head, name: "whisker" });
    }
  }
  const dots = skin.scatter(16, {
    rng: rng(9),
    minDist: 0.03,
    filter: (h) => h.at.z > 0.6 && h.at.y > 0.54 && h.at.y < 0.63 && Math.abs(h.at.x) > 0.04 && h.n.z > 0.2,
  });
  for (const h of dots) b.stick(sph(0.006, 5, 4), "#6b4630", h, { embed: 0.5 });

  // tail stub
  b.sweep(tail, [0.035, 0.012], { color: "#9b5f2e", name: "tailStub" });

  // ---------------------------------------------------------------- legs
  const addFoot = (hand: Joint, x: number, z: number) => {
    b.part(sph(1, 8, 6), TOE, { at: [x, 0.034, z + 0.03], scale: [0.06, 0.036, 0.075], bone: hand, name: "footPad" });
    for (const o of [-0.038, -0.013, 0.013, 0.038]) {
      const zt = z + 0.1 - Math.abs(o) * 0.6;
      b.part(sph(1, 6, 5), TOE, { at: [x + o, 0.02, zt], scale: [0.019, 0.016, 0.026], bone: hand, name: "toe" });
      b.spike([x + o, 0.018, zt + 0.02], [0, -0.05, 1], 0.02, 0.009, NAIL, { bone: hand, sides: 5, name: "nail" });
    }
  };
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const fPts = limb([s * 0.19, 0.37, 0.2], [s * 0.19, 0.05, 0.24], [0.2, 0.18], [0, 0, -1]);
    const front = b.chain(`legF${S}`, polyline(fPts), {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "leg",
    });
    b.sweep(front, [0.085, 0.07, 0.058, 0.054], { color: LEGC, sides: 10, name: `legF${S}` });
    addFoot(front.joints[front.joints.length - 1], s * 0.19, 0.24);

    const hPts = limb([s * 0.2, 0.37, -0.28], [s * 0.19, 0.05, -0.26], [0.2, 0.18], [0, 0, 1]);
    const hind = b.chain(`legH${S}`, polyline(hPts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(hind, [0.115, 0.09, 0.064, 0.055], { color: LEGC, sides: 10, name: `legH${S}` });
    addFoot(hind.joints[hind.joints.length - 1], s * 0.19, -0.26);
  }

  // ---------------------------------------------------------------- fur cards
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M2 64 Q8 30 11 4 Q16 34 18 64 Z" fill="#ffffff"/><path d="M12 64 Q18 24 24 0 Q27 34 30 64 Z" fill="#e6e6e6"/><path d="M8 64 Q14 40 16 20 Q22 40 24 64 Z" fill="#f4f4f4"/></svg>`,
    { size: 128 },
  );
  const bodyHits = b.surface(body).scatter(420, { rng: rng(3), minDist: 0.035, filter: (h) => h.n.y > -0.2 });
  b.cards(bodyHits, tuft, {
    size: [0.04, 0.07],
    lean: 70,
    bend: 30,
    vary: 0.3,
    spin: 25,
    rng: rng(4),
    color: furTint,
    name: "furBody",
  });
  const headHits = skin.scatter(110, {
    rng: rng(6),
    minDist: 0.03,
    filter: (h) =>
      h.at.z < 0.68 && h.n.y > -0.1 && !(Math.abs(h.at.x) < 0.06 && h.at.z > 0.4 && h.at.z < 0.6 && h.n.y > 0.5),
  });
  b.cards(headHits, tuft, {
    size: [0.026, 0.045],
    lean: 70,
    bend: 30,
    vary: 0.3,
    spin: 25,
    rng: rng(7),
    color: gradient(coatBase, "#d9a56b", [0, 0.6, 0.5], [0, 0.58, 0.78]),
    name: "furHead",
  });

  // ---------------------------------------------------------------- bird
  const BZ = 0.5;
  const CROWN = 0.765;
  const BY = CROWN + 0.082;
  const BLUE = "#5b86c9";
  const BLUEDK = "#3d62a8";
  const YELLOW = "#f4c63c";
  const CREAM = "#fbf5e2";

  const birdBase = b.joint("birdBase", { parent: head, at: [0, CROWN, BZ], dir: [0, 1, 0.1] });
  const hy = BY + 0.042;
  const hz = BZ + 0.05;
  const birdHead = b.joint("birdHead", { parent: birdBase, at: [0, hy, hz], dir: [0, 0.1, 1] });
  const birdTail = b.joint("birdTail", {
    parent: birdBase,
    at: [0, BY - 0.005, BZ - 0.05],
    dir: [0, -0.3, -1],
    role: "tail",
  });

  b.part(sph(1, 12, 9), countershade(BLUE, YELLOW, { level: 0.1, soft: 0.3 }), {
    at: [0, BY, BZ],
    scale: [0.04, 0.042, 0.058],
    rotation: [-18, 0, 0],
    bone: birdBase,
    name: "birdBody",
  });
  const bh = b.part(sph(0.03, 10, 8), countershade(BLUE, CREAM, { level: 0.25, soft: 0.12 }), {
    at: [0, hy, hz],
    bone: birdHead,
    name: "birdHead",
  });
  const bhSkin = b.surface(bh);
  b.spike([0, hy - 0.002, hz + 0.025], [0, -0.08, 1], 0.032, 0.01, "#3b3b3b", { bone: birdHead, sides: 6, name: "beakUpper" });
  b.spike([0, hy - 0.01, hz + 0.024], [0, -0.25, 1], 0.022, 0.006, "#2b2b2b", { bone: birdHead, sides: 5, name: "beakLower" });
  for (const s of [1, -1]) {
    b.part(sph(0.007, 6, 5), INK, { at: [s * 0.026, hy + 0.005, hz + 0.014], bone: birdHead, name: "birdEye" });
    b.part(sph(0.0025, 4, 3), "#ffffff", { at: [s * 0.031, hy + 0.008, hz + 0.017], bone: birdHead, name: "birdEyeShine" });
    const stripe = bhSkin.drape(
      catmull([
        [s * 0.03, hy + 0.004, hz + 0.027],
        [s * 0.032, hy + 0.004, hz],
        [s * 0.028, hy + 0.002, hz - 0.026],
      ]),
      { lift: 0.001 },
    );
    b.sweep(stripe, 0.0035, { color: INK, sides: 4, name: "birdStripe" });

    // wing
    const wing = b.joint(`wing${s === 1 ? "L" : "R"}`, {
      parent: birdBase,
      at: [s * 0.037, BY + 0.012, BZ + 0.02],
      dir: [0, -0.15, -1],
      role: "wing",
    });
    b.sweep(
      catmull([
        [s * 0.037, BY + 0.014, BZ + 0.025],
        [s * 0.044, BY - 0.004, BZ - 0.03],
        [s * 0.04, BY - 0.02, BZ - 0.085],
      ]),
      (t) => [0.005, 0.022 * (1 - 0.65 * t) + 0.004],
      { color: stripes(BLUEDK, "#eef0e0", { size: 0.03, axis: "z", width: 0.22 }), bone: wing, caps: { start: "round", end: "point" }, name: "birdWing" },
    );

    // legs and toes
    b.rod([s * 0.014, BY - 0.034, BZ + 0.005], [s * 0.014, CROWN - 0.006, BZ + 0.012], 0.0035, "#6b5a4a", {
      sides: 4,
      bone: birdBase,
      name: "birdLeg",
    });
    for (let k = 0; k < 3; k++)
      b.rod([s * 0.014, CROWN - 0.004, BZ + 0.012], [s * 0.014 + (k - 1) * 0.009, CROWN - 0.003, BZ + 0.042], 0.003, "#6b5a4a", {
        sides: 4,
        bone: birdBase,
        name: "birdToe",
      });
  }
  b.sweep(
    polyline([
      [0, BY - 0.008, BZ - 0.045],
      [0, BY - 0.03, BZ - 0.125],
    ]),
    (t) => [0.008 + 0.014 * t, 0.003],
    { color: BLUEDK, bone: birdTail, caps: { start: "round", end: "flat" }, name: "birdTail" },
  );

  return b.root;
}
