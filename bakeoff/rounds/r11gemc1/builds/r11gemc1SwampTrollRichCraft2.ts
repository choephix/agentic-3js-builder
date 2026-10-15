import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  limb,
  paint,
  noise,
  mix,
  smoothstep,
  rgb,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "swamp_troll",
  description:
    "A Warcraft-inspired swamp troll witch doctor with towering ivory tusks, blazing flame mohawk, bog-beast skull pauldron, bone fetishes, and a voodoo soul staff on a murky bayou mound.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "swamp_troll" });

  // ---------------------------------------------------------------------------
  // 1. PALETTE & PAINTS (Blizzard / Warcraft Stylized Look)
  // ---------------------------------------------------------------------------

  const SKIN_BASE = "#286857";
  const SKIN_LIGHT = "#4da38b";
  const SKIN_SHADOW = "#142d25";
  const SKIN_BELLY = "#6db598";
  const WARPAINT_RED = "#a82018";

  // Troll skin: mottled mossy teal with pale belly countershading & deliberate ritual warpaint
  const trollSkin = paint((p, n) => {
    const gn = noise(p, 0.14, 11);
    let c = mix(SKIN_BASE, SKIN_LIGHT, smoothstep(0.3, 0.7, gn));

    // Belly & inner throat countershading
    if (n.y < 0.25 && n.z > -0.2) {
      const bellyFactor = smoothstep(0.25, -0.4, n.y) * smoothstep(-0.2, 0.4, n.z);
      c = mix(c, rgb(SKIN_BELLY), bellyFactor * 0.7);
    }

    // Crease and underside shadows
    if (n.y < -0.3) {
      c = mix(c, rgb(SKIN_SHADOW), 0.55);
    }

    // Mud stains near feet and lower legs
    if (p.y < 0.45) {
      const mud = smoothstep(0.45, 0.1, p.y);
      c = mix(c, rgb("#1c1712"), mud * 0.6);
    }

    // Ritual tribal warpaint across chest/shoulders: angled tribal slashes
    if (p.y > 1.25 && p.y < 1.85 && n.z > 0.05) {
      const slash1 = Math.sin((p.x * 0.8 + p.y) * 16);
      const slash2 = Math.sin((p.x * -0.8 + p.y) * 14);
      if (Math.abs(slash1) > 0.91 || (p.y > 1.55 && Math.abs(slash2) > 0.92)) {
        c = mix(c, rgb(WARPAINT_RED), 0.9);
      }
    }

    // Warpaint eye mask across bridge of nose
    if (p.y > 1.72 && p.y < 1.88 && p.z > 0.32 && Math.abs(p.x) < 0.14) {
      c = mix(c, rgb(WARPAINT_RED), 0.88);
    }

    return c;
  });

  // Mohawk paint: deep burgundy root -> blazing crimson -> flame orange -> electric yellow tip
  const mohawkPaint = paint((p) => {
    const t = smoothstep(1.78, 2.44, p.y + p.z * 0.3);
    if (t < 0.28) return mix("#540810", "#c41a1a", t / 0.28);
    if (t < 0.68) return mix("#c41a1a", "#ff5a00", (t - 0.28) / 0.4);
    return mix("#ff5a00", "#ffea00", (t - 0.68) / 0.32);
  });

  // Aged ivory & bone paint with dark tarnish in crevices
  const BONE_BASE = "#ded4b8";
  const BONE_TIP = "#f5f0db";
  const BONE_STAIN = "#543d28";
  const bonePaint = paint((p, n) => {
    const gn = noise(p, 0.05, 9);
    let c = mix(BONE_BASE, BONE_TIP, gn);
    if (n.y < -0.2) c = mix(c, rgb(BONE_STAIN), 0.5);
    return c;
  });

  // Bog wood bark for staff
  const BARK_BASE = "#2a1e15";
  const BARK_LIGHT = "#443224";
  const woodBark = paint((p) => {
    const gn = noise(p, 0.06, 17);
    return mix(BARK_BASE, BARK_LIGHT, gn);
  });

  // Flat accent colours
  const GOLD_BRASS = "#d49b28";
  const LEATHER_DARK = "#291b12";
  const LEATHER_MED = "#473121";
  const RAG_CLOTH = "#39452b";
  const CLAW_BLACK = "#151310";
  const SWAMP_MUD = "#1a1510";
  const SWAMP_MOSS = "#334522";
  const SWAMP_WATER = "#0d1f14";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES & DECALS (SVG)
  // ---------------------------------------------------------------------------

  const TRIBAL_SYMBOL = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 10 L94 48 L82 108 L64 120 L46 108 L34 48 Z" fill="#ded4b8" stroke="#23170e" stroke-width="4"/>
      <circle cx="50" cy="54" r="8" fill="#8f1c16"/>
      <circle cx="78" cy="54" r="8" fill="#8f1c16"/>
      <path d="M46 84 L64 96 L82 84" stroke="#8f1c16" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M44 30 L24 16 M84 30 L104 16" stroke="#ded4b8" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const TIKI_FACE = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="20" fill="#382315"/>
      <polygon points="24,42 58,54 28,64" fill="#ffaa00"/>
      <polygon points="104,42 70,54 100,64" fill="#ffaa00"/>
      <polygon points="64,34 54,76 74,76" fill="#1c1109"/>
      <rect x="32" y="86" width="64" height="26" rx="4" fill="#140b06"/>
      <rect x="38" y="88" width="10" height="10" fill="#ded4b8"/>
      <rect x="52" y="88" width="10" height="10" fill="#ded4b8"/>
      <rect x="66" y="88" width="10" height="10" fill="#ded4b8"/>
      <rect x="80" y="88" width="10" height="10" fill="#ded4b8"/>
      <rect x="45" y="100" width="10" height="10" fill="#ded4b8"/>
      <rect x="59" y="100" width="10" height="10" fill="#ded4b8"/>
      <rect x="73" y="100" width="10" height="10" fill="#ded4b8"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON & RIG (Crouched Troll Stance)
  // ---------------------------------------------------------------------------

  // Pelvis / Hips (Root)
  const hips = b.joint("hips", { at: [0, 1.14, -0.06], role: "spine" });

  // Hunched Spine
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.14, -0.06],
      [0, 1.32, -0.12],
      [0, 1.54, -0.06],
      [0, 1.70, 0.08],
    ]),
    {
      parent: hips,
      role: "spine",
      names: ["spine1", "spine2", "chest"],
    },
  );
  const chest = spine.joints[2];

  // Forward-reaching neck & predatory head
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.70, 0.08],
    aim: [0, 1.80, 0.24],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.80, 0.24],
    dir: [0, 0.04, 0.99],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.72, 0.28],
    aim: [0, 1.62, 0.46],
    role: "jaw",
  });

  // Leg Chains (Crouched digitigrade posture)
  const hipL = b.joint("hipL", { parent: hips, at: [0.22, 1.10, -0.04], role: "leg" });
  const hipR = b.joint("hipR", { parent: hips, at: [-0.22, 1.10, -0.04], role: "leg" });

  const footLPos: [number, number, number] = [0.28, 0.08, 0.06];
  const footRPos: [number, number, number] = [-0.28, 0.08, -0.10];

  const legLPts = limb(hipL.at, footLPos, [0.56, 0.54], [0, 0, 1]);
  const legRPts = limb(hipR.at, footRPos, [0.56, 0.54], [0, 0, 1]);

  const legL = b.chain("legL", legLPts, {
    parent: hipL,
    names: ["thighL", "kneeL", "footL"],
    role: "leg",
    contact: footLPos,
  });

  const legR = b.chain("legR", legRPts, {
    parent: hipR,
    names: ["thighR", "kneeR", "footR"],
    role: "leg",
    contact: footRPos,
  });

  // Arms: Left holds staff planted to the side; Right claws forward
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.36, 1.66, 0.06], role: "arm" });
  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.36, 1.66, 0.06], role: "arm" });

  // Plant staff at x = 0.58 so it frames the troll without obstructing center view
  const handLPos: [number, number, number] = [0.58, 0.98, 0.22];
  const handRPos: [number, number, number] = [-0.48, 0.88, 0.26];

  const armLPts = limb(shoulderL.at, handLPos, [0.46, 0.44], [0.8, -0.3, 0.3]);
  const armRPts = limb(shoulderR.at, handRPos, [0.46, 0.44], [-0.8, -0.2, 0.4]);

  const armL = b.chain("armL", armLPts, {
    parent: shoulderL,
    names: ["upperArmL", "elbowL", "wristL"],
    role: "arm",
  });

  const armR = b.chain("armR", armRPts, {
    parent: shoulderR,
    names: ["upperArmR", "elbowR", "wristR"],
    role: "arm",
  });

  // ---------------------------------------------------------------------------
  // 4. TORSO & DORSAL HUNCH
  // ---------------------------------------------------------------------------

  // Primary torso volume
  b.loft(
    [
      { at: hips.at, w: 0.38, h: 0.34 },
      { at: spine.joints[0].at, w: 0.34, h: 0.30 },
      { at: spine.joints[1].at, w: 0.46, h: 0.36 },
      { at: spine.joints[2].at, w: 0.54, h: 0.42 },
    ],
    { bone: [hips, ...spine.joints], color: trollSkin },
  );

  // Iconic massive hunch volume (Warcraft troll profile)
  b.sweep(
    catmull([
      [0, 1.44, -0.16],
      [0, 1.66, -0.10],
      [0, 1.82, 0.06],
    ]),
    (t) => 0.16 * Math.sin(t * Math.PI) + 0.06,
    { bone: chest, color: trollSkin },
  );

  // Muscular pectorals
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.18, 0.16, 0.09), trollSkin, {
      bone: chest,
      at: [s * 0.13, 1.62, 0.18],
      rotation: [15, s * -15, s * -10],
    });

    // Sinewy ribs
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.13, 0.022, 0.045), trollSkin, {
        bone: spine.joints[1],
        at: [s * 0.19, 1.45 - i * 0.065, 0.04 - i * 0.03],
        rotation: [10, s * -35, s * -15],
      });
    }
  }

  // Vertebrae spines protruding through back
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.ConeGeometry(0.016, 0.04, 5), bonePaint, {
      bone: spine.joints[Math.min(i, 2)],
      at: [0, 1.25 + i * 0.105, -0.16 + i * 0.025],
      rotation: [-45, 0, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HERO HEAD, TUSKS, SNOUT & EARS
  // ---------------------------------------------------------------------------

  // Cranium volume
  b.part(new THREE.SphereGeometry(0.14, 12, 10), trollSkin, {
    bone: head,
    at: [0, 1.83, 0.24],
    scale: [0.95, 1.08, 1.2],
  });

  // Long hooked aquiline troll snout
  const snoutPath = catmull([
    [0, 1.88, 0.32],
    [0, 1.84, 0.44],
    [0, 1.76, 0.54],
    [0, 1.68, 0.55], // Hooked downward tip
  ]);
  b.sweep(snoutPath, (t) => [0.038 * (1 - t * 0.4), 0.034 * (1 - t * 0.3)], {
    bone: head,
    color: trollSkin,
    caps: { start: "round", end: "point" },
  });

  // Nostril flares
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 5), "#142923", {
      bone: head,
      at: [s * 0.026, 1.72, 0.51],
      scale: [0.8, 0.8, 1.1],
    });
  }

  // Septum bone needle pierced through snout
  b.capsule([-0.065, 1.74, 0.51], [0.065, 1.74, 0.51], 0.007, {
    bone: head,
    color: bonePaint,
  });

  // Scowling heavy brow ridge
  b.capsule([-0.10, 1.87, 0.33], [0.10, 1.87, 0.33], 0.024, {
    bone: head,
    color: trollSkin,
  });

  // Piercing Glowing Eyes (Amber Gold)
  for (const s of [1, -1]) {
    // Eye socket crease
    b.part(new THREE.TorusGeometry(0.024, 0.008, 6, 12), "#10211a", {
      bone: head,
      at: [s * 0.07, 1.84, 0.35],
      rotation: [10, s * 22, 0],
    });

    // Glowing eyeball
    glow(
      b.part(new THREE.SphereGeometry(0.019, 8, 6), "#ffb700", {
        bone: head,
        at: [s * 0.07, 1.84, 0.35],
      }),
      2.6,
    );

    // Slit pupil
    b.part(new THREE.BoxGeometry(0.004, 0.02, 0.003), "#100800", {
      bone: head,
      at: [s * 0.07, 1.84, 0.368],
      rotation: [10, s * 22, 0],
    });
  }

  // Massive Grinning Lower Jaw
  b.part(new THREE.BoxGeometry(0.16, 0.09, 0.18), trollSkin, {
    bone: jaw,
    at: [0, 1.66, 0.38],
    rotation: [-12, 0, 0],
  });

  // Mouth interior & tongue
  b.part(new THREE.SphereGeometry(0.04, 6, 5), "#5c1b20", {
    bone: jaw,
    at: [0, 1.67, 0.38],
    scale: [0.8, 0.35, 1.4],
  });

  // Upper incisor fangs
  for (const s of [1, -1]) {
    b.spike([s * 0.045, 1.72, 0.38], [s * 0.045, 1.65, 0.40], null, 0.009, {
      bone: head,
      color: BONE_BASE,
    });
  }

  // GIGANTIC HERO TUSKS (The Signature Warcraft Feature!)
  for (const s of [1, -1]) {
    const root = [s * 0.08, 1.65, 0.42];
    const p1 = [s * 0.16, 1.72, 0.56];
    const p2 = [s * 0.17, 1.96, 0.54];
    const tip = [s * 0.13, 2.15, 0.42];
    const tuskCurve = bezier(root, p1, p2, tip);

    b.sweep(tuskCurve, (t) => (1 - t) * 0.036 + 0.004, {
      bone: jaw,
      color: bonePaint,
      caps: { start: "flat", end: "point" },
    });

    // Gold ritual band around mid-tusk
    const midPt = tuskCurve.at(0.48);
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 10), GOLD_BRASS, {
      bone: jaw,
      at: midPt,
      dir: tuskCurve.tangentAt(0.48),
    });

    // Secondary lower tusk
    b.spike([s * 0.038, 1.67, 0.46], [s * 0.038, 1.75, 0.49], null, 0.009, {
      bone: jaw,
      color: BONE_BASE,
    });
  }

  // Long Pierced Warcraft Troll Ears (Swept back and upward)
  for (const s of [1, -1]) {
    const earBase = [s * 0.11, 1.82, 0.24];
    const earMid = [s * 0.28, 1.86, 0.10];
    const earTip = [s * 0.44, 1.92, -0.06];
    const earCurve = catmull([earBase, earMid, earTip]);

    b.sweep(earCurve, (t) => [0.042 * (1 - t * 0.75), 0.013 * (1 - t * 0.75)], {
      bone: head,
      color: trollSkin,
      caps: { start: "round", end: "point" },
    });

    // Gold tribal hoop earrings
    const pt1 = earCurve.at(0.45);
    b.part(new THREE.TorusGeometry(0.02, 0.0035, 8, 14), GOLD_BRASS, {
      bone: head,
      at: pt1,
      rotation: [0, s * 40, s * 25],
    });
    const pt2 = earCurve.at(0.72);
    b.part(new THREE.TorusGeometry(0.016, 0.003, 8, 14), GOLD_BRASS, {
      bone: head,
      at: pt2,
      rotation: [0, s * 45, s * 30],
    });
  }

  // ---------------------------------------------------------------------------
  // 6. THE FLAME MOHAWK (Solid Scalp Volume + Dense Layered Blades)
  // ---------------------------------------------------------------------------

  // Continuous foundational scalp crest that completely seals to the head & hunch
  const crestPath = catmull([
    [0, 1.88, 0.42], // Forehead
    [0, 1.96, 0.32], // Cranium apex
    [0, 1.94, 0.18], // Crown
    [0, 1.84, 0.04], // Nape
    [0, 1.68, -0.10], // Dorsal hunch
  ]);
  b.sweep(crestPath, 0.042, {
    bone: head,
    color: mohawkPaint,
    caps: { start: "round", end: "round" },
  });

  // Layered flame mohawk tufts rising high with fiery gradient
  const mohawkSpikes: [number, number, number, number, number, number, number][] = [
    [0, 1.90, 0.40, 0, 2.16, 0.48, 0.036],
    [0, 1.96, 0.35, 0, 2.30, 0.42, 0.042],
    [0, 2.00, 0.28, 0, 2.42, 0.34, 0.046],
    [0, 2.02, 0.20, 0, 2.46, 0.22, 0.048], // Peak crest
    [0, 2.00, 0.12, 0, 2.40, 0.10, 0.046],
    [0, 1.94, 0.04, 0, 2.30, -0.02, 0.042],
    [0, 1.86, -0.04, 0, 2.18, -0.12, 0.038],
    [0, 1.76, -0.08, 0, 2.02, -0.18, 0.034],
    [0, 1.64, -0.10, 0, 1.84, -0.22, 0.028],
  ];

  mohawkSpikes.forEach(([bx, by, bz, tx, ty, tz, r], idx) => {
    const parentBone = idx < 6 ? head : idx < 7 ? neck : chest;
    // Main central spike
    b.spike([bx, by, bz], [tx, ty, tz], null, r, {
      bone: parentBone,
      color: mohawkPaint,
    });

    // Lateral support blades for dense hair silhouette
    if (idx < 7) {
      for (const s of [1, -1]) {
        b.spike(
          [bx + s * 0.028, by - 0.02, bz],
          [tx + s * 0.05, ty - 0.04, tz],
          null,
          r * 0.72,
          { bone: parentBone, color: mohawkPaint },
        );
      }
    }
  });

  // Bone-ring hair tie at the nape
  b.part(new THREE.TorusGeometry(0.034, 0.008, 8, 14), bonePaint, {
    bone: neck,
    at: [0, 1.82, 0.02],
    rotation: [45, 0, 0],
  });

  // ---------------------------------------------------------------------------
  // 7. BOG-BEAST SKULL PAULDRON (Right Shoulder)
  // ---------------------------------------------------------------------------

  const skullCenter: [number, number, number] = [-0.40, 1.74, 0.06];

  // Pauldron cranium
  b.part(new THREE.SphereGeometry(0.10, 8, 6), bonePaint, {
    bone: armR.joints[0],
    at: skullCenter,
    scale: [0.85, 0.75, 1.25],
  });

  // Pauldron snout with sharp teeth
  b.spike([-0.40, 1.72, 0.14], [-0.40, 1.64, 0.32], null, 0.056, {
    bone: armR.joints[0],
    color: bonePaint,
  });

  // Pauldron glowing ember eye sockets
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#100c08", {
      bone: armR.joints[0],
      at: [-0.40 + s * 0.046, 1.75, 0.14],
    });
    glow(
      b.part(new THREE.SphereGeometry(0.009, 6, 4), "#ff4400", {
        bone: armR.joints[0],
        at: [-0.40 + s * 0.046, 1.75, 0.15],
      }),
      2.0,
    );
  }

  // Curved beast horns on pauldron
  b.sweep(
    bezier([-0.40, 1.80, 0.02], [-0.44, 1.98, -0.04], [-0.40, 2.12, 0.04]),
    [0.024, 0.004],
    { bone: armR.joints[0], color: BONE_BASE, caps: { end: "point" } },
  );

  // Pauldron leather harness straps crossing chest & back
  const strapChest = catmull([
    [-0.34, 1.74, 0.08],
    [-0.10, 1.58, 0.18],
    [0.12, 1.44, 0.12],
  ]);
  b.sweep(strapChest, 0.018, { bone: chest, color: LEATHER_MED });

  const strapBack = catmull([
    [-0.34, 1.74, 0.04],
    [-0.12, 1.56, -0.12],
    [0.10, 1.42, -0.10],
  ]);
  b.sweep(strapBack, 0.018, { bone: chest, color: LEATHER_MED });

  // Brass studs on harness
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_BRASS, {
    bone: chest,
    at: [-0.22, 1.66, 0.14],
  });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_BRASS, {
    bone: chest,
    at: [0.0, 1.51, 0.16],
  });

  // Hanging swamp crane feathers from pauldron
  for (let i = 0; i < 2; i++) {
    b.spike(
      [-0.44 - i * 0.02, 1.66, 0.06],
      [-0.47 - i * 0.03, 1.42, 0.08 + i * 0.04],
      null,
      0.016,
      { bone: armR.joints[0], color: i === 0 ? "#8c1f24" : "#1f4a47" },
    );
  }

  // ---------------------------------------------------------------------------
  // 8. BONE FETISH NECKLACE
  // ---------------------------------------------------------------------------

  const neckLoop = catmull(
    [
      [0, 1.72, 0.18],
      [0.16, 1.66, 0.12],
      [0.22, 1.54, 0.06],
      [0.12, 1.46, 0.16],
      [0, 1.44, 0.20],
      [-0.12, 1.46, 0.16],
      [-0.22, 1.54, 0.06],
      [-0.16, 1.66, 0.12],
    ],
    { closed: true },
  );
  b.sweep(neckLoop, 0.005, { bone: chest, color: LEATHER_DARK });

  // Centerpiece fetish skull with glowing embers
  b.part(new THREE.SphereGeometry(0.044, 8, 6), bonePaint, {
    bone: chest,
    at: [0, 1.36, 0.22],
    scale: [0.85, 1.0, 0.9],
  });
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.007, 6, 4), "#ff9900", {
        bone: chest,
        at: [s * 0.014, 1.37, 0.25],
      }),
      2.0,
    );
  }

  // Claws dangling beneath fetish skull
  for (let i = -1; i <= 1; i++) {
    b.spike([i * 0.018, 1.32, 0.22], [i * 0.022, 1.24, 0.23], null, 0.007, {
      bone: chest,
      color: BONE_BASE,
    });
  }

  // Flanking predator teeth along necklace
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const t = 0.5 + s * (0.08 + i * 0.08);
      const pt = neckLoop.at(t);
      b.spike(
        pt,
        [pt.x + s * 0.02, pt.y - 0.08, pt.z + 0.02],
        null,
        0.01,
        { bone: chest, color: BONE_BASE },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 9. LIMBS & APPENDAGES
  // ---------------------------------------------------------------------------

  // Continuous legs with muscular taper
  const legRadius = (t: number): [number, number] =>
    t < 0.5
      ? [0.11 - t * 0.05, 0.13 - t * 0.07]
      : [0.085 - (t - 0.5) * 0.06, 0.08 - (t - 0.5) * 0.05];

  b.sweep(legL, legRadius, { color: trollSkin });
  b.sweep(legR, legRadius, { color: trollSkin });

  // Knee caps
  b.part(new THREE.SphereGeometry(0.048, 8, 6), trollSkin, {
    bone: legL.joints[1],
    at: legLPts[1],
  });
  b.part(new THREE.SphereGeometry(0.048, 8, 6), trollSkin, {
    bone: legR.joints[1],
    at: legRPts[1],
  });

  // Ankle cloth wraps
  for (const [legJoint, pos] of [[legL.joints[1], footLPos], [legR.joints[1], footRPos]] as const) {
    b.part(new THREE.CylinderGeometry(0.052, 0.058, 0.08, 8), RAG_CLOTH, {
      bone: legJoint,
      at: [pos[0], pos[1] + 0.05, pos[2]],
    });
  }

  // Continuous arms
  const armRadius = (t: number): [number, number] =>
    t < 0.5
      ? [0.09 - t * 0.04, 0.09 - t * 0.04]
      : [0.078 - (t - 0.5) * 0.035, 0.068 - (t - 0.5) * 0.03];

  b.sweep(armL, armRadius, { color: trollSkin });
  b.sweep(armR, armRadius, { color: trollSkin });

  // Left arm leather bracer with bone quills
  b.part(new THREE.CylinderGeometry(0.064, 0.058, 0.12, 8), LEATHER_DARK, {
    bone: armL.joints[1],
    at: [0.55, 1.12, 0.20],
    dir: [0.1, -1, 0.3],
  });
  for (let i = -1; i <= 1; i++) {
    b.spike([0.61 + i * 0.015, 1.18, 0.20], [0.61 + i * 0.015, 1.05, 0.20], null, 0.007, {
      bone: armL.joints[1],
      color: BONE_BASE,
    });
  }

  // Right wrist spiked leather cuff
  b.part(new THREE.CylinderGeometry(0.06, 0.054, 0.06, 8), LEATHER_DARK, {
    bone: armR.joints[1],
    at: [-0.48, 1.00, 0.22],
    dir: [-0.2, -1, 0.3],
  });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    b.part(new THREE.ConeGeometry(0.008, 0.02, 5), GOLD_BRASS, {
      bone: armR.joints[1],
      at: [-0.48 + Math.cos(a) * 0.06, 1.00, 0.22 + Math.sin(a) * 0.06],
      rotation: [Math.sin(a) * 45, 0, Math.cos(a) * 45],
    });
  }

  // ---------------------------------------------------------------------------
  // 10. HANDS, CLAWS & 2-TOED TROLL FEET
  // ---------------------------------------------------------------------------

  // Left Hand: Palm gripping the staff securely at x = 0.58
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.05), trollSkin, {
    bone: armL.joints[2],
    at: [0.58, 0.98, 0.20],
  });
  // Left fingers curling around staff
  for (let i = 0; i < 3; i++) {
    const yOff = 1.01 - i * 0.036;
    b.sweep(
      bezier([0.55, yOff, 0.19], [0.61, yOff + 0.01, 0.21], [0.58, yOff, 0.26]),
      [0.014, 0.008],
      { bone: armL.joints[2], color: trollSkin },
    );
    b.spike([0.58, yOff, 0.26], [0.55, yOff - 0.01, 0.24], null, 0.007, {
      bone: armL.joints[2],
      color: CLAW_BLACK,
    });
  }

  // Right Hand: Predatory casting claw pose
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.05), trollSkin, {
    bone: armR.joints[2],
    at: [-0.48, 0.88, 0.26],
    rotation: [20, -15, 10],
  });
  for (let i = -1; i <= 1; i++) {
    const root: [number, number, number] = [-0.48 + i * 0.03, 0.86, 0.28];
    const tip: [number, number, number] = [-0.50 + i * 0.04, 0.76, 0.36];
    b.spike(root, tip, null, 0.013, { bone: armR.joints[2], color: trollSkin });
    b.spike(tip, [tip[0], tip[1] - 0.04, tip[2] + 0.03], null, 0.008, {
      bone: armR.joints[2],
      color: CLAW_BLACK,
    });
  }

  // Authentic 2-Toed Warcraft Feet with rear heel talons
  const buildTrollFoot = (
    pos: [number, number, number],
    boneJoint: THREE.Object3D | import("../../../../src/index").Joint,
    sign: number,
  ) => {
    b.part(new THREE.BoxGeometry(0.14, 0.045, 0.15), trollSkin, {
      bone: boneJoint,
      at: [pos[0], pos[1] + 0.02, pos[2] - 0.02],
    });

    // Inner major toe
    b.sweep(
      bezier(
        [pos[0] + sign * 0.03, pos[1] + 0.02, pos[2]],
        [pos[0] + sign * 0.04, pos[1] + 0.015, pos[2] + 0.09],
        [pos[0] + sign * 0.05, pos[1] + 0.01, pos[2] + 0.16],
      ),
      [0.026, 0.014],
      { bone: boneJoint, color: trollSkin },
    );
    b.spike(
      [pos[0] + sign * 0.05, pos[1] + 0.01, pos[2] + 0.16],
      [pos[0] + sign * 0.06, pos[1], pos[2] + 0.22],
      null,
      0.011,
      { bone: boneJoint, color: CLAW_BLACK },
    );

    // Outer toe
    b.sweep(
      bezier(
        [pos[0] - sign * 0.03, pos[1] + 0.02, pos[2]],
        [pos[0] - sign * 0.04, pos[1] + 0.015, pos[2] + 0.08],
        [pos[0] - sign * 0.05, pos[1] + 0.01, pos[2] + 0.15],
      ),
      [0.024, 0.013],
      { bone: boneJoint, color: trollSkin },
    );
    b.spike(
      [pos[0] - sign * 0.05, pos[1] + 0.01, pos[2] + 0.15],
      [pos[0] - sign * 0.06, pos[1], pos[2] + 0.21],
      null,
      0.010,
      { bone: boneJoint, color: CLAW_BLACK },
    );

    // Rear heel spur claw
    b.spike(
      [pos[0], pos[1] + 0.03, pos[2] - 0.08],
      [pos[0], pos[1] + 0.01, pos[2] - 0.16],
      null,
      0.011,
      { bone: boneJoint, color: CLAW_BLACK },
    );
  };

  buildTrollFoot(footLPos, legL.joints[2], 1);
  buildTrollFoot(footRPos, legR.joints[2], -1);

  // ---------------------------------------------------------------------------
  // 11. BELT & JAGGED LOINCLOTH
  // ---------------------------------------------------------------------------

  const beltPath = catmull(
    [
      [0, 1.12, 0.16],
      [0.20, 1.12, 0.02],
      [0, 1.12, -0.16],
      [-0.20, 1.12, 0.02],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.018, { bone: hips, color: LEATHER_DARK });

  // Carved wooden Tiki mask belt buckle
  b.part(new THREE.BoxGeometry(0.10, 0.13, 0.02), "#352215", {
    bone: hips,
    at: [0, 1.11, 0.17],
  });
  b.part(new THREE.PlaneGeometry(0.095, 0.12), "#ffffff", {
    bone: hips,
    at: [0, 1.11, 0.182],
    dir: [0, 0, 1],
    axis: "z",
    texture: TIKI_FACE,
  });

  // Front jagged tattered loincloth apron
  const loinclothOutline: [number, number, ("sharp" | undefined)?][] = [
    [-0.11, 0],
    [0.11, 0],
    [0.13, -0.22],
    [0.09, -0.40, "sharp"],
    [0.04, -0.32],
    [0.0, -0.44, "sharp"],
    [-0.05, -0.34],
    [-0.10, -0.42, "sharp"],
    [-0.12, -0.22],
  ];
  b.extrude(loinclothOutline, {
    at: [0, 1.10, 0.16],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    color: RAG_CLOTH,
    bone: hips,
  });

  // Tribal skull emblem decal on loincloth
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    bone: hips,
    at: [0, 0.90, 0.17],
    dir: [0, 0, 1],
    axis: "z",
    texture: TRIBAL_SYMBOL,
  });

  // Back tattered cloth flap
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.10, -0.30, "sharp"],
      [0.0, -0.36, "sharp"],
      [-0.09, -0.28, "sharp"],
    ],
    {
      at: [0, 1.10, -0.16],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      color: RAG_CLOTH,
      bone: hips,
    },
  );

  // Hip fetishes: medicine pouch and vertebrae beads
  b.part(new THREE.SphereGeometry(0.028, 6, 5), LEATHER_MED, {
    bone: hips,
    at: [-0.19, 1.05, 0.08],
  });
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.022, 6), BONE_BASE, {
    bone: hips,
    at: [-0.20, 1.00, 0.08],
  });
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.022, 6), BONE_BASE, {
    bone: hips,
    at: [-0.20, 0.96, 0.08],
  });

  // ---------------------------------------------------------------------------
  // 12. VOODOO SWAMP STAFF (Firmly Planted at x = 0.58)
  // ---------------------------------------------------------------------------

  const staffCurve = catmull([
    [0.58, 0.08, 0.22],
    [0.58, 0.52, 0.22],
    [0.58, 0.98, 0.22],
    [0.57, 1.48, 0.21],
    [0.56, 1.88, 0.21],
    [0.55, 2.22, 0.20],
  ]);
  b.sweep(staffCurve, (t) => 0.028 * (1 - t * 0.35) + 0.008, {
    color: woodBark,
  });

  // Staff Head: Carved wooden Loa Mask Totem
  const effigyCenter: [number, number, number] = [0.55, 2.08, 0.20];
  b.part(new THREE.BoxGeometry(0.14, 0.19, 0.14), "#322013", {
    at: effigyCenter,
    rotation: [0, -18, 0],
  });

  // Glowing soul wisp inside effigy head
  glow(
    b.part(new THREE.SphereGeometry(0.052, 10, 8), "#2ee6c2", {
      at: [0.55, 2.08, 0.21],
    }),
    2.8,
  );

  // Curved ram horns atop staff
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [0.55 + s * 0.06, 2.15, 0.20],
        [0.55 + s * 0.16, 2.28, 0.18],
        [0.55 + s * 0.20, 2.22, 0.22],
      ),
      [0.018, 0.004],
      { color: BONE_BASE, caps: { end: "point" } },
    );
  }

  // Dangling bone charms from staff horns
  for (const s of [1, -1]) {
    b.capsule([0.55 + s * 0.19, 2.20, 0.22], [0.55 + s * 0.19, 2.06, 0.22], 0.003, {
      color: LEATHER_DARK,
    });
    b.spike([0.55 + s * 0.19, 2.06, 0.22], [0.55 + s * 0.19, 1.96, 0.22], null, 0.008, {
      color: BONE_BASE,
    });
  }

  // Hanging swamp moss strands from staff crossbar
  for (let i = 0; i < 3; i++) {
    b.sweep(
      bezier(
        [0.51 + i * 0.04, 1.98, 0.20],
        [0.52 + i * 0.04, 1.86, 0.22],
        [0.50 + i * 0.04, 1.72, 0.20],
      ),
      [0.008, 0.002],
      { color: "#3a4d26" },
    );
  }

  // ---------------------------------------------------------------------------
  // 13. STAGED BAYOU MOUND VIGNETTE
  // ---------------------------------------------------------------------------

  // Ground base mound (height = 0.08, center y = 0.04 -> touches y = 0)
  b.part(new THREE.CylinderGeometry(0.88, 0.92, 0.08, 24), SWAMP_MUD, {
    at: [0, 0.04, 0],
  });

  // Top surface peat moss
  b.part(new THREE.CylinderGeometry(0.85, 0.88, 0.03, 24), SWAMP_MOSS, {
    at: [0, 0.08, 0],
  });

  // Murky deep swamp water puddle
  b.part(new THREE.CylinderGeometry(0.32, 0.35, 0.015, 18), SWAMP_WATER, {
    at: [-0.36, 0.088, 0.30],
    scale: [1.2, 1.0, 0.9],
  });

  // Floating swamp lily pads
  b.part(new THREE.CircleGeometry(0.09, 14, 0, Math.PI * 1.8), "#2f6338", {
    at: [-0.32, 0.098, 0.26],
    rotation: [-90, 0, 45],
  });
  b.part(new THREE.CircleGeometry(0.07, 14, 0, Math.PI * 1.8), "#367240", {
    at: [-0.44, 0.098, 0.36],
    rotation: [-90, 0, -30],
  });

  // Blooming pink swamp water lotus on lily pad
  b.part(new THREE.SphereGeometry(0.012, 6, 4), "#ffcc00", {
    at: [-0.32, 0.11, 0.26],
  });
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    b.spike(
      [-0.32, 0.10, 0.26],
      [-0.32 + Math.cos(a) * 0.032, 0.12, 0.26 + Math.sin(a) * 0.032],
      null,
      0.007,
      { color: "#e63980" },
    );
  }

  // Gnarled cypress swamp root arching behind right heel
  b.sweep(
    bezier([-0.50, 0.06, -0.30], [-0.35, 0.22, -0.35], [-0.15, 0.06, -0.40]),
    [0.045, 0.025],
    { color: "#2d2016" },
  );

  // Swamp Cattails / Reeds along the pool
  const reedCoords: [number, number][] = [
    [-0.56, 0.22],
    [-0.52, 0.38],
    [-0.60, 0.32],
  ];
  reedCoords.forEach(([rx, rz]) => {
    b.rod([rx, 0.08, rz], [rx + 0.02, 0.54, rz], 0.005, { color: "#3d542b" });
    b.capsule([rx + 0.015, 0.40, rz], [rx + 0.02, 0.52, rz], 0.013, { color: "#452615" });
  });

  // Bioluminescent Glowing Swamp Mushrooms
  const mushroomData: [number, number, number][] = [
    [0.34, 0.52, 0.08],
    [0.38, 0.58, 0.065],
    [-0.20, -0.42, 0.07],
  ];
  mushroomData.forEach(([mx, mz, scale]) => {
    b.capsule([mx, 0.08, mz], [mx, 0.08 + scale, mz], scale * 0.18, { color: "#d2d8c7" });
    glow(
      b.part(new THREE.ConeGeometry(scale * 0.75, scale * 0.4, 8), "#2ee6c2", {
        at: [mx, 0.08 + scale, mz],
      }),
      2.2,
    );
  });

  return b.root;
}
