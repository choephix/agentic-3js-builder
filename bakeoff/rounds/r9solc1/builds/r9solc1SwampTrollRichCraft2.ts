import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  paint,
  grain,
  noise,
  mix,
  svg,
} from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bogtusk, Keeper of the Mire",
  description:
    "A hulking swamp troll with jade skin, enormous ivory tusks, a crimson mohawk, trophy bones and witch-doctor fetishes, standing in a little reed-fringed swamp.",
};

type Point = number[] | THREE.Vector3;
type Tone = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Bogtusk",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(88173);

  // A deliberately small palette: jade, oxblood, old ivory and tarnished gold.
  const INK = "#142f32";
  const DEEP = "#193d3b";
  const JADE = "#548d79";
  const LIGHT = "#7eaa87";
  const IVORY = "#e5d5a8";
  const GOLD = "#c29b51";
  const GOLD_LIGHT = "#efd38b";
  const LEATHER_EDGE = "#aa7850";
  const CORD = "#6e6346";
  const WINE = "#70384e";
  const HAIR_DARK = "#492b48";

  const skin = paint((p, n) => {
    const cloud = noise(p, 0.19, 31);
    let c = mix("#386f65", "#659c81", cloud);
    c = mix(c, "#93b390", Math.max(0, n.y) * 0.23);
    c = mix(c, "#234e50", Math.max(0, -n.y) * 0.25);
    if (p.y < 0.53) {
      c = mix(c, "#474e39", Math.max(0, (0.53 - p.y) / 0.43) * 0.70);
    }
    return c;
  });
  const faceSkin = paint((p, n) => {
    const v = noise(p, 0.17, 31);
    return mix(
      mix("#4b8271", "#77a486", v),
      "#294f4d",
      Math.max(0, -n.y) * 0.35,
    );
  });
  const bellySkin = paint((p, n) =>
    mix("#5d927d", "#91ae88", 0.25 + 0.22 * n.y + noise(p, 0.16, 3) * 0.32),
  );
  const leather = grain("#49363a", "#624b43", {
    size: 0.045,
    axis: "y",
    seed: 15,
  });
  const bone = paint((p, n) => {
    const weather = noise(p, 0.11, 44);
    const fine = noise(p, 0.023, 45);
    return mix(
      "#c9b586",
      "#f0e0b5",
      0.39 + weather * 0.24 + fine * 0.06 + Math.max(0, n.y) * 0.24,
    );
  });
  const cloth = paint((p, n) => {
    const weave =
      Math.sin(p.x * 680) * Math.sin(p.y * 680) > 0 ? 0.025 : -0.025;
    return mix("#542e46", "#8e4a5e", 0.43 + n.y * 0.16 + weave);
  });
  const hair = paint((p, n) =>
    mix(
      "#652f51",
      "#d86576",
      Math.min(1, Math.max(0, (p.y - 2.72) / 0.49)) * 0.83 +
        Math.max(0, n.z) * 0.09,
    ),
  );
  const mud = paint((p, n) => {
    const v = noise(p, 0.22, 62);
    return mix(
      mix("#243c38", "#4a5741", v),
      "#6c7752",
      Math.max(0, n.y) * noise(p, 0.14, 2) * 0.27,
    );
  });

  // Drawings are kept broad enough to remain legible at the model's scale.
  const eyeTexture = svg(
    `<svg viewBox="0 0 120 82">
      <path d="M3 38 Q22 7 62 15 Q96 15 117 35
               Q100 69 61 71 Q22 68 3 38Z"
            fill="#123332" stroke="#10272b" stroke-width="5"/>
      <path d="M12 39 Q35 21 62 24 Q91 23 108 36
               Q91 60 60 62 Q31 60 12 39Z" fill="#e9bd56"/>
      <ellipse cx="63" cy="42" rx="22" ry="23" fill="#e98c31"/>
      <path d="M44 49 Q62 65 83 48 Q76 67 61 67 Q48 62 44 49Z"
            fill="#ffdf73"/>
      <path d="M62 18 Q52 42 61 66 Q72 42 66 20Z" fill="#182b28"/>
      <path d="M16 35 Q52 9 104 31" fill="none"
            stroke="#2b4940" stroke-width="8" stroke-linecap="round"/>
      <path d="M26 52 Q58 68 94 49" fill="none"
            stroke="#ffe49a" stroke-width="3"/>
      <ellipse cx="49" cy="31" rx="7" ry="5" fill="#fff4c5"/>
      <circle cx="78" cy="51" r="3" fill="#fff4c5"/>
    </svg>`,
    { size: 384 },
  );

  const warpaint = svg(
    `<svg viewBox="0 0 80 120">
      <path d="M10 6 L27 12 L41 99 L30 113Z
               M34 6 L50 10 L62 88 L51 104Z
               M59 13 L72 20 L79 69 L69 90Z"
            fill="#d3c896"/>
      <path d="M14 12 L22 16 L36 93 M39 13 L46 17 L57 83"
            fill="none" stroke="#f1e0b3" stroke-width="3"/>
      <path d="M11 42 L31 47 M39 64 L57 68 M62 35 L76 39"
            stroke="#678c70" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const scarTexture = svg(
    `<svg viewBox="0 0 80 150">
      <path d="M48 7 L29 48 L42 75 L24 111 L29 144"
            fill="none" stroke="#285651" stroke-width="11"/>
      <path d="M49 8 L34 49 L47 75 L30 111 L34 143"
            fill="none" stroke="#9fb495" stroke-width="4"/>
      <path d="M24 36 L45 44 M26 65 L48 62 M27 96 L46 101 M18 121 L38 126"
            stroke="#416d60" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const loinEmblem = svg(
    `<svg viewBox="0 0 180 240">
      <path d="M14 8 L166 8 L154 199 L124 229 L89 207 L56 233 L26 205Z"
            fill="#70394f"/>
      <path d="M23 16 L157 16 L146 194 L124 214 L89 195 L57 217 L35 198Z"
            fill="none" stroke="#bb9660" stroke-width="5"/>
      <path d="M33 23 L147 23" stroke="#e0bd78" stroke-width="4"
            stroke-dasharray="8 7"/>
      <path d="M90 43 L141 101 L111 111 L122 145 L90 183
               L58 145 L69 111 L39 101Z"
            fill="#2d3c3b" stroke="#c9ad78" stroke-width="6"
            stroke-linejoin="miter"/>
      <path d="M90 61 L116 99 L98 117 L90 158 L82 117 L64 99Z"
            fill="#e0c18a"/>
      <path d="M76 98 L88 106 L83 119 L70 110Z
               M104 98 L92 106 L97 119 L110 110Z" fill="#4b5142"/>
      <path d="M89 139 L91 139 L95 152 L85 152Z" fill="#5b4a42"/>
      <path d="M41 161 L49 174 M131 161 L139 174"
            stroke="#ab755c" stroke-width="5"/>
    </svg>`,
    { size: 512 },
  );

  const wrapTexture = svg(
    `<svg viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#aea780"/>
      <path d="M0 12 H128 M0 116 H128" stroke="#4c6253" stroke-width="9"/>
      <path d="M0 25 H128 M0 104 H128" stroke="#d6cba0" stroke-width="4"/>
      <path d="M-16 65 L16 34 L48 65 L80 34 L112 65 L144 34
               M-16 94 L16 63 L48 94 L80 63 L112 94 L144 63"
            fill="none" stroke="#5b705b" stroke-width="7"/>
      <path d="M0 5 H128 M0 123 H128" stroke="#e5d4a4" stroke-width="3"
            stroke-dasharray="5 5"/>
    </svg>`,
    { size: 256 },
  );

  const featherTexture = svg(
    `<svg viewBox="0 0 64 180">
      <path d="M31 176 Q5 144 10 100 L4 92 L13 83 L10 67
               L19 59 L18 42 Q22 20 34 4 Q54 29 54 56
               L48 67 L58 77 L51 89 L58 99 Q58 143 31 176Z"
            fill="#573852"/>
      <path d="M33 8 Q20 38 20 68 L31 101 L49 72 Q57 36 33 8Z"
            fill="#c16a72"/>
      <path d="M13 96 L30 119 L53 95 L51 115 L31 140 L13 119Z"
            fill="#c5b788"/>
      <path d="M34 10 L30 176" stroke="#e6c58b" stroke-width="4"/>
      <path d="M14 109 L29 124 M51 109 L31 129 M20 45 L32 61
               M47 44 L33 61 M17 76 L31 91 M49 76 L32 94"
            stroke="#372f43" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const mossTexture = svg(
    `<svg viewBox="0 0 100 180">
      <path d="M8 174 Q17 134 23 100 L21 54 L30 20
               L36 67 L34 119 L46 91 L53 6 L61 37 L58 106
               L73 62 L78 24 L88 54 L81 110 L65 151 L57 178
               L49 137 L35 177 L29 134 L20 178Z" fill="#63794a"/>
      <path d="M30 27 L28 119 L14 171 M54 16 L51 122 L38 172
               M79 33 L72 111 L57 167"
            fill="none" stroke="#a2a25c" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const waterTexture = svg(
    `<svg viewBox="0 0 200 150">
      <g fill="none" stroke-linecap="round">
        <path d="M19 75 Q43 46 80 57 M97 55 Q143 47 178 78"
              stroke="#789c75" stroke-width="3"/>
        <path d="M28 94 Q72 115 112 104 M132 101 L165 90"
              stroke="#648f79" stroke-width="3"/>
        <path d="M52 74 Q85 57 120 70 M66 89 Q99 100 135 81"
              stroke="#acc29a" stroke-width="3"/>
        <path d="M17 122 L35 125 M156 29 L174 31 M142 127 L152 129"
              stroke="#829f78" stroke-width="3"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton first. The long arms are spread in a relaxed, readable rigging pose.
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.17, -0.065],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 1.17, -0.065],
      [0, 1.55, -0.07],
      [0, 1.96, -0.10],
      [0, 2.13, 0.015],
    ],
    {
      parent: hips,
      names: ["spineLower", "spineUpper", "chest", "neckBase"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 2.10, -0.005],
      [0, 2.28, 0.12],
      [0, 2.42, 0.25],
    ],
    { parent: spine.joints[2], names: ["neck", "neckUpper"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.42, 0.25],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = 1.0;
  const face = b.region({ at: head.at, scale: H, bone: head });
  const hp = (x: number, y: number, z: number) => face.p([x, y, z]);
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.25, 0.04),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.64, 2.045, -0.025],
        [s * 1.075, 1.80, -0.015],
        [s * 1.425, 1.65, 0.025],
      ],
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.28, 1.18, -0.075],
        [s * 0.35, 0.775, 0.065],
        [s * 0.36, 0.365, -0.045],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.36, 0.12, 0.14],
      },
    );
    const fingers = [-1, 0, 1].map((f, i) => {
      const len = i === 1 ? 0.285 : 0.245;
      return b.chain(
        `finger${side}${i + 1}`,
        [
          [s * 1.625, 1.615, 0.035 + f * 0.112],
          [s * (1.755 + len * 0.12), 1.565, 0.035 + f * 0.153],
          [s * (1.65 + len), 1.505, 0.035 + f * 0.195],
        ],
        {
          parent: arm.tip!,
          names: [
            `finger${side}${i + 1}Base`,
            `finger${side}${i + 1}Mid`,
            `finger${side}${i + 1}Tip`,
          ],
          role: "digit",
        },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 1.49, 1.60, 0.17],
        [s * 1.53, 1.51, 0.305],
        [s * 1.625, 1.43, 0.375],
      ],
      {
        parent: arm.tip!,
        names: [`thumb${side}Base`, `thumb${side}Mid`, `thumb${side}Tip`],
        role: "digit",
      },
    );
    const toes = [-1, 0, 1].map((t, i) =>
      b.chain(
        `toe${side}${i + 1}`,
        [
          [s * 0.36 + t * 0.126, 0.224, 0.30],
          [s * 0.36 + t * 0.146, 0.213, 0.43],
          [s * 0.36 + t * 0.158, 0.205, i === 1 ? 0.59 : 0.545],
        ],
        {
          parent: leg.tip!,
          names: [`toe${side}${i + 1}Base`, `toe${side}${i + 1}Tip`],
          role: "digit",
        },
      ),
    );
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: hp(s * 0.34, 0.045, -0.02),
      dir: [s, 0.3, 0],
      role: "hinge",
    });
    return { s, side, arm, leg, fingers, thumb, toes, ear };
  });

  // ---------------------------------------------------------------------------
  // Reusable primitive assemblies.
  // ---------------------------------------------------------------------------
  function ellipsoid(
    at: Point,
    scale: number[],
    color: Tone,
    boneJoint: Joint,
    name?: string,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 7), color, {
      at,
      scale,
      bone: boneJoint,
      flat: true,
      name,
    });
  }

  function block(
    at: Point,
    size: number[],
    color: Tone,
    boneJoint: Joint,
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: boneJoint,
      name,
    });
  }

  function hoop(
    at: Point,
    radius: number,
    thickness: number,
    color: Tone,
    boneJoint: Joint,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, thickness, 5, 12), color, {
      at,
      bone: boneJoint,
      rotation,
      flat: true,
    });
  }

  function longBone(a: number[], c: number[], r: number, boneJoint: Joint) {
    b.rod(a, c, r * 0.62, { color: bone, bone: boneJoint, sides: 6 });
    for (const end of [a, c]) {
      for (const side of [-1, 1]) {
        ellipsoid(
          [end[0] + side * r * 0.56, end[1], end[2]],
          [r * 0.77, r * 0.83, r * 0.85],
          bone,
          boneJoint,
        );
      }
    }
  }

  function trophySkull(at: number[], r: number, boneJoint: Joint) {
    const [x, y, z] = at;
    const cranium = ellipsoid(
      [x, y + r * 0.15, z],
      [r * 0.90, r, r * 0.70],
      bone,
      boneJoint,
      "fetishSkull",
    );
    ellipsoid(
      [x, y - r * 0.40, z + r * 0.29],
      [r * 0.68, r * 0.49, r * 0.47],
      IVORY,
      boneJoint,
    );
    for (const side of [-1, 1]) {
      ellipsoid(
        [x + side * r * 0.36, y + r * 0.08, z + r * 0.595],
        [r * 0.275, r * 0.31, r * 0.105],
        "#343c32",
        boneJoint,
        "skullSocket",
        8,
      );
      b.rod(
        [x + side * r * 0.12, y + r * 0.42, z + r * 0.57],
        [x + side * r * 0.65, y + r * 0.35, z + r * 0.49],
        r * 0.10,
        { color: IVORY, bone: boneJoint, sides: 5 },
      );
    }
    b.extrude(
      [[0, 0.05 * r], [-0.16 * r, -0.20 * r], [0.16 * r, -0.20 * r]],
      {
        at: [x, y - r * 0.22, z + r * 0.745],
        x: [1, 0, 0],
        thickness: 0.004,
        color: "#434537",
        bone: boneJoint,
      },
    );
    for (const i of [-1, 0, 1]) {
      block(
        [x + i * r * 0.27, y - r * 0.79, z + r * 0.40],
        [r * 0.21, r * 0.28, r * 0.26],
        IVORY,
        boneJoint,
      );
    }
    return cranium;
  }

  function cordKnot(at: number[], radius: number, boneJoint: Joint) {
    ellipsoid(at, [radius, radius * 0.8, radius], CORD, boneJoint);
    b.rod(
      [at[0] - radius * 0.45, at[1], at[2] + radius * 0.6],
      [at[0] + radius * 0.45, at[1], at[2] + radius * 0.6],
      radius * 0.22,
      { color: "#b6a476", bone: boneJoint, sides: 5 },
    );
  }

  // ---------------------------------------------------------------------------
  // Broad, hunched volumes. All the small ornaments sit on this simple puppet.
  // ---------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 1.10, -0.055], w: 0.69, h: 0.52 },
      { at: [0, 1.34, -0.075], w: 0.88, h: 0.65 },
      { at: [0, 1.63, -0.095], w: 1.02, h: 0.72 },
      { at: [0, 1.91, -0.10], w: 1.14, h: 0.68 },
      { at: [0, 2.075, -0.015], w: 0.85, h: 0.51 },
    ],
    {
      bone: [hips, spine],
      color: skin,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "hunchedTorso",
    },
  );
  b.sweep(neck, [0.28, 0.25], {
    color: skin,
    sides: 8,
    smooth: false,
    name: "heavyNeck",
  });
  const belly = ellipsoid(
    [0, 1.56, 0.17],
    [0.405, 0.355, 0.225],
    bellySkin,
    spine.joints[0],
    "belly",
  );
  const pectorals = [];
  for (const s of [1, -1]) {
    pectorals.push(ellipsoid(
      [s * 0.275, 1.94, 0.175],
      [0.315, 0.225, 0.185],
      skin,
      spine.joints[2],
      "pectoral",
    ));
    ellipsoid(
      [s * 0.37, 2.125, -0.105],
      [0.28, 0.23, 0.245],
      skin,
      spine.joints[2],
      "heavyTrapezius",
    );
  }
  const bellySurface = b.surface(belly);
  const navelHit = bellySurface.nearest([0, 1.40, 0.42]);
  b.stick(
    new THREE.SphereGeometry(1, 8, 5),
    DEEP,
    navelHit,
    {
      scale: [0.026, 0.009, 0.019],
      embed: 0.48,
      bone: spine.joints[0],
      name: "navel",
    },
  );

  // Head is established before its headdress, trophies and shoulders.
  const skull = ellipsoid(
    hp(0, 0.04, 0.03),
    [0.42 * H, 0.415 * H, 0.34 * H],
    faceSkin,
    head,
    "trollSkull",
    12,
  );
  for (const s of [1, -1]) {
    ellipsoid(hp(s * 0.275, -0.10, 0.22), [0.165, 0.18, 0.14], faceSkin, head, "cheek");
    ellipsoid(hp(s * 0.205, 0.11, 0.31), [0.138, 0.094, 0.073], INK, head, "eyeSocket");

    const eyeball = ellipsoid(
      hp(s * 0.205, 0.105, 0.365),
      [0.100, 0.063, 0.041],
      "#dcb95a",
      head,
      "amberEye",
      12,
    );
    glow(
      b.decal(eyeball, eyeTexture, {
        at: hp(s * 0.205, 0.105, 0.41),
        dir: [0, 0, 1],
        size: [0.187, 0.106],
        segments: 6,
        mirror: s > 0,
        lift: 0.001,
        bone: head,
        name: "paintedEye",
      }),
      0.65,
    );

    b.capsule(
      hp(s * 0.085, 0.225, 0.34),
      hp(s * 0.345, 0.29, 0.235),
      [0.078, 0.065],
      { color: faceSkin, bone: head, sides: 7, smooth: false, name: "heavyBrow" },
    );
    b.rod(
      hp(s * 0.065, 0.24, 0.325),
      hp(s * 0.11, 0.365, 0.235),
      [0.030, 0.016],
      { color: faceSkin, bone: head, sides: 5, name: "frownRidge" },
    );
  }

  ellipsoid(hp(0, -0.18, 0.31), [0.315, 0.13, 0.195], faceSkin, head, "upperMuzzle");
  ellipsoid(hp(0, 0.04, 0.33), [0.12, 0.23, 0.13], faceSkin, head, "noseBridge");
  ellipsoid(hp(0, -0.075, 0.455), [0.19, 0.145, 0.19], faceSkin, head, "broadNose");
  for (const s of [1, -1]) {
    ellipsoid(hp(s * 0.132, -0.10, 0.445), [0.089, 0.078, 0.10], faceSkin, head, "noseWing");
    ellipsoid(hp(s * 0.127, -0.135, 0.527), [0.046, 0.031, 0.020], DEEP, head, "nostril", 8);
  }

  // A visible mouth slit, distinct upper muzzle, and separately hinged lower jaw.
  ellipsoid(hp(0, -0.267, 0.395), [0.280, 0.055, 0.112], "#20312e", head, "mouthInterior");
  ellipsoid(hp(0, -0.34, 0.28), [0.345, 0.158, 0.255], faceSkin, jaw, "lowerJaw");
  ellipsoid(hp(0, -0.30, 0.445), [0.255, 0.052, 0.073], JADE, jaw, "lowerLip");
  ellipsoid(hp(0, -0.425, 0.30), [0.225, 0.075, 0.145], faceSkin, jaw, "heavyChin");

  for (const x of [-0.16, -0.08, 0.02, 0.115]) {
    b.spike(
      hp(x, -0.235, 0.445),
      [0, -1, 0.12],
      0.060,
      0.031,
      { color: bone, bone: head, sides: 5 },
    );
  }

  // The tusks are large, outward bowing, then hooked inward at their tips.
  for (const s of [1, -1]) {
    const tuskPath = catmull([
      hp(s * 0.255, -0.32, 0.38),
      hp(s * 0.355, -0.235, 0.51),
      hp(s * 0.425, -0.065, 0.555),
      hp(s * 0.423, 0.115, 0.53),
      hp(s * 0.365, 0.245, 0.475),
    ]);
    const tusk = b.sweep(tuskPath, [0.100, 0.089, 0.062, 0.033, 0], {
      color: bone,
      bone: jaw,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "greatLowerTusk",
    });
    b.sweep(
      catmull(b.ring(frame(tuskPath.at(0.15), tuskPath.tangentAt(0.15)), {
        count: 10,
        radius: 0.093,
      }).items, { closed: true }),
      0.013,
      { color: GOLD, bone: jaw, sides: 5, name: "tuskBinding" },
    );
    // A single narrow gold staple is more readable than many tiny engravings.
    b.stick(
      new THREE.SphereGeometry(0.016, 6, 4),
      GOLD_LIGHT,
      tusk.at(0.23, 180),
      { bone: jaw, embed: 0.2 },
    );
  }

  hoop(hp(0, -0.185, 0.577), 0.071, 0.014, GOLD, head);
  ellipsoid(hp(0, -0.263, 0.577), [0.022, 0.022, 0.017], GOLD_LIGHT, head);

  // A short bound chin braid sharpens the lower-face silhouette.
  // Each strand begins inside the separate lower jaw and rides its hinge.
  const beardColor = "#254947";
  const beardHighlight = "#42685b";
  b.sweep(
    catmull([
      hp(0, -0.405, 0.345),
      hp(0, -0.505, 0.36),
      hp(0, -0.635, 0.315),
      hp(0, -0.735, 0.285),
    ]),
    [0.079, 0.066, 0.046, 0],
    {
      color: beardColor,
      bone: jaw,
      sides: 7,
      smooth: false,
      name: "chinBraidCore",
    },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        hp(s * 0.045, -0.425, 0.365),
        hp(-s * 0.035, -0.495, 0.403),
        hp(s * 0.025, -0.565, 0.367),
        hp(-s * 0.018, -0.635, 0.337),
      ]),
      [0.030, 0.027, 0.021, 0.012],
      {
        color: s > 0 ? beardHighlight : beardColor,
        bone: jaw,
        sides: 6,
        smooth: false,
        name: "interwovenChinBraid",
      },
    );
  }
  b.part(new THREE.CylinderGeometry(0.048, 0.043, 0.049, 8), GOLD, {
    at: hp(0, -0.635, 0.315),
    bone: jaw,
    dir: [0, -1, -0.2],
    flat: true,
    name: "chinBraidCuff",
  });
  ellipsoid(
    hp(0, -0.636, 0.361),
    [0.015, 0.015, 0.009],
    GOLD_LIGHT,
    jaw,
    "braidCuffStud",
    6,
  );

  b.decal(skull, scarTexture, {
    at: hp(-0.285, 0.16, 0.30),
    dir: [-0.15, 0, 1],
    size: [0.095, 0.28],
    lift: 0.0025,
    bone: head,
    name: "oldTempleScar",
  });
  for (const s of [1, -1]) {
    b.decal([skull, head], warpaint, {
      at: hp(s * 0.29, -0.095, 0.345),
      dir: [s * 0.22, 0, 1],
      size: [0.11, 0.18],
      mirror: s < 0,
      lift: 0.003,
      bone: head,
      name: "ivoryCheekWarpaint",
    });
  }

  // Long spear-shaped ears, with a separate recessed inner panel.
  for (const { s, ear } of limbs) {
    const earAt = hp(s * 0.335, 0.035, -0.015);
    b.extrude(
      [[0, 0], [0.13, -0.065], [0.53, 0.245], [0.59, 0.345], [0.255, 0.225], [0.07, 0.15]],
      {
        at: earAt,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: [0.115, 0.035],
        bevel: 0.015,
        color: skin,
        bone: ear,
        name: "spearEar",
      },
    );
    b.slab(
      [
        hp(s * 0.42, 0.09, 0.050),
        hp(s * 0.51, 0.035, 0.052),
        hp(s * 0.84, 0.29, 0.015),
        hp(s * 0.60, 0.205, 0.050),
      ],
      { color: "#527a65", bone: ear, thickness: 0.015, name: "earInner" },
    );
    b.rod(
      hp(s * 0.425, 0.08, 0.06),
      hp(s * 0.83, 0.285, 0.025),
      [0.022, 0.008],
      { color: LIGHT, bone: ear, sides: 5 },
    );
    hoop(hp(s * 0.67, 0.135, 0.025), 0.060, 0.012, GOLD, ear);
    hoop(hp(s * 0.755, 0.215, 0.025), 0.038, 0.009, GOLD, ear);
    ellipsoid(hp(s * 0.67, 0.065, 0.025), [0.025, 0.032, 0.023], GOLD_LIGHT, ear);
  }

  // ---------------------------------------------------------------------------
  // A thick sagittal mohawk: broad overlapping carved blades, not thin hair.
  // ---------------------------------------------------------------------------
  b.sweep(
    catmull([
      hp(0, 0.28, 0.295),
      hp(0, 0.405, 0.12),
      hp(0, 0.39, -0.12),
      hp(0, 0.17, -0.305),
    ]),
    () => [0.105, 0.065],
    { color: HAIR_DARK, bone: head, sides: 7, smooth: false, name: "mohawkRoot" },
  );

  const crestRoots = [
    [2.725, 0.555, 0.37],
    [2.795, 0.445, 0.43],
    [2.825, 0.325, 0.43],
    [2.815, 0.205, 0.42],
    [2.765, 0.080, 0.40],
    [2.685, -0.040, 0.37],
    [2.575, -0.145, 0.32],
  ];
  crestRoots.forEach(([y, z, height], i) => {
    const blade = b.extrude(
      [
        [-0.025, 0],
        [0.16, -0.025],
        [0.235, height * 0.58],
        [0.185, height],
        [0.11, height * 0.82],
        [0.025, height * 0.46],
      ],
      {
        at: [0, y, z],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.265, 0.12],
        bevel: 0.009,
        bone: head,
        color: hair,
        name: `mohawkBlade${i + 1}`,
      },
    );
    const bladeSurface = b.surface(blade);
    for (const s of [1, -1]) {
      // Pull the accent onto the tapered blade instead of leaving a
      // constant-width highlight floating beside its narrow upper edge.
      const highlightPath = bladeSurface.drape(
        catmull([
          [s * 0.16, y + 0.055, z - 0.065],
          [s * 0.14, y + height * 0.38, z - 0.105],
          [s * 0.11, y + height * 0.67, z - 0.145],
          [s * 0.085, y + height * 0.89, z - 0.177],
        ]),
        { lift: 0.002 },
      );
      b.sweep(highlightPath, [0.010, 0.008, 0.004], {
        color: i % 2 ? "#b95068" : "#cf6879",
        bone: head,
        sides: 5,
        caps: "flat",
        name: "crestCarvedHighlight",
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Limbs, wide hands, separated thick digits and three-toed swamp feet.
  // ---------------------------------------------------------------------------
  for (const { s, side, arm, leg, fingers, thumb, toes } of limbs) {
    const armTube = b.sweep(arm, [0.255, 0.25, 0.195, 0.215, 0.145], {
      color: skin,
      sides: 8,
      smooth: false,
      name: `armVolume${side}`,
    });
    ellipsoid(
      [s * 0.675, 2.015, -0.025],
      [0.29, 0.29, 0.285],
      skin,
      arm.joints[0],
      `deltoid${side}`,
    );
    ellipsoid(
      [s * 0.87, 1.895, 0.035],
      [0.245, 0.20, 0.235],
      skin,
      arm.joints[0],
      `biceps${side}`,
    );
    ellipsoid(
      [s * 1.555, 1.615, 0.035],
      [0.185, 0.125, 0.212],
      skin,
      arm.tip!,
      `palm${side}`,
    );
    for (const [i, finger] of fingers.entries()) {
      b.sweep(finger, [0.067, 0.061, 0.045], {
        color: skin,
        sides: 7,
        smooth: false,
        name: `fingerVolume${side}${i + 1}`,
      });
      const tip = finger.at(0.91).at;
      ellipsoid(
        [tip.x, tip.y + 0.034, tip.z + 0.005],
        [0.058, 0.021, 0.043],
        "#b8ba8a",
        finger.tip!,
        "fingerNail",
        8,
      );
    }
    b.sweep(thumb, [0.079, 0.064, 0.045], {
      color: skin,
      sides: 7,
      smooth: false,
      name: `thumbVolume${side}`,
    });
    const thumbTip = thumb.at(0.91).at;
    ellipsoid(
      [thumbTip.x, thumbTip.y + 0.027, thumbTip.z + 0.023],
      [0.049, 0.023, 0.043],
      "#b8ba8a",
      thumb.tip!,
      "thumbNail",
      8,
    );

    const legTube = b.sweep(leg, [0.245, 0.222, 0.183, 0.145], {
      color: skin,
      sides: 8,
      smooth: false,
      name: `legVolume${side}`,
    });
    ellipsoid(
      [s * 0.35, 0.78, 0.155],
      [0.175, 0.17, 0.105],
      skin,
      leg.joints[1],
      `kneeCap${side}`,
    );
    ellipsoid(
      [s * 0.36, 0.255, 0.135],
      [0.225, 0.134, 0.29],
      skin,
      leg.tip!,
      `foot${side}`,
    );
    for (const [i, toe] of toes.entries()) {
      b.sweep(toe, [0.083, 0.072, 0.058], {
        color: skin,
        sides: 7,
        smooth: false,
        name: `toeVolume${side}${i + 1}`,
      });
      const end = toe.at(0.89).at;
      ellipsoid(
        [end.x, end.y + 0.047, end.z + 0.020],
        [0.066, 0.023, 0.078],
        "#b7b98b",
        toe.joints[toe.joints.length - 1],
        "toeNail",
        8,
      );
    }

    // Wrapped forearms: rings follow the actual surface, not guessed radii.
    const armSurface = b.surface(armTube);
    for (const t of [0.69, 0.77, 0.85, 0.93]) {
      const loop = armSurface.loop(arm.at(t), { lift: 0.012 });
      b.sweep(loop, 0.028, {
        color: t === 0.69 || t === 0.93 ? leather : "#aaa580",
        bone: arm.jointAt(t),
        sides: 5,
        name: "forearmBinding",
      });
    }
    const bracerAt = [s * 1.28, 1.755, 0.13];
    b.part(new THREE.BoxGeometry(0.205, 0.075, 0.205), "#ffffff", {
      at: bracerAt,
      bone: arm.joints[1],
      rotation: [0, 0, -s * 22],
      texture: wrapTexture,
      name: "wovenBracerPanel",
    });

    if (s < 0) {
      const legSurface = b.surface(legTube);
      for (const t of [0.64, 0.73, 0.82, 0.91]) {
        b.sweep(legSurface.loop(leg.at(t), { lift: 0.009 }), 0.025, {
          color: t === 0.64 || t === 0.91 ? leather : "#a39f7a",
          sides: 5,
          bone: leg.jointAt(t),
          name: "shinWrap",
        });
      }
      block([s * 0.365, 0.50, 0.098], [0.17, 0.25, 0.045], leather, leg.joints[1], "shinGuard");
      longBone(
        [s * 0.365, 0.405, 0.129],
        [s * 0.365, 0.61, 0.129],
        0.028,
        leg.joints[1],
      );
    } else {
      b.sweep(b.surface(legTube).loop(leg.at(0.33), { lift: 0.01 }), 0.023, {
        color: leather,
        bone: leg.joints[0],
        sides: 6,
        name: "thighTrophyBand",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Garments: an asymmetrical shoulder, diagonal harness and patterned loincloth.
  // ---------------------------------------------------------------------------
  const leftArm = limbs[0].arm;
  ellipsoid([0.68, 2.13, -0.045], [0.335, 0.155, 0.305], leather, leftArm.joints[0], "leatherPauldron");

  b.slab(
    [[0.37, 2.18, 0.12], [0.55, 2.27, 0.23], [0.88, 2.19, 0.24], [1.00, 2.05, 0.08], [0.76, 2.10, -0.04]],
    { color: leather, thickness: 0.065, bone: leftArm.joints[0], name: "shoulderFrontPlate" },
  );
  b.sweep(
    catmull([[0.39, 2.19, 0.14], [0.57, 2.28, 0.25], [0.88, 2.20, 0.26], [1.01, 2.05, 0.10]]),
    0.014,
    { color: LEATHER_EDGE, bone: leftArm.joints[0], sides: 5, name: "pauldronTrim" },
  );

  const shoulderSpikes = [
    [[0.60, 2.235, -0.18], [0.66, 2.49, -0.27], [0.84, 2.70, -0.25]],
    [[0.80, 2.20, -0.15], [0.98, 2.40, -0.19], [1.11, 2.53, -0.12]],
    [[0.94, 2.105, 0.015], [1.16, 2.24, 0.015], [1.30, 2.30, 0.095]],
  ];
  for (const points of shoulderSpikes) {
    b.sweep(catmull(points), [0.073, 0.049, 0], {
      color: bone,
      bone: leftArm.joints[0],
      sides: 7,
      smooth: false,
      name: "pauldronRibSpike",
    });
    ellipsoid(points[0], [0.10, 0.038, 0.10], "#493d31", leftArm.joints[0], "spikeSocket");
  }
  trophySkull([0.69, 2.13, 0.245], 0.135, leftArm.joints[0]);

  const harnessRoute = b.surface([torso, belly, pectorals]).drape(
    catmull([
      [0.50, 2.04, 0.29],
      [0.32, 1.82, 0.37],
      [0.08, 1.58, 0.44],
      [-0.29, 1.28, 0.32],
    ]),
    { lift: 0.029 },
  );
  b.sweep(harnessRoute, () => [0.057, 0.020], {
    color: leather,
    section: "box",
    bone: spine,
    name: "diagonalHarness",
  });
  b.along(harnessRoute, 8, (at) => {
    const p = at.at;
    ellipsoid([p.x, p.y, p.z + 0.025], [0.014, 0.014, 0.010], GOLD, at.bone ?? hips, "harnessStud", 6);
  });

  // The belt uses a true horizontal section of the torso.
  const beltLoop = b.surface(torso).loop([0, 1.235, -0.06], {
    dir: [0, 1, 0],
    lift: 0.018,
  });
  b.sweep(beltLoop, () => [0.073, 0.025], {
    color: leather,
    section: "box",
    bone: hips,
    name: "broadWaistBelt",
  });
  b.along(beltLoop, 16, (at) =>
    b.part(new THREE.SphereGeometry(0.017, 6, 4), GOLD, {
      at,
      bone: hips,
      name: "beltRivet",
    }),
  );

  // A substantial leather yoke bridges the belt and the hanging cloth.
  // The original front panel sat forward of the torso with no attachment.
  block(
    [0, 1.175, 0.305],
    [0.57, 0.115, 0.18],
    leather,
    hips,
    "loinclothLeatherYoke",
  );
  b.rod(
    [-0.275, 1.205, 0.398],
    [0.275, 1.205, 0.398],
    0.012,
    { color: LEATHER_EDGE, bone: hips, sides: 5, name: "yokeTopTrim" },
  );
  for (const x of [-0.235, -0.145, 0.145, 0.235]) {
    b.rod(
      [x - 0.016, 1.21, 0.407],
      [x + 0.016, 1.145, 0.407],
      0.009,
      { color: "#c5ac78", bone: hips, sides: 5, name: "loinclothAttachmentLacing" },
    );
  }

  const frontCloth = b.extrude(
    [
      [-0.29, 0.65],
      [0.29, 0.65],
      [0.25, 0.12],
      [0.14, 0.015],
      [0, 0.075],
      [-0.13, -0.005],
      [-0.25, 0.09],
    ],
    {
      at: [0, 0.53, 0.365],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      color: cloth,
      bone: hips,
      name: "frontLoincloth",
    },
  );
  b.part(new THREE.PlaneGeometry(0.515, 0.625), "#ffffff", {
    at: [0, 0.862, 0.3905],
    bone: hips,
    texture: loinEmblem,
    name: "embroideredBogMask",
  });
  b.sweep(
    [
      frontCloth.local([-0.285, 0.62, 0.028]),
      frontCloth.local([-0.245, 0.10, 0.028]),
      frontCloth.local([-0.13, 0.005, 0.028]),
    ],
    0.011,
    { color: LEATHER_EDGE, bone: hips, sides: 5, name: "clothEdge" },
  );
  b.sweep(
    [
      frontCloth.local([0.285, 0.62, 0.028]),
      frontCloth.local([0.245, 0.13, 0.028]),
      frontCloth.local([0.14, 0.025, 0.028]),
    ],
    0.011,
    { color: LEATHER_EDGE, bone: hips, sides: 5 },
  );
  b.extrude(
    [[-0.29, 0.65], [0.29, 0.65], [0.24, 0.10], [0.07, 0.02], [-0.06, 0.10], [-0.23, 0]],
    {
      at: [0, 0.56, -0.40],
      x: [1, 0, 0],
      thickness: 0.04,
      color: cloth,
      bone: hips,
      name: "rearLoincloth",
    },
  );

  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.17, -0.015], [0.12, -0.39], [0.055, -0.46], [-0.015, -0.32]],
      {
        at: [s * 0.36, 1.16, 0.15],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        color: leather,
        bone: hips,
        name: "sideBeltFlap",
      },
    );
    for (const y of [1.10, 1.035, 0.97]) {
      ellipsoid([s * 0.415, y, 0.17], [0.014, 0.014, 0.010], GOLD, hips, "flapRivet", 6);
    }
  }
  trophySkull([0, 1.23, 0.415], 0.103, hips);
  for (const s of [1, -1]) {
    b.spike([s * 0.083, 1.20, 0.45], [s * 0.6, -0.65, 0.3], 0.10, 0.025, {
      color: bone,
      bone: hips,
      sides: 6,
      name: "buckleFang",
    });
  }

  // ---------------------------------------------------------------------------
  // Necklace and fetishes. Repeated bone/cord/feather motifs tie the outfit together.
  // ---------------------------------------------------------------------------
  const necklaceFront = catmull([
    [-0.43, 2.105, 0.15],
    [-0.36, 1.91, 0.335],
    [-0.20, 1.795, 0.415],
    [0, 1.755, 0.45],
    [0.20, 1.795, 0.415],
    [0.36, 1.91, 0.335],
    [0.43, 2.105, 0.15],
  ]);
  b.sweep(necklaceFront, 0.018, {
    color: CORD,
    bone: spine.joints[2],
    sides: 6,
    name: "toothNecklaceCord",
  });
  b.sweep(
    catmull([[-0.43, 2.105, 0.15], [-0.32, 2.14, -0.23], [0, 2.15, -0.34], [0.32, 2.14, -0.23], [0.43, 2.105, 0.15]]),
    0.018,
    { color: CORD, bone: spine.joints[2], sides: 6 },
  );
  b.along(necklaceFront, 11, (at) => {
    if (Math.abs(at.at.x) < 0.065) return;
    b.spike(at, [at.at.x * 0.6, -1, 0.1], 0.115, 0.035, {
      color: bone,
      bone: spine.joints[2],
      sides: 6,
      name: "necklaceTooth",
    });
    ellipsoid(at.at, [0.029, 0.026, 0.027], "#795c41", spine.joints[2], "toothRootBead", 8);
  });
  trophySkull([0, 1.735, 0.46], 0.071, spine.joints[2]);

  // Right hip: a hanging skull, crossed knucklebones, and two striped feathers.
  b.sweep(
    catmull([[-0.43, 1.24, 0.16], [-0.59, 1.05, 0.26], [-0.61, 0.87, 0.30]]),
    0.014,
    { color: CORD, bone: hips, sides: 5, name: "hipFetishCord" },
  );
  cordKnot([-0.46, 1.18, 0.20], 0.036, hips);
  trophySkull([-0.61, 0.94, 0.315], 0.074, hips);
  longBone([-0.71, 0.83, 0.32], [-0.51, 0.70, 0.33], 0.027, hips);
  longBone([-0.52, 0.84, 0.335], [-0.71, 0.70, 0.34], 0.027, hips);
  cordKnot([-0.61, 0.77, 0.365], 0.034, hips);
  b.cards(
    [
      frame([-0.575, 0.73, 0.34], [0.08, -1, 0.06]),
      frame([-0.675, 0.73, 0.32], [-0.15, -1, 0.02]),
    ],
    featherTexture,
    {
      size: [0.095, 0.255],
      flow: [0, 0, 1],
      sink: 0.015,
      bone: hips,
      name: "hipFetishFeathers",
    },
  );

  // Left hip: a simple tied pair of long bones, not another identical skull.
  b.sweep(
    [[0.43, 1.20, 0.10], [0.56, 1.03, 0.20], [0.58, 0.84, 0.23]],
    0.014,
    { color: CORD, bone: hips, sides: 5 },
  );
  longBone([0.51, 1.00, 0.25], [0.66, 0.77, 0.26], 0.034, hips);
  longBone([0.63, 1.02, 0.24], [0.50, 0.78, 0.29], 0.029, hips);
  cordKnot([0.58, 0.90, 0.30], 0.035, hips);
  for (const [i, c] of [WINE, GOLD, "#6c9d88"].entries()) {
    ellipsoid([0.56, 1.13 - i * 0.055, 0.235], [0.028, 0.026, 0.027], c, hips, "fetishBead", 8);
  }

  // A weathered trophy pole strapped behind the left shoulder, below the crest.
  const pole = catmull([[0.54, 1.78, -0.27], [0.62, 2.22, -0.35], [0.68, 2.67, -0.39]]);
  b.sweep(pole, [0.035, 0.026], {
    color: grain("#544734", "#8a7851", { size: 0.017, seed: 7 }),
    bone: spine.joints[2],
    sides: 6,
    name: "fetishPole",
  });
  longBone([0.55, 2.55, -0.39], [0.83, 2.62, -0.37], 0.034, spine.joints[2]);
  cordKnot([0.69, 2.585, -0.345], 0.046, spine.joints[2]);
  b.sweep(
    [[0.79, 2.60, -0.36], [0.90, 2.48, -0.32], [0.91, 2.30, -0.29]],
    0.011,
    { color: CORD, bone: spine.joints[2], sides: 5 },
  );
  b.cards(
    [frame([0.91, 2.34, -0.29], [0.12, -1, 0.05])],
    featherTexture,
    {
      size: [0.10, 0.25],
      flow: [0, 0, 1],
      bone: spine.joints[2],
      sink: 0.02,
      name: "shoulderFetishFeather",
    },
  );

  // Shoulder moss is a modest silhouette accent, leaving the face unobstructed.
  b.cards(
    [
      frame([0.84, 2.09, -0.24], [0, 1, 0]),
      frame([0.56, 2.08, -0.30], [0, 1, 0]),
      frame([0.94, 2.04, -0.02], [0, 1, 0]),
    ],
    mossTexture,
    {
      size: [0.14, 0.28],
      lean: 180,
      flow: [0, 0, -1],
      bone: leftArm.joints[0],
      sink: 0.02,
      name: "pauldronHangingMoss",
    },
  );

  // Broad shoulder tattoo, placed on exposed skin on the opposite side.
  b.decal(limbs[1].arm.joints[0], warpaint, {
    at: [-0.77, 2.015, 0.25],
    dir: [-0.2, 0.1, 1],
    size: [0.23, 0.30],
    roll: -24,
    lift: 0.003,
    bone: limbs[1].arm.joints[0],
    name: "shoulderWarpaint",
  });

  // Raised swamp warts add species character without replacing the broad forms.
  // Each grows from an actual surface hit and inherits its limb's bone.
  for (const { s, arm, leg } of limbs) {
    const shoulderSurface = b.surface(arm.joints[0]);
    for (const [dx, dy, radius] of [
      [0.00, 0.00, 0.030],
      [0.075, -0.045, 0.021],
      [-0.045, -0.075, 0.018],
    ]) {
      if (s > 0) continue; // Keep the armored shoulder clean.
      const hit = shoulderSurface.nearest([
        s * (0.79 + dx),
        2.055 + dy,
        0.28,
      ]);
      b.stick(
        new THREE.SphereGeometry(1, 7, 5),
        "#789b75",
        hit,
        {
          scale: [radius, radius * 0.58, radius],
          embed: 0.45,
          bone: arm.joints[0],
          name: "shoulderWart",
        },
      );
    }
    const kneeSurface = b.surface(leg.joints[1]);
    for (const [dx, dy, radius] of [
      [0.055, 0.015, 0.022],
      [0.085, -0.040, 0.016],
    ]) {
      const hit = kneeSurface.nearest([
        s * (0.35 + dx),
        0.79 + dy,
        0.28,
      ]);
      b.stick(
        new THREE.SphereGeometry(1, 6, 4),
        "#7f9b72",
        hit,
        {
          scale: [radius, radius * 0.55, radius],
          embed: 0.45,
          bone: leg.joints[1],
          name: "kneeWart",
        },
      );
    }
  }

  // One magical focal accent, framed by leather and bone rather than a halo.
  const charmRune = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 7 L86 39 L73 92 L50 113 L27 92 L14 39Z"
            fill="#203d3b" stroke="#b79c63" stroke-width="6"/>
      <path d="M50 25 L65 46 L50 61 L35 46Z
               M50 62 L50 91 M33 77 L50 92 L67 77"
            fill="none" stroke="#81dfb8" stroke-width="7"
            stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M50 31 L59 46 L50 54 L41 46Z" fill="#b7f0cc"/>
    </svg>`,
    { size: 256 },
  );
  const charmBone = limbs[1].arm.joints[1];
  b.sweep(
    catmull([
      [-1.185, 1.76, 0.17],
      [-1.205, 1.63, 0.235],
      [-1.205, 1.56, 0.235],
    ]),
    0.012,
    { color: CORD, bone: charmBone, sides: 5, name: "bracerCharmCord" },
  );
  b.extrude(
    [[0, 0.11], [0.075, 0.05], [0.05, -0.06], [0, -0.105], [-0.05, -0.06], [-0.075, 0.05]],
    {
      at: [-1.205, 1.53, 0.24],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.033,
      color: leather,
      bone: charmBone,
      name: "bracerCharmBacking",
    },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.14, 0.205), "#ffffff", {
      at: [-1.205, 1.53, 0.259],
      bone: charmBone,
      texture: charmRune,
      name: "mireSpiritRune",
    }),
    0.85,
  );
  for (const s of [1, -1]) {
    b.spike(
      [-1.205 + s * 0.049, 1.49, 0.255],
      [s * 0.15, -1, 0.08],
      0.095,
      0.022,
      {
        color: bone,
        bone: charmBone,
        sides: 6,
        name: "bracerCharmFang",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Little swamp stage. Low and quiet, with the troll remaining the clear hero.
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(1, 1.035, 0.12, 14), mud, {
    at: [0, 0.06, 0.025],
    scale: [1.77, 1, 1.04],
    bone: root,
    flat: true,
    name: "cutawaySwampEarth",
  });
  b.part(new THREE.CylinderGeometry(1, 1.015, 0.033, 14), "#263d37", {
    at: [0, 0.025, 0.025],
    scale: [1.80, 1, 1.065],
    bone: root,
    flat: true,
    name: "darkBaseRim",
  });

  // Two shallow pools, seated into the mud rather than floating above it.
  const pools = [
    { x: -0.93, z: 0.35, rx: 0.50, rz: 0.37 },
    { x: 0.90, z: -0.33, rx: 0.43, rz: 0.29 },
  ];
  for (const pool of pools) {
    b.part(new THREE.CylinderGeometry(1, 1, 0.009, 13), "#2c554b", {
      at: [pool.x, 0.124, pool.z],
      scale: [pool.rx, 1, pool.rz],
      bone: root,
      flat: true,
      name: "stillSwampWater",
    });
    b.part(new THREE.PlaneGeometry(pool.rx * 1.75, pool.rz * 1.7), "#ffffff", {
      at: [pool.x, 0.130, pool.z],
      rotation: [-90, 0, 0],
      texture: waterTexture,
      bone: root,
      name: "waterRipples",
    });
  }

  // Broad low-poly stones frame the feet without hiding the planted toes.
  const stones = [
    [-0.74, 0.155, 0.74, 0.18],
    [0.78, 0.17, 0.55, 0.16],
    [-1.36, 0.16, -0.21, 0.20],
    [1.33, 0.15, 0.05, 0.17],
    [0.02, 0.15, -0.72, 0.22],
    [0.81, 0.15, -0.75, 0.16],
  ];
  for (const [x, y, z, r] of stones) {
    b.part(new THREE.DodecahedronGeometry(r, 0), "#5c6d59", {
      at: [x, y, z],
      scale: [1.25, 0.46, 0.87],
      rotation: [0, random() * 90, 0],
      bone: root,
      flat: true,
      name: "mossyStone",
    });
  }

  function reedClump(x: number, z: number, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + random() * 0.3;
      const height = 0.26 + random() * 0.28;
      const dx = Math.cos(angle);
      const dz = Math.sin(angle);
      const at = [x + dx * 0.075, 0.13, z + dz * 0.075];
      b.extrude(
        [[-0.015, 0], [0.019, 0.02], [0.031, height * 0.63], [0.105, height], [-0.005, height * 0.63]],
        {
          at,
          x: [dx, 0, dz],
          y: [0, 1, 0],
          thickness: 0.008,
          color: i % 3 === 0 ? "#a1a26b" : i % 2 ? "#6b8554" : "#526f4c",
          bone: root,
          name: "swampReedBlade",
        },
      );
      if (i % 4 === 0) {
        const stalkTop = [at[0] + dx * 0.035, 0.13 + height * 0.9, at[2] + dz * 0.035];
        b.rod(at, stalkTop, 0.007, { color: "#899365", bone: root, sides: 5 });
        b.capsule(
          stalkTop,
          [stalkTop[0], stalkTop[1] + 0.09, stalkTop[2]],
          0.020,
          { color: "#765d3d", bone: root, sides: 6, name: "reedSeedHead" },
        );
      }
    }
  }
  reedClump(-1.27, -0.49, 7);
  reedClump(1.29, -0.46, 7);
  reedClump(0.91, 0.63, 4);

  function mushroom(x: number, z: number, h: number, r: number) {
    b.sweep(
      catmull([[x, 0.13, z], [x - r * 0.12, 0.13 + h * 0.6, z], [x, 0.13 + h, z]]),
      [r * 0.25, r * 0.16],
      { color: "#abb08a", bone: root, sides: 6, name: "mushroomStem" },
    );
    glow(
      b.part(new THREE.CylinderGeometry(r * 0.87, r * 0.78, 0.018, 9), "#b9ce79", {
        at: [x, 0.13 + h, z],
        bone: root,
        flat: true,
        name: "luminousGills",
      }),
      0.7,
    );
    const cap = b.lathe(
      [
        [0, 0.035],
        [r * 0.25, 0.012],
        [r, 0],
        [r * 0.90, r * 0.32],
        [r * 0.45, r * 0.67],
        [0, r * 0.72],
      ],
      {
        at: [x, 0.13 + h, z],
        segments: 9,
        color: "#758c51",
        bone: root,
        name: "swampMushroomCap",
      },
    );
    for (const hit of b.surface(cap).scatter(5, {
      rng: random,
      minDist: r * 0.32,
      filter: (hit) => hit.n.y > 0.2,
    })) {
      b.stick(new THREE.SphereGeometry(r * 0.10, 5, 3), "#d7d596", hit, {
        scale: [1, 0.35, 1],
        embed: 0.35,
        bone: root,
        name: "capFreckle",
      });
    }
  }
  mushroom(-1.27, 0.05, 0.17, 0.13);
  mushroom(-1.43, 0.17, 0.10, 0.085);
  mushroom(1.18, -0.64, 0.23, 0.15);
  mushroom(1.42, -0.58, 0.12, 0.095);

  // Small floating leaves make the water read as a swamp rather than painted discs.
  function lilyPad(x: number, z: number, radius: number, turn: number) {
    const padPoints = [];
    for (let i = 0; i <= 11; i++) {
      const angle = turn + 0.23 + (i / 11) * (Math.PI * 2 - 0.46);
      padPoints.push([
        x + Math.cos(angle) * radius,
        0.137,
        z + Math.sin(angle) * radius * 0.81,
      ]);
    }
    padPoints.push([x, 0.137, z]);
    b.slab(padPoints, {
      color: "#668653",
      thickness: 0.006,
      bone: root,
      name: "notchedLilyPad",
    });
    for (const angle of [turn + 1.15, turn + 2.7, turn + 4.25]) {
      b.rod(
        [x, 0.142, z],
        [
          x + Math.cos(angle) * radius * 0.77,
          0.142,
          z + Math.sin(angle) * radius * 0.62,
        ],
        0.0035,
        { color: "#91a36a", bone: root, sides: 4, name: "lilyPadVein" },
      );
    }
  }
  lilyPad(-1.07, 0.43, 0.115, 0.6);
  lilyPad(-0.80, 0.27, 0.082, -1.2);
  lilyPad(0.98, -0.30, 0.102, 2.0);

  for (const [x, z, radius] of [
    [-1.11, 0.23, 0.014],
    [-1.16, 0.27, 0.010],
    [0.79, -0.39, 0.015],
    [0.82, -0.355, 0.008],
  ]) {
    ellipsoid(
      [x, 0.134, z],
      [radius, radius * 0.48, radius],
      "#86a78a",
      root,
      "swampBubble",
      7,
    );
  }

  // One old offering half sunk in the mud tells the story without adding a prop wall.
  longBone([-0.84, 0.16, -0.63], [-0.53, 0.165, -0.52], 0.037, root);
  b.sweep(
    bezier([0.97, 0.13, 0.26], [1.10, 0.31, 0.33], [1.25, 0.13, 0.41]),
    0.022,
    { color: bone, bone: root, sides: 6, name: "halfBuriedRib" },
  );

  return b.root;
}
