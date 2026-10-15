import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";
import { aim, DEG, lerp, mid, offset, rng, vec } from "../../../../src/index";
import { arc, bezier, catmull, polyline, spiral } from "../../../../src/index";
import { limb } from "../../../../src/index";
import { paint, rgb, mix, smoothstep, noise } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil } from "../../../../kits/clockwork";

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
  const C_WHITE = "#fbfdff"; // Clean pearlescent white ceramic armor
  const C_SLATE = "#1e232e"; // Deep tactical carbon composite sub-chassis
  const C_CARBON = "#11141a"; // Nano-weave flexible joints & undersuit
  const C_GOLD = "#e8a020"; // Anodized alloy joints & trim
  const C_GOLD_BRIGHT = "#ffdf66";
  const C_RED = "#ff2752"; // Medical emergency coral red
  const C_CYAN = "#00f5ff"; // Biotic hardlight energy glow
  const C_CYAN_DEEP = "#0088cc";
  const C_PORCELAIN = "#f4ebd9"; // Synthetic android skin tone
  const C_CHROME = "#dbe4ee"; // Polished hydraulic cylinders
  const C_BASE_DARK = "#12151d"; // Stage base ring
  const C_BASE_DECK = "#1a1f2a"; // Stage top deck

  // Ceramic armor with soft occlusion and edge highlights
  const P_ARMOR = paint((p, n) => {
    const edge = smoothstep(0.25, 0.85, Math.abs(n.y) * 0.4 + noise(p, 0.08, 4) * 0.6);
    return mix(C_WHITE, "#d8e1ee", edge * 0.22);
  });

  // Carbon weave undersuit
  const P_CARBON = paint((p, _n) => {
    const weave = (Math.sin(p.x * 260) * Math.sin(p.y * 260) + 1) * 0.5;
    return mix(C_CARBON, "#222733", weave * 0.35);
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
          <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#00f5ff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#00f5ff" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="240" height="112" rx="24" fill="url(#hudGrad)" stroke="#00f5ff" stroke-width="4"/>
      <path d="M22 64 h55 l10 -26 l14 52 l14 -38 l8 12 h111" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="128" cy="64" r="26" fill="none" stroke="#00f5ff" stroke-width="3" stroke-dasharray="8 6"/>
      <circle cx="128" cy="64" r="6" fill="#ffffff"/>
      <text x="32" y="36" font-family="monospace" font-size="16" font-weight="bold" fill="#ffffff">BIOTIC: 100%</text>
      <text x="175" y="104" font-family="monospace" font-size="14" fill="#00f5ff">CADUCEUS</text>
    </svg>`,
    { size: 512 },
  );

  const TEX_HOLO_SIGIL = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="120" fill="none" stroke="#00f5ff" stroke-width="4" stroke-dasharray="14 10"/>
      <circle cx="128" cy="128" r="95" fill="none" stroke="${C_GOLD}" stroke-width="3"/>
      <circle cx="128" cy="128" r="70" fill="none" stroke="#00f5ff" stroke-width="3"/>
      <path d="M108 58 h40 v40 h40 v40 h-40 v40 h-40 v-40 h-40 v-40 h40 Z" fill="#00f5ff" fill-opacity="0.3" stroke="#00f5ff" stroke-width="5"/>
      <circle cx="128" cy="128" r="12" fill="#ffffff"/>
      <path d="M128 8 V48 M128 208 V248 M8 128 H48 M208 128 H248" stroke="#00f5ff" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  const TEX_BASE_HOLOPAD = svg(
    `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="padGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.5"/>
          <stop offset="70%" stop-color="#00f5ff" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#00f5ff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="256" cy="256" r="250" fill="url(#padGlow)"/>
      <circle cx="256" cy="256" r="240" fill="none" stroke="#00f5ff" stroke-width="4" stroke-dasharray="16 12"/>
      <circle cx="256" cy="256" r="215" fill="none" stroke="${C_GOLD}" stroke-width="3"/>
      <circle cx="256" cy="256" r="165" fill="none" stroke="#00f5ff" stroke-width="2"/>
      <path d="M226 126 h60 v70 h70 v60 h-70 v70 h-60 v-70 h-70 v-60 h70 Z" fill="none" stroke="#00f5ff" stroke-width="6"/>
      <circle cx="256" cy="256" r="20" fill="#00f5ff"/>
      <path d="M50 256 H120 M392 256 H462 M256 50 V120 M256 392 V462" stroke="#00f5ff" stroke-width="5"/>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON / RIG DEFINITION (Heroic Stance with Articulated Limbs)
  // ---------------------------------------------------------------------------
  // Pelvis / Hips
  const hips = b.joint("hips", { at: [0, 0.96, 0.0], role: "spine" });

  // Spine & Thorax (Proud, upright support posture)
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.14, -0.01], role: "spine" });
  const chest = b.joint("spine2", { parent: spine1, at: [0, 1.35, 0.01], role: "spine" });

  // Neck, Head, Jaw
  const neck = b.joint("neck", { parent: chest, at: [0, 1.50, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.60, 0.04], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.54, 0.08], aim: [0, 1.52, 0.15], role: "jaw" });

  // Valkyrie Wing Base Mounts (Pivoting from high upper thorax)
  const wingBaseL = b.joint("wingBaseL", {
    parent: chest,
    at: [0.10, 1.44, -0.12],
    dir: [0.75, 0.65, -0.15],
    role: "wing",
  });
  const wingBaseR = b.joint("wingBaseR", {
    parent: chest,
    at: [-0.10, 1.44, -0.12],
    dir: [-0.75, 0.65, -0.15],
    role: "wing",
  });

  // Dynamic Arms:
  // Left Arm: Open support casting pose (elbow bent, palm open and facing forward-up)
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.22, 1.37, 0.0], role: "arm" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [0.38, 1.22, 0.12], role: "arm" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [0.44, 1.16, 0.32], role: "arm" });
  const handL = b.joint("handL", { parent: wristL, at: [0.48, 1.18, 0.44], role: "arm" });

  // Right Arm: Firm grip on the Caduceus Healing Staff (elbow bent, hand forward)
  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.22, 1.37, 0.0], role: "arm" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-0.36, 1.18, 0.06], role: "arm" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-0.34, 1.02, 0.22], role: "arm" });
  const handR = b.joint("handR", { parent: wristR, at: [-0.32, 0.96, 0.32], role: "arm" });

  // Heroic A-Stance Legs (Feet planted stably, natural knee flex)
  const footTargetL = [0.21, 0.05, 0.07];
  const footTargetR = [-0.21, 0.05, -0.05];
  const legLengths = [0.44, 0.44, 0.08];
  const legBends = [
    [0, 0, 1],
    [0, 0, -1],
  ];

  const ptsL = limb([0.14, 0.93, 0.0], footTargetL, legLengths, legBends, { sole: [0, 0, 1] });
  const ptsR = limb([-0.14, 0.93, 0.0], footTargetR, legLengths, legBends, { sole: [0, 0, 1] });

  const legL = b.chain("legL", ptsL, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "toeL"],
    role: "leg",
    contact: [0.21, 0.0, 0.09],
  });
  const legR = b.chain("legR", ptsR, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "toeR"],
    role: "leg",
    contact: [-0.21, 0.0, -0.03],
  });

  // ---------------------------------------------------------------------------
  // STAGED RECHARGE PLATFORM / BASE
  // ---------------------------------------------------------------------------
  // Beveled outer stage ring
  b.lathe(
    [
      [0.0, -0.045],
      [0.90, -0.045],
      [0.90, -0.02],
      [0.82, 0.0],
      [0.0, 0.0],
    ],
    {
      at: [0, 0, 0],
      segments: 20,
      color: C_BASE_DARK,
      group: "stage",
    },
  );

  // Deck surface
  b.part(new THREE.CylinderGeometry(0.79, 0.81, 0.014, 28), C_BASE_DECK, {
    at: [0, 0.007, 0],
    group: "stage",
  });

  // Glowing Holo-Ring border
  glow(
    b.part(new THREE.TorusGeometry(0.79, 0.008, 8, 36), C_CYAN, {
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
    const px = Math.cos(angle) * 0.82;
    const pz = Math.sin(angle) * 0.82;
    b.frustumBox([px, 0.0, pz], [px, 0.065, pz], [0.06, 0.06], [0.035, 0.035], {
      color: P_GOLD,
      group: "stage",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.018, 10, 8), C_CYAN, {
        at: [px, 0.07, pz],
        group: "stage",
      }),
      1.8,
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD, FACE & VALKYRIE HELMET
  // ---------------------------------------------------------------------------
  // Pearlescent white helmet shell
  b.part(new THREE.SphereGeometry(0.096, 16, 14), P_ARMOR, {
    bone: head,
    at: head.local({ forward: -0.01, up: 0.02 }),
    scale: [0.96, 1.15, 1.05],
    group: "head",
  });

  // Front forehead crest plate (sharp central chevron)
  b.frustumBox(
    head.local({ forward: 0.05, up: 0.07 }),
    head.local({ forward: 0.095, up: 0.08 }),
    [0.05, 0.04],
    [0.02, 0.015],
    { bone: head, color: P_GOLD, group: "head" },
  );

  // Synthetic lower face & cheeks (warm android porcelain)
  b.frustumBox(
    head.local({ forward: 0.04, down: 0.025 }),
    head.local({ forward: 0.08, down: 0.075 }),
    [0.09, 0.075],
    [0.045, 0.035],
    { bone: head, color: C_PORCELAIN, group: "head" },
  );

  // Articulated rebreather jaw plate with intake slats
  b.frustumBox(
    jaw.local({ forward: 0.01, down: 0.01 }),
    jaw.local({ forward: 0.048, up: 0.01 }),
    [0.048, 0.032],
    [0.032, 0.022],
    { bone: jaw, color: C_SLATE, group: "head" },
  );

  // Gold chin accent
  b.part(new THREE.BoxGeometry(0.024, 0.012, 0.026), P_GOLD, {
    bone: jaw,
    at: jaw.local({ forward: 0.045, down: 0.008 }),
    group: "head",
  });

  // Glowing Tactical Visor (Overwatch signature curved wrap-around visor)
  const visorMesh = b.part(new THREE.SphereGeometry(0.10, 16, 12, 0, Math.PI), C_CYAN, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.015 }),
    scale: [0.96, 0.55, 1.05],
    rotation: [0, 90, 0],
    group: "head",
  });
  glow(visorMesh, 1.6);

  // Visor HUD decal
  glow(
    b.part(new THREE.PlaneGeometry(0.14, 0.07), "#ffffff", {
      bone: head,
      at: head.local({ forward: 0.114, up: 0.015 }),
      dir: [0, 0.1, 1],
      axis: "z",
      texture: TEX_VISOR_HUD,
      group: "head",
    }),
    1.7,
  );

  // Valkyrie Ear Winglets / Audio Antennae
  for (const s of [1, -1]) {
    const earAt = head.local({ left: s * 0.096, up: 0.035, back: 0.015 });
    b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 12), P_GOLD, {
      bone: head,
      at: earAt,
      dir: [s * 1, 0, 0],
      group: "head",
    });

    const earWingOutline = [
      [0, 0],
      [0.022, 0.045],
      [0.038, 0.12, "sharp"],
      [0.012, 0.10],
      [-0.015, 0.02],
    ] as [number, number, string?][];

    b.extrude(earWingOutline, {
      bone: head,
      at: earAt,
      x: [s * 0.25, 0.85, -0.45],
      y: [0, 0.9, 0.4],
      thickness: 0.008,
      bevel: 0.002,
      color: P_ARMOR,
      group: "head",
    });

    glow(
      b.part(new THREE.BoxGeometry(0.004, 0.075, 0.01), C_CYAN, {
        bone: head,
        at: head.local({ left: s * 0.115, up: 0.085, back: 0.035 }),
        rotation: [-25, 0, s * -15],
        group: "head",
      }),
      1.8,
    );
  }

  // Sleek cybernetic ponytail / fiber-optic plume swept back
  const hairPath = catmull([
    head.local({ up: 0.08, back: 0.07 }),
    head.local({ up: 0.06, back: 0.16 }),
    head.local({ down: 0.04, back: 0.24 }),
    head.local({ down: 0.16, back: 0.28 }),
  ]);
  b.sweep(hairPath, (t) => 0.034 * (1 - t) + 0.008, {
    bone: head,
    color: C_SLATE,
    group: "head",
  });
  b.part(new THREE.TorusGeometry(0.028, 0.007, 8, 16), P_GOLD, {
    bone: head,
    at: head.local({ up: 0.065, back: 0.11 }),
    rotation: [45, 0, 0],
    group: "head",
  });

  // Neck Hydraulic Pistons & Nano-weave Collar
  b.sweep(polyline([chest.local({ up: 0.12 }), neck.at]), 0.046, {
    bone: neck,
    color: P_CARBON,
    group: "neck",
  });
  for (const s of [1, -1]) {
    b.rod(
      chest.local({ left: s * 0.055, up: 0.12, forward: 0.02 }),
      head.local({ left: s * 0.04, down: 0.04, back: 0.01 }),
      0.008,
      C_CHROME,
      { bone: neck, group: "neck" },
    );
  }

  // ---------------------------------------------------------------------------
  // TORSO, CHASSIS & BIOTIC REACTOR
  // ---------------------------------------------------------------------------
  // Flexible nano-weave core waist
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

  // Major Ceramic White Cuirass (Tapered athletic V-shape)
  b.frustumBox(
    chest.local({ up: -0.06, forward: 0.01 }),
    chest.local({ up: 0.11, forward: 0.03 }),
    [0.28, 0.19],
    [0.34, 0.23],
    { bone: chest, color: P_ARMOR, group: "torso" },
  );

  // Sculpted Pectoral Armor Plates with chamfered facets
  for (const s of [1, -1]) {
    b.frustumBox(
      chest.local({ left: s * 0.07, up: 0.03, forward: 0.08 }),
      chest.local({ left: s * 0.095, up: 0.065, forward: 0.138 }),
      [0.12, 0.11],
      [0.085, 0.075],
      { bone: chest, color: P_ARMOR, group: "torso" },
    );
  }

  // Segmented Upper Abdominal Plates (White ceramic on black carbon)
  for (let r = 0; r < 2; r++) {
    const yAb = -0.01 - r * 0.055;
    b.frustumBox(
      spine1.local({ forward: 0.08, up: yAb }),
      spine1.local({ forward: 0.115, up: yAb + 0.01 }),
      [0.18 - r * 0.03, 0.038],
      [0.15 - r * 0.03, 0.03],
      { bone: spine1, color: P_ARMOR, group: "torso" },
    );
  }

  // Central Biotic Heart Reactor (Overwatch signature chest core)
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 16), P_GOLD, {
    bone: chest,
    at: chest.local({ forward: 0.128, up: 0.02 }),
    rotation: [90, 0, 0],
    group: "torso",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.028, 14, 10), C_CYAN, {
      bone: chest,
      at: chest.local({ forward: 0.138, up: 0.02 }),
      group: "torso",
    }),
    1.9,
  );

  // Medical Cross Decal on Upper Left Pectoral
  b.part(new THREE.PlaneGeometry(0.068, 0.068), "#ffffff", {
    bone: chest,
    at: chest.local({ left: 0.095, up: 0.055, forward: 0.142 }),
    dir: [0.1, 0.1, 1],
    axis: "z",
    texture: TEX_CROSS,
    group: "torso",
  });

  // Clavicle Guard / Gorget Collar
  b.frustumBox(
    chest.local({ up: 0.115, forward: 0.03 }),
    chest.local({ up: 0.14, forward: 0.08 }),
    [0.26, 0.035],
    [0.18, 0.022],
    { bone: chest, color: C_SLATE, group: "torso" },
  );

  // Lateral Rib Protector Slats
  for (const s of [1, -1]) {
    for (let r = 0; r < 3; r++) {
      const yOff = -0.05 - r * 0.035;
      b.frustumBox(
        chest.local({ left: s * 0.12, up: yOff, forward: 0.02 }),
        chest.local({ left: s * 0.16, up: yOff, forward: 0.05 }),
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
      hips.local({ forward: 0.125 }),
      hips.local({ left: 0.155 }),
      hips.local({ back: 0.115 }),
      hips.local({ right: 0.155 }),
      hips.local({ forward: 0.125 }),
    ]),
    0.022,
    { bone: hips, color: C_SLATE, group: "hips" },
  );

  // Central Belt Buckle / Biotic Battery Pack
  b.frustumBox(
    hips.local({ forward: 0.115, up: 0.01 }),
    hips.local({ forward: 0.155, down: 0.02 }),
    [0.08, 0.055],
    [0.065, 0.045],
    { bone: hips, color: P_GOLD, group: "hips" },
  );
  glow(
    b.part(new THREE.BoxGeometry(0.035, 0.012, 0.01), C_CYAN, {
      bone: hips,
      at: hips.local({ forward: 0.16, down: 0.005 }),
      group: "hips",
    }),
    1.6,
  );

  // Pelvic Guard Plate (White ceramic front tasset)
  b.frustumBox(
    hips.local({ forward: 0.105, down: 0.03 }),
    hips.local({ forward: 0.115, down: 0.14 }),
    [0.10, 0.045],
    [0.04, 0.018],
    { bone: hips, color: P_ARMOR, group: "hips" },
  );

  // Twin Biotic Serum Ampoules on Hips
  for (const s of [1, -1]) {
    const pFlask = hips.local({ left: s * 0.155, forward: 0.03, down: 0.02 });
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
        [0.075, 0],
        [0.06, -0.14],
        [0, -0.10],
      ],
      {
        bone: hips,
        at: hips.local({ left: s * 0.165, up: 0.02, back: 0.01 }),
        x: [s * 0.85, -0.25, 0],
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.003,
        color: P_ARMOR,
        group: "hips",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // EXPANSIVE VALKYRIE PHOTONIC HARDLIGHT WINGS
  // ---------------------------------------------------------------------------
  // Back Turbine Generator Unit (Mounted securely to upper thorax)
  b.frustumBox(
    chest.local({ back: 0.08, up: 0.02 }),
    chest.local({ back: 0.18, up: 0.09 }),
    [0.18, 0.22],
    [0.13, 0.16],
    { bone: chest, color: C_SLATE, group: "wings" },
  );

  // Twin Thruster Exhaust Ports on Generator
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.038, 0.046, 0.035, 16), P_GOLD, {
      bone: chest,
      at: chest.local({ left: s * 0.06, back: 0.19, up: 0.055 }),
      rotation: [90, 0, 0],
      group: "wings",
    });
    glow(
      b.part(new THREE.CircleGeometry(0.032, 16), C_CYAN, {
        bone: chest,
        at: chest.local({ left: s * 0.06, back: 0.208, up: 0.055 }),
        rotation: [0, 180, 0],
        group: "wings",
      }),
      1.9,
    );
  }

  // Major Overwatch-style Valkyrie Wing Architecture
  // Creates a soaring ~2.3m wingspan that reads dramatically from all angles!
  const buildValkyrieWing = (s: number, wingBone: any) => {
    const rootP = wingBone.at;

    // Wing Root Gimbal Hub
    b.part(new THREE.SphereGeometry(0.036, 12, 10), P_GOLD, {
      bone: wingBone,
      at: rootP,
      group: "wings",
    });

    // Articulated Mechanical Pylon (Inner bracket curving up, elbowing out)
    const p1 = offset(rootP, [s * 0.24, 0.22, -0.04], 1);
    const pElbow = offset(rootP, [s * 0.44, 0.38, -0.08], 1);
    const pTip = offset(rootP, [s * 0.70, 0.58, -0.14], 1);

    b.sweep(catmull([rootP, p1, pElbow]), 0.026, {
      bone: wingBone,
      color: P_ARMOR,
      section: "box",
      group: "wings",
    });

    // Gold elbow joint bracket
    b.part(new THREE.SphereGeometry(0.028, 10, 8), P_GOLD, {
      bone: wingBone,
      at: pElbow,
      group: "wings",
    });

    // Outer tapered aerodynamic wing spar
    b.sweep(catmull([pElbow, pTip]), (t) => 0.024 * (1 - t * 0.5), {
      bone: wingBone,
      color: P_ARMOR,
      section: "box",
      group: "wings",
    });

    // 4 Soaring, Overlapping Photonic Hardlight Feathers
    // Broad, radiant cyan energy blades extending outward and fanning downward
    const feathers = [
      {
        origin: pTip,
        len: 0.58,
        w: 0.14,
        angleDeg: 10,
        zTilt: -0.08,
      },
      {
        origin: lerp(pElbow, pTip, 0.65),
        len: 0.68,
        w: 0.16,
        angleDeg: 28,
        zTilt: -0.06,
      },
      {
        origin: pElbow,
        len: 0.62,
        w: 0.15,
        angleDeg: 46,
        zTilt: -0.04,
      },
      {
        origin: p1,
        len: 0.48,
        w: 0.12,
        angleDeg: 66,
        zTilt: -0.02,
      },
    ];

    feathers.forEach((f) => {
      const rad = (f.angleDeg * Math.PI) / 180;
      const xDir: [number, number, number] = [
        s * Math.cos(rad) * 0.98,
        Math.sin(rad) * 0.98,
        f.zTilt,
      ];

      // Broad stylized feather silhouette
      const featherPoly = [
        [0, 0],
        [f.len * 0.35, f.w * 0.5],
        [f.len, 0, "sharp"],
        [f.len * 0.55, -f.w * 0.45],
        [0.02, -f.w * 0.2],
      ] as [number, number, string?][];

      const bladeMesh = b.extrude(featherPoly, {
        bone: wingBone,
        at: f.origin,
        x: xDir,
        y: [0, 0.2, 0.98],
        thickness: 0.010,
        bevel: 0.003,
        color: C_CYAN,
        group: "wings",
      });
      glow(bladeMesh, 1.95);

      // Gold mounting bracket clasp
      b.frustumBox(
        f.origin,
        offset(f.origin, xDir, 0.08),
        [0.035, 0.022],
        [0.018, 0.012],
        { bone: wingBone, color: P_GOLD, group: "wings" },
      );
    });
  };

  buildValkyrieWing(1, wingBaseL);
  buildValkyrieWing(-1, wingBaseR);

  // ---------------------------------------------------------------------------
  // LEGS, KNEE COPS & BOOSTER GREAVES (Rich Ceramic-Dominated Plating)
  // ---------------------------------------------------------------------------
  const buildLegArmor = (legChain: any, s: number) => {
    const hipJ = legChain.joints[0];
    const kneeJ = legChain.joints[1];
    const ankleJ = legChain.joints[2];
    const toeJ = legChain.joints[3];

    // Thigh Core (Flexible nano-weave undersuit)
    b.sweep(
      catmull([hipJ.at, mid(hipJ.at, kneeJ.at), kneeJ.at]),
      (t) => [0.085 - t * 0.018, 0.09 - t * 0.018],
      {
        bone: hipJ,
        color: P_CARBON,
        section: "box",
        group: "legs",
      },
    );

    // Front Thigh Ceramic Armor Shell (Large crisp white plate)
    b.frustumBox(
      hipJ.local({ forward: 0.058, down: 0.06 }),
      kneeJ.local({ forward: 0.052, up: 0.04 }),
      [0.12, 0.05],
      [0.085, 0.04],
      { bone: hipJ, color: P_ARMOR, group: "legs" },
    );

    // Lateral Thigh Armor Plate
    b.frustumBox(
      hipJ.local({ left: s * 0.068, down: 0.08, forward: 0.01 }),
      kneeJ.local({ left: s * 0.058, up: 0.05, forward: 0.01 }),
      [0.035, 0.10],
      [0.028, 0.08],
      { bone: hipJ, color: P_ARMOR, group: "legs" },
    );

    // Lateral Gold Stabilizer Rail
    b.rod(
      hipJ.local({ left: s * 0.082, down: 0.05, forward: 0.01 }),
      kneeJ.local({ left: s * 0.072, up: 0.04, forward: 0.01 }),
      0.010,
      P_GOLD,
      { bone: hipJ, group: "legs" },
    );

    // Knee Pivot Hub Disc
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.115, 12), P_GOLD, {
      bone: kneeJ,
      at: kneeJ.at,
      dir: [s * 1, 0, 0],
      group: "legs",
    });

    // Articulated Protective Knee Cap Shell (White armor with gold chevron)
    b.frustumBox(
      kneeJ.local({ forward: 0.03, down: 0.035 }),
      kneeJ.local({ forward: 0.092, up: 0.02 }),
      [0.095, 0.095],
      [0.06, 0.06],
      { bone: kneeJ, color: P_ARMOR, group: "legs" },
    );
    b.part(new THREE.BoxGeometry(0.04, 0.015, 0.02), P_GOLD, {
      bone: kneeJ,
      at: kneeJ.local({ forward: 0.095, up: 0.015 }),
      group: "legs",
    });

    // Lower Leg Shin Core
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

    // Anterior Shin Armor Plate (Substantial white ceramic greave)
    b.frustumBox(
      kneeJ.local({ forward: 0.068, down: 0.04 }),
      ankleJ.local({ forward: 0.058, up: 0.02 }),
      [0.09, 0.045],
      [0.065, 0.035],
      { bone: kneeJ, color: P_ARMOR, group: "legs" },
    );

    // Lateral Shin Plates
    b.frustumBox(
      kneeJ.local({ left: s * 0.052, down: 0.06, forward: 0.01 }),
      ankleJ.local({ left: s * 0.044, up: 0.03, forward: 0.01 }),
      [0.025, 0.08],
      [0.020, 0.06],
      { bone: kneeJ, color: P_ARMOR, group: "legs" },
    );

    // Posterior Jump Thruster / Calf Booster
    const pCalf = mid(kneeJ.at, ankleJ.at);
    b.frustumBox(
      offset(pCalf, [0, 0, -1], 0.055),
      offset(pCalf, [0, 0, -1], 0.11),
      [0.07, 0.14],
      [0.048, 0.095],
      { bone: kneeJ, color: C_SLATE, group: "legs" },
    );
    glow(
      b.part(new THREE.BoxGeometry(0.028, 0.055, 0.01), C_CYAN, {
        bone: kneeJ,
        at: offset(pCalf, [0, 0, -1], 0.115),
        group: "legs",
      }),
      1.7,
    );

    // Ankle Ring Clasp
    b.part(new THREE.CylinderGeometry(0.052, 0.056, 0.035, 14), P_GOLD, {
      bone: ankleJ,
      at: ankleJ.at,
      group: "legs",
    });

    // Armored High-Traction Combat Boot
    // Heel block
    b.frustumBox(
      ankleJ.local({ back: 0.03, down: 0.02 }),
      ankleJ.local({ back: 0.06, down: 0.065 }),
      [0.09, 0.07],
      [0.08, 0.07],
      { bone: ankleJ, color: C_SLATE, group: "legs" },
    );

    // Front armored toe box resting squarely on platform
    b.frustumBox(
      ankleJ.local({ back: 0.04, down: 0.065 }),
      ankleJ.local({ forward: 0.12, down: 0.065 }),
      [0.085, 0.035],
      [0.068, 0.03],
      { bone: toeJ, color: P_ARMOR, group: "legs" },
    );

    // Glowing Anti-Gravity Sole Pad (Firm ground contact at y = 0.01)
    glow(
      b.part(new THREE.BoxGeometry(0.072, 0.008, 0.18), C_CYAN, {
        bone: toeJ,
        at: ankleJ.local({ forward: 0.035, down: 0.084 }),
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
  // Sculpted Layered Pauldrons
  for (const s of [1, -1]) {
    const shoulderJ = s === 1 ? shoulderL : shoulderR;
    const pauldronAt = shoulderJ.local({ up: 0.065, left: s * 0.038 });

    b.part(new THREE.SphereGeometry(0.085, 14, 10, 0, Math.PI), P_ARMOR, {
      bone: shoulderJ,
      at: pauldronAt,
      scale: [1.15, 0.95, 1.25],
      rotation: [0, s * -90, s * 25],
      group: "arms",
    });

    b.frustumBox(
      pauldronAt,
      offset(pauldronAt, [s * 1, -0.4, 0], 0.08),
      [0.12, 0.095],
      [0.085, 0.075],
      { bone: shoulderJ, color: P_GOLD, group: "arms" },
    );

    b.part(new THREE.PlaneGeometry(0.055, 0.055), "#ffffff", {
      bone: shoulderJ,
      at: offset(pauldronAt, [s * 1, 0.02, 0.01], 0.09),
      dir: [s * 1, 0.2, 0],
      axis: "z",
      texture: TEX_CROSS,
      group: "arms",
    });
  }

  // Left Arm (Heroic Biotic Field Projector Stance)
  // Bicep
  b.sweep(catmull([shoulderL.at, mid(shoulderL.at, elbowL.at), elbowL.at]), 0.044, {
    bone: shoulderL,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    shoulderL.local({ down: 0.07, forward: 0.015 }),
    elbowL.local({ up: 0.04, forward: 0.015 }),
    [0.07, 0.06],
    [0.055, 0.048],
    { bone: shoulderL, color: P_ARMOR, group: "arms" },
  );

  // Elbow Joint Hub
  b.part(new THREE.SphereGeometry(0.032, 10, 8), P_GOLD, {
    bone: elbowL,
    at: elbowL.at,
    group: "arms",
  });

  // Forearm & Vambrace
  b.sweep(catmull([elbowL.at, wristL.at, handL.at]), 0.04, {
    bone: elbowL,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    elbowL.local({ forward: 0.015, down: 0.025 }),
    wristL.local({ forward: 0.015, down: 0.01 }),
    [0.085, 0.078],
    [0.065, 0.058],
    { bone: elbowL, color: P_ARMOR, group: "arms" },
  );

  // Wrist Gauntlet Collar
  b.part(new THREE.CylinderGeometry(0.038, 0.042, 0.04, 12), P_GOLD, {
    bone: wristL,
    at: mid(wristL.at, handL.at),
    dir: handL.at.clone().sub(wristL.at).normalize(),
    group: "arms",
  });

  // Multi-Stim Biotic Syringe Array on Forearm
  for (let a = -1; a <= 1; a++) {
    const pAmp = wristL.local({ up: 0.04, left: a * 0.022, forward: 0.01 });
    glow(
      b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.048, 8), C_CYAN, {
        bone: wristL,
        at: pAmp,
        rotation: [45, 0, 0],
        group: "arms",
      }),
      1.8,
    );
    b.part(new THREE.ConeGeometry(0.006, 0.018, 8), P_GOLD, {
      bone: wristL,
      at: offset(pAmp, [0, 0.7, 0.7], 0.028),
      dir: [0, 1, 1],
      group: "arms",
    });
  }

  // Left Hand Palm & Open Casting Fingers
  b.part(new THREE.BoxGeometry(0.058, 0.026, 0.068), C_SLATE, {
    bone: handL,
    at: handL.at,
    group: "arms",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.018, 14), C_CYAN, {
      bone: handL,
      at: handL.local({ up: 0.015, forward: 0.01 }),
      rotation: [-90, 0, 0],
      group: "arms",
    }),
    2.0,
  );
  // Fingers fanned open casting healing stream
  for (let f = 0; f < 4; f++) {
    const fX = (f - 1.5) * 0.015;
    b.rod(
      handL.local({ left: fX, forward: 0.03 }),
      handL.local({ left: fX * 1.2, forward: 0.08, up: 0.01 }),
      0.0055,
      P_ARMOR,
      { bone: handL, group: "arms" },
    );
  }
  b.rod(
    handL.local({ left: -0.028, forward: 0.01 }),
    handL.local({ left: -0.05, forward: 0.04, up: 0.015 }),
    0.0065,
    P_ARMOR,
    { bone: handL, group: "arms" },
  );

  // Floating Holographic Healing Sigil radiating above palm
  glow(
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      bone: handL,
      at: handL.local({ up: 0.09, forward: 0.04 }),
      dir: [0.1, 0.9, 0.3],
      axis: "z",
      texture: TEX_HOLO_SIGIL,
      group: "arms",
    }),
    1.9,
  );

  // Right Arm (Gripping Caduceus Staff)
  b.sweep(catmull([shoulderR.at, mid(shoulderR.at, elbowR.at), elbowR.at]), 0.044, {
    bone: shoulderR,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    shoulderR.local({ down: 0.07, forward: 0.015 }),
    elbowR.local({ up: 0.04, forward: 0.015 }),
    [0.07, 0.06],
    [0.055, 0.048],
    { bone: shoulderR, color: P_ARMOR, group: "arms" },
  );
  b.part(new THREE.SphereGeometry(0.032, 10, 8), P_GOLD, {
    bone: elbowR,
    at: elbowR.at,
    group: "arms",
  });

  b.sweep(catmull([elbowR.at, wristR.at, handR.at]), 0.04, {
    bone: elbowR,
    color: P_CARBON,
    group: "arms",
  });
  b.frustumBox(
    elbowR.local({ forward: 0.015, down: 0.025 }),
    wristR.local({ forward: 0.015, down: 0.01 }),
    [0.085, 0.078],
    [0.065, 0.058],
    { bone: elbowR, color: P_ARMOR, group: "arms" },
  );

  // Right Hand (Curled firmly around staff grip)
  b.part(new THREE.BoxGeometry(0.058, 0.048, 0.058), C_SLATE, {
    bone: handR,
    at: handR.at,
    group: "arms",
  });
  for (let f = 0; f < 4; f++) {
    const fX = (f - 1.5) * 0.014;
    b.sweep(
      catmull([
        handR.local({ left: fX, forward: 0.028 }),
        handR.local({ left: fX, forward: 0.042, down: 0.025 }),
        handR.local({ left: fX, down: 0.025 }),
      ]),
      0.007,
      { bone: handR, color: P_ARMOR, group: "arms" },
    );
  }

  // ---------------------------------------------------------------------------
  // HEALING STAFF: THE "CADUCEUS" (Hero Prop held forward & outward)
  // ---------------------------------------------------------------------------
  // Staff axis angled forward-outward to read prominently in 3/4 and front views!
  const staffGrip = handR.at;
  const staffAxis = vec([-0.12, 0.96, 0.22]).normalize();
  const staffBottom = offset(staffGrip, staffAxis, -0.98); // Ground contact at y ≈ 0.02
  const staffTop = offset(staffGrip, staffAxis, 1.05); // Reaches up to y ≈ 1.95m

  // Main Shaft Core
  b.rod(staffBottom, staffTop, 0.016, P_CARBON, { bone: handR, group: "staff" });

  // Sleek White Composite Sleeve around Grip
  b.frustumBox(
    offset(staffGrip, staffAxis, -0.16),
    offset(staffGrip, staffAxis, 0.16),
    [0.04, 0.04],
    [0.036, 0.036],
    { bone: handR, color: P_ARMOR, group: "staff" },
  );

  // Grounding Ferrule & Shock Spike
  b.frustumBox(
    offset(staffBottom, staffAxis, 0.14),
    staffBottom,
    [0.034, 0.034],
    [0.018, 0.018],
    { bone: handR, color: P_GOLD, group: "staff" },
  );
  b.part(new THREE.ConeGeometry(0.016, 0.045, 12), C_CHROME, {
    bone: handR,
    at: offset(staffBottom, staffAxis, -0.022),
    dir: staffAxis.clone().negate(),
    group: "staff",
  });

  // Double Glowing Cyan Power Helix along Upper Shaft
  const helixStart = offset(staffGrip, staffAxis, 0.18);
  const helixEnd = offset(staffGrip, staffAxis, 0.70);
  const coil1 = coil(helixStart, helixEnd, 0.028, 3.5);
  const coil2 = coil(helixStart, helixEnd, -0.028, 3.5);

  glow(b.sweep(coil1, 0.006, { bone: handR, color: C_CYAN, group: "staff" }), 1.9);
  glow(b.sweep(coil2, 0.006, { bone: handR, color: C_CYAN, group: "staff" }), 1.9);

  // Staff Head Emitter Assembly
  const headChoke = offset(staffGrip, staffAxis, 0.74);
  const headCoreP = offset(staffGrip, staffAxis, 0.90);

  // Gold choke collar
  b.part(new THREE.CylinderGeometry(0.034, 0.028, 0.06, 16), P_GOLD, {
    bone: handR,
    at: headChoke,
    dir: staffAxis,
    group: "staff",
  });

  // Floating Central Biotic Power Sphere (Healing Lens Core)
  const bioticCore = b.part(new THREE.SphereGeometry(0.046, 16, 14), C_CYAN, {
    bone: handR,
    at: headCoreP,
    group: "staff",
  });
  glow(bioticCore, 2.0);

  // Orbiting Energy Gimbal Rings
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
    b.part(new THREE.TorusGeometry(0.086, 0.006, 8, 24), C_GOLD_BRIGHT, {
      bone: handR,
      at: headCoreP,
      rotation: [45, 45, 0],
      group: "staff",
    }),
    1.4,
  );

  // 4 Caduceus Wing Prongs (White ceramic wings with gold bevels and cyan channels)
  for (let k = 0; k < 4; k++) {
    const angle = (k * Math.PI) / 2;
    const bladeOutline = [
      [0, 0],
      [0.05, 0.06],
      [0.07, 0.18],
      [0.024, 0.30, "sharp"],
      [-0.03, 0.18],
      [-0.018, 0.03],
    ] as [number, number, string?][];

    const upAxis = staffAxis.clone();
    const radVec = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();

    b.extrude(bladeOutline, {
      bone: handR,
      at: offset(headChoke, radVec, 0.03),
      x: radVec.clone().addScaledVector(upAxis, 0.22).normalize(),
      y: upAxis,
      thickness: 0.010,
      bevel: 0.0028,
      color: P_ARMOR,
      group: "staff",
    });

    // Inner glowing cyan conduit on each prong
    glow(
      b.part(new THREE.BoxGeometry(0.006, 0.16, 0.014), C_CYAN, {
        bone: handR,
        at: offset(headCoreP, radVec, 0.056),
        dir: upAxis,
        group: "staff",
      }),
      1.9,
    );
  }

  // Top Emitter Spike
  b.part(new THREE.ConeGeometry(0.015, 0.075, 12), P_GOLD, {
    bone: handR,
    at: offset(staffTop, staffAxis, 0.02),
    dir: staffAxis,
    group: "staff",
  });

  return b.root;
}
