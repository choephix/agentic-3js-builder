```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a pastel tapered tower, striped cap, four wooden sails, flower boxes, windows, and a cozy arched door.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const WHITE = cel("#fff3d7", "#e8cba6");
  const WALL = cel("#f3d9ae", "#c98e72");
  const BRICK = cel("#d88468", "#9d514c");
  const ROOF = cel("#5b9b9a", "#326c73");
  const ROOF_DARK = cel("#376c72", "#244c59");
  const WOOD = cel("#a96e42", "#70402f");
  const WOOD_LIGHT = cel("#d39454", "#895037");
  const TRIM = cel("#fff8dc", "#e9d0a0");
  const GLASS = "#7cc8c2";
  const GLASS_DARK = "#326b78";
  const FLOWER = "#ed7292";
  const FLOWER_YELLOW = "#ffd263";
  const LEAF = "#67a65d";
  const DARK = INK;
  const BRASS = "#e8b95c";

  const root = b.joint("millRoot", {
    at: [0, 0, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone: root,
      at,
      ...extra,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    segments = 12,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone: root,
      at,
      dir,
      ...extra,
    });

  // ---------------------------------------------------------------------------
  // Foundation: chunky cream stones and a low red-brick plinth.
  // ---------------------------------------------------------------------------

  box([1.02, 0.18, 0.82], [0, 0.09, 0], BRICK, { name: "brickPlinth" });

  const foundationStones: [number, number, number, number, number, number][] = [
    [-0.43, 0.20, 0.00, 0.25, 0.16, 0.30],
    [-0.15, 0.20, 0.28, 0.28, 0.16, 0.20],
    [0.16, 0.20, 0.28, 0.26, 0.16, 0.21],
    [0.42, 0.20, 0.00, 0.25, 0.16, 0.30],
    [-0.28, 0.20, -0.29, 0.30, 0.16, 0.18],
    [0.12, 0.20, -0.29, 0.30, 0.16, 0.18],
  ];
  for (const [x, y, z, sx, sy, sz] of foundationStones) {
    box([sx, sy, sz], [x, y, z], WHITE, { name: "foundationStone" });
  }

  // ---------------------------------------------------------------------------
  // Tapered tower.
  // ---------------------------------------------------------------------------

  const tower = b.frustumBox(
    [0, 0.25, 0],
    [0, 1.86, 0],
    [0.78, 0.78],
    [0.53, 0.53],
    {
      bone: root,
      color: WALL,
      section: "box",
      name: "taperedTower",
    } as any,
  );

  // Broad white corner strips emphasize the toy-like Dutch silhouette.
  for (const x of [-0.315, 0.315]) {
    box([0.075, 1.47, 0.075], [x, 1.04, 0.355], TRIM, {
      name: "frontCornerTrim",
    });
  }
  box([0.72, 0.075, 0.075], [0, 1.77, 0.355], TRIM, {
    name: "upperFrontTrim",
  });
  box([0.82, 0.09, 0.08], [0, 0.30, 0.38], TRIM, {
    name: "lowerFrontTrim",
  });

  // Small brick bands around the tower.
  for (const y of [0.55, 0.84, 1.13, 1.42]) {
    box([0.67 - y * 0.07, 0.035, 0.055], [0, y, 0.37], BRICK, {
      name: "brickBand",
    });
  }

  // ---------------------------------------------------------------------------
  // Cap and roof.
  // ---------------------------------------------------------------------------

  const roofBase = cylinder(0.70, 0.13, [0, 1.88, 0], ROOF_DARK, [0, 1, 0], 12, {
    name: "roofEave",
  });

  b.part(new THREE.ConeGeometry(0.62, 0.42, 12), ROOF, {
    bone: root,
    at: [0, 2.12, 0],
    name: "conicalRoof",
  });

  // Alternating roof stripes, built as thin vertical-ish slats around the cone.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 0.43;
    const z = Math.cos(a) * 0.43;
    box([0.045, 0.32, 0.035], [x, 2.12, z], i % 2 ? ROOF_DARK : ROOF, {
      rotation: [0, (-a * 180) / Math.PI, 0],
      name: "roofRib",
    });
  }

  cylinder(0.075, 0.20, [0, 2.42, 0], BRASS, [0, 1, 0], 8, {
    name: "roofFinial",
  });
  b.part(new THREE.SphereGeometry(0.10, 8, 6), BRASS, {
    bone: root,
    at: [0, 2.54, 0],
    name: "roofFinialBall",
  });

  // ---------------------------------------------------------------------------
  // Front door and windows.
  // ---------------------------------------------------------------------------

  const doorTexture = svg(
    `<svg viewBox="0 0 128 180" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 174V62Q64 8 120 62V174Z" fill="#8c5039" stroke="#22112f" stroke-width="8"/>
      <path d="M64 28V174M17 76H111M20 112H108" stroke="#d99a59" stroke-width="7"/>
      <circle cx="91" cy="106" r="7" fill="#f8d579" stroke="#22112f" stroke-width="3"/>
      <path d="M30 174V78Q64 35 98 78V174" fill="none" stroke="#5d352d" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.PlaneGeometry(0.37, 0.53), "#ffffff", {
    bone: root,
    at: [0, 0.58, 0.405],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    name: "archedDoor",
  });

  const windowTexture = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 112V42Q50 4 92 42V112Z" fill="#7cc8c2" stroke="#22112f" stroke-width="9"/>
      <path d="M50 15V112M12 65H88" stroke="#fff3d7" stroke-width="7"/>
      <path d="M18 42Q50 13 82 42" fill="none" stroke="#fff3d7" stroke-width="7"/>
      <circle cx="24" cy="30" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 192 },
  );

  for (const x of [-0.245, 0.245]) {
    b.part(new THREE.PlaneGeometry(0.20, 0.27), "#ffffff", {
      bone: root,
      at: [x, 1.35, 0.385],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      name: "archedWindow",
    });
    box([0.235, 0.035, 0.045], [x, 1.19, 0.405], TRIM, {
      name: "windowSill",
    });
  }

  // Tiny attic window below the roof.
  b.part(new THREE.CircleGeometry(0.095, 12), GLASS, {
    bone: root,
    at: [0, 1.73, 0.405],
    dir: [0, 0, 1],
    axis: "z",
    name: "roundAtticWindow",
  });
  cylinder(0.105, 0.035, [0, 1.73, 0.42], TRIM, [0, 0, 1], 12, {
    name: "atticWindowFrame",
  });
  box([0.018, 0.18, 0.035], [0, 1.73, 0.445], TRIM, {
    name: "atticMullionV",
  });
  box([0.18, 0.018, 0.035], [0, 1.73, 0.445], TRIM, {
    name: "atticMullionH",
  });

  // ---------------------------------------------------------------------------
  // Flower boxes and cheerful flowers.
  // ---------------------------------------------------------------------------

  for (const x of [-0.245, 0.245]) {
    box([0.28, 0.10, 0.13], [x, 1.12, 0.47], WOOD, {
      name: "flowerBox",
    });
    box([0.31, 0.035, 0.15], [x, 1.19, 0.47], WOOD_LIGHT, {
      name: "flowerBoxLip",
    });

    for (let i = -1; i <= 1; i++) {
      const fx = x + i * 0.065;
      cylinder(0.012, 0.12, [fx, 1.25, 0.48], LEAF, [0, 1, 0], 5, {
        name: "flowerStem",
      });
      b.part(new THREE.SphereGeometry(0.035, 7, 5), i === 0 ? FLOWER_YELLOW : FLOWER, {
        bone: root,
        at: [fx, 1.32 + Math.abs(i) * 0.015, 0.49],
        name: "flowerHead",
      });
    }
  }

  // Door step and two cute pebble accents.
  box([0.48, 0.07, 0.22], [0, 0.29, 0.47], WHITE, { name: "doorstep" });
  for (const x of [-0.53, 0.53]) {
    b.part(new THREE.DodecahedronGeometry(0.075, 0), WHITE, {
      bone: root,
      at: [x, 0.28, 0.22],
      scale: [1.25, 0.7, 0.9],
      name: "gardenPebble",
    });
  }

  // ---------------------------------------------------------------------------
  // Windmill mechanism and four broad wooden sails on the front.
  // ---------------------------------------------------------------------------

  const hubY = 1.60;
  const hubZ = 0.49;

  // Back axle collar, visible brass hub and central cap.
  cylinder(0.16, 0.13, [0, hubY, hubZ], WOOD, [0, 0, 1], 12, {
    name: "sailHubWood",
  });
  cylinder(0.115, 0.17, [0, hubY, hubZ + 0.10], BRASS, [0, 0, 1], 12, {
    name: "sailHubBrass",
  });
  b.part(new THREE.SphereGeometry(0.10, 10, 8), BRASS, {
    bone: root,
    at: [0, hubY, hubZ + 0.19],
    name: "hubCap",
  });

  const sailTexture = svg(
    `<svg viewBox="0 0 40 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2L38 158L20 145L2 158Z" fill="#d39454" stroke="#4c2b28" stroke-width="4"/>
      <path d="M10 42H30M12 78H28M15 113H25" stroke="#fff3d7" stroke-width="6"/>
    </svg>`,
    { size: 192 },
  );

  // Each sail is a long tapered-looking wooden paddle. Rotation is in the face plane.
  for (let i = 0; i < 4; i++) {
    const angle = 45 + i * 90;
    const rad = (angle * Math.PI) / 180;
    const x = Math.sin(rad) * 0.39;
    const y = hubY + Math.cos(rad) * 0.39;

    // Broad inner beam.
    box([0.105, 0.80, 0.07], [x, y, hubZ + 0.03], WOOD, {
      rotation: [0, 0, angle],
      name: "sailBeam",
    });

    // Decorative pale sail cloth, slightly forward of the beam.
    const cloth = b.part(new THREE.PlaneGeometry(0.13, 0.63), "#ffffff", {
      bone: root,
      at: [x, y, hubZ + 0.075],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, 0, angle],
      texture: sailTexture,
      name: "stripedSailCloth",
    });

    // End cap gives each arm a playful squared silhouette.
    box([0.18, 0.075, 0.09], [
      Math.sin(rad) * 0.78,
      hubY + Math.cos(rad) * 0.78,
      hubZ + 0.035,
    ], WOOD_LIGHT, {
      rotation: [0, 0, angle],
      name: "sailTip",
    });

    // Small brass rivets at the outer ends.
    b.part(new THREE.SphereGeometry(0.025, 7, 5), BRASS, {
      bone: root,
      at: [
        Math.sin(rad) * 0.78,
        hubY + Math.cos(rad) * 0.78,
        hubZ + 0.10,
      ],
      name: "sailRivet",
    });
  }

  // Four little bolts around the hub.
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.018, 6, 4), WHITE, {
      bone: root,
      at: [Math.sin(a) * 0.075, hubY + Math.cos(a) * 0.075, hubZ + 0.205],
      name: "hubBolt",
    });
  }

  // ---------------------------------------------------------------------------
  // Side chimney and tiny rear tail, enough to make the building feel lived in.
  // ---------------------------------------------------------------------------

  cylinder(0.095, 0.34, [0.39, 1.86, -0.10], BRICK, [0, 1, 0], 8, {
    name: "chimney",
  });
  cylinder(0.125, 0.07, [0.39, 2.05, -0.10], ROOF_DARK, [0, 1, 0], 8, {
    name: "chimneyCap",
  });

  // Small rear roof fin, peeking behind the cap.
  box([0.08, 0.48, 0.06], [0, 2.16, -0.38], WOOD, {
    rotation: [0, 0, -9],
    name: "rearRoofBrace",
  });

  return b.root;
}
```