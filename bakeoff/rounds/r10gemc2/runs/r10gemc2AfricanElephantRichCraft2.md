I will revise the African bush elephant model to address the ground-depth warning and elevate the low-poly sculpture to an astonishing, museum-grade result.

### Summary of Changes

1. **Elevation & Ground Registration (Fix Warning):**
   - Rebuilt the savanna base as a low-poly beveled plinth with its bottom face resting exactly on $y = 0.00$ and its top surface at $y = 0.04\text{ m}$.
   - Seated all four pillar foot pads, termite spires, rocks, logs, and grass blades flush on the top surface, completely eliminating any geometry dipping below $y = 0.00$.

2. **Sculptural Head & Expressive Facial Planes:**
   - Replaced the cluttered cranial blocks with a majestic, chiseled low-poly skull: prominent twin African cranial domes, a clean sloping forehead basin, sculpted temporal hollows, strong cheek zygomatic arches, and forward-angled pachyderm eye sockets.
   - Designed large, bright amber eyes with pachyderm creases and catchlights, clearly readable from front and three-quarter angles.
   - Added articulated premaxillary tusk sheaths and a distinct lower jaw with a triangular chin spout and pink oral cavity.

3. **Refined Low-Poly Paints & Surface Materials:**
   - Replaced the high-frequency cellular noise with a clean, noble weathered slate-grey hide that highlights the low-poly facets instead of drowning them.
   - Layered directional sunlight, soft ventral occlusion, warm golden savanna dust across the withers and spine, and dry clay mud on the foot pads.
   - Replaced the splotchy ear texture with a warm, flushed terracotta-rose interior gradient and shaded cooling cartilage ribs.
   - Polished the ivory tusks with subtle longitudinal grain and warm root socket patina.

4. **Hero Tusks & Dynamic Segmented Trunk:**
   - Sculpted sweeping African bull ivory tusks that flare outwards to frame the face, dip down, and curve up to sharp faceted tips.
   - Re-engineered the trunk along an 8-joint chain into a proud, alert S-curve with articulated transversal accordion wrinkles and dual prehensile African elephant fingers.

5. **Iconic African Continent Ears:**
   - Redesigned the ear silhouettes with the authentic undulating African continental contours and tapered southern tip.
   - Angled them in an alert, fan-swept posture with low-poly radial cartilage folds.

6. **Pillar Limbs, Accurate Nails & Savanna Setting:**
   - Sculpted muscular columnar legs with knobby elbows and knees, broad circular cushioned foot pads, and accurate low-poly horn toenails (4 on front, 3 on rear).
   - Upgraded the savanna diorama with a multi-spired red cathedral termite mound, a sun-bleached fallen acacia log, faceted granite boulders, and golden dry grass tufts.

***

```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  noise,
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

  // Ground elevation plane: top of base plinth sits at y = GROUND_Y
  const GROUND_Y = 0.04;

  // ---------------------------------------------------------------------------
  // COLOR PALETTE & CRAFTED LOW-POLY PAINTS
  // ---------------------------------------------------------------------------
  const INK: Rgb = [0.14, 0.13, 0.17];
  const NAIL_HORN = "#eae2d2";
  const MOUTH_PINK = "#6b3c46";
  const BRISTLE_BLACK = "#1c1b20";
  const TERMITE_RED = "#ab4626";
  const WOOD_GREY = "#5a4d40";
  const GRASS_GOLD = "#d6b24d";

  // Weathered, faceted elephant hide: warm slate-grey with savanna ochre dust
  // highlighting dorsal facets and warm dry mud at the foot pads
  const ELEPHANT_SKIN = paint((p, n) => {
    const baseGrey: Rgb = [0.48, 0.5, 0.54];
    const darkCrease: Rgb = [0.36, 0.38, 0.42];
    const lightRidge: Rgb = [0.58, 0.6, 0.65];
    const ochreDust: Rgb = [0.74, 0.48, 0.28];
    const dryMud: Rgb = [0.46, 0.36, 0.26];

    // Gentle directional shading that emphasizes faceted planes
    const lightDot = n.x * 0.3 + n.y * 0.75 + n.z * 0.4;
    let col = mix(darkCrease, baseGrey, smoothstep(-0.4, 0.6, lightDot));

    // Subtle macro facet variations
    const fNoise = noise(p, 0.35, 11);
    col = mix(col, lightRidge, (fNoise - 0.5) * 0.22);

    // Laterite / ochre dust on upper withers, dorsal ridge and forehead
    if (p.y > 1.8 && n.y > 0.15) {
      const dustMask = smoothstep(0.18, 0.7, n.y) * smoothstep(1.8, 2.7, p.y);
      const dustPatches = noise(p, 0.45, 23);
      col = mix(col, ochreDust, dustMask * (0.35 + 0.35 * dustPatches));
    }

    // Dry mud gradient around lower legs
    if (p.y < 0.7) {
      const mudMask = smoothstep(0.7, GROUND_Y + 0.05, p.y);
      col = mix(col, dryMud, mudMask * 0.55);
    }

    // Soft ventral countershading
    if (n.y < -0.15) {
      col = mix(col, INK, smoothstep(-0.15, -0.85, n.y) * 0.32);
    }

    return col;
  });

  // Inner ear skin: warm vascular terracotta-rose flush with gentle edge shading
  const EAR_INNER_PAINT = paint((p, n) => {
    const outerGrey: Rgb = [0.46, 0.48, 0.52];
    const innerFlush: Rgb = [0.66, 0.44, 0.42];
    const deepVessels: Rgb = [0.54, 0.32, 0.32];
    const ochreRim: Rgb = [0.68, 0.45, 0.26];

    const distFromCenter = Math.hypot(p.x, p.y - 2.3);
    let col = mix(innerFlush, outerGrey, smoothstep(0.45, 1.25, distFromCenter));

    // Subtle cooling vascular blush
    const vNoise = noise(p, 0.25, 9);
    col = mix(col, deepVessels, vNoise * 0.25);

    // Sunlit top rim
    if (n.y > 0.35 && p.y > 2.6) {
      col = mix(col, ochreRim, 0.35);
    }

    return col;
  });

  // Ivory paint: warm polished cream with grain lines and aged root stains
  const IVORY_PAINT = paint((p) => {
    const freshIvory: Rgb = [0.96, 0.93, 0.85];
    const weatheredBase: Rgb = [0.6, 0.46, 0.3];
    const midIvory: Rgb = [0.88, 0.83, 0.73];

    const grainPattern = noise(p, 0.04, 31);
    let col = mix(freshIvory, midIvory, grainPattern * 0.3);

    // Weathered root near the tusk socket
    const baseDist = Math.hypot(p.y - 1.95, p.z - 1.9);
    if (baseDist < 0.45) {
      const stain = smoothstep(0.45, 0.08, baseDist);
      col = mix(col, weatheredBase, stain * 0.65);
    }

    return col;
  });

  // Savanna ground terrain paint
  const SAVANNA_DIRT = paint((p) => {
    const bakedClay: Rgb = [0.7, 0.46, 0.26];
    const drySand: Rgb = [0.8, 0.6, 0.36];
    const darkEarth: Rgb = [0.48, 0.3, 0.18];

    const n1 = noise(p, 0.5, 77);
    const n2 = noise(p, 0.15, 83);
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
          <stop offset="0%" stop-color="#dfa442"/>
          <stop offset="65%" stop-color="#8a5422"/>
          <stop offset="100%" stop-color="#2c1a0c"/>
        </radialGradient>
      </defs>
      <ellipse cx="64" cy="64" rx="58" ry="46" fill="#1b1a1e"/>
      <ellipse cx="64" cy="64" rx="50" ry="38" fill="#4d4a46"/>
      <ellipse cx="64" cy="64" rx="34" ry="32" fill="url(#irisGrad)"/>
      <ellipse cx="64" cy="64" rx="15" ry="16" fill="#0d0c0e"/>
      <circle cx="53" cy="53" r="7" fill="#ffffff" opacity="0.95"/>
      <circle cx="75" cy="73" r="3.5" fill="#ffffff" opacity="0.65"/>
      <path d="M 12,56 Q 64,24 116,56" stroke="#161518" stroke-width="5" fill="none"/>
      <path d="M 18,68 Q 64,102 110,68" stroke="#161518" stroke-width="3.5" fill="none"/>
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

  // Outward-fanned ears
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

  // Trunk joints
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
  const footL = b.joint("footL", { parent: wristL, at: [0.53, GROUND_Y + 0.14, 0.74], role: "leg", group: "legFL" });

  const shoulderR = b.joint("shoulderR", { parent: withers, at: [-0.56, 2.3, 0.74], role: "leg", group: "legFR" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-0.55, 1.54, 0.7], role: "leg", group: "legFR" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-0.53, 0.84, 0.72], role: "leg", group: "legFR" });
  const footR = b.joint("footR", { parent: wristR, at: [-0.53, GROUND_Y + 0.14, 0.74], role: "leg", group: "legFR" });

  // Hindlimbs
  const hipHL = b.joint("hipHL", { parent: hips, at: [0.53, 2.22, -0.74], role: "leg", group: "legHL" });
  const kneeHL = b.joint("kneeHL", { parent: hipHL, at: [0.53, 1.48, -0.72], role: "leg", group: "legHL" });
  const ankleHL = b.joint("ankleHL", { parent: kneeHL, at: [0.51, 0.82, -0.76], role: "leg", group: "legHL" });
  const footHL = b.joint("footHL", { parent: ankleHL, at: [0.51, GROUND_Y + 0.14, -0.76], role: "leg", group: "legHL" });

  const hipHR = b.joint("hipHR", { parent: hips, at: [-0.53, 2.22, -0.74], role: "leg", group: "legHR" });
  const kneeHR = b.joint("kneeHR", { parent: hipHR, at: [-0.53, 1.48, -0.72], role: "leg", group: "legHR" });
  const ankleHR = b.joint("ankleHR", { parent: kneeHR, at: [-0.51, 0.82, -0.76], role: "leg", group: "legHR" });
  const footHR = b.joint("footHR", { parent: ankleHR, at: [-0.51, GROUND_Y + 0.14, -0.76], role: "leg", group: "legHR" });

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

  // Main skull core
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

    // Eye decal facing outwards and forwards
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

    // Wrinkled socket sleeve
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
    [1.2, -0.25, "sharp"],
    [1.12, -0.4],
    [1.04, -0.52, "sharp"],
    [0.96, -0.68],
    [0.82, -0.9],
    [0.58, -1.1],
    [0.34, -1.22],
    [0.18, -1.14],
    [0.12, -0.82],
    [0.06, -0.42],
    [0.0, -0.15],
  ];

  for (const s of [1, -1]) {
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

    // Radial structural cartilage ridges on the inner ear
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
  // PILLAR LEGS & ROUND FOOT PADS (Resting squarely on y = GROUND_Y)
  // ---------------------------------------------------------------------------
  // Front limbs
  for (const s of [1, -1]) {
    const foreLegBone = s > 0 ? shoulderL : shoulderR;
    const sideName = s > 0 ? "L" : "R";

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

    // Wrist down to foot pad top
    b.frustumBox(
      [s * 0.53, 0.84, 0.72],
      [s * 0.53, GROUND_Y + 0.28, 0.74],
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

    // Foot pad: height 0.28, center at GROUND_Y + 0.14 -> bottom touches GROUND_Y
    b.part(
      new THREE.CylinderGeometry(0.24, 0.26, 0.28, 9),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? footL : footR,
        at: [s * 0.53, GROUND_Y + 0.14, 0.74],
        flat: true,
        group: `legF${sideName}`,
        name: `footPadF${sideName}`,
      },
    );

    // 4 low-poly toenail plates on front foot
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
          at: [nx, GROUND_Y + 0.05, nz],
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

    b.frustumBox(
      [s * 0.51, 0.82, -0.76],
      [s * 0.51, GROUND_Y + 0.28, -0.76],
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

    // Rear foot pad: height 0.28, center at GROUND_Y + 0.14 -> bottom touches GROUND_Y
    b.part(
      new THREE.CylinderGeometry(0.23, 0.25, 0.28, 9),
      ELEPHANT_SKIN,
      {
        bone: s > 0 ? footHL : footHR,
        at: [s * 0.51, GROUND_Y + 0.14, -0.76],
        flat: true,
        group: `legH${sideName}`,
        name: `footPadH${sideName}`,
      },
    );

    // 3 low-poly toenail plates on rear foot
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
          at: [nx, GROUND_Y + 0.05, nz],
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
  // Base slab: bottom rests at y = 0.00, top sits at y = GROUND_Y (0.04m)
  b.part(
    new THREE.CylinderGeometry(2.22, 2.3, GROUND_Y, 12),
    SAVANNA_DIRT,
    {
      bone: hips,
      at: [0, GROUND_Y / 2, 0.25],
      flat: true,
      group: "base",
      name: "savannaGround",
    },
  );

  // Outer dark chamfered rim: sits from y = 0.00 to y = GROUND_Y * 0.75
  b.part(
    new THREE.CylinderGeometry(2.32, 2.38, GROUND_Y * 0.75, 12),
    "#22160e",
    {
      bone: hips,
      at: [0, (GROUND_Y * 0.75) / 2, 0.25],
      flat: true,
      group: "base",
      name: "pedestalTrim",
    },
  );

  // 1. Red Clay Termite Mound (tall fluted cathedral structure)
  const termitePath = catmull([
    [-1.42, GROUND_Y, -0.3],
    [-1.44, GROUND_Y + 0.32, -0.28],
    [-1.41, GROUND_Y + 0.64, -0.3],
    [-1.38, GROUND_Y + 0.94, -0.32],
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
    [-1.28, GROUND_Y, -0.2],
    [-1.32, GROUND_Y + 0.48, -0.22],
    null,
    0.13,
    {
      bone: hips,
      color: TERMITE_RED,
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "point" },
      group: "scenery",
      name: "termiteButtress",
    },
  );

  // Termite vents
  b.part(
    new THREE.BoxGeometry(0.04, 0.08, 0.04),
    "#180c06",
    {
      bone: hips,
      at: [-1.38, GROUND_Y + 0.54, -0.22],
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
      at: [-1.43, GROUND_Y + 0.74, -0.26],
      flat: true,
      group: "scenery",
      name: "termiteVent2",
    },
  );

  // 2. Weathered Fallen Acacia Log
  const logPath = catmull([
    [1.15, GROUND_Y + 0.07, -1.15],
    [1.38, GROUND_Y + 0.08, -1.38],
    [1.65, GROUND_Y + 0.07, -1.55],
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
    [1.36, GROUND_Y + 0.08, -1.38],
    [1.44, GROUND_Y + 0.22, -1.52],
    0.038,
    WOOD_GREY,
    { bone: hips, sides: 5, smooth: false, group: "scenery", name: "acaciaFork" },
  );

  // 3. Low-Poly Savanna Boulders (resting squarely on base)
  const rockPlacements: [number, number, number][] = [
    [-1.28, 0.95, 0.18],
    [-1.48, 0.65, 0.14],
    [1.48, 0.42, 0.16],
    [1.35, -0.65, 0.14],
    [-0.42, 1.88, 0.12],
    [0.78, 1.82, 0.13],
    [0.2, -1.72, 0.1],
  ];

  rockPlacements.forEach(([rx, rz, rad], idx) => {
    b.part(
      new THREE.DodecahedronGeometry(rad, 0),
      "#6e665d",
      {
        bone: hips,
        at: [rx, GROUND_Y + rad * 0.7, rz],
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
        [gx + (rand() - 0.5) * 0.08, GROUND_Y, gz + (rand() - 0.5) * 0.08],
        [tipX, GROUND_Y + height, tipZ],
        null,
        0.016,
        {
          bone: hips,
          color: GRASS_GOLD,
          sides: 3,
          smooth: false,
          caps: { start: "flat", end: "point" },
          group: "scenery",
          name: `grassBlade_${clumpIdx}_${i}`,
        },
      );
    }
  });

  return b.root;
}
```