import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Dutch Windmill",
  description: "A cheerful Animal Crossing-style Dutch windmill with a tapered plaster tower, red cap, balcony, windows, door, and four chunky wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const CREAM = cel("#f8e6b4", "#d9b982");
  const CREAM_LIGHT = cel("#fff3ce", "#e8ca91");
  const RED = cel("#b9413f", "#762c35");
  const RED_LIGHT = cel("#e96350", "#9e3437");
  const WOOD = cel("#8f5a3d", "#54352f");
  const WOOD_LIGHT = cel("#c17b4e", "#754532");
  const DARK = "#342b3b";
  const GLASS = "#78c8c5";
  const BLUE = "#4e9fa5";
  const GOLD = "#f4c95d";
  const STONE = cel("#9caaa0", "#657b78");
  const STONE_LIGHT = cel("#c3c7a7", "#818b7d";
  const GRASS = "#7db65c";

  const frontZ = 0.64;

  const box = (
    size: [number, number, number],
    color: any,
    at: [number, number, number],
    options: any = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...options });

  const cyl = (
    radius: number,
    height: number,
    color: any,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    options: any = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { at, dir, ...options },
    );

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    options: any = {},
  ) => b.rod(a, z, radius, { color, section: { ngon: 8 }, ...options });

  // Low, friendly stone foundation.
  const foundation = b.lathe(
    [
      [0, 0],
      [0.82, 0],
      [0.86, 0.07],
      [0.77, 0.16],
      [0.69, 0.22],
      [0, 0.22],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: STONE,
      name: "stoneFoundation",
    },
  );

  // Individual foundation stones make the silhouette feel hand-built.
  const stones: Array<[number, number, number]> = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    stones.push([Math.sin(a) * 0.73, 0.12, Math.cos(a) * 0.73]);
  }
  for (let i = 0; i < stones.length; i++) {
    const p = stones[i];
    const s = i % 2 === 0 ? 0.22 : 0.18;
    box([s, 0.14, 0.16], i % 3 === 0 ? STONE_LIGHT : STONE, p, {
      rotation: [0, (i * 30 * Math.PI) / 180, 0],
      name: `foundationStone${i}`,
    });
  }

  // Main tapered plaster tower.
  const tower = b.lathe(
    [
      [0, 0.18],
      [0.72, 0.18],
      [0.72, 0.28],
      [0.63, 2.25],
      [0.57, 2.58],
      [0, 2.58],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: CREAM,
      name: "taperedPlasterTower",
    },
  );

  // Subtle colored base and upper bands.
  b.sweep(
    [
      [-0.69, 0.23, -0.01],
      [-0.35, 0.21, 0.56],
      [0.35, 0.21, 0.56],
      [0.69, 0.23, -0.01],
      [0.35, 0.21, -0.56],
      [-0.35, 0.21, -0.56],
    ],
    0.025,
    { color: RED, caps: "none", name: "redFoundationBand" },
  );

  const towerBand = (y: number, radius: number, color: any, name: string) => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push([Math.sin(a) * radius, y, Math.cos(a) * radius]);
    }
    b.sweep([...pts, pts[0]], 0.022, {
      color,
      caps: "none",
      name,
    });
  };

  towerBand(2.27, 0.61, RED_LIGHT, "upperRedBand");
  towerBand(2.53, 0.56, WOOD_LIGHT, "capFootBand");

  // Dark vertical timber ribs, characteristic of a toy-like Dutch tower.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 0.64;
    const z = Math.cos(a) * 0.64;
    rod(
      [x * 0.98, 0.36, z * 0.98],
      [x * 0.86, 2.25, z * 0.86],
      0.018,
      WOOD,
      { name: `timberRib${i}` },
    );
  }

  // Front door with a chunky wooden frame.
  box([0.34, 0.58, 0.08], WOOD, [0, 0.48, 0.66], {
    name: "frontDoor",
  });
  box([0.27, 0.48, 0.018], RED_LIGHT, [0, 0.49, 0.704], {
    name: "doorInset",
  });
  box([0.035, 0.035, 0.025], GOLD, [0.105, 0.48, 0.72], {
    name: "doorHandle",
  });
  box([0.39, 0.045, 0.055], WOOD_LIGHT, [0, 0.79, 0.68], {
    name: "doorLintel",
  });

  // Door planks and cross brace.
  for (let i = -2; i <= 2; i++) {
    box([0.018, 0.45, 0.012], WOOD, [i * 0.052, 0.49, 0.718], {
      name: `doorPlank${i + 2}`,
    });
  }
  rod([-0.13, 0.31, 0.73], [0.13, 0.67, 0.73], 0.012, WOOD, {
    name: "doorBrace",
  });

  // Four bright windows with shutters.
  const windowTexture = svg(
    `<svg viewBox="0 0 64 80">
      <rect width="64" height="80" rx="8" fill="#27404a"/>
      <rect x="7" y="7" width="50" height="66" rx="5" fill="#72c8c2" stroke="#f8e6b4" stroke-width="5"/>
      <path d="M32 8V72M8 40H56" stroke="#f8e6b4" stroke-width="5"/>
      <circle cx="18" cy="23" r="5" fill="#d9ffff" opacity=".8"/>
    </svg>`,
    { size: 128 },
  );

  const window = (x: number, y: number, scale: number, name: string) => {
    b.part(new THREE.BoxGeometry(0.24 * scale, 0.34 * scale, 0.035), WOOD, {
      at: [x, y, frontZ + 0.005],
      name: `${name}Frame`,
    });
    b.part(new THREE.PlaneGeometry(0.19 * scale, 0.28 * scale), "#ffffff", {
      at: [x, y, frontZ + 0.029],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      name: `${name}Glass`,
    });
    for (const s of [-1, 1]) {
      box(
        [0.06 * scale, 0.31 * scale, 0.035],
        RED,
        [x + s * 0.16 * scale, y, frontZ + 0.015],
        { name: `${name}Shutter${s}` },
      );
    }
  };

  window(0, 1.42, 1, "middleWindow");
  window(0, 2.02, 0.78, "upperWindow");

  // A small side window makes the tower readable from three-quarter views.
  b.part(new THREE.BoxGeometry(0.22, 0.28, 0.035), WOOD, {
    at: [0.57, 1.38, 0.23],
    rotation: [0, Math.PI / 2, 0],
    name: "sideWindowFrame",
  });
  b.part(new THREE.PlaneGeometry(0.17, 0.22), "#ffffff", {
    at: [0.591, 1.38, 0.23],
    dir: [1, 0, 0],
    axis: "z",
    texture: windowTexture,
    name: "sideWindowGlass",
  });

  // Balcony platform around the top.
  const balconyPts: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    balconyPts.push([Math.sin(a) * 0.71, 2.56, Math.cos(a) * 0.71]);
  }
  b.sweep([...balconyPts, balconyPts[0]], 0.045, {
    color: WOOD,
    caps: "none",
    name: "balconyRim",
  });
  b.sweep(
    [
      [-0.68, 2.48, -0.18],
      [-0.35, 2.48, 0.58],
      [0.35, 2.48, 0.58],
      [0.68, 2.48, 0.18],
      [0.35, 2.48, -0.58],
      [-0.35, 2.48, -0.58],
    ],
    0.035,
    { color: WOOD_LIGHT, caps: "none", name: "balconyLowerRail" },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 0.69;
    const z = Math.cos(a) * 0.69;
    rod([x, 2.50, z], [x, 2.72, z], 0.014, WOOD, {
      name: `balconyPost${i}`,
    });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 0.69;
    const z = Math.cos(a) * 0.69;
    cyl(0.027, 0.035, GOLD, [x, 2.72, z], [0, 1, 0], 6, {
      name: `balconyCap${i}`,
    });
  }

  // Red onion-like cap.
  b.lathe(
    [
      [0, 2.60],
      [0.60, 2.60],
      [0.62, 2.68],
      [0.52, 2.79],
      [0.36, 2.94],
      [0.16, 3.06],
      [0, 3.10],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: RED,
      name: "redCap",
    },
  );
  cyl(0.11, 0.16, GOLD, [0, 3.14, 0], [0, 1, 0], 8, {
    name: "goldenFinial",
  });
  b.sweep(
    [
      [-0.43, 2.85, 0],
      [-0.22, 2.98, 0],
      [0, 3.07, 0],
      [0.22, 2.98, 0],
      [0.43, 2.85, 0],
    ],
    0.018,
    { color: RED_LIGHT, name: "capHighlight" },
  );

  // Four large sails in a plane facing the viewer.
  const hub: [number, number, number] = [0, 2.23, 0.78];
  cyl(0.16, 0.16, WOOD, hub, [0, 0, 1], 10, { name: "sailHub" });
  cyl(0.09, 0.19, GOLD, [0, 2.23, 0.88], [0, 0, 1], 10, {
    name: "hubCap",
  });

  const sailAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  sailAngles.forEach((a, i) => {
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const cx = dx * 0.54;
    const cy = 2.23 + dy * 0.54;

    // Strong timber spine.
    b.part(new THREE.BoxGeometry(0.13, 1.04, 0.09), WOOD, {
      at: [cx, cy, 0.82],
      dir: [dx, dy, 0],
      axis: "y",
      name: `sailSpine${i}`,
    });

    // Wide cream sail panel, slightly offset toward the viewer.
    b.part(new THREE.BoxGeometry(0.27, 0.72, 0.045), CREAM_LIGHT, {
      at: [dx * 0.53, 2.23 + dy * 0.53, 0.875],
      dir: [dx, dy, 0],
      axis: "y",
      name: `sailCloth${i}`,
    });

    // Red diagonal stripe on each sail.
    b.part(new THREE.BoxGeometry(0.06, 0.68, 0.018), RED_LIGHT, {
      at: [dx * 0.53 - dy * 0.015, 2.23 + dy * 0.53 + dx * 0.015, 0.905],
      dir: [dx, dy, 0],
      axis: "y",
      rotation: [0, 0, Math.PI / 8],
      name: `sailStripe${i}`,
    });

    // Dark outer tip and a tiny gold cap.
    b.part(new THREE.BoxGeometry(0.19, 0.18, 0.08), WOOD_LIGHT, {
      at: [dx * 0.98, 2.23 + dy * 0.98, 0.83],
      dir: [dx, dy, 0],
      axis: "y",
      name: `sailTip${i}`,
    });
    cyl(
      0.045,
      0.12,
      GOLD,
      [dx * 1.06, 2.23 + dy * 1.06, 0.86],
      [dx, dy, 0],
      6,
      { name: `sailTipCap${i}` },
    );
  });

  // Rear tail beam and a little decorative weather vane.
  rod([0, 2.92, -0.38], [0, 2.92, -0.92], 0.035, WOOD, {
    name: "rearTailBeam",
  });
  b.part(new THREE.BoxGeometry(0.08, 0.38, 0.035), RED_LIGHT, {
    at: [0, 3.05, -0.96],
    name: "weatherVaneFin",
  });
  rod([-0.18, 3.14, -0.96], [0.18, 3.14, -0.96], 0.012, GOLD, {
    name: "weatherVaneArrow",
  });
  cyl(0.027, 0.08, GOLD, [0, 3.14, -0.96], [0, 1, 0], 6, {
    name: "weatherVanePin",
  });

  // Friendly painted sign above the door.
  const signTexture = svg(
    `<svg viewBox="0 0 180 60">
      <rect x="2" y="2" width="176" height="56" rx="14" fill="#f6ce69" stroke="#5b3b38" stroke-width="5"/>
      <text x="90" y="39" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="25" fill="#7b3f3a">MILL</text>
    </svg>`,
    { size: 192 },
  );
  b.part(new THREE.BoxGeometry(0.46, 0.18, 0.04), WOOD, {
    at: [0, 0.91, 0.68],
    name: "signBacking",
  });
  b.part(new THREE.PlaneGeometry(0.40, 0.135), "#ffffff", {
    at: [0, 0.91, 0.706],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "millSign",
  });

  // A few bright flower-shaped studs on the facade, kept architectural and toy-like.
  for (const [x, y] of [
    [-0.38, 1.02],
    [0.38, 1.02],
    [-0.34, 1.78],
    [0.34, 1.78],
  ] as [number, number][]) {
    cyl(0.035, 0.018, GOLD, [x, y, 0.685], [0, 0, 1], 8, {
      name: "facadeRosette",
    });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      box(
        [0.025, 0.055, 0.012],
        RED_LIGHT,
        [x + Math.sin(a) * 0.045, y + Math.cos(a) * 0.045, 0.698],
        { rotation: [0, 0, a], name: "rosettePetal" },
      );
    }
  }

  // A small patch of stylized grass at the contact edge, not a separate scene.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.sin(a) * 0.87;
    const z = Math.cos(a) * 0.87;
    b.spike([x, 0.19, z], [0, 1, 0], 0.09 + (i % 3) * 0.018, 0.018, {
      color: GRASS,
      name: `grassTuft${i}`,
    });
  }

  return b.root;
}
