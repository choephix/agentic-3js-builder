import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { cells, countershade, gradient, grain, mix, mottle, paint, resolve, smoothstep } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with a Songbird",
  description:
    "A chubby, drowsy-eyed capybara with blushing cheeks, buck teeth and a daisy behind one ear, wearing a singing bluebird on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const FUR = "#b87a40";
const FUR_DARK = "#8c5630";
const FUR_LIGHT = "#d9a463";
const BELLY = "#e6bf8c";
const PAW = "#7a4d34";
const CLAW = "#3f2b24";
const NOSE = "#4a312d";
const NOSTRIL = "#1d1311";
const PINK = "#f3a29c";
const INNER_EAR = "#eb8f8c";
const EYE = "#1b1311";
const LID = "#a16739";
const WHITE = "#fffaf0";
const TOOTH = "#f7e6b8";
const WHISKER = "#3c2b25";
const REED = "#8fc24a";
const REED_DARK = "#5d9a32";
const SEED = "#c9a24a";
const DAISY = "#fffdf6";
const DAISY_EDGE = "#ffe3ec";
const DAISY_EYE = "#ffc531";
const STEM = "#6fb04a";

const BLUE = "#3c8de0";
const BLUE_DARK = "#2859b8";
const BLUE_LIGHT = "#8ccbf6";
const NAVY = "#1f3f8f";
const BREAST = "#f08a3c";
const BIRD_WHITE = "#fff3e0";
const BEAK = "#ffb23a";
const BIRD_LEG = "#c98f5c";
const NOTE_A = "#b46be8";
const NOTE_B = "#34c6b0";

const rgbOf = (c: string): Rgb => {
  const n = parseInt(c.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rand = rng(11);

  // ------------------------------------------------------------------------------------------------------------
  // Fur paint, shared by every furry part so it runs on across body, head and legs.

  const furBase = mottle(FUR, FUR_DARK, { size: 0.22, seed: 3, contrast: 0.5 });
  const furStreaks = grain(furBase, FUR_LIGHT, { size: 0.03, axis: "z", seed: 5 });
  const coat = countershade(furStreaks, BELLY, { level: -0.3, soft: 0.35 });
  const legCoat = gradient(coat, PAW, [0, 0.16, 0], [0, 0.04, 0]);

  const dark = rgbOf("#5e3b2c");
  const pink = rgbOf(PINK);
  const headCoat = paint((p, n) => {
    const base = resolve(coat, p, n);
    // dark blunt muzzle, fading in toward the nose
    const mz = smoothstep(0.52, 0.7, p.z) * smoothstep(0.34, 0.5, p.y) * 0.75;
    let col = mix(base, dark, mz);
    // pink blush on both cheeks
    for (const sx of [1, -1]) {
      const d = Math.hypot(p.x - sx * 0.135, (p.y - 0.4) * 1.1, (p.z - 0.47) * 0.9);
      col = mix(col, pink, (1 - smoothstep(0.02, 0.055, d)) * 0.7);
    }
    // freckles over the muzzle
    if (p.z > 0.44) {
      const c = cells(p, 0.03, 9);
      if (c.d1 < 0.17 && c.id > 0.45) col = mix(col, "#40261d", 0.7);
    }
    return col;
  });

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton

  const hips = b.joint("hips", { at: [0, 0.335, -0.34] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.335, -0.34],
      [0, 0.335, -0.18],
      [0, 0.34, 0.0],
      [0, 0.35, 0.14],
      [0, 0.36, 0.24],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.335, -0.34],
      [0, 0.33, -0.5],
      [0, 0.3, -0.58],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.36, 0.24],
      [0, 0.385, 0.3],
      [0, 0.405, 0.35],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.405, 0.35], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.34, 0.4], aim: [0, 0.285, 0.66], role: "jaw" });

  // ------------------------------------------------------------------------------------------------------------
  // Body, neck, head

  b.loft(
    [
      { at: [0, 0.34, -0.57], w: 0.24, h: 0.26 },
      { at: [0, 0.34, -0.45], w: 0.42, h: 0.4 },
      { at: [0, 0.335, -0.28], w: 0.52, h: 0.44 },
      { at: [0, 0.335, -0.05], w: 0.53, h: 0.44 },
      { at: [0, 0.35, 0.15], w: 0.49, h: 0.42 },
      { at: [0, 0.37, 0.28], w: 0.38, h: 0.36 },
    ],
    { bone: [tail, hips, spine], color: coat, sides: 12, name: "body" },
  );
  b.sweep(neck, [0.18, 0.165], { color: coat, sides: 10, name: "neckTube" });

  const skull = b.loft(
    [
      { at: [0, 0.425, 0.3], w: 0.25, h: 0.27 },
      { at: [0, 0.43, 0.4], w: 0.29, h: 0.28 },
      { at: [0, 0.425, 0.5], w: 0.28, h: 0.27 },
      { at: [0, 0.415, 0.58], w: 0.25, h: 0.25 },
    ],
    { bone: head, color: headCoat, sides: 10, name: "skull" },
  );
  const jawTube = b.loft(
    [
      { at: [0, 0.275, 0.4], w: 0.21, h: 0.09 },
      { at: [0, 0.265, 0.52], w: 0.2, h: 0.09 },
      { at: [0, 0.265, 0.62], w: 0.17, h: 0.08 },
    ],
    { bone: jaw, color: mix(BELLY, "#d9a463", 0.35), sides: 8, name: "lowerJaw" },
  );
  const headSurf = b.surface(skull);

  // nose pad, nostrils, scent-gland bump on the snout
  const noseHit = headSurf.ray([0, 0.405, 1.3], [0, 0, -1]);
  if (!noseHit) throw new Error("nose ray missed");
  const nosePad = b.stick(new THREE.SphereGeometry(0.05, 10, 7).scale(1.4, 0.5, 1.0), NOSE, noseHit, {
    embed: 0.15,
    bone: head,
    name: "nosePad",
  });
  const padSurf = b.surface(nosePad);
  for (const sx of [1, -1]) {
    const h = padSurf.ray([sx * 0.032, 0.405, 1.3], [0, 0, -1]);
    if (h) b.stick(new THREE.SphereGeometry(0.011, 6, 4).scale(1.1, 0.5, 1.3), NOSTRIL, h, { embed: 0.2, bone: head });
  }
  const bumpHit = headSurf.ray([0, 1, 0.55], [0, -1, 0]);
  if (bumpHit)
    b.stick(new THREE.SphereGeometry(0.035, 8, 5).scale(1.1, 0.45, 1.7), "#6a4334", bumpHit, {
      embed: 0.25,
      bone: head,
      name: "snoutBump",
    });

  // buck teeth peeking over the lower lip
  const toothZ = noseHit.at.z - 0.004;
  for (const sx of [1, -1])
    b.part(new THREE.BoxGeometry(0.022, 0.034, 0.011), TOOTH, {
      at: [sx * 0.0125, 0.318, toothZ],
      bone: head,
      name: "tooth",
    });

  // smile line draped over the muzzle
  const smile = headSurf.drape(
    catmull([
      [0.135, 0.335, 0.5],
      [0.1, 0.315, 0.62],
      [0.05, 0.31, 0.69],
      [0, 0.308, 0.705],
      [-0.05, 0.31, 0.69],
      [-0.1, 0.315, 0.62],
      [-0.135, 0.335, 0.5],
    ]),
    { lift: 0.002 },
  );
  b.sweep(smile, 0.0035, { color: "#3b2420", sides: 4, bone: head, name: "smile" });

  // eyes: glossy, half-lidded, content
  for (const sx of [1, -1]) {
    const eyeHit = b.surface(skull).around([0, 0.435, 0.4]).at(sx * 66, 22);
    if (!eyeHit) throw new Error("eye ray missed");
    const eyeC = eyeHit.moved([0, -0.004, 0]);
    b.part(new THREE.SphereGeometry(0.03, 10, 7), EYE, { at: eyeC.at, bone: head, name: "eye" });
    const dirOut = eyeHit.n.clone();
    const lidGeo = new THREE.SphereGeometry(0.035, 10, 5, 0, Math.PI, 0, Math.PI / 2);
    b.part(lidGeo, LID, { at: eyeC.at, dir: dirOut, up: [0, 1, 0], axis: "z", bone: head, name: "lid" });
    const sh = [eyeC.at.x + dirOut.x * 0.024, eyeC.at.y + dirOut.y * 0.024 - 0.002, eyeC.at.z + dirOut.z * 0.024];
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), WHITE, {
      at: [sh[0] + sx * 0.001, sh[1] - 0.001, sh[2] + 0.005],
      bone: head,
      name: "eyeGlint",
    });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), WHITE, {
      at: [sh[0], sh[1] - 0.014, sh[2] - 0.006],
      bone: head,
      name: "eyeGlint2",
    });
  }

  // whiskers
  for (const sx of [1, -1]) {
    const dirs = [-10, 0, 10];
    dirs.forEach((el, i) => {
      const h = b.surface(skull).around([0, 0.4, 0.5]).at(sx * 50, el - 12);
      if (!h) return;
      const w = h.at;
      const path = catmull([
        [w.x, w.y, w.z],
        [w.x + sx * 0.05, w.y + 0.014 + i * 0.006, w.z + 0.035 - i * 0.006],
        [w.x + sx * 0.11, w.y + 0.0 + i * 0.015 - 0.02, w.z + 0.02 - i * 0.015],
      ]);
      b.sweep(path, [0.0028, 0.001], { color: WHISKER, sides: 4, bone: head, caps: "point", name: "whisker" });
    });
  }

  // ears (small, round, pink inside)
  const earOutline: [number, number][] = [
    [-0.036, 0],
    [-0.046, 0.026],
    [-0.025, 0.058],
    [0.025, 0.058],
    [0.046, 0.026],
    [0.036, 0],
  ];
  const innerOutline: [number, number][] = [
    [-0.022, 0.004],
    [-0.029, 0.024],
    [-0.015, 0.045],
    [0.015, 0.045],
    [0.029, 0.024],
    [0.022, 0.004],
  ];
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const base: [number, number, number] = [sx * 0.098, 0.525, 0.335];
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: base,
      dir: [sx * 0.55, 1, -0.2],
      role: "hinge",
    });
    earJoints[sx] = ear;
    b.extrude(earOutline, {
      at: base,
      x: [sx, 0, 0],
      y: [sx * 0.55, 1, -0.2],
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 1,
      color: coat,
      bone: ear,
      name: "ear",
    });
    b.extrude(innerOutline, {
      at: [base[0], base[1] + 0.001, base[2] + 0.002],
      x: [sx, 0, 0],
      y: [sx * 0.55, 1, -0.2],
      thickness: 0.02,
      bevel: 0.004,
      smoothing: 1,
      color: INNER_EAR,
      bone: ear,
      name: "earInner",
    });
  }

  // daisy behind the left ear
  {
    const fh = b.surface(skull).around([0, 0.43, 0.4]).at(112, 38);
    if (!fh) throw new Error("flower ray missed");
    const petalGeo = new THREE.SphereGeometry(0.02, 6, 4).scale(0.5, 1.0, 0.2).translate(0, 0.019, 0);
    const c = fh.moved([0, 0.012, 0]);
    b.part(new THREE.CylinderGeometry(0.003, 0.004, 0.02, 5), STEM, { frame: fh.moved([0, 0.004, 0]), bone: head, name: "stem" });
    const ring = b.ring(c, { count: 9, radius: 0.004, tilt: -8 });
    for (const it of ring.items) b.part(petalGeo, DAISY, { frame: it, bone: head, name: "petal" });
    const ring2 = b.ring(c.moved([0, 0.002, 0]), { count: 9, radius: 0.004, tilt: -8, fromDeg: 20, toDeg: 380 });
    for (const it of ring2.items.slice(0, 8))
      b.part(new THREE.SphereGeometry(0.014, 5, 3).scale(0.5, 1.0, 0.18).translate(0, 0.016, 0), DAISY_EDGE, {
        frame: it,
        bone: head,
        name: "petalInner",
      });
    b.part(new THREE.SphereGeometry(0.011, 8, 5).scale(1, 0.7, 1), DAISY_EYE, {
      frame: c.moved([0, 0.005, 0]),
      bone: head,
      name: "daisyEye",
    });
  }

  // a blade of grass being chewed
  {
    const corner = headSurf.nearest([0.085, 0.31, 0.62]);
    const p0 = corner.at;
    const reed = catmull([
      [p0.x, p0.y, p0.z],
      [p0.x + 0.05, p0.y - 0.005, p0.z + 0.09],
      [p0.x + 0.11, p0.y - 0.045, p0.z + 0.14],
      [p0.x + 0.17, p0.y - 0.12, p0.z + 0.15],
    ]);
    b.sweep(reed, [0.006, 0.0015], { color: REED, sides: 5, bone: jaw, caps: "point", name: "reed" });
    b.sweep(reed.slice(0.35, 0.85), [0.0045, 0.0012], { color: REED_DARK, sides: 4, bone: jaw, caps: "none", name: "reedVein" });
    for (let i = 0; i < 3; i++) {
      const t = 0.9 + i * 0.03;
      const q = reed.at(Math.min(t, 1));
      b.part(new THREE.SphereGeometry(0.008, 5, 4).scale(0.7, 1.5, 0.7), SEED, {
        at: [q.x + 0.004 * (i - 1), q.y - 0.006, q.z + 0.002],
        bone: jaw,
        name: "seed",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Legs

  const fur = b.surface(b.root); // body surface placeholder, rebuilt below once everything is in
  void fur;

  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const x = sx * 0.17;

    // front leg
    const fpts = limb([x, 0.27, 0.12], [x, 0.065, 0.15], [0.12, 0.12], [[0, 0, -1]]);
    const fleg = b.chain(`legF${side}`, fpts, {
      parent: spine.joints[3],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [x, 0, 0.2],
    });
    b.sweep(fleg, [0.095, 0.07, 0.052], { color: legCoat, sides: 8, name: "foreleg" });
    b.sweep(
      polyline([
        [x, 0.06, 0.14],
        [x, 0.035, 0.205],
      ]),
      [0.052, 0.04],
      { bone: fleg.tip!, color: PAW, sides: 8, name: "forefoot" },
    );
    for (let i = 0; i < 4; i++) {
      const off = (i - 1.5) * 0.031;
      const toe = b.chain(
        `toeF${i + 1}${side}`,
        [
          [x + off, 0.032, 0.215],
          [x + off * 1.35, 0.019, 0.268],
        ],
        { parent: fleg.tip!, names: [`toeF${i + 1}${side}`], role: "digit" },
      );
      b.sweep(toe, [0.0165, 0.0145], { bands: [[0.55, PAW], [1, CLAW]], sides: 6, name: "toe" });
    }

    // hind leg
    const hx = sx * 0.2;
    const hpts = limb([hx, 0.31, -0.3], [hx - sx * 0.01, 0.075, -0.35], [0.17, 0.17], [[0, 0, 1]]);
    const hleg = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [hx, 0, -0.3],
    });
    b.sweep(hleg, [0.125, 0.08, 0.055], { color: legCoat, sides: 8, name: "hindleg" });
    b.sweep(
      polyline([
        [hx - sx * 0.01, 0.065, -0.35],
        [hx - sx * 0.005, 0.035, -0.27],
      ]),
      [0.055, 0.04],
      { bone: hleg.tip!, color: PAW, sides: 8, name: "hindfoot" },
    );
    for (let i = 0; i < 3; i++) {
      const off = (i - 1) * 0.036;
      const toe = b.chain(
        `toeH${i + 1}${side}`,
        [
          [hx + off, 0.032, -0.27],
          [hx + off * 1.3, 0.019, -0.215],
        ],
        { parent: hleg.tip!, names: [`toeH${i + 1}${side}`], role: "digit" },
      );
      b.sweep(toe, [0.0175, 0.0155], { bands: [[0.55, PAW], [1, CLAW]], sides: 6, name: "toe" });
    }

    // fur ruffs round the ankles
    const furTex = tuftTexture();
    for (const leg of [fleg, hleg]) {
      const ring = b.ring(leg.tip!, { count: 7, radius: 0.05 });
      b.cards(ring.items, furTex, {
        size: [0.04, 0.055],
        lean: 105,
        flow: [0, -1, 0],
        bend: 20,
        vary: 0.25,
        rng: rand,
        color: legCoat,
        name: "ruff",
      });
    }
  }

  // tail stub
  b.sweep(tail, (t) => 0.05 - 0.035 * t, { color: coat, sides: 8, name: "tailStub" });

  // ------------------------------------------------------------------------------------------------------------
  // Fur cards: head, chest, back, belly

  const tuft = tuftTexture();
  const bodySurf = b.surface(b.root);
  // restrict body tufts to the body mesh by filtering on position
  const bodyHits = bodySurf.scatter(260, {
    rng: rng(21),
    minDist: 0.05,
    filter: (h) => h.at.z < 0.27 && h.at.z > -0.55 && h.at.y > 0.13 && h.n.y > -0.7 && Math.abs(h.at.x) < 0.3 && h.at.y < 0.58,
  });
  b.cards(bodyHits, tuft, { size: [0.045, 0.07], lean: 62, bend: 25, vary: 0.3, rng: rng(22), color: coat, name: "bodyFur" });

  const cheekHits = b.surface(skull).scatter(70, {
    rng: rng(31),
    minDist: 0.04,
    filter: (h) => h.at.z > 0.3 && h.at.z < 0.5 && Math.abs(h.at.x) > 0.095 && h.n.y < 0.5 && h.at.y < 0.46,
  });
  b.cards(cheekHits, tuft, { size: [0.035, 0.05], lean: 70, bend: 20, vary: 0.3, rng: rng(32), color: headCoat, name: "cheekFur" });

  for (const sx of [1, -1]) {
    // brow tufts over each eye
    const brow = b.surface(skull).around([0, 0.435, 0.4]).at(sx * 62, 44);
    if (brow)
      b.cards([brow], tuft, { size: [0.03, 0.04], lean: 70, flow: [0, 0.2, -1], vary: 0, color: FUR_DARK, cross: true, name: "brow" });
    // fur fringe on the back edge of each ear
    const eh = b.surface(skull).around([0, 0.43, 0.36]).at(sx * 135, 50);
    if (eh) b.cards([eh], tuft, { size: [0.03, 0.045], lean: 50, color: coat, cross: true, name: "napeTuft" });
  }

  // ------------------------------------------------------------------------------------------------------------
  // The bluebird

  const bz = 0.4;
  const topHit = headSurf.ray([0, 1, bz], [0, -1, 0]);
  if (!topHit) throw new Error("head top missed");
  const by = topHit.at.y - 0.008;

  const bcol = rgbOf(BLUE);
  const bLight = rgbOf(BLUE_LIGHT);
  const breast = rgbOf(BREAST);
  const white = rgbOf(BIRD_WHITE);
  const headC = new THREE.Vector3(0, by + 0.118, bz + 0.04);
  const birdPaint = paint((p, n) => {
    let col = mix(bcol, bLight, smoothstep(0.55, 1, n.y) * 0.5);
    const d = p.distanceTo(headC);
    if (d < 0.052) {
      // head: orange throat, pink cheeks
      col = mix(col, breast, smoothstep(-0.2, -0.7, n.y) * smoothstep(-0.1, 0.4, n.z));
      for (const sx of [1, -1]) {
        const cd = Math.hypot(p.x - sx * 0.04, p.y - (by + 0.108), p.z - (bz + 0.06));
        col = mix(col, [1, 0.62, 0.6], (1 - smoothstep(0.008, 0.018, cd)) * 0.65);
      }
      return col;
    }
    const front = smoothstep(-0.2, 0.5, n.z * 0.7 - n.y * 0.5);
    col = mix(col, breast, front);
    col = mix(col, white, smoothstep(0.35, 0.8, -n.y) * smoothstep(by + 0.075, by + 0.045, p.y));
    return col;
  });

  const bBody = b.joint("birdBody", { parent: head, at: [0, by + 0.062, bz - 0.004], dir: [0, 0.3, 1] });
  const bHead = b.joint("birdHead", { parent: bBody, at: [headC.x, headC.y, headC.z], dir: [0, 0.05, 1], role: "head" });
  b.sweep(
    polyline([
      [0, by + 0.055, bz - 0.03],
      [0, by + 0.075, bz + 0.015],
    ]),
    0.058,
    { bone: bBody, color: birdPaint, sides: 10, name: "birdBody" },
  );
  b.part(new THREE.SphereGeometry(0.047, 10, 8), birdPaint, { at: [headC.x, headC.y, headC.z], bone: bHead, name: "birdSkull" });

  // beak, open mid-song
  const beakU = b.joint("beakUpper", { parent: bHead, at: [0, by + 0.117, bz + 0.082], dir: [0, -0.1, 1] });
  const beakL = b.joint("beakLower", { parent: bHead, at: [0, by + 0.109, bz + 0.078], dir: [0, 0, 1], role: "jaw" });
  b.spike([0, by + 0.117, bz + 0.082], [0, -0.1, 1], 0.042, 0.0145, { bone: beakU, color: BEAK, sides: 6, name: "beakUpper" });
  b.spike([0, by + 0.109, bz + 0.078], [0, 0, 1], 0.033, 0.0115, { bone: beakL, color: "#f29a2e", sides: 6, name: "beakLower" });
  b.part(new THREE.SphereGeometry(0.009, 6, 4).scale(1.4, 0.7, 1.2), "#e0788a", {
    at: [0, by + 0.107, bz + 0.084],
    bone: beakL,
    name: "tongue",
  });
  b.pose(beakL, { axis: [1, 0, 0], deg: 24 });

  // eyes and crest
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), EYE, {
      at: [sx * 0.0345, by + 0.126, bz + 0.062],
      bone: bHead,
      name: "birdEye",
    });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), WHITE, {
      at: [sx * 0.0405, by + 0.131, bz + 0.067],
      bone: bHead,
      name: "birdGlint",
    });
    b.spike([sx * 0.012, by + 0.159, bz + 0.03], [sx * 0.2, 1, -0.55], 0.032, 0.0085, {
      bone: bHead,
      color: BLUE_DARK,
      sides: 5,
      name: "crest",
    });
  }
  b.spike([0, by + 0.162, bz + 0.036], [0, 1, -0.4], 0.04, 0.009, { bone: bHead, color: BLUE_DARK, sides: 5, name: "crestMid" });

  // legs and toes gripping the fur
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const leg = b.chain(
      `birdLeg${side}`,
      [
        [sx * 0.026, by + 0.032, bz - 0.01],
        [sx * 0.026, by + 0.006, bz - 0.002],
      ],
      { parent: bBody, names: [`birdLeg${side}`, `birdFoot${side}`], role: "leg", contact: [sx * 0.026, by, bz] },
    );
    b.sweep(leg, 0.0045, { color: BIRD_LEG, sides: 5, name: "birdLeg" });
    const foot = leg.tip!;
    for (const a of [-14, 0, 14]) {
      const r = (a * Math.PI) / 180;
      b.rod(
        [sx * 0.026, by + 0.006, bz - 0.002],
        [sx * 0.026 + Math.sin(r) * 0.024, by + 0.003, bz - 0.002 + Math.cos(r) * 0.024],
        0.0038,
        { bone: foot, color: BIRD_LEG, sides: 4, name: "birdToe" },
      );
    }
    b.rod([sx * 0.026, by + 0.006, bz - 0.002], [sx * 0.026, by + 0.004, bz - 0.024], 0.0038, {
      bone: foot,
      color: BIRD_LEG,
      sides: 4,
      name: "birdHeelToe",
    });
  }

  // wings
  const wingOutline: [number, number][] = [
    [-0.01, -0.004],
    [-0.005, 0.02],
    [0.02, 0.038],
    [0.055, 0.035],
    [0.09, 0.014],
    [0.13, -0.014, "sharp"],
    [0.092, -0.022],
    [0.05, -0.031],
    [0.014, -0.03],
  ];
  const wingPaint = paint((_p, _n, s) => {
    const [x, y] = s;
    if (x > 0.04 && y < 0.012) {
      const stripe = Math.floor((y + 0.04) / 0.008) % 2;
      return stripe ? NAVY : BLUE_DARK;
    }
    if (x > 0.02 && y < 0.026) return BLUE;
    return mix(BLUE, BLUE_LIGHT, 0.4);
  });
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const w = b.chain(
      `wing${side}`,
      [
        [sx * 0.058, by + 0.098, bz - 0.0],
        [sx * 0.064, by + 0.085, bz - 0.06],
        [sx * 0.05, by + 0.08, bz - 0.12],
      ],
      { parent: bBody, names: [`wing${side}1`, `wing${side}2`], role: "wing" },
    );
    b.extrude(wingOutline, {
      at: [sx * 0.063, by + 0.1, bz + 0.005],
      x: [-sx * 0.1, -0.12, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: wingPaint,
      bone: w.joints[0],
      name: "wing",
    });
  }

  // tail feathers
  const btail = b.chain(
    "birdTail",
    [
      [0, by + 0.07, bz - 0.085],
      [0, by + 0.058, bz - 0.15],
    ],
    { parent: bBody, names: ["birdTail1", "birdTail2"], role: "tail" },
  );
  const featherOutline: [number, number][] = [
    [0, -0.011],
    [0.03, -0.016],
    [0.07, -0.012],
    [0.09, 0, "sharp"],
    [0.07, 0.012],
    [0.03, 0.016],
    [0, 0.011],
  ];
  const tailPaint = paint((_p, _n, s) => (s[0] > 0.075 ? BLUE_LIGHT : s[0] > 0.012 ? BLUE_DARK : NAVY));
  for (const a of [-16, 0, 16]) {
    const r = (a * Math.PI) / 180;
    b.extrude(featherOutline, {
      at: [0, by + 0.068, bz - 0.085],
      x: [Math.sin(r), -0.28, -Math.cos(r)],
      y: [Math.cos(r), 0, Math.sin(r)],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: tailPaint,
      bone: btail.joints[0],
      name: "tailFeather",
    });
  }

  // tiny fur tufts hugging the bird's feet
  const nestHits = headSurf.scatter(30, {
    rng: rng(41),
    minDist: 0.025,
    filter: (h) => Math.abs(h.at.x) < 0.07 && h.at.z > bz - 0.04 && h.at.z < bz + 0.06 && h.n.y > 0.3,
  });
  b.cards(nestHits, tuft, { size: [0.03, 0.045], lean: 45, bend: 20, vary: 0.3, rng: rng(42), color: coat, cross: true, name: "perchFur" });

  // floating music notes
  const noteSpecs: [number, number, number, string][] = [
    [0.1, by + 0.2, bz + 0.1, NOTE_A],
    [-0.09, by + 0.235, bz + 0.07, NOTE_B],
  ];
  for (const [nx, ny, nz, col] of noteSpecs) {
    b.part(new THREE.SphereGeometry(0.014, 7, 5).scale(1.25, 0.9, 0.7), col, {
      at: [nx, ny, nz],
      bone: bHead,
      rotation: [0, 0, 20],
      name: "noteHead",
    });
    b.rod([nx + 0.0145, ny + 0.003, nz], [nx + 0.0145, ny + 0.05, nz], 0.0025, { bone: bHead, color: col, sides: 4, name: "noteStem" });
    b.extrude(
      [
        [0, 0],
        [0.014, -0.012],
        [0.02, -0.026],
        [0.012, -0.04],
        [0.016, -0.022],
        [0.006, -0.012],
      ],
      {
        at: [nx + 0.0145, ny + 0.05, nz],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.003,
        color: col,
        bone: bHead,
        name: "noteFlag",
      },
    );
  }

  // keep ears in the rest pose (posing exercised by the rig)
  void earJoints;
  void frame;
  return b.root;
}

function tuftTexture() {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
      <path d="M16 0 C14 14 9 30 3 48 L15 48 C16 34 17 18 16 0Z" fill="#ffffff"/>
      <path d="M17 6 C20 18 25 32 29 48 L17 48 C16 34 16 20 17 6Z" fill="#dcdcdc"/>
      <path d="M12 16 C11 28 8 38 6 48 L13 48 C13 38 13 26 12 16Z" fill="#bdbdbd"/>
    </svg>`,
    { size: 96 },
  );
}
