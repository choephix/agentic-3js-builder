import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A stylized Firewatch-inspired arctic research station with a bright red cabin, snow berms, antenna mast, solar array, fuel drums, warning flags, and warm glowing windows.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#e9f3f5";
  const SNOW_BLUE = "#b7d2dc";
  const SNOW_SHADOW = "#7899aa";
  const ROCK = "#536675";
  const ROCK_DARK = "#354651";
  const RED = "#b9473c";
  const RED_DARK = "#74333a";
  const ROOF = "#2f4854";
  const WOOD = "#8b5c42";
  const WOOD_DARK = "#513b39";
  const BLACK = "#18252c";
  const STEEL = "#617681";
  const STEEL_DARK = "#344951";
  const ORANGE = "#e8783e";
  const YELLOW = "#f4c65d";
  const WINDOW = "#f7bd66";
  const WINDOW_DARK = "#533b36";
  const CREAM = "#f5e6bd";
  const BLUE = "#507c91";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      flat: true,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 10,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      flat: true,
      ...opts,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    scale: [number, number, number] = [1, 1, 1],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      scale,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, z, radius, { color, section: { ngon: 6 }, caps: "flat" });

  const signTexture = svg(
    `<svg viewBox="0 0 256 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="96" rx="8" fill="#f5e6bd"/>
      <rect x="5" y="5" width="246" height="86" rx="5" fill="none" stroke="#74333a" stroke-width="8"/>
      <path d="M30 66 L48 24 L66 66 M37 53 H59" fill="none" stroke="#74333a" stroke-width="7"/>
      <text x="80" y="58" font-family="sans-serif" font-size="29" font-weight="bold" fill="#74333a">POLAR 07</text>
    </svg>`,
    { size: 256 },
  );

  const windowTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#f7bd66"/>
      <path d="M64 0V128 M0 64H128" stroke="#533b36" stroke-width="9"/>
      <path d="M11 14L54 54 M117 14L74 54" stroke="#fff0ad" stroke-width="5" opacity=".8"/>
    </svg>`,
    { size: 128 },
  );

  const panelTexture = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#263d49"/>
      <g stroke="#79a9b6" stroke-width="2" fill="#355d6b">
        <path d="M5 5h70v42H5zM85 5h70v42H85zM5 53h70v42H5zM85 53h70v42H85z"/>
      </g>
      <path d="M80 0V100M0 50H160" stroke="#18252c" stroke-width="4"/>
      <circle cx="80" cy="50" r="7" fill="#f4c65d"/>
    </svg>`,
    { size: 160 },
  );

  // Broad low-poly ice floe and broken perimeter rocks.
  cyl(2.55, 0.18, [0, 0.09, 0], SNOW, 12);
  cyl(2.15, 0.13, [0.18, 0.22, -0.16], SNOW_BLUE, 10);
  sphere(0.72, [-1.65, 0.19, -0.85], ROCK, [1.3, 0.42, 0.8]);
  sphere(0.48, [1.8, 0.17, -0.9], ROCK_DARK, [1.2, 0.38, 0.75]);
  sphere(0.42, [1.65, 0.17, 1.2], ROCK, [0.9, 0.38, 1.2]);
  sphere(0.34, [-1.9, 0.18, 1.0], ROCK_DARK, [1.1, 0.4, 0.8]);

  // Angular snow drifts around the outpost.
  sphere(0.75, [-1.2, 0.32, 0.65], SNOW, [1.8, 0.45, 0.7]);
  sphere(0.7, [1.15, 0.29, 0.55], SNOW, [1.7, 0.38, 0.65]);
  sphere(0.9, [-1.15, 0.28, -1.0], SNOW_BLUE, [1.7, 0.3, 0.7]);
  sphere(0.6, [1.55, 0.27, -0.35], SNOW_BLUE, [1.5, 0.33, 0.65]);

  // Cabin foundation and red prefab walls.
  box([1.95, 0.16, 1.55], [0, 0.39, 0], WOOD_DARK);
  box([1.84, 1.26, 1.45], [0, 1.08, 0], RED);
  box([1.88, 0.09, 1.48], [0, 1.72, 0], RED_DARK);

  // Vertical timber corner posts and horizontal siding bands.
  for (const x of [-0.91, 0.91]) {
    box([0.09, 1.35, 0.11], [x, 1.08, 0.73], WOOD_DARK);
    box([0.09, 1.35, 0.11], [x, 1.08, -0.73], WOOD_DARK);
  }
  for (const y of [0.58, 0.9, 1.22, 1.54]) {
    box([1.78, 0.035, 0.025], [0, y, 0.735], RED_DARK);
  }

  // Snow-loaded split roof.
  box([2.12, 0.14, 0.91], [0, 1.82, 0.43], ROOF, { rotation: [THREE.MathUtils.degToRad(-27), 0, 0] });
  box([2.12, 0.14, 0.91], [0, 1.82, -0.43], ROOF, { rotation: [THREE.MathUtils.degToRad(27), 0, 0] });
  box([2.17, 0.18, 0.38], [0, 2.08, 0], SNOW, { rotation: [0, 0, 0] });
  box([2.05, 0.08, 0.76], [0, 1.91, 0.46], SNOW_BLUE, {
    rotation: [THREE.MathUtils.degToRad(-27), 0, 0],
  });
  box([2.05, 0.08, 0.76], [0, 1.91, -0.46], SNOW_BLUE, {
    rotation: [THREE.MathUtils.degToRad(27), 0, 0],
  });

  // Front door, frame, handle, and little awning.
  box([0.48, 0.92, 0.055], [0.48, 0.83, 0.758], WOOD_DARK);
  box([0.38, 0.82, 0.035], [0.48, 0.84, 0.79], WOOD);
  box([0.06, 0.06, 0.025], [0.61, 0.83, 0.82], YELLOW);
  box([0.7, 0.06, 0.28], [0.48, 1.36, 0.86], ROOF, {
    rotation: [THREE.MathUtils.degToRad(-12), 0, 0],
  });

  // Front windows.
  for (const x of [-0.5, 0.18]) {
    box([0.5, 0.48, 0.045], [x, 1.18, 0.758], WINDOW_DARK);
    const pane = b.part(new THREE.PlaneGeometry(0.41, 0.39), "#ffffff", {
      at: [x, 1.18, 0.786],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      flat: true,
    });
    glow(pane, 1.3);
  }

  // Side window and red emergency panel.
  box([0.055, 0.52, 0.64], [-0.953, 1.2, -0.12], WINDOW_DARK);
  const sideWindow = b.part(new THREE.PlaneGeometry(0.56, 0.4), "#ffffff", {
    at: [-0.986, 1.2, -0.12],
    dir: [-1, 0, 0],
    axis: "z",
    texture: windowTexture,
    flat: true,
  });
  glow(sideWindow, 1.15);
  box([0.045, 0.38, 0.32], [0.956, 1.3, -0.27], ORANGE);
  box([0.052, 0.08, 0.2], [0.986, 1.3, -0.27], CREAM);

  // Front identification sign.
  box([0.8, 0.34, 0.045], [-0.38, 1.86, 0.77], WOOD_DARK);
  b.part(new THREE.PlaneGeometry(0.72, 0.27), "#ffffff", {
    at: [-0.38, 1.86, 0.8],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    flat: true,
  });

  // Chimney with cap and snow rim.
  cyl(0.105, 0.52, [-0.46, 2.13, -0.18], STEEL_DARK, 8);
  cyl(0.15, 0.06, [-0.46, 2.4, -0.18], BLACK, 8);
  cyl(0.18, 0.08, [-0.46, 2.43, -0.18], SNOW, 8);

  // External generator platform and orange generator box.
  box([0.78, 0.12, 0.6], [1.12, 0.34, -0.86], WOOD_DARK);
  box([0.6, 0.42, 0.43], [1.12, 0.61, -0.86], ORANGE);
  box([0.47, 0.04, 0.28], [1.12, 0.84, -0.86], BLACK);
  for (const x of [0.91, 1.33]) cyl(0.055, 0.5, [x, 0.62, -1.1], STEEL_DARK, 8);
  for (const x of [0.91, 1.33]) cyl(0.055, 0.5, [x, 0.62, -0.62], STEEL_DARK, 8);

  // Fuel drums.
  for (const [x, z, c] of [
    [1.66, -0.48, ORANGE],
    [1.66, -0.1, RED],
    [1.66, 0.28, YELLOW],
  ] as [number, number, string][]) {
    cyl(0.16, 0.42, [x, 0.56, z], c, 10);
    cyl(0.165, 0.025, [x, 0.775, z], STEEL_DARK, 10);
    cyl(0.165, 0.025, [x, 0.35, z], STEEL_DARK, 10);
    box([0.02, 0.26, 0.035], [x + 0.14, 0.56, z], BLACK);
  }

  // Communications mast behind the cabin.
  rod([-0.7, 1.68, -0.55], [-0.7, 3.18, -0.55], 0.028, STEEL_DARK);
  rod([-0.7, 1.68, -0.55], [-0.94, 1.68, -0.55], 0.025, STEEL_DARK);
  rod([-0.7, 1.68, -0.55], [-0.46, 1.68, -0.55], 0.025, STEEL_DARK);
  rod([-0.7, 2.18, -0.55], [-1.02, 2.48, -0.55], 0.018, STEEL);
  rod([-0.7, 2.18, -0.55], [-0.38, 2.48, -0.55], 0.018, STEEL);
  cyl(0.08, 0.12, [-0.7, 3.2, -0.55], RED, 8);
  sphere(0.075, [-0.7, 3.29, -0.55], YELLOW, [1, 0.7, 1]);

  // Radar dish: mast, angled arm, dish bowl, and signal beacon.
  rod([-0.7, 2.7, -0.55], [-0.7, 3.45, -0.55], 0.025, STEEL);
  cyl(0.09, 0.13, [-0.7, 3.49, -0.55], STEEL_DARK, 8);
  b.part(new THREE.SphereGeometry(0.34, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
    at: [-0.7, 3.62, -0.55],
    rotation: [THREE.MathUtils.degToRad(-22), 0, 0],
    flat: true,
  });
  rod([-0.7, 3.62, -0.55], [-0.7, 4.02, -0.55], 0.014, YELLOW);
  sphere(0.045, [-0.7, 4.04, -0.55], ORANGE);

  // Solar panel frame on the right side.
  for (const x of [0.95, 1.75]) {
    rod([x, 0.45, 1.02], [x, 1.38, 1.02], 0.025, STEEL_DARK);
  }
  rod([0.95, 1.38, 1.02], [1.75, 1.38, 1.02], 0.025, STEEL_DARK);
  rod([0.95, 0.45, 1.02], [1.75, 0.45, 1.02], 0.025, STEEL_DARK);
  const panel = b.part(new THREE.BoxGeometry(1.02, 0.055, 0.72), "#ffffff", {
    at: [1.35, 0.94, 1.02],
    rotation: [THREE.MathUtils.degToRad(-28), 0, 0],
    texture: panelTexture,
    flat: true,
  });
  glow(panel, 0.25);
  for (const x of [1.03, 1.35, 1.67]) {
    box([0.018, 0.04, 0.68], [x, 0.94, 1.02], BLUE, {
      rotation: [THREE.MathUtils.degToRad(-28), 0, 0],
    });
  }

  // Snowmobile parked on the left: runners, body, windshield, and cargo.
  box([0.18, 0.1, 1.48], [-1.35, 0.29, 0.0], BLACK, {
    rotation: [THREE.MathUtils.degToRad(3), 0, 0],
  });
  box([0.18, 0.1, 1.48], [-0.95, 0.29, 0.0], BLACK, {
    rotation: [THREE.MathUtils.degToRad(3), 0, 0],
  });
  box([0.58, 0.28, 0.85], [-1.15, 0.55, 0.02], ORANGE);
  box([0.42, 0.18, 0.5], [-1.15, 0.78, -0.04], RED_DARK);
  b.part(new THREE.PlaneGeometry(0.35, 0.22), "#9ec9d2", {
    at: [-1.15, 0.89, 0.29],
    dir: [0, 0.7, 0.7],
    axis: "z",
    flat: true,
  });
  rod([-1.35, 0.72, 0.28], [-0.95, 0.72, 0.28], 0.025, BLACK);
  box([0.42, 0.28, 0.45], [-1.15, 0.98, -0.28], WOOD_DARK);
  box([0.34, 0.08, 0.38], [-1.15, 1.15, -0.28], SNOW);

  // Wind sock pole and striped sock on the far left.
  rod([-2.0, 0.25, 0.3], [-2.0, 1.65, 0.3], 0.018, STEEL_DARK);
  box([0.08, 0.08, 0.08], [-2.0, 1.68, 0.3], YELLOW);
  for (let i = 0; i < 5; i++) {
    const z = 0.43 + i * 0.14;
    box([0.08, 0.12, 0.16], [-2.0, 1.57 - i * 0.03, z], i % 2 ? CREAM : ORANGE, {
      rotation: [0, THREE.MathUtils.degToRad(12), 0],
    });
  }

  // Warning flags around the station.
  const flagPosts: [number, number][] = [
    [-1.82, 1.55],
    [1.95, 0.82],
    [-1.72, -1.25],
  ];
  for (const [x, z] of flagPosts) {
    rod([x, 0.24, z], [x, 1.06, z], 0.014, STEEL_DARK);
    b.extrude(
      [
        [0, 0],
        [0.32, 0.06],
        [0.22, 0.17],
        [0, 0.22],
      ],
      {
        at: [x, 0.99, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: x < 0 ? ORANGE : YELLOW,
        bevel: 0.004,
      },
    );
  }

  // Antenna guy wires and small snow anchors.
  for (const [x, z] of [
    [-1.55, -0.9],
    [0.25, -1.35],
    [0.1, 0.45],
  ] as [number, number][]) {
    rod([-0.7, 2.6, -0.55], [x, 0.28, z], 0.008, STEEL);
    cyl(0.07, 0.04, [x, 0.25, z], STEEL_DARK, 8);
  }

  // Footprints leading from the door.
  for (let i = 0; i < 8; i++) {
    const z = 0.72 + i * 0.19;
    const x = 0.48 + (i % 2 === 0 ? 0.06 : -0.08);
    box([0.12, 0.012, 0.19], [x, 0.245, z], SNOW_SHADOW, {
      rotation: [0, i % 2 === 0 ? 0.12 : -0.12, 0],
    });
  }

  // Small raised beacon box in the front corner.
  box([0.22, 0.25, 0.22], [-0.92, 0.42, 0.92], STEEL_DARK);
  cyl(0.07, 0.14, [-0.92, 0.62, 0.92], YELLOW, 8);
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 5), ORANGE, {
    at: [-0.92, 0.72, 0.92],
    flat: true,
  }), 1.8);

  // Snow caps on equipment and low wind-carved ridges.
  sphere(0.22, [1.12, 0.86, -0.86], SNOW, [1.5, 0.3, 1.0]);
  sphere(0.18, [1.66, 0.79, -0.48], SNOW, [1.1, 0.25, 0.9]);
  sphere(0.25, [-1.15, 1.19, -0.28], SNOW, [1.6, 0.15, 1.0]);
  sphere(0.32, [0.0, 0.29, 1.42], SNOW, [2.2, 0.22, 0.55]);
  sphere(0.23, [-0.55, 0.29, -1.42], SNOW_BLUE, [2.0, 0.18, 0.5]);

  return b.root;
}
