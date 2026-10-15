```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
  grain,
} from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Shrine of the Violet Bell",
  description:
    "An Inazuma-inspired roadside shrine: swept vermilion torii, indigo tiled sanctuary, sacred rope, glowing paper lanterns, stone tōrō and carefully arranged offerings.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Shrine of the Violet Bell",
    paintSize: 2048,
  });
  const root = b.joint("shrineRoot", { at: [0, 0, 0] });
  const random = rng(2718);

  type Color = string | Paint;
  type P = [number, number, number];

  const C = {
    red: "#af3e39",
    redLight: "#de6750",
    redDark: "#672c39",
    black: "#262333",
    gold: "#d7ae62",
    goldLight: "#ffe1a0",
    woodDark: "#442e3c",
    wood: "#815144",
    stone: "#899095",
    stoneLight: "#bac0b7",
    stoneDark: "#505e68",
    moss: "#678771",
    cream: "#f3dfb7",
    paper: "#fff0cf",
    violet: "#9b76d4",
    violetDark: "#49355f",
    blue: "#3d465f",
    blueLight: "#69748b",
    rope: "#c1a47d",
    ropeLight: "#e7c99a",
    jade: "#4a9590",
  };

  const lacquer = paint((p, n) => {
    const wear = noise(p, 0.075, 11);
    const top = Math.max(0, n.y);
    return mix(
      mix(C.redDark, C.red, 0.65 + 0.3 * wear),
      C.redLight,
      top * 0.38,
    );
  });
  const wood = grain("#644039", "#94644b", {
    size: 0.032,
    axis: "y",
    seed: 8,
  });
  const horizontalWood = grain("#603d38", "#9d6b4a", {
    size: 0.03,
    axis: "x",
    seed: 8,
  });
  const stone = paint((p, n) => {
    let color = mix("#67717b", "#adb4af", noise(p, 0.17, 22));
    color = mix(color, "#d0cfc0", Math.max(0, n.y) * 0.23);
    if (n.y > 0.55 && noise(p, 0.24, 7) > 0.58) {
      color = mix(color, "#627e65", 0.58);
    }
    return color;
  });
  const roofing = paint((p, n) => {
    const seam = Math.abs(
      ((p.z + 1.6) / 0.155 - Math.floor((p.z + 1.6) / 0.155)) - 0.5,
    );
    const base = mix("#34384f", "#67728d", 0.45 + n.y * 0.35);
    return seam > 0.44
      ? "#303246"
      : mix(base, "#85879c", noise(p, 0.16, 23) * 0.15);
  });
  const brass = paint((p, n) =>
    mix(
      "#a57842",
      "#f1d18c",
      0.46 + n.y * 0.28 + (noise(p, 0.065, 3) - 0.5) * 0.24,
    ),
  );
  const ropePaint = grain(C.rope, C.ropeLight, {
    size: 0.012,
    axis: "x",
    seed: 5,
  });

  function box(
    at: P,
    size: P,
    color: Color,
    name?: string,
    rotation?: P,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: root,
      name,
      rotation,
    });
  }

  function ball(
    at: P,
    size: P,
    color: Color,
    name?: string,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      at,
      scale: size,
      bone: root,
      name,
      flat: true,
    });
  }

  function rod(a: P, end: P, radius: number, color: Color, name?: string) {
    return b.rod(a, end, radius, {
      color,
      bone: root,
      sides: 8,
      name,
    });
  }

  function cylinder(
    at: P,
    rTop: number,
    rBottom: number,
    height: number,
    color: Color,
    segments = 8,
    name?: string,
  ) {
    return b.part(
      new THREE.CylinderGeometry(rTop, rBottom, height, segments),
      color,
      { at, bone: root, name, flat: true },
    );
  }

  function drawing(
    at: P,
    width: number,
    height: number,
    texture: THREE.Texture,
    direction: P = [0, 0, 1],
    name?: string,
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone: root,
      texture,
      dir: direction,
      axis: "z",
      up: [0, 1, 0],
      name,
    });
  }

  function frontShape(
    outline: number[][],
    at: P,
    depth: number,
    color: Color,
    name?: string,
  ) {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: depth,
      color,
      bone: root,
      name,
    });
  }

  // A recurring three-petal thunder-flower, rather than a literal game emblem.
  const flower = `
    <g fill="#eac87f" stroke="#79516e" stroke-width="2">
      <path d="M50 47 C29 41 26 17 43 12 C61 8 72 23 62 36 C58 28 49 26 44 32 C39 38 43 44 50 47Z"/>
      <path d="M50 47 C29 41 26 17 43 12 C61 8 72 23 62 36 C58 28 49 26 44 32 C39 38 43 44 50 47Z" transform="rotate(120 50 50)"/>
      <path d="M50 47 C29 41 26 17 43 12 C61 8 72 23 62 36 C58 28 49 26 44 32 C39 38 43 44 50 47Z" transform="rotate(240 50 50)"/>
      <circle cx="50" cy="50" r="5" fill="#fff0b8"/>
    </g>`;

  const crestTexture = svg(`
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#45304f" stroke="#eac87f" stroke-width="4"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#a87fa7" stroke-width="2"/>
      ${flower}
    </svg>
  `, { size: 256 });

  const lanternTexture = svg(`
    <svg viewBox="0 0 120 170">
      <rect width="120" height="170" fill="#ffe8b4"/>
      <rect x="8" y="5" width="104" height="160" rx="4" fill="none" stroke="#ad775a" stroke-width="3"/>
      <path d="M0 29H120 M0 54H120 M0 79H120 M0 104H120 M0 129H120 M0 154H120"
        stroke="#dfb185" stroke-width="2" fill="none"/>
      <g transform="translate(20 33) scale(.8)">${flower}</g>
      <path d="M52 130H68 M60 123V147 M49 142L60 136L71 142"
        fill="none" stroke="#77506c" stroke-width="4" stroke-linecap="square"/>
      <path d="M18 14L25 21L18 28L11 21Z M102 14L109 21L102 28L95 21Z"
        fill="#ad675b"/>
    </svg>
  `, { size: 256 });

  const plaqueTexture = svg(`
    <svg viewBox="0 0 100 230">
      <rect width="100" height="230" fill="#30283e"/>
      <rect x="7" y="7" width="86" height="216" rx="8" fill="none" stroke="#d9b774" stroke-width="4"/>
      <path d="M19 27L29 17H71L81 27 M19 203L29 213H71L81 203"
        fill="none" stroke="#98707e" stroke-width="3"/>
      <g stroke="#f1d7a1" stroke-width="5" fill="none" stroke-linejoin="miter">
        <path d="M31 49H69 M40 37V76 M60 37V76 M27 64H74 M33 82L50 71L69 84"/>
        <path d="M29 112H72 M50 96V151 M33 126H68 M34 143L50 133L69 146"/>
        <path d="M29 173H72 M40 163V193 M61 163V193 M30 191H71"/>
      </g>
      <rect x="69" y="197" width="10" height="13" fill="#b95149"/>
    </svg>
  `, { size: 384 });

  const carvingTexture = svg(`
    <svg viewBox="0 0 256 90">
      <rect width="256" height="90" fill="#633e44"/>
      <path d="M6 7H250V83H6Z M13 14H243V76H13Z"
        fill="none" stroke="#d1a667" stroke-width="3"/>
      <g fill="none" stroke="#e2bd7b" stroke-width="4">
        <path d="M23 51C34 15 66 16 72 43C78 67 104 66 116 43
                 M140 43C152 66 178 67 184 43C190 16 222 15 233 51"/>
        <path d="M25 57Q50 75 73 52 M183 52Q206 75 231 57"/>
      </g>
      <path d="M128 22L144 44L128 66L112 44Z" fill="#e4bc77"/>
      <path d="M128 33L136 44L128 55L120 44Z" fill="#88628c"/>
    </svg>
  `, { size: 384 });

  const emaTexture = svg(`
    <svg viewBox="0 0 130 100">
      <path d="M3 29L65 3L127 29V96H3Z" fill="#d6b17b"/>
      <path d="M9 32L65 10L121 32V90H9Z" fill="none" stroke="#986745" stroke-width="3"/>
      <path d="M27 67L32 36L46 51L65 45L84 51L98 36L103 67
        Q92 87 65 88Q38 87 27 67Z" fill="#f9e7bf" stroke="#97634f" stroke-width="3"/>
      <path d="M39 64L53 69 M77 69L91 64" stroke="#8c4d55" stroke-width="4"/>
      <path d="M59 76L65 81L71 76Z" fill="#8c4d55"/>
      <path d="M60 49L65 60L70 49" fill="#c16b61"/>
    </svg>
  `, { size: 256 });

  const ofudaTexture = svg(`
    <svg viewBox="0 0 60 180">
      <rect width="60" height="180" fill="#fff2ce"/>
      <rect x="5" y="5" width="50" height="170" fill="none" stroke="#c88c71" stroke-width="2"/>
      <circle cx="30" cy="30" r="13" fill="none" stroke="#b95152" stroke-width="4"/>
      <path d="M20 30H40 M30 20V40 M16 58H44 M30 51V92 M18 73L30 66L43 76
        M17 103H43 M23 96V126 M37 96V126 M16 121H44 M30 131V160 M19 142H41"
        stroke="#684753" stroke-width="4" fill="none"/>
      <rect x="34" y="153" width="12" height="13" fill="#ba6057"/>
    </svg>
  `, { size: 256 });

  const bottleTexture = svg(`
    <svg viewBox="0 0 100 120">
      <rect width="100" height="120" rx="5" fill="#f7e7c5"/>
      <rect x="7" y="7" width="86" height="106" rx="3" fill="none" stroke="#bda17a" stroke-width="3"/>
      <circle cx="50" cy="35" r="20" fill="#7b527c"/>
      <path d="M36 36Q50 15 64 36Q50 49 36 36Z" fill="#ecd391"/>
      <path d="M31 70H69 M50 58V101 M35 83H65 M32 100L50 90L68 100"
        stroke="#624656" stroke-width="5" fill="none"/>
    </svg>
  `, { size: 192 });

  // Foundation and shallow approach steps. No separate scenery or ground plane.
  const foundation = box(
    [0, 0.13, 0.02],
    [2.45, 0.26, 2.05],
    stone,
    "Sanctuary stone foundation",
  );
  box([0, 0.29, 0.02], [2.54, 0.1, 2.13], stone, "Overhanging foundation lip");
  box([0, 0.075, 1.32], [1.49, 0.15, 0.61], stone, "Lower approach step");
  box([0, 0.18, 1.15], [1.65, 0.13, 0.43], stone, "Upper approach step");

  for (const x of [-0.82, 0, 0.82]) {
    box([x, 0.132, 1.052], [0.013, 0.2, 0.007], C.stoneDark);
  }
  for (const s of [-1, 1]) {
    for (const z of [-0.64, 0.05, 0.67]) {
      box([s * 1.227, 0.14, z], [0.006, 0.19, 0.012], C.stoneDark);
    }
  }

  for (const hit of b.surface(foundation).scatter(12, {
    rng: random,
    minDist: 0.14,
    filter: (h) => h.n.y > 0.5 || (h.at.y < 0.18 && h.n.z > 0.5),
  })) {
    b.stick(
      new THREE.SphereGeometry(1, 6, 4),
      C.moss,
      hit,
      { scale: [0.055, 0.009, 0.038], embed: 0.6, name: "Foundation lichen" },
    );
  }

  // Tall torii. Its silhouette frames rather than hides the little sanctuary.
  const gateZ = -1.13;
  for (const s of [-1, 1]) {
    const x = s * 1.7;
    box([x, 0.1, gateZ], [0.55, 0.2, 0.55], stone, "Torii footing");
    box([x, 0.23, gateZ], [0.43, 0.08, 0.43], C.stoneDark);
    cylinder([x, 0.38, gateZ], 0.184, 0.205, 0.28, C.black, 10);
    b.sweep(
      [[x, 0.47, gateZ], [s * 1.61, 3.83, gateZ]],
      [0.162, 0.135],
      { color: lacquer, bone: root, sides: 10, caps: "flat", name: "Vermilion torii pillar" },
    );
    cylinder([x, 0.51, gateZ], 0.18, 0.18, 0.055, brass, 10);
    box([s * 1.62, 3.42, gateZ], [0.39, 0.34, 0.34], lacquer);
    box([s * 1.62, 3.5, gateZ + 0.188], [0.31, 0.17, 0.045], C.black);
    for (const dx of [-0.085, 0.085]) {
      ball([s * 1.62 + dx, 3.5, gateZ + 0.218], [0.026, 0.026, 0.014], brass);
    }
  }

  box([0, 3.46, gateZ], [4.03, 0.205, 0.24], lacquer, "Torii lower crossbeam");
  box([0, 3.35, gateZ], [3.98, 0.035, 0.27], C.redDark);
  box([0, 3.7, gateZ], [0.22, 0.5, 0.27], lacquer, "Torii central strut");

  frontShape(
    [
      [-2.32, 0.18], [-1.91, 0.075], [-1.14, 0.005],
      [0, -0.025], [1.14, 0.005], [1.91, 0.075], [2.32, 0.18],
      [2.23, -0.075], [1.2, -0.2], [0, -0.23],
      [-1.2, -0.2], [-2.23, -0.075],
    ],
    [0, 3.99, gateZ], 0.38, lacquer, "Swept torii kasagi",
  );
  frontShape(
    [
      [-2.4, 0.23], [-1.91, 0.11], [-1.12, 0.045], [0, 0.015],
      [1.12, 0.045], [1.91, 0.11], [2.4, 0.23],
      [2.36, 0.12], [1.91, 0.015], [1.12, -0.05], [0, -0.08],
      [-1.12, -0.05], [-1.91, 0.015], [-2.36, 0.12],
    ],
    [0, 3.99, gateZ], 0.46, C.black, "Black torii crown",
  );
  b.sweep(
    [
      [-2.3, 4.105, gateZ + 0.239],
      [-1.9, 4.01, gateZ + 0.239],
      [0, 3.92, gateZ + 0.239],
      [1.9, 4.01, gateZ + 0.239],
      [2.3, 4.105, gateZ + 0.239],
    ],
    0.014,
    { color: brass, bone: root, sides: 6, caps: "flat", name: "Torii fine gilt edge" },
  );

  box([0, 3.62, gateZ + 0.255], [0.36, 0.64, 0.085], brass, "Framed gate inscription");
  box([0, 3.62, gateZ + 0.307], [0.305, 0.57, 0.03], C.black);
  drawing([0, 3.62, gateZ + 0.325], 0.29, 0.555, plaqueTexture);

  // Braided sacred rope and folded lightning-paper streamers.
  const ropePath = catmull([
    [-1.62, 3.37, -0.89],
    [-1.1, 3.22, -0.83],
    [0, 3.12, -0.81],
    [1.1, 3.22, -0.83],
    [1.62, 3.37, -0.89],
  ]);
  b.sweep(ropePath, 0.041, {
    color: ropePaint,
    bone: root,
    sides: 8,
    name: "Sacred shimenawa",
  });
  b.along(ropePath, 36, (at) => {
    b.part(new THREE.TorusGeometry(0.0415, 0.007, 4, 6), C.ropeLight, {
      at,
      bone: root,
      dir: at.axis,
      axis: "z",
      name: "Rope winding",
    });
  });

  function shide(x: number, y: number, z: number, size = 1) {
    const outline = [
      [-0.032, 0], [0.038, 0], [0.038, -0.085],
      [0.105, -0.085], [0.105, -0.185], [0.035, -0.185],
      [0.035, -0.278], [-0.036, -0.278], [-0.036, -0.15],
      [0.034, -0.15], [0.034, -0.115], [-0.032, -0.115],
    ].map(([u, v]) => [u * size, v * size]);
    frontShape(outline, [x, y, z], 0.009, C.paper, "Folded sacred paper");
    rod([x - 0.03 * size, y - 0.114 * size, z + 0.007],
      [x + 0.034 * size, y - 0.114 * size, z + 0.007],
      0.003, "#d6c5af");
  }
  for (const t of [0.16, 0.33, 0.67, 0.84]) {
    const p = ropePath.at(t);
    shide(p.x, p.y - 0.018, p.z + 0.035);
  }

  // Main wooden sanctuary.
  box([0, 0.43, -0.06], [1.77, 0.18, 1.51], C.woodDark, "Sanctuary sill");
  box([0, 0.55, -0.06], [1.88, 0.075, 1.58], horizontalWood);
  for (let i = 0; i < 7; i++) {
    box([-0.75 + i * 0.25, 0.605, -0.06], [0.238, 0.045, 1.48], horizontalWood);
  }

  box([0, 1.51, -0.65], [1.43, 1.79, 0.13], wood, "Sanctuary back wall");
  for (const s of [-1, 1]) {
    box([s * 0.705, 1.48, -0.1], [0.11, 1.74, 1.19], wood, "Sanctuary side wall");
    for (const z of [-0.68, 0.51]) {
      box([s * 0.76, 1.48, z], [0.16, 1.81, 0.16], lacquer, "Sanctuary corner pillar");
      box([s * 0.76, 0.705, z], [0.19, 0.13, 0.19], C.black);
      box([s * 0.76, 2.18, z], [0.19, 0.13, 0.19], brass);
      box([s * 0.76, 2.31, z], [0.28, 0.12, 0.28], lacquer);
    }
    // Side-wall slatted panels and metal strap hardware.
    for (let j = 0; j < 5; j++) {
      box([s * 0.768, 1.55, -0.51 + j * 0.22], [0.035, 1.17, 0.025], C.woodDark);
    }
    for (const y of [1.03, 1.97]) {
      box([s * 0.783, y, -0.1], [0.035, 0.065, 1.08], horizontalWood);
    }
  }

  box([0, 2.335, -0.08], [1.92, 0.18, 1.62], lacquer, "Upper tie beam");
  box([0, 2.44, -0.08], [2.02, 0.06, 1.7], C.woodDark);
  box([0, 2.205, 0.607], [1.3, 0.22, 0.065], C.redDark);
  drawing([0, 2.205, 0.644], 1.25, 0.195, carvingTexture, [0, 0, 1], "Carved floral transom");

  // Recessed interior, visible between the open lattice shutters.
  box([0, 1.46, -0.475], [1.18, 1.49, 0.045], C.violetDark, "Shadowed inner sanctuary");
  box([0, 0.8, -0.15], [0.83, 0.12, 0.64], C.redDark, "Inner altar");
  box([0, 0.89, -0.15], [0.94, 0.065, 0.69], brass);
  cylinder([0, 1.025, -0.18], 0.22, 0.27, 0.19, C.black, 8);
  cylinder([0, 1.14, -0.18], 0.25, 0.21, 0.05, brass, 10);
  rod([0, 1.14, -0.18], [0, 1.43, -0.18], 0.038, brass);

  const mirror = b.part(new THREE.CylinderGeometry(0.30, 0.30, 0.075, 12), brass, {
    at: [0, 1.65, -0.2],
    bone: root,
    dir: [0, 0, 1],
    name: "Sacred thunder mirror",
  });
  void mirror;
  glow(drawing([0, 1.65, -0.158], 0.55, 0.55, crestTexture), 0.35);
  for (const s of [-1, 1]) {
    drawing([s * 0.415, 1.52, -0.444], 0.12, 0.36, ofudaTexture);
  }

  for (const s of [-1, 1]) {
    const x = s * 0.565;
    box([x, 1.435, 0.61], [0.37, 1.31, 0.085], C.woodDark, "Open shutter backing");
    box([x, 1.61, 0.659], [0.29, 0.79, 0.015], "#b99a91", "Lattice paper backing");
    for (const dx of [-0.177, 0.177]) {
      box([x + dx, 1.44, 0.675], [0.037, 1.34, 0.055], lacquer);
    }
    for (const y of [0.78, 1.16, 2.1]) {
      box([x, y, 0.681], [0.39, 0.04, 0.055], lacquer);
    }
    for (let i = 0; i < 4; i++) {
      box([x - 0.12 + i * 0.08, 1.62, 0.69], [0.017, 0.86, 0.035], C.gold);
    }
    for (let i = 0; i < 7; i++) {
      box([x, 1.23 + i * 0.127, 0.7], [0.31, 0.017, 0.035], C.gold);
    }
    drawing([x, 0.98, 0.659], 0.26, 0.245, crestTexture);
    for (const y of [0.89, 1.92]) {
      box([x + s * 0.18, y, 0.712], [0.095, 0.07, 0.025], C.black);
      ball([x + s * 0.18, y, 0.732], [0.013, 0.013, 0.009], brass);
    }
  }

  // Swept, faceted tiled roof. Each broad slope is an actual thick roof panel.
  const roofProfile: [number, number][] = [
    [-1.25, 2.58],
    [-1.04, 2.52],
    [-0.77, 2.61],
    [-0.43, 2.87],
    [0, 3.105],
    [0.43, 2.87],
    [0.77, 2.61],
    [1.04, 2.52],
    [1.25, 2.58],
  ];
  const frontZ = 0.84;
  const rearZ = -0.99;

  for (let i = 0; i < roofProfile.length - 1; i++) {
    const [x0, y0] = roofProfile[i];
    const [x1, y1] = roofProfile[i + 1];
    b.slab([
      [x0, y0, rearZ], [x1, y1, rearZ],
      [x1, y1, frontZ], [x0, y0, frontZ],
    ], {
      thickness: 0.075,
      color: roofing,
      bone: root,
      name: "Indigo roof slope",
    });
  }

  // Roof underside and gable infill.
  frontShape(
    [[-0.87, 0], [0, 0.63], [0.87, 0]],
    [0, 2.43, 0.55], 0.09, wood, "Front triangular gable",
  );
  frontShape(
    [[-0.87, 0], [0, 0.63], [0.87, 0]],
    [0, 2.43, -0.77], 0.09, wood, "Rear triangular gable",
  );
  for (const z of [frontZ + 0.025, rearZ - 0.025]) {
    b.sweep(roofProfile.map(([x, y]) => [x, y - 0.052, z]), 0.065, {
      color: C.woodDark,
      section: "box",
      bone: root,
      caps: "flat",
      name: "Deep curved bargeboard",
    });
    b.sweep(roofProfile.map(([x, y]) => [x, y - 0.012, z + (z > 0 ? 0.065 : -0.065)]), 0.021, {
      color: brass,
      sides: 6,
      bone: root,
      name: "Gilded roof outline",
    });
  }

  // Raised tile seams, with little circular tile-end caps.
  for (let i = 0; i <= 11; i++) {
    const z = rearZ + 0.05 + i * 0.156;
    for (const s of [-1, 1]) {
      const half = roofProfile
        .filter(([x]) => x >= 0)
        .map(([x, y]) => [s * x, y + 0.037, z]);
      b.sweep(half, 0.021, {
        color: C.blueLight,
        sides: 5,
        bone: root,
        caps: "flat",
        name: "Raised tile seam",
      });
      ball([s * 1.257, 2.58, z], [0.031, 0.037, 0.044], C.blueLight, "Eave tile end", 8);
    }
  }
  box([0, 3.115, -0.065], [0.14, 0.12, 1.99], C.blue, "Roof ridge");
  box([0, 3.187, -0.065], [0.19, 0.034, 2.05], C.blueLight);
  for (const z of [-1.07, 0.96]) {
    cylinder([0, 3.23, z], 0.062, 0.085, 0.11, brass, 8);
    ball([0, 3.315, z], [0.075, 0.09, 0.075], C.goldLight, "Ridge jewel", 8);
  }
  drawing([0, 2.75, 0.608], 0.28, 0.28, crestTexture, [0, 0, 1], "Gable crest");
  for (const s of [-1, 1]) {
    rod([s * 0.11, 2.88, 0.62], [s * 0.56, 2.55, 0.62], 0.025, brass);
    frontShape(
      [[0, 0], [0.28, 0], [0.28, -0.085], [0.18, -0.085], [0.08, -0.20], [0, -0.20]],
      [s > 0 ? 0.72 : -1, 2.37, 0.54],
      0.22,
      lacquer,
      "Stepped eave bracket",
    );
  }

  // Wish plaques hang on the small side rail, never in front of the shrine opening.
  for (const s of [-1, 1]) {
    box([s * 1.015, 0.94, 0.27], [0.06, 0.7, 0.06], lacquer);
    box([s * 1.015, 1.27, 0.02], [0.075, 0.075, 0.65], C.woodDark);
    for (let i = 0; i < 2; i++) {
      const x = s * (0.91 + i * 0.16);
      const y = 1.045 - i * 0.08;
      const z = 0.64;
      b.sweep(
        [[x - 0.03, y + 0.09, z], [x, 1.265, 0.33], [x + 0.03, y + 0.09, z]],
        0.007,
        { color: C.rope, bone: root, sides: 5 },
      );
      frontShape(
        [[-0.1, -0.08], [0.1, -0.08], [0.1, 0.045], [0, 0.09], [-0.1, 0.045]],
        [x, y, z], 0.025, horizontalWood, "Wooden wish plaque",
      );
      drawing([x, y, z + 0.015], 0.192, 0.148, emaTexture);
    }
  }

  // A little bell and its red-and-cream pull cord, just beside the doorway.
  const bellX = 0.28;
  b.lathe(
    [[0, 0.13], [0.045, 0.13], [0.06, 0.06], [0.105, 0],
      [0.105, -0.025], [0.084, -0.025], [0.065, 0.025], [0, 0.025]],
    { at: [bellX, 2.04, 0.71], color: brass, segments: 10, bone: root, name: "Shrine bell" },
  );
  rod([bellX, 2.16, 0.71], [bellX, 2.29, 0.71], 0.018, C.black);
  const bellCord = b.sweep(
    [[bellX, 2.04, 0.71], [bellX + 0.018, 1.58, 0.77], [bellX, 1.17, 0.81]],
    0.014,
    {
      color: paint((_p, _n, s) => Math.floor(s[0] * 19) % 2 ? C.red : C.paper),
      bone: root,
      sides: 6,
      caps: "flat",
      name: "Bell pull cord",
    },
  );
  void bellCord;
  ball([bellX, 1.17, 0.81], [0.026, 0.037, 0.026], C.red);
  for (let i = 0; i < 5; i++) {
    const x = bellX + (i - 2) * 0.009;
    rod([x, 1.16, 0.81], [x + (i - 2) * 0.005, 1.06, 0.815], 0.006, C.redLight);
  }

  // Lantern-building helpers: four paper faces inside real timber frames.
  function paperLantern(x: number, y: number, z: number) {
    const w = 0.36;
    const h = 0.48;
    const half = w / 2;
    glow(box([x, y, z], [w * 0.94, h * 0.98, w * 0.94], "#ffd89b", "Lantern warm core"), 0.65);
    for (const s of [-1, 1]) {
      glow(drawing([x, y, z + s * (half + 0.003)], w, h, lanternTexture, [0, 0, s]), 0.7);
      glow(drawing([x + s * (half + 0.003), y, z], w, h, lanternTexture, [s, 0, 0]), 0.7);
      for (const t of [-1, 1]) {
        box([x + s * half, y, z + t * half], [0.032, h + 0.04, 0.032], C.redDark);
      }
      box([x, y + s * (h / 2), z], [w + 0.055, 0.045, w + 0.055], C.black);
      box([x, y + s * (h / 2 + 0.026), z], [w + 0.07, 0.015, w + 0.07], brass);
    }
    b.lathe(
      [[0, 0.15], [0.085, 0.10], [0.19, 0.015], [0.265, 0.025],
        [0.25, -0.025], [0.17, -0.018], [0, 0.055]],
      { at: [x, y + h / 2 + 0.04, z], color: C.blue, segments: 4, spin: 45, bone: root, name: "Lantern pagoda cap" },
    );
    cylinder([x, y + h / 2 + 0.21, z], 0.035, 0.05, 0.06, brass);
    b.part(new THREE.TorusGeometry(0.054, 0.011, 5, 10), C.black, {
      at: [x, y + h / 2 + 0.27, z], bone: root,
    });
    cylinder([x, y - h / 2 - 0.071, z], 0.055, 0.035, 0.07, brass);
    ball([x, y - h / 2 - 0.13, z], [0.032, 0.04, 0.032], C.violet);
    for (let i = 0; i < 5; i++) {
      rod(
        [x + (i - 2) * 0.014, y - h / 2 - 0.15, z],
        [x + (i - 2) * 0.02, y - h / 2 - 0.32, z],
        0.008,
        i % 2 ? C.violet : "#b59bd5",
        "Lantern silk tassel",
      );
    }
  }

  for (const s of [-1, 1]) {
    const x = s * 1.58;
    const y = 2.63;
    const z = -0.68;
    rod([x, 3.37, -1.0], [x, 3.37, z], 0.028, C.black, "Lantern hanger");
    rod([x, 3.37, z], [x, 3.12, z], 0.013, brass);
    paperLantern(x, y, z);
  }

  // Low stone tōrō, with warm light in their square openings.
  function stoneLantern(x: number, z: number) {
    box([x, 0.075, z], [0.6, 0.15, 0.6], stone, "Stone lantern foot");
    box([x, 0.19, z], [0.47, 0.08, 0.47], stone);
    cylinder([x, 0.31, z], 0.145, 0.225, 0.19, stone, 6);
    cylinder([x, 0.62, z], 0.12, 0.14, 0.49, stone, 6, "Stone lantern pedestal");
    cylinder([x, 0.87, z], 0.23, 0.135, 0.12, stone, 8);
    box([x, 0.97, z], [0.49, 0.095, 0.49], stone);
    glow(box([x, 1.16, z], [0.29, 0.3, 0.29], "#ffdb9c", "Stone lantern firebox"), 0.7);
    for (const a of [-1, 1]) {
      for (const c of [-1, 1]) {
        box([x + a * 0.19, 1.17, z + c * 0.19], [0.095, 0.34, 0.095], stone);
      }
      box([x, 1.17, z + a * 0.164], [0.024, 0.25, 0.025], C.stoneDark);
      box([x + a * 0.164, 1.17, z], [0.025, 0.25, 0.024], C.stoneDark);
    }
    box([x, 1.36, z], [0.46, 0.07, 0.46], stone);
    b.lathe(
      [[0, 0.27], [0.11, 0.21], [0.22, 0.08], [0.39, 0.015],
        [0.40, 0.045], [0.395, -0.025], [0.25, -0.055], [0, -0.055]],
      {
        at: [x, 1.43, z], color: stone, segments: 4, spin: 45,
        bone: root, name: "Swept stone lantern roof",
      },
    );
    cylinder([x, 1.74, z], 0.08, 0.12, 0.12, stone, 8);
    ball([x, 1.85, z], [0.095, 0.1, 0.095], stone, "Stone lantern finial", 8);
    cylinder([x, 1.94, z], 0.006, 0.055, 0.095, stone, 8);
  }
  stoneLantern(-1.66, 0.68);
  stoneLantern(1.66, 0.68);

  // Offering table and slatted offertory box.
  for (const x of [-0.55, 0.55]) {
    box([x, 0.58, 0.99], [0.105, 0.48, 0.18], C.redDark, "Offering table leg");
    box([x, 0.39, 0.99], [0.16, 0.08, 0.28], C.black);
  }
  box([0, 0.71, 0.99], [1.32, 0.09, 0.4], horizontalWood);
  box([0, 0.81, 0.99], [1.48, 0.12, 0.51], lacquer, "Offering tabletop");
  box([0, 0.878, 0.99], [1.52, 0.025, 0.55], C.woodDark);
  box([0, 0.79, 1.255], [1.21, 0.095, 0.025], brass);
  drawing([0, 0.79, 1.271], 0.48, 0.08, carvingTexture);

  box([0, 0.46, 1.5], [0.65, 0.24, 0.37], wood, "Offertory box");
  box([0, 0.61, 1.5], [0.73, 0.075, 0.43], C.woodDark);
  for (let i = 0; i < 7; i++) {
    box([-0.27 + i * 0.09, 0.658, 1.5], [0.045, 0.035, 0.39], horizontalWood);
  }
  for (const x of [-0.29, 0.29]) {
    box([x, 0.47, 1.69], [0.045, 0.22, 0.025], C.black);
    for (const y of [0.4, 0.54]) {
      ball([x, y, 1.71], [0.013, 0.013, 0.009], brass);
    }
  }
  drawing([0, 0.47, 1.691], 0.16, 0.16, crestTexture);

  function dish(x: number, z: number, radius: number) {
    cylinder([x, 0.913, z], radius * 0.65, radius * 0.56, 0.035, C.jade, 10);
    b.lathe(
      [[0, 0.006], [radius * 0.58, 0.006], [radius, 0.046],
        [radius * 1.03, 0.066], [radius * 0.86, 0.059],
        [radius * 0.55, 0.027], [0, 0.027]],
      { at: [x, 0.921, z], color: C.cream, segments: 12, bone: root, name: "Ceramic offering dish" },
    );
  }

  dish(-0.4, 1.03, 0.18);
  for (const [dx, dz, dy] of [
    [-0.063, -0.032, 0], [0.064, -0.03, 0], [0, 0.069, 0], [0, 0.005, 0.102],
  ]) {
    ball([-0.4 + dx, 1.027 + dy, 1.03 + dz], [0.074, 0.067, 0.074], "#f8ebd3", "Rice cake offering");
  }

  dish(0.02, 1.03, 0.15);
  for (const [dx, dz] of [[-0.058, -0.022], [0.058, -0.022], [0, 0.068]]) {
    ball([0.02 + dx, 1.016, 1.03 + dz], [0.06, 0.057, 0.059], "#e9923d", "Mandarin offering");
    rod([0.02 + dx, 1.066, 1.03 + dz], [0.025 + dx, 1.08, 1.03 + dz], 0.006, "#64784d");
  }
  ball([0.02, 1.105, 1.025], [0.06, 0.057, 0.059], "#f4ab4a", "Top mandarin");
  rod([0.02, 1.155, 1.025], [0.023, 1.17, 1.025], 0.006, "#64784d");

  function sakeBottle(x: number, z: number, scale: number) {
    b.lathe(
      [[0, 0], [0.068, 0], [0.08, 0.035], [0.075, 0.17],
        [0.037, 0.225], [0.03, 0.32], [0.043, 0.335],
        [0.041, 0.355], [0, 0.355]].map(([r, y]) => [r * scale, y * scale]),
      { at: [x, 0.894, z], color: "#d7e4d6", segments: 10, bone: root, name: "Ceramic sake offering" },
    );
    cylinder([x, 0.894 + 0.357 * scale, z], 0.043 * scale, 0.043 * scale, 0.03 * scale, C.redDark);
    drawing([x, 0.894 + 0.13 * scale, z + 0.077 * scale], 0.1 * scale, 0.13 * scale, bottleTexture);
    b.part(new THREE.TorusGeometry(0.033 * scale, 0.008 * scale, 4, 10), C.rope, {
      at: [x, 0.894 + 0.29 * scale, z], rotation: [90, 0, 0], bone: root,
    });
  }
  sakeBottle(0.4, 0.94, 1);
  sakeBottle(0.62, 0.94, 0.78);

  // Two tiny votive lights and a small incense vessel on the sheltered sill.
  for (const s of [-1, 1]) {
    cylinder([s * 0.26, 0.682, 0.48], 0.06, 0.075, 0.06, brass);
    cylinder([s * 0.26, 0.737, 0.48], 0.036, 0.036, 0.085, C.paper);
    glow(ball([s * 0.26, 0.8, 0.48], [0.019, 0.035, 0.017], "#ffd18b", "Votive flame", 6), 1.1);
  }
  b.lathe(
    [[0, 0], [0.07, 0], [0.1, 0.045], [0.105, 0.1],
      [0.09, 0.11], [0.075, 0.045], [0, 0.025]],
    { at: [-0.08, 0.63, 0.56], color: C.jade, segments: 10, bone: root, name: "Incense censer" },
  );
  cylinder([-0.08, 0.702, 0.56], 0.075, 0.075, 0.015, "#9e8b78", 10);
  for (let i = 0; i < 3; i++) {
    const x = -0.08 + (i - 1) * 0.025;
    rod([x, 0.706, 0.56], [x + (i - 1) * 0.015, 0.92, 0.56], 0.004, "#714c42");
    glow(ball([x + (i - 1) * 0.015, 0.922, 0.56], [0.005, 0.006, 0.005], "#f2a362", "Incense ember", 6), 0.5);
  }

  return b.root;
}
```