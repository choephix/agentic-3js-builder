import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  grain,
  paint,
  mix,
  noise,
  rng,
  svg,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { metal, coil } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aurelia's Alchemy Workbench",
  description:
    "An ornate, hand-painted fantasy alchemist's bench: luminous retorts, botanical remedies, an intricate brass balance, illuminated books and bundles of drying herbs.",
};

type P = [number, number, number];
type Fill = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "aureliasAlchemyWorkbench",
    paintSize: 2048,
    detail: 1,
  });
  const root = b.joint("workbench", { at: [0, 0, 0] });
  const random = rng(1947);

  const C = {
    wood: "#443342",
    edge: "#79515a",
    teal: "#205d64",
    tealLight: "#398184",
    navy: "#182f44",
    gold: "#e4bc72",
    paleGold: "#ffe3a1",
    parchment: "#eddfb5",
    ink: "#374852",
    cream: "#fff1cc",
    purple: "#66517b",
    plum: "#683f65",
    green: "#547962",
    sage: "#98b588",
    mint: "#bce5ba",
    stone: "#556879",
    stoneLight: "#748492",
    dark: "#243343",
    coral: "#d78383",
    rope: "#c7ac78",
  };

  const wood = grain("#382d3c", "#74505a", {
    size: 0.033,
    axis: "x",
    seed: 12,
  });
  const uprightWood = grain("#3b303e", "#80535a", {
    size: 0.024,
    axis: "y",
    seed: 12,
  });
  const blueWood = paint((p, n) => {
    const t = noise(p, 0.16, 18);
    return mix("#174852", "#347a79", t * 0.55 + Math.max(0, n.y) * 0.3);
  });
  const brass = metal("brass", {
    polish: 0.55,
    tarnish: 0.16,
    verdigris: 0.07,
    size: 0.09,
  });
  const copper = metal("copper", {
    tarnish: 0.18,
    verdigris: 0.13,
    size: 0.045,
  });
  const paper = paint((p, n) => {
    const lines = Math.sin(p.y * 1700) > 0.3 ? 0.13 : 0;
    return mix("#c4b38d", "#f4e7c4", 0.56 + n.y * 0.2 - lines);
  });
  const stone = paint((p, n) =>
    mix("#425569", "#83929a", noise(p, 0.19, 22) * 0.62 + Math.max(n.y, 0) * 0.2),
  );

  function add(a: P, d: P): P {
    return [a[0] + d[0], a[1] + d[1], a[2] + d[2]];
  }

  function box(
    at: P,
    size: P,
    color: Fill,
    name: string,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: root,
      rotation,
      name,
    });
  }

  function ball(at: P, scale: P, color: Fill, name: string) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at,
      scale,
      bone: root,
      name,
      flat: true,
    });
  }

  function cylinder(
    at: P,
    radius: number,
    height: number,
    color: Fill,
    name: string,
    dir: P = [0, 1, 0],
    segments = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { at, dir, bone: root, name },
    );
  }

  function rod(a: P, z: P, radius: number, color: Fill, name: string) {
    return b.rod(a, z, radius, {
      color,
      bone: root,
      sides: 6,
      name,
    });
  }

  function ring(
    at: P,
    radius: number,
    tube: number,
    color: Fill,
    name: string,
    vertical = false,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 32), color, {
      at,
      rotation: vertical ? [0, 0, 0] : [90, 0, 0],
      bone: root,
      name,
    });
  }

  function drawing(
    at: P,
    size: [number, number],
    texture: THREE.Texture,
    name: string,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      bone: root,
      texture,
      rotation,
      name,
    });
  }

  function star(
    at: P,
    radius: number,
    color: Fill,
    name: string,
    horizontal = false,
  ) {
    const outline: number[][] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? radius : radius * 0.24;
      outline.push([Math.sin(a) * r, Math.cos(a) * r]);
    }
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: horizontal ? [0, 0, -1] : [0, 1, 0],
      thickness: 0.005,
      color,
      bone: root,
      name,
    });
  }

  const labelMoon = svg(
    `<svg viewBox="0 0 120 150">
      <path d="M15 5H105L115 20V130L100 145H20L5 130V20Z" fill="#183d51" stroke="#e5c480" stroke-width="5"/>
      <path d="M22 14H98L106 25V123L94 136H26L14 123V25Z" fill="none" stroke="#a8d4cc" stroke-width="2"/>
      <path d="M77 34A29 29 0 1 0 82 84A24 24 0 0 1 77 34Z" fill="#f9de99"/>
      <path d="M84 31l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#b5f2df"/>
      <path d="M29 103H91M37 111H83" stroke="#e5c480" stroke-width="3"/>
      <text x="60" y="129" text-anchor="middle" font-family="serif" font-size="12" fill="#f5e5b7">LUNARIA</text>
    </svg>`,
    { size: 256 },
  );

  const labelSun = svg(
    `<svg viewBox="0 0 120 150">
      <path d="M60 4L109 26V123L60 146L11 123V26Z" fill="#f0dfb2" stroke="#6a4652" stroke-width="5"/>
      <path d="M60 15L99 32V117L60 134L21 117V32Z" fill="none" stroke="#b88b4e" stroke-width="2"/>
      <g fill="none" stroke="#b87546" stroke-width="4">
        <circle cx="60" cy="61" r="19"/>
        <path d="M60 27V36M60 86V95M26 61H35M85 61H94M36 37L42 43M78 79L84 85M36 85L42 79M78 43L84 37"/>
      </g>
      <path d="M38 108H82M44 116H76" stroke="#6a4652" stroke-width="3"/>
      <text x="60" y="129" text-anchor="middle" font-family="serif" font-size="12" fill="#6a4652">SOLIS</text>
    </svg>`,
    { size: 256 },
  );

  const labelLeaf = svg(
    `<svg viewBox="0 0 120 150">
      <rect x="8" y="5" width="104" height="140" rx="20" fill="#e9e0b4" stroke="#356766" stroke-width="5"/>
      <rect x="17" y="14" width="86" height="122" rx="14" fill="none" stroke="#b49c60" stroke-width="2"/>
      <path d="M60 94V40M60 67Q30 68 33 40Q59 40 60 67M61 82Q88 78 88 53Q63 55 61 82" fill="#6d9873" stroke="#356766" stroke-width="3"/>
      <path d="M35 106H85M43 114H77" stroke="#b49c60" stroke-width="3"/>
      <text x="60" y="130" text-anchor="middle" font-family="serif" font-size="12" fill="#356766">VERDANT</text>
    </svg>`,
    { size: 256 },
  );

  const bookCover = svg(
    `<svg viewBox="0 0 240 320">
      <rect width="240" height="320" fill="#244d5b"/>
      <rect x="13" y="13" width="214" height="294" rx="9" fill="none" stroke="#dfbd78" stroke-width="5"/>
      <rect x="23" y="23" width="194" height="274" rx="6" fill="none" stroke="#87aaa0" stroke-width="2"/>
      <g fill="none" stroke="#dfbd78" stroke-width="3">
        <path d="M24 63Q68 63 66 24M174 24Q172 66 216 64M24 256Q67 256 66 296M174 296Q172 254 216 256"/>
        <circle cx="120" cy="153" r="64"/>
        <circle cx="120" cy="153" r="53"/>
        <path d="M120 88L175 185H65ZM120 218L65 121H175Z"/>
        <path d="M120 111V195M78 153H162"/>
      </g>
      <path d="M120 126L126 147L147 153L126 159L120 180L114 159L93 153L114 147Z" fill="#f7e4a8"/>
      <text x="120" y="253" fill="#f2d797" font-size="16" letter-spacing="3" text-anchor="middle" font-family="serif">HERBARIUM</text>
      <text x="120" y="276" fill="#a4c7b3" font-size="10" letter-spacing="2" text-anchor="middle" font-family="serif">ARS • NATURAE</text>
    </svg>`,
    { size: 512 },
  );

  let script = "";
  for (let page = 0; page < 2; page++) {
    const x = page * 240;
    for (let row = 0; row < 8; row++) {
      const y = 222 + row * 9;
      for (let word = 0; word < 5; word++) {
        const xx = x + 27 + word * 36;
        const w = 18 + ((row * 13 + word * 7) % 14);
        script += `<path d="M${xx} ${y}q${w / 3} -4 ${w / 2} 0t${w / 2} -1" fill="none" stroke="#637465" stroke-width="2"/>`;
      }
    }
  }

  const openPages = svg(
    `<svg viewBox="0 0 480 330">
      <rect width="480" height="330" fill="#f2e4bb"/>
      <path d="M235 0H245V330H235Z" fill="#bdab83"/>
      <path d="M20 15H219V314H20ZM261 15H460V314H261Z" fill="none" stroke="#c8ad73" stroke-width="2"/>
      <text x="120" y="40" text-anchor="middle" font-size="16" letter-spacing="2" font-family="serif" fill="#425f62">LUNAR DISTILLATION</text>
      <text x="360" y="40" text-anchor="middle" font-size="16" letter-spacing="2" font-family="serif" fill="#425f62">BOTANICAL NOTES</text>
      <g fill="none" stroke="#637e78" stroke-width="2.5">
        <circle cx="120" cy="127" r="65"/><circle cx="120" cy="127" r="52"/>
        <path d="M120 61L177 160H63ZM120 192L63 94H177Z"/>
        <path d="M110 89V122L88 158Q88 174 120 174Q152 174 152 158L130 122V89ZM106 89H134"/>
        <path d="M95 149Q120 141 145 149"/>
      </g>
      <path d="M360 191Q345 142 364 74M358 154Q322 151 322 121Q353 120 358 154M358 128Q392 121 397 91Q368 94 358 128M362 104Q338 101 335 76Q358 76 362 104" fill="#8ea67e" stroke="#4a7765" stroke-width="2.5"/>
      <path d="M369 73Q345 65 356 52Q368 45 374 57Q390 46 393 60Q394 76 369 73Z" fill="#a88ba7"/>
      <path d="M30 210H210M270 210H450" stroke="#bd9a63" stroke-width="2"/>
      ${script}
      <text x="33" y="305" font-family="serif" font-size="10" fill="#9b7e53">XIV</text>
      <text x="434" y="305" font-family="serif" font-size="10" fill="#9b7e53">XV</text>
    </svg>`,
    { size: 768 },
  );

  let celestialTicks = "";
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI) / 24;
    const r = i % 4 === 0 ? 82 : 87;
    celestialTicks += `<path d="M${100 + Math.sin(a) * r} ${100 + Math.cos(a) * r}L${100 + Math.sin(a) * 93} ${100 + Math.cos(a) * 93}" stroke="#d8bf80" stroke-width="${i % 4 === 0 ? 2 : 1.3}"/>`;
  }
  const sigil = svg(
    `<svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="98" fill="#163b49"/>
      <g fill="none" stroke="#d8bf80" stroke-width="2">
        <circle cx="100" cy="100" r="94"/><circle cx="100" cy="100" r="78"/>
        <circle cx="100" cy="100" r="69"/>
        <path d="M100 28L162 136H38ZM100 172L38 64H162Z"/>
        <circle cx="100" cy="100" r="38"/>
      </g>
      ${celestialTicks}
      <path d="M113 69A32 32 0 1 0 119 128A28 28 0 0 1 113 69Z" fill="#a7eddb"/>
      <path d="M129 69l4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="#ffdf91"/>
      <g fill="#a7eddb"><circle cx="100" cy="22" r="3"/><circle cx="178" cy="100" r="3"/><circle cx="100" cy="178" r="3"/><circle cx="22" cy="100" r="3"/></g>
    </svg>`,
    { size: 512 },
  );

  const inlay = svg(
    `<svg viewBox="0 0 360 100">
      <g fill="none" stroke="#dabc7c" stroke-width="3">
        <path d="M12 50H118M242 50H348"/>
        <path d="M19 49Q44 12 77 36Q98 53 120 39M19 51Q44 88 77 64Q98 47 120 61"/>
        <path d="M341 49Q316 12 283 36Q262 53 240 39M341 51Q316 88 283 64Q262 47 240 61"/>
        <path d="M131 50L180 15L229 50L180 85Z"/>
      </g>
      <path d="M180 23L186 43L207 50L186 57L180 77L174 57L153 50L174 43Z" fill="#e8ca84"/>
      <path d="M52 36Q55 16 71 20Q73 34 52 36M52 64Q55 84 71 80Q73 66 52 64M308 36Q305 16 289 20Q287 34 308 36M308 64Q305 84 289 80Q287 66 308 64" fill="#91b3a0"/>
    </svg>`,
    { size: 512 },
  );

  const plaqueTexture = svg(
    `<svg viewBox="0 0 420 100">
      <path d="M20 5H400L415 25V75L400 95H20L5 75V25Z" fill="#183d49" stroke="#e4bc72" stroke-width="5"/>
      <path d="M25 14H395L405 30V70L395 86H25L15 70V30Z" fill="none" stroke="#8aa99a" stroke-width="2"/>
      <text x="210" y="49" font-family="serif" font-size="27" letter-spacing="5" text-anchor="middle" fill="#f5dd9f">AURELIA</text>
      <text x="210" y="74" font-family="serif" font-size="13" letter-spacing="4" text-anchor="middle" fill="#b0cdb5">BOTANICAL ALCHEMY</text>
    </svg>`,
    { size: 512 },
  );

  const scrollTexture = svg(
    `<svg viewBox="0 0 180 240">
      <rect width="180" height="240" fill="#e3d3a5"/>
      <path d="M10 9H170V231H10Z" fill="none" stroke="#ae905e" stroke-width="3"/>
      <g fill="none" stroke="#748a76" stroke-width="2">
        <circle cx="90" cy="88" r="57"/><circle cx="90" cy="88" r="45"/>
        <path d="M90 31L139 116H41ZM90 145L41 60H139Z"/>
        <path d="M90 51V125M53 88H127"/>
      </g>
      <path d="M90 65L96 82L113 88L96 94L90 111L84 94L67 88L84 82Z" fill="#a5795f"/>
      <path d="M28 168H151M28 180H143M28 192H151M28 204H118" stroke="#879079" stroke-width="3" stroke-dasharray="19 5 6 4"/>
      <text x="90" y="223" text-anchor="middle" font-family="serif" fill="#806d4a" font-size="10">THE SEVEN ESSENCES</text>
    </svg>`,
    { size: 384 },
  );

  // The low, chamfered paving island frames the furniture rather than becoming a room.
  b.part(new THREE.CylinderGeometry(1, 1.035, 0.075, 8), stone, {
    at: [0, 0.0375, 0],
    scale: [1.22, 1, 0.73],
    bone: root,
    name: "octagonalStoneDais",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.012, 8), C.dark, {
    at: [0, 0.08, 0],
    scale: [1.195, 1, 0.708],
    bone: root,
    name: "recessedPavingBed",
  });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const x = (col - 2) * 0.408;
      const z = (row - 1) * 0.355;
      box(
        [x, 0.091, z],
        [0.397, 0.019, 0.343],
        (row + col) % 3 === 0 ? C.stoneLight : stone,
        `paving_${row}_${col}`,
      );
    }
  }
  for (const x of [-0.86, 0.86]) {
    star([x, 0.104, 0.49], 0.041, C.gold, "pavingStar", true);
  }

  // Furniture: sturdy tapered legs, square brass shoes, mortised cross rails.
  for (const x of [-0.80, 0.80]) {
    for (const z of [-0.28, 0.28]) {
      const suffix = `${x > 0 ? "L" : "R"}${z > 0 ? "Front" : "Back"}`;
      box([x, 0.147, z], [0.145, 0.092, 0.145], brass, `shoe${suffix}`);
      b.frustumBox(
        [x, 0.19, z],
        [x, 0.83, z],
        [0.102, 0.102],
        [0.146, 0.146],
        { color: uprightWood, bone: root, name: `leg${suffix}` },
      );
      box([x, 0.70, z], [0.154, 0.065, 0.154], blueWood, `legCollar${suffix}`);
      box([x, 0.735, z], [0.161, 0.012, 0.161], brass, `collarRim${suffix}`);
      box([x, 0.205, z], [0.113, 0.026, 0.113], C.gold, `shoeLip${suffix}`);
      if (z > 0) {
        star([x, 0.54, z + 0.064], 0.043, brass, `legInlay${suffix}`);
        rod(
          [x, 0.31, z + 0.058],
          [x, 0.46, z + 0.058],
          0.004,
          C.gold,
          `legInlayStem${suffix}`,
        );
      }
    }
    box([x, 0.33, 0], [0.073, 0.09, 0.61], wood, "sideStretcher");
    box([x, 0.79, 0], [0.11, 0.23, 0.65], blueWood, "sideApron");
    box([x + (x > 0 ? 0.058 : -0.058), 0.79, 0], [0.012, 0.017, 0.49], brass, "sideApronInlay");
  }
  box([0, 0.33, -0.13], [1.61, 0.09, 0.075], wood, "longMortiseRail");
  box([0, 0.355, -0.13], [1.64, 0.012, 0.086], C.edge, "railHighlight");
  box([0, 0.8, -0.29], [1.61, 0.23, 0.10], wood, "rearApron");
  box([0, 0.8, 0.302], [1.62, 0.23, 0.092], wood, "drawerCarcass");

  const topOutline = [
    [-0.96, -0.34],
    [-0.88, -0.43],
    [0.88, -0.43],
    [0.96, -0.34],
    [0.96, 0.34],
    [0.88, 0.43],
    [-0.88, 0.43],
    [-0.96, 0.34],
  ];
  b.extrude(topOutline, {
    at: [0, 0.954, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.082,
    bevel: 0.012,
    color: wood,
    bone: root,
    name: "thickChamferedWorktop",
  });
  b.extrude(topOutline.map(([x, y]) => [x * 0.992, y * 0.985]), {
    at: [0, 0.979, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.012,
    color: C.edge,
    bone: root,
    name: "worktopEdgeHighlight",
  });

  for (const x of [-0.545, 0, 0.545]) {
    box([x, 0.805, 0.357], [0.514, 0.184, 0.033], blueWood, "tealDrawerFront");
    box([x, 0.904, 0.372], [0.516, 0.011, 0.015], brass, "drawerTopBead");
    box([x, 0.706, 0.372], [0.516, 0.011, 0.015], brass, "drawerBottomBead");
    for (const dx of [-0.25, 0.25]) {
      box([x + dx, 0.805, 0.374], [0.01, 0.178, 0.014], brass, "drawerVerticalBead");
    }
    drawing([x, 0.805, 0.376], [0.46, 0.13], inlay, "botanicalMarquetry");
    cylinder([x, 0.807, 0.388], 0.020, 0.014, brass, "drawerHandleRosette", [0, 0, 1], 10);
    ring([x, 0.782, 0.406], 0.028, 0.0045, brass, "hangingDrawerPull", true);
  }
  drawing([0, 0.646, 0.357], [0.34, 0.081], plaqueTexture, "makersEnamelPlaque");

  // Fine brass rails are deliberately interrupted at the worktop corners.
  for (const s of [-1, 1]) {
    rod([s * 0.9, 0.999, -0.27], [s * 0.9, 0.999, 0.27], 0.004, C.gold, "worktopSideInlay");
    star([s * 0.87, 1.0, 0.335], 0.028, C.gold, "worktopCornerStar", true);
    star([s * 0.87, 1.0, -0.335], 0.028, C.gold, "rearCornerStar", true);
  }
  rod([-0.81, 0.999, 0.375], [0.81, 0.999, 0.375], 0.003, C.gold, "frontWorktopInlay");

  // The light, open-backed hutch leaves the apparatus visible.
  for (const s of [-1, 1]) {
    const x = s * 0.845;
    box([x, 1.36, -0.325], [0.065, 0.76, 0.075], uprightWood, "hutchUpright");
    box([x, 1.28, -0.28], [0.013, 0.48, 0.009], brass, "uprightGiltStripe");
    box([x, 1.014, -0.325], [0.11, 0.034, 0.12], brass, "uprightSocket");
    box([x, 1.721, -0.325], [0.11, 0.055, 0.12], blueWood, "postCapital");
    box([x, 1.754, -0.325], [0.118, 0.012, 0.128], brass, "capitalAbacus");
    ball([x, 1.8, -0.325], [0.034, 0.044, 0.034], brass, "hutchFinial");
    star([x, 1.857, -0.325], 0.038, C.gold, "finialStar");
    b.slab(
      [
        [x - s * 0.015, 1.60, -0.30],
        [x - s * 0.17, 1.68, -0.30],
        [x - s * 0.015, 1.68, -0.30],
      ],
      { thickness: 0.025, color: blueWood, bone: root, name: "shelfBracket" },
    );
  }
  box([0, 1.68, -0.34], [1.79, 0.052, 0.25], wood, "apothecaryShelf");
  box([0, 1.713, -0.34], [1.81, 0.012, 0.26], C.edge, "shelfUpperLip");
  box([0, 1.66, -0.208], [1.76, 0.024, 0.015], brass, "shelfGildedFascia");
  box([0, 1.756, -0.451], [1.74, 0.075, 0.022], blueWood, "shelfBackstop");
  rod([-0.80, 1.786, -0.438], [0.8, 1.786, -0.438], 0.005, C.gold, "backstopGiltEdge");

  // A mounted celestial calculation wheel, not a free-floating effect.
  rod([-0.845, 1.43, -0.39], [-0.24, 1.43, -0.39], 0.014, brass, "leftWheelSupport");
  rod([0.28, 1.43, -0.39], [0.845, 1.43, -0.39], 0.014, brass, "rightWheelSupport");
  cylinder([0.02, 1.421, -0.404], 0.265, 0.026, blueWood, "celestialWheelBody", [0, 0, 1], 40);
  ring([0.02, 1.421, -0.385], 0.261, 0.012, brass, "celestialWheelRim", true);
  glow(
    drawing([0.02, 1.421, -0.381], [0.505, 0.505], sigil, "illuminatedCalculationWheel"),
    0.55,
  );
  for (const s of [-1, 1]) {
    cylinder([0.02 + s * 0.267, 1.421, -0.375], 0.024, 0.023, brass, "wheelPivot", [0, 0, 1], 8);
  }

  // Potion bottles: faceted stained glass, visibly different liquid levels,
  // little lip rings, cork stoppers, and labels projected onto their bellies.
  function potion(
    at: P,
    r: number,
    h: number,
    glassDark: string,
    liquid: string,
    label: THREE.Texture,
    name: string,
    stopper = true,
  ) {
    const glass = paint((p, n, s) => {
      const level = at[1] + h * 0.53;
      let c = p.y < level ? mix(glassDark, liquid, 0.78) : mix(glassDark, "#c4e5dc", 0.49);
      c = mix(c, "#fff5d2", Math.max(0, n.y) * 0.16);
      const a = ((s[1] % 360) + 360) % 360;
      if ((a > 206 && a < 220) || (a > 313 && a < 318)) {
        c = mix(c, "#efffeb", 0.55);
      }
      return c;
    });
    const vessel = b.lathe(
      [
        [0, 0],
        [r * 0.65, 0],
        [r * 0.91, h * 0.045],
        [r, h * 0.20],
        [r, h * 0.40],
        [r * 0.86, h * 0.56],
        [r * 0.46, h * 0.68],
        [r * 0.34, h * 0.73],
        [r * 0.34, h * 0.94],
        [r * 0.43, h * 0.96],
        [r * 0.43, h],
        [0, h],
      ],
      { at, segments: 12, color: glass, bone: root, name: `${name}Glass` },
    );
    ring(add(at, [0, h * 0.035, 0]), r * 0.8, 0.006, glassDark, `${name}Foot`);
    ring(add(at, [0, h * 0.965, 0]), r * 0.40, 0.005, C.paleGold, `${name}Lip`);
    cylinder(add(at, [0, h * 0.78, 0]), r * 0.356, h * 0.055, brass, `${name}NeckBand`);
    if (stopper) {
      cylinder(add(at, [0, h * 1.025, 0]), r * 0.32, h * 0.115, C.rope, `${name}Cork`, [0, 1, 0], 8);
      cylinder(add(at, [0, h * 1.083, 0]), r * 0.325, 0.008, C.edge, `${name}CorkTop`, [0, 1, 0], 8);
    }
    b.decal(vessel, label, {
      at: add(at, [0, h * 0.33, r]),
      dir: [0, 0, 1],
      size: [r * 1.12, h * 0.34],
      segments: 8,
      lift: 0.0017,
      name: `${name}EnamelLabel`,
    });
    const glint = b.surface(vessel).around(add(at, [0, h * 0.36, 0])).at(-42, 14);
    if (glint) {
      b.stick(
        new THREE.SphereGeometry(1, 6, 4),
        "#e2fae6",
        glint,
        { scale: [r * 0.075, 0.0017, h * 0.13], embed: 0.4, name: `${name}GlassGlint` },
      );
    }
    return vessel;
  }

  // Large central lunar retort and its copper cooling circuit.
  potion([0, 1.003, 0.055], 0.145, 0.425, "#28647b", "#72e5c3", labelMoon, "lunarRetort", false);
  ring([0, 1.038, 0.055], 0.124, 0.011, brass, "retortCradleFoot");
  ring([0, 1.167, 0.055], 0.149, 0.006, brass, "retortEquatorialBand");
  for (const a of [30, 150, 270]) {
    const angle = (a * Math.PI) / 180;
    const x = Math.sin(angle);
    const z = Math.cos(angle);
    b.sweep(
      catmull([
        [x * 0.075, 1.022, 0.055 + z * 0.075],
        [x * 0.132, 1.067, 0.055 + z * 0.132],
        [x * 0.148, 1.16, 0.055 + z * 0.148],
        [x * 0.126, 1.247, 0.055 + z * 0.126],
      ]),
      0.005,
      { color: brass, bone: root, sides: 6, name: "retortCageRib" },
    );
  }
  cylinder([0, 1.424, 0.055], 0.058, 0.026, brass, "retortMouthFerrule", [0, 1, 0], 12);
  b.sweep(
    catmull([
      [0, 1.429, 0.055],
      [0.035, 1.507, 0.055],
      [0.17, 1.528, 0.055],
      [0.32, 1.459, 0.055],
      [0.385, 1.385, 0.055],
    ]),
    [0.039, 0.032, 0.026, 0.021],
    { color: "#a3d5cd", bone: root, sides: 10, name: "swanNeckCondenser", caps: "flat" },
  );
  b.sweep(
    coil([0.385, 1.391, 0.055], [0.385, 1.216, 0.055], 0.034, 4),
    0.008,
    { color: copper, bone: root, sides: 6, name: "copperCoolingCoil" },
  );
  rod([0.385, 1.219, 0.055], [0.385, 1.177, 0.055], 0.012, copper, "condenserOutlet");
  potion([0.385, 1.003, 0.055], 0.062, 0.181, "#386a82", "#9bcff1", labelMoon, "receiver", false);
  cylinder([0.29, 1.018, -0.10], 0.066, 0.025, brass, "condenserStandFoot");
  rod([0.29, 1.03, -0.10], [0.29, 1.456, -0.10], 0.010, C.dark, "condenserSupportRod");
  rod([0.29, 1.389, -0.10], [0.385, 1.389, 0.055], 0.007, brass, "condenserClampArm");
  ball([0.292, 1.39, -0.102], [0.018, 0.018, 0.018], brass, "clampThumbscrew");
  glow(ball([0.385, 1.203, 0.055], [0.009, 0.014, 0.009], "#b8f9e7", "hangingDistillateDrop"), 1.4);

  // A small inset light tray provides a believable magical heat source.
  cylinder([0, 1.014, 0.055], 0.107, 0.019, C.navy, "retortHeatingPlate");
  glow(ring([0, 1.026, 0.055], 0.102, 0.006, "#8cf4ce", "heatingPlateLuminousRing"), 1.1);
  for (const s of [-1, 1]) {
    glow(star([s * 0.157, 1.005, 0.17], 0.018, "#a1efcd", "heatSigil", true), 0.8);
  }

  // Apothecary balance. The suspended pans have three separate chain routes each.
  const sx = -0.595;
  cylinder([sx, 1.022, 0.15], 0.112, 0.037, blueWood, "balancePlinth", [0, 1, 0], 12);
  ring([sx, 1.041, 0.15], 0.103, 0.006, brass, "balancePlinthGilt");
  b.lathe(
    [[0, 0], [0.049, 0], [0.043, 0.025], [0.023, 0.065], [0.014, 0.34], [0.024, 0.365], [0, 0.38]],
    { at: [sx, 1.043, 0.15], color: brass, bone: root, segments: 10, name: "balanceTurnedColumn" },
  );
  ball([sx, 1.435, 0.15], [0.035, 0.035, 0.026], brass, "balanceFulcrum");
  b.extrude(
    [[-0.245, 0], [-0.23, 0.025], [-0.08, 0.02], [0, 0.049], [0.08, 0.02], [0.23, 0.025], [0.245, 0], [0, -0.014]],
    { at: [sx, 1.446, 0.15], x: [1, 0, 0], thickness: 0.023, color: brass, bone: root, name: "sculptedBalanceBeam" },
  );
  star([sx, 1.497, 0.15], 0.036, C.paleGold, "balanceCrownStar");
  rod([sx, 1.45, 0.172], [sx, 1.373, 0.172], 0.004, C.navy, "balancePointer");
  for (const side of [-1, 1]) {
    const px = sx + side * 0.223;
    ring([px, 1.442, 0.15], 0.016, 0.0035, brass, "panSuspensionEye", true);
    for (let j = 0; j < 3; j++) {
      const a = (j * Math.PI * 2) / 3;
      const tx = px + Math.sin(a) * 0.076;
      const tz = 0.15 + Math.cos(a) * 0.076;
      rod([px, 1.431, 0.15], [tx, 1.237, tz], 0.0027, brass, "balancePanChain");
    }
    b.lathe(
      [[0, 0], [0.03, 0], [0.078, 0.024], [0.084, 0.036], [0.077, 0.04], [0.027, 0.014], [0, 0.014]],
      { at: [px, 1.197, 0.15], color: brass, bone: root, segments: 16, name: "shallowWeighingPan" },
    );
  }
  // A crystal sample and a modest nest of calibrated weights.
  b.part(new THREE.IcosahedronGeometry(0.035, 0), "#aecbdf", {
    at: [sx - 0.223, 1.247, 0.15],
    scale: [0.8, 1.25, 0.8],
    bone: root,
    name: "weighedMoonstone",
  });
  cylinder([sx + 0.223, 1.233, 0.15], 0.023, 0.037, brass, "panCounterweight", [0, 1, 0], 8);
  ball([sx + 0.223, 1.258, 0.15], [0.009, 0.009, 0.009], brass, "weightHandle");
  box([-0.79, 1.014, -0.055], [0.15, 0.027, 0.09], C.navy, "weightStorageTray");
  for (let i = 0; i < 3; i++) {
    const x = -0.835 + i * 0.045;
    cylinder([x, 1.046 - i * 0.004, -0.055], 0.018 - i * 0.003, 0.039 - i * 0.008, brass, "nestedCalibrationWeight", [0, 1, 0], 8);
    ball([x, 1.068 - i * 0.008, -0.055], [0.006, 0.006, 0.006], brass, "calibrationWeightKnob");
  }

  // Closed books are full little assemblies, including bindings and raised bands.
  function book(
    at: P,
    w: number,
    d: number,
    h: number,
    cover: Fill,
    name: string,
    decorated = false,
  ) {
    box(add(at, [0, 0.008, 0]), [w, 0.016, d], cover, `${name}LowerCover`);
    box(add(at, [0.006, h / 2, 0.003]), [w - 0.025, h - 0.025, d - 0.026], paper, `${name}PageBlock`);
    box(add(at, [0, h - 0.008, 0]), [w, 0.016, d], cover, `${name}UpperCover`);
    box(add(at, [-w / 2 + 0.009, h / 2, 0]), [0.025, h, d], cover, `${name}BoundSpine`);
    for (const z of [-d * 0.34, d * 0.34]) {
      box(add(at, [-w / 2 - 0.005, h / 2, z]), [0.009, h + 0.004, 0.014], brass, `${name}RaisedSpineBand`);
    }
    for (const x of [-w * 0.43, w * 0.43]) {
      box(add(at, [x, h + 0.001, d * 0.38]), [0.037, 0.004, 0.034], brass, `${name}CornerProtector`);
    }
    if (decorated) {
      drawing(add(at, [0.012, h + 0.002, 0]), [w * 0.87, d * 0.88], bookCover, `${name}CoverIllumination`, [-90, 0, 0]);
    }
  }

  book([-0.525, 1.001, -0.217], 0.36, 0.235, 0.067, C.plum, "violetCompendium");
  book([-0.502, 1.069, -0.219], 0.325, 0.22, 0.075, C.teal, "fieldHerbarium", true);
  box([-0.433, 1.135, -0.092], [0.018, 0.005, 0.13], C.coral, "bookRibbonBookmark");
  b.slab(
    [[-0.442, 1.137, -0.04], [-0.424, 1.137, -0.04], [-0.424, 1.082, -0.022], [-0.433, 1.092, -0.022], [-0.442, 1.082, -0.022]],
    { color: C.coral, thickness: 0.002, bone: root, name: "hangingBookmarkTail" },
  );

  book([0.645, 1.002, -0.237], 0.36, 0.205, 0.065, C.plum, "recipeLedger");
  book([0.663, 1.067, -0.238], 0.327, 0.19, 0.056, C.teal, "botanistNotebook", true);

  // Open illuminated grimoire, with its copper clasps folded outward.
  const openAt: P = [0.671, 1.002, 0.145];
  box(add(openAt, [0, 0.009, 0]), [0.449, 0.018, 0.327], C.teal, "openGrimoireCovers");
  box(add(openAt, [0, 0.031, 0]), [0.425, 0.031, 0.305], paper, "openGrimoirePages");
  drawing(add(openAt, [0, 0.048, 0]), [0.426, 0.306], openPages, "illuminatedTwoPageSpread", [-90, 0, 0]);
  rod(add(openAt, [0, 0.048, -0.153]), add(openAt, [0, 0.048, 0.153]), 0.003, "#b5a179", "grimoireCentralCrease");
  for (const s of [-1, 1]) {
    box(add(openAt, [s * 0.222, 0.023, 0.07]), [0.026, 0.011, 0.042], brass, "openBookClasp");
    star(add(openAt, [s * 0.193, 0.051, 0.13]), 0.017, C.gold, "grimoireCornerGilt", true);
  }
  box(add(openAt, [0.035, 0.051, 0.12]), [0.012, 0.002, 0.12], C.coral, "silkReadingMarker");
  b.slab(
    [
      add(openAt, [0.029, 0.05, 0.178]),
      add(openAt, [0.041, 0.05, 0.178]),
      add(openAt, [0.041, -0.028, 0.191]),
      add(openAt, [0.035, -0.019, 0.191]),
      add(openAt, [0.029, -0.028, 0.191]),
    ],
    { color: C.coral, thickness: 0.002, bone: root, name: "readingMarkerTail" },
  );

  // Shelf stock: warm, cool and leafy remedies with a shared label language.
  potion([-0.69, 1.72, -0.337], 0.059, 0.215, "#90504f", "#efa287", labelSun, "sunDew");
  potion([-0.523, 1.72, -0.337], 0.052, 0.185, "#3b7070", "#8ecfa3", labelLeaf, "wildMint");
  potion([-0.369, 1.72, -0.337], 0.054, 0.24, "#605281", "#c0a5e6", labelMoon, "violetTincture");
  potion([0.154, 1.72, -0.337], 0.052, 0.163, "#81513f", "#eebc69", labelSun, "amberResin");

  // A ceramic ingredient crock on the rear of the bench.
  const crock = b.lathe(
    [[0, 0], [0.065, 0], [0.076, 0.018], [0.079, 0.107], [0.067, 0.137], [0.074, 0.145], [0, 0.145]],
    { at: [-0.268, 1.002, -0.221], segments: 12, color: blueWood, bone: root, name: "ceramicSaltCrock" },
  );
  ring([-0.268, 1.145, -0.221], 0.073, 0.006, brass, "saltCrockRim");
  cylinder([-0.268, 1.153, -0.221], 0.078, 0.018, C.parchment, "saltCrockLid");
  ball([-0.268, 1.173, -0.221], [0.018, 0.018, 0.018], brass, "saltCrockKnob");
  b.decal(crock, labelLeaf, {
    at: [-0.268, 1.074, -0.143],
    dir: [0, 0, 1],
    size: [0.063, 0.075],
    segments: 6,
    name: "saltCrockLabel",
  });

  // A parchment reference sheet held behind the apparatus.
  drawing([0.60, 1.46, -0.346], [0.177, 0.237], scrollTexture, "pinnedAlchemyReference");
  cylinder([0.60, 1.581, -0.344], 0.012, 0.198, C.rope, "chartUpperRoll", [1, 0, 0], 8);
  cylinder([0.60, 1.339, -0.344], 0.013, 0.198, C.rope, "chartLowerRoll", [1, 0, 0], 8);
  ball([0.60, 1.583, -0.326], [0.011, 0.011, 0.008], brass, "chartPin");

  // Herb helper: a low-poly spear leaf with a brighter central vein.
  function leaf(
    origin: P,
    direction: P,
    width: number,
    length: number,
    color: Fill,
    name: string,
  ) {
    const dir = new THREE.Vector3(...direction).normalize();
    const reference = Math.abs(dir.z) > 0.85
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1);
    const across = new THREE.Vector3().crossVectors(dir, reference).normalize();
    const part = b.extrude(
      [[0, 0], [width * 0.48, length * 0.29], [width * 0.38, length * 0.64], [0, length], [-width * 0.38, length * 0.64], [-width * 0.48, length * 0.29]],
      {
        at: origin,
        x: across,
        y: dir,
        thickness: 0.0025,
        color,
        bone: root,
        name,
      },
    );
    return part;
  }

  // Potted fresh herb crowns the right end of the shelf.
  b.lathe(
    [[0, 0], [0.047, 0], [0.061, 0.085], [0.069, 0.088], [0.069, 0.105], [0.055, 0.105], [0.052, 0.088], [0, 0.088]],
    { at: [0.669, 1.72, -0.343], segments: 10, color: C.tealLight, bone: root, name: "freshHerbFlowerpot" },
  );
  ring([0.669, 1.814, -0.343], 0.066, 0.004, brass, "flowerpotGiltRim");
  cylinder([0.669, 1.810, -0.343], 0.051, 0.006, C.wood, "flowerpotSoil");
  star([0.669, 1.763, -0.282], 0.022, C.gold, "flowerpotStar");
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    const tip: P = [
      0.669 + Math.sin(a) * (0.036 + random() * 0.04),
      1.94 + random() * 0.085,
      -0.343 + Math.cos(a) * 0.05,
    ];
    const base: P = [0.669, 1.809, -0.343];
    rod(base, tip, 0.0027, C.green, "freshHerbStem");
    for (let j = 0; j < 3; j++) {
      const t = 0.37 + j * 0.20;
      const at: P = [
        base[0] + (tip[0] - base[0]) * t,
        base[1] + (tip[1] - base[1]) * t,
        base[2] + (tip[2] - base[2]) * t,
      ];
      leaf(
        at,
        [Math.sin(a + j), 0.40, Math.cos(a + j)],
        0.031,
        0.063,
        (i + j) % 2 ? C.sage : C.green,
        "freshSageLeaf",
      );
    }
  }

  // Three little drying bundles, each bound to a hook under the shelf.
  // They sit behind the work, not across its central silhouette.
  const bundleRoots: P[] = [
    [-0.721, 1.624, -0.25],
    [0.355, 1.624, -0.252],
    [0.779, 1.624, -0.252],
  ];
  for (let k = 0; k < bundleRoots.length; k++) {
    const a = bundleRoots[k];
    ring([a[0], a[1] + 0.019, a[2]], 0.019, 0.003, brass, `herbHook${k}`, true);
    rod(add(a, [0, 0.02, 0]), add(a, [0, -0.062, 0]), 0.006, C.rope, "bundleHangingCord");
    ring(add(a, [0, -0.047, 0]), 0.022, 0.005, C.rope, "bundleBinding");
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const end: P = [
        a[0] + Math.sin(angle) * 0.04,
        a[1] - 0.18 - random() * 0.055,
        a[2] + Math.cos(angle) * 0.028,
      ];
      const stemRoot = add(a, [Math.sin(angle) * 0.008, -0.035, 0]);
      rod(stemRoot, end, 0.002, k === 1 ? C.rope : C.green, "dryingHerbStem");
      for (let j = 0; j < 2; j++) {
        const t = 0.47 + j * 0.24;
        const at: P = [
          stemRoot[0] + (end[0] - stemRoot[0]) * t,
          stemRoot[1] + (end[1] - stemRoot[1]) * t,
          stemRoot[2] + (end[2] - stemRoot[2]) * t,
        ];
        leaf(
          at,
          [Math.sin(angle + j * 1.8), -0.8, Math.cos(angle + j * 1.8)],
          k === 1 ? 0.018 : 0.029,
          k === 1 ? 0.055 : 0.066,
          k === 1 ? "#c1b47f" : k === 2 ? C.sage : C.green,
          "dryingHerbLeaf",
        );
      }
      if (k === 2) {
        for (let j = 0; j < 3; j++) {
          ball(
            add(end, [Math.sin(j * 2.1) * 0.006, j * 0.014, Math.cos(j * 2.1) * 0.006]),
            [0.009, 0.014, 0.009],
            j % 2 ? "#aa91bf" : "#7e6e9e",
            "driedLavenderFlower",
          );
        }
      }
    }
    b.sweep(
      bezier(add(a, [0, -0.046, 0.022]), add(a, [0.048, -0.05, 0.028]), add(a, [0.039, -0.09, 0.022])),
      0.003,
      { color: C.rope, bone: root, sides: 5, name: "herbTwineLooseEnd" },
    );
  }

  // Mortar, pestle, a spoon and loose cuttings make it a working bench.
  b.lathe(
    [[0, 0], [0.041, 0], [0.052, 0.015], [0.069, 0.075], [0.072, 0.083], [0.06, 0.085], [0.043, 0.033], [0, 0.027]],
    { at: [-0.242, 1.002, 0.244], segments: 12, color: stone, bone: root, name: "stoneMortar" },
  );
  ring([-0.242, 1.086, 0.244], 0.067, 0.004, C.gold, "mortarRimInlay");
  b.capsule(
    [-0.254, 1.034, 0.244],
    [-0.194, 1.145, 0.232],
    [0.018, 0.012],
    { color: stone, bone: root, sides: 8, name: "stonePestle" },
  );
  leaf([-0.268, 1.036, 0.247], [1, 0.5, 0.2], 0.024, 0.049, C.green, "crushedMortarLeaf");
  rod([0.11, 1.011, 0.292], [0.266, 1.011, 0.286], 0.005, brass, "measuringSpoonHandle");
  ball([0.284, 1.012, 0.284], [0.026, 0.005, 0.017], brass, "measuringSpoonBowl");
  for (let i = 0; i < 3; i++) {
    leaf(
      [-0.401 + i * 0.027, 1.003, 0.309 + (i % 2) * 0.018],
      [0.5 - i * 0.4, 0.07, -1],
      0.021,
      0.062,
      i % 2 ? C.sage : C.green,
      "looseBotanicalCutting",
    );
  }

  // A short candle on the rear book stack, with a contained, self-lit flame.
  cylinder([0.697, 1.135, -0.246], 0.043, 0.014, brass, "candleSaucer");
  ring([0.697, 1.143, -0.246], 0.042, 0.005, brass, "candleSaucerRim");
  cylinder([0.697, 1.195, -0.246], 0.026, 0.106, "#e7d9ac", "beeswaxCandle", [0, 1, 0], 10);
  ball([0.712, 1.202, -0.234], [0.007, 0.031, 0.006], "#eadcb4", "waxDrip");
  rod([0.697, 1.248, -0.246], [0.697, 1.263, -0.246], 0.002, C.wood, "candleWick");
  glow(
    b.part(new THREE.SphereGeometry(1, 7, 5), "#ffc879", {
      at: [0.697, 1.278, -0.246],
      scale: [0.012, 0.027, 0.012],
      bone: root,
      name: "candleFlame",
    }),
    1.4,
  );
  glow(
    ball([0.697, 1.266, -0.238], [0.006, 0.013, 0.005], "#fff1b7", "candleFlameHeart"),
    1.8,
  );

  // The shelf's final small ceramic jar is tucked beside the pot.
  b.lathe(
    [[0, 0], [0.043, 0], [0.05, 0.023], [0.05, 0.098], [0.036, 0.119], [0.036, 0.132], [0, 0.132]],
    { at: [0.359, 1.72, -0.344], segments: 10, color: "#d7d5b2", bone: root, name: "powderedPearlJar" },
  );
  cylinder([0.359, 1.858, -0.344], 0.045, 0.021, blueWood, "pearlJarLid");
  ring([0.359, 1.852, -0.344], 0.044, 0.004, brass, "pearlJarLidBand");
  star([0.359, 1.79, -0.293], 0.025, C.gold, "pearlJarEmblem");

  // A few fallen leaves on the paving keep the setting intimate and handmade.
  for (let i = 0; i < 5; i++) {
    const x = i < 3 ? 0.87 + random() * 0.12 : -0.9 + random() * 0.12;
    const z = 0.14 + random() * 0.34;
    leaf(
      [x, 0.105, z],
      [random() - 0.5, 0.025, random() - 0.5],
      0.022,
      0.06,
      i % 2 ? C.sage : "#a29769",
      "fallenHerbLeaf",
    );
  }

  return b.root;
}
