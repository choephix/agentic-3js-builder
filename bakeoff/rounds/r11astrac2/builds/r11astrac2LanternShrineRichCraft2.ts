import * as THREE from "three";
import {
  createBuilder, rng, svg, paint, mix, noise, mottle, catmull,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Shrine of the Violet Fox",
  description:
    "A richly finished Inazuma-inspired roadside shrine: vermilion torii, gilded indigo roof, ivory guardian fox, luminous paper lanterns, offerings and a flowering garden.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction changes:
   * 1. Align torii collars to the inclined posts, eliminating their jagged intersections.
   * 2. Reduce and move the stone lanterns outward: the sanctuary, not its lamps, is the hero.
   * 3. Replace noisy wood grain with restrained painted timber; enrich the blue roof and red lacquer.
   * 4. Give the fox a cleaner silhouette and a quiet aureole rather than a second face behind its head.
   * 5. Finish the roof, altar and gate with deliberate gilded fittings and blossom motifs.
   * 6. Replace scattered grey-green ground clutter with planted banks, pink azaleas and seated petals.
   */
  const b = createBuilder({ name: "VioletFoxShrine", paintSize: 2048 });
  const root = b.joint("shrineRoot", { at: [0, 0, 0] });
  const random = rng(418);
  type Finish = string | ReturnType<typeof paint>;
  const C = {
    ink: "#29263e", blue: "#39476d", roofLight: "#8397bd",
    red: "#c84c58", redDark: "#773647", gold: "#dbb56d",
    goldLight: "#ffe2a1", ivory: "#fff1d7", white: "#f7efdf",
    purple: "#725793", moss: "#638166", grass: "#a2b584",
    earth: "#424b57", pink: "#e9aecf", light: "#ffdfac",
  };
  const lacquer = paint((p, n) =>
    mix("#a93648", "#e46c60",
      0.47 + n.y * 0.15 + n.z * 0.09 + (noise(p, 0.38, 7) - 0.5) * 0.10));
  const timber = paint((p, n) =>
    mix("#815541", "#af805b",
      0.47 + n.y * 0.16 + (noise(p, 0.34, 3) - 0.5) * 0.20));
  const darkTimber = paint((p, n) =>
    mix("#443344", "#65505c", 0.35 + n.y * 0.15 + noise(p, 0.4, 6) * 0.12));
  const stone = paint((p, n) =>
    mix("#758898", "#b6c5c5",
      0.43 + n.y * 0.18 + (noise(p, 0.35, 24) - 0.5) * 0.17));
  const ground = mottle("#81938b", "#a1ad98", { size: 0.7, contrast: 0.5, seed: 10 });
  const moss = mottle("#587d66", "#8ba078", { size: 0.32, contrast: 0.6, seed: 4 });
  const roofPaint = paint((p, n) =>
    mix("#354163", "#758cb4",
      0.27 + Math.max(0, n.y) * 0.46 + (noise(p, 0.5, 5) - 0.5) * 0.09));
  const brass = paint((p, n) =>
    mix("#ad8550", "#f9d891",
      0.47 + 0.31 * Math.max(n.y, 0) + (noise(p, 0.2, 8) - 0.5) * 0.08));

  function box(name: string, at: number[], size: number[], color: Finish, rotation = [0, 0, 0]) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color,
      { at, rotation, bone: root, name });
  }
  function cyl(
    name: string, at: number[], rt: number, rb: number, h: number,
    color: Finish, sides = 8, dir = [0, 1, 0],
  ) {
    return b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color,
      { at, dir, bone: root, name });
  }
  function oval(name: string, at: number[], size: number[], color: Finish, detail = 0) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color,
      { at, scale: size, bone: root, name, flat: true });
  }
  function line(name: string, points: number[][], radius: number, color: Finish) {
    return b.sweep(points, radius,
      { color, bone: root, sides: 6, caps: "round", name });
  }
  function plate(name: string, points: number[][], color: Finish, thickness = 0.02) {
    return b.slab(points, { color, thickness, bone: root, name });
  }
  function drawing(
    name: string, texture: THREE.Texture, at: number[], w: number, h: number, dir = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff",
      { at, texture, dir, axis: "z", bone: root, name });
  }
  function torus(
    name: string, at: number[], radius: number, tube: number,
    color: Finish, rotation = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 20), color,
      { at, rotation, bone: root, name });
  }

  const foxMark = `
    <path d="M25 59L18 18L40 34Q50 29 60 34L82 18L75 59L62 78L50 89L38 78Z"
      fill="#f8e6bb" stroke="#382c4b" stroke-width="3"/>
    <path d="M23 27L28 49L37 39Z M77 27L72 49L63 39Z" fill="#bd4f56"/>
    <path d="M29 54L44 60L37 65Z M71 54L56 60L63 65Z" fill="#6e4c85"/>
    <path d="M44 74L50 79L56 74L50 70Z" fill="#bd4f56"/>
    <path d="M46 42L50 35L54 42L50 50Z" fill="#d7ad58"/>`;
  const blossom = `
    <g fill="#ead099" stroke="#8c647e" stroke-width="1.5">
      <path d="M50 50C26 37 35 9 50 19C65 9 74 37 50 50Z"/>
      <path d="M50 50C26 37 35 9 50 19C65 9 74 37 50 50Z" transform="rotate(72 50 50)"/>
      <path d="M50 50C26 37 35 9 50 19C65 9 74 37 50 50Z" transform="rotate(144 50 50)"/>
      <path d="M50 50C26 37 35 9 50 19C65 9 74 37 50 50Z" transform="rotate(216 50 50)"/>
      <path d="M50 50C26 37 35 9 50 19C65 9 74 37 50 50Z" transform="rotate(288 50 50)"/>
      <circle cx="50" cy="50" r="7" fill="#fff0c6"/>
    </g>`;
  const crest = svg(`<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#665084" stroke="#e5c477" stroke-width="4"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#baa0cb" stroke-width="1.5"/>
    <g transform="translate(10 8) scale(.8)">${foxMark}</g>
    </svg>`, { size: 384 });
  const curtain = svg(`<svg viewBox="0 0 240 160">
    <rect width="240" height="160" fill="#70548f"/>
    <path d="M0 12H240 M0 145H240" stroke="#e0c17d" stroke-width="4"/>
    <path d="M0 21H240 M0 136H240" stroke="#baa0d1" stroke-width="2"/>
    <g fill="none" stroke="#9e84ba" stroke-width="2" opacity=".6">
      ${Array.from({ length: 9 }, (_, i) =>
        `<path d="M${i * 30 - 25} 160Q${i * 30} 100 ${i * 30 + 25} 160
        M${i * 30 - 25} 120Q${i * 30} 60 ${i * 30 + 25} 120"/>`).join("")}
    </g>
    <g transform="translate(74 27) scale(.92)">${blossom}</g>
    <path d="M13 38V117 M227 38V117" stroke="#d6bddb" stroke-width="2" stroke-dasharray="6 6"/>
    </svg>`, { size: 512 });
  const lanternArt = svg(`<svg viewBox="0 0 140 200">
    <g transform="translate(20 43)">${foxMark}</g>
    <path d="M70 141C51 151 60 170 70 175C82 164 85 148 70 141Z" fill="#b94948"/>
    <path d="M70 150V165" stroke="#ffe5a8" stroke-width="3"/>
    </svg>`, { size: 384 });
  const ofuda = svg(`<svg viewBox="0 0 90 220">
    <rect x="2" y="2" width="86" height="216" fill="#f2dfb6" stroke="#aa6c59" stroke-width="4"/>
    <rect x="10" y="10" width="70" height="200" fill="none" stroke="#b33e49" stroke-width="2"/>
    <circle cx="45" cy="39" r="18" fill="none" stroke="#a9444b" stroke-width="3"/>
    <path d="M45 22L57 43L33 43Z M24 72H66 M45 60V95 M28 84L62 97
      M29 115H61 M45 103V139 M26 135L65 119 M27 158H64 M35 147V179
      M55 147V179 M28 180H64" fill="none" stroke="#49363e" stroke-width="5"/>
    <rect x="33" y="190" width="24" height="15" fill="#b4484e"/>
    </svg>`, { size: 256 });
  const sign = svg(`<svg viewBox="0 0 120 200">
    <rect width="120" height="200" rx="9" fill="#302a43"/>
    <rect x="7" y="7" width="106" height="186" rx="5" fill="none" stroke="#e1bc6d" stroke-width="4"/>
    <path d="M60 18L72 30L60 42L48 30Z" fill="#e1bc6d"/>
    <text x="60" y="96" text-anchor="middle" font-size="47" font-family="serif" fill="#f6df9e">稲</text>
    <text x="60" y="151" text-anchor="middle" font-size="47" font-family="serif" fill="#f6df9e">荷</text>
    <path d="M35 176H85" stroke="#e1bc6d" stroke-width="3"/>
    </svg>`, { size: 384 });
  const prayer = svg(`<svg viewBox="0 0 160 100">
    <path d="M3 28L80 3L157 28V97H3Z" fill="#c79761" stroke="#603e39" stroke-width="5"/>
    <path d="M12 32L80 12L148 32" stroke="#efd39a" stroke-width="3" fill="none"/>
    <g transform="translate(47 21) scale(.54)">${foxMark}</g>
    <path d="M19 53V82 M29 55V76 M130 49V81 M140 58V77" stroke="#77474b" stroke-width="3"/>
    </svg>`, { size: 256 });
  const offeringLabel = svg(`<svg viewBox="0 0 180 90">
    <rect x="2" y="2" width="176" height="86" rx="5" fill="#4b3440" stroke="#dfbd76" stroke-width="4"/>
    <path d="M16 45L25 32L34 45L25 58Z M146 45L155 32L164 45L155 58Z" fill="#dfbd76"/>
    <text x="90" y="58" text-anchor="middle" font-family="serif" font-size="37" fill="#efdba6">奉納</text>
    </svg>`, { size: 256 });
  const sidePanelArt = svg(`<svg viewBox="0 0 160 220">
    <rect width="160" height="220" fill="#57425e"/>
    <rect x="7" y="7" width="146" height="206" fill="none" stroke="#bca16f" stroke-width="3"/>
    <rect x="15" y="15" width="130" height="190" fill="none" stroke="#8c7595" stroke-width="2"/>
    <g fill="none" stroke="#927ca4" stroke-width="2">
      <path d="M24 181Q80 142 136 181 M24 189Q80 150 136 189 M24 197Q80 158 136 197"/>
      <path d="M24 39Q80 78 136 39 M24 31Q80 70 136 31 M24 23Q80 62 136 23"/>
    </g>
    <circle cx="80" cy="110" r="47" fill="#675080" stroke="#d8b779" stroke-width="3"/>
    <g transform="translate(38 65) scale(.84)">${foxMark}</g>
    </svg>`, { size: 384 });
  const aureole = svg(`<svg viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="96" fill="#c5a06a" stroke="#ffdfa0" stroke-width="3"/>
    <circle cx="100" cy="100" r="85" fill="#6b4867" stroke="#efcf8b" stroke-width="2"/>
    <circle cx="100" cy="100" r="69" fill="none" stroke="#b79785" stroke-width="2"/>
    ${Array.from({ length: 12 }, (_, i) =>
      `<path d="M100 11L104 20L100 29L96 20Z" fill="#f9df9f" transform="rotate(${i * 30} 100 100)"/>`).join("")}
    <path d="M40 137Q70 112 100 137Q130 162 160 137
      M40 145Q70 120 100 145Q130 170 160 145" fill="none" stroke="#a68a93" stroke-width="2"/>
    </svg>`, { size: 384 });
  const blossomSeal = svg(`<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#5e466f" stroke="#e5c180" stroke-width="3"/>
    ${blossom}</svg>`, { size: 256 });

  // Grounded, clipped display island.
  const island = [
    [-2.22, -1.42], [-1.8, -1.7], [1.76, -1.7], [2.23, -1.31],
    [2.23, 1.36], [1.83, 1.79], [-1.77, 1.79], [-2.22, 1.38],
  ];
  b.extrude(island, {
    at: [0, 0.095, 0], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.19, color: C.earth, bone: root, name: "cutStoneIsland",
  });
  b.extrude(island.map(([x, z]) => [x * 0.98, z * 0.98]), {
    at: [0, 0.193, 0], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.025, color: ground, bone: root, name: "gardenSurface",
  });
  for (let row = 0; row < 3; row++) {
    for (let side = 0; side < 2; side++) {
      box("approachPaver",
        [(side - 0.5) * 0.48 + (row % 2 ? 0.025 : -0.012), 0.233, 1.52 - row * 0.34],
        [0.455, 0.065, 0.30], stone, [0, (random() - 0.5) * 3, 0]);
    }
  }
  box("foundationFoot", [0, 0.285, -0.61], [1.77, 0.16, 1.54], stone);
  box("foundationTop", [0, 0.39, -0.61], [1.86, 0.09, 1.63], stone);
  box("lowerStep", [0, 0.28, 0.40], [1.02, 0.15, 0.41], stone);
  box("upperStep", [0, 0.365, 0.23], [1.02, 0.13, 0.34], stone);
  box("verandaUnderframe", [0, 0.455, -0.60], [1.70, 0.08, 1.46], darkTimber);
  for (let i = 0; i < 9; i++)
    box("verandaPlank", [0, 0.506, -1.24 + i * 0.16], [1.70, 0.035, 0.151], timber);
  box("verandaFrontFascia", [0, 0.467, 0.136], [1.72, 0.075, 0.05], lacquer);
  box("verandaFasciaGilt", [0, 0.494, 0.164], [1.66, 0.012, 0.012], brass);

  // Open sanctuary, raised altar and a quiet halo.
  box("sanctuaryBack", [0, 1.08, -1.13], [1.22, 1.15, 0.10], darkTimber);
  for (const s of [-1, 1])
    box("sanctuarySide", [s * 0.59, 1.08, -0.75], [0.085, 1.15, 0.76], timber);
  box("altarSolidPlinth", [0, 0.565, -0.72], [0.78, 0.10, 0.48], darkTimber);
  box("innerAltar", [0, 0.675, -0.72], [0.89, 0.14, 0.55], C.redDark);
  box("innerAltarLip", [0, 0.755, -0.72], [0.98, 0.045, 0.61], brass);
  box("altarFrontInset", [0, 0.675, -0.436], [0.76, 0.073, 0.018], C.purple);
  for (let i = -2; i <= 2; i++)
    drawing("altarBlossom", blossomSeal, [i * 0.145, 0.675, -0.423], 0.055, 0.055);
  box("innerRecess", [0, 1.12, -1.068], [0.96, 0.86, 0.012], "#57384f");
  cyl("haloBacking", [0, 1.17, -1.04], 0.32, 0.32, 0.025, brass, 24, [0, 0, 1]);
  drawing("sacredAureole", aureole, [0, 1.17, -1.023], 0.625, 0.625);

  for (const s of [-1, 1]) {
    const x = s * 0.57;
    box("frontShrinePillar", [x, 1.1, -0.325], [0.12, 1.18, 0.14], lacquer);
    box("pillarFoot", [x, 0.575, -0.325], [0.155, 0.11, 0.18], darkTimber);
    box("pillarGoldCollar", [x, 1.545, -0.325], [0.132, 0.045, 0.152], brass);
    box("pillarCapital", [x, 1.66, -0.325], [0.22, 0.095, 0.23], lacquer);
    box("doorLeaf", [s * 0.438, 1.115, -0.285], [0.20, 0.89, 0.052], C.redDark);
    box("doorInset", [s * 0.438, 1.17, -0.253], [0.15, 0.66, 0.012], darkTimber);
    for (let j = 0; j < 3; j++)
      box("doorVerticalLattice", [s * 0.438 + (j - 1) * 0.05, 1.17, -0.237],
        [0.014, 0.67, 0.022], brass);
    for (let j = 0; j < 4; j++)
      box("doorHorizontalLattice", [s * 0.438, 0.89 + j * 0.18, -0.227],
        [0.17, 0.013, 0.019], timber);
    cyl("doorPull", [s * 0.36, 0.99, -0.209], 0.022, 0.022, 0.02, brass, 8, [0, 0, 1]);
    for (const z of [-1.075, -0.425])
      box("sidePanelUpright", [s * 0.647, 1.09, z], [0.047, 1.07, 0.06], lacquer);
    for (const y of [0.63, 1.51])
      box("sidePanelCrossRail", [s * 0.65, y, -0.75], [0.055, 0.055, 0.65], lacquer);
    box("sidePanelRecess", [s * 0.637, 1.09, -0.75], [0.028, 0.71, 0.49], C.purple);
    drawing("sidePanelHeraldry", sidePanelArt, [s * 0.654, 1.09, -0.75], 0.46, 0.68, [s, 0, 0]);
    for (const z of [-1.075, -0.425])
      for (const y of [0.63, 1.51])
        cyl("sidePanelStud", [s * 0.681, y, z], 0.014, 0.014, 0.01, brass, 6, [s, 0, 0]);
  }
  box("cabinetLintel", [0, 1.686, -0.72], [1.39, 0.13, 0.98], lacquer);
  box("lintelGoldEdge", [0, 1.624, -0.228], [1.36, 0.025, 0.023], brass);
  for (const z of [-0.23, -1.20])
    plate("closedRoofGable", [[-0.70, 1.745, z], [0.70, 1.745, z], [0, 2.217, z]], darkTimber, 0.055);
  plate("gableInset", [[-0.49, 1.78, -0.194], [0.49, 1.78, -0.194], [0, 2.12, -0.194]], lacquer);
  drawing("gableCrest", crest, [0, 1.92, -0.172], 0.225, 0.225);
  for (const s of [-1, 1]) {
    line("gableGoldChevron", [[s * 0.49, 1.792, -0.178], [s * 0.10, 2.064, -0.178]], 0.008, brass);
    drawing("gableBlossom", blossomSeal, [s * 0.32, 1.827, -0.17], 0.068, 0.068);
  }

  const roofX = [0, 0.28, 0.56, 0.80, 1.00];
  const roofY = [2.265, 2.13, 1.955, 1.87, 1.945];
  for (const s of [-1, 1]) {
    for (const z of [-0.28, -0.72, -1.17]) {
      box("eaveSupportBlock", [s * 0.62, 1.78, z], [0.14, 0.13, 0.13], lacquer);
      line("angledEaveBracket", [[s * 0.57, 1.735, z], [s * 0.78, 1.835, z]], 0.034, darkTimber);
    }
    for (let k = 0; k < roofX.length - 1; k++)
      plate("curvedRoofPanel", [
        [s * roofX[k], roofY[k], 0.045], [s * roofX[k + 1], roofY[k + 1], 0.045],
        [s * roofX[k + 1], roofY[k + 1], -1.43], [s * roofX[k], roofY[k], -1.43],
      ], roofPaint, 0.055);
    for (let tile = 0; tile < 8; tile++) {
      const z = -1.39 + tile * 0.198;
      line("raisedTileRib", roofX.map((x, i) => [s * x, roofY[i] + 0.032, z]), 0.016, C.roofLight);
    }
    for (const z of [0.074, -1.455]) {
      line("roofBargeboard", roofX.map((x, i) => [s * x, roofY[i] - 0.015, z]), 0.046, C.ink);
      line("gildedRoofEdge", roofX.map((x, i) => [s * x, roofY[i] + 0.006, z + 0.025]), 0.011, brass);
    }
    line("eaveRoll", [[s, 1.948, -1.46], [s, 1.948, 0.08]], 0.038, C.blue);
    for (const z of [-1.46, 0.08]) {
      cyl("eaveEndMedallion", [s, 1.948, z + 0.019], 0.041, 0.041, 0.014, brass, 10, [0, 0, 1]);
      if (z > 0) drawing("eaveBlossomSeal", blossomSeal, [s, 1.948, z + 0.028], 0.067, 0.067);
    }
  }
  line("roofRidge", [[0, 2.27, -1.47], [0, 2.27, 0.11]], 0.064, C.ink);
  line("roofRidgeGilding", [[0, 2.324, -1.47], [0, 2.324, 0.11]], 0.014, brass);
  for (const z of [-1.48, 0.12])
    line("ridgeHorn", [
      [0, 2.27, z], [0, 2.33, z + (z > 0 ? 0.09 : -0.09)],
      [0, 2.43, z + (z > 0 ? 0.11 : -0.11)],
    ], 0.031, brass);
  for (const z of [-1.15, -0.70, -0.25])
    cyl("ridgeSaddle", [0, 2.285, z], 0.073, 0.073, 0.032, brass, 8, [0, 0, 1]);

  line("curtainRail", [[-0.58, 1.61, -0.18], [0.58, 1.61, -0.18]], 0.018, brass);
  for (let i = -1; i <= 1; i++) {
    const x = i * 0.345;
    box("curtainBacking", [x, 1.519, -0.176], [0.327, 0.161, 0.018], C.purple);
    drawing("embroideredNoren", curtain, [x, 1.519, -0.165], 0.327, 0.161);
    for (const dx of [-0.11, 0.11])
      torus("curtainLoop", [x + dx, 1.598, -0.18], 0.022, 0.005, C.gold, [0, 90, 0]);
  }

  // Carved statue, deliberately not rigged as a living animal.
  oval("foxHaunches", [0, 0.91, -0.66], [0.16, 0.20, 0.14], C.white);
  b.frustumBox([0, 0.82, -0.60], [0, 1.14, -0.59], [0.24, 0.19], [0.17, 0.14],
    { color: C.white, bone: root, name: "foxUprightChest" });
  oval("foxHead", [0, 1.20, -0.56], [0.163, 0.13, 0.12], C.white);
  b.frustumBox([0, 1.18, -0.51], [0, 1.155, -0.365], [0.14, 0.10], [0.055, 0.05],
    { color: C.white, bone: root, name: "carvedFoxMuzzle" });
  oval("foxNose", [0, 1.158, -0.355], [0.026, 0.015, 0.017], C.redDark);
  for (const s of [-1, 1]) {
    plate("foxEar", [
      [s * 0.045, 1.26, -0.56], [s * 0.137, 1.25, -0.55], [s * 0.115, 1.415, -0.56],
    ], C.white, 0.075);
    plate("foxInnerEar", [
      [s * 0.067, 1.285, -0.513], [s * 0.119, 1.279, -0.513], [s * 0.111, 1.37, -0.513],
    ], C.red, 0.009);
    line("carvedFoxEye", [
      [s * 0.045, 1.217, -0.452], [s * 0.08, 1.226, -0.459], [s * 0.105, 1.243, -0.468],
    ], 0.008, C.ink);
    line("foxCheekPaint", [[s * 0.089, 1.189, -0.465], [s * 0.116, 1.205, -0.471]], 0.009, C.red);
    box("foxForeleg", [s * 0.072, 0.88, -0.515], [0.064, 0.23, 0.075], C.white);
    oval("foxPaw", [s * 0.072, 0.784, -0.477], [0.056, 0.035, 0.073], C.white);
  }
  plate("foxForeheadMark", [
    [0, 1.282, -0.469], [0.016, 1.262, -0.453], [0, 1.24, -0.444], [-0.016, 1.262, -0.453],
  ], C.red, 0.006);
  b.sweep(catmull([
    [0.11, 0.82, -0.73], [0.22, 0.88, -0.75], [0.255, 1.02, -0.73], [0.22, 1.14, -0.70],
  ]), [0.064, 0.068, 0.047, 0],
  { color: C.white, bone: root, sides: 6, name: "carvedFoxTail" });
  plate("foxRedBib", [
    [-0.101, 1.101, -0.477], [0.101, 1.101, -0.477], [0.08, 0.96, -0.449],
    [0, 0.92, -0.439], [-0.08, 0.96, -0.449],
  ], C.red, 0.018);
  line("foxBibGoldHem", [[-0.081, 0.969, -0.435], [0, 0.931, -0.424], [0.081, 0.969, -0.435]], 0.005, brass);
  cyl("foxBibBell", [0, 1.023, -0.428], 0.025, 0.025, 0.017, brass, 8, [0, 0, 1]);

  for (const s of [-1, 1]) {
    for (const z of [-1.19, -0.67, -0.14]) {
      box("verandaPost", [s * 0.78, 0.695, z], [0.07, 0.37, 0.07], lacquer);
      box("verandaPostCap", [s * 0.78, 0.891, z], [0.105, 0.04, 0.105], C.ink);
      cyl("verandaCapStud", [s * 0.78, 0.921, z], 0.025, 0.031, 0.02, brass);
    }
    box("verandaHandrail", [s * 0.78, 0.81, -0.66], [0.065, 0.055, 1.18], lacquer);
    box("verandaLowerRail", [s * 0.78, 0.625, -0.66], [0.045, 0.035, 1.10], darkTimber);
  }

  box("offeringChestFeet", [0, 0.295, 0.65], [0.78, 0.15, 0.40], darkTimber);
  box("offeringChest", [0, 0.48, 0.65], [0.88, 0.30, 0.43], timber);
  box("chestTopRim", [0, 0.648, 0.65], [0.96, 0.065, 0.49], darkTimber);
  box("chestSlotDarkness", [0, 0.683, 0.65], [0.84, 0.014, 0.39], C.ink);
  for (let i = 0; i < 7; i++)
    box("offeringChestSlat", [(i - 3) * 0.116, 0.707, 0.65], [0.066, 0.043, 0.415], timber);
  drawing("dedicationPlaque", offeringLabel, [0, 0.491, 0.871], 0.36, 0.18);
  for (const s of [-1, 1]) {
    box("chestCornerStrap", [s * 0.391, 0.49, 0.873], [0.035, 0.27, 0.017], brass);
    for (const y of [0.39, 0.58])
      cyl("chestRivet", [s * 0.391, y, 0.887], 0.01, 0.01, 0.009, C.goldLight, 6, [0, 0, 1]);
    box("chestSideInset", [s * 0.445, 0.48, 0.65], [0.012, 0.185, 0.28], darkTimber);
    drawing("chestSideBlossom", blossomSeal, [s * 0.454, 0.48, 0.65], 0.13, 0.13, [s, 0, 0]);
  }

  function dish(x: number, z: number, r: number) {
    return b.lathe(
      [[0, 0], [r * 0.55, 0], [r, 0.031], [r, 0.045], [r * 0.82, 0.035], [0, 0.025]],
      { at: [x, 0.535, z], color: C.redDark, segments: 12, bone: root, name: "lacquerOfferingDish" });
  }
  dish(-0.56, 0.02, 0.16);
  for (const [dx, dy, dz] of [[-0.062, 0, 0], [0.065, 0, 0], [0, 0.095, -0.008]]) {
    oval("offeredMandarin", [-0.56 + dx, 0.625 + dy, 0.02 + dz], [0.068, 0.061, 0.065], "#edaa53", 1);
    line("mandarinStem", [
      [-0.56 + dx, 0.679 + dy, 0.02 + dz], [-0.554 + dx, 0.694 + dy, 0.02 + dz],
    ], 0.009, C.moss);
  }
  dish(0.56, 0.02, 0.15);
  cyl("riceBowlFoot", [0.56, 0.586, 0.02], 0.065, 0.055, 0.065, C.white, 10);
  cyl("riceBowl", [0.56, 0.637, 0.02], 0.12, 0.062, 0.09, C.white, 12);
  oval("riceMound", [0.56, 0.697, 0.02], [0.109, 0.063, 0.104], C.ivory, 1);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const r = 0.064 * Math.sqrt(random());
    oval("riceGrain", [0.56 + Math.cos(a) * r, 0.742 - r * 0.25, 0.02 + Math.sin(a) * r],
      [0.009, 0.006, 0.016], C.white);
  }
  for (const s of [-1, 1]) {
    const x = s * 0.34;
    b.lathe(
      [[0, 0], [0.07, 0], [0.085, 0.05], [0.076, 0.145], [0.038, 0.205],
        [0.034, 0.27], [0.044, 0.278], [0.044, 0.293], [0, 0.293]],
      { at: [x, 0.525, -0.19], color: C.white, segments: 10, bone: root, name: "sakeBottle" });
    cyl("sakeCork", [x, 0.827, -0.19], 0.032, 0.035, 0.035, C.redDark);
    drawing("bottlePaperSeal", ofuda, [x, 0.661, -0.111], 0.064, 0.145);
  }

  // All post fittings share the same inclined axis and polygon phase.
  const gateZ = 0.43;
  function postPoint(s: number, y: number) {
    return [s * (1.25 - (y - 0.50) * 0.09 / 2.40), y, gateZ];
  }
  function postRadius(y: number) {
    return 0.137 - (y - 0.50) / 2.40 * 0.025;
  }
  function postBand(s: number, y: number, h: number, extra: number, color: Finish, name: string) {
    b.rod(postPoint(s, y - h / 2), postPoint(s, y + h / 2),
      [postRadius(y - h / 2) + extra, postRadius(y + h / 2) + extra],
      { bone: root, color, sides: 10, name });
  }
  for (const s of [-1, 1]) {
    cyl("toriiStoneShoe", [s * 1.25, 0.29, gateZ], 0.245, 0.28, 0.17, stone);
    b.rod(postPoint(s, 0.36), postPoint(s, 0.70), [0.173, 0.149],
      { color: C.ink, bone: root, sides: 10, name: "toriiBlackBoot" });
    b.rod(postPoint(s, 0.50), postPoint(s, 2.90), [0.137, 0.112],
      { color: lacquer, bone: root, sides: 10, name: "vermilionToriiPillar" });
    postBand(s, 0.705, 0.044, 0.019, brass, "bootGoldBand");
    postBand(s, 2.53, 0.065, 0.016, C.redDark, "pillarUpperBand");
    box("toriiPillarCapital", [s * 1.16, 2.87, gateZ], [0.34, 0.11, 0.35], C.redDark);
    for (const y of [0.78, 2.43]) {
      const p = postPoint(s, y);
      cyl("pillarFrontFastener", [p[0], y, gateZ + postRadius(y) + 0.008],
        0.022, 0.022, 0.015, brass, 8, [0, 0, 1]);
    }
  }
  box("toriiLowerCrossbeam", [0, 2.53, gateZ], [3.02, 0.155, 0.21], lacquer);
  box("crossbeamUnderside", [0, 2.442, gateZ], [2.96, 0.028, 0.225], C.redDark);
  for (const s of [-1, 1]) {
    box("beamBlackEnd", [s * 1.48, 2.53, gateZ], [0.10, 0.182, 0.24], C.ink);
    box("beamEndGilt", [s * 1.428, 2.53, gateZ + 0.123], [0.018, 0.15, 0.012], brass);
    box("toriiUprightSpacer", [s * 0.49, 2.72, gateZ], [0.075, 0.32, 0.17], lacquer);
    drawing("crossbeamBlossom", blossomSeal, [s * 0.76, 2.53, gateZ + 0.109], 0.106, 0.106);
  }
  b.extrude(
    [[-1.70, 2.91], [-1.34, 2.85], [-0.70, 2.82], [0.70, 2.82], [1.34, 2.85],
      [1.70, 2.91], [1.70, 3.03], [1.30, 2.99], [0.70, 2.97], [-0.70, 2.97],
      [-1.30, 2.99], [-1.70, 3.03]],
    { at: [0, 0, gateZ], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.29, color: lacquer, bone: root, name: "toriiSweepingLintel" });
  b.extrude(
    [[-1.83, 3.01], [-1.32, 2.965], [-0.70, 2.945], [0.70, 2.945], [1.32, 2.965],
      [1.83, 3.01], [1.90, 3.145], [1.32, 3.087], [0.70, 3.065], [-0.70, 3.065],
      [-1.32, 3.087], [-1.90, 3.145]],
    { at: [0, 0, gateZ], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.38, color: C.ink, bone: root, name: "toriiBlackCrown" });
  line("toriiCrownFineGilt", [
    [-1.82, 3.025, 0.628], [-1.30, 2.981, 0.628], [-0.70, 2.962, 0.628],
    [0.70, 2.962, 0.628], [1.30, 2.981, 0.628], [1.82, 3.025, 0.628],
  ], 0.012, brass);
  box("gateSignBacking", [0, 2.719, 0.601], [0.292, 0.435, 0.055], brass);
  drawing("gateCalligraphy", sign, [0, 2.719, 0.632], 0.264, 0.407);

  const ropePoints: number[][] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    ropePoints.push([-1.15 + t * 2.30, 2.40 - 0.185 * Math.sin(Math.PI * t), 0.585]);
  }
  line("sacredRopeCore", ropePoints, 0.031, "#baa078");
  for (const phase of [0, Math.PI])
    line("twistedStrawStrand", ropePoints.map((p, i) => {
      const a = i / 80 * Math.PI * 30 + phase;
      return [p[0], p[1] + Math.cos(a) * 0.025, p[2] + Math.sin(a) * 0.025];
    }), 0.012, "#dfc796");
  for (const x of [-0.80, -0.39, 0.39, 0.80]) {
    const y = 2.40 - 0.185 * Math.sin(Math.PI * ((x + 1.15) / 2.30));
    line("shideTie", [[x, y, 0.61], [x, y - 0.07, 0.62]], 0.009, C.ivory);
    b.extrude(
      [[-0.04, 0], [0.035, 0], [0.035, -0.075], [0.085, -0.075], [0.085, -0.14],
        [0.03, -0.14], [0.03, -0.22], [-0.035, -0.22], [-0.035, -0.115],
        [0.016, -0.115], [0.016, -0.055], [-0.04, -0.055]],
      { at: [x, y - 0.05, 0.622], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.009, color: C.white, bone: root, name: "foldedSacredPaper" });
  }

  const lampProfile = [
    [0, -0.235], [0.095, -0.235], [0.143, -0.17], [0.163, -0.07],
    [0.163, 0.08], [0.14, 0.18], [0.095, 0.225], [0, 0.225],
  ];
  function lampRadius(y: number) {
    const wall = lampProfile.slice(1, -1);
    for (let i = 0; i < wall.length - 1; i++) {
      if (y >= wall[i][1] && y <= wall[i + 1][1]) {
        const t = (y - wall[i][1]) / (wall[i + 1][1] - wall[i][1]);
        return wall[i][0] + (wall[i + 1][0] - wall[i][0]) * t;
      }
    }
    return 0.095;
  }
  for (const s of [-1, 1]) {
    const x = s * 0.99;
    const z = 0.45;
    line("paperLanternHanger", [[x, 2.45, z], [x, 2.275, z]], 0.012, C.ink);
    torus("paperLanternHandle", [x, 2.28, z], 0.041, 0.008, brass);
    const lantern = b.lathe(lampProfile, {
      at: [x, 2.015, z], segments: 12, color: C.light, bone: root, name: "glowingPaperLantern",
    });
    glow(lantern, 0.75);
    for (let i = 0; i < 8; i++) {
      const dy = -0.19 + i * 0.052;
      torus("paperLanternBambooHoop", [x, 2.015 + dy, z],
        lampRadius(dy) - 0.003, 0.003, "#c79765", [90, 0, 0]);
    }
    cyl("lanternTopCap", [x, 2.25, z], 0.101, 0.105, 0.036, C.ink, 10);
    cyl("lanternBottomCap", [x, 1.78, z], 0.105, 0.095, 0.04, C.ink, 10);
    b.decal(lantern, lanternArt, {
      at: [x, 2.015, z + 0.17], dir: [0, 0, 1], size: [0.21, 0.37],
      lift: 0.004, segments: 10, bone: root, name: "paperLanternFoxDrawing",
    });
    line("lanternTasselCord", [[x, 1.76, z], [x, 1.69, z]], 0.011, C.redDark);
    cyl("lanternTasselKnot", [x, 1.684, z], 0.024, 0.021, 0.035, brass);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      line("silkTassel", [
        [x + Math.cos(a) * 0.012, 1.67, z + Math.sin(a) * 0.012],
        [x + Math.cos(a) * 0.028, 1.54, z + Math.sin(a) * 0.028],
      ], 0.009, C.red);
    }
  }

  // Smaller stone lanterns leave the offerings and doorway visible.
  function stoneLantern(x: number, z: number) {
    const k = 0.84;
    const p = (dx: number, y: number, dz: number) => [x + dx * k, 0.205 + (y - 0.205) * k, z + dz * k];
    const sz = (a: number, c: number, d: number) => [a * k, c * k, d * k];
    cyl("lanternFoundation", p(0, 0.255, 0), 0.29 * k, 0.33 * k, 0.10 * k, stone, 6);
    cyl("lanternFoot", p(0, 0.34, 0), 0.21 * k, 0.26 * k, 0.10 * k, stone, 6);
    cyl("lanternPedestal", p(0, 0.565, 0), 0.105 * k, 0.14 * k, 0.36 * k, stone, 6);
    cyl("lanternShaftCollar", p(0, 0.705, 0), 0.15 * k, 0.12 * k, 0.07 * k, stone, 6);
    cyl("lanternChamberTray", p(0, 0.79, 0), 0.285 * k, 0.18 * k, 0.12 * k, stone, 4);
    box("lanternWindowBottom", p(0, 0.865, 0), sz(0.36, 0.07, 0.36), stone);
    glow(box("lanternWarmCore", p(0, 1.01, 0), sz(0.255, 0.24, 0.255), "#ffd395"), 0.95);
    for (const sx of [-1, 1])
      for (const zs of [-1, 1])
        box("lanternWindowCorner", p(sx * 0.157, 1.015, zs * 0.157), sz(0.062, 0.30, 0.062), stone);
    for (const s of [-1, 1]) {
      box("lanternFrontMullion", p(s * 0.062, 1.015, 0.163), sz(0.018, 0.24, 0.027), C.ink);
      box("lanternSideMullion", p(0.163, 1.015, s * 0.062), sz(0.027, 0.24, 0.018), C.ink);
      box("lanternOppositeMullion", p(-0.163, 1.015, s * 0.062), sz(0.027, 0.24, 0.018), C.ink);
    }
    box("lanternWindowTop", p(0, 1.18, 0), sz(0.39, 0.07, 0.39), stone);
    b.lathe(
      [[0, 0], [0.37, 0], [0.40, 0.055], [0.30, 0.088],
        [0.155, 0.22], [0.10, 0.25], [0, 0.25]].map(([r, y]) => [r * k, y * k]),
      { at: p(0, 1.20, 0), segments: 4, spin: 45, color: stone, bone: root, name: "stonePagodaRoof" });
    cyl("lanternFinialSeat", p(0, 1.472, 0), 0.10 * k, 0.13 * k, 0.055 * k, stone);
    oval("lanternJewelFinial", p(0, 1.565, 0), sz(0.087, 0.105, 0.087), stone);
    drawing("lanternShaftTalisman", ofuda, p(0, 0.56, 0.123), 0.071 * k, 0.18 * k);
  }
  stoneLantern(-1.79, 0.96);
  stoneLantern(1.79, 0.96);

  for (const x of [1.28, 1.91]) {
    box("prayerRackLeg", [x, 0.75, -0.92], [0.065, 1.07, 0.075], timber);
    cyl("prayerRackStoneFoot", [x, 0.255, -0.92], 0.10, 0.12, 0.09, stone, 6);
  }
  box("prayerRackTop", [1.595, 1.31, -0.92], [0.83, 0.09, 0.15], C.ink);
  box("prayerRackGoldEdge", [1.595, 1.276, -0.839], [0.79, 0.013, 0.01], brass);
  box("prayerRackRail", [1.595, 1.08, -0.92], [0.69, 0.042, 0.055], timber);
  for (let i = 0; i < 3; i++) {
    const x = 1.37 + i * 0.225;
    const y = i === 1 ? 0.84 : 0.90;
    line("emaString", [
      [x - 0.025, 1.09, -0.90], [x, y + 0.063, -0.846], [x + 0.025, 1.09, -0.90],
    ], 0.005, C.ivory);
    b.extrude(
      [[-0.095, -0.06], [0.095, -0.06], [0.095, 0.045], [0, 0.083], [-0.095, 0.045]],
      { at: [x, y, -0.86], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.022, color: timber, bone: root, name: "woodenPrayerPlaque" });
    drawing("emaFoxDrawing", prayer, [x, y + 0.006, -0.846], 0.181, 0.128);
  }

  // Planted banks, rather than isolated green caps on every rock.
  for (const [x, z, rx, rz] of [
    [-1.65, -1.02, 0.46, 0.40], [1.69, -1.26, 0.40, 0.29],
    [-1.84, 0.02, 0.26, 0.26], [1.89, 0.03, 0.24, 0.26],
    [-1.11, 1.32, 0.27, 0.22], [1.12, 1.43, 0.27, 0.18],
  ])
    oval("lowMossBank", [x, 0.213, z], [rx, 0.038, rz], moss, 1);
  const rocks = [
    [-1.83, -1.22, 0.27, 0.22], [-1.49, -1.39, 0.22, 0.15],
    [-1.98, -0.57, 0.18, 0.14], [1.89, -1.37, 0.23, 0.17],
    [2.01, 0.02, 0.13, 0.10], [-1.95, 0.07, 0.14, 0.10],
    [1.10, 1.43, 0.14, 0.08], [-1.12, 1.40, 0.14, 0.08],
  ];
  for (const [x, z, r, h] of rocks)
    oval("gardenBoulder", [x, 0.20 + h * 0.65, z], [r, h, r * 0.8], stone);

  function grassTuft(x: number, z: number, height: number) {
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4;
      const dx = Math.cos(a) * height * 0.4;
      const dz = Math.sin(a) * height * 0.4;
      plate("broadGrassBlade", [
        [x - 0.017, 0.204, z], [x + 0.017, 0.204, z],
        [x + dx * 0.6 + 0.01, 0.21 + height * 0.6, z + dz * 0.6],
        [x + dx, 0.21 + height, z + dz],
      ], i % 2 ? C.moss : C.grass, 0.004);
    }
  }
  for (const [x, z, h] of [
    [-1.99, -0.28, 0.20], [-1.20, -1.43, 0.21], [2.02, -0.33, 0.20],
    [1.05, -1.46, 0.19], [-0.96, 1.47, 0.12], [1.30, 1.45, 0.13],
    [-1.95, 1.39, 0.13], [1.99, 1.40, 0.12],
  ]) grassTuft(x, z, h);

  function azalea(x: number, z: number, scale: number, seed: number) {
    line("azaleaTrunk", [[x, 0.205, z], [x, 0.205 + 0.28 * scale, z]], 0.03 * scale, darkTimber);
    const clouds = [];
    for (let i = 0; i < 7; i++) {
      const a = i * 2.399;
      const r = i === 0 ? 0 : 0.18 * scale;
      const xx = x + Math.cos(a) * r;
      const zz = z + Math.sin(a) * r;
      const yy = 0.205 + (0.28 + (i % 3) * 0.055) * scale;
      clouds.push(oval("azaleaLeafCloud", [xx, yy, zz],
        [0.21 * scale, 0.145 * scale, 0.19 * scale], moss));
    }
    const hits = b.surface(clouds).scatter(scale > 0.8 ? 26 : 16, {
      rng: rng(seed), minDist: 0.07 * scale, filter: (h) => h.n.y > 0.05,
    });
    const petal = new THREE.SphereGeometry(1, 5, 3);
    hits.forEach((hit, i) => {
      const color = i % 3 === 0 ? "#f5cbe1" : i % 3 === 1 ? "#d88bb5" : "#e9a9cc";
      for (let j = 0; j < 5; j++) {
        const a = j * Math.PI * 2 / 5;
        b.part(petal, color, {
          frame: hit,
          at: hit.local([Math.cos(a) * 0.030 * scale, 0.008 * scale, Math.sin(a) * 0.030 * scale]),
          scale: [0.028 * scale, 0.012 * scale, 0.028 * scale],
          bone: root, name: "azaleaPetal",
        });
      }
      b.stick(new THREE.SphereGeometry(0.012 * scale, 6, 4), C.goldLight, hit,
        { embed: 0.08, name: "azaleaFlowerCenter" });
    });
  }
  azalea(-1.57, -0.98, 1.05, 812);
  azalea(1.67, -1.37, 0.56, 813);

  // Petals rest on the actual ground or paving, never suspended over the path.
  for (let i = 0; i < 29; i++) {
    const x = (random() - 0.5) * 3.8;
    const z = (random() - 0.5) * 2.9;
    if (Math.abs(x) < 0.92 && z < 0.92) continue;
    const a = random() * Math.PI * 2;
    const dx = Math.cos(a) * 0.029;
    const dz = Math.sin(a) * 0.029;
    const y = Math.abs(x) < 0.45 && z > 0.92 ? 0.268 : 0.208;
    plate("fallenSakuraPetal", [
      [x - dx, y, z - dz], [x - dz * 0.55, y + 0.001, z + dx * 0.55],
      [x + dx, y, z + dz], [x + dz * 0.45, y + 0.001, z - dx * 0.45],
    ], i % 2 ? C.pink : "#f5d1e3", 0.003);
  }
  cyl("votiveSaucer", [-0.67, 0.55, -0.70], 0.085, 0.075, 0.045, brass, 10);
  cyl("votiveCandle", [-0.67, 0.615, -0.70], 0.042, 0.045, 0.11, C.ivory);
  glow(oval("votiveFlame", [-0.67, 0.716, -0.70], [0.023, 0.048, 0.023], "#ffe1a2"), 1.7);

  return b.root;
}
