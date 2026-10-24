import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  paint,
  countershade,
  gradient,
  mottle,
  scales,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Half-curled pangolin",
  description:
    "A low-poly pangolin caught mid-curl: arched back plated in overlapping scale rows, tail wrapped round its left flank, small head tucked low with a jointed jaw, and clawed paws.",
};

type V = [number, number, number];
type B = ReturnType<typeof createBuilder>;
type Sw = ReturnType<B["sweep"]>;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BASE = "#4a3d2c";
const SKIN_BELLY = "#d3ab96";
const SKIN_FACE_TOP = "#a98470";
const SKIN_FACE_LOW = "#dbbba7";
const SKIN_LEG = "#b09080";
const SKIN_HAND = "#b79987";
const TAIL_TIP = "#c9a48f";
const NOSE = "#6b4640";
const LID = "#94705d";
const CLAW = "#eadfc4";
const DIRT = "#6a5a48";

const TOP = ["#b09462", "#a58a5a", "#bb9f6c", "#9f8556"];
const MID = ["#86704a", "#7d6843", "#907b52", "#74623f"];
const LOW = ["#5e4f35", "#55472f", "#67573a"];
const RIDGE = ["#cdb072", "#c3a669"];
const TAILTOP = ["#a38859", "#9a8052", "#ae9362"];
const TAILMID = ["#7c6742", "#70603d", "#86724b"];
const TAILLOW = ["#54462f", "#4b3f2a"];

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="27" rx="30" ry="20" fill="#8c6a58"/>
    <ellipse cx="32" cy="29" rx="19" ry="14.5" fill="#1a110f"/>
    <ellipse cx="32" cy="29" rx="19" ry="14.5" fill="none" stroke="#3a2620" stroke-width="2"/>
    <circle cx="25" cy="24" r="5" fill="#ffffff"/>
    <circle cx="39" cy="34" r="2.2" fill="#ffffff" opacity="0.8"/>
    <path d="M3 24 Q32 -6 61 24 L61 16 Q32 -10 3 16 Z" fill="#6b4c3d"/>
    <path d="M3 22 Q32 -2 61 22" stroke="#3b271f" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const MOUTH = svg(
  `<svg viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17 Q50 21 97 5" stroke="#4a2e27" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M90 6 l7 -4" stroke="#4a2e27" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 160 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers
function prof(keys: [number, number, number][]): (t: number) => [number, number] {
  return (t) => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const a = keys[i - 1];
        const c = keys[i];
        const u = (t - a[0]) / (c[0] - a[0]);
        const k = u * u * (3 - 2 * u);
        return [a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  };
}

// One shingle scale: a pentagonal wedge lying along +Z; thin tip buried at the front, raised pointed edge at the rear.
const SCALE = new THREE.ConeGeometry(0.5, 1, 5, 1);
SCALE.rotateX(-Math.PI / 2);

type RowOpts = {
  from: number;
  to: number;
  step: number;
  half: number; // degrees either side of the dorsal line
  sg: 1 | -1; // -1: scales point back along the path (body runs tail -> head), +1: along it
  size: number;
  lenK: number;
  top: string[];
  mid: string[];
  low: string[];
  ridge?: string[];
  minK?: number;
};

function scaleRows(b: B, sw: Sw, o: RowOpts, R: () => number) {
  const len = sw.curve().length;
  const n = Math.max(2, Math.round((len * (o.to - o.from)) / o.step));
  for (let i = 0; i < n; i++) {
    const t = o.from + ((o.to - o.from) * (i + 0.5)) / n;
    const r0 = sw.at(t, 0).radius;
    const k = Math.min(1.15, Math.max(o.minK ?? 0.45, r0 / 0.1));
    const w = o.size * k;
    const arc = (r0 * (2 * o.half) * Math.PI) / 180;
    let m = Math.max(3, Math.round(arc / (w * 0.92)));
    if (m % 2 === 1 !== (i % 2 === 0)) m++;
    const step = (2 * o.half) / m;
    for (let j = 0; j < m; j++) {
      const ang = -o.half + step * (j + 0.5);
      const p = sw.at(t, ang);
      const tg = p.tangent as unknown as { x: number; y: number; z: number };
      const a = Math.abs(ang);
      const isRidge = !!o.ridge && a < 0.5;
      const pal = isRidge ? o.ridge! : a < 42 ? o.top : a < 90 ? o.mid : o.low;
      const col = pal[Math.floor(R() * pal.length) % pal.length];
      const wk = isRidge ? 1.12 : 1;
      b.stick(SCALE, col, p, {
        embed: 0,
        flow: [tg.x * o.sg, tg.y * o.sg, tg.z * o.sg],
        scale: [w * wk, w * 0.85 * wk, w * o.lenK * wk],
        flat: true,
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "pangolin" });
  const R = rng(7);

  // ---- Key points: the half-curled body arches over, head tucked low and forward ----
  const P0: V = [0, 0.15, -0.19];
  const P1: V = [0, 0.2, -0.08];
  const P2: V = [0, 0.215, 0.04];
  const P3: V = [0, 0.18, 0.15];
  const P4: V = [0, 0.125, 0.225];
  const P4b: V = [0, 0.1, 0.26];
  const P5: V = [0, 0.088, 0.292];
  const BODY = [P0, P1, P2, P3, P4, P4b, P5];

  const TAILPTS: V[] = [
    [0, 0.14, -0.225],
    [0.01, 0.105, -0.31],
    [0.07, 0.075, -0.37],
    [0.14, 0.058, -0.35],
    [0.195, 0.05, -0.27],
    [0.21, 0.045, -0.15],
    [0.205, 0.04, -0.03],
    [0.185, 0.036, 0.07],
    [0.15, 0.034, 0.14],
  ];

  const HB: V = P5;
  const TIP: V = [0, 0.044, 0.432];

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: P0, dir: [0, 0.4, 1], role: "spine" });
  const spine = b.chain("spine", catmull([P0, P1, P2, P3, P4]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([P4, P4b, P5]), { parent: spine, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck, at: HB, aim: TIP, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.062, 0.305], aim: [0, 0.03, 0.415], role: "jaw" });
  const tail = b.chain("tail", catmull(TAILPTS), {
    parent: hips,
    count: 7,
    names: (i: number) => `tail${i + 1}`,
    role: "tail",
  });

  // ---- Body ----
  const BELLY = mottle(SKIN_BELLY, "#c29a86", { size: 0.05, seed: 4 });
  const body = b.sweep(
    catmull(BODY),
    prof([
      [0, 0.05, 0.05],
      [0.1, 0.085, 0.075],
      [0.23, 0.108, 0.098],
      [0.46, 0.12, 0.112],
      [0.68, 0.108, 0.1],
      [0.85, 0.075, 0.07],
      [1, 0.056, 0.054],
    ]),
    {
      bone: [spine, neck],
      color: BASE,
      sectors: [[100, 260, BELLY]],
      sides: 12,
      smooth: false,
    },
  );

  scaleRows(
    b,
    body,
    {
      from: 0.03,
      to: 0.93,
      step: 0.031,
      half: 118,
      sg: -1,
      size: 0.062,
      lenK: 1.45,
      top: TOP,
      mid: MID,
      low: LOW,
      ridge: RIDGE,
    },
    R,
  );

  // ---- Tail wrapped round the left flank ----
  const tailTube = b.sweep(
    tail,
    prof([
      [0, 0.055, 0.05],
      [0.2, 0.052, 0.045],
      [0.4, 0.044, 0.04],
      [0.7, 0.034, 0.032],
      [1, 0.012, 0.012],
    ]),
    {
      color: BASE,
      bands: [
        [0.9, BASE],
        [1, TAIL_TIP],
      ],
      sides: 10,
      smooth: false,
    },
  );
  scaleRows(
    b,
    tailTube,
    {
      from: 0.03,
      to: 0.97,
      step: 0.033,
      half: 135,
      sg: 1,
      size: 0.066,
      lenK: 1.5,
      top: TAILTOP,
      mid: TAILMID,
      low: TAILLOW,
      ridge: RIDGE,
      minK: 0.4,
    },
    R,
  );

  // ---- Head ----
  const FACE = countershade(SKIN_FACE_TOP, SKIN_FACE_LOW, { level: -0.1, soft: 0.5 });
  const headTube = b.sweep(
    [
      [0, 0.095, 0.262],
      [0, 0.046, 0.432],
    ],
    prof([
      [0, 0.062, 0.056],
      [0.25, 0.058, 0.052],
      [0.55, 0.036, 0.032],
      [0.85, 0.022, 0.02],
      [1, 0.016, 0.015],
    ]),
    { bone: head, color: FACE, sides: 8, smooth: false, caps: { start: "flat", end: "round" } },
  );
  b.sweep(
    [
      [0, 0.062, 0.305],
      [0, 0.03, 0.4],
    ],
    [0.03, 0.012],
    { bone: jaw, color: "#cfae9b", sides: 6, smooth: false },
  );
  // nose pad and nostrils
  b.part(new THREE.SphereGeometry(0.02, 6, 4), NOSE, {
    bone: head,
    at: [0, 0.044, 0.446],
    scale: [1, 0.85, 1.1],
    flat: true,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0055, 5, 3), "#1d1210", { bone: head, at: [s * 0.009, 0.05, 0.463] });

  const headSkin = b.surface(headTube);
  for (const s of [1, -1]) {
    const eyeHit = headSkin.around([0, 0.085, 0.3]).at(s * 68, 20);
    if (eyeHit) b.decal(headTube, EYE, { at: eyeHit, dir: eyeHit.axis, size: [0.038, 0.028] });
    const lidHit = headSkin.around([0, 0.085, 0.3]).at(s * 66, 40);
    if (lidHit) b.stick(new THREE.SphereGeometry(0.02, 6, 4), LID, lidHit, { embed: 0.45, scale: [1, 0.55, 1.3], flat: true });
    const earHit = headSkin.around([0, 0.09, 0.275]).at(s * 105, 30);
    if (earHit) b.stick(new THREE.SphereGeometry(0.014, 5, 4), "#9a7763", earHit, { embed: 0.4, scale: [0.6, 1.1, 1], flat: true });
    const mouthHit = headSkin.around([0, 0.062, 0.36]).at(s * 88, -8);
    if (mouthHit) b.decal(headTube, MOUTH, { at: mouthHit, dir: mouthHit.axis, size: [0.075, 0.02], mirror: s < 0 });
  }
  scaleRows(
    b,
    headTube,
    {
      from: 0.06,
      to: 0.6,
      step: 0.022,
      half: 52,
      sg: 1,
      size: 0.034,
      lenK: 1.4,
      top: ["#b59a68", "#a98f5e", "#bfa371"],
      mid: ["#8c7650", "#80694a"],
      low: ["#6c5a3e"],
      minK: 0.5,
    },
    R,
  );

  // ---- Legs ----
  const LEG_SCALY = scales(["#7a6743", "#8a7650", "#6c5b3b"], "#3c3022", { size: 0.028, width: 0.14, seed: 3 });
  const LEG = gradient(
    paint((p, n) => (n.x * Math.sign(p.x) > 0.25 ? LEG_SCALY : SKIN_LEG)),
    DIRT,
    [0, 0.06, 0],
    [0, 0.0, 0],
  );

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // foreleg: short, strong, with long curved digging claws
    const fore = limb([s * 0.085, 0.13, 0.14], [s * 0.115, 0.03, 0.185], [0.07, 0.07], [[0, 0, -1]]);
    const armC = b.chain(`foreleg${L}`, fore, {
      parent: spine.joints[3],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    const armTube = b.sweep(armC, [0.044, 0.027], { color: LEG, sides: 8, smooth: false });
    const wrist = armC.tip!;
    const wp = fore[2];
    b.capsule(wp, [s * 0.115, 0.022, 0.232], 0.021, { bone: wrist, color: SKIN_HAND, sides: 8, smooth: false });
    for (const k of [-1, 0, 1]) {
      const bx = s * 0.115 + k * 0.014;
      const p0: V = [bx, 0.026, 0.236];
      const p1: V = [bx + k * 0.008, 0.032, 0.272];
      const p2: V = [bx + k * 0.018, 0.019, 0.302];
      b.sweep(bezier(p0, p1, p2), [0.0098, 0], {
        bone: wrist,
        color: CLAW,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
      });
    }

    // hind leg: knee forward, heel back, flat plantigrade foot
    const hind = limb([s * 0.07, 0.13, -0.13], [s * 0.1, 0.03, -0.17], [0.075, 0.075], [[0, 0, 1]]);
    const legC = b.chain(`hindleg${L}`, hind, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    const legTube = b.sweep(legC, [0.05, 0.027], { color: LEG, sides: 8, smooth: false });
    const ankle = legC.tip!;
    const hp = hind[2];
    b.capsule(hp, [s * 0.1, 0.022, -0.1], 0.021, { bone: ankle, color: SKIN_HAND, sides: 8, smooth: false });
    for (const k of [-1.5, -0.5, 0.5, 1.5]) {
      const bx = s * 0.1 + k * 0.011;
      b.sweep(bezier([bx, 0.024, -0.102], [bx + k * 0.003, 0.028, -0.082], [bx + k * 0.006, 0.019, -0.066]), [0.0075, 0], {
        bone: ankle,
        color: CLAW,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
      });
    }

    // scales shingling down the outer faces of the limbs
    for (const tube of [armTube, legTube]) {
      const hits = b.surface(tube).scatter(9, {
        rng: R,
        minDist: 0.032,
        filter: (h) => h.n.x * s > 0.35 && h.at.y > 0.045,
      });
      for (const h of hits) {
        const col = MID[Math.floor(R() * MID.length) % MID.length];
        b.stick(SCALE, col, h, { embed: 0, flow: [0, -1, -0.2], scale: [0.04, 0.034, 0.058], flat: true });
      }
    }
  }

  return b.root;
}
