Here is a breakdown of the key improvements made:

1. **Fixed Wing Placement & Elevation**: In the previous build, wing curves were created in global space near `[0,0,0]`, causing the wings to erroneously spawn down at the feet. The wings now correctly anchor to the upper back generator (`chest` / `wingBaseL` / `wingBaseR` at `y ≈ 1.45m`), fanning out and arching up to `y ≈ 2.05m` with a wide `1.7m` wingspan of 4 radiant hardlight feathers per side.
2. **Fixed Floating Hand & Arm Connections**: Eliminated the 82mm gap by routing continuous tapered vambrace sleeves from `elbow` to `wrist` into `hand` on both arms, attaching the biotic stim gauntlet directly to the left wrist and forearm.
3. **Sculpted Overwatch Athletic Anatomy & Proportions**: Replaced the boxy torso and monolithic legs with aerodynamic, tapered ceramic armor plates (`P_ARMOR`), carbon nano-weave undersuiting (`P_CARBON`), articulated gold knee hubs, sculpted chest cuirass with pectoral facets, and dynamic calf booster thrusters.
4. **Heroic Caduceus Staff Overhaul**: Rebuilt the staff with a full 4-blade crown, multi-ring gyroscopic stabilizer, twin glowing helical conduits wrapping the shaft, and a floating biotic focus core, gripped naturally in the right hand and grounded gracefully on the platform.
5. **Enhanced Face & Valkyrie Helmet**: Sculpted a sleek aerodynamic helmet with swept ear winglets, wrap-around illuminated visor HUD, gold forehead crest, articulated jaw rebreather, and dynamic cyber-ponytail.

```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";
import { aim, DEG, lerp, mid, offset, rng, vec } from "agentic-3js-builder";
import { arc, bezier, catmull, polyline, spiral } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { paint, rgb, mix, smoothstep, noise } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { coil } from "agentic-3js-builder/kits/clockwork";
import { stepped } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Overwatch Cyborg Medic Hero",
  description:
    "Combat support cyborg medic equipped with soaring photonic hardlight wings, biotic stim injectors, and the Caduceus healing staff.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "cyborg_medic", paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // COLOR PALETTE & ADVANCED SHADED PAINTS (Overwatch Hero Aesthetic)
  // ---------------------------------------------------------------------------
  const C_WHITE = "#f8fafc"; // Pearlescent white ceramic armor
  const C_SLATE = "#1e2430"; // Deep tactical sub-armor
  const C_CARBON = "#121419"; // Nano-weave flexible joints & undersuit
  const C_GOLD = "#e89e20"; // Anodized alloy joints & trim
  const C_GOLD_BRIGHT = "#fed766";
  const C_RED = "#ff2a55"; // Medical emergency coral red
  const C_CYAN = "#00f5ff"; // Biotic hardlight energy glow
  const C_CYAN_DEEP = "#0077b6";
  const C_PORCELAIN = "#f5ebe1"; // Android synthetic skin
  const C_CHROME = "#d2dce6"; // Polished hydraulic cylinders
  const C_BASE_DARK = "#14171f"; // Stage base ring
  const C_BASE_DECK = "#1c212b"; // Stage top deck

  // Ceramic armor with soft occlusion and edge highlights
  const P_ARMOR = paint((p, n) => {
    const edge = smoothstep(0.3, 0.85, Math.abs(n.y) * 0.4 + noise(p, 0.08, 4) * 0.6);
    return mix(C_WHITE, "#dde4ee", edge * 0.22);
  });

  // Carbon weave undersuit
  const P_CARBON = paint((p, _n) => {
    const weave = (Math.sin(p.x * 240) * Math.sin(p.y * 240) + 1) * 0.5;
    return mix(C_CARBON, "#242935", weave * 0.35);
  });

  // Anodized gold metal with glint
  const P_GOLD = paint((p, n) => {
    const glint = smoothstep(0.4, 0.9, n.y * 0.7 + noise(p, 0.05, 9) * 0.3);
    return mix(C_GOLD, C_GOLD_BRIGHT, glint * 0.45);
  });

  // ---------------------------------------------------------------------------
  // SVG GRAPHICS & TEXTURES
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
          <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.2"/>
          <stop offset="50%" stop-color="#00f5ff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#00f5ff" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="240" height="112" rx="24" fill="url(#hudGrad)" stroke="#00f5ff" stroke-width="4"/>
      <path d="M22 64 h55 l10 -26 l14 52 l14 -38 l8 12 h111" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="128" cy="64" r="26" fill="none" stroke="#00f5ff" stroke-width="3" stroke-dasharray="8 6"/>
      <circle cx="128" cy="64" r="6" fill="#ffffff"/>
      <text x="32" y="36" font-family="monospace" font-size="16" font-weight="bold" fill="#ffffff">HEAL: ACTIVE</text>
      <text x="180" y="104" font-family="monospace" font-size="14" fill="#00f5ff">SYS.100%</text>
    </svg>`,
    { size: 512 },
  );

  const TEX_BASE_HOLOPAD = svg(
    `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="padGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.4"/>
          <stop offset="70%" stop-color="#00f5ff" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#00f5ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="256" cy="256" r="250" fill="url(#padGlow)"/>
      <circle cx="256" cy="256" r="240" fill="none" stroke="#00f5ff" stroke-width="4" stroke-dasharray="16 12"/>
      <circle cx="256" cy="256" r="215" fill="none" stroke="${C_GOLD}" stroke-width="3"/>
      <circle cx="256" cy="256" r="165" fill="none" stroke="#00f5ff" stroke-width="2"/>
      <path d="M226 126 h60 v70 h70 v60 h-70 v70 h-60 v-70 h-70 v-60 h70 Z" fill="none" stroke="#00f5ff" stroke-width="5"/>
      <circle cx="256" cy="256" r="18" fill="#00f5ff"/>
      <path d="M60 256 H120 M392 256 H452 M256 60 V120 M256 392 V452" stroke="#00f5ff" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON / RIG DEFINITION (Heroic Humanoid Support Pose)
  // ---------------------------------------------------------------------------
  // Pelvis / Hips
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });

  // Spine & Thorax
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.15, -0.01], role: "spine" });
  const chest = b.joint("spine2", { parent: spine1, at: [0, 1.35, 0.0], role: "spine" });

  // Neck, Head, Jaw
  const neck = b.joint("neck", { parent: chest, at: [0, 1.50, 0.01], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.60, 0.03], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.54, 0.07], aim: [0, 1.52, 0.14], role: "jaw" });

  // Valkyrie Wing Base Joints (Mounted on Upper Thorax)
  const wingBaseL = b.joint("wingBaseL", {
    parent: chest,
    at: [0.12, 1.45, -0.12],
    dir: [0.7, 0.7, -0.2],
    role: "wing",
  });
  const wingBaseR = b.joint("wingBaseR", {
    parent: chest,
    at: [-0.12, 1.45, -0.12],
    dir: [-0.7, 0.7, -0.2],
    role: "wing",
  });

  // Arms (Heroic Support Stance: Left casting open bio-field, Right holding staff)
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.21, 1.38, -0.01], role: "arm" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [0.35, 1.18, 0.04], role: "arm" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [0.44, 0.98, 0.13], role: "arm" });
  const handL = b.joint("handL", { parent: wristL, at: [0.49, 0.88, 0.19], role: "arm" });

  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.21, 1.38, -0.01], role: "arm" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-0.34, 1.18, 0.04], role: "arm" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-0.36, 0.98, 0.18], role: "arm" });
  const handR = b.joint("handR", { parent: wristR, at: [-0.36, 0.88, 0.24], role: "arm" });

  // Legs using IK to plant soles firmly on the platform at y = 0
  const footTargetL = [0.17, 0.05, 0.04];
  const footTargetR = [-0.17, 0.05, 0.04];
  const legLengths = [0.44, 0.44, 0.08];
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
  // STAGED RECHARGE PLATFORM / BASE
  // ---------------------------------------------------------------------------
  // Octagonal base stepped chamfer
  b.lathe(
    [
      [0.0, -0.04],
      [0.88, -0.04],
      [0.88, -0.02],
      [0.82, 0.0],
      [0.0, 0.0],
    ],
    {
      at: [0, 0, 0],
      segments: 16,
      color: C_BASE_DARK,
      group: "stage",
    },
  );

  // Deck surface
  b.part(new THREE.CylinderGeometry(0.78, 0.80, 0.014, 24), C_BASE_DECK, {
    at: [0, 0.007, 0],
    group: "stage",
  });

  // Glowing Holo-Ring border
  glow(
    b.part(new THREE.TorusGeometry(0.78, 0.008, 8, 32), C_CYAN, {
      at: [0, 0.014, 0],
      rotation: [90, 0, 0],
      group: "stage",
    }),
    1.6,
  );

  // Holo projection pad decal
  glow(
    b.part(new THREE.PlaneGeometry(1.5, 1.5), "#ffffff", {
      at: [0, 0.015, 0],
      rotation: [-90, 0, 0],
      texture: TEX_BASE_HOLOPAD,
      group: "stage",
    }),
    1.4,
  );

  // 4 Corner Power Emitter Beacons
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const px = Math.cos(angle) * 0.80;
    const pz = Math.sin(angle) * 0.80;
    b.frustumBox([px, 0.0, pz], [px, 0.06, pz], [0.06, 0.06], [0.035, 0.035], {
      color: P_GOLD,
      group: "stage",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.018, 10, 8), C_CYAN, {
        at: [px, 0.065, pz],
        group: "stage",
      }),
      1.8,
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD, FACE & VALKYRIE HELMET
  // ---------------------------------------------------------------------------
  // Sleek aerodynamic helmet shell
  b.part(new THREE.SphereGeometry(0.095, 16, 14), P_ARMOR, {
    bone: head,
    at: head.local({ forward: -0.01, up: 0.02 }),
    scale: [0.95, 1.15, 1.05],
    group: "head",
  });

  // Synthetic lower face & cheeks
  b.frustumBox(
    head.local({ forward: 0.04, down: 0.03 }),
    head.local({ forward: 0.08, down: 0.075 }),
    [0.09, 0.075],
    [0.045, 0.035],
    { bone: head, color: C_PORCELAIN, group: "head" },
  );

  // Articulated rebreather jaw plate
  b.frustumBox(
    jaw.local({ forward: 0.01, down: 0.01 }),
    jaw.local({ forward: 0.045, up: 0.01 }),
    [0.045, 0.03],
    [0.03, 0.02],
    { bone: jaw, color: C_SLATE, group: "head" },
  );

  // Gold chin chevron
  b.part(new THREE.BoxGeometry(0.022, 0.01, 0.025), P_GOLD, {
    bone: jaw,
    at: jaw.local({ forward: 0.042, down: 0.01 }),
    group: "head",
  });

  // Glowing Tactical Visor (Overwatch signature clean wrap-around curve)
  const visorMesh = b.part(new THREE.SphereGeometry(0.098, 16, 12, 0, Math.PI), C_CYAN, {
    bone: head,
    at: head.local({ forward: 0.018, up: 0.015 }),
    scale: [0.96, 0.55, 1.05],
    rotation: [0, 90, 0],
    group: "head",
  });
  glow(visorMesh, 1.6);

  // Visor HUD decal
  glow(
    b.part(new THREE.PlaneGeometry(0.14, 0.07), "#ffffff", {
      bone: head,
      at: head.local({ forward: 0.112, up: 0.015 }),
      dir: [0, 0.1, 1],
      axis: "z",
      texture: TEX_VISOR_HUD,
      group: "head",
    }),
    1.7,
  );

  // Valkyrie Ear Winglets / Audio Antennae
  for (const s of [1, -1]) {
    const earAt = head.local({ left: s * 0.095, up: 0.035, back: 0.015 });
    // Anodized ear pivot hub
    b.part(new THREE.CylinderGeometry(0.016, 0.02, 0.018, 12), P_GOLD, {
      bone: head,
      at: earAt,
      dir: [s * 1, 0, 0],
      group: "head",
    });

    // Angled Valkyrie ear wing swept back and upward
    const earWingOutline = [
      [0, 0],
      [0.02, 0.04],
      [0.035, 0.11, "sharp"],
      [0.01, 0.09],
      [-0.015, 0.02],
    ] as [number, number, string?][];

    b.extrude(earWingOutline, {
      bone: head,
      at: earAt,
      x: [s * 0.2, 0.8, -0.55],
      y: [0, 0.9, 0.4],
      thickness: 0.008,
      bevel: 0.002,
      color: P_ARMOR,
      group: "head",
    });

    // Glowing cyan accent line on ear wing
    glow(
      b.part(new THREE.BoxGeometry(0.004, 0.07, 0.01), C_CYAN, {
        bone: head,
        at: head.local({ left: s * 0.11, up: 0.08, back: 0.04 }),
        rotation: [-30, 0, s * -15],
        group: "head",
      }),
      1.8,
    );
  }

  // Sleek cybernetic ponytail / fiber-optic plume swept back
  const hairPath = catmull([
    head.local({ up: 0.08, back: 0.07 }),
    head.local({ up: 0.06, back: 0.15 }),
    head.local({ down: 0.04, back: 0.22 }),
    head.local({ down: 0.15, back: 0.26 }),
  ]);
  b.sweep(hairPath, (t) => 0.032 * (1 - t) + 0.008, {
    bone: head,
    color: C_SLATE,
    group: "head",
  });
  // Gold hair clasp ring
  b.part(new THREE.TorusGeometry(0.028, 0.007, 8, 16), P_GOLD, {
    bone: head,
    at: head.local({ up: 0.065, back: 0.11 }),
    rotation: [45, 0, 0],
    group: "head",
  });

  // Neck Hydraulic Pistons & Nano-weave Collar
  b.sweep(polyline([chest.local({ up: 0.12 }), neck.at]), 0.045, {
    bone: neck,
    color: P_CARBON,
    group: "neck",
  });
  for (const s of [1, -1]) {
    b.rod(
      chest.local({ left: s * 0.05, up: 0.12, forward: 0.02 }),
      head.local({ left: s * 0.04, down: 0.04, back: 0.01 }),
      0.007,
      C_CHROME,
      { bone: neck, group: "neck" },
    );
  }

  // ---------------------------------------------------------------------------
  // TORSO, CHASSIS & BIOTIC REACTOR
  // ---------------------------------------------------------------------------
  // Athletic Nano-weave Core Abdomen
  b.sweep(
    catmull([hips.at, spine1.at, chest.at]),
    (t) => (t < 0.5 ? [0.125, 0.095] : [0.145, 0.115]),
    {
      bone: [hips, spine1, chest],
      color: P_CARBON,
      section: "box",
      group: "torso",
    },
  );

  // Armored Cyber-Spine Vertebrae Nodes along back
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const pSpine = lerp(hips.at, chest.at, t);
    b.frustumBox(
      offset(pSpine, [0, 0, -1], 0.075),
      offset(pSpine, [0, 0, -1], 0.115),
      [0.045, 0.026],
      [0.03, 0.018],
      { bone: spine1, color: P_GOLD, group: "torso" },
    );
  }

  // Main Chest Cuirass (Tapered Athletic V-Shape)
  b.frustumBox(
    chest.local({ up: -0.06, forward: 0.01 }),
    chest.local({ up: 0.10, forward: 0.03 }),
    [0.26, 0.18],
    [0.32, 0.22],
    { bone: chest, color: P_ARMOR, group: "torso" },
  );

  // Sculpted Pectoral Armor Plates with chamfered facets
  for (const s of [1, -1]) {
    b.frustumBox(
      chest.local({ left: s * 0.07, up: 0.03, forward: 0.08 }),
      chest.local({ left: s * 0.09, up: 0.06, forward: 0.135 }),
      [0.11, 0.10],
      [0.08, 0.07],
      { bone: chest, color: P_ARMOR, group: "torso" },
    );
  }

  // Central Biotic Heart Reactor (Overwatch signature chest core)
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), P_GOLD, {
    bone: chest,
    at: chest.local({ forward: 0.125, up: 0.02 }),
    rotation: [90, 0, 0],
    group: "torso",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.026, 12, 10), C_CYAN, {
      bone: chest,
      at: chest.local({ forward: 0.135, up: 0.02 }),
      group: "torso",
    }),
    1.9,
  );

  // Medical Cross Decal on Upper Left Pectoral
  b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
    bone: chest,
    at: chest.local({ left: 0.09, up: 0.05, forward: 0.14 }),
    dir: [0.1, 0.1, 1],
    axis: "z",
    texture: TEX_CROSS,
    group: "torso",
  });

  // Clavicle Guard / Gorget Collar
  b.frustumBox(
    chest.local({ up: 0.11, forward: 0.03 }),
    chest.local({ up: 0.135, forward: 0.08 }),
    [0.24, 0.035],
    [0.17, 0.022],
    { bone: chest, color: C_SLATE, group: "torso" },
  );

  // Lateral Rib Protector Slats
  for (const s of [1, -1]) {
    for (let r = 0; r < 3; r++) {
      const yOff = -0.05 - r * 0.035;
      b.frustumBox(
        chest.local({ left: s * 0.11, up: yOff, forward: 0.02 }),
        chest.local({ left: s * 0.15, up: yOff, forward: 0.05 }),
        [0.025, 0.02],
        [0.018, 0.016],
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
      hips.local({ forward: 0.12 }),
      hips.local({ left: 0.15 }),
      hips.local({ back: 0.11 }),
      hips.local({ right: 0.15 }),
      hips.local({ forward: 0.12 }),
    ]),
    0.022,
    { bone: hips, color: C_SLATE, group: "hips" },
  );

  // Central Belt Buckle / Biotic Battery Pack
  b.frustumBox(
    hips.local({ forward: 0.11, up: 0.01 }),
    hips.local({ forward: 0.15, down: 0.02 }),
    [0.08, 0.055],
    [0.065, 0.045],
    { bone: hips, color: P_GOLD, group: "hips" },
  );
  glow(
    b.part(new THREE.BoxGeometry(0.035, 0.012, 0.01), C_CYAN, {
      bone: hips,
      at: hips.local({ forward: 0.155, down: 0.005 }),
      group: "hips",
    }),
    1.6,
  );

  // Pelvic Guard Plate
  b.frustumBox(
    hips.local({ forward: 0.10, down: 0.03 }),
    hips.local({ forward: 0.11, down: 0.13 }),
    [0.09, 0.045],
    [0.035, 0.018],
    { bone: hips, color: P_ARMOR, group: "hips" },
  );

  // Twin Biotic Serum Ampoules on Hips
  for (const s of [1, -1]) {
    const pFlask = hips.local({ left: s * 0.15, forward: 0.03, down: 0.02 });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.014, 12), P_GOLD, {
      bone: hips,
      at: offset(pFlask, [0, 1, 0], 0.035),
      group: "hips",
    });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.014, 12), P_GOLD, {
      bone: hips,
      at: offset(pFlask, [0, 1, 0], -0.035),
      group: "hips",
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), C_CYAN, {
        bone: hips,
        at: pFlask,
        group: "hips",
      }),
      1.8,
    );

    // Lateral Hip Armor Plates
    b.extrude(
      [
        [0, 0],
        [0.07, 0],
        [0.055, -0.13],
        [0, -0.09],
      ],
      {
        bone: hips,
        at: hips.local({ left: s * 0.16, up: 0.02, back: 0.01 }),
        x: [s * 0.8, -0.3, 0],
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.003,
        color: P_ARMOR,
        group: "hips",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // VALKYRIE PHOTONIC WINGS & BACKPACK GENERATOR
  // ---------------------------------------------------------------------------
  // Back Turbine Generator Unit (Mounted securely to upper thorax)
  b.frustumBox(
    chest.local({ back: 0.08, up: 0.02 }),
    chest.local({ back: 0.18, up: 0.08 }),
    [0.16, 0.20],
    [0.12, 0.15],
    { bone: chest, color: C_SLATE, group: "wings" },
  );

  // Twin Thruster Exhaust Ports on Generator
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.036, 0.044, 0.035, 16), P_GOLD, {
      bone: chest,
      at: chest.local({ left: s * 0.055, back: 0.19, up: 0.055 }),
      rotation: [90, 0, 0],
      group: "wings",
    });
    glow(
      b.part(new THREE.CircleGeometry(0.03, 16), C_CYAN, {
        bone: chest,
        at: chest.local({ left: s * 0.055, back: 0.208, up: 0.055 }),
        rotation: [0, 180, 0],
        group: "wings",
      }),
      1.9,
    );
  }

  // Left & Right Valkyrie Hardlight Wings (Arching proudly up and out!)
  const buildValkyrieWing = (s: number, wingBone: any) => {
    const rootP = wingBone.at;

    // Wing Root Gimbal Hub
    b.part(new THREE.SphereGeometry(0.032, 12, 10), P_GOLD, {
      bone: wingBone,
      at: rootP,
      group: "wings",
    });

    // Main Structural Armored Spar (Extends upward, outward, and slightly back)
    const p1 = offset(rootP, [s * 0.16, 0.18, -0.05], 1);
    const p2 = offset(rootP, [s * 0.36, 0.34, -0.10], 1);
    const p3 = offset(rootP, [s * 0.54, 0.46, -0.15], 1);
    const sparPath = catmull([rootP, p1, p2, p3]);

    b.sweep(sparPath, (t) => 0.024 * (1 - t * 0.5), {
      bone: wingBone,
      color: P_ARMOR,
      section: "box",
      group: "wings",
    });

    // 4 Radiant Photonic Hardlight Feathers (Cyan glow blades with sharp tips)
    const featherData = [
      { tAt: 0.95, len: 0.48, w: 0.08, angleDeg: 12, zBias: -0.08 },
      { tAt: 0.70, len: 0.56, w: 0.09, angleDeg: 28, zBias: -0.06 },
      { tAt: 0.45, len: 0.50, w: 0.08, angleDeg: 48, zBias: -0.04 },
      { tAt: 0.25, len: 0.38, w: 0.065, angleDeg: 68, zBias: -0.02 },
    ];

    featherData.forEach((f) => {
      const attach = sparPath.at(f.tAt);
      const rad = (f.angleDeg * Math.PI) / 180;
      const xVec: [number, number, number] = [
        s * Math.cos(rad) * 0.95,
        Math.sin(rad) * 0.95,
        f.zBias,
      ];

      const bladePoly = [
        [0, 0],
        [f.len * 0.55, f.w * 0.4],
        [f.len, 0, "sharp"],
        [f.len * 0.5, -f.w * 0.3],
      ] as [number, number, string?][];

      // Glowing hardlight blade
      const featherMesh = b.extrude(bladePoly, {
        bone: wingBone,
        at: attach,
        x: xVec,
        y: [0, 0.2, 0.95],
        thickness: 0.007,
        bevel: 0.002,
        color: C_CYAN,
        group: "wings",
      });
      glow(featherMesh, 1.9);

      // Gold mounting bracket clasp
      b.frustumBox(
        attach,
        offset(attach, xVec, 0.07),
        [0.028, 0.018],
        [0.015, 0.01],
        { bone: wingBone, color: P_GOLD, group: "wings" },
      );
    });
  };

  buildValkyrieWing(1, wingBaseL);
  buildValkyrieWing(-1, wingBaseR);

  // ---------------------------------------------------------------------------
  // LEGS, KNEE COPS & BOOSTER GREAVES
  // ---------------------------------------------------------------------------
  const buildLegArmor = (legChain: any, s: number) => {
    const hipJ = legChain.joints[0];
    const kneeJ = legChain.joints[1];
    const ankleJ = legChain.joints[2];
    const toeJ = legChain.joints[3];

    // Thigh Core (Flexible nano-weave)
    b.sweep(
      catmull([hipJ.at, mid(hipJ.at, kneeJ.at), kneeJ.at]),
      (t) => [0.08 - t * 0.018, 0.085 - t * 0.018],
      {
        bone: hipJ,
        color: P_CARBON,
        section: "box",
        group: "legs",
      },
    );

    // Front Thigh Armor Shell (Sleek white ceramic plate)
    b.frustumBox(
      hipJ.local({ forward: 0.055, down: 0.07 }),
      kneeJ.local({ forward: 0.05, up: 0.05 }),
      [0.10, 0.045],
      [0.075, 0.038],
      { bone: hipJ, color: P_ARMOR, group: "legs" },
    );

    // Lateral Gold Stabilizer Rail
    b.rod(
      hipJ.local({ left: s * 0.075, down: 0.05, forward: 0.01 }),
      kneeJ.local({ left: s * 0.065, up: 0.04, forward: 0.01 }),
      0.010,
      P_GOLD,
      { bone: hipJ, group: "legs" },
    );

    // Knee Pivot Hub Disc
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.11, 12), P_GOLD, {
      bone: kneeJ,
      at: kneeJ.at,
      dir: [s * 1, 0, 0],
      group: "legs",
    });

    // Articulated Protective Knee Cap Shell
    b.frustumBox(
      kneeJ.local({ forward: 0.03, down: 0.035 }),
      kneeJ.local({ forward: 0.085, up: 0.02 }),
      [0.085, 0.085],
      [0.055, 0.055],
      { bone: kneeJ, color: P_ARMOR, group: "legs" },
    );

    // Lower Leg Shin Core
    b.sweep(
      catmull([kneeJ.at, mid(kneeJ.at, ankleJ.at), ankleJ.at]),
      (t) => [0.065 - t * 0.015, 0.075 - t * 0.015],
      {
        bone: kneeJ,
        color: P_CARBON,
        section: "box",
        group: "legs",
      },
    );

    // Anterior Shin Armor Plate
    b.frustumBox(
      kneeJ.local({ forward: 0.065, down: 0.05 }),
      ankleJ.local({ forward: 0.055, up: 0.03 }),
      [0.075, 0.04],
      [0.055, 0.03],
      { bone: kneeJ, color: P_ARMOR, group: "legs" },
    );

    // Posterior Jump Thruster / Calf Booster
    const pCalf = mid(kneeJ.at, ankleJ.at);
    b.frustumBox(
      offset(pCalf, [0, 0, -1], 0.055),
      offset(pCalf, [0, 0, -1], 0.105),
      [0.065, 0.13],
      [0.045, 0.09],
      { bone: kneeJ, color: C_SLATE, group: "legs" },
    );
    glow(
      b.part(new THREE.BoxGeometry(0.025, 0.05, 0.01), C_CYAN, {
        bone: kneeJ,
        at: offset(pCalf, [0, 0, -1], 0.11),
        group: "legs",
      }),
      1.7,
    );

    // Ankle Ring Clasp
    b.part(new THREE.CylinderGeometry(0.05, 0.055, 0.035, 14), P_GOLD, {
      bone: ankleJ,
      at: ankleJ.at,
      group: "legs",
    });

    // Armored High-Traction Combat Boot
    // Heel block
    b.frustumBox(
      ankleJ.local({ back: 0.03, down: 0.02 }),
      ankleJ.local({ back: 0.055, down: 0.065 }),
      [0.085, 0.07],
      [0.075, 0.07],
      { bone: ankleJ, color: C_SLATE, group: "legs" },
    );

    // Front armored toe box resting squarely on platform
    b.frustumBox(
      ankleJ.local({ back: 0.04, down: 0.065 }),
      ankleJ.local({ forward: 0.11, down: 0.065 }),
      [0.08, 0.035],
      [0.065, 0.03],
      { bone: toeJ, color: P_ARMOR, group: "legs" },
    );

    // Glowing Anti-Gravity Sole Pad (Contact at y = 0)
    glow(
      b.part(new THREE.BoxGeometry(0.065, 0.008, 0.17), C_CYAN, {
        bone: toeJ,
        at: ankleJ.local({ forward: 0.03, down: 0.084 }),
        group: "legs",
      }),
      1.5,
    );
  };

  buildLegArmor(legL, 1);
  buildLegArmor(legR, -1);

  // ---------------------------------------------------------------------------
  // SHOULDERS, ARMS & WRIST INJECTOR GAUNTLET
  // ---------------------------------------------------------------------------
  // Heroic Pauldrons
  for (const s of [1, -1]) {
    const shoulderJ = s === 1 ? shoulderL : shoulderR;
    const pauldronAt = shoulderJ.local({ up: 0.06, left: s * 0.035 });

    b.part(new THREE.SphereGeometry(0.08, 12, 10, 0, Math.PI), P_ARMOR, {
      bone: shoulderJ,
      at: pauldronAt,
      scale: [1.1, 0.9, 1.2],
      rotation: [0, s * -90, s * 25],
      group: "arms",
    });

    b.frustumBox(
      pauldronAt,
      offset(pauldronAt, [s * 1, -0.4, 0], 0.075),
      [0.11, 0.09],
      [0.08, 0.07],
      { bone: shoulderJ, color: P_GOLD, group: "arms" },
    );

    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
      bone: shoulderJ,
      at: offset(pauldronAt, [s * 1, 0.02, 0.01], 0.085),
      dir: [s * 1, 0.2, 0],
      axis: "z",
      texture: TEX_CROSS,
      group: "arms",
    });
  }

  // Left Arm (Heroic Bio-Field Support Hand)
  // Bicep
  b.sweep(catmull([shoulderL.at, mid(shoulderL.at, elbowL.at), elbowL.at]), 0.042, {
    bone: shoulderL,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    shoulderL.local({ down: 0.07, forward: 0.015 }),
    elbowL.local({ up: 0.04, forward: 0.015 }),
    [0.065, 0.055],
    [0.05, 0.045],
    { bone: shoulderL, color: P_ARMOR, group: "arms" },
  );

  // Elbow Joint Hub
  b.part(new THREE.SphereGeometry(0.03, 10, 8), P_GOLD, {
    bone: elbowL,
    at: elbowL.at,
    group: "arms",
  });

  // Forearm & Vambrace (Full connection all the way to handL.at!)
  b.sweep(catmull([elbowL.at, wristL.at, handL.at]), 0.038, {
    bone: elbowL,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    elbowL.local({ forward: 0.015, down: 0.03 }),
    wristL.local({ forward: 0.015, down: 0.01 }),
    [0.08, 0.075],
    [0.06, 0.055],
    { bone: elbowL, color: P_ARMOR, group: "arms" },
  );

  // Wrist Gauntlet Collar (Closing any gap to hand)
  b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.04, 12), P_GOLD, {
    bone: wristL,
    at: mid(wristL.at, handL.at),
    dir: handL.at.clone().sub(wristL.at).normalize(),
    group: "arms",
  });

  // Wrist Multi-Stim Biotic Syringe Array (3 Glowing Ampoules on Forearm)
  for (let a = -1; a <= 1; a++) {
    const pAmp = wristL.local({ up: 0.038, left: a * 0.02, forward: 0.01 });
    glow(
      b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.045, 8), C_CYAN, {
        bone: wristL,
        at: pAmp,
        rotation: [45, 0, 0],
        group: "arms",
      }),
      1.8,
    );
    b.part(new THREE.ConeGeometry(0.005, 0.016, 8), P_GOLD, {
      bone: wristL,
      at: offset(pAmp, [0, 0.7, 0.7], 0.026),
      dir: [0, 1, 1],
      group: "arms",
    });
  }

  // Left Hand Palm & Digits
  b.part(new THREE.BoxGeometry(0.055, 0.025, 0.065), C_SLATE, {
    bone: handL,
    at: handL.at,
    group: "arms",
  });
  // Glowing Bio-Field Emitter in Palm
  glow(
    b.part(new THREE.CircleGeometry(0.015, 12), C_CYAN, {
      bone: handL,
      at: handL.local({ down: 0.014, forward: 0.01 }),
      rotation: [90, 0, 0],
      group: "arms",
    }),
    1.9,
  );
  // Fingers fanned open
  for (let f = 0; f < 4; f++) {
    const fX = (f - 1.5) * 0.014;
    b.rod(
      handL.local({ left: fX, forward: 0.03 }),
      handL.local({ left: fX * 1.15, forward: 0.075, down: 0.008 }),
      0.0055,
      P_ARMOR,
      { bone: handL, group: "arms" },
    );
  }
  // Thumb
  b.rod(
    handL.local({ left: -0.026, forward: 0.01 }),
    handL.local({ left: -0.046, forward: 0.04, up: 0.008 }),
    0.0065,
    P_ARMOR,
    { bone: handL, group: "arms" },
  );

  // Right Arm (Holding Healing Staff)
  b.sweep(catmull([shoulderR.at, mid(shoulderR.at, elbowR.at), elbowR.at]), 0.042, {
    bone: shoulderR,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    shoulderR.local({ down: 0.07, forward: 0.015 }),
    elbowR.local({ up: 0.04, forward: 0.015 }),
    [0.065, 0.055],
    [0.05, 0.045],
    { bone: shoulderR, color: P_ARMOR, group: "arms" },
  );
  b.part(new THREE.SphereGeometry(0.03, 10, 8), P_GOLD, {
    bone: elbowR,
    at: elbowR.at,
    group: "arms",
  });

  b.sweep(catmull([elbowR.at, wristR.at, handR.at]), 0.038, {
    bone: elbowR,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    elbowR.local({ forward: 0.015, down: 0.03 }),
    wristR.local({ forward: 0.015, down: 0.01 }),
    [0.08, 0.075],
    [0.06, 0.055],
    { bone: elbowR, color: P_ARMOR, group: "arms" },
  );

  // Right Hand (Curled firmly around staff grip)
  b.part(new THREE.BoxGeometry(0.055, 0.045, 0.055), C_SLATE, {
    bone: handR,
    at: handR.at,
    group: "arms",
  });
  for (let f = 0; f < 4; f++) {
    const fX = (f - 1.5) * 0.013;
    b.sweep(
      catmull([
        handR.local({ left: fX, forward: 0.026 }),
        handR.local({ left: fX, forward: 0.04, down: 0.025 }),
        handR.local({ left: fX, down: 0.025 }),
      ]),
      0.0065,
      { bone: handR, color: P_ARMOR, group: "arms" },
    );
  }

  // ---------------------------------------------------------------------------
  // HEALING STAFF: THE "CADUCEUS" (Overwatch Hero Signature Weapon)
  // ---------------------------------------------------------------------------
  // Staff axis passes directly through handR.at, with grounding ferrule at platform
  const staffGrip = handR.at;
  const staffAxis = vec([0.08, 0.98, 0.10]).normalize();
  const staffBottom = offset(staffGrip, staffAxis, -0.86); // Lands right at y ≈ 0.02 on pad
  const staffTop = offset(staffGrip, staffAxis, 1.08); // Reaches up to y ≈ 1.94m

  // Main Shaft Core
  b.rod(staffBottom, staffTop, 0.015, P_CARBON, { bone: handR, group: "staff" });

  // Sleek White Composite Sleeve around Grip
  b.frustumBox(
    offset(staffGrip, staffAxis, -0.14),
    offset(staffGrip, staffAxis, 0.14),
    [0.038, 0.038],
    [0.035, 0.035],
    { bone: handR, color: P_ARMOR, group: "staff" },
  );

  // Grounding Ferrule & Shock Spike
  b.frustumBox(
    offset(staffBottom, staffAxis, 0.12),
    staffBottom,
    [0.032, 0.032],
    [0.016, 0.016],
    { bone: handR, color: P_GOLD, group: "staff" },
  );
  b.part(new THREE.ConeGeometry(0.015, 0.045, 12), C_CHROME, {
    bone: handR,
    at: offset(staffBottom, staffAxis, -0.022),
    dir: staffAxis.clone().negate(),
    group: "staff",
  });

  // Double Glowing Cyan Power Helix along Upper Shaft
  const helixStart = offset(staffGrip, staffAxis, 0.18);
  const helixEnd = offset(staffGrip, staffAxis, 0.72);
  const coil1 = coil(helixStart, helixEnd, 0.026, 3.5);
  const coil2 = coil(helixStart, helixEnd, -0.026, 3.5);

  glow(b.sweep(coil1, 0.0055, { bone: handR, color: C_CYAN, group: "staff" }), 1.9);
  glow(b.sweep(coil2, 0.0055, { bone: handR, color: C_CYAN, group: "staff" }), 1.9);

  // Staff Head Emitter Assembly
  const headChoke = offset(staffGrip, staffAxis, 0.76);
  const headCoreP = offset(staffGrip, staffAxis, 0.92);

  // Gold choke collar
  b.part(new THREE.CylinderGeometry(0.032, 0.026, 0.055, 16), P_GOLD, {
    bone: handR,
    at: headChoke,
    dir: staffAxis,
    group: "staff",
  });

  // Floating Central Biotic Power Sphere (Healing Lens Core)
  const bioticCore = b.part(new THREE.SphereGeometry(0.044, 16, 12), C_CYAN, {
    bone: handR,
    at: headCoreP,
    group: "staff",
  });
  glow(bioticCore, 2.0);

  // Orbiting Energy Gimbal Rings
  glow(
    b.part(new THREE.TorusGeometry(0.062, 0.0045, 8, 24), C_CYAN, {
      bone: handR,
      at: headCoreP,
      dir: staffAxis,
      group: "staff",
    }),
    1.8,
  );
  glow(
    b.part(new THREE.TorusGeometry(0.082, 0.0055, 8, 24), C_GOLD_BRIGHT, {
      bone: handR,
      at: headCoreP,
      rotation: [45, 45, 0],
      group: "staff",
    }),
    1.3,
  );

  // 4 Swept Caduceus Focus Prongs / Emitter Blades
  for (let k = 0; k < 4; k++) {
    const angle = (k * Math.PI) / 2;
    const bladeOutline = [
      [0, 0],
      [0.045, 0.05],
      [0.06, 0.16],
      [0.02, 0.26, "sharp"],
      [-0.025, 0.16],
      [-0.015, 0.03],
    ] as [number, number, string?][];

    const upAxis = staffAxis.clone();
    const radVec = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();

    b.extrude(bladeOutline, {
      bone: handR,
      at: offset(headChoke, radVec, 0.028),
      x: radVec.clone().addScaledVector(upAxis, 0.2).normalize(),
      y: upAxis,
      thickness: 0.009,
      bevel: 0.0025,
      color: P_ARMOR,
      group: "staff",
    });

    // Inner glowing cyan conduit on each prong
    glow(
      b.part(new THREE.BoxGeometry(0.005, 0.14, 0.012), C_CYAN, {
        bone: handR,
        at: offset(headCoreP, radVec, 0.052),
        dir: upAxis,
        group: "staff",
      }),
      1.9,
    );
  }

  // Top Emitter Spike
  b.part(new THREE.ConeGeometry(0.014, 0.07, 12), P_GOLD, {
    bone: handR,
    at: offset(staffTop, staffAxis, 0.018),
    dir: staffAxis,
    group: "staff",
  });

  return b.root;
}
```