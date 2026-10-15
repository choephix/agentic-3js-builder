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
    "A sleepy, honey-colored capybara and its tiny turquoise passenger, resting beside a flowering river pool. A faceted primitive puppet with an animation-ready skeleton.",
};

export default function build(): THREE.Object3D {
  // 1. Bring the eyes around the front corners on shallow cheek forms:
  //    the expression should survive a straight-on view.
  // 2. Seat nostrils on the actual muzzle surface, close the excessive
  //    jaw seam, and soften the squared-off mouth corners.
  // 3. Fill out the shoulder and shorten the visual neck; keep the heavy,
  //    low barrel and make the ears slightly smaller and better rooted.
  // 4. Lower the bird and fit its toes to the skull surface. The passenger
  //    now bears weight instead of hovering just above its perch.
  // 5. Retain the restrained riverbank palette and painted coat details;
  //    strengthen the hero rather than adding competing accessories.

  const b = createBuilder({
    name: "A Very Patient Perch",
    paintSize: 2048,
  });
  const random = rng(73);
  const C = {
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
      <path d="M9 51Q34 23 75 27Q111 29 131 49Q111 81 73 81Q29 80 9 51Z"
        fill="#c79761"/>
      <path d="M16 51Q40 32 75 35Q109 35 124 50Q104 74 74 74Q37 74 16 51Z"
        fill="#3c3029"/>
      <ellipse cx="76" cy="53" rx="22" ry="21" fill="#997046"/>
      <path d="M57 60Q76 77 96 59" fill="none" stroke="#c29b62" stroke-width="6"/>
      <ellipse cx="77" cy="53" rx="12" ry="19" fill="#292827"/>
      <ellipse cx="83" cy="45" rx="7" ry="6" fill="#fff0cf"/>
      <circle cx="69" cy="64" r="3" fill="#e4c794"/>
      <path d="M14 44Q62 24 127 44" fill="none" stroke="#65462f"
        stroke-width="8" stroke-linecap="round"/>
      <path d="M24 81Q67 91 115 79" fill="none" stroke="#e0ba85"
        stroke-width="4" stroke-linecap="round"/>
      <path d="M34 19Q68 8 104 20" fill="none" stroke="#94673f"
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

  // Skeleton: the setting stays fixed under its own root.
  const scene = b.joint("scene", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: scene,
    at: [0, 0.43, -0.39],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.43, -0.39], [0, 0.47, -0.15], [0, 0.48, 0.14]],
    {
      parent: hips,
      names: ["spine1", "chest", "shoulders"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [[0, 0.49, 0.11], [0, 0.59, 0.29], [0, 0.65, 0.43]],
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
    at: [0, 0.513, 0.46],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const ears = [-1, 1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.183, 0.803, 0.35],
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

  // One shared offset keeps every bird feature together.
  const B = (x: number, y: number, z: number): number[] => [x, y - 0.018, z];
  const birdHips = b.joint("birdHips", {
    parent: head,
    at: B(0, 0.99, 0.41),
    dir: [0, 0.3, 1],
    role: "spine",
  });
  const birdSpine = b.chain(
    "birdSpine",
    [B(0, 0.99, 0.4), B(0, 1.045, 0.435)],
    { parent: birdHips, count: 1, role: "spine" },
  );
  const birdHead = b.joint("birdHead", {
    parent: birdSpine.joints[0],
    at: B(0, 1.102, 0.465),
    dir: [0, 0, 1],
    role: "head",
  });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: B(0, 1.08, 0.518),
    dir: [0, 0, 1],
    role: "jaw",
  });
  const birdTail = b.chain(
    "birdTail",
    [B(0, 0.993, 0.355), B(0, 1.008, 0.24), B(0, 1.025, 0.19)],
    { parent: birdHips, names: ["birdTail1", "birdTail2"], role: "tail" },
  );
  const birdWings = [-1, 1].map((s) =>
    b.chain(
      s > 0 ? "birdWingL" : "birdWingR",
      [
        B(s * 0.063, 1.042, 0.41),
        B(s * 0.119, 1.032, 0.375),
        B(s * 0.177, 1.025, 0.325),
      ],
      { parent: birdSpine.joints[0], count: 2, role: "wing" },
    ),
  );
  const birdLegs = [-1, 1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `birdLeg${side}`,
      [
        B(s * 0.036, 0.983, 0.422),
        B(s * 0.035, 0.927, 0.414),
        B(s * 0.037, 0.868, 0.438),
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
          B(s * 0.037, 0.869, 0.438),
          B(s * 0.037 + i * 0.018, 0.866, 0.482 + (i === 0 ? 0.014 : 0)),
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
      at, scale, bone, name, flat: true,
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
        [-w + cut, -h], [w - cut, -h], [w, -h + cut],
        [w, h - cut], [w - cut, h], [-w + cut, h],
        [-w, h - cut], [-w, -h + cut],
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
      at, scale, bone: scene, name: "riverPebble",
    });
  }

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
    0.435, 0.223, 0.247, 0.062, 0.038,
    muzzlePaint, head, "bluntUpperMuzzle",
  );
  chamferedBlock(
    [0, 0.494, 0.699],
    0.365, 0.078, 0.32, 0.034, 0.027,
    fur, jaw, "lowerJaw",
  );

  for (const s of [-1, 1]) {
    // Partially buried eye cushions give the eye drawing a front-facing
    // surface without turning the capybara into a front-eyed predator.
    const eyeMount = ellipsoid(
      [s * 0.183, 0.744, 0.624],
      [0.071, 0.055, 0.054],
      fur, head, s > 0 ? "eyeCushionL" : "eyeCushionR",
    );
    b.decal([skull, eyeMount], eyeTex, {
      at: [s * 0.204, 0.751, 0.672],
      dir: [s * 0.53, 0.12, 0.85],
      size: [0.124, 0.093],
      mirror: s > 0,
      bone: head,
      lift: 0.0015,
      name: s > 0 ? "eyeL" : "eyeR",
    });

    const nostrilHit = b.surface(muzzle).ray(
      [s * 0.102, 0.632, 1.05], [0, 0, -1],
    )!;
    b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      C.nose,
      nostrilHit,
      {
        scale: [0.026, 0.006, 0.012],
        embed: 0.2,
        bone: head,
        name: "visibleNostril",
      },
    );

    b.decal(muzzle, frecklesTex, {
      at: [s * 0.137, 0.559, 0.881],
      dir: [0, 0, 1],
      size: [0.105, 0.068],
      mirror: s < 0,
      bone: head,
      name: "whiskerFreckles",
    });
    const smile = b.surface(muzzle).drape(
      bezier(
        [s * 0.008, 0.507, 0.89],
        [s * 0.083, 0.498, 0.89],
        [s * 0.149, 0.521, 0.875],
      ),
      { lift: 0.0018 },
    );
    b.sweep(smile, 0.0026, {
      color: C.nose,
      bone: head,
      sides: 6,
      name: "quietSmile",
    });
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
  b.sweep(
    b.surface(muzzle).drape(
      [[0, 0.542, 0.9], [0, 0.506, 0.9]],
      { lift: 0.0018 },
    ),
    0.0024,
    { color: C.nose, bone: head, sides: 6, name: "muzzleCleft" },
  );

  ears.forEach((ear, i) => {
    const s = i === 0 ? -1 : 1;
    ellipsoid(
      [s * 0.19, 0.827, 0.35],
      [0.053, 0.062, 0.037],
      fur, ear, "roundedEar", 10,
    );
    ellipsoid(
      [s * 0.192, 0.834, 0.38],
      [0.032, 0.038, 0.008],
      C.ear, ear, "earInterior", 10,
    );
    ellipsoid(
      [s * 0.191, 0.816, 0.386],
      [0.024, 0.018, 0.009],
      C.honey, ear, "earFold", 8,
    );
    b.sweep(
      [
        [s * 0.213, 0.848, 0.38],
        [s * 0.205, 0.865, 0.374],
        [s * 0.187, 0.869, 0.374],
      ],
      0.0038,
      { bone: ear, color: C.light, sides: 6, name: "earRim" },
    );
  });

  const body = b.loft(
    [
      { at: [0, 0.426, -0.658], w: 0.365, h: 0.405 },
      { at: [0, 0.445, -0.56], w: 0.56, h: 0.525 },
      { at: [0, 0.46, -0.34], w: 0.625, h: 0.565 },
      { at: [0, 0.46, -0.095], w: 0.608, h: 0.56 },
      { at: [0, 0.48, 0.115], w: 0.555, h: 0.54 },
      { at: [0, 0.515, 0.26], w: 0.425, h: 0.425 },
    ],
    {
      bone: [hips, spine],
      color: fur,
      section: { ngon: 10 },
      caps: "flat",
      name: "heavyBarrelBody",
    },
  );
  b.sweep(neck, (t) => [0.222 - t * 0.017, 0.222 - t * 0.02], {
    color: fur,
    section: { ngon: 8 },
    name: "sturdyNeck",
  });

  for (const leg of legs) {
    b.sweep(
      leg.chain,
      [leg.front ? 0.106 : 0.125, 0.078, 0.066],
      {
        color: fur,
        section: { ngon: 8 },
        caps: "round",
        name: "shortSturdyLeg",
      },
    );
    chamferedBlock(
      [leg.s * 0.25, 0.119, leg.z + 0.055],
      0.155, 0.107, 0.17, 0.025, 0.018,
      fur, leg.chain.tip!, "broadFoot",
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
        C.claw, toe.joints[0], "smallHoofNail", 8,
      );
    });
  }

  const coatHits = b.surface(body).scatter(21, {
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

  const birdBody = ellipsoid(
    B(0, 1.017, 0.406),
    [0.083, 0.099, 0.089],
    C.teal, birdHips, "birdBody",
  );
  b.decal(birdBody, breastTex, {
    at: B(0, 1.019, 0.495),
    dir: [0, 0, 1],
    size: [0.126, 0.14],
    bone: birdHips,
    lift: 0.001,
    name: "goldenBreast",
  });
  const birdSkull = ellipsoid(
    B(0, 1.107, 0.461),
    [0.076, 0.073, 0.073],
    C.turquoise, birdHead, "birdSkull",
  );
  for (const s of [-1, 1]) {
    b.decal(birdSkull, birdEyeTex, {
      at: B(s * 0.042, 1.117, 0.519),
      dir: [s * 0.32, 0.08, 1],
      size: [0.048, 0.051],
      bone: birdHead,
      mirror: s > 0,
      lift: 0.001,
      name: "birdEye",
    });
    ellipsoid(
      B(s * 0.058, 1.084, 0.508),
      [0.014, 0.009, 0.004],
      C.yellow, birdHead, "birdCheek", 8,
    );
  }
  b.extrude(
    [
      [-0.025, 0], [0, 0.013], [0.055, -0.009],
      [0.009, -0.019], [-0.024, -0.014],
    ],
    {
      at: B(0, 1.092, 0.526),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.04,
      color: C.yellow,
      bone: birdHead,
      name: "birdUpperBeak",
    },
  );
  b.extrude(
    [[-0.02, 0], [0.049, 0], [0.011, -0.013], [-0.02, -0.009]],
    {
      at: B(0, 1.073, 0.527),
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
        B((i - 1) * 0.018, 1.16, 0.447),
        B((i - 1) * 0.022, 1.193 + (i === 1 ? 0.012 : 0), 0.437),
        B((i - 1) * 0.025, 1.189 + (i === 1 ? 0.018 : 0), 0.408),
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
      color: C.teal, sides: 6, name: "birdWingArm",
    });
    b.membrane(
      wing,
      [
        B(s * 0.064, 0.996, 0.396),
        B(s * 0.115, 0.987, 0.343),
        B(s * 0.177, 1.018, 0.3),
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
          B(x, y, z),
          B(x + s * 0.01, y - 0.013, z - 0.041),
          B(x + s * 0.016, y - 0.015, z - 0.061),
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
    color: C.blue, sides: 6, name: "birdTailStem",
  });
  for (let i = -1; i <= 1; i++) {
    b.sweep(
      [
        B(i * 0.015, 0.993, 0.347),
        B(i * 0.025, 1.014, 0.24),
        B(i * 0.029, 1.031, 0.19 + Math.abs(i) * 0.019),
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

  // Contact is taken from the finished skull, not from its bounding box.
  const perchSurface = b.surface(skull);
  function perch(x: number, z: number): number[] {
    const hit = perchSurface.ray([x, 1.05, z], [0, -1, 0])!;
    return [x, hit.at.y + 0.003, z];
  }
  birdLegs.forEach(({ s, leg, toes }) => {
    const foot = perch(s * 0.037, 0.438);
    b.sweep(
      [
        leg.at(0),
        leg.joints[1],
        foot,
      ],
      0.0065,
      {
        bone: leg,
        color: C.orange,
        sides: 6,
        name: "birdLeg",
      },
    );
    toes.forEach((toe, i) => {
      const tip = toe.at(1).at;
      const end = perch(tip.x, tip.z);
      const middle = perch(
        (foot[0] + end[0]) / 2,
        (foot[2] + end[2]) / 2,
      );
      middle[1] += 0.002;
      b.sweep([foot, middle, end], [0.005, 0.004, 0.0025], {
        bone: toe.joints[0],
        color: C.orange,
        sides: 6,
        name: `grippingBirdToe${i}`,
      });
    });
    b.sweep(
      [foot, perch(s * 0.043, 0.405)],
      [0.0045, 0.002],
      {
        bone: leg.tip!,
        color: C.orange,
        sides: 6,
        name: "birdRearToe",
      },
    );
  });

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
      [-0.28, -0.075], [-0.24, -0.17], [-0.13, -0.215],
      [-0.025, -0.185], [0.07, -0.21], [0.21, -0.12],
      [0.25, -0.015], [0.2, 0.065], [0.12, 0.1],
      [0.08, 0.18], [-0.04, 0.205], [-0.16, 0.155],
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
          [-0.012, 0], [-0.018, 0.024],
          [0, ring ? 0.055 : 0.047],
          [0.018, 0.024], [0.012, 0],
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
    [-0.34, 0.1, 0.68], [0.013, 0.013, 0.013],
    C.yellow, scene, "flowerHeart", 8,
  );

  for (const [x, z, r] of [
    [-0.48, 0.47, 0.025], [-0.44, 0.43, 0.019],
    [-0.385, 0.429, 0.028], [-0.015, 0.65, 0.025],
    [-0.035, 0.7, 0.018], [-0.21, 0.855, 0.026],
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
          [0, 0], [0.012, 0.07], [0.039, 0.15],
          [0.018, 0.062], [0.008, 0],
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

  b.cards(
    [
      [-0.46, 0.068, -0.18], [0.43, 0.068, -0.24],
      [0.39, 0.068, 0.48], [-0.29, 0.068, -0.76],
      [0.18, 0.068, -0.76], [0.49, 0.068, 0.1],
      [-0.48, 0.068, 0.32],
    ].map((p) => frame(p, [0, 1, 0])),
    grassTex,
    {
      size: [0.105, 0.095],
      cross: true,
      flow: [0, 0, 1],
      vary: 0.2,
      rng: random,
      bone: scene,
      name: "riverGrass",
    },
  );

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
    [0.424, 0.09, -0.59], [0.51, 0.098, -0.57],
    [0.011, 0.004],
    { color: wood, bone: scene, sides: 6, name: "branchTwig" },
  );

  for (const [x, z, h] of [
    [0.41, 0.45, 0.12],
    [0.46, 0.31, 0.09],
    [-0.42, -0.08, 0.085],
  ]) {
    b.rod([x, 0.066, z], [x - 0.006, h + 0.065, z], 0.0035, {
      color: C.leaf, bone: scene, sides: 5, name: "flowerStem",
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
        C.white, scene, "daisyPetal", 8,
      );
    }
    ellipsoid(
      [x - 0.006, h + 0.071, z],
      [0.009, 0.007, 0.009],
      C.yellow, scene, "daisyCenter", 8,
    );
  }

  return b.root;
}
