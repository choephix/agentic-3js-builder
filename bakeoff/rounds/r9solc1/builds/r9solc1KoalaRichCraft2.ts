import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
} from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";
import {
  pixelArt,
  pixelTexture,
  cellPaint,
  stepped,
} from "../../../../kits/pixel";

export const meta = {
  name: "Eucalyptus Embrace",
  description:
    "A silver-grey pixel-art koala embracing a eucalyptus climbing stand, with stepped fluffy ears, bright little eyes and opposed gripping thumbs.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction changes:
   * 1. Replace the rectangular head with a broad stepped silhouette and wider,
   *    lower ears: the silhouette now reads as a koala rather than a bear robot.
   * 2. Enlarge the eyes, soften the muzzle and flatten the chest patch, keeping
   *    the big dark nose as the face's unmistakable focal point.
   * 3. Quiet the fur's pixel contrast, seat bark flakes on the actual trunk,
   *    and turn hanging leaves upward for softer silver-green lighting.
   * 4. Raise the identification plaque clear of the base rim.
   */

  const b = createBuilder({
    name: "Eucalyptus Embrace",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(4619);

  const INK = "#26353c";
  const CLAW = "#263237";
  const PALE = "#e0e3d8";
  const WOOL = "#bcc8c2";
  const DARK_WOOL = "#879b9e";
  const TEAL = "#628f7d";
  const GOLD = "#cfb47b";

  const furRamp = [
    "#637b83",
    "#81979c",
    "#9aadb0",
    "#b0bfc0",
    "#c3cec9",
    "#d3dbd0",
  ];
  const creamRamp = [
    "#a5b7ac",
    "#c0cdbf",
    "#d9dfcc",
    "#e7e9d7",
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

  const fur = cellPaint(0.014, (c) =>
    c.pick(
      furRamp,
      0.51 +
        c.n.y * 0.15 +
        c.n.z * 0.075 +
        (c.random(8) - 0.5) * 0.105,
    ),
  );
  const lightFur = cellPaint(0.012, (c) =>
    c.pick(
      creamRamp,
      0.6 +
        c.n.y * 0.13 +
        c.n.z * 0.055 +
        (c.random(3) - 0.5) * 0.12,
    ),
  );
  const earFur = cellPaint(0.014, (c) =>
    c.pick(
      furRamp,
      0.49 + c.n.y * 0.15 + (c.random(18) - 0.5) * 0.13,
    ),
  );
  const bark = cellPaint(0.014, (c) => {
    const vertical = Math.sin(c.at.x * 116 + c.at.z * 97);
    const stripe = vertical > 0.62 ? -0.15 : vertical < -0.72 ? 0.14 : 0;
    return c.pick(
      barkRamp,
      0.46 + c.n.y * 0.12 + stripe + (c.random(25) - 0.5) * 0.15,
    );
  });
  const earth = cellPaint(0.024, (c) =>
    c.pick(
      ["#314d46", "#405b4c", "#546a50", "#657857", "#7d8662"],
      0.32 + c.n.y * 0.2 + (c.random(12) - 0.5) * 0.27,
    ),
  );
  const stone = cellPaint(0.02, (c) =>
    c.pick(
      ["#627574", "#80918a", "#9ca89a", "#bac0aa"],
      0.32 + c.n.y * 0.28 + (c.random(9) - 0.5) * 0.3,
    ),
  );

  // Skeleton first, including the separate lower jaw and gripping digits.
  const stage = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stage,
    at: [0, 0.47, -0.035],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [hips, [0, 0.63, -0.025], [0, 0.775, 0]],
    {
      parent: hips,
      names: ["spineLower", "chest", "spineTop"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [[0, 0.77, 0], [0, 0.86, 0.005]],
    {
      parent: spine.tip!,
      names: ["neck", "neckTop"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.965, 0.01],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.858, 0.13],
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
        at: [s * 0.286, 1.077, -0.025],
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
            names: [
              `finger${suffix}${i + 1}Base`,
              `finger${suffix}${i + 1}Tip`,
            ],
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
            names: [
              `thumb${suffix}${i + 1}Base`,
              `thumb${suffix}${i + 1}Tip`,
            ],
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

  const eyeTexture = pixelArt(
    [
      "................",
      "....kkkkkkkk....",
      "...kksssssskk...",
      "..kksskkkksskk..",
      "..ksskkkkkkssk..",
      "..kskkwwwkkkkk..",
      "..kskkwwwkkkkk..",
      "..kskkkwkkkkkk..",
      "..kskkkbbkkkkk..",
      "..kskkbbbbkwkk..",
      "..ksskkbbkkkkk..",
      "...kssbbbbkkk...",
      "....kkssskkk....",
      ".....kkkkkk.....",
      "................",
      "................",
    ],
    {
      k: "#24323a",
      s: "#657b7d",
      b: "#a3936d",
      w: "#fff9e6",
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
      c: "#78878a",
      d: "#2b3b43",
    },
  );
  const innerEarTexture = pixelTexture(24, 26, (g) => {
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 24; x++) {
        const dx = (x - 11.5) / 11;
        const dy = (y - 12.5) / 12;
        if (dx * dx + dy * dy > 1) continue;
        const edge = Math.max(Math.abs(dx), Math.abs(dy));
        const tooth = ((x * 7 + y * 11) % 9) / 9;
        let col = edge > 0.79 ? "#b5c4be" : "#e5e8d9";
        if (edge > 0.62 && tooth > 0.72) col = "#98aeac";
        if (y > 17 && Math.abs(x - 12) < 5) col = "#c1cdc1";
        if (y < 12 && tooth < 0.28) col = "#f2efdf";
        g.set(x, y, col);
      }
    }
  });
  const chestTexture = pixelTexture(24, 30, (g) => {
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 24; x++) {
        const hw =
          y < 7 ? 7 + Math.floor(y / 2) : 11 - Math.floor((y - 7) / 6);
        const fringe = x % 4 === 0 ? 2 : 0;
        if (Math.abs(x - 11.5) > hw || y > 28 - fringe) continue;
        const hash = (x * 13 + y * 7) % 17;
        g.set(
          x,
          y,
          hash < 2
            ? "#c6d2c4"
            : hash < 7
              ? "#dbe2cf"
              : hash > 14
                ? "#f0eddb"
                : "#e5e8d6",
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
        let col = Math.floor(r / 3) % 2 ? "#bfaa7b" : "#ddc89b";
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
        g.set(
          x,
          y,
          x === center
            ? "#d5dfb9"
            : Math.abs(x - center) === half
              ? "#628f81"
              : x < center
                ? "#a5c3a7"
                : "#82ac94",
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
      at, bone, name,
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
      at, bone, dir, axis: "z", texture,
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
      at, bone: stage, dir, axis: "z", texture: cutTexture,
      name: "exposedEndGrain",
    });
  }

  // Shallow grove display base.
  b.part(new THREE.CylinderGeometry(0.545, 0.555, 0.058, 12), "#29443f", {
    at: [0, 0.029, 0.015], scale: [1, 1, 0.73],
    bone: stage, name: "darkCutBase",
  });
  b.part(new THREE.CylinderGeometry(0.531, 0.536, 0.019, 12), earth, {
    at: [0, 0.066, 0.015], scale: [1, 1, 0.73],
    bone: stage, name: "groveFloor",
  });
  b.part(new THREE.CylinderGeometry(0.548, 0.548, 0.009, 12), "#91a486", {
    at: [0, 0.016, 0.015], scale: [1, 1, 0.73],
    bone: stage, name: "baseInlay",
  });

  const trunk = branch(
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

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.rod(
      [0.335, 0.12, -0.055],
      [0.335 + Math.cos(a) * 0.13, 0.078, -0.055 + Math.sin(a) * 0.095],
      [0.035, 0.016],
      { color: bark, bone: stage, sides: 5, smooth: false },
    );
  }

  // Surface attachment removes the floating strips on the original stand.
  const trunkSkin = b.surface(trunk);
  for (let i = 0; i < 15; i++) {
    const y = 0.17 + i * 0.06;
    const hit = trunkSkin.nearest([
      0.344 + (y - 0.17) * 0.1 + (i % 2 ? 0.055 : -0.055),
      y,
      0.10,
    ]);
    b.stick(
      new THREE.BoxGeometry(
        0.016 + random() * 0.014,
        0.009,
        0.035 + random() * 0.032,
      ),
      i % 3 ? "#b5a78b" : "#746b56",
      hit,
      {
        embed: 0.45,
        flow: [0, 1, 0],
        name: "peelingBark",
      },
    );
  }

  const torso = b.loft(
    [
      { at: [0, 0.388, -0.025], w: 0.255, h: 0.225 },
      { at: [0, 0.455, -0.036], w: 0.365, h: 0.294 },
      { at: [0, 0.605, -0.017], w: 0.385, h: 0.305 },
      { at: [0, 0.732, 0.002], w: 0.32, h: 0.265 },
      { at: [0, 0.786, 0.002], w: 0.235, h: 0.2 },
    ],
    {
      bone: [hips, spine, neck], color: fur,
      sides: 8, smooth: false, caps: "flat", name: "woollyTorso",
    },
  );
  b.sweep(neck, [0.115, 0.125], {
    color: fur, sides: 6, smooth: false, name: "shortNeck",
  });

  // A fur patch, not a projecting oval breastplate.
  const bib = b.part(new THREE.SphereGeometry(1, 8, 6), lightFur, {
    at: [0, 0.639, 0.125],
    scale: [0.14, 0.147, 0.037],
    bone: spine.joints[1], flat: true, name: "creamChest",
  });
  b.decal(bib, chestTexture, {
    at: [0, 0.65, 0.163],
    dir: [0, 0, 1],
    size: [0.215, 0.225],
    segments: 6,
    lift: 0.002,
    bone: spine.joints[1],
  });

  // Pixel-rounded head: broad cheeks, stepped temples, no square helmet corners.
  const skull = b.extrude(
    stepped(
      [
        [-2, 2],
        [-3, 3],
        [-4, 4],
        [-4.5, 4.5],
        [-5, 5],
        [-5, 5],
        [-5, 5],
        [-5, 5],
        [-5, 5],
        [-5, 5],
        [-4.5, 4.5],
        [-4, 4],
        [-3, 3],
        [-2, 2],
      ],
      [0.034, 0.034],
      { start: -7 },
    ),
    {
      at: [0, 0.969, 0.024],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.36,
      color: fur,
      bone: head,
      name: "steppedKoalaHead",
    },
  );

  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: [s * 0.105, 1.006, 0.205],
      dir: [0, 0, 1],
      size: [0.108, 0.109],
      segments: 3,
      lift: 0.0025,
      bone: head,
      mirror: s < 0,
      name: s > 0 ? "eyeL" : "eyeR",
    });
    box(
      [s * 0.106, 1.066, 0.206],
      [0.058, 0.009, 0.008],
      DARK_WOOL, head, "softEyebrow",
    );
    b.part(new THREE.SphereGeometry(1, 6, 4), lightFur, {
      at: [s * 0.051, 0.883, 0.202],
      scale: [0.062, 0.034, 0.026],
      bone: head, flat: true, name: "muzzlePad",
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
  box([0, 0.858, 0.211], [0.098, 0.023, 0.033], lightFur, jaw, "lowerJaw");
  box([0, 0.874, 0.232], [0.01, 0.025, 0.007], INK, head, "philtrum");
  for (const s of [1, -1]) {
    box([s * 0.017, 0.862, 0.231], [0.026, 0.007, 0.007], INK, jaw, "mouth");
    box(
      [s * 0.032, 0.866, 0.229],
      [0.008, 0.012, 0.007],
      INK, jaw, "mouthCorner",
    );
  }

  // Wide rounded woolly ears, distinct from the head in front and side views.
  const earOutline = stepped(
    [
      [3, 7],
      [1, 9],
      [0, 10],
      [0, 10],
      [0, 10],
      [0, 10],
      [0, 10],
      [1, 9],
      [3, 7],
    ],
    [0.027, 0.024],
    { start: -4.5 },
  );
  for (const ear of ears) {
    const s = ear.side;
    b.extrude(earOutline, {
      at: [s * 0.286, 0.957, -0.025],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.091,
      bone: ear.joint,
      color: earFur,
      name: s > 0 ? "steppedEarL" : "steppedEarR",
    });
    plate(
      [s * 0.286, 1.077, 0.022],
      0.211, 0.22, innerEarTexture, ear.joint,
    );
    for (let i = 0; i < 9; i++) {
      const a = (-70 + i * 36) * Math.PI / 180;
      box(
        [
          s * 0.286 + Math.cos(a) * 0.106,
          1.077 + Math.sin(a) * 0.102,
          0.022,
        ],
        [0.026, 0.022, 0.019],
        i % 3 === 0 ? PALE : WOOL,
        ear.joint,
        "earWoolPixel",
      );
    }
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      box(
        [
          s * (0.212 - i * 0.016),
          0.947 - i * 0.033,
          0.154 - i * 0.003,
        ],
        [0.044, 0.035, 0.063],
        i === 2 ? lightFur : fur,
        head,
        "cheekTuft",
      );
      box(
        [
          s * (0.228 - i * 0.016),
          0.936 - i * 0.033,
          0.177 - i * 0.003,
        ],
        [0.018, 0.018, 0.025],
        i === 2 ? PALE : WOOL,
        head,
        "cheekFringe",
      );
    }
  }

  for (const entry of limbs) {
    const s = entry.side;
    b.sweep(entry.arm, [0.083, 0.077, 0.056], {
      color: fur, sides: 6, smooth: false,
      caps: "round", name: "grippingArm",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), fur, {
      at: [s * 0.175, 0.432, -0.035],
      scale: [0.115, 0.13, 0.123],
      bone: entry.leg.joints[0], flat: true, name: "roundHaunch",
    });
    b.sweep(entry.leg, [0.091, 0.081, 0.047], {
      color: fur, sides: 6, smooth: false, name: "bentLeg",
    });
    box(
      [s * 0.271, 0.698, 0.26],
      [0.103, 0.067, 0.083],
      fur, entry.arm.tip!, "palm",
    );
    box(
      [s * 0.16, 0.319, 0.182],
      [0.106, 0.055, 0.087],
      lightFur, entry.leg.tip!, "hindPaw",
    );

    entry.fingers.forEach((finger, i) => {
      b.sweep(finger, [0.0145, 0.011], {
        color: i === 1 ? lightFur : fur,
        sides: 4, smooth: false, caps: "flat",
        name: entry.thumbFlags[i] ? "opposedThumb" : "curledFinger",
      });
      const tip = finger.at(1);
      b.spike(
        tip,
        [
          tip.at.x,
          tip.at.y - 0.019,
          tip.at.z + (entry.thumbFlags[i] ? 0.014 : -0.014),
        ],
        null, 0.008,
        {
          color: CLAW,
          bone: finger.joints[finger.joints.length - 1],
          sides: 4,
        },
      );
      b.part(new THREE.BoxGeometry(0.017, 0.013, 0.016), WOOL, {
        at: finger.at(0.4),
        bone: finger.joints[0],
        name: "knucklePixel",
      });
    });
    entry.toes.forEach((toe) => {
      b.sweep(toe, [0.017, 0.012], {
        color: fur, sides: 4, smooth: false,
        caps: "flat", name: "grippingToe",
      });
      const tip = toe.at(1);
      b.spike(
        tip,
        [tip.at.x, tip.at.y - 0.018, tip.at.z - 0.011],
        null, 0.009,
        { color: CLAW, bone: toe.joints[toe.joints.length - 1], sides: 4 },
      );
    });
    for (let i = 0; i < 4; i++) {
      box(
        [
          s * (0.217 + i * 0.016),
          0.75 - i * 0.014,
          0.075 + i * 0.019,
        ],
        [0.025, 0.025, 0.027],
        i % 2 ? WOOL : DARK_WOOL,
        entry.arm.joints[0],
        "forearmWool",
      );
    }
  }

  const woolHits = b.surface(torso).scatter(20, {
    rng: rng(72),
    minDist: 0.05,
    filter: (h) => h.n.z < 0.45 && h.n.y > -0.45,
  });
  for (let i = 0; i < woolHits.length; i++) {
    b.stick(
      new THREE.BoxGeometry(0.025, 0.008, 0.025),
      i % 3 === 0 ? WOOL : DARK_WOOL,
      woolHits[i],
      { embed: 0.6, name: "squareWoolFleck" },
    );
  }

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
      color: bark, bone: stage, sides: 4,
      smooth: false, caps: "flat", name: "leafTwig",
    });
    const route = catmull(sprig.points);
    for (let i = 0; i < 4; i++) {
      const p = route.at(0.3 + i * 0.21);
      const side = i % 2 ? -1 : 1;
      const leafRoot = [p.x + side * 0.028, p.y + 0.012, p.z + 0.005];
      b.rod([p.x, p.y, p.z], leafRoot, 0.003, {
        color: TEAL, bone: stage, sides: 4,
      });
      b.cards(
        [
          frame(leafRoot, [
            -(side * 0.39 + sprig.side * 0.2),
            0.94,
            -0.07,
          ]),
        ],
        leafTexture,
        {
          size: [0.052 + i * 0.003, 0.145 + (i % 3) * 0.024],
          flow: [0, 0, 1],
          lean: 180,
          bend: 0,
          sink: 0,
          bone: stage,
          name: "silverGreenEucalyptusLeaf",
        },
      );
    }
  }

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
      bone: stage, flat: true, name: "groveStone",
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
    b.part(
      new THREE.BoxGeometry(
        0.015 + random() * 0.02,
        0.009,
        0.039 + random() * 0.03,
      ),
      i % 2 ? "#b4a27c" : "#82785c",
      {
        at: [x, 0.083, z],
        rotation: [0, (random() - 0.5) * 85, 0],
        bone: stage,
        name: "shedBarkChip",
      },
    );
  }

  // Upright plaque now clears the floor and the raised front edge.
  box(
    [0, 0.106, 0.335],
    [0.286, 0.091, 0.025],
    "#233b37", stage, "labelBacking",
  );
  box(
    [0, 0.106, 0.349],
    [0.267, 0.077, 0.007],
    GOLD, stage, "labelRim",
  );
  plate([0, 0.106, 0.353], 0.254, 0.073, labelTexture, stage);

  return b.root;
}
