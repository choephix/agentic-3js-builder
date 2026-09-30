import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { offset, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Eggshell Dragonling",
  description:
    "A baby dragon, half a metre tall, just hatched: sitting in the bottom half of its spotted egg with a jagged shell cap still on its head, stubby horns, tiny spread wings, a chubby tail curling over the rim and a separate jaw with one tooth.",
};

// ---- palette (flat candy pastels) ----------------------------------------------------------------------------
const MINT = "#8fe6b8";
const MINT_D = "#5cc497";
const BELLY = "#ffe9a6";
const PINK = "#ff9cc4";
const PINK_D = "#ff78a9";
const LILAC = "#cdb8ff";
const LILAC_D = "#ad94f2";
const HORN = "#ffd56b";
const HORN_TIP = "#ffad4f";
const SHELL = "#fff9ee";
const SHELL_IN = "#ffc6da";
const PLUM = "#3a2152";
const MOUTH = "#8a3568";
const TONGUE = "#ff7fa6";
const WHITE = "#ffffff";

// ---- SVG drawings (flat fills only) --------------------------------------------------------------------------
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 76">
    <ellipse cx="30" cy="38" rx="27" ry="35" fill="#2d1b45"/>
    <ellipse cx="30" cy="53" rx="21" ry="19" fill="#6a4ab0"/>
    <ellipse cx="30" cy="57" rx="13" ry="12" fill="#a78bff"/>
    <circle cx="21" cy="22" r="9.5" fill="#ffffff"/>
    <circle cx="40" cy="51" r="4.6" fill="#ffffff"/>
    <circle cx="41" cy="33" r="2.6" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const BLUSH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24">
    <ellipse cx="20" cy="12" rx="19" ry="11" fill="#ff8fb8"/>
    <path d="M9 9 L13 15 M17 8 L21 16 M25 9 L29 15" stroke="#ff6596" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

const BROW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 16">
    <path d="M4 13 Q18 -1 36 7" stroke="#2d1b45" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

const SMILE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M3 6 Q6 19 21 17" stroke="#2d1b45" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M18 11 L22 18" stroke="#2d1b45" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 144 },
);

const GEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
    <path d="M16 1 L31 20 L16 39 L1 20 Z" fill="#ff78a9"/>
    <path d="M16 8 L25 20 L16 32 L7 20 Z" fill="#ffb3cf"/>
    <circle cx="13" cy="16" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 160 },
);

const BARS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48">
    <rect x="9" y="1" width="22" height="7" rx="3.5" fill="#ffd27a"/>
    <rect x="5" y="11" width="30" height="7" rx="3.5" fill="#ffd27a"/>
    <rect x="3" y="21" width="34" height="7" rx="3.5" fill="#ffd27a"/>
    <rect x="5" y="31" width="30" height="7" rx="3.5" fill="#ffd27a"/>
    <rect x="9" y="41" width="22" height="6" rx="3" fill="#ffd27a"/>
  </svg>`,
  { size: 192 },
);

const spotDrawing = (a: string, b: string, inner = b) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="15" fill="${a}"/>
      <circle cx="31" cy="9" r="5" fill="${a}"/>
      <circle cx="9" cy="32" r="4" fill="${a}"/>
      <circle cx="17" cy="18" r="6.5" fill="${b}"/>
      <circle cx="26" cy="27" r="2.6" fill="${inner}"/>
    </svg>`,
    { size: 160 },
  );
const SPOT_LILAC = spotDrawing("#c5aaf5", "#a98be8");
const SPOT_PEACH = spotDrawing("#ffbb95", "#ff9a72");
const SPOT_MINT = spotDrawing("#a6e9c6", "#82d8ab");

const STAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M16 1 Q18 14 31 16 Q18 18 16 31 Q14 18 1 16 Q14 14 16 1 Z" fill="#fff08a"/>
    <path d="M16 9 Q17 15 23 16 Q17 17 16 23 Q15 17 9 16 Q15 15 16 9 Z" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const HEART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30">
    <path d="M16 28 C2 18 1 8 8 4 C12 2 15 5 16 8 C17 5 20 2 24 4 C31 8 30 18 16 28 Z" fill="#ff8fb8"/>
    <circle cx="9" cy="10" r="2.4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

// ---- a torn egg shell: outer skin, pink lining and a jagged rim, all flat-faceted -----------------------------
type Tri = [THREE.Vector3, THREE.Vector3, THREE.Vector3];
function shellGeometries(o: {
  a: number;
  b: number;
  pole: 1 | -1;
  rows: number;
  segs: number;
  thetaMax: number;
  thick: number;
  tooth: (j: number, phi: number) => number;
}) {
  const { a, b, pole, rows, segs, thetaMax, thick } = o;
  const k = 1 - thick / a;
  const at = (theta: number, phi: number) => {
    const y = pole * b * Math.cos(theta);
    const egg = 1 + 0.07 * (-pole * Math.cos(theta));
    return new THREE.Vector3(a * egg * Math.sin(theta) * Math.sin(phi), y, a * egg * Math.sin(theta) * Math.cos(phi));
  };
  const outer: THREE.Vector3[][] = [];
  for (let i = 0; i <= rows; i++) {
    const row: THREE.Vector3[] = [];
    for (let j = 0; j < segs; j++) {
      const phi = (Math.PI * 2 * j) / segs;
      row.push(at(i === rows ? thetaMax + o.tooth(j, phi) : (thetaMax * i) / rows, phi));
    }
    outer.push(row);
  }
  const inner = outer.map((row) => row.map((p) => p.clone().multiplyScalar(k)));
  const skin: Tri[] = [];
  const lining: Tri[] = [];
  const rim: Tri[] = [];
  const emit = (list: Tri[], p: THREE.Vector3, q: THREE.Vector3, r: THREE.Vector3, want: THREE.Vector3) => {
    const n = q.clone().sub(p).cross(r.clone().sub(p));
    if (n.lengthSq() < 1e-12) return;
    list.push(n.dot(want) >= 0 ? [p, q, r] : [p, r, q]);
  };
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      for (const [g, list, sign] of [
        [outer, skin, 1],
        [inner, lining, -1],
      ] as const) {
        const A = g[i][j];
        const B = g[i][j1];
        const C = g[i + 1][j1];
        const D = g[i + 1][j];
        const c1 = A.clone().add(B).add(C).multiplyScalar(sign);
        const c2 = A.clone().add(C).add(D).multiplyScalar(sign);
        emit(list, A, B, C, c1);
        emit(list, A, C, D, c2);
      }
    }
  for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs;
    const up = outer[rows][j].clone().sub(outer[rows - 1][j]);
    const P = outer[rows][j];
    const P1 = outer[rows][j1];
    const Q = inner[rows][j];
    const Q1 = inner[rows][j1];
    emit(rim, P, P1, Q1, up);
    emit(rim, P, Q1, Q, up);
  }
  const geo = (tris: Tri[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(tris.flatMap((t) => t.flatMap((v) => v.toArray())), 3));
    return g;
  };
  return { skin: geo(skin), lining: geo(lining), rim: geo(rim) };
}

export default function build() {
  const b = createBuilder({ name: "eggshellDragonling" });
  const rand = rng(11);

  // ---- skeleton ------------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.11, -0.03], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.11, -0.03],
      [0, 0.18, -0.01],
      [0, 0.24, 0.01],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    [
      [0, 0.24, 0.01],
      [0, 0.29, 0.03],
    ],
    { parent: chest, names: ["neck1"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.29, 0.03], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.3, 0.085], dir: [0, 0, 1], role: "jaw" });

  const blob = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
  const ball = (
    bone: Joint,
    c: [number, number, number],
    r: number | [number, number, number],
    color: string,
    opts: { rotation?: [number, number, number]; w?: number; h?: number } = {},
  ) =>
    b.part(blob(opts.w, opts.h), color, {
      bone,
      at: c,
      scale: r,
      flat: true,
      ...(opts.rotation ? { rotation: opts.rotation } : {}),
    });

  // ---- the egg bottom --------------------------------------------------------------------------------------------
  const EA = 0.165;
  const EB = 0.175;
  const EGG_C: [number, number, number] = [0, EB, 0];
  const bowl = shellGeometries({
    a: EA,
    b: EB,
    pole: -1,
    rows: 5,
    segs: 14,
    thetaMax: Math.PI / 2,
    thick: 0.012,
    tooth: (j, phi) => {
      if (j % 2 === 1) return 0;
      const front = 0.6 + 0.4 * ((1 - Math.cos(phi)) / 2);
      return (0.14 + 0.2 * rand()) * front;
    },
  });
  const outerShell = b.part(bowl.skin, SHELL, { bone: root, at: EGG_C, flat: true });
  b.part(bowl.lining, SHELL_IN, { bone: root, at: EGG_C, flat: true });
  b.part(bowl.rim, SHELL, { bone: root, at: EGG_C, flat: true });
  const shellSkin = b.surface(outerShell);
  const spotSpecs: [number, number, number, THREE.Texture, number][] = [
    [0, -34, 0.065, SPOT_LILAC, 10],
    [36, -16, 0.045, SPOT_PEACH, 70],
    [68, -44, 0.06, SPOT_MINT, 130],
    [112, -22, 0.055, SPOT_LILAC, 200],
    [148, -40, 0.065, SPOT_PEACH, 20],
    [-32, -52, 0.055, SPOT_MINT, 300],
    [-62, -24, 0.055, SPOT_LILAC, 40],
    [-98, -40, 0.065, SPOT_PEACH, 250],
    [-132, -20, 0.045, SPOT_MINT, 100],
    [180, -48, 0.05, SPOT_LILAC, 330],
    [18, -66, 0.05, SPOT_PEACH, 60],
    [-15, -14, 0.04, SPOT_MINT, 170],
    [55, -32, 0.035, SPOT_LILAC, 20],
    [90, -12, 0.04, SPOT_PEACH, 310],
    [-80, -12, 0.04, SPOT_LILAC, 140],
    [-112, -56, 0.05, SPOT_LILAC, 15],
    [132, -62, 0.045, SPOT_MINT, 75],
  ];
  for (const [az, el, size, tex, roll] of spotSpecs) {
    const hit = shellSkin.around(EGG_C).at(az, el);
    if (hit) b.decal(shellSkin, tex, { at: hit, size: [size, size], roll });
  }

  // ---- body ------------------------------------------------------------------------------------------------------
  const bodyPath = catmull([
    [0, 0.09, -0.03],
    [0, 0.17, -0.01],
    [0, 0.235, 0.01],
    [0, 0.29, 0.03],
  ]);
  const body = b.sweep(bodyPath, [0.09, 0.112, 0.092, 0.058], {
    bone: [hips, spine, neck],
    color: MINT,
    sides: 8,
    smooth: false,
  });
  const belly = ball(spine.joints[0], [0, 0.175, 0.06], [0.082, 0.08, 0.055], BELLY);
  b.decal(belly, BARS, { at: [0, 0.18, 0.12], dir: [0, 0, -1], size: [0.085, 0.092] });
  for (const i of [0.42, 0.6, 0.78])
    b.spike(body.at(i), body.at(i), 0.04, 0.017, { color: PINK, sides: 5, smooth: false, caps: "flat" });

  // ---- head ------------------------------------------------------------------------------------------------------
  const HC: [number, number, number] = [0, 0.355, 0.04];
  const skull = ball(head, HC, [0.13, 0.105, 0.115], MINT, { w: 10, h: 7 });
  const skin = b.surface(skull);
  ball(head, [0, 0.322, 0.13], [0.047, 0.034, 0.05], MINT, { w: 8, h: 6 }); // snout
  ball(head, [0, 0.297, 0.128], [0.038, 0.012, 0.045], MOUTH, { w: 8, h: 4 }); // dark mouth roof
  for (const s of [1, -1]) ball(head, [s * 0.02, 0.33, 0.178], 0.0075, PLUM, { w: 5, h: 4 }); // nostrils

  for (const s of [1, -1]) {
    const eye = skin.around(HC).at(s * 43, 4);
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.058, 0.074] });
    const cheek = skin.around(HC).at(s * 62, -20);
    if (cheek) b.decal(skin, BLUSH, { at: cheek, size: [0.05, 0.03], roll: s * 10 });
    const brow = skin.around(HC).at(s * 42, 32);
    if (brow) b.decal(skin, BROW, { at: brow, size: [0.05, 0.02], mirror: s > 0, roll: s * -6 });
    const smile = skin.around(HC).at(s * 30, -34);
    if (smile) b.decal(skin, SMILE, { at: smile, size: [0.026, 0.026], mirror: s > 0 });
  }
  const gem = skin.around(HC).at(0, 40);
  if (gem) b.decal(skin, GEM, { at: gem, size: [0.028, 0.035] });

  // lower jaw with a single tooth and a tongue
  ball(jaw, [0, 0.282, 0.122], [0.04, 0.021, 0.05], BELLY, { w: 8, h: 5 });
  ball(jaw, [0, 0.297, 0.128], [0.027, 0.008, 0.034], TONGUE, { w: 6, h: 4 });
  b.part(new THREE.ConeGeometry(0.0115, 0.032, 5), WHITE, {
    bone: jaw,
    at: [0.022, 0.308, 0.163],
    rotation: [0, 0, 0],
    flat: true,
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  // horns and ear frills
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 36, 50);
    if (!hit) continue;
    const tip = offset(hit, [s * 0.7, 0.75, 0.15], 0.066);
    const midp = offset(hit, [s * 0.3, 1, 0.05], 0.032);
    b.sprout(`horn${s > 0 ? "L" : "R"}`, hit, bezier(hit, midp, tip), [0.027, 0.005], {
      count: 0,
      bands: [
        [0.62, HORN],
        [1, HORN_TIP],
      ],
      sides: 6,
      smooth: false,
      caps: { end: "point" },
    });
    const outline: [number, number][] = [
      [0, -0.028],
      [0.05, -0.022],
      [0.095, 0.045],
      [0.035, 0.038],
      [0, 0.032],
    ];
    const inn: [number, number][] = [
      [0.004, -0.018],
      [0.04, -0.014],
      [0.072, 0.03],
      [0.03, 0.026],
      [0.004, 0.022],
    ];
    const ear = { at: [s * 0.108, 0.35, -0.005] as [number, number, number], x: [s, 0.05, -0.3] as [number, number, number], y: [0, 1, 0] as [number, number, number], bone: head };
    b.extrude(outline, { ...ear, thickness: 0.008, bevel: 0.002, color: MINT_D });
    b.extrude(inn, { ...ear, thickness: 0.012, color: PINK });
  }

  // the eggshell cap, perched back on the head
  const cap = shellGeometries({
    a: 0.152,
    b: 0.118,
    pole: 1,
    rows: 4,
    segs: 12,
    thetaMax: 1.0,
    thick: 0.012,
    tooth: (j) => (j % 2 === 0 ? 0.22 + 0.28 * rand() : 0),
  });
  const capAt: [number, number, number] = [0, 0.378, 0.005];
  const capRot: [number, number, number] = [-26, 0, 7];
  const capOuter = b.part(cap.skin, SHELL, { bone: head, at: capAt, rotation: capRot, flat: true });
  b.part(cap.lining, SHELL_IN, { bone: head, at: capAt, rotation: capRot, flat: true });
  b.part(cap.rim, SHELL, { bone: head, at: capAt, rotation: capRot, flat: true });
  const capSkin = b.surface(capOuter);
  const capCenter: [number, number, number] = capAt;
  const capSpots: [number, number, number, THREE.Texture, number][] = [
    [0, 60, 0.05, SPOT_LILAC, 0],
    [120, 45, 0.045, SPOT_PEACH, 50],
    [-110, 40, 0.05, SPOT_MINT, 90],
    [200, 50, 0.04, SPOT_PEACH, 10],
  ];
  for (const [az, el, size, tex, roll] of capSpots) {
    const hit = capSkin.around(capCenter).at(az, el);
    if (hit) b.decal(capSkin, tex, { at: hit, size: [size, size], roll });
  }

  // ---- arms ------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.092, 0.222, 0.03];
    const hand: [number, number, number] = [s * 0.152, 0.2, 0.05];
    const pts = limb(shoulder, hand, [0.05, 0.05], [s * 0.3, -0.7, -0.2]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.03, 0.025, 0.023], { color: MINT, sides: 6, smooth: false });
    const wrist = arm.joints[2];
    ball(wrist, hand, [0.03, 0.022, 0.028], MINT, { w: 6, h: 4 });
    for (const dx of [-1, 0, 1])
      b.spike(
        [hand[0] + dx * 0.014 * s, hand[1] - 0.004, hand[2] + 0.02],
        [dx * 0.4 * s, -0.1, 1],
        0.02,
        0.007,
        { bone: wrist, color: SHELL, sides: 5, smooth: false, caps: "flat" },
      );
  }

  // ---- legs: knees up, feet hooked over the front of the rim -------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.06, 0.115, 0.0];
    const ankle: [number, number, number] = [s * 0.075, 0.19, 0.138];
    const pts = limb(hip, ankle, [0.125, 0.075], [s * 0.3, 1, 0.3]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.05, 0.038, 0.03], { color: MINT, sides: 7, smooth: false });
    const foot = leg.joints[2];
    ball(foot, [ankle[0], ankle[1] - 0.004, ankle[2] + 0.022], [0.034, 0.02, 0.04], MINT, { w: 7, h: 5 });
    for (const dx of [-1, 0, 1]) {
      const tx = ankle[0] + dx * 0.02;
      ball(foot, [tx, ankle[1] - 0.006, ankle[2] + 0.058], [0.012, 0.011, 0.013], MINT, { w: 5, h: 4 });
      b.spike([tx, ankle[1] - 0.007, ankle[2] + 0.066], [dx * 0.15, -0.25, 1], 0.017, 0.0065, {
        bone: foot,
        color: SHELL,
        sides: 5,
        smooth: false,
        caps: "flat",
      });
    }
  }

  // ---- wings -----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const armPath = catmull([
      [s * 0.058, 0.235, -0.05],
      [s * 0.115, 0.265, -0.072],
      [s * 0.17, 0.295, -0.088],
    ]);
    const wing = b.chain(`wing${side}`, armPath, {
      parent: chest,
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
    });
    b.sweep(wing, [0.017, 0.013, 0.011], { color: PINK, sides: 6, smooth: false });
    const wrist = wing.joints[2];
    const tips: [number, number, number][] = [
      [s * 0.228, 0.392, -0.11],
      [s * 0.278, 0.332, -0.122],
      [s * 0.26, 0.252, -0.105],
    ];
    const fingers = tips.map((tip, i) => {
      const base = wrist.at;
      const midp = base.clone().lerp(new THREE.Vector3(...tip), 0.5);
      midp.z -= 0.004;
      const f = b.chain(`wingFinger${i + 1}${side}`, [base, midp, tip], {
        parent: wrist,
        names: [`wf${i + 1}a${side}`, `wf${i + 1}b${side}`],
        role: "digit",
      });
      b.sweep(f, [0.008, 0.003], { color: PINK_D, sides: 5, smooth: false, caps: "point" });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { color: LILAC, thickness: 0.006, rows: 3, scallop: 0.2 });
    b.membrane(fingers[1], fingers[2], { color: LILAC_D, thickness: 0.006, rows: 3, scallop: 0.2 });
    b.membrane(
      fingers[2],
      [
        wrist.at.toArray(),
        [s * 0.12, 0.225, -0.085],
        [s * 0.065, 0.205, -0.06],
      ],
      { color: LILAC, thickness: 0.006, rows: 3, bone: spine.joints[1] },
    );
  }

  // ---- the chubby tail curling out over the rim -------------------------------------------------------------------
  const tailPath = catmull([
    [0, 0.11, -0.05],
    [0, 0.14, -0.11],
    [0, 0.205, -0.165],
    [0, 0.23, -0.212],
    [0, 0.175, -0.255],
    [0, 0.09, -0.285],
    [0, 0.032, -0.318],
    [0, 0.03, -0.362],
    [0, 0.068, -0.388],
    [0, 0.1, -0.362],
    [0, 0.085, -0.332],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 7, role: "tail" });
  const tailTube = b.sweep(tail, (t) => 0.056 * (1 - t) ** 1.2 + 0.014, {
    color: (t) => (Math.floor(t * 9) % 2 ? MINT_D : MINT),
    sectors: [[125, 235, BELLY]],
    sides: 7,
    smooth: false,
  });
  b.along(tailTube, 4, (at) => b.spike(at, at, 0.038, 0.017, { color: PINK, sides: 5, smooth: false, caps: "flat" }), {
    from: 0.1,
    to: 0.7,
  });
  const tipFrame = tail.at(1);
  const T = tipFrame.axis.clone();
  const ty = T.y;
  const tz = T.z;
  const spade: [number, number][] = [
    [0, 0.01],
    [0.03, 0.034],
    [0.07, 0, "sharp"] as unknown as [number, number],
    [0.03, -0.034],
    [0, -0.01],
  ];
  b.extrude(spade, {
    at: tipFrame.at.toArray(),
    x: [0, ty, tz],
    y: [0, -tz, ty],
    thickness: 0.012,
    bevel: 0.003,
    color: PINK_D,
    bone: tail.joints[tail.joints.length - 1],
  });

  // ---- shell shards on the floor and sparkles ------------------------------------------------------------------------
  const shards: [number, number, number, number][] = [
    [0.09, 0.06, 40, 0.045],
    [-0.1, 0.05, 160, 0.04],
    [0.22, -0.2, 250, 0.035],
    [-0.2, -0.26, 20, 0.04],
  ];
  for (const [x, z, deg, sz] of shards) {
    const rad = (deg * Math.PI) / 180;
    const dx: [number, number, number] = [Math.cos(rad), 0, Math.sin(rad)];
    const dz: [number, number, number] = [-Math.sin(rad), 0, Math.cos(rad)];
    const shard = b.extrude(
      [
        [-sz, -sz * 0.7],
        [sz * 0.2, -sz],
        [sz * 1.1, sz * 0.1, "sharp"],
        [sz * 0.1, sz * 0.9],
        [-sz * 0.8, sz * 0.4],
      ],
      { at: [x, 0.006, z], x: dx, y: dz, thickness: 0.012, color: SHELL, bone: root },
    );
    b.decal(shard, SPOT_LILAC, { at: [x, 0.012, z], dir: [0, -1, 0], up: [0, 0, -1], size: [sz * 0.9, sz * 0.9], roll: deg });
  }
  const sparkleAt: [number, number, number][] = [
    [0.33, 0.24, 0.08],
    [-0.27, 0.38, 0.08],
    [0.2, 0.42, -0.2],
    [-0.22, 0.26, -0.22],
    [0.27, 0.12, 0.2],
  ];
  b.cards(
    sparkleAt.map((p) => frame(p, [0, 1, 0])),
    STAR,
    { size: 0.05, flow: [0, 0, 1], cross: true, bone: root },
  );
  b.cards([frame([-0.15, 0.36, 0.22], [0, 1, 0]), frame([0.3, 0.2, -0.05], [0, 1, 0])], HEART, {
    size: 0.045,
    flow: [0, 0, 1],
    cross: true,
    bone: root,
  });

  return b.root;
}
