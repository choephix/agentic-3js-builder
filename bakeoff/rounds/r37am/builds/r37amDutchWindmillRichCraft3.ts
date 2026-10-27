import * as THREE from "three";
import { createBuilder, paint, mottle, grain, svg } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a chunky pastel tower, flower-like roof, glowing windows, wooden door, and four broad cream sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const CREAM = cel("#f6e8bd", "#d9bd88");
  const TOWER = cel("#f3d99b", "#c89e68");
  const BRICK = cel("#d36d54", "#99463e");
  const BRICK_DARK = "#8b3f3b";
  const WOOD = cel("#9a5738", "#63352f");
  const WOOD_LIGHT = cel("#c9844e", "#804531");
  const ROOF = cel("#dc7358", "#923d45");
  const ROOF_LIGHT = "#f19a6a";
  const TEAL = cel("#58b8b0", "#28777a");
  const TEAL_DARK = "#20545c";
  const GOLD = cel("#f5bd56", "#b46a37");
  const GLASS = "#a9e7d8";
  const SHADOW = "#3c2938";
  const WHITE = "#fff7dc";
  const FLOWER = "#f28b9d";
  const LEAF = "#68a95f";

  const towerPaint = mottle(TOWER, "#e6c77f", { size: 0.22, contrast: 1.4, seed: 12 });
  const woodPaint = grain(WOOD, WOOD_LIGHT, { size: 0.045, axis: "y", seed: 8 });

  const windowTexture = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="120" rx="45" fill="#173f4d"/>
      <path d="M10 72 Q50 20 90 72 L90 110 L10 110Z" fill="#6bc9c0"/>
      <path d="M50 28V109 M13 74H87" stroke="#fff1b8" stroke-width="8"/>
      <path d="M21 67 Q50 35 79 67" fill="none" stroke="#fff8d5" stroke-width="5"/>
      <circle cx="28" cy="53" r="5" fill="#ffffff" opacity=".8"/>
      <circle cx="72" cy="47" r="3" fill="#ffffff" opacity=".7"/>
    </svg>`,
    { size: 256 },
  );

  const doorTexture = svg(
    `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="150" rx="16" fill="#704039"/>
      <path d="M12 12V138 M35 12V138 M63 12V138 M88 12V138" stroke="#a96a45" stroke-width="5"/>
      <path d="M9 28H91 M9 68H91 M9 108H91" stroke="#513039" stroke-width="4"/>
      <circle cx="75" cy="76" r="7" fill="#f8c55c"/>
      <circle cx="73" cy="74" r="2" fill="#fff2a5"/>
    </svg>`,
    { size: 256 },
  );

  const signTexture = svg(
    `<svg viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="292" height="82" rx="22" fill="#f6d37e" stroke="#6f3f39" stroke-width="8"/>
      <text x="150" y="59" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size=" thirty" font-size="32" fill="#6f3f39">DE MOLEN</text>
      <circle cx="30" cy="45" r="10" fill="#ef8a75"/>
      <circle cx="270" cy="45" r="10" fill="#ef8a75"/>
    </svg>`,
    { size: 384 },
  );

  const flowerTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#5a3540" stroke-width="5" stroke-linecap="round">
        <path d="M50 53V96"/>
        <path d="M49 76 Q25 62 13 72"/>
        <path d="M50 70 Q76 56 88 66"/>
      </g>
      <path d="M49 72 Q30 58 21 66 Q26 80 49 78Z" fill="#70ae61"/>
      <path d="M51 76 Q70 61 82 68 Q75 81 51 82Z" fill="#4c914e"/>
      <g fill="#f184a0" stroke="#6b3e55" stroke-width="3">
        <circle cx="50" cy="42" r="18"/>
        <circle cx="28" cy="40" r="15"/>
        <circle cx="72" cy="40" r="15"/>
        <circle cx="39" cy="22" r="15"/>
        <circle cx="61" cy="22" r="15"/>
      </g>
      <circle cx="50" cy="34" r="9" fill="#f8cf66" stroke="#855342" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  // Main octagonal tower. Its lower edge sits directly on the floor.
  b.sweep(
    [
      [0, 0.04, 0],
      [0, 0.28, 0],
      [0, 1.13, 0],
      [0, 1.38, 0],
    ],
    (t) => 0.43 - 0.13 * t,
    {
      section: { ngon: 8 },
      sides: 8,
      caps: "flat",
      color: towerPaint,
      name: "octagonal tower",
      group: "architecture",
    },
  );

  // Warm masonry blocks around the lower tower, kept chunky and decorative.
  for (let row = 0; row < 4; row++) {
    const y = 0.13 + row * 0.12;
    for (let side = 0; side < 8; side++) {
      const a = (side * Math.PI) / 4 + (row % 2) * 0.12;
      const x = Math.sin(a) * (0.425 - row * 0.012);
      const z = Math.cos(a) * (0.425 - row * 0.012);
      const tangent = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      b.part(
        new THREE.BoxGeometry(0.16, 0.075, 0.028),
        BRICK,
        {
          at: [x, y, z],
          dir: [Math.sin(a), 0, Math.cos(a)],
          up: [0, 1, 0],
          scale: [1, 1, 1],
          name: `brick-${row}-${side}`,
          group: "masonry",
        },
      );
    }
  }

  // Dark foundation band.
  b.sweep(
    [
      [0, 0.045, 0],
      [0, 0.13, 0],
    ],
    [0.445, 0.445],
    {
      section: { ngon: 8 },
      caps: "flat",
      color: BRICK_DARK,
      name: "foundation",
      group: "architecture",
    },
  );

  // Door and its chunky cream surround.
  b.part(new THREE.BoxGeometry(0.28, 0.44, 0.045), WOOD, {
    at: [0, 0.265, 0.425],
    name: "wooden door",
    group: "front details",
  });
  b.part(new THREE.PlaneGeometry(0.235, 0.365), WHITE, {
    at: [0, 0.285, 0.451],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    name: "door painted face",
    group: "front details",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.50, 0.07), CREAM, {
    at: [-0.19, 0.28, 0.43],
    name: "door left trim",
    group: "front details",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.50, 0.07), CREAM, {
    at: [0.19, 0.28, 0.43],
    name: "door right trim",
    group: "front details",
  });
  b.part(new THREE.BoxGeometry(0.43, 0.065, 0.07), CREAM, {
    at: [0, 0.54, 0.43],
    name: "door lintel",
    group: "front details",
  });

  // Two arched windows on the upper face.
  for (const x of [-0.155, 0.155]) {
    b.part(new THREE.BoxGeometry(0.16, 0.25, 0.045), TEAL_DARK, {
      at: [x, 0.94, 0.335],
      name: `window surround ${x}`,
      group: "windows",
    });
    b.part(new THREE.PlaneGeometry(0.135, 0.205), GLASS, {
      at: [x, 0.955, 0.363],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      name: `window glass ${x}`,
      group: "windows",
    });
    b.part(new THREE.BoxGeometry(0.018, 0.22, 0.025), GOLD, {
      at: [x, 0.955, 0.391],
      name: `window mullion ${x}`,
      group: "windows",
    });
    b.part(new THREE.BoxGeometry(0.15, 0.018, 0.025), GOLD, {
      at: [x, 0.955, 0.392],
      name: `window crossbar ${x}`,
      group: "windows",
    });
  }

  // A little sign below the windows.
  b.part(new THREE.BoxGeometry(0.48, 0.15, 0.035), WOOD, {
    at: [0, 0.68, 0.408],
    name: "sign backing",
    group: "sign",
  });
  b.part(new THREE.PlaneGeometry(0.43, 0.128), WHITE, {
    at: [0, 0.69, 0.431],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "DE MOLEN sign",
    group: "sign",
  });

  // A tiny balcony beneath the cap gives the silhouette a friendly, inhabited feel.
  b.part(new THREE.BoxGeometry(0.66, 0.055, 0.40), WOOD, {
    at: [0, 1.27, 0.02],
    name: "balcony floor",
    group: "roof",
  });
  for (const x of [-0.30, -0.15, 0, 0.15, 0.30]) {
    b.rod([x, 1.27, 0.18], [x, 1.46, 0.18], 0.014, {
      color: WOOD_LIGHT,
      name: `balcony post ${x}`,
      group: "roof",
    });
  }
  b.rod([-0.34, 1.46, 0.18], [0.34, 1.46, 0.18], 0.021, {
    color: WOOD,
    name: "balcony rail",
    group: "roof",
  });

  // Broad polygonal Dutch cap.
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.43, 0.035],
      [0.36, 0.11],
      [0.22, 0.25],
      [0.08, 0.34],
      [0, 0.36],
    ],
    {
      at: [0, 1.36, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: ROOF,
      name: "faceted red cap",
      group: "roof",
    },
  );

  // Roof rim and a pale decorative band.
  b.sweep(
    [
      [0, 1.355, 0],
      [0, 1.39, 0],
    ],
    [0.445, 0.445],
    {
      section: { ngon: 12 },
      caps: "flat",
      color: ROOF_LIGHT,
      name: "cap rim",
      group: "roof",
    },
  );
  b.sweep(
    [
      [0, 1.445, 0],
      [0, 1.475, 0],
    ],
    [0.38, 0.38],
    {
      section: { ngon: 12 },
      caps: "flat",
      color: CREAM,
      name: "cap cream stripe",
      group: "roof",
    },
  );

  // Small flower box under the left window.
  b.part(new THREE.BoxGeometry(0.32, 0.10, 0.13), WOOD, {
    at: [-0.16, 0.77, 0.38],
    name: "flower box",
    group: "garden detail",
  });
  b.cards(
    [
      [ -0.25, 0.82, 0.47 ],
      [ -0.16, 0.84, 0.49 ],
      [ -0.07, 0.82, 0.47 ],
    ].map((p) => ({ at: p, axis: [0, 1, 0] } as any)),
    flowerTexture,
    {
      size: [0.11, 0.18],
      lean: 0,
      color: WHITE,
      cross: true,
      name: "window flowers",
      group: "garden detail",
    },
  );

  // Central axle boss, in front of the tower and roof.
  const hub = [0, 1.29, 0.50] as [number, number, number];
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.15, 12), GOLD, {
    at: hub,
    dir: [0, 0, 1],
    name: "golden sail hub",
    group: "sails",
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.17, 10), WOOD, {
    at: [0, 1.29, 0.59],
    dir: [0, 0, 1],
    name: "axle cap",
    group: "sails",
  });

  // Four broad, tapered sails. Each is a solid low-poly wooden blade with two reinforcing bars.
  const sailLength = 0.78;
  const sailAngles = [45, 135, 225, 315];

  for (let i = 0; i < sailAngles.length; i++) {
    const angle = (sailAngles[i] * Math.PI) / 180;
    const radial = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0).normalize();
    const across = new THREE.Vector3(radial.y, -radial.x, 0).normalize();

    const blade = [
      [-0.065, 0],
      [0.065, 0],
      [0.105, 0.26],
      [0.085, 0.54],
      [0.035, sailLength],
      [-0.035, sailLength],
      [-0.085, 0.54],
      [-0.105, 0.26],
    ] as [number, number][];

    b.extrude(blade, {
      at: hub,
      x: across,
      y: radial,
      thickness: [0.038, 0.022],
      bevel: 0.008,
      smoothing: 0,
      color: CREAM,
      name: `cream sail ${i + 1}`,
      group: "sails",
    });

    const base = new THREE.Vector3(hub[0], hub[1], hub[2] + 0.026);
    for (const d of [0.27, 0.53]) {
      const p = base.clone().addScaledVector(radial, d);
      const q = base.clone().addScaledVector(radial, d + 0.16);
      b.rod(p, q, 0.018, {
        color: WOOD,
        name: `sail brace ${i + 1}-${d}`,
        group: "sails",
      });
    }

    // A small terracotta end cap makes each sail read clearly against the sky.
    const tip = new THREE.Vector3(hub[0], hub[1], hub[2] + 0.03).addScaledVector(
      radial,
      sailLength - 0.035,
    );
    b.part(new THREE.BoxGeometry(0.10, 0.065, 0.045), ROOF, {
      at: tip,
      dir: radial,
      up: [0, 0, 1],
      name: `sail tip ${i + 1}`,
      group: "sails",
    });
  }

  // Four tiny gold rivets around the hub.
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.017, 6, 4), WHITE, {
      at: [Math.sin(a) * 0.073, 1.29 + Math.cos(a) * 0.073, 0.585],
      name: `hub rivet ${i + 1}`,
      group: "sails",
    });
  }

  // A little weather vane peeking behind the cap.
  b.rod([0, 1.58, -0.01], [0, 1.86, -0.01], 0.014, {
    color: GOLD,
    name: "weather vane stem",
    group: "roof ornament",
  });
  b.extrude(
    [
      [0, 0],
      [0.14, 0.035],
      [0.05, 0.075],
      [0.14, 0.11],
      [0, 0.095],
      [-0.07, 0.145],
      [-0.05, 0.065],
      [-0.12, 0.025],
    ],
    {
      at: [0, 1.84, -0.01],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: GOLD,
      name: "weather vane rooster",
      group: "roof ornament",
    },
  );

  // Doorstep stones, kept simple so the windmill remains the hero.
  for (const x of [-0.18, 0, 0.18]) {
    b.part(new THREE.DodecahedronGeometry(0.085, 0), BRICK, {
      at: [x, 0.055, 0.47],
      scale: [1.35, 0.38, 0.72],
      name: `step stone ${x}`,
      group: "foundation",
    });
  }

  return b.root;
}
