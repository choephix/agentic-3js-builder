import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  mix,
  noise,
  svg,
  rng,
} from "../../../../src/index";
import type { Joint } from "../../../../src/index";

export const meta = {
  name: "Frostfang — Gray Wolf",
  description:
    "An alert, broad-shouldered gray wolf with a silver blade-like ruff, charcoal saddle, amber eyes, and exaggerated low-poly fantasy proportions.",
};

type P = [number, number, number];
type Coat = string | ReturnType<typeof paint>;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Frostfang", paintSize: 2048 });
  const random = rng(72491);

  const C = {
    ink: "#202932",
    deep: "#303d4b",
    charcoal: "#404d5b",
    slate: "#596978",
    gray: "#788894",
    silver: "#a6b0b5",
    light: "#c6cbca",
    cream: "#d7d8ce",
    white: "#e5e3d8",
    nose: "#242b30",
    lip: "#252b31",
    mouth: "#45343a",
    tooth: "#e9e3cd",
    claw: "#454947",
    ear: "#777879",
  };

  const coat = paint((p, n) => {
    const variation = noise(p, 0.15, 12);
    const light = Math.min(1, Math.max(0, 0.48 + n.y * 0.27 + variation * 0.17));
    let col = mix("#586a7c", "#a6afb3", light);
    // The saddle follows the back, leaving the ribs and underside silver.
    const saddle =
      p.z < 0.48 &&
      p.z > -0.78 &&
      p.y > 1.035 - 0.07 * Math.cos(p.z * 3.0) &&
      n.y > 0.15;
    if (saddle) col = mix("#3b4959", "#647482", variation);
    if (p.y < 0.23) col = mix(col, "#bec4c3", 0.37);
    return col;
  });

  const pale = paint((p, n) =>
    mix(
      "#939fa8",
      "#deded2",
      Math.min(1, Math.max(0, 0.64 + n.y * 0.24 + (noise(p, 0.085, 4) - 0.5) * 0.18)),
    ),
  );

  const darkFur = paint((p, n) =>
    mix("#344454", "#687988", 0.35 + 0.24 * Math.max(0, n.y) + 0.18 * noise(p, 0.12, 9)),
  );

  const headCoat = paint((p, n) => {
    const t = 0.48 + 0.24 * n.y + 0.15 * noise(p, 0.075, 31);
    return mix("#667684", "#b4bcbf", t);
  });

  const tailCoat = paint((p, n) => {
    if (p.z < -1.63) return mix("#273645", "#526273", 0.48 + 0.25 * n.y);
    return mix("#4a5c6d", "#a7b1b7", 0.48 + 0.28 * n.y);
  });

  // Broad, hand-drawn markings retain their character at normal viewing distances.
  const eyeTexture = svg(
    `<svg viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 34 Q33 6 68 15 Q95 19 117 35 Q91 62 53 59 Q25 56 3 34Z" fill="#17232d"/>
      <path d="M12 35 Q40 17 68 22 Q88 24 106 35 Q83 53 54 52 Q31 50 12 35Z" fill="#d29a35"/>
      <path d="M20 37 Q49 24 88 31 Q86 50 57 52 Q34 50 20 37Z" fill="#f1c360"/>
      <ellipse cx="63" cy="36" rx="15" ry="20" fill="#b87922"/>
      <ellipse cx="63" cy="36" rx="9" ry="19" fill="#18232a"/>
      <path d="M29 26 Q68 10 99 29" stroke="#354553" stroke-width="5" fill="none"/>
      <path d="M24 48 Q57 59 91 43" stroke="#ffe4a0" stroke-width="3" fill="none"/>
      <path d="M49 24 L59 23 L56 30 L49 31Z" fill="#fff5d5"/>
      <circle cx="74" cy="44" r="2.8" fill="#ffebbe"/>
    </svg>`,
    { size: 384 },
  );

  const earTexture = svg(
    `<svg viewBox="0 0 80 150" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 138 L27 35 L42 5 L70 134 L54 120 L45 142 L36 123 L21 141Z" fill="#6b737a"/>
      <path d="M22 118 L39 27 L56 118 L44 105 L37 126 L32 108Z" fill="#a5a6a2"/>
      <path d="M30 102 L41 49 L47 101 L40 91 L36 110Z" fill="#c5c3b8"/>
      <path d="M15 135 L25 107 M23 141 L33 115 M47 139 L51 115 M59 130 L58 108"
       stroke="#d6d5c9" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const noseTexture = svg(
    `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 14 Q60 -2 115 14 L106 43 L70 63 L50 63 L14 43Z" fill="#252d32"/>
      <path d="M17 15 Q61 5 102 16 L91 22 Q59 14 28 23Z" fill="#52616a"/>
      <path d="M16 32 Q28 20 42 28 L38 40 Q23 45 16 32Z" fill="#121c24"/>
      <path d="M104 32 Q92 20 78 28 L82 40 Q97 45 104 32Z" fill="#121c24"/>
      <path d="M60 34 L60 57" stroke="#131e26" stroke-width="4"/>
      <path d="M48 16 L60 14 L72 16" stroke="#899393" stroke-width="3" fill="none"/>
      <g fill="#657077">
        <circle cx="47" cy="27" r="1.6"/><circle cx="54" cy="22" r="1.5"/>
        <circle cx="67" cy="25" r="1.6"/><circle cx="72" cy="32" r="1.4"/>
        <circle cx="49" cy="37" r="1.4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const muzzleTexture = svg(
    `<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="#5b6870">
        <ellipse cx="28" cy="25" rx="3.5" ry="2.7"/>
        <ellipse cx="48" cy="17" rx="3.2" ry="2.5"/>
        <ellipse cx="67" cy="25" rx="3.7" ry="2.8"/>
        <ellipse cx="42" cy="37" rx="3" ry="2.5"/>
        <ellipse cx="65" cy="42" rx="2.8" ry="2.3"/>
        <ellipse cx="86" cy="34" rx="2.9" ry="2.4"/>
      </g>
      <path d="M14 48 Q57 59 103 43" stroke="#7d898e" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const chestTexture = svg(
    `<svg viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="square">
        <path d="M25 30 L44 54 L50 38 M89 29 L96 51 L113 30"
          stroke="#a1adb2" stroke-width="5"/>
        <path d="M39 74 L61 106 L67 83 M83 70 L79 101 L99 78"
          stroke="#8999a5" stroke-width="5"/>
        <path d="M56 122 L72 151 L85 122"
          stroke="#a7b2b6" stroke-width="5"/>
        <path d="M20 72 L34 88 M108 65 L103 84"
          stroke="#c6cfcb" stroke-width="5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  // --------------------------------------------------------------------------
  // Skeleton. All major shapes and all digits have their own animation handles.
  // --------------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.94, -0.48],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [[0, 0.94, -0.48], [0, 0.98, -0.05], [0, 1.06, 0.43]],
    { parent: hips, names: ["spineRear", "chest", "withers"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    [[0, 1.06, 0.40], [0, 1.28, 0.63], [0, 1.43, 0.84]],
    { parent: spine.tip!, names: ["neckBase", "neckUpper", "neckTip"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.43, 0.85],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.28, 0.89],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [-1, 1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.153, 1.585, 0.835],
      dir: [s * 0.13, 1, 0],
      role: "hinge",
    }),
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.97, -0.68],
      [0, 0.89, -0.98],
      [0, 0.74, -1.27],
      [0, 0.62, -1.54],
      [0, 0.59, -1.81],
    ]),
    { parent: hips, count: 5, role: "tail" },
  );

  const legSpecs = [
    { side: "FL", s: 1, front: true },
    { side: "FR", s: -1, front: true },
    { side: "HL", s: 1, front: false },
    { side: "HR", s: -1, front: false },
  ];

  const legs = legSpecs.map(({ side, s, front }) => {
    const x = s * (front ? 0.245 : 0.28);
    const z = front ? 0.56 : -0.57;
    const pts: P[] = front
      ? [
          [s * 0.215, 1.035, 0.415],
          [x, 0.57, 0.345],
          [x, 0.19, 0.48],
          [x, 0.095, z],
        ]
      : [
          [s * 0.23, 0.95, -0.515],
          [x, 0.61, -0.345],
          [x, 0.295, -0.715],
          [x, 0.095, z],
        ];

    const chain = b.chain(`leg${side}`, pts, {
      parent: front ? spine.tip! : hips,
      names: front
        ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `foot${side}`]
        : [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [x, 0, z + 0.055],
    });

    const toes = Array.from({ length: 4 }, (_, i) => {
      const dx = (i - 1.5) * 0.041;
      const forward = i === 1 || i === 2 ? 0.12 : 0.095;
      const start: P = [x + dx * 0.70, 0.069, z + 0.045];
      const end: P = [x + dx, 0.045, z + forward];
      const digit = b.chain(`toe${side}${i + 1}`, [start, end], {
        parent: chain.tip!,
        names: [`toe${side}${i + 1}`],
        role: "digit",
      });
      return { digit, end, i };
    });

    return { chain, toes, x, z, front, s, side, pts };
  });

  // --------------------------------------------------------------------------
  // Reusable primitive construction.
  // --------------------------------------------------------------------------
  function ellipsoid(
    name: string,
    at: P,
    scale: P,
    color: Coat,
    bone: Joint,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      name,
      at,
      scale,
      rotation,
      bone,
      flat: true,
    });
  }

  function blade(
    name: string,
    root: P,
    tip: P,
    width: number,
    thickness: number,
    color: Coat,
    bone: Joint,
    normal: P = [0, 0, 1],
  ) {
    const a = new THREE.Vector3(...root);
    const d = new THREE.Vector3(...tip).sub(a);
    const length = d.length();
    d.normalize();
    const n = new THREE.Vector3(...normal).normalize();
    const across = new THREE.Vector3().crossVectors(d, n).normalize();
    return b.extrude(
      [
        [-width * 0.44, 0],
        [-width * 0.55, length * 0.24],
        [-width * 0.23, length * 0.66],
        [0, length, "sharp"],
        [width * 0.36, length * 0.48],
        [width * 0.48, length * 0.05],
      ],
      {
        at: root,
        x: across,
        y: d,
        thickness: [thickness, 0.003],
        color,
        bone,
        name,
      },
    );
  }

  function lineFur(
    name: string,
    root: P,
    tip: P,
    width: number,
    color: Coat,
    bone: Joint,
  ) {
    return b.sweep([root, tip], [width, 0], {
      color,
      bone,
      name,
      sides: 5,
      smooth: false,
      caps: "flat",
    });
  }

  // --------------------------------------------------------------------------
  // Large silhouette: compact waist, heavy shoulder block, rising neck.
  // --------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.94, -0.72], w: 0.32, h: 0.40 },
      { at: [0, 0.94, -0.48], w: 0.49, h: 0.52 },
      { at: [0, 0.94, -0.13], w: 0.46, h: 0.49 },
      { at: [0, 0.99, 0.19], w: 0.57, h: 0.64 },
      { at: [0, 1.055, 0.43], w: 0.59, h: 0.66 },
      { at: [0, 1.12, 0.57], w: 0.40, h: 0.43 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "angularRibcage",
    },
  );

  b.sweep(neck, (t) => [0.255 - t * 0.075, 0.285 - t * 0.095], {
    color: coat,
    sides: 8,
    smooth: false,
    name: "raisedNeck",
  });

  const bib = ellipsoid(
    "silverThroat",
    [0, 1.11, 0.603],
    [0.224, 0.36, 0.155],
    pale,
    neck.joints[0],
    [24, 0, 0],
  );

  b.decal(bib, chestTexture, {
    at: [0, 1.11, 0.762],
    dir: [0, 0, 1],
    size: [0.30, 0.43],
    segments: 8,
    lift: 0.002,
    name: "throatFurBrushwork",
  });

  // A few broad planes reinforce the shoulder rather than smoothing it away.
  for (const s of [-1, 1]) {
    ellipsoid(
      `shoulderMass${s}`,
      [s * 0.225, 0.985, 0.36],
      [0.155, 0.27, 0.235],
      coat,
      spine.joints[1],
      [0, 0, s * -8],
    );
    ellipsoid(
      `haunchMass${s}`,
      [s * 0.235, 0.865, -0.48],
      [0.155, 0.255, 0.23],
      coat,
      hips,
      [-18, 0, s * -7],
    );
  }

  // --------------------------------------------------------------------------
  // Face, composed before the surrounding ruff.
  // --------------------------------------------------------------------------
  const skull = ellipsoid(
    "broadWolfSkull",
    [0, 1.465, 0.908],
    [0.231, 0.205, 0.233],
    headCoat,
    head,
  );

  // A long, tapered upper muzzle and an independent lower jaw.
  b.loft(
    [
      { at: [0, 1.365, 0.998], w: 0.30, h: 0.19 },
      { at: [0, 1.350, 1.105], w: 0.275, h: 0.175 },
      { at: [0, 1.335, 1.255], w: 0.195, h: 0.125 },
      { at: [0, 1.341, 1.315], w: 0.177, h: 0.105 },
    ],
    {
      bone: head,
      color: pale,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "upperMuzzle",
    },
  );

  b.loft(
    [
      { at: [0, 1.276, 0.94], w: 0.245, h: 0.105 },
      { at: [0, 1.257, 1.095], w: 0.228, h: 0.085 },
      { at: [0, 1.269, 1.285], w: 0.159, h: 0.06 },
    ],
    {
      bone: jaw,
      color: pale,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "lowerJaw",
    },
  );

  ellipsoid(
    "mouthInterior",
    [0, 1.292, 1.108],
    [0.117, 0.026, 0.179],
    C.mouth,
    jaw,
  );

  const nose = ellipsoid(
    "blackNose",
    [0, 1.348, 1.322],
    [0.108, 0.064, 0.071],
    C.nose,
    head,
  );

  b.decal(nose, noseTexture, {
    at: [0, 1.349, 1.393],
    dir: [0, 0, 1],
    size: [0.188, 0.105],
    segments: 7,
    lift: 0.002,
    name: "noseLeather",
  });

  blade(
    "foreheadDarkArrow",
    [0, 1.646, 0.948],
    [0, 1.437, 1.119],
    0.145,
    0.024,
    darkFur,
    head,
    [0, 0.7, 1],
  );

  blade(
    "foreheadSilverCrest",
    [0, 1.655, 0.952],
    [0, 1.49, 1.101],
    0.055,
    0.018,
    C.silver,
    head,
    [0, 0.7, 1],
  );

  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";

    const cheek = ellipsoid(
      `cheek${side}`,
      [s * 0.183, 1.367, 0.977],
      [0.108, 0.113, 0.124],
      pale,
      head,
    );

    const eye = ellipsoid(
      `eyeSocket${side}`,
      [s * 0.164, 1.482, 1.071],
      [0.080, 0.050, 0.031],
      C.deep,
      head,
      [0, s * 27, s * 8],
    );

    b.decal(eye, eyeTexture, {
      at: [s * 0.169, 1.483, 1.095],
      dir: [s * 0.43, 0.04, 1],
      size: [0.147, 0.077],
      segments: 7,
      mirror: s < 0,
      lift: 0.002,
      name: `amberEye${side}`,
    });

    // The heavy brow supplies the Warcraft silhouette without hiding the eye.
    b.sweep(
      [
        [s * 0.076, 1.533, 1.099],
        [s * 0.153, 1.545, 1.092],
        [s * 0.224, 1.522, 1.032],
      ],
      [0.029, 0.036, 0.011],
      {
        color: headCoat,
        bone: head,
        sides: 5,
        smooth: false,
        name: `heavyBrow${side}`,
      },
    );

    b.sweep(
      [
        [s * 0.112, 1.455, 1.108],
        [s * 0.17, 1.441, 1.095],
        [s * 0.224, 1.463, 1.049],
      ],
      [0.012, 0.014, 0.005],
      {
        color: C.silver,
        bone: head,
        sides: 5,
        smooth: false,
        name: `lowerEyeRim${side}`,
      },
    );

    b.sweep(
      [
        [s * 0.091, 1.295, 1.302],
        [s * 0.116, 1.293, 1.177],
        [s * 0.139, 1.308, 1.035],
        [s * 0.187, 1.327, 0.996],
      ],
      [0.006, 0.009, 0.010, 0.003],
      {
        bone: head,
        color: C.lip,
        sides: 5,
        name: `mouthSeam${side}`,
      },
    );

    b.decal(cheek, muzzleTexture, {
      at: [s * 0.254, 1.369, 1.039],
      dir: [s * 0.8, 0, 0.6],
      size: [0.133, 0.080],
      segments: 6,
      mirror: s < 0,
      lift: 0.002,
      name: `whiskerFollicles${side}`,
    });

    // A small visible canine, not a snarl.
    b.spike(
      [s * 0.112, 1.303, 1.132],
      [s * 0.108, 1.269, 1.145],
      null,
      0.010,
      { bone: head, color: C.tooth, sides: 5, name: `canine${side}` },
    );

    blade(
      `outerEyeMask${side}`,
      [s * 0.227, 1.49, 1.021],
      [s * 0.271, 1.36, 0.949],
      0.067,
      0.028,
      C.slate,
      head,
      [s * 0.7, 0, 0.8],
    );

    // Three broad cheek blades, rather than a noisy coat of small spikes.
    for (let i = 0; i < 3; i++) {
      const root: P = [s * (0.195 + i * 0.006), 1.405 - i * 0.052, 0.945 - i * 0.008];
      const tip: P = [s * (0.315 - i * 0.012), 1.368 - i * 0.074, 0.852 - i * 0.018];
      blade(
        `cheekRuff${side}${i}`,
        root,
        tip,
        0.115 - i * 0.012,
        0.05,
        i === 0 ? C.silver : pale,
        head,
        [s * 0.6, 0, 1],
      );
      blade(
        `cheekRuffInset${side}${i}`,
        [root[0], root[1] + 0.004, root[2] + 0.027],
        [tip[0] * 0.98, tip[1] + 0.017, tip[2] + 0.029],
        0.032,
        0.008,
        i === 0 ? C.gray : C.white,
        head,
        [s * 0.6, 0, 1],
      );
    }
  }

  // Tall pointed ears: dark outer rim, solid inner panel, then painted fur.
  for (let i = 0; i < ears.length; i++) {
    const s = i === 0 ? -1 : 1;
    const ear = ears[i];
    const side = s > 0 ? "L" : "R";
    const outline: [number, number][] = [
      [-0.086, 0],
      [-0.078, 0.11],
      [-0.024, 0.325],
      [0.006, 0.35],
      [0.091, 0.063],
      [0.082, -0.018],
    ];

    b.extrude(outline, {
      at: [s * 0.153, 1.585, 0.832],
      x: [s, 0, 0],
      y: [s * 0.08, 1, -0.06],
      thickness: [0.075, 0.023],
      color: darkFur,
      bone: ear,
      name: `earOuter${side}`,
    });

    const inner = b.extrude(
      [
        [-0.059, 0.025],
        [-0.051, 0.115],
        [-0.012, 0.295],
        [0.058, 0.075],
        [0.055, 0.018],
      ],
      {
        at: [s * 0.153, 1.585, 0.878],
        x: [s, 0, 0],
        y: [s * 0.08, 1, -0.06],
        thickness: 0.012,
        color: C.silver,
        bone: ear,
        name: `earInner${side}`,
      },
    );

    b.decal(inner, earTexture, {
      at: [s * 0.16, 1.737, 0.889],
      dir: [0, 0.06, 1],
      size: [0.113, 0.262],
      segments: 5,
      mirror: s < 0,
      lift: 0.002,
      name: `earFurDrawing${side}`,
    });

    for (let j = 0; j < 3; j++) {
      blade(
        `earRootTuft${side}${j}`,
        [s * (0.108 + j * 0.037), 1.598, 0.892],
        [s * (0.10 + j * 0.043), 1.677 + (j === 1 ? 0.025 : 0), 0.908],
        0.046,
        0.021,
        j === 1 ? pale : C.gray,
        ear,
      );
    }
  }

  // --------------------------------------------------------------------------
  // Legs and paws. Flat-bottomed toes establish all four ground contacts.
  // --------------------------------------------------------------------------
  for (const leg of legs) {
    const { chain, toes, x, z, front, side, s } = leg;

    b.sweep(chain, front ? [0.13, 0.092, 0.053, 0.057] : [0.155, 0.125, 0.058, 0.052], {
      color: coat,
      sides: 7,
      smooth: false,
      name: `legVolume${side}`,
    });

    const foot = chain.tip!;
    ellipsoid(
      `pawInstep${side}`,
      [x, 0.093, z + 0.021],
      [0.105, 0.075, 0.128],
      pale,
      foot,
    );

    b.part(new THREE.BoxGeometry(0.151, 0.021, 0.135), C.deep, {
      at: [x, 0.017, z + 0.035],
      bone: foot,
      name: `pawUnderside${side}`,
    });

    for (const { digit, end, i } of toes) {
      const bone = digit.joints[0];
      b.sweep(digit, () => [0.025, 0.033], {
        color: pale,
        sides: 6,
        smooth: false,
        name: `toeVolume${side}${i}`,
      });

      ellipsoid(
        `toeKnuckle${side}${i}`,
        [end[0], 0.05, end[2] - 0.012],
        [0.029, 0.042, 0.047],
        i === 0 || i === 3 ? C.silver : pale,
        bone,
      );

      b.spike(
        [end[0], 0.041, end[2] + 0.019],
        [end[0] + (i - 1.5) * 0.003, 0.021, end[2] + 0.064],
        null,
        0.012,
        {
          bone,
          color: C.claw,
          sides: 5,
          name: `claw${side}${i}`,
        },
      );
    }

    // Angular pale streaks on the front of the cannon bones.
    blade(
      `shinSilverPlane${side}`,
      [x, front ? 0.50 : 0.31, front ? 0.414 : -0.649],
      [x, 0.155, z + 0.036],
      front ? 0.079 : 0.058,
      0.018,
      pale,
      chain.joints[front ? 1 : 2],
    );

    if (front) {
      // A compact elbow feather at the rear of each foreleg.
      for (let j = 0; j < 3; j++) {
        blade(
          `elbowFeather${side}${j}`,
          [x + s * 0.025, 0.66 - j * 0.054, 0.30],
          [x + s * (0.065 + j * 0.008), 0.56 - j * 0.064, 0.225 - j * 0.015],
          0.09 - j * 0.01,
          0.039,
          j === 0 ? C.slate : C.gray,
          chain.joints[1],
          [s, 0, 0.25],
        );
      }
      ellipsoid(
        `carpalPad${side}`,
        [x, 0.236, 0.422],
        [0.035, 0.047, 0.024],
        C.charcoal,
        chain.joints[2],
      );
    } else {
      // Broad thigh fur gives the rear leg its powerful, bent silhouette.
      for (let j = 0; j < 4; j++) {
        blade(
          `haunchFeather${side}${j}`,
          [x + s * 0.085, 0.89 - j * 0.066, -0.50 - j * 0.018],
          [x + s * (0.09 - j * 0.008), 0.76 - j * 0.07, -0.70 - j * 0.019],
          0.14 - j * 0.016,
          0.043,
          j % 2 === 0 ? C.gray : C.silver,
          chain.joints[0],
          [s, 0, 0.15],
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // Signature ruff: large layered blades, rooted into the neck and shoulders.
  // --------------------------------------------------------------------------
  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";

    const outerRuff: { root: P; tip: P; w: number }[] = [
      { root: [s * 0.17, 1.49, 0.763], tip: [s * 0.29, 1.43, 0.574], w: 0.16 },
      { root: [s * 0.205, 1.405, 0.719], tip: [s * 0.36, 1.30, 0.48], w: 0.19 },
      { root: [s * 0.227, 1.31, 0.65], tip: [s * 0.415, 1.16, 0.385], w: 0.215 },
      { root: [s * 0.255, 1.21, 0.555], tip: [s * 0.435, 1.005, 0.285], w: 0.22 },
      { root: [s * 0.273, 1.105, 0.476], tip: [s * 0.412, 0.87, 0.235], w: 0.195 },
      { root: [s * 0.273, 0.995, 0.445], tip: [s * 0.366, 0.78, 0.282], w: 0.16 },
    ];

    outerRuff.forEach(({ root, tip, w }, i) => {
      const bone = i < 2 ? neck.joints[1] : neck.joints[0];
      blade(
        `ruffSilhouette${side}${i}`,
        root,
        tip,
        w,
        0.068,
        i < 2 ? C.charcoal : i % 2 === 0 ? C.gray : C.silver,
        bone,
        [s, 0.05, 0.45],
      );
      const r: P = [root[0] + s * 0.019, root[1] + 0.005, root[2] + 0.025];
      const t: P = [tip[0] - s * 0.017, tip[1] + 0.031, tip[2] + 0.024];
      blade(
        `ruffLightPlane${side}${i}`,
        r,
        t,
        w * 0.42,
        0.015,
        i < 2 ? C.slate : C.light,
        bone,
        [s, 0.05, 0.45],
      );
    });

    // Forward-facing second row makes the pale bib read as a single shield.
    for (let i = 0; i < 5; i++) {
      const root: P = [
        s * (0.115 + i * 0.015),
        1.35 - i * 0.098,
        0.735 - i * 0.029,
      ];
      const tip: P = [
        s * (0.23 + i * 0.012),
        1.185 - i * 0.095,
        0.715 - i * 0.045,
      ];
      blade(
        `bibEdge${side}${i}`,
        root,
        tip,
        0.125 + (i < 3 ? 0.018 : 0),
        0.044,
        i % 2 === 0 ? pale : C.light,
        neck.joints[0],
        [s * 0.2, 0, 1],
      );
    }

    // Flank fur remains sparse, preserving the clean torso underneath.
    for (let i = 0; i < 5; i++) {
      const z = 0.20 - i * 0.158;
      blade(
        `flankTuft${side}${i}`,
        [s * (0.274 - i * 0.006), 0.92 - i * 0.012, z],
        [s * (0.286 - i * 0.008), 0.78 - i * 0.011, z - 0.14],
        0.107,
        0.035,
        i % 2 === 0 ? C.gray : C.silver,
        i < 3 ? spine.joints[1] : hips,
        [s, 0, 0.15],
      );
    }

    // Small carved-looking shoulder accents run with the coat.
    for (let i = 0; i < 3; i++) {
      lineFur(
        `shoulderStroke${side}${i}`,
        [s * (0.297 + i * 0.014), 1.155 - i * 0.066, 0.324],
        [s * (0.31 + i * 0.015), 1.075 - i * 0.07, 0.204],
        0.015,
        C.charcoal,
        spine.joints[1],
      );
    }
  }

  // Central chest tips stay well above the feet.
  blade(
    "chestShieldPoint",
    [0, 1.015, 0.744],
    [0, 0.711, 0.62],
    0.19,
    0.05,
    pale,
    neck.joints[0],
  );
  blade(
    "chestShieldHighlight",
    [0, 0.998, 0.774],
    [0, 0.75, 0.662],
    0.067,
    0.012,
    C.white,
    neck.joints[0],
  );

  // The dark topline runs into a handful of swept-back shoulder hackles.
  for (let i = 0; i < 7; i++) {
    const z = 0.59 - i * 0.144;
    const y = i < 2 ? 1.395 - i * 0.07 : 1.272 - (i - 2) * 0.019;
    blade(
      `dorsalHackle${i}`,
      [0, y - 0.035, z],
      [0, y + (i < 3 ? 0.071 : 0.036), z - 0.205],
      i < 3 ? 0.17 : 0.13,
      0.055,
      i % 2 === 0 ? C.charcoal : C.slate,
      i < 2 ? neck.joints[0] : spine.joints[i < 5 ? 1 : 0],
      [0, 1, 0.2],
    );
  }

  // --------------------------------------------------------------------------
  // Tail: a substantial hanging brush, extended away from the hind legs.
  // --------------------------------------------------------------------------
  const tailTube = b.sweep(
    tail,
    (t) => {
      const r = t < 0.28
        ? 0.106 + t * 0.17
        : 0.155 * Math.pow((1 - t) / 0.72, 0.64) + 0.008;
      return [r, r * 0.91];
    },
    {
      color: tailCoat,
      sides: 7,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "heavyBrushTail",
    },
  );

  for (let i = 0; i < 7; i++) {
    const t = 0.16 + i * 0.105;
    const center = tail.at(t).at;
    const bone = tail.jointAt(t);
    const w = 0.15 * (1 - t * 0.55);
    for (const s of [-1, 1]) {
      const root: P = [
        center.x + s * (0.09 - t * 0.026),
        center.y + 0.014,
        center.z,
      ];
      const tip: P = [
        center.x + s * (0.15 - t * 0.07),
        center.y - 0.065,
        center.z - 0.20 + t * 0.06,
      ];
      blade(
        `tailSideBlade${s}_${i}`,
        root,
        tip,
        w,
        0.035,
        t > 0.68 ? C.charcoal : i % 2 === 0 ? C.gray : C.silver,
        bone,
        [s, 0.3, 0.2],
      );
    }
    const upper = tailTube.at(t, 0);
    const p = upper.at;
    blade(
      `tailTopBlade${i}`,
      [p.x, p.y - 0.012, p.z + 0.015],
      [p.x, p.y - 0.031, p.z - 0.20],
      w * 0.82,
      0.027,
      t > 0.65 ? C.deep : C.slate,
      bone,
      [0, 1, 0],
    );
  }

  // A restrained scattering of broad fur slashes, seated on the actual ribs.
  const flankSurface = b.surface(torso);
  const marks = flankSurface.scatter(18, {
    rng: random,
    minDist: 0.11,
    filter: (h) => Math.abs(h.n.x) > 0.78 && h.at.y > 0.91 && h.at.z < 0.15,
  });
  for (let i = 0; i < marks.length; i++) {
    b.stick(
      new THREE.ConeGeometry(0.016, 0.075, 3),
      i % 3 === 0 ? C.silver : C.slate,
      marks[i],
      {
        scale: [1, 0.17, 1.7],
        flow: [0, -0.25, -1],
        embed: 0.45,
        name: `coatFacet${i}`,
      },
    );
  }

  return b.root;
}
