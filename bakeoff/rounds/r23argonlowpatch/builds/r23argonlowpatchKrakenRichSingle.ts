import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { countershade, gradient, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Abyssal Titan Kraken",
  description:
    "Overwatch-style deep-sea colossal kraken rising from the ocean floor with spread tentacles, sleek hydro-armor plating, glowing cyan bioluminescent conduits, articulated snapping beak, and twin hunting clubs.",
  style: "Overwatch",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "kraken", detail: 1, paintSize: 2048 });
  const rand = rng(9041);

  // ============================================================================
  // OVERWATCH PALETTE & PROCEDURAL PAINTS
  // ============================================================================
  const NAVY_DARK = "#121a30";
  const NAVY_MID = "#1d2c4f";
  const NAVY_LIGHT = "#2c4270";
  const TEAL_BELLY = "#6cc8c4";
  const CREAM_UNDER = "#d2f0eb";
  const CORAL_WARM = "#e85d56";
  const CORAL_PALE = "#ff9a8b";

  // Stylized sci-fi armor & trim colours
  const ARMOR_WHITE = "#e8eef5";
  const ARMOR_SILVER = "#9fb0c7";
  const ARMOR_SLATE = "#36455e";
  const ARMOR_CHARCOAL = "#1a2232";
  const GOLD_TRIM = "#f2a93b";
  const GOLD_DARK = "#b57219";

  // Strong Overwatch accent glow colours
  const CYAN_GLOW = "#00f2ff";
  const CYAN_SOFT = "#5ceeff";
  const AMBER_GLOW = "#ff8800";
  const EYE_YELLOW = "#ffe600";
  const BEAK_DARK = "#171824";
  const BEAK_EDGE = "#3f465e";

  // Paint: Sleek deep-sea mantle skin with clean graphic hex-spots and panel lines
  const mantlePaint = paint((p, n, s) => {
    const dorsal = smoothstep(-0.35, 0.45, n.y * 0.7 - p.z * 0.15);
    const base = mix(
      TEAL_BELLY,
      mix(NAVY_MID, NAVY_DARK, smoothstep(2.4, 5.2, p.y)),
      dorsal,
    );
    // Stylized Overwatch graphic racing/chevron stripes along the mantle
    const u = s[0];
    const deg = s[1];
    const absDeg = Math.abs(deg > 180 ? deg - 360 : deg);
    const chevron = Math.sin(u * 22 - absDeg * 0.045);
    const stripeMask =
      smoothstep(0.68, 0.78, chevron) *
      smoothstep(25, 55, absDeg) *
      smoothstep(145, 110, absDeg) *
      smoothstep(0.12, 0.25, u) *
      smoothstep(0.92, 0.78, u);

    // Subtle cellular bio-spots on upper mantle
    const nVal = noise(p, 0.28, 17);
    const spotMask = smoothstep(0.66, 0.74, nVal) * dorsal;

    let col = mix(base, NAVY_LIGHT, spotMask * 0.55);
    col = mix(col, "#00b8d4", stripeMask * 0.65);

    // Crisp dark panel seam line at mid-flank
    const seam = Math.exp(-Math.pow((absDeg - 82) / 3.2, 2));
    col = mix(col, NAVY_DARK, seam * 0.8);
    return col;
  });

  // Paint: Tentacle upper skin vs pale coral/teal sucker underside with bold banding
  const tentaclePaint = paint((p, _n, s) => {
    const t = s[0];
    const deg = s[1];
    const absDeg = Math.abs(deg > 180 ? deg - 360 : deg);
    // Underside is around deg = 180
    const under = smoothstep(105, 148, absDeg);
    const tipFade = smoothstep(0.55, 0.96, t);

    const upperBase = mix(NAVY_MID, NAVY_DARK, smoothstep(0.1, 0.85, t));
    const upperTip = mix(upperBase, CORAL_WARM, tipFade * 0.65);

    // Graphic Tiger/Kraken rings near the outer half of the tentacle
    const ringWave = Math.sin(t * 44);
    const ringBand = smoothstep(0.45, 0.65, ringWave) * smoothstep(0.25, 0.5, t);
    const upperFinal = mix(upperTip, "#29688a", ringBand * 0.5);

    const underCol = mix(CREAM_UNDER, CORAL_PALE, tipFade * 0.75);
    const seamEdge = Math.exp(-Math.pow((absDeg - 126) / 4.5, 2));

    let col = mix(upperFinal, underCol, under);
    col = mix(col, NAVY_DARK, seamEdge * 0.65);
    return col;
  });

  // Paint: Polished Overwatch white/silver hydro-armor with bevel shading & panel lines
  const armorPaint = paint((p, n, s) => {
    const shade = smoothstep(-0.4, 0.6, n.y * 0.65 + n.z * 0.35);
    const base = mix(ARMOR_SILVER, ARMOR_WHITE, shade);
    const panelLine =
      Math.abs(Math.sin(p.y * 14 + p.z * 6)) < 0.045 && n.y > -0.2 ? 1 : 0;
    const edgeDark = smoothstep(0.88, 0.97, s[0]);
    let col = mix(base, ARMOR_SLATE, panelLine * 0.55);
    col = mix(col, ARMOR_SLATE, edgeDark * 0.4);
    return col;
  });

  const slateArmorPaint = countershade(ARMOR_SLATE, ARMOR_CHARCOAL, {
    level: 0,
    soft: 0.35,
  });

  const goldTrimPaint = countershade("#ffd166", GOLD_DARK, {
    level: -0.1,
    soft: 0.4,
  });

  const membranePaint = paint((_p, _n, s) => {
    const along = s[0];
    const across = s[1];
    const edgeDist = Math.min(across, 1 - across) * 2;
    const base = mix(NAVY_MID, TEAL_BELLY, smoothstep(0.2, 0.9, along));
    const vein = Math.sin(along * 28 - Math.abs(across - 0.5) * 14);
    const veinMask = smoothstep(0.75, 0.92, vein) * smoothstep(0.05, 0.4, edgeDist);
    let col = mix(base, CORAL_WARM, smoothstep(0.7, 1.0, along) * 0.5);
    col = mix(col, "#00d8e6", veinMask * 0.55);
    return col;
  });

  const headSkinPaint = mottle(NAVY_MID, NAVY_LIGHT, {
    size: 0.35,
    contrast: 1.4,
    seed: 42,
  });

  // ============================================================================
  // SVG TEXTURES & DECALS (Eyes, Dorsal Bio-Crest, Fin Frills)
  // ============================================================================
  const EYE_TEX = svg(
    `<svg viewBox="0 0 128 96">
      <defs>
        <radialGradient id="irisG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffb96"/>
          <stop offset="55%" stop-color="#ffae00"/>
          <stop offset="90%" stop-color="#e63900"/>
          <stop offset="100%" stop-color="#1a0d26"/>
        </radialGradient>
      </defs>
      <ellipse cx="64" cy="48" rx="58" ry="40" fill="#0d1322"/>
      <ellipse cx="64" cy="48" rx="50" ry="34" fill="url(#irisG)" stroke="#00f2ff" stroke-width="3"/>
      <!-- W-shaped cephalopod pupil with fierce Overwatch angularity -->
      <path d="M 24 36 L 44 60 L 64 42 L 84 60 L 104 36 L 96 28 L 82 46 L 64 30 L 46 46 L 32 28 Z" fill="#090b14"/>
      <ellipse cx="42" cy="30" rx="11" ry="7" fill="#ffffff"/>
      <circle cx="88" cy="58" r="5" fill="#00f2ff"/>
      <circle cx="34" cy="54" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 512 },
  );

  const CREST_DECAL = svg(
    `<svg viewBox="0 0 256 256">
      <!-- Stylized Overwatch Horizon/Abyssal bio-hazardtech emblem -->
      <polygon points="128,14 218,68 194,186 128,242 62,186 38,68" fill="#18243d" stroke="#00f2ff" stroke-width="8"/>
      <polygon points="128,36 196,78 176,172 128,216 80,172 60,78" fill="none" stroke="#f2a93b" stroke-width="5"/>
      <path d="M 128 54 L 166 112 L 128 192 L 90 112 Z" fill="#00f2ff"/>
      <circle cx="128" cy="116" r="22" fill="#121a30" stroke="#ffffff" stroke-width="5"/>
      <circle cx="128" cy="116" r="10" fill="#ff8800"/>
      <path d="M 56 108 L 88 124 L 74 162 Z" fill="#00f2ff"/>
      <path d="M 200 108 L 168 124 L 182 162 Z" fill="#00f2ff"/>
    </svg>`,
    { size: 512 },
  );

  const FIN_FRILL_CARD = svg(
    `<svg viewBox="0 0 96 160">
      <path d="M 48 156 C 16 126 8 72 22 18 C 36 42 44 24 48 6 C 52 24 60 42 74 18 C 88 72 80 126 48 156 Z" fill="#1a2c4e" stroke="#00f2ff" stroke-width="5"/>
      <path d="M 48 148 L 48 22 M 48 96 L 24 54 M 48 96 L 72 54 M 48 64 L 30 32 M 48 64 L 66 32" stroke="#5ceeff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="24" cy="54" r="5" fill="#ff8800"/>
      <circle cx="72" cy="54" r="5" fill="#ff8800"/>
      <circle cx="48" cy="22" r="6" fill="#00f2ff"/>
    </svg>`,
    { size: 256 },
  );

  // ============================================================================
  // SKELETON: ROOT, SPINE, HEAD, BEAK JAWS, LATERAL FINS
  // ============================================================================
  // The Kraken rises from y = 0 (tentacles planted in a wide radial stance on the floor)
  // Central oral pelvis sits at y = 1.28 m, rising into a towering head and 4.8 m tall mantle dome.
  const pelvis = b.joint("pelvis", {
    at: [0, 1.28, 0.12],
    dir: [0, 1, 0.08],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.28, 0.12],
      [0, 1.72, 0.18],
      [0, 2.22, 0.14],
    ]),
    {
      parent: pelvis,
      names: ["spine1", "chest"],
      role: "spine",
      group: "body",
    },
  );
  const chest = spine.joints[1];

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 2.32, 0.12],
    dir: [0, 0.96, -0.25],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.52, 0.08],
    dir: [0, 0.92, -0.38],
    role: "head",
    group: "head",
  });

  // Mantle chain extending high and slightly swept back like a colossal regal squid hood
  const mantleChain = b.chain(
    "mantle",
    catmull([
      [0, 2.68, 0.02],
      [0, 3.35, -0.26],
      [0, 4.05, -0.62],
      [0, 4.62, -1.02],
      [0, 4.95, -1.36],
    ]),
    {
      parent: head,
      names: ["mantle1", "mantle2", "mantle3", "mantle4", "mantleTip"],
      role: "tail",
      group: "mantle",
    },
  );

  // Separate Upper & Lower Beak Jaws (per creature rest-pose requirements)
  const jawUpper = b.joint("jawUpper", {
    parent: pelvis,
    at: [0, 1.48, 0.62],
    dir: [0, -0.22, 0.97],
    role: "jaw",
    group: "mouth",
  });

  const jawLower = b.joint("jawLower", {
    parent: pelvis,
    at: [0, 1.18, 0.56],
    dir: [0, -0.48, 0.88],
    role: "jaw",
    group: "mouth",
  });

  // Articulated Siphon Jet Thruster on the ventral-posterior side
  const siphonJoint = b.joint("siphon", {
    parent: chest,
    at: [0, 1.98, -0.48],
    dir: [0, -0.55, -0.83],
    role: "hinge",
    group: "siphon",
  });

  // Paired mantle stabilizer fins
  const finChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    finChains[side] = b.chain(
      `fin${side}`,
      catmull([
        [s * 0.56, 3.92, -0.62],
        [s * 1.18, 4.18, -0.88],
        [s * 1.72, 4.42, -1.24],
      ]),
      {
        parent: mantleChain.joints[2],
        names: [`finBase${side}`, `finMid${side}`, `finTip${side}`],
        role: "wing",
        group: `fin${side}`,
      },
    );
  }

  // ============================================================================
  // SKELETON: 8 RADIAL TENTACLES + 2 RAPTURE HUNTING CLUB TENTACLES
  // ============================================================================
  // All 8 main arms spread out cleanly in a radial rest pose, planting firmly at y = 0
  // and curling their tips upward.
  type TentacleSpec = {
    name: string;
    angleDeg: number;
    reach: number;
    archH: number;
    curlH: number;
    rootR: number;
  };

  const tentacleSpecs: TentacleSpec[] = [
    { name: "tentacleFL", angleDeg: 26, reach: 2.85, archH: 1.55, curlH: 0.68, rootR: 0.25 },
    { name: "tentacleFR", angleDeg: -26, reach: 2.85, archH: 1.55, curlH: 0.68, rootR: 0.25 },
    { name: "tentacleML", angleDeg: 72, reach: 3.1, archH: 1.65, curlH: 0.78, rootR: 0.27 },
    { name: "tentacleMR", angleDeg: -72, reach: 3.1, archH: 1.65, curlH: 0.78, rootR: 0.27 },
    { name: "tentacleBL", angleDeg: 118, reach: 2.95, archH: 1.52, curlH: 0.72, rootR: 0.26 },
    { name: "tentacleBR", angleDeg: -118, reach: 2.95, archH: 1.52, curlH: 0.72, rootR: 0.26 },
    { name: "tentacleRL", angleDeg: 156, reach: 2.75, archH: 1.42, curlH: 0.64, rootR: 0.24 },
    { name: "tentacleRR", angleDeg: -156, reach: 2.75, archH: 1.42, curlH: 0.64, rootR: 0.24 },
  ];

  const tentacleChains: Array<{
    spec: TentacleSpec;
    chain: ReturnType<typeof b.chain>;
    pts: THREE.Vector3[];
    dirX: number;
    dirZ: number;
  }> = [];

  for (const spec of tentacleSpecs) {
    const rad = spec.angleDeg * DEG;
    const dx = Math.sin(rad);
    const dz = Math.cos(rad);
    const r0 = 0.56;
    const r1 = 1.28;
    const r2 = 2.02;
    const r3 = spec.reach;
    const r4 = spec.reach + 0.52;

    // Plant point r2 has y = 0.135 so that radius ~0.135 at t ≈ 0.68 kisses y = 0!
    const pts = [
      new THREE.Vector3(dx * r0, 1.18, 0.12 + dz * r0),
      new THREE.Vector3(dx * r1, spec.archH, 0.12 + dz * r1),
      new THREE.Vector3(dx * r2, 0.135, 0.12 + dz * r2),
      new THREE.Vector3(dx * r3, 0.11, 0.12 + dz * r3),
      new THREE.Vector3(dx * r4, spec.curlH, 0.12 + dz * r4),
    ];

    const chain = b.chain(spec.name, catmull(pts), {
      parent: pelvis,
      names: [
        `${spec.name}1`,
        `${spec.name}2`,
        `${spec.name}3`,
        `${spec.name}4`,
        `${spec.name}Tip`,
      ],
      role: "tentacle",
      contact: [pts[2].x, 0, pts[2].z],
      group: spec.name,
    });

    tentacleChains.push({ spec, chain, pts, dirX: dx, dirZ: dz });
  }

  // 2 Long Hunting Club Tentacles (raised high & wide in a heroic silhouette)
  const clubChains: Array<{
    side: "L" | "R";
    s: 1 | -1;
    chain: ReturnType<typeof b.chain>;
    pts: THREE.Vector3[];
  }> = [];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const pts = [
      new THREE.Vector3(s * 0.54, 1.54, 0.34),
      new THREE.Vector3(s * 1.48, 2.05, 0.85),
      new THREE.Vector3(s * 2.38, 2.68, 0.52),
      new THREE.Vector3(s * 2.95, 3.25, 0.95),
      new THREE.Vector3(s * 3.18, 3.68, 1.38),
    ];
    const chain = b.chain(`clubTentacle${side}`, catmull(pts), {
      parent: chest,
      names: [
        `clubArm${side}1`,
        `clubArm${side}2`,
        `clubArm${side}3`,
        `clubArm${side}4`,
        `clubWrist${side}`,
      ],
      role: "tentacle",
      group: `club${side}`,
    });
    clubChains.push({ side, s, chain, pts });
  }

  // ============================================================================
  // GEOMETRY: CENTRAL BODY, HEAD, ORAL BELL & MANTLE
  // ============================================================================
  // 1. Oral Crown / Pelvis Base + Central Body + Regal Kraken Mantle Loft
  const bodyStations = [
    { at: [0, 0.96, 0.14], w: 1.32, h: 1.32 },
    { at: [0, 1.45, 0.18], w: 1.48, h: 1.42 },
    { at: [0, 2.05, 0.16], w: 1.34, h: 1.28 },
    { at: [0, 2.55, 0.08], w: 1.58, h: 1.44 },
    { at: [0, 3.12, -0.16], w: 1.92, h: 1.68 },
    { at: [0, 3.78, -0.48], w: 1.74, h: 1.52 },
    { at: [0, 4.38, -0.86], w: 1.18, h: 1.06 },
    { at: [0, 4.78, -1.18], w: 0.54, h: 0.5 },
    { at: [0, 5.02, -1.42], w: 0.12, h: 0.12 },
  ];

  const mainBodyLoft = b.loft(bodyStations, {
    bone: [pelvis, spine, neck, head, mantleChain],
    color: mantlePaint,
    sides: 14,
    name: "mantleBody",
    group: "mantle",
  });

  // 2. Sculpted Brow & Cranial Bulges for the fierce cephalopod gaze
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    // Orbital mass
    b.part(new THREE.SphereGeometry(0.42, 12, 10), headSkinPaint, {
      bone: head,
      at: [s * 0.56, 2.48, 0.34],
      scale: [0.85, 0.92, 1.12],
      name: `orbitBulge${side}`,
      group: "head",
    });

    // Fierce Overwatch Heroic Armor Brow Guard
    const browPath = catmull([
      [s * 0.24, 2.66, 0.72],
      [s * 0.62, 2.74, 0.56],
      [s * 0.86, 2.58, 0.22],
      [s * 0.84, 2.34, -0.14],
    ]);
    b.sweep(
      browPath,
      (t) => [0.11 * (1 - 0.35 * t), 0.065 * (1 - 0.25 * t)],
      {
        bone: head,
        color: armorPaint,
        section: { ngon: 6 },
        name: `browGuard${side}`,
        group: "head",
      },
    );

    // Gold accent trim under the brow guard
    b.sweep(
      catmull([
        [s * 0.28, 2.61, 0.75],
        [s * 0.64, 2.68, 0.59],
        [s * 0.87, 2.53, 0.25],
      ]),
      [0.032, 0.018],
      {
        bone: head,
        color: goldTrimPaint,
        sides: 6,
        name: `browGold${side}`,
        group: "head",
      },
    );

    // Glowing Eye Orb + Conformed Anime/Cephalopod Eye Decal
    const eyeOrb = glow(
      b.part(new THREE.SphereGeometry(0.24, 12, 10), EYE_YELLOW, {
        bone: head,
        at: [s * 0.68, 2.44, 0.42],
        dir: [s * 0.78, 0.05, 0.62],
        scale: [0.95, 0.85, 0.75],
        name: `eyeOrb${side}`,
        group: "head",
      }),
      1.2,
    );

    b.decal(eyeOrb, EYE_TEX, {
      at: [s * 0.82, 2.45, 0.54],
      dir: [s * 0.76, 0.05, 0.65],
      size: [0.38, 0.28],
      mirror: s < 0,
      bone: head,
      name: `eyeDecal${side}`,
      group: "head",
    });

    // Lower Cheek / Sub-orbital Tech Plate
    b.sweep(
      catmull([
        [s * 0.44, 2.18, 0.68],
        [s * 0.74, 2.22, 0.44],
        [s * 0.84, 2.28, 0.08],
      ]),
      [0.07, 0.04],
      {
        bone: head,
        color: slateArmorPaint,
        section: "box",
        name: `cheekPlate${side}`,
        group: "head",
      },
    );

    // Cheek Bioluminescent Gill Slits (3 glowing cyan bars per side)
    for (let g = 0; g < 3; g++) {
      const gy = 2.08 - g * 0.13;
      const gz = 0.48 - g * 0.08;
      glow(
        b.capsule(
          [s * 0.65, gy, gz],
          [s * 0.58, gy - 0.06, gz - 0.18],
          0.022,
          CYAN_GLOW,
          {
            bone: chest,
            sides: 6,
            name: `gillGlow${side}${g + 1}`,
            group: "head",
          },
        ),
        1.8,
      );
    }
  }

  // ============================================================================
  // OVERWATCH HYDRO-ARMOR EXOSKELETON PLATES & BIO-REACTOR CORE
  // ============================================================================
  // Front Cranial Crown / Horizon Visor Crest
  const crownOutline: OutlinePoint[] = [
    [0, -0.32, "sharp"],
    [0.36, -0.14],
    [0.44, 0.24],
    [0.24, 0.58, "sharp"],
    [0, 0.42],
    [-0.24, 0.58, "sharp"],
    [-0.44, 0.24],
    [-0.36, -0.14],
  ];
  const crownShield = b.extrude(crownOutline, {
    at: [0, 2.86, 0.58],
    x: [1, 0, 0],
    y: [0, 0.88, -0.47],
    thickness: [0.14, 0.06],
    bevel: 0.025,
    smoothing: 1,
    color: armorPaint,
    bone: head,
    name: "crownShield",
    group: "armor",
  });

  // Apply the SVG Horizon/Abyssal emblem decal onto the front crown shield
  b.decal(crownShield, CREST_DECAL, {
    at: [0, 2.94, 0.64],
    dir: [0, 0.47, 0.88],
    size: [0.56, 0.56],
    bone: head,
    name: "crownEmblemDecal",
    group: "armor",
  });

  // Gold Rim Collar framing the transition from head to mantle
  const collarLoop = catmull(
    [
      [0, 2.72, 0.68],
      [0.78, 2.68, 0.28],
      [0.82, 2.78, -0.45],
      [0, 2.92, -0.78],
      [-0.82, 2.78, -0.45],
      [-0.78, 2.68, 0.28],
    ],
    { closed: true },
  );
  b.sweep(collarLoop, [0.065, 0.065], {
    bone: head,
    color: goldTrimPaint,
    section: { ngon: 6 },
    name: "collarGoldRing",
    group: "armor",
  });

  // Glowing Cyan Bio-Conduit Ring nested right above the gold collar
  const conduitLoop = catmull(
    [
      [0, 2.79, 0.65],
      [0.76, 2.75, 0.26],
      [0.8, 2.84, -0.44],
      [0, 2.98, -0.75],
      [-0.8, 2.84, -0.44],
      [-0.76, 2.75, 0.26],
    ],
    { closed: true },
  );
  glow(
    b.sweep(conduitLoop, 0.028, {
      bone: head,
      color: CYAN_GLOW,
      sides: 6,
      name: "collarCyanRing",
      group: "armor",
    }),
    1.8,
  );

  // Segmented Dorsal Carapace Plates ascending the Mantle (4 overlapping heroic shells)
  const carapaceConfigs = [
    { t: 0.16, w: 0.68, len: 0.62, thick: 0.12, bone: mantleChain.joints[0] },
    { t: 0.38, w: 0.62, len: 0.56, thick: 0.11, bone: mantleChain.joints[1] },
    { t: 0.6, w: 0.48, len: 0.48, thick: 0.09, bone: mantleChain.joints[2] },
    { t: 0.8, w: 0.32, len: 0.38, thick: 0.07, bone: mantleChain.joints[3] },
  ];

  for (let i = 0; i < carapaceConfigs.length; i++) {
    const cfg = carapaceConfigs[i];
    const surfPt = mainBodyLoft.at(0.45 + cfg.t * 0.45, 0, 0.02);
    const plateOutline: OutlinePoint[] = [
      [0, -cfg.len * 0.45, "sharp"],
      [cfg.w, -cfg.len * 0.15],
      [cfg.w * 0.82, cfg.len * 0.42],
      [0, cfg.len * 0.58, "sharp"],
      [-cfg.w * 0.82, cfg.len * 0.42],
      [-cfg.w, -cfg.len * 0.15],
    ];
    b.extrude(plateOutline, {
      at: surfPt.at,
      x: [1, 0, 0],
      y: surfPt.tangent,
      thickness: [cfg.thick, cfg.thick * 0.45],
      bevel: 0.02,
      smoothing: 1,
      color: armorPaint,
      bone: cfg.bone,
      name: `dorsalPlate${i + 1}`,
      group: "armor",
    });

    // Glowing Cyan Energy Node embedded in each dorsal carapace plate
    glow(
      b.part(
        new THREE.OctahedronGeometry(cfg.w * 0.18, 0),
        i % 2 === 0 ? CYAN_GLOW : AMBER_GLOW,
        {
          bone: cfg.bone,
          at: offset(surfPt.at, surfPt.n, cfg.thick * 0.55),
          scale: [0.8, 1.35, 0.5],
          flat: true,
          name: `dorsalNode${i + 1}`,
          group: "armor",
        },
      ),
      1.9,
    );
  }

  // Mantle Apex Crown Spike + Energy Beacon
  const tipJoint = mantleChain.joints[4];
  b.spike([0, 4.82, -1.22], [0, 5.38, -1.68], null, 0.16, {
    bone: tipJoint,
    color: goldTrimPaint,
    section: { ngon: 6 },
    name: "mantleApexSpike",
    group: "armor",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.11, 0), CYAN_GLOW, {
      bone: tipJoint,
      at: [0, 5.42, -1.72],
      flat: true,
      name: "mantleApexGem",
      group: "armor",
    }),
    2.2,
  );

  // Chest Bio-Reactor Core on the front thorax above the beak
  const corePos: [number, number, number] = [0, 1.96, 0.72];
  b.lathe(
    [
      [0, 0],
      [0.32, 0],
      [0.36, 0.06],
      [0.28, 0.14],
      [0.18, 0.14],
      [0.16, 0.05],
      [0, 0.05],
    ],
    {
      at: corePos,
      axis: [0, 0.15, 0.98],
      segments: 8,
      color: slateArmorPaint,
      bone: chest,
      name: "chestReactorHousing",
      group: "armor",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.17, 10, 8), CYAN_GLOW, {
      bone: chest,
      at: [0, 1.98, 0.8],
      scale: [1, 1, 0.55],
      name: "chestReactorCore",
      group: "armor",
    }),
    2.2,
  );

  // ============================================================================
  // ARTICULATED SNAP-BEAK JAWS & ORAL MAW
  // ============================================================================
  // Oral fleshy lip ring around the beak
  const mawRing = b.ring(
    frame([0, 1.34, 0.55], [0, -0.15, 0.98]),
    { count: 10, radius: 0.34, parent: pelvis },
  );
  b.sweep(catmull(mawRing.items.map((it) => it.at), { closed: true }), 0.095, {
    bone: pelvis,
    color: CORAL_WARM,
    sides: 8,
    name: "oralMawLip",
    group: "mouth",
  });

  // Upper Hooked Cephalopod Beak (built on jawUpper)
  const upperBeakOutline: OutlinePoint[] = [
    [0, 0.24, "sharp"],
    [0.24, 0.14],
    [0.18, -0.16],
    [0, -0.42, "sharp"],
    [-0.18, -0.16],
    [-0.24, 0.14],
  ];
  b.extrude(upperBeakOutline, {
    at: [0, 1.5, 0.72],
    x: [1, 0, 0],
    y: [0, 0.55, 0.83],
    thickness: [0.22, 0.04],
    bevel: 0.02,
    smoothing: 1,
    color: gradient(BEAK_DARK, BEAK_EDGE, [0, 1.55, 0.65], [0, 1.25, 0.98]),
    bone: jawUpper,
    name: "beakUpperMain",
    group: "mouth",
  });

  // Upper beak hooked fang tip
  b.sweep(
    bezier(
      [0, 1.54, 0.68],
      [0, 1.48, 0.96],
      [0, 1.26, 1.06],
    ),
    [0.15, 0.01],
    {
      bone: jawUpper,
      color: BEAK_DARK,
      section: { ngon: 5 },
      caps: { start: "flat", end: "point" },
      name: "beakUpperHook",
      group: "mouth",
    },
  );

  // Lower Beak Scoop & Inner Serrated Radula Tongue (built on jawLower)
  const lowerBeakOutline: OutlinePoint[] = [
    [0, -0.22, "sharp"],
    [0.21, -0.1],
    [0.16, 0.18],
    [0, 0.34, "sharp"],
    [-0.16, 0.18],
    [-0.21, -0.1],
  ];
  b.extrude(lowerBeakOutline, {
    at: [0, 1.15, 0.68],
    x: [1, 0, 0],
    y: [0, -0.45, 0.89],
    thickness: [0.18, 0.04],
    bevel: 0.018,
    smoothing: 1,
    color: gradient(BEAK_DARK, BEAK_EDGE, [0, 1.1, 0.6], [0, 1.28, 0.94]),
    bone: jawLower,
    name: "beakLowerMain",
    group: "mouth",
  });

  // Glowing bioluminescent inner mouth core & radula teeth
  glow(
    b.part(new THREE.SphereGeometry(0.16, 8, 6), AMBER_GLOW, {
      bone: jawLower,
      at: [0, 1.28, 0.66],
      name: "oralBioCore",
      group: "mouth",
    }),
    1.6,
  );

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.spike([s * 0.14, 1.42, 0.78], [s * 0.08, 1.24, 0.94], null, 0.045, {
      bone: jawUpper,
      color: ARMOR_WHITE,
      sides: 5,
      name: `upperFang${side}`,
      group: "mouth",
    });
    b.spike([s * 0.12, 1.16, 0.74], [s * 0.08, 1.32, 0.88], null, 0.04, {
      bone: jawLower,
      color: ARMOR_WHITE,
      sides: 5,
      name: `lowerFang${side}`,
      group: "mouth",
    });
  }

  // Pose jaws slightly open for an unmistakable predator silhouette
  b.pose(jawUpper, { axis: [1, 0, 0], deg: -10 });
  b.pose(jawLower, { axis: [1, 0, 0], deg: 14 });

  // ============================================================================
  // ARTICULATED SIPHON JET THRUSTER
  // ============================================================================
  b.sweep(
    catmull([
      [0, 2.08, -0.42],
      [0, 1.82, -0.74],
      [0, 1.54, -0.98],
    ]),
    [0.24, 0.16, 0.2],
    {
      bone: siphonJoint,
      color: slateArmorPaint,
      sides: 10,
      caps: { start: "round", end: "flat" },
      name: "siphonTube",
      group: "siphon",
    },
  );
  // Gold nozzle ring & glowing cyan jet interior
  b.lathe(
    [
      [0.12, 0],
      [0.23, 0],
      [0.25, 0.08],
      [0.14, 0.08],
    ],
    {
      at: [0, 1.54, -0.98],
      axis: [0, -0.55, -0.83],
      segments: 10,
      color: goldTrimPaint,
      bone: siphonJoint,
      name: "siphonNozzleRim",
      group: "siphon",
    },
  );
  glow(
    b.part(new THREE.CylinderGeometry(0.12, 0.08, 0.08, 8), CYAN_GLOW, {
      bone: siphonJoint,
      at: [0, 1.54, -0.98],
      dir: [0, -0.55, -0.83],
      name: "siphonJetGlow",
      group: "siphon",
    }),
    2.0,
  );

  // ============================================================================
  // MANTLE STABILIZER FINS & BIOLUMINESCENT FRILL CARDS
  // ============================================================================
  const finEdgeUpper = [
    [0.52, 4.18, -0.68],
    [1.22, 4.46, -0.94],
    [1.82, 4.52, -1.32],
  ];
  const finEdgeLower = [
    [0.58, 3.56, -0.48],
    [1.28, 3.84, -0.82],
    [1.82, 4.34, -1.28],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const fc = finChains[side];

    // Armored leading-edge strut along the fin chain
    b.sweep(fc, [0.11, 0.07, 0.025], {
      color: armorPaint,
      section: { ngon: 6 },
      name: `finStrut${side}`,
      group: `fin${side}`,
    });

    // Sleek wing membrane stretched between upper and lower fin curves
    const upPath = catmull(finEdgeUpper.map(([x, y, z]) => [s * x, y, z]));
    const loPath = catmull(finEdgeLower.map(([x, y, z]) => [s * x, y, z]));
    b.membrane(upPath, loPath, {
      bone: fc,
      color: membranePaint,
      thickness: 0.035,
      scallop: 0.14,
      name: `finBlade${side}`,
      group: `fin${side}`,
    });

    // Glowing cyan tip emitter on each mantle fin
    glow(
      b.spike(
        [s * 1.65, 4.38, -1.18],
        [s * 2.08, 4.62, -1.48],
        null,
        0.048,
        {
          bone: fc.joints[2],
          color: CYAN_GLOW,
          sides: 6,
          name: `finTipBeacon${side}`,
          group: `fin${side}`,
        },
      ),
      1.8,
    );
  }

  // Bioluminescent Lateral Fin-Frill Cards along both sides of the Mantle
  const frillFrames = [];
  for (const s of [1, -1] as const) {
    for (let k = 0; k < 6; k++) {
      const t = 0.48 + k * 0.085;
      const angle = s > 0 ? 275 : 85;
      frillFrames.push(mainBodyLoft.at(t, angle, 0.01));
    }
  }
  glow(
    b.cards(frillFrames, FIN_FRILL_CARD, {
      size: [0.28, 0.46],
      lean: 32,
      bend: 20,
      vary: 0.15,
      rng: rand,
      name: "mantleBioFrills",
      group: "mantle",
    }),
    1.3,
  );

  // ============================================================================
  // 8 SPREAD TENTACLES: TUBES, SUCKER RINGS, ARMOR CUFFS & DORSAL SPINES
  // ============================================================================
  const tentacleSweeps: Array<ReturnType<typeof b.sweep>> = [];

  for (let idx = 0; idx < tentacleChains.length; idx++) {
    const { spec, chain, dirX, dirZ } = tentacleChains[idx];
    const r0 = spec.rootR;

    const tSweep = b.sweep(
      chain,
      (t) => {
        const r = r0 * (1 - 0.72 * Math.pow(t, 0.85)) + 0.022 * (1 - t);
        return [r * 1.06, r * 0.94];
      },
      {
        color: tentaclePaint,
        sides: 10,
        caps: { start: "round", end: "point" },
        name: `${spec.name}Tube`,
        group: spec.name,
      },
    );
    tentacleSweeps.push(tSweep);

    // Overwatch Hydro-Armor Cuff Band around the muscular tentacle base (t = 0.24)
    const cuffFrame = chain.at(0.24);
    const cuffRing = b.ring(cuffFrame, {
      count: 8,
      radius: r0 * 0.86,
    });
    b.sweep(
      catmull(cuffRing.items.map((it) => it.at), { closed: true }),
      0.036,
      {
        bone: chain.joints[1],
        color: armorPaint,
        section: { ngon: 6 },
        name: `${spec.name}ArmorCuff`,
        group: spec.name,
      },
    );

    // Glowing Cyan Energy Node on top of each armor cuff
    const cuffTop = tSweep.at(0.24, 0, 0.025);
    glow(
      b.stick(
        new THREE.BoxGeometry(0.08, 0.045, 0.12),
        CYAN_GLOW,
        cuffTop,
        {
          bone: chain.joints[1],
          embed: 0.2,
          name: `${spec.name}CuffGlow`,
          group: spec.name,
        },
      ),
      1.8,
    );

    // Paired staggered Cephalopod Suckers along the ventral/inner side of each tentacle
    const suckerCount = 9;
    for (let k = 0; k < suckerCount; k++) {
      const t = 0.14 + (k / (suckerCount - 1)) * 0.74;
      const sideSign = k % 2 === 0 ? 1 : -1;
      const clockDeg = 180 + sideSign * 24;
      const hit = tSweep.at(t, clockDeg, -0.005);
      const sr = (0.058 * (1 - 0.62 * t));

      // Cupped sucker ring
      b.stick(
        new THREE.CylinderGeometry(sr, sr * 0.72, sr * 0.65, 8),
         k % 3 === 0 ? GOLD_TRIM : CORAL_PALE,
        hit,
        {
          embed: 0.35,
          name: `${spec.name}Sucker${k + 1}`,
          group: spec.name,
        },
      );
    }

    // Dorsal Chitin / Hydro-Spines along the outer ridge of the tentacle
    for (let k = 0; k < 4; k++) {
      const t = 0.34 + k * 0.16;
      const dorsalHit = tSweep.at(t, 0, -0.005);
      const spLen = 0.14 * (1 - 0.45 * t);
      const spR = 0.038 * (1 - 0.4 * t);
      b.spike(
        dorsalHit,
        [dirX * 0.5, 0.85, dirZ * 0.5],
        spLen,
        spR,
        {
          color: k === 3 ? CYAN_GLOW : slateArmorPaint,
          sides: 5,
          name: `${spec.name}Spine${k + 1}`,
          group: spec.name,
        },
      );
    }
  }

  // Inter-tentacle Basal Webbing Membranes linking all 8 spread arms around the oral umbrella
  for (let i = 0; i < tentacleChains.length; i++) {
    const next = (i + 1) % tentacleChains.length;
    const edgeA = tentacleChains[i].chain.path.slice(0.02, 0.34);
    const edgeB = tentacleChains[next].chain.path.slice(0.02, 0.34);
    b.membrane(edgeA, edgeB, {
      bone: pelvis,
      color: membranePaint,
      thickness: 0.025,
      scallop: 0.22,
      rows: 4,
      cols: 5,
      name: `umbrellaWeb${i + 1}`,
      group: "webbing",
    });
  }

  // ============================================================================
  // 2 RAPTURE HUNTING CLUB TENTACLES (Raised High & Wide with Glowing Bio-Blades)
  // ============================================================================
  for (const { side, s, chain } of clubChains) {
    const cSweep = b.sweep(
      chain,
      (t) => {
        // Slender stalk swelling into a broad muscular club at t = 0.72..0.92
        const stalk = 0.14 * (1 - 0.35 * t);
        const clubBulge = Math.exp(-Math.pow((t - 0.82) / 0.13, 2)) * 0.16;
        return [stalk + clubBulge * 1.35, stalk + clubBulge * 0.75];
      },
      {
        color: tentaclePaint,
        sides: 10,
        caps: { start: "round", end: "point" },
        name: `clubSweep${side}`,
        group: `club${side}`,
      },
    );

    const wristJoint = chain.joints[3];
    const tipJoint = chain.joints[4];

    // Overwatch Armored Gauntlet Clasp at the base of the club head
    const wristPt = chain.at(0.66);
    const wristRing = b.ring(wristPt, { count: 8, radius: 0.15 });
    b.sweep(
      catmull(wristRing.items.map((it) => it.at), { closed: true }),
      0.034,
      {
        bone: wristJoint,
        color: goldTrimPaint,
        section: { ngon: 6 },
        name: `clubWristCollar${side}`,
        group: `club${side}`,
      },
    );

    // Twin Lateral Plasma-Fin Blades on the Hunting Club Head
    const bladeOutline: OutlinePoint[] = [
      [0, -0.36, "sharp"],
      [0.28, -0.12],
      [0.36, 0.22, "sharp"],
      [0.14, 0.48, "sharp"],
      [0, 0.32],
    ];
    for (const bladeSign of [1, -1] as const) {
      const bTag = bladeSign > 0 ? "Outer" : "Inner";
      const clubMid = cSweep.at(0.82, bladeSign > 0 ? 90 : 270, -0.02);
      glow(
        b.extrude(bladeOutline, {
          at: clubMid.at,
          x: clubMid.n,
          y: clubMid.tangent,
          thickness: [0.045, 0.008],
          bevel: 0.01,
          smoothing: 1,
          color: bladeSign > 0 ? CYAN_GLOW : ARMOR_WHITE,
          bone: tipJoint,
          name: `clubBlade${side}${bTag}`,
          group: `club${side}`,
        }),
        bladeSign > 0 ? 1.7 : 1.0,
      );
    }

    // 4 Hooked Rapture Talons on the inner striking face of the club
    for (let h = 0; h < 4; h++) {
      const ht = 0.72 + h * 0.065;
      const hookBase = cSweep.at(ht, 180, 0);
      b.sweep(
        polyline([
          hookBase.at,
          offset(hookBase.at, hookBase.n, 0.09),
          offset(
            offset(hookBase.at, hookBase.n, 0.15),
            [-s * 0.6, -0.5, 0.5],
            0.09,
          ),
        ]),
        [0.036, 0.006],
        {
          bone: tipJoint,
          color: GOLD_TRIM,
          sides: 5,
          caps: { start: "flat", end: "point" },
          name: `clubHook${side}${h + 1}`,
          group: `club${side}`,
        },
      );
    }

    // Glowing Amber Bio-Lure Core in the center of the club paddle
    const clubCoreHit = cSweep.at(0.84, 0, 0.015);
    glow(
      b.stick(
        new THREE.OctahedronGeometry(0.085, 0),
        AMBER_GLOW,
        clubCoreHit,
        {
          bone: tipJoint,
          embed: 0.25,
          flat: true,
          name: `clubBioCore${side}`,
          group: `club${side}`,
        },
      ),
      2.0,
    );
  }

  // ============================================================================
  // SCATTERED BIOLUMINESCENT MANTLE NODES & ABYSSAL BARNACLES
  // ============================================================================
  const mantleSurface = b.surface(mainBodyLoft);
  const bioHits = mantleSurface.scatter(24, {
    rng: rng(303),
    minDist: 0.28,
    filter: (h) => h.at.y > 2.65 && h.n.y > -0.25,
  });

  bioHits.forEach((hit, i) => {
    const isAmber = i % 4 === 0;
    const nodeR = 0.038 + (i % 3) * 0.012;
    // Armored socket ring
    b.stick(
      new THREE.CylinderGeometry(nodeR * 1.35, nodeR * 1.5, 0.026, 6),
      ARMOR_SLATE,
      hit,
      {
        embed: 0.4,
        flat: true,
        name: `bioSocket${i + 1}`,
        group: "mantle",
      },
    );
    // Glowing crystal node
    glow(
      b.stick(
        new THREE.OctahedronGeometry(nodeR, 0),
        isAmber ? AMBER_GLOW : CYAN_SOFT,
        hit,
        {
          embed: 0.1,
          flat: true,
          name: `bioNode${i + 1}`,
          group: "mantle",
        },
      ),
      1.7,
    );
  });

  // Slight heroic forward pitch on the head so the eyes & brow lock onto the viewer
  b.pose(head, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
