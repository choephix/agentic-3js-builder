import * as THREE from "three";
import { catmull, createBuilder, DEG, mix, noise, paint, polyline, rgb, rng, smoothstep, svg } from "../../../../src/index";
import type { ColorInput, Rgb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ice Cream Truck",
  description:
    "A chubby pastel ice cream truck in a cozy Animal Crossing style: mint and cream body with strawberry icing drips, headlight eyes with lashes and blush, a striped awning over a lit serving window, a giant cone on the roof, bunting, speakers and heart tail lights.",
};

type V3 = [number, number, number];
type P2 = [number, number];
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const INK = "#4b3a57";
const CREAM = "#fff2d8";
const CREAM_D = "#ecd7b0";
const MINT = "#94dcc9";
const MINT_D = "#5fbfa9";
const MINT_L = "#b9ecdd";
const PINK = "#ffb3c8";
const PINK_D = "#f283a4";
const RED = "#ff6a6a";
const YEL = "#ffd868";
const CHROME = "#eaf0f4";
const CHROME_D = "#b9c6d0";
const TIRE = "#51485f";
const DARK = "#4d4259";
const BROWN = "#e9b46c";
const BROWN_D = "#c98e4d";
const GOLD = "#f2c14e";
const LAV = "#c9b6e8";

// ---------------------------------------------------------------------------------------------------------------
// Pure geometry helpers

/** Rounded rectangle outline, counter-clockwise. */
function rr(w: number, h: number, r: number, n = 2): P2[] {
  const rad = Math.max(0.002, Math.min(r, w / 2 - 0.002, h / 2 - 0.002));
  const pts: P2[] = [];
  const corners: [number, number, number][] = [
    [w / 2 - rad, h / 2 - rad, 0],
    [-w / 2 + rad, h / 2 - rad, 90],
    [-w / 2 + rad, -h / 2 + rad, 180],
    [w / 2 - rad, -h / 2 + rad, 270],
  ];
  for (const [cx, cy, a0] of corners)
    for (let i = 0; i <= n; i++) {
      const a = (a0 + (90 * i) / n) * DEG;
      pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
    }
  return pts;
}

/** Round the corners of a polygon with quadratic fillets. */
function fillet(pts: P2[], radius: number | number[], steps = 3): P2[] {
  const out: P2[] = [];
  const n = pts.length;
  pts.forEach((c, i) => {
    const p = pts[(i + n - 1) % n];
    const q = pts[(i + 1) % n];
    const r = Array.isArray(radius) ? radius[i] : radius;
    const l1 = Math.hypot(p[0] - c[0], p[1] - c[1]);
    const l2 = Math.hypot(q[0] - c[0], q[1] - c[1]);
    const u1: P2 = [(p[0] - c[0]) / l1, (p[1] - c[1]) / l1];
    const u2: P2 = [(q[0] - c[0]) / l2, (q[1] - c[1]) / l2];
    const cos = Math.min(1, Math.max(-1, u1[0] * u2[0] + u1[1] * u2[1]));
    const ang = Math.acos(cos);
    const t = Math.min(r / Math.tan(ang / 2), 0.45 * Math.min(l1, l2));
    const a: P2 = [c[0] + u1[0] * t, c[1] + u1[1] * t];
    const e: P2 = [c[0] + u2[0] * t, c[1] + u2[1] * t];
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      out.push([
        (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * e[0],
        (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * e[1],
      ]);
    }
  });
  return out;
}

/** A heart outline (counter-clockwise), `size` tall, centred. */
function heart(size: number): P2[] {
  const raw: P2[] = [];
  for (let i = 0; i < 20; i++) {
    const t = (i / 20) * TAU;
    raw.push([
      16 * Math.sin(t) ** 3,
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
    ]);
  }
  const ys = raw.map((p) => p[1]);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const k = size / (hi - lo);
  return raw.map(([x, y]): P2 => [x * k, (y - (lo + hi) / 2) * k]).reverse();
}

/** Lower half disc hanging from y = 0 (awning and valance scallops). */
function scallop(r: number, n = 6): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (Math.PI * i) / n;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Warm light from above, cool shade underneath. */
function shade(c: string | Rgb, n: THREE.Vector3, k = 0.14): Rgb {
  const f = 1 - k + k * 1.15 * smoothstep(-0.6, 0.9, n.y);
  const [r, g, bl] = rgb(c);
  return [Math.min(r * f * 1.02, 1), Math.min(g * f, 1), Math.min(bl * f * 0.98 + (1 - f) * 0.06, 1)];
}

const bodyPaint = paint((p, n) => {
  const cab = p.z > 0.9;
  let c: string;
  if (n.y > 0.5 && p.z > 1.75) c = MINT_L;
  else {
    const bump = Math.pow(0.5 + 0.5 * Math.sin(p.z * 7.2), 2);
    const slow = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(p.z * 2.3 + 1.1));
    const edge = (cab ? 1.99 : 2.29) - 0.07 - 0.2 * bump * slow;
    const wave = 0.97 + 0.045 * Math.abs(Math.sin(p.z * 5.5));
    if (p.y > edge || (n.y > 0.7 && p.y > 2)) c = PINK;
    else if (p.y < wave) c = MINT;
    else c = CREAM;
  }
  const speck = 0.97 + 0.06 * noise(p, 0.35, 3);
  const [r, g, bl] = shade(c, n);
  return [r * speck, g * speck, bl * speck];
});

const glassPaint = paint((p) => {
  const d = p.z * 0.9 + p.y * 1.1;
  const f = ((d % 0.6) + 0.6) % 0.6;
  const base = mix("#8dd5e8", "#c6f1f6", smoothstep(1.5, 2.1, p.y));
  return f < 0.06 || (f > 0.12 && f < 0.16) ? mix(base, "#ffffff", 0.55) : base;
});

const waffle = paint((_p, n, s) => {
  const a = s[1] / 30;
  const h = s[0] / 0.1;
  const d1 = Math.abs((((a + h) % 1) + 1) % 1 - 0.5);
  const d2 = Math.abs((((a - h) % 1) + 1) % 1 - 0.5);
  return shade(d1 > 0.4 || d2 > 0.4 ? BROWN_D : BROWN, n, 0.18);
});

const tirePaint = paint((_p, n, s) => {
  const ang = ((s[1] % 360) + 360) % 360;
  const tread = Math.abs(s[0]) < 0.095 && Math.floor(ang / 22.5) % 2 === 0;
  return shade(tread ? "#41394e" : TIRE, n, 0.1);
});

const scoopPink = paint((p, n) => shade(mix(PINK, "#ffd0de", smoothstep(0.1, 0.6, noise(p, 0.15, 5)) * 0.6), n, 0.16));
const scoopMint = paint((p, n) => shade(mix(MINT, MINT_L, smoothstep(0.1, 0.6, noise(p, 0.15, 8)) * 0.6), n, 0.16));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const eyeSvg = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.6" stop-color="#ffe98a"/><stop offset="1" stop-color="#ffc94a"/></radialGradient></defs>
  <g ${flip ? 'transform="translate(100 0) scale(-1 1)"' : ""}>
    <path d="M18 30 L5 18 M26 22 L17 7 M36 18 L32 3" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <circle cx="50" cy="54" r="34" fill="url(#g)" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="38" cy="45" rx="9" ry="12" fill="#fff" transform="rotate(25 38 45)"/>
    <circle cx="62" cy="70" r="4.5" fill="#fff"/>
    <path d="M16 54 A34 34 0 0 1 84 54 Q50 40 16 54Z" fill="${PINK}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  </g></svg>`,
    { size: 160 },
  );

const windshieldSvg = (() => {
  let d = "M8 4 H162 V12";
  for (let i = 0; i < 11; i++) {
    const x = 162 - 14 * (i + 1);
    d += ` Q${x + 7} 24 ${x} 12`;
  }
  d += " Z";
  return svg(
    `<svg viewBox="0 0 170 62" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86cfe4"/><stop offset="1" stop-color="#c9f2f6"/></linearGradient></defs>
    <rect x="3" y="3" width="164" height="56" rx="14" fill="url(#gl)" stroke="${CREAM_D}" stroke-width="5"/>
    <path d="M34 59 L62 5 L80 5 L52 59Z" fill="#fff" opacity=".35"/>
    <path d="M90 59 L112 5 L120 5 L98 59Z" fill="#fff" opacity=".3"/>
    <path d="${d}" fill="${PINK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M140 52 c-3 -5 -9 -1 -4 4 l4 3 l4 -3 c5 -5 -1 -9 -4 -4Z" fill="${PINK_D}" stroke="${INK}" stroke-width="1.5"/>
  </svg>`,
    { size: 384 },
  );
})();

const interiorSvg = (() => {
  const bulbs = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 0.5) / 7;
    return `<circle cx="${(170 * t).toFixed(1)}" cy="${(16 + 32 * t * (1 - t)).toFixed(1)}" r="3.6" fill="#ffe58a" stroke="#f2b84a" stroke-width="1"/>`;
  }).join("");
  const tubs = ([[12, MINT], [28, PINK], [44, YEL], [60, LAV]] as [number, string][])
    .map(
      ([x, c]) =>
        `<rect x="${x}" y="25" width="14" height="13" rx="3" fill="${c}" stroke="${INK}" stroke-width="1.3"/><rect x="${x}" y="25" width="14" height="4" rx="2" fill="${CREAM}" stroke="${INK}" stroke-width="1"/>`,
    )
    .join("");
  return svg(
    `<svg viewBox="0 0 170 80" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe3fa"/><stop offset="1" stop-color="#cdb7ea"/></linearGradient></defs>
    <rect width="170" height="80" fill="url(#w)"/>
    <g stroke="#fff" stroke-opacity=".55" stroke-width="1">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 20} 0V56"/>`).join("")}</g>
    <path d="M0 12 Q85 28 170 12" fill="none" stroke="${INK}" stroke-width="1.3"/>
    ${bulbs}
    <rect x="8" y="38" width="72" height="4" rx="2" fill="${CREAM}" stroke="${INK}" stroke-width="1.2"/>
    ${tubs}
    <circle cx="94" cy="34" r="8" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
    <path d="M94 34 V28 M94 34 L98 36" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="112" y="34" width="44" height="40" rx="7" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
    <rect x="122" y="42" width="24" height="12" rx="4" fill="${MINT}" stroke="${INK}" stroke-width="1.3"/>
    <ellipse cx="134" cy="32" rx="12" ry="5" fill="${PINK}" stroke="${INK}" stroke-width="1.4"/>
    <ellipse cx="134" cy="25" rx="9" ry="4.5" fill="${PINK}" stroke="${INK}" stroke-width="1.4"/>
    <ellipse cx="134" cy="19" rx="6" ry="4" fill="${PINK}" stroke="${INK}" stroke-width="1.4"/>
    <rect x="0" y="58" width="102" height="22" fill="#fbfbfb" stroke="${INK}" stroke-width="2"/>
    <rect x="4" y="62" width="94" height="4" rx="2" fill="${CHROME_D}"/>
    <rect x="40" y="70" width="22" height="5" rx="2.5" fill="${CHROME}" stroke="${INK}" stroke-width="1.2"/>
  </svg>`,
    { size: 512 },
  );
})();

const menuSvg = (() => {
  const rows: [string, string, string][] = [
    ["Mint", MINT, "50"],
    ["Berry", PINK_D, "50"],
    ["Lemon", YEL, "40"],
    ["Choco", "#a6704a", "60"],
  ];
  const lines = rows
    .map(
      ([name, c, price], i) => `
    <circle cx="13" cy="${36 + i * 17}" r="6.5" fill="${c}" stroke="${INK}" stroke-width="1.8"/>
    <circle cx="11" cy="${34 + i * 17}" r="1.8" fill="#fff"/>
    <text x="24" y="${40 + i * 17}" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="9" fill="${INK}">${name}</text>
    <text x="53" y="${40 + i * 17}" text-anchor="end" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="9" fill="${PINK_D}">${price}</text>`,
    )
    .join("");
  return svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="56" height="96" rx="8" fill="#fff7e6" stroke="${PINK_D}" stroke-width="3"/>
    <rect x="7" y="7" width="46" height="16" rx="5" fill="${PINK_D}"/>
    <text x="30" y="19" text-anchor="middle" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="12" fill="#fff">MENU</text>
    ${lines}
  </svg>`,
    { size: 384 },
  );
})();

const muralSvg = svg(
  `<svg viewBox="0 0 260 113" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="cc"><path d="M34 76 L86 76 L60 112Z"/></clipPath></defs>
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
    <path d="M34 76 L86 76 L60 112Z" fill="${BROWN}"/>
    <g clip-path="url(#cc)" stroke="${BROWN_D}" stroke-width="1.8">
      <path d="M30 80 L90 110 M30 92 L70 112 M44 76 L90 100 M30 70 L90 100 M60 76 L90 90 M90 80 L30 110 M90 92 L50 112 M76 76 L30 100"/>
    </g>
    <circle cx="60" cy="60" r="26" fill="${PINK}"/>
    <circle cx="60" cy="38" r="20" fill="${MINT}"/>
    <circle cx="60" cy="17" r="6" fill="${RED}"/>
  </g>
  <path d="M44 56 Q40 46 48 42 M50 34 Q50 28 55 26" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M60 11 Q62 4 68 3" stroke="${MINT_D}" stroke-width="2" fill="none"/>
  <path d="M100 28 H248 L240 50 L248 72 H100 L108 50Z" fill="${PINK_D}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M106 34 H242" stroke="#fff" stroke-width="2" opacity=".5"/>
  <text x="174" y="58" text-anchor="middle" textLength="124" lengthAdjust="spacingAndGlyphs" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="21" fill="${CREAM}" stroke="${INK}" stroke-width="1">SWEET SCOOPS</text>
  <text x="174" y="94" text-anchor="middle" textLength="116" lengthAdjust="spacingAndGlyphs" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="12" fill="${INK}">Ice Cream &amp; Treats</text>
  <g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <path d="M232 12 l3 7 7 1 -5 5 2 8 -7 -4 -7 4 2 -8 -5 -5 7 -1Z" fill="${YEL}"/>
    <path d="M110 12 c-3 -6 -11 -2 -5 4 l5 4 l5 -4 c6 -6 -2 -10 -5 -4Z" fill="${PINK}"/>
    <path d="M200 100 c-3 -6 -11 -2 -5 4 l5 4 l5 -4 c6 -6 -2 -10 -5 -4Z" fill="${MINT}"/>
  </g>
  <g stroke-width="3" stroke-linecap="round">
    <path d="M150 14 l5 3" stroke="${MINT_D}"/><path d="M170 8 l4 5" stroke="${PINK_D}"/><path d="M190 16 l6 1" stroke="${YEL}"/>
    <path d="M252 84 l4 4" stroke="${PINK_D}"/><path d="M236 100 l6 -2" stroke="${MINT_D}"/><path d="M118 98 l5 3" stroke="${YEL}"/>
  </g>
</svg>`,
  { size: 1024 },
);

const stickerSvg = svg(
  `<svg viewBox="0 0 60 92" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="42" r="28" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
  <rect x="26" y="52" width="8" height="25" rx="3" fill="${BROWN}" stroke="${INK}" stroke-width="2"/>
  <path d="M16 56 V30 Q16 12 30 12 Q44 12 44 30 V56Z" fill="${PINK}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M16 30 Q16 12 30 12 Q44 12 44 30 Q38 37 34 30 Q30 39 26 30 Q22 37 16 30Z" fill="${MINT}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M21 50 V34" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
  <text x="30" y="89" text-anchor="middle" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="13" fill="${PINK_D}" stroke="${INK}" stroke-width=".6">POPS!</text>
</svg>`,
  { size: 256 },
);

const plateSvg = svg(
  `<svg viewBox="0 0 80 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="76" height="32" rx="8" fill="#fffaf0" stroke="${INK}" stroke-width="3"/>
  <rect x="6" y="6" width="68" height="4" rx="2" fill="${MINT}"/>
  <text x="40" y="28" text-anchor="middle" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="15" fill="${INK}">SCOOP-01</text>
</svg>`,
  { size: 256 },
);

const portholeSvg = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8dd5e8"/><stop offset="1" stop-color="#d2f5f8"/></linearGradient></defs>
  <circle cx="50" cy="50" r="48" fill="url(#p)"/>
  <path d="M20 70 L50 8 L64 14 L36 80Z" fill="#fff" opacity=".4"/>
  <path d="M60 86 L84 40 L90 48 L70 90Z" fill="#fff" opacity=".3"/>
</svg>`,
  { size: 128 },
);

const blushSvg = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="b"><stop offset="0" stop-color="#ff8fb0" stop-opacity=".95"/><stop offset=".65" stop-color="#ff9db9" stop-opacity=".85"/><stop offset="1" stop-color="#ffb3c8" stop-opacity="0"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="url(#b)"/>
  <path d="M30 56 l8 -14 M48 58 l8 -14 M66 56 l8 -14" stroke="#e8628d" stroke-width="5" stroke-linecap="round" opacity=".7"/>
</svg>`,
  { size: 128 },
);

const openSvg = svg(
  `<svg viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="60" height="26" rx="9" fill="${MINT_L}" stroke="${INK}" stroke-width="3"/>
  <text x="32" y="22" text-anchor="middle" font-family="Trebuchet MS, Arial, sans-serif" font-weight="bold" font-size="17" fill="${INK}">OPEN</text>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "ice-cream-truck" });
  const rand = rng(7);

  type PartOpts = { dir?: V3; axis?: "x" | "y" | "z"; up?: V3; rotation?: V3; texture?: THREE.Texture; scale?: V3 };
  const part = (geo: THREE.BufferGeometry, color: ColorInput, at: V3, o: PartOpts = {}) =>
    b.part(geo, color, { at, ...o });
  const ball = (r: number, color: ColorInput, at: V3, scale?: V3, seg: [number, number] = [10, 7]) =>
    part(new THREE.SphereGeometry(r, seg[0], seg[1]), color, at, scale ? { scale } : {});
  const cyl = (rt: number, rb: number, h: number, seg: number, color: ColorInput, at: V3, o: PartOpts = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const plane = (w: number, h: number, tex: THREE.Texture, at: V3, dir: V3, up: V3 = [0, 1, 0]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up, texture: tex });
  /** Rounded box: w along x, h along y, d along z unless x/y are given (thickness runs along x × y). */
  const rbox = (
    w: number,
    h: number,
    d: number,
    color: ColorInput,
    at: V3,
    o: { r?: number; x?: V3; y?: V3 } = {},
  ) => {
    const r = o.r ?? Math.min(w, h) * 0.25;
    return b.extrude(rr(w, h, r, r < 0.05 ? 1 : 2), {
      at,
      x: o.x ?? [1, 0, 0],
      y: o.y ?? [0, 1, 0],
      thickness: d,
      bevel: Math.min(d * 0.4, r * 0.7),
      color,
    });
  };
  /** Horizontal slab: w along x, l along z, t thick vertically. */
  const hslab = (w: number, l: number, t: number, color: ColorInput, at: V3, r?: number) =>
    rbox(w, l, t, color, at, { y: [0, 0, 1], r });

  // ---------------------------------------------------------------------------------------------------------
  // Body: one chunky side profile pushed across the width, soft rims all around
  const profile = fillet(
    [
      [2.44, 0.42],
      [2.44, 1.28],
      [1.8, 1.5],
      [1.2, 2.1],
      [0.88, 2.1],
      [0.88, 2.4],
      [-2.44, 2.4],
      [-2.44, 0.42],
    ],
    [0.2, 0.28, 0.3, 0.25, 0.12, 0.12, 0.3, 0.2],
    3,
  );
  const body = b.extrude(profile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.12, color: bodyPaint });

  hslab(1.5, 4.5, 0.24, DARK, [0, 0.31, 0], 0.08);

  // Bumpers
  rbox(1.96, 0.16, 0.2, CHROME, [0, 0.5, 2.46], { r: 0.07 });
  rbox(1.96, 0.16, 0.2, CHROME, [0, 0.5, -2.46], { r: 0.07 });
  for (const s of [1, -1]) {
    rbox(0.12, 0.1, 0.24, PINK_D, [s * 0.8, 0.5, 2.47], { r: 0.04 });
    rbox(0.12, 0.1, 0.24, PINK_D, [s * 0.8, 0.5, -2.47], { r: 0.04 });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Wheels
  const WR = 0.47;
  const WY = 0.455;
  for (const z of [1.6, -1.4])
    for (const s of [1, -1]) {
      const cx = s * 0.93;
      // wheel well + fender arch
      part(new THREE.CircleGeometry(0.6, 16, 0, Math.PI), "#44394f", [s * 1.006, WY, z], {
        dir: [s, 0, 0],
        axis: "z",
        up: [0, 1, 0],
      });
      part(new THREE.TorusGeometry(0.6, 0.035, 5, 14, Math.PI), MINT_D, [s * 1.02, WY, z], { rotation: [0, 90, 0] });
      // tyre, hub, cap, lugs
      b.lathe(
        [
          [0.27, -0.15],
          [0.4, -0.15],
          [WR, -0.09],
          [WR, 0.09],
          [0.4, 0.15],
          [0.27, 0.15],
        ],
        { at: [cx, WY, z], axis: [s, 0, 0], segments: 16, smoothing: 1, color: tirePaint },
      );
      b.lathe(
        [
          [0, 0.1],
          [0.3, 0.1],
          [0.3, 0.15],
          [0.24, 0.19],
          [0.1, 0.23],
          [0, 0.25],
        ],
        { at: [cx, WY, z], axis: [s, 0, 0], segments: 14, color: CREAM },
      );
      b.lathe(
        [
          [0, 0.23],
          [0.1, 0.23],
          [0.085, 0.27],
          [0, 0.3],
        ],
        { at: [cx, WY, z], axis: [s, 0, 0], segments: 10, color: PINK_D },
      );
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + 0.3;
        ball(0.02, CHROME_D, [cx + s * 0.213, WY + 0.17 * Math.cos(a), z + 0.17 * Math.sin(a)], undefined, [6, 4]);
      }
    }

  // ---------------------------------------------------------------------------------------------------------
  // Cab: windshield, visor, side windows, doors, mirrors
  plane(1.7, 0.62, windshieldSvg, [0, 1.8106, 1.5106], [0, 0.707, 0.707], [0, 0.707, -0.707]);
  rbox(1.9, 0.38, 0.045, PINK, [0, 2.1, 1.36], { y: [0, -0.2, 1], r: 0.08 });
  for (const s of [1, -1]) {
    b.extrude(
      fillet(
        [
          [0.93, 1.5],
          [1.72, 1.5],
          [1.2, 2.05],
          [0.93, 2.05],
        ],
        0.1,
        2,
      ),
      { at: [s * 1.0, 0, 0], x: [0, 0, 1], thickness: 0.04, bevel: 0.01, color: MINT_D },
    );
    b.extrude(
      fillet(
        [
          [0.98, 1.55],
          [1.65, 1.55],
          [1.2, 2.0],
          [0.98, 2.0],
        ],
        0.07,
        2,
      ),
      { at: [s * 1.0, 0, 0], x: [0, 0, 1], thickness: 0.06, bevel: 0.01, color: glassPaint },
    );
    // door seam
    const seam = fillet(
      [
        [0.94, 0.62],
        [0.94, 2.03],
        [1.22, 2.03],
        [1.72, 1.53],
        [1.72, 0.62],
      ],
      0.05,
      2,
    ).map(([z, y]): V3 => [s * 1.012, y, z]);
    b.sweep(polyline(seam, { closed: true }), 0.012, { color: CREAM_D, sides: 5 });
    rbox(0.04, 0.05, 0.14, CHROME, [s * 1.02, 1.25, 1.02], { r: 0.02 });
    // mirror
    b.rod([s * 1.0, 1.6, 1.62], [s * 1.2, 1.7, 1.7], 0.02, DARK);
    rbox(0.06, 0.2, 0.15, CHROME, [s * 1.24, 1.72, 1.72], { r: 0.03 });
    part(new THREE.PlaneGeometry(0.12, 0.17), "#86c4d6", [s * 1.274, 1.72, 1.72], { dir: [s, 0, 0], axis: "z" });
    // fuel cap on the right rear
  }
  cyl(0.1, 0.1, 0.03, 12, CHROME, [-1.01, 1.0, -2.0], { dir: [-1, 0, 0] });
  ball(0.03, PINK_D, [-1.03, 1.0, -2.0], undefined, [6, 4]);

  // ---------------------------------------------------------------------------------------------------------
  // Face: headlight eyes with lashes and lids, blush, smile, heart
  const EYE_R = eyeSvg(false);
  const EYE_L = eyeSvg(true);
  for (const s of [1, -1]) {
    const x = s * 0.5;
    b.lathe(
      [
        [0.145, 0],
        [0.2, 0],
        [0.2, 0.05],
        [0.18, 0.07],
        [0.145, 0.07],
      ],
      { at: [x, 0.98, 2.43], axis: [0, 0, 1], segments: 14, color: CHROME },
    );
    glow(plane(0.46, 0.46, s > 0 ? EYE_L : EYE_R, [x, 0.98, 2.505], [0, 0, 1]), 0.9);
    plane(0.2, 0.2, blushSvg, [s * 0.8, 0.8, 2.452], [0, 0, 1]);
  }
  b.sweep(
    catmull([
      [-0.26, 0.77, 2.456],
      [-0.14, 0.7, 2.456],
      [0, 0.67, 2.456],
      [0.14, 0.7, 2.456],
      [0.26, 0.77, 2.456],
    ]),
    0.017,
    { color: INK, sides: 6 },
  );
  b.extrude(heart(0.17), { at: [0, 1.49, 2.02], x: [1, 0, 0], thickness: 0.05, bevel: 0.015, color: PINK_D });

  // ---------------------------------------------------------------------------------------------------------
  // Serving window (model left, +X)
  plane(1.7, 0.8, interiorSvg, [1.012, 1.6, -0.7], [1, 0, 0]);
  glow(plane(1.7, 0.8, interiorSvg, [1.013, 1.6, -0.7], [1, 0, 0]), 0.55);
  rbox(0.1, 0.1, 1.9, MINT_D, [1.04, 2.04, -0.7], { r: 0.04 });
  rbox(0.1, 0.9, 0.1, MINT_D, [1.04, 1.6, -1.6], { r: 0.04 });
  rbox(0.1, 0.9, 0.1, MINT_D, [1.04, 1.6, 0.2], { r: 0.04 });
  // valance
  for (let i = 0; i < 7; i++) {
    const zc = -1.55 + 0.1215 * (2 * i + 1);
    b.extrude(scallop(0.1215), {
      at: [1.04, 2.0, zc],
      x: [0, 0, 1],
      thickness: 0.03,
      color: i % 2 ? PINK : CREAM,
    });
  }
  // counter + props
  hslab(0.36, 1.9, 0.07, PINK, [1.16, 1.13, -0.7], 0.06);
  hslab(0.04, 1.9, 0.12, PINK_D, [1.34, 1.1, -0.7], 0.015);
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.075, 0.02],
      [0.06, 0.06],
      [0.03, 0.09],
      [0, 0.095],
    ],
    { at: [1.2, 1.165, -1.45], segments: 10, smoothing: 1, color: GOLD },
  );
  ball(0.015, CHROME, [1.2, 1.265, -1.45], undefined, [6, 4]);
  // cone stand
  rbox(0.32, 0.12, 0.14, MINT_D, [1.2, 1.2, -0.95], { y: [0, 0, 1], r: 0.04 });
  for (const dz of [-0.07, 0.07]) {
    const cz = -0.95 + dz;
    b.lathe(
      [
        [0, 0],
        [0.07, 0.17],
        [0.08, 0.17],
        [0.08, 0.2],
        [0, 0.2],
      ],
      { at: [1.2, 1.22, cz], segments: 8, color: waffle },
    );
    ball(0.085, dz < 0 ? PINK : MINT, [1.2, 1.46, cz], [1, 0.9, 1], [8, 6]);
  }
  // tip jar
  cyl(0.07, 0.07, 0.15, 10, "#e4f6fa", [1.2, 1.275, -0.35]);
  cyl(0.075, 0.075, 0.03, 10, PINK_D, [1.2, 1.365, -0.35]);
  for (let i = 0; i < 4; i++)
    cyl(0.025, 0.025, 0.008, 8, GOLD, [1.2 + (i % 2) * 0.03 - 0.015, 1.215 + i * 0.012, -0.35 + (i % 3) * 0.02 - 0.02]);
  // hanging OPEN sign
  b.rod([1.07, 2.0, -0.05], [1.07, 1.9, -0.05], 0.006, DARK);
  b.rod([1.07, 2.0, 0.1], [1.07, 1.9, 0.1], 0.006, DARK);
  plane(0.36, 0.17, openSvg, [1.075, 1.82, 0.025], [1, 0, 0]);

  // awning
  const TILT = 14 * DEG;
  const u: V3 = [Math.cos(TILT), -Math.sin(TILT), 0];
  const aw0 = -1.7;
  const aw = 0.222;
  for (let i = 0; i < 9; i++) {
    const zc = aw0 + aw * (i + 0.5);
    const col = i % 2 ? CREAM : PINK;
    rbox(0.62, aw, 0.04, col, [1.0 + 0.31 * u[0], 2.22 + 0.31 * u[1], zc], { x: u, y: [0, 0, 1], r: 0.02 });
    b.extrude(scallop(aw / 2), { at: [1.6, 2.06, zc], x: [0, 0, 1], thickness: 0.04, bevel: 0.01, color: col });
    // little bulbs under the stripes
    b.rod([1.42, 2.095, zc], [1.42, 2.06, zc], 0.006, DARK);
    glow(ball(0.035, "#ffe58a", [1.42, 2.03, zc], undefined, [8, 6]), 1.4);
  }
  for (const zc of [-1.72, 0.32]) b.rod([1.03, 1.93, zc], [1.58, 2.03, zc], 0.02, CHROME);

  // menu board + sticker
  rbox(0.58, 1.0, 0.05, CREAM_D, [1.03, 1.58, 0.56], { y: [0, 1, 0], r: 0.08 });
  plane(0.48, 0.88, menuSvg, [1.058, 1.58, 0.56], [1, 0, 0]);
  plane(0.5, 0.77, stickerSvg, [1.012, 1.5, -2.0], [1, 0, 0]);

  // mural on the right side
  plane(2.6, 1.13, muralSvg, [-1.012, 1.58, -0.8], [-1, 0, 0]);

  // ---------------------------------------------------------------------------------------------------------
  // Rear
  const doors = fillet(
    [
      [-0.82, 0.9],
      [-0.82, 2.05],
      [0.82, 2.05],
      [0.82, 0.9],
    ],
    0.12,
    2,
  ).map(([x, y]): V3 => [x, y, -2.455]);
  b.sweep(polyline(doors, { closed: true }), 0.012, { color: CREAM_D, sides: 5 });
  b.rod([0, 0.9, -2.455], [0, 2.05, -2.455], 0.012, CREAM_D);
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0.17, 0],
        [0.23, 0],
        [0.23, 0.045],
        [0.2, 0.06],
        [0.17, 0.06],
      ],
      { at: [s * 0.4, 1.55, -2.44], axis: [0, 0, -1], segments: 14, color: CHROME },
    );
    part(new THREE.CircleGeometry(0.19, 14), "#ffffff", [s * 0.4, 1.55, -2.46], {
      dir: [0, 0, -1],
      axis: "z",
      texture: portholeSvg,
    });
    rbox(0.05, 0.22, 0.04, CHROME, [s * 0.09, 1.3, -2.47], { r: 0.02 });
    glow(
      b.extrude(heart(0.2), { at: [s * 0.66, 0.72, -2.46], x: [1, 0, 0], thickness: 0.04, bevel: 0.012, color: RED }),
      1,
    );
    cyl(0.04, 0.04, 0.2, 8, DARK, [s * 0.62, 0.3, -2.5], { dir: [0, 0.1, 1] });
  }
  plane(0.5, 0.225, plateSvg, [0, 0.72, -2.465], [0, 0, -1]);

  // ---------------------------------------------------------------------------------------------------------
  // Roof: sprinkles, speakers, giant cone sign, bunting
  const sprinkleColors = [PINK_D, MINT_D, YEL, "#ffffff", "#8fb8ff", RED];
  const roofHits = b
    .surface(body)
    .scatter(46, { rng: rng(11), minDist: 0.2, filter: (h) => h.n.y > 0.9 && h.at.y > 2.3 });
  roofHits.forEach((hit, i) => {
    b.stick(new THREE.CapsuleGeometry(0.014, 0.06, 2, 5).rotateZ(Math.PI / 2), sprinkleColors[i % 6], hit, {
      embed: 0.5,
      spin: rand() * 360,
    });
  });

  for (const s of [1, -1]) {
    rbox(0.1, 0.16, 0.1, CHROME, [s * 0.55, 2.46, 0.5], { r: 0.03 });
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.055, 0.06],
        [0.18, 0.3],
        [0.18, 0.32],
        [0, 0.27],
      ],
      { at: [s * 0.55, 2.6, 0.45], axis: [s * 0.2, 0.04, 1], segments: 12, color: YEL },
    );
    part(new THREE.CircleGeometry(0.12, 10), DARK, [s * 0.55 + s * 0.058, 2.604, 0.45 + 0.3], {
      dir: [s * 0.2, 0.04, 1],
      axis: "z",
    });
  }

  const SX = 0;
  const SZ = -0.75;
  const RY = 2.4;
  hslab(0.7, 0.7, 0.06, CREAM, [SX, RY + 0.02, SZ], 0.2);
  cyl(0.035, 0.07, 0.34, 8, MINT_D, [SX, RY + 0.17, SZ]);
  for (const [dx, dz] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as [number, number][])
    b.rod([SX + dx * 0.3, RY + 0.05, SZ + dz * 0.3], [SX + dx * 0.07, RY + 0.42, SZ + dz * 0.07], 0.018, CHROME);
  // cone (tip down) with waffle paint
  const tipY = RY + 0.2;
  const CH = 0.55;
  const CR = 0.25;
  b.lathe(
    [
      [0, 0],
      [CR, CH - 0.07],
      [CR + 0.035, CH - 0.07],
      [CR + 0.035, CH],
      [0, CH],
    ],
    { at: [SX, tipY, SZ], segments: 12, color: waffle },
  );
  const s1y = tipY + CH + 0.12;
  const scoop1 = ball(0.27, scoopPink, [SX, s1y, SZ], [1, 0.9, 1], [12, 8]);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * TAU;
    ball(0.075, PINK_D, [SX + 0.26 * Math.cos(a), tipY + CH + 0.04, SZ + 0.26 * Math.sin(a)], [1, 0.85, 1], [7, 5]);
  }
  const s2y = s1y + 0.34;
  const scoop2 = ball(0.22, scoopMint, [SX, s2y, SZ], [1, 0.9, 1], [12, 8]);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + 0.2;
    ball(0.06, MINT_D, [SX + 0.2 * Math.cos(a), s1y + 0.22, SZ + 0.2 * Math.sin(a)], [1, 0.85, 1], [7, 5]);
  }
  for (const sc of [scoop1, scoop2]) {
    const hits = b.surface(sc).scatter(12, { rng: rng(21), minDist: 0.09, filter: (h) => h.n.y > 0.15 });
    hits.forEach((hit, i) =>
      b.stick(new THREE.CapsuleGeometry(0.011, 0.045, 2, 4).rotateZ(Math.PI / 2), sprinkleColors[(i + 2) % 6], hit, {
        embed: 0.5,
        spin: rand() * 360,
      }),
    );
  }
  ball(0.07, RED, [SX, s2y + 0.24, SZ], undefined, [9, 6]);
  b.sweep(
    catmull([
      [SX, s2y + 0.29, SZ],
      [SX + 0.03, s2y + 0.38, SZ],
      [SX + 0.09, s2y + 0.4, SZ],
    ]),
    0.008,
    { color: MINT_D, sides: 5 },
  );

  // bunting strings from the cone top to the four roof corners
  const top: V3 = [SX, s2y + 0.2, SZ];
  const pennantColors = [PINK, MINT, YEL, LAV, PINK_D, MINT_D];
  for (const [ex, ez] of [
    [0.92, 0.74],
    [-0.92, 0.74],
    [0.92, -2.28],
    [-0.92, -2.28],
  ] as [number, number][]) {
    const end: V3 = [ex, 2.44, ez];
    const mid: V3 = [(top[0] + ex) / 2, (top[1] + 2.44) / 2 - 0.12, (top[2] + ez) / 2];
    const path = catmull([top, mid, end]);
    b.sweep(path, 0.01, { color: INK, sides: 4 });
    ball(0.045, PINK_D, end, undefined, [7, 5]);
    let k = 0;
    b.along(path, 6, (at) => {
      const t = at.axis.clone().normalize();
      const down = new THREE.Vector3(0, -1, 0);
      down.addScaledVector(t, -down.dot(t)).normalize();
      b.extrude(
        [
          [-0.07, 0],
          [0.07, 0],
          [0, 0.2],
        ],
        { at: at.at, x: t, y: down, thickness: 0.012, color: pennantColors[k++ % 6] },
      );
    });
  }

  return b.root;
}
