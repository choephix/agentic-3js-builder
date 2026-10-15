```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
  Paint,
} from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import {
  pixelArt,
  pixelTexture,
  cellPaint,
  stepped,
} from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Eucalyptus Embrace",
  description:
    "A chunky pixel-art koala holding its eucalyptus climbing stand, with woolly stepped ears, opposed thumbs, dark claws and silver-green leaves.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Eucalyptus Embrace",
    detail: 0.8,
    paintSize: 2048,
  });

  const random = rng(4619);
  const INK = "#26353c";
  const CLAW = "#263237";
  const PALE = "#e0e3d8";
  const WOOL = "#b8c2bf";
  const DARK_WOOL = "#76888b";
  const TEAL = "#447b72";
  const GOLD = "#cfb47b";

  const furRamp = [
    "#566c76",
    "#70858a",
    "#899c9e",
    "#a7b5b2",
    "#bec9c2",
    "#d0d6ca",
  ];
  const creamRamp = [
    "#94a6a3",
    "#b5c3b9",
    "#d2d9c9",
    "#e5e7d5",
    "#f0ecdb",
  ];
  const barkRamp = [
    "#544c42",
    "#6c6350",
    "#88785e",
    "#a49070",
    "#b6a487",
    "#c7b79a",
  ];

  const fur = cellPaint(0.014, (c) => {
    const light = 0.47 + c.n.y * 0.17 + c.n.z * 0.08;
    const fleck = (c.random(8) - 0.5) * 0.21;
    return c.pick(furRamp, light + fleck);
  });
  const lightFur = cellPaint(0.012, (c) =>
    c.pick(
      creamRamp,
      0.58 + c.n.y * 0.16 + c.n.z * 0.07 + (c.random(3) - 0.5) * 0.2,
    ),
  );
  const earFur = cellPaint(0.012, (c) =>
    c.pick(furRamp, 0.42 + c.n.y * 0.18 + (c.random(18) - 0.5) * 0.23),
  );
  const bark = cellPaint(0.014, (c) => {
    const vertical = Math.sin(c.at.x * 116 + c.at.z * 97);
    const flake = c.random(25);
    const stripe = vertical > 0.62 ? -0.18 : vertical < -0.72 ? 0.17 : 0;
    return c.pick(
      barkRamp,
      0.46 + c.n.y * 0.12 + stripe + (flake - 0.5) * 0.2,
    );
  });
  const earth = cellPaint(0.024, (c) =>
    c.pick(
      ["#314d46", "#405b4c", "#546a50", "#657857", "#7d8662"],
      0.32 + c.n.y * 0.2 + (c.random(12) - 0.5) * 0.4,
    ),
  );
  const stone = cellPaint(0.02, (c) =>
    c.pick(
      ["#627574", "#80918a", "#9ca89a", "#bac0aa"],
      0.32 + c.n.y * 0.28 + (c.random(9) - 0.5) * 0.3,
    ),
  );

  // All animal articulation is established before its geometry.
  const stage = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stage,
    at: [0, 0.47, -0.035],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      hips,
      [0, 0.63, -0.025],
      [0, 0.775, 0],
    ],
    { parent: hips, names: ["spineLower", "chest", "spineTop"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.77, 0],
      [0, 0.86, 0.005],
    ],
    { parent: spine.tip!, names: ["neck", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.965, 0.01],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.862, 0.13],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears: { side: number; joint: Joint }[] = [];
  const limbs: {
    side: number;
    arm: ReturnType<typeof b.chain>;
    leg: ReturnType<typeof b.chain>;
    fingers: ReturnType<typeof b.chain>[];
    toes: ReturnType<typeof b.chain>[];
    thumbFlags: boolean[];
  }[] = [];

  for (const s of [1, -1]) {
    const suffix = s === 1 ? "L" : "R";
    ears.push({
      side: s,
      joint: b.joint(`ear${suffix}`, {
        parent: head,
        at: [s * 0.28, 1.102, -0.025],
        dir: [0, 0, 1],
        role: "hinge",
      }),
    });

    const arm = b.chain(
      `arm${suffix}`,
      [
        [s * 0.185, 0.754, 0.005],
        [s * 0.293, 0.703, 0.105],
        [s * 0.275, 0.692, 0.259],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`],
        role: "arm",
      },
    );
    const leg = b.chain(
      `leg${suffix}`,
      [
        [s * 0.13, 0.453, -0.027],
        [s * 0.204, 0.365, 0.045],
        [s * 0.16, 0.315, 0.179],
      ],
      {
        parent: hips,
        names: [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`],
        role: "leg",
        contact: [s * 0.16, 0.273, 0.164],
      },
    );

    const fingers: ReturnType<typeof b.chain>[] = [];
    const thumbFlags: boolean[] = [];

    // Three forward fingers and the koala's two opposed thumbs.
    for (let i = 0; i < 3; i++) {
      const x = s * (0.253 + i * 0.022);
      fingers.push(
        b.chain(
          `finger${suffix}${i + 1}`,
          [
            [x, 0.713, 0.282],
            [x, 0.685, 0.316],
            [x, 0.642, 0.291],
          ],
          {
            parent: arm.tip!,
            names: [`finger${suffix}${i + 1}Base`, `finger${suffix}${i + 1}Tip`],
            role: "digit",
          },
        ),
      );
      thumbFlags.push(false);
    }
    for (let i = 0; i < 2; i++) {
      fingers.push(
        b.chain(
          `thumb${suffix}${i + 1}`,
          [
            [s * (0.24 - i * 0.019), 0.687, 0.256],
            [s * (0.227 - i * 0.019), 0.657, 0.222],
            [s * (0.231 - i * 0.019), 0.633, 0.245],
          ],
          {
            parent: arm.tip!,
            names: [`thumb${suffix}${i + 1}Base`, `thumb${suffix}${i + 1}Tip`],
            role: "digit",
          },
        ),
      );
      thumbFlags.push(true);
    }

    const toes: ReturnType<typeof b.chain>[] = [];
    for (let i = 0; i < 3; i++) {
      const x = s * (0.134 + i * 0.026);
      toes.push(
        b.chain(
          `toe${suffix}${i + 1}`,
          [
            [x, 0.321, 0.205],
            [x, 0.289, 0.237],
            [x, 0.255, 0.209],
          ],
          {
            parent: leg.tip!,
            names: [`toe${suffix}${i + 1}Base`, `toe${suffix}${i + 1}Tip`],
            role: "digit",
          },
        ),
      );
    }
    limbs.push({ side: s, arm, leg, fingers, toes, thumbFlags });
  }

  // Seven small original pixel drawings, reused throughout the assembly.
  const eyeTexture = pixelArt(
    [
      "................",
      "....kkkkkkkk....",
      "...kksssssskk...",
      "..kksskkkksskk..",
      "..ksskkkkkkssk..",
      "..kskkwwkkkkkk..",
      "..kskkwwkkkkkk..",
      "..kskkkkkkkkkk..",
      "..kskkkbbkkkkk..",
      "..kskkkbbkkwkk..",
      "..ksskkbbkkkkk..",
      "...ksskkkkkkk...",
      "....kkssskkk....",
      ".....kkkkkk.....",
      "................",
      "................",
    ],
    {
      k: "#24323a",
      s: "#53676d",
      b: "#8c7960",
      w: "#f5f4e3",
    },
  );

  const noseTexture = pixelArt(
    [
      "...aaaaaaaa...",
      "..abbbbbbbba..",
      ".abcccbbbbdda.",
      "abccccbbbdddda",
      "abcccbbbbdddda",
      "abbbbbbbbdddda",
      "abbbbbbbddddda",
      "abbbbbddddddda",
      "abbbbdddddddda",
      "abbbddddddddda",
      "abddddddddddda",
      ".adddddddddda.",
      "..adddddddda..",
      "...aaaaaaaa...",
    ],
    {
      a: "#24343b",
      b: "#3e515a",
      c: "#6d7c80",
      d: "#2b3b43",
    },
  );

  const innerEarTexture = pixelTexture(20, 26, (g) => {
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 20; x++) {
        const dx = (x - 9.5) / 9;
        const dy = (y - 12.5) / 12;
        if (dx * dx + dy * dy > 1) continue;
        const edge = Math.max(Math.abs(dx), Math.abs(dy));
        const tooth = ((x * 7 + y * 11) % 9) / 9;
        let color = edge > 0.79 ? "#aab9b5" : "#e1e6d7";
        if (edge > 0.56 && tooth > 0.64) color = "#849a9d";
        if (y > 16 && Math.abs(x - 10) < 4) color = "#b1bdb7";
        if (y < 11 && tooth < 0.32) color = "#f0eedf";
        g.set(x, y, color);
      }
    }
  });

  const chestTexture = pixelTexture(24, 30, (g) => {
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 24; x++) {
        const hw = y < 7 ? 7 + Math.floor(y / 2) : 11 - Math.floor((y - 7) / 6);
        const fringe = (x % 4 === 0 ? 2 : 0);
        if (Math.abs(x - 11.5) > hw || y > 28 - fringe) continue;
        const hash = (x * 13 + y * 7) % 17;
        g.set(
          x,
          y,
          hash < 3
            ? "#b8c7bd"
            : hash < 8
              ? "#d4ddcd"
              : hash > 14
                ? "#f0eddb"
                : "#e2e6d5",
        );
      }
    }
  });

  const cutTexture = pixelTexture(32, 32, (g) => {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const dx = Math.abs(x - 15.5);
        const dy = Math.abs(y - 15.5);
        const r = Math.max(dx, dy) + Math.min(dx, dy) * 0.33;
        if (r > 17.5) continue;
        const ring = Math.floor(r / 3) % 2;
        let col = ring ? "#bfaa7b" : "#ddc89b";
        if (r > 14) col = "#6c6551";
        if (x > 15 && y === 15 + Math.floor((x - 16) / 4)) col = "#8e7d59";
        g.set(x, y, col);
      }
    }
  });

  const leafTexture = pixelTexture(16, 48, (g) => {
    for (let y = 0; y < 48; y++) {
      const t = y / 47;
      const center = 7 + Math.floor(Math.sin(t * 3.5) * 2);
      const half = Math.max(0, Math.floor(Math.sin(Math.PI * t) * 5.3));
      for (let x = center - half; x <= center + half; x++) {
        const vein = x === center;
        const edge = Math.abs(x - center) === half;
        g.set(
          x,
          y,
          vein
            ? "#c1d2b2"
            : edge
              ? "#467a71"
              : x < center
                ? "#82aa96"
                : "#669584",
        );
      }
    }
  });

  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 64">
      <rect width="192" height="64" fill="#253e3b"/>
      <path d="M4 4H188V60H4Z" fill="none" stroke="#aabd96" stroke-width="3"/>
      <path d="M13 18H19V24H13ZM173 18H179V24H173Z" fill="#cdb984"/>
      <text x="96" y="29" text-anchor="middle" font-family="monospace"
        font-size="22" font-weight="bold" fill="#e7e7cb">KOALA</text>
      <text x="96" y="48" text-anchor="middle" font-family="monospace"
        font-size="10" font-weight="bold" fill="#aabd96">EUCALYPTUS GROVE</text>
    </svg>`,
    { size: 384, pixelated: true },
  );

  function box(
    at: number[],
    size: number[],
    color: string | Paint,
    bone: Joint = stage,
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
    });
  }

  function plate(
    at: number[],
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone,
      dir,
      axis: "z",
      texture,
    });
  }

  function branch(points: number[][], radii: number[], name: string) {
    return b.sweep(points, radii, {
      bone: stage,
      color: bark,
      sides: 6,
      smooth: false,
      caps: "flat",
      name,
    });
  }

  function endGrain(at: number[], radius: number, dir: number[]) {
    b.part(new THREE.CircleGeometry(radius, 8), "#ffffff", {
      at,
      bone: stage,
      dir,
      axis: "z",
      texture: cutTexture,
      name: "exposedEndGrain",
    });
  }

  // A quiet, shallow oval base; the stand grows directly out of it.
  b.part(new THREE.CylinderGeometry(0.545, 0.555, 0.058, 12), "#29443f", {
    at: [0, 0.029, 0.015],
    scale: [1, 1, 0.73],
    bone: stage,
    name: "darkCutBase",
  });
  b.part(new THREE.CylinderGeometry(0.531, 0.536, 0.019, 12), earth, {
    at: [0, 0.066, 0.015],
    scale: [1, 1, 0.73],
    bone: stage,
    name: "groveFloor",
  });
  b.part(new THREE.CylinderGeometry(0.548, 0.548, 0.009, 12), "#91a486", {
    at: [0, 0.016, 0.015],
    scale: [1, 1, 0.73],
    bone: stage,
    name: "baseInlay",
  });

  // The supporting trunk stays beside, rather than in front of, the face.
  branch(
    [
      [0.335, 0.07, -0.055],
      [0.353, 0.36, -0.012],
      [0.385, 0.65, 0.075],
      [0.421, 0.91, -0.015],
      [0.455, 1.156, -0.047],
    ],
    [0.069, 0.061, 0.05, 0.038, 0.027],
    "eucalyptusTrunk",
  );
  endGrain([0.455, 1.157, -0.047], 0.027, [0.13, 0.98, -0.13]);

  branch(
    [
      [0.371, 0.64, 0.07],
      [0.325, 0.662, 0.236],
      [0.06, 0.658, 0.253],
      [-0.25, 0.661, 0.25],
      [-0.415, 0.694, 0.224],
    ],
    [0.047, 0.039, 0.036, 0.033, 0.025],
    "handholdBranch",
  );
  endGrain([-0.416, 0.694, 0.224], 0.025, [-1, 0.17, -0.1]);

  branch(
    [
      [0.349, 0.256, -0.012],
      [0.26, 0.277, 0.16],
      [-0.02, 0.275, 0.172],
      [-0.29, 0.282, 0.153],
    ],
    [0.046, 0.039, 0.034, 0.025],
    "footrestBranch",
  );
  endGrain([-0.291, 0.282, 0.153], 0.025, [-1, 0.02, -0.05]);

  // Root toes, knots and small, rectangular peeling-bark plates.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const start = [0.335, 0.12, -0.055];
    const end = [
      0.335 + Math.cos(a) * 0.13,
      0.078,
      -0.055 + Math.sin(a) * 0.095,
    ];
    b.rod(start, end, [0.035, 0.016], {
      color: bark,
      bone: stage,
      sides: 5,
      smooth: false,
    });
  }

  for (let i = 0; i < 15; i++) {
    const y = 0.17 + i * 0.06;
    const x = 0.344 + (y - 0.17) * 0.1;
    box(
      [x + (i % 2 ? 0.026 : -0.027), y, 0.025 + (y < 0.7 ? 0.02 : -0.04)],
      [0.018 + random() * 0.017, 0.035 + random() * 0.035, 0.009],
      i % 3 ? "#b5a78b" : "#746b56",
      stage,
      "peelingBark",
    );
  }

  // Rounded-block torso, with the volume carried by the spine.
  const torso = b.loft(
    [
      { at: [0, 0.388, -0.025], w: 0.255, h: 0.225 },
      { at: [0, 0.455, -0.036], w: 0.365, h: 0.294 },
      { at: [0, 0.605, -0.017], w: 0.385, h: 0.305 },
      { at: [0, 0.732, 0.002], w: 0.32, h: 0.265 },
      { at: [0, 0.786, 0.002], w: 0.235, h: 0.2 },
    ],
    {
      bone: [hips, spine, neck],
      color: fur,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "woollyTorso",
    },
  );

  b.sweep(neck, [0.115, 0.125], {
    color: fur,
    sides: 6,
    smooth: false,
    name: "shortNeck",
  });

  const bib = b.part(new THREE.SphereGeometry(1, 8, 6), lightFur, {
    at: [0, 0.641, 0.112],
    scale: [0.136, 0.155, 0.067],
    bone: spine.joints[1],
    flat: true,
    name: "creamChest",
  });
  b.decal(bib, chestTexture, {
    at: [0, 0.66, 0.18],
    dir: [0, 0, 1],
    size: [0.202, 0.222],
    segments: 6,
    lift: 0.002,
    bone: spine.joints[1],
  });

  // Face first: broad flat cheeks, little eyes, and the unmistakable large nose.
  const skull = b.loft(
    [
      { at: [0, 0.964, -0.173], w: 0.285, h: 0.266 },
      { at: [0, 0.964, -0.095], w: 0.428, h: 0.367 },
      { at: [0, 0.964, 0.118], w: 0.463, h: 0.367 },
      { at: [0, 0.964, 0.207], w: 0.37, h: 0.286 },
    ],
    {
      bone: head,
      color: fur,
      section: "box",
      caps: "flat",
      name: "blockyKoalaHead",
    },
  );

  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: [s * 0.102, 0.998, 0.208],
      dir: [0, 0, 1],
      size: [0.083, 0.086],
      segments: 3,
      lift: 0.0025,
      bone: head,
      mirror: s < 0,
      name: s > 0 ? "eyeL" : "eyeR",
    });

    box(
      [s * 0.105, 1.052, 0.205],
      [0.069, 0.012, 0.015],
      DARK_WOOL,
      head,
      "softEyebrow",
    );
    b.part(new THREE.SphereGeometry(1, 6, 4), lightFur, {
      at: [s * 0.063, 0.887, 0.202],
      scale: [0.075, 0.045, 0.031],
      bone: head,
      flat: true,
      name: "muzzlePad",
    });
  }

  b.extrude(
    stepped(
      [
        [-2, 2],
        [-3, 3],
        [-3, 3],
        [-3, 3],
        [-3, 3],
        [-2, 2],
      ],
      [0.019, 0.024],
      { start: -3 },
    ),
    {
      at: [0, 0.949, 0.235],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.061,
      color: INK,
      bone: head,
      name: "largeLeatheryNose",
    },
  );
  plate([0, 0.949, 0.2665], 0.114, 0.145, noseTexture, head);

  box([0, 0.865, 0.217], [0.105, 0.024, 0.039], lightFur, jaw, "lowerJaw");
  box([0, 0.878, 0.239], [0.012, 0.025, 0.008], INK, head, "philtrum");
  for (const s of [1, -1]) {
    box([s * 0.019, 0.868, 0.24], [0.028, 0.008, 0.008], INK, jaw, "mouth");
    box([s * 0.036, 0.874, 0.236], [0.009, 0.014, 0.009], INK, jaw, "mouthCorner");
  }

  // Stepped ears are broad silhouettes with layered, drawn wool on their faces.
  const earOutline = stepped(
    [
      [3, 8],
      [1, 10],
      [0, 11],
      [0, 11],
      [0, 11],
      [0, 11],
      [0, 11],
      [1, 10],
      [3, 8],
    ],
    0.022,
    { start: -4.5 },
  );

  for (const ear of ears) {
    const s = ear.side;
    b.extrude(earOutline, {
      at: [s * 0.28, 0.981, -0.025],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.087,
      bone: ear.joint,
      color: earFur,
      name: s > 0 ? "steppedEarL" : "steppedEarR",
    });
    plate(
      [s * 0.28, 1.104, 0.0205],
      0.174,
      0.216,
      innerEarTexture,
      ear.joint,
    );
    for (let i = 0; i < 8; i++) {
      const a = (-70 + i * 40) * Math.PI / 180;
      const x = s * 0.28 + Math.cos(a) * 0.087;
      const y = 1.102 + Math.sin(a) * 0.103;
      box(
        [x, y, 0.022],
        [0.025, 0.022, 0.021],
        i % 3 === 0 ? PALE : WOOL,
        ear.joint,
        "earWoolPixel",
      );
    }
  }

  // A few broad, purposeful stepped cheek tufts, rather than smooth fur.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      box(
        [s * (0.212 + i * 0.007), 0.94 - i * 0.038, 0.129 - i * 0.014],
        [0.043, 0.037, 0.057],
        i === 2 ? lightFur : fur,
        head,
        "cheekTuft",
      );
      box(
        [s * (0.231 + i * 0.005), 0.928 - i * 0.038, 0.149 - i * 0.014],
        [0.019, 0.018, 0.028],
        i === 2 ? PALE : WOOL,
        head,
        "cheekFringe",
      );
    }
  }

  // Arms and knees remain visibly separate from the trunk of the body.
  for (const entry of limbs) {
    const s = entry.side;
    b.sweep(entry.arm, [0.083, 0.077, 0.056], {
      color: fur,
      sides: 6,
      smooth: false,
      caps: "round",
      name: "grippingArm",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), fur, {
      at: [s * 0.175, 0.432, -0.035],
      scale: [0.115, 0.13, 0.123],
      bone: entry.leg.joints[0],
      flat: true,
      name: "roundHaunch",
    });
    b.sweep(entry.leg, [0.091, 0.081, 0.047], {
      color: fur,
      sides: 6,
      smooth: false,
      name: "bentLeg",
    });
    box(
      [s * 0.271, 0.698, 0.26],
      [0.103, 0.067, 0.083],
      fur,
      entry.arm.tip!,
      "palm",
    );
    box(
      [s * 0.16, 0.319, 0.182],
      [0.106, 0.055, 0.087],
      lightFur,
      entry.leg.tip!,
      "hindPaw",
    );

    entry.fingers.forEach((finger, i) => {
      b.sweep(finger, [0.0145, 0.011], {
        color: i === 1 ? lightFur : fur,
        sides: 4,
        smooth: false,
        caps: "flat",
        name: entry.thumbFlags[i] ? "opposedThumb" : "curledFinger",
      });
      const tip = finger.at(1);
      const p = tip.at;
      b.spike(
        tip,
        [p.x, p.y - 0.019, p.z + (entry.thumbFlags[i] ? 0.014 : -0.014)],
        null,
        0.008,
        { color: CLAW, bone: finger.joints[finger.joints.length - 1], sides: 4 },
      );
      const knuckle = finger.at(0.4);
      b.part(new THREE.BoxGeometry(0.017, 0.013, 0.016), WOOL, {
        at: knuckle,
        bone: finger.joints[0],
        name: "knucklePixel",
      });
    });

    entry.toes.forEach((toe) => {
      b.sweep(toe, [0.017, 0.012], {
        color: fur,
        sides: 4,
        smooth: false,
        caps: "flat",
        name: "grippingToe",
      });
      const tip = toe.at(1);
      b.spike(
        tip,
        [tip.at.x, tip.at.y - 0.018, tip.at.z - 0.011],
        null,
        0.009,
        { color: CLAW, bone: toe.joints[toe.joints.length - 1], sides: 4 },
      );
    });

    for (let i = 0; i < 4; i++) {
      box(
        [s * (0.217 + i * 0.016), 0.75 - i * 0.014, 0.075 + i * 0.019],
        [0.025, 0.025, 0.027],
        i % 2 ? WOOL : DARK_WOOL,
        entry.arm.joints[0],
        "forearmWool",
      );
    }
  }

  // A few square wool flecks seated on actual body surfaces.
  const woolHits = b.surface(torso).scatter(24, {
    rng: rng(72),
    minDist: 0.048,
    filter: (h) => h.n.z < 0.45 && h.n.y > -0.45,
  });
  for (let i = 0; i < woolHits.length; i++) {
    b.stick(
      new THREE.BoxGeometry(0.025, 0.009, 0.025),
      i % 3 === 0 ? WOOL : DARK_WOOL,
      woolHits[i],
      { embed: 0.6, name: "squareWoolFleck" },
    );
  }

  // Sparse eucalyptus sprays frame the ears, never covering the expression.
  const sprigs = [
    {
      points: [
        [0.424, 0.934, -0.02],
        [0.505, 1.039, -0.048],
        [0.548, 1.115, -0.073],
      ],
      side: 1,
    },
    {
      points: [
        [0.447, 1.091, -0.038],
        [0.347, 1.17, -0.115],
        [0.288, 1.205, -0.145],
      ],
      side: -1,
    },
    {
      points: [
        [-0.354, 0.682, 0.235],
        [-0.442, 0.752, 0.18],
        [-0.482, 0.825, 0.148],
      ],
      side: -1,
    },
    {
      points: [
        [0.355, 0.394, -0.004],
        [0.47, 0.461, -0.072],
        [0.505, 0.542, -0.098],
      ],
      side: 1,
    },
  ];
  for (const sprig of sprigs) {
    b.sweep(sprig.points, [0.012, 0.006, 0.003], {
      color: bark,
      bone: stage,
      sides: 4,
      smooth: false,
      caps: "flat",
      name: "leafTwig",
    });
    const route = catmull(sprig.points);
    for (let i = 0; i < 4; i++) {
      const t = 0.3 + i * 0.21;
      const p = route.at(t);
      const side = i % 2 ? -1 : 1;
      const root = [p.x, p.y, p.z];
      const leafRoot = [
        p.x + side * 0.028,
        p.y + 0.012,
        p.z + 0.005,
      ];
      b.rod(root, leafRoot, 0.003, {
        color: TEAL,
        bone: stage,
        sides: 4,
      });
      b.cards(
        [frame(leafRoot, [side * 0.39 + sprig.side * 0.2, -0.94, 0.07])],
        leafTexture,
        {
          size: [0.048 + i * 0.003, 0.145 + (i % 3) * 0.024],
          flow: [0, 0, 1],
          lean: 0,
          bend: 0,
          sink: 0,
          bone: stage,
          name: "silverGreenEucalyptusLeaf",
        },
      );
    }
  }

  // Ground dressing: angular stones, shed bark and a handful of fallen leaves.
  const rockPositions = [
    [-0.36, 0.095, -0.13],
    [-0.29, 0.091, -0.19],
    [0.16, 0.096, -0.22],
    [0.424, 0.098, 0.136],
    [-0.43, 0.092, 0.08],
  ];
  for (let i = 0; i < rockPositions.length; i++) {
    b.part(new THREE.DodecahedronGeometry(1, 0), stone, {
      at: rockPositions[i],
      scale: [0.045 + (i % 2) * 0.015, 0.023, 0.035],
      bone: stage,
      flat: true,
      name: "groveStone",
    });
  }

  for (let i = 0; i < 11; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.24 + random() * 0.19;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.66;
    if (Math.abs(x) < 0.2 && z > 0.15) continue;
    b.cards([frame([x, 0.078, z], [0, 1, 0])], leafTexture, {
      size: [0.032, 0.083],
      lean: 90,
      flow: [Math.cos(a + 1), 0, Math.sin(a + 1)],
      mirror: true,
      sink: 0,
      bone: stage,
      name: "fallenLeaf",
    });
  }

  for (let i = 0; i < 8; i++) {
    const x = -0.32 + random() * 0.63;
    const z = -0.19 + random() * 0.29;
    const chip = box(
      [x, 0.083, z],
      [0.015 + random() * 0.02, 0.009, 0.039 + random() * 0.03],
      i % 2 ? "#b4a27c" : "#82785c",
      stage,
      "shedBarkChip",
    );
    chip.mesh.rotation.y += (random() - 0.5) * 1.5;
  }

  // Small museum-style label inset into the front edge of the setting.
  box([0, 0.063, 0.359], [0.286, 0.091, 0.025], "#233b37", stage, "labelBacking");
  box([0, 0.063, 0.373], [0.267, 0.077, 0.007], GOLD, stage, "labelRim");
  plate([0, 0.063, 0.377], 0.254, 0.073, labelTexture, stage);

  return b.root;
}
```