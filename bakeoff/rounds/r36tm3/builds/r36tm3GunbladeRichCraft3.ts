import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { gearGeometry, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "gunblade",
  description: "A dramatic Final Fantasy-inspired gunblade with a broad rune-etched sword, rifle receiver, glowing chamber, ornate guard, and mechanical detailing.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = metal("steel", { polish: 0.72, tarnish: 0.08, size: 0.11, seed: 11 });
  const DARK_STEEL = metal("iron", { polish: 0.34, tarnish: 0.16, size: 0.08, seed: 12 });
  const BLUE_STEEL = metal("blued", { polish: 0.58, tarnish: 0.12, size: 0.09, seed: 13 });
  const BRASS = metal("brass", { polish: 0.7, tarnish: 0.12, verdigris: 0.08, size: 0.06, seed: 14 });
  const COPPER = metal("copper", { polish: 0.58, tarnish: 0.16, size: 0.055, seed: 15 });

  const INK = "#151824";
  const EDGE = "#d9e6f1";
  const LEATHER = "#241923";
  const LEATHER_HI = "#563144";
  const CRIMSON = "#a9283b";
  const GLOW = "#42d9ff";
  const GLOW_WHITE = "#d7fbff";
  const GOLD = "#f4c76a";

  const runeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 240">
      <defs>
        <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#efffff"/>
          <stop offset=".42" stop-color="#39dfff"/>
          <stop offset="1" stop-color="#0876bd"/>
        </linearGradient>
        <filter id="b"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <path d="M50 8 L50 232" stroke="#39dfff" stroke-width="13" opacity=".3" filter="url(#b)"/>
      <path d="M50 12 L50 225 M50 40 L28 63 L50 85 L72 63 M50 92 L28 116 L50 139 L72 116 M50 146 L32 165 L50 187 L68 165"
        fill="none" stroke="url(#r)" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M42 27 L58 27 M39 205 L61 205" stroke="#ffffff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const crestTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#121827" stroke="#e6bb62" stroke-width="5"/>
      <path d="M64 15 L76 49 L111 51 L84 72 L93 108 L64 87 L35 108 L44 72 L17 51 L52 49 Z"
        fill="#40dfff" stroke="#dfffff" stroke-width="3"/>
      <circle cx="64" cy="64" r="12" fill="#111522" stroke="#fff4b0" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  const bladeOutline: [number, number, "sharp"][] = [
    [-0.13, 0],
    [0.15, 0],
    [0.205, 0.23],
    [0.175, 0.43],
    [0.215, 0.62],
    [0.16, 0.78],
    [0.095, 1.02],
    [0.035, 1.23, "sharp"],
    [-0.015, 1.37, "sharp"],
    [-0.055, 1.18],
    [-0.13, 1.00],
    [-0.205, 0.81],
    [-0.17, 0.61],
    [-0.22, 0.43],
    [-0.18, 0.22],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 1.1, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.075, 0.045],
    bevel: 0.012,
    smoothing: 1,
    color: STEEL,
    name: "heroBlade",
    group: "blade",
  });

  const bladeInset = b.extrude(
    [
      [-0.095, 0.05],
      [0.105, 0.05],
      [0.14, 0.25],
      [0.125, 0.42],
      [0.155, 0.61],
      [0.1, 0.75],
      [0.045, 1.01],
      [0.0, 1.18, "sharp"],
      [-0.035, 1.03],
      [-0.105, 0.78],
      [-0.14, 0.6],
      [-0.115, 0.42],
      [-0.145, 0.23],
    ],
    {
      at: [0, 1.1, 0.043],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      color: BLUE_STEEL,
      name: "bladeFuller",
      group: "blade",
    },
  );

  b.part(new THREE.PlaneGeometry(0.095, 0.42), GLOW_WHITE, {
    at: [0.012, 1.54, 0.054],
    dir: [0, 0, 1],
    axis: "z",
    texture: runeTexture,
    name: "bladeRune",
    group: "blade",
  });

  const bladeEdge = b.rod(
    [-0.015, 2.455, 0.015],
    [-0.13, 1.17, 0.015],
    0.014,
    { color: EDGE, caps: "flat", name: "bladeEdgeL", group: "blade" },
  );
  b.rod(
    [-0.015, 2.455, 0.018],
    [0.12, 1.16, 0.018],
    0.014,
    { color: EDGE, caps: "flat", name: "bladeEdgeR", group: "blade" },
  );

  b.part(new THREE.BoxGeometry(0.55, 0.105, 0.11), DARK_STEEL, {
    at: [0, 1.105, 0.015],
    name: "crossguardCore",
    group: "guard",
  });

  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.22, 1.105, 0.015],
      [s * 0.95, 0.18, 0],
      0.22,
      0.052,
      { color: BRASS, name: `guardTip${s}`, group: "guard" },
    );
    b.part(new THREE.SphereGeometry(0.064, 8, 6), GOLD, {
      at: [s * 0.29, 1.11, 0.015],
      name: `guardGem${s}`,
      group: "guard",
    });
    b.rod(
      [s * 0.13, 1.08, 0.08],
      [s * 0.35, 1.055, 0.09],
      0.018,
      { color: COPPER, name: `guardFiligree${s}`, group: "guard" },
    );
  }

  const receiver = b.part(new THREE.BoxGeometry(0.27, 0.25, 0.58), DARK_STEEL, {
    at: [0, 1.12, 0.24],
    name: "rifleReceiver",
    group: "firearm",
  });

  b.part(new THREE.BoxGeometry(0.31, 0.075, 0.33), BLUE_STEEL, {
    at: [0, 1.22, 0.35],
    name: "receiverTopPlate",
    group: "firearm",
  });

  b.part(new THREE.BoxGeometry(0.22, 0.055, 0.4), BRASS, {
    at: [0, 1.255, 0.24],
    name: "receiverSpine",
    group: "firearm",
  });

  b.part(new THREE.BoxGeometry(0.19, 0.14, 0.37), STEEL, {
    at: [0, 1.11, 0.58],
    name: "barrelHousing",
    group: "firearm",
  });

  b.rod(
    [0, 1.12, 0.71],
    [0, 1.12, 1.03],
    0.052,
    { color: BLUE_STEEL, caps: "flat", name: "longBarrel", group: "firearm" },
  );

  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.065, 10), BRASS, {
    at: [0, 1.12, 0.82],
    dir: [0, 0, 1],
    name: "barrelCollar",
    group: "firearm",
  });

  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 10), DARK_STEEL, {
    at: [0, 1.12, 1.055],
    dir: [0, 0, 1],
    name: "muzzle",
    group: "firearm",
  });

  const chamber = b.part(new THREE.SphereGeometry(0.115, 10, 8), GLOW, {
    at: [0, 1.13, 0.05],
    name: "arcaneChamber",
    group: "energy",
  });
  glow(chamber, 2.4);

  b.part(new THREE.SphereGeometry(0.072, 8, 6), GLOW_WHITE, {
    at: [0, 1.13, 0.115],
    name: "chamberCore",
    group: "energy",
  });

  b.rod(
    [-0.125, 1.13, 0.04],
    [-0.125, 1.13, 0.57],
    0.012,
    { color: COPPER, name: "leftPowerRail", group: "energy" },
  );
  b.rod(
    [0.125, 1.13, 0.04],
    [0.125, 1.13, 0.57],
    0.012,
    { color: COPPER, name: "rightPowerRail", group: "energy" },
  );

  for (const x of [-0.125, 0.125]) {
    for (let i = 0; i < 4; i++) {
      const bolt = b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, {
        at: [x, 1.03 + i * 0.065, 0.112],
        name: `receiverBolt${x}${i}`,
        group: "firearm",
      });
      if (i === 1 || i === 3) glow(bolt, 0.7);
    }
  }

  const gripTop = [0, 1.02, -0.015] as const;
  const gripBottom = [0, 0.24, -0.16] as const;

  b.sweep([gripTop, [0, 0.77, -0.06], [0, 0.46, -0.12], gripBottom], [0.105, 0.072], {
    color: LEATHER,
    section: { ngon: 6 },
    caps: "round",
    name: "grip",
    group: "handle",
  });

  b.rod([0, 0.98, -0.035], [0, 0.27, -0.165], 0.012, {
    color: BRASS,
    name: "gripTang",
    group: "handle",
  });

  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = 0;
    const y = 0.39 + t * 0.5;
    const z = -0.13 - t * 0.03;
    b.rod([x - 0.092, y + 0.025, z], [x + 0.092, y - 0.025, z], 0.014, {
      color: LEATHER_HI,
      name: `gripWrap${i}`,
      group: "handle",
    });
  }

  b.part(new THREE.SphereGeometry(0.11, 10, 7), BRASS, {
    at: [0, 0.18, -0.17],
    name: "pommel",
    group: "handle",
  });

  const pommelGlow = b.part(new THREE.SphereGeometry(0.052, 8, 6), GLOW, {
    at: [0, 0.18, -0.255],
    name: "pommelCrystal",
    group: "energy",
  });
  glow(pommelGlow, 2.0);

  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.038, 10), DARK_STEEL, {
    at: [0, 0.065, -0.17],
    name: "pommelFoot",
    group: "handle",
  });

  const triggerGuard = new THREE.TorusGeometry(0.105, 0.014, 6, 14, Math.PI * 1.35);
  b.part(triggerGuard, BRASS, {
    at: [0, 0.93, 0.21],
    rotation: [90, 0, 0],
    name: "triggerGuard",
    group: "firearm",
  });

  b.rod(
    [-0.075, 0.98, 0.17],
    [0.075, 0.98, 0.17],
    0.018,
    { color: BRASS, name: "triggerBar", group: "firearm" },
  );

  b.part(new THREE.ConeGeometry(0.027, 0.13, 7), CRIMSON, {
    at: [0, 0.925, 0.215],
    dir: [0, -1, 0],
    name: "trigger",
    group: "firearm",
  });

  const gear = b.part(
    gearGeometry({ teeth: 16, module: 0.008, thickness: 0.018, spokes: 5, bore: 0.012 }),
    BRASS,
    {
      at: [0.155, 1.12, 0.25],
      dir: [1, 0, 0],
      name: "sideGear",
      group: "mechanism",
    },
  );

  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.035, 8), GOLD, {
    at: [0.175, 1.12, 0.25],
    dir: [1, 0, 0],
    name: "gearAxle",
    group: "mechanism",
  });

  b.part(new THREE.PlaneGeometry(0.17, 0.17), GLOW_WHITE, {
    at: [0.16, 1.12, 0.25],
    dir: [1, 0, 0],
    axis: "z",
    texture: crestTexture,
    name: "sideEmblem",
    group: "mechanism",
  });

  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.33, 0.08), BRASS, {
      at: [s * 0.17, 1.45, 0.03],
      rotation: [0, 0, s * -18],
      name: `bladeShoulder${s}`,
      group: "blade",
    });

    b.part(new THREE.SphereGeometry(0.033, 7, 5), GOLD, {
      at: [s * 0.18, 1.6, 0.055],
      name: `bladeStud${s}`,
      group: "blade",
    });
  }

  b.part(new THREE.BoxGeometry(0.08, 0.48, 0.045), INK, {
    at: [0.16, 1.63, 0.06],
    rotation: [0, 0, -12],
    name: "bladeDarkPanel",
    group: "blade",
  });

  b.part(new THREE.BoxGeometry(0.08, 0.48, 0.045), INK, {
    at: [-0.16, 1.63, 0.06],
    rotation: [0, 0, 12],
    name: "bladeDarkPanelMirror",
    group: "blade",
  });

  return b.root;
}
