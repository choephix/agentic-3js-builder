import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  svg,
  paint,
  noise,
  mix,
  grain,
  catmull,
  polyline,
  spiral,
} from "../../../../src/index";
import type { OutlinePoint, Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Rimebreaker — Frost-forged Battle Axe",
  description:
    "A massive, champion-scale frost axe: swept silver cutting edge, midnight-blue forged plates, ancient gold fittings, luminous ice runes, and a leather-bound haft planted in a fractured frozen plinth.",
};

type V = [number, number, number];
type Finish = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Rimebreaker",
    detail: 1,
    paintSize: 2048,
  });

  const root = b.joint("weaponRoot", { at: [0, 0, 0] });
  const random = rng(80419);

  const C = {
    ink: "#102032",
    abyss: "#152b43",
    navy: "#203c55",
    blue: "#3c6680",
    blueLight: "#6592a8",
    silver: "#c0e1eb",
    white: "#eefbff",
    cyan: "#81efff",
    cyanDeep: "#35bcd8",
    iceDark: "#327eaa",
    gold: "#c4a265",
    goldLight: "#ead39a",
    goldDark: "#735a36",
    leather: "#344653",
    leatherDark: "#1b2936",
    stone: "#203744",
    snow: "#ddeff4",
  };

  const forged = paint((p, n) => {
    const broad = noise(p, 0.21, 11);
    const fine = noise(p, 0.012, 71);
    const shade = Math.max(0, n.y * 0.35 + n.z * 0.24);
    let c = mix("#203d55", "#4b738b", broad * 0.55 + shade);
    c = mix(c, "#10293e", Math.max(0, 0.43 - broad) * 0.7);
    return mix(c, "#7aa1af", Math.max(0, fine - 0.72) * 0.45);
  });

  const cuttingSteel = paint((p, n) => {
    const streak =
      0.5 + 0.5 * Math.sin(p.y * 210 + p.x * 48 + noise(p, 0.025, 7) * 3);
    return mix(
      "#7197b0",
      "#e4f7fb",
      0.42 + 0.26 * Math.abs(n.z) + 0.20 * streak + 0.08 * n.y,
    );
  });

  const oldGold = paint((p, n) => {
    const t = noise(p, 0.055, 20);
    let c = mix("#917045", "#dfc28b", t * 0.72 + Math.max(0, n.y) * 0.25);
    return mix(c, "#526e6d", Math.max(0, 0.38 - t) * 0.5);
  });

  const leather = grain("#233340", "#4c5c68", {
    size: 0.009,
    axis: "y",
    seed: 17,
  });

  const wood = grain("#172c37", "#42616a", {
    size: 0.014,
    axis: "y",
    seed: 9,
  });

  const ice = paint((p, n) => {
    const t = noise(p, 0.07, 62);
    const up = Math.max(0, n.y);
    return mix("#347da6", "#b9eff6", 0.2 + 0.42 * t + up * 0.25);
  });

  const stone = paint((p, n) => {
    const t = noise(p, 0.14, 29);
    return mix(
      "#162c39",
      "#5a8592",
      t * 0.56 + Math.max(0, n.y) * 0.18,
    );
  });

  const snow = paint((p, n) =>
    mix("#a8cbd8", "#f3fbff", 0.50 + 0.28 * n.y + 0.16 * noise(p, 0.03, 3)),
  );

  function part(
    geometry: THREE.BufferGeometry,
    color: Finish,
    at: V,
    name: string,
    options: {
      scale?: V;
      rotation?: V;
      dir?: V;
      axis?: "x" | "y" | "z";
      texture?: THREE.Texture;
    } = {},
  ) {
    return b.part(geometry, color, {
      at,
      bone: root,
      name,
      flat: true,
      ...options,
    });
  }

  function box(
    at: V,
    size: V,
    color: Finish,
    name: string,
    rotation: V = [0, 0, 0],
  ) {
    return part(new THREE.BoxGeometry(...size), color, at, name, { rotation });
  }

  function plate(
    outline: OutlinePoint[],
    at: V,
    thickness: number,
    color: Finish,
    name: string,
    bevel = 0,
  ) {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      smoothing: 0,
      color,
      bone: root,
      name,
    });
  }

  function rod(
    a: V,
    end: V,
    radius: number,
    color: Finish,
    name: string,
  ) {
    return b.rod(a, end, radius, {
      color,
      bone: root,
      sides: 6,
      smooth: false,
      name,
    });
  }

  function crystal(
    at: V,
    axis: V,
    radius: number,
    length: number,
    color: Finish,
    name: string,
    luminous = false,
  ) {
    const shape: OutlinePoint[] = [
      [0, 0],
      [radius * 0.78, 0],
      [radius, length * 0.16],
      [radius * 0.82, length * 0.67],
      [0, length],
    ];
    const result = b.lathe(shape, {
      at,
      axis,
      segments: 5,
      spin: 18,
      color,
      bone: root,
      name,
    });
    if (luminous) glow(result, 0.85);
    return result;
  }

  function bolt(at: V, facing: V, radius = 0.014, color: Finish = oldGold) {
    part(
      new THREE.CylinderGeometry(radius, radius, 0.012, 6),
      color,
      at,
      "hexagonalRivet",
      { dir: facing },
    );
  }

  function drawing(
    texture: THREE.Texture,
    at: V,
    size: [number, number],
    side: number,
    name: string,
    luminous = false,
  ) {
    const p = part(
      new THREE.PlaneGeometry(size[0], size[1]),
      "#ffffff",
      at,
      name,
      { texture, dir: [0, 0, side], axis: "z" },
    );
    if (luminous) glow(p, 1.05);
    return p;
  }

  // Drawings are deliberately broad and graphic: they remain legible at game-camera distance.
  const bladeRunes = svg(
    `<svg viewBox="0 0 120 260" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linejoin="miter" stroke-linecap="square">
        <path d="M60 16 L60 127 M60 35 L30 58 L30 87 L60 110
                 M60 35 L90 58 L90 87 L60 110
                 M30 58 L60 76 L90 58 M60 76 L60 110
                 M60 16 L47 30 M60 16 L73 30"
              stroke="#102b44" stroke-width="15"/>
        <path d="M60 16 L60 127 M60 35 L30 58 L30 87 L60 110
                 M60 35 L90 58 L90 87 L60 110
                 M30 58 L60 76 L90 58 M60 76 L60 110
                 M60 16 L47 30 M60 16 L73 30"
              stroke="#41cde8" stroke-width="8"/>
        <path d="M60 20 L60 121 M34 61 L60 79 L86 61"
              stroke="#d9fbff" stroke-width="3.7"/>
        <path d="M40 148 L60 134 L80 148 L60 162 Z
                 M43 184 L60 170 L77 184 M60 170 L60 205
                 M43 221 L60 208 L77 221 L60 244 L43 221"
              stroke="#133249" stroke-width="12"/>
        <path d="M40 148 L60 134 L80 148 L60 162 Z
                 M43 184 L60 170 L77 184 M60 170 L60 205
                 M43 221 L60 208 L77 221 L60 244 L43 221"
              stroke="#81efff" stroke-width="5"/>
      </g>
      <g fill="#baf8ff">
        <path d="M15 105 L20 114 L15 123 L10 114Z"/>
        <path d="M105 105 L110 114 L105 123 L100 114Z"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const iceFractures = svg(
    `<svg viewBox="0 0 100 260" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#c7f6ff" stroke-width="3.2" stroke-linejoin="miter">
        <path d="M76 0 L61 41 L78 67 L50 110 L66 144 L42 184 L55 223 L31 260"/>
        <path d="M61 41 L28 49 L13 73 M50 110 L18 126 L5 154
                 M66 144 L89 165 L99 195 M42 184 L18 196 L6 227"/>
      </g>
      <g fill="none" stroke="#559ec0" stroke-width="2">
        <path d="M69 4 L53 43 L69 68 L42 109 L58 145 L34 184 L47 224 L24 260"/>
      </g>
      <g fill="#e6fdff">
        <path d="M79 81 L84 94 L79 107 L74 94Z"/>
        <path d="M26 151 L30 158 L26 165 L22 158Z"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const snowflakeSeal = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#163750" stroke-width="10">
        <path d="M64 17V111 M23 40L105 88 M23 88L105 40"/>
      </g>
      <g fill="none" stroke="#e5fcff" stroke-width="4.5" stroke-linecap="square">
        <path d="M64 17V111 M23 40L105 88 M23 88L105 40
                 M64 34L52 23 M64 34L76 23 M64 94L52 105 M64 94L76 105
                 M39 49L39 33 M39 49L25 53 M89 79L89 95 M89 79L103 75
                 M39 79L25 75 M39 79L39 95 M89 49L89 33 M89 49L103 53"/>
        <path d="M64 47L79 56V72L64 81L49 72V56Z"/>
      </g>
      <path d="M64 55L72 64L64 73L56 64Z" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const pollRune = svg(
    `<svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#123249" stroke-width="12" stroke-linejoin="miter">
        <path d="M15 40L35 18L55 40L35 62Z M65 19V61 M65 25L84 39L65 53
                 M106 18L91 40L106 62 M106 40H125"/>
      </g>
      <g fill="none" stroke="#81efff" stroke-width="5" stroke-linejoin="miter">
        <path d="M15 40L35 18L55 40L35 62Z M65 19V61 M65 25L84 39L65 53
                 M106 18L91 40L106 62 M106 40H125"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const leatherStamp = svg(
    `<svg viewBox="0 0 100 54" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7H96 M4 47H96" fill="none" stroke="#71818a"
            stroke-width="3" stroke-dasharray="5 7"/>
      <path d="M50 13L65 27L50 41L35 27Z M50 19V35 M42 27H58"
            fill="none" stroke="#82949b" stroke-width="2.7"/>
    </svg>`,
    { size: 192 },
  );

  const haftRune = svg(
    `<svg viewBox="0 0 180 55" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5H175 M5 50H175" stroke="#d2b57b" stroke-width="3" fill="none"/>
      <g fill="none" stroke="#87efff" stroke-width="3.5">
        <path d="M20 12V42L34 27L20 12 M53 12L43 27L53 42L63 27Z
                 M83 12V42 M74 21L83 12L92 21
                 M112 12L101 27L112 42 M101 27H124
                 M146 12V42 M135 20L146 30L157 20"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const plaqueTexture = svg(
    `<svg viewBox="0 0 420 125" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="414" height="119" rx="8"
            fill="#182e40" stroke="#c5a46a" stroke-width="5"/>
      <path d="M23 22H105 M315 22H397 M23 103H105 M315 103H397"
            stroke="#547e91" stroke-width="3"/>
      <text x="210" y="61" text-anchor="middle" font-family="serif"
            font-size="39" font-weight="bold" letter-spacing="5"
            fill="#e9e3c5">RIMEBREAKER</text>
      <text x="210" y="91" text-anchor="middle" font-family="serif"
            font-size="17" letter-spacing="5" fill="#84cfe4">FROST • FORGED</text>
      <path d="M210 12L218 21L210 30L202 21Z" fill="#b3f5ff"/>
    </svg>`,
    { size: 512 },
  );

  const frozenGround = svg(
    `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#79c3d8" stroke-width="3.5">
        <path d="M150 150L124 107L131 82L106 34L111 0
                 M150 150L185 123L225 122L252 82L300 70
                 M150 150L196 172L217 215L266 249L289 300
                 M150 150L137 195L108 218L100 258L65 300
                 M150 150L99 151L71 171L29 161L0 183"/>
        <path d="M124 107L77 89L49 49 M225 122L251 148L297 148
                 M217 215L192 249L185 295 M108 218L74 205L28 232
                 M71 171L65 137L20 112"/>
      </g>
      <g fill="none" stroke="#d7f8ff" stroke-width="1.8">
        <path d="M151 147L128 105L135 82L110 34
                 M153 152L199 171L221 213L269 246
                 M145 151L96 147L68 167L29 157"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------------
  // Head silhouette. A broad, forward-heavy crescent balanced by a hooked poll.
  // ---------------------------------------------------------------------------

  const bladeOutline: OutlinePoint[] = [
    [0.07, 1.82],
    [0.35, 2.02],
    [0.66, 2.22],
    [0.80, 2.48],
    [1.04, 2.20],
    [1.17, 1.93],
    [1.13, 1.68],
    [0.98, 1.40],
    [0.78, 1.15],
    [0.67, 1.38],
    [0.47, 1.56],
    [0.10, 1.62],
  ];

  const mainBlade = plate(
    bladeOutline,
    [0, 0, 0],
    0.19,
    forged,
    "massiveForgedCrescent",
    0.014,
  );

  plate(
    [
      [0.80, 2.48],
      [1.04, 2.20],
      [1.17, 1.93],
      [1.13, 1.68],
      [0.98, 1.40],
      [0.78, 1.15],
      [0.85, 1.52],
      [1.00, 1.75],
      [1.04, 1.94],
      [0.96, 2.17],
      [0.84, 2.31],
    ],
    [0, 0, 0],
    0.202,
    cuttingSteel,
    "wideHonedSilverEdge",
    0.007,
  );

  plate(
    [
      [0.84, 2.31],
      [0.96, 2.17],
      [1.04, 1.94],
      [1.00, 1.75],
      [0.85, 1.52],
      [0.78, 1.37],
      [0.77, 1.54],
      [0.94, 1.78],
      [0.98, 1.94],
      [0.91, 2.15],
      [0.78, 2.28],
    ],
    [0, 0, 0],
    0.211,
    C.blueLight,
    "innerCuttingBevel",
  );

  const pollOutline: OutlinePoint[] = [
    [-0.10, 2.16],
    [-0.36, 2.16],
    [-0.48, 2.29],
    [-0.51, 2.12],
    [-0.88, 2.17],
    [-0.64, 1.98],
    [-0.45, 1.86],
    [-0.32, 1.79],
    [-0.10, 1.79],
  ];

  plate(pollOutline, [0, 0, 0], 0.23, forged, "hookedRearPoll", 0.013);

  plate(
    [
      [-0.88, 2.17],
      [-0.64, 1.98],
      [-0.45, 1.86],
      [-0.32, 1.79],
      [-0.35, 1.91],
      [-0.57, 2.05],
      [-0.73, 2.11],
    ],
    [0, 0, 0],
    0.241,
    cuttingSteel,
    "pollSpikeSharpenedFacet",
    0.004,
  );

  // Raised armor facets on both broad faces.
  for (const side of [1, -1]) {
    const z = side * 0.108;

    plate(
      [
        [0.17, 1.83],
        [0.40, 2.00],
        [0.62, 2.13],
        [0.72, 2.26],
        [0.87, 2.10],
        [0.94, 1.93],
        [0.90, 1.74],
        [0.75, 1.54],
        [0.63, 1.47],
        [0.45, 1.65],
        [0.17, 1.69],
      ],
      [0, 0, z],
      0.018,
      C.navy,
      `insetBladeArmor${side}`,
      0.004,
    );

    plate(
      [
        [0.25, 1.83],
        [0.42, 1.99],
        [0.62, 2.10],
        [0.72, 2.26],
        [0.70, 2.04],
        [0.52, 1.90],
      ],
      [0, 0, side * 0.122],
      0.009,
      C.blue,
      `upperArmorLightFacet${side}`,
    );

    plate(
      [
        [0.25, 1.73],
        [0.48, 1.71],
        [0.68, 1.54],
        [0.79, 1.63],
        [0.67, 1.47],
        [0.46, 1.65],
      ],
      [0, 0, side * 0.122],
      0.01,
      C.blue,
      `lowerArmorLightFacet${side}`,
    );

    plate(
      [
        [0.23, 1.84],
        [0.46, 2.00],
        [0.61, 2.08],
        [0.62, 2.13],
        [0.43, 2.05],
        [0.20, 1.89],
      ],
      [0, 0, side * 0.132],
      0.018,
      oldGold,
      `upperAncientGoldInlay${side}`,
    );

    plate(
      [
        [0.20, 1.69],
        [0.43, 1.66],
        [0.62, 1.48],
        [0.69, 1.51],
        [0.46, 1.72],
        [0.20, 1.75],
      ],
      [0, 0, side * 0.132],
      0.018,
      oldGold,
      `lowerAncientGoldInlay${side}`,
    );

    plate(
      [
        [-0.18, 2.11],
        [-0.37, 2.10],
        [-0.58, 2.09],
        [-0.48, 1.99],
        [-0.30, 1.88],
        [-0.18, 1.88],
      ],
      [0, 0, side * 0.123],
      0.012,
      C.navy,
      `pollInset${side}`,
      0.003,
    );

    rod(
      [-0.20, 2.105, side * 0.14],
      [-0.43, 2.105, side * 0.14],
      0.014,
      oldGold,
      "pollGoldRail",
    );

    drawing(
      bladeRunes,
      [0.745, 1.876, side * 0.136],
      [0.255, 0.555],
      side,
      `greatFrostGlyph${side}`,
      true,
    );

    drawing(
      pollRune,
      [-0.367, 2.008, side * 0.139],
      [0.24, 0.13],
      side,
      `pollRunes${side}`,
      true,
    );

    // Conforming cracks cross the blade's stepped bevel rather than floating above it.
    b.decal(mainBlade, iceFractures, {
      at: [0.988, 1.926, side * 0.10],
      dir: [0, 0, side],
      size: [0.13, 0.60],
      segments: 7,
      lift: 0.004,
      bone: root,
      name: `frozenStressFractures${side}`,
    });

    for (const [x, y] of [
      [0.26, 1.87],
      [0.43, 1.997],
      [0.57, 2.075],
      [0.26, 1.72],
      [0.46, 1.70],
      [0.59, 1.575],
      [-0.24, 2.11],
      [-0.25, 1.9],
      [-0.45, 2.08],
    ]) {
      bolt([x, y, side * 0.148], [0, 0, side], 0.012);
    }

    // Chiseled angular metal ornaments, not a smooth engraved border.
    for (let i = 0; i < 4; i++) {
      const x = 0.39 + i * 0.062;
      const y = 1.872 + i * 0.043;
      plate(
        [
          [-0.018, 0],
          [0, 0.022],
          [0.018, 0],
          [0, -0.015],
        ],
        [x, y, side * 0.136],
        0.013,
        i % 2 ? C.goldLight : oldGold,
        "bladeDiamondChisel",
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Socket: a gold-rimmed shield, visible through the asymmetric head silhouette.
  // ---------------------------------------------------------------------------

  box([0, 1.952, 0], [0.255, 0.46, 0.30], C.abyss, "squareHeadSocket");
  box([0, 2.17, 0], [0.31, 0.075, 0.34], oldGold, "upperSocketClamp");
  box([0, 1.737, 0], [0.31, 0.075, 0.34], oldGold, "lowerSocketClamp");

  const shieldOutline: OutlinePoint[] = [
    [0, 0.325],
    [0.19, 0.215],
    [0.205, -0.075],
    [0.13, -0.25],
    [0, -0.335],
    [-0.13, -0.25],
    [-0.205, -0.075],
    [-0.19, 0.215],
  ];

  const shieldInset: OutlinePoint[] = [
    [0, 0.270],
    [0.143, 0.178],
    [0.155, -0.06],
    [0.10, -0.207],
    [0, -0.278],
    [-0.10, -0.207],
    [-0.155, -0.06],
    [-0.143, 0.178],
  ];

  for (const side of [1, -1]) {
    plate(
      shieldOutline,
      [0, 1.96, side * 0.174],
      0.055,
      oldGold,
      `socketShieldGoldFrame${side}`,
      0.007,
    );

    plate(
      shieldInset,
      [0, 1.96, side * 0.207],
      0.032,
      C.abyss,
      `socketShieldEnamel${side}`,
      0.004,
    );

    plate(
      [
        [0, 0.251],
        [0.123, 0.172],
        [0.08, 0.122],
        [0, 0.185],
        [-0.08, 0.122],
        [-0.123, 0.172],
      ],
      [0, 1.96, side * 0.231],
      0.013,
      C.blue,
      "shieldCrownFacet",
    );

    for (const [x, y] of [
      [-0.14, 2.13],
      [0.14, 2.13],
      [-0.155, 1.91],
      [0.155, 1.91],
      [0, 1.69],
    ]) {
      bolt([x, y, side * 0.241], [0, 0, side], 0.016, cuttingSteel);
    }

    part(
      new THREE.CylinderGeometry(0.134, 0.134, 0.028, 8),
      oldGold,
      [0, 1.972, side * 0.246],
      "octagonalGemSetting",
      { dir: [0, 0, side] },
    );

    const gem = part(
      new THREE.IcosahedronGeometry(0.118, 0),
      C.cyanDeep,
      [0, 1.972, side * 0.264],
      "heartOfWinter",
      { scale: [1, 1.12, 0.67] },
    );
    glow(gem, 0.75);

    const seal = b.decal(gem, snowflakeSeal, {
      at: [0, 1.972, side * 0.35],
      dir: [0, 0, side],
      size: [0.15, 0.15],
      segments: 6,
      lift: 0.002,
      bone: root,
      name: "heartSnowflakeSeal",
    });
    glow(seal, 1.0);

    // Four solid golden claws visibly retain the gem.
    for (const [x, y, dx, dy] of [
      [-0.089, 2.055, 0.028, -0.026],
      [0.089, 2.055, -0.028, -0.026],
      [-0.089, 1.889, 0.028, 0.026],
      [0.089, 1.889, -0.028, 0.026],
    ]) {
      rod(
        [x, y, side * 0.257],
        [x + dx, y + dy, side * 0.313],
        0.017,
        oldGold,
        "gemRetainingClaw",
      );
    }

    plate(
      [
        [0, 0.017],
        [0.022, 0],
        [0, -0.043],
        [-0.022, 0],
      ],
      [0, 1.759, side * 0.239],
      0.014,
      C.cyan,
      "shieldLowerIceDiamond",
    );
  }

  // ---------------------------------------------------------------------------
  // Ice crown and edge accretions: long, few, purposeful crystals.
  // ---------------------------------------------------------------------------

  crystal([0.30, 2.09, 0], [0.24, 1, 0], 0.073, 0.40, ice, "greatCrownCrystal");
  crystal([0.43, 2.15, 0.018], [0.45, 1, 0.08], 0.048, 0.30, C.cyanDeep, "crownInnerLight", true);
  crystal([0.53, 2.19, -0.018], [0.38, 1, -0.10], 0.054, 0.235, ice, "crownOuterCrystal");
  crystal([0.21, 2.12, -0.02], [-0.22, 1, -0.12], 0.047, 0.265, ice, "crownRearCrystal");
  crystal([0.02, 2.225, 0], [0, 1, 0], 0.061, 0.285, ice, "haftCrownSpike");

  crystal([-0.38, 2.14, 0], [-0.45, 1, 0], 0.040, 0.21, ice, "pollFrostHorn");
  crystal([-0.60, 2.09, 0.012], [-0.85, 0.55, 0], 0.037, 0.17, C.cyanDeep, "pollIceSplinter", true);

  for (const side of [1, -1]) {
    plate(
      [
        [0.31, 2.11],
        [0.40, 2.13],
        [0.48, 2.31],
        [0.39, 2.23],
      ],
      [0, 0, side * 0.12],
      0.021,
      ice,
      "iceCrownRootPlate",
    );

    plate(
      [
        [0.79, 1.48],
        [0.86, 1.52],
        [0.92, 1.72],
        [0.88, 1.64],
        [0.85, 1.67],
      ],
      [0, 0, side * 0.128],
      0.018,
      ice,
      "lowerBladeFrostShard",
    );

    crystal(
      [0.68, 1.43, side * 0.055],
      [-0.06, -1, side * 0.1],
      0.021,
      0.115,
      ice,
      "hangingBladeIcicle",
    );

    for (let i = 0; i < 4; i++) {
      const x = 0.35 + i * 0.11;
      const y = 2.03 + i * 0.075;
      part(
        new THREE.OctahedronGeometry(0.022 + i * 0.002, 0),
        i % 2 ? ice : C.silver,
        [x, y, side * 0.15],
        "smallFrostFacet",
        { scale: [1.1, 0.7, 0.5] },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Haft. Actual steel core, interrupted armor, and overlapping bound leather.
  // ---------------------------------------------------------------------------

  b.sweep(
    [[0, 0.255, 0], [0, 2.27, 0]],
    () => [0.058, 0.058],
    {
      color: wood,
      bone: root,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "continuousHaftCore",
    },
  );

  b.lathe(
    [
      [0, 0],
      [0.066, 0],
      [0.066, 0.29],
      [0.055, 0.34],
      [0, 0.34],
    ],
    {
      at: [0, 1.36, 0],
      segments: 8,
      color: forged,
      bone: root,
      name: "upperOctagonalSteelSleeve",
    },
  );

  for (const y of [1.385, 1.625]) {
    b.lathe(
      [
        [0.055, -0.026],
        [0.088, -0.026],
        [0.094, -0.013],
        [0.094, 0.013],
        [0.088, 0.026],
        [0.055, 0.026],
      ],
      {
        at: [0, y, 0],
        segments: 8,
        color: oldGold,
        bone: root,
        name: "upperSleeveGoldCollar",
      },
    );

    for (const side of [1, -1]) {
      bolt([0, y, side * 0.094], [0, 0, side], 0.013, cuttingSteel);
    }
  }

  for (const side of [1, -1]) {
    drawing(
      haftRune,
      [0, 1.497, side * 0.068],
      [0.105, 0.10],
      side,
      "upperSleeveRunicEtching",
      true,
    );
  }

  // A compact flared guard closes the visual gap between grip and axe head.
  plate(
    [
      [-0.22, 0.08],
      [-0.13, 0.025],
      [-0.082, -0.105],
      [0.082, -0.105],
      [0.13, 0.025],
      [0.22, 0.08],
      [0.115, 0.06],
      [0.067, 0.11],
      [-0.067, 0.11],
      [-0.115, 0.06],
    ],
    [0, 1.686, 0],
    0.14,
    forged,
    "frostGuard",
    0.006,
  );

  for (const side of [1, -1]) {
    rod(
      [-0.18, 1.755, side * 0.077],
      [-0.088, 1.676, side * 0.077],
      0.016,
      oldGold,
      "guardLeftGoldEdge",
    );
    rod(
      [0.18, 1.755, side * 0.077],
      [0.088, 1.676, side * 0.077],
      0.016,
      oldGold,
      "guardRightGoldEdge",
    );
  }

  // The main grip has individual slanted leather turns and visible front stitching.
  b.sweep(
    [[0, 0.43, 0], [0, 1.35, 0]],
    0.076,
    {
      color: C.leatherDark,
      bone: root,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "gripUnderbinding",
    },
  );

  for (let i = 0; i < 15; i++) {
    const y = 0.461 + i * 0.059;
    part(
      new THREE.CylinderGeometry(0.082, 0.084, 0.054, 8),
      leather,
      [0, y, 0],
      "overlappingLeatherTurn",
      { rotation: [0, 22.5, -7] },
    );

    for (const side of [1, -1]) {
      drawing(
        leatherStamp,
        [0, y, side * 0.084],
        [0.105, 0.038],
        side,
        "leatherTurnStitching",
      );
      rod(
        [-0.042, y + 0.006, side * 0.087],
        [-0.028, y + 0.014, side * 0.087],
        0.0024,
        C.blueLight,
        "gripLeftStitch",
      );
      rod(
        [0.028, y + 0.014, side * 0.087],
        [0.042, y + 0.006, side * 0.087],
        0.0024,
        C.blueLight,
        "gripRightStitch",
      );
    }
  }

  // The lacing spirals around the grip; it is not just a painted stripe.
  b.sweep(
    spiral(
      [0, 0.457, 0],
      [0.085, 0.457, 0],
      [0, 1, 0],
      { turns: 7.1, pitch: 0.119 },
    ),
    0.004,
    {
      color: C.leatherDark,
      bone: root,
      sides: 5,
      smooth: false,
      caps: "flat",
      name: "continuousGripLacing",
    },
  );

  for (const y of [0.411, 1.352]) {
    b.lathe(
      [
        [0.06, -0.024],
        [0.093, -0.024],
        [0.10, -0.012],
        [0.10, 0.012],
        [0.091, 0.024],
        [0.06, 0.024],
      ],
      {
        at: [0, y, 0],
        segments: 8,
        color: oldGold,
        bone: root,
        name: "leatherGripEndFerrule",
      },
    );
    for (const side of [1, -1]) {
      bolt([0, y, side * 0.099], [0, 0, side], 0.015);
    }
  }

  // A leather keeper and small inset ice badge interrupt the repetitive wrap.
  box([0, 0.997, 0], [0.185, 0.068, 0.176], C.leatherDark, "gripKeeperStrap");
  for (const side of [1, -1]) {
    plate(
      [
        [0, 0.042],
        [0.05, 0],
        [0, -0.042],
        [-0.05, 0],
      ],
      [0, 0.997, side * 0.094],
      0.018,
      oldGold,
      "gripDiamondBadge",
    );
    glow(
      plate(
        [
          [0, 0.027],
          [0.031, 0],
          [0, -0.027],
          [-0.031, 0],
        ],
        [0, 0.997, side * 0.108],
        0.012,
        C.cyanDeep,
        "gripBadgeIce",
      ),
      0.55,
    );
    bolt([-0.074, 0.997, side * 0.097], [0, 0, side], 0.009);
    bolt([0.074, 0.997, side * 0.097], [0, 0, side], 0.009);
  }

  // Pommel: an armored, pointed ferrule buried into the ice, not hovering above it.
  b.lathe(
    [
      [0, 0],
      [0.041, 0.019],
      [0.098, 0.099],
      [0.101, 0.184],
      [0.083, 0.225],
      [0, 0.225],
    ],
    {
      at: [0, 0.167, 0],
      segments: 8,
      spin: 22.5,
      color: forged,
      bone: root,
      name: "armoredGroundedPommel",
    },
  );

  b.lathe(
    [
      [0.072, 0],
      [0.107, 0],
      [0.114, 0.018],
      [0.104, 0.035],
      [0.072, 0.035],
    ],
    {
      at: [0, 0.306, 0],
      segments: 8,
      color: oldGold,
      bone: root,
      name: "pommelGoldGirdle",
    },
  );

  for (const side of [1, -1]) {
    plate(
      [
        [0, 0.054],
        [0.039, 0.007],
        [0, -0.048],
        [-0.039, 0.007],
      ],
      [0, 0.269, side * 0.103],
      0.021,
      C.iceDark,
      "pommelInsetCrystal",
    );
    bolt([0, 0.366, side * 0.083], [0, 0, side], 0.012);
  }

  // ---------------------------------------------------------------------------
  // Setting: a small frozen basalt plinth, split by the weapon's cold.
  // ---------------------------------------------------------------------------

  part(
    new THREE.CylinderGeometry(0.68, 0.705, 0.10, 10),
    stone,
    [0.12, 0.05, 0],
    "basaltPlinthFoot",
  );

  part(
    new THREE.CylinderGeometry(0.657, 0.68, 0.040, 10),
    C.iceDark,
    [0.12, 0.12, 0],
    "frozenPlinthRim",
  );

  part(
    new THREE.CylinderGeometry(0.638, 0.651, 0.035, 10),
    ice,
    [0.12, 0.153, 0],
    "frozenPlinthSurface",
  );

  part(
    new THREE.CircleGeometry(0.626, 10),
    "#ffffff",
    [0.12, 0.172, 0],
    "radialIceCrackDrawing",
    {
      texture: frozenGround,
      dir: [0, 1, 0],
      axis: "z",
    },
  );

  // Broad fractured flagstones leave the central shaft insertion clearly visible.
  const flags: {
    outline: OutlinePoint[];
    x: number;
    z: number;
    angle: number;
  }[] = [
    {
      outline: [[-0.19, -0.14], [0.18, -0.16], [0.21, 0.08], [0.04, 0.17], [-0.21, 0.09]],
      x: -0.28,
      z: -0.21,
      angle: -13,
    },
    {
      outline: [[-0.18, -0.12], [0.18, -0.15], [0.22, 0.02], [0.10, 0.16], [-0.19, 0.12]],
      x: 0.30,
      z: -0.20,
      angle: 9,
    },
    {
      outline: [[-0.20, -0.11], [0.17, -0.15], [0.23, 0.05], [0.04, 0.17], [-0.18, 0.09]],
      x: 0.42,
      z: 0.15,
      angle: -8,
    },
    {
      outline: [[-0.15, -0.10], [0.16, -0.13], [0.20, 0.07], [-0.06, 0.14], [-0.18, 0.02]],
      x: -0.27,
      z: 0.24,
      angle: 18,
    },
  ];

  for (let i = 0; i < flags.length; i++) {
    const f = flags[i];
    const a = (f.angle * Math.PI) / 180;
    b.extrude(f.outline, {
      at: [f.x, 0.177, f.z],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [-Math.sin(a), 0, Math.cos(a)],
      thickness: 0.038,
      bevel: 0.005,
      color: stone,
      bone: root,
      name: `fracturedBasaltFlag${i}`,
    });

    const snowOutline = f.outline.map(
      (v) => [v[0] * 0.87, v[1] * 0.87] as OutlinePoint,
    );

    b.extrude(snowOutline, {
      at: [f.x - 0.015, 0.200, f.z - 0.005],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [-Math.sin(a), 0, Math.cos(a)],
      thickness: 0.011,
      color: snow,
      bone: root,
      name: `flagSnowCap${i}`,
    });
  }

  // A star-shaped insertion fissure wraps the planted pommel.
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    const r0 = 0.069;
    const r1 = 0.15 + (i % 3) * 0.025;
    rod(
      [Math.cos(a) * r0, 0.178, Math.sin(a) * r0],
      [Math.cos(a + 0.06) * r1, 0.180, Math.sin(a + 0.06) * r1],
      0.008,
      C.abyss,
      "pommelInsertionFissure",
    );
    crystal(
      [Math.cos(a) * 0.115, 0.177, Math.sin(a) * 0.115],
      [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5],
      0.016,
      0.045 + (i % 3) * 0.013,
      ice,
      "insertionIceSplinter",
    );
  }

  // Only a few large crystals frame the rear, leaving the front of the axe clear.
  const groundCrystals: { at: V; axis: V; r: number; h: number }[] = [
    { at: [-0.39, 0.185, -0.28], axis: [-0.25, 1, -0.12], r: 0.056, h: 0.27 },
    { at: [-0.32, 0.185, -0.31], axis: [0.15, 1, -0.12], r: 0.040, h: 0.19 },
    { at: [-0.45, 0.18, -0.21], axis: [-0.55, 1, 0.1], r: 0.034, h: 0.14 },
    { at: [0.48, 0.185, -0.28], axis: [0.32, 1, -0.2], r: 0.05, h: 0.235 },
    { at: [0.54, 0.178, -0.17], axis: [0.6, 1, 0.05], r: 0.032, h: 0.145 },
    { at: [0.41, 0.187, -0.32], axis: [-0.2, 1, -0.15], r: 0.034, h: 0.17 },
  ];

  for (let i = 0; i < groundCrystals.length; i++) {
    const c = groundCrystals[i];
    crystal(c.at, c.axis, c.r, c.h, i % 3 === 1 ? C.cyanDeep : ice, `groundCrystal${i}`, i % 3 === 1);
  }

  for (let i = 0; i < 16; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.42 + random() * 0.18;
    const x = 0.12 + Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const size = 0.018 + random() * 0.027;

    part(
      new THREE.DodecahedronGeometry(size, 0),
      i % 4 === 0 ? ice : snow,
      [x, 0.182 + size * 0.23, z],
      "scatteredFrozenRubble",
      {
        scale: [1.35, 0.45, 0.9],
        rotation: [random() * 25, random() * 180, random() * 25],
      },
    );
  }

  // Tiny sharp ice facets catch light around the outer rim.
  const rim = polyline(
    Array.from({ length: 11 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [0.12 + Math.cos(a) * 0.669, 0.125, Math.sin(a) * 0.669];
    }),
    { closed: true },
  );

  b.along(rim, 10, (at) => {
    b.part(new THREE.OctahedronGeometry(0.021, 0), C.silver, {
      at,
      bone: root,
      scale: [1, 0.6, 0.8],
      flat: true,
      name: "rimIceFacet",
    });
  });

  // Front nameplate is subordinate to the weapon and mounted to the base.
  box(
    [0.12, 0.078, 0.668],
    [0.49, 0.14, 0.032],
    C.goldDark,
    "museumPlaqueBacking",
    [-8, 0, 0],
  );

  const plaque = part(
    new THREE.PlaneGeometry(0.475, 0.132),
    "#ffffff",
    [0.12, 0.08, 0.686],
    "weaponNameplate",
    { texture: plaqueTexture, rotation: [-8, 0, 0] },
  );

  // These fasteners sit above the backing but outside the printed title.
  for (const x of [-0.098, 0.338]) {
    bolt([x, 0.080, 0.690], [0, 0.14, 1], 0.007, C.goldLight);
  }

  // A shallow snow lip, with the lettering left uncovered.
  b.sweep(
    catmull([
      [-0.14, 0.166, 0.61],
      [0.02, 0.178, 0.62],
      [0.24, 0.176, 0.62],
      [0.38, 0.164, 0.60],
    ]),
    0.014,
    {
      color: snow,
      bone: root,
      sides: 6,
      caps: "round",
      name: "snowAbovePlaque",
    },
  );

  // Keep authoring handles descriptive in the object tree.
  plaque.mesh.userData.detail = "Enamel title plate riveted into the frozen basalt base";
  root.object.userData.subject = "Fantasy weapon";
  root.object.userData.facing = "+Z";
  root.object.userData.heightMeters = 2.55;

  return b.root;
}
