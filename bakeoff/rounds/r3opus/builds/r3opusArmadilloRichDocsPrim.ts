import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  limb,
  paint,
  scales,
  mottle,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylized nine-banded armadillo: overlapping shingled shell bands in dusty pinkish-tan, scapular and pelvic shields, a pointy snout with a hinged jaw, tall leathery ears, beady eyes, clawed feet, a ringed armoured tail and coarse pale hairs poking out between the bands.",
};

const D = Math.PI / 180;

// Palette
const SHELL = "#c9a088";
const SHELL_MID = "#bd927c";
const SHELL_LIGHT = "#dbb79c";
const SHELL_DARK = "#7e5a4c";
const SHELL_EDGE = "#ecd2b6";
const SKIN = "#c79a8f";
const SKIN_DARK = "#9a6e68";
const CLAW = "#3a2e2a";
const EYE = "#120c0c";
const WHITE = "#ffffff";
const EAR = "#a87a72";
const EAR_IN = "#e0a6a0";
const NOSE = "#5e3a3c";
const HAIR = "#f3e7d2";

function smooth(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function fract(x: number) {
  return x - Math.floor(x);
}

// Open partial frustum along +Z (front = rf), centred on the top.
function bandGeo(rf: number, rb: number, len: number, cover: number) {
  const g = new THREE.CylinderGeometry(rf, rb, len, 24, 1, true, Math.PI - cover / 2, cover);
  g.rotateX(Math.PI / 2);
  return g;
}
// Partial torus ridge in the XY plane, arc centred on the top.
function ridgeGeo(R: number, tube: number, cover: number) {
  const g = new THREE.TorusGeometry(R, tube, 4, 24, cover);
  g.rotateZ(Math.PI / 2 - cover / 2);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "armadillo", paintSize: 2048 });

  // ---------------- Paints & textures ----------------
  const skinPaint = mottle(SKIN, SKIN_DARK, { size: 0.03, seed: 2 });
  const legPaint = scales(SKIN, SKIN_DARK, { size: 0.007, seed: 5 });
  const plate = scales([SHELL, SHELL_LIGHT, SHELL_MID], SHELL_DARK, { size: 0.013, seed: 3 });
  const tailPaint = scales([SHELL, SHELL_MID], SHELL_DARK, { size: 0.008, seed: 9 });
  const bandPaint = paint((_p, _n, s) => {
    const u = s[0] * 40;
    const fu = fract(u);
    if (fu < 0.14 || s[1] < 0.2) return SHELL_DARK;
    if (s[1] > 0.85) return SHELL_LIGHT;
    const k = Math.floor(u) % 3;
    return k === 0 ? SHELL : k === 1 ? SHELL_MID : SHELL_LIGHT;
  });
  const hairTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48">
      <path d="M8 48 Q6 30 9 16 T7 1" stroke="#ffffff" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M5 48 Q3 36 2 22" stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M11 48 Q13 38 14 26" stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.14, -0.12], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.142, -0.06],
      [0, 0.142, 0.04],
      [0, 0.14, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.14, 0.12],
      [0, 0.13, 0.19],
    ],
    { parent: spine, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.13, 0.19], dir: [0, -0.33, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.012, -0.011]),
    aim: head.local([0, 0.13, -0.018]),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.12, -0.17],
      [0, 0.1, -0.29],
      [0, 0.07, -0.42],
      [0, 0.045, -0.56],
    ]),
    { parent: hips, count: 6, names: (i: number) => `tail${i + 1}`, role: "tail" },
  );

  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const boneAt = (z: number) => (z < -0.06 ? hips : z < 0.04 ? spine1 : spine2);

  // ---------------- Body (skin under the shell) ----------------
  const z0 = -0.12;
  const bodyLen = 0.31;
  const tz = (z: number) => (z - z0) / bodyLen;
  const bodyPath = catmull([
    [0, 0.14, -0.12],
    [0, 0.142, -0.02],
    [0, 0.142, 0.07],
    [0, 0.138, 0.13],
    [0, 0.13, 0.19],
  ]);
  const body = b.sweep(
    bodyPath,
    (t: number) => {
      const k = smooth(tz(0.11), tz(0.185), t);
      return [0.106 * (1 - k) + 0.034 * k, 0.096 * (1 - k) + 0.031 * k];
    },
    {
      bone: [hips, spine, neck],
      color: skinPaint,
      sectors: [[-118, 118, SHELL_DARK, 0, tz(0.15)]],
      name: "body",
    },
  );

  // ---------------- Shell ----------------
  const CY = 0.142;
  const SY = 0.9;
  const COVER = 236 * D;
  const shellAt = (z: number) => [0, CY, z];

  // Scapular shield (front)
  {
    const zb = 0.055;
    const zf = 0.157;
    b.part(bandGeo(0.095, 0.122, zf - zb, COVER), plate, {
      at: shellAt((zf + zb) / 2),
      bone: spine2,
      scale: [1, SY, 1],
      name: "scapularShield",
    });
    b.part(ridgeGeo(0.122, 0.0035, COVER), SHELL_EDGE, {
      at: shellAt(zb + 0.0015),
      bone: spine2,
      scale: [1, SY, 1],
      name: "scapularRidge",
    });
    b.part(ridgeGeo(0.095, 0.0042, COVER), SHELL_EDGE, {
      at: shellAt(zf),
      bone: spine2,
      scale: [1, SY, 1],
      name: "scapularLip",
    });
  }

  // Nine bands, shingled toward the back
  const bandW = 0.125 / 9;
  for (let k = 0; k < 9; k++) {
    const zf = 0.06 - k * bandW;
    const zb = zf - bandW - 0.004;
    const bulge = 1 + 0.025 * Math.sin((Math.PI * (k + 0.5)) / 9);
    const rf = 0.112 * bulge;
    const rb = 0.121 * bulge;
    const zc = (zf + zb) / 2;
    const bone = boneAt(zc);
    b.part(bandGeo(rf, rb, zf - zb, COVER), bandPaint, {
      at: shellAt(zc),
      bone,
      scale: [1, SY, 1],
      name: `band${k + 1}`,
    });
    b.part(ridgeGeo(rb, 0.0032, COVER), SHELL_EDGE, {
      at: shellAt(zb + 0.0015),
      bone,
      scale: [1, SY, 1],
      name: `bandRidge${k + 1}`,
    });

    // coarse pale hairs poking out between the bands
    const frames = [];
    for (let j = 0; j < 7; j++) {
      const jitter = fract(Math.sin(k * 12.9898 + j * 78.233) * 43758.5453) - 0.5;
      const phi = (-100 + ((j + 0.5) * 200) / 7 + jitter * 18) * D;
      const R = rb + 0.001;
      frames.push(
        frame(
          [R * Math.sin(phi), CY + SY * R * Math.cos(phi), zb + 0.001],
          [Math.sin(phi), Math.cos(phi), -0.15],
        ),
      );
    }
    b.cards(frames, hairTex, {
      size: [0.012, 0.03],
      lean: 35,
      bend: 20,
      flow: [0, 0, -1],
      vary: 0.35,
      spin: 20,
      rng: rng(100 + k),
      bone,
      color: HAIR,
    });
  }

  // Pelvic shield (rear) with a domed rump cap
  {
    const zf = -0.064;
    const zb = -0.17;
    b.part(bandGeo(0.11, 0.118, zf - zb, COVER), plate, {
      at: shellAt((zf + zb) / 2),
      bone: hips,
      scale: [1, SY, 1],
      name: "pelvicShield",
    });
    const cap = new THREE.SphereGeometry(0.118, 22, 7, Math.PI / 2 - COVER / 2, COVER, 0, Math.PI / 2);
    cap.rotateX(-Math.PI / 2);
    b.part(cap, plate, { at: shellAt(zb), bone: hips, scale: [1, SY, 0.55], name: "pelvicCap" });
  }

  // Skirt trim along the lower shell edge
  for (const s of [1, -1]) {
    const sa = Math.sin(118 * D);
    const ca = Math.cos(118 * D);
    const prof: [number, number][] = [
      [-0.212, 0.088],
      [-0.17, 0.118],
      [-0.065, 0.112],
      [0.0, 0.12],
      [0.056, 0.121],
      [0.11, 0.108],
      [0.156, 0.095],
    ];
    const pts = prof.map(([z, R]) => [s * R * sa, CY + SY * R * ca, z]);
    b.sweep(catmull(pts), 0.0045, { bone: [hips, spine], color: SHELL_EDGE, name: `skirt${s > 0 ? "L" : "R"}` });
  }

  // Belly hairs
  {
    const belly = b.surface(body).scatter(45, {
      rng: rng(11),
      minDist: 0.025,
      filter: (h) => h.n.y < -0.35 && h.at.z < 0.12,
    });
    b.cards(belly, hairTex, {
      size: [0.01, 0.024],
      lean: 30,
      bend: 15,
      flow: [0, 0, -1],
      vary: 0.3,
      spin: 25,
      rng: rng(12),
      color: HAIR,
    });
  }

  // ---------------- Head ----------------
  const skull = b.loft(
    [
      { at: head.local([0, -0.015, 0.02]), w: 0.072, h: 0.062 },
      { at: head.local([0, 0.035, 0.017]), w: 0.062, h: 0.05 },
      { at: head.local([0, 0.085, 0.008]), w: 0.034, h: 0.03 },
      { at: head.local([0, 0.14, 0.003]), w: 0.017, h: 0.017 },
    ],
    { bone: head, color: skinPaint, name: "skull" },
  );
  b.loft(
    [
      { at: jaw.local([0, 0, -0.002]), w: 0.05, h: 0.022 },
      { at: jaw.local([0, 0.06, -0.002]), w: 0.032, h: 0.016 },
      { at: jaw.local([0, 0.115, -0.001]), w: 0.012, h: 0.008 },
    ],
    { bone: jaw, color: SKIN, name: "jawLower" },
  );

  // Head shield plate
  b.part(new THREE.SphereGeometry(1, 12, 8), plate, {
    at: head.local([0, 0.04, 0.037]),
    quat: head.quat,
    bone: head,
    scale: [0.03, 0.058, 0.012],
    name: "headShield",
  });

  // Nose
  b.part(new THREE.SphereGeometry(0.0095, 8, 6), NOSE, {
    at: head.local([0, 0.148, 0.003]),
    bone: head,
    scale: [1, 0.85, 0.9],
    name: "nose",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0022, 5, 4), EYE, {
      at: head.local([s * 0.0038, 0.156, 0.004]),
      bone: head,
      name: `nostril${s > 0 ? "R" : "L"}`,
    });

  // Eyes
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.nearest(head.local([-s * 0.03, 0.03, 0.024]));
    b.stick(new THREE.SphereGeometry(0.0085, 8, 6), SKIN_DARK, hit, { embed: 0.55, bone: head, name: `lid${s > 0 ? "L" : "R"}` });
    const eye = b.stick(new THREE.SphereGeometry(0.0062, 8, 6), EYE, hit, { embed: 0.15, bone: head, name: `eye${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(0.0019, 5, 4), WHITE, {
      at: eye.local([0.0015, 0.0058, 0.0018]),
      bone: head,
      name: `glint${s > 0 ? "L" : "R"}`,
    });
  }

  // Tall leathery ears
  const earPaint = paint((_p, _n, s) => {
    const w = 0.009 * (1 - s[1] / 0.065);
    return Math.abs(s[0]) < w && s[1] > 0.008 && s[1] < 0.05 ? EAR_IN : EAR;
  });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.014, 0],
        [0.014, 0],
        [0.019, 0.022],
        [0.014, 0.045],
        [0.003, 0.062, "sharp"],
        [-0.009, 0.05],
        [-0.017, 0.024],
      ],
      {
        at: head.local([-s * 0.021, -0.005, 0.035]),
        x: [s, 0, 0.45],
        y: [s * 0.35, 1, -0.25],
        thickness: 0.004,
        bevel: 0.0015,
        smoothing: 1,
        color: earPaint,
        bone: head,
        name: `ear${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------- Legs ----------------
  const legs = [
    { key: "F", root: [0.06, 0.1, 0.1], foot: [0.07, 0.018, 0.11], lens: [0.05, 0.048], bend: [0, 0, -1], parent: spine2, claws: 4, names: ["shoulder", "elbow", "wrist"] },
    { key: "H", root: [0.065, 0.105, -0.12], foot: [0.072, 0.018, -0.13], lens: [0.052, 0.05], bend: [0, 0, 1], parent: hips, claws: 5, names: ["hip", "knee", "ankle"] },
  ];
  for (const L of legs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const root = [s * L.root[0], L.root[1], L.root[2]];
      const foot = [s * L.foot[0], L.foot[1], L.foot[2]];
      const pts = limb(root, foot, L.lens, [L.bend]);
      const chain = b.chain(`leg${L.key}${side}`, pts, {
        parent: L.parent,
        names: L.names.map((n) => `${n}${side}`),
        role: "leg",
      });
      b.sweep(chain, [0.023, 0.015], { color: legPaint, name: `leg${L.key}${side}` });
      const tip = chain.tip ?? chain.joints[chain.joints.length - 1];
      const fx = foot[0];
      const fz = foot[2];
      b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_DARK, {
        at: [fx, 0.011, fz + 0.01],
        bone: tip,
        scale: [0.019, 0.011, 0.026],
        name: `foot${L.key}${side}`,
      });
      const n = L.claws;
      for (let i = 0; i < n; i++) {
        const o = i - (n - 1) / 2;
        b.spike(
          [fx + o * 0.0075, 0.012, fz + 0.028 - Math.abs(o) * 0.004],
          [o * 0.25 + s * 0.08, -0.35, 1],
          L.key === "F" ? 0.026 - Math.abs(o) * 0.003 : 0.02 - Math.abs(o) * 0.002,
          0.0035,
          { color: CLAW, bone: tip, sides: 6, name: `claw${L.key}${side}${i}` },
        );
      }
    }
  }

  // ---------------- Tail ----------------
  const tailR = (t: number) => 0.032 * Math.pow(1 - t, 1.15) + 0.003;
  b.sweep(tail, tailR, { color: tailPaint, caps: { start: "round", end: "point" }, name: "tail" });
  b.along(tail, 15, (at) => {
    if (at.t > 0.9) return;
    const r = tailR(at.t);
    const g = new THREE.TorusGeometry(r + 0.0008, 0.0022 + r * 0.06, 4, 12);
    g.rotateX(Math.PI / 2);
    b.part(g, SHELL_EDGE, { frame: at, name: "tailRing" });
  });

  return b.root;
}
