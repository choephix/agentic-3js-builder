import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  rng,
  paint,
  noise,
  mix,
  svg,
} from "../../../../src/index";
import type {
  Joint,
  FrameInput,
  PointInput,
  Fill,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Thornfather, Keeper of the Elder Grove",
  description:
    "An ancient oak guardian with massive timber shoulders, a deeply carved face, articulated root hands and feet, a tiered jade canopy, and an emerald heart. Broad hand-painted bark replaces fine visual noise; broken shrine stones frame his planted roots.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Thornfather",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(7319);

  const C = {
    seam: "#2e2823",
    bark: "#735137",
    edge: "#b89359",
    root: "#493c2d",
    moss: "#617b3d",
    mossLight: "#91a653",
    leafDark: "#193e35",
    leaf: "#326448",
    leafLight: "#648b48",
    leafGold: "#a1ac58",
    stoneDark: "#354744",
    soil: "#383d30",
    gold: "#bca46a",
    magic: "#80efaa",
    magicWhite: "#dbffd1",
    mushroom: "#c98949",
    gill: "#e7ca8d",
  };

  // Broad, continuous grain and warm facet lighting, not fine speckled noise.
  const bark = paint((p, n) => {
    const phase =
      p.x * 15.5 +
      p.z * 11.5 +
      Math.sin(p.y * 2.1 + p.x * 2.0) * 0.85;
    const wave = Math.sin(phase);
    const weather = noise(p, 0.48, 18);
    let color = mix(
      "#594331",
      "#967247",
      0.32 + weather * 0.28 + Math.max(0, n.y) * 0.24 + Math.max(0, n.z) * 0.13,
    );
    if (wave > 0.93) color = mix(color, "#3d3228", 0.48);
    else if (wave < -0.67) color = mix(color, "#b08c58", 0.16);
    if (n.y < -0.4) color = mix(color, "#343b30", 0.25);
    return color;
  });

  const paleWood = paint((p, n) => {
    const stripe = Math.sin(p.x * 21 + p.z * 15 + Math.sin(p.y * 2.5) * 0.65);
    const color = mix(
      "#82613e",
      "#c3a06b",
      0.28 + noise(p, 0.42, 31) * 0.3 + Math.max(0, n.y) * 0.25,
    );
    return stripe > 0.94 ? mix(color, "#5a4731", 0.36) : color;
  });

  const rootWood = paint((p, n) => {
    const shade = 0.24 + noise(p, 0.48, 6) * 0.36 + Math.max(0, n.y) * 0.2;
    return mix("#3d392d", "#80613f", shade);
  });

  const stone = paint((p, n) =>
    mix(
      "#435753",
      "#9fae98",
      0.2 + noise(p, 0.3, 52) * 0.4 + Math.max(0, n.y) * 0.23,
    ),
  );

  const foliage = paint((p, n) =>
    mix(
      "#204b3b",
      "#87a352",
      Math.min(1, 0.18 + Math.max(0, n.y) * 0.38 + noise(p, 0.48, 91) * 0.32),
    ),
  );

  const earth = paint((p, n) =>
    n.y > 0.45
      ? mix("#414c34", "#687047", noise(p, 0.34, 5))
      : mix("#29372d", "#424a35", noise(p, 0.38, 9)),
  );

  const eyes = svg(
    `<svg viewBox="0 0 160 80">
      <path d="M3 24 L27 8 L152 17 L136 57 L38 72 Z" fill="#182e24"/>
      <path d="M16 29 L39 22 L140 25 L124 48 L42 56 Z" fill="#258b58"/>
      <path d="M24 31 L48 27 L135 28 L118 42 L45 49 Z" fill="#8dffb1"/>
      <path d="M79 26 L91 26 L84 48 L75 50 Z" fill="#ecffd6"/>
      <path d="M24 29 L45 23 L139 25" fill="none" stroke="#d8ffc0" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const heartRune = svg(
    `<svg viewBox="0 0 160 180">
      <path d="M80 8 L141 45 L141 129 L80 171 L19 129 L19 45 Z"
        fill="#152a23" stroke="#78bc77" stroke-width="5"/>
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

  // Rounded oak lobes replace the needle-like foliage detail.
  const leafDrawing = svg(
    `<svg viewBox="0 0 140 180">
      <path d="M69 177 Q61 118 70 29" stroke="#b6b56a" stroke-width="5" fill="none"/>
      <path d="M66 134 Q43 144 29 132 Q10 135 11 120
        Q-1 108 13 101 Q8 83 25 85 Q30 66 43 79
        Q60 75 65 98 Z" fill="#4b8050" stroke="#244d36" stroke-width="3"/>
      <path d="M67 104 Q43 109 29 94 Q12 94 17 79
        Q3 68 19 60 Q17 44 33 49 Q43 32 54 47
        Q71 48 70 70 Z" fill="#7a9c53" stroke="#315d3c" stroke-width="3"/>
      <path d="M71 73 Q50 61 53 47 Q42 36 53 26
        Q50 12 64 13 Q72 -1 80 13 Q95 15 88 29
        Q101 43 87 51 Q86 68 71 73 Z" fill="#a4b561" stroke="#416b40" stroke-width="3"/>
      <path d="M68 151 Q88 157 104 142 Q124 144 122 128
        Q139 117 126 107 Q131 89 114 91 Q106 73 93 88
        Q77 88 70 114 Z" fill="#396e49" stroke="#244d36" stroke-width="3"/>
      <path d="M69 112 Q91 117 105 102 Q124 101 120 86
        Q135 74 119 65 Q119 47 103 53 Q92 38 82 54
        Q68 56 68 78 Z" fill="#5c8b4d" stroke="#2d5738" stroke-width="3"/>
      <path d="M22 109 L65 124 M27 65 L68 92 M70 22 L71 73
        M74 137 L119 116 M73 101 L114 71"
        stroke="#c4c97a" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const cutEnd = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="62" fill="#c5a374" stroke="#4d3b2a" stroke-width="8"/>
      <path d="M64 14 C98 12 117 44 111 75 C106 108 72 120 41 107
        C11 93 14 55 30 33 C39 20 52 19 64 21
        C90 17 108 45 100 73 C94 99 63 107 42 92
        C21 76 29 43 48 36 C69 27 92 42 88 65
        C86 85 62 94 49 79 C35 63 48 46 62 48
        C77 47 82 65 69 72 C59 79 51 67 59 61"
        fill="none" stroke="#906c46" stroke-width="4"/>
      <path d="M63 4 L60 29 L70 39 M121 75 L101 69 L92 77 M26 112 L40 94"
        fill="none" stroke="#59432e" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const knotDrawing = svg(
    `<svg viewBox="0 0 96 160">
      <path d="M47 5 C42 34 12 53 13 85 C14 120 39 126 47 155
        C54 125 81 110 82 81 C84 51 56 30 47 5 Z"
        fill="#655038" stroke="#ba965e" stroke-width="5"/>
      <path d="M47 34 C25 64 23 89 46 120 C68 99 74 70 47 34 Z"
        fill="#3c3428" stroke="#99774c" stroke-width="6"/>
      <path d="M48 57 C34 74 37 94 48 103 C60 86 59 69 48 57 Z"
        fill="#272d23" stroke="#79633e" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const baseLabel = svg(
    `<svg viewBox="0 0 420 100">
      <path d="M3 3 H417 V97 H3 Z" fill="#273b30" stroke="#9b9866" stroke-width="6"/>
      <path d="M19 20 L29 50 L19 80 M401 20 L391 50 L401 80"
        fill="none" stroke="#b7b27a" stroke-width="4"/>
      <text x="210" y="46" text-anchor="middle" font-family="serif"
        font-size="26" font-weight="bold" letter-spacing="5" fill="#ded4a1">THORNFATHER</text>
      <text x="210" y="74" text-anchor="middle" font-family="serif"
        font-size="13" letter-spacing="4" fill="#96ac86">KEEPER OF THE ELDER GROVE</text>
    </svg>`,
    { size: 512 },
  );

  // Skeleton: all major appendages, digits and jaw exist before geometry.
  const H = 1.18;
  const faceCenter = [0, 3.97, 0.17];
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
    {
      parent: hips,
      names: ["spineLower", "chest", "spineTop"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [[0, 3.23, -0.03], [0, 3.68, 0.02]],
    { parent: spine.tip!, names: ["neck", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: faceCenter,
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, faceCenter[1] - 0.35 * H, faceCenter[2] + 0.08 * H],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.99, 3.24, -0.02],
        [s * 1.61, 2.99, 0.03],
        [s * 2.11, 2.59, 0.13],
        [s * 2.3, 2.44, 0.23],
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
      const x = 2.17 + i * 0.18;
      return b.chain(
        `finger${side}${i + 1}`,
        [
          [s * x, 2.38, 0.24 + i * 0.055],
          [s * (x + 0.12), 2.1, 0.35 + i * 0.07],
          [s * (x + 0.17 + i * 0.035), 1.86 - i * 0.035, 0.51 + i * 0.07],
        ],
        { parent: arm.tip!, count: 2, role: "digit" },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 2.12, 2.56, 0.29],
        [s * 1.98, 2.38, 0.56],
        [s * 2.01, 2.16, 0.73],
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
        [s * 0.4, 4.3, -0.07],
        [s * 0.65, 4.84, -0.18],
        [s * 1.17, 5.21, -0.3],
        [s * 1.63, s > 0 ? 5.54 : 5.69, -0.3],
      ],
      { parent: head, count: 3, role: "fan" },
    );
    const shoulderBough = b.chain(
      `shoulderBough${side}`,
      [
        [s * 1.0, 3.36, -0.2],
        [s * 1.39, 3.97, -0.44],
        [s * 1.97, s > 0 ? 4.37 : 4.49, -0.51],
      ],
      { parent: arm.joints[0], count: 2, role: "fan" },
    );
    return { s, side, arm, leg, fingers, thumb, toes, crown, shoulderBough };
  });

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
      embed: 0.38,
    });
  }

  function branch(
    points: PointInput[],
    radius: number,
    bone: Joint,
    color: Fill = bark,
  ) {
    return b.sweep(catmull(points), [radius, radius * 0.7, radius * 0.28, 0], {
      bone,
      color,
      sides: 6,
      smooth: false,
      caps: "flat",
    });
  }

  function cutBranch(a: number[], end: number[], radius: number, bone: Joint) {
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

  // Unequal nested masses produce an oak crown instead of a flat green shelf.
  function leafCluster(
    center: number[],
    radius: number,
    bone: Joint,
    gold = false,
    height = 1,
  ) {
    const [x, y, z] = center;
    const colors = gold
      ? [C.leaf, foliage, C.leafGold]
      : [C.leafDark, foliage, C.leafLight];
    ellipsoid(
      [x, y, z],
      [radius, radius * 0.56 * height, radius * 0.73],
      colors[0],
      bone,
    );
    ellipsoid(
      [x - radius * 0.27, y + radius * 0.21 * height, z + radius * 0.1],
      [radius * 0.72, radius * 0.48 * height, radius * 0.61],
      colors[1],
      bone,
    );
    ellipsoid(
      [x + radius * 0.38, y + radius * 0.22 * height, z - radius * 0.07],
      [radius * 0.61, radius * 0.38 * height, radius * 0.52],
      colors[2],
      bone,
    );
    const sprays = [];
    for (let i = 0; i < 3; i++) {
      const angle = i * 2.1 + random();
      sprays.push(
        frame(
          [
            x + Math.cos(angle) * radius * 0.67,
            y + radius * 0.23,
            z + Math.sin(angle) * radius * 0.48,
          ],
          [Math.cos(angle) * 0.6, 0.75, Math.sin(angle) * 0.4],
        ),
      );
    }
    b.cards(sprays, leafDrawing, {
      size: [radius * 0.62, radius * 0.7],
      lean: 35,
      flow: [0, 0.1, 1],
      bone,
      sink: 0.18,
      cross: true,
    });
  }

  function mushroom(at: number[], size: number, bone: Joint, tilt = 0) {
    const [x, y, z] = at;
    b.rod([x, y, z], [x + tilt * size, y + size * 0.7, z], size * 0.12, {
      bone, color: C.gill, sides: 6,
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
    b.part(
      new THREE.CylinderGeometry(size * 0.56, size * 0.56, size * 0.025, 8),
      C.gill,
      { at: [capAt[0], capAt[1] + 0.005, z], bone },
    );
    for (let i = 0; i < 3; i++) {
      ellipsoid(
        [
          capAt[0] + (i - 1) * size * 0.24,
          capAt[1] + size * (i === 1 ? 0.45 : 0.33),
          z + size * 0.14,
        ],
        [size * 0.11, size * 0.035, size * 0.08],
        "#edcf95",
        bone,
      );
    }
  }

  // A thicker upper trunk and wider shoulders give the guardian heroic weight.
  const trunk = b.loft(
    [
      { at: [0, 1.34, 0.02], w: 1.15, h: 0.85 },
      { at: [0, 1.9, 0], w: 1.17, h: 0.99 },
      { at: [0, 2.55, -0.04], w: 1.62, h: 1.17 },
      { at: [0, 3.13, -0.04], w: 2.04, h: 1.17 },
      { at: [0, 3.47, -0.01], w: 1.21, h: 0.86 },
    ],
    {
      bone: [hips, spine],
      color: bark,
      section: { ngon: 8 },
      smooth: false,
      caps: "flat",
    },
  );
  b.sweep(neck, [0.42, 0.39], {
    color: rootWood,
    section: { ngon: 7 },
    smooth: false,
  });

  const trunkSurface = b.surface(trunk);
  for (const hit of trunkSurface.scatter(23, {
    rng: random,
    minDist: 0.27,
    filter: (h) =>
      h.n.y < 0.72 && (h.n.z < 0.4 || Math.abs(h.at.x) > 0.44),
  })) {
    plate(
      hit,
      0.29 + random() * 0.17,
      0.48 + random() * 0.24,
      random() > 0.82 ? paleWood : bark,
      random() * 16 - 8,
    );
  }

  // Structural root ribs are broad and close to the trunk, not dangling poles.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.18 + i * 0.19);
      b.sweep(
        catmull([
          [x * 0.8, 1.48, 0.36],
          [x * 1.1, 2.02, 0.48],
          [x * 1.26, 2.55, 0.54],
          [x * 1.52, 3.14, 0.47],
        ]),
        [0.1, 0.09, 0.105, 0.16],
        {
          bone: spine,
          color: i === 2 ? paleWood : bark,
          sides: 5,
          smooth: false,
        },
      );
    }
  }

  ellipsoid(
    [0, 2.76, 0.575],
    [0.39, 0.46, 0.15],
    C.seam,
    spine.joints[1],
  );
  for (const s of [1, -1]) {
    branch(
      [
        [s * 0.015, 2.28, 0.54],
        [s * 0.3, 2.43, 0.65],
        [s * 0.39, 2.85, 0.64],
        [s * 0.13, 3.18, 0.5],
      ],
      0.125,
      spine.joints[1],
      paleWood,
    );
  }
  glow(
    b.part(new THREE.PlaneGeometry(0.48, 0.56), "#ffffff", {
      at: [0, 2.76, 0.735],
      bone: spine.joints[1],
      texture: heartRune,
      name: "livingHeartRune",
    }),
    1.15,
  );
  glow(
    ellipsoid(
      [0, 2.3, 0.626],
      [0.042, 0.065, 0.035],
      C.magic,
      spine.joints[1],
    ),
    1.2,
  );

  // Larger, strongly carved face; all features share one scale and origin.
  const face = b.region({ at: faceCenter, scale: H, bone: head });
  const skull = face.part(new THREE.IcosahedronGeometry(1, 1), bark, {
    at: [0, 0, 0],
    scale: [0.61, 0.59, 0.48],
    flat: true,
    name: "elderOakSkull",
  });

  for (const s of [1, -1]) {
    glow(
      b.decal(skull, eyes, {
        at: face.p([s * 0.275, 0.065, 0.45]),
        dir: [s * 0.12, 0, 1],
        size: [H * 0.425, H * 0.23],
        mirror: s < 0,
        segments: 6,
        lift: 0.008,
        bone: head,
        name: `emeraldEye${s > 0 ? "L" : "R"}`,
      }),
      1.15,
    );

    b.extrude(
      [
        [0.035, 0.055], [0.15, 0.205], [0.47, 0.28],
        [0.625, 0.17], [0.49, 0.065], [0.215, 0.075],
      ],
      {
        at: face.p([0, 0.055, 0.395]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.18,
        bevel: 0.015,
        bone: head,
        color: paleWood,
        name: `heavyBrow${s}`,
      },
    );

    b.extrude(
      [
        [0.14, 0.03], [0.49, 0.16], [0.62, -0.01],
        [0.5, -0.28], [0.2, -0.38], [0.265, -0.14],
      ],
      {
        at: face.p([0, -0.065, 0.36]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.18,
        bevel: 0.01,
        bone: head,
        color: bark,
      },
    );

    // A second cheek edge and two long dark creases clarify the sculpt.
    branch(
      [
        face.p([s * 0.52, -0.04, 0.43]),
        face.p([s * 0.46, -0.22, 0.48]),
        face.p([s * 0.29, -0.34, 0.45]),
      ],
      0.055,
      head,
      paleWood,
    );
    b.sweep(
      [
        face.p([s * 0.46, -0.045, 0.46]),
        face.p([s * 0.4, -0.19, 0.475]),
        face.p([s * 0.32, -0.265, 0.46]),
      ],
      [0.014, 0.009],
      { bone: head, color: C.seam, sides: 4 },
    );

    branch(
      [
        face.p([s * 0.48, -0.02, -0.03]),
        face.p([s * 0.76, 0.19, -0.05]),
        face.p([s * 0.88, 0.49, -0.08]),
        face.p([s * 0.83, 0.67, -0.11]),
      ],
      0.17,
      head,
    );
    branch(
      [
        face.p([s * 0.68, 0.12, -0.05]),
        face.p([s * 0.92, 0.22, -0.1]),
        face.p([s * 1.05, 0.42, -0.13]),
      ],
      0.08,
      head,
      paleWood,
    );
  }

  b.extrude(
    [
      [-0.095, 0.23], [0.095, 0.23], [0.16, -0.15],
      [0.06, -0.27], [-0.08, -0.25], [-0.16, -0.15],
    ],
    {
      at: face.p([0, -0.02, 0.5]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.26, 0.12],
      color: paleWood,
      bone: head,
      bevel: 0.012,
    },
  );

  for (const s of [1, -1]) {
    ellipsoid(
      face.p([s * 0.105, -0.196, 0.623]),
      [0.036, 0.024, 0.017],
      C.seam,
      head,
    );
  }

  box(
    face.p([0, -0.315, 0.43]),
    [H * 0.71, H * 0.095, H * 0.18],
    C.seam,
    head,
  );
  b.frustumBox(
    face.p([0, -0.39, 0.11]),
    face.p([0, -0.4, 0.49]),
    [H * 0.72, H * 0.24],
    [H * 0.66, H * 0.2],
    { bone: jaw, color: bark },
  );

  // A few uneven wood teeth, not a regular yellow picket fence.
  for (const i of [-2, 0, 2]) {
    b.spike(
      face.p([i * 0.12, -0.355, 0.535]),
      [0, 1, 0],
      H * (i === 0 ? 0.055 : 0.085),
      H * 0.04,
      { bone: jaw, color: paleWood, sides: 4 },
    );
  }

  // Seven substantial root ribbons form a sculptural, readable beard.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.105;
    const length = 0.63 - Math.abs(i) * 0.082;
    branch(
      [
        face.p([x, -0.42, 0.32]),
        face.p([x * 1.25, -0.55, 0.43]),
        face.p([x * 1.22, -0.42 - length, 0.43]),
        face.p([x * 0.84, -0.49 - length, 0.33]),
      ],
      H * (0.089 - Math.abs(i) * 0.007),
      jaw,
      i % 2 === 0 ? paleWood : bark,
    );
  }

  for (let i = -1; i <= 1; i++) {
    b.extrude(
      [[-0.08, 0], [-0.09, 0.31], [0.015, 0.5], [0.095, 0.3], [0.08, 0]],
      {
        at: face.p([i * 0.15, 0.26, 0.28 - Math.abs(i) * 0.035]),
        x: [1, 0, 0],
        y: [0, 1, -0.18],
        thickness: 0.1,
        bone: head,
        color: i === 0 ? paleWood : bark,
      },
    );
  }

  // Moss at the temples subtly ties the face to the living canopy.
  for (const s of [1, -1]) {
    const hit = b.surface(skull).around(face.p([0, 0, 0])).at(s * 63, 37);
    if (hit) {
      b.stick(new THREE.IcosahedronGeometry(1, 0), C.moss, hit, {
        scale: [0.17, 0.055, 0.13],
        embed: 0.5,
      });
    }
  }

  for (const L of limbs) {
    const { s, arm, leg, fingers, thumb, toes, crown, shoulderBough } = L;

    const armTube = b.sweep(
      arm,
      (t) => [0.4 - t * 0.17, 0.36 - t * 0.15],
      { color: bark, section: { ngon: 6 }, smooth: false },
    );
    ellipsoid(
      [s * 1.08, 3.28, -0.015],
      [0.53, 0.47, 0.46],
      bark,
      arm.joints[0],
    );
    ellipsoid(
      [s * 1.61, 2.99, 0.03],
      [0.33, 0.34, 0.32],
      rootWood,
      arm.joints[1],
    );
    ellipsoid(
      [s * 2.29, 2.44, 0.25],
      [0.345, 0.31, 0.26],
      bark,
      arm.tip!,
    );

    const armSkin = b.surface(armTube);
    for (const hit of armSkin.scatter(9, {
      rng: random,
      minDist: 0.21,
      filter: (h) => h.n.z > -0.2,
    })) {
      plate(
        hit,
        0.25 + random() * 0.1,
        0.43 + random() * 0.16,
        random() > 0.78 ? paleWood : bark,
        s * 15,
      );
    }

    b.sweep(leg, [0.38, 0.31, 0.27], {
      color: rootWood,
      section: { ngon: 6 },
      smooth: false,
    });
    ellipsoid(
      [s * 0.65, 1.04, 0.1],
      [0.35, 0.33, 0.31],
      bark,
      leg.joints[1],
    );

    for (const [dx, z, length] of [
      [-0.12, 0.36, 0.66],
      [0.13, 0.37, 0.79],
      [0, -0.2, 0.6],
    ]) {
      plate(
        frame([s * 0.62 + dx, 0.94, z], [dx * 0.5, 0.08, z > 0 ? 1 : -1]),
        0.27,
        length,
        paleWood,
        s * 6,
      );
    }

    for (const finger of [...fingers, thumb]) {
      b.sweep(finger, [0.115, 0.088, 0.025], {
        color: bark,
        sides: 5,
        smooth: false,
        caps: "flat",
      });
      const at = finger.at(0.48);
      ellipsoid(at.at, [0.115, 0.12, 0.105], paleWood, at.bone!);
    }

    for (const toe of toes) {
      b.sweep(toe, [0.18, 0.135, 0.026], {
        color: rootWood,
        sides: 6,
        smooth: false,
        caps: "flat",
      });
    }

    branch(
      [
        [s * 0.72, 0.48, 0.13],
        [s * 0.92, 0.26, -0.15],
        [s * 1.2, 0.19, -0.41],
        [s * 1.4, 0.18, -0.44],
      ],
      0.2,
      leg.tip!,
      rootWood,
    );
    branch(
      [
        [s * 0.78, 0.46, 0.2],
        [s * 1.1, 0.24, 0.34],
        [s * 1.4, 0.18, 0.46],
      ],
      0.16,
      leg.tip!,
      bark,
    );

    cutBranch(
      [s * 1.48, 3.05, 0.08],
      [s * 1.51, 3.33, 0.34],
      0.14,
      arm.joints[1],
    );
    cutBranch(
      [s * 0.62, 1.18, 0.14],
      [s * 0.89, 1.25, 0.42],
      0.12,
      leg.joints[1],
    );

    b.sweep(crown, [0.29, 0.23, 0.13, 0.035], {
      color: bark,
      section: { ngon: 6 },
      smooth: false,
      caps: "flat",
    });
    b.sweep(shoulderBough, [0.28, 0.17, 0.035], {
      color: bark,
      sides: 6,
      smooth: false,
      caps: "flat",
    });

    // Visible naked tips and staggered leaf crowns break the former flat roof.
    branch(
      [
        [s * 0.65, 4.84, -0.18],
        [s * 0.54, 5.21, -0.27],
        [s * 0.71, 5.83, -0.22],
        [s * 0.65, 6.13, -0.14],
      ],
      0.15,
      crown.joints[1],
      paleWood,
    );
    branch(
      [
        [s * 1.17, 5.21, -0.3],
        [s * 1.58, 5.18, -0.53],
        [s * 2.0, 5.4, -0.59],
        [s * 2.2, 5.62, -0.51],
      ],
      0.13,
      crown.joints[2],
    );
    branch(
      [
        [s * 1.39, 3.97, -0.44],
        [s * 1.8, 4.04, -0.67],
        [s * 2.22, 4.36, -0.61],
      ],
      0.14,
      shoulderBough.joints[1],
    );

    leafCluster(
      [s * 1.03, s > 0 ? 5.58 : 5.77, -0.4],
      s > 0 ? 0.68 : 0.6,
      crown.joints[2],
      s > 0,
      1.05,
    );
    leafCluster(
      [s * 1.76, s > 0 ? 5.42 : 5.58, -0.47],
      s > 0 ? 0.57 : 0.64,
      crown.joints[2],
      false,
      0.92,
    );
    leafCluster(
      [s * 0.42, s > 0 ? 5.95 : 6.12, -0.46],
      s > 0 ? 0.55 : 0.5,
      crown.joints[1],
      true,
      1.12,
    );
    leafCluster(
      [s * 2.0, s > 0 ? 4.48 : 4.64, -0.6],
      0.58,
      shoulderBough.joints[1],
      false,
      0.9,
    );
    leafCluster(
      [s * 1.47, 4.23, -0.77],
      0.47,
      shoulderBough.joints[1],
      s < 0,
      1,
    );

    for (const hit of armSkin.scatter(6, {
      rng: random,
      minDist: 0.17,
      filter: (h) => h.n.y > 0.45,
    })) {
      b.stick(new THREE.IcosahedronGeometry(1, 0), C.moss, hit, {
        scale: [0.2, 0.07, 0.14],
        embed: 0.45,
      });
    }
  }

  branch(
    [
      [0, 3.45, -0.32],
      [-0.15, 4.25, -0.51],
      [0.12, 4.96, -0.66],
      [0.05, 5.65, -0.64],
    ],
    0.26,
    spine.tip!,
  );
  leafCluster([0.02, 5.56, -0.95], 0.68, spine.tip!, false, 1.1);
  leafCluster([-0.72, 4.91, -1.03], 0.59, spine.tip!, false, 1.1);
  leafCluster([0.72, 5.07, -1.07], 0.62, spine.tip!, true, 1);

  // An asymmetric shrine-stone pauldron and a small colony of shelf fungi.
  const leftShoulder = limbs[0].arm.joints[0];
  const pauldron = ellipsoid(
    [1.14, 3.56, 0.17],
    [0.51, 0.44, 0.4],
    stone,
    leftShoulder,
  );
  b.decal(pauldron, stoneRune, {
    at: [1.15, 3.57, 0.54],
    dir: [0.16, 0.08, 1],
    size: [0.35, 0.46],
    segments: 5,
    lift: 0.006,
    bone: leftShoulder,
  });
  ellipsoid([1.06, 3.87, 0.09], [0.39, 0.11, 0.29], C.moss, leftShoulder);
  ellipsoid([1.36, 3.76, 0.09], [0.2, 0.09, 0.21], C.mossLight, leftShoulder);
  b.sweep(
    [[1.25, 3.86, 0.4], [1.3, 3.72, 0.49], [1.26, 3.63, 0.52]],
    0.013,
    { bone: leftShoulder, color: C.stoneDark, sides: 4 },
  );

  const rightShoulder = limbs[1].arm.joints[0];
  mushroom([-1.15, 3.64, 0.08], 0.3, rightShoulder, -0.2);
  mushroom([-1.42, 3.51, -0.06], 0.22, rightShoulder, 0.2);
  mushroom([-1.18, 3.61, -0.23], 0.17, rightShoulder);

  b.decal(trunk, knotDrawing, {
    at: [-0.35, 2.03, 0.48],
    dir: [-0.15, 0, 1],
    size: [0.22, 0.39],
    lift: 0.005,
    segments: 5,
  });
  b.decal(trunk, knotDrawing, {
    at: [0.25, 2.46, -0.64],
    dir: [0, 0, -1],
    size: [0.34, 0.6],
    lift: 0.006,
    segments: 5,
  });

  function ivy(points: number[][], bone: Joint, count: number) {
    const path = catmull(points);
    b.sweep(path, 0.024, { bone, color: C.moss, sides: 5 });
    b.along(path, count, (at) => {
      const side = at.t < 0.5 ? 1 : -1;
      b.cards(
        [frame(at.at, [side * 0.45, 0.8, 0.2])],
        leafDrawing,
        {
          size: [0.22, 0.28],
          lean: 58,
          flow: [side * 0.5, -0.5, 1],
          bone,
          sink: 0,
        },
      );
    });
  }

  ivy(
    [
      [0.8, 3.68, 0.31],
      [0.95, 3.2, 0.48],
      [0.81, 2.72, 0.54],
      [0.78, 2.19, 0.4],
      [0.5, 1.83, 0.47],
    ],
    spine.joints[1],
    9,
  );
  ivy(
    [[-1.26, 3.59, -0.1], [-1.51, 3.21, 0.3], [-1.57, 2.97, 0.4], [-1.9, 2.76, 0.32]],
    rightShoulder,
    6,
  );
  ivy(
    [[0.67, 1.45, 0.24], [0.9, 1.04, 0.29], [0.83, 0.69, 0.46], [0.97, 0.34, 0.6]],
    limbs[0].leg.joints[0],
    6,
  );

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      branch(
        [
          [s * (0.6 + i * 0.13), 3.22, -0.52],
          [s * (0.74 + i * 0.16), 2.8, -0.65],
          [s * (0.57 + i * 0.19), 2.25 - i * 0.16, -0.64],
        ],
        0.075,
        spine.joints[1],
        rootWood,
      );
    }
  }

  // A compact broken forest shrine supports the root footprint.
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

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    if (i === 0 || i === 1 || i === 11) continue;
    const x = Math.sin(angle) * 1.63;
    const z = Math.cos(angle) * 1.12;
    box(
      [x, 0.18, z],
      [0.49, 0.16 + random() * 0.06, 0.28],
      stone,
      root,
      [0, (angle * 180) / Math.PI, (random() - 0.5) * 5],
    );
    if (i % 3 === 0) {
      ellipsoid([x, 0.29, z], [0.24, 0.055, 0.19], C.moss, root);
    }
  }

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
    const angle = random() * Math.PI * 2;
    const radius = 1.1 + random() * 0.65;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.64;
    if (z > 0.55 && Math.abs(x) < 1.2) continue;
    ellipsoid(
      [x, 0.18, z],
      [0.1 + random() * 0.12, 0.07 + random() * 0.06, 0.08 + random() * 0.11],
      i % 3 === 0 ? C.moss : stone,
      root,
    );
  }

  mushroom([1.57, 0.16, 0.43], 0.2, root, -0.15);
  mushroom([1.76, 0.16, 0.3], 0.13, root, 0.2);
  mushroom([-1.53, 0.16, 0.63], 0.17, root);
  mushroom([-1.69, 0.16, 0.43], 0.11, root);

  for (const [x, z, s] of [[1.54, -0.66, 1], [-1.65, -0.31, -1]]) {
    const fronds = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 0.53;
      fronds.push(
        frame(
          [x, 0.16, z],
          [Math.sin(angle) * 0.75, 0.5, Math.cos(angle) * s * 0.65],
        ),
      );
    }
    b.cards(fronds, leafDrawing, {
      size: [0.24, 0.53],
      lean: 20,
      bend: 20,
      flow: [0, 0, 1],
      bone: root,
      cross: false,
    });
  }

  // Keep fallen leaves inside the base footprint and seated on its top.
  for (let i = 0; i < 9; i++) {
    const x = (random() - 0.5) * 2.65;
    const z = 0.7 + random() * 0.24;
    b.extrude(
      [[0, 0], [-0.065, 0.045], [-0.075, 0.11], [0, 0.21], [0.075, 0.11], [0.065, 0.045]],
      {
        at: [x, 0.16, z],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.012,
        bone: root,
        color: i % 2 ? C.leafGold : "#97814e",
      },
    );
  }

  box([0, 0.13, 1.43], [1.12, 0.2, 0.075], C.stoneDark);
  b.part(new THREE.PlaneGeometry(1.04, 0.248), "#ffffff", {
    at: [0, 0.15, 1.471],
    bone: root,
    texture: baseLabel,
    name: "guardianNameplate",
  });

  return b.root;
}
