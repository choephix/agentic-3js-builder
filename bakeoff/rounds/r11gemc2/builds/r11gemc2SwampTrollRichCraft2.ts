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
    "A Warcraft-inspired swamp troll witch doctor with flared ivory tusks, blazing flame mohawk, bog-beast skull pauldron, casting hand with swirling voodoo mojo, and carved soul staff on a murky bayou mound.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "swamp_troll" });

  // ---------------------------------------------------------------------------
  // 1. PALETTE & PAINTS (Blizzard Hand-Painted Warcraft Style)
  // ---------------------------------------------------------------------------

  const SKIN_BASE = "#225e4f";
  const SKIN_LIGHT = "#429880";
  const SKIN_SHADOW = "#122b23";
  const SKIN_BELLY = "#5eb596";
  const WARPAINT = "#a31818";

  // Troll skin: rich mossy teal, pale belly countershading, mud on boots, and crisp ritual warpaint
  const trollSkin = paint((p, n) => {
    const gn = noise(p, 0.12, 11);
    let c = mix(SKIN_BASE, SKIN_LIGHT, smoothstep(0.32, 0.68, gn));

    // Pale belly and chest countershading
    if (n.y < 0.3 && n.z > -0.15) {
      const belly = smoothstep(0.3, -0.35, n.y) * smoothstep(-0.15, 0.35, n.z);
      c = mix(c, rgb(SKIN_BELLY), belly * 0.65);
    }

    // Ambient occlusion in crevices and underbelly
    if (n.y < -0.3) {
      c = mix(c, rgb(SKIN_SHADOW), 0.5);
    }

    // Bayou mud spatter on lower shins and feet
    if (p.y < 0.40) {
      const mud = smoothstep(0.40, 0.10, p.y);
      c = mix(c, rgb("#1b1612"), mud * 0.7);
    }

    // Purposeful ritual chest warpaint (chevron tribal crest across pectorals)
    if (p.y > 1.28 && p.y < 1.62 && n.z > 0.25) {
      const dy = p.y - 1.44;
      const chevron1 = Math.abs(dy - Math.abs(p.x) * 0.45);
      const chevron2 = Math.abs(dy - Math.abs(p.x) * 0.45 + 0.08);
      if (chevron1 < 0.024 || chevron2 < 0.024) {
        c = mix(c, rgb(WARPAINT), 0.92);
      }
    }

    // Shoulder warpaint stripes
    if (p.y > 1.35 && p.y < 1.60 && Math.abs(p.x) > 0.28) {
      const band = Math.sin(p.y * 28 + Math.abs(p.x) * 8);
      if (band > 0.65) {
        c = mix(c, rgb(WARPAINT), 0.88);
      }
    }

    return c;
  });

  // Blazing flame mohawk: deep crimson root -> orange-red -> flame gold tip
  const mohawkPaint = paint((p) => {
    const t = smoothstep(1.72, 2.38, p.y + p.z * 0.25);
    if (t < 0.30) return mix("#4d060c", "#bd1818", t / 0.30);
    if (t < 0.72) return mix("#bd1818", "#ff6200", (t - 0.30) / 0.42);
    return mix("#ff6200", "#ffea00", (t - 0.72) / 0.28);
  });

  // Ancient aged ivory / bone with deep brown-black crevices
  const BONE_BASE = "#ded2b4";
  const BONE_TIP = "#f5f0db";
  const BONE_STAIN = "#4a3520";
  const bonePaint = paint((p, n) => {
    const gn = noise(p, 0.06, 9);
    let c = mix(BONE_BASE, BONE_TIP, gn);
    if (n.y < -0.25) c = mix(c, rgb(BONE_STAIN), 0.55);
    return c;
  });

  // Gnarled bog-wood bark
  const woodBark = paint((p) => {
    const gn = noise(p, 0.05, 23);
    return mix("#231811", "#422f21", gn);
  });

  // Accent colours
  const GOLD_BRASS = "#d99f2b";
  const LEATHER_DARK = "#241810";
  const LEATHER_MED = "#442e1d";
  const RAG_CLOTH = "#354228";
  const CLAW_BLACK = "#12100d";
  const SWAMP_MUD = "#19140f";
  const SWAMP_MOSS = "#2e3f1e";
  const SWAMP_WATER = "#0b1c11";
  const VOODOO_CYAN = "#18f0c8";
  const VOODOO_GREEN = "#38ff6a";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES & DECALS (SVG)
  // ---------------------------------------------------------------------------

  const TRIBAL_SYMBOL = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 12 L96 48 L84 108 L64 120 L44 108 L32 48 Z" fill="#ded2b4" stroke="#1f140b" stroke-width="4"/>
      <circle cx="50" cy="54" r="8" fill="#8f1616"/>
      <circle cx="78" cy="54" r="8" fill="#8f1616"/>
      <path d="M46 86 L64 98 L82 86" stroke="#8f1616" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M42 28 L20 14 M86 28 L108 14" stroke="#ded2b4" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const TIKI_FACE = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="16" fill="#362114"/>
      <polygon points="20,40 56,52 24,64" fill="#ffaa00"/>
      <polygon points="108,40 72,52 104,64" fill="#ffaa00"/>
      <polygon points="64,30 52,74 76,74" fill="#180e07"/>
      <rect x="28" y="84" width="72" height="28" rx="4" fill="#120904"/>
      <rect x="34" y="86" width="10" height="11" fill="#ded2b4"/>
      <rect x="48" y="86" width="10" height="11" fill="#ded2b4"/>
      <rect x="62" y="86" width="10" height="11" fill="#ded2b4"/>
      <rect x="76" y="86" width="10" height="11" fill="#ded2b4"/>
      <rect x="90" y="86" width="10" height="11" fill="#ded2b4"/>
      <rect x="41" y="100" width="10" height="11" fill="#ded2b4"/>
      <rect x="55" y="100" width="10" height="11" fill="#ded2b4"/>
      <rect x="69" y="100" width="10" height="11" fill="#ded2b4"/>
      <rect x="83" y="100" width="10" height="11" fill="#ded2b4"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON & RIG (Deep, Springy Warcraft Crouch)
  // ---------------------------------------------------------------------------

  // Lowered hips for predatory crouch
  const hips = b.joint("hips", { at: [0, 0.98, -0.12], role: "spine" });

  // Hunched forward spine
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.12],
      [0, 1.18, -0.18],
      [0, 1.40, -0.10],
      [0, 1.56, 0.06],
    ]),
    {
      parent: hips,
      role: "spine",
      names: ["spine1", "spine2", "chest"],
    },
  );
  const chest = spine.joints[2];

  // Head and jaw angled menacingly forward
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.56, 0.06],
    aim: [0, 1.66, 0.22],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.66, 0.22],
    dir: [0, -0.06, 0.99],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.58, 0.26],
    aim: [0, 1.48, 0.44],
    role: "jaw",
  });

  // Digitigrade legs in deep crouch (knees thrust forward, shins sweeping back)
  const hipL = b.joint("hipL", { parent: hips, at: [0.22, 0.94, -0.10], role: "leg" });
  const hipR = b.joint("hipR", { parent: hips, at: [-0.22, 0.94, -0.10], role: "leg" });

  const footLPos: [number, number, number] = [0.32, 0.08, 0.04];
  const footRPos: [number, number, number] = [-0.32, 0.08, -0.16];

  const legLPts = limb(hipL.at, footLPos, [0.54, 0.52], [0, 0.2, 1]);
  const legRPts = limb(hipR.at, footRPos, [0.54, 0.52], [0, 0.2, 1]);

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

  // Arms: Left holds staff planted wide to the side; Right raises voodoo casting claw
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.36, 1.52, 0.06], role: "arm" });
  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.36, 1.52, 0.06], role: "arm" });

  // Plant staff at x = 0.60, z = 0.32 so it frames the silhouette without hiding the torso
  const handLPos: [number, number, number] = [0.60, 0.90, 0.32];
  // Raised claw hand channeling mojo
  const handRPos: [number, number, number] = [-0.44, 1.12, 0.38];

  const armLPts = limb(shoulderL.at, handLPos, [0.46, 0.44], [0.6, -0.4, 0.4]);
  const armRPts = limb(shoulderR.at, handRPos, [0.44, 0.42], [-0.8, 0.1, 0.5]);

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

  b.loft(
    [
      { at: hips.at, w: 0.38, h: 0.32 },
      { at: spine.joints[0].at, w: 0.34, h: 0.28 },
      { at: spine.joints[1].at, w: 0.48, h: 0.36 },
      { at: spine.joints[2].at, w: 0.56, h: 0.42 },
    ],
    { bone: [hips, ...spine.joints], color: trollSkin },
  );

  // Signature muscular dorsal hunch
  b.sweep(
    catmull([
      [0, 1.34, -0.16],
      [0, 1.56, -0.10],
      [0, 1.70, 0.06],
    ]),
    (t) => 0.17 * Math.sin(t * Math.PI) + 0.06,
    { bone: chest, color: trollSkin },
  );

  // Chiseled pectorals
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.18, 0.16, 0.09), trollSkin, {
      bone: chest,
      at: [s * 0.13, 1.48, 0.16],
      rotation: [15, s * -15, s * -10],
    });

    // Rib cage sinews
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.13, 0.022, 0.045), trollSkin, {
        bone: spine.joints[1],
        at: [s * 0.18, 1.32 - i * 0.065, 0.04 - i * 0.03],
        rotation: [10, s * -35, s * -15],
      });
    }
  }

  // Vertebrae spines protruding through back
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.ConeGeometry(0.016, 0.045, 5), bonePaint, {
      bone: spine.joints[Math.min(i, 2)],
      at: [0, 1.12 + i * 0.105, -0.17 + i * 0.025],
      rotation: [-45, 0, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // 5. HERO FACE: WIDE FLARING TUSKS, PROMINENT EYES & AQUILINE SNOUT
  // ---------------------------------------------------------------------------

  // Head cranium
  b.part(new THREE.SphereGeometry(0.13, 12, 10), trollSkin, {
    bone: head,
    at: [0, 1.68, 0.22],
    scale: [0.95, 1.08, 1.15],
  });

  // Curved brow ridge
  b.capsule([-0.10, 1.72, 0.31], [0.10, 1.72, 0.31], 0.022, {
    bone: head,
    color: trollSkin,
  });

  // Long hooked troll snout (narrow bridge so eyes are completely clear)
  const snoutPath = catmull([
    [0, 1.74, 0.30],
    [0, 1.70, 0.42],
    [0, 1.61, 0.51],
    [0, 1.53, 0.52], // Pierced, hooked tip
  ]);
  b.sweep(snoutPath, (t) => [0.032 * (1 - t * 0.35), 0.028 * (1 - t * 0.3)], {
    bone: head,
    color: trollSkin,
    caps: { start: "round", end: "point" },
  });

  // Nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 5), "#10211a", {
      bone: head,
      at: [s * 0.022, 1.56, 0.49],
      scale: [0.8, 0.8, 1.1],
    });
  }

  // Septum bone needle pierced through snout tip
  b.capsule([-0.065, 1.57, 0.49], [0.065, 1.57, 0.49], 0.007, {
    bone: head,
    color: bonePaint,
  });

  // HERO GLOWING AMBER EYES (Clear, unobstructed, high-contrast)
  for (const s of [1, -1]) {
    // Red ritual warpaint streak under eye
    b.part(new THREE.BoxGeometry(0.055, 0.012, 0.02), WARPAINT, {
      bone: head,
      at: [s * 0.09, 1.66, 0.33],
      rotation: [5, s * 25, s * -12],
    });

    // Eye socket crease
    b.part(new THREE.TorusGeometry(0.025, 0.008, 6, 12), "#0c1a14", {
      bone: head,
      at: [s * 0.082, 1.69, 0.33],
      rotation: [8, s * 24, 0],
    });

    // Glowing eyeball
    glow(
      b.part(new THREE.SphereGeometry(0.019, 8, 6), "#ffae00", {
        bone: head,
        at: [s * 0.082, 1.69, 0.33],
      }),
      2.8,
    );

    // Slit pupil
    b.part(new THREE.BoxGeometry(0.004, 0.02, 0.003), "#0c0802", {
      bone: head,
      at: [s * 0.082, 1.69, 0.348],
      rotation: [8, s * 24, 0],
    });
  }

  // Lower jaw in a wide predatory sneer
  b.part(new THREE.BoxGeometry(0.17, 0.085, 0.17), trollSkin, {
    bone: jaw,
    at: [0, 1.51, 0.34],
    rotation: [-14, 0, 0],
  });

  // Mouth cavity & dark lips
  b.part(new THREE.SphereGeometry(0.04, 6, 5), "#471418", {
    bone: jaw,
    at: [0, 1.52, 0.34],
    scale: [0.8, 0.35, 1.3],
  });

  // Upper incisor fangs
  for (const s of [1, -1]) {
    b.spike([s * 0.04, 1.57, 0.36], [s * 0.04, 1.50, 0.38], null, 0.008, {
      bone: head,
      color: BONE_BASE,
    });
  }

  // WARCRAFT TUSKS: WIDE FLARING BRACKET SILHOUETTE
  // Rooted wide at jaw corners, flaring outward to clear eyes, then hooking up and back
  for (const s of [1, -1]) {
    const root: [number, number, number] = [s * 0.13, 1.50, 0.36];
    const p1: [number, number, number] = [s * 0.28, 1.56, 0.46]; // Flaring wide outward!
    const p2: [number, number, number] = [s * 0.30, 1.82, 0.40]; // Sweeping up outside cheeks!
    const tip: [number, number, number] = [s * 0.24, 2.06, 0.28]; // Hooking back and up
    const tuskCurve = bezier(root, p1, p2, tip);

    b.sweep(tuskCurve, (t) => (1 - t) * 0.038 + 0.004, {
      bone: jaw,
      color: bonePaint,
      caps: { start: "flat", end: "point" },
    });

    // Gold ritual engraved band around mid-tusk
    const midPt = tuskCurve.at(0.48);
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 10), GOLD_BRASS, {
      bone: jaw,
      at: midPt,
      dir: tuskCurve.tangentAt(0.48),
    });

    // Secondary lower tusk
    b.spike([s * 0.05, 1.52, 0.42], [s * 0.06, 1.61, 0.45], null, 0.009, {
      bone: jaw,
      color: BONE_BASE,
    });
  }

  // Long swept-back pierced ears
  for (const s of [1, -1]) {
    const earBase: [number, number, number] = [s * 0.11, 1.68, 0.20];
    const earMid: [number, number, number] = [s * 0.28, 1.72, 0.08];
    const earTip: [number, number, number] = [s * 0.44, 1.78, -0.06];
    const earCurve = catmull([earBase, earMid, earTip]);

    b.sweep(earCurve, (t) => [0.042 * (1 - t * 0.75), 0.013 * (1 - t * 0.75)], {
      bone: head,
      color: trollSkin,
      caps: { start: "round", end: "point" },
    });

    // Gold hoops
    b.part(new THREE.TorusGeometry(0.02, 0.0035, 8, 14), GOLD_BRASS, {
      bone: head,
      at: earCurve.at(0.45),
      rotation: [0, s * 40, s * 25],
    });
    b.part(new THREE.TorusGeometry(0.016, 0.003, 8, 14), GOLD_BRASS, {
      bone: head,
      at: earCurve.at(0.72),
      rotation: [0, s * 45, s * 30],
    });
  }

  // ---------------------------------------------------------------------------
  // 6. SWEPT-BACK FLAME MOHAWK
  // ---------------------------------------------------------------------------

  // Continuous scalp ridge
  const crestPath = catmull([
    [0, 1.74, 0.36],
    [0, 1.82, 0.28],
    [0, 1.82, 0.14],
    [0, 1.72, 0.00],
    [0, 1.56, -0.12],
  ]);
  b.sweep(crestPath, 0.042, {
    bone: head,
    color: mohawkPaint,
    caps: { start: "round", end: "round" },
  });

  // Layered flame spikes sweeping back and up dynamically
  const mohawkSpikes: [number, number, number, number, number, number, number][] = [
    [0, 1.76, 0.34, 0, 2.02, 0.40, 0.034],
    [0, 1.82, 0.29, 0, 2.18, 0.34, 0.040],
    [0, 1.84, 0.22, 0, 2.32, 0.24, 0.044],
    [0, 1.85, 0.14, 0, 2.36, 0.12, 0.046], // Tallest peak
    [0, 1.82, 0.06, 0, 2.28, 0.00, 0.044],
    [0, 1.76, -0.02, 0, 2.16, -0.12, 0.040],
    [0, 1.68, -0.07, 0, 1.98, -0.18, 0.034],
    [0, 1.56, -0.11, 0, 1.76, -0.22, 0.028],
  ];

  mohawkSpikes.forEach(([bx, by, bz, tx, ty, tz, r], idx) => {
    const parentBone = idx < 5 ? head : idx < 6 ? neck : chest;
    b.spike([bx, by, bz], [tx, ty, tz], null, r, {
      bone: parentBone,
      color: mohawkPaint,
    });

    // Flanking lateral hair blades
    if (idx < 6) {
      for (const s of [1, -1]) {
        b.spike(
          [bx + s * 0.026, by - 0.015, bz],
          [tx + s * 0.045, ty - 0.03, tz],
          null,
          r * 0.72,
          { bone: parentBone, color: mohawkPaint },
        );
      }
    }
  });

  // Bone ring hair clasp at nape
  b.part(new THREE.TorusGeometry(0.032, 0.007, 8, 14), bonePaint, {
    bone: neck,
    at: [0, 1.68, -0.01],
    rotation: [45, 0, 0],
  });

  // ---------------------------------------------------------------------------
  // 7. BOG-BEAST SKULL PAULDRON (Right Shoulder)
  // ---------------------------------------------------------------------------

  const skullCenter: [number, number, number] = [-0.40, 1.60, 0.06];

  b.part(new THREE.SphereGeometry(0.10, 8, 6), bonePaint, {
    bone: armR.joints[0],
    at: skullCenter,
    scale: [0.85, 0.75, 1.25],
  });

  // Pauldron beast snout
  b.spike([-0.40, 1.58, 0.14], [-0.40, 1.50, 0.32], null, 0.054, {
    bone: armR.joints[0],
    color: bonePaint,
  });

  // Glowing red eye sockets
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), "#100c08", {
      bone: armR.joints[0],
      at: [-0.40 + s * 0.046, 1.61, 0.14],
    });
    glow(
      b.part(new THREE.SphereGeometry(0.009, 6, 4), "#ff3300", {
        bone: armR.joints[0],
        at: [-0.40 + s * 0.046, 1.61, 0.15],
      }),
      2.2,
    );
  }

  // Beast horns on pauldron
  b.sweep(
    bezier([-0.40, 1.66, 0.02], [-0.44, 1.84, -0.04], [-0.40, 1.98, 0.04]),
    [0.024, 0.004],
    { bone: armR.joints[0], color: BONE_BASE, caps: { end: "point" } },
  );

  // Harness straps
  const strapChest = catmull([
    [-0.34, 1.60, 0.08],
    [-0.10, 1.44, 0.18],
    [0.12, 1.30, 0.12],
  ]);
  b.sweep(strapChest, 0.018, { bone: chest, color: LEATHER_MED });

  const strapBack = catmull([
    [-0.34, 1.60, 0.04],
    [-0.12, 1.42, -0.12],
    [0.10, 1.28, -0.10],
  ]);
  b.sweep(strapBack, 0.018, { bone: chest, color: LEATHER_MED });

  // Brass studs on harness
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_BRASS, {
    bone: chest,
    at: [-0.22, 1.52, 0.14],
  });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD_BRASS, {
    bone: chest,
    at: [0.0, 1.37, 0.15],
  });

  // Hanging swamp crane feathers from pauldron
  for (let i = 0; i < 2; i++) {
    b.spike(
      [-0.44 - i * 0.02, 1.52, 0.06],
      [-0.47 - i * 0.03, 1.28, 0.08 + i * 0.04],
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
      [0, 1.58, 0.18],
      [0.16, 1.52, 0.12],
      [0.22, 1.40, 0.06],
      [0.12, 1.32, 0.16],
      [0, 1.30, 0.20],
      [-0.12, 1.32, 0.16],
      [-0.22, 1.40, 0.06],
      [-0.16, 1.52, 0.12],
    ],
    { closed: true },
  );
  b.sweep(neckLoop, 0.005, { bone: chest, color: LEATHER_DARK });

  // Centerpiece fetish skull with glowing amber eyes
  b.part(new THREE.SphereGeometry(0.044, 8, 6), bonePaint, {
    bone: chest,
    at: [0, 1.22, 0.22],
    scale: [0.85, 1.0, 0.9],
  });
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.007, 6, 4), "#ff9900", {
        bone: chest,
        at: [s * 0.014, 1.23, 0.25],
      }),
      2.2,
    );
  }

  // Claws dangling beneath fetish skull
  for (let i = -1; i <= 1; i++) {
    b.spike([i * 0.018, 1.18, 0.22], [i * 0.022, 1.10, 0.23], null, 0.007, {
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
  // 9. LIMBS & PROPORTIONS
  // ---------------------------------------------------------------------------

  const legRadius = (t: number): [number, number] =>
    t < 0.5
      ? [0.11 - t * 0.05, 0.13 - t * 0.07]
      : [0.085 - (t - 0.5) * 0.06, 0.08 - (t - 0.5) * 0.05];

  b.sweep(legL, legRadius, { color: trollSkin });
  b.sweep(legR, legRadius, { color: trollSkin });

  // Knee guards
  b.part(new THREE.SphereGeometry(0.048, 8, 6), trollSkin, {
    bone: legL.joints[1],
    at: legLPts[1],
  });
  b.part(new THREE.SphereGeometry(0.048, 8, 6), trollSkin, {
    bone: legR.joints[1],
    at: legRPts[1],
  });

  // Ankle wraps
  for (const [legJoint, pos] of [[legL.joints[1], footLPos], [legR.joints[1], footRPos]] as const) {
    b.part(new THREE.CylinderGeometry(0.052, 0.058, 0.08, 8), RAG_CLOTH, {
      bone: legJoint,
      at: [pos[0], pos[1] + 0.05, pos[2]],
    });
  }

  const armRadius = (t: number): [number, number] =>
    t < 0.5
      ? [0.09 - t * 0.04, 0.09 - t * 0.04]
      : [0.078 - (t - 0.5) * 0.035, 0.068 - (t - 0.5) * 0.03];

  b.sweep(armL, armRadius, { color: trollSkin });
  b.sweep(armR, armRadius, { color: trollSkin });

  // Left arm leather bracer
  b.part(new THREE.CylinderGeometry(0.064, 0.058, 0.12, 8), LEATHER_DARK, {
    bone: armL.joints[1],
    at: [0.57, 1.04, 0.28],
    dir: [0.1, -1, 0.3],
  });
  for (let i = -1; i <= 1; i++) {
    b.spike([0.63 + i * 0.015, 1.10, 0.28], [0.63 + i * 0.015, 0.97, 0.28], null, 0.007, {
      bone: armL.joints[1],
      color: BONE_BASE,
    });
  }

  // Right wrist spiked leather cuff
  b.part(new THREE.CylinderGeometry(0.06, 0.054, 0.06, 8), LEATHER_DARK, {
    bone: armR.joints[1],
    at: [-0.44, 1.18, 0.32],
    dir: [-0.1, -0.6, 0.8],
  });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    b.part(new THREE.ConeGeometry(0.008, 0.02, 5), GOLD_BRASS, {
      bone: armR.joints[1],
      at: [-0.44 + Math.cos(a) * 0.06, 1.18, 0.32 + Math.sin(a) * 0.06],
      rotation: [Math.sin(a) * 45, 0, Math.cos(a) * 45],
    });
  }

  // ---------------------------------------------------------------------------
  // 10. HANDS, CLAWS, MOJO MAGIC & 2-TOED FEET
  // ---------------------------------------------------------------------------

  // Left Hand: Securely gripping the staff at x = 0.60
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.05), trollSkin, {
    bone: armL.joints[2],
    at: [0.60, 0.90, 0.30],
  });
  for (let i = 0; i < 3; i++) {
    const yOff = 0.93 - i * 0.034;
    b.sweep(
      bezier([0.57, yOff, 0.29], [0.63, yOff + 0.01, 0.31], [0.60, yOff, 0.36]),
      [0.014, 0.008],
      { bone: armL.joints[2], color: trollSkin },
    );
    b.spike([0.60, yOff, 0.36], [0.57, yOff - 0.01, 0.34], null, 0.007, {
      bone: armL.joints[2],
      color: CLAW_BLACK,
    });
  }

  // Right Hand: Menacing Voodoo Casting Claw with Swirling Mojo
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.05), trollSkin, {
    bone: armR.joints[2],
    at: handRPos,
    rotation: [15, -20, 25],
  });

  // Long predatory casting claws
  const clawTips: [number, number, number][] = [];
  for (let i = -1; i <= 1; i++) {
    const root: [number, number, number] = [-0.44 + i * 0.035, 1.14, 0.40];
    const midK: [number, number, number] = [-0.46 + i * 0.045, 1.18, 0.48];
    const tip: [number, number, number] = [-0.45 + i * 0.05, 1.24, 0.52];
    b.sweep(bezier(root, midK, tip), [0.014, 0.007], {
      bone: armR.joints[2],
      color: trollSkin,
    });
    b.spike(tip, [tip[0], tip[1] + 0.04, tip[2] + 0.02], null, 0.007, {
      bone: armR.joints[2],
      color: CLAW_BLACK,
    });
    clawTips.push(tip);
  }

  // SWIRLING VOODOO MOJO MAGIC (Glowing Cyan & Emerald Wisps around Casting Hand)
  glow(
    b.part(new THREE.SphereGeometry(0.035, 8, 6), VOODOO_CYAN, {
      bone: armR.joints[2],
      at: [-0.44, 1.18, 0.44],
    }),
    3.0,
  );
  // Whirling mojo flame tendrils
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const flameCurve = bezier(
      [-0.44, 1.18, 0.44],
      [-0.44 + Math.cos(a) * 0.08, 1.25, 0.44 + Math.sin(a) * 0.08],
      [-0.44 + Math.cos(a + 0.8) * 0.06, 1.34, 0.44 + Math.sin(a + 0.8) * 0.06],
    );
    glow(
      b.sweep(flameCurve, [0.012, 0.002], {
        bone: armR.joints[2],
        color: i % 2 === 0 ? VOODOO_CYAN : VOODOO_GREEN,
        caps: { end: "point" },
      }),
      2.8,
    );
  }

  // 2-Toed Warcraft Feet with rear heel talons
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
  // 11. BELT & TATTERED LOINCLOTH
  // ---------------------------------------------------------------------------

  const beltPath = catmull(
    [
      [0, 0.96, 0.14],
      [0.20, 0.96, 0.00],
      [0, 0.96, -0.16],
      [-0.20, 0.96, 0.00],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.018, { bone: hips, color: LEATHER_DARK });

  // Carved wooden Tiki mask belt buckle
  b.part(new THREE.BoxGeometry(0.10, 0.13, 0.02), "#352215", {
    bone: hips,
    at: [0, 0.95, 0.15],
  });
  b.part(new THREE.PlaneGeometry(0.095, 0.12), "#ffffff", {
    bone: hips,
    at: [0, 0.95, 0.162],
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
    at: [0, 0.94, 0.14],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    color: RAG_CLOTH,
    bone: hips,
  });

  // Tribal skull emblem decal on loincloth
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    bone: hips,
    at: [0, 0.74, 0.15],
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
      at: [0, 0.94, -0.16],
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
    at: [-0.19, 0.89, 0.06],
  });
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.022, 6), BONE_BASE, {
    bone: hips,
    at: [-0.20, 0.84, 0.06],
  });
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.022, 6), BONE_BASE, {
    bone: hips,
    at: [-0.20, 0.80, 0.06],
  });

  // ---------------------------------------------------------------------------
  // 12. VOODOO SWAMP STAFF (Framing at x = 0.60, z = 0.32)
  // ---------------------------------------------------------------------------

  const staffCurve = catmull([
    [0.60, 0.08, 0.32],
    [0.60, 0.52, 0.32],
    [0.60, 0.90, 0.32],
    [0.59, 1.40, 0.31],
    [0.58, 1.80, 0.31],
    [0.57, 2.15, 0.30],
  ]);
  b.sweep(staffCurve, (t) => 0.028 * (1 - t * 0.35) + 0.008, {
    color: woodBark,
  });

  // Staff Head: Carved wooden Loa Mask Totem
  const effigyCenter: [number, number, number] = [0.57, 2.02, 0.30];
  b.part(new THREE.BoxGeometry(0.14, 0.19, 0.14), "#322013", {
    at: effigyCenter,
    rotation: [0, -22, 0],
  });

  // Glowing soul wisp inside effigy head
  glow(
    b.part(new THREE.SphereGeometry(0.052, 10, 8), VOODOO_CYAN, {
      at: [0.57, 2.02, 0.31],
    }),
    2.8,
  );

  // Curved ram horns atop staff
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [0.57 + s * 0.06, 2.09, 0.30],
        [0.57 + s * 0.16, 2.22, 0.28],
        [0.57 + s * 0.20, 2.16, 0.32],
      ),
      [0.018, 0.004],
      { color: BONE_BASE, caps: { end: "point" } },
    );
  }

  // Dangling bone charms from staff horns
  for (const s of [1, -1]) {
    b.capsule([0.57 + s * 0.19, 2.14, 0.32], [0.57 + s * 0.19, 2.00, 0.32], 0.003, {
      color: LEATHER_DARK,
    });
    b.spike([0.57 + s * 0.19, 2.00, 0.32], [0.57 + s * 0.19, 1.90, 0.32], null, 0.008, {
      color: BONE_BASE,
    });
  }

  // Hanging swamp moss strands from staff crossbar
  for (let i = 0; i < 3; i++) {
    b.sweep(
      bezier(
        [0.53 + i * 0.04, 1.92, 0.30],
        [0.54 + i * 0.04, 1.80, 0.32],
        [0.52 + i * 0.04, 1.66, 0.30],
      ),
      [0.008, 0.002],
      { color: "#3a4d26" },
    );
  }

  // ---------------------------------------------------------------------------
  // 13. STAGED BAYOU MOUND VIGNETTE (Ground at y = 0)
  // ---------------------------------------------------------------------------

  // Ground base mound (height = 0.08, center y = 0.04 -> lowest touches y = 0)
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
      b.part(new THREE.ConeGeometry(scale * 0.75, scale * 0.4, 8), VOODOO_CYAN, {
        at: [mx, 0.08 + scale, mz],
      }),
      2.2,
    );
  });

  return b.root;
}
