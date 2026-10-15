import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
  grain,
  catmull,
  bezier,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Mournreaper — Dragonbone Soul Scythe",
  description:
    "A monumental dragonbone scythe with a hooked, soul-lit blade, a horned dragon-skull socket, violet leather, gilded ossuary fittings and a captive spirit in its haft. Presented on a small shattered summoning seal.",
};

type P = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Mournreaper", paintSize: 2048, detail: 1 });
  const random = rng(71329);
  const root = b.joint("relic", { at: [0, 0, 0] });

  const C = {
    ink: "#181424",
    black: "#242034",
    violet: "#42274f",
    plum: "#703d69",
    leather: "#36233e",
    stitch: "#b89a96",
    bone: "#ead7aa",
    lightBone: "#fff0c6",
    coolBone: "#a9beb2",
    boneShadow: "#718d86",
    gold: "#c79b4c",
    goldLight: "#ffe0a0",
    jade: "#24776f",
    teal: "#24d9b6",
    mint: "#9bffe0",
    white: "#e2fff0",
    stone: "#343342",
    stoneLight: "#545266",
  };

  const agedBone = paint((p, n) => {
    const cloud = noise(p, 0.13, 8);
    let color = mix("#a9b8a0", "#f3e0b1", cloud * 0.55 + 0.35);
    color = mix(color, "#fff2ca", Math.max(0, n.y) * 0.28);
    color = mix(color, "#708c84", Math.max(0, -n.y) * 0.36);
    const fleck = noise(p, 0.024, 19);
    if (fleck < 0.22) color = mix(color, "#836c53", 0.12);
    return color;
  });

  const bladeBone = paint((p, n) => {
    const weather = noise(p, 0.18, 25);
    const light = n.x * 0.25 + n.y * 0.8 + Math.abs(n.z) * 0.38;
    const lit = mix("#dfc797", "#fff0c6", 0.35 + weather * 0.4);
    const shadow = mix("#82998d", "#bdc6aa", 0.3 + weather * 0.4);
    const plane = light > 0.26 ? lit : shadow;
    const vein = Math.sin(p.x * 35 + p.y * 13 + weather * 8);
    return mix(plane, "#637e75", Math.max(0, vein - 0.83) * 0.28);
  });

  const obsidian = grain("#171b2c", "#3d3550", {
    axis: "y",
    size: 0.026,
    seed: 3,
  });

  const leather = paint((p, n) => {
    const grainValue = noise(p, 0.014, 54);
    const line = Math.abs(Math.sin(p.y * 460 + p.x * 70));
    return mix(
      mix("#302137", "#68405d", grainValue * 0.68 + n.z * 0.12),
      "#967080",
      line > 0.97 ? 0.13 : 0,
    );
  });

  const stonePaint = paint((p, n) => {
    const f = noise(p, 0.09, 35);
    let col = mix("#242633", "#575467", f);
    if (n.y > 0.6) col = mix(col, "#82798a", 0.2);
    if (p.y < 0.055) col = mix(col, "#131c28", 0.35);
    return col;
  });

  const gold = metal("brass", {
    polish: 0.55,
    tarnish: 0.32,
    verdigris: 0.16,
    seed: 41,
  });

  const darkMetal = metal("iron", {
    polish: 0.28,
    tarnish: 0.45,
    seed: 22,
  });

  // All of the drawings share a small, deliberately limited visual vocabulary:
  // broken diamonds, dragon fangs, and a three-pronged soul flame.
  const nostrilTexture = svg(
    `<svg viewBox="0 0 48 64">
      <path d="M12 53 L9 30 L23 10 L37 6 L36 35 L25 53Z"
            fill="#263b38"/>
      <path d="M15 43 L16 29 L28 15" fill="none"
            stroke="#708a78" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 120 60">
      <path d="M3 24 L43 12 L116 5 L94 39 L49 51 L15 39Z" fill="#102831"/>
      <path d="M12 25 L49 20 L105 12 L86 33 L47 43 L24 36Z" fill="#20d8b7"/>
      <path d="M26 27 L54 24 L94 17 L79 30 L48 37Z" fill="#c9ffe6"/>
      <path d="M59 18 L67 17 L61 39 L54 40Z" fill="#164d50"/>
      <path d="M17 29 L34 26" stroke="#efffed" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const soulTexture = svg(
    `<svg viewBox="0 0 100 140">
      <path d="M49 3 Q74 31 71 43 Q99 37 91 72 Q99 112 54 137
               Q8 120 10 86 Q-3 62 30 43 Q23 23 49 3Z" fill="#50e9bd"/>
      <path d="M49 20 Q59 42 53 56 Q81 47 79 75 Q87 105 53 125
               Q21 106 25 84 Q13 69 43 58Z" fill="#c9ffe0"/>
      <path d="M19 72 L43 83 L44 94 L29 87Z" fill="#143d45"/>
      <path d="M81 72 L57 83 L56 94 L72 87Z" fill="#143d45"/>
      <path d="M26 78 L38 84 L32 84Z M74 78 L62 84 L68 84Z" fill="#f2fff0"/>
      <path d="M50 88 L43 103 L57 103Z" fill="#24746b"/>
      <path d="M32 111 L40 103 L47 108 L51 104 L57 108 L65 103
               L69 111 L61 108 L57 119 L52 112 L47 121 L42 111 L37 116Z"
            fill="#143d45"/>
      <path d="M37 56 Q32 46 41 34 M67 63 Q76 52 71 44"
            fill="none" stroke="#efffeb" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 80 120">
      <path d="M39 8 L62 32 L49 45 L64 65 L42 106 L17 79 L31 60
               L17 42 L39 8Z" fill="#617e70" stroke="#325853" stroke-width="7"/>
      <path d="M39 8 L62 32 L49 45 L64 65 L42 106 L17 79 L31 60
               L17 42 L39 8Z" fill="none" stroke="#e1c28b" stroke-width="3.5"/>
      <path d="M40 24 L40 91 M26 43 L51 62 L31 79 M50 35 L30 59"
            fill="none" stroke="#b9f3d3" stroke-width="5"/>
      <path d="M7 60 L13 56 L17 61 L12 66Z M65 86 L70 81 L75 87 L70 92Z"
            fill="#e5d3a2"/>
    </svg>`,
    { size: 256 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 4 L89 40 L76 85 L50 115 L24 85 L11 40Z"
            fill="#283d3d" stroke="#d4b675" stroke-width="5"/>
      <path d="M50 19 L70 43 L62 56 L50 83 L38 56 L30 43Z"
            fill="#35c9aa" stroke="#f0d59c" stroke-width="3"/>
      <path d="M50 31 L56 48 L50 65 L44 48Z" fill="#d6ffe3"/>
      <path d="M19 44 L31 61 L29 82 M81 44 L69 61 L71 82"
            fill="none" stroke="#b79a66" stroke-width="4"/>
      <path d="M43 95 L50 103 L57 95" fill="none" stroke="#d4b675" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const bannerTexture = svg(
    `<svg viewBox="0 0 120 260">
      <path d="M10 4 L110 4 L105 240 L61 220 L17 254Z"
            fill="#402b50" stroke="#b99061" stroke-width="5"/>
      <path d="M22 14 L98 14 M20 30 L100 30 M26 207 L61 193 L94 209"
            fill="none" stroke="#7d6577" stroke-width="3"/>
      <path d="M61 48 L88 86 L73 115 L88 147 L61 184 L33 147
               L48 115 L33 86Z" fill="#192d39" stroke="#bba576" stroke-width="4"/>
      <path d="M60 65 L72 94 L62 110 L72 140 L60 161 L48 140
               L58 111 L48 94Z" fill="#59cfb5"/>
      <path d="M61 73 L61 155 M38 86 L48 90 M84 86 L74 90"
            fill="none" stroke="#d4f7d8" stroke-width="3"/>
      <path d="M24 44 L23 188 M98 44 L97 188"
            stroke="#b99061" stroke-width="3" stroke-dasharray="5 7"/>
    </svg>`,
    { size: 512 },
  );

  const gripTexture = svg(
    `<svg viewBox="0 0 100 300">
      <path d="M50 8 L83 42 L50 77 L17 42Z M50 113 L83 148
               L50 184 L17 148Z M50 220 L83 254 L50 289 L17 254Z"
            fill="none" stroke="#ae8a78" stroke-width="4"/>
      <path d="M50 26 L63 42 L50 59 L37 42Z M50 132 L63 148
               L50 166 L37 148Z M50 237 L63 254 L50 271 L37 254Z"
            fill="#255b58" stroke="#ceb28b" stroke-width="3"/>
      <path d="M50 77 L50 113 M50 184 L50 220"
            stroke="#b8947b" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const sealTicks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const x1 = 150 + Math.sin(a) * 121;
    const y1 = 150 + Math.cos(a) * 121;
    const x2 = 150 + Math.sin(a) * (i % 3 === 0 ? 100 : 111);
    const y2 = 150 + Math.cos(a) * (i % 3 === 0 ? 100 : 111);
    return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke-width="${i % 3 === 0 ? 4 : 2.5}"/>`;
  }).join("");

  const sealTexture = svg(
    `<svg viewBox="0 0 300 300">
      <g fill="none" stroke="#53c3ab">
        <circle cx="150" cy="150" r="136" stroke-width="3"/>
        <circle cx="150" cy="150" r="127" stroke-width="2"/>
        <circle cx="150" cy="150" r="94" stroke-width="2"/>
        ${sealTicks}
        <path d="M150 56 L231 197 L69 197Z M150 245 L69 103 L231 103Z"
              stroke-width="2"/>
        <path d="M150 93 L199 150 L150 207 L101 150Z" stroke-width="4"/>
      </g>
      <g fill="#a4f5cf">
        <path d="M150 7 L158 19 L150 32 L142 19Z"/>
        <path d="M150 268 L158 281 L150 293 L142 281Z"/>
        <path d="M8 150 L20 142 L32 150 L20 158Z"/>
        <path d="M268 150 L280 142 L292 150 L280 158Z"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const plaqueTexture = svg(
    `<svg viewBox="0 0 520 150">
      <rect x="3" y="3" width="514" height="144" rx="11"
            fill="#242632" stroke="#bc995e" stroke-width="6"/>
      <path d="M25 31 L65 31 M455 31 L495 31 M25 119 L65 119
               M455 119 L495 119" stroke="#708880" stroke-width="3"/>
      <text x="260" y="67" text-anchor="middle" fill="#f0d4a0"
            font-family="serif" font-size="43" letter-spacing="7">MOURNREAPER</text>
      <text x="260" y="106" text-anchor="middle" fill="#8fceba"
            font-family="serif" font-size="19" letter-spacing="6">THE LAST BREATH</text>
    </svg>`,
    { size: 768 },
  );

  // Placement helpers keep all geometry on the builder and the display's root.
  function box(name: string, at: P, size: P, color: Fill, rotation?: P) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: root,
      rotation,
      name,
    });
  }

  function ball(name: string, at: P, scale: P, color: Fill, detail = 0) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at,
      scale,
      bone: root,
      name,
      flat: true,
    });
  }

  function rod(name: string, a: P, c: P, radius: number, color: Fill) {
    return b.rod(a, c, radius, {
      color,
      bone: root,
      sides: 8,
      name,
    });
  }

  function cuff(
    name: string,
    y: number,
    radius: number,
    height: number,
    color: Fill,
    x = 0,
    z = 0,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 10), color, {
      at: [x, y, z],
      bone: root,
      name,
      flat: true,
    });
  }

  function torus(
    name: string,
    at: P,
    radius: number,
    tube: number,
    color: Fill,
    rotation: P = [90, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 4, 16), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function drawing(
    name: string,
    at: P,
    size: [number, number],
    texture: THREE.Texture,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      rotation,
      texture,
      bone: root,
      name,
    });
  }

  function curvedBone(
    name: string,
    points: P[],
    radii: number[],
    color: Fill = agedBone,
  ) {
    return b.sweep(catmull(points), radii, {
      bone: root,
      color,
      sides: 7,
      smooth: false,
      caps: { start: "flat", end: "point" },
      name,
    });
  }

  function diamond(name: string, at: P, w: number, h: number, color: Fill) {
    return b.extrude(
      [
        [0, h / 2],
        [w / 2, 0],
        [0, -h / 2],
        [-w / 2, 0],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.015,
        bevel: 0.003,
        color,
        bone: root,
        name,
      },
    );
  }

  // A little fractured summoning plinth, not a competing environment.
  b.part(new THREE.CylinderGeometry(0.51, 0.555, 0.125, 8), stonePaint, {
    at: [0, 0.0625, 0],
    bone: root,
    name: "Eight-sided ossuary stone",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(0.475, 0.50, 0.035, 8), C.ink, {
    at: [0, 0.134, 0],
    bone: root,
    name: "Recessed seal bed",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(0.447, 0.468, 0.018, 12), stonePaint, {
    at: [0, 0.157, 0],
    bone: root,
    name: "Seal stone",
    flat: true,
  });

  glow(
    drawing("Summoning circle", [0, 0.168, 0], [0.85, 0.85], sealTexture, [-90, 0, 0]),
    0.8,
  );

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.sin(a) * 0.493;
    const z = Math.cos(a) * 0.493;
    box(
      `Plinth gilt staple ${i}`,
      [x, 0.11, z],
      [0.052, 0.045, 0.015],
      gold,
      [0, (a * 180) / Math.PI, 0],
    );
  }

  const crackPaths: P[][] = [
    [[-0.08, 0.172, 0.03], [-0.19, 0.172, 0.12], [-0.26, 0.172, 0.1], [-0.42, 0.172, 0.19]],
    [[0.04, 0.172, -0.04], [0.18, 0.172, -0.13], [0.25, 0.172, -0.26], [0.35, 0.172, -0.3]],
    [[0.09, 0.172, 0.02], [0.19, 0.172, 0.18], [0.3, 0.172, 0.22], [0.4, 0.172, 0.35]],
  ];

  crackPaths.forEach((points, i) =>
    b.sweep(points, 0.007, { color: C.ink, bone: root, name: `Broken seal crack ${i}` }),
  );

  for (let i = 0; i < 12; i++) {
    const a = random() * Math.PI * 2;
    const radius = 0.36 + random() * 0.13;
    const h = 0.025 + random() * 0.038;
    ball(
      `Seal rubble ${i}`,
      [Math.sin(a) * radius, 0.164 + h * 0.45, Math.cos(a) * radius],
      [h * 1.25, h * 0.65, h],
      stonePaint,
    );
  }

  function crystalCluster(cx: number, cz: number, count: number) {
    for (let i = 0; i < count; i++) {
      const x = cx + (random() - 0.5) * 0.1;
      const z = cz + (random() - 0.5) * 0.09;
      const h = 0.07 + random() * 0.105;
      const r = 0.022 + random() * 0.012;
      const part = b.part(new THREE.ConeGeometry(r, h, 5), i % 2 ? C.jade : C.teal, {
        at: [x, 0.17 + h / 2, z],
        rotation: [(random() - 0.5) * 23, i * 41, (random() - 0.5) * 25],
        bone: root,
        name: `Soulglass crystal ${cx} ${i}`,
        flat: true,
      });
      if (i % 2 === 0) glow(part, 0.7);
    }
  }

  crystalCluster(-0.31, -0.12, 4);
  crystalCluster(0.27, -0.26, 3);

  box("Museum plaque backing", [0, 0.086, 0.506], [0.37, 0.105, 0.024], darkMetal);
  drawing("Relic nameplate", [0, 0.087, 0.52], [0.35, 0.098], plaqueTexture);

  // The continuous black haft is intentionally slim against the enormous blade.
  rod("Obsidian haft", [0, 0.275, 0], [0, 2.73, 0], 0.041, obsidian);
  rod("Haft front channel", [0, 0.35, 0.041], [0, 2.47, 0.041], 0.012, C.ink);
  glow(rod("Trapped soul filament", [0, 0.36, 0.052], [0, 2.46, 0.052], 0.0045, C.teal), 1.2);

  // A pointed, armoured counterweight sinks into the stone socket.
  curvedBone(
    "Dragon tooth counterweight",
    [[0, 0.43, 0], [0, 0.34, 0.012], [0, 0.18, 0.01]],
    [0.077, 0.055, 0],
  );

  cuff("Pommel iron throat", 0.418, 0.071, 0.07, darkMetal);
  cuff("Pommel gilt upper lip", 0.457, 0.076, 0.018, gold);
  cuff("Pommel gilt lower lip", 0.38, 0.065, 0.016, gold);
  diamond("Pommel jewel seat", [0, 0.419, 0.072], 0.074, 0.085, C.ink);
  glow(diamond("Pommel jade", [0, 0.419, 0.083], 0.043, 0.058, C.teal), 1.1);

  for (const s of [-1, 1]) {
    curvedBone(
      `Pommel barb ${s}`,
      [[s * 0.044, 0.45, 0], [s * 0.103, 0.37, -0.005], [s * 0.076, 0.28, 0]],
      [0.026, 0.021, 0],
      gold,
    );
  }

  for (const y of [0.53, 0.635, 1.61, 2.19, 2.31, 2.43]) {
    cuff(`Vertebral collar ${y}`, y, 0.063, 0.039, agedBone);
    cuff(`Collar dark bedding ${y}`, y - 0.025, 0.051, 0.013, C.ink);
    diamond(`Collar keel ${y}`, [0, y, 0.067], 0.043, 0.064, gold);

    for (const s of [-1, 1]) {
      curvedBone(
        `Vertebral wing ${y} ${s}`,
        [[s * 0.044, y + 0.014, 0], [s * 0.086, y - 0.008, -0.009], [s * 0.098, y - 0.058, -0.01]],
        [0.025, 0.017, 0],
      );
    }
  }

  // Short, broad leather windings; a light diagonal welt makes the spiral legible.
  cuff("Grip underlayer", 1.135, 0.053, 0.875, C.ink);

  for (let i = 0; i < 13; i++) {
    const y = 0.741 + i * 0.063;
    cuff(`Violet leather winding ${i}`, y, 0.058 + (i % 3 === 0 ? 0.002 : 0), 0.059, leather);

    const path: P[] = [];
    for (let k = 0; k <= 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      path.push([Math.sin(a) * 0.0595, y - 0.027 + (k / 16) * 0.055, Math.cos(a) * 0.0595]);
    }
    b.sweep(path, 0.0026, {
      color: C.stitch,
      bone: root,
      sides: 5,
      name: `Leather welt ${i}`,
    });

    for (const s of [-1, 1]) {
      rod(
        `Grip stitch ${i} ${s}`,
        [s * 0.039, y - 0.008, 0.044],
        [s * 0.042, y + 0.003, 0.043],
        0.0018,
        C.gold,
      );
    }
  }

  cuff("Grip lower ferrule", 0.691, 0.067, 0.05, darkMetal);
  cuff("Grip lower gilt bead", 0.719, 0.068, 0.012, gold);
  cuff("Grip upper ferrule", 1.568, 0.069, 0.056, darkMetal);
  cuff("Grip upper gilt bead", 1.602, 0.071, 0.015, gold);

  b.decal(
    b.surface(b.root),
    gripTexture,
    {
      at: [0, 1.135, 0.065],
      dir: [0, 0, 1],
      size: [0.057, 0.58],
      segments: 7,
      lift: 0.0018,
      bone: root,
      name: "Grip diamond embroidery",
    },
  );

  for (const y of [0.692, 1.568]) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ball(
        `Ferrule pin ${y} ${i}`,
        [Math.sin(a) * 0.067, y, Math.cos(a) * 0.067],
        [0.008, 0.008, 0.008],
        gold,
      );
    }
  }

  // The exposed soul reservoir breaks the long haft into a memorable assembly.
  cuff("Soul vessel lower socket", 1.714, 0.089, 0.085, darkMetal);
  cuff("Soul vessel lower gold ring", 1.756, 0.095, 0.018, gold);
  cuff("Soul vessel upper socket", 2.079, 0.082, 0.075, darkMetal);
  cuff("Soul vessel upper gold ring", 2.04, 0.091, 0.018, gold);

  glow(
    ball("Captive soul body", [0, 1.896, 0.018], [0.075, 0.139, 0.065], "#239e91", 1),
    0.65,
  );
  glow(
    drawing("The captive spirit", [0, 1.899, 0.092], [0.138, 0.209], soulTexture),
    1.2,
  );

  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    curvedBone(
      `Ossuary cage rib ${i}`,
      [
        [sx * 0.062, 1.733, sz * 0.062],
        [sx * 0.107, 1.814, sz * 0.107],
        [sx * 0.111, 1.951, sz * 0.111],
        [sx * 0.057, 2.084, sz * 0.057],
      ],
      [0.023, 0.017, 0.018, 0.023],
    );
    ball(`Cage lower rivet ${i}`, [sx * 0.074, 1.758, sz * 0.074], [0.012, 0.012, 0.012], gold);
    ball(`Cage upper rivet ${i}`, [sx * 0.074, 2.044, sz * 0.074], [0.012, 0.012, 0.012], gold);
  }

  diamond("Vessel lower crest", [0, 1.717, 0.095], 0.079, 0.082, gold);
  diamond("Vessel upper crest", [0, 2.078, 0.09], 0.071, 0.078, gold);
  glow(diamond("Vessel upper emerald", [0, 2.08, 0.102], 0.029, 0.045, C.mint), 1);

  // A thin ceremonial pennant hangs behind the fittings, never in front of the face.
  b.extrude(
    [[-0.078, 0.22], [0.078, 0.22], [0.085, -0.19], [0.004, -0.145], [-0.088, -0.23]],
    {
      at: [-0.257, 2.24, -0.101],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: C.violet,
      bone: root,
      name: "Oath pennant cloth",
    },
  );

  drawing("Embroidered oath pennant", [-0.26, 2.238, -0.088], [0.174, 0.445], bannerTexture);

  rod("Pennant crossbar", [-0.355, 2.46, -0.1], [-0.105, 2.46, -0.1], 0.013, gold);
  for (const x of [-0.32, -0.2]) {
    torus("Pennant suspension ring", [x, 2.46, -0.09], 0.024, 0.005, gold, [0, 0, 0]);
  }

  // Alternating chain links are real low-sided rings, not a drawn chain.
  const chainPoints: P[] = [
    [-0.29, 2.48, 0.016],
    [-0.345, 2.413, 0.024],
    [-0.385, 2.333, 0.026],
    [-0.405, 2.247, 0.031],
    [-0.407, 2.162, 0.04],
    [-0.399, 2.079, 0.049],
  ];

  rod(
    "Charm chain anchor",
    [-0.29, 2.48, -0.1],
    [-0.29, 2.48, 0.016],
    0.012,
    gold,
  );

  const charmChain = catmull(chainPoints);
  const charmLinks = Math.ceil(charmChain.length / 0.033);
  for (let i = 0; i <= charmLinks; i++) {
    const p = charmChain.at(i / charmLinks);
    const tangent = charmChain.tangentAt(i / charmLinks);
    const linkFrame = frame(p, tangent, [0, 0, 1]);
    const linkGeometry = new THREE.TorusGeometry(0.024, 0.005, 5, 12);
    // Keep the long axis along the chain tangent. Alternate the planes,
    // rather than rotating horizontal hoops around their own normal.
    linkGeometry.scale(0.79, 1.18, 1);
    linkGeometry.rotateY(i % 2 ? Math.PI / 2 : 0);
    b.part(linkGeometry, gold, {
      frame: linkFrame,
      bone: root,
      name: `Interlocked reliquary chain ${i}`,
    });
  }

  ball("Small dragon-tooth charm head", [-0.398, 2.019, 0.05], [0.042, 0.04, 0.031], agedBone);
  curvedBone(
    "Hanging dragon tooth",
    [[-0.398, 2.01, 0.05], [-0.405, 1.954, 0.06], [-0.385, 1.913, 0.063]],
    [0.033, 0.022, 0],
  );
  diamond("Charm rune", [-0.398, 2.022, 0.084], 0.019, 0.031, C.jade);

  // The blade is a broad hooked crescent, with true angular bevels.
  const outer: P[] = [
    [0.018, 2.785, 0],
    [0.28, 3.045, 0],
    [0.69, 3.145, 0],
    [1.065, 3.022, 0],
    [1.391, 2.702, 0],
    [1.602, 2.269, 0],
    [1.651, 1.614, 0],
  ];

  const inner: P[] = [
    [0.107, 2.513, 0],
    [0.363, 2.682, 0],
    [0.69, 2.737, 0],
    [0.982, 2.604, 0],
    [1.232, 2.319, 0],
    [1.481, 1.969, 0],
    [1.651, 1.614, 0],
  ];

  // The perimeter and both sculpted faces meet at the same razor-thin tip.
  // There is no constant-thickness extrusion hiding underneath the bevels.
  for (let k = 0; k < outer.length - 1; k++) {
    quad(
      `Solid blade outer wall ${k}`,
      [
        bladePoint(k, 0, -0.048),
        bladePoint(k + 1, 0, -0.048),
        bladePoint(k + 1, 0, 0.048),
        bladePoint(k, 0, 0.048),
      ],
      agedBone,
    );
    glow(
      quad(
        `Solid blade cutting wall ${k}`,
        [
          bladePoint(k, 1, 0.047),
          bladePoint(k + 1, 1, 0.047),
          bladePoint(k + 1, 1, -0.047),
          bladePoint(k, 1, -0.047),
        ],
        C.teal,
      ),
      0.85,
    );
  }

  quad(
    "Closed blade root",
    [
      bladePoint(0, 0, 0.048),
      bladePoint(0, 1, 0.047),
      bladePoint(0, 1, -0.047),
      bladePoint(0, 0, -0.048),
    ],
    agedBone,
  );

  function bladePoint(index: number, across: number, z: number): P {
    const o = outer[index];
    const i = inner[index];
    // The last thirteen percent of the face converges to a real edge.
    // All attached edge strips use this same taper, so no luminous wall
    // or floating highlight survives in the side silhouette.
    const edgeTaper =
      across <= 0.87 ? 1 : 1 - Math.min(1, (across - 0.87) / 0.13) * 0.975;
    return [
      o[0] + (i[0] - o[0]) * across,
      o[1] + (i[1] - o[1]) * across,
      index === outer.length - 1
        ? Math.sign(z) * 0.0005
        : z * edgeTaper,
    ];
  }

  function quad(name: string, points: P[], color: Fill, reverse = false) {
    const geometry = new THREE.BufferGeometry();
    const positions = points.flat();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2),
    );
    geometry.setIndex(reverse ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();
    return b.part(geometry, color, { at: [0, 0, 0], bone: root, name, flat: true });
  }

  const bladeFaces: ReturnType<typeof quad>[] = [];

  for (const face of [1, -1]) {
    for (let k = 0; k < outer.length - 1; k++) {
      const endScale = k === 5 ? 0.22 : 1;
      const zo = face * 0.048;
      const zr0 = face * (k === 0 ? 0.118 : 0.106);
      const zr1 = face * 0.106 * endScale;
      const ze = face * 0.048;
      const reverse = face < 0;

      bladeFaces.push(
        quad(
          `Blade broad spine bevel ${face} ${k}`,
          [
            bladePoint(k, 0, zo),
            bladePoint(k + 1, 0, zo),
            bladePoint(k + 1, 0.51, zr1),
            bladePoint(k, 0.51, zr0),
          ],
          bladeBone,
          !reverse,
        ),
      );

      bladeFaces.push(
        quad(
          `Blade hollow bevel ${face} ${k}`,
          [
            bladePoint(k, 0.51, zr0),
            bladePoint(k + 1, 0.51, zr1),
            bladePoint(k + 1, 0.87, ze),
            bladePoint(k, 0.87, ze),
          ],
          k % 2 ? "#91b3a4" : "#acc9b5",
          !reverse,
        ),
      );

      const edge = quad(
        `Soulglass cutting bevel ${face} ${k}`,
        [
          bladePoint(k, 0.87, ze + face * 0.001),
          bladePoint(k + 1, 0.87, ze + face * 0.001),
          bladePoint(k + 1, 1, face * 0.047),
          bladePoint(k, 1, face * 0.047),
        ],
        C.teal,
        !reverse,
      );
      glow(edge, 0.85);

      glow(
        quad(
          `Incandescent knife edge ${face} ${k}`,
          [
            bladePoint(k, 0.975, face * 0.049),
            bladePoint(k + 1, 0.975, face * 0.049),
            bladePoint(k + 1, 1, face * 0.049),
            bladePoint(k, 1, face * 0.049),
          ],
          C.mint,
          !reverse,
        ),
        1.25,
      );
    }
  }

  // A raised gilded seam follows the heavy outer spine, not the cutting edge.
  for (const face of [-1, 1]) {
    const seam: P[] = outer.map((_, i) => bladePoint(i, 0.065, face * 0.059));
    b.sweep(seam, [0.009, 0.006, 0.007, 0.006, 0.005, 0.004, 0], {
      color: gold,
      bone: root,
      sides: 5,
      caps: "flat",
      name: `Gilt blade spine ${face}`,
    });
  }

  // Seated decals follow the actual ridged blade faces.
  const bladeSurface = b.surface(bladeFaces);

  // A recessed-looking vein follows the hollow bevel. Its dark bed is wider
  // than the luminous core, so the light reads as contained magic, not wire.
  for (const face of [-1, 1]) {
    const route: P[] = [];
    for (let k = 0; k < 6; k++) {
      route.push(bladePoint(k, 0.68, face * 0.22));
    }
    const groove = bladeSurface.drape(route, { lift: 0.002 });
    b.sweep(groove, 0.0075, {
      color: "#335a55",
      sides: 5,
      caps: "flat",
      bone: root,
      name: `Carved soul channel bed ${face}`,
    });
    const core = bladeSurface.drape(route, { lift: 0.009 });
    glow(
      b.sweep(core, [0.0035, 0.004, 0.0035, 0.003, 0.002, 0.0005], {
        color: C.teal,
        sides: 5,
        caps: "flat",
        bone: root,
        name: `Living blade soul channel ${face}`,
      }),
      0.95,
    );

    for (const k of [1, 2, 3, 4]) {
      const a = bladePoint(k, 0.68, face * 0.22);
      const c = bladePoint(k, 0.82, face * 0.22);
      const d = bladePoint(k, 0.93, face * 0.22);
      c[0] += 0.025;
      const branch = bladeSurface.drape([a, c, d], { lift: 0.004 });
      b.sweep(branch, 0.0055, {
        color: "#335a55",
        sides: 5,
        bone: root,
        name: `Soul fissure bed ${face} ${k}`,
      });
      const light = bladeSurface.drape([a, c, d], { lift: 0.008 });
      glow(
        b.sweep(light, [0.003, 0.0025, 0.0005], {
          color: C.mint,
          sides: 5,
          bone: root,
          name: `Soul fissure light ${face} ${k}`,
        }),
        1,
      );
    }
  }

  const runePlacements = [
    { x: 0.37, y: 2.866, w: 0.145, h: 0.209, roll: -27 },
    { x: 0.65, y: 2.954, w: 0.158, h: 0.227, roll: -2 },
    { x: 0.93, y: 2.871, w: 0.147, h: 0.213, roll: 29 },
    { x: 1.18, y: 2.661, w: 0.127, h: 0.191, roll: 43 },
    { x: 1.405, y: 2.331, w: 0.088, h: 0.15, roll: 58 },
  ];

  for (const face of [-1, 1]) {
    runePlacements.forEach((r, i) => {
      b.decal(bladeSurface, runeTexture, {
        at: [r.x, r.y, face * 0.16],
        dir: [0, 0, face],
        size: [r.w, r.h],
        roll: face * r.roll,
        segments: 4,
        lift: 0.002,
        bone: root,
        name: `Ancient blade inscription ${face} ${i}`,
      });
    });
  }

  // Bone cracks use the geometry's surface rather than floating above a guessed plane.
  for (let k = 1; k <= 4; k++) {
    const p0 = bladePoint(k, 0.07, 0.2);
    const p1 = bladePoint(k, 0.33, 0.2);
    const p2 = bladePoint(k, 0.53, 0.2);
    p1[0] += 0.025;
    p2[0] -= 0.007;
    const draped = bladeSurface.drape([p0, p1, p2], { lift: 0.0025 });
    b.sweep(draped, 0.0032, {
      color: "#5c786f",
      bone: root,
      sides: 5,
      name: `Bone fissure ${k}`,
    });
  }

  for (let k = 1; k <= 4; k++) {
    const p = outer[k];
    const previous = outer[k - 1];
    const next = outer[k + 1];
    const dx = next[0] - previous[0];
    const dy = next[1] - previous[1];
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const length = k === 1 ? 0.19 : 0.13;

    curvedBone(
      `Blade dorsal tooth ${k}`,
      [
        [p[0] - nx * 0.012, p[1] - ny * 0.012, 0],
        [p[0] + nx * length * 0.55 - 0.018, p[1] + ny * length * 0.55, -0.012],
        [p[0] + nx * length - 0.045, p[1] + ny * length, -0.02],
      ],
      [0.036, 0.024, 0],
    );

    for (const face of [-1, 1]) {
      ball(
        `Blade spine rivet ${k} ${face}`,
        [p[0] - nx * 0.035, p[1] - ny * 0.035, face * 0.066],
        [0.014, 0.014, 0.009],
        gold,
      );
    }
  }

  // A substantial socket makes the blade feel mechanically attached to the haft.
  b.frustumBox([0, 2.4, -0.025], [0, 2.81, -0.025], [0.16, 0.16], [0.19, 0.18], {
    color: darkMetal,
    bone: root,
    name: "Blade socket tang",
  });

  for (const y of [2.427, 2.512, 2.603]) {
    cuff(`Socket iron band ${y}`, y, 0.106, 0.044, darkMetal);
    cuff(`Socket gold rim ${y}`, y + 0.023, 0.11, 0.009, gold);
  }

  for (const face of [-1, 1]) {
    b.extrude(
      [[-0.14, -0.105], [0.16, -0.07], [0.24, 0.12], [0.08, 0.235], [-0.15, 0.13]],
      {
        at: [0.02, 2.68, face * 0.103],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.007,
        color: gold,
        bone: root,
        name: `Gilded dragon socket plate ${face}`,
      },
    );
    for (const p of [[-0.09, 2.66], [0.16, 2.735], [0.075, 2.86]]) {
      ball(
        `Socket plate pin ${face} ${p[0]}`,
        [p[0], p[1], face * 0.124],
        [0.015, 0.015, 0.01],
        darkMetal,
      );
    }
  }

  // DRAGON SKULL: heavy brow, deeply inset eyes, long nose, separate lower jaw.
  // The skull projects toward +Z; its horns are behind the face.
  ball("Dragon skull cranium", [-0.031, 2.739, 0.09], [0.235, 0.23, 0.224], agedBone, 1);

  const upperSnout = b.frustumBox(
    [-0.03, 2.666, 0.146],
    [-0.03, 2.551, 0.392],
    [0.245, 0.175],
    [0.162, 0.111],
    { color: agedBone, bone: root, name: "Dragon upper snout" },
  );

  b.frustumBox(
    [-0.03, 2.393, 0.112],
    [-0.03, 2.402, 0.359],
    [0.227, 0.092],
    [0.151, 0.072],
    { color: agedBone, bone: root, name: "Dragon lower jaw" },
  );

  ball("Jaw chin plate", [-0.03, 2.373, 0.23], [0.116, 0.046, 0.12], bladeBone);

  for (const s of [-1, 1]) {
    const x = -0.03 + s * 0.142;

    b.extrude(
      [[-0.071, 0.025], [-0.036, 0.065], [0.065, 0.044], [0.079, -0.004], [0.029, -0.052], [-0.061, -0.028]],
      {
        at: [x, 2.733, 0.263],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026,
        color: C.ink,
        bone: root,
        name: `Dragon eye socket ${s}`,
      },
    );

    const eye = drawing(
      `Soulfire dragon eye ${s}`,
      [x, 2.73, 0.279],
      [0.123, 0.064],
      eyeTexture,
      [0, 0, s * 9],
    );
    if (s < 0) {
      // Mirror the UVs, preserving front-facing normals.
      const uv = eye.mesh.geometry.getAttribute("uv");
      for (let v = 0; v < uv.count; v++) uv.setX(v, 1 - uv.getX(v));
      uv.needsUpdate = true;
    }
    glow(eye, 1.4);

    b.frustumBox(
      [-0.03 + s * 0.044, 2.823, 0.267],
      [-0.03 + s * 0.252, 2.781, 0.218],
      [0.075, 0.073],
      [0.061, 0.045],
      { color: bladeBone, bone: root, name: `Overhanging dragon brow ${s}` },
    );

    b.frustumBox(
      [-0.03 + s * 0.222, 2.685, 0.187],
      [-0.03 + s * 0.12, 2.509, 0.301],
      [0.092, 0.085],
      [0.071, 0.058],
      { color: agedBone, bone: root, name: `Dragon cheek strut ${s}` },
    );

    curvedBone(
      `Rear cheek fang ${s}`,
      [
        [-0.03 + s * 0.205, 2.639, 0.13],
        [-0.03 + s * 0.293, 2.569, 0.088],
        [-0.03 + s * 0.324, 2.46, 0.063],
      ],
      [0.051, 0.032, 0],
    );

    // Large hooked canines frame the open, dark mouth.
    curvedBone(
      `Upper dragon canine ${s}`,
      [
        [-0.03 + s * 0.082, 2.521, 0.309],
        [-0.03 + s * 0.091, 2.456, 0.34],
        [-0.03 + s * 0.071, 2.408, 0.34],
      ],
      [0.026, 0.019, 0],
      C.lightBone,
    );

    curvedBone(
      `Lower dragon tusk ${s}`,
      [
        [-0.03 + s * 0.091, 2.426, 0.227],
        [-0.03 + s * 0.117, 2.472, 0.249],
        [-0.03 + s * 0.105, 2.503, 0.259],
      ],
      [0.019, 0.012, 0],
      C.bone,
    );

    ball(
      `Dragon jaw hinge ${s}`,
      [-0.03 + s * 0.16, 2.452, 0.12],
      [0.044, 0.046, 0.037],
      gold,
    );

    ball(
      `Jaw hinge dark pin ${s}`,
      [-0.03 + s * 0.169, 2.453, 0.151],
      [0.019, 0.02, 0.011],
      C.ink,
    );

    // Conforming marks stay seated on the angled snout cap in side view.
    b.decal(upperSnout, nostrilTexture, {
      at: [-0.03 + s * 0.043, 2.553, 0.46],
      dir: [0, 0, 1],
      size: [0.032, 0.044],
      mirror: s < 0,
      segments: 4,
      lift: 0.0015,
      bone: root,
      name: `Seated dragon nostril ${s}`,
    });
  }

  // A few small, deliberately separated incisors.
  for (let i = 0; i < 4; i++) {
    const x = -0.03 + (i - 1.5) * 0.027;
    b.spike([x, 2.508, 0.391], [0, -1, 0.06], 0.039, 0.011, {
      color: C.lightBone,
      bone: root,
      sides: 5,
      name: `Dragon incisor ${i}`,
    });
  }

  glow(ball("Soul in dragon throat", [-0.03, 2.46, 0.234], [0.039, 0.042, 0.039], C.teal), 1.1);

  diamond("Forehead armour setting", [-0.03, 2.884, 0.247], 0.107, 0.153, gold);
  drawing("Dragon forehead seal", [-0.03, 2.885, 0.258], [0.087, 0.126], foreheadTexture);

  curvedBone(
    "Dragon nasal ridge",
    [[-0.03, 2.852, 0.276], [-0.03, 2.714, 0.296], [-0.03, 2.607, 0.427]],
    [0.029, 0.022, 0.009],
    C.lightBone,
  );

  // Long asymmetric horns make the skull unmistakable in silhouette.
  for (const s of [-1, 1]) {
    const length = s < 0 ? 1.1 : 0.88;
    const start: P = [-0.03 + s * 0.157, 2.891, 0.005];

    const hornPoints: P[] = [
      start,
      [-0.03 + s * 0.27, 3.002, -0.049],
      [-0.03 + s * 0.36 * length, 3.17, -0.096],
      [-0.03 + s * 0.3 * length, 3.306, -0.126],
      [-0.03 + s * 0.2 * length, 3.334, -0.112],
    ];

    const horn = curvedBone(
      `Great dragon horn ${s}`,
      hornPoints,
      [0.073, 0.064, 0.042, 0.019, 0],
    );

    // Root collars are oriented from the actual horn tangent.
    const f = horn.curve().at(0.13);
    const tangent = horn.curve().tangentAt(0.13);
    b.part(new THREE.CylinderGeometry(0.068, 0.071, 0.046, 8), gold, {
      at: f,
      dir: tangent,
      bone: root,
      name: `Great horn binding ${s}`,
      flat: true,
    });

    for (let j = 0; j < 4; j++) {
      const t = 0.28 + j * 0.13;
      const center = horn.curve().at(t);
      const direction = horn.curve().tangentAt(t);
      const radius = 0.058 * (1 - t) + 0.006;
      b.part(new THREE.CylinderGeometry(radius, radius + 0.003, 0.01, 7), "#8a9b88", {
        at: center,
        dir: direction,
        bone: root,
        name: `Horn growth annulus ${s} ${j}`,
        flat: true,
      });
    }

    curvedBone(
      `Lateral skull horn ${s}`,
      [
        [-0.03 + s * 0.205, 2.795, 0.005],
        [-0.03 + s * 0.331, 2.844, -0.065],
        [-0.03 + s * 0.418, 2.954, -0.087],
      ],
      [0.052, 0.034, 0],
    );
  }

  // A small row of occipital plates continues the dragon anatomy at the back.
  for (let i = 0; i < 4; i++) {
    const y = 2.553 + i * 0.092;
    b.spike([-.03, y, -0.103], [0, 0.15, -1], 0.091 + i * 0.009, 0.035, {
      color: agedBone,
      bone: root,
      sides: 6,
      name: `Dragon occipital tooth ${i}`,
    });
  }

  // Gilded claws grasp the socket below the dragon's jaw.
  for (const s of [-1, 1]) {
    curvedBone(
      `Socket claw ${s}`,
      [
        [s * 0.06, 2.205, 0.004],
        [s * 0.162, 2.265, 0.018],
        [s * 0.207, 2.363, 0.007],
        [s * 0.175, 2.421, 0.023],
      ],
      [0.037, 0.031, 0.021, 0],
      gold,
    );

    curvedBone(
      `Socket ivory inset ${s}`,
      [
        [s * 0.081, 2.239, 0.035],
        [s * 0.147, 2.29, 0.046],
        [s * 0.163, 2.365, 0.035],
      ],
      [0.017, 0.019, 0],
      C.bone,
    );
  }

  diamond("Socket pendant frame", [0, 2.256, 0.095], 0.105, 0.142, C.ink);
  diamond("Socket pendant gold", [0, 2.256, 0.107], 0.079, 0.119, gold);
  glow(diamond("Socket pendant soulstone", [0, 2.256, 0.121], 0.044, 0.083, C.teal), 1.1);
  diamond("Soulstone highlight", [-0.008, 2.272, 0.133], 0.011, 0.031, C.mint);

  // The reverse is finished too: a dark socket medallion and a sculpted soul seal.
  ball("Rear socket medallion", [0, 2.735, -0.145], [0.129, 0.148, 0.033], darkMetal, 1);
  torus("Rear medallion gilt bezel", [0, 2.735, -0.174], 0.111, 0.009, gold, [0, 0, 0]);
  drawing(
    "Rear dragon seal",
    [0, 2.737, -0.182],
    [0.124, 0.15],
    foreheadTexture,
    [0, 180, 0],
  );

  // A pair of inlaid rear runic channels can be read from the three-quarter back.
  for (const s of [-1, 1]) {
    const points: P[] = [
      [s * 0.041, 2.451, -0.101],
      [s * 0.068, 2.557, -0.124],
      [s * 0.086, 2.631, -0.155],
    ];
    glow(
      b.sweep(points, 0.004, {
        color: C.teal,
        sides: 5,
        bone: root,
        name: `Rear socket soul channel ${s}`,
      }),
      0.8,
    );
  }

  return b.root;
}
