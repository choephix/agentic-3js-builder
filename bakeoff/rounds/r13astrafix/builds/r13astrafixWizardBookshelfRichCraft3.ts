import * as THREE from "three";
import {
  createBuilder,
  svg,
  grain,
  paint,
  mix,
  noise,
  rng,
  catmull,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Moonward Archive",
  description:
    "An ornate high-fantasy bookshelf filled with gilded spellbooks, sealed scrolls, luminous crystal orbs and dripping candles. Midnight lacquer, plum wood and moon-gold fittings surround a little celestial archive.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "MoonwardArchive", paintSize: 2048 });
  const random = rng(2047);

  const C = {
    ink: "#17182f",
    wood: "#38253e",
    edge: "#68455d",
    navy: "#26354e",
    teal: "#287278",
    turquoise: "#5dc9c3",
    purple: "#655081",
    plum: "#853c68",
    red: "#9b4659",
    cream: "#f5e4b3",
    paper: "#ddc991",
    wax: "#ffe5ae",
    waxShadow: "#d7b57e",
    gold: "#d8ad64",
    paleGold: "#ffe4a1",
    darkGold: "#8a603c",
    blue: "#405c89",
  };

  const woodGrain = grain("#39283c", "#684454", {
    size: 0.035,
    axis: "y",
    seed: 9,
  });
  const shelfGrain = grain("#38293d", "#785067", {
    size: 0.03,
    axis: "x",
    seed: 10,
  });
  const gold = metal("gilt", { polish: 0.35, tarnish: 0.13, size: 0.08 });
  const bronze = metal("bronze", { polish: 0.2, tarnish: 0.2 });
  const lacquer = paint((p, n) =>
    mix("#20283e", "#3b5266", 0.35 + n.y * 0.19 + noise(p, 0.2, 2) * 0.26),
  );
  const paper = paint((p, _n) => {
    const stripe = Math.sin(p.y * 2200) > 0.18;
    return stripe ? "#ead9af" : "#cbbb95";
  });

  const root = b.joint("bookshelf", { at: [0, 0, 0] });

  type Fill = Parameters<typeof b.part>[1];
  type P = [number, number, number];

  function box(
    name: string,
    at: P,
    size: P,
    color: Fill,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function ball(name: string, at: P, radius: number, color: Fill, scale: P = [1, 1, 1]) {
    return b.part(new THREE.SphereGeometry(radius, 12, 8), color, {
      at,
      scale,
      bone: root,
      flat: true,
      name,
    });
  }

  function rod(name: string, a: P, z: P, radius: number, color: Fill) {
    return b.rod(a, z, radius, { color, bone: root, sides: 6, name });
  }

  function disc(name: string, at: P, radius: number, depth: number, color: Fill) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      at,
      dir: [0, 0, 1],
      bone: root,
      name,
    });
  }

  function ring(
    name: string,
    at: P,
    radius: number,
    tube: number,
    color: Fill,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 32), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function face(
    name: string,
    at: P,
    width: number,
    height: number,
    texture: THREE.Texture,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      texture,
      rotation,
      bone: root,
      name,
    });
  }

  function diamond(name: string, at: P, w: number, h: number, color: Fill) {
    return b.extrude(
      [[0, -h / 2], [w / 2, 0], [0, h / 2], [-w / 2, 0]],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color,
        bone: root,
        name,
      },
    );
  }

  const svgTexture = (content: string, viewBox = "0 0 100 100", size = 256) =>
    svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`, { size });

  // Six distinct spine paintings: each has its own little school-of-magic seal.
  const bookStyles = [
    { color: C.teal, title: "TIDECALL", icon: "moon" },
    { color: C.purple, title: "ASTRAL", icon: "star" },
    { color: C.red, title: "EMBER", icon: "flame" },
    { color: C.blue, title: "SKY LORE", icon: "eye" },
    { color: C.plum, title: "HEXES", icon: "diamond" },
    { color: "#477263", title: "VERDANT", icon: "leaf" },
  ];

  const icons: Record<string, string> = {
    moon: `<path d="M32 64 A15 15 0 1 0 49 84 A12 12 0 0 1 32 64Z" fill="#ffe4a1"/>`,
    star: `<path d="M40 60 L44 71 L55 75 L44 79 L40 90 L36 79 L25 75 L36 71Z" fill="#ffe4a1"/>
      <circle cx="40" cy="75" r="18" fill="none" stroke="#d8ad64" stroke-width="1.4"/>`,
    flame: `<path d="M40 58 Q57 75 46 86 Q28 96 28 79 Q28 72 35 66 Q32 77 39 77 Q45 73 40 58Z" fill="#ffe4a1"/>`,
    eye: `<path d="M20 75 Q40 54 60 75 Q40 94 20 75Z" fill="none" stroke="#ffe4a1" stroke-width="2.5"/>
      <circle cx="40" cy="75" r="7" fill="#ffe4a1"/><circle cx="40" cy="75" r="3" fill="#26354e"/>`,
    diamond: `<path d="M40 58 L54 75 L40 93 L26 75Z M40 64 L40 86 M31 75 L49 75"
      fill="none" stroke="#ffe4a1" stroke-width="2.3"/>`,
    leaf: `<path d="M27 89 Q19 62 53 59 Q60 85 27 89Z M27 89 L49 65 M36 79 L34 68 M40 75 L50 76"
      fill="none" stroke="#ffe4a1" stroke-width="2.5"/>`,
  };

  const spineTextures = bookStyles.map((style) =>
    svgTexture(
      `<rect width="80" height="280" fill="${style.color}"/>
       <path d="M8 9 H72 V271 H8Z" fill="none" stroke="#d8ad64" stroke-width="2"/>
       <path d="M14 17 H66 M14 263 H66 M14 113 H66 M14 207 H66"
         stroke="#d8ad64" stroke-width="1.7"/>
       <path d="M20 31 L40 39 L60 31 M20 249 L40 241 L60 249"
         fill="none" stroke="#ffe4a1" stroke-width="2"/>
       ${icons[style.icon]}
       <text x="40" y="143" text-anchor="middle" font-family="serif"
         font-size="10" letter-spacing="1.4" fill="#ffe7b6">${style.title}</text>
       <text x="40" y="164" text-anchor="middle" font-family="serif"
         font-size="8" letter-spacing="2" fill="#ffe7b6">ARCANA</text>
       <path d="M28 182 L34 176 L40 182 L46 176 L52 182 M32 220 H48 M40 215 V232"
         fill="none" stroke="#e6c889" stroke-width="2"/>
       <circle cx="40" cy="233" r="2" fill="#ffe4a1"/>`,
      "0 0 80 280",
      512,
    ),
  );

  const celestial = svgTexture(
    `<g fill="none" stroke="#d8ad64" stroke-width="1.5">
       <circle cx="100" cy="100" r="91"/>
       <circle cx="100" cy="100" r="79"/>
       <path d="M100 9 V28 M100 172 V191 M9 100 H28 M172 100 H191"/>
       <path d="M100 30 L161 135 H39Z M100 170 L39 65 H161Z"/>
       <circle cx="100" cy="100" r="51"/>
       <path d="M29 41 L49 58 M151 142 L171 159 M29 159 L49 142 M151 58 L171 41"/>
     </g>
     <g fill="#ffe4a1">
       <path d="M100 53 L105 91 L122 100 L105 109 L100 147 L95 109 L78 100 L95 91Z"/>
       <circle cx="100" cy="18" r="3"/><circle cx="182" cy="100" r="3"/>
       <circle cx="100" cy="182" r="3"/><circle cx="18" cy="100" r="3"/>
     </g>`,
    "0 0 200 200",
    512,
  );

  const parchmentTexture = svgTexture(
    `<rect width="180" height="230" fill="#ecdaa9"/>
     <path d="M11 10 H169 V220 H11Z M17 16 H163 V214 H17Z"
       fill="none" stroke="#9b714a" stroke-width="2"/>
     <circle cx="90" cy="81" r="42" fill="none" stroke="#68516c" stroke-width="2"/>
     <path d="M90 38 L128 102 H52Z M90 123 L52 59 H128Z"
       fill="none" stroke="#68516c" stroke-width="2"/>
     <circle cx="90" cy="81" r="16" fill="none" stroke="#9b714a" stroke-width="2"/>
     <path d="M90 65 V97 M74 81 H106" stroke="#9b714a" stroke-width="2"/>
     <g fill="none" stroke="#795c55" stroke-width="2.6">
       <path d="M30 145 h21 m8 0 h36 m9 0 h43 M30 157 h34 m10 0 h29 m8 0 h38"/>
       <path d="M30 169 h15 m9 0 h40 m8 0 h25 M30 181 h39 m8 0 h47 m8 0 h17"/>
       <path d="M30 193 h23 m8 0 h46"/>
     </g>
     <circle cx="139" cy="194" r="10" fill="#9b4659"/>
     <path d="M139 188 L143 194 L139 200 L135 194Z" fill="#f5d18a"/>`,
    "0 0 180 230",
    512,
  );

  const labelTexture = svgTexture(
    `<rect x="2" y="2" width="296" height="66" rx="10" fill="#25364c" stroke="#d8ad64" stroke-width="3"/>
     <path d="M16 35 L25 26 L34 35 L25 44Z M266 35 L275 26 L284 35 L275 44Z" fill="#ffe4a1"/>
     <text x="150" y="31" text-anchor="middle" font-family="serif" letter-spacing="4" font-size="17" fill="#ffe4a1">MOONWARD</text>
     <text x="150" y="51" text-anchor="middle" font-family="serif" letter-spacing="5" font-size="10" fill="#d8ad64">PRIVATE ARCHIVE</text>`,
    "0 0 300 70",
    512,
  );

  // The cabinet: three generous open bays and a strong, almost architectural silhouette.
  box("recessedBack", [0, 1.17, -0.235], [1.66, 2.02, 0.075], lacquer);
  for (let i = 0; i < 8; i++) {
    const x = -0.735 + i * 0.21;
    box("backBoardSeam", [x, 1.16, -0.193], [0.008, 1.99, 0.008], C.ink);
  }

  for (const s of [-1, 1]) {
    box("foot", [s * 0.77, 0.075, 0], [0.24, 0.15, 0.51], woodGrain);
    box("footGiltSole", [s * 0.77, 0.026, 0.01], [0.245, 0.035, 0.52], bronze);
    box("sideWall", [s * 0.835, 1.17, -0.005], [0.135, 2.12, 0.49], woodGrain);
    box("frontPilaster", [s * 0.847, 1.19, 0.265], [0.115, 2.12, 0.095], lacquer);
    box("pilasterInset", [s * 0.847, 1.22, 0.316], [0.036, 1.78, 0.008], C.teal);
    for (const dx of [-0.042, 0.042]) {
      box("pilasterGoldRail", [s * 0.847 + dx, 1.22, 0.319], [0.009, 1.89, 0.012], gold);
    }
    for (const y of [0.21, 0.82, 1.46, 2.10]) {
      box("columnCollar", [s * 0.847, y, 0.272], [0.162, 0.073, 0.125], gold);
      box("collarDarkInset", [s * 0.847, y, 0.339], [0.115, 0.024, 0.008], C.navy);
    }
    diamond("pilasterGemMount", [s * 0.847, 1.15, 0.333], 0.093, 0.20, gold);
    diamond("pilasterGem", [s * 0.847, 1.15, 0.348], 0.055, 0.13, C.turquoise);
    box("capital", [s * 0.847, 2.20, 0.0], [0.23, 0.13, 0.56], woodGrain);
    box("capitalGoldLip", [s * 0.847, 2.255, 0], [0.242, 0.025, 0.57], gold);
  }

  const shelfYs = [0.18, 0.82, 1.46, 2.10];
  for (const y of shelfYs) {
    box("shelf", [0, y, 0], [1.75, 0.082, 0.57], shelfGrain);
    box("shelfFrontApron", [0, y - 0.011, 0.293], [1.72, 0.10, 0.055], lacquer);
    box("shelfUpperGilt", [0, y + 0.034, 0.326], [1.73, 0.012, 0.014], gold);
    box("shelfLowerGilt", [0, y - 0.052, 0.324], [1.73, 0.012, 0.012], bronze);

    for (const s of [-1, 1]) {
      b.extrude(
        [[0, 0], [0.16, 0], [0.14, -0.05], [0.06, -0.12], [0, -0.14]],
        {
          at: [s * 0.755, y - 0.055, 0.21],
          x: [-s, 0, 0],
          y: [0, 1, 0],
          thickness: 0.065,
          color: woodGrain,
          bone: root,
          name: "carvedShelfBracket",
        },
      );
      diamond("shelfEndInlay", [s * 0.69, y - 0.012, 0.325], 0.038, 0.039, gold);
    }
  }

  box("lowerPlinth", [0, 0.115, 0.015], [1.89, 0.095, 0.60], lacquer);

  // Pointed pediment with layered contour rails.
  const crownOutline = [
    [-0.94, 0], [-0.94, 0.12], [-0.66, 0.15],
    [-0.40, 0.31], [0, 0.54], [0.40, 0.31],
    [0.66, 0.15], [0.94, 0.12], [0.94, 0],
  ];
  b.extrude(crownOutline, {
    at: [0, 2.20, -0.08],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.15,
    bevel: 0.012,
    color: woodGrain,
    bone: root,
    name: "pointedMoonPediment",
  });

  const crownPath: P[] = [
    [-0.92, 2.32, 0.006], [-0.66, 2.35, 0.006],
    [-0.4, 2.51, 0.006], [0, 2.74, 0.006],
    [0.4, 2.51, 0.006], [0.66, 2.35, 0.006],
    [0.92, 2.32, 0.006],
  ];
  b.sweep(crownPath, 0.015, { color: gold, bone: root, sides: 6, name: "pedimentGoldOutline" });
  box("pedimentLowerRail", [0, 2.235, 0.008], [1.87, 0.022, 0.035], gold);
  face("archiveName", [0, 2.32, 0.009], 0.72, 0.168, labelTexture);

  // The crescent is a real flat silhouette, not a floating decal.
  const crescent: number[][] = [];
  for (let i = 0; i <= 18; i++) {
    const angle = (60 + i * 240 / 18) * Math.PI / 180;
    crescent.push([Math.cos(angle) * 0.13, Math.sin(angle) * 0.13]);
  }
  const innerRadius = 0.13 * Math.sin(Math.PI / 3);
  for (let i = 1; i < 14; i++) {
    const angle = (-90 - i * 180 / 14) * Math.PI / 180;
    crescent.push([
      0.065 + Math.cos(angle) * innerRadius,
      Math.sin(angle) * innerRadius,
    ]);
  }
  b.extrude(crescent, {
    at: [0, 2.565, 0.025],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.035,
    color: gold,
    bone: root,
    name: "gildedCrescent",
  });
  diamond("crownStar", [0.085, 2.57, 0.036], 0.065, 0.095, C.paleGold);

  for (const s of [-1, 1]) {
    b.lathe(
      [[0, 0], [0.06, 0], [0.06, 0.025], [0.035, 0.04], [0.025, 0.105], [0, 0.15]],
      {
        at: [s * 0.847, 2.27, 0.02],
        segments: 8,
        color: gold,
        bone: root,
        name: "cornerFinial",
      },
    );
    diamond("pedimentSmallStar", [s * 0.43, 2.39, 0.008], 0.055, 0.085, gold);
  }

  // The upper bay's star chart is visible around the hero orb.
  face("celestialBackplate", [0, 1.78, -0.189], 0.53, 0.53, celestial);
  for (const s of [-1, 1]) {
    box("upperBackFrame", [s * 0.323, 1.78, -0.18], [0.013, 0.52, 0.012], bronze);
  }

  function book(
    index: number,
    x: number,
    floor: number,
    width: number,
    height: number,
    styleIndex: number,
    z = 0.055,
  ) {
    const style = bookStyles[styleIndex % bookStyles.length];
    const depth = 0.31;
    const y = floor + height / 2;
    const front = z + depth / 2;

    box(`book${index}Pages`, [x, y, z - 0.012], [width - 0.023, height - 0.025, depth - 0.027], paper);
    for (const s of [-1, 1]) {
      box(`book${index}Cover`, [x + s * (width / 2 - 0.006), y, z], [0.014, height + 0.012, depth], style.color);
    }
    box(`book${index}Spine`, [x, y, front - 0.009], [width, height, 0.027], style.color);
    face(`book${index}IlluminatedSpine`, [x, y, front + 0.005], width * 0.91, height * 0.95, spineTextures[styleIndex % 6]);
    for (const t of [0.12, 0.88]) {
      box(`book${index}RaisedBand`, [x, floor + height * t, front + 0.007], [width + 0.006, 0.014, 0.016], gold);
    }
    if (index % 3 === 0) {
      box(`book${index}Bookmark`, [x + width * 0.17, floor + height + 0.006, z + 0.02], [0.021, 0.006, 0.14], C.red);
      b.extrude([[0, 0], [0.021, 0], [0.021, -0.069], [0.0105, -0.057], [0, -0.069]], {
        at: [x + width * 0.07, floor + height, front + 0.013],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: C.red,
        bone: root,
        name: `book${index}RibbonTail`,
      });
    }
  }

  // Bottom row: a dense, satisfyingly uneven run of substantial tomes.
  let cursor = -0.748;
  const bottomWidths = [0.112, 0.14, 0.105, 0.15, 0.12, 0.10, 0.135];
  bottomWidths.forEach((width, i) => {
    book(i, cursor + width / 2, 0.223, width, [0.46, 0.49, 0.41, 0.51, 0.455, 0.39, 0.47][i], i % 6);
    cursor += width + 0.009;
  });

  // Middle bay: tall books balance a candle and an unrolled diagram.
  cursor = -0.74;
  [0.13, 0.115, 0.15, 0.105].forEach((width, i) => {
    book(10 + i, cursor + width / 2, 0.863, width, [0.48, 0.435, 0.51, 0.46][i], [4, 3, 0, 1][i], 0.02);
    cursor += width + 0.012;
  });

  // Two compact clusters frame, rather than hide, the central luminous orb.
  book(20, -0.666, 1.503, 0.14, 0.47, 1, 0.01);
  book(21, -0.508, 1.503, 0.14, 0.425, 0, 0.01);
  book(22, 0.495, 1.503, 0.12, 0.40, 4, 0.01);
  book(23, 0.641, 1.503, 0.145, 0.48, 3, 0.01);

  function flatBook(name: string, at: P, width: number, depth: number, height: number, style: number) {
    const color = bookStyles[style].color;
    box(`${name}Pages`, at, [width - 0.02, height - 0.022, depth - 0.018], paper);
    for (const s of [-1, 1]) {
      box(`${name}Cover`, [at[0], at[1] + s * (height / 2 - 0.005), at[2]], [width, 0.013, depth], color);
    }
    box(`${name}Spine`, [at[0], at[1], at[2] + depth / 2 - 0.006], [width, height, 0.022], color);
    for (const s of [-1, 1]) {
      box(`${name}GiltBand`, [at[0] + s * width * 0.33, at[1], at[2] + depth / 2 + 0.007], [0.014, height - 0.009, 0.008], gold);
    }
    diamond(`${name}Seal`, [at[0], at[1], at[2] + depth / 2 + 0.012], 0.037, height * 0.6, gold);
  }

  flatBook("lowerAtlas", [0.52, 0.269, 0.045], 0.43, 0.36, 0.085, 3);
  flatBook("lowerHerbal", [0.53, 0.35, 0.035], 0.38, 0.32, 0.07, 5);
  flatBook("middleGrimoire", [0.49, 0.908, -0.005], 0.45, 0.35, 0.085, 4);

  // Scrolls have a visible rolled end, a dark spiral, a ribbon, and a wax seal.
  function scroll(name: string, at: P, length: number, radius: number, ribbon: string) {
    b.part(new THREE.CylinderGeometry(radius, radius * 0.97, length, 10), C.cream, {
      at,
      dir: [0, 0, 1],
      bone: root,
      name: `${name}Parchment`,
    });
    const front = at[2] + length / 2 + 0.002;
    disc(`${name}End`, [at[0], at[1], front], radius * 0.88, 0.006, C.paper);

    const spiralPoints: P[] = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const a = t * Math.PI * 4.1;
      const r = radius * (0.08 + 0.72 * t);
      spiralPoints.push([at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r, front + 0.004]);
    }
    b.sweep(spiralPoints, 0.0018, {
      color: C.darkGold,
      sides: 4,
      bone: root,
      name: `${name}RolledEdge`,
    });
    b.part(new THREE.CylinderGeometry(radius + 0.002, radius + 0.002, 0.03, 10), ribbon, {
      at: [at[0], at[1], at[2] + 0.025],
      dir: [0, 0, 1],
      bone: root,
      name: `${name}Ribbon`,
    });
    ball(`${name}WaxSeal`, [at[0], at[1] + radius, at[2] + 0.025], 0.019, C.red, [1, 0.4, 1]);
  }

  scroll("bottomScrollA", [0.407, 0.431, 0.065], 0.29, 0.043, C.teal);
  scroll("bottomScrollB", [0.517, 0.433, 0.045], 0.31, 0.045, C.plum);
  scroll("bottomScrollC", [0.627, 0.433, 0.065], 0.27, 0.043, C.teal);
  scroll("bottomScrollD", [0.465, 0.508, 0.055], 0.28, 0.043, C.plum);
  scroll("bottomScrollE", [0.575, 0.509, 0.045], 0.31, 0.044, C.teal);
  scroll("bottomScrollF", [0.519, 0.581, 0.025], 0.27, 0.041, C.red);

  // A partially opened chart drapes over the middle shelf, carefully clear of the lower books.
  const sheet = b.part(new THREE.PlaneGeometry(0.25, 0.325), "#ffffff", {
    at: [0.13, 1.014, 0.245],
    rotation: [-12, 0, -5],
    texture: parchmentTexture,
    bone: root,
    name: "UnrolledAstralDiagram",
  });
  // The rolled top and bottom make the sheet's physical construction readable.
  rod("chartUpperRoll", [-0.005, 1.175, 0.207], [0.247, 1.153, 0.207], 0.022, C.cream);
  rod("chartLowerRoll", [0.015, 0.853, 0.278], [0.267, 0.831, 0.278], 0.018, C.cream);
  // A slender stand supports the upper roll behind the sheet.
  rod("chartRest", [0.12, 0.866, 0.02], [0.12, 1.16, 0.18], 0.012, bronze);
  sheet.mesh.name = "UnrolledAstralDiagram";

  function candle(name: string, x: number, base: number, z: number, height: number, r: number) {
    b.lathe(
      [[0, 0], [r * 1.8, 0], [r * 1.8, 0.012], [r * 1.4, 0.024],
       [r * 0.7, 0.035], [r * 0.7, 0.068], [r * 1.5, 0.075],
       [r * 1.55, 0.087], [0, 0.087]],
      { at: [x, base, z], color: gold, segments: 10, bone: root, name: `${name}Holder` },
    );
    const bottom = base + 0.082;
    b.part(new THREE.CylinderGeometry(r * 0.91, r, height, 10), C.wax, {
      at: [x, bottom + height / 2, z],
      bone: root,
      name: `${name}Wax`,
    });
    const top = bottom + height;
    b.part(new THREE.CylinderGeometry(r * 0.91, r * 0.91, 0.008, 10), C.waxShadow, {
      at: [x, top, z],
      bone: root,
      name: `${name}MeltPool`,
    });
    for (let j = 0; j < 4; j++) {
      const a = (j * 1.65 + 0.3);
      const px = x + Math.sin(a) * r * 0.88;
      const pz = z + Math.cos(a) * r * 0.88;
      const length = 0.02 + random() * 0.065;
      b.capsule([px, top - 0.004, pz], [px, top - length, pz], r * 0.19, {
        sides: 5,
        color: C.wax,
        bone: root,
        name: `${name}Drip`,
      });
    }
    rod(`${name}Wick`, [x, top, z], [x + 0.003, top + 0.024, z], 0.003, C.ink);
    glow(b.sweep(
      catmull([[x, top + 0.013, z], [x - 0.009, top + 0.047, z], [x + 0.014, top + 0.099, z]]),
      [0.014, 0.020, 0],
      { color: "#ffad4c", sides: 6, bone: root, name: `${name}AmberFlame` },
    ), 1.4);
    glow(ball(`${name}FlameHeart`, [x, top + 0.039, z + 0.009], 0.012, "#fff3bd", [0.7, 1.9, 0.7]), 2);
  }

  candle("middleCandle", 0.51, 0.951, 0.04, 0.205, 0.042);
  candle("middleLittleCandle", 0.69, 0.863, 0.13, 0.145, 0.032);
  candle("crownCandleL", -0.59, 2.143, 0.10, 0.19, 0.036);
  candle("crownCandleR", 0.59, 2.143, 0.10, 0.265, 0.039);

  function orb(name: string, at: P, radius: number, color: string) {
    const base = at[1] - radius - 0.105;
    b.lathe(
      [[0, 0], [radius * 0.78, 0], [radius * 0.82, 0.018],
       [radius * 0.55, 0.035], [radius * 0.3, 0.045],
       [radius * 0.27, 0.075], [radius * 0.65, 0.092],
       [radius * 0.72, 0.112], [0, 0.112]],
      {
        at: [at[0], base, at[2]],
        color: gold,
        segments: 10,
        bone: root,
        name: `${name}Pedestal`,
      },
    );
    const orbPaint = paint((p, n) => {
      const f = noise(p, radius * 0.65, 41);
      return mix("#253f80", color, 0.45 + 0.35 * f + 0.17 * n.y);
    });
    ball(`${name}Crystal`, at, radius, orbPaint);
    glow(ball(`${name}LuminousCore`, [at[0], at[1] + 0.007, at[2] + radius * 0.87], radius * 0.35, color, [0.9, 1.05, 0.34]), 1.1);
    glow(ball(`${name}Glint`, [at[0] - radius * 0.32, at[1] + radius * 0.44, at[2] + radius * 0.83], radius * 0.15, "#e1fffa", [0.6, 1.3, 0.3]), 1.2);
    ball(`${name}TinyGlint`, [at[0] + radius * 0.35, at[1] - radius * 0.2, at[2] + radius * 0.9], radius * 0.055, "#e1fffa");

    for (const s of [-1, 1]) {
      b.sweep(
        [[at[0] + s * radius * 0.4, base + 0.07, at[2]],
         [at[0] + s * radius * 0.85, at[1] - radius * 0.69, at[2]],
         [at[0] + s * radius * 0.98, at[1] - radius * 0.18, at[2]]],
        [0.014, 0.012, 0.006],
        { color: gold, bone: root, sides: 6, name: `${name}CradleClaw` },
      );
    }
  }

  orb("LunarScryingOrb", [0, 1.793, 0.035], 0.185, "#62d6e5");
  ring("orbArmillary", [0, 1.793, 0.035], 0.235, 0.008, gold, [14, 22, -23]);

  // Small stars fastened to the armillary ring, plus the star on its pedestal.
  diamond("orbPedestalStar", [0, 1.56, 0.115], 0.055, 0.072, C.paleGold);
  diamond("orbOrbitStar", [-0.205, 1.90, 0.077], 0.045, 0.075, C.paleGold);
  diamond("orbOrbitStarSmall", [0.213, 1.702, 0.047], 0.032, 0.05, C.paleGold);

  orb("VioletPocketOrb", [-0.26, 2.31, 0.09], 0.063, "#c198f4");

  // An ink bottle and quill bring the top ledge down to an intimate, usable scale.
  b.lathe(
    [[0, 0], [0.045, 0], [0.052, 0.018], [0.048, 0.074],
     [0.025, 0.095], [0.025, 0.12], [0, 0.12]],
    {
      at: [0.29, 2.143, 0.12],
      segments: 8,
      color: C.teal,
      bone: root,
      name: "InkBottle",
    },
  );
  ring("inkBottleLip", [0.29, 2.265, 0.12], 0.025, 0.005, gold, [90, 0, 0]);
  disc("inkBottleSeal", [0.29, 2.191, 0.168], 0.022, 0.006, gold);
  diamond("inkBottleSealStar", [0.29, 2.191, 0.173], 0.019, 0.03, C.navy);
  rod("quillShaft", [0.29, 2.24, 0.12], [0.40, 2.49, 0.095], 0.004, C.paleGold);
  b.extrude(
    [[0, 0], [-0.032, 0.035], [-0.036, 0.092], [-0.019, 0.16],
     [0.008, 0.205], [0.029, 0.14], [0.026, 0.077], [0.014, 0.025]],
    {
      at: [0.332, 2.33, 0.103],
      x: [0.93, -0.37, 0],
      y: [0.37, 0.93, 0],
      thickness: 0.006,
      color: C.cream,
      bone: root,
      name: "IvoryQuillFeather",
    },
  );
  for (let i = 0; i < 5; i++) {
    const y = 2.37 + i * 0.025;
    const x = 0.35 + i * 0.01;
    rod("quillBarb", [x - 0.017, y + 0.011, 0.109], [x + 0.012, y, 0.109], 0.0018, C.paper);
  }

  // Small corner pins and repeated star motifs make the fittings feel deliberately crafted.
  for (const s of [-1, 1]) {
    for (const y of [0.39, 0.65, 1.02, 1.31, 1.66, 1.95]) {
      disc("gildedPin", [s * 0.847, y, 0.328], 0.008, 0.008, gold);
    }
    for (const y of [0.49, 1.12, 1.77]) {
      diamond("sidePanelInlay", [s * 0.847, y, 0.331], 0.025, 0.06, C.paleGold);
    }
  }

  return b.root;
}
