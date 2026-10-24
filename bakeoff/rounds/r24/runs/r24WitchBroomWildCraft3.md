```ts
// STYLE: "Art Deco steamer-trunk travel-poster". A 1920s luggage-label gouache look:
// flat saturated plum / teal / mustard / vermilion / cream, ink outlines, gilt inlay,
// stepped ziggurat caps, sunburst fans and chevrons repeated on every piece of luggage,
// plus glowing lantern, potion and sparkle magic. Nothing is photoreal; it is all poster.

import * as THREE from "three";
import { createBuilder, rng, countershade, grain, mottle, paint, mix, noise, svg } from "agentic-3js-builder";
import type { Joint, Paint, V3 } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Art Deco Witch's Broom, Fully Loaded",
  description:
    "A flying witch's broom slung with a steamer trunk, hatbox, tapestry carpet bag, cauldron, bedroll, " +
    "pointed hat and a long-chained lantern, styled as a 1920s Art Deco travel-label poster with gilt inlay and glowing magic.",
};

type Fill = string | Paint;
type OP = [number, number] | [number, number, "sharp"];

const C = {
  INK: "#1a1024",
  PLUM: "#35194a",
  PLUM2: "#2a1440",
  VIOLET: "#6b3f93",
  TEAL: "#1f8c8d",
  TEAL_D: "#0e4a56",
  TEAL_L: "#37b5b0",
  MUST: "#eab23c",
  GOLD: "#f5cd62",
  CREAM: "#f7ebcb",
  VERM: "#d8472b",
  ROSE: "#5b2236",
  LEATH: "#8a4a27",
  LEATH_D: "#5e301a",
  ROPE: "#cfa66a",
  IRON: "#2b2a36",
  BRONZE: "#a87a34",
  AMBER: "#ffb347",
  MINT: "#58f5c0",
};

// ---------------------------------------------------------------- SVG helpers (Deco motifs)
const FONT = `font-family="Georgia, 'Times New Roman', serif" font-weight="bold"`;

function sunburst(cx: number, cy: number, r: number, n: number, c1: string, c2: string, from = 0, span = Math.PI * 2) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const a0 = from + (i / n) * span;
    const a1 = from + ((i + 1) / n) * span;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    out += `<path d="M${cx} ${cy}L${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}Z" fill="${i % 2 ? c1 : c2}"/>`;
  }
  return out;
}

function star4(cx: number, cy: number, R: number, r: number, fill: string, stroke = "none") {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? R : r;
    d += `${i ? "L" : "M"}${(cx + rad * Math.sin(a)).toFixed(2)} ${(cy - rad * Math.cos(a)).toFixed(2)}`;
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
}

function spiralPath(cx: number, cy: number, r0: number, r1: number, turns: number) {
  const N = Math.round(turns * 28);
  let d = "";
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * turns * Math.PI * 2;
    const r = r0 + ((r1 - r0) * i) / N;
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(th)).toFixed(2)} ${(cy + r * Math.sin(th)).toFixed(2)}`;
  }
  return d;
}

function starOutline(R: number, r: number): OP[] {
  const pts: OP[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? R : r;
    const x = rad * Math.sin(a);
    const y = rad * Math.cos(a);
    if (i % 2 === 0) pts.push([x, y, "sharp"]);
    else pts.push([x, y]);
  }
  return pts;
}

// Cross-section of a hung box: straight walls and a faceted dome lid (x across, y up).
function profile(W: number, h: number, rise: number, pad: number, n = 6): OP[] {
  const hw = W / 2 + pad;
  const pts: OP[] = [
    [-hw, -pad, "sharp"],
    [hw, -pad, "sharp"],
    [hw, h, "sharp"],
  ];
  for (let i = 1; i < n; i++) {
    const a = (Math.PI * i) / n;
    pts.push([hw * Math.cos(a), h + (rise + pad) * Math.sin(a)]);
  }
  pts.push([-hw, h, "sharp"]);
  return pts;
}

const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "deco_witch_broom" });
  const R = rng(13);

  // ------------------------------------------------------------ geometry constants
  const HA: V3 = [0, 0.8, -0.42];
  const HB: V3 = [0, 0.88, 1.02];
  const HD = new THREE.Vector3(0, 0.08, 1.44).normalize();
  const hy = (z: number) => 0.8 + (z + 0.42) * (0.08 / 1.44);
  const hr = (z: number) => 0.027 - ((z + 0.42) / 1.44) * 0.007;

  // ------------------------------------------------------------ paints
  const GOLDP = countershade("#f9d56e", "#b57d26", { level: -0.1, soft: 0.45 });
  const ASH = countershade(
    grain("#dcab68", "#b9803f", { size: 0.012, axis: "z" }),
    grain("#a8703a", "#7d4f27", { size: 0.012, axis: "z" }),
    { level: -0.1 },
  );
  const LEATHER = countershade(
    mottle("#94502a", "#7d4120", { size: 0.04 }),
    mottle("#5e301a", "#4a2414", { size: 0.04 }),
  );
  const IRONP = countershade(
    mottle("#3a3a4c", "#23232e", { size: 0.035 }),
    mottle("#1c1c26", "#14141c", { size: 0.035 }),
    { level: 0, soft: 0.5 },
  );
  const HATP = countershade(mottle("#43246a", "#34195a", { size: 0.06 }), "#22103a");
  const LIDP = countershade("#8450ab", "#4a2a68");

  const P0 = new THREE.Vector3(...(HA as [number, number, number]));
  const Q = new THREE.Vector3(0, -0.17, -1).normalize();
  const QR = new THREE.Vector3(1, 0, 0);
  const QU = new THREE.Vector3(0, 1, -0.17).normalize();

  const STOPS: [number, string][] = [
    [0, "#6d3f1a"],
    [0.14, "#a1632a"],
    [0.32, "#d99c36"],
    [0.52, "#f1c85a"],
    [0.72, "#fff0b8"],
  ];
  const strawAt = (z: number) => {
    if (z <= STOPS[0][0]) return mix(STOPS[0][1], STOPS[0][1], 0);
    for (let i = 1; i < STOPS.length; i++) {
      if (z <= STOPS[i][0]) {
        const t = (z - STOPS[i - 1][0]) / (STOPS[i][0] - STOPS[i - 1][0]);
        return mix(STOPS[i - 1][1], STOPS[i][1], t);
      }
    }
    return mix(STOPS[STOPS.length - 1][1], STOPS[STOPS.length - 1][1], 0);
  };
  const straw = paint((p) => {
    const z = p.clone().sub(P0).dot(Q);
    const w = noise(p, 0.05, 3);
    return mix(strawAt(z + (w - 0.5) * 0.12), "#5a3414", Math.max(0, 0.45 - w) * 0.4);
  });

  const TR = { cx: 0.31, yb: 0.36, cz: 0.145, W: 0.3, L: 0.58, h: 0.2, rise: 0.08 };
  const trunkPaint = paint((p, n) => {
    const endFace = Math.abs(n.z) > 0.7;
    const u = endFace ? p.x : p.z;
    const f = (((u / 0.07) % 1) + 1) % 1;
    const yy = p.y - TR.yb;
    if (Math.abs(yy - TR.h) < 0.0045) return C.INK;
    if (f < 0.045) return C.TEAL_D;
    if (f > 0.955) return "#2fa3a1";
    const lit = Math.max(0, n.y);
    const dark = Math.max(0, -n.y);
    return mix(mix(C.TEAL, C.TEAL_L, lit * 0.8), C.TEAL_D, dark * 0.6);
  });

  const hatboxPaint = paint((_p, _n, s) => {
    const y = s[0];
    if (y < 0.014 || y > 0.14) return C.MUST;
    const zig = tri(s[1] / 22);
    const c1 = 0.1 + (zig - 0.5) * 0.035;
    if (Math.abs(y - c1) < 0.008) return C.GOLD;
    if (Math.abs(y - (c1 - 0.03)) < 0.005) return C.VERM;
    return C.PLUM;
  });

  const blanket = paint((p) => {
    const q = (p.x + 0.3) / 0.045;
    const f = q - Math.floor(q);
    if (f < 0.08) return C.INK;
    const cols = [C.CREAM, C.VERM, C.CREAM, C.TEAL, C.MUST, C.TEAL];
    return cols[((Math.floor(q) % 6) + 6) % 6];
  });

  // ------------------------------------------------------------ textures
  const TEX = {
    label: svg(
      `<svg viewBox="0 0 158 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="154" height="96" rx="6" fill="${C.CREAM}" stroke="${C.INK}" stroke-width="3"/>
      <rect x="8" y="8" width="142" height="84" rx="3" fill="none" stroke="#d99a2b" stroke-width="1.6"/>
      <rect x="12" y="12" width="134" height="76" fill="none" stroke="${C.INK}" stroke-width="0.8"/>
      ${sunburst(79, 54, 34, 16, C.VERM, C.MUST, 0.1)}
      <circle cx="79" cy="54" r="34" fill="none" stroke="${C.INK}" stroke-width="2.4"/>
      <circle cx="79" cy="54" r="19" fill="${C.PLUM}" stroke="${C.INK}" stroke-width="2"/>
      <circle cx="75" cy="54" r="12" fill="${C.GOLD}"/><circle cx="81" cy="51" r="10.5" fill="${C.PLUM}"/>
      ${star4(88, 60, 4, 1.4, C.GOLD)}
      <path d="M18 13 H140 L133 25 H25Z" fill="${C.INK}"/>
      <text x="79" y="22.5" text-anchor="middle" font-size="9.5" letter-spacing="1" fill="${C.GOLD}" ${FONT}>MIDNIGHT EXPRESS</text>
      <path d="M22 78 H136 L130 90 H28Z" fill="${C.INK}"/>
      <text x="79" y="87.5" text-anchor="middle" font-size="9" letter-spacing="1" fill="${C.CREAM}" ${FONT}>BROOMSTON · HEX</text>
      ${star4(24, 54, 8, 2.6, C.VERM, C.INK)}${star4(134, 54, 8, 2.6, C.VERM, C.INK)}
      </svg>`,
      { size: 512 },
    ),
    hotel: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="${C.CREAM}" stroke="${C.INK}" stroke-width="4"/>
      <circle cx="50" cy="50" r="39" fill="${C.TEAL}"/>
      ${sunburst(50, 50, 39, 12, C.TEAL_D, C.TEAL)}
      <circle cx="50" cy="50" r="39" fill="none" stroke="${C.INK}" stroke-width="2"/>
      <rect x="6" y="40" width="88" height="22" fill="${C.VERM}" stroke="${C.INK}" stroke-width="3"/>
      <text x="50" y="56" text-anchor="middle" font-size="13" fill="${C.CREAM}" ${FONT}>HEXELSIOR</text>
      ${star4(50, 24, 9, 3, C.GOLD, C.INK)}
      <text x="50" y="82" text-anchor="middle" font-size="11" fill="${C.CREAM}" ${FONT}>HOTEL</text>
      </svg>`,
      { size: 256 },
    ),
    pennant: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20 L96 50 L4 80Z" fill="${C.VERM}" stroke="${C.INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M12 70 L28 46 L38 58 L48 48 L62 70Z" fill="${C.CREAM}" stroke="${C.INK}" stroke-width="2"/>
      <path d="M28 46 L24 53 L30 51 L33 54Z" fill="${C.TEAL_L}"/>
      <text x="11" y="40" font-size="9" fill="${C.CREAM}" letter-spacing="0.5" ${FONT}>CRAGGY</text>
      ${star4(70, 50, 6, 2, C.GOLD, C.INK)}
      </svg>`,
      { size: 256 },
    ),
    fragile: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,3 70,3 97,30 97,70 70,97 30,97 3,70 3,30" fill="${C.MUST}" stroke="${C.INK}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="32,10 68,10 90,32 90,68 68,90 32,90 10,68 10,32" fill="none" stroke="${C.INK}" stroke-width="1.4"/>
      <path d="M38 18 H62 L54 34 V44 H61 V49 H39 V44 H46 V34Z" fill="${C.INK}"/>
      <text x="50" y="67" text-anchor="middle" font-size="15" fill="${C.INK}" ${FONT}>FRAGILE</text>
      <text x="50" y="82" text-anchor="middle" font-size="10" fill="${C.VERM}" ${FONT}>SPELLS</text>
      </svg>`,
      { size: 256 },
    ),
    sunTop: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="${C.GOLD}" stroke="${C.INK}" stroke-width="3"/>
      ${sunburst(50, 50, 44, 24, C.PLUM, C.VIOLET)}
      <circle cx="50" cy="50" r="44" fill="none" stroke="${C.INK}" stroke-width="2"/>
      <circle cx="50" cy="50" r="15" fill="${C.GOLD}" stroke="${C.INK}" stroke-width="2.5"/>
      ${star4(50, 50, 11, 3.5, C.VERM, C.INK)}
      </svg>`,
      { size: 256 },
    ),
    hbLabel: svg(
      `<svg viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="136" height="86" rx="5" fill="${C.CREAM}" stroke="${C.INK}" stroke-width="3"/>
      <rect x="7" y="7" width="126" height="76" rx="2" fill="none" stroke="#d99a2b" stroke-width="1.5"/>
      ${sunburst(70, 36, 26, 9, C.VERM, C.MUST, Math.PI, Math.PI)}
      <path d="M44 36 H96" stroke="${C.INK}" stroke-width="2"/>
      <text x="70" y="52" text-anchor="middle" font-size="11" letter-spacing="2" fill="${C.INK}" ${FONT}>MADAME</text>
      <text x="70" y="68" text-anchor="middle" font-size="16" fill="${C.VERM}" ${FONT}>MORGANA</text>
      <text x="70" y="80" text-anchor="middle" font-size="6.5" letter-spacing="1" fill="${C.PLUM}" ${FONT}>MILLINER · HEXHAM</text>
      </svg>`,
      { size: 384 },
    ),
    tapestry: svg(
      `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="100" fill="${C.ROSE}"/>
      <rect x="4" y="4" width="192" height="92" fill="none" stroke="${C.MUST}" stroke-width="3"/>
      <path d="${Array.from({ length: 17 }, (_, i) => `${i ? "L" : "M"}${8 + i * 12} ${i % 2 ? 16 : 10}`).join("")}" fill="none" stroke="${C.GOLD}" stroke-width="2.4"/>
      <path d="${Array.from({ length: 17 }, (_, i) => `${i ? "L" : "M"}${8 + i * 12} ${i % 2 ? 90 : 84}`).join("")}" fill="none" stroke="${C.GOLD}" stroke-width="2.4"/>
      ${Array.from(
        { length: 6 },
        (_, i) => `
        <polygon points="${20 + i * 32},22 ${35 + i * 32},50 ${20 + i * 32},78 ${5 + i * 32},50" fill="${i % 2 ? C.VERM : C.TEAL}" stroke="${C.CREAM}" stroke-width="2"/>
        <polygon points="${20 + i * 32},36 ${27 + i * 32},50 ${20 + i * 32},64 ${13 + i * 32},50" fill="${C.MUST}" stroke="${C.INK}" stroke-width="1.2"/>`,
      ).join("")}
      </svg>`,
      { size: 512 },
    ),
    hatEmblem: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><mask id="m"><rect width="100" height="100" fill="white"/><circle cx="60" cy="42" r="30" fill="black"/></mask></defs>
      <circle cx="44" cy="50" r="36" fill="${C.GOLD}" mask="url(#m)"/>
      ${star4(74, 66, 9, 3, C.GOLD)}${star4(82, 30, 6, 2, C.CREAM)}${star4(60, 82, 5, 1.8, C.CREAM)}
      </svg>`,
      { size: 256 },
    ),
    spiral: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="${C.CREAM}" stroke="${C.INK}" stroke-width="3"/>
      <path d="${spiralPath(50, 50, 3, 40, 3.2)}" fill="none" stroke="${C.VERM}" stroke-width="7" stroke-linecap="round"/>
      <path d="${spiralPath(50, 50, 7, 44, 3.2)}" fill="none" stroke="${C.TEAL}" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
      { size: 256 },
    ),
    tag: svg(
      `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 3 H42 L57 22 V97 H3 V22Z" fill="${C.CREAM}" stroke="${C.INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="30" cy="15" r="5" fill="${C.GOLD}" stroke="${C.INK}" stroke-width="1.8"/>
      <text x="30" y="40" text-anchor="middle" font-size="9" fill="${C.INK}" ${FONT}>TO:</text>
      <text x="30" y="55" text-anchor="middle" font-size="11" fill="${C.PLUM}" ${FONT}>AUNT</text>
      <text x="30" y="68" text-anchor="middle" font-size="11" fill="${C.PLUM}" ${FONT}>HAZEL</text>
      <path d="M10 74 H50" stroke="${C.INK}" stroke-width="1.2"/>
      <text x="30" y="88" text-anchor="middle" font-size="7" fill="${C.VERM}" ${FONT}>VIA BROOM</text>
      </svg>`,
      { size: 256 },
    ),
    keyhole: svg(
      `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="22" r="12" fill="${C.INK}"/>
      <polygon points="14,28 26,28 31,54 9,54" fill="${C.INK}"/>
      </svg>`,
      { size: 128 },
    ),
    emblem: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,3 97,50 50,97 3,50" fill="${C.GOLD}" stroke="${C.INK}" stroke-width="4" stroke-linejoin="round"/>
      ${sunburst(50, 50, 31, 12, C.MUST, C.VERM)}
      <circle cx="50" cy="50" r="31" fill="none" stroke="${C.INK}" stroke-width="2"/>
      <circle cx="50" cy="50" r="12" fill="${C.PLUM}" stroke="${C.INK}" stroke-width="2"/>
      ${star4(50, 50, 8, 2.6, C.GOLD)}
      </svg>`,
      { size: 256 },
    ),
    flame: svg(
      `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 4 C34 24 52 34 50 58 C49 76 38 86 30 86 C20 86 10 76 10 58 C10 44 20 38 22 24 C26 30 28 20 30 4Z" fill="#fff0a8" stroke="#ff8a1c" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M30 36 C34 48 42 54 40 66 C39 76 34 80 30 80 C25 80 20 76 20 66 C20 56 28 50 30 36Z" fill="#ffd24a"/>
      </svg>`,
      { size: 192 },
    ),
  };

  // ------------------------------------------------------------ skeleton (static luggage rides the root; pendants swing)
  const broom = b.joint("broom", { at: [0, 0.83, 0.1] });
  const bristleJ = b.joint("bristles", { parent: broom, at: HA, dir: Q });
  const cauldronJ = b.joint("cauldron", { parent: broom, at: [0, hy(-0.27) - 0.005, -0.27], dir: [0, -1, 0] });
  const lanternJ = b.joint("lantern", { parent: broom, at: [0, hy(0.95) - 0.005, 0.95], dir: [0, -1, 0] });
  const tagJ = b.joint("tag", {
    parent: broom,
    at: [TR.cx + 0.055, TR.yb + 0.115, TR.cz + TR.L / 2 + 0.003],
    dir: [0, -1, 0],
  });

  // ------------------------------------------------------------ small placement helpers
  const box = (w: number, h: number, d: number, color: Fill, at: V3, bone: Joint = broom, rot?: V3) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });

  const plane = (
    w: number,
    h: number,
    tex: THREE.Texture,
    at: V3,
    dir: V3,
    o: { up?: V3; bone?: Joint } = {},
  ) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: o.bone ?? broom,
      at,
      dir,
      axis: "z",
      up: o.up,
      texture: tex,
    });

  const cyl = (rt: number, rb: number, len: number, sides: number, color: Fill, at: V3, dir: V3, bone: Joint = broom) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, sides), color, { bone, at, dir, flat: true });

  function chainLinks(a: THREE.Vector3, c: THREE.Vector3, n: number, color: Fill, bone: Joint, r = 0.01) {
    const d = c.clone().sub(a);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      b.part(new THREE.TorusGeometry(r, r * 0.3, 4, 6), color, {
        bone,
        at: a.clone().addScaledVector(d, t),
        dir: d,
        up: i % 2 ? [1, 0, 0] : [0, 0, 1],
        scale: [0.7, 1.35, 1],
        flat: true,
      });
    }
  }

  function band(cx: number, yb: number, z: number, W: number, h: number, rise: number, pad: number, thick: number, color: Fill) {
    return b.extrude(profile(W, h, rise, pad), {
      at: [cx, yb, z],
      x: [1, 0, 0],
      thickness: thick,
      color,
      bone: broom,
    });
  }

  function strap(from: V3, z: number) {
    b.frustumBox(from, [0, hy(z) - 0.004, z], [0.012, 0.03], [0.012, 0.03], { color: LEATHER, bone: broom });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLDP, { bone: broom, at: from, flat: true });
  }

  // ------------------------------------------------------------ the broom handle
  b.rod(HA, HB, [0.027, 0.02], ASH, { bone: broom, sides: 8 });
  for (const z of [-0.27, -0.07, 0.07, 0.36, 0.45, 0.61, 0.8, 0.95]) {
    const y = hy(z);
    const r = hr(z);
    cyl(r + 0.007, r + 0.007, 0.022, 10, GOLDP, [0, y, z], HD);
    for (const s of [-1, 1])
      cyl(r + 0.011, r + 0.011, 0.007, 10, GOLDP, [0, y + HD.y * s * 0.015, z + HD.z * s * 0.015], HD);
  }
  // stepped Deco knob on the nose of the handle
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.03, 0.012],
      [0.023, 0.012],
      [0.023, 0.026],
      [0.017, 0.026],
      [0.017, 0.04],
      [0.01, 0.04],
      [0.01, 0.05],
      [0, 0.058],
    ],
    { at: HB, axis: HD, color: GOLDP, bone: broom, segments: 10 },
  );
  // gilt ring band near the nose and a leather grip wrap
  cyl(0.0235, 0.0235, 0.1, 8, LEATHER, [0, hy(0.88) - 0.0005, 0.88], HD);
  cyl(0.026, 0.026, 0.012, 10, GOLDP, [0, hy(0.84), 0.84], HD);

  // ------------------------------------------------------------ the bristle head
  const radial = (a: number) => QR.clone().multiplyScalar(Math.cos(a)).addScaledVector(QU, Math.sin(a));
  const tang = (a: number) => QR.clone().multiplyScalar(-Math.sin(a)).addScaledVector(QU, Math.cos(a));
  const bp = (z: number, rho: number, a: number) => P0.clone().addScaledVector(Q, z).addScaledVector(radial(a), rho);
  const coreR = (z: number) =>
    z < 0.18 ? 0.03 + (z / 0.18) * 0.032 : z < 0.36 ? 0.062 + ((z - 0.18) / 0.18) * 0.038 : 0.1 + Math.min((z - 0.36) / 0.19, 1) * 0.02;

  b.sweep(polyline2(bp(0, 0, 0), bp(0.55, 0, 0)), (t: number) => coreR(t * 0.55), {
    color: straw,
    bone: bristleJ,
    caps: { start: "flat", end: "round" },
    sides: 8,
  });
  // gilt ferrule
  cyl(0.038, 0.042, 0.07, 10, GOLDP, bp(0.012, 0, 0).toArray() as V3, Q, bristleJ);
  cyl(0.047, 0.047, 0.012, 10, GOLDP, bp(0.056, 0, 0).toArray() as V3, Q, bristleJ);
  cyl(0.043, 0.043, 0.008, 10, C.VERM, bp(0.07, 0, 0).toArray() as V3, Q, bristleJ);
  // twine binding
  for (const z of [0.088, 0.112, 0.136])
    cyl(coreR(z) + 0.008, coreR(z) + 0.008, 0.018, 8, C.ROPE, bp(z, 0, 0).toArray() as V3, Q, bristleJ);

  function bladeLayer(z: number, n: number, len: number, spread: number, w: number, phase: number) {
    for (let i = 0; i < n; i++) {
      const a = phase + (i / n) * Math.PI * 2 + (R() - 0.5) * 0.12;
      const L = len * (0.9 + R() * 0.2);
      const dir = Q.clone().addScaledVector(radial(a), spread).normalize();
      b.extrude(
        [
          [0, -0.014],
          [L * 0.3, -w],
          [L * 0.72, -w * 0.78],
          [L, 0, "sharp"],
          [L * 0.72, w * 0.78],
          [L * 0.3, w],
          [0, 0.014],
        ],
        { at: bp(z, coreR(z) * 0.85, a), x: dir, y: tang(a), thickness: 0.007, color: straw, bone: bristleJ },
      );
    }
  }
  bladeLayer(0.12, 12, 0.46, 0.1, 0.034, 0);
  bladeLayer(0.24, 12, 0.4, 0.28, 0.042, Math.PI / 12);
  bladeLayer(0.36, 10, 0.33, 0.55, 0.046, 0.1);
  bladeLayer(0.46, 8, 0.24, 0.9, 0.05, Math.PI / 8);

  // ------------------------------------------------------------ steamer trunk (left)
  {
    const { cx, yb, cz, W, L, h, rise } = TR;
    const zf = cz + L / 2;
    const zr = cz - L / 2;
    const trunk = b.extrude(profile(W, h, rise, 0), {
      at: [cx, yb, cz],
      x: [1, 0, 0],
      thickness: L,
      bevel: 0.005,
      color: trunkPaint,
      bone: broom,
    });
    for (const s of [1, -1]) {
      band(cx, yb, cz + s * 0.27, W, h, rise, 0.007, 0.026, GOLDP);
      band(cx, yb, cz + s * 0.215, W, h, rise, 0.0045, 0.03, LEATHER);
      // strap up to the handle, gilt collar already on the handle
      strap([cx - 0.07, yb + h + rise * Math.sqrt(1 - (0.07 / (W / 2)) ** 2) + 0.004, cz + s * 0.215], cz + s * 0.215);
    }
    // stepped Deco corner guards
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        box(0.05, 0.05, 0.05, GOLDP, [cx + sx * (W / 2 - 0.013), yb + 0.012, cz + sz * (L / 2 - 0.013)]);
        box(0.032, 0.03, 0.032, GOLDP, [cx + sx * (W / 2 - 0.013), yb + 0.047, cz + sz * (L / 2 - 0.013)]);
      }
    // labels: outer wall, inner wall, ends, lid
    const ox = cx + W / 2;
    plane(0.3, 0.19, TEX.label, [ox + 0.0025, yb + 0.1, cz], [1, 0, 0]);
    plane(0.075, 0.075, TEX.hotel, [ox + 0.0055, yb + 0.05, cz - 0.15], [1, 0, 0], { up: [0, 1, 0.25] });
    plane(0.1, 0.1, TEX.pennant, [ox + 0.0065, yb + 0.15, cz + 0.14], [1, 0, 0], { up: [0, 1, -0.3] });
    plane(0.11, 0.11, TEX.fragile, [cx - W / 2 - 0.0025, yb + 0.1, cz + 0.02], [-1, 0, 0]);
    plane(0.08, 0.08, TEX.hotel, [cx - W / 2 - 0.0045, yb + 0.06, cz - 0.1], [-1, 0, 0], { up: [0, 1, -0.2] });
    b.decal(trunk, TEX.sunTop, { at: [cx, yb + h + rise, cz + 0.0], dir: [0, 1, 0], up: [0, 0, -1], size: [0.17, 0.17] });
    // front end: lock, sticker, carry handle
    box(0.052, 0.07, 0.012, GOLDP, [cx, yb + h - 0.012, zf + 0.004]);
    plane(0.026, 0.039, TEX.keyhole, [cx, yb + h - 0.018, zf + 0.0105], [0, 0, 1]);
    plane(0.09, 0.09, TEX.fragile, [cx - 0.085, yb + 0.07, zf + 0.0025], [0, 0, 1], { up: [0.15, 1, 0] });
    b.sweep(
      [
        [cx - 0.06, yb + 0.115, zf],
        [cx - 0.05, yb + 0.125, zf + 0.03],
        [cx, yb + 0.13, zf + 0.04],
        [cx + 0.05, yb + 0.125, zf + 0.03],
        [cx + 0.06, yb + 0.115, zf],
      ],
      0.007,
      { color: LEATHER, bone: broom, sides: 6 },
    );
    for (const s of [1, -1]) box(0.02, 0.022, 0.014, GOLDP, [cx + s * 0.06, yb + 0.115, zf + 0.003]);
    // rear end: pennant + hotel stickers
    plane(0.13, 0.13, TEX.pennant, [cx + 0.04, yb + 0.1, zr - 0.0025], [0, 0, -1], { up: [0, 1, 0.1] });
    plane(0.085, 0.085, TEX.hotel, [cx - 0.07, yb + 0.07, zr - 0.0045], [0, 0, -1]);
    // hanging luggage tag
    b.rod([cx + 0.055, yb + 0.113, zf + 0.004], [cx + 0.055, yb + 0.1, zf + 0.012], 0.0025, C.ROPE, { bone: tagJ });
    plane(0.06, 0.1, TEX.tag, [cx + 0.055, yb + 0.05, zf + 0.014], [0, 0, 1], { bone: tagJ });
    plane(0.06, 0.1, TEX.tag, [cx + 0.055, yb + 0.05, zf + 0.0135], [0, 0, -1], { bone: tagJ });
  }

  // ------------------------------------------------------------ hatbox (right)
  {
    const cx = -0.27;
    const yb = 0.4;
    const cz = 0.0;
    const body = b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.153, 0.012],
        [0.153, 0.15],
        [0, 0.15],
      ],
      { at: [cx, yb, cz], color: hatboxPaint, bone: broom, segments: 14 },
    );
    b.lathe(
      [
        [0, 0.15],
        [0.16, 0.15],
        [0.16, 0.205],
        [0.13, 0.215],
        [0.13, 0.222],
        [0, 0.222],
      ],
      { at: [cx, yb, cz], color: LIDP, bone: broom, segments: 14 },
    );
    plane(0.24, 0.24, TEX.sunTop, [cx, yb + 0.2235, cz], [0, 1, 0], { up: [0, 0, -1] });
    b.decal(body, TEX.hbLabel, { at: [cx, yb + 0.075, cz + 0.153], dir: [0, 0, 1], size: [0.125, 0.08] });
    b.decal(body, TEX.hotel, { at: [cx - 0.153, yb + 0.07, cz + 0.02], dir: [-1, 0, 0], size: [0.08, 0.08] });
    b.decal(body, TEX.pennant, { at: [cx + 0.153, yb + 0.075, cz - 0.02], dir: [1, 0, 0], size: [0.1, 0.1] });
    for (const z of [-0.07, 0.07]) {
      band(cx, yb, z, 0.288, 0.222, 0, 0.005, 0.03, LEATHER);
      strap([cx + 0.06, yb + 0.232, z], z);
    }
    // gilt foot ring
    b.lathe(
      [
        [0.148, 0],
        [0.158, 0],
        [0.158, 0.012],
        [0.148, 0.012],
      ],
      { at: [cx, yb, cz], color: GOLDP, bone: broom, segments: 14 },
    );
  }

  // ------------------------------------------------------------ tapestry carpet bag (right, front)
  {
    const cx = -0.27;
    const yb = 0.42;
    const cz = 0.53;
    const W = 0.26;
    const L = 0.34;
    const h = 0.15;
    const rise = 0.07;
    b.extrude(profile(W, h, rise, 0), { at: [cx, yb, cz], x: [1, 0, 0], thickness: L, bevel: 0.006, color: C.ROSE, bone: broom });
    for (const s of [1, -1]) {
      band(cx, yb, cz + s * 0.08, W, h, rise, 0.0045, 0.03, LEATHER);
      strap([cx + 0.06, yb + h + rise * Math.sqrt(1 - (0.06 / (W / 2)) ** 2) + 0.004, cz + s * 0.08], cz + s * 0.08);
    }
    plane(0.3, 0.14, TEX.tapestry, [cx - W / 2 - 0.0025, yb + 0.075, cz], [-1, 0, 0]);
    plane(0.3, 0.14, TEX.tapestry, [cx + W / 2 + 0.0025, yb + 0.075, cz], [1, 0, 0]);
    plane(0.22, 0.14, TEX.tapestry, [cx, yb + 0.075, cz + L / 2 + 0.0025], [0, 0, 1]);
    plane(0.22, 0.14, TEX.tapestry, [cx, yb + 0.075, cz - L / 2 - 0.0025], [0, 0, -1]);
    // brass frame bar, handles, clasp
    const top = yb + h + rise;
    box(0.022, 0.014, L * 0.9, GOLDP, [cx, top + 0.002, cz]);
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLDP, { bone: broom, at: [cx, top + 0.004, cz + s * L * 0.46], flat: true });
    b.sweep(
      [
        [cx, top, cz - 0.09],
        [cx, top + 0.05, cz - 0.07],
        [cx, top + 0.075, cz],
        [cx, top + 0.05, cz + 0.07],
        [cx, top, cz + 0.09],
      ],
      0.008,
      { color: LEATHER, bone: broom, sides: 6 },
    );
    // stepped gilt corner feet
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.03, 0.03, 0.03, GOLDP, [cx + sx * (W / 2 - 0.008), yb + 0.008, cz + sz * (L / 2 - 0.008)]);
  }

  // ------------------------------------------------------------ cauldron (hangs by chain at the rear)
  {
    const CX = 0;
    const CZ = -0.27;
    const CY = 0.43;
    const pot = b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.09, 0.02],
        [0.108, 0.07],
        [0.108, 0.125],
        [0.1, 0.15],
        [0.112, 0.158],
        [0.112, 0.172],
        [0.098, 0.172],
        [0.094, 0.15],
        [0.1, 0.125],
        [0.1, 0.075],
        [0.082, 0.04],
        [0, 0.03],
      ],
      { at: [CX, CY, CZ], color: IRONP, bone: cauldronJ, segments: 12 },
    );
    b.lathe(
      [
        [0.109, 0.152],
        [0.1175, 0.152],
        [0.1175, 0.176],
        [0.109, 0.176],
      ],
      { at: [CX, CY, CZ], color: GOLDP, bone: cauldronJ, segments: 12 },
    );
    b.decal(pot, TEX.emblem, { at: [CX, CY + 0.09, CZ + 0.108], dir: [0, 0, 1], size: [0.085, 0.085] });
    b.decal(pot, TEX.emblem, { at: [CX, CY + 0.09, CZ - 0.108], dir: [0, 0, -1], size: [0.085, 0.085] });
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3 + 0.5;
      cyl(0.008, 0.018, 0.034, 6, C.IRON, [CX + Math.cos(a) * 0.062, CY - 0.012, CZ + Math.sin(a) * 0.062], [0, 1, 0], cauldronJ);
    }
    glow(
      b.part(new THREE.CircleGeometry(0.097, 12), C.MINT, { bone: cauldronJ, at: [CX, CY + 0.125, CZ], dir: [0, 1, 0], axis: "z" }),
      1.3,
    );
    const bubbles: [number, number, number, number][] = [
      [0.03, 0.14, 0.02, 0.024],
      [-0.04, 0.138, -0.03, 0.018],
      [0.0, 0.18, -0.045, 0.014],
      [0.055, 0.17, -0.02, 0.011],
    ];
    for (const [x, y, z, r] of bubbles)
      glow(b.part(new THREE.IcosahedronGeometry(r, 0), "#9dffdc", { bone: cauldronJ, at: [CX + x, CY + y, CZ + z], flat: true }), 1.6);
    // three chains to a ring above, then one to the handle
    const apex = new THREE.Vector3(CX, CY + 0.33, CZ);
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3 + Math.PI / 2;
      const rim = new THREE.Vector3(CX + Math.cos(a) * 0.112, CY + 0.168, CZ + Math.sin(a) * 0.112);
      chainLinks(rim, apex, 5, C.BRONZE, cauldronJ, 0.01);
    }
    b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 8), GOLDP, { bone: cauldronJ, at: apex.toArray() as V3, dir: [0, 0, 1], flat: true });
    chainLinks(apex.clone().add(new THREE.Vector3(0, 0.015, 0)), new THREE.Vector3(0, hy(CZ) - 0.01, CZ), 3, C.BRONZE, cauldronJ, 0.009);
  }

  // ------------------------------------------------------------ lantern (long chain, glows)
  {
    const LZ = 0.95;
    const jb = lanternJ;
    b.lathe(
      [
        [0, 0],
        [0.06, 0],
        [0.06, 0.01],
        [0.075, 0.01],
        [0.075, 0.026],
        [0.065, 0.034],
        [0, 0.034],
      ],
      { at: [0, 0, LZ], color: GOLDP, bone: jb, segments: 12 },
    );
    const glass = b.lathe(
      [
        [0, 0.034],
        [0.062, 0.034],
        [0.074, 0.15],
        [0.062, 0.29],
        [0, 0.29],
      ],
      { at: [0, 0, LZ], color: C.AMBER, bone: jb, segments: 12 },
    );
    glow(glass, 1.25);
    glow(b.decal(glass, TEX.flame, { at: [0, 0.16, LZ + 0.075], dir: [0, 0, 1], size: [0.07, 0.105], bone: jb }), 1.5);
    glow(b.decal(glass, TEX.flame, { at: [0, 0.16, LZ - 0.075], dir: [0, 0, -1], size: [0.07, 0.105], mirror: true, bone: jb }), 1.5);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const P = (r: number, y: number): V3 => [c * r, y, LZ + s * r];
      b.rod(P(0.066, 0.034), P(0.078, 0.15), 0.0042, GOLDP, { bone: jb, sides: 5 });
      b.rod(P(0.078, 0.15), P(0.066, 0.29), 0.0042, GOLDP, { bone: jb, sides: 5 });
    }
    b.lathe(
      [
        [0.073, 0.14],
        [0.083, 0.14],
        [0.083, 0.158],
        [0.073, 0.158],
      ],
      { at: [0, 0, LZ], color: GOLDP, bone: jb, segments: 12 },
    );
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.07, 0.012],
        [0.056, 0.02],
        [0.05, 0.045],
        [0.03, 0.065],
        [0.016, 0.08],
        [0.016, 0.09],
        [0, 0.095],
      ],
      { at: [0, 0.29, LZ], color: GOLDP, bone: jb, segments: 12 },
    );
    b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 8), GOLDP, { bone: jb, at: [0, 0.4, LZ], dir: [0, 0, 1], flat: true });
    chainLinks(new THREE.Vector3(0, 0.41, LZ), new THREE.Vector3(0, hy(LZ) - 0.012, LZ), 13, C.BRONZE, jb, 0.0105);
  }

  // ------------------------------------------------------------ pointed witch hat, roped to the handle
  {
    const HZ = 0.215;
    const yBrim = hy(HZ) + hr(HZ) + 0.004;
    b.lathe(
      [
        [0, 0],
        [0.23, 0.006],
        [0.23, 0.02],
        [0.115, 0.038],
        [0, 0.038],
      ],
      { at: [0, yBrim, HZ], color: HATP, bone: broom, segments: 14 },
    );
    const y0 = yBrim + 0.03;
    const cone = b.sweep(
      [
        [0, y0, HZ],
        [0, y0 + 0.13, HZ - 0.005],
        [0, y0 + 0.25, HZ - 0.05],
        [0, y0 + 0.34, HZ - 0.14],
        [0, y0 + 0.33, HZ - 0.22],
      ],
      [0.12, 0.105, 0.075, 0.04, 0.0],
      { color: HATP, bone: broom, sides: 10 },
    );
    b.lathe(
      [
        [0.108, 0],
        [0.128, 0],
        [0.128, 0.04],
        [0.108, 0.04],
      ],
      { at: [0, yBrim + 0.04, HZ], color: C.MUST, bone: broom, segments: 14 },
    );
    b.lathe(
      [
        [0.1075, 0.015],
        [0.1295, 0.015],
        [0.1295, 0.025],
        [0.1075, 0.025],
      ],
      { at: [0, yBrim + 0.04, HZ], color: C.VERM, bone: broom, segments: 14 },
    );
    box(0.052, 0.052, 0.01, GOLDP, [0, yBrim + 0.06, HZ + 0.131]);
    box(0.03, 0.03, 0.012, C.PLUM2, [0, yBrim + 0.06, HZ + 0.1325]);
    b.decal(cone, TEX.hatEmblem, { at: [0, y0 + 0.17, HZ + 0.06], dir: [0, 0.2, 1], size: [0.1, 0.1] });
    // star charm dangling on the bent tip
    glow(
      b.extrude(starOutline(0.022, 0.007), { at: [0, y0 + 0.28, HZ - 0.225], x: [1, 0, 0], thickness: 0.005, color: C.GOLD, bone: broom }),
      1.2,
    );
    // tie-down ropes
    for (const z of [0.07, 0.36]) {
      const dz = z - HZ;
      const x = Math.sqrt(0.226 * 0.226 - dz * dz);
      for (const s of [1, -1]) b.rod([s * x, yBrim + 0.012, z], [0, hy(z), z], 0.0055, C.ROPE, { bone: broom, sides: 5 });
    }
  }

  // ------------------------------------------------------------ bedroll across the top front
  {
    const BZ = 0.8;
    const by = hy(BZ) + hr(BZ) + 0.07;
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.46, 12), blanket, { bone: broom, at: [0, by, BZ], dir: [1, 0, 0], flat: true });
    for (const s of [1, -1]) {
      plane(0.134, 0.134, TEX.spiral, [s * 0.2315, by, BZ], [s, 0, 0]);
      cyl(0.076, 0.076, 0.03, 12, LEATHER, [s * 0.13, by, BZ], [1, 0, 0]);
      box(0.032, 0.014, 0.032, GOLDP, [s * 0.13, by + 0.078, BZ]);
      // lashing from band to handle
      b.rod([s * 0.13, by - 0.07, BZ], [0, hy(BZ), BZ], 0.0055, C.ROPE, { bone: broom, sides: 5 });
    }
    // Deco chevron trim on the roll
    for (let i = 0; i < 7; i++)
      box(0.014, 0.004, 0.0145, C.GOLD, [-0.15 + i * 0.05, by + 0.0705, BZ], broom, [0, 0, 0]);
  }

  // ------------------------------------------------------------ magic sparkles trailing the bristles
  {
    const sp: [number, number, number, number][] = [
      [0.12, 0.7, -1.22, 0.07],
      [-0.14, 0.58, -1.35, 0.05],
      [0.06, 0.48, -1.5, 0.04],
      [-0.08, 0.82, -1.18, 0.035],
      [0.17, 0.52, -1.28, 0.03],
      [-0.03, 0.66, -1.62, 0.028],
    ];
    for (const [x, y, z, r] of sp)
      glow(
        b.extrude(starOutline(r, r * 0.28), { at: [x, y, z], x: [0, 0, 1], thickness: 0.008, color: "#ffe27a", bone: bristleJ }),
        1.6,
      );
    const dots: [number, number, number][] = [
      [0.1, 0.6, -1.12],
      [-0.12, 0.74, -1.28],
      [0.02, 0.56, -1.4],
      [0.15, 0.78, -1.34],
      [-0.1, 0.5, -1.2],
    ];
    for (const [x, y, z] of dots)
      glow(b.part(new THREE.IcosahedronGeometry(0.011, 0), "#fff3b0", { bone: bristleJ, at: [x, y, z], flat: true }), 1.6);
  }

  return b.root;

  // polyline of two vectors (keeps the sweep call above readable)
  function polyline2(a: THREE.Vector3, c: THREE.Vector3): V3[] {
    return [a.toArray() as V3, c.toArray() as V3];
  }
}
```