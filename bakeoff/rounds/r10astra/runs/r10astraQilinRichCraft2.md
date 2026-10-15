```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  arc,
  paint,
  mix,
  noise,
  svg,
} from "agentic-3js-builder";
import { animeEye, cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Qilin of the Auspicious Clouds",
  description:
    "A jade-scaled qilin with branching ivory antlers, cloven obsidian hooves, a flowing cloud mane and celestial gold markings, standing on an ancient moonstone seal.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "AuspiciousCloudQilin",
    detail: 0.85,
    paintSize: 2048,
  });
  const random = rng(82173);

  const C = {
    ink: "#17253f",
    deep: "#143e50",
    jade: "#368f91",
    turquoise: "#63c9bd",
    mint: "#b4eee0",
    pale: "#e8f8e9",
    cream: "#fff2ce",
    gold: "#dca952",
    goldLight: "#ffe4a0",
    goldDark: "#98683e",
    lavender: "#9fadd1",
    cloudShadow: "#94b9cf",
    pink: "#df95b0",
    plum: "#725580",
    stone: "#374a65",
  };

  const jade = paint((p, n) => {
    const v = noise(p, 0.19, 19);
    return mix(
      n.y < -0.25 ? "#24526b" : "#337e88",
      "#83d6c0",
      0.28 + v * 0.4 + Math.max(0, n.y) * 0.25,
    );
  });
  const belly = cel("#b2e0c8", "#659aab");
  const cloud = cel("#fff7dc", "#adcbdc", { threshold: -0.05 });
  const cloudBlue = cel("#c6e9e5", "#87abc8");
  const ivory = cel("#fff1ca", "#c8b5a7");
  const gold = paint((p, n) =>
    mix("#ab773e", "#ffe5a0", 0.3 + 0.45 * Math.max(n.y, 0) + noise(p, 0.09, 8) * 0.25),
  );
  const stone = paint((p, n) =>
    mix("#29364f", "#657b91", 0.2 + noise(p, 0.24, 38) * 0.4 + Math.max(n.y, 0) * 0.2),
  );

  // Drawings are shared across their mirrored or repeated pieces.
  const eyeTexture = animeEye({
    iris: "#edb24c",
    irisLight: "#fff2ad",
    irisDark: "#b85248",
    ink: C.ink,
    blush: false,
    brow: false,
    size: 512,
  });

  const scaleTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M7 8 L93 8 L96 61 L50 113 L4 61Z" fill="#c8c8c8"/>
      <path d="M8 12 L13 59 L50 103 L87 59 L92 12"
        fill="none" stroke="#f8f8f8" stroke-width="5" stroke-linejoin="round"/>
      <path d="M20 28 Q50 44 80 28 M22 43 Q50 59 78 43"
        fill="none" stroke="#787878" stroke-width="3"/>
      <path d="M50 45 L50 91 M33 63 L50 82 L67 63"
        fill="none" stroke="#eeeeee" stroke-width="3"/>
      <path d="M13 13 L87 13" stroke="#777777" stroke-width="6"/>
      <path d="M17 21 L39 21" stroke="#ffffff" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const sigilTexture = svg(
    `<svg viewBox="0 0 100 160">
      <path d="M50 7 Q68 37 51 53 Q91 39 84 72 Q78 93 57 105
               L50 150 L43 105 Q11 90 16 65 Q21 46 39 55 Q26 29 50 7Z"
        fill="#214a64" stroke="#ffe5a1" stroke-width="5"/>
      <path d="M50 24 Q39 42 50 61 Q70 52 69 69 Q69 85 51 94
               Q31 84 31 70 Q31 58 43 67 L50 118"
        fill="none" stroke="#ffe5a1" stroke-width="5" stroke-linecap="round"/>
      <path d="M50 61 L60 78 L50 96 L40 78Z" fill="#b9ffe7"/>
    </svg>`,
    { size: 256 },
  );

  const cloudMarkTexture = svg(
    `<svg viewBox="0 0 200 120">
      <path d="M20 80 Q0 56 28 44 Q34 16 62 29 Q82 3 112 28
               Q154 12 162 45 Q197 46 184 74 Q176 94 143 93
               L49 95 Q18 103 20 80Z"
        fill="#1e6171" stroke="#f6d18b" stroke-width="5"/>
      <path d="M33 73 Q18 55 39 51 Q62 47 62 66 Q62 82 48 79
               M60 47 Q79 20 103 41 Q117 58 102 66 Q89 72 86 60
               M112 44 Q144 28 151 50 Q157 68 140 72
               M38 86 Q82 83 106 84 Q146 89 171 74"
        fill="none" stroke="#ffe6a1" stroke-width="5" stroke-linecap="round"/>
      <path d="M77 88 L101 103 L124 88" fill="none" stroke="#f6d18b" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const hoofTexture = svg(
    `<svg viewBox="0 0 100 90">
      <path d="M8 75 L92 75 M17 65 L17 28 Q17 13 33 19
               Q47 25 36 35 Q28 42 25 33 M83 65 L83 28
               Q83 13 67 19 Q53 25 64 35 Q72 42 75 33
               M50 65 L38 51 L50 34 L62 51Z"
        fill="none" stroke="#f0c77f" stroke-width="5"
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
                 M421 256 L449 239 L477 256 L449 273Z"
          stroke-width="4"/>
        <path d="M132 103 Q172 81 183 108 Q191 129 174 132
                 M329 104 Q356 77 381 111
                 M126 394 Q158 423 184 398
                 M329 403 Q362 424 385 390"
          stroke-width="5"/>
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

  // Skeleton first: the terrestrial seal is the root, the creature is its own branch.
  const stage = b.joint("stage", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stage,
    at: [0, 1.48, -0.63],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 1.48, -0.63],
      [0, 1.54, -0.18],
      [0, 1.61, 0.37],
      [0, 1.65, 0.61],
    ],
    { parent: hips, names: ["lumbar", "chest", "withers"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.65, 0.58],
      [0, 1.91, 0.62],
      [0, 2.18, 0.76],
      [0, 2.40, 0.94],
    ]),
    { parent: spine, names: ["neckBase", "neckMid", "neckTop"], role: "neck" },
  );
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
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.53, -0.83],
      [0, 1.63, -1.12],
      [0, 1.64, -1.48],
      [0, 1.82, -1.84],
      [0, 2.05, -2.06],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );

  const legs = [1, -1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    return [
      {
        s,
        front: true,
        side,
        z: 0.69,
        chain: b.chain(
          `foreleg${side}`,
          [
            [s * 0.35, 1.56, 0.53],
            [s * 0.42, 1.08, 0.48],
            [s * 0.47, 0.65, 0.66],
            [s * 0.49, 0.29, 0.69],
          ],
          {
            parent: spine,
            names: [`shoulder${side}`, `elbow${side}`, `carpus${side}`, `hoofF${side}`],
            role: "leg",
            contact: [s * 0.49, 0.12, 0.74],
          },
        ),
      },
      {
        s,
        front: false,
        side,
        z: -0.73,
        chain: b.chain(
          `hindleg${side}`,
          [
            [s * 0.36, 1.45, -0.60],
            [s * 0.44, 0.99, -0.43],
            [s * 0.48, 0.55, -0.87],
            [s * 0.49, 0.29, -0.73],
          ],
          {
            parent: hips,
            names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`],
            role: "leg",
            contact: [s * 0.49, 0.12, -0.68],
          },
        ),
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

  // Small, reusable primitive assemblies.
  type Bone = typeof head;
  type Fill = Parameters<typeof b.part>[1];

  function ellipsoid(
    at: number[],
    size: number[],
    color: Fill,
    bone: Bone,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at,
      scale: size,
      rotation,
      bone,
      name,
      flat: true,
    });
  }

  function bead(at: number[], radius: number, color: Fill, bone: Bone, name: string) {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, {
      at,
      bone,
      name,
    });
  }

  function frontDrawing(
    texture: THREE.Texture,
    at: number[],
    size: [number, number],
    bone: Bone,
    name: string,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at,
      dir,
      axis: "z",
      texture,
      bone,
      name,
    });
  }

  // A triangular-faceted, closed shield scale, local +Y away from the skin.
  function shieldGeometry(width: number, length: number): THREE.BufferGeometry {
    const outline = [
      [-0.44, -0.48],
      [0.44, -0.48],
      [0.48, 0.02],
      [0, 0.50],
      [-0.48, 0.02],
    ];
    const vertices = [0, width * 0.14, -length * 0.035];
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

  function cloudCurl(
    center: number[],
    radius: number,
    bone: Bone,
    side: number,
    name: string,
    blue = false,
  ) {
    const [x, y, z] = center;
    ellipsoid(
      center,
      [radius * 0.76, radius, radius * 1.15],
      blue ? cloudBlue : cloud,
      bone,
      `${name}Core`,
      [side * 12, 0, 12],
    );
    ellipsoid(
      [x, y + radius * 0.55, z + radius * 0.44],
      [radius * 0.65, radius * 0.63, radius * 0.69],
      blue ? cloud : cloudBlue,
      bone,
      `${name}Crown`,
    );
    const outwardX = x + side * radius * 0.64;
    const curve = catmull([
      [outwardX, y - radius * 0.63, z + radius * 0.52],
      [outwardX, y - radius * 0.50, z - radius * 0.47],
      [outwardX, y + radius * 0.29, z - radius * 0.62],
      [outwardX, y + radius * 0.53, z + radius * 0.05],
      [outwardX, y + radius * 0.10, z + radius * 0.29],
      [outwardX, y - radius * 0.06, z + radius * 0.03],
    ]);
    b.sweep(curve, [radius * 0.13, radius * 0.085], {
      bone,
      color: blue ? C.cream : C.cloudShadow,
      sides: 6,
      name: `${name}Scroll`,
    });
  }

  // Face first. The muzzle is deliberately long enough to read as a deer/horse,
  // while the forehead and eye area have generous anime proportions.
  const H = 1.12;
  const face = b.region({ at: [0, 2.42, 0.97], scale: H, bone: head });
  const skull = face.part(new THREE.SphereGeometry(1, 14, 10), jade, {
    at: [0, 0.035, 0.045],
    scale: [0.255, 0.285, 0.335],
    name: "JadeSkull",
    flat: true,
  });

  const upperMuzzle = b.loft(
    [
      { at: face.p([0, -0.085, 0.15]), w: H * 0.34, h: H * 0.25 },
      { at: face.p([0, -0.115, 0.32]), w: H * 0.29, h: H * 0.205 },
      { at: face.p([0, -0.135, 0.47]), w: H * 0.28, h: H * 0.16 },
    ],
    { bone: head, color: belly, sides: 8, caps: "round", name: "UpperMuzzle" },
  );
  b.loft(
    [
      { at: [0, 2.225, 1.11], w: 0.275, h: 0.10 },
      { at: [0, 2.205, 1.39], w: 0.245, h: 0.105 },
      { at: [0, 2.22, 1.51], w: 0.235, h: 0.065 },
    ],
    { bone: jaw, color: cloud, caps: "round", sides: 8, name: "LowerJaw" },
  );
  b.sweep(
    [
      [0, 2.256, 1.20],
      [0, 2.25, 1.45],
      [0, 2.26, 1.52],
    ],
    () => [0.119, 0.012],
    { bone: jaw, color: C.ink, sides: 6, caps: "round", name: "MouthInterior" },
  );

  for (const s of [1, -1]) {
    const eyeHit = b.surface(skull).around(skull.at).at(s * 43, 12);
    b.decal(skull, eyeTexture, {
      at: eyeHit,
      size: [0.205, 0.276],
      dir: [s * 0.54, 0.05, 1],
      mirror: s > 0,
      bone: head,
      lift: 0.003,
      name: `GoldenEye${s > 0 ? "L" : "R"}`,
    });

    b.sweep(
      bezier(
        [s * 0.11, 2.71, 1.19],
        [s * 0.23, 2.76, 1.21],
        [s * 0.34, 2.68, 1.12],
      ),
      [0.031, 0.012],
      { bone: head, color: ivory, sides: 6, name: `RaisedBrow${s}` },
    );

    const nostrilHit = b.surface(upperMuzzle).nearest([s * 0.13, 2.34, 1.49]);
    b.stick(new THREE.SphereGeometry(1, 8, 5), C.deep, nostrilHit, {
      scale: [0.036, 0.013, 0.022],
      embed: 0.35,
      name: `Nostril${s}`,
    });

    b.sweep(
      bezier(
        [s * 0.129, 2.25, 1.49],
        [s * 0.155, 2.235, 1.36],
        [s * 0.17, 2.29, 1.17],
      ),
      0.008,
      { bone: jaw, color: C.deep, sides: 5, name: `MouthCorner${s}` },
    );

    // A pair of short white whiskers gives the muzzle its mythic identity.
    b.sweep(
      bezier(
        [s * 0.145, 2.30, 1.36],
        [s * 0.32, 2.29, 1.53],
        [s * 0.43, 2.40, 1.48],
        [s * 0.44, 2.46, 1.42],
      ),
      [0.015, 0],
      { bone: head, color: ivory, sides: 6, name: `Whisker${s}` },
    );
  }

  b.decal(skull, sigilTexture, {
    at: [0, 2.65, 1.245],
    dir: [0, 0.25, 1],
    size: [0.13, 0.24],
    bone: head,
    lift: 0.004,
    name: "ForeheadFlameSeal",
  });

  // Ears: solid leaf silhouettes, inset velvet and a single gilded vein.
  for (const { s, bone } of ears) {
    b.extrude(
      [[0, 0], [0.12, -0.015], [0.35, 0.16], [0.33, 0.25], [0.14, 0.22]],
      {
        at: bone.at,
        x: [s, 0, -0.12],
        y: [0, 1, 0],
        thickness: 0.065,
        bevel: 0.008,
        color: jade,
        bone,
        name: `EarLeaf${s}`,
      },
    );
    b.extrude(
      [[0.055, 0.025], [0.12, 0.025], [0.29, 0.17], [0.27, 0.205], [0.14, 0.17]],
      {
        at: [s * 0.22, 2.63, 0.948],
        x: [s, 0, -0.12],
        y: [0, 1, 0],
        thickness: 0.008,
        color: C.plum,
        bone,
        name: `EarVelvet${s}`,
      },
    );
    b.sweep(
      [
        [s * 0.29, 2.675, 0.947],
        [s * 0.39, 2.735, 0.937],
        [s * 0.49, 2.81, 0.925],
      ],
      [0.01, 0.004],
      { bone, color: C.goldLight, sides: 5, name: `EarVein${s}` },
    );
  }

  // Main silhouette: compact, substantial barrel; high, rising neck.
  const body = b.sweep(
    spine,
    (t) => [
      0.32 + 0.105 * Math.sin(Math.PI * t),
      0.36 + 0.095 * Math.sin(Math.PI * t),
    ],
    {
      color: jade,
      sides: 12,
      caps: "round",
      sectors: [[126, 234, belly]],
      name: "ScaledBarrel",
    },
  );
  const neckTube = b.sweep(
    neck,
    (t) => [0.285 - t * 0.095, 0.33 - t * 0.12],
    {
      color: jade,
      sides: 10,
      caps: "round",
      sectors: [[125, 235, belly]],
      name: "ProudNeck",
    },
  );

  // Broad, overlapping scales laid onto the actual barrel surface.
  const scaleGeo = shieldGeometry(0.205, 0.245);
  const smallScaleGeo = shieldGeometry(0.135, 0.17);
  const barrelSkin = b.surface(body);
  const scaleColors = [C.jade, C.turquoise, "#5fb6ab", "#83cdb7"];

  for (const s of [1, -1]) {
    for (let row = 0; row < 4; row++) {
      const y = 1.28 + row * 0.16;
      for (let col = 0; col < 7; col++) {
        const z = -0.67 + col * 0.185 + (row % 2) * 0.07;
        const hit = barrelSkin.ray([s * 1.6, y, z], [-s, 0, 0]);
        if (!hit) continue;
        b.stick(scaleGeo, scaleColors[(col + row * 2) % scaleColors.length], hit, {
          texture: scaleTexture,
          embed: 0.12,
          flow: [0, -0.14, -1],
          name: `FlankScale${s}_${row}_${col}`,
        });
      }
    }

    // Smaller scales climb the neck without covering its pale front.
    const ns = b.surface(neckTube);
    for (let row = 0; row < 4; row++) {
      const y = 1.83 + row * 0.115;
      for (let col = 0; col < 2; col++) {
        const z = 0.58 + row * 0.40 * 0.115 + col * 0.14;
        const hit = ns.ray([s * 1.2, y, z], [-s, 0, 0]);
        if (!hit) continue;
        b.stick(smallScaleGeo, row % 2 ? C.turquoise : C.jade, hit, {
          texture: scaleTexture,
          flow: [0, -1, -0.15],
          embed: 0.1,
          name: `NeckScale${s}_${row}_${col}`,
        });
      }
    }
  }

  // Gilded dorsal crest: modest, separated leaf-shaped spines.
  b.along(
    body,
    8,
    (at) => {
      b.stick(new THREE.ConeGeometry(0.062, 0.18, 4), gold, at, {
        embed: 0.25,
        spin: 45,
        name: "GildedDorsalLeaf",
      });
    },
    { from: 0.12, to: 0.79 },
  );

  // Four articulated legs and clearly cloven hooves.
  for (const leg of legs) {
    const { s, front, side, chain, z } = leg;
    b.sweep(chain, front ? [0.15, 0.115, 0.085, 0.065] : [0.20, 0.155, 0.082, 0.065], {
      color: jade,
      sides: 8,
      caps: "round",
      sectors: [[125, 235, belly]],
      name: `${front ? "Fore" : "Hind"}Leg${side}`,
    });
    const footBone = chain.tip!;
    const footX = s * 0.49;

    // Split hoof shells, each with its own flat ground contact.
    for (const split of [-1, 1]) {
      const hoofX = footX + split * 0.067;
      b.extrude(
        [[-0.11, 0], [0.18, 0], [0.185, 0.07], [0.095, 0.185], [-0.09, 0.17]],
        {
          at: [hoofX, 0.12, z],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.117,
          bevel: 0.009,
          color: C.ink,
          bone: footBone,
          name: `ClovenHoof${front ? "F" : "H"}${side}_${split}`,
        },
      );
      b.extrude(
        [[-0.103, 0.025], [0.177, 0.025], [0.181, 0.052], [-0.103, 0.052]],
        {
          at: [hoofX, 0.12, z],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.119,
          color: gold,
          bone: footBone,
          name: "HoofGildedSole",
        },
      );
    }
    frontDrawing(
      hoofTexture,
      [footX, 0.22, z + 0.183],
      [0.22, 0.15],
      footBone,
      `HoofEngraving${front ? "F" : "H"}${side}`,
    );

    b.part(new THREE.CylinderGeometry(0.095, 0.11, 0.07, 10), gold, {
      at: [footX, 0.35, z],
      bone: footBone,
      name: "FetlockGoldCuff",
    });
    bead([footX, 0.36, z + 0.105], 0.042, C.turquoise, footBone, "FetlockJade");

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + 0.4;
      ellipsoid(
        [footX + Math.cos(angle) * 0.065, 0.425 + i * 0.008, z + Math.sin(angle) * 0.065],
        [0.073, 0.09, 0.09],
        i === 1 ? cloudBlue : cloud,
        footBone,
        "CloudFetlock",
      );
    }

    const kneeFrame = chain.at(front ? 0.63 : 0.42);
    const kneeHit = b.surface(chain.joints[front ? 1 : 0]).nearest(
      [s * 0.58, kneeFrame.at.y, kneeFrame.at.z + 0.035],
    );
    b.stick(smallScaleGeo, C.goldLight, kneeHit, {
      texture: scaleTexture,
      flow: [0, -1, 0],
      name: "GoldenKneeShield",
    });

    // Rearward flame tufts retain a crisp silhouette rather than looking furry.
    b.sweep(
      bezier(
        [s * 0.49, 0.46, z - 0.035],
        [s * 0.51, 0.58, z - 0.25],
        [s * 0.52, 0.79, z - 0.23],
      ),
      [0.065, 0.037, 0],
      { bone: chain.joints[2], color: cloudBlue, sides: 7, name: "FetlockFlame" },
    );
  }

  // Collar: a ring follows the neck surface, not a floating torus.
  const neckSkin = b.surface(neckTube);
  const collarLoop = neckSkin.loop([0, 1.84, 0.64], {
    dir: [0, 1, 0.1],
    lift: 0.016,
  });
  b.sweep(collarLoop, 0.026, {
    bone: neck.joints[0],
    color: gold,
    sides: 6,
    name: "CelestialCollar",
  });
  b.along(collarLoop, 12, (at) => {
    b.part(new THREE.IcosahedronGeometry(0.023, 0), C.goldLight, {
      at,
      name: "CollarPearl",
    });
  });

  const pendantAt: number[] = [0, 1.74, 0.958];
  b.extrude(
    [[0, 0.14], [0.10, 0.035], [0.072, -0.07], [0, -0.14], [-0.072, -0.07], [-0.10, 0.035]],
    {
      at: pendantAt,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: gold,
      bone: neck.joints[0],
      name: "PendantGoldSetting",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.071, 0), C.mint, {
      at: [0, 1.75, 0.989],
      scale: [0.72, 1.22, 0.38],
      bone: neck.joints[0],
      name: "AuspiciousHeartStone",
    }),
    0.45,
  );
  for (const s of [-1, 1]) {
    b.sweep(
      [[s * 0.04, 1.64, 0.97], [s * 0.052, 1.53, 0.963]],
      0.009,
      { bone: neck.joints[0], color: gold, sides: 5, name: "PendantCord" },
    );
    bead([s * 0.052, 1.52, 0.963], 0.022, C.goldLight, neck.joints[0], "PendantDrop");
  }

  // Shoulder crests: gilded cloud emblems appear on inset dark jade plaques.
  for (const s of [1, -1]) {
    const at = [s * 0.405, 1.65, 0.43];
    const plaque = ellipsoid(
      at,
      [0.045, 0.18, 0.24],
      C.deep,
      spine.joints[2],
      `CloudShoulderPlaque${s}`,
    );
    b.decal(plaque, cloudMarkTexture, {
      at: [s * 0.455, 1.65, 0.43],
      dir: [s, 0.07, 0],
      size: [0.39, 0.235],
      bone: spine.joints[2],
      lift: 0.003,
      name: `CloudShoulderInsignia${s}`,
    });
  }

  // Mane. Cloud lobes descend behind the face and down both sides of the neck.
  // Each has a deliberately broad, readable spiral rather than fine strands.
  for (const s of [1, -1]) {
    const clusters = [
      { p: [s * 0.17, 2.67, 0.72], r: 0.15, bone: head },
      { p: [s * 0.23, 2.48, 0.57], r: 0.17, bone: neck.joints[2] },
      { p: [s * 0.27, 2.27, 0.41], r: 0.185, bone: neck.joints[1] },
      { p: [s * 0.30, 2.04, 0.29], r: 0.20, bone: neck.joints[0] },
      { p: [s * 0.32, 1.83, 0.15], r: 0.175, bone: neck.joints[0] },
      { p: [s * 0.30, 1.69, -0.01], r: 0.135, bone: spine.joints[1] },
    ];
    clusters.forEach((c, i) => cloudCurl(c.p, c.r, c.bone, s, `Mane${s}_${i}`, i % 3 === 1));

    // Sideburn cloud, below and behind the eyes.
    cloudCurl(
      [s * 0.25, 2.27, 1.02],
      0.12,
      head,
      s,
      `CheekCloud${s}`,
    );

    b.sweep(
      bezier(
        [s * 0.26, 2.49, 0.58],
        [s * 0.46, 2.52, 0.26],
        [s * 0.54, 2.78, 0.27],
        [s * 0.44, 2.84, 0.13],
      ),
      [0.085, 0.06, 0],
      { bone: head, color: cloud, sides: 7, name: `UpperManeFlame${s}` },
    );
    b.sweep(
      bezier(
        [s * 0.31, 2.05, 0.25],
        [s * 0.48, 1.98, -0.05],
        [s * 0.51, 2.13, -0.20],
        [s * 0.46, 2.28, -0.13],
      ),
      [0.10, 0.075, 0],
      { bone: neck.joints[0], color: cloudBlue, sides: 7, name: `LowerManeFlame${s}` },
    );
    b.sweep(
      bezier(
        [s * 0.31, 1.82, 0.08],
        [s * 0.41, 1.73, -0.22],
        [s * 0.42, 1.82, -0.42],
      ),
      [0.065, 0],
      { bone: spine.joints[1], color: ivory, sides: 7, name: `TrailingManeWisp${s}` },
    );
  }

  // Crown forelock swept upward, leaving the forehead seal and both eyes clear.
  ellipsoid([0, 2.755, 0.95], [0.16, 0.10, 0.20], cloud, head, "CrownCloud");
  b.sweep(
    bezier(
      [0, 2.76, 0.98],
      [0, 2.91, 1.01],
      [0, 2.94, 0.85],
      [0, 2.89, 0.79],
    ),
    [0.085, 0.05, 0],
    { bone: head, color: cloud, sides: 8, name: "CrownCloudCurl" },
  );

  // Antlers: two widely separated, angular ivory trees with gold-washed tips.
  // Every branch meets its parent explicitly.
  for (const s of [1, -1]) {
    const A = [
      [s * 0.18, 2.70, 0.80],
      [s * 0.24, 2.91, 0.70],
      [s * 0.35, 3.11, 0.55],
      [s * 0.48, 3.30, 0.44],
      [s * 0.59, 3.48, 0.46],
    ];
    b.sweep(A, [0.075, 0.065, 0.047, 0.03, 0], {
      bone: head,
      color: ivory,
      sides: 7,
      bands: [[0.80, ivory], [1, gold]],
      caps: "flat",
      name: `AntlerBeam${s}`,
    });
    b.part(new THREE.CylinderGeometry(0.084, 0.09, 0.065, 10), gold, {
      at: A[0],
      dir: [s * 0.10, 1, -0.38],
      bone: head,
      name: `AntlerRootBand${s}`,
    });

    const branches = [
      [A[1], [s * 0.43, 3.03, 0.88], [s * 0.49, 3.22, 0.91]],
      [A[2], [s * 0.58, 3.18, 0.62], [s * 0.76, 3.33, 0.60]],
      [A[3], [s * 0.43, 3.46, 0.25], [s * 0.47, 3.60, 0.23]],
      [A[2], [s * 0.27, 3.27, 0.42], [s * 0.24, 3.39, 0.44]],
    ];
    branches.forEach((points, i) => {
      b.sweep(points, [0.045 - i * 0.003, 0.026, 0], {
        bone: head,
        color: ivory,
        bands: [[0.64, ivory], [1, gold]],
        sides: 6,
        caps: "flat",
        name: `AntlerTine${s}_${i}`,
      });
    });

    // Fine, restrained gilded incisions down the major beams.
    b.sweep(
      [
        [s * 0.21, 2.79, 0.782],
        [s * 0.275, 2.96, 0.695],
        [s * 0.375, 3.115, 0.57],
      ],
      [0.009, 0.004],
      { bone: head, color: C.goldDark, sides: 5, name: `AntlerInlay${s}` },
    );
    bead([s * 0.205, 2.755, 0.87], 0.029, C.mint, head, `AntlerRootJewel${s}`);
  }

  // A lean, extended dragon tail ending in a substantial cloud plume.
  const tailTube = b.sweep(tail, [0.13, 0.105, 0.08, 0.063, 0.035], {
    color: jade,
    sectors: [[130, 230, belly]],
    sides: 9,
    caps: "round",
    name: "DragonTail",
  });
  b.along(
    tailTube,
    7,
    (at) => {
      b.stick(new THREE.ConeGeometry(0.036, 0.105, 4), gold, at, {
        embed: 0.18,
        spin: 45,
        name: "TailGoldCrest",
      });
    },
    { from: 0.12, to: 0.82 },
  );
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const hit = tailTube.at(0.16 + i * 0.15, s * 80);
      b.stick(smallScaleGeo, i % 2 ? C.mint : C.turquoise, hit, {
        texture: scaleTexture,
        flow: [0, 0.2, -1],
        name: "TailShield",
      });
    }
  }

  const tailBone = tail.joints[tail.joints.length - 1];
  cloudCurl([0.035, 2.00, -2.035], 0.18, tailBone, 1, "TailCloudRoot", true);
  cloudCurl([-0.025, 2.18, -2.15], 0.15, tailBone, -1, "TailCloudTip");
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [s * 0.065, 2.04, -2.03],
        [s * 0.23, 2.16, -2.22],
        [s * 0.20, 2.41, -2.24],
        [s * 0.09, 2.47, -2.16],
      ),
      [0.09, 0.065, 0],
      { bone: tailBone, color: s > 0 ? cloud : cloudBlue, sides: 7, name: `TailCloudFlame${s}` },
    );
  }

  // A small chin beard with a solid teardrop silhouette.
  b.sweep(
    bezier(
      [0, 2.195, 1.25],
      [0, 2.06, 1.22],
      [0, 2.01, 1.07],
      [0, 2.065, 1.01],
    ),
    [0.065, 0.05, 0],
    { bone: jaw, color: cloud, sides: 7, name: "CloudChinBeard" },
  );

  // Setting: an elliptical, low moonstone seal. Its contact surface is y=.12.
  b.part(new THREE.CylinderGeometry(1, 1.025, 0.095, 48), stone, {
    at: [0, 0.0475, -0.32],
    scale: [1.03, 1, 2.10],
    bone: stage,
    name: "MoonstoneSealBase",
  });
  b.part(new THREE.CylinderGeometry(0.99, 1, 0.025, 48), C.stone, {
    at: [0, 0.1075, -0.32],
    scale: [1.03, 1, 2.10],
    bone: stage,
    name: "MoonstoneSealTop",
  });

  const rimPath = catmull(
    Array.from({ length: 40 }, (_, i) => {
      const a = (i / 40) * Math.PI * 2;
      return [Math.sin(a) * 1.018, 0.088, -0.32 + Math.cos(a) * 2.075];
    }),
    { closed: true },
  );
  b.sweep(rimPath, 0.012, {
    bone: stage,
    color: gold,
    sides: 6,
    name: "SealGoldRim",
  });

  b.part(new THREE.PlaneGeometry(1.97, 4.02), "#ffffff", {
    at: [0, 0.1215, -0.32],
    rotation: [-90, 0, 0],
    texture: sealTexture,
    bone: stage,
    name: "EngravedCelestialSeal",
  });

  // Low mist islands at the rear edge never hide the feet or the body.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.66 + i * 0.055);
      const z = -1.45 + i * 0.23;
      ellipsoid(
        [x, 0.17 + i * 0.012, z],
        [0.14, 0.065 + random() * 0.018, 0.22],
        i % 2 ? cloudBlue : cloud,
        stage,
        "GroundMist",
      );
    }
    const groundCurl = arc(
      [s * 0.65, 0.15, -1.05],
      [s * 0.83, 0.15, -1.05],
      [0, 1, 0],
      s * 260,
    );
    b.sweep(groundCurl, 0.022, {
      bone: stage,
      color: C.mint,
      sides: 6,
      name: "GroundCloudScroll",
    });
  }

  // Twelve luminous inset gems repeat the diamond of the forehead and pendant.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 0.963;
    const z = -0.32 + Math.cos(a) * 1.96;
    glow(
      b.part(new THREE.OctahedronGeometry(0.032, 0), C.mint, {
        at: [x, 0.125, z],
        scale: [1, 0.23, 1.3],
        rotation: [0, (a * 180) / Math.PI, 0],
        bone: stage,
        name: "SealJadeInlay",
      }),
      0.35,
    );
  }

  b.part(new THREE.BoxGeometry(0.56, 0.115, 0.036), gold, {
    at: [0, 0.12, 1.745],
    bone: stage,
    name: "TitlePlateFrame",
  });
  frontDrawing(
    plaqueTexture,
    [0, 0.122, 1.766],
    [0.535, 0.10],
    stage,
    "TitlePlate",
  );

  return b.root;
}
```