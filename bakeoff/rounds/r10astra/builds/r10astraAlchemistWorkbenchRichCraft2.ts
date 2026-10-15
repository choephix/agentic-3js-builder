import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  svg,
  grain,
  paint,
  mix,
  noise,
  mottle,
  catmull,
  bezier,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Aster Atelier",
  description:
    "An ornate anime-fantasy alchemist's workbench: luminous botanical elixirs, a brass balance, gilded grimoires, a working alembic, hanging herbs and an illuminated celestial recipe board.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "The Aster Atelier", paintSize: 2048 });
  const root = b.joint("workbench", { at: [0, 0, 0] });
  const random = rng(417);

  const C = {
    ink: "#182a38",
    woodDark: "#263b3b",
    wood: "#42605a",
    teal: "#267678",
    tealLight: "#4da8a0",
    gold: "#d8ac59",
    goldLight: "#f7db91",
    brassDark: "#86623c",
    cream: "#eee5bd",
    page: "#e4d6ab",
    pageShadow: "#b7a77b",
    violet: "#6b5291",
    purple: "#b294dd",
    coral: "#dc8969",
    green: "#4e8561",
    mint: "#9edbb0",
    leafDark: "#285c50",
    rope: "#b9a374",
    stone: "#52626c",
    cork: "#aa7650",
  };

  const woodGrain = grain("#324c47", "#64806a", {
    size: 0.024,
    axis: "x",
    seed: 7,
  });
  const wood = paint((p, n) =>
    n.y > 0.4
      ? woodGrain
      : mix("#283b3c", "#496158", noise(p, 0.13, 5) * 0.65),
  );
  const gold = paint((p, n) =>
    mix(
      "#98713c",
      "#f1d28b",
      0.37 + 0.4 * Math.max(0, n.y) + 0.13 * noise(p, 0.04, 13),
    ),
  );
  const stone = mottle("#485b66", "#6c7c7e", {
    size: 0.22,
    seed: 18,
    contrast: 0.6,
  });
  const ceramic = paint((_p, n) =>
    mix("#a8bdad", "#f1efd3", 0.6 + n.y * 0.3),
  );
  const parchment = grain("#d1bf94", "#efe2ba", {
    size: 0.009,
    axis: "x",
    seed: 32,
  });

  function box(
    at: number[],
    size: number[],
    color: Fill,
    name?: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: root,
      rotation,
      name,
    });
  }

  function ball(at: number[], size: number[], color: Fill, name?: string) {
    return b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at,
      scale: size,
      bone: root,
      name,
      flat: true,
    });
  }

  function cylinder(
    at: number[],
    radius: number,
    height: number,
    color: Fill,
    name?: string,
    top = radius,
  ) {
    return b.part(new THREE.CylinderGeometry(top, radius, height, 12), color, {
      at,
      bone: root,
      name,
    });
  }

  function rod(a: number[], z: number[], radius: number, color: Fill) {
    return b.rod(a, z, radius, { color, bone: root, sides: 6 });
  }

  function ring(
    at: number[],
    radius: number,
    tube: number,
    color: Fill,
    normal: number[] = [0, 1, 0],
    name?: string,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 20), color, {
      at,
      dir: normal,
      axis: "z",
      bone: root,
      name,
    });
  }

  function drawing(
    texture: THREE.Texture,
    at: number[],
    size: number[],
    normal: number[] = [0, 0, 1],
    up: number[] = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir: normal,
      up,
      axis: "z",
      bone: root,
      texture,
    });
  }

  function star(
    at: number[],
    radius: number,
    color: Fill,
    thickness = 0.008,
  ) {
    const outline: number[][] = [];
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 4;
      const r = i % 2 === 0 ? radius : radius * 0.24;
      outline.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      color,
      bone: root,
    });
  }

  // Drawings share an ivory-and-gold, four-point-star visual language.
  function labelTexture(symbol: string, text: string, accent: string) {
    return svg(
      `<svg viewBox="0 0 128 150" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 8H115V126L101 142H27L13 126Z" fill="#efe6c6" stroke="#735a44" stroke-width="5"/>
        <path d="M23 18H105V122L96 132H32L23 122Z" fill="none" stroke="${accent}" stroke-width="3"/>
        <path d="M28 35H47M81 35H100M28 111H100" stroke="#ac884d" stroke-width="3"/>
        <g fill="${accent}" stroke="${accent}" stroke-width="3">${symbol}</g>
        <text x="64" y="102" text-anchor="middle" fill="#394b4c" font-family="serif" font-size="15" font-weight="bold">${text}</text>
        <path d="M39 120H89M49 125H79" stroke="#a89670" stroke-width="2.5"/>
      </svg>`,
      { size: 256 },
    );
  }

  const moonLabel = labelTexture(
    `<path d="M75 43A25 25 0 1 0 79 80A22 22 0 0 1 75 43Z"/>
     <path d="M86 45L89 54L98 57L89 60L86 69L83 60L74 57L83 54Z"/>`,
    "LUNA",
    "#6f5895",
  );
  const leafLabel = labelTexture(
    `<path d="M42 77Q37 45 84 42Q89 77 42 77Z" fill="none" stroke-width="5"/>
     <path d="M43 78L77 49M58 62V48M59 62L78 64" fill="none" stroke-width="3"/>`,
    "VIRIDIS",
    "#36796e",
  );
  const sunLabel = labelTexture(
    `<path d="M64 40L69 57L87 62L69 67L64 84L59 67L41 62L59 57Z"/>
     <circle cx="64" cy="62" r="27" fill="none" stroke-width="2"/>`,
    "AURUM",
    "#bd8241",
  );

  const celestial = svg(
    `<svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="480" fill="#173b48"/>
      <path d="M22 451V143Q22 24 200 24Q378 24 378 143V451Z"
        fill="none" stroke="#c9a864" stroke-width="5"/>
      <path d="M36 440V146Q36 42 200 42Q364 42 364 146V440Z"
        fill="none" stroke="#568c86" stroke-width="3"/>
      <g fill="none" stroke="#81b5a5">
        <circle cx="200" cy="226" r="128" stroke-width="2.5"/>
        <circle cx="200" cy="226" r="107" stroke-width="2"/>
        <ellipse cx="200" cy="226" rx="128" ry="47" transform="rotate(-35 200 226)" stroke-width="3"/>
        <ellipse cx="200" cy="226" rx="128" ry="47" transform="rotate(35 200 226)" stroke-width="2"/>
        <path d="M72 226H328M200 98V354" stroke-width="2" stroke-dasharray="6 9"/>
      </g>
      <g fill="#eed492">
        <path d="M200 146L216 210L280 226L216 242L200 306L184 242L120 226L184 210Z"/>
        <circle cx="200" cy="97" r="7"/><circle cx="328" cy="226" r="7"/>
        <circle cx="72" cy="226" r="7"/><circle cx="200" cy="355" r="7"/>
        <path d="M89 119L94 134L109 139L94 144L89 159L84 144L69 139Z"/>
        <path d="M309 300L313 312L325 316L313 320L309 332L305 320L293 316L305 312Z"/>
      </g>
      <circle cx="200" cy="226" r="24" fill="#173b48" stroke="#f5dfab" stroke-width="4"/>
      <path d="M200 208L205 221L218 226L205 231L200 244L195 231L182 226L195 221Z" fill="#91dfce"/>
      <text x="200" y="397" text-anchor="middle" font-family="serif" font-size="25" letter-spacing="5" fill="#ead69e">ASTER</text>
      <text x="200" y="425" text-anchor="middle" font-family="serif" font-size="13" letter-spacing="3" fill="#9cc9b9">ARS • NATURAE</text>
      <path d="M158 68H242M176 78H224" stroke="#d2b472" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  const bookCover = svg(
    `<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="320" fill="#284e61"/>
      <path d="M15 15H225V305H15Z M25 25H215V295H25Z" fill="none" stroke="#dbbd78" stroke-width="3"/>
      <path d="M37 45V83M37 45H75M203 45V83M203 45H165
        M37 275V237M37 275H75M203 275V237M203 275H165" fill="none" stroke="#e7cb8b" stroke-width="6"/>
      <circle cx="120" cy="150" r="63" fill="none" stroke="#80aeb3" stroke-width="3"/>
      <path d="M120 76L135 134L190 150L135 166L120 224L105 166L50 150L105 134Z"
        fill="none" stroke="#e9d297" stroke-width="5"/>
      <path d="M120 112L128 142L155 150L128 158L120 188L112 158L85 150L112 142Z" fill="#dfc98c"/>
      <text x="120" y="258" text-anchor="middle" font-family="serif" font-size="15" letter-spacing="2" fill="#ead8a4">HERBARIUM</text>
      <path d="M80 270H160" stroke="#b4c6b8" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const recipe = svg(
    `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="300" fill="#e9dcb5"/>
      <path d="M15 15H225V285H15Z" fill="none" stroke="#b59c69" stroke-width="3"/>
      <text x="120" y="42" text-anchor="middle" font-family="serif" font-size="19" fill="#466462">Lunar Distillation</text>
      <g stroke="#57796b" fill="none" stroke-width="3">
        <path d="M80 68H110M88 68V99Q54 148 95 155Q136 148 102 99V68"/>
        <path d="M66 132Q95 121 123 132M95 156V177M70 178H120"/>
        <path d="M162 84V170M162 109Q137 99 142 81Q163 84 162 109Z
          M162 134Q185 127 184 105Q163 110 162 134Z"/>
      </g>
      <g fill="none" stroke="#95805b" stroke-width="3" stroke-linecap="round">
        <path d="M36 201H154M36 213H198M36 225H182M36 249H119M36 261H166"/>
        <circle cx="192" cy="251" r="17"/>
        <path d="M192 236V266M177 251H207"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const apronTexture = svg(
    `<svg viewBox="0 0 640 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#d8b975" stroke-width="4">
        <path d="M15 20H245L270 50L245 80H15M625 20H395L370 50L395 80H625"/>
        <path d="M35 34H218M35 66H218M422 34H605M422 66H605"/>
        <path d="M270 50L320 7L370 50L320 93Z"/>
      </g>
      <path d="M320 18L329 41L352 50L329 59L320 82L311 59L288 50L311 41Z" fill="#f1d697"/>
      <g fill="#80b8a8"><circle cx="256" cy="50" r="5"/><circle cx="384" cy="50" r="5"/></g>
    </svg>`,
    { size: 768 },
  );

  // A little piece of the academy floor, rather than a large diorama.
  b.part(new THREE.CylinderGeometry(1, 1.02, 0.075, 10), C.ink, {
    at: [0, 0.0375, 0],
    scale: [1.3, 1, 0.82],
    bone: root,
    name: "ten-sided stone footing",
  });
  b.part(new THREE.CylinderGeometry(0.99, 0.99, 0.012, 10), stone, {
    at: [0, 0.079, 0],
    scale: [1.3, 1, 0.82],
    bone: root,
  });
  const floorRim: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI * 2) / 10;
    floorRim.push([1.244 * Math.sin(a), 0.087, 0.785 * Math.cos(a)]);
  }
  b.sweep([...floorRim, floorRim[0]], 0.006, {
    color: C.brassDark,
    bone: root,
    sides: 4,
  });
  for (const x of [-0.71, 0, 0.71]) {
    rod([x, 0.087, -0.57], [x, 0.087, 0.57], 0.0025, "#82928f");
  }

  // Square, sturdy furniture, with carved feet and gilded corner joinery.
  for (const x of [-0.86, 0.86]) {
    for (const z of [-0.32, 0.32]) {
      box([x, 0.53, z], [0.12, 0.89, 0.12], wood, "square carved leg");
      box([x, 0.135, z], [0.157, 0.1, 0.157], C.woodDark);
      box([x, 0.197, z], [0.143, 0.024, 0.143], gold);
      box([x, 0.873, z], [0.15, 0.15, 0.15], C.teal);
      box([x, 0.94, z], [0.163, 0.025, 0.163], gold);
      if (z > 0) {
        box([x, 0.566, z + 0.062], [0.018, 0.48, 0.007], gold);
        star([x, 0.869, z + 0.081], 0.042, C.goldLight);
      }
    }
  }

  box([0, 0.331, 0], [1.84, 0.062, 0.7], wood, "lower storage shelf");
  box([0, 0.363, 0.344], [1.86, 0.018, 0.024], gold);
  box([0, 0.85, 0.365], [1.77, 0.19, 0.075], C.woodDark, "front apron");
  box([0, 0.944, 0.41], [1.91, 0.022, 0.026], gold);
  drawing(apronTexture, [0, 0.85, 0.405], [1.54, 0.17]);

  for (const x of [-0.94, 0.94]) {
    box([x, 0.862, 0], [0.06, 0.17, 0.77], C.woodDark);
    for (const z of [-0.26, 0.26]) {
      b.extrude(
        [[0, 0], [0.16, 0], [0, -0.19]],
        {
          at: [x > 0 ? x - 0.055 : x + 0.055, 0.94, z],
          x: [x > 0 ? -1 : 1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.044,
          color: C.teal,
          bone: root,
        },
      );
    }
  }

  box([0, 0.987, 0], [2.03, 0.086, 0.9], C.woodDark, "tabletop underframe");
  for (let i = 0; i < 5; i++) {
    box(
      [0, 1.039, -0.352 + i * 0.176],
      [2.045, 0.042, 0.172],
      wood,
      "individual tabletop plank",
    );
  }
  box([0, 1.028, 0.451], [2.06, 0.035, 0.025], gold);
  for (const x of [-1.018, 1.018]) {
    box([x, 1.032, 0], [0.026, 0.05, 0.92], gold);
    for (const z of [-0.36, 0.36]) {
      box([x * 0.965, 1.063, z], [0.085, 0.009, 0.13], gold);
      for (const dz of [-0.035, 0.035]) {
        ball([x * 0.965, 1.071, z + dz], [0.009, 0.005, 0.009], C.goldLight);
      }
    }
  }

  // Rear hutch: two short shelves frame the celestial recipe board.
  for (const s of [-1, 1]) {
    const x = s * 0.92;
    box([x, 1.51, -0.378], [0.065, 0.9, 0.07], C.woodDark, "hutch upright");
    box([x, 1.51, -0.337], [0.015, 0.86, 0.012], gold);
    cylinder([x, 1.983, -0.378], 0.048, 0.05, gold);
    ball([x, 2.024, -0.378], [0.033, 0.042, 0.033], C.tealLight);
    box([s * 0.638, 1.557, -0.365], [0.605, 0.045, 0.242], wood);
    box([s * 0.638, 1.58, -0.238], [0.622, 0.022, 0.025], gold);
    for (const xx of [s * 0.39, s * 0.86]) {
      b.extrude(
        [[0, 0], [0.16, 0], [0, -0.15]],
        {
          at: [xx, 1.534, -0.45],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.025,
          color: C.teal,
          bone: root,
        },
      );
    }
  }

  box([0, 1.91, -0.419], [1.86, 0.065, 0.052], C.woodDark);
  box([0, 1.948, -0.415], [1.88, 0.012, 0.067], gold);
  const arch = [
    [-0.36, 0], [0.36, 0], [0.36, 0.54],
    [0.31, 0.65], [0.2, 0.735], [0, 0.78],
    [-0.2, 0.735], [-0.31, 0.65], [-0.36, 0.54],
  ];
  b.extrude(arch, {
    at: [0, 1.235, -0.44],
    x: [1, 0, 0],
    thickness: 0.048,
    color: gold,
    bone: root,
    name: "gilded arched celestial backboard",
  });
  drawing(celestial, [0, 1.615, -0.413], [0.68, 0.745]);
  star([0, 2.038, -0.432], 0.076, gold, 0.023);
  glow(star([0, 2.038, -0.414], 0.039, "#b7f4d9", 0.008), 0.55);

  // Each potion has a low-poly body, shoulder, neck, rolled lip,
  // stopper, tied tag and a painted reflection rather than invisible glass.
  function potion(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    liquid: string,
    glass: string,
    label: THREE.Texture,
    luminous = false,
  ) {
    const body = b.lathe(
      [
        [0, 0], [r * 0.68, 0], [r * 0.93, h * 0.045],
        [r, h * 0.18], [r, h * 0.43], [r * 0.92, h * 0.52],
        [0, h * 0.52],
      ],
      {
        at: [x, y, z],
        segments: 10,
        color: liquid,
        bone: root,
        name: "faceted elixir reservoir",
      },
    );
    if (luminous) glow(body, 0.32);
    b.lathe(
      [
        [0, h * 0.515], [r * 0.925, h * 0.515],
        [r * 0.84, h * 0.61], [r * 0.39, h * 0.74],
        [r * 0.35, h * 0.88], [0, h * 0.88],
      ],
      {
        at: [x, y, z],
        segments: 10,
        color: glass,
        bone: root,
        name: "sloped glass shoulder and neck",
      },
    );
    ring([x, y + h * 0.86, z], r * 0.37, r * 0.085, glass);
    cylinder([x, y + h * 0.915, z], r * 0.295, h * 0.115, C.cork);
    cylinder([x, y + h * 0.969, z], r * 0.32, h * 0.018, gold);
    ring([x, y + h * 0.746, z], r * 0.4, 0.004, C.rope);

    b.decal(body, label, {
      at: [x, y + h * 0.29, z + r],
      dir: [0, 0, 1],
      size: [r * 1.12, h * 0.33],
      segments: 5,
      lift: 0.0018,
      bone: root,
    });
    b.sweep(
      [
        [x - r * 0.6, y + h * 0.18, z + r * 0.79],
        [x - r * 0.65, y + h * 0.38, z + r * 0.75],
        [x - r * 0.56, y + h * 0.49, z + r * 0.79],
      ],
      r * 0.065,
      { color: glass, bone: root, sides: 4, caps: "round" },
    );
    return body;
  }

  potion(-0.79, 1.583, -0.36, 0.064, 0.26, "#a88bcf", "#d6c7e6", moonLabel);
  potion(-0.61, 1.583, -0.36, 0.056, 0.3, "#5aaba3", "#b6ddcb", leafLabel, true);
  potion(-0.43, 1.583, -0.36, 0.052, 0.2, "#d5a45a", "#e9d8ac", sunLabel);
  potion(0.45, 1.583, -0.36, 0.055, 0.24, "#8d75b9", "#d4c4e2", moonLabel);
  potion(0.63, 1.583, -0.36, 0.061, 0.29, "#dc9478", "#eed4b7", sunLabel);
  potion(0.8, 1.583, -0.35, 0.046, 0.2, "#62aa87", "#c1ddba", leafLabel);

  // The central alembic: a mint elixir, open metal cage, burner and
  // a graceful copper gooseneck draining into a smaller receiving flask.
  const ax = 0.035;
  const az = -0.045;
  cylinder([ax, 1.08, az], 0.145, 0.035, C.ink);
  cylinder([ax, 1.103, az], 0.122, 0.024, gold);
  cylinder([ax, 1.13, az], 0.063, 0.045, C.teal);
  ring([ax, 1.155, az], 0.064, 0.008, gold);
  glow(
    b.part(new THREE.OctahedronGeometry(0.035, 0), "#ffe6a0", {
      at: [ax, 1.186, az],
      scale: [0.7, 1.35, 0.7],
      bone: root,
      name: "small alchemical flame",
    }),
    1.3,
  );
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    rod(
      [ax + dx * 0.105, 1.108, az + dz * 0.105],
      [ax + dx * 0.108, 1.257, az + dz * 0.108],
      0.009,
      gold,
    );
  }
  ring([ax, 1.255, az], 0.115, 0.012, gold);
  const mainFlask = b.lathe(
    [
      [0, 0], [0.071, 0.008], [0.11, 0.046],
      [0.125, 0.105], [0.116, 0.17], [0.087, 0.215], [0, 0.215],
    ],
    { at: [ax, 1.221, az], color: "#60c4ae", segments: 12, bone: root },
  );
  glow(mainFlask, 0.35);
  b.lathe(
    [
      [0, 0.211], [0.089, 0.211], [0.057, 0.253],
      [0.031, 0.271], [0.031, 0.323], [0, 0.323],
    ],
    { at: [ax, 1.221, az], color: "#c0e8d2", segments: 12, bone: root },
  );
  b.decal(mainFlask, leafLabel, {
    at: [ax, 1.335, az + 0.126],
    dir: [0, 0, 1],
    size: [0.092, 0.112],
    bone: root,
    segments: 6,
  });
  b.sweep(
    bezier(
      [ax - 0.074, 1.271, az + 0.082],
      [ax - 0.119, 1.353, az + 0.06],
      [ax - 0.068, 1.418, az + 0.061],
    ),
    0.007,
    { color: "#ddffee", bone: root, sides: 5 },
  );
  cylinder([ax, 1.552, az], 0.044, 0.031, gold);
  b.sweep(
    catmull([
      [ax, 1.565, az],
      [ax + 0.015, 1.647, az],
      [0.16, 1.674, az],
      [0.305, 1.57, az],
      [0.39, 1.462, az],
      [0.39, 1.359, az],
    ]),
    [0.021, 0.016],
    { color: gold, bone: root, sides: 8, caps: "flat", name: "alembic swan-neck condenser" },
  );
  for (let i = 0; i < 4; i++) {
    ring(
      [0.39, 1.38 + i * 0.022, az],
      0.022,
      0.0045,
      i % 2 ? C.teal : C.goldLight,
    );
  }
  potion(0.39, 1.063, az, 0.068, 0.29, "#69bcb3", "#c1e9d9", leafLabel, true);

  // A brass balance with separate chain suspensions and shallow bowls.
  const sx = -0.59;
  const sz = 0.105;
  b.lathe(
    [[0, 0], [0.115, 0], [0.115, 0.022], [0.087, 0.045], [0.042, 0.054], [0, 0.054]],
    { at: [sx, 1.061, sz], color: C.ink, bone: root, segments: 12 },
  );
  cylinder([sx, 1.111, sz], 0.084, 0.013, gold);
  rod([sx, 1.115, sz], [sx, 1.462, sz], 0.014, gold);
  for (const yy of [1.147, 1.414]) cylinder([sx, yy, sz], 0.028, 0.018, gold);
  ball([sx, 1.48, sz], [0.032, 0.032, 0.032], C.goldLight);
  star([sx, 1.532, sz], 0.045, gold, 0.013);
  rod([sx - 0.232, 1.46, sz], [sx + 0.232, 1.46, sz], 0.012, gold);
  rod([sx, 1.455, sz + 0.025], [sx + 0.017, 1.38, sz + 0.025], 0.004, C.ink);

  for (const s of [-1, 1]) {
    const px = sx + s * 0.205;
    const panY = 1.205;
    ring([px, 1.457, sz], 0.017, 0.004, C.goldLight, [0, 0, 1]);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
      const end = [px + Math.cos(a) * 0.091, panY + 0.026, sz + Math.sin(a) * 0.091];
      rod([px, 1.441, sz], end, 0.003, C.goldLight);
    }
    b.lathe(
      [
        [0, 0], [0.052, 0], [0.091, 0.017], [0.099, 0.032],
        [0.091, 0.036], [0.048, 0.01], [0, 0.01],
      ],
      { at: [px, panY, sz], color: gold, bone: root, segments: 12 },
    );
    ring([px, panY + 0.034, sz], 0.094, 0.004, C.goldLight);
    if (s === -1) {
      for (let i = 0; i < 3; i++) {
        cylinder([px - 0.035 + i * 0.034, panY + 0.024, sz], 0.018, 0.023 + i * 0.006, C.brassDark);
        ball([px - 0.035 + i * 0.034, panY + 0.041 + i * 0.003, sz], [0.009, 0.009, 0.009], gold);
      }
    } else {
      for (const d of [[-0.025, 0.016], [0.02, 0.01], [0, -0.022]]) {
        b.part(new THREE.OctahedronGeometry(0.026), "#a7d9c1", {
          at: [px + d[0], panY + 0.031, sz + d[1]],
          scale: [0.75, 1, 0.65],
          bone: root,
          rotation: [0, random() * 90, 20],
        });
      }
    }
  }

  // Books are assemblies with visible page blocks, gilded corners,
  // raised spine bands, ribbons and matching illustrated covers.
  function book(
    at: number[],
    w: number,
    h: number,
    d: number,
    color: string,
    yaw: number,
    decorated = true,
  ) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      (yaw * Math.PI) / 180,
    );
    const p = (x: number, y: number, z: number) =>
      new THREE.Vector3(x, y, z).applyQuaternion(q).add(new THREE.Vector3(...at));
    const part = (size: number[], pos: number[], fill: Fill) =>
      b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), fill, {
        at: p(pos[0], pos[1], pos[2]),
        quat: q,
        bone: root,
      });
    part([w, 0.013, d], [0, 0.0065, 0], color);
    part([w - 0.025, h - 0.026, d - 0.025], [0.005, h / 2, 0], parchment);
    part([w, 0.013, d], [0, h - 0.0065, 0], color);
    part([0.022, h, d], [-w / 2 + 0.009, h / 2, 0], color);
    for (const zz of [-d * 0.34, d * 0.34]) {
      part([0.029, h + 0.006, 0.014], [-w / 2 + 0.008, h / 2, zz], gold);
    }
    for (const xx of [-1, 1]) {
      for (const zz of [-1, 1]) {
        part([0.041, 0.004, 0.03], [xx * (w / 2 - 0.025), h + 0.002, zz * (d / 2 - 0.02)], gold);
      }
    }
    for (let i = 0; i < 3; i++) {
      part([w - 0.035, 0.0016, 0.002], [0.005, 0.022 + i * (h - 0.04) / 3, d / 2 - 0.011], C.pageShadow);
    }
    if (decorated) {
      const faceQ = q.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2),
      );
      b.part(new THREE.PlaneGeometry(w - 0.04, d - 0.035), "#ffffff", {
        at: p(0, h + 0.0025, 0),
        quat: faceQ,
        bone: root,
        texture: bookCover,
      });
    }
    part([0.021, 0.003, 0.075], [w * 0.19, h * 0.57, d / 2 + 0.019], C.coral);
  }

  book([0.686, 1.062, 0.19], 0.35, 0.071, 0.34, C.violet, -7, false);
  book([0.67, 1.133, 0.185], 0.32, 0.082, 0.32, C.teal, 7, true);
  book([0.61, 0.367, -0.015], 0.38, 0.09, 0.39, C.coral, -3, false);
  book([0.62, 0.457, -0.01], 0.36, 0.075, 0.35, C.teal, 5, true);

  // An open recipe, a short quill and a little enamel inkwell at the front.
  box([0.12, 1.065, 0.303], [0.274, 0.006, 0.24], parchment, "loose recipe parchment", [0, -9, 0]);
  drawing(recipe, [0.12, 1.070, 0.303], [0.255, 0.224], [0, 1, 0], [0, 0, -1]);
  for (const x of [-0.012, 0.252]) {
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.239, 8), parchment, {
      at: [x, 1.074, 0.303],
      dir: [0, 0, 1],
      bone: root,
    });
  }
  cylinder([0.34, 1.089, 0.319], 0.033, 0.052, C.ink);
  ring([0.34, 1.116, 0.319], 0.025, 0.005, gold);
  rod([0.338, 1.113, 0.318], [0.404, 1.293, 0.292], 0.003, C.goldLight);
  b.extrude(
    [[0, 0], [-0.018, 0.055], [-0.011, 0.105], [0.003, 0.141], [0.017, 0.09], [0.014, 0.037]],
    {
      at: [0.371, 1.197, 0.302],
      x: [1, 0, 0],
      y: [0.34, 1, -0.12],
      thickness: 0.0025,
      color: C.cream,
      bone: root,
      name: "ivory writing quill",
    },
  );

  // Herbs: individually shaped broad leaves, a strong stem silhouette,
  // simple botanical vein strokes and a few lavender flower heads.
  function leaf(
    at: number[],
    tip: number[],
    width: number,
    color: Fill,
  ) {
    const start = new THREE.Vector3(...at);
    const end = new THREE.Vector3(...tip);
    const length = start.distanceTo(end);
    const dir = end.clone().sub(start).normalize();
    const side = new THREE.Vector3(-dir.y, dir.x, 0);
    if (side.lengthSq() < 0.01) side.set(1, 0, 0);
    side.normalize();
    const blade = b.extrude(
      [[0, 0], [width * 0.54, length * 0.38], [width * 0.37, length * 0.7],
        [0, length], [-width * 0.37, length * 0.7], [-width * 0.54, length * 0.38]],
      {
        at,
        x: side,
        y: dir,
        thickness: 0.003,
        color,
        bone: root,
      },
    );
    const a = start.clone().add(new THREE.Vector3(0, 0, 0.003));
    const e = end.clone().add(new THREE.Vector3(0, 0, 0.003));
    b.rod(a, e, 0.0018, { color: C.mint, bone: root, sides: 4 });
    return blade;
  }

  for (const side of [-1, 1]) {
    const x = side * 0.886;
    const z = -0.203;
    ring([x, 1.558, z], 0.02, 0.004, gold, [0, 0, 1]);
    rod([x, 1.542, z], [x, 1.472, z], 0.006, C.rope);
    for (let k = 0; k < 3; k++) {
      const dx = (k - 1) * 0.032;
      const stemBottom = [x + dx * 1.5, 1.235 - (k % 2) * 0.035, z + 0.012];
      rod([x, 1.479, z], stemBottom, 0.0035, C.rope);
      for (let j = 0; j < 3; j++) {
        const yy = 1.399 - j * 0.052;
        const xx = x + dx * (0.4 + j * 0.3);
        const sign = (k + j) % 2 ? 1 : -1;
        leaf(
          [xx, yy, z + 0.008],
          [xx + sign * (0.052 + j * 0.004), yy - 0.064, z + 0.018],
          0.038,
          j % 2 ? C.green : C.leafDark,
        );
      }
      if (side === -1) {
        for (let j = 0; j < 3; j++) {
          ball(
            [stemBottom[0] + (j % 2 ? 0.01 : -0.007), stemBottom[1] + j * 0.018, z + 0.014],
            [0.014, 0.02, 0.012],
            j === 0 ? C.purple : C.violet,
          );
        }
      }
    }
    ring([x, 1.465, z], 0.019, 0.005, C.rope);
  }

  // A porcelain mortar and its pestle sit clear of the books.
  b.lathe(
    [
      [0, 0], [0.055, 0], [0.058, 0.018], [0.046, 0.029],
      [0.078, 0.065], [0.085, 0.113], [0.076, 0.119],
      [0.066, 0.072], [0.039, 0.048], [0, 0.044],
    ],
    {
      at: [0.76, 1.061, -0.095],
      color: ceramic,
      bone: root,
      segments: 12,
      name: "porcelain herb mortar",
    },
  );
  ring([0.76, 1.175, -0.095], 0.081, 0.005, gold);
  b.capsule([0.745, 1.117, -0.095], [0.82, 1.258, -0.09], [0.017, 0.012], {
    color: ceramic,
    bone: root,
    sides: 8,
  });
  leaf([0.746, 1.122, -0.056], [0.69, 1.177, -0.045], 0.035, C.green);

  // Lower storage: spare bottles in a slatted crate and rolled field notes.
  box([-0.53, 0.386, -0.02], [0.48, 0.042, 0.42], wood);
  for (const z of [-0.222, 0.182]) {
    for (let j = 0; j < 3; j++) {
      box([-0.53, 0.418 + j * 0.047, z], [0.48, 0.034, 0.019], j % 2 ? C.wood : C.woodDark);
    }
  }
  for (const x of [-0.765, -0.295]) {
    box([x, 0.469, -0.02], [0.027, 0.18, 0.43], wood);
  }
  for (const x of [-0.735, -0.325]) {
    box([x, 0.465, 0.195], [0.018, 0.178, 0.009], gold);
  }
  potion(-0.64, 0.408, -0.02, 0.065, 0.32, "#729b91", "#b8d7bd", leafLabel);
  potion(-0.435, 0.408, -0.045, 0.069, 0.355, "#a387ad", "#d7c5d5", moonLabel);

  for (let i = 0; i < 3; i++) {
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.3, 10), parchment, {
      at: [-0.07 + i * 0.077, 0.404, -0.055],
      dir: [0, 0, 1],
      bone: root,
    });
    ring([-0.07 + i * 0.077, 0.404, 0.098], 0.025, 0.006, C.pageShadow, [0, 0, 1]);
    ring([-0.07 + i * 0.077, 0.404, 0.1], 0.012, 0.004, C.page, [0, 0, 1]);
    ring([-0.07 + i * 0.077, 0.404, -0.03], 0.038, 0.005, C.rope, [0, 0, 1]);
  }

  // A few intentionally placed small items finish the working surface.
  cylinder([-0.279, 1.078, 0.322], 0.041, 0.033, gold);
  cylinder([-0.279, 1.101, 0.322], 0.024, 0.018, C.brassDark);
  ball([-0.279, 1.119, 0.322], [0.011, 0.012, 0.011], gold);
  for (let i = 0; i < 3; i++) {
    const x = -0.905 + i * 0.018;
    leaf([x, 1.065, 0.056], [x + 0.06, 1.069, 0.16 + i * 0.018], 0.034, C.green);
  }
  ring([0.91, 1.066, 0.29], 0.033, 0.005, gold);
  rod([0.888, 1.067, 0.268], [0.842, 1.067, 0.218], 0.007, C.woodDark);

  // Small inset corner stars connect the stage to the furniture's motif.
  for (const x of [-1.08, 1.08]) {
    b.part(new THREE.OctahedronGeometry(0.035), C.gold, {
      at: [x, 0.091, 0.49],
      scale: [1, 0.07, 1],
      bone: root,
    });
  }

  return b.root;
}
