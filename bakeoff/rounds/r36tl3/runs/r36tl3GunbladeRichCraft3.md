```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: a broad rune-etched greatsword fused to a compact revolver mechanism, with a brass guard, glowing blue core, trigger, cylinder and heavy grip.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const INK = "#171522";
  const STEEL = "#3c4657";
  const DARK_STEEL = "#202634";
  const EDGE = "#9caabd";
  const BRASS = "#b77932";
  const GOLD = "#e5b85b";
  const LEATHER = "#3b2020";
  const LEATHER_HI = "#713c31";
  const BLUE = "#36b9ff";
  const BLUE_DARK = "#164c80";
  const RED = "#b62d35";

  const bladeRune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
      <defs>
        <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#baf3ff"/>
          <stop offset=".45" stop-color="#42caff"/>
          <stop offset="1" stop-color="#176bb0"/>
        </linearGradient>
        <filter id="g"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <path d="M64 12 L78 104 L66 168 L92 220 L66 274 L80 350 L64 500 L48 350 L62 274 L36 220 L62 168 L50 104Z"
        fill="none" stroke="#63d9ff" stroke-width="13" opacity=".38" filter="url(#g)"/>
      <path d="M64 12 L78 104 L66 168 L92 220 L66 274 L80 350 L64 500 L48 350 L62 274 L36 220 L62 168 L50 104Z"
        fill="none" stroke="url(#r)" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 75 L64 438 M42 220 L86 220 M52 300 L76 300"
        stroke="#d4f8ff" stroke-width="3" opacity=".9"/>
      <circle cx="64" cy="220" r="11" fill="#e9ffff" stroke="#36b9ff" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const emblem = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="57" fill="#121827" stroke="#e5b85b" stroke-width="6"/>
      <path d="M64 16 L75 52 L111 64 L75 76 L64 112 L53 76 L17 64 L53 52Z"
        fill="none" stroke="#46d2ff" stroke-width="5"/>
      <circle cx="64" cy="64" r="13" fill="#46d2ff" stroke="#d8fbff" stroke-width="4"/>
      <path d="M64 29v18M64 81v18M29 64h18M81 64h18" stroke="#f0ce78" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  // The blade is a thick, aggressive Final Fantasy greatsword silhouette.
  const blade = b.extrude(
    [
      [-0.105, 0.00],
      [0.105, 0.00],
      [0.145, 0.16],
      [0.135, 0.50],
      [0.205, 0.73],
      [0.175, 1.02],
      [0.115, 1.30],
      [0.17, 1.53],
      [0.10, 1.72],
      [0.00, 1.93],
      [-0.10, 1.72],
      [-0.17, 1.53],
      [-0.115, 1.30],
      [-0.175, 1.02],
      [-0.205, 0.73],
      [-0.135, 0.50],
      [-0.145, 0.16],
    ],
    {
      at: [0, 0.58, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.085, 0.045],
      bevel: 0.018,
      smoothing: 1,
      color: STEEL,
      name: "heroBlade",
      group: "blade",
    },
  );

  // Dark fuller inset, slightly in front of the blade.
  b.extrude(
    [
      [-0.045, 0.08],
      [0.045, 0.08],
      [0.07, 0.43],
      [0.105, 0.72],
      [0.072, 1.02],
      [0.04, 1.28],
      [0.0, 1.56],
      [-0.04, 1.28],
      [-0.072, 1.02],
      [-0.105, 0.72],
      [-0.07, 0.43],
    ],
    {
      at: [0, 0.60, 0.047],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.006,
      color: DARK_STEEL,
      name: "bladeFuller",
      group: "blade",
    },
  );

  // Polished angular edge rails.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.018, 1.48, 0.018),
      EDGE,
      {
        at: [s * 0.145, 1.30, 0.055],
        rotation: [0, 0, s * -7],
        name: `bladeEdge${s}`,
        group: "blade",
      },
    );
  }

  // Rune strip on the visible front face.
  b.part(new THREE.PlaneGeometry(0.105, 0.82), "#ffffff", {
    at: [0, 1.36, 0.074],
    dir: [0, 0, 1],
    axis: "z",
    texture: bladeRune,
    name: "bladeRunes",
    group: "decoration",
  });

  // Crossguard: central block plus swept gold wings.
  b.part(new THREE.BoxGeometry(0.34, 0.105, 0.16), DARK_STEEL, {
    at: [0, 0.57, 0],
    name: "guardCore",
    group: "guard",
  });

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.16, 0.02],
        [0.29, 0.12],
        [0.34, 0.22],
        [0.26, 0.20],
        [0.13, 0.10],
        [0, 0.07],
      ],
      {
        at: [s * 0.10, 0.52, 0],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.13,
        bevel: 0.018,
        color: BRASS,
        name: `guardWing${s}`,
        group: "guard",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.052, 8, 6),
      GOLD,
      { at: [s * 0.37, 0.75, 0], name: `guardJewel${s}`, group: "guard" },
    );
  }

  // Gun receiver fused behind the blade at the ricasso.
  b.part(
    new THREE.BoxGeometry(0.27, 0.31, 0.23),
    DARK_STEEL,
    {
      at: [0, 0.77, -0.025],
      rotation: [0, 0, 0],
      name: "gunReceiver",
      group: "gun",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.19, 0.21, 0.25),
    STEEL,
    {
      at: [0, 0.82, 0.105],
      name: "receiverFace",
      group: "gun",
    },
  );

  // Revolver cylinder visible on the left side (+X).
  b.part(
    new THREE.CylinderGeometry(0.105, 0.105, 0.105, 10),
    BRASS,
    {
      at: [0.16, 0.79, -0.01],
      dir: [1, 0, 0],
      name: "cylinder",
      group: "gun",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.068, 0.068, 0.112, 10),
    DARK_STEEL,
    {
      at: [0.218, 0.79, -0.01],
      dir: [1, 0, 0],
      name: "cylinderHub",
      group: "gun",
    },
  );

  // Six cylinder chambers as dark brass-rimmed studs.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(
      new THREE.CylinderGeometry(0.018, 0.018, 0.012, 6),
      INK,
      {
        at: [0.282, 0.79 + Math.cos(a) * 0.067, -0.01 + Math.sin(a) * 0.067],
        dir: [1, 0, 0],
        name: `chamber${i}`,
        group: "gun",
      },
    );
  }

  // Short barrel projects toward the front (+Z), aligned with the blade.
  b.part(
    new THREE.CylinderGeometry(0.052, 0.065, 0.31, 8),
    STEEL,
    {
      at: [0, 0.93, 0.22],
      dir: [0, 0, 1],
      name: "barrel",
      group: "gun",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.073, 0.073, 0.065, 8),
    BRASS,
    {
      at: [0, 0.93, 0.385],
      dir: [0, 0, 1],
      name: "muzzleCollar",
      group: "gun",
    },
  );
  const muzzle = b.part(
    new THREE.CylinderGeometry(0.044, 0.052, 0.022, 8),
    INK,
    {
      at: [0, 0.93, 0.43],
      dir: [0, 0, 1],
      name: "muzzle",
      group: "gun",
    },
  );
  glow(muzzle, 0.35);

  // Grip, pommel, and leather wrapping.
  b.part(
    new THREE.BoxGeometry(0.17, 0.34, 0.18),
    LEATHER,
    {
      at: [0, 0.28, -0.015],
      rotation: [0, 0, -4],
      name: "grip",
      group: "handle",
    },
  );

  for (let i = 0; i < 5; i++) {
    const y = 0.145 + i * 0.068;
    b.part(
      new THREE.BoxGeometry(0.19, 0.019, 0.195),
      LEATHER_HI,
      {
        at: [0, y, -0.02],
        rotation: [0, 0, -4],
        name: `gripWrap${i}`,
        group: "handle",
      },
    );
  }

  b.part(
    new THREE.CylinderGeometry(0.12, 0.105, 0.13, 8),
    BRASS,
    {
      at: [0, 0.045, -0.02],
      name: "pommel",
      group: "handle",
    },
  );
  b.part(
    new THREE.SphereGeometry(0.052, 8, 6),
    BLUE,
    {
      at: [0, -0.028, -0.02],
      name: "pommelCrystal",
      group: "decoration",
    },
  );

  // Trigger and trigger guard.
  b.part(
    new THREE.TorusGeometry(0.075, 0.014, 6, 12, Math.PI),
    BRASS,
    {
      at: [0, 0.625, 0.12],
      rotation: [Math.PI / 2, 0, 0],
      name: "triggerGuard",
      group: "gun",
    },
  );
  b.part(
    new THREE.CapsuleGeometry(0.018, 0.075, 5, 8),
    GOLD,
    {
      at: [0, 0.65, 0.145],
      rotation: [0.22, 0, 0],
      name: "trigger",
      group: "gun",
    },
  );

  // Glowing magical core and emblem make the silhouette read immediately.
  const core = b.part(
    new THREE.BoxGeometry(0.028, 1.42, 0.018),
    BLUE,
    {
      at: [0, 1.31, 0.068],
      name: "energyCore",
      group: "magic",
    },
  );
  glow(core, 1.8);

  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    at: [0, 0.82, 0.235],
    dir: [0, 0, 1],
    axis: "z",
    texture: emblem,
    name: "receiverEmblem",
    group: "decoration",
  });

  // Tiny brass fasteners along the receiver and guard.
  for (const x of [-0.105, 0.105]) {
    b.part(
      new THREE.SphereGeometry(0.018, 6, 4),
      GOLD,
      { at: [x, 0.69, 0.125], name: "receiverRivet", group: "decoration" },
    );
    b.part(
      new THREE.SphereGeometry(0.016, 6, 4),
      GOLD,
      { at: [x, 0.89, 0.125], name: "receiverRivet", group: "decoration" },
    );
  }

  return b.root;
}
```