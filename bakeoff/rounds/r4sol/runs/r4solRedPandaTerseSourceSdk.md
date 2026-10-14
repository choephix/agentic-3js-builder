```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  paint,
  grain,
  mottle,
  countershade,
  mix,
  noise,
  rng,
  type Fill,
  type JointRef,
  type Chain,
} from "agentic-3js-builder";

export const meta = {
  name: "Red Panda",
  description:
    "A russet-coated red panda with an ivory face, tufted ears, charcoal paws, and a generously fluffy ringed tail. Built in a relaxed, articulated quadrupedal rest pose.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Red Panda", detail: 1, paintSize: 1024 });
  const random = rng(4817);

  const C = {
    rust: "#bd522b",
    copper: "#d77536",
    orange: "#df873f",
    deepRust: "#a44429",
    cream: "#f1e8d3",
    creamShade: "#dfcfb2",
    creamLight: "#fff4df",
    ink: "#262429",
    warmBlack: "#342a2a",
    nose: "#191a1c",
    eye: "#101619",
    iris: "#69442b",
    earDark: "#72504a",
    earPink: "#ad7b65",
    claw: "#948477",
    whisker: "#c7bbaa",
  };

  // ---------------------------------------------------------------------------
  // Skeleton first: the spine, neck, jaw, ears, five tail bones, and all four feet.
  // ---------------------------------------------------------------------------
  const root = b.joint("root", {
    at: [0, 0.248, -0.15],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.25, -0.176],
      [0, 0.264, -0.064],
      [0, 0.28, 0.066],
      [0, 0.291, 0.15],
    ],
    {
      parent: root,
      names: ["pelvis", "spine1", "chest", "neckBase"],
      up: [0, 1, 0],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.289, 0.153],
      [0, 0.321, 0.231],
      [0, 0.351, 0.285],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2"],
      up: [0, 1, 0],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.351, 0.295],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.308, 0.352],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });

  const ears = [1, -1].map((s) =>
    b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.08, 0.411, 0.296],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.247, -0.253],
      [0.029, 0.239, -0.338],
      [0.081, 0.239, -0.429],
      [0.145, 0.248, -0.518],
      [0.213, 0.263, -0.601],
      [0.276, 0.283, -0.674],
    ]),
    {
      parent: spine.joints[0],
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      up: [0, 1, 0],
      role: "tail",
    },
  );

  type LegRig = {
    s: number;
    front: boolean;
    tag: string;
    x: number;
    z: number;
    chain: Chain;
    digits: Chain[];
  };

  const legs: LegRig[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    for (const front of [true, false]) {
      const tag = `${front ? "F" : "H"}${side}`;
      const x = s * (front ? 0.117 : 0.121);
      const z = front ? 0.205 : -0.143;
      const points = front
        ? [
            [s * 0.08, 0.268, 0.119],
            [s * 0.099, 0.153, 0.122],
            [s * 0.112, 0.052, 0.169],
            [x, 0.028, z],
          ]
        : [
            [s * 0.084, 0.249, -0.166],
            [s * 0.107, 0.161, -0.123],
            [s * 0.117, 0.073, -0.184],
            [x, 0.029, z],
          ];

      const chain = b.chain(`leg${tag}`, points, {
        parent: front ? spine.joints[2] : spine.joints[0],
        names: front
          ? [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`, `paw${tag}`]
          : [`hip${tag}`, `knee${tag}`, `hock${tag}`, `paw${tag}`],
        up: [0, 0, 1],
        role: "leg",
        contact: [x, 0, z + 0.024],
      });

      const digits: Chain[] = [];
      for (let i = 0; i < 5; i++) {
        const dx = (i - 2) * 0.012;
        const length = 0.064 - Math.abs(i - 2) * 0.004;
        digits.push(
          b.chain(
            `digit${tag}${i + 1}`,
            [
              [x + dx, 0.02, z + 0.026],
              [x + dx * 1.075, 0.011, z + length],
            ],
            {
              parent: chain.tip!,
              names: [`toe${tag}${i + 1}`],
              up: [0, 1, 0],
              role: "digit",
            },
          ),
        );
      }
      legs.push({ s, front, tag, x, z, chain, digits });
    }
  }

  // Shared SDK materials: fur is matte; the nose and eyes have a little sheen.
  b.material(C.nose).roughness = 0.3;
  b.material(C.eye).roughness = 0.17;
  b.material(C.iris).roughness = 0.34;
  b.material(C.creamLight).roughness = 0.56;
  b.material(C.ink).roughness = 0.88;
  b.material(C.earPink).roughness = 0.92;

  // ---------------------------------------------------------------------------
  // Coat paints. Fine streaks are painted, rather than modeled as excessive fur.
  // ---------------------------------------------------------------------------
  const rustGrain = grain(C.rust, "#ce632e", {
    size: 0.0028,
    axis: "z",
    seed: 22,
  });
  const russet = mottle(rustGrain, "#db7734", {
    size: 0.083,
    seed: 31,
    contrast: 0.6,
  });
  const copperTop = grain("#cf672e", "#df843d", {
    size: 0.003,
    axis: "z",
    seed: 8,
  });
  const blackFur = grain("#282427", "#352a29", {
    size: 0.0034,
    axis: "y",
    seed: 15,
  });
  const ivoryFur = grain("#f1e9d7", "#e4d5bb", {
    size: 0.0024,
    axis: "y",
    seed: 27,
  });
  const forehead = grain("#c05a2d", "#d97836", {
    size: 0.0024,
    axis: "y",
    seed: 41,
  });
  const eyeMark = grain("#743b2b", "#8c462d", {
    size: 0.002,
    axis: "y",
    seed: 2,
  });

  const bodyCoat = paint((p, n) => {
    const boundary = 0.226 + 0.008 * Math.sin(p.z * 14);
    if (p.y < boundary - 0.005) return blackFur;
    if (p.y < boundary + 0.005) {
      return mix(
        blackFur.at(p, n),
        russet.at(p, n),
        (p.y - boundary + 0.005) / 0.01,
      );
    }
    return n.y > 0.48 ? copperTop : russet;
  });

  const headCoat = paint((p, n) => {
    const ax = Math.abs(p.x);
    const front = p.z > 0.311 && n.z > -0.12;
    if (!front) return forehead;

    const cheek =
      ((ax - 0.076) / 0.047) ** 2 + ((p.y - 0.341) / 0.039) ** 2 < 1;
    const lowerFace = p.y < 0.353;
    const bridge =
      ax < 0.017 + Math.max(0, 0.354 - p.y) * 0.4 &&
      p.y > 0.334 &&
      p.y < 0.382;
    const eyebrow =
      ((ax - 0.06) / 0.034) ** 2 + ((p.y - 0.388) / 0.011) ** 2 < 1;

    const eyePatch =
      ((ax - 0.06) / 0.022) ** 2 + ((p.y - 0.366) / 0.018) ** 2 < 1;
    const tearX = 0.06 - (0.366 - p.y) * 0.48;
    const tearWidth =
      0.009 +
      Math.max(0, Math.min(1, (p.y - 0.324) / 0.042)) * 0.007 +
      Math.sin(p.y * 1250) * 0.0006;
    const tear =
      p.y > 0.324 &&
      p.y < 0.366 &&
      ax > 0.026 &&
      Math.abs(ax - tearX) < tearWidth;

    if ((eyePatch || tear) && !eyebrow) return eyeMark;
    if (cheek || lowerFace || bridge || eyebrow) return ivoryFur;
    return forehead;
  });

  const tailColors = [
    "#ae4729",
    "#dfa266",
    "#bd502c",
    "#e7ae6d",
    "#b9512e",
    "#e4a66a",
    "#ba542f",
    "#eab679",
    "#af482b",
    "#e3a66b",
    "#b65532",
    "#eac08a",
  ];

  const tailCoat = paint((p, n, surface) => {
    const angle = (surface[1] * Math.PI) / 180;
    const ragged =
      Math.sin(angle * 13 + surface[0] * 31) * 0.004 +
      Math.sin(angle * 23 - surface[0] * 19) * 0.002;
    const k = Math.min(11, Math.max(0, Math.floor((surface[0] + ragged) * 12)));
    const fine = noise(p, 0.006, 53);
    return mix(tailColors[k], k % 2 ? "#f5cf94" : "#d4773d", fine * 0.14);
  });

  // A small, pointed, faceted fur shingle: its +Y is outward and +Z is fur flow.
  function furWedge(w: number, length: number, height: number) {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -w / 2, 0, 0,
          w / 2, 0, 0,
          w * 0.42, 0, length * 0.54,
          0, 0, length,
          -w * 0.42, 0, length * 0.54,
          0, height, length * 0.36,
        ],
        3,
      ),
    );
    g.setIndex([
      0, 5, 1, 1, 5, 2, 2, 5, 3, 3, 5, 4, 4, 5, 0,
      0, 1, 2, 0, 2, 3, 0, 3, 4,
    ]);
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    return flat;
  }

  function ellipsoid(
    name: string,
    at: number[] | THREE.Vector3,
    radii: number[],
    color: Fill,
    bone: JointRef,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name,
      at,
      scale: radii,
      bone,
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------
  // The simple, substantial base volumes.
  // ---------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.247, -0.237], w: 0.113, h: 0.133 },
      { at: [0, 0.259, -0.177], w: 0.259, h: 0.243 },
      { at: [0, 0.268, -0.059], w: 0.28, h: 0.251 },
      { at: [0, 0.28, 0.067], w: 0.249, h: 0.237 },
      { at: [0, 0.288, 0.148], w: 0.176, h: 0.183 },
      { at: [0, 0.295, 0.19], w: 0.105, h: 0.12 },
    ],
    {
      name: "russetBody",
      color: bodyCoat,
      bone: spine,
      up: [0, 1, 0],
      sides: 12,
      smooth: false,
      caps: "round",
    },
  );

  b.loft(
    [
      { at: [0, 0.292, 0.144], w: 0.158, h: 0.173 },
      { at: [0, 0.322, 0.222], w: 0.157, h: 0.156 },
      { at: [0, 0.35, 0.274], w: 0.139, h: 0.126 },
    ],
    {
      name: "neckRuff",
      color: countershade(russet, blackFur, { level: -0.08, soft: 0.22 }),
      bone: neck,
      up: [0, 1, 0],
      sides: 10,
      smooth: false,
      caps: "round",
    },
  );

  const skull = b.loft(
    [
      { at: [0, 0.35, 0.243], w: 0.126, h: 0.115 },
      { at: [0, 0.356, 0.283], w: 0.222, h: 0.167 },
      { at: [0, 0.351, 0.327], w: 0.215, h: 0.158 },
      { at: [0, 0.343, 0.364], w: 0.172, h: 0.12 },
      { at: [0, 0.331, 0.39], w: 0.107, h: 0.076 },
    ],
    {
      name: "maskedHead",
      color: headCoat,
      bone: head,
      up: [0, 1, 0],
      sides: 12,
      smooth: false,
      caps: { start: "round", end: "flat" },
    },
  );
  const faceSurface = b.surface(skull);

  const tailSkin = b.sweep(
    tail,
    [0.046, 0.065, 0.071, 0.069, 0.06, 0.048, 0.031],
    {
      name: "ringedTail",
      color: tailCoat,
      sides: 10,
      smooth: false,
      caps: "round",
      extend: [0.035, 0],
    },
  );

  // The coat's little angular tufts follow the underlying skin and skeleton.
  const bodyTuft = furWedge(0.023, 0.035, 0.0055);
  const peltColors = [C.rust, C.copper, "#c8612f", "#d17232"];
  b.along(
    body,
    6,
    (point) => {
      for (const angle of [-65, -30, 0, 30, 65]) {
        const on = body.at(point.t, angle);
        if (on.at.y < 0.235) continue;
        b.stick(
          bodyTuft,
          peltColors[Math.floor(random() * peltColors.length)],
          on,
          {
            name: "peltTuft",
            flow: [0, -0.13, -1],
            embed: 0.2,
            spin: (random() - 0.5) * 16,
            scale: [0.8 + random() * 0.35, 0.75 + random() * 0.4, 0.85 + random() * 0.25],
          },
        );
      }
    },
    { from: 0.15, to: 0.86 },
  );

  const sideTufts = b.surface(body).scatter(23, {
    rng: random,
    minDist: 0.04,
    filter: (hit) => hit.at.y > 0.242 && hit.n.y > -0.35,
  });
  for (const on of sideTufts) {
    b.stick(bodyTuft, C.rust, on, {
      name: "finePeltTuft",
      flow: [0, -0.25, -1],
      embed: 0.25,
      scale: 0.65 + random() * 0.25,
      spin: (random() - 0.5) * 24,
    });
  }

  const tailTuft = furWedge(0.016, 0.029, 0.007);
  b.along(
    tailSkin,
    12,
    (point) => {
      const k = Math.min(11, Math.floor(point.t * 12));
      for (const angle of [-120, -60, 0, 60, 120]) {
        const on = tailSkin.at(point.t, angle);
        b.stick(tailTuft, tailColors[k], on, {
          name: "tailFeathering",
          flow: on.tangent,
          embed: 0.18,
          scale: [0.9 + random() * 0.25, 0.8 + random() * 0.3, 0.8 + random() * 0.35],
          spin: (random() - 0.5) * 12,
        });
      }
    },
    { from: 0.055, to: 0.955 },
  );

  // ---------------------------------------------------------------------------
  // Four dark legs, flat-soled paws, individually articulated toes and claws.
  // ---------------------------------------------------------------------------
  for (const leg of legs) {
    const legSkin = b.sweep(
      leg.chain,
      leg.front
        ? [0.042, 0.036, 0.027, 0.023]
        : [0.049, 0.041, 0.03, 0.024],
      {
        name: `furLeg${leg.tag}`,
        color: C.ink,
        bands: [
          [leg.front ? 0.1 : 0.19, russet],
          [1, blackFur],
        ],
        sides: 8,
        smooth: false,
        caps: "round",
        extend: [0.008, 0],
      },
    );

    b.extrude(
      [
        [-0.041, 0.009],
        [-0.033, 0.035],
        [0.001, 0.043],
        [0.029, 0.033],
        [0.043, 0.014],
        [0.039, 0],
        [-0.031, 0],
      ],
      {
        name: `pawSole${leg.tag}`,
        color: C.ink,
        at: [leg.x, 0, leg.z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.058,
        bevel: 0.003,
        detail: 0.5,
        bone: leg.chain.tip!,
      },
    );

    const darkTuft = furWedge(0.011, 0.02, 0.003);
    for (const t of [0.45, 0.66]) {
      for (const a of [-65, 65]) {
        b.stick(darkTuft, C.warmBlack, legSkin.at(t, a), {
          name: `legTuft${leg.tag}`,
          flow: [0, -1, 0.1],
          embed: 0.2,
        });
      }
    }

    for (let i = 0; i < leg.digits.length; i++) {
      const digit = leg.digits[i];
      b.sweep(
        digit,
        (t) => [0.0062 - t * 0.0014, 0.01 - t * 0.002],
        {
          name: `toeFur${leg.tag}${i + 1}`,
          color: C.ink,
          sides: 6,
          smooth: false,
          caps: "round",
        },
      );

      const toeEnd = digit.at(1);
      const clawRoot = toeEnd.at.clone().add(new THREE.Vector3(0, 0.001, 0.004));
      b.sweep(
        bezier(
          clawRoot,
          clawRoot.clone().add(new THREE.Vector3(0, 0.002, 0.007)),
          clawRoot.clone().add(new THREE.Vector3(0, -0.005, 0.013)),
        ),
        [0.0031, 0.00025],
        {
          name: `claw${leg.tag}${i + 1}`,
          color: C.claw,
          bone: digit.joints[0],
          sides: 5,
          smooth: false,
          caps: { start: "flat", end: "point" },
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Large, short triangular ears: russet backs, ivory rims, warm inner facets.
  // ---------------------------------------------------------------------------
  const earOutline = [
    [-0.037, -0.01],
    [-0.035, 0.029],
    [-0.013, 0.068],
    [0.009, 0.077],
    [0.027, 0.065],
    [0.051, 0.02],
    [0.034, -0.012],
    [0.003, -0.022],
  ];
  const innerOutline = [
    [-0.021, 0.007],
    [-0.02, 0.029],
    [-0.006, 0.057],
    [0.008, 0.064],
    [0.023, 0.044],
    [0.035, 0.016],
    [0.022, 0],
    [0.002, -0.003],
  ];

  for (let index = 0; index < 2; index++) {
    const s = index === 0 ? 1 : -1;
    const ear = ears[index];

    b.extrude(earOutline.map(([x, y]) => [x * 1.06, y * 1.035]), {
      name: `earBack${s === 1 ? "L" : "R"}`,
      color: C.deepRust,
      at: [s * 0.08, 0.411, 0.282],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.027,
      bevel: 0.003,
      detail: 0.5,
      bone: ear,
    });

    const rim = b.extrude(earOutline, {
      name: `ivoryEarRim${s === 1 ? "L" : "R"}`,
      color: ivoryFur,
      at: [s * 0.08, 0.411, 0.298],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.0035,
      detail: 0.5,
      bone: ear,
    });

    b.extrude(innerOutline, {
      name: "earInnerShadow",
      color: C.earDark,
      at: [s * 0.08, 0.411, 0.313],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.005,
      bevel: 0.001,
      detail: 0.5,
      bone: ear,
    });

    b.extrude(
      [
        [-0.013, 0.014],
        [-0.009, 0.038],
        [0.006, 0.054],
        [0.021, 0.021],
        [0.02, 0.009],
        [0.006, 0.003],
      ],
      {
        name: "warmEarFacet",
        color: C.earPink,
        at: [s * 0.08, 0.411, 0.317],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.003,
        bone: ear,
      },
    );

    const earSurface = b.surface(rim);
    for (let j = 0; j < 3; j++) {
      const on = earSurface.nearest([s * (0.067 + j * 0.012), 0.422, 0.315]);
      b.stick(furWedge(0.011, 0.02 - j * 0.002, 0.003), C.cream, on, {
        name: "earFuzz",
        flow: [s * 0.2, 1, 0],
        embed: 0.2,
        bone: ear,
      });
    }
  }

  // Pointed cheek ruffs sit behind the mask, giving the face its fluffy silhouette.
  const cheekOutline = [
    [-0.027, 0.018],
    [0.022, 0.035],
    [0.046, 0.018],
    [0.059, -0.001],
    [0.044, 0.001],
    [0.063, -0.028],
    [0.037, -0.02],
    [0.044, -0.043],
    [0.01, -0.036],
    [-0.019, -0.019],
  ];
  for (const s of [1, -1]) {
    b.extrude(cheekOutline.map(([x, y]) => [x * 1.07, y * 1.06]), {
      name: "russetCheekBacking",
      color: C.rust,
      at: [s * 0.066, 0.341, 0.315],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.033,
      bevel: 0.002,
      detail: 0.5,
      bone: head,
    });
    b.extrude(cheekOutline, {
      name: "ivoryCheekRuff",
      color: ivoryFur,
      at: [s * 0.066, 0.341, 0.333],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.0025,
      detail: 0.5,
      bone: head,
    });

    for (let j = 0; j < 4; j++) {
      const on = faceSurface.nearest([
        s * (0.091 + j * 0.003),
        0.353 - j * 0.01,
        0.355,
      ]);
      b.stick(furWedge(0.012, 0.021, 0.004), C.cream, on, {
        name: "cheekFuzz",
        flow: [s * 0.2, -0.55, -0.8],
        embed: 0.25,
        bone: head,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Eyes: small dark, glossy eyes set into the warm tear-shaped face markings.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const hit = faceSurface.ray([s * 0.06, 0.367, 0.65], [0, 0, -1])!;
    const n = hit.n;

    b.stick(new THREE.SphereGeometry(1, 10, 6), "#59352c", hit, {
      name: `eyeSocket${s === 1 ? "L" : "R"}`,
      scale: [0.018, 0.0058, 0.0205],
      flow: [0, 1, 0],
      embed: 0.38,
      flat: true,
      bone: head,
    });

    const eyeCenter = hit.at.clone().addScaledVector(n, 0.005);
    b.part(new THREE.SphereGeometry(1, 12, 8), C.eye, {
      name: `eye${s === 1 ? "L" : "R"}`,
      at: eyeCenter,
      dir: n,
      axis: "z",
      up: [0, 1, 0],
      scale: [0.0137, 0.0147, 0.009],
      bone: head,
    });

    b.part(new THREE.SphereGeometry(1, 12, 8), C.iris, {
      name: "chestnutIris",
      at: eyeCenter.clone().addScaledVector(n, 0.006),
      dir: n,
      axis: "z",
      up: [0, 1, 0],
      scale: [0.0101, 0.0109, 0.0047],
      bone: head,
    });

    const pupil = b.part(new THREE.SphereGeometry(1, 12, 8), C.eye, {
      name: "roundPupil",
      at: eyeCenter.clone().addScaledVector(n, 0.0093),
      dir: n,
      axis: "z",
      up: [0, 1, 0],
      scale: [0.0075, 0.0085, 0.0031],
      bone: head,
    });

    b.part(new THREE.SphereGeometry(0.00245, 8, 5), C.creamLight, {
      name: "eyeCatchlight",
      at: pupil.local([0.003, 0.0039, 0.0025]),
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.00095, 6, 4), C.cream, {
      name: "eyeSmallCatchlight",
      at: pupil.local([-0.003, -0.0035, 0.0027]),
      bone: head,
    });

    for (const dx of [-0.008, 0.009]) {
      const brow = faceSurface.ray(
        [s * (0.06 + dx), 0.387, 0.65],
        [0, 0, -1],
      )!;
      b.stick(furWedge(0.012, 0.011, 0.0023), C.cream, brow, {
        name: "ivoryBrowFur",
        flow: [s * 0.25, 1, -0.12],
        embed: 0.35,
        bone: head,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Separate upper muzzle and lower jaw, with a triangular nose and quiet smile.
  // ---------------------------------------------------------------------------
  const upperMuzzle = [1, -1].map((s) =>
    ellipsoid(
      "upperMuzzle",
      [s * 0.024, 0.326, 0.408],
      [0.031, 0.0235, 0.031],
      ivoryFur,
      head,
      10,
    ),
  );

  b.loft(
    [
      { at: [0, 0.302, 0.361], w: 0.064, h: 0.026 },
      { at: [0, 0.3, 0.398], w: 0.081, h: 0.026 },
      { at: [0, 0.302, 0.425], w: 0.065, h: 0.02 },
    ],
    {
      name: "lowerJaw",
      color: ivoryFur,
      bone: jaw,
      up: [0, 1, 0],
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "flat" },
    },
  );

  b.extrude(
    [
      [-0.018, 0.007],
      [0.018, 0.007],
      [0.014, -0.001],
      [0, -0.01],
      [-0.014, -0.001],
    ],
    {
      name: "triangularNose",
      color: C.nose,
      at: [0, 0.341, 0.439],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      detail: 0.5,
      bone: head,
    },
  );
  b.extrude(
    [
      [-0.012, 0.003],
      [-0.004, 0.0045],
      [-0.006, 0.0007],
    ],
    {
      name: "noseFacet",
      color: "#494343",
      at: [0, 0.341, 0.444],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.0007,
      bone: head,
    },
  );

  b.rod([0, 0.332, 0.44], [0, 0.315, 0.44], 0.00125, {
    name: "philtrum",
    color: "#514038",
    bone: head,
    sides: 5,
    smooth: false,
  });

  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [0, 0.315, 0.44],
        [s * 0.012, 0.3085, 0.438],
        [s * 0.026, 0.315, 0.429],
      ),
      0.00125,
      {
        name: "mouthCorner",
        color: "#514038",
        bone: jaw,
        sides: 5,
        smooth: false,
        caps: "round",
      },
    );
  }

  // Whisker follicles and three fine, tapered whiskers on each cheek.
  const muzzleSurface = b.surface(upperMuzzle);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const on = muzzleSurface.ray(
        [s * (0.032 + i * 0.004), 0.333 - i * 0.007, 0.6],
        [0, 0, -1],
      )!;
      b.stick(new THREE.SphereGeometry(0.00125, 6, 4), "#766354", on, {
        name: "whiskerFollicle",
        embed: 0.55,
        bone: head,
      });

      const start = on.at.clone().addScaledVector(on.n, 0.001);
      const tip = start.clone().add(
        new THREE.Vector3(
          s * (0.053 + i * 0.003),
          0.01 - i * 0.012,
          0.008 - i * 0.005,
        ),
      );
      b.sweep(
        bezier(
          start,
          start.clone().lerp(tip, 0.5).add(new THREE.Vector3(0, 0.004, 0.003)),
          tip,
        ),
        [0.0007, 0.00013],
        {
          name: "fineWhisker",
          color: C.whisker,
          bone: head,
          sides: 4,
          smooth: false,
          caps: "flat",
        },
      );
    }
  }

  return b.root;
}
```