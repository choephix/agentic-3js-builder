```ts
import * as THREE from "three";
import {
  createBuilder, rng, paint, noise, mix, mottle, svg,
  catmull, bezier, frame,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Sanctuary Above the Clouds",
  description:
    "An airborne garden sanctuary: ivory ruins, a suspended wind relic, jade trees, luminous mineral seams and a waterfall dissolving into clouds. The island and its satellites deliberately float.",
};

/*
 * 1. Replace the repetitive, dark hanging-rock skirt with a brighter, tapered
 *    mountain, a few asymmetric buttresses, and surface-seated mineral seams.
 * 2. Make the waterfall less ruler-straight: a rounded spill, a widening lower
 *    curtain, drifting spray and genuinely voluminous cloud banks.
 * 3. Remove the rope-like bark grooves. Give the trees quieter painted bark,
 *    warmer sunlit crowns, and smaller leaf clusters along their silhouettes.
 * 4. Add restrained ruin damage, a small embroidered wind banner, meadow
 *    patches and hanging greenery. Preserve the clear arch-and-tree silhouette.
 * 5. Keep the floating stones, relic, leaves and clouds airborne intentionally;
 *    grounding this subject would contradict its design.
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
    rockDark: "#647a92",
    rockLight: "#b4c4c5",
    grass: "#79ad75",
    grassLight: "#c7da94",
    jade: "#549d81",
    jadeDark: "#3d796d",
    leaf: "#9dcca1",
    cream: "#eee5ce",
    ivory: "#fff2d6",
    stoneShade: "#b3beb1",
    stoneDark: "#83958c",
    gold: "#cfac67",
    goldLight: "#f7dea1",
    aqua: "#8de8d8",
    foam: "#ddfff3",
    cloud: "#eaf3ef",
    cloudShade: "#cbdde8",
  };

  const rockPaint = paint((p, n) => {
    const height = Math.max(0, Math.min(1, (p.y - 2) / 6));
    const light = 0.25 + height * 0.22 + Math.max(n.y, 0) * 0.21;
    return mix(
      mix(C.rockDark, C.rockLight, light),
      "#9eafb9", noise(p, 1.4, 7) * 0.13,
    );
  });
  const stonePaint = paint((p, n) => {
    const stone = mix(C.stoneShade, C.cream, 0.62 + n.y * 0.19);
    return mix(stone, "#90a58a",
      n.y > 0.45 && noise(p, 0.65, 41) > 0.65 ? 0.24 : 0);
  });
  const grassPaint = mottle("#71a776", "#b8ce87", {
    size: 1.8, seed: 11, contrast: 0.6,
  });
  const barkPaint = paint((p, n) => {
    const broad = noise(p, 0.8, 7);
    const fine = Math.sin(p.x * 17 + p.z * 13 + Math.sin(p.y * 1.2));
    return mix("#77705f", "#b6a580",
      0.35 + broad * 0.19 + Math.max(n.y, 0) * 0.19 +
      (fine > 0.94 ? -0.07 : 0));
  });
  const leafPaint = paint((p, n) => {
    const light = Math.max(0, n.y);
    return mix("#4d9784", "#d0dfa1",
      0.11 + light * 0.62 + noise(p, 0.7, 4) * 0.17);
  });
  const waterPaint = paint((p) => {
    const wave = Math.sin(p.x * 18 + Math.sin(p.z * 1.5) * 1.8);
    return wave > 0.93 ? "#cef6e8" :
      wave < -0.75 ? "#50afbd" : "#7dd4d1";
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
    at: V, scale: V, color: Fill, detail = 0,
    rotation: V = [0, 0, 0], name = "faceted stone",
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
    rotation: V = [0, 0, 0], name = "ring",
  ) {
    return b.part(
      new THREE.TorusGeometry(radius, thickness, 4, 40),
      color, { at, rotation, bone: root, name },
    );
  }

  function cloud(at: V, scale: V, color = C.cloud, name = "cloud billow") {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at, scale, bone: root, flat: true, name,
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
      <rect width="160" height="800" fill="#6bccd4"/>
      <path d="M0 0H16L21 160L14 320L21 490L11 670L20 800H0Z" fill="#b8f2e8"/>
      <path d="M143 0H160V800H146L152 600L142 410L149 210Z" fill="#a3ece7"/>
      <g fill="none" stroke-linecap="round">
      <path d="M33 0L37 100L31 190L38 330M36 410L30 550L37 710L34 800"
      stroke="#e6fff1" stroke-width="4"/>
      <path d="M62 0L57 160L66 330L61 500L68 650L62 800"
      stroke="#a6eee4" stroke-width="10"/>
      <path d="M86 0L90 130M89 205L82 350L89 520M85 620L88 800"
      stroke="#d5fff0" stroke-width="4"/>
      <path d="M117 0L112 205L121 430L113 610L120 800"
      stroke="#48adbf" stroke-width="9"/>
      <path d="M130 70L125 275M132 400L126 610M130 685L134 800"
      stroke="#d1fff0" stroke-width="4"/>
      <path d="M48 50L45 185M48 310L51 410M46 600L50 725"
      stroke="#4baebf" stroke-width="3"/>
      </g>
      <path d="M0 730Q40 695 80 747T160 718V800H0Z" fill="#d5f7ee" opacity=".38"/>
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
      <path d="M128 22L138 36L128 50L118 36Z M128 206L138 220L128 234L118 220Z
      M22 128L36 118L50 128L36 138Z M206 128L220 118L234 128L220 138Z"
      stroke-width="3"/></g>
      <g stroke="#a5ffe2" fill="none" stroke-width="4">
      <path d="M56 86L63 74L74 80M182 74L193 80L200 94
      M56 170L65 183L77 178M180 182L193 178L199 164"/></g>
    </svg>`,
    { size: 512 },
  );

  const bannerTexture = svg(
    `<svg viewBox="0 0 128 256">
      <path d="M7 0H121V226L94 215L64 250L34 215L7 229Z"
      fill="#367e81" stroke="#e4ce8e" stroke-width="6"/>
      <path d="M18 8H110V203L91 195L64 228L37 195L18 207Z"
      fill="none" stroke="#8dc5ad" stroke-width="3"/>
      <path d="M64 37L76 88L104 73L86 109L111 118L83 129L95 163
      L74 146L64 186L54 146L33 163L45 129L17 118L42 109L24 73L52 88Z"
      fill="#e9d99e"/>
      <path d="M64 81L81 117L64 153L47 117Z" fill="#9de2c7"/>
      <path d="M64 95L74 117L64 139L54 117Z" fill="#397e80"/>
      <path d="M24 24H104" stroke="#e8dba7" stroke-width="4" stroke-dasharray="4 6"/>
    </svg>`,
    { size: 512 },
  );

  // The garden crown and its continuous, inverted mountain.
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

  const mountainParts: ReturnType<typeof b.part>[] = [];

  function mountainLayer(
    upper: V[], factor: number, y: number,
    offsetX: number, offsetZ: number, color: Fill, name: string,
  ): V[] {
    const lower: V[] = upper.map((p) => [
      p[0] * factor + offsetX,
      y + (random() - 0.5) * 0.42,
      p[2] * factor + offsetZ,
    ]);
    const vertices: number[] = [];
    for (let i = 0; i < upper.length; i++) {
      const j = (i + 1) % upper.length;
      vertices.push(...upper[i], ...lower[i], ...upper[j]);
      vertices.push(...upper[j], ...lower[i], ...lower[j]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    mountainParts.push(b.part(geometry, color, {
      at: [0, 0, 0], bone: root, name, flat: true,
    }));
    return lower;
  }

  const turf = mountainLayer(outline, 0.99, 7.49, 0, 0, grassPaint, "living turf rim");
  const shoulder = mountainLayer(turf, 0.94, 6.40, 0.08, 0, rockPaint, "broad upper cliff");
  const middle = mountainLayer(shoulder, 0.69, 4.65, 0.18, -0.22, rockPaint, "hanging mountain");
  const lower = mountainLayer(middle, 0.42, 3.18, 0.30, -0.15, rockPaint, "tapered foundation");
  mountainLayer(lower, 0.045, 2.15, 0.25, 0, rockPaint, "mountain terminal");
  b.slab(outline.map((p) => [p[0], 7.93, p[2]]), {
    thickness: 0.20, color: grassPaint, bone: root, name: "garden crown",
  });

  // A small number of connected buttresses instead of a regular skirt of teeth.
  for (const [x, y, z, sx, sy, sz, tilt] of [
    [-3.15, 5.25, 1.52, 0.79, 1.55, 0.87, -13],
    [-1.72, 4.48, 2.12, 0.85, 1.41, 0.72, 9],
    [1.75, 5.03, 2.14, 0.91, 1.68, 0.83, -8],
    [3.28, 5.93, 0.10, 0.71, 1.15, 0.94, 19],
    [2.15, 4.97, -1.92, 0.85, 1.32, 0.78, -14],
    [-2.45, 5.34, -1.94, 0.84, 1.56, 0.75, 8],
  ]) {
    mountainParts.push(ico([x, y, z], [sx, sy, sz], rockPaint,
      0, [0, 18, tilt], "asymmetric cliff buttress"));
  }

  const cliff = b.surface(mountainParts.slice(1));

  // Drape every mineral line onto the actual rock, not into empty space.
  for (const route of [
    [[-3.4, 7.0, 2.5], [-2.8, 6.55, 2.7], [-2.05, 6.12, 2.8], [-1.75, 5.55, 2.5]],
    [[1.1, 6.6, 3.0], [1.65, 6.10, 2.8], [1.75, 5.45, 2.6], [2.2, 5.0, 2.0]],
    [[3.9, 6.8, 0.7], [3.55, 6.18, 0.5], [3.05, 5.8, 0.2]],
    [[-1.0, 4.1, 1.8], [-0.6, 3.7, 1.45], [0.0, 3.2, 1.0]],
  ] as V[][]) {
    const path = cliff.drape(route, { lift: 0.016 });
    b.sweep(path, 0.047, {
      color: "#649f9f", bone: root, sides: 4, name: "mineral seam border",
    });
    glow(b.sweep(cliff.drape(route, { lift: 0.035 }), 0.017, {
      color: "#a9e7da", bone: root, sides: 4, name: "luminous windstone seam",
    }), 0.6);
  }

  for (const point of [
    [-2.6, 5.8, 2.6], [2.25, 5.6, 2.45], [3.7, 6.35, 0.25],
    [-1.2, 4.0, 1.7], [0.4, 3.2, 1.0],
  ] as V[]) {
    const hit = cliff.nearest(point);
    b.stick(new THREE.ConeGeometry(0.22, 0.56, 5), "#659f9f", hit, {
      embed: 0.48, name: "windstone matrix",
    });
    glow(b.stick(new THREE.ConeGeometry(0.11, 0.43, 5), C.aqua,
      hit, { embed: 0.30, name: "windstone crystal" }), 0.55);
  }

  // Winding spring, stepping stones and a continuous waterfall.
  const stream: V[] = [
    [1.12, 8.04, -2.9], [0.85, 8.055, -1.8],
    [0.70, 8.045, -0.65], [0.22, 8.04, 0.55],
    [-0.42, 8.025, 1.9], [-0.75, 8.00, 3.1],
    [-0.72, 7.98, 3.88],
  ];
  const widths = [0.42, 0.50, 0.60, 0.54, 0.59, 0.68, 0.75];
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
      ico([p[0] + (side === 0 ? -0.12 : 0.12), 8.02, p[2]],
        [0.28 + random() * 0.16, 0.17, 0.38],
        i % 2 ? stonePaint : C.stoneDark, 0,
        [0, random() * 80, 0], "stream bank stone");
    }
  }

  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const z = -2.45 + t * 5.5;
    const x = 1.03 - 1.7 * t;
    b.sweep(bezier(
      [x - 0.23, 8.09, z], [x, 8.10, z + 0.1], [x + 0.20, 8.09, z],
    ), 0.016, {
      color: "#d5f5e6", bone: root, sides: 4, name: "spring ripple",
    });
  }

  function fallAt(t: number, side: number): V {
    const width = 1.46 * (1 - 0.18 * Math.sin(Math.PI * t)) + 0.12 * t * t;
    return [
      -0.72 + 0.20 * Math.sin(t * 4.1) + 0.12 * t * t + side * width / 2,
      7.99 - 6.42 * t,
      3.88 + 0.72 * t * t + 0.10 * Math.sin(t * 4),
    ];
  }

  const steps = 32;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = fallAt(t, -1);
    const c = fallAt(t, 1);
    const thickness = 0.19 - t * 0.07;
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
  const curtain = new THREE.BufferGeometry();
  curtain.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  curtain.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  curtain.setIndex(indices);
  curtain.computeVertexNormals();
  glow(b.part(curtain, "#ffffff", {
    at: [0, 0, 0], bone: root, texture: waterfallTexture,
    name: "unbroken waterfall curtain",
  }), 0.38);

  for (const side of [-1, 1]) {
    const edge: V[] = [];
    for (let i = 0; i <= 16; i++) edge.push(fallAt(i / 16, side));
    glow(b.sweep(edge, [0.035, 0.018], {
      color: "#d4faed", bone: root, sides: 5, name: "silver waterfall edge",
    }), 0.3);
  }

  // Round the spill over the lip without placing a horizontal pipe across it.
  for (let i = 0; i < 7; i++) {
    const x = -1.36 + i * 0.215;
    b.sweep(bezier(
      [x, 8.045, 3.57], [x, 8.07, 3.95], [x, 7.72, 3.91],
    ), 0.035 + (i % 3) * 0.009, {
      color: i % 2 ? C.foam : "#a9ecdf",
      bone: root, sides: 5, name: "rolling spill foam",
    });
  }

  for (let i = 0; i < 18; i++) {
    const t = 0.72 + random() * 0.28;
    const p = fallAt(t, random() > 0.5 ? 1 : -1);
    ico(
      [p[0] + (random() - 0.5) * 0.55, p[1] - random() * 0.4, p[2] + 0.1 + random() * 0.35],
      [0.018, 0.055 + random() * 0.09, 0.018],
      C.foam, 0, [0, 0, -8], "falling water spray",
    );
  }

  // Irregular, round billows hide the waterfall's end and read as cloud, not rubble.
  cloud([-0.58, 1.07, 4.60], [1.25, 0.45, 0.74], C.cloudShade, "mist underside");
  cloud([-0.72, 1.42, 4.59], [0.80, 0.62, 0.67]);
  cloud([-1.46, 1.25, 4.56], [0.69, 0.48, 0.58]);
  cloud([0.18, 1.28, 4.69], [0.78, 0.49, 0.63]);
  cloud([-1.02, 1.77, 4.49], [0.47, 0.52, 0.48]);
  cloud([-0.28, 1.75, 4.52], [0.48, 0.48, 0.47]);
  cloud([-1.95, 1.15, 4.73], [0.58, 0.24, 0.43]);
  cloud([0.95, 1.15, 4.78], [0.69, 0.24, 0.42]);
  cloud([1.49, 1.09, 4.88], [0.40, 0.12, 0.28]);

  // Sanctuary terrace and approach.
  box([-2.1, 8.08, -1.33], [3.75, 0.28, 2.35], C.stoneDark, [0, 0, 0], "sanctuary foundation");
  box([-2.1, 8.25, -1.35], [3.55, 0.18, 2.16], stonePaint, [0, 0, 0], "terrace paving");
  for (let i = 0; i < 3; i++) {
    box([-2.1, 8.015 + i * 0.095, 0.24 - i * 0.31],
      [2.1 - i * 0.1, 0.15, 0.42], stonePaint, [0, 0, 0], "worn approach step");
  }
  for (let i = 0; i < 7; i++) {
    box([-2.15 + Math.sin(i * 0.8) * 0.16, 8.015, 0.8 + i * 0.35],
      [0.77 + random() * 0.25, 0.1, 0.27], stonePaint,
      [0, (random() - 0.5) * 19, 0], "pilgrim paving");
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
    const shaftHeight = height - (broken ? 0.34 : 0.69);
    const center = y + 0.34 + shaftHeight / 2;
    box([x, center, z], [0.56, shaftHeight, 0.58], stonePaint, [0, 0, 0], "pillar shaft");
    for (const s of [-1, 1]) {
      box([x + s * 0.245, center, z + 0.315], [0.065, shaftHeight, 0.06], C.cream);
      box([x + s * 0.245, center, z - 0.315], [0.065, shaftHeight, 0.06], C.stoneShade);
    }
    if (shaftHeight > 0.9) {
      plane([x, center, z + 0.299], [0.36, shaftHeight * 0.88], carving,
        [0, 0, 1], [0, 1, 0], "pillar front relief");
      plane([x + 0.285, center, z], [0.34, shaftHeight * 0.88], carving,
        [1, 0, 0], [0, 1, 0], "pillar side relief");
    }
    if (broken) {
      b.slab([
        [x - 0.28, y + height - 0.03, z - 0.29],
        [x + 0.28, y + height + 0.11, z - 0.29],
        [x + 0.28, y + height + 0.02, z + 0.29],
        [x - 0.28, y + height - 0.06, z + 0.29],
      ], { color: C.ivory, thickness: 0.04, bone: root, name: "broken shaft interior" });
      return;
    }
    box([x, y + height - 0.27, z], [0.69, 0.13, 0.72], C.cream, [0, 0, 0], "capital neck");
    box([x, y + height - 0.12, z], [0.88, 0.20, 0.85], stonePaint, [0, 0, 0], "capital");
    box([x, y + height - 0.33, z], [0.60, 0.045, 0.64], C.gold, [0, 0, 0], "gold fillet");
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
    const outer = i === 8 ? 1.79 : 1.91;
    b.extrude([
      [Math.cos(a0) * radius, Math.sin(a0) * radius],
      [Math.cos(a0) * outer, Math.sin(a0) * outer],
      [Math.cos(a1) * outer, Math.sin(a1) * outer],
      [Math.cos(a1) * radius, Math.sin(a1) * radius],
    ], {
      at: [archX, springY, archZ], x: [1, 0, 0], y: [0, 1, 0],
      thickness: i === 2 ? 0.58 : 0.67, bevel: 0.025, detail: 0.5,
      bone: root, color: i % 3 === 0 ? C.cream : stonePaint,
      name: "ancient arch voussoir",
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
    color: C.gold, bone: root, sides: 4, name: "gold arch inlay",
  });
  box([archX, 12.83, archZ], [0.55, 0.64, 0.83], C.cream, [0, 0, 0], "crown keystone");
  box([archX, 12.89, archZ + 0.43], [0.56, 0.56, 0.08], C.gold, [0, 0, 45], "seal frame");
  glow(plane([archX, 12.89, archZ + 0.478], [0.54, 0.54], sigil,
    [0, 0, 1], [0, 1, 0], "wind-star seal"), 0.55);
  box([archX, 13.28, archZ], [0.82, 0.16, 0.90], stonePaint, [0, 0, 0], "crown cornice");

  for (let row = 0; row < 3; row++) {
    for (let k = 0; k < 3 - (row === 2 ? 1 : 0); k++) {
      box([-3.75 + k * 0.54, 8.54 + row * 0.38, -2.40],
        [0.52, 0.35, 0.47], stonePaint, [0, 0, 0], "broken rear wall");
    }
  }

  box([-2.12, 8.71, -2.18], [1.32, 0.62, 0.64], C.stoneDark, [0, 0, 0], "ancient altar");
  box([-2.12, 9.05, -2.18], [1.57, 0.15, 0.82], C.cream, [0, 0, 0], "altar table");
  glow(plane([-2.12, 8.76, -1.852], [1.1, 0.21], runes,
    [0, 0, 1], [0, 1, 0], "altar inscription"), 0.7);
  torus([-2.12, 9.15, -2.18], 0.34, 0.035, C.gold, [90, 0, 0], "offering ring");

  const relic: V = [-2.12, 10.42, -2.04];
  glow(b.part(new THREE.OctahedronGeometry(1), "#8debd4", {
    at: relic, scale: [0.28, 0.62, 0.25], rotation: [0, 24, 0],
    bone: root, flat: true, name: "suspended wind crystal",
  }), 0.8);
  glow(b.part(new THREE.OctahedronGeometry(1), "#d3ffe9", {
    at: [-2.12, 10.43, -1.82], scale: [0.10, 0.38, 0.055],
    bone: root, name: "crystal bright facet",
  }), 0.8);
  torus(relic, 0.80, 0.025, C.gold, [0, 0, 0], "celestial halo");
  glow(plane([-2.12, 10.42, -2.015], [1.77, 1.77], haloTexture,
    [0, 0, 1], [0, 1, 0], "halo engraving"), 0.55);
  plane([-2.12, 10.42, -2.065], [1.77, 1.77], haloTexture,
    [0, 0, -1], [0, 1, 0], "halo reverse engraving");
  torus(relic, 0.43, 0.023, C.goldLight, [70, 18, 0], "relic orbit");
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
    ico([2.45 + random() * 1.15, 8.10, 2.25 + random() * 0.7],
      [0.13 + random() * 0.16, 0.15, 0.15 + random() * 0.13],
      stonePaint, 0, [0, random() * 90, 0], "masonry chip");
  }
  for (let i = 0; i < 4; i++) {
    box([-0.49 + i * 0.39, 8.16, 0.60], [0.36, 0.18, 0.69],
      stonePaint, [0, 5, (i - 1.5) * 1.5], "stream crossing slab");
  }

  // Short, weathered banner mounted outside the arch, leaving its opening clear.
  rod([-0.68, 10.68, -1.58], [0.26, 10.68, -1.58], 0.034, C.gold, "banner bracket");
  ico([0.28, 10.68, -1.58], [0.07, 0.09, 0.07], C.goldLight, 0, [0, 0, 0], "banner finial");
  b.cards([frame([-0.06, 10.66, -1.58], [0, -1, 0])], bannerTexture, {
    size: [0.54, 1.12], lean: 7, bend: 20, flow: [0, 0, 1],
    sink: 0, bone: root, name: "embroidered sanctuary pennant",
  });

  // Wind-bent elder: the bark pattern remains on the trunk instead of hovering.
  const trunkPoints: V[] = [
    [2.65, 7.98, -1.58], [2.62, 8.65, -1.55],
    [2.35, 9.48, -1.51], [2.40, 10.27, -1.62],
    [2.74, 11.17, -1.79], [2.94, 12.10, -1.87],
  ];
  b.sweep(catmull(trunkPoints), [0.46, 0.39, 0.30, 0.24, 0.17, 0.07], {
    bone: root, color: barkPaint, sides: 7, smooth: false,
    caps: "flat", name: "wind-bent elder trunk",
  });
  for (const tip of [
    [3.57, 8.02, -1.41], [2.95, 8.04, -2.65],
    [1.83, 8.02, -1.96], [2.19, 8.03, -0.66], [3.40, 8.04, -0.94],
  ] as V[]) {
    b.sweep(bezier(
      [2.64, 8.55, -1.57],
      [(tip[0] + 2.64) / 2, 8.08, (tip[2] - 1.57) / 2], tip,
    ), [0.22, 0.025], {
      color: barkPaint, bone: root, sides: 6,
      smooth: false, name: "exposed root",
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
  const leafMasses: ReturnType<typeof b.part>[] = [];
  for (let i = 0; i < crowns.length; i++) {
    const [x, y, z, sx, sy, sz] = crowns[i];
    leafMasses.push(ico([x, y, z], [sx, sy, sz], leafPaint,
      1, [0, i * 37, 0], "broad jade canopy"));
    for (let j = 0; j < 3; j++) {
      const a = j * 2.3 + i;
      leafMasses.push(ico(
        [x + Math.cos(a) * sx * 0.65, y - 0.08, z + Math.sin(a) * sz * 0.65],
        [sx * 0.35, sy * 0.55, sz * 0.37], leafPaint,
        0, [0, random() * 90, 0], "small foliage lobe",
      ));
    }
  }
  b.cards(b.surface(leafMasses).scatter(40, {
    rng: random, minDist: 0.32, filter: (h) => h.n.y > 0.1,
  }), leafTexture, {
    size: [0.15, 0.29], lean: 78, bend: 20,
    flow: [1, 0, 0.3], vary: 0.3, rng: random,
    name: "sunlit leaf pairs",
  });

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
    ico([x, y, z], [sx, sy, sz], leafPaint, 1, [0, 25, 0], "young tree crown");
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
          bone: root, color: random() > 0.5 ? C.jade : C.leaf, name: "ivy leaf",
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
  ], 9);
  vine([
    [-3.15, 7.85, 2.68], [-3.25, 7.32, 2.67],
    [-3.11, 6.85, 2.72], [-2.91, 6.45, 2.66],
  ], 8);

  // Surface-rooted foliage softens a few cliff shoulders.
  const cliffLeaves = cliff.scatter(20, {
    rng: random, minDist: 0.29,
    filter: (h) => h.at.y > 6.9 && h.n.y > -0.2 && Math.abs(h.at.x) > 1.6,
  });
  b.cards(cliffLeaves, leafTexture, {
    size: [0.21, 0.43], lean: 80, bend: 25, flow: [0, -1, 0.2],
    vary: 0.2, rng: random, name: "cliff-edge greenery",
  });

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
    [2.45, 2.9, 0.6], [-3.2, -2.5, 0.55],
  ]) grassClump(x, z, s);

  function flower(x: number, z: number, height: number) {
    rod([x, 8.01, z], [x + 0.025, 8.01 + height, z],
      0.015, C.jade, "flower stem");
    const cy = 8.01 + height;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ico([x + Math.cos(a) * 0.065, cy, z + Math.sin(a) * 0.065],
        [0.074, 0.035, 0.061], i % 2 ? "#f0f1ff" : "#c1d6f2",
        0, [0, a * 180 / Math.PI, 0], "sky flower petal");
    }
    ico([x, cy + 0.023, z], [0.035, 0.025, 0.035],
      C.goldLight, 0, [0, 0, 0], "flower heart");
  }
  for (const [x, z] of [
    [-3.55, 1.06], [-3.31, 0.86], [-3.82, 1.24],
    [1.60, 1.85], [1.86, 1.63], [1.32, 1.91],
    [3.35, -0.15], [3.55, -0.34],
  ]) flower(x, z, 0.20 + random() * 0.13);

  // Small meadow islands of blossoms tie the large flowers to the ground.
  for (const [cx, cz] of [[-3.5, 1.2], [1.6, 1.8], [3.4, -0.2]]) {
    for (let i = 0; i < 9; i++) {
      const a = random() * Math.PI * 2;
      const r = 0.12 + random() * 0.48;
      ico([cx + Math.sin(a) * r, 8.055, cz + Math.cos(a) * r],
        [0.04, 0.025, 0.04], i % 3 ? "#e7edcf" : "#bed9eb",
        0, [0, 0, 0], "meadow blossom");
    }
  }

  function satellite(at: V, scale: number) {
    const [x, y, z] = at;
    ico([x, y - scale * 0.6, z],
      [scale * 0.78, scale, scale * 0.63], rockPaint,
      0, [0, 22, 12], "floating satellite crag");
    ico([x, y, z], [scale * 0.9, scale * 0.19, scale * 0.74],
      grassPaint, 0, [0, 17, 0], "satellite turf");
    ico([x + scale * 0.26, y + scale * 0.17, z - scale * 0.1],
      [scale * 0.23, scale * 0.25, scale * 0.23],
      stonePaint, 0, [0, 0, 0], "satellite stone");
  }
  satellite([-5.1, 6.26, 0.6], 0.66);
  satellite([4.94, 5.14, -0.45], 0.52);
  satellite([-3.15, 3.60, -0.25], 0.34);

  for (const [x, y, z, s] of [
    [1.3, 1.95, -0.3, 0.23], [-0.2, 2.12, -0.9, 0.16],
    [3.0, 3.3, 0.2, 0.19],
  ]) {
    ico([x, y, z], [s * 0.65, s, s * 0.6], C.rockDark,
      0, [18, 23, 9], "weightless stone fragment");
  }

  // A second cloud crosses behind the taper, wrapping the mountain in sky.
  cloud([2.55, 3.06, -1.65], [1.05, 0.32, 0.52], C.cloudShade, "passing cloud underside");
  cloud([3.16, 3.30, -1.68], [0.65, 0.44, 0.48]);
  cloud([2.53, 3.28, -1.66], [0.51, 0.37, 0.45]);
  cloud([3.83, 3.12, -1.65], [0.82, 0.23, 0.42]);
  cloud([4.41, 3.04, -1.62], [0.54, 0.12, 0.31]);

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
```