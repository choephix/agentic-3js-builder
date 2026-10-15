import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  rng,
  svg,
  paint,
  noise,
  mix,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

/*
  1. Corrected the inward-facing cliff and crystal geometry.
  2. Rebuilt the cloud setting as overlapping, rounded cloud banks, not flat stones.
  3. Strengthened the suspended crag with fractured strata and hanging rock spurs.
  4. Repainted the waterfall with continuous flowing ribbons and softer spray.
  5. Added architectural weathering, seated mineral clusters, and richer foliage accents.
*/

export const meta = {
  name: "Sanctuary Above the Clouds",
  description:
    "A sunlit anime-fantasy sanctuary floating above billowing clouds, with carved limestone ruins, golden trees, an aether crystal and a turquoise waterfall.",
};

type Tone = string | Paint;
type P = number[];

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Sanctuary Above the Clouds",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(73129);
  const root = b.joint("island", { at: [0, 0, 0] });

  const C = {
    cliff: "#425d76",
    cliffDark: "#2c405d",
    cliffLight: "#84969a",
    grass: "#6cad86",
    moss: "#438a78",
    cream: "#f1e1b7",
    stoneLight: "#fff0cc",
    stoneShade: "#788f94",
    gold: "#d9af57",
    goldLight: "#ffe6a1",
    teal: "#286b74",
    darkTeal: "#244858",
    cyan: "#58e3e2",
    ice: "#c8fffa",
    water: "#3baebf",
    trunk: "#73524a",
    barkLight: "#b08158",
    leaf: "#e7b94f",
    leafLight: "#ffdd7c",
    leafOrange: "#cb8544",
    white: "#f5fbff",
    cloud: "#dcebf5",
    cloudShadow: "#b9cfdf",
  };

  const cliffPaint = paint((p, n) => {
    const field = noise(p, 0.86, 18);
    const strata = Math.sin(
      p.y * 6.1 + p.x * 0.32 + p.z * 0.49 + noise(p, 1.1, 42) * 1.7,
    );
    let col = mix(C.cliffDark, C.cliffLight, 0.20 + field * 0.48);
    if (strata > 0.68) col = mix(col, "#a9a995", 0.24);
    if (strata < -0.88) col = mix(col, "#263e58", 0.22);
    if (n.y > 0.30) col = mix(col, "#8d9f90", 0.23);
    if (p.y > 3.98 && noise(p, 0.48, 43) > 0.45)
      col = mix(col, C.moss, 0.50);
    return col;
  });

  const stonePaint = paint((p, n) => {
    let col = mix("#b1b9ae", C.cream, 0.45 + noise(p, 0.42, 8) * 0.45);
    col = mix(col, C.stoneLight, Math.max(0, n.y) * 0.28);
    if (p.y < 4.98 && n.y < 0.25)
      col = mix(col, "#6c9c8a", noise(p, 0.22, 29) * 0.26);
    return col;
  });

  const turfPaint = paint((p, n) => {
    let col = mix("#508f7b", "#a4c98c", noise(p, 0.64, 5));
    if (n.y < 0.4) col = mix(col, "#3f746a", 0.45);
    return col;
  });

  const woodPaint = paint((p, n) => {
    const streak = Math.sin(p.y * 2 + noise(p, 0.22, 24) * 12);
    return mix(
      C.trunk,
      C.barkLight,
      0.22 + 0.17 * streak + Math.max(0, n.y) * 0.2,
    );
  });

  // Model-space streaks remain long and continuous down the waterfall.
  const waterPaint = paint((p) => {
    const x =
      p.x +
      Math.sin(p.y * 1.8 + p.x * 5.0) * 0.012 +
      Math.sin(p.y * 3.6) * 0.006;
    const stripe = Math.sin(x * 105);
    const broad = Math.sin(x * 28 + 0.2);
    if (stripe > 0.89) return "#b9fff2";
    if (stripe > 0.62) return "#83efdf";
    return mix("#287da5", "#54cccd", 0.42 + broad * 0.28);
  });

  const rune = svg(
    `<svg viewBox="0 0 100 260">
      <path d="M50 8L78 38L50 68L22 38Z" fill="none" stroke="#746745" stroke-width="9"/>
      <path d="M50 13L70 38L50 61L30 38Z M50 19V56 M36 38H64"
        fill="none" stroke="#a4fff0" stroke-width="4"/>
      <path d="M50 85V115L27 134L50 152L73 134 M27 109V134 M73 109V134
        M50 169V197 M31 180L50 197L69 180 M50 215L36 231L50 247L64 231Z"
        fill="none" stroke="#857a52" stroke-width="9" stroke-linejoin="round"/>
      <path d="M50 85V115L27 134L50 152L73 134 M27 109V134 M73 109V134
        M50 169V197 M31 180L50 197L69 180 M50 215L36 231L50 247L64 231Z"
        fill="none" stroke="#a4fff0" stroke-width="4" stroke-linejoin="round"/>
    </svg>`,
    { size: 512 },
  );

  const sun = svg(
    `<svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="86" fill="#245465" stroke="#d8b667" stroke-width="7"/>
      <circle cx="100" cy="100" r="73" fill="none" stroke="#c5ba82" stroke-width="2"/>
      <path d="M100 21L113 71L155 45L130 87L179 100L130 113L155 155L113 130
        L100 179L87 130L45 155L71 113L21 100L71 87L45 45L87 71Z"
        fill="#e7c66f" stroke="#183e54" stroke-width="4"/>
      <path d="M100 57L129 100L100 143L71 100Z" fill="#95f6df"
        stroke="#fff0b3" stroke-width="4"/>
      <path d="M100 72L115 100L100 128L85 100Z" fill="#258c9e"/>
      <circle cx="100" cy="100" r="6" fill="#f4fff0"/>
    </svg>`,
    { size: 512 },
  );

  const mosaic = svg(
    `<svg viewBox="0 0 400 400">
      <circle cx="200" cy="200" r="191" fill="#557f80" stroke="#f1deb0" stroke-width="9"/>
      <circle cx="200" cy="200" r="169" fill="#ced0b0" stroke="#a69969" stroke-width="6"/>
      <circle cx="200" cy="200" r="142" fill="#557f80" stroke="#f1deb0" stroke-width="4"/>
      <g fill="none" stroke="#d3c595" stroke-width="3">
        <path d="M200 10V58 M200 342V390 M10 200H58 M342 200H390
          M65 65L100 100 M300 300L335 335 M335 65L300 100 M100 300L65 335"/>
        <path d="M200 58L300 100L342 200L300 300L200 342L100 300L58 200L100 100Z"/>
      </g>
      <path d="M200 70L220 155L292 108L245 180L330 200L245 220L292 292L220 245
        L200 330L180 245L108 292L155 220L70 200L155 180L108 108L180 155Z"
        fill="#e5d39a" stroke="#2a6570" stroke-width="6"/>
      <path d="M200 126L247 200L200 274L153 200Z" fill="#6daea3"
        stroke="#f6e8b6" stroke-width="5"/>
      <path d="M200 159L224 200L200 241L176 200Z" fill="#b9f5db"/>
      <g fill="none" stroke="#7b8b7e" stroke-width="3">
        <path d="M44 215L91 224L102 252 M296 92L278 120L291 145
          M214 343L229 317L250 311 M154 29L160 52L143 72"/>
      </g>
    </svg>`,
    { size: 768 },
  );

  const trimTexture = svg(
    `<svg viewBox="0 0 360 64">
      <rect width="360" height="64" fill="#286270"/>
      <path d="M0 7H360 M0 57H360" stroke="#e9ce82" stroke-width="5"/>
      <g fill="none" stroke="#d7bc74" stroke-width="4">
        <path d="M-30 32L0 14L30 32L0 50Z M30 32L60 14L90 32L60 50Z
          M90 32L120 14L150 32L120 50Z M150 32L180 14L210 32L180 50Z
          M210 32L240 14L270 32L240 50Z M270 32L300 14L330 32L300 50Z
          M330 32L360 14L390 32L360 50Z"/>
      </g>
      <g fill="#a8e9cb">
        <path d="M0 25L7 32L0 39L-7 32Z M60 25L67 32L60 39L53 32Z
          M120 25L127 32L120 39L113 32Z M180 25L187 32L180 39L173 32Z
          M240 25L247 32L240 39L233 32Z M300 25L307 32L300 39L293 32Z"/>
      </g>
    </svg>`,
    { size: 768 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 80 112">
      <path d="M40 108C39 88 3 76 7 44C10 24 31 10 44 3
        C46 19 79 30 74 58C70 86 44 87 40 108Z"
        fill="#ffda70" stroke="#b78437" stroke-width="3"/>
      <path d="M40 103Q49 61 44 13 M44 69L18 49 M47 49L64 35
        M43 84L64 66" fill="none" stroke="#fff1aa" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const grassTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M13 120L9 50L33 97L27 18L49 88L60 2L68 87L91 34L81 120Z"
        fill="#7ebc84"/>
      <path d="M30 120L27 58L48 112L60 34L61 120 M72 120L85 72L79 120Z"
        fill="#cee3a0"/>
    </svg>`,
    { size: 256 },
  );

  const flowerTexture = svg(
    `<svg viewBox="0 0 100 128">
      <path d="M48 128L52 46 M49 101Q18 100 21 77Q44 78 49 101
        M50 84Q81 82 79 61Q57 62 50 84"
        fill="#64a78c" stroke="#3c8276" stroke-width="3"/>
      <g fill="#eef9df" stroke="#b4dfd3" stroke-width="2">
        <ellipse cx="50" cy="28" rx="12" ry="22"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(72 50 43)"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(144 50 43)"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(216 50 43)"/>
        <ellipse cx="50" cy="28" rx="12" ry="22" transform="rotate(288 50 43)"/>
      </g>
      <circle cx="50" cy="43" r="11" fill="#f0c866"/>
      <circle cx="47" cy="40" r="4" fill="#fff2b8"/>
    </svg>`,
    { size: 256 },
  );

  const crackTexture = svg(
    `<svg viewBox="0 0 128 200">
      <path d="M80 0L67 39L79 67L48 91L54 123L31 158L39 200
        M76 66L104 74L128 65 M53 122L81 137L85 163
        M49 91L21 84L0 96"
        fill="none" stroke="#758c89" stroke-width="4" stroke-linejoin="bevel"/>
      <path d="M84 0L71 39L83 67 M58 125L35 160L43 200"
        fill="none" stroke="#fff0ce" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  function box(
    at: P,
    size: P,
    color: Tone,
    rotation: P = [0, 0, 0],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function rock(at: P, scale: P, color: Tone, spin = 0) {
    return b.part(new THREE.IcosahedronGeometry(1, 0), color, {
      at,
      scale,
      rotation: [11, spin, 8],
      bone: root,
      flat: true,
    });
  }

  function ball(at: P, scale: P, color: Tone, detail = 0) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at,
      scale,
      bone: root,
      flat: true,
    });
  }

  function cloudPuff(at: P, scale: P, color: string) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at,
      scale,
      bone: root,
      name: "cloud_puff",
    });
  }

  function line(a: P, end: P, radius: number, color: Tone) {
    return b.rod(a, end, radius, {
      color,
      bone: root,
      sides: 6,
      caps: "flat",
    });
  }

  function picture(
    at: P,
    size: P,
    texture: THREE.Texture,
    normal: P = [0, 0, 1],
    up: P = [0, 1, 0],
    luminous = false,
  ) {
    const part = b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      bone: root,
      dir: normal,
      up,
      axis: "z",
      texture,
    });
    if (luminous) glow(part, 0.55);
    return part;
  }

  function ring(
    at: P,
    radius: number,
    tube: number,
    color: Tone,
    normal: P = [0, 1, 0],
    arc = Math.PI * 2,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 32, arc), color, {
      at,
      bone: root,
      dir: normal,
      axis: "z",
    });
  }

  function triangleGeometry(vertices: number[], reverse = false) {
    if (reverse) {
      for (let i = 0; i < vertices.length; i += 9) {
        for (let k = 0; k < 3; k++) {
          const saved = vertices[i + 3 + k];
          vertices[i + 3 + k] = vertices[i + 6 + k];
          vertices[i + 6 + k] = saved;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geo.computeVertexNormals();
    return geo;
  }

  function crystal(at: P, radius: number, height: number, color: string) {
    const [x, y, z] = at;
    const points: P[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      points.push([
        x + Math.cos(a) * radius,
        y,
        z + Math.sin(a) * radius,
      ]);
    }
    const vertices: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = points[i];
      const next = points[(i + 1) % 6];
      vertices.push(
        ...next, ...a, x, y + height * 0.68, z,
        ...a, ...next, x, y - height * 0.32, z,
      );
    }
    return b.part(triangleGeometry(vertices), color, {
      at: [0, 0, 0],
      bone: root,
      flat: true,
      name: "aether_crystal",
    });
  }

  // The irregular shell is deliberately broad at its crown and fractured below.
  const N = 13;
  const rim: P[] = [];
  const radii = Array.from({ length: N }, () => 0.92 + random() * 0.16);
  const levels = [
    [1.01, 0.14],
    [1.53, 0.95],
    [2.32, 1.93],
    [3.27, 2.94],
    [4.16, 3.65],
    [4.51, 3.85],
  ];
  const shell: P[][] = levels.map(([y, r], k) =>
    Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      const fracture =
        k > 0 && k < 5 ? 1 + Math.sin(i * 2.1 + k * 0.8) * 0.055 : 1;
      return [
        Math.cos(a) * r * radii[i] * fracture + (k < 3 ? -0.30 : 0),
        y +
          (k === 0 || k === levels.length - 1
            ? 0
            : (random() - 0.5) * 0.36),
        Math.sin(a) * r * radii[i] * 0.83 * fracture,
      ];
    }),
  );

  const cliffVertices: number[] = [];
  for (let j = 0; j < shell.length - 1; j++) {
    for (let i = 0; i < N; i++) {
      const k = (i + 1) % N;
      cliffVertices.push(
        ...shell[j][i], ...shell[j + 1][k], ...shell[j + 1][i],
        ...shell[j][i], ...shell[j][k], ...shell[j + 1][k],
      );
    }
  }
  for (let i = 0; i < N; i++) {
    const k = (i + 1) % N;
    cliffVertices.push(
      ...shell[0][k], ...shell[0][i], -0.30, 0.99, 0,
      ...shell[5][i], ...shell[5][k], 0, 4.51, 0,
    );
    rim.push([shell[5][i][0], 4.60, shell[5][i][2]]);
  }

  const cliff = b.part(
    triangleGeometry(cliffVertices, true),
    cliffPaint,
    {
      bone: root,
      at: [0, 0, 0],
      flat: true,
      name: "great_suspended_crag",
    },
  );

  const turf = b.slab(rim.slice().reverse(), {
    color: turfPaint,
    thickness: 0.20,
    bone: root,
    name: "grassy_island_crown",
  });

  // Less regular than a necklace of boulders: broad ledges and long root-spurs.
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    const r = 3.35 + random() * 0.30;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.83;
    if (x > 0.60 && x < 1.95 && z > 2.35) continue;
    rock(
      [x, 4.10 - random() * 0.17, z],
      [
        0.44 + random() * 0.23,
        0.28 + random() * 0.26,
        0.39 + random() * 0.18,
      ],
      cliffPaint,
      i * 31,
    );
    if (i % 3 === 0) {
      rock(
        [x * 0.98, 4.51, z * 0.98],
        [0.41, 0.10, 0.30],
        turfPaint,
        i * 31,
      );
    }
  }

  for (const p of [
    [-2.66, 3.22, 0.92, 0.59, 1.63],
    [2.62, 3.09, 0.42, 0.55, 1.79],
    [-1.65, 2.38, -0.78, 0.47, 1.53],
    [0.52, 2.57, -1.81, 0.51, 1.49],
    [-0.48, 1.66, 0.26, 0.43, 1.19],
  ]) {
    b.part(new THREE.ConeGeometry(p[3], p[4], 5), cliffPaint, {
      at: [p[0], p[1], p[2]],
      bone: root,
      rotation: [180, p[0] * 27, 0],
      flat: true,
      name: "hanging_stone_spur",
    });
  }

  const cliffSurface = b.surface(cliff);
  for (const hit of cliffSurface.scatter(13, {
    rng: rng(143),
    minDist: 0.68,
    filter: (h) =>
      h.n.y > -0.25 && h.at.y > 1.8 && h.at.y < 3.8,
  })) {
    b.stick(new THREE.IcosahedronGeometry(1, 0), cliffPaint, hit, {
      scale: [0.22, 0.15, 0.40],
      embed: 0.40,
    });
  }

  // Each mineral cluster is seated on an actual outward-facing cliff hit.
  for (const target of [
    [-2.15, 2.65, 1.40],
    [2.25, 2.90, 0.85],
    [-1.25, 3.20, 2.05],
  ]) {
    const hit = cliffSurface.nearest(target);
    for (let i = 0; i < 3; i++) {
      const h = 0.35 + random() * 0.28;
      const p = hit.at.clone().addScaledVector(hit.n, 0.035);
      p.x += (i - 1) * 0.15;
      p.y += h * 0.19 + Math.sin(i) * 0.055;
      glow(
        crystal(
          [p.x, p.y, p.z],
          0.075 + random() * 0.028,
          h,
          i === 1 ? "#b9f9e9" : "#5fc7ca",
        ),
        0.40,
      );
    }
  }

  const GX = -0.72;
  const GZ = -0.91;

  b.part(new THREE.CylinderGeometry(1.49, 1.60, 0.20, 12), stonePaint, {
    bone: root,
    at: [GX, 4.79, -0.22],
    name: "sanctuary_dais",
  });
  b.part(new THREE.CylinderGeometry(1.36, 1.40, 0.075, 12), C.cream, {
    bone: root,
    at: [GX, 4.92, -0.22],
  });
  picture(
    [GX, 4.962, -0.22],
    [2.55, 2.55],
    mosaic,
    [0, 1, 0],
    [0, 0, -1],
  );
  ring([GX, 4.97, -0.22], 1.34, 0.017, C.gold);

  for (let i = 0; i < 3; i++) {
    box(
      [GX, 4.71 + i * 0.065, 1.41 - i * 0.27],
      [1.54 - i * 0.09, 0.16, 0.35],
      stonePaint,
      [0, 0, 0],
      `sanctuary_step_${i + 1}`,
    );
    line(
      [GX - 0.66 + i * 0.035, 4.797 + i * 0.065, 1.56 - i * 0.27],
      [GX + 0.66 - i * 0.035, 4.797 + i * 0.065, 1.56 - i * 0.27],
      0.012,
      C.gold,
    );
  }

  for (let i = 0; i < 6; i++) {
    box(
      [GX - 0.13 + Math.sin(i * 1.8) * 0.14, 4.718, 1.85 + i * 0.22],
      [0.56 + random() * 0.17, 0.075, 0.21],
      stonePaint,
      [0, (random() - 0.5) * 14, 0],
    );
  }

  const pillarY = 4.95;
  const springY = 7.18;
  const archR = 1.18;
  const pillarXs = [GX - archR, GX + archR];

  for (let side = 0; side < 2; side++) {
    const x = pillarXs[side];
    box([x, pillarY + 0.13, GZ], [0.86, 0.26, 0.90], stonePaint);
    box([x, pillarY + 0.31, GZ], [0.69, 0.13, 0.74], C.stoneLight);
    box([x, 6.13, GZ], [0.53, 1.78, 0.57], stonePaint);
    box([x, 6.16, GZ + 0.296], [0.30, 1.42, 0.025], C.teal);

    for (const s of [-1, 1]) {
      box(
        [x + s * 0.225, 6.16, GZ + 0.30],
        [0.045, 1.65, 0.043],
        C.gold,
      );
    }

    picture(
      [x, 6.16, GZ + 0.315],
      [0.27, 1.26],
      rune,
      [0, 0, 1],
      [0, 1, 0],
      true,
    );

    for (const q of [-1, 0, 1]) {
      box(
        [x + q * 0.13, 6.18, GZ - 0.29],
        [0.038, 1.35, 0.022],
        C.stoneShade,
      );
    }

    box([x, 7.05, GZ], [0.66, 0.16, 0.72], C.gold);
    box([x, 7.18, GZ], [0.83, 0.16, 0.83], stonePaint);
    picture([x, 7.105, GZ + 0.372], [0.63, 0.11], trimTexture);

    for (const h of [5.37, 6.92]) {
      box([x, h, GZ + 0.30], [0.60, 0.06, 0.055], C.goldLight);
    }

    picture(
      [x + (side === 0 ? -0.13 : 0.13), 5.80, GZ + 0.291],
      [0.20, 0.49],
      crackTexture,
    );

    for (const yy of [5.35, 6.96]) {
      box(
        [x, yy, GZ + 0.35],
        [0.105, 0.105, 0.055],
        C.goldLight,
        [0, 0, 45],
      );
    }
  }

  // Complete central arch; chipped outer blocks distinguish it from a new gate.
  const wedgeCount = 11;
  for (let i = 0; i < wedgeCount; i++) {
    const a0 = (i / wedgeCount) * Math.PI + 0.009;
    const a1 = ((i + 1) / wedgeCount) * Math.PI - 0.009;
    const outer =
      archR + 0.38 + (i === 2 ? 0.095 : i === 8 ? -0.085 : 0);
    const inner = archR - 0.24;
    b.extrude(
      [
        [Math.cos(a0) * inner, Math.sin(a0) * inner],
        [Math.cos(a0) * outer, Math.sin(a0) * outer],
        [Math.cos(a1) * outer, Math.sin(a1) * outer],
        [Math.cos(a1) * inner, Math.sin(a1) * inner],
      ],
      {
        at: [GX, springY, GZ],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.60,
        color: i === 5 ? C.gold : stonePaint,
        bone: root,
        name: `arch_voussoir_${i + 1}`,
      },
    );
  }

  for (const r of [archR - 0.16, archR + 0.29]) {
    const pts: P[] = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      pts.push([
        GX + Math.cos(a) * r,
        springY + Math.sin(a) * r,
        GZ + 0.313,
      ]);
    }
    b.sweep(pts, 0.019, {
      color: C.gold,
      bone: root,
      sides: 6,
      caps: "flat",
    });
  }

  for (const p of [
    [GX - 0.87, 8.08, GZ + 0.306],
    [GX + 0.98, 7.76, GZ + 0.306],
  ]) {
    picture(p, [0.15, 0.38], crackTexture);
  }

  const crestY = springY + archR + 0.08;
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.11, 12), C.gold, {
    at: [GX, crestY, GZ + 0.34],
    dir: [0, 0, 1],
    bone: root,
  });
  picture([GX, crestY, GZ + 0.401], [0.61, 0.61], sun);
  rock(
    [GX - 0.52, 8.59, GZ],
    [0.24, 0.15, 0.32],
    stonePaint,
    21,
  );
  rock(
    [GX + 0.25, 8.69, GZ - 0.06],
    [0.21, 0.12, 0.29],
    stonePaint,
    92,
  );

  // The opening stays entirely clear around the suspended focal crystal.
  glow(crystal([GX, 6.38, GZ + 0.08], 0.23, 1.10, "#71e7dc"), 0.85);
  glow(
    crystal([GX - 0.065, 6.42, GZ + 0.19], 0.055, 0.68, "#d9fff1"),
    0.75,
  );
  ring(
    [GX, 6.15, GZ + 0.08],
    0.43,
    0.025,
    C.gold,
    [0.18, 1, 0.30],
  );
  glow(
    ring(
      [GX, 6.15, GZ + 0.08],
      0.50,
      0.012,
      C.cyan,
      [0.18, 1, 0.30],
    ),
    0.35,
  );

  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 0.4;
    glow(
      ball(
        [
          GX + Math.cos(a) * 0.46,
          6.16 + Math.sin(a) * 0.10,
          GZ + 0.08 + Math.sin(a) * 0.46,
        ],
        [0.035, 0.035, 0.035],
        C.ice,
      ),
      0.8,
    );
  }

  for (const side of [-1, 1]) {
    const x = GX + side * 1.73;
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < (row === 2 ? 1 : 2); k++) {
        box(
          [x + side * k * 0.53, 4.86 + row * 0.29, -1.40],
          [0.51, 0.27, 0.45],
          stonePaint,
          [0, (random() - 0.5) * 5, row === 2 ? side * 7 : 0],
        );
      }
    }
    box(
      [x + side * 0.20, 4.82, -1.10],
      [1.10, 0.20, 0.68],
      stonePaint,
    );
    rock(
      [x + side * 0.45, 5.24, -1.40],
      [0.29, 0.17, 0.26],
      stonePaint,
      49,
    );
  }

  // A broken rear column gives the ruins an asymmetrical secondary silhouette.
  box([-1.76, 4.84, -2.28], [0.65, 0.24, 0.67], stonePaint);
  box([-1.76, 5.20, -2.28], [0.43, 0.55, 0.44], stonePaint);
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.22, 0.37],
      [0.08, 0.30],
      [-0.03, 0.45],
      [-0.22, 0.34],
    ],
    {
      at: [-1.76, 5.45, -2.28],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.44,
      bone: root,
      color: stonePaint,
    },
  );

  box([-2.66, 4.83, 0.08], [0.62, 0.22, 0.64], stonePaint);
  box(
    [-2.66, 5.10, 0.08],
    [0.43, 0.35, 0.45],
    stonePaint,
    [0, 9, -4],
  );
  box(
    [-2.49, 4.88, 0.78],
    [0.48, 0.44, 1.07],
    stonePaint,
    [0, -22, 0],
  );
  box(
    [-2.32, 5.03, 1.21],
    [0.64, 0.14, 0.62],
    C.cream,
    [19, -22, 0],
  );
  for (let i = 0; i < 5; i++) {
    rock(
      [
        -2.65 + random() * 0.90,
        4.76 + random() * 0.04,
        0.40 + random() * 1.05,
      ],
      [
        0.10 + random() * 0.11,
        0.07 + random() * 0.06,
        0.11 + random() * 0.12,
      ],
      stonePaint,
      random() * 180,
    );
  }

  const poolOutline: P[] = [
    [0.40, 4.72, 0.81],
    [0.80, 4.72, 0.48],
    [1.56, 4.72, 0.47],
    [2.09, 4.72, 0.83],
    [2.13, 4.72, 1.43],
    [1.74, 4.72, 1.85],
    [1.58, 4.72, 2.75],
    [1.73, 4.72, 3.00],
    [0.76, 4.72, 3.07],
    [0.88, 4.72, 2.66],
    [0.99, 4.72, 1.91],
    [0.39, 4.72, 1.52],
  ];
  b.slab(poolOutline.slice().reverse(), {
    thickness: 0.06,
    color: C.darkTeal,
    bone: root,
    name: "spring_pool_basin",
  });
  const waterOutline = poolOutline.map((p) => [
    1.24 + (p[0] - 1.24) * 0.94,
    4.758,
    1.20 + (p[2] - 1.20) * 0.98,
  ]);
  b.slab(waterOutline.slice().reverse(), {
    thickness: 0.022,
    color: C.water,
    bone: root,
    name: "turquoise_spring",
  });

  for (let i = 0; i < 11; i++) {
    const p = poolOutline[i];
    if (p[2] > 2.6) continue;
    rock(
      [p[0], 4.77, p[2]],
      [0.19, 0.105, 0.17],
      stonePaint,
      i * 27,
    );
  }

  for (const rr of [0.20, 0.34, 0.52]) {
    ring(
      [1.33, 4.781, 1.06],
      rr,
      0.008,
      "#a1eadc",
      [0, 1, 0],
      Math.PI * 1.63,
    );
  }

  for (let i = 0; i < 5; i++) {
    const z = 1.73 + i * 0.22;
    b.sweep(
      bezier(
        [1.15, 4.784, z],
        [1.31, 4.787, z + 0.045],
        [1.45, 4.784, z + 0.025],
      ),
      0.007,
      { color: "#9fe9db", bone: root, sides: 4, caps: "flat" },
    );
  }

  const leftFall: P[] = [
    [0.85, 4.77, 2.86],
    [0.84, 4.68, 3.16],
    [0.84, 4.35, 3.34],
    [0.88, 3.48, 3.40],
    [0.93, 2.40, 3.44],
    [0.97, 1.42, 3.51],
    [0.84, 0.85, 3.65],
  ];
  const rightFall: P[] = [
    [1.64, 4.77, 2.86],
    [1.66, 4.68, 3.16],
    [1.70, 4.35, 3.34],
    [1.72, 3.48, 3.40],
    [1.66, 2.40, 3.44],
    [1.66, 1.42, 3.51],
    [1.83, 0.85, 3.65],
  ];
  b.membrane(leftFall, rightFall, {
    color: waterPaint,
    thickness: 0.045,
    rows: 10,
    cols: 18,
    bone: root,
    name: "falling_skywater",
  });

  // Long, explicitly curved filaments supply the broad highlights.
  for (let i = 0; i < 7; i++) {
    const u = (i + 0.5) / 7;
    const x = 0.85 + u * 0.82;
    const path = catmull([
      [x, 4.70, 3.17],
      [x + 0.025, 4.32, 3.38],
      [x + 0.035 * Math.sin(i), 3.18, 3.45],
      [x + (u - 0.5) * 0.075, 1.95, 3.51],
      [x + (u - 0.5) * 0.17, 0.98, 3.66],
    ]);
    const stream = b.sweep(path, i % 3 === 0 ? 0.014 : 0.008, {
      color: i % 3 === 0 ? C.ice : "#92f4e9",
      bone: root,
      sides: 4,
      caps: "flat",
    });
    if (i % 3 === 0) glow(stream, 0.25);
  }

  for (let i = 0; i < 8; i++) {
    const x = 0.88 + random() * 0.8;
    cloudPuff(
      [x, 4.76 + random() * 0.04, 3.05 + random() * 0.14],
      [0.075, 0.035, 0.085],
      i % 2 ? C.ice : C.white,
    );
  }

  // White spray blends into a single cloud bank at the waterfall's foot.
  for (let i = 0; i < 9; i++) {
    const a = random() * Math.PI * 2;
    const d = 0.17 + random() * 0.45;
    cloudPuff(
      [
        1.32 + Math.cos(a) * d,
        0.71 + random() * 0.27,
        3.60 + Math.sin(a) * d * 0.60,
      ],
      [
        0.20 + random() * 0.17,
        0.15 + random() * 0.12,
        0.22 + random() * 0.12,
      ],
      i % 3 === 0 ? C.cloud : C.white,
    );
  }

  for (let i = 0; i < 9; i++) {
    const y = 1.1 + random() * 2.8;
    const x =
      i % 2
        ? 0.70 - random() * 0.12
        : 1.86 + random() * 0.16;
    glow(
      ball(
        [x, y, 3.48 + random() * 0.15],
        [0.022, 0.060, 0.022],
        C.ice,
      ),
      0.25,
    );
  }

  function tree(base: P, size: number, seed: number) {
    const r = rng(seed);
    const [x, y, z] = base;
    const pt = (dx: number, dy: number, dz: number): P => [
      x + dx * size,
      y + dy * size,
      z + dz * size,
    ];

    b.sweep(
      catmull([
        pt(0, -0.05, 0),
        pt(-0.16, 0.58, 0.03),
        pt(-0.12, 1.20, -0.05),
        pt(0.12, 1.89, 0),
        pt(0.29, 2.44, -0.08),
      ]),
      [
        0.26 * size,
        0.22 * size,
        0.16 * size,
        0.10 * size,
        0.026 * size,
      ],
      {
        color: woodPaint,
        bone: root,
        sides: 7,
        name: `tree_${seed}_trunk`,
      },
    );

    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.sweep(
        catmull([
          pt(-0.05, 0.31, 0),
          pt(Math.cos(a) * 0.27, 0.08, Math.sin(a) * 0.27),
          pt(Math.cos(a) * 0.64, 0.015, Math.sin(a) * 0.57),
        ]),
        [0.12 * size, 0.07 * size, 0.014 * size],
        { color: woodPaint, bone: root, sides: 6 },
      );
    }

    const foliage: ReturnType<typeof ball>[] = [];
    const branches = [
      [-0.88, 1.81, 0.03],
      [0.89, 2.09, 0.12],
      [-0.45, 2.55, -0.42],
      [0.65, 2.77, -0.27],
      [0.13, 2.88, 0.34],
      [-0.66, 2.20, 0.62],
    ];

    for (let i = 0; i < branches.length; i++) {
      const [dx, dy, dz] = branches[i];
      b.sweep(
        [
          pt(-0.09 + i * 0.025, 0.97 + i * 0.19, -0.01),
          pt(dx * 0.62, dy - 0.35, dz * 0.68),
          pt(dx, dy, dz),
        ],
        [0.105 * size, 0.060 * size, 0.018 * size],
        { color: woodPaint, bone: root, sides: 6 },
      );
      b.sweep(
        [
          pt(dx * 0.60, dy - 0.36, dz * 0.67),
          pt(dx + 0.28, dy + 0.10, dz - 0.22),
        ],
        [0.045 * size, 0.008 * size],
        { color: woodPaint, bone: root, sides: 5 },
      );

      foliage.push(
        ball(
          pt(dx, dy + 0.13, dz),
          [
            (0.67 + r() * 0.12) * size,
            (0.34 + r() * 0.10) * size,
            0.58 * size,
          ],
          i % 3 === 0 ? C.leafOrange : C.leaf,
          1,
        ),
      );
      foliage.push(
        ball(
          pt(dx - 0.08, dy + 0.37, dz - 0.07),
          [0.53 * size, 0.29 * size, 0.48 * size],
          i % 2 ? C.leafLight : "#f2c65d",
        ),
      );
    }

    const leafHits = b.surface(foliage).scatter(90, {
      rng: rng(seed + 200),
      minDist: 0.14 * size,
      filter: (h) => h.n.y > -0.30,
    });
    b.cards(leafHits, leafTexture, {
      size: [0.17 * size, 0.27 * size],
      lean: 62,
      bend: 20,
      vary: 0.30,
      flow: [0.3, -0.4, 1],
      rng: rng(seed + 500),
      sink: 0.16,
    });
  }

  tree([2.36, 4.70, -1.08], 1.03, 28);
  tree([-2.76, 4.70, -0.63], 0.67, 59);

  for (const p of [
    [2.61, 4.78, 1.19],
    [2.82, 4.78, 0.62],
    [-2.26, 4.77, -2.05],
    [-1.94, 4.76, -2.30],
    [-2.58, 4.76, 1.64],
  ]) {
    ball(p, [0.35, 0.23, 0.30], C.moss);
    ball(
      [p[0] + 0.17, p[1] + 0.13, p[2] - 0.05],
      [0.25, 0.18, 0.23],
      "#79b294",
    );
  }

  const grassSurface = b.surface(turf);
  const grassHits = grassSurface.scatter(105, {
    rng: rng(74),
    minDist: 0.25,
    filter: (h) => {
      if (h.n.y < 0.8) return false;
      const p = h.at;
      if (p.x > 0.25 && p.x < 2.30 && p.z > 0.25) return false;
      if (Math.hypot(p.x - GX, p.z + 0.22) < 1.65) return false;
      if (p.x > -1.3 && p.x < -0.1 && p.z > 1.3) return false;
      return true;
    },
  });
  b.cards(grassHits, grassTexture, {
    size: [0.22, 0.32],
    cross: true,
    lean: 8,
    vary: 0.40,
    spin: 40,
    rng: rng(76),
    flow: [0, 0, 1],
  });

  const flowerHits = grassSurface.scatter(26, {
    rng: rng(272),
    minDist: 0.25,
    filter: (h) =>
      h.n.y > 0.8 &&
      ((h.at.x < -1.5 && h.at.z > 0.7) ||
        (h.at.x > 2.20 && h.at.z > -0.3)),
  });
  b.cards(flowerHits, flowerTexture, {
    size: [0.18, 0.29],
    lean: 0,
    cross: true,
    vary: 0.25,
    rng: rng(273),
    flow: [0, 0, 1],
  });

  // Selected rooted vines add age without carpeting the cliff.
  for (let i = 0; i < 7; i++) {
    const a = 0.1 + i * 0.62;
    const x = Math.cos(a) * 3.52;
    const z = Math.sin(a) * 2.90;
    if (x > 0.5 && z > 2.0) continue;
    const drop = 0.46 + random() * 0.81;
    const vine = catmull([
      [x * 0.95, 4.67, z * 0.95],
      [x, 4.27, z],
      [x * 0.98 + 0.05, 4.35 - drop, z * 1.01],
    ]);
    b.sweep(vine, 0.018, {
      color: C.moss,
      bone: root,
      sides: 5,
    });
    for (let k = 0; k < 4; k++) {
      const p = vine.at(0.25 + k * 0.18);
      ball(
        [p.x + (k % 2 ? 0.07 : -0.07), p.y, p.z + 0.02],
        [0.105, 0.055, 0.075],
        k % 2 ? "#7fb28b" : C.moss,
      );
    }
  }

  // The lantern is placed beside the rear wall, clear of the crystal opening.
  const lx = 1.22;
  const lz = -2.15;
  box([lx, 4.84, lz], [0.58, 0.25, 0.58], stonePaint);
  box([lx, 5.06, lz], [0.39, 0.20, 0.39], stonePaint);
  box([lx, 5.22, lz], [0.55, 0.12, 0.55], C.gold);
  glow(
    box([lx, 5.48, lz], [0.30, 0.44, 0.30], "#c0ffdb"),
    0.85,
  );
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      box(
        [lx + sx * 0.19, 5.47, lz + sz * 0.19],
        [0.055, 0.49, 0.055],
        C.teal,
      );
    }
  }
  box([lx, 5.74, lz], [0.55, 0.12, 0.55], C.gold);
  b.part(new THREE.ConeGeometry(0.44, 0.30, 4), stonePaint, {
    at: [lx, 5.94, lz],
    rotation: [0, 45, 0],
    bone: root,
    flat: true,
  });
  crystal([lx, 6.14, lz], 0.06, 0.20, C.goldLight);

  // Two intentional orbiting fragments, close enough to belong to the island.
  for (const info of [
    [-3.85, 3.02, -0.82, 0.43],
    [3.67, 2.53, -1.18, 0.31],
  ]) {
    const [x, y, z, s] = info;
    rock(
      [x, y, z],
      [s, s * 0.72, s * 0.72],
      cliffPaint,
      x * 49,
    );
    rock(
      [x + 0.02, y + s * 0.49, z],
      [s * 0.88, s * 0.14, s * 0.66],
      turfPaint,
    );
    if (s > 0.4) {
      box(
        [x, y + 0.40, z],
        [0.27, 0.35, 0.25],
        stonePaint,
        [0, 18, -9],
      );
      box(
        [x - 0.02, y + 0.59, z],
        [0.36, 0.10, 0.34],
        stonePaint,
        [0, 18, -9],
      );
    }
  }

  // Cloud banks form a loose crescent, leaving the crag and falling water legible.
  // Every bank has a rounded common body and overlapping smaller billows.
  const cloudBanks = [
    [-2.63, 0.47, -0.65, 1.25, 0.47, 0.81],
    [-0.90, 0.43, -1.03, 1.42, 0.43, 0.84],
    [1.10, 0.44, -0.95, 1.40, 0.44, 0.87],
    [2.78, 0.49, -0.30, 1.17, 0.49, 0.83],
    [-2.95, 0.42, 0.66, 1.04, 0.42, 0.80],
    [2.82, 0.42, 1.19, 0.96, 0.42, 0.78],
  ];

  for (let i = 0; i < cloudBanks.length; i++) {
    const [x, y, z, sx, sy, sz] = cloudBanks[i];
    cloudPuff([x, y, z], [sx, sy, sz], C.cloud);
    cloudPuff(
      [x - sx * 0.28, y + sy * 0.47, z - 0.09],
      [sx * 0.58, sy * 1.08, sz * 0.69],
      C.white,
    );
    cloudPuff(
      [x + sx * 0.39, y + sy * 0.30, z + 0.06],
      [sx * 0.52, sy * 0.90, sz * 0.67],
      i % 2 ? "#eef8ff" : "#e7f2fa",
    );
    cloudPuff(
      [x - sx * 0.61, y - sy * 0.02, z + sz * 0.24],
      [sx * 0.43, sy * 0.70, sz * 0.58],
      C.cloud,
    );
  }

  // A higher wisp links the waterfall's spray with the surrounding cloud layer.
  cloudPuff(
    [1.37, 0.42, 3.55],
    [0.91, 0.42, 0.60],
    C.cloud,
  );
  cloudPuff(
    [1.62, 0.68, 3.58],
    [0.52, 0.38, 0.46],
    C.white,
  );
  cloudPuff(
    [0.82, 0.53, 3.48],
    [0.44, 0.31, 0.43],
    "#edf8ff",
  );

  b.cards(
    [
      frame([3.30, 6.15, 0.16], [0.4, 1, 0.1]),
      frame([3.70, 5.40, 0.43], [-0.4, 1, 0.2]),
      frame([3.48, 4.72, 1.25], [0.3, 1, 0.4]),
      frame([-3.36, 5.44, 0.34], [-0.2, 1, 0.6]),
      frame([2.20, 6.30, 0.47], [0.6, 1, -0.1]),
    ],
    leafTexture,
    {
      size: [0.13, 0.23],
      lean: 60,
      bend: 20,
      flow: [0.1, -0.3, 1],
      spin: 25,
      rng: rng(944),
    },
  );

  return b.root;
}
