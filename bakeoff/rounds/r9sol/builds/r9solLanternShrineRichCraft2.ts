import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  polyline,
  rng,
  paint,
  noise,
  mix,
  grain,
  svg,
  type Paint,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Shrine of the Evening Blossom",
  description:
    "An anime-fantasy roadside sanctuary: vermilion torii, sweeping tiled roof, luminous blossom mirror, stone fox guardians, warm lanterns and carefully arranged offerings.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Shrine of the Evening Blossom",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(48219);
  const root = b.joint("shrineRoot", { at: [0, 0, 0] });

  const C = {
    red: "#ad3341",
    scarlet: "#d95753",
    redDark: "#652638",
    roof: "#25354c",
    roofLight: "#465871",
    roofDark: "#172638",
    gold: "#d6ad60",
    goldLight: "#ffe4a0",
    goldDark: "#86613e",
    rope: "#c5a77a",
    ropeDark: "#816749",
    cream: "#f4e7cf",
    ink: "#202435",
    wood: "#593348",
    stone: "#91a3ac",
    stoneLight: "#c3c9c4",
    stoneDark: "#536977",
    moss: "#52776c",
    mossLight: "#819b72",
    jade: "#648d88",
    leaf: "#45746b",
    blossom: "#e997af",
    blossomLight: "#f8c8c4",
    flame: "#ffd181",
    magic: "#c496ff",
    magicLight: "#f7dfff",
    orange: "#eda151",
    orangeLight: "#ffd287",
  };

  const lacquer = paint((p, n) => {
    const t = noise(p, 0.28, 14);
    let col = mix(C.redDark, C.red, 0.55 + 0.3 * t);
    if (n.y > 0.6) col = mix(col, C.scarlet, 0.25);
    if (noise(p, 0.035, 23) > 0.74) col = mix(col, "#eea074", 0.18);
    return col;
  });

  const stone = paint((p, n) => {
    let col = mix(C.stoneDark, C.stoneLight, 0.4 + 0.25 * n.y + 0.2 * noise(p, 0.18, 4));
    if (n.y > 0.35 && noise(p, 0.13, 26) > 0.64)
      col = mix(col, C.moss, 0.4);
    return col;
  });

  const foundation = paint((p, n) => {
    let col = mix("#354958", "#718586", 0.42 + 0.27 * n.y + 0.22 * noise(p, 0.24, 8));
    if (n.y > 0.5 && noise(p, 0.3, 6) > 0.55)
      col = mix(col, C.moss, 0.52);
    return col;
  });

  const roofPaint = paint((p, n) =>
    mix(
      C.roofDark,
      C.roofLight,
      0.27 + 0.34 * Math.max(0, n.y) + 0.16 * noise(p, 0.16, 11),
    ),
  );

  const goldPaint = paint((p, n) =>
    mix(
      C.goldDark,
      C.goldLight,
      0.5 + 0.23 * n.y + 0.13 * noise(p, 0.065, 19),
    ),
  );

  const timber = grain("#422b3c", "#815053", {
    size: 0.018,
    axis: "y",
    seed: 31,
  });

  const soil = paint((p, n) =>
    mix(
      "#354b49",
      "#718376",
      0.45 + 0.18 * n.y + 0.24 * noise(p, 0.14, 41),
    ),
  );

  type Finish = string | Paint;

  function box(
    at: number[],
    size: number[],
    color: Finish,
    rotation: number[] = [0, 0, 0],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function ellipsoid(
    at: number[],
    size: number[],
    color: Finish,
    name?: string,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, 1), color, {
      at,
      scale: size,
      bone: root,
      name,
    });
  }

  function cylinder(
    at: number[],
    top: number,
    bottom: number,
    height: number,
    color: Finish,
    sides = 10,
    dir: number[] = [0, 1, 0],
    name?: string,
  ) {
    return b.part(
      new THREE.CylinderGeometry(top, bottom, height, sides, 1),
      color,
      { at, dir, bone: root, name },
    );
  }

  function torus(
    at: number[],
    radius: number,
    tube: number,
    color: Finish,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, 24), color, {
      at,
      rotation,
      bone: root,
    });
  }

  function rod(a: number[], end: number[], r: number, color: Finish) {
    return b.rod(a, end, r, {
      color,
      bone: root,
      sides: 6,
      smooth: false,
    });
  }

  function drawing(
    at: number[],
    width: number,
    height: number,
    texture: THREE.Texture,
    dir: number[] = [0, 0, 1],
    name?: string,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir,
      axis: "z",
      texture,
      bone: root,
      name,
    });
  }

  function blossom(at: number[], radius: number, front = true) {
    const [x, y, z] = at;
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5;
      const dx = Math.sin(a) * radius * 0.62;
      const dy = Math.cos(a) * radius * 0.62;
      if (front) {
        ellipsoid(
          [x + dx, y + dy, z],
          [radius * 0.43, radius * 0.48, radius * 0.12],
          k % 2 ? C.blossom : C.blossomLight,
        );
      } else {
        ellipsoid(
          [x + dx, y, z + dy],
          [radius * 0.43, radius * 0.12, radius * 0.48],
          k % 2 ? C.blossom : C.blossomLight,
        );
      }
    }
    ellipsoid(at, [radius * 0.18, radius * 0.18, radius * 0.18], C.goldLight);
  }

  // Drawings share the shrine's blossom, crescent and diamond vocabulary.
  const emblem = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#32253e" stroke="#e6bf77" stroke-width="5"/>
      <circle cx="64" cy="64" r="49" fill="none" stroke="#946491" stroke-width="2"/>
      <path d="M64 15 C48 31 52 51 64 58 C76 51 80 31 64 15Z
               M106 88 C100 65 82 59 70 65 C70 80 87 94 106 88Z
               M22 88 C41 94 58 80 58 65 C46 59 28 65 22 88Z"
            fill="#efc8ff" stroke="#ac83d6" stroke-width="3"/>
      <path d="M64 48 L79 64 L64 80 L49 64Z" fill="#fff2c7"/>
      <path d="M64 3 L68 10 L64 17 L60 10Z
               M125 64 L118 68 L111 64 L118 60Z
               M64 125 L60 118 L64 111 L68 118Z
               M3 64 L10 60 L17 64 L10 68Z" fill="#ffe5a4"/>
      <circle cx="64" cy="64" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 384 },
  );

  const doorArt = svg(
    `<svg viewBox="0 0 100 240">
      <rect width="100" height="240" fill="#862e40"/>
      <path d="M9 0V240 M24 0V240 M43 0V240 M65 0V240 M84 0V240"
        stroke="#511f36" stroke-width="2"/>
      <path d="M13 18H87V222H13Z" fill="none" stroke="#d6aa64" stroke-width="4"/>
      <path d="M20 25H80V215H20Z" fill="none" stroke="#efc883" stroke-width="1.5"/>
      <path d="M25 170 Q70 136 42 63 M40 98 Q18 84 26 68
               M48 119 Q74 112 75 92 M43 148 Q19 139 24 121"
        fill="none" stroke="#d9b777" stroke-width="3"/>
      <g fill="#ecc18b" stroke="#8c4a54" stroke-width="1.5">
        <path d="M42 48L49 58L59 56L55 67L62 76L50 78L44 89L37 79L25 78L30 67L26 57L37 58Z"/>
        <path d="M76 82L81 88L88 87L86 94L91 100L83 101L79 109L74 102L66 101L69 94L67 87L74 88Z"/>
        <path d="M24 111L29 117L36 116L34 123L39 129L31 130L27 138L22 131L14 130L17 123L15 116L22 117Z"/>
      </g>
      <path d="M50 185L62 198L50 211L38 198Z" fill="#d8b16c"/>
      <path d="M31 35H69 M31 39H69" stroke="#e9c27e" stroke-width="2"/>
    </svg>`,
    { size: 384 },
  );

  const lanternArt = svg(
    `<svg viewBox="0 0 128 160">
      <rect width="128" height="160" fill="#fbc87c"/>
      <rect x="6" y="6" width="116" height="148" rx="3"
        fill="#ffe4a4" stroke="#82513d" stroke-width="7"/>
      <path d="M15 35H113 M15 125H113 M29 12V148 M99 12V148"
        stroke="#b07b4d" stroke-width="5"/>
      <path d="M64 39 L94 80 L64 121 L34 80Z"
        fill="#df9f61" stroke="#9d664a" stroke-width="4"/>
      <path d="M64 51 C48 61 52 76 64 79 C76 76 80 61 64 51Z
               M87 95 C84 80 73 77 67 82 C67 92 77 100 87 95Z
               M41 95 C51 100 61 92 61 82 C55 77 44 80 41 95Z"
        fill="#fff3bf"/>
      <circle cx="64" cy="82" r="5" fill="#fff9db"/>
      <path d="M13 15L23 25 M105 25L115 15 M13 145L23 135 M105 135L115 145"
        stroke="#865442" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const plaqueArt = svg(
    `<svg viewBox="0 0 128 192">
      <rect x="4" y="4" width="120" height="184" rx="8" fill="#233c47"
        stroke="#e7bd76" stroke-width="7"/>
      <rect x="15" y="15" width="98" height="162" rx="2"
        fill="none" stroke="#9f7d54" stroke-width="2"/>
      <path d="M64 20L72 31L64 42L56 31Z" fill="#e6c384"/>
      <text x="64" y="92" text-anchor="middle" font-family="serif"
        font-size="48" font-weight="bold" fill="#f4deb2">花</text>
      <text x="64" y="147" text-anchor="middle" font-family="serif"
        font-size="48" font-weight="bold" fill="#f4deb2">守</text>
      <path d="M43 165H85" stroke="#e7bd76" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const clothArt = svg(
    `<svg viewBox="0 0 256 96">
      <rect width="256" height="96" fill="#57365e"/>
      <path d="M0 9H256 M0 84H256" stroke="#dcbd83" stroke-width="5"/>
      <path d="M0 17H256 M0 76H256" stroke="#9c7685" stroke-width="2"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const x = i * 36 - 3;
        return `<path d="M${x} 48l14 -17l14 17l-14 17Z" fill="none" stroke="#b68bac" stroke-width="2"/>
          <path d="M${x + 14} 39l7 9l-7 9l-7 -9Z" fill="#d7b480"/>`;
      }).join("")}
    </svg>`,
    { size: 384 },
  );

  const bottleLabel = svg(
    `<svg viewBox="0 0 96 144">
      <rect width="96" height="144" rx="3" fill="#f1e3c6"/>
      <rect x="5" y="5" width="86" height="134" fill="none" stroke="#b39669" stroke-width="3"/>
      <circle cx="48" cy="36" r="20" fill="#a84558"/>
      <path d="M48 21L53 31L65 31L58 41L61 52L48 47L35 52L38 41L31 31L43 31Z"
        fill="#f6dfb4"/>
      <text x="48" y="87" text-anchor="middle" font-family="serif"
        font-size="30" fill="#48323b">奉納</text>
      <path d="M22 104H74 M29 114H67 M35 124H61"
        stroke="#ab8a64" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const foxFace = svg(
    `<svg viewBox="0 0 160 88">
      <path d="M17 32Q38 17 62 31Q39 27 24 39Z
               M143 32Q122 17 98 31Q121 27 136 39Z" fill="#394956"/>
      <path d="M26 48l12 6l12 -4 M134 48l-12 6l-12 -4"
        stroke="#ab5965" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M70 54L80 61L90 54L80 50Z" fill="#394956"/>
      <path d="M80 61V70 M65 70Q72 79 80 70Q88 79 95 70"
        stroke="#4b5960" stroke-width="3" fill="none"/>
      <path d="M80 11L87 21L80 29L73 21Z" fill="#d8b572"/>
    </svg>`,
    { size: 256 },
  );

  const petalArt = svg(
    `<svg viewBox="0 0 48 64">
      <path d="M24 61C5 49 0 29 9 12L19 17L24 3L30 16L40 11C52 32 42 49 24 61Z"
        fill="#eeadba"/>
      <path d="M24 56Q21 31 24 17" fill="none" stroke="#ffd5d2" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  // A shallow, irregular roadside patch, rather than an oversized scenic pedestal.
  const groundOutline = [
    [-2.48, -1.22],
    [-2.22, -1.77],
    [-1.2, -1.89],
    [1.17, -1.87],
    [2.27, -1.57],
    [2.48, -0.7],
    [2.42, 1.34],
    [1.99, 1.82],
    [0.68, 1.99],
    [-1.62, 1.87],
    [-2.42, 1.34],
  ];
  b.extrude(groundOutline, {
    at: [0, 0.095, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.19,
    bevel: 0.035,
    color: foundation,
    bone: root,
    name: "roadsideRockShelf",
  });

  b.extrude(
    groundOutline.map(([x, z]) => [x * 0.965, z * 0.965]),
    {
      at: [0, 0.189, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.025,
      color: soil,
      bone: root,
      name: "mossAndEarth",
    },
  );

  // Processional stones lead through the gate toward the shrine.
  for (let i = 0; i < 4; i++) {
    const z = 1.68 - i * 0.37;
    box(
      [i % 2 ? 0.018 : -0.018, 0.224, z],
      [1.05, 0.085, 0.315],
      stone,
      [0, i % 2 ? -1.5 : 1.5, 0],
      `pathStone${i + 1}`,
    );
  }
  box([0, 0.275, 0.31], [1.55, 0.15, 0.44], stone);
  box([0, 0.375, -0.02], [1.82, 0.17, 0.5], stone);
  box([0, 0.46, -0.8], [1.94, 0.27, 1.32], foundation);
  box([0, 0.615, -0.8], [2.03, 0.09, 1.4], stone);
  box([0, 0.672, -0.8], [1.74, 0.06, 1.22], timber);

  // Torii: substantial tapered pillars, two crossbars, upturned black kasagi.
  const gateZ = 0.72;
  const gateX = 1.67;
  for (const s of [-1, 1]) {
    const x = s * gateX;
    cylinder([x, 0.29, gateZ], 0.255, 0.285, 0.18, foundation, 8);
    cylinder([x, 0.43, gateZ], 0.215, 0.23, 0.14, stone, 10);
    cylinder([x, 1.915, gateZ], 0.16, 0.19, 2.85, lacquer, 12);
    cylinder([x, 0.56, gateZ], 0.19, 0.19, 0.2, C.roofDark, 12);
    cylinder([x, 0.675, gateZ], 0.194, 0.194, 0.045, goldPaint, 12);
    cylinder([x, 2.82, gateZ], 0.173, 0.173, 0.1, C.redDark, 12);
    cylinder([x, 3.29, gateZ], 0.181, 0.181, 0.095, goldPaint, 12);

    const fasteners = b.ring(frame([x, 0.615, gateZ], [0, 1, 0]), {
      count: 8,
      radius: 0.195,
    });
    for (const f of fasteners.items)
      b.stick(new THREE.SphereGeometry(0.012, 6, 4), C.gold, f);

    box([x, 2.965, gateZ + 0.191], [0.1, 0.23, 0.018], goldPaint);
    for (const y of [2.89, 3.035])
      cylinder([x, y, gateZ + 0.211], 0.023, 0.023, 0.021, C.goldLight, 8, [0, 0, 1]);
  }

  box([0, 2.92, gateZ], [3.86, 0.19, 0.23], lacquer, [0, 0, 0], "nuki");
  box([0, 3.14, gateZ], [0.145, 0.43, 0.19], lacquer, [0, 0, 0], "gakuzuka");
  for (const s of [-1, 1]) {
    box([s * 1.965, 2.92, gateZ], [0.11, 0.205, 0.255], C.roofDark);
    box([s * 1.968, 2.92, gateZ + 0.137], [0.1, 0.16, 0.016], goldPaint);
  }

  const curvedBeam = [
    [-2.18, 0.2],
    [-1.7, 0.08],
    [-0.85, -0.025],
    [0, -0.055],
    [0.85, -0.025],
    [1.7, 0.08],
    [2.18, 0.2],
    [2.105, -0.005],
    [1.7, -0.12],
    [0.85, -0.215],
    [0, -0.25],
    [-0.85, -0.215],
    [-1.7, -0.12],
    [-2.105, -0.005],
  ];
  b.extrude(curvedBeam, {
    at: [0, 3.51, gateZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.33,
    bevel: 0.016,
    color: lacquer,
    bone: root,
    name: "upturnedShimaki",
  });
  b.extrude(
    curvedBeam.map(([x, y]) => [x * 1.035, y * 0.62]),
    {
      at: [0, 3.65, gateZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.42,
      bevel: 0.018,
      color: roofPaint,
      bone: root,
      name: "blackKasagi",
    },
  );

  b.sweep(
    polyline([
      [-2.245, 3.77, gateZ + 0.218],
      [-1.76, 3.694, gateZ + 0.218],
      [-0.87, 3.63, gateZ + 0.218],
      [0, 3.611, gateZ + 0.218],
      [0.87, 3.63, gateZ + 0.218],
      [1.76, 3.694, gateZ + 0.218],
      [2.245, 3.77, gateZ + 0.218],
    ]),
    0.016,
    { color: goldPaint, bone: root, sides: 6, caps: "flat" },
  );

  for (const s of [-1, 1]) {
    box([s * 2.14, 3.66, gateZ], [0.09, 0.21, 0.44], goldPaint, [0, 0, s * 16]);
    b.extrude(
      [[0, 0], [0.11, 0.025], [0.145, 0.14], [0.05, 0.1]],
      {
        at: [s * 2.08, 3.74, gateZ],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.35,
        color: C.gold,
        bone: root,
      },
    );
  }

  box([0, 3.125, gateZ + 0.205], [0.34, 0.47, 0.075], C.goldDark);
  drawing([0, 3.125, gateZ + 0.246], 0.31, 0.445, plaqueArt, [0, 0, 1], "gateDedication");

  // Shimenawa: a heavy bowed rope with twisting strands, knots and folded shide.
  const ropePath = catmull([
    [-1.64, 2.82, gateZ + 0.17],
    [-1.14, 2.69, gateZ + 0.19],
    [-0.56, 2.585, gateZ + 0.2],
    [0, 2.55, gateZ + 0.2],
    [0.56, 2.585, gateZ + 0.2],
    [1.14, 2.69, gateZ + 0.19],
    [1.64, 2.82, gateZ + 0.17],
  ]);
  b.sweep(ropePath, 0.047, {
    color: C.rope,
    bone: root,
    sides: 8,
    caps: "flat",
    name: "sacredRope",
  });

  for (let strand = 0; strand < 3; strand++) {
    const pts: number[][] = [];
    for (let j = 0; j <= 88; j++) {
      const t = j / 88;
      const p = ropePath.at(t);
      const a = t * Math.PI * 2 * 13 + strand * Math.PI * 2 / 3;
      pts.push([p.x, p.y + Math.cos(a) * 0.039, p.z + Math.sin(a) * 0.039]);
    }
    b.sweep(polyline(pts), 0.008, {
      color: strand === 1 ? C.ropeDark : C.goldLight,
      bone: root,
      sides: 4,
      caps: "flat",
    });
  }

  function shide(x: number, y: number, z: number, size: number) {
    rod([x, y + 0.02, z], [x, y - 0.09 * size, z], 0.009, C.ropeDark);
    b.extrude(
      [
        [-0.055, 0],
        [0.065, 0],
        [0.065, -0.09],
        [0.025, -0.09],
        [0.025, -0.17],
        [0.105, -0.17],
        [0.105, -0.265],
        [0.045, -0.265],
        [0.045, -0.345],
        [-0.035, -0.345],
        [-0.035, -0.22],
        [0.015, -0.22],
        [0.015, -0.14],
        [-0.055, -0.14],
      ].map(([u, v]) => [u * size, v * size]),
      {
        at: [x, y - 0.035, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: C.cream,
        bone: root,
        name: "foldedShide",
      },
    );
    box([x + 0.004 * size, y - 0.165 * size, z + 0.009], [0.1 * size, 0.014, 0.009], "#d8cbb7");
  }

  for (const t of [0.14, 0.32, 0.5, 0.68, 0.86]) {
    const p = ropePath.at(t);
    shide(p.x, p.y, p.z + 0.012, t === 0.5 ? 0.87 : 0.72);
  }
  for (const s of [-1, 1]) {
    ellipsoid([s * 1.62, 2.805, gateZ + 0.19], [0.09, 0.085, 0.065], C.rope);
    for (let k = 0; k < 4; k++) {
      b.sweep(
        [[s * 1.62 + (k - 1.5) * 0.024, 2.78, gateZ + 0.19],
         [s * 1.65 + (k - 1.5) * 0.027, 2.51 - k * 0.008, gateZ + 0.21]],
        [0.018, 0.008],
        { color: C.rope, bone: root, sides: 5 },
      );
    }
  }

  // Main shrine: raised timber sanctuary, protected by deep eaves.
  const shrineZ = -0.81;
  box([0, 1.49, shrineZ - 0.42], [1.54, 1.65, 0.09], timber);
  box([0, 1.49, shrineZ], [1.37, 1.58, 0.86], C.wood);
  box([0, 1.53, shrineZ + 0.446], [1.28, 1.42, 0.035], C.roofDark);

  for (const s of [-1, 1]) {
    for (const z of [shrineZ - 0.5, shrineZ + 0.5]) {
      box([s * 0.75, 1.505, z], [0.155, 1.68, 0.155], lacquer);
      box([s * 0.75, 0.755, z], [0.185, 0.18, 0.185], C.roofDark);
      box([s * 0.75, 0.85, z], [0.188, 0.034, 0.188], goldPaint);
      box([s * 0.75, 2.19, z], [0.19, 0.13, 0.19], goldPaint);
    }
    box([s * 0.77, 2.32, shrineZ], [0.2, 0.12, 1.26], lacquer);
    box([s * 0.79, 1.44, shrineZ], [0.085, 1.14, 0.92], timber);

    // Side slats are visible in three-quarter views.
    for (let j = 0; j < 6; j++)
      box([s * 0.838, 1.5, shrineZ - 0.38 + j * 0.152], [0.03, 1.11, 0.035], C.redDark);
    for (const y of [0.93, 1.5, 2.075])
      box([s * 0.858, y, shrineZ], [0.035, 0.045, 0.94], goldPaint);
  }

  box([0, 2.31, shrineZ + 0.515], [1.79, 0.18, 0.17], lacquer);
  box([0, 2.38, shrineZ + 0.614], [1.73, 0.04, 0.035], goldPaint);
  box([0, 0.735, shrineZ + 0.52], [1.68, 0.13, 0.16], lacquer);
  box([0, 0.814, shrineZ + 0.598], [1.6, 0.018, 0.023], goldPaint);

  // Door leaves flank the luminous object, leaving its face unobstructed.
  for (const s of [-1, 1]) {
    box([s * 0.485, 1.51, -0.254], [0.355, 1.29, 0.065], lacquer);
    drawing([s * 0.485, 1.51, -0.218], 0.325, 1.235, doorArt);
    for (const y of [1.03, 1.95]) {
      box([s * 0.675, y, -0.205], [0.095, 0.055, 0.018], goldPaint);
      cylinder([s * 0.706, y, -0.19], 0.012, 0.012, 0.032, C.goldLight, 6, [0, 0, 1]);
    }
    torus([s * 0.325, 1.46, -0.17], 0.043, 0.008, goldPaint);
    cylinder([s * 0.325, 1.507, -0.173], 0.015, 0.015, 0.028, C.goldLight, 8, [0, 0, 1]);
  }

  // The sacred mirror is an unmistakable fantasy focal point inside the little shrine.
  cylinder([0, 1.63, -0.32], 0.3, 0.3, 0.07, goldPaint, 24, [0, 0, 1], "blossomMirrorFrame");
  torus([0, 1.63, -0.275], 0.278, 0.022, C.goldLight);
  glow(drawing([0, 1.63, -0.268], 0.535, 0.535, emblem, [0, 0, 1], "sacredBlossomMirror"), 0.8);
  cylinder([0, 1.233, -0.335], 0.057, 0.071, 0.24, goldPaint, 8);
  box([0, 1.096, -0.33], [0.28, 0.055, 0.16], goldPaint);
  ellipsoid([0, 1.935, -0.292], [0.035, 0.06, 0.025], C.magicLight);

  for (const s of [-1, 1]) {
    rod([s * 0.185, 1.107, -0.305], [s * 0.243, 1.32, -0.32], 0.015, C.gold);
    b.spike([s * 0.24, 1.3, -0.32], [s * 0.075, 0.1, 0], 0.11, 0.036, {
      color: C.gold,
      bone: root,
      sides: 5,
    });
  }

  // Gable and tiled roof, with upturned eaves and a blue-black ridge.
  b.extrude(
    [[-0.89, 0], [0, 0.59], [0.89, 0]],
    {
      at: [0, 2.39, shrineZ + 0.535],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      color: lacquer,
      bone: root,
      name: "frontGable",
    },
  );

  const roofOutline = [
    [-1.43, 0.17],
    [-1.2, 0.16],
    [-0.9, 0.25],
    [0, 0.64],
    [0.9, 0.25],
    [1.2, 0.16],
    [1.43, 0.17],
    [1.34, 0.02],
    [1.14, 0.035],
    [0.85, 0.125],
    [0, 0.49],
    [-0.85, 0.125],
    [-1.14, 0.035],
    [-1.34, 0.02],
  ];
  b.extrude(roofOutline, {
    at: [0, 2.5, shrineZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 1.67,
    bevel: 0.012,
    color: roofPaint,
    bone: root,
    name: "sweepingShrineRoof",
  });

  // Broad tile courses keep the low-poly roof legible.
  for (let j = 0; j < 12; j++) {
    const z = shrineZ - 0.77 + j * 0.14;
    b.sweep(
      polyline([
        [-1.43, 2.677, z],
        [-1.2, 2.665, z],
        [-0.9, 2.758, z],
        [0, 3.152, z],
        [0.9, 2.758, z],
        [1.2, 2.665, z],
        [1.43, 2.677, z],
      ]),
      0.029,
      {
        color: j % 3 === 0 ? C.roofLight : C.roof,
        bone: root,
        sides: 6,
        caps: "flat",
        name: "roofTileRidge",
      },
    );
  }

  for (const z of [shrineZ - 0.849, shrineZ + 0.849]) {
    b.sweep(
      polyline([
        [-1.43, 2.65, z],
        [-1.18, 2.63, z],
        [-0.88, 2.72, z],
        [0, 3.1, z],
        [0.88, 2.72, z],
        [1.18, 2.63, z],
        [1.43, 2.65, z],
      ]),
      0.041,
      { color: C.roofDark, bone: root, sides: 6, caps: "flat" },
    );
    b.sweep(
      polyline([
        [-1.41, 2.641, z + 0.009],
        [-1.16, 2.617, z + 0.009],
        [-0.87, 2.71, z + 0.009],
        [0, 3.08, z + 0.009],
        [0.87, 2.71, z + 0.009],
        [1.16, 2.617, z + 0.009],
        [1.41, 2.641, z + 0.009],
      ]),
      0.011,
      { color: goldPaint, bone: root, sides: 5 },
    );
  }

  b.sweep([[0, 3.165, -1.78], [0, 3.165, 0.16]], 0.065, {
    color: C.roofDark,
    bone: root,
    sides: 8,
    caps: "flat",
    name: "roofRidgeCap",
  });
  for (let j = 0; j < 8; j++)
    cylinder([0, 3.164, -1.67 + j * 0.235], 0.071, 0.071, 0.027, C.roofLight, 8, [0, 0, 1]);

  for (const z of [-1.795, 0.18]) {
    cylinder([0, 3.164, z], 0.077, 0.077, 0.032, goldPaint, 10, [0, 0, 1]);
    ellipsoid([0, 3.165, z + 0.02], [0.029, 0.029, 0.014], C.magic);
  }

  cylinder([0, 2.66, 0.058], 0.112, 0.112, 0.026, goldPaint, 12, [0, 0, 1]);
  drawing([0, 2.66, 0.075], 0.19, 0.19, emblem);

  for (const s of [-1, 1]) {
    b.sweep(
      bezier(
        [s * 1.27, 2.66, shrineZ + 0.82],
        [s * 1.45, 2.75, shrineZ + 0.82],
        [s * 1.47, 2.91, shrineZ + 0.82],
      ),
      [0.045, 0],
      { color: goldPaint, bone: root, sides: 6, caps: "point" },
    );
    for (let i = 0; i < 3; i++) {
      const x = s * (0.88 + i * 0.17);
      box([x, 2.465, shrineZ + 0.54], [0.065, 0.12, 0.23], lacquer);
      box([x, 2.405, shrineZ + 0.62], [0.11, 0.035, 0.15], goldPaint);
    }
  }

  // Bell and bell-pull, offset beside the doorway rather than across the mirror.
  const bellX = -0.56;
  rod([bellX, 2.29, -0.11], [bellX, 2.15, -0.11], 0.012, C.goldDark);
  b.lathe(
    [
      [0, 0.12], [0.045, 0.105], [0.061, 0.045], [0.092, 0],
      [0.092, -0.022], [0.073, -0.025], [0.053, 0.039],
      [0.029, 0.088], [0, 0.09],
    ],
    { at: [bellX, 2.025, -0.11], color: goldPaint, bone: root, segments: 10 },
  );
  ellipsoid([bellX, 2.007, -0.11], [0.017, 0.025, 0.017], C.goldDark);
  b.sweep([[bellX, 1.997, -0.11], [bellX, 1.48, -0.09]], 0.012, {
    color: C.rope,
    bone: root,
    sides: 6,
  });
  torus([bellX, 1.459, -0.085], 0.044, 0.014, C.rope);

  // Twin stone lanterns: layered bases, turned stems, bright paper chambers.
  function lantern(x: number, z: number, side: number) {
    box([x, 0.252, z], [0.57, 0.11, 0.56], foundation);
    box([x, 0.332, z], [0.46, 0.07, 0.46], stone);
    b.lathe(
      [
        [0, 0], [0.18, 0], [0.18, 0.07], [0.117, 0.12],
        [0.093, 0.55], [0.135, 0.62], [0.135, 0.69], [0, 0.69],
      ],
      { at: [x, 0.37, z], color: stone, bone: root, segments: 8 },
    );
    cylinder([x, 0.53, z], 0.128, 0.14, 0.05, C.stoneDark, 8);
    box([x, 1.065, z], [0.47, 0.11, 0.47], stone);
    box([x, 1.13, z], [0.41, 0.045, 0.41], C.stoneDark);

    glow(box([x, 1.325, z], [0.3, 0.35, 0.3], C.flame), 0.8);
    for (const dx of [-0.19, 0.19]) {
      for (const dz of [-0.19, 0.19])
        box([x + dx, 1.333, z + dz], [0.064, 0.41, 0.064], stone);
    }

    glow(drawing([x, 1.327, z + 0.182], 0.292, 0.35, lanternArt), 0.7);
    glow(drawing([x + side * 0.182, 1.327, z], 0.292, 0.35, lanternArt, [side, 0, 0]), 0.7);
    box([x, 1.54, z], [0.46, 0.075, 0.46], stone);

    b.lathe(
      [
        [0, 0.22], [0.1, 0.17], [0.2, 0.075], [0.32, 0.015],
        [0.37, 0.04], [0.34, -0.035], [0.23, -0.048], [0, -0.048],
      ],
      { at: [x, 1.625, z], color: roofPaint, bone: root, segments: 4, spin: 45 },
    );
    cylinder([x, 1.84, z], 0.073, 0.11, 0.065, stone, 8);
    ellipsoid([x, 1.895, z], [0.07, 0.078, 0.07], stone);
    cylinder([x, 1.97, z], 0.017, 0.038, 0.068, goldPaint, 6);

    for (const dx of [-0.16, 0.16])
      cylinder([x + dx, 1.07, z + 0.244], 0.012, 0.012, 0.015, C.gold, 6, [0, 0, 1]);
    b.extrude(
      [[-0.055, 0], [0, 0.075], [0.055, 0], [0, -0.075]],
      {
        at: [x, 0.72, z + 0.102],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: goldPaint,
        bone: root,
      },
    );
  }
  lantern(-1.29, -0.47, -1);
  lantern(1.29, -0.47, 1);

  // Carved fox guardians are static shrine furniture, with big ears and curled tails.
  function fox(x: number, z: number, s: number) {
    box([x, 0.285, z], [0.5, 0.16, 0.57], foundation);
    box([x, 0.385, z], [0.47, 0.055, 0.53], stone);
    box([x, 0.42, z + 0.09], [0.35, 0.045, 0.32], C.stoneDark);

    ellipsoid([x, 0.615, z - 0.025], [0.18, 0.225, 0.18], stone);
    b.sweep(
      catmull([
        [x, 0.48, z - 0.14],
        [x + s * 0.22, 0.51, z - 0.17],
        [x + s * 0.245, 0.73, z - 0.19],
        [x + s * 0.13, 0.88, z - 0.15],
        [x + s * 0.045, 0.895, z - 0.1],
      ]),
      [0.086, 0.094, 0.075, 0.045, 0.012],
      { color: stone, bone: root, sides: 7, name: "carvedFoxTail" },
    );

    for (const dx of [-0.115, 0.115]) {
      b.capsule([x + dx, 0.465, z + 0.1], [x + dx, 0.68, z + 0.09], 0.055, {
        color: stone,
        bone: root,
        sides: 6,
      });
      ellipsoid([x + dx, 0.454, z + 0.17], [0.07, 0.045, 0.108], stone);
      for (let j = 0; j < 2; j++)
        box([x + dx - 0.025 + j * 0.048, 0.485, z + 0.223], [0.009, 0.012, 0.041], C.stoneDark);
    }

    const skull = ellipsoid([x, 0.885, z + 0.032], [0.218, 0.172, 0.174], stone, "stoneFoxHead");
    ellipsoid([x, 0.828, z + 0.163], [0.139, 0.077, 0.112], C.stoneLight);
    ellipsoid([x, 0.838, z + 0.259], [0.043, 0.027, 0.025], C.stoneDark);

    for (const e of [-1, 1]) {
      b.extrude(
        [[-0.073, 0], [0.07, -0.012], [0.089, 0.22], [0.018, 0.19]],
        {
          at: [x + e * 0.13, 0.97, z + 0.02],
          x: [e, 0, 0],
          y: [0, 1, 0],
          thickness: [0.105, 0.035],
          color: stone,
          bone: root,
          name: "foxEar",
        },
      );
      b.extrude(
        [[-0.028, 0], [0.034, 0], [0.057, 0.14]],
        {
          at: [x + e * 0.138, 0.998, z + 0.078],
          x: [e, 0, 0],
          y: [0, 1, 0],
          thickness: 0.008,
          color: C.redDark,
          bone: root,
        },
      );
    }

    b.decal(skull, foxFace, {
      at: [x, 0.91, z + 0.195],
      dir: [0, 0, 1],
      size: [0.35, 0.185],
      lift: 0.002,
      bone: root,
    });

    b.extrude(
      [[-0.145, 0.1], [0.145, 0.1], [0.102, -0.12], [0, -0.18], [-0.102, -0.12]],
      {
        at: [x, 0.731, z + 0.176],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: lacquer,
        bone: root,
        name: "foxVotiveBib",
      },
    );
    rod([x - 0.13, 0.81, z + 0.19], [x + 0.13, 0.81, z + 0.19], 0.011, C.gold);
    cylinder([x, 0.661, z + 0.199], 0.043, 0.043, 0.021, goldPaint, 10, [0, 0, 1]);
    drawing([x, 0.662, z + 0.213], 0.067, 0.067, emblem);
  }
  fox(-0.93, 0.97, -1);
  fox(0.93, 0.97, 1);

  // Low offering table, dressed with a patterned purple cloth.
  box([0, 0.61, 0.042], [0.95, 0.075, 0.42], timber);
  box([0, 0.662, 0.042], [1.02, 0.035, 0.46], C.redDark);
  for (const s of [-1, 1]) {
    box([s * 0.345, 0.481, 0.042], [0.105, 0.21, 0.295], lacquer);
    box([s * 0.345, 0.379, 0.042], [0.17, 0.035, 0.33], C.roofDark);
    box([s * 0.345, 0.543, 0.042], [0.125, 0.035, 0.32], goldPaint);
  }
  box([0, 0.686, 0.042], [0.7, 0.017, 0.455], "#57365e");
  box([0, 0.565, 0.28], [0.7, 0.235, 0.012], "#57365e");
  drawing([0, 0.565, 0.289], 0.698, 0.235, clothArt);
  for (let i = 0; i < 9; i++)
    rod([-0.32 + i * 0.08, 0.448, 0.288], [-0.32 + i * 0.08, 0.402, 0.288], 0.006, C.gold);

  function plate(x: number, y: number, z: number, radius: number) {
    b.lathe(
      [
        [0, 0], [radius * 0.58, 0], [radius, 0.022],
        [radius, 0.042], [radius * 0.7, 0.02], [0, 0.017],
      ],
      { at: [x, y, z], color: C.cream, bone: root, segments: 12 },
    );
    torus([x, y + 0.038, z], radius * 0.93, 0.005, goldPaint, [90, 0, 0]);
  }

  plate(-0.24, 0.694, 0.065, 0.166);
  plate(0.21, 0.694, 0.067, 0.148);

  // Bright oranges stacked on one dish.
  for (const [dx, dz, dy] of [
    [-0.06, -0.04, 0], [0.06, -0.04, 0], [0, 0.062, 0],
    [0, 0, 0.085],
  ]) {
    const p = [-0.24 + dx, 0.787 + dy, 0.065 + dz];
    ellipsoid(p, [0.064, 0.06, 0.064], C.orange);
    ellipsoid([p[0], p[1] + 0.058, p[2]], [0.012, 0.008, 0.012], C.leaf);
    b.slab(
      [[p[0], p[1] + 0.06, p[2]],
       [p[0] + 0.052, p[1] + 0.074, p[2] + 0.012],
       [p[0] + 0.02, p[1] + 0.064, p[2] + 0.032]],
      { thickness: 0.004, color: C.leaf, bone: root },
    );
  }

  // Three soft rice buns and one green tea bun.
  for (const [dx, dz, dy, color] of [
    [-0.05, -0.04, 0, C.cream],
    [0.052, -0.03, 0, C.cream],
    [0, 0.06, 0, C.cream],
    [0, 0, 0.08, "#aac39e"],
  ] as [number, number, number, string][]) {
    ellipsoid([0.21 + dx, 0.783 + dy, 0.067 + dz], [0.061, 0.055, 0.061], color);
    ellipsoid([0.21 + dx, 0.835 + dy, 0.067 + dz], [0.016, 0.009, 0.016], "#d1c9ac");
  }

  function sake(x: number, z: number, h: number) {
    const y = 0.674;
    b.lathe(
      [
        [0, 0], [0.067, 0], [0.08, 0.036], [0.076, h * 0.53],
        [0.048, h * 0.73], [0.032, h * 0.79], [0.032, h * 0.97],
        [0.038, h], [0.025, h], [0.021, h * 0.9], [0, h * 0.9],
      ],
      { at: [x, y, z], color: C.jade, bone: root, segments: 10 },
    );
    cylinder([x, y + h + 0.008, z], 0.029, 0.029, 0.029, C.ropeDark, 8);
    drawing([x, y + h * 0.36, z + 0.078], 0.094, 0.139, bottleLabel);
    torus([x, y + h * 0.77, z], 0.034, 0.007, C.rope, [90, 0, 0]);
  }
  sake(-0.64, -0.19, 0.34);
  sake(0.65, -0.2, 0.29);

  // Incense burner on the top step.
  b.lathe(
    [
      [0, 0], [0.088, 0], [0.115, 0.08], [0.124, 0.105],
      [0.115, 0.125], [0.092, 0.115], [0.078, 0.035], [0, 0.035],
    ],
    { at: [0, 0.456, 0.452], color: goldPaint, bone: root, segments: 10 },
  );
  cylinder([0, 0.535, 0.452], 0.092, 0.092, 0.02, "#a19a8b", 12);
  for (let j = 0; j < 5; j++) {
    const x = (j - 2) * 0.026;
    const z = 0.452 + (j % 2 ? 0.013 : -0.015);
    const tipY = 0.746 + (j % 3) * 0.022;
    rod([x, 0.532, z], [x + (j - 2) * 0.005, tipY, z], 0.004, C.redDark);
    glow(ellipsoid([x + (j - 2) * 0.005, tipY, z], [0.006, 0.009, 0.006], "#ffab79"), 1.1);
  }
  for (const s of [-1, 1]) {
    torus([s * 0.135, 0.535, 0.452], 0.032, 0.009, C.goldDark, [0, 90, 0]);
    ellipsoid([s * 0.126, 0.516, 0.452], [0.027, 0.029, 0.027], C.gold);
  }

  // Smaller votive dishes beside the sanctuary.
  for (const s of [-1, 1]) {
    plate(s * 0.63, 0.666, -0.56, 0.11);
    b.lathe(
      [[0, 0], [0.036, 0], [0.055, 0.072], [0.047, 0.08], [0.028, 0.024], [0, 0.024]],
      { at: [s * 0.63, 0.718, -0.56], color: C.cream, bone: root, segments: 8 },
    );
    cylinder([s * 0.63, 0.776, -0.56], 0.04, 0.04, 0.009, "#c48b52", 10);
  }

  // Mossy roadside stones are clustered outside the clear processional path.
  for (let i = 0; i < 24; i++) {
    const side = i % 2 ? -1 : 1;
    const x = side * (1.75 + random() * 0.5);
    const z = -1.57 + random() * 2.95;
    const r = 0.075 + random() * 0.11;
    ellipsoid(
      [x, 0.205 + r * 0.38, z],
      [r * (1 + random() * 0.5), r * 0.6, r],
      i % 4 === 0 ? C.moss : stone,
      "roadsidePebble",
    );
  }

  // Two restrained rear-side shrubs frame the roof, without overpowering it.
  function shrub(x: number, z: number, s: number) {
    b.sweep(
      catmull([
        [x, 0.22, z],
        [x - s * 0.075, 0.49, z],
        [x + s * 0.015, 0.79, z - 0.045],
        [x + s * 0.08, 1.02, z - 0.08],
      ]),
      [0.047, 0.04, 0.029, 0.012],
      { color: timber, bone: root, sides: 6 },
    );
    const branches = [
      [-0.23, 0.66, 0.05],
      [0.17, 0.78, 0.07],
      [-0.15, 0.96, -0.07],
      [0.12, 1.13, -0.05],
    ];
    for (let i = 0; i < branches.length; i++) {
      const [dx, y, dz] = branches[i];
      rod([x, y - 0.2, z], [x + dx, y, z + dz], 0.018, timber);
      ellipsoid([x + dx, y, z + dz], [0.22, 0.12, 0.19], i % 2 ? C.leaf : C.moss);
      ellipsoid([x + dx + 0.07, y + 0.055, z + dz + 0.07], [0.13, 0.065, 0.12], C.mossLight);
    }
    blossom([x - 0.16, 0.994, z + 0.1], 0.065);
    blossom([x + 0.14, 0.817, z + 0.17], 0.055);
  }
  shrub(-1.99, -1.34, -1);
  shrub(2.01, -1.29, 1);

  function grassTuft(x: number, z: number, h: number) {
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3 + random() * 0.3;
      const dx = Math.cos(a) * 0.046;
      const dz = Math.sin(a) * 0.046;
      b.slab(
        [
          [x - dz * 0.25, 0.205, z + dx * 0.25],
          [x + dz * 0.25, 0.205, z - dx * 0.25],
          [x + dx * 0.5, 0.205 + h, z + dz * 0.5],
          [x + dx, 0.205 + h * 0.7, z + dz],
        ],
        {
          thickness: 0.003,
          color: k === 1 ? C.mossLight : C.leaf,
          bone: root,
        },
      );
    }
  }
  for (let i = 0; i < 15; i++) {
    const s = i % 2 ? -1 : 1;
    grassTuft(
      s * (1.66 + random() * 0.55),
      -1.58 + random() * 2.94,
      0.1 + random() * 0.1,
    );
  }

  // A few fallen sakura petals, including some on the step and fox pedestals.
  const petalFrames = [];
  for (let i = 0; i < 25; i++) {
    const x = (random() - 0.5) * 4.1;
    const z = (random() - 0.5) * 3.24;
    let y = 0.216;
    if (Math.abs(x) < 0.5 && z > 0.53) y = 0.273;
    if (Math.abs(x) < 0.72 && z > 0.12 && z < 0.52) y = 0.359;
    petalFrames.push(frame([x, y, z], [0, 1, 0]));
  }
  b.cards(petalFrames, petalArt, {
    size: [0.035, 0.05],
    lean: 90,
    flow: [0.3, 0, 1],
    spin: 180,
    vary: 0.35,
    rng: rng(923),
    mirror: true,
    sink: 0,
    bone: root,
  });

  // Tiny votive charms hung at the eave's outer corners.
  for (const s of [-1, 1]) {
    const x = s * 1.185;
    rod([x, 2.57, -0.02], [x, 2.34, -0.02], 0.006, C.goldDark);
    b.extrude(
      [[0, 0.065], [0.045, 0], [0, -0.065], [-0.045, 0]],
      {
        at: [x, 2.31, -0.02],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: goldPaint,
        bone: root,
      },
    );
    glow(ellipsoid([x, 2.311, -0.004], [0.018, 0.026, 0.009], C.magic), 0.7);
    for (let k = 0; k < 3; k++)
      rod([x + (k - 1) * 0.014, 2.25, -0.02], [x + (k - 1) * 0.018, 2.164, -0.02], 0.004, C.red);
  }

  return b.root;
}
