import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";
import { aim, DEG, lerp, mid, offset, rng, vec } from "../../../../src/index";
import { arc, bezier, catmull, polyline, spiral } from "../../../../src/index";
import { limb } from "../../../../src/index";
import { paint, rgb, mix, smoothstep, noise } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil } from "../../../../kits/clockwork";
import { stepped } from "../../../../kits/pixel";

export const meta = {
  name: "Overwatch Cyborg Medic Hero",
  description:
    "Heroic combat support cyborg equipped with photonic hardlight wings, biotic stim injectors, and the Caduceus healing staff.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "cyborg_medic", paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // COLOR PALETTE & PAINTS (Overwatch Hero Aesthetic)
  // ---------------------------------------------------------------------------
  const C_WHITE = "#f3f6fa"; // Gloss ceramic composite armor
  const C_SLATE = "#2d3545"; // Heavy tactical sub-armor
  const C_CARBON = "#16181d"; // Flexible nano-weave under-suit
  const C_GOLD = "#f5aa27"; // Anodized alloy joints & trim
  const C_GOLD_BRIGHT = "#fed766";
  const C_RED = "#ff2a4b"; // Medical emergency coral red
  const C_CYAN = "#00f0ff"; // Biotic energy / Hardlight glow
  const C_CYAN_DEEP = "#0088cc";
  const C_PORCELAIN = "#f4e8dc"; // Synthetic android facial skin
  const C_CHROME = "#c8d6e5"; // Polished hydraulic pistons
  const C_BASE_DARK = "#12151b"; // Stage platform rim
  const C_BASE_PANEL = "#1a1f28"; // Platform stepping deck

  // Advanced stylized ceramic armor paint with subtle panel edge wear
  const P_ARMOR = paint((p, n) => {
    const edge = smoothstep(0.35, 0.85, Math.abs(n.y) * 0.4 + noise(p, 0.08, 4) * 0.6);
    return mix(C_WHITE, "#e1e7f0", edge * 0.25);
  });

  // Carbon nano-weave paint for joints and undersuit
  const P_CARBON = paint((p, _n) => {
    const weave = (Math.sin(p.x * 220) * Math.sin(p.y * 220) + 1) * 0.5;
    return mix(C_CARBON, "#242833", weave * 0.35);
  });

  // Anodized gold metal paint
  const P_GOLD = paint((p, n) => {
    const glint = smoothstep(0.4, 0.9, n.y * 0.7 + noise(p, 0.05, 9) * 0.3);
    return mix(C_GOLD, C_GOLD_BRIGHT, glint * 0.45);
  });

  // ---------------------------------------------------------------------------
  // TEXTURES (Medical Cross, Tactical Visor HUD, Emblems)
  // ---------------------------------------------------------------------------
  const TEX_CROSS = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#ffffff" stroke="${C_GOLD}" stroke-width="6"/>
      <path d="M48 24 h32 v24 h24 v32 h-24 v24 h-32 v-24 h-24 v-32 h24 Z" fill="${C_RED}"/>
      <circle cx="64" cy="64" r="8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_VISOR_HUD = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hudGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.2"/>
          <stop offset="50%" stop-color="#00f0ff" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="240" height="112" rx="20" fill="url(#hudGrad)" stroke="#00f0ff" stroke-width="4"/>
      <path d="M20 64 h60 l10 -24 l15 48 l12 -36 l8 12 h111" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="128" cy="64" r="28" fill="none" stroke="#00f0ff" stroke-width="3" stroke-dasharray="8 6"/>
      <circle cx="128" cy="64" r="6" fill="#ffffff"/>
      <text x="32" y="36" font-family="monospace" font-size="16" font-weight="bold" fill="#ffffff">BIOTIC: 100%</text>
      <text x="180" y="104" font-family="monospace" font-size="14" fill="#00f0ff">SYS.OK</text>
    </svg>`,
    { size: 512 },
  );

  const TEX_BASE_HOLOPAD = svg(
    `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="padGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35"/>
          <stop offset="70%" stop-color="#00f0ff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="256" cy="256" r="250" fill="url(#padGlow)"/>
      <circle cx="256" cy="256" r="240" fill="none" stroke="#00f0ff" stroke-width="4" stroke-dasharray="16 12"/>
      <circle cx="256" cy="256" r="215" fill="none" stroke="${C_GOLD}" stroke-width="3"/>
      <circle cx="256" cy="256" r="160" fill="none" stroke="#00f0ff" stroke-width="2"/>
      <!-- Medical Cross Stencil -->
      <path d="M226 126 h60 v70 h70 v60 h-70 v70 h-60 v-70 h-70 v-60 h70 Z" fill="none" stroke="#00f0ff" stroke-width="5"/>
      <circle cx="256" cy="256" r="16" fill="#00f0ff"/>
      <path d="M70 256 H120 M392 256 H442 M256 70 V120 M256 392 V442" stroke="#00f0ff" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON / RIG DEFINITION (Humanoid Hero Standard, Height ~1.85m)
  // ---------------------------------------------------------------------------
  // Root Pelvis
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });

  // Spine & Thorax
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.15, -0.01], role: "spine" });
  const chest = b.joint("spine2", { parent: spine1, at: [0, 1.35, 0.0], role: "spine" });

  // Neck, Head, Jaw
  const neck = b.joint("neck", { parent: chest, at: [0, 1.50, 0.01], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.60, 0.03], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.54, 0.07], aim: [0, 1.52, 0.14], role: "jaw" });

  // Valkyrie Wing Stabilizer Joints (Mounted to Thorax)
  const wingBaseL = b.joint("wingBaseL", {
    parent: chest,
    at: [0.12, 1.44, -0.13],
    dir: [0.65, 0.65, -0.4],
    role: "wing",
  });
  const wingBaseR = b.joint("wingBaseR", {
    parent: chest,
    at: [-0.12, 1.44, -0.13],
    dir: [-0.65, 0.65, -0.4],
    role: "wing",
  });

  // Arms (Heroic A-Pose: left hand open support ready, right hand wielding staff)
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.20, 1.41, -0.01], role: "arm" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [0.35, 1.20, 0.04], role: "arm" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [0.46, 1.01, 0.14], role: "arm" });
  const handL = b.joint("handL", { parent: wristL, at: [0.52, 0.88, 0.20], role: "arm" });

  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.20, 1.41, -0.01], role: "arm" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-0.32, 1.20, 0.06], role: "arm" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-0.38, 1.01, 0.22], role: "arm" });
  const handR = b.joint("handR", { parent: wristR, at: [-0.40, 0.88, 0.32], role: "arm" });

  // Legs using IK to land soles directly on the floor at y = 0
  const footTargetL = [0.17, 0.05, 0.04];
  const footTargetR = [-0.17, 0.05, 0.04];
  const legLengths = [0.44, 0.44, 0.10];
  const legBends = [
    [0, 0, 1],
    [0, 0, -1],
  ];

  const ptsL = limb([0.14, 0.94, -0.01], footTargetL, legLengths, legBends, { sole: [0, 0, 1] });
  const ptsR = limb([-0.14, 0.94, -0.01], footTargetR, legLengths, legBends, { sole: [0, 0, 1] });

  const legL = b.chain("legL", ptsL, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "toeL"],
    role: "leg",
    contact: [0.17, 0.0, 0.06],
  });
  const legR = b.chain("legR", ptsR, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "toeR"],
    role: "leg",
    contact: [-0.17, 0.0, 0.06],
  });

  // ---------------------------------------------------------------------------
  // ENVIRONMENT / STAGED RECHARGE PLATFORM
  // ---------------------------------------------------------------------------
  // Octagonal base platform supporting the hero
  const baseLathePts = [
    [0.0, -0.04],
    [0.90, -0.04],
    [0.90, -0.02],
    [0.85, 0.0],
    [0.0, 0.0],
  ] as [number, number][];

  b.lathe(baseLathePts, {
    at: [0, 0, 0],
    segments: 16,
    color: C_BASE_DARK,
    group: "stage",
  });

  // Inner elevated medical pad
  b.part(new THREE.CylinderGeometry(0.78, 0.80, 0.012, 24), C_BASE_PANEL, {
    at: [0, 0.006, 0],
    group: "stage",
  });

  // Glowing Holo-Ring border
  glow(
    b.part(new THREE.TorusGeometry(0.79, 0.008, 8, 32), C_CYAN, {
      at: [0, 0.012, 0],
      rotation: [90, 0, 0],
      group: "stage",
    }),
    1.6,
  );

  // Projection Decal with Medical Pad Graphics
  glow(
    b.part(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", {
      at: [0, 0.013, 0],
      rotation: [-90, 0, 0],
      texture: TEX_BASE_HOLOPAD,
      group: "stage",
    }),
    1.4,
  );

  // 4 Ground Corner Emitter Pylons
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const px = Math.cos(angle) * 0.82;
    const pz = Math.sin(angle) * 0.82;
    b.frustumBox([px, 0.0, pz], [px, 0.06, pz], [0.06, 0.06], [0.04, 0.04], {
      color: P_GOLD,
      group: "stage",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.018, 8, 8), C_CYAN, {
        at: [px, 0.065, pz],
        group: "stage",
      }),
      1.8,
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD, FACE, & TACTICAL VISOR
  // ---------------------------------------------------------------------------
  // Aerodynamic white helmet shell
  b.part(new THREE.SphereGeometry(0.10, 16, 12), P_ARMOR, {
    bone: head,
    at: head.local({ forward: -0.01, up: 0.02 }),
    scale: [0.95, 1.15, 1.05],
    group: "head",
  });

  // Synthetic lower faceplate (cheeks and jaw)
  b.frustumBox(
    head.local({ forward: 0.05, down: 0.04 }),
    head.local({ forward: 0.09, down: 0.08 }),
    [0.10, 0.08],
    [0.05, 0.04],
    { bone: head, color: C_PORCELAIN, group: "head" },
  );

  // Articulated rebreather jaw plate
  b.frustumBox(
    jaw.local({ forward: 0.01, down: 0.01 }),
    jaw.local({ forward: 0.05, up: 0.01 }),
    [0.05, 0.03],
    [0.035, 0.025],
    { bone: jaw, color: C_SLATE, group: "head" },
  );

  // Gold chin accent trim
  b.part(new THREE.BoxGeometry(0.025, 0.012, 0.03), P_GOLD, {
    bone: jaw,
    at: jaw.local({ forward: 0.045, down: 0.01 }),
    group: "head",
  });

  // Glowing Tactical Visor (Signature Overwatch Style)
  const visorPart = b.part(new THREE.SphereGeometry(0.102, 16, 12, 0, Math.PI), C_CYAN, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.01 }),
    scale: [0.96, 0.65, 1.08],
    rotation: [0, 90, 0],
    group: "head",
  });
  glow(visorPart, 1.5);

  // HUD graphic decal floating over visor
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.075), "#ffffff", {
      bone: head,
      at: head.local({ forward: 0.115, up: 0.01 }),
      dir: [0, 0.1, 1],
      axis: "z",
      texture: TEX_VISOR_HUD,
      group: "head",
    }),
    1.6,
  );

  // Valkyrie Ear Winglets / Comm Nodes
  for (const s of [1, -1]) {
    const earAt = head.local({ left: s * 0.10, up: 0.03, back: 0.02 });
    b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 10), P_GOLD, {
      bone: head,
      at: earAt,
      dir: [s * 1, 0, 0],
      group: "head",
    });

    // Swept ear wings
    const wingPoints = stepped(
      [
        [0, 2],
        [0, 4],
        [1, 7],
        [2, 9],
        [3, 6],
      ],
      0.012,
      { rows: true },
    );
    b.extrude(wingPoints, {
      bone: head,
      at: head.local({ left: s * 0.105, up: 0.04, back: 0.01 }),
      x: [s * 0.2, 0.8, -0.5],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: P_ARMOR,
      group: "head",
    });

    // Internal cyan glow stripe on ear wing
    glow(
      b.part(new THREE.BoxGeometry(0.004, 0.06, 0.012), C_CYAN, {
        bone: head,
        at: head.local({ left: s * 0.11, up: 0.07, back: 0.03 }),
        rotation: [-25, 0, s * -15],
        group: "head",
      }),
      1.7,
    );
  }

  // Aerodynamic ponytail plume / hair lock swept back
  const hairPath = catmull([
    head.local({ up: 0.09, back: 0.07 }),
    head.local({ up: 0.07, back: 0.16 }),
    head.local({ down: 0.03, back: 0.24 }),
    head.local({ down: 0.14, back: 0.28 }),
  ]);
  b.sweep(hairPath, (t) => (0.035 * (1 - t) + 0.008), {
    bone: head,
    color: C_SLATE,
    group: "head",
  });
  // Gold hair ring clasp
  b.part(new THREE.TorusGeometry(0.032, 0.008, 8, 16), P_GOLD, {
    bone: head,
    at: head.local({ up: 0.075, back: 0.12 }),
    rotation: [45, 0, 0],
    group: "head",
  });

  // Neck hydraulic pistons and cybernetic collar
  b.sweep(
    polyline([chest.local({ up: 0.12 }), neck.at]),
    0.048,
    { bone: neck, color: P_CARBON, group: "neck" },
  );
  for (const s of [1, -1]) {
    b.rod(
      chest.local({ left: s * 0.05, up: 0.12, forward: 0.02 }),
      head.local({ left: s * 0.04, down: 0.05, back: 0.01 }),
      0.008,
      C_CHROME,
      { bone: neck, group: "neck" },
    );
  }

  // ---------------------------------------------------------------------------
  // TORSO, CHASSIS & BIOTIC REACTOR
  // ---------------------------------------------------------------------------
  // Nano-weave abdominal core
  b.sweep(
    catmull([
      hips.at,
      spine1.at,
      chest.at,
    ]),
    (t) => (t < 0.5 ? [0.13, 0.10] : [0.15, 0.12]),
    {
      bone: [hips, spine1, chest],
      color: P_CARBON,
      section: "box",
      group: "torso",
    },
  );

  // Segmented armored cyber-spine vertebrae along back
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const pSpine = lerp(hips.at, chest.at, t);
    b.frustumBox(
      offset(pSpine, [0, 0, -1], 0.08),
      offset(pSpine, [0, 0, -1], 0.12),
      [0.05, 0.028],
      [0.035, 0.02],
      { bone: spine1, color: P_GOLD, group: "torso" },
    );
  }

  // Main Chest Cuirass (White Ceramic Armor)
  const chestPlate = b.part(
    new THREE.BoxGeometry(0.32, 0.24, 0.22),
    P_ARMOR,
    {
      bone: chest,
      at: chest.local({ forward: 0.02, up: 0.02 }),
      group: "torso",
    },
  );

  // Beveled Pectoral Armor Plates
  for (const s of [1, -1]) {
    b.frustumBox(
      chest.local({ left: s * 0.08, up: 0.04, forward: 0.08 }),
      chest.local({ left: s * 0.10, up: 0.07, forward: 0.14 }),
      [0.12, 0.12],
      [0.09, 0.08],
      { bone: chest, color: P_ARMOR, group: "torso" },
    );
  }

  // Central Biotic Heart Reactor (Overwatch signature glowing core)
  const coreDisc = b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 16), P_GOLD, {
    bone: chest,
    at: chest.local({ forward: 0.13, up: 0.03 }),
    rotation: [90, 0, 0],
    group: "torso",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.028, 12, 10), C_CYAN, {
      bone: chest,
      at: chest.local({ forward: 0.14, up: 0.03 }),
      group: "torso",
    }),
    1.9,
  );

  // Medical Cross Decal on upper left pectoral plate
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    bone: chest,
    at: chest.local({ left: 0.09, up: 0.06, forward: 0.145 }),
    dir: [0.1, 0.1, 1],
    axis: "z",
    texture: TEX_CROSS,
    group: "torso",
  });

  // Clavicle Guard & Gorget
  b.frustumBox(
    chest.local({ up: 0.13, forward: 0.04 }),
    chest.local({ up: 0.15, forward: 0.09 }),
    [0.26, 0.04],
    [0.18, 0.025],
    { bone: chest, color: C_SLATE, group: "torso" },
  );

  // Tactical Rib Protectors (Latitudinal segmented panels)
  for (const s of [1, -1]) {
    for (let r = 0; r < 3; r++) {
      const yOffset = -0.06 - r * 0.04;
      b.frustumBox(
        chest.local({ left: s * 0.12, up: yOffset, forward: 0.02 }),
        chest.local({ left: s * 0.16, up: yOffset, forward: 0.06 }),
        [0.03, 0.025],
        [0.02, 0.02],
        { bone: spine1, color: P_GOLD, group: "torso" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // BELT, HIP CANISTERS & PELVIS ARMOR
  // ---------------------------------------------------------------------------
  // Utility Belt Ring
  b.sweep(
    catmull([
      hips.local({ forward: 0.13 }),
      hips.local({ left: 0.16 }),
      hips.local({ back: 0.12 }),
      hips.local({ right: 0.16 }),
      hips.local({ forward: 0.13 }),
    ]),
    0.024,
    { bone: hips, color: C_SLATE, group: "hips" },
  );

  // Central Belt Buckle / Biotic Battery Pack
  b.frustumBox(
    hips.local({ forward: 0.12, up: 0.01 }),
    hips.local({ forward: 0.16, down: 0.02 }),
    [0.09, 0.06],
    [0.07, 0.05],
    { bone: hips, color: P_GOLD, group: "hips" },
  );
  glow(
    b.part(new THREE.BoxGeometry(0.04, 0.015, 0.01), C_CYAN, {
      bone: hips,
      at: hips.local({ forward: 0.165, down: 0.005 }),
      group: "hips",
    }),
    1.6,
  );

  // Pelvic Codpiece Plate
  b.frustumBox(
    hips.local({ forward: 0.11, down: 0.03 }),
    hips.local({ forward: 0.12, down: 0.14 }),
    [0.10, 0.05],
    [0.04, 0.02],
    { bone: hips, color: P_ARMOR, group: "hips" },
  );

  // Twin Biotic Serum Flasks on Hips
  for (const s of [1, -1]) {
    const pFlask = hips.local({ left: s * 0.16, forward: 0.04, down: 0.02 });
    // Metal caps
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.016, 12), P_GOLD, {
      bone: hips,
      at: offset(pFlask, [0, 1, 0], 0.04),
      group: "hips",
    });
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.016, 12), P_GOLD, {
      bone: hips,
      at: offset(pFlask, [0, 1, 0], -0.04),
      group: "hips",
    });
    // Glowing biotic fluid cylinder
    glow(
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.065, 12), C_CYAN, {
        bone: hips,
        at: pFlask,
        group: "hips",
      }),
      1.8,
    );

    // Lateral Hip Armor Winglets
    b.extrude(
      [
        [0, 0],
        [0.08, 0],
        [0.06, -0.14],
        [0, -0.10],
      ],
      {
        bone: hips,
        at: hips.local({ left: s * 0.17, up: 0.02, back: 0.02 }),
        x: [s * 0.8, -0.3, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        color: P_ARMOR,
        group: "hips",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // VALKYRIE WING STABILIZERS (BACKPACK & PHOTONIC HARDLIGHT FEATHERS)
  // ---------------------------------------------------------------------------
  // Back Turbine Generator Unit
  b.frustumBox(
    chest.local({ back: 0.10, up: 0.02 }),
    chest.local({ back: 0.20, up: 0.08 }),
    [0.18, 0.22],
    [0.14, 0.16],
    { bone: chest, color: C_SLATE, group: "wings" },
  );

  // Twin exhaust thruster rings on generator pack
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.048, 0.04, 16), P_GOLD, {
      bone: chest,
      at: chest.local({ left: s * 0.06, back: 0.21, up: 0.06 }),
      rotation: [90, 0, 0],
      group: "wings",
    });
    glow(
      b.part(new THREE.CircleGeometry(0.034, 16), C_CYAN, {
        bone: chest,
        at: chest.local({ left: s * 0.06, back: 0.231, up: 0.06 }),
        rotation: [0, 180, 0],
        group: "wings",
      }),
      1.9,
    );
  }

  // Left & Right Photonic Wings
  const buildWing = (sideSign: number, wingBone: any) => {
    const s = sideSign;

    // Wing Root Swivel Joint
    b.part(new THREE.SphereGeometry(0.035, 12, 10), P_GOLD, {
      bone: wingBone,
      at: [0, 0, 0],
      group: "wings",
    });

    // Main structural spar
    const sparPath = catmull([
      [0, 0, 0],
      [s * 0.15, 0.18, -0.06],
      [s * 0.35, 0.36, -0.12],
      [s * 0.52, 0.48, -0.16],
    ]);
    b.sweep(sparPath, (t) => 0.025 * (1 - t * 0.5), {
      bone: wingBone,
      color: P_ARMOR,
      section: "box",
      group: "wings",
    });

    // 3 Hardlight Glowing Feathers fanning outward & back
    const featherConfigs = [
      { len: 0.50, w: 0.085, angle: 15, zOff: 0.0 },
      { len: 0.42, w: 0.075, angle: 32, zOff: -0.02 },
      { len: 0.32, w: 0.060, angle: 50, zOff: -0.04 },
    ];

    featherConfigs.forEach((cfg, idx) => {
      const attachP = sparPath.at(0.35 + idx * 0.28);
      const featherOutline = [
        [0, 0],
        [cfg.len * 0.6, cfg.w * 0.4],
        [cfg.len, 0, "sharp"],
        [cfg.len * 0.5, -cfg.w * 0.3],
      ] as [number, number, string?][];

      const rad = (cfg.angle * Math.PI) / 180;
      const xDir: [number, number, number] = [
        s * Math.cos(rad) * 0.9,
        Math.sin(rad) * 0.9,
        cfg.zOff,
      ];

      // Solid inner emitter blade
      const featherMesh = b.extrude(featherOutline, {
        bone: wingBone,
        at: attachP,
        x: xDir,
        y: [0, 0.2, 0.95],
        thickness: 0.006,
        bevel: 0.0015,
        color: C_CYAN,
        group: "wings",
      });
      glow(featherMesh, 1.8);

      // Gold root bracket holding each hardlight feather
      b.frustumBox(
        attachP,
        offset(attachP, xDir, 0.08),
        [0.03, 0.02],
        [0.015, 0.01],
        { bone: wingBone, color: P_GOLD, group: "wings" },
      );
    });
  };

  buildWing(1, wingBaseL);
  buildWing(-1, wingBaseR);

  // ---------------------------------------------------------------------------
  // LEGS, KNEE COPS & BOOSTER GREAVES
  // ---------------------------------------------------------------------------
  const buildLegArmor = (legChain: any, s: number) => {
    const hipJ = legChain.joints[0];
    const kneeJ = legChain.joints[1];
    const ankleJ = legChain.joints[2];
    const toeJ = legChain.joints[3];

    // Thigh Core (Carbon nano-weave)
    b.sweep(
      catmull([hipJ.at, mid(hipJ.at, kneeJ.at), kneeJ.at]),
      (t) => [0.085 - t * 0.02, 0.09 - t * 0.02],
      {
        bone: hipJ,
        color: P_CARBON,
        section: "box",
        group: "legs",
      },
    );

    // Front Thigh Armor Plate (White Ceramic with gold bevel)
    b.frustumBox(
      hipJ.local({ forward: 0.06, down: 0.08 }),
      kneeJ.local({ forward: 0.055, up: 0.06 }),
      [0.11, 0.05],
      [0.08, 0.04],
      { bone: hipJ, color: P_ARMOR, group: "legs" },
    );

    // Lateral stabilizer rail on outer thigh
    b.rod(
      hipJ.local({ left: s * 0.08, down: 0.06, forward: 0.01 }),
      kneeJ.local({ left: s * 0.07, up: 0.05, forward: 0.01 }),
      0.012,
      P_GOLD,
      { bone: hipJ, group: "legs" },
    );

    // Articulated Knee Cop (Heavy angular protective shell)
    b.frustumBox(
      kneeJ.local({ forward: 0.03, down: 0.04 }),
      kneeJ.local({ forward: 0.09, up: 0.02 }),
      [0.09, 0.09],
      [0.06, 0.06],
      { bone: kneeJ, color: P_ARMOR, group: "legs" },
    );
    // Knee gold pivot hubs
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12), P_GOLD, {
      bone: kneeJ,
      at: kneeJ.at,
      dir: [s * 1, 0, 0],
      group: "legs",
    });

    // Lower Leg Shin Greave
    b.sweep(
      catmull([kneeJ.at, mid(kneeJ.at, ankleJ.at), ankleJ.at]),
      (t) => [0.07 - t * 0.015, 0.08 - t * 0.015],
      {
        bone: kneeJ,
        color: P_CARBON,
        section: "box",
        group: "legs",
      },
    );

    // Anterior Shin Armor
    b.frustumBox(
      kneeJ.local({ forward: 0.07, down: 0.06 }),
      ankleJ.local({ forward: 0.06, up: 0.03 }),
      [0.08, 0.045],
      [0.06, 0.035],
      { bone: kneeJ, color: P_ARMOR, group: "legs" },
    );

    // Posterior Rocket Booster / Jump Thruster on Calf
    const pBooster = mid(kneeJ.at, ankleJ.at);
    b.frustumBox(
      offset(pBooster, [0, 0, -1], 0.06),
      offset(pBooster, [0, 0, -1], 0.11),
      [0.07, 0.14],
      [0.05, 0.10],
      { bone: kneeJ, color: C_SLATE, group: "legs" },
    );
    // Glowing exhaust ports
    glow(
      b.part(new THREE.BoxGeometry(0.03, 0.06, 0.01), C_CYAN, {
        bone: kneeJ,
        at: offset(pBooster, [0, 0, -1], 0.115),
        group: "legs",
      }),
      1.7,
    );

    // Ankle Cuff Guard
    b.part(new THREE.CylinderGeometry(0.055, 0.06, 0.04, 14), P_GOLD, {
      bone: ankleJ,
      at: ankleJ.at,
      group: "legs",
    });

    // High-Traction Armored Boot
    // Heel to ankle
    b.frustumBox(
      ankleJ.local({ back: 0.04, down: 0.02 }),
      ankleJ.local({ back: 0.06, down: 0.07 }),
      [0.09, 0.08],
      [0.08, 0.08],
      { bone: ankleJ, color: C_SLATE, group: "legs" },
    );

    // Sole & Toe box touching floor at y = 0
    b.frustumBox(
      ankleJ.local({ back: 0.06, down: 0.07 }),
      ankleJ.local({ forward: 0.12, down: 0.07 }),
      [0.09, 0.035],
      [0.075, 0.035],
      { bone: toeJ, color: P_ARMOR, group: "legs" },
    );

    // Anti-Gravity Glowing Sole Pad
    glow(
      b.part(new THREE.BoxGeometry(0.07, 0.008, 0.18), C_CYAN, {
        bone: toeJ,
        at: ankleJ.local({ forward: 0.03, down: 0.088 }),
        group: "legs",
      }),
      1.5,
    );
  };

  buildLegArmor(legL, 1);
  buildLegArmor(legR, -1);

  // ---------------------------------------------------------------------------
  // SHOULDERS, ARMS & WRIST INJECTORS
  // ---------------------------------------------------------------------------
  // Massive Heroic Shoulder Pauldrons
  for (const s of [1, -1]) {
    const shoulderJ = s === 1 ? shoulderL : shoulderR;
    const pauldronAt = shoulderJ.local({ up: 0.06, left: s * 0.04 });

    // Multi-layered composite pauldron
    b.part(new THREE.SphereGeometry(0.085, 12, 10, 0, Math.PI), P_ARMOR, {
      bone: shoulderJ,
      at: pauldronAt,
      scale: [1.1, 0.9, 1.2],
      rotation: [0, s * -90, s * 25],
      group: "arms",
    });

    // Gold lower trim ring
    b.frustumBox(
      pauldronAt,
      offset(pauldronAt, [s * 1, -0.4, 0], 0.08),
      [0.12, 0.10],
      [0.09, 0.08],
      { bone: shoulderJ, color: P_GOLD, group: "arms" },
    );

    // Emergency red cross on outer pauldron facet
    b.part(new THREE.PlaneGeometry(0.055, 0.055), "#ffffff", {
      bone: shoulderJ,
      at: offset(pauldronAt, [s * 1, 0.02, 0.01], 0.09),
      dir: [s * 1, 0.2, 0],
      axis: "z",
      texture: TEX_CROSS,
      group: "arms",
    });
  }

  // Left Arm (Bio-Field Support Hand & Multi-Stim Syringe Gauntlet)
  // Bicep
  b.sweep(
    catmull([shoulderL.at, mid(shoulderL.at, elbowL.at), elbowL.at]),
    0.044,
    { bone: shoulderL, color: P_CARBON, group: "arms" },
  );
  // Bicep armor shell
  b.frustumBox(
    shoulderL.local({ down: 0.08, forward: 0.02 }),
    elbowL.local({ up: 0.04, forward: 0.02 }),
    [0.07, 0.06],
    [0.055, 0.05],
    { bone: shoulderL, color: P_ARMOR, group: "arms" },
  );

  // Elbow Joint Hub
  b.part(new THREE.SphereGeometry(0.032, 10, 8), P_GOLD, {
    bone: elbowL,
    at: elbowL.at,
    group: "arms",
  });

  // Forearm Vambrace
  b.sweep(
    catmull([elbowL.at, mid(elbowL.at, wristL.at), wristL.at]),
    0.042,
    { bone: elbowL, color: P_CARBON, group: "arms" },
  );
  b.frustumBox(
    elbowL.local({ forward: 0.02, down: 0.03 }),
    wristL.local({ forward: 0.02, up: 0.02 }),
    [0.085, 0.08],
    [0.065, 0.065],
    { bone: elbowL, color: P_ARMOR, group: "arms" },
  );

  // Wrist-Mounted Biotic Multi-Injector (3 Glowing Syringe Ampoules)
  for (let a = -1; a <= 1; a++) {
    const pAmp = wristL.local({ up: 0.045, left: a * 0.022, forward: 0.02 });
    // Glass cylinder
    glow(
      b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 8), C_CYAN, {
        bone: wristL,
        at: pAmp,
        rotation: [45, 0, 0],
        group: "arms",
      }),
      1.8,
    );
    // Gold needle/cap
    b.part(new THREE.ConeGeometry(0.006, 0.02, 8), P_GOLD, {
      bone: wristL,
      at: offset(pAmp, [0, 0.7, 0.7], 0.03),
      dir: [0, 1, 1],
      group: "arms",
    });
  }

  // Left Hand (Open palm ready to cast biotic aura)
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.07), C_SLATE, {
    bone: handL,
    at: handL.at,
    group: "arms",
  });
  // Palm emitter diode
  glow(
    b.part(new THREE.CircleGeometry(0.016, 12), C_CYAN, {
      bone: handL,
      at: handL.local({ down: 0.016, forward: 0.01 }),
      rotation: [90, 0, 0],
      group: "arms",
    }),
    1.9,
  );
  // Articulated fingers
  for (let f = 0; f < 4; f++) {
    const fX = (f - 1.5) * 0.016;
    b.rod(
      handL.local({ left: fX, forward: 0.035 }),
      handL.local({ left: fX * 1.1, forward: 0.085, down: 0.01 }),
      0.006,
      P_ARMOR,
      { bone: handL, group: "arms" },
    );
  }
  // Thumb
  b.rod(
    handL.local({ left: -0.03, forward: 0.01 }),
    handL.local({ left: -0.05, forward: 0.045, up: 0.01 }),
    0.007,
    P_ARMOR,
    { bone: handL, group: "arms" },
  );

  // Right Arm (Holding the Caduceus Staff)
  b.sweep(
    catmull([shoulderR.at, mid(shoulderR.at, elbowR.at), elbowR.at]),
    0.044,
    { bone: shoulderR, color: P_CARBON, group: "arms" },
  );
  b.frustumBox(
    shoulderR.local({ down: 0.08, forward: 0.02 }),
    elbowR.local({ up: 0.04, forward: 0.02 }),
    [0.07, 0.06],
    [0.055, 0.05],
    { bone: shoulderR, color: P_ARMOR, group: "arms" },
  );
  b.part(new THREE.SphereGeometry(0.032, 10, 8), P_GOLD, {
    bone: elbowR,
    at: elbowR.at,
    group: "arms",
  });

  b.sweep(
    catmull([elbowR.at, mid(elbowR.at, wristR.at), wristR.at]),
    0.042,
    { bone: elbowR, color: P_CARBON, group: "arms" },
  );
  b.frustumBox(
    elbowR.local({ forward: 0.02, down: 0.03 }),
    wristR.local({ forward: 0.02, up: 0.02 }),
    [0.085, 0.08],
    [0.065, 0.065],
    { bone: elbowR, color: P_ARMOR, group: "arms" },
  );

  // Right Hand (Closed grip around staff handle)
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.06), C_SLATE, {
    bone: handR,
    at: handR.at,
    group: "arms",
  });
  // Curled armored fingers around staff
  for (let f = 0; f < 4; f++) {
    const fX = (f - 1.5) * 0.014;
    b.sweep(
      catmull([
        handR.local({ left: fX, forward: 0.03 }),
        handR.local({ left: fX, forward: 0.045, down: 0.03 }),
        handR.local({ left: fX, down: 0.03 }),
      ]),
      0.007,
      { bone: handR, color: P_ARMOR, group: "arms" },
    );
  }

  // ---------------------------------------------------------------------------
  // HEALING STAFF: THE "CADUCEUS" (Hero Signature Weapon)
  // ---------------------------------------------------------------------------
  // The staff extends through the right hand: total length ~1.95m
  const staffGrip = handR.at;
  const staffAxis = vec([0.1, 0.98, 0.12]).normalize(); // Standing near-vertical with proud heroic tilt
  const staffBottom = offset(staffGrip, staffAxis, -0.85);
  const staffTop = offset(staffGrip, staffAxis, 1.10);

  // Main Shaft (Carbon Core & White Composite Sleeve)
  b.rod(staffBottom, staffTop, 0.016, P_CARBON, { bone: handR, group: "staff" });

  // Sleek white segmented grip casing around hand
  b.frustumBox(
    offset(staffGrip, staffAxis, -0.15),
    offset(staffGrip, staffAxis, 0.15),
    [0.042, 0.042],
    [0.038, 0.038],
    { bone: handR, color: P_ARMOR, group: "staff" },
  );

  // Lower Staff Counterweight & Grounding Spike
  b.frustumBox(
    offset(staffBottom, staffAxis, 0.15),
    staffBottom,
    [0.035, 0.035],
    [0.018, 0.018],
    { bone: handR, color: P_GOLD, group: "staff" },
  );
  b.part(new THREE.ConeGeometry(0.016, 0.05, 12), C_CHROME, {
    bone: handR,
    at: offset(staffBottom, staffAxis, -0.025),
    dir: staffAxis.clone().negate(),
    group: "staff",
  });

  // Mid-Shaft Caduceus Power Helix (Double Glowing Fiber-Optic Conduit)
  const helixStart = offset(staffGrip, staffAxis, 0.20);
  const helixEnd = offset(staffGrip, staffAxis, 0.75);
  const coilPath1 = coil(helixStart, helixEnd, 0.028, 3.5);
  const coilPath2 = coil(helixStart, helixEnd, -0.028, 3.5);

  glow(
    b.sweep(coilPath1, 0.006, { bone: handR, color: C_CYAN, group: "staff" }),
    1.9,
  );
  glow(
    b.sweep(coilPath2, 0.006, { bone: handR, color: C_CYAN, group: "staff" }),
    1.9,
  );

  // Staff Head Bracket / Emitter Assembly
  const headBase = offset(staffGrip, staffAxis, 0.78);
  const headCoreP = offset(staffGrip, staffAxis, 0.95);

  // Gold choke collar
  b.part(new THREE.CylinderGeometry(0.034, 0.028, 0.06, 16), P_GOLD, {
    bone: handR,
    at: headBase,
    dir: staffAxis,
    group: "staff",
  });

  // Floating Central Biotic Power Sphere (Healing Lens Core)
  const bioticCore = b.part(new THREE.SphereGeometry(0.045, 16, 12), C_CYAN, {
    bone: handR,
    at: headCoreP,
    group: "staff",
  });
  glow(bioticCore, 2.0);

  // Concentric Orbiting Emitter Rings around the Core
  glow(
    b.part(new THREE.TorusGeometry(0.065, 0.005, 8, 24), C_CYAN, {
      bone: handR,
      at: headCoreP,
      dir: staffAxis,
      group: "staff",
    }),
    1.8,
  );
  glow(
    b.part(new THREE.TorusGeometry(0.085, 0.006, 8, 24), C_GOLD_BRIGHT, {
      bone: handR,
      at: headCoreP,
      rotation: [45, 45, 0],
      group: "staff",
    }),
    1.2,
  );

  // Triple Swept Focus Blades / Emitter Wings (Caduceus Wing Prongs)
  for (let k = 0; k < 3; k++) {
    const angle = (k * Math.PI * 2) / 3;
    const bladeOutline = [
      [0, 0],
      [0.05, 0.06],
      [0.07, 0.18],
      [0.02, 0.28, "sharp"],
      [-0.03, 0.18],
      [-0.02, 0.04],
    ] as [number, number, string?][];

    const upAxis = staffAxis.clone();
    const radialDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();

    b.extrude(bladeOutline, {
      bone: handR,
      at: offset(headBase, radialDir, 0.032),
      x: radialDir.clone().addScaledVector(upAxis, 0.2).normalize(),
      y: upAxis,
      thickness: 0.010,
      bevel: 0.003,
      color: P_ARMOR,
      group: "staff",
    });

    // Inner glowing cyan focus vein on each blade
    glow(
      b.part(new THREE.BoxGeometry(0.006, 0.16, 0.014), C_CYAN, {
        bone: handR,
        at: offset(headCoreP, radialDir, 0.06),
        dir: upAxis,
        group: "staff",
      }),
      1.9,
    );
  }

  // Top Emitter Spike Point
  b.part(new THREE.ConeGeometry(0.015, 0.08, 12), P_GOLD, {
    bone: handR,
    at: offset(staffTop, staffAxis, 0.02),
    dir: staffAxis,
    group: "staff",
  });

  return b.root;
}
