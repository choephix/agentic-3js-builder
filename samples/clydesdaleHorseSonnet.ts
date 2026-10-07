import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import type { Path } from "../src/path";
import { mottle, paint } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../kits/toon";

export const meta = {
  name: "Clydesdale Draft Horse",
  description:
    "A towering bay Clydesdale in cel-shaded anime style: white blaze and stockings with long feathered hooves, braided gold hair ties, a teal and gold harness with collar, hames, blinkers, reins, breeching and a glowing Anemo gem.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const COAT_BASE = mottle("#bf5a22", "#983f19", { size: 0.16, contrast: 0.7, seed: 5 });
const COAT = cel(furEdge(COAT_BASE, "#ecab6e", { level: -0.55, teeth: 0.2, period: 0.05 }));
const COAT_PLAIN = cel(COAT_BASE);
const WHITE = cel("#fff8ea", "#d3d5f1");
const PINK = cel("#f5aca0", "#c4708c");
const MUZZLE = cel("#4d2b30", "#2a1832");
const EAR_TIP = cel("#2d1b2c", "#170f2a");
const HAIR_A = cel("#42305f", "#21183c");
const HAIR_B = cel("#5f4688", "#2f2354");
const HOOF = cel(
  paint((p) => (Math.abs(((p.x * 90 + p.z * 90) % 3) - 1.5) < 0.18 ? "#d4bd92" : "#ecd9b4")),
  "#a89fc0",
);
const HOOF_DARK = cel("#c9b088", "#8f86ac");
const DARK_BAY = cel("#4e2620", "#2a1530");
const LEATHER = cel("#92471f", "#552330");
const LEATHER_D = cel("#5c2d1c", "#2e1834");
const GOLD = cel("#ffd35a", "#cf7e2c");
const STEEL = cel("#c3cfe8", "#6a76a8");
const TEAL = cel("#22aab8", "#1a679b");
const GEM = "#7ff6e8";

// ---------------------------------------------------------------- textures
const lockWhite = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <path d="M3 120 C0 92 4 58 12 20 C17 46 24 40 30 2 C36 38 43 52 50 26 C58 62 60 94 57 120 Z" fill="#fffaf0"/>
  <path d="M30 2 C36 38 43 52 50 26 C58 62 60 94 57 120 L32 120 C36 84 34 40 30 2 Z" fill="#c9cdf0"/>
  <path d="M12 118 C10 90 14 60 12 26" fill="none" stroke="#dfe1f6" stroke-width="1.6"/>
  <path d="M22 118 C20 86 26 60 29 14" fill="none" stroke="#e6e7f8" stroke-width="1.6"/>
  <path d="M44 118 C46 90 44 70 49 34" fill="none" stroke="#a6acdc" stroke-width="1.6"/>
  <path d="M3 120 C0 92 4 58 12 20" fill="none" stroke="#9ca3d6" stroke-width="1.4"/>
</svg>`,
  { size: 192 },
);
const lockWhite2 = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 120">
  <path d="M2 120 C0 88 6 50 14 12 C20 40 26 30 34 4 C38 44 46 70 46 120 Z" fill="#fffaf0"/>
  <path d="M34 4 C38 44 46 70 46 120 L28 120 C32 84 34 40 34 4 Z" fill="#c4c9ee"/>
  <path d="M10 118 C9 84 15 50 14 20" fill="none" stroke="#dfe1f6" stroke-width="1.6"/>
  <path d="M22 118 C22 80 28 54 33 16" fill="none" stroke="#a6acdc" stroke-width="1.6"/>
</svg>`,
  { size: 160 },
);
const lockDark = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <path d="M3 120 C0 92 4 58 12 20 C17 46 24 40 30 2 C36 38 43 52 50 26 C58 62 60 94 57 120 Z" fill="#4a3770"/>
  <path d="M30 2 C36 38 43 52 50 26 C58 62 60 94 57 120 L32 120 C36 84 34 40 30 2 Z" fill="#271c42"/>
  <path d="M14 118 C12 90 16 60 13 26" fill="none" stroke="#7660a8" stroke-width="1.6"/>
  <path d="M24 118 C22 86 28 60 30 12" fill="none" stroke="#7fe9dd" stroke-width="1.5"/>
  <path d="M44 118 C46 90 44 70 49 34" fill="none" stroke="#3d2d62" stroke-width="1.6"/>
</svg>`,
  { size: 192 },
);
const tassel = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 80">
  <rect x="13" y="72" width="4" height="8" fill="#ffcf55"/>
  <circle cx="15" cy="65" r="6" fill="#ffd35a"/>
  <circle cx="13" cy="63" r="2" fill="#fff0a6"/>
  <rect x="9" y="53" width="12" height="5" rx="1" fill="#e9a23a"/>
  <path d="M9 54 C2 44 1 24 3 2 L8 9 L11 0 L15 9 L19 0 L22 9 L27 2 C29 24 28 44 21 54 Z" fill="#d9483b"/>
  <path d="M15 54 L15 9 L19 0 L22 9 L27 2 C29 24 28 44 21 54 Z" fill="#a3283f"/>
  <path d="M7 48 C5 34 5 20 6 8" fill="none" stroke="#f07a62" stroke-width="1.4"/>
  <rect x="4" y="30" width="22" height="4" fill="#ffcf55"/>
</svg>`,
  { size: 160 },
);
const rosette = (() => {
  let petals = "";
  for (let i = 0; i < 12; i++)
    petals += `<ellipse cx="32" cy="13" rx="4.6" ry="8.5" fill="${i % 2 ? "#ffe28a" : "#ffc447"}" transform="rotate(${i * 30} 32 32)"/>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="31" fill="#b8702a"/>
  <circle cx="32" cy="32" r="28.5" fill="#ffcf55"/>
  ${petals}
  <circle cx="32" cy="32" r="13" fill="#b8702a"/>
  <circle cx="32" cy="32" r="11" fill="#1a8aa6"/>
  <circle cx="32" cy="32" r="7.5" fill="#35d3c4"/>
  <circle cx="29" cy="29" r="2.6" fill="#dffff8"/>
</svg>`,
    { size: 192 },
  );
})();
const cloth = (() => {
  let spiral = "";
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const a = i * 0.34;
    const r = 1.2 + i * 0.3;
    d += `${i ? "L" : "M"}${(62 + Math.cos(a) * r).toFixed(1)} ${(55 + Math.sin(a) * r).toFixed(1)} `;
  }
  spiral = `<path d="${d}" fill="none" stroke="#ffdf7a" stroke-width="1.8" stroke-linecap="round"/>`;
  let edge = "";
  for (let i = 0; i < 9; i++) {
    const x = 18 + i * 11;
    edge += `<path d="M${x} 7 l4 2.4 l-4 2.4 l-4 -2.4 Z M${x} 99 l4 2.4 l-4 2.4 l-4 -2.4 Z" fill="#ffd35a"/>`;
  }
  for (let i = 0; i < 7; i++) {
    const y = 20 + i * 11;
    edge += `<path d="M7 ${y} l2.4 4 l-2.4 4 l-2.4 -4 Z M117 ${y} l2.4 4 l-2.4 4 l-2.4 -4 Z" fill="#ffd35a"/>`;
  }
  const corner = (cx: number, cy: number, sx: number, sy: number) =>
    `<path d="M${cx} ${cy + sy * 26} C${cx} ${cy + sy * 6} ${cx + sx * 6} ${cy} ${cx + sx * 26} ${cy} M${cx + sx * 6} ${cy + sy * 6} C${cx + sx * 6} ${cy + sy * 16} ${cx + sx * 16} ${cy + sy * 6} ${cx + sx * 12} ${cy + sy * 12}" fill="none" stroke="#ffcf55" stroke-width="2" stroke-linecap="round"/><circle cx="${cx + sx * 9}" cy="${cy + sy * 9}" r="2.4" fill="#7ff6e8"/>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 110">
  <rect x="1.5" y="1.5" width="121" height="107" rx="10" fill="#1f9fb3" stroke="#ffcf55" stroke-width="3"/>
  <rect x="5" y="5" width="114" height="100" rx="7" fill="none" stroke="#ffe28a" stroke-width="1.4"/>
  <rect x="13" y="13" width="98" height="84" rx="4" fill="#197fa4"/>
  <rect x="13" y="13" width="98" height="84" rx="4" fill="none" stroke="#ffcf55" stroke-width="1.6"/>
  ${edge}
  ${corner(18, 18, 1, 1)}${corner(106, 18, -1, 1)}${corner(18, 92, 1, -1)}${corner(106, 92, -1, -1)}
  <circle cx="62" cy="55" r="27" fill="#16688f" stroke="#ffcf55" stroke-width="2.4"/>
  <circle cx="62" cy="55" r="22" fill="none" stroke="#ffe28a" stroke-width="1.2"/>
  ${spiral}
  <circle cx="62" cy="55" r="3" fill="#7ff6e8"/>
  <path d="M62 24 l3 5 l-3 5 l-3 -5 Z M62 76 l3 5 l-3 5 l-3 -5 Z M31 55 l5 -3 l5 3 l-5 3 Z M83 55 l5 -3 l5 3 l-5 3 Z" fill="#ffd35a"/>
</svg>`,
    { size: 512 },
  );
})();
const EYE = animeEye({ iris: "#e8982c", irisLight: "#ffd870", blush: false });

// ---------------------------------------------------------------- head frame (all in model space)
const HEAD_P = new THREE.Vector3(0, 2.08, 1.28);
const MUZ = new THREE.Vector3(0, 1.62, 1.76);
const D = MUZ.clone().sub(HEAD_P).normalize();
const NF = new THREE.Vector3(0, D.z, -D.y);
const hp = (k: number, off = 0, x = 0) =>
  new THREE.Vector3(x, HEAD_P.y + D.y * k + NF.y * off, HEAD_P.z + D.z * k + NF.z * off);
const tab = (ks: number[], vs: number[], k: number) => {
  if (k <= ks[0]) return vs[0];
  for (let i = 1; i < ks.length; i++) {
    if (k <= ks[i]) {
      const f = (k - ks[i - 1]) / (ks[i] - ks[i - 1]);
      return vs[i - 1] + (vs[i] - vs[i - 1]) * f;
    }
  }
  return vs[vs.length - 1];
};
const HK = [0, 0.1, 0.24, 0.36, 0.46, 0.55, 0.62];
const HW = [0.2, 0.22, 0.19, 0.15, 0.13, 0.145, 0.13].map((v) => v * 1.08);
const HH = [0.22, 0.23, 0.2, 0.16, 0.14, 0.14, 0.12].map((v) => v * 1.08);
const HO = [0, 0, 0.006, 0.014, 0.016, 0.01, 0];
const uh = (k: number) => tab(HK, HH, k) / 2;

const headPaint = paint((p, n) => {
  const k = (p.y - HEAD_P.y) * D.y + (p.z - HEAD_P.z) * D.z;
  const facing = n.y * NF.y + n.z * NF.z;
  const half = 0.026 + 0.03 * Math.min(1, Math.max(0, (k - 0.1) / 0.5)) + 0.005 * zigzag(k / 0.035);
  if (facing > 0.25 && Math.abs(p.x) < half && k > 0.03) return k > 0.56 ? PINK : WHITE;
  if (k > 0.5) return MUZZLE;
  return COAT_PLAIN;
});

// ---------------------------------------------------------------- legs
const FRONT = [
  [0.27, 1.38, 0.6],
  [0.29, 1.04, 0.44],
  [0.28, 0.6, 0.53],
  [0.275, 0.24, 0.52],
  [0.275, 0.09, 0.6],
];
const HIND = [
  [0.26, 1.4, -0.62],
  [0.31, 1.04, -0.38],
  [0.28, 0.62, -0.74],
  [0.27, 0.24, -0.66],
  [0.27, 0.09, -0.58],
];
const FRONT_R = [0.13, 0.12, 0.11, 0.094, 0.086, 0.092, 0.062, 0.078, 0.058];
const HIND_R = [0.17, 0.16, 0.13, 0.105, 0.088, 0.082, 0.062, 0.078, 0.058];

export default function build() {
  const b = createBuilder({ name: "clydesdale", paintSize: 2048 });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const studs = (pts: THREE.Vector3[], r: number, color: Fill, bone: Joint) => {
    const geos = pts.map((p) => new THREE.SphereGeometry(r, 5, 3).translate(p.x, p.y, p.z));
    b.part(mergeGeometries(geos), color, { bone, at: [0, 0, 0] });
  };
  const ringPts = (path: Path, n: number, closed = true) =>
    Array.from({ length: n }, (_, i) => path.at(closed ? i / n : (i + 0.5) / n));

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.42, -0.58], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.42, -0.3],
      [0, 1.44, 0.05],
      [0, 1.46, 0.4],
      [0, 1.5, 0.74],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.5, 0.72],
      [0, 1.73, 0.9],
      [0, 1.92, 1.08],
      [0, 2.02, 1.22],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: HEAD_P, aim: MUZ, role: "head" });
  const jawAt = hp(0.1, -0.14, 0);
  const jaw = b.joint("jaw", { parent: head, at: jawAt, aim: hp(0.58, -0.075, 0), role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.62, -1.02],
      [0, 1.62, -1.22],
      [0, 1.45, -1.4],
      [0, 1.18, -1.5],
      [0, 0.88, -1.5],
      [0, 0.58, -1.46],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // ------------------------------------------------------------ body
  const bodyStations: [number, number, number, number][] = [
    [1.04, 1.5, 1.18, 0.26],
    [0.88, 1.62, 1.07, 0.44],
    [0.7, 1.72, 1.02, 0.56],
    [0.4, 1.75, 1.0, 0.64],
    [0.05, 1.69, 1.0, 0.66],
    [-0.3, 1.69, 1.03, 0.66],
    [-0.62, 1.73, 1.06, 0.68],
    [-0.92, 1.68, 1.12, 0.6],
    [-1.14, 1.58, 1.16, 0.42],
  ];
  const body = b.loft(
    bodyStations.map(([z, top, bot, w]) => ({ at: [0, (top + bot) / 2, z], w, h: top - bot })),
    { bone: [hips, spine], color: COAT, sides: 10, name: "body" },
  );
  const bodySkin = b.surface(body);

  // neck
  const neckTube = b.sweep(neck, (t) => [0.19 - 0.1 * t, 0.27 - 0.13 * t], { color: COAT_PLAIN, sides: 10, shift: [0, 0.02], name: "neck" });
  const neckSkin = b.surface(neckTube);

  // muscles over the body: shoulders, haunches, chest, belly
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT_PLAIN, {
      bone: spine.joints[2],
      at: [sx * 0.26, 1.36, 0.58],
      scale: [0.1, 0.22, 0.2],
      name: "shoulder",
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT_PLAIN, {
      bone: hips,
      at: [sx * 0.28, 1.38, -0.66],
      scale: [0.11, 0.24, 0.24],
      name: "haunch",
    });
  }
  // ink creases that carve the shoulder, elbow, stifle and haunch
  for (const sx of [1, -1]) {
    const creases = [
      [[0.2, 1.7, 0.42], [0.31, 1.52, 0.4], [0.35, 1.3, 0.38], [0.31, 1.1, 0.42]],
      [[0.28, 1.5, 0.74], [0.33, 1.36, 0.7], [0.33, 1.2, 0.62]],
      [[0.26, 1.64, -0.32], [0.35, 1.45, -0.3], [0.38, 1.22, -0.26]],
      [[0.2, 1.68, -0.95], [0.33, 1.5, -1.0], [0.3, 1.3, -1.02]],
    ];
    for (const c of creases) {
      const line = bodySkin.drape(catmull(c.map(([x, y, z]) => [x * sx, y, z])), { lift: 0.002 });
      b.sweep(line, [0.004, 0.0015], { color: DARK_BAY, sides: 4, caps: { start: "point", end: "point" }, name: "crease" });
    }
  }

  // ------------------------------------------------------------ head
  const headLoft = b.loft(
    HK.map((k, i) => ({ at: hp(k, HO[i]), w: HW[i], h: HH[i] })),
    { bone: head, color: headPaint, sides: 10, name: "skull" },
  );
  const jawK = [0.1, 0.3, 0.5, 0.6];
  const jawH = [0.1, 0.09, 0.075, 0.065];
  const jawW = [0.15, 0.12, 0.105, 0.1];
  const jawLoft = b.loft(
    jawK.map((k, i) => ({ at: hp(k, -uh(k) + 0.02 - jawH[i] / 2, 0), w: jawW[i], h: jawH[i] })),
    {
      bone: jaw,
      color: paint((p) => {
        const k = (p.y - HEAD_P.y) * D.y + (p.z - HEAD_P.z) * D.z;
        return k > 0.5 ? MUZZLE : COAT_PLAIN;
      }),
      sides: 8,
      name: "mandible",
    },
  );
  const headSkin = b.surface(headLoft);
  const jawSkin = b.surface([headLoft, jawLoft]);

  // cheeks
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT_PLAIN, {
      bone: head,
      at: hp(0.1, -0.05, sx * 0.075),
      scale: [0.05, 0.09, 0.09],
      name: "cheek",
    });
  }

  // nostrils and mouth
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), cel("#2a1830", "#120a20"), {
      bone: head,
      at: hp(0.575, 0.02, sx * 0.047),
      scale: [0.016, 0.026, 0.012],
      dir: [sx * 0.4, 0.5, 0.7],
      name: "nostril",
    });
    const mouth = jawSkin.drape(
      catmull([hp(0.58, -uh(0.58) + 0.01, sx * 0.05), hp(0.45, -uh(0.45) + 0.01, sx * 0.062), hp(0.36, -uh(0.36) + 0.01, sx * 0.07)]),
      { lift: 0.002 },
    );
    b.sweep(mouth, 0.005, { color: INK, sides: 4, bone: head });
    // chin whiskers
    b.spike(hp(0.58, -0.09, sx * 0.03), [0, -0.3, 0.9], 0.04, 0.004, { color: INK, bone: jaw, sides: 4 });
    // eyes
    b.decal(headSkin, EYE, {
      at: hp(0.19, 0.035, sx * 0.108),
      dir: [sx, 0.1, 0.12],
      up: NF,
      size: [0.092, 0.122],
      mirror: sx > 0,
      segments: 12,
      bone: head,
    });
    // brow ridges above the eyes
    b.part(new THREE.SphereGeometry(1, 8, 5), COAT_PLAIN, {
      bone: head,
      at: hp(0.2, 0.095, sx * 0.085),
      scale: [0.035, 0.02, 0.05],
      dir: [sx * 0.5, 0.2, 0.2],
      name: "brow",
    });
  }
  // lower lip pad and upper lip
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE, { bone: jaw, at: hp(0.6, -0.075, 0), scale: [0.045, 0.03, 0.035], name: "chinPad" });

  // ears
  const earOutline: OutlinePoint[] = [
    [-0.034, 0],
    [-0.04, 0.05],
    [-0.024, 0.12],
    [0, 0.178, "sharp"],
    [0.024, 0.12],
    [0.04, 0.05],
    [0.034, 0],
  ];
  const earPaint = (sx: number) =>
    paint((_p, n, s) => {
      const x = Math.abs(s[0]);
      const y = s[1];
      if (y > 0.145) return EAR_TIP;
      const inner = n.z * 1 > 0.45 && x < 0.026 * (1 - Math.pow(Math.max(y, 0) / 0.17, 1.4)) && y > 0.012;
      return inner && sx !== 0 ? PINK : COAT_PLAIN;
    });
  for (const sx of [1, -1]) {
    const yd = V(sx * 0.3, 0.9, 0.3).normalize();
    const xd = new THREE.Vector3().crossVectors(yd, V(0, 0, 1)).normalize();
    b.extrude(earOutline, {
      at: hp(0.0, 0.1, sx * 0.068),
      x: xd,
      y: yd,
      thickness: 0.026,
      bevel: 0.008,
      smoothing: 1,
      color: earPaint(sx),
      bone: head,
      name: "ear",
    });
    // gold ear band and a tiny tassel
    const bandAt = hp(0.0, 0.1, sx * 0.068).addScaledVector(yd, 0.032);
    b.part(new THREE.TorusGeometry(0.036, 0.0065, 5, 10), GOLD, {
      bone: head,
      at: bandAt,
      dir: yd,
      axis: "z",
      scale: [1, 0.72, 1],
      name: "earBand",
    });
    b.cards([frame(bandAt.clone().add(V(sx * 0.04, 0, 0.0)), [0, 1, 0])], tassel, {
      size: [0.03, 0.08],
      lean: 180,
      flow: [sx, 0, 0],
      bone: head,
    });
  }

  // ------------------------------------------------------------ legs
  const legs: { chain: Chain; sx: number; front: boolean; pts: number[][] }[] = [];
  for (const front of [true, false]) {
    for (const sx of [1, -1]) {
      const side = sx > 0 ? "L" : "R";
      const base = front ? FRONT : HIND;
      const pts = base.map(([x, y, z]) => [x * sx, y, z]);
      const names = front
        ? [`shoulder${side}`, `elbow${side}`, `knee${side}`, `fetlockF${side}`, `hoofF${side}`]
        : [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`];
      const chain = b.chain(`leg${front ? "F" : "H"}${side}`, catmull(pts), {
        parent: front ? spine.joints[2] : hips,
        names,
        role: "leg",
      });
      const stockTop = front ? 0.82 : 0.88;
      const legPaint = paint((p) => {
        const edge = 0.04 * zigzag((p.x * 0.8 + p.z) / 0.07);
        if (p.y < stockTop + edge) return WHITE;
        if (p.y < stockTop + 0.17 + edge * 1.4) return DARK_BAY;
        return COAT_PLAIN;
      });
      b.sweep(chain, front ? FRONT_R : HIND_R, { color: legPaint, sides: 8, name: `leg${front ? "F" : "H"}${side}` });
      legs.push({ chain, sx, front, pts });
    }
  }

  for (const { chain, front, pts } of legs) {
    const P = pts.map(([x, y, z]) => V(x, y, z));
    const knee = chain.joints[2];
    const fet = chain.joints[3];
    const hoofJ = chain.joints[4];
    const sx = Math.sign(P[0].x);
    // hooves
    const H = P[4];
    const hoofAt: [number, number, number] = [H.x, 0, H.z - 0.012];
    b.lathe(
      [
        [0, 0],
        [front ? 0.104 : 0.097, 0],
        [front ? 0.108 : 0.1, 0.012],
        [front ? 0.099 : 0.092, 0.075],
        [front ? 0.09 : 0.084, 0.106],
        [0, 0.106],
      ],
      { at: hoofAt, bone: hoofJ, color: HOOF, segments: 10, name: "hoof" },
    );
    b.lathe(
      [
        [front ? 0.08 : 0.075, 0.097],
        [front ? 0.102 : 0.096, 0.097],
        [front ? 0.102 : 0.096, 0.119],
        [front ? 0.08 : 0.075, 0.125],
      ],
      { at: hoofAt, bone: hoofJ, color: HOOF_DARK, segments: 10, name: "coronet" },
    );
    b.lathe(
      [
        [front ? 0.088 : 0.082, 0],
        [front ? 0.112 : 0.105, 0],
        [front ? 0.112 : 0.105, 0.013],
        [front ? 0.088 : 0.082, 0.013],
      ],
      { at: hoofAt, bone: hoofJ, color: STEEL, segments: 10, name: "shoe" },
    );
    {
      const rr = front ? 0.1 : 0.094;
      const nails = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return V(hoofAt[0] + Math.sin(a) * rr, 0.015, hoofAt[2] + Math.cos(a) * rr);
      });
      studs(nails, 0.0065, STEEL, hoofJ);
    }
    // feathering: rings of white locks hanging round knee/hock and fetlock
    const ring = (c: THREE.Vector3, r: number, a0: number, a1: number, n: number, size: [number, number], bone: Joint, tex: THREE.Texture[]) => {
      const fr = [];
      const flows: number[][] = [];
      for (let i = 0; i < n; i++) {
        const a = ((a0 + ((a1 - a0) * i) / Math.max(1, n - 1)) * Math.PI) / 180;
        const sa = Math.sin(a) * sx;
        const ca = Math.cos(a);
        fr.push(frame([c.x + sa * r, c.y, c.z + ca * r], [0, 1, 0]));
        flows.push([sa, 0, ca]);
      }
      b.cards(fr, tex, { size, lean: 158, flow: (_f, i) => flows[i], bone, vary: 0.22, rng: rng(Math.floor(c.y * 1000 + c.z * 77 + 5)), spin: 6 });
    };
    const lerpP = (a: THREE.Vector3, bb: THREE.Vector3, t: number) => a.clone().lerp(bb, t);
    const tex = [lockWhite, lockWhite2, lockWhite];
    ring(lerpP(P[2], P[3], 0.1), 0.075, 90, 270, 7, [0.085, 0.4], knee, tex);
    ring(lerpP(P[2], P[3], 0.5), 0.08, 75, 285, 10, [0.09, 0.34], knee, tex);
    ring(lerpP(P[2], P[3], 0.88), 0.09, 50, 310, 12, [0.1, 0.27], fet, tex);
    ring(V(P[3].x, P[3].y + 0.03, P[3].z + 0.03), 0.105, 35, 325, 14, [0.11, 0.24], fet, tex);
    // back column of long hair behind the cannon
    const col = [0.0, 0.3, 0.6].map((t) => lerpP(P[2], P[3], t).add(V(0, 0, front ? -0.055 : -0.06)));
    b.cards(
      col.map((c) => frame([c.x, c.y, c.z], [0, 1, 0])),
      tex,
      { size: [0.09, 0.28], lean: 172, flow: [sx, 0, -0.3], bone: knee, vary: 0.15, rng: rng(3 + (front ? 1 : 0)) },
    );
    // chunky feather mass behind the cannon
    b.sweep(polyline([lerpP(P[2], P[3], 0.0), lerpP(P[2], P[3], 1)]), [0.075, 0.085], {
      color: WHITE,
      sides: 6,
      shift: [0, -0.02],
      bone: knee,
      caps: { start: "round", end: "round" },
      name: "featherMass",
    });
    // ink-line fetlock joint ball
    b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, { bone: fet, at: [P[3].x, P[3].y, P[3].z - 0.01], scale: [0.08, 0.075, 0.09], name: "fetlockBall" });
    // front leg: forearm swell, knee pad; hind: hock point
    if (front) {
      b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, { bone: knee, at: [P[2].x, P[2].y, P[2].z + 0.01], scale: [0.09, 0.075, 0.09], name: "knee" });
    } else {
      b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, { bone: knee, at: [P[2].x, P[2].y + 0.02, P[2].z - 0.04], scale: [0.075, 0.1, 0.09], name: "hockPoint" });
    }
  }

  // ------------------------------------------------------------ mane, forelock, tail
  const manes = [HAIR_A, HAIR_B];
  const maneCount = 18;
  for (let i = 0; i < maneCount; i++) {
    const t = 0.05 + (0.92 * i) / (maneCount - 1);
    const sx = i % 2 === 0 ? 1 : -0.6;
    const start = neckTube.at(t, 0, -0.03);
    const len = 0.34 - 0.08 * t + rand() * 0.04;
    const tip = start.at.clone().add(V(sx * (0.14 + rand() * 0.04), -len * 0.7, -len * 0.5));
    const c1 = start.at.clone().add(V(sx * 0.03, 0.09, -0.05));
    const c2 = start.at.clone().add(V(sx * 0.15, 0.06, -0.1));
    const lock = b.sweep(bezier(start, c1, c2, tip), (u) => [0.018, 0.05 * (1 - u * 0.8) + 0.005], {
      color: manes[i % 2],
      sides: 5,
      caps: { start: "round", end: "point" },
      name: "maneLock",
    });
    if (i % 5 === 2) {
      const q = lock.at(0.32);
      b.part(new THREE.TorusGeometry(0.04, 0.01, 5, 8), GOLD, { at: q.at, dir: q.tangent, axis: "z", name: "maneRing" });
    }
  }
  // mane cards over the crest for volume
  {
    const hits = neckSkin.scatter(60, { rng: rng(21), minDist: 0.07, filter: (h) => h.n.y > 0.3 && h.at.z > 0.8 });
    b.cards(hits, lockDark, {
      size: [0.1, 0.17],
      lean: 70,
      bend: 25,
      flow: [0.5, -0.5, -0.4],
      vary: 0.3,
      rng: rng(22),
    });
  }
  for (const sx of [-1, 1]) {
    for (const [dx, extra] of [
      [0.05, 0.0],
      [0.092, 0.03],
    ]) {
      const x = sx * dx;
      const s0 = hp(0.02, 0.12, x * 0.6);
      const tip = hp(0.17 + extra, 0.14, x * 1.1);
      b.sweep(bezier(s0, hp(0.05, 0.2, x * 0.8), hp(0.12, 0.19, x), tip), (u) => [0.036 * (1 - u * 0.8) + 0.004, 0.014], {
        color: extra ? HAIR_B : HAIR_A,
        sides: 5,
        bone: head,
        caps: { start: "round", end: "point" },
        name: "forelock",
      });
    }
  }
  b.cards(
    [-0.105, -0.075, 0.075, 0.105].map((x) => frame(hp(0.04, 0.125, x), NF)),
    lockDark,
    { size: [0.06, 0.15], lean: 100, flow: [0, -0.4, 1], bone: head, vary: 0.2, rng: rng(31) },
  );

  // tail: dock + flowing locks
  const tailPath = tail.path;
  b.sweep(tail, (t) => [0.065 * (1 - t * 0.6), 0.065 * (1 - t * 0.6)], { to: 0.32, color: COAT_PLAIN, sides: 8, name: "tailDock" });
  const strandCount = 15;
  for (let j = 0; j < strandCount; j++) {
    const phi = (j / strandCount) * Math.PI * 2 + rand() * 0.4;
    const reach = 0.82 + rand() * 0.18;
    const pts: THREE.Vector3[] = [];
    for (const t of [0.14, 0.3, 0.48, 0.66, 0.82, 1.0]) {
      const tt = Math.min(1, t * reach + (t === 1 ? 0 : 0));
      const cp = tail.at(tt);
      const amp = (0.02 + 0.1 * Math.sin(Math.min(1, t / 0.7) * Math.PI * 0.5)) * (0.55 + 0.45 * ((j * 7) % 5) / 4);
      pts.push(
        cp.at
          .clone()
          .addScaledVector(cp.binormal, Math.cos(phi) * amp)
          .addScaledVector(cp.normal, Math.sin(phi) * amp),
      );
    }
    b.sweep(catmull(pts), [0.036, 0.0], {
      bone: tail,
      color: j % 3 === 0 ? HAIR_B : HAIR_A,
      sides: 5,
      caps: { start: "round", end: "point" },
      name: "tailLock",
    });
  }
  // glowing Anemo strands woven into the tail
  for (const [phi, reach] of [
    [0.5, 1.0],
    [2.2, 0.93],
    [3.9, 1.0],
    [5.3, 0.9],
  ]) {
    const pts: THREE.Vector3[] = [];
    for (const t of [0.2, 0.38, 0.56, 0.74, 0.9, 1.0]) {
      const cp = tail.at(Math.min(1, t * reach));
      const amp = 0.02 + 0.095 * Math.sin(Math.min(1, t / 0.7) * Math.PI * 0.5);
      pts.push(
        cp.at.clone().addScaledVector(cp.binormal, Math.cos(phi) * amp).addScaledVector(cp.normal, Math.sin(phi) * amp),
      );
    }
    glow(b.sweep(catmull(pts), [0.011, 0.0], { bone: tail, color: GEM, sides: 4, caps: { start: "round", end: "point" }, name: "tailGlow" }), 1.2);
  }
  {
    const fr = [0.4, 0.55, 0.7, 0.85].flatMap((t) => {
      const cp = tail.at(t);
      return [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + t * 3;
        return frame(
          cp.at.clone().addScaledVector(cp.binormal, Math.cos(a) * 0.06).addScaledVector(cp.normal, Math.sin(a) * 0.06),
          [0, 1, 0],
        );
      });
    });
    b.cards(fr, lockDark, { size: [0.08, 0.3], lean: 170, flow: [1, 0, -0.3], bone: tail.joints[3], vary: 0.3, rng: rng(41) });
  }
  // tail ribbon + bow
  {
    const band = b.ring(tail.at(0.3), { count: 8, radius: 0.092 });
    b.sweep(catmull(band.items, { closed: true }), [0.012, 0.03], { color: GOLD, section: "box", up: tail.at(0.3), bone: tail.joints[1], name: "tailBand" });
    const bowAt = tail.at(0.3).at.clone().add(V(0, 0.095, 0));
    for (const sx of [1, -1]) {
      b.part(new THREE.SphereGeometry(1, 8, 6), TEAL, { bone: tail.joints[1], at: [sx * 0.055, bowAt.y + 0.01, bowAt.z], scale: [0.055, 0.035, 0.03], rotation: [0, 0, sx * -25], name: "bow" });
      b.rod([sx * 0.02, bowAt.y - 0.01, bowAt.z - 0.01], [sx * 0.09, bowAt.y - 0.14, bowAt.z - 0.07], [0.014, 0.006], { color: TEAL, bone: tail.joints[1], section: "box", name: "ribbonTail" });
    }
    b.part(new THREE.SphereGeometry(0.026, 8, 6), GOLD, { bone: tail.joints[1], at: [0, bowAt.y, bowAt.z], name: "bowKnot" });
  }
  void tailPath;

  // ------------------------------------------------------------ tack: collar, hames, harness
  const collarAt = neck.at(0.24);
  const collarDir = [0, 0.55, 0.84];
  const collarLoop = neckSkin.loop(collarAt, { dir: collarDir, lift: 0.045 });
  b.sweep(collarLoop, 0.066, { color: LEATHER, sides: 8, bone: neck.joints[0], name: "collar" });
  const collarStudsLoop = neckSkin.loop(collarAt, { dir: collarDir, lift: 0.105 });
  studs(ringPts(collarStudsLoop, 26), 0.011, GOLD, neck.joints[0]);
  const hameLoop = neckSkin.loop(collarAt, { dir: collarDir, lift: 0.118 });
  for (const [a, c] of [
    [0.04, 0.4],
    [0.6, 0.96],
  ]) {
    b.sweep(hameLoop.slice(a, c), 0.017, { color: GOLD, sides: 6, bone: neck.joints[0], name: "hame" });
  }
  const hameTop = [hameLoop.at(0.038), hameLoop.at(0.962)];
  const hameBot = [hameLoop.at(0.4), hameLoop.at(0.6)];
  for (const p of [...hameTop, ...hameBot]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { bone: neck.joints[0], at: p, name: "hameKnob" });
  }
  // terret rings on hame tops (rein guides)
  for (const p of hameTop) {
    b.part(new THREE.TorusGeometry(0.034, 0.007, 5, 10), GOLD, { bone: neck.joints[0], at: [p.x * 1.1, p.y + 0.04, p.z], dir: [1, 0, 0], axis: "z", name: "terret" });
  }
  for (const p of hameTop) {
    glow(b.part(new THREE.OctahedronGeometry(0.02), GEM, { bone: neck.joints[0], at: [p.x * 1.05, p.y + 0.015, p.z], scale: [1, 1.3, 1], name: "hameGem" }), 1.3);
  }
  // breast strap with the Anemo medallion and bells
  {
    const s0 = Math.sign(hameBot[0].x) || 1;
    const chestPts = [
      hameBot[0],
      V(s0 * 0.3, 1.38, 0.8),
      V(s0 * 0.2, 1.34, 1.02),
      V(s0 * 0.09, 1.31, 1.13),
      V(0, 1.3, 1.16),
      V(-s0 * 0.09, 1.31, 1.13),
      V(-s0 * 0.2, 1.34, 1.02),
      V(-s0 * 0.3, 1.38, 0.8),
      hameBot[1],
    ];
    const breast = bodySkin.drape(catmull(chestPts), { lift: 0.028 });
    b.sweep(breast, 0.022, { color: LEATHER, sides: 6, name: "breastStrap" });
    studs(ringPts(breast, 14, false), 0.01, GOLD, spine.joints[2]);
    const mh = bodySkin.ray([0, 1.3, 3], [0, 0, -1]);
    if (mh) {
      const c = mh.at.clone().addScaledVector(mh.n, 0.032);
      const cb = spine.joints[2];
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.016, 14), GOLD, { bone: cb, at: c, dir: mh.n, name: "medallion" });
      b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
        bone: cb,
        at: c.clone().addScaledVector(mh.n, 0.0095),
        dir: mh.n,
        axis: "z",
        texture: rosette,
        name: "medallionFace",
      });
      glow(
        b.part(new THREE.OctahedronGeometry(0.022), GEM, {
          bone: cb,
          at: c.clone().addScaledVector(mh.n, 0.022),
          dir: mh.n,
          scale: [0.8, 1.2, 0.8],
          name: "medallionGem",
        }),
        1.5,
      );
      b.cards([frame(c.clone().add(V(0, -0.05, 0)), [0, 1, 0])], tassel, { size: [0.07, 0.2], lean: 180, flow: [0, 0, 1], bone: cb });
      for (const x of [-0.17, -0.1, 0.1, 0.17]) {
        const bh = bodySkin.ray([x, 1.33, 3], [0, 0, -1]);
        if (!bh) continue;
        const bc2 = bh.at.clone().addScaledVector(bh.n, 0.045).add(V(0, -0.035, 0));
        b.part(new THREE.SphereGeometry(0.025, 8, 6), GOLD, { bone: cb, at: bc2, name: "bell" });
        b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), cel("#3a1c1c", "#1a0f22"), { bone: cb, at: bc2.clone().add(V(0, -0.024, 0)), name: "bellSlot" });
        b.part(new THREE.TorusGeometry(0.011, 0.0035, 4, 8), GOLD, { bone: cb, at: bc2.clone().add(V(0, 0.028, 0)), dir: [1, 0, 0], axis: "z", name: "bellLoop" });
      }
    }
  }

  // traces: draped straps from the hame mid to the haunches
  for (const sx of [1, -1]) {
    const hook = hameLoop.at(sx > 0 ? 0.25 : 0.75);
    const trace = bodySkin.drape(
      catmull([
        [hook.x, hook.y - 0.1, hook.z - 0.05],
        [sx * 0.34, 1.45, 0.45],
        [sx * 0.37, 1.4, -0.1],
        [sx * 0.37, 1.35, -0.5],
        [sx * 0.34, 1.3, -0.82],
      ]),
      { lift: 0.014 },
    );
    b.sweep(trace, [0.028, 0.007], { color: LEATHER_D, section: "box", up: [sx, 0, 0], bone: spine.joints[1], name: "trace" });
    const end = trace.at(1);
    b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 10), GOLD, { bone: hips, at: end, dir: [sx, 0, 0], axis: "z", name: "traceRing" });
    b.cards([frame(end, [0, 1, 0])], tassel, { size: [0.05, 0.14], lean: 180, flow: [sx, 0, 0], bone: hips });
  }

  // girth strap round the barrel with buckles
  {
    const girth = bodySkin.loop(frame([0, 1.3, 0.12], [0, 0, 1]), { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(girth, [0.012, 0.03], { color: LEATHER_D, section: "box", up: [0, 0, 1], bone: spine.joints[1], name: "girth" });
    studs(ringPts(bodySkin.loop(frame([0, 1.3, 0.12], [0, 0, 1]), { dir: [0, 0, 1], lift: 0.022 }), 14), 0.009, GOLD, spine.joints[1]);
    for (const sx of [1, -1]) {
      const h = bodySkin.ray([sx * 2, 1.2, 0.12], [-sx, 0, 0]);
      if (h) {
        b.part(new THREE.BoxGeometry(0.012, 0.06, 0.05), GOLD, { bone: spine.joints[1], at: h.at.clone().add(V(sx * 0.02, 0, 0)), name: "girthBuckle" });
        b.part(new THREE.BoxGeometry(0.014, 0.036, 0.028), LEATHER_D, { bone: spine.joints[1], at: h.at.clone().add(V(sx * 0.02, 0, 0)), name: "girthBuckleBar" });
      }
    }
  }

  // saddle cloth with golden filigree, harness pad, terrets, backband
  {
    b.decal(body, cloth, { at: [0, 1.72, 0.12], dir: [0, 1, 0], up: [0, 0, 1], size: [0.74, 0.66], segments: 28, lift: 0.004, bone: spine.joints[1], name: "saddleCloth" });
    const top = bodySkin.ray([0, 3, 0.05], [0, -1, 0]);
    const ty = top ? top.at.y : 1.7;
    b.part(new THREE.SphereGeometry(1, 10, 8), LEATHER, { bone: spine.joints[1], at: [0, ty + 0.01, 0.05], scale: [0.16, 0.055, 0.27], name: "saddlePad" });
    b.part(new THREE.SphereGeometry(1, 10, 6), LEATHER_D, { bone: spine.joints[1], at: [0, ty + 0.05, 0.05], scale: [0.06, 0.03, 0.2], name: "saddleRidge" });
    for (const z of [0.2, -0.1]) {
      b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.075, 6), GOLD, { bone: spine.joints[1], at: [0, ty + 0.09, z], name: "terretPost" });
      b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 10), GOLD, { bone: spine.joints[1], at: [0, ty + 0.145, z], dir: [1, 0, 0], axis: "z", name: "saddleTerret" });
    }
    // backband across the saddle, hanging down each flank
    const bb = bodySkin.drape(
      catmull([
        [0.36, 1.35, 0.05],
        [0.3, 1.58, 0.05],
        [0.12, 1.72, 0.05],
        [-0.12, 1.72, 0.05],
        [-0.3, 1.58, 0.05],
        [-0.36, 1.35, 0.05],
      ]),
      { lift: 0.07 },
    );
    b.sweep(bb, [0.026, 0.008], { color: LEATHER_D, section: "box", up: [0, 1, 0], bone: spine.joints[1], name: "backband" });
    for (const sx of [1, -1]) {
      const h = bodySkin.ray([sx * 2, 1.36, 0.05], [-sx, 0, 0]);
      if (h) {
        b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 10), GOLD, { bone: spine.joints[1], at: h.at.clone().add(V(sx * 0.03, 0, 0)), dir: [sx, 0, 0], axis: "z", name: "tugRing" });
      }
    }
    // tassels at cloth corners
    const corners = [
      [0.3, 0.38],
      [-0.3, 0.38],
      [0.3, -0.26],
      [-0.3, -0.26],
    ];
    for (const [x, z] of corners) {
      const h = bodySkin.ray([x, 3, z], [0, -1, 0]);
      if (h) b.cards([frame(h.at, [0, 1, 0])], tassel, { size: [0.055, 0.15], lean: 180, flow: [Math.sign(x), 0, 0], bone: spine.joints[1], sink: 0 });
    }
  }

  // breeching strap round the haunches + hip straps + crupper
  {
    const breech = bodySkin.drape(
      catmull([
        [0.36, 1.52, -0.55],
        [0.33, 1.38, -0.92],
        [0.2, 1.24, -1.1],
        [0, 1.2, -1.15],
        [-0.2, 1.24, -1.1],
        [-0.33, 1.38, -0.92],
        [-0.36, 1.52, -0.55],
      ]),
      { lift: 0.014 },
    );
    b.sweep(breech, [0.034, 0.008], { color: LEATHER, section: "box", up: [0, 1, 0], bone: hips, name: "breeching" });
    studs(ringPts(breech, 12, false), 0.011, GOLD, hips);
    for (const sx of [1, -1]) {
      const hip = bodySkin.drape(
        catmull([
          [sx * 0.34, 1.44, -0.9],
          [sx * 0.3, 1.6, -0.75],
          [sx * 0.15, 1.72, -0.5],
          [0.0, 1.72, -0.22],
        ]),
        { lift: 0.014 },
      );
      b.sweep(hip, [0.02, 0.006], { color: LEATHER_D, section: "box", up: [0, 1, 0], bone: hips, name: "hipStrap" });
    }
    const crupper = bodySkin.drape(polyline([[0, 1.72, -0.2], [0, 1.72, -0.6], [0, 1.7, -0.95]]), { lift: 0.012 });
    b.sweep(crupper, [0.015, 0.006], { color: LEATHER_D, section: "box", up: [0, 1, 0], bone: hips, name: "crupper" });
    b.part(new THREE.TorusGeometry(0.04, 0.009, 5, 10), GOLD, { bone: hips, at: [0, 1.7, -0.98], dir: [0, 0, 1], axis: "z", name: "dockRing" });
  }

  // ------------------------------------------------------------ tack: bridle
  {
    // crown and cheek straps
    for (const sx of [1, -1]) {
      const crown = headSkin.drape(
        catmull([hp(0.09, -0.03, sx * 0.11), hp(0.02, 0.05, sx * 0.1), hp(-0.04, 0.1, sx * 0.06), hp(-0.07, 0.08, 0)]),
        { lift: 0.006 },
      );
      b.sweep(crown, [0.006, 0.014], { color: LEATHER, section: "box", up: [0, 1, 0], bone: head, name: "crown" });
      const ringP = hp(0.36, -0.08, sx * 0.1);
      const cheek = headSkin.drape(
        catmull([hp(0.09, -0.03, sx * 0.11), hp(0.2, -0.06, sx * 0.112), hp(0.31, -0.06, sx * 0.095), ringP]),
        { lift: 0.006 },
      );
      b.sweep(cheek, [0.006, 0.012], { color: LEATHER, section: "box", up: [0, 1, 0], bone: head, name: "cheekStrap" });
      b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 10), GOLD, { bone: head, at: ringP, dir: [sx, 0, 0], axis: "z", name: "bitRing" });
      // blinker
      const bc = hp(0.085, -0.04, sx * 0.129);
      b.extrude(
        [
          [-0.052, -0.04],
          [0.05, -0.04],
          [0.062, 0.0],
          [0.048, 0.046],
          [-0.048, 0.046],
          [-0.06, 0.0],
        ],
        { at: bc, x: D, y: NF, thickness: 0.014, bevel: 0.005, smoothing: 1, color: LEATHER_D, bone: head, name: "blinker" },
      );
      b.part(new THREE.CircleGeometry(0.032, 14), "#ffffff", { bone: head, at: [sx * 0.139, bc.y, bc.z], dir: [sx, 0, 0], axis: "z", texture: rosette, name: "blinkerRosette" });
      b.cards([frame([sx * 0.14, bc.y - 0.03, bc.z - 0.04], [0, 1, 0])], tassel, { size: [0.04, 0.11], lean: 180, flow: [sx, 0, 0], bone: head });
      // gold stitching round the blinker, and a buckle on the cheek strap
      const stitch = [
        [-0.045, -0.034],
        [0.043, -0.034],
        [0.054, 0.0],
        [0.041, 0.039],
        [-0.041, 0.039],
        [-0.052, 0.0],
      ].map(([u, v]) => bc.clone().addScaledVector(D, u).addScaledVector(NF, v).add(V(sx * 0.0085, 0, 0)));
      b.sweep(catmull(stitch, { closed: true }), 0.0028, { color: GOLD, sides: 4, bone: head, name: "blinkerStitch" });
      const bk = cheek.at(0.5);
      b.part(new THREE.BoxGeometry(0.012, 0.034, 0.03), GOLD, { bone: head, at: [bk.x + sx * 0.006, bk.y, bk.z], name: "cheekBuckle" });
      b.part(new THREE.BoxGeometry(0.014, 0.018, 0.012), LEATHER_D, { bone: head, at: [bk.x + sx * 0.006, bk.y, bk.z], name: "cheekBuckleBar" });
    }
    b.rod(hp(0.36, -0.08, -0.1), hp(0.36, -0.08, 0.1), 0.007, { color: STEEL, bone: head, sides: 6, name: "bit" });
    b.decal(headSkin, rosette, { at: hp(0.43, 0.075, 0), dir: NF, up: D, size: [0.058, 0.058], segments: 8, bone: head, name: "nosePlate" });
    // brow band with gem
    const brow = headSkin.drape(
      catmull([hp(0.09, 0.0, -0.11), hp(0.095, 0.08, -0.085), hp(0.1, 0.115, -0.04), hp(0.1, 0.118, 0), hp(0.1, 0.115, 0.04), hp(0.095, 0.08, 0.085), hp(0.09, 0.0, 0.11)]),
      { lift: 0.007 },
    );
    b.sweep(brow, [0.007, 0.015], { color: LEATHER, section: "box", up: [0, 1, 0], bone: head, name: "browband" });
    const gemAt = hp(0.1, 0.122, 0);
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.01, 10), GOLD, { bone: head, at: gemAt, dir: NF, name: "browBoss" });
    glow(b.part(new THREE.OctahedronGeometry(0.02), GEM, { bone: head, at: gemAt.clone().addScaledVector(NF, 0.01), dir: NF, scale: [0.9, 1.3, 0.9], name: "browGem" }), 1.4);
    studs(ringPts(brow, 9, false), 0.0065, GOLD, head);
    // noseband and throat latch
    const nose = jawSkin.loop(hp(0.44, 0, 0), { dir: D, lift: 0.012 });
    b.sweep(nose, [0.006, 0.016], { color: LEATHER, section: "box", up: D, bone: head, name: "noseband" });
    studs(ringPts(jawSkin.loop(hp(0.44, 0, 0), { dir: D, lift: 0.02 }), 10), 0.007, GOLD, head);
    const throat = jawSkin.drape(
      catmull([hp(0.09, -0.03, 0.11), hp(0.12, -0.12, 0.1), hp(0.14, -0.19, 0.05), hp(0.14, -0.21, 0), hp(0.14, -0.19, -0.05), hp(0.12, -0.12, -0.1), hp(0.09, -0.03, -0.11)]),
      { lift: 0.006 },
    );
    b.sweep(throat, [0.006, 0.012], { color: LEATHER, section: "box", up: [0, 1, 0], bone: head, name: "throatLatch" });
    // reins from the bit rings to the hame terrets and on to the saddle terrets
    for (const sx of [1, -1]) {
      const ringP = hp(0.36, -0.08, sx * 0.1);
      const terret = hameTop[sx > 0 ? 0 : 1];
      const rein = catmull([
        ringP,
        V(sx * 0.17, 1.66, 1.32),
        V(sx * 0.2, 1.8, 1.0),
        V(terret.x * 1.1, terret.y + 0.04, terret.z),
        V(sx * 0.12, 1.88, 0.5),
        V(sx * 0.07, 1.86, 0.2),
      ]);
      b.sweep(rein, 0.0085, { color: LEATHER_D, sides: 5, bone: neck, name: "rein" });
    }
  }

  return b.root;
}
