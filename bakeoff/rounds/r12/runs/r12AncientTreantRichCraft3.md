```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  vec,
  catmull,
  polyline,
  bezier,
  limb,
  paint,
  mottle,
  noise,
  mix,
  smoothstep,
  rgb,
  svg,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian in the Warcraft style. It has a bark-furrowed trunk body, root feet, long twig-fingered arms, a stern glowing-eyed face with tusks and a moss beard, antlers and a leafy crown, a glowing heart-seed in the chest, and glowing mushrooms.",
};

type V = THREE.Vector3;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ico = (rx: number, ry: number, rz: number, detail = 1) => {
  const g = new THREE.IcosahedronGeometry(1, detail);
  g.scale(rx, ry, rz);
  return g;
};

// ---------------------------------------------------------------- flat colours
const DARK = "#140b06";
const IVORY = "#e6d7a8";
const VINE = "#3f7d2b";
const VINE_L = "#86c03c";
const GOLD = "#e0a83a";
const GLOW_G = "#b8ff62";
const GLOW_A = "#ffc43c";
const STEM = "#e9dfc0";
const CLAW = "#2a1a10";
const CAVITY = "#1b0f08";
const TEAL = "#34e0d0";
const PURP = "#9a6cff";
const ORNG = "#ff7a3a";
const TOOTH = "#cdb98a";
const ROPE = "#a8803e";

// ---------------------------------------------------------------- SVG drawings
const leafSvg = (dark: string, mid: string, light: string, vein: string) => {
  const leaf = (rot: number, sc: number) =>
    `<g transform="translate(32 78) rotate(${rot}) scale(${sc}) translate(-32 -78)">
      <path d="M32 78 C12 58 10 28 32 3 C54 28 52 58 32 78Z" fill="url(#g)" stroke="${dark}" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M32 74 L32 12" stroke="${vein}" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 58 L22 46 M32 58 L42 46 M32 40 L24 29 M32 40 L40 29" stroke="${vein}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    </g>`;
  return `<svg viewBox="-14 0 108 80" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${dark}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${light}"/>
    </linearGradient></defs>
    ${leaf(-58, 0.7)}${leaf(58, 0.7)}${leaf(-30, 0.9)}${leaf(30, 0.9)}${leaf(0, 1)}
  </svg>`;
};

const MOSS_SVG = `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 100 C2 70 8 40 6 10 C12 30 16 60 18 100Z" fill="#4c8a2c" stroke="#27501a" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M18 100 C16 60 24 30 24 2 C30 28 34 60 34 100Z" fill="#6aa83a" stroke="#27501a" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M34 100 C34 70 42 44 44 14 C50 40 52 70 50 100Z" fill="#58963200" stroke="#27501a" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M34 100 C34 70 42 44 44 14 C50 40 52 70 50 100Z" fill="#5a9a30" stroke="#27501a" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M46 100 C48 76 52 56 56 30 C58 60 58 80 58 100Z" fill="#7cb83e" stroke="#27501a" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;

const BLOSSOM_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  ${[0, 72, 144, 216, 288]
    .map(
      (a) =>
        `<g transform="rotate(${a} 32 32)"><ellipse cx="32" cy="16" rx="10" ry="15" fill="#ffa8cc" stroke="#b04a7c" stroke-width="2.4"/><path d="M32 28 L32 8" stroke="#ff6fa8" stroke-width="2" stroke-linecap="round"/></g>`,
    )
    .join("")}
  <circle cx="32" cy="32" r="7" fill="#ffd45c" stroke="#a8741c" stroke-width="2.4"/>
</svg>`;

const EYE_SVG = `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#fffbd0"/><stop offset="0.45" stop-color="#d8ff5a"/><stop offset="1" stop-color="#58b020"/>
  </radialGradient></defs>
  <path d="M3 36 Q22 6 56 6 Q90 8 98 46 Q56 62 3 36Z" fill="#0c0603"/>
  <ellipse cx="58" cy="35" rx="23" ry="19" fill="url(#i)"/>
  <ellipse cx="58" cy="35" rx="7" ry="15" fill="#0c0603"/>
  <ellipse cx="50" cy="27" rx="5" ry="4" fill="#ffffff"/>
  <path d="M2 36 Q22 4 56 4 Q92 6 99 48" fill="none" stroke="#3b2414" stroke-width="8" stroke-linecap="round"/>
  <path d="M10 40 Q40 58 90 50" fill="none" stroke="#2a190d" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const GLYPH = "M32 8 L32 56 M32 24 L16 12 M32 24 L48 12 M32 40 L18 30 M32 40 L46 30 M20 56 L44 56";
const RUNE_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="32" r="29" stroke="#1b5a22" stroke-width="7"/>
    <path d="${GLYPH}" stroke="#1b5a22" stroke-width="10"/>
    <circle cx="32" cy="32" r="29" stroke="#c8ff7a" stroke-width="3"/>
    <path d="${GLYPH}" stroke="#c8ff7a" stroke-width="4.5"/>
  </g>
</svg>`;

const HEART_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#1a0f08"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffc23a" stroke-width="3.5"/>
  <circle cx="50" cy="50" r="31" fill="none" stroke="#9bff5a" stroke-width="3" stroke-dasharray="7 4"/>
  ${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45} 50 50)"><path d="M50 8 L43 20 M50 8 L57 20 M50 8 L50 24" stroke="#ffc23a" stroke-width="3" stroke-linecap="round" fill="none"/></g>`).join("")}
</svg>`;

// ---------------------------------------------------------------- paints
type BarkOpts = { dark: string; mid: string; light: string; seed: number; moss: number; mud: number };
function barkPaint(o: BarkOpts) {
  const dark = rgb(o.dark);
  const mid = rgb(o.mid);
  const light = rgb(o.light);
  const crack = rgb("#150c07");
  const mossD = rgb("#3f7424");
  const mossL = rgb("#8ac13a");
  const mud = rgb("#3b2a1b");
  const q = new THREE.Vector3();
  return paint((p, n) => {
    q.set(p.x * 1.1, p.y * 0.2, p.z * 1.1);
    const f = noise(q, 0.15, o.seed);
    q.set(p.x * 0.8, p.y * 0.35, p.z * 0.8);
    const g = noise(q, 0.35, o.seed + 4);
    let c: Rgb = mix(dark, mid, smoothstep(0.3, 0.68, f));
    c = mix(c, light, smoothstep(0.52, 0.8, f) * smoothstep(0.35, 0.65, g) * 0.8);
    if (Math.abs(f - 0.47) < 0.028) c = mix(c, crack, 0.85);
    const top = smoothstep(0.3, 0.8, n.y);
    const m = o.moss * top * smoothstep(0.38, 0.55, noise(p, 0.22, o.seed + 9));
    if (m > 0) c = mix(c, mix(mossD, mossL, smoothstep(0.4, 0.7, noise(p, 0.07, o.seed + 2))), Math.min(1, m * 1.6));
    const mudAmt = o.mud * smoothstep(0.7, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.1, o.seed + 5));
    c = mix(c, mud, Math.min(mudAmt, 0.85));
    const w = 0.82 + 0.28 * smoothstep(-0.8, 0.9, n.y);
    const out: [number, number, number] = [
      Math.min(1, c[0] * w * (1 + 0.06 * top)),
      Math.min(1, c[1] * w),
      Math.min(1, c[2] * w * (1.12 - 0.12 * top)),
    ];
    return out;
  });
}

const BARK = barkPaint({ dark: "#2e1c11", mid: "#5c3d27", light: "#8d6a45", seed: 3, moss: 1, mud: 0.7 });
const BARK_LIMB = barkPaint({ dark: "#3a2314", mid: "#6b4730", light: "#9c7650", seed: 3, moss: 0.6, mud: 0.2 });
const BARK_DARK = barkPaint({ dark: "#1e120a", mid: "#3d2818", light: "#5f4228", seed: 3, moss: 0.3, mud: 1 });
const TWIG = barkPaint({ dark: "#4a2f1b", mid: "#7a5535", light: "#b08a58", seed: 8, moss: 0.2, mud: 0 });

const CANOPY = (() => {
  const a0 = rgb("#27622a");
  const a1 = rgb("#4f9a30");
  const hi = rgb("#9acb45");
  const sh = rgb("#173a22");
  const au = rgb("#d9a23a");
  return paint((p, n) => {
    const a = noise(p, 0.45, 11);
    const c2 = noise(p, 0.16, 12);
    let c: Rgb = mix(a0, a1, smoothstep(0.3, 0.7, a));
    c = mix(c, hi, smoothstep(0.1, 0.9, n.y) * smoothstep(0.45, 0.75, c2) * 0.7);
    c = mix(c, sh, smoothstep(0.0, -0.8, n.y) * 0.6);
    if (noise(p, 0.5, 14) > 0.62) c = mix(c, au, 0.55);
    return c;
  });
})();

const MOSSP = mottle("#3f7a24", "#8cc43c", { size: 0.1, seed: 4 });

export default function build() {
  const b = createBuilder({ name: "treant", paintSize: 2048 });
  const R = rng(1337);

  // ------------------------------------------------------------ textures
  const EYE = svg(EYE_SVG, { size: 256 });
  const RUNE = svg(RUNE_SVG, { size: 192 });
  const HEART = svg(HEART_SVG, { size: 256 });
  const LEAF_G = svg(leafSvg("#17401f", "#3f8a2e", "#8cd048", "#c4ee80"), { size: 256 });
  const LEAF_L = svg(leafSvg("#2a5a1c", "#78b838", "#d4ee70", "#f0ffb0"), { size: 192 });
  const LEAF_A = svg(leafSvg("#6a2a10", "#d98a2a", "#ffd25a", "#ffe9a0"), { size: 192 });
  const MOSS = svg(MOSS_SVG, { size: 192 });
  const BLOSSOM = svg(BLOSSOM_SVG, { size: 128 });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.85, 0] });
  const spine = b.chain("spine", catmull([[0, 1.85, 0], [0, 2.45, 0.0], [0, 3.0, 0.1], [0, 3.5, 0.2]]), {
    parent: hips,
    role: "spine",
  });
  const sp1 = spine.joints[0];
  const sp2 = spine.joints[1];
  const sp3 = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 3.5, 0.2], [0, 3.72, 0.34], [0, 3.9, 0.52]]), {
    parent: spine,
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 3.9, 0.52], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.82, 0.8], aim: [0, 3.7, 1.3], role: "jaw" });

  // ------------------------------------------------------------ helpers
  const burl = (bone: any, at: V | number[], r: number[], color: any = BARK, rot?: number[], detail = 1) =>
    b.part(ico(r[0], r[1], r[2], detail), color, {
      bone,
      at: at as any,
      flat: true,
      ...(rot ? { rotation: rot as any } : {}),
    });

  const spinFlow = (i: number) => [Math.cos(i * 2.399), -0.25, Math.sin(i * 2.399)];
  function leaves(frames: any[], tex: any, size: [number, number], bone: any, o: any = {}) {
    if (!frames.length) return;
    b.cards(frames, tex, {
      size,
      lean: 45,
      bend: 20,
      vary: 0.35,
      spin: 25,
      rng: rng(frames.length * 7 + 1),
      flow: (_f: any, i: number) => spinFlow(i),
      bone,
      cross: true,
      ...o,
    });
  }
  function hangMoss(points: V[], bone: any, size: [number, number] = [0.16, 0.45]) {
    if (!points.length) return;
    b.cards(
      points.map((p) => frame(p, [0, 1, 0])),
      MOSS,
      { size, lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(points.length + 5), bone, cross: true },
    );
  }

  function mushroom(hit: any, h: number, cr: number, cap: string, stem: string, g: number) {
    const n: V = hit.n.clone();
    const base: V = hit.at.clone().addScaledVector(n, -0.03);
    const sr = cr * 0.28;
    const bn = hit.bone ? { bone: hit.bone } : {};
    b.lathe([[0, 0], [sr, 0], [sr * 0.75, h], [0, h]], { at: base, axis: n, segments: 6, color: stem, ...bn });
    const top = base.clone().addScaledVector(n, h * 0.92);
    const capPart = b.lathe(
      [[0, 0], [cr, 0], [cr * 0.95, cr * 0.14], [cr * 0.6, cr * 0.38], [0, cr * 0.46]],
      { at: top, axis: n, segments: 8, color: cap, ...bn },
    );
    if (g > 0) glow(capPart, g);
  }
  const CAPS = [TEAL, PURP, ORNG, TEAL];
  const CAPG = [1.6, 1.6, 0, 1.3];
  function shroomPatch(target: any, count: number, seed: number, minDist: number, minNy = 0.5) {
    const r = rng(seed);
    const hits = b.surface(target).scatter(count, { rng: r, minDist, filter: (h: any) => h.n.y > minNy });
    hits.forEach((h: any, i: number) => {
      const cr = 0.07 + r() * 0.08;
      mushroom(h, cr * 1.4 + 0.04, cr, CAPS[i % 4], STEM, CAPG[i % 4]);
    });
  }
  function mossPatch(target: any, count: number, seed: number, size = 1) {
    const hits = b.surface(target).scatter(count, { rng: rng(seed), minDist: 0.2 * size, filter: (h: any) => h.n.y > 0.45 });
    for (const h of hits) b.stick(ico(0.16 * size, 0.07 * size, 0.14 * size, 1), MOSSP, h, { embed: 0.3, flat: true });
  }

  function branch(bone: any, p0: V, dir: V, len: number, r: number, depth: number, tips: any[]) {
    const d = dir.clone().normalize();
    const sway = v3(R() - 0.5, (R() - 0.3) * 0.4, R() - 0.5).multiplyScalar(len * 0.7);
    const p1 = p0.clone().addScaledVector(d, len * 0.5).addScaledVector(sway, 0.5);
    const p2 = p0.clone().addScaledVector(d, len).add(sway);
    const path = catmull([p0, p1, p2]);
    b.sweep(path, [r, r * (depth > 0 ? 0.5 : 0.25)], {
      bone,
      sides: 6,
      color: TWIG,
      caps: { start: "round", end: depth > 0 ? "round" : "point" },
    });
    if (depth > 0) {
      for (const t of [0.5, 1]) {
        const at = vec(path.at(t));
        const side = v3(R() - 0.5, R() * 0.5, R() - 0.5).multiplyScalar(1.4);
        branch(bone, at, d.clone().add(side), len * 0.7, r * 0.55, depth - 1, tips);
      }
    } else tips.push(frame(p2, d));
  }

  // ------------------------------------------------------------ torso
  const rxs = [0.56, 0.64, 0.8, 0.88, 0.7];
  const rys = [0.46, 0.54, 0.62, 0.6, 0.46];
  const prof = (t: number, k: number[]) => {
    const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
    const i = Math.min(Math.floor(x), k.length - 2);
    return k[i] + (k[i + 1] - k[i]) * (x - i);
  };
  const torso = b.sweep(spine, (t: number): [number, number] => [prof(t, rxs), prof(t, rys)], {
    sides: 12,
    color: BARK,
  });
  b.sweep(neck, [0.36, 0.32, 0.3], { sides: 8, color: BARK });

  burl(hips, [0, 1.92, 0], [0.62, 0.4, 0.5], BARK);
  burl(sp2, [0, 3.0, 0.42], [0.62, 0.5, 0.34], BARK_LIMB);
  burl(sp3, [0, 3.62, 0.05], [0.98, 0.34, 0.55], BARK);
  const hump = burl(sp3, [0, 3.38, -0.5], [0.62, 0.6, 0.46], BARK, [10, 0, 0]);
  for (const s of [1, -1]) burl(sp2, [s * 0.5, 2.7, -0.45], [0.4, 0.36, 0.3], BARK_LIMB);

  const skinT = b.surface(torso);
  const ridges = [ico(0.1, 0.07, 0.22, 1), ico(0.14, 0.09, 0.14, 1), ico(0.08, 0.06, 0.3, 0)];
  skinT
    .scatter(34, { rng: rng(5), minDist: 0.28, filter: (h: any) => h.n.y > -0.2 })
    .forEach((h: any, i: number) => {
      b.stick(ridges[i % 3], i % 2 ? BARK_LIMB : BARK_DARK, h, {
        embed: 0.45,
        flow: [0, 1, 0],
        spin: R() * 40 - 20,
        flat: true,
      });
    });

  // heart-seed in a hollow of the chest
  {
    const ch = skinT.nearest([0, 2.95, 1.5]);
    const n: V = ch.n.clone();
    b.stick(new THREE.CylinderGeometry(0.36, 0.4, 0.14, 12), CAVITY, ch, { embed: 0.55 });
    glow(
      b.part(new THREE.CircleGeometry(0.32, 16), "#ffffff", {
        at: ch.at.clone().addScaledVector(n, 0.056),
        dir: n,
        axis: "z",
        texture: HEART,
        bone: sp2,
      }),
      1.2,
    );
    glow(
      b.part(ico(0.13, 0.13, 0.13, 1), GLOW_G, { at: ch.at.clone().addScaledVector(n, 0.12), bone: sp2, flat: true }),
      2,
    );
    b.ring(ch, { count: 9, radius: 0.44 }, (it: any) => {
      const h = skinT.nearest(it);
      b.spike(h, h, 0.22, 0.06, { color: BARK_DARK });
    });
  }

  // vine belt with leaf fringe and a hanging seed-gem
  {
    const loop = skinT.loop([0, 2.1, 0], { dir: [0, 1, 0], lift: 0.03 });
    b.sweep(loop, 0.065, { color: VINE, bone: sp1 });
    b.sweep(skinT.loop([0, 2.24, 0], { dir: [0, 1, 0], lift: 0.04 }), 0.04, { color: VINE_L, bone: sp1 });
    const fr: any[] = [];
    b.along(loop, 16, (at: any) => {
      const p = vec(at.at);
      fr.push(frame(p, [p.x, 0.35, p.z]));
    });
    leaves(fr, LEAF_L, [0.22, 0.16], sp1, { lean: 110, flow: [0, -1, 0], bend: 20 });
    const hg = skinT.nearest([0, 2.05, 1.5]);
    b.stick(ico(0.2, 0.06, 0.24, 1), BARK_DARK, hg, { embed: 0.3, flat: true });
    const gem = b.part(new THREE.OctahedronGeometry(0.1, 0).scale(0.8, 1.4, 0.8), GLOW_A, {
      at: hg.at.clone().addScaledVector(hg.n, 0.1),
      bone: sp1,
      flat: true,
    });
    glow(gem, 1.8);
    b.part(new THREE.TorusGeometry(0.11, 0.022, 6, 12), GOLD, {
      at: hg.at.clone().addScaledVector(hg.n, 0.1),
      dir: hg.n,
      axis: "z",
      bone: sp1,
    });
  }

  // ------------------------------------------------------------ legs
  const legs: any[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = v3(s * 0.5, 1.85, 0);
    const foot = v3(s * 0.62, 0.34, 0.12);
    const lp = limb(hipP, foot, [0.92, 0.9], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, lp, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      contact: [s * 0.62, 0, 0.3],
    });
    legs.push(leg);
    const ankle = leg.joints[leg.joints.length - 1];
    const knee = leg.joints[1];
    const legSweep = b.sweep(leg, [0.44, 0.4, 0.33, 0.34, 0.26], { sides: 10, color: BARK });

    burl(leg.joints[0], hipP.clone().add(v3(s * 0.05, 0.05, 0)), [0.46, 0.46, 0.44], BARK);
    burl(knee, vec(lp[1]).add(v3(0, 0.0, 0.2)), [0.26, 0.24, 0.2], BARK_LIMB);
    burl(knee, vec(lp[1]).add(v3(s * 0.2, 0.02, -0.05)), [0.15, 0.2, 0.18], BARK_LIMB);
    // heavy foot
    const fx = s * 0.62;
    burl(ankle, [fx, 0.19, 0.2], [0.36, 0.2, 0.5], BARK_DARK);
    burl(ankle, [fx, 0.2, -0.12], [0.26, 0.17, 0.22], BARK_DARK);

    [-0.27, -0.09, 0.09, 0.27].forEach((off, k) => {
      const L = Math.abs(off) > 0.2 ? 0.85 : 1;
      const pts = [
        v3(fx + off * 0.5, 0.12, 0.38),
        v3(fx + off * 1.0, 0.115, 0.38 + 0.3 * L),
        v3(fx + off * 1.5, 0.085, 0.38 + 0.62 * L),
      ];
      const toe = b.chain(`toe${side}${k}`, polyline(pts), {
        parent: leg,
        role: "digit",
        names: [`toe${side}${k}a`, `toe${side}${k}b`],
      });
      b.sweep(toe, [0.13, 0.1, 0.04], { sides: 6, color: BARK_DARK, caps: { start: "round", end: "point" } });
      b.spike(pts[2], [0, 0, 1], 0.14, 0.05, { color: CLAW, bone: toe.joints[1] });
    });
    // buttress roots on the ground
    ([[s * 1, 0.1], [s * 0.8, -0.7], [0, -1]] as number[][]).forEach(([dx, dz]) => {
      const dv = v3(dx, 0, dz).normalize();
      const a = v3(fx, 0.14, 0.05);
      const pth = catmull([
        a,
        a.clone().addScaledVector(dv, 0.45).setY(0.11),
        a.clone().addScaledVector(dv, 0.95).setY(0.05),
      ]);
      b.sweep(pth, [0.13, 0.03], { sides: 6, color: BARK_DARK, bone: ankle, caps: { end: "point" } });
    });
    // ferns at the feet
    const tuft: any[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      tuft.push(frame(v3(fx + Math.cos(a) * 0.5, 0.02, 0.15 + Math.sin(a) * 0.6), [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3]));
    }
    leaves(tuft, LEAF_L, [0.3, 0.22], ankle, { lean: 15, bend: 10 });
    mossPatch(legSweep, 3, 40 + (s > 0 ? 1 : 2), 1.1);
    hangMoss([vec(lp[1]).add(v3(s * 0.25, 0.1, 0.1)), vec(lp[0]).add(v3(s * 0.4, -0.15, 0.2))], knee);
  }

  // ------------------------------------------------------------ root tail
  {
    const tail = b.chain("tail", catmull([[0, 1.75, -0.25], [0, 1.2, -0.85], [0, 0.55, -1.4], [0, 0.12, -1.9]]), {
      parent: hips,
      role: "tail",
    });
    const tailSweep = b.sweep(tail, [0.32, 0.26, 0.18, 0.12], { sides: 8, color: BARK_DARK });
    mossPatch(tailSweep, 3, 60, 0.9);
    shroomPatch(tailSweep, 2, 61, 0.2, 0.3);
    const tj = tail.joints[1];
    branch(tj, v3(0, 1.0, -0.95), v3(0.8, -0.1, -0.5), 0.55, 0.06, 0, []);
    branch(tj, v3(0, 1.0, -0.95), v3(-0.8, -0.1, -0.5), 0.55, 0.06, 0, []);
  }

  // ------------------------------------------------------------ arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = v3(s * 0.9, 3.3, 0.1);
    const hand = v3(s * 1.78, 1.5, 0.55);
    const pts = limb(sh, hand, [1.15, 1.15], [s * 0.5, 0, -0.8]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: sp3,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    });
    const armSweep = b.sweep(arm, [0.38, 0.35, 0.3, 0.32, 0.19], { sides: 10, color: BARK_LIMB });
    const sA = b.surface(armSweep);
    const el = vec(pts[1]);
    const wr = vec(pts[2]);
    const shp = vec(pts[0]);

    // shoulder burl with foliage
    const shBurl = burl(arm.joints[0], shp.clone().add(v3(s * 0.06, 0.12, 0)), [0.52, 0.45, 0.5], BARK);
    mossPatch(shBurl, 5, 70 + (s > 0 ? 0 : 1), 1.1);
    shroomPatch(shBurl, 2, 72 + (s > 0 ? 0 : 3), 0.3);
    const shHits = b.surface(shBurl).scatter(16, { rng: rng(75 + (s > 0 ? 0 : 1)), minDist: 0.14, filter: (h: any) => h.n.y > 0.1 });
    leaves(shHits, LEAF_G, [0.3, 0.22], arm.joints[0], { lean: 40 });
    const shBranch: any[] = [];
    branch(arm.joints[0], shp.clone().add(v3(s * 0.1, 0.4, -0.05)), v3(s * 0.5, 1, 0.1), 0.8, 0.07, 1, shBranch);
    leaves(shBranch, LEAF_G, [0.3, 0.22], arm.joints[0]);
    hangMoss(
      b.surface(shBurl)
        .scatter(5, { rng: rng(77 + (s > 0 ? 0 : 1)), minDist: 0.2, filter: (h: any) => h.n.y < 0.3 && h.n.y > -0.2 })
        .map((h: any) => vec(h.at)),
      arm.joints[0],
    );

    // elbow burl, bark spurs
    burl(arm.joints[1], el.clone().add(v3(0, 0, -0.18)), [0.22, 0.22, 0.24], BARK);
    b.spike(el.clone().add(v3(0, 0, -0.3)), [0, 0.3, -1], 0.26, 0.07, { color: BARK_DARK, bone: arm.joints[1] });

    // vine wraps and a glowing rune
    const dUp = el.clone().sub(shp).normalize();
    const dLow = wr.clone().sub(el).normalize();
    b.sweep(sA.loop(shp.clone().lerp(el, 0.28), { dir: dUp, lift: 0.025 }), 0.045, { color: VINE, bone: arm.joints[0] });
    b.sweep(sA.loop(el.clone().lerp(wr, 0.6), { dir: dLow, lift: 0.025 }), 0.05, { color: VINE, bone: arm.joints[1] });
    b.sweep(sA.loop(el.clone().lerp(wr, 0.72), { dir: dLow, lift: 0.03 }), 0.035, { color: VINE_L, bone: arm.joints[1] });
    {
      const mp = shp.clone().lerp(el, 0.55);
      const hit = sA.nearest(mp.clone().add(v3(s * 0.7, 0, 0)));
      glow(
        b.decal(armSweep, RUNE, { at: hit, dir: [s, 0.05, 0.25], size: [0.3, 0.3], up: [0, 1, 0], mirror: s < 0 }),
        1.5,
      );
      const mp2 = el.clone().lerp(wr, 0.35);
      const hit2 = sA.nearest(mp2.clone().add(v3(s * 0.7, 0, 0.2)));
      glow(
        b.decal(armSweep, RUNE, { at: hit2, dir: [s, 0, 0.3], size: [0.24, 0.24], up: [0, 1, 0], mirror: s > 0 }),
        1.3,
      );
    }
    mossPatch(armSweep, 3, 80 + (s > 0 ? 0 : 1), 1);

    // hand: palm, knuckles and twig fingers
    const d = dLow.clone();
    const inward = v3(-s, 0, 0);
    inward.addScaledVector(d, -inward.dot(d)).normalize();
    const lat = new THREE.Vector3().crossVectors(d, inward).normalize();
    const fwd = v3(0, 0, 1);
    fwd.addScaledVector(d, -fwd.dot(d)).normalize();
    b.part(ico(0.2, 0.17, 0.09, 1), BARK_LIMB, {
      at: wr.clone().addScaledVector(d, 0.1),
      dir: d,
      up: inward,
      bone: arm.joints[2],
      flat: true,
    });
    const lens = [0.9, 1.05, 1.05, 0.85];
    for (let k = 0; k < 5; k++) {
      let base: V;
      let m: V;
      let t: V;
      if (k < 4) {
        const off = (k - 1.5) * 0.1;
        const Lk = lens[k];
        base = wr.clone().addScaledVector(d, 0.16).addScaledVector(lat, off * 0.9);
        m = base.clone().addScaledVector(d, 0.3 * Lk).addScaledVector(lat, off * 0.7).addScaledVector(inward, 0.03);
        t = m.clone().addScaledVector(d, 0.28 * Lk).addScaledVector(lat, off * 0.6).addScaledVector(inward, 0.16 * Lk);
      } else {
        base = wr.clone().addScaledVector(d, 0.1).addScaledVector(fwd, 0.12);
        m = base.clone().addScaledVector(d, 0.18).addScaledVector(fwd, 0.17);
        t = m.clone().addScaledVector(d, 0.14).addScaledVector(fwd, 0.1).addScaledVector(inward, 0.1);
      }
      const fch = b.chain(`finger${side}${k}`, polyline([base, m, t]), {
        parent: arm,
        role: "digit",
        names: [`finger${side}${k}a`, `finger${side}${k}b`],
      });
      b.sweep(fch, [0.07, 0.055, 0.022], { sides: 6, color: TWIG, caps: { start: "round", end: "point" } });
      burl(fch.joints[0], base, [0.09, 0.09, 0.09], BARK_LIMB, undefined, 0);
      const tDir = t.clone().sub(m).normalize();
      const mDir = m.clone().sub(base).normalize();
      leaves([frame(t, tDir), frame(m.clone().addScaledVector(lat, 0.0), mDir.clone().add(v3(0, 0.2, 0)))], LEAF_G, [0.18, 0.13], fch.joints[1], {
        lean: 55,
      });
    }
  }

  // ------------------------------------------------------------ head
  const HC = v3(0, 4.1, 0.75);
  const skull = b.part(ico(0.52, 0.47, 0.5, 2), BARK, { at: HC, bone: head, flat: true });
  burl(head, [0, 4.42, 0.6], [0.4, 0.2, 0.4], BARK_LIMB);
  const skin = b.surface(skull);

  // eyes
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.23, 4.08, 1.5]);
    glow(b.decal(skull, EYE, { at: hit, dir: [s * 0.18, 0, 1], size: [0.2, 0.128], mirror: s > 0, up: [0, 1, 0] }), 1.4);
  }

  // brows, nose, cheeks, ears
  const browSweeps: any[] = [];
  for (const s of [1, -1]) {
    const brow = b.sweep(catmull([v3(s * 0.06, 4.24, 1.22), v3(s * 0.26, 4.32, 1.17), v3(s * 0.47, 4.36, 0.95)]), [0.075, 0.07, 0.065], {
      bone: head,
      sides: 7,
      color: BARK_DARK,
    });
    browSweeps.push(brow);
    leaves([brow.at(0.55), brow.at(0.85), brow.at(0.3)], LEAF_G, [0.16, 0.12], head, { lean: 70, flow: [s, 0.3, -0.2] });
    burl(head, [s * 0.38, 3.9, 0.95], [0.16, 0.11, 0.14], BARK_LIMB);
    b.extrude([[0, 0], [0.12, 0.1], [0.34, 0.17, "sharp"], [0.12, -0.02], [0.04, -0.08]], {
      at: [s * 0.5, 4.12, 0.68],
      x: [s, 0, 0],
      thickness: 0.04,
      bevel: 0.008,
      color: BARK_LIMB,
      bone: head,
    });
  }
  b.sweep(catmull([v3(0, 4.22, 1.2), v3(0, 4.1, 1.28), v3(0, 4.0, 1.32)]), [0.06, 0.09], { bone: head, sides: 6, color: BARK_LIMB });
  burl(head, [0, 3.98, 1.3], [0.1, 0.17, 0.15], BARK_LIMB, [-12, 0, 0]);
  for (const s of [1, -1]) burl(head, [s * 0.05, 3.9, 1.41], [0.03, 0.025, 0.025], CAVITY as any, undefined, 0);

  // upper lip, mouth, lower jaw
  burl(head, [0, 3.84, 1.13], [0.27, 0.11, 0.2], BARK_LIMB);
  burl(head, [0, 3.74, 1.12], [0.26, 0.05, 0.2], CAVITY as any, undefined, 0);
  for (const x of [-0.15, -0.05, 0.05, 0.15]) {
    b.spike([x, 3.77, 1.21], [0, -1, 0.1], 0.07, 0.022, { color: TOOTH, bone: head });
    b.spike([x + 0.05, 3.72, 1.21], [0, 1, 0.1], 0.07, 0.022, { color: TOOTH, bone: jaw });
  }
  burl(jaw, [0, 3.64, 1.08], [0.3, 0.11, 0.22], BARK);
  burl(jaw, [0, 3.56, 1.24], [0.17, 0.1, 0.12], BARK_LIMB);
  for (const s of [1, -1]) {
    b.sweep(catmull([v3(s * 0.4, 3.93, 0.78), v3(s * 0.36, 3.8, 0.95), v3(s * 0.28, 3.66, 1.06)]), 0.08, {
      bone: jaw,
      sides: 6,
      color: BARK,
    });
    // tusks
    b.sweep(bezier(v3(s * 0.28, 3.64, 1.14), v3(s * 0.38, 3.82, 1.28), v3(s * 0.31, 4.02, 1.3)), [0.055, 0.0], {
      bone: jaw,
      sides: 6,
      color: IVORY,
      caps: { start: "round", end: "point" },
    });
    // root moustache
    b.sweep(bezier(v3(s * 0.12, 3.86, 1.28), v3(s * 0.32, 3.78, 1.26), v3(s * 0.52, 3.55, 1.05)), [0.05, 0.012], {
      bone: head,
      sides: 5,
      color: TWIG,
      caps: { end: "point" },
    });
  }
  // beard of roots and moss
  const beardPts: V[] = [];
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.085;
    const p0 = v3(x, 3.56, 1.1 + 0.13 * (1 - Math.abs(i - 3) / 3));
    const p1 = v3(x * 1.4, 3.2 - Math.abs(i - 3) * 0.04, p0.z + 0.16);
    const p2 = v3(x * 1.9 + (R() - 0.5) * 0.1, 2.78 + Math.abs(i - 3) * 0.12 - R() * 0.1, p0.z + 0.12 + R() * 0.08);
    b.sweep(bezier(p0, p1, p2), [0.06, 0.012], { bone: jaw, sides: 5, color: TWIG, caps: { end: "point" } });
    beardPts.push(p0.clone().add(v3(0, -0.04, 0.0)));
  }
  hangMoss(beardPts, jaw, [0.17, 0.55]);
  hangMoss([v3(-0.45, 4.0, 0.9), v3(0.45, 4.0, 0.9), v3(-0.5, 3.95, 0.7), v3(0.5, 3.95, 0.7)], head, [0.16, 0.5]);

  mossPatch(skull, 4, 90, 0.9);
  shroomPatch(skull, 2, 91, 0.3);

  // ------------------------------------------------------------ antlers
  const antTips: any[] = [];
  for (const s of [1, -1]) {
    const mp = catmull([v3(s * 0.3, 4.48, 0.68), v3(s * 0.62, 4.85, 0.6), v3(s * 0.9, 5.3, 0.48), v3(s * 0.86, 5.75, 0.5)]);
    b.sweep(mp, [0.11, 0.04], { bone: head, sides: 7, color: TWIG, caps: { start: "round", end: "point" } });
    antTips.push(frame(v3(s * 0.86, 5.75, 0.5), [0, 1, 0]));
    const defs: [number, number[], number][] = [
      [0.35, [s * 0.9, 0.5, 0.5], 0.65],
      [0.6, [s * 0.8, 0.7, -0.2], 0.6],
      [0.85, [-s * 0.3, 0.8, 0.5], 0.5],
    ];
    for (const [t, dd, L] of defs) branch(head, vec(mp.at(t)), v3(dd[0], dd[1], dd[2]), L, 0.05, 1, antTips);
  }
  leaves(antTips, LEAF_L, [0.28, 0.2], head);

  // ------------------------------------------------------------ crown of leaves
  const clumps: any[] = [];
  const addClump = (x: number, y: number, z: number, r: number) =>
    clumps.push(
      b.part(ico(r * 1.1, r * 0.85, r, 1), CANOPY, {
        at: [x, y, z],
        bone: head,
        flat: true,
        rotation: [R() * 40, R() * 360, R() * 40],
      }),
    );
  for (let i = 0; i < 9; i++) {
    const th = (i / 9) * Math.PI * 2;
    addClump(Math.sin(th) * 1.0, 4.85 + (R() - 0.5) * 0.15, 0.2 + Math.cos(th) * 0.8, 0.5 + R() * 0.08);
  }
  for (let i = 0; i < 6; i++) {
    const th = (i / 6) * Math.PI * 2 + 0.3;
    addClump(Math.sin(th) * 0.62, 5.2 + R() * 0.1, 0.2 + Math.cos(th) * 0.5, 0.45);
  }
  addClump(0, 5.5, 0.2, 0.5);
  addClump(0.35, 5.45, -0.2, 0.38);
  addClump(-0.35, 5.45, -0.2, 0.38);
  addClump(0.9, 4.3, -0.45, 0.4);
  addClump(-0.9, 4.3, -0.45, 0.4);
  addClump(0, 4.1, -0.75, 0.52);
  // foliage cards over the canopy
  {
    const cs = b.surface(clumps);
    const ch = cs.scatter(240, { rng: rng(21), minDist: 0.1, filter: (h: any) => h.n.y > -0.35 });
    const g: any[] = [];
    const l: any[] = [];
    const a: any[] = [];
    const bl: any[] = [];
    ch.forEach((h: any, i: number) => {
      if (i % 23 === 5) bl.push(h);
      else if (i % 6 === 0) a.push(h);
      else if (i % 6 < 3) l.push(h);
      else g.push(h);
    });
    leaves(g, LEAF_G, [0.32, 0.24], head);
    leaves(l, LEAF_L, [0.3, 0.22], head);
    leaves(a, LEAF_A, [0.26, 0.2], head);
    leaves(bl, BLOSSOM, [0.15, 0.15], head, { lean: 30, bend: 0 });
  }

  // ------------------------------------------------------------ back branches and mushrooms
  const backTips: any[] = [];
  for (const s of [1, -1]) {
    branch(sp3, v3(s * 0.5, 3.55, -0.5), v3(s * 0.7, 1, -0.5), 1.1, 0.12, 2, backTips);
    branch(sp3, v3(s * 0.2, 3.75, -0.6), v3(s * 0.3, 1, -0.3), 1.0, 0.1, 2, backTips);
  }
  leaves(backTips, LEAF_G, [0.3, 0.22], sp3);
  shroomPatch(hump, 6, 31, 0.2);
  for (let i = 0; i < 4; i++) {
    const h = b.surface(hump).nearest([(i - 1.5) * 0.35, 3.2 - (i % 2) * 0.3, -1.2]);
    b.stick(ico(0.12, 0.05, 0.12, 1), i % 2 ? PURP : TEAL, h, { embed: 0.2, flat: true });
    glow(b.stick(ico(0.09, 0.05, 0.09, 1), TEAL, h, { embed: 0.15, flat: true }), 1.5);
  }
  mossPatch(hump, 4, 33, 1.2);

  return b.root;
}
```