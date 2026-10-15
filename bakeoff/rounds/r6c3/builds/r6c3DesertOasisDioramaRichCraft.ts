import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  bezier,
  catmull,
  mottle,
  countershade,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Oasis Caravan",
  description:
    "A whimsical low-poly desert oasis diorama: a turquoise pond ringed with stones and lotus, date palms, a striped pavilion and a ridge tent, a campfire with cushions, bunting, a signpost, a sandstone mesa, and a rigged caravan of two camels and a baby camel.",
};

type Pt = [number, number] | [number, number, "sharp"];

const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const TOP = 0.27; // height of the sand surface
const TO_DEG = 180 / Math.PI;

/** Local-to-model transform for a placed object: origin, yaw about Y, uniform scale. */
const xf = (ox: number, oy: number, oz: number, yaw = 0, k = 1) => ({
  yaw,
  k,
  P: (x: number, y: number, z: number) =>
    new THREE.Vector3(x * k, y * k, z * k).applyAxisAngle(UP, yaw).add(new THREE.Vector3(ox, oy, oz)),
  D: (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyAxisAngle(UP, yaw),
});

// ------------------------------------------------------------------------------------------------
// Palette
const INK = "#2b1a14";
const GOLD = "#e0a82e";
const WOOD = "#7b5030";
const WOOD_D = "#5a3a22";
const ROPE = "#d9c08a";
const CREAM = "#f7e8c4";
const RED = "#d4483a";
const TEAL = "#2a9d8f";
const SAFFRON = "#f0b73a";
const MAGENTA = "#c2457a";
const HOOF = "#4a3426";
const LEAF_D = "#2f7d3f";

// ------------------------------------------------------------------------------------------------
// Paints
const SAND = paint((p, n) => {
  const rip = Math.sin(p.x * 30 + p.z * 13 + noise(p, 0.2, 4) * 9);
  let c = mix("#e2ae66", "#f7dd9c", smoothstep(-0.1, 0.9, n.y));
  c = mix(c, "#cf9650", smoothstep(0.55, 1, rip) * 0.4 * smoothstep(0.3, 0.9, n.y));
  c = mix(c, "#fbebbd", smoothstep(0.62, 0.72, noise(p, 0.35, 9)) * 0.45);
  c = mix(c, "#b97a3e", smoothstep(0.3, -0.4, n.y) * 0.5);
  return c;
});

const STRATA = ["#8a4f2e", "#a8683a", "#c28a4c", "#9a5a33", "#d3a35e"];
const BASEP = paint((p, n) => {
  if (n.y > 0.85) return SAND;
  const y = p.y + (noise(p, 0.25, 5) - 0.5) * 0.03;
  const i = Math.floor(y / 0.045);
  const f = y / 0.045 - i;
  let c = mix(STRATA[((i % 5) + 5) % 5], "#4a2a1a", smoothstep(0.1, -0.7, n.y) * 0.35);
  if (f < 0.1) c = mix(c, "#4a2a1a", 0.45);
  return c;
});

const MESA_COLS = ["#c66a3c", "#e0935a", "#b4552f", "#eaa86a", "#9c4a2c"];
const MESA = paint((p, n) => {
  if (n.y > 0.8) return mix("#f0c883", "#e2ae66", noise(p, 0.1, 3));
  const i = Math.floor((p.y - TOP) / 0.05 + noise(p, 0.15, 6) * 0.8);
  return mix(MESA_COLS[((i % 5) + 5) % 5], "#5a2a1c", smoothstep(0.2, -0.6, n.y) * 0.35);
});

const ROCK = mottle("#c4a074", "#8e6a4a", { size: 0.12, seed: 2 });

const FROND = paint((_p, _n, s) => {
  const across = Math.abs(s[1] - 0.5) * 2;
  if (across < 0.07) return "#d9e89a";
  const c = mix("#2a7a3e", "#6fcb55", smoothstep(0, 0.9, s[0]));
  const leaf = (s[0] * 15 + across * 2.2) % 1;
  return leaf < 0.38 ? mix(c, "#1e5c34", 0.5) : c;
});

// ------------------------------------------------------------------------------------------------
// Textures
const DOOR = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<path d="M5 80 V36 Q5 5 30 5 Q55 5 55 36 V80Z" fill="#f0b73a"/>
<path d="M9 80 V37 Q9 9 30 9 Q51 9 51 37 V80Z" fill="#2a1630"/>
<ellipse cx="30" cy="62" rx="9" ry="12" fill="#ffb347"/>
<path d="M30 11 Q14 16 10 80 H24 Q23 42 30 11Z" fill="#c4413a"/>
<path d="M30 11 Q46 16 50 80 H36 Q37 42 30 11Z" fill="#c4413a"/>
<path d="M30 11 Q19 20 17 80 M30 11 Q41 20 43 80" stroke="#8c2a2c" stroke-width="2" fill="none"/>
<rect x="9" y="44" width="14" height="4" fill="#f0b73a"/><rect x="37" y="44" width="14" height="4" fill="#f0b73a"/>
<circle cx="30" cy="9" r="3.5" fill="#f0b73a"/>
</svg>`,
  { size: 192 },
);

const DOOR_A = svg(
  `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
<path d="M3 70 L30 3 L57 70Z" fill="#7b5030"/>
<path d="M9 70 L30 11 L51 70Z" fill="#2a1630"/>
<path d="M30 11 L9 70 H27Z" fill="#2a9d8f"/>
<path d="M30 11 L51 70 H33Z" fill="#2a9d8f"/>
<path d="M30 11 L18 70 M30 11 L42 70" stroke="#1a6a60" stroke-width="2"/>
<circle cx="30" cy="8" r="3" fill="#f0b73a"/>
<ellipse cx="30" cy="60" rx="4" ry="6" fill="#ffb347"/>
</svg>`,
  { size: 160 },
);

const LANTERN = svg(
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="40" fill="#3a2410"/>
<rect x="3" y="3" width="26" height="34" rx="3" fill="#ffc94d"/>
<path d="M16 6 L25 20 L16 34 L7 20Z" fill="#fff1b8"/>
<circle cx="16" cy="20" r="4" fill="#ffffff"/>
<path d="M3 12 H29 M3 28 H29" stroke="#3a2410" stroke-width="2"/>
</svg>`,
  { size: 64 },
);

const rugTex = (base: string, mid: string, gold: string) =>
  svg(
    `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
<path d="M0 6H8M0 14H8M0 22H8M0 30H8M0 38H8M0 46H8M0 54H8M92 6H100M92 14H100M92 22H100M92 30H100M92 38H100M92 46H100M92 54H100" stroke="#f3e3b0" stroke-width="3"/>
<rect x="8" y="0" width="84" height="64" fill="${base}"/>
<rect x="13" y="5" width="74" height="54" fill="none" stroke="${gold}" stroke-width="3"/>
<path d="M50 11 L76 32 L50 53 L24 32Z" fill="${mid}" stroke="${gold}" stroke-width="2.5"/>
<path d="M50 21 L63 32 L50 43 L37 32Z" fill="${gold}"/>
<circle cx="50" cy="32" r="3.5" fill="${base}"/>
<path d="M20 9 l4 0 l-2 4z M32 9 l4 0 l-2 4z M44 9 l4 0 l-2 4z M56 9 l4 0 l-2 4z M68 9 l4 0 l-2 4z M20 55 l4 0 l-2 -4z M32 55 l4 0 l-2 -4z M44 55 l4 0 l-2 -4z M56 55 l4 0 l-2 -4z M68 55 l4 0 l-2 -4z" fill="${gold}"/>
</svg>`,
    { size: 256 },
  );
const RUG_A = rugTex("#9c2f3a", "#2c6e7d", "#f3d27a");
const RUG_B = rugTex("#2c5f7d", "#b8453a", "#f3d27a");

const flagTex = (mirror: boolean) =>
  svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><g ${mirror ? 'transform="translate(64 0) scale(-1 1)"' : ""}>
<path d="M0 1H62L48 20L62 39H0Z" fill="#1f9d8f" stroke="#145f58" stroke-width="2" stroke-linejoin="round"/>
<path d="M0 1H8V39H0Z" fill="#f0b73a"/>
<circle cx="26" cy="20" r="11" fill="#ffe28a"/><circle cx="30" cy="18" r="9.5" fill="#1f9d8f"/>
<polygon points="40,13.5 41.9,18.2 47,18.5 43,21.8 44.3,26.7 40,24 35.7,26.7 37,21.8 33,18.5 38.1,18.2" fill="#ffe28a"/>
</g></svg>`,
    { size: 256 },
  );
const FLAG = flagTex(false);
const FLAG_B = flagTex(true);

const SIGN = svg(
  `<svg viewBox="0 0 120 56" xmlns="http://www.w3.org/2000/svg">
<path d="M4 6 H98 L116 28 L98 50 H4Z" fill="#c68a4a" stroke="#5b3416" stroke-width="3" stroke-linejoin="round"/>
<path d="M6 19 H98 M6 37 H98" stroke="#a06c36" stroke-width="2"/>
<circle cx="11" cy="12" r="2" fill="#4a2a14"/><circle cx="11" cy="44" r="2" fill="#4a2a14"/>
<text x="56" y="36" text-anchor="middle" font-family="serif" font-weight="bold" font-size="24" fill="#3a210e">OASIS</text>
<polygon points="86,22 98,28 86,34" fill="#3a210e"/>
</svg>`,
  { size: 384 },
);

const RIPPLE = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#eafffb" stroke-width="2" stroke-linecap="round">
<ellipse cx="50" cy="35" rx="14" ry="8" stroke-dasharray="30 12"/>
<ellipse cx="50" cy="35" rx="27" ry="15" stroke-dasharray="40 18"/>
<ellipse cx="50" cy="35" rx="40" ry="23" stroke-dasharray="22 34"/>
</g></svg>`,
  { size: 256 },
);

const PRINT = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="12" cy="16" rx="9" ry="12" fill="#bdbdbd"/><ellipse cx="28" cy="44" rx="9" ry="12" fill="#bdbdbd"/>
</svg>`,
  { size: 96 },
);

// ------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "oasis-caravan" });
  const R = rng(11);
  const root = b.joint("base", { at: [0, 0, 0] });
  type Bone = typeof root;

  // ---- tiny helpers -------------------------------------------------------------------------
  const ell = (
    color: ColorInput,
    at: THREE.Vector3,
    sx: number,
    sy: number,
    sz: number,
    o: { bone?: Bone; dir?: THREE.Vector3 | [number, number, number]; seg?: [number, number] } = {},
  ) =>
    b.part(new THREE.SphereGeometry(1, o.seg?.[0] ?? 8, o.seg?.[1] ?? 6), color, {
      bone: o.bone ?? root,
      at,
      dir: o.dir ?? [0, 0, 1],
      axis: "z",
      scale: [sx, sy, sz],
      flat: true,
    });

  const box = (
    color: ColorInput,
    at: THREE.Vector3,
    w: number,
    h: number,
    d: number,
    o: { bone?: Bone; yaw?: number } = {},
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, {
      bone: o.bone ?? root,
      at,
      rotation: [0, (o.yaw ?? 0) * TO_DEG, 0],
      flat: true,
    });

  const cyl = (
    color: ColorInput,
    at: THREE.Vector3,
    rt: number,
    rb: number,
    h: number,
    seg = 8,
    o: { bone?: Bone } = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: o.bone ?? root, at, flat: true });

  const rock = (x: number, z: number, s: number, col: ColorInput = ROCK, sy = 0.7) =>
    b.part(new THREE.IcosahedronGeometry(1, 0), col, {
      bone: root,
      at: V(x, TOP + s * sy * 0.25, z),
      scale: [s, s * sy, s * 0.85],
      rotation: [R() * 40, R() * 360, R() * 30],
      flat: true,
    });

  const lantern = (at: THREE.Vector3, bone: Bone, sc = 1, yaw = 0) => {
    const w = 0.034 * sc;
    const h = 0.046 * sc;
    glow(
      b.part(new THREE.BoxGeometry(w, h, w), "#ffffff", {
        bone,
        at,
        rotation: [0, yaw * TO_DEG, 0],
        texture: LANTERN,
      }),
      1.3,
    );
    b.part(new THREE.ConeGeometry(w * 0.85, h * 0.45, 4), GOLD, {
      bone,
      at: at.clone().add(V(0, h * 0.72, 0)),
      rotation: [0, 45 + yaw * TO_DEG, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(w * 0.5, w * 0.62, h * 0.14, 6), GOLD, {
      bone,
      at: at.clone().add(V(0, -h * 0.57, 0)),
      flat: true,
    });
    ell(GOLD, at.clone().add(V(0, h * 1.02, 0)), w * 0.18, w * 0.18, w * 0.18, { bone });
  };

  // ---- the base -----------------------------------------------------------------------------
  const BASE_OUT: Pt[] = [
    [0, 0],
    [1.1, 0],
    [1.17, 0.07],
    [1.12, 0.15],
    [1.18, 0.22],
    [1.12, TOP],
    [0, TOP],
  ];
  b.lathe(BASE_OUT, { at: [0, 0, 0], bone: root, segments: 22, color: BASEP });

  // dunes
  const dune = (x: number, z: number, rx: number, rz: number, h: number, yaw: number) =>
    ell(SAND, V(x, TOP - h * 0.3, z), rx, h, rz, { dir: [Math.sin(yaw), 0, Math.cos(yaw)], seg: [10, 6] });
  dune(0.05, -0.72, 0.38, 0.26, 0.2, 0.25);
  dune(0.62, -0.62, 0.2, 0.18, 0.18, -0.5);
  dune(0.88, -0.08, 0.13, 0.2, 0.12, 0.2);
  dune(0.76, 0.52, 0.12, 0.15, 0.08, 0.4);
  dune(-0.2, -0.82, 0.18, 0.12, 0.17, 0.9);
  dune(-0.95, 0.5, 0.1, 0.14, 0.07, 0.1);

  // sandstone mesa, back left
  const mesa = (x: number, z: number, sc: number) => {
    const OUT: Pt[] = [
      [0, 0],
      [0.22, 0],
      [0.21, 0.1],
      [0.245, 0.16],
      [0.2, 0.18],
      [0.19, 0.3],
      [0.22, 0.34],
      [0.17, 0.37],
      [0.16, 0.46],
      [0.12, 0.5],
      [0, 0.5],
    ];
    b.lathe(
      OUT.map((q) => [q[0] * sc, q[1] * sc] as Pt),
      { at: V(x, TOP - 0.01, z), bone: root, segments: 7, color: MESA },
    );
  };
  mesa(-0.64, -0.5, 1);
  mesa(-0.86, -0.3, 0.55);
  rock(-0.45, -0.62, 0.06);
  rock(-0.78, -0.62, 0.05);
  rock(-0.5, -0.38, 0.04);

  // ---- the pond -----------------------------------------------------------------------------
  const pcx = -0.1;
  const pcz = 0.14;
  const prx = 0.4;
  const prz = 0.28;
  const WATER = paint((p, n) => {
    if (n.y < 0.5) return "#1b7f9a";
    const d = Math.hypot((p.x - pcx) / prx, (p.z - pcz) / prz);
    let c = mix("#1a8fb4", "#4fd7d0", smoothstep(0.1, 0.95, d));
    c = mix(c, "#e2fff6", smoothstep(0.86, 0.97, d) * 0.75);
    c = mix(c, "#ffffff", smoothstep(0.78, 0.86, noise(p, 0.08, 2)) * 0.25);
    return c;
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.012, 18), "#a9753c", {
    bone: root,
    at: V(pcx, TOP + 0.004, pcz),
    scale: [prx * 1.16, 1, prz * 1.16],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.014, 18), WATER, {
    bone: root,
    at: V(pcx, TOP + 0.007, pcz),
    scale: [prx, 1, prz],
    flat: true,
  });
  b.part(new THREE.PlaneGeometry(0.5, 0.35), "#ffffff", {
    bone: root,
    at: V(pcx + 0.02, TOP + 0.0165, pcz),
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: RIPPLE,
  });

  // stones around the rim
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    const j = 1.17 + R() * 0.1;
    rock(pcx + Math.cos(a) * prx * j, pcz + Math.sin(a) * prz * j, 0.026 + R() * 0.026, ROCK, 0.6);
  }

  // grass tufts and reeds
  const tuft = (x: number, z: number, hgt: number) => {
    for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + R();
      b.spike(V(x, TOP, z), V(Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5), hgt, 0.011, {
        color: i % 2 ? "#5ab548" : LEAF_D,
        bone: root,
        sides: 4,
      });
    }
  };
  for (let i = 0; i < 9; i++) {
    const a = 2.5 + i * 0.3;
    tuft(pcx + Math.cos(a) * prx * 1.3, pcz + Math.sin(a) * prz * 1.3, 0.06 + R() * 0.03);
  }
  for (let i = 0; i < 7; i++) {
    const a = 3.5 + i * 0.22;
    const x = pcx + Math.cos(a) * prx * 1.12;
    const z = pcz + Math.sin(a) * prz * 1.12;
    const hgt = 0.14 + R() * 0.07;
    b.spike(V(x, TOP, z), V(0.06, 1, 0.03), hgt, 0.007, { color: "#6ba43c", bone: root, sides: 4 });
    ell("#6b3b1c", V(x + 0.06 * hgt, TOP + hgt * 0.8, z + 0.03 * hgt), 0.008, 0.026, 0.008, { bone: root });
  }

  // lotus pads and flowers
  const pad = (x: number, z: number, r: number, flower: string | null) => {
    cyl("#4fb04a", V(x, TOP + 0.0185, z), r, r, 0.004, 7);
    if (flower) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.spike(
          V(x + Math.cos(a) * 0.008, TOP + 0.02, z + Math.sin(a) * 0.008),
          V(Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6),
          0.03,
          0.01,
          { color: flower, bone: root, sides: 4 },
        );
      }
      ell(SAFFRON, V(x, TOP + 0.026, z), 0.007, 0.007, 0.007);
    }
  };
  pad(-0.22, 0.2, 0.04, "#ff9ec4");
  pad(0.06, 0.06, 0.035, null);
  pad(0.12, 0.24, 0.045, "#ffffff");
  pad(-0.3, 0.06, 0.03, null);
  pad(-0.05, 0.28, 0.028, null);

  // jumping fish
  {
    const fp = V(-0.28, TOP + 0.11, 0.24);
    const fd = V(0.4, 0.8, 0.3).normalize();
    ell("#ff8a3c", fp, 0.016, 0.02, 0.05, { dir: fd });
    const tb = fp.clone().addScaledVector(fd, -0.045);
    b.spike(tb, fd.clone().negate().add(V(0.5, 0, 0)).normalize(), 0.04, 0.012, { color: "#ffb35c", bone: root });
    b.spike(tb, fd.clone().negate().add(V(-0.5, 0, 0)).normalize(), 0.04, 0.012, { color: "#ffb35c", bone: root });
    ell(INK, fp.clone().addScaledVector(fd, 0.03).add(V(0.012, 0.004, 0)), 0.004, 0.004, 0.004);
    for (let i = 0; i < 5; i++)
      ell("#d8fbff", V(-0.28 + (R() - 0.5) * 0.1, TOP + 0.03 + R() * 0.05, 0.22 + (R() - 0.5) * 0.08), 0.007, 0.007, 0.007);
  }

  // ---- palms ----------------------------------------------------------------------------------
  function palm(x: number, z: number, h: number, lx: number, lz: number, phase: number) {
    const base = V(x, TOP - 0.01, z);
    const top = base.clone().add(V(lx, h, lz));
    const trunk = catmull([
      base,
      base.clone().add(V(lx * 0.1, h * 0.33, lz * 0.1)),
      base.clone().add(V(lx * 0.45, h * 0.68, lz * 0.45)),
      top,
    ]);
    const BARK = paint((_p, n, s) => {
      const ring = Math.floor((s[0] * h) / 0.04);
      const c = mix(ring % 2 === 0 ? "#9a6a3e" : "#7a4d2b", "#4f3220", smoothstep(0.3, -0.8, n.y) * 0.5);
      return s[0] < 0.1 ? mix(c, "#3d2616", 0.4) : c;
    });
    b.sweep(trunk, [0.052, 0.035, 0.03, 0.028, 0.034], { bone: root, color: BARK, sides: 7, smooth: false });
    ell("#5f7f35", top.clone().add(V(0, 0.01, 0)), 0.045, 0.035, 0.045);

    const frond = (a: number, len: number, rise: number, droop: number) => {
      const dir = V(Math.sin(a), 0, Math.cos(a));
      const side = V(Math.cos(a), 0, -Math.sin(a));
      const w = len * 0.2;
      const at = (f: number, up: number, sd: number) =>
        top.clone().addScaledVector(dir, len * f).addScaledVector(UP, up).addScaledVector(side, sd);
      const m = len * (0.3 + rise);
      const m2 = len * (0.3 + rise * 0.6) - len * droop * 0.25;
      const A = bezier(at(0, 0.012, 0.006), at(0.35, m, w * 0.9), at(0.75, m2, w * 0.8), at(1, -len * droop, 0.004));
      const B = bezier(at(0, 0.012, -0.006), at(0.35, m, -w * 0.9), at(0.75, m2, -w * 0.8), at(1, -len * droop, -0.004));
      b.membrane(A, B, { color: FROND, thickness: 0.005, rows: 2, cols: 7, bone: root });
    };
    const N = 7;
    for (let i = 0; i < N; i++) {
      const a = phase + (i / N) * Math.PI * 2;
      frond(a, (h > 0.7 ? 0.3 : 0.25) * (0.9 + R() * 0.2), 0.05 + R() * 0.1, 0.4 + (i % 3 === 0 ? 0.35 : 0.1));
    }
    for (let i = 0; i < 4; i++) frond(phase + 0.4 + i * 1.57, 0.22, 0.45, 0.03);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ell("#b8662b", top.clone().add(V(Math.cos(a) * 0.028, -0.03 - R() * 0.02, Math.sin(a) * 0.028)), 0.013, 0.017, 0.013);
    }
    return { trunk, top };
  }
  palm(-0.58, -0.02, 0.78, 0.1, -0.02, 0.3);
  palm(-0.3, -0.34, 0.66, 0.08, 0.1, 1.1);
  const palm3 = palm(0.28, -0.04, 0.72, -0.1, 0.06, 0.7);
  palm(-0.06, -0.5, 0.52, 0.04, 0.08, 2.0);

  // ---- round striped pavilion ----------------------------------------------------------------
  const flag = (hoist: THREE.Vector3, w: number, h: number, n: THREE.Vector3) => {
    const side = V(n.z, 0, -n.x).normalize();
    const c = hoist.clone().addScaledVector(side, w / 2).addScaledVector(UP, -h / 2);
    const plane = () => new THREE.PlaneGeometry(w, h);
    b.part(plane(), "#ffffff", { bone: root, at: c.clone().addScaledVector(n, 0.002), dir: n, axis: "z", texture: FLAG });
    b.part(plane(), "#ffffff", {
      bone: root,
      at: c.clone().addScaledVector(n, -0.002),
      dir: n.clone().negate(),
      axis: "z",
      texture: FLAG_B,
    });
  };

  const t1 = { x: 0.5, z: -0.35, yaw: -Math.PI / 4 };
  let tent1Pole = V(0, 0, 0);
  {
    const T = xf(t1.x, TOP, t1.z, t1.yaw);
    const { P, D } = T;
    const TENT = paint((p, n) => {
      if (p.y - TOP < 0.016) return "#d89b2e";
      const a = Math.atan2(p.x - t1.x, p.z - t1.z);
      const i = Math.floor(a / (Math.PI / 4) - 0.5 + 8);
      const c = i % 2 === 0 ? RED : CREAM;
      return n.y < -0.3 ? mix(c, "#5a2a20", 0.6) : c;
    });
    const OUT: Pt[] = [
      [0, 0],
      [0.26, 0],
      [0.26, 0.13],
      [0.31, 0.15],
      [0.2, 0.25],
      [0.1, 0.34],
      [0.03, 0.4],
      [0, 0.42],
    ];
    b.lathe(OUT, { at: V(t1.x, TOP - 0.004, t1.z), bone: root, segments: 8, spin: 22.5, color: TENT });
    b.part(new THREE.PlaneGeometry(0.1, 0.12), "#ffffff", {
      bone: root,
      at: P(0, 0.062, 0.2435),
      dir: D(0, 0, 1),
      axis: "z",
      texture: DOOR,
    });
    // scalloped valance
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.03, 0.05, 4), i % 2 ? TEAL : SAFFRON, {
        bone: root,
        at: V(t1.x + Math.sin(a) * 0.298, TOP + 0.122, t1.z + Math.cos(a) * 0.298),
        dir: [0, -1, 0],
        flat: true,
      });
    }
    // finial, pole and flag
    const pole0 = P(0, 0.4, 0);
    tent1Pole = P(0, 0.58, 0);
    b.rod(pole0, tent1Pole, 0.006, WOOD, { bone: root });
    ell(GOLD, P(0, 0.595, 0), 0.015, 0.015, 0.015);
    flag(P(0, 0.565, 0), 0.12, 0.075, V(0.2, 0, 1).normalize());
    // lantern by the door
    lantern(P(0.17, 0.1, 0.27), root, 1.2, t1.yaw);
    b.rod(P(0.17, 0.125, 0.27), P(0.17, 0.15, 0.265), 0.003, INK, { bone: root });
    // guy-rope stakes
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const s1 = V(t1.x + Math.sin(a) * 0.31, TOP + 0.15, t1.z + Math.cos(a) * 0.31);
      const s2 = V(t1.x + Math.sin(a) * 0.42, TOP, t1.z + Math.cos(a) * 0.42);
      b.rod(s1, s2, 0.0035, ROPE, { bone: root });
      b.rod(s2.clone().add(V(0, 0.03, 0)), s2.clone().add(V(Math.sin(a) * 0.01, -0.005, Math.cos(a) * 0.01)), 0.007, WOOD, {
        bone: root,
      });
    }
  }

  // ---- ridge tent -----------------------------------------------------------------------------
  {
    const tx = 0.72;
    const tz = 0.1;
    const yaw = -1.1;
    const T = xf(tx, TOP, tz, yaw);
    const { P, D } = T;
    const fwd = D(0, 0, 1);
    const PRISM: Pt[] = [
      [-0.17, 0],
      [0.17, 0],
      [0, 0.25, "sharp"],
    ];
    const TENTA = paint((p, n) => {
      if (Math.abs(n.dot(fwd)) > 0.8) return mix(CREAM, "#d9c08a", smoothstep(0.1, 0.25, p.y - TOP) * 0.3);
      const i = Math.floor(p.dot(fwd) / 0.055);
      const c = i % 2 === 0 ? TEAL : CREAM;
      return n.y < 0 ? mix(c, "#3a2a20", 0.5) : c;
    });
    b.extrude(PRISM, {
      at: P(0, 0.002, 0),
      x: D(1, 0, 0),
      y: [0, 1, 0],
      thickness: 0.4,
      bevel: 0.004,
      color: TENTA,
      bone: root,
    });
    b.part(new THREE.PlaneGeometry(0.1, 0.115), "#ffffff", {
      bone: root,
      at: P(0, 0.06, 0.2035),
      dir: fwd,
      axis: "z",
      texture: DOOR_A,
    });
    b.rod(P(0, 0.25, -0.24), P(0, 0.25, 0.32), 0.007, WOOD, { bone: root });
    ell(GOLD, P(0, 0.25, 0.335), 0.014, 0.014, 0.014);
    ell(GOLD, P(0, 0.25, -0.255), 0.014, 0.014, 0.014);
    for (const s of [1, -1]) {
      b.rod(P(s * 0.12, 0, 0.3), P(0, 0.25, 0.3), 0.006, WOOD, { bone: root });
      // guy ropes
      for (const zz of [-1, 1]) {
        const a = P(s * 0.1, 0.103, zz * 0.15);
        const g = P(s * 0.3, 0, zz * 0.24);
        b.rod(a, g, 0.0035, ROPE, { bone: root });
        b.rod(g.clone().add(V(0, 0.03, 0)), g.clone().add(V(0, -0.005, 0)), 0.007, WOOD, { bone: root });
      }
    }
    b.rod(P(0, 0.25, 0.3), P(0, 0.232, 0.3), 0.003, INK, { bone: root });
    lantern(P(0, 0.205, 0.3), root, 1.1, yaw);
  }

  // ---- fire, rug and cushions --------------------------------------------------------------
  {
    const fx = 0.3;
    const fz = 0.4;
    b.part(new THREE.PlaneGeometry(0.46, 0.3), "#ffffff", {
      bone: root,
      at: V(fx, TOP + 0.004, fz + 0.02),
      dir: [0, 1, 0],
      axis: "z",
      up: V(Math.sin(0.25), 0, Math.cos(0.25)),
      texture: RUG_A,
    });
    const cushion = (x: number, z: number, col: string, accent: string) => {
      ell(col, V(x, TOP + 0.02, z), 0.05, 0.02, 0.05, { seg: [8, 5] });
      ell(accent, V(x, TOP + 0.036, z), 0.012, 0.01, 0.012);
      for (let i = 0; i < 4; i++) {
        const a = i * 1.57 + 0.78;
        b.spike(V(x + Math.cos(a) * 0.05, TOP + 0.02, z + Math.sin(a) * 0.05), V(Math.cos(a), -0.3, Math.sin(a)), 0.02, 0.008, {
          color: accent,
          bone: root,
          sides: 4,
        });
      }
    };
    cushion(0.17, 0.52, TEAL, SAFFRON);
    cushion(0.44, 0.53, MAGENTA, GOLD);
    cushion(0.12, 0.34, SAFFRON, RED);

    // stones, logs, flames
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      rock(fx + Math.cos(a) * 0.085, fz + Math.sin(a) * 0.085, 0.022, "#8f7a6a", 0.65);
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      b.rod(
        V(fx + Math.cos(a) * 0.07, TOP + 0.02, fz + Math.sin(a) * 0.07),
        V(fx - Math.cos(a) * 0.07, TOP + 0.03, fz - Math.sin(a) * 0.07),
        0.014,
        i % 2 ? WOOD_D : "#6b4226",
        { bone: root },
      );
    }
    const flame = (c: string, r: number, hgt: number, dx: number, dz: number, s: number) =>
      glow(
        b.part(new THREE.ConeGeometry(r, hgt, 6), c, {
          bone: root,
          at: V(fx + dx, TOP + 0.04 + hgt / 2, fz + dz),
          flat: true,
          scale: [1, s, 1],
        }),
        1.6,
      );
    flame("#ff6a1c", 0.05, 0.14, 0, 0, 1);
    flame("#ff9a2e", 0.035, 0.11, 0.03, 0.015, 1);
    flame("#ffb03a", 0.03, 0.1, -0.03, -0.01, 1);
    flame("#ffd84a", 0.028, 0.09, 0, 0, 1);
    flame("#fff2a0", 0.015, 0.06, 0, 0, 1);
    for (let i = 0; i < 4; i++)
      glow(ell("#ffb347", V(fx + (R() - 0.5) * 0.07, TOP + 0.17 + R() * 0.07, fz + (R() - 0.5) * 0.07), 0.005, 0.005, 0.005), 2);

    // tripod and hanging pot
    const apex = V(fx, TOP + 0.24, fz);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      b.rod(V(fx + Math.cos(a) * 0.12, TOP, fz + Math.sin(a) * 0.12), apex, 0.007, WOOD, { bone: root });
    }
    b.rod(apex, V(fx, TOP + 0.185, fz), 0.003, INK, { bone: root });
    const POT: Pt[] = [
      [0, 0],
      [0.028, 0],
      [0.048, 0.025],
      [0.052, 0.055],
      [0.046, 0.06],
      [0, 0.06],
    ];
    b.lathe(POT, { at: V(fx, TOP + 0.13, fz), bone: root, segments: 9, color: "#3b3b46" });
    cyl("#7bd6a0", V(fx, TOP + 0.186, fz), 0.044, 0.044, 0.004, 9);
    for (let i = 0; i < 3; i++) ell("#ffffff", V(fx + 0.01 * i, TOP + 0.24 + i * 0.04, fz + 0.01), 0.012 + i * 0.004, 0.012, 0.012);
  }

  // ---- crates, sacks, jars ----------------------------------------------------------------
  {
    const CRATE = paint((p, n) => {
      const g = Math.sin(p.y * 160 + noise(p, 0.05, 2) * 4);
      let c = mix("#a8723f", "#8a5a30", smoothstep(-0.5, 0.8, g));
      if (n.y > 0.8) c = mix(c, "#c28b52", 0.4);
      return c;
    });
    b.part(new THREE.BoxGeometry(0.1, 0.08, 0.1), CRATE, { bone: root, at: V(0.2, TOP + 0.04, -0.58), rotation: [0, 12, 0] });
    b.part(new THREE.BoxGeometry(0.08, 0.07, 0.08), CRATE, { bone: root, at: V(0.3, TOP + 0.035, -0.55), rotation: [0, -20, 0] });
    b.part(new THREE.BoxGeometry(0.07, 0.06, 0.07), CRATE, { bone: root, at: V(0.24, TOP + 0.11, -0.575), rotation: [0, 35, 0] });
    // crate straps
    for (const dx of [-0.03, 0.03])
      b.part(new THREE.BoxGeometry(0.012, 0.082, 0.102), WOOD_D, { bone: root, at: V(0.2 + dx, TOP + 0.04, -0.58), rotation: [0, 12, 0] });
    ell("#d9a05b", V(0.12, TOP + 0.04, -0.52), 0.04, 0.05, 0.035, { dir: [0.3, 0, 1] });
    ell("#c98e4a", V(0.37, TOP + 0.03, -0.5), 0.035, 0.04, 0.03, { dir: [-0.5, 0, 1] });
    b.spike(V(0.12, TOP + 0.085, -0.52), UP, 0.02, 0.012, { color: ROPE, bone: root, sides: 5 });

    const JAR_OUT: Pt[] = [
      [0, 0],
      [0.03, 0],
      [0.045, 0.04],
      [0.05, 0.07],
      [0.03, 0.115],
      [0.022, 0.14],
      [0.03, 0.15],
      [0.03, 0.162],
      [0, 0.162],
    ];
    const jar = (x: number, z: number, sc: number, a: string, c: string) => {
      const GLAZE = paint((_p, _n, s) => {
        const hh = s[0] / sc;
        if (hh > 0.052 && hh < 0.062) return c;
        if (hh > 0.082 && hh < 0.09) return c;
        return a;
      });
      b.lathe(
        JAR_OUT.map((q) => [q[0] * sc, q[1] * sc] as Pt),
        { at: V(x, TOP, z), bone: root, segments: 8, color: GLAZE },
      );
      for (const s of [1, -1])
        b.rod(V(x + s * 0.03 * sc, TOP + 0.12 * sc, z), V(x + s * 0.05 * sc, TOP + 0.08 * sc, z), 0.005 * sc, a, { bone: root });
    };
    jar(0.4, 0.04, 1.1, "#c4663a", CREAM);
    jar(0.47, 0.1, 0.8, "#b8553a", SAFFRON);
    jar(-0.25, -0.2, 0.7, "#c4663a", TEAL);
  }

  // ---- bunting from the pavilion pole to the palm ---------------------------------------------
  {
    const a = tent1Pole.clone().add(V(0, -0.03, 0));
    const c = palm3.trunk.at(0.6);
    const mid = a.clone().lerp(c, 0.5);
    mid.y -= 0.09;
    const line = catmull([a, mid, c]);
    b.sweep(line, 0.003, { color: ROPE, bone: root, sides: 4 });
    const cols = [RED, SAFFRON, TEAL, MAGENTA, CREAM];
    const PENNANT: Pt[] = [
      [-0.024, 0],
      [0.024, 0],
      [0, -0.06, "sharp"],
    ];
    for (let i = 1; i <= 9; i++) {
      const t = i / 10;
      const pt = line.at(t);
      const tg = line.tangentAt(t);
      const tx = V(tg.x, 0, tg.z).normalize();
      b.extrude(PENNANT, {
        at: pt,
        x: [tx.x, 0, tx.z],
        y: [0, 1, 0],
        thickness: 0.004,
        color: cols[i % cols.length],
        bone: root,
      });
    }
  }

  // ---- signpost ----------------------------------------------------------------------------------
  {
    const sx = -0.85;
    const sz = -0.12;
    const yaw = 0.6;
    const T = xf(sx, TOP, sz, yaw);
    const { P, D } = T;
    b.rod(P(0, -0.01, 0), P(0, 0.3, 0), 0.01, WOOD_D, { bone: root });
    const BOARD: Pt[] = [
      [-0.1025, -0.039],
      [0.07, -0.039],
      [0.1025, 0],
      [0.07, 0.039],
      [-0.1025, 0.039],
    ];
    b.extrude(BOARD, { at: P(0.02, 0.24, 0.012), x: D(1, 0, 0), y: [0, 1, 0], thickness: 0.012, color: "#8a5a30", bone: root });
    b.part(new THREE.PlaneGeometry(0.22, 0.1), "#ffffff", {
      bone: root,
      at: P(0.02, 0.24, 0.0205),
      dir: D(0, 0, 1),
      axis: "z",
      texture: SIGN,
    });
    ell(GOLD, P(0, 0.31, 0), 0.014, 0.014, 0.014);
    rock(sx + 0.05, sz + 0.03, 0.03);
    tuft(sx - 0.04, sz + 0.04, 0.06);
    // a little bird perched on the sign finial
    const BIRD = "#2a9d8f";
    ell(BIRD, P(0, 0.337, 0), 0.016, 0.016, 0.026, { dir: D(0, 0, 1) });
    ell(CREAM, P(0, 0.328, 0.006), 0.012, 0.01, 0.018, { dir: D(0, 0, 1) });
    ell(BIRD, P(0, 0.355, 0.02), 0.012, 0.012, 0.012);
    b.spike(P(0, 0.354, 0.03), D(0, -0.1, 1), 0.024, 0.005, { color: SAFFRON, bone: root });
    b.spike(P(0, 0.335, -0.02), D(0, 0.1, -1), 0.04, 0.008, { color: "#1f6f66", bone: root });
    b.spike(P(0, 0.364, 0.016), D(0, 1, -0.4), 0.02, 0.005, { color: MAGENTA, bone: root });
    for (const sd of [1, -1]) ell(INK, P(sd * 0.008, 0.358, 0.026), 0.003, 0.003, 0.003);
    // fireflies drifting over the oasis
    for (let i = 0; i < 9; i++)
      glow(
        ell("#fff6a0", V(-0.1 + (R() - 0.5) * 0.9, TOP + 0.22 + R() * 0.3, 0.14 + (R() - 0.5) * 0.6), 0.007, 0.007, 0.007),
        2,
      );
  }

  // ---- cacti ----------------------------------------------------------------------------------
  {
    const cactus = (x: number, z: number, hgt: number) => {
      const RIB = paint((p, n) => {
        const a = Math.atan2(p.x - x, p.z - z);
        let c = mix("#4c9a4a", "#6cc058", smoothstep(-0.3, 0.9, n.y));
        if (Math.sin(a * 6) > 0.7) c = mix(c, "#2f6f3a", 0.5);
        return c;
      });
      const base = V(x, TOP - 0.01, z);
      b.sweep(
        catmull([base, base.clone().add(V(0, hgt * 0.5, 0)), base.clone().add(V(0, hgt, 0))]),
        [0.03, 0.028, 0.022],
        { bone: root, color: RIB, sides: 6, smooth: false },
      );
      for (const s of [1, -1]) {
        const a = base.clone().add(V(0, hgt * (s > 0 ? 0.45 : 0.62), 0));
        b.sweep(
          catmull([a, a.clone().add(V(s * 0.04, 0.0, 0)), a.clone().add(V(s * 0.06, 0.04, 0)), a.clone().add(V(s * 0.06, 0.09, 0))]),
          [0.015, 0.014, 0.012],
          { bone: root, color: RIB, sides: 6, smooth: false },
        );
        ell("#ff6fa0", a.clone().add(V(s * 0.06, 0.105, 0)), 0.01, 0.008, 0.01);
      }
      ell("#ff6fa0", base.clone().add(V(0, hgt + 0.02, 0)), 0.014, 0.01, 0.014);
    };
    cactus(0.84, 0.36, 0.15);
    // barrel cactus
    ell(mottle("#4c9a4a", "#7ed06a", { size: 0.03, seed: 4 }), V(0.66, TOP + 0.03, 0.62), 0.04, 0.045, 0.04, { seg: [9, 6] });
    ell("#ffd54a", V(0.66, TOP + 0.077, 0.62), 0.012, 0.008, 0.012);
    rock(0.76, 0.66, 0.03);
    rock(0.9, 0.2, 0.025);
  }

  // ---- footprints -------------------------------------------------------------------------------
  {
    const pts: [number, number][] = [
      [0.16, 0.6],
      [0.11, 0.55],
      [0.07, 0.5],
      [0.02, 0.45],
      [-0.02, 0.4],
    ];
    pts.forEach(([x, z], i) => {
      const side = i % 2 ? 1 : -1;
      b.part(new THREE.PlaneGeometry(0.045, 0.065), "#e8b878", {
        bone: root,
        at: V(x + side * 0.012, TOP + 0.0025, z),
        dir: [0, 1, 0],
        axis: "z",
        up: V(-0.45, 0, -0.9),
        texture: PRINT,
      });
    });
  }

  // ---- the camels (built last so every part names its own bone) -----------------------------
  const coatPaint = (a: string, c: string, belly: string, seed: number) =>
    countershade(mottle(a, c, { size: 0.12, seed, contrast: 0.8 }), belly, { level: -0.25 });
  const COAT_A = coatPaint("#d3a05a", "#c28d49", "#ecd0a0", 3);
  const COAT_B = coatPaint("#b9824a", "#a8723c", "#e0c08f", 5);
  const COAT_C = coatPaint("#eecb8e", "#e2b878", "#faeccb", 7);

  function camel(id: string, ox: number, oz: number, yaw: number, k: number, kind: "packs" | "rugs" | "baby", coat: ColorInput) {
    const T = xf(ox, TOP, oz, yaw, k);
    const { P, D } = T;
    const s = (v: number) => v * k;
    const FWD = D(0, 0, 1);
    const E = (col: ColorInput, at: THREE.Vector3, sx: number, sy: number, sz: number, bone: Bone, dir: THREE.Vector3 = FWD) =>
      ell(col, at, s(sx), s(sy), s(sz), { bone, dir });

    // skeleton
    const spine = b.chain(
      "spine" + id,
      catmull([P(0, 0.215, -0.145), P(0, 0.22, -0.07), P(0, 0.225, 0.03), P(0, 0.23, 0.115)]),
      { parent: root, names: ["hips" + id, "spineMid" + id, "chest" + id], role: "spine" },
    );
    const [hips, mid, chest] = spine.joints;
    const neck = b.chain(
      "neck" + id,
      catmull([P(0, 0.235, 0.1), P(0, 0.27, 0.16), P(0, 0.345, 0.185), P(0, 0.405, 0.2), P(0, 0.43, 0.225)]),
      { parent: chest, names: ["neck1" + id, "neck2" + id, "neck3" + id, "neck4" + id], role: "neck" },
    );
    const HD = D(0, -0.33, 0.94);
    const head = b.joint("head" + id, { parent: neck.joints[3], at: P(0, 0.43, 0.225), dir: HD, role: "head" });
    const hf = V(0, -0.33, 0.94);
    const hu = V(0, 0.94, 0.33);
    const hc = V(0, 0.43, 0.225);
    const hl = (x: number, u: number, f: number) => {
      const q = hc.clone().addScaledVector(hf, f).addScaledVector(hu, u);
      return P(q.x + x, q.y, q.z);
    };
    const jaw = b.joint("jaw" + id, { parent: head, at: hl(0, -0.02, 0.0), aim: hl(0, -0.03, 0.09), role: "jaw" });
    const tail = b.chain(
      "tail" + id,
      catmull([P(0, 0.21, -0.15), P(0, 0.19, -0.2), P(0, 0.15, -0.225), P(0, 0.1, -0.23)]),
      { parent: hips, names: ["tail1" + id, "tail2" + id, "tail3" + id], role: "tail" },
    );

    // body, neck, tail
    const body = b.sweep(spine, (t: number) => [s(0.05 + 0.012 * Math.sin(t * Math.PI)), s(0.06 + 0.012 * t)], {
      color: coat,
      sides: 8,
      smooth: false,
      shift: [0, -s(0.01)],
    });
    const neckTube = b.sweep(neck, (t: number) => s(0.04 - 0.017 * t), { color: coat, sides: 7, smooth: false });
    b.sweep(tail, (t: number) => s(0.012 - 0.005 * t), { color: coat, sides: 5, smooth: false });
    E(INK, P(0, 0.09, -0.232), 0.012, 0.026, 0.012, tail.joints[2]);
    E(coat, P(0, 0.292, -0.015), kind === "baby" ? 0.032 : 0.04, kind === "baby" ? 0.04 : 0.05, 0.055, mid);

    // mane tufts under and along the neck
    for (let i = 1; i <= 5; i++) {
      const t = 0.12 + i * 0.14;
      const lo = neckTube.at(t, 180);
      b.spike(lo, lo, s(0.034), s(0.011), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor(t * 4))] });
    }
    for (let i = 1; i <= 2; i++) {
      const hi = neckTube.at(0.2 + i * 0.16, 0);
      b.spike(hi, hi, s(0.015), s(0.01), { color: o_mane(coat), bone: neck.joints[Math.min(3, Math.floor((0.2 + i * 0.16) * 4))] });
    }

    // head
    E(coat, hl(0, 0, 0.02), 0.03, 0.034, 0.04, head, HD);
    E(coat, hl(0, -0.012, 0.075), 0.021, 0.02, 0.045, head, HD);
    E("#7a5236", hl(0, -0.008, 0.118), 0.022, 0.017, 0.012, head, HD);
    for (const sd of [1, -1]) {
      E(INK, hl(sd * 0.009, 0.002, 0.128), 0.004, 0.005, 0.004, head, HD);
      b.rod(hl(sd * 0.016, -0.024, 0.04), hl(sd * 0.017, -0.022, 0.108), s(0.0025), INK, { bone: head });
      // eye
      const eye = ell(INK, hl(sd * 0.028, 0.016, 0.035), s(0.016), s(0.016), s(0.016), {
        bone: head,
        dir: D(sd * 0.8, 0.2, 0.6),
        seg: [6, 5],
      });
      E("#ffffff", hl(sd * 0.0405, 0.0235, 0.044), 0.0055, 0.0055, 0.0055, head);
      b.ring(eye, { count: 4, radius: s(0.009), fromDeg: -70, toDeg: 70, tilt: 40 }, (l) =>
        b.spike(l, l, s(0.014), s(0.0025), { color: INK, bone: head }),
      );
      E(coat, hl(sd * 0.027, 0.028, 0.03), 0.012, 0.007, 0.016, head, HD);
      // ears
      b.spike(hl(sd * 0.024, 0.032, -0.012), D(sd * 0.5, 0.9, -0.3), s(0.034), s(0.011), { color: coat, bone: head });
      b.spike(hl(sd * 0.024, 0.05, -0.016), D(sd * 0.5, 0.9, -0.3), s(0.012), s(0.0055), { color: INK, bone: head });
    }
    b.spike(hl(0, 0.03, 0.0), D(0, 0.8, -0.5), s(0.03), s(0.014), { color: o_mane(coat), bone: head });
    // lower jaw
    E(coat, hl(0, -0.032, 0.062), 0.016, 0.012, 0.04, jaw, HD);
    b.spike(hl(0, -0.042, 0.1), D(0, -1, 0.2), s(0.024), s(0.007), { color: o_mane(coat), bone: jaw });

    // legs
    const legs: { L: string; sd: number }[] = [
      { L: "L", sd: 1 },
      { L: "R", sd: -1 },
    ];
    for (const { L, sd } of legs) {
      // front
      const fPts = limb(
        P(sd * 0.045, 0.185, 0.075),
        P(sd * 0.05, 0.013, 0.085),
        [s(0.07), s(0.07), s(0.045)],
        [D(0, 0, -1), D(0, 0, 1)],
      );
      const fl = b.chain("legF" + L + id, fPts, {
        parent: chest,
        names: ["shoulder" + L + id, "elbow" + L + id, "knee" + L + id, "hand" + L + id],
        role: "leg",
      });
      b.sweep(fl, (t: number) => s(0.024 - 0.012 * t), { color: coat, sides: 6, smooth: false });
      E(coat, P(sd * 0.05, 0.185, 0.075), 0.027, 0.04, 0.045, fl.joints[0]);
      E(INK, fl.joints[2].at.clone().add(D(0, 0, 0.012).multiplyScalar(k)), 0.014, 0.014, 0.012, fl.joints[2]);
      b.part(new THREE.CylinderGeometry(s(0.017), s(0.021), s(0.026), 6), HOOF, {
        bone: fl.joints[3],
        at: fPts[3],
        flat: true,
      });
      // hind
      const hPts = limb(
        P(sd * 0.048, 0.2, -0.115),
        P(sd * 0.05, 0.013, -0.125),
        [s(0.08), s(0.08), s(0.05)],
        [D(0, 0, 1), D(0, 0, -1)],
      );
      const hl2 = b.chain("legH" + L + id, hPts, {
        parent: hips,
        names: ["hip" + L + id, "stifle" + L + id, "hock" + L + id, "foot" + L + id],
        role: "leg",
      });
      b.sweep(hl2, (t: number) => s(0.028 - 0.016 * t), { color: coat, sides: 6, smooth: false });
      E(coat, P(sd * 0.05, 0.185, -0.115), 0.03, 0.045, 0.05, hl2.joints[0]);
      b.part(new THREE.CylinderGeometry(s(0.017), s(0.021), s(0.026), 6), HOOF, {
        bone: hl2.joints[3],
        at: hPts[3],
        flat: true,
      });
    }

    // load and trappings
    const BL = [RED, CREAM, TEAL, SAFFRON];
    const blanket = paint((p) => {
      const u = Math.floor(p.dot(FWD) / s(0.0075));
      return BL[((u % 4) + 4) % 4];
    });
    const loop = b.surface(body).loop(mid, { lift: s(0.004) });
    b.sweep(loop, () => [s(0.03), s(0.005)], { section: "box", color: blanket, bone: mid });

    if (kind === "packs") {
      for (const sd of [1, -1]) {
        E("#d9a05b", P(sd * 0.09, 0.19, -0.07), 0.035, 0.05, 0.04, mid, D(sd * 0.3, 0, 1));
        E("#b9783c", P(sd * 0.09, 0.235, -0.07), 0.012, 0.012, 0.012, mid);
        b.rod(P(sd * 0.03, 0.272, -0.07), P(sd * 0.085, 0.222, -0.07), s(0.004), ROPE, { bone: mid });
      }
      b.rod(P(0.07, 0.345, -0.015), P(-0.07, 0.345, -0.015), s(0.022), "#a2493c", { bone: mid });
      for (const dx of [-0.045, 0.045])
        b.rod(P(dx, 0.345, -0.015), P(dx + 0.006, 0.345, -0.015), s(0.0245), ROPE, { bone: mid });
      E(CREAM, P(0.072, 0.345, -0.015), 0.006, 0.022, 0.022, mid, D(1, 0, 0));
    } else if (kind === "rugs") {
      const cs = [MAGENTA, TEAL, SAFFRON];
      cs.forEach((c, i) =>
        b.part(new THREE.BoxGeometry(s(0.13 - i * 0.01), s(0.03), s(0.11)), c, {
          bone: mid,
          at: P(0, 0.355 + i * 0.03, -0.015),
          rotation: [0, (yaw + i * 0.12) * TO_DEG, 0],
          flat: true,
        }),
      );
      for (const sd of [1, -1])
        b.rod(P(sd * 0.05, 0.345, -0.015), P(sd * 0.075, 0.28, -0.04), s(0.004), ROPE, { bone: mid });
      b.rod(P(0.06, 0.34, -0.05), P(0.07, 0.56, -0.05), s(0.004), WOOD, { bone: mid });
      b.rod(P(0.07, 0.56, -0.05), P(0.07, 0.56, 0.01), s(0.004), WOOD, { bone: mid });
      b.rod(P(0.07, 0.56, 0.01), P(0.07, 0.54, 0.01), s(0.002), INK, { bone: mid });
      lantern(P(0.07, 0.515, 0.01), mid, k, yaw);
      for (const sd of [1, -1]) {
        b.spike(P(sd * 0.065, 0.4, -0.015), D(sd, -0.4, 0), s(0.03), s(0.008), { color: SAFFRON, bone: mid });
      }
    } else {
      // baby: ribbon collar with a bell and a flower garland on the hump
      const ring = b.ring(neck.at(0.5), { count: 10, radius: s(0.036) });
      b.sweep(catmull(ring.items, { closed: true }), s(0.0045), { color: MAGENTA, bone: neck.joints[1], sides: 5 });
      const low = ring.items[5];
      ell(GOLD, low.at.clone().add(V(0, -s(0.012), 0)), s(0.011), s(0.011), s(0.011), { bone: neck.joints[1] });
      ell(INK, low.at.clone().add(V(0, -s(0.019), s(0.004))), s(0.003), s(0.003), s(0.003), { bone: neck.joints[1] });
      const gc = [MAGENTA, SAFFRON, "#ffffff", TEAL];
      for (let i = 0; i < 6; i++) {
        const a = (i / 5) * Math.PI;
        E(gc[i % 4], P(Math.cos(a) * 0.045, 0.31 + Math.sin(a) * 0.035, -0.015), 0.01, 0.01, 0.01, mid);
      }
    }

    return { spine, neck, jaw, head };
  }

  // mane colour follows the coat (kept as a plain colour, since paints cannot colour spikes cheaply)
  function o_mane(coat: ColorInput): string {
    return coat === COAT_A ? "#8a5a2c" : coat === COAT_B ? "#6f4524" : "#c99a5e";
  }

  camel("", -0.6, 0.58, 0.75, 1.15, "packs", COAT_A);
  camel("2", 0.1, 0.72, -0.9, 1.15, "rugs", COAT_B);
  camel("3", -0.88, 0.18, 0.5, 0.85, "baby", COAT_C);

  return b.root;
}
