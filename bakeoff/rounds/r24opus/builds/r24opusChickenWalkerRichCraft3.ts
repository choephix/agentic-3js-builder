import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  limb,
  paint,
  noise,
  mix,
  smoothstep,
  mottle,
  resolve,
  svg,
} from "../../../../src/index";
import type { ColorInput, Paint } from "../../../../src/index";
import { metal, gaugeTexture, gearTrain } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

type P3 = [number, number, number];
type RGB = readonly [number, number, number];
type OP = [number, number] | [number, number, "sharp"];

export const meta = {
  name: "Walking Castle",
  description:
    "A ramshackle Howl's-Moving-Castle-style house-machine: a riveted, rust-patched iron hull with sleepy lidded lamp-eyes and a toothed jaw hiding a fire demon, a teetering pile of timber cottages, a stone spire and an onion-domed turret on its back, all striding on two feathered, brass-cuffed chicken legs.",
};

const DEG = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);
const h1 = (k: number) => fract(Math.sin(k * 127.1 + 311.7) * 43758.5453);
const h2 = (a: number, c: number) => fract(Math.sin(a * 127.1 + c * 311.7 + 17.3) * 43758.5453);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const sh = (x: number, y: number): [number, number, "sharp"] => [x, y, "sharp"];

/** Warm light from above, cool shade below. */
function lit(c: string | RGB, n: THREE.Vector3): RGB {
  const cool = mix(c, "#262a48", 0.32 * smoothstep(0.25, -0.9, n.y));
  return mix(cool, "#fff0cc", 0.14 * smoothstep(0.3, 1, n.y));
}

/** Big riveted plating at castle scale: staggered plates, dark seams, a glint bevel, fat rivets. */
function plating(base: ColorInput, size: number, aspect = 0.62, pitch = 0.08, rr = 0.013): Paint {
  const cv = size * aspect;
  const seam = Math.max(0.011, size * 0.032);
  return paint((p, n) => {
    const col = resolve(base, p, n);
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const [u0, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const row = Math.floor(v / cv);
    const u = u0 + (((row % 2) + 2) % 2) * size * 0.5;
    const du = fract(u / size) * size;
    const dv = fract(v / cv) * cv;
    if (du < seam || dv < seam) return mix(col, "#1a100a", 0.78);
    if (du < seam * 2.2 || dv < seam * 2.2) return mix(col, "#ffe2a8", 0.2);
    const along = (x: number) => (fract(x / pitch) - 0.5) * pitch;
    const inset = seam * 2.2 + rr * 1.4;
    const d = Math.min(Math.hypot(du - inset, along(v)), Math.hypot(dv - inset, along(u)));
    if (d < rr * 0.6) return mix(col, "#fff0c0", 0.55);
    if (d < rr) return mix(col, "#140c08", 0.55);
    const id = h2(Math.floor(u / size), row);
    return mix(col, id > 0.5 ? "#a0582e" : "#4e5866", 0.32 * Math.abs(id - 0.5));
  });
}

/** Overlapping shingles in rows; gable ends (faces along `gableAxis`) take `gable`, undersides a dark soffit. */
function shingles(
  cols: string[],
  edge: string,
  along: (p: THREE.Vector3) => number,
  mossy: boolean,
  gable: ColorInput | null,
  gableAxis: THREE.Vector3 | null,
): Paint {
  return paint((p, n) => {
    if (gable && gableAxis && Math.abs(n.dot(gableAxis)) > 0.6) return gable;
    if (n.y < -0.4) return lit("#3a2618", n);
    const rowH = 0.12;
    const r = Math.floor(p.y / rowH);
    const fy = p.y / rowH - r;
    const u = along(p) / 0.17 + (r & 1) * 0.5;
    const ci = Math.floor(u);
    const fx = u - ci;
    const id = h2(ci, r);
    let c: RGB = mix(cols[Math.floor(id * cols.length) % cols.length], "#ffffff", 0.08 * h1(ci + r));
    c = mix(c, edge, 0.6 * (1 - smoothstep(0, 0.24, fy)));
    if (fx < 0.06) c = mix(c, edge, 0.55);
    if (mossy && n.y > 0.3 && noise(p, 0.35, 21) > 0.62) c = mix(c, "#6f8a3a", 0.75);
    return lit(c, n);
  });
}

/** Chicken skin with scute rings every 8 cm along the tube, mud toward the ground. */
function scaly(len: number): Paint {
  return paint((p, n, s) => {
    const ring = fract((s[0] * len) / 0.08);
    let c: RGB = mix("#d9952f", "#f2c35a", noise(p, 0.12, 5));
    if (ring < 0.13) c = mix(c, "#7a3e14", 0.75);
    else c = mix(c, "#fff1b8", 0.3 * smoothstep(0.55, 0.95, ring));
    c = mix(c, "#4a3020", 0.75 * smoothstep(0.5, 0.04, p.y));
    return lit(c, n);
  });
}

/** Dressed stone blocks around a round tower. */
function ashlar(cx: number, cz: number, r: number): Paint {
  return paint((p, n) => {
    const ang = Math.atan2(p.x - cx, p.z - cz) * r;
    const rh = 0.2;
    const row = Math.floor(p.y / rh);
    const u = ang / 0.32 + (row & 1) * 0.5;
    const fx = fract(u);
    const fy = fract(p.y / rh);
    let c: RGB = mix("#b8ab94", "#8f8676", h2(Math.floor(u), row));
    c = mix(c, "#6f8a3a", 0.6 * smoothstep(0.62, 0.74, noise(p, 0.3, 8)) * smoothstep(0.3, 0.9, n.y + 0.6));
    c = mix(c, "#4a3c34", 0.35 * smoothstep(0.6, 0.8, noise(p, 0.5, 18)));
    if (fx < 0.05 || fy < 0.08) c = mix(c, "#3a3430", 0.7);
    else c = mix(c, "#fff3d6", 0.14 * (1 - fy));
    return lit(c, n);
  });
}

function makeTextures() {
  const timber = (plaster: string, blot: string, beam: string) =>
    svg(
      `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="90" fill="${plaster}"/>
      <ellipse cx="26" cy="22" rx="20" ry="9" fill="${blot}"/>
      <ellipse cx="92" cy="66" rx="22" ry="11" fill="${blot}"/>
      <ellipse cx="62" cy="24" rx="9" ry="5" fill="${blot}"/>
      <path d="M10 70 l6 -3 l4 4 M100 30 l5 -4 l3 5 M58 72 l4 3" stroke="#a8936e" stroke-width="1.6" fill="none"/>
      <rect x="54" y="60" width="12" height="7" fill="#c49a6c"/>
      <path d="M54 60 h12 M54 63.5 h12 M60 60 v3.5 M57 63.5 v3.5 M63 63.5 v3.5" stroke="#8a5a3a" stroke-width="0.9"/>
      <g stroke="${beam}" stroke-width="6" fill="none" stroke-linecap="square">
        <rect x="3" y="3" width="114" height="84"/>
        <line x1="0" y1="47" x2="120" y2="47"/>
        <line x1="40" y1="0" x2="40" y2="90"/>
        <line x1="80" y1="0" x2="80" y2="90"/>
        <line x1="6" y1="85" x2="38" y2="50"/>
        <line x1="114" y1="85" x2="82" y2="50"/>
        <line x1="38" y1="44" x2="6" y2="7"/>
        <line x1="82" y1="44" x2="114" y2="7"/>
      </g>
      <g stroke="#2a180c" stroke-width="1" opacity="0.7">
        <line x1="3" y1="47" x2="117" y2="47"/><line x1="40" y1="3" x2="40" y2="87"/><line x1="80" y1="3" x2="80" y2="87"/>
      </g>
      <g fill="#2a180c"><circle cx="40" cy="47" r="2"/><circle cx="80" cy="47" r="2"/><circle cx="40" cy="5" r="1.6"/><circle cx="80" cy="5" r="1.6"/><circle cx="40" cy="85" r="1.6"/><circle cx="80" cy="85" r="1.6"/></g>
    </svg>`,
      { size: 256 },
    );
  const WALL_A = timber("#efe0bf", "#e2cfa6", "#5b3a21");
  const WALL_B = timber("#ecd4c6", "#dcbaa8", "#4a2e22");

  let boards = "";
  for (let i = 0; i < 8; i++) {
    const y = i * 10;
    boards += `<rect x="0" y="${y}" width="100" height="1.8" fill="#8cc4bc"/><rect x="0" y="${y + 7.4}" width="100" height="2.6" fill="#3d6c69"/>`;
  }
  const CLAP = svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="80" fill="#5f9e98"/>
      ${boards}
      <ellipse cx="30" cy="33" rx="9" ry="3.4" fill="#b59f7c"/>
      <ellipse cx="74" cy="62" rx="12" ry="3.2" fill="#b59f7c"/>
      <ellipse cx="60" cy="14" rx="6" ry="2.6" fill="#b59f7c"/>
      <rect x="0" y="0" width="6" height="80" fill="#efe6cf"/><rect x="94" y="0" width="6" height="80" fill="#efe6cf"/>
      <g fill="#3a3a40"><circle cx="20" cy="4" r="0.9"/><circle cx="50" cy="44" r="0.9"/><circle cx="82" cy="24" r="0.9"/></g>
    </svg>`,
    { size: 256 },
  );

  const DOOR = svg(
    `<svg viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 80 V25 A23 23 0 0 1 48 25 V80 Z" fill="#3a2414"/>
      <path d="M7 80 V26 A18 18 0 0 1 43 26 V80 Z" fill="#8a4a24"/>
      <path d="M16 80 V11 M25 80 V8 M34 80 V11" stroke="#5a2e14" stroke-width="1.8"/>
      <rect x="7" y="22" width="24" height="4" fill="#2a2a2e"/><rect x="7" y="62" width="24" height="4" fill="#2a2a2e"/>
      <circle cx="10" cy="24" r="1.2" fill="#8a8a90"/><circle cx="10" cy="64" r="1.2" fill="#8a8a90"/>
      <circle cx="37" cy="48" r="2.8" fill="#e3b450"/>
      <circle cx="25" cy="25" r="6.5" fill="#ffd36b" stroke="#3a2414" stroke-width="2.2"/>
      <path d="M25 18.5 V31.5 M18.5 25 H31.5" stroke="#3a2414" stroke-width="1.3"/>
    </svg>`,
    { size: 192 },
  );

  const paneGrad = `<radialGradient id="g" cx="0.5" cy="0.62" r="0.7"><stop offset="0" stop-color="#fff6c8"/><stop offset="0.55" stop-color="#ffcf5a"/><stop offset="1" stop-color="#e8862a"/></radialGradient>`;
  const WIN = svg(
    `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <defs>${paneGrad}</defs>
      <rect x="0" y="0" width="40" height="50" rx="2" fill="#3b2516"/>
      <rect x="4" y="4" width="32" height="42" fill="url(#g)"/>
      <path d="M4 4 Q11 22 6 46 L4 46 Z" fill="#a8322a"/>
      <path d="M36 4 Q29 22 34 46 L36 46 Z" fill="#a8322a"/>
      <path d="M4 4 H36 V8 Q20 12 4 8 Z" fill="#c8483a"/>
      <rect x="18.5" y="4" width="3" height="42" fill="#3b2516"/>
      <rect x="4" y="24" width="32" height="3" fill="#3b2516"/>
      <path d="M9 30 q2 -6 4 0 q2 -5 3 0 v5 h-7 Z" fill="#3e6a2a"/>
      <path d="M9 9 L15 9 L9 17 Z" fill="#ffffff" opacity="0.7"/>
    </svg>`,
    { size: 128 },
  );
  const ARCH = svg(
    `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
      <defs>${paneGrad}</defs>
      <path d="M0 56 V20 A20 20 0 0 1 40 20 V56 Z" fill="#3b2516"/>
      <path d="M4 52 V21 A16 16 0 0 1 36 21 V52 Z" fill="url(#g)"/>
      <path d="M20 5 V52 M4 30 H36" stroke="#3b2516" stroke-width="3"/>
      <path d="M8 18 A13 13 0 0 1 16 9" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.75" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const PORT = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.45" cy="0.42" r="0.62"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd25e"/><stop offset="1" stop-color="#d9741e"/></radialGradient></defs>
      <circle cx="32" cy="32" r="32" fill="#2a1a10"/>
      <circle cx="32" cy="32" r="26" fill="url(#g)"/>
      <path d="M32 6 V58 M6 32 H58" stroke="#2a1a10" stroke-width="3.2"/>
      <path d="M14 22 A20 20 0 0 1 24 12" stroke="#ffffff" stroke-width="3.2" fill="none" opacity="0.8" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ticks += `<line x1="${(50 + 33 * Math.cos(a)).toFixed(1)}" y1="${(50 + 33 * Math.sin(a)).toFixed(1)}" x2="${(50 + 41 * Math.cos(a)).toFixed(1)}" y2="${(50 + 41 * Math.sin(a)).toFixed(1)}"/>`;
  }
  const EYE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="i" cx="0.5" cy="0.58" r="0.5"><stop offset="0" stop-color="#fff4b0"/><stop offset="0.55" stop-color="#ffb53a"/><stop offset="1" stop-color="#d8561a"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="#1e140e"/>
      <circle cx="50" cy="50" r="45" fill="url(#i)"/>
      <g stroke="#a8461a" stroke-width="1.8">${ticks}</g>
      <circle cx="50" cy="50" r="31" fill="none" stroke="#7a2e10" stroke-width="2.6"/>
      <circle cx="50" cy="59" r="18" fill="#1b0f0a"/>
      <circle cx="50" cy="59" r="11" fill="none" stroke="#5a2a12" stroke-width="2.2"/>
      <ellipse cx="41" cy="51" rx="6.5" ry="5" fill="#ffffff"/>
      <circle cx="59" cy="69" r="2.8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const CALC = svg(
    `<svg viewBox="0 0 100 72" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="72" fill="#1a0b06"/>
      <ellipse cx="50" cy="70" rx="46" ry="10" fill="#6a240c"/>
      <path d="M50 4 C60 18 74 22 72 40 C82 34 86 48 79 58 C72 69 28 69 21 58 C14 48 18 34 28 40 C26 22 40 18 50 4 Z" fill="#ff4a14"/>
      <path d="M50 16 C57 27 67 30 65 44 C71 42 71 52 67 58 C61 65 39 65 33 58 C29 52 29 42 35 44 C33 30 43 27 50 16 Z" fill="#ff9a1f"/>
      <path d="M50 33 C57 40 61 47 59 55 C56 61 44 61 41 55 C39 47 43 40 50 33 Z" fill="#ffe680"/>
      <ellipse cx="40" cy="43" rx="6.5" ry="8" fill="#ffffff"/>
      <ellipse cx="60" cy="43" rx="6.5" ry="8" fill="#ffffff"/>
      <ellipse cx="41.5" cy="45" rx="3.2" ry="4.4" fill="#1a0b06"/>
      <ellipse cx="58.5" cy="45" rx="3.2" ry="4.4" fill="#1a0b06"/>
      <path d="M40 54 Q50 64 60 54 Q50 59 40 54 Z" fill="#7a1a06"/>
      <rect x="18" y="63" width="64" height="8" rx="3.5" fill="#3a1e0e"/>
      <path d="M30 63 v8 M50 63 v8 M70 63 v8" stroke="#22100a" stroke-width="1.6"/>
    </svg>`,
    { size: 256 },
  );

  const feather = (stops: string, bars: string) =>
    svg(
      `<svg viewBox="0 0 32 80" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0">${stops}</linearGradient></defs>
      <path d="M16 79 C5 64 2 44 5 26 C7 14 12 6 16 1 C20 6 25 14 27 26 C30 44 27 64 16 79 Z" fill="url(#f)"/>
      ${bars}
      <path d="M16 79 L16 6" stroke="#f6e7c4" stroke-width="2.2"/>
      <path d="M16 52 L6 43 M16 40 L27 31 M16 30 L7 21" stroke="#3a180a" stroke-width="1.6"/>
    </svg>`,
      { size: 128 },
    );
  const FEATHER_A = feather(
    `<stop offset="0" stop-color="#f1d9a8"/><stop offset="0.3" stop-color="#d27030"/><stop offset="0.78" stop-color="#7a3416"/><stop offset="1" stop-color="#3a180a"/>`,
    "",
  );
  const FEATHER_B = feather(
    `<stop offset="0" stop-color="#e8d2a2"/><stop offset="0.3" stop-color="#5a2a14"/><stop offset="1" stop-color="#2a140a"/>`,
    `<path d="M6 30 Q16 26 26 30 M5 44 Q16 40 27 44 M7 58 Q16 54 25 58" stroke="#e9cf98" stroke-width="3" fill="none"/>`,
  );

  const star = (cx: number, cy: number, R: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rad = i % 2 ? r : R;
      pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const FLAG = svg(
    `<svg viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 80 H50 V0 L25 16 L0 0 Z" fill="#b8322a"/>
      <rect x="0" y="66" width="50" height="5" fill="#f3e6c4"/>
      <polygon points="${star(25, 40, 12, 5)}" fill="#ffd34a" stroke="#7a1a12" stroke-width="1.5"/>
    </svg>`,
    { size: 128 },
  );
  const PENNANT = svg(
    `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 50 H40 L20 0 Z" fill="#ffffff"/>
      <path d="M0 50 H40 L36.5 41 H3.5 Z" fill="#8a8a8a"/>
      <circle cx="20" cy="28" r="4" fill="#d0d0d0"/>
    </svg>`,
    { size: 96 },
  );
  const SHIRT = svg(
    `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0 50) scale(1 -1)">
        <path d="M10 4 L20 2 Q25 7 30 2 L40 4 L49 14 L42 20 L38 16 L38 48 L12 48 L12 16 L8 20 L1 14 Z" fill="#f3efe4" stroke="#6a6a7a" stroke-width="1.4"/>
        <path d="M17 6 V48 M25 8 V48 M33 6 V48" stroke="#5a7ab8" stroke-width="2"/>
        <g fill="#c8a040"><circle cx="25" cy="16" r="1.4"/><circle cx="25" cy="26" r="1.4"/><circle cx="25" cy="36" r="1.4"/></g>
      </g>
    </svg>`,
    { size: 128 },
  );
  const SOCK = svg(
    `<svg viewBox="0 0 30 50" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0 50) scale(1 -1)">
        <path d="M8 2 H22 V30 Q22 34 26 38 Q30 44 24 47 Q18 49 12 44 L6 36 Q8 33 8 30 Z" fill="#c83a32" stroke="#5a1410" stroke-width="1.4"/>
        <path d="M8 8 H22 M8 14 H22 M8 20 H22" stroke="#f3e6c4" stroke-width="2.6"/>
      </g>
    </svg>`,
    { size: 96 },
  );
  const GAUGE = gaugeTexture({ needle: 72, label: "HEAT" });
  return {
    WALL_A,
    WALL_B,
    CLAP,
    DOOR,
    WIN,
    ARCH,
    PORT,
    EYE,
    CALC,
    FEATHER_A,
    FEATHER_B,
    FLAG,
    PENNANT,
    SHIRT,
    SOCK,
    GAUGE,
  };
}

export default function build() {
  const b = createBuilder({ name: "walking-castle", paintSize: 2048 });
  const T = makeTextures();

  // ------------------------------------------------------------------ palette
  const BRASS = metal("brass", { size: 0.2, tarnish: 0.35 });
  const COPPER = metal("copper", { verdigris: 0.6, size: 0.22 });
  const IRON = metal("iron", { size: 0.2 });
  const STEEL = metal("steel", { size: 0.15 });
  const WOOD_DARK = paint((p, n) => lit(mix("#4a2c18", "#6a4026", noise(p, 0.08, 61)), n));
  const STONE_BASE = paint((p, n) => lit(mix("#8d8578", "#625c54", noise(p, 0.08, 12)), n));
  const ROPE = "#b89a68";
  const TOOTH = "#e8dfc2";
  const CLAW = "#2c2320";
  const SMOKE_A = "#ece7de";
  const SMOKE_B = "#d6d0c6";
  const LAMP = "#ffc455";
  const SLATE = ["#55627a", "#4a566c", "#62708a", "#3f4a5e"];
  const TILE = ["#b4532f", "#c8693a", "#9e4428", "#d27a45"];

  const RUST = paint((p, n) => {
    const m = noise(p, 0.7, 3);
    const f = noise(p, 0.14, 4);
    let c: RGB = mix("#666b78", "#8e5232", smoothstep(0.38, 0.68, m));
    c = mix(c, "#4b5a66", 0.25 * smoothstep(0.5, 0.8, f));
    const drip = noise(new THREE.Vector3(p.x * 2.5, p.y * 0.35, p.z * 2.5), 0.2, 9);
    c = mix(c, "#7c3a1a", 0.55 * smoothstep(0.62, 0.75, drip));
    c = mix(c, "#2a2420", 0.5 * smoothstep(3.5, 2.85, p.y));
    return lit(c, n);
  });
  const HULL = plating(RUST, 0.46, 0.62);
  const IRON_PLATE = plating(IRON, 0.3, 0.6, 0.07, 0.011);
  const LID = plating(COPPER, 0.22, 0.7, 0.06, 0.011);
  const PATCH = plating(COPPER, 0.18, 0.7, 0.05, 0.009);
  const THIGH_MOT = mottle("#6e3418", "#3c1c0e", { size: 0.18, seed: 4 });
  const THIGH = paint((p, n) => lit(resolve(THIGH_MOT, p, n), n));
  const LEG_SKIN = scaly(3.55);
  const TOE_SKIN = scaly(0.9);

  const GABLE = paint((p, n, s) => {
    const k = Math.floor(s[0] / 0.11);
    const f = fract(s[0] / 0.11);
    let c: RGB = mix("#8a5a34", "#b07a48", h1(k));
    c = mix(c, "#5a3a20", 0.3 * noise(p, 0.05, 71));
    if (f < 0.1) c = mix(c, "#2e1c10", 0.8);
    return lit(c, n);
  });
  const PLANKS = paint((p, n) => {
    const w = 0.17;
    const k = Math.floor(p.x / w);
    const f = fract(p.x / w);
    const a = p.z + h1(k) * 1.7;
    const seg = Math.floor(a / 1.2);
    const g = fract(a / 1.2);
    let c: RGB = mix("#6e4a2c", "#9c6d43", h2(k, seg));
    c = mix(c, "#4a2e1a", 0.35 * smoothstep(0.45, 0.8, noise(new THREE.Vector3(p.x * 8, p.y, p.z * 0.7), 0.05, k & 7)));
    if (f < 0.07 || g < 0.012) c = mix(c, "#22140c", 0.8);
    if (Math.abs(n.y) < 0.5) c = mix(c, "#3a2414", 0.4);
    return lit(c, n);
  });
  const BRICK = paint((p, n) => {
    const bh = 0.075;
    const bw = 0.17;
    const r = Math.floor(p.y / bh);
    const hz = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
    const u = hz / bw + (r & 1) * 0.5;
    const fx = fract(u);
    const fy = fract(p.y / bh);
    let c: RGB = mix("#97402a", "#c4603c", h2(Math.floor(u), r));
    if (fx < 0.07 || fy < 0.13) c = mix("#c9bba2", "#8a8070", noise(p, 0.1, 2));
    c = mix(c, "#231c1a", 0.75 * smoothstep(7.0, 7.55, p.y));
    return lit(c, n);
  });
  const BOARDS = paint((p, n) => {
    const r = Math.floor(p.y / 0.11);
    const fy = fract(p.y / 0.11);
    let c: RGB = mix("#6f97ad", "#86aec2", h1(r * 3.1));
    if (noise(p, 0.18, 33) > 0.66) c = mix(c, "#9a7650", 0.8);
    if (fy < 0.14) c = mix(c, "#2f4250", 0.7);
    return lit(c, n);
  });
  const shutterCache = new Map<string, Paint>();
  const shutterPaint = (c: string) => {
    let pnt = shutterCache.get(c);
    if (!pnt) {
      pnt = paint((p, n) =>
        lit(fract(p.y / 0.045) < 0.22 ? mix(c, "#1a1410", 0.45) : mix(c, "#ffffff", 0.1 * noise(p, 0.05, 3)), n),
      );
      shutterCache.set(c, pnt);
    }
    return pnt;
  };

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 3.5, 0], role: "spine" });
  const cabin = b.joint("cabin", { parent: hips, at: [0, 4.95, -0.1], dir: [0, 1, 0], role: "spine" });

  // ------------------------------------------------------------------ hull
  const hull = b.loft(
    [
      { at: [0, 3.95, -1.6], w: 2.3, h: 1.45 },
      { at: [0, 3.9, -1.0], w: 3.0, h: 1.95 },
      { at: [0, 3.9, 0.1], w: 3.3, h: 2.1 },
      { at: [0, 3.95, 1.0], w: 3.0, h: 1.95 },
      { at: [0, 4.0, 1.55], w: 2.5, h: 1.65 },
    ],
    { bone: hips, color: HULL, sides: 8, smooth: false, caps: "flat", name: "hull" },
  );
  const hullSurf = b.surface(hull);
  const hullHit = (o: P3, d: P3) => {
    const h = hullSurf.ray(o, d);
    if (h) return { p: new THREE.Vector3().copy(h.at), n: new THREE.Vector3().copy(h.n) };
    return { p: v3(o[0], o[1], o[2]), n: v3(-d[0], -d[1], -d[2]).normalize() };
  };
  const ez = hullHit([0, 4.0, 4], [0, 0, -1]).p.z;

  // ------------------------------------------------------------------ face: eyes
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ex = s * 0.56;
    const ey = 4.33;
    b.part(new THREE.CylinderGeometry(0.33, 0.37, 0.32, 12), IRON, {
      bone: hips,
      at: [ex, ey, ez + 0.09],
      dir: [0, 0, 1],
      flat: true,
      name: `eyeHousing${S}`,
    });
    b.part(new THREE.TorusGeometry(0.315, 0.05, 6, 18), BRASS, {
      bone: hips,
      at: [ex, ey, ez + 0.25],
      dir: [0, 0, 1],
      axis: "z",
      name: `eyeRim${S}`,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.3, 22), "#ffffff", {
        bone: hips,
        at: [ex, ey, ez + 0.258],
        dir: [0, 0, 1],
        axis: "z",
        texture: T.EYE,
        name: `eyeLens${S}`,
      }),
      1.4,
    );
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, {
        bone: hips,
        at: [ex + 0.355 * Math.cos(a), ey + 0.355 * Math.sin(a), ez + 0.18],
      });
    }
    // heavy riveted lid: half-closed, slanting down toward the middle
    const e = (x: number) => 0.12 + (0.05 * (s * x)) / 0.42;
    const lid: OP[] = [
      sh(-0.42, e(-0.42)),
      sh(0, e(0)),
      sh(0.42, e(0.42)),
      sh(0.42, e(0.42) + 0.06),
      [0.22, 0.4],
      [0, 0.47],
      [-0.22, 0.4],
      sh(-0.42, e(-0.42) + 0.06),
    ];
    b.extrude(lid, {
      at: [ex, ey, ez + 0.12],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.38,
      bevel: 0.02,
      smoothing: 2,
      color: LID,
      bone: hips,
      name: `lid${S}`,
    });
    for (const x of [-0.32, -0.16, 0, 0.16, 0.32])
      b.part(new THREE.SphereGeometry(0.026, 6, 4), BRASS, { bone: hips, at: [ex + x, ey + e(x) + 0.035, ez + 0.31] });
  }

  // nose: a brass speaking-horn between the eyes
  b.lathe(
    [
      [0, 0],
      [0.08, 0],
      [0.08, 0.12],
      [0.16, 0.27],
      [0.135, 0.28],
      [0.06, 0.15],
      [0, 0.15],
    ],
    { at: [0, 4.12, ez - 0.02], axis: [0, 0, 1], segments: 10, color: BRASS, bone: hips, name: "noseHorn" },
  );
  b.part(new THREE.CircleGeometry(0.062, 10), "#1a0f0a", {
    bone: hips,
    at: [0, 4.12, ez + 0.133],
    dir: [0, 0, 1],
    axis: "z",
  });

  // ------------------------------------------------------------------ face: mouth with the fire demon inside
  b.part(new THREE.BoxGeometry(1.46, 0.42, 0.1), "#1c0e09", { bone: hips, at: [0, 3.58, ez], name: "mouthCavity" });
  glow(
    b.part(new THREE.PlaneGeometry(0.62, 0.45), "#ffffff", {
      bone: hips,
      at: [0, 3.57, ez + 0.056],
      dir: [0, 0, 1],
      axis: "z",
      texture: T.CALC,
      name: "calcifer",
    }),
    1.6,
  );
  b.part(new THREE.BoxGeometry(1.72, 0.2, 0.34), IRON_PLATE, { bone: hips, at: [0, 3.86, ez + 0.1], name: "upperLip" });
  b.rod([-0.86, 3.96, ez + 0.27], [0.86, 3.96, ez + 0.27], 0.035, { bone: hips, color: BRASS });
  [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].forEach((x, i) =>
    b.spike([x, 3.78, ez + 0.19], [0, -1, 0.12], i % 2 ? 0.13 : 0.19, 0.055, {
      bone: hips,
      color: TOOTH,
      section: { ngon: 4 },
    }),
  );
  const jaw = b.joint("jaw", { parent: hips, at: [0, 3.36, ez - 0.25], aim: [0, 3.34, ez + 0.4], role: "jaw" });
  b.frustumBox([0, 3.33, ez - 0.22], [0, 3.31, ez + 0.32], [1.62, 0.22], [1.46, 0.2], {
    bone: jaw,
    color: IRON_PLATE,
    name: "jawPlate",
  });
  b.rod([-0.72, 3.3, ez + 0.33], [0.72, 3.3, ez + 0.33], 0.045, { bone: jaw, color: BRASS });
  [-0.5, -0.25, 0, 0.25, 0.5].forEach((x, i) =>
    b.spike([x, 3.41, ez + 0.21], [0, 1, 0.1], i % 2 ? 0.1 : 0.14, 0.05, {
      bone: jaw,
      color: TOOTH,
      section: { ngon: 4 },
    }),
  );
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), BRASS, {
      bone: jaw,
      at: [s * 0.78, 3.34, ez - 0.05],
      dir: [1, 0, 0],
      flat: true,
    });
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // ------------------------------------------------------------------ chicken legs
  const LEG_L = [1.15, 1.35, 1.05];
  const LEG_LEN = LEG_L[0] + LEG_L[1] + LEG_L[2];
  const tKnee = LEG_L[0] / LEG_LEN;
  const tHock = (LEG_L[0] + LEG_L[1]) / LEG_LEN;
  const TOES = [
    { yaw: -34, len: 0.72, n: "In" },
    { yaw: 0, len: 0.86, n: "Mid" },
    { yaw: 34, len: 0.72, n: "Out" },
    { yaw: 180, len: 0.42, n: "Back" },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP = v3(s * 0.82, 3.25, -0.15);
    const footP = v3(s * 1.08, 0.14, 0.32);
    const pts = limb(hipP, footP, LEG_L, [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [footP.x, 0, footP.z],
    });
    const thigh = b.sweep(leg, [0.4, 0.47, 0.42, 0.28], {
      from: 0,
      to: tKnee + 0.02,
      color: THIGH,
      sides: 10,
      name: `thigh${S}`,
    });
    b.sweep(
      leg,
      (t: number) => (t < tHock ? 0.17 - 0.05 * smoothstep(tKnee, tHock, t) : 0.125 - 0.035 * smoothstep(tHock, 1, t)),
      { from: tKnee - 0.02, to: 1, color: LEG_SKIN, sides: 8, name: `shank${S}` },
    );

    // brass hock joint with an axle bolt
    const kneeP = pts[1];
    const hockP = pts[2];
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.32, 10), BRASS, {
      bone: leg.joints[2],
      at: hockP,
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), IRON, { bone: leg.joints[2], at: hockP, dir: [1, 0, 0] });

    // hydraulic piston on the back of the shin
    const sd = hockP.clone().sub(kneeP).normalize();
    const back = v3(0, -sd.z, sd.y);
    if (back.z > 0) back.negate();
    const pA = kneeP.clone().addScaledVector(sd, 0.3).addScaledVector(back, 0.24);
    const pB = hockP.clone().addScaledVector(sd, -0.14).addScaledVector(back, 0.22);
    const pM = pA.clone().lerp(pB, 0.55);
    b.rod(pA, pM, 0.055, { bone: leg.joints[1], color: IRON, sides: 8 });
    b.rod(pM.clone().addScaledVector(sd, -0.02), pB, 0.028, { bone: leg.joints[1], color: STEEL, sides: 6 });
    b.rod(kneeP.clone().addScaledVector(sd, 0.3), pA, 0.032, { bone: leg.joints[1], color: IRON, sides: 6 });
    b.rod(hockP.clone().addScaledVector(sd, -0.14), pB, 0.032, { bone: leg.joints[1], color: IRON, sides: 6 });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), BRASS, { bone: leg.joints[1], at: pA });

    // brass cuffs and a rooster spur on the tarsus
    for (const f of [0.28, 0.5]) {
      const t = tHock + (1 - tHock) * f;
      b.rod(leg.at(t), leg.at(t + 0.014).at, 0.138, { color: BRASS, sides: 10 });
    }
    const spP = leg.at(tHock + (1 - tHock) * 0.64);
    b.spike(spP.at.clone().add(v3(0, 0, -0.08)), [s * 0.15, -0.35, -1], 0.24, 0.05, {
      bone: leg.joints[2],
      color: CLAW,
    });

    // foot pad and toes
    const footJ = leg.tip!;
    b.part(new THREE.SphereGeometry(0.18, 8, 6), TOE_SKIN, {
      bone: footJ,
      at: footP,
      scale: [1.1, 0.78, 1.15],
      flat: true,
    });
    for (const toe of TOES) {
      const ya = (toe.yaw === 180 ? 180 - s * 12 : toe.yaw * s + s * 5) * DEG;
      const d = v3(Math.sin(ya), 0, Math.cos(ya));
      const at = (k: number, y: number) => v3(footP.x + d.x * k, y, footP.z + d.z * k);
      const toePath = catmull([at(0.06, 0.13), at(toe.len * 0.45, 0.15), at(toe.len, 0.075)]);
      const tc = b.chain(`toe${toe.n}${S}`, toePath, {
        parent: footJ,
        names: [`toe${toe.n}${S}1`, `toe${toe.n}${S}2`, `toe${toe.n}${S}3`],
        role: "digit",
      });
      b.sweep(tc, [0.088, 0.072, 0.05], { color: TOE_SKIN, sides: 8 });
      b.sweep(bezier(at(toe.len, 0.075), at(toe.len + 0.1, 0.08), at(toe.len + 0.18, 0.006)), [0.048, 0.004], {
        bone: tc.tip!,
        color: CLAW,
        caps: { start: "flat", end: "point" },
        sides: 6,
      });
    }

    // feathered drumstick
    const fHits = b
      .surface(thigh)
      .scatter(70, { rng: rng(20 + s), minDist: 0.1, filter: (h) => h.at.y < 3.05 });
    b.cards(fHits, [T.FEATHER_A, T.FEATHER_A, T.FEATHER_B], {
      size: [0.17, 0.36],
      lean: 62,
      bend: 28,
      vary: 0.25,
      rng: rng(30 + s),
      flow: [0, -1, -0.25],
    });
  }

  // feathered skirt under the hull
  const skirt = hullSurf.scatter(110, {
    rng: rng(41),
    minDist: 0.17,
    filter: (h) => h.n.y < -0.45 && h.at.z < 1.0,
  });
  b.cards(skirt, [T.FEATHER_A, T.FEATHER_B, T.FEATHER_A], {
    size: [0.2, 0.42],
    lean: 25,
    bend: 20,
    vary: 0.3,
    rng: rng(42),
    flow: [0, 0, -1],
  });

  // ------------------------------------------------------------------ hull fittings
  const lowBand = hullSurf.loop([0, 3.12, 0], { dir: [0, 1, 0] });
  b.sweep(lowBand, 0.05, { bone: hips, color: BRASS, sides: 6, name: "beltBand" });
  b.along(hullSurf.loop([0, 3.12, 0], { dir: [0, 1, 0], lift: 0.045 }), 22, (pt) =>
    b.part(new THREE.SphereGeometry(0.04, 6, 4), IRON, { bone: hips, at: pt.at }),
  );
  for (const z of [-0.55, 0.62]) {
    b.sweep(hullSurf.loop([0, 3.9, z], { dir: [0, 0, 1] }), 0.045, { bone: hips, color: IRON, sides: 6 });
    b.along(hullSurf.loop([0, 3.9, z], { dir: [0, 0, 1], lift: 0.04 }), 16, (pt) =>
      b.part(new THREE.SphereGeometry(0.035, 6, 4), BRASS, { bone: hips, at: pt.at }),
    );
  }

  const porthole = (p: THREE.Vector3, n: THREE.Vector3, r: number, bone: typeof hips) => {
    const c = p.clone().addScaledVector(n, 0.03);
    glow(b.part(new THREE.CircleGeometry(r, 16), "#ffffff", { bone, at: c, dir: n, axis: "z", texture: T.PORT }), 1.1);
    b.part(new THREE.TorusGeometry(r, r * 0.2, 6, 16), BRASS, { bone, at: c, dir: n, axis: "z" });
  };
  const avoid: THREE.Vector3[] = [];
  for (const s of [1, -1])
    for (const z of [-0.8, 0.0]) {
      const h = hullHit([s * 4, 3.95, z], [-s, 0, 0]);
      porthole(h.p, h.n, 0.19, hips);
      avoid.push(h.p);
      const up = v3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(h.n, up).normalize();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const q = h.p
          .clone()
          .addScaledVector(side, Math.cos(a) * 0.27)
          .addScaledVector(up, Math.sin(a) * 0.27)
          .addScaledVector(h.n, 0.02);
        b.part(new THREE.SphereGeometry(0.028, 6, 4), IRON, { bone: hips, at: q });
      }
    }

  // heat gauge on the left flank
  const gh = hullHit([4, 3.95, 0.8], [-1, 0, 0]);
  avoid.push(gh.p);
  b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 14), BRASS, {
    bone: hips,
    at: gh.p.clone().addScaledVector(gh.n, 0.03),
    dir: gh.n,
  });
  b.part(new THREE.CircleGeometry(0.17, 18), "#ffffff", {
    bone: hips,
    at: gh.p.clone().addScaledVector(gh.n, 0.073),
    dir: gh.n,
    axis: "z",
    texture: T.GAUGE,
  });
  b.sweep(
    bezier(gh.p.clone().add(v3(0, -0.2, 0)), gh.p.clone().add(v3(0.12, -0.3, -0.05)), gh.p.clone().add(v3(0.02, -0.45, -0.2))),
    0.025,
    { bone: hips, color: COPPER, sides: 6 },
  );

  // clockwork on the right flank
  const gr = hullHit([-4, 3.95, 0.75], [1, 0, 0]);
  avoid.push(gr.p);
  gearTrain(b, {
    at: gr.p.clone().addScaledVector(gr.n, 0.05),
    axis: gr.n,
    module: 0.018,
    style: "flat",
    bone: hips,
    gears: [
      { teeth: 16, spokes: 4 },
      { teeth: 10, angle: 125 },
      { teeth: 12, from: 0, angle: -115 },
    ],
  });

  // patchwork plates
  const patchHits = hullSurf.scatter(12, {
    rng: rng(51),
    minDist: 0.7,
    filter: (h) =>
      Math.abs(h.n.y) < 0.55 && h.at.z < 1.25 && h.at.z > -1.45 && avoid.every((a) => a.distanceTo(h.at) > 0.5),
  });
  const pr = rng(52);
  patchHits.forEach((h, i) =>
    b.stick(new THREE.BoxGeometry(0.34 + 0.2 * pr(), 0.03, 0.26 + 0.12 * pr()), i % 3 === 0 ? IRON_PLATE : PATCH, h, {
      spin: pr() * 40 - 20,
      embed: 0.4,
    }),
  );

  // side cannons
  for (const s of [1, -1]) {
    const m = hullHit([s * 4, 4.5, 0.45], [-s, 0, 0]);
    b.part(new THREE.SphereGeometry(0.24, 10, 6), IRON, { bone: hips, at: m.p, flat: true });
    const dir = v3(s * 0.82, 0.12, 0.56).normalize();
    const base = m.p.clone().addScaledVector(dir, 0.1);
    const tip = m.p.clone().addScaledVector(dir, 0.85);
    b.rod(base, tip, [0.1, 0.08], { bone: hips, color: IRON, sides: 10 });
    for (const f of [0.4, 0.97])
      b.rod(m.p.clone().addScaledVector(dir, f * 0.85 - 0.03), m.p.clone().addScaledVector(dir, f * 0.85 + 0.03), 0.112, {
        bone: hips,
        color: BRASS,
        sides: 10,
      });
    b.part(new THREE.CircleGeometry(0.058, 10), "#120a06", {
      bone: hips,
      at: tip.clone().addScaledVector(dir, 0.006),
      dir,
      axis: "z",
    });
  }

  // rear hatch with a valve wheel
  const rh = hullHit([0, 3.95, -4], [0, 0, 1]);
  b.part(new THREE.CylinderGeometry(0.45, 0.48, 0.06, 14), IRON_PLATE, {
    bone: hips,
    at: rh.p.clone().addScaledVector(rh.n, 0.02),
    dir: rh.n,
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.47, 0.045, 6, 18), BRASS, {
    bone: hips,
    at: rh.p.clone().addScaledVector(rh.n, 0.05),
    dir: rh.n,
    axis: "z",
  });
  const wheelC = rh.p.clone().addScaledVector(rh.n, 0.14);
  b.part(new THREE.TorusGeometry(0.2, 0.025, 5, 14), STEEL, { bone: hips, at: wheelC, dir: rh.n, axis: "z" });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    b.rod(wheelC, wheelC.clone().add(v3(0.2 * Math.cos(a), 0.2 * Math.sin(a), 0)), 0.016, {
      bone: hips,
      color: STEEL,
      sides: 5,
    });
  }
  b.rod(rh.p, wheelC, 0.04, { bone: hips, color: IRON, sides: 6 });

  // rope ladder under the stern
  const ladderTop: THREE.Vector3[] = [];
  for (const lx of [-0.24, 0.24]) {
    const top = hullHit([lx, 1, -1.3], [0, 1, 0]);
    ladderTop.push(top.p);
    b.sweep(catmull([top.p, v3(lx * 1.04, 2.2, -1.33), v3(lx * 1.08, 1.32, -1.3)]), 0.02, {
      bone: hips,
      color: ROPE,
      sides: 5,
    });
  }
  for (let y = 1.42; y < Math.min(ladderTop[0].y, ladderTop[1].y) - 0.15; y += 0.28)
    b.rod([-0.27, y, -1.315], [0.27, y, -1.315], 0.024, { bone: hips, color: WOOD_DARK, sides: 5 });

  // rear smokestacks
  for (const s of [1, -1]) {
    const a = v3(s * 0.55, 4.5, -1.3);
    const top = v3(s * 0.72, 6.1, -2.05);
    const dir = top.clone().sub(a).normalize();
    b.rod(a, top, 0.13, { bone: hips, color: IRON, sides: 8 });
    b.rod(a.clone().lerp(top, 0.55), a.clone().lerp(top, 0.6), 0.155, { bone: hips, color: COPPER, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.22, 0.13, 0.26, 10), BRASS, {
      bone: hips,
      at: top.clone().addScaledVector(dir, 0.1),
      dir,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 10), "#1e1814", {
      bone: hips,
      at: top.clone().addScaledVector(dir, 0.235),
      dir,
    });
    const puffs: [number, number, number, number][] = [
      [0.02, 0.45, -0.25, 0.2],
      [0.06, 0.82, -0.6, 0.27],
    ];
    puffs.forEach(([dx, dy, dz, r], i) =>
      b.part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? SMOKE_B : SMOKE_A, {
        bone: hips,
        at: [top.x + s * dx, top.y + dy, top.z + dz],
        flat: true,
        rotation: [i * 37, s * 50, 0],
      }),
    );
  }

  // ------------------------------------------------------------------ deck
  b.part(new THREE.BoxGeometry(3.0, 0.14, 3.15), PLANKS, { bone: cabin, at: [0, 4.93, -0.07], name: "deck" });
  for (const s of [1, -1])
    for (const z of [-1.15, -0.4, 0.4, 1.1]) {
      const top = v3(s * 1.43, 4.87, z);
      const bot = hullHit([s * 1.12, 4.85, z], [0, -1, 0]).p;
      b.rod(bot, top, 0.045, { bone: cabin, color: WOOD_DARK, sides: 4 });
    }

  // railing along the front and left edge
  const rail: P3[] = [
    [-0.1, 5.0, 1.46],
    [0.45, 5.0, 1.46],
    [1.0, 5.0, 1.46],
    [1.46, 5.0, 1.46],
    [1.46, 5.0, 0.95],
    [1.46, 5.0, 0.45],
    [1.46, 5.0, -0.05],
    [1.46, 5.0, -0.35],
  ];
  rail.forEach((p, i) => {
    if (i !== 3) b.rod(p, [p[0], 5.3, p[2]], 0.025, { bone: cabin, color: WOOD_DARK, sides: 4 });
  });
  b.sweep(
    rail.map((p) => [p[0], 5.3, p[2]]),
    0.022,
    { bone: cabin, color: WOOD_DARK, sides: 5 },
  );
  b.sweep(
    rail.map((p) => [p[0], 5.15, p[2]]),
    0.015,
    { bone: cabin, color: WOOD_DARK, sides: 5 },
  );

  // ------------------------------------------------------------------ houses
  const yawPt = (c: P3, yaw: number, x: number, y: number, z: number): P3 => {
    const cs = Math.cos(yaw * DEG);
    const sn = Math.sin(yaw * DEG);
    return [c[0] + x * cs + z * sn, c[1] + y, c[2] - x * sn + z * cs];
  };
  const yawDir = (yaw: number, x: number, z: number): P3 => {
    const cs = Math.cos(yaw * DEG);
    const sn = Math.sin(yaw * DEG);
    return [x * cs + z * sn, 0, -x * sn + z * cs];
  };

  const windowAt = (
    at: THREE.Vector3,
    rotY: number,
    o: { arch?: boolean; shutter?: string | null; flowers?: boolean; scale?: number },
  ) => {
    const k = o.scale ?? 1;
    const ww = 0.27 * k;
    const wh = (o.arch ? 0.38 : 0.33) * k;
    const nrm = v3(Math.sin(rotY * DEG), 0, Math.cos(rotY * DEG));
    const lat = v3(Math.cos(rotY * DEG), 0, -Math.sin(rotY * DEG));
    const off = (dx: number, dy: number, dz: number) =>
      at.clone().addScaledVector(lat, dx).add(v3(0, dy, 0)).addScaledVector(nrm, dz);
    glow(
      b.part(new THREE.PlaneGeometry(ww, wh), "#ffffff", {
        bone: cabin,
        at: off(0, 0, 0.004),
        dir: nrm,
        axis: "z",
        texture: o.arch ? T.ARCH : T.WIN,
      }),
      1.05,
    );
    b.part(new THREE.BoxGeometry(ww + 0.1 * k, 0.045 * k, 0.09 * k), WOOD_DARK, {
      bone: cabin,
      at: off(0, -wh / 2 - 0.02 * k, 0.035 * k),
      rotation: [0, rotY, 0],
    });
    if (!o.arch)
      b.part(new THREE.BoxGeometry(ww + 0.07 * k, 0.05 * k, 0.06 * k), WOOD_DARK, {
        bone: cabin,
        at: off(0, wh / 2 + 0.022 * k, 0.02 * k),
        rotation: [0, rotY, 0],
      });
    if (o.shutter)
      for (const sd of [1, -1])
        b.part(new THREE.BoxGeometry(ww * 0.52, wh, 0.025), shutterPaint(o.shutter), {
          bone: cabin,
          at: off(sd * (ww / 2 + ww * 0.29), 0, 0.012),
          rotation: [0, rotY, 0],
        });
    if (o.flowers) {
      b.part(new THREE.BoxGeometry(ww + 0.06, 0.08, 0.1), "#7a4a2a", {
        bone: cabin,
        at: off(0, -wh / 2 - 0.08, 0.07),
        rotation: [0, rotY, 0],
      });
      b.part(new THREE.IcosahedronGeometry(0.06, 0), "#4f7a2e", {
        bone: cabin,
        at: off(0, -wh / 2 - 0.02, 0.07),
        scale: [2.2, 0.8, 0.9],
        flat: true,
      });
      ["#e8445a", "#ffd34a", "#f28ac0", "#e8445a"].forEach((c, i) =>
        b.part(new THREE.IcosahedronGeometry(0.026, 0), c, {
          bone: cabin,
          at: off((i - 1.5) * ww * 0.3, -wh / 2 + 0.02, 0.09),
          flat: true,
        }),
      );
    }
  };

  type Win = { face: "front" | "back" | "left" | "right"; u: number; v: number; arch?: boolean; flowers?: boolean };
  type HouseSpec = {
    c: P3;
    yaw: number;
    w: number;
    h: number;
    d: number;
    roofH: number;
    wall: THREE.Texture;
    roof: "slate" | "tile";
    shutter: string | null;
    windows: Win[];
    plinth?: boolean;
    attic?: boolean;
  };
  const house = (o: HouseSpec) => {
    const P = (x: number, y: number, z: number) => yawPt(o.c, o.yaw, x, y, z);
    b.part(new THREE.BoxGeometry(o.w, o.h, o.d), "#ffffff", {
      bone: cabin,
      at: P(0, o.h / 2, 0),
      rotation: [0, o.yaw, 0],
      texture: o.wall,
    });
    if (o.plinth !== false)
      b.part(new THREE.BoxGeometry(o.w + 0.06, 0.16, o.d + 0.06), STONE_BASE, {
        bone: cabin,
        at: P(0, 0.06, 0),
        rotation: [0, o.yaw, 0],
      });
    b.part(new THREE.BoxGeometry(o.w + 0.08, 0.08, o.d + 0.08), WOOD_DARK, {
      bone: cabin,
      at: P(0, o.h - 0.02, 0),
      rotation: [0, o.yaw, 0],
    });
    const W = o.w / 2 + 0.16;
    const xDir = yawDir(o.yaw, 1, 0);
    const thick = new THREE.Vector3(...yawDir(o.yaw, 0, 1));
    const roofPaint = shingles(
      o.roof === "slate" ? SLATE : TILE,
      o.roof === "slate" ? "#262a36" : "#4a1c12",
      (p) => p.dot(thick),
      o.roof === "slate",
      GABLE,
      thick,
    );
    const depth = o.d + 0.12;
    const roofOutline: OP[] = [sh(-W, -0.05), sh(W, -0.05), sh(W, 0.03), sh(0, o.roofH), sh(-W, 0.03)];
    b.extrude(roofOutline, {
      at: P(0, o.h + 0.02, 0),
      x: xDir,
      y: [0, 1, 0],
      thickness: depth,
      color: roofPaint,
      bone: cabin,
    });
    const ridgeY = o.h + 0.02 + o.roofH;
    b.rod(P(0, ridgeY, -depth / 2 - 0.03), P(0, ridgeY, depth / 2 + 0.03), 0.045, {
      bone: cabin,
      color: WOOD_DARK,
      sides: 5,
    });
    for (const zz of [1, -1])
      for (const sx of [1, -1])
        b.rod(P(sx * W, o.h + 0.03, (zz * depth) / 2 + zz * 0.02), P(0, ridgeY + 0.02, (zz * depth) / 2 + zz * 0.02), 0.03, {
          bone: cabin,
          color: WOOD_DARK,
          sides: 4,
        });
    b.spike(P(0, ridgeY + 0.03, depth / 2 + 0.03), [0, 1, 0], 0.22, 0.035, { bone: cabin, color: BRASS });
    if (o.attic !== false) {
      const r = Math.min(0.11, o.roofH * 0.22);
      const ac = new THREE.Vector3(...P(0, o.h + 0.02 + o.roofH * 0.36, depth / 2 + 0.012));
      const n = new THREE.Vector3(...yawDir(o.yaw, 0, 1));
      glow(b.part(new THREE.CircleGeometry(r, 14), "#ffffff", { bone: cabin, at: ac, dir: n, axis: "z", texture: T.PORT }), 1.1);
      b.part(new THREE.TorusGeometry(r, r * 0.22, 5, 14), WOOD_DARK, { bone: cabin, at: ac, dir: n, axis: "z" });
    }
    for (const w of o.windows) {
      const e = 0.012;
      let lp: P3;
      let rot: number;
      if (w.face === "front") {
        lp = [w.u, w.v, o.d / 2 + e];
        rot = o.yaw;
      } else if (w.face === "back") {
        lp = [-w.u, w.v, -o.d / 2 - e];
        rot = o.yaw + 180;
      } else if (w.face === "left") {
        lp = [o.w / 2 + e, w.v, w.u];
        rot = o.yaw + 90;
      } else {
        lp = [-o.w / 2 - e, w.v, w.u];
        rot = o.yaw - 90;
      }
      windowAt(new THREE.Vector3(...P(lp[0], lp[1], lp[2])), rot, {
        arch: w.arch,
        shutter: o.shutter,
        flowers: w.flowers,
      });
    }
    return { P, ridgeY };
  };

  const DECK_Y = 4.99;
  // H1: the main timber house
  const H1 = house({
    c: [-0.15, DECK_Y, -0.25],
    yaw: 0,
    w: 1.7,
    h: 1.15,
    d: 1.6,
    roofH: 0.85,
    wall: T.WALL_A,
    roof: "slate",
    shutter: "#3f6f8f",
    windows: [
      { face: "left", u: 0.2, v: 0.62, arch: true },
      { face: "right", u: 0.25, v: 0.62 },
      { face: "back", u: -0.15, v: 0.62 },
    ],
  });
  // door, step and lamp on H1
  b.part(new THREE.PlaneGeometry(0.47, 0.75), "#ffffff", {
    bone: cabin,
    at: [-0.33, DECK_Y + 0.08 + 0.375, 0.556],
    dir: [0, 0, 1],
    axis: "z",
    texture: T.DOOR,
  });
  b.part(new THREE.BoxGeometry(0.6, 0.08, 0.25), STONE_BASE, { bone: cabin, at: [-0.33, DECK_Y + 0.04, 0.68] });

  // H2: little teal cottage at the front
  const H2 = house({
    c: [0.55, DECK_Y, 0.95],
    yaw: 12,
    w: 1.0,
    h: 0.75,
    d: 0.8,
    roofH: 0.5,
    wall: T.CLAP,
    roof: "tile",
    shutter: "#c9a24a",
    windows: [
      { face: "front", u: 0, v: 0.42, flowers: true },
      { face: "left", u: 0.0, v: 0.42 },
      { face: "right", u: 0.12, v: 0.42 },
    ],
  });

  // H3: tall back house
  house({
    c: [-0.9, DECK_Y, -1.0],
    yaw: -10,
    w: 1.0,
    h: 1.55,
    d: 0.95,
    roofH: 0.6,
    wall: T.WALL_B,
    roof: "slate",
    shutter: "#8a3a2a",
    windows: [
      { face: "right", u: 0, v: 0.45 },
      { face: "right", u: 0, v: 1.12, arch: true, flowers: true },
      { face: "back", u: 0, v: 0.45 },
      { face: "back", u: 0, v: 1.12 },
    ],
  });

  // dormer perched on H1's left roof slope
  house({
    c: [0.3, 6.25, -0.05],
    yaw: 90,
    w: 0.55,
    h: 0.5,
    d: 0.55,
    roofH: 0.32,
    wall: T.WALL_A,
    roof: "tile",
    shutter: null,
    plinth: false,
    attic: false,
    windows: [{ face: "front", u: 0, v: 0.28 }],
  });

  // ------------------------------------------------------------------ lanterns
  const lantern = (top: THREE.Vector3, bone: typeof hips) => {
    const at = (dy: number) => top.clone().add(v3(0, dy, 0));
    b.rod(top, at(-0.15), 0.012, { bone, color: IRON, sides: 4 });
    b.part(new THREE.TorusGeometry(0.035, 0.009, 4, 8), IRON, { bone, at: at(-0.18) });
    b.part(new THREE.ConeGeometry(0.12, 0.1, 6), IRON, { bone, at: at(-0.26), flat: true });
    glow(b.part(new THREE.BoxGeometry(0.14, 0.18, 0.14), LAMP, { bone, at: at(-0.4) }), 1.6);
    b.part(new THREE.BoxGeometry(0.17, 0.035, 0.17), IRON, { bone, at: at(-0.505) });
  };
  lantern(v3(-0.33, 6.12, 0.7), cabin);
  b.rod([-0.33, 6.12, 0.56], [-0.33, 6.12, 0.72], 0.014, { bone: cabin, color: IRON, sides: 4 });
  for (const s of [1, -1]) lantern(v3(s * 1.38, 4.86, 1.38), cabin);

  // ------------------------------------------------------------------ tower T1: stone spire
  const T1 = { x: 0.88, z: -0.88, rt: 0.44, rb: 0.475, h: 2.35 };
  const t1Top = DECK_Y + T1.h;
  b.part(new THREE.CylinderGeometry(T1.rt, T1.rb, T1.h, 10), ashlar(T1.x, T1.z, 0.45), {
    bone: cabin,
    at: [T1.x, DECK_Y + T1.h / 2, T1.z],
    flat: true,
    name: "spireTower",
  });
  b.part(new THREE.CylinderGeometry(T1.rt + 0.09, T1.rt + 0.02, 0.18, 10), WOOD_DARK, {
    bone: cabin,
    at: [T1.x, t1Top - 0.05, T1.z],
    flat: true,
  });
  const coneSlate = shingles(
    SLATE,
    "#262a36",
    (p) => Math.atan2(p.x - T1.x, p.z - T1.z) * 0.45,
    true,
    null,
    null,
  );
  b.part(new THREE.ConeGeometry(0.64, 1.15, 10), coneSlate, {
    bone: cabin,
    at: [T1.x, t1Top + 0.04 + 0.575, T1.z],
    flat: true,
    name: "spireRoof",
  });
  const towerWin = (
    tw: { x: number; z: number; rt: number; rb: number; h: number },
    ang: number,
    y: number,
    arch: boolean,
    scale: number,
  ) => {
    const r = tw.rb + ((tw.rt - tw.rb) * y) / tw.h;
    const dist = r * Math.cos(18 * DEG);
    const a = ang * DEG;
    windowAt(v3(tw.x + dist * Math.sin(a), DECK_Y + y, tw.z + dist * Math.cos(a)), ang, { arch, shutter: null, scale });
  };
  towerWin(T1, 18, 1.0, false, 0.78);
  towerWin(T1, 90, 1.0, false, 0.78);
  towerWin(T1, 162, 1.0, false, 0.78);
  towerWin(T1, 18, 1.85, true, 0.75);
  towerWin(T1, 90, 1.85, true, 0.75);
  towerWin(T1, 198, 1.85, true, 0.75);
  const coneTip = t1Top + 0.04 + 1.15;
  b.rod([T1.x, coneTip - 0.1, T1.z], [T1.x, coneTip + 0.65, T1.z], 0.025, { bone: cabin, color: IRON, sides: 5 });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BRASS, { bone: cabin, at: [T1.x, coneTip + 0.68, T1.z] });
  b.cards([frame([T1.x, coneTip + 0.42, T1.z], [0, 0, -1])], T.FLAG, {
    size: [0.36, 0.62],
    flow: [1, 0, 0],
    bend: 25,
    bone: cabin,
  });

  // ------------------------------------------------------------------ tower T2: onion turret with telescope
  const T2 = { x: -0.98, z: 0.86, rt: 0.32, rb: 0.34, h: 1.3 };
  const t2Top = DECK_Y + T2.h;
  b.part(new THREE.CylinderGeometry(T2.rt, T2.rb, T2.h, 10), BOARDS, {
    bone: cabin,
    at: [T2.x, DECK_Y + T2.h / 2, T2.z],
    flat: true,
    name: "turret",
  });
  b.part(new THREE.CylinderGeometry(T2.rt + 0.07, T2.rt + 0.07, 0.1, 10), BRASS, {
    bone: cabin,
    at: [T2.x, t2Top, T2.z],
    flat: true,
  });
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.41, 0.1],
      [0.37, 0.26],
      [0.22, 0.42],
      [0.08, 0.56],
      [0.03, 0.68],
      [0, 0.7],
    ],
    { at: [T2.x, t2Top + 0.04, T2.z], segments: 10, smoothing: 1, color: COPPER, bone: cabin, name: "onionDome" },
  );
  b.spike([T2.x, t2Top + 0.72, T2.z], [0, 1, 0], 0.3, 0.03, { bone: cabin, color: BRASS });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), BRASS, { bone: cabin, at: [T2.x, t2Top + 0.8, T2.z] });
  for (const ang of [342, 18, 270]) {
    const a = ang * DEG;
    const d = T2.rt * Math.cos(18 * DEG) + 0.01;
    const c = v3(T2.x + d * Math.sin(a), DECK_Y + 0.8, T2.z + d * Math.cos(a));
    porthole(c, v3(Math.sin(a), 0, Math.cos(a)), 0.075, cabin);
  }
  {
    const base = v3(T2.x - 0.15, 5.95, T2.z + 0.26);
    const dir = v3(-0.45, 0.45, 0.77).normalize();
    const segs: [number, number, number][] = [
      [0, 0.32, 0.07],
      [0.3, 0.56, 0.055],
      [0.54, 0.76, 0.044],
    ];
    for (const [a0, a1, r] of segs) {
      b.rod(base.clone().addScaledVector(dir, a0), base.clone().addScaledVector(dir, a1), r, {
        bone: cabin,
        color: BRASS,
        sides: 8,
      });
      b.rod(base.clone().addScaledVector(dir, a1 - 0.03), base.clone().addScaledVector(dir, a1), r + 0.012, {
        bone: cabin,
        color: COPPER,
        sides: 8,
      });
    }
    glow(
      b.part(new THREE.CircleGeometry(0.04, 10), "#9fe0ff", {
        bone: cabin,
        at: base.clone().addScaledVector(dir, 0.762),
        dir,
        axis: "z",
      }),
      1.2,
    );
  }

  // ------------------------------------------------------------------ chimneys and smoke
  b.part(new THREE.BoxGeometry(0.34, 1.2, 0.34), BRICK, { bone: cabin, at: [-0.6, 6.9, -0.45], name: "chimney" });
  b.part(new THREE.BoxGeometry(0.46, 0.08, 0.46), STONE_BASE, { bone: cabin, at: [-0.6, 7.52, -0.45] });
  for (const dx of [-0.07, 0.08])
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 8), "#b4532f", {
      bone: cabin,
      at: [-0.6 + dx, 7.66, -0.45],
      flat: true,
    });
  const smoke: [number, number, number, number][] = [
    [-0.6, 7.95, -0.5, 0.17],
    [-0.65, 8.25, -0.72, 0.23],
    [-0.74, 8.6, -1.05, 0.3],
    [-0.86, 8.95, -1.48, 0.35],
  ];
  smoke.forEach(([x, y, z, r], i) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? SMOKE_B : SMOKE_A, {
      bone: cabin,
      at: [x, y, z],
      flat: true,
      rotation: [i * 41, i * 73, i * 19],
    }),
  );
  // stovepipe on H3
  b.rod([-1.0, 6.8, -1.15], [-1.0, 7.85, -1.15], 0.08, { bone: cabin, color: IRON, sides: 8 });
  b.rod([-1.0, 7.3, -1.15], [-1.0, 7.36, -1.15], 0.095, { bone: cabin, color: BRASS, sides: 8 });
  b.rod([-1.0, 7.84, -1.15], [-1.0, 7.95, -1.15], 0.03, { bone: cabin, color: IRON, sides: 5 });
  b.part(new THREE.ConeGeometry(0.17, 0.14, 8), IRON, { bone: cabin, at: [-1.0, 8.0, -1.15], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.15, 0), SMOKE_A, { bone: cabin, at: [-1.05, 8.25, -1.3], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.2, 0), SMOKE_B, { bone: cabin, at: [-1.12, 8.5, -1.55], flat: true });
  // crooked stovepipe on H2
  {
    const p0 = new THREE.Vector3(...H2.P(-0.25, 0.95, -0.15));
    b.sweep(catmull([p0, p0.clone().add(v3(0, 0.35, 0)), p0.clone().add(v3(-0.12, 0.55, -0.05))]), 0.05, {
      bone: cabin,
      color: COPPER,
      sides: 6,
      caps: "flat",
    });
  }

  // ------------------------------------------------------------------ rooster weathervane on H1
  const vaneY = H1.ridgeY + DECK_Y;
  b.rod([-0.15, vaneY - 0.05, -0.8], [-0.15, vaneY + 0.55, -0.8], 0.02, { bone: cabin, color: IRON, sides: 5 });
  b.rod([-0.15, vaneY + 0.38, -1.06], [-0.15, vaneY + 0.38, -0.56], 0.013, { bone: cabin, color: IRON, sides: 4 });
  b.spike([-0.15, vaneY + 0.38, -0.56], [0, 0, 1], 0.1, 0.035, { bone: cabin, color: IRON, section: { ngon: 4 } });
  b.rod([-0.4, vaneY + 0.3, -0.8], [0.1, vaneY + 0.3, -0.8], 0.012, { bone: cabin, color: IRON, sides: 4 });
  b.extrude(
    [
      sh(-0.14, 0),
      sh(0.1, 0),
      sh(0.12, 0.08),
      sh(0.16, 0.14),
      sh(0.2, 0.19),
      sh(0.15, 0.25),
      sh(0.13, 0.2),
      sh(0.08, 0.16),
      sh(0.02, 0.1),
      sh(-0.06, 0.12),
      sh(-0.16, 0.27),
      sh(-0.19, 0.12),
    ],
    { at: [-0.15, vaneY + 0.5, -0.8], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.025, color: "#2a2420", bone: cabin },
  );

  // ------------------------------------------------------------------ washing line and bunting
  b.rod([1.46, 5.0, 1.46], [1.46, 6.0, 1.46], 0.03, { bone: cabin, color: WOOD_DARK, sides: 5 });
  const lineA = v3(1.46, 5.95, 1.44);
  const lineB = v3(1.3, 5.95, -0.68);
  const washLine = catmull([lineA, v3(1.4, 5.78, 0.38), lineB]);
  b.sweep(washLine, 0.011, { bone: cabin, color: ROPE, sides: 4 });
  const shirts: ReturnType<typeof frame>[] = [];
  const socks: ReturnType<typeof frame>[] = [];
  b.along(washLine, 6, (pt) => {
    const f = frame(pt.at, [0, 1, 0]);
    if (shirts.length + socks.length < 6) (pt.t < 0.33 || (pt.t > 0.5 && pt.t < 0.66) ? shirts : socks).push(f);
  }, { from: 0.08, to: 0.9 });
  b.cards(shirts, T.SHIRT, { size: [0.3, 0.3], lean: 180, flow: [1, 0, 0], bone: cabin, sink: 0 });
  b.cards(socks, T.SOCK, { size: [0.12, 0.22], lean: 180, flow: [1, 0, 0], bone: cabin, sink: 0 });

  const buntA = v3(T1.x, t1Top - 0.08, T1.z + 0.47);
  const buntB = new THREE.Vector3(...H2.P(0, H2.ridgeY + 0.12, 0.46));
  const bunting = catmull([buntA, buntA.clone().lerp(buntB, 0.5).add(v3(0.05, -0.28, 0)), buntB]);
  b.sweep(bunting, 0.01, { bone: cabin, color: ROPE, sides: 4 });
  const flags: ReturnType<typeof frame>[] = [];
  b.along(bunting, 9, (pt) => {
    flags.push(frame(pt.at, [0, 1, 0]));
  });
  const PENNANT_TINT = paint((p) => ["#d8402e", "#f2c03a", "#3e9a8e", "#f2efe4"][Math.abs(Math.floor(p.z / 0.17)) % 4]);
  b.cards(flags, T.PENNANT, { size: [0.13, 0.17], lean: 180, flow: [1, 0, 0], bone: cabin, sink: 0, color: PENNANT_TINT });

  return b.root;
}
