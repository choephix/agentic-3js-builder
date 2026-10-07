import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  noise,
  cells,
  smoothstep,
  interpolate,
  rgb,
} from "../../../../src/index";
import type { Rgb } from "../../../../src/index";

export const meta = {
  name: "Panther Chameleon on a Twig",
  description:
    "A panther chameleon mid-stride on an arching twig: turquoise head blending through lime to sunset-orange tail, " +
    "a white flank stripe with red bars, a serrated golden crest, independent turret eyes (one forward, one swivelled back), " +
    "mitten-like zygodactyl feet wrapped round the wood and a tightly coiled prehensile tail. Rigged with spine, neck, head, jaw, eyes, limbs and tail.",
};

type P3 = [number, number, number];

// ------------------------------------------------------------------ layout
const DY = 0.032; // the animal rides this far above the "flat" design heights
const Y = (y: number) => y + DY;
const HZ = 0.108; // head origin (z)
const HY = Y(0.098); // head origin (y)
const TW = 0.36; // half length of the twig

const twigR = (z: number) => 0.0155 - 0.0055 * ((z + TW) / (2 * TW));
/** Twig centre (x, y) and radius at z: an arch whose two ends rest on the floor. */
function twigC(z: number): P3 {
  const r = twigR(z);
  const k = Math.max(0, 1 - (z / TW) ** 2);
  return [0.006 * Math.sin(z * 11 + 0.6), r + 0.0375 * k, r];
}

// ------------------------------------------------------------------ paints
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp3 = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const dim = (a: Rgb, k: number): Rgb => [a[0] * k, a[1] * k, a[2] * k];

const TURQ = rgb("#10c2b6");
const SEA = rgb("#22cf9c");
const LIME = rgb("#92d82c");
const CHART = rgb("#cfe03a");
const ORANGE = rgb("#f48a1f");
const SUNSET = rgb("#ec5a1e");
const TIPRED = rgb("#bd2f22");
const BARRED = rgb("#d4232f");
const WHITE = rgb("#f8f6e6");
const CREAM = rgb("#e4f2b4");
const DEEP = rgb("#0b7f8c");
const PALE = rgb("#ffc56a");
const CREST_BASE = rgb("#14b3a6");
const CREST_TIP = rgb("#ffc533");

const STOPS: Array<[number, Rgb]> = [
  [0, TURQ],
  [0.2, SEA],
  [0.42, LIME],
  [0.68, CHART],
  [1, ORANGE],
];
function ramp(g: number): Rgb {
  for (let i = 1; i < STOPS.length; i++) {
    if (g <= STOPS[i][0]) {
      const [g0, c0] = STOPS[i - 1];
      const [g1, c1] = STOPS[i];
      return lerp3(c0, c1, (g - g0) / (g1 - g0));
    }
  }
  return STOPS[STOPS.length - 1][1];
}

/** Fine reptile-scale mosaic: darker borders, a few pale scales. */
function scalePattern(p: THREE.Vector3, c: Rgb, seed: number): Rgb {
  const cl = cells(p, 0.0046, seed);
  const edge = smoothstep(0, 0.17, cl.d2 - cl.d1);
  let out = dim(c, 0.88 + 0.12 * edge + (cl.id - 0.5) * 0.12);
  if (cl.id > 0.9) out = lerp3(out, WHITE, 0.28 * edge);
  return out;
}

/** Body, head, limbs: turquoise head -> lime -> orange hips, red bars, white flank stripe, white lips. */
const skin = paint((p, n) => {
  const wob = noise(p, 0.05, 11) - 0.5;
  const g = clamp01((0.125 - p.z) / 0.215 + wob * 0.14);
  let c = ramp(g);
  c = lerp3(c, DEEP, smoothstep(0.45, 1, n.y) * 0.2);
  c = lerp3(c, CREAM, smoothstep(-0.25, -0.95, n.y) * 0.55);

  // red bars across the body, fading toward the belly
  const body = smoothstep(0.1, 0.082, p.z) * smoothstep(-0.105, -0.085, p.z);
  if (body > 0) {
    const wob2 = noise(p, 0.03, 21) - 0.5;
    const zb = p.z / 0.032 + wob2 * 0.9;
    const f = zb - Math.floor(zb);
    const half = 0.19 + wob * 0.1;
    const bar = smoothstep(half + 0.06, half - 0.03, Math.abs(f - 0.5));
    c = lerp3(c, BARRED, bar * smoothstep(-0.85, -0.15, n.y) * body * 0.92);
  }

  // white lateral stripe, only on the trunk
  const flank = smoothstep(0.55, 0.85, Math.abs(n.x));
  const lens = smoothstep(0.088, 0.062, p.z) * smoothstep(-0.086, -0.06, p.z);
  const onBody = 1 - smoothstep(0.022, 0.028, Math.abs(p.x));
  const dy = n.y - 0.12 - wob * 0.18;
  const stripe = smoothstep(0.058, 0.032, Math.abs(dy)) * flank * lens * onBody;
  c = lerp3(c, WHITE, stripe);

  c = scalePattern(p, c, 5);

  // pale lips along the mouth line
  const lipZone = smoothstep(HZ - 0.012, HZ - 0.006, p.z);
  if (lipZone > 0) {
    const lip = smoothstep(0.0034, 0.0016, Math.abs(p.y - (HY - 0.0042))) * lipZone;
    c = lerp3(c, WHITE, lip * 0.95);
  }
  return c;
});

/** Tail: sunset orange deepening to a red tip, red rings, pale underside (source t runs root -> tip). */
const tailSkin = paint((p, n, s) => {
  const t = s[0];
  const wob = noise(p, 0.03, 41) - 0.5;
  let c = lerp3(ORANGE, SUNSET, smoothstep(0.05, 0.85, t));
  c = lerp3(c, TIPRED, smoothstep(0.82, 1, t) * 0.8);
  c = lerp3(c, PALE, smoothstep(-0.2, -0.95, n.y) * 0.35);
  const zb = t / 0.058 + wob * 0.7;
  const f = zb - Math.floor(zb);
  const bar = smoothstep(0.26, 0.17, Math.abs(f - 0.5));
  c = lerp3(c, BARRED, bar * 0.85 * smoothstep(0.02, 0.1, t));
  return scalePattern(p, c, 9);
});

/** Crest comb: teal at the root, golden at the teeth. */
const crestPaint = paint((p) => lerp3(CREST_BASE, CREST_TIP, smoothstep(HY + 0.034, HY + 0.049, p.y)));

// ------------------------------------------------------------------ shapes
const BT = [0, 0.1, 0.35, 0.6, 0.8, 0.92, 1];
const BRX = [0.0115, 0.0185, 0.0215, 0.0205, 0.015, 0.0138, 0.0128];
const BRY = [0.0155, 0.033, 0.044, 0.043, 0.03, 0.024, 0.0215];
const bodyRadius = (t: number): [number, number] => [interpolate(BT, BRX, t), interpolate(BT, BRY, t)];

const TTS = [0, 0.28, 0.5, 0.75, 1];
const TTR = [0.0138, 0.0088, 0.006, 0.0039, 0.0021];

// side profile of the cranium and upper jaw (x forward, y up, metres from the head origin)
const UPPER = [
  [-0.016, -0.01],
  [-0.022, 0.004],
  [-0.024, 0.02],
  [-0.018, 0.036, "sharp"],
  [-0.006, 0.037],
  [0.01, 0.03],
  [0.024, 0.024],
  [0.04, 0.017],
  [0.056, 0.011],
  [0.064, 0.004, "sharp"],
  [0.064, -0.003, "sharp"],
  [0.04, -0.004],
  [0.01, -0.005],
  [-0.006, -0.008],
];
const LOWER = [
  [-0.012, -0.002],
  [-0.017, -0.012],
  [-0.006, -0.022],
  [0.02, -0.024],
  [0.046, -0.0155],
  [0.061, -0.007, "sharp"],
  [0.0625, -0.0035, "sharp"],
  [0.04, -0.003],
  [0.01, -0.0035],
];
// serrated crest along the casque
const COMB = [
  [-0.021, 0.03],
  [-0.022, 0.045],
  [-0.016, 0.037],
  [-0.014, 0.05],
  [-0.008, 0.04],
  [-0.005, 0.047],
  [0.001, 0.038],
  [0.004, 0.043],
  [0.01, 0.033],
  [0.013, 0.037],
  [0.018, 0.028],
  [0.022, 0.031],
  [0.027, 0.02],
  [0.018, 0.021],
  [0.005, 0.026],
  [-0.008, 0.031],
  [-0.018, 0.029],
];
const BROW: P3[] = [
  [0.009, 0.0108, 0.054],
  [0.0112, 0.015, 0.038],
  [0.0145, 0.0215, 0.022],
  [0.0185, 0.0268, 0.01],
  [0.0165, 0.029, -0.004],
  [0.0105, 0.033, -0.014],
];
const BROW_R = [0.0014, 0.0021, 0.0029, 0.0031, 0.0027, 0.002];

const LEAF: Array<[number, number, number]> = [
  [0, 0, 1],
  [0.14, 0.13, 0],
  [0.38, 0.21, 0],
  [0.66, 0.15, 0],
  [1, 0, 1],
  [0.66, -0.15, 0],
  [0.38, -0.21, 0],
  [0.14, -0.13, 0],
];

// ------------------------------------------------------------------ model
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "panther_chameleon" });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const GOLD = "#ffc83a";
  const CLAW = "#2c2622";
  const GULAR = "#f0ecd0";
  const toeFore = "#10a89a";
  const toeHind = "#dd8420";

  // ---------------------------------------------------------- skeleton: root, spine, neck, head, jaw
  const root = b.joint("root", { at: [0, 0.03, 0] });
  b.joint("twig", { parent: root, at: [0, 0.05, 0] });

  const sp: P3[] = [
    [0, Y(0.102), -0.075],
    [0, Y(0.106), -0.035],
    [0, Y(0.108), 0.005],
    [0, Y(0.106), 0.045],
    [0, Y(0.1), 0.08],
    [0, Y(0.098), 0.108],
  ];
  const spine = b.chain("spine", catmull(sp.slice(0, 4)), {
    parent: root,
    up: [0, 1, 0],
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull(sp.slice(3)), {
    parent: spine.joints[2],
    up: [0, 1, 0],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: sp[5], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, HY - 0.006, HZ - 0.01], dir: [0, 0, 1], role: "jaw" });

  // ---------------------------------------------------------- trunk
  const body = b.sweep(catmull(sp), bodyRadius, {
    color: skin,
    bone: [spine, neck],
    up: [0, 1, 0],
    sides: 10,
    name: "body",
  });

  // dorsal spines
  const spikeGeo = new THREE.ConeGeometry(0.0034, 0.0105, 4);
  for (let i = 0; i < 17; i++) {
    const t = 0.05 + i * 0.055;
    const hp = body.at(t, 0, 0);
    const s = 0.55 + 0.65 * Math.sin(Math.PI * clamp01(t));
    b.stick(spikeGeo, GOLD, hp, { embed: 0.35, scale: s, flat: true, name: "dorsalSpine" });
  }

  // ---------------------------------------------------------- tail: lead-in then a tight coil in the YZ plane
  const TY = Y(0.1);
  const R0 = 0.036;
  const Q = 0.5;
  const TURNS = 1.75;
  const CZ = -0.138;
  const CY = TY + R0;
  const tailPts: P3[] = [
    [0, TY, -0.072],
    [0, TY, -0.09],
    [0, TY, -0.108],
    [0, TY, -0.124],
  ];
  const coilSteps = Math.round(TURNS * 24);
  for (let i = 0; i <= coilSteps; i++) {
    const th = (i / coilSteps) * TURNS * Math.PI * 2;
    const r = R0 * Math.pow(Q, th / (2 * Math.PI));
    tailPts.push([0, CY - r * Math.cos(th), CZ - r * Math.sin(th)]);
  }
  const tail = b.chain("tail", catmull(tailPts), { parent: spine.joints[0], count: 12, role: "tail" });
  b.sweep(tail, (t: number) => interpolate(TTS, TTR, t), { color: tailSkin, sides: 7, name: "tail" });

  // ---------------------------------------------------------- feet and limbs
  function foot(side: 1 | -1, zf: number, front: boolean, joint: string, toeColor: string) {
    const [tx, ty, tr] = twigC(zf);
    const Rw = tr + 0.0048;
    const at = (deg: number, z: number, R: number): P3 => {
      const a = (deg * Math.PI) / 180;
      return [tx + side * R * Math.cos(a), ty + R * Math.sin(a), z];
    };
    const radial = (deg: number) => {
      const a = (deg * Math.PI) / 180;
      return V(side * Math.cos(a), Math.sin(a), 0);
    };
    // one mitten wraps over the top of the twig, the other hangs under it
    const bundles = [
      { degs: [36, 68, 102, 138, 172, 205], toes: front ? 3 : 2 },
      { degs: [18, -12, -46, -80, -114], toes: front ? 2 : 3 },
    ];
    for (const bundle of bundles) {
      const hw = 0.0023 * bundle.toes;
      const path = catmull(bundle.degs.map((d) => at(d, zf, Rw)));
      b.sweep(path, (t: number): [number, number] => [hw * (1 - 0.14 * t), 0.0034 - 0.0011 * t], {
        color: toeColor,
        section: "box",
        bone: joint,
        up: radial(bundle.degs[0]),
        name: "toes",
      });
      const end = path.at(1);
      const tan = path.tangentAt(1, true);
      const rad = end.clone().sub(V(tx, ty, zf));
      rad.z = 0;
      rad.normalize();
      const cd = tan.clone().addScaledVector(rad, -0.5).normalize();
      for (let k = 0; k < bundle.toes; k++) {
        const zo = (k - (bundle.toes - 1) / 2) * 0.0046;
        const base = end.clone().add(V(0, 0, zo)).addScaledVector(cd, -0.0025);
        b.spike(base, cd, 0.0095, 0.0021, { color: CLAW, bone: joint, sides: 4, name: "claw" });
      }
    }
    const w = at(30, zf, Rw + 0.0022);
    b.part(new THREE.SphereGeometry(1, 7, 5), skin, { at: w, bone: joint, scale: [0.0085, 0.0066, 0.0088] });
  }

  function limb(side: 1 | -1, front: boolean, zf: number) {
    const sd = side === 1 ? "L" : "R";
    const [tx, ty, tr] = twigC(zf);
    const Rw = tr + 0.0048;
    const a30 = Math.PI / 6;
    const W: P3 = [tx + side * (Rw + 0.0022) * Math.cos(a30), ty + (Rw + 0.0022) * Math.sin(a30), zf];
    const S: P3 = front ? [side * 0.02, Y(0.09), 0.048] : [side * 0.021, Y(0.088), -0.052];
    const m: P3 = [(S[0] + W[0]) / 2, (S[1] + W[1]) / 2, (S[2] + W[2]) / 2];
    const E: P3 = front
      ? [m[0] + side * 0.03, m[1] + 0.006, m[2] - 0.01]
      : [m[0] + side * 0.03, m[1] + 0.004, m[2] + 0.012];
    const names = front ? [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`] : [`hip${sd}`, `knee${sd}`, `ankle${sd}`];
    const chain = b.chain(front ? `arm${sd}` : `leg${sd}`, polyline([S, E, W]), {
      parent: front ? spine.joints[2] : spine.joints[0],
      names,
      role: front ? "arm" : "leg",
    });
    b.sweep(chain, front ? [0.01, 0.0085, 0.0066, 0.0052] : [0.0115, 0.0095, 0.007, 0.0054], {
      color: skin,
      sides: 6,
      name: front ? "arm" : "leg",
    });
    b.part(new THREE.SphereGeometry(front ? 0.0112 : 0.0125, 7, 5), skin, { at: S, bone: names[0] });
    foot(side, zf, front, names[2], front ? toeFore : toeHind);
  }
  // diagonal walking gait: left fore + right hind forward
  limb(1, true, 0.1);
  limb(-1, true, 0.062);
  limb(1, false, -0.078);
  limb(-1, false, -0.034);

  // ---------------------------------------------------------- head
  const hw = (x: number, y: number, z: number): P3 => [x, HY + y, HZ + z];
  const cone = (pos: P3, dir: P3, r: number, h: number, color: string, bone: string) =>
    b.part(new THREE.ConeGeometry(r, h, 4), color, { at: pos, dir, bone, flat: true });

  b.extrude(UPPER, {
    color: skin,
    at: [0, HY, HZ],
    thickness: [0.04, 0.014],
    bevel: 0.005,
    smoothing: 1,
    bone: "head",
    name: "head",
  });
  b.extrude(LOWER, {
    color: skin,
    at: [0, HY, HZ],
    thickness: [0.02, 0.034],
    bevel: 0.003,
    smoothing: 1,
    bone: "jaw",
    name: "lowerJaw",
  });
  b.extrude(COMB, {
    color: crestPaint,
    at: [0, HY, HZ],
    thickness: [0.007, 0.0025],
    bone: "head",
    name: "crest",
  });

  // gular crest under the chin
  for (let i = 0; i < 6; i++) {
    const zl = -0.004 + i * 0.0075;
    const yl = zl <= 0.02 ? -0.0238 : -0.0238 + (zl - 0.02) * (0.0095 / 0.026);
    cone(hw(0, yl, zl), [0, -1, 0.35], 0.0022, 0.0068, GULAR, "jaw");
  }

  // rostral bumps and nostrils
  const bumps: Array<[number, number, number, number]> = [
    [0.017, 0.04, 0.0026, 0.0085],
    [0.0125, 0.0515, 0.0022, 0.007],
    [0.0085, 0.06, 0.0018, 0.0055],
  ];
  for (const [y, z, r, h] of bumps) cone(hw(0, y, z), [0, 1, 0.45], r, h, GOLD, "head");
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0017, 5, 4), "#17302e", { at: hw(side * 0.0085, 0.0075, 0.0595), bone: "head" });
  }

  // brow ridges with little horns
  for (const side of [1, -1]) {
    b.sweep(catmull(BROW.map(([x, y, z]) => hw(side * x, y, z))), BROW_R, {
      color: skin,
      sides: 5,
      bone: "head",
      name: "brow",
    });
    for (const k of [2, 3, 4]) {
      const [x, y, z] = BROW[k];
      cone(hw(side * x, y + 0.002, z), [side * 0.35, 1, -0.1], 0.0018, 0.006, GOLD, "head");
    }
  }

  // ---------------------------------------------------------- turret eyes, each looking its own way
  function eye(side: 1 | -1, gaze: P3, name: string) {
    const E = V(side * 0.0168, HY + 0.012, HZ + 0.012);
    const g = V(gaze[0], gaze[1], gaze[2]).normalize();
    b.joint(name, { parent: head, at: E, dir: g });
    const along = (d: number) => E.clone().addScaledVector(g, d);
    b.part(new THREE.SphereGeometry(0.0128, 9, 7), skin, { at: E, bone: name });
    b.part(new THREE.TorusGeometry(0.0064, 0.0017, 5, 10), "#0d8a82", {
      at: along(0.0118),
      dir: g,
      axis: "z",
      bone: name,
    });
    b.part(new THREE.CylinderGeometry(0.0057, 0.0057, 0.0016, 10), "#d58a22", { at: along(0.0122), dir: g, bone: name });
    b.part(new THREE.CylinderGeometry(0.0029, 0.0029, 0.0016, 8), "#0a0a0c", { at: along(0.013), dir: g, bone: name });
    const u = new THREE.Vector3().crossVectors(g, V(0, 1, 0)).normalize();
    const w = new THREE.Vector3().crossVectors(u, g).normalize();
    const spark = along(0.0139).addScaledVector(w, 0.0012).addScaledVector(u, 0.0008);
    b.part(new THREE.SphereGeometry(0.00075, 4, 3), "#ffffff", { at: spark, bone: name });
  }
  eye(1, [0.55, 0.15, 0.82], "eyeL"); // looking ahead
  eye(-1, [-0.8, 0.12, -0.58], "eyeR"); // swivelled backward

  // ---------------------------------------------------------- the twig
  const twigPts: P3[] = [];
  for (let i = 0; i <= 18; i++) {
    const z = -TW + i * 0.04;
    const c = twigC(z);
    twigPts.push([c[0], c[1], z]);
  }
  const BARKS = ["#6c4b31", "#7b5937", "#5c4029"];
  const bands: Array<[number, string]> = [
    [0.1, BARKS[1]],
    [0.22, BARKS[2]],
    [0.34, BARKS[0]],
    [0.47, BARKS[1]],
    [0.6, BARKS[2]],
    [0.72, BARKS[0]],
    [0.85, BARKS[1]],
    [1, BARKS[2]],
  ];
  const twig = b.sweep(catmull(twigPts), (t: number) => twigR(-TW + 2 * TW * t), {
    color: BARKS[0],
    bands,
    bone: "twig",
    sides: 8,
    name: "twig",
  });

  // knots on the underside and lichen patches
  const knotGeo = new THREE.IcosahedronGeometry(0.008, 0);
  for (const [t, ang] of [
    [0.1, 200],
    [0.28, 150],
    [0.5, 190],
    [0.74, 170],
    [0.9, 120],
  ] as Array<[number, number]>) {
    b.stick(knotGeo, "#5a3e28", twig.at(t, ang, 0), { embed: 0.45, scale: [1, 0.75, 1], flat: true, name: "knot" });
  }
  const lichenGeo = new THREE.SphereGeometry(0.0055, 6, 4);
  for (let i = 0; i < 9; i++) {
    const t = 0.04 + rand() * 0.92;
    const ang = 20 + rand() * 320;
    b.stick(lichenGeo, i % 2 ? "#a7b58a" : "#c3cba4", twig.at(t, ang, 0), {
      embed: 0.45,
      scale: [1.4 + rand() * 0.6, 0.45, 1.1],
      flat: true,
      name: "lichen",
    });
  }

  // side branches with leaves
  const LEAF_COL = ["#58a83c", "#7bbf48", "#3f8d3d"];
  function leaf(at: P3, dir: P3, len: number, roll: number, color: string) {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), d);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize().applyAxisAngle(d, roll);
    const pts = LEAF.map(([x, y, s]) => (s ? [x * len, y * len, "sharp"] : [x * len, y * len]));
    b.extrude(pts, { color, at, x: d, y: side, thickness: 0.0016, smoothing: 1, bone: "twig", name: "leaf" });
    const tip = V(at[0], at[1], at[2]).addScaledVector(d, len * 0.88);
    b.rod(at, tip, [0.0009, 0.0003], { color: "#a8d47a", sides: 4, bone: "twig", name: "vein" });
  }
  const bp = (z: number, dx: number, dy: number, dz: number): P3 => {
    const c = twigC(z);
    return [c[0] + dx, c[1] + dy, z + dz];
  };

  // front branch (to the animal's left, ahead of its snout)
  const br1: P3[] = [
    bp(0.2, 0, 0, 0),
    bp(0.2, 0.008, 0.02, 0.012),
    bp(0.2, 0.026, 0.04, 0.024),
    bp(0.2, 0.05, 0.056, 0.034),
    bp(0.2, 0.078, 0.066, 0.046),
  ];
  b.sweep(catmull(br1), [0.0062, 0.0048, 0.0036, 0.0022], { color: BARKS[1], bone: "twig", sides: 6, name: "branch" });
  const sub1: P3[] = [br1[2], bp(0.2, 0.04, 0.058, 0.05), bp(0.2, 0.046, 0.08, 0.066)];
  b.sweep(catmull(sub1), [0.0034, 0.0025, 0.0014], { color: BARKS[2], bone: "twig", sides: 5, name: "twiglet" });
  leaf(br1[4], [0.8, 0.25, 0.55], 0.075, 0.3, LEAF_COL[0]);
  leaf(br1[3], [0.9, 0.1, -0.1], 0.065, -0.5, LEAF_COL[1]);
  leaf(br1[2], [-0.3, 0.2, 0.9], 0.06, 0.2, LEAF_COL[2]);
  leaf(sub1[2], [0.2, 0.5, 0.9], 0.06, 0.6, LEAF_COL[1]);

  // rear branch (to the animal's right, behind the coil)
  const br2: P3[] = [
    bp(-0.27, 0, 0, 0),
    bp(-0.27, -0.01, 0.02, -0.012),
    bp(-0.27, -0.03, 0.038, -0.026),
    bp(-0.27, -0.056, 0.05, -0.04),
    bp(-0.27, -0.082, 0.056, -0.05),
  ];
  b.sweep(catmull(br2), [0.0066, 0.005, 0.0036, 0.0022], { color: BARKS[2], bone: "twig", sides: 6, name: "branch" });
  leaf(br2[4], [-0.8, 0.2, -0.5], 0.075, -0.3, LEAF_COL[1]);
  leaf(br2[3], [-0.9, 0.05, 0.2], 0.065, 0.5, LEAF_COL[0]);
  leaf(br2[2], [0.2, 0.25, -0.9], 0.06, -0.2, LEAF_COL[2]);

  // a couple of leaves at the twig tips
  leaf(bp(0.335, 0, 0.004, 0), [0.25, 0.45, 0.9], 0.05, 0.4, LEAF_COL[0]);
  leaf(bp(-0.335, 0, 0.004, 0), [-0.2, 0.4, -0.9], 0.05, -0.4, LEAF_COL[1]);

  return b.root;
}
