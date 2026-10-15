import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  noise,
  mix,
  smoothstep,
  paint,
  mottle,
  stripes,
  grain,
  countershade,
  spots,
  catmull,
  bezier,
  limb,
  svg,
} from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Palm Oasis Caravan",
  description:
    "A whimsical low-poly desert oasis diorama: a turquoise pond ringed with rocks, reeds and lotus, three leaning palms, a striped round tent and a gable tent with an awning, a campfire with a cooking pot, a patterned rug, bunting, a cactus, and a rigged camel with her calf.",
};

type V = [number, number, number];
const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const G = 0.16; // top of the sandy base

// ---------------------------------------------------------------- flat colours
const GOLD = "#f0c24b";
const CREAM = "#fff1cf";
const RED = "#d2492f";
const TEAL = "#2a9d9a";
const BLUE = "#2f6fb3";
const NAVY = "#2c4a7c";
const YELLOW = "#ffd84a";
const PINK = "#ff8fb0";
const ROPE = "#e9d6a4";
const PAD = "#6e4c38";
const HAIR = "#8a5a2c";
const EYE = "#1d1218";
const WHITE = "#ffffff";
const DARKWOOD = "#5a3a22";
const DATE = "#d9822b";
const DATE2 = "#9a3d1c";
const LEAFG = "#55a845";
const PADGREEN = "#4fa046";
const FLAME1 = "#ff8a24";
const FLAME2 = "#ffc83d";
const FLAME3 = "#fff3a8";
const AMBER = "#ffcf70";
const SAGE = "#8fbf6a";

// ---------------------------------------------------------------- paints
const SAND_A = "#f2d49b";
const SAND_B = "#e5b974";
const SAND_C = "#fbe6b4";
const SAND_D = "#c98f55";

const sand = paint((p, n) => {
  const t = smoothstep(0.3, 0.7, noise(p, 0.45, 3));
  let c = mix(SAND_A, SAND_B, t);
  const rip = Math.sin((p.x * 0.6 + p.z * 0.8) * 38 + noise(p, 0.5, 5) * 7);
  if (rip > 0.92) c = mix(c, SAND_C, 0.6);
  else if (rip < -0.95) c = mix(c, SAND_D, 0.25);
  const k = 0.88 + 0.12 * smoothstep(-0.2, 1, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});

const STRATA = ["#b9783f", "#8f5530", "#d49a5c", "#6e4126"];
const baseP = paint((p, n) => {
  if (n.y > 0.8) return sand;
  const band = Math.floor(p.y / 0.03 + noise(p, 0.3, 8) * 1.4);
  return STRATA[((band % 4) + 4) % 4];
});

const PX = -0.3;
const PZ = 0.12;
const water = paint((p) => {
  const d = Math.hypot((p.x - PX) / 0.47, (p.z - PZ) / 0.34);
  let c = mix("#47d3c4", "#1b78ad", smoothstep(1.0, 0.05, d));
  c = mix(c, "#d8fff4", smoothstep(0.8, 1.0, d) * 0.85);
  return c;
});

const GRASS = mottle("#86c44e", "#5fa63e", { size: 0.16, seed: 6 });
const TRUNK = countershade(
  stripes("#a8723f", "#7a4a26", { size: 0.04, axis: "y", width: 0.5, wobble: 0.12, seed: 2 }),
  "#573419",
  { level: -0.5, soft: 0.3 },
);
const WOODP = grain("#b07a45", "#8a5a30", { size: 0.02, axis: "y", seed: 3 });
const WOODDARK = grain("#7a4b2a", "#5c3720", { size: 0.02, axis: "y", seed: 5 });
const ROCK = countershade(mottle("#a3917c", "#85735f", { size: 0.09, seed: 4 }), "#5d4f47", { level: -0.3 });
const CLAY = stripes("#c9693f", "#f0d9a0", { size: 0.05, axis: "y", width: 0.22, wobble: 0.05, seed: 8 });
const GLAZE = stripes("#3b79c4", "#fff1cf", { size: 0.045, axis: "y", width: 0.25, wobble: 0.05, seed: 10 });
const IRON = mottle("#3d3d47", "#2a2a32", { size: 0.05, seed: 12 });
const CACT = spots("#5aa64e", "#f6efc2", { size: 0.035, amount: 0.5, seed: 9 });
const CAMEL = countershade(mottle("#d9a45a", "#c58d46", { size: 0.12, seed: 11 }), "#f0cf94", {
  level: -0.25,
  soft: 0.4,
});
const CALF = countershade(mottle("#ecc482", "#dcae68", { size: 0.1, seed: 13 }), "#fae4b4", {
  level: -0.25,
  soft: 0.4,
});
const BLANKET = stripes("#c8402e", "#f4d27a", { size: 0.034, axis: "y", width: 0.32, wobble: 0.05, seed: 14 });
const BLANKET2 = stripes("#2a9d9a", "#fff1cf", { size: 0.03, axis: "y", width: 0.32, wobble: 0.05, seed: 15 });

const radialStripes = (cx: number, cz: number, n: number, a: string, c: string) =>
  paint((p) => {
    const ang = Math.atan2(p.x - cx, p.z - cz);
    const k = Math.floor((((ang + 2 * PI) % (2 * PI)) / (2 * PI)) * n);
    return k % 2 ? c : a;
  });

// ---------------------------------------------------------------- textures
function frondSvg() {
  let s = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">`;
  s += `<path d="M32 128 L32 6" stroke="#355f27" stroke-width="2.8" stroke-linecap="round" fill="none"/>`;
  const cols = ["#2f6f2d", "#3a8433", "#4a9a3a", "#5db044", "#78c653"];
  for (let i = 0; i < 13; i++) {
    const y = 122 - i * 9;
    const w = 28 * (1 - i / 16) + 3;
    const c = cols[Math.min(4, Math.floor((i / 13) * 5))];
    for (const side of [-1, 1]) {
      const x1 = 32 + side * w;
      s += `<path d="M32 ${y} Q${32 + side * w * 0.6} ${y - 2} ${x1} ${y - 14} Q${32 + side * w * 0.45} ${y - 7} 32 ${y - 3.5} Z" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`;
    }
  }
  s += `<path d="M32 14 Q26 7 32 0 Q38 7 32 14Z" fill="#8bd45c"/></svg>`;
  return svg(s, { size: 256 });
}

function tuftSvg() {
  const blades: [number, number, number, string][] = [
    [8, 2, 24, "#4e9a3a"],
    [16, 9, 8, "#62b043"],
    [24, 24, 0, "#3f8a35"],
    [32, 40, 8, "#62b043"],
    [40, 46, 26, "#4e9a3a"],
    [20, 16, 18, "#78c653"],
    [30, 34, 16, "#78c653"],
  ];
  let s = `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">`;
  for (const [cx, tx, ty, c] of blades) {
    const my = (64 + ty) / 2;
    s += `<path d="M${cx - 4} 64 Q${cx - 1} ${my} ${tx} ${ty} Q${cx + 3} ${my + 4} ${cx + 4} 64Z" fill="${c}"/>`;
  }
  return svg(s + `</svg>`, { size: 192 });
}

function reedSvg() {
  return svg(
    `<svg viewBox="0 0 40 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 96 Q10 50 6 6" stroke="#5da845" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M28 96 Q30 52 35 12" stroke="#6fbb52" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M20 96 Q20 60 19 30" stroke="#4e9a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="16.8" y="12" width="6.4" height="22" rx="3.2" fill="#7a4a2a"/>
      <path d="M20 12 L20 1" stroke="#7a4a2a" stroke-width="2" stroke-linecap="round"/>
      <path d="M16.8 18 H23.2" stroke="#a8683c" stroke-width="1.4"/>
    </svg>`,
    { size: 256 },
  );
}

function doorASvg() {
  return svg(
    `<svg viewBox="0 0 52 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 60 V26 Q3 1 26 1 Q49 1 49 26 V60 Z" fill="#f0c24b"/>
      <path d="M8 60 V27 Q8 6 26 6 Q44 6 44 27 V60 Z" fill="#2a1a2e"/>
      <ellipse cx="26" cy="48" rx="13" ry="11" fill="#ffb64d" opacity="0.6"/>
      <ellipse cx="26" cy="50" rx="6" ry="6" fill="#ffe08a" opacity="0.8"/>
      <path d="M8 60 V28 Q8 10 22 6 Q13 30 15 60Z" fill="#d9503a"/>
      <path d="M44 60 V28 Q44 10 30 6 Q39 30 37 60Z" fill="#d9503a"/>
      <circle cx="11.5" cy="30" r="1.6" fill="#f0c24b"/><circle cx="12.5" cy="42" r="1.6" fill="#f0c24b"/>
      <circle cx="40.5" cy="30" r="1.6" fill="#f0c24b"/><circle cx="39.5" cy="42" r="1.6" fill="#f0c24b"/>
      <path d="M3 60 V26 Q3 1 26 1 Q49 1 49 26 V60" fill="none" stroke="#fff1cf" stroke-width="1.6"/>
      <circle cx="26" cy="9" r="2.6" fill="#fff1cf"/>
    </svg>`,
    { size: 240 },
  );
}

function doorBSvg() {
  return svg(
    `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 70 V32 Q4 18 30 1 Q56 18 57 32 V70 Z" fill="#f0c24b"/>
      <path d="M8 70 V33 Q9 21 30 7 Q51 21 52 33 V70 Z" fill="#22203a"/>
      <ellipse cx="30" cy="56" rx="14" ry="12" fill="#ffb64d" opacity="0.5"/>
      <path d="M8 70 V35 Q8 24 20 12 Q14 36 17 70Z" fill="#2a9d9a"/>
      <path d="M52 70 V35 Q52 24 40 12 Q46 36 43 70Z" fill="#2a9d9a"/>
      <path d="M30 14 a7 7 0 1 0 6 9 a5.6 5.6 0 1 1 -6 -9Z" fill="#fff1cf"/>
      <path d="M38 16 l1.3 3.2 3.2 0.3 -2.5 2.1 0.8 3.2 -2.8 -1.8 -2.8 1.8 0.8 -3.2 -2.5 -2.1 3.2 -0.3Z" fill="#f0c24b"/>
      <path d="M3 70 V32 Q4 18 30 1 Q56 18 57 32 V70" fill="none" stroke="#fff1cf" stroke-width="1.6"/>
    </svg>`,
    { size: 240 },
  );
}

function rugSvg() {
  let zig = "";
  for (let i = 0; i < 16; i++) zig += `${18 + i * 4},${i % 2 ? 9 : 12} `;
  let zig2 = "";
  for (let i = 0; i < 16; i++) zig2 += `${18 + i * 4},${i % 2 ? 61 : 58} `;
  let fringe = "";
  for (let i = 0; i < 12; i++) {
    const y = 6 + i * 5.2;
    fringe += `<path d="M8 ${y} H2 M92 ${y} H98" stroke="#fff1cf" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      ${fringe}
      <rect x="8" y="2" width="84" height="66" rx="1" fill="#b53a2b"/>
      <rect x="12" y="6" width="76" height="58" fill="none" stroke="#fff1cf" stroke-width="2"/>
      <rect x="16" y="14" width="68" height="42" fill="#2c4a7c"/>
      <polyline points="${zig}" fill="none" stroke="#f0c24b" stroke-width="1.6"/>
      <polyline points="${zig2}" fill="none" stroke="#f0c24b" stroke-width="1.6"/>
      <polygon points="50,14 76,35 50,56 24,35" fill="#e6b84a"/>
      <polygon points="50,21 66,35 50,49 34,35" fill="#c7432f"/>
      <polygon points="50,28 58,35 50,42 42,35" fill="#2a9d9a"/>
      <circle cx="50" cy="35" r="2.6" fill="#fff1cf"/>
      <path d="M16 14 L28 14 L16 26Z M84 14 L72 14 L84 26Z M16 56 L28 56 L16 44Z M84 56 L72 56 L84 44Z" fill="#e6b84a"/>
    </svg>`,
    { size: 400 },
  );
}

function rippleSvg() {
  const star = (x: number, y: number, r: number) =>
    `<path d="M${x} ${y - r} L${x + r * 0.25} ${y - r * 0.25} L${x + r} ${y} L${x + r * 0.25} ${y + r * 0.25} L${x} ${y + r} L${x - r * 0.25} ${y + r * 0.25} L${x - r} ${y} L${x - r * 0.25} ${y - r * 0.25}Z" fill="#ffffff"/>`;
  return svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="38" cy="28" rx="14" ry="6" fill="none" stroke="#ffffff" stroke-width="1.8"/>
      <ellipse cx="38" cy="28" rx="24" ry="10" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="14 8"/>
      <ellipse cx="68" cy="44" rx="10" ry="4.5" fill="none" stroke="#ffffff" stroke-width="1.8"/>
      <ellipse cx="68" cy="44" rx="18" ry="7.5" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="12 9"/>
      <path d="M12 46 q6 -3 12 0" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M70 16 q6 -3 12 0" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${star(22, 20, 4)}${star(82, 30, 3.4)}${star(54, 54, 3)}${star(50, 14, 2.6)}
    </svg>`,
    { size: 300 },
  );
}

function signSvg() {
  const palm = (x: number) =>
    `<g transform="translate(${x} 0)"><path d="M0 16 Q1 10 0 6" stroke="#7a4a26" stroke-width="1.4" fill="none"/>
      <path d="M0 6 Q-5 3 -7 6 M0 6 Q5 3 7 6 M0 6 Q-3 1 -5 0 M0 6 Q3 1 5 0 M0 6 L0 0" stroke="#7fc84e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`;
  return svg(
    `<svg viewBox="0 0 112 18" xmlns="http://www.w3.org/2000/svg">
      ${palm(10)}${palm(102)}
      <text x="56" y="14.5" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" letter-spacing="3" fill="#4a2a14" stroke="#4a2a14" stroke-width="1.6">OASIS</text>
      <text x="56" y="14.5" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" letter-spacing="3" fill="#fbe8b0">OASIS</text>
      <circle cx="22" cy="9" r="1.2" fill="#f0c24b"/><circle cx="90" cy="9" r="1.2" fill="#f0c24b"/>
    </svg>`,
    { size: 512 },
  );
}

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "oasis", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(11);

  const FROND = frondSvg();
  const TUFT = tuftSvg();
  const REED = reedSvg();
  const DOOR_A = doorASvg();
  const DOOR_B = doorBSvg();
  const RUG = rugSvg();
  const RIPPLE = rippleSvg();
  const SIGN = signSvg();

  const put = (geo: THREE.BufferGeometry, color: string | Paint, at: V, o: any = {}) =>
    b.part(geo, color, { bone: base, at, ...o });
  const rod = (a: V, c: V, r: number | [number, number], color: string | Paint, o: any = {}) =>
    b.rod(a, c, r, color, { bone: base, ...o });
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
  const cone = (r: number, h: number, seg = 6) => new THREE.ConeGeometry(r, h, seg);

  // ------------------------------------------------------------ base island
  b.lathe(
    [
      [0, 0],
      [1.3, 0],
      [1.42, 0.04],
      [1.42, 0.125],
      [1.35, G],
      [0, G],
    ],
    { at: [0, 0, 0], bone: base, segments: 22, color: baseP },
  );

  // wooden name plaque
  put(new THREE.BoxGeometry(0.62, 0.1, 0.06), WOODP, [0, 0.085, 1.42]);
  put(new THREE.PlaneGeometry(0.56, 0.09), WHITE, [0, 0.085, 1.455], { dir: [0, 0, 1], axis: "z", texture: SIGN });
  for (const s of [1, -1]) put(sph(6, 4), GOLD, [s * 0.3, 0.085, 1.455], { scale: [0.012, 0.012, 0.008] });

  // dunes
  const dune = (x: number, z: number, sx: number, sy: number, sz: number, rot: number) =>
    put(new THREE.SphereGeometry(1, 12, 6, 0, PI * 2, 0, PI / 2), sand, [x, G, z], {
      scale: [sx, sy, sz],
      rotation: [0, rot, 0],
      flat: true,
    });
  dune(-0.45, -0.95, 0.62, 0.24, 0.34, -12);
  dune(-1.05, -0.35, 0.22, 0.13, 0.28, 8);
  dune(0.2, -1.1, 0.4, 0.16, 0.2, 10);
  dune(-0.15, -1.18, 0.2, 0.1, 0.12, 0);

  // ------------------------------------------------------------ pond
  put(new THREE.CylinderGeometry(1, 1, 0.04, 16), GRASS, [PX, G + 0.005, PZ], { scale: [0.68, 1, 0.5], flat: true });
  put(new THREE.CylinderGeometry(1, 1, 0.05, 18), water, [PX, G + 0.01, PZ], { scale: [0.47, 1, 0.34] });
  put(new THREE.PlaneGeometry(1, 1), WHITE, [PX, G + 0.0365, PZ], {
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    scale: [0.84, 0.6, 1],
    texture: RIPPLE,
  });

  // rim rocks
  for (let i = 0; i < 13; i++) {
    const a = (i / 13) * PI * 2 + R() * 0.2;
    const sz = 0.032 + R() * 0.03;
    put(new THREE.DodecahedronGeometry(1, 0), ROCK, [PX + cos(a) * 0.5, G + 0.02, PZ + sin(a) * 0.37], {
      scale: [sz * 1.1, sz * 0.75, sz],
      rotation: [R() * 40, R() * 360, R() * 40],
      flat: true,
    });
  }

  // lily pads and lotus
  const pad = (x: number, z: number, r: number) =>
    put(new THREE.CylinderGeometry(r, r, 0.008, 8), PADGREEN, [x, G + 0.039, z], { flat: true });
  pad(PX + 0.14, PZ + 0.06, 0.06);
  pad(PX - 0.2, PZ - 0.08, 0.05);
  pad(PX + 0.02, PZ - 0.12, 0.04);
  const LX = PX + 0.14;
  const LZ = PZ + 0.06;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * PI * 2;
    const dir: V = [cos(a) * 0.6, 1, sin(a) * 0.6];
    put(cone(0.014, 0.05, 4), PINK, [LX + cos(a) * 0.016, G + 0.068, LZ + sin(a) * 0.016], { dir });
  }
  put(sph(6, 4), YELLOW, [LX, G + 0.058, LZ], { scale: [0.014, 0.012, 0.014] });
  put(cone(0.012, 0.04, 4), PINK, [LX, G + 0.075, LZ]);

  // reeds and grass tufts
  const reedFrames = [];
  for (let i = 0; i < 10; i++) {
    const a = PI + 0.25 + (i / 9) * (PI - 0.5);
    reedFrames.push(frame([PX + cos(a) * 0.56, G + 0.02, PZ + sin(a) * 0.41] as V, [0, 1, 0]));
  }
  b.cards(reedFrames, REED, { size: [0.1, 0.24], vary: 0.3, rng: R, spin: 25, cross: true, lean: 8, bend: 18, bone: base });
  const tuftFrames = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * PI * 2 + 0.2;
    const k = 0.62 + R() * 0.12;
    tuftFrames.push(frame([PX + cos(a) * 0.66 * k + 0.03, G + 0.02, PZ + sin(a) * 0.5 * k + 0.02] as V, [0, 1, 0]));
  }
  b.cards(tuftFrames, TUFT, { size: [0.09, 0.1], vary: 0.3, rng: R, spin: 40, cross: true, lean: 10, bend: 20, bone: base });

  // ------------------------------------------------------------ foreground dressing
  {
    const sf = [];
    const spots2: [number, number][] = [
      [-1.0, 0.75], [-0.4, 1.15], [0.1, 1.2], [0.7, 1.05], [-0.8, 1.0], [0.3, 0.8], [1.05, 0.9], [-1.15, 0.2],
    ];
    for (const [x, z] of spots2) sf.push(frame([x, G + 0.002, z] as V, [0, 1, 0]));
    b.cards(sf, TUFT, { size: [0.09, 0.09], vary: 0.3, rng: R, spin: 40, cross: true, lean: 10, bend: 20, bone: base });
    for (let i = 0; i < 6; i++) {
      const x = -0.9 + i * 0.35 + R() * 0.1;
      const z = 1.0 + R() * 0.15;
      const s = 0.016 + R() * 0.014;
      put(new THREE.DodecahedronGeometry(1, 0), ROCK, [x, G + s * 0.3, z], {
        scale: [s * 1.2, s * 0.7, s],
        rotation: [0, R() * 360, 0],
        flat: true,
      });
    }
    // camel footprint trail
    for (let i = 0; i < 6; i++) {
      for (const s of [1, -1]) {
        put(new THREE.CylinderGeometry(0.022, 0.022, 0.003, 6), SAND_D, [0.1 + i * 0.1 - s * 0.01, G + 0.002, 0.4 + i * 0.05 + s * 0.04], {
          flat: true,
        });
      }
    }
  }

  // ------------------------------------------------------------ palms
  const palm = (x: number, z: number, h: number, az: number, lean: number, s: number) => {
    const pts: V[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts.push([x + sin(az) * lean * t * t, G - 0.01 + h * t, z + cos(az) * lean * t * t]);
    }
    const path = catmull(pts);
    b.sweep(path, [0.052 * s, 0.03 * s], { bone: base, color: TRUNK, sides: 7 });
    put(cone(0.08 * s, 0.1 * s, 7), TRUNK, [x, G + 0.04 * s, z], { flat: true });
    put(new THREE.CylinderGeometry(0.1 * s, 0.1 * s, 0.012, 9), GRASS, [x, G + 0.006, z], { flat: true });
    for (let i = 0; i < 10; i++) {
      const t = (i + 0.6) / 10.6;
      const pt = path.at(t);
      const tg = path.tangentAt(t);
      const r = (0.052 - 0.022 * t) * s + 0.003 * s;
      put(new THREE.TorusGeometry(r, 0.0065 * s, 4, 7), TRUNK, pt as any, { dir: tg, axis: "z", flat: true });
    }
    const top = pts[6];
    put(new THREE.IcosahedronGeometry(0.055 * s, 0), DARKWOOD, [top[0], top[1] + 0.01 * s, top[2]], { flat: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2 + az;
      put(sph(6, 4), i % 2 ? DATE : DATE2, [top[0] + cos(a) * 0.05 * s, top[1] - 0.03 * s, top[2] + sin(a) * 0.05 * s], {
        scale: [0.02 * s, 0.026 * s, 0.02 * s],
      });
    }
    const mk = (n: number, off: number, leanA: number, bend: number, len: number, wid: number) => {
      const fr = Array.from({ length: n }, () => frame([top[0], top[1] + 0.01 * s, top[2]] as V, [0, 1, 0]));
      b.cards(fr, FROND, {
        size: [wid * s, len * s],
        lean: leanA,
        bend,
        flow: (_f: any, i: number): V => {
          const a = off + (i * PI * 2) / n;
          return [sin(a), 0, cos(a)];
        },
        vary: 0.12,
        rng: R,
        sink: 0.04,
        bone: base,
      });
    };
    mk(7, az + 0.2, 40, 78, 0.62, 0.34);
    mk(6, az + 0.65, 80, 55, 0.55, 0.3);
    mk(5, az + 0.35, 115, 30, 0.42, 0.28);
    return path;
  };
  palm(-0.8, -0.2, 1.1, 0.9, 0.2, 1);
  const palm2 = palm(-0.12, -0.38, 1.0, -1.2, 0.18, 0.95);
  palm(-0.88, 0.45, 0.82, 1.3, 0.2, 0.85);
  palm(-0.62, 0.98, 0.5, -0.4, 0.08, 0.55);

  // ------------------------------------------------------------ lantern helper
  const lantern = (x: number, y: number, z: number, hang: number) => {
    rod([x, y + hang, z], [x, y + 0.055, z], 0.0025, ROPE);
    put(cone(0.032, 0.03, 6), GOLD, [x, y + 0.05, z], { flat: true });
    glow(put(new THREE.CylinderGeometry(0.025, 0.021, 0.055, 6), AMBER, [x, y + 0.012, z], { flat: true }), 1.6);
    put(new THREE.CylinderGeometry(0.022, 0.028, 0.012, 6), GOLD, [x, y - 0.02, z], { flat: true });
    put(sph(6, 4), GOLD, [x, y - 0.03, z], { scale: [0.008, 0.008, 0.008] });
  };

  // ------------------------------------------------------------ tent A (round, striped)
  const tentA = (cx: number, cz: number) => {
    const r = 0.3;
    const wh = 0.2;
    const rh = 0.3;
    put(new THREE.CylinderGeometry(r, r * 1.03, wh, 8), radialStripes(cx, cz, 8, BLUE, CREAM), [cx, G + wh / 2, cz], {
      flat: true,
    });
    put(new THREE.CylinderGeometry(r * 1.05, r * 1.07, 0.035, 8), WOODDARK, [cx, G + 0.0175, cz], { flat: true });
    put(new THREE.ConeGeometry(r * 1.2, rh, 8), radialStripes(cx, cz, 8, "#d9503a", CREAM), [cx, G + wh + rh / 2 - 0.01, cz], {
      flat: true,
    });
    const eave = G + wh - 0.01;
    for (let k = 0; k < 8; k++) {
      const am = (22.5 + k * 45) * (PI / 180);
      const u: V = [sin(am), 0, cos(am)];
      const v: V = [cos(am), 0, -sin(am)];
      for (let j = -1; j <= 1; j++) {
        const px = cx + u[0] * 1.11 * r + v[0] * j * 0.085 * r * 1.2;
        const pz = cz + u[2] * 1.11 * r + v[2] * j * 0.085 * r * 1.2;
        put(cone(0.04, 0.075, 4), j === 0 ? CREAM : GOLD, [px, eave - 0.02, pz], { dir: [0, -1, 0], flat: true });
      }
    }
    // door
    const phi = -PI / 8;
    const dr = r * 0.924 + 0.004;
    put(new THREE.PlaneGeometry(0.13, 0.15), WHITE, [cx + sin(phi) * dr, G + 0.078, cz + cos(phi) * dr], {
      dir: [sin(phi), 0, cos(phi)],
      axis: "z",
      texture: DOOR_A,
    });
    // finial
    const apex = G + wh + rh - 0.01;
    rod([cx, apex - 0.03, cz], [cx, apex + 0.17, cz], 0.006, WOODP);
    put(sph(8, 6), GOLD, [cx, apex + 0.17, cz], { scale: [0.02, 0.02, 0.02] });
    b.extrude(
      [
        [0, 0.03],
        [0.15, 0.03],
        [0.105, 0],
        [0.15, -0.03],
        [0, -0.03],
      ],
      { at: [cx + 0.004, apex + 0.12, cz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: RED, bone: base },
    );
    // ropes and pegs
    for (let k = 0; k < 8; k++) {
      const a = k * 45 * (PI / 180);
      const top: V = [cx + sin(a) * r * 1.2, eave, cz + cos(a) * r * 1.2];
      const gnd: V = [cx + sin(a) * (r * 1.2 + 0.18), G + 0.004, cz + cos(a) * (r * 1.2 + 0.18)];
      rod(top, gnd, 0.003, ROPE, { sides: 4 });
      put(cone(0.01, 0.04, 5), DARKWOOD, [gnd[0], G + 0.014, gnd[2]], { dir: [0, 1, 0.3] });
    }
    return apex + 0.12;
  };
  const AX = 0.55;
  const AZ = -0.68;
  const apexTop = tentA(AX, AZ);

  // ------------------------------------------------------------ tent B (gable with awning)
  const tentB = (bx: number, bz: number, yaw: number) => {
    const c = cos(yaw);
    const s = sin(yaw);
    const P = (u: number, v: number, w: number): V => [bx + u * c + w * s, G + v, bz - u * s + w * c];
    const F: V = [s, 0, c];
    const Rr: V = [c, 0, -s];
    const body = paint((p, n) => {
      const w = (p.x - bx) * s + (p.z - bz) * c;
      if (Math.abs(n.x * s + n.z * c) > 0.5) return TEAL;
      return Math.floor(w / 0.07 + 100) % 2 ? CREAM : "#2a9d9a";
    });
    const outline: any = [
      [-0.22, 0],
      [0.22, 0],
      [0.22, 0.14],
      [0, 0.36, "sharp"],
      [-0.22, 0.14],
    ];
    b.extrude(outline, { at: P(0, 0, 0), x: Rr, y: [0, 1, 0], thickness: 0.5, bevel: 0.006, color: body, bone: base });
    // door
    put(new THREE.PlaneGeometry(0.16, 0.19), WHITE, P(0, 0.097, 0.2535), { dir: F, axis: "z", texture: DOOR_B });
    // gold trim on front gable
    rod(P(-0.22, 0.14, 0.257), P(0, 0.36, 0.257), 0.006, GOLD, { sides: 5 });
    rod(P(0.22, 0.14, 0.257), P(0, 0.36, 0.257), 0.006, GOLD, { sides: 5 });
    rod(P(-0.22, 0, 0.257), P(-0.22, 0.14, 0.257), 0.006, GOLD, { sides: 5 });
    rod(P(0.22, 0, 0.257), P(0.22, 0.14, 0.257), 0.006, GOLD, { sides: 5 });
    // ridge pole
    rod(P(0, 0.36, -0.32), P(0, 0.36, 0.36), 0.008, WOODP, { sides: 6 });
    put(sph(8, 6), GOLD, P(0, 0.36, 0.36), { scale: [0.02, 0.02, 0.02] });
    put(sph(8, 6), GOLD, P(0, 0.36, -0.32), { scale: [0.02, 0.02, 0.02] });
    // awning
    const slope = new THREE.Vector3(F[0] * 0.95, -0.3, F[2] * 0.95).normalize();
    const awnP = paint((p) => (Math.floor(((p.x - bx) * c - (p.z - bz) * s) / 0.055 + 100) % 2 ? CREAM : RED));
    b.extrude(
      [
        [-0.22, 0],
        [0.22, 0],
        [0.22, 0.22],
        [-0.22, 0.22],
      ],
      { at: P(0, 0.3, 0.25), x: Rr, y: [slope.x, slope.y, slope.z], thickness: 0.008, color: awnP, bone: base },
    );
    const lip = (u: number): V => [
      P(u, 0, 0)[0] + slope.x * 0.22 + F[0] * 0.25,
      G + 0.3 + slope.y * 0.22,
      P(u, 0, 0)[2] + slope.z * 0.22 + F[2] * 0.25,
    ];
    for (let i = 0; i < 7; i++) {
      const u = -0.2 + i * (0.4 / 6);
      const l = lip(u);
      put(cone(0.03, 0.05, 4), i % 2 ? CREAM : RED, [l[0], l[1] - 0.02, l[2]], { dir: [0, -1, 0], flat: true });
    }
    for (const u of [-0.22, 0.22]) {
      const l = lip(u);
      rod([l[0], l[1], l[2]], [l[0], G + 0.002, l[2]], 0.007, WOODP, { sides: 5 });
    }
    const l = lip(-0.22);
    lantern(l[0] + Rr[0] * 0.04, l[1] - 0.075, l[2] + Rr[2] * 0.04, 0.03);
  };
  tentB(1.0, 0.0, -0.6);

  // ------------------------------------------------------------ bunting
  {
    const a: V = [palm2.at(0.66).x, palm2.at(0.66).y, palm2.at(0.66).z];
    const e: V = [AX, apexTop - 0.06, AZ];
    const ctrl: V = [(a[0] + e[0]) / 2, Math.min(a[1], e[1]) - 0.22, (a[2] + e[2]) / 2];
    const path = bezier(a, ctrl, e);
    b.sweep(path, 0.0035, { bone: base, color: ROPE, sides: 4 });
    const cols = [RED, TEAL, YELLOW, CREAM, PINK];
    for (let i = 0; i < 10; i++) {
      const t = (i + 0.7) / 11;
      const pt = path.at(t);
      b.extrude(
        [
          [-0.03, 0],
          [0.03, 0],
          [0, -0.065],
        ],
        { at: [pt.x, pt.y - 0.002, pt.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.004, color: cols[i % 5], bone: base },
      );
    }
  }

  // ------------------------------------------------------------ campfire with pot
  {
    const fx = 0.42;
    const fz = 0.2;
    // scorched pit and warm firelight on the sand
    put(new THREE.CircleGeometry(0.26, 16), "#f4c27a", [fx, G + 0.002, fz], { dir: [0, 1, 0], axis: "z" });
    put(new THREE.CircleGeometry(0.19, 16), "#f7a45a", [fx, G + 0.003, fz], { dir: [0, 1, 0], axis: "z" });
    put(new THREE.CircleGeometry(0.13, 14), "#3d2c26", [fx, G + 0.004, fz], { dir: [0, 1, 0], axis: "z" });
    glow(put(new THREE.CircleGeometry(0.075, 12), "#ff8a3a", [fx, G + 0.005, fz], { dir: [0, 1, 0], axis: "z" }), 1.2);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * PI * 2;
      put(new THREE.DodecahedronGeometry(0.03, 0), ROCK, [fx + cos(a) * 0.11, G + 0.015, fz + sin(a) * 0.11], {
        scale: [1, 0.7, 1],
        rotation: [0, i * 40, 0],
        flat: true,
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4;
      rod([fx + cos(a) * 0.09, G + 0.02, fz + sin(a) * 0.09], [fx - cos(a) * 0.01, G + 0.06, fz - sin(a) * 0.01], 0.014, WOODDARK, { sides: 6 });
    }
    glow(put(cone(0.055, 0.15, 6), FLAME1, [fx, G + 0.095, fz], { flat: true }), 1.5);
    glow(put(cone(0.035, 0.11, 6), FLAME2, [fx + 0.012, G + 0.08, fz], { flat: true }), 1.6);
    glow(put(cone(0.02, 0.07, 5), FLAME3, [fx - 0.004, G + 0.07, fz + 0.01], { flat: true }), 1.8);
    glow(put(cone(0.022, 0.08, 5), FLAME1, [fx - 0.05, G + 0.06, fz + 0.02], { flat: true }), 1.4);
    glow(put(cone(0.02, 0.07, 5), FLAME1, [fx + 0.045, G + 0.055, fz - 0.03], { flat: true }), 1.4);
    for (let i = 0; i < 5; i++) {
      glow(
        put(new THREE.OctahedronGeometry(0.008, 0), FLAME2, [fx + (R() - 0.5) * 0.14, G + 0.2 + R() * 0.12, fz + (R() - 0.5) * 0.14]),
        1.8,
      );
    }
    // tripod and pot
    const apex: V = [fx, G + 0.3, fz];
    for (let i = 0; i < 3; i++) {
      const a = i * 2.094 + 1.5;
      rod([fx + cos(a) * 0.17, G, fz + sin(a) * 0.17], apex, 0.006, WOODDARK, { sides: 5 });
    }
    rod(apex, [fx, G + 0.2, fz], 0.0025, IRON, { sides: 4 });
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.055, 0.03],
        [0.06, 0.065],
        [0.052, 0.08],
        [0, 0.08],
      ],
      { at: [fx, G + 0.13, fz], bone: base, segments: 10, color: IRON },
    );
    put(new THREE.TorusGeometry(0.056, 0.005, 4, 10), IRON, [fx, G + 0.208, fz], { rotation: [90, 0, 0], flat: true });
  }

  // ------------------------------------------------------------ rug, cushions, jars, crates
  {
    const yaw = -0.6;
    put(new THREE.PlaneGeometry(0.44, 0.31), WHITE, [0.93, G + 0.004, 0.52], {
      dir: [0, 1, 0],
      axis: "z",
      up: [-sin(yaw), 0, -cos(yaw)],
      texture: RUG,
    });
    put(sph(8, 5), "#c8402e", [0.98, G + 0.03, 0.46], { scale: [0.05, 0.026, 0.04], rotation: [0, 30, 0] });
    put(sph(8, 5), TEAL, [0.86, G + 0.03, 0.58], { scale: [0.05, 0.026, 0.04], rotation: [0, -20, 0] });
    put(cone(0.01, 0.02, 4), GOLD, [0.98, G + 0.058, 0.46]);
    put(cone(0.01, 0.02, 4), GOLD, [0.86, G + 0.058, 0.58]);
    // tea tray
    put(new THREE.CylinderGeometry(0.05, 0.045, 0.01, 10), GOLD, [0.93, G + 0.011, 0.52], { flat: true });
    put(new THREE.CylinderGeometry(0.012, 0.015, 0.03, 6), CREAM, [0.945, G + 0.031, 0.53], { flat: true });
    put(new THREE.CylinderGeometry(0.012, 0.015, 0.03, 6), CREAM, [0.905, G + 0.031, 0.51], { flat: true });
  }

  const jar = (x: number, z: number, color: Paint, s: number) =>
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.048, 0.04],
        [0.052, 0.085],
        [0.04, 0.12],
        [0.026, 0.138],
        [0.034, 0.15],
        [0.034, 0.158],
        [0, 0.158],
      ].map(([a, c]) => [a * s, c * s]) as any,
      { at: [x, G, z], bone: base, segments: 8, color },
    );
  jar(0.1, -0.7, CLAY, 1.1);
  jar(0.16, -0.54, GLAZE, 0.9);
  jar(0.06, -0.58, CLAY, 0.8);
  put(new THREE.BoxGeometry(0.12, 0.1, 0.12), WOODP, [0.98, G + 0.05, -0.72], { rotation: [0, 18, 0] });
  put(new THREE.BoxGeometry(0.09, 0.08, 0.09), WOODP, [0.96, G + 0.14, -0.72], { rotation: [0, -10, 0] });
  for (const dy of [0.02, 0.08]) rod([0.92, G + dy, -0.665], [1.04, G + dy, -0.78], 0.005, WOODDARK, { sides: 4 });
  put(sph(8, 6), "#d8c08a", [0.82, G + 0.035, -0.92], { scale: [0.07, 0.05, 0.06] });
  put(cone(0.015, 0.035, 5), "#d8c08a", [0.82, G + 0.095, -0.92]);
  put(new THREE.TorusGeometry(0.014, 0.004, 4, 8), ROPE, [0.82, G + 0.084, -0.92], { rotation: [90, 0, 0] });

  // standing lantern post
  {
    const lx = 0.2;
    const lz = -0.3;
    const post = bezier([lx, G, lz], [lx, G + 0.3, lz], [lx + 0.06, G + 0.32, lz]);
    b.sweep(post, [0.011, 0.008], { bone: base, color: WOODP, sides: 5 });
    lantern(lx + 0.07, G + 0.24, lz, 0.05);
  }

  // ------------------------------------------------------------ cactus and rocks
  {
    const cx = -1.0;
    const cz = -0.62;
    b.sweep(
      catmull([
        [cx, G - 0.01, cz],
        [cx, G + 0.14, cz],
        [cx, G + 0.28, cz],
      ]),
      [0.04, 0.032],
      { bone: base, color: CACT, sides: 6 },
    );
    for (const s of [1, -1]) {
      b.sweep(
        catmull([
          [cx + s * 0.02, G + 0.1 + (s > 0 ? 0 : 0.04), cz],
          [cx + s * 0.08, G + 0.12 + (s > 0 ? 0 : 0.04), cz],
          [cx + s * 0.1, G + 0.21 + (s > 0 ? 0 : 0.04), cz],
        ]),
        [0.026, 0.02],
        { bone: base, color: CACT, sides: 6 },
      );
    }
    put(sph(6, 4), PINK, [cx, G + 0.31, cz], { scale: [0.022, 0.016, 0.022] });
    put(cone(0.014, 0.025, 5), YELLOW, [cx, G + 0.335, cz]);
    const rocks: [number, number, number][] = [
      [-1.05, -0.05, 0.1],
      [-1.12, 0.08, 0.06],
      [-0.95, -0.12, 0.05],
      [-0.4, -1.02, 0.07],
      [0.0, -0.98, 0.05],
    ];
    for (const [x, z, s] of rocks) {
      put(new THREE.DodecahedronGeometry(1, 0), ROCK, [x, G + s * 0.4, z], {
        scale: [s, s * 0.8, s * 0.9],
        rotation: [R() * 30, R() * 360, R() * 30],
        flat: true,
      });
    }
  }

  // ------------------------------------------------------------ camels
  const camel = (tag: string, cx: number, cz: number, yaw: number, k: number, hs: number, coat: Paint, blanket: Paint) => {
    const cy = cos(yaw);
    const sy = sin(yaw);
    const T = (x: number, y: number, z: number): V => [cx + (x * cy + z * sy) * k, G + y * k, cz + (-x * sy + z * cy) * k];
    const Dr = (x: number, y: number, z: number): V => [x * cy + z * sy, y, -x * sy + z * cy];
    const H = (x: number, y: number, z: number): V => T(x * hs, 0.61 + y * hs, 0.31 + z * hs);

    const hips = b.joint(`hips${tag}`, { parent: base, at: T(0, 0.3, -0.17), dir: Dr(0, 0.05, 1), role: "spine" });
    const spine = b.chain(
      `spine${tag}`,
      catmull([T(0, 0.3, -0.17), T(0, 0.315, -0.05), T(0, 0.32, 0.07), T(0, 0.31, 0.17)]),
      { parent: hips, count: 3, role: "spine" },
    );
    const body = b.sweep(
      spine,
      (t: number) => [(0.07 + 0.018 * sin(PI * t)) * k, (0.08 + 0.02 * sin(PI * t)) * k],
      { color: coat },
    );
    const mid = spine.joints[1];
    const front = spine.joints[2];

    // hump with blanket cap
    b.part(sph(10, 7), coat, { bone: mid, at: T(0, 0.405, -0.03), scale: [0.07 * k, 0.085 * k, 0.075 * k] });
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, PI * 2, 0, PI * 0.4), blanket, {
      bone: mid,
      at: T(0, 0.405, -0.03),
      scale: [0.079 * k, 0.093 * k, 0.083 * k],
    });
    for (let i = 0; i < 3; i++)
      b.spike(T(0, 0.475, -0.03 + (i - 1) * 0.03), Dr(0, 1, (i - 1) * 0.35), 0.05 * k, 0.012 * k, {
        color: GOLD,
        bone: mid,
        sides: 5,
      });
    for (const s of [1, -1])
      for (let i = 0; i < 3; i++)
        b.spike(T(s * 0.075, 0.37, -0.07 + i * 0.04), Dr(s * 0.3, -1, 0), 0.04 * k, 0.008 * k, {
          color: i % 2 ? RED : GOLD,
          bone: mid,
          sides: 5,
        });
    try {
      const skin = b.surface(body);
      const girth = skin.loop(spine.joints[2], { lift: 0.004 * k });
      b.sweep(girth, (): [number, number] => [0.02 * k, 0.004 * k], { color: GOLD, section: "box", bone: front });
    } catch {
      /* the girth band is decoration only */
    }
    // chest tuft
    b.spike(T(0, 0.2, 0.15), Dr(0, -1, 0.4), 0.05 * k, 0.02 * k, { color: HAIR, bone: front, sides: 5 });

    // tail
    const tail = b.chain(
      `tail${tag}`,
      catmull([T(0, 0.34, -0.22), T(0, 0.3, -0.29), T(0, 0.22, -0.31), T(0, 0.15, -0.3)]),
      { parent: hips, count: 3, role: "tail" },
    );
    b.sweep(tail, [0.015 * k, 0.008 * k], { color: coat });
    b.part(sph(7, 5), HAIR, { bone: tail.joints[2], at: T(0, 0.12, -0.3), scale: [0.02 * k, 0.034 * k, 0.02 * k] });

    // neck and head
    const neck = b.chain(
      `neck${tag}`,
      catmull([T(0, 0.33, 0.12), T(0, 0.38, 0.22), T(0, 0.48, 0.255), T(0, 0.61, 0.31)]),
      { parent: front, count: 3, role: "neck" },
    );
    b.sweep(neck, (t: number) => (0.058 - 0.022 * t) * k, { color: coat });
    const head = b.joint(`head${tag}`, { parent: neck.joints[2], at: H(0, 0, 0), dir: Dr(0, -0.12, 1), role: "head" });
    const hk = hs * k;
    b.part(sph(10, 7), coat, { bone: head, at: H(0, 0.01, 0.03), scale: [0.042 * hk, 0.042 * hk, 0.05 * hk] });
    b.capsule(H(0, -0.005, 0.06), H(0, -0.03, 0.115), [0.031 * hk, 0.028 * hk], { bone: head, color: coat, sides: 8 });
    b.part(sph(7, 5), "#f3d9a4", { bone: head, at: H(0, -0.03, 0.12), scale: [0.03 * hk, 0.022 * hk, 0.02 * hk] });
    for (const s of [1, -1]) {
      b.part(sph(5, 4), EYE, { bone: head, at: H(s * 0.013, -0.025, 0.135), scale: [0.006 * hk, 0.005 * hk, 0.005 * hk] });
      b.part(sph(7, 5), EYE, { bone: head, at: H(s * 0.037, 0.025, 0.055), scale: [0.012 * hk, 0.014 * hk, 0.012 * hk] });
      b.part(sph(5, 4), WHITE, { bone: head, at: H(s * 0.045, 0.031, 0.06), scale: [0.004 * hk, 0.005 * hk, 0.004 * hk] });
      b.capsule(H(s * 0.036, 0.043, 0.04), H(s * 0.04, 0.04, 0.072), 0.008 * hk, { bone: head, color: coat, sides: 5 });
      for (let i = 0; i < 3; i++)
        b.spike(H(s * 0.04, 0.036, 0.05 + i * 0.008), Dr(s * (0.5 + i * 0.2), 0.7, 0.4 + i * 0.3), 0.022 * hk, 0.0022 * hk, {
          color: EYE,
          bone: head,
          sides: 4,
        });
      b.spike(H(s * 0.026, 0.055, -0.005), Dr(s * 0.6, 1, -0.2), 0.034 * hk, 0.012 * hk, { color: coat, bone: head, sides: 5 });
      b.spike(H(s * 0.026, 0.058, -0.003), Dr(s * 0.6, 1, -0.2), 0.02 * hk, 0.006 * hk, { color: PINK, bone: head, sides: 5 });
      b.rod(H(s * 0.03, -0.012, 0.085), H(s * 0.032, 0.035, 0.01), 0.004 * hk, RED, { bone: head, sides: 4 });
    }
    b.part(new THREE.TorusGeometry(0.034 * hk, 0.0055 * hk, 4, 9), RED, {
      bone: head,
      at: H(0, -0.02, 0.085),
      dir: Dr(0, -0.2, 1),
      axis: "z",
    });
    b.spike(H(0, 0.04, 0.0), Dr(0, 1, -0.4), 0.04 * hk, 0.01 * hk, { color: HAIR, bone: head, sides: 5 });
    b.spike(H(0, 0.04, 0.02), Dr(0, 1, 0.1), 0.03 * hk, 0.009 * hk, { color: HAIR, bone: head, sides: 5 });

    const jaw = b.joint(`jaw${tag}`, { parent: head, at: H(0, -0.02, 0.04), aim: H(0, -0.04, 0.11), role: "jaw" });
    b.capsule(H(0, -0.028, 0.045), H(0, -0.045, 0.105), 0.017 * hk, { bone: jaw, color: coat, sides: 7 });
    b.part(sph(6, 4), "#f3d9a4", { bone: jaw, at: H(0, -0.047, 0.115), scale: [0.02 * hk, 0.013 * hk, 0.014 * hk] });
    b.spike(H(0, -0.055, 0.1), Dr(0, -1, 0.1), 0.025 * hk, 0.008 * hk, { color: HAIR, bone: jaw, sides: 5 });

    // collar and bell
    const cp = neck.at(0.55);
    b.part(new THREE.TorusGeometry((0.058 - 0.022 * 0.55 + 0.007) * k, 0.007 * k, 4, 9), RED, {
      bone: cp.bone as any,
      at: cp.at,
      dir: cp.tangent,
      axis: "z",
    });
    b.part(sph(7, 5), GOLD, {
      bone: cp.bone as any,
      at: [cp.at.x + Dr(0, 0, 1)[0] * 0.045 * k, cp.at.y - 0.015 * k, cp.at.z + Dr(0, 0, 1)[2] * 0.045 * k],
      scale: [0.014 * k, 0.014 * k, 0.014 * k],
    });

    // legs
    for (const isFront of [true, false]) {
      for (const s of [1, -1]) {
        const side = s > 0 ? "L" : "R";
        const z = isFront ? 0.115 : -0.13;
        const root = T(s * 0.06, 0.29, z);
        const foot = T(s * 0.062, 0.012, z + (isFront ? 0.01 : -0.005));
        const bends: V[] = isFront ? [Dr(0, 0, -1), Dr(0, 0, 1)] : [Dr(0, 0, 1), Dr(0, 0, -1)];
        const pts = limb(root, foot, [0.13 * k, 0.12 * k, 0.045 * k], bends);
        const names = isFront
          ? [`shoulder${side}${tag}`, `elbow${side}${tag}`, `wrist${side}${tag}`, `hand${side}${tag}`]
          : [`hip${side}${tag}`, `knee${side}${tag}`, `ankle${side}${tag}`, `foot${side}${tag}`];
        const leg = b.chain(`leg${isFront ? "F" : "H"}${side}${tag}`, pts, {
          parent: isFront ? front : hips,
          names,
          role: "leg",
          contact: [foot[0], G, foot[2]],
        });
        b.sweep(leg, [0.034 * k, 0.026 * k, 0.02 * k, 0.02 * k], { color: coat });
        b.part(sph(8, 5), PAD, {
          bone: leg.tip ?? leg.joints[2],
          at: foot,
          scale: [0.03 * k, 0.012 * k, 0.04 * k],
        });
        if (isFront) {
          const kn = pts[2];
          b.part(sph(6, 4), HAIR, {
            bone: leg.joints[2],
            at: [kn.x, kn.y, kn.z],
            scale: [0.024 * k, 0.026 * k, 0.024 * k],
          });
        }
      }
    }
  };
  camel("", 0.45, 0.88, -1.25, 0.92, 1.15, CAMEL, BLANKET);
  camel("Calf", -0.1, 0.9, 0.35, 0.58, 1.3, CALF, BLANKET2);

  return b.root;
}
