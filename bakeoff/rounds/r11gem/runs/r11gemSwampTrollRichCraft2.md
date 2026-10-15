```ts
import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  limb,
  paint,
  mottle,
  grain,
  noise,
  mix,
  smoothstep,
  rgb,
  svg,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "swamp_troll",
  description:
    "A Warcraft-inspired swamp troll witch doctor with towering tusks, wild flame mohawk, bog-beast skull pauldron, bone fetishes, and a voodoo soul staff on a murky bayou mound.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "swamp_troll" });
  const rand = rng(1337);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & PAINTS (Blizzard / Warcraft Stylized Aesthetic)
  // ---------------------------------------------------------------------------

  const SKIN_BASE = "#296b5c";
  const SKIN_LIGHT = "#4da38b";
  const SKIN_SHADOW = "#16332c";
  const SKIN_BELLY = "#6db598";
  const WARPAINT_RED = "#a82018";

  // Troll skin: mottled mossy teal with pale belly countershading & ritual blood-red warpaint slashes
  const trollSkin = paint((p, n) => {
    const gn = noise(p, 0.12, 11);
    let c = mix(SKIN_BASE, SKIN_LIGHT, smoothstep(0.3, 0.7, gn));

    // Belly & inner throat countershading
    if (n.y < 0.25 && n.z > -0.25) {
      const bellyFactor = smoothstep(0.25, -0.4, n.y) * smoothstep(-0.25, 0.4, n.z);
      c = mix(c, rgb(SKIN_BELLY), bellyFactor * 0.75);
    }

    // Crease and underside shadows
    if (n.y < -0.35) {
      c = mix(c, rgb(SKIN_SHADOW), 0.5);
    }

    // Ritual tribal warpaint across chest/shoulders
    if (p.y > 1.25 && p.y < 1.85 && n.z > 0.05) {
      const stripe = Math.sin(p.x * 14 + p.y * 12 + p.z * 6);
      if (Math.abs(stripe) > 0.86) {
        c = mix(c, rgb(WARPAINT_RED), 0.88);
      }
    }

    return c;
  });

  // Mohawk paint: deep burgundy root -> vivid crimson -> flame orange -> golden yellow tips
  const mohawkPaint = paint((p) => {
    const t = smoothstep(1.92, 2.45, p.y + p.z * 0.35);
    if (t < 0.28) return mix("#630912", "#c41a1a", t / 0.28);
    if (t < 0.68) return mix("#c41a1a", "#ff5a00", (t - 0.28) / 0.4);
    return mix("#ff5a00", "#ffcc00", (t - 0.68) / 0.32);
  });

  // Aged bone & ivory paint with tarnish and dark root stains
  const BONE_BASE = "#e6dcc0";
  const BONE_TIP = "#f5f0db";
  const BONE_STAIN = "#543d28";
  const bonePaint = paint((p, n) => {
    const gn = noise(p, 0.045, 9);
    let c = mix(BONE_BASE, BONE_TIP, gn);
    if (n.y < -0.2) c = mix(c, rgb(BONE_STAIN), 0.45);
    return c;
  });

  // Bog wood bark for staff and totems
  const woodBark = grain("#211912", "#3b2c1d", { size: 0.05, seed: 17 });

  // Flat & trim colors
  const GOLD_BRASS = "#d49b28";
  const COPPER_TARNISH = "#8a5234";
  const LEATHER_DARK = "#2b1c12";
  const LEATHER_MED = "#4a3322";
  const RAG_CLOTH = "#3d472e"; // tattered mossy burlap
  const CLAW_BLACK = "#1c1916";
  const SWAMP_MUD = "#1c1712";
  const SWAMP_MOSS = "#374a24";
  const SWAMP_WATER = "#0f2116";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES & DECALS (SVG)
  // ---------------------------------------------------------------------------

  const TRIBAL_SYMBOL = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 12 L92 48 L80 108 L64 120 L48 108 L36 48 Z" fill="#ded4b8" stroke="#2b1e13" stroke-width="4"/>
      <circle cx="52" cy="54" r="8" fill="#8f1c16"/>
      <circle cx="76" cy="54" r="8" fill="#8f1c16"/>
      <path d="M48 82 L64 94 L80 82" stroke="#8f1c16" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M46 32 L28 18 M82 32 L100 18" stroke="#ded4b8" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const TIKI_FACE = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="22" fill="#3a2517"/>
      <polygon points="26,44 58,54 30,62" fill="#ffbb00"/>
      <polygon points="102,44 70,54 98,62" fill="#ffbb00"/>
      <polygon points="64,36 56,76 72,76" fill="#20140b"/>
      <rect x="34" y="86" width="60" height="24" rx="4" fill="#140b06"/>
      <rect x="40" y="88" width="9" height="9" fill="#ded4b8"/>
      <rect x="53" y="88" width="9" height="9" fill="#ded4b8"/>
      <rect x="66" y="88" width="9" height="9" fill="#ded4b8"/>
      <rect x="79" y="88" width="9" height="9" fill="#ded4b8"/>
      <rect x="47" y="99" width="9" height="9" fill="#ded4b8"/>
      <rect x="60" y="99" width="9" height="9" fill="#ded4b8"/>
      <rect x="73" y="99" width="9" height="9" fill="#ded4b8"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON & RIG SETUP (Troll Hunched Stance)
  // ---------------------------------------------------------------------------

  // Pelvis / Hips (Root)
  const hips = b.joint("hips", { at: [0, 1.18, -0.04], role: "spine" });

  // Spine: Hunched forward dramatically
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.18, -0.04],
      [0, 1.36, -0.08],
      [0, 1.56, -0.02],
      [0, 1.74, 0.1],
    ]),
    {
      parent: hips,
      role: "spine",
      names: ["spine1", "spine2", "chest"],
    },
  );
  const chest = spine.joints[2];

  // Neck & Head
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.74, 0.1],
    aim: [0, 1.86, 0.24],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.86, 0.24],
    dir: [0, -0.15, 0.98],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.78, 0.28],
    aim: [0, 1.66, 0.44],
    role: "jaw",
  });

  // Legs (Lanky, crouched, digitigrade posture)
  const hipL = b.joint("hipL", { parent: hips, at: [0.2, 1.14, -0.04], role: "leg" });
  const hipR = b.joint("hipR", { parent: hips, at: [-0.2, 1.14, -0.04], role: "leg" });

  const footLPos: [number, number, number] = [0.28, 0.08, 0.1];
  const footRPos: [number, number, number] = [-0.26, 0.08, -0.12];

  const legLPts = limb(hipL.at, footLPos, [0.58, 0.56], [0, 0, 1]);
  const legRPts = limb(hipR.at, footRPos, [0.58, 0.56], [0, 0, 1]);

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

  // Arms (Long, brachiating, powerful forearms)
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.36, 1.7, 0.08], role: "arm" });
  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.36, 1.7, 0.08], role: "arm" });

  // Left hand grips staff; right hand open in predatory claw
  const handLPos: [number, number, number] = [0.46, 0.98, 0.38];
  const handRPos: [number, number, number] = [-0.46, 0.9, 0.16];

  const armLPts = limb(shoulderL.at, handLPos, [0.46, 0.44], [1, 0, -0.4]);
  const armRPts = limb(shoulderR.at, handRPos, [0.46, 0.44], [-1, 0, 0.4]);

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
  // 4. TORSO & HUNCHBACK
  // ---------------------------------------------------------------------------

  // Primary torso volume via loft through stations
  b.loft(
    [
      { at: hips.at, w: 0.36, h: 0.32 },
      { at: spine.joints[0].at, w: 0.32, h: 0.28 },
      { at: spine.joints[1].at, w: 0.44, h: 0.34 },
      { at: spine.joints[2].at, w: 0.52, h: 0.4 },
    ],
    { bone: [hips, ...spine.joints], color: trollSkin },
  );

  // Severe dorsal hunch mass (classic Warcraft troll silhouette)
  b.sweep(
    catmull([
      [0, 1.48, -0.14],
      [0, 1.7, -0.08],
      [0, 1.84, 0.08],
    ]),
    (t) => 0.14 * Math.sin(t * Math.PI) + 0.05,
    { bone: chest, color: trollSkin },
  );

  // Pectoral muscles
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.16, 0.15, 0.08), trollSkin, {
      bone: chest,
      at: [s * 0.12, 1.66, 0.2],
      rotation: [15, s * -15, s * -10],
    });

    // Rib cage ridges (lean, sinewy look)
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.12, 0.02, 0.04), trollSkin, {
        bone: spine.joints[1],
        at: [s * 0.18, 1.48 - i * 0.06, 0.06 - i * 0.03],
        rotation: [10, s * -35, s * -15],
      });
    }
  }

  // Dorsal vertebrae protrusions along spine
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.ConeGeometry(0.016, 0.035, 5), bonePaint, {
      bone: spine.joints[Math.min(i, 2)],
      at: [0, 1.28 + i * 0.1, -0.15 + i * 0.02],
      rotation: [-45, 0, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HEAD, SNOUT, EARS & HERO TUSKS
  // ---------------------------------------------------------------------------

  // Cranium
  b.part(new THREE.SphereGeometry(0.13, 12, 10), trollSkin, {
    bone: head,
    at: [0, 1.88, 0.22],
    scale: [0.95, 1.05, 1.15],
  });

  // Snout bridge: long hooked aquiline nose
  b.sweep(
    bezier([0, 1.95, 0.28], [0, 1.9, 0.36], [0, 1.82, 0.38]),
    (t) => [0.032 - t * 0.008, 0.03],
    { bone: head, color: trollSkin },
  );

  // Nose tip & nostrils
  b.part(new THREE.SphereGeometry(0.022, 8, 6), "#1c3830", {
    bone: head,
    at: [0, 1.81, 0.39],
    scale: [1.2, 0.8, 1.0],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 5), "#142923", {
      bone: head,
      at: [s * 0.028, 1.8, 0.37],
      scale: [0.8, 0.8, 1.1],
    });
  }

  // Septum bone peg (ivory peg pierced through nostrils)
  b.capsule([-0.055, 1.81, 0.38], [0.055, 1.81, 0.38], 0.007, {
    bone: head,
    color: bonePaint,
  });

  // Heavy knitted brow ridge (scowling warrior expression)
  b.capsule([-0.09, 1.93, 0.3], [0.09, 1.93, 0.3], 0.022, {
    bone: head,
    color: trollSkin,
  });

  // Glowing Eyes (Supernatural Amber-Gold Gaze)
  for (const s of [1, -1]) {
    // Dark socket recess
    b.part(new THREE.TorusGeometry(0.024, 0.007, 6, 12), "#12241e", {
      bone: head,
      at: [s * 0.068, 1.9, 0.31],
      rotation: [10, s * 20, 0],
    });

    // Eyeball with glow
    glow(
      b.part(new THREE.SphereGeometry(0.018, 8, 6), "#ffcc11", {
        bone: head,
        at: [s * 0.068, 1.9, 0.31],
      }),
      2.2,
    );

    // Slit pupil
    b.part(new THREE.BoxGeometry(0.004, 0.02, 0.003), "#100a00", {
      bone: head,
      at: [s * 0.068, 1.9, 0.327],
      rotation: [10, s * 20, 0],
    });
  }

  // Upper fangs (predatory overbite)
  for (const s of [1, -1]) {
    b.spike([s * 0.045, 1.78, 0.33], [s * 0.045, 1.71, 0.34], null, 0.008, {
      bone: head,
      color: BONE_BASE,
    });
  }

  // JAW & GIGANTIC HERO TUSKS
  b.part(new THREE.BoxGeometry(0.14, 0.08, 0.16), trollSkin, {
    bone: jaw,
    at: [0, 1.72, 0.34],
    rotation: [-15, 0, 0],
  });

  // Tongue
  b.part(new THREE.SphereGeometry(0.035, 6, 5), "#662024", {
    bone: jaw,
    at: [0, 1.73, 0.34],
    scale: [0.8, 0.35, 1.4],
  });

  // Hero Tusks: Massive upward-curving ivory tusk pair
  for (const s of [1, -1]) {
    const root = [s * 0.08, 1.71, 0.34];
    const p1 = [s * 0.16, 1.73, 0.46];
    const p2 = [s * 0.18, 1.96, 0.48];
    const tip = [s * 0.13, 2.14, 0.38];
    const tuskCurve = bezier(root, p1, p2, tip);

    b.sweep(tuskCurve, (t) => (1 - t) * 0.032 + 0.003, {
      bone: jaw,
      color: bonePaint,
      caps: { start: "flat", end: "point" },
    });

    // Gold band mid-tusk
    const midPt = tuskCurve.at(0.48);
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.018, 10), GOLD_BRASS, {
      bone: jaw,
      at: midPt,
      dir: tuskCurve.tangentAt(0.48),
    });

    // Secondary smaller tusks
    b.spike([s * 0.035, 1.73, 0.37], [s * 0.035, 1.8, 0.39], null, 0.008, {
      bone: jaw,
      color: BONE_BASE,
    });
  }

  // Lower front incisors
  for (let i = -1; i <= 1; i++) {
    b.spike([i * 0.016, 1.72, 0.38], [i * 0.016, 1.76, 0.39], null, 0.005, {
      bone: jaw,
      color: BONE_BASE,
    });
  }

  // Giant Iconic Troll Ears (Long, swept backward, pierced with rings)
  for (const s of [1, -1]) {
    const earBase = [s * 0.11, 1.88, 0.22];
    const earMid = [s * 0.28, 1.86, 0.08];
    const earTip = [s * 0.42, 1.84, -0.08];
    const earCurve = catmull([earBase, earMid, earTip]);

    b.sweep(earCurve, (t) => [0.038 * (1 - t * 0.75), 0.012 * (1 - t * 0.75)], {
      bone: head,
      color: trollSkin,
      caps: { start: "round", end: "point" },
    });

    // Earring hoops
    const ringPt1 = earCurve.at(0.45);
    b.part(new THREE.TorusGeometry(0.018, 0.0035, 8, 14), GOLD_BRASS, {
      bone: head,
      at: ringPt1,
      rotation: [0, s * 40, s * 25],
    });

    const ringPt2 = earCurve.at(0.72);
    b.part(new THREE.TorusGeometry(0.014, 0.003, 8, 14), COPPER_TARNISH, {
      bone: head,
      at: ringPt2,
      rotation: [0, s * 45, s * 30],
    });
  }

  // ---------------------------------------------------------------------------
  // 6. THE FLAME MOHAWK (Hero Hair Silhouette)
  // ---------------------------------------------------------------------------

  // Central crest coordinates from forehead, over cranium, down nape to hunch
  const mohawkSpines: [number, number, number, number, number, number, number][] = [
    // [baseX, baseY, baseZ, tipX, tipY, tipZ, radius]
    [0, 1.98, 0.34, 0, 2.22, 0.42, 0.036],
    [0, 2.04, 0.3, 0, 2.34, 0.36, 0.042],
    [0, 2.08, 0.24, 0, 2.44, 0.28, 0.046],
    [0, 2.1, 0.16, 0, 2.48, 0.18, 0.048], // Peak crest
    [0, 2.08, 0.08, 0, 2.44, 0.06, 0.046],
    [0, 2.02, 0.0, 0, 2.36, -0.06, 0.042],
    [0, 1.94, -0.06, 0, 2.24, -0.16, 0.038],
    [0, 1.84, -0.1, 0, 2.1, -0.22, 0.034],
    [0, 1.74, -0.12, 0, 1.96, -0.26, 0.03],
    [0, 1.62, -0.12, 0, 1.8, -0.28, 0.026],
    [0, 1.5, -0.1, 0, 1.65, -0.26, 0.022],
  ];

  mohawkSpines.forEach(([bx, by, bz, tx, ty, tz, r], idx) => {
    const parentBone = idx < 6 ? head : idx < 8 ? neck : chest;
    // Central primary spike
    b.spike([bx, by, bz], [tx, ty, tz], null, r, {
      bone: parentBone,
      color: mohawkPaint,
    });

    // Flanking lateral spikes for volume (first 8 tufts)
    if (idx < 8) {
      for (const s of [1, -1]) {
        b.spike(
          [bx + s * 0.028, by - 0.02, bz],
          [tx + s * 0.05, ty - 0.05, tz],
          null,
          r * 0.72,
          { bone: parentBone, color: mohawkPaint },
        );
      }
    }
  });

  // Bone ring hair-tie at the nape
  b.part(new THREE.TorusGeometry(0.032, 0.008, 8, 14), bonePaint, {
    bone: neck,
    at: [0, 1.86, -0.1],
    rotation: [45, 0, 0],
  });

  // ---------------------------------------------------------------------------
  // 7. BONE PAULDRON & SHOULDER FETISHES
  // ---------------------------------------------------------------------------

  // Predator Bog-Beast Skull Pauldron on Right Shoulder (x < 0)
  const skullCenter: [number, number, number] = [-0.4, 1.76, 0.08];

  // Pauldron cranium
  b.part(new THREE.SphereGeometry(0.09, 8, 6), bonePaint, {
    bone: armR.joints[0],
    at: skullCenter,
    scale: [0.85, 0.75, 1.25],
  });

  // Pauldron snout
  b.spike(
    [-0.4, 1.74, 0.16],
    [-0.4, 1.66, 0.32],
    null,
    0.052,
    { bone: armR.joints[0], color: bonePaint },
  );

  // Skull eye sockets
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#110e0a", {
      bone: armR.joints[0],
      at: [-0.4 + s * 0.045, 1.77, 0.16],
    });
  }

  // Horn curving from pauldron skull
  b.sweep(
    bezier([-0.4, 1.82, 0.04], [-0.42, 1.98, -0.02], [-0.38, 2.1, 0.05]),
    [0.022, 0.004],
    { bone: armR.joints[0], color: BONE_BASE, caps: { end: "point" } },
  );

  // Pauldron leather harness straps crossing chest & back
  const strapChest = catmull([
    [-0.34, 1.78, 0.1],
    [-0.1, 1.62, 0.19],
    [0.12, 1.48, 0.12],
  ]);
  b.sweep(strapChest, 0.018, { bone: chest, color: LEATHER_MED });

  const strapBack = catmull([
    [-0.34, 1.78, 0.06],
    [-0.12, 1.6, -0.1],
    [0.1, 1.46, -0.08],
  ]);
  b.sweep(strapBack, 0.018, { bone: chest, color: LEATHER_MED });

  // Brass studs along harness strap
  b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD_BRASS, {
    bone: chest,
    at: [-0.22, 1.7, 0.15],
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD_BRASS, {
    bone: chest,
    at: [0.0, 1.55, 0.16],
  });

  // Hanging swamp heron feathers on pauldron
  for (let i = 0; i < 2; i++) {
    b.spike(
      [-0.44 - i * 0.02, 1.68, 0.08],
      [-0.46 - i * 0.03, 1.45, 0.1 + i * 0.04],
      null,
      0.016,
      { bone: armR.joints[0], color: i === 0 ? "#8c1f24" : "#1f4a47" },
    );
  }

  // ---------------------------------------------------------------------------
  // 8. BONE FETISH NECKLACE
  // ---------------------------------------------------------------------------

  // Necklace cord draped around throat
  const neckLoop = catmull(
    [
      [0, 1.76, 0.2],
      [0.16, 1.7, 0.14],
      [0.22, 1.58, 0.08],
      [0.12, 1.5, 0.18],
      [0, 1.48, 0.22],
      [-0.12, 1.5, 0.18],
      [-0.22, 1.58, 0.08],
      [-0.16, 1.7, 0.14],
    ],
    { closed: true },
  );
  b.sweep(neckLoop, 0.005, { bone: chest, color: LEATHER_DARK });

  // Centerpiece fetish skull (carved goblin skull with burning yellow embers)
  b.part(new THREE.SphereGeometry(0.042, 8, 6), bonePaint, {
    bone: chest,
    at: [0, 1.4, 0.24],
    scale: [0.85, 1.0, 0.9],
  });
  // Glowing eye embers inside fetish skull
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.007, 6, 4), "#ffaa00", {
        bone: chest,
        at: [s * 0.014, 1.41, 0.27],
      }),
      2.0,
    );
  }

  // Claws dangling beneath fetish skull
  for (let i = -1; i <= 1; i++) {
    b.spike(
      [i * 0.018, 1.36, 0.24],
      [i * 0.022, 1.28, 0.25],
      null,
      0.006,
      { bone: chest, color: BONE_BASE },
    );
  }

  // Flanking predator teeth & beads along necklace
  for (const s of [1, -1]) {
    // 3 curved teeth per side
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

    // Carved wooden voodoo beads
    for (let i = 0; i < 2; i++) {
      const t = 0.5 + s * (0.12 + i * 0.08);
      const pt = neckLoop.at(t);
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 6), i === 0 ? "#b87a28" : "#2ba898", {
        bone: chest,
        at: pt,
        dir: neckLoop.tangentAt(t),
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 9. LIMBS & APPENDAGES
  // ---------------------------------------------------------------------------

  // Thighs
  b.sweep(legL.span(0), (t) => [0.11 * (1 - t * 0.25), 0.13 * (1 - t * 0.25)], { color: trollSkin });
  b.sweep(legR.span(0), (t) => [0.11 * (1 - t * 0.25), 0.13 * (1 - t * 0.25)], { color: trollSkin });

  // Calves: high muscular sweep tapering to long lean ankles
  b.sweep(legL.span(1), (t) => [0.095 * (1 - t * 0.45), 0.085 * (1 - t * 0.45)], { color: trollSkin });
  b.sweep(legR.span(1), (t) => [0.095 * (1 - t * 0.45), 0.085 * (1 - t * 0.45)], { color: trollSkin });

  // Knee caps
  b.part(new THREE.SphereGeometry(0.045, 8, 6), trollSkin, {
    bone: legL.joints[1],
    at: legLPts[1],
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), trollSkin, {
    bone: legR.joints[1],
    at: legRPts[1],
  });

  // Ankle cloth wraps
  for (const [legJoint, pos] of [[legL.joints[1], footLPos], [legR.joints[1], footRPos]] as const) {
    b.part(new THREE.CylinderGeometry(0.05, 0.055, 0.08, 8), RAG_CLOTH, {
      bone: legJoint,
      at: [pos[0], pos[1] + 0.05, pos[2]],
    });
  }

  // Upper Arms
  b.sweep(armL.span(0), (t) => 0.085 * (1 - t * 0.2), { color: trollSkin });
  b.sweep(armR.span(0), (t) => 0.085 * (1 - t * 0.2), { color: trollSkin });

  // Forearms (Muscular brachiating taper)
  b.sweep(armL.span(1), (t) => [0.075 * (1 - t * 0.25) + 0.015, 0.065], { color: trollSkin });
  b.sweep(armR.span(1), (t) => [0.075 * (1 - t * 0.25) + 0.015, 0.065], { color: trollSkin });

  // Left arm leather bracer with 3 bone quills tied on
  b.part(new THREE.CylinderGeometry(0.062, 0.056, 0.12, 8), LEATHER_DARK, {
    bone: armL.joints[1],
    at: [0.49, 1.15, 0.28],
    dir: [0.1, -1, 0.5],
  });
  for (let i = -1; i <= 1; i++) {
    b.spike(
      [0.55 + i * 0.015, 1.22, 0.28],
      [0.55 + i * 0.015, 1.08, 0.28],
      null,
      0.007,
      { bone: armL.joints[1], color: BONE_BASE },
    );
  }

  // Right wrist spiked leather cuff
  b.part(new THREE.CylinderGeometry(0.058, 0.052, 0.06, 8), LEATHER_DARK, {
    bone: armR.joints[1],
    at: [-0.49, 1.02, 0.14],
    dir: [-0.2, -1, 0.2],
  });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    b.part(new THREE.ConeGeometry(0.008, 0.02, 5), GOLD_BRASS, {
      bone: armR.joints[1],
      at: [-0.49 + Math.cos(a) * 0.058, 1.02, 0.14 + Math.sin(a) * 0.058],
      rotation: [Math.sin(a) * 45, 0, Math.cos(a) * 45],
    });
  }

  // ---------------------------------------------------------------------------
  // 10. HANDS, CLAWS & FEET (Authentic Troll 2-Toed Anatomy)
  // ---------------------------------------------------------------------------

  // Left Hand: Palm gripping the staff
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.05), trollSkin, {
    bone: armL.joints[2],
    at: [0.46, 0.98, 0.36],
  });
  // Left fingers curling around staff
  for (let i = 0; i < 3; i++) {
    const yOff = 1.01 - i * 0.038;
    b.sweep(
      bezier([0.43, yOff, 0.35], [0.49, yOff + 0.01, 0.37], [0.46, yOff, 0.42]),
      [0.014, 0.008],
      { bone: armL.joints[2], color: trollSkin },
    );
    // Finger claw
    b.spike([0.46, yOff, 0.42], [0.43, yOff - 0.01, 0.4], null, 0.007, {
      bone: armL.joints[2],
      color: CLAW_BLACK,
    });
  }
  // Thumb
  b.sweep(
    bezier([0.44, 0.97, 0.39], [0.47, 0.95, 0.41], [0.46, 0.94, 0.37]),
    [0.015, 0.009],
    { bone: armL.joints[2], color: trollSkin },
  );

  // Right Hand: Predatory claw pose
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.05), trollSkin, {
    bone: armR.joints[2],
    at: [-0.48, 0.88, 0.18],
    rotation: [20, -15, 10],
  });
  // 3 splayed claw fingers
  for (let i = -1; i <= 1; i++) {
    const root: [number, number, number] = [-0.48 + i * 0.03, 0.86, 0.2];
    const tip: [number, number, number] = [-0.5 + i * 0.04, 0.76, 0.28];
    b.spike(root, tip, null, 0.013, { bone: armR.joints[2], color: trollSkin });
    // Claw talon
    b.spike(tip, [tip[0], tip[1] - 0.04, tip[2] + 0.03], null, 0.008, {
      bone: armR.joints[2],
      color: CLAW_BLACK,
    });
  }

  // 2-Toed Troll Feet with rear heel claw
  const buildTrollFoot = (
    pos: [number, number, number],
    boneJoint: THREE.Object3D | import("agentic-3js-builder").Joint,
    sign: number,
  ) => {
    // Foot body
    b.part(new THREE.BoxGeometry(0.13, 0.045, 0.14), trollSkin, {
      bone: boneJoint,
      at: [pos[0], pos[1] + 0.02, pos[2] - 0.02],
    });

    // Inner major toe
    b.sweep(
      bezier(
        [pos[0] + sign * 0.03, pos[1] + 0.02, pos[2]],
        [pos[0] + sign * 0.04, pos[1] + 0.015, pos[2] + 0.08],
        [pos[0] + sign * 0.05, pos[1] + 0.01, pos[2] + 0.14],
      ),
      [0.025, 0.014],
      { bone: boneJoint, color: trollSkin },
    );
    // Inner toe talon
    b.spike(
      [pos[0] + sign * 0.05, pos[1] + 0.01, pos[2] + 0.14],
      [pos[0] + sign * 0.06, pos[1], pos[2] + 0.19],
      null,
      0.01,
      { bone: boneJoint, color: CLAW_BLACK },
    );

    // Outer toe
    b.sweep(
      bezier(
        [pos[0] - sign * 0.03, pos[1] + 0.02, pos[2]],
        [pos[0] - sign * 0.04, pos[1] + 0.015, pos[2] + 0.07],
        [pos[0] - sign * 0.05, pos[1] + 0.01, pos[2] + 0.13],
      ),
      [0.023, 0.013],
      { bone: boneJoint, color: trollSkin },
    );
    // Outer toe talon
    b.spike(
      [pos[0] - sign * 0.05, pos[1] + 0.01, pos[2] + 0.13],
      [pos[0] - sign * 0.06, pos[1], pos[2] + 0.18],
      null,
      0.009,
      { bone: boneJoint, color: CLAW_BLACK },
    );

    // Rear heel spur claw
    b.spike(
      [pos[0], pos[1] + 0.03, pos[2] - 0.08],
      [pos[0], pos[1] + 0.01, pos[2] - 0.14],
      null,
      0.01,
      { bone: boneJoint, color: CLAW_BLACK },
    );
  };

  buildTrollFoot(footLPos, legL.joints[2], 1);
  buildTrollFoot(footRPos, legR.joints[2], -1);

  // ---------------------------------------------------------------------------
  // 11. LOINCLOTH & BELT
  // ---------------------------------------------------------------------------

  // Rope belt circling hips
  const beltPath = catmull(
    [
      [0, 1.15, 0.17],
      [0.19, 1.15, 0.02],
      [0, 1.15, -0.15],
      [-0.19, 1.15, 0.02],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.016, { bone: hips, color: LEATHER_DARK });

  // Carved wooden Tiki mask belt buckle
  b.part(new THREE.BoxGeometry(0.09, 0.12, 0.02), "#3a2517", {
    bone: hips,
    at: [0, 1.14, 0.18],
  });
  // Tiki face decal on buckle
  b.part(new THREE.PlaneGeometry(0.085, 0.11), "#ffffff", {
    bone: hips,
    at: [0, 1.14, 0.192],
    dir: [0, 0, 1],
    axis: "z",
    texture: TIKI_FACE,
  });

  // Front jagged tattered loincloth apron
  const loinclothOutline: [number, number, ("sharp" | undefined)?][] = [
    [-0.1, 0],
    [0.1, 0],
    [0.12, -0.2],
    [0.08, -0.38, "sharp"],
    [0.03, -0.3],
    [0.0, -0.42, "sharp"],
    [-0.04, -0.32],
    [-0.09, -0.4, "sharp"],
    [-0.11, -0.2],
  ];
  b.extrude(loinclothOutline, {
    at: [0, 1.13, 0.17],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: RAG_CLOTH,
    bone: hips,
  });

  // Tribal skull emblem decal on loincloth
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
    bone: hips,
    at: [0, 0.94, 0.18],
    dir: [0, 0, 1],
    axis: "z",
    texture: TRIBAL_SYMBOL,
  });

  // Back tattered cloth flap
  b.extrude(
    [
      [-0.11, 0],
      [0.11, 0],
      [0.09, -0.28, "sharp"],
      [0.0, -0.34, "sharp"],
      [-0.08, -0.26, "sharp"],
    ],
    {
      at: [0, 1.13, -0.15],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: RAG_CLOTH,
      bone: hips,
    },
  );

  // Side hip fetishes: vertebrae beads and leather medicine pouch
  b.part(new THREE.SphereGeometry(0.026, 6, 5), LEATHER_MED, {
    bone: hips,
    at: [-0.18, 1.08, 0.08],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), BONE_BASE, {
    bone: hips,
    at: [-0.19, 1.03, 0.08],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), BONE_BASE, {
    bone: hips,
    at: [-0.19, 0.99, 0.08],
  });

  // ---------------------------------------------------------------------------
  // 12. VOODOO SWAMP STAFF & SOUL WISP
  // ---------------------------------------------------------------------------

  // Gnarled bog-oak staff shaft held in left hand and resting on swamp ground
  const staffCurve = catmull([
    [0.48, 0.06, 0.4],
    [0.47, 0.5, 0.39],
    [0.46, 0.98, 0.38],
    [0.45, 1.45, 0.36],
    [0.44, 1.85, 0.37],
    [0.43, 2.18, 0.36],
  ]);
  b.sweep(staffCurve, (t) => 0.028 * (1 - t * 0.35) + 0.008, {
    color: woodBark,
  });

  // Staff Head: Carved wooden Loa Effigy Mask
  const effigyCenter: [number, number, number] = [0.43, 2.05, 0.36];
  b.part(new THREE.BoxGeometry(0.13, 0.18, 0.13), "#352215", {
    at: effigyCenter,
    rotation: [0, -15, 0],
  });

  // Glowing ethereal swamp soul wisp / will-o'-the-wisp inside effigy head
  glow(
    b.part(new THREE.SphereGeometry(0.048, 10, 8), "#3df2cd", {
      at: [0.43, 2.05, 0.37],
    }),
    2.5,
  );

  // Curved ram horns sprouting from staff top
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [0.43 + s * 0.05, 2.12, 0.36],
        [0.43 + s * 0.14, 2.24, 0.34],
        [0.43 + s * 0.18, 2.18, 0.38],
      ),
      [0.016, 0.004],
      { color: BONE_BASE, caps: { end: "point" } },
    );
  }

  // Dangling bone charms hanging from horns
  for (const s of [1, -1]) {
    b.capsule([0.43 + s * 0.17, 2.16, 0.38], [0.43 + s * 0.17, 2.02, 0.38], 0.003, {
      color: LEATHER_DARK,
    });
    b.spike([0.43 + s * 0.17, 2.02, 0.38], [0.43 + s * 0.17, 1.94, 0.38], null, 0.008, {
      color: BONE_BASE,
    });
  }

  // Hanging swamp moss strands from staff crossbar
  for (let i = 0; i < 3; i++) {
    b.sweep(
      bezier(
        [0.39 + i * 0.04, 1.96, 0.36],
        [0.4 + i * 0.04, 1.85, 0.38],
        [0.38 + i * 0.04, 1.72, 0.36],
      ),
      [0.008, 0.002],
      { color: "#3e5229" },
    );
  }

  // ---------------------------------------------------------------------------
  // 13. STAGED SWAMP VIGNETTE (Base, Mud, Lily Pads, Cattails & Mushrooms)
  // ---------------------------------------------------------------------------

  // Ground base mound (squashed dark mud bank)
  // Height = 0.08m, center at y = 0.04, so its bottom touches y = 0 exactly
  b.part(new THREE.CylinderGeometry(0.88, 0.92, 0.08, 24), SWAMP_MUD, {
    at: [0, 0.04, 0],
  });

  // Top surface peat moss
  b.part(new THREE.CylinderGeometry(0.85, 0.88, 0.03, 24), SWAMP_MOSS, {
    at: [0, 0.08, 0],
  });

  // Murky deep swamp water puddle
  b.part(new THREE.CylinderGeometry(0.32, 0.35, 0.015, 18), SWAMP_WATER, {
    at: [-0.36, 0.088, 0.3],
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
      [-0.32, 0.1, 0.26],
      [-0.32 + Math.cos(a) * 0.032, 0.12, 0.26 + Math.sin(a) * 0.032],
      null,
      0.007,
      { color: "#e63980" },
    );
  }

  // Gnarled cypress swamp root arching behind right heel
  b.sweep(
    bezier([-0.5, 0.06, -0.3], [-0.35, 0.22, -0.35], [-0.15, 0.06, -0.4]),
    [0.045, 0.025],
    { color: "#2d2016" },
  );

  // Swamp Cattails / Reeds along the murky pool
  const reedCoords: [number, number][] = [
    [-0.56, 0.22],
    [-0.52, 0.38],
    [-0.6, 0.32],
  ];
  reedCoords.forEach(([rx, rz]) => {
    // Green reed stem
    b.rod([rx, 0.08, rz], [rx + 0.02, 0.54, rz], 0.005, { color: "#3d542b" });
    // Velvety brown cattail head
    b.capsule([rx + 0.015, 0.4, rz], [rx + 0.02, 0.52, rz], 0.013, { color: "#452615" });
  });

  // Bioluminescent Glowing Swamp Mushrooms (Bioluminescent Voodoo Spores)
  const mushroomData: [number, number, number][] = [
    [0.34, 0.52, 0.08],
    [0.38, 0.58, 0.065],
    [-0.2, -0.42, 0.07],
  ];
  mushroomData.forEach(([mx, mz, scale]) => {
    // Pale fungus stem
    b.capsule([mx, 0.08, mz], [mx, 0.08 + scale, mz], scale * 0.18, { color: "#d2d8c7" });
    // Glowing eerie turquoise mushroom cap
    glow(
      b.part(new THREE.ConeGeometry(scale * 0.75, scale * 0.4, 8), "#2ee6c2", {
        at: [mx, 0.08 + scale, mz],
      }),
      2.0,
    );
  });

  return b.root;
}
```