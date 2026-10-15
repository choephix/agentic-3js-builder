import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
} from "../../../../src/index";
import type { Joint, Fill } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aureate Dawn Phoenix",
  description:
    "A regal, jade-eyed phoenix with sculpted flame feathers, luminous golden flight tips, five flowing tails, and an ancient sun-seal perch.",
};

/*
 * Art-direction changes:
 * 1. Replace flat feather sandwiches with solid, folded feather primitives.
 *    Artwork now follows their actual faces, including the reverse side.
 * 2. Seat the wing coverts against the wing, fill the bare throat and thighs,
 *    and give the breast plumage a rounded rather than hanging-panel shape.
 * 3. Enlarge the eyes and head, shorten the beak, and strengthen the brow:
 *    the face remains readable inside the large wing silhouette.
 * 4. Introduce broader, staggered flight feathers, luminous flame tips and
 *    longer, individually shaped tail flames. Keep the cool shrine restrained.
 */

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "AureateDawnPhoenix",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(83017);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const C = {
    burgundy: "#76233e",
    scarlet: "#f15a38",
    orange: "#ff963d",
    gold: "#edbb59",
    pale: "#ffe6a1",
    ivory: "#fff4cb",
    jade: "#75ead5",
    deepJade: "#176b72",
    stoneEdge: "#142431",
  };

  const coat = cel("#f57840", "#ac354a");
  const deepCoat = cel("#d44a44", "#873248");
  const cream = cel("#fff0b6", "#efa55c");
  const gold = cel("#ffdc89", "#bd783e");
  const darkGold = cel("#d09a47", "#794438");
  const stone = paint((p, n) =>
    mix(
      n.y > 0.5 ? "#334b59" : "#172733",
      "#61717a",
      noise(p, 0.19, 5) * 0.22,
    ),
  );

  const primaryTex = svg(
    `<svg viewBox="0 0 100 200">
      <defs>
        <linearGradient id="fire" x1="0" y1="1" x2=".15" y2="0">
          <stop offset="0" stop-color="#9b2844"/>
          <stop offset=".35" stop-color="#e84c35"/>
          <stop offset=".72" stop-color="#ffa844"/>
          <stop offset="1" stop-color="#fff3b6"/>
        </linearGradient>
      </defs>
      <rect width="100" height="200" fill="url(#fire)"/>
      <path d="M50 200 L16 176 L0 124 L13 64 L50 0 L81 60 L100 132 L80 180 Z"
        fill="none" stroke="#ffdb87" stroke-width="3.2"/>
      <path d="M50 190 Q29 135 50 16 Q73 79 65 108 Q59 127 64 144
        Q44 125 50 95 Q35 135 50 190Z" fill="#ffd572"/>
      <path d="M50 183 Q46 127 50 40" stroke="#fff5bf" stroke-width="2.8" fill="none"/>
      <g fill="none" stroke="#ffc66f" stroke-width="2.7" stroke-linecap="round">
        <path d="M47 157 L22 136 L17 116"/>
        <path d="M48 132 L27 108 L26 91"/>
        <path d="M50 108 L36 86"/>
        <path d="M53 164 L78 144 L85 123"/>
        <path d="M54 140 L76 117 L77 98"/>
      </g>
      <path d="M50 56 L56 71 L50 83 L44 71Z" fill="#fff8d3"/>
    </svg>`,
    { size: 384 },
  );

  const covertTex = svg(
    `<svg viewBox="0 0 100 200">
      <defs>
        <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#db573b"/>
          <stop offset=".48" stop-color="#ffb657"/>
          <stop offset="1" stop-color="#fff0b1"/>
        </linearGradient>
      </defs>
      <rect width="100" height="200" fill="url(#g)"/>
      <path d="M50 200 L16 176 L0 124 L13 64 L50 0 L81 60 L100 132 L80 180Z"
        fill="none" stroke="#ffe4a0" stroke-width="3"/>
      <path d="M50 184 Q32 135 50 31 Q71 102 50 128 Q40 108 50 80"
        fill="none" stroke="#fff3c0" stroke-width="4" stroke-linecap="round"/>
      <path d="M26 143 L45 157 M74 143 L55 157 M23 119 L44 139 M77 119 L56 139"
        fill="none" stroke="#d76d3e" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const eyeTex = svg(
    `<svg viewBox="0 0 120 100">
      <path d="M5 56 Q42 7 95 29 L117 14 L107 47 Q78 90 26 73Z" fill="#432439"/>
      <path d="M15 55 Q51 23 99 36 Q77 75 31 66Z" fill="#fff5d2"/>
      <path d="M39 34 Q63 23 83 34 L79 63 Q60 80 41 64Z" fill="#19767d"/>
      <path d="M42 47 Q61 58 80 44 L77 65 Q58 76 43 62Z" fill="#7df3d1"/>
      <ellipse cx="61" cy="49" rx="8" ry="20" fill="#24263a"/>
      <path d="M47 33 L58 32 L57 45 L46 44Z" fill="#fffdf0"/>
      <circle cx="73" cy="59" r="4" fill="#ffffff"/>
      <path d="M13 38 Q54 4 98 18" stroke="#ffe9b0" stroke-width="7"
        fill="none" stroke-linecap="round"/>
      <path d="M24 79 Q64 94 91 70" stroke="#fa9a52" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const sunTex = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#d7ad62">
        <circle cx="128" cy="128" r="120" stroke-width="2"/>
        <circle cx="128" cy="128" r="110" stroke-width="3"/>
        <circle cx="128" cy="128" r="94" stroke-width="2"/>
        <circle cx="128" cy="128" r="78" stroke-width="2"/>
        <path d="M128 26 L146 81 L200 56 L175 110 L230 128 L175 146
          L200 200 L146 175 L128 230 L110 175 L56 200 L81 146
          L26 128 L81 110 L56 56 L110 81Z" stroke-width="3"/>
        <path d="M128 72 L144 112 L184 128 L144 144 L128 184 L112 144
          L72 128 L112 112Z" stroke-width="3"/>
        <circle cx="128" cy="128" r="23" stroke-width="3"/>
      </g>
      <g fill="#f0c87c">
        ${Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 8;
          const x = 128 + Math.sin(a) * 102;
          const y = 128 + Math.cos(a) * 102;
          return `<path d="M${x} ${y - 5} l3 5 l-3 5 l-3 -5Z"/>`;
        }).join("")}
      </g>
    </svg>`,
    { size: 512 },
  );

  const emblemTex = svg(
    `<svg viewBox="0 0 100 160">
      <g fill="none" stroke="#ffe7a3" stroke-linejoin="round">
        <path d="M50 5 Q21 32 34 62 Q5 46 10 24 Q-2 74 36 102
          L50 150 L64 102 Q102 74 90 24 Q95 46 66 62 Q79 32 50 5Z"
          stroke-width="4"/>
        <path d="M50 20 Q33 55 50 82 Q67 55 50 20Z" stroke-width="4"/>
        <path d="M21 71 L41 94 L50 127 L59 94 L79 71" stroke-width="3"/>
      </g>
      <path d="M50 87 L59 101 L50 116 L41 101Z" fill="#8af0d2"/>
    </svg>`,
    { size: 256 },
  );

  const emberTex = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 128 Q-2 100 14 65 Q27 43 21 21 Q44 36 36 57
        Q58 39 47 0 Q81 56 48 91 Q60 114 32 128Z" fill="#ff9e43"/>
      <path d="M31 122 Q10 99 29 76 Q38 64 35 48 Q55 71 38 94
        Q46 106 31 122Z" fill="#ffe6a0"/>
      <path d="M31 119 Q24 103 34 92 Q40 108 31 119Z" fill="#fff8d6"/>
    </svg>`,
    { size: 256 },
  );

  const tailPaint = paint((_p, _n, s) => {
    const t = s[0];
    const across = Math.abs(s[1] - 0.5) * 2;
    if (across > 0.88) return "#ffd279";
    const vein = Math.abs(((t * 8 + across * 0.8) % 1 + 1) % 1 - 0.5);
    if (vein < 0.038 && t > 0.12 && t < 0.88) return "#f8ae55";
    if (across < 0.065) return "#ffe9a3";
    return t < 0.5
      ? mix("#a12d45", "#fa6739", t * 2)
      : mix("#fa6739", "#ffe8a0", (t - 0.5) * 2);
  });

  // Skeleton first.
  const pelvis = b.joint("pelvis", {
    at: [0, 0.99, -0.04],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.99, -0.04], [0, 1.25, 0], [0, 1.53, 0.035]],
    {
      parent: pelvis,
      names: ["spineLower", "chest", "neckBase"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [[0, 1.5, 0.035], [0, 1.7, 0.075], [0, 1.89, 0.17]],
    {
      parent: spine.tip!,
      names: ["neckLower", "neckUpper", "headBase"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.945, 0.195],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.835, 0.295],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const wings = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const chain = b.chain(
      `wing${side}`,
      [
        [s * 0.19, 1.47, -0.025],
        [s * 0.69, 1.69, -0.045],
        [s * 1.17, 1.84, -0.065],
        [s * 1.59, 1.94, -0.075],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    return { s, side, chain };
  });

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.14, 1.03, -0.03],
        [s * 0.195, 0.69, 0.045],
        [s * 0.19, 0.48, -0.045],
        [s * 0.22, 0.235, 0.105],
      ],
      {
        parent: pelvis,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.22, 0.19, 0.19],
      },
    );
    const toes = [-1, 0, 1, 2].map((i) => {
      const back = i === 2;
      const x = s * 0.22;
      const dx = back ? -s * 0.035 : i * 0.065;
      return b.chain(
        `toe${side}${i + 2}`,
        [
          [x, 0.235, 0.105],
          [x + dx * 0.6, 0.22, back ? 0.015 : 0.245],
          [x + dx, 0.213, back ? -0.06 : 0.37 - Math.abs(i) * 0.035],
        ],
        {
          parent: leg.tip!,
          names: [`toe${side}${i + 2}Base`, `toe${side}${i + 2}Tip`],
          role: "digit",
        },
      );
    });
    return { s, leg, toes };
  });

  const tails = [-2, -1, 0, 1, 2].map((i) => {
    const a = Math.abs(i);
    const chain = b.chain(
      `tail${i + 3}`,
      catmull([
        [i * 0.055, 1.075, -0.19],
        [i * 0.15, 0.84, -0.43],
        [i * 0.36, 0.40 + a * 0.055, -0.83],
        [i * 0.54, 0.30 + a * 0.105, -1.18 + a * 0.10],
        [i * 0.61, 0.53 + a * 0.15, -1.58 + a * 0.14],
      ]),
      { parent: pelvis, count: 4, role: "tail" },
    );
    return { i, chain };
  });

  const pedestal = b.joint("sunSeal", {
    parent: pelvis,
    at: [0, 0, 0],
    dir: [0, 1, 0],
  });

  function ellipsoid(
    at: number[],
    scale: number[],
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at,
      scale,
      bone,
      flat: true,
      name,
    });
  }

  /*
   * A feather is one eight-sided, folded solid, not a card hovering over a slab.
   * The central ridge gives the silhouette volume in the side and low views.
   * Its UVs use precisely the same outline as the drawing.
   */
  function feather(
    name: string,
    root: number[],
    tip: number[],
    width: number,
    bone: Joint,
    texture: THREE.Texture = primaryTex,
    depth = 0.035,
  ) {
    const origin = V(root);
    const y = V(tip).sub(origin);
    const length = y.length();
    y.normalize();
    const x = y.clone().cross(new THREE.Vector3(0, 0, 1)).normalize();
    const normal = x.clone().cross(y).normalize();

    const outline = [
      [0, 0],
      [-0.34, 0.12],
      [-0.5, 0.38],
      [-0.37, 0.68],
      [0, 1],
      [0.31, 0.7],
      [0.5, 0.34],
      [0.3, 0.1],
    ];
    const vertices = outline.map(([u, v]) => [
      u * width,
      v * length,
      Math.sin(Math.PI * v) * depth * 0.12,
    ]);
    vertices.push([0, length * 0.44, depth]);
    vertices.push([0, length * 0.44, -depth * 0.48]);

    const positions: number[] = [];
    const uvs: number[] = [];
    function vertex(index: number) {
      const p = vertices[index];
      positions.push(p[0], p[1], p[2]);
      uvs.push(p[0] / width + 0.5, p[1] / length);
    }
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      vertex(8); vertex(j); vertex(i);
      vertex(9); vertex(i); vertex(j);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    const part = b.part(geometry, "#ffffff", {
      at: origin,
      dir: normal,
      up: y,
      axis: "z",
      texture,
      bone,
      name,
    });
    return part;
  }

  // Warm, rounded torso with a fuller forward breast.
  b.sweep(
    spine,
    (t) => [
      0.18 + Math.sin(t * Math.PI) * 0.10 - t * 0.06,
      0.18 + Math.sin(t * Math.PI) * 0.055 - t * 0.04,
    ],
    { color: deepCoat, sides: 10, caps: "round", name: "BreastCore" },
  );
  b.sweep(neck, (t) => [0.132 - t * 0.022, 0.133 - t * 0.018], {
    color: coat,
    sides: 10,
    name: "ArchedNeck",
  });

  const skull = ellipsoid(
    [0, 1.945, 0.195],
    [0.187, 0.19, 0.201],
    coat,
    head,
    "PhoenixSkull",
  );
  ellipsoid(
    [0, 1.855, 0.253],
    [0.128, 0.085, 0.126],
    cream,
    head,
    "CheekBib",
  );

  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around([0, 1.945, 0.195]).at(s * 36, 8);
    b.decal(skull, eyeTex, {
      at: hit,
      size: [0.167, 0.132],
      mirror: s < 0,
      lift: 0.002,
      bone: head,
      name: s > 0 ? "EyeL" : "EyeR",
    });
    feather(
      `TempleFlame${s}`,
      [s * 0.145, 1.975, 0.132],
      [s * 0.342, 2.095, -0.07],
      0.13,
      head,
      covertTex,
      0.026,
    );
    feather(
      `CheekFlame${s}`,
      [s * 0.115, 1.885, 0.23],
      [s * 0.272, 1.855, -0.025],
      0.116,
      head,
      covertTex,
      0.027,
    );
    feather(
      `LowerCheekFlame${s}`,
      [s * 0.10, 1.83, 0.207],
      [s * 0.215, 1.735, 0.065],
      0.09,
      head,
      covertTex,
      0.02,
    );
  }

  b.extrude(
    [
      [0, 0], [0.075, 0.038], [0.158, 0.008], [0.215, -0.046],
      [0.188, -0.107], [0.164, -0.063], [0.028, -0.045],
    ],
    {
      at: [0, 1.905, 0.319],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.081, 0.103],
      color: gold,
      bone: head,
      name: "HookedUpperBeak",
    },
  );
  b.extrude(
    [[0, 0], [0.145, -0.008], [0.164, 0.019], [0.035, 0.029]],
    {
      at: [0, 1.835, 0.328],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.064,
      color: darkGold,
      bone: jaw,
      name: "LowerBeak",
    },
  );
  for (const s of [1, -1]) {
    ellipsoid(
      [s * 0.049, 1.916, 0.385],
      [0.006, 0.007, 0.013],
      C.burgundy,
      head,
      `Nostril${s}`,
    );
  }

  // Crown flames share a solid base and lean back from the unobstructed eyes.
  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    feather(
      `CrownFlame${i + 3}`,
      [i * 0.045, 2.066 - a * 0.012, 0.12 - a * 0.024],
      [i * 0.12, 2.49 - a * 0.083, -0.06 - a * 0.035],
      0.12 - a * 0.011,
      head,
      covertTex,
      0.028,
    );
  }
  b.part(new THREE.OctahedronGeometry(0.047), gold, {
    at: [0, 2.075, 0.343],
    scale: [0.75, 1.14, 0.35],
    bone: head,
    name: "ForeheadGoldSetting",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.032), C.jade, {
      at: [0, 2.075, 0.357],
      scale: [0.68, 1.12, 0.4],
      bone: head,
      name: "ForeheadJade",
    }),
    0.65,
  );

  // Small throat shingles remove the bare, cylindrical neck.
  for (let row = 0; row < 3; row++) {
    for (let i = -1; i <= 1; i++) {
      const y = 1.83 - row * 0.095;
      const z = 0.258 - row * 0.025 - Math.abs(i) * 0.016;
      feather(
        `ThroatFlame${row}_${i + 1}`,
        [i * 0.05, y, z],
        [i * 0.062, y - 0.175, z - 0.015],
        0.088,
        neck.joints[row === 0 ? 1 : 0],
        covertTex,
        0.022,
      );
    }
  }

  // Broad chest feathers wrap around the body instead of forming a flat bib.
  for (let row = 0; row < 3; row++) {
    const y = 1.50 - row * 0.145;
    for (let i = -2; i <= 2; i++) {
      const x = i * (0.061 + row * 0.004);
      const z = 0.216 - Math.abs(i) * 0.023;
      feather(
        `BreastFeather${row}_${i + 2}`,
        [x, y, z],
        [x * 1.14, y - 0.245, z + 0.027 - row * 0.015],
        0.12 + row * 0.008,
        spine.joints[row < 2 ? 1 : 0],
        covertTex,
        0.04,
      );
    }
  }
  for (const s of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      feather(
        `FlankFlame${s}_${row}`,
        [s * 0.18, 1.40 - row * 0.13, 0.095],
        [s * 0.29, 1.14 - row * 0.10, 0.09],
        0.15,
        spine.joints[row === 0 ? 1 : 0],
        primaryTex,
        0.037,
      );
    }
  }

  b.part(new THREE.OctahedronGeometry(0.085), gold, {
    at: [0, 1.345, 0.282],
    scale: [0.78, 1.24, 0.43],
    bone: spine.joints[1],
    name: "HeartGoldMount",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.052), C.jade, {
      at: [0, 1.345, 0.316],
      scale: [0.72, 1.23, 0.4],
      bone: spine.joints[1],
      name: "DawnHeart",
    }),
    0.7,
  );
  b.part(new THREE.PlaneGeometry(0.16, 0.24), "#ffffff", {
    at: [0, 1.115, 0.273],
    texture: emblemTex,
    bone: spine.joints[0],
    name: "BreastFiligree",
  });

  // Wings: stout leading edges, connected coverts, distinct flight feathers.
  for (const { s, side, chain } of wings) {
    b.sweep(chain, [0.119, 0.105, 0.069, 0.027], {
      color: coat,
      sides: 8,
      name: `WingSpar${side}`,
    });
    b.membrane(
      chain,
      [
        [s * 0.27, 1.18, -0.025],
        [s * 0.77, 1.23, -0.045],
        [s * 1.25, 1.47, -0.065],
        [s * 1.59, 1.94, -0.075],
      ],
      {
        color: deepCoat,
        thickness: 0.07,
        bone: chain,
        rows: 3,
        cols: 12,
        name: `WingWeb${side}`,
      },
    );

    for (let i = 0; i < 8; i++) {
      const x = 0.30 + i * 0.092;
      feather(
        `Secondary${side}${i + 1}`,
        [s * x, 1.51 + i * 0.032, -0.025],
        [s * (0.37 + i * 0.122), 0.875 + i * 0.019 - (i % 2) * 0.035, -0.115],
        0.20,
        chain.joints[i < 4 ? 0 : 1],
        primaryTex,
        0.036,
      );
    }

    for (let i = 0; i < 9; i++) {
      const root = [s * (0.91 + i * 0.084), 1.735 + i * 0.025, -0.047];
      const tip = [
        s * (1.12 + i * 0.132),
        0.91 + i * 0.132 - (i % 2) * 0.028,
        -0.135 + i * 0.004,
      ];
      const bone = chain.joints[i < 4 ? 1 : 2];
      feather(
        `Primary${side}${i + 1}`,
        root,
        tip,
        0.218 - i * 0.003,
        bone,
        primaryTex,
        0.041,
      );

      // A small incandescent vein is part of the feather, not a floating flame.
      if (i >= 3) {
        const start = V(root).lerp(V(tip), 0.79);
        const end = V(tip);
        start.z += 0.015;
        end.z += 0.004;
        glow(
          b.sweep([start, end], [0.009, 0], {
            color: C.ivory,
            bone,
            sides: 5,
            caps: "flat",
            name: `IncandescentQuill${side}${i}`,
          }),
          0.85,
        );
      }
    }

    feather(
      `WingtipFlame${side}`,
      [s * 1.47, 1.90, -0.065],
      [s * 2.24, 2.18, -0.12],
      0.165,
      chain.tip!,
      covertTex,
      0.03,
    );

    for (let i = 0; i < 10; i++) {
      const x = 0.31 + i * 0.133;
      const y = 1.55 + i * 0.039;
      feather(
        `GreaterCovert${side}${i + 1}`,
        [s * x, y, 0.016],
        [s * (x + 0.17), y - 0.38 + i * 0.007, 0.061],
        0.17,
        chain.joints[Math.min(2, Math.floor(i / 4))],
        covertTex,
        0.035,
      );
    }

    for (let i = 0; i < 8; i++) {
      const x = 0.30 + i * 0.145;
      const y = 1.565 + i * 0.043;
      feather(
        `LesserCovert${side}${i + 1}`,
        [s * x, y, 0.047],
        [s * (x + 0.14), y - 0.22, 0.075],
        0.13,
        chain.joints[i < 3 ? 0 : 1],
        covertTex,
        0.026,
      );
    }

    // Reverse coverts give the wing a finished back and a layered side profile.
    for (let i = 0; i < 7; i++) {
      const x = 0.35 + i * 0.17;
      const y = 1.55 + i * 0.052;
      feather(
        `BackCovert${side}${i}`,
        [s * x, y, -0.105],
        [s * (x + 0.12), y - 0.29, -0.12],
        0.18,
        chain.joints[i < 3 ? 0 : 1],
        primaryTex,
        0.025,
      );
    }

    b.sweep(
      catmull([
        [s * 0.24, 1.565, 0.045],
        [s * 0.69, 1.775, 0.025],
        [s * 1.19, 1.905, 0.005],
        [s * 1.58, 1.974, -0.025],
      ]),
      [0.024, 0.019, 0.01],
      {
        color: cream,
        bone: chain,
        sides: 6,
        name: `GildedLeadingEdge${side}`,
      },
    );

    for (let i = 0; i < 3; i++) {
      feather(
        `ShoulderFlame${side}${i}`,
        [s * (0.19 + i * 0.095), 1.50 + i * 0.052, 0.052],
        [s * (0.36 + i * 0.13), 1.82 + i * 0.062, 0.006],
        0.14,
        chain.joints[0],
        covertTex,
        0.034,
      );
    }

    b.part(new THREE.OctahedronGeometry(0.062), gold, {
      at: [s * 1.17, 1.83, 0.075],
      scale: [1.3, 0.85, 0.5],
      bone: chain.joints[2],
      name: `CarpalMount${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.036), C.jade, {
        at: [s * 1.17, 1.83, 0.104],
        scale: [1.35, 0.8, 0.4],
        bone: chain.joints[2],
        name: `CarpalJade${side}`,
      }),
      0.6,
    );
  }

  // Five flowing tail ribbons have independent bones and a subtly flame-cut edge.
  for (const { i, chain } of tails) {
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    const center: THREE.Vector3[] = [];
    for (let k = 0; k <= 28; k++) {
      const t = k / 28;
      const p = chain.at(t).at.clone();
      const scallop = 1 + Math.sin(t * Math.PI * 8) * 0.11 * Math.sin(Math.PI * t);
      const width =
        (0.06 + 0.095 * Math.sin(Math.PI * Math.pow(t, 0.8))) *
          Math.pow(1 - t, 0.36) * scallop +
        0.001;
      left.push(p.clone().add(new THREE.Vector3(-width, 0, 0)));
      right.push(p.clone().add(new THREE.Vector3(width, 0, 0)));
      center.push(p.clone().add(new THREE.Vector3(0, 0.018, 0.014)));
    }
    b.membrane(left, right, {
      color: tailPaint,
      bone: chain,
      thickness: 0.027,
      rows: 6,
      cols: 28,
      name: `FlameTailRibbon${i + 3}`,
    });
    b.sweep(left, [0.008, 0.006, 0.002], {
      color: gold,
      bone: chain,
      sides: 5,
      name: `TailLeftGold${i + 3}`,
    });
    b.sweep(right, [0.008, 0.006, 0.002], {
      color: gold,
      bone: chain,
      sides: 5,
      name: `TailRightGold${i + 3}`,
    });
    b.sweep(center, [0.011, 0.008, 0.002], {
      color: cream,
      bone: chain,
      sides: 5,
      name: `TailShaft${i + 3}`,
    });

    const start = chain.at(0.76).at;
    const end = chain.at(1).at;
    const direction = end.clone().sub(start);
    const flameRoot = end.clone().addScaledVector(direction, -0.15);
    const flameTip = end.clone().addScaledVector(direction, 0.35);
    const terminal = feather(
      `TailTerminalFlame${i + 3}`,
      flameRoot.toArray(),
      flameTip.toArray(),
      0.095,
      chain.joints[3],
      covertTex,
      0.02,
    );
    glow(terminal, 0.48);
  }

  for (let i = -3; i <= 3; i++) {
    feather(
      `RumpFan${i + 3}`,
      [i * 0.043, 1.17, -0.17],
      [i * 0.12, 0.82, -0.43],
      0.13,
      pelvis,
      primaryTex,
      0.035,
    );
  }

  // Full feathered leggings transition into small gold scales and ivory claws.
  for (const { s, leg, toes } of legs) {
    b.sweep(leg, [0.093, 0.082, 0.038, 0.031], {
      color: gold,
      sides: 8,
      name: s > 0 ? "LegL" : "LegR",
    });
    b.sweep(leg, [0.108, 0.084], {
      from: 0,
      to: 0.46,
      color: coat,
      sides: 8,
      name: `ThighPlumage${s}`,
    });

    for (let row = 0; row < 2; row++) {
      for (let j = -1; j <= 1; j++) {
        const x = s * (0.17 + row * 0.015) + j * 0.048;
        feather(
          `ThighFeather${s}_${row}_${j + 1}`,
          [x, 0.99 - row * 0.14, 0.079 + row * 0.025],
          [x + s * 0.025, 0.72 - row * 0.14, 0.114],
          0.098,
          leg.joints[0],
          row === 0 ? primaryTex : covertTex,
          0.026,
        );
      }
      feather(
        `OuterLegFlame${s}_${row}`,
        [s * 0.23, 0.96 - row * 0.13, 0.015],
        [s * 0.32, 0.73 - row * 0.13, 0.015],
        0.11,
        leg.joints[0],
        primaryTex,
        0.03,
      );
    }

    for (let k = 0; k < 5; k++) {
      b.part(new THREE.CylinderGeometry(0.039, 0.041, 0.018, 8), darkGold, {
        frame: leg.at(0.68 + k * 0.055),
        name: `TarsalScale${s}_${k}`,
      });
    }

    for (let i = 0; i < toes.length; i++) {
      const toe = toes[i];
      b.sweep(toe, [0.026, 0.018, 0.011], {
        color: gold,
        sides: 6,
        name: `GoldenToe${s}_${i}`,
      });
      const end = toe.at(1).at;
      const back = i === 3;
      b.sweep(
        catmull([
          end,
          end.clone().add(new THREE.Vector3(0, 0.013, back ? -0.028 : 0.025)),
          end.clone().add(new THREE.Vector3(0, -0.018, back ? -0.05 : 0.052)),
        ]),
        [0.016, 0.013, 0],
        {
          color: cream,
          bone: toe.joints[1],
          sides: 6,
          caps: "flat",
          name: `Talon${s}_${i}`,
        },
      );
    }
  }

  // Low, cool-toned shrine keeps the phoenix as the dominant subject.
  b.part(new THREE.CylinderGeometry(1, 1.035, 0.12, 12), C.stoneEdge, {
    at: [0, 0.06, -0.38],
    scale: [1.18, 1, 1.25],
    bone: pedestal,
    name: "ObsidianFoundation",
  });
  b.part(new THREE.CylinderGeometry(0.98, 1, 0.035, 12), stone, {
    at: [0, 0.1375, -0.38],
    scale: [1.18, 1, 1.25],
    bone: pedestal,
    name: "SunSealStone",
  });
  b.part(new THREE.CylinderGeometry(0.43, 0.46, 0.035, 12), stone, {
    at: [0, 0.1725, 0.05],
    bone: pedestal,
    name: "PerchDais",
  });
  b.part(new THREE.CylinderGeometry(0.445, 0.445, 0.012, 12), darkGold, {
    at: [0, 0.16, 0.05],
    bone: pedestal,
    name: "PerchGoldRim",
  });
  b.part(new THREE.PlaneGeometry(2.19, 2.32), "#ffffff", {
    at: [0, 0.1565, -0.38],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: sunTex,
    bone: pedestal,
    name: "AncientSunSeal",
  });

  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    b.part(new THREE.BoxGeometry(0.045, 0.065, 0.045), darkGold, {
      at: [Math.sin(a) * 1.155, 0.085, -0.38 + Math.cos(a) * 1.22],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: pedestal,
      name: `SealEdgeInlay${i}`,
    });
  }

  for (const s of [1, -1]) {
    const p = [s * 0.78, 0.155, -0.71];
    b.lathe(
      [[0, 0], [0.11, 0], [0.135, 0.07], [0.1, 0.105], [0, 0.105]],
      {
        at: p,
        color: darkGold,
        segments: 8,
        bone: pedestal,
        name: `EmberCup${s}`,
      },
    );
    glow(
      b.part(new THREE.IcosahedronGeometry(0.076, 0), C.orange, {
        at: [p[0], 0.255, p[2]],
        scale: [1, 0.6, 1],
        bone: pedestal,
        name: `EmberBed${s}`,
      }),
      1.1,
    );
    glow(
      b.cards(
        [frame([p[0], 0.26, p[2]], [0, 1, 0])],
        emberTex,
        {
          size: [0.16, 0.29],
          cross: true,
          flow: [0, 0, 1],
          bone: pedestal,
          sink: 0.04,
          name: `ShrineFlame${s}`,
        },
      ),
      1.2,
    );

    // These deliberately airborne sparks are the only detached details.
    for (let i = 0; i < 4; i++) {
      glow(
        b.part(new THREE.OctahedronGeometry(0.009 + random() * 0.006), C.pale, {
          at: [
            p[0] + (random() - 0.5) * 0.15,
            0.4 + i * 0.07,
            p[2] + (random() - 0.5) * 0.12,
          ],
          scale: [0.65, 1.7, 0.65],
          bone: pedestal,
          name: `RisingEmber${s}_${i}`,
        }),
        1.2,
      );
    }
  }

  return b.root;
}
