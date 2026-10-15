import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  noise,
  mix,
  grain,
  mottle,
  svg,
  catmull,
  bezier,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sanctuary Above the Clouds",
  description:
    "An anime-fantasy sky island: ivory ruins, a wind-shaped jade tree, luminous ancient inscriptions, and a waterfall dissolving into clouds beneath a suspended mountain.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Sanctuary Above the Clouds",
    paintSize: 2048,
  });
  const random = rng(31827);
  const root = b.joint("island", { at: [0, 0, 0] });

  type V = [number, number, number];
  type Fill = string | ReturnType<typeof paint>;

  const C = {
    rock: "#526574",
    rockDark: "#344959",
    rockLight: "#81959c",
    grass: "#669d66",
    grassLight: "#a2cd78",
    jade: "#418d7f",
    jadeDark: "#255c63",
    leaf: "#70baa0",
    mint: "#abe1ad",
    cream: "#eee5cc",
    ivory: "#fff3d6",
    stoneShade: "#a8b4a8",
    stoneDark: "#6e8582",
    gold: "#d9b970",
    goldLight: "#ffe5a0",
    blue: "#368caa",
    aqua: "#63d6dd",
    foam: "#caffec",
    rune: "#a3ffe6",
    bark: "#655d50",
    barkLight: "#948369",
    cloud: "#d2e7e5",
    cloudShade: "#aac9d3",
  };

  const rockPaint = paint((p, n) => {
    const strata = Math.sin(p.y * 3.1 + p.x * 0.46 + p.z * 0.28);
    const top = Math.max(0, n.y);
    const base = mix(C.rockDark, C.rockLight, 0.28 + top * 0.4 + noise(p, 1.5, 7) * 0.24);
    return mix(base, "#667e82", strata > 0.84 ? 0.3 : 0);
  });
  const stonePaint = paint((p, n) => {
    const age = noise(p, 0.6, 41);
    const stone = mix(C.stoneShade, C.cream, 0.5 + n.y * 0.22 + age * 0.2);
    return mix(stone, "#779e83", n.y > 0.45 && age > 0.64 ? 0.38 : 0);
  });
  const grassPaint = mottle("#508a62", "#a0c678", { size: 1.5, seed: 11 });
  const barkPaint = grain("#514f47", "#9b896b", { size: 0.16, seed: 7 });
  const leafPaint = paint((p, n) =>
    mix("#367b75", "#a7d69a", 0.25 + Math.max(0, n.y) * 0.35 + noise(p, 0.9, 4) * 0.3),
  );
  const waterPaint = paint((_p, _n, s) => {
    const band = Math.sin(s[1] * 53 + s[0] * 12);
    return band > 0.76 ? "#a5f1e5" : band < -0.5 ? "#388fa8" : "#63c9d0";
  });

  function box(
    at: V,
    size: V,
    color: Fill,
    rotation: V = [0, 0, 0],
    name = "block",
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function ico(
    at: V,
    scale: V,
    color: Fill,
    detail = 0,
    rotation: V = [0, 0, 0],
    name = "faceted stone",
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at,
      scale,
      rotation,
      flat: true,
      bone: root,
      name,
    });
  }

  function rod(a: V, end: V, radius: number, color: Fill, name = "trim") {
    return b.rod(a, end, radius, {
      color,
      bone: root,
      sides: 6,
      smooth: false,
      name,
    });
  }

  function plane(
    at: V,
    size: [number, number],
    texture: THREE.Texture,
    dir: V = [0, 0, 1],
    up: V = [0, 1, 0],
    name = "inscription",
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      bone: root,
      texture,
      dir,
      axis: "z",
      up,
      name,
    });
  }

  function torus(
    at: V,
    radius: number,
    thickness: number,
    color: Fill,
    rotation: V = [0, 0, 0],
    arc = Math.PI * 2,
    name = "stone ring",
  ) {
    return b.part(new THREE.TorusGeometry(radius, thickness, 4, 32, arc), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  // Six reusable drawings: weathered masonry, calligraphic runes,
  // a celestial emblem, water filaments, leaves, and the floor mosaic.
  const carving = svg(
    `<svg viewBox="0 0 120 360">
      <rect width="120" height="360" fill="#aeb9aa"/>
      <path d="M8 0V360M112 0V360" stroke="#e9e3c9" stroke-width="8"/>
      <path d="M20 16H100V344H20Z" fill="none" stroke="#687f79" stroke-width="4"/>
      <path d="M60 28L87 61L60 94L33 61Z M60 112L82 139L60 166L38 139Z
       M60 194L82 221L60 248L38 221Z M60 266L87 299L60 332L33 299Z"
       fill="none" stroke="#f5e9cb" stroke-width="6"/>
      <path d="M60 40V82M60 124V154M60 206V236M60 278V320"
       stroke="#65867f" stroke-width="4"/>
      <path d="M21 178H99M28 184H92" stroke="#718d83" stroke-width="4"/>
      <path d="M11 95L29 106L20 119M109 252L91 263L98 275"
       fill="none" stroke="#6f827a" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  const runes = svg(
    `<svg viewBox="0 0 480 80">
      <path d="M6 40H40M440 40H474" stroke="#c7b77a" stroke-width="3"/>
      <g fill="none" stroke="#b9ffe4" stroke-width="5" stroke-linejoin="miter">
      <path d="M57 57V23L72 12L87 23V57M57 39H87"/>
      <path d="M111 19L129 39L111 59M129 39H146V19M146 39V59"/>
      <path d="M174 16V64M161 29L174 16L187 29M161 51L174 64L187 51"/>
      <path d="M218 15L200 40L218 65L236 40ZM218 27V53"/>
      <path d="M262 17V62M262 29L283 17V44L262 55"/>
      <path d="M306 20H337L322 39L337 60H306M306 39H322"/>
      <path d="M363 15L347 40L363 65M363 40H382M382 17V63"/>
      <path d="M409 17L427 40L409 63L391 40Z"/>
      </g>
      <path d="M48 73H432" stroke="#6b9f91" stroke-width="3"/>
    </svg>`,
    { size: 768 },
  );

  const sigil = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="118" fill="#294f58" stroke="#ddbd77" stroke-width="7"/>
      <circle cx="128" cy="128" r="103" fill="none" stroke="#769f92" stroke-width="3"/>
      <circle cx="128" cy="128" r="86" fill="none" stroke="#dfc88f" stroke-width="3"
       stroke-dasharray="3 12"/>
      <path d="M128 22L144 100L205 65L164 122L234 128L164 139L205 191
       L144 156L128 234L112 156L51 191L92 139L22 128L92 122L51 65L112 100Z"
       fill="#e8ce8c" stroke="#1b4852" stroke-width="5"/>
      <path d="M128 72L158 128L128 184L98 128Z" fill="#8befd5" stroke="#f0e7b7" stroke-width="4"/>
      <path d="M128 92L144 128L128 164L112 128Z" fill="#345c62"/>
      <circle cx="128" cy="128" r="8" fill="#d7fff1"/>
    </svg>`,
    { size: 512 },
  );

  const waterfallTexture = svg(
    `<svg viewBox="0 0 160 640">
      <path d="M0 0H160V640H0Z" fill="#57bdd0"/>
      <path d="M2 0H19L23 120L15 232L22 374L12 520L22 640H0Z" fill="#b2f3ec"/>
      <path d="M142 0H160V640H145L151 490L140 376L148 232Z" fill="#91e7e6"/>
      <g fill="none" stroke-linecap="round">
      <path d="M34 0L38 87L31 167L39 290M37 346L30 441L39 566L35 640"
       stroke="#e1fff3" stroke-width="5"/>
      <path d="M65 0L59 133L68 264L63 388L70 511L62 640"
       stroke="#8ce4e4" stroke-width="9"/>
      <path d="M84 0L89 104M88 160L81 283L89 405M84 474L89 640"
       stroke="#d7fff1" stroke-width="4"/>
      <path d="M118 0L111 165L120 341L112 476L122 640"
       stroke="#318fae" stroke-width="13"/>
      <path d="M130 63L125 220M132 319L126 488M130 550L134 640"
       stroke="#c7fff0" stroke-width="4"/>
      <path d="M49 40L46 148M48 246L51 331M46 483L50 580"
       stroke="#329ab3" stroke-width="4"/>
      </g>
    </svg>`,
    { size: 1024 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M40 158C34 118 2 105 5 65C8 34 30 16 51 3
      C78 40 84 69 65 102C52 121 44 137 40 158Z"
       fill="#a8d899" stroke="#4c9c83" stroke-width="4"/>
      <path d="M40 151Q33 84 51 15M40 113L17 82M40 91L64 62M43 66L27 43"
       fill="none" stroke="#e0e9ad" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const mosaic = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="124" fill="#b5ba9d" stroke="#727f74" stroke-width="6"/>
      <circle cx="128" cy="128" r="108" fill="#d9d7b9" stroke="#ece3bf" stroke-width="7"/>
      <circle cx="128" cy="128" r="88" fill="#7faaa1" stroke="#566f6a" stroke-width="5"/>
      <path d="M128 23L151 105L233 128L151 151L128 233L105 151L23 128L105 105Z"
       fill="#e8d59b" stroke="#788d7e" stroke-width="5"/>
      <path d="M128 77L159 128L128 179L97 128Z" fill="#d7e7c3" stroke="#577e77" stroke-width="4"/>
      <path d="M17 84L74 91L94 66M187 175L176 211L199 230M44 199L77 185"
       fill="none" stroke="#747d70" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  // The island is a broad, almost-flat garden on a deeply undercut,
  // asymmetric, inverted mountain. All rock facets are deliberately large.
  const N = 15;
  const outline: V[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 0.91 + random() * 0.12;
    outline.push([Math.sin(a) * 5.15 * r, 7.82 + random() * 0.11, Math.cos(a) * 4.05 * r]);
  }

  function mountainLayer(
    upper: V[],
    factor: number,
    y: number,
    offsetX: number,
    offsetZ: number,
    color: Fill,
    name: string,
  ): V[] {
    const lower: V[] = upper.map((p) => [
      p[0] * factor + offsetX,
      y + (random() - 0.5) * 0.55,
      p[2] * factor + offsetZ,
    ]);
    const vertices: number[] = [];
    for (let i = 0; i < upper.length; i++) {
      const j = (i + 1) % upper.length;
      vertices.push(...upper[i], ...lower[i], ...upper[j]);
      vertices.push(...upper[j], ...lower[i], ...lower[j]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    b.part(g, color, { at: [0, 0, 0], bone: root, name, flat: true });
    return lower;
  }

  const rimBottom = mountainLayer(outline, 0.98, 7.36, 0, 0, grassPaint, "deep turf edge");
  const shoulder = mountainLayer(rimBottom, 0.93, 6.3, 0.08, 0, rockPaint, "upper cliff faces");
  const midRock = mountainLayer(shoulder, 0.70, 4.5, 0.18, -0.22, rockPaint, "hanging mountain");
  const lowerRock = mountainLayer(midRock, 0.40, 3.05, 0.3, -0.15, rockPaint, "inverted crags");
  mountainLayer(lowerRock, 0.04, 2.08, 0.25, 0, C.rockDark, "mountain terminal");

  b.slab(
    outline.map((p) => [p[0], 7.93, p[2]]),
    { thickness: 0.2, color: grassPaint, bone: root, name: "garden crown" },
  );

  // Long triangular cliff plates break up the simple mountain silhouette.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    const h = 1.2 + random() * 1.8;
    const y = 6.1 + random() * 0.25;
    ico(
      [x * 3.5, y - h * 0.45, z * 2.65],
      [0.6 + random() * 0.4, h, 0.65 + random() * 0.5],
      i % 3 === 0 ? C.rockDark : rockPaint,
      0,
      [random() * 18, a * 180 / Math.PI, random() * 12],
      "blade of suspended rock",
    );
  }

  // Exposed pale seams and little teal crystal inclusions.
  for (const [x, y, z, s] of [
    [-2.8, 5.7, 2.05, 0.48],
    [2.3, 5.15, 1.7, 0.42],
    [3.3, 6.6, -0.3, 0.32],
    [-1.8, 4.3, 1.5, 0.26],
    [0.6, 3.4, 0.85, 0.22],
  ]) {
    ico([x, y, z], [s, s * 1.6, s * 0.55], "#447f83", 0, [0, 15, -18], "crystal matrix");
    glow(ico([x, y + s * 0.12, z + s * 0.35], [s * 0.45, s, s * 0.3], "#72cfc8"), 0.35);
  }

  // Stream: a winding inlaid ribbon, widening at the brink.
  const streamPoints: V[] = [
    [1.12, 8.04, -2.9],
    [0.85, 8.055, -1.8],
    [0.70, 8.045, -0.65],
    [0.22, 8.04, 0.55],
    [-0.42, 8.025, 1.9],
    [-0.75, 8.00, 3.1],
    [-0.72, 7.94, 3.88],
  ];
  const widths = [0.42, 0.5, 0.6, 0.54, 0.59, 0.68, 0.75];
  const bankL: V[] = streamPoints.map((p, i) => [p[0] - widths[i], p[1], p[2]]);
  const bankR: V[] = streamPoints.map((p, i) => [p[0] + widths[i], p[1], p[2]]);
  b.membrane(bankL, bankR, {
    color: waterPaint,
    thickness: 0.06,
    rows: 5,
    cols: 18,
    bone: root,
    name: "jade spring",
  });

  for (let side = 0; side < 2; side++) {
    const bank = side === 0 ? bankL : bankR;
    for (let i = 0; i < bank.length - 1; i++) {
      const p = bank[i];
      ico(
        [p[0] + (side === 0 ? -0.12 : 0.12), 8.02, p[2]],
        [0.28 + random() * 0.16, 0.17, 0.38],
        i % 2 ? stonePaint : C.stoneDark,
        0,
        [0, random() * 80, 0],
        "stream bank pebble",
      );
    }
  }

  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    const z = -2.45 + t * 5.5;
    const x = 1.03 - 1.7 * t;
    b.sweep(
      bezier([x - 0.23, 8.09, z], [x, 8.10, z + 0.1], [x + 0.2, 8.09, z]),
      0.018,
      { color: "#b7f0dc", bone: root, sides: 4, name: "stream ripple" },
    );
  }

  // A sheet with explicit UVs carries the long falling-water drawing.
  // Its lower edge separates into three ribbons instead of ending as a box.
  function fallingRibbon(
    centerX: number,
    width: number,
    top: number,
    bottom: number,
    front: number,
    phase: number,
    name: string,
  ) {
    const levels = 11;
    const positions: number[] = [];
    const uv: number[] = [];
    const indices: number[] = [];
    for (let j = 0; j <= levels; j++) {
      const t = j / levels;
      const y = top + (bottom - top) * t;
      const z = front + Math.sin(t * 2.4) * 0.35 + t * t * 0.30;
      const x = centerX + Math.sin(t * 5 + phase) * 0.09 * t;
      const w = width * (1 - t * 0.12 + Math.sin(t * 8) * 0.025);
      positions.push(x - w / 2, y, z, x + w / 2, y, z);
      uv.push(0, 1 - t, 1, 1 - t);
      if (j < levels) {
        const k = j * 2;
        indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    glow(
      b.part(g, "#ffffff", {
        at: [0, 0, 0],
        bone: root,
        texture: waterfallTexture,
        name,
      }),
      0.32,
    );
    // A blue rear face keeps the sheet readable from behind.
    const back = g.clone();
    const reversed = indices.slice();
    for (let i = 0; i < reversed.length; i += 3) {
      [reversed[i], reversed[i + 2]] = [reversed[i + 2], reversed[i]];
    }
    back.setIndex(reversed);
    back.computeVertexNormals();
    b.part(back, C.blue, { at: [0, 0, -0.025], bone: root, name: `${name} reverse` });
  }

  fallingRibbon(-0.72, 1.46, 7.99, 3.3, 3.84, 0, "great waterfall");
  fallingRibbon(-1.18, 0.39, 3.39, 1.65, 4.43, 0.2, "falling water left ribbon");
  fallingRibbon(-0.64, 0.54, 3.39, 1.23, 4.43, 1.0, "falling water central ribbon");
  fallingRibbon(-0.12, 0.28, 3.39, 1.98, 4.43, 2.0, "falling water right ribbon");

  b.sweep(
    catmull([
      [-1.45, 7.99, 3.58],
      [-1.35, 8.04, 3.88],
      [-0.72, 8.02, 3.99],
      [-0.03, 8.01, 3.88],
    ]),
    0.065,
    { color: C.foam, bone: root, sides: 6, name: "foaming waterfall lip" },
  );

  for (let i = 0; i < 15; i++) {
    const x = -1.6 + random() * 2;
    const y = 0.9 + random() * 1.65;
    const z = 4.35 + random() * 0.9;
    glow(
      ico([x, y, z], [0.025, 0.08 + random() * 0.12, 0.025], C.foam, 0, [0, 0, 8]),
      0.25,
    );
  }

  // The waterfall disappears into small, crisp cloud banks.
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    ico(
      [-0.65 + Math.cos(a) * (0.55 + random() * 0.4), 1.0 + random() * 0.42, 4.65 + Math.sin(a) * 0.35],
      [0.52 + random() * 0.32, 0.22 + random() * 0.18, 0.4 + random() * 0.3],
      i % 3 ? C.cloud : C.cloudShade,
      1,
      [0, random() * 90, 0],
      "waterfall cloud",
    );
  }

  // Raised sanctuary terrace, broken approach, and a small celestial mosaic.
  box([-2.1, 8.08, -1.33], [3.75, 0.28, 2.35], C.stoneDark, [0, 0, 0], "sanctuary foundation");
  box([-2.1, 8.25, -1.35], [3.55, 0.18, 2.16], stonePaint, [0, 0, 0], "terrace paving");

  for (let i = 0; i < 3; i++) {
    box(
      [-2.1, 8.015 + i * 0.095, 0.24 - i * 0.31],
      [2.1 - i * 0.1, 0.15, 0.42],
      stonePaint,
      [0, 0, 0],
      "worn approach step",
    );
  }

  for (let i = 0; i < 7; i++) {
    const z = 0.8 + i * 0.35;
    const x = -2.15 + Math.sin(i * 0.8) * 0.16;
    box(
      [x, 8.015, z],
      [0.77 + random() * 0.25, 0.10, 0.27],
      stonePaint,
      [0, (random() - 0.5) * 19, 0],
      "disconnected pilgrim paving",
    );
  }

  b.part(new THREE.CylinderGeometry(0.85, 0.87, 0.07, 16), stonePaint, {
    at: [-2.05, 8.39, -0.85],
    bone: root,
    name: "mosaic stone",
  });
  plane([-2.05, 8.429, -0.85], [1.63, 1.63], mosaic, [0, 1, 0], [0, 0, -1], "compass mosaic");

  // Two square, carved columns carry a true segmented arch with open sky inside.
  const archX = -2.08;
  const archZ = -1.58;
  const baseY = 8.36;
  const springY = 11.05;
  const radius = 1.41;
  const columnXs = [archX - radius, archX + radius];

  function column(x: number, z: number, y: number, height: number, broken = false) {
    box([x, y + 0.11, z], [0.94, 0.22, 0.94], stonePaint, [0, 0, 0], "column foot");
    box([x, y + 0.27, z], [0.73, 0.13, 0.73], C.cream, [0, 0, 0], "base bevel");
    const shaftBase = y + 0.34;
    const shaftHeight = height - 0.69;
    box([x, shaftBase + shaftHeight / 2, z], [0.56, shaftHeight, 0.58], stonePaint, [0, 0, 0], "square pillar shaft");
    for (const s of [-1, 1]) {
      box([x + s * 0.245, shaftBase + shaftHeight / 2, z + 0.315], [0.065, shaftHeight, 0.06], C.cream);
      box([x + s * 0.245, shaftBase + shaftHeight / 2, z - 0.315], [0.065, shaftHeight, 0.06], C.stoneShade);
    }
    if (shaftHeight > 0.9) {
      plane(
        [x, shaftBase + shaftHeight / 2, z + 0.299],
        [0.36, shaftHeight * 0.88],
        carving,
        [0, 0, 1],
        [0, 1, 0],
        "weathered pillar relief",
      );
    }
    box([x, y + height - 0.27, z], [0.69, 0.13, 0.72], C.cream, [0, 0, 0], "capital neck");
    box([x, y + height - 0.12, z], [0.88, 0.20, 0.85], stonePaint, [0, broken ? 8 : 0, 0], "capital");
    if (!broken) {
      for (const s of [-1, 1]) {
        box([x + s * 0.33, y + height - 0.23, z + 0.34], [0.18, 0.18, 0.14], C.gold, [0, 0, 45], "capital corner diamond");
      }
    }
  }

  column(columnXs[0], archZ, baseY, springY - baseY);
  column(columnXs[1], archZ, baseY, springY - baseY);

  const segments = 11;
  const outerRadius = 1.91;
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI + 0.012;
    const a1 = ((i + 1) / segments) * Math.PI - 0.012;
    const shape = [
      [Math.cos(a0) * radius, Math.sin(a0) * radius],
      [Math.cos(a0) * outerRadius, Math.sin(a0) * outerRadius],
      [Math.cos(a1) * outerRadius, Math.sin(a1) * outerRadius],
      [Math.cos(a1) * radius, Math.sin(a1) * radius],
    ];
    b.extrude(shape, {
      at: [archX, springY, archZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.67,
      bevel: 0.025,
      detail: 0.5,
      bone: root,
      color: i % 3 === 0 ? C.cream : stonePaint,
      name: "individual arch voussoir",
    });
  }

  const trimPath: V[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI * i / 24;
    trimPath.push([
      archX + Math.cos(a) * 1.52,
      springY + Math.sin(a) * 1.52,
      archZ + 0.353,
    ]);
  }
  b.sweep(trimPath, 0.034, { color: C.gold, bone: root, sides: 4, name: "gold inset arch line" });

  // Solid keystone and a luminous wind-star seal, safely above the opening.
  box([archX, 12.83, archZ], [0.55, 0.64, 0.83], C.cream, [0, 0, 0], "crown keystone");
  box([archX, 12.89, archZ + 0.43], [0.56, 0.56, 0.08], C.gold, [0, 0, 45], "seal diamond frame");
  glow(
    plane([archX, 12.89, archZ + 0.478], [0.54, 0.54], sigil, [0, 0, 1], [0, 1, 0], "wind-star seal"),
    0.55,
  );
  box([archX, 13.28, archZ], [0.82, 0.16, 0.90], stonePaint, [0, 0, 0], "broken crown cornice");

  // The surviving left wall is low enough to keep the arch's void readable.
  for (let row = 0; row < 3; row++) {
    for (let k = 0; k < 3 - (row === 2 ? 1 : 0); k++) {
      box(
        [-3.75 + k * 0.54, 8.54 + row * 0.38, -2.40],
        [0.52, 0.35, 0.47],
        stonePaint,
        [0, 0, 0],
        "rear wall masonry",
      );
    }
  }

  box([-2.12, 8.71, -2.18], [1.32, 0.62, 0.64], C.stoneDark, [0, 0, 0], "ancient altar");
  box([-2.12, 9.05, -2.18], [1.57, 0.15, 0.82], C.cream, [0, 0, 0], "altar table");
  glow(
    plane([-2.12, 8.76, -1.852], [1.1, 0.21], runes, [0, 0, 1], [0, 1, 0], "altar inscription"),
    0.6,
  );
  torus([-2.12, 9.15, -2.18], 0.34, 0.035, C.gold, [90, 0, 0], Math.PI * 2, "altar offering ring");

  // A remnant pillar and a toppled lintel on the garden's opposite shoulder.
  column(2.77, 1.66, 8.0, 1.95, true);
  ico([2.77, 9.96, 1.66], [0.43, 0.17, 0.40], stonePaint, 0, [8, 20, 0], "fractured column crown");
  box([1.75, 8.25, 2.35], [1.43, 0.42, 0.58], stonePaint, [0, -24, 7], "fallen lintel");
  for (let i = 0; i < 5; i++) {
    ico(
      [2.45 + random() * 1.15, 8.10, 2.25 + random() * 0.7],
      [0.13 + random() * 0.16, 0.15, 0.15 + random() * 0.13],
      stonePaint,
      0,
      [0, random() * 90, 0],
      "fallen masonry chip",
    );
  }

  // A tiny stepping bridge lets the path cross the spring without hiding it.
  for (let i = 0; i < 4; i++) {
    box(
      [-0.49 + i * 0.39, 8.16, 0.60],
      [0.36, 0.18, 0.69],
      stonePaint,
      [0, 5, (i - 1.5) * 1.5],
      "stream crossing slab",
    );
  }

  // The hero tree: one leaning trunk, broad branch gestures, and separated
  // umbrella-like masses of jade foliage rather than a smooth green sphere.
  const trunkPath = catmull([
    [2.65, 7.98, -1.58],
    [2.62, 8.65, -1.55],
    [2.35, 9.48, -1.51],
    [2.40, 10.27, -1.62],
    [2.74, 11.17, -1.79],
    [2.94, 12.10, -1.87],
  ]);
  b.sweep(trunkPath, [0.46, 0.39, 0.30, 0.24, 0.17, 0.07], {
    bone: root,
    color: barkPaint,
    sides: 7,
    smooth: false,
    caps: "flat",
    name: "wind-bent elder trunk",
  });

  const roots: V[] = [
    [3.57, 8.02, -1.41],
    [2.95, 8.04, -2.65],
    [1.83, 8.02, -1.96],
    [2.19, 8.03, -0.66],
    [3.40, 8.04, -0.94],
  ];
  for (const tip of roots) {
    b.sweep(
      bezier([2.64, 8.55, -1.57], [(tip[0] + 2.64) / 2, 8.08, (tip[2] - 1.57) / 2], tip),
      [0.22, 0.025],
      { color: barkPaint, bone: root, sides: 6, smooth: false, name: "exposed tree root" },
    );
  }

  const branchRoutes: V[][] = [
    [[2.40, 9.75, -1.55], [3.10, 10.39, -1.25], [3.93, 11.05, -1.18], [4.41, 11.46, -1.37]],
    [[2.50, 10.55, -1.68], [1.83, 11.06, -1.42], [1.25, 11.76, -1.53]],
    [[2.77, 11.16, -1.80], [3.40, 11.73, -2.22], [3.93, 12.45, -2.47]],
    [[2.85, 11.61, -1.84], [2.43, 12.34, -2.03], [2.38, 13.08, -2.12]],
    [[2.42, 10.19, -1.61], [2.12, 10.77, -2.30], [1.49, 11.37, -2.72]],
  ];
  branchRoutes.forEach((route, i) => {
    b.sweep(catmull(route), [i === 0 ? 0.24 : 0.18, 0.025], {
      color: barkPaint,
      bone: root,
      sides: 6,
      smooth: false,
      name: "outstretched tree bough",
    });
  });

  const crowns: [number, number, number, number, number, number][] = [
    [4.02, 11.74, -1.37, 1.35, 0.60, 1.00],
    [3.40, 12.11, -1.36, 1.45, 0.67, 1.12],
    [1.49, 11.92, -1.58, 1.42, 0.64, 1.02],
    [1.54, 11.62, -2.61, 1.14, 0.55, 0.91],
    [3.79, 12.72, -2.35, 1.39, 0.64, 1.03],
    [2.44, 13.22, -2.03, 1.52, 0.70, 1.16],
    [2.19, 12.72, -1.18, 1.34, 0.60, 0.95],
  ];

  const leafMasses = [];
  for (let i = 0; i < crowns.length; i++) {
    const [x, y, z, sx, sy, sz] = crowns[i];
    leafMasses.push(ico([x, y, z], [sx, sy, sz], leafPaint, 1, [0, i * 37, 0], "broad jade canopy"));
    for (let j = 0; j < 3; j++) {
      const a = j * 2.1 + i;
      leafMasses.push(
        ico(
          [x + Math.cos(a) * sx * 0.6, y - 0.17 + random() * 0.21, z + Math.sin(a) * sz * 0.58],
          [sx * 0.48, sy * 0.65, sz * 0.52],
          j === 0 ? C.leaf : leafPaint,
          0,
          [0, random() * 90, 0],
          "angular foliage edge",
        ),
      );
    }
  }

  const leafHits = b.surface(leafMasses).scatter(48, {
    rng: random,
    minDist: 0.28,
    filter: (h) => h.n.y > -0.15,
  });
  b.cards(leafHits, leafTexture, {
    size: [0.20, 0.42],
    lean: 68,
    bend: 20,
    flow: [1, 0, 0.3],
    vary: 0.4,
    rng: random,
    name: "broad leaves catching the wind",
  });

  // A few hanging vine strokes tie the ancient architecture to the garden.
  function vine(route: V[], count: number) {
    const path = catmull(route);
    b.sweep(path, 0.026, { color: C.jadeDark, bone: root, sides: 5, name: "clinging vine" });
    b.along(path, count, (p) => {
      const v = p.at;
      const s = random() > 0.5 ? 1 : -1;
      b.extrude(
        [[0, 0], [0.12 * s, 0.04], [0.26 * s, -0.02], [0.13 * s, -0.12]],
        {
          at: v,
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.025,
          bone: root,
          color: random() > 0.5 ? C.jade : C.leaf,
          name: "ivy leaf",
        },
      );
    });
  }

  vine(
    [[-3.72, 11.15, -1.17], [-3.8, 10.55, -1.17], [-3.57, 9.83, -1.17], [-3.72, 9.20, -1.17], [-3.40, 8.40, -1.17]],
    9,
  );
  vine(
    [[-3.47, 12.31, -1.15], [-3.10, 12.49, -1.16], [-2.77, 12.81, -1.18], [-2.32, 12.90, -1.18]],
    5,
  );
  vine(
    [[3.82, 7.83, 0.95], [3.95, 7.19, 0.97], [3.72, 6.61, 1.08], [3.64, 6.10, 1.02]],
    7,
  );

  // Garden accents are grouped into clumps, leaving the river and mosaic clear.
  function grassClump(x: number, z: number, scale = 1) {
    for (let j = 0; j < 4; j++) {
      const dx = (j - 1.5) * 0.09 * scale;
      const h = (0.23 + random() * 0.18) * scale;
      b.extrude(
        [[-0.05 * scale, 0], [0.06 * scale, 0], [dx + 0.05, h * 0.65], [dx, h]],
        {
          at: [x + dx, 8.02, z],
          x: [1, 0, 0],
          y: [0, 1, 0],
          thickness: 0.018,
          bone: root,
          color: j % 2 ? C.grassLight : C.jade,
          name: "garden grass blade",
        },
      );
    }
  }

  for (const [x, z, s] of [
    [-3.8, 0.55, 1], [-3.5, 1.65, 0.8], [-2.7, 2.65, 0.75],
    [1.46, 1.52, 0.8], [3.53, 0.14, 1], [3.51, -2.5, 0.8],
    [-1.1, -2.88, 0.7], [0.1, -2.8, 0.65],
  ]) {
    grassClump(x, z, s);
  }

  function flower(x: number, z: number, height: number) {
    rod([x, 8.01, z], [x + 0.025, 8.01 + height, z], 0.018, C.jade, "flower stem");
    const cy = 8.01 + height;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ico(
        [x + Math.cos(a) * 0.07, cy, z + Math.sin(a) * 0.07],
        [0.075, 0.035, 0.063],
        i % 2 ? "#e6efff" : "#b7d8ef",
        0,
        [0, a * 180 / Math.PI, 0],
        "sky flower petal",
      );
    }
    ico([x, cy + 0.022, z], [0.041, 0.031, 0.041], C.goldLight, 0, [0, 0, 0], "flower heart");
  }

  for (const [x, z] of [
    [-3.55, 1.06], [-3.31, 0.86], [-3.82, 1.24],
    [1.60, 1.85], [1.86, 1.63], [1.32, 1.91],
  ]) flower(x, z, 0.25 + random() * 0.16);

  // Grass-capped little satellites reinforce the floating silhouette without
  // competing with the main sanctuary.
  function satellite(at: V, scale: number) {
    const [x, y, z] = at;
    ico([x, y - scale * 0.6, z], [scale * 0.78, scale, scale * 0.63], rockPaint, 0, [0, 22, 12], "satellite crag");
    ico([x, y, z], [scale * 0.9, scale * 0.19, scale * 0.74], grassPaint, 0, [0, 17, 0], "satellite turf");
    ico([x + scale * 0.26, y + scale * 0.17, z - scale * 0.1], [scale * 0.23, scale * 0.25, scale * 0.23], stonePaint);
  }
  satellite([-5.1, 6.26, 0.6], 0.66);
  satellite([4.94, 5.14, -0.45], 0.52);
  satellite([-3.15, 3.13, -0.25], 0.34);

  // Broken chips drifting directly beneath the mountain, not a separate base.
  for (const [x, y, z, s] of [
    [1.3, 1.6, -0.3, 0.30],
    [-0.2, 2.0, -0.9, 0.18],
    [3.0, 3.1, 0.2, 0.23],
    [-3.9, 4.0, 0.1, 0.21],
  ]) {
    ico([x, y, z], [s * 0.65, s, s * 0.6], C.rockDark, 0, [18, 23, 9], "weightless stone fragment");
  }

  return b.root;
}
