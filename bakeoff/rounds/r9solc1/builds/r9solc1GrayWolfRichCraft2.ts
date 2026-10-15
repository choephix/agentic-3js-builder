import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  offset,
  rng,
  paint,
  noise,
  mix,
  resolve,
  smoothstep,
  grain,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frostfang — Alert Gray Wolf",
  description:
    "A silver-gray northern wolf with an elevated, watchful head, amber eyes, layered angular fur and a weathered frost-rune collar. Hand-painted fantasy styling on a compact snowy slate outcrop.",
};

/*
 * Art-direction changes:
 * 1. Lift the head, shorten the ears and uncover the eyes: alert, not sleepy.
 * 2. Flatten the muzzle's end caps and rebuild the nose drawing so pale muzzle
 *    geometry no longer cuts through the black nose.
 * 3. Replace square slipper-like paws with tapered paws and quieter claws.
 * 4. Bury and shorten the fur layers; eliminate the fence of dorsal plates.
 *    Larger painted locks replace the salt-and-pepper surface pattern.
 * 5. Raise the edge rocks out of the floor and fit their snow caps over their
 *    peaks, eliminating both the ground warning and dark cap punctures.
 */
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Frostfang", paintSize: 2048 });
  const random = rng(83427);

  const C = {
    ink: "#17212d",
    charcoal: "#293746",
    slate: "#4b6072",
    silver: "#aebcc5",
    light: "#d5dce0",
    ivory: "#ece8dc",
    nose: "#202932",
    claw: "#89989f",
    leatherEdge: "#798c95",
    iron: "#576b77",
    metal: "#b3c6cd",
    gold: "#c6a167",
  };

  // Large warm-silver and cool-slate masses carry the coat.
  const coat = paint((p, n) => {
    const variation = noise(p, 0.15, 14);
    const dorsal =
      smoothstep(0.0, 0.65, n.y) *
      smoothstep(0.38, 0.15, Math.abs(p.x)) *
      smoothstep(0.8, 0.3, p.z);
    const belly = smoothstep(0.05, -0.6, n.y);
    let color = mix("#728594", "#a7b5be", variation * 0.58 + 0.20);
    color = mix(color, "#354b60", dorsal * 0.87);
    return mix(color, "#d9ddd7", belly * 0.82);
  });

  const silver = paint((p, n) =>
    mix(
      "#8298a8",
      "#d7dfe1",
      0.43 + noise(p, 0.14, 22) * 0.22 + Math.max(0, n.y) * 0.22,
    ),
  );

  const cream = paint((p, n) =>
    mix(
      "#adbec3",
      "#ecebdf",
      0.48 + 0.25 * n.y + noise(p, 0.13, 9) * 0.19,
    ),
  );

  const mane = paint((p, n) =>
    mix(
      "#30475c",
      "#8da3b0",
      0.34 + Math.max(0, n.y) * 0.23 + noise(p, 0.17, 4) * 0.25,
    ),
  );

  const furBladePaint = paint((p, n) =>
    mix(
      "#8098a9",
      "#d7dfe1",
      0.38 + Math.max(0, n.y) * 0.28 + noise(p, 0.16, 39) * 0.17,
    ),
  );

  const rock = paint((p, n) => {
    const v = noise(p, 0.18, 43);
    const strata = Math.sin(p.y * 68 + p.x * 4);
    return mix(
      "#293b4b",
      "#607382",
      v * 0.58 + Math.max(0, n.y) * 0.19 + (strata > 0.65 ? 0.08 : 0),
    );
  });

  const snow = paint((p, n) =>
    mix(
      "#a9c7d6",
      "#f0f5ef",
      0.57 + n.y * 0.22 + noise(p, 0.16, 20) * 0.16,
    ),
  );

  const leather = grain("#29343b", "#4c5b62", {
    size: 0.013,
    axis: "x",
    seed: 81,
  });

  // ---------------------------------------------------------------------
  // Drawings: sharper open eyes and restrained, broad painted detail.
  // ---------------------------------------------------------------------
  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <defs>
        <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#a74b12"/>
          <stop offset=".48" stop-color="#eea82c"/>
          <stop offset="1" stop-color="#ffe59b"/>
        </linearGradient>
        <clipPath id="opening">
          <path d="M15 51 L43 27 Q93 14 143 39
                   L125 66 Q78 89 36 68 Z"/>
        </clipPath>
      </defs>
      <path d="M5 50 L38 19 Q94 5 153 36
               L134 73 Q76 101 26 73 Z" fill="#182a38"/>
      <g clip-path="url(#opening)">
        <rect width="160" height="100" fill="#e1d9b8"/>
        <ellipse cx="85" cy="50" rx="33" ry="34" fill="url(#amber)"/>
        <ellipse cx="87" cy="49" rx="10" ry="28" fill="#13242d"/>
        <path d="M62 68 Q85 81 110 64" stroke="#ffdc72"
              stroke-width="5" fill="none"/>
        <path d="M65 29 L76 26 L80 38 L68 43 Z" fill="#fff6de"/>
        <circle cx="104" cy="63" r="4" fill="#ffedb4"/>
      </g>
      <path d="M10 49 L40 23 Q95 11 148 37" stroke="#192b39"
            stroke-width="7" stroke-linejoin="round" fill="none"/>
      <path d="M29 71 Q79 96 135 68" stroke="#748b95"
            stroke-width="3" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const earTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170">
      <defs>
        <linearGradient id="ear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a3c4b"/>
          <stop offset="1" stop-color="#697c87"/>
        </linearGradient>
      </defs>
      <path d="M17 153 L25 54 L62 9 L85 142 L67 160 Z"
            fill="#d1d9da"/>
      <path d="M28 141 L34 59 L61 26 L74 137 L58 151 Z"
            fill="url(#ear)"/>
      <path d="M32 142 L43 108 L48 144 L56 111 L64 145
               L72 126 L75 151 L54 161 Z" fill="#acbdc3"/>
      <path d="M43 99 L48 61 M58 103 L60 51 M65 121 L67 91"
            stroke="#8298a4" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const noseTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <rect width="160" height="100" fill="#233340"/>
      <path d="M13 40 Q31 18 61 34 L56 54 Q35 41 18 59 Z"
            fill="#101c25"/>
      <path d="M147 40 Q129 18 99 34 L104 54 Q125 41 142 59 Z"
            fill="#101c25"/>
      <path d="M41 18 Q80 7 119 18" fill="none"
            stroke="#667e8c" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 55 L80 89" stroke="#12222c" stroke-width="4"/>
      <g fill="#526b7a">
        <circle cx="59" cy="22" r="2"/><circle cx="75" cy="17" r="2"/>
        <circle cx="91" cy="18" r="2"/><circle cx="103" cy="25" r="2"/>
        <circle cx="68" cy="40" r="2"/><circle cx="94" cy="41" r="2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const runeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150">
      <path d="M60 5 L108 32 L103 102 L60 143 L17 102 L12 32 Z"
            fill="#243a48" stroke="#bdd4d8" stroke-width="7"/>
      <path d="M60 19 L94 39 L90 95 L60 125 L30 95 L26 39 Z"
            fill="#304f60" stroke="#698c9a" stroke-width="3"/>
      <path d="M60 36 L60 108 M60 69 L38 48 L38 72 L60 90
               M60 60 L82 39 L82 63 L60 82"
            stroke="#b6fbef" stroke-width="7" fill="none"/>
      <path d="M37 112 L43 117 M78 116 L84 110"
            stroke="#d0b579" stroke-width="4"/>
      <circle cx="60" cy="25" r="3" fill="#d0b579"/>
    </svg>`,
    { size: 256 },
  );

  const stitchTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180">
      <path d="M8 5 L112 5 L106 148 L60 176 L14 148 Z"
            fill="#364750" stroke="#899da5" stroke-width="5"/>
      <path d="M21 18 L98 18 L93 140 L60 158 L27 141 Z"
            fill="none" stroke="#b9b7a2" stroke-width="3"
            stroke-dasharray="5 7"/>
      <path d="M60 35 L78 62 L60 88 L42 62 Z" fill="#20333e"
            stroke="#8299a1" stroke-width="4"/>
      <path d="M60 49 L60 75 M50 61 L69 61"
            stroke="#c8b27c" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  const plaqueTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 150">
      <path d="M10 14 L470 14 L470 136 L10 136 Z"
            fill="#293e4e" stroke="#a5b8bf" stroke-width="6"/>
      <path d="M29 33 L451 33 M29 117 L451 117" stroke="#6f8a99"
            stroke-width="3"/>
      <text x="240" y="85" text-anchor="middle" font-size="52"
            font-family="Georgia,serif" font-weight="bold"
            letter-spacing="6" fill="#e1e7df">FROSTFANG</text>
      <path d="M33 74 L43 63 L53 74 L43 85 Z M427 74 L437 63
               L447 74 L437 85 Z" fill="#c5a770"/>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------
  // Skeleton. Four separated, planted legs; neck raised in a watchful pose.
  // ---------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.98, -0.48],
    dir: [0, 0.08, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.48],
      [0, 1.04, -0.08],
      [0, 1.10, 0.36],
    ]),
    {
      parent: hips,
      names: ["spine1", "chest", "withers"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 1.10, 0.36],
      [0, 1.37, 0.49],
      [0, 1.51, 0.66],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neckTop"],
      role: "neck",
    },
  );

  const HEAD = [0, 1.52, 0.72];
  const H = 1.0;

  const head = b.joint("head", {
    parent: neck.tip!,
    at: HEAD,
    dir: [0, 0, 1],
    role: "head",
  });

  const hr = b.region({ at: HEAD, scale: H, bone: head });
  const hp = (p: number[]) => hr.p(p);

  const jaw = b.joint("jaw", {
    parent: head,
    at: hp([0, -0.145, 0.055]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: hp([s * 0.19, 0.175, -0.065]),
      dir: [s * 0.18, 1, -0.12],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.00, -0.65],
      [0.035, 0.88, -0.94],
      [0.12, 0.65, -1.19],
      [0.24, 0.47, -1.43],
      [0.32, 0.46, -1.57],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legs: any[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    for (const front of [true, false]) {
      const tag = `${front ? "F" : "H"}${side}`;
      const points = front
        ? [
            [s * 0.235, 1.075, 0.34],
            [s * 0.285, 0.665, 0.30],
            [s * 0.295, 0.245, 0.51],
            [s * 0.300, 0.165, 0.615],
          ]
        : [
            [s * 0.235, 0.975, -0.49],
            [s * 0.315, 0.665, -0.295],
            [s * 0.33, 0.355, -0.665],
            [s * 0.33, 0.165, -0.575],
          ];

      const chain = b.chain(`leg${tag}`, points, {
        parent: front ? spine.joints[1] : hips,
        names: front
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${tag}`]
          : [`hip${side}`, `knee${side}`, `hock${side}`, `paw${tag}`],
        role: "leg",
        contact: [points[3][0], 0.083, points[3][2] + 0.07],
      });

      const paw = points[3];

      const digits = [-1.5, -0.5, 0.5, 1.5].map((i, index) => {
        const x = paw[0] + i * 0.060;
        const z = paw[2] + 0.14 - Math.abs(i) * 0.017;

        const joint = b.joint(`toe${tag}${index + 1}`, {
          parent: chain.tip!,
          at: [x, 0.13, z - 0.03],
          dir: [i * 0.09, -0.025, 1],
          role: "digit",
        });

        return { joint, x, z, i };
      });

      legs.push({ s, side, front, tag, points, chain, paw, digits });
    }
  }

  // ---------------------------------------------------------------------
  // Placement helpers.
  // ---------------------------------------------------------------------
  function ellipsoid(
    at: any,
    size: number[],
    color: any,
    bone: any,
    name: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at,
      bone,
      scale: size,
      flat: true,
      name,
    });
  }

  function box(
    at: any,
    size: number[],
    color: any,
    bone: any,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
    });
  }

  // Broad overlapping locks, seated deeper than before. Each painted face
  // has a darker root, a clean silver tip and a few long brush marks.
  function furBlade(
    hit: any,
    width: number,
    length: number,
    flow: number[],
    color: any = furBladePaint,
    name = "furBlade",
  ) {
    const outward = hit.axis.clone().normalize();
    const y = new THREE.Vector3(flow[0], flow[1], flow[2]).normalize();
    const x = y.clone().cross(outward);
    if (x.lengthSq() < 0.001) x.set(1, 0, 0);
    x.normalize();

    const lockPaint = paint((p, n, s) => {
      const along = Math.max(0, Math.min(1, s[1] / length));
      const stroke = Math.abs(
        Math.sin((s[0] / width + along * 0.13) * Math.PI * 7),
      );
      let col = resolve(color, p, n);
      col = mix(col, "#344d61", (1 - along) * 0.16);
      col = mix(col, "#e1e6e4", smoothstep(0.64, 1, along) * 0.17);
      return mix(
        col,
        "#556f80",
        stroke > 0.965 && along > 0.12 && along < 0.88 ? 0.20 : 0,
      );
    });

    return b.extrude(
      [
        [-width * 0.40, 0],
        [-width * 0.50, length * 0.24],
        [-width * 0.25, length * 0.62],
        [-width * 0.07, length],
        [width * 0.25, length * 0.69],
        [width * 0.46, length * 0.20],
        [width * 0.36, 0],
      ],
      {
        at: hit.moved([0, -width * 0.22, 0]),
        x,
        y,
        thickness: [width * 0.26, width * 0.035],
        bevel: 0.003,
        color: lockPaint,
        bone: hit.bone,
        name,
      },
    );
  }

  function surfaceBlade(
    target: any,
    center: any,
    az: number,
    el: number,
    width: number,
    length: number,
    flow: number[],
    color: any,
    name: string,
  ) {
    const hit = b.surface(target).around(center).at(az, el);
    if (hit) return furBlade(hit, width, length, flow, color, name);
    return null;
  }

  // ---------------------------------------------------------------------
  // Body: heavy chest, tucked waist and rising nape.
  // ---------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.965, -0.665], w: 0.38, h: 0.44 },
      { at: [0, 1.00, -0.46], w: 0.55, h: 0.57 },
      { at: [0, 1.025, -0.14], w: 0.51, h: 0.55 },
      { at: [0, 1.055, 0.15], w: 0.62, h: 0.69 },
      { at: [0, 1.09, 0.36], w: 0.64, h: 0.73 },
      { at: [0, 1.105, 0.49], w: 0.43, h: 0.55 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 8,
      smooth: false,
      name: "angularBarrel",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [0.29 - t * 0.075, 0.31 - t * 0.105],
    {
      color: silver,
      sides: 8,
      smooth: false,
      name: "raisedNeck",
    },
  );

  const breast = ellipsoid(
    [0, 1.035, 0.49],
    [0.255, 0.34, 0.205],
    cream,
    spine.joints[1],
    "deepSilverBreast",
  );

  const tailTube = b.sweep(
    tail,
    [0.17, 0.195, 0.18, 0.115, 0.016],
    {
      color: coat,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "point" },
      sectors: [
        [-58, 58, mane],
        [125, 235, silver],
      ],
      name: "brushTail",
    },
  );

  // ---------------------------------------------------------------------
  // Face: open amber eyes, long muzzle and independent lower jaw.
  // ---------------------------------------------------------------------
  const skull = ellipsoid(
    hp([0, 0, 0]),
    [H * 0.295, H * 0.245, H * 0.275],
    silver,
    head,
    "broadWolfSkull",
  );

  ellipsoid(
    hp([0, 0.085, -0.075]),
    [0.25 * H, 0.19 * H, 0.23 * H],
    coat,
    head,
    "slateCrown",
  );

  const muzzle = b.loft(
    [
      { at: hp([0, -0.075, 0.135]), w: H * 0.34, h: H * 0.205 },
      { at: hp([0, -0.082, 0.285]), w: H * 0.275, h: H * 0.15 },
      { at: hp([0, -0.092, 0.438]), w: H * 0.196, h: H * 0.108 },
    ],
    {
      color: silver,
      bone: head,
      sides: 6,
      smooth: false,
      caps: "flat",
      name: "longUpperMuzzle",
    },
  );

  b.frustumBox(
    hp([0, -0.011, 0.12]),
    hp([0, -0.044, 0.405]),
    [H * 0.18, H * 0.075],
    [H * 0.13, H * 0.045],
    { bone: head, color: coat, name: "angularNasalBridge" },
  );

  box(
    hp([0, -0.149, 0.285]),
    [H * 0.221, H * 0.023, H * 0.272],
    C.ink,
    head,
    "quietMouthOpening",
  );

  const lowerJaw = b.loft(
    [
      { at: hp([0, -0.172, 0.09]), w: H * 0.245, h: H * 0.108 },
      { at: hp([0, -0.181, 0.28]), w: H * 0.223, h: H * 0.079 },
      { at: hp([0, -0.172, 0.429]), w: H * 0.17, h: H * 0.058 },
    ],
    {
      bone: jaw,
      color: cream,
      sides: 6,
      smooth: false,
      caps: "flat",
      name: "separateLowerJaw",
    },
  );

  for (const s of [1, -1]) {
    ellipsoid(
      hp([s * 0.101, -0.108, 0.285]),
      [H * 0.065, H * 0.053, H * 0.143],
      cream,
      head,
      `creamJowl${s > 0 ? "L" : "R"}`,
    );

    for (const [z, size] of [[0.225, 0.027], [0.355, 0.018]]) {
      b.spike(
        hp([s * (z < 0.3 ? 0.108 : 0.087), -0.14, z]),
        [0, -1, 0.04],
        H * size,
        H * size * 0.27,
        {
          bone: head,
          color: C.ivory,
          sides: 5,
          name: "canineTip",
        },
      );
    }

    const eyeHit = b.surface(skull).around(HEAD).at(s * 39, 15);

    if (eyeHit) {
      const socket = b.stick(
        new THREE.SphereGeometry(1, 10, 6),
        C.charcoal,
        eyeHit,
        {
          scale: [0.098 * H, 0.028 * H, 0.064 * H],
          embed: 0.43,
          name: `eyeSocket${s > 0 ? "L" : "R"}`,
        },
      );

      glow(
        b.decal(socket, eyeTexture, {
          at: offset(eyeHit, eyeHit.axis, 0.020),
          dir: eyeHit.axis,
          size: [0.174 * H, 0.110 * H],
          mirror: s > 0,
          lift: 0.0015,
          segments: 6,
          bone: head,
          name: `amberEye${s > 0 ? "L" : "R"}`,
        }),
        0.24,
      );

      // Narrower, higher brows expose the pupil and upper iris.
      b.sweep(
        bezier(
          hp([s * 0.105, 0.123, 0.208]),
          hp([s * 0.205, 0.161, 0.224]),
          hp([s * 0.275, 0.105, 0.135]),
        ),
        [0.031, 0.035, 0.014],
        {
          bone: head,
          color: coat,
          sides: 5,
          smooth: false,
          name: "liftedAlertBrow",
        },
      );

      // A pale upper ridge catches light without shading the eye itself.
      b.sweep(
        bezier(
          hp([s * 0.112, 0.147, 0.193]),
          hp([s * 0.199, 0.18, 0.19]),
          hp([s * 0.258, 0.131, 0.134]),
        ),
        [0.012, 0.015, 0.006],
        {
          bone: head,
          color: silver,
          sides: 5,
          smooth: false,
          name: "silverBrowRidge",
        },
      );
    }

    for (let i = 0; i < 3; i++) {
      const hit = b.surface(muzzle).nearest(
        hp([
          s * (0.13 - i * 0.012),
          -0.095 - (i % 2) * 0.025,
          0.24 + i * 0.055,
        ]),
      );

      b.stick(new THREE.SphereGeometry(0.005, 5, 4), C.slate, hit, {
        embed: 0.55,
        name: "whiskerPore",
      });
    }
  }

  const nose = ellipsoid(
    hp([0, -0.084, 0.465]),
    [H * 0.111, H * 0.070, H * 0.069],
    C.nose,
    head,
    "facetedBlackNose",
  );

  b.decal(nose, noseTexture, {
    at: hp([0, -0.082, 0.534]),
    dir: [0, 0.04, 1],
    size: [0.213 * H, 0.129 * H],
    bone: head,
    segments: 6,
    name: "nostrilsAndNoseShine",
  });

  // Compact, forward-facing ears. Their heavy roots belong to the skull.
  for (let i = 0; i < ears.length; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = ears[i];

    const earShell = b.extrude(
      [
        [-0.095 * H, 0],
        [0.082 * H, 0.018 * H],
        [0.061 * H, 0.239 * H],
        [0.012 * H, 0.222 * H],
        [-0.08 * H, 0.084 * H],
      ],
      {
        at: ear,
        x: [s, 0, 0],
        y: [s * 0.18, 1, -0.12],
        thickness: [0.10 * H, 0.030 * H],
        bevel: 0.008,
        color: mane,
        bone: ear,
        name: `pointedEar${s > 0 ? "L" : "R"}`,
      },
    );

    b.decal(earShell, earTexture, {
      at: hp([s * 0.213, 0.293, -0.035]),
      dir: [0, 0.08, 1],
      size: [0.143 * H, 0.211 * H],
      mirror: s < 0,
      segments: 5,
      bone: ear,
      name: "silverRimmedInnerEar",
    });

    surfaceBlade(
      skull, HEAD, s * 73, 46, 0.13, 0.145,
      [s * 0.6, -0.45, -0.5], silver, "earRootFur",
    );
  }

  // ---------------------------------------------------------------------
  // Legs, paws and individually rigged toes.
  // ---------------------------------------------------------------------
  for (const leg of legs) {
    const { front, chain, s, points, paw, digits, tag } = leg;

    const tube = b.sweep(
      chain,
      front
        ? [0.165, 0.135, 0.085, 0.061, 0.072]
        : [0.205, 0.182, 0.108, 0.065, 0.070],
      {
        color: coat,
        sides: 7,
        smooth: false,
        name: `${front ? "foreleg" : "hindleg"}${tag}`,
      },
    );

    if (front) {
      ellipsoid(
        [s * 0.265, 1.075, 0.31],
        [0.175, 0.265, 0.195],
        coat,
        chain.joints[0],
        `heavyShoulder${tag}`,
      );
    } else {
      ellipsoid(
        [s * 0.28, 0.865, -0.44],
        [0.19, 0.253, 0.22],
        coat,
        chain.joints[0],
        `powerfulHaunch${tag}`,
      );
    }

    b.sweep(
      [points[front ? 1 : 2], points[3]],
      front ? [0.073, 0.056] : [0.055, 0.048],
      {
        color: silver,
        bone: chain.joints[front ? 1 : 2],
        sides: 6,
        smooth: false,
        name: "silverLowerShank",
      },
    );

    // A broad heel merges into a lower, narrower toe line.
    b.loft(
      [
        { at: [paw[0], 0.150, paw[2] - 0.048], w: 0.174, h: 0.123 },
        { at: [paw[0], 0.153, paw[2] + 0.037], w: 0.247, h: 0.139 },
        { at: [paw[0], 0.132, paw[2] + 0.134], w: 0.218, h: 0.092 },
      ],
      {
        color: silver,
        bone: chain.tip,
        sides: 8,
        smooth: false,
        caps: "flat",
        name: `taperedPaw${tag}`,
      },
    );

    ellipsoid(
      [paw[0], 0.189, paw[2] + 0.012],
      [0.117, 0.079, 0.128],
      coat,
      chain.tip,
      `pawKnuckle${tag}`,
    );

    for (const digit of digits) {
      ellipsoid(
        [digit.x, 0.129, digit.z],
        [0.038, 0.046, 0.067],
        silver,
        digit.joint,
        "separatedToe",
      );

      b.sweep(
        bezier(
          [digit.x, 0.139, digit.z + 0.043],
          [digit.x + digit.i * 0.003, 0.137, digit.z + 0.072],
          [digit.x + digit.i * 0.004, 0.109, digit.z + 0.091],
        ),
        [0.012, 0.009, 0],
        {
          bone: digit.joint,
          color: C.claw,
          sides: 5,
          caps: "point",
          name: "slateClaw",
        },
      );
    }

    ellipsoid(
      points[front ? 1 : 2],
      front ? [0.10, 0.105, 0.105] : [0.081, 0.087, 0.088],
      silver,
      chain.joints[front ? 1 : 2],
      front ? "elbowPoint" : "hockPoint",
    );

    const furSurface = b.surface(tube);

    for (let row = 0; row < 3; row++) {
      const p = chain.at(
        front ? 0.15 + row * 0.13 : 0.13 + row * 0.12,
      );

      const hit = furSurface.nearest(
        p.at.clone().add(new THREE.Vector3(s * 0.25, 0, -0.035)),
      );

      furBlade(
        hit,
        0.112 - row * 0.015,
        0.156 - row * 0.020,
        [s * 0.17, -0.84, -0.46],
        row === 0 ? mane : furBladePaint,
        "legFeathering",
      );
    }
  }

  // ---------------------------------------------------------------------
  // Fur silhouette: richest around the cheek, nape and chest.
  // ---------------------------------------------------------------------
  for (const s of [1, -1]) {
    const cheekRows = [
      [65, 10, 0.175, 0.225],
      [83, -5, 0.190, 0.255],
      [109, 4, 0.180, 0.245],
      [64, -26, 0.155, 0.207],
      [95, -28, 0.160, 0.225],
    ];

    for (let i = 0; i < cheekRows.length; i++) {
      const [az, el, w, l] = cheekRows[i];

      surfaceBlade(
        skull,
        HEAD,
        s * az,
        el,
        w * H,
        l * H,
        [s * 0.66, -0.49, -0.53],
        i === 2 ? mane : i > 2 ? cream : furBladePaint,
        "layeredCheekRuff",
      );
    }

    const shoulderRows = [
      [s * 0.24, 1.28, 0.18],
      [s * 0.31, 1.14, 0.13],
      [s * 0.33, 0.99, 0.19],
      [s * 0.27, 0.91, 0.32],
    ];

    for (let i = 0; i < shoulderRows.length; i++) {
      const hit = b.surface(body).nearest(shoulderRows[i]);

      furBlade(
        hit,
        0.19 - i * 0.013,
        0.232 - i * 0.016,
        [s * 0.24, -0.68, -0.68],
        i % 2 === 0 ? mane : furBladePaint,
        "shoulderCape",
      );
    }

    // The raised neck has enough solid mass behind the layers to avoid
    // looking like a collection of separate floating plates.
    for (let row = 0; row < 2; row++) {
      for (let j = 0; j < 4; j++) {
        const center = [
          0,
          1.31 + row * 0.095,
          0.49 + row * 0.06,
        ];

        surfaceBlade(
          neckTube,
          center,
          s * (43 + j * 32),
          row === 0 ? -8 : 16,
          0.175 - row * 0.018,
          0.235 - row * 0.022,
          [s * (0.24 + j * 0.06), -0.80, -0.40],
          j > 2 ? mane : furBladePaint,
          "neckRuffLayer",
        );
      }
    }

    for (let j = 0; j < 4; j++) {
      const z = 0.05 - j * 0.18;
      const hit = b.surface(body).nearest([
        s * 0.4,
        1.045 - j * 0.013,
        z,
      ]);

      furBlade(
        hit,
        0.145,
        0.174,
        [s * 0.16, -0.68, -0.72],
        j > 1 ? coat : furBladePaint,
        "flankFur",
      );
    }
  }

  // No upright plates along the spine: low, overlapping swept-back locks.
  for (let i = 0; i < 5; i++) {
    const z = 0.34 - i * 0.205;
    const hit = b.surface(body).nearest([0, 1.6, z]);

    furBlade(
      hit,
      0.24 - i * 0.012,
      0.19,
      [0, -0.32, -1],
      i < 2 ? mane : coat,
      "lowDorsalLock",
    );
  }

  // A fuller nape joins the high head to the withers.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      surfaceBlade(
        neckTube,
        [0, 1.36, 0.52],
        s * (128 + i * 15),
        12 + i * 9,
        0.165,
        0.23,
        [s * 0.23, -0.55, -0.80],
        i === 1 ? furBladePaint : mane,
        "raisedNapeLock",
      );
    }
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      surfaceBlade(
        breast,
        [0, 1.035, 0.49],
        s * (15 + i * 24),
        -8 - i * 15,
        0.135,
        0.205 - i * 0.021,
        [s * 0.18, -0.98, 0.025],
        cream,
        "silverChestLock",
      );
    }

    surfaceBlade(
      lowerJaw,
      hp([0, -0.18, 0.24]),
      s * 95,
      -35,
      0.105,
      0.125,
      [s * 0.22, -0.55, -0.8],
      cream,
      "jawHingeTuft",
    );
  }

  for (let i = 0; i < 6; i++) {
    const t = 0.17 + i * 0.125;

    for (const s of [1, -1]) {
      furBlade(
        tailTube.at(t, s * 80),
        0.14 - i * 0.013,
        0.205 - i * 0.017,
        [s * 0.18, -0.46, -0.87],
        i > 3 ? silver : coat,
        "tailBrushLock",
      );
    }
  }

  furBlade(
    tailTube.at(0.89, 0),
    0.105,
    0.13,
    [0.40, -0.24, -0.88],
    silver,
    "tailTipLock",
  );

  // ---------------------------------------------------------------------
  // Weathered collar and frost-rune pendant, kept below the lifted face.
  // ---------------------------------------------------------------------
  const collarPlane = frame(
    [0, 1.305, 0.478],
    [0, 0.87, 0.49],
  );

  const collarLoop = b.surface(neckTube).loop(
    collarPlane,
    { lift: 0.006 },
  );

  b.sweep(collarLoop, 0.030, {
    bone: neck.joints[0],
    color: leather,
    sides: 6,
    smooth: false,
    name: "thickLeatherCollar",
  });

  b.sweep(collarLoop, 0.007, {
    bone: neck.joints[0],
    color: C.leatherEdge,
    shift: [0, 0.026],
    sides: 5,
    name: "collarPiping",
  });

  b.along(collarLoop, 12, (at) => {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), C.metal, {
      at,
      bone: neck.joints[0],
      name: "collarRivet",
    });
  });

  b.extrude(
    [
      [-0.072, 0.10],
      [0.072, 0.10],
      [0.065, -0.083],
      [0, -0.127],
      [-0.065, -0.083],
    ],
    {
      at: [0, 1.19, 0.808],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      color: leather,
      bone: neck.joints[0],
      name: "collarPendantTab",
    },
  );

  b.part(new THREE.PlaneGeometry(0.133, 0.20), "#ffffff", {
    at: [0, 1.19, 0.821],
    dir: [0, 0, 1],
    axis: "z",
    texture: stitchTexture,
    bone: neck.joints[0],
    name: "stitchedLeatherTab",
  });

  b.part(new THREE.TorusGeometry(0.027, 0.008, 5, 10), C.gold, {
    at: [0, 1.286, 0.836],
    bone: neck.joints[0],
    name: "pendantLink",
  });

  b.extrude(
    [
      [0, 0.076],
      [0.062, 0.04],
      [0.055, -0.043],
      [0, -0.098],
      [-0.055, -0.043],
      [-0.062, 0.04],
    ],
    {
      at: [0, 1.193, 0.841],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.023,
      bevel: 0.004,
      color: C.iron,
      bone: neck.joints[0],
      name: "ironRuneBezel",
    },
  );

  glow(
    b.part(new THREE.PlaneGeometry(0.116, 0.155), "#ffffff", {
      at: [0, 1.188, 0.855],
      dir: [0, 0, 1],
      axis: "z",
      texture: runeTexture,
      bone: neck.joints[0],
      name: "frostRuneInlay",
    }),
    0.65,
  );

  // ---------------------------------------------------------------------
  // Staging. Base touches y=0; snow contact is approximately y=.083.
  // ---------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(1, 1.035, 0.075, 12), rock, {
    at: [0, 0.0375, -0.15],
    scale: [0.83, 1, 1.60],
    bone: hips,
    flat: true,
    name: "slateOutcropBase",
  });

  b.part(new THREE.CylinderGeometry(1, 1.012, 0.022, 12), snow, {
    at: [0, 0.076, -0.15],
    scale: [0.812, 1, 1.575],
    bone: hips,
    flat: true,
    name: "thinSnowCap",
  });

  const rocks = [
    [-0.62, -0.74, 0.18, 0.135, 0.23],
    [0.61, -0.86, 0.16, 0.175, 0.19],
    [-0.63, 0.19, 0.12, 0.10, 0.20],
    [0.65, 0.01, 0.12, 0.09, 0.17],
    [-0.39, -1.35, 0.14, 0.075, 0.18],
    [0.43, -1.34, 0.11, 0.085, 0.17],
    [-0.50, 0.92, 0.13, 0.065, 0.12],
    [0.52, 0.94, 0.10, 0.070, 0.14],
  ];

  for (let i = 0; i < rocks.length; i++) {
    const [x, z, rx, ry, rz] = rocks[i];

    // Lift the entire rock above the plinth bottom instead of burying more
    // than half its height and leaving vertices below the scene floor.
    b.part(new THREE.DodecahedronGeometry(1, 0), rock, {
      at: [x, 0.08 + ry * 0.80, z],
      scale: [rx, ry, rz],
      rotation: [0, i * 41, 0],
      bone: hips,
      flat: true,
      name: "brokenEdgeSlate",
    });

    // The cap straddles the actual top, so no dark tip pierces its centre.
    ellipsoid(
      [x - 0.009, 0.08 + ry * 1.68, z - 0.009],
      [rx * 0.91, ry * 0.28, rz * 0.88],
      snow,
      hips,
      "fittedRockSnowCap",
    );
  }

  for (const [x, z, radius] of [
    [-0.53, -0.2, 0.14],
    [0.52, 0.57, 0.10],
    [-0.43, 0.61, 0.09],
    [0.18, -1.30, 0.12],
    [-0.27, 1.05, 0.09],
  ]) {
    ellipsoid(
      [x, 0.09, z],
      [radius, 0.025, radius * 1.2],
      snow,
      hips,
      "windPackedSnow",
    );
  }

  // Sparse grasses leave the front and feet unobstructed.
  for (const [x, z] of [
    [-0.65, -0.95],
    [0.63, -0.47],
    [-0.59, 0.72],
  ]) {
    for (let j = 0; j < 4; j++) {
      const dx = (random() - 0.5) * 0.055;
      const dz = (random() - 0.5) * 0.055;
      const height = 0.075 + random() * 0.09;

      b.sweep(
        bezier(
          [x + dx, 0.085, z + dz],
          [x + dx, 0.085 + height * 0.7, z + dz],
          [x + dx + 0.035, 0.085 + height, z + dz - 0.025],
        ),
        [0.005, 0.0015],
        {
          color: "#7c8984",
          bone: hips,
          sides: 4,
          name: "winterGrass",
        },
      );
    }
  }

  for (const [x, z, h] of [
    [0.55, -1.14, 0.14],
    [0.63, -1.08, 0.095],
    [-0.60, -1.15, 0.09],
  ]) {
    b.part(new THREE.ConeGeometry(0.028, h, 5), "#91becf", {
      at: [x, 0.093 + h / 2, z],
      rotation: [10, 12, x > 0 ? -13 : 13],
      bone: hips,
      flat: true,
      name: "edgeIceShard",
    });
  }

  const plaqueNormal = new THREE.Vector3(0, 0.72, 0.69).normalize();

  b.part(new THREE.BoxGeometry(0.48, 0.14, 0.025), C.iron, {
    at: [0, 0.092, 1.23],
    dir: plaqueNormal,
    axis: "z",
    bone: hips,
    name: "frontNameplateBacking",
  });

  b.part(new THREE.PlaneGeometry(0.455, 0.137), "#ffffff", {
    at: new THREE.Vector3(0, 0.092, 1.23).addScaledVector(
      plaqueNormal,
      0.014,
    ),
    dir: plaqueNormal,
    axis: "z",
    bone: hips,
    texture: plaqueTexture,
    name: "FrostfangNameplate",
  });

  return b.root;
}
