// Peacock Mantis Shrimp (Odontodactylus scyllarus), 0.6 m hero prop.
// A vivid, marine stomatopod with an emerald-and-cyan segmented carapace and abdomen,
// stalked compound eyes with banded midbands, 3-branched antennules, glowing antennal scales,
// folded raptorial dactyl clubs and propodi ready to strike, orange-red walking legs,
// swimmerets (pleopods), and a flamboyant fan-shaped uropod/telson tail.
import {
  BoxGeometry,
  CylinderGeometry,
  PlaneGeometry,
  SphereGeometry,
} from "three";
import { createBuilder } from "../src/builder";
import { DEG, mid } from "../src/math";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Peacock Mantis Shrimp",
  builtBy: "Gemini 3.8 Flash",
  description:
    "A 0.6 m hero peacock mantis shrimp (Odontodactylus scyllarus): vivid turquoise-green carapace with leopard spots, stalked banded compound eyes, folded raptorial club appendages, orange walking legs and swimmerets, and an iridescent fringed tail fan.",
};

// ===============================================================================================
// Palette: peacock mantis shrimp is famous for spectacular neon coloration.
// ===============================================================================================
const EMERALD = "#0b734e";
const TEAL_BRIGHT = "#00d2c4";
const DEEP_BLUE = "#0d2b6b";
const ROYAL_BLUE = "#1a4fd8";
const ELECTRIC_CYAN = "#26ffff";
const ORANGE_RED = "#ff4d1a";
const FIRE_ORANGE = "#ff7700";
const SUN_YELLOW = "#ffcc00";
const CREAM = "#f5f0d8";
const LEOPARD_SPOT = "#141210";
const LEOPARD_RING = "#dbe2e8";
const DACTYL_CLUB = "#f2f4f7";
const DACTYL_RED = "#d82418";
const SHELL_BORDER = "#e63946";
const BELLY_CREAM = "#d9ebdf";

export default function build() {
  const b = createBuilder({ name: "mantisShrimp" });

  // ---------------------------------------------------------------------------------------------
  // Paints and Patterns
  // ---------------------------------------------------------------------------------------------

  // Carapace paint: Emerald green dorsal shell, vivid leopard spots on white lower flank margins,
  // red posterior trim.
  const carapacePaint = paint((p, _n, _s) => {
    const lat = Math.abs(p.x);
    // Lower lateral margin with distinct leopard spots
    if (lat > 0.038 && p.y < 0.14) {
      const u = p.z * 70;
      const v = p.y * 80;
      const sp = Math.sin(u) * Math.sin(v) + Math.cos(u * 1.5 + v * 0.7) * 0.3;
      if (sp > 0.45) return LEOPARD_SPOT;
      if (sp > 0.2) return LEOPARD_RING;
      return CREAM;
    }
    // Red edge trim at rear of carapace
    if (p.z < 0.015 && p.z > -0.005) {
      return SHELL_BORDER;
    }
    // Dorsal fine mottling / cyan highlights
    const ripple = Math.sin(p.z * 110) * Math.cos(p.x * 120);
    if (ripple > 0.45) return TEAL_BRIGHT;
    return EMERALD;
  });

  // Abdomen tergite paint: Emerald green with distinct bright turquoise transverse bands and orange-red posterior rims
  const tergitePaint = paint((p, n, _s) => {
    // Underbelly shading
    if (n.y < -0.4) return BELLY_CREAM;
    const band = ((p.z * 35) % 1 + 1) % 1;
    if (band > 0.84) return SHELL_BORDER; // Red posterior margin on each segment
    if (band > 0.68) return ELECTRIC_CYAN; // Bright cyan transverse stripe
    if (Math.abs(n.x) > 0.6) return TEAL_BRIGHT; // Bright flanks
    return EMERALD;
  });

  // Tail fan / uropod paint: Royal blue center fading to electric cyan with fiery orange/yellow setae fringe
  const tailFanPaint = paint((p, _n, _s) => {
    const r = Math.hypot(p.x, p.z - (-0.26));
    if (r > 0.11) return FIRE_ORANGE;
    if (r > 0.08) return SUN_YELLOW;
    if (r > 0.045) return ELECTRIC_CYAN;
    return ROYAL_BLUE;
  });

  // ---------------------------------------------------------------------------------------------
  // SKELETON: Core Spine, Thorax, Abdomen, and Telson
  // ---------------------------------------------------------------------------------------------
  const core = b.joint("core", { at: [0, 0.135, 0.06], role: "spine", group: "body" });

  // Carapace / Thorax forward chain
  const thoraxPath = catmull([
    [0, 0.135, 0.06],
    [0, 0.138, 0.13],
    [0, 0.132, 0.20],
  ]);
  const thorax = b.chain("thorax", thoraxPath, {
    parent: core,
    names: ["thorax1", "thorax2"],
    role: "spine",
    group: "carapace",
  });

  // Cephalon / Head at the front of the carapace
  const head = b.joint("head", {
    parent: thorax.joints[1],
    at: [0, 0.128, 0.22],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  // Mouthparts: Upper rostrum and lower jaw/maxillipeds
  const rostrum = b.joint("rostrum", {
    parent: head,
    at: head.local([0, 0.015, 0.02]),
    dir: [0, 0.05, 1],
    role: "head",
    group: "mouth",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, -0.025, 0.01]),
    dir: [0, -0.3, 1],
    role: "jaw",
    group: "mouth",
  });

  // Abdomen backward chain (6 distinct somites)
  const abdomenPath = catmull([
    [0, 0.135, 0.06],
    [0, 0.132, 0.00],
    [0, 0.126, -0.06],
    [0, 0.118, -0.12],
    [0, 0.106, -0.18],
    [0, 0.092, -0.24],
    [0, 0.076, -0.29],
  ]);
  const abdomen = b.chain("abdomen", abdomenPath, {
    parent: core,
    names: ["ab1", "ab2", "ab3", "ab4", "ab5", "ab6"],
    role: "tail",
    group: "abdomen",
  });

  // Telson (the heavily armored, spiked tail shield)
  const telson = b.joint("telson", {
    parent: abdomen.joints[5],
    at: [0, 0.074, -0.30],
    dir: [0, -0.2, -1],
    role: "tail",
    group: "tail",
  });

  // ---------------------------------------------------------------------------------------------
  // CARAPACE (Dorsal Shield & Thoracic Somites)
  // ---------------------------------------------------------------------------------------------
  const carapaceStations = [
    { at: [0, 0.125, 0.21] as [number, number, number], w: 0.076, h: 0.052 },
    { at: [0, 0.135, 0.17] as [number, number, number], w: 0.096, h: 0.066 },
    { at: [0, 0.140, 0.11] as [number, number, number], w: 0.106, h: 0.072 },
    { at: [0, 0.138, 0.05] as [number, number, number], w: 0.110, h: 0.075 },
    { at: [0, 0.132, 0.00] as [number, number, number], w: 0.112, h: 0.073 },
  ];
  b.loft(carapaceStations, {
    bone: [thorax.joints[0], thorax.joints[1], core],
    color: carapacePaint,
    group: "carapace",
  });

  // Rostral plate (hinged flat shield over base of eyestalks)
  b.extrude(
    [
      [0, 0],
      [0.016, 0.014],
      [0.010, 0.035, "sharp"],
      [0, 0.042, "sharp"],
      [-0.010, 0.035, "sharp"],
      [-0.016, 0.014],
    ],
    {
      at: rostrum.at,
      x: [1, 0, 0],
      y: [0, 0.25, 0.96],
      thickness: 0.005,
      bevel: 0.001,
      color: EMERALD,
      bone: rostrum,
      group: "head",
    }
  );

  // ---------------------------------------------------------------------------------------------
  // EYES: Stomatopod Compound Eyes
  // ---------------------------------------------------------------------------------------------
  const EYE_TEX = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <radialGradient id="amber" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffe266"/>
          <stop offset="70%" stop-color="#e59b24"/>
          <stop offset="100%" stop-color="#804d00"/>
        </radialGradient>
      </defs>
      <!-- Base amber ommatidia hemispheres -->
      <rect width="128" height="128" fill="url(#amber)"/>
      <!-- The famous 6-row Midband across the equator -->
      <rect y="48" width="128" height="32" fill="#14110e"/>
      <line x1="0" y1="53" x2="128" y2="53" stroke="#26ffff" stroke-width="2.5"/>
      <line x1="0" y1="59" x2="128" y2="59" stroke="#ff4d1a" stroke-width="2.5"/>
      <line x1="0" y1="65" x2="128" y2="65" stroke="#ffcc00" stroke-width="2.5"/>
      <line x1="0" y1="71" x2="128" y2="71" stroke="#26ffff" stroke-width="2.5"/>
      <!-- Ommatidial facet glints -->
      <circle cx="28" cy="26" r="4" fill="#ffffff" opacity="0.5"/>
      <circle cx="98" cy="26" r="4" fill="#ffffff" opacity="0.5"/>
      <circle cx="64" cy="102" r="4" fill="#ffffff" opacity="0.4"/>
    </svg>`,
    { size: 256 }
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeSocket = head.local([s * 0.022, 0.012, 0.015]);

    // Eyestalk chain
    const stalkPath = catmull([
      eyeSocket,
      head.local([s * 0.034, 0.038, 0.035]),
      head.local([s * 0.042, 0.065, 0.055]),
    ]);
    const eyeStalk = b.chain(`eyeStalk${side}`, stalkPath, {
      parent: head,
      names: [`eyeBase${side}`, `eyeTip${side}`],
      role: "head",
      group: `eye${side}`,
    });

    // Stalk tube
    b.sweep(eyeStalk, (t) => 0.008 - 0.0015 * t, {
      color: EMERALD,
      group: `eye${side}`,
    });

    const eyeTipJoint = eyeStalk.joints[1];
    const gazeDir = head.dir([s * 0.35, 0.15, 0.92]).normalize();

    b.part(
      new SphereGeometry(0.018, 16, 12),
      "#ffffff",
      {
        bone: eyeTipJoint,
        at: eyeTipJoint.at,
        dir: gazeDir,
        axis: "z",
        texture: EYE_TEX,
        scale: [1.1, 1.25, 0.95],
        group: `eye${side}`,
      }
    );

    // Stalk base ring collar
    b.part(new CylinderGeometry(0.010, 0.011, 0.006, 10), SHELL_BORDER, {
      bone: eyeStalk.joints[0],
      at: eyeSocket,
      dir: [s * 0.3, 0.5, 0.4],
      group: `eye${side}`,
    });
  }

  // ---------------------------------------------------------------------------------------------
  // ANTENNAE & ANTENNAL SCALES
  // ---------------------------------------------------------------------------------------------
  const SCALE_TEX = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 256">
      <defs>
        <linearGradient id="scaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#26ffff"/>
          <stop offset="35%" stop-color="#1a4fd8"/>
          <stop offset="70%" stop-color="#0a7a52"/>
          <stop offset="100%" stop-color="#ff7700"/>
        </linearGradient>
      </defs>
      <!-- Flattened oval scale body -->
      <path d="M 64 8 C 110 30 122 120 108 210 C 95 245 64 252 64 252 C 64 252 33 245 20 210 C 6 120 18 30 64 8 Z" fill="url(#scaleGrad)" stroke="#ff4d1a" stroke-width="5"/>
      <!-- Setae fringe rays -->
      <path d="M 12 160 L 0 170 M 8 180 L -3 192 M 16 200 L 4 216 M 25 220 L 16 238 M 38 238 L 32 254" stroke="#ff7700" stroke-width="4" stroke-linecap="round"/>
      <path d="M 116 160 L 128 170 M 120 180 L 131 192 M 112 200 L 124 216 M 103 220 L 112 238 M 90 238 L 96 254" stroke="#ff7700" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const antBase = head.local([s * 0.018, -0.008, 0.022]);

    const scaleJoint = b.joint(`antScale${side}`, {
      parent: head,
      at: antBase,
      dir: [s * 0.7, -0.1, 0.7],
      role: "head",
      group: `antenna${side}`,
    });

    b.part(
      new PlaneGeometry(0.042, 0.088),
      "#ffffff",
      {
        bone: scaleJoint,
        at: scaleJoint.local([s * 0.032, 0.005, 0.040]),
        dir: [s * 0.7, -0.1, 0.7],
        axis: "z",
        texture: SCALE_TEX,
        group: `antenna${side}`,
      }
    );

    // 3-branched Antennule Flagella: Main flagellum, dorsal branch, lateral branch
    const flagellaConfigs = [
      { name: "Main", dir: [s * 0.035, 0.035, 0.09], mid: [s * 0.055, 0.075, 0.16], tip: [s * 0.075, 0.115, 0.23] },
      { name: "Med", dir: [s * 0.025, 0.045, 0.08], mid: [s * 0.038, 0.095, 0.15], tip: [s * 0.045, 0.145, 0.21] },
      { name: "Lat", dir: [s * 0.045, 0.025, 0.08], mid: [s * 0.070, 0.055, 0.15], tip: [s * 0.095, 0.085, 0.21] },
    ];

    for (let fIdx = 0; fIdx < flagellaConfigs.length; fIdx++) {
      const cfg = flagellaConfigs[fIdx];
      const whipPath = catmull([
        antBase,
        head.local(cfg.dir as [number, number, number]),
        head.local(cfg.mid as [number, number, number]),
        head.local(cfg.tip as [number, number, number]),
      ]);
      const whip = b.chain(`antennule${side}${cfg.name}`, whipPath, {
        parent: head,
        count: 2,
        names: [`ant1${side}${cfg.name}`, `ant2${side}${cfg.name}`],
        role: "head",
        group: `antenna${side}`,
      });
      b.sweep(whip, [0.003, 0.0008], {
        color: FIRE_ORANGE,
        group: `antenna${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------------------------
  // MOUTHPARTS & MAXILLIPEDS
  // ---------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const jawPos = jaw.local([s * 0.010, -0.005, 0.012]);

    const mxPath = catmull([
      jawPos,
      jaw.local([s * 0.018, -0.020, 0.025]),
      jaw.local([s * 0.012, -0.038, 0.038]),
    ]);
    b.sweep(mxPath, [0.0035, 0.0018], {
      bone: jaw,
      color: FIRE_ORANGE,
      group: "mouth",
    });

    b.part(new BoxGeometry(0.005, 0.012, 0.003), SUN_YELLOW, {
      bone: jaw,
      at: jaw.local([s * 0.012, -0.035, 0.036]),
      dir: [s * 0.2, -0.8, 0.4],
      group: "mouth",
    });
  }

  // ---------------------------------------------------------------------------------------------
  // RAPTORIAL APPENDAGES (The famous "Smashers")
  // ---------------------------------------------------------------------------------------------
  // Merus originates under anterior carapace, slopes DOWN and FORWARD.
  // Propodus flexes BACKWARD and UPWARD.
  // Dactyl club sits at the wrist ready to strike forward.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPt: [number, number, number] = [s * 0.040, 0.105, 0.16];
    const elbowPt: [number, number, number] = [s * 0.056, 0.055, 0.20];
    const wristPt: [number, number, number] = [s * 0.048, 0.082, 0.12];
    const dactylTipPt: [number, number, number] = [s * 0.036, 0.058, 0.07];

    const arm = b.chain(`raptorial${side}`, [shoulderPt, elbowPt, wristPt, dactylTipPt], {
      parent: thorax.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });

    const [shoulderJ, elbowJ, wristJ] = arm.joints;

    // Segment 1: Merus (broad, flattened, heavily calcified emerald plate)
    b.capsule(shoulderJ.at, elbowJ.at, [0.015, 0.013], {
      bone: shoulderJ,
      color: EMERALD,
      group: `arm${side}`,
    });

    // Outer warning streak on merus
    b.part(new BoxGeometry(0.004, 0.035, 0.006), FIRE_ORANGE, {
      bone: shoulderJ,
      at: mid(shoulderJ.at, elbowJ.at),
      dir: [s * 1, 0, 0],
      axis: "x",
      group: `arm${side}`,
    });

    // Segment 2: Propodus (orange-red armored striking base)
    b.capsule(elbowJ.at, wristJ.at, [0.014, 0.016], {
      bone: elbowJ,
      color: ORANGE_RED,
      group: `arm${side}`,
    });

    // Segment 3: The Dactyl Club (hardened ceramic-like white impact bulb with red/crimson gradient)
    const clubPt = wristJ.local([s * 0.006, 0.005, 0.015]);
    const dactylClubMesh = new SphereGeometry(0.016, 14, 10);
    b.part(dactylClubMesh, DACTYL_CLUB, {
      bone: wristJ,
      at: clubPt,
      scale: [1.1, 1.25, 1.1],
      dir: [0, 0.2, 0.98],
      group: `arm${side}`,
    });

    // Dactyl sharp fold-back spike (recurved tip tucked along propodus)
    b.spike(clubPt, wristJ.local([0, -0.018, -0.025]), 0.028, 0.005, {
      bone: wristJ,
      color: DACTYL_RED,
      group: `arm${side}`,
    });
  }

  // ---------------------------------------------------------------------------------------------
  // WALKING LEGS (Pereiopods: 3 pairs)
  // ---------------------------------------------------------------------------------------------
  // Slender, 3-segmented, bright orange walking legs emerging from thoracic sternites.
  // Tip contacts the ground exactly at y = 0.0055, small claw extends down to y = 0.000.
  const legZ = [0.07, 0.02, -0.03];
  for (let i = 0; i < 3; i++) {
    const zPos = legZ[i];
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hipPt: [number, number, number] = [s * 0.040, 0.078, zPos];
      const kneePt: [number, number, number] = [s * (0.092 + i * 0.008), 0.088, zPos + 0.01];
      const anklePt: [number, number, number] = [s * (0.122 + i * 0.010), 0.042, zPos - 0.01];
      const footPt: [number, number, number] = [s * (0.142 + i * 0.012), 0.0055, zPos - 0.02];

      const legChain = b.chain(`leg${side}${i + 1}`, [hipPt, kneePt, anklePt, footPt], {
        parent: core,
        names: [`hip${side}${i + 1}`, `knee${side}${i + 1}`, `ankle${side}${i + 1}`],
        role: "leg",
        group: `legs`,
        contact: [footPt[0], 0, footPt[2]],
      });

      // Tapered slender segments
      b.sweep(legChain, (t) => 0.0050 - 0.0025 * t, {
        color: ORANGE_RED,
        caps: "round",
        group: "legs",
      });

      // Small yellow dactyl claw at tip resting on y = 0
      b.part(new BoxGeometry(0.003, 0.004, 0.008), SUN_YELLOW, {
        bone: legChain.joints[2],
        at: [footPt[0], 0.0042, footPt[2]],
        dir: [0, -0.2, -1],
        group: "legs",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------
  // ABDOMEN SEGMENTS (Tergites & Pleurites)
  // ---------------------------------------------------------------------------------------------
  const abRadii = [
    [0.052, 0.038],
    [0.050, 0.036],
    [0.047, 0.034],
    [0.043, 0.031],
    [0.039, 0.028],
    [0.035, 0.025],
  ];

  b.sweep(abdomen, (t) => {
    const idx = Math.min(Math.floor(t * 6), 5);
    return abRadii[idx] as [number, number];
  }, {
    bone: abdomen,
    color: tergitePaint,
    group: "abdomen",
  });

  // Lateral pleura flanges (plates protecting the swimmerets)
  for (let i = 0; i < 6; i++) {
    const joint = abdomen.joints[i];
    for (const s of [1, -1]) {
      const pleuronPt = joint.local([s * 0.044, -0.01, 0]);
      b.extrude(
        [
          [0, 0],
          [0.015, -0.016],
          [0.011, -0.028, "sharp"],
          [-0.012, -0.026, "sharp"],
          [-0.015, -0.010],
        ],
        {
          at: pleuronPt,
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.004,
          bevel: 0.001,
          color: EMERALD,
          bone: joint,
          group: "abdomen",
        }
      );
    }
  }

  // ---------------------------------------------------------------------------------------------
  // SWIMMERETS (Pleopods with feathery filamentous gills)
  // ---------------------------------------------------------------------------------------------
  for (let i = 0; i < 5; i++) {
    const joint = abdomen.joints[i];
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const pleoBase = joint.local([s * 0.020, -0.030, 0]);
      const pleoTip = joint.local([s * 0.032, -0.055, -0.015]);

      const pleoJoint = b.joint(`pleopod${side}${i + 1}`, {
        parent: joint,
        at: pleoBase,
        dir: [s * 0.3, -0.8, -0.4],
        role: "leg",
        group: "swimmerets",
      });

      b.capsule(pleoBase, pleoTip, [0.0045, 0.003], {
        bone: pleoJoint,
        color: FIRE_ORANGE,
        group: "swimmerets",
      });

      b.part(new BoxGeometry(0.016, 0.026, 0.002), SUN_YELLOW, {
        bone: pleoJoint,
        at: mid(pleoBase, pleoTip),
        dir: [s * 0.4, -0.8, -0.3],
        axis: "y",
        group: "swimmerets",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------
  // TAIL FAN: Telson and Uropods
  // ---------------------------------------------------------------------------------------------
  // Telson Central Shield
  b.loft(
    [
      { at: [0, 0.075, -0.28] as [number, number, number], w: 0.062, h: 0.022 },
      { at: [0, 0.070, -0.32] as [number, number, number], w: 0.075, h: 0.020 },
      { at: [0, 0.064, -0.36] as [number, number, number], w: 0.058, h: 0.016 },
      { at: [0, 0.060, -0.39] as [number, number, number], w: 0.024, h: 0.009 },
    ],
    {
      bone: telson,
      color: tailFanPaint,
      group: "tail",
    }
  );

  // Dorsal Carinae (raised sculptured ridges on the telson)
  for (const s of [0, 0.013, -0.013]) {
    const ridgePath = catmull([
      [s, 0.082, -0.29],
      [s * 1.2, 0.077, -0.33],
      [s * 1.1, 0.071, -0.37],
    ]);
    b.sweep(ridgePath, [0.0028, 0.0014], {
      bone: telson,
      color: ELECTRIC_CYAN,
      group: "tail",
    });
  }

  // Sharp marginal teeth on telson rear rim
  for (let angle = -60; angle <= 60; angle += 20) {
    const rad = angle * DEG;
    const rimX = Math.sin(rad) * 0.036;
    const rimZ = -0.35 - Math.cos(rad) * 0.040;
    const rimY = 0.063;
    const spineTip: [number, number, number] = [rimX * 1.25, rimY - 0.004, rimZ - 0.020];
    b.spike([rimX, rimY, rimZ], spineTip, 0.020, 0.0035, {
      bone: telson,
      color: SHELL_BORDER,
      group: "tail",
    });
  }

  // Uropods (Left & Right Fan Paddles)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const uropodBase = telson.local([s * 0.030, -0.005, 0.018]);

    const uropodJoint = b.joint(`uropod${side}`, {
      parent: telson,
      at: uropodBase,
      dir: [s * 0.7, -0.15, -0.7],
      role: "tail",
      group: "tail",
    });

    const protoEnd = uropodJoint.local([s * 0.032, -0.008, -0.028]);
    b.capsule(uropodBase, protoEnd, [0.009, 0.006], {
      bone: uropodJoint,
      color: DEEP_BLUE,
      group: "tail",
    });

    b.spike(protoEnd, uropodJoint.local([s * 0.042, -0.016, -0.055]), 0.032, 0.0038, {
      bone: uropodJoint,
      color: ELECTRIC_CYAN,
      group: "tail",
    });

    const exopodOutline = [
      [0, 0],
      [0.020, -0.028],
      [0.030, -0.065, "sharp"],
      [0.016, -0.095, "sharp"],
      [-0.008, -0.085],
      [-0.016, -0.038],
    ] as const;
    b.extrude(exopodOutline, {
      at: protoEnd,
      x: [s * 0.8, 0, -0.6],
      y: [0, 0.4, -0.9],
      thickness: 0.004,
      bevel: 0.001,
      color: tailFanPaint,
      bone: uropodJoint,
      group: "tail",
    });

    const endopodOutline = [
      [0, 0],
      [0.014, -0.024],
      [0.020, -0.055, "sharp"],
      [0.009, -0.075, "sharp"],
      [-0.009, -0.055],
      [-0.011, -0.028],
    ] as const;
    b.extrude(endopodOutline, {
      at: uropodJoint.local([s * 0.018, -0.004, -0.018]),
      x: [s * 0.5, 0, -0.85],
      y: [0, 0.3, -0.95],
      thickness: 0.003,
      bevel: 0.001,
      color: tailFanPaint,
      bone: uropodJoint,
      group: "tail",
    });
  }

  return b.root;
}
