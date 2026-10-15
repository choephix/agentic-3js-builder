import * as THREE from "three";
import {
  createBuilder,
  aim,
  catmull,
  bezier,
  paint,
  noise,
  cells,
  smoothstep,
  mix,
  rgb,
  svg,
  rng,
} from "../../../../src/index";
import type { Rgb } from "../../../../src/index";

export const meta = {
  name: "African Bush Elephant",
  description:
    "A majestic, low-poly adult African bush elephant (Loxodonta africana) with massive continent-shaped ears, curved ivory tusks, segmented trunk, and sturdy pillar limbs, standing on a sunbaked African savanna base with a termite mound and golden grass.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "african_bush_elephant" });
  const rand = rng(42);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE & PROCEDURAL PAINTS
  // ---------------------------------------------------------------------------
  const INK: Rgb = [0.12, 0.11, 0.13];
  const EYE_AMBER: Rgb = [0.82, 0.52, 0.18];
  const NAIL_HORN = "#dfd6c4";
  const MOUTH_PINK = "#5c333a";
  const BRISTLE_BLACK = "#1e1d20";
  const TERMITE_RED = "#9a4928";
  const WOOD_GREY = "#4c3d32";
  const GRASS_GOLD = "#c8a548";

  // Weathered, cracked elephant hide with savanna red-ochre dust on top
  // and dry alluvial mud on the lower legs
  const ELEPHANT_SKIN = paint((p, n) => {
    const baseGrey: Rgb = [0.32, 0.33, 0.36];
    const darkCrease: Rgb = [0.18, 0.18, 0.2];
    const lightRidge: Rgb = [0.42, 0.43, 0.47];
    const ochreDust: Rgb = [0.65, 0.36, 0.2];
    const dryMud: Rgb = [0.38, 0.3, 0.22];

    // Elephant skin wrinkles using cellular noise
    const cell = cells(p, 0.055, 11);
    const wrinkleBorder = smoothstep(0.06, 0.16, cell.d2 - cell.d1);
    let col = mix(darkCrease, baseGrey, wrinkleBorder);

    // Fine surface noise for dry leathery facets
    const micro = noise(p, 0.02, 17);
    col = mix(col, lightRidge, (micro - 0.5) * 0.3);

    // Savanna laterite / ochre dust thrown over back, cranium and shoulders
    if (p.y > 1.4 && n.y > 0.05) {
      const dustMask = smoothstep(0.1, 0.7, n.y) * smoothstep(1.4, 2.5, p.y);
      const dustNoise = noise(p, 0.18, 23);
      col = mix(col, ochreDust, dustMask * (0.45 + 0.35 * dustNoise));
    }

    // Mud splashes around feet and lower legs
    if (p.y < 0.7) {
      const mudMask = smoothstep(0.7, 0.15, p.y);
      col = mix(col, dryMud, mudMask * 0.75);
    }

    // Belly countershading (slightly darker and cooler underneath)
    if (n.y < -0.2) {
      col = mix(col, INK, smoothstep(-0.2, -0.8, n.y) * 0.4);
    }

    return col;
  });

  // Inner ear skin: warm vascular pink flush with subtle radiating shade
  const EAR_INNER_PAINT = paint((p, n) => {
    const outerGrey: Rgb = [0.34, 0.34, 0.38];
    const innerFlush: Rgb = [0.62, 0.42, 0.4];
    const deepVessels: Rgb = [0.48, 0.28, 0.28];
    const ochreRim: Rgb = [0.6, 0.34, 0.18];

    const distFromCenter = Math.hypot(p.x, p.y - 2.2);
    let col = mix(innerFlush, outerGrey, smoothstep(0.35, 0.95, distFromCenter));

    // Blood vessel veins
    const veinNoise = noise(p, 0.08, 9);
    if (veinNoise > 0.6) {
      col = mix(col, deepVessels, (veinNoise - 0.6) * 1.5);
    }

    // Sun dust along top rim of ears
    if (n.y > 0.3 && p.y > 2.5) {
      col = mix(col, ochreRim, 0.5);
    }

    return col;
  });

  // Ivory paint: warm butter-cream ivory with weathered gum-line stains
  const IVORY_PAINT = paint((p) => {
    const freshIvory: Rgb = [0.97, 0.94, 0.86];
    const weatheredBase: Rgb = [0.55, 0.42, 0.26];
    const midIvory: Rgb = [0.88, 0.82, 0.7];

    const grainPattern = noise(p, 0.015, 31);
    let col = mix(freshIvory, midIvory, grainPattern * 0.3);

    // Weathering near the mouth/root (z < 2.2, y > 1.5)
    const baseDist = Math.hypot(p.y - 1.9, p.z - 1.9);
    if (baseDist < 0.45) {
      const stain = smoothstep(0.45, 0.05, baseDist);
      col = mix(col, weatheredBase, stain * 0.75);
    }

    return col;
  });

  // Savanna ground terrain paint
  const SAVANNA_DIRT = paint((p) => {
    const bakedClay: Rgb = [0.55, 0.32, 0.16];
    const drySand: Rgb = [0.72, 0.54, 0.32];
    const darkEarth: Rgb = [0.36, 0.2, 0.1];

    const n1 = noise(p, 0.35, 77);
    const n2 = noise(p, 0.08, 83);
    let c = mix(bakedClay, drySand, n1);
    c = mix(c, darkEarth, smoothstep(0.55, 0.8, n2));
    return c;
  });

  // ---------------------------------------------------------------------------
  // TEXTURES: EXPRESSIVE ELEPHANT EYE
  // ---------------------------------------------------------------------------
  const eyeTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ba8230"/>
          <stop offset="65%" stop-color="#7a4618"/>
          <stop offset="100%" stop-color="#241508"/>
        </radialGradient>
      </defs>
      <!-- Sclera with wrinkle shading -->
      <ellipse cx="64" cy="64" rx="58" ry="44" fill="#1e1d21"/>
      <ellipse cx="64" cy="64" rx="52" ry="38" fill="#4a4642"/>
      <!-- Amber iris -->
      <ellipse cx="64" cy="64" rx="34" ry="32" fill="url(#irisGrad)"/>
      <!-- Oval pupil characteristic of gentle megafauna -->
      <ellipse cx="64" cy="64" rx="16" ry="17" fill="#0d0c0e"/>
      <!-- Highlights reflecting wide African sky -->
      <circle cx="53" cy="54" r="6" fill="#ffffff" opacity="0.95"/>
      <circle cx="75" cy="72" r="3" fill="#ffffff" opacity="0.6"/>
      <!-- Eyelid fold lines -->
      <path d="M 12,60 Q 64,24 116,60" stroke="#18171a" stroke-width="4.5" fill="none"/>
      <path d="M 18,68 Q 64,100 110,68" stroke="#18171a" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON HIERARCHY
  // ---------------------------------------------------------------------------
  // Root at hips / pelvis center
  const hips = b.joint("hips", {
    at: [0, 2.32, -0.65],
    role: "spine",
    group: "body",
  });

  // Spine curving through saddle back and rising to massive withers
  const lumbar = b.joint("spineLumbar", {
    parent: hips,
    at: [0, 2.22, -0.1],
    role: "spine",
    group: "body",
  });

  const withers = b.joint("spineWithers", {
    parent: lumbar,
    at: [0, 2.58, 0.55],
    role: "spine",
    group: "body",
  });

  const neck = b.joint("neck", {
    parent: withers,
    at: [0, 2.38, 1.15],
    role: "neck",
    group: "head",
  });

  // Massive skull
  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.45, 1.55],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  // Lower jaw (hinged so elephant can open mouth)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.88, 1.72],
    dir: [0, -0.25, 0.8],
    role: "jaw",
    group: "head",
  });

  // Ears (hinged on skull sides)
  const earL = b.joint("earL", {
    parent: head,
    at: [0.44, 2.48, 1.38],
    dir: [0.85, 0.15, -0.5],
    role: "fan",
    group: "head",
  });

  const earR = b.joint("earR", {
    parent: head,
    at: [-0.44, 2.48, 1.38],
    dir: [-0.85, 0.15, -0.5],
    role: "fan",
    group: "head",
  });

  // Trunk: 7 articulation joints curving gracefully downwards, then forward/up at tip
  const trunk1 = b.joint("trunk1", { parent: head, at: [0, 2.05, 1.95], dir: [0, -0.7, 0.4], role: "tentacle", group: "trunk" });
  const trunk2 = b.joint("trunk2", { parent: trunk1, at: [0, 1.72, 2.08], dir: [0, -0.8, 0.3], role: "tentacle", group: "trunk" });
  const trunk3 = b.joint("trunk3", { parent: trunk2, at: [0, 1.35, 2.18], dir: [0, -0.9, 0.25], role: "tentacle", group: "trunk" });
  const trunk4 = b.joint("trunk4", { parent: trunk3, at: [0, 0.95, 2.26], dir: [0, -0.8, 0.45], role: "tentacle", group: "trunk" });
  const trunk5 = b.joint("trunk5", { parent: trunk4, at: [0, 0.62, 2.42], dir: [0, -0.4, 0.8], role: "tentacle", group: "trunk" });
  const trunk6 = b.joint("trunk6", { parent: trunk5, at: [0, 0.48, 2.65], dir: [0, 0.2, 0.9], role: "tentacle", group: "trunk" });
  const trunk7 = b.joint("trunk7", { parent: trunk6, at: [0, 0.64, 2.84], dir: [0, 0.6, 0.7], role: "tentacle", group: "trunk" });

  // Tusks roots
  const tuskL = b.joint("tuskL", {
    parent: head,
    at: [0.26, 1.92, 1.88],
    dir: [0.25, -0.4, 0.88],
    role: "hinge",
    group: "head",
  });

  const tuskR = b.joint("tuskR", {
    parent: head,
    at: [-0.26, 1.92, 1.88],
    dir: [-0.25, -0.4, 0.88],
    role: "hinge",
    group: "head",
  });

  // Tail joints
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 2.26, -1.22], dir: [0, -0.7, -0.5], role: "tail", group: "tail" });
  const tail2 = b.joint("tail2", { parent: tail1, at: [0, 1.85, -1.35], dir: [0, -0.85, -0.2], role: "tail", group: "tail" });
  const tail3 = b.joint("tail3", { parent: tail2, at: [0, 1.45, -1.42], dir: [0, -0.92, 0.05], role: "tail", group: "tail" });
  const tail4 = b.joint("tail4", { parent: tail3, at: [0, 1.08, -1.46], dir: [0, -0.95, 0.1], role: "tail", group: "tail" });

  // Front legs (forelimbs)
  const shoulderL = b.joint("shoulderL", { parent: withers, at: [0.55, 2.28, 0.72], role: "leg", group: "legFL" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [0.54, 1.52, 0.68], role: "leg", group: "legFL" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [0.52, 0.82, 0.7], role: "leg", group: "legFL" });
  const footL = b.joint("footL", { parent: wristL, at: [0.52, 0.14, 0.72], role: "leg", group: "legFL" });

  const shoulderR = b.joint("shoulderR", { parent: withers, at: [-0.55, 2.28, 0.72], role: "leg", group: "legFR" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-0.54, 1.52, 0.68], role: "leg", group: "legFR" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-0.52, 0.82, 0.7], role: "leg", group: "legFR" });
  const footR = b.joint("footR", { parent: wristR, at: [-0.52, 0.14, 0.72], role: "leg", group: "legFR" });

  // Hind legs
  const hipHL = b.joint("hipHL", { parent: hips, at: [0.52, 2.2, -0.75], role: "leg", group: "legHL" });
  const kneeHL = b.joint("kneeHL", { parent: hipHL, at: [0.52, 1.46, -0.72], role: "leg", group: "legHL" });
  const ankleHL = b.joint("ankleHL", { parent: kneeHL, at: [0.5, 0.8, -0.78], role: "leg", group: "legHL" });
  const footHL = b.joint("footHL", { parent: ankleHL, at: [0.5, 0.14, -0.78], role: "leg", group: "legHL" });

  const hipHR = b.joint("hipHR", { parent: hips, at: [-0.52, 2.2, -0.75], role: "leg", group: "legHR" });
  const kneeHR = b.joint("kneeHR", { parent: hipHR, at: [-0.52, 1.46, -0.72], role: "leg", group: "legHR" });
  const ankleHR = b.joint("ankleHR", { parent: kneeHR, at: [-0.5, 0.8, -0.78], role: "leg", group: "legHR" });
  const footHR = b.joint("footHR", { parent: ankleHR, at: [-0.5, 0.14, -0.78], role: "leg", group: "legHR" });

  // ---------------------------------------------------------------------------
  // BODY: BARREL TORSO & SADDLE-BACK SILHOUETTE
  // ---------------------------------------------------------------------------
  // We loft stations along the spine to create the massive elephant ribcage,
  // sloping hips, and hanging barrel belly.
  const bodyStations = [
    { at: [0, 2.18, -1.28], w: 1.05, h: 1.15 }, // rump end
    { at: [0, 2.34, -0.85], w: 1.34, h: 1.32 }, // hip flare
    { at: [0, 2.12, -0.25], w: 1.54, h: 1.58 }, // sagging mid-belly
    { at: [0, 2.24, 0.32], w: 1.5, h: 1.62 }, // massive deep chest
    { at: [0, 2.48, 0.82], w: 1.38, h: 1.52 }, // prominent withers shoulder
    { at: [0, 2.32, 1.25], w: 1.12, h: 1.26 }, // base of neck
    { at: [0, 2.34, 1.45], w: 0.98, h: 1.15 }, // neck junction
  ];

  b.loft(bodyStations, {
    bone: [hips, lumbar, withers, neck],
    color: ELEPHANT_SKIN,
    section: "circle",
    sides: 9,
    smooth: false,
    group: "body",
    name: "torso",
  });

  // Muscular shoulder blade (scapula) low-poly faceted plates
  for (const s of [1, -1]) {
    b.part(
      new THREE.ConeGeometry(0.32, 0.75, 5),
      ELEPHANT_SKIN,
      {
        bone: withers,
        at: [s * 0.68, 2.38, 0.65],
        dir: [s * 0.35, 0.85, -0.2],
        scale: [1.2, 0.95, 0.45],
        flat: true,
        group: "body",
        name: `scapula${s > 0 ? "L" : "R"}`,
      },
    );

    // Iliac crest (hip bone prominence)
    b.part(
      new THREE.BoxGeometry(0.25, 0.42, 0.55),
      ELEPHANT_SKIN,
      {
        bone: hips,
        at: [s * 0.64, 2.28, -0.78],
        rotation: [s * 12, 0, s * -18],
        flat: true,
        group: "body",
        name: `iliac${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD & CRANIUM
  // ---------------------------------------------------------------------------
  // Twin cranial domes (African elephant double forehead bump)
  for (const s of [1, -1]) {
    b.part(
      new THREE.DodecahedronGeometry(0.24, 0),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.22, 2.72, 1.58],
        scale: [0.9, 1.05, 1.15],
        flat: true,
        group: "head",
        name: `cranialDome${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Forehead wedge sloping down between the cranial domes
  b.frustumBox(
    [0, 2.7, 1.55],
    [0, 2.2, 1.88],
    [0.48, 0.32],
    [0.38, 0.28],
    {
      bone: head,
      color: ELEPHANT_SKIN,
      sides: 6,
      smooth: false,
      group: "head",
      name: "foreheadSlope",
    },
  );

  // Skull main cheek block
  b.frustumBox(
    [0, 2.45, 1.35],
    [0, 2.15, 1.82],
    [0.86, 0.78],
    [0.62, 0.65],
    {
      bone: head,
      color: ELEPHANT_SKIN,
      sides: 7,
      smooth: false,
      group: "head",
      name: "skullCore",
    },
  );

  // Deep temporal hollows behind eyes
  for (const s of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.18, 0.28, 0.36),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.38, 2.48, 1.56],
        rotation: [10, s * 25, s * -15],
        flat: true,
        group: "head",
        name: `temporalHollow${s > 0 ? "L" : "R"}`,
      },
    );

    // Brow ridge arches over each eye
    b.part(
      new THREE.BoxGeometry(0.12, 0.1, 0.28),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.44, 2.44, 1.76],
        rotation: [0, s * 30, s * 12],
        flat: true,
        group: "head",
        name: `browRidge${s > 0 ? "L" : "R"}`,
      },
    );

    // Eye assembly: eyeball with textured pupil decal
    const eyeBase = b.part(
      new THREE.SphereGeometry(0.065, 8, 6),
      "#262529",
      {
        bone: head,
        at: [s * 0.42, 2.36, 1.74],
        flat: true,
        group: "head",
        name: `eyeGlobe${s > 0 ? "L" : "R"}`,
      },
    );

    // Eye decal facing outwards and slightly forward
    b.part(
      new THREE.PlaneGeometry(0.09, 0.09),
      "#ffffff",
      {
        bone: head,
        at: [s * 0.45, 2.36, 1.76],
        dir: [s * 0.85, 0.05, 0.45],
        axis: "z",
        texture: eyeTexture,
        group: "head",
        name: `eyeDecal${s > 0 ? "L" : "R"}`,
      },
    );

    // Eye socket fleshy wrinkle folds
    b.rod(
      [s * 0.38, 2.39, 1.68],
      [s * 0.46, 2.4, 1.82],
      0.022,
      ELEPHANT_SKIN,
      { bone: head, sides: 5, smooth: false, group: "head" },
    );
    b.rod(
      [s * 0.39, 2.31, 1.69],
      [s * 0.46, 2.32, 1.81],
      0.02,
      ELEPHANT_SKIN,
      { bone: head, sides: 5, smooth: false, group: "head" },
    );
  }

  // Premaxillary bones (massive tusk sheaths flanking mouth)
  for (const s of [1, -1]) {
    b.frustumBox(
      [s * 0.25, 2.12, 1.75],
      [s * 0.26, 1.88, 1.92],
      [0.22, 0.24],
      [0.17, 0.18],
      {
        bone: head,
        color: ELEPHANT_SKIN,
        sides: 6,
        smooth: false,
        group: "head",
        name: `tuskSheath${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // LOWER JAW & MOUTH
  // ---------------------------------------------------------------------------
  // African elephant narrow triangular chin / lower lip
  b.frustumBox(
    [0, 1.9, 1.68],
    [0, 1.76, 1.96],
    [0.34, 0.18],
    [0.12, 0.1],
    {
      bone: jaw,
      color: ELEPHANT_SKIN,
      sides: 6,
      smooth: false,
      group: "head",
      name: "lowerJawBody",
    },
  );

  // Spout-like chin tip pointing down
  b.spike(
    [0, 1.76, 1.95],
    [0, 1.68, 2.02],
    null,
    0.06,
    {
      bone: jaw,
      color: ELEPHANT_SKIN,
      sides: 5,
      smooth: false,
      group: "head",
      name: "chinTip",
    },
  );

  // Interior mouth cavity tone
  b.part(
    new THREE.BoxGeometry(0.18, 0.08, 0.18),
    MOUTH_PINK,
    {
      bone: jaw,
      at: [0, 1.84, 1.82],
      flat: true,
      group: "head",
      name: "tongue",
    },
  );

  // ---------------------------------------------------------------------------
  // TUSKS (IVORY)
  // ---------------------------------------------------------------------------
  // African bull elephant tusks: long, sweeping curves down, outward, forward, then up
  for (const s of [1, -1]) {
    const tuskPath = catmull([
      [s * 0.26, 1.9, 1.9],
      [s * 0.38, 1.58, 2.18],
      [s * 0.46, 1.25, 2.52],
      [s * 0.44, 1.12, 2.85],
      [s * 0.36, 1.34, 3.16],
    ]);

    b.sweep(tuskPath, (t) => 0.085 * (1 - t * 0.94) + 0.005, {
      bone: s > 0 ? tuskL : tuskR,
      color: IVORY_PAINT,
      sides: 7,
      smooth: false,
      caps: "point",
      group: "head",
      name: `tuskGeo${s > 0 ? "L" : "R"}`,
    });

    // Wrinkled gum sleeve at tusk socket
    b.part(
      new THREE.CylinderGeometry(0.1, 0.11, 0.06, 7),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.27, 1.91, 1.9],
        dir: [s * 0.3, -0.4, 0.8],
        flat: true,
        group: "head",
        name: `tuskSleeve${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // TRUNK (PROBOSCIS)
  // ---------------------------------------------------------------------------
  // Continuous low-poly sweep along the trunk chain
  const trunkPath = catmull([
    [0, 2.05, 1.95],
    [0, 1.72, 2.08],
    [0, 1.35, 2.18],
    [0, 0.95, 2.26],
    [0, 0.62, 2.42],
    [0, 0.48, 2.65],
    [0, 0.64, 2.84],
  ]);

  const trunkSweep = b.sweep(trunkPath, (t) => 0.22 * (1 - t * 0.78) + 0.045, {
    bone: [trunk1, trunk2, trunk3, trunk4, trunk5, trunk6, trunk7],
    color: ELEPHANT_SKIN,
    sides: 7,
    smooth: false,
    caps: "flat",
    group: "trunk",
    name: "trunkMain",
  });

  // Physical low-poly wrinkle accordion rings along the trunk
  const trunkRingTs = [0.08, 0.15, 0.23, 0.31, 0.4, 0.5, 0.6, 0.71, 0.82];
  trunkRingTs.forEach((t, i) => {
    const pt = trunkPath.at(t);
    const tan = trunkPath.tangentAt(t);
    const r = (0.22 * (1 - t * 0.78) + 0.045) * 1.06;
    b.part(
      new THREE.TorusGeometry(r, 0.012, 4, 7),
      ELEPHANT_SKIN,
      {
        at: pt,
        dir: tan,
        flat: true,
        group: "trunk",
        name: `trunkRing_${i}`,
      },
    );
  });

  // African elephant trunk tip: distinct two fingers (one dorsal, one ventral)
  const tipPt = [0, 0.64, 2.84];
  // Upper (dorsal) prehensile finger
  b.spike(
    [0, 0.68, 2.85],
    [0, 0.74, 2.91],
    null,
    0.024,
    {
      bone: trunk7,
      color: ELEPHANT_SKIN,
      sides: 5,
      smooth: false,
      group: "trunk",
      name: "dorsalFinger",
    },
  );

  // Lower (ventral) prehensile finger
  b.spike(
    [0, 0.6, 2.83],
    [0, 0.56, 2.88],
    null,
    0.022,
    {
      bone: trunk7,
      color: ELEPHANT_SKIN,
      sides: 5,
      smooth: false,
      group: "trunk",
      name: "ventralFinger",
    },
  );

  // Nostril recess cavities
  for (const s of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.03, 5),
      "#121114",
      {
        bone: trunk7,
        at: [s * 0.022, 0.64, 2.85],
        dir: [0, 0.6, 0.7],
        flat: true,
        group: "trunk",
        name: `nostril${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // EARS (AFRICAN CONTINENT SILHOUETTE)
  // ---------------------------------------------------------------------------
  // 2D outline modeling the famous "Africa" shape of Loxodonta africana ears:
  // broad northern arch, ragged scalloped notched outer rim, tapering to southern lobe
  const earOutline: [number, number, "sharp"?][] = [
    [0.0, 0.15],
    [0.15, 0.38],
    [0.36, 0.58],
    [0.65, 0.55],
    [0.92, 0.42],
    [1.1, 0.18],
    [1.08, -0.05, "sharp"], // notch tear
    [1.02, -0.12],
    [1.12, -0.22, "sharp"], // horn of Africa corner
    [1.04, -0.36],
    [0.98, -0.48, "sharp"], // notch
    [0.92, -0.62],
    [0.78, -0.82],
    [0.55, -1.02],
    [0.32, -1.12],
    [0.18, -1.05], // southern Cape tip
    [0.12, -0.75],
    [0.06, -0.4],
    [0.0, -0.15],
  ];

  for (const s of [1, -1]) {
    // Extruded ear plate
    b.extrude(earOutline, {
      bone: s > 0 ? earL : earR,
      at: [s * 0.44, 2.48, 1.38],
      x: [s * 0.88, 0.12, -0.45],
      y: [0, 1, 0],
      thickness: [0.035, 0.008],
      bevel: 0.004,
      smoothing: 1,
      color: EAR_INNER_PAINT,
      group: "head",
      name: `earFlap${s > 0 ? "L" : "R"}`,
    });

    // Prominent branching blood vessel ridges on the inner face of the ear
    const earBasePt = [s * 0.46, 2.45, 1.36];
    const earTopRidge = catmull([
      earBasePt,
      [s * 0.72, 2.65, 1.25],
      [s * 1.05, 2.68, 1.08],
    ]);
    b.sweep(earTopRidge, 0.016, {
      bone: s > 0 ? earL : earR,
      color: EAR_INNER_PAINT,
      sides: 5,
      smooth: false,
      group: "head",
      name: `earVein1_${s > 0 ? "L" : "R"}`,
    });

    const earMidRidge = catmull([
      earBasePt,
      [s * 0.82, 2.42, 1.2],
      [s * 1.22, 2.36, 0.98],
    ]);
    b.sweep(earMidRidge, 0.014, {
      bone: s > 0 ? earL : earR,
      color: EAR_INNER_PAINT,
      sides: 5,
      smooth: false,
      group: "head",
      name: `earVein2_${s > 0 ? "L" : "R"}`,
    });

    const earLowerRidge = catmull([
      earBasePt,
      [s * 0.75, 2.18, 1.22],
      [s * 0.95, 1.85, 1.1],
    ]);
    b.sweep(earLowerRidge, 0.015, {
      bone: s > 0 ? earL : earR,
      color: EAR_INNER_PAINT,
      sides: 5,
      smooth: false,
      group: "head",
      name: `earVein3_${s > 0 ? "L" : "R"}`,
    });

    // Ear canal / tragus fleshy base
    b.part(
      new THREE.SphereGeometry(0.08, 6, 5),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.42, 2.38, 1.42],
        scale: [1, 1.2, 0.7],
        flat: true,
        group: "head",
        name: `earCanal${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // PILLAR LEGS & ROUNDED FEET WITH TOENAILS
  // ---------------------------------------------------------------------------
  // Front limbs: column-like graviportal structure
  for (const s of [1, -1]) {
    const foreLegBone = s > 0 ? shoulderL : shoulderR;
    const sideName = s > 0 ? "L" : "R";

    // Upper foreleg (humerus section)
    b.frustumBox(
      [s * 0.55, 2.25, 0.72],
      [s * 0.54, 1.52, 0.68],
      [0.48, 0.48],
      [0.42, 0.42],
      {
        bone: foreLegBone,
        color: ELEPHANT_SKIN,
        sides: 7,
        smooth: false,
        group: `legF${sideName}`,
        name: `humerus${sideName}`,
      },
    );

    // Elbow knuckle bulge
    b.part(
      new THREE.DodecahedronGeometry(0.24, 0),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? elbowL : elbowR,
        at: [s * 0.54, 1.52, 0.65],
        scale: [0.95, 0.85, 1.1],
        flat: true,
        group: `legF${sideName}`,
        name: `elbowKnuckle${sideName}`,
      },
    );

    // Lower foreleg (radius/ulna section)
    b.frustumBox(
      [s * 0.54, 1.52, 0.68],
      [s * 0.52, 0.82, 0.7],
      [0.42, 0.42],
      [0.38, 0.38],
      {
        bone: s > 0 ? elbowL : elbowR,
        color: ELEPHANT_SKIN,
        sides: 7,
        smooth: false,
        group: `legF${sideName}`,
        name: `forearm${sideName}`,
      },
    );

    // Wrist / lower pillar
    b.frustumBox(
      [s * 0.52, 0.82, 0.7],
      [s * 0.52, 0.28, 0.72],
      [0.38, 0.38],
      [0.44, 0.44],
      {
        bone: s > 0 ? wristL : wristR,
        color: ELEPHANT_SKIN,
        sides: 8,
        smooth: false,
        group: `legF${sideName}`,
        name: `wrist${sideName}`,
      },
    );

    // Massive circular cushion foot pad (rests exactly flat on y=0)
    // Radius 0.25, height 0.28, center at y = 0.14 -> bottom touches y = 0.00
    b.part(
      new THREE.CylinderGeometry(0.24, 0.26, 0.28, 9),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? footL : footR,
        at: [s * 0.52, 0.14, 0.72],
        flat: true,
        group: `legF${sideName}`,
        name: `footPadF${sideName}`,
      },
    );

    // African elephant front foot has 4 prominent ivory toenails
    const frontNailAngles = [-55, -20, 20, 55];
    frontNailAngles.forEach((deg, idx) => {
      const rad = deg * (Math.PI / 180);
      const nx = s * 0.52 + Math.sin(rad) * 0.255;
      const nz = 0.72 + Math.cos(rad) * 0.255;
      b.part(
        new THREE.ConeGeometry(0.038, 0.08, 5),
        NAIL_HORN,
        {
          bone: s > 0 ? footL : footR,
          at: [nx, 0.05, nz],
          dir: [Math.sin(rad) * 0.4, -0.85, Math.cos(rad) * 0.4],
          flat: true,
          group: `legF${sideName}`,
          name: `frontNail_${sideName}_${idx}`,
        },
      );
    });
  }

  // Hind limbs: massive muscular thigh tapering to sturdy rear foot
  for (const s of [1, -1]) {
    const hindLegBone = s > 0 ? hipHL : hipHR;
    const sideName = s > 0 ? "L" : "R";

    // Upper thigh
    b.frustumBox(
      [s * 0.52, 2.2, -0.75],
      [s * 0.52, 1.46, -0.72],
      [0.55, 0.55],
      [0.44, 0.44],
      {
        bone: hindLegBone,
        color: ELEPHANT_SKIN,
        sides: 7,
        smooth: false,
        group: `legH${sideName}`,
        name: `femur${sideName}`,
      },
    );

    // Knee cap
    b.part(
      new THREE.DodecahedronGeometry(0.22, 0),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? kneeHL : kneeHR,
        at: [s * 0.52, 1.46, -0.66],
        scale: [0.95, 1.1, 0.85],
        flat: true,
        group: `legH${sideName}`,
        name: `kneeCap${sideName}`,
      },
    );

    // Shin (tibia)
    b.frustumBox(
      [s * 0.52, 1.46, -0.72],
      [s * 0.5, 0.8, -0.78],
      [0.44, 0.44],
      [0.37, 0.37],
      {
        bone: s > 0 ? kneeHL : kneeHR,
        color: ELEPHANT_SKIN,
        sides: 7,
        smooth: false,
        group: `legH${sideName}`,
        name: `shin${sideName}`,
      },
    );

    // Hock / rear ankle
    b.frustumBox(
      [s * 0.5, 0.8, -0.78],
      [s * 0.5, 0.28, -0.78],
      [0.37, 0.37],
      [0.43, 0.43],
      {
        bone: s > 0 ? ankleHL : ankleHR,
        color: ELEPHANT_SKIN,
        sides: 8,
        smooth: false,
        group: `legH${sideName}`,
        name: `cannon${sideName}`,
      },
    );

    // Rear foot pad (rests flat on y=0, height 0.28, center at y = 0.14)
    b.part(
      new THREE.CylinderGeometry(0.23, 0.25, 0.28, 9),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? footHL : footHR,
        at: [s * 0.5, 0.14, -0.78],
        flat: true,
        group: `legH${sideName}`,
        name: `footPadH${sideName}`,
      },
    );

    // African elephant rear foot has 3 prominent toenails
    const rearNailAngles = [-40, 0, 40];
    rearNailAngles.forEach((deg, idx) => {
      const rad = deg * (Math.PI / 180);
      const nx = s * 0.5 + Math.sin(rad) * 0.245;
      const nz = -0.78 + Math.cos(rad) * 0.245;
      b.part(
        new THREE.ConeGeometry(0.038, 0.08, 5),
        NAIL_HORN,
        {
          bone: s > 0 ? footHL : footHR,
          at: [nx, 0.05, nz],
          dir: [Math.sin(rad) * 0.4, -0.85, Math.cos(rad) * 0.4],
          flat: true,
          group: `legH${sideName}`,
          name: `rearNail_${sideName}_${idx}`,
        },
      );
    });
  }

  // ---------------------------------------------------------------------------
  // TAIL & WIRE-HAIR BRUSH
  // ---------------------------------------------------------------------------
  const tailPath = catmull([
    [0, 2.26, -1.22],
    [0, 1.85, -1.35],
    [0, 1.45, -1.42],
    [0, 1.08, -1.46],
  ]);

  b.sweep(tailPath, (t) => 0.048 * (1 - t * 0.6) + 0.016, {
    bone: [tail1, tail2, tail3, tail4],
    color: ELEPHANT_SKIN,
    sides: 6,
    smooth: false,
    caps: "flat",
    group: "tail",
    name: "tailShaft",
  });

  // Elephant tail brush: coarse, flattened fan of stiff black wire bristles
  const tailTipPt = [0, 1.08, -1.46];
  for (let i = -3; i <= 3; i++) {
    const angleSpread = i * 0.035;
    b.spike(
      tailTipPt,
      [angleSpread * 1.5, 0.88, -1.55 - Math.abs(i) * 0.02],
      null,
      0.015,
      {
        bone: tail4,
        color: BRISTLE_BLACK,
        sides: 4,
        smooth: false,
        group: "tail",
        name: `tailBristle_${i + 3}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // STAGED SAVANNA DIORAMA BASE
  // ---------------------------------------------------------------------------
  // Faceted ground slab: top surface flush at y = 0, sinking to y = -0.06
  b.part(
    new THREE.CylinderGeometry(2.1, 2.25, 0.08, 12),
    SAVANNA_DIRT,
    {
      at: [0, -0.04, 0.3],
      flat: true,
      group: "base",
      name: "savannaGround",
    },
  );

  // Outer low-poly pedestal trim
  b.part(
    new THREE.CylinderGeometry(2.26, 2.38, 0.04, 12),
    "#26180f",
    {
      at: [0, -0.07, 0.3],
      flat: true,
      group: "base",
      name: "pedestalTrim",
    },
  );

  // 1. Red Clay Termite Mound (African cathedral spire)
  const termitePath = catmull([
    [1.42, 0.0, 1.1],
    [1.44, 0.28, 1.12],
    [1.42, 0.56, 1.1],
    [1.4, 0.82, 1.08],
  ]);

  b.sweep(termitePath, (t) => 0.24 * (1 - t * 0.75) + 0.05, {
    color: TERMITE_RED,
    sides: 6,
    smooth: false,
    caps: "point",
    group: "scenery",
    name: "termiteMoundMain",
  });

  // Secondary buttress chimney on termite mound
  b.spike(
    [1.26, 0.0, 1.2],
    [1.3, 0.44, 1.18],
    null,
    0.14,
    {
      color: TERMITE_RED,
      sides: 5,
      smooth: false,
      group: "scenery",
      name: "termiteButtress",
    },
  );

  // Termite vent cavity holes
  b.part(
    new THREE.BoxGeometry(0.04, 0.08, 0.04),
    "#180c06",
    {
      at: [1.38, 0.48, 1.18],
      flat: true,
      group: "scenery",
      name: "termiteHole1",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.04, 0.07, 0.04),
    "#180c06",
    {
      at: [1.44, 0.65, 1.14],
      flat: true,
      group: "scenery",
      name: "termiteHole2",
    },
  );

  // 2. Weathered Fallen Acacia Log behind rear leg
  const logPath = catmull([
    [-1.35, 0.04, -1.2],
    [-1.05, 0.07, -1.45],
    [-0.68, 0.05, -1.6],
  ]);

  b.sweep(logPath, [0.09, 0.06], {
    color: WOOD_GREY,
    sides: 6,
    smooth: false,
    caps: "flat",
    group: "scenery",
    name: "acaciaLog",
  });

  // Short broken branch fork on the log
  b.rod(
    [-1.02, 0.07, -1.45],
    [-0.92, 0.22, -1.6],
    0.042,
    WOOD_GREY,
    { sides: 5, smooth: false, group: "scenery", name: "acaciaFork" },
  );

  // 3. Low-Poly Savanna Boulders & Stones
  const rockPlacements: [number, number, number, number][] = [
    [-1.28, 0.06, 0.95, 0.22],
    [-1.45, 0.05, 0.68, 0.16],
    [1.52, 0.05, -0.42, 0.18],
    [1.25, 0.04, -0.92, 0.14],
    [-0.35, 0.03, 1.85, 0.12],
    [0.72, 0.04, 1.88, 0.15],
    [-0.75, 0.03, -1.78, 0.11],
  ];

  rockPlacements.forEach(([rx, ry, rz, rad], idx) => {
    b.part(
      new THREE.DodecahedronGeometry(rad, 0),
      "#6e685f",
      {
        at: [rx, ry, rz],
        rotation: [rand() * 45, rand() * 90, rand() * 45],
        scale: [1.2, 0.75, 1.0],
        flat: true,
        group: "scenery",
        name: `boulder_${idx}`,
      },
    );
  });

  // 4. Clumps of Sun-bleached Dry Savanna Grass
  const grassCenters: [number, number][] = [
    [1.22, 0.98],
    [1.58, 1.3],
    [-1.15, -1.15],
    [-0.78, -1.48],
    [-1.18, 0.82],
    [1.35, -0.6],
    [-0.15, 1.95],
  ];

  grassCenters.forEach(([gx, gz], clumpIdx) => {
    const bladeCount = 6;
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2 + rand() * 0.4;
      const tilt = 0.25 + rand() * 0.2;
      const height = 0.18 + rand() * 0.15;
      const tipX = gx + Math.cos(angle) * (height * tilt);
      const tipZ = gz + Math.sin(angle) * (height * tilt);

      b.spike(
        [gx + (rand() - 0.5) * 0.08, 0.0, gz + (rand() - 0.5) * 0.08],
        [tipX, height, tipZ],
        null,
        0.016,
        {
          color: GRASS_GOLD,
          sides: 3,
          smooth: false,
          group: "scenery",
          name: `grassBlade_${clumpIdx}_${i}`,
        },
      );
    }
  });

  return b.root;
}
