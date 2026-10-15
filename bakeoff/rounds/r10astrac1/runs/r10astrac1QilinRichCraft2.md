```ts
import * as THREE from "three";
import {
  createBuilder, rng, catmull, bezier, arc, paint, mix, noise, svg,
} from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Qilin of the Auspicious Clouds",
  description:
    "An ivory-maned celestial qilin with luminous jade scales, amber eyes, branching gilded antlers and truly cloven hooves, on an engraved moonstone seal.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction revision:
   * 1. Replace the stacked, beaded mane and exposed wire curls with substantial,
   *    interlocking cloud scrolls and flowing tapered locks.
   * 2. Bring the larger amber eyes forward; sharpen their almond silhouettes,
   *    soften the muzzle, and replace the block-like chin beard.
   * 3. Turn the flank scales into downward-overlapping shingles, brighten their
   *    engraved faces, and carry the armor onto the hips and shoulders.
   * 4. Make the hoof clefts visible through the ornament and strengthen the
   *    tail's cloud plume. Preserve the clear antlers and restrained setting.
   */
  const b = createBuilder({
    name: "AuspiciousCloudQilin",
    detail: 0.85,
    paintSize: 2048,
  });
  const random = rng(82173);

  const C = {
    ink: "#18283e",
    deep: "#225769",
    jade: "#4da99f",
    turquoise: "#79d7c5",
    mint: "#c3f9e5",
    pale: "#eaf9eb",
    cream: "#fff4d8",
    gold: "#dfb364",
    goldLight: "#ffe5a1",
    goldDark: "#a67c48",
    lavender: "#b3c5df",
    cloudShadow: "#8dbbcf",
    pink: "#df95b0",
    plum: "#725580",
    stone: "#374a65",
  };

  const jade = paint((p, n) =>
    mix(
      n.y < -0.25 ? "#347386" : "#459f9b",
      "#a1e8ce",
      0.23 + noise(p, 0.19, 19) * 0.36 + Math.max(0, n.y) * 0.22,
    ),
  );
  const belly = cel("#c7ead5", "#84b4bc", { threshold: -0.12 });
  const cloud = cel("#fff7e3", "#b7d6e0", { threshold: -0.22 });
  const cloudBlue = cel("#d9f2ed", "#9bbfd4", { threshold: -0.15 });
  const ivory = cel("#fff1d2", "#d1bdac", { threshold: -0.12 });
  const gold = paint((p, n) =>
    mix("#ad834d", "#ffe6aa",
      0.32 + Math.max(n.y, 0) * 0.42 + noise(p, 0.09, 8) * 0.22),
  );
  const stone = paint((p, n) =>
    mix("#29364f", "#657b91",
      0.2 + noise(p, 0.24, 38) * 0.4 + Math.max(n.y, 0) * 0.2),
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 110">
      <defs>
        <clipPath id="e">
          <path d="M12 58 Q20 19 52 23 Q80 23 89 52 Q82 88 51 91 Q22 87 12 58Z"/>
        </clipPath>
      </defs>
      <path d="M4 49 Q17 17 50 17 Q81 17 95 49
               Q88 92 52 98 Q17 94 4 49Z" fill="#18283e"/>
      <g clip-path="url(#e)">
        <rect width="100" height="110" fill="#fff1ce"/>
        <ellipse cx="52" cy="57" rx="30" ry="39" fill="#d98a41"/>
        <path d="M18 64 Q50 48 86 64 L86 103 L18 103Z" fill="#ffd474"/>
        <path d="M22 27 Q54 8 84 36 L82 47 Q53 33 23 47Z" fill="#a34e4c"/>
        <ellipse cx="53" cy="57" rx="12" ry="28" fill="#18283e"/>
        <path d="M32 78 Q49 91 72 77" fill="none" stroke="#fff3b1" stroke-width="5"/>
        <ellipse cx="38" cy="39" rx="11" ry="13" fill="#ffffff"/>
        <circle cx="70" cy="71" r="5" fill="#ffffff"/>
        <circle cx="75" cy="60" r="2.5" fill="#ffffff"/>
      </g>
      <path d="M5 49 Q15 35 13 21 Q25 34 34 25"
        fill="#18283e"/>
      <path d="M16 18 Q49 4 80 17" fill="none"
        stroke="#f2d492" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const scaleTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M6 5 L94 5 L96 61 L50 115 L4 61Z" fill="#e1e1e1"/>
      <path d="M9 12 L14 59 L50 103 L86 59 L91 12"
        fill="none" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>
      <path d="M21 30 Q50 43 79 30 M23 45 Q50 58 77 45"
        fill="none" stroke="#a0a0a0" stroke-width="3"/>
      <path d="M50 48 L50 91 M34 65 L50 82 L66 65"
        fill="none" stroke="#ffffff" stroke-width="3"/>
      <path d="M13 12 L87 12" stroke="#a4a4a4" stroke-width="5"/>
      <path d="M18 21 L39 21" stroke="#ffffff" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const sigilTexture = svg(
    `<svg viewBox="0 0 100 160">
      <path d="M50 7 Q68 37 51 53 Q91 39 84 72 Q78 93 57 105
               L50 150 L43 105 Q11 90 16 65 Q21 46 39 55 Q26 29 50 7Z"
        fill="#285d70" stroke="#ffe5a1" stroke-width="5"/>
      <path d="M50 24 Q39 42 50 61 Q70 52 69 69 Q69 85 51 94
               Q31 84 31 70 Q31 58 43 67 L50 118"
        fill="none" stroke="#ffe5a1" stroke-width="5" stroke-linecap="round"/>
      <path d="M50 61 L60 78 L50 96 L40 78Z" fill="#c8ffe9"/>
    </svg>`,
    { size: 256 },
  );

  const cloudMarkTexture = svg(
    `<svg viewBox="0 0 200 120">
      <path d="M20 80 Q0 56 28 44 Q34 16 62 29 Q82 3 112 28
               Q154 12 162 45 Q197 46 184 74 Q176 94 143 93
               L49 95 Q18 103 20 80Z"
        fill="#286675" stroke="#f6d18b" stroke-width="5"/>
      <path d="M33 73 Q18 55 39 51 Q62 47 62 66 Q62 82 48 79
               M60 47 Q79 20 103 41 Q117 58 102 66 Q89 72 86 60
               M112 44 Q144 28 151 50 Q157 68 140 72
               M38 86 Q82 83 106 84 Q146 89 171 74"
        fill="none" stroke="#ffe6a1" stroke-width="5" stroke-linecap="round"/>
      <path d="M77 88 L101 103 L124 88"
        fill="none" stroke="#f6d18b" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const hoofTexture = svg(
    `<svg viewBox="0 0 60 100">
      <path d="M8 86 L52 86 M13 74 L13 31 Q13 13 29 20
               Q43 26 33 38 Q23 46 21 35
               M29 71 L21 60 L30 48 L40 60Z"
        fill="none" stroke="#f0cd88" stroke-width="4"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { size: 192 },
  );

  const sealTexture = svg(
    `<svg viewBox="0 0 512 512">
      <g fill="none" stroke="#bea879">
        <circle cx="256" cy="256" r="235" stroke-width="5"/>
        <circle cx="256" cy="256" r="218" stroke-width="2"/>
        <circle cx="256" cy="256" r="177" stroke-width="3"/>
        <path d="M256 35 L273 63 L256 91 L239 63Z
                 M256 421 L273 449 L256 477 L239 449Z
                 M35 256 L63 239 L91 256 L63 273Z
                 M421 256 L449 239 L477 256 L449 273Z" stroke-width="4"/>
        <path d="M132 103 Q172 81 183 108 Q191 129 174 132
                 M329 104 Q356 77 381 111
                 M126 394 Q158 423 184 398
                 M329 403 Q362 424 385 390" stroke-width="5"/>
        <path d="M156 214 Q124 175 160 156 Q194 137 209 168
                 Q222 194 201 202 Q182 210 181 191
                 M300 195 Q280 152 319 141 Q350 134 358 166
                 M151 321 Q176 343 198 326
                 M305 327 Q344 347 365 315"
          stroke-width="5" stroke-linecap="round"/>
        <path d="M251 120 L256 107 L261 120 M251 392 L256 405 L261 392
                 M120 251 L107 256 L120 261 M392 251 L405 256 L392 261"
          stroke-width="3"/>
      </g>
    </svg>`,
    { size: 768 },
  );

  const plaqueTexture = svg(
    `<svg viewBox="0 0 400 100">
      <rect x="4" y="4" width="392" height="92" rx="12"
        fill="#203b50" stroke="#e4c184" stroke-width="5"/>
      <path d="M20 50 L34 36 L48 50 L34 64Z M352 50 L366 36 L380 50 L366 64Z"
        fill="#e4c184"/>
      <text x="200" y="44" text-anchor="middle" font-family="serif"
        font-size="27" letter-spacing="6" fill="#fff0c5">QILIN</text>
      <text x="200" y="72" text-anchor="middle" font-family="serif"
        font-size="12" letter-spacing="3" fill="#a9dbd5">AUSPICIOUS CLOUD</text>
    </svg>`,
    { size: 512 },
  );

  // Skeleton: neutral, separated four-legged stance.
  const stage = b.joint("stage", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stage,
    at: [0, 1.48, -0.63],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain("spine", [
    [0, 1.48, -0.63],
    [0, 1.54, -0.18],
    [0, 1.61, 0.37],
    [0, 1.65, 0.61],
  ], {
    parent: hips,
    names: ["lumbar", "chest", "withers"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([
    [0, 1.65, 0.58],
    [0, 1.91, 0.62],
    [0, 2.18, 0.76],
    [0, 2.40, 0.94],
  ]), {
    parent: spine,
    names: ["neckBase", "neckMid", "neckTop"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.42, 0.97],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.25, 1.05],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const tail = b.chain("tail", catmull([
    [0, 1.53, -0.83],
    [0, 1.63, -1.12],
    [0, 1.64, -1.48],
    [0, 1.82, -1.84],
    [0, 2.05, -2.06],
  ]), { parent: hips, count: 5, role: "tail" });

  const legs = [1, -1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    return [
      {
        s, front: true, side, z: 0.69,
        chain: b.chain(`foreleg${side}`, [
          [s * 0.35, 1.56, 0.53],
          [s * 0.42, 1.08, 0.48],
          [s * 0.47, 0.65, 0.66],
          [s * 0.49, 0.29, 0.69],
        ], {
          parent: spine,
          names: [`shoulder${side}`, `elbow${side}`, `carpus${side}`, `hoofF${side}`],
          role: "leg",
          contact: [s * 0.49, 0.12, 0.74],
        }),
      },
      {
        s, front: false, side, z: -0.73,
        chain: b.chain(`hindleg${side}`, [
          [s * 0.36, 1.45, -0.60],
          [s * 0.44, 0.99, -0.43],
          [s * 0.48, 0.55, -0.87],
          [s * 0.49, 0.29, -0.73],
        ], {
          parent: hips,
          names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`],
          role: "leg",
          contact: [s * 0.49, 0.12, -0.68],
        }),
      },
    ];
  });

  const ears = [1, -1].map((s) => ({
    s,
    bone: b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: [s * 0.22, 2.63, 0.91],
      dir: [s, 0.6, -0.15],
      role: "hinge",
    }),
  }));

  type Bone = typeof head;
  type Fill = Parameters<typeof b.part>[1];

  function ellipsoid(
    at: number[], size: number[], color: Fill, bone: Bone,
    name: string, rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at, scale: size, rotation, bone, name, flat: true,
    });
  }

  function bead(
    at: number[], radius: number, color: Fill, bone: Bone, name: string,
  ) {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, {
      at, bone, name,
    });
  }

  function frontDrawing(
    texture: THREE.Texture, at: number[], size: [number, number],
    bone: Bone, name: string, dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at, dir, axis: "z", texture, bone, name,
    });
  }

  function shieldGeometry(width: number, length: number) {
    const outline = [
      [-0.44, -0.48], [0.44, -0.48], [0.48, 0.02],
      [0, 0.50], [-0.48, 0.02],
    ];
    const vertices = [0, width * 0.085, -length * 0.035];
    const uvs = [0.5, 0.535];
    for (const [x, z] of outline) {
      vertices.push(x * width, 0, z * length);
      uvs.push(x + 0.5, 0.5 - z);
    }
    vertices.push(0, -0.009, 0);
    uvs.push(0.5, 0.5);
    const index: number[] = [];
    for (let i = 0; i < 5; i++) {
      const a = i + 1;
      const c = ((i + 1) % 5) + 1;
      index.push(0, c, a, 6, a, c);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    return geometry;
  }

  // Cloud scrolls have volume, taper and a recessed inner spiral.
  // The outer stroke overlaps its solid core all the way around.
  function cloudScroll(
    center: number[], radius: number, bone: Bone,
    side: number, name: string, blue = false,
  ) {
    const [x, y, z] = center;
    ellipsoid(
      center,
      [radius * 0.72, radius * 0.94, radius * 1.16],
      blue ? cloudBlue : cloud, bone, `${name}Mass`,
      [side * 10, 0, 0],
    );

    const surfaceX = x + side * radius * 0.55;
    const outer = catmull([
      [surfaceX, y - radius * 0.68, z + radius * 0.55],
      [surfaceX, y - radius * 0.77, z - radius * 0.31],
      [surfaceX, y - radius * 0.22, z - radius * 0.88],
      [surfaceX, y + radius * 0.57, z - radius * 0.65],
      [surfaceX, y + radius * 0.78, z + radius * 0.12],
      [surfaceX, y + radius * 0.33, z + radius * 0.56],
      [surfaceX, y - radius * 0.06, z + radius * 0.24],
      [surfaceX, y + radius * 0.04, z - radius * 0.05],
    ]);
    b.sweep(outer, [radius * 0.26, radius * 0.30, radius * 0.25, radius * 0.12], {
      bone, color: blue ? cloud : ivory, sides: 8,
      name: `${name}SculptedScroll`,
    });

    const innerX = surfaceX + side * radius * 0.16;
    b.sweep(catmull([
      [innerX, y - radius * 0.48, z - radius * 0.27],
      [innerX, y - radius * 0.07, z - radius * 0.57],
      [innerX, y + radius * 0.41, z - radius * 0.35],
      [innerX, y + radius * 0.39, z + radius * 0.15],
      [innerX, y + radius * 0.10, z + radius * 0.22],
    ]), [radius * 0.04, radius * 0.025], {
      bone, color: C.cloudShadow, sides: 5,
      name: `${name}Recess`,
    });
  }

  function flowingLock(
    points: number[][], width: number, bone: Bone,
    color: Fill, name: string,
  ) {
    return b.sweep(catmull(points), [width, width * 0.94, width * 0.54, 0], {
      bone, color, sides: 8, caps: "flat", name,
    });
  }

  // Face: eyes are deliberately biased toward the front rather than the temples.
  const H = 1.12;
  const face = b.region({ at: [0, 2.42, 0.97], scale: H, bone: head });
  const skull = face.part(new THREE.SphereGeometry(1, 16, 11), jade, {
    at: [0, 0.035, 0.045],
    scale: [0.255, 0.285, 0.335],
    name: "JadeSkull",
    flat: true,
  });

  const upperMuzzle = b.loft([
    { at: face.p([0, -0.085, 0.15]), w: H * 0.34, h: H * 0.25 },
    { at: face.p([0, -0.115, 0.32]), w: H * 0.29, h: H * 0.205 },
    { at: face.p([0, -0.135, 0.445]), w: H * 0.265, h: H * 0.155 },
  ], {
    bone: head, color: belly, sides: 8,
    caps: "round", name: "UpperMuzzle",
  });
  b.loft([
    { at: [0, 2.225, 1.11], w: 0.275, h: 0.085 },
    { at: [0, 2.205, 1.37], w: 0.245, h: 0.085 },
    { at: [0, 2.22, 1.49], w: 0.225, h: 0.055 },
  ], {
    bone: jaw, color: cloud, caps: "round",
    sides: 8, name: "LowerJaw",
  });
  b.sweep([
    [0, 2.256, 1.20], [0, 2.25, 1.43], [0, 2.26, 1.50],
  ], () => [0.114, 0.009], {
    bone: jaw, color: C.ink, sides: 6,
    caps: "round", name: "MouthInterior",
  });

  for (const s of [1, -1]) {
    const eyeHit = b.surface(skull).around(skull.at).at(s * 36, 12);
    b.decal(skull, eyeTexture, {
      at: eyeHit,
      size: [0.225, 0.254],
      dir: [s * 0.42, 0.04, 1],
      mirror: s > 0,
      bone: head, lift: 0.003,
      name: `GoldenEye${s > 0 ? "L" : "R"}`,
    });

    b.sweep(bezier(
      [s * 0.09, 2.70, 1.205],
      [s * 0.21, 2.765, 1.225],
      [s * 0.32, 2.69, 1.14],
    ), [0.027, 0.012], {
      bone: head, color: ivory, sides: 7, name: `RaisedBrow${s}`,
    });

    const nostrilHit = b.surface(upperMuzzle).nearest([s * 0.12, 2.34, 1.46]);
    b.stick(new THREE.SphereGeometry(1, 8, 5), C.deep, nostrilHit, {
      scale: [0.031, 0.011, 0.019], embed: 0.35, name: `Nostril${s}`,
    });

    b.sweep(bezier(
      [s * 0.12, 2.25, 1.47],
      [s * 0.15, 2.235, 1.35],
      [s * 0.165, 2.29, 1.17],
    ), 0.006, {
      bone: jaw, color: C.deep, sides: 5, name: `MouthCorner${s}`,
    });

    b.sweep(bezier(
      [s * 0.145, 2.30, 1.34],
      [s * 0.33, 2.285, 1.50],
      [s * 0.46, 2.395, 1.45],
      [s * 0.47, 2.47, 1.37],
    ), [0.014, 0], {
      bone: head, color: ivory, sides: 6, name: `Whisker${s}`,
    });
  }

  b.decal(skull, sigilTexture, {
    at: [0, 2.65, 1.245], dir: [0, 0.25, 1],
    size: [0.13, 0.24], bone: head, lift: 0.004,
    name: "ForeheadFlameSeal",
  });

  for (const { s, bone } of ears) {
    b.extrude(
      [[0, 0], [0.12, -0.015], [0.35, 0.16], [0.33, 0.25], [0.14, 0.22]],
      {
        at: bone.at, x: [s, 0, -0.12], y: [0, 1, 0],
        thickness: 0.065, bevel: 0.008, color: jade, bone,
        name: `EarLeaf${s}`,
      },
    );
    b.extrude(
      [[0.055, 0.025], [0.12, 0.025], [0.29, 0.17], [0.27, 0.205], [0.14, 0.17]],
      {
        at: [s * 0.22, 2.63, 0.948],
        x: [s, 0, -0.12], y: [0, 1, 0], thickness: 0.008,
        color: C.plum, bone, name: `EarVelvet${s}`,
      },
    );
    b.sweep([
      [s * 0.29, 2.675, 0.947],
      [s * 0.39, 2.735, 0.937],
      [s * 0.49, 2.81, 0.925],
    ], [0.009, 0.003], {
      bone, color: C.goldLight, sides: 5, name: `EarVein${s}`,
    });
  }

  // Barrel and neck.
  const body = b.sweep(
    spine,
    (t) => [
      0.32 + 0.105 * Math.sin(Math.PI * t),
      0.36 + 0.095 * Math.sin(Math.PI * t),
    ],
    {
      color: jade, sides: 12, caps: "round",
      sectors: [[126, 234, belly]], name: "ScaledBarrel",
    },
  );
  const neckTube = b.sweep(
    neck,
    (t) => [0.285 - t * 0.095, 0.33 - t * 0.12],
    {
      color: jade, sides: 10, caps: "round",
      sectors: [[125, 235, belly]], name: "ProudNeck",
    },
  );

  const scaleGeo = shieldGeometry(0.205, 0.225);
  const smallScaleGeo = shieldGeometry(0.135, 0.17);
  const barrelSkin = b.surface(body);
  const scaleColors = ["#70c8b8", "#91ddc7", "#59b7ac", "#ace7ce"];

  // Bottom row first: upper rows visually overlap the roots below.
  for (const s of [1, -1]) {
    for (let row = 0; row < 4; row++) {
      const y = 1.265 + row * 0.15;
      for (let col = 0; col < 7; col++) {
        const z = -0.67 + col * 0.18 + (row % 2) * 0.075;
        const hit = barrelSkin.ray([s * 1.6, y, z], [-s, 0, 0]);
        if (!hit) continue;
        b.stick(scaleGeo, scaleColors[(col + row * 2) % scaleColors.length], hit, {
          texture: scaleTexture,
          embed: 0.16,
          flow: [0, -0.94, -0.34],
          name: `FlankScale${s}_${row}_${col}`,
        });
      }
    }
    const ns = b.surface(neckTube);
    for (let row = 0; row < 4; row++) {
      const y = 1.83 + row * 0.115;
      for (let col = 0; col < 2; col++) {
        const z = 0.58 + row * 0.046 + col * 0.14;
        const hit = ns.ray([s * 1.2, y, z], [-s, 0, 0]);
        if (!hit) continue;
        b.stick(smallScaleGeo, row % 2 ? C.turquoise : C.jade, hit, {
          texture: scaleTexture,
          flow: [0, -1, -0.15],
          embed: 0.16,
          name: `NeckScale${s}_${row}_${col}`,
        });
      }
    }
  }

  b.along(body, 8, (at) => {
    b.stick(new THREE.ConeGeometry(0.05, 0.15, 4), gold, at, {
      embed: 0.28, spin: 45, name: "GildedDorsalLeaf",
    });
  }, { from: 0.12, to: 0.79 });

  // Limbs and cloven hoof assemblies.
  for (const leg of legs) {
    const { s, front, side, chain, z } = leg;
    const legTube = b.sweep(
      chain,
      front ? [0.15, 0.115, 0.085, 0.065] : [0.20, 0.155, 0.082, 0.065],
      {
        color: jade, sides: 8, caps: "round",
        sectors: [[125, 235, belly]],
        name: `${front ? "Fore" : "Hind"}Leg${side}`,
      },
    );
    const footBone = chain.tip!;
    const footX = s * 0.49;

    for (const split of [-1, 1]) {
      const hoofX = footX + split * 0.071;
      b.extrude(
        [[-0.11, 0], [0.18, 0], [0.185, 0.07], [0.095, 0.185], [-0.09, 0.17]],
        {
          at: [hoofX, 0.12, z],
          x: [0, 0, 1], y: [0, 1, 0],
          thickness: 0.114, bevel: 0.009,
          color: C.ink, bone: footBone,
          name: `ClovenHoof${front ? "F" : "H"}${side}_${split}`,
        },
      );
      b.extrude(
        [[-0.103, 0.025], [0.177, 0.025], [0.181, 0.052], [-0.103, 0.052]],
        {
          at: [hoofX, 0.12, z],
          x: [0, 0, 1], y: [0, 1, 0],
          thickness: 0.116, color: gold, bone: footBone,
          name: "HoofGildedSole",
        },
      );
      frontDrawing(
        hoofTexture, [hoofX, 0.215, z + 0.186],
        [0.092, 0.143], footBone,
        `HoofEngraving${front ? "F" : "H"}${side}_${split}`,
      );
    }

    b.part(new THREE.CylinderGeometry(0.095, 0.11, 0.07, 10), gold, {
      at: [footX, 0.35, z], bone: footBone, name: "FetlockGoldCuff",
    });
    bead([footX, 0.36, z + 0.105], 0.037, C.turquoise, footBone, "FetlockJade");

    // A single scalloped cloud cuff rather than a bracelet of detached balls.
    ellipsoid(
      [footX, 0.425, z],
      [0.106, 0.082, 0.12], cloudBlue, footBone, "CloudFetlockCore",
    );
    for (const sideOffset of [-1, 1]) {
      ellipsoid(
        [footX + sideOffset * 0.062, 0.43, z + 0.035],
        [0.063, 0.069, 0.083], cloud, footBone, "CloudFetlockLobe",
      );
    }

    const kneeHit = b.surface(legTube).nearest(
      [s * 0.58, chain.at(front ? 0.63 : 0.42).at.y,
        chain.at(front ? 0.63 : 0.42).at.z + 0.035],
    );
    b.stick(smallScaleGeo, C.goldLight, kneeHit, {
      texture: scaleTexture, flow: [0, -1, 0],
      embed: 0.15, name: "GoldenKneeShield",
    });

    // Scale continuity across the previously bare shoulders and haunches.
    const ls = b.surface(legTube);
    for (let row = 0; row < 3; row++) {
      const p = chain.at(0.08 + row * 0.085).at;
      for (const dz of [-0.052, 0.058]) {
        const hit = ls.ray([s * 1.3, p.y, p.z + dz], [-s, 0, 0]);
        if (!hit) continue;
        b.stick(smallScaleGeo, row % 2 ? C.turquoise : "#9bdcc3", hit, {
          texture: scaleTexture, flow: [0, -1, -0.2],
          embed: 0.18, name: `LimbScale${front ? "F" : "H"}${side}_${row}_${dz}`,
        });
      }
    }

    b.sweep(bezier(
      [s * 0.49, 0.46, z - 0.035],
      [s * 0.51, 0.58, z - 0.25],
      [s * 0.52, 0.79, z - 0.23],
    ), [0.065, 0.037, 0], {
      bone: chain.joints[2], color: cloudBlue,
      sides: 7, name: "FetlockFlame",
    });
  }

  // Collar and pendant.
  const collarLoop = b.surface(neckTube).loop([0, 1.84, 0.64], {
    dir: [0, 1, 0.1], lift: 0.016,
  });
  b.sweep(collarLoop, 0.025, {
    bone: neck.joints[0], color: gold, sides: 7, name: "CelestialCollar",
  });
  b.along(collarLoop, 12, (at) => {
    b.part(new THREE.IcosahedronGeometry(0.019, 0), C.goldLight, {
      at, name: "CollarPearl",
    });
  });
  b.extrude(
    [[0, 0.14], [0.10, 0.035], [0.072, -0.07],
      [0, -0.14], [-0.072, -0.07], [-0.10, 0.035]],
    {
      at: [0, 1.74, 0.958],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035,
      bevel: 0.008, color: gold, bone: neck.joints[0],
      name: "PendantGoldSetting",
    },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.071, 0), C.mint, {
    at: [0, 1.75, 0.989], scale: [0.72, 1.22, 0.38],
    bone: neck.joints[0], name: "AuspiciousHeartStone",
  }), 0.8);

  for (const s of [-1, 1]) {
    b.sweep([
      [s * 0.04, 1.64, 0.97],
      [s * 0.052, 1.53, 0.963],
    ], 0.009, {
      bone: neck.joints[0], color: gold, sides: 5, name: "PendantCord",
    });
    bead(
      [s * 0.052, 1.52, 0.963], 0.022,
      C.goldLight, neck.joints[0], "PendantDrop",
    );
  }

  // Emblems are seated on the barrel, behind the shoulder joint.
  for (const s of [1, -1]) {
    const hit = barrelSkin.ray([s * 1.2, 1.70, 0.22], [-s, 0, 0]);
    if (!hit) continue;
    const plaque = b.stick(new THREE.SphereGeometry(1, 12, 8), C.deep, hit, {
      scale: [0.19, 0.035, 0.135],
      embed: 0.22,
      flow: [0, 1, 0],
      name: `CloudShoulderPlaque${s}`,
    });
    b.decal(plaque, cloudMarkTexture, {
      at: hit,
      dir: [s, 0.12, 0],
      size: [0.33, 0.20],
      bone: hit.bone!,
      lift: 0.003,
      name: `CloudShoulderInsignia${s}`,
    });
  }

  // A continuous ruff underlies the sculpted cloud scrolls.
  for (const s of [1, -1]) {
    b.sweep(catmull([
      [s * 0.14, 2.69, 0.76],
      [s * 0.21, 2.48, 0.59],
      [s * 0.25, 2.25, 0.42],
      [s * 0.27, 2.03, 0.28],
      [s * 0.26, 1.81, 0.09],
      [s * 0.22, 1.70, -0.10],
    ]), [0.11, 0.15, 0.17, 0.16, 0.10, 0], {
      bone: [head, neck, spine],
      color: cloudBlue,
      sides: 8,
      caps: "flat",
      name: `ContinuousCloudRuff${s}`,
    });

    const clusters = [
      { p: [s * 0.17, 2.65, 0.73], r: 0.155, bone: head },
      { p: [s * 0.23, 2.43, 0.55], r: 0.18, bone: neck.joints[2] },
      { p: [s * 0.27, 2.18, 0.37], r: 0.205, bone: neck.joints[1] },
      { p: [s * 0.29, 1.93, 0.20], r: 0.20, bone: neck.joints[0] },
      { p: [s * 0.28, 1.73, -0.01], r: 0.145, bone: spine.joints[1] },
    ];
    clusters.forEach((c, i) => {
      cloudScroll(c.p, c.r, c.bone, s, `Mane${s}_${i}`, i === 2);
    });

    cloudScroll([s * 0.245, 2.265, 1.015], 0.108, head, s, `CheekCloud${s}`);

    // These longer locks carry the signature flowing-cloud silhouette.
    flowingLock([
      [s * 0.23, 2.48, 0.55],
      [s * 0.32, 2.47, 0.26],
      [s * 0.38, 2.64, 0.06],
      [s * 0.33, 2.79, 0.02],
    ], 0.105, head, cloud, `UpperManeLock${s}`);

    flowingLock([
      [s * 0.28, 2.19, 0.31],
      [s * 0.35, 2.12, 0.00],
      [s * 0.40, 2.22, -0.29],
      [s * 0.34, 2.39, -0.38],
    ], 0.12, neck.joints[1], cloudBlue, `MiddleManeLock${s}`);

    flowingLock([
      [s * 0.29, 1.95, 0.12],
      [s * 0.36, 1.83, -0.18],
      [s * 0.38, 1.88, -0.45],
      [s * 0.32, 2.03, -0.57],
    ], 0.10, neck.joints[0], cloud, `LowerManeLock${s}`);

    // Narrow ivory highlights are embedded on the outer faces of the locks.
    b.sweep(bezier(
      [s * 0.34, 2.19, 0.22],
      [s * 0.43, 2.12, -0.08],
      [s * 0.40, 2.29, -0.31],
    ), [0.016, 0], {
      bone: neck.joints[1], color: ivory,
      sides: 6, name: `ManeHighlight${s}`,
    });
  }

  // Asymmetrical forelock curls upward, not across the face.
  ellipsoid(
    [0, 2.755, 0.95], [0.145, 0.09, 0.19],
    cloud, head, "CrownCloud",
  );
  flowingLock([
    [0.015, 2.76, 0.98],
    [0.06, 2.89, 0.96],
    [0.055, 2.94, 0.82],
    [-0.025, 2.90, 0.77],
  ], 0.072, head, cloud, "CrownCloudCurl");

  // Branching ivory-and-gold antlers.
  for (const s of [1, -1]) {
    const A = [
      [s * 0.18, 2.70, 0.80],
      [s * 0.24, 2.91, 0.70],
      [s * 0.35, 3.11, 0.55],
      [s * 0.48, 3.30, 0.44],
      [s * 0.59, 3.48, 0.46],
    ];
    b.sweep(A, [0.075, 0.065, 0.047, 0.03, 0], {
      bone: head, color: ivory, sides: 7,
      bands: [[0.80, ivory], [1, gold]],
      caps: "flat", name: `AntlerBeam${s}`,
    });
    b.part(new THREE.CylinderGeometry(0.084, 0.09, 0.065, 10), gold, {
      at: A[0], dir: [s * 0.10, 1, -0.38],
      bone: head, name: `AntlerRootBand${s}`,
    });

    const branches = [
      [A[1], [s * 0.43, 3.03, 0.88], [s * 0.49, 3.22, 0.91]],
      [A[2], [s * 0.58, 3.18, 0.62], [s * 0.76, 3.33, 0.60]],
      [A[3], [s * 0.43, 3.46, 0.25], [s * 0.47, 3.60, 0.23]],
      [A[2], [s * 0.27, 3.27, 0.42], [s * 0.24, 3.39, 0.44]],
    ];
    branches.forEach((points, i) => {
      b.sweep(points, [0.045 - i * 0.003, 0.026, 0], {
        bone: head, color: ivory,
        bands: [[0.64, ivory], [1, gold]],
        sides: 6, caps: "flat", name: `AntlerTine${s}_${i}`,
      });
    });
    b.sweep([
      [s * 0.21, 2.79, 0.782],
      [s * 0.275, 2.96, 0.695],
      [s * 0.375, 3.115, 0.57],
    ], [0.008, 0.003], {
      bone: head, color: C.goldDark, sides: 5, name: `AntlerInlay${s}`,
    });
    bead(
      [s * 0.205, 2.755, 0.87], 0.029,
      C.mint, head, `AntlerRootJewel${s}`,
    );
  }

  // Extended dragon tail; the plume repeats the mane's sculptural vocabulary.
  const tailTube = b.sweep(tail, [0.13, 0.105, 0.08, 0.063, 0.035], {
    color: jade, sectors: [[130, 230, belly]],
    sides: 9, caps: "round", name: "DragonTail",
  });
  b.along(tailTube, 7, (at) => {
    b.stick(new THREE.ConeGeometry(0.032, 0.095, 4), gold, at, {
      embed: 0.22, spin: 45, name: "TailGoldCrest",
    });
  }, { from: 0.12, to: 0.82 });

  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.stick(smallScaleGeo, i % 2 ? C.mint : C.turquoise,
        tailTube.at(0.16 + i * 0.15, s * 80), {
          texture: scaleTexture, flow: [0, -0.4, -1],
          embed: 0.16, name: "TailShield",
        });
    }
  }

  const tailBone = tail.joints[tail.joints.length - 1];
  ellipsoid(
    [0, 2.105, -2.115], [0.17, 0.235, 0.20],
    cloudBlue, tailBone, "TailPlumeMass",
  );
  for (const s of [1, -1]) {
    cloudScroll(
      [s * 0.09, 2.105, -2.105], 0.165,
      tailBone, s, `TailCloud${s}`, s < 0,
    );
    flowingLock([
      [s * 0.07, 2.11, -2.10],
      [s * 0.18, 2.26, -2.27],
      [s * 0.17, 2.48, -2.25],
      [s * 0.06, 2.57, -2.13],
    ], 0.10, tailBone, s > 0 ? cloud : cloudBlue, `TailCloudFlame${s}`);
  }
  flowingLock([
    [0, 2.18, -2.13],
    [0, 2.39, -2.25],
    [0, 2.56, -2.17],
    [0, 2.61, -2.03],
  ], 0.075, tailBone, ivory, "TailPlumeCrown");

  // A divided, tapering beard instead of a single square chin block.
  for (const s of [-1, 1]) {
    flowingLock([
      [s * 0.025, 2.20, 1.245],
      [s * 0.045, 2.105, 1.21],
      [s * 0.05, 2.04, 1.105],
      [s * 0.025, 2.085, 1.055],
    ], 0.036, jaw, s > 0 ? cloud : cloudBlue, `CloudBeard${s}`);
  }

  // Low elliptical moonstone seal, top at y = .12.
  b.part(new THREE.CylinderGeometry(1, 1.025, 0.095, 48), stone, {
    at: [0, 0.0475, -0.32], scale: [1.03, 1, 2.10],
    bone: stage, name: "MoonstoneSealBase",
  });
  b.part(new THREE.CylinderGeometry(0.99, 1, 0.025, 48), C.stone, {
    at: [0, 0.1075, -0.32], scale: [1.03, 1, 2.10],
    bone: stage, name: "MoonstoneSealTop",
  });

  const rimPath = catmull(Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    return [Math.sin(a) * 1.018, 0.088, -0.32 + Math.cos(a) * 2.075];
  }), { closed: true });

  b.sweep(rimPath, 0.012, {
    bone: stage, color: gold, sides: 6, name: "SealGoldRim",
  });
  b.part(new THREE.PlaneGeometry(1.97, 4.02), "#ffffff", {
    at: [0, 0.1215, -0.32], rotation: [-90, 0, 0],
    texture: sealTexture, bone: stage, name: "EngravedCelestialSeal",
  });

  // Ground mist is clustered into small connected banks at the rear corners.
  for (const s of [-1, 1]) {
    ellipsoid(
      [s * 0.72, 0.155, -1.22], [0.17, 0.035, 0.43],
      cloudBlue, stage, "GroundMistBank",
    );
    for (let i = 0; i < 3; i++) {
      ellipsoid(
        [s * (0.66 + i * 0.055), 0.17 + i * 0.012, -1.45 + i * 0.23],
        [0.14, 0.055 + random() * 0.018, 0.21],
        i % 2 ? cloudBlue : cloud, stage, "GroundMistLobe",
      );
    }
    b.sweep(arc(
      [s * 0.65, 0.15, -1.05],
      [s * 0.83, 0.15, -1.05],
      [0, 1, 0], s * 260,
    ), 0.019, {
      bone: stage, color: C.mint, sides: 6, name: "GroundCloudScroll",
    });
  }

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    glow(b.part(new THREE.OctahedronGeometry(0.032, 0), C.mint, {
      at: [Math.sin(a) * 0.963, 0.125, -0.32 + Math.cos(a) * 1.96],
      scale: [1, 0.23, 1.3],
      rotation: [0, a * 180 / Math.PI, 0],
      bone: stage, name: "SealJadeInlay",
    }), 0.45);
  }

  // Set the plaque vertically inside the rim, rather than intersecting its top.
  b.part(new THREE.BoxGeometry(0.56, 0.10, 0.036), gold, {
    at: [0, 0.075, 1.775], bone: stage, name: "TitlePlateFrame",
  });
  frontDrawing(
    plaqueTexture, [0, 0.075, 1.795], [0.535, 0.086],
    stage, "TitlePlate",
  );

  return b.root;
}
```