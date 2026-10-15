Here is the design review and list of improvements:

1. **Expressive Warcraft Face & Silhouette**: Replaced the blunt square head with a sculpted, ancient face—sloping weathered brow shelves, deeply hooded eye sockets, glowing druidic wisp eyes, a carved burl nose, and totemic cheek plates.
2. **Grand Cascading Root Beard**: Expanded the chin and jaw with a lush, flowing beard of layered, twisted root sweeps that drape majestically down the chest, interwoven with hanging moss tendrils and leafy twigs.
3. **Living Heartwood Hollow**: Transformed the chest into a deep, recessed heartwood cavern cradling a vibrant cluster of glowing druidic spirit crystals, framed by organic gnarled root ribs rather than horizontal bars.
4. **Sprawling Canopy & Antler Boughs**: Swept the antler branches wider and added organic multi-tier forks with dense, layered leaf cards, creating the iconic massive Ancient of Lore / Ancient of War silhouette.
5. **Grounded Hanging Spirit Lantern**: Positioned the lantern firmly beneath an ornate gnarled crane branch with an iron mounting hook and securely interlinked chain links, eliminating loose and floating parts.
6. **Mighty Arms & Root Claws**: Replaced the stubby digits with formidable, multi-segmented wooden root fingers and claw tips featuring knuckle burls and moss pads.
7. **Flared Buttress Roots**: Replaced the small foot spikes with massive, sprawling buttress roots that flow seamlessly down to the ground, firmly anchoring the Treant into the earth.
8. **Enriched Sacred Grove Setting**: Upgraded the base with an ornate stone-rimmed Moonwell pool, floating water lilies, a framing druidic monolith, stepping flagstones, and clusters of glowing spirit mushrooms.

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "Mighty ancient tree guardian in the Blizzard/Warcraft style, with an expressive carved face, flowing root beard, glowing druidic heartwood hollow, branching antler canopy, and hanging spirit lantern in a sacred moonwell grove.",
};

export default function build() {
  const b = createBuilder({ name: "ancient_treant", paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // 1. Textures & Stylized SVGs
  // ---------------------------------------------------------------------------

  // Hand-painted Warcraft oak/ancient leaf cluster card
  const LEAF_SVG = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 124 Q62 70 64 8" stroke="#120a04" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M64 82 Q42 70 24 68" stroke="#120a04" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M64 56 Q86 46 104 44" stroke="#120a04" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <!-- Leaf 1 (Left lower) -->
    <path d="M60 84 Q28 92 10 68 Q24 44 58 72 Z" fill="#0f2f0a" stroke="#081c05" stroke-width="4"/>
    <path d="M56 82 Q30 88 14 68 Q26 48 54 72 Z" fill="#2d7515"/>
    <path d="M50 80 Q32 82 20 70" stroke="#71db2a" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 2 (Right middle) -->
    <path d="M66 58 Q102 68 118 46 Q104 22 66 48 Z" fill="#0f2f0a" stroke="#081c05" stroke-width="4"/>
    <path d="M68 56 Q100 64 114 46 Q102 26 68 50 Z" fill="#388c1c"/>
    <path d="M72 54 Q94 56 108 46" stroke="#82ed34" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 3 (Left upper) -->
    <path d="M62 42 Q30 46 18 24 Q36 6 62 32 Z" fill="#0f2f0a" stroke="#081c05" stroke-width="4"/>
    <path d="M60 40 Q32 44 22 24 Q38 10 60 32 Z" fill="#44a81f"/>
    <path d="M56 38 Q38 38 26 24" stroke="#95f840" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 4 (Top terminal) -->
    <path d="M64 32 Q44 16 64 4 Q84 16 64 32 Z" fill="#0f2f0a" stroke="#081c05" stroke-width="4"/>
    <path d="M64 30 Q46 16 64 6 Q82 16 64 30 Z" fill="#58cc2a"/>
    <path d="M64 28 L64 8" stroke="#b4ff52" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;
  const LEAF_TEX = svg(LEAF_SVG, { size: 256 });

  // Hanging Spanish moss / wild vine tendril
  const VINE_SVG = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 0 Q18 32 36 64 Q50 96 26 128" stroke="#0f260a" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <path d="M32 0 Q18 32 36 64 Q50 96 26 128" stroke="#265c17" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M26 36 Q10 46 16 64" stroke="#265c17" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M36 76 Q50 88 44 104" stroke="#265c17" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="64" r="5" fill="#4fa82a"/>
    <circle cx="44" cy="104" r="5" fill="#4fa82a"/>
    <circle cx="26" cy="126" r="5.5" fill="#78e640"/>
    <circle cx="28" cy="42" r="4.5" fill="#3f911c"/>
    <circle cx="40" cy="88" r="5" fill="#3f911c"/>
  </svg>`;
  const VINE_TEX = svg(VINE_SVG, { size: 256 });

  // Druidic sacred glowing rune disc
  const RUNE_SVG = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="60" fill="#091711" stroke="#122f21" stroke-width="5"/>
    <path d="M64 14 A50 50 0 1 1 24 96 A42 42 0 1 0 54 24 A48 48 0 0 1 64 14 Z" fill="#117551"/>
    <path d="M64 18 A46 46 0 1 1 28 92 A38 38 0 1 0 56 28 A44 44 0 0 1 64 18 Z" fill="#24c48f"/>
    <path d="M64 64 A12 12 0 0 1 76 52 A20 20 0 0 1 84 72 A28 28 0 0 1 56 92 A36 36 0 0 1 28 64" fill="none" stroke="#6ef7c4" stroke-width="6.5" stroke-linecap="round"/>
    <circle cx="64" cy="64" r="8.5" fill="#e8fff6"/>
    <circle cx="36" cy="44" r="4.5" fill="#24c48f"/>
    <circle cx="92" cy="78" r="4.5" fill="#24c48f"/>
  </svg>`;
  const RUNE_TEX = svg(RUNE_SVG, { size: 256 });

  // Glowing Druid Spirit Eye
  const EYE_SVG = `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="46" fill="#04100b"/>
    <circle cx="48" cy="48" r="38" fill="#083823"/>
    <circle cx="48" cy="48" r="28" fill="#0f8f5b"/>
    <circle cx="48" cy="48" r="18" fill="#35e691"/>
    <circle cx="48" cy="48" r="8" fill="#f0fff8"/>
    <path d="M48 6 L48 90 M6 48 L90 48" stroke="#87ffca" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;
  const EYE_TEX = svg(EYE_SVG, { size: 128 });

  // Lantern lattice glass window
  const LANTERN_GLASS_SVG = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" fill="#ffb833"/>
    <rect x="8" y="8" width="112" height="112" fill="#ffe285"/>
    <circle cx="64" cy="64" r="38" fill="#fff9db"/>
    <path d="M64 8 L64 120 M8 64 L120 64 M24 24 L104 104 M24 104 L104 24" stroke="#24150a" stroke-width="6"/>
    <rect x="4" y="4" width="120" height="120" fill="none" stroke="#24150a" stroke-width="8"/>
  </svg>`;
  const LANTERN_GLASS_TEX = svg(LANTERN_GLASS_SVG, { size: 128 });

  // ---------------------------------------------------------------------------
  // 2. Custom Hand-Painted Shaders (Paints)
  // ---------------------------------------------------------------------------

  const BARK_DEEP = "#1a0e05";
  const BARK_MID = "#422612";
  const BARK_LIGHT = "#744724";
  const MOSS_DEEP = "#14330e";
  const MOSS_MID = "#2e6616";
  const MOSS_LIGHT = "#6aa628";

  // Warcraft Treant Bark: sculptural vertical grain + rich amber facets + lush moss on top surfaces
  const barkPaint = paint((p, n) => {
    const grainCoord = new THREE.Vector3(p.x * 4.5, p.y * 11.0, p.z * 4.5);
    const g = noise(grainCoord, 0.32, 17);
    const roughCoord = new THREE.Vector3(p.x * 7.0, p.y * 2.8, p.z * 7.0);
    const r = noise(roughCoord, 0.18, 59);

    let c = mix(BARK_DEEP, BARK_MID, smoothstep(0.18, 0.72, g));
    c = mix(c, BARK_LIGHT, smoothstep(0.48, 0.86, r) * 0.65);

    // Warm top-down sunlit lighting
    const sun = smoothstep(-0.35, 0.85, n.y);
    c = [c[0] * (0.65 + 0.45 * sun), c[1] * (0.65 + 0.45 * sun), c[2] * (0.6 + 0.4 * sun)];

    // Vibrant moss growth on upward facing burls, shoulders and limbs
    const mNoise = noise(new THREE.Vector3(p.x * 3.5, p.y * 3.5, p.z * 3.5), 0.2, 103);
    const mossCoverage = smoothstep(0.25, 0.75, n.y + (mNoise - 0.5) * 0.7);
    if (mossCoverage > 0.02) {
      const mossColor = mix(MOSS_DEEP, mix(MOSS_MID, MOSS_LIGHT, mNoise), smoothstep(0.3, 0.85, n.y));
      c = mix(c, mossColor, mossCoverage * 0.94);
    }
    return c;
  });

  // Ancient weathered Granite stone
  const STONE_DARK = "#292c30";
  const STONE_MID = "#444950";
  const STONE_LIGHT = "#68707a";
  const stonePaint = paint((p, n) => {
    const sNoise = noise(new THREE.Vector3(p.x * 4.0, p.y * 4.0, p.z * 4.0), 0.25, 231);
    let c = mix(STONE_DARK, STONE_MID, sNoise);
    c = mix(c, STONE_LIGHT, smoothstep(0.55, 0.85, sNoise) * 0.45);
    if (n.y > 0.25) {
      c = mix(c, MOSS_MID, smoothstep(0.25, 0.8, n.y) * 0.75);
    }
    return c;
  });

  // Forest Grove Turf Base
  const SOIL_DARK = "#150e08";
  const SOIL_MID = "#281b10";
  const TURF_GREEN = "#1e400f";
  const TURF_LIGHT = "#417319";
  const groundPaint = paint((p, n) => {
    const gNoise = noise(new THREE.Vector3(p.x * 2.2, 0, p.z * 2.2), 0.45, 88);
    const patchNoise = noise(new THREE.Vector3(p.x * 5.0, 0, p.z * 5.0), 0.16, 142);
    let c = mix(SOIL_DARK, SOIL_MID, gNoise);
    const grassFactor = smoothstep(0.35, 0.65, patchNoise + 0.2 * n.y);
    c = mix(c, mix(TURF_GREEN, TURF_LIGHT, gNoise), grassFactor);
    return c;
  });

  // Flat accent colours
  const DARK_WOOD = "#120904";
  const HEARTWOOD = "#865024";
  const SHROOM_ORANGE = "#ab4617";
  const SHROOM_CREAM = "#f2e2cb";
  const GLOW_GREEN = "#26f29e";
  const GLOW_EMERALD = "#12d48a";
  const GLOW_GOLD = "#ffb82e";
  const MOONWELL_WATER = "#16deb0";

  // ---------------------------------------------------------------------------
  // 3. Skeleton Hierarchy (Rest Pose for Warcraft Treant)
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 1.45, -0.05], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.82, -0.06], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 2.22, -0.04], role: "spine" });
  const chest = b.joint("chest", { parent: spine2, at: [0, 2.62, 0.02], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 2.95, 0.10], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.20, 0.16], role: "head" });
  // Jaw joint hinged to swing open
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.90, 0.25], aim: [0, 2.65, 0.52], role: "jaw" });

  // Antler crown roots on head
  const antlerL1 = b.joint("antlerL1", { parent: head, at: [0.32, 3.46, 0.10], dir: [0.6, 0.7, -0.1], role: "fan" });
  const antlerL2 = b.joint("antlerL2", { parent: antlerL1, at: [0.65, 3.86, 0.05], dir: [0.5, 0.6, 0.2], role: "fan" });
  const antlerR1 = b.joint("antlerR1", { parent: head, at: [-0.32, 3.46, 0.10], dir: [-0.6, 0.7, -0.1], role: "fan" });
  const antlerR2 = b.joint("antlerR2", { parent: antlerR1, at: [-0.65, 3.86, 0.05], dir: [-0.5, 0.6, 0.2], role: "fan" });

  // Left Arm (+X)
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.92, 2.65, 0.02], role: "arm" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [1.42, 2.02, -0.05], role: "arm" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [1.68, 1.25, 0.14], role: "arm" });

  // Left Fingers
  const thumbL1 = b.joint("thumbL1", { parent: wristL, at: [1.54, 1.15, 0.28], role: "digit" });
  const thumbL2 = b.joint("thumbL2", { parent: thumbL1, at: [1.46, 0.95, 0.38], role: "digit" });
  const indexL1 = b.joint("indexL1", { parent: wristL, at: [1.70, 1.10, 0.30], role: "digit" });
  const indexL2 = b.joint("indexL2", { parent: indexL1, at: [1.74, 0.88, 0.38], role: "digit" });
  const midL1 = b.joint("midL1", { parent: wristL, at: [1.80, 1.08, 0.16], role: "digit" });
  const midL2 = b.joint("midL2", { parent: midL1, at: [1.86, 0.84, 0.20], role: "digit" });
  const ringL1 = b.joint("ringL1", { parent: wristL, at: [1.78, 1.10, -0.04], role: "digit" });
  const ringL2 = b.joint("ringL2", { parent: ringL1, at: [1.82, 0.88, -0.08], role: "digit" });

  // Right Arm (-X)
  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.92, 2.65, 0.02], role: "arm" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-1.42, 2.02, -0.05], role: "arm" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-1.68, 1.25, 0.14], role: "arm" });

  // Right Fingers
  const thumbR1 = b.joint("thumbR1", { parent: wristR, at: [-1.54, 1.15, 0.28], role: "digit" });
  const thumbR2 = b.joint("thumbR2", { parent: thumbR1, at: [-1.46, 0.95, 0.38], role: "digit" });
  const indexR1 = b.joint("indexR1", { parent: wristR, at: [-1.70, 1.10, 0.30], role: "digit" });
  const indexR2 = b.joint("indexR2", { parent: indexR1, at: [-1.74, 0.88, 0.38], role: "digit" });
  const midR1 = b.joint("midR1", { parent: wristR, at: [-1.80, 1.08, 0.16], role: "digit" });
  const midR2 = b.joint("midR2", { parent: midR1, at: [-1.86, 0.84, 0.20], role: "digit" });
  const ringR1 = b.joint("ringR1", { parent: wristR, at: [-1.78, 1.10, -0.04], role: "digit" });
  const ringR2 = b.joint("ringR2", { parent: ringR1, at: [-1.82, 0.88, -0.08], role: "digit" });

  // Legs: Massive root boles splitting at ground into sprawling buttress roots
  const hipL = b.joint("hipL", { parent: hips, at: [0.55, 1.40, -0.04], role: "leg" });
  const kneeL = b.joint("kneeL", { parent: hipL, at: [0.65, 0.82, -0.07], role: "leg" });
  const ankleL = b.joint("ankleL", { parent: kneeL, at: [0.72, 0.34, 0.04], role: "leg" });

  const hipR = b.joint("hipR", { parent: hips, at: [-0.55, 1.40, -0.04], role: "leg" });
  const kneeR = b.joint("kneeR", { parent: hipR, at: [-0.65, 0.82, -0.07], role: "leg" });
  const ankleR = b.joint("ankleR", { parent: kneeR, at: [-0.72, 0.34, 0.04], role: "leg" });

  // ---------------------------------------------------------------------------
  // 4. Trunk Torso & Open Druidic Heartwood Sanctuary
  // ---------------------------------------------------------------------------

  // Torso Loft with front setback between y=2.0 and y=2.7 so the hollow is proud & visible
  b.loft(
    [
      { at: [0, 1.45, -0.06], w: 1.28, h: 1.08 },
      { at: [0, 1.82, -0.08], w: 1.16, h: 0.98 },
      { at: [0, 2.22, -0.10], w: 1.38, h: 0.92 },
      { at: [0, 2.65, -0.05], w: 1.60, h: 1.02 },
      { at: [0, 2.95, 0.08], w: 1.04, h: 0.88 },
    ],
    {
      bone: [hips, spine1, spine2, chest, neck],
      color: barkPaint,
      name: "trunk_torso",
    },
  );

  // Deep dark chest cavern cavity (Heartwood Sanctuary)
  b.part(
    new THREE.CylinderGeometry(0.40, 0.34, 0.72, 12, 1, false, 0, Math.PI),
    DARK_WOOD,
    { bone: chest, at: [0, 2.34, 0.28], rotation: [0, 90, 0], name: "heart_cavern" },
  );

  // The Living Heartwood: Radiant cluster of sacred druidic spirit crystals
  const coreCrystal = b.part(
    new THREE.DodecahedronGeometry(0.18, 0),
    GLOW_GREEN,
    { bone: chest, at: [0, 2.34, 0.36], name: "spirit_core" },
  );
  glow(coreCrystal, 3.0);

  const satCrystal1 = b.part(
    new THREE.OctahedronGeometry(0.11, 0),
    GLOW_GREEN,
    { bone: chest, at: [0.14, 2.46, 0.40], rotation: [20, 30, 0], name: "spirit_sat1" },
  );
  glow(satCrystal1, 2.6);

  const satCrystal2 = b.part(
    new THREE.OctahedronGeometry(0.10, 0),
    GLOW_GREEN,
    { bone: chest, at: [-0.13, 2.22, 0.39], rotation: [-15, 45, 10], name: "spirit_sat2" },
  );
  glow(satCrystal2, 2.6);

  const satCrystal3 = b.part(
    new THREE.OctahedronGeometry(0.09, 0),
    GLOW_EMERALD,
    { bone: chest, at: [0.0, 2.14, 0.42], rotation: [45, 0, 25], name: "spirit_sat3" },
  );
  glow(satCrystal3, 2.4);

  // Arched wooden rib-roots clasping and protecting the heartwood opening
  for (const s of [1, -1]) {
    for (let r = 0; r < 4; r++) {
      const y0 = 2.08 + r * 0.17;
      const ribCurve = bezier(
        [s * 0.58, y0, 0.32],
        [s * 0.46, y0 + 0.06, 0.54],
        [s * 0.22, y0 - 0.03, 0.49],
      );
      b.sweep(ribCurve, [0.072, 0.042], {
        bone: chest,
        color: barkPaint,
        caps: "round",
        name: `chest_rib_${s}_${r}`,
      });
    }
  }

  // Large ancient druidic rune medallion right above chest hollow
  b.part(
    new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
    stonePaint,
    { bone: chest, at: [0, 2.76, 0.48], rotation: [74, 0, 0], name: "chest_rune_backing" },
  );
  const runePlate = b.part(
    new THREE.CircleGeometry(0.22, 16),
    "#ffffff",
    {
      bone: chest,
      at: [0, 2.765, 0.51],
      rotation: [74, 0, 0],
      texture: RUNE_TEX,
      name: "chest_rune_glow",
    },
  );
  glow(runePlate, 2.2);

  // Shelf bracket fungi growing on the flank
  for (let m = 0; m < 5; m++) {
    const y = 1.82 + m * 0.16;
    const rad = 0.22 - m * 0.025;
    b.part(
      new THREE.CylinderGeometry(rad, rad * 0.85, 0.034, 8, 1, false, 0, Math.PI),
      SHROOM_ORANGE,
      {
        bone: spine2,
        at: [-0.66, y, 0.14 + m * 0.04],
        rotation: [15, -45, 10],
        name: `shelf_shroom_${m}`,
      },
    );
    b.part(
      new THREE.TorusGeometry(rad, 0.015, 6, 8, Math.PI),
      SHROOM_CREAM,
      {
        bone: spine2,
        at: [-0.66, y + 0.008, 0.14 + m * 0.04],
        rotation: [15, -45, 10],
        name: `shelf_shroom_rim_${m}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Head, Sculpted Ancient Face & Flowing Root Beard
  // ---------------------------------------------------------------------------

  // Cranium trunk block
  b.frustumBox(
    [0, 3.00, 0.12],
    [0, 3.48, 0.20],
    [0.96, 0.78],
    [0.76, 0.62],
    { bone: head, color: barkPaint, name: "head_block" },
  );

  // Heavy, wise, ancient brow shelf sloping down at temples
  b.frustumBox(
    [0, 3.30, 0.26],
    [0, 3.44, 0.56],
    [1.02, 0.38],
    [0.90, 0.28],
    { bone: head, color: barkPaint, name: "brow_shelf" },
  );

  // Deep carved eye sockets with glowing wisp eyes
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.15, 8, 8),
      DARK_WOOD,
      {
        bone: head,
        at: [s * 0.25, 3.20, 0.44],
        scale: [1.1, 0.8, 0.6],
        name: `eye_socket_${s}`,
      },
    );

    const eyeOrb = b.part(
      new THREE.SphereGeometry(0.09, 10, 8),
      GLOW_EMERALD,
      { bone: head, at: [s * 0.25, 3.20, 0.47], name: `eye_orb_${s}` },
    );
    glow(eyeOrb, 3.0);

    b.part(
      new THREE.PlaneGeometry(0.17, 0.17),
      "#ffffff",
      {
        bone: head,
        at: [s * 0.25, 3.20, 0.52],
        texture: EYE_TEX,
        name: `eye_lens_${s}`,
      },
    );

    // Carved wooden cheek burls
    b.part(
      new THREE.SphereGeometry(0.16, 8, 8),
      barkPaint,
      {
        bone: head,
        at: [s * 0.40, 3.04, 0.42],
        scale: [1.0, 0.85, 1.15],
        name: `cheek_burl_${s}`,
      },
    );
  }

  // Knotted wooden nose bridge & bulb
  const noseCurve = bezier([0, 3.30, 0.56], [0, 3.08, 0.68], [0, 2.90, 0.58]);
  b.sweep(noseCurve, [0.10, 0.07], {
    bone: head,
    color: barkPaint,
    caps: "round",
    name: "nose_ridge",
  });
  b.part(
    new THREE.SphereGeometry(0.11, 8, 8),
    barkPaint,
    { bone: head, at: [0, 2.92, 0.60], scale: [1.2, 0.9, 1.0], name: "nose_bulb" },
  );

  // Distinct Articulated Jaw Block
  b.frustumBox(
    [0, 2.90, 0.28],
    [0, 2.66, 0.48],
    [0.68, 0.46],
    [0.52, 0.36],
    { bone: jaw, color: barkPaint, name: "jaw_base" },
  );

  // Mouth cavity hollow
  b.part(
    new THREE.BoxGeometry(0.40, 0.14, 0.28),
    DARK_WOOD,
    { bone: jaw, at: [0, 2.86, 0.38], name: "mouth_cavity" },
  );

  const mouthGlow = b.part(
    new THREE.SphereGeometry(0.11, 6, 4),
    GLOW_EMERALD,
    { bone: jaw, at: [0, 2.86, 0.36], scale: [1.8, 0.4, 1.0], name: "mouth_glow" },
  );
  glow(mouthGlow, 2.2);

  // Magnificent Grand Root Beard cascading over upper chest
  const beardTendrilConfigs = [
    [0.0, 2.66, 0.52, 0.92, 0.065],
    [0.12, 2.68, 0.50, 0.84, 0.058],
    [-0.12, 2.68, 0.50, 0.84, 0.058],
    [0.22, 2.70, 0.46, 0.72, 0.052],
    [-0.22, 2.70, 0.46, 0.72, 0.052],
    [0.32, 2.74, 0.40, 0.58, 0.046],
    [-0.32, 2.74, 0.40, 0.58, 0.046],
    [0.06, 2.62, 0.50, 0.88, 0.055],
    [-0.06, 2.62, 0.50, 0.88, 0.055],
  ];
  for (let i = 0; i < beardTendrilConfigs.length; i++) {
    const [bx, by, bz, len, r] = beardTendrilConfigs[i];
    const tendril = bezier(
      [bx, by, bz],
      [bx * 1.15 + (i % 2 === 0 ? 0.05 : -0.05), by - len * 0.5, bz + 0.07],
      [bx * 0.85, by - len, bz + 0.03],
    );
    b.sweep(tendril, [r, 0.012], {
      bone: jaw,
      color: barkPaint,
      caps: { start: "round", end: "point" },
      name: `beard_root_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Branching Antler Crown, Canopy Foliage & Back Boughs
  // ---------------------------------------------------------------------------

  // Sprawling Left Great Antler Bough
  const antlerPathL = catmull([
    [0.28, 3.42, 0.16],
    [0.52, 3.76, 0.10],
    [0.82, 4.08, 0.02],
    [1.08, 4.38, -0.08],
  ]);
  b.sweep(antlerPathL, [0.15, 0.05], { bone: antlerL1, color: barkPaint, caps: "point", name: "antler_main_L" });

  const forkL1 = bezier([0.52, 3.76, 0.10], [0.72, 4.02, 0.28], [0.82, 4.24, 0.36]);
  b.sweep(forkL1, [0.08, 0.025], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL1" });

  const forkL2 = bezier([0.70, 3.92, 0.05], [0.98, 4.08, 0.14], [1.22, 4.20, 0.10]);
  b.sweep(forkL2, [0.07, 0.022], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL2" });

  const forkL3 = bezier([0.82, 4.08, 0.02], [0.96, 4.28, -0.18], [1.05, 4.50, -0.28]);
  b.sweep(forkL3, [0.065, 0.02], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL3" });

  // Sprawling Right Great Antler Bough
  const antlerPathR = catmull([
    [-0.28, 3.42, 0.16],
    [-0.52, 3.76, 0.10],
    [-0.82, 4.08, 0.02],
    [-1.08, 4.38, -0.08],
  ]);
  b.sweep(antlerPathR, [0.15, 0.05], { bone: antlerR1, color: barkPaint, caps: "point", name: "antler_main_R" });

  const forkR1 = bezier([-0.52, 3.76, 0.10], [-0.72, 4.02, 0.28], [-0.82, 4.24, 0.36]);
  b.sweep(forkR1, [0.08, 0.025], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR1" });

  const forkR2 = bezier([-0.70, 3.92, 0.05], [-0.98, 4.08, 0.14], [-1.22, 4.20, 0.10]);
  b.sweep(forkR2, [0.07, 0.022], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR2" });

  const forkR3 = bezier([-0.82, 4.08, 0.02], [-0.96, 4.28, -0.18], [-1.05, 4.50, -0.28]);
  b.sweep(forkR3, [0.065, 0.02], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR3" });

  // Sturdy Crane Branch curving forward from Right Antler to anchor the hanging lantern
  const craneBranch = bezier([-0.72, 4.02, 0.28], [-0.90, 4.08, 0.38], [-1.08, 4.08, 0.42]);
  b.sweep(craneBranch, [0.065, 0.035], { bone: antlerR2, color: barkPaint, caps: "round", name: "lantern_crane" });

  // Back Canopy Sturdy Boughs
  const backBranch1 = bezier([0, 2.80, -0.44], [0, 3.24, -0.80], [0, 3.62, -1.06]);
  b.sweep(backBranch1, [0.14, 0.045], { bone: chest, color: barkPaint, caps: "point", name: "back_branch1" });

  const backBranch2 = bezier([0.40, 2.76, -0.40], [0.65, 3.16, -0.70], [0.85, 3.46, -0.92]);
  b.sweep(backBranch2, [0.11, 0.038], { bone: chest, color: barkPaint, caps: "point", name: "back_branch2" });

  const backBranch3 = bezier([-0.40, 2.76, -0.40], [-0.65, 3.16, -0.70], [-0.85, 3.46, -0.92]);
  b.sweep(backBranch3, [0.11, 0.038], { bone: chest, color: barkPaint, caps: "point", name: "back_branch3" });

  // Rich Leaf Canopy Cards across antler tips and branches
  const leafFrames: Frame[] = [
    // Left antler foliage
    frame([1.08, 4.38, -0.08], [0.3, 0.9, -0.1]),
    frame([0.82, 4.24, 0.36], [0.4, 0.8, 0.5]),
    frame([1.22, 4.20, 0.10], [0.8, 0.5, 0.1]),
    frame([1.05, 4.50, -0.28], [0.2, 0.7, -0.7]),
    frame([0.65, 3.95, 0.18], [0.3, 0.9, 0.1]),
    frame([0.88, 4.25, 0.12], [0.5, 0.8, 0.2]),
    // Right antler foliage
    frame([-1.08, 4.38, -0.08], [-0.3, 0.9, -0.1]),
    frame([-0.82, 4.24, 0.36], [-0.4, 0.8, 0.5]),
    frame([-1.22, 4.20, 0.10], [-0.8, 0.5, 0.1]),
    frame([-1.05, 4.50, -0.28], [-0.2, 0.7, -0.7]),
    frame([-0.65, 3.95, 0.18], [-0.3, 0.9, 0.1]),
    frame([-0.88, 4.25, 0.12], [-0.5, 0.8, 0.2]),
    // Back branches foliage
    frame([0, 3.62, -1.06], [0, 0.7, -0.7]),
    frame([0.85, 3.46, -0.92], [0.6, 0.7, -0.4]),
    frame([-0.85, 3.46, -0.92], [-0.6, 0.7, -0.4]),
    frame([0.45, 3.32, -0.78], [0.3, 0.9, -0.3]),
    frame([-0.45, 3.32, -0.78], [-0.3, 0.9, -0.3]),
    frame([0.0, 3.40, -0.85], [0, 1, -0.2]),
    // Arm twig foliage
    frame([1.45, 2.10, -0.12], [0.8, 0.6, -0.1]),
    frame([-1.45, 2.10, -0.12], [-0.8, 0.6, -0.1]),
  ];
  b.cards(leafFrames, LEAF_TEX, {
    size: [0.52, 0.60],
    bend: 26,
    vary: 0.25,
    cross: true,
    rng: rng(42),
    name: "canopy_leaves",
  });

  // Hanging Willow / Spanish Moss Vines
  const vineFrames: Frame[] = [
    frame([0.72, 4.02, 0.10], [0, 1, 0]),
    frame([1.02, 4.10, 0.08], [0, 1, 0]),
    frame([-0.72, 4.02, 0.10], [0, 1, 0]),
    frame([-1.02, 4.10, 0.08], [0, 1, 0]),
    frame([0.55, 3.14, -0.62], [0, 1, 0]),
    frame([-0.55, 3.14, -0.62], [0, 1, 0]),
    frame([0.0, 3.34, -0.92], [0, 1, 0]),
    frame([0.22, 2.74, 0.44], [0, 1, 0]),
    frame([-0.22, 2.74, 0.44], [0, 1, 0]),
  ];
  b.cards(vineFrames, VINE_TEX, {
    size: [0.22, 0.72],
    lean: 180,
    flow: [0, 0, 1],
    vary: 0.22,
    rng: rng(88),
    name: "hanging_vines",
  });

  // ---------------------------------------------------------------------------
  // 7. Hanging Spirit Lantern (Grounded & Interlinked)
  // ---------------------------------------------------------------------------

  const lanternX = -1.08;
  const lanternZ = 0.42;

  // Solid Forged Iron Hook at Crane Tip
  b.part(
    new THREE.TorusGeometry(0.038, 0.010, 6, 12, Math.PI * 1.5),
    DARK_WOOD,
    { bone: antlerR2, at: [lanternX, 4.03, lanternZ], rotation: [0, 0, -90], name: "crane_hook" },
  );

  // Interlocked Chain Links firmly attached to Crane Tip and Lantern Cap
  const chainY = [3.97, 3.89, 3.81, 3.73, 3.65];
  for (let c = 0; c < chainY.length; c++) {
    b.part(
      new THREE.TorusGeometry(0.034, 0.009, 6, 10),
      DARK_WOOD,
      {
        bone: antlerR2,
        at: [lanternX, chainY[c], lanternZ],
        rotation: [0, c % 2 === 0 ? 0 : 90, 0],
        name: `lantern_chain_${c}`,
      },
    );
  }

  // Lantern Eyelet atop cap
  b.part(
    new THREE.TorusGeometry(0.032, 0.008, 6, 10),
    DARK_WOOD,
    { bone: antlerR2, at: [lanternX, 3.59, lanternZ], rotation: [0, 0, 0], name: "lantern_eyelet" },
  );

  // Lantern Hexagonal Carved Wooden Cap
  b.part(
    new THREE.ConeGeometry(0.16, 0.12, 6),
    DARK_WOOD,
    { bone: antlerR2, at: [lanternX, 3.53, lanternZ], rotation: [0, 0, 0], name: "lantern_cap" },
  );

  // Lantern Hexagonal Base
  b.part(
    new THREE.ConeGeometry(0.15, 0.10, 6),
    DARK_WOOD,
    { bone: antlerR2, at: [lanternX, 3.25, lanternZ], rotation: [180, 0, 0], name: "lantern_base" },
  );

  // 6 Wooden Struts
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const sx = lanternX + 0.11 * Math.cos(a);
    const sz = lanternZ + 0.11 * Math.sin(a);
    b.rod(
      [sx, 3.53, sz],
      [sx, 3.25, sz],
      0.014,
      { bone: antlerR2, color: DARK_WOOD, name: `lantern_strut_${i}` },
    );
  }

  // Glowing Spirit Glass Cylinder
  const lanternGlass = b.part(
    new THREE.CylinderGeometry(0.10, 0.10, 0.24, 6, 1, true),
    "#ffffff",
    {
      bone: antlerR2,
      at: [lanternX, 3.39, lanternZ],
      texture: LANTERN_GLASS_TEX,
      name: "lantern_glass",
    },
  );
  glow(lanternGlass, 2.2);

  // Radiant Golden Forest Wisp inside lantern
  const lanternWisp = b.part(
    new THREE.SphereGeometry(0.07, 8, 8),
    GLOW_GOLD,
    { bone: antlerR2, at: [lanternX, 3.39, lanternZ], name: "lantern_wisp" },
  );
  glow(lanternWisp, 3.0);

  // ---------------------------------------------------------------------------
  // 8. Massive Wooden Arms, Claws & Shoulder Dolmen Runestones
  // ---------------------------------------------------------------------------

  // Left Arm (+X)
  b.part(
    new THREE.SphereGeometry(0.35, 10, 8),
    barkPaint,
    { bone: shoulderL, at: [0.92, 2.65, 0.02], scale: [1.15, 1.0, 1.25], name: "shoulder_node_L" },
  );

  // Ancient Druid Rune Dolmen strapped to Left Shoulder
  b.frustumBox(
    [0.78, 2.82, 0.00],
    [1.14, 2.96, 0.05],
    [0.40, 0.22],
    [0.32, 0.18],
    { bone: shoulderL, color: stonePaint, name: "shoulder_monolith_L" },
  );
  const shoulderRuneL = b.part(
    new THREE.PlaneGeometry(0.22, 0.22),
    "#ffffff",
    {
      bone: shoulderL,
      at: [0.96, 2.98, 0.08],
      rotation: [-60, 40, -10],
      texture: RUNE_TEX,
      name: "shoulder_rune_L",
    },
  );
  glow(shoulderRuneL, 2.2);

  const upperArmL = catmull([
    [0.92, 2.65, 0.02],
    [1.18, 2.35, -0.02],
    [1.42, 2.02, -0.05],
  ]);
  b.sweep(upperArmL, [0.28, 0.23], { bone: shoulderL, color: barkPaint, name: "upper_arm_L" });

  b.part(
    new THREE.SphereGeometry(0.26, 8, 8),
    barkPaint,
    { bone: elbowL, at: [1.42, 2.02, -0.05], name: "elbow_node_L" },
  );

  const foreArmL = catmull([
    [1.42, 2.02, -0.05],
    [1.56, 1.64, 0.05],
    [1.68, 1.25, 0.14],
  ]);
  b.sweep(foreArmL, (t) => 0.23 + 0.10 * t, { bone: elbowL, color: barkPaint, name: "forearm_L" });

  b.part(
    new THREE.CylinderGeometry(0.30, 0.32, 0.15, 10),
    barkPaint,
    { bone: wristL, at: [1.68, 1.25, 0.14], dir: [0.2, -0.9, 0.2], name: "wrist_collar_L" },
  );

  b.frustumBox(
    [1.68, 1.25, 0.14],
    [1.74, 1.05, 0.20],
    [0.44, 0.24],
    [0.36, 0.20],
    { bone: wristL, color: barkPaint, name: "palm_L" },
  );

  // Left Fingers & Thumb (Chunky wooden branch digits with heartwood claws)
  b.capsule([1.54, 1.15, 0.28], [1.46, 0.95, 0.38], 0.075, { bone: thumbL1, color: barkPaint, name: "thumb_p_L" });
  b.spike([1.46, 0.95, 0.38], [1.38, 0.78, 0.46], 0.22, 0.065, { bone: thumbL2, color: HEARTWOOD, name: "thumb_d_L" });

  b.capsule([1.70, 1.10, 0.30], [1.74, 0.88, 0.38], 0.075, { bone: indexL1, color: barkPaint, name: "index_p_L" });
  b.spike([1.74, 0.88, 0.38], [1.78, 0.70, 0.45], 0.24, 0.065, { bone: indexL2, color: HEARTWOOD, name: "index_d_L" });

  b.capsule([1.80, 1.08, 0.16], [1.86, 0.84, 0.20], 0.078, { bone: midL1, color: barkPaint, name: "mid_p_L" });
  b.spike([1.86, 0.84, 0.20], [1.92, 0.65, 0.25], 0.26, 0.068, { bone: midL2, color: HEARTWOOD, name: "mid_d_L" });

  b.capsule([1.78, 1.10, -0.04], [1.82, 0.88, -0.08], 0.072, { bone: ringL1, color: barkPaint, name: "ring_p_L" });
  b.spike([1.82, 0.88, -0.08], [1.86, 0.72, -0.12], 0.23, 0.062, { bone: ringL2, color: HEARTWOOD, name: "ring_d_L" });

  // Right Arm (-X)
  b.part(
    new THREE.SphereGeometry(0.35, 10, 8),
    barkPaint,
    { bone: shoulderR, at: [-0.92, 2.65, 0.02], scale: [1.15, 1.0, 1.25], name: "shoulder_node_R" },
  );

  b.frustumBox(
    [-0.78, 2.82, 0.00],
    [-1.14, 2.96, 0.05],
    [0.40, 0.22],
    [0.32, 0.18],
    { bone: shoulderR, color: stonePaint, name: "shoulder_monolith_R" },
  );
  const shoulderRuneR = b.part(
    new THREE.PlaneGeometry(0.22, 0.22),
    "#ffffff",
    {
      bone: shoulderR,
      at: [-0.96, 2.98, 0.08],
      rotation: [-60, -40, 10],
      texture: RUNE_TEX,
      name: "shoulder_rune_R",
    },
  );
  glow(shoulderRuneR, 2.2);

  const upperArmR = catmull([
    [-0.92, 2.65, 0.02],
    [-1.18, 2.35, -0.02],
    [-1.42, 2.02, -0.05],
  ]);
  b.sweep(upperArmR, [0.28, 0.23], { bone: shoulderR, color: barkPaint, name: "upper_arm_R" });

  b.part(
    new THREE.SphereGeometry(0.26, 8, 8),
    barkPaint,
    { bone: elbowR, at: [-1.42, 2.02, -0.05], name: "elbow_node_R" },
  );

  const foreArmR = catmull([
    [-1.42, 2.02, -0.05],
    [-1.56, 1.64, 0.05],
    [-1.68, 1.25, 0.14],
  ]);
  b.sweep(foreArmR, (t) => 0.23 + 0.10 * t, { bone: elbowR, color: barkPaint, name: "forearm_R" });

  b.part(
    new THREE.CylinderGeometry(0.30, 0.32, 0.15, 10),
    barkPaint,
    { bone: wristR, at: [-1.68, 1.25, 0.14], dir: [-0.2, -0.9, 0.2], name: "wrist_collar_R" },
  );

  b.frustumBox(
    [-1.68, 1.25, 0.14],
    [-1.74, 1.05, 0.20],
    [0.44, 0.24],
    [0.36, 0.20],
    { bone: wristR, color: barkPaint, name: "palm_R" },
  );

  // Right Fingers & Thumb
  b.capsule([-1.54, 1.15, 0.28], [-1.46, 0.95, 0.38], 0.075, { bone: thumbR1, color: barkPaint, name: "thumb_p_R" });
  b.spike([-1.46, 0.95, 0.38], [-1.38, 0.78, 0.46], 0.22, 0.065, { bone: thumbR2, color: HEARTWOOD, name: "thumb_d_R" });

  b.capsule([-1.70, 1.10, 0.30], [-1.74, 0.88, 0.38], 0.075, { bone: indexR1, color: barkPaint, name: "index_p_R" });
  b.spike([-1.74, 0.88, 0.38], [-1.78, 0.70, 0.45], 0.24, 0.065, { bone: indexR2, color: HEARTWOOD, name: "index_d_R" });

  b.capsule([-1.80, 1.08, 0.16], [-1.86, 0.84, 0.20], 0.078, { bone: midR1, color: barkPaint, name: "mid_p_R" });
  b.spike([-1.86, 0.84, 0.20], [-1.92, 0.65, 0.25], 0.26, 0.068, { bone: midR2, color: HEARTWOOD, name: "mid_d_R" });

  b.capsule([-1.78, 1.10, -0.04], [-1.82, 0.88, -0.08], 0.072, { bone: ringR1, color: barkPaint, name: "ring_p_R" });
  b.spike([-1.82, 0.88, -0.08], [-1.86, 0.72, -0.12], 0.23, 0.062, { bone: ringR2, color: HEARTWOOD, name: "ring_d_R" });

  // ---------------------------------------------------------------------------
  // 9. Massive Trunk Legs & Sprawling Buttress Root Feet (Touching y = 0)
  // ---------------------------------------------------------------------------

  // Left Leg (+X)
  const thighL = catmull([
    [0.55, 1.40, -0.04],
    [0.60, 1.10, -0.06],
    [0.65, 0.82, -0.07],
  ]);
  b.sweep(thighL, [0.34, 0.30], { bone: hipL, color: barkPaint, name: "thigh_L" });

  b.part(
    new THREE.SphereGeometry(0.30, 8, 8),
    barkPaint,
    { bone: kneeL, at: [0.65, 0.82, -0.07], name: "knee_node_L" },
  );

  const shinL = catmull([
    [0.65, 0.82, -0.07],
    [0.68, 0.58, -0.02],
    [0.72, 0.34, 0.04],
  ]);
  b.sweep(shinL, [0.30, 0.42], { bone: kneeL, color: barkPaint, name: "shin_L" });

  // 4 Giant Sprawling Buttress Roots anchoring Left Foot firmly to y = 0.02
  const rootL1 = bezier([0.72, 0.34, 0.04], [0.94, 0.14, 0.36], [1.16, 0.02, 0.64]);
  b.sweep(rootL1, [0.20, 0.065], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_front_out" });

  const rootL2 = bezier([0.72, 0.34, 0.04], [0.52, 0.14, 0.42], [0.38, 0.02, 0.70]);
  b.sweep(rootL2, [0.19, 0.06], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_front_in" });

  const rootL3 = bezier([0.72, 0.34, 0.04], [0.92, 0.12, -0.28], [1.12, 0.02, -0.52]);
  b.sweep(rootL3, [0.21, 0.065], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_rear_brace" });

  const rootL4 = bezier([0.72, 0.34, 0.04], [1.10, 0.12, -0.02], [1.38, 0.02, -0.08]);
  b.sweep(rootL4, [0.19, 0.06], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_side_anchor" });

  // Right Leg (-X)
  const thighR = catmull([
    [-0.55, 1.40, -0.04],
    [-0.60, 1.10, -0.06],
    [-0.65, 0.82, -0.07],
  ]);
  b.sweep(thighR, [0.34, 0.30], { bone: hipR, color: barkPaint, name: "thigh_R" });

  b.part(
    new THREE.SphereGeometry(0.30, 8, 8),
    barkPaint,
    { bone: kneeR, at: [-0.65, 0.82, -0.07], name: "knee_node_R" },
  );

  const shinR = catmull([
    [-0.65, 0.82, -0.07],
    [-0.68, 0.58, -0.02],
    [-0.72, 0.34, 0.04],
  ]);
  b.sweep(shinR, [0.30, 0.42], { bone: kneeR, color: barkPaint, name: "shin_R" });

  // 4 Giant Sprawling Buttress Roots anchoring Right Foot firmly to y = 0.02
  const rootR1 = bezier([-0.72, 0.34, 0.04], [-0.94, 0.14, 0.36], [-1.16, 0.02, 0.64]);
  b.sweep(rootR1, [0.20, 0.065], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_front_out" });

  const rootR2 = bezier([-0.72, 0.34, 0.04], [-0.52, 0.14, 0.42], [-0.38, 0.02, 0.70]);
  b.sweep(rootR2, [0.19, 0.06], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_front_in" });

  const rootR3 = bezier([-0.72, 0.34, 0.04], [-0.92, 0.12, -0.28], [-1.12, 0.02, -0.52]);
  b.sweep(rootR3, [0.21, 0.065], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_rear_brace" });

  const rootR4 = bezier([-0.72, 0.34, 0.04], [-1.10, 0.12, -0.02], [-1.38, 0.02, -0.08]);
  b.sweep(rootR4, [0.19, 0.06], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_side_anchor" });

  // ---------------------------------------------------------------------------
  // 10. Sacred Grove Staged Base & Scenery (Resting on y = 0)
  // ---------------------------------------------------------------------------

  // Circular Forest Grove Ground Mound: bottom resting exactly at y = 0.0
  b.lathe(
    [
      [0, 0.0],
      [2.35, 0.0],
      [2.30, 0.025],
      [1.85, 0.055],
      [0, 0.07],
    ],
    { at: [0, 0, 0], segments: 24, color: groundPaint, name: "sacred_grove_base" },
  );

  // Sacred Moonwell pool embedded in the grove
  b.part(
    new THREE.CylinderGeometry(0.60, 0.60, 0.025, 16),
    stonePaint,
    { at: [0.0, 0.055, 1.25], name: "moonwell_basin" },
  );
  b.part(
    new THREE.TorusGeometry(0.58, 0.035, 6, 16),
    stonePaint,
    { at: [0.0, 0.075, 1.25], rotation: [-90, 0, 0], name: "moonwell_rim" },
  );
  const moonwellPool = b.part(
    new THREE.CircleGeometry(0.54, 16),
    MOONWELL_WATER,
    { at: [0.0, 0.072, 1.25], rotation: [-90, 0, 0], name: "moonwell_water" },
  );
  glow(moonwellPool, 2.2);

  // Weathered Druidic Standing Monolith (set behind to frame the silhouette)
  b.frustumBox(
    [0.0, 0.02, -1.65],
    [0.0, 1.45, -1.75],
    [0.60, 0.38],
    [0.34, 0.22],
    { color: stonePaint, name: "standing_monolith" },
  );

  const monolithRune = b.part(
    new THREE.PlaneGeometry(0.30, 0.65),
    "#ffffff",
    {
      at: [0.0, 0.80, -1.45],
      rotation: [0, 0, 0],
      texture: RUNE_TEX,
      name: "monolith_rune",
    },
  );
  glow(monolithRune, 2.4);

  // Weathered stepping flagstones embedded in the mossy grove floor
  const stonePaving = [
    [-1.05, 0.04, 0.90, 0.44],
    [1.12, 0.04, 0.85, 0.48],
    [-1.25, 0.03, -0.72, 0.40],
    [1.00, 0.03, -0.88, 0.42],
    [0.0, 0.04, -0.80, 0.50],
  ];
  for (let s = 0; s < stonePaving.length; s++) {
    const [sx, sy, sz, sr] = stonePaving[s];
    b.part(
      new THREE.CylinderGeometry(sr, sr * 1.08, 0.03, 7),
      stonePaint,
      { at: [sx, sy, sz], rotation: [0, s * 45, 0], name: `flagstone_${s}` },
    );
  }

  // Luminescent Forest Spirit Mushrooms sprouting around the ancient roots
  const shroomPositions = [
    [0.65, 0.04, 0.70],
    [0.55, 0.04, 0.78],
    [0.72, 0.04, 0.62],
    [-0.65, 0.04, 0.70],
    [-0.55, 0.04, 0.78],
    [-0.72, 0.04, 0.62],
    [-1.15, 0.04, 0.15],
    [1.15, 0.04, 0.15],
  ];
  for (let p = 0; p < shroomPositions.length; p++) {
    const [px, py, pz] = shroomPositions[p];
    b.rod([px, py, pz], [px, py + 0.08, pz], 0.015, { color: SHROOM_CREAM, name: `spirit_stem_${p}` });
    const cap = b.part(
      new THREE.ConeGeometry(0.055, 0.05, 8),
      GLOW_GREEN,
      { at: [px, py + 0.095, pz], rotation: [0, 0, 0], name: `spirit_cap_${p}` },
    );
    glow(cap, 2.5);
  }

  return b.root;
}
```