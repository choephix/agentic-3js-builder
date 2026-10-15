```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  svg,
  paint,
  grain,
  mix,
  noise,
} from "agentic-3js-builder";
import type { Fill, Joint } from "agentic-3js-builder";

export const meta = {
  name: "A Very Patient Perch",
  description:
    "A honey-brown capybara and its tiny turquoise bird companion, on a little flowering riverbank. Faceted wooden-puppet forms, painted details, and a fully named animal rig.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "A Very Patient Perch", paintSize: 2048 });
  const random = rng(73);

  const C = {
    dark: "#392c29",
    brown: "#a36a40",
    honey: "#bd8852",
    light: "#d3a16c",
    cream: "#efd1a0",
    ear: "#78513e",
    nose: "#564033",
    claw: "#69503b",
    teal: "#238b91",
    turquoise: "#48b7b3",
    blue: "#285b70",
    mint: "#a8e1cc",
    yellow: "#f5ca65",
    orange: "#de9242",
    earth: "#455e55",
    soil: "#667765",
    moss: "#82947a",
    water: "#5d9e9d",
    waterLight: "#a5cdba",
    leaf: "#547f60",
    leafLight: "#90ab72",
    reed: "#9aaf76",
    reedDark: "#607a56",
    pink: "#e6a6a0",
    white: "#fff0cf",
  };

  const fur = paint((p, n) => {
    const variation = noise(p, 0.12, 21);
    const warm = mix("#a97143", "#c59461", variation);
    const shade = Math.max(0, Math.min(1, 0.32 + 0.38 * n.y + 0.16 * n.z));
    return mix(warm, "#e1b87e", shade * 0.5);
  });
  const muzzlePaint = paint((p, n) =>
    mix("#b48556", "#d9ae77", 0.45 + n.y * 0.19 + (noise(p, 0.055, 9) - 0.5) * 0.3),
  );
  const wood = grain("#6c5140", "#927258", { size: 0.018, axis: "z", seed: 8 });
  const bankPaint = paint((p, n) =>
    mix("#596f5e", "#87967b", Math.max(0, n.y) * (0.4 + noise(p, 0.2, 14) * 0.5)),
  );

  // Drawings are deliberately simple and bold enough to survive at puppet scale.
  const eyeTex = svg(
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 48 Q30 19 66 27 Q94 29 108 48 Q95 72 63 72 Q29 72 13 48Z" fill="#744b35"/>
      <path d="M19 47 Q40 31 66 35 Q91 35 102 48 Q85 67 61 65 Q34 65 19 47Z" fill="#302a27"/>
      <ellipse cx="68" cy="49" rx="15" ry="16" fill="#442f26"/>
      <ellipse cx="69" cy="50" rx="9" ry="13" fill="#272526"/>
      <circle cx="73" cy="43" r="5" fill="#fff0cf"/>
      <circle cx="63" cy="56" r="2.6" fill="#d1b58a"/>
      <path d="M12 43 Q50 22 105 43" fill="none" stroke="#513b2e" stroke-width="7" stroke-linecap="round"/>
      <path d="M24 20 Q51 10 82 20" fill="none" stroke="#997042" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const frecklesTex = svg(
    `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
      <g fill="#805638">
        <ellipse cx="27" cy="26" rx="4" ry="3"/>
        <ellipse cx="47" cy="19" rx="3.7" ry="3"/>
        <ellipse cx="63" cy="34" rx="3.5" ry="2.8"/>
        <ellipse cx="35" cy="46" rx="3.5" ry="2.8"/>
        <ellipse cx="85" cy="26" rx="3" ry="2.5"/>
      </g>
      <g stroke="#e4be84" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M15 54l8-2 M66 15l7-1 M79 47l8-2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const birdEyeTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="40" ry="42" fill="#a8e1cc"/>
      <ellipse cx="50" cy="52" rx="28" ry="31" fill="#233c48"/>
      <ellipse cx="52" cy="55" rx="17" ry="22" fill="#172c37"/>
      <ellipse cx="43" cy="39" rx="9" ry="11" fill="#fff6df"/>
      <circle cx="62" cy="65" r="4.8" fill="#c2ede1"/>
      <path d="M16 24Q40 5 69 16" fill="none" stroke="#285b70" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const featherTex = svg(
    `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 155Q9 126 12 61Q12 20 39 5Q68 23 68 64Q71 122 40 155Z"
        fill="#48b7b3" stroke="#285b70" stroke-width="5"/>
      <path d="M40 145Q41 85 39 19" fill="none" stroke="#a8e1cc" stroke-width="5"/>
      <g stroke="#238b91" fill="none" stroke-width="4" stroke-linecap="round">
        <path d="M39 48L23 35 M40 70L19 53 M40 92L19 74 M40 114L23 96"/>
        <path d="M41 58L58 42 M41 81L62 63 M41 104L59 86 M41 126L54 109"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const leafTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 65L60 7C21 6 5 32 7 66C8 103 39 122 76 117C109 112 126 85 119 53C115 26 96 10 76 8Z"
        fill="#779969" stroke="#456f55" stroke-width="4"/>
      <g stroke="#a5b87b" stroke-width="3" fill="none">
        <path d="M64 65L19 37 M64 65L15 73 M64 65L42 108 M64 65L84 107 M64 65L110 78 M64 65L105 37"/>
      </g>
      <path d="M20 48Q19 26 44 20" fill="none" stroke="#bdca91" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const grassTex = svg(
    `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 130Q38 54 5 28Q46 43 50 108Q52 24 76 3Q65 60 61 126Q78 70 98 61Q77 101 73 130Z"
        fill="#789967"/>
      <path d="M51 128Q53 68 68 23M46 127Q38 72 24 53" stroke="#b6bd7e" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton: the setting has one fixed root; all animals are its rigged descendants.
  const scene = b.joint("scene", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: scene,
    at: [0, 0.44, -0.39],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.44, -0.39],
      [0, 0.48, -0.15],
      [0, 0.48, 0.14],
    ],
    { parent: hips, names: ["spine1", "chest", "shoulders"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.49, 0.11],
      [0, 0.6, 0.32],
      [0, 0.67, 0.46],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.67, 0.46],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.535, 0.48],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const ears = [-1, 1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.196, 0.835, 0.352],
      dir: [s * 0.25, 1, 0],
      role: "hinge",
    }),
  );

  const legs = [-1, 1].flatMap((s) =>
    [false, true].map((front) => {
      const side = s > 0 ? "L" : "R";
      const tag = `${front ? "F" : "H"}${side}`;
      const z = front ? 0.22 : -0.43;
      const chain = b.chain(
        `leg${tag}`,
        [
          [s * 0.19, front ? 0.43 : 0.42, z - 0.035],
          [s * 0.235, 0.245, z - 0.04],
          [s * 0.24, 0.13, z + 0.015],
        ],
        {
          parent: front ? spine.tip! : hips,
          names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
          role: "leg",
          contact: [s * 0.24, 0.065, z + 0.08],
        },
      );
      const toes = [-1, 0, 1].map((i) =>
        b.chain(
          `toe${tag}${i + 2}`,
          [
            [s * 0.24 + i * 0.038, 0.111, z + 0.067],
            [s * 0.24 + i * 0.047, 0.105, z + 0.155],
          ],
          { parent: chain.tip!, count: 1, role: "digit" },
        ),
      );
      return { s, z, front, chain, toes };
    }),
  );

  const birdHips = b.joint("birdHips", {
    parent: head,
    at: [0, 0.99, 0.41],
    dir: [0, 0.3, 1],
    role: "spine",
  });
  const birdSpine = b.chain(
    "birdSpine",
    [
      [0, 0.99, 0.4],
      [0, 1.045, 0.435],
    ],
    { parent: birdHips, count: 1, role: "spine" },
  );
  const birdHead = b.joint("birdHead", {
    parent: birdSpine.joints[0],
    at: [0, 1.102, 0.465],
    dir: [0, 0, 1],
    role: "head",
  });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: [0, 1.08, 0.518],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const birdTail = b.chain(
    "birdTail",
    [
      [0, 0.993, 0.355],
      [0, 1.008, 0.24],
      [0, 1.025, 0.19],
    ],
    { parent: birdHips, names: ["birdTail1", "birdTail2"], role: "tail" },
  );
  const birdWings = [-1, 1].map((s) =>
    b.chain(
      s > 0 ? "birdWingL" : "birdWingR",
      [
        [s * 0.063, 1.042, 0.41],
        [s * 0.119, 1.032, 0.375],
        [s * 0.177, 1.025, 0.325],
      ],
      { parent: birdSpine.joints[0], count: 2, role: "wing" },
    ),
  );
  const birdLegs = [-1, 1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `birdLeg${side}`,
      [
        [s * 0.036, 0.983, 0.422],
        [s * 0.035, 0.927, 0.414],
        [s * 0.037, 0.875, 0.438],
      ],
      { parent: birdHips, names: [`birdHip${side}`, `birdKnee${side}`, `birdAnkle${side}`], role: "leg" },
    );
    const toes = [-1, 0, 1].map((i) =>
      b.chain(
        `birdToe${side}${i + 2}`,
        [
          [s * 0.037, 0.877, 0.438],
          [s * 0.037 + i * 0.018, 0.874, 0.482 + (i === 0 ? 0.014 : 0)],
        ],
        { parent: leg.tip!, count: 1, role: "digit" },
      ),
    );
    return { s, leg, toes };
  });

  // Shared primitive helpers. Every placement is in model space.
  function ellipsoid(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale: size,
      bone,
      name,
      flat: true,
    });
  }

  function box(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      rotation,
    });
  }

  function pebble(at: number[], size: number[], color: Fill) {
    return b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      at,
      scale: size,
      bone: scene,
      name: "riverPebble",
    });
  }

  function roundedBlock(
    center: number[],
    width: number,
    height: number,
    depth: number,
    cut: number,
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    const w = width / 2;
    const h = height / 2;
    return b.extrude(
      [
        [-w + cut, -h],
        [w - cut, -h],
        [w, -h + cut],
        [w, h - cut],
        [w - cut, h],
        [-w + cut, h],
        [-w, h - cut],
        [-w, -h + cut],
      ],
      {
        at: center,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: depth,
        bevel: 0.025,
        detail: 0.5,
        color,
        bone,
        name,
      },
    );
  }

  // The face: a tall blunt head, a broad square muzzle, and small tranquil eyes.
  const skull = roundedBlock(
    [0, 0.673, 0.485],
    0.443,
    0.39,
    0.48,
    0.07,
    fur,
    head,
    "capybaraSkull",
  );
  const muzzle = roundedBlock(
    [0, 0.598, 0.725],
    0.459,
    0.226,
    0.326,
    0.05,
    muzzlePaint,
    head,
    "broadUpperMuzzle",
  );
  roundedBlock(
    [0, 0.493, 0.705],
    0.383,
    0.078,
    0.311,
    0.024,
    fur,
    jaw,
    "lowerJaw",
  );

  for (const s of [-1, 1]) {
    b.decal(skull, eyeTex, {
      at: [s * 0.146, 0.76, 0.733],
      dir: [s * 0.12, 0, 1],
      size: [0.112, 0.084],
      mirror: s > 0,
      bone: head,
      lift: 0.002,
      name: s > 0 ? "eyeL" : "eyeR",
    });
    ellipsoid(
      [s * 0.102, 0.655, 0.883],
      [0.033, 0.018, 0.009],
      C.nose,
      head,
      "nostril",
      10,
    );
    b.sweep(
      [
        [s * 0.133, 0.662, 0.883],
        [s * 0.112, 0.674, 0.886],
        [s * 0.086, 0.67, 0.887],
      ],
      0.004,
      { color: C.light, bone: head, sides: 6, name: "nostrilRidge" },
    );
    b.decal(muzzle, frecklesTex, {
      at: [s * 0.146, 0.574, 0.89],
      dir: [0, 0, 1],
      size: [0.11, 0.065],
      mirror: s < 0,
      bone: head,
      name: "whiskerFreckles",
    });
    b.sweep(
      bezier(
        [s * 0.016, 0.509, 0.892],
        [s * 0.09, 0.505, 0.888],
        [s * 0.167, 0.528, 0.872],
      ),
      0.0045,
      { color: C.nose, bone: head, sides: 6, name: "quietSmile" },
    );
  }
  b.rod([0, 0.555, 0.892], [0, 0.515, 0.892], 0.0037, {
    color: C.nose,
    bone: head,
    name: "muzzleCleft",
  });

  ears.forEach((ear, i) => {
    const s = i === 0 ? -1 : 1;
    ellipsoid(
      [s * 0.206, 0.856, 0.35],
      [0.069, 0.083, 0.043],
      fur,
      ear,
      "roundedEar",
      10,
    );
    ellipsoid(
      [s * 0.209, 0.862, 0.387],
      [0.043, 0.052, 0.012],
      C.ear,
      ear,
      "earInterior",
      10,
    );
    ellipsoid(
      [s * 0.208, 0.848, 0.398],
      [0.025, 0.028, 0.009],
      C.brown,
      ear,
      "earFold",
      8,
    );
    b.sweep(
      [
        [s * 0.235, 0.881, 0.389],
        [s * 0.22, 0.902, 0.383],
        [s * 0.198, 0.904, 0.382],
      ],
      0.006,
      { bone: ear, color: C.light, sides: 6, name: "earRimHighlight" },
    );
  });

  // Long barrel body and short sturdy legs retain an unmistakably capybara silhouette.
  const body = b.loft(
    [
      { at: [0, 0.435, -0.65], w: 0.3, h: 0.33 },
      { at: [0, 0.46, -0.53], w: 0.53, h: 0.48 },
      { at: [0, 0.47, -0.23], w: 0.57, h: 0.49 },
      { at: [0, 0.47, 0.05], w: 0.51, h: 0.46 },
      { at: [0, 0.49, 0.24], w: 0.38, h: 0.36 },
    ],
    {
      bone: [hips, spine],
      color: fur,
      section: { ngon: 8 },
      caps: "round",
      name: "barrelBody",
    },
  );

  b.sweep(neck, () => [0.19, 0.187], {
    color: fur,
    section: { ngon: 8 },
    name: "sturdyNeck",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, [leg.front ? 0.09 : 0.112, 0.074, 0.065], {
      color: fur,
      section: { ngon: 8 },
      caps: "round",
      name: "shortLeg",
    });
    roundedBlock(
      [leg.s * 0.24, 0.119, leg.z + 0.055],
      0.151,
      0.107,
      0.17,
      0.024,
      fur,
      leg.chain.tip!,
      "broadFoot",
    );
    leg.toes.forEach((toe) => {
      b.sweep(toe, [0.026, 0.023], {
        color: muzzlePaint,
        sides: 6,
        caps: "round",
        name: "separatedToe",
      });
      const p = toe.at(1).at;
      ellipsoid(
        [p.x, p.y + 0.001, p.z + 0.017],
        [0.019, 0.013, 0.019],
        C.claw,
        toe.joints[0],
        "smallHoofNail",
        8,
      );
    });
  }

  // Sparse, broad coat marks: not a dense realistic fur coat.
  const bodySurface = b.surface(body);
  const furHits = bodySurface.scatter(33, {
    rng: random,
    minDist: 0.075,
    filter: (hit) => hit.n.y > -0.15 && hit.at.z < 0.12,
  });
  furHits.forEach((hit, i) => {
    b.stick(
      new THREE.BoxGeometry(0.008, 0.004, 0.035 + (i % 3) * 0.008),
      i % 3 === 0 ? C.light : C.brown,
      hit,
      { flow: [0, 0.2, -1], embed: 0.2, name: "coatDash" },
    );
  });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const hit = b.surface(skull).around([0, 0.673, 0.485]).at(s * (63 + i * 9), -8);
      b.stick(new THREE.BoxGeometry(0.007, 0.004, 0.028), C.brown, hit, {
        flow: [0, -0.3, -1],
        name: "cheekCoatMark",
      });
    }
  }

  // Bird: a tiny, bright counterpoint to the capybara's large warm shapes.
  ellipsoid(
    [0, 1.017, 0.406],
    [0.083, 0.099, 0.089],
    C.teal,
    birdHips,
    "birdBody",
    12,
  );
  ellipsoid(
    [0, 1.009, 0.463],
    [0.06, 0.071, 0.037],
    C.yellow,
    birdSpine.joints[0],
    "goldenBreast",
    12,
  );
  const birdSkull = ellipsoid(
    [0, 1.107, 0.461],
    [0.076, 0.073, 0.073],
    C.turquoise,
    birdHead,
    "birdSkull",
    12,
  );
  for (const s of [-1, 1]) {
    b.decal(birdSkull, birdEyeTex, {
      at: [s * 0.042, 1.117, 0.519],
      dir: [s * 0.32, 0.08, 1],
      size: [0.048, 0.051],
      bone: birdHead,
      mirror: s > 0,
      lift: 0.001,
      name: "birdEye",
    });
    ellipsoid(
      [s * 0.058, 1.084, 0.508],
      [0.014, 0.01, 0.005],
      C.yellow,
      birdHead,
      "birdCheek",
      8,
    );
  }
  b.extrude(
    [
      [-0.025, 0],
      [0, 0.013],
      [0.055, -0.009],
      [0.009, -0.019],
      [-0.024, -0.014],
    ],
    {
      at: [0, 1.092, 0.526],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.04,
      color: C.yellow,
      bone: birdHead,
      name: "birdUpperBeak",
    },
  );
  b.extrude(
    [
      [-0.02, 0],
      [0.049, 0],
      [0.011, -0.013],
      [-0.02, -0.009],
    ],
    {
      at: [0, 1.073, 0.527],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.032,
      color: C.orange,
      bone: birdJaw,
      name: "birdLowerBeak",
    },
  );

  for (let i = 0; i < 3; i++) {
    b.sweep(
      bezier(
        [(i - 1) * 0.018, 1.16, 0.447],
        [(i - 1) * 0.022, 1.193 + (i === 1 ? 0.012 : 0), 0.437],
        [(i - 1) * 0.025, 1.189 + (i === 1 ? 0.018 : 0), 0.408],
      ),
      [0.012, 0.009, 0],
      { bone: birdHead, color: i === 1 ? C.yellow : C.teal, sides: 6, name: "birdCrest" },
    );
  }

  birdWings.forEach((wing, index) => {
    const s = index === 0 ? -1 : 1;
    b.sweep(wing, [0.031, 0.023, 0.008], {
      color: C.teal,
      sides: 6,
      name: "birdWingArm",
    });
    b.membrane(
      wing,
      [
        [s * 0.064, 0.996, 0.396],
        [s * 0.115, 0.987, 0.343],
        [s * 0.177, 1.018, 0.3],
      ],
      {
        bone: wing,
        color: C.blue,
        thickness: 0.008,
        rows: 2,
        cols: 5,
        name: "birdWingWeb",
      },
    );
    for (let i = 0; i < 4; i++) {
      const x = s * (0.078 + i * 0.025);
      const y = 1.027 - i * 0.002;
      const z = 0.389 - i * 0.019;
      b.sweep(
        [
          [x, y, z],
          [x + s * 0.01, y - 0.013, z - 0.041],
          [x + s * 0.016, y - 0.015, z - 0.061],
        ],
        [0.015, 0.013, 0.002],
        {
          bone: wing.jointAt(i / 4),
          color: i % 2 ? C.teal : C.turquoise,
          sides: 6,
          name: "birdFlightFeather",
        },
      );
    }
    const featherFrame = frame(
      wing.at(0.35),
      [0, 1, 0],
    );
    b.cards([featherFrame], featherTex, {
      size: [0.043, 0.071],
      lean: 90,
      flow: [s * 0.2, 0, -1],
      bone: wing.joints[0],
      sink: 0,
      name: "paintedWingFeather",
    });
  });

  b.sweep(birdTail, [0.026, 0.019, 0.005], {
    color: C.blue,
    sides: 6,
    name: "birdTailStem",
  });
  for (let i = -1; i <= 1; i++) {
    b.sweep(
      [
        [i * 0.015, 0.993, 0.347],
        [i * 0.025, 1.014, 0.24],
        [i * 0.029, 1.031, 0.19 + Math.abs(i) * 0.019],
      ],
      [0.015, 0.018, 0.002],
      {
        bone: birdTail,
        color: i === 0 ? C.turquoise : C.blue,
        sides: 6,
        name: "tailFeather",
      },
    );
  }
  birdLegs.forEach(({ s, leg, toes }) => {
    b.sweep(leg, 0.0065, {
      color: C.orange,
      sides: 6,
      name: "birdLeg",
    });
    toes.forEach((toe) =>
      b.sweep(toe, [0.005, 0.003], {
        color: C.orange,
        sides: 6,
        name: "birdToe",
      }),
    );
    b.sweep(
      [
        [s * 0.037, 0.879, 0.438],
        [s * 0.043, 0.873, 0.405],
      ],
      [0.0045, 0.002],
      { bone: leg.tip!, color: C.orange, sides: 6, name: "birdRearToe" },
    );
  });

  // A compact riverbank plinth, kept much quieter than the two friends.
  b.part(new THREE.CylinderGeometry(1, 0.97, 0.044, 40), C.earth, {
    at: [0, 0.022, 0.055],
    scale: [0.665, 1, 0.982],
    bone: scene,
    name: "riverbankPlinth",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.021, 40), bankPaint, {
    at: [0, 0.0535, 0.055],
    scale: [0.645, 1, 0.96],
    bone: scene,
    name: "softRiverbank",
  });

  // Small polygonal pool along the front-left margin.
  b.extrude(
    [
      [-0.27, -0.1],
      [-0.17, -0.22],
      [0.04, -0.23],
      [0.21, -0.13],
      [0.25, 0.02],
      [0.16, 0.17],
      [-0.02, 0.19],
      [-0.22, 0.11],
    ],
    {
      at: [-0.245, 0.067, 0.65],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.006,
      smoothing: 1,
      color: C.water,
      bone: scene,
      name: "littlePool",
    },
  );

  function ripple(x: number, z: number, r: number, start: number, end: number) {
    const points: number[][] = [];
    for (let i = 0; i < 13; i++) {
      const a = start + ((end - start) * i) / 12;
      points.push([x + Math.cos(a) * r, 0.072, z + Math.sin(a) * r * 0.6]);
    }
    b.sweep(points, 0.0023, {
      bone: scene,
      color: C.waterLight,
      sides: 4,
      name: "waterRipple",
    });
  }
  ripple(-0.31, 0.71, 0.15, 0.1, 2.7);
  ripple(-0.31, 0.71, 0.12, 3.2, 5.8);
  ripple(-0.11, 0.55, 0.07, 0.3, 2.4);

  for (const [x, z, size] of [
    [-0.34, 0.68, 0.15],
    [-0.15, 0.79, 0.105],
    [-0.39, 0.49, 0.09],
  ]) {
    b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
      at: [x, 0.075, z],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: leafTex,
      bone: scene,
      name: "lilyPad",
    });
  }

  // Water-lily petals are thick little primitive blades, rather than a smooth flower.
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + ring * 0.47;
      const dx = Math.cos(angle);
      const dz = Math.sin(angle);
      b.extrude(
        [
          [-0.012, 0],
          [-0.018, 0.024],
          [0, ring ? 0.055 : 0.047],
          [0.018, 0.024],
          [0.012, 0],
        ],
        {
          at: [-0.34 + dx * 0.012, 0.078, 0.68 + dz * 0.012],
          x: [-dz, 0, dx],
          y: [dx * (ring ? 0.4 : 0.85), ring ? 0.9 : 0.53, dz * (ring ? 0.4 : 0.85)],
          thickness: 0.004,
          color: ring ? C.white : C.pink,
          bone: scene,
          name: "waterLilyPetal",
        },
      );
    }
  }
  ellipsoid([-0.34, 0.1, 0.68], [0.013, 0.013, 0.013], C.yellow, scene, "flowerHeart", 8);

  // Reeds stay behind the subject, never across the face.
  for (let clump = 0; clump < 3; clump++) {
    const x = clump === 0 ? -0.43 : clump === 1 ? 0.44 : -0.33;
    const z = clump === 2 ? -0.76 : -0.48;
    for (let i = 0; i < 4; i++) {
      const dx = (random() - 0.5) * 0.11;
      const dz = (random() - 0.5) * 0.09;
      const height = 0.14 + random() * 0.19;
      const base = [x + dx * 0.3, 0.065, z + dz * 0.3];
      const tip = [x + dx, 0.065 + height, z + dz];
      b.sweep(
        bezier(base, [x + dx * 0.5, 0.16, z + dz * 0.5], tip),
        [0.008, 0.002],
        {
          color: i % 2 ? C.reed : C.reedDark,
          bone: scene,
          sides: 5,
          name: "reedStem",
        },
      );
      if (i < 2) {
        b.capsule(
          [tip[0], tip[1] - 0.045, tip[2]],
          [tip[0] + dx * 0.08, tip[1] + 0.014, tip[2]],
          0.012,
          { color: C.brown, bone: scene, sides: 6, name: "cattail" },
        );
      }
      b.extrude(
        [
          [0, 0],
          [0.012, 0.07],
          [0.039, 0.15],
          [0.018, 0.062],
          [0.008, 0],
        ],
        {
          at: base,
          x: [i % 2 ? 1 : -1, 0, 0],
          y: [0, 1, 0.15],
          thickness: 0.003,
          bone: scene,
          color: i % 2 ? C.leaf : C.leafLight,
          name: "reedLeaf",
        },
      );
    }
  }

  const grassFrames = [
    [-0.46, 0.068, -0.18],
    [0.43, 0.068, -0.24],
    [0.39, 0.068, 0.48],
    [-0.29, 0.068, -0.76],
    [0.18, 0.068, -0.76],
    [0.49, 0.068, 0.1],
  ].map((p) => frame(p, [0, 1, 0]));
  b.cards(grassFrames, grassTex, {
    size: [0.105, 0.095],
    cross: true,
    flow: [0, 0, 1],
    vary: 0.2,
    rng: random,
    bone: scene,
    name: "riverGrass",
  });

  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    const x = Math.cos(a) * (0.5 + random() * 0.05);
    const z = 0.06 + Math.sin(a) * (0.77 + random() * 0.05);
    if (x < -0.1 && z > 0.35) continue;
    const size = 0.018 + random() * 0.022;
    pebble(
      [x, 0.067 + size * 0.35, z],
      [size * 1.3, size * 0.55, size],
      i % 3 === 0 ? "#b4af8e" : i % 3 === 1 ? "#8f9a86" : "#748774",
    );
  }

  // A small fallen branch and two cheerful riverbank flowers.
  b.sweep(
    [
      [0.36, 0.086, -0.68],
      [0.43, 0.087, -0.59],
      [0.46, 0.084, -0.45],
    ],
    [0.022, 0.018, 0.013],
    { color: wood, bone: scene, sides: 6, name: "fallenBranch" },
  );
  b.rod([0.424, 0.09, -0.59], [0.51, 0.098, -0.57], [0.011, 0.004], {
    color: wood,
    bone: scene,
    sides: 6,
    name: "branchTwig",
  });

  for (const [x, z, h] of [
    [0.41, 0.45, 0.12],
    [0.46, 0.31, 0.09],
  ]) {
    b.rod([x, 0.066, z], [x - 0.006, h + 0.065, z], 0.0035, {
      color: C.leaf,
      bone: scene,
      sides: 5,
      name: "flowerStem",
    });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ellipsoid(
        [x - 0.006 + Math.cos(a) * 0.014, h + 0.066, z + Math.sin(a) * 0.014],
        [0.012, 0.006, 0.012],
        C.white,
        scene,
        "daisyPetal",
        8,
      );
    }
    ellipsoid(
      [x - 0.006, h + 0.071, z],
      [0.009, 0.007, 0.009],
      C.yellow,
      scene,
      "daisyCenter",
      8,
    );
  }

  return b.root;
}
```