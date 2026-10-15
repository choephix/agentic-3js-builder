import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  paint,
  mottle,
  mix,
  noise,
  svg,
} from "../../../../src/index";
import { cel, animeEye } from "../../../../kits/toon";

export const meta = {
  name: "Emberleaf — Red Panda",
  description:
    "A bright-eyed red panda balancing with outstretched paws on a moss-covered stone. Faceted cinnamon fur, cream cheek fans, a lavish ringed tail, and hand-drawn details give this woodland animal an anime-fantasy finish.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Emberleaf", paintSize: 2048 });
  const random = rng(417);

  const INK = "#302334";
  const NOSE = "#352333";
  const CREAM = cel("#fff0cf", "#d8b6a4");
  const PALE = cel("#fff8de", "#e5c7ac");
  const RED = cel("#d86a3b", "#93434b");
  const LIGHT_RED = cel("#ef9654", "#b85b49");
  const DEEP_RED = cel("#a74937", "#703442");
  const BROWN = cel("#49343c", "#302936");
  const BROWN_LIGHT = cel("#6d4544", "#42303b");
  const CLAW = cel("#d8bf9d", "#8f7979");
  const MOSS = cel("#779c48", "#355a47");
  const MOSS_LIGHT = cel("#a8bb5b", "#547745");
  const MOSS_DARK = cel("#496b44", "#2e4940");

  const bodyCoat = cel(
    paint((p, n) => {
      const boundary = 0.25 + 0.08 * Math.sin(p.y * 55);
      return n.z > boundary && p.y < 0.715 ? "#54383d" : "#cf6439";
    }),
    "#693b43",
  );

  const rockPaint = paint((p, n) => {
    const fleck = noise(p, 0.055, 19);
    let color = mix("#485e66", "#869488", 0.3 + fleck * 0.5);
    if (n.y > 0.55) color = mix(color, "#b5b79a", 0.25);
    if (p.y < 0.06) color = mix(color, "#354852", 0.35);
    return color;
  });

  const mossPaint = cel(
    mottle("#527846", "#91a653", { size: 0.055, seed: 83 }),
    "#3d6047",
  );

  const tailPaint = cel(
    paint((_p, n, s) => {
      const t = s[0];
      const edge = t * 7.2 + 0.035 * Math.cos((s[1] * Math.PI) / 45);
      const band = edge - Math.floor(edge);
      const dark = band < 0.43;
      if (t > 0.94) return "#7e4038";
      return dark
        ? mix("#9c4837", "#bd603c", Math.max(0, n.y))
        : mix("#e18b50", "#ffd094", Math.max(0, n.y));
    }),
    "#955046",
  );

  const eyeTexture = animeEye({
    iris: "#8abf72",
    irisLight: "#d5e7a0",
    irisDark: "#375e57",
    ink: INK,
    blush: false,
    brow: false,
    size: 512,
  });

  const cheekTexture = svg(
    `<svg viewBox="0 0 120 70">
      <path d="M17 23 Q37 15 56 24 M29 37 Q52 30 76 39 M54 49 Q74 43 99 47"
        fill="none" stroke="#b58a76" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M14 15 L25 12 M61 17 L70 19" fill="none"
        stroke="#fff8df" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const earTexture = svg(
    `<svg viewBox="0 0 80 100">
      <path d="M16 86 Q9 57 27 19 Q33 8 42 16 Q68 42 65 82
        L54 73 L48 86 L38 76 L28 88Z" fill="#bb7967"/>
      <path d="M27 66 Q25 40 37 26 Q48 42 52 65
        L43 60 L38 71 L32 61Z" fill="#e9b895"/>
      <path d="M30 36 Q32 27 36 24" fill="none" stroke="#ffdfb7"
        stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const furTexture = svg(
    `<svg viewBox="0 0 120 70">
      <path d="M14 20 Q28 28 43 27 M31 37 Q50 48 67 43
        M64 24 Q80 34 99 29 M75 52 L96 55"
        fill="none" stroke="#9c493d" stroke-width="3.8" stroke-linecap="round"/>
      <path d="M22 12 L34 15 M68 15 L81 18" fill="none"
        stroke="#ffd398" stroke-width="3.2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const mossTexture = svg(
    `<svg viewBox="0 0 80 100">
      <path d="M39 99 Q45 61 36 13" fill="none" stroke="#c4cf7e" stroke-width="5"/>
      <path d="M39 81 Q10 80 8 57 Q28 57 40 74
        M41 66 Q70 63 73 40 Q49 45 41 60
        M39 51 Q16 48 15 29 Q33 31 39 45
        M38 34 Q58 27 56 9 Q40 14 38 28
        M36 21 Q24 11 32 1 Q42 10 36 21Z"
        fill="#96ae57" stroke="#587d45" stroke-width="2.5"/>
      <path d="M14 64 L38 79 M45 60 L65 48 M21 35 L37 47"
        fill="none" stroke="#d4d88b" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );

  const crackTexture = svg(
    `<svg viewBox="0 0 160 100">
      <path d="M4 18 L44 28 L66 46 L95 43 L116 72 L157 81
        M66 46 L58 75 L35 94 M95 43 L111 15 L134 6"
        fill="none" stroke="#3e535b" stroke-width="4" stroke-linejoin="bevel"/>
      <path d="M6 13 L46 23 L69 41 M119 67 L155 76"
        fill="none" stroke="#a8b2a1" stroke-width="2.5"/>
      <g fill="#b4bf91">
        <ellipse cx="36" cy="48" rx="8" ry="4"/>
        <ellipse cx="25" cy="57" rx="4" ry="3"/>
        <ellipse cx="133" cy="37" rx="9" ry="5"/>
        <ellipse cx="145" cy="43" rx="4" ry="3"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. The arms are spread for balance; both hind paws
  // have independent, planted contacts on the stone.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 0.465, -0.015],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.465, -0.015],
      [0, 0.605, -0.025],
      [0, 0.745, 0],
    ],
    { parent: hips, names: ["spineLow", "chest", "neckBase"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.745, 0],
      [0, 0.825, 0.035],
    ],
    { parent: spine.tip!, names: ["neck", "neckTip"], role: "neck" },
  );

  const H = 1.08;
  const face = b.region({ at: [0, 0.885, 0.045], scale: H });
  const head = b.joint("head", {
    parent: neck.tip!,
    at: face.p([0, 0, 0]),
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: face.p([0, -0.088, 0.065]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.465, -0.105],
      [0.1, 0.435, -0.275],
      [0.29, 0.395, -0.435],
      [0.51, 0.4, -0.48],
      [0.705, 0.48, -0.45],
      [0.8, 0.605, -0.39],
    ]),
    { parent: hips, count: 7, role: "tail" },
  );

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.125, 0.725, 0],
        [s * 0.28, 0.705, 0.005],
        [s * 0.415, 0.68, 0.028],
        [s * 0.47, 0.68, 0.035],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "arm",
      },
    );
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.105, 0.47, -0.015],
        [s * 0.145, 0.355, 0.015],
        [s * 0.125, 0.277, 0.045],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.125, 0.22, 0.08],
      },
    );

    const fingers = [-1, 0, 1].map((i) =>
      b.chain(
        `finger${side}${i + 2}`,
        [
          [s * 0.476, 0.68, 0.035 + i * 0.027],
          [s * (0.533 - Math.abs(i) * 0.007), 0.675, 0.035 + i * 0.043],
        ],
        { parent: arm.tip!, count: 1, role: "digit" },
      ),
    );
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 0.46, 0.66, 0.045],
        [s * 0.479, 0.626, 0.068],
      ],
      { parent: arm.tip!, count: 1, role: "digit" },
    );
    const toes = [-1, 0, 1].map((i) =>
      b.chain(
        `toe${side}${i + 2}`,
        [
          [s * 0.125 + i * 0.031, 0.249, 0.095],
          [s * 0.125 + i * 0.034, 0.246, 0.146 - Math.abs(i) * 0.007],
        ],
        { parent: leg.tip!, count: 1, role: "digit" },
      ),
    );
    return { s, side, arm, leg, fingers, thumb, toes };
  });

  type Fill = Parameters<typeof b.part>[1];
  type Bone = typeof head;

  function ellipsoid(
    name: string,
    at: number[] | THREE.Vector3,
    scale: number[],
    color: Fill,
    bone: Bone,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 7), color, {
      at,
      scale,
      bone,
      name,
      flat: true,
    });
  }

  function faceOval(
    name: string,
    at: number[],
    size: number[],
    color: Fill,
    bone: Bone = head,
  ) {
    return ellipsoid(name, face.p(at), size.map((v) => v * H), color, bone, 12);
  }

  function furBlade(
    name: string,
    base: number[] | THREE.Vector3,
    tip: number[] | THREE.Vector3,
    width: number,
    color: Fill,
    bone: Bone,
  ) {
    const a = base instanceof THREE.Vector3 ? base : new THREE.Vector3(...(base as [number, number, number]));
    const z = tip instanceof THREE.Vector3 ? tip : new THREE.Vector3(...(tip as [number, number, number]));
    const c = a.clone().lerp(z, 0.48);
    c.z += width * 0.18;
    return b.sweep(bezier(a, c, z), [width * 0.82, width, 0.002], {
      color,
      bone,
      sides: 5,
      smooth: false,
      caps: "flat",
      name,
    });
  }

  // One low, broad stone, with a level upper face for the paw contacts.
  const rock = b.extrude(
    [
      [-0.36, -0.13],
      [-0.29, -0.275],
      [-0.05, -0.315],
      [0.235, -0.265],
      [0.36, -0.095],
      [0.32, 0.17],
      [0.12, 0.275],
      [-0.17, 0.26],
      [-0.355, 0.11],
    ],
    {
      at: [0, 0.11, 0.015],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.22,
      bevel: 0.033,
      detail: 0.65,
      color: rockPaint,
      bone: root,
      name: "mossyStone",
    },
  );
  b.decal(rock, crackTexture, {
    at: [0, 0.105, 0.29],
    dir: [0, 0.05, 1],
    size: [0.47, 0.16],
    bone: root,
    name: "stoneFractures",
  });

  const stoneSurface = b.surface(rock);
  const mossHits = stoneSurface.scatter(44, {
    rng: random,
    minDist: 0.035,
    filter: (hit) => {
      const p = hit.at;
      const nearFoot =
        Math.abs(Math.abs(p.x) - 0.125) < 0.065 &&
        p.z > 0.015 &&
        p.z < 0.17;
      return p.y > 0.115 && hit.n.y > 0.3 && !nearFoot;
    },
  });

  for (let i = 0; i < mossHits.length; i++) {
    const radius = 0.022 + random() * 0.028;
    b.stick(
      new THREE.DodecahedronGeometry(1, 0),
      i % 4 === 0 ? MOSS_LIGHT : mossPaint,
      mossHits[i],
      {
        scale: [radius * 1.3, 0.009 + random() * 0.008, radius],
        embed: 0.35,
        name: `mossCushion${i}`,
      },
    );
  }

  const mossSprigs = stoneSurface.scatter(18, {
    rng: rng(71),
    minDist: 0.045,
    filter: (hit) =>
      hit.n.y > 0.6 &&
      (Math.abs(hit.at.x) > 0.235 || hit.at.z < -0.11),
  });
  b.cards(mossSprigs, mossTexture, {
    size: [0.035, 0.065],
    lean: 25,
    bend: 20,
    cross: true,
    vary: 0.35,
    rng: rng(63),
    flow: [0, 0, 1],
    name: "mossFronds",
  });

  // Body: a simple, broad pear with a dark velvety front.
  const torso = b.sweep(
    spine,
    (t) => [
      0.125 + 0.035 * Math.sin(t * Math.PI),
      0.105 + 0.025 * Math.sin(t * Math.PI),
    ],
    {
      color: bodyCoat,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "pearShapedBody",
    },
  );
  b.sweep(neck, [0.094, 0.088], {
    color: DEEP_RED,
    sides: 8,
    name: "neckFur",
  });

  const belly = ellipsoid(
    "darkBelly",
    [0, 0.567, 0.082],
    [0.126, 0.16, 0.046],
    BROWN,
    spine.joints[0],
  );

  // Short chevrons make the dark chest read as fur, not clothing.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.037;
    furBlade(
      `chestChevron${i}`,
      [x, 0.719 - Math.abs(i - 2) * 0.006, 0.098],
      [x * 1.18, 0.668 - (i % 2) * 0.012, 0.127],
      0.025,
      i === 2 ? LIGHT_RED : RED,
      spine.joints[1],
    );
  }

  // A small pale throat tuft, not a large cream belly.
  for (let i = 0; i < 3; i++) {
    furBlade(
      `throatTuft${i}`,
      [(i - 1) * 0.032, 0.786, 0.097],
      [(i - 1) * 0.04, 0.739 - (i === 1 ? 0.012 : 0), 0.12],
      0.028,
      CREAM,
      neck.joints[0],
    );
  }

  // The broad tail is intentionally held out clear of the legs.
  const tailTube = b.sweep(
    tail,
    [0.071, 0.106, 0.112, 0.105, 0.084, 0.048, 0.007],
    {
      color: tailPaint,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "sevenRingTail",
    },
  );
  for (let i = 0; i < 13; i++) {
    const t = 0.13 + i * 0.059;
    const hit = tailTube.at(t, i % 2 ? 70 : -65);
    b.stick(
      new THREE.ConeGeometry(0.019 - t * 0.008, 0.05 - t * 0.02, 5),
      Math.floor(t * 7.2) % 2 ? LIGHT_RED : RED,
      hit,
      { embed: 0.72, flow: tail.at(t).tangent, name: `tailFurEdge${i}` },
    );
  }

  // Limbs and separated digits.
  for (const { s, side, arm, leg, fingers, thumb, toes } of limbs) {
    b.sweep(arm, [0.072, 0.066, 0.047, 0.038], {
      color: BROWN,
      bands: [
        [0.39, RED],
        [0.57, DEEP_RED],
        [1, BROWN],
      ],
      sides: 8,
      smooth: false,
      name: `outstretchedArm${side}`,
    });
    b.sweep(leg, [0.081, 0.065, 0.041], {
      color: BROWN,
      sides: 8,
      smooth: false,
      name: `hindLeg${side}`,
    });

    ellipsoid(
      `haunch${side}`,
      [s * 0.116, 0.431, -0.02],
      [0.077, 0.098, 0.081],
      DEEP_RED,
      leg.joints[0],
    );
    ellipsoid(
      `hindPaw${side}`,
      [s * 0.125, 0.258, 0.084],
      [0.061, 0.038, 0.076],
      BROWN,
      leg.tip!,
    );
    ellipsoid(
      `palm${side}`,
      [s * 0.46, 0.678, 0.034],
      [0.047, 0.037, 0.05],
      BROWN,
      arm.tip!,
    );
    ellipsoid(
      `palmHighlight${side}`,
      [s * 0.462, 0.688, 0.073],
      [0.028, 0.018, 0.013],
      BROWN_LIGHT,
      arm.tip!,
      8,
    );

    for (let j = 0; j < fingers.length; j++) {
      const digit = fingers[j];
      b.sweep(digit, [0.018, 0.013], {
        color: BROWN,
        sides: 6,
        name: `fingerFur${side}${j}`,
      });
      const tip = digit.at(1).at;
      b.spike(
        tip,
        [tip.x + s * 0.017, tip.y - 0.003, tip.z + 0.004],
        null,
        0.007,
        { bone: digit.joints[0], color: CLAW, sides: 5, name: `fingerClaw${side}${j}` },
      );
    }
    b.sweep(thumb, [0.019, 0.012], { color: BROWN, sides: 6 });
    for (let j = 0; j < toes.length; j++) {
      const toe = toes[j];
      b.sweep(toe, [0.019, 0.016], {
        color: BROWN,
        sides: 6,
        name: `toeFur${side}${j}`,
      });
      const tip = toe.at(1).at;
      b.spike(tip, [tip.x, tip.y - 0.003, tip.z + 0.018], null, 0.007, {
        color: CLAW,
        bone: toe.joints[0],
        sides: 5,
        name: `toeClaw${side}${j}`,
      });
    }

    for (let i = 0; i < 4; i++) {
      furBlade(
        `shoulderFringe${side}${i}`,
        [s * (0.13 + i * 0.028), 0.747 - i * 0.006, -0.004],
        [s * (0.168 + i * 0.033), 0.786 - i * 0.013, -0.015],
        0.027 - i * 0.002,
        i % 2 ? RED : LIGHT_RED,
        arm.joints[0],
      );
    }
    for (let i = 0; i < 3; i++) {
      furBlade(
        `hipFringe${side}${i}`,
        [s * 0.145, 0.49 - i * 0.026, -0.018],
        [s * (0.194 - i * 0.007), 0.466 - i * 0.027, -0.015],
        0.025,
        i === 0 ? RED : DEEP_RED,
        leg.joints[0],
      );
    }
    for (let i = 0; i < 2; i++) {
      furBlade(
        `elbowFringe${side}${i}`,
        [s * (0.285 + i * 0.037), 0.69, 0.008],
        [s * (0.306 + i * 0.037), 0.647 - i * 0.004, 0.009],
        0.021,
        BROWN_LIGHT,
        arm.joints[1],
      );
    }
  }

  // Settle the face before its surrounding ruffs and ears.
  const skull = faceOval("wideCinnamonSkull", [0, 0, 0], [0.184, 0.146, 0.14], RED);
  faceOval("foreheadLight", [0, 0.067, 0.064], [0.129, 0.082, 0.078], LIGHT_RED);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const cheek = faceOval(
      `creamCheek${side}`,
      [s * 0.122, -0.063, 0.078],
      [0.1, 0.077, 0.084],
      CREAM,
    );

    // Dark cinnamon eye surround and the characteristic descending tear.
    faceOval(
      `eyeMask${side}`,
      [s * 0.099, 0.012, 0.112],
      [0.068, 0.077, 0.04],
      DEEP_RED,
    );
    b.extrude(
      [
        [-0.026, 0.035],
        [0.026, 0.025],
        [0.04, -0.014],
        [0.023, -0.072],
        [-0.002, -0.055],
      ],
      {
        at: face.p([s * 0.115, -0.017, 0.138]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.015,
        smoothing: 1,
        color: DEEP_RED,
        bone: head,
        name: `tearMark${side}`,
      },
    );

    const eye = faceOval(
      `eyeVolume${side}`,
      [s * 0.093, 0.019, 0.143],
      [0.049, 0.062, 0.025],
      INK,
    );
    b.decal(eye, eyeTexture, {
      at: face.p([s * 0.093, 0.019, 0.172]),
      dir: [0, 0, 1],
      size: [0.098 * H, 0.125 * H],
      mirror: s > 0,
      segments: 12,
      bone: head,
      name: `jadeEye${side}`,
    });

    b.sweep(
      bezier(
        face.p([s * 0.051, 0.093, 0.13]),
        face.p([s * 0.093, 0.119, 0.132]),
        face.p([s * 0.139, 0.095, 0.106]),
      ),
      [0.015, 0.017, 0.006],
      { color: PALE, bone: head, sides: 6, name: `creamBrow${side}` },
    );

    b.decal(cheek, cheekTexture, {
      at: face.p([s * 0.153, -0.071, 0.151]),
      dir: [s * 0.25, 0, 1],
      size: [0.083 * H, 0.049 * H],
      mirror: s > 0,
      bone: head,
      name: `cheekHatching${side}`,
    });
  }

  // Two upper muzzle cushions and a separate lower jaw.
  faceOval("muzzleBridge", [0, -0.053, 0.135], [0.06, 0.059, 0.052], LIGHT_RED);
  faceOval("mouthShadow", [0, -0.104, 0.173], [0.081, 0.023, 0.033], INK, jaw);
  faceOval("lowerJaw", [0, -0.118, 0.151], [0.088, 0.028, 0.057], CREAM, jaw);

  for (const s of [1, -1]) {
    faceOval(
      `muzzleCushion${s > 0 ? "L" : "R"}`,
      [s * 0.039, -0.077, 0.169],
      [0.058, 0.04, 0.043],
      PALE,
    );
  }

  b.extrude(
    [
      [-0.032, 0.01],
      [-0.022, 0.024],
      [0.022, 0.024],
      [0.032, 0.01],
      [0.013, -0.014],
      [0, -0.019],
      [-0.013, -0.014],
    ],
    {
      at: face.p([0, -0.057, 0.208]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.023,
      bevel: 0.004,
      color: NOSE,
      bone: head,
      name: "softTriangularNose",
    },
  );
  faceOval("noseGlint", [-0.009, -0.045, 0.222], [0.012, 0.004, 0.002], "#b696a3");

  b.sweep(
    [
      face.p([0, -0.072, 0.215]),
      face.p([0, -0.092, 0.212]),
    ],
    0.003,
    { color: INK, bone: head, sides: 5, name: "philtrum" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        face.p([0, -0.093, 0.21]),
        face.p([s * 0.024, -0.112, 0.205]),
        face.p([s * 0.05, -0.095, 0.201]),
      ),
      0.0028,
      { color: INK, bone: head, sides: 5, name: `smile${s > 0 ? "L" : "R"}` },
    );
    for (let i = 0; i < 3; i++) {
      faceOval(
        `whiskerFreckle${s}_${i}`,
        [s * (0.039 + (i % 2) * 0.015), -0.068 - i * 0.012, 0.21 - i * 0.003],
        [0.003, 0.0028, 0.0017],
        "#997267",
      );
    }
    for (let i = 0; i < 2; i++) {
      b.sweep(
        bezier(
          face.p([s * 0.069, -0.075 - i * 0.016, 0.196]),
          face.p([s * 0.13, -0.074 - i * 0.018, 0.207]),
          face.p([s * 0.181, -0.054 - i * 0.034, 0.191]),
        ),
        [0.0018, 0.0007],
        { color: "#e8d1b1", bone: head, sides: 4, name: `whisker${s}_${i}` },
      );
    }
  }

  // Cream fans give the silhouette its unmistakable red-panda cheeks.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const base = face.p([s * (0.137 - i * 0.004), -0.025 - i * 0.029, 0.058]);
      const tip = face.p([
        s * (0.23 - i * 0.014),
        -0.032 - i * 0.038,
        0.075 - i * 0.009,
      ]);
      furBlade(
        `cheekFan${s}_${i}`,
        base,
        tip,
        (0.029 - i * 0.002) * H,
        i < 2 ? PALE : CREAM,
        head,
      );
    }
    for (let i = 0; i < 2; i++) {
      furBlade(
        `templeTuft${s}_${i}`,
        face.p([s * 0.143, 0.047 - i * 0.026, 0.015]),
        face.p([s * (0.211 + i * 0.005), 0.051 - i * 0.038, -0.003]),
        0.027 * H,
        i === 0 ? LIGHT_RED : RED,
        head,
      );
    }
  }

  // Rounded, thick triangular ears: dark backs, cream rims, illustrated insets.
  const earOutline = [
    [-0.045, 0],
    [0.078, -0.009],
    [0.094, 0.096],
    [0.06, 0.158],
    [0.027, 0.153],
    [-0.026, 0.096],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earBase = [s * 0.118, 0.09, -0.015];
    b.extrude(
      earOutline.map(([x, y]) => [x * H, y * H]),
      {
        at: face.p(earBase),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.06 * H,
        smoothing: 1,
        bevel: 0.008,
        color: DEEP_RED,
        bone: head,
        name: `earBack${side}`,
      },
    );
    b.extrude(
      earOutline.map(([x, y]) => [x * H * 0.91, y * H * 0.91]),
      {
        at: face.p([earBase[0], earBase[1] + 0.006, 0.017]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.022 * H,
        smoothing: 1,
        color: PALE,
        bone: head,
        name: `creamEarRim${side}`,
      },
    );
    b.part(new THREE.PlaneGeometry(0.095 * H, 0.127 * H), "#ffffff", {
      at: face.p([s * 0.142, 0.164, 0.031]),
      bone: head,
      dir: [0, 0, 1],
      axis: "z",
      texture: earTexture,
      name: `earPainting${side}`,
    });
    for (let i = 0; i < 3; i++) {
      furBlade(
        `earRootFur${side}${i}`,
        face.p([s * (0.101 + i * 0.026), 0.093, 0.031]),
        face.p([s * (0.105 + i * 0.026), 0.122 + (i === 1 ? 0.014 : 0), 0.04]),
        0.014 * H,
        CREAM,
        head,
      );
    }
  }

  for (let i = 0; i < 3; i++) {
    furBlade(
      `forelock${i}`,
      face.p([(i - 1) * 0.032, 0.108, 0.025]),
      face.p([(i - 1) * 0.043 + 0.014, 0.163 + (i === 1 ? 0.016 : 0), 0.01]),
      0.026 * H,
      i === 1 ? LIGHT_RED : RED,
      head,
    );
  }

  b.decal(skull, furTexture, {
    at: face.p([0, 0.082, 0.137]),
    dir: [0, 0.3, 1],
    size: [0.107 * H, 0.055 * H],
    bone: head,
    name: "foreheadBrushwork",
  });

  // Sparse, broad fur locks on the back preserve the simple puppet base.
  const backHits = b.surface(torso).scatter(14, {
    rng: rng(39),
    minDist: 0.048,
    filter: (hit) => hit.n.z < -0.45 && hit.at.y > 0.48,
  });
  for (let i = 0; i < backHits.length; i++) {
    const hit = backHits[i];
    b.stick(new THREE.ConeGeometry(0.027, 0.055, 5), i % 3 ? RED : LIGHT_RED, hit, {
      embed: 0.7,
      flow: [0, -1, 0],
      name: `backFurLock${i}`,
    });
  }
  const bellySurface = b.surface(belly);
  for (const s of [1, -1]) {
    const hit = bellySurface.around([0, 0.567, 0.082]).at(s * 30, -10);
    if (hit) {
      b.stick(new THREE.SphereGeometry(1, 8, 5), BROWN_LIGHT, hit, {
        scale: [0.019, 0.003, 0.042],
        embed: 0.35,
        flow: [0, 1, 0],
        name: `bellySheen${s}`,
      });
    }
  }

  // Tiny clusters on the stone's lip make the moss feel rooted rather than scattered.
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI;
    const at = [
      Math.cos(a) * 0.285,
      0.175 + 0.018 * Math.sin(a),
      0.16 + 0.065 * Math.sin(a),
    ];
    const hit = stoneSurface.nearest(at);
    b.stick(
      new THREE.DodecahedronGeometry(0.018 + random() * 0.009),
      i % 2 ? MOSS_DARK : MOSS,
      hit,
      { scale: [1.2, 0.55, 1], embed: 0.55, name: `lipMoss${i}` },
    );
    if (i % 2 === 0) {
      b.cards([frame(hit, [0, 1, 0])], mossTexture, {
        size: [0.025, 0.042],
        lean: 120,
        flow: [0, 0, 1],
        bone: root,
        name: `hangingMoss${i}`,
      });
    }
  }

  return b.root;
}
