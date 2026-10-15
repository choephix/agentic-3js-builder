import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  frame,
  rng,
  paint,
  mix,
  noise,
  grain,
  svg,
} from "../../../../src/index";
import type { Joint, Fill, PointInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bogfang, Keeper of the Drowned Bones",
  description:
    "A massive, hand-built swamp troll with swept tusks, a vermilion mohawk, ritual scars, carved bone fetishes and an animal-skull shoulder guard. Rigged in a neutral, open-handed stance on a small marsh island.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Bogfang", paintSize: 2048 });
  const random = rng(72041);

  // Deep blue-green flesh, hot hair, ivory trophies and cold, dark leather.
  const C = {
    skin: "#398c78",
    light: "#66a888",
    dark: "#214f50",
    crease: "#193d40",
    lip: "#396962",
    mouth: "#182c32",
    gum: "#785252",
    ivory: "#ead6a5",
    boneLight: "#ffedbd",
    boneDark: "#a18a59",
    leather: "#342e35",
    leatherEdge: "#685044",
    wrap: "#a98b62",
    wrapLight: "#cbb789",
    brass: "#ba843a",
    gold: "#e7bb62",
    rust: "#a42d27",
    hair: "#d74a2d",
    hairLight: "#f4843c",
    hairDark: "#622d31",
    ink: "#172d32",
    teal: "#54c7b5",
    water: "#214c48",
    mud: "#343c32",
  };

  const SKIN = paint((p, n) => {
    const field = noise(p, 0.19, 8);
    const lit = Math.max(0, n.y * 0.55 + n.z * 0.25 + n.x * 0.16);
    let col = mix("#306e66", "#559b7d", 0.26 + lit * 0.64 + field * 0.18);
    if (p.y < 0.48) col = mix(col, "#3b544b", (0.48 - p.y) * 1.4);
    return col;
  });
  const FACE = paint((p, n) =>
    mix("#397b6c", "#75ab85", 0.25 + Math.max(0, n.y) * 0.36 + noise(p, 0.12, 9) * 0.22),
  );
  const BONE = paint((p, n) =>
    mix("#a28c61", "#f1dfad", 0.45 + n.y * 0.2 + noise(p, 0.08, 32) * 0.27),
  );
  const LEATHER = grain("#292b32", "#4c3b3b", { size: 0.018, axis: "y", seed: 4 });
  const WOOD = grain("#3c3b2c", "#686044", { size: 0.024, axis: "y", seed: 11 });
  const MUD = paint((p, n) =>
    mix("#283735", "#535943", noise(p, 0.22, 5) * 0.65 + Math.max(n.y, 0) * 0.2),
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 160 96">
      <path d="M5 48 Q35 7 88 16 Q128 19 155 43 Q132 84 75 82 Q27 78 5 48Z" fill="#142d31"/>
      <path d="M16 48 Q48 27 88 29 Q122 30 143 44 Q123 69 80 69 Q40 67 16 48Z" fill="#e6c681"/>
      <ellipse cx="83" cy="48" rx="25" ry="29" fill="#e88322"/>
      <ellipse cx="83" cy="53" rx="19" ry="22" fill="#ffc94f"/>
      <path d="M83 23 Q70 46 83 76 Q96 46 83 23Z" fill="#192e2e"/>
      <circle cx="73" cy="37" r="7" fill="#fff5c5"/>
      <path d="M11 45 Q63 16 148 40" fill="none" stroke="#183c3b" stroke-width="9"/>
      <path d="M28 74 Q82 90 132 67" fill="none" stroke="#7caf89" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const tattooTexture = svg(
    `<svg viewBox="0 0 160 200">
      <g fill="none" stroke="#a8d8ba" stroke-width="9" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M80 12 L120 45 L80 78 L40 45Z"/>
        <path d="M80 35 L94 46 L80 58 L66 46Z"/>
        <path d="M23 77 L51 98 L23 119 M137 77 L109 98 L137 119"/>
        <path d="M80 84 L80 164 M49 130 L80 160 L111 130 M57 167 L80 190 L103 167"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const clothTexture = svg(
    `<svg viewBox="0 0 240 360">
      <rect width="240" height="360" fill="#753a35"/>
      <path d="M0 12H240 M0 346H240" stroke="#b56b44" stroke-width="14"/>
      <path d="M18 0V360 M222 0V360" stroke="#e2bc76" stroke-width="7"/>
      <path d="M35 0V360 M205 0V360" stroke="#2c393b" stroke-width="9"/>
      <g fill="none" stroke="#ddbc81" stroke-width="9">
        <path d="M120 65 L170 120 L120 177 L70 120Z"/>
        <path d="M120 92 L143 120 L120 147 L97 120Z"/>
        <path d="M80 188L120 229L160 188 M80 226L120 267L160 226"/>
      </g>
      <path d="M120 168V302 M83 289L120 322L157 289" stroke="#202f32" stroke-width="10" fill="none"/>
      <path d="M52 24H188 M52 334H188" stroke="#e2bc76" stroke-width="5" stroke-dasharray="9 10"/>
      <g stroke="#a45b44" stroke-width="3" opacity=".6">
        <path d="M45 8L50 350 M63 0L59 360 M180 0L186 360 M195 0L191 360"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const charmTexture = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M40 12V142 M18 34L40 54L62 34 M17 90L40 70L63 90 M19 116L40 136L61 116"
       fill="none" stroke="#734b32" stroke-width="7"/>
      <path d="M40 17V136" stroke="#a76c41" stroke-width="2" fill="none"/>
      <circle cx="40" cy="70" r="9" fill="#344c48"/>
    </svg>`,
    { size: 256 },
  );

  const scarTexture = svg(
    `<svg viewBox="0 0 180 100">
      <path d="M14 81L162 13" stroke="#25524d" stroke-width="13"/>
      <path d="M14 76L162 8" stroke="#a4ba8d" stroke-width="5"/>
      <g stroke="#b0b68b" stroke-width="5">
        <path d="M43 50L53 75 M70 37L80 62 M98 24L108 49 M125 12L135 37"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 120 160">
      <g fill="none" stroke="#72c5a8" stroke-width="8">
        <path d="M60 17L92 50L60 84L28 50Z M60 83V144 M34 112L60 137L86 112"/>
      </g>
      <path d="M60 33L76 50L60 67L44 50Z" fill="#a3e5bd"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first: the two long fingers and opposed thumb are individually rigged.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.24, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 1.24, 0],
      [0, 1.59, -0.035],
      [0, 1.94, -0.07],
      [0, 2.15, -0.015],
    ],
    { parent: hips, names: ["spine1", "chest", "spineUpper", "neckBase"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 2.12, -0.015],
      [0, 2.36, 0.105],
    ],
    { parent: spine.joints[2], names: ["neck", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 2.55, 0.14],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.35, 0.13],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const H = b.region({ at: head, scale: 1.05, bone: head });
  const hp = (x: number, y: number, z: number) => H.p([x, y, z]);

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.49, 2.02, -0.07],
        [s * 0.99, 1.94, -0.035],
        [s * 1.4, 1.88, 0.005],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!,
      at: [s * 1.48, 1.865, 0.025],
      dir: [s, -0.05, 0],
      role: "arm",
    });
    const fingers = [-1, 1].map((f, i) =>
      b.chain(
        `finger${side}${i + 1}`,
        [
          [s * 1.59, 1.865, 0.025 + f * 0.105],
          [s * 1.79, 1.85, 0.025 + f * 0.14],
          [s * 1.94, 1.82, 0.025 + f * 0.18],
        ],
        { parent: hand, role: "digit", count: 2 },
      ),
    );
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 1.46, 1.81, 0.12],
        [s * 1.53, 1.66, 0.24],
        [s * 1.68, 1.62, 0.29],
      ],
      { parent: hand, count: 2, role: "digit" },
    );
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.265, 1.25, 0],
        [s * 0.405, 0.79, 0.11],
        [s * 0.40, 0.34, -0.015],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.40, 0.125, 0.18],
      },
    );
    const foot = b.joint(`foot${side}`, {
      parent: leg.tip!,
      at: [s * 0.40, 0.255, 0.075],
      dir: [0, 0, 1],
      role: "leg",
    });
    const toes = [-1, 1].map((f, i) =>
      b.chain(
        `toe${side}${i + 1}`,
        [
          [s * 0.40 + f * 0.105, 0.24, 0.20],
          [s * 0.40 + f * 0.125, 0.225, 0.43],
          [s * 0.40 + f * 0.13, 0.22, 0.51],
        ],
        { parent: foot, count: 2, role: "digit" },
      ),
    );
    return { s, side, arm, hand, fingers, thumb, leg, foot, toes };
  });

  // Small helpers keep every primitive attached to the intended bone.
  function ell(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at,
      scale: size,
      bone,
      rotation,
      flat: true,
      name,
    });
  }
  function box(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint,
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
  function rod(a: PointInput, c: PointInput, radius: number, color: Fill, bone: Joint, name: string) {
    return b.rod(a, c, radius, { color, bone, sides: 6, name });
  }
  function ring(
    at: PointInput,
    radius: number,
    tube: number,
    color: Fill,
    bone: Joint,
    normal: number[] = [0, 0, 1],
    name = "ring",
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 12), color, {
      at,
      bone,
      dir: normal,
      axis: "z",
      name,
    });
  }
  function bead(at: PointInput, radius: number, color: Fill, bone: Joint, name = "bead") {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, { at, bone, name });
  }
  function cord(points: number[][], radius: number, bone: Joint, name = "trophyCord") {
    return b.sweep(catmull(points), radius, {
      color: C.leatherEdge,
      bone,
      sides: 5,
      name,
    });
  }
  function fang(
    points: PointInput[],
    radius: number,
    bone: Joint,
    name: string,
    color: Fill = BONE,
  ) {
    return b.sweep(catmull(points), [radius, radius * 0.83, radius * 0.40, 0], {
      color,
      bone,
      sides: 7,
      smooth: false,
      caps: "flat",
      name,
    });
  }
  function littleBone(a: number[], c: number[], r: number, bone: Joint, name: string) {
    rod(a, c, r * 0.60, BONE, bone, `${name}shaft`);
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]).normalize();
    const lateral = new THREE.Vector3(d.y, -d.x, 0).normalize().multiplyScalar(r * 0.52);
    for (const p of [a, c]) {
      for (const s of [-1, 1]) {
        bead(
          [p[0] + lateral.x * s, p[1] + lateral.y * s, p[2]],
          r,
          BONE,
          bone,
          `${name}knuckle`,
        );
      }
    }
  }
  function texturedPlane(
    at: PointInput,
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    name: string,
    normal: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone,
      dir: normal,
      axis: "z",
      texture,
      name,
    });
  }

  // Torso: a narrow waist, huge chest and forward-loaded neck.
  const torso = b.loft(
    [
      { at: [0, 1.17, 0], w: 0.53, h: 0.39 },
      { at: [0, 1.39, -0.015], w: 0.57, h: 0.41 },
      { at: [0, 1.65, -0.04], w: 0.73, h: 0.48 },
      { at: [0, 1.91, -0.065], w: 1.04, h: 0.56 },
      { at: [0, 2.08, -0.035], w: 0.81, h: 0.49 },
      { at: [0, 2.18, 0], w: 0.41, h: 0.36 },
    ],
    { bone: spine, color: SKIN, sides: 8, smooth: false, caps: "flat", name: "taperedTorso" },
  );
  b.sweep(neck, [0.235, 0.205], {
    color: SKIN,
    sides: 8,
    smooth: false,
    name: "powerfulNeck",
  });

  for (const s of [-1, 1]) {
    ell([s * 0.26, 1.91, 0.165], [0.285, 0.17, 0.15], SKIN, spine.joints[1], "pectoral", [0, 0, s * 9]);
    ell([s * 0.24, 2.09, -0.105], [0.30, 0.15, 0.23], SKIN, spine.joints[2], "trapezius", [0, 0, -s * 13]);
    ell([s * 0.26, 1.60, -0.02], [0.15, 0.26, 0.22], SKIN, spine.joints[0], "latissimus");
    for (let i = 0; i < 2; i++) {
      ell([s * 0.105, 1.70 - i * 0.19, 0.17], [0.115, 0.10, 0.07], SKIN, spine.joints[0], "abdominal");
    }
  }
  b.decal(torso, scarTexture, {
    at: [0.22, 1.90, 0.27],
    dir: [0, 0, 1],
    size: [0.36, 0.17],
    bone: spine.joints[1],
    name: "oldChestScar",
  });

  // Face: large planar cheek masses and an exceptionally long troll nose.
  const skull = ell(hp(0, 0.025, -0.035), [0.37, 0.35, 0.29], SKIN, head, "broadSkull");
  ell(hp(0, -0.07, 0.17), [0.285, 0.235, 0.18], FACE, head, "upperFace");
  for (const s of [-1, 1]) {
    ell(hp(s * 0.265, -0.06, 0.13), [0.145, 0.19, 0.145], FACE, head, "highCheekbone", [0, s * 12, -s * 14]);
    b.frustumBox(
      hp(s * 0.26, -0.085, 0.22),
      hp(s * 0.30, -0.19, 0.20),
      [0.15, 0.10],
      [0.10, 0.07],
      { color: SKIN, bone: head, name: "angularCheek" },
    );

    const eyeAt = hp(s * 0.171, 0.055, 0.252);
    ell(eyeAt, [0.132, 0.087, 0.057], C.dark, head, "deepEyeSocket");
    texturedPlane(
      hp(s * 0.171, 0.055, 0.306),
      0.211,
      0.124,
      eyeTexture,
      head,
      "goldenTrollEye",
      [s * 0.12, 0, 1],
    );
    b.sweep(
      [
        hp(s * 0.065, 0.145, 0.27),
        hp(s * 0.19, 0.162, 0.284),
        hp(s * 0.295, 0.12, 0.21),
      ],
      [0.064, 0.078, 0.044],
      { color: SKIN, bone: head, section: { ngon: 5 }, caps: "flat", name: "heavyBrow" },
    );
    rod(hp(s * 0.115, -0.035, 0.31), hp(s * 0.27, -0.05, 0.28), 0.011, C.light, head, "lowerLid");
  }

  b.loft(
    [
      { at: hp(0, 0.155, 0.205), w: 0.13, h: 0.12 },
      { at: hp(0, 0.025, 0.33), w: 0.15, h: 0.15 },
      { at: hp(0, -0.115, 0.425), w: 0.19, h: 0.165 },
      { at: hp(0, -0.18, 0.44), w: 0.135, h: 0.115 },
    ],
    { color: FACE, bone: head, sides: 6, smooth: false, caps: "flat", name: "longHookedNose" },
  );
  for (const s of [-1, 1]) {
    ell(hp(s * 0.099, -0.13, 0.353), [0.078, 0.061, 0.068], SKIN, head, "nostrilWing");
    ell(hp(s * 0.091, -0.161, 0.401), [0.037, 0.021, 0.014], C.crease, head, "nostril");
  }

  // Upper lip and lower jaw are distinct objects on distinct joints.
  ell(hp(0, -0.215, 0.255), [0.27, 0.054, 0.11], C.lip, head, "upperLip");
  ell([0, 2.306, 0.40], [0.268, 0.035, 0.11], C.mouth, jaw, "mouthInterior");
  ell([0, 2.245, 0.325], [0.285, 0.128, 0.205], SKIN, jaw, "heavyLowerJaw");
  ell([0, 2.286, 0.435], [0.235, 0.044, 0.075], C.lip, jaw, "lowerLip");
  ell([0, 2.19, 0.385], [0.155, 0.068, 0.13], FACE, jaw, "squareChin");

  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.ConeGeometry(0.024, 0.052, 5), BONE, {
        at: [s * (0.047 + i * 0.055), 2.318, 0.473],
        bone: jaw,
        name: "smallLowerTooth",
      });
    }
    ell([s * 0.246, 2.29, 0.411], [0.097, 0.062, 0.092], C.gum, jaw, "tuskGum");
    fang(
      [
        [s * 0.245, 2.27, 0.419],
        [s * 0.365, 2.36, 0.56],
        [s * 0.415, 2.55, 0.59],
        [s * 0.395, 2.75, 0.52],
      ],
      0.095,
      jaw,
      "greatUpturnedTusk",
    );
    b.sweep(
      [
        [s * 0.275, 2.295, 0.453],
        [s * 0.306, 2.312, 0.492],
      ],
      0.096,
      { color: C.brass, bone: jaw, sides: 8, caps: "flat", name: "tuskFerrule" },
    );
    bead([s * 0.288, 2.301, 0.544], 0.019, C.gold, jaw, "tuskFerruleStud");
  }

  // Swept, blade-like ears, with inset membranes and heavy ritual earrings.
  for (const s of [-1, 1]) {
    const earOutline: [number, number][] = [
      [0, -0.10],
      [0.20, -0.08],
      [0.48, 0.22],
      [0.23, 0.17],
      [0.02, 0.11],
    ];
    b.extrude(earOutline, {
      at: hp(s * 0.29, 0.055, -0.045),
      x: [s, 0, -0.24],
      y: [0, 1, 0],
      thickness: 0.075,
      color: SKIN,
      bone: head,
      name: "longSweptEar",
    });
    b.extrude(
      [
        [0.055, -0.052],
        [0.19, -0.027],
        [0.382, 0.164],
        [0.20, 0.106],
        [0.065, 0.075],
      ],
      {
        at: hp(s * 0.29, 0.055, -0.001),
        x: [s, 0, -0.24],
        y: [0, 1, 0],
        thickness: 0.012,
        color: C.dark,
        bone: head,
        name: "earInset",
      },
    );
    rod(hp(s * 0.34, 0.015, 0.003), hp(s * 0.67, 0.20, -0.07), 0.018, C.light, head, "earRidge");
    ring(hp(s * 0.52, -0.075, -0.07), 0.075, 0.016, C.brass, head, [0, 0, 1], "earring");
    bead(hp(s * 0.52, -0.151, -0.065), 0.028, C.teal, head, "earringBead");
    fang(
      [
        hp(s * 0.52, -0.17, -0.065),
        hp(s * 0.54, -0.24, -0.055),
        hp(s * 0.51, -0.32, -0.025),
        hp(s * 0.48, -0.36, 0),
      ],
      0.031,
      head,
      "earToothPendant",
    );
  }

  // A few scars and warts, rather than a noisy full-body surface.
  b.decal(skull, scarTexture, {
    at: hp(-0.24, 0.22, 0.18),
    dir: [-0.25, 0.1, 1],
    size: [0.18, 0.09],
    roll: -47,
    name: "templeScar",
    bone: head,
  });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      bead(hp(s * (0.285 + i * 0.014), -0.115 + i * 0.054, 0.221 - i * 0.017), 0.014 + i * 0.003, C.light, head, "cheekWart");
    }
  }

  // The mohawk is a solid dark silhouette, then broad, sharp overlapping blades.
  b.sweep(
    catmull([
      hp(0, 0.275, 0.16),
      hp(0, 0.352, -0.015),
      hp(0, 0.30, -0.23),
      hp(0, 0.16, -0.32),
    ]),
    (t) => [0.095 - t * 0.023, 0.073],
    { color: C.hairDark, bone: head, sides: 6, caps: "flat", name: "mohawkRoot" },
  );
  for (let i = 0; i < 7; i++) {
    const z = 0.18 - i * 0.079;
    const y = 0.282 + Math.sin((i / 7) * Math.PI) * 0.045 - Math.max(0, i - 4) * 0.038;
    const height = 0.26 + Math.sin((i / 7) * Math.PI) * 0.16;
    b.extrude(
      [
        [-0.07, 0],
        [0.067, 0.012],
        [0.115, height * 0.43],
        [0.17, height],
        [0.027, height * 0.77],
        [-0.047, height * 0.32],
      ],
      {
        at: hp(0, y, z),
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.15, 0.045],
        color: i % 2 ? C.hair : C.rust,
        bone: head,
        name: "mohawkBlade",
      },
    );
    for (const s of [-1, 1]) {
      b.slab(
        [
          hp(s * 0.077, y + 0.025, z - 0.01),
          hp(s * 0.025, y + height * 0.91, z - 0.15),
          hp(s * 0.064, y + height * 0.39, z - 0.07),
        ],
        { thickness: 0.008, color: i % 2 ? C.hairLight : C.hair, bone: head, name: "mohawkHighlight" },
      );
    }
  }

  // Two small chin braids tied off with carved ivory, not a full beard.
  for (const s of [-1, 1]) {
    const braid = catmull([
      [s * 0.082, 2.19, 0.415],
      [s * 0.094, 2.075, 0.43],
      [s * 0.10, 1.99, 0.405],
    ]);
    b.sweep(braid, [0.033, 0.022], { color: C.hairDark, bone: jaw, sides: 6, name: "chinBraid" });
    for (let k = 0; k < 4; k++) {
      ell([s * 0.092, 2.16 - k * 0.037, 0.43], [0.035, 0.024, 0.03], k % 2 ? C.hair : C.rust, jaw, "braidKnot", [0, 0, s * 20]);
    }
    b.part(new THREE.CylinderGeometry(0.034, 0.029, 0.046, 7), BONE, {
      at: [s * 0.10, 2.002, 0.409],
      bone: jaw,
      name: "braidIvoryTie",
    });
  }

  // Arms, hands and sturdy, slightly bowed legs.
  for (const L of limbs) {
    const { s, side, arm, hand, fingers, thumb, leg, foot, toes } = L;
    b.sweep(arm, [0.205, 0.225, 0.16, 0.12], {
      color: SKIN,
      sides: 8,
      smooth: false,
      name: `armSkin${side}`,
    });
    ell([s * 0.57, 2.015, -0.06], [0.245, 0.245, 0.255], SKIN, arm.joints[0], "deltoid");
    ell([s * 0.82, 1.96, 0.02], [0.255, 0.185, 0.18], SKIN, arm.joints[0], "bicep", [0, 0, -s * 8]);
    ell([s * 1.015, 1.945, -0.04], [0.145, 0.145, 0.17], C.skin, arm.joints[1], "elbow");
    ell([s * 1.205, 1.91, 0.014], [0.215, 0.14, 0.145], SKIN, arm.joints[1], "forearm", [0, 0, -s * 8]);
    ell([s * 1.51, 1.865, 0.035], [0.185, 0.11, 0.19], SKIN, hand, "hugePalm");

    for (let i = 0; i < fingers.length; i++) {
      const digit = fingers[i];
      b.sweep(digit, [0.074, 0.061, 0.042], {
        color: SKIN,
        sides: 7,
        smooth: false,
        name: "longFinger",
      });
      ell(digit.at(0.55), [0.069, 0.067, 0.071], SKIN, digit.joints[1], "fingerKnuckle");
      const f = i === 0 ? -1 : 1;
      b.part(new THREE.SphereGeometry(1, 7, 5), C.boneDark, {
        at: [s * 1.895, 1.858, 0.025 + f * 0.17],
        scale: [0.066, 0.015, 0.041],
        bone: digit.joints[1],
        flat: true,
        name: "bluntFingerNail",
      });
    }
    b.sweep(thumb, [0.076, 0.062, 0.04], {
      color: SKIN,
      sides: 7,
      smooth: false,
      name: "opposedThumb",
    });
    ell([s * 1.653, 1.66, 0.286], [0.048, 0.016, 0.037], C.boneDark, thumb.joints[1], "thumbNail");

    b.sweep(leg, [0.235, 0.22, 0.17, 0.115], {
      color: SKIN,
      sides: 8,
      smooth: false,
      name: `legSkin${side}`,
    });
    ell([s * 0.335, 1.05, 0.025], [0.225, 0.28, 0.24], SKIN, leg.joints[0], "thigh");
    ell([s * 0.405, 0.79, 0.15], [0.175, 0.14, 0.145], FACE, leg.joints[1], "kneecap");
    ell([s * 0.397, 0.59, -0.03], [0.155, 0.23, 0.17], SKIN, leg.joints[1], "calf");
    ell([s * 0.40, 0.255, 0.09], [0.24, 0.13, 0.25], SKIN, foot, "broadBareFoot");
    for (let i = 0; i < toes.length; i++) {
      b.sweep(toes[i], [0.102, 0.095, 0.069], {
        color: SKIN,
        sides: 8,
        smooth: false,
        name: "twoToedFootDigit",
      });
      const f = i === 0 ? -1 : 1;
      ell([s * 0.40 + f * 0.129, 0.274, 0.468], [0.071, 0.028, 0.081], C.boneDark, toes[i].joints[1], "broadToenail");
    }

    // Layered wrist bindings; bone plates on one forearm, red cloth on the other.
    for (let k = 0; k < 5; k++) {
      const t = 0.68 + k * 0.053;
      const p = arm.at(t);
      b.part(new THREE.CylinderGeometry(0.148 - k * 0.006, 0.148 - k * 0.006, 0.046, 8), k % 2 ? C.wrap : C.wrapLight, {
        at: p,
        bone: arm.joints[1],
        dir: p.tangent,
        name: "wristBinding",
      });
    }
    for (let k = 0; k < 4; k++) {
      const y = 0.37 + k * 0.056;
      b.part(new THREE.CylinderGeometry(0.14 + k * 0.006, 0.134 + k * 0.006, 0.047, 8), k % 2 ? C.wrap : C.wrapLight, {
        at: [s * 0.40, y, 0.002 - k * 0.008],
        bone: leg.joints[1],
        name: "ankleBinding",
      });
    }
    if (s > 0) {
      for (let i = 0; i < 3; i++) {
        const z = -0.08 + i * 0.085;
        b.frustumBox([1.14, 1.972, z], [1.35, 1.957, z], [0.07, 0.042], [0.055, 0.035], {
          color: BONE,
          bone: arm.joints[1],
          name: "forearmBoneSplint",
        });
      }
      littleBone([0.325, 0.39, 0.14], [0.32, 0.62, 0.14], 0.028, leg.joints[1], "shinTrophy");
    } else {
      const skin = b.surface([arm.joints[0]]);
      b.decal(skin, tattooTexture, {
        at: [-0.77, 1.99, 0.18],
        dir: [0, 0, 1],
        size: [0.21, 0.27],
        roll: -80,
        bone: arm.joints[0],
        name: "armWarpaint",
      });
    }
  }

  // Wraparound leather skirt, with individual overlapping panels.
  const beltY = 1.34;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const next = a + Math.PI * 2 / 10;
    const y = 0.93 + (i % 3) * 0.045;
    const topR = 0.325;
    const bottomR = 0.42;
    b.slab(
      [
        [Math.sin(a) * topR, 1.32, Math.cos(a) * 0.245],
        [Math.sin(next) * topR, 1.32, Math.cos(next) * 0.245],
        [Math.sin(next) * bottomR, y + 0.035, Math.cos(next) * 0.30],
        [Math.sin((a + next) / 2) * (bottomR + 0.015), y - 0.03, Math.cos((a + next) / 2) * 0.31],
        [Math.sin(a) * bottomR, y + 0.03, Math.cos(a) * 0.30],
      ],
      {
        color: i % 2 ? LEATHER : C.leatherEdge,
        thickness: 0.026,
        bone: hips,
        name: "overlappingLeatherKilt",
      },
    );
  }
  const beltPath = catmull(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [Math.sin(a) * 0.34, beltY, Math.cos(a) * 0.25];
    }),
    { closed: true },
  );
  b.sweep(beltPath, () => [0.071, 0.032], {
    color: LEATHER,
    bone: hips,
    section: "box",
    name: "wideLeatherBelt",
  });
  for (const y of [1.287, 1.394]) {
    b.sweep(
      catmull(
        Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return [Math.sin(a) * 0.353, y, Math.cos(a) * 0.269];
        }),
        { closed: true },
      ),
      0.009,
      { color: C.wrap, bone: hips, sides: 5, name: "beltStitchEdge" },
    );
  }
  b.along(
    beltPath,
    14,
    (p) => bead([p.at.x * 1.045, p.at.y, p.at.z * 1.09], 0.019, C.brass, hips, "beltStud"),
  );

  b.extrude(
    [
      [-0.175, 0.21],
      [0.175, 0.21],
      [0.16, -0.20],
      [0.08, -0.32],
      [-0.035, -0.35],
      [-0.155, -0.24],
    ],
    {
      at: [0, 1.08, 0.343],
      x: [1, 0, 0],
      thickness: 0.03,
      color: C.rust,
      bone: hips,
      name: "frontRitualTabard",
    },
  );
  texturedPlane([0, 1.045, 0.361], 0.295, 0.45, clothTexture, hips, "wovenTabardPattern");
  for (const s of [-1, 1]) {
    cord(
      [
        [s * 0.151, 1.27, 0.365],
        [s * 0.144, 1.00, 0.367],
        [s * 0.115, 0.82, 0.365],
      ],
      0.01,
      hips,
      "tabardBoundEdge",
    );
  }
  for (let i = 0; i < 5; i++) {
    const x = -0.10 + i * 0.05;
    rod([x, 0.84, 0.35], [x + 0.008, 0.735 + Math.abs(i - 2) * 0.023, 0.35], 0.012, C.wrap, hips, "tabardFringe");
    bead([x, 0.79, 0.35], 0.018, C.brass, hips, "fringeBead");
  }

  // A miniature skull assembly, used for a belt buckle and a hanging fetish.
  function smallSkull(at: number[], scale: number, bone: Joint, name: string) {
    const p = (x: number, y: number, z: number) =>
      [at[0] + x * scale, at[1] + y * scale, at[2] + z * scale];
    ell(p(0, 0.025, 0), [0.095 * scale, 0.105 * scale, 0.064 * scale], BONE, bone, `${name}cranium`);
    box(p(0, -0.066, 0.025), [0.10 * scale, 0.065 * scale, 0.07 * scale], BONE, bone, `${name}maxilla`);
    for (const s of [-1, 1]) {
      ell(p(s * 0.04, 0.015, 0.057), [0.03 * scale, 0.035 * scale, 0.012 * scale], C.ink, bone, `${name}eyeSocket`, [0, 0, s * 18]);
      for (let i = 0; i < 2; i++) {
        box(p(s * (0.014 + i * 0.023), -0.103, 0.042), [0.017 * scale, 0.034 * scale, 0.026 * scale], C.boneLight, bone, `${name}tooth`);
      }
    }
    b.slab(
      [p(0, -0.018, 0.073), p(-0.016, -0.045, 0.071), p(0.016, -0.045, 0.071)],
      { color: C.ink, bone, thickness: 0.005, name: `${name}noseHole` },
    );
  }
  smallSkull([0, 1.35, 0.309], 1.1, hips, "beltSkull");

  // Necklace: a heavy dark rope and graduated teeth.
  const necklace = catmull([
    [-0.26, 2.20, 0.04],
    [-0.28, 2.075, 0.22],
    [-0.19, 1.965, 0.30],
    [0, 1.915, 0.33],
    [0.19, 1.965, 0.30],
    [0.28, 2.075, 0.22],
    [0.26, 2.20, 0.04],
  ]);
  b.sweep(necklace, 0.025, { color: C.leather, bone: spine.joints[1], sides: 6, name: "toothNecklaceCord" });
  b.along(
    necklace,
    9,
    (f) => {
      const p = f.at;
      bead(p, 0.034, C.brass, spine.joints[1], "necklaceSpacer");
      const length = 0.10 + 0.055 * (1 - Math.abs(p.x) / 0.3);
      fang(
        [
          [p.x, p.y - 0.018, p.z + 0.01],
          [p.x * 1.04, p.y - length * 0.45, p.z + 0.035],
          [p.x * 1.07, p.y - length * 0.8, p.z + 0.023],
          [p.x * 1.06, p.y - length, p.z + 0.005],
        ],
        0.028,
        spine.joints[1],
        "necklaceTooth",
      );
    },
    { from: 0.13, to: 0.87 },
  );

  // One shoulder wears a bog-beast skull over a strapped hide pad.
  const shoulderL = limbs[0].arm.joints[0];
  ell([0.60, 2.14, -0.085], [0.33, 0.13, 0.31], LEATHER, shoulderL, "shoulderHidePad");
  b.sweep(
    catmull([
      [0.43, 2.17, 0.14],
      [0.65, 2.23, 0.17],
      [0.86, 2.13, 0.13],
      [0.83, 2.05, -0.22],
      [0.58, 2.19, -0.32],
    ]),
    0.025,
    { color: C.wrap, bone: shoulderL, sides: 6, name: "pauldronBoundEdge" },
  );
  ell([0.61, 2.235, -0.065], [0.245, 0.19, 0.26], BONE, shoulderL, "bogBeastSkull");
  b.frustumBox([0.61, 2.24, 0.09], [0.61, 2.12, 0.36], [0.27, 0.20], [0.16, 0.11], {
    color: BONE,
    bone: shoulderL,
    name: "beastLongMuzzle",
  });
  for (const s of [-1, 1]) {
    ell([0.61 + s * 0.13, 2.265, 0.15], [0.073, 0.065, 0.035], C.leather, shoulderL, "beastEyeCavity", [0, s * 20, s * 18]);
    rod([0.61 + s * 0.185, 2.30, 0.11], [0.61 + s * 0.081, 2.32, 0.20], 0.028, C.boneLight, shoulderL, "beastBrowRidge");
    fang(
      [
        [0.61 + s * 0.17, 2.31, -0.15],
        [0.61 + s * 0.28, 2.43, -0.21],
        [0.61 + s * 0.32, 2.55, -0.22],
        [0.61 + s * 0.30, 2.66, -0.17],
      ],
      0.071,
      shoulderL,
      "pauldronHorn",
    );
    for (let i = 0; i < 3; i++) {
      fang(
        [
          [0.61 + s * (0.072 + i * 0.018), 2.12 + i * 0.02, 0.30 - i * 0.055],
          [0.61 + s * (0.08 + i * 0.018), 2.075 + i * 0.02, 0.31 - i * 0.055],
          [0.61 + s * (0.075 + i * 0.018), 2.04 + i * 0.02, 0.30 - i * 0.055],
          [0.61 + s * (0.06 + i * 0.018), 2.02 + i * 0.02, 0.28 - i * 0.055],
        ],
        0.021,
        shoulderL,
        "beastSkullTooth",
      );
    }
  }
  ell([0.61, 2.15, 0.357], [0.049, 0.035, 0.013], C.ink, shoulderL, "beastNasalCavity");
  rod([0.61, 2.39, -0.05], [0.61, 2.265, 0.23], 0.019, C.boneLight, shoulderL, "beastSagittalRidge");

  for (let i = 0; i < 3; i++) {
    const x = 0.77 + i * 0.073;
    fang(
      [
        [x, 2.19 - i * 0.025, -0.19],
        [x + 0.07, 2.13 - i * 0.025, -0.25],
        [x + 0.10, 2.01 - i * 0.025, -0.24],
        [x + 0.06, 1.94 - i * 0.025, -0.19],
      ],
      0.038,
      shoulderL,
      "pauldronRib",
    );
  }
  cord(
    [
      [0.40, 2.19, 0.12],
      [0.31, 1.98, 0.295],
      [0.18, 1.73, 0.255],
      [-0.10, 1.42, 0.23],
    ],
    0.044,
    spine.joints[1],
    "diagonalShoulderStrap",
  );
  for (let i = 0; i < 4; i++) {
    bead([0.30 - i * 0.075, 1.96 - i * 0.125, 0.30 - i * 0.013], 0.021, C.brass, spine.joints[1], "strapRivet");
  }

  // Fetishes: carved long bones, coloured beads and little skulls tied to the belt.
  for (const s of [-1, 1]) {
    const x = s * 0.35;
    cord(
      [
        [x, 1.37, 0.10],
        [x + s * 0.055, 1.20, 0.20],
        [x + s * 0.08, 1.02, 0.24],
        [x + s * 0.07, 0.91, 0.23],
      ],
      0.014,
      hips,
    );
    for (let k = 0; k < 3; k++) {
      bead([x + s * (0.055 + k * 0.007), 1.17 - k * 0.057, 0.22], 0.028, k === 1 ? C.teal : C.rust, hips, "fetishTradeBead");
    }
    if (s > 0) {
      smallSkull([0.43, 0.94, 0.25], 0.70, hips, "hangingSkull");
    } else {
      littleBone([-0.45, 1.01, 0.24], [-0.43, 0.76, 0.26], 0.035, hips, "hangingLongBone");
      texturedPlane([-0.437, 0.882, 0.282], 0.047, 0.17, charmTexture, hips, "boneIncisions");
    }
  }
  cord(
    [
      [-0.27, 1.35, -0.04],
      [-0.49, 1.23, 0.01],
      [-0.54, 1.10, 0.04],
    ],
    0.015,
    hips,
    "fetishBundleTie",
  );
  for (let i = 0; i < 3; i++) {
    littleBone(
      [-0.50 - i * 0.045, 1.16 - i * 0.025, 0.035],
      [-0.54 - i * 0.043, 0.94 - i * 0.025, 0.055],
      0.026,
      hips,
      "bundleBone",
    );
  }

  // Dark red strips around the bare upper arm on the opposite side.
  const shoulderR = limbs[1].arm.joints[0];
  for (let k = 0; k < 2; k++) {
    b.part(new THREE.CylinderGeometry(0.218, 0.218, 0.045, 9), C.rust, {
      at: [-0.72 - k * 0.06, 1.987 - k * 0.01, -0.025],
      dir: [-1, -0.15, 0],
      bone: shoulderR,
      name: "redUpperArmBinding",
    });
  }
  littleBone([-0.70, 2.015, 0.194], [-0.84, 1.99, 0.187], 0.027, shoulderR, "armBindingBone");
  cord(
    [
      [-0.72, 1.95, 0.16],
      [-0.75, 1.77, 0.15],
      [-0.72, 1.66, 0.13],
    ],
    0.012,
    shoulderR,
    "armCharmCord",
  );
  bead([-0.735, 1.73, 0.147], 0.034, C.teal, shoulderR, "armCharmBead");
  fang(
    [
      [-0.72, 1.68, 0.13],
      [-0.71, 1.61, 0.13],
      [-0.70, 1.55, 0.12],
      [-0.67, 1.52, 0.10],
    ],
    0.032,
    shoulderR,
    "armCharmTooth",
  );

  // A restrained scattering of raised warts on the back and shoulders.
  const wartSurface = b.surface(torso);
  for (const hit of wartSurface.scatter(14, {
    rng: random,
    minDist: 0.085,
    filter: (h) => h.n.z < -0.25 && h.at.y > 1.65,
  })) {
    b.stick(new THREE.IcosahedronGeometry(0.026, 0), C.light, hit, {
      embed: 0.4,
      name: "backWart",
    });
  }

  // A compact marsh island. The character's feet sit directly on its upper surface.
  const island = b.part(new THREE.CylinderGeometry(1.02, 1.09, 0.13, 14), MUD, {
    at: [0, 0.065, 0.02],
    scale: [1.08, 1, 0.87],
    bone: root,
    flat: true,
    name: "marshIsland",
  });
  b.part(new THREE.CylinderGeometry(1.005, 1.005, 0.016, 14), C.water, {
    at: [0, 0.132, 0.02],
    scale: [1.08, 1, 0.87],
    bone: root,
    name: "stillBogWater",
  });
  // The raised ground under the feet breaks the water into crescent puddles.
  ell([0, 0.112, 0.07], [0.78, 0.055, 0.58], MUD, root, "raisedMudBank");
  for (let i = 0; i < 13; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.73 + random() * 0.18;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r * 0.78;
    ell(
      [x, 0.15, z],
      [0.055 + random() * 0.06, 0.025 + random() * 0.023, 0.047 + random() * 0.045],
      i % 3 === 0 ? "#6a7153" : "#48584a",
      root,
      "bogPebble",
      [0, random() * 180, 0],
    );
  }

  // A half-sunken marked stone behind the right heel.
  const standingStone = b.part(new THREE.IcosahedronGeometry(1, 0), "#52655b", {
    at: [-0.79, 0.30, -0.40],
    scale: [0.18, 0.28, 0.15],
    bone: root,
    rotation: [0, -12, -13],
    name: "sunkenSpiritStone",
  });
  b.decal(standingStone, runeTexture, {
    at: [-0.79, 0.33, -0.255],
    dir: [0, 0, 1],
    size: [0.13, 0.21],
    bone: root,
    name: "stoneSpiritMark",
  });

  // Tall, angular marsh leaves remain below the knees and behind the silhouette.
  function reedCluster(x: number, z: number, count: number) {
    for (let i = 0; i < count; i++) {
      const dx = (random() - 0.5) * 0.15;
      const dz = (random() - 0.5) * 0.12;
      const height = 0.22 + random() * 0.27;
      const lean = (random() - 0.5) * 0.15;
      const leafColor = i % 2 ? "#637953" : "#3d6654";
      b.slab(
        [
          [x + dx - 0.024, 0.14, z + dz],
          [x + dx + 0.022, 0.14, z + dz],
          [x + dx + lean + 0.016, 0.14 + height * 0.66, z + dz - 0.035],
          [x + dx + lean * 1.8, 0.14 + height, z + dz - 0.075],
          [x + dx + lean - 0.013, 0.14 + height * 0.57, z + dz - 0.035],
        ],
        { color: leafColor, thickness: 0.006, bone: root, name: "marshSedge" },
      );
    }
  }
  reedCluster(0.79, -0.38, 7);
  reedCluster(-0.88, -0.15, 6);
  reedCluster(0.65, 0.55, 4);

  for (let i = 0; i < 3; i++) {
    const x = 0.79 + i * 0.061;
    const z = -0.39 - i * 0.043;
    const h = 0.48 + i * 0.085;
    rod([x, 0.13, z], [x - 0.032, h, z - 0.045], 0.009, "#68724c", root, "cattailStem");
    b.capsule([x - 0.032, h - 0.025, z - 0.045], [x - 0.035, h + 0.10, z - 0.05], 0.026, {
      color: "#624b37",
      bone: root,
      sides: 6,
      name: "cattailHead",
    });
  }

  // Fallen bones and tiny luminous fungus tie the setting to his trophies.
  littleBone([0.60, 0.17, 0.41], [0.83, 0.175, 0.27], 0.036, root, "fallenBogBone");
  for (let i = 0; i < 3; i++) {
    const x = -0.66 - i * 0.07;
    const z = 0.33 - i * 0.035;
    const height = 0.07 + i * 0.017;
    rod([x, 0.14, z], [x, 0.14 + height, z], 0.012, C.boneDark, root, "fungusStem");
    glow(
      b.part(new THREE.SphereGeometry(1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#7bc9ac", {
        at: [x, 0.14 + height, z],
        scale: [0.045 + i * 0.006, 0.032, 0.045 + i * 0.006],
        bone: root,
        flat: true,
        name: "spiritMushroomCap",
      }),
      0.35,
    );
  }

  // Sparse pale ripples, drawn as low-poly arcs rather than transparent planes.
  for (let i = 0; i < 3; i++) {
    const points: number[][] = [];
    for (let k = 0; k <= 9; k++) {
      const a = 0.2 + (k / 9) * 2.4;
      points.push([
        -0.50 + Math.cos(a) * (0.16 + i * 0.053),
        0.143,
        0.39 + Math.sin(a) * (0.09 + i * 0.029),
      ]);
    }
    b.sweep(polyline(points), 0.004, {
      color: "#548477",
      bone: root,
      sides: 4,
      caps: "flat",
      name: "puddleRipple",
    });
  }

  // The island is intentionally static; all anatomy and wearables have explicit rig ownership.
  void island;
  return b.root;
}
