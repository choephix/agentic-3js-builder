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
  smoothstep,
  grain,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frostfang — Gray Wolf",
  description:
    "An alert northern gray wolf with an oversized, angular silver ruff, heavy paws, amber eyes and a runic leather collar, standing on a small snowy outcrop. A low-poly, hand-painted fantasy puppet inspired by Warcraft.",
};

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
    claw: "#acb6bc",
    leather: "#394248",
    leatherEdge: "#798c95",
    iron: "#576b77",
    metal: "#b3c6cd",
    gold: "#c6a167",
    ice: "#8eecf1",
    snow: "#e8f2f3",
  };

  // Broad, placed colour masses, with restrained painted hair rather than a
  // smooth, noisy coat. The spine is dark; chest, jaw and socks are silver.
  const coat = paint((p, n) => {
    const variation = noise(p, 0.105, 14);
    const dorsal =
      smoothstep(0.0, 0.65, n.y) *
      smoothstep(0.38, 0.15, Math.abs(p.x)) *
      smoothstep(0.8, 0.3, p.z);
    const belly = smoothstep(0.05, -0.6, n.y);
    let color = mix("#778996", "#a6b3bb", variation * 0.65 + 0.18);
    color = mix(color, "#364b5d", dorsal * 0.83);
    color = mix(color, "#d8dbd5", belly * 0.78);
    const hairs = Math.sin(p.y * 170 + p.z * 39 + variation * 9);
    return mix(color, "#c4cdd0", hairs > 0.87 ? 0.12 : 0);
  });

  const silver = paint((p, n) => {
    const v = noise(p, 0.07, 22);
    return mix(
      "#879ba9",
      "#d5dce0",
      0.4 + v * 0.32 + Math.max(0, n.y) * 0.22,
    );
  });

  const cream = paint((p, n) =>
    mix(
      "#aab9bc",
      "#e7e6dd",
      0.49 + 0.24 * n.y + noise(p, 0.09, 9) * 0.22,
    ),
  );

  const mane = paint((p, n, s) => {
    const line = Math.abs(
      Math.sin(s[0] * 113 + s[1] * 19 + noise(p, 0.11, 3) * 2),
    );
    const shade = 0.36 + 0.26 * n.y + noise(p, 0.1, 4) * 0.24;
    return mix(
      mix("#2c4053", "#708998", shade),
      "#b5c3ca",
      line > 0.985 ? 0.27 : 0,
    );
  });

  const furBladePaint = paint((p, n, s) => {
    const longitudinal = Math.sin(s[0] * 153 + s[1] * 12);
    const highlight = longitudinal > 0.91 ? 0.12 : 0;
    return mix(
      "#7f96a6",
      "#d0d9dd",
      0.36 + Math.max(0, n.y) * 0.25 +
        noise(p, 0.12, 39) * 0.19 + highlight,
    );
  });

  const rock = paint((p, n) => {
    const v = noise(p, 0.18, 43);
    const strata = Math.sin(p.y * 105 + p.x * 4);
    return mix(
      "#293b4b",
      "#607382",
      v * 0.6 + Math.max(0, n.y) * 0.18 + (strata > 0.5 ? 0.1 : 0),
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

  // -----------------------------------------------------------------------
  // Drawings. All artwork is authored here and reused on mirrored features.
  // -----------------------------------------------------------------------
  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#bd5515"/>
          <stop offset=".48" stop-color="#ed9e29"/>
          <stop offset="1" stop-color="#ffe493"/>
        </linearGradient>
      </defs>
      <path d="M7 47 L40 24 Q89 8 151 31
               L136 63 Q80 96 28 65 Z" fill="#162330"/>
      <path d="M18 48 L44 33 Q91 19 139 35
               L127 58 Q77 81 36 60 Z" fill="#e8d6a9"/>
      <ellipse cx="85" cy="48" rx="30" ry="31" fill="url(#a)"/>
      <ellipse cx="87" cy="48" rx="10" ry="26" fill="#15242d"/>
      <path d="M61 64 Q84 78 107 62" stroke="#ffdb67"
            stroke-width="5" fill="none"/>
      <path d="M12 46 L42 27 Q91 12 146 31" stroke="#182735"
            stroke-width="10" stroke-linejoin="round" fill="none"/>
      <path d="M30 66 Q79 87 132 62" stroke="#4b5b61"
            stroke-width="4" fill="none"/>
      <path d="M65 32 L75 28 L79 38 L68 42 Z" fill="#fff5d3"/>
      <circle cx="103" cy="61" r="4" fill="#ffe9a3"/>
    </svg>`,
    { size: 384 },
  );

  const earTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170">
      <defs>
        <linearGradient id="e" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a3c4b"/>
          <stop offset="1" stop-color="#697c87"/>
        </linearGradient>
      </defs>
      <path d="M17 153 L25 54 L62 9 L85 142 L67 160 Z"
            fill="#d1d9da"/>
      <path d="M28 141 L34 59 L61 26 L74 137 L58 151 Z"
            fill="url(#e)"/>
      <path d="M32 142 L43 108 L48 144 L56 111 L64 145
               L72 126 L75 151 L54 161 Z" fill="#acbdc3"/>
      <path d="M43 99 L48 61 M58 103 L60 51 M65 121 L67 91"
            stroke="#8298a4" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const noseTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <path d="M17 37 Q34 17 61 33 L58 50 Q39 39 22 53 Z"
            fill="#0c171f"/>
      <path d="M143 37 Q126 17 99 33 L102 50 Q121 39 138 53 Z"
            fill="#0c171f"/>
      <path d="M39 15 Q80 4 122 16" fill="none"
            stroke="#8196a2" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 54 L80 87" stroke="#111d26" stroke-width="4"/>
      <g fill="#506470">
        <circle cx="58" cy="21" r="2.5"/><circle cx="73" cy="17" r="2"/>
        <circle cx="91" cy="17" r="2.5"/><circle cx="104" cy="23" r="2"/>
        <circle cx="67" cy="38" r="2"/><circle cx="95" cy="40" r="2"/>
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
            stroke="#b6fbef" stroke-width="7" fill="none"
            stroke-linejoin="miter"/>
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

  // -----------------------------------------------------------------------
  // Skeleton first: a neutral, planted quadruped with a lifted head.
  // -----------------------------------------------------------------------
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
    { parent: hips, names: ["spine1", "chest", "withers"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 1.10, 0.36],
      [0, 1.29, 0.49],
      [0, 1.40, 0.66],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2", "neckTop"], role: "neck" },
  );

  const HEAD = [0, 1.41, 0.72];
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
      [0.035, 0.88, -0.95],
      [0.12, 0.66, -1.23],
      [0.26, 0.51, -1.50],
      [0.38, 0.53, -1.69],
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
        const x = paw[0] + i * 0.062;
        const z = paw[2] + 0.14 - Math.abs(i) * 0.015;
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

  // -----------------------------------------------------------------------
  // Placement helpers. Geometry remains deliberately broad and faceted.
  // -----------------------------------------------------------------------
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

  // A thick, asymmetric fur blade: one simple silhouette rather than a
  // collection of cones. Its root is seated on a queried body surface.
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

    return b.extrude(
      [
        [-width * 0.46, 0],
        [-width * 0.57, length * 0.27],
        [-width * 0.26, length * 0.62],
        [-width * 0.08, length],
        [width * 0.30, length * 0.66],
        [width * 0.50, length * 0.18],
        [width * 0.40, 0],
      ],
      {
        at: hit.moved([0, -width * 0.13, 0]),
        x,
        y,
        thickness: [width * 0.30, width * 0.055],
        bevel: 0.003,
        color,
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

  // -----------------------------------------------------------------------
  // The primary silhouette: barrel, high withers, rising neck and heavy tail.
  // -----------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.965, -0.665], w: 0.38, h: 0.44 },
      { at: [0, 1.00, -0.46], w: 0.55, h: 0.57 },
      { at: [0, 1.025, -0.14], w: 0.53, h: 0.59 },
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
    (t) => [
      0.29 - t * 0.075,
      0.31 - t * 0.105,
    ],
    {
      color: silver,
      sides: 8,
      smooth: false,
      name: "raisedNeck",
    },
  );

  const breast = ellipsoid(
    [0, 0.99, 0.49],
    [0.255, 0.33, 0.205],
    cream,
    spine.joints[1],
    "deepSilverBreast",
  );

  const tailTube = b.sweep(
    tail,
    [0.17, 0.195, 0.18, 0.125, 0.022],
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

  // -----------------------------------------------------------------------
  // Settle the face before any ornaments: skull, eyes, muzzle and hinged jaw.
  // -----------------------------------------------------------------------
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
      { at: hp([0, -0.092, 0.425]), w: H * 0.205, h: H * 0.112 },
    ],
    {
      color: silver,
      bone: head,
      sides: 6,
      smooth: false,
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
    [H * 0.232, H * 0.038, H * 0.285],
    C.ink,
    head,
    "quietMouthOpening",
  );

  const lowerJaw = b.loft(
    [
      { at: hp([0, -0.172, 0.09]), w: H * 0.245, h: H * 0.115 },
      { at: hp([0, -0.193, 0.28]), w: H * 0.23, h: H * 0.083 },
      { at: hp([0, -0.177, 0.405]), w: H * 0.18, h: H * 0.065 },
    ],
    {
      bone: jaw,
      color: cream,
      sides: 6,
      smooth: false,
      name: "separateLowerJaw",
    },
  );

  for (const s of [1, -1]) {
    ellipsoid(
      hp([s * 0.103, -0.108, 0.29]),
      [H * 0.072, H * 0.058, H * 0.159],
      cream,
      head,
      `creamJowl${s > 0 ? "L" : "R"}`,
    );

    // Short, unobtrusive canine tips visible in the relaxed closed mouth.
    for (const [z, size] of [[0.225, 0.037], [0.355, 0.024]]) {
      b.spike(
        hp([s * (z < 0.3 ? 0.112 : 0.09), -0.14, z]),
        [0, -1, 0.04],
        H * size,
        H * size * 0.27,
        { bone: head, color: C.ivory, sides: 5, name: "canineTip" },
      );
    }

    const eyeHit = b.surface(skull).around(HEAD).at(s * 39, 12);
    if (eyeHit) {
      const socket = b.stick(
        new THREE.SphereGeometry(1, 10, 6),
        C.charcoal,
        eyeHit,
        {
          scale: [0.103 * H, 0.039 * H, 0.071 * H],
          embed: 0.4,
          name: `eyeSocket${s > 0 ? "L" : "R"}`,
        },
      );
      const eyeAt = offset(eyeHit, eyeHit.axis, 0.026);
      glow(
        b.decal(socket, eyeTexture, {
          at: eyeAt,
          dir: eyeHit.axis,
          size: [0.171 * H, 0.108 * H],
          mirror: s > 0,
          lift: 0.0015,
          segments: 6,
          bone: head,
          name: `amberEye${s > 0 ? "L" : "R"}`,
        }),
        0.32,
      );

      b.sweep(
        bezier(
          hp([s * 0.105, 0.115, 0.208]),
          hp([s * 0.21, 0.135, 0.234]),
          hp([s * 0.278, 0.065, 0.137]),
        ),
        [0.052, 0.044, 0.018],
        {
          bone: head,
          color: coat,
          sides: 5,
          smooth: false,
          name: "heavyAlertBrow",
        },
      );
    }

    // Sparse, painted-looking whisker pores, not a hair-covered muzzle.
    for (let i = 0; i < 3; i++) {
      const hit = b.surface(muzzle).nearest(
        hp([s * (0.13 - i * 0.012), -0.095 - (i % 2) * 0.025, 0.24 + i * 0.055]),
      );
      b.stick(new THREE.SphereGeometry(0.006, 5, 4), C.slate, hit, {
        embed: 0.55,
        name: "whiskerPore",
      });
    }
  }

  const nose = ellipsoid(
    hp([0, -0.087, 0.443]),
    [H * 0.115, H * 0.073, H * 0.074],
    C.nose,
    head,
    "facetedBlackNose",
  );

  b.decal(nose, noseTexture, {
    at: hp([0, -0.083, 0.514]),
    dir: [0, 0.04, 1],
    size: [0.207 * H, 0.12 * H],
    bone: head,
    segments: 6,
    name: "nostrilsAndNoseShine",
  });

  // Ears have a real thick silhouette, a separate inner drawing, and a root
  // tuft. Both remain independently riggable.
  for (let i = 0; i < ears.length; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = ears[i];
    const earShell = b.extrude(
      [
        [-0.095 * H, 0],
        [0.082 * H, 0.018 * H],
        [0.067 * H, 0.292 * H],
        [0.014 * H, 0.268 * H],
        [-0.08 * H, 0.091 * H],
      ],
      {
        at: ear,
        x: [s, 0, 0],
        y: [s * 0.18, 1, -0.12],
        thickness: [0.10 * H, 0.035 * H],
        bevel: 0.009,
        color: mane,
        bone: ear,
        name: `pointedEar${s > 0 ? "L" : "R"}`,
      },
    );

    b.decal(earShell, earTexture, {
      at: hp([s * 0.216, 0.32, -0.037]),
      dir: [0, 0.08, 1],
      size: [0.148 * H, 0.255 * H],
      mirror: s < 0,
      segments: 5,
      bone: ear,
      name: "silverRimmedInnerEar",
    });

    surfaceBlade(
      skull, HEAD, s * 73, 46, 0.13, 0.16,
      [s * 0.6, -0.45, -0.5], silver, "earRootFur",
    );
  }

  // -----------------------------------------------------------------------
  // Legs. Strong shoulders, angular rear haunches and narrow lower shanks.
  // -----------------------------------------------------------------------
  const legTubes: any[] = [];
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
    legTubes.push({ ...leg, tube });

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

    // A separate pale cannon panel makes the bend and narrow ankle readable.
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

    box(
      [paw[0], 0.149, paw[2] + 0.052],
      [0.24, 0.133, 0.25],
      silver,
      chain.tip,
      `squarePaw${tag}`,
    );
    ellipsoid(
      [paw[0], 0.193, paw[2] + 0.022],
      [0.137, 0.092, 0.153],
      coat,
      chain.tip,
      `pawKnuckle${tag}`,
    );

    for (const digit of digits) {
      ellipsoid(
        [digit.x, 0.133, digit.z],
        [0.040, 0.050, 0.073],
        cream,
        digit.joint,
        "separatedToe",
      );

      b.sweep(
        bezier(
          [digit.x, 0.141, digit.z + 0.042],
          [digit.x + digit.i * 0.003, 0.139, digit.z + 0.078],
          [digit.x + digit.i * 0.005, 0.105, digit.z + 0.107],
        ),
        [0.016, 0.012, 0],
        {
          bone: digit.joint,
          color: C.claw,
          sides: 5,
          caps: "point",
          name: "slateClaw",
        },
      );
    }

    // Defined elbow/hock points sit on the chain rather than bridging limbs.
    ellipsoid(
      points[front ? 1 : 2],
      front ? [0.10, 0.105, 0.105] : [0.081, 0.087, 0.088],
      silver,
      chain.joints[front ? 1 : 2],
      front ? "elbowPoint" : "hockPoint",
    );

    const furSurface = b.surface(tube);
    for (let row = 0; row < 3; row++) {
      const p = chain.at(front ? 0.15 + row * 0.13 : 0.13 + row * 0.12);
      const hit = furSurface.nearest(
        p.at.clone().add(new THREE.Vector3(s * 0.25, 0, -0.035)),
      );
      furBlade(
        hit,
        0.115 - row * 0.015,
        0.18 - row * 0.023,
        [s * 0.22, -0.77, -0.56],
        row === 0 ? mane : furBladePaint,
        "legFeathering",
      );
    }
  }

  // -----------------------------------------------------------------------
  // Signature fur construction: large, overlapping planes of mane and cheek.
  // The silhouette stays a wolf, never a porcupine.
  // -----------------------------------------------------------------------
  for (const s of [1, -1]) {
    // Cheeks flare sideways and backwards, keeping the muzzle and eyes clear.
    const cheekRows = [
      [65, 10, 0.175, 0.255],
      [83, -5, 0.190, 0.285],
      [109, 4, 0.180, 0.275],
      [64, -26, 0.155, 0.235],
      [95, -28, 0.160, 0.250],
    ];
    for (let i = 0; i < cheekRows.length; i++) {
      const [az, el, w, l] = cheekRows[i];
      surfaceBlade(
        skull, HEAD, s * az, el, w * H, l * H,
        [s * 0.65, -0.52, -0.48],
        i === 2 ? mane : i > 2 ? cream : furBladePaint,
        "layeredCheekRuff",
      );
    }

    // A high dark shoulder cape underneath the silver neck ruff.
    const shoulderRows = [
      [s * 0.24, 1.28, 0.18],
      [s * 0.31, 1.14, 0.13],
      [s * 0.33, 0.99, 0.19],
      [s * 0.27, 0.91, 0.32],
    ];
    for (let i = 0; i < shoulderRows.length; i++) {
      const hit = b.surface(body).nearest(shoulderRows[i]);
      furBlade(
        hit, 0.19 - i * 0.013, 0.275 - i * 0.018,
        [s * 0.30, -0.57, -0.76],
        i % 2 === 0 ? mane : furBladePaint,
        "shoulderCape",
      );
    }

    // Neck ruff: two overlapping staggered rows, not separate little spikes.
    for (let row = 0; row < 2; row++) {
      for (let j = 0; j < 4; j++) {
        const angle = s * (43 + j * 32);
        const center = [0, 1.25 + row * 0.085, 0.49 + row * 0.06];
        surfaceBlade(
          neckTube, center, angle, row === 0 ? -8 : 16,
          0.17 - row * 0.018,
          0.26 - row * 0.025,
          [s * (0.25 + j * 0.08), -0.75, -0.45],
          j > 2 ? mane : furBladePaint,
          "neckRuffLayer",
        );
      }
    }

    // Rib and rump fur is quieter than the hero head.
    for (let j = 0; j < 5; j++) {
      const z = 0.08 - j * 0.15;
      const hit = b.surface(body).nearest([s * 0.4, 1.06 - j * 0.013, z]);
      furBlade(
        hit, 0.15, 0.215,
        [s * 0.22, -0.54, -0.80],
        j > 2 ? coat : furBladePaint,
        "flankFur",
      );
    }
  }

  // A few broad dorsal locks connect the nape to the dark back saddle.
  for (let i = 0; i < 7; i++) {
    const z = 0.35 - i * 0.15;
    const hit = b.surface(body).nearest([0, 1.6, z]);
    furBlade(
      hit,
      0.245 - i * 0.009,
      0.225,
      [0, 0.15, -1],
      i < 3 ? mane : coat,
      "dorsalLock",
    );
  }

  // Pointed chest and chin masses, all rooted in the actual breast/jaw.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      surfaceBlade(
        breast, [0, 0.99, 0.49],
        s * (15 + i * 24), -8 - i * 15,
        0.135, 0.23 - i * 0.022,
        [s * 0.22, -0.96, 0.04],
        cream, "silverChestLock",
      );
    }

    surfaceBlade(
      lowerJaw, hp([0, -0.18, 0.24]),
      s * 95, -35, 0.105, 0.15,
      [s * 0.22, -0.55, -0.8],
      cream, "jawHingeTuft",
    );
  }

  // Tail feathering follows its own rig, with a dark upper face and pale tip.
  for (let i = 0; i < 6; i++) {
    const t = 0.17 + i * 0.125;
    for (const s of [1, -1]) {
      furBlade(
        tailTube.at(t, s * 80),
        0.14 - i * 0.013,
        0.24 - i * 0.019,
        [s * 0.23, -0.38, -0.91],
        i > 3 ? silver : coat,
        "tailBrushLock",
      );
    }
  }
  furBlade(
    tailTube.at(0.89, 0), 0.12, 0.17,
    [0.55, -0.08, -0.85], silver, "tailTipLock",
  );

  // -----------------------------------------------------------------------
  // Understated Warcraft ornament: weathered collar, studs and a cold rune.
  // It is well below the face, not armour covering the animal.
  // -----------------------------------------------------------------------
  const collarPlane = frame([0, 1.265, 0.505], [0, 0.79, 0.61]);
  const collarLoop = b.surface(neckTube).loop(collarPlane, { lift: 0.012 });

  b.sweep(collarLoop, 0.036, {
    bone: neck.joints[0],
    color: leather,
    sides: 6,
    smooth: false,
    name: "thickLeatherCollar",
  });

  b.sweep(collarLoop, 0.009, {
    bone: neck.joints[0],
    color: C.leatherEdge,
    shift: [0, 0.032],
    sides: 5,
    name: "collarPiping",
  });

  b.along(collarLoop, 12, (at) => {
    b.part(new THREE.SphereGeometry(0.015, 6, 4), C.metal, {
      at,
      bone: neck.joints[0],
      name: "collarRivet",
    });
  });

  // The little leather hanging tab sits behind the inset metal charm.
  b.extrude(
    [
      [-0.072, 0.10], [0.072, 0.10], [0.065, -0.083],
      [0, -0.127], [-0.065, -0.083],
    ],
    {
      at: [0, 1.13, 0.799],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      color: leather,
      bone: neck.joints[0],
      name: "collarPendantTab",
    },
  );

  b.part(new THREE.PlaneGeometry(0.133, 0.20), "#ffffff", {
    at: [0, 1.13, 0.812],
    dir: [0, 0, 1],
    axis: "z",
    texture: stitchTexture,
    bone: neck.joints[0],
    name: "stitchedLeatherTab",
  });

  b.part(new THREE.TorusGeometry(0.027, 0.008, 5, 10), C.gold, {
    at: [0, 1.226, 0.827],
    bone: neck.joints[0],
    name: "pendantLink",
  });

  b.extrude(
    [
      [0, 0.076], [0.062, 0.04], [0.055, -0.043],
      [0, -0.098], [-0.055, -0.043], [-0.062, 0.04],
    ],
    {
      at: [0, 1.133, 0.832],
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
      at: [0, 1.128, 0.846],
      dir: [0, 0, 1],
      axis: "z",
      texture: runeTexture,
      bone: neck.joints[0],
      name: "frostRuneInlay",
    }),
    0.55,
  );

  // -----------------------------------------------------------------------
  // Small staged footprint: fractured slate under a thin mantle of snow.
  // Base bottoms at y=0; paws contact the snow at approximately y=.083.
  // -----------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(1, 1.035, 0.075, 12), rock, {
    at: [0, 0.0375, -0.19],
    scale: [0.83, 1, 1.66],
    bone: hips,
    flat: true,
    name: "slateOutcropBase",
  });

  b.part(new THREE.CylinderGeometry(1, 1.012, 0.022, 12), snow, {
    at: [0, 0.076, -0.19],
    scale: [0.812, 1, 1.635],
    bone: hips,
    flat: true,
    name: "thinSnowCap",
  });

  // Broken pieces stay at the sides and back, never obscuring the paws.
  const rocks = [
    [-0.62, -0.74, 0.18, 0.16, 0.23],
    [0.61, -0.86, 0.16, 0.22, 0.19],
    [-0.63, 0.19, 0.12, 0.13, 0.20],
    [0.65, 0.01, 0.12, 0.11, 0.17],
    [-0.39, -1.41, 0.14, 0.09, 0.18],
    [0.43, -1.40, 0.11, 0.10, 0.17],
    [-0.50, 0.92, 0.13, 0.08, 0.12],
    [0.52, 0.94, 0.10, 0.085, 0.14],
  ];

  for (let i = 0; i < rocks.length; i++) {
    const [x, z, rx, ry, rz] = rocks[i];
    b.part(new THREE.DodecahedronGeometry(1, 0), rock, {
      at: [x, 0.08 + ry * 0.42, z],
      scale: [rx, ry, rz],
      rotation: [0, i * 41, i % 2 ? 11 : -8],
      bone: hips,
      flat: true,
      name: "brokenEdgeSlate",
    });
    ellipsoid(
      [x - 0.01, 0.08 + ry * 1.13, z - 0.01],
      [rx * 0.83, ry * 0.22, rz * 0.80],
      snow,
      hips,
      "rockSnowCushion",
    );
  }

  // Several low snow pillows soften the geometric plinth without making it
  // a landscape larger than its hero.
  for (const [x, z, radius] of [
    [-0.53, -0.2, 0.14],
    [0.52, 0.57, 0.10],
    [-0.43, 0.61, 0.09],
    [0.18, -1.36, 0.12],
    [-0.27, 1.05, 0.09],
  ]) {
    ellipsoid(
      [x, 0.09, z],
      [radius, 0.028, radius * 1.2],
      snow,
      hips,
      "windPackedSnow",
    );
  }

  // A few bent winter grasses: muted, subordinate, and rooted at the edge.
  for (const [x, z] of [[-0.65, -0.95], [0.63, -0.47], [-0.59, 0.72]]) {
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
        [0.006, 0.002],
        {
          color: "#7c8984",
          bone: hips,
          sides: 4,
          name: "winterGrass",
        },
      );
    }
  }

  // Shallow ice shards on the back edge echo the charm's colour, not its size.
  for (const [x, z, h] of [[0.55, -1.14, 0.16], [0.63, -1.08, 0.11], [-0.60, -1.15, 0.10]]) {
    b.part(new THREE.ConeGeometry(0.031, h, 5), "#91becf", {
      at: [x, 0.087 + h / 2, z],
      rotation: [10, 12, x > 0 ? -13 : 13],
      bone: hips,
      flat: true,
      name: "edgeIceShard",
    });
  }

  // Small title plate fitted to the front bevel, clear of the animal.
  const plaqueNormal = new THREE.Vector3(0, 0.72, 0.69).normalize();
  b.part(new THREE.BoxGeometry(0.48, 0.14, 0.025), C.iron, {
    at: [0, 0.092, 1.23],
    dir: plaqueNormal,
    axis: "z",
    bone: hips,
    name: "frontNameplateBacking",
  });
  b.part(new THREE.PlaneGeometry(0.455, 0.137), "#ffffff", {
    at: new THREE.Vector3(0, 0.092, 1.23).addScaledVector(plaqueNormal, 0.014),
    dir: plaqueNormal,
    axis: "z",
    bone: hips,
    texture: plaqueTexture,
    name: "FrostfangNameplate",
  });

  return b.root;
}
