```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import type { Rgb, V3 } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aurora — Art Deco Passenger Zeppelin",
  description:
    "A 128 m streamline-moderne passenger airship: a faceted silver hull with navy cheatlines and a gold sunburst nose, " +
    "cruciform navy fins with oxblood rudders and winged emblems, four cream engine cars with chrome cowls and pusher " +
    "propellers, and an octagonal control gondola with a glowing promenade, a wraparound bridge and a spatted landing wheel.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const NAVY = "#1d2b52";
const NAVY_D = "#121a36";
const GOLD = "#d7a83e";
const CREAM = "#f0e4c6";
const ROOF = "#d8cba9";
const OXBLOOD = "#8a2630";
const SILVER = "#c3c7cd";
const SILVER_HI = "#e8e6de";
const SILVER_LO = "#8a92a2";
const TYRE = "#1d1c22";
const WOOD = "#2b211c";

const WARM: Rgb = [1, 0.95, 0.84];
const COOL: Rgb = [0.26, 0.31, 0.45];

/** Warm light on top, cool shade underneath. */
function lit(c: string | Rgb, n: THREE.Vector3, k = 0.22): Rgb {
  const up = Math.max(n.y, 0);
  const dn = Math.max(-n.y, 0);
  return mix(mix(c, WARM, k * up * up), COOL, 0.3 * dn);
}

const GILT = metal("gilt", { size: 2.2 });
const CHROME = metal("steel", { size: 2.2, polish: 0.75, tarnish: 0.05 });

type OP = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// Proportions

const L = 128; // hull length
const R = 17; // hull max radius
const HC = 25.5; // hull axis height
const ZT = -L / 2; // tail
const ZN = L / 2; // nose
const NOSE_M = 0.6; // where the hull is widest (t)
const ZG = 24; // gondola centre z

const hullR = (t: number) => {
  if (t >= NOSE_M) {
    const x = (t - NOSE_M) / (1 - NOSE_M);
    return Math.max(R * Math.sqrt(Math.max(0, 1 - 0.97 * x * x)), 1.2);
  }
  const x = (NOSE_M - t) / NOSE_M;
  return Math.max(R * Math.pow(Math.max(0, 1 - x * x), 0.72), 0.8);
};
const hullT = (z: number) => (z - ZT) / L;

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const INKD = "#121a36";
const GOLD_GRAD = `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset="0.5" stop-color="#e2b34c"/><stop offset="1" stop-color="#9c6a1c"/></linearGradient>`;
const DECO_FONT = `Futura, 'Century Gothic', 'Avenir Next', 'Josefin Sans', 'Trebuchet MS', sans-serif`;

function nameTexture(name: string) {
  let whiskers = "";
  [
    [40, 100],
    [57, 80],
    [74, 60],
  ].forEach(([y, len]) => {
    whiskers += `<rect x="${112 - len}" y="${y - 5}" width="${len}" height="10" rx="5" fill="url(#g)" stroke="${INKD}" stroke-width="4"/>`;
    whiskers += `<rect x="488" y="${y - 5}" width="${len}" height="10" rx="5" fill="url(#g)" stroke="${INKD}" stroke-width="4"/>`;
  });
  return svg(
    `<svg viewBox="0 0 600 110" xmlns="http://www.w3.org/2000/svg">
      <defs>${GOLD_GRAD}</defs>
      ${whiskers}
      <text x="303" y="80" text-anchor="middle" font-family="${DECO_FONT}" font-weight="700" font-size="62" letter-spacing="14"
        fill="url(#g)" stroke="${INKD}" stroke-width="8" stroke-linejoin="round" paint-order="stroke">${name}</text>
      <text x="303" y="80" text-anchor="middle" font-family="${DECO_FONT}" font-weight="700" font-size="62" letter-spacing="14"
        fill="none" stroke="#fff6d6" stroke-width="1.2" opacity="0.9">${name}</text>
    </svg>`,
    { size: 1024 },
  );
}

function emblemTexture() {
  const P = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(150 + r * Math.sin(a)).toFixed(1)} ${(80 - r * Math.cos(a)).toFixed(1)}`;
  };
  let rays = "";
  for (let i = 0; i < 16; i++) {
    const am = i * 22.5;
    rays += `<path d="M${P(19, am - 6)} L${P(i % 2 ? 45 : 56, am)} L${P(19, am + 6)} Z" fill="${i % 2 ? "#f0e4c6" : "url(#g)"}" stroke="${INKD}" stroke-width="1.2"/>`;
  }
  let wings = "";
  [78, 64, 50, 36].forEach((len, k) => {
    const y = 50 + k * 16;
    const h = 11;
    wings += `<path d="M96 ${y} L${96 - len} ${y} L${96 - len + 12} ${y + h} L96 ${y + h} Z" fill="url(#g)" stroke="${INKD}" stroke-width="3" stroke-linejoin="round"/>`;
    wings += `<path d="M204 ${y} L${204 + len} ${y} L${204 + len - 12} ${y + h} L204 ${y + h} Z" fill="url(#g)" stroke="${INKD}" stroke-width="3" stroke-linejoin="round"/>`;
  });
  return svg(
    `<svg viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg">
      <defs>${GOLD_GRAD}</defs>
      ${wings}
      <circle cx="150" cy="80" r="68" fill="${INKD}"/>
      <circle cx="150" cy="80" r="62" fill="#1d2b52" stroke="#e2b34c" stroke-width="4"/>
      <circle cx="150" cy="80" r="56" fill="none" stroke="#f0e4c6" stroke-width="1.6"/>
      ${rays}
      <circle cx="150" cy="80" r="19" fill="#f0e4c6" stroke="#e2b34c" stroke-width="3"/>
      <text x="150" y="89" text-anchor="middle" font-family="${DECO_FONT}" font-weight="700" font-size="26" fill="#1d2b52">A</text>
    </svg>`,
    { size: 512 },
  );
}

function windowRow(n: number, layer: "frame" | "glass") {
  const W = 400;
  const pitch = W / n;
  const ww = pitch * 0.64;
  const x0 = (pitch - ww) / 2;
  let body = "";
  for (let i = 0; i < n; i++) {
    const x = i * pitch + x0;
    const cx = x + ww / 2;
    const f = (v: number) => v.toFixed(1);
    if (layer === "frame") {
      body += `<rect x="${f(x)}" y="5" width="${f(ww)}" height="30" rx="8" fill="none" stroke="#2a1c08" stroke-width="7"/>`;
      body += `<rect x="${f(x)}" y="5" width="${f(ww)}" height="30" rx="8" fill="none" stroke="#e7c262" stroke-width="3.5"/>`;
      body += `<path d="M${f(x + 6)} 4.5 L${f(x + ww - 6)} 4.5" stroke="#fff3c4" stroke-width="1.6"/>`;
    } else {
      body += `<rect x="${f(x)}" y="5" width="${f(ww)}" height="30" rx="8" fill="url(#amb)"/>`;
      body += `<path d="M${f(x + 1)} 7 L${f(x + ww * 0.24)} 7 Q${f(x + ww * 0.1)} 21 ${f(x + ww * 0.22)} 34 L${f(x + 1)} 34 Z" fill="#c75a2c"/>`;
      body += `<path d="M${f(x + ww - 1)} 7 L${f(x + ww * 0.76)} 7 Q${f(x + ww * 0.9)} 21 ${f(x + ww * 0.78)} 34 L${f(x + ww - 1)} 34 Z" fill="#c75a2c"/>`;
      body += `<circle cx="${f(cx)}" cy="12" r="2.8" fill="#fffbe6"/>`;
      if (i % 3 === 1) {
        body += `<path d="M${f(cx - 6)} 35 Q${f(cx - 6)} 25 ${f(cx)} 25 Q${f(cx + 6)} 25 ${f(cx + 6)} 35 Z" fill="#6b3418"/>`;
        body += `<circle cx="${f(cx)}" cy="21" r="3.8" fill="#6b3418"/>`;
      }
    }
  }
  return svg(
    `<svg viewBox="0 0 400 40" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="amb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c0"/><stop offset="1" stop-color="#ffaa44"/></linearGradient></defs>
      ${body}
    </svg>`,
    { size: 1024 },
  );
}

function bridgeTexture() {
  let mullions = "";
  for (let i = 1; i < 7; i++) {
    const xt = 8 + (i * 284) / 7;
    const xb = 18 + (i * 264) / 7;
    mullions += `<path d="M${xt.toFixed(1)} 8 L${xb.toFixed(1)} 52" stroke="#20242c" stroke-width="8"/>`;
    mullions += `<path d="M${xt.toFixed(1)} 8 L${xb.toFixed(1)} 52" stroke="#d9dee6" stroke-width="4"/>`;
  }
  return svg(
    `<svg viewBox="0 0 300 60" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc2e0"/><stop offset="0.5" stop-color="#25466e"/><stop offset="1" stop-color="#0e1a30"/></linearGradient></defs>
      <path d="M6 6 L294 6 L284 54 L16 54 Z" fill="#20242c"/>
      <path d="M10 10 L290 10 L281 50 L19 50 Z" fill="url(#gl)"/>
      <path d="M40 10 L70 10 L52 50 L22 50 Z M150 10 L168 10 L150 50 L132 50 Z M236 10 L250 10 L236 50 L222 50 Z" fill="#ffffff" opacity="0.28"/>
      ${mullions}
      <path d="M8 8 L292 8 L282 52 L18 52 Z" fill="none" stroke="#d9dee6" stroke-width="4" stroke-linejoin="round"/>
    </svg>`,
    { size: 512 },
  );
}

function doorTexture() {
  let rays = "";
  for (const a of [-60, -30, 0, 30, 60]) {
    const r = (a * Math.PI) / 180;
    rays += `<path d="M30 40 L${(30 + 16 * Math.sin(r)).toFixed(1)} ${(40 - 16 * Math.cos(r)).toFixed(1)}" stroke="#e2b34c" stroke-width="2.2"/>`;
  }
  return svg(
    `<svg viewBox="0 0 60 110" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="56" height="106" rx="6" fill="#2a1c08"/>
      <rect x="5" y="5" width="50" height="100" rx="4" fill="#e2b34c"/>
      <rect x="9" y="9" width="42" height="92" rx="2" fill="#1d2b52"/>
      <path d="M13 40 A17 17 0 0 1 47 40 Z" fill="#ffd27a" stroke="#e2b34c" stroke-width="2.5"/>
      ${rays}
      <rect x="13" y="45" width="34" height="3" fill="#e2b34c"/>
      <rect x="13" y="58" width="34" height="2.6" fill="#e2b34c"/>
      <rect x="13" y="64" width="34" height="2.6" fill="#e2b34c"/>
      <rect x="13" y="70" width="34" height="2.6" fill="#e2b34c"/>
      <rect x="13" y="88" width="34" height="8" rx="2" fill="none" stroke="#e2b34c" stroke-width="2"/>
      <circle cx="44" cy="78" r="3.2" fill="#f3d27a" stroke="#2a1c08" stroke-width="1.2"/>
    </svg>`,
    { size: 256 },
  );
}

function grilleTexture() {
  let bars = "";
  for (let k = 0; k < 9; k++) {
    const y = 18 + k * 8;
    const w = 2 * Math.sqrt(Math.max(0, 36 * 36 - (y - 50) * (y - 50)));
    bars += `<rect x="${(50 - w / 2).toFixed(1)}" y="${(y - 2.3).toFixed(1)}" width="${w.toFixed(1)}" height="4.6" rx="2.3" fill="#d2d8e2" stroke="#20242c" stroke-width="0.8"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#d9dee6" stroke="#20242c" stroke-width="3"/>
      <circle cx="50" cy="50" r="40" fill="#14161c"/>
      ${bars}
      <rect x="46.5" y="12" width="7" height="76" rx="3.5" fill="#e2b34c" stroke="#2a1c08" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="9" fill="#e2b34c" stroke="#2a1c08" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="4" fill="#1d2b52"/>
    </svg>`,
    { size: 256 },
  );
}

function chevronTexture() {
  let body = "";
  for (const o of [0, 14, 28]) {
    body += `<path d="M8 ${74 - o} L60 ${36 - o} L112 ${74 - o} L97 ${74 - o} L60 ${50 - o} L23 ${74 - o} Z" fill="url(#g)" stroke="${INKD}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><defs>${GOLD_GRAD}</defs>${body}</svg>`,
    { size: 256 },
  );
}

function portholeTexture() {
  let rivets = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    rivets += `<circle cx="${(32 + 23 * Math.sin(a)).toFixed(1)}" cy="${(32 - 23 * Math.cos(a)).toFixed(1)}" r="1.9" fill="#fff0b8"/>`;
  }
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="a" cx="0.45" cy="0.4" r="0.6"><stop offset="0" stop-color="#fff6d0"/><stop offset="1" stop-color="#ff9a3c"/></radialGradient></defs>
      <circle cx="32" cy="32" r="30" fill="#2a1c08"/>
      <circle cx="32" cy="32" r="27" fill="#d7a83e"/>
      ${rivets}
      <circle cx="32" cy="32" r="18.5" fill="url(#a)" stroke="#2a1c08" stroke-width="2"/>
      <path d="M22 26 A12 12 0 0 1 32 19" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
}

function regTexture(text: string) {
  return svg(
    `<svg viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg">
      <defs>${GOLD_GRAD}</defs>
      <rect x="18" y="66" width="284" height="6" rx="3" fill="url(#g)" stroke="${INKD}" stroke-width="2"/>
      <text x="160" y="56" text-anchor="middle" font-family="${DECO_FONT}" font-weight="700" font-size="54" letter-spacing="8"
        fill="url(#g)" stroke="${INKD}" stroke-width="6" stroke-linejoin="round" paint-order="stroke">${text}</text>
    </svg>`,
    { size: 512 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

const HULL = paint((p, n, s) => {
  const t = s[0];
  const deg = ((s[1] % 360) + 360) % 360;
  const a = Math.abs(deg - 180); // 0 belly, 180 crown
  // sunburst nose
  if (t > 0.925) {
    const r = deg % 22.5;
    const d = Math.min(r, 22.5 - r);
    const w = 1.6 + 5.5 * smoothstep(0.925, 1, t);
    return d < w ? lit(GOLD, n, 0.35) : lit(NAVY, n);
  }
  if (t > 0.912) return lit(CREAM, n);
  if (t > 0.905) return lit(GOLD, n, 0.35);
  // tail cap
  if (t < 0.046) return t > 0.036 ? lit(GOLD, n, 0.35) : lit(NAVY, n);
  // the cheatline: navy speed band, gold pinstripe above, oxblood line below; it points aft and sweeps up at the nose
  const fade = smoothstep(0.1, 0.3, t);
  const c = 72 + 34 * smoothstep(0.78, 0.92, t);
  const hw = 6.5 * fade;
  if (hw > 0.2) {
    const d = Math.abs(a - c);
    if (d < hw) return lit(NAVY, n);
    if (a > c && d > hw + 0.7 && d < hw + 1.9) return lit(GOLD, n, 0.35);
    if (Math.abs(a - (c - hw - 4.5)) < 1.3 * fade) return lit(OXBLOOD, n);
  }
  // doped silver fabric between girders and frames
  const bay = Math.floor(deg / 22.5) % 2;
  const v = noise(p, 7, 3);
  const base = mix(SILVER, SILVER_HI, 0.22 + 0.45 * v + (bay ? 0.08 : 0));
  const g = deg % 22.5;
  if (Math.min(g, 22.5 - g) < 0.28) return lit(mix(base, SILVER_LO, 0.75), n, 0.25);
  const fz = (((p.z - ZT) % 4.6) + 4.6) % 4.6;
  if (fz < 0.2) return lit(mix(base, SILVER_LO, 0.45), n, 0.25);
  return lit(base, n, 0.35);
});

function finPaint(Y: V3) {
  const thick = new THREE.Vector3(0, 0, 1).cross(new THREE.Vector3(Y[0], Y[1], Y[2])).normalize();
  const inv = 1 / Math.hypot(16, 9);
  return paint((_p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return GILT;
    const u = s[0];
    const v = s[1];
    const d = ((u - 34) * 9 + (v - 11.5) * 16) * inv; // signed distance from the leading edge, negative inside
    if (d > -0.8) return lit(CREAM, n);
    if (d > -1.25) return lit(NAVY, n);
    if (d > -1.8) return lit(GOLD, n, 0.3);
    if (v > 19.6) return lit(CREAM, n);
    if (v > 18.7 && v < 19.05) return lit(GOLD, n, 0.3);
    return lit(NAVY, n);
  });
}

function rudderPaint(Y: V3) {
  const thick = new THREE.Vector3(0, 0, 1).cross(new THREE.Vector3(Y[0], Y[1], Y[2])).normalize();
  return paint((_p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return GILT;
    const v = s[1];
    if ((v > 16.9 && v < 17.5) || (v > 18.2 && v < 18.8)) return lit(CREAM, n);
    if (v > 15.9 && v < 16.2) return lit(GOLD, n, 0.3);
    return lit(OXBLOOD, n);
  });
}

const GONDOLA_P = paint((p, n) => {
  const y = p.y;
  if (y < 3.25) return lit(NAVY, n);
  if (y < 3.45) return lit(GOLD, n, 0.3);
  if (y > 3.62 && y < 3.72) return lit(GOLD, n, 0.3);
  if (y > 4.05 && y < 5.95) return lit(NAVY_D, n, 0.15);
  if (y > 5.95 && y < 6.06) return lit(GOLD, n, 0.3);
  if (n.y > 0.85) return lit(ROOF, n);
  return lit(CREAM, n);
});

const FAIRING_P = paint((_p, n) => lit(NAVY_D, n, 0.3));

const NACELLE_P = paint((_p, n, s) => {
  const h = s[0];
  const deg = ((s[1] % 360) + 360) % 360;
  if (h > 3.3) return lit(NAVY, n);
  const off = deg < 180 ? deg - 90 : 270 - deg; // 0 on the side, + downward
  const len = smoothstep(-3.6, -1.2, h) * (h < 2.2 ? 1 : 0);
  if (len > 0) {
    if (Math.abs(off) < 6 * len) return lit(NAVY, n);
    if (Math.abs(off - 13) < 2.5 * len || Math.abs(off + 13) < 2.5 * len) return lit(GOLD, n, 0.3);
  }
  if (n.y < -0.6) return lit(NAVY, n);
  return lit(CREAM, n);
});

const BLADE_P = paint((_p, n, s) => (s[0] > 2.75 ? lit(GOLD, n, 0.3) : lit(WOOD, n)));

const SPAT_P = paint((_p, n, s) => {
  if (Math.abs(n.x) < 0.5) return lit(NAVY, n);
  const [u, v] = s;
  if (v > 1.02 && v < 1.15 && u > -1.25) return lit(GOLD, n, 0.3);
  if (v > 1.3 && v < 1.39 && u > -0.9) return lit(GOLD, n, 0.3);
  return lit(NAVY, n);
});

// ---------------------------------------------------------------------------------------------------------------
// Outlines

const FIN: OP[] = [
  [8.5, 3],
  [34, 3],
  [34, 11.5],
  [18, 20.5, "sharp"],
  [8.5, 20.5, "sharp"],
];
const RUDDER: OP[] = [
  [1.4, 0.8],
  [8.2, 0.8],
  [8.2, 20.4, "sharp"],
  [3.0, 19.6],
  [1.4, 16.5],
];
const NACELLE: OP[] = [
  [0, -4.6, "sharp"],
  [0.9, -4.2],
  [1.6, -2.5],
  [1.95, 0],
  [1.9, 2.2],
  [1.5, 3.6],
  [0.8, 4.4],
  [0, 4.6, "sharp"],
];
const COWL: OP[] = [
  [1.86, 2.3],
  [2.12, 2.5],
  [2.08, 3.2],
  [1.6, 3.45],
];
const SPINNER: OP[] = [
  [0, 0, "sharp"],
  [0.85, 0],
  [0.75, 0.7],
  [0.4, 1.5],
  [0, 1.9, "sharp"],
];
const BLADE: OP[] = [
  [0.2, -0.3],
  [2.8, -0.45],
  [3.4, -0.15],
  [3.4, 0.2],
  [2.8, 0.38],
  [0.2, 0.28],
];
const NOSE_CAP: OP[] = [
  [0, 0, "sharp"],
  [3.7, 0, "sharp"],
  [3.6, 1.2],
  [3.0, 2.6],
  [1.8, 3.8],
  [0, 4.4, "sharp"],
];
const TAIL_CAP: OP[] = [
  [0, 0, "sharp"],
  [2.6, 0, "sharp"],
  [2.1, 2.0],
  [1.1, 3.3],
  [0, 3.9, "sharp"],
];
const SPAT: OP[] = [
  [-1.5, 0.55, "sharp"],
  [1.3, 0.55, "sharp"],
  [1.15, 1.3],
  [0.4, 2.0],
  [-1.0, 2.0],
  [-1.6, 1.2],
];
const SPEED_FIN: OP[] = [
  [0, -0.5],
  [3.4, -1.2],
  [4.2, 0.9, "sharp"],
  [0.8, 0.9],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "aurora-zeppelin", paintSize: 2048 });

  const NAME_TEX = nameTexture("AURORA");
  const EMBLEM_TEX = emblemTexture();
  const WIN_FRAME = windowRow(12, "frame");
  const WIN_GLASS = windowRow(12, "glass");
  const BRIDGE_TEX = bridgeTexture();
  const DOOR_TEX = doorTexture();
  const GRILLE_TEX = grilleTexture();
  const CHEVRON_TEX = chevronTexture();
  const PORT_TEX = portholeTexture();
  const REG_TEX = regTexture("LZ 140");

  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // =============================================================================================================
  // HULL: a sixteen-girder faceted envelope

  const hull = b.sweep(
    [
      [0, HC, ZT],
      [0, HC, ZN],
    ],
    hullR,
    { section: { ngon: 16 }, color: HULL, name: "hull" },
  );
  const hs = b.surface(hull);

  // nose: chrome mooring cap, gold battens radiating as a sunburst, mooring spike and collar
  b.lathe(NOSE_CAP, {
    at: [0, HC, ZN - 0.8],
    axis: [0, 0, 1],
    segments: 16,
    smoothing: 1,
    color: CHROME,
    name: "noseCap",
  });
  for (let k = 0; k < 16; k++) {
    b.sweep(hull.line(k * 22.5, 0.1).slice(0.9, 0.995), 0.28, { color: GILT, sides: 6, name: `batten${k}` });
  }
  b.spike([0, HC, ZN + 3.2], [0, 0, 1], 2.2, 0.5, { color: CHROME, sides: 8, name: "mooringSpike" });
  b.part(new THREE.TorusGeometry(0.62, 0.16, 6, 14), GILT, {
    at: [0, HC, ZN + 3.75],
    dir: [0, 0, 1],
    axis: "z",
    name: "mooringCollar",
  });

  // gold hoops round the nose and the tail
  for (const z of [ZN - 15.2, ZN - 13.4, ZT + 7.6, ZT + 9.2]) {
    b.sweep(hs.loop([0, HC, z], { dir: [0, 0, 1], lift: 0.05 }), 0.3, { color: GILT, sides: 6, name: "hoop" });
  }

  // tail cone and stern light
  b.lathe(TAIL_CAP, { at: [0, HC, ZT + 3], axis: [0, 0, -1], segments: 16, smoothing: 1, color: NAVY, name: "tailCone" });
  glow(b.part(new THREE.SphereGeometry(0.55, 8, 6), "#fff8e6", { at: [0, HC, ZT - 1.1], name: "sternLight" }), 1.6);

  // dorsal mushroom ventilators
  for (const t of [0.3, 0.37, 0.44, 0.51, 0.58, 0.65, 0.72, 0.79]) {
    const sp = hull.at(t, 0);
    b.stick(new THREE.CylinderGeometry(0.55, 0.72, 0.9, 8), CHROME, sp, { embed: 0.4, name: "vent" });
    const top = sp.at.clone().addScaledVector(sp.n, 0.9 * 0.6);
    b.stick(new THREE.CylinderGeometry(0.88, 0.88, 0.2, 8), GILT, sp.moved(top), { embed: 0.3, name: "ventCap" });
  }

  // dorsal observation blisters
  for (const d of [20, 340]) {
    const sp = hull.at(0.83, d);
    b.stick(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 10), CHROME, sp, { embed: 0.5, name: "blisterRim" });
    glow(
      b.stick(new THREE.SphereGeometry(1.3, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#a8dcff", sp, {
        embed: 0.1,
        name: "blister",
      }),
      0.7,
    );
  }

  // flank livery: name banner, winged emblem, slanted promenade windows of the passenger deck
  for (const s of [1, -1]) {
    const nm = hull.at(0.656, s > 0 ? 298 : 62);
    b.decal(hull, NAME_TEX, { at: nm.at, dir: nm.n, size: [30, 5.5], segments: 24, lift: 0.12, name: "nameBanner" });
    const em = hull.at(0.844, s > 0 ? 302 : 58);
    b.decal(hull, EMBLEM_TEX, { at: em.at, dir: em.n, size: [9, 4.8], segments: 12, lift: 0.12, name: "hullEmblem" });
    const wn = hull.at(0.672, s > 0 ? 228 : 132);
    glow(
      b.decal(hull, WIN_GLASS, { at: wn.at, dir: wn.n, size: [18, 1.6], segments: 24, lift: 0.08, name: "deckGlass" }),
      1.2,
    );
    b.decal(hull, WIN_FRAME, { at: wn.at, dir: wn.n, size: [18, 1.6], segments: 24, lift: 0.18, name: "deckFrames" });
  }

  // =============================================================================================================
  // CRUCIFORM TAIL: navy fins, oxblood rudders and elevators, chrome leading edges, gilt tips, running lights

  const fp = (Y: V3, u: number, v: number): V3 => [Y[0] * v, HC + Y[1] * v, ZT + u];
  const FINS: { Y: V3; light: string; key: string }[] = [
    { Y: [0, 1, 0], light: "#fff8e6", key: "Top" },
    { Y: [0, -1, 0], light: "#fff8e6", key: "Bottom" },
    { Y: [1, 0, 0], light: "#ff3b30", key: "Port" },
    { Y: [-1, 0, 0], light: "#36e07a", key: "Starboard" },
  ];
  const fins: Record<string, ReturnType<typeof b.extrude>> = {};
  for (const f of FINS) {
    fins[f.key] = b.extrude(FIN, {
      at: [0, HC, ZT],
      x: [0, 0, 1],
      y: f.Y,
      thickness: [0.9, 0.4],
      bevel: 0.15,
      color: finPaint(f.Y),
      name: `fin${f.key}`,
    });
    b.extrude(RUDDER, {
      at: [0, HC, ZT],
      x: [0, 0, 1],
      y: f.Y,
      thickness: [0.55, 0.3],
      bevel: 0.1,
      color: rudderPaint(f.Y),
      name: `rudder${f.key}`,
    });
    b.rod(fp(f.Y, 34, 11.5), fp(f.Y, 18, 20.5), 0.32, CHROME, { sides: 6, name: `finEdge${f.key}` });
    b.rod(fp(f.Y, 18, 20.5), fp(f.Y, 8.5, 20.5), 0.26, GILT, { sides: 6, name: `finTip${f.key}` });
    b.rod(fp(f.Y, 8.35, 4.5), fp(f.Y, 8.35, 20.7), 0.18, CHROME, { sides: 6, name: `hinge${f.key}` });
    glow(b.part(new THREE.SphereGeometry(0.45, 8, 6), f.light, { at: fp(f.Y, 8.5, 20.85), name: `light${f.key}` }), 1.6);
  }
  for (const s of [1, -1]) {
    const top = fp([0, 1, 0], 17.5, 14.5);
    b.decal(fins.Top, EMBLEM_TEX, {
      at: [s * 1.2, top[1], top[2]],
      dir: [s, 0, 0],
      size: [9, 4.8],
      lift: 0.08,
      name: "finEmblem",
    });
    const bot = fp([0, -1, 0], 19, 14);
    b.decal(fins.Bottom, REG_TEX, {
      at: [s * 1.2, bot[1], bot[2]],
      dir: [s, 0, 0],
      size: [8, 2.1],
      lift: 0.08,
      name: "finReg",
    });
    const hz = fp([s, 0, 0], 17.5, 14.5);
    b.decal(s > 0 ? fins.Port : fins.Starboard, EMBLEM_TEX, {
      at: [hz[0], HC + 1.2, hz[2]],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [9, 4.8],
      lift: 0.08,
      name: "planeEmblem",
    });
  }

  // =============================================================================================================
  // ENGINE CARS: cream streamliners on chrome struts, pusher propellers

  let carIndex = 0;
  const engineCar = (z: number, side: number, out: number) => {
    const idx = ++carIndex;
    const deg = side > 0 ? 238 : 122;
    const degUp = side > 0 ? 254 : 106;
    const sp = hull.at(hullT(z), deg);
    const nOut = new THREE.Vector3(sp.n.x, sp.n.y, 0).normalize();
    const c = sp.at.clone().addScaledVector(nOut, out);

    const body = b.lathe(NACELLE, {
      at: c,
      axis: [0, 0, 1],
      segments: 14,
      smoothing: 1,
      color: NACELLE_P,
      name: `nacelle${idx}`,
    });
    b.lathe(COWL, { at: c, axis: [0, 0, 1], segments: 14, color: CHROME, name: `cowl${idx}` });
    b.lathe(SPINNER, {
      at: [c.x, c.y, c.z - 4.3],
      axis: [0, 0, -1],
      segments: 10,
      smoothing: 1,
      color: GILT,
      name: `spinner${idx}`,
    });

    const hub = v3(c.x, c.y, c.z - 4.95);
    const pitch = (22 * Math.PI) / 180;
    for (let i = 0; i < 4; i++) {
      const th = ((i * 90 + 45 + side * 12) * Math.PI) / 180;
      const radial: V3 = [Math.cos(th), Math.sin(th), 0];
      const across: V3 = [-Math.sin(th) * Math.cos(pitch), Math.cos(th) * Math.cos(pitch), Math.sin(pitch) * side];
      b.extrude(BLADE, {
        at: hub,
        x: radial,
        y: across,
        thickness: 0.14,
        bevel: 0.04,
        smoothing: 1,
        color: BLADE_P,
        name: `blade${idx}_${i}`,
      });
    }

    // struts: fore, aft and a diagonal brace from higher on the hull
    for (const dz of [2.2, -2.2]) {
      const hp = hull.at(hullT(c.z + dz), deg);
      const a = hp.at.clone().addScaledVector(hp.n, -0.6);
      const e = c.clone().addScaledVector(nOut, -1.2).add(v3(0, 0, dz));
      b.rod(a, e, 0.28, CHROME, { sides: 6, name: `strut${idx}` });
    }
    const hu = hull.at(hullT(c.z + 0.6), degUp);
    b.rod(hu.at.clone().addScaledVector(hu.n, -0.6), c.clone().add(v3(0, 1.25, -0.4)), 0.24, CHROME, {
      sides: 6,
      name: `brace${idx}`,
    });

    // exhaust along the outer lower flank
    b.rod(
      c.clone().addScaledVector(nOut, 1.75).add(v3(0, -0.85, 1.2)),
      c.clone().addScaledVector(nOut, 1.55).add(v3(0, -0.8, -1.6)),
      0.17,
      CHROME,
      { sides: 6, name: `exhaust${idx}` },
    );

    // radiator grille and the mechanic's porthole
    b.decal(body, GRILLE_TEX, {
      at: [c.x, c.y, c.z + 5.0],
      dir: [0, 0, 1],
      size: [2.5, 2.5],
      lift: 0.04,
      name: `grille${idx}`,
    });
    glow(
      b.decal(body, PORT_TEX, {
        at: c.clone().addScaledVector(nOut, 2.2).add(v3(0, 0.35, 0.6)),
        dir: nOut,
        size: [0.95, 0.95],
        lift: 0.04,
        name: `porthole${idx}`,
      }),
      1.1,
    );
  };
  for (const s of [1, -1]) {
    engineCar(-6, s, 5.5);
    engineCar(-30, s, 5.0);
  }

  // =============================================================================================================
  // GONDOLA: octagonal streamline car, navy keel fairing above it

  const G = (z: number, y: number, w: number, h: number) => ({ at: [0, y, ZG + z] as V3, w, h });
  const gondola = b.loft([G(-13, 5.8, 2.4, 3.2), G(-10, 5.0, 6.0, 5.0), G(-4, 4.7, 7.0, 6.0), G(6, 4.7, 7.0, 6.0), G(11.5, 4.6, 6.0, 5.4), G(13, 4.6, 4.4, 4.4)], {
    sides: 8,
    smooth: false,
    caps: "round",
    color: GONDOLA_P,
    name: "gondola",
  });
  const gs = b.surface(gondola);

  const F = (z: number, y: number, w: number, h: number) => ({ at: [0, y, ZG + z] as V3, w, h });
  const fairing = b.loft([F(-11, 9.0, 1.6, 3.8), F(-8.5, 9.3, 4.4, 4.6), F(5, 9.5, 4.4, 4.6), F(9.5, 9.4, 1.8, 4.4)], {
    section: "box",
    caps: "flat",
    color: FAIRING_P,
    name: "keelFairing",
  });
  const fs = b.surface(fairing);

  // gilt fluting on the keel fairing
  for (const s of [1, -1]) {
    for (const z of [-6, -3.6, -1.2, 1.2, 3.6]) {
      const hit = fs.around([0, 9.4, ZG + z]).at(s * 90, 0);
      if (hit)
        b.stick(new THREE.BoxGeometry(0.32, 0.26, 3.0), GILT, hit, { flow: [0, 1, 0], embed: 0.4, name: "flute" });
    }
  }

  // chrome visor line and gilt pinstripe wrapping the car above the windows
  b.sweep(gs.loop([0, 6.3, ZG], { dir: [0, 1, 0], lift: 0.03 }), 0.11, { color: CHROME, sides: 6, name: "visor" });
  b.sweep(gs.loop([0, 6.62, ZG], { dir: [0, 1, 0], lift: 0.03 }), 0.08, { color: GILT, sides: 6, name: "pinstripe" });

  // promenade windows, doors, rear lounge
  for (const s of [1, -1]) {
    glow(
      b.decal(gondola, WIN_GLASS, {
        at: [s * 3.7, 5.0, ZG + 2],
        dir: [s, 0, 0],
        size: [15, 1.55],
        segments: 24,
        lift: 0.06,
        name: "promenadeGlass",
      }),
      1.2,
    );
    b.decal(gondola, WIN_FRAME, {
      at: [s * 3.7, 5.0, ZG + 2],
      dir: [s, 0, 0],
      size: [15, 1.55],
      segments: 24,
      lift: 0.12,
      name: "promenadeFrames",
    });
    b.decal(gondola, DOOR_TEX, {
      at: [s * 3.6, 4.55, ZG - 8.3],
      dir: [s, 0, 0],
      size: [1.6, 2.7],
      lift: 0.1,
      mirror: s < 0,
      name: "door",
    });
    // art deco speed fins on the tail of the car
    for (const y of [4.15, 4.75, 5.35]) {
      b.extrude(SPEED_FIN, {
        at: [s * 2.6, y, ZG - 8],
        x: [0, 0, -1],
        y: [s, 0, 0],
        thickness: 0.15,
        bevel: 0.04,
        color: GILT,
        name: "speedFin",
      });
    }
    // running lights on the nose
    const nav = gs.around([0, 4.6, ZG + 12]).at(s * 65, 20);
    if (nav)
      glow(
        b.stick(new THREE.SphereGeometry(0.22, 8, 6), s > 0 ? "#ff3b30" : "#36e07a", nav, { embed: 0.4, name: "navLight" }),
        1.6,
      );
  }
  glow(
    b.decal(gondola, WIN_GLASS, {
      at: [0, 5.0, ZG - 15.5],
      dir: [0, 0, -1],
      size: [2.4, 0.9],
      lift: 0.06,
      name: "loungeGlass",
    }),
    1.2,
  );

  // wraparound bridge and nose chevrons
  b.decal(gondola, BRIDGE_TEX, {
    at: [0, 5.0, ZG + 16],
    dir: [0, 0, 1],
    size: [5.6, 1.3],
    segments: 16,
    lift: 0.08,
    name: "bridge",
  });
  b.decal(gondola, CHEVRON_TEX, {
    at: [0, 3.55, ZG + 16],
    dir: [0, 0, 1],
    size: [2.2, 1.4],
    lift: 0.08,
    name: "noseChevrons",
  });

  // searchlight under the bridge
  b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.9, 10), CHROME, {
    at: [0, 1.75, ZG + 11.6],
    dir: [0, 0, 1],
    name: "searchlight",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.34, 12), "#fff6d8", {
      at: [0, 1.75, ZG + 12.07],
      dir: [0, 0, 1],
      axis: "z",
      name: "searchLens",
    }),
    1.8,
  );

  // landing wheel in an art deco spat: the model rests on the tyre
  b.extrude(SPAT, {
    at: [0, 0, ZG + 2],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.0,
    bevel: 0.12,
    smoothing: 1,
    color: SPAT_P,
    name: "wheelSpat",
  });
  b.part(new THREE.TorusGeometry(0.55, 0.28, 8, 16), TYRE, {
    at: [0, 0.83, ZG + 2],
    dir: [1, 0, 0],
    axis: "z",
    name: "tyre",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.08, 12), CHROME, {
      at: [s * 0.53, 0.95, ZG + 2],
      dir: [s, 0, 0],
      name: "hubCap",
    });
  }

  return b.root;
}
```