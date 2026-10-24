```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, polyline, mottle, grain, scales, stripes, spots, patches, paint, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "Slavic folk-art diorama: a carved log izba with a painted shingle roof, horse-head ridge ends and a glowing sun gable, standing on two huge scaly chicken legs, ringed by a fence of glowing-eyed skulls.",
};

type V = [number, number, number];
const DEG = Math.PI / 180;
const G = 0.14; // top of the earthen base

// Folk-art palette
const RED = "#c8372d";
const BLUE = "#2a5db0";
const GOLD = "#e8b830";
const GREEN = "#2f7a3a";
const CREAM = "#f2e4c0";
const INK = "#2a140c";
const TEAL = "#2e8b7a";
const RUST = "#b8402c";
const OCHRE = "#d4a032";
const DARK_WOOD = "#4a2e1a";
const LIGHT_WOOD = "#80572f";
const MOSS = "#4f7a30";
const BONE_A = "#e9ddc0";
const BONE_B = "#c7b48c";
const TALON = "#2b1d14";
const EMBER = "#ffa23a";

// ---------------------------------------------------------------------------------------------------------------
// SVG helpers

const flower = (cx: number, cy: number, r: number, n: number, c1: string, c2: string, c3 = CREAM) => {
  const sw = Math.max(0.8, r * 0.08);
  let s = "";
  for (let i = 0; i < n; i++) {
    s += `<ellipse cx="${cx}" cy="${cy - r * 0.58}" rx="${r * 0.3}" ry="${r * 0.46}" transform="rotate(${(i * 360) / n} ${cx} ${cy})" fill="${c1}" stroke="${INK}" stroke-width="${sw}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.34}" fill="${c2}" stroke="${INK}" stroke-width="${sw}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="${c3}"/>`;
  return s;
};
const leaf = (x: number, y: number, len: number, w: number, ang: number, fill: string) =>
  `<path d="M0 0 Q${w} ${-len / 2} 0 ${-len} Q${-w} ${-len / 2} 0 0Z" transform="translate(${x} ${y}) rotate(${ang})" fill="${fill}" stroke="${INK}" stroke-width="1"/>`;
const zig = (x0: number, x1: number, y: number, amp: number, step: number, color: string, w: number) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x + step <= x1 + 0.01; x += step) d += ` L${x + step / 2} ${y - amp} L${x + step} ${y}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round"/>`;
};
const bird = (x: number, y: number, f: number) =>
  `<g transform="translate(${x} ${y}) scale(${f} 1)"><path d="M-8 2 Q-17 -1 -15 -10 Q-9 -3 -4 -2Z" fill="${RED}" stroke="${INK}" stroke-width="1"/><ellipse cx="0" cy="0" rx="8" ry="5.5" fill="${GOLD}" stroke="${INK}" stroke-width="1"/><circle cx="8" cy="-5" r="3.6" fill="${GOLD}" stroke="${INK}" stroke-width="1"/><path d="M11 -5.5 L16 -4 L11 -3Z" fill="${RED}" stroke="${INK}" stroke-width="0.6"/><circle cx="8.6" cy="-5.6" r="0.9" fill="${INK}"/><path d="M-2 0 Q2 -3 5 1" stroke="${INK}" stroke-width="0.9" fill="none"/></g>`;

// ---------------------------------------------------------------------------------------------------------------
// Scalloped lace strip (bargeboard), outline in (along, down)

function scallopStrip(L: number, n: number, H: number): [number, number][] {
  const w = L / n;
  const bh = w * 0.45;
  const pts: [number, number][] = [
    [0, 0],
    [L, 0],
    [L, H],
  ];
  for (let i = n - 1; i >= 0; i--) {
    for (let k = 1; k <= 4; k++) {
      const a = (k / 4) * Math.PI;
      pts.push([i * w + w / 2 + (Math.cos(a) * w) / 2, H + Math.sin(a) * bh]);
    }
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut" });
  const rand = rng(7);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton roots
  const ground = b.joint("ground", { at: [0, 0, 0] });
  const hut = b.joint("hut", { parent: ground, at: [0, 2.2, 0], dir: [0, 1, 0] });

  const H = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { bone: hut, at, ...o });
  const GP = (geo: THREE.BufferGeometry, color: any, at: any, o: any = {}) => b.part(geo, color, { bone: ground, at, ...o });
  const T = (g: THREE.BufferGeometry, p: V, rot?: V) => {
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
    g.translate(p[0], p[1], p[2]);
    return g;
  };
  const merged = (geos: THREE.BufferGeometry[], color: any, bone: any, o: any = {}) =>
    b.part(mergeGeometries(geos, false)!, color, { bone, at: [0, 0, 0], flat: true, ...o });
  const ad = (a: V, d: V, k: number): V => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const FEATHER_TEX = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 63 C4 50 2 26 20 2 C38 26 36 50 20 63Z" fill="#b9501c" stroke="#3a1608" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M20 58 C10 46 9 28 20 10 C31 28 30 46 20 58Z" fill="#dd7b2c"/>
    <path d="M20 60 L20 8" stroke="#3a1608" stroke-width="2"/>
    <path d="M20 22 L12 30 M20 32 L11 41 M20 42 L13 50 M20 22 L28 30 M20 32 L29 41 M20 42 L27 50" stroke="#7a2c0e" stroke-width="2" fill="none"/>
    <path d="M14 12 Q20 -1 26 12 Q20 7 14 12Z" fill="${CREAM}"/>
  </svg>`,
    { size: 128 },
  );

  const DOOR_TEX = svg(
    `<svg viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="77" height="137" rx="7" fill="#1f4a8c" stroke="${CREAM}" stroke-width="3"/>
    <rect x="7" y="7" width="66" height="126" rx="4" fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-dasharray="3 2.5"/>
    ${zig(10, 70, 130, 5, 8, RED, 2.4)}
    ${zig(10, 70, 18, 5, 8, RED, 2.4)}
    <path d="M40 124 C36 104 44 86 40 50" stroke="${GREEN}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M40 98 Q28 96 21 82 M40 98 Q52 96 59 82" stroke="${GREEN}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${leaf(40, 118, 16, 6, -60, GREEN)}${leaf(40, 118, 16, 6, 60, GREEN)}${leaf(40, 104, 15, 6, -50, GREEN)}${leaf(40, 104, 15, 6, 50, GREEN)}
    ${leaf(40, 72, 14, 5, -45, GREEN)}${leaf(40, 72, 14, 5, 45, GREEN)}
    ${flower(40, 44, 14, 8, RED, GOLD)}
    ${flower(20, 80, 8, 6, GOLD, RED)}${flower(60, 80, 8, 6, GOLD, RED)}
    ${bird(19, 50, 1)}${bird(61, 50, -1)}
    <circle cx="14" cy="28" r="2" fill="${CREAM}"/><circle cx="66" cy="28" r="2" fill="${CREAM}"/>
    <circle cx="40" cy="25" r="2" fill="${CREAM}"/>
  </svg>`,
    { size: 512 },
  );

  const FRAME_TEX = svg(
    `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" fill="${BLUE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"
      d="M6 126 L6 52 Q6 34 20 26 Q30 22 36 12 Q50 -1 64 12 Q70 22 80 26 Q94 34 94 52 L94 126 Q86 120 78 126 Q70 120 62 126 Q54 120 46 126 Q38 120 30 126 Q22 120 14 126 Q10 124 6 126Z M24 46 L76 46 L76 114 L24 114Z"/>
    <path d="M24 46 L76 46 L76 114 L24 114Z" fill="none" stroke="${CREAM}" stroke-width="2.4"/>
    <path d="M11 52 Q11 38 23 31" stroke="${CREAM}" stroke-width="2" fill="none"/>
    <path d="M89 52 Q89 38 77 31" stroke="${CREAM}" stroke-width="2" fill="none"/>
    ${flower(50, 27, 10, 6, RED, GOLD)}
    ${flower(15, 70, 5.5, 6, RED, GOLD)}${flower(85, 70, 5.5, 6, RED, GOLD)}
    ${flower(15, 98, 5.5, 6, GOLD, RED)}${flower(85, 98, 5.5, 6, GOLD, RED)}
    <circle cx="30" cy="38" r="2" fill="${CREAM}"/><circle cx="70" cy="38" r="2" fill="${CREAM}"/>
    ${[14, 30, 46, 62, 78].map((x) => `<circle cx="${x + 4}" cy="119" r="2.2" fill="${CREAM}"/>`).join("")}
  </svg>`,
    { size: 512 },
  );

  const GLASS_TEX = svg(
    `<svg viewBox="0 0 52 68" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="0.5" cy="0.65" r="0.7"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.6" stop-color="#ffb93c"/><stop offset="1" stop-color="#e8741c"/></radialGradient></defs>
    <rect width="52" height="68" fill="url(#g)"/>
    <path d="M0 0 Q14 10 16 30 L0 30Z" fill="${RED}"/><path d="M52 0 Q38 10 36 30 L52 30Z" fill="${RED}"/>
    <ellipse cx="39" cy="63" rx="9" ry="6" fill="${INK}"/><circle cx="39" cy="55" r="5" fill="${INK}"/>
    <path d="M34 52 L35 45 L39 50Z M40 50 L43 45 L44 52Z" fill="${INK}"/>
    <path d="M26 0 V68 M0 34 H52" stroke="#3a2210" stroke-width="3"/>
  </svg>`,
    { size: 256 },
  );

  const SHUTTER_TEX = svg(
    `<svg viewBox="0 0 20 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="19" height="49" rx="2" fill="${RED}" stroke="${CREAM}" stroke-width="1.2"/>
    ${leaf(10, 25, 9, 3, -50, GREEN)}${leaf(10, 25, 9, 3, 50, GREEN)}
    ${flower(10, 13, 6, 6, GOLD, BLUE)}
    ${flower(10, 37, 6, 6, BLUE, GOLD)}
    ${zig(2, 18, 49, 2, 4, CREAM, 0.9)}
  </svg>`,
    { size: 256 },
  );

  let rays = "";
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5 * Math.PI) / 180;
    const a0 = a - 0.16;
    const a1 = a + 0.16;
    const r2 = i % 2 ? 40 : 49;
    rays += `<polygon points="${50 + Math.cos(a0) * 30},${50 + Math.sin(a0) * 30} ${50 + Math.cos(a) * r2},${50 + Math.sin(a) * r2} ${50 + Math.cos(a1) * 30},${50 + Math.sin(a1) * 30}" fill="${i % 2 ? RED : GOLD}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  const SUN_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${rays}
    <circle cx="50" cy="50" r="29" fill="#f4c430" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="23" fill="#ffd75a" stroke="${RED}" stroke-width="1.6" stroke-dasharray="2.5 2"/>
    <path d="M36 44 Q41 39 46 44 M54 44 Q59 39 64 44" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M50 46 L47 55 L53 55Z" fill="#e0a020" stroke="${INK}" stroke-width="1"/>
    <path d="M40 62 Q50 70 60 62" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="36" cy="55" r="3.6" fill="#ff8a70" opacity="0.8"/><circle cx="64" cy="55" r="3.6" fill="#ff8a70" opacity="0.8"/>
  </svg>`,
    { size: 512 },
  );

  const RUSHNYK_TEX = svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="38" height="84" fill="#f4ead0" stroke="${INK}" stroke-width="1"/>
    <rect x="1" y="4" width="38" height="10" fill="${RED}"/>
    <rect x="1" y="62" width="38" height="10" fill="${RED}"/>
    ${[6, 13, 20, 27, 34].map((x) => `<path d="M${x} 9 l3 -3 l3 3 l-3 3Z" fill="${CREAM}"/>`).join("")}
    ${[6, 13, 20, 27, 34].map((x) => `<path d="M${x} 67 l3 -3 l3 3 l-3 3Z" fill="${CREAM}"/>`).join("")}
    ${flower(20, 38, 11, 8, RED, BLUE)}
    ${[3, 8, 13, 18, 23, 28, 33, 38].map((x) => `<path d="M${x} 85 L${x} 99" stroke="${RED}" stroke-width="2.2"/>`).join("")}
  </svg>`,
    { size: 256 },
  );

  const GRASS_TEX = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 40 Q16 20 6 3 Q23 18 25 40Z" fill="#4c8a34" stroke="#1f3a14" stroke-width="1.4"/>
    <path d="M14 40 Q12 26 2 16 Q17 26 19 40Z" fill="#3c7428" stroke="#1f3a14" stroke-width="1.4"/>
    <path d="M24 40 Q28 20 38 6 Q29 26 31 40Z" fill="#5c9a3c" stroke="#1f3a14" stroke-width="1.4"/>
    <path d="M18 40 Q20 24 20 8 Q27 24 24 40Z" fill="#6aa844" stroke="#1f3a14" stroke-width="1.4"/>
  </svg>`,
    { size: 128 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const woodPaint = (seed: number, axis: "x" | "z" | "y") => {
    const g = grain(DARK_WOOD, LIGHT_WOOD, { size: 0.04, axis, seed });
    const end = mottle("#dcb67e", "#b98a52", { size: 0.05, seed });
    return paint((p, n) => {
      if (axis !== "y" && Math.abs(axis === "x" ? n.x : n.z) > 0.8) return end;
      if (n.y > 0.5 && noise(p, 0.2, seed + 4) > 0.62) return MOSS;
      return g;
    });
  };
  const PLANK = grain("#6b4a2a", "#9a6c3c", { size: 0.05, axis: "y", seed: 3 });
  const DECK = grain("#5a3a20", "#8a6038", { size: 0.04, axis: "z", seed: 5 });
  const DARKPLANK = grain("#2e1c10", "#4a2e1a", { size: 0.05, axis: "x", seed: 9 });
  const BONE = mottle(BONE_A, BONE_B, { size: 0.12, seed: 4 });
  const FEATHER = stripes("#b9501c", "#8a3414", { size: 0.14, axis: "y", width: 0.4, wobble: 0.8, seed: 2 });
  const SCALE_Y = scales(["#e8b830", "#d9a21f", "#f0c850"], "#7a4e10", { size: 0.06, width: 0.2, seed: 6 });
  const RIDGE = stripes(RED, CREAM, { size: 0.3, axis: "z", width: 0.5, wobble: 0, seed: 1 });
  const BRICK = patches("#3a2418", "#a5502f", { size: 0.09, gap: 0.12, seed: 8 });
  const RED_WOOD = stripes("#a42a22", "#7e1c16", { size: 0.2, axis: "x", width: 0.3, wobble: 0.6, seed: 12 });
  const BLUE_WOOD = mottle("#2a5db0", "#224c92", { size: 0.2, seed: 13 });
  const frieze = (axis: "x" | "z", y0: number, h: number) =>
    paint((p) => {
      const u = axis === "x" ? p.x : p.z;
      const hv = (p.y - y0) / h;
      if (hv < 0.12 || hv > 0.88) return BLUE;
      const tri = Math.abs((((u / 0.14) % 1) + 1) % 1 * 2 - 1);
      return hv > 0.12 + tri * 0.76 ? RED : CREAM;
    });
  const shingles = (yE: number, sinT: number) => {
    const pal = [TEAL, RUST, OCHRE];
    const w = 0.17;
    const h = 0.085;
    const R = 0.105;
    return paint((p) => {
      const u = p.z;
      const v = (p.y - yE) / sinT;
      const rHi = Math.floor(v / h);
      const rLo = Math.ceil((v - 2 * R) / h);
      for (let r = rHi; r >= rLo; r--) {
        const off = (((r % 2) + 2) % 2) * (w / 2);
        const k = Math.round((u - off) / w);
        const d = Math.hypot(u - (off + k * w), v - (r * h + R));
        if (d < R) {
          if (d > R - 0.011) return "#1b1410";
          if (Math.abs(d - R * 0.58) < 0.006) return CREAM;
          return pal[(((k + 2 * r) % 3) + 3) % 3];
        }
      }
      return "#1b1410";
    });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Earthen base
  const GRASS_P = mottle("#3f6b2e", "#628f3a", { size: 0.5, seed: 2 });
  const EARTH_P = mottle("#4a3426", "#6b4a33", { size: 0.3, seed: 3 });
  const base = b.lathe(
    [
      [0, 0],
      [3.75, 0],
      [3.82, 0.07],
      [3.5, G],
      [0, G],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 22, color: paint((_p, n) => (n.y > 0.6 ? GRASS_P : EARTH_P)), bone: ground, name: "base" },
  );
  {
    const hits = b.surface(base).scatter(70, {
      rng: rng(11),
      minDist: 0.28,
      filter: (h) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) > 1.9 && !(Math.abs(h.at.x + 0.5) < 0.6 && h.at.z > 1.5),
    });
    b.cards(hits, GRASS_TEX, { size: [0.26, 0.22], lean: 8, vary: 0.4, rng: rng(12), cross: true, flow: [0, 0, 1], bone: ground });
  }

  // Mushrooms
  const mush = (x: number, z: number, k: number) => {
    GP(new THREE.CylinderGeometry(0.035 * k, 0.045 * k, 0.17 * k, 6), CREAM, [x, G + 0.08 * k, z]);
    const o: [number, number][] = [
      [0, 0],
      [0.07, 0],
      [0.15, 0.04],
      [0.19, 0.1],
      [0.12, 0.17],
      [0, 0.2],
    ];
    b.lathe(
      o.map(([a, c]) => [a * k, c * k] as [number, number]),
      { at: [x, G + 0.16 * k, z], segments: 9, color: spots("#d2312a", "#fbf4e2", { size: 0.06 * k, amount: 0.6, seed: 4 }), bone: ground },
    );
  };
  mush(2.0, 2.2, 1.6);
  mush(2.4, 1.8, 1.0);
  mush(1.7, 2.6, 0.8);
  mush(-2.1, 2.3, 1.2);

  // -------------------------------------------------------------------------------------------------------------
  // Fence of skulls
  const skull = (c: THREE.Vector3, f: THREE.Vector3) => {
    const up = new THREE.Vector3(0, 1, 0);
    const right = up.clone().cross(f).normalize();
    const at = (a: number, r: number, u: number) => c.clone().addScaledVector(f, a).addScaledVector(right, r).addScaledVector(up, u);
    GP(new THREE.SphereGeometry(0.12, 8, 6), BONE, c, { scale: [1, 0.95, 1.05], flat: true });
    GP(new THREE.BoxGeometry(0.1, 0.07, 0.1), BONE, at(0.09, 0, -0.07), { dir: f, axis: "z" });
    GP(new THREE.BoxGeometry(0.09, 0.04, 0.09), BONE_B, at(0.08, 0, -0.13), { dir: f, axis: "z" });
    for (const s of [1, -1]) {
      GP(new THREE.SphereGeometry(0.04, 6, 4), "#120a06", at(0.095, s * 0.05, 0.0));
      glow(GP(new THREE.SphereGeometry(0.026, 6, 4), EMBER, at(0.108, s * 0.05, 0.0)), 1.6);
    }
  };
  {
    const N = 10;
    const pts: V[] = [];
    for (let i = 0; i < N; i++) {
      const ang = (40 + (i * 280) / (N - 1)) * DEG;
      const R = 3.1;
      const x = Math.sin(ang) * R;
      const z = Math.cos(ang) * R;
      const h = 1.2 + rand() * 0.45;
      b.rod([x, G - 0.02, z], [x, G + h, z], [0.07, 0.045], BONE, { bone: ground, sides: 6 });
      b.rod([x, G + 0.25, z], [x, G + 0.45, z], 0.075, "#6b4a2a", { bone: ground, sides: 6 });
      const f = new THREE.Vector3(-Math.sin(ang) * 0.5, 0, -Math.cos(ang) * 0.5 + 0.8).normalize();
      skull(new THREE.Vector3(x, G + h + 0.1, z), f);
      pts.push([x, G + 0.8, z]);
    }
    for (let i = 0; i < N - 1; i++) b.rod(pts[i], pts[i + 1], 0.03, DARK_WOOD, { bone: ground, sides: 5 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Chicken legs
  const FLOOR_BOTTOM = 2.1;
  const legR = (t: number) => (t < 0.25 ? 0.17 + 0.2 * t : t < 0.66 ? 0.22 - 0.3 * (t - 0.25) : 0.09 - (0.02 * (t - 0.66)) / 0.34);
  const toes = [
    { n: "A", d: [0, 0, 1] as V, len: 0.78, z: 0.33 },
    { n: "B", d: [0.55, 0, 0.835] as V, len: 0.62, z: 0.33 },
    { n: "C", d: [-0.55, 0, 0.835] as V, len: 0.62, z: 0.33 },
    { n: "D", d: [0, 0, -1] as V, len: 0.42, z: 0.28 },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.8;
    const pts: V[] = [
      [x, 2.2, 0],
      [x, 1.8, 0.45],
      [x, 0.98, -0.1],
      [x, G + 0.2, 0.35],
    ];
    const leg = b.chain(`leg${S}`, polyline(pts), {
      parent: hut,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `ankle${S}`],
      role: "leg",
      contact: [x, G, 0.7],
    });
    const legSweep = b.sweep(leg, legR, {
      color: FEATHER,
      bands: [
        [0.64, FEATHER],
        [1, SCALE_Y],
      ],
    });
    // feathery thigh
    const hits = b.surface(legSweep).scatter(60, {
      rng: rng(20 + (s > 0 ? 1 : 2)),
      minDist: 0.11,
      filter: (h) => h.at.y > 1.0 && h.at.y < 2.05,
    });
    b.cards(hits, FEATHER_TEX, { size: [0.2, 0.34], lean: 75, bend: 25, flow: [0, -1, -0.25], vary: 0.3, rng: rng(30 + (s > 0 ? 1 : 0)), spin: 25 });

    const ankle = leg.joints[3];
    const hock = leg.joints[2];
    // hock knuckle and spur
    b.part(new THREE.SphereGeometry(0.115, 8, 6), SCALE_Y, { bone: hock, at: [x, 0.98, -0.1], flat: true });
    b.spike([x, 0.84, 0.0], [0, -0.45, -1], 0.24, 0.045, { color: TALON, bone: hock });
    // foot pad
    b.part(new THREE.SphereGeometry(0.11, 8, 6), SCALE_Y, { bone: ankle, at: [x, G + 0.1, 0.33], scale: [1, 0.8, 1.1], flat: true });
    // toes
    for (const t of toes) {
      const Bp: V = [x, G + 0.062, t.z];
      const Mp = ad(Bp, t.d, t.len * 0.5);
      Mp[1] += 0.01;
      const Tp = ad(Bp, t.d, t.len);
      const toe = b.chain(`toe${t.n}${S}`, polyline([Bp, Mp, Tp]), {
        parent: ankle,
        names: [`toe${t.n}${S}1`, `toe${t.n}${S}2`],
        role: "digit",
      });
      b.sweep(toe, [0.065, 0.045], { color: SCALE_Y, sides: 6 });
      b.spike(Tp, [t.d[0], -0.3, t.d[2]], 0.2, 0.046, { color: TALON, bone: toe.joints[1], sides: 6 });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Hut floor, beam, joists
  H(new THREE.BoxGeometry(2.8, 0.2, 3.2), DARKPLANK, [0, 2.2, 0], { name: "floor" });
  H(new THREE.CylinderGeometry(0.12, 0.12, 2.9, 8).rotateZ(Math.PI / 2), woodPaint(1, "x"), [0, 1.98, 0], { name: "yoke" });
  for (const s of [1, -1]) {
    H(new THREE.TorusGeometry(0.14, 0.035, 5, 10).rotateY(Math.PI / 2), "#b59a62", [s * 0.8, 1.98, 0.0], { flat: true });
    H(new THREE.TorusGeometry(0.14, 0.035, 5, 10).rotateY(Math.PI / 2), "#b59a62", [s * 0.8, 1.98, 0.16], { flat: true });
  }
  for (const jx of [-1.15, 0.15]) {
    H(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6).rotateX(Math.PI / 2), woodPaint(2, "z"), [jx, 2.15, 1.7]);
  }
  H(new THREE.BoxGeometry(2.5, 1.75, 2.9), "#241812", [0, 3.15, 0], { name: "core" });

  // Log walls
  for (let i = 0; i < 8; i++) {
    const yF = 2.4 + 0.2 * i;
    const yS = 2.5 + 0.2 * i;
    for (const sz of [1, -1]) {
      const len = 2.8 + (rand() - 0.5) * 0.1;
      H(new THREE.CylinderGeometry(0.1, 0.1, len, 8).rotateZ(Math.PI / 2), woodPaint(i % 3, "x"), [0, yF, sz * 1.4]);
    }
    for (const sx of [1, -1]) {
      const len = 3.2 + (rand() - 0.5) * 0.1;
      H(new THREE.CylinderGeometry(0.1, 0.1, len, 8).rotateX(Math.PI / 2), woodPaint(3 + (i % 3), "z"), [sx * 1.2, yS, 0]);
    }
  }

  // Friezes under the eaves
  H(new THREE.BoxGeometry(2.7, 0.14, 0.04), frieze("x", 3.86, 0.14), [0, 3.93, 1.52]);
  H(new THREE.BoxGeometry(2.7, 0.14, 0.04), frieze("x", 3.86, 0.14), [0, 3.93, -1.52]);
  for (const s of [1, -1]) H(new THREE.BoxGeometry(0.04, 0.14, 3.0), frieze("z", 3.86, 0.14), [s * 1.32, 3.93, 0]);

  // -------------------------------------------------------------------------------------------------------------
  // Front: door, window, shutters, deck
  const doorJ = b.joint("door", { parent: hut, at: [-0.95, 3.05, 1.5], dir: [0, 1, 0], role: "hinge" });
  b.part(new THREE.BoxGeometry(0.8, 1.35, 0.08), PLANK, { bone: doorJ, at: [-0.55, 3.045, 1.54] });
  b.part(new THREE.PlaneGeometry(0.74, 1.3), "#ffffff", { bone: doorJ, at: [-0.55, 3.045, 1.585], dir: [0, 0, 1], axis: "z", texture: DOOR_TEX });
  b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 10), GOLD, { bone: doorJ, at: [-0.23, 3.0, 1.6], flat: true });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: doorJ, at: [-0.23, 3.07, 1.6], flat: true });
  for (const dx of [-1.02, -0.08]) H(new THREE.BoxGeometry(0.1, 1.4, 0.08), stripes(RED, CREAM, { size: 0.12, axis: "y", width: 0.5, wobble: 0.1, seed: 4 }), [dx, 3.07, 1.54]);
  // kokoshnik lintel
  {
    const arch: [number, number][] = [
      [-0.55, 0],
      [0.55, 0],
      [0.55, 0.08],
      [0.42, 0.16],
      [0.3, 0.22],
      [0.2, 0.34],
      [0.1, 0.42],
      [0, 0.48],
      [-0.1, 0.42],
      [-0.2, 0.34],
      [-0.3, 0.22],
      [-0.42, 0.16],
      [-0.55, 0.08],
    ];
    b.extrude(arch, { at: [-0.55, 3.75, 1.58], x: [1, 0, 0], thickness: 0.06, bevel: 0.01, color: RED_WOOD, bone: hut });
    H(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 10).rotateX(Math.PI / 2), GOLD, [-0.55, 3.98, 1.625]);
  }
  // window
  const winAt = (cx: number, cy: number, nz: number, side: number, bone: any = hut) => {
    const dirv: V = side === 0 ? [0, 0, nz] : [side, 0, 0];
    const base: V = side === 0 ? [cx, cy, nz * 1.51] : [side * 1.315, cy, cx];
    const glassBase: V = side === 0 ? [cx, cy - 0.105, nz * 1.502] : [side * 1.307, cy - 0.105, cx];
    glow(b.part(new THREE.PlaneGeometry(0.39, 0.5), "#ffffff", { bone, at: glassBase, dir: dirv, axis: "z", texture: GLASS_TEX }), 1.2);
    b.part(new THREE.PlaneGeometry(0.7, 0.91), "#ffffff", { bone, at: base, dir: dirv, axis: "z", texture: FRAME_TEX });
  };
  winAt(0.7, 3.2, 1, 0);
  H(new THREE.BoxGeometry(0.82, 0.05, 0.12), RED_WOOD, [0.7, 2.72, 1.56]);
  winAt(0.3, 3.2, 1, 1);
  winAt(0.3, 3.2, 1, -1);
  // shutters
  for (const [name, cx, hx] of [
    ["shutterInner", 0.25, 0.35],
    ["shutterOuter", 1.15, 1.05],
  ] as [string, number, number][]) {
    const sj = b.joint(name, { parent: hut, at: [hx, 3.2, 1.52], dir: [0, 1, 0], role: "hinge" });
    b.part(new THREE.BoxGeometry(0.2, 0.84, 0.04), BLUE_WOOD, { bone: sj, at: [cx, 3.2, 1.53] });
    b.part(new THREE.PlaneGeometry(0.19, 0.475), "#ffffff", { bone: sj, at: [cx, 3.2, 1.553], dir: [0, 0, 1], axis: "z", texture: SHUTTER_TEX });
  }
  // deck
  H(new THREE.BoxGeometry(1.5, 0.1, 0.95), DECK, [-0.5, 2.3, 1.975], { name: "deck" });
  {
    const posts: V[] = [
      [-1.2, 0, 2.4],
      [-0.85, 0, 2.4],
      [-0.15, 0, 2.4],
      [0.2, 0, 2.4],
      [-1.2, 0, 1.55],
      [0.2, 0, 1.55],
    ];
    for (const p of posts) b.rod([p[0], 2.35, p[2]], [p[0], 2.95, p[2]], 0.04, RED_WOOD, { bone: hut, sides: 6 });
    for (const x of [-1.2, 0.2]) b.rod([x, 2.9, 1.55], [x, 2.9, 2.4], 0.03, RED_WOOD, { bone: hut, sides: 5 });
    b.rod([-1.2, 2.9, 2.4], [-0.85, 2.9, 2.4], 0.03, RED_WOOD, { bone: hut, sides: 5 });
    b.rod([-0.15, 2.9, 2.4], [0.2, 2.9, 2.4], 0.03, RED_WOOD, { bone: hut, sides: 5 });
    const bal: THREE.BufferGeometry[] = [];
    for (const x of [-1.2, 0.2]) for (const z of [1.75, 1.95, 2.15]) bal.push(T(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 5), [x, 2.62, z]));
    for (const x of [-1.02, -0.32]) bal.push(T(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 5), [x, 2.62, 2.4]));
    merged(bal, CREAM, hut);
  }
  // ladder
  {
    const top = 2.34;
    const topZ = 2.45;
    const botZ = 3.4;
    for (const dx of [-0.78, -0.22]) b.rod([dx, top, topZ], [dx, G, botZ], 0.035, woodPaint(5, "z"), { bone: hut, sides: 6 });
    for (let k = 1; k <= 7; k++) {
      const t = k / 8;
      const y = top + (G - top) * t;
      const z = topZ + (botZ - topZ) * t;
      b.rod([-0.78, y, z], [-0.22, y, z], 0.025, LIGHT_WOOD, { bone: hut, sides: 5 });
    }
  }
  // rushnyk (embroidered towel) on the front rail
  b.part(new THREE.PlaneGeometry(0.28, 0.7), "#ffffff", { bone: hut, at: [-1.03, 2.62, 2.43], dir: [0, 0, 1], axis: "z", texture: RUSHNYK_TEX });
  // lantern
  {
    b.rod([0.2, 2.95, 2.4], [0.2, 3.3, 2.4], 0.04, RED_WOOD, { bone: hut, sides: 6 });
    H(new THREE.BoxGeometry(0.14, 0.04, 0.14), "#2b1d14", [0.2, 3.32, 2.4]);
    glow(H(new THREE.BoxGeometry(0.1, 0.16, 0.1), EMBER, [0.2, 3.42, 2.4]), 1.5);
    H(new THREE.ConeGeometry(0.1, 0.1, 4), RED, [0.2, 3.55, 2.4], { rotation: [0, 45, 0], flat: true });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Gables, roof, ridge
  const HX = 1.7;
  const YE = 3.95;
  const YR = 5.5;
  const ANG = Math.atan2(YR - YE, HX);
  const SL = Math.hypot(HX, YR - YE);
  const gableOutline: [number, number][] = [
    [-1.3, 0],
    [1.3, 0],
    [1.3, 0.27],
    [0, 1.44],
    [-1.3, 0.27],
  ];
  for (const sz of [1, -1]) {
    b.extrude(gableOutline, { at: [0, 4.0, sz * 1.52], x: [1, 0, 0], thickness: 0.16, color: PLANK, bone: hut });
    glow(
      b.part(new THREE.PlaneGeometry(0.84, 0.84), "#ffffff", { bone: hut, at: [0, 4.55, sz * 1.61], dir: [0, 0, sz], axis: "z", texture: SUN_TEX }),
      1,
    );
  }
  for (const s of [1, -1]) {
    H(new THREE.BoxGeometry(SL, 0.12, 3.6), shingles(YE, Math.sin(ANG)), [(s * HX) / 2, (YE + YR) / 2, 0], { rotation: [0, 0, (-s * ANG) / DEG], name: "roof" });
    H(new THREE.BoxGeometry(0.3, 0.3, 3.4), woodPaint(7, "z"), [s * 1.25, 4.12, 0]);
    const tails: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 9; k++) tails.push(T(new THREE.BoxGeometry(0.6, 0.1, 0.14), [s * 1.45, 4.03, -1.5 + k * 0.375]));
    merged(tails, RED_WOOD, hut);
  }
  H(new THREE.CylinderGeometry(0.14, 0.14, 3.7, 6).rotateX(Math.PI / 2), RIDGE, [0, YR + 0.07, 0], { name: "ridge" });

  // horse-head finials
  {
    const K = 1.3;
    const raw: [number, number][] = [
      [0, 0],
      [0.3, 0],
      [0.3, 0.14],
      [0.44, 0.02],
      [0.56, 0.04],
      [0.58, 0.14],
      [0.46, 0.34],
      [0.3, 0.46],
      [0.24, 0.62],
      [0.15, 0.46],
      [0.06, 0.52],
      [0, 0.3],
    ];
    const horse = raw.map(([a, c]) => [a * K, c * K] as [number, number]);
    const HORSE = paint((_p, _n, s) => (s[0] < 0.18 * K ? GOLD : s[1] < 0.1 * K && s[0] > 0.4 * K ? CREAM : RED));
    for (const sz of [1, -1]) {
      const head = b.extrude(horse, { at: [0, YR + 0.1, sz * 1.62], x: [0, 0, sz], y: [0, 1, 0], thickness: 0.1, bevel: 0.012, color: HORSE, bone: hut });
      b.part(new THREE.SphereGeometry(0.028, 6, 4), INK, { bone: hut, at: head.local([0.43 * K, 0.3 * K, 0.06]) });
      b.part(new THREE.SphereGeometry(0.028, 6, 4), INK, { bone: hut, at: head.local([0.43 * K, 0.3 * K, -0.06]) });
      b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: hut, at: head.local([0.2 * K, 0.12 * K, 0.055]) });
    }
  }

  // bargeboard lace on the roof edges
  {
    const n = 10;
    const Hs = 0.16;
    const strip = scallopStrip(SL, n, Hs);
    const w = SL / n;
    const discs: THREE.BufferGeometry[] = [];
    for (const sz of [1, -1]) {
      for (const s of [1, -1]) {
        const dx = -s * HX;
        const dy = YR - YE;
        const len = Math.hypot(dx, dy);
        const d: V = [dx / len, dy / len, 0];
        let yd: V = [-d[1], d[0], 0];
        if (yd[1] > 0) yd = [-yd[0], -yd[1], 0];
        const P0: V = [s * HX, YE, sz * 1.8];
        b.extrude(strip, { at: P0, x: d, y: yd, thickness: 0.06, color: BLUE_WOOD, bone: hut });
        for (let i = 0; i < n; i++) {
          const xc = (i + 0.5) * w;
          const c: V = [P0[0] + d[0] * xc + yd[0] * Hs * 0.6, P0[1] + d[1] * xc + yd[1] * Hs * 0.6, P0[2] + sz * 0.034];
          discs.push(T(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8).rotateX(Math.PI / 2), c));
        }
      }
    }
    merged(discs, CREAM, hut);
  }

  // chimney and smoke
  H(new THREE.BoxGeometry(0.42, 1.15, 0.42), BRICK, [0.75, 5.18, -0.8], { name: "chimney" });
  H(new THREE.BoxGeometry(0.54, 0.09, 0.54), "#2b1d14", [0.75, 5.78, -0.8]);
  const puffs: [V, number, string][] = [
    [[0.78, 6.1, -0.8], 0.17, "#c9c3d6"],
    [[0.9, 6.45, -0.7], 0.22, "#d4cfe0"],
    [[1.05, 6.85, -0.55], 0.27, "#ddd9e8"],
  ];
  for (const [p, rr, c] of puffs) H(new THREE.IcosahedronGeometry(rr, 1), c, p, { flat: true });

  return b.root;
}
```