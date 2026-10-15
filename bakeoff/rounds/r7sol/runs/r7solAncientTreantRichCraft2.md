```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  rng,
  paint,
  grain,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import type {
  Joint,
  FrameInput,
  PointInput,
  Fill,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Thornfather, Keeper of the Elder Grove",
  description:
    "An ancient, broad-shouldered treant guardian: living oak armor, antler-like boughs, a crown of jade foliage, luminous emerald eyes and a rune-lit heart. Root hands and feet are articulated for animation.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Thornfather",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(7319);

  // A warm, heavy oak silhouette against cold living magic.
  const C = {
    seam: "#241b19",
    bark: "#64402b",
    amber: "#ae7540",
    edge: "#c29759",
    root: "#463326",
    moss: "#647c32",
    mossLight: "#9cad46",
    leafDark: "#173c36",
    leaf: "#28664a",
    leafLight: "#558448",
    leafGold: "#a2ad4d",
    stoneDark: "#343f40",
    stone: "#657675",
    stoneLight: "#95a29a",
    soil: "#33332b",
    gold: "#bca46a",
    magic: "#73f7a1",
    magicWhite: "#d1ffd1",
    mushroom: "#c87938",
    gill: "#e7ca8d",
  };

  const woodGrain = grain("#563724", "#93603a", {
    size: 0.027,
    axis: "y",
    seed: 22,
  });
  const bark = paint((p, n) => {
    const low = p.y < 0.65 ? 0.42 : 0.12;
    const weather = noise(p, 0.24, 8);
    if (n.y > 0.55 && weather > 0.64) return "#77743e";
    if (n.y < -0.35) return mix("#3f2a22", "#65412b", weather);
    return mix(woodGrain.at(p, n), "#c3975e", Math.max(0, n.y) * 0.24 + low * 0.05);
  });
  const paleWood = grain("#986538", "#c39453", {
    size: 0.018,
    axis: "y",
    seed: 17,
  });
  const rootWood = grain("#362a22", "#735036", {
    size: 0.033,
    axis: "y",
    seed: 6,
  });
  const stone = paint((p, n) =>
    mix(
      "#424e4f",
      "#93a098",
      0.24 + noise(p, 0.21, 52) * 0.46 + Math.max(0, n.y) * 0.2,
    ),
  );
  const foliage = paint((p, n) =>
    mix(
      "#193f38",
      "#698d46",
      Math.min(1, 0.25 + n.y * 0.35 + noise(p, 0.34, 91) * 0.48),
    ),
  );
  const earth = paint((p, n) =>
    n.y > 0.45
      ? mix("#454631", "#62613d", noise(p, 0.28, 5))
      : mix("#232b29", "#43453a", noise(p, 0.3, 9)),
  );

  // Drawings are deliberately bold enough to read at the model's full scale.
  const eyes = svg(
    `<svg viewBox="0 0 160 72">
      <path d="M3 31 L29 9 L151 16 L132 52 L39 65 Z" fill="#17241c"/>
      <path d="M18 31 L39 22 L139 24 L123 43 L45 51 Z" fill="#2b9b62"/>
      <path d="M27 31 L50 27 L132 27 L118 37 L47 44 Z" fill="#8dffb1"/>
      <path d="M81 25 L92 25 L86 44 L78 46 Z" fill="#e5ffce"/>
      <path d="M23 29 L44 22 L139 23" fill="none" stroke="#d8ffc0" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const heartRune = svg(
    `<svg viewBox="0 0 160 180">
      <path d="M80 8 L141 45 L141 129 L80 171 L19 129 L19 45 Z"
        fill="#192c24" stroke="#78bc77" stroke-width="5"/>
      <path d="M80 22 L127 52 L127 122 L80 154 L33 122 L33 52 Z"
        fill="none" stroke="#416d48" stroke-width="4"/>
      <path d="M80 37 L80 131 M80 82 L51 59 L51 42
        M80 99 L108 75 L108 53 M80 119 L55 102"
        fill="none" stroke="#95ffc0" stroke-width="10"
        stroke-linejoin="bevel" stroke-linecap="square"/>
      <path d="M70 136 L80 147 L91 136" fill="none"
        stroke="#e1ffd0" stroke-width="5"/>
      <circle cx="80" cy="31" r="5" fill="#e1ffd0"/>
      <path d="M25 76 L32 83 L25 90 M135 97 L128 104 L135 111"
        stroke="#9ad89a" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const stoneRune = svg(
    `<svg viewBox="0 0 120 160">
      <path d="M60 9 L102 37 L95 121 L60 149 L24 121 L18 37 Z"
        fill="none" stroke="#263f38" stroke-width="15"/>
      <path d="M60 9 L102 37 L95 121 L60 149 L24 121 L18 37 Z"
        fill="none" stroke="#abc594" stroke-width="4"/>
      <path d="M60 29 L60 127 M60 58 L36 42 M60 81 L86 59
        M60 109 L39 90" fill="none" stroke="#244f42" stroke-width="13"/>
      <path d="M60 29 L60 127 M60 58 L36 42 M60 81 L86 59
        M60 109 L39 90" fill="none" stroke="#91efb3" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const leafDrawing = svg(
    `<svg viewBox="0 0 120 160">
      <path d="M58 158 C52 121 49 90 55 44" fill="none"
        stroke="#b6b56a" stroke-width="5"/>
      <path d="M55 119 L22 118 L4 92 L27 86 L53 100 Z" fill="#3e7750" stroke="#1c4637" stroke-width="3"/>
      <path d="M54 92 L18 80 L8 54 L33 55 L55 74 Z" fill="#558d53" stroke="#214b36" stroke-width="3"/>
      <path d="M56 68 L35 43 L42 12 L60 30 L65 53 Z" fill="#8ca54f" stroke="#325a39" stroke-width="3"/>
      <path d="M59 135 L95 120 L115 94 L87 92 L61 112 Z" fill="#356e4c" stroke="#1c4637" stroke-width="3"/>
      <path d="M58 104 L91 88 L105 59 L79 64 L59 85 Z" fill="#7b9a4d" stroke="#2d5738" stroke-width="3"/>
      <path d="M59 76 L87 51 L87 25 L67 39 L58 59 Z" fill="#59874c" stroke="#214b36" stroke-width="3"/>
      <path d="M19 100 L54 111 M22 65 L54 83 M46 28 L58 61
        M65 122 L102 105 M64 94 L94 72 M63 66 L81 41"
        stroke="#b5bc6c" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const cutEnd = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="62" fill="#c69b61" stroke="#412d22" stroke-width="8"/>
      <path d="M64 14 C98 12 117 44 111 75 C106 108 72 120 41 107
        C11 93 14 55 30 33 C39 20 52 19 64 21
        C90 17 108 45 100 73 C94 99 63 107 42 92
        C21 76 29 43 48 36 C69 27 92 42 88 65
        C86 85 62 94 49 79 C35 63 48 46 62 48
        C77 47 82 65 69 72 C59 79 51 67 59 61"
        fill="none" stroke="#805333" stroke-width="4"/>
      <path d="M63 4 L60 29 L70 39 M121 75 L101 69 L92 77 M26 112 L40 94"
        fill="none" stroke="#503521" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const knotDrawing = svg(
    `<svg viewBox="0 0 96 160">
      <path d="M47 5 C42 34 12 53 13 85 C14 120 39 126 47 155
        C54 125 81 110 82 81 C84 51 56 30 47 5 Z"
        fill="#503423" stroke="#c18c50" stroke-width="5"/>
      <path d="M47 34 C25 64 23 89 46 120 C68 99 74 70 47 34 Z"
        fill="#30251e" stroke="#9e6b3d" stroke-width="6"/>
      <path d="M48 57 C34 74 37 94 48 103 C60 86 59 69 48 57 Z"
        fill="#1f211a" stroke="#6e5130" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const baseLabel = svg(
    `<svg viewBox="0 0 420 100">
      <path d="M3 3 H417 V97 H3 Z" fill="#27332e" stroke="#9b9866" stroke-width="6"/>
      <path d="M19 20 L29 50 L19 80 M401 20 L391 50 L401 80"
        fill="none" stroke="#b7b27a" stroke-width="4"/>
      <text x="210" y="46" text-anchor="middle" font-family="serif"
        font-size="26" font-weight="bold" letter-spacing="5" fill="#ded4a1">THORNFATHER</text>
      <text x="210" y="74" text-anchor="middle" font-family="serif"
        font-size="13" letter-spacing="4" fill="#96ac86">KEEPER OF THE ELDER GROVE</text>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton first. The canopy, digits, root feet and jaw have independent chains.
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.63, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.63, 0], [0, 2.45, -0.04], [0, 3.24, -0.03]],
    { parent: hips, names: ["spineLower", "chest", "spineTop"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [[0, 3.23, -0.03], [0, 3.66, 0.02]],
    { parent: spine.tip!, names: ["neck", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 3.91, 0.12],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 3.57, 0.18],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.91, 3.22, -0.02],
        [s * 1.57, 2.96, 0.03],
        [s * 2.08, 2.57, 0.13],
        [s * 2.28, 2.43, 0.22],
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
        [s * 0.46, 1.75, -0.02],
        [s * 0.65, 1.04, 0.1],
        [s * 0.73, 0.44, 0.2],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.73, 0.16, 0.46],
      },
    );
    const fingers = [0, 1, 2].map((i) => {
      const x = 2.18 + i * 0.17;
      return b.chain(
        `finger${side}${i + 1}`,
        [
          [s * x, 2.38, 0.24 + i * 0.055],
          [s * (x + 0.11), 2.12, 0.34 + i * 0.07],
          [s * (x + 0.16 + i * 0.035), 1.89 - i * 0.035, 0.5 + i * 0.07],
        ],
        { parent: arm.tip!, count: 2, role: "digit" },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 2.12, 2.55, 0.28],
        [s * 1.99, 2.38, 0.54],
        [s * 2.02, 2.18, 0.71],
      ],
      { parent: arm.tip!, count: 2, role: "digit" },
    );
    const toes = [-1, 0, 1].map((i) =>
      b.chain(
        `rootToe${side}${i + 2}`,
        [
          [s * 0.73 + i * 0.15, 0.43, 0.26],
          [s * 0.77 + i * 0.24, 0.27, 0.66],
          [s * 0.78 + i * 0.34, 0.2, 1.02 - Math.abs(i) * 0.08],
        ],
        { parent: leg.tip!, count: 2, role: "digit" },
      ),
    );
    const crown = b.chain(
      `crownBough${side}`,
      [
        [s * 0.39, 4.28, -0.05],
        [s * 0.63, 4.77, -0.16],
        [s * 1.14, 5.16, -0.27],
        [s * 1.54, 5.57, -0.25],
      ],
      { parent: head, count: 3, role: "fan" },
    );
    const shoulderBough = b.chain(
      `shoulderBough${side}`,
      [
        [s * 0.94, 3.33, -0.2],
        [s * 1.35, 3.95, -0.42],
        [s * 1.85, 4.42, -0.48],
      ],
      { parent: arm.joints[0], count: 2, role: "fan" },
    );
    return { s, side, arm, leg, fingers, thumb, toes, crown, shoulderBough };
  });

  // ---------------------------------------------------------------------------
  // Reusable primitive assemblies.
  // ---------------------------------------------------------------------------
  function ellipsoid(
    at: PointInput,
    scale: number[],
    color: Fill,
    bone: Joint = root,
    detail = 0,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at,
      scale,
      bone,
      flat: true,
    });
  }

  function box(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint = root,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation,
    });
  }

  // A broad, chipped strip of bark, not a smooth fur-like splinter.
  const plateShape = new THREE.Shape();
  plateShape.moveTo(-0.42, -0.49);
  plateShape.lineTo(-0.53, -0.18);
  plateShape.lineTo(-0.45, 0.3);
  plateShape.lineTo(-0.19, 0.54);
  plateShape.lineTo(0.16, 0.47);
  plateShape.lineTo(0.46, 0.2);
  plateShape.lineTo(0.4, -0.35);
  plateShape.lineTo(0.09, -0.55);
  plateShape.lineTo(-0.05, -0.34);
  plateShape.lineTo(-0.17, -0.54);
  plateShape.closePath();
  const plateGeometry = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.16,
    bevelEnabled: false,
    curveSegments: 1,
    steps: 1,
  });
  plateGeometry.translate(0, 0, -0.08);
  plateGeometry.rotateX(Math.PI / 2);

  function plate(
    on: FrameInput,
    width: number,
    length: number,
    color: Fill = bark,
    spin = 0,
  ) {
    return b.stick(plateGeometry, color, on, {
      scale: [width, 0.8, length],
      flow: [0, 1, 0],
      spin,
      embed: 0.3,
    });
  }

  function branch(
    points: PointInput[],
    r: number,
    bone: Joint,
    color: Fill = bark,
  ) {
    return b.sweep(catmull(points), [r, r * 0.7, r * 0.28, 0], {
      bone,
      color,
      sides: 6,
      smooth: false,
      caps: "flat",
    });
  }

  function cutBranch(
    a: number[],
    end: number[],
    radius: number,
    bone: Joint,
  ) {
    const axis = new THREE.Vector3(
      end[0] - a[0], end[1] - a[1], end[2] - a[2],
    ).normalize();
    b.rod(a, end, [radius * 1.15, radius], {
      bone, color: bark, sides: 7, smooth: false,
    });
    b.part(new THREE.CircleGeometry(radius * 0.95, 12), "#ffffff", {
      at: new THREE.Vector3(...end).addScaledVector(axis, 0.004),
      bone,
      dir: axis,
      axis: "z",
      texture: cutEnd,
    });
  }

  function leafCluster(
    center: number[],
    radius: number,
    bone: Joint,
    gold = false,
  ) {
    const [x, y, z] = center;
    const colors = gold
      ? [C.leaf, C.leafLight, C.leafGold]
      : [C.leafDark, foliage, C.leafLight];
    ellipsoid([x, y, z], [radius, radius * 0.47, radius * 0.7], colors[0], bone);
    ellipsoid(
      [x - radius * 0.32, y + radius * 0.17, z + radius * 0.12],
      [radius * 0.72, radius * 0.44, radius * 0.6],
      colors[1], bone,
    );
    ellipsoid(
      [x + radius * 0.43, y + radius * 0.12, z - radius * 0.05],
      [radius * 0.64, radius * 0.34, radius * 0.55],
      colors[2], bone,
    );
    const sprays = [];
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + random();
      sprays.push(
        frame(
          [x + Math.cos(a) * radius * 0.69, y + 0.08, z + Math.sin(a) * radius * 0.48],
          [Math.cos(a) * 0.55, 0.8, Math.sin(a) * 0.4],
        ),
      );
    }
    b.cards(sprays, leafDrawing, {
      size: [radius * 0.6, radius * 0.75],
      lean: 28,
      flow: [0, 0.1, 1],
      bone,
      sink: 0.17,
      cross: true,
    });
  }

  function mushroom(
    at: number[],
    size: number,
    bone: Joint,
    tilt = 0,
  ) {
    const [x, y, z] = at;
    b.rod([x, y, z], [x + tilt * size, y + size * 0.7, z], size * 0.12, {
      bone,
      color: C.gill,
      sides: 6,
    });
    const capAt = [x + tilt * size, y + size * 0.68, z];
    b.lathe(
      [
        [0, 0], [size * 0.62, 0],
        [size * 0.65, size * 0.12],
        [size * 0.42, size * 0.37],
        [size * 0.14, size * 0.47], [0, size * 0.45],
      ],
      { at: capAt, bone, segments: 8, color: C.mushroom },
    );
    b.part(new THREE.CylinderGeometry(size * 0.56, size * 0.56, size * 0.025, 8), C.gill, {
      at: [capAt[0], capAt[1] + 0.005, z],
      bone,
    });
    for (let i = 0; i < 3; i++) {
      ellipsoid(
        [capAt[0] + (i - 1) * size * 0.24, capAt[1] + size * (i === 1 ? 0.45 : 0.33), z + size * 0.14],
        [size * 0.11, size * 0.035, size * 0.08],
        "#f1d28b",
        bone,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Sturdy flared trunk and enormous shoulder girdle.
  // ---------------------------------------------------------------------------
  const trunk = b.loft(
    [
      { at: [0, 1.34, 0.02], w: 1.12, h: 0.72 },
      { at: [0, 1.9, 0], w: 1.02, h: 0.85 },
      { at: [0, 2.55, -0.04], w: 1.34, h: 0.94 },
      { at: [0, 3.13, -0.04], w: 1.77, h: 0.93 },
      { at: [0, 3.43, -0.01], w: 1.03, h: 0.71 },
    ],
    {
      bone: [hips, spine],
      color: bark,
      section: { ngon: 7 },
      smooth: false,
      caps: "flat",
    },
  );
  b.sweep(neck, [0.37, 0.34], {
    color: rootWood,
    section: { ngon: 7 },
    smooth: false,
  });

  const trunkSurface = b.surface(trunk);
  for (const hit of trunkSurface.scatter(25, {
    rng: random,
    minDist: 0.24,
    filter: (h) => h.n.y < 0.72 && (h.n.z < 0.45 || Math.abs(h.at.x) > 0.38),
  })) {
    plate(hit, 0.25 + random() * 0.16, 0.46 + random() * 0.27, random() > 0.75 ? paleWood : bark, random() * 16 - 8);
  }

  // Long grain ridges make the torso read as one ancient trunk.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.18 + i * 0.18);
      b.sweep(
        catmull([
          [x * 0.8, 1.52, 0.35],
          [x * 1.05, 2.0, 0.43],
          [x * 1.12, 2.47, 0.45],
          [x * 1.48, 3.04, 0.37],
        ]),
        [0.09, 0.065, 0.075, 0.11],
        {
          bone: spine,
          color: i === 2 ? paleWood : bark,
          sides: 5,
          smooth: false,
        },
      );
    }
  }

  // A dark recess, thick wooden rim, then a small luminous living sigil.
  ellipsoid([0, 2.72, 0.47], [0.36, 0.46, 0.13], C.seam, spine.joints[1]);
  for (const s of [1, -1]) {
    branch(
      [[s * 0.02, 2.29, 0.5], [s * 0.29, 2.42, 0.58], [s * 0.38, 2.83, 0.54], [s * 0.11, 3.17, 0.44]],
      0.12,
      spine.joints[1],
      paleWood,
    );
  }
  glow(
    b.part(new THREE.PlaneGeometry(0.46, 0.54), "#ffffff", {
      at: [0, 2.74, 0.612],
      bone: spine.joints[1],
      texture: heartRune,
      name: "livingHeartRune",
    }),
    1.15,
  );
  glow(ellipsoid([0, 2.32, 0.575], [0.055, 0.08, 0.045], C.magic, spine.joints[1]), 1.3);

  // ---------------------------------------------------------------------------
  // Face: massive brow, broad carved cheeks, a distinct hinged wooden jaw.
  // ---------------------------------------------------------------------------
  const H = 1.08;
  const face = b.region({ at: [0, 3.94, 0.13], scale: H, bone: head });
  const skull = face.part(new THREE.IcosahedronGeometry(1, 1), bark, {
    at: [0, 0, 0],
    scale: [0.59, 0.58, 0.45],
    flat: true,
    name: "elderOakSkull",
  });

  for (const s of [1, -1]) {
    // Projected eyes are seated on the skull, not floating before it.
    glow(
      b.decal(skull, eyes, {
        at: face.p([s * 0.275, 0.075, 0.43]),
        dir: [s * 0.12, 0, 1],
        size: [H * 0.39, H * 0.19],
        mirror: s < 0,
        segments: 6,
        lift: 0.008,
        bone: head,
        name: `emeraldEye${s > 0 ? "L" : "R"}`,
      }),
      1.2,
    );

    b.extrude(
      [
        [0.035, 0.04], [0.14, 0.19], [0.46, 0.27],
        [0.61, 0.16], [0.48, 0.06], [0.21, 0.07],
      ],
      {
        at: face.p([0, 0.04, 0.37]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.17,
        bevel: 0.015,
        bone: head,
        color: paleWood,
        name: `heavyBrow${s}`,
      },
    );

    b.extrude(
      [
        [0.14, 0.03], [0.49, 0.16], [0.61, -0.01],
        [0.49, -0.27], [0.21, -0.37], [0.26, -0.14],
      ],
      {
        at: face.p([0, -0.06, 0.34]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.15,
        bevel: 0.01,
        bone: head,
        color: bark,
      },
    );

    // Angular, upward swept branch-ears framing rather than covering the face.
    branch(
      [
        face.p([s * 0.48, -0.02, -0.02]),
        face.p([s * 0.76, 0.19, -0.04]),
        face.p([s * 0.88, 0.49, -0.07]),
        face.p([s * 0.83, 0.67, -0.1]),
      ],
      0.16,
      head,
    );
    branch(
      [
        face.p([s * 0.68, 0.12, -0.04]),
        face.p([s * 0.92, 0.22, -0.09]),
        face.p([s * 1.05, 0.42, -0.12]),
      ],
      0.08,
      head,
      paleWood,
    );
  }

  // Central root-nose: broad bridge, long diamond-shaped tip.
  b.extrude(
    [
      [-0.095, 0.23], [0.095, 0.23], [0.16, -0.15],
      [0.06, -0.27], [-0.08, -0.25], [-0.16, -0.15],
    ],
    {
      at: face.p([0, -0.02, 0.48]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.24, 0.11],
      color: paleWood,
      bone: head,
      bevel: 0.012,
    },
  );
  for (const s of [1, -1]) {
    ellipsoid(face.p([s * 0.105, -0.196, 0.604]), [0.034, 0.025, 0.018], C.seam, head);
  }

  // The dark gap belongs to the upper head; the jaw and its roots move separately.
  box(face.p([0, -0.3, 0.4]), [0.71, 0.105, 0.18], C.seam, head);
  b.frustumBox(
    [0, 3.51, 0.22],
    [0, 3.49, 0.64],
    [0.77, 0.28],
    [0.67, 0.22],
    { bone: jaw, color: bark },
  );
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.125;
    b.spike(
      [x, 3.61, 0.616],
      [0, 1, 0],
      0.08 + (i % 2) * 0.025,
      0.047,
      { bone: jaw, color: paleWood, sides: 4 },
    );
  }

  // A sculptural beard made of just seven substantial, separated root ribbons.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.108;
    const length = 0.58 - Math.abs(i) * 0.075;
    branch(
      [
        [x, 3.47, 0.45],
        [x * 1.25, 3.34, 0.57],
        [x * 1.22, 3.47 - length, 0.58],
        [x * 0.88, 3.40 - length, 0.49],
      ],
      0.095 - Math.abs(i) * 0.008,
      jaw,
      i % 2 === 0 ? paleWood : bark,
    );
  }

  // Forehead splinters form a simple crown-like central crest.
  for (let i = -1; i <= 1; i++) {
    b.extrude(
      [[-0.08, 0], [-0.09, 0.31], [0.015, 0.5], [0.095, 0.3], [0.08, 0]],
      {
        at: face.p([i * 0.15, 0.25, 0.27 - Math.abs(i) * 0.035]),
        x: [1, 0, 0],
        y: [0, 1, -0.18],
        thickness: 0.1,
        bone: head,
        color: i === 0 ? paleWood : bark,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Limbs, root fingers and large planted root feet.
  // ---------------------------------------------------------------------------
  for (const L of limbs) {
    const { s, arm, leg, fingers, thumb, toes, crown, shoulderBough } = L;

    const armTube = b.sweep(
      arm,
      (t) => [0.36 - t * 0.15, 0.32 - t * 0.13],
      { color: bark, section: { ngon: 6 }, smooth: false },
    );
    ellipsoid([s * 1.02, 3.24, 0], [0.47, 0.43, 0.43], bark, arm.joints[0]);
    ellipsoid([s * 1.6, 2.96, 0.03], [0.31, 0.33, 0.3], rootWood, arm.joints[1]);
    ellipsoid([s * 2.25, 2.44, 0.23], [0.31, 0.29, 0.23], bark, arm.tip!);

    const armSkin = b.surface(armTube);
    for (const hit of armSkin.scatter(10, {
      rng: random,
      minDist: 0.18,
      filter: (h) => h.n.z > -0.2,
    })) {
      plate(hit, 0.21 + random() * 0.1, 0.39 + random() * 0.2, random() > 0.65 ? paleWood : bark, s * 15);
    }

    b.sweep(leg, [0.34, 0.29, 0.26], {
      color: rootWood,
      section: { ngon: 6 },
      smooth: false,
    });
    ellipsoid([s * 0.65, 1.04, 0.1], [0.34, 0.32, 0.29], bark, leg.joints[1]);
    for (const [dx, z, len] of [
      [-0.12, 0.34, 0.66],
      [0.13, 0.35, 0.79],
      [0, -0.18, 0.6],
    ]) {
      const p = [s * 0.62 + dx, 0.94, z];
      plate(frame(p, [dx * 0.5, 0.08, z > 0 ? 1 : -1]), 0.25, len, paleWood, s * 6);
    }

    for (const finger of [...fingers, thumb]) {
      b.sweep(finger, [0.102, 0.078, 0.023], {
        color: bark,
        sides: 5,
        smooth: false,
        caps: "flat",
      });
      const at = finger.at(0.48);
      ellipsoid(at.at, [0.105, 0.115, 0.1], paleWood, at.bone!);
    }
    for (const toe of toes) {
      b.sweep(toe, [0.17, 0.13, 0.026], {
        color: rootWood,
        sides: 6,
        smooth: false,
        caps: "flat",
      });
    }
    // Heel and side roots give the feet a true tree-root footprint.
    branch(
      [
        [s * 0.72, 0.48, 0.13],
        [s * 0.92, 0.26, -0.15],
        [s * 1.2, 0.19, -0.41],
        [s * 1.4, 0.18, -0.44],
      ],
      0.19,
      leg.tip!,
      rootWood,
    );
    branch(
      [
        [s * 0.78, 0.46, 0.2],
        [s * 1.1, 0.24, 0.34],
        [s * 1.4, 0.18, 0.46],
      ],
      0.15,
      leg.tip!,
      bark,
    );

    // Branch stubs expose end-grain; these are unmistakably living oak arms.
    cutBranch(
      [s * 1.47, 3.02, 0.08],
      [s * 1.5, 3.29, 0.32],
      0.13,
      arm.joints[1],
    );
    cutBranch(
      [s * 0.62, 1.18, 0.14],
      [s * 0.87, 1.25, 0.4],
      0.12,
      leg.joints[1],
    );

    b.sweep(crown, [0.27, 0.22, 0.12, 0.035], {
      color: bark,
      section: { ngon: 6 },
      smooth: false,
      caps: "flat",
    });
    b.sweep(shoulderBough, [0.26, 0.16, 0.035], {
      color: bark,
      sides: 6,
      smooth: false,
      caps: "flat",
    });

    // Antler forks stay visible through gaps between the foliage masses.
    branch(
      [
        [s * 0.65, 4.78, -0.16],
        [s * 0.55, 5.12, -0.25],
        [s * 0.74, 5.62, -0.22],
        [s * 0.66, 5.88, -0.18],
      ],
      0.14,
      crown.joints[1],
      paleWood,
    );
    branch(
      [
        [s * 1.13, 5.16, -0.27],
        [s * 1.53, 5.17, -0.5],
        [s * 1.96, 5.43, -0.56],
        [s * 2.12, 5.62, -0.53],
      ],
      0.12,
      crown.joints[2],
    );
    branch(
      [
        [s * 1.34, 3.96, -0.42],
        [s * 1.74, 4.02, -0.66],
        [s * 2.13, 4.3, -0.64],
      ],
      0.13,
      shoulderBough.joints[1],
    );

    leafCluster([s * 1.06, 5.39, -0.38], 0.68, crown.joints[2], s > 0);
    leafCluster([s * 1.69, 5.55, -0.48], 0.65, crown.joints[2]);
    leafCluster([s * 0.52, 5.64, -0.4], 0.52, crown.joints[1], true);
    leafCluster([s * 1.94, 4.52, -0.58], 0.61, shoulderBough.joints[1]);
    leafCluster([s * 1.43, 4.22, -0.74], 0.51, shoulderBough.joints[1], s < 0);

    // Small moss islands sitting on upward-facing limb surfaces.
    for (const hit of armSkin.scatter(6, {
      rng: random,
      minDist: 0.15,
      filter: (h) => h.n.y > 0.45,
    })) {
      b.stick(new THREE.IcosahedronGeometry(1, 0), C.moss, hit, {
        scale: [0.18, 0.07, 0.13],
        embed: 0.4,
      });
    }
  }

  // Back crown completes the oak canopy without hanging in front of the eyes.
  branch(
    [[0, 3.45, -0.29], [-0.15, 4.25, -0.47], [0.12, 4.91, -0.6], [0.04, 5.45, -0.59]],
    0.24,
    spine.tip!,
  );
  leafCluster([0, 5.3, -0.77], 0.72, spine.tip!);
  leafCluster([-0.7, 4.83, -0.97], 0.63, spine.tip!);
  leafCluster([0.69, 4.85, -1.0], 0.66, spine.tip!);

  // ---------------------------------------------------------------------------
  // Relics, fungi and hanging ivy: asymmetry and a sense of great age.
  // ---------------------------------------------------------------------------
  const leftShoulder = limbs[0].arm.joints[0];
  const pauldron = ellipsoid([1.07, 3.5, 0.16], [0.48, 0.42, 0.37], stone, leftShoulder, 0);
  b.decal(pauldron, stoneRune, {
    at: [1.08, 3.51, 0.49],
    dir: [0.16, 0.08, 1],
    size: [0.33, 0.43],
    segments: 5,
    lift: 0.006,
    bone: leftShoulder,
  });
  ellipsoid([1.0, 3.79, 0.08], [0.36, 0.11, 0.27], C.moss, leftShoulder);
  ellipsoid([1.29, 3.7, 0.08], [0.19, 0.09, 0.2], C.mossLight, leftShoulder);

  // Cracks are real dark strokes on the flat stone facets.
  b.sweep(
    [[1.17, 3.77, 0.39], [1.23, 3.67, 0.444], [1.19, 3.59, 0.47]],
    0.012,
    { bone: leftShoulder, color: C.stoneDark, sides: 4 },
  );

  const rightShoulder = limbs[1].arm.joints[0];
  mushroom([-1.08, 3.53, 0.08], 0.3, rightShoulder, -0.2);
  mushroom([-1.34, 3.43, -0.06], 0.22, rightShoulder, 0.2);
  mushroom([-1.12, 3.5, -0.21], 0.17, rightShoulder);

  // Knots on the back and belly are drawn on the bark rather than separate eyes.
  b.decal(trunk, knotDrawing, {
    at: [-0.34, 2.01, 0.39],
    dir: [-0.15, 0, 1],
    size: [0.2, 0.35],
    lift: 0.005,
    segments: 5,
  });
  b.decal(trunk, knotDrawing, {
    at: [0.24, 2.46, -0.53],
    dir: [0, 0, -1],
    size: [0.32, 0.58],
    lift: 0.006,
    segments: 5,
  });

  function ivy(points: number[][], bone: Joint, count: number) {
    const path = catmull(points);
    b.sweep(path, 0.022, { bone, color: C.moss, sides: 5 });
    b.along(path, count, (at) => {
      const side = at.t < 0.5 ? 1 : -1;
      b.cards(
        [frame(at.at, [side * 0.45, 0.8, 0.2])],
        leafDrawing,
        {
          size: [0.19, 0.27],
          lean: 58,
          flow: [side * 0.5, -0.5, 1],
          bone,
          sink: 0,
        },
      );
    });
  }
  ivy(
    [[0.7, 3.62, 0.29], [0.85, 3.18, 0.44], [0.68, 2.72, 0.51], [0.77, 2.18, 0.34], [0.48, 1.83, 0.43]],
    spine.joints[1],
    9,
  );
  ivy(
    [[-1.19, 3.48, -0.1], [-1.47, 3.17, 0.25], [-1.5, 2.94, 0.36], [-1.86, 2.73, 0.3]],
    rightShoulder,
    6,
  );
  ivy(
    [[0.64, 1.45, 0.18], [0.88, 1.04, 0.22], [0.8, 0.69, 0.43], [0.95, 0.34, 0.59]],
    limbs[0].leg.joints[0],
    6,
  );

  // A few hanging roots make the back silhouette ancient and ragged.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      branch(
        [
          [s * (0.56 + i * 0.13), 3.2, -0.42],
          [s * (0.68 + i * 0.16), 2.79, -0.55],
          [s * (0.52 + i * 0.19), 2.25 - i * 0.16, -0.56],
        ],
        0.067,
        spine.joints[1],
        rootWood,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Small staged setting: a broken forest shrine under the guardian's roots.
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(1.92, 2.02, 0.16, 12), earth, {
    at: [0, 0.08, 0.03],
    scale: [1.12, 1, 0.78],
    bone: root,
    name: "groveDioramaBase",
  });
  b.part(new THREE.CylinderGeometry(1.94, 1.98, 0.055, 12), C.stoneDark, {
    at: [0, 0.032, 0.03],
    scale: [1.12, 1, 0.78],
    bone: root,
  });

  // Incomplete twelve-sided shrine ring; gaps keep the roots readable.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    if (i === 0 || i === 1 || i === 11) continue;
    const x = Math.sin(a) * 1.63;
    const z = Math.cos(a) * 1.12;
    box(
      [x, 0.18, z],
      [0.49, 0.16 + random() * 0.06, 0.28],
      stone,
      root,
      [0, (a * 180) / Math.PI, (random() - 0.5) * 5],
    );
    if (i % 3 === 0) {
      ellipsoid([x, 0.29, z], [0.24, 0.055, 0.19], C.moss, root);
    }
  }

  // A fallen rune fragment, behind the feet rather than in front of the hero.
  const fallenStone = b.part(new THREE.DodecahedronGeometry(1, 0), stone, {
    at: [-1.35, 0.4, -0.61],
    scale: [0.33, 0.43, 0.23],
    rotation: [0, -12, -15],
    bone: root,
  });
  b.decal(fallenStone, stoneRune, {
    at: [-1.35, 0.42, -0.38],
    dir: [0, 0, 1],
    size: [0.21, 0.34],
    segments: 4,
    lift: 0.005,
    bone: root,
  });
  ellipsoid([-1.47, 0.66, -0.65], [0.23, 0.08, 0.18], C.moss, root);

  for (let i = 0; i < 13; i++) {
    const a = random() * Math.PI * 2;
    const r = 1.1 + random() * 0.72;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.64;
    if (z > 0.55 && Math.abs(x) < 1.2) continue;
    ellipsoid(
      [x, 0.18, z],
      [0.1 + random() * 0.12, 0.07 + random() * 0.06, 0.08 + random() * 0.11],
      i % 3 === 0 ? C.moss : stone,
      root,
    );
  }

  mushroom([1.57, 0.17, 0.43], 0.2, root, -0.15);
  mushroom([1.76, 0.17, 0.3], 0.13, root, 0.2);
  mushroom([-1.53, 0.17, 0.63], 0.17, root);
  mushroom([-1.69, 0.17, 0.43], 0.11, root);

  // Broad leaf ferns at the edges, constructed as discrete primitive fronds.
  for (const [x, z, s] of [[1.54, -0.66, 1], [-1.65, -0.31, -1]]) {
    const fronds = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 0.53;
      fronds.push(
        frame(
          [x, 0.19, z],
          [Math.sin(angle) * 0.75, 0.5, Math.cos(angle) * s * 0.65],
        ),
      );
    }
    b.cards(fronds, leafDrawing, {
      size: [0.23, 0.56],
      lean: 20,
      bend: 20,
      flow: [0, 0, 1],
      bone: root,
      cross: false,
    });
  }

  // Scattered golden oak leaves frame the dark planted feet.
  for (let i = 0; i < 9; i++) {
    const x = (random() - 0.5) * 3.0;
    const z = 0.8 + random() * 0.4;
    b.extrude(
      [[0, 0], [-0.065, 0.045], [-0.075, 0.11], [0, 0.21], [0.075, 0.11], [0.065, 0.045]],
      {
        at: [x, 0.171, z],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.012,
        bone: root,
        color: i % 2 ? C.leafGold : "#89723d",
      },
    );
  }

  // Discreet museum-like nameplate, beneath the roots.
  box([0, 0.13, 1.43], [1.12, 0.2, 0.075], C.stoneDark);
  b.part(new THREE.PlaneGeometry(1.04, 0.248), "#ffffff", {
    at: [0, 0.15, 1.471],
    bone: root,
    texture: baseLabel,
    name: "guardianNameplate",
  });

  return b.root;
}
```