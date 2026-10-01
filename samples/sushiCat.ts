// Sushi Cat: a plump orange-and-white cat curled on a rice block like a salmon nigiri, wrapped in a nori band,
// on a little wooden serving board with a wasabi dab and a pickled-ginger rose.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Sushi Cat",
  description:
    "A plump orange-and-white cat curled on a rice block like a salmon nigiri, wrapped by a nori band, on a wooden serving board with a wasabi dab and a pickled-ginger rose.",
};

// Candy palette: every colour is flat.
const ORANGE = "#ffa24a";
const ORANGE_DK = "#f07f2a";
const CREAM = "#fff4e2";
const PINK = "#ff9db4";
const PINK_DK = "#ff7f9f";
const BROWN = "#5c2f2a";
const RICE = "#ffffff";
const NORI = "#2d4a42";
const WOOD = "#f3c995";
const WOOD_DK = "#dca467";
const WASABI = ["#8fd14f", "#a9e266", "#c6f28a"];
const GINGER = ["#ffb6c9", "#ff9fb8", "#ff88a8"];

// ---- Drawings (flat fills, no gradients) ----------------------------------------------------------------------

const FACE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 180">
    <path d="M150 34 L190 34 L184 92 Q170 112 156 92 Z" fill="${CREAM}"/>
    <ellipse cx="82" cy="138" rx="74" ry="40" fill="${CREAM}"/>
    <ellipse cx="258" cy="138" rx="74" ry="40" fill="${CREAM}"/>
    <path d="M170 4 L170 36" stroke="${ORANGE_DK}" stroke-width="12" stroke-linecap="round"/>
    <path d="M140 10 L148 36" stroke="${ORANGE_DK}" stroke-width="11" stroke-linecap="round"/>
    <path d="M200 10 L192 36" stroke="${ORANGE_DK}" stroke-width="11" stroke-linecap="round"/>
    <path d="M14 74 L44 82 M10 96 L42 98" stroke="${ORANGE_DK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M326 74 L296 82 M330 96 L298 98" stroke="${ORANGE_DK}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="62" cy="128" rx="30" ry="17" fill="${PINK}"/>
    <ellipse cx="278" cy="128" rx="30" ry="17" fill="${PINK}"/>
    <path d="M48 122 L56 134 M62 120 L70 132 M76 122 L84 134" stroke="${PINK_DK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M292 122 L284 134 M278 120 L270 132 M264 122 L256 134" stroke="${PINK_DK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M52 80 Q88 116 124 80" fill="none" stroke="${BROWN}" stroke-width="11" stroke-linecap="round"/>
    <path d="M216 80 Q252 116 288 80" fill="none" stroke="${BROWN}" stroke-width="11" stroke-linecap="round"/>
    <path d="M52 80 L38 70 M124 80 L132 68" stroke="${BROWN}" stroke-width="8" stroke-linecap="round"/>
    <path d="M288 80 L302 70 M216 80 L208 68" stroke="${BROWN}" stroke-width="8" stroke-linecap="round"/>
  </svg>`,
  { size: 1024 },
);

const MOUTH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
    <path d="M50 4 L50 22" stroke="${BROWN}" stroke-width="5" stroke-linecap="round"/>
    <path d="M50 22 Q38 40 22 24 M50 22 Q62 40 78 24" fill="none" stroke="${BROWN}" stroke-width="5.5" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);

// Fat lines across a salmon fillet: pale tapered bands that follow the back.
const SALMON = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <path d="M6 22 Q100 6 194 22 Q100 24 6 22 Z" fill="#ffe2bf"/>
    <path d="M14 58 Q100 40 186 58 Q100 62 14 58 Z" fill="#ffe2bf"/>
    <path d="M4 96 Q100 76 196 96 Q100 102 4 96 Z" fill="#ffe2bf"/>
    <path d="M14 134 Q100 114 186 134 Q100 140 14 134 Z" fill="#ffe2bf"/>
    <path d="M26 170 Q100 154 174 170 Q100 172 26 170 Z" fill="#ffe2bf"/>
    <path d="M60 40 Q100 34 140 40" fill="none" stroke="${ORANGE_DK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M40 78 Q100 70 160 78" fill="none" stroke="${ORANGE_DK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M62 116 Q100 108 138 116" fill="none" stroke="${ORANGE_DK}" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);

const TOES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
    <path d="M22 4 L22 24 M38 4 L38 24" stroke="#e6c7a8" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const TUFT_CREAM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">
    <path d="M2 64 L14 10 L22 44 L26 0 L34 44 L46 14 L46 64 Z" fill="${CREAM}"/>
  </svg>`,
  { size: 128 },
);

const TUFT_ORANGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">
    <path d="M2 64 L8 20 L20 46 L24 0 L32 44 L44 22 L46 64 Z" fill="${ORANGE}"/>
    <path d="M24 64 L24 30" stroke="${ORANGE_DK}" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const SPARKLE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M24 2 L29 19 L46 24 L29 29 L24 46 L19 29 L2 24 L19 19 Z" fill="#fff3a0"/>
    <path d="M24 12 L26 22 L36 24 L26 26 L24 36 L22 26 L12 24 L22 22 Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const ZZZ = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <path d="M8 60 L34 60 L8 90 L34 90" fill="none" stroke="#9b8cff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M50 14 L70 14 L50 38 L70 38" fill="none" stroke="#b7aaff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M78 2 L90 2 L78 16 L90 16" fill="none" stroke="#cfc6ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const GRAIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
    <ellipse cx="18" cy="14" rx="13" ry="6" transform="rotate(-20 18 14)" fill="#ffffff" stroke="#dccda8" stroke-width="3"/>
    <ellipse cx="44" cy="22" rx="13" ry="6" transform="rotate(25 44 22)" fill="#ffffff" stroke="#dccda8" stroke-width="3"/>
    <ellipse cx="22" cy="36" rx="13" ry="6" transform="rotate(8 22 36)" fill="#ffffff" stroke="#dccda8" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const WOOD_GRAIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 550">
    <path d="M60 0 Q76 140 56 280 Q44 420 66 550" fill="none" stroke="${WOOD_DK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M150 0 Q132 160 160 300 Q172 430 146 550" fill="none" stroke="${WOOD_DK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M250 0 Q266 120 244 250 Q232 400 258 550" fill="none" stroke="${WOOD_DK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M350 0 Q334 180 360 310 Q372 440 348 550" fill="none" stroke="${WOOD_DK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M450 0 Q468 150 444 290 Q430 420 456 550" fill="none" stroke="${WOOD_DK}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="400" cy="120" rx="16" ry="30" fill="none" stroke="${WOOD_DK}" stroke-width="5"/>
    <ellipse cx="110" cy="420" rx="14" ry="26" fill="none" stroke="${WOOD_DK}" stroke-width="5"/>
  </svg>`,
  { size: 1024 },
);

const LEAF = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32 62 L32 36 M32 36 Q6 34 6 12 Q30 8 32 36 Q34 8 58 12 Q58 34 32 36" fill="#7fc441"/>
    <path d="M32 60 L32 14" stroke="#a9e266" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---- Build ---------------------------------------------------------------------------------------------------

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "sushiCat" });
  const rand = rng(7);

  const BOARD_TOP = 0.034;
  const RICE_BOT = 0.04;
  const RICE_TOP = 0.125;
  const BODY_Y = RICE_TOP + 0.056;
  const HEAD: [number, number, number] = [0, BODY_Y + 0.016, 0.135];

  // ---- Skeleton
  const base = b.joint("base", { at: [0, BOARD_TOP, 0.02] });
  const hips = b.joint("hips", { parent: base, at: [0, BODY_Y, -0.07], dir: [0, 0.03, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, BODY_Y, -0.07],
      [0, BODY_Y + 0.003, -0.02],
      [0, BODY_Y + 0.005, 0.03],
      [0, BODY_Y + 0.007, 0.075],
    ]),
    { parent: hips, role: "spine", count: 3 },
  );
  const neck = b.joint("neck", {
    parent: spine.joints[spine.joints.length - 1],
    at: [0, BODY_Y + 0.008, 0.075],
    aim: HEAD,
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, HEAD[1] - 0.004, 0.11], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HEAD[1] - 0.04, HEAD[2] + 0.03],
    aim: [0, HEAD[1] - 0.05, HEAD[2] + 0.09],
    role: "jaw",
  });

  // ---- Board and rice
  // Rectangle with chamfered round corners (three facets per corner)
  const outline = (hx: number, z0: number, z1: number, r = 0.012): Array<[number, number]> => {
    const pts: Array<[number, number]> = [];
    const corners: Array<[number, number, number]> = [
      [hx - r, z1 - r, 0],
      [-hx + r, z1 - r, 90],
      [-hx + r, z0 + r, 180],
      [hx - r, z0 + r, 270],
    ];
    for (const [cx, cz, a0] of corners)
      for (const da of [0, 30, 60, 90]) {
        const a = ((a0 + da) * Math.PI) / 180;
        pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
      }
    return pts;
  };
  const board = b.extrude(outline(0.27, -0.24, 0.37), {
    at: [0, BOARD_TOP - 0.011, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.022,
    bevel: 0.005,
    smoothing: 1,
    detail: 0.6,
    color: WOOD,
    bone: base,
  });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.045, 0.016, 0.42), WOOD_DK, { at: [s * 0.2, 0.004, 0.03], bone: base, flat: true });

  const rice = b.extrude(outline(0.095, -0.14, 0.235), {
    at: [0, (RICE_BOT + RICE_TOP) / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: RICE_TOP - RICE_BOT,
    bevel: 0.014,
    smoothing: 1,
    detail: 0.5,
    color: RICE,
    bone: base,
  });

  // ---- Cat body
  const body = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.95));
      return [0.086 + 0.02 * k, 0.07 + 0.01 * k];
    },
    {
      sides: 8,
      smooth: false,
      color: ORANGE,
      sectors: [[112, 248, CREAM]],
    },
  );

  b.decal(body, SALMON, {
    at: [0, BODY_Y + 0.08, 0.0],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.21, 0.23],
    segments: [10, 10],
    lift: 0.002,
  });

  // ---- Nori band: a faceted strip laid just outside the cat and the rice at one cross-section
  const Z_BAND = 0.02;
  const NORI_HALF_W = 0.03;
  const NORI_HALF_T = 0.0035;
  const lifted = (h: { at: THREE.Vector3; n: THREE.Vector3 }): [number, number] => [
    h.at.x + h.n.x * (NORI_HALF_T + 0.001),
    h.at.y + h.n.y * (NORI_HALF_T + 0.001),
  ];
  const catSkin = b.surface(body);
  const riceSkin = b.surface(rice);
  const rightSide: Array<[number, number]> = [
    ...[90, 66, 42, 18, -6, -28].map((el) => lifted(catSkin.around([0, BODY_Y, Z_BAND]).at(90, el)!)),
    ...[22, 6, -10, -26, -44].map((el) => lifted(riceSkin.around([0, (RICE_BOT + RICE_TOP) / 2, Z_BAND]).at(90, el)!)),
    lifted(riceSkin.around([0, (RICE_BOT + RICE_TOP) / 2, Z_BAND]).at(0, -90)!),
  ];
  rightSide[0][0] = 0;
  rightSide[rightSide.length - 1][0] = 0;
  const loop = [
    ...rightSide,
    ...rightSide
      .slice(1, -1)
      .reverse()
      .map(([x, y]): [number, number] => [-x, y]),
  ];
  const noriPos: number[] = [];
  // Each quad is wound so its face looks along `want`.
  const quad = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, want: THREE.Vector3) => {
    const flip = bb.clone().sub(a).cross(c.clone().sub(a)).dot(want) < 0;
    for (const v of flip ? [a, d, c, a, c, bb] : [a, bb, c, a, c, d]) noriPos.push(v.x, v.y, v.z);
  };
  const edgeNormal = (i: number) => {
    const p = loop[i];
    const q = loop[(i + 1) % loop.length];
    return new THREE.Vector3(-(q[1] - p[1]), q[0] - p[0], 0).normalize();
  };
  loop.forEach(([x, y], i) => {
    const [x2, y2] = loop[(i + 1) % loop.length];
    const n0 = edgeNormal((i + loop.length - 1) % loop.length)
      .add(edgeNormal(i))
      .normalize();
    const n1 = edgeNormal(i)
      .add(edgeNormal((i + 1) % loop.length))
      .normalize();
    const at = (px: number, py: number, n: THREE.Vector3, k: number, z: number) =>
      new THREE.Vector3(px + n.x * NORI_HALF_T * k, py + n.y * NORI_HALF_T * k, z);
    const z0 = Z_BAND - NORI_HALF_W;
    const z1 = Z_BAND + NORI_HALF_W;
    const face = edgeNormal(i);
    quad(at(x, y, n0, 1, z0), at(x2, y2, n1, 1, z0), at(x2, y2, n1, 1, z1), at(x, y, n0, 1, z1), face);
    quad(
      at(x, y, n0, -1, z0),
      at(x2, y2, n1, -1, z0),
      at(x2, y2, n1, -1, z1),
      at(x, y, n0, -1, z1),
      face.clone().negate(),
    );
    quad(
      at(x, y, n0, 1, z1),
      at(x2, y2, n1, 1, z1),
      at(x2, y2, n1, -1, z1),
      at(x, y, n0, -1, z1),
      new THREE.Vector3(0, 0, 1),
    );
    quad(
      at(x, y, n0, 1, z0),
      at(x2, y2, n1, 1, z0),
      at(x2, y2, n1, -1, z0),
      at(x, y, n0, -1, z0),
      new THREE.Vector3(0, 0, -1),
    );
  });
  const noriGeo = new THREE.BufferGeometry();
  noriGeo.setAttribute("position", new THREE.Float32BufferAttribute(noriPos, 3));
  noriGeo.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((noriPos.length / 3) * 2).fill(0), 2));
  b.part(noriGeo, NORI, { bone: base, at: [0, 0, 0], flat: true });

  // ---- Tail: down behind the rice, round the left side, tip curling in
  const tail = b.chain(
    "tail",
    catmull([
      [0, BODY_Y - 0.005, -0.13],
      [0, 0.15, -0.18],
      [0.05, 0.08, -0.205],
      [0.125, 0.064, -0.165],
      [0.158, 0.064, -0.08],
      [0.16, 0.064, 0.0],
      [0.14, 0.07, 0.06],
      [0.108, 0.092, 0.075],
    ]),
    { parent: hips, role: "tail", count: 7 },
  );
  b.sweep(tail, (t) => 0.03 - 0.006 * t, {
    sides: 6,
    smooth: false,
    bands: [
      [0.2, ORANGE],
      [0.32, ORANGE_DK],
      [0.46, ORANGE],
      [0.6, ORANGE_DK],
      [0.78, ORANGE],
      [1, CREAM],
    ],
  });

  // ---- Legs: haunches tucked, forepaws folded under the chin
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hind = b.chain(
      `legH${side}`,
      catmull([
        [s * 0.085, BODY_Y - 0.015, -0.09],
        [s * 0.11, BODY_Y - 0.03, -0.045],
        [s * 0.106, RICE_TOP + 0.015, 0.0],
        [s * 0.098, RICE_TOP + 0.013, 0.055],
      ]),
      { parent: hips, role: "leg", names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`, `footH${side}`] },
    );
    b.sweep(hind, [0.06, 0.05, 0.034, 0.028], {
      sides: 6,
      smooth: false,
      bands: [
        [0.7, ORANGE],
        [1, CREAM],
      ],
    });

    const fore = b.chain(
      `legF${side}`,
      catmull([
        [s * 0.075, BODY_Y - 0.005, 0.06],
        [s * 0.088, RICE_TOP + 0.022, 0.12],
        [s * 0.058, RICE_TOP + 0.016, 0.19],
        [s * 0.05, RICE_TOP + 0.014, 0.225],
      ]),
      {
        parent: spine.joints[spine.joints.length - 1],
        role: "arm",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      },
    );
    const arm = b.sweep(fore, [0.036, 0.031, 0.029, 0.027], {
      sides: 6,
      smooth: false,
      bands: [
        [0.6, ORANGE],
        [1, CREAM],
      ],
    });
    b.decal(arm, TOES, {
      at: [s * 0.05, RICE_TOP + 0.022, 0.26],
      dir: [0, 0.15, 1],
      up: [0, 1, 0],
      size: [0.04, 0.028],
      lift: 0.0015,
    });
  }

  // ---- Head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 7), ORANGE, {
    bone: head,
    at: HEAD,
    scale: [0.088, 0.072, 0.078],
    flat: true,
  });
  const pads = [1, -1].map((s) =>
    b.part(new THREE.SphereGeometry(1, 7, 5), CREAM, {
      bone: head,
      at: [s * 0.028, HEAD[1] - 0.032, HEAD[2] + 0.06],
      scale: [0.03, 0.022, 0.024],
      flat: true,
    }),
  );
  const chin = b.part(new THREE.SphereGeometry(1, 7, 5), CREAM, {
    bone: jaw,
    at: [0, HEAD[1] - 0.052, HEAD[2] + 0.06],
    scale: [0.036, 0.014, 0.03],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), PINK_DK, {
    bone: jaw,
    at: [0, HEAD[1] - 0.046, HEAD[2] + 0.052],
    scale: [0.014, 0.005, 0.017],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 5, 4), PINK_DK, {
    bone: head,
    at: [0, HEAD[1] - 0.012, HEAD[2] + 0.078],
    scale: [0.012, 0.009, 0.008],
    flat: true,
  });
  b.decal([skull, ...pads], FACE, {
    at: [0, HEAD[1] + 0.0, HEAD[2] + 0.07],
    dir: [0, 0, 1],
    size: [0.17, 0.09],
    segments: [16, 9],
    lift: 0.002,
  });
  b.decal([...pads, chin], MOUTH, {
    at: [0, HEAD[1] - 0.036, HEAD[2] + 0.09],
    dir: [0, 0, 1],
    size: [0.05, 0.03],
    segments: [8, 5],
    lift: 0.002,
  });

  // Whiskers
  for (const s of [1, -1])
    [-0.008, 0.008].forEach((dy, i) => {
      b.rod(
        [s * 0.058, HEAD[1] - 0.03 + dy, HEAD[2] + 0.055],
        [s * 0.118, HEAD[1] - 0.04 + dy * 2.4, HEAD[2] + 0.042 - i * 0.006],
        [0.0018, 0.0008],
        { color: CREAM, sides: 3, bone: head },
      );
    });

  // Ears: hinge joints at the base, orange plate with a pink inner plate
  for (const s of [1, -1]) {
    const baseP = new THREE.Vector3(s * 0.052, HEAD[1] + 0.054, HEAD[2] - 0.012);
    const tipP = new THREE.Vector3(s * 0.09, HEAD[1] + 0.126, HEAD[2] - 0.03);
    const ear = b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: baseP.toArray(),
      aim: tipP.toArray(),
      role: "hinge",
    });
    const y = tipP.clone().sub(baseP).normalize();
    const x = y
      .clone()
      .cross(new THREE.Vector3(0, 0, 1))
      .normalize();
    const front = x.clone().cross(y);
    if (front.z < 0) front.negate();
    b.extrude(
      [
        [-0.038, 0],
        [0.038, 0],
        [0.016, 0.06],
        [0, 0.09],
        [-0.016, 0.06],
      ],
      {
        at: baseP.toArray(),
        x: x.toArray(),
        y: y.toArray(),
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 1,
        detail: 0.5,
        color: ORANGE,
        bone: ear,
      },
    );
    b.extrude(
      [
        [-0.022, 0.006],
        [0.022, 0.006],
        [0.009, 0.048],
        [0, 0.066],
        [-0.009, 0.048],
      ],
      {
        at: baseP.clone().addScaledVector(front, 0.0055).toArray(),
        x: x.toArray(),
        y: y.toArray(),
        thickness: 0.004,
        smoothing: 1,
        detail: 0.5,
        color: PINK,
        bone: ear,
      },
    );
  }

  // Cheek fluff and brow tufts (cards) on the head
  const skin = b.surface([skull, ...pads]);
  for (const s of [1, -1]) {
    const hits = [-28, -10, 8].map((el) => skin.around(HEAD).at(s * 88, el)!);
    b.cards(hits, TUFT_CREAM, { size: [0.036, 0.042], lean: 78, flow: [s, -0.3, -0.25], bend: 20, bone: head });
  }

  // Sparkle glints on the back, zzz above the head
  const back = b.surface(body);
  const glints = [back.around([0, BODY_Y, -0.03]).at(0, 80)!, back.around([0, BODY_Y, 0.05]).at(58, 62)!];
  b.cards(glints, SPARKLE, { size: 0.034, flow: [0, 0, 1], bone: hips });
  const tufts = back.scatter(16, { rng: rand, minDist: 0.05, filter: (h) => h.n.y > 0.2 && h.at.z < 0.04 });
  b.cards(tufts, TUFT_ORANGE, { size: [0.03, 0.036], lean: 66, bend: 20, vary: 0.2, spin: 25, rng: rand, bone: hips });
  b.cards([frame([0.012, HEAD[1] + 0.085, HEAD[2] - 0.01], [0, 1, 0])], ZZZ, {
    size: [0.085, 0.085],
    flow: [0, 0, 1],
    bone: head,
    sink: 0,
  });

  // ---- Rice grains, scattered over the sides and front of the block, clear of the edges and the nori
  const grainHits = b.surface(rice).scatter(150, {
    rng: rand,
    minDist: 0.022,
    filter: (h) =>
      Math.abs(h.n.y) < 0.6 &&
      h.at.y > 0.056 &&
      h.at.y < 0.108 &&
      (Math.abs(h.n.z) > 0.6
        ? Math.abs(h.at.x) < 0.082
        : h.at.z > -0.118 && h.at.z < 0.212 && Math.abs(h.at.z - Z_BAND) > 0.036),
  });
  b.cards(grainHits, GRAIN, { size: [0.034, 0.025], lean: 90, spin: 180, rng: rand, sink: 0.3, bone: base });
  const topHits = b
    .surface(rice)
    .scatter(40, {
      rng: rand,
      minDist: 0.03,
      filter: (h) => h.n.y > 0.6 && h.at.z > 0.1 && h.at.z < 0.21 && Math.abs(h.at.x) < 0.07,
    });
  b.cards(topHits, GRAIN, { size: [0.03, 0.022], lean: 90, spin: 180, rng: rand, sink: 0.3, bone: base });

  // ---- Wasabi dab
  const W = new THREE.Vector3(-0.115, BOARD_TOP, 0.305);
  const blobs: Array<[number, number, number, number, number, number, number]> = [
    [0, 0.014, 0, 0.042, 0.02, 0.034, 0],
    [0.004, 0.03, -0.002, 0.03, 0.017, 0.025, 1],
    [-0.002, 0.046, 0.002, 0.018, 0.015, 0.016, 2],
  ];
  for (const [dx, dy, dz, rx, ry, rz, c] of blobs)
    b.part(new THREE.SphereGeometry(1, 7, 5), WASABI[c], {
      bone: base,
      at: [W.x + dx, W.y + dy, W.z + dz],
      scale: [rx, ry, rz],
      flat: true,
    });
  b.cards([frame([W.x - 0.035, W.y, W.z + 0.03], [0, 1, 0])], LEAF, {
    size: 0.05,
    lean: 28,
    flow: [0, 0, 1],
    bone: base,
  });
  b.cards([frame([W.x + 0.002, W.y + 0.05, W.z], [0, 1, 0])], SPARKLE, {
    size: 0.028,
    flow: [0, 0, 1],
    bone: base,
    sink: 0,
  });

  // ---- Pickled-ginger rose
  const G = new THREE.Vector3(0.13, BOARD_TOP, 0.29);
  // A petal is a flattened blob standing on its ring point, leaning out (+) or in (-) from upright.
  const petal = new THREE.SphereGeometry(1, 6, 4).translate(0, 0.9, 0);
  const layers: Array<{ n: number; r: number; dy: number; lean: number; w: number; h: number; c: number }> = [
    { n: 7, r: 0.026, dy: 0.003, lean: 38, w: 0.016, h: 0.014, c: 0 },
    { n: 5, r: 0.017, dy: 0.009, lean: 14, w: 0.013, h: 0.014, c: 1 },
    { n: 4, r: 0.009, dy: 0.015, lean: -14, w: 0.01, h: 0.012, c: 2 },
  ];
  b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.012, 7), GINGER[0], {
    bone: base,
    at: [G.x, G.y + 0.004, G.z],
    flat: true,
  });
  layers.forEach((L, li) => {
    const from = li * 25;
    const ringOptions = { count: L.n, radius: L.r, fromDeg: from, toDeg: from + (360 * (L.n - 1)) / L.n };
    b.ring(frame([G.x, G.y + L.dy, G.z], [0, 1, 0]), ringOptions, (item) => {
      const out = item.outward.clone();
      const d = new THREE.Vector3(0, Math.cos((L.lean * Math.PI) / 180), 0).addScaledVector(
        out,
        Math.sin((L.lean * Math.PI) / 180),
      );
      b.part(petal, GINGER[L.c], {
        bone: base,
        at: item.at,
        dir: d.toArray(),
        up: out.toArray(),
        scale: [L.w, L.h, 0.0045],
        flat: true,
      });
    });
  });
  b.part(new THREE.SphereGeometry(1, 5, 4), GINGER[2], {
    bone: base,
    at: [G.x, G.y + 0.028, G.z],
    scale: [0.007, 0.007, 0.009],
    flat: true,
  });
  b.cards([frame([G.x + 0.03, G.y + 0.03, G.z + 0.02], [0, 1, 0])], SPARKLE, {
    size: 0.026,
    flow: [0, 0, 1],
    bone: base,
    sink: 0,
  });

  // Wood grain printed on the board top
  b.decal(board, WOOD_GRAIN, {
    at: [0, BOARD_TOP, 0.065],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.52, 0.61],
    segments: [10, 10],
    lift: 0.0015,
    bone: base,
  });

  return b.root;
}
