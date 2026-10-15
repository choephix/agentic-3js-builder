// Gray wolf standing alert, Blizzard/Warcraft style: chunky heroic proportions (huge shoulders, head, paws and ears),
// hand-painted fur with warm light from above and cool violet shadow below, saturated accents, and worn trims:
// a spiked leather collar, brass rivets, a fang pendant, hanging feathers, bracers and red tribal war paint.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, grain, mix, mottle, paint, resolve, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf (Alert)",
  description:
    "A heroic gray wolf standing alert: oversized shoulders, head, ears and paws, hand-painted fur with warm highlights and cool shadows, spiked leather collar, brass rivets, fang pendant, feathers, bracers and red war paint.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: saturated blue-grays, warm cream and tan, amber eyes, leather and brass trim.
const BACK_A = "#39445a";
const BACK_B = "#65768f";
const SIDE_A = "#6b7b92";
const SIDE_B = "#a7b4c4";
const CREAM_A = "#d9c7a0";
const CREAM_B = "#f3e8cb";
const TAN_A = "#94683f";
const TAN_B = "#c99a5c";
const SHADE = "#2a2f58"; // cool violet painted shadow
const LIGHT = "#fff0cf"; // warm painted light
const NOSE = "#1a1720";
const EYE = "#ffb21c";
const FANG = "#f6eed6";
const CLAW = "#2b2631";
const LEATHER = "#7a4524";
const LEATHER_DARK = "#4a2a18";
const BRASS = "#d49a2e";
const CREST = "#2c3446";
const WHISK = "#eeeae0";
const RED = "#d6432a";

const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);
const furGrain = (a: string, b: string, axis: "x" | "y" | "z", seed: number) =>
  grain(a, b, { size: 0.016, axis, seed });

/** Hand-painted light: warm highlight on top, cool violet shade underneath and near the floor. */
function painted(base: ColorInput) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const under = smoothstep(0.15, -0.9, n.y);
    const ground = smoothstep(0.32, 0.02, p.y);
    const top = smoothstep(0.4, 1, n.y);
    return mix(mix(c, SHADE, 0.4 * under + 0.28 * ground), LIGHT, 0.22 * top);
  });
}

/** Dark saddle, gray flanks with dark mottling, cream belly. */
function coat(axis: "x" | "y" | "z") {
  const back = furGrain(BACK_A, BACK_B, axis, 4);
  const side = mottle(furGrain(SIDE_A, SIDE_B, axis, 6), back, { size: 0.15, contrast: 0.6, seed: 11 });
  const belly = furGrain(CREAM_A, CREAM_B, axis, 8);
  return countershade(countershade(back, side, { level: 0.45, soft: 0.3 }), belly, { level: -0.3, soft: 0.25 });
}

const COAT_Z = coat("z");
const CREAM_FUR = furGrain(CREAM_A, CREAM_B, "z", 8);
const BODYP = painted(
  paint((p, n) => (p.z > 0.28 && n.z > 0.4 + 0.25 * zig(p.x / 0.04) ? CREAM_FUR : COAT_Z)),
);
const SHP = painted(COAT_Z);
const NECKP = painted(paint((p, n) => (n.y < -0.1 + 0.35 * zig(p.x / 0.035) ? CREAM_FUR : COAT_Z)));
const LEG_LOW = furGrain(TAN_A, TAN_B, "y", 9);
const LEG_BASE = gradient(coat("y"), LEG_LOW, [0, 0.62, 0], [0, 0.22, 0]);
const LEG_STRIPE = furGrain("#2f3646", "#434c5e", "y", 10);
const LEGP = painted(
  paint((p, n) => (p.z > 0.3 && p.y < 0.6 && n.z > 0.35 + 0.25 * zig(p.y / 0.05) ? LEG_STRIPE : LEG_BASE)),
);
const TAILP = painted(gradient(COAT_Z, furGrain("#22262f", "#383f4d", "z", 12), [0, 0.66, -0.9], [0, 0.46, -1.06]));
const HEAD_FUR = mottle(furGrain(SIDE_A, SIDE_B, "z", 14), furGrain(BACK_A, BACK_B, "z", 15), {
  size: 0.08,
  contrast: 0.6,
  seed: 16,
});
const SKULLP = painted(
  paint((p, n) => (Math.abs(p.x) > 0.082 + 0.018 * zig(p.z / 0.03) && n.y < 0.3 ? CREAM_FUR : HEAD_FUR)),
);
const MUZ_TOP = furGrain("#465064", "#6a788c", "z", 17);
const MUZP = painted(paint((p, n) => (n.y > 0.45 + 0.1 * zig(p.z / 0.025) ? MUZ_TOP : CREAM_FUR)));
const JAWP = painted(countershade(furGrain(SIDE_A, SIDE_B, "z", 18), CREAM_FUR, { level: -0.2, soft: 0.3 }));
const EARP = painted(furGrain(BACK_A, BACK_B, "y", 19));
const EAR_IN = painted("#c98a70");

// ---------------------------------------------------------------------------------------------------------------
// Textures
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7a7a7a"/><stop offset="0.55" stop-color="#e4e4e4"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M5 64 Q3 36 16 1 Q29 36 27 64 Z" fill="url(#g)"/><path d="M16 60 L16 14 M11 60 Q10 40 14 22 M21 60 Q22 40 18 22" stroke="#9a9a9a" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const TUFT2 = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#777777"/><stop offset="0.6" stop-color="#dddddd"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="M3 64 Q6 30 9 3 Q14 32 16 42 Q18 26 24 6 Q28 38 29 64 Z" fill="url(#g)"/><path d="M9 58 Q9 36 9 10 M24 58 Q24 36 24 12" stroke="#949494" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const FEATHER_RED = svg(
  `<svg viewBox="0 0 24 80"><path d="M12 79 C2 56 3 20 12 2 C21 20 22 56 12 79 Z" fill="#c9372c" stroke="#6e1710" stroke-width="1.4"/><path d="M12 79 L12 6" stroke="#f3e7c9" stroke-width="1.8" stroke-linecap="round"/><path d="M12 60 L5 48 M12 48 L5 36 M12 36 L6 24 M12 60 L19 48 M12 48 L19 36 M12 36 L18 24" stroke="#8e1f1a" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  { size: 192 },
);
const FEATHER_TEAL = svg(
  `<svg viewBox="0 0 24 80"><path d="M12 79 C2 56 3 20 12 2 C21 20 22 56 12 79 Z" fill="#23a79f" stroke="#0e5a56" stroke-width="1.4"/><path d="M12 79 L12 6" stroke="#f3e7c9" stroke-width="1.8" stroke-linecap="round"/><path d="M12 60 L5 48 M12 48 L5 36 M12 36 L6 24 M12 60 L19 48 M12 48 L19 36 M12 36 L18 24" stroke="#14706b" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  { size: 192 },
);
const CLAW_MARKS = svg(
  `<svg viewBox="0 0 64 80"><g fill="#d6432a" stroke="#5e130c" stroke-width="2" stroke-linejoin="round"><path d="M8 6 Q20 34 12 74 Q30 44 22 8 Z"/><path d="M26 2 Q38 32 30 76 Q48 44 40 4 Z"/><path d="M43 8 Q54 34 49 70 Q60 42 54 10 Z"/></g><g fill="none" stroke="#ff9a62" stroke-width="1.6" stroke-linecap="round"><path d="M14 14 Q19 34 15 58"/><path d="M32 12 Q37 32 33 58"/><path d="M48 16 Q52 34 50 54"/></g></svg>`,
  { size: 192 },
);
const CHEEK_PAINT = svg(
  `<svg viewBox="0 0 40 28"><g fill="#d6432a" stroke="#5e130c" stroke-width="1.5" stroke-linejoin="round"><path d="M2 5 L31 2 L34 8 L5 12 Z"/><path d="M3 17 L30 15 L33 21 L6 25 Z"/></g><path d="M6 6 L28 4 M7 18 L28 17" stroke="#ff9a62" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>`,
  { size: 160 },
);

// Ear outlines: u across, v up, in meters.
const EAR: OutlinePoint[] = [
  [-0.05, 0],
  [0.05, 0],
  [0.04, 0.08],
  [0.004, 0.17, "sharp"],
  [-0.03, 0.09],
];
const EAR_NOTCH: OutlinePoint[] = [
  [-0.05, 0],
  [0.05, 0],
  [0.044, 0.06],
  [0.022, 0.082, "sharp"],
  [0.038, 0.108, "sharp"],
  [0.004, 0.17, "sharp"],
  [-0.03, 0.09],
];
const EAR_INNER: OutlinePoint[] = [
  [-0.03, 0.01],
  [0.03, 0.01],
  [0.022, 0.075],
  [0.002, 0.135, "sharp"],
  [-0.018, 0.08],
];

export default function build() {
  const b = createBuilder({ name: "grayWolf", paintSize: 2048 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips root, spine, neck, head + jaw, tail; limbs come per side below.
  const hips = b.joint("hips", { at: [0, 0.78, -0.5], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.5],
      [0, 0.8, -0.2],
      [0, 0.82, 0.1],
      [0, 0.82, 0.36],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.58],
      [0, 0.78, -0.78],
      [0, 0.64, -0.95],
      [0, 0.46, -1.05],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.84, 0.36],
      [0, 0.95, 0.52],
      [0, 1.05, 0.68],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );

  const HP: [number, number, number] = [0, 1.05, 0.68];
  const hp = (x: number, y: number, z: number): [number, number, number] => [HP[0] + x, HP[1] + y, HP[2] + z];
  const head = b.joint("head", { parent: neck.joints[1], at: HP, dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.03, 0.02), aim: hp(0, -0.04, 0.3), role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Torso: deep chest, tucked loin, strong rump.
  const body = b.loft(
    [
      { at: [0, 0.72, -0.52], w: 0.32, h: 0.34 },
      { at: [0, 0.72, -0.3], w: 0.32, h: 0.34 },
      { at: [0, 0.71, -0.08], w: 0.29, h: 0.31 },
      { at: [0, 0.7, 0.14], w: 0.38, h: 0.44 },
      { at: [0, 0.71, 0.38], w: 0.42, h: 0.48 },
    ],
    { bone: [hips, spine], color: BODYP },
  );

  const neckSw = b.sweep(neck, [0.155, 0.135, 0.115], { color: NECKP });
  const tailSw = b.sweep(tail, [0.06, 0.088, 0.095, 0.07, 0.016], { color: TAILP });

  // -------------------------------------------------------------------------------------------------------------
  // Paws: oversized, with four toes and dark claws.
  const buildPaw = (x: number, z: number, paw: Joint, toe: Joint) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), LEGP, {
      bone: paw,
      at: [x, 0.062, z + 0.035],
      scale: [0.075, 0.068, 0.115],
    });
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const tx = x + k * 0.034;
      const tz = z + 0.115 - Math.abs(k) * 0.012;
      b.part(new THREE.SphereGeometry(0.026, 6, 5), LEGP, { bone: toe, at: [tx, 0.032, tz], scale: [1, 0.8, 1.15] });
      b.spike([tx, 0.03, tz + 0.02], [k * 0.07, -0.4, 1], 0.06, 0.011, CLAW, { bone: toe, sides: 5 });
    }
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Front leg
    const fp = limb(
      [s * 0.17, 0.74, 0.36],
      [s * 0.165, 0.13, 0.4],
      [0.24, 0.24, 0.14],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fl = b.chain(`legF${L}`, catmull(fp), {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `pawF${L}`],
      role: "leg",
      contact: [s * 0.165, 0, 0.44],
    });
    const legF = b.sweep(fl, [0.105, 0.088, 0.075, 0.066, 0.062], { color: LEGP });
    const scap = b.part(new THREE.SphereGeometry(1, 10, 8), SHP, {
      bone: fl.joints[0],
      at: [s * 0.18, 0.76, 0.32],
      scale: [0.085, 0.18, 0.16],
    });
    b.spike(fp[1], [fp[1].x, fp[1].y - 0.02, fp[1].z - 0.09], null, 0.035, "#8b97a6", {
      bone: fl.joints[1],
      sides: 5,
    });
    const toeF = b.joint(`toeF${L}`, {
      parent: fl.joints[3],
      at: [s * 0.165, 0.05, 0.47],
      aim: [s * 0.165, 0.04, 0.6],
      role: "digit",
    });
    buildPaw(s * 0.165, 0.4, fl.joints[3], toeF);

    // Leather bracer with brass rivets
    const cuff = Array.from({ length: 8 }, (_, k) => legF.at(0.6, k * 45, 0.008));
    b.sweep(catmull(cuff, { closed: true }), 0.02, LEATHER, { sides: 6 });
    for (const a of [0, 50, -50]) b.stick(new THREE.SphereGeometry(0.011, 6, 4), BRASS, legF.at(0.6, a, 0.012), { embed: 0.4 });

    // War paint on the shoulder
    b.decal(scap, CLAW_MARKS, { at: [s * 0.262, 0.78, 0.32], dir: [s, 0, 0], size: [0.15, 0.2], mirror: s < 0, segments: 10 });

    // Leg feathering
    b.cards(
      b.surface(legF).scatter(60, { rng: rng(30 + (s > 0 ? 0 : 1)), minDist: 0.04, filter: (h) => h.at.y > 0.35 && h.n.z < 0.3 }),
      [TUFT, TUFT2],
      { size: [0.05, 0.1], lean: 60, bend: 20, vary: 0.3, rng: rng(32), color: LEGP },
    );

    // Hind leg: digitigrade, knee forward, hock back
    const hpts = limb(
      [s * 0.15, 0.72, -0.46],
      [s * 0.15, 0.13, -0.6],
      [0.32, 0.32, 0.26],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${L}`, catmull(hpts), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `pawH${L}`],
      role: "leg",
      contact: [s * 0.15, 0, -0.56],
    });
    const legH = b.sweep(hl, [0.115, 0.095, 0.075, 0.056, 0.05], { color: LEGP });
    b.part(new THREE.SphereGeometry(1, 10, 8), SHP, {
      bone: hl.joints[0],
      at: [s * 0.15, 0.7, -0.44],
      scale: [0.095, 0.17, 0.16],
    });
    b.spike(hpts[2], [hpts[2].x, hpts[2].y + 0.04, hpts[2].z - 0.07], null, 0.03, "#8b97a6", {
      bone: hl.joints[2],
      sides: 5,
    });
    const toeH = b.joint(`toeH${L}`, {
      parent: hl.joints[3],
      at: [s * 0.15, 0.05, -0.53],
      aim: [s * 0.15, 0.04, -0.4],
      role: "digit",
    });
    buildPaw(s * 0.15, -0.6, hl.joints[3], toeH);
    b.cards(
      b.surface(legH).scatter(60, { rng: rng(34 + (s > 0 ? 0 : 1)), minDist: 0.04, filter: (h) => h.at.y > 0.4 }),
      [TUFT, TUFT2],
      { size: [0.05, 0.1], lean: 60, bend: 20, vary: 0.3, rng: rng(36), color: LEGP },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), SKULLP, {
    bone: head,
    at: hp(0, 0.05, 0.06),
    scale: [0.115, 0.105, 0.125],
  });
  b.sweep([hp(0, 0.04, 0.11), hp(0, 0.012, 0.3)], (t) => [0.088 - 0.046 * t, 0.072 - 0.034 * t], {
    bone: head,
    color: MUZP,
    sides: 8,
  });
  b.sweep([hp(0, -0.015, 0.04), hp(0, -0.036, 0.29)], (t) => [0.06 - 0.03 * t, 0.04 - 0.018 * t], {
    bone: jaw,
    color: JAWP,
    sides: 8,
  });
  b.spike(hp(0, -0.05, 0.22), hp(0, -0.1, 0.18), null, 0.018, CREAM_B, { bone: jaw, sides: 5 });

  // Nose
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NOSE, { bone: head, at: hp(0, 0.024, 0.325), scale: [1.15, 0.9, 0.95] });
  b.part(new THREE.SphereGeometry(0.006, 5, 4), "#8d9bb0", { bone: head, at: hp(0, 0.047, 0.332) });
  // Mouth line
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#0d0b10", { bone: head, at: hp(s * 0.016, 0.018, 0.352) });
    b.sweep(
      catmull([hp(s * 0.04, -0.022, 0.3), hp(s * 0.06, -0.026, 0.21), hp(s * 0.072, -0.03, 0.12), hp(s * 0.08, -0.03, 0.06)]),
      0.006,
      "#15121a",
      { bone: head, sides: 4 },
    );
    // Fangs
    b.spike(hp(s * 0.04, -0.018, 0.27), [0, -1, 0.04], 0.04, 0.012, FANG, { bone: head, sides: 6 });
    // Whiskers
    for (const k of [0, 1, 2]) {
      b.rod(
        hp(s * 0.036, 0.002 - k * 0.012, 0.25 - k * 0.02),
        hp(s * (0.15 + k * 0.01), -0.0 - k * 0.025, 0.17 - k * 0.03),
        [0.004, 0.002],
        WHISK,
        { bone: head, sides: 4 },
      );
    }
    // Cheek ruff
    for (const k of [0, 1, 2]) {
      const base = hp(s * (0.085 - k * 0.01), 0.02 - k * 0.028, 0.03 + k * 0.01);
      b.spike(base, [base[0] + s * 0.045, base[1] - 0.02, base[2] - 0.085], null, 0.022, CREAM_B, { bone: head, sides: 5 });
    }

    // Eyes: amber, glowing, with dark liner, heavy lid and a bright highlight
    const eye = hp(s * 0.082, 0.082, 0.128);
    const eyeV = new THREE.Vector3(eye[0], eye[1], eye[2]);
    const d = new THREE.Vector3(s * 0.5, 0.1, 0.85).normalize();
    b.part(new THREE.SphereGeometry(0.025, 8, 6), "#15131a", {
      bone: head,
      at: eyeV.clone().addScaledVector(d, -0.004),
      scale: [1.15, 0.95, 0.7],
    });
    glow(b.part(new THREE.SphereGeometry(0.02, 8, 6), EYE, { bone: head, at: eyeV }), 1.2);
    b.part(new THREE.SphereGeometry(0.009, 6, 5), "#0a0810", { bone: head, at: eyeV.clone().addScaledVector(d, 0.0145) });
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", {
      bone: head,
      at: eyeV.clone().addScaledVector(d, 0.0185).add(new THREE.Vector3(-s * 0.004, 0.006, 0)),
    });
    b.part(new THREE.SphereGeometry(0.0235, 8, 5), "#2f3645", {
      bone: head,
      at: eyeV.clone().add(new THREE.Vector3(0, 0.011, -0.004)),
      scale: [1.25, 0.62, 1],
      rotation: [0, 0, s * 16],
    });
    // Brow tuft and pale brow spot
    b.spike(hp(s * 0.05, 0.118, 0.135), hp(s * 0.09, 0.128, 0.07), null, 0.014, CREST, { bone: head, sides: 5 });
    b.part(new THREE.SphereGeometry(1, 6, 4), CREAM_B, {
      bone: head,
      at: hp(s * 0.052, 0.118, 0.145),
      scale: [0.013, 0.008, 0.02],
    });

    // Cheek war paint
    b.decal(skull, CHEEK_PAINT, {
      at: hp(s * 0.108, 0.025, 0.07),
      dir: [s, 0, 0],
      size: [0.07, 0.05],
      mirror: s < 0,
      segments: 8,
    });

    // Ears: tall, forward-pricked, notched on the left
    const ear = b.extrude(s > 0 ? EAR_NOTCH : EAR, {
      at: hp(s * 0.062, 0.115, 0),
      x: [s, -0.22, 0],
      y: [s * 0.22, 1, 0.1],
      thickness: 0.02,
      bevel: 0.005,
      smoothing: 1,
      color: EARP,
      bone: head,
    });
    const k = ear.axis.z > 0 ? 1 : -1;
    b.extrude(EAR_INNER, {
      at: ear.local([0, 0, k * 0.0105]),
      x: [s, -0.22, 0],
      y: [s * 0.22, 1, 0.1],
      thickness: 0.014,
      bevel: 0.003,
      smoothing: 1,
      color: EAR_IN,
      bone: head,
    });
  }

  // A scar behind the left eye
  const scar = b.surface(skull).drape(catmull([hp(0.085, 0.12, 0.06), hp(0.1, 0.07, 0.07), hp(0.105, 0.02, 0.08)]), {
    lift: 0.004,
  });
  b.sweep(scar, 0.004, "#cdb0a0", { sides: 4 });

  // Skull fur
  b.cards(
    b.surface(skull).scatter(90, { rng: rng(40), minDist: 0.03, filter: (h) => h.at.z < 0.74 && h.n.y > -0.2 }),
    [TUFT, TUFT2],
    { size: [0.04, 0.07], lean: 70, bend: 20, vary: 0.3, rng: rng(41), color: SKULLP },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Spiked leather collar, fang pendant and hanging feathers
  const ringPts = Array.from({ length: 12 }, (_, k) => neckSw.at(0.62, k * 30, 0.01));
  b.sweep(catmull(ringPts, { closed: true }), 0.022, LEATHER, { sides: 6 });
  for (let k = 0; k < 12; k++) {
    const at = neckSw.at(0.62, k * 30, 0.012);
    b.spike(at, at, 0.05, 0.013, BRASS, { sides: 5 });
  }
  const q = neckSw.at(0.62, 180, 0.012);
  const ringAt = q.at.clone().add(new THREE.Vector3(0, -0.02, 0.014));
  b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 10), BRASS, { at: ringAt, bone: neck.joints[1] });
  b.spike(ringAt.clone().add(new THREE.Vector3(0, -0.012, 0)), [0, -1, 0.2], 0.085, 0.017, FANG, {
    bone: neck.joints[1],
    sides: 6,
  });
  b.rod(q, ringAt, 0.005, LEATHER_DARK, { sides: 4 });
  [250, 275, 300].forEach((a, i) => {
    const p = neckSw.at(0.62, a, 0.02);
    b.cards([frame(p, [0, 1, 0])], i === 1 ? FEATHER_TEAL : FEATHER_RED, {
      size: [0.045, 0.15 - i * 0.012],
      lean: 180,
      flow: [0, 0, 1],
      sink: 0.05,
    });
  });

  // -------------------------------------------------------------------------------------------------------------
  // Mane and dorsal crest
  for (let i = 0; i < 13; i++) {
    const at = body.at(0.12 + i * 0.07, 0);
    const len = 0.075 + 0.03 * Math.sin((i / 12) * Math.PI);
    b.spike(
      at,
      at.at.clone().addScaledVector(at.n, len * 0.8).add(new THREE.Vector3(0, -0.01, -len * 0.7)),
      null,
      0.02,
      CREST,
      { sides: 5 },
    );
  }
  for (let i = 0; i < 8; i++) {
    const at = neckSw.at(0.1 + i * 0.1, 0);
    b.spike(
      at,
      at.at.clone().addScaledVector(at.n, 0.07).add(new THREE.Vector3(0, -0.01, -0.07)),
      null,
      0.022,
      CREST,
      { sides: 5 },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Fur cards: flanks, belly, chest mane, neck ruff, tail brush
  const bodySkin = b.surface(body);
  b.cards(bodySkin.scatter(420, { rng: rng(3), minDist: 0.06, filter: (h) => h.n.y > -0.5 }), [TUFT, TUFT2], {
    size: [0.07, 0.13],
    lean: 62,
    bend: 25,
    vary: 0.3,
    rng: rng(4),
    color: BODYP,
  });
  b.cards(bodySkin.scatter(90, { rng: rng(5), minDist: 0.07, filter: (h) => h.n.y < -0.3 }), [TUFT, TUFT2], {
    size: [0.07, 0.14],
    lean: 70,
    bend: 25,
    vary: 0.3,
    rng: rng(6),
    color: BODYP,
  });
  b.cards(
    bodySkin.scatter(120, { rng: rng(7), minDist: 0.05, filter: (h) => h.at.z > 0.3 && h.n.z > 0.1 }),
    [TUFT, TUFT2],
    { size: [0.08, 0.2], lean: 70, bend: 30, flow: [0, -1, -0.25], vary: 0.3, rng: rng(8), color: BODYP },
  );
  b.cards(b.surface(neckSw).scatter(220, { rng: rng(21), minDist: 0.04 }), [TUFT, TUFT2], {
    size: [0.08, 0.17],
    lean: 55,
    bend: 30,
    vary: 0.3,
    rng: rng(22),
    color: NECKP,
  });
  b.cards(b.surface(tailSw).scatter(200, { rng: rng(23), minDist: 0.04 }), [TUFT, TUFT2], {
    size: [0.06, 0.14],
    lean: 60,
    bend: 25,
    vary: 0.3,
    rng: rng(24),
    color: TAILP,
  });

  return b.root;
}
