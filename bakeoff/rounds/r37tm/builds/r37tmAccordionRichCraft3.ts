import * as THREE from "three";
import {
  createBuilder,
  mottle,
  paint,
  noise,
  mix,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented low-poly piano accordion with pearlescent shell cases, burgundy bellows, brass trim, piano keys, bass buttons, straps, and floral inlays.",
};

export default function build() {
  const b = createBuilder({ name: "italianMotherPearlAccordion", detail: 1 });

  const PEARL = paint((p, n) => {
    const grain = noise(p, 0.075, 19);
    const shimmer = 0.5 + 0.5 * Math.sin(p.x * 48 + p.y * 17 + p.z * 31);
    const base = mix("#fff8e8", "#b9ddd7", grain * 0.62 + shimmer * 0.12);
    const warm = n.y > 0.35 ? mix(base, "#fffdf5", 0.22) : base;
    return warm;
  });

  const PEARL_PINK = mottle("#fff1df", "#dba6aa", {
    size: 0.08,
    contrast: 1.3,
    seed: 7,
  });
  const PEARL_BLUE = mottle("#effff5", "#8bbfc0", {
    size: 0.07,
    contrast: 1.15,
    seed: 11,
  });
  const BURGUNDY = "#541c2c";
  const BELLOWS = mottle("#632238", "#24121d", {
    size: 0.12,
    contrast: 1.6,
    seed: 4,
  });
  const DARK = "#231923";
  const IVORY = "#fff4d4";
  const KEY_SHADOW = "#c49d80";
  const GOLD = metal("brass", {
    polish: 0.7,
    tarnish: 0.12,
    verdigris: 0.04,
    seed: 5,
  });
  const ROSE_GOLD = metal("copper", {
    polish: 0.65,
    tarnish: 0.12,
    seed: 8,
  });
  const STEEL = metal("steel", { polish: 0.72, tarnish: 0.08, seed: 3 });

  const floral = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
      <defs>
        <radialGradient id="p"><stop offset="0" stop-color="#fffbe9"/>
          <stop offset=".45" stop-color="#e7a9b4"/><stop offset="1" stop-color="#5d2851"/></radialGradient>
        <linearGradient id="l" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#fff3b0"/><stop offset=".5" stop-color="#b78336"/>
          <stop offset="1" stop-color="#704018"/>
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r="84" fill="#351522" stroke="#e8bf68" stroke-width="5"/>
      <path d="M90 18 C106 52 132 57 158 45 C139 72 142 102 164 120
               C128 111 108 128 90 163 C72 128 52 111 16 120
               C38 101 41 71 22 45 C48 57 74 52 90 18Z"
            fill="url(#p)" stroke="#fff1bd" stroke-width="3"/>
      <g fill="url(#l)" stroke="#fff0ad" stroke-width="2">
        <ellipse cx="90" cy="55" rx="15" ry="29"/>
        <ellipse cx="90" cy="125" rx="15" ry="29"/>
        <ellipse cx="55" cy="90" rx="29" ry="15"/>
        <ellipse cx="125" cy="90" rx="29" ry="15"/>
        <ellipse cx="65" cy="65" rx="12" ry="25" transform="rotate(-45 65 65)"/>
        <ellipse cx="115" cy="65" rx="12" ry="25" transform="rotate(45 115 65)"/>
        <ellipse cx="65" cy="115" rx="12" ry="25" transform="rotate(45 65 115)"/>
        <ellipse cx="115" cy="115" rx="12" ry="25" transform="rotate(-45 115 115)"/>
      </g>
      <circle cx="90" cy="90" r="15" fill="#fff7d2" stroke="#9d572b" stroke-width="4"/>
      <circle cx="84" cy="83" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const rosette = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="56" fill="#381725" stroke="#e7bd65" stroke-width="5"/>
      <g fill="#d899a9" stroke="#fff0d0" stroke-width="3">
        <ellipse cx="60" cy="29" rx="13" ry="25"/>
        <ellipse cx="60" cy="91" rx="13" ry="25"/>
        <ellipse cx="29" cy="60" rx="25" ry="13"/>
        <ellipse cx="91" cy="60" rx="25" ry="13"/>
        <ellipse cx="38" cy="38" rx="11" ry="22" transform="rotate(-45 38 38)"/>
        <ellipse cx="82" cy="38" rx="11" ry="22" transform="rotate(45 82 38)"/>
        <ellipse cx="38" cy="82" rx="11" ry="22" transform="rotate(45 38 82)"/>
        <ellipse cx="82" cy="82" rx="11" ry="22" transform="rotate(-45 82 82)"/>
      </g>
      <circle cx="60" cy="60" r="12" fill="#fff7df" stroke="#bc7049" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 54">
      <rect x="2" y="2" width="236" height="50" rx="12" fill="#351522" stroke="#e8bd61" stroke-width="4"/>
      <text x="120" y="35" text-anchor="middle" font-family="serif" font-size="25"
        font-weight="bold" letter-spacing="3" fill="#fff1bd">VERONA</text>
    </svg>`,
    { size: 256 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    extra: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      flat: true,
      ...extra,
    });

  const cyl = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: any,
    segments = 12,
    extra: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      flat: true,
      ...extra,
    });

  const pearl = (
    radius: number,
    at: [number, number, number],
    color: any = PEARL,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      flat: true,
      scale: [1, 0.72, 0.38],
    });

  // Main instrument proportions: approximately 0.78 m tall, 0.72 m wide, 0.34 m deep.
  const y0 = 0.04;
  const bodyBottom = 0.17;
  const bodyTop = 0.98;
  const bodyHeight = bodyTop - bodyBottom;

  // Heavy pearlescent end cases.
  box([0.17, 0.86, 0.34], [0.35, 0.58, 0], PEARL, {
    name: "leftPearlCase",
  });
  box([0.17, 0.86, 0.34], [-0.35, 0.58, 0], PEARL_PINK, {
    name: "rightPearlCase",
  });

  // Slightly raised front and rear shell plates.
  box([0.025, 0.76, 0.36], [0.255, 0.58, 0.015], PEARL_BLUE);
  box([0.025, 0.76, 0.36], [-0.255, 0.58, 0.015], PEARL);
  box([0.025, 0.76, 0.36], [0.255, 0.58, -0.19], PEARL);
  box([0.025, 0.76, 0.36], [-0.255, 0.58, -0.19], PEARL_PINK);

  // Brass perimeter rails on both cases.
  for (const x of [-0.445, -0.255, 0.255, 0.445]) {
    box([0.018, 0.84, 0.018], [x, 0.58, 0.175], GOLD);
    box([0.018, 0.84, 0.018], [x, 0.58, -0.175], GOLD);
  }
  for (const x of [-0.35, 0.35]) {
    box([0.17, 0.018, 0.018], [x, 0.165, 0.175], GOLD);
    box([0.17, 0.018, 0.018], [x, 0.995, 0.175], GOLD);
    box([0.17, 0.018, 0.018], [x, 0.165, -0.175], GOLD);
    box([0.17, 0.018, 0.018], [x, 0.995, -0.175], GOLD);
  }

  // Central wine-red bellows block.
  box([0.50, 0.67, 0.31], [0, 0.58, 0], BELLOWS, {
    name: "bellowsCore",
  });

  // Bellows folds: tall, chunky vertical ribs with alternating gold piping.
  const folds = [-0.235, -0.19, -0.145, -0.10, -0.055, 0, 0.055, 0.10, 0.145, 0.19, 0.235];
  folds.forEach((x, i) => {
    box([0.018, 0.69, 0.025], [x, 0.58, 0.165], i % 2 ? GOLD : ROSE_GOLD, {
      name: `bellowsFold${i}`,
    });
    box([0.018, 0.69, 0.025], [x, 0.58, -0.165], i % 2 ? GOLD : ROSE_GOLD);
  });
  for (const y of [0.25, 0.91]) {
    box([0.49, 0.025, 0.34], [0, y, 0], GOLD);
  }

  // Bellows corner blocks and leather hinge bands.
  for (const x of [-0.24, 0.24]) {
    box([0.035, 0.70, 0.34], [x, 0.58, 0], BURGUNDY);
    box([0.045, 0.70, 0.025], [x, 0.58, 0.17], GOLD);
    box([0.045, 0.70, 0.025], [x, 0.58, -0.17], GOLD);
  }

  // Decorative front panels, inset slightly toward the viewer.
  box([0.135, 0.39, 0.018], [0.35, 0.69, 0.182], "#5a2335");
  box([0.135, 0.39, 0.018], [-0.35, 0.69, 0.182], "#5a2335");

  // Large floral mother-of-pearl inlay on bass side and smaller rose on keyboard side.
  b.part(new THREE.PlaneGeometry(0.115, 0.25), "#ffffff", {
    at: [0.35, 0.70, 0.195],
    dir: [0, 0, 1],
    axis: "z",
    texture: floral,
    name: "bassFloralInlay",
  });
  b.part(new THREE.PlaneGeometry(0.105, 0.105), "#ffffff", {
    at: [-0.35, 0.79, 0.195],
    dir: [0, 0, 1],
    axis: "z",
    texture: rosette,
    name: "keyboardRoseInlay",
  });
  b.part(new THREE.PlaneGeometry(0.12, 0.027), "#ffffff", {
    at: [-0.35, 0.51, 0.196],
    dir: [0, 0, 1],
    axis: "z",
    texture: label,
    name: "makerLabel",
  });

  // Left-hand bass button board: twelve pearloid buttons in a readable diagonal grid.
  const bassRows = [
    [0.40, 0.84, 0.23],
    [0.40, 0.72, 0.265],
    [0.40, 0.60, 0.23],
    [0.40, 0.48, 0.265],
    [0.40, 0.36, 0.23],
  ];
  bassRows.forEach(([x, y, z], row) => {
    for (let col = 0; col < 2; col++) {
      const yy = y + (col ? 0.045 : 0);
      const zz = z;
      cyl(0.029, 0.018, [x, yy, zz], GOLD, 12, {
        dir: [0, 0, 1],
        axis: "y",
      });
      pearl(0.022, [x, yy, zz + 0.014], row % 2 ? PEARL_BLUE : PEARL_PINK);
      cyl(0.006, 0.021, [x, yy, zz + 0.031], DARK, 8, {
        dir: [0, 0, 1],
        axis: "y",
      });
    }
  });

  // Bass-side grille slots beneath the buttons.
  for (let i = 0; i < 5; i++) {
    box([0.07, 0.012, 0.012], [0.35, 0.34 + i * 0.035, 0.207], GOLD);
  }

  // Right-hand piano keyboard housing.
  box([0.175, 0.61, 0.09], [-0.35, 0.60, 0.205], BURGUNDY);
  box([0.18, 0.64, 0.018], [-0.35, 0.60, 0.258], GOLD);

  // White piano keys, vertically stacked.
  const keyCount = 12;
  const keyH = 0.043;
  for (let i = 0; i < keyCount; i++) {
    const y = 0.335 + i * 0.052;
    box([0.155, keyH, 0.045], [-0.35, y, 0.265], i % 2 ? "#fff9e9" : IVORY, {
      name: `ivoryKey${i}`,
    });
    box([0.158, 0.006, 0.008], [-0.35, y + keyH / 2 + 0.003, 0.291], KEY_SHADOW);
  }

  // Black keys in a piano-like pattern, with intentional gaps.
  const blackAt = [0, 1, 3, 4, 5, 7, 8, 10, 11];
  blackAt.forEach((i, j) => {
    const y = 0.358 + i * 0.052;
    box([0.115, 0.025, 0.052], [-0.35, y, 0.298], DARK, {
      name: `ebonyKey${j}`,
    });
    box([0.10, 0.006, 0.006], [-0.35, y + 0.014, 0.327], GOLD);
  });

  // Keyboard side cheek blocks and end caps.
  box([0.19, 0.035, 0.075], [-0.35, 0.315, 0.245], PEARL_PINK);
  box([0.19, 0.035, 0.075], [-0.35, 0.885, 0.245], PEARL_PINK);
  cyl(0.032, 0.18, [-0.35, 0.30, 0.23], GOLD, 10, {
    dir: [0, 1, 0],
    axis: "y",
  });
  cyl(0.032, 0.18, [-0.35, 0.96, 0.23], GOLD, 10, {
    dir: [0, 1, 0],
    axis: "y",
  });

  // Decorative small pearl rivets around both front panels.
  for (const side of [-1, 1]) {
    const x = side * 0.35;
    const points: [number, number][] = [
      [0.44, 0.15],
      [0.88, 0.15],
      [0.44, 0.48],
      [0.88, 0.48],
      [0.44, 1.02],
      [0.88, 1.02],
    ];
    points.forEach(([y, z], i) => {
      pearl(0.014, [x, y, z], i % 2 ? PEARL_BLUE : PEARL);
      cyl(0.018, 0.008, [x, y, z - 0.012], GOLD, 8, {
        dir: [0, 0, 1],
        axis: "y",
      });
    });
  }

  // Top shoulder rail and two ornate strap anchors.
  box([0.68, 0.035, 0.045], [0, 1.015, 0], GOLD);
  box([0.58, 0.025, 0.035], [0, 0.13, 0], GOLD);
  for (const x of [-0.31, 0.31]) {
    cyl(0.036, 0.025, [x, 1.035, 0.015], GOLD, 12, {
      dir: [0, 1, 0],
      axis: "y",
    });
    pearl(0.026, [x, 1.055, 0.015], PEARL_PINK);
    cyl(0.036, 0.025, [x, 0.12, -0.02], GOLD, 12, {
      dir: [0, 1, 0],
      axis: "y",
    });
  }

  // Rear shoulder straps, dark leather with brass buckle plates.
  box([0.055, 0.79, 0.035], [0.31, 0.58, -0.235], "#301923");
  box([0.055, 0.79, 0.035], [-0.31, 0.58, -0.235], "#301923");
  for (const x of [-0.31, 0.31]) {
    box([0.078, 0.11, 0.012], [x, 0.72, -0.258], GOLD);
    box([0.055, 0.038, 0.014], [x, 0.72, -0.267], DARK);
    box([0.078, 0.11, 0.012], [x, 0.40, -0.258], GOLD);
    box([0.055, 0.038, 0.014], [x, 0.40, -0.267], DARK);
  }

  // Lower feet and small protective corner guards; all touch or nearly touch the floor.
  for (const x of [-0.38, 0.38]) {
    box([0.14, 0.09, 0.23], [x, 0.045, 0], DARK);
    box([0.16, 0.018, 0.25], [x, 0.092, 0], GOLD);
    cyl(0.035, 0.025, [x, 0.105, 0.13], STEEL, 10, {
      dir: [0, 0, 1],
      axis: "y",
    });
  }

  // Accordion bellows fastening pins, repeated along the front edge.
  for (const x of [-0.22, -0.11, 0, 0.11, 0.22]) {
    pearl(0.012, [x, 0.19, 0.19], PEARL);
    pearl(0.012, [x, 0.97, 0.19], PEARL_PINK);
  }

  // A few raised shell chips and jewel-like accents on the end plates.
  const jewelColors = [PEARL_BLUE, PEARL_PINK, "#fff8cb"];
  for (const side of [-1, 1]) {
    const x = side * 0.35;
    for (let i = 0; i < 5; i++) {
      const y = 0.23 + i * 0.17;
      pearl(0.018, [x, y, 0.205], jewelColors[i % jewelColors.length]);
    }
  }

  return b.root;
}
