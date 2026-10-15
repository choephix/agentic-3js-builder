import * as THREE from "three";
import {
  createBuilder, rng, paint, noise, mix, mottle, svg,
  catmull, bezier, frame,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sanctuary Above the Clouds",
  description:
    "A floating anime-fantasy sanctuary with carved ivory ruins, wind-shaped jade trees, a suspended celestial relic, and a continuous waterfall descending into drifting cloud.",
};

/*
 * Art-direction changes:
 * 1. Replace the visibly disconnected waterfall ribbons with one continuous,
 *    thick, tapered curtain; retain its flowing drawing and add foam at its edges.
 * 2. Lighten the hanging mountain and quiet the noisy bark. Broad painted
 *    planes, warm masonry and luminous jade now carry the composition.
 * 3. Give the sanctuary a focal point: a small wind crystal suspended inside
 *    an engraved celestial halo, above the altar and below the arch.
 * 4. Add a smaller tree, restrained gold architectural details, flowers,
 *    cliff greenery and more dimensional clouds.
 * The island, satellite stones and clouds intentionally remain airborne.
 */

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Sanctuary Above the Clouds",
    paintSize: 2048,
  });
  const root = b.joint("island", { at: [0, 0, 0] });
  const random = rng(31827);

  type V = [number, number, number];
  type Fill = string | ReturnType<typeof paint>;

  const C = {
    rock: "#637c8b",
    rockDark: "#425b70",
    rockLight: "#94abb3",
    grass: "#73aa72",
    grassLight: "#b7d58b",
    jade: "#4b9d83",
    jadeDark: "#316b68",
    leaf: "#8ac59a",
    mint: "#c1df9c",
    cream: "#eee5ce",
    ivory: "#fff2d6",
    stoneShade: "#adb9ae",
    stoneDark: "#7b908b",
    gold: "#cfac67",
    goldLight: "#f7dea1",
    blue: "#449eb8",
    aqua: "#7bddd9",
    foam: "#d6fff0",
    cloud: "#e1eeea",
    cloudShade: "#b9d2de",
  };

  const rockPaint = paint((p, n) => {
    const level = Math.max(0, Math.min(1, (p.y - 2.0) / 5.6));
    const shade = 0.22 + level * 0.24 + Math.max(n.y, 0) * 0.24;
    const stone = mix(C.rockDark, C.rockLight, shade);
    return mix(stone, "#8ba6aa", noise(p, 1.5, 7) * 0.13);
  });
  const stonePaint = paint((p, n) => {
    const age = noise(p, 0.65, 41);
    const stone = mix(C.stoneShade, C.cream, 0.60 + n.y * 0.20);
    return mix(stone, "#8ba48a", n.y > 0.45 && age > 0.65 ? 0.24 : 0);
  });
  const grassPaint = mottle("#659b6a", "#a7c981", {
    size: 1.7, seed: 11, contrast: 0.65,
  });
  const barkPaint = paint((p, n) => {
    const shade = 0.35 + Math.max(n.y, 0) * 0.17 + noise(p, 0.75, 7) * 0.19;
    return mix("#6c6658", "#a39570", shade);
  });
  const leafPaint = paint((p, n) =>
    mix("#397e75", "#c2db9a",
      0.19 + Math.max(0, n.y) * 0.57 + noise(p, 1.1, 4) * 0.12),
  );
  const waterPaint = paint((p) => {
    const band = Math.sin(p.x * 18 + Math.sin(p.z * 1.5) * 1.8);
    return band > 0.91 ? "#b6f1e2" : band < -0.7 ? "#4aa9bb" : "#70ced0";
  });

  function box(
    at: V, size: V, color: Fill,
    rotation: V = [0, 0, 0], name = "masonry",
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at, rotation, bone: root, name,
    });
  }

  function ico(
    at: V, scale: V, color: Fill,
    detail = 0, rotation: V = [0, 0, 0], name = "faceted stone",
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at, scale, rotation, flat: true, bone: root, name,
    });
  }

  function rod(a: V, end: V, radius: number, color: Fill, name = "trim") {
    return b.rod(a, end, radius, {
      color, bone: root, sides: 6, smooth: false, name,
    });
  }

  function plane(
    at: V, size: [number, number], texture: THREE.Texture,
    dir: V = [0, 0, 1], up: V = [0, 1, 0], name = "inscription",
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at, bone: root, texture, dir, axis: "z", up, name,
    });
  }

  function torus(
    at: V, radius: number, thickness: number, color: Fill,
    rotation: V = [0, 0, 0], arc = Math.PI * 2, name = "ring",
  ) {
    return b.part(new THREE.TorusGeometry(radius, thickness, 4, 40, arc), color, {
      at, rotation, bone: root, name,
    });
  }

  const carving = svg(
    `<svg viewBox="0 0 120 360">
      <rect width="120" height="360" fill="#b9c2b0"/>
      <path d="M8 0V360M112 0V360" stroke="#eee6cb" stroke-width="8"/>
      <path d="M20 16H100V344H20Z" fill="none" stroke="#7b9185" stroke-width="4"/>
      <path d="M60 28L87 61L60 94L33 61Z M60 112L82 139L60 166L38 139Z
      M60 194L82 221L60 248L38 221Z M60 266L87 299L60 332L33 299Z"
      fill="none" stroke="#faf0d3" stroke-width="6"/>
      <path d="M60 40V82M60 124V154M60 206V236M60 278V320"
      stroke="#819d8f" stroke-width="4"/>
      <path d="M21 178H99M28 184H92" stroke="#829c8f" stroke-width="4"/>
      <path d="M11 95L29 106L20 119M109 252L91 263L98 275"
      fill="none" stroke="#7a8b7e" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  const runes = svg(
    `<svg viewBox="0 0 480 80">
      <path d="M6 40H40M440 40H474" stroke="#d7bc84" stroke-width="3"/>
      <g fill="none" stroke="#b9ffe4" stroke-width="5">
      <path d="M57 57V23L72 12L87 23V57M57 39H87"/>
      <path d="M111 19L129 39L111 59M129 39H146V19M146 39V59"/>
      <path d="M174 16V64M161 29L174 16L187 29M161 51L174 64L187 51"/>
      <path d="M218 15L200 40L218 65L236 40ZM218 27V53"/>
      <path d="M262 17V62M262 29L283 17V44L262 55"/>
      <path d="M306 20H337L322 39L337 60H306M306 39H322"/>
      <path d="M363 15L347 40L363 65M363 40H382M382 17V63"/>
      <path d="M409 17L427 40L409 63L391 40Z"/>
      </g>
      <path d="M48 73H432" stroke="#7aab99" stroke-width="3"/>
    </svg>`,
    { size: 768 },
  );

  const sigil = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="118" fill="#375c62" stroke="#ddbd77" stroke-width="7"/>
      <circle cx="128" cy="128" r="103" fill="none" stroke="#87b6a0" stroke-width="3"/>
      <circle cx="128" cy="128" r="86" fill="none" stroke="#dfc88f" stroke-width="3"
      stroke-dasharray="3 12"/>
      <path d="M128 22L144 100L205 65L164 122L234 128L164 139L205 191
      L144 156L128 234L112 156L51 191L92 139L22 128L92 122L51 65L112 100Z"
      fill="#e8ce8c" stroke="#315661" stroke-width="5"/>
      <path d="M128 72L158 128L128 184L98 128Z" fill="#8befd5" stroke="#f0e7b7" stroke-width="4"/>
      <path d="M128 92L144 128L128 164L112 128Z" fill="#345c62"/>
      <circle cx="128" cy="128" r="8" fill="#d7fff1"/>
    </svg>`,
    { size: 512 },
  );

  const waterfallTexture = svg(
    `<svg viewBox="0 0 160 800">
      <rect width="160" height="800" fill="#62c6d3"/>
      <path d="M0 0H16L21 160L14 320L21 490L11 670L20 800H0Z" fill="#b8f2e8"/>
      <path d="M143 0H160V800H146L152 600L142 410L149 210Z" fill="#a3ece7"/>
      <g fill="none" stroke-linecap="round">
      <path d="M33 0L37 100L31 190L38 330M36 410L30 550L37 710L34 800"
      stroke="#e6fff1" stroke-width="4"/>
      <path d="M62 0L57 160L66 330L61 500L68 650L62 800"
      stroke="#98e7e3" stroke-width="10"/>
      <path d="M86 0L90 130M89 205L82 350L89 520M85 620L88 800"
      stroke="#d5fff0" stroke-width="4"/>
      <path d="M117 0L112 205L121 430L113 610L120 800"
      stroke="#42a4bb" stroke-width="12"/>
      <path d="M130 70L125 275M132 400L126 610M130 685L134 800"
      stroke="#d1fff0" stroke-width="4"/>
      <path d="M48 50L45 185M48 310L51 410M46 600L50 725"
      stroke="#3fa7bb" stroke-width="3"/>
      </g>
    </svg>`,
    { size: 1024 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M40 158C34 118 2 105 5 65C8 34 30 16 51 3
      C78 40 84 69 65 102C52 121 44 137 40 158Z"
      fill="#b3d998" stroke="#66a681" stroke-width="4"/>
      <path d="M40 151Q33 84 51 15M40 113L17 82M40 91L64 62M43 66L27 43"
      fill="none" stroke="#e8eabd" stroke-width="4"/>
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

  const haloTexture = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#e4d29d">
      <circle cx="128" cy="128" r="116" stroke-width="3"/>
      <circle cx="128" cy="128" r="103" stroke-width="2"/>
      <path d="M128 5V31M128 225V251M5 128H31M225 128H251
      M41 41L59 59M197 197L215 215M41 215L59 197M197 59L215 41"
      stroke-width="4"/>
      <path d="M128 22L138 36L128 50L118 36Z
      M128 206L138 220L128 234L118 220Z
      M22 128L36 118L50 128L36 138Z
      M206 128L220 118L234 128L220 138Z" stroke-width="3"/>
      </g>
      <g stroke="#a5ffe2" fill="none" stroke-width="4">
      <path d="M56 86L63 74L74 80M182 74L193 80L200 94
      M56 170L65 183L77 178M180 182L193 178L199 164"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // A wide garden surface over a strongly tapered hanging mountain.
  const outline: V[] = [];
  for (let i = 0; i < 15; i++) {
    const a = i * Math.PI * 2 / 15;
    const r = 0.91 + random() * 0.12;
    outline.push([
      Math.sin(a) * 5.15 * r,
      7.82 + random() * 0.11,
      Math.cos(a) * 4.05 * r,
    ]);
  }

  function mountainLayer(
    upper: V[], factor: number, y: number,
    offsetX: number, offsetZ: number, color: Fill, name: string,
  ): V[] {
    const lower: V[] = upper.map((p) => [
      p[0] * factor + offsetX,
      y + (random() - 0.5) * 0.45,
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
    b.part(g, color, {
      at: [0, 0, 0], bone: root, name, flat: true,
    });
    return lower;
  }

  const rimBottom = mountainLayer(outline, 0.98, 7.44, 0, 0, grassPaint, "turf edge");
  const shoulder = mountainLayer(rimBottom, 0.93, 6.3, 0.08, 0, rockPaint, "upper cliff faces");
  const middle = mountainLayer(shoulder, 0.70, 4.5, 0.18, -0.22, rockPaint, "hanging mountain");
  const lower = mountainLayer(middle, 0.40, 3.05, 0.3, -0.15, rockPaint, "inverted crags");
  mountainLayer(lower, 0.04, 2.08, 0.25, 0, C.rockDark, "mountain terminal");
  b.slab(outline.map((p) => [p[0], 7.93, p[2]]), {
    thickness: 0.20, color: grassPaint, bone: root, name: "garden crown",
  });

  for (let i = 0; i < 14; i++) {
    const a = i * Math.PI * 2 / 14;
    const h = 1.1 + random() * 1.7;
    ico(
      [Math.sin(a) * 3.5, 6.13 - h * 0.45, Math.cos(a) * 2.65],
      [0.62 + random() * 0.3, h, 0.67 + random() * 0.35],
      rockPaint, 0,
      [random() * 15, a * 180 / Math.PI, random() * 10],
      "blade of suspended rock",
    );
  }

  for (const [x, y, z, s] of [
    [-2.8, 5.7, 2.05, 0.48],
    [2.3, 5.15, 1.7, 0.42],
    [3.3, 6.6, -0.3, 0.32],
    [-1.8, 4.3, 1.5, 0.26],
    [0.6, 3.4, 0.85, 0.22],
  ]) {
    ico([x, y, z], [s, s * 1.6, s * 0.55], "#558f94", 0, [0, 15, -18], "crystal matrix");
    glow(ico(
      [x, y + s * 0.12, z + s * 0.35],
      [s * 0.45, s, s * 0.3], "#8cdfd3",
      0, [0, 15, -18], "crystal inclusion",
    ), 0.5);
  }

  // Winding shallow spring.
  const stream: V[] = [
    [1.12, 8.04, -2.9], [0.85, 8.055, -1.8],
    [0.70, 8.045, -0.65], [0.22, 8.04, 0.55],
    [-0.42, 8.025, 1.9], [-0.75, 8.00, 3.1],
    [-0.72, 7.98, 3.88],
  ];
  const widths = [0.42, 0.5, 0.6, 0.54, 0.59, 0.68, 0.75];
  const bankL: V[] = stream.map((p, i) => [p[0] - widths[i], p[1], p[2]]);
  const bankR: V[] = stream.map((p, i) => [p[0] + widths[i], p[1], p[2]]);
  b.membrane(bankL, bankR, {
    color: waterPaint, thickness: 0.06, rows: 5, cols: 18,
    bone: root, name: "jade spring",
  });

  for (let side = 0; side < 2; side++) {
    const bank = side === 0 ? bankL : bankR;
    for (let i = 0; i < bank.length - 1; i++) {
      const p = bank[i];
      ico(
        [p[0] + (side === 0 ? -0.12 : 0.12), 8.02, p[2]],
        [0.28 + random() * 0.16, 0.17, 0.38],
        i % 2 ? stonePaint : C.stoneDark, 0,
        [0, random() * 80, 0], "stream bank stone",
      );
    }
  }

  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const z = -2.45 + t * 5.5;
    const x = 1.03 - 1.7 * t;
    b.sweep(bezier(
      [x - 0.23, 8.09, z], [x, 8.10, z + 0.1], [x + 0.2, 8.09, z],
    ), 0.016, {
      color: "#c8f3e0", bone: root, sides: 4, name: "spring ripple",
    });
  }

  // A single closed curtain eliminates both the old elbow and the texture reset.
  // Its narrow side walls remain visible in the side render.
  function fallAt(t: number, side: number): V {
    const width = 1.46 * (1 - 0.31 * t);
    return [
      -0.72 + Math.sin(t * 4.2) * 0.10 + side * width * 0.5,
      7.99 - 6.62 * t,
      3.88 + 0.62 * t * t + 0.04 * Math.sin(t * 5),
    ];
  }

  const steps = 28;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = fallAt(t, -1);
    const c = fallAt(t, 1);
    const thickness = 0.16 - t * 0.055;
    positions.push(...a, ...c,
      a[0], a[1], a[2] - thickness,
      c[0], c[1], c[2] - thickness);
    uvs.push(0, 1 - t, 1, 1 - t, 0, 1 - t, 1, 1 - t);
    if (i < steps) {
      const k = i * 4;
      indices.push(
        k, k + 4, k + 1, k + 1, k + 4, k + 5,
        k + 2, k + 3, k + 6, k + 3, k + 7, k + 6,
        k, k + 2, k + 4, k + 2, k + 6, k + 4,
        k + 1, k + 5, k + 3, k + 3, k + 5, k + 7,
      );
    }
  }
  indices.push(0, 1, 2, 1, 3, 2);
  const end = steps * 4;
  indices.push(end, end + 2, end + 1, end + 1, end + 2, end + 3);
  const curtainGeometry = new THREE.BufferGeometry();
  curtainGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  curtainGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  curtainGeometry.setIndex(indices);
  curtainGeometry.computeVertexNormals();
  glow(b.part(curtainGeometry, "#ffffff", {
    at: [0, 0, 0], bone: root, texture: waterfallTexture,
    name: "continuous waterfall curtain",
  }), 0.33);

  for (const side of [-1, 1]) {
    const edge: V[] = [];
    for (let i = 0; i <= 14; i++) edge.push(fallAt(i / 14, side));
    glow(b.sweep(edge, [0.038, 0.016], {
      color: "#c9f9ec", bone: root, sides: 5,
      name: "waterfall silver edge",
    }), 0.35);
  }

  b.sweep(catmull([
    [-1.45, 7.99, 3.58], [-1.35, 8.04, 3.88],
    [-0.72, 8.02, 3.99], [-0.03, 8.01, 3.88],
  ]), 0.055, {
    color: C.foam, bone: root, sides: 6, name: "foaming waterfall lip",
  });

  for (let i = 0; i < 12; i++) {
    ico(
      [-0.7 + (random() - 0.5) * 1.9, 1.18 + random() * 0.64, 4.48 + random() * 0.52],
      [0.022, 0.06 + random() * 0.09, 0.022],
      C.foam, 0, [0, 0, 8], "falling spray",
    );
  }

  // Three-dimensional mist, not a flat pile of stones.
  for (const [x, y, z, sx, sy, sz] of [
    [-0.70, 1.00, 4.70, 1.00, 0.46, 0.67],
    [-1.46, 1.12, 4.60, 0.71, 0.40, 0.54],
    [0.15, 1.13, 4.64, 0.72, 0.43, 0.58],
    [-0.97, 1.43, 4.48, 0.55, 0.40, 0.47],
    [-0.25, 1.48, 4.51, 0.53, 0.43, 0.48],
    [-1.70, 0.98, 4.88, 0.49, 0.23, 0.39],
    [0.63, 1.11, 4.73, 0.49, 0.22, 0.36],
  ]) {
    ico([x, y, z], [sx, sy, sz], C.cloud, 1, [0, random() * 70, 0], "waterfall mist");
  }

  // Sanctuary terrace and approach.
  box([-2.1, 8.08, -1.33], [3.75, 0.28, 2.35], C.stoneDark, [0, 0, 0], "sanctuary foundation");
  box([-2.1, 8.25, -1.35], [3.55, 0.18, 2.16], stonePaint, [0, 0, 0], "terrace paving");
  for (let i = 0; i < 3; i++) {
    box(
      [-2.1, 8.015 + i * 0.095, 0.24 - i * 0.31],
      [2.1 - i * 0.1, 0.15, 0.42], stonePaint,
      [0, 0, 0], "worn approach step",
    );
  }
  for (let i = 0; i < 7; i++) {
    box(
      [-2.15 + Math.sin(i * 0.8) * 0.16, 8.015, 0.8 + i * 0.35],
      [0.77 + random() * 0.25, 0.1, 0.27], stonePaint,
      [0, (random() - 0.5) * 19, 0], "pilgrim paving",
    );
  }
  b.part(new THREE.CylinderGeometry(0.85, 0.87, 0.07, 16), stonePaint, {
    at: [-2.05, 8.39, -0.85], bone: root, name: "mosaic stone",
  });
  plane([-2.05, 8.429, -0.85], [1.63, 1.63], mosaic,
    [0, 1, 0], [0, 0, -1], "celestial mosaic");

  const archX = -2.08;
  const archZ = -1.58;
  const baseY = 8.36;
  const springY = 11.05;
  const radius = 1.41;

  function column(x: number, z: number, y: number, height: number, broken = false) {
    box([x, y + 0.11, z], [0.94, 0.22, 0.94], stonePaint, [0, 0, 0], "column foot");
    box([x, y + 0.27, z], [0.73, 0.13, 0.73], C.cream, [0, 0, 0], "base bevel");
    const shaftBase = y + 0.34;
    const shaftHeight = height - (broken ? 0.34 : 0.69);
    const shaftCenter = shaftBase + shaftHeight / 2;
    box([x, shaftCenter, z], [0.56, shaftHeight, 0.58], stonePaint, [0, 0, 0], "square pillar shaft");
    for (const s of [-1, 1]) {
      box([x + s * 0.245, shaftCenter, z + 0.315], [0.065, shaftHeight, 0.06], C.cream);
      box([x + s * 0.245, shaftCenter, z - 0.315], [0.065, shaftHeight, 0.06], C.stoneShade);
    }
    if (shaftHeight > 0.9) {
      plane([x, shaftCenter, z + 0.299], [0.36, shaftHeight * 0.88], carving,
        [0, 0, 1], [0, 1, 0], "pillar front relief");
      plane([x + 0.285, shaftCenter, z], [0.34, shaftHeight * 0.88], carving,
        [1, 0, 0], [0, 1, 0], "pillar side relief");
    }
    if (broken) {
      b.slab([
        [x - 0.28, y + height - 0.03, z - 0.29],
        [x + 0.28, y + height + 0.11, z - 0.29],
        [x + 0.28, y + height + 0.02, z + 0.29],
        [x - 0.28, y + height - 0.06, z + 0.29],
      ], { color: C.ivory, thickness: 0.04, bone: root, name: "exposed broken shaft" });
      return;
    }
    box([x, y + height - 0.27, z], [0.69, 0.13, 0.72], C.cream, [0, 0, 0], "capital neck");
    box([x, y + height - 0.12, z], [0.88, 0.20, 0.85], stonePaint, [0, 0, 0], "capital");
    box([x, y + height - 0.33, z], [0.60, 0.045, 0.64], C.gold, [0, 0, 0], "capital gold fillet");
    for (const s of [-1, 1]) {
      box([x + s * 0.33, y + height - 0.23, z + 0.34],
        [0.18, 0.18, 0.14], C.gold, [0, 0, 45], "capital corner diamond");
    }
  }

  column(archX - radius, archZ, baseY, springY - baseY);
  column(archX + radius, archZ, baseY, springY - baseY);

  for (let i = 0; i < 11; i++) {
    const a0 = i * Math.PI / 11 + 0.009;
    const a1 = (i + 1) * Math.PI / 11 - 0.009;
    b.extrude([
      [Math.cos(a0) * radius, Math.sin(a0) * radius],
      [Math.cos(a0) * 1.91, Math.sin(a0) * 1.91],
      [Math.cos(a1) * 1.91, Math.sin(a1) * 1.91],
      [Math.cos(a1) * radius, Math.sin(a1) * radius],
    ], {
      at: [archX, springY, archZ], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.67, bevel: 0.025, detail: 0.5,
      bone: root, color: i % 3 === 0 ? C.cream : stonePaint,
      name: "individual arch voussoir",
    });
  }
  const archTrim: V[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI * i / 24;
    archTrim.push([
      archX + Math.cos(a) * 1.52,
      springY + Math.sin(a) * 1.52, archZ + 0.353,
    ]);
  }
  b.sweep(archTrim, 0.033, {
    color: C.gold, bone: root, sides: 4, name: "gold inset arch line",
  });
  box([archX, 12.83, archZ], [0.55, 0.64, 0.83], C.cream, [0, 0, 0], "crown keystone");
  box([archX, 12.89, archZ + 0.43], [0.56, 0.56, 0.08], C.gold, [0, 0, 45], "seal frame");
  glow(plane([archX, 12.89, archZ + 0.478], [0.54, 0.54], sigil,
    [0, 0, 1], [0, 1, 0], "wind-star seal"), 0.55);
  box([archX, 13.28, archZ], [0.82, 0.16, 0.90], stonePaint, [0, 0, 0], "crown cornice");

  for (let row = 0; row < 3; row++) {
    for (let k = 0; k < 3 - (row === 2 ? 1 : 0); k++) {
      box([-3.75 + k * 0.54, 8.54 + row * 0.38, -2.40],
        [0.52, 0.35, 0.47], stonePaint, [0, 0, 0], "rear wall masonry");
    }
  }

  box([-2.12, 8.71, -2.18], [1.32, 0.62, 0.64], C.stoneDark, [0, 0, 0], "ancient altar");
  box([-2.12, 9.05, -2.18], [1.57, 0.15, 0.82], C.cream, [0, 0, 0], "altar table");
  glow(plane([-2.12, 8.76, -1.852], [1.1, 0.21], runes,
    [0, 0, 1], [0, 1, 0], "altar inscription"), 0.65);
  torus([-2.12, 9.15, -2.18], 0.34, 0.035, C.gold,
    [90, 0, 0], Math.PI * 2, "altar offering ring");

  // Wind relic: readable from the front, but with empty sky around it.
  const relic: V = [-2.12, 10.42, -2.04];
  glow(b.part(new THREE.OctahedronGeometry(1), "#8debd4", {
    at: relic, scale: [0.28, 0.62, 0.25], rotation: [0, 24, 0],
    bone: root, flat: true, name: "suspended wind crystal",
  }), 0.8);
  glow(b.part(new THREE.OctahedronGeometry(1), "#d3ffe9", {
    at: [-2.12, 10.43, -1.82], scale: [0.10, 0.38, 0.055],
    bone: root, name: "crystal bright facet",
  }), 0.8);
  torus(relic, 0.80, 0.025, C.gold, [0, 0, 0], Math.PI * 2, "celestial halo rim");
  glow(plane([-2.12, 10.42, -2.015], [1.77, 1.77], haloTexture,
    [0, 0, 1], [0, 1, 0], "halo engraved face"), 0.55);
  plane([-2.12, 10.42, -2.065], [1.77, 1.77], haloTexture,
    [0, 0, -1], [0, 1, 0], "halo engraved reverse");
  torus(relic, 0.43, 0.023, C.goldLight, [70, 18, 0], Math.PI * 2, "relic orbit");
  for (const [x, y, z, s] of [
    [-2.62, 10.80, -1.99, 0.067],
    [-1.57, 10.12, -2.00, 0.055],
    [-2.14, 9.54, -2.06, 0.070],
  ]) {
    glow(b.part(new THREE.OctahedronGeometry(s), "#c6ffe8", {
      at: [x, y, z], bone: root, name: "orbiting wind mote",
    }), 1);
  }

  column(2.77, 1.66, 8.0, 1.66, true);
  box([1.75, 8.25, 2.35], [1.43, 0.42, 0.58], stonePaint, [0, -24, 7], "fallen lintel");
  box([3.32, 8.18, 2.19], [0.81, 0.22, 0.78], stonePaint, [0, 18, -10], "fallen capital");
  for (let i = 0; i < 5; i++) {
    ico(
      [2.45 + random() * 1.15, 8.10, 2.25 + random() * 0.7],
      [0.13 + random() * 0.16, 0.15, 0.15 + random() * 0.13],
      stonePaint, 0, [0, random() * 90, 0], "masonry chip",
    );
  }
  for (let i = 0; i < 4; i++) {
    box([-0.49 + i * 0.39, 8.16, 0.60], [0.36, 0.18, 0.69],
      stonePaint, [0, 5, (i - 1.5) * 1.5], "stream crossing slab");
  }

  // Large elder tree: clean sculptural bark with a few intentional grooves.
  const trunkPoints: V[] = [
    [2.65, 7.98, -1.58], [2.62, 8.65, -1.55],
    [2.35, 9.48, -1.51], [2.40, 10.27, -1.62],
    [2.74, 11.17, -1.79], [2.94, 12.10, -1.87],
  ];
  const trunk = b.sweep(catmull(trunkPoints),
    [0.46, 0.39, 0.30, 0.24, 0.17, 0.07], {
      bone: root, color: barkPaint, sides: 7, smooth: false,
      caps: "flat", name: "wind-bent elder trunk",
    });
  for (const angle of [-110, -35, 45, 125]) {
    b.sweep(trunk.line(angle, 0.003).slice(0.08, 0.72), 0.012, {
      color: "#746f5a", bone: root, sides: 4, name: "broad bark groove",
    });
  }
  for (const tip of [
    [3.57, 8.02, -1.41], [2.95, 8.04, -2.65],
    [1.83, 8.02, -1.96], [2.19, 8.03, -0.66], [3.40, 8.04, -0.94],
  ] as V[]) {
    b.sweep(bezier(
      [2.64, 8.55, -1.57],
      [(tip[0] + 2.64) / 2, 8.08, (tip[2] - 1.57) / 2], tip,
    ), [0.22, 0.025], {
      color: barkPaint, bone: root, sides: 6,
      smooth: false, name: "exposed tree root",
    });
  }

  const branches: V[][] = [
    [[2.40, 9.75, -1.55], [3.10, 10.39, -1.25], [3.93, 11.05, -1.18], [4.41, 11.46, -1.37]],
    [[2.50, 10.55, -1.68], [1.83, 11.06, -1.42], [1.25, 11.76, -1.53]],
    [[2.77, 11.16, -1.80], [3.40, 11.73, -2.22], [3.93, 12.45, -2.47]],
    [[2.85, 11.61, -1.84], [2.43, 12.34, -2.03], [2.38, 13.08, -2.12]],
    [[2.42, 10.19, -1.61], [2.12, 10.77, -2.30], [1.49, 11.37, -2.72]],
  ];
  branches.forEach((route, i) => b.sweep(catmull(route),
    [i === 0 ? 0.24 : 0.18, 0.025], {
      color: barkPaint, bone: root, sides: 6,
      smooth: false, name: "outstretched bough",
    }));

  const crowns = [
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
    leafMasses.push(ico([x, y, z], [sx, sy, sz], leafPaint,
      1, [0, i * 37, 0], "broad jade canopy"));
    for (let j = 0; j < 2; j++) {
      const a = j * 2.7 + i;
      leafMasses.push(ico(
        [x + Math.cos(a) * sx * 0.6, y - 0.12, z + Math.sin(a) * sz * 0.58],
        [sx * 0.48, sy * 0.62, sz * 0.52], leafPaint,
        0, [0, random() * 90, 0], "angular foliage edge",
      ));
    }
  }
  b.cards(b.surface(leafMasses).scatter(35, {
    rng: random, minDist: 0.33, filter: (h) => h.n.y > 0.0,
  }), leafTexture, {
    size: [0.18, 0.36], lean: 73, bend: 20,
    flow: [1, 0, 0.3], vary: 0.3, rng: random,
    name: "leaves catching the wind",
  });

  // A small companion tree on the rear-left shoulder, clear of the arch opening.
  b.sweep(catmull([
    [-3.97, 8.0, -1.03], [-4.04, 8.55, -1.14],
    [-4.30, 9.10, -1.27], [-4.21, 9.66, -1.33],
  ]), [0.18, 0.055], {
    color: barkPaint, bone: root, sides: 6, smooth: false, name: "young wind tree",
  });
  b.sweep(catmull([
    [-4.07, 8.70, -1.18], [-4.58, 9.09, -1.19], [-4.77, 9.49, -1.24],
  ]), [0.095, 0.018], {
    color: barkPaint, bone: root, sides: 5, name: "young tree bough",
  });
  for (const [x, y, z, sx, sy, sz] of [
    [-4.23, 9.70, -1.40, 0.83, 0.46, 0.70],
    [-4.72, 9.47, -1.19, 0.67, 0.35, 0.54],
    [-3.93, 9.54, -1.19, 0.59, 0.34, 0.50],
  ]) {
    ico([x, y, z], [sx, sy, sz], leafPaint,
      1, [0, 25, 0], "young tree crown");
  }

  function vine(route: V[], count: number) {
    const path = catmull(route);
    b.sweep(path, 0.025, {
      color: C.jadeDark, bone: root, sides: 5, name: "clinging vine",
    });
    b.along(path, count, (p) => {
      const s = random() > 0.5 ? 1 : -1;
      b.extrude(
        [[0, 0], [0.12 * s, 0.04], [0.26 * s, -0.02], [0.13 * s, -0.12]],
        {
          at: p.at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025,
          bone: root, color: random() > 0.5 ? C.jade : C.leaf,
          name: "ivy leaf",
        },
      );
    });
  }
  vine([
    [-3.72, 11.15, -1.17], [-3.8, 10.55, -1.17],
    [-3.57, 9.83, -1.17], [-3.72, 9.20, -1.17], [-3.40, 8.40, -1.17],
  ], 9);
  vine([
    [-3.47, 12.31, -1.15], [-3.10, 12.49, -1.16],
    [-2.77, 12.81, -1.18], [-2.32, 12.90, -1.18],
  ], 5);
  vine([
    [3.82, 7.83, 0.95], [3.95, 7.19, 0.97],
    [3.72, 6.61, 1.08], [3.64, 6.10, 1.02],
  ], 7);
  vine([
    [-3.15, 7.85, 2.68], [-3.25, 7.32, 2.67],
    [-3.11, 6.85, 2.72], [-2.91, 6.45, 2.66],
  ], 6);

  function grassClump(x: number, z: number, scale = 1) {
    for (let j = 0; j < 4; j++) {
      const dx = (j - 1.5) * 0.09 * scale;
      const h = (0.23 + random() * 0.18) * scale;
      b.extrude(
        [[-0.05 * scale, 0], [0.06 * scale, 0], [dx + 0.05, h * 0.65], [dx, h]],
        {
          at: [x + dx, 8.02, z], x: [1, 0, 0], y: [0, 1, 0],
          thickness: 0.018, bone: root,
          color: j % 2 ? C.grassLight : C.jade, name: "garden grass",
        },
      );
    }
  }
  for (const [x, z, s] of [
    [-3.8, 0.55, 1], [-3.5, 1.65, 0.8], [-2.7, 2.65, 0.75],
    [1.46, 1.52, 0.8], [3.53, 0.14, 1], [3.51, -2.5, 0.8],
    [-1.1, -2.88, 0.7], [0.1, -2.8, 0.65],
  ]) grassClump(x, z, s);

  function flower(x: number, z: number, height: number) {
    rod([x, 8.01, z], [x + 0.025, 8.01 + height, z],
      0.018, C.jade, "flower stem");
    const cy = 8.01 + height;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ico(
        [x + Math.cos(a) * 0.075, cy, z + Math.sin(a) * 0.075],
        [0.08, 0.035, 0.067], i % 2 ? "#f0f1ff" : "#c1d6f2",
        0, [0, a * 180 / Math.PI, 0], "sky flower petal",
      );
    }
    ico([x, cy + 0.023, z], [0.041, 0.031, 0.041],
      C.goldLight, 0, [0, 0, 0], "flower heart");
  }
  for (const [x, z] of [
    [-3.55, 1.06], [-3.31, 0.86], [-3.82, 1.24],
    [1.60, 1.85], [1.86, 1.63], [1.32, 1.91],
    [3.35, -0.15], [3.55, -0.34],
  ]) flower(x, z, 0.25 + random() * 0.16);

  function satellite(at: V, scale: number) {
    const [x, y, z] = at;
    ico([x, y - scale * 0.6, z],
      [scale * 0.78, scale, scale * 0.63], rockPaint,
      0, [0, 22, 12], "satellite crag");
    ico([x, y, z], [scale * 0.9, scale * 0.19, scale * 0.74],
      grassPaint, 0, [0, 17, 0], "satellite turf");
    ico([x + scale * 0.26, y + scale * 0.17, z - scale * 0.1],
      [scale * 0.23, scale * 0.25, scale * 0.23],
      stonePaint, 0, [0, 0, 0], "satellite stone");
  }
  satellite([-5.1, 6.26, 0.6], 0.66);
  satellite([4.94, 5.14, -0.45], 0.52);
  satellite([-3.15, 3.13, -0.25], 0.34);

  for (const [x, y, z, s] of [
    [1.3, 1.6, -0.3, 0.30], [-0.2, 2.0, -0.9, 0.18],
    [3.0, 3.1, 0.2, 0.23], [-3.9, 4.0, 0.1, 0.21],
  ]) {
    ico([x, y, z], [s * 0.65, s, s * 0.6], C.rockDark,
      0, [18, 23, 9], "weightless stone fragment");
  }

  // A restrained trailing cloud, behind the island rather than a pedestal.
  for (const [x, y, z, sx, sy, sz] of [
    [2.55, 2.9, -1.65, 0.92, 0.22, 0.43],
    [3.25, 2.98, -1.68, 0.64, 0.30, 0.41],
    [3.80, 2.88, -1.65, 0.80, 0.16, 0.34],
  ]) {
    ico([x, y, z], [sx, sy, sz], C.cloudShade,
      1, [0, 20, 0], "passing cloud wisp");
  }

  // A few falling leaves give the garden's wind direction a readable gesture.
  b.cards([
    frame([3.72, 10.85, -0.63], [0.4, 1, 0.1]),
    frame([4.18, 10.25, -0.31], [-0.3, 1, 0]),
    frame([4.43, 9.57, 0.07], [0.5, 1, 0.2]),
  ], leafTexture, {
    size: [0.12, 0.23], lean: 65, flow: [0.3, 0, 1],
    name: "wind-carried leaves",
  });

  return b.root;
}
