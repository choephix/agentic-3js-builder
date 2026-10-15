// Capybara with a bluebird on its head: a chubby, serenely smiling, golden-brown barrel of a rodent with a blocky
// muzzle, sleepy drawn eyes, buck teeth, fur tufts, and a tiny singing bluebird perched between its ears.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with Bluebird",
  description:
    "A whimsical, round-bellied capybara with a sleepy smile, buck teeth, fur tufts and a daisy behind its ear, calmly carrying a little singing bluebird on its head. Rigged with spine, neck, jaw, four legs, and a fully jointed bird (wings, tail, legs, beak).",
};

type V = [number, number, number];
const SIDES = [1, -1] as const;
const sideName = (s: number) => (s > 0 ? "L" : "R");

// Palette
const FUR_HI = "#cf9a62";
const FUR_LO = "#a9743f";
const FUR_DK = "#74492a";
const BELLY = "#ecce9c";
const COOL = "#8f7a8c";
const MUZZLE = "#8a5a36";
const FOOT_DK = "#5c3b27";
const TOE = "#6b4430";
const NAIL = "#2e1d15";
const NOSE = "#3a2622";
const NOSE_SHINE = "#8c6a64";
const NOSTRIL = "#1d1210";
const EAR_OUT = "#8a5a36";
const EAR_IN = "#d98c7e";
const TOOTH = "#fff0c8";
const LINE = "#4a2a1a";
const WHISKER = "#3a2418";
const BIRD_BLUE = "#4d9be6";
const BIRD_BLUE_D = "#2c66c0";
const BIRD_NAVY = "#1f3f8f";
const BIRD_ORANGE = "#f0954e";
const BIRD_CREAM = "#fff1dc";
const BEAK = "#ffb23a";
const BEAK_D = "#e08a1c";
const BIRD_LEG = "#d9884a";
const INK = "#1c1210";
const PINK = "#ff9db0";
const WHITE = "#ffffff";
const DAISY_Y = "#ffcf33";
const LEAF = "#6cbf5a";

// Coat: warm golden top, darker spine line, cream belly, cool underside shade, dark muzzle and muddy feet.
const STREAK = new THREE.Vector3();
const COAT = paint((p, n) => {
  STREAK.set(p.x * 5, p.y * 5, p.z * 1.1);
  const streak = noise(STREAK, 0.06, 11);
  const cloud = noise(p, 0.16, 5);
  let c = mix(FUR_LO, FUR_HI, smoothstep(0.25, 0.8, cloud) * 0.6 + streak * 0.4);
  c = mix(c, FUR_DK, smoothstep(0.5, 0.95, n.y) * 0.45);
  c = mix(c, BELLY, smoothstep(-0.15, -0.75, n.y) * 0.9);
  c = mix(c, COOL, smoothstep(-0.5, -1, n.y) * 0.3);
  c = mix(c, MUZZLE, smoothstep(0.66, 0.78, p.z) * 0.7);
  c = mix(c, FOOT_DK, smoothstep(0.14, 0.04, p.y) * 0.6);
  return c;
});

// Bluebird coat: blue back, rusty chest, cream belly.
const BIRD_BODY = countershade(BIRD_BLUE, countershade(BIRD_ORANGE, BIRD_CREAM, { level: -0.55, soft: 0.3 }), {
  level: 0.1,
  soft: 0.35,
});
const BIRD_HEAD = countershade(BIRD_BLUE, BIRD_ORANGE, { level: -0.1, soft: 0.3 });
const BIRD_WING = countershade(BIRD_BLUE_D, BIRD_NAVY, { level: 0.3, soft: 0.5 });

// Textures
const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><circle cx="32" cy="32" r="29"/></clipPath></defs>
    <g clip-path="url(#c)">
      <rect width="64" height="64" fill="#2a1912"/>
      <ellipse cx="32" cy="54" rx="28" ry="14" fill="#52301f"/>
      <circle cx="23" cy="43" r="7.5" fill="#ffffff"/>
      <circle cx="41" cy="50" r="3.6" fill="#ffffff"/>
      <circle cx="45" cy="39" r="2" fill="#ffffff"/>
      <path d="M0 0 H64 V32 Q32 20 0 32 Z" fill="#b98650"/>
      <path d="M0 31 Q32 19 64 31" stroke="#3a2212" stroke-width="4.5" fill="none"/>
    </g>
  </svg>`,
  { size: 256 },
);

const TUFT_A = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 48 Q6 26 2 6 Q13 22 15 48Z" fill="#b8844f"/>
    <path d="M11 48 Q14 22 16 0 Q23 24 23 48Z" fill="#cf9a62"/>
    <path d="M19 48 Q22 28 30 10 Q29 30 29 48Z" fill="#a9743f"/>
    <path d="M14 48 Q16 30 16 12 Q19 30 19 48Z" fill="#e3b27a"/>
  </svg>`,
  { size: 128 },
);
const TUFT_B = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 48 Q8 28 5 10 Q15 26 16 48Z" fill="#94623a"/>
    <path d="M12 48 Q13 24 14 2 Q22 24 22 48Z" fill="#b98650"/>
    <path d="M20 48 Q23 30 28 14 Q29 32 28 48Z" fill="#7c4f2c"/>
  </svg>`,
  { size: 128 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="14" rx="18" ry="11" fill="#f08e8c"/>
    <path d="M9 12 l3 -5 M17 14 l3 -5 M25 12 l3 -5" stroke="#ffd0c8" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);
const DOTS = svg(
  `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
    <g fill="#4a2c1c">
      <circle cx="6" cy="6" r="2.4"/><circle cx="16" cy="4" r="2.4"/><circle cx="26" cy="6" r="2.4"/><circle cx="35" cy="4" r="2.4"/>
      <circle cx="10" cy="15" r="2.4"/><circle cx="20" cy="13" r="2.4"/><circle cx="30" cy="15" r="2.4"/>
      <circle cx="15" cy="21" r="2.2"/><circle cx="25" cy="21" r="2.2"/>
    </g>
  </svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const R = rng(7);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.4, -0.3], group: "body" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.4, -0.3],
      [0, 0.395, -0.44],
      [0, 0.385, -0.58],
    ]),
    { parent: hips, count: 2, role: "tail", group: "body" },
  );
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.3],
      [0, 0.41, -0.08],
      [0, 0.42, 0.12],
      [0, 0.43, 0.3],
    ]),
    { parent: hips, count: 3, role: "spine", group: "body" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.43, 0.3],
      [0, 0.47, 0.38],
      [0, 0.5, 0.45],
    ]),
    { parent: spine, count: 2, role: "neck", group: "head" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.5, 0.45], dir: [0, -0.08, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.37, 0.5], dir: [0, -0.02, 1], role: "jaw", group: "head" });

  // ---------------------------------------------------------------- body and head
  const body = b.loft(
    [
      { at: [0, 0.4, -0.42], w: 0.32, h: 0.36 },
      { at: [0, 0.4, -0.3], w: 0.46, h: 0.46 },
      { at: [0, 0.4, -0.05], w: 0.5, h: 0.5 },
      { at: [0, 0.41, 0.2], w: 0.48, h: 0.5 },
      { at: [0, 0.42, 0.36], w: 0.4, h: 0.44 },
    ],
    { bone: [tail, hips, spine, neck], color: COAT, sides: 12, group: "body" },
  );

  const skull = b.loft(
    [
      { at: [0, 0.5, 0.34], w: 0.34, h: 0.34 },
      { at: [0, 0.52, 0.48], w: 0.32, h: 0.32 },
      { at: [0, 0.495, 0.62], w: 0.27, h: 0.27 },
      { at: [0, 0.46, 0.7], w: 0.25, h: 0.23 },
    ],
    { bone: head, color: COAT, sides: 10, group: "head" },
  );
  const hs = b.surface(skull);

  // Lower jaw: a separate chin under the muzzle.
  b.frustumBox([0, 0.345, 0.52], [0, 0.343, 0.78], [0.2, 0.07], [0.14, 0.065], {
    bone: jaw,
    color: COAT,
    group: "head",
    name: "lowerJaw",
  });

  // Nose pad with nostrils and a shine.
  const nz = hs.ray([0, 0.495, 1.3], [0, 0, -1])?.at.z ?? 0.81;
  b.part(new THREE.SphereGeometry(1, 10, 8), NOSE, {
    bone: head,
    at: [0, 0.49, nz - 0.012],
    scale: [0.072, 0.052, 0.045],
    name: "nosePad",
  });
  for (const s of SIDES) {
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSTRIL, {
      bone: head,
      at: [s * 0.03, 0.492, nz + 0.022],
      scale: [0.012, 0.009, 0.009],
    });
  }
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE_SHINE, {
    bone: head,
    at: [0.022, 0.518, nz + 0.006],
    scale: [0.012, 0.005, 0.01],
  });

  // Buck teeth peeking over the lower lip.
  const tz = hs.ray([0, 0.368, 1.3], [0, 0, -1])?.at.z ?? 0.78;
  for (const s of SIDES) {
    b.part(new THREE.BoxGeometry(0.02, 0.032, 0.012), TOOTH, {
      bone: head,
      at: [s * 0.0115, 0.36, tz - 0.003],
    });
  }

  // Smile and philtrum, draped on the head.
  for (const s of SIDES) {
    const smile = catmull([
      [0, 0.372, 0.84],
      [s * 0.05, 0.37, 0.79],
      [s * 0.1, 0.378, 0.72],
      [s * 0.125, 0.4, 0.665],
    ]);
    b.sweep(hs.drape(smile, { lift: 0.002 }), 0.0045, { color: LINE, sides: 5, group: "head" });
  }
  b.sweep(
    hs.drape(
      catmull([
        [0, 0.465, 0.835],
        [0, 0.42, 0.835],
        [0, 0.378, 0.83],
      ]),
      { lift: 0.002 },
    ),
    0.004,
    { color: LINE, sides: 5, group: "head" },
  );

  // Sleepy drawn eyes, rosy cheeks and whisker pores.
  const eyePts: THREE.Vector3[] = [];
  for (const s of SIDES) {
    const hit = hs.nearest([s * 0.16, 0.585, 0.57]);
    eyePts.push(hit.at.clone());
    b.decal(skull, EYE, { at: hit, dir: [s * 0.65, 0.25, 0.7], size: [0.08, 0.08], segments: 8, group: "head" });
    const cheek = hs.nearest([s * 0.15, 0.47, 0.62]);
    b.decal(skull, BLUSH, { at: cheek, dir: [s * 0.8, 0, 0.6], size: [0.06, 0.042], segments: 6, group: "head" });
    const pores = hs.nearest([s * 0.1, 0.45, 0.77]);
    b.decal(skull, DOTS, { at: pores, dir: [s * 0.6, 0.1, 0.8], size: [0.05, 0.03], segments: 6, group: "head" });
  }

  // Whiskers.
  for (const s of SIDES) {
    for (let j = 0; j < 3; j++) {
      const start = hs.nearest([s * 0.11, 0.43 - j * 0.02, 0.75 - j * 0.02]);
      const tip: V = [s * (0.27 + j * 0.01), 0.4 - j * 0.045, 0.8 - j * 0.02];
      const ctrl: V = [s * 0.19, 0.46 - j * 0.03, 0.82 - j * 0.02];
      b.sweep(bezier(start, ctrl, tip), [0.0028, 0.001], { color: WHISKER, sides: 4, caps: "flat", group: "head" });
    }
  }

  // Ears with inner pink.
  for (const s of SIDES) {
    const earAt: V = [s * 0.125, 0.655, 0.4];
    const earDir: V = [s * 0.6, 0.45, 0.45];
    b.part(new THREE.SphereGeometry(1, 8, 6), EAR_OUT, {
      bone: head,
      at: earAt,
      dir: earDir,
      axis: "z",
      scale: [0.05, 0.06, 0.022],
      name: "ear",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), EAR_IN, {
      bone: head,
      at: offset(earAt, earDir, 0.012),
      dir: earDir,
      axis: "z",
      scale: [0.032, 0.043, 0.014],
      name: "earInner",
    });
  }

  // A daisy tucked behind the left ear, with two leaves.
  {
    const base = hs.nearest([0.17, 0.565, 0.36]);
    const fl = base.moved([0, 0.006, 0]);
    const petal = new THREE.SphereGeometry(1, 6, 4).scale(0.011, 0.026, 0.004).translate(0, 0.026, 0);
    b.ring(fl, { count: 8, radius: 0.012 }, (item) => b.stick(petal, WHITE, item, { embed: 0 }));
    b.stick(new THREE.SphereGeometry(0.0145, 8, 6).translate(0, 0.012, 0), DAISY_Y, fl, { embed: 0 });
    const leafOutline: [number, number, "sharp"?][] = [
      [0, 0, "sharp"],
      [0.02, 0.016],
      [0.05, 0.012],
      [0.078, 0, "sharp"],
      [0.05, -0.012],
      [0.02, -0.016],
    ];
    const at = offset(base, base, 0.004);
    b.extrude(leafOutline, {
      at,
      x: [0, -0.3, -1],
      y: [0, 1, -0.3],
      thickness: 0.004,
      smoothing: 1,
      color: LEAF,
      bone: head,
      name: "leafA",
    });
    b.extrude(leafOutline, {
      at,
      x: [0, 0.3, -1],
      y: [0, 1, 0.3],
      thickness: 0.004,
      smoothing: 1,
      color: LEAF,
      bone: head,
      name: "leafB",
    });
  }

  // ---------------------------------------------------------------- legs
  const addFoot = (tip: ReturnType<typeof b.joint>, x: number, z: number, toes: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT, {
      bone: tip,
      at: [x, 0.03, z + 0.02],
      scale: [0.055, 0.032, 0.07],
      name: "footPad",
    });
    for (let i = 0; i < toes; i++) {
      const a = (i - (toes - 1) / 2) * 0.42;
      const start: V = [x + Math.sin(a) * 0.012, 0.0155, z + 0.035];
      const end: V = [x + Math.sin(a) * 0.058, 0.0155, z + 0.035 + Math.cos(a) * 0.05];
      b.capsule(start, end, 0.0155, TOE, { bone: tip, sides: 6, name: "toe" });
      b.part(new THREE.SphereGeometry(1, 6, 4), NAIL, {
        bone: tip,
        at: [end[0] + Math.sin(a) * 0.008, 0.0145, end[2] + Math.cos(a) * 0.008],
        scale: [0.0125, 0.009, 0.011],
        name: "nail",
      });
    }
  };

  for (const s of SIDES) {
    const S = sideName(s);
    // Front legs
    const fp = limb([s * 0.17, 0.3, 0.17], [s * 0.17, 0.075, 0.2], [0.125, 0.125], [[0, 0, -1]]);
    const front = b.chain(`legF${S}`, fp, {
      parent: spine,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "leg",
      contact: [s * 0.17, 0, 0.22],
      group: "legs",
    });
    b.sweep(front, (t) => 0.092 - 0.04 * t, { color: COAT, sides: 10, group: "legs" });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: front.joints[0],
      at: [s * 0.18, 0.3, 0.15],
      scale: [0.1, 0.13, 0.14],
      name: "shoulderMass",
    });
    addFoot(front.joints[front.joints.length - 1], s * 0.17, 0.2, 4);

    // Hind legs
    const hp = limb(
      [s * 0.19, 0.31, -0.34],
      [s * 0.19, 0.075, -0.37],
      [0.12, 0.12, 0.09],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`legH${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
      contact: [s * 0.19, 0, -0.35],
      group: "legs",
    });
    b.sweep(hind, (t) => 0.105 - 0.05 * t, { color: COAT, sides: 10, group: "legs" });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hind.joints[0],
      at: [s * 0.2, 0.33, -0.34],
      scale: [0.115, 0.16, 0.18],
      name: "haunch",
    });
    addFoot(hind.joints[hind.joints.length - 1], s * 0.19, -0.37, 3);
  }

  // ---------------------------------------------------------------- fur tufts
  const bodyHits = b.surface(body).scatter(320, {
    rng: R,
    minDist: 0.05,
    filter: (h) => h.n.y > -0.35 && h.at.z < 0.3,
  });
  b.cards(bodyHits, [TUFT_A, TUFT_B], {
    size: [0.05, 0.06],
    lean: 72,
    bend: 20,
    vary: 0.3,
    spin: 15,
    rng: R,
    flow: [0, -0.2, -1],
  });
  const headHits = hs.scatter(70, {
    rng: R,
    minDist: 0.035,
    filter: (h) =>
      h.at.z < 0.62 && h.n.y < 0.75 && h.n.y > -0.4 && eyePts.every((e) => h.at.distanceTo(e) > 0.075),
  });
  b.cards(headHits, [TUFT_A, TUFT_B], {
    size: [0.03, 0.04],
    lean: 75,
    bend: 15,
    vary: 0.3,
    spin: 15,
    rng: R,
    flow: [0, -0.25, -1],
  });

  // ---------------------------------------------------------------- the bluebird
  const HT = hs.ray([0, 1.2, 0.49], [0, -1, 0])?.at.y ?? 0.678;
  const BZ = 0.49;
  const BY = HT + 0.072;
  const FY = HT - 0.004;

  const birdBody = b.joint("birdBody", { parent: head, at: [0, BY, BZ], dir: [0, 0, 1], group: "bird" });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: [0, BY + 0.055, BZ + 0.045], dir: [0, 0, 1], group: "bird" });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: [0, BY + 0.047, BZ + 0.075],
    dir: [0, -0.05, 1],
    role: "jaw",
    group: "bird",
  });

  b.part(new THREE.SphereGeometry(1, 10, 8), BIRD_BODY, {
    bone: birdBody,
    at: [0, BY, BZ],
    scale: [0.062, 0.056, 0.075],
    name: "birdBelly",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), BIRD_HEAD, {
    bone: birdHead,
    at: [0, BY + 0.058, BZ + 0.05],
    scale: [0.048, 0.045, 0.047],
    name: "birdHeadBall",
  });
  // Beak: upper and lower halves.
  b.spike([0, BY + 0.052, BZ + 0.088], [0, -0.12, 1], 0.045, 0.017, { color: BEAK, bone: birdHead, sides: 6, name: "beakUpper" });
  b.spike([0, BY + 0.04, BZ + 0.088], [0, -0.05, 1], 0.034, 0.012, { color: BEAK_D, bone: birdJaw, sides: 6, name: "beakLower" });
  // Eyes, blush
  for (const s of SIDES) {
    const e: V = [s * 0.036, BY + 0.068, BZ + 0.07];
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), INK, { bone: birdHead, at: e, name: "birdEye" });
    b.part(new THREE.SphereGeometry(0.0042, 6, 4), WHITE, {
      bone: birdHead,
      at: [e[0] + s * 0.004, e[1] + 0.005, e[2] + 0.007],
      name: "birdEyeShine",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), PINK, {
      bone: birdHead,
      at: [s * 0.043, BY + 0.05, BZ + 0.062],
      scale: [0.004, 0.009, 0.009],
      name: "birdBlush",
    });
  }
  // Crest
  for (const k of [-1, 0, 1]) {
    const base: V = [k * 0.012, BY + 0.1, BZ + 0.04];
    const mid: V = [k * 0.02, BY + 0.13, BZ + 0.03];
    const tip: V = [k * 0.026, BY + 0.15 - Math.abs(k) * 0.012, BZ - 0.01];
    b.sweep(bezier(base, mid, tip), [0.012, 0], {
      color: BIRD_BLUE_D,
      bone: birdHead,
      sides: 5,
      caps: { start: "flat", end: "point" },
      name: "crest",
    });
  }
  // Wings
  for (const s of SIDES) {
    const S = sideName(s);
    const wing = b.chain(
      `birdWing${S}`,
      catmull([
        [s * 0.055, BY + 0.025, BZ + 0.0],
        [s * 0.068, BY + 0.012, BZ - 0.05],
        [s * 0.062, BY - 0.002, BZ - 0.1],
      ]),
      { parent: birdBody, names: [`birdWing${S}1`, `birdWing${S}2`], role: "wing", group: "bird" },
    );
    b.sweep(wing, (t) => [0.009, 0.032 - 0.015 * t], {
      color: BIRD_WING,
      bands: [
        [0.5, BIRD_BLUE_D],
        [1, BIRD_NAVY],
      ],
      caps: { start: "round", end: "point" },
      sides: 8,
      group: "bird",
      name: "birdWing",
    });
    const wtip: V = [s * 0.062, BY - 0.004, BZ - 0.095];
    for (const k of [-1, 0, 1]) {
      b.spike(wtip, [s * 0.12 * k + s * 0.05, -0.12 + k * 0.1, -1], 0.05 - Math.abs(k) * 0.008, 0.008, {
        color: BIRD_NAVY,
        bone: wing.joints[1],
        sides: 4,
        name: "primary",
      });
    }
  }
  // Tail
  const birdTail = b.chain(
    "birdTail",
    catmull([
      [0, BY, BZ - 0.065],
      [0, BY + 0.02, BZ - 0.125],
      [0, BY + 0.055, BZ - 0.18],
    ]),
    { parent: birdBody, names: ["birdTail1", "birdTail2"], role: "tail", group: "bird" },
  );
  b.sweep(birdTail, (t) => [0.03 - 0.012 * t, 0.007], {
    color: BIRD_BLUE_D,
    bands: [
      [0.6, BIRD_BLUE_D],
      [1, BIRD_NAVY],
    ],
    caps: { start: "round", end: "point" },
    sides: 6,
    group: "bird",
    name: "birdTailFan",
  });
  for (const s of SIDES) {
    b.spike([s * 0.012, BY + 0.045, BZ - 0.165], [s * 0.35, 0.3, -1], 0.04, 0.009, {
      color: BIRD_NAVY,
      bone: birdTail.joints[1],
      sides: 4,
      name: "tailFeather",
    });
  }
  // Legs and toes
  for (const s of SIDES) {
    const S = sideName(s);
    const x = s * 0.025;
    const leg = b.chain(
      `birdLeg${S}`,
      [
        [x, BY - 0.045, BZ + 0.005],
        [x, FY + 0.008, BZ + 0.01],
      ],
      { parent: birdBody, names: [`birdHip${S}`, `birdFoot${S}`], role: "leg", contact: [x, HT, BZ + 0.02], group: "bird" },
    );
    b.sweep(leg, 0.0065, { color: BIRD_LEG, sides: 5, group: "bird", name: "birdShin" });
    const foot = leg.joints[leg.joints.length - 1];
    for (const k of [-1, 0, 1]) {
      b.capsule([x, FY + 0.006, BZ + 0.01], [x + k * 0.011, FY + 0.004, BZ + 0.05], 0.0045, BIRD_LEG, {
        bone: foot,
        sides: 4,
        name: "birdToe",
      });
    }
    b.capsule([x, FY + 0.006, BZ + 0.01], [x, FY + 0.005, BZ - 0.022], 0.004, BIRD_LEG, {
      bone: foot,
      sides: 4,
      name: "birdHeel",
    });
  }
  // The little singer has its beak slightly open.
  b.pose(birdJaw, { axis: [1, 0, 0], deg: 7 });

  return b.root;
}
