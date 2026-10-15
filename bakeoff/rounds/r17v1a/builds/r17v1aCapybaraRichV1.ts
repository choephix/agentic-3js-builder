import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with a Small Bird",
  description:
    "A chubby, sleepy-eyed storybook capybara chewing a blade of grass, a daisy tucked by its ear, with a little round bluebird perched on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// palette
const COAT = "#b87a42";
const COAT_HI = "#cf9456";
const COAT_DK = "#8a5428";
const BELLY = "#e6bd80";
const BELLY_DK = "#cfa468";
const SNOUT_DK = "#6e4426";
const LEG_DK = "#6b4125";
const NOSE_PAD = "#4a3026";
const NOSTRIL = "#1d1411";
const EYE = "#1b1210";
const WHITE = "#fffaf0";
const BLUSH = "#f2998a";
const BLUSH_HI = "#f8b9a8";
const TOOTH = "#f7e4b0";
const NAIL = "#3f2b1f";
const EAR_IN = "#e0968a";
const WHISKER = "#4a3326";
const GRASS = "#82c84c";
const GRASS_DK = "#56a238";
const PETAL = "#fffdf6";
const DAISY_C = "#ffc93a";
const BIRD_BLUE = "#4aa6ea";
const BIRD_DK = "#2a66bf";
const BIRD_CREAM = "#fff0d2";
const BIRD_ORANGE = "#f7a152";
const BEAK = "#ffb23c";
const BEAK_LO = "#f08a2c";
const BIRD_LEG = "#e8803a";
const BIRD_BLUSH = "#ff8f9c";

export default function build() {
  const b = createBuilder({ name: "capybara", paintSize: 1024 });

  // ---------- paints ----------
  const furTop = grain(mottle(COAT, COAT_HI, { size: 0.16, seed: 4, contrast: 0.7 }), COAT_DK, {
    size: 0.03,
    axis: "z",
    seed: 2,
  });
  const furBelly = grain(BELLY, BELLY_DK, { size: 0.03, axis: "z", seed: 5 });
  const coat = countershade(furTop, furBelly, { level: -0.2, soft: 0.25 });
  const headCoat = gradient(coat, SNOUT_DK, [0, 0.5, 0.62], [0, 0.5, 0.86]);
  const legCoat = gradient(coat, LEG_DK, [0, 0.2, 0], [0, 0.04, 0]);
  const earCoat = grain(COAT_DK, SNOUT_DK, { size: 0.02, axis: "y", seed: 8 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.37, -0.4], dir: [0, 0.03, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.4],
      [0, 0.385, -0.12],
      [0, 0.395, 0.14],
      [0, 0.405, 0.34],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.405, 0.34],
      [0, 0.45, 0.46],
      [0, 0.485, 0.55],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), aim: [0, 0.5, 0.9], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.4, 0.6], aim: [0, 0.37, 0.8], role: "jaw" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.37, -0.4], w: 0.5, h: 0.46 },
      { at: [0, 0.385, -0.15], w: 0.56, h: 0.46 },
      { at: [0, 0.385, 0.12], w: 0.56, h: 0.46 },
      { at: [0, 0.4, 0.3], w: 0.5, h: 0.44 },
      { at: [0, 0.44, 0.42], w: 0.3, h: 0.32 },
    ],
    { bone: [hips, spine, neck], sides: 10, color: coat, name: "body" },
  );

  // tail nub
  const tail = b.chain(
    "tail",
    [
      [0, 0.34, -0.6],
      [0, 0.33, -0.66],
    ],
    { parent: hips, names: ["tail1"], role: "tail" },
  );
  b.sweep(tail, [0.04, 0.03], { color: coat, caps: "round", sides: 6 });

  // ---------- legs ----------
  const toeGeo = new THREE.SphereGeometry(1, 5, 4);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // front leg
    const fx = s * 0.185;
    const front = b.chain(
      `legF${S}`,
      catmull([
        [fx, 0.31, 0.2],
        [fx, 0.17, 0.19],
        [s * 0.178, 0.065, 0.235],
      ]),
      { parent: spine.joints[2], names: [`shoulderF${S}`, `elbowF${S}`, `wristF${S}`], role: "leg" },
    );
    b.sweep(front, [0.1, 0.075, 0.065], { color: legCoat, sides: 8 });
    const wristF = front.joints[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), legCoat, {
      bone: wristF,
      at: [s * 0.178, 0.035, 0.272],
      scale: [0.072, 0.046, 0.1],
    });
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.034;
      const x = s * 0.178 + dx;
      const name = `toeF${S}${i + 1}`;
      const toe = b.chain(
        name,
        [
          [x, 0.026, 0.285],
          [x + dx * 0.15, 0.022, 0.345],
        ],
        { parent: wristF, names: [name], role: "digit" },
      );
      b.sweep(toe, [0.02, 0.017], { color: legCoat, sides: 6 });
      b.part(toeGeo, NAIL, {
        bone: toe.joints[0],
        at: [x + dx * 0.15, 0.022, 0.357],
        scale: [0.016, 0.012, 0.014],
      });
    }

    // hind leg
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: hips,
      at: [s * 0.215, 0.3, -0.36],
      scale: [0.105, 0.17, 0.2],
    });
    const hx = s * 0.21;
    const hind = b.chain(
      `legH${S}`,
      catmull([
        [hx, 0.33, -0.36],
        [s * 0.225, 0.2, -0.28],
        [s * 0.2, 0.065, -0.385],
      ]),
      { parent: hips, names: [`hipH${S}`, `kneeH${S}`, `ankleH${S}`], role: "leg" },
    );
    b.sweep(hind, [0.11, 0.075, 0.058], { color: legCoat, sides: 8 });
    const ankleH = hind.joints[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), legCoat, {
      bone: ankleH,
      at: [s * 0.2, 0.035, -0.345],
      scale: [0.068, 0.046, 0.105],
    });
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.036;
      const x = s * 0.2 + dx;
      const name = `toeH${S}${i + 1}`;
      const toe = b.chain(
        name,
        [
          [x, 0.026, -0.335],
          [x + dx * 0.15, 0.022, -0.275],
        ],
        { parent: ankleH, names: [name], role: "digit" },
      );
      b.sweep(toe, [0.02, 0.017], { color: legCoat, sides: 6 });
      b.part(toeGeo, NAIL, {
        bone: toe.joints[0],
        at: [x + dx * 0.15, 0.022, -0.263],
        scale: [0.016, 0.012, 0.014],
      });
    }
  }

  // ---------- head ----------
  const skull = b.loft(
    [
      { at: [0, 0.51, 0.53], w: 0.26, h: 0.3 },
      { at: [0, 0.515, 0.66], w: 0.3, h: 0.31 },
      { at: [0, 0.5, 0.77], w: 0.27, h: 0.27 },
      { at: [0, 0.49, 0.83], w: 0.24, h: 0.24 },
    ],
    { bone: head, caps: { start: "flat", end: "flat" }, sides: 10, color: headCoat, name: "skull" },
  );
  // chubby cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), headCoat, {
      bone: head,
      at: [s * 0.11, 0.46, 0.68],
      scale: [0.075, 0.075, 0.1],
    });
  }

  // lower jaw
  b.sweep(
    catmull([
      [0, 0.372, 0.64],
      [0, 0.362, 0.72],
      [0, 0.36, 0.79],
    ]),
    (t) => [0.1 - 0.025 * t, 0.046 - 0.004 * t],
    { bone: jaw, color: furBelly, sides: 10, caps: "round", name: "lowerJaw" },
  );

  // nose pad, nostrils, scent bump
  b.part(new THREE.SphereGeometry(1, 10, 8), NOSE_PAD, {
    bone: head,
    at: [0, 0.495, 0.835],
    scale: [0.105, 0.085, 0.04],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 5), NOSTRIL, {
      bone: head,
      at: [s * 0.042, 0.52, 0.86],
      scale: [0.022, 0.016, 0.012],
    });
    b.part(new THREE.SphereGeometry(1, 5, 4), WHITE, {
      bone: head,
      at: [s * 0.05, 0.505, 0.874],
      scale: [0.007, 0.005, 0.004],
    });
  }
  const bumpHit = b.surface(skull).ray([0, 1, 0.74], [0, -1, 0]);
  if (bumpHit) {
    b.stick(new THREE.SphereGeometry(1, 8, 5), SNOUT_DK, bumpHit, {
      embed: 0.3,
      scale: [0.045, 0.016, 0.06],
    });
  }

  // mouth seam draped over the muzzle
  const seamPts: number[][] = [];
  for (const [x, y, z] of [
    [-0.13, 0.4, 0.62],
    [-0.125, 0.394, 0.7],
    [-0.1, 0.388, 0.78],
    [-0.045, 0.382, 0.832],
    [0, 0.38, 0.84],
    [0.045, 0.382, 0.832],
    [0.1, 0.388, 0.78],
    [0.125, 0.394, 0.7],
    [0.13, 0.4, 0.62],
  ])
    seamPts.push([x, y, z]);
  b.sweep(b.surface(skull).drape(catmull(seamPts), { lift: 0.002 }), 0.0045, { color: NOSE_PAD, sides: 4 });

  // buck teeth
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.022, 0.04, 0.012), TOOTH, { bone: head, at: [s * 0.013, 0.362, 0.838] });
  }

  // whiskers
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const hit = b.surface(skull).ray([s * 0.5, 0.44 + i * 0.018, 0.8], [-s, 0, 0]);
      if (hit)
        b.spike(frame(offset(hit.at, hit.n, -0.002), hit.n), [s * 0.8, 0.1 + (i - 1) * 0.28, 0.45], 0.11, 0.0028, {
          color: WHISKER,
          bone: head,
          sides: 4,
        });
    }
  }

  // eyes: round, dark, sleepy lids
  for (const s of [1, -1]) {
    const hit = b.surface(skull).ray([s * 0.5, 0.58, 0.7], [-s, 0, 0]);
    if (!hit) throw new Error("eye ray missed");
    const c = offset(hit.at, hit.n, -0.008);
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, { bone: head, at: c });
    const hd = hit.n.clone().add(new THREE.Vector3(s * 0.05, 0.55, 0.75)).normalize();
    b.part(new THREE.SphereGeometry(0.0085, 5, 4), WHITE, {
      bone: head,
      at: [c.x + hd.x * 0.027, c.y + hd.y * 0.027, c.z + hd.z * 0.027],
    });
    const hd2 = hit.n.clone().add(new THREE.Vector3(-s * 0.2, -0.5, -0.3)).normalize();
    b.part(new THREE.SphereGeometry(0.004, 4, 3), WHITE, {
      bone: head,
      at: [c.x + hd2.x * 0.028, c.y + hd2.y * 0.028, c.z + hd2.z * 0.028],
    });
    b.part(new THREE.SphereGeometry(0.0335, 8, 5, 0, Math.PI * 2, 0, 1.25), COAT_DK, {
      bone: head,
      at: c,
      dir: [s * 0.25, 1, 0.05],
    });
    // lash flick
    b.sweep(
      bezier(
        offset(c, [s * 0.5, 0.4, 0.9], 0.03),
        offset(c, [s * 0.7, 0.3, 0.7], 0.045),
        offset(c, [s * 0.9, 0.2, 0.2], 0.052),
      ),
      [0.004, 0.001],
      { color: EYE, bone: head, sides: 4 },
    );
    // brow tuft
    b.sweep(
      bezier(
        offset(c, [s * 0.1, 0.9, 0.4], 0.052),
        offset(c, [s * 0.5, 0.8, 0.2], 0.058),
        offset(c, [s * 1, 0.4, -0.2], 0.052),
      ),
      [0.008, 0.004],
      { color: COAT_DK, bone: head, sides: 5 },
    );
  }

  // blush
  const blush = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="20" rx="30" ry="18" fill="${BLUSH}"/><ellipse cx="30" cy="17" rx="17" ry="9" fill="${BLUSH_HI}"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const hit = b.surface(skull).ray([s * 0.5, 0.485, 0.715], [-s, 0, 0]);
    if (hit) b.decal(skull, blush, { at: hit, size: [0.085, 0.055], mirror: s > 0, bone: head });
  }

  // ears with pink inner
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hit = b.surface(skull).ray([s * 0.105, 1, 0.575], [0, -1, 0]);
    if (!hit) throw new Error("ear ray missed");
    const base = offset(hit.at, [0, 1, 0], -0.014);
    const ear = b.joint(`ear${S}`, { parent: head, at: base, dir: [s * 0.45, 1, -0.2], role: "hinge" });
    const ex: [number, number, number] = [s, 0, 0];
    const ey: [number, number, number] = [s * 0.45, 1, -0.2];
    b.extrude(
      [
        [-0.04, 0],
        [0.04, 0],
        [0.047, 0.04],
        [0.03, 0.08],
        [-0.03, 0.08],
        [-0.047, 0.04],
      ],
      { at: base, x: ex, y: ey, thickness: 0.026, bevel: 0.008, smoothing: 2, color: earCoat, bone: ear },
    );
    b.extrude(
      [
        [-0.024, 0.006],
        [0.024, 0.006],
        [0.03, 0.04],
        [0.018, 0.066],
        [-0.018, 0.066],
        [-0.03, 0.04],
      ],
      { at: offset(base, [0, 0, 1], 0.003), x: ex, y: ey, thickness: 0.03, bevel: 0.004, smoothing: 2, color: EAR_IN, bone: ear },
    );
  }

  // blade of grass in the corner of the mouth
  {
    const hit = b.surface(skull).ray([0.5, 0.392, 0.8], [-1, 0, 0]);
    if (!hit) throw new Error("grass ray missed");
    const p0 = offset(hit.at, hit.n, -0.012);
    const blade = (p: number[], q: number[], r: number[], w: number, col: string) =>
      b.sweep(catmull([p, q, r]), (t) => [w * (1 - 0.85 * t) + 0.0015, 0.0022], {
        color: col,
        bone: head,
        caps: "point",
        sides: 6,
      });
    blade(
      [p0.x, p0.y, p0.z],
      [p0.x + 0.07, p0.y + 0.0, p0.z + 0.09],
      [p0.x + 0.135, p0.y + 0.05, p0.z + 0.15],
      0.0075,
      GRASS,
    );
    blade(
      [p0.x, p0.y, p0.z + 0.005],
      [p0.x + 0.06, p0.y + 0.01, p0.z + 0.06],
      [p0.x + 0.11, p0.y + 0.0, p0.z + 0.145],
      0.0055,
      GRASS_DK,
    );
  }

  // ---------- fur tufts ----------
  const tuft = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg"><path d="M4 80 C6 50 10 20 18 2 C22 24 24 52 26 80Z" fill="#ffffff"/><path d="M14 80 C16 54 24 30 36 6 C36 32 32 56 32 80Z" fill="#cdcdcd"/><path d="M0 80 C2 62 4 46 8 30 C12 48 12 66 12 80Z" fill="#e4e4e4"/></svg>`,
    { size: 128 },
  );
  const bodyHits = b.surface(body).scatter(240, { rng: rng(11), minDist: 0.04, filter: (h) => h.n.y > -0.3 });
  b.cards(bodyHits, tuft, { size: [0.05, 0.08], lean: 70, bend: 25, vary: 0.3, rng: rng(12), color: coat, flow: [0, -0.15, -1] });
  const cheekHits = b
    .surface(skull)
    .scatter(70, { rng: rng(13), minDist: 0.035, filter: (h) => h.n.y < 0.4 && h.at.z < 0.75 && h.at.z > 0.56 });
  b.cards(cheekHits, tuft, { size: [0.035, 0.055], lean: 75, bend: 20, vary: 0.3, rng: rng(14), color: headCoat, flow: [0, -0.1, -1] });

  // ---------- daisy by the left ear ----------
  {
    const hit = b.surface(skull).ray([0.088, 1, 0.665], [0, -1, 0]);
    if (!hit) throw new Error("daisy ray missed");
    const c = offset(hit.at, hit.n, 0.006);
    const ring = b.ring(frame(c, hit.n), { count: 8, radius: 0 });
    for (const item of ring.items) {
      b.part(new THREE.SphereGeometry(1, 6, 4), PETAL, {
        bone: head,
        at: offset(item.at, item.outward, 0.016),
        dir: item.outward,
        up: hit.n,
        scale: [0.0085, 0.019, 0.0028],
      });
    }
    b.part(new THREE.SphereGeometry(0.0115, 6, 4), DAISY_C, { bone: head, at: offset(c, hit.n, 0.002), scale: [1, 0.6, 1] });
    for (const a of [-1, 1]) {
      b.part(new THREE.SphereGeometry(1, 6, 4), GRASS_DK, {
        bone: head,
        at: [c.x + a * 0.03, c.y - 0.003, c.z - 0.03],
        scale: [0.009, 0.004, 0.02],
        rotation: [0, a * 35, 0],
      });
    }
  }

  // ---------- the bird ----------
  const crown = b.surface(skull).ray([0, 1, 0.6], [0, -1, 0]);
  if (!crown) throw new Error("crown ray missed");
  const y0 = crown.at.y;
  const z0 = 0.6;
  const yb = y0 + 0.073;

  const breastX = (p: THREE.Vector3, n: THREE.Vector3) => n.z > 0.15 && n.y < 0.6 && p.y < yb + 0.04 && p.z > z0 - 0.02;
  const birdBack = countershade(BIRD_BLUE, BIRD_CREAM, { level: -0.15, soft: 0.2 });
  const birdCoat = paint((p, n) => (breastX(p, n) ? BIRD_ORANGE : birdBack));

  const birdSpine = b.chain(
    "birdSpine",
    catmull([
      [0, yb - 0.005, z0 - 0.04],
      [0, yb + 0.005, z0 + 0.015],
      [0, yb + 0.03, z0 + 0.05],
    ]),
    { parent: head, names: ["birdSpine1", "birdSpine2"], role: "spine" },
  );
  b.loft(
    [
      { at: [0, yb - 0.005, z0 - 0.05], w: 0.09, h: 0.09 },
      { at: [0, yb, z0 - 0.01], w: 0.115, h: 0.115 },
      { at: [0, yb + 0.005, z0 + 0.03], w: 0.11, h: 0.11 },
    ],
    { bone: birdSpine, sides: 10, color: birdCoat, name: "birdBody", caps: "round" },
  );
  const birdHead = b.joint("birdHead", {
    parent: birdSpine.joints[1],
    at: [0, yb + 0.04, z0 + 0.04],
    dir: [0.1, 0.5, 1],
  });
  const headPart = b.part(new THREE.SphereGeometry(0.046, 10, 8), birdCoat, {
    bone: birdHead,
    at: [0, yb + 0.058, z0 + 0.058],
  });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: [0, yb + 0.05, z0 + 0.09],
    aim: [0, yb + 0.046, z0 + 0.12],
    role: "jaw",
  });
  b.spike([0, yb + 0.062, z0 + 0.092], [0, -0.16, 1], 0.042, 0.0145, { bone: birdHead, color: BEAK, sides: 6 });
  b.spike([0, yb + 0.05, z0 + 0.094], [0, -0.05, 1], 0.03, 0.011, { bone: birdJaw, color: BEAK_LO, sides: 6 });

  const bsurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const eyeHit = bsurf.around(headPart.at).at(s * 62, 18);
    if (eyeHit) {
      const ec = offset(eyeHit.at, eyeHit.n, -0.002);
      b.part(new THREE.SphereGeometry(0.0105, 6, 5), EYE, { bone: birdHead, at: ec });
      b.part(new THREE.SphereGeometry(0.0038, 4, 3), WHITE, {
        bone: birdHead,
        at: [ec.x + s * 0.003, ec.y + 0.006, ec.z + 0.006],
      });
    }
    const cheek = bsurf.around(headPart.at).at(s * 72, -18);
    if (cheek) {
      b.part(new THREE.SphereGeometry(1, 6, 4), BIRD_BLUSH, {
        bone: birdHead,
        at: offset(cheek.at, cheek.n, -0.001),
        dir: cheek.n,
        scale: [0.011, 0.004, 0.008],
      });
    }
    // head crest feathers
    const cb = bsurf.around(headPart.at).at(s * 12, 82);
    if (cb) {
      b.sweep(
        bezier(
          offset(cb.at, cb.n, -0.004),
          offset(cb.at, [s * 0.3, 1, -0.2], 0.022),
          offset(cb.at, [s * 0.5, 0.9, -0.7], 0.04),
        ),
        [0.0085, 0],
        { color: BIRD_DK, bone: birdHead, sides: 5 },
      );
    }
  }
  {
    const cb = bsurf.around(headPart.at).at(0, 80);
    if (cb) {
      b.sweep(
        bezier(
          offset(cb.at, cb.n, -0.004),
          offset(cb.at, [0, 1, -0.1], 0.03),
          offset(cb.at, [0, 0.8, -0.9], 0.052),
        ),
        [0.01, 0],
        { color: BIRD_BLUE, bone: birdHead, sides: 5 },
      );
    }
  }

  // wings
  const wingOutline: [number, number][] = [
    [0, 0.03],
    [0.025, 0.04],
    [0.06, 0.03],
    [0.1, 0.0],
    [0.125, -0.025],
    [0.085, -0.036],
    [0.045, -0.04],
    [0.012, -0.034],
    [-0.004, 0],
  ];
  const wingCov: [number, number][] = [
    [0.0, 0.026],
    [0.022, 0.034],
    [0.05, 0.026],
    [0.066, 0.004],
    [0.04, -0.012],
    [0.012, -0.012],
    [-0.002, 0.008],
  ];
  const wingPaint = stripes2();
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wj = b.joint(`birdWing${S}`, {
      parent: birdSpine.joints[0],
      at: [s * 0.054, yb + 0.022, z0 + 0.025],
      dir: [s * 0.2, -0.1, -1],
      role: "wing",
    });
    b.extrude(wingOutline, {
      at: [s * 0.055, yb + 0.022, z0 + 0.03],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.011,
      bevel: 0.004,
      smoothing: 1,
      color: wingPaint,
      bone: wj,
    });
    b.extrude(wingCov, {
      at: [s * 0.058, yb + 0.022, z0 + 0.026],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.013,
      bevel: 0.004,
      smoothing: 1,
      color: BIRD_BLUE,
      bone: wj,
    });
  }

  // tail feathers
  const birdTail = b.joint("birdTail", {
    parent: birdSpine.joints[0],
    at: [0, yb + 0.0, z0 - 0.07],
    dir: [0, 0.25, -1],
    role: "tail",
  });
  for (const a of [-0.3, 0, 0.3]) {
    b.extrude(
      [
        [0, -0.013],
        [0.04, -0.016],
        [0.08, -0.008],
        [0.095, 0, "sharp"],
        [0.08, 0.008],
        [0.04, 0.016],
        [0, 0.013],
      ],
      {
        at: [0, yb + 0.003 - Math.abs(a) * 0.004, z0 - 0.065],
        x: [a, 0.16, -1],
        y: [1, 0, a],
        thickness: 0.008,
        bevel: 0.0025,
        smoothing: 1,
        color: a === 0 ? BIRD_DK : BIRD_BLUE,
        bone: birdTail,
      },
    );
  }

  // legs and toes
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const foot = b.surface(skull).ray([s * 0.026, 1, z0 + 0.0], [0, -1, 0]);
    if (!foot) throw new Error("bird foot ray missed");
    const fy = foot.at.y + 0.002;
    const leg = b.chain(
      `birdLeg${S}`,
      [
        [s * 0.026, yb - 0.035, z0],
        [s * 0.026, fy + 0.004, z0 + 0.004],
      ],
      { parent: birdSpine.joints[0], names: [`birdLeg${S}`, `birdFoot${S}`], role: "leg" },
    );
    b.sweep(leg, 0.0042, { color: BIRD_LEG, sides: 5, caps: "round" });
    const ft = leg.joints[1];
    for (const [dx, dz] of [
      [-0.012, 0.03],
      [0, 0.034],
      [0.012, 0.03],
      [0, -0.022],
    ] as const) {
      b.sweep(
        [
          [s * 0.026, fy + 0.004, z0 + 0.004],
          [s * 0.026 + dx, fy + 0.003, z0 + 0.004 + dz],
        ],
        0.0033,
        { color: BIRD_LEG, bone: ft, sides: 4, caps: "round" },
      );
    }
  }

  return b.root;

  function stripes2() {
    // painted flight-feather bars on the wing: s = outline x/y in metres
    return paint((_p, _n, s) => {
      const bar = Math.floor((s[0] + 0.01) / 0.02) % 2 === 0;
      if (s[0] > 0.06) return BIRD_DK;
      return bar ? BIRD_DK : "#3a78cc";
    });
  }
}
