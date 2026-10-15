Here is the assessment of what needed attention and what has been improved:

1. **Fix lowest point height warning**: The termite mound sweep used `caps: "point"`, which created a cone tip extending 289 mm below $y = 0$ along its start tangent. Set caps to `{ start: "flat", end: "point" }` and tuned the savanna base plate to sit between $y = -0.045\,\text{m}$ and $0.00\,\text{m}$ (well within the 2% height allowance).
2. **Rebalance skin tone and texture**: Brightened the base hide from murky near-black to authentic African elephant dusty slate-grey, smoothing the cellular noise so facets read clearly and adding natural ochre dust over the shoulders, cranium, and saddle back.
3. **Clean, chiseled skull architecture**: Cleared out overlapping filler shapes to give the head readable, regal low-poly planes: dual rounded cranial domes, a smooth sloping forehead wedge, distinct temporal hollows, and forward-angled amber eyes with sculpted eyelid folds.
4. **Massive African continent ears**: Enlarged the ear silhouettes to true *Loxodonta africana* proportions, angled them outward with heroic spread, and detailed the inner surfaces with vascular flush and branching blood vessel ridges.
5. **Majestic ivory tusk curvature**: Re-routed the tusks to emerge from thick premaxillary sockets, sweep down and outward, then curve proudly forward and up with authentic mass and creamy ivory grain.
6. **Dynamic trunk styling**: Removed clipping torus rings in favor of clean low-poly facets, giving the trunk a graceful forward-and-up curve that clearly shows the signature African dual prehensile fingers.
7. **Pillar legs & flush toenails**: Styled the graviportal limbs into sturdy columnar legs with neatly embedded ivory toenail plates (4 on front feet, 3 on hind feet) resting flat on $y = 0$.
8. **Savanna diorama composition**: Shifted the cathedral termite mound to the rear-left flank so it frames the silhouette instead of obstructing the front legs, accompanied by a weathered acacia log, low-poly rocks, and golden savanna grass tufts.

Here is the complete updated module:

```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  noise,
  cells,
  smoothstep,
  mix,
  svg,
  rng,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "African Bush Elephant",
  description:
    "A majestic, low-poly adult African bush elephant (Loxodonta africana) with continent-shaped ears, curved ivory tusks, segmented trunk, and sturdy pillar limbs on a sunbaked African savanna base with a termite mound and golden grass.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "african_bush_elephant" });
  const rand = rng(42);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE & PROCEDURAL PAINTS
  // ---------------------------------------------------------------------------
  const INK: Rgb = [0.14, 0.13, 0.16];
  const NAIL_HORN = "#e2d7c5";
  const MOUTH_PINK = "#6a3b44";
  const BRISTLE_BLACK = "#1c1b1e";
  const TERMITE_RED = "#a64724";
  const WOOD_GREY = "#524438";
  const GRASS_GOLD = "#d4ad4a";

  // Weathered, cracked elephant hide: warm stone-grey with savanna ochre dust
  // across dorsal surfaces and dry mud at the foot pads
  const ELEPHANT_SKIN = paint((p, n) => {
    const baseGrey: Rgb = [0.46, 0.47, 0.51];
    const darkCrease: Rgb = [0.34, 0.35, 0.38];
    const lightRidge: Rgb = [0.55, 0.56, 0.6];
    const ochreDust: Rgb = [0.72, 0.44, 0.24];
    const dryMud: Rgb = [0.42, 0.33, 0.24];

    // Elephant leathery wrinkle network
    const cell = cells(p, 0.08, 11);
    const wrinkleBorder = smoothstep(0.04, 0.22, cell.d2 - cell.d1);
    let col = mix(darkCrease, baseGrey, wrinkleBorder);

    // Fine low-poly facet variation
    const micro = noise(p, 0.03, 17);
    col = mix(col, lightRidge, (micro - 0.5) * 0.25);

    // Laterite / ochre dust thrown across back, withers and cranium
    if (p.y > 1.5 && n.y > 0.08) {
      const dustMask = smoothstep(0.12, 0.65, n.y) * smoothstep(1.5, 2.6, p.y);
      const dustNoise = noise(p, 0.22, 23);
      col = mix(col, ochreDust, dustMask * (0.42 + 0.38 * dustNoise));
    }

    // Mud splashes around lower legs
    if (p.y < 0.6) {
      const mudMask = smoothstep(0.6, 0.12, p.y);
      col = mix(col, dryMud, mudMask * 0.65);
    }

    // Soft ventral countershading
    if (n.y < -0.2) {
      col = mix(col, INK, smoothstep(-0.2, -0.85, n.y) * 0.35);
    }

    return col;
  });

  // Inner ear skin: warm vascular terracotta-rose flush with subtle edge shading
  const EAR_INNER_PAINT = paint((p, n) => {
    const outerGrey: Rgb = [0.44, 0.45, 0.48];
    const innerFlush: Rgb = [0.68, 0.44, 0.42];
    const deepVessels: Rgb = [0.52, 0.28, 0.28];
    const ochreRim: Rgb = [0.66, 0.4, 0.22];

    const distFromCenter = Math.hypot(p.x, p.y - 2.3);
    let col = mix(innerFlush, outerGrey, smoothstep(0.4, 1.1, distFromCenter));

    // Blood vessel veins
    const veinNoise = noise(p, 0.09, 9);
    if (veinNoise > 0.62) {
      col = mix(col, deepVessels, (veinNoise - 0.62) * 1.6);
    }

    // Sunlit top rim
    if (n.y > 0.35 && p.y > 2.6) {
      col = mix(col, ochreRim, 0.45);
    }

    return col;
  });

  // Ivory paint: warm polished cream with grain lines and aged root stains
  const IVORY_PAINT = paint((p) => {
    const freshIvory: Rgb = [0.96, 0.93, 0.84];
    const weatheredBase: Rgb = [0.58, 0.44, 0.28];
    const midIvory: Rgb = [0.89, 0.84, 0.72];

    const grainPattern = noise(p, 0.02, 31);
    let col = mix(freshIvory, midIvory, grainPattern * 0.28);

    // Weathered root near the tusk socket
    const baseDist = Math.hypot(p.y - 1.95, p.z - 1.95);
    if (baseDist < 0.42) {
      const stain = smoothstep(0.42, 0.05, baseDist);
      col = mix(col, weatheredBase, stain * 0.7);
    }

    return col;
  });

  // Savanna ground terrain paint
  const SAVANNA_DIRT = paint((p) => {
    const bakedClay: Rgb = [0.68, 0.44, 0.24];
    const drySand: Rgb = [0.78, 0.58, 0.34];
    const darkEarth: Rgb = [0.46, 0.28, 0.16];

    const n1 = noise(p, 0.4, 77);
    const n2 = noise(p, 0.1, 83);
    let c = mix(bakedClay, drySand, n1);
    c = mix(c, darkEarth, smoothstep(0.55, 0.85, n2));
    return c;
  });

  // ---------------------------------------------------------------------------
  // TEXTURES: ELEPHANT EYE
  // ---------------------------------------------------------------------------
  const eyeTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#d49a3c"/>
          <stop offset="65%" stop-color="#8a5220"/>
          <stop offset="100%" stop-color="#2a180a"/>
        </radialGradient>
      </defs>
      <!-- Sclera with dark skin fold surround -->
      <ellipse cx="64" cy="64" rx="58" ry="46" fill="#1e1d21"/>
      <ellipse cx="64" cy="64" rx="52" ry="40" fill="#4d4a46"/>
      <!-- Warm amber iris -->
      <ellipse cx="64" cy="64" rx="35" ry="33" fill="url(#irisGrad)"/>
      <!-- Pupil -->
      <ellipse cx="64" cy="64" rx="16" ry="17" fill="#0d0c0e"/>
      <!-- Sky catchlight -->
      <circle cx="52" cy="52" r="7" fill="#ffffff" opacity="0.95"/>
      <circle cx="76" cy="74" r="3.5" fill="#ffffff" opacity="0.65"/>
      <!-- Heavy pachyderm eyelid creases -->
      <path d="M 10,58 Q 64,22 118,58" stroke="#161518" stroke-width="5" fill="none"/>
      <path d="M 16,68 Q 64,104 112,68" stroke="#161518" stroke-width="3.5" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON HIERARCHY
  // ---------------------------------------------------------------------------
  // Pelvis root
  const hips = b.joint("hips", {
    at: [0, 2.36, -0.65],
    role: "spine",
    group: "body",
  });

  // Saddle back curve rising to high withers
  const lumbar = b.joint("spineLumbar", {
    parent: hips,
    at: [0, 2.26, -0.05],
    role: "spine",
    group: "body",
  });

  const withers = b.joint("spineWithers", {
    parent: lumbar,
    at: [0, 2.66, 0.6],
    role: "spine",
    group: "body",
  });

  const neck = b.joint("neck", {
    parent: withers,
    at: [0, 2.44, 1.18],
    role: "neck",
    group: "head",
  });

  // Skull
  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.5, 1.58],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  // Lower jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.94, 1.74],
    dir: [0, -0.3, 0.85],
    role: "jaw",
    group: "head",
  });

  // Large outward-fanned ears
  const earL = b.joint("earL", {
    parent: head,
    at: [0.46, 2.48, 1.42],
    dir: [0.82, 0.1, -0.55],
    role: "fan",
    group: "head",
  });

  const earR = b.joint("earR", {
    parent: head,
    at: [-0.46, 2.48, 1.42],
    dir: [-0.82, 0.1, -0.55],
    role: "fan",
    group: "head",
  });

  // Segmented trunk chain
  const trunk1 = b.joint("trunk1", { parent: head, at: [0, 2.06, 1.96], dir: [0, -0.65, 0.45], role: "tentacle", group: "trunk" });
  const trunk2 = b.joint("trunk2", { parent: trunk1, at: [0, 1.74, 2.08], dir: [0, -0.78, 0.32], role: "tentacle", group: "trunk" });
  const trunk3 = b.joint("trunk3", { parent: trunk2, at: [0, 1.36, 2.18], dir: [0, -0.88, 0.28], role: "tentacle", group: "trunk" });
  const trunk4 = b.joint("trunk4", { parent: trunk3, at: [0, 0.96, 2.28], dir: [0, -0.75, 0.52], role: "tentacle", group: "trunk" });
  const trunk5 = b.joint("trunk5", { parent: trunk4, at: [0, 0.65, 2.48], dir: [0, -0.35, 0.85], role: "tentacle", group: "trunk" });
  const trunk6 = b.joint("trunk6", { parent: trunk5, at: [0, 0.56, 2.72], dir: [0, 0.25, 0.88], role: "tentacle", group: "trunk" });
  const trunk7 = b.joint("trunk7", { parent: trunk6, at: [0, 0.72, 2.92], dir: [0, 0.68, 0.65], role: "tentacle", group: "trunk" });

  // Tusk sockets
  const tuskL = b.joint("tuskL", { parent: head, at: [0.28, 1.95, 1.9], dir: [0.25, -0.35, 0.9], role: "hinge", group: "head" });
  const tuskR = b.joint("tuskR", { parent: head, at: [-0.28, 1.95, 1.9], dir: [-0.25, -0.35, 0.9], role: "hinge", group: "head" });

  // Tail
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 2.28, -1.24], dir: [0, -0.7, -0.5], role: "tail", group: "tail" });
  const tail2 = b.joint("tail2", { parent: tail1, at: [0, 1.86, -1.36], dir: [0, -0.85, -0.2], role: "tail", group: "tail" });
  const tail3 = b.joint("tail3", { parent: tail2, at: [0, 1.45, -1.42], dir: [0, -0.92, 0.05], role: "tail", group: "tail" });
  const tail4 = b.joint("tail4", { parent: tail3, at: [0, 1.08, -1.46], dir: [0, -0.95, 0.1], role: "tail", group: "tail" });

  // Forelimbs
  const shoulderL = b.joint("shoulderL", { parent: withers, at: [0.56, 2.3, 0.74], role: "leg", group: "legFL" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [0.55, 1.54, 0.7], role: "leg", group: "legFL" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [0.53, 0.84, 0.72], role: "leg", group: "legFL" });
  const footL = b.joint("footL", { parent: wristL, at: [0.53, 0.14, 0.74], role: "leg", group: "legFL" });

  const shoulderR = b.joint("shoulderR", { parent: withers, at: [-0.56, 2.3, 0.74], role: "leg", group: "legFR" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-0.55, 1.54, 0.7], role: "leg", group: "legFR" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-0.53, 0.84, 0.72], role: "leg", group: "legFR" });
  const footR = b.joint("footR", { parent: wristR, at: [-0.53, 0.14, 0.74], role: "leg", group: "legFR" });

  // Hindlimbs
  const hipHL = b.joint("hipHL", { parent: hips, at: [0.53, 2.22, -0.74], role: "leg", group: "legHL" });
  const kneeHL = b.joint("kneeHL", { parent: hipHL, at: [0.53, 1.48, -0.72], role: "leg", group: "legHL" });
  const ankleHL = b.joint("ankleHL", { parent: kneeHL, at: [0.51, 0.82, -0.76], role: "leg", group: "legHL" });
  const footHL = b.joint("footHL", { parent: ankleHL, at: [0.51, 0.14, -0.76], role: "leg", group: "legHL" });

  const hipHR = b.joint("hipHR", { parent: hips, at: [-0.53, 2.22, -0.74], role: "leg", group: "legHR" });
  const kneeHR = b.joint("kneeHR", { parent: hipHR, at: [-0.53, 1.48, -0.72], role: "leg", group: "legHR" });
  const ankleHR = b.joint("ankleHR", { parent: kneeHR, at: [-0.51, 0.82, -0.76], role: "leg", group: "legHR" });
  const footHR = b.joint("footHR", { parent: ankleHR, at: [-0.51, 0.14, -0.76], role: "leg", group: "legHR" });

  // ---------------------------------------------------------------------------
  // TORSO: MASSIVE RIB CAGE, WITHERS & SADDLE BACK
  // ---------------------------------------------------------------------------
  const bodyStations = [
    { at: [0, 2.2, -1.28], w: 1.05, h: 1.15 },
    { at: [0, 2.38, -0.82], w: 1.34, h: 1.35 },
    { at: [0, 2.16, -0.2], w: 1.55, h: 1.6 },
    { at: [0, 2.32, 0.35], w: 1.52, h: 1.66 },
    { at: [0, 2.58, 0.82], w: 1.38, h: 1.54 },
    { at: [0, 2.4, 1.25], w: 1.12, h: 1.28 },
    { at: [0, 2.42, 1.46], w: 0.98, h: 1.16 },
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

  // Scapula and pelvic crest low-poly muscle plates
  for (const s of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.24, 0.68, 0.45),
      ELEPHANT_SKIN,
      {
        bone: withers,
        at: [s * 0.68, 2.36, 0.66],
        rotation: [12, s * 14, s * -12],
        flat: true,
        group: "body",
        name: `scapulaPlate${s > 0 ? "L" : "R"}`,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.22, 0.44, 0.52),
      ELEPHANT_SKIN,
      {
        bone: hips,
        at: [s * 0.65, 2.28, -0.76],
        rotation: [-8, s * -16, s * -10],
        flat: true,
        group: "body",
        name: `pelvicPlate${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD & CHISELED SKULL
  // ---------------------------------------------------------------------------
  // Twin frontal cranial domes characteristic of the African elephant
  for (const s of [1, -1]) {
    b.part(
      new THREE.DodecahedronGeometry(0.23, 0),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.22, 2.76, 1.58],
        scale: [0.95, 1.05, 1.1],
        flat: true,
        group: "head",
        name: `cranialLobe${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Main skull box connecting cranium to cheeks
  b.frustumBox(
    [0, 2.52, 1.38],
    [0, 2.22, 1.84],
    [0.84, 0.78],
    [0.6, 0.64],
    {
      bone: head,
      color: ELEPHANT_SKIN,
      sides: 7,
      smooth: false,
      group: "head",
      name: "skullCore",
    },
  );

  // Sloping triangular forehead facet between the domes
  b.frustumBox(
    [0, 2.74, 1.56],
    [0, 2.26, 1.88],
    [0.44, 0.26],
    [0.36, 0.22],
    {
      bone: head,
      color: ELEPHANT_SKIN,
      sides: 6,
      smooth: false,
      group: "head",
      name: "foreheadSlope",
    },
  );

  // Temporal hollows and eye assemblies
  for (const s of [1, -1]) {
    // Temporal hollow facet
    b.part(
      new THREE.BoxGeometry(0.14, 0.26, 0.32),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.38, 2.52, 1.55],
        rotation: [10, s * 22, s * -12],
        flat: true,
        group: "head",
        name: `temporalDepression${s > 0 ? "L" : "R"}`,
      },
    );

    // Brow ridge arch
    b.part(
      new THREE.BoxGeometry(0.12, 0.08, 0.26),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.44, 2.48, 1.74],
        rotation: [0, s * 26, s * 10],
        flat: true,
        group: "head",
        name: `browArch${s > 0 ? "L" : "R"}`,
      },
    );

    // Eye globe
    b.part(
      new THREE.SphereGeometry(0.062, 8, 6),
      "#201f22",
      {
        bone: head,
        at: [s * 0.42, 2.4, 1.73],
        flat: true,
        group: "head",
        name: `eyeBall${s > 0 ? "L" : "R"}`,
      },
    );

    // Expressive eye decal oriented forward-outward
    b.part(
      new THREE.PlaneGeometry(0.088, 0.088),
      "#ffffff",
      {
        bone: head,
        at: [s * 0.45, 2.4, 1.74],
        dir: [s * 0.82, 0.08, 0.48],
        axis: "z",
        texture: eyeTexture,
        group: "head",
        name: `eyeDecal${s > 0 ? "L" : "R"}`,
      },
    );

    // Premaxillary tusk sheaths
    b.frustumBox(
      [s * 0.26, 2.15, 1.76],
      [s * 0.28, 1.94, 1.92],
      [0.2, 0.22],
      [0.16, 0.18],
      {
        bone: head,
        color: ELEPHANT_SKIN,
        sides: 6,
        smooth: false,
        group: "head",
        name: `tuskSocket${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // LOWER JAW & MOUTH
  // ---------------------------------------------------------------------------
  b.frustumBox(
    [0, 1.94, 1.7],
    [0, 1.82, 1.96],
    [0.32, 0.16],
    [0.12, 0.1],
    {
      bone: jaw,
      color: ELEPHANT_SKIN,
      sides: 6,
      smooth: false,
      group: "head",
      name: "lowerJaw",
    },
  );

  // Spout-like chin tip
  b.spike(
    [0, 1.82, 1.95],
    [0, 1.74, 2.02],
    null,
    0.055,
    {
      bone: jaw,
      color: ELEPHANT_SKIN,
      sides: 5,
      smooth: false,
      group: "head",
      name: "chinTip",
    },
  );

  // Mouth interior
  b.part(
    new THREE.BoxGeometry(0.16, 0.06, 0.16),
    MOUTH_PINK,
    {
      bone: jaw,
      at: [0, 1.89, 1.82],
      flat: true,
      group: "head",
      name: "oralCavity",
    },
  );

  // ---------------------------------------------------------------------------
  // GRAND SWEEPING IVORY TUSKS
  // ---------------------------------------------------------------------------
  // Classic African bull tusks: heavy roots curving outwards, downwards,
  // sweeping forward, and rising gracefully at the tips
  for (const s of [1, -1]) {
    const tuskPath = catmull([
      [s * 0.28, 1.95, 1.9],
      [s * 0.42, 1.62, 2.22],
      [s * 0.48, 1.3, 2.58],
      [s * 0.45, 1.18, 2.92],
      [s * 0.36, 1.44, 3.25],
    ]);

    b.sweep(tuskPath, (t) => 0.092 * (1 - t * 0.92) + 0.007, {
      bone: s > 0 ? tuskL : tuskR,
      color: IVORY_PAINT,
      sides: 7,
      smooth: false,
      caps: "point",
      group: "head",
      name: `tuskShaft${s > 0 ? "L" : "R"}`,
    });

    // Wrinkled gum sleeve at socket
    b.part(
      new THREE.CylinderGeometry(0.105, 0.115, 0.06, 7),
      ELEPHANT_SKIN,
      {
        bone: head,
        at: [s * 0.29, 1.96, 1.91],
        dir: [s * 0.28, -0.38, 0.85],
        flat: true,
        group: "head",
        name: `tuskSleeve${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // DYNAMIC LOW-POLY TRUNK
  // ---------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, 2.06, 1.96],
    [0, 1.74, 2.08],
    [0, 1.36, 2.18],
    [0, 0.96, 2.28],
    [0, 0.65, 2.48],
    [0, 0.56, 2.72],
    [0, 0.72, 2.92],
  ]);

  b.sweep(trunkPath, (t) => 0.21 * (1 - t * 0.76) + 0.048, {
    bone: [trunk1, trunk2, trunk3, trunk4, trunk5, trunk6, trunk7],
    color: ELEPHANT_SKIN,
    sides: 7,
    smooth: false,
    caps: "flat",
    group: "trunk",
    name: "trunkMain",
  });

  // Prehensile fingers at trunk tip (African elephant has two fingers)
  b.spike(
    [0, 0.76, 2.93],
    [0, 0.83, 3.01],
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

  b.spike(
    [0, 0.68, 2.91],
    [0, 0.64, 2.98],
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

  // Twin nostrils
  for (const s of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.03, 5),
      "#121114",
      {
        bone: trunk7,
        at: [s * 0.022, 0.72, 2.93],
        dir: [0, 0.68, 0.65],
        flat: true,
        group: "trunk",
        name: `nostrilHole${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // CONTINENT-SHAPED AFRICAN EARS
  // ---------------------------------------------------------------------------
  const earOutline: [number, number, "sharp"?][] = [
    [0.0, 0.15],
    [0.16, 0.42],
    [0.38, 0.64],
    [0.68, 0.62],
    [0.98, 0.46],
    [1.18, 0.2],
    [1.15, -0.06, "sharp"],
    [1.08, -0.15],
    [1.2, -0.25, "sharp"], // Horn of Africa corner
    [1.12, -0.4],
    [1.04, -0.52, "sharp"],
    [0.96, -0.68],
    [0.82, -0.9],
    [0.58, -1.1],
    [0.34, -1.22],
    [0.18, -1.14], // Southern Cape tip
    [0.12, -0.82],
    [0.06, -0.42],
    [0.0, -0.15],
  ];

  for (const s of [1, -1]) {
    // Extruded ear plate angled heroically outward
    b.extrude(earOutline, {
      bone: s > 0 ? earL : earR,
      at: [s * 0.46, 2.48, 1.42],
      x: [s * 0.86, 0.1, -0.48],
      y: [0, 1, 0],
      thickness: [0.032, 0.008],
      bevel: 0.004,
      smoothing: 1,
      color: EAR_INNER_PAINT,
      group: "head",
      name: `earFlap${s > 0 ? "L" : "R"}`,
    });

    // Branching low-poly vascular cooling ridges on the inner face
    const earBasePt = [s * 0.48, 2.46, 1.4];
    const earTopRidge = catmull([
      earBasePt,
      [s * 0.78, 2.68, 1.28],
      [s * 1.15, 2.74, 1.12],
    ]);
    b.sweep(earTopRidge, 0.018, {
      bone: s > 0 ? earL : earR,
      color: EAR_INNER_PAINT,
      sides: 5,
      smooth: false,
      group: "head",
      name: `earVeinUpper_${s > 0 ? "L" : "R"}`,
    });

    const earMidRidge = catmull([
      earBasePt,
      [s * 0.88, 2.44, 1.22],
      [s * 1.32, 2.38, 0.98],
    ]);
    b.sweep(earMidRidge, 0.016, {
      bone: s > 0 ? earL : earR,
      color: EAR_INNER_PAINT,
      sides: 5,
      smooth: false,
      group: "head",
      name: `earVeinMid_${s > 0 ? "L" : "R"}`,
    });

    const earLowerRidge = catmull([
      earBasePt,
      [s * 0.82, 2.18, 1.24],
      [s * 1.05, 1.82, 1.12],
    ]);
    b.sweep(earLowerRidge, 0.016, {
      bone: s > 0 ? earL : earR,
      color: EAR_INNER_PAINT,
      sides: 5,
      smooth: false,
      group: "head",
      name: `earVeinLower_${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // PILLAR LEGS & ROUND FOOT PADS (Resting squarely on y = 0)
  // ---------------------------------------------------------------------------
  // Front limbs
  for (const s of [1, -1]) {
    const foreLegBone = s > 0 ? shoulderL : shoulderR;
    const sideName = s > 0 ? "L" : "R";

    // Upper foreleg
    b.frustumBox(
      [s * 0.56, 2.28, 0.74],
      [s * 0.55, 1.54, 0.7],
      [0.46, 0.46],
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

    // Elbow joint
    b.part(
      new THREE.DodecahedronGeometry(0.23, 0),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? elbowL : elbowR,
        at: [s * 0.55, 1.54, 0.67],
        scale: [0.95, 0.9, 1.1],
        flat: true,
        group: `legF${sideName}`,
        name: `elbowKnuckle${sideName}`,
      },
    );

    // Forearm
    b.frustumBox(
      [s * 0.55, 1.54, 0.7],
      [s * 0.53, 0.84, 0.72],
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

    // Lower pillar / wrist down to foot pad top
    b.frustumBox(
      [s * 0.53, 0.84, 0.72],
      [s * 0.53, 0.28, 0.74],
      [0.38, 0.38],
      [0.45, 0.45],
      {
        bone: s > 0 ? wristL : wristR,
        color: ELEPHANT_SKIN,
        sides: 8,
        smooth: false,
        group: `legF${sideName}`,
        name: `wrist${sideName}`,
      },
    );

    // Foot pad: height 0.28, center at y = 0.14 -> bottom touches y = 0.00
    b.part(
      new THREE.CylinderGeometry(0.24, 0.26, 0.28, 9),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? footL : footR,
        at: [s * 0.53, 0.14, 0.74],
        flat: true,
        group: `legF${sideName}`,
        name: `footPadF${sideName}`,
      },
    );

    // African elephant front foot: 4 low-poly toenail plates
    const frontNailAngles = [-55, -20, 20, 55];
    frontNailAngles.forEach((deg, idx) => {
      const rad = deg * (Math.PI / 180);
      const nx = s * 0.53 + Math.sin(rad) * 0.252;
      const nz = 0.74 + Math.cos(rad) * 0.252;
      b.part(
        new THREE.BoxGeometry(0.065, 0.08, 0.035),
        NAIL_HORN,
        {
          bone: s > 0 ? footL : footR,
          at: [nx, 0.05, nz],
          dir: [Math.sin(rad), 0, Math.cos(rad)],
          flat: true,
          group: `legF${sideName}`,
          name: `frontNail_${sideName}_${idx}`,
        },
      );
    });
  }

  // Hindlimbs
  for (const s of [1, -1]) {
    const hindLegBone = s > 0 ? hipHL : hipHR;
    const sideName = s > 0 ? "L" : "R";

    // Upper thigh
    b.frustumBox(
      [s * 0.53, 2.22, -0.74],
      [s * 0.53, 1.48, -0.72],
      [0.54, 0.54],
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

    // Stifle / knee
    b.part(
      new THREE.DodecahedronGeometry(0.22, 0),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? kneeHL : kneeHR,
        at: [s * 0.53, 1.48, -0.66],
        scale: [0.95, 1.1, 0.9],
        flat: true,
        group: `legH${sideName}`,
        name: `kneeCap${sideName}`,
      },
    );

    // Shin
    b.frustumBox(
      [s * 0.53, 1.48, -0.72],
      [s * 0.51, 0.82, -0.76],
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

    // Rear lower pillar down to foot pad top
    b.frustumBox(
      [s * 0.51, 0.82, -0.76],
      [s * 0.51, 0.28, -0.76],
      [0.37, 0.37],
      [0.44, 0.44],
      {
        bone: s > 0 ? ankleHL : ankleHR,
        color: ELEPHANT_SKIN,
        sides: 8,
        smooth: false,
        group: `legH${sideName}`,
        name: `cannon${sideName}`,
      },
    );

    // Rear foot pad: height 0.28, center at y = 0.14 -> bottom touches y = 0.00
    b.part(
      new THREE.CylinderGeometry(0.23, 0.25, 0.28, 9),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? footHL : footHR,
        at: [s * 0.51, 0.14, -0.76],
        flat: true,
        group: `legH${sideName}`,
        name: `footPadH${sideName}`,
      },
    );

    // African elephant rear foot: 3 low-poly toenail plates
    const rearNailAngles = [-42, 0, 42];
    rearNailAngles.forEach((deg, idx) => {
      const rad = deg * (Math.PI / 180);
      const nx = s * 0.51 + Math.sin(rad) * 0.242;
      const nz = -0.76 + Math.cos(rad) * 0.242;
      b.part(
        new THREE.BoxGeometry(0.065, 0.08, 0.035),
        NAIL_HORN,
        {
          bone: s > 0 ? footHL : footHR,
          at: [nx, 0.05, nz],
          dir: [Math.sin(rad), 0, Math.cos(rad)],
          flat: true,
          group: `legH${sideName}`,
          name: `rearNail_${sideName}_${idx}`,
        },
      );
    });
  }

  // ---------------------------------------------------------------------------
  // TAIL & WIRE BRUSH
  // ---------------------------------------------------------------------------
  const tailPath = catmull([
    [0, 2.28, -1.24],
    [0, 1.86, -1.36],
    [0, 1.45, -1.42],
    [0, 1.08, -1.46],
  ]);

  b.sweep(tailPath, (t) => 0.046 * (1 - t * 0.6) + 0.016, {
    bone: [tail1, tail2, tail3, tail4],
    color: ELEPHANT_SKIN,
    sides: 6,
    smooth: false,
    caps: "flat",
    group: "tail",
    name: "tailShaft",
  });

  // Flat lateral fan of coarse black bristles
  const tailTipPt = [0, 1.08, -1.46];
  for (let i = -3; i <= 3; i++) {
    const angleSpread = i * 0.035;
    b.spike(
      tailTipPt,
      [angleSpread * 1.5, 0.86, -1.56 - Math.abs(i) * 0.02],
      null,
      0.014,
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
  // STAGED SAVANNA BASE & DIORAMA ELEMENTS
  // ---------------------------------------------------------------------------
  // Base slab: top sits exactly at y = 0.00, thickness 0.045m (bottom at -0.045m, well within 2% height)
  b.part(
    new THREE.CylinderGeometry(2.15, 2.28, 0.045, 12),
    SAVANNA_DIRT,
    {
      bone: hips,
      at: [0, -0.0225, 0.25],
      flat: true,
      group: "base",
      name: "savannaGround",
    },
  );

  // Outer faceted rim trim
  b.part(
    new THREE.CylinderGeometry(2.3, 2.38, 0.03, 12),
    "#24170f",
    {
      bone: hips,
      at: [0, -0.038, 0.25],
      flat: true,
      group: "base",
      name: "pedestalTrim",
    },
  );

  // 1. Red Clay Termite Mound (positioned on rear-left flank to frame rather than obstruct)
  const termitePath = catmull([
    [-1.42, 0.0, -0.3],
    [-1.44, 0.32, -0.28],
    [-1.41, 0.64, -0.3],
    [-1.38, 0.94, -0.32],
  ]);

  b.sweep(termitePath, (t) => 0.22 * (1 - t * 0.78) + 0.045, {
    bone: hips,
    color: TERMITE_RED,
    sides: 6,
    smooth: false,
    caps: { start: "flat", end: "point" },
    group: "scenery",
    name: "termiteMoundMain",
  });

  b.spike(
    [-1.28, 0.0, -0.2],
    [-1.32, 0.48, -0.22],
    null,
    0.13,
    {
      bone: hips,
      color: TERMITE_RED,
      sides: 5,
      smooth: false,
      group: "scenery",
      name: "termiteButtress",
    },
  );

  // Termite vent flutes
  b.part(
    new THREE.BoxGeometry(0.04, 0.08, 0.04),
    "#180c06",
    {
      bone: hips,
      at: [-1.38, 0.54, -0.22],
      flat: true,
      group: "scenery",
      name: "termiteVent1",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.04, 0.07, 0.04),
    "#180c06",
    {
      bone: hips,
      at: [-1.43, 0.74, -0.26],
      flat: true,
      group: "scenery",
      name: "termiteVent2",
    },
  );

  // 2. Weathered Fallen Acacia Log
  const logPath = catmull([
    [1.15, 0.05, -1.15],
    [1.38, 0.07, -1.38],
    [1.65, 0.06, -1.55],
  ]);

  b.sweep(logPath, [0.085, 0.055], {
    bone: hips,
    color: WOOD_GREY,
    sides: 6,
    smooth: false,
    caps: "flat",
    group: "scenery",
    name: "acaciaLog",
  });

  b.rod(
    [1.36, 0.07, -1.38],
    [1.44, 0.22, -1.52],
    0.038,
    WOOD_GREY,
    { bone: hips, sides: 5, smooth: false, group: "scenery", name: "acaciaFork" },
  );

  // 3. Low-Poly Savanna Boulders
  const rockPlacements: [number, number, number, number][] = [
    [-1.28, 0.06, 0.95, 0.2],
    [-1.48, 0.05, 0.65, 0.15],
    [1.48, 0.05, 0.42, 0.17],
    [1.35, 0.04, -0.65, 0.15],
    [-0.42, 0.04, 1.88, 0.13],
    [0.78, 0.04, 1.82, 0.14],
    [0.2, 0.03, -1.72, 0.11],
  ];

  rockPlacements.forEach(([rx, ry, rz, rad], idx) => {
    b.part(
      new THREE.DodecahedronGeometry(rad, 0),
      "#6e665d",
      {
        bone: hips,
        at: [rx, ry, rz],
        rotation: [rand() * 45, rand() * 90, rand() * 45],
        scale: [1.2, 0.75, 1.0],
        flat: true,
        group: "scenery",
        name: `boulder_${idx}`,
      },
    );
  });

  // 4. Sun-bleached Dry Savanna Grass Clumps
  const grassCenters: [number, number][] = [
    [-1.2, -0.15],
    [-1.55, -0.45],
    [1.25, -1.15],
    [1.52, -1.45],
    [-1.15, 0.82],
    [1.38, 0.52],
    [-0.25, 1.95],
  ];

  grassCenters.forEach(([gx, gz], clumpIdx) => {
    const bladeCount = 6;
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2 + rand() * 0.4;
      const tilt = 0.24 + rand() * 0.2;
      const height = 0.18 + rand() * 0.14;
      const tipX = gx + Math.cos(angle) * (height * tilt);
      const tipZ = gz + Math.sin(angle) * (height * tilt);

      b.spike(
        [gx + (rand() - 0.5) * 0.08, 0.0, gz + (rand() - 0.5) * 0.08],
        [tipX, height, tipZ],
        null,
        0.016,
        {
          bone: hips,
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
```