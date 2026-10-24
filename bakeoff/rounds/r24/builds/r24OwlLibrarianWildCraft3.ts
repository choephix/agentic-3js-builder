// STYLE: "Bookbinder's Marbled-Endpaper Collage".
// The whole owl is assembled like a hand-bound book: every body surface is painted as marbled endpaper
// (swirled, combed veins in cloth-binding colours: oxblood, forest, navy, ochre), feather blades are cut-paper
// pieces whose edges show the cream paper core, and every trim is stamped gilt, like the tooling on a leather spine.
// Even the glowing amber eyes are drawn like engraved bookplates.

import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  vec,
  lerp,
  polyline,
  catmull,
  bezier,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  rgb,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Great Horned Owl Librarian",
  description:
    "A humanoid great horned owl librarian with round gilt spectacles, a marbled-endpaper waistcoat, oxblood cardigan sleeves, feathered wing-arms, a bow tie and a chatelaine of keys and a tiny book. Style: bookbinder's marbled-paper collage with gilt tooling.",
};

type V3 = [number, number, number];
type RGB = readonly [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];
type PaintT = ReturnType<typeof paint>;
type Fill = string | PaintT;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];

// ---------------------------------------------------------------------------------------------------------------
// Palette (cloth-binding colours)
const C = {
  OX: "#7c1e2b",
  OX2: "#a63443",
  FOREST: "#1f4d3b",
  FOREST2: "#33735a",
  NAVY: "#1c2a52",
  NAVY2: "#36548f",
  OCHRE: "#c98f35",
  CREAM: "#f1e4c0",
  CREAM2: "#e2cc98",
  TAWNY: "#b87a3c",
  TAWNY2: "#d9a05a",
  BARK: "#4b2e20",
  BARK2: "#2f1c16",
  INK: "#1b1220",
  GILT: "#dcab3c",
  GILT2: "#f6d77a",
  BEAK: "#3c3a48",
  TALON: "#26222c",
  LEATHER: "#3b2318",
  LEATHER2: "#5d3826",
  PAGE: "#f4ead0",
};

// ---------------------------------------------------------------------------------------------------------------
// Paints: marbled endpaper lit warm on top, cool below
function shade(c: RGB, n: THREE.Vector3): RGB {
  const k = 0.78 + 0.28 * smoothstep(-0.9, 0.9, n.y);
  const w = 0.05 * n.y;
  return [Math.min(1, c[0] * k * (1 + w)), Math.min(1, c[1] * k), Math.min(1, c[2] * k * (1 - w))];
}

function marble(a: string, c2: string, vein: string, o: { size: number; seed: number; dir: THREE.Vector3 }) {
  const A = rgb(a);
  const B = rgb(c2);
  const Vn = rgb(vein);
  const d = o.dir.clone().normalize();
  return paint((p, n) => {
    const w = (noise(p, o.size * 2.4, o.seed) - 0.5) * 3.4 + (noise(p, o.size * 0.8, o.seed + 7) - 0.5) * 1.2;
    const sn = Math.sin((p.dot(d) / o.size + w) * Math.PI * 2);
    let c: RGB = mix(A, B, smoothstep(-0.3, 0.3, sn));
    c = mix(c, Vn, 1 - smoothstep(0.03, 0.1, Math.abs(sn - 0.62)));
    const g = 0.94 + 0.12 * noise(p, 0.012, o.seed + 3);
    return shade([c[0] * g, c[1] * g, c[2] * g], n);
  });
}

const BREAST = marble(C.CREAM, C.TAWNY2, C.BARK, { size: 0.05, seed: 11, dir: V(0.15, 1, 0.1) });
const BACKP = marble(C.BARK, C.TAWNY, C.BARK2, { size: 0.07, seed: 21, dir: V(0.2, 1, 0.3) });
const WAIST = marble(C.FOREST, C.FOREST2, C.GILT, { size: 0.06, seed: 31, dir: V(0.5, 1, 0.4) });
const SLEEVE = marble(C.OX, C.OX2, C.OCHRE, { size: 0.06, seed: 41, dir: V(0.4, 1, 0.2) });
const LEGP = marble(C.CREAM2, C.TAWNY2, C.BARK, { size: 0.045, seed: 51, dir: V(0.1, 1, 0.2) });
const HEADP = marble(C.TAWNY, C.BARK, C.CREAM, { size: 0.055, seed: 61, dir: V(0.3, 0.6, 1) });
const HANDP = marble(C.CREAM2, C.TAWNY, C.BARK, { size: 0.04, seed: 71, dir: V(0.2, 1, 0.5) });
const TIEP = marble(C.NAVY, C.NAVY2, C.GILT, { size: 0.03, seed: 81, dir: V(1, 0.4, 0.2) });
const LEATHERP = marble(C.LEATHER, C.LEATHER2, C.GILT2, { size: 0.04, seed: 91, dir: V(1, 0.3, 0.3) });
const BIBP = marble(C.CREAM, C.PAGE, C.CREAM2, { size: 0.04, seed: 101, dir: V(0.3, 1, 0.2) });

// Torn-paper seam between the feathered breast and the dark back.
const BODYP = paint((p, n) => (n.z + 0.4 * (noise(p, 0.05, 4) - 0.5) > -0.1 ? BREAST : BACKP));
// Waistcoat: the V-neck opening shows the cream chest.
const inV = (p: THREE.Vector3) => p.y > 0.9 && p.y < 1.09 && Math.abs(p.x) < (p.y - 0.9) * 0.55;
const WAISTP = paint((p, n) => (n.z > 0.15 && inV(p) ? BREAST : WAIST));

// Facial disc: concentric tawny rings with a dark rim.
const DISC_Y = 1.325;
function discPaint(cx: number) {
  const T = rgb(C.TAWNY2);
  const Cr = rgb(C.CREAM);
  const Bk = rgb(C.BARK);
  return paint((p, n) => {
    const dx = (p.x - cx) / 0.105;
    const dy = (p.y - DISC_Y) / 0.12;
    const d = Math.hypot(dx, dy);
    const ring = Math.sin(d * Math.PI * 7 + 2.4 * noise(p, 0.05, 3));
    let c: RGB = mix(T, Cr, smoothstep(-0.4, 0.9, ring) * 0.75);
    c = mix(c, Bk, smoothstep(0.78, 0.96, d));
    return shade(c, n);
  });
}

// Cut-paper feather blade: bars, shaft, dark tip, and a cream paper core showing on the cut edge.
function bladePaint(base: string, bar: string, tip: string, len: number, nrm: THREE.Vector3) {
  const B = rgb(base);
  const R = rgb(bar);
  const T = rgb(tip);
  const E = rgb(C.CREAM);
  return paint((_p, n, s) => {
    if (Math.abs(n.dot(nrm)) < 0.5) return E;
    const x = s[0];
    const y = s[1];
    if (y > len * 0.9) return shade(T, n);
    const w = 0.5 + 0.5 * Math.sin(((y + 0.012 * Math.sin(x * 80)) / 0.055) * Math.PI * 2);
    let c: RGB = mix(B, R, smoothstep(0.55, 0.75, w));
    if (Math.abs(x) < 0.0035) c = mix(c, E, 0.6);
    return shade(c, n);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Textures
function featherTex(base: string, bar: string, edge: string) {
  const d = "M20 79 C3 62 1 30 20 2 C39 30 37 62 20 79Z";
  return svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="f"><path d="${d}"/></clipPath></defs>
    <path d="${d}" fill="${base}"/>
    <g clip-path="url(#f)" fill="none" stroke="${bar}" stroke-width="5" stroke-linecap="round">
      <path d="M0 58 Q20 66 40 56"/><path d="M0 42 Q20 50 40 40"/><path d="M0 26 Q20 34 40 24"/>
      <path d="M0 12 Q20 18 40 10" stroke-width="7"/>
    </g>
    <path d="M20 78 L20 6" stroke="${edge}" stroke-width="1.6"/>
    <path d="${d}" fill="none" stroke="${edge}" stroke-width="2.4" stroke-linejoin="round"/>
  </svg>`,
    { size: 128 },
  );
}
const FEATHER_CREAM = featherTex(C.CREAM, C.TAWNY2, C.BARK);
const FEATHER_DARK = featherTex(C.TAWNY, C.BARK, C.BARK2);
const FEATHER_RIM = featherTex(C.BARK, C.TAWNY2, C.INK);

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="e"><circle cx="50" cy="50" r="46"/></clipPath>
    <radialGradient id="ir" cx="0.5" cy="0.55" r="0.6">
      <stop offset="0" stop-color="#ffe45c"/><stop offset="0.7" stop-color="#f2a921"/><stop offset="1" stop-color="#c8681c"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="${C.INK}"/>
  <g clip-path="url(#e)">
    <circle cx="50" cy="50" r="46" fill="url(#ir)"/>
    <g fill="none" stroke="#b5561a" stroke-width="2.2" stroke-linecap="round" opacity="0.9">
      <path d="M8 62 Q30 42 50 60 T92 54"/><path d="M12 76 Q36 60 54 74 T90 70"/><path d="M18 38 Q40 26 60 40 T88 36"/>
    </g>
    <circle cx="50" cy="52" r="17" fill="${C.INK}"/>
    <circle cx="40" cy="44" r="7" fill="#ffffff"/><circle cx="60" cy="62" r="3.2" fill="#ffffff"/>
    <path d="M0 0 H100 V46 Q50 16 0 36Z" fill="#5a3322"/>
    <path d="M0 36 Q50 16 100 46" fill="none" stroke="${C.INK}" stroke-width="4"/>
  </g>
</svg>`,
  { size: 256 },
);

const LENS = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 44 Q24 28 40 20" stroke="#f4fbff" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M28 62 Q30 55 35 51" stroke="#f4fbff" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="76" cy="80" r="3.5" fill="#f4fbff"/>
</svg>`,
  { size: 128 },
);

const BADGE = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="118" height="38" rx="6" fill="#e6b84a" stroke="#4a2f10" stroke-width="2"/>
  <rect x="5" y="5" width="110" height="30" rx="3" fill="none" stroke="#8a5d16" stroke-width="1.2"/>
  <text x="60" y="15" text-anchor="middle" font-family="serif" font-size="8" font-weight="bold" letter-spacing="2" fill="#3a2410">HEAD</text>
  <text x="60" y="31" text-anchor="middle" font-family="serif" font-size="14" font-weight="bold" fill="#3a2410">LIBRARIAN</text>
</svg>`,
  { size: 384 },
);

const POCKET = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 6 H94 V50 Q94 64 80 64 H20 Q6 64 6 50Z" fill="#18402f" stroke="#e0b040" stroke-width="3"/>
  <path d="M12 12 H88 V48 Q88 58 78 58 H22 Q12 58 12 48Z" fill="none" stroke="#e0b040" stroke-width="1.6" stroke-dasharray="4 3"/>
  <path d="M50 52 C38 42 38 28 50 18 C62 28 62 42 50 52Z" fill="#e0b040"/>
  <path d="M50 50 L50 24" stroke="#18402f" stroke-width="1.4"/>
  <path d="M48 44 C36 44 28 38 26 30 M52 44 C64 44 72 38 74 30" stroke="#e0b040" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#17382b" stroke="#e0b040" stroke-width="3"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#e0b040" stroke-width="1.4" stroke-dasharray="3 2.6"/>
  <g fill="#e0b040">
    <path d="M34 30 L32 10 L44 24Z"/><path d="M66 30 L68 10 L56 24Z"/>
    <ellipse cx="50" cy="36" rx="17" ry="13"/>
    <ellipse cx="50" cy="60" rx="19" ry="21"/>
  </g>
  <circle cx="43" cy="35" r="5.5" fill="#17382b"/><circle cx="57" cy="35" r="5.5" fill="#17382b"/>
  <circle cx="43" cy="35" r="2.4" fill="#e0b040"/><circle cx="57" cy="35" r="2.4" fill="#e0b040"/>
  <path d="M47 41 L53 41 L50 47Z" fill="#17382b"/>
  <path d="M36 54 Q50 72 64 54 M38 62 Q50 78 62 62" stroke="#17382b" stroke-width="2" fill="none"/>
  <text x="50" y="91" text-anchor="middle" font-family="serif" font-size="8" font-weight="bold" letter-spacing="1.5" fill="#e0b040">EX LIBRIS</text>
</svg>`,
  { size: 256 },
);

const COVER = svg(
  `<svg viewBox="0 0 70 95" xmlns="http://www.w3.org/2000/svg">
  <rect width="70" height="95" fill="${C.NAVY}"/>
  <rect x="4" y="4" width="62" height="87" fill="none" stroke="#e0b040" stroke-width="2"/>
  <rect x="8" y="8" width="54" height="79" fill="none" stroke="#e0b040" stroke-width="0.9"/>
  <g fill="#e0b040">
    <path d="M12 12 l5 0 l-5 5Z"/><path d="M58 12 l-5 0 l5 5Z"/><path d="M12 83 l5 0 l-5 -5Z"/><path d="M58 83 l-5 0 l5 -5Z"/>
    <path d="M35 28 L44 42 L35 56 L26 42Z"/>
  </g>
  <circle cx="35" cy="42" r="4" fill="${C.NAVY}"/>
  <path d="M35 24 V16 M35 60 V68 M20 42 H14 M50 42 H56" stroke="#e0b040" stroke-width="1.6"/>
  <text x="35" y="78" text-anchor="middle" font-family="serif" font-size="8" font-weight="bold" fill="#e0b040">CATALOGUE</text>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "owl-librarian", paintSize: 2048 });
  type Bone = ReturnType<typeof b.joint>;

  // Head scale anchors: the skull centre.
  const HC = { x: 0, y: 1.31, z: 0.07 };
  const hc = (dx: number, dy: number, dz: number): V3 => [HC.x + dx, HC.y + dy, HC.z + dz];

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.66, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, 0],
      [0, 0.8, 0.005],
      [0, 0.95, 0.02],
      [0, 1.1, 0.035],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.1, 0.035], dir: [0, 1, 0.15], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.17, 0.05], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hc(0, -0.055, 0.16),
    aim: hc(0, -0.085, 0.255),
    role: "jaw",
  });

  // ---------------- Reusable helpers ----------------
  const featherOutline = (len: number, wid: number): Pt[] => [
    [0, 0],
    [wid * 0.45, len * 0.12],
    [wid * 0.5, len * 0.55],
    [wid * 0.3, len * 0.88],
    [0, len, "sharp"],
    [-wid * 0.3, len * 0.88],
    [-wid * 0.5, len * 0.55],
    [-wid * 0.45, len * 0.12],
  ];

  // A cut-paper feather blade rooted at `at`, running along `along`, its flat face toward `normal`.
  function blade(
    len: number,
    wid: number,
    at: V3,
    along: V3,
    normal: V3,
    mk: (len: number, th: THREE.Vector3) => PaintT,
    bone: Bone,
    thick = 0.012,
  ) {
    const y = vec(along).normalize();
    const x = vec(normal).cross(y).normalize();
    const th = x.clone().cross(y).normalize();
    return b.extrude(featherOutline(len, wid), {
      at,
      x: arr(x),
      y: arr(y),
      thickness: [thick, thick * 0.45],
      bevel: thick * 0.3,
      smoothing: 1,
      color: mk(len, th),
      bone,
    });
  }

  function digit(name: string, parent: Bone, pts: THREE.Vector3[], r: number, color: Fill, talon: number) {
    const ch = b.chain(name, polyline(pts.map(arr)), { parent, role: "digit" });
    b.sweep(ch, [r, r * 0.7], { color, sides: 6 });
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const t = last.clone().sub(prev).normalize().add(V(0, -0.8, 0)).normalize();
    b.spike(arr(last), arr(t), talon, r * 0.85, { color: C.TALON, bone: ch.joints[ch.joints.length - 1] });
    return ch;
  }

  const mkPrimary = (len: number, th: THREE.Vector3) => bladePaint(C.BARK, C.TAWNY2, C.INK, len, th);
  const mkCovert = (len: number, th: THREE.Vector3) => bladePaint(C.TAWNY2, C.BARK, C.CREAM, len, th);
  const mkTuft = (len: number, th: THREE.Vector3) => bladePaint(C.BARK2, C.TAWNY, C.INK, len, th);
  const mkTail = (len: number, th: THREE.Vector3) => bladePaint(C.BARK, C.CREAM2, C.INK, len, th);

  // ---------------- Torso ----------------
  const keysR: [number, number, number][] = [
    [0, 0.16, 0.15],
    [0.35, 0.22, 0.21],
    [0.7, 0.23, 0.21],
    [1, 0.16, 0.14],
  ];
  const bodyR =
    (grow: number) =>
    (t: number): [number, number] => {
      for (let i = 0; i < keysR.length - 1; i++) {
        const [t0, a0, b0] = keysR[i];
        const [t1, a1, b1] = keysR[i + 1];
        if (t <= t1) {
          const u = smoothstep(t0, t1, t);
          return [a0 + (a1 - a0) * u + grow, b0 + (b1 - b0) * u + grow];
        }
      }
      const l = keysR[keysR.length - 1];
      return [l[1] + grow, l[2] + grow];
    };

  const body = b.sweep(spine, bodyR(0), { shift: [0, -0.025], color: BODYP, caps: "round" });
  const waist = b.sweep(spine, bodyR(0.013), {
    from: 0.05,
    to: 0.96,
    shift: [0, -0.025],
    color: WAISTP,
    caps: "none",
  });
  const bodySkin = b.surface(body);
  const waistSkin = b.surface(waist);
  const frontRay = (skin: ReturnType<typeof b.surface>, x: number, y: number) =>
    skin.ray([x, y, 1.2], [0, 0, -1]);

  // Tail fan behind the hips.
  for (let i = 0; i < 5; i++) {
    const psi = (i - 2) * 0.32;
    blade(
      0.3 - Math.abs(i - 2) * 0.025,
      0.1,
      [(i - 2) * 0.03, 0.6, -0.14],
      [Math.sin(psi) * 0.6, -0.5, -0.8],
      [0, 1, 0],
      mkTail,
      hips,
      0.014,
    );
  }

  // Waistcoat: V piping, buttons, belt and buckle, pocket, badge, back emblem.
  for (const s of [1, -1]) {
    const edge = polyline([
      [0, 0.905, 0.27],
      [s * 0.05, 0.99, 0.26],
      [s * 0.095, 1.075, 0.2],
    ]);
    b.sweep(waistSkin.drape(edge, { lift: 0.006 }), 0.0065, { color: C.GILT, sides: 6 });
  }
  for (const y of [0.87, 0.82, 0.77]) {
    const h = frontRay(waistSkin, 0, y);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.0145, 0.0145, 0.012, 10), C.GILT, h, { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(0.006, 6, 4), C.GILT2, h.moved([0, 0.006, 0]), { embed: 0.2 });
    }
  }
  b.sweep(waistSkin.loop([0, 0.73, 0], { lift: 0.006 }), 0.014, { color: LEATHERP, sides: 8 });
  const buckleHit = frontRay(waistSkin, 0, 0.73);
  if (buckleHit) {
    const bp = buckleHit.at;
    b.extrude(
      [
        [-0.03, -0.022],
        [0.03, -0.022],
        [0.03, 0.022],
        [-0.03, 0.022],
      ],
      { at: [bp.x, bp.y, bp.z + 0.012], x: [1, 0, 0], thickness: 0.008, bevel: 0.002, color: C.GILT, bone: spine.joints[0] },
    );
    b.extrude(
      [
        [-0.017, -0.011],
        [0.017, -0.011],
        [0.017, 0.011],
        [-0.017, 0.011],
      ],
      { at: [bp.x, bp.y, bp.z + 0.018], x: [1, 0, 0], thickness: 0.006, color: C.INK, bone: spine.joints[0] },
    );
  }
  b.decal(waist, POCKET, { at: [0.12, 0.85, 0.22], dir: [0, 0, 1], size: [0.1, 0.07], segments: 10 });
  b.decal(waist, BADGE, { at: [-0.115, 0.96, 0.22], dir: [0, 0, 1], size: [0.09, 0.03], segments: 10 });
  b.decal(waist, EMBLEM, { at: [0, 0.9, -0.2], dir: [0, 0, -1], size: [0.2, 0.2], segments: 12 });

  // Spectacle cord and magnifier pendant on the chest.
  const cord = waistSkin.drape(
    catmull([
      [0.11, 1.09, 0.17],
      [0.1, 1.03, 0.25],
      [0.05, 0.975, 0.29],
      [0, 0.955, 0.3],
      [-0.05, 0.975, 0.29],
      [-0.1, 1.03, 0.25],
      [-0.11, 1.09, 0.17],
    ]),
    { lift: 0.008 },
  );
  b.sweep(cord, 0.0045, { color: C.GILT, sides: 6 });
  const pend = frontRay(waistSkin, 0, 0.93);
  if (pend) {
    const pc = pend.at;
    const rc: V3 = [pc.x, pc.y - 0.02, pc.z + 0.035];
    const ringPts: V3[] = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [rc[0] + Math.cos(a) * 0.03, rc[1] + Math.sin(a) * 0.03, rc[2]];
    });
    b.sweep(catmull(ringPts, { closed: true }), 0.0045, { color: C.GILT, bone: spine.joints[1], sides: 6 });
    b.part(new THREE.PlaneGeometry(0.056, 0.056), "#ffffff", {
      bone: spine.joints[1],
      at: [rc[0], rc[1], rc[2] + 0.001],
      dir: [0, 0, 1],
      axis: "z",
      texture: LENS,
    });
    b.rod([rc[0], rc[1] - 0.03, rc[2]], [rc[0], rc[1] - 0.085, rc[2]], 0.0065, C.LEATHER, { bone: spine.joints[1] });
    b.sphere?.call?.(b, 0);
  }

  // Bow tie at the neckline.
  const tieHit = frontRay(bodySkin, 0, 1.085);
  if (tieHit) {
    const tp = tieHit.at;
    const tz = tp.z + 0.012;
    for (const s of [1, -1]) {
      b.extrude(
        [
          [0, 0],
          [0.07, 0.036],
          [0.075, 0.0],
          [0.07, -0.036],
        ],
        {
          at: [tp.x + s * 0.01, tp.y, tz],
          x: [s, 0, 0],
          y: [0, 1, 0],
          thickness: [0.02, 0.012],
          bevel: 0.004,
          smoothing: 1,
          color: TIEP,
          bone: chest,
        },
      );
      b.part(new THREE.SphereGeometry(0.006, 6, 4), C.GILT2, {
        bone: chest,
        at: [tp.x + s * 0.045, tp.y + 0.008, tz + 0.012],
      });
    }
    b.part(new THREE.BoxGeometry(0.03, 0.036, 0.026), C.NAVY, { bone: chest, at: [tp.x, tp.y, tz + 0.004] });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), C.GILT, { bone: chest, at: [tp.x, tp.y, tz + 0.018] });
  }

  // Chest fluff in the V and a neck ruff of cards.
  const chestHits = waistSkin.scatter(90, {
    rng: rng(2),
    minDist: 0.022,
    filter: (h) => h.n.z > 0.3 && inV(h.at) && Math.abs(h.at.x) < (h.at.y - 0.9) * 0.45,
  });
  b.cards(chestHits, FEATHER_CREAM, {
    size: [0.04, 0.07],
    lean: 55,
    flow: [0, -1, 0],
    bend: 20,
    vary: 0.25,
    rng: rng(3),
    spin: 8,
  });
  for (const [y, r, cnt, seed] of [
    [1.12, 0.2, 26, 5],
    [1.16, 0.17, 22, 6],
  ] as const) {
    const ruff = b.ring(frame([0, y, 0.04], [0, 1, 0]), { count: cnt, radius: r, fromDeg: 45, toDeg: 315 }).items;
    b.cards(ruff, [FEATHER_CREAM, FEATHER_DARK], {
      size: [0.06, 0.12],
      lean: 55,
      flow: [0, -1, 0],
      bend: 20,
      vary: 0.25,
      rng: rng(seed),
      spin: 8,
      bone: neck,
    });
  }

  // ---------------- Head ----------------
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), HEADP, {
    bone: head,
    at: [HC.x, HC.y, HC.z],
    scale: [0.235, 0.19, 0.2],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), BIBP, {
    bone: head,
    at: hc(0, -0.115, 0.12),
    scale: [0.09, 0.06, 0.07],
    flat: true,
  });
  const skullSkin = b.surface(skull);
  b.cards(
    skullSkin.scatter(60, { rng: rng(8), minDist: 0.03, filter: (h) => h.n.y > 0.35 }),
    FEATHER_DARK,
    { size: [0.045, 0.08], lean: 70, flow: [0, -0.2, -1], bend: 20, vary: 0.25, rng: rng(9) },
  );

  // Ear tufts (the horns): layered cut-paper blades.
  for (const s of [1, -1]) {
    const base: V3 = [s * 0.125, 1.455, 0.075];
    const tufts = [
      { len: 0.22, lean: 0.25, dx: 0, w: 0.08 },
      { len: 0.16, lean: 0.6, dx: s * 0.035, w: 0.07 },
      { len: 0.15, lean: -0.05, dx: -s * 0.03, w: 0.07 },
    ];
    tufts.forEach((t, i) => {
      blade(
        t.len,
        t.w,
        [base[0] + t.dx, base[1], base[2] - i * 0.012],
        [s * t.lean, 1, -0.15],
        [0, 0, 1],
        mkTuft,
        head,
        0.03 - i * 0.004,
      );
    });
  }

  // Facial discs, rims, eyes.
  const discs: Record<number, ReturnType<typeof b.part>> = {};
  for (const s of [1, -1]) {
    const cx = s * 0.098;
    const dc = hc(cx, 0.015, 0.17);
    discs[s] = b.part(new THREE.SphereGeometry(1, 14, 10), discPaint(cx), {
      bone: head,
      at: dc,
      scale: [0.105, 0.12, 0.055],
      flat: true,
    });
    const rimPts: V3[] = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return [dc[0] + Math.cos(a) * 0.105, dc[1] + Math.sin(a) * 0.12, dc[2] + 0.012];
    });
    b.sweep(catmull(rimPts, { closed: true }), 0.011, { color: C.BARK2, bone: head, sides: 6 });
    const fringe = b.ring(frame(dc, [0, 0, 1]), { count: 20, radius: 0.112 }).items;
    b.cards(fringe, FEATHER_RIM, {
      size: [0.035, 0.06],
      lean: 50,
      flow: [0, 0, 1],
      vary: 0.2,
      rng: rng(12 + (s > 0 ? 1 : 2)),
      bone: head,
    });
  }

  const EYE_Y = HC.y + 0.03;
  const EX = 0.105;
  const LENS_Z = 0.335;
  const LENS_R = 0.068;
  for (const s of [1, -1]) {
    glow(
      b.decal(discs[s], EYE, {
        at: [s * EX, EYE_Y, 0.3],
        dir: [0, 0, 1],
        size: [0.1, 0.1],
        mirror: s > 0,
        segments: 8,
      }),
      0.8,
    );

    // Spectacles: gilt wire rim, lens glints, hinge, temple arm.
    const ringPts: V3[] = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return [s * EX + Math.cos(a) * LENS_R, EYE_Y + Math.sin(a) * LENS_R, LENS_Z];
    });
    b.sweep(catmull(ringPts, { closed: true }), 0.0055, { color: C.GILT, bone: head, sides: 6 });
    b.part(new THREE.PlaneGeometry(LENS_R * 1.9, LENS_R * 1.9), "#ffffff", {
      bone: head,
      at: [s * EX, EYE_Y, LENS_Z + 0.001],
      dir: [0, 0, 1],
      axis: "z",
      texture: LENS,
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), C.GILT2, {
      bone: head,
      at: [s * (EX + LENS_R + 0.004), EYE_Y + 0.004, LENS_Z],
    });
    b.sweep(
      catmull([
        [s * (EX + LENS_R + 0.004), EYE_Y + 0.004, LENS_Z],
        [s * 0.222, EYE_Y + 0.006, 0.17],
        [s * 0.238, EYE_Y - 0.004, 0.02],
      ]),
      0.0045,
      { color: C.GILT, bone: head, sides: 6 },
    );
  }
  b.sweep(
    catmull([
      [EX - LENS_R, EYE_Y + 0.004, LENS_Z],
      [0, EYE_Y + 0.018, LENS_Z + 0.008],
      [-(EX - LENS_R), EYE_Y + 0.004, LENS_Z],
    ]),
    0.0045,
    { color: C.GILT, bone: head, sides: 6 },
  );

  // Beak: hooked upper beak, separate lower jaw.
  b.sweep(bezier(hc(0, -0.005, 0.21), hc(0, 0.0, 0.29), hc(0, -0.03, 0.31), hc(0, -0.1, 0.275)), (t) => [
    0.04 * (1 - t) + 0.004,
    0.05 * (1 - t * 0.8) + 0.004,
  ], { bone: head, color: C.BEAK, sides: 8 });
  b.sweep(bezier(hc(0, -0.062, 0.2), hc(0, -0.075, 0.24), hc(0, -0.085, 0.26), hc(0, -0.085, 0.255)), (t) => [
    0.03 * (1 - t) + 0.005,
    0.022 * (1 - t) + 0.005,
  ], { bone: jaw, color: C.BEAK, sides: 8 });

  // ---------------- Arms (wing-arms in cardigan sleeves) ----------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: V3 = [s * 0.23, 1.0, 0.0];
    const el: V3 = [s * 0.33, 0.77, 0.0];
    const wr: V3 = [s * 0.41, 0.55, 0.04];
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wristJ = arm.joints[arm.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 10, 8), SLEEVE, {
      bone: arm.joints[0],
      at: sh,
      scale: [0.09, 0.085, 0.09],
    });
    const sleeve = b.sweep(arm, (t) => 0.08 - 0.014 * t, { color: SLEEVE, caps: { start: "round", end: "flat" } });
    const sk = b.surface(sleeve);
    const d = vec(wr).sub(vec(el)).normalize();

    // Elbow patch, cuffs.
    const patch = sk.ray([el[0], el[1], -0.5], [0, 0, 1]);
    if (patch) {
      b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), C.OCHRE, patch, { embed: 0.4, scale: [0.9, 1, 1.5] });
      b.stick(new THREE.CylinderGeometry(0.028, 0.028, 0.004, 10), C.TAWNY, patch.moved([0, 0.004, 0]), {
        embed: 0.2,
        scale: [0.9, 1, 1.5],
      });
    }
    b.sweep(sk.loop(lerp(el, wr, 0.9), { dir: arr(d), lift: 0.004 }), 0.0075, { color: C.GILT, sides: 6 });
    b.sweep(sk.loop(lerp(el, wr, 0.96), { dir: arr(d), lift: 0.004 }), 0.012, { color: C.CREAM2, sides: 6 });

    // Wing feathers hanging behind the arm: primaries and coverts.
    const armPt = (u: number): V3 => arr(u < 0.5 ? lerp(sh, el, u * 2) : lerp(el, wr, (u - 0.5) * 2));
    const armBone = (u: number) => (u < 0.5 ? arm.joints[0] : arm.joints[1]);
    for (let i = 0; i < 9; i++) {
      const u = 0.08 + 0.1 * i;
      const p = armPt(u);
      const a = 0.05 + 0.33 * u;
      blade(
        0.26 + 0.18 * u,
        0.08,
        [p[0] + s * 0.045, p[1], p[2] - 0.06],
        [s * Math.sin(a), -Math.cos(a), -0.1],
        [0, 0, 1],
        mkPrimary,
        armBone(u),
        0.012,
      );
    }
    for (let j = 0; j < 7; j++) {
      const u = 0.1 + 0.12 * j;
      const p = armPt(u);
      const a = 0.03 + 0.28 * u;
      blade(
        0.14 + 0.08 * u,
        0.07,
        [p[0] + s * 0.05, p[1], p[2] - 0.035],
        [s * Math.sin(a), -Math.cos(a), -0.06],
        [0, 0, 1],
        mkCovert,
        armBone(u),
        0.01,
      );
    }

    // Hand: feathered palm, three fingers and a thumb with talons.
    const w = vec(wr);
    b.part(new THREE.SphereGeometry(1, 10, 8), HANDP, {
      bone: wristJ,
      at: arr(w.clone().addScaledVector(d, 0.045)),
      scale: [0.04, 0.055, 0.05],
    });
    [-0.032, 0, 0.032].forEach((zi, k) => {
      const p0 = w.clone().addScaledVector(d, 0.07).add(V(0, 0, zi));
      const p1 = p0.clone().addScaledVector(d, 0.065).add(V(s * 0.004, 0, zi * 0.5));
      const p2 = p1.clone().addScaledVector(d, 0.055).add(V(s * 0.003, 0, zi * 0.5 + 0.01));
      digit(`finger${S}${k}`, wristJ, [p0, p1, p2], 0.015, HANDP, 0.035);
    });
    {
      const p0 = w.clone().addScaledVector(d, 0.04).add(V(-s * 0.035, 0, 0.035));
      const p1 = p0.clone().addScaledVector(d, 0.045).add(V(-s * 0.025, 0, 0.03));
      const p2 = p1.clone().addScaledVector(d, 0.035).add(V(-s * 0.015, 0, 0.025));
      digit(`thumb${S}`, wristJ, [p0, p1, p2], 0.014, HANDP, 0.03);
    }
  }

  // ---------------- Legs and feet ----------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const A: V3 = [s * 0.12, 0.1, -0.005];
    const pts = limb([s * 0.1, 0.66, 0], A, [0.31, 0.27], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, polyline(pts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [A[0], 0, 0.05],
    });
    const ankleJ = leg.joints[leg.joints.length - 1];
    const legTube = b.sweep(leg, [0.088, 0.095, 0.075, 0.05], { color: LEGP });
    const lsk = b.surface(legTube);
    const thighDir = pts[1].clone().sub(pts[0]).normalize();
    b.sweep(lsk.loop(lerp(arr(pts[0]), arr(pts[1]), 0.85), { dir: arr(thighDir), lift: 0.004 }), 0.0085, {
      color: C.GILT,
      sides: 6,
    });
    b.sweep(lsk.loop(lerp(arr(pts[0]), arr(pts[1]), 0.8), { dir: arr(thighDir), lift: 0.004 }), 0.0065, {
      color: C.OX,
      sides: 6,
    });
    b.cards(lsk.scatter(36, { rng: rng(30 + (s > 0 ? 1 : 2)), minDist: 0.04, filter: (h) => h.at.y > 0.2 }), FEATHER_CREAM, {
      size: [0.04, 0.08],
      lean: 70,
      flow: [0, -1, 0],
      bend: 15,
      vary: 0.25,
      rng: rng(40 + (s > 0 ? 1 : 2)),
    });

    // Foot: pad, three front toes, one back toe.
    b.part(new THREE.SphereGeometry(1, 10, 8), LEGP, {
      bone: ankleJ,
      at: [A[0], 0.04, A[2] + 0.03],
      scale: [0.055, 0.036, 0.07],
    });
    [-0.5, 0, 0.5].forEach((th, k) => {
      const dir = V(Math.sin(th), 0, Math.cos(th));
      const p0 = V(A[0] + dir.x * 0.02, 0.03, A[2] + 0.04 * dir.z);
      const p1 = p0.clone().addScaledVector(dir, 0.08);
      p1.y = 0.027;
      const p2 = p1.clone().addScaledVector(dir, 0.06);
      p2.y = 0.026;
      digit(`toe${S}${k}`, ankleJ, [p0, p1, p2], 0.02, HANDP, 0.045);
    });
    digit(
      `heelToe${S}`,
      ankleJ,
      [V(A[0], 0.03, A[2]), V(A[0], 0.027, A[2] - 0.06), V(A[0], 0.026, A[2] - 0.1)],
      0.019,
      HANDP,
      0.04,
    );
  }

  // ---------------- Chatelaine: keys, chain and a tiny tooled book ----------------
  const hookHit = waistSkin.ray([-1, 0.73, 0.05], [1, 0, 0]);
  if (hookHit) {
    const Hk = hookHit.at.clone();
    b.part(new THREE.SphereGeometry(0.015, 8, 6), C.GILT, { bone: hips, at: arr(Hk) });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 8), C.GILT2, { bone: hips, at: arr(Hk.clone().add(V(-0.01, 0, 0))), dir: [1, 0, 0] });
    const Bc = Hk.clone().add(V(-0.03, -0.165, 0.06));
    b.sweep(
      catmull([arr(Hk), arr(Hk.clone().add(V(-0.015, -0.06, 0.03))), arr(Bc.clone().add(V(0, 0.058, 0)))]),
      0.003,
      { color: C.GILT, bone: hips, sides: 5 },
    );
    // Book: boards, page block, spine, tooled cover, ribbon.
    const bw = 0.07;
    const bh = 0.095;
    const bd = 0.03;
    b.part(new THREE.BoxGeometry(bw, bh, 0.004), LEATHERP, { bone: hips, at: [Bc.x, Bc.y, Bc.z - bd / 2] });
    b.part(new THREE.BoxGeometry(bw, bh, 0.004), C.NAVY, { bone: hips, at: [Bc.x, Bc.y, Bc.z + bd / 2] });
    b.part(new THREE.BoxGeometry(0.005, bh, bd), C.NAVY, { bone: hips, at: [Bc.x + bw / 2 - 0.0025, Bc.y, Bc.z] });
    b.part(new THREE.BoxGeometry(bw - 0.008, bh - 0.008, bd - 0.006), C.PAGE, { bone: hips, at: [Bc.x - 0.002, Bc.y, Bc.z] });
    b.part(new THREE.PlaneGeometry(bw - 0.006, bh - 0.006), "#ffffff", {
      bone: hips,
      at: [Bc.x, Bc.y, Bc.z + bd / 2 + 0.0025],
      dir: [0, 0, 1],
      axis: "z",
      texture: COVER,
    });
    b.sweep(
      catmull([
        [Bc.x - 0.01, Bc.y - bh / 2 + 0.004, Bc.z + 0.005],
        [Bc.x - 0.012, Bc.y - bh / 2 - 0.04, Bc.z + 0.012],
        [Bc.x - 0.005, Bc.y - bh / 2 - 0.08, Bc.z + 0.01],
      ]),
      () => [0.007, 0.0015],
      { color: C.OX, section: "box", bone: hips, caps: "flat" },
    );

    // Key ring with three keys, hung behind the book.
    const Kc = Hk.clone().add(V(-0.012, -0.1, -0.04));
    b.sweep(catmull([arr(Hk), arr(Hk.clone().add(V(-0.008, -0.05, -0.02))), arr(Kc.clone().add(V(0, 0.022, 0)))]), 0.003, {
      color: C.GILT,
      bone: hips,
      sides: 5,
    });
    const kr: V3[] = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [Kc.x, Kc.y + Math.cos(a) * 0.022, Kc.z + Math.sin(a) * 0.022];
    });
    b.sweep(catmull(kr, { closed: true }), 0.0035, { color: C.GILT2, bone: hips, sides: 5 });
    [
      { dz: -0.016, len: 0.075 },
      { dz: 0, len: 0.09 },
      { dz: 0.016, len: 0.065 },
    ].forEach((k, i) => {
      const top: V3 = [Kc.x, Kc.y - 0.02, Kc.z + k.dz];
      const bot: V3 = [Kc.x, Kc.y - 0.02 - k.len, Kc.z + k.dz * 1.5];
      b.rod(top, bot, 0.0045, i === 1 ? C.GILT2 : C.GILT, { bone: hips });
      b.part(new THREE.BoxGeometry(0.004, 0.016, 0.014), C.GILT, { bone: hips, at: [bot[0], bot[1] + 0.01, bot[2] + 0.008] });
      b.part(new THREE.SphereGeometry(0.009, 6, 4), C.GILT2, { bone: hips, at: top });
    });
  }

  return b.root;
}
