import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  polyline,
  svg,
} from "../../../../src/index";
import {
  gearGeometry,
  gearTexture,
  metal,
  TINT,
} from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade with a broad rune-etched sword, revolver mechanism, glowing materia, ornate guard, wrapped grip, gears, and a jeweled pommel.",
};

const STEEL = metal("steel", {
  polish: 0.72,
  tarnish: 0.12,
  size: 0.18,
  seed: 11,
});
const DARK_STEEL = metal("iron", {
  polish: 0.35,
  tarnish: 0.2,
  size: 0.13,
  seed: 19,
});
const BLUE_STEEL = metal("blued", {
  polish: 0.58,
  tarnish: 0.08,
  size: 0.12,
  seed: 23,
});
const BRASS = metal("brass", {
  polish: 0.7,
  tarnish: 0.16,
  size: 0.1,
  seed: 7,
});
const OLD_BRASS = metal("bronze", {
  polish: 0.32,
  tarnish: 0.46,
  verdigris: 0.12,
  size: 0.11,
  seed: 29,
});

const INK = "#171326";
const EDGE = "#d8efff";
const CYAN = "#42eaff";
const CYAN_DARK = "#126d99";
const VIOLET = "#8c5fff";
const GRIP = "#292039";
const GRIP_LIGHT = "#584274";
const RUBY = "#ff3c66";
const CREAM = "#ffe7ad";

const RUNE_TEXTURE = svg(
  `<svg viewBox="0 0 160 420" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#aaffff"/>
        <stop offset="0.48" stop-color="#42eaff"/>
        <stop offset="1" stop-color="#5d70ff"/>
      </linearGradient>
      <filter id="g"><feGaussianBlur stdDeviation="2.2"/></filter>
    </defs>
    <g opacity=".42" filter="url(#g)" fill="none" stroke="#42eaff" stroke-width="13">
      <path d="M80 12 L80 405"/>
      <path d="M29 111 L80 160 L131 111"/>
      <path d="M30 287 L80 239 L130 287"/>
    </g>
    <g fill="none" stroke="url(#r)" stroke-width="5" stroke-linejoin="round">
      <path d="M80 12 L80 405"/>
      <path d="M80 74 L47 110 L80 141 L113 110 Z"/>
      <path d="M48 184 L80 216 L112 184"/>
      <path d="M80 239 L42 278 L80 315 L118 278 Z"/>
      <path d="M80 340 L60 363 L80 405 L100 363 Z"/>
    </g>
    <g fill="#ffffff">
      <circle cx="80" cy="110" r="6"/>
      <circle cx="80" cy="278" r="6"/>
      <circle cx="80" cy="363" r="4"/>
    </g>
  </svg>`,
  { size: 384 },
);

const SIGIL_TEXTURE = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="s">
        <stop offset="0" stop-color="#fff4b2"/>
        <stop offset=".5" stop-color="#f5ad38"/>
        <stop offset="1" stop-color="#9b4b20"/>
      </radialGradient>
    </defs>
    <circle cx="128" cy="128" r="115" fill="#24152e" stroke="#ffd56b" stroke-width="8"/>
    <circle cx="128" cy="128" r="94" fill="none" stroke="#7deaff" stroke-width="5" stroke-dasharray="12 10"/>
    <path d="M128 28 L146 105 L220 128 L146 151 L128 228 L110 151 L36 128 L110 105 Z"
      fill="url(#s)" stroke="#fff1b1" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="128" cy="128" r="20" fill="#53eaff" stroke="#fff8d0" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const GRIP_TEXTURE = svg(
  `<svg viewBox="0 0 96 320" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="320" fill="#1b1325"/>
    <g fill="none" stroke="#9f77d4" stroke-width="7">
      <path d="M-12 12 L108 58"/>
      <path d="M-12 67 L108 113"/>
      <path d="M-12 122 L108 168"/>
      <path d="M-12 177 L108 223"/>
      <path d="M-12 232 L108 278"/>
      <path d="M-12 287 L108 333"/>
    </g>
    <g fill="none" stroke="#e8c7ff" stroke-width="2" opacity=".8">
      <path d="M-12 23 L108 69"/>
      <path d="M-12 78 L108 124"/>
      <path d="M-12 133 L108 179"/>
      <path d="M-12 188 L108 234"/>
      <path d="M-12 243 L108 289"/>
      <path d="M-12 298 L108 344"/>
    </g>
  </svg>`,
  { size: 192 },
);

const GEAR_TEXTURE = gearTexture(
  { teeth: 12, module: 0.012, thickness: 0.035, spokes: 4, bore: 0.018 },
  { size: 192 },
);

const CHAMBER_TEXTURE = svg(
  `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="128" fill="#161521"/>
    <path d="M0 16 H256 M0 112 H256" stroke="#8e63b7" stroke-width="5"/>
    <path d="M18 64 H238" stroke="#3de8ff" stroke-width="4" stroke-dasharray="13 12"/>
    <circle cx="45" cy="64" r="18" fill="none" stroke="#ffcf62" stroke-width="5"/>
    <circle cx="128" cy="64" r="18" fill="none" stroke="#ffcf62" stroke-width="5"/>
    <circle cx="211" cy="64" r="18" fill="none" stroke="#ffcf62" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const POMMEL_TEXTURE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="57" fill="#281735" stroke="#ffdb76" stroke-width="7"/>
    <path d="M64 17 L75 52 L111 64 L75 76 L64 111 L53 76 L17 64 L53 52 Z"
      fill="#ff4c78" stroke="#ffe2a2" stroke-width="4"/>
    <circle cx="64" cy="64" r="13" fill="#59edff" stroke="#fff4c3" stroke-width="4"/>
  </svg>`,
  { size: 160 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  options: Record<string, any> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    ...options,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  depth: number,
  at: [number, number, number],
  color: any,
  options: Record<string, any> = {},
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, depth, 10), color, {
    at,
    ...options,
  });
}

function rivet(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  radius = 0.025,
  color: any = BRASS,
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 6), color, { at });
}

function frontPanel(
  b: ReturnType<typeof createBuilder>,
  width: number,
  height: number,
  at: [number, number, number],
  texture: THREE.Texture,
  color = "#ffffff",
) {
  return b.part(new THREE.PlaneGeometry(width, height), color, {
    at,
    dir: [0, 0, 1],
    axis: "z",
    texture,
  });
}

export default function build() {
  const b = createBuilder({
    name: "gunblade",
    detail: 1,
    paintSize: 1024,
  });

  /*
   * Main blade.
   * The silhouette is intentionally over-scaled and slightly asymmetrical:
   * a long fantasy greatsword with a ceremonial, almost wing-like point.
   */
  const bladeOutline: [number, number, "sharp"][] = [
    [-0.16, 0.0, "sharp"],
    [-0.27, 0.22, "sharp"],
    [-0.29, 0.82, "sharp"],
    [-0.24, 1.23, "sharp"],
    [-0.16, 1.54, "sharp"],
    [-0.055, 1.82, "sharp"],
    [0.0, 1.98, "sharp"],
    [0.105, 1.82, "sharp"],
    [0.22, 1.5, "sharp"],
    [0.29, 1.15, "sharp"],
    [0.31, 0.54, "sharp"],
    [0.22, 0.18, "sharp"],
    [0.15, 0.0, "sharp"],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 0.88, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.12,
    bevel: 0.012,
    color: STEEL,
    name: "bladeCore",
    group: "blade",
  });

  const bladeShadow = b.extrude(
    [
      [-0.12, 0.12],
      [-0.2, 0.3],
      [-0.225, 0.91],
      [-0.18, 1.22],
      [-0.11, 1.47],
      [-0.025, 1.72],
      [0.005, 1.84],
      [0.025, 1.68],
      [0.09, 1.42],
      [0.15, 1.12],
      [0.17, 0.42],
      [0.1, 0.15],
    ],
    {
      at: [0, 0.88, 0.064],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: BLUE_STEEL,
      name: "bladeFrontFacet",
      group: "blade",
    },
  );

  const fuller = b.extrude(
    [
      [-0.025, 0.13],
      [0.028, 0.13],
      [0.052, 0.54],
      [0.045, 1.16],
      [0.018, 1.58],
      [0.0, 1.78],
      [-0.018, 1.58],
      [-0.046, 1.16],
      [-0.052, 0.54],
    ],
    {
      at: [0, 0.88, 0.078],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: INK,
      name: "bladeFuller",
      group: "blade",
    },
  );

  const leftEdge = b.sweep(
    polyline([
      [-0.16, 0.94, 0.084],
      [-0.27, 1.1, 0.084],
      [-0.29, 1.7, 0.084],
      [-0.16, 2.11, 0.084],
      [-0.055, 2.42, 0.084],
      [0, 2.68, 0.084],
    ]),
    0.014,
    {
      color: EDGE,
      caps: "flat",
      sides: 6,
      name: "leftCuttingEdge",
      group: "blade",
    },
  );

  const rightEdge = b.sweep(
    polyline([
      [0.15, 0.94, 0.084],
      [0.22, 1.06, 0.084],
      [0.29, 1.42, 0.084],
      [0.22, 1.66, 0.084],
      [0.105, 2.11, 0.084],
      [0, 2.68, 0.084],
    ]),
    0.014,
    {
      color: EDGE,
      caps: "flat",
      sides: 6,
      name: "rightCuttingEdge",
      group: "blade",
    },
  );

  const energyLine = b.sweep(
    catmull([
      [0, 1.03, 0.092],
      [0.01, 1.32, 0.092],
      [-0.012, 1.69, 0.092],
      [0.01, 2.12, 0.092],
      [0, 2.51, 0.092],
    ]),
    0.011,
    {
      color: CYAN,
      caps: "point",
      sides: 8,
      name: "bladeEnergyChannel",
      group: "blade",
    },
  );
  glow(energyLine, 1.7);

  /*
   * Blade shoulders and side fins, giving the weapon a winged Final Fantasy
   * silhouette when seen from three-quarter view.
   */
  const shoulderOutline: [number, number, "sharp"][] = [
    [-0.04, -0.13, "sharp"],
    [-0.48, -0.06, "sharp"],
    [-0.59, 0.025, "sharp"],
    [-0.5, 0.105, "sharp"],
    [-0.16, 0.13, "sharp"],
    [0, 0.19, "sharp"],
    [0.16, 0.13, "sharp"],
    [0.5, 0.105, "sharp"],
    [0.59, 0.025, "sharp"],
    [0.48, -0.06, "sharp"],
    [0.04, -0.13, "sharp"],
  ];

  const shoulderDark = b.extrude(shoulderOutline, {
    at: [0, 0.86, -0.025],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.15,
    bevel: 0.015,
    color: DARK_STEEL,
    name: "guardUnderplate",
    group: "guard",
  });

  const shoulder = b.extrude(shoulderOutline, {
    at: [0, 0.86, 0.078],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.028,
    bevel: 0.008,
    color: BRASS,
    name: "ornateCrossguard",
    group: "guard",
  });

  const guardInset = b.extrude(
    [
      [-0.08, -0.065],
      [-0.39, -0.02],
      [-0.47, 0.03],
      [-0.39, 0.07],
      [-0.12, 0.08],
      [0, 0.125],
      [0.12, 0.08],
      [0.39, 0.07],
      [0.47, 0.03],
      [0.39, -0.02],
      [0.08, -0.065],
    ],
    {
      at: [0, 0.86, 0.099],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: OLD_BRASS,
      name: "guardInset",
      group: "guard",
    },
  );

  for (const s of [-1, 1]) {
    const fin = b.extrude(
      [
        [-0.13, 0.0],
        [0.09, 0.035],
        [0.19, 0.16],
        [0.11, 0.3],
        [-0.03, 0.22],
      ],
      {
        at: [s * 0.245, 0.98, -0.005],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.006,
        color: BLUE_STEEL,
        name: s > 0 ? "leftGuardFin" : "rightGuardFin",
        group: "guard",
      },
    );

    b.rod(
      [s * 0.275, 1.01, 0.035],
      [s * 0.37, 1.18, 0.035],
      0.014,
      {
        color: BRASS,
        sides: 6,
        caps: "flat",
        name: s > 0 ? "leftFinTrim" : "rightFinTrim",
        group: "guard",
      },
    );
  }

  for (const x of [-0.39, -0.22, 0.22, 0.39]) {
    rivet(b, [x, 0.89, 0.12], 0.021, CREAM);
  }

  /*
   * Revolver body. It sits behind the guard, with a broad chamber and a
   * pronounced front muzzle so the hybrid weapon reads immediately.
   */
  const receiver = b.part(
    new THREE.BoxGeometry(0.31, 0.27, 0.26),
    DARK_STEEL,
    {
      at: [0, 0.69, 0.025],
      rotation: [0, 0, 0],
      name: "gunReceiver",
      group: "gun",
    },
  );

  const receiverTop = b.extrude(
    [
      [-0.15, -0.08],
      [-0.13, 0.09],
      [-0.07, 0.16],
      [0.08, 0.16],
      [0.15, 0.09],
      [0.15, -0.08],
    ],
    {
      at: [0, 0.69, 0.17],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.006,
      color: BLUE_STEEL,
      name: "receiverFrontPlate",
      group: "gun",
    },
  );

  const chamber = cylinder(b, 0.145, 0.18, [0, 0.69, 0.16], BRASS, {
    dir: [0, 0, 1],
    name: "revolverCylinder",
    group: "gun",
  });

  const chamberFace = cylinder(b, 0.125, 0.018, [0, 0.69, 0.258], DARK_STEEL, {
    dir: [0, 0, 1],
    name: "chamberFace",
    group: "gun",
  });

  const chamberPanel = frontPanel(
    b,
    0.21,
    0.105,
    [0, 0.69, 0.27],
    CHAMBER_TEXTURE,
    "#ffffff",
  );

  const muzzleTube = cylinder(b, 0.09, 0.39, [0, 0.69, 0.35], DARK_STEEL, {
    dir: [0, 0, 1],
    name: "muzzleTube",
    group: "gun",
  });

  const muzzleCollar = cylinder(b, 0.12, 0.055, [0, 0.69, 0.555], BRASS, {
    dir: [0, 0, 1],
    name: "muzzleCollar",
    group: "gun",
  });

  const muzzleOpening = cylinder(b, 0.078, 0.016, [0, 0.69, 0.592], INK, {
    dir: [0, 0, 1],
    name: "muzzleOpening",
    group: "gun",
  });

  const muzzleCore = cylinder(b, 0.042, 0.021, [0, 0.69, 0.605], CYAN_DARK, {
    dir: [0, 0, 1],
    name: "muzzleEnergyCore",
    group: "gun",
  });
  glow(muzzleCore, 1.8);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    rivet(
      b,
      [Math.sin(a) * 0.097, 0.69 + Math.cos(a) * 0.097, 0.282],
      0.015,
      CREAM,
    );
  }

  /*
   * Side gears are deliberately visible rather than hidden inside the body.
   * They sell the "gun" half while staying in the same ornate fantasy palette.
   */
  const smallGearShape = {
    teeth: 12,
    module: 0.012,
    thickness: 0.035,
    spokes: 4,
    bore: 0.018,
  };

  const gearL = b.part(gearGeometry(smallGearShape), TINT.brass, {
    at: [0.145, 0.69, 0.292],
    dir: [0, 0, 1],
    texture: GEAR_TEXTURE,
    name: "leftSideGear",
    group: "gun",
  });

  const gearR = b.part(gearGeometry(smallGearShape), TINT.bronze, {
    at: [-0.145, 0.69, 0.292],
    dir: [0, 0, 1],
    texture: GEAR_TEXTURE,
    name: "rightSideGear",
    group: "gun",
  });

  cylinder(b, 0.026, 0.045, [0.145, 0.69, 0.321], CREAM, {
    dir: [0, 0, 1],
    name: "leftGearAxle",
    group: "gun",
  });
  cylinder(b, 0.026, 0.045, [-0.145, 0.69, 0.321], CREAM, {
    dir: [0, 0, 1],
    name: "rightGearAxle",
    group: "gun",
  });

  /*
   * Trigger guard and trigger. The guard is a bent low-poly tube, not a
   * block, so its open silhouette is obvious from the front.
   */
  const triggerGuard = b.sweep(
    catmull([
      [-0.135, 0.61, 0.19],
      [-0.17, 0.535, 0.19],
      [-0.135, 0.455, 0.19],
      [-0.02, 0.43, 0.19],
      [0.095, 0.47, 0.19],
    ]),
    0.024,
    {
      color: BRASS,
      sides: 7,
      caps: "round",
      name: "triggerGuard",
      group: "gun",
    },
  );

  b.sweep(
    polyline([
      [0.015, 0.61, 0.22],
      [0.035, 0.545, 0.22],
      [0.065, 0.5, 0.22],
    ]),
    0.014,
    {
      color: CREAM,
      sides: 6,
      caps: "round",
      name: "trigger",
      group: "gun",
    },
  );

  const safety = cylinder(b, 0.03, 0.026, [0.15, 0.79, 0.14], RUBY, {
    dir: [0, 0, 1],
    name: "safetyCrystal",
    group: "gun",
  });
  glow(safety, 1.4);

  /*
   * Grip and its wrapped bands.
   */
  const grip = b.sweep(
    catmull([
      [0, 0.61, -0.055],
      [0.01, 0.48, -0.075],
      [0.025, 0.31, -0.13],
      [0.03, 0.17, -0.16],
    ]),
    (t) => 0.095 - t * 0.014,
    {
      color: GRIP,
      sides: 8,
      caps: "round",
      name: "wrappedGrip",
      group: "handle",
    },
  );

  const gripTexturePart = frontPanel(
    b,
    0.115,
    0.34,
    [0.025, 0.39, -0.045],
    GRIP_TEXTURE,
    "#ffffff",
  );
  gripTexturePart.mesh.rotation.z = -0.04;

  const gripBands = [
    [0.555, -0.06],
    [0.49, -0.085],
    [0.425, -0.102],
    [0.36, -0.12],
    [0.295, -0.14],
    [0.23, -0.153],
  ];

  for (let i = 0; i < gripBands.length; i++) {
    const [y, z] = gripBands[i];
    b.rod(
      [-0.092, y, z + 0.065],
      [0.105, y, z + 0.065],
      0.011,
      {
        color: i % 2 ? OLD_BRASS : BRASS,
        sides: 6,
        caps: "round",
        name: `gripBand${i}`,
        group: "handle",
      },
    );
  }

  const gripSpine = b.sweep(
    polyline([
      [-0.075, 0.57, 0.0],
      [-0.06, 0.4, -0.02],
      [-0.035, 0.21, -0.07],
    ]),
    0.013,
    {
      color: VIOLET,
      sides: 6,
      caps: "round",
      name: "gripSpine",
      group: "handle",
    },
  );
  glow(gripSpine, 0.8);

  /*
   * Pommel: a turned metal mount, a gem inset, and two crescent-like fins.
   */
  const pommel = b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.092, 0.025],
      [0.105, 0.072],
      [0.085, 0.13],
      [0.052, 0.17],
      [0, 0.185],
    ],
    {
      at: [0.03, 0.035, -0.16],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 1,
      color: BRASS,
      name: "pommelMount",
      group: "handle",
    },
  );

  const pommelFace = frontPanel(
    b,
    0.12,
    0.12,
    [0.03, 0.115, -0.052],
    POMMEL_TEXTURE,
    "#ffffff",
  );

  const pommelGem = b.part(
    new THREE.IcosahedronGeometry(0.052, 1),
    RUBY,
    {
      at: [0.03, 0.115, -0.005],
      name: "pommelRuby",
      group: "handle",
    },
  );
  glow(pommelGem, 1.6);

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [s * 0.105, 0.025],
        [s * 0.16, 0.12],
        [s * 0.095, 0.17],
        [s * 0.03, 0.12],
      ],
      {
        at: [0.03, 0.035, -0.15],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.005,
        color: OLD_BRASS,
        name: s > 0 ? "pommelLeftWing" : "pommelRightWing",
        group: "handle",
      },
    );
  }

  /*
   * The materia socket in the guard is the visual focus. It is made from a
   * faceted crystal, a brass bezel, and a small luminous halo ring.
   */
  const bezel = cylinder(b, 0.102, 0.035, [0, 0.875, 0.13], BRASS, {
    dir: [0, 0, 1],
    name: "materiaBezel",
    group: "ornament",
  });

  const materia = b.part(
    new THREE.IcosahedronGeometry(0.072, 1),
    CYAN,
    {
      at: [0, 0.875, 0.166],
      rotation: [0.12, 0.2, 0.18],
      name: "materiaCrystal",
      group: "ornament",
    },
  );
  glow(materia, 2.4);

  const halo = b.sweep(
    polyline([
      [0.096, 0.875, 0.18],
      [0.068, 0.935, 0.18],
      [0, 0.963, 0.18],
      [-0.068, 0.935, 0.18],
      [-0.096, 0.875, 0.18],
      [-0.068, 0.815, 0.18],
      [0, 0.787, 0.18],
      [0.068, 0.815, 0.18],
      [0.096, 0.875, 0.18],
    ]),
    0.008,
    {
      color: CYAN,
      sides: 6,
      caps: "round",
      name: "materiaHalo",
      group: "ornament",
    },
  );
  glow(halo, 1.5);

  /*
   * Surface art: a large transparent rune strip on the blade and a smaller
   * crest on the guard. These are deliberately layered above the metal.
   */
  const bladeRunes = frontPanel(
    b,
    0.14,
    0.62,
    [0.0, 1.74, 0.091],
    RUNE_TEXTURE,
    "#ffffff",
  );
  glow(bladeRunes, 1.25);

  const guardSigil = frontPanel(
    b,
    0.165,
    0.165,
    [0, 0.88, 0.122],
    SIGIL_TEXTURE,
    "#ffffff",
  );
  glow(guardSigil, 1.1);

  /*
   * Decorative locking bars and small studs around the blade root.
   */
  b.rod(
    [-0.23, 1.1, 0.1],
    [-0.16, 1.22, 0.1],
    0.018,
    {
      color: BRASS,
      sides: 6,
      caps: "flat",
      name: "bladeLockLeft",
      group: "blade",
    },
  );

  b.rod(
    [0.18, 1.1, 0.1],
    [0.24, 1.22, 0.1],
    0.018,
    {
      color: BRASS,
      sides: 6,
      caps: "flat",
      name: "bladeLockRight",
      group: "blade",
    },
  );

  for (const s of [-1, 1]) {
    rivet(b, [s * 0.19, 1.08, 0.112], 0.023, CREAM);
    rivet(b, [s * 0.22, 1.23, 0.112], 0.018, OLD_BRASS);
  }

  /*
   * Short pointed quillons at the guard ends make the silhouette aggressive.
   */
  b.spike([-0.5, 0.9, 0.04], [-1, 0.28, 0], 0.16, 0.034, {
    color: BRASS,
    sides: 7,
    name: "leftQuillon",
    group: "guard",
  });

  b.spike([0.5, 0.9, 0.04], [1, 0.28, 0], 0.16, 0.034, {
    color: BRASS,
    sides: 7,
    name: "rightQuillon",
    group: "guard",
  });

  /*
   * A pair of tiny side plates protects the chamber and visually connects
   * the circular mechanism to the sword shoulders.
   */
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.12, 0.018],
        [0.16, 0.1],
        [0.11, 0.17],
        [0.03, 0.13],
      ],
      {
        at: [s * 0.16, 0.585, 0.13],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.004,
        color: BRASS,
        name: s > 0 ? "leftReceiverPlate" : "rightReceiverPlate",
        group: "gun",
      },
    );
  }

  /*
   * A slim rear spine reinforces the sword and gives the back edge a strong
   * dark silhouette in side view.
   */
  b.sweep(
    polyline([
      [0, 0.98, -0.075],
      [0, 1.42, -0.075],
      [0, 1.95, -0.075],
      [0, 2.42, -0.075],
      [0, 2.68, -0.075],
    ]),
    0.022,
    {
      color: DARK_STEEL,
      sides: 6,
      caps: "flat",
      name: "bladeRearSpine",
      group: "blade",
    },
  );

  /*
   * Floating-looking but actually mounted energy brackets near the tip.
   * They are small, angular, and keep the weapon from reading as a plain
   * sword with a gun glued to the bottom.
   */
  for (const s of [-1, 1]) {
    const bracket = b.extrude(
      [
        [0, 0],
        [s * 0.07, 0.018],
        [s * 0.085, 0.13],
        [s * 0.04, 0.18],
        [0, 0.12],
      ],
      {
        at: [0, 1.97, 0.065],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        color: VIOLET,
        name: s > 0 ? "leftArcBracket" : "rightArcBracket",
        group: "blade",
      },
    );
    glow(bracket, 0.7);
  }

  /*
   * Final tiny metal details: cap screws and a front sight on the muzzle.
   */
  for (const x of [-0.078, 0.078]) {
    rivet(b, [x, 0.81, 0.285], 0.014, CREAM);
  }

  b.spike([0, 0.69, 0.605], [0, 1, 0], 0.09, 0.018, {
    color: CREAM,
    sides: 6,
    name: "frontSight",
    group: "gun",
  });

  return b.root;
}
