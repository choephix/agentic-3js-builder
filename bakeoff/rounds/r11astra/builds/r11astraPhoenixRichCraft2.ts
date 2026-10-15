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
    "An anime-fantasy phoenix with outstretched, gilded flame wings, five flowing firebird tails, jade eyes, and an ancient sun-seal pedestal.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "AureateDawnPhoenix",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(83017);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const C = {
    ink: "#392039",
    burgundy: "#76233e",
    crimson: "#bd3446",
    scarlet: "#f15a38",
    orange: "#ff963d",
    gold: "#edbb59",
    pale: "#ffe6a1",
    ivory: "#fff4cb",
    jade: "#75ead5",
    deepJade: "#176b72",
    stone: "#263544",
    stoneEdge: "#142431",
  };

  const coat = cel("#f16c3d", "#a93149");
  const deepCoat = cel("#c54045", "#6c2945");
  const cream = cel("#fff0b6", "#efa55c");
  const gold = cel("#ffd581", "#b96c38");
  const darkGold = cel("#d09a47", "#794438");
  const stone = paint((p, n) =>
    mix(
      n.y > 0.5 ? "#334b59" : "#172733",
      "#61717a",
      noise(p, 0.19, 5) * 0.22,
    ),
  );
  const tailPaint = paint((_p, _n, s) => {
    const t = s[0];
    const across = Math.abs(s[1] - 0.5) * 2;
    if (across > 0.88) return "#ffd279";
    const vein = Math.abs(
      ((t * 8 + across * 0.8) % 1 + 1) % 1 - 0.5,
    );
    if (vein < 0.045 && t > 0.12 && t < 0.88) return "#f8ae55";
    if (across < 0.075) return "#ffe9a3";
    return t < 0.5
      ? mix("#962540", "#f35a38", t * 2)
      : mix("#f35a38", "#ffdf85", (t - 0.5) * 2);
  });

  // Six drawings provide the fine work; the silhouettes remain solid primitives.
  const primaryTex = svg(
    `<svg viewBox="0 0 100 200">
      <defs>
        <linearGradient id="fire" x1="0" y1="1" x2=".2" y2="0">
          <stop offset="0" stop-color="#86253d"/>
          <stop offset=".35" stop-color="#d8403c"/>
          <stop offset=".72" stop-color="#ff8c38"/>
          <stop offset="1" stop-color="#fff0ac"/>
        </linearGradient>
      </defs>
      <path d="M50 200 L16 176 L0 124 L13 64 L50 0 L81 60 L100 132 L80 180 Z"
        fill="url(#fire)" stroke="#f8c768" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 190 Q29 135 50 16 Q73 79 65 108 Q59 127 64 144 Q44 125 50 95 Q35 135 50 190Z"
        fill="#ffce68"/>
      <path d="M50 183 Q46 127 50 40" stroke="#fff0b0" stroke-width="2.8" fill="none"/>
      <g fill="none" stroke="#ffb75d" stroke-width="2.7" stroke-linecap="round">
        <path d="M47 157 L22 136 L17 116"/>
        <path d="M48 132 L27 108 L26 91"/>
        <path d="M50 108 L36 86"/>
        <path d="M53 164 L78 144 L85 123"/>
        <path d="M54 140 L76 117 L77 98"/>
      </g>
      <path d="M50 56 L56 71 L50 83 L44 71Z" fill="#fff5ca"/>
    </svg>`,
    { size: 384 },
  );

  const covertTex = svg(
    `<svg viewBox="0 0 100 200">
      <defs>
        <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#ae3543"/>
          <stop offset=".48" stop-color="#f3833d"/>
          <stop offset="1" stop-color="#ffe7a0"/>
        </linearGradient>
      </defs>
      <path d="M50 200 L16 176 L0 124 L13 64 L50 0 L81 60 L100 132 L80 180Z"
        fill="url(#g)" stroke="#ffdc8c" stroke-width="4"/>
      <path d="M50 184 Q32 135 50 31 Q71 102 50 128 Q40 108 50 80"
        fill="none" stroke="#fff1bc" stroke-width="5" stroke-linecap="round"/>
      <path d="M26 143 L45 157 M74 143 L55 157 M23 119 L44 139 M77 119 L56 139"
        fill="none" stroke="#be4b3c" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const eyeTex = svg(
    `<svg viewBox="0 0 120 100">
      <path d="M5 56 Q42 7 95 29 L117 14 L107 47 Q78 90 26 73Z" fill="#432439"/>
      <path d="M15 55 Q51 23 99 36 Q77 75 31 66Z" fill="#fff0b5"/>
      <path d="M42 34 Q63 26 80 34 L77 61 Q60 76 44 63Z" fill="#19767d"/>
      <path d="M45 47 Q61 57 78 44 L75 63 Q58 72 46 61Z" fill="#7df3d1"/>
      <ellipse cx="61" cy="49" rx="7" ry="19" fill="#24263a"/>
      <path d="M49 35 L58 34 L57 44 L48 43Z" fill="#fffdf0"/>
      <circle cx="71" cy="58" r="3.5" fill="#ffffff"/>
      <path d="M13 38 Q54 4 98 18" stroke="#ffe4a1" stroke-width="7"
        fill="none" stroke-linecap="round"/>
      <path d="M24 79 Q64 94 91 70" stroke="#fa9a52" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 256 },
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

  // Skeleton: all articulated chains are created before their visible shells.
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
    [[0, 1.5, 0.035], [0, 1.7, 0.075], [0, 1.88, 0.145]],
    {
      parent: spine.tip!,
      names: ["neckLower", "neckUpper", "headBase"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.91, 0.16],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.825, 0.24],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const wingData = [1, -1].map((s) => {
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

  const legData = [1, -1].map((s) => {
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
      const backwards = i === 2;
      const x = s * 0.22;
      const dx = backwards ? -s * 0.035 : i * 0.065;
      const endZ = backwards ? -0.06 : 0.37 - Math.abs(i) * 0.035;
      return b.chain(
        `toe${side}${i + 2}`,
        [
          [x, 0.235, 0.105],
          [x + dx * 0.6, 0.22, backwards ? 0.015 : 0.245],
          [x + dx, 0.213, endZ],
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

  const tailData = [-2, -1, 0, 1, 2].map((i) => {
    const a = Math.abs(i);
    const path = catmull([
      [i * 0.055, 1.075, -0.19],
      [i * 0.14, 0.85, -0.43],
      [i * 0.34, 0.40 + a * 0.035, -0.83],
      [i * 0.53, 0.29 + a * 0.09, -1.17 + a * 0.10],
      [i * 0.58, 0.46 + a * 0.11, -1.49 + a * 0.13],
    ]);
    const chain = b.chain(`tail${i + 3}`, path, {
      parent: pelvis,
      count: 4,
      role: "tail",
    });
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

  // A thick, eight-corner feather with an illustrated front surface.
  // The whole assembly derives from its root and tip, including its face plane.
  function feather(
    name: string,
    root: number[],
    tip: number[],
    width: number,
    bone: Joint,
    texture: THREE.Texture = primaryTex,
    thickness = 0.024,
    shell: Fill = gold,
  ) {
    const origin = V(root);
    const y = V(tip).sub(origin);
    const length = y.length();
    y.normalize();
    const x = y.clone().cross(new THREE.Vector3(0, 0, 1)).normalize();
    const normal = x.clone().cross(y).normalize();
    const points = [
      [0, 0],
      [-0.34 * width, 0.12 * length],
      [-0.5 * width, 0.38 * length],
      [-0.37 * width, 0.68 * length],
      [0, length],
      [0.31 * width, 0.7 * length],
      [0.5 * width, 0.34 * length],
      [0.3 * width, 0.1 * length],
    ];
    const blade = b.extrude(points, {
      at: origin,
      x,
      y,
      thickness,
      color: shell,
      bone,
      name,
    });
    const faceAt = origin
      .clone()
      .addScaledVector(y, length / 2)
      .addScaledVector(normal, thickness / 2 + 0.0015);
    b.part(new THREE.PlaneGeometry(width, length), "#ffffff", {
      at: faceAt,
      dir: normal,
      up: y,
      axis: "z",
      texture,
      bone,
      name: `${name}Enamel`,
    });
    return blade;
  }

  // Torso and long, swan-like neck.
  b.sweep(
    spine,
    (t) => [
      0.17 + Math.sin(t * Math.PI) * 0.095 - t * 0.055,
      0.155 + Math.sin(t * Math.PI) * 0.045 - t * 0.035,
    ],
    { color: deepCoat, sides: 10, caps: "round", name: "BreastCore" },
  );
  b.sweep(neck, (t) => [0.124 - t * 0.028, 0.12 - t * 0.018], {
    color: coat,
    sides: 10,
    name: "ArchedNeck",
  });

  const skull = ellipsoid(
    [0, 1.925, 0.17],
    [0.164, 0.185, 0.186],
    coat,
    head,
    "PhoenixSkull",
  );
  ellipsoid([0, 1.845, 0.215], [0.11, 0.085, 0.125], cream, head, "CheekBib");

  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around([0, 1.925, 0.17]).at(s * 40, 10);
    b.decal(skull, eyeTex, {
      at: hit,
      size: [0.133, 0.111],
      mirror: s < 0,
      lift: 0.002,
      bone: head,
      name: s > 0 ? "EyeL" : "EyeR",
    });

    feather(
      `TempleFlame${s}`,
      [s * 0.12, 1.945, 0.125],
      [s * 0.325, 2.055, -0.055],
      0.12,
      head,
      covertTex,
      0.025,
    );
    feather(
      `CheekFlame${s}`,
      [s * 0.1, 1.865, 0.19],
      [s * 0.245, 1.825, -0.015],
      0.1,
      head,
      covertTex,
      0.024,
    );
  }

  b.extrude(
    [[0, 0], [0.09, 0.045], [0.195, 0.012], [0.27, -0.055],
      [0.235, -0.13], [0.205, -0.074], [0.035, -0.052]],
    {
      at: [0, 1.89, 0.275],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.09, 0.12],
      color: gold,
      bone: head,
      name: "HookedUpperBeak",
    },
  );
  b.extrude(
    [[0, 0], [0.18, -0.008], [0.205, 0.025], [0.045, 0.035]],
    {
      at: [0, 1.81, 0.285],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.072,
      color: darkGold,
      bone: jaw,
      name: "LowerBeak",
    },
  );
  for (const s of [1, -1]) {
    ellipsoid(
      [s * 0.055, 1.904, 0.365],
      [0.008, 0.009, 0.019],
      C.burgundy,
      head,
      `Nostril${s}`,
    );
  }

  // A crown of actual flame-shaped blades, not a hat over the eyes.
  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    feather(
      `CrownFlame${i + 3}`,
      [i * 0.044, 2.045 - a * 0.012, 0.105 - a * 0.024],
      [i * 0.115, 2.455 - a * 0.085, -0.035 - a * 0.045],
      0.113 - a * 0.011,
      head,
      covertTex,
      0.022,
    );
  }
  glow(
    b.part(new THREE.OctahedronGeometry(0.039), C.jade, {
      at: [0, 2.065, 0.302],
      scale: [0.65, 1, 0.42],
      bone: head,
      name: "ForeheadJade",
    }),
    0.55,
  );

  // Breast plumage: small overlapping flame shields surrounding the sun-heart.
  for (let row = 0; row < 3; row++) {
    const y = 1.55 - row * 0.15;
    for (let i = -2; i <= 2; i++) {
      const x = i * (0.053 + row * 0.012);
      feather(
        `BreastFeather${row}_${i + 2}`,
        [x, y, 0.183 + row * 0.012 - Math.abs(i) * 0.012],
        [x * 1.21, y - 0.24, 0.21 + row * 0.012],
        0.095 + row * 0.015,
        spine.joints[1],
        covertTex,
        0.018,
      );
    }
  }
  const heartMount = b.part(new THREE.OctahedronGeometry(0.089), gold, {
    at: [0, 1.345, 0.256],
    scale: [0.74, 1.23, 0.38],
    bone: spine.joints[1],
    name: "HeartGoldMount",
  });
  b.stick(
    new THREE.OctahedronGeometry(0.058),
    C.deepJade,
    b.surface(heartMount).around(heartMount.at).at(0, 0),
    { scale: [0.7, 0.55, 1.2], name: "HeartJadeSetting" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.049), C.jade, {
      at: [0, 1.345, 0.302],
      scale: [0.7, 1.23, 0.3],
      bone: spine.joints[1],
      name: "DawnHeart",
    }),
    0.7,
  );
  b.part(new THREE.PlaneGeometry(0.17, 0.265), "#ffffff", {
    at: [0, 1.11, 0.246],
    texture: emblemTex,
    bone: spine.joints[0],
    name: "BreastFiligree",
  });

  // Wings: skeletal leading edge, broad secondary fans, long separated primaries,
  // then two overlapping rows of golden coverts.
  for (const { s, side, chain } of wingData) {
    b.sweep(chain, [0.115, 0.105, 0.068, 0.026], {
      color: coat,
      sides: 8,
      name: `WingSpar${side}`,
    });
    b.membrane(
      chain,
      [
        [s * 0.27, 1.20, -0.025],
        [s * 0.77, 1.25, -0.045],
        [s * 1.25, 1.49, -0.065],
        [s * 1.59, 1.94, -0.075],
      ],
      {
        color: deepCoat,
        thickness: 0.035,
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
        [s * x, 1.51 + i * 0.032, -0.016],
        [s * (0.37 + i * 0.116), 0.89 + i * 0.019, -0.055],
        0.185,
        chain.joints[i < 4 ? 0 : 1],
        primaryTex,
        0.028,
        darkGold,
      );
    }

    for (let i = 0; i < 9; i++) {
      feather(
        `Primary${side}${i + 1}`,
        [s * (0.91 + i * 0.084), 1.735 + i * 0.025, -0.047],
        [s * (1.115 + i * 0.13), 0.98 + i * 0.124, -0.09],
        0.205 - i * 0.005,
        chain.joints[i < 4 ? 1 : 2],
        primaryTex,
        0.026,
      );
    }

    feather(
      `WingtipFlame${side}`,
      [s * 1.47, 1.90, -0.065],
      [s * 2.205, 2.155, -0.11],
      0.15,
      chain.tip!,
      covertTex,
      0.025,
    );

    for (let i = 0; i < 10; i++) {
      const x = 0.31 + i * 0.133;
      const y = 1.55 + i * 0.039;
      feather(
        `GreaterCovert${side}${i + 1}`,
        [s * x, y, 0.061],
        [s * (x + 0.19), y - 0.37 + i * 0.007, 0.066],
        0.145,
        chain.joints[Math.min(2, Math.floor(i / 4))],
        covertTex,
        0.022,
      );
    }

    for (let i = 0; i < 7; i++) {
      const x = 0.30 + i * 0.145;
      const y = 1.565 + i * 0.043;
      feather(
        `LesserCovert${side}${i + 1}`,
        [s * x, y, 0.112],
        [s * (x + 0.17), y - 0.18, 0.119],
        0.105,
        chain.joints[i < 3 ? 0 : 1],
        covertTex,
        0.018,
      );
    }

    const leading = catmull([
      [s * 0.24, 1.565, 0.045],
      [s * 0.69, 1.775, 0.025],
      [s * 1.19, 1.905, 0.005],
      [s * 1.58, 1.974, -0.025],
    ]);
    b.sweep(leading, [0.026, 0.02, 0.012], {
      color: cream,
      bone: chain,
      sides: 6,
      name: `GildedLeadingEdge${side}`,
    });

    for (let i = 0; i < 3; i++) {
      feather(
        `ShoulderFlame${side}${i}`,
        [s * (0.19 + i * 0.095), 1.50 + i * 0.052, 0.095],
        [s * (0.36 + i * 0.13), 1.82 + i * 0.062, 0.015],
        0.13,
        chain.joints[0],
        covertTex,
        0.025,
      );
    }

    // One restrained jade accent at the carpal joint repeats the heart motif.
    b.part(new THREE.OctahedronGeometry(0.063), gold, {
      at: [s * 1.17, 1.83, 0.117],
      scale: [1.3, 0.85, 0.45],
      bone: chain.joints[2],
      name: `CarpalMount${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.038), C.jade, {
        at: [s * 1.17, 1.83, 0.145],
        scale: [1.35, 0.8, 0.3],
        bone: chain.joints[2],
        name: `CarpalJade${side}`,
      }),
      0.5,
    );
  }

  // Five independent, flexible tail ribbons with a gold shaft and shaped edges.
  for (const { i, chain } of tailData) {
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    const center: THREE.Vector3[] = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      const p = chain.at(t).at.clone();
      const width =
        (0.055 + 0.09 * Math.sin(Math.PI * Math.pow(t, 0.8))) *
        Math.pow(1 - t, 0.35) +
        0.001;
      left.push(p.clone().add(new THREE.Vector3(-width, 0, 0)));
      right.push(p.clone().add(new THREE.Vector3(width, 0, 0)));
      center.push(p.clone().add(new THREE.Vector3(0, 0.016, 0.014)));
    }
    b.membrane(left, right, {
      color: tailPaint,
      bone: chain,
      thickness: 0.022,
      rows: 6,
      cols: 28,
      name: `FlameTailRibbon${i + 3}`,
    });
    b.sweep(left, [0.009, 0.006, 0.002], {
      color: gold,
      bone: chain,
      sides: 5,
      name: `TailLeftGold${i + 3}`,
    });
    b.sweep(right, [0.009, 0.006, 0.002], {
      color: gold,
      bone: chain,
      sides: 5,
      name: `TailRightGold${i + 3}`,
    });
    b.sweep(center, [0.012, 0.009, 0.003], {
      color: cream,
      bone: chain,
      sides: 5,
      name: `TailShaft${i + 3}`,
    });

    const tip = chain.at(0.9);
    glow(
      b.part(new THREE.OctahedronGeometry(0.045), C.pale, {
        at: tip,
        scale: [0.62, 1.5, 0.5],
        bone: tip.bone!,
        name: `TailSpark${i + 3}`,
      }),
      0.7,
    );
  }

  // Rump fan masks the tail roots, while leaving the five tails independent.
  for (let i = -3; i <= 3; i++) {
    feather(
      `RumpFan${i + 3}`,
      [i * 0.043, 1.17, -0.17],
      [i * 0.12, 0.82, -0.43],
      0.12,
      pelvis,
      primaryTex,
      0.025,
    );
  }

  // Feathered thighs, scaly gold tarsi and splayed grasping digits.
  for (const { s, leg, toes } of legData) {
    b.sweep(leg, [0.093, 0.082, 0.038, 0.031], {
      color: gold,
      sides: 8,
      name: s > 0 ? "LegL" : "LegR",
    });
    b.sweep(leg, [0.106, 0.087], {
      from: 0,
      to: 0.46,
      color: coat,
      sides: 8,
      name: `ThighPlumage${s}`,
    });
    for (let j = 0; j < 3; j++) {
      feather(
        `ThighFeather${s}_${j}`,
        [s * (0.115 + j * 0.053), 0.94, 0.055],
        [s * (0.15 + j * 0.057), 0.645 + j * 0.035, 0.08],
        0.095,
        leg.joints[0],
        covertTex,
        0.018,
      );
    }
    for (let k = 0; k < 5; k++) {
      const t = 0.68 + k * 0.055;
      b.part(new THREE.CylinderGeometry(0.039, 0.041, 0.018, 8), darkGold, {
        frame: leg.at(t),
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
      const backwards = i === 3;
      b.sweep(
        catmull([
          end,
          end.clone().add(new THREE.Vector3(0, 0.013, backwards ? -0.028 : 0.025)),
          end.clone().add(new THREE.Vector3(0, -0.018, backwards ? -0.05 : 0.052)),
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

  // A quiet, low sun-seal stage: cool stone makes the fiery silhouette read.
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
    const x = Math.sin(a) * 1.155;
    const z = -0.38 + Math.cos(a) * 1.22;
    b.part(new THREE.BoxGeometry(0.045, 0.065, 0.045), darkGold, {
      at: [x, 0.085, z],
      rotation: [0, (a * 180) / Math.PI, 0],
      bone: pedestal,
      name: `SealEdgeInlay${i}`,
    });
  }

  // Small rear braziers frame rather than obscure the bird.
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

    for (let i = 0; i < 4; i++) {
      const x = p[0] + (random() - 0.5) * 0.18;
      const z = p[2] + (random() - 0.5) * 0.16;
      glow(
        b.part(new THREE.OctahedronGeometry(0.011 + random() * 0.008), C.pale, {
          at: [x, 0.4 + i * 0.075, z],
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
