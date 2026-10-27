import * as THREE from "three";
import { createBuilder, svg, paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: an oversized faceted sword fused with a revolver mechanism, ornate guard, glowing rune, and mechanical detailing.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = "#aeb9c7";
  const EDGE = "#e8f3ff";
  const DARK = "#202733";
  const BLACK = "#10151d";
  const BRASS = "#d49a42";
  const GOLD = "#f2c866";
  const RED = "#8f2634";
  const LEATHER = "#4b211b";
  const GRIP = "#292c36";
  const BLUE = "#55bde8";
  const GLOW = "#7cecff";

  const steelPaint = paint((p, n) => {
    const top = Math.max(0, n.y);
    const front = Math.max(0, n.z);
    const v = 0.82 + top * 0.14 + front * 0.08 + Math.sin(p.y * 38) * 0.025;
    return v > 0.94 ? EDGE : v > 0.86 ? STEEL : DARK;
  });

  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 256">
      <path d="M64 8 L77 58 112 78 78 93 92 143 64 126 36 143 50 93 16 78 51 58Z"
        fill="#7cecff" stroke="#dfffff" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 20 L64 116 M31 78 L97 78 M43 108 L85 48"
        fill="none" stroke="#ffffff" stroke-width="3" opacity=".9"/>
    </svg>`,
    { size: 256 },
  );

  const crest = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="57" fill="#171d28" stroke="#f2c866" stroke-width="7"/>
      <path d="M64 17 L75 51 111 64 75 76 64 111 52 76 17 64 52 51Z"
        fill="#8f2634" stroke="#fff1b0" stroke-width="4"/>
      <circle cx="64" cy="64" r="12" fill="#7cecff" stroke="#ffffff" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  // Main sword silhouette: a broad asymmetric fantasy blade with a clipped, pointed tip.
  const blade = b.extrude(
    [
      [-0.145, 0.92],
      [0.17, 0.92],
      [0.195, 1.30],
      [0.16, 1.73],
      [0.105, 2.03],
      [0.025, 2.28, "sharp"],
      [-0.04, 2.06],
      [-0.115, 1.72],
      [-0.18, 1.31],
    ],
    {
      at: [0, 0, 0.045],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      smoothing: 0,
      color: steelPaint,
      name: "heroBlade",
    },
  );

  // Bright cutting edges, kept angular and graphic.
  b.rod([-0.145, 0.935, 0.095], [-0.18, 1.31, 0.095], 0.014, EDGE, {
    caps: "flat",
    name: "edgeLowerL",
  });
  b.rod([-0.18, 1.31, 0.095], [-0.115, 1.72, 0.095], 0.012, EDGE, {
    caps: "flat",
    name: "edgeUpperL",
  });
  b.rod([0.17, 0.94, 0.095], [0.195, 1.3, 0.095], 0.012, EDGE, {
    caps: "flat",
    name: "edgeLowerR",
  });
  b.rod([0.195, 1.3, 0.095], [0.16, 1.73, 0.095], 0.011, EDGE, {
    caps: "flat",
    name: "edgeUpperR",
  });

  // Central fuller and angular blade spine.
  b.part(new THREE.BoxGeometry(0.042, 1.12, 0.018), BLACK, {
    at: [0.012, 1.45, 0.095],
    name: "bladeFuller",
  });
  b.rod([0.012, 0.99, 0.115], [0.012, 2.08, 0.115], 0.009, BLUE, {
    name: "energySpine",
  });

  // Glowing insignia laid onto the broad face.
  glow(
    b.part(new THREE.PlaneGeometry(0.12, 0.245), "#ffffff", {
      at: [-0.035, 1.57, 0.091],
      dir: [0, 0, 1],
      axis: "z",
      texture: rune,
      name: "bladeRune",
    }),
    2.2,
  );

  // Shoulder block where blade meets the gun housing.
  b.part(new THREE.BoxGeometry(0.42, 0.22, 0.19), steelPaint, {
    at: [0, 0.87, 0.025],
    rotation: [0, 0, 0],
    name: "bladeShoulder",
  });
  b.part(new THREE.BoxGeometry(0.31, 0.07, 0.225), GOLD, {
    at: [0, 0.985, 0.035],
    name: "shoulderTrim",
  });

  // Crossguard: chunky swept guard with red inset plates.
  b.extrude(
    [
      [-0.52, 0.90],
      [-0.48, 0.98],
      [-0.24, 1.04],
      [-0.15, 1.01],
      [-0.15, 0.91],
      [-0.31, 0.93],
      [-0.42, 0.83],
    ],
    {
      at: [0, 0, 0.01],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.16,
      bevel: 0.012,
      color: steelPaint,
      name: "guardL",
    },
  );
  b.extrude(
    [
      [0.52, 0.90],
      [0.48, 0.98],
      [0.24, 1.04],
      [0.15, 1.01],
      [0.15, 0.91],
      [0.31, 0.93],
      [0.42, 0.83],
    ],
    {
      at: [0, 0, 0.01],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.16,
      bevel: 0.012,
      color: steelPaint,
      name: "guardR",
    },
  );
  b.part(new THREE.BoxGeometry(0.09, 0.16, 0.18), RED, {
    at: [-0.35, 0.935, 0.092],
    name: "guardGemL",
  });
  b.part(new THREE.BoxGeometry(0.09, 0.16, 0.18), RED, {
    at: [0.35, 0.935, 0.092],
    name: "guardGemR",
  });

  // Gun body integrated behind the guard.
  b.part(new THREE.BoxGeometry(0.34, 0.42, 0.25), DARK, {
    at: [0, 0.71, 0.015],
    name: "receiver",
  });
  b.part(new THREE.BoxGeometry(0.25, 0.31, 0.28), steelPaint, {
    at: [0, 0.75, 0.045],
    name: "receiverPlate",
  });
  b.part(new THREE.BoxGeometry(0.27, 0.035, 0.30), GOLD, {
    at: [0, 0.91, 0.052],
    name: "receiverCrown",
  });

  // Revolver cylinder on the visible left side.
  const cylinder = b.part(
    new THREE.CylinderGeometry(0.145, 0.145, 0.105, 10),
    BRASS,
    {
      at: [0.205, 0.73, 0.035],
      dir: [1, 0, 0],
      name: "revolverCylinder",
    },
  );
  b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.112, 10), BLACK, {
    at: [0.265, 0.73, 0.035],
    dir: [1, 0, 0],
    name: "cylinderHub",
  });

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.118, 6), BLACK, {
      at: [0.272, 0.73 + Math.cos(a) * 0.088, 0.035 + Math.sin(a) * 0.088],
      dir: [1, 0, 0],
      name: `chamber${i}`,
    });
  }

  // Long muzzle running forward from the receiver, visually fused into the blade.
  b.capsule([0.06, 0.77, 0.15], [0.06, 0.77, 0.52], 0.065, BLACK, {
    sides: 8,
    name: "gunBarrel",
  });
  b.part(new THREE.CylinderGeometry(0.09, 0.075, 0.065, 8), BRASS, {
    at: [0.06, 0.77, 0.525],
    dir: [0, 0, 1],
    name: "muzzleRing",
  });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.075, 8), BLACK, {
    at: [0.06, 0.77, 0.565],
    dir: [0, 0, 1],
    name: "muzzleBore",
  });

  // Trigger loop and angular trigger.
  b.rod([0.115, 0.62, 0.11], [0.115, 0.40, 0.11], 0.018, GOLD, {
    name: "triggerFront",
  });
  b.rod([0.115, 0.40, 0.11], [-0.105, 0.40, 0.11], 0.018, GOLD, {
    name: "triggerBottom",
  });
  b.rod([-0.105, 0.40, 0.11], [-0.105, 0.62, 0.11], 0.018, GOLD, {
    name: "triggerBack",
  });
  b.rod([0.035, 0.59, 0.13], [-0.015, 0.48, 0.13], 0.018, RED, {
    name: "trigger",
  });

  // Grip, slightly tapered and wrapped.
  b.frustumBox(
    [0, 0.40, 0.02],
    [0, 0.05, -0.015],
    [0.145, 0.16],
    [0.115, 0.13],
    { color: GRIP, name: "grip" },
  );
  for (let i = 0; i < 5; i++) {
    const y = 0.10 + i * 0.062;
    b.rod([-0.125, y, 0.10], [0.125, y - 0.035, 0.10], 0.012, LEATHER, {
      name: `gripWrap${i}`,
    });
  }

  // Pommel and a small glowing core.
  b.part(new THREE.SphereGeometry(0.12, 8, 6), BRASS, {
    at: [0, 0.02, 0.0],
    name: "pommel",
  });
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.025, 8), BLACK, {
    at: [0, -0.105, 0],
    name: "pommelCap",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.038, 8, 6), GLOW, {
      at: [0, -0.02, 0.102],
      name: "pommelCrystal",
    }),
    2.5,
  );

  // Decorative crest on the receiver's front-facing side.
  glow(
    b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", {
      at: [0, 0.76, 0.178],
      dir: [0, 0, 1],
      axis: "z",
      texture: crest,
      name: "weaponCrest",
    }),
    1.1,
  );

  // Small bolts and rivets.
  const rivetPositions: [number, number, number][] = [
    [-0.14, 0.86, 0.17],
    [0.14, 0.86, 0.17],
    [-0.14, 0.66, 0.17],
    [0.14, 0.66, 0.17],
    [-0.18, 0.93, 0.13],
    [0.18, 0.93, 0.13],
  ];
  rivetPositions.forEach((p, i) => {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, {
      at: p,
      name: `rivet${i}`,
    });
  });

  return b.root;
}
