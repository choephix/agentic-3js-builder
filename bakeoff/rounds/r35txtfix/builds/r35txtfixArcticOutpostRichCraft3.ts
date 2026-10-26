import * as THREE from "three";
import { createBuilder, rng, svg } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A stylized Firewatch-inspired arctic field station with a snow island, raised orange cabin, glowing windows, solar array, satellite dish, radio mast, equipment, snowmobile, ice shards and wind flags.",
};

export default function build() {
  const b = createBuilder({
    name: "arctic-research-outpost",
    detail: 1,
    paintSize: 1024,
  });

  const GROUP = "outpost";

  const SNOW = cel("#eef8fa", "#b8d8e2", { threshold: 0.16 });
  const SNOW_LIGHT = cel("#ffffff", "#d2e9ef", { threshold: 0.2 });
  const SNOW_BLUE = cel("#b8dce7", "#719eb5", { threshold: 0.12 });
  const ICE = cel("#89d5e5", "#438ba9", { threshold: 0.12 });
  const ICE_DARK = cel("#3d7690", "#24485c", { threshold: 0.12 });

  const WALL = cel("#c85b43", "#793b48", { threshold: 0.14 });
  const WALL_DARK = cel("#853b3d", "#4d2d3a", { threshold: 0.1 });
  const WALL_LIGHT = cel("#e07a4d", "#9d4650", { threshold: 0.16 });
  const ROOF = cel("#24444d", "#152a38", { threshold: 0.1 });
  const ROOF_DARK = cel("#152a38", "#0d1c29", { threshold: 0.08 });
  const ROOF_LIGHT = cel("#37616a", "#1c3543", { threshold: 0.12 });
  const WOOD = cel("#865044", "#4b3540", { threshold: 0.1 });
  const WOOD_LIGHT = cel("#b56a4f", "#6b3c42", { threshold: 0.15 });
  const WOOD_DARK = cel("#4b3540", "#2d2934", { threshold: 0.1 });

  const METAL = cel("#506d78", "#273e4c", { threshold: 0.12 });
  const METAL_DARK = cel("#273b49", "#142633", { threshold: 0.08 });
  const STEEL = cel("#9bb4bb", "#536e7a", { threshold: 0.18 });
  const ORANGE = cel("#ef8750", "#a74342", { threshold: 0.12 });
  const SAFETY_YELLOW = cel("#f5c85b", "#bc6c3e", { threshold: 0.16 });
  const RED = cel("#ed5a55", "#8e303d", { threshold: 0.12 });
  const GLASS = cel("#92d9e2", "#3f7b98", { threshold: 0.1 });
  const ROCK = cel("#718c99", "#3b5565", { threshold: 0.08 });
  const ROCK_LIGHT = cel("#9fb5b9", "#526e7b", { threshold: 0.16 });
  const BLACK = "#172735";
  const INK = "#1c2934";
  const CREAM = "#fff0c9";

  const random = rng(42);

  function box(
    size: readonly [number, number, number],
    color: any,
    at: any,
    name: string,
    rotation: readonly [number, number, number] = [0, 0, 0],
    extra: Record<string, any> = {},
  ) {
    return b.part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      {
        at,
        rotation: [rotation[0], rotation[1], rotation[2]],
        flat: true,
        name,
        group: GROUP,
        ...extra,
      },
    );
  }

  function cylinder(
    topRadius: number,
    height: number,
    color: any,
    at: any,
    name: string,
    dir: any = [0, 1, 0],
    segments = 8,
    bottomRadius = topRadius,
    extra: Record<string, any> = {},
  ) {
    return b.part(
      new THREE.CylinderGeometry(topRadius, bottomRadius, height, segments, 1),
      color,
      {
        at,
        dir,
        flat: true,
        name,
        group: GROUP,
        ...extra,
      },
    );
  }

  function cone(
    radius: number,
    height: number,
    color: any,
    at: any,
    name: string,
    rotation: readonly [number, number, number] = [0, 0, 0],
    extra: Record<string, any> = {},
  ) {
    return b.part(
      new THREE.ConeGeometry(radius, height, 7),
      color,
      {
        at,
        rotation: [rotation[0], rotation[1], rotation[2]],
        flat: true,
        name,
        group: GROUP,
        ...extra,
      },
    );
  }

  function sphere(
    radius: number,
    color: any,
    at: any,
    name: string,
    scale: readonly [number, number, number] = [1, 1, 1],
    segments = 8,
    rings = 5,
    extra: Record<string, any> = {},
  ) {
    return b.part(
      new THREE.SphereGeometry(radius, segments, rings),
      color,
      {
        at,
        scale: [scale[0], scale[1], scale[2]],
        flat: true,
        name,
        group: GROUP,
        ...extra,
      },
    );
  }

  function plane(
    size: readonly [number, number],
    color: any,
    at: any,
    dir: any,
    name: string,
    texture?: THREE.Texture,
    up: any = [0, 1, 0],
    extra: Record<string, any> = {},
  ) {
    return b.part(
      new THREE.PlaneGeometry(size[0], size[1]),
      color,
      {
        at,
        dir,
        up,
        axis: "z",
        texture,
        flat: true,
        name,
        group: GROUP,
        ...extra,
      },
    );
  }

  function torus(
    radius: number,
    tube: number,
    color: any,
    at: any,
    name: string,
    dir: any = [0, 1, 0],
    extra: Record<string, any> = {},
  ) {
    return b.part(
      new THREE.TorusGeometry(radius, tube, 6, 12),
      color,
      {
        at,
        dir,
        flat: true,
        name,
        group: GROUP,
        ...extra,
      },
    );
  }

  function rod(
    a: any,
    c: any,
    radius: number,
    color: any,
    name: string,
    extra: Record<string, any> = {},
  ) {
    return b.rod(a, c, radius, {
      color,
      caps: "flat",
      section: { ngon: 6 },
      name,
      group: GROUP,
      ...extra,
    });
  }

  function patch(
    x: number,
    z: number,
    outline: ReadonlyArray<readonly [number, number]>,
    color: any,
    name: string,
  ) {
    return b.extrude(outline as any, {
      at: [x, 0.244, z],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.009,
      bevel: 0.002,
      smoothing: 0,
      color,
      name,
      group: GROUP,
    });
  }

  function flag(
    x: number,
    y: number,
    z: number,
    side: number,
    color: any,
    name: string,
  ) {
    rod([x, y - 0.55, z], [x, y + 0.32, z], 0.018, METAL_DARK, `${name}Pole`);
    b.extrude(
      [
        [0, 0],
        [side * 0.33, -0.02],
        [side * 0.33, 0.2],
        [0, 0.31],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.002,
        color,
        name: `${name}Cloth`,
        group: GROUP,
      },
    );
  }

  const WINDOW_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#183244"/>
      <rect x="7" y="7" width="86" height="86" rx="4" fill="#f6c866"/>
      <rect x="12" y="12" width="34" height="34" fill="#ffe395"/>
      <rect x="54" y="12" width="34" height="34" fill="#e99c58"/>
      <rect x="12" y="54" width="34" height="34" fill="#ffd36b"/>
      <rect x="54" y="54" width="34" height="34" fill="#f8b85e"/>
      <path d="M50 8V92M8 50H92" stroke="#294557" stroke-width="7"/>
      <path d="M14 18L35 12M59 19L80 13" stroke="#ffffff" stroke-width="4" opacity=".62"/>
      <path d="M17 84L34 76" stroke="#fff5d0" stroke-width="3" opacity=".65"/>
    </svg>`,
    { size: 160 },
  );

  const DOOR_TEX = svg(
    `<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="120" fill="#243b48"/>
      <rect x="10" y="8" width="60" height="42" rx="3" fill="#f5c961"/>
      <path d="M40 9V49M11 29H69" stroke="#294957" stroke-width="6"/>
      <rect x="13" y="60" width="54" height="49" fill="#315365"/>
      <path d="M22 69H58V101H22Z" fill="#5d8290"/>
      <circle cx="57" cy="77" r="4" fill="#eec36e"/>
      <path d="M14 14L31 10" stroke="#ffffff" stroke-width="3" opacity=".6"/>
    </svg>`,
    { size: 160 },
  );

  const SOLAR_TEX = svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="#102f4b"/>
      <rect x="3" y="3" width="114" height="74" fill="#1e5876" stroke="#b1d8df" stroke-width="2"/>
      <g stroke="#8bc8d6" stroke-width="1.5" opacity=".9">
        <path d="M20 4V76M40 4V76M60 4V76M80 4V76M100 4V76"/>
        <path d="M4 20H116M4 40H116M4 60H116"/>
      </g>
      <path d="M10 10L53 4M65 77L112 68" stroke="#e5fbff" stroke-width="3" opacity=".55"/>
      <circle cx="96" cy="18" r="4" fill="#d7f5f6" opacity=".8"/>
    </svg>`,
    { size: 192 },
  );

  const SIGN_TEX = svg(
    `<svg viewBox="0 0 240 70" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="70" rx="6" fill="#264954"/>
      <rect x="5" y="5" width="230" height="60" rx="3" fill="#efd28a" stroke="#142d38" stroke-width="4"/>
      <path d="M16 18H224M16 53H224" stroke="#ca6849" stroke-width="3"/>
      <text x="120" y="32" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="#243b43">POLAR FIELD</text>
      <text x="120" y="50" text-anchor="middle" font-family="sans-serif" font-size="12" letter-spacing="3" fill="#a44742">STATION 07</text>
    </svg>`,
    { size: 256 },
  );

  const CONSOLE_TEX = svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="#182b36"/>
      <rect x="5" y="5" width="110" height="70" fill="#294653" stroke="#9ab6b9" stroke-width="2"/>
      <circle cx="30" cy="34" r="16" fill="#e9d79c" stroke="#14252f" stroke-width="4"/>
      <path d="M30 34L38 22" stroke="#d94e4e" stroke-width="3"/>
      <circle cx="78" cy="28" r="8" fill="#efb85c"/>
      <circle cx="98" cy="28" r="8" fill="#64c8a0"/>
      <rect x="65" y="47" width="38" height="8" fill="#132630"/>
      <rect x="70" y="49" width="20" height="4" fill="#e8b961"/>
      <path d="M14 67H107" stroke="#dbe9dc" stroke-width="2"/>
    </svg>`,
    { size: 160 },
  );

  const WARNING_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5L95 91H5Z" fill="#f4c44e" stroke="#251f28" stroke-width="8" stroke-linejoin="round"/>
      <rect x="46" y="31" width="8" height="31" rx="3" fill="#342734"/>
      <circle cx="50" cy="74" r="5" fill="#342734"/>
    </svg>`,
    { size: 128 },
  );

  const MAP_TEX = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#eee3bb"/>
      <path d="M0 65C25 43 42 73 64 51S106 22 160 46V100H0Z" fill="#8fc7ca"/>
      <path d="M0 18C28 7 46 33 70 19S116 6 160 25" fill="none" stroke="#d4835c" stroke-width="5"/>
      <path d="M20 78L50 54L83 71L119 42L146 60" fill="none" stroke="#304e58" stroke-width="3"/>
      <path d="M28 23L38 14M33 27L43 18M115 80L128 70" stroke="#6b9ca3" stroke-width="4"/>
      <circle cx="82" cy="51" r="6" fill="#d74f4e" stroke="#27383e" stroke-width="3"/>
      <text x="82" y="91" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#243b43">ICE ROUTE 07</text>
    </svg>`,
    { size: 192 },
  );

  const RADIO_TEX = svg(
    `<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="120" fill="#1c303c"/>
      <rect x="8" y="8" width="64" height="104" rx="4" fill="#496875" stroke="#172630" stroke-width="4"/>
      <rect x="18" y="19" width="44" height="24" fill="#162c3e"/>
      <path d="M22 36H58M28 31H52" stroke="#79d8d3" stroke-width="3"/>
      <circle cx="25" cy="62" r="6" fill="#e2b957"/>
      <circle cx="43" cy="62" r="6" fill="#dd6257"/>
      <circle cx="59" cy="62" r="6" fill="#74c29b"/>
      <rect x="18" y="78" width="44" height="8" fill="#203d4c"/>
      <rect x="18" y="94" width="30" height="5" fill="#b6d5d5"/>
    </svg>`,
    { size: 160 },
  );

  // ---------------------------------------------------------------------------
  // Snow island, exposed ice, drifts and the sparse ring of arctic rocks.

  cylinder(3.72, 0.24, SNOW, [0, 0.12, 0], "SnowIsland", [0, 1, 0], 14, 4.02);

  patch(
    -1.15,
    1.28,
    [
      [-0.68, -0.15],
      [-0.38, -0.31],
      [0.02, -0.22],
      [0.42, -0.3],
      [0.7, -0.03],
      [0.5, 0.18],
      [0.05, 0.1],
      [-0.31, 0.25],
      [-0.64, 0.15],
    ],
    ICE,
    "IcePatchFront",
  );

  patch(
    1.65,
    1.7,
    [
      [-0.5, -0.1],
      [-0.23, -0.26],
      [0.32, -0.2],
      [0.55, 0.02],
      [0.23, 0.19],
      [-0.24, 0.15],
      [-0.52, 0.04],
    ],
    SNOW_BLUE,
    "IcePatchRight",
  );

  patch(
    -2.42,
    -1.47,
    [
      [-0.44, -0.18],
      [-0.12, -0.34],
      [0.42, -0.23],
      [0.5, 0.06],
      [0.1, 0.27],
      [-0.35, 0.17],
    ],
    ICE_DARK,
    "IcePatchBackLeft",
  );

  patch(
    0.8,
    -2.45,
    [
      [-0.56, -0.2],
      [-0.17, -0.31],
      [0.38, -0.22],
      [0.54, 0.04],
      [0.15, 0.26],
      [-0.39, 0.18],
    ],
    SNOW_BLUE,
    "IcePatchBack",
  );

  const snowDrifts = [
    [-2.65, 0.32, -0.65, 0.72, 0.2, 0.52],
    [2.62, 0.31, -0.95, 0.7, 0.19, 0.5],
    [-2.55, 0.29, 1.48, 0.9, 0.16, 0.4],
    [2.35, 0.29, 1.78, 0.78, 0.17, 0.45],
    [-0.38, 0.29, 2.56, 1.15, 0.13, 0.32],
    [0.95, 0.28, 2.45, 0.78, 0.16, 0.3],
    [-3.12, 0.28, 0.94, 0.52, 0.14, 0.3],
    [3.12, 0.28, 0.28, 0.52, 0.14, 0.34],
  ] as const;

  snowDrifts.forEach((d, i) => {
    sphere(1, SNOW_LIGHT, [d[0], d[1], d[2]], `SnowDrift${i}`, [d[3], d[4], d[5]], 10, 5);
  });

  const rocks = [
    [-3.02, 0.25, -1.72, 0.32, 0.28, 0.36],
    [-2.85, 0.26, 2.12, 0.3, 0.25, 0.42],
    [2.9, 0.26, -1.76, 0.34, 0.23, 0.3],
    [3.0, 0.25, 1.48, 0.28, 0.3, 0.4],
    [-1.82, 0.25, -2.65, 0.42, 0.2, 0.3],
    [2.02, 0.25, -2.42, 0.35, 0.22, 0.31],
    [-3.32, 0.25, 0.05, 0.25, 0.22, 0.3],
    [3.25, 0.25, 0.65, 0.27, 0.2, 0.31],
    [-0.52, 0.25, 2.93, 0.35, 0.16, 0.25],
    [1.4, 0.25, 2.8, 0.32, 0.19, 0.26],
  ] as const;

  rocks.forEach((r, i) => {
    sphere(
      1,
      i % 3 === 0 ? ROCK_LIGHT : ROCK,
      [r[0], r[1], r[2]],
      `Rock${i}`,
      [r[3], r[4], r[5]],
      7,
      5,
    );
    if (i % 2 === 0) {
      sphere(
        1,
        SNOW_LIGHT,
        [r[0] - 0.03, r[1] + r[4] * 0.75, r[2] + 0.02],
        `RockSnow${i}`,
        [r[3] * 0.68, r[4] * 0.18, r[5] * 0.45],
        7,
        4,
      );
    }
  });

  // Deliberately sparse low-poly ice crystals around the edge of the diorama.
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + random() * 0.16;
    const radius = 2.65 + random() * 0.48;
    const h = 0.27 + random() * 0.27;
    const r = 0.065 + random() * 0.045;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    cone(
      r,
      h,
      i % 3 === 0 ? SNOW_BLUE : ICE,
      [x, 0.245 + h / 2, z],
      `IceCrystal${i}`,
      [random() * 7 - 3.5, random() * 12 - 6, random() * 7 - 3.5],
    );
  }

  // ---------------------------------------------------------------------------
  // Raised cabin: four heavy legs, foundation, orange wall box and graphic plank
  // divisions.

  const cabinCenterZ = -0.48;
  const cabinFrontZ = 0.39;
  const cabinBackZ = -1.35;

  box([2.88, 0.13, 1.86], METAL_DARK, [0, 0.86, cabinCenterZ], "CabinFoundation");

  const legPositions = [
    [-1.08, -1.13],
    [1.08, -1.13],
    [-1.08, 0.17],
    [1.08, 0.17],
  ] as const;

  legPositions.forEach(([x, z], i) => {
    cylinder(0.1, 0.68, WOOD, [x, 0.58, z], `CabinStilt${i}`, [0, 1, 0], 7);
    cylinder(0.16, 0.07, METAL_DARK, [x, 0.27, z], `StiltFoot${i}`, [0, 1, 0], 8);
    sphere(1, SNOW_LIGHT, [x, 0.29, z], `StiltSnow${i}`, [0.21, 0.08, 0.2], 8, 4);
  });

  rod([-1.08, 0.38, -1.12], [-0.56, 0.82, -1.12], 0.035, WOOD_DARK, "BraceBackLeft");
  rod([1.08, 0.38, -1.12], [0.56, 0.82, -1.12], 0.035, WOOD_DARK, "BraceBackRight");
  rod([-1.08, 0.38, 0.16], [-0.56, 0.82, 0.16], 0.035, WOOD_DARK, "BraceFrontLeft");
  rod([1.08, 0.38, 0.16], [0.56, 0.82, 0.16], 0.035, WOOD_DARK, "BraceFrontRight");

  box([2.7, 1.44, 1.7], WALL, [0, 1.58, cabinCenterZ], "CabinWalls");

  box([2.8, 0.07, 0.08], WALL_DARK, [0, 0.94, cabinFrontZ + 0.025], "FrontPlank0");
  box([2.8, 0.07, 0.08], WALL_DARK, [0, 1.18, cabinFrontZ + 0.025], "FrontPlank1");
  box([2.8, 0.07, 0.08], WALL_DARK, [0, 1.42, cabinFrontZ + 0.025], "FrontPlank2");
  box([2.8, 0.07, 0.08], WALL_DARK, [0, 1.66, cabinFrontZ + 0.025], "FrontPlank3");
  box([2.8, 0.07, 0.08], WALL_DARK, [0, 1.9, cabinFrontZ + 0.025], "FrontPlank4");
  box([2.8, 0.07, 0.08], WALL_DARK, [0, 2.14, cabinFrontZ + 0.025], "FrontPlank5");

  box([0.09, 1.5, 0.09], WALL_LIGHT, [-1.34, 1.58, cabinFrontZ + 0.04], "FrontCornerLeft");
  box([0.09, 1.5, 0.09], WALL_LIGHT, [1.34, 1.58, cabinFrontZ + 0.04], "FrontCornerRight");
  box([0.09, 1.5, 0.09], WALL_DARK, [-1.34, 1.58, cabinBackZ - 0.04], "BackCornerLeft");
  box([0.09, 1.5, 0.09], WALL_DARK, [1.34, 1.58, cabinBackZ - 0.04], "BackCornerRight");

  box([0.05, 1.35, 0.06], WALL_DARK, [-1.0, 1.6, cabinBackZ - 0.045], "BackVertical1");
  box([0.05, 1.35, 0.06], WALL_DARK, [-0.4, 1.6, cabinBackZ - 0.045], "BackVertical2");
  box([0.05, 1.35, 0.06], WALL_DARK, [0.4, 1.6, cabinBackZ - 0.045], "BackVertical3");
  box([0.05, 1.35, 0.06], WALL_DARK, [1.0, 1.6, cabinBackZ - 0.045], "BackVertical4");

  // Front gable, intentionally simplified into a bold triangular Firewatch silhouette.
  b.extrude(
    [
      [-1.31, 0],
      [1.31, 0],
      [0, 0.82],
    ],
    {
      at: [0, 1.83, cabinFrontZ + 0.065],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.006,
      color: WALL_DARK,
      name: "FrontGable",
      group: GROUP,
    },
  );

  b.extrude(
    [
      [-1.17, 0.05],
      [1.17, 0.05],
      [0, 0.67],
    ],
    {
      at: [0, 1.87, cabinFrontZ + 0.105],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.015,
      color: WALL_LIGHT,
      name: "GableInset",
      group: GROUP,
    },
  );

  // Two snow-covered roof planes and a ridge beam.
  box([1.72, 0.17, 2.02], ROOF, [0.71, 2.55, cabinCenterZ], "RoofRight", [0, 0, -17]);
  box([1.72, 0.17, 2.02], ROOF, [-0.71, 2.55, cabinCenterZ], "RoofLeft", [0, 0, 17]);
  box([1.56, 0.075, 1.96], SNOW_LIGHT, [0.71, 2.67, cabinCenterZ], "RoofSnowRight", [0, 0, -17]);
  box([1.56, 0.075, 1.96], SNOW_LIGHT, [-0.71, 2.67, cabinCenterZ], "RoofSnowLeft", [0, 0, 17]);

  rod([0, 2.82, -1.48], [0, 2.82, 0.53], 0.065, ROOF_DARK, "RoofRidge");
  box([2.92, 0.12, 0.12], ROOF_DARK, [0, 2.32, 0.55], "FrontRoofFascia");
  box([2.92, 0.12, 0.12], ROOF_DARK, [0, 2.32, -1.48], "BackRoofFascia");
  box([0.16, 0.12, 2.05], SNOW_LIGHT, [-1.41, 2.31, cabinCenterZ], "LeftEaveSnow", [0, 0, 17]);
  box([0.16, 0.12, 2.05], SNOW_LIGHT, [1.41, 2.31, cabinCenterZ], "RightEaveSnow", [0, 0, -17]);

  [-1.17, -0.72, 0.72, 1.17].forEach((x, i) => {
    cone(0.035, 0.17 + (i % 2) * 0.05, SNOW_LIGHT, [x, 2.22, 0.68], `FrontIcicle${i}`, [0, 0, 0]);
  });

  // ---------------------------------------------------------------------------
  // Front door, lit windows, trim and the small access stair.

  box([0.57, 1.04, 0.11], ROOF_DARK, [-0.88, 1.36, cabinFrontZ + 0.08], "FrontDoorFrame");
  const door = plane(
    [0.46, 0.91],
    "#ffffff",
    [-0.88, 1.38, cabinFrontZ + 0.145],
    [0, 0, 1],
    "FrontDoor",
    DOOR_TEX,
  );

  box([0.05, 1.0, 0.035], CREAM, [-1.17, 1.38, cabinFrontZ + 0.16], "DoorTrimLeft");
  box([0.05, 1.0, 0.035], CREAM, [-0.59, 1.38, cabinFrontZ + 0.16], "DoorTrimRight");
  box([0.63, 0.05, 0.035], CREAM, [-0.88, 1.88, cabinFrontZ + 0.16], "DoorTrimTop");
  box([0.63, 0.05, 0.035], CREAM, [-0.88, 0.88, cabinFrontZ + 0.16], "DoorTrimBottom");

  cylinder(0.035, 0.018, SAFETY_YELLOW, [-0.68, 1.35, cabinFrontZ + 0.18], "DoorHandle", [0, 0, 1], 8);
  box([0.03, 0.32, 0.018], WALL_DARK, [-0.88, 1.16, cabinFrontZ + 0.18], "DoorLowerPanel");
  box([0.03, 0.32, 0.018], WALL_DARK, [-0.88, 1.55, cabinFrontZ + 0.18], "DoorMiddlePanel");

  box([0.98, 0.79, 0.08], ROOF_DARK, [0.46, 1.73, cabinFrontZ + 0.07], "FrontWindowFrame");
  const frontWindow = plane(
    [0.82, 0.63],
    "#ffffff",
    [0.46, 1.73, cabinFrontZ + 0.125],
    [0, 0, 1],
    "FrontWindow",
    WINDOW_TEX,
  );
  glow(frontWindow, 1.25);

  box([0.035, 0.67, 0.025], CREAM, [0.04, 1.73, cabinFrontZ + 0.16], "WindowTrimLeft");
  box([0.035, 0.67, 0.025], CREAM, [0.88, 1.73, cabinFrontZ + 0.16], "WindowTrimRight");
  box([0.86, 0.035, 0.025], CREAM, [0.46, 2.07, cabinFrontZ + 0.16], "WindowTrimTop");
  box([0.86, 0.035, 0.025], CREAM, [0.46, 1.39, cabinFrontZ + 0.16], "WindowTrimBottom");
  box([0.035, 0.64, 0.025], WALL_DARK, [0.46, 1.73, cabinFrontZ + 0.17], "WindowMullionV");
  box([0.82, 0.035, 0.025], WALL_DARK, [0.46, 1.73, cabinFrontZ + 0.17], "WindowMullionH");

  const stepZ = [0.55, 0.76, 0.97] as const;
  stepZ.forEach((z, i) => {
    box([0.78 - i * 0.08, 0.12, 0.27], WOOD_LIGHT, [-0.88, 0.31 + i * 0.13, z], `DoorStep${i}`);
  });
  rod([-1.25, 0.35, 0.6], [-1.25, 0.85, 0.6], 0.025, METAL_DARK, "StairRailLeft");
  rod([-0.51, 0.35, 0.6], [-0.51, 0.85, 0.6], 0.025, METAL_DARK, "StairRailRight");
  rod([-1.25, 0.85, 0.6], [-0.88, 0.95, 0.6], 0.025, METAL_DARK, "StairRailTopLeft");
  rod([-0.51, 0.85, 0.6], [-0.88, 0.95, 0.6], 0.025, METAL_DARK, "StairRailTopRight");

  function sideWindow(side: number, z: number, y: number, w: number, h: number, tag: string) {
    box([0.09, h + 0.12, w + 0.12], ROOF_DARK, [side * 1.38, y, z], `${tag}Frame`);
    const glass = plane(
      [w, h],
      "#ffffff",
      [side * 1.44, y, z],
      [side, 0, 0],
      tag,
      WINDOW_TEX,
      [0, 1, 0],
    );
    glow(glass, 1.1);
    box([0.035, h + 0.1, 0.035], CREAM, [side * 1.48, y, z - w * 0.54], `${tag}TrimA`);
    box([0.035, h + 0.1, 0.035], CREAM, [side * 1.48, y, z + w * 0.54], `${tag}TrimB`);
    box([0.035, 0.035, w + 0.1], CREAM, [side * 1.48, y - h * 0.54, z], `${tag}TrimC`);
    box([0.035, 0.035, w + 0.1], CREAM, [side * 1.48, y + h * 0.54, z], `${tag}TrimD`);
    box([0.025, h, 0.025], WALL_DARK, [side * 1.5, y, z], `${tag}Mullion`);
  }

  sideWindow(1, -0.56, 1.72, 0.72, 0.54, "RightWindow");
  sideWindow(-1, -0.56, 1.72, 0.72, 0.54, "LeftWindow");

  // A small map plaque on the left wall.
  box([0.035, 0.39, 0.58], WOOD_LIGHT, [-1.4, 1.12, 0.13], "MapPlaqueFrame");
  const mapPlaque = plane(
    [0.48, 0.3],
    "#ffffff",
    [-1.43, 1.12, 0.13],
    [-1, 0, 0],
    "IceRouteMap",
    MAP_TEX,
    [0, 1, 0],
  );

  // ---------------------------------------------------------------------------
  // Chimney and roof service details.

  cylinder(0.105, 0.62, ROOF_DARK, [-0.91, 2.78, -1.03], "ChimneyPipe", [0, 1, 0], 8);
  cylinder(0.14, 0.07, SNOW_LIGHT, [-0.91, 3.09, -1.03], "ChimneySnowCap", [0, 1, 0], 8);
  box([0.32, 0.08, 0.2], ROOF, [-0.91, 3.18, -1.03], "ChimneyCap");
  box([0.04, 0.25, 0.04], METAL, [-0.81, 3.22, -1.03], "ChimneyCapPin");
  box([0.04, 0.25, 0.04], METAL, [-1.01, 3.22, -1.03], "ChimneyCapPin2");

  cylinder(0.055, 0.2, METAL, [-0.48, 2.74, -1.13], "RoofVent", [0, 1, 0], 7);
  cone(0.11, 0.09, SNOW_LIGHT, [-0.48, 2.89, -1.13], "RoofVentSnow");
  cylinder(0.07, 0.13, METAL, [0.53, 2.73, -1.12], "RoofAntennaBase", [0, 1, 0], 7);
  rod([0.53, 2.79, -1.12], [0.53, 3.08, -1.12], 0.018, METAL_DARK, "RoofAntenna");
  rod([0.43, 2.98, -1.12], [0.63, 2.98, -1.12], 0.014, METAL_DARK, "RoofAntennaCrossbar");

  // ---------------------------------------------------------------------------
  // Weather mast on the right rear corner.

  box([0.45, 0.11, 0.45], METAL_DARK, [1.63, 2.28, -0.94], "MastBase");
  cylinder(0.11, 0.1, SNOW_LIGHT, [1.63, 2.35, -0.94], "MastSnowCap", [0, 1, 0], 8);

  rod([1.63, 2.33, -0.94], [1.63, 3.78, -0.94], 0.035, METAL_DARK, "MastMain");
  rod([1.38, 2.4, -0.94], [1.63, 3.55, -0.94], 0.018, METAL, "MastBraceLeft");
  rod([1.88, 2.4, -0.94], [1.63, 3.55, -0.94], 0.018, METAL, "MastBraceRight");

  [2.67, 2.92, 3.17].forEach((y, i) => {
    rod([1.42, y, -0.94], [1.63, y, -0.94], 0.014, METAL, `MastLadderLeft${i}`);
    rod([1.63, y, -0.94], [1.84, y, -0.94], 0.014, METAL, `MastLadderRight${i}`);
  });

  rod([1.23, 3.32, -0.94], [2.03, 3.32, -0.94], 0.025, METAL_DARK, "MastWeatherArm");
  rod([1.63, 3.32, -0.94], [1.63, 3.6, -0.94], 0.02, METAL, "MastWeatherStem");
  sphere(0.055, SAFETY_YELLOW, [1.63, 3.62, -0.94], "WeatherCupHub", [1, 1, 1], 7, 4);
  sphere(0.08, RED, [1.63, 3.83, -0.94], "MastBeacon", [1, 0.72, 1], 8, 5);
  glow(b.part(
    new THREE.SphereGeometry(0.075, 8, 5),
    "#f35f52",
    { at: [1.63, 3.83, -0.94], scale: [1, 0.72, 1], flat: true, name: "MastBeaconGlow", group: GROUP },
  ), 1.6);

  rod([1.63, 3.32, -0.94], [1.31, 3.48, -0.94], 0.014, SAFETY_YELLOW, "AnemometerArmA");
  rod([1.63, 3.32, -0.94], [1.95, 3.48, -0.94], 0.014, SAFETY_YELLOW, "AnemometerArmB");
  sphere(0.045, SAFETY_YELLOW, [1.31, 3.48, -0.94], "AnemometerCupA", [1.5, 0.8, 0.8], 6, 4);
  sphere(0.045, SAFETY_YELLOW, [1.95, 3.48, -0.94], "AnemometerCupB", [1.5, 0.8, 0.8], 6, 4);

  // ---------------------------------------------------------------------------
  // Satellite dish and its snow-capped mount.

  const dishNormal = new THREE.Vector3(0, 0.42, 0.91).normalize();
  const dishCenter = new THREE.Vector3(1.84, 2.74, -0.36);

  rod([1.84, 2.35, -0.36], dishCenter, 0.045, METAL_DARK, "DishMast");
  rod([1.62, 2.42, -0.36], dishCenter, 0.022, METAL, "DishSupportLeft");
  rod([2.06, 2.42, -0.36], dishCenter, 0.022, METAL, "DishSupportRight");
  sphere(0.07, SNOW_LIGHT, [1.84, 2.43, -0.36], "DishMountSnow", [1.5, 0.55, 1.2], 7, 4);

  const dish = b.part(
    new THREE.CircleGeometry(0.48, 12),
    ROOF_LIGHT,
    {
      at: dishCenter,
      dir: dishNormal,
      axis: "z",
      up: [0, 1, 0],
      flat: true,
      name: "SatelliteDish",
      group: GROUP,
    },
  );
  torus(0.48, 0.026, SNOW_LIGHT, dishCenter, "DishSnowRim", dishNormal);
  sphere(0.055, SAFETY_YELLOW, dishCenter.clone().addScaledVector(dishNormal, 0.05), "DishFeedHub", [1, 1, 1], 7, 4);
  rod(
    dishCenter.clone().addScaledVector(dishNormal, 0.06),
    dishCenter.clone().addScaledVector(dishNormal, 0.38),
    0.014,
    METAL_DARK,
    "DishFeedArm",
  );
  sphere(0.035, RED, dishCenter.clone().addScaledVector(dishNormal, 0.4), "DishFeedTip", [1, 1, 1], 6, 4);

  // ---------------------------------------------------------------------------
  // Solar panel array leaning into the pale arctic sky.

  const panelCenter = new THREE.Vector3(-1.92, 1.25, -0.58);
  const panelNormal = new THREE.Vector3(0, 0.82, -0.57).normalize();
  const panelUp = new THREE.Vector3(0, 0.57, 0.82).normalize();
  const panelRight = new THREE.Vector3(1, 0, 0);
  const panelHalfW = 0.62;
  const panelHalfH = 0.42;
  const panelCorners = [
    panelCenter.clone().addScaledVector(panelRight, -panelHalfW).addScaledVector(panelUp, -panelHalfH),
    panelCenter.clone().addScaledVector(panelRight, panelHalfW).addScaledVector(panelUp, -panelHalfH),
    panelCenter.clone().addScaledVector(panelRight, panelHalfW).addScaledVector(panelUp, panelHalfH),
    panelCenter.clone().addScaledVector(panelRight, -panelHalfW).addScaledVector(panelUp, panelHalfH),
  ];

  const solarPanel = plane(
    [1.24, 0.84],
    "#d9edf0",
    panelCenter,
    panelNormal,
    "SolarPanel",
    SOLAR_TEX,
    panelUp,
  );
  box([1.34, 0.05, 0.08], METAL_DARK, panelCenter.clone().addScaledVector(panelUp, -0.45), "SolarLowerFrame", [0, 0, 0], {
    dir: panelNormal,
  });
  rod(panelCorners[0], panelCorners[1], 0.025, METAL_DARK, "SolarFrameBottom");
  rod(panelCorners[1], panelCorners[2], 0.025, METAL_DARK, "SolarFrameRight");
  rod(panelCorners[2], panelCorners[3], 0.025, METAL_DARK, "SolarFrameTop");
  rod(panelCorners[3], panelCorners[0], 0.025, METAL_DARK, "SolarFrameLeft");
  rod(panelCorners[0], panelCorners[2], 0.012, METAL, "SolarDiagonal");
  rod(
    panelCenter.clone().addScaledVector(panelRight, -0.4).addScaledVector(panelUp, -0.4).addScaledVector(panelNormal, -0.02),
    [-1.92 - 0.4, 0.32, -0.58 + 0.4],
    0.035,
    METAL_DARK,
    "SolarLegLeft",
  );
  rod(
    panelCenter.clone().addScaledVector(panelRight, 0.4).addScaledVector(panelUp, -0.4).addScaledVector(panelNormal, -0.02),
    [-1.92 + 0.4, 0.32, -0.58 + 0.4],
    0.035,
    METAL_DARK,
    "SolarLegRight",
  );
  box([1.48, 0.06, 0.08], SNOW_LIGHT, [-1.92, 1.67, -0.91], "SolarTopSnow", [0, 0, -8]);

  // ---------------------------------------------------------------------------
  // Signpost, external radio cabinet and field equipment.

  rod([1.15, 0.3, 0.95], [1.15, 1.35, 0.95], 0.035, WOOD, "SignPostLeft");
  rod([1.95, 0.3, 0.95], [1.95, 1.35, 0.95], 0.035, WOOD, "SignPostRight");
  box([1.08, 0.38, 0.1], WOOD, [1.55, 1.42, 0.95], "StationSignBoard");
  const sign = plane(
    [0.98, 0.28],
    "#ffffff",
    [1.55, 1.42, 1.01],
    [0, 0, 1],
    "StationSign",
    SIGN_TEX,
  );

  box([0.58, 0.86, 0.48], METAL_DARK, [1.94, 0.68, 0.65], "GeneratorBody");
  box([0.46, 0.58, 0.035], METAL, [1.94, 0.72, 0.905], "GeneratorFrontPanel");
  const generatorPanel = plane(
    [0.38, 0.48],
    "#ffffff",
    [1.94, 0.72, 0.928],
    [0, 0, 1],
    "GeneratorConsole",
    CONSOLE_TEX,
  );
  box([0.14, 0.15, 0.035], RED, [2.2, 1.02, 0.92], "GeneratorWarningFrame");
  const warning = plane(
    [0.11, 0.11],
    "#ffffff",
    [2.2, 1.02, 0.945],
    [0, 0, 1],
    "GeneratorWarning",
    WARNING_TEX,
  );
  rod([2.12, 1.08, 0.65], [2.12, 1.48, 0.65], 0.027, METAL_DARK, "GeneratorExhaust");
  cone(0.075, 0.11, METAL, [2.12, 1.52, 0.65], "GeneratorExhaustCap");
  box([0.2, 0.08, 0.56], SNOW_LIGHT, [1.94, 1.14, 0.65], "GeneratorSnow");

  // Fuel drums with graphic dark bands.
  function drum(x: number, z: number, color: any, tag: string) {
    cylinder(0.19, 0.52, color, [x, 0.54, z], `${tag}Body`, [0, 1, 0], 10);
    torus(0.192, 0.018, METAL_DARK, [x, 0.4, z], `${tag}BandLower`);
    torus(0.192, 0.018, METAL_DARK, [x, 0.68, z], `${tag}BandUpper`);
    cylinder(0.07, 0.012, METAL_DARK, [x, 0.805, z], `${tag}Cap`, [0, 1, 0], 8);
  }

  drum(2.52, 0.26, ORANGE, "FuelDrumA");
  drum(2.62, 0.7, METAL, "FuelDrumB");
  drum(2.29, 0.88, RED, "FuelDrumC");

  box([0.54, 0.39, 0.58], WOOD_LIGHT, [2.3, 0.43, -0.2], "SupplyCrateA");
  box([0.56, 0.06, 0.62], WOOD_DARK, [2.3, 0.57, -0.2], "SupplyCrateLidA");
  box([0.06, 0.34, 0.03], WOOD_DARK, [2.3, 0.43, -0.2], "SupplyCrateBandA");
  box([0.56, 0.06, 0.62], WOOD_LIGHT, [2.3, 0.78, -0.2], "SupplyCrateSnowA");

  box([0.42, 0.31, 0.48], METAL, [2.68, 0.4, -0.8], "EquipmentCaseA");
  box([0.44, 0.05, 0.5], SNOW_LIGHT, [2.68, 0.58, -0.8], "EquipmentCaseSnowA");
  box([0.08, 0.32, 0.04], SAFETY_YELLOW, [2.68, 0.4, -1.05], "EquipmentCaseStripe");

  box([0.48, 0.62, 0.28], ROOF_DARK, [1.62, 0.67, -1.45], "RadioCabinet");
  const radio = plane(
    [0.2, 0.42],
    "#ffffff",
    [1.62, 0.7, -1.31],
    [0, 0, 1],
    "RadioFront",
    RADIO_TEX,
  );
  rod([1.62, 1.0, -1.45], [1.62, 1.42, -1.45], 0.015, METAL_DARK, "RadioAntenna");
  sphere(0.035, RED, [1.62, 1.46, -1.45], "RadioAntennaLight", [1, 1, 1], 6, 4);

  // A compact weather crate on the left side of the cabin.
  box([0.65, 0.4, 0.5], WOOD_LIGHT, [-1.72, 0.46, -1.43], "WeatherCrate");
  box([0.69, 0.06, 0.54], SNOW_LIGHT, [-1.72, 0.68, -1.43], "WeatherCrateSnow");
  rod([-1.72, 0.72, -1.43], [-1.72, 1.17, -1.43], 0.018, METAL_DARK, "ThermometerPole");
  box([0.18, 0.12, 0.08], RED, [-1.72, 1.2, -1.43], "ThermometerHead");
  sphere(0.03, SAFETY_YELLOW, [-1.72, 1.21, -1.38], "ThermometerDot", [1, 1, 1], 6, 4);

  // ---------------------------------------------------------------------------
  // Snowmobile and its two graphic runners on the front-left snow.

  box([1.02, 0.27, 0.56], ROOF_DARK, [-1.92, 0.48, 1.03], "SnowmobileBody");
  box([0.7, 0.19, 0.42], ORANGE, [-1.92, 0.7, 1.0], "SnowmobileNose");
  box([0.52, 0.2, 0.34], WOOD_DARK, [-1.92, 0.82, 0.78], "SnowmobileSeat");
  box([0.72, 0.06, 0.48], SNOW_LIGHT, [-1.92, 0.87, 1.04], "SnowmobileSnow");
  box([0.16, 0.14, 0.22], METAL, [-2.42, 0.6, 1.03], "SnowmobileHeadlight");
  const headlight = sphere(
    0.055,
    "#ffe7a0",
    [-2.52, 0.61, 1.03],
    "SnowmobileHeadlightGlow",
    [1, 0.75, 0.75],
    7,
    4,
  );
  glow(headlight, 1.3);

  rod([-2.34, 0.25, 0.84], [-1.44, 0.25, 0.84], 0.038, METAL_DARK, "SnowRunnerLeft");
  rod([-2.34, 0.25, 1.24], [-1.44, 0.25, 1.24], 0.038, METAL_DARK, "SnowRunnerRight");
  rod([-2.33, 0.27, 0.84], [-2.45, 0.38, 1.03], 0.025, METAL, "SnowSkiTipLeft");
  rod([-2.33, 0.27, 1.24], [-2.45, 0.38, 1.03], 0.025, METAL, "SnowSkiTipRight");
  rod([-1.55, 0.78, 0.83], [-1.55, 1.05, 0.86], 0.025, METAL_DARK, "SnowmobileHandlebarStem");
  rod([-1.78, 1.05, 0.86], [-1.34, 1.05, 0.86], 0.022, METAL_DARK, "SnowmobileHandlebar");
  rod([-1.78, 1.05, 0.86], [-1.86, 1.12, 0.86], 0.018, METAL_DARK, "HandleGripLeft");
  rod([-1.34, 1.05, 0.86], [-1.26, 1.12, 0.86], 0.018, METAL_DARK, "HandleGripRight");

  const windshieldNormal = new THREE.Vector3(0, 0.32, 0.95).normalize();
  const windshield = plane(
    [0.56, 0.24],
    GLASS,
    [-1.92, 0.9, 0.9],
    windshieldNormal,
    "SnowmobileWindshield",
    WINDOW_TEX,
    [0, 1, 0],
  );

  box([0.08, 0.06, 0.52], SAFETY_YELLOW, [-1.92, 0.55, 1.34], "SnowmobileRearStripe");
  box([0.06, 0.04, 0.52], RED, [-1.92, 0.39, 1.32], "SnowmobileLowerStripe");

  // Parallel blue tracks are simple graphic marks pressed into the snow.
  box([0.16, 0.012, 1.15], ICE_DARK, [-2.32, 0.253, 1.68], "TrackMarkLeft");
  box([0.16, 0.012, 1.15], ICE_DARK, [-1.52, 0.253, 1.68], "TrackMarkRight");
  box([0.08, 0.014, 0.33], SNOW_LIGHT, [-2.32, 0.263, 1.4], "TrackSnowBreakA");
  box([0.08, 0.014, 0.27], SNOW_LIGHT, [-1.52, 0.263, 1.77], "TrackSnowBreakB");
  box([0.08, 0.014, 0.3], SNOW_LIGHT, [-2.32, 0.263, 2.14], "TrackSnowBreakC");
  box([0.08, 0.014, 0.32], SNOW_LIGHT, [-1.52, 0.263, 2.01], "TrackSnowBreakD");

  // ---------------------------------------------------------------------------
  // Small practical details: lamps, cable reel, emergency box and snow flags.

  cylinder(0.055, 0.12, METAL_DARK, [1.13, 1.62, 0.46], "FrontLampMount", [0, 0, 1], 8);
  sphere(0.065, "#ffd978", [1.13, 1.62, 0.54], "FrontLamp", [1, 0.9, 0.6], 7, 4);
  glow(b.part(
    new THREE.SphereGeometry(0.06, 7, 4),
    "#ffd978",
    { at: [1.13, 1.62, 0.54], scale: [1, 0.9, 0.6], flat: true, name: "FrontLampGlow", group: GROUP },
  ), 1.4);

  cylinder(0.28, 0.16, WOOD_DARK, [0.95, 0.48, 1.0], "CableReelCore", [1, 0, 0], 10);
  torus(0.29, 0.045, WOOD_LIGHT, [0.95, 0.48, 0.88], "CableReelFront", [1, 0, 0]);
  torus(0.29, 0.045, WOOD_LIGHT, [0.95, 0.48, 1.12], "CableReelBack", [1, 0, 0]);
  rod([0.95, 0.3, 0.72], [0.95, 0.3, 1.28], 0.035, METAL_DARK, "CableReelStand");
  rod([0.95, 0.3, 0.72], [0.95, 0.3, 1.28], 0.035, METAL_DARK, "CableReelStand2");

  box([0.42, 0.52, 0.12], RED, [0.95, 0.58, 0.3], "EmergencyBox");
  box([0.32, 0.28, 0.025], CREAM, [0.95, 0.58, 0.37], "EmergencyLabel");
  const emergency = plane(
    [0.22, 0.18],
    "#ffffff",
    [0.95, 0.58, 0.385],
    [0, 0, 1],
    "EmergencySymbol",
    WARNING_TEX,
  );

  flag(-2.84, 0.82, 0.42, 1, ORANGE, "FrontBoundaryFlag");
  flag(2.82, 0.82, 1.36, -1, RED, "RightBoundaryFlag");

  // A few high-contrast snow facets around the building footprint.
  patch(
    -0.1,
    0.68,
    [
      [-0.68, -0.09],
      [-0.32, -0.2],
      [0.28, -0.16],
      [0.65, 0],
      [0.37, 0.15],
      [-0.25, 0.18],
      [-0.7, 0.08],
    ],
    SNOW_LIGHT,
    "CabinFrontSnowApron",
  );
  patch(
    1.12,
    -1.55,
    [
      [-0.52, -0.1],
      [-0.18, -0.24],
      [0.35, -0.19],
      [0.53, 0.06],
      [0.1, 0.18],
      [-0.4, 0.12],
    ],
    SNOW_BLUE,
    "CabinBackSnowApron",
  );

  // A final pair of foreground ice slabs gives the diorama a graphic, layered edge.
  b.extrude(
    [
      [-0.62, 0],
      [-0.24, -0.08],
      [0.3, -0.03],
      [0.58, 0.12],
      [0.22, 0.2],
      [-0.36, 0.16],
    ],
    {
      at: [-0.78, 0.248, 2.57],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.026,
      bevel: 0.003,
      color: ICE,
      name: "ForegroundIceSlabA",
      group: GROUP,
    },
  );

  b.extrude(
    [
      [-0.55, 0],
      [-0.16, -0.13],
      [0.4, -0.08],
      [0.62, 0.1],
      [0.18, 0.24],
      [-0.42, 0.18],
    ],
    {
      at: [1.98, 0.249, 2.52],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.022,
      bevel: 0.003,
      color: SNOW_BLUE,
      name: "ForegroundIceSlabB",
      group: GROUP,
    },
  );

  return b.root;
}
