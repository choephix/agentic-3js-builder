```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  paint,
  countershade,
  mottle,
  spots,
  grain,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { Builder, Joint } from "agentic-3js-builder";

export const meta = {
  name: "Mice Tea Party",
  description:
    "Four Beatrix-Potter-style mice take tea on a gingham cloth inside a giant gilt-rimmed teacup, with a cotton-reel table, teapot, cakes, bunting, and a late guest arriving on the saucer with a parcel.",
};

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

const D2R = Math.PI / 180;
const YAX = new THREE.Vector3(0, 1, 0);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const qy = (deg: number) => new THREE.Quaternion().setFromAxisAngle(YAX, deg * D2R);
const qyr = (rad: number) => new THREE.Quaternion().setFromAxisAngle(YAX, rad);
const qz = (deg: number) => new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), deg * D2R);
const euler = (r: number[]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D2R, r[1] * D2R, r[2] * D2R));
const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
const box = () => new THREE.BoxGeometry(1, 1, 1);

function interp(pts: number[][], x: number, ix = 0, iy = 1) {
  if (x <= pts[0][ix]) return pts[0][iy];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const c = pts[i + 1];
    if (x >= a[ix] && x <= c[ix]) return a[iy] + ((x - a[ix]) / (c[ix] - a[ix] || 1)) * (c[iy] - a[iy]);
  }
  return pts[pts.length - 1][iy];
}

// ---------------------------------------------------------------------------------------------------------------
// Palette (soft, washed, watercolour)

const C = {
  porc: "#f5efe0",
  gold: "#cfa74a",
  blue: "#6b8cb3",
  dblue: "#46658c",
  white: "#fbf8ef",
  cream: "#f3e9d2",
  tea: "#a8601f",
  jam: "#9c2a34",
  pink: "#e6b2a8",
  nose: "#d58a8a",
  eye: "#16110f",
  glint: "#ffffff",
  whisk: "#efe8da",
  mouth: "#6b3a3a",
  leaf: "#6f8f55",
  stem: "#587a46",
  rose: "#e9a3b4",
  butter: "#f6e27a",
  lilac: "#b7a6e0",
  tan: "#d9a860",
  ribbon: "#c9686f",
  hat: "#3a3436",
  band: "#8a3f3a",
  coat: "#6f8a5e",
  vest: "#b4694a",
  trou: "#8a7a62",
  shoe: "#4a3426",
  bonnet: "#9db7d3",
  sage: "#a9bf95",
  wood: "#b98a5a",
  woodDk: "#8a5f3a",
  thread: "#b9524a",
  sugar: "#fffaf0",
  strawb: "#d8403a",
  ink: "#3b2a20",
  bun: "#e0b878",
  rosePot: "#e7aeb0",
};

// ---------------------------------------------------------------------------------------------------------------
// Textures

const petals = (cx: number, cy: number, r: number, fill: string, stroke: string, n = 5, center = "#f2c84b") => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    s += `<circle cx="${(cx + Math.cos(a) * r * 0.9).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.9).toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${(r * 0.55).toFixed(1)}" fill="${center}" stroke="${stroke}" stroke-width="1"/>`;
};

const SPRIG = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#3e5a3a" stroke-width="1.5" stroke-linejoin="round">
    <path d="M50 96 C47 74 54 52 50 26" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M49 84 C34 82 23 72 21 57 C38 59 47 70 49 84Z" fill="#86a56a"/>
    <path d="M51 70 C66 68 77 58 79 43 C62 45 53 56 51 70Z" fill="#86a56a"/>
    <path d="M50 54 C40 50 34 42 33 31 C43 33 49 41 50 54Z" fill="#a1bd82"/>
  </g>
  ${petals(50, 17, 7, "#a4c4e8", "#46658c")}
  ${petals(29, 36, 5.5, "#f1a6b8", "#9a4a60", 5, "#f6e27a")}
  ${petals(72, 28, 5.5, "#a4c4e8", "#46658c")}
  <ellipse cx="62" cy="52" rx="5" ry="7" fill="#e9a3b4" stroke="#9a4a60" stroke-width="1.4"/>
</svg>`,
  { size: 256 },
);

const BANNER = svg(
  `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#3e5a3a" stroke-width="1.6" fill="#86a56a" stroke-linejoin="round">
    <path d="M20 26 C8 22 4 12 6 4 C16 6 22 14 20 26Z"/><path d="M140 26 C152 22 156 12 154 4 C144 6 138 14 140 26Z"/>
    <path d="M30 78 C16 82 8 90 6 98 C20 96 28 90 30 78Z"/><path d="M130 78 C144 82 152 90 154 98 C140 96 132 90 130 78Z"/>
  </g>
  <path d="M14 36 Q47 24 80 36 T146 36 L146 70 Q113 82 80 70 T14 70Z" fill="#f8efd8" stroke="#8a5f3a" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M20 41 Q47 31 80 41 T140 41" fill="none" stroke="#cdb892" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="80" y="60" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="19" fill="#46658c">Tea at Four</text>
  ${petals(14, 30, 6.5, "#f1a6b8", "#9a4a60", 5, "#f6e27a")}
  ${petals(146, 30, 6.5, "#a4c4e8", "#46658c")}
  ${petals(80, 16, 6, "#f1a6b8", "#9a4a60", 5, "#f6e27a")}
  ${petals(46, 88, 5, "#a4c4e8", "#46658c")}
  ${petals(114, 88, 5, "#f6e27a", "#9a7a20", 5, "#e9a3b4")}
</svg>`,
  { size: 384 },
);

const APRON_BIB = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 58 L12 20 Q13 11 22 11 L38 11 Q47 11 48 20 L54 58 Z" fill="#fcf9f0" stroke="#bfb293" stroke-width="2"/>
  <path d="M11 55 L16.5 22 Q17.5 15 23 15 L37 15 Q42.5 15 43.5 22 L49 55" fill="none" stroke="#6b8cb3" stroke-width="1.6" stroke-dasharray="3 2.5"/>
  <path d="M30 40 C22 33 24 27 28 27 C29.5 27 30 28.5 30 29 C30 28.5 30.5 27 32 27 C36 27 38 33 30 40Z" fill="#d9788a" stroke="#9a4a60" stroke-width="1.2"/>
</svg>`,
  { size: 192 },
);

const APRON_SKIRT = svg(
  `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 2 L62 2 L77 64 Q71 68 66 63 Q60 68 54 63 Q47 68 40 63 Q33 68 26 63 Q20 68 14 63 Q9 68 3 64 Z" fill="#fcf9f0" stroke="#bfb293" stroke-width="2"/>
  <path d="M7 58 Q40 54 73 58" fill="none" stroke="#6b8cb3" stroke-width="1.8"/>
  <path d="M22 18 L58 18 L60 40 L20 40 Z" fill="none" stroke="#6b8cb3" stroke-width="1.6" stroke-dasharray="3 2.5"/>
  ${petals(40, 29, 4.6, "#f1a6b8", "#9a4a60", 5, "#f6e27a")}
</svg>`,
  { size: 192 },
);

const LACE = (() => {
  let s = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    s += `<circle cx="${(50 + Math.cos(a) * 41).toFixed(1)}" cy="${(50 + Math.sin(a) * 41).toFixed(1)}" r="7.4" fill="none" stroke="#ffffff" stroke-width="2.4"/>`;
    s += `<path d="M50 50 L${(50 + Math.cos(a) * 34).toFixed(1)} ${(50 + Math.sin(a) * 34).toFixed(1)}" stroke="#f0f0f0" stroke-width="1.6"/>`;
    s += `<circle cx="${(50 + Math.cos(a + 0.2) * 26).toFixed(1)}" cy="${(50 + Math.sin(a + 0.2) * 26).toFixed(1)}" r="2.6" fill="none" stroke="#ffffff" stroke-width="1.6"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${s}
    <circle cx="50" cy="50" r="33" fill="none" stroke="#ffffff" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="19" fill="none" stroke="#f4f4f4" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="7" fill="#ffffff"/>
  </svg>`,
    { size: 256 },
  );
})();

const JAM = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="96" height="56" rx="8" fill="#f8efd8" stroke="#8a5f3a" stroke-width="3"/>
  <path d="M22 18 C10 22 14 40 24 44 C34 40 36 22 22 18Z" fill="#d8403a" stroke="#7a1f24" stroke-width="2"/>
  <path d="M22 18 L16 10 M22 18 L22 8 M22 18 L28 10" stroke="#587a46" stroke-width="3" stroke-linecap="round"/>
  <text x="66" y="29" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="15" fill="#7a1f24">JAM</text>
  <text x="66" y="46" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="10" fill="#46658c">Strawberry</text>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints

const gingham = (white: string, light: string, dark: string, du: number, dv: number) =>
  paint((_p, _n, s) => {
    const a = Math.floor(s[1] / du) & 1;
    const c = Math.floor(s[0] / dv) & 1;
    return a && c ? dark : a || c ? light : white;
  });

// ---------------------------------------------------------------------------------------------------------------
// Cup geometry constants

const KR = 1.6;
const KY = 1.15;
const CY = -0.0025;
const cr = (r: number) => r * KR;
const cy = (y: number) => y * KY + CY;
const BASE_MS = 1.45;

const CUP_RAW: [number, number][] = [
  [0, 0.02], [0.09, 0.016], [0.1, 0.03], [0.15, 0.05], [0.2, 0.1], [0.235, 0.17], [0.245, 0.198], [0.24, 0.206],
  [0.23, 0.206], [0.225, 0.198], [0.215, 0.17], [0.18, 0.11], [0.12, 0.07], [0, 0.07],
];
const CUP_OUTER_ASC = [[0.09, 0.016], [0.1, 0.03], [0.15, 0.05], [0.2, 0.1], [0.235, 0.17], [0.245, 0.198]].map(
  ([r, y]) => [cr(r), cy(y)],
);
const outerR = (y: number) => interp(CUP_OUTER_ASC, y, 1, 0);
const SAUCER_TOP_ASC = [[0, 0.016], [cr(0.14), 0.016], [cr(0.2), 0.02], [cr(0.33), 0.042], [cr(0.345), 0.046]];
const saucerY = (r: number) => interp(SAUCER_TOP_ASC, r, 0, 1);

const FLOOR_Y = cy(0.07);
const MOUSE_Y = FLOOR_Y + 0.005;
const RIM_Y = cy(0.206);
const TT = MOUSE_Y + 0.085 + 0.0008; // table top

const polar = (deg: number, r: number, y = 0) => v3(r * Math.sin(deg * D2R), y, r * Math.cos(deg * D2R));

// ---------------------------------------------------------------------------------------------------------------
// Mouse

type MouseOpts = {
  id: string;
  pos: THREE.Vector3;
  yaw: number;
  scale?: number;
  fur: string;
  belly: string;
  garb: "pinafore" | "dress" | "waistcoat" | "smock";
  cloth: any;
  sleeve?: any;
  trim: string;
  hat: "mobcap" | "tophat" | "bonnet" | "bow";
  hatColor: string;
  headYaw?: number;
  headPitch?: number;
  handL: number[];
  handR: number[];
  tailSide?: number;
  skirtR?: number;
};

function mouse(b: Builder, root: Joint, o: MouseOpts) {
  const MS = BASE_MS * (o.scale ?? 1);
  const id = o.id;
  const q = qy(o.yaw);
  const L = v3;
  const P = (v: THREE.Vector3) => v.clone().multiplyScalar(MS).applyQuaternion(q).add(o.pos);
  const D = (v: THREE.Vector3) => v.clone().applyQuaternion(q).normalize();

  const put = (
    geo: THREE.BufferGeometry,
    color: any,
    bone: Joint,
    pos: THREE.Vector3,
    size: number[],
    f?: THREE.Quaternion,
    rot?: number[],
  ) => {
    const qq = q.clone();
    if (f) qq.multiply(f);
    if (rot) qq.multiply(euler(rot));
    return b.part(geo, color, {
      bone,
      at: P(pos),
      quat: qq,
      scale: [size[0] * MS, size[1] * MS, size[2] * MS],
      flat: true,
    });
  };
  const hoop = (bone: Joint, f: (a: number) => THREE.Vector3, n: number, r: number, color: any) =>
    b.sweep(
      catmull(Array.from({ length: n }, (_, i) => P(f((i / n) * Math.PI * 2))), { closed: true }),
      r * MS,
      { color, bone, sides: 6 },
    );

  // --- spine
  const KEYS = [0.036, 0.036, 0.03, 0.02];
  const rb = (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * 3;
    const i = Math.min(Math.floor(x), 2);
    const f = x - i;
    const e = f * f * (3 - 2 * f);
    return (KEYS[i] * (1 - e) + KEYS[i + 1] * e) * MS;
  };
  const sp = [L(0, 0.036, -0.004), L(0, 0.058, 0), L(0, 0.08, 0.008), L(0, 0.098, 0.016)].map(P);
  const spine = b.chain(`spine${id}`, catmull(sp), {
    parent: root,
    names: [`hips${id}`, `spine${id}`, `chest${id}`, `neck${id}`],
    role: "spine",
  });
  const hips = spine.joints[0];
  const chest = spine.joints[2];
  const neckJ = spine.joints[3];

  const furBase = mottle(o.fur, mix(o.fur, "#2e2018", 0.3), { size: 0.03, seed: id.charCodeAt(0) });
  const furPaint = countershade(furBase, o.belly, { level: -0.2, soft: 0.4 });
  b.sweep(spine, (t: number) => rb(t), { color: furPaint });

  // --- head
  const neckL = L(0, 0.098, 0.016);
  const hq = new THREE.Quaternion().setFromEuler(
    new THREE.Euler((o.headPitch ?? 0) * D2R, (o.headYaw ?? 0) * D2R, 0, "YXZ"),
  );
  const H = (x: number, y: number, z: number) => neckL.clone().add(L(x, y, z).applyQuaternion(hq));
  const head = b.joint(`head${id}`, {
    parent: neckJ,
    at: P(neckL),
    dir: D(L(0, 0.25, 1).applyQuaternion(hq)),
    role: "head",
  });
  const jaw = b.joint(`jaw${id}`, { parent: head, at: P(H(0, 0.004, 0.02)), aim: P(H(0, 0, 0.06)), role: "jaw" });

  put(sph(10, 7), furPaint, head, H(0, 0.024, 0.012), [0.031, 0.029, 0.033], hq);
  put(sph(8, 6), furPaint, head, H(0, 0.014, 0.046), [0.017, 0.015, 0.025], hq);
  put(sph(6, 5), C.nose, head, H(0, 0.017, 0.07), [0.0078, 0.0066, 0.007], hq);
  put(sph(6, 5), furPaint, head, H(0.02, 0.012, 0.032), [0.013, 0.012, 0.014], hq);
  put(sph(6, 5), furPaint, head, H(-0.02, 0.012, 0.032), [0.013, 0.012, 0.014], hq);
  put(sph(8, 5), C.mouth, head, H(0, 0.006, 0.052), [0.011, 0.003, 0.015], hq);
  put(sph(8, 5), o.belly, jaw, H(0, 0.0, 0.043), [0.0115, 0.0075, 0.021], hq);
  for (const s of [1, -1]) {
    put(box(), C.white, head, H(s * 0.0022, 0.0035, 0.0668), [0.0034, 0.0065, 0.0016], hq);
    // eyes
    put(sph(7, 5), C.eye, head, H(s * 0.0165, 0.034, 0.037), [0.0073, 0.0073, 0.0073], hq);
    put(sph(5, 4), C.glint, head, H(s * 0.0148, 0.0378, 0.0425), [0.0022, 0.0022, 0.0022], hq);
    put(sph(4, 3), C.glint, head, H(s * 0.0185, 0.0315, 0.0425), [0.001, 0.001, 0.001], hq);
    // cheeks blush
    put(sph(6, 4), C.pink, head, H(s * 0.0225, 0.016, 0.0375), [0.005, 0.0045, 0.002], hq, [0, s * 40, 0]);
    // ears
    put(sph(8, 6), furPaint, head, H(s * 0.03, 0.052, -0.004), [0.0052, 0.021, 0.019], hq, [0, -s * 25, -s * 10]);
    put(
      sph(8, 6),
      C.pink,
      head,
      H(s * (0.03 + 0.906 * 0.0043), 0.0515, -0.004 + 0.423 * 0.0043),
      [0.0036, 0.0165, 0.015],
      hq,
      [0, -s * 25, -s * 10],
    );
    // whiskers
    for (const k of [-1, 0, 1])
      b.rod(
        P(H(s * 0.012, 0.012 + k * 0.003, 0.058)),
        P(H(s * 0.066, 0.012 + k * 0.017, 0.066 - Math.abs(k) * 0.004)),
        0.0007 * MS,
        C.whisk,
        { bone: head, sides: 4 },
      );
    // brows
    put(sph(5, 4), o.fur, head, H(s * 0.0165, 0.045, 0.034), [0.008, 0.0022, 0.004], hq, [0, 0, s * 12]);
  }

  // --- hats
  if (o.hat === "mobcap") {
    put(sph(9, 6), o.hatColor, head, H(0, 0.051, -0.008), [0.026, 0.015, 0.029], hq);
    hoop(head, (a) => H(Math.sin(a) * 0.03, 0.045 - 0.004 * Math.cos(a), Math.cos(a) * 0.032 - 0.004), 12, 0.0042, o.trim);
    put(sph(6, 4), o.trim, head, H(0.008, 0.066, -0.008), [0.008, 0.004, 0.004], hq, [0, 0, 20]);
    put(sph(6, 4), o.trim, head, H(-0.008, 0.066, -0.008), [0.008, 0.004, 0.004], hq, [0, 0, -20]);
    put(sph(5, 4), C.ribbon, head, H(0, 0.066, -0.008), [0.0034, 0.0034, 0.0034], hq);
  } else if (o.hat === "bonnet") {
    put(sph(9, 6), o.hatColor, head, H(0, 0.04, -0.012), [0.028, 0.027, 0.031], hq);
    put(sph(8, 5), o.hatColor, head, H(0, 0.05, 0.02), [0.027, 0.007, 0.02], hq, [-14, 0, 0]);
    hoop(head, (a) => H(Math.sin(a) * 0.0285, 0.027, Math.cos(a) * 0.03 - 0.012), 12, 0.0032, o.trim);
    for (const s of [1, -1])
      b.sweep(bezier(P(H(s * 0.026, 0.028, 0.004)), P(H(s * 0.031, 0.0, 0.02)), P(H(s * 0.004, -0.006, 0.034))), 0.0016 * MS, {
        color: o.trim,
        bone: head,
        sides: 5,
      });
    put(sph(6, 4), o.trim, head, H(0.007, -0.006, 0.035), [0.008, 0.0045, 0.004], hq, [0, 0, 18]);
    put(sph(6, 4), o.trim, head, H(-0.007, -0.006, 0.035), [0.008, 0.0045, 0.004], hq, [0, 0, -18]);
    put(sph(5, 4), o.trim, head, H(0, -0.006, 0.036), [0.0035, 0.0035, 0.0035], hq);
    put(sph(5, 4), C.rose, head, H(0.015, 0.062, 0.008), [0.006, 0.0035, 0.006], hq);
    put(sph(4, 3), C.butter, head, H(0.015, 0.0655, 0.008), [0.0022, 0.0022, 0.0022], hq);
  } else if (o.hat === "tophat") {
    const tq = hq.clone().multiply(euler([-8, 0, 10]));
    const hp = (x: number, y: number, z: number) => H(0, 0.05, 0.002).add(L(x, y, z).applyQuaternion(tq));
    const axis = D(L(0, 1, 0).applyQuaternion(tq));
    const hatLoop = [[0, 0], [0.026, 0], [0.0275, 0.002], [0.0275, 0.004], [0.0178, 0.005], [0.0178, 0.04], [0.0165, 0.0425], [0, 0.0425]];
    b.lathe(hatLoop.map(([x, y]) => [x * MS, y * MS]), {
      at: P(hp(0, 0, 0)),
      axis,
      bone: head,
      color: o.hatColor,
      segments: 10,
    });
    hoop(head, (a) => hp(Math.sin(a) * 0.0182, 0.0085, Math.cos(a) * 0.0182), 10, 0.0026, C.band);
  } else {
    // hair bow
    put(sph(6, 4), o.hatColor, head, H(0.012, 0.057, 0.014), [0.011, 0.005, 0.006], hq, [0, 0, -22]);
    put(sph(6, 4), o.hatColor, head, H(-0.002, 0.058, 0.014), [0.011, 0.005, 0.006], hq, [0, 0, 22]);
    put(sph(5, 4), o.trim, head, H(0.005, 0.0585, 0.014), [0.0045, 0.0045, 0.0045], hq);
  }

  // --- arms
  const garb = o.garb;
  const sleeveCol = o.sleeve ?? o.cloth;
  const sleeveTo = garb === "smock" ? 0.4 : 0.82;
  const wrists: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulder = L(s * 0.031, 0.084, 0.006);
    const hand = L(...((s > 0 ? o.handL : o.handR) as [number, number, number]));
    const pts = limb(P(shoulder), P(hand), [0.037 * MS, 0.037 * MS], [D(L(s * 0.5, -1, -0.35))]);
    const arm = b.chain(`arm${S}${id}`, pts, {
      parent: chest,
      names: [`shoulder${S}${id}`, `elbow${S}${id}`, `wrist${S}${id}`],
      role: "arm",
    });
    wrists[S] = arm.tip!;
    b.sweep(arm, [0.0105 * MS, 0.0078 * MS], { color: furPaint });
    b.sweep(arm, (t: number) => (0.0138 - 0.0034 * t) * MS, { from: 0, to: sleeveTo, color: sleeveCol });
    if (garb === "waistcoat")
      b.sweep(arm, (t: number) => (0.0112 - 0.0034 * t) * MS, { from: 0.82, to: 0.92, color: C.white });
    // paw
    b.part(sph(7, 5), C.pink, {
      bone: wrists[S],
      at: P(hand),
      quat: q,
      scale: [0.0115 * MS, 0.0095 * MS, 0.012 * MS],
      flat: true,
    });
    put(sph(5, 4), C.pink, wrists[S], hand.clone().add(L(-s * 0.006, 0.004, 0.008)), [0.0045, 0.0045, 0.0055]);
    put(sph(5, 4), C.pink, wrists[S], hand.clone().add(L(s * 0.005, 0.004, 0.009)), [0.0042, 0.0042, 0.0052]);
    // puff sleeve shoulder
    if (garb === "dress")
      put(sph(7, 5), sleeveCol, chest, shoulder.clone().add(L(s * 0.002, -0.003, 0)), [0.0185, 0.0155, 0.0165]);
  }

  // --- legs
  const trousers = garb === "waistcoat";
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const lp = [L(s * 0.021, 0.03, 0), L(s * 0.026, 0.022, 0.038), L(s * 0.026, 0.0135, 0.072)].map(P);
    const leg = b.chain(`leg${S}${id}`, catmull(lp), {
      parent: hips,
      names: [`hip${S}${id}`, `knee${S}${id}`, `ankle${S}${id}`],
      role: "leg",
    });
    b.sweep(leg, [0.0148 * MS, 0.01 * MS], { color: trousers ? C.trou : furPaint });
    const foot = trousers ? C.shoe : C.pink;
    put(sph(8, 5), foot, leg.tip!, L(s * 0.026, 0.0095, 0.088), [0.0108, 0.0088, trousers ? 0.022 : 0.02]);
    if (!trousers) for (const k of [-1, 0, 1]) put(sph(4, 3), C.pink, leg.tip!, L(s * 0.026 + k * 0.0055, 0.006, 0.107), [0.003, 0.003, 0.0036]);
  }

  // --- tail
  const ts = o.tailSide ?? 1;
  const tailPts = [L(0, 0.02, -0.03), L(ts * 0.012, 0.013, -0.065), L(ts * 0.04, 0.012, -0.085), L(ts * 0.07, 0.012, -0.07), L(ts * 0.08, 0.02, -0.04)].map(P);
  const tail = b.chain(`tail${id}`, catmull(tailPts), {
    parent: hips,
    count: 4,
    names: (i: number) => `tail${i + 1}${id}`,
    role: "tail",
  });
  b.sweep(tail, [0.0068 * MS, 0.0012 * MS], { color: C.pink, sides: 6 });

  // --- clothing
  const torsoOpts: any = {
    from: 0.1,
    to: 0.93,
    color: o.cloth,
  };
  if (garb === "waistcoat")
    torsoOpts.sectors = [[125, 162, C.vest], [162, 198, C.white], [198, 235, C.vest]];
  const torso = b.sweep(spine, (t: number) => rb(t) + 0.0032 * MS, torsoOpts);

  const skirtR = o.skirtR ?? (garb === "smock" ? 0.046 : garb === "waistcoat" ? 0.04 : 0.056);
  const skirtColor = garb === "waistcoat" ? C.coat : garb === "smock" ? o.cloth : o.cloth;
  const skirtTop = garb === "waistcoat" ? 0.06 : 0.07;
  const skirt = b.lathe(
    [[0, skirtTop], [0.032, skirtTop], [0.043, skirtTop - 0.024], [skirtR * 0.93, 0.012], [skirtR, 0], [0, 0]].map(([x, y]) => [x * MS, y * MS]),
    { at: P(L(0, 0, -0.002)), bone: hips, color: skirtColor, segments: 12 },
  );
  if (garb !== "waistcoat")
    hoop(hips, (a) => L(Math.sin(a) * skirtR * 0.97, 0.006, Math.cos(a) * skirtR * 0.97 - 0.002), 14, 0.0042, o.trim);

  // collar
  hoop(chest, (a) => L(Math.sin(a) * 0.0225, 0.091, 0.0135 + Math.cos(a) * 0.0225), 10, 0.0035, garb === "waistcoat" ? C.white : o.trim);

  if (garb === "pinafore") {
    const front = D(L(0, 0, -1));
    const hb = b.surface(torso).ray(P(L(0, 0.07, 0.3)), front);
    if (hb) b.decal(torso, APRON_BIB, { at: hb, size: [0.056 * MS, 0.056 * MS], up: [0, 1, 0] });
    const hs = b.surface(skirt).ray(P(L(0, 0.032, 0.3)), front);
    if (hs) b.decal(skirt, APRON_SKIRT, { at: hs, size: [0.085 * MS, 0.075 * MS], up: [0, 1, 0] });
    // apron bow at back
    put(sph(6, 4), C.white, hips, L(0.01, 0.066, -0.034), [0.011, 0.005, 0.006], undefined, [0, 0, 20]);
    put(sph(6, 4), C.white, hips, L(-0.01, 0.066, -0.034), [0.011, 0.005, 0.006], undefined, [0, 0, -20]);
    put(sph(5, 4), C.white, hips, L(0, 0.066, -0.035), [0.004, 0.004, 0.004]);
  } else if (garb === "dress") {
    // sash and back bow
    hoop(spine.joints[1], (a) => L(Math.sin(a) * (rb(0.5) / MS + 0.0055), 0.064, 0.0 + Math.cos(a) * (rb(0.5) / MS + 0.0055)), 10, 0.0042, o.trim);
    put(sph(6, 4), o.trim, hips, L(0.011, 0.066, -0.039), [0.012, 0.005, 0.006], undefined, [0, 0, 22]);
    put(sph(6, 4), o.trim, hips, L(-0.011, 0.066, -0.039), [0.012, 0.005, 0.006], undefined, [0, 0, -22]);
    put(sph(5, 4), o.trim, hips, L(0, 0.066, -0.04), [0.0045, 0.0045, 0.0045]);
  } else if (garb === "waistcoat") {
    const sk = b.surface(torso);
    for (const x of [-0.016, 0.016])
      for (const y of [0.048, 0.062, 0.076]) {
        const h = sk.ray(P(L(x, y, 0.3)), D(L(0, 0, -1)));
        if (h) b.stick(new THREE.SphereGeometry(0.0042 * MS, 6, 4), C.gold, h, { embed: 0.3 });
      }
    // bow tie
    put(sph(6, 4), C.dblue, chest, L(0.011, 0.089, 0.036), [0.0125, 0.0065, 0.005], undefined, [0, 0, 18]);
    put(sph(6, 4), C.dblue, chest, L(-0.011, 0.089, 0.036), [0.0125, 0.0065, 0.005], undefined, [0, 0, -18]);
    put(sph(5, 4), C.dblue, chest, L(0, 0.089, 0.037), [0.0048, 0.0048, 0.0048]);
  } else {
    // smock: little pocket and collar scallops
    put(sph(6, 4), C.white, chest, L(0.0, 0.05, 0.034), [0.01, 0.009, 0.003]);
  }

  return {
    P,
    D,
    q,
    MS,
    head,
    jaw,
    hq,
    spine,
    wristL: wrists.L,
    wristR: wrists.R,
    handW: (s: "L" | "R") => P(L(...((s === "L" ? o.handL : o.handR) as [number, number, number]))),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Build

export default function build() {
  const b = createBuilder({ name: "mice-tea-party" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---- paints for crockery
  const porcelain = (p: THREE.Vector3, n: THREE.Vector3) => {
    void p;
    return mix("#d4dae6", C.porc, smoothstep(-0.7, 0.6, n.y));
  };
  const cupPaint = paint((p, n) => {
    const y = p.y;
    if (y > RIM_Y - 0.012) return C.gold;
    if (y > RIM_Y - 0.03 && y < RIM_Y - 0.022) return C.blue;
    if (y < cy(0.032)) return C.gold;
    return porcelain(p, n);
  });
  const saucerPaint = paint((p, n) => {
    const r = Math.hypot(p.x, p.z);
    if (r > cr(0.335) && n.y > 0.3) return C.gold;
    if (r > cr(0.343)) return C.gold;
    if (Math.abs(r - cr(0.275)) < 0.005 && n.y > 0.5) return C.blue;
    if (Math.abs(r - cr(0.25)) < 0.002 && n.y > 0.5) return C.gold;
    return porcelain(p, n);
  });

  // ---- saucer
  const sauBot = [[0, 0.008], [0.12, 0], [0.16, 0], [0.2, 0.01], [0.33, 0.034], [0.345, 0.038]];
  const sauTop = [[0.345, 0.046], [0.33, 0.042], [0.2, 0.02], [0.14, 0.016], [0, 0.016]];
  const saucer = b.lathe([...sauBot, ...sauTop].map(([r, y]) => [cr(r), y]), {
    at: [0, 0, 0],
    bone: root,
    color: saucerPaint,
    segments: 30,
  });

  // ---- cup
  const cup = b.lathe(CUP_RAW.map(([r, y]) => [cr(r), cy(y)]), {
    at: [0, 0, 0],
    bone: root,
    color: cupPaint,
    segments: 28,
  });
  const handlePath = [[0.19, 0.19], [0.27, 0.215], [0.3, 0.185], [0.31, 0.14], [0.285, 0.105], [0.19, 0.098]].map(([r, y]) =>
    v3(cr(r), cy(y), 0),
  );
  b.sweep(catmull(handlePath), 0.018, { bone: root, color: cupPaint, up: [0, 0, 1], sides: 8 });
  // gold ribs on handle
  b.along(catmull(handlePath), 5, (at: any) => b.part(new THREE.SphereGeometry(0.0125, 6, 4), C.gold, { bone: root, at: at.at, flat: true }), {
    from: 0.2,
    to: 0.85,
  });

  // cup decals
  const cupSurf = b.surface(cup);
  const cupC = v3(0, cy(0.125), 0);
  const front = cupSurf.around(cupC).at(0, 0);
  if (front) b.decal(cup, BANNER, { at: front, size: [0.3, 0.19] });
  for (const az of [-48, 48, 135, 180, 225, 270]) {
    const h = cupSurf.around(cupC).at(az, 0);
    if (h) b.decal(cup, SPRIG, { at: h, size: [0.13, 0.13] });
  }
  // saucer sprigs
  for (const az of [75, 120, 165, 215, 260, 305]) {
    const r = cr(0.285);
    const p = polar(az, r);
    b.decal(saucer, SPRIG, {
      at: v3(p.x, saucerY(r), p.z),
      dir: [0, 1, 0],
      up: [Math.sin(az * D2R), 0, Math.cos(az * D2R)],
      size: [0.085, 0.085],
    });
  }

  // ---- cloth, spool table
  const clothPaint = paint((p) => {
    const a = Math.floor(p.x / 0.02) & 1;
    const c = Math.floor(p.z / 0.02) & 1;
    return a && c ? "#c76d6a" : a || c ? "#ecb9ac" : "#fbf3ea";
  });
  b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.005, 30), clothPaint, { bone: root, at: [0, FLOOR_Y + 0.0025, 0] });

  const woodPaint = grain(C.wood, C.woodDk, { size: 0.008 });
  const spoolPaint = paint((p, _n, s) => {
    const h = s[0];
    if (Math.hypot(p.x, p.z) < 0.037 && h > 0.011 && h < 0.07)
      return mix("#b9524a", "#8f3a36", 0.5 + 0.5 * Math.sin(h * 1100));
    return woodPaint;
  });
  b.lathe(
    [[0, 0], [0.048, 0], [0.05, 0.002], [0.05, 0.008], [0.035, 0.011], [0.035, 0.07], [0.07, 0.074], [0.07, 0.082], [0.068, 0.085], [0, 0.085]],
    { at: [0, MOUSE_Y, 0], bone: root, color: spoolPaint, segments: 16 },
  );
  b.part(new THREE.CircleGeometry(0.066, 28), "#fbf7ee", {
    bone: root,
    at: [0, TT, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: LACE,
  });

  // ---- tea things (world meters)
  const miniCup = (tint: string) =>
    paint((_p, _n, s) => (s[0] > 0.0166 ? C.gold : s[0] > 0.0115 && s[0] < 0.0135 ? tint : C.porc));
  const miniSaucer = paint((_p, _n, s) => (s[0] > 0.0042 ? C.gold : C.porc));
  const teacup = (bone: Joint, at: THREE.Vector3, tint: string, saucerOn = true, tea = true) => {
    let y = 0;
    if (saucerOn) {
      b.lathe([[0, 0.001], [0.012, 0], [0.02, 0.0025], [0.0215, 0.0045], [0.0195, 0.0043], [0.012, 0.003], [0, 0.003]], {
        at, bone, color: miniSaucer, segments: 12,
      });
      y = 0.003;
    }
    const base = at.clone().add(v3(0, y, 0));
    b.lathe(
      [[0, 0], [0.006, 0], [0.0095, 0.004], [0.0112, 0.016], [0.0118, 0.0178], [0.0105, 0.0178], [0.0098, 0.0165], [0.008, 0.006], [0, 0.0045]],
      { at: base, bone, color: miniCup(tint), segments: 12 },
    );
    if (tea) b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.0004, 10), C.tea, { bone, at: base.clone().add(v3(0, 0.0135, 0)) });
    b.sweep(
      catmull([v3(0.0112, 0.014, 0), v3(0.0165, 0.0125, 0), v3(0.0165, 0.008, 0), v3(0.0105, 0.004, 0)].map((v) => v.add(base))),
      0.0014,
      { bone, color: C.porc, sides: 5 },
    );
  };

  const teapot = (bone: Joint, o: THREE.Vector3, q: THREE.Quaternion) => {
    const pt = (x: number, y: number, z: number) => v3(x, y, z).applyQuaternion(q).add(o);
    const ax = v3(0, 1, 0).applyQuaternion(q);
    const potPaint = spots(C.rosePot, C.white, { size: 0.011, amount: 0.45, seed: 4 });
    b.lathe([[0, 0], [0.016, 0], [0.021, 0.004], [0.0255, 0.017], [0.022, 0.03], [0.0145, 0.0345], [0.0095, 0.036], [0, 0.036]], {
      at: o, axis: ax, bone, color: potPaint, segments: 10,
    });
    b.lathe([[0, 0.0345], [0.0105, 0.0345], [0.0098, 0.0375], [0.0045, 0.0405], [0, 0.041]], {
      at: o, axis: ax, bone, color: C.porc, segments: 10,
    });
    b.part(sph(6, 4), C.gold, { bone, at: pt(0, 0.0435, 0), scale: [0.0036, 0.0036, 0.0036], flat: true });
    b.sweep(catmull([pt(0.022, 0.014, 0), pt(0.034, 0.022, 0), pt(0.0425, 0.0345, 0)]), [0.0075, 0.0035], { bone, color: C.rosePot, sides: 6 });
    b.sweep(catmull([pt(-0.021, 0.03, 0), pt(-0.0345, 0.031, 0), pt(-0.0375, 0.018, 0), pt(-0.0235, 0.008, 0)]), 0.0028, {
      bone, color: C.rosePot, sides: 6,
    });
  };

  const cupcake = (at: THREE.Vector3, icing: string) => {
    b.lathe([[0, 0], [0.0045, 0], [0.0066, 0.007], [0, 0.007]], { at, bone: root, color: C.tan, segments: 8 });
    b.part(sph(7, 5), icing, { bone: root, at: at.clone().add(v3(0, 0.0095, 0)), scale: [0.0072, 0.0052, 0.0072], flat: true });
    b.part(sph(5, 4), C.strawb, { bone: root, at: at.clone().add(v3(0, 0.0147, 0)), scale: [0.0025, 0.0025, 0.0025], flat: true });
  };

  const tablePos = (az: number, r = 0.04) => v3(r * Math.sin(az * D2R), TT, r * Math.cos(az * D2R));

  // cake stand (front)
  {
    const t = tablePos(0, 0.038);
    b.lathe([[0, 0], [0.014, 0], [0.014, 0.003], [0.003, 0.005], [0.003, 0.034], [0, 0.034]], { at: t, bone: root, color: C.porc, segments: 8 });
    const plate = (y: number, r: number) =>
      b.lathe([[0, 0], [r, 0], [r + 0.001, 0.0015], [r, 0.003], [0, 0.003]], {
        at: t.clone().add(v3(0, y, 0)), bone: root, color: C.porc, segments: 12,
      });
    plate(0.014, 0.02);
    plate(0.031, 0.0125);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      cupcake(t.clone().add(v3(Math.sin(a) * 0.012, 0.017, Math.cos(a) * 0.012)), [C.rose, C.butter, C.lilac][i]);
    }
    b.part(sph(8, 6), C.tan, { bone: root, at: t.clone().add(v3(0, 0.0395, 0)), scale: [0.0085, 0.0065, 0.0085], flat: true });
    b.part(sph(5, 4), C.strawb, { bone: root, at: t.clone().add(v3(0, 0.0455, 0)), scale: [0.003, 0.003, 0.003], flat: true });
  }

  // strawberries on a plate
  {
    const t = tablePos(45, 0.04);
    b.lathe([[0, 0], [0.016, 0], [0.0175, 0.002], [0.017, 0.0035], [0, 0.0035]], { at: t, bone: root, color: C.porc, segments: 12 });
    const berry = spots(C.strawb, "#f3d27a", { size: 0.005, amount: 0.5, seed: 9 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const bp = t.clone().add(v3(Math.sin(a) * 0.007, 0.0095, Math.cos(a) * 0.007));
      b.part(sph(7, 5), berry, { bone: root, at: bp, scale: [0.0058, 0.0068, 0.0058], flat: true });
      b.part(sph(5, 3), C.leaf, { bone: root, at: bp.clone().add(v3(0, 0.0058, 0)), scale: [0.004, 0.0013, 0.004], flat: true });
    }
  }

  // jam jar
  {
    const t = tablePos(320, 0.04);
    const jar = b.lathe([[0, 0], [0.012, 0], [0.0135, 0.003], [0.0135, 0.026], [0.011, 0.029], [0.0105, 0.031], [0, 0.031]], {
      at: t, bone: root, color: C.jam, segments: 10,
    });
    b.part(sph(8, 4), C.cream, { bone: root, at: t.clone().add(v3(0, 0.0325, 0)), scale: [0.0128, 0.0042, 0.0128], flat: true });
    b.sweep(
      catmull(Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return t.clone().add(v3(Math.sin(a) * 0.0125, 0.0302, Math.cos(a) * 0.0125));
      }), { closed: true }),
      0.0009,
      { bone: root, color: C.ribbon, sides: 4 },
    );
    const h = b.surface(jar).ray(t.clone().add(v3(0, 0.016, 0.1)), v3(0, 0, -1));
    if (h) b.decal(jar, JAM, { at: h, size: [0.024, 0.0145] });
  }

  // sugar bowl
  {
    const t = tablePos(195, 0.04);
    b.lathe([[0, 0], [0.007, 0], [0.012, 0.006], [0.0125, 0.014], [0.0105, 0.0165], [0, 0.0165]], {
      at: t, bone: root, color: miniCup(C.rose), segments: 10,
    });
    for (const [x, y, z] of [[-0.004, 0.0182, 0.002], [0.004, 0.0182, -0.002], [0, 0.0235, 0]])
      b.part(box(), C.sugar, { bone: root, at: t.clone().add(v3(x, y, z)), scale: [0.0072, 0.0072, 0.0072], rotation: [0, x * 3000, 0], flat: true });
  }

  // ---- bunting around the front rim
  {
    const ya = cy(0.188);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const az = -60 + i * 15;
      const y = ya - (i % 2 ? 0.032 : 0);
      const r = outerR(y) + 0.008;
      pts.push(v3(r * Math.sin(az * D2R), y, r * Math.cos(az * D2R)));
    }
    const path = catmull(pts);
    b.sweep(path, 0.002, { bone: root, color: C.cream, sides: 4 });
    const cols = [C.rose, C.butter, C.bonnet, C.sage, C.lilac];
    let k = 0;
    b.along(path, 10, (at: any) =>
      b.extrude([[-0.022, 0], [0.022, 0], [0, 0.06]], {
        at: at.at, x: at.axis, y: [0, -1, 0], thickness: 0.002, bevel: 0.0005, color: cols[k++ % cols.length], bone: root,
      }),
    );
  }

  // ---- little flowers on the saucer
  const flower = (at: THREE.Vector3, h: number, petal: string, r = 0.0065) => {
    const top = at.clone().add(v3(0, h, 0));
    b.rod(at, top, 0.0012, C.stem, { bone: root, sides: 5 });
    b.part(sph(6, 3), C.leaf, { bone: root, at: at.clone().add(v3(0.004, h * 0.35, 0)), scale: [0.006, 0.0016, 0.0035], rotation: [0, 0, 20], flat: true });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(sph(6, 4), petal, {
        bone: root,
        at: top.clone().add(v3(Math.cos(a) * r, 0.001, Math.sin(a) * r)),
        quat: qyr(-a),
        scale: [r * 0.85, r * 0.3, r * 0.65],
        flat: true,
      });
    }
    b.part(sph(5, 4), C.butter, { bone: root, at: top.clone().add(v3(0, 0.002, 0)), scale: [r * 0.45, r * 0.35, r * 0.45], flat: true });
  };
  for (const [az, r, h, col] of [[318, 0.47, 0.03, C.rose], [330, 0.5, 0.024, C.lilac], [345, 0.46, 0.034, C.butter], [300, 0.5, 0.026, C.bonnet], [150, 0.5, 0.03, C.rose]] as [number, number, number, string][]) {
    const p = polar(az, r);
    flower(v3(p.x, saucerY(r), p.z), h, col);
  }

  // teaspoon on saucer
  {
    const sp = polar(235, 0.46);
    const base = v3(sp.x, saucerY(0.46) + 0.004, sp.z);
    const dir = v3(Math.cos(0.5), 0, Math.sin(0.5));
    b.rod(base, base.clone().addScaledVector(dir, 0.12), [0.004, 0.0025], "#c8ccd2", { bone: root, sides: 5 });
    b.part(sph(8, 5), "#c8ccd2", { bone: root, at: base.clone().addScaledVector(dir, -0.012), quat: qyr(-0.5), scale: [0.02, 0.005, 0.012], flat: true });
  }

  // butterfly on the handle
  {
    const top = v3(cr(0.27), cy(0.215) + 0.02, 0);
    const wingPaint = spots("#f2d56b", "#8a5a2e", { size: 0.008, amount: 0.4, seed: 2 });
    for (const s of [1, -1])
      b.extrude([[0.001, 0.002], [0.014, 0.016], [0.03, 0.012], [0.032, -0.002], [0.022, -0.008], [0.026, -0.02], [0.012, -0.022], [0.001, -0.008]], {
        at: top, x: [0, 0.5, s * 0.9], y: [1, 0, 0], thickness: 0.0012, color: wingPaint, bone: root, smoothing: 1,
      });
    b.rod(top.clone().add(v3(-0.012, 0, 0)), top.clone().add(v3(0.012, 0, 0)), 0.0022, C.ink, { bone: root, sides: 5 });
    for (const s of [1, -1]) b.rod(top.clone().add(v3(0.012, 0, 0)), top.clone().add(v3(0.024, 0.006, s * 0.006)), 0.0008, C.ink, { bone: root, sides: 4 });
  }

  // ---- the mice
  const R = 0.135;
  const potDirYaw = 30;

  // hostess pours: compute pot
  const hostPos = polar(210, R, MOUSE_Y);
  const fw = v3(Math.sin(potDirYaw * D2R), 0, Math.cos(potDirYaw * D2R));
  const lf = v3(Math.cos(potDirYaw * D2R), 0, -Math.sin(potDirYaw * D2R));
  const phi = 55 * D2R;
  const pdir = fw.clone().multiplyScalar(Math.cos(phi)).addScaledVector(lf, Math.sin(phi));
  const qpot = qyr(Math.atan2(-pdir.z, pdir.x)).multiply(qz(-35));
  const tipL = v3(0.0425, 0.0345, 0);
  const handleL = v3(-0.0365, 0.0185, 0);
  const tipTarget = v3(-0.005, TT + 0.045, -0.009);
  const handW = tipTarget.clone().sub(tipL.clone().sub(handleL).applyQuaternion(qpot));
  const potO = handW.clone().sub(handleL.clone().applyQuaternion(qpot));
  const hostHand = handW
    .clone()
    .sub(hostPos)
    .applyQuaternion(qy(potDirYaw).invert())
    .multiplyScalar(1 / BASE_MS);

  const hostess = mouse(b, root, {
    id: "A", pos: hostPos, yaw: potDirYaw,
    fur: "#9c7b5a", belly: "#ecdcc0", garb: "pinafore",
    cloth: gingham("#f7f3ea", "#aec3da", "#6f8fb3", 20, 0.12), trim: C.white,
    hat: "mobcap", hatColor: C.white,
    headYaw: 28, headPitch: 6,
    handL: [0.04, 0.078, 0.05], handR: [hostHand.x, hostHand.y, hostHand.z],
    tailSide: 1,
  });
  teapot(hostess.wristR, potO, qpot);
  teacup(hostess.wristL, hostess.handW("L").add(v3(0, 0.004, 0)), C.blue);
  // central cup being filled, and the stream of tea
  teacup(root, v3(tipTarget.x, TT, tipTarget.z), C.rose, true, true);
  b.rod(tipTarget.clone().add(v3(0, -0.002, 0)), v3(tipTarget.x, TT + 0.0155, tipTarget.z), 0.0014, C.tea, { bone: root, sides: 5 });

  const gent = mouse(b, root, {
    id: "B", pos: polar(150, R, MOUSE_Y), yaw: 330,
    fur: "#8f8a86", belly: "#e5ddd0", garb: "waistcoat",
    cloth: C.coat, sleeve: C.coat, trim: C.white,
    hat: "tophat", hatColor: C.hat,
    headYaw: -12, headPitch: 4,
    handL: [0.045, 0.05, 0.04], handR: [-0.035, 0.08, 0.055],
    tailSide: -1,
  });
  teacup(gent.wristR, gent.handW("R").add(v3(0, 0.004, 0)), C.dblue);

  const girl = mouse(b, root, {
    id: "C", pos: polar(90, R, MOUSE_Y), yaw: 270,
    fur: "#b08a62", belly: "#f0e2c8", garb: "dress",
    cloth: gingham("#fbeef0", "#f0bfc8", "#d98a9a", 20, 0.12), trim: C.rose,
    hat: "bonnet", hatColor: C.bonnet,
    headYaw: 38, headPitch: 12,
    handL: [0.016, 0.084, 0.058], handR: [-0.016, 0.084, 0.058],
    tailSide: 1,
  });
  {
    const m = girl.handW("L").add(girl.handW("R")).multiplyScalar(0.5);
    teacup(girl.wristL, m.add(v3(0, 0.003, 0)), C.rose, false, true);
  }

  const child = mouse(b, root, {
    id: "D", pos: polar(270, R, MOUSE_Y), yaw: 90, scale: 0.85,
    fur: "#c9bfb2", belly: "#f5eee2", garb: "smock",
    cloth: spots("#f1d36c", C.white, { size: 0.012, amount: 0.5, seed: 11 }), trim: C.white,
    hat: "bow", hatColor: C.ribbon,
    headYaw: -42, headPitch: 14,
    handL: [0.017, 0.078, 0.05], handR: [-0.017, 0.078, 0.05],
    tailSide: -1,
  });
  {
    const m = child.handW("L").add(child.handW("R")).multiplyScalar(0.5).add(v3(0, 0.006, 0));
    b.part(sph(8, 5), mottle(C.bun, C.tan, { size: 0.01, seed: 3 }), { bone: child.wristL, at: m, scale: [0.016, 0.0095, 0.016], flat: true });
    b.part(sph(6, 4), C.white, { bone: child.wristL, at: m.clone().add(v3(0, 0.0085, 0)), scale: [0.009, 0.004, 0.009], flat: true });
    b.part(sph(6, 4), C.jam, { bone: child.wristL, at: m.clone().add(v3(0, 0.0115, 0)), scale: [0.0055, 0.0035, 0.0055], flat: true });
  }

  // late guest on the saucer, with a parcel
  const lgR = 0.46;
  const lgP = polar(18, lgR);
  const late = mouse(b, root, {
    id: "E", pos: v3(lgP.x, saucerY(lgR) - 0.002, lgP.z), yaw: -22, scale: 0.8,
    fur: "#7a5c44", belly: "#d9c3a0", garb: "dress",
    cloth: gingham("#eff5e8", "#b9d0a4", "#86a56a", 20, 0.12), trim: C.butter,
    hat: "bonnet", hatColor: C.cream,
    headYaw: 0, headPitch: 4,
    handL: [0.022, 0.07, 0.058], handR: [-0.022, 0.07, 0.058],
    tailSide: 1,
  });
  {
    const m = late.handW("L").add(late.handW("R")).multiplyScalar(0.5).add(v3(0, 0.0, 0.012));
    const paper = spots("#f0b8b8", C.white, { size: 0.01, amount: 0.45, seed: 6 });
    const bq = qy(-22);
    b.part(box(), paper, { bone: late.wristL, at: m, quat: bq, scale: [0.04, 0.032, 0.036] });
    b.part(box(), C.ribbon, { bone: late.wristL, at: m, quat: bq, scale: [0.0045, 0.0335, 0.0375] });
    b.part(box(), C.ribbon, { bone: late.wristL, at: m, quat: bq, scale: [0.0405, 0.0335, 0.0045] });
    for (const s of [1, -1])
      b.part(sph(6, 4), C.ribbon, {
        bone: late.wristL,
        at: m.clone().add(v3(s * 0.007, 0.0185, 0).applyQuaternion(bq)),
        quat: bq.clone().multiply(qz(-s * 25)),
        scale: [0.0085, 0.004, 0.005],
        flat: true,
      });
  }

  return b.root;
}
```