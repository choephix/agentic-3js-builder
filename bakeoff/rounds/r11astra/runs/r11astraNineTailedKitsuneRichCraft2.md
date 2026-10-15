```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  rng,
  paint,
  mix,
  noise,
  grain,
  svg,
  type Joint,
  type Fill,
  type PointInput,
  type OutlinePoint,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Amateru, Keeper of Nine Embers",
  description:
    "An ivory nine-tailed kitsune with vermilion shrine markings, gilded charms, and nine azure spirit fires, standing on a moonlit sanctuary seal.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Amateru",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(92);
  const C = {
    ivory: "#fff0d1",
    white: "#fff9e9",
    lavender: "#c3b4ce",
    plum: "#38243f",
    ink: "#231b35",
    red: "#bf304e",
    redLight: "#f25b63",
    redDark: "#702640",
    gold: "#e9b55e",
    goldLight: "#ffe6a1",
    goldDark: "#96623c",
    teal: "#34dfda",
    blue: "#297fca",
    flame: "#66fff0",
    heart: "#e3fff5",
    stone: "#454359",
    stoneTop: "#77738c",
    moss: "#626c86",
  };

  const fur = paint((p, n) => {
    const lit = Math.max(0, n.y * 0.65 + n.z * 0.3 + n.x * 0.15);
    const shade = mix("#b8a7c5", "#fff0d5", 0.35 + lit * 0.65);
    return mix(shade, "#ffffff", noise(p, 0.09, 4) * 0.07);
  });
  const paleFur = paint((_p, n) =>
    mix("#c8b5ce", "#fff8e7", Math.max(0.15, 0.65 + n.y * 0.3 + n.z * 0.2)),
  );
  const gold = paint((p, n) =>
    mix(
      "#a87340",
      "#ffe5a0",
      Math.min(1, 0.42 + n.y * 0.25 + n.z * 0.18 + noise(p, 0.05, 7) * 0.2),
    ),
  );
  const silk = grain("#a92548", "#dc4862", {
    size: 0.014,
    axis: "y",
    seed: 4,
  });
  const rock = paint((p, n) =>
    mix("#363447", "#858096", 0.22 + Math.max(0, n.y) * 0.43 + noise(p, 0.18, 3) * 0.2),
  );

  // The eyes are deliberately long and fox-like rather than round.
  const eyeTex = svg(
    `<svg viewBox="0 0 180 110">
      <path d="M8 56 Q68 8 155 30 L176 16 L161 52 Q107 101 36 80Z" fill="#48243f"/>
      <path d="M21 56 Q81 21 155 39 Q111 86 43 73Z" fill="#fff1da"/>
      <path d="M62 35 Q91 24 118 34 L113 73 Q89 87 68 72Z" fill="#e99931"/>
      <path d="M67 53 Q91 43 115 50 L110 73 Q89 83 71 70Z" fill="#ffd76a"/>
      <path d="M89 30 Q100 49 91 80 Q80 57 89 30Z" fill="#30213d"/>
      <path d="M11 55 Q78 9 156 28 L175 17 L159 43 Q85 22 21 62Z" fill="#30213d"/>
      <path d="M35 78 Q101 99 153 52" fill="none" stroke="#94324b" stroke-width="5"/>
      <ellipse cx="78" cy="43" rx="7" ry="10" fill="#ffffff"/>
      <circle cx="105" cy="67" r="4" fill="#ffffff"/>
      <path d="M29 25 Q86 -1 147 12 L129 18 Q76 9 38 33Z" fill="#c53350"/>
    </svg>`,
    { size: 512 },
  );

  const foreheadTex = svg(
    `<svg viewBox="0 0 100 160">
      <path d="M50 5 L77 45 L63 70 L82 90 L50 153 L18 90 L37 70 L23 45Z" fill="#af294a"/>
      <path d="M50 19 L64 45 L50 68 L36 45Z" fill="#ffe0a0"/>
      <path d="M50 80 L65 95 L50 127 L35 95Z" fill="#f06466"/>
      <path d="M50 88 L56 97 L50 111 L44 97Z" fill="#fff5ce"/>
      <path d="M13 57 L27 72 L18 86 L4 71Z M87 57 L73 72 L82 86 L96 71Z" fill="#cc3c54"/>
    </svg>`,
    { size: 256 },
  );

  const cheekTex = svg(
    `<svg viewBox="0 0 150 100">
      <path d="M10 17 Q66 28 144 4 Q110 40 36 42Z" fill="#c33151"/>
      <path d="M21 50 Q77 61 136 40 Q111 77 48 74Z" fill="#d7475d"/>
      <path d="M48 81 L107 70 L86 98Z" fill="#e8656e"/>
    </svg>`,
    { size: 256 },
  );

  const tailTex = svg(
    `<svg viewBox="0 0 100 180">
      <path d="M50 6 Q87 49 77 85 Q70 116 50 170 Q30 116 23 85 Q13 49 50 6Z"
        fill="none" stroke="#9b613d" stroke-width="9"/>
      <path d="M50 6 Q87 49 77 85 Q70 116 50 170 Q30 116 23 85 Q13 49 50 6Z"
        fill="none" stroke="#ffdf94" stroke-width="5"/>
      <path d="M50 28 L65 63 L50 103 L35 63Z" fill="#cb3754"/>
      <path d="M50 43 L56 63 L50 81 L44 63Z" fill="#fff1bd"/>
      <path d="M29 108 L50 128 L71 108 M37 133 L50 145 L63 133"
        fill="none" stroke="#dca755" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="50" cy="156" r="4" fill="#c94059"/>
    </svg>`,
    { size: 256 },
  );

  const ribbonTex = svg(
    `<svg viewBox="0 0 100 250">
      <path d="M10 0 V250 M90 0 V250" fill="none" stroke="#ffdc95" stroke-width="4"/>
      <g fill="none" stroke="#ffd38c" stroke-width="4">
        <path d="M50 18 L72 48 L50 78 L28 48Z M50 94 L72 124 L50 154 L28 124Z M50 170 L72 200 L50 230 L28 200Z"/>
        <path d="M50 29 V67 M39 48 H61 M50 105 V143 M39 124 H61 M50 181 V219 M39 200 H61"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const paperTex = svg(
    `<svg viewBox="0 0 80 180">
      <path d="M3 3 H77 V177 H3Z" fill="#fff0cc" stroke="#c49256" stroke-width="5"/>
      <path d="M14 12 H66 V168 H14Z" fill="none" stroke="#b83a4d" stroke-width="3"/>
      <circle cx="40" cy="35" r="13" fill="none" stroke="#b83a4d" stroke-width="4"/>
      <g fill="none" stroke="#8f3046" stroke-width="5" stroke-linecap="square">
        <path d="M40 23 V47 M29 35 H51 M25 67 H56 M40 56 V89 M25 79 L55 64"/>
        <path d="M24 102 H56 M31 93 V121 M49 94 V122 M23 117 H58"/>
        <path d="M40 131 V154 M25 138 L40 131 L56 141 M27 154 H53"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  let sealMarks = "";
  for (let i = 0; i < 18; i++) {
    const a = (i * Math.PI * 2) / 18;
    const x = 256 + Math.sin(a) * 213;
    const y = 256 + Math.cos(a) * 213;
    sealMarks += `<g transform="translate(${x} ${y}) rotate(${-i * 20})">
      <path d="M0 -10 L7 0 L0 10 L-7 0Z M-10 -13 H10 M0 -17 V17"
        fill="none" stroke="#97d9ce" stroke-width="2.5"/></g>`;
  }
  const sealTex = svg(
    `<svg viewBox="0 0 512 512">
      <g fill="none" stroke="#85bfb9">
        <circle cx="256" cy="256" r="246" stroke-width="3"/>
        <circle cx="256" cy="256" r="234" stroke-width="2"/>
        <circle cx="256" cy="256" r="191" stroke-width="3"/>
        <circle cx="256" cy="256" r="184" stroke-width="1.5"/>
        <path d="M256 86 L403 341 L109 341Z M256 426 L109 171 L403 171Z"
          stroke-width="2.5"/>
        <circle cx="256" cy="256" r="92" stroke-width="3"/>
      </g>
      ${sealMarks}
      <path d="M256 195 L287 256 L256 317 L225 256Z" fill="none" stroke="#d5d4ae" stroke-width="5"/>
    </svg>`,
    { size: 1024 },
  );

  const leafTex = svg(
    `<svg viewBox="0 0 80 110">
      <path d="M40 108 Q6 71 10 40 Q15 13 65 3 Q84 51 58 86Z" fill="#ce6688"/>
      <path d="M40 99 Q36 51 62 12 M39 67 L19 45 M43 52 L65 40"
        fill="none" stroke="#f5b7be" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  // Skeleton first: four planted legs, separate mouth and ears, nine independent tails.
  const root = b.joint("hips", {
    at: [0, 0.65, -0.3],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.65, -0.3], [0, 0.69, -0.04], [0, 0.72, 0.22]],
    { parent: root, names: ["spine1", "chest", "withers"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [[0, 0.72, 0.22], [0, 0.88, 0.37], [0, 1.045, 0.54]],
    { parent: spine.tip!, names: ["neck1", "neck2", "headBase"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.045, 0.54],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.925, 0.64],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const earBones = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.205, 1.215, 0.505],
      dir: [s * 0.25, 1, 0],
      role: "hinge",
    }),
  );

  const legs = [1, -1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    return [true, false].map((front) => {
      const tag = `${front ? "F" : "H"}${side}`;
      const points = front
        ? [
            [s * 0.18, 0.70, 0.23],
            [s * 0.22, 0.43, 0.29],
            [s * 0.235, 0.215, 0.38],
          ]
        : [
            [s * 0.19, 0.64, -0.31],
            [s * 0.29, 0.44, -0.15],
            [s * 0.30, 0.285, -0.39],
            [s * 0.30, 0.205, -0.35],
          ];
      const chain = b.chain(`leg${tag}`, points, {
        parent: front ? spine.joints[1] : root,
        names: front
          ? [`shoulder${tag}`, `elbow${tag}`, `paw${tag}`]
          : [`hip${tag}`, `knee${tag}`, `hock${tag}`, `paw${tag}`],
        role: "leg",
        contact: [s * (front ? 0.235 : 0.30), 0.12, front ? 0.44 : -0.29],
      });
      const p = points[points.length - 1];
      const digits = [-1, 0, 1].map((d) =>
        b.chain(
          `toe${tag}${d + 2}`,
          [
            [p[0] + d * 0.054, 0.169, p[2] + 0.055],
            [p[0] + d * 0.060, 0.158, p[2] + 0.141],
          ],
          { parent: chain.tip!, count: 1, role: "digit" },
        ),
      );
      return { s, tag, front, points, chain, digits };
    });
  });

  const tailEnds = [
    [-1.43, 1.02, -0.68],
    [-1.30, 1.43, -0.81],
    [-1.00, 1.80, -0.94],
    [-0.55, 2.04, -1.04],
    [0, 2.15, -1.09],
    [0.55, 2.04, -1.04],
    [1.00, 1.80, -0.94],
    [1.30, 1.43, -0.81],
    [1.43, 1.02, -0.68],
  ];
  const tails = tailEnds.map((end, i) => {
    const x = end[0];
    const y = end[1];
    const z = end[2];
    const baseX = (i - 4) * 0.043;
    const path = catmull([
      [baseX, 0.65 + (4 - Math.abs(i - 4)) * 0.012, -0.44],
      [x * 0.26, 0.66 + (y - 0.65) * 0.12, -0.73],
      [x * 0.63, 0.65 + (y - 0.65) * 0.50, z - 0.12],
      [x * 0.93, y - 0.20, z - 0.04],
      end,
    ]);
    const chain = b.chain(`tail${i + 1}`, path, {
      parent: root,
      count: 4,
      role: "tail",
      names: (j) => `tail${i + 1}_${j + 1}`,
    });
    return { chain, end, i };
  });

  function ellipsoid(
    at: PointInput,
    scale: number[],
    color: Fill,
    bone: Joint,
    name: string,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at, scale, bone, name, flat: true,
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
      at, bone, name, rotation,
    });
  }

  function jewel(at: PointInput, radius: number, bone: Joint, name: string) {
    const part = b.part(new THREE.OctahedronGeometry(radius), C.teal, {
      at, bone, name, scale: [0.8, 1.25, 0.5],
    });
    glow(part, 0.65);
    return part;
  }

  function flame(at: number[], size: number, bone: Joint, name: string) {
    const shape: OutlinePoint[] = [
      [-0.02, 0],
      [-0.085, 0.055],
      [-0.10, 0.13],
      [-0.067, 0.205],
      [-0.01, 0.27],
      [0.012, 0.36, "sharp"],
      [0.057, 0.275],
      [0.045, 0.19],
      [0.092, 0.235, "sharp"],
      [0.105, 0.135],
      [0.073, 0.045],
      [0.025, 0],
    ];
    const scaled = (k: number): OutlinePoint[] =>
      shape.map(([x, y, sharp]) =>
        sharp ? [x * size * k, y * size * k, sharp] : [x * size * k, y * size * k],
      );
    glow(b.extrude(scaled(1), {
      at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.065 * size,
      smoothing: 1, color: C.blue, bone, name: `${name}_outer`,
    }), 0.65);
    glow(b.extrude(scaled(0.72), {
      at: [at[0] - 0.007 * size, at[1] + 0.008 * size, at[2] + 0.039 * size],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.026 * size,
      smoothing: 1, color: C.flame, bone, name: `${name}_inner`,
    }), 1.1);
    glow(b.extrude(
      [[-0.032 * size, 0], [-0.043 * size, 0.068 * size],
       [0.008 * size, 0.19 * size, "sharp"], [0.036 * size, 0.078 * size],
       [0.022 * size, 0]],
      {
        at: [at[0], at[1] + 0.012 * size, at[2] + 0.058 * size],
        x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016 * size,
        smoothing: 1, color: C.heart, bone, name: `${name}_heart`,
      },
    ), 1.4);
    // A perpendicular tongue gives the spirit fire volume from side views.
    glow(b.extrude(scaled(0.62), {
      at: [at[0], at[1], at[2] - 0.009 * size],
      x: [0, 0, 1], y: [0, 1, 0], thickness: 0.025 * size,
      smoothing: 1, color: C.teal, bone, name: `${name}_cross`,
    }), 0.8);
    glow(ellipsoid(
      [at[0] - 0.035 * size, at[1] + 0.405 * size, at[2]],
      [0.015 * size, 0.031 * size, 0.013 * size],
      C.flame, bone, `${name}_ember`, 6,
    ), 1);
  }

  // The sanctuary is shallow, so the fox's feet remain clearly planted.
  b.part(new THREE.CylinderGeometry(1.17, 1.22, 0.12, 12), rock, {
    at: [0, 0.06, -0.10], scale: [1.18, 1, 1], bone: root, name: "sanctuary_plinth",
  });
  b.part(new THREE.CylinderGeometry(1.155, 1.165, 0.022, 12), C.stoneTop, {
    at: [0, 0.109, -0.10], scale: [1.18, 1, 1], bone: root, name: "stone_lip",
  });
  glow(b.part(new THREE.CircleGeometry(1.08, 64), "#ffffff", {
    at: [0, 0.122, -0.10], dir: [0, 1, 0], axis: "z",
    texture: sealTex, bone: root, name: "sanctuary_seal",
  }), 0.3);

  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const p = [Math.sin(a) * 1.37, 0.067, -0.10 + Math.cos(a) * 1.16];
    b.part(new THREE.OctahedronGeometry(0.028), C.gold, {
      at: p, scale: [1, 0.65, 0.65], bone: root, name: `plinth_inlay${i}`,
    });
  }

  // Broad, simple volumes carry the silhouette.
  b.sweep(spine, (t) => [0.245 - 0.035 * t, 0.275 - 0.045 * t], {
    color: fur, sides: 10, caps: "round", name: "fox_body",
  });
  const neckTube = b.sweep(neck, [0.21, 0.17], {
    color: paleFur, sides: 10, name: "raised_neck",
  });
  ellipsoid([0, 0.65, -0.28], [0.27, 0.25, 0.28], fur, root, "haunches");
  ellipsoid([0, 0.64, 0.20], [0.205, 0.245, 0.21], paleFur, spine.joints[1], "chest_bib");

  // Settle the face before adding its ceremonial decoration.
  const H = 1.08;
  const hc = [0, 1.045, 0.55];
  const hp = (x: number, y: number, z: number) => [
    hc[0] + H * x, hc[1] + H * y, hc[2] + H * z,
  ];
  const skull = ellipsoid(hp(0, 0.012, 0), [0.285 * H, 0.235 * H, 0.26 * H], fur, head, "skull", 16);
  const skullSurface = b.surface(skull);

  for (const s of [1, -1]) {
    b.decal(skullSurface, eyeTex, {
      at: hp(s * 0.142, 0.056, 0.235),
      dir: [s * 0.19, 0.04, 1],
      size: [0.212 * H, 0.129 * H],
      mirror: s < 0,
      bone: head,
      lift: 0.0025,
      name: s > 0 ? "eyeL" : "eyeR",
    });
  }

  // Separate upper muzzle and lower jaw leave a fine, readable mouth seam.
  ellipsoid(hp(0, -0.095, 0.218), [0.167 * H, 0.083 * H, 0.16 * H],
    paleFur, head, "upper_muzzle");
  ellipsoid(hp(0, -0.148, 0.227), [0.139 * H, 0.027 * H, 0.143 * H],
    C.plum, jaw, "mouth_seam");
  ellipsoid(hp(0, -0.169, 0.221), [0.133 * H, 0.039 * H, 0.139 * H],
    paleFur, jaw, "lower_jaw");
  ellipsoid(hp(0, -0.093, 0.367), [0.063 * H, 0.038 * H, 0.038 * H],
    C.ink, head, "fox_nose", 8);
  ellipsoid(hp(-0.015, -0.078, 0.397), [0.019, 0.008, 0.004],
    "#bb9fae", head, "nose_glint", 6);

  for (const s of [1, -1]) {
    b.sweep(
      bezier(hp(s * 0.012, -0.124, 0.365), hp(s * 0.067, -0.15, 0.345), hp(s * 0.125, -0.128, 0.30)),
      [0.004, 0.0025],
      { color: C.plum, bone: head, sides: 5, name: `smile${s > 0 ? "L" : "R"}` },
    );
    // Chunky sculpted cheek fur, with wide roots buried in the head.
    for (let i = 0; i < 3; i++) {
      const x = s * (0.185 + i * 0.012);
      const y = -0.065 - i * 0.053;
      b.extrude(
        [[-0.065, 0.046], [0.035, 0.082], [0.17 - i * 0.015, 0.028, "sharp"],
         [0.097, -0.011], [0.128 - i * 0.012, -0.055, "sharp"], [-0.04, -0.047]],
        {
          at: hp(x, y, 0.075 - i * 0.012),
          x: [s, 0, 0], y: [0, 1, 0], thickness: 0.103 - i * 0.015,
          bevel: 0.012, color: i === 0 ? fur : paleFur, bone: head,
          name: `cheek_ruff_${s}_${i}`,
        },
      );
    }
    b.decal(skullSurface, cheekTex, {
      at: hp(s * 0.223, -0.073, 0.155),
      dir: [s * 0.48, -0.05, 1],
      size: [0.13, 0.09],
      mirror: s < 0,
      lift: 0.003,
      bone: head,
      name: `cheek_marks_${s}`,
    });
  }

  b.decal(skullSurface, foreheadTex, {
    at: hp(0, 0.127, 0.225),
    dir: [0, 0.32, 1],
    size: [0.092, 0.148],
    lift: 0.003,
    bone: head,
    name: "forehead_sun_mark",
  });

  // Tall fox ears: ivory shell, dark lining, rose inset, and a small gilded tip.
  [1, -1].forEach((s, i) => {
    const bone = earBones[i];
    const at = [s * 0.205, 1.215, 0.505];
    b.extrude(
      [[-0.115, -0.015], [0.10, -0.02], [0.155, 0.382, "sharp"], [-0.035, 0.232]],
      {
        at, x: [s, 0, 0], y: [0, 1, 0],
        thickness: [0.13, 0.034], bevel: 0.012,
        color: fur, bone, name: `ear_shell_${s}`,
      },
    );
    b.extrude(
      [[-0.073, 0.018], [0.073, 0.012], [0.13, 0.323, "sharp"], [-0.014, 0.193]],
      {
        at: [at[0], at[1], at[2] + 0.064],
        x: [s, 0, 0], y: [0, 1, 0], thickness: 0.014,
        color: C.plum, bone, name: `ear_lining_${s}`,
      },
    );
    b.extrude(
      [[-0.041, 0.046], [0.054, 0.037], [0.105, 0.264, "sharp"], [0.003, 0.165]],
      {
        at: [at[0], at[1], at[2] + 0.075],
        x: [s, 0, 0], y: [0, 1, 0], thickness: 0.008,
        color: C.red, bone, name: `ear_rose_${s}`,
      },
    );
    b.extrude(
      [[0.086, 0.278], [0.155, 0.382, "sharp"], [0.142, 0.273]],
      {
        at: [at[0], at[1], at[2] + 0.019],
        x: [s, 0, 0], y: [0, 1, 0], thickness: 0.046,
        color: gold, bone, name: `ear_gold_tip_${s}`,
      },
    );
    for (let j = 0; j < 2; j++) {
      b.spike(
        [at[0] + s * (-0.035 + j * 0.048), at[1] + 0.018, at[2] + 0.092],
        [s * 0.15, 1, 0.05],
        0.09 + j * 0.014, 0.026,
        { color: paleFur, bone, sides: 5, name: `ear_tuft_${s}_${j}` },
      );
    }
  });

  // A fine crest is seated on the forehead, above rather than across the eyes.
  const crownLine = bezier(hp(-0.18, 0.152, 0.16), hp(0, 0.225, 0.155), hp(0.18, 0.152, 0.16));
  b.sweep(crownLine, 0.009, { color: gold, bone: head, sides: 6, name: "diadem_band" });
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.049;
    b.part(new THREE.OctahedronGeometry(i === 0 ? 0.038 : 0.022), gold, {
      at: hp(x, 0.211 - Math.abs(i) * 0.013, 0.162),
      scale: [0.7, 1.4, 0.35], bone: head, name: `crown_leaf${i + 2}`,
    });
  }
  jewel(hp(0, 0.221, 0.18), 0.023, head, "diadem_spirit_stone");

  // Legs, ankle markings, separated toes and delicate claw tips.
  for (const leg of legs) {
    const { chain, front, points, digits, tag } = leg;
    b.sweep(chain, front ? [0.112, 0.073, 0.055] : [0.15, 0.105, 0.055, 0.052], {
      color: fur, sides: 8, name: `fur_leg${tag}`,
    });
    const p = points[points.length - 1];
    const foot = chain.tip!;
    ellipsoid([p[0], 0.179, p[2] + 0.045], [0.112, 0.059, 0.133],
      paleFur, foot, `paw_pad${tag}`);
    for (let d = 0; d < digits.length; d++) {
      const digit = digits[d];
      b.sweep(digit, [0.036, 0.031], {
        color: paleFur, sides: 6, name: `toe_fur${tag}_${d}`,
      });
      const t = digit.at(1).at;
      b.spike([t.x, t.y + 0.004, t.z + 0.006], [0, -0.10, 1], 0.025, 0.012, {
        color: C.goldLight, bone: digit.joints[0], sides: 5, name: `claw${tag}_${d}`,
      });
    }
    const ankle = chain.at(front ? 0.80 : 0.91);
    b.sweep(
      catmull(b.ring(ankle, { count: 10, radius: front ? 0.067 : 0.060 }).items, { closed: true }),
      0.008,
      { color: C.red, bone: ankle.bone!, sides: 5, name: `ankle_red_band${tag}` },
    );
    b.extrude(
      [[-0.033, 0], [0.033, 0], [0.046, 0.092], [0, 0.133, "sharp"], [-0.046, 0.092]],
      {
        at: [p[0], 0.246, p[2] + 0.057],
        x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012,
        color: C.red, bone: chain.joints[chain.joints.length - 2],
        name: `ankle_flame_mark${tag}`,
      },
    );
    jewel([p[0], 0.306, p[2] + 0.069], 0.018, chain.joints[chain.joints.length - 2], `ankle_gem${tag}`);
  }

  // A collar follows the actual neck surface.
  const collarPlane = frame([0, 0.839, 0.326], [0, 0.77, 0.64]);
  const collarLoop = b.surface(neckTube).loop(collarPlane, { lift: 0.009 });
  b.sweep(collarLoop, 0.026, { color: silk, bone: neck.joints[0], sides: 8, name: "vermilion_collar" });
  b.along(collarLoop, 12, (at) => {
    b.part(new THREE.OctahedronGeometry(0.018), gold, {
      at, bone: neck.joints[0], name: "collar_gold_stitch",
    });
  });

  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 0.145, 0.86, 0.47], [s * 0.12, 0.75, 0.57], [0, 0.744, 0.585]),
      0.012,
      { color: gold, bone: neck.joints[0], sides: 6, name: `bell_chain${s}` },
    );
    const sash = b.extrude(
      [[-0.046, 0.025], [0.047, 0.025], [0.071, -0.21],
       [0.025, -0.267, "sharp"], [-0.026, -0.229], [-0.060, -0.26, "sharp"]],
      {
        at: [s * 0.21, 0.82, 0.39],
        x: [s, 0, 0], y: [-s * 0.22, 1, 0.06],
        thickness: 0.02, color: silk, bone: neck.joints[0], name: `collar_sash${s}`,
      },
    );
    b.decal(sash, ribbonTex, {
      at: [s * 0.236, 0.70, 0.412],
      dir: [0, 0, 1], size: [0.084, 0.22],
      bone: neck.joints[0], lift: 0.002, name: `sash_brocade${s}`,
    });
    for (let j = 0; j < 4; j++) {
      const x = s * (0.235 + j * 0.019);
      b.rod([x, 0.568, 0.39], [x + s * 0.008, 0.512 - (j % 2) * 0.012, 0.391],
        0.005, { color: C.gold, bone: neck.joints[0], sides: 5, name: `sash_fringe${s}_${j}` });
    }
  }
  b.part(new THREE.TorusGeometry(0.034, 0.008, 6, 12), gold, {
    at: [0, 0.745, 0.591], bone: neck.joints[0], name: "bell_hanger",
  });
  ellipsoid([0, 0.681, 0.595], [0.073, 0.068, 0.060], gold, neck.joints[0], "shrine_bell");
  b.sweep(
    [[-0.045, 0.665, 0.643], [0, 0.643, 0.654], [0.045, 0.665, 0.643]],
    0.005,
    { color: C.goldDark, bone: neck.joints[0], sides: 5, name: "bell_slit" },
  );
  jewel([0, 0.704, 0.651], 0.026, neck.joints[0], "bell_jewel");

  // Nine generously separated tails form a ceremonial fan behind the fox.
  const tailRadius = (t: number) => {
    if (t < 0.18) return 0.061 + t * 0.33;
    if (t < 0.49) return 0.12 + (t - 0.18) * 0.11;
    if (t < 0.72) return 0.154 - (t - 0.49) * 0.10;
    return Math.max(0.009, 0.131 * Math.pow((1 - t) / 0.28, 0.82));
  };

  for (const tail of tails) {
    const { chain, end, i } = tail;
    const tailPaint = paint((p, n, uv) => {
      const t = uv[0];
      const tooth = Math.abs(((uv[1] / 60) % 1 + 1) % 1 - 0.5) * 2;
      if (t > 0.83 + tooth * 0.045 && t < 0.97) {
        return mix("#9c3556", "#ed6875", 0.50 + n.y * 0.25 + n.z * 0.16);
      }
      return fur.at(p, n);
    });
    const tube = b.sweep(chain, tailRadius, {
      color: tailPaint,
      sides: 10,
      caps: { start: "round", end: "point" },
      name: `tail_${i + 1}_fur`,
    });
    const surface = b.surface(tube);

    for (const t of [0.715, 0.755]) {
      const loop = surface.loop(chain.at(t), { lift: 0.005 });
      b.sweep(loop, 0.007, {
        color: gold, bone: chain.at(t).bone!, sides: 5, name: `tail_${i + 1}_gold_ring`,
      });
    }

    const markAt = chain.at(0.58).at;
    const tangent = chain.at(0.58).tangent;
    b.decal(tube, tailTex, {
      at: [markAt.x, markAt.y, markAt.z + 0.20],
      dir: [0, 0, 1],
      size: [0.133, 0.236],
      roll: -Math.atan2(tangent.x, tangent.y) * 180 / Math.PI,
      lift: 0.003,
      name: `tail_${i + 1}_sacred_mark`,
    });

    // Broad fur points echo the flow, instead of a coat of tiny needles.
    for (const side of [-1, 1]) {
      const p = chain.at(0.80).at;
      const t = chain.at(0.80).tangent;
      const sideDir = new THREE.Vector3(t.y, -t.x, 0).normalize().multiplyScalar(side);
      const target = p.clone().addScaledVector(sideDir, 0.16);
      const hit = surface.nearest(target);
      const tip = hit.at.clone().addScaledVector(t, 0.13).addScaledVector(sideDir, 0.045);
      b.sweep(bezier(hit, hit.at.clone().addScaledVector(sideDir, 0.075), tip), [0.045, 0], {
        color: paleFur,
        bone: hit.bone!,
        sides: 5,
        caps: "point",
        name: `tail_${i + 1}_silhouette_tuft`,
      });
    }

    const ringCenter = chain.at(0.755).at;
    const frontHit = surface.nearest([ringCenter.x, ringCenter.y, ringCenter.z + 0.3]);
    const charmAt = frontHit.at;
    jewel([charmAt.x, charmAt.y - 0.025, charmAt.z + 0.014], 0.026,
      chain.at(0.755).bone!, `tail_${i + 1}_charm`);
    flame([end[0], end[1] + 0.022, end[2]], i === 4 ? 0.94 : 0.76, chain.joints[3], `spirit_fire_${i + 1}`);
  }

  // Small shrine braziers flank the fox without crossing its face or feet.
  for (const s of [1, -1]) {
    const x = s * 0.86;
    const z = -0.31;
    box([x, 0.16, z], [0.27, 0.08, 0.27], rock, root, `brazier_base${s}`);
    box([x, 0.222, z], [0.19, 0.06, 0.19], C.stoneTop, root, `brazier_step${s}`);
    b.part(new THREE.CylinderGeometry(0.071, 0.095, 0.165, 6), rock, {
      at: [x, 0.323, z], bone: root, name: `brazier_stem${s}`,
    });
    b.lathe(
      [[0, 0], [0.07, 0], [0.145, 0.054], [0.153, 0.073],
       [0.123, 0.083], [0.071, 0.038], [0, 0.038]],
      { at: [x, 0.40, z], segments: 8, color: gold, bone: root, name: `brazier_bowl${s}` },
    );
    flame([x, 0.444, z], 0.65, root, `altar_fire${s}`);
    box([x, 0.316, z + 0.075], [0.078, 0.143, 0.012], C.goldDark, root, `brazier_plaque${s}`);
    b.part(new THREE.PlaneGeometry(0.062, 0.133), "#ffffff", {
      at: [x, 0.316, z + 0.083], texture: paperTex, bone: root, name: `brazier_talisman${s}`,
    });
  }

  // Deliberate, low scenery: fractured stones and windblown spirit petals.
  for (let i = 0; i < 16; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.92 + random() * 0.18;
    const x = Math.sin(a) * r * 1.13;
    const z = -0.10 + Math.cos(a) * r;
    const h = 0.022 + random() * 0.045;
    b.part(new THREE.DodecahedronGeometry(1, 0), i % 3 === 0 ? C.moss : rock, {
      at: [x, 0.122 + h * 0.43, z],
      scale: [0.045 + random() * 0.055, h, 0.035 + random() * 0.045],
      rotation: [0, random() * 180, 0],
      bone: root, name: `loose_stone${i}`, flat: true,
    });
  }

  const petals = [];
  for (let i = 0; i < 21; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.70 + random() * 0.38;
    petals.push(frame(
      [Math.sin(a) * r * 1.10, 0.126, -0.10 + Math.cos(a) * r],
      [0, 1, 0],
    ));
  }
  b.cards(petals, leafTex, {
    size: [0.047, 0.072], lean: 90, flow: [0.7, 0, 0.3],
    vary: 0.35, spin: 180, rng: random, mirror: true,
    bone: root, name: "fallen_spirit_petals",
  });

  return b.root;
}
```