```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  polyline,
  catmull,
  bezier,
  rng,
  paint,
  mix,
  noise,
  grain,
  svg,
  type Paint,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Shrine of the Evening Blossom",
  description:
    "A vermilion roadside sanctuary with sweeping blue tiled eaves, luminous blossom mirror, fox guardians, hanging lanterns, offerings and sakura.",
};

/*
1. Close the gap between the torii's stacked crown beams and seat its end fittings.
2. Give the sacred mirror a genuinely supported altar instead of a hovering stand.
3. Refine the foxes into sharp-eared, long-muzzled guardians, rather than round cats.
4. Add suspended amber lanterns and richer architectural trim; keep the central view clear.
5. Replace blotchy paving with calm stone, carved joints and restrained moss.
6. Strengthen the sakura silhouette with angular blossom clusters and attached flowers.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: meta.name,
    detail: 1,
    paintSize: 2048,
  });
  const root = b.joint("shrineRoot", { at: [0, 0, 0] });
  const random = rng(48219);

  const C = {
    red: "#bd4147",
    redLight: "#df6559",
    redDark: "#74313e",
    roof: "#2c4059",
    roofLight: "#526c83",
    roofDark: "#1b2d42",
    gold: "#d7ad68",
    goldLight: "#ffe2a3",
    goldDark: "#98704b",
    wood: "#65444a",
    cream: "#f3e6ce",
    rope: "#ccb387",
    ropeDark: "#977b57",
    stone: "#acb8b5",
    stoneDark: "#647d85",
    stoneLight: "#d0d2c5",
    moss: "#557b6d",
    mossLight: "#93aa7a",
    leaf: "#527d72",
    jade: "#719990",
    pink: "#e7a0ba",
    pinkLight: "#ffd0d1",
    pinkDark: "#ba749a",
    flame: "#ffd590",
    magic: "#cb9bf7",
  };

  const lacquer = paint((p, n) =>
    mix(
      "#993440",
      "#d85a52",
      0.52 + 0.2 * n.y + 0.08 * noise(p, 0.3, 14),
    ),
  );
  const stone = paint((p, n) =>
    mix(
      "#889b9f",
      "#d0d1c3",
      0.53 + 0.22 * n.y + 0.055 * noise(p, 0.23, 4),
    ),
  );
  const paving = paint((p, n) =>
    mix(
      "#9caeaa",
      "#c7cbbb",
      0.57 + 0.2 * n.y + 0.035 * noise(p, 0.3, 12),
    ),
  );
  const rock = paint((p, n) =>
    mix(
      "#3c5360",
      "#7b9090",
      0.46 + 0.25 * n.y + 0.1 * noise(p, 0.26, 8),
    ),
  );
  const roofPaint = paint((p, n) =>
    mix(
      C.roofDark,
      C.roofLight,
      0.35 + 0.32 * Math.max(0, n.y) + 0.08 * noise(p, 0.2, 11),
    ),
  );
  const gold = paint((p, n) =>
    mix(
      C.goldDark,
      C.goldLight,
      0.5 + 0.24 * n.y + 0.08 * noise(p, 0.065, 19),
    ),
  );
  const wood = grain("#50383f", "#73524e", {
    size: 0.045,
    axis: "y",
    seed: 31,
  });
  const earth = paint((p, n) =>
    mix(
      "#425c55",
      "#748675",
      0.45 + 0.16 * n.y + 0.15 * noise(p, 0.2, 41),
    ),
  );

  type Finish = string | Paint;

  function box(
    at: number[],
    size: number[],
    color: Finish,
    rotation: number[] = [0, 0, 0],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(...(size as [number, number, number])), color, {
      at, rotation, bone: root, name,
    });
  }

  function ellipsoid(
    at: number[],
    size: number[],
    color: Finish,
    name?: string,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, 1), color, {
      at, scale: size, bone: root, name,
    });
  }

  function cylinder(
    at: number[],
    top: number,
    bottom: number,
    h: number,
    color: Finish,
    sides = 10,
    dir: number[] = [0, 1, 0],
    name?: string,
  ) {
    return b.part(new THREE.CylinderGeometry(top, bottom, h, sides, 1), color, {
      at, dir, bone: root, name,
    });
  }

  function rod(a: number[], end: number[], r: number, color: Finish) {
    return b.rod(a, end, r, {
      color, bone: root, sides: 6, smooth: false,
    });
  }

  function tube(points: number[][], r: number, color: Finish, name?: string) {
    return b.sweep(polyline(points), r, {
      color, bone: root, sides: 6, caps: "flat", name,
    });
  }

  function torus(
    at: number[],
    r: number,
    thickness: number,
    color: Finish,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(r, thickness, 6, 24), color, {
      at, rotation, bone: root,
    });
  }

  function drawing(
    at: number[],
    w: number,
    h: number,
    texture: THREE.Texture,
    dir: number[] = [0, 0, 1],
    name?: string,
  ) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at, dir, axis: "z", texture, bone: root, name,
    });
  }

  function diamond(at: number[], w: number, h: number, color: Finish) {
    return b.extrude(
      [[0, h / 2], [w / 2, 0], [0, -h / 2], [-w / 2, 0]],
      {
        at, x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.015, color, bone: root,
      },
    );
  }

  function blossom(at: number[], r: number) {
    const [x, y, z] = at;
    for (let k = 0; k < 5; k++) {
      const a = k * Math.PI * 2 / 5;
      ellipsoid(
        [x + Math.sin(a) * r * 0.58, y + Math.cos(a) * r * 0.58, z],
        [r * 0.42, r * 0.46, r * 0.16],
        k % 2 ? C.pink : C.pinkLight,
      );
    }
    ellipsoid(at, [r * 0.18, r * 0.18, r * 0.18], C.goldLight);
  }

  const emblem = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#352944" stroke="#e7c080" stroke-width="5"/>
      <circle cx="64" cy="64" r="49" fill="none" stroke="#ac7dd1" stroke-width="2"/>
      <path d="M64 15C48 31 52 51 64 58C76 51 80 31 64 15Z
        M106 88C100 65 82 59 70 65C70 80 87 94 106 88Z
        M22 88C41 94 58 80 58 65C46 59 28 65 22 88Z"
        fill="#efc8ff" stroke="#ac83d6" stroke-width="3"/>
      <path d="M64 48L79 64L64 80L49 64Z" fill="#fff2c7"/>
      <path d="M64 3L68 10L64 17L60 10Z M125 64L118 68L111 64L118 60Z
        M64 125L60 118L64 111L68 118Z M3 64L10 60L17 64L10 68Z" fill="#ffe5a4"/>
      <circle cx="64" cy="64" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 384 },
  );

  const doorArt = svg(
    `<svg viewBox="0 0 100 240">
      <rect width="100" height="240" fill="#983d49"/>
      <path d="M9 0V240 M24 0V240 M43 0V240 M65 0V240 M84 0V240"
        stroke="#73313e" stroke-width="2"/>
      <path d="M13 18H87V222H13Z" fill="none" stroke="#dbb573" stroke-width="4"/>
      <path d="M20 25H80V215H20Z" fill="none" stroke="#efce90" stroke-width="1.5"/>
      <path d="M25 170Q70 136 42 63 M40 98Q18 84 26 68
        M48 119Q74 112 75 92 M43 148Q19 139 24 121"
        fill="none" stroke="#d9b777" stroke-width="3"/>
      <g fill="#ecc18b" stroke="#9b585d" stroke-width="1.5">
        <path d="M42 48L49 58L59 56L55 67L62 76L50 78L44 89L37 79L25 78L30 67L26 57L37 58Z"/>
        <path d="M76 82L81 88L88 87L86 94L91 100L83 101L79 109L74 102L66 101L69 94L67 87L74 88Z"/>
        <path d="M24 111L29 117L36 116L34 123L39 129L31 130L27 138L22 131L14 130L17 123L15 116L22 117Z"/>
      </g>
      <path d="M50 185L62 198L50 211L38 198Z" fill="#dfbd80"/>
      <path d="M31 35H69 M31 39H69" stroke="#e9c27e" stroke-width="2"/>
    </svg>`,
    { size: 384 },
  );

  const lanternArt = svg(
    `<svg viewBox="0 0 128 160">
      <rect width="128" height="160" fill="#fbc87c"/>
      <rect x="6" y="6" width="116" height="148" rx="3"
        fill="#ffe4a4" stroke="#82513d" stroke-width="7"/>
      <path d="M15 35H113 M15 125H113 M29 12V148 M99 12V148"
        stroke="#b07b4d" stroke-width="5"/>
      <path d="M64 39L94 80L64 121L34 80Z"
        fill="#dfa366" stroke="#9d664a" stroke-width="4"/>
      <path d="M64 51C48 61 52 76 64 79C76 76 80 61 64 51Z
        M87 95C84 80 73 77 67 82C67 92 77 100 87 95Z
        M41 95C51 100 61 92 61 82C55 77 44 80 41 95Z" fill="#fff3bf"/>
      <circle cx="64" cy="82" r="5" fill="#fff9db"/>
      <path d="M13 15L23 25 M105 25L115 15 M13 145L23 135 M105 135L115 145"
        stroke="#865442" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const plaqueArt = svg(
    `<svg viewBox="0 0 128 192">
      <rect x="4" y="4" width="120" height="184" rx="8"
        fill="#29424c" stroke="#e7bd76" stroke-width="7"/>
      <rect x="15" y="15" width="98" height="162" rx="2"
        fill="none" stroke="#a78961" stroke-width="2"/>
      <path d="M64 20L72 31L64 42L56 31Z" fill="#e6c384"/>
      <text x="64" y="92" text-anchor="middle" font-family="serif"
        font-size="48" font-weight="bold" fill="#f4deb2">花</text>
      <text x="64" y="147" text-anchor="middle" font-family="serif"
        font-size="48" font-weight="bold" fill="#f4deb2">守</text>
      <path d="M43 165H85" stroke="#e7bd76" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const clothArt = svg(
    `<svg viewBox="0 0 256 96">
      <rect width="256" height="96" fill="#65446e"/>
      <path d="M0 9H256 M0 84H256" stroke="#e4c78e" stroke-width="5"/>
      <path d="M0 17H256 M0 76H256" stroke="#a580a2" stroke-width="2"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const x = i * 36 - 3;
        return `<path d="M${x} 48l14 -17l14 17l-14 17Z"
          fill="none" stroke="#c4a1bd" stroke-width="2"/>
          <path d="M${x + 14} 39l7 9l-7 9l-7 -9Z" fill="#e0be85"/>`;
      }).join("")}
    </svg>`,
    { size: 384 },
  );

  const bottleLabel = svg(
    `<svg viewBox="0 0 96 144">
      <rect width="96" height="144" rx="3" fill="#f1e3c6"/>
      <rect x="5" y="5" width="86" height="134"
        fill="none" stroke="#b39669" stroke-width="3"/>
      <circle cx="48" cy="36" r="20" fill="#ae5363"/>
      <path d="M48 21L53 31L65 31L58 41L61 52L48 47L35 52L38 41L31 31L43 31Z"
        fill="#f6dfb4"/>
      <text x="48" y="87" text-anchor="middle" font-family="serif"
        font-size="30" fill="#48323b">奉納</text>
      <path d="M22 104H74 M29 114H67 M35 124H61" stroke="#ab8a64" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const foxFace = svg(
    `<svg viewBox="0 0 160 88">
      <path d="M16 29Q35 16 60 30L46 31Q32 23 19 34Z
        M144 29Q125 16 100 30L114 31Q128 23 141 34Z" fill="#425967"/>
      <path d="M21 43L34 48L48 43 M139 43L126 48L112 43"
        stroke="#b96b73" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M80 6L89 18L80 28L71 18Z" fill="#e4bf80"/>
      <path d="M72 57L80 63L88 57L80 54Z" fill="#526675"/>
    </svg>`,
    { size: 256 },
  );

  const prayerArt = svg(
    `<svg viewBox="0 0 120 100">
      <path d="M5 28L60 5L115 28V95H5Z" fill="#c99566" stroke="#6c4645" stroke-width="6"/>
      <path d="M13 35L60 15L107 35V87H13Z" fill="none" stroke="#efca92" stroke-width="3"/>
      <path d="M43 51L50 40L60 45L70 40L77 51L70 62L73 73L60 69L47 73L50 62Z"
        fill="#a94f65"/>
      <circle cx="60" cy="56" r="5" fill="#ffe3a3"/>
      <path d="M20 77H36 M84 77H100" stroke="#81524b" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const petalArt = svg(
    `<svg viewBox="0 0 48 64">
      <path d="M24 61C5 49 0 29 9 12L19 17L24 3L30 16L40 11C52 32 42 49 24 61Z"
        fill="#eeadba"/>
      <path d="M24 56Q21 31 24 17" fill="none" stroke="#ffd5d2" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  const sacredArt = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="56" fill="none" stroke="#c3a0dd" stroke-width="3"/>
      <path d="M64 8L70 19L64 30L58 19Z M120 64L109 70L98 64L109 58Z
        M64 120L58 109L64 98L70 109Z M8 64L19 58L30 64L19 70Z" fill="#e8caff"/>
      <path d="M31 25L39 31 M97 25L89 31 M31 103L39 97 M97 103L89 97"
        stroke="#ac87c5" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  // The shelf's lowest surface is the floor; all furniture rests on its upper surface.
  const outline = [
    [-2.48, -1.22], [-2.22, -1.77], [-1.2, -1.89],
    [1.17, -1.87], [2.27, -1.57], [2.48, -0.7],
    [2.42, 1.34], [1.99, 1.82], [0.68, 1.99],
    [-1.62, 1.87], [-2.42, 1.34],
  ];
  b.extrude(outline, {
    at: [0, 0.095, 0], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.19, bevel: 0.025, color: rock, bone: root,
    name: "roadsideRockShelf",
  });
  b.extrude(outline.map(([x, z]) => [x * 0.965, z * 0.965]), {
    at: [0, 0.189, 0], x: [1, 0, 0], y: [0, 0, 1],
    thickness: 0.025, color: earth, bone: root, name: "mossAndEarth",
  });

  // Two-piece flagstones carry subtle seams, not a noisy camouflage pattern.
  for (let i = 0; i < 4; i++) {
    const z = 1.68 - i * 0.37;
    const split = i % 2 ? 0.16 : -0.15;
    const leftW = 0.525 + split;
    const rightW = 0.525 - split;
    box([-0.525 + leftW / 2, 0.224, z], [leftW - 0.014, 0.085, 0.315], paving);
    box([split + rightW / 2, 0.224, z], [rightW - 0.014, 0.085, 0.315], paving);
    if (i === 1 || i === 3) {
      tube(
        [[-0.48, 0.268, z + 0.052], [-0.4, 0.268, z + 0.037],
         [-0.355, 0.268, z + 0.06]],
        0.0025, C.stoneDark,
      );
    }
  }
  box([0, 0.275, 0.31], [1.55, 0.15, 0.44], paving);
  box([0, 0.375, -0.02], [1.82, 0.17, 0.5], paving);
  box([0, 0.46, -0.8], [1.94, 0.27, 1.32], rock);
  box([0, 0.615, -0.8], [2.03, 0.09, 1.4], stone);
  box([0, 0.672, -0.8], [1.74, 0.06, 1.22], wood);
  for (let j = 0; j < 5; j++)
    box([0, 0.704, -1.31 + j * 0.235], [1.69, 0.005, 0.009], "#473840");

  // Vermilion torii.
  const gateZ = 0.72;
  for (const s of [-1, 1]) {
    const x = s * 1.67;
    cylinder([x, 0.29, gateZ], 0.255, 0.285, 0.18, rock, 8);
    cylinder([x, 0.43, gateZ], 0.215, 0.23, 0.14, stone, 10);
    cylinder([x, 1.985, gateZ], 0.16, 0.19, 2.99, lacquer, 12);
    cylinder([x, 0.56, gateZ], 0.19, 0.19, 0.2, C.roofDark, 12);
    cylinder([x, 0.675, gateZ], 0.194, 0.194, 0.045, gold, 12);
    cylinder([x, 2.82, gateZ], 0.173, 0.173, 0.1, C.redDark, 12);
    cylinder([x, 3.425, gateZ], 0.181, 0.181, 0.095, gold, 12);
    b.ring(frame([x, 0.615, gateZ], [0, 1, 0]), {
      count: 8, radius: 0.195,
    }, (f) => b.stick(new THREE.SphereGeometry(0.012, 6, 4), C.gold, f));
    box([x, 2.965, gateZ + 0.191], [0.1, 0.23, 0.018], gold);
    for (const y of [2.89, 3.035])
      cylinder([x, y, gateZ + 0.211], 0.023, 0.023, 0.021, C.goldLight, 8, [0, 0, 1]);
  }
  box([0, 2.92, gateZ], [3.86, 0.19, 0.23], lacquer, [0, 0, 0], "nuki");
  box([0, 3.14, gateZ], [0.145, 0.43, 0.19], lacquer);
  for (const s of [-1, 1]) {
    box([s * 1.965, 2.92, gateZ], [0.11, 0.205, 0.255], C.roofDark);
    box([s * 1.968, 2.92, gateZ + 0.137], [0.1, 0.16, 0.016], gold);
  }

  const beam = [
    [-2.18, 0.2], [-1.7, 0.08], [-0.85, -0.025], [0, -0.055],
    [0.85, -0.025], [1.7, 0.08], [2.18, 0.2],
    [2.105, -0.005], [1.7, -0.12], [0.85, -0.215], [0, -0.25],
    [-0.85, -0.215], [-1.7, -0.12], [-2.105, -0.005],
  ];
  b.extrude(beam, {
    at: [0, 3.51, gateZ], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.33, bevel: 0.012, color: lacquer,
    bone: root, name: "upturnedShimaki",
  });
  b.extrude(beam.map(([x, y]) => [x * 1.035, y * 0.62]), {
    at: [0, 3.598, gateZ], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.42, bevel: 0.012, color: roofPaint,
    bone: root, name: "seatedBlackKasagi",
  });
  tube([
    [-2.245, 3.718, gateZ + 0.218],
    [-1.76, 3.642, gateZ + 0.218],
    [-0.87, 3.578, gateZ + 0.218],
    [0, 3.559, gateZ + 0.218],
    [0.87, 3.578, gateZ + 0.218],
    [1.76, 3.642, gateZ + 0.218],
    [2.245, 3.718, gateZ + 0.218],
  ], 0.015, gold);

  for (const s of [-1, 1]) {
    box([s * 2.14, 3.61, gateZ], [0.09, 0.205, 0.44], gold, [0, 0, s * 16]);
    b.extrude([[0, 0], [0.11, 0.025], [0.145, 0.14], [0.05, 0.1]], {
      at: [s * 2.08, 3.687, gateZ], x: [s, 0, 0], y: [0, 1, 0],
      thickness: 0.35, color: C.gold, bone: root,
    });
  }
  box([0, 3.125, gateZ + 0.205], [0.34, 0.47, 0.075], C.goldDark);
  drawing([0, 3.125, gateZ + 0.246], 0.31, 0.445, plaqueArt);

  // Heavy sacred rope, three readable spiral strands.
  const ropePath = catmull([
    [-1.64, 2.82, 0.89], [-1.14, 2.69, 0.91], [-0.56, 2.585, 0.92],
    [0, 2.55, 0.92], [0.56, 2.585, 0.92], [1.14, 2.69, 0.91],
    [1.64, 2.82, 0.89],
  ]);
  b.sweep(ropePath, 0.047, {
    color: C.rope, bone: root, sides: 8, caps: "flat", name: "shimenawa",
  });
  for (let k = 0; k < 3; k++) {
    const pts: number[][] = [];
    for (let j = 0; j <= 88; j++) {
      const t = j / 88;
      const p = ropePath.at(t);
      const a = t * Math.PI * 26 + k * Math.PI * 2 / 3;
      pts.push([p.x, p.y + Math.cos(a) * 0.039, p.z + Math.sin(a) * 0.039]);
    }
    b.sweep(polyline(pts), 0.007, {
      color: k === 1 ? C.ropeDark : C.goldLight,
      bone: root, sides: 4, caps: "flat",
    });
  }

  function shide(x: number, y: number, z: number, scale: number) {
    rod([x, y + 0.018, z], [x, y - 0.08 * scale, z], 0.008, C.ropeDark);
    b.extrude([
      [-0.055, 0], [0.065, 0], [0.065, -0.09], [0.025, -0.09],
      [0.025, -0.17], [0.105, -0.17], [0.105, -0.265],
      [0.045, -0.265], [0.045, -0.345], [-0.035, -0.345],
      [-0.035, -0.22], [0.015, -0.22], [0.015, -0.14], [-0.055, -0.14],
    ].map(([u, v]) => [u * scale, v * scale]), {
      at: [x, y - 0.035, z], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.012, color: C.cream, bone: root,
    });
    box([x + 0.004 * scale, y - 0.165 * scale, z + 0.009],
      [0.1 * scale, 0.012, 0.009], "#d6c9b5");
  }
  for (const t of [0.14, 0.32, 0.5, 0.68, 0.86]) {
    const p = ropePath.at(t);
    shide(p.x, p.y, p.z + 0.012, t === 0.5 ? 0.87 : 0.72);
  }
  for (const s of [-1, 1]) {
    ellipsoid([s * 1.62, 2.805, 0.91], [0.09, 0.085, 0.065], C.rope);
    for (let k = 0; k < 4; k++)
      b.sweep([
        [s * 1.62 + (k - 1.5) * 0.024, 2.78, 0.91],
        [s * 1.65 + (k - 1.5) * 0.027, 2.51 - k * 0.008, 0.93],
      ], [0.018, 0.008], { color: C.rope, bone: root, sides: 5 });
  }

  // Suspended lanterns occupy the outer openings, below the rope and above the foxes.
  function hangingLantern(x: number) {
    const z = 0.72;
    tube([[x, 2.82, z], [x, 2.61, z]], 0.009, C.goldDark);
    torus([x, 2.58, z], 0.038, 0.008, gold);
    box([x, 2.52, z], [0.29, 0.055, 0.29], C.roofDark);
    cylinder([x, 2.566, z], 0.052, 0.085, 0.036, gold, 8);
    glow(box([x, 2.303, z], [0.235, 0.36, 0.235], C.flame), 0.8);
    glow(drawing([x, 2.303, z + 0.121], 0.226, 0.355, lanternArt), 0.65);
    glow(drawing([x + 0.121, 2.303, z], 0.226, 0.355, lanternArt, [1, 0, 0]), 0.65);
    glow(drawing([x - 0.121, 2.303, z], 0.226, 0.355, lanternArt, [-1, 0, 0]), 0.65);
    glow(drawing([x, 2.303, z - 0.121], 0.226, 0.355, lanternArt, [0, 0, -1]), 0.65);
    for (const dx of [-0.133, 0.133])
      for (const dz of [-0.133, 0.133])
        box([x + dx, 2.307, z + dz], [0.026, 0.41, 0.026], C.redDark);
    box([x, 2.096, z], [0.287, 0.045, 0.287], C.roofDark);
    box([x, 2.068, z], [0.24, 0.018, 0.24], gold);
    cylinder([x, 2.035, z], 0.017, 0.027, 0.05, gold, 8);
    for (let k = 0; k < 4; k++)
      rod([x + (k - 1.5) * 0.012, 2.016, z],
        [x + (k - 1.5) * 0.015, 1.9, z], 0.005, C.red);
  }
  hangingLantern(-1.365);
  hangingLantern(1.365);

  // Main shrine.
  const shrineZ = -0.81;
  box([0, 1.49, shrineZ - 0.42], [1.54, 1.65, 0.09], wood);
  box([0, 1.49, shrineZ], [1.37, 1.58, 0.86], C.wood);
  box([0, 1.53, shrineZ + 0.446], [1.28, 1.42, 0.035], C.roofDark);

  for (const s of [-1, 1]) {
    for (const z of [shrineZ - 0.5, shrineZ + 0.5]) {
      box([s * 0.75, 1.505, z], [0.155, 1.68, 0.155], lacquer);
      box([s * 0.75, 0.755, z], [0.185, 0.18, 0.185], C.roofDark);
      box([s * 0.75, 0.85, z], [0.188, 0.034, 0.188], gold);
      box([s * 0.75, 2.19, z], [0.19, 0.13, 0.19], gold);
    }
    box([s * 0.77, 2.32, shrineZ], [0.2, 0.12, 1.26], lacquer);
    box([s * 0.79, 1.44, shrineZ], [0.085, 1.14, 0.92], wood);
    for (let j = 0; j < 6; j++)
      box([s * 0.838, 1.5, shrineZ - 0.38 + j * 0.152],
        [0.03, 1.11, 0.035], C.redDark);
    for (const y of [0.93, 1.5, 2.075])
      box([s * 0.858, y, shrineZ], [0.035, 0.045, 0.94], gold);
    // Carved diamond inset and winged corner fittings on the side panels.
    b.extrude([[0, 0.09], [0.065, 0], [0, -0.09], [-0.065, 0]], {
      at: [s * 0.867, 1.76, shrineZ],
      x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.017, color: gold, bone: root,
    });
  }
  box([0, 2.31, shrineZ + 0.515], [1.79, 0.18, 0.17], lacquer);
  box([0, 2.38, shrineZ + 0.614], [1.73, 0.04, 0.035], gold);
  box([0, 0.735, shrineZ + 0.52], [1.68, 0.13, 0.16], lacquer);
  box([0, 0.814, shrineZ + 0.598], [1.6, 0.018, 0.023], gold);

  for (const s of [-1, 1]) {
    box([s * 0.485, 1.51, -0.254], [0.355, 1.29, 0.065], lacquer);
    drawing([s * 0.485, 1.51, -0.218], 0.325, 1.235, doorArt);
    for (const y of [1.03, 1.95]) {
      box([s * 0.675, y, -0.205], [0.095, 0.055, 0.018], gold);
      cylinder([s * 0.706, y, -0.19], 0.012, 0.012, 0.032, C.goldLight, 6, [0, 0, 1]);
    }
    torus([s * 0.325, 1.46, -0.184], 0.043, 0.008, gold);
    cylinder([s * 0.325, 1.507, -0.202], 0.015, 0.015, 0.047, C.goldLight, 8, [0, 0, 1]);
    cylinder([s * 0.325, 1.507, -0.218], 0.025, 0.025, 0.012, C.goldDark, 8, [0, 0, 1]);
  }

  // A physically supported inner altar under the magic mirror.
  box([0, 1.015, -0.392], [0.53, 0.065, 0.33], wood);
  box([0, 1.054, -0.392], [0.555, 0.025, 0.35], gold);
  for (const s of [-1, 1]) {
    box([s * 0.195, 0.853, -0.392], [0.078, 0.275, 0.22], lacquer);
    box([s * 0.195, 0.729, -0.392], [0.11, 0.033, 0.235], C.roofDark);
  }
  box([0, 1.084, -0.33], [0.28, 0.035, 0.16], gold);
  cylinder([0, 1.22, -0.335], 0.057, 0.071, 0.265, gold, 8);
  cylinder([0, 1.63, -0.32], 0.3, 0.3, 0.07, gold, 24, [0, 0, 1], "blossomMirrorFrame");
  torus([0, 1.63, -0.275], 0.278, 0.022, C.goldLight);
  glow(drawing([0, 1.63, -0.268], 0.535, 0.535, emblem,
    [0, 0, 1], "sacredBlossomMirror"), 0.85);
  glow(drawing([0, 1.63, -0.342], 0.7, 0.7, sacredArt), 0.45);

  for (const s of [-1, 1]) {
    rod([s * 0.185, 1.09, -0.305], [s * 0.243, 1.32, -0.32], 0.015, C.gold);
    b.spike([s * 0.24, 1.3, -0.32], [s * 0.075, 0.1, 0], 0.11, 0.036, {
      color: C.gold, bone: root, sides: 5,
    });
  }
  diamond([0, 1.956, -0.296], 0.05, 0.09, gold);
  glow(ellipsoid([0, 1.956, -0.278], [0.015, 0.027, 0.01], C.magic), 0.65);

  // Roof shell, deep eaves, exposed timber and broad raised tile ribs.
  b.extrude([[-0.89, 0], [0, 0.59], [0.89, 0]], {
    at: [0, 2.39, shrineZ + 0.535], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.065, color: lacquer, bone: root, name: "frontGable",
  });
  const roofOutline = [
    [-1.43, 0.17], [-1.2, 0.16], [-0.9, 0.25], [0, 0.64],
    [0.9, 0.25], [1.2, 0.16], [1.43, 0.17], [1.34, 0.02],
    [1.14, 0.035], [0.85, 0.125], [0, 0.49],
    [-0.85, 0.125], [-1.14, 0.035], [-1.34, 0.02],
  ];
  b.extrude(roofOutline, {
    at: [0, 2.5, shrineZ], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 1.67, bevel: 0.012, color: roofPaint,
    bone: root, name: "sweepingShrineRoof",
  });

  for (const z of [shrineZ - 0.66, shrineZ, shrineZ + 0.66]) {
    b.sweep(polyline([
      [-1.34, 2.568, z], [-1.15, 2.574, z], [-0.85, 2.665, z],
      [0, 3.035, z], [0.85, 2.665, z], [1.15, 2.574, z], [1.34, 2.568, z],
    ]), () => [0.036, 0.048], {
      section: "box", caps: "flat", color: C.redDark, bone: root,
    });
  }
  for (const s of [-1, 1]) {
    box([s * 0.75, 2.475, shrineZ], [0.15, 0.22, 1.12], lacquer);
    box([s * 0.75, 2.605, shrineZ], [0.245, 0.07, 1.23], C.redDark);
    box([s * 0.75, 2.651, shrineZ], [0.3, 0.035, 1.26], gold);
    for (const z of [shrineZ - 0.51, shrineZ + 0.51]) {
      b.extrude(
        [[-0.035, 0], [0.035, 0], [0.26, 0.19], [0.26, 0.245], [0.14, 0.245]],
        {
          at: [s * 0.75, 2.35, z], x: [s, 0, 0], y: [0, 1, 0],
          thickness: 0.09, color: lacquer, bone: root,
        },
      );
      box([s * 0.943, 2.6, z], [0.23, 0.045, 0.13], gold);
    }
  }

  for (let j = 0; j < 12; j++) {
    const z = shrineZ - 0.77 + j * 0.14;
    tube([
      [-1.43, 2.677, z], [-1.2, 2.665, z], [-0.9, 2.758, z],
      [0, 3.152, z], [0.9, 2.758, z], [1.2, 2.665, z], [1.43, 2.677, z],
    ], 0.027, j % 3 === 0 ? C.roofLight : C.roof, "roofTileRidge");
  }

  for (const z of [shrineZ - 0.849, shrineZ + 0.849]) {
    const edge = [
      [-1.43, 2.65, z], [-1.18, 2.63, z], [-0.88, 2.72, z],
      [0, 3.1, z], [0.88, 2.72, z], [1.18, 2.63, z], [1.43, 2.65, z],
    ];
    tube(edge, 0.041, C.roofDark);
    tube(edge.map(([x, y, zz]) => [x, y - 0.014, zz + 0.027]), 0.011, gold);
  }
  tube([[0, 3.165, -1.78], [0, 3.165, 0.16]], 0.065, C.roofDark, "roofRidgeCap");
  for (let j = 0; j < 8; j++)
    cylinder([0, 3.164, -1.67 + j * 0.235], 0.071, 0.071, 0.027,
      C.roofLight, 8, [0, 0, 1]);
  for (const z of [-1.795, 0.18]) {
    cylinder([0, 3.164, z], 0.077, 0.077, 0.032, gold, 10, [0, 0, 1]);
    ellipsoid([0, 3.165, z + 0.02], [0.029, 0.029, 0.014], C.magic);
  }
  cylinder([0, 2.66, 0.058], 0.112, 0.112, 0.026, gold, 12, [0, 0, 1]);
  drawing([0, 2.66, 0.075], 0.19, 0.19, emblem);

  for (const s of [-1, 1]) {
    b.sweep(bezier(
      [s * 1.27, 2.66, shrineZ + 0.82],
      [s * 1.45, 2.75, shrineZ + 0.82],
      [s * 1.47, 2.91, shrineZ + 0.82],
    ), [0.045, 0], {
      color: gold, bone: root, sides: 6, caps: "point",
    });
    for (let j = 0; j < 3; j++) {
      const x = s * (0.88 + j * 0.17);
      box([x, 2.465, shrineZ + 0.54], [0.065, 0.12, 0.23], lacquer);
      box([x, 2.405, shrineZ + 0.62], [0.11, 0.035, 0.15], gold);
    }
  }

  // Small bell beside the face of the mirror.
  rod([-0.56, 2.29, -0.11], [-0.56, 2.14, -0.11], 0.012, C.goldDark);
  b.lathe([
    [0, 0.12], [0.045, 0.105], [0.061, 0.045], [0.092, 0],
    [0.092, -0.022], [0.073, -0.025], [0.053, 0.039], [0.029, 0.088], [0, 0.09],
  ], { at: [-0.56, 2.025, -0.11], color: gold, bone: root, segments: 10 });
  ellipsoid([-0.56, 2.007, -0.11], [0.017, 0.025, 0.017], C.goldDark);
  tube([[-0.56, 2.006, -0.11], [-0.56, 1.48, -0.09]], 0.012, C.rope);
  torus([-0.56, 1.459, -0.085], 0.044, 0.014, C.rope);

  // Twin stone lanterns.
  function stoneLantern(x: number, z: number, side: number) {
    box([x, 0.252, z], [0.57, 0.11, 0.56], rock);
    box([x, 0.332, z], [0.46, 0.07, 0.46], stone);
    b.lathe([
      [0, 0], [0.18, 0], [0.18, 0.07], [0.117, 0.12],
      [0.093, 0.55], [0.135, 0.62], [0.135, 0.69], [0, 0.69],
    ], { at: [x, 0.37, z], color: stone, bone: root, segments: 8 });
    cylinder([x, 0.53, z], 0.128, 0.14, 0.05, C.stoneDark, 8);
    box([x, 1.065, z], [0.47, 0.11, 0.47], stone);
    box([x, 1.13, z], [0.41, 0.045, 0.41], C.stoneDark);
    glow(box([x, 1.325, z], [0.3, 0.35, 0.3], C.flame), 0.8);
    for (const dx of [-0.19, 0.19])
      for (const dz of [-0.19, 0.19])
        box([x + dx, 1.333, z + dz], [0.064, 0.41, 0.064], stone);
    glow(drawing([x, 1.327, z + 0.182], 0.292, 0.35, lanternArt), 0.7);
    glow(drawing([x + side * 0.182, 1.327, z], 0.292, 0.35,
      lanternArt, [side, 0, 0]), 0.7);
    box([x, 1.54, z], [0.46, 0.075, 0.46], stone);
    b.lathe([
      [0, 0.22], [0.1, 0.17], [0.2, 0.075], [0.32, 0.015],
      [0.37, 0.04], [0.34, -0.035], [0.23, -0.048], [0, -0.048],
    ], { at: [x, 1.625, z], color: roofPaint, bone: root, segments: 4, spin: 45 });
    cylinder([x, 1.84, z], 0.073, 0.11, 0.065, stone, 8);
    ellipsoid([x, 1.895, z], [0.07, 0.078, 0.07], stone);
    cylinder([x, 1.97, z], 0.017, 0.038, 0.068, gold, 6);
    diamond([x, 0.72, z + 0.106], 0.11, 0.15, gold);
    for (const dx of [-0.16, 0.16])
      cylinder([x + dx, 1.07, z + 0.244], 0.012, 0.012, 0.015,
        C.gold, 6, [0, 0, 1]);
  }
  stoneLantern(-1.29, -0.47, -1);
  stoneLantern(1.29, -0.47, 1);

  // The guardians are carved props, not independently rigged creatures.
  function fox(x: number, z: number, s: number) {
    box([x, 0.285, z], [0.5, 0.16, 0.57], rock);
    box([x, 0.385, z], [0.47, 0.055, 0.53], stone);
    box([x, 0.42, z + 0.09], [0.35, 0.045, 0.32], C.stoneDark);
    box([x, 0.35, z + 0.293], [0.18, 0.048, 0.011], C.goldDark);
    diamond([x, 0.35, z + 0.302], 0.043, 0.065, C.goldLight);
    ellipsoid([x, 0.628, z - 0.026], [0.17, 0.237, 0.17], stone);
    b.sweep(catmull([
      [x, 0.48, z - 0.14],
      [x + s * 0.22, 0.51, z - 0.17],
      [x + s * 0.245, 0.73, z - 0.19],
      [x + s * 0.13, 0.88, z - 0.15],
      [x + s * 0.045, 0.895, z - 0.1],
    ]), [0.086, 0.094, 0.075, 0.045, 0.012], {
      color: stone, bone: root, sides: 7, name: "carvedFoxTail",
    });
    for (const dx of [-0.112, 0.112]) {
      b.capsule([x + dx, 0.465, z + 0.1], [x + dx, 0.7, z + 0.09], 0.052, {
        color: stone, bone: root, sides: 6,
      });
      ellipsoid([x + dx, 0.454, z + 0.17], [0.069, 0.045, 0.105], stone);
      for (let j = 0; j < 2; j++)
        box([x + dx - 0.025 + j * 0.048, 0.485, z + 0.223],
          [0.008, 0.011, 0.04], C.stoneDark);
    }
    const skull = ellipsoid([x, 0.904, z + 0.022],
      [0.203, 0.166, 0.16], stone, "stoneFoxHead");

    // Angular cheek planes and a tapered fox muzzle replace the round button snout.
    for (const e of [-1, 1]) {
      b.slab([
        [x + e * 0.1, 0.923, z + 0.102],
        [x + e * 0.231, 0.87, z + 0.045],
        [x + e * 0.166, 0.79, z + 0.095],
        [x + e * 0.058, 0.805, z + 0.168],
      ], { thickness: 0.065, color: stone, bone: root });
      b.extrude(
        [[-0.067, 0], [0.065, -0.008], [0.074, 0.255], [0.015, 0.218]],
        {
          at: [x + e * 0.122, 0.997, z + 0.012],
          x: [e, 0, 0], y: [0, 1, 0],
          thickness: [0.094, 0.025], color: stone, bone: root,
        },
      );
      b.extrude([[-0.024, 0], [0.03, 0], [0.046, 0.16]], {
        at: [x + e * 0.13, 1.028, z + 0.063],
        x: [e, 0, 0], y: [0, 1, 0],
        thickness: 0.008, color: C.redDark, bone: root,
      });
    }
    b.loft([
      { at: [x, 0.842, z + 0.114], w: 0.235, h: 0.116 },
      { at: [x, 0.835, z + 0.235], w: 0.125, h: 0.075 },
      { at: [x, 0.847, z + 0.292], w: 0.065, h: 0.045 },
    ], { color: C.stoneLight, bone: root, section: "box", caps: "flat" });
    ellipsoid([x, 0.852, z + 0.306], [0.037, 0.025, 0.024], C.stoneDark);
    tube([[x - 0.065, 0.806, z + 0.217], [x, 0.804, z + 0.27],
      [x + 0.065, 0.806, z + 0.217]], 0.004, C.stoneDark);
    b.decal(skull, foxFace, {
      at: [x, 0.948, z + 0.181], dir: [0, 0, 1],
      size: [0.32, 0.155], lift: 0.002, bone: root,
    });
    b.extrude([
      [-0.137, 0.1], [0.137, 0.1], [0.098, -0.12],
      [0, -0.18], [-0.098, -0.12],
    ], {
      at: [x, 0.731, z + 0.176], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.018, color: lacquer, bone: root,
    });
    rod([x - 0.13, 0.81, z + 0.19], [x + 0.13, 0.81, z + 0.19], 0.011, C.gold);
    cylinder([x, 0.661, z + 0.199], 0.043, 0.043, 0.021, gold, 10, [0, 0, 1]);
    drawing([x, 0.662, z + 0.213], 0.067, 0.067, emblem);
  }
  fox(-0.93, 0.97, -1);
  fox(0.93, 0.97, 1);

  // Offering table and patterned cloth.
  box([0, 0.61, 0.042], [0.95, 0.075, 0.42], wood);
  box([0, 0.662, 0.042], [1.02, 0.035, 0.46], C.redDark);
  for (const s of [-1, 1]) {
    box([s * 0.345, 0.481, 0.042], [0.105, 0.21, 0.295], lacquer);
    box([s * 0.345, 0.379, 0.042], [0.17, 0.035, 0.33], C.roofDark);
    box([s * 0.345, 0.543, 0.042], [0.125, 0.035, 0.32], gold);
  }
  box([0, 0.686, 0.042], [0.7, 0.017, 0.455], "#65446e");
  box([0, 0.565, 0.28], [0.7, 0.235, 0.012], "#65446e");
  drawing([0, 0.565, 0.289], 0.698, 0.235, clothArt);
  for (let j = 0; j < 9; j++)
    rod([-0.32 + j * 0.08, 0.448, 0.288],
      [-0.32 + j * 0.08, 0.402, 0.288], 0.006, C.gold);

  function plate(x: number, y: number, z: number, r: number) {
    b.lathe([
      [0, 0], [r * 0.58, 0], [r, 0.022],
      [r, 0.042], [r * 0.7, 0.02], [0, 0.017],
    ], { at: [x, y, z], color: C.cream, bone: root, segments: 12 });
    torus([x, y + 0.038, z], r * 0.93, 0.005, gold, [90, 0, 0]);
  }
  plate(-0.24, 0.694, 0.065, 0.166);
  plate(0.21, 0.694, 0.067, 0.148);
  for (const [dx, dz, dy] of [
    [-0.06, -0.04, 0], [0.06, -0.04, 0], [0, 0.062, 0], [0, 0, 0.085],
  ]) {
    const p = [-0.24 + dx, 0.787 + dy, 0.065 + dz];
    ellipsoid(p, [0.064, 0.06, 0.064], "#efa757");
    ellipsoid([p[0], p[1] + 0.058, p[2]], [0.012, 0.008, 0.012], C.leaf);
    b.slab([
      [p[0], p[1] + 0.06, p[2]],
      [p[0] + 0.052, p[1] + 0.074, p[2] + 0.012],
      [p[0] + 0.02, p[1] + 0.064, p[2] + 0.032],
    ], { thickness: 0.004, color: C.leaf, bone: root });
  }
  for (const [dx, dz, dy, color] of [
    [-0.05, -0.04, 0, C.cream], [0.052, -0.03, 0, C.cream],
    [0, 0.06, 0, C.cream], [0, 0, 0.08, "#aac39e"],
  ] as [number, number, number, string][]) {
    ellipsoid([0.21 + dx, 0.783 + dy, 0.067 + dz], [0.061, 0.055, 0.061], color);
    ellipsoid([0.21 + dx, 0.835 + dy, 0.067 + dz],
      [0.016, 0.009, 0.016], "#d1c9ac");
  }

  function sake(x: number, z: number, h: number) {
    b.lathe([
      [0, 0], [0.067, 0], [0.08, 0.036], [0.076, h * 0.53],
      [0.048, h * 0.73], [0.032, h * 0.79], [0.032, h * 0.97],
      [0.038, h], [0.025, h], [0.021, h * 0.9], [0, h * 0.9],
    ], { at: [x, 0.674, z], color: C.jade, bone: root, segments: 10 });
    cylinder([x, 0.682 + h, z], 0.029, 0.029, 0.029, C.ropeDark, 8);
    drawing([x, 0.674 + h * 0.36, z + 0.078], 0.094, 0.139, bottleLabel);
    torus([x, 0.674 + h * 0.77, z], 0.034, 0.007, C.rope, [90, 0, 0]);
  }
  sake(-0.64, -0.19, 0.34);
  sake(0.65, -0.2, 0.29);

  b.lathe([
    [0, 0], [0.088, 0], [0.115, 0.08], [0.124, 0.105],
    [0.115, 0.125], [0.092, 0.115], [0.078, 0.035], [0, 0.035],
  ], { at: [0, 0.35, 0.452], color: gold, bone: root, segments: 10 });
  cylinder([0, 0.429, 0.452], 0.092, 0.092, 0.02, "#a19a8b", 12);
  for (let j = 0; j < 5; j++) {
    const x = (j - 2) * 0.026;
    const z = 0.452 + (j % 2 ? 0.013 : -0.015);
    const y = 0.64 + (j % 3) * 0.022;
    rod([x, 0.426, z], [x + (j - 2) * 0.005, y, z], 0.004, C.redDark);
    glow(ellipsoid([x + (j - 2) * 0.005, y, z],
      [0.006, 0.009, 0.006], "#ffab79"), 1.1);
  }
  for (const s of [-1, 1]) {
    torus([s * 0.125, 0.429, 0.452], 0.032, 0.009, C.goldDark, [0, 90, 0]);
    ellipsoid([s * 0.116, 0.41, 0.452], [0.027, 0.029, 0.027], C.gold);
    plate(s * 0.63, 0.666, -0.56, 0.11);
    b.lathe([
      [0, 0], [0.036, 0], [0.055, 0.072],
      [0.047, 0.08], [0.028, 0.024], [0, 0.024],
    ], { at: [s * 0.63, 0.718, -0.56], color: C.cream, bone: root, segments: 8 });
    cylinder([s * 0.63, 0.776, -0.56], 0.04, 0.04, 0.009, "#c48b52", 10);
  }

  // Side prayer rack.
  const rackX = -2.055;
  const rackZ = -0.39;
  for (const s of [-1, 1]) {
    box([rackX + s * 0.245, 0.255, rackZ], [0.155, 0.1, 0.2], stone);
    box([rackX + s * 0.245, 0.765, rackZ], [0.055, 1.02, 0.065], wood);
    box([rackX + s * 0.245, 1.22, rackZ], [0.07, 0.045, 0.075], gold);
  }
  box([rackX, 1.255, rackZ], [0.64, 0.085, 0.12], lacquer);
  box([rackX, 1.307, rackZ], [0.7, 0.035, 0.16], C.roofDark);
  box([rackX, 1.331, rackZ + 0.084], [0.69, 0.012, 0.012], gold);
  box([rackX, 0.865, rackZ], [0.55, 0.036, 0.045], C.redDark);
  for (let row = 0; row < 2; row++)
    for (let j = 0; j < 3; j++) {
      const x = rackX + (j - 1) * 0.165;
      const y = 1.08 - row * 0.355;
      const z = rackZ + 0.072;
      tube([
        [x - 0.018, y + 0.09, z],
        [x, row === 0 ? 1.24 : 0.865, rackZ + 0.035],
        [x + 0.018, y + 0.09, z],
      ], 0.004, C.rope);
      b.extrude([
        [-0.067, 0.044], [0, 0.087], [0.067, 0.044],
        [0.067, -0.07], [-0.067, -0.07],
      ], {
        at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.016, color: "#c99566", bone: root,
      });
      drawing([x, y + 0.008, z + 0.009], 0.135, 0.155, prayerArt);
    }

  // The shrubbery remains lower than the lanterns and clear of the shrine's face.
  function shrub(x: number, z: number, flowering: boolean) {
    b.sweep(catmull([
      [x, 0.22, z], [x - 0.065, 0.49, z],
      [x + 0.015, 0.79, z - 0.045], [x + 0.08, 1.02, z - 0.08],
    ]), [0.047, 0.04, 0.029, 0.012], {
      color: wood, bone: root, sides: 6,
    });
    const clusters = [
      [-0.23, 0.66, 0.05], [0.17, 0.78, 0.07],
      [-0.15, 0.96, -0.07], [0.12, 1.13, -0.05],
    ];
    for (let j = 0; j < clusters.length; j++) {
      const [dx, y, dz] = clusters[j];
      rod([x, y - 0.2, z], [x + dx, y, z + dz], 0.018, wood);
      if (flowering) {
        // Chunky overlapping faceted sprays, not smooth floating discs.
        const cluster = ellipsoid([x + dx, y, z + dz],
          [0.255, 0.16, 0.22], j % 2 ? C.pinkDark : C.pink);
        ellipsoid([x + dx + 0.07, y + 0.075, z + dz + 0.06],
          [0.155, 0.1, 0.14], C.pinkLight);
        const surf = b.surface(cluster);
        for (const [az, el] of [[-25, 20], [38, 6], [5, 56]]) {
          const hit = surf.around(cluster).at(az, el);
          blossom([hit.at.x, hit.at.y, hit.at.z], 0.045);
        }
      } else {
        ellipsoid([x + dx, y, z + dz],
          [0.245, 0.135, 0.21], j % 2 ? C.leaf : C.moss);
        ellipsoid([x + dx + 0.055, y + 0.06, z + dz + 0.055],
          [0.15, 0.08, 0.14], C.mossLight);
      }
    }
  }
  shrub(-1.99, -1.34, true);
  shrub(2.01, -1.29, false);

  for (let j = 0; j < 20; j++) {
    const s = j % 2 ? -1 : 1;
    const x = s * (1.77 + random() * 0.42);
    const z = -1.53 + random() * 2.83;
    const r = 0.07 + random() * 0.095;
    const pebble = ellipsoid([x, 0.205 + r * 0.38, z],
      [r * (1 + random() * 0.5), r * 0.6, r], stone, "roadsidePebble");
    if (j % 3 === 0) {
      const hit = b.surface(pebble).around(pebble).at(0, 90);
      b.stick(new THREE.SphereGeometry(1, 7, 4), C.moss, hit, {
        scale: [r * 0.7, 0.009, r * 0.55], embed: 0.25,
      });
    }
  }

  for (let j = 0; j < 14; j++) {
    const s = j % 2 ? -1 : 1;
    const x = s * (1.7 + random() * 0.48);
    const z = -1.5 + random() * 2.88;
    const h = 0.1 + random() * 0.1;
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3 + random() * 0.3;
      const dx = Math.cos(a) * 0.046;
      const dz = Math.sin(a) * 0.046;
      b.slab([
        [x - dz * 0.25, 0.205, z + dx * 0.25],
        [x + dz * 0.25, 0.205, z - dx * 0.25],
        [x + dx * 0.5, 0.205 + h, z + dz * 0.5],
        [x + dx, 0.205 + h * 0.7, z + dz],
      ], {
        thickness: 0.003, color: k === 1 ? C.mossLight : C.leaf, bone: root,
      });
    }
  }

  const petals = [];
  for (let j = 0; j < 30; j++) {
    const x = (random() - 0.5) * 4.1;
    const z = (random() - 0.5) * 3.24;
    let y = 0.216;
    if (Math.abs(x) < 0.5 && z > 0.53) y = 0.273;
    if (Math.abs(x) < 0.72 && z > 0.12 && z < 0.52) y = 0.359;
    if (Math.abs(x) < 0.87 && z >= -0.22 && z <= 0.12) y = 0.466;
    if (Math.abs(x) < 0.87 && z < -0.22 && z > -1.36) y = 0.709;
    petals.push(frame([x, y, z], [0, 1, 0]));
  }
  b.cards(petals, petalArt, {
    size: [0.042, 0.056], lean: 90, flow: [0.3, 0, 1],
    spin: 180, vary: 0.35, rng: rng(923), mirror: true, sink: 0, bone: root,
  });

  for (const s of [-1, 1]) {
    const x = s * 1.185;
    rod([x, 2.57, -0.02], [x, 2.34, -0.02], 0.006, C.goldDark);
    diamond([x, 2.31, -0.02], 0.09, 0.13, gold);
    glow(ellipsoid([x, 2.311, -0.004], [0.018, 0.026, 0.009], C.magic), 0.7);
    for (let k = 0; k < 3; k++)
      rod([x + (k - 1) * 0.014, 2.25, -0.02],
        [x + (k - 1) * 0.018, 2.164, -0.02], 0.004, C.red);
  }

  return b.root;
}
```