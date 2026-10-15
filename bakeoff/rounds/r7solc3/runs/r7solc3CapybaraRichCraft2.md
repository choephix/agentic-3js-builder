```ts
import * as THREE from "three";
import {
  createBuilder,
  bezier,
  rng,
  svg,
  paint,
  mix,
  noise,
  gradient,
} from "agentic-3js-builder";
import type { Joint, Fill, PointInput } from "agentic-3js-builder";

export const meta = {
  name: "A Little Lift",
  description:
    "A placid, honey-colored capybara gives a turquoise songbird a little lift, on a miniature lily pond.",
};

/*
 * 1. Give the capybara a softer, shorter muzzle and a closely fitted lower
 *    jaw: preserve the wonderful blunt nose without the projecting box/chin.
 * 2. Warm and lighten the coat, soften the eye surrounds, and reduce the ears
 *    slightly. The animal should feel placid and cuddly, not stern or metallic.
 * 3. Replace the bird's narrow wing strips with broad, downward-fanned,
 *    overlapping feathers. Their scalloped silhouette reads from every view.
 * 4. Rebuild the feet as low, joined paws with tiny flattened nails rather
 *    than rows of beads, while preserving the separate rigged digits.
 * 5. Give the lily pads real notched silhouettes and simplify the fine
 *    surface marks. Keep the successful pond composition and clear faces.
 */

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "aLittleLift",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(84017);

  const C = {
    cream: "#f4dfad",
    gold: "#efc25a",
    teal: "#289faa",
    turquoise: "#71d9cd",
    blue: "#388d9b",
    navy: "#285662",
    orange: "#eea04e",
    coral: "#cc714b",
    rim: "#25535a",
    leaf: "#62875a",
    leafLight: "#9ab56e",
    reed: "#789772",
  };

  const coat = paint((p, n) => {
    const variation = noise(p, 0.21, 9);
    const warm = mix("#b28b61", "#cba676", variation);
    const top = mix(warm, "#e0bf8b", Math.max(0, n.y) * 0.24);
    return mix(top, "#b38e66", Math.max(0, -n.y) * 0.14);
  });
  const muzzlePaint = paint((p, n) =>
    mix(
      "#c09b71",
      "#dec094",
      0.26 + noise(p, 0.19, 12) * 0.35 + Math.max(0, n.y) * 0.2,
    ),
  );
  const legPaint = gradient(
    coat,
    paint((p, n) =>
      mix(
        "#ad895f",
        "#c8a87a",
        noise(p, 0.15, 4) * 0.46 + Math.max(0, n.y) * 0.23,
      ),
    ),
    [0, 0.38, 0],
    [0, 0.09, 0],
  );
  const sandPaint = paint((p, n) =>
    mix(
      "#b4aa83",
      "#e0d4ab",
      0.3 + noise(p, 0.07, 32) * 0.4 + Math.max(0, n.y) * 0.2,
    ),
  );
  const stonePaint = paint((p, n) =>
    mix(
      "#73867c",
      "#adbaa6",
      noise(p, 0.08, 6) * 0.6 + Math.max(0, n.y) * 0.28,
    ),
  );

  function drawing(w: number, h: number, content: string, size = 256) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${content}</svg>`,
      { size },
    );
  }

  const capyEye = drawing(
    100,
    100,
    `
      <ellipse cx="50" cy="55" rx="43" ry="38" fill="#a17a54"/>
      <ellipse cx="50" cy="55" rx="34" ry="31" fill="#352d25"/>
      <path d="M22 66 Q49 82 77 64 Q64 84 45 84 Q29 81 22 66Z"
        fill="#987046"/>
      <ellipse cx="39" cy="43" rx="9" ry="8" fill="#fff7dd"/>
      <circle cx="65" cy="66" r="3.8" fill="#ddc694"/>
      <path d="M9 38 Q46 20 89 36 L88 17 L10 17Z" fill="#c29e70"/>
      <path d="M10 38 Q47 20 89 36" fill="none" stroke="#87613e"
        stroke-width="4.5" stroke-linecap="round"/>
      <path d="M20 30 Q49 16 79 29" fill="none" stroke="#e0c18f"
        stroke-width="4" stroke-linecap="round"/>
    `,
  );

  const noseDrawing = drawing(
    240,
    105,
    `
      <path d="M36 30 Q52 11 72 28 Q58 41 36 30Z" fill="#72543a"/>
      <path d="M168 28 Q188 11 204 30 Q182 41 168 28Z" fill="#72543a"/>
      <path d="M43 23 Q54 18 63 24 M177 24 Q188 18 198 23"
        fill="none" stroke="#e9cea1" stroke-width="4" stroke-linecap="round"/>
      <g fill="#a07c56">
        <circle cx="31" cy="61" r="2.8"/><circle cx="53" cy="70" r="2.8"/>
        <circle cx="73" cy="58" r="2.6"/><circle cx="167" cy="58" r="2.6"/>
        <circle cx="187" cy="70" r="2.8"/><circle cx="209" cy="61" r="2.8"/>
      </g>
      <path d="M114 47 Q120 52 126 47" fill="none" stroke="#ad875d"
        stroke-width="3" stroke-linecap="round"/>
    `,
    512,
  );

  const innerEar = drawing(
    80,
    96,
    `
      <path d="M18 85 Q5 57 17 28 Q28 6 49 12 Q78 20 65 64 L57 85Z"
        fill="#a4745c"/>
      <path d="M26 76 Q14 47 31 27 Q44 16 57 30 Q66 46 52 76Z"
        fill="#d1a185"/>
      <path d="M30 64 Q24 42 38 30" fill="none" stroke="#e9c49b"
        stroke-width="5" stroke-linecap="round"/>
    `,
  );

  const hairDrawing = drawing(
    64,
    64,
    `
      <g fill="none" stroke-linecap="round">
        <path d="M17 58 Q21 39 17 24" stroke="#b18c60" stroke-width="4"/>
        <path d="M31 59 Q37 32 32 12" stroke="#e6c997" stroke-width="4.5"/>
        <path d="M45 58 Q45 43 49 29" stroke="#c39d6c" stroke-width="4"/>
      </g>
    `,
  );

  const cheekDrawing = drawing(
    100,
    80,
    `
      <g fill="none" stroke-linecap="round">
        <path d="M22 35 Q27 44 37 44 M44 32 Q51 42 60 42
                 M64 28 Q70 37 79 37"
          stroke="#ab865d" stroke-width="4"/>
        <path d="M28 52 Q34 58 43 57 M51 50 Q57 56 66 54"
          stroke="#e4c593" stroke-width="4"/>
      </g>
    `,
  );

  const birdEye = drawing(
    100,
    100,
    `
      <circle cx="50" cy="50" r="46" fill="#fff0bd"/>
      <circle cx="50" cy="51" r="35" fill="#24454c"/>
      <circle cx="53" cy="54" r="24" fill="#1d343b"/>
      <ellipse cx="40" cy="37" rx="11" ry="13" fill="#ffffff"/>
      <circle cx="64" cy="66" r="5" fill="#b5eee1"/>
      <path d="M16 29 Q45 2 76 22" fill="none" stroke="#326d74"
        stroke-width="6" stroke-linecap="round"/>
    `,
  );

  const breastDrawing = drawing(
    120,
    160,
    `
      <g fill="none" stroke="#cda24b" stroke-width="4.5" stroke-linecap="round">
        <path d="M16 29 Q28 45 40 29 M51 29 Q63 45 75 29 M86 29 Q98 45 110 29"/>
        <path d="M1 62 Q13 78 25 62 M35 62 Q47 78 59 62 M69 62 Q81 78 93 62"/>
        <path d="M18 96 Q30 112 42 96 M53 96 Q65 112 77 96 M88 96 Q100 112 112 96"/>
        <path d="M35 130 Q47 146 59 130 M69 130 Q81 146 93 130"/>
      </g>
      <g fill="#fff1c3">
        <ellipse cx="31" cy="21" rx="5" ry="3"/>
        <ellipse cx="65" cy="88" rx="5" ry="3"/>
      </g>
    `,
  );

  const waterDrawing = drawing(
    600,
    760,
    `
      <rect width="600" height="760" fill="#73b3aa"/>
      <g fill="none" stroke-linecap="round">
        <g stroke="#b2d9c2" stroke-width="4">
          <path d="M49 209 Q99 185 147 207 M36 224 Q98 199 165 225"/>
          <path d="M414 118 Q464 92 523 115 M400 134 Q465 105 542 134"/>
          <path d="M70 580 Q138 548 205 576 M54 600 Q140 565 220 599"/>
          <path d="M391 607 Q451 581 512 609 M375 628 Q448 598 530 632"/>
          <path d="M241 704 Q285 685 326 704"/>
        </g>
        <g stroke="#509a95" stroke-width="3">
          <path d="M62 239 Q101 225 143 240"/>
          <path d="M431 151 Q471 137 513 151"/>
          <path d="M92 618 Q141 599 186 617"/>
          <path d="M410 646 Q452 630 500 646"/>
        </g>
        <g fill="#e1ebc9" stroke="none">
          <ellipse cx="89" cy="333" rx="4" ry="3"/>
          <ellipse cx="517" cy="450" rx="4" ry="3"/>
          <ellipse cx="364" cy="690" rx="4" ry="3"/>
          <ellipse cx="170" cy="96" rx="4" ry="3"/>
        </g>
      </g>
    `,
    1024,
  );

  const padDrawing = drawing(
    100,
    100,
    `
      <rect width="100" height="100" fill="#829e65"/>
      <g stroke="#b4c482" stroke-width="2.4" fill="none" stroke-linecap="round">
        <path d="M50 50 L87 25 M50 50 L96 53 M50 50 L78 87"/>
        <path d="M50 50 L46 96 M50 50 L13 79 M50 50 L5 42"/>
        <path d="M50 50 L46 5"/>
      </g>
      <path d="M58 8 Q83 13 91 34" stroke="#c1cf90" stroke-width="3" fill="none"/>
      <circle cx="50" cy="50" r="4" fill="#6b8e59"/>
    `,
  );

  const plaqueDrawing = drawing(
    340,
    110,
    `
      <rect x="3" y="3" width="334" height="104" rx="24" fill="#315b59"/>
      <rect x="11" y="11" width="318" height="88" rx="18" fill="none"
        stroke="#c6c291" stroke-width="3"/>
      <text x="170" y="49" text-anchor="middle" font-family="Georgia,serif"
        font-size="28" font-weight="bold" fill="#f5e4b3">A LITTLE LIFT</text>
      <path d="M50 70 H111 M229 70 H290" stroke="#c6c291" stroke-width="2.5"/>
      <text x="170" y="80" text-anchor="middle" font-family="Georgia,serif"
        font-size="15" fill="#d4d6ad">pond companions</text>
    `,
    512,
  );

  // Skeleton first. +Z is forward; every foot and feather has a useful bone.
  const hips = b.joint("hips", {
    at: [0, 0.49, -0.4],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.49, -0.4],
      [0, 0.52, -0.1],
      [0, 0.54, 0.19],
    ],
    {
      parent: hips,
      names: ["spine1", "chest", "withers"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.57, 0.2],
      [0, 0.69, 0.34],
      [0, 0.76, 0.43],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neckTop"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.76, 0.43],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.591, 0.43],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const legSpecs = [
    { side: "L", s: 1, end: "F", z: 0.24, hipZ: 0.22 },
    { side: "R", s: -1, end: "F", z: 0.24, hipZ: 0.22 },
    { side: "L", s: 1, end: "H", z: -0.49, hipZ: -0.43 },
    { side: "R", s: -1, end: "H", z: -0.49, hipZ: -0.43 },
  ];
  const legs = legSpecs.map((spec) => {
    const name = `${spec.end}${spec.side}`;
    const x = spec.s * 0.255;
    const chain = b.chain(
      `leg${name}`,
      [
        [x, 0.465, spec.hipZ],
        [x + spec.s * 0.025, 0.285, spec.z - 0.035],
        [x + spec.s * 0.035, 0.143, spec.z + 0.025],
      ],
      {
        parent: spec.end === "H" ? hips : spine.joints[1],
        names: [`hip${name}`, `knee${name}`, `ankle${name}`],
        role: "leg",
        contact: [x + spec.s * 0.035, 0.082, spec.z + 0.07],
      },
    );
    const toes = [-1, 0, 1].map((i) => {
      const toeX = x + spec.s * 0.035 + i * 0.049;
      return b.chain(
        `toe${name}${i + 2}`,
        [
          [toeX, 0.111, spec.z + 0.064],
          [
            toeX + i * 0.006,
            0.105,
            spec.z + 0.15 - Math.abs(i) * 0.009,
          ],
        ],
        {
          parent: chain.tip!,
          names: [`toe${name}${i + 2}`, `toeTip${name}${i + 2}`],
          role: "digit",
        },
      );
    });
    return { ...spec, x, chain, toes };
  });

  const earBones = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.228, 0.936, 0.31],
      dir: [s * 0.2, 1, 0.08],
      role: "hinge",
    }),
  );

  const BS = 0.81;
  const bird = b.region({
    at: [0, 0.991, 0.414],
    scale: BS,
    bone: head,
  });
  const P = (p: number[]) => bird.p(p);
  const birdRoot = b.joint("birdRoot", {
    parent: head,
    at: P([0, 0.07, -0.015]),
    dir: [0, 1, 0],
    role: "spine",
  });
  const birdSpine = b.chain(
    "birdSpine",
    [
      P([0, 0.085, -0.019]),
      P([0, 0.165, 0.007]),
      P([0, 0.215, 0.039]),
    ],
    {
      parent: birdRoot,
      names: ["birdPelvis", "birdChest", "birdNeckBase"],
      role: "spine",
    },
  );
  const birdNeck = b.chain(
    "birdNeck",
    [P([0, 0.205, 0.031]), P([0, 0.263, 0.064])],
    {
      parent: birdSpine.tip!,
      names: ["birdNeck", "birdNeckTop"],
      role: "neck",
    },
  );
  const birdHead = b.joint("birdHead", {
    parent: birdNeck.tip!,
    at: P([0, 0.265, 0.065]),
    dir: [0, 0, 1],
    role: "head",
  });
  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: P([0, 0.247, 0.117]),
    dir: [0, 0, 1],
    role: "jaw",
  });
  const birdTail = b.chain(
    "birdTail",
    [
      P([0, 0.117, -0.069]),
      P([0, 0.135, -0.158]),
      P([0, 0.161, -0.227]),
    ],
    {
      parent: birdRoot,
      names: ["birdTail1", "birdTail2", "birdTailTip"],
      role: "tail",
    },
  );

  const birdSides = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `birdWing${side}`,
      [
        P([s * 0.059, 0.178, -0.01]),
        P([s * 0.14, 0.2, -0.025]),
        P([s * 0.25, 0.226, -0.054]),
      ],
      {
        parent: birdSpine.joints[1],
        names: [
          `birdShoulder${side}`,
          `birdElbow${side}`,
          `birdWrist${side}`,
        ],
        role: "wing",
      },
    );
    const leg = b.chain(
      `birdLeg${side}`,
      [
        P([s * 0.035, 0.093, -0.005]),
        P([s * 0.038, 0.047, -0.013]),
        P([s * 0.043, 0.003, 0.019]),
      ],
      {
        parent: birdRoot,
        names: [`birdHip${side}`, `birdKnee${side}`, `birdAnkle${side}`],
        role: "leg",
        contact: P([s * 0.043, 0, 0.019]),
      },
    );
    const digits = [-1, 0, 1].map((i) =>
      b.chain(
        `birdToe${side}${i + 2}`,
        [
          P([s * 0.043, 0.005, 0.018]),
          P([
            s * 0.043 + i * 0.019,
            -0.001,
            0.065 - Math.abs(i) * 0.011,
          ]),
        ],
        {
          parent: leg.tip!,
          names: [`birdToe${side}${i + 2}`],
          role: "digit",
        },
      ),
    );
    const backToe = b.chain(
      `birdBackToe${side}`,
      [
        P([s * 0.043, 0.004, 0.014]),
        P([s * 0.048, -0.001, -0.015]),
      ],
      { parent: leg.tip!, role: "digit" },
    );
    return { s, side, wing, leg, digits, backToe };
  });

  function ellipsoid(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint = hips,
    name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at,
      scale: size,
      bone,
      name,
      flat: true,
    });
  }

  function birdEllipsoid(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    return ellipsoid(
      P(at),
      size.map((v) => v * BS),
      color,
      bone,
      name,
    );
  }

  function pebble(at: number[], size: number[], color: Fill = stonePaint) {
    return b.part(new THREE.DodecahedronGeometry(1, 0), color, {
      at,
      scale: size,
      bone: hips,
      rotation: [0, random() * 160, 0],
      flat: true,
    });
  }

  // The quiet pond leaves the entire animal visible.
  b.part(new THREE.CylinderGeometry(1, 0.97, 0.05, 48), C.rim, {
    at: [0, 0.025, 0],
    scale: [0.72, 1, 0.925],
    bone: hips,
    name: "pondPlinth",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.012, 48), "#a0beaa", {
    at: [0, 0.049, 0],
    scale: [0.715, 1, 0.919],
    bone: hips,
    name: "pondRim",
  });
  b.part(new THREE.CircleGeometry(1, 48), "#ffffff", {
    at: [0, 0.056, 0],
    rotation: [-90, 0, 0],
    scale: [0.702, 0.905, 1],
    texture: waterDrawing,
    bone: hips,
    name: "paintedPond",
  });
  b.part(new THREE.CylinderGeometry(1, 1.025, 0.028, 24), sandPaint, {
    at: [0, 0.068, -0.015],
    scale: [0.435, 1, 0.715],
    bone: hips,
    name: "sandbar",
  });

  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    pebble(
      [
        Math.cos(a) * (0.413 + random() * 0.016),
        0.084,
        Math.sin(a) * 0.666 - 0.015,
      ],
      [
        0.024 + random() * 0.017,
        0.012 + random() * 0.008,
        0.035 + random() * 0.025,
      ],
      i % 3 === 0 ? sandPaint : stonePaint,
    );
  }

  // Simple, deliberate big forms: a loaf body and a generous head.
  const body = b.sweep(
    spine,
    (t) => [
      0.314 + Math.sin(t * Math.PI) * 0.034,
      0.285 + Math.sin(t * Math.PI) * 0.016,
    ],
    {
      color: coat,
      sides: 12,
      smooth: false,
      caps: "round",
      name: "capybaraLoaf",
    },
  );
  b.sweep(neck, [0.242, 0.225], {
    color: coat,
    sides: 10,
    smooth: false,
    name: "thickNeck",
  });

  const H = 1;
  const face = b.region({ at: head, scale: H, bone: head });
  const skull = ellipsoid(
    face.p([0, 0, 0]),
    [0.285 * H, 0.239 * H, 0.302 * H],
    coat,
    head,
    "capybaraSkull",
  );
  const headSkin = b.surface(skull);

  const muzzle = b.extrude(
    [
      [-0.178, -0.102],
      [0.178, -0.102],
      [0.222, -0.079],
      [0.246, -0.035],
      [0.245, 0.061],
      [0.217, 0.105],
      [0.176, 0.123],
      [-0.176, 0.123],
      [-0.217, 0.105],
      [-0.245, 0.061],
      [-0.246, -0.035],
      [-0.222, -0.079],
    ],
    {
      at: face.p([0, -0.083, 0.228]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.368,
      bevel: 0.047,
      color: muzzlePaint,
      bone: head,
      name: "broadSoftMuzzle",
    },
  );

  const lowerJaw = b.extrude(
    [
      [-0.17, -0.027],
      [0.17, -0.027],
      [0.205, -0.009],
      [0.215, 0.017],
      [0.192, 0.035],
      [-0.192, 0.035],
      [-0.215, 0.017],
      [-0.205, -0.009],
    ],
    {
      at: [0, 0.591, 0.642],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.351,
      bevel: 0.024,
      color: muzzlePaint,
      bone: jaw,
      name: "separateLowerJaw",
    },
  );

  b.decal(muzzle, noseDrawing, {
    at: [0, 0.709, 0.848],
    dir: [0, 0, 1],
    size: [0.38, 0.165],
    segments: 10,
    lift: 0.0015,
    bone: head,
    name: "nostrilsAndWhiskerPores",
  });

  const smile = b.surface([muzzle, lowerJaw]).drape(
    [
      [-0.172, 0.615, 0.818],
      [-0.092, 0.61, 0.844],
      [0, 0.608, 0.844],
      [0.092, 0.61, 0.844],
      [0.172, 0.615, 0.818],
    ],
    { lift: 0.0013 },
  );
  b.sweep(smile, 0.0018, {
    color: "#a18059",
    bone: jaw,
    sides: 6,
    name: "quietSmile",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSkin.around(head.at).at(s * 38, 17);
    if (hit) {
      const eye = b.stick(
        new THREE.SphereGeometry(1, 12, 8),
        "#a17b52",
        hit,
        {
          scale: [0.038, 0.0095, 0.04],
          embed: 0.43,
          flow: [0, 1, 0],
          bone: head,
          name: `seatedEye${side}`,
        },
      );
      b.decal(eye, capyEye, {
        at: hit,
        dir: hit.n,
        size: [0.069, 0.072],
        up: [0, 1, 0],
        segments: 8,
        lift: 0.001,
        bone: head,
        name: `capyEye${side}`,
      });

      const brow = headSkin.drape(
        [
          hit.local([-0.035, 0, 0.038]),
          hit.local([0, 0, 0.047]),
          hit.local([0.035, 0, 0.037]),
        ],
        { lift: 0.0015 },
      );
      b.sweep(brow, [0.0055, 0.007, 0.0045], {
        color: coat,
        bone: head,
        sides: 6,
        name: `gentleBrow${side}`,
      });
    }

    const cheek = headSkin.around(head.at).at(s * 67, -11);
    if (cheek) {
      b.decal(skull, cheekDrawing, {
        at: cheek,
        size: [0.08, 0.056],
        segments: 6,
        lift: 0.001,
        bone: head,
        name: `paintedCheek${side}`,
      });
    }

    for (let i = 0; i < 3; i++) {
      const start = [
        s * (0.201 + i * 0.008),
        0.654 + i * 0.018,
        0.803 - i * 0.008,
      ];
      const tip = [
        s * (0.276 + i * 0.008),
        0.654 + i * 0.023,
        0.833 - i * 0.012,
      ];
      b.sweep(
        bezier(
          start,
          [s * 0.25, 0.655 + i * 0.025, 0.825 - i * 0.008],
          tip,
        ),
        [0.0011, 0.0004],
        {
          color: "#e7cfa0",
          bone: head,
          sides: 5,
          name: `whisker${side}${i + 1}`,
        },
      );
    }
  }

  for (let k = 0; k < earBones.length; k++) {
    const s = k === 0 ? 1 : -1;
    const earBone = earBones[k];
    const ear = b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
      at: [s * 0.234, 0.958, 0.31],
      scale: [0.066, 0.071, 0.043],
      rotation: [0, s * 13, s * -18],
      bone: earBone,
      name: `roundedEar${s > 0 ? "L" : "R"}`,
      flat: true,
    });
    b.decal(ear, innerEar, {
      at: [s * 0.236, 0.963, 0.357],
      dir: [s * 0.12, 0, 1],
      size: [0.074, 0.091],
      roll: s * -15,
      segments: 7,
      lift: 0.0015,
      bone: earBone,
      name: `earVelvet${k}`,
    });
  }

  // Paws have a continuous low mass, three distinct toes, and quiet nails.
  for (const leg of legs) {
    const name = `${leg.end}${leg.side}`;
    b.sweep(leg.chain, [0.108, 0.091, 0.075], {
      color: legPaint,
      sides: 8,
      smooth: false,
      name: `sturdyLeg${name}`,
    });
    ellipsoid(
      [leg.x + leg.s * 0.035, 0.13, leg.z + 0.062],
      [0.101, 0.048, 0.116],
      legPaint,
      leg.chain.tip!,
      `palm${name}`,
    );
    for (let i = 0; i < leg.toes.length; i++) {
      const toe = leg.toes[i];
      const toeVolume = b.sweep(
        toe,
        () => [0.028, 0.023],
        {
          color: legPaint,
          sides: 6,
          caps: "round",
          name: `roundedToe${name}${i}`,
        },
      );
      const tip = toe.at(1).at;
      const nailSeat = b.surface(toeVolume).nearest([
        tip.x,
        tip.y + 0.018,
        tip.z + 0.01,
      ]);
      b.stick(
        new THREE.SphereGeometry(1, 8, 6),
        "#bda27c",
        nailSeat,
        {
          scale: [0.011, 0.0035, 0.012],
          embed: 0.6,
          bone: toe.tip!,
          name: `flatNail${name}${i}`,
        },
      );
      const crease = b.surface(toeVolume).drape(
        [
          [tip.x - 0.014, tip.y + 0.03, tip.z - 0.019],
          [tip.x, tip.y + 0.032, tip.z - 0.022],
          [tip.x + 0.014, tip.y + 0.03, tip.z - 0.019],
        ],
        { lift: 0.0007 },
      );
      b.sweep(crease, 0.0012, {
        color: "#aa855c",
        bone: toe.joints[0],
        sides: 5,
        name: `toeCrease${name}${i}`,
      });
    }
  }

  const bodySurface = b.surface(body);
  const tuftHits = bodySurface.scatter(8, {
    rng: random,
    minDist: 0.14,
    filter: (h) => h.n.y > 0.45 && h.at.z < 0.1,
  });
  for (let i = 0; i < tuftHits.length; i++) {
    b.stick(new THREE.ConeGeometry(0.015, 0.038, 4), coat, tuftHits[i], {
      embed: 0.77,
      scale: [1, 0.6, 0.5],
      flow: [0, 0.1, -1],
      name: `coatFacet${i}`,
    });
  }
  const hairs = bodySurface.scatter(23, {
    rng: rng(271),
    minDist: 0.085,
    filter: (h) => h.n.y > 0.03,
  });
  b.cards(hairs, hairDrawing, {
    size: [0.029, 0.039],
    lean: 88,
    bend: 0,
    flow: [0, -0.1, -1],
    vary: 0.15,
    rng: rng(331),
    sink: 0.07,
    name: "sparsePaintedGuardHairs",
  });

  // Little passenger. Rich turquoise, warm bib, bright readable eyes.
  const birdBody = birdEllipsoid(
    [0, 0.142, -0.01],
    [0.079, 0.104, 0.088],
    C.teal,
    birdSpine.joints[0],
    "birdBody",
  );
  birdEllipsoid(
    [0, 0.174, 0.032],
    [0.061, 0.075, 0.061],
    C.gold,
    birdSpine.joints[1],
    "goldenBreast",
  );
  const bib = birdEllipsoid(
    [0, 0.153, 0.053],
    [0.058, 0.076, 0.037],
    "#f0d181",
    birdSpine.joints[1],
    "birdBib",
  );
  b.decal(bib, breastDrawing, {
    at: P([0, 0.155, 0.092]),
    dir: [0, 0, 1],
    size: [0.089 * BS, 0.119 * BS],
    lift: 0.001,
    segments: 7,
    name: "breastScallops",
  });
  b.sweep(birdNeck, [0.041 * BS, 0.046 * BS], {
    color: C.turquoise,
    sides: 8,
    name: "birdNeckVolume",
  });
  const littleHead = birdEllipsoid(
    [0, 0.265, 0.065],
    [0.07, 0.071, 0.066],
    C.turquoise,
    birdHead,
    "birdRoundHead",
  );

  const littleHeadSkin = b.surface(littleHead);
  for (const s of [1, -1]) {
    const hit = littleHeadSkin
      .around(P([0, 0.265, 0.065]))
      .at(s * 40, 8);
    if (hit) {
      const eye = b.stick(
        new THREE.SphereGeometry(1, 10, 6),
        C.navy,
        hit,
        {
          scale: [0.024 * BS, 0.008 * BS, 0.028 * BS],
          embed: 0.38,
          flow: [0, 1, 0],
          bone: birdHead,
          name: `birdEyeSocket${s > 0 ? "L" : "R"}`,
        },
      );
      b.decal(eye, birdEye, {
        at: hit,
        dir: hit.n,
        size: [0.043 * BS, 0.05 * BS],
        segments: 6,
        lift: 0.0008,
        bone: birdHead,
        name: `birdEye${s > 0 ? "L" : "R"}`,
      });
    }
    birdEllipsoid(
      [s * 0.05, 0.245, 0.108],
      [0.014, 0.008, 0.006],
      "#efbd78",
      birdHead,
      `birdCheek${s > 0 ? "L" : "R"}`,
    );
  }

  b.extrude(
    [
      [-0.028 * BS, 0],
      [0.028 * BS, 0],
      [0.019 * BS, 0.024 * BS],
      [0, 0.036 * BS],
      [-0.019 * BS, 0.024 * BS],
    ],
    {
      at: P([0, 0.248, 0.134]),
      x: [1, 0, 0],
      y: [0, 0.4, 1],
      thickness: 0.017 * BS,
      bevel: 0.003 * BS,
      color: C.orange,
      bone: birdHead,
      name: "birdUpperBeak",
    },
  );
  b.extrude(
    [
      [-0.024 * BS, 0],
      [0.024 * BS, 0],
      [0.013 * BS, 0.028 * BS],
      [0, 0.034 * BS],
      [-0.013 * BS, 0.028 * BS],
    ],
    {
      at: P([0, 0.246, 0.133]),
      x: [1, 0, 0],
      y: [0, -0.15, 1],
      thickness: 0.009 * BS,
      bevel: 0.002 * BS,
      color: C.coral,
      bone: birdJaw,
      name: "birdLowerBeak",
    },
  );

  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.022;
    b.sweep(
      bezier(
        P([x * 0.6, 0.318, 0.048]),
        P([x, 0.367 + (i === 1 ? 0.008 : 0), 0.041]),
        P([x * 1.7, 0.37 + (i === 1 ? 0.019 : 0), 0.021]),
      ),
      [0.013 * BS, 0],
      {
        color: i === 1 ? C.gold : C.teal,
        bone: birdHead,
        sides: 5,
        caps: "flat",
        name: `birdCrest${i}`,
      },
    );
  }

  for (const side of birdSides) {
    b.sweep(side.leg, 0.0065 * BS, {
      color: C.orange,
      sides: 6,
      name: `birdShin${side.side}`,
    });
    for (let i = 0; i < side.digits.length; i++) {
      b.sweep(side.digits[i], [0.0045 * BS, 0.003 * BS], {
        color: C.orange,
        sides: 5,
        caps: "round",
        name: `birdSpreadToe${side.side}${i}`,
      });
    }
    b.sweep(side.backToe, [0.004 * BS, 0.0025 * BS], {
      color: C.orange,
      sides: 5,
      name: `birdBackToeVolume${side.side}`,
    });

    b.sweep(
      side.wing,
      (t) => [
        (0.022 - t * 0.012) * BS,
        (0.015 - t * 0.008) * BS,
      ],
      {
        color: C.teal,
        sides: 6,
        caps: "round",
        name: `birdWingSpar${side.side}`,
      },
    );

    // Broad fan feathers: visible blades, not thin parallel quills.
    // Their roots overlap, while the round pale tips remain separated.
    for (let i = 0; i < 7; i++) {
      const t = (i + 0.25) / 7;
      const root = side.wing.at(t);
      const length =
        [0.075, 0.087, 0.098, 0.111, 0.121, 0.129, 0.127][i] * BS;
      const width =
        [0.024, 0.026, 0.028, 0.029, 0.028, 0.027, 0.025][i] * BS;
      const featherColor = paint((_p, _n, s) => {
        const v = s[1] / length;
        if (v > 0.86) return "#cbe7c8";
        if (v > 0.78) return "#8bd8c6";
        return i % 2 === 0 ? "#58b9b8" : "#429fa9";
      });
      const feather = b.extrude(
        [
          [-width * 0.46, 0],
          [width * 0.46, 0],
          [width * 0.84, length * 0.3],
          [width, length * 0.64],
          [width * 0.85, length * 0.84],
          [width * 0.49, length * 0.96],
          [0, length],
          [-width * 0.49, length * 0.96],
          [-width * 0.85, length * 0.84],
          [-width, length * 0.64],
          [-width * 0.84, length * 0.3],
        ],
        {
          at: root,
          x: [side.s, 0, 0.1],
          y: [side.s * (0.1 + t * 0.25), -0.84, -0.65],
          thickness: [0.009 * BS, 0.005 * BS],
          bevel: 0.0018 * BS,
          smoothing: 1,
          color: featherColor,
          bone: root.bone!,
          name: `roundedFlightFeather${side.side}${i}`,
        },
      );

      for (const faceSign of [-1, 1]) {
        b.sweep(
          [
            feather.local([0, length * 0.15, faceSign * 0.0045 * BS]),
            feather.local([0, length * 0.48, faceSign * 0.0038 * BS]),
            feather.local([0, length * 0.77, faceSign * 0.003 * BS]),
          ],
          [0.0014 * BS, 0.0007 * BS],
          {
            color: "#9edfd2",
            bone: root.bone!,
            sides: 5,
            name: `featherQuill${side.side}${i}_${faceSign}`,
          },
        );
      }
    }

    // Shorter coverts make the wing roots read as layered plumage.
    for (let i = 0; i < 6; i++) {
      const root = side.wing.at((i + 0.35) / 6);
      b.part(
        new THREE.SphereGeometry(1, 8, 6),
        i % 2 ? C.teal : C.turquoise,
        {
          at: [
            root.at.x,
            root.at.y - 0.008 * BS,
            root.at.z - 0.006 * BS,
          ],
          scale: [0.026 * BS, 0.019 * BS, 0.022 * BS],
          bone: root.bone!,
          rotation: [0, 0, side.s * -12],
          name: `wingCovert${side.side}${i}`,
          flat: true,
        },
      );
    }
  }

  b.sweep(birdTail, [0.021 * BS, 0.013 * BS, 0.003 * BS], {
    color: C.blue,
    sides: 6,
    name: "birdTailSpar",
  });
  for (let i = -1; i <= 1; i++) {
    const tailPaint = paint((_p, _n, s) =>
      s[1] > 0.118 * BS
        ? "#cbe7c8"
        : i === 0
          ? C.turquoise
          : C.blue,
    );
    b.extrude(
      [
        [-0.013 * BS, 0],
        [0.013 * BS, 0],
        [0.02 * BS, 0.105 * BS],
        [0.016 * BS, 0.134 * BS],
        [0, 0.145 * BS],
        [-0.016 * BS, 0.134 * BS],
        [-0.02 * BS, 0.105 * BS],
      ],
      {
        at: P([i * 0.017, 0.122, -0.096]),
        x: [1, 0, 0],
        y: [i * 0.24, 0.25, -1],
        thickness: 0.008 * BS,
        bevel: 0.002 * BS,
        smoothing: 1,
        color: tailPaint,
        bone: birdTail.joints[0],
        name: `birdTailFeather${i + 1}`,
      },
    );
  }

  const birdSkin = b.surface(birdBody);
  for (const s of [1, -1]) {
    const hit = birdSkin.around(P([0, 0.142, -0.01])).at(s * 105, 15);
    if (hit) {
      b.stick(new THREE.SphereGeometry(1, 8, 6), C.turquoise, hit, {
        scale: [0.031 * BS, 0.008 * BS, 0.033 * BS],
        embed: 0.45,
        name: `birdShoulderSpot${s > 0 ? "L" : "R"}`,
      });
    }
  }

  // Small reeds frame the back corners rather than the face.
  function reedCluster(x: number, z: number, count: number) {
    for (let i = 0; i < count; i++) {
      const dx = (random() - 0.5) * 0.09;
      const dz = (random() - 0.5) * 0.09;
      const height = 0.2 + random() * 0.14;
      const lean = (random() - 0.5) * 0.06;
      const start = [x + dx, 0.057, z + dz];
      const top = [x + dx + lean, 0.057 + height, z + dz - 0.015];
      b.sweep(
        bezier(start, [x + dx, height * 0.7, z + dz], top),
        [0.004, 0.0025],
        {
          color: C.reed,
          bone: hips,
          sides: 5,
          name: `reedStem_${x}_${i}`,
        },
      );
      if (i % 2 === 0) {
        b.capsule(
          top,
          [top[0] + lean * 0.15, top[1] + 0.056, top[2]],
          0.011,
          {
            color: "#89704e",
            bone: hips,
            sides: 6,
            name: `cattail_${x}_${i}`,
          },
        );
        b.rod(
          [top[0] + lean * 0.15, top[1] + 0.052, top[2]],
          [top[0] + lean * 0.2, top[1] + 0.084, top[2]],
          0.0018,
          { color: "#c9b382", bone: hips, sides: 5 },
        );
      }
      for (const s of [1, -1]) {
        b.extrude(
          [
            [0, 0],
            [0.014, 0.04],
            [0.012, 0.11],
            [0, 0.17],
            [-0.005, 0.07],
          ],
          {
            at: [x + dx, 0.062, z + dz],
            x: [0, 0, s],
            y: [s * 0.34, 1, -0.1],
            thickness: 0.0025,
            color: s > 0 ? C.leafLight : C.reed,
            bone: hips,
            name: `reedBlade_${x}_${i}_${s}`,
          },
        );
      }
    }
  }
  reedCluster(-0.5, -0.52, 4);
  reedCluster(0.51, -0.42, 3);

  function lilyPad(x: number, z: number, radius: number, turn: number) {
    const angle = (turn * Math.PI) / 180;
    const X = [Math.cos(angle), 0, -Math.sin(angle)];
    const Y = [-Math.sin(angle), 0, -Math.cos(angle)];
    const outline: number[][] = [[0, 0]];
    for (let i = 0; i <= 20; i++) {
      const a = 0.29 + (i / 20) * (Math.PI * 2 - 0.58);
      outline.push([Math.sin(a) * radius, Math.cos(a) * radius]);
    }
    const pad = b.extrude(outline, {
      at: [x, 0.062, z],
      x: X,
      y: Y,
      thickness: 0.007,
      color: C.leaf,
      bone: hips,
      name: "notchedLilyPad",
    });
    b.decal(pad, padDrawing, {
      at: [x, 0.069, z],
      dir: [0, 1, 0],
      up: Y,
      size: [radius * 2, radius * 2],
      segments: 8,
      lift: 0.0007,
      bone: hips,
      name: "lilyPadVeins",
    });
  }

  lilyPad(-0.499, 0.475, 0.098, 23);
  lilyPad(-0.555, 0.299, 0.075, -40);
  lilyPad(0.515, 0.496, 0.103, 130);
  lilyPad(0.409, 0.696, 0.066, 65);
  lilyPad(0.282, -0.765, 0.075, -80);

  function waterLily(x: number, z: number) {
    b.part(new THREE.CylinderGeometry(0.026, 0.032, 0.018, 8), C.leaf, {
      at: [x, 0.074, z],
      bone: hips,
      name: "lilyCalyx",
    });
    for (let layer = 0; layer < 2; layer++) {
      const count = layer === 0 ? 7 : 5;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + layer * 0.3;
        const r = layer === 0 ? 0.026 : 0.017;
        b.part(
          new THREE.SphereGeometry(1, 8, 6),
          layer === 0 ? "#efd7bc" : "#fff1ca",
          {
            at: [
              x + Math.sin(a) * r,
              0.085 + layer * 0.013,
              z + Math.cos(a) * r,
            ],
            scale: [
              0.016,
              0.009 + layer * 0.004,
              layer === 0 ? 0.041 : 0.029,
            ],
            rotation: [
              layer === 0 ? -13 : -29,
              (a * 180) / Math.PI,
              0,
            ],
            bone: hips,
            name: `lilyPetal${layer}_${i}`,
            flat: true,
          },
        );
      }
    }
    b.part(new THREE.SphereGeometry(0.017, 8, 6), C.gold, {
      at: [x, 0.114, z],
      scale: [1, 0.65, 1],
      bone: hips,
      name: "lilyPollen",
    });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ellipsoid(
        [x + Math.cos(a) * 0.012, 0.123, z + Math.sin(a) * 0.012],
        [0.003, 0.004, 0.003],
        "#ffe8a1",
        hips,
        `pollenDot${i}`,
      );
    }
  }
  waterLily(-0.501, 0.474);

  b.part(new THREE.BoxGeometry(0.281, 0.017, 0.093), "#b5af83", {
    at: [-0.095, 0.067, 0.795],
    bone: hips,
    name: "plaqueBacking",
  });
  b.part(new THREE.PlaneGeometry(0.27, 0.087), "#ffffff", {
    at: [-0.095, 0.076, 0.795],
    rotation: [-90, 0, 0],
    texture: plaqueDrawing,
    bone: hips,
    name: "littleLiftPlaque",
  });

  for (const p of [
    [-0.605, 0.058, -0.062],
    [0.58, 0.058, 0.183],
    [0.188, 0.058, -0.831],
  ]) {
    b.part(new THREE.OctahedronGeometry(0.008), "#e9e6b8", {
      at: p,
      scale: [1, 0.12, 1.7],
      bone: hips,
      name: "sunlitWaterGlint",
    });
  }

  skull.mesh.userData.subject = "capybara";
  littleHead.mesh.userData.subject = "bird";
  return b.root;
}
```