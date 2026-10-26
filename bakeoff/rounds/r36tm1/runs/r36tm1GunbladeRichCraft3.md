```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { gearTrain, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: an oversized faceted sword fused with a revolver mechanism, glowing runes, brass guard, cylinder, trigger and ornate grip.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const root = b.joint("weaponRoot", {
    at: [0, 0, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "weapon",
  });

  const STEEL = metal("steel", {
    polish: 0.65,
    tarnish: 0.18,
    size: 0.09,
    seed: 11,
  });
  const DARK_STEEL = metal("iron", {
    polish: 0.25,
    tarnish: 0.4,
    size: 0.06,
    seed: 17,
  });
  const BRASS = metal("brass", {
    polish: 0.72,
    tarnish: 0.12,
    verdigris: 0.05,
    size: 0.07,
    seed: 21,
  });
  const COPPER = metal("copper", {
    polish: 0.55,
    tarnish: 0.16,
    size: 0.055,
    seed: 25,
  });
  const BLUE_STEEL = metal("blued", {
    polish: 0.72,
    tarnish: 0.12,
    size: 0.07,
    seed: 31,
  });
  const BLADE = cel("#dceafa", "#667b9f", {
    threshold: 0.04,
    light: [0.35, 0.8, 0.5],
  });
  const BLADE_EDGE = cel("#f5fbff", "#9aabc3", {
    threshold: 0.02,
  });
  const DARK = "#171927";
  const LEATHER = "#321d28";
  const LEATHER_HI = "#6c3540";
  const RUBY = "#d52d4d";
  const GLOW_BLUE = "#4fe7ff";
  const GLOW_WHITE = "#dffbff";

  const runeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#dfffff"/>
          <stop offset=".45" stop-color="#46eaff"/>
          <stop offset="1" stop-color="#2172ff"/>
        </linearGradient>
      </defs>
      <path d="M32 4 L45 35 L36 35 L50 75 L35 68 L39 117 L25 98 L18 139 L10 112 L17 72 L28 77 L20 42 L29 45Z"
        fill="none" stroke="#07192f" stroke-width="8" stroke-linejoin="round"/>
      <path d="M32 4 L45 35 L36 35 L50 75 L35 68 L39 117 L25 98 L18 139 L10 112 L17 72 L28 77 L20 42 L29 45Z"
        fill="none" stroke="url(#g)" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="32" cy="179" r="17" fill="none" stroke="#07192f" stroke-width="7"/>
      <circle cx="32" cy="179" r="12" fill="none" stroke="#66efff" stroke-width="3"/>
      <path d="M32 160 L32 198 M13 179 L51 179" stroke="#dfffff" stroke-width="2"/>
      <path d="M23 218 L32 244 L41 218" fill="none" stroke="#07192f" stroke-width="7"/>
      <path d="M23 218 L32 244 L41 218" fill="none" stroke="#48eaff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const crestTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path d="M64 6 L77 42 L112 49 L83 71 L90 111 L64 89 L38 111 L45 71 L16 49 L51 42Z"
        fill="#f3c65d" stroke="#241526" stroke-width="7" stroke-linejoin="round"/>
      <path d="M64 24 L70 47 L93 51 L75 64 L79 89 L64 75 L49 89 L53 64 L35 51 L58 47Z"
        fill="#c43a53" stroke="#fff1a1" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const screw = (at: [number, number, number], r = 0.018, color = BRASS) =>
    b.part(new THREE.SphereGeometry(r, 8, 5), color, {
      bone: root,
      at,
      flat: true,
      group: "rivets",
    });

  const rivetRow = (
    y: number,
    x0: number,
    x1: number,
    z: number,
    count: number,
    color = BRASS,
  ) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      screw([x0 + (x1 - x0) * t, y, z], 0.014, color);
    }
  };

  // Main blade: a broad, angular Final Fantasy silhouette.
  const bladeOutline: [number, number, "sharp"?][] = [
    [-0.135, 0],
    [0.135, 0],
    [0.205, 0.19],
    [0.205, 1.23],
    [0.145, 1.63],
    [0.065, 1.94],
    [0, 2.22, "sharp"],
    [-0.065, 1.94],
    [-0.145, 1.63],
    [-0.205, 1.23],
    [-0.205, 0.19],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 0.62, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.105, 0.055],
    bevel: 0.012,
    smoothing: 0,
    color: BLADE,
    bone: root,
    group: "blade",
    name: "heroBlade",
  });

  // Bright inset face gives the blade a layered, manufactured look.
  b.extrude(
    [
      [-0.095, 0.06],
      [0.095, 0.06],
      [0.13, 0.22],
      [0.13, 1.18],
      [0.085, 1.53],
      [0.035, 1.82],
      [0, 2.04, "sharp"],
      [-0.035, 1.82],
      [-0.085, 1.53],
      [-0.13, 1.18],
      [-0.13, 0.22],
    ],
    {
      at: [0, 0.62, 0.059],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: BLADE_EDGE,
      bone: root,
      group: "blade",
      name: "bladeInset",
    },
  );

  // Dark fuller and luminous rune strip on the front face.
  b.extrude(
    [
      [-0.026, 0.18],
      [0.026, 0.18],
      [0.038, 1.47],
      [0, 1.72, "sharp"],
      [-0.038, 1.47],
    ],
    {
      at: [0, 0.62, 0.067],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: BLUE_STEEL,
      bone: root,
      group: "blade",
      name: "fuller",
    },
  );

  const rune = b.part(new THREE.PlaneGeometry(0.095, 0.38), GLOW_WHITE, {
    bone: root,
    at: [0, 1.35, 0.075],
    dir: [0, 0, 1],
    axis: "z",
    texture: runeTexture,
    group: "magic",
    name: "bladeRune",
  });
  glow(rune, 2.2);

  // Blade shoulder plates and decorative side teeth.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.11, 0],
        [0.17, 0.07],
        [0.10, 0.18],
        [0.025, 0.14],
      ],
      {
        at: [s * 0.19, 0.69, 0.078],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        color: BRASS,
        bone: root,
        group: "bladeTrim",
        name: `shoulderPlate${s > 0 ? "L" : "R"}`,
      },
    );

    for (let i = 0; i < 5; i++) {
      const y = 0.91 + i * 0.125;
      b.spike(
        [s * 0.19, y, 0.025],
        [s * 0.245, y + 0.022, 0.025],
        null,
        0.026,
        {
          color: DARK_STEEL,
          bone: root,
          caps: { start: "flat", end: "point" },
          group: "bladeTeeth",
          name: `bladeTooth${s > 0 ? "L" : "R"}_${i}`,
        },
      );
    }
  }

  // Crossguard: chunky steel body with a gold center and red jewel.
  b.part(new THREE.BoxGeometry(0.72, 0.085, 0.13), DARK_STEEL, {
    bone: root,
    at: [0, 0.59, 0],
    flat: true,
    group: "guard",
    name: "crossguardCore",
  });
  b.part(new THREE.BoxGeometry(0.58, 0.045, 0.145), BRASS, {
    bone: root,
    at: [0, 0.607, 0.006],
    flat: true,
    group: "guard",
    name: "crossguardInlay",
  });

  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.24, 0.62, 0],
      [s * 0.38, 0.72, 0.015],
      0.045,
      {
        color: DARK_STEEL,
        bone: root,
        section: { ngon: 6 },
        caps: "round",
        group: "guard",
        name: `guardWing${s > 0 ? "L" : "R"}`,
      },
    );
    b.part(new THREE.SphereGeometry(0.055, 8, 5), BRASS, {
      bone: root,
      at: [s * 0.39, 0.725, 0.018],
      flat: true,
      group: "guard",
      name: `guardKnuckle${s > 0 ? "L" : "R"}`,
    });
  }

  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.11, 10), BRASS, {
    bone: root,
    at: [0, 0.615, 0],
    dir: [0, 1, 0],
    flat: true,
    group: "guard",
    name: "guardCollar",
  });
  b.part(new THREE.SphereGeometry(0.047, 10, 6), RUBY, {
    bone: root,
    at: [0, 0.625, 0.083],
    flat: true,
    group: "ornament",
    name: "guardRuby",
  });

  // Leather-wrapped grip.
  b.part(new THREE.CylinderGeometry(0.075, 0.088, 0.36, 8), LEATHER, {
    bone: root,
    at: [0, 0.34, 0],
    dir: [0, 1, 0],
    flat: true,
    group: "grip",
    name: "gripCore",
  });

  for (let i = 0; i < 7; i++) {
    const y = 0.185 + i * 0.05;
    b.part(new THREE.TorusGeometry(0.081, 0.009, 5, 10), LEATHER_HI, {
      bone: root,
      at: [0, y, 0],
      dir: [0, 1, 0],
      flat: true,
      group: "grip",
      name: `gripWrap${i}`,
    });
  }

  // Pommel, bottom contact is just above the floor.
  b.part(new THREE.CylinderGeometry(0.085, 0.105, 0.09, 8), BRASS, {
    bone: root,
    at: [0, 0.105, 0],
    dir: [0, 1, 0],
    flat: true,
    group: "pommel",
    name: "pommelCollar",
  });
  b.part(new THREE.SphereGeometry(0.09, 8, 5), DARK_STEEL, {
    bone: root,
    at: [0, 0.045, 0],
    scale: [1, 0.78, 1],
    flat: true,
    group: "pommel",
    name: "pommel",
  });
  b.part(new THREE.SphereGeometry(0.036, 8, 5), RUBY, {
    bone: root,
    at: [0, 0.045, 0.082],
    flat: true,
    group: "ornament",
    name: "pommelGem",
  });

  // Revolver receiver mounted on the left side of the blade.
  b.part(new THREE.BoxGeometry(0.29, 0.22, 0.19), DARK_STEEL, {
    bone: root,
    at: [0.205, 0.73, 0.015],
    flat: true,
    group: "gun",
    name: "gunReceiver",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.12, 0.21), BLUE_STEEL, {
    bone: root,
    at: [0.205, 0.775, 0.034],
    flat: true,
    group: "gun",
    name: "receiverPlate",
  });

  // Cylinder axle and barrel.
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.13, 12), COPPER, {
    bone: root,
    at: [0.31, 0.72, 0.035],
    dir: [1, 0, 0],
    flat: true,
    group: "gun",
    name: "revolverCylinder",
  });
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.025, 10), BRASS, {
    bone: root,
    at: [0.385, 0.72, 0.035],
    dir: [1, 0, 0],
    flat: true,
    group: "gun",
    name: "cylinderCap",
  });

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    screw(
      [0.404, 0.72 + Math.cos(a) * 0.078, 0.035 + Math.sin(a) * 0.078],
      0.012,
      BRASS,
    );
  }

  b.rod(
    [0.205, 0.735, 0.12],
    [0.205, 0.735, 0.47],
    0.035,
    {
      color: STEEL,
      bone: root,
      section: { ngon: 8 },
      caps: "round",
      group: "gun",
      name: "gunBarrel",
    },
  );
  b.part(new THREE.TorusGeometry(0.05, 0.014, 5, 10), BRASS, {
    bone: root,
    at: [0.205, 0.735, 0.47],
    dir: [0, 0, 1],
    flat: true,
    group: "gun",
    name: "muzzleRing",
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 8), DARK_STEEL, {
    bone: root,
    at: [0.205, 0.735, 0.5],
    dir: [0, 0, 1],
    flat: true,
    group: "gun",
    name: "muzzle",
  });

  // Trigger and trigger guard.
  b.rod(
    [0.205, 0.635, 0.02],
    [0.205, 0.56, 0.04],
    0.016,
    {
      color: BRASS,
      bone: root,
      caps: "round",
      group: "trigger",
      name: "trigger",
    },
  );
  b.rod(
    [0.205, 0.63, 0.04],
    [0.205, 0.54, 0.04],
    0.018,
    {
      color: DARK_STEEL,
      bone: root,
      caps: "round",
      group: "trigger",
      name: "triggerGuardA",
    },
  );
  b.rod(
    [0.205, 0.54, 0.04],
    [0.205, 0.51, 0.02],
    0.018,
    {
      color: DARK_STEEL,
      bone: root,
      caps: "round",
      group: "trigger",
      name: "triggerGuardB",
    },
  );

  // Tiny brass fasteners across the machinery.
  rivetRow(0.84, 0.095, 0.305, 0.112, 4, BRASS);
  rivetRow(0.66, 0.095, 0.305, 0.112, 4, COPPER);
  rivetRow(0.50, -0.052, 0.052, 0.09, 3, BRASS);

  // A small crown-shaped side emblem on the receiver.
  const crest = b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    bone: root,
    at: [0.365, 0.84, 0.04],
    dir: [1, 0, 0],
    axis: "z",
    texture: crestTexture,
    group: "ornament",
    name: "receiverCrest",
  });
  glow(crest, 0.7);

  // Hero gear train: visible nested brass and copper gears around the cylinder.
  const gears = gearTrain(b, {
    at: [0.395, 0.72, 0.035],
    axis: [1, 0, 0],
    up: [0, 1, 0],
    module: 0.008,
    spin: "mechanism",
    bone: root,
    group: "mechanism",
    style: "solid",
    arbor: false,
    gears: [
      { teeth: 18, spokes: 5, bore: 0.025, color: BRASS },
      { teeth: 10, angle: 105, holes: 5, bore: 0.018, color: COPPER },
      { teeth: 14, on: 0, shift: 0.035, spokes: 4, bore: 0.02, color: BLUE_STEEL },
    ],
  });
  gears.spin(12);

  // Four glowing inspection studs make the weapon read as magical technology.
  for (const p of [
    [0.365, 0.93, 0.075] as [number, number, number],
    [0.365, 0.53, 0.075] as [number, number, number],
    [0.365, 0.72, -0.07] as [number, number, number],
    [0.365, 0.72, 0.14] as [number, number, number],
  ]) {
    const stud = b.part(new THREE.SphereGeometry(0.018, 7, 5), GLOW_BLUE, {
      bone: root,
      at: p,
      flat: true,
      group: "magic",
      name: "energyStud",
    });
    glow(stud, 2.5);
  }

  return b.root;
}
```