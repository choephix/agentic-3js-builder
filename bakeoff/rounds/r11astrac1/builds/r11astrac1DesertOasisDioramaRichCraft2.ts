import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
  grain,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Little Mirage",
  description:
    "A whimsical low-poly oasis: jade water, wind-bent date palms, striped caravan tents, and two decorated camels on a sculpted island of golden sand.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "The Little Mirage", paintSize: 1024 });
  const random = rng(317);
  const ground = b.joint("oasis", { at: [0, 0, 0] });
  const Y = 0.28;

  const C = {
    sand: "#e9bb70",
    paleSand: "#f7d994",
    sandShadow: "#bd8150",
    sandstone: "#d99c61",
    cream: "#fff0bd",
    ink: "#352c35",
    teal: "#176c70",
    turquoise: "#38b6a9",
    water: "#168f99",
    deepWater: "#137980",
    waterLight: "#91e3ca",
    red: "#ba4f3e",
    orange: "#df7850",
    gold: "#e9b552",
    wood: "#795442",
    trunk: "#9c7047",
    leaf: "#3e8852",
    leafLight: "#78ad58",
    leafDark: "#286d4c",
    leather: "#744638",
    camel: "#d7a061",
    camelLight: "#e9bb7c",
    hoof: "#876047",
    white: "#fff9df",
  };

  const sandPaint = paint((p, n) =>
    mix(
      "#dca45f",
      "#f3cf8a",
      Math.max(0, Math.min(1, 0.48 + n.y * 0.29 + (noise(p, 0.36, 4) - 0.5) * 0.35)),
    ),
  );
  const stonePaint = paint((p, n) =>
    mix("#bd8054", "#ebbf7c", 0.35 + n.y * 0.25 + noise(p, 0.18, 5) * 0.3),
  );
  const trunkPaint = grain("#a47b50", "#bc935e", { size: 0.11, axis: "y", seed: 9 });
  const waterPaint = paint((p) => {
    const dx = (p.x + 0.5) / 1.05;
    const dz = (p.z - 0.5) / 1.03;
    const distance = Math.min(1, Math.hypot(dx, dz));
    const shimmer = (noise(p, 0.29, 31) - 0.5) * 0.055;
    return mix("#147d86", "#35b7ae", Math.pow(distance, 2.7) * 0.82 + shimmer);
  });
  const camelPaint = paint((p, n) =>
    mix("#ba804d", "#e4b377", 0.5 + 0.26 * n.y + 0.15 * noise(p, 0.12, 8)),
  );
  const canvasPaint = paint((p, n) => {
    const weave = Math.sin(p.y * 240) * Math.sin(p.z * 240);
    return mix("#edc98d", "#fff0c4", 0.55 + n.y * 0.17 + weave * 0.035);
  });

  type Fill = string | ReturnType<typeof paint>;
  type Bone = typeof ground;

  function box(
    at: number[],
    size: number[],
    color: Fill,
    bone: Bone = ground,
    name = "block",
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, name, rotation,
    });
  }

  function ellipsoid(
    at: number[],
    size: number[],
    color: Fill,
    bone: Bone = ground,
    name = "roundedForm",
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at, scale: size, bone, name, flat: true,
    });
  }

  function pebble(at: number[], size: number[], color: Fill = stonePaint) {
    return b.part(new THREE.IcosahedronGeometry(1, 0), color, {
      at, scale: size, bone: ground,
      rotation: [random() * 60, random() * 180, random() * 40],
      name: "windwornStone",
    });
  }

  function rod(a: number[], end: number[], r: number, color: Fill, bone: Bone = ground) {
    return b.rod(a, end, r, { color, bone, sides: 6 });
  }

  function drawing(markup: string, width = 128, height = 128, size = 256) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${markup}</svg>`,
      { size },
    );
  }

  // The drawings deliberately share the same diamond-and-date-palm vocabulary.
  const blanketTexture = drawing(`
    <rect width="128" height="128" fill="#1c7378"/>
    <path d="M0 10H128M0 118H128" stroke="#362e39" stroke-width="17"/>
    <path d="M0 11H128M0 117H128" stroke="#efc77d" stroke-width="5"/>
    <path d="M9 0V128M119 0V128" stroke="#df7954" stroke-width="8"/>
    <path d="M64 26L96 64L64 102L32 64Z" fill="#f2c67b" stroke="#342f38" stroke-width="6"/>
    <path d="M64 42L82 64L64 86L46 64Z" fill="#c75b45"/>
    <path d="M64 54L72 64L64 74L56 64Z" fill="#fff0bc"/>
    <path d="M18 36L25 44L18 52L11 44ZM110 76L117 84L110 92L103 84Z" fill="#f3d492"/>
    <path d="M35 16V24M51 16V24M67 16V24M83 16V24M99 16V24
      M35 104V112M51 104V112M67 104V112M83 104V112M99 104V112"
      stroke="#fff0bc" stroke-width="3"/>
  `);

  const rugTexture = drawing(`
    <rect width="128" height="192" fill="#b84f41"/>
    <rect x="7" y="7" width="114" height="178" fill="none" stroke="#f2cc87" stroke-width="5"/>
    <rect x="17" y="17" width="94" height="158" fill="#244f59" stroke="#803f38" stroke-width="5"/>
    <path d="M64 29L100 67L64 103L28 67ZM64 91L100 129L64 165L28 129Z"
      fill="#df9c59" stroke="#f9ddb0" stroke-width="4"/>
    <path d="M64 46L82 67L64 87L46 67ZM64 108L82 129L64 149L46 129Z" fill="#a4443b"/>
    <path d="M24 25V167M104 25V167" stroke="#f1ce83" stroke-width="3" stroke-dasharray="4 7"/>
  `, 128, 192, 384);

  const eyeTexture = drawing(`
    <path d="M9 37Q28 12 54 33Q32 56 9 37Z" fill="#fff1cb" stroke="#593c33" stroke-width="5"/>
    <ellipse cx="33" cy="35" rx="10" ry="14" fill="#322c32"/>
    <ellipse cx="30" cy="30" rx="3.7" ry="4.5" fill="#ffffff"/>
    <path d="M8 31Q27 12 53 27M11 30L5 21M17 24L13 15" fill="none"
      stroke="#593c33" stroke-width="4" stroke-linecap="round"/>
  `, 64, 64, 192);

  const signTexture = drawing(`
    <rect x="2" y="2" width="252" height="124" rx="8" fill="#22656a" stroke="#f1cb83" stroke-width="5"/>
    <path d="M18 17H238M18 111H238" stroke="#d99957" stroke-width="3"/>
    <text x="128" y="56" text-anchor="middle" fill="#fff0bc" font-family="serif"
      font-weight="bold" font-size="33" letter-spacing="4">MIRAGE</text>
    <text x="128" y="90" text-anchor="middle" fill="#f6d698" font-family="serif"
      font-size="23" letter-spacing="7">OASIS</text>
  `, 256, 128, 512);

  const jugTexture = drawing(`
    <rect width="128" height="64" fill="#df9a64"/>
    <path d="M0 9H128M0 55H128" stroke="#f5dc9e" stroke-width="7"/>
    <path d="M0 32L16 18L32 32L48 18L64 32L80 18L96 32L112 18L128 32
      M0 32L16 46L32 32L48 46L64 32L80 46L96 32L112 46L128 32"
      fill="none" stroke="#5b7770" stroke-width="5"/>
  `, 128, 64);

  const medallionTexture = drawing(`
    <circle cx="64" cy="64" r="59" fill="#eabd6c" stroke="#6f4536" stroke-width="6"/>
    <circle cx="64" cy="64" r="48" fill="#245f63"/>
    <path d="M64 102V49M64 53Q36 28 22 51Q43 45 64 58
      M64 53Q91 27 107 50Q84 45 64 58
      M64 52Q48 18 35 29M64 52Q78 18 92 29"
      fill="none" stroke="#f1d392" stroke-width="7" stroke-linecap="round"/>
    <path d="M37 104Q64 93 91 104" fill="none" stroke="#e7ac67" stroke-width="5"/>
  `);

  // All animal skeletons are established before scenery or anatomy.
  function camelRig(prefix: string, origin: number[], scale: number) {
    const P = (p: number[]) => [
      origin[0] + p[0] * scale,
      origin[1] + p[1] * scale,
      origin[2] + p[2] * scale,
    ];
    const hips = b.joint(`${prefix}Hips`, {
      parent: ground, at: P([0, 1.02, -0.35]), dir: [0, 0, 1], role: "spine",
    });
    const spine = b.chain(
      `${prefix}Spine`,
      [P([0, 1.04, -0.48]), P([0, 1.08, 0]), P([0, 1.12, 0.46])],
      { parent: hips, role: "spine" },
    );
    const neck = b.chain(
      `${prefix}Neck`,
      [P([0, 1.12, 0.43]), P([0, 1.4, 0.61]), P([0, 1.85, 0.72]), P([0, 2.02, 0.88])],
      { parent: spine.joints[1], role: "neck" },
    );
    const head = b.joint(`${prefix}Head`, {
      parent: neck.joints[2], at: P([0, 2.02, 0.87]), dir: [0, 0, 1], role: "head",
    });
    const jaw = b.joint(`${prefix}Jaw`, {
      parent: head, at: P([0, 1.93, 0.94]), dir: [0, 0, 1], role: "jaw",
    });
    const legs = [-1, 1].flatMap((s) =>
      [-1, 1].map((fore) => {
        const z = fore > 0 ? 0.39 : -0.4;
        const side = s > 0 ? "L" : "R";
        const label = `${prefix}${fore > 0 ? "Front" : "Hind"}`;
        return {
          s, z, fore,
          chain: b.chain(
            `${label}${side}`,
            [
              P([s * 0.21, 1.04, z]),
              P([s * 0.28, 0.56, z + (fore > 0 ? 0.055 : -0.06)]),
              P([s * 0.32, 0.13, z + 0.025]),
            ],
            {
              parent: fore > 0 ? spine.joints[1] : hips,
              names: [`${label}Hip${side}`, `${label}Knee${side}`, `${label}Ankle${side}`],
              role: "leg",
              contact: P([s * 0.32, 0, z + 0.08]),
            },
          ),
        };
      }),
    );
    const tail = b.chain(
      `${prefix}Tail`,
      [P([0, 1.14, -0.49]), P([0.08, 1.01, -0.75]), P([0.13, 0.72, -0.88])],
      { parent: hips, role: "tail" },
    );
    return { prefix, P, scale, hips, spine, neck, head, jaw, legs, tail };
  }

  const largeCamel = camelRig("Saffron", [1.55, Y, 1.05], 0.87);
  const smallCamel = camelRig("Juniper", [-2.28, Y, 0.58], 0.66);

  // A shallow, intentionally polygonal display island.
  b.part(new THREE.CylinderGeometry(3.31, 3.16, 0.22, 13), C.sandShadow, {
    at: [0, 0.11, 0], scale: [1, 1, 0.9], bone: ground, name: "cutSandstoneFoundation",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(3.35, 3.31, 0.08, 13), sandPaint, {
    at: [0, 0.24, 0], scale: [1, 1, 0.9], bone: ground, name: "goldenSandIsland",
    flat: true,
  });
  // A few graphic strata on the cut edge.
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const x = Math.sin(a) * 3.19;
    const z = Math.cos(a) * 2.87;
    pebble([x, 0.12, z], [0.12, 0.045, 0.1], C.sandstone);
  }

  const poolX = -0.5;
  const poolZ = 0.5;
  const poolOutline: number[][] = [
    [-1.24, -0.45], [-0.98, -0.94], [-0.35, -1.09], [0.29, -0.93],
    [0.85, -0.61], [1.04, -0.12], [0.93, 0.5], [0.54, 0.92],
    [-0.1, 1.04], [-0.73, 0.85], [-1.12, 0.35],
  ];
  function poolLayer(scale: number, y: number, color: Fill, name: string) {
    b.extrude(
      poolOutline.map(([x, z]) => [x * scale, z * scale]),
      {
        at: [poolX, y, poolZ], x: [1, 0, 0], y: [0, 0, 1],
        thickness: 0.012, color, bone: ground, name,
      },
    );
  }
  poolLayer(1.09, Y + 0.007, C.paleSand, "paleWetShore");
  poolLayer(1, Y + 0.017, C.turquoise, "turquoiseShallows");
  poolLayer(0.96, Y + 0.025, waterPaint, "jadeWaterWithShallowEdges");

  // Broken glints, rather than a dense or shiny water shader.
  for (let j = 0; j < 7; j++) {
    const cx = poolX - 0.42 + random() * 0.75;
    const cz = poolZ - 0.62 + random() * 1.22;
    const w = 0.09 + random() * 0.23;
    b.sweep(
      [[cx - w, Y + 0.043, cz], [cx, Y + 0.043, cz + 0.025], [cx + w, Y + 0.043, cz]],
      0.009, { color: j % 2 ? C.waterLight : C.turquoise, bone: ground, sides: 4, caps: "flat" },
    );
  }
  for (const [cx, cz, radius] of [[-0.95, 1.03, 0.18], [0.03, 0.14, 0.24]]) {
    const points = Array.from({ length: 13 }, (_, i) => {
      const a = -0.3 + (i / 12) * Math.PI * 1.4;
      return [cx + Math.sin(a) * radius, Y + 0.044, cz + Math.cos(a) * radius * 0.55];
    });
    b.sweep(points, 0.008, { color: C.waterLight, sides: 4, bone: ground, caps: "flat" });
  }

  // The two-sided folded leaves use broad, faceted surfaces and a visible midrib.
  function palm(x: number, z: number, height: number, leanX: number, leanZ: number, index: number) {
    const base = [x, Y, z];
    const crown = [x + leanX, Y + height, z + leanZ];
    const trunkPath = catmull([
      base,
      [x + leanX * 0.12, Y + height * 0.35, z + leanZ * 0.12],
      [x + leanX * 0.55, Y + height * 0.72, z + leanZ * 0.55],
      crown,
    ]);
    b.sweep(trunkPath, [0.14, 0.075], {
      color: trunkPaint, bone: ground, sides: 7, smooth: false, caps: "flat", name: `palm${index}Trunk`,
    });
    b.along(trunkPath, 16, (f) => {
      const radius = 0.143 - f.t * 0.061;
      b.part(new THREE.CylinderGeometry(radius * 0.95, radius * 1.035, 0.045, 7), "#96704b", {
        frame: f, bone: ground, name: "palmLeafScar",
      });
    }, { from: 0.03, to: 0.95 });

    ellipsoid([crown[0], crown[1] - 0.04, crown[2]], [0.19, 0.18, 0.19], C.leafDark);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI * 0.5 + 0.4;
      ellipsoid(
        [crown[0] + Math.sin(a) * 0.15, crown[1] - 0.18, crown[2] + Math.cos(a) * 0.15],
        [0.105, 0.13, 0.095], k % 2 ? "#97723e" : "#b68c43", ground, "dateCluster",
      );
    }
    for (let k = 0; k < 9; k++) {
      const a = k * Math.PI * 2 / 9 + index * 0.43;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const length = (0.97 + random() * 0.36) * (height / 3.0);
      const rise = k % 3 === 0 ? 0.46 : 0.28;
      const drop = k % 3 === 0 ? 0.24 : 0.48;
      const frondPoint = (t: number): number[] => [
        crown[0] + dx * length * t,
        crown[1] + Math.sin(Math.PI * t) * rise - t * t * drop,
        crown[2] + dz * length * t,
      ];
      const spine = Array.from({ length: 11 }, (_, j) => frondPoint(j / 10));
      b.sweep(spine, [0.019, 0.002], {
        color: "#a6bc6b", bone: ground, sides: 4, caps: "flat", name: "frondMidrib",
      });

      // Six broad pairs make a feathered silhouette without hair-fine geometry.
      for (let j = 0; j < 6; j++) {
        const t = 0.13 + j * 0.125;
        const root = frondPoint(t);
        const heel = frondPoint(t + 0.095);
        const tipCenter = frondPoint(Math.min(1, t + 0.23));
        const span = (0.15 + Math.sin(Math.PI * t) * 0.16) * (height / 3);
        for (const s of [-1, 1]) {
          const tip = [
            tipCenter[0] + s * dz * span,
            tipCenter[1] - span * 0.42,
            tipCenter[2] - s * dx * span,
          ];
          const shoulder = [
            root[0] + dx * length * 0.045 + s * dz * span * 0.61,
            root[1] - span * 0.07,
            root[2] + dz * length * 0.045 - s * dx * span * 0.61,
          ];
          b.slab([root, shoulder, tip, heel], {
            color: s > 0
              ? (k % 3 === 0 ? C.leafLight : C.leaf)
              : (k % 3 === 0 ? C.leaf : C.leafDark),
            thickness: 0.009,
            bone: ground,
            name: "pointedDatePalmLeaflet",
          });
        }
      }
    }
    for (let k = 0; k < 4; k++) {
      const a = k * 1.57;
      b.spike(
        [x + Math.sin(a) * 0.08, Y + 0.02, z + Math.cos(a) * 0.08],
        [x + Math.sin(a) * 0.32, Y + 0.005, z + Math.cos(a) * 0.32],
        null, 0.055, { color: C.trunk, bone: ground, sides: 5 },
      );
    }
  }

  palm(-2.0, -0.98, 2.83, 0.24, 0.02, 1);
  palm(-1.35, -2.04, 3.25, 0.42, 0.1, 2);
  palm(2.5, -1.25, 2.53, -0.18, -0.1, 3);

  function tassel(at: number[], length: number, color: string, bone: Bone = ground, scale = 1) {
    ellipsoid(at, [0.025 * scale, 0.025 * scale, 0.025 * scale], C.gold, bone, "tasselBead");
    b.part(new THREE.ConeGeometry(0.035 * scale, length, 5), color, {
      at: [at[0], at[1] - length * 0.53, at[2]],
      rotation: [180, 0, 0], bone, name: "wovenTassel",
    });
  }

  function tent(cx: number, front: number, width: number, depth: number, height: number, secondary = false) {
    const half = width / 2;
    const peak = Y + height;
    const eave = Y + 0.035;
    const back = front - depth;
    const dark = secondary ? "#214e52" : "#563d3a";
    const stripe = secondary ? C.teal : C.red;

    // The shadow belongs at the rear: the entrance is an actual open volume.
    b.slab(
      [[cx - half * 0.94, Y + 0.018, back + 0.035],
        [cx + half * 0.94, Y + 0.018, back + 0.035],
        [cx, peak - 0.035, back + 0.035]],
      { thickness: 0.018, color: dark, bone: ground, name: "tentRearLining" },
    );
    box(
      [cx, Y + 0.012, front - depth * 0.51],
      [width * 0.91, 0.018, depth * 0.94],
      secondary ? "#426f68" : "#98644d",
      ground,
      "tentWovenFloor",
    );
    const bedZ = back + depth * 0.31;
    box(
      [cx + half * 0.18, Y + 0.065, bedZ],
      [width * 0.48, 0.105, depth * 0.34],
      secondary ? C.orange : C.teal,
      ground,
      "caravanSleepingMat",
    );
    box(
      [cx + half * 0.18, Y + 0.14, bedZ - depth * 0.1],
      [width * 0.31, 0.09, depth * 0.12],
      C.cream,
      ground,
      "tentPillow",
    );
    b.part(new THREE.PlaneGeometry(width * 0.36, depth * 0.31), "#ffffff", {
      at: [cx + half * 0.18, Y + 0.12, bedZ + depth * 0.025],
      rotation: [-90, 0, 0],
      texture: rugTexture,
      bone: ground,
      name: "foldedInteriorQuilt",
    });
    b.slab(
      [[cx - half, eave, back], [cx + half, eave, back], [cx, peak, back]],
      { thickness: 0.025, color: stripe, bone: ground, name: "tentBack" },
    );
    const count = secondary ? 6 : 8;
    for (let j = 0; j < count; j++) {
      const z0 = front - depth * j / count;
      const z1 = front - depth * (j + 1) / count;
      for (const s of [-1, 1]) {
        b.slab(
          [[cx, peak, z0], [cx + s * half, eave, z0],
            [cx + s * half, eave, z1], [cx, peak, z1]],
          {
            thickness: 0.024, color: j % 2 ? canvasPaint : stripe,
            bone: ground, name: "stripedCanvasRoof",
          },
        );
      }
    }
    rod([cx, peak + 0.015, front + 0.04], [cx, peak + 0.015, back - 0.04], 0.024, C.gold);
    for (const s of [-1, 1]) {
      const corner = [cx + s * half, eave, front];
      rod(corner, [cx, peak, front], 0.022, C.gold);
      rod([cx + s * half, eave, back], [cx, peak, back], 0.019, C.gold);
      rod(corner, [cx + s * half, eave, back], 0.019, C.cream);
      rod([cx + s * half, Y, front], corner, 0.024, C.wood);

      b.slab(
        [[cx + s * half * 0.96, Y + 0.02, front + 0.014],
          [cx + s * half * 0.52, Y + 0.02, front + 0.014],
          [cx + s * half * 0.57, Y + height * 0.4, front + 0.025],
          [cx, peak - 0.025, front + 0.014],
          [cx + s * half, eave, front + 0.014]],
        { thickness: 0.018, color: secondary ? C.turquoise : C.orange, bone: ground, name: "tiedBackCurtain" },
      );
      rod(
        [cx + s * half * 0.59, Y + height * 0.35, front + 0.045],
        [cx + s * half * 0.83, Y + height * 0.36, front + 0.045],
        0.02, C.gold,
      );
      tassel([cx + s * half * 0.65, Y + height * 0.35, front + 0.055], 0.12, C.teal);

      for (let j = 1; j <= (secondary ? 4 : 6); j++) {
        const t = j / (secondary ? 5 : 7);
        tassel(
          [cx + s * half * t, peak + (eave - peak) * t - 0.018, front + 0.035],
          secondary ? 0.065 : 0.085,
          j % 2 ? C.gold : C.teal,
          ground,
          secondary ? 0.7 : 0.9,
        );
      }
      const pegX = cx + s * (half + 0.23);
      const pegZ = front + 0.28;
      rod([pegX, Y, pegZ], [pegX - s * 0.025, Y + 0.15, pegZ - 0.025], 0.022, C.wood);
      b.sweep(
        bezier(
          [cx + s * half * 0.85, eave + height * 0.14, front],
          [pegX - s * 0.06, Y + 0.2, pegZ - 0.08],
          [pegX - s * 0.02, Y + 0.11, pegZ - 0.02],
        ),
        0.009, { color: C.cream, bone: ground, sides: 4 },
      );
    }
    rod([cx, Y, back], [cx, peak + 0.12, back], 0.028, C.wood);
    ellipsoid([cx, peak + 0.14, back], [0.045, 0.055, 0.045], C.gold);
    b.slab(
      [[cx, peak + 0.12, back], [cx + 0.31, peak + 0.03, back], [cx, peak - 0.03, back]],
      { color: secondary ? C.orange : C.teal, thickness: 0.012, bone: ground, name: "caravanPennant" },
    );
  }

  tent(1.38, -0.48, 1.76, 1.44, 1.58);
  tent(-0.22, -1.63, 1.09, 0.87, 0.95, true);

  // Welcome rug, its small fringe kept dimensional.
  b.part(new THREE.PlaneGeometry(0.64, 0.88), "#ffffff", {
    at: [1.34, Y + 0.014, -0.07], rotation: [-90, 0, 0],
    texture: rugTexture, bone: ground, name: "entranceCarpet",
  });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const x = 1.07 + i * 0.067;
      rod([x, Y + 0.015, -0.07 + s * 0.44], [x, Y + 0.015, -0.07 + s * 0.5], 0.007, C.cream);
    }
  }

  function jug(x: number, z: number, size: number) {
    const shape = [
      [0, 0], [0.1, 0], [0.15, 0.07], [0.17, 0.2],
      [0.12, 0.29], [0.064, 0.32], [0.064, 0.38],
      [0.085, 0.39], [0.085, 0.42], [0.045, 0.42],
      [0.045, 0.35], [0.02, 0.33], [0, 0.33],
    ].map(([r, y]) => [r * size, y * size]);
    const pot = b.lathe(shape, {
      at: [x, Y, z], segments: 10, color: "#cb8054", bone: ground, name: "waterAmphora",
    });
    b.part(new THREE.TorusGeometry(0.081 * size, 0.018 * size, 5, 10), C.sandShadow, {
      at: [x + 0.13 * size, Y + 0.27 * size, z],
      bone: ground, name: "jugHandle",
    });
    b.decal(pot, jugTexture, {
      at: [x, Y + 0.19 * size, z + 0.17 * size],
      dir: [0, 0, 1], size: [0.24 * size, 0.12 * size], segments: 6,
      bone: ground, name: "paintedJugBand",
    });
    b.part(new THREE.CylinderGeometry(0.043 * size, 0.043 * size, 0.008 * size, 10), C.ink, {
      at: [x, Y + 0.386 * size, z], bone: ground, name: "jugOpening",
    });
  }
  jug(2.23, -0.15, 0.85);
  jug(2.45, 0.12, 0.6);
  jug(0.53, -0.69, 0.55);

  // A low tea table, cushion and warm lantern live beside—not in front of—the doorway.
  for (const s of [-1, 1]) {
    rod([0.61 + s * 0.13, Y, -0.12], [0.61 + s * 0.13, Y + 0.19, -0.12], 0.024, C.wood);
  }
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 10), C.wood, {
    at: [0.61, Y + 0.21, -0.12], bone: ground, name: "teaTable",
  });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.013, 12), C.gold, {
    at: [0.61, Y + 0.237, -0.12], bone: ground, name: "brassTeaTray",
  });
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1;
    b.part(new THREE.CylinderGeometry(0.026, 0.02, 0.043, 8), C.cream, {
      at: [0.61 + Math.sin(a) * 0.085, Y + 0.266, -0.12 + Math.cos(a) * 0.085],
      bone: ground, name: "teaCup",
    });
  }
  box([0.62, Y + 0.055, 0.23], [0.29, 0.11, 0.22], C.red, ground, "teaCushion");

  const lx = 2.22, lz = -0.51;
  rod([lx, Y, lz], [lx, Y + 0.89, lz], 0.022, C.wood);
  rod([lx, Y + 0.89, lz], [lx - 0.15, Y + 0.89, lz], 0.021, C.wood);
  rod([lx - 0.15, Y + 0.89, lz], [lx - 0.15, Y + 0.76, lz], 0.009, C.gold);
  glow(box([lx - 0.15, Y + 0.64, lz], [0.11, 0.17, 0.1], "#ffcf76", ground, "lanternLight"), 1.25);
  for (const sy of [0.54, 0.74]) {
    box([lx - 0.15, Y + sy, lz], [0.15, 0.032, 0.14], C.teal, ground, "lanternCap");
  }
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      rod(
        [lx - 0.15 + sx * 0.058, Y + 0.55, lz + sz * 0.05],
        [lx - 0.15 + sx * 0.058, Y + 0.73, lz + sz * 0.05],
        0.009, C.gold,
      );
    }
  }

  function buildCamel(rig: ReturnType<typeof camelRig>, accent: string) {
    const { P, scale: S, hips, spine, neck, head, jaw, legs, tail } = rig;
    const E = (p: number[], radius: number[], color: Fill, bone: Bone, name: string) =>
      ellipsoid(P(p), radius.map((v) => v * S), color, bone, name);

    b.sweep(spine, () => [0.3 * S, 0.33 * S], {
      color: camelPaint, sides: 8, bone: spine, name: "camelBarrel",
    });
    // A single bold dromedary hump, with broad, deliberately visible facets.
    b.loft(
      [
        { at: P([0, 1.2, -0.05]), w: 0.54 * S, h: 0.67 * S },
        { at: P([0, 1.54, -0.08]), w: 0.36 * S, h: 0.42 * S },
        { at: P([0, 1.72, -0.12]), w: 0.11 * S, h: 0.14 * S },
      ],
      { bone: spine.joints[0], color: camelPaint, sides: 6, caps: "round", name: "singleCamelHump" },
    );
    b.sweep(neck, [0.22 * S, 0.18 * S, 0.115 * S, 0.13 * S], {
      color: camelPaint, sides: 7, name: "uprightCamelNeck",
    });

    for (const leg of legs) {
      b.sweep(leg.chain, [0.105 * S, 0.068 * S, 0.055 * S], {
        color: camelPaint, sides: 6, name: "longCamelLeg",
      });
      const knee = leg.chain.joints[1];
      b.part(new THREE.SphereGeometry(0.083 * S, 8, 5), C.camelLight, {
        at: knee.at, bone: knee, flat: true, name: "camelKnee",
      });
      const foot = leg.chain.tip!;
      E(
        [leg.s * 0.32, 0.085, leg.z + 0.09],
        [0.108, 0.085, 0.163], C.hoof, foot, "broadCamelFoot",
      );
      for (const d of [-1, 1]) {
        E(
          [leg.s * 0.32 + d * 0.049, 0.069, leg.z + 0.19],
          [0.047, 0.044, 0.068], C.camelLight, foot, "splitCamelToe",
        );
      }
    }

    b.sweep(tail, [0.042 * S, 0.023 * S], {
      color: camelPaint, sides: 6, name: "extendedCamelTail",
    });
    E([0.13, 0.7, -0.89], [0.065, 0.13, 0.064], C.leather, tail.joints[1], "tailTassel");

    const skull = E([0, 2.02, 0.97], [0.18, 0.195, 0.24], camelPaint, head, "camelSkull");
    b.frustumBox(
      P([0, 1.985, 1.04]), P([0, 1.965, 1.31]),
      [0.28 * S, 0.21 * S], [0.24 * S, 0.15 * S],
      { bone: head, color: C.camelLight, name: "upperMuzzle" },
    );
    E([0, 1.877, 1.18], [0.127, 0.057, 0.202], C.camelLight, jaw, "separateLowerJaw");
    E([0, 1.921, 1.24], [0.115, 0.014, 0.16], C.leather, jaw, "quietMouthLine");

    for (const s of [-1, 1]) {
      const eyeAt = P([s * 0.131, 2.065, 1.115]);
      b.decal(skull, eyeTexture, {
        at: eyeAt, dir: [s * 0.48, 0.04, 1],
        size: [0.175 * S, 0.165 * S], mirror: s > 0, segments: 8,
        bone: head, name: "kindCamelEye",
      });
      E([s * 0.087, 2.0, 1.325], [0.027, 0.019, 0.012], C.leather, head, "nostril");
      b.extrude(
        [[0, 0], [0.13 * S, 0.02 * S], [0.235 * S, 0.145 * S],
          [0.12 * S, 0.18 * S], [0.015 * S, 0.085 * S]],
        {
          at: P([s * 0.12, 2.09, 0.88]), x: [s, 0, 0], y: [0, 1, -0.25],
          thickness: 0.07 * S, color: C.camelLight, bone: head, name: "wideCamelEar",
        },
      );
      b.extrude(
        [[0, 0], [0.11 * S, 0.023 * S], [0.165 * S, 0.106 * S], [0.07 * S, 0.11 * S]],
        {
          at: P([s * 0.159, 2.128, 0.923]), x: [s, 0, 0], y: [0, 1, -0.25],
          thickness: 0.009 * S, color: "#bd805f", bone: head, name: "earInner",
        },
      );
    }
    for (let i = 0; i < 3; i++) {
      b.spike(
        P([(i - 1) * 0.046, 2.16, 0.92]),
        P([(i - 1) * 0.056, 2.205 + (i === 1 ? 0.018 : 0), 0.91]),
        null, 0.038 * S, { color: C.camelLight, bone: head, sides: 5, name: "camelForelock" },
      );
    }
    b.spike(P([0, 1.85, 1.02]), P([0, 1.73, 1.06]), null, 0.068 * S, {
      color: C.camelLight, bone: jaw, sides: 5, name: "littleCamelBeard",
    });

    // Bridle fits the actual muzzle; the two reins remain open and readable.
    const noseLoop = polyline(
      [[-0.123, 2.038, 1.247], [0.123, 2.038, 1.247], [0.135, 1.921, 1.247],
        [-0.135, 1.921, 1.247]].map(P),
      { closed: true },
    );
    b.sweep(noseLoop, 0.013 * S, { color: accent, bone: head, sides: 4, name: "wovenNoseBand" });
    for (const s of [-1, 1]) {
      b.sweep(
        [P([s * 0.133, 1.96, 1.26]), P([s * 0.187, 2.04, 0.95]), P([s * 0.12, 2.16, 0.86])],
        0.012 * S, { color: accent, bone: head, sides: 4, name: "cheekBridle" },
      );
      E([s * 0.142, 1.966, 1.25], [0.024, 0.024, 0.024], C.gold, head, "bridleStud");
      b.sweep(
        bezier(
          P([s * 0.15, 1.95, 1.23]),
          P([s * 0.33, 1.31, 0.69]),
          P([s * 0.28, 1.38, -0.28]),
        ),
        0.009 * S, { color: C.leather, bone: neck.joints[0], sides: 4, name: "looseCamelRein" },
      );
    }

    // The blanket is a simple box with drawn weave and dimensional tassels.
    box(P([0, 1.26, -0.27]), [0.72 * S, 0.12 * S, 0.51 * S], accent, spine.joints[0], "saddlePad");
    for (const s of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.027 * S, 0.43 * S, 0.61 * S), "#ffffff", {
        at: P([s * 0.315, 1.105, -0.2]), texture: blanketTexture,
        bone: spine.joints[0], name: "patternedSaddleBlanket",
      });
      for (let j = 0; j < 5; j++) {
        tassel(P([s * 0.335, 0.89, -0.45 + j * 0.12]), 0.065 * S, j % 2 ? C.gold : accent, spine.joints[0], S);
      }
      box(P([s * 0.39, 1.26, -0.39]), [0.21 * S, 0.29 * S, 0.29 * S], C.leather, spine.joints[0], "leatherSaddlebag");
      box(P([s * 0.39, 1.38, -0.39]), [0.23 * S, 0.07 * S, 0.32 * S], C.orange, spine.joints[0], "saddlebagFlap");
      box(P([s * 0.39, 1.27, -0.223]), [0.045 * S, 0.095 * S, 0.014 * S], C.gold, spine.joints[0], "bagBuckle");
      box(
        P([s * 0.505, 1.285, -0.39]),
        [0.014 * S, 0.24 * S, 0.052 * S],
        C.sandShadow, spine.joints[0], "outerBagStrap",
      );
      box(
        P([s * 0.516, 1.285, -0.39]),
        [0.016 * S, 0.063 * S, 0.075 * S],
        C.gold, spine.joints[0], "outerBagBuckle",
      );
      box(
        P([s * 0.526, 1.285, -0.39]),
        [0.008 * S, 0.033 * S, 0.042 * S],
        C.leather, spine.joints[0], "buckleInset",
      );
      b.sweep(
        [P([s * 0.509, 1.365, -0.52]),
          P([s * 0.509, 1.34, -0.39]),
          P([s * 0.509, 1.365, -0.26])],
        0.006 * S,
        { color: C.cream, bone: spine.joints[0], sides: 4, name: "saddlebagFlapPiping" },
      );
    }
    rod(P([-0.26, 1.39, -0.32]), P([0.26, 1.39, -0.32]), 0.039 * S, C.wood, spine.joints[0]);
    b.part(new THREE.CylinderGeometry(0.075 * S, 0.075 * S, 0.5 * S, 8), C.cream, {
      at: P([0, 1.46, -0.43]), dir: [1, 0, 0], bone: spine.joints[0], name: "rolledCaravanRug",
    });
    for (const s of [-1, 1]) {
      b.part(new THREE.TorusGeometry(0.077 * S, 0.012 * S, 4, 8), accent, {
        at: P([s * 0.17, 1.46, -0.43]), rotation: [0, 90, 0],
        bone: spine.joints[0], name: "bedrollStrap",
      });
    }
    b.sweep(
      polyline([P([-0.16, 1.54, 0.64]), P([0, 1.43, 0.81]), P([0.16, 1.54, 0.64])]),
      0.024 * S, { color: accent, bone: neck.joints[1], sides: 5, name: "necklace" },
    );
    b.part(new THREE.ConeGeometry(0.047 * S, 0.07 * S, 8), C.gold, {
      at: P([0, 1.395, 0.823]), bone: neck.joints[1], name: "caravanBell",
    });
  }

  buildCamel(largeCamel, C.teal);
  buildCamel(smallCamel, C.red);

  // Reeds, succulent fans and stones describe the shore without obscuring the water.
  function reeds(x: number, z: number, height: number) {
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const h = height * (0.65 + random() * 0.35);
      b.sweep(
        [[x, Y, z], [x + dx * 0.04, Y + h * 0.6, z + dz * 0.04], [x + dx * 0.09, Y + h, z + dz * 0.09]],
        [0.013, 0.003], { color: i % 2 ? C.leaf : C.leafLight, bone: ground, sides: 4, name: "oasisReed" },
      );
      if (i % 2 === 0) {
        ellipsoid(
          [x + dx * 0.085, Y + h * 0.92, z + dz * 0.085],
          [0.022, 0.065, 0.022], C.gold, ground, "reedSeedHead",
        );
      }
    }
  }
  reeds(-1.57, -0.16, 0.4);
  reeds(-1.47, 1.21, 0.33);
  reeds(0.31, 1.19, 0.25);
  reeds(-0.85, -0.64, 0.29);

  function succulent(x: number, z: number, size: number) {
    for (let i = 0; i < 7; i++) {
      const a = i * Math.PI * 2 / 7;
      const dx = Math.sin(a), dz = Math.cos(a);
      b.slab(
        [
          [x, Y + 0.015, z],
          [x + dx * size * 0.48 + dz * size * 0.14, Y + size * 0.25, z + dz * size * 0.48 - dx * size * 0.14],
          [x + dx * size, Y + size * 0.64, z + dz * size],
          [x + dx * size * 0.48 - dz * size * 0.14, Y + size * 0.25, z + dz * size * 0.48 + dx * size * 0.14],
        ],
        { thickness: 0.016, color: i % 2 ? "#719c71" : "#98b882", bone: ground, name: "succulentLeaf" },
      );
    }
  }
  succulent(2.68, 0.75, 0.26);
  succulent(-2.64, -0.61, 0.24);
  succulent(-0.77, 2.12, 0.18);

  const shoreStones = [
    [-1.64, 0.1, 0.14], [-1.54, -0.34, 0.17], [-1.18, -0.61, 0.11],
    [-0.45, -0.62, 0.1], [0.31, -0.13, 0.11], [0.58, 0.41, 0.13],
    [0.28, 1.31, 0.11], [-0.28, 1.65, 0.13], [-1.09, 1.48, 0.12],
    [-1.56, 1.16, 0.12],
  ];
  for (const [x, z, r] of shoreStones) {
    pebble([x, Y + r * 0.34, z], [r, r * 0.47, r * 0.74]);
  }
  for (const [x, z, s] of [[2.64, 1.52, 0.2], [-2.77, 1.43, 0.19], [0.06, 2.28, 0.12], [2.87, -0.29, 0.18]]) {
    pebble([x, Y + s * 0.43, z], [s, s * 0.6, s * 0.7]);
    pebble([x + 0.17, Y + 0.035, z + 0.1], [0.08, 0.055, 0.07]);
  }

  // Sparse little sand ripples follow the empty foreground.
  for (let i = 0; i < 9; i++) {
    const x = -1.15 + i * 0.25;
    const z = 2.12 + Math.sin(i * 0.8) * 0.12;
    b.sweep(
      [[x - 0.07, Y + 0.006, z], [x, Y + 0.012, z - 0.02], [x + 0.1, Y + 0.006, z]],
      0.008, { color: C.paleSand, bone: ground, sides: 4, caps: "flat", name: "windRipple" },
    );
  }

  // A small freestanding sign and matching seal finish the travel-poster composition.
  const sx = -1.48, sz = 1.94;
  for (const s of [-1, 1]) {
    rod([sx + s * 0.21, Y, sz], [sx + s * 0.21, Y + 0.66, sz], 0.029, C.wood);
  }
  box([sx, Y + 0.48, sz], [0.68, 0.34, 0.065], C.wood, ground, "oasisSignboard");
  b.part(new THREE.PlaneGeometry(0.63, 0.315), "#ffffff", {
    at: [sx, Y + 0.48, sz + 0.034], texture: signTexture,
    bone: ground, name: "mirageOasisLettering",
  });
  b.part(new THREE.CircleGeometry(0.115, 16), "#ffffff", {
    at: [1.38, Y + 1.23, -0.445], texture: medallionTexture,
    bone: ground, name: "caravanPalmEmblem",
  });

  return b.root;
}
