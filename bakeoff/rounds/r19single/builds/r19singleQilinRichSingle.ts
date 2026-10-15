// Qilin: a scaled, hooved chimera with a dragon head, branching antlers and a cloud mane, in a high-fantasy anime
// look (cel-shaded paints from the toon kit, gold trim, glowing jewels from the glow kit).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { gradient, scales } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Qilin",
  description:
    "A towering jade-scaled qilin: dragon head with anime eyes, golden branching antlers tipped with spirit light, billowing cloud mane, cloven gilded hooves, flame-tufted fetlocks and a sash with tassels.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const add = (p: THREE.Vector3, x: number, y: number, z: number) => p.clone().add(V(x, y, z));

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const R = rng(11);

  // ------------------------------------------------------------------------------------------------ palette
  const JADE = "#2fb9a4";
  const JADE_L = "#43cdb2";
  const JADE_D = "#1f9a98";
  const DEEP = "#0e5a66";
  const CREAM = "#fff0cc";
  const CREAM2 = "#ffe3a6";
  const GOLD_S = "#c27c1c";
  const GEM = "#7ff6ff";
  const TOOTH = "#fff6e0";
  const WHISK2 = "#8fe9f5";
  const TONGUE = "#e0566a";

  const SC = scales([JADE, JADE_L, JADE_D], DEEP, { size: 0.05, width: 0.16, seed: 3 });
  const SCH = scales([JADE, JADE_L, JADE_D], DEEP, { size: 0.032, width: 0.16, seed: 4 });
  const BELLY = scales([CREAM, CREAM2], "#d9a95a", { size: 0.05, width: 0.14, seed: 5 });
  const BELLYH = scales([CREAM, CREAM2], "#d9a95a", { size: 0.032, width: 0.14, seed: 6 });
  const LEGLOW = scales(["#ffe29a", "#ffd26b"], GOLD_S, { size: 0.035, width: 0.16, seed: 7 });
  const COAT_RAW = furEdge(SC, BELLY, { level: -0.3, teeth: 0.22, period: 0.035, ink: GOLD_S });
  const BODY = cel(COAT_RAW);
  const LEG = cel(gradient(COAT_RAW, LEGLOW, [0, 0.66, 0], [0, 0.44, 0]));
  const TOP = cel(SC);
  const HEADP = cel(furEdge(SCH, BELLYH, { level: -0.25, teeth: 0.2, period: 0.024, ink: GOLD_S }));
  const GOLD = cel("#ffd24f", "#c27c1c");
  const IVORY = cel("#fff4dc", "#e3c08a");
  const VERM = cel("#ec5238", "#a82a3e");
  const HOOF = cel("#f6c64a", "#b9741a");
  const CYAN = cel("#59d7e6", "#2f9fc0");
  const EAR_IN = cel("#ffd9b0", "#e59a86");

  // ------------------------------------------------------------------------------------------------ textures
  const CLOUD = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M10 96 C6 74 16 58 22 46 C26 38 20 30 24 22 C28 12 40 6 50 12 C60 18 58 32 48 34 C41 35 38 29 42 26 C45 24 46 21 43 19 C37 16 30 22 32 32 C34 44 44 52 42 68 C41 80 32 90 24 96 Z" fill="#f4feff" stroke="#47b9cf" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M20 90 C16 76 24 62 30 50" fill="none" stroke="#9fe4f2" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M29 80 C27 70 32 62 36 56" fill="none" stroke="#b9eef7" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 24 C44 20 50 22 49 27" fill="none" stroke="#ffd24f" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const CLOUD2 = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M14 96 C4 84 8 70 16 64 C6 58 8 44 20 42 C14 32 22 20 34 24 C38 12 54 14 54 26 C62 30 60 44 50 46 C58 56 52 68 42 68 C44 80 36 90 30 96 Z" fill="#eefcff" stroke="#4fb2d8" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M30 62 C23 56 27 47 35 50 C41 53 38 59 33 57" fill="none" stroke="#7fd3ea" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 80 C18 72 22 66 27 64" fill="none" stroke="#a9e7f4" stroke-width="3" stroke-linecap="round"/>
      <path d="M44 34 C48 30 53 33 51 37" fill="none" stroke="#ffd24f" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 32 64">
      <path d="M16 64 C4 54 6 38 14 28 C12 36 18 38 20 30 C22 22 18 12 22 0 C28 12 32 30 28 44 C26 56 22 62 16 64 Z" fill="#ffe08a" stroke="#e9a02a" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M16 60 C10 50 12 40 17 32" fill="none" stroke="#fff6d0" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 24 80">
      <circle cx="12" cy="74" r="4.5" fill="#ffd24f" stroke="#c27c1c" stroke-width="1.4"/>
      <rect x="10.4" y="56" width="3.2" height="14" fill="#ffd24f"/>
      <ellipse cx="12" cy="54" rx="5.5" ry="4.5" fill="#ffd24f" stroke="#c27c1c" stroke-width="1.4"/>
      <path d="M5 52 L19 52 L23 8 L1 8 Z" fill="#ec5238" stroke="#a82a3e" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M8 50 L6 10 M12 50 L12 10 M16 50 L18 10" fill="none" stroke="#ff9a7a" stroke-width="1.6" stroke-linecap="round"/>
      <rect x="3" y="30" width="18" height="3" fill="#ffd24f"/>
    </svg>`,
    { size: 192 },
  );
  const SWIRL = svg(
    `<svg viewBox="0 0 100 100">
      <g fill="none" stroke="#ffd24f" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M52 56 C46 56 42 50 46 46 C50 42 57 45 55 51 C54 54 50 54 50 52"/>
        <path d="M46 46 C38 38 24 42 22 54 C20 68 34 78 50 76 C68 74 78 62 76 48 C74 36 62 28 50 30"/>
        <path d="M76 48 C84 44 92 50 90 58"/>
        <path d="M22 54 C14 52 8 58 10 66"/>
        <path d="M50 76 C52 84 60 88 66 84"/>
      </g>
      <g fill="none" stroke="#fff2b8" stroke-width="1.4" stroke-linecap="round">
        <path d="M40 66 C36 60 38 54 44 52"/>
        <path d="M66 62 C70 56 68 48 62 44"/>
      </g>
    </svg>`,
    { size: 384 },
  );
  const EYE = animeEye({ iris: "#ffae1a", blush: false });

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.24, -0.5], dir: [0, 0.03, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.24, -0.5],
      [0, 1.26, -0.1],
      [0, 1.28, 0.3],
      [0, 1.31, 0.68],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.31, 0.68],
      [0, 1.5, 0.92],
      [0, 1.72, 1.08],
      [0, 1.9, 1.24],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.9, 1.24], dir: [0, -0.25, 1], role: "head" });
  const hp = (left: number, along: number, up: number) => head.local([-left, along, up]);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, 0.05, -0.07), aim: hp(0, 0.5, -0.15), role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.3, -0.95],
      [0, 1.27, -1.3],
      [0, 1.4, -1.7],
      [0, 1.68, -1.92],
      [0, 1.98, -1.86],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ------------------------------------------------------------------------------------------------ body, neck, tail
  const body = b.loft(
    [
      { at: [0, 1.22, -0.98], w: 0.28, h: 0.4 },
      { at: [0, 1.25, -0.7], w: 0.5, h: 0.58 },
      { at: [0, 1.24, -0.3], w: 0.46, h: 0.54 },
      { at: [0, 1.26, 0.15], w: 0.45, h: 0.56 },
      { at: [0, 1.28, 0.55], w: 0.5, h: 0.66 },
      { at: [0, 1.33, 0.88], w: 0.36, h: 0.5 },
    ],
    { bone: [hips, spine], color: BODY },
  );
  const bodySurf = b.surface(body);
  const neckTube = b.sweep(neck, [0.2, 0.16, 0.125, 0.105], BODY);
  const neckSurf = b.surface(neckTube);
  b.sweep(tail, [0.085, 0.05, 0.04, 0.03, 0.025], TOP);

  // dorsal gold spikes
  b.along(
    body,
    8,
    (at) => {
      b.spike(at, at, 0.075, 0.022, { color: GOLD, sides: 6 });
    },
    { from: 0.08, to: 0.9 },
  );

  // ------------------------------------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fx = s * 0.25;

    // shoulder and haunch masses with cloud swirls
    const shoulder = b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: spine.joints[2],
      at: [s * 0.27, 1.15, 0.6],
      scale: [0.14, 0.26, 0.22],
    });
    const haunch = b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: hips,
      at: [s * 0.27, 1.15, -0.6],
      scale: [0.17, 0.3, 0.26],
    });
    b.decal(b.surface(shoulder), SWIRL, { at: [s * 0.43, 1.15, 0.6], dir: [s, 0, 0], size: [0.3, 0.3], mirror: s < 0 });
    b.decal(b.surface(haunch), SWIRL, {
      at: [s * 0.45, 1.15, -0.6],
      dir: [s, 0, 0],
      size: [0.34, 0.34],
      mirror: s < 0,
    });

    // front leg
    const fpts = limb(
      [fx, 1.17, 0.62],
      [fx, 0.11, 0.67],
      [0.42, 0.42, 0.34],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const legF = b.chain(`legF${L}`, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `carpus${L}`, `hoofF${L}`],
      role: "leg",
    });
    b.sweep(legF, [0.12, 0.085, 0.06, 0.045, 0.048], LEG);
    const tipF = legF.tip!;
    b.part(new THREE.CylinderGeometry(0.046, 0.062, 0.11, 6), HOOF, { bone: tipF, at: [fx, 0.055, 0.675], scale: [1, 1, 1.2] });
    b.part(new THREE.BoxGeometry(0.008, 0.09, 0.07), INK, { bone: tipF, at: [fx, 0.055, 0.735] });
    b.part(new THREE.TorusGeometry(0.053, 0.011, 5, 10), GOLD, { at: legF.at(0.9), rotation: [90, 0, 0] });
    b.cards(b.ring(legF.at(0.82), { count: 6, radius: 0.045 }).items, FLAME, {
      size: [0.06, 0.15],
      lean: 40,
      flow: [0, -1, 0],
      bend: 20,
      vary: 0.25,
      rng: R,
      sink: 0.2,
      cross: true,
    });
    b.cards(b.ring(legF.at(0.3), { count: 5, radius: 0.07 }).items, CLOUD2, {
      size: [0.1, 0.2],
      lean: 55,
      flow: [0, -0.4, -1],
      bend: 25,
      vary: 0.25,
      rng: R,
      cross: true,
    });

    // hind leg
    const hx = s * 0.25;
    const hpts = limb(
      [hx, 1.2, -0.58],
      [hx, 0.11, -0.74],
      [0.5, 0.46, 0.38],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const legH = b.chain(`legH${L}`, hpts, {
      parent: hips,
      names: [`hip${L}`, `stifle${L}`, `hock${L}`, `hoofH${L}`],
      role: "leg",
    });
    b.sweep(legH, [0.14, 0.09, 0.06, 0.042, 0.048], LEG);
    const tipH = legH.tip!;
    b.part(new THREE.CylinderGeometry(0.046, 0.062, 0.11, 6), HOOF, { bone: tipH, at: [hx, 0.055, -0.725], scale: [1, 1, 1.2] });
    b.part(new THREE.BoxGeometry(0.008, 0.09, 0.07), INK, { bone: tipH, at: [hx, 0.055, -0.665] });
    b.part(new THREE.TorusGeometry(0.053, 0.011, 5, 10), GOLD, { at: legH.at(0.92), rotation: [90, 0, 0] });
    b.cards(b.ring(legH.at(0.84), { count: 6, radius: 0.045 }).items, FLAME, {
      size: [0.06, 0.15],
      lean: 40,
      flow: [0, -1, 0],
      bend: 20,
      vary: 0.25,
      rng: R,
      sink: 0.2,
      cross: true,
    });
    b.cards(b.ring(legH.at(0.68), { count: 5, radius: 0.05 }).items, CLOUD, {
      size: [0.1, 0.22],
      lean: 55,
      flow: [0, -0.4, -1],
      bend: 25,
      vary: 0.25,
      rng: R,
      cross: true,
    });
  }

  // ------------------------------------------------------------------------------------------------ head
  const SK = hp(0, 0.06, 0.02);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEADP, {
    bone: head,
    frame: head,
    at: SK,
    scale: [0.12, 0.16, 0.115],
  });
  b.loft(
    [
      { at: hp(0, 0.1, 0.0), w: 0.19, h: 0.2 },
      { at: hp(0, 0.22, -0.01), w: 0.16, h: 0.15 },
      { at: hp(0, 0.36, -0.03), w: 0.15, h: 0.115 },
      { at: hp(0, 0.47, -0.045), w: 0.16, h: 0.105 },
    ],
    { bone: head, color: HEADP, sides: 10 },
  );
  b.loft(
    [
      { at: hp(0, 0.08, -0.09), w: 0.15, h: 0.07 },
      { at: hp(0, 0.22, -0.13), w: 0.13, h: 0.06 },
      { at: hp(0, 0.34, -0.15), w: 0.115, h: 0.055 },
      { at: hp(0, 0.44, -0.15), w: 0.12, h: 0.06 },
    ],
    { bone: jaw, color: HEADP, sides: 10 },
  );
  // mouth interior and tongue
  b.part(new THREE.BoxGeometry(0.1, 0.3, 0.04), INK, { bone: head, frame: head, at: hp(0, 0.28, -0.105) });
  b.part(new THREE.SphereGeometry(1, 6, 4), TONGUE, { bone: jaw, frame: head, at: hp(0, 0.28, -0.115), scale: [0.04, 0.12, 0.012] });
  // nose ridge
  b.sweep(catmull([hp(0, 0.04, 0.125), hp(0, 0.2, 0.085), hp(0, 0.38, 0.055)]), [0.013, 0.007], GOLD, {
    bone: head,
    sides: 6,
    caps: { start: "round", end: "point" },
  });
  // eyes
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.around(SK).at(s * 58, 6)!;
    b.decal(skullSurf, EYE, { at: hit, size: [0.072, 0.098], mirror: s > 0, lift: 0.003 });
  }
  // forehead jewel
  glow(
    b.part(new THREE.OctahedronGeometry(0.028, 0), GEM, {
      bone: head,
      frame: head,
      at: hp(0, 0.1, 0.135),
      scale: [1, 0.7, 1.4],
    }),
    1.3,
  );
  b.part(new THREE.TorusGeometry(0.033, 0.007, 5, 8), GOLD, { bone: head, at: hp(0, 0.1, 0.125), axis: "z", dir: [0, 1, 0.3] });

  for (const s of [1, -1]) {
    // nostrils
    b.part(new THREE.SphereGeometry(1, 6, 4), INK, {
      bone: head,
      frame: head,
      at: hp(s * 0.045, 0.485, -0.02),
      scale: [0.014, 0.02, 0.012],
    });
    // brow ridge
    b.sweep(catmull([hp(s * 0.095, 0.03, 0.085), hp(s * 0.085, 0.11, 0.11), hp(s * 0.07, 0.2, 0.1)]), [0.022, 0.011], TOP, {
      bone: head,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
    // fangs
    b.spike(hp(s * 0.05, 0.38, -0.075), [0, -1, -0.1], 0.075, 0.013, { color: TOOTH, bone: head, sides: 6 });
    b.spike(hp(s * 0.045, 0.36, -0.118), [0, 1, 0.1], 0.05, 0.01, { color: TOOTH, bone: jaw, sides: 6 });
    b.spike(hp(s * 0.06, 0.28, -0.085), [0, -1, 0], 0.035, 0.009, { color: TOOTH, bone: head, sides: 6 });
    // ears
    const earOutline: OutlinePoint[] = [
      [0, 0],
      [0.055, 0.03],
      [0.07, 0.12],
      [0.03, 0.25, "sharp"],
      [-0.02, 0.13],
      [-0.035, 0.04],
    ];
    const earInner: OutlinePoint[] = [
      [0.004, 0.02],
      [0.04, 0.04],
      [0.05, 0.115],
      [0.02, 0.2, "sharp"],
      [-0.012, 0.12],
      [-0.022, 0.05],
    ];
    const earAt = hp(s * 0.1, -0.02, 0.09);
    b.extrude(earOutline, {
      at: earAt,
      x: [s, -0.625, 0],
      y: [0.5 * s, 0.8, -0.33],
      thickness: 0.012,
      color: HEADP,
      bone: head,
    });
    b.extrude(earInner, {
      at: earAt,
      x: [s, -0.625, 0],
      y: [0.5 * s, 0.8, -0.33],
      thickness: 0.02,
      color: EAR_IN,
      bone: head,
    });
    // cheek fins
    const finOutline: OutlinePoint[] = [
      [0, 0],
      [0.1, 0.04],
      [0.2, 0, "sharp"],
      [0.12, -0.06],
      [0.16, -0.14, "sharp"],
      [0.06, -0.1],
      [0, -0.08],
    ];
    b.extrude(finOutline, {
      at: hp(s * 0.1, 0.0, -0.02),
      x: [s * 0.5, 0, -1],
      y: [0, 1, 0],
      thickness: 0.01,
      color: CYAN,
      bone: head,
    });
    // whiskers
    const N = hp(s * 0.065, 0.43, -0.03);
    b.sweep(
      catmull([N, add(N, s * 0.1, 0.03, -0.07), add(N, s * 0.26, -0.03, -0.2), add(N, s * 0.42, -0.16, -0.3), add(N, s * 0.52, -0.34, -0.3)]),
      [0.01, 0.002],
      GOLD,
      { bone: head, sides: 5, caps: { start: "flat", end: "point" } },
    );
    const M = hp(s * 0.05, 0.38, -0.1);
    b.sweep(catmull([M, add(M, s * 0.08, -0.03, -0.08), add(M, s * 0.2, -0.12, -0.2), add(M, s * 0.3, -0.3, -0.26)]), [0.008, 0.002], WHISK2, {
      bone: jaw,
      sides: 5,
      caps: { start: "flat", end: "point" },
    });
    // cheek tuft and poll cloud locks
    b.cards([frame(hp(s * 0.1, 0.05, -0.1), [0, 1, 0])], FLAME, {
      size: [0.06, 0.16],
      lean: 180,
      flow: [0, 0, 1],
      bone: head,
      cross: true,
    });
    b.cards(
      [hp(s * 0.035, -0.06, 0.09), hp(s * 0.06, -0.04, 0.08), hp(s * 0.08, -0.02, 0.07)].map((p) => frame(p, [0, 1, 0])),
      CLOUD,
      { size: [0.12, 0.22], lean: 60, flow: [s, -0.2, -0.8], bend: 25, bone: head, mirror: s < 0, rng: R, vary: 0.2 },
    );

    // antlers
    const base = hp(s * 0.07, -0.01, 0.115);
    const at = (x: number, y: number, z: number) => add(base, s * x, y, z);
    const beam = catmull([base, at(0.05, 0.12, -0.04), at(0.11, 0.25, -0.1), at(0.15, 0.38, -0.17), at(0.14, 0.5, -0.24)]);
    b.sweep(beam, [0.028, 0.011], IVORY, {
      bone: head,
      sides: 6,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.5, IVORY],
        [1, GOLD],
      ],
    });
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), GEM, { bone: head, at: beam.at(1) }), 1.4);
    for (const [t, r] of [
      [0.1, 0.031],
      [0.4, 0.022],
    ] as const)
      b.part(new THREE.TorusGeometry(r, 0.007, 5, 8), GOLD, { bone: head, at: beam.at(t), dir: beam.tangentAt(t), axis: "z" });
    const tines: Array<[number, number[][]]> = [
      [
        0.25,
        [
          [0.06, 0.07, 0.06],
          [0.12, 0.17, 0.1],
          [0.15, 0.27, 0.1],
        ],
      ],
      [
        0.5,
        [
          [0.05, 0.08, -0.04],
          [0.1, 0.2, -0.06],
          [0.12, 0.32, -0.05],
        ],
      ],
      [
        0.75,
        [
          [0.0, 0.07, -0.07],
          [0.0, 0.17, -0.15],
          [-0.01, 0.24, -0.24],
        ],
      ],
    ];
    for (const [t, offs] of tines) {
      const p = beam.at(t);
      const pts = [p, ...offs.map((o) => add(p, s * o[0], o[1], o[2]))];
      b.sweep(catmull(pts), [0.014, 0.004], IVORY, {
        bone: head,
        sides: 6,
        caps: { start: "flat", end: "point" },
        bands: [
          [0.5, IVORY],
          [1, GOLD],
        ],
      });
      glow(b.part(new THREE.SphereGeometry(0.013, 6, 4), GEM, { bone: head, at: pts[pts.length - 1] }), 1.4);
    }
  }

  // chin beard
  b.cards(
    [0.2, 0.28, 0.36, 0.42].map((a) => frame(hp(0, a, -0.17), [0, 1, 0])),
    FLAME,
    { size: [0.05, 0.14], lean: 180, flow: [0, 0, 1], bone: jaw, cross: true, vary: 0.2, rng: R },
  );

  // ------------------------------------------------------------------------------------------------ cloud mane
  const maneTex = [CLOUD, CLOUD2, CLOUD];
  const maneRow = (side: number, deg: number, n: number, size: [number, number], lean: number, from: number, to: number) => {
    const frames = Array.from({ length: n }, (_, i) => neckTube.at(from + ((to - from) * i) / (n - 1), deg));
    b.cards(frames, maneTex, {
      size,
      lean,
      bend: 30,
      flow: [side, -0.45, -0.7],
      vary: 0.25,
      spin: 12,
      rng: R,
      mirror: side < 0,
      sink: 0.15,
    });
  };
  maneRow(1, 0, 11, [0.2, 0.36], 50, 0.04, 0.96);
  maneRow(-1, 0, 11, [0.2, 0.36], 50, 0.08, 1);
  maneRow(1, -30, 12, [0.18, 0.32], 50, 0.04, 0.98);
  maneRow(1, -65, 10, [0.14, 0.24], 55, 0.1, 0.95);
  maneRow(-1, 30, 12, [0.18, 0.32], 50, 0.04, 0.98);
  maneRow(-1, 65, 10, [0.14, 0.24], 55, 0.1, 0.95);

  // chest ruff
  const chestHits = bodySurf.scatter(16, {
    rng: R,
    minDist: 0.1,
    filter: (h) => h.at.z > 0.62 && h.n.z > 0.2 && h.at.y < 1.5,
  });
  b.cards(chestHits, CLOUD2, {
    size: [0.14, 0.24],
    lean: 50,
    flow: [0, -1, -0.2],
    bend: 25,
    vary: 0.25,
    spin: 15,
    rng: R,
    cross: true,
  });

  // flank wisps
  for (const s of [1, -1]) {
    const hits = bodySurf.scatter(16, {
      rng: R,
      minDist: 0.13,
      filter: (h) => h.n.x * s > 0.3 && h.n.y > 0.3 && h.at.z < 0.55,
    });
    b.cards(hits, [CLOUD, CLOUD2], {
      size: [0.13, 0.22],
      lean: 75,
      flow: [0, 0.1, -1],
      bend: 25,
      vary: 0.25,
      spin: 20,
      rng: R,
      cross: true,
    });
  }

  // ------------------------------------------------------------------------------------------------ tail plume
  for (const t of [0.55, 0.7, 0.85]) {
    const tp = tail.at(t);
    b.cards(b.ring(tp, { count: 6, radius: 0.03 }).items, [CLOUD2, FLAME, CLOUD], {
      size: [0.13 + 0.06 * t, 0.3],
      lean: 35,
      flow: tp.tangent,
      bend: 25,
      vary: 0.25,
      rng: R,
      cross: true,
    });
  }
  const tipP = tail.at(1);
  b.cards(b.ring(tipP, { count: 6, radius: 0.02 }).items, [CLOUD, CLOUD2], {
    size: [0.18, 0.5],
    lean: 25,
    flow: tipP.tangent,
    bend: 35,
    vary: 0.2,
    rng: R,
    cross: true,
  });
  b.cards([tipP], FLAME, { size: [0.2, 0.55], lean: 0, flow: tipP.tangent, cross: true });

  // ------------------------------------------------------------------------------------------------ neck collar
  const collar = neckSurf.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.017, GOLD, { sides: 6 });
  b.along(neckSurf.loop(neck.joints[1], { lift: 0.03 }), 10, (at) => {
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), GEM, { at }), 0.9);
  });
  const pend = neckSurf.around(neck.joints[1].at).at(0, -15)!;
  b.stick(new THREE.TorusGeometry(0.04, 0.009, 5, 10).rotateX(Math.PI / 2), GOLD, pend, { embed: 0.3 });
  glow(b.stick(new THREE.OctahedronGeometry(0.032, 0), GEM, pend, { embed: 0.1 }), 1.4);

  // ------------------------------------------------------------------------------------------------ sash with tassels
  for (const z of [-0.16, -0.115, -0.07])
    b.sweep(bodySurf.loop(frame([0, 1.26, z], [0, 0.04, 1]), { lift: 0.012 }), 0.03, VERM, { sides: 8 });
  for (const z of [-0.205, -0.025])
    b.sweep(bodySurf.loop(frame([0, 1.26, z], [0, 0.04, 1]), { lift: 0.01 }), 0.017, GOLD, { sides: 6 });
  for (const s of [1, -1]) {
    const K = bodySurf.around(V(0, 1.24, -0.115)).at(s * 90, -20)!;
    b.stick(new THREE.SphereGeometry(0.05, 8, 6), GOLD, K, { embed: 0.3 });
    b.cards([frame(add(K.at, s * 0.06, -0.04, 0), [0, 1, 0])], TASSEL, {
      size: [0.08, 0.34],
      lean: 180,
      flow: [0, 0, 1],
      bone: spine.joints[1],
      cross: true,
      sink: 0.05,
    });
    b.sweep(
      bezier(K, add(K.at, s * 0.18, -0.2, -0.05), add(K.at, s * 0.3, -0.45, -0.35), add(K.at, s * 0.2, -0.62, -0.65)),
      (t) => [0.04 * (1 - 0.6 * t), 0.006],
      VERM,
      { section: "box", up: [s, 0, 0], caps: "flat" },
    );
    b.sweep(
      bezier(K, add(K.at, s * 0.14, -0.15, 0.05), add(K.at, s * 0.26, -0.35, -0.1), add(K.at, s * 0.3, -0.55, -0.3)),
      (t) => [0.022 * (1 - 0.5 * t), 0.005],
      GOLD,
      { section: "box", up: [s, 0, 0], caps: "flat" },
    );
  }

  return b.root;
}
