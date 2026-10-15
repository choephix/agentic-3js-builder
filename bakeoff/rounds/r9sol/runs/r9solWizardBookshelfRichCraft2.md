```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  grain,
  mottle,
  paint,
  mix,
  rng,
  svg,
} from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "The Lunar Archivum",
  description:
    "An ornate, midnight-blue wizard's bookshelf filled with jewel-coloured spellbooks, sealed scrolls, dripping candles and a luminous celestial orb.",
};

type Fill = string | Paint;
type V = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "The Lunar Archivum",
    paintSize: 2048,
    detail: 1,
  });
  const random = rng(4187);
  const cabinet = b.joint("cabinet", { at: [0, 0, 0] });

  const C = {
    ink: "#172136",
    blue: "#253956",
    edge: "#3b5772",
    teal: "#2d7980",
    gold: "#ddb665",
    goldLight: "#ffe4a0",
    goldDark: "#937047",
    cream: "#eee0b8",
    parchment: "#e6cfa0",
    paperEdge: "#a98968",
    red: "#a13a58",
    amethyst: "#72539d",
    emerald: "#267b78",
    ultramarine: "#3b4c91",
    rose: "#b75876",
    cyan: "#63e4e9",
    wax: "#fff0c5",
    flame: "#ffb954",
  };

  const WOOD = grain("#1b2c43", "#32465f", {
    size: 0.055,
    axis: "y",
    seed: 4,
  });
  const SHELF = grain("#284052", "#426374", {
    size: 0.044,
    axis: "x",
    seed: 7,
  });
  const GOLD = mottle("#b68a4d", "#efd18a", {
    size: 0.075,
    contrast: 0.65,
    seed: 11,
  });
  const STONE = mottle("#273343", "#425464", {
    size: 0.17,
    contrast: 0.8,
    seed: 12,
  });
  const PAGES = paint((p, n) => {
    const line = ((p.y * 230) % 1 + 1) % 1;
    const shade = Math.abs(n.y) > 0.7 ? 0.05 : line < 0.17 ? 0.34 : 0.08;
    return mix("#f3e8c9", "#9e8468", shade);
  });
  const WAX = paint((p, n) =>
    mix("#f8e8b8", "#fff7da", Math.max(0, n.y) * 0.5 + 0.15 * Math.sin(p.y * 30)),
  );

  function box(
    at: V,
    size: V,
    color: Fill,
    rotation: V = [0, 0, 0],
    name = "joinery",
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      bone: cabinet,
      name,
    });
  }

  function ball(
    at: V,
    radius: number,
    color: Fill,
    scale: V = [1, 1, 1],
    name = "ornament",
  ) {
    return b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      scale,
      flat: true,
      bone: cabinet,
      name,
    });
  }

  function rod(a: V, z: V, radius: number, color: Fill, name = "trim") {
    return b.rod(a, z, radius, {
      color,
      bone: cabinet,
      sides: 6,
      name,
    });
  }

  function torus(
    at: V,
    radius: number,
    tube: number,
    color: Fill,
    rotation: V = [0, 0, 0],
    name = "ring",
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, 32), color, {
      at,
      rotation,
      bone: cabinet,
      name,
    });
  }

  function drawing(
    at: V,
    size: [number, number],
    texture: THREE.Texture,
    rotation: V = [0, 0, 0],
    name = "drawing",
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      rotation,
      texture,
      bone: cabinet,
      name,
    });
  }

  function diamond(
    at: V,
    width: number,
    height: number,
    color: Fill,
    thickness = 0.012,
  ) {
    return b.extrude(
      [
        [0, height / 2],
        [width / 2, 0],
        [0, -height / 2],
        [-width / 2, 0],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness,
        color,
        bone: cabinet,
        name: "lozenge inlay",
      },
    );
  }

  function star(at: V, radius: number, color: Fill, thickness = 0.012) {
    const outline: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 4;
      const r = i % 2 === 0 ? radius : radius * 0.28;
      outline.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      color,
      bone: cabinet,
      name: "four pointed star",
    });
  }

  // The small drawings are shared between books, rather than individually
  // textured covers. Their transparent ground preserves the jewel-colour leather.
  function spineTexture(title: string, motif: string) {
    return svg(
      `<svg viewBox="0 0 64 256" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="#edce8a" stroke-width="2.5">
          <path d="M10 48V15H54V48 M10 209V241H54V209"/>
          <path d="M17 23H47 M17 233H47" stroke-width="1.8"/>
          <path d="M10 61L17 68L10 75 M54 181L47 188L54 195"/>
          ${motif}
        </g>
        <g fill="#f5dca1">
          <path d="M32 213L37 220L32 227L27 220Z"/>
          <circle cx="32" cy="42" r="2.5"/>
        </g>
        <text x="32" y="138" transform="rotate(-90 32 138)"
          text-anchor="middle" font-family="serif" font-size="13"
          letter-spacing="2" fill="#ffe6af">${title}</text>
      </svg>`,
      { size: 512 },
    );
  }

  const SPINES = [
    spineTexture(
      "LUNARIA",
      `<path d="M39 79A14 14 0 1 1 38 53A11 11 0 0 0 39 79Z"/>
       <path d="M20 191L32 179L44 191L32 203Z"/>`,
    ),
    spineTexture(
      "ASTRA",
      `<path d="M32 51L36 64L48 68L36 72L32 85L28 72L16 68L28 64Z"/>
       <circle cx="32" cy="191" r="11"/><path d="M21 191H43M32 180V202"/>`,
    ),
    spineTexture(
      "PYRUS",
      `<path d="M32 52C46 67 47 75 32 84C15 77 20 66 32 52Z"/>
       <path d="M20 197L32 179L44 197ZM24 202H40"/>`,
    ),
    spineTexture(
      "HERBARIUM",
      `<path d="M32 84V53M32 68Q10 67 19 54Q33 55 32 68ZM32 78Q52 77 47 63Q33 64 32 78Z"/>
       <path d="M32 204V179M32 191Q15 191 20 181Q32 182 32 191ZM32 198Q48 197 44 187Q32 188 32 198Z"/>`,
    ),
  ];

  const CHART = svg(
    `<svg viewBox="0 0 600 740" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="740" fill="#182c45"/>
      <g fill="none" stroke="#3d6576" stroke-width="2">
        <rect x="18" y="18" width="564" height="704"/>
        <rect x="28" y="28" width="544" height="684"/>
        <circle cx="300" cy="180" r="127"/>
        <circle cx="300" cy="180" r="105"/>
        <path d="M170 180H430M300 50V310M207 87L393 273M207 273L393 87"/>
        <path d="M64 403L144 370L226 430L317 391L414 468L533 403"/>
        <path d="M65 610L176 551L259 626L382 550L514 619"/>
      </g>
      <g fill="#709a9c">
        <path d="M300 90L311 164L384 180L311 193L300 267L287 193L215 180L287 164Z"/>
        <circle cx="64" cy="403" r="5"/><circle cx="144" cy="370" r="6"/>
        <circle cx="226" cy="430" r="5"/><circle cx="317" cy="391" r="6"/>
        <circle cx="414" cy="468" r="5"/><circle cx="533" cy="403" r="5"/>
        <circle cx="65" cy="610" r="5"/><circle cx="176" cy="551" r="5"/>
        <circle cx="259" cy="626" r="5"/><circle cx="382" cy="550" r="6"/>
        <circle cx="514" cy="619" r="5"/>
      </g>
      <g fill="#567f8a">
        ${Array.from({ length: 34 }, (_, i) => {
          const x = 45 + ((i * 137) % 510);
          const y = 40 + ((i * 193) % 660);
          return `<path d="M${x} ${y - 4}v8m-4 -4h8" stroke="#567f8a" stroke-width="2"/>`;
        }).join("")}
      </g>
    </svg>`,
    { size: 1024 },
  );

  const SEAL = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="89" fill="#263d57" stroke="#e8c983" stroke-width="5"/>
      <circle cx="100" cy="100" r="76" fill="none" stroke="#6f9295" stroke-width="2"/>
      <path d="M126 53A54 54 0 1 0 139 135A44 44 0 0 1 126 53Z"
        fill="#f5daa0" stroke="#9e7d49" stroke-width="2"/>
      <path d="M139 58L143 74L159 78L143 82L139 98L135 82L119 78L135 74Z"
        fill="#83e1db"/>
      <g fill="#e8c983">
        <circle cx="49" cy="49" r="3"/><circle cx="46" cy="149" r="3"/>
        <circle cx="151" cy="150" r="3"/><circle cx="100" cy="177" r="3"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const ORB_RUNES = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#d9ffff" stroke-width="4" stroke-linejoin="round">
        <circle cx="100" cy="100" r="76" stroke-dasharray="35 10 7 10"/>
        <path d="M100 36L155 130H45ZM100 164L45 70H155Z"/>
        <circle cx="100" cy="100" r="20"/>
        <path d="M20 88V111M180 88V111M89 20H111M89 180H111"/>
      </g>
      <g fill="#f1ffff">
        <path d="M100 81L105 95L119 100L105 105L100 119L95 105L81 100L95 95Z"/>
        <circle cx="47" cy="47" r="4"/><circle cx="153" cy="153" r="4"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const PLAQUE = svg(
    `<svg viewBox="0 0 480 92" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 5H464L475 46L464 87H16L5 46Z"
        fill="#1b3043" stroke="#e3be73" stroke-width="5"/>
      <path d="M32 17H448M32 75H448" stroke="#688b91" stroke-width="2"/>
      <text x="240" y="57" text-anchor="middle" font-family="serif"
        font-size="32" letter-spacing="5" fill="#f3d99e">LUNAR ARCHIVUM</text>
      <path d="M26 35L30 46L26 57L22 46ZM454 35L458 46L454 57L450 46Z"
        fill="#81d8d1"/>
    </svg>`,
    { size: 1024 },
  );

  // A compact stone stage; its beveled-looking tiers echo the cabinet's cornice.
  b.part(new THREE.CylinderGeometry(1.06, 1.10, 0.065, 8), STONE, {
    at: [0, 0.0325, 0.02],
    scale: [1, 1, 0.60],
    bone: cabinet,
    name: "octagonal stone stage",
  });
  b.part(new THREE.CylinderGeometry(1.055, 1.06, 0.014, 8), C.goldDark, {
    at: [0, 0.072, 0.02],
    scale: [1, 1, 0.60],
    bone: cabinet,
    name: "stage brass edge",
  });
  b.part(new THREE.CylinderGeometry(1.035, 1.055, 0.025, 8), STONE, {
    at: [0, 0.0915, 0.02],
    scale: [1, 1, 0.60],
    bone: cabinet,
    name: "stage upper face",
  });

  // Four sturdy feet visibly carry the cabinet above the stone.
  for (const x of [-0.72, 0.72]) {
    for (const z of [-0.15, 0.19]) {
      box([x, 0.155, z], [0.18, 0.104, 0.16], WOOD, [0, 0, 0], "square foot");
      box([x, 0.111, z], [0.19, 0.018, 0.17], GOLD, [0, 0, 0], "foot shoe");
      box([x, 0.219, z], [0.13, 0.05, 0.13], C.blue, [0, 0, 0], "foot neck");
    }
  }

  box([0, 0.274, 0], [1.80, 0.08, 0.57], WOOD, [0, 0, 0], "lower plinth");
  box([0, 0.322, 0], [1.73, 0.024, 0.54], GOLD, [0, 0, 0], "plinth gold course");
  box([0, 0.35, 0], [1.72, 0.034, 0.53], SHELF, [0, 0, 0], "bottom shelf");
  drawing([0, 0.277, 0.287], [0.63, 0.121], PLAQUE, [0, 0, 0], "library nameplate");

  // The full-height back, celestial lining and unusually deep blue side walls.
  box([0, 1.285, -0.237], [1.56, 1.87, 0.055], WOOD, [0, 0, 0], "solid back");
  drawing([0, 1.265, -0.2075], [1.43, 1.79], CHART, [0, 0, 0], "celestial lining");

  for (const s of [-1, 1]) {
    box([s * 0.797, 1.28, -0.015], [0.115, 1.86, 0.50], WOOD, [0, 0, 0], "side wall");
    box([s * 0.798, 1.28, 0.243], [0.119, 1.85, 0.068], C.blue, [0, 0, 0], "front upright");
    box([s * 0.798, 1.29, 0.282], [0.025, 1.72, 0.013], GOLD, [0, 0, 0], "upright gold inlay");

    for (const y of [0.405, 2.14]) {
      box([s * 0.798, y, 0.24], [0.16, 0.065, 0.12], SHELF, [0, 0, 0], "column capital");
      box([s * 0.798, y + 0.04, 0.247], [0.16, 0.014, 0.13], GOLD, [0, 0, 0], "capital trim");
    }

    diamond([s * 0.798, 0.66, 0.298], 0.071, 0.13, GOLD);
    diamond([s * 0.798, 1.80, 0.298], 0.071, 0.13, GOLD);
    ball([s * 0.798, 1.80, 0.313], 0.022, C.teal, [0.78, 1, 0.55], "column cabochon");

    // Raised exterior panels remain interesting in a three-quarter view.
    box([s * 0.86, 1.29, -0.005], [0.019, 1.52, 0.337], C.blue, [0, 0, 0], "outer inset panel");
    for (const z of [-0.165, 0.155]) {
      rod([s * 0.875, 0.56, z], [s * 0.875, 2.02, z], 0.007, GOLD);
    }
    for (const y of [0.56, 2.02]) {
      rod([s * 0.875, y, -0.165], [s * 0.875, y, 0.155], 0.007, GOLD);
    }
    b.part(new THREE.OctahedronGeometry(0.083), C.teal, {
      at: [s * 0.888, 1.29, -0.005],
      scale: [0.25, 1.5, 0.8],
      bone: cabinet,
      name: "side panel gem",
    });
  }

  const shelfTops = [0.367, 0.967, 1.567];
  for (const top of shelfTops.slice(1)) {
    box([0, top - 0.025, 0], [1.51, 0.05, 0.51], SHELF, [0, 0, 0], "thick shelf");
    box([0, top - 0.025, 0.263], [1.54, 0.056, 0.036], C.blue, [0, 0, 0], "shelf fascia");
    box([0, top - 0.008, 0.284], [1.54, 0.009, 0.008], GOLD, [0, 0, 0], "shelf gold lip");
    for (const s of [-1, 1]) {
      b.extrude(
        [[0, 0], [0.18, 0], [0.15, -0.045], [0.05, -0.12], [0, -0.12]],
        {
          at: [s * 0.729, top - 0.05, 0.22],
          x: [-s, 0, 0],
          y: [0, 1, 0],
          thickness: 0.062,
          color: WOOD,
          bone: cabinet,
          name: "scrolled shelf bracket",
        },
      );
      ball([s * 0.65, top - 0.084, 0.257], 0.014, GOLD);
    }
  }

  box([0, 2.16, 0], [1.80, 0.075, 0.57], WOOD, [0, 0, 0], "upper cornice");
  box([0, 2.207, 0], [1.85, 0.018, 0.60], GOLD, [0, 0, 0], "cornice gilt rim");

  // A broad, stepped fantasy crest rather than a thin unsupported sign.
  b.extrude(
    [
      [-0.89, 0], [-0.89, 0.115], [-0.68, 0.16],
      [-0.49, 0.37], [-0.25, 0.41], [0, 0.59],
      [0.25, 0.41], [0.49, 0.37], [0.68, 0.16],
      [0.89, 0.115], [0.89, 0],
    ],
    {
      at: [0, 2.217, -0.115],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.14,
      color: WOOD,
      bone: cabinet,
      name: "peaked lunar pediment",
    },
  );

  const crestRoute: V[] = [
    [-0.855, 2.31, -0.035],
    [-0.66, 2.36, -0.035],
    [-0.46, 2.565, -0.035],
    [-0.24, 2.61, -0.035],
    [0, 2.776, -0.035],
    [0.24, 2.61, -0.035],
    [0.46, 2.565, -0.035],
    [0.66, 2.36, -0.035],
    [0.855, 2.31, -0.035],
  ];
  b.sweep(crestRoute, 0.012, {
    color: GOLD,
    sides: 6,
    bone: cabinet,
    caps: "flat",
    name: "pediment outline",
  });
  drawing([0, 2.50, -0.034], [0.355, 0.355], SEAL, [0, 0, 0], "moon medallion");
  star([0, 2.773, -0.014], 0.066, C.goldLight, 0.022);

  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.23, 2.38, -0.025],
        [s * 0.35, 2.43, -0.025],
        [s * 0.48, 2.39, -0.025],
        [s * 0.59, 2.34, -0.025],
      ]),
      0.008,
      { color: GOLD, bone: cabinet, sides: 6, name: "crest vine" },
    );
    for (let i = 0; i < 3; i++) {
      diamond([s * (0.29 + i * 0.105), 2.43 - i * 0.025, -0.009], 0.037, 0.075, GOLD);
    }
    star([s * 0.714, 2.302, -0.025], 0.043, C.goldLight);
  }

  // Every tome is a small assembly: two overhanging boards, inset pages,
  // a rounded-looking square spine, raised bands, and drawn gilding.
  function book(
    x: number,
    bottom: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    color: string,
    design: number,
    lean = 0,
    clasp = false,
  ) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, 0, THREE.MathUtils.degToRad(lean)),
    );
    const origin = new THREE.Vector3(x, bottom, z);
    const p = (a: number, y: number, c: number) =>
      new THREE.Vector3(a, y, c).applyQuaternion(q).add(origin);

    function piece(size: V, at: V, fill: Fill, name: string) {
      return b.part(new THREE.BoxGeometry(...size), fill, {
        at: p(...at),
        quat: q,
        bone: cabinet,
        name,
      });
    }

    piece([width - 0.026, height - 0.032, depth - 0.025],
      [0, height / 2, -0.007], PAGES, "inset page block");
    for (const s of [-1, 1]) {
      piece([0.014, height, depth + 0.014],
        [s * (width / 2 - 0.007), height / 2, 0], color, "leather book board");
    }
    piece([width, height, 0.027],
      [0, height / 2, depth / 2 - 0.006], color, "leather spine");

    b.part(new THREE.PlaneGeometry(width * 0.88, height * 0.94), "#ffffff", {
      at: p(0, height / 2, depth / 2 + 0.0085),
      quat: q,
      texture: SPINES[design % SPINES.length],
      bone: cabinet,
      name: "gilded spine lettering",
    });

    for (const y of [height * 0.115, height * 0.875]) {
      piece([width + 0.005, 0.012, 0.017],
        [0, y, depth / 2 + 0.012], GOLD, "raised gold spine band");
    }

    if (clasp) {
      piece([width * 0.8, 0.029, 0.012],
        [0, height * 0.53, depth / 2 + 0.017], C.goldDark, "spellbook clasp");
      b.part(new THREE.OctahedronGeometry(width * 0.20), C.cyan, {
        at: p(0, height * 0.53, depth / 2 + 0.03),
        quat: q,
        scale: [1, 0.8, 0.42],
        bone: cabinet,
        name: "clasp gem",
      });
    } else if (design % 2 === 0) {
      // A little silk bookmark emerges between the pages.
      piece([0.018, height * 0.12, 0.004],
        [width * 0.18, -height * 0.025, depth * 0.12], C.rose, "silk bookmark");
    }
  }

  // Bottom bay: substantial reference volumes on the left, scrolls on the right.
  book(-0.65, 0.372, 0.012, 0.115, 0.457, 0.34, C.emerald, 3);
  book(-0.511, 0.372, 0.018, 0.128, 0.504, 0.36, C.red, 2, 0, true);
  book(-0.367, 0.372, 0.008, 0.105, 0.421, 0.33, C.ultramarine, 1);
  book(-0.226, 0.376, 0.022, 0.125, 0.477, 0.35, C.amethyst, 0, -8);
  book(-0.065, 0.372, 0.006, 0.107, 0.391, 0.32, C.teal, 3, -8);

  // Middle bay: a deliberately varied, jewel-toned skyline.
  book(-0.66, 0.972, 0.008, 0.101, 0.408, 0.34, C.amethyst, 0);
  book(-0.526, 0.972, 0.002, 0.117, 0.480, 0.33, C.emerald, 3);
  book(-0.381, 0.972, 0.013, 0.116, 0.452, 0.36, C.ultramarine, 1);
  book(-0.222, 0.977, 0.018, 0.157, 0.505, 0.37, C.red, 2, -5, true);
  book(-0.042, 0.973, 0.006, 0.112, 0.438, 0.32, C.rose, 0, -5);
  book(0.107, 0.972, 0.001, 0.104, 0.394, 0.33, C.emerald, 3);

  // The top bay leaves a generous central niche for the celestial instrument.
  book(-0.658, 1.572, -0.002, 0.105, 0.412, 0.31, C.red, 2);
  book(-0.523, 1.572, 0.009, 0.116, 0.466, 0.33, C.ultramarine, 1);
  book(-0.376, 1.574, -0.002, 0.103, 0.400, 0.31, C.emerald, 3, -9);
  book(0.508, 1.572, 0.002, 0.117, 0.451, 0.33, C.amethyst, 0, 8);
  book(0.650, 1.572, 0.004, 0.112, 0.492, 0.34, C.emerald, 3);

  // Tightly wound scrolls, with visible concentric ends and sealing wax.
  function scroll(x: number, y: number, z: number, length: number, radius: number) {
    b.part(new THREE.CylinderGeometry(radius, radius, length, 12), C.parchment, {
      at: [x, y, z],
      dir: [1, 0, 0],
      bone: cabinet,
      name: "rolled parchment",
    });
    for (const s of [-1, 1]) {
      const end = x + s * (length / 2 + 0.001);
      torus([end, y, z], radius * 0.70, radius * 0.115, C.paperEdge, [0, 90, 0], "scroll end spiral");
      b.part(new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, 0.003, 10), C.paperEdge, {
        at: [end + s * 0.001, y, z],
        dir: [1, 0, 0],
        bone: cabinet,
        name: "scroll core",
      });
    }
    b.part(new THREE.CylinderGeometry(radius + 0.003, radius + 0.003, 0.037, 12), C.red, {
      at: [x + length * 0.08, y, z],
      dir: [1, 0, 0],
      bone: cabinet,
      name: "scroll ribbon",
    });
    ball([x + length * 0.08, y - 0.005, z + radius], 0.023, C.red, [1, 1, 0.4], "wax seal");
  }

  scroll(0.405, 0.425, 0.105, 0.43, 0.055);
  scroll(0.412, 0.426, -0.018, 0.46, 0.056);
  scroll(0.413, 0.522, 0.047, 0.39, 0.052);
  scroll(0.416, 0.609, 0.045, 0.34, 0.042);

  // A pair of smaller rolled charts in a low open document holder.
  box([0.37, 1.022, 0.015], [0.19, 0.11, 0.25], WOOD, [0, 0, 0], "chart box");
  box([0.37, 1.082, 0.015], [0.202, 0.015, 0.263], GOLD, [0, 0, 0], "chart box rim");
  for (const x of [0.325, 0.414]) {
    b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.28, 10), C.parchment, {
      at: [x, 1.173, 0.013],
      bone: cabinet,
      name: "upright chart roll",
    });
    torus([x, 1.314, 0.013], 0.022, 0.004, C.paperEdge, [90, 0, 0], "chart rolled top");
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 10), C.teal, {
      at: [x, 1.145, 0.013],
      bone: cabinet,
      name: "chart tie",
    });
  }
  star([0.37, 1.026, 0.146], 0.029, GOLD);

  // The hero object: a faceted, glowing orb in a little gilded armillary stand.
  const orbX = 0.075;
  const orbY = 1.837;
  const orbZ = 0.038;

  b.lathe(
    [
      [0, 0], [0.117, 0], [0.128, 0.015], [0.117, 0.033],
      [0.062, 0.045], [0.045, 0.088], [0.080, 0.104],
      [0.084, 0.119], [0, 0.119],
    ],
    {
      at: [orbX, 1.569, orbZ],
      color: GOLD,
      segments: 10,
      bone: cabinet,
      name: "orb pedestal",
    },
  );
  torus([orbX, 1.587, orbZ], 0.12, 0.009, C.goldLight, [90, 0, 0], "pedestal rim");

  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    const x = orbX + Math.cos(a) * 0.123;
    const z = orbZ + Math.sin(a) * 0.123;
    b.sweep(
      catmull([
        [orbX + Math.cos(a) * 0.055, 1.662, orbZ + Math.sin(a) * 0.055],
        [x, 1.710, z],
        [orbX + Math.cos(a) * 0.145, 1.800, orbZ + Math.sin(a) * 0.145],
      ]),
      [0.012, 0.007],
      { color: GOLD, bone: cabinet, sides: 6, name: "orb cradle claw" },
    );
  }

  const orb = glow(
    b.part(new THREE.IcosahedronGeometry(0.143, 2), C.cyan, {
      at: [orbX, orbY, orbZ],
      bone: cabinet,
      flat: true,
      name: "luminous scrying orb",
    }),
    0.85,
  );
  glow(
    b.decal(orb, ORB_RUNES, {
      at: [orbX, orbY, orbZ + 0.141],
      dir: [0, 0, 1],
      size: [0.211, 0.211],
      segments: 10,
      lift: 0.0018,
      bone: cabinet,
      name: "luminous orb inscriptions",
    }),
    1.1,
  );
  torus([orbX, orbY, orbZ], 0.175, 0.0085, GOLD, [68, 0, -22], "inclined armillary ring");
  torus([orbX, orbY, orbZ], 0.178, 0.007, C.goldLight, [0, 68, 18], "meridian ring");
  ball([orbX - 0.163, orbY + 0.056, orbZ + 0.02], 0.022, GOLD);
  ball([orbX + 0.163, orbY - 0.056, orbZ - 0.02], 0.022, GOLD);
  ball([orbX - 0.045, orbY + 0.064, orbZ + 0.119], 0.024, "#d9ffff", [1, 1.3, 0.2], "orb highlight");

  // Candles are built from their foot upward, so every drip and flame is rooted.
  function candle(x: number, bottom: number, z: number, height: number, radius = 0.034) {
    b.lathe(
      [
        [0, 0], [0.058, 0], [0.064, 0.012], [0.058, 0.023],
        [0.024, 0.036], [0.018, 0.063], [0.061, 0.074],
        [0.066, 0.084], [0.060, 0.093], [0, 0.093],
      ],
      {
        at: [x, bottom, z],
        segments: 10,
        color: GOLD,
        bone: cabinet,
        name: "brass candleholder",
      },
    );
    const waxBottom = bottom + 0.087;
    const top = waxBottom + height;
    b.part(new THREE.CylinderGeometry(radius * 0.94, radius, height, 10), WAX, {
      at: [x, waxBottom + height / 2, z],
      bone: cabinet,
      name: "ivory candle",
    });
    b.part(new THREE.CylinderGeometry(radius * 1.03, radius, 0.014, 10), WAX, {
      at: [x, top - 0.004, z],
      bone: cabinet,
      name: "melted wax crown",
    });
    for (let i = 0; i < 3; i++) {
      const a = 0.25 + i * 2.1;
      const dx = Math.cos(a) * radius * 0.91;
      const dz = Math.sin(a) * radius * 0.91;
      const length = height * (0.22 + i * 0.10);
      b.sweep(
        [
          [x + dx, top - 0.004, z + dz],
          [x + dx * 1.07, top - length, z + dz * 1.07],
        ],
        [0.007, 0.005],
        { color: WAX, bone: cabinet, sides: 6, name: "wax drip" },
      );
    }
    rod([x, top, z], [x, top + 0.022, z], 0.0035, C.ink, "charred wick");
    glow(
      b.sweep(
        catmull([
          [x, top + 0.012, z],
          [x - 0.008, top + 0.042, z],
          [x + 0.012, top + 0.087, z],
        ]),
        [0.013, 0.023, 0],
        {
          color: C.flame,
          bone: cabinet,
          sides: 7,
          caps: "flat",
          name: "golden candle flame",
        },
      ),
      1.4,
    );
    glow(
      b.part(new THREE.SphereGeometry(0.013, 7, 5), "#fff5bf", {
        at: [x, top + 0.033, z + 0.012],
        scale: [0.65, 1.5, 0.45],
        bone: cabinet,
        name: "bright flame heart",
      }),
      1.8,
    );
  }

  candle(-0.783, 2.217, 0.025, 0.160);
  candle(0.783, 2.217, 0.025, 0.225);
  candle(0.628, 0.969, 0.082, 0.175);
  candle(0.758, 0.105, 0.422, 0.157, 0.04);

  // A small pair of books on the stage suggests a library in active use.
  function flatBook(x: number, bottom: number, z: number, color: string, angle: number) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, THREE.MathUtils.degToRad(angle), 0),
    );
    const origin = new THREE.Vector3(x, bottom, z);
    const p = (v: V) => new THREE.Vector3(...v).applyQuaternion(q).add(origin);
    for (const y of [0.008, 0.071]) {
      b.part(new THREE.BoxGeometry(0.315, 0.016, 0.218), color, {
        at: p([0, y, 0]),
        quat: q,
        bone: cabinet,
        name: "stacked book cover",
      });
    }
    b.part(new THREE.BoxGeometry(0.286, 0.049, 0.193), PAGES, {
      at: p([0, 0.040, 0]),
      quat: q,
      bone: cabinet,
      name: "stacked book pages",
    });
    b.part(new THREE.BoxGeometry(0.315, 0.063, 0.018), color, {
      at: p([0, 0.039, -0.101]),
      quat: q,
      bone: cabinet,
      name: "stacked book binding",
    });
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      at: p([0, 0.080, 0]),
      quat: q.clone().multiply(
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
      ),
      texture: SEAL,
      bone: cabinet,
      name: "flat book moon emblem",
    });
  }
  flatBook(-0.614, 0.105, 0.422, C.ultramarine, -8);
  flatBook(-0.601, 0.185, 0.423, C.red, 7);

  // A few fallen crystal chips provide a quiet cyan echo of the scrying orb.
  for (let i = 0; i < 4; i++) {
    const r = 0.018 + random() * 0.014;
    b.part(new THREE.OctahedronGeometry(r), i % 2 ? C.teal : C.cyan, {
      at: [0.32 + i * 0.061, 0.104 + r * 0.6, 0.445 + (random() - 0.5) * 0.06],
      rotation: [20, i * 37, 64],
      scale: [0.8, 1.4, 0.7],
      bone: cabinet,
      name: "fallen crystal chip",
    });
  }

  return b.root;
}
```