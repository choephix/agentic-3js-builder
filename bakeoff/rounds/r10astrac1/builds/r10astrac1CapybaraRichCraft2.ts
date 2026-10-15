import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  svg,
  paint,
  grain,
  mix,
  noise,
} from "../../../../src/index";
import type { Fill, Joint } from "../../../../src/index";

export const meta = {
  name: "A Very Patient Perch",
  description:
    "A placid, chunky capybara carrying a jewel-colored bird. A fuller barrel silhouette, chamfered muzzle, wraparound sleepy eyes, and miniature flowering riverbank give this rigged primitive puppet its character.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "A Very Patient Perch",
    paintSize: 2048,
  });
  const random = rng(73);

  // Art-direction changes:
  // 1. A deeper barrel and substantial haunches replace the thin, pointed rump.
  // 2. A long chamfered head replaces the stacked-box forehead and muzzle.
  // 3. Larger, oblique eyes remain readable in front AND side views.
  // 4. The bird's breast and feather layers sit within its silhouette.
  // 5. Sparse illustrated coat strokes replace raised rectangular fur dashes.
  // 6. A scalloped pool and varied shoreline soften the display-base feeling.

  const C = {
    ink: "#49352d",
    brown: "#9f6b43",
    honey: "#bb8955",
    light: "#d8ac74",
    cream: "#ebc894",
    ear: "#80533d",
    nose: "#513d31",
    claw: "#70543b",
    teal: "#258b91",
    turquoise: "#4db7b1",
    blue: "#285c70",
    mint: "#a8deca",
    yellow: "#f0c760",
    orange: "#d48b3c",
    earth: "#455e55",
    water: "#639f9b",
    waterLight: "#bad5bd",
    leaf: "#567d5c",
    leafLight: "#94aa73",
    reed: "#a0ae76",
    reedDark: "#687f57",
    pink: "#e2a69a",
    white: "#fff0cf",
  };

  const fur = paint((p, n) => {
    const warm = mix("#a8774b", "#c89b68", noise(p, 0.17, 21));
    return mix(
      warm,
      "#e3bb81",
      Math.max(0, 0.27 + 0.38 * n.y + 0.12 * n.z) * 0.45,
    );
  });
  const muzzlePaint = paint((p, n) =>
    mix(
      "#b68a5b",
      "#dcba83",
      0.43 + n.y * 0.19 + (noise(p, 0.075, 9) - 0.5) * 0.22,
    ),
  );
  const wood = grain("#70543e", "#957657", {
    size: 0.018,
    axis: "z",
    seed: 8,
  });
  const bankPaint = paint((p, n) =>
    mix(
      "#60765f",
      "#8c9b7c",
      Math.max(0, n.y) * (0.35 + noise(p, 0.23, 14) * 0.55),
    ),
  );

  const eyeTex = svg(
    `<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 52Q32 25 75 29Q111 31 130 50Q111 78 73 78Q31 77 10 52Z"
        fill="#c79761"/>
      <path d="M17 52Q39 36 75 39Q108 39 123 51Q103 70 74 70Q39 70 17 52Z"
        fill="#3c3029"/>
      <ellipse cx="78" cy="52" rx="19" ry="18" fill="#76513a"/>
      <ellipse cx="79" cy="53" rx="12" ry="17" fill="#292827"/>
      <ellipse cx="85" cy="46" rx="6.5" ry="5.5" fill="#fff0cf"/>
      <circle cx="72" cy="62" r="3" fill="#d7b786"/>
      <path d="M15 46Q62 26 126 46" fill="none" stroke="#65462f"
        stroke-width="8" stroke-linecap="round"/>
      <path d="M22 77Q65 90 113 76" fill="none" stroke="#dcb581"
        stroke-width="4" stroke-linecap="round"/>
      <path d="M34 20Q67 10 103 21" fill="none" stroke="#94673f"
        stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const frecklesTex = svg(
    `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
      <g fill="#8c633e">
        <ellipse cx="27" cy="26" rx="3.5" ry="2.8"/>
        <ellipse cx="48" cy="19" rx="3.4" ry="2.7"/>
        <ellipse cx="64" cy="35" rx="3" ry="2.5"/>
        <ellipse cx="36" cy="46" rx="3.2" ry="2.5"/>
        <ellipse cx="86" cy="26" rx="2.7" ry="2.3"/>
      </g>
      <g stroke="#e7c38a" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M16 54l9-2 M67 15l7-1 M80 47l8-2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const coatTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M22 20Q29 32 28 44M53 34Q61 46 59 61M77 18Q83 28 82 37"
          stroke="#986a43" stroke-width="4"/>
        <path d="M32 21L35 34M65 36L68 48M44 67L47 81"
          stroke="#d9b17a" stroke-width="4"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  const birdEyeTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="40" ry="42" fill="#b9e3ca"/>
      <ellipse cx="50" cy="52" rx="28" ry="31" fill="#24434c"/>
      <ellipse cx="52" cy="55" rx="17" ry="22" fill="#172e37"/>
      <ellipse cx="43" cy="39" rx="9" ry="11" fill="#fff6df"/>
      <circle cx="62" cy="65" r="4.8" fill="#c2ede1"/>
      <path d="M16 24Q40 5 69 16" fill="none" stroke="#285b70"
        stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const featherTex = svg(
    `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 155Q9 126 12 61Q12 20 39 5Q68 23 68 64Q71 122 40 155Z"
        fill="#4db7b1" stroke="#285c70" stroke-width="5"/>
      <path d="M40 145Q41 85 39 19" fill="none" stroke="#a8deca" stroke-width="5"/>
      <g stroke="#258b91" fill="none" stroke-width="4" stroke-linecap="round">
        <path d="M39 48L23 35M40 70L19 53M40 92L19 74M40 114L23 96"/>
        <path d="M41 58L58 42M41 81L62 63M41 104L59 86M41 126L54 109"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const leafTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 65L60 7C21 6 5 32 7 66C8 103 39 122 76 117C109 112 126 85 119 53C115 26 96 10 76 8Z"
        fill="#7d9c6c" stroke="#4d7559" stroke-width="4"/>
      <g stroke="#acbd82" stroke-width="3" fill="none">
        <path d="M64 65L19 37M64 65L15 73M64 65L42 108M64 65L84 107M64 65L110 78M64 65L105 37"/>
      </g>
      <path d="M20 48Q19 26 44 20" fill="none" stroke="#c1cc95"
        stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const grassTex = svg(
    `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 130Q38 54 5 28Q46 43 50 108Q52 24 76 3Q65 60 61 126Q78 70 98 61Q77 101 73 130Z"
        fill="#789967"/>
      <path d="M51 128Q53 68 68 23M46 127Q38 72 24 53"
        stroke="#b6bd7e" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. The fixed scene root keeps the setting out of the animal rig.
  const scene = b.joint("scene", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: scene,
    at: [0, 0.43, -0.39],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.43, -0.39],
      [0, 0.47, -0.15],
      [0, 0.48, 0.14],
    ],
    {
      parent: hips,
      names: ["spine1", "chest", "shoulders"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.49, 0.11],
      [0, 0.59, 0.29],
      [0, 0.65, 0.43],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.65, 0.43],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.505, 0.46],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [-1, 1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.193, 0.817, 0.35],
      dir: [s * 0.25, 1, 0],
      role: "hinge",
    }),
  );

  const legs = [-1, 1].flatMap((s) =>
    [false, true].map((front) => {
      const tag = `${front ? "F" : "H"}${s > 0 ? "L" : "R"}`;
      const z = front ? 0.22 : -0.43;
      const chain = b.chain(
        `leg${tag}`,
        [
          [s * 0.2, 0.42, z - 0.035],
          [s * 0.24, 0.235, z - 0.035],
          [s * 0.25, 0.13, z + 0.015],
        ],
        {
          parent: front ? spine.tip! : hips,
          names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
          role: "leg",
          contact: [s * 0.25, 0.065, z + 0.08],
        },
      );
      const toes = [-1, 0, 1].map((i) =>
        b.chain(
          `toe${tag}${i + 2}`,
          [
            [s * 0.25 + i * 0.038, 0.111, z + 0.067],
            [s * 0.25 + i * 0.047, 0.105, z + 0.155],
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
        [s * 0.037, 0.868, 0.438],
      ],
      {
        parent: birdHips,
        names: [`birdHip${side}`, `birdKnee${side}`, `birdAnkle${side}`],
        role: "leg",
      },
    );
    const toes = [-1, 0, 1].map((i) =>
      b.chain(
        `birdToe${side}${i + 2}`,
        [
          [s * 0.037, 0.869, 0.438],
          [s * 0.037 + i * 0.018, 0.866, 0.482 + (i === 0 ? 0.014 : 0)],
        ],
        { parent: leg.tip!, count: 1, role: "digit" },
      ),
    );
    return { s, leg, toes };
  });

  function ellipsoid(
    at: number[],
    scale: number[],
    color: Fill,
    bone: Joint,
    name: string,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale,
      bone,
      name,
      flat: true,
    });
  }

  function chamferedBlock(
    at: number[],
    width: number,
    height: number,
    depth: number,
    cut: number,
    bevel: number,
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
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: depth,
        bevel,
        detail: 0.5,
        color,
        bone,
        name,
      },
    );
  }

  function pebble(at: number[], scale: number[], color: Fill) {
    return b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      at,
      scale,
      bone: scene,
      name: "riverPebble",
    });
  }

  // The skull has one continuous, gently tapering silhouette. Its octagonal
  // sections provide oblique cheek planes for the eyes rather than a blank side.
  const skull = b.loft(
    [
      { at: [0, 0.663, 0.265], w: 0.31, h: 0.315 },
      { at: [0, 0.672, 0.36], w: 0.445, h: 0.39 },
      { at: [0, 0.667, 0.49], w: 0.455, h: 0.387 },
      { at: [0, 0.635, 0.65], w: 0.445, h: 0.325 },
      { at: [0, 0.596, 0.79], w: 0.418, h: 0.24 },
    ],
    {
      bone: head,
      color: fur,
      section: { ngon: 8 },
      caps: "flat",
      name: "longCapybaraSkull",
    },
  );

  const muzzle = chamferedBlock(
    [0, 0.582, 0.756],
    0.435,
    0.223,
    0.247,
    0.062,
    0.038,
    muzzlePaint,
    head,
    "bluntUpperMuzzle",
  );
  chamferedBlock(
    [0, 0.483, 0.692],
    0.375,
    0.071,
    0.328,
    0.028,
    0.022,
    fur,
    jaw,
    "lowerJaw",
  );

  const faceSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const eyeHit = faceSurface.nearest([s * 0.201, 0.755, 0.596]);
    b.decal(skull, eyeTex, {
      at: eyeHit,
      dir: [s * 0.76, 0.24, 0.65],
      size: [0.139, 0.099],
      mirror: s > 0,
      bone: head,
      lift: 0.002,
      name: s > 0 ? "eyeL" : "eyeR",
    });

    ellipsoid(
      [s * 0.098, 0.64, 0.874],
      [0.028, 0.014, 0.006],
      C.nose,
      head,
      "nostril",
      10,
    );
    b.sweep(
      [
        [s * 0.123, 0.645, 0.875],
        [s * 0.105, 0.653, 0.877],
        [s * 0.08, 0.649, 0.877],
      ],
      0.0035,
      { bone: head, color: C.light, sides: 6, name: "nostrilRidge" },
    );
    b.decal(muzzle, frecklesTex, {
      at: [s * 0.137, 0.559, 0.881],
      dir: [0, 0, 1],
      size: [0.105, 0.068],
      mirror: s < 0,
      bone: head,
      name: "whiskerFreckles",
    });
    b.sweep(
      bezier(
        [s * 0.012, 0.503, 0.877],
        [s * 0.079, 0.495, 0.876],
        [s * 0.146, 0.519, 0.864],
      ),
      0.0032,
      { color: C.nose, bone: head, sides: 6, name: "quietSmile" },
    );

    // A few fine cheek hairs are separate from the painted whisker pores.
    for (let i = 0; i < 2; i++) {
      b.sweep(
        bezier(
          [s * 0.19, 0.548 + i * 0.02, 0.826],
          [s * 0.221, 0.545 + i * 0.022, 0.827],
          [s * 0.246, 0.553 + i * 0.024, 0.813],
        ),
        [0.0015, 0.0005],
        { bone: head, color: C.cream, sides: 4, name: "shortWhisker" },
      );
    }
  }

  b.rod([0, 0.546, 0.88], [0, 0.505, 0.878], 0.0027, {
    color: C.nose,
    bone: head,
    sides: 6,
    name: "muzzleCleft",
  });

  ears.forEach((ear, i) => {
    const s = i === 0 ? -1 : 1;
    ellipsoid(
      [s * 0.203, 0.841, 0.35],
      [0.061, 0.071, 0.041],
      fur,
      ear,
      "roundedEar",
      10,
    );
    ellipsoid(
      [s * 0.205, 0.845, 0.383],
      [0.038, 0.044, 0.009],
      C.ear,
      ear,
      "earInterior",
      10,
    );
    ellipsoid(
      [s * 0.204, 0.828, 0.39],
      [0.027, 0.022, 0.01],
      C.honey,
      ear,
      "earFold",
      8,
    );
    b.sweep(
      [
        [s * 0.228, 0.861, 0.382],
        [s * 0.218, 0.883, 0.375],
        [s * 0.197, 0.886, 0.374],
      ],
      0.0045,
      { bone: ear, color: C.light, sides: 6, name: "earRim" },
    );
  });

  // The barrel is deliberately heavier and lower than the head.
  const body = b.loft(
    [
      { at: [0, 0.426, -0.658], w: 0.365, h: 0.405 },
      { at: [0, 0.445, -0.56], w: 0.56, h: 0.525 },
      { at: [0, 0.46, -0.34], w: 0.625, h: 0.565 },
      { at: [0, 0.46, -0.095], w: 0.608, h: 0.56 },
      { at: [0, 0.47, 0.115], w: 0.535, h: 0.505 },
      { at: [0, 0.49, 0.26], w: 0.395, h: 0.38 },
    ],
    {
      bone: [hips, spine],
      color: fur,
      section: { ngon: 10 },
      caps: "flat",
      name: "heavyBarrelBody",
    },
  );
  b.sweep(neck, () => [0.205, 0.202], {
    color: fur,
    section: { ngon: 8 },
    name: "sturdyNeck",
  });

  for (const leg of legs) {
    b.sweep(
      leg.chain,
      [leg.front ? 0.102 : 0.125, 0.078, 0.066],
      {
        color: fur,
        section: { ngon: 8 },
        caps: "round",
        name: "shortSturdyLeg",
      },
    );
    chamferedBlock(
      [leg.s * 0.25, 0.119, leg.z + 0.055],
      0.155,
      0.107,
      0.17,
      0.025,
      0.018,
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
        [p.x, p.y, p.z + 0.017],
        [0.018, 0.011, 0.016],
        C.claw,
        toe.joints[0],
        "smallHoofNail",
        8,
      );
    });
  }

  const bodySurface = b.surface(body);
  const coatHits = bodySurface.scatter(21, {
    rng: random,
    minDist: 0.113,
    filter: (hit) => hit.n.y > -0.12 && hit.at.z < 0.12,
  });
  coatHits.forEach((hit, i) => {
    b.decal(body, coatTex, {
      at: hit,
      size: [0.072, 0.089],
      up: [0, 0.55, -1],
      roll: (i % 3 - 1) * 12,
      segments: 4,
      lift: 0.001,
      name: "paintedCoatStrokes",
    });
  });
  for (const s of [-1, 1]) {
    b.decal(skull, coatTex, {
      at: [s * 0.223, 0.613, 0.41],
      dir: [s, 0, 0],
      size: [0.085, 0.095],
      up: [0, 1, 0],
      mirror: s < 0,
      segments: 4,
      name: "paintedCheekStrokes",
    });
  }

  // Bird: warm breast tucked into a simple, round teal silhouette.
  const birdBody = ellipsoid(
    [0, 1.017, 0.406],
    [0.083, 0.099, 0.089],
    C.teal,
    birdHips,
    "birdBody",
  );
  const breastTex = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 5Q50 15 76 5L88 35Q91 87 50 114Q9 87 12 35Z"
        fill="#f0c760"/>
      <path d="M23 49L30 56M46 70L50 77M70 48L65 56M36 87L42 94"
        stroke="#dca545" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M30 23Q50 31 70 23" stroke="#f8dda0" stroke-width="5"
        stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  b.decal(birdBody, breastTex, {
    at: [0, 1.019, 0.495],
    dir: [0, 0, 1],
    size: [0.126, 0.14],
    bone: birdHips,
    lift: 0.001,
    name: "goldenBreast",
  });
  const birdSkull = ellipsoid(
    [0, 1.107, 0.461],
    [0.076, 0.073, 0.073],
    C.turquoise,
    birdHead,
    "birdSkull",
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
      [0.014, 0.009, 0.004],
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
      {
        bone: birdHead,
        color: i === 1 ? C.yellow : C.teal,
        sides: 6,
        name: "birdCrest",
      },
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
    b.cards(
      [frame(wing.at(0.35).moved({ up: 0.026 }), [0, 1, 0])],
      featherTex,
      {
        size: [0.035, 0.057],
        lean: 90,
        flow: [s * 0.2, 0, -1],
        bone: wing.joints[0],
        sink: 0,
        name: "paintedWingFeather",
      },
    );
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
        [s * 0.037, 0.871, 0.438],
        [s * 0.043, 0.866, 0.405],
      ],
      [0.0045, 0.002],
      {
        bone: leg.tip!,
        color: C.orange,
        sides: 6,
        name: "birdRearToe",
      },
    );
  });

  // A compact riverbank. Its top is the animal's contact plane.
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

  b.extrude(
    [
      [-0.28, -0.075],
      [-0.24, -0.17],
      [-0.13, -0.215],
      [-0.025, -0.185],
      [0.07, -0.21],
      [0.21, -0.12],
      [0.25, -0.015],
      [0.2, 0.065],
      [0.12, 0.1],
      [0.08, 0.18],
      [-0.04, 0.205],
      [-0.16, 0.155],
      [-0.23, 0.12],
    ],
    {
      at: [-0.245, 0.067, 0.65],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.006,
      smoothing: 1,
      color: C.water,
      bone: scene,
      name: "scallopedPool",
    },
  );

  function ripple(
    x: number,
    z: number,
    radius: number,
    start: number,
    end: number,
  ) {
    const points: number[][] = [];
    for (let i = 0; i < 13; i++) {
      const a = start + ((end - start) * i) / 12;
      points.push([
        x + Math.cos(a) * radius,
        0.072,
        z + Math.sin(a) * radius * 0.6,
      ]);
    }
    b.sweep(points, 0.0017, {
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

  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + ring * 0.47;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
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
          y: [
            dx * (ring ? 0.4 : 0.85),
            ring ? 0.9 : 0.53,
            dz * (ring ? 0.4 : 0.85),
          ],
          thickness: 0.004,
          color: ring ? C.white : C.pink,
          bone: scene,
          name: "waterLilyPetal",
        },
      );
    }
  }
  ellipsoid(
    [-0.34, 0.1, 0.68],
    [0.013, 0.013, 0.013],
    C.yellow,
    scene,
    "flowerHeart",
    8,
  );

  // Broken, asymmetric shoreline stones help the pool belong to the bank.
  for (const [x, z, r] of [
    [-0.48, 0.47, 0.025],
    [-0.44, 0.43, 0.019],
    [-0.385, 0.429, 0.028],
    [-0.015, 0.65, 0.025],
    [-0.035, 0.7, 0.018],
    [-0.21, 0.855, 0.026],
  ]) {
    pebble(
      [x, 0.069 + r * 0.3, z],
      [r * 1.3, r * 0.45, r],
      "#a6af90",
    );
  }

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
        [0.006, 0.002],
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
          0.011,
          {
            color: C.brown,
            bone: scene,
            sides: 6,
            name: "cattail",
          },
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
    [-0.48, 0.068, 0.32],
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
    const r = 0.018 + random() * 0.022;
    pebble(
      [x, 0.067 + r * 0.35, z],
      [r * 1.3, r * 0.55, r],
      i % 3 === 0 ? "#b4af8e" : i % 3 === 1 ? "#8f9a86" : "#748774",
    );
  }

  b.sweep(
    [
      [0.36, 0.086, -0.68],
      [0.43, 0.087, -0.59],
      [0.46, 0.084, -0.45],
    ],
    [0.022, 0.018, 0.013],
    { color: wood, bone: scene, sides: 6, name: "fallenBranch" },
  );
  b.rod(
    [0.424, 0.09, -0.59],
    [0.51, 0.098, -0.57],
    [0.011, 0.004],
    { color: wood, bone: scene, sides: 6, name: "branchTwig" },
  );

  for (const [x, z, h] of [
    [0.41, 0.45, 0.12],
    [0.46, 0.31, 0.09],
    [-0.42, -0.08, 0.085],
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
        [
          x - 0.006 + Math.cos(a) * 0.014,
          h + 0.066,
          z + Math.sin(a) * 0.014,
        ],
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
