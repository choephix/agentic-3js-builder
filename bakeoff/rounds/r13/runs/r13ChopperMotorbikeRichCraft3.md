```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  arc,
  spiral,
  offset,
  paint,
  mix,
  rgb,
  smoothstep,
  noise,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Overdrive Chopper",
  description:
    "A heroic custom chopper in a hand-painted, Overwatch-like style: raked fork, fat rear tire, ape-hanger bars, orange and navy tank with a badge, a glowing cyan energy cell, laced mag wheels and a V-twin with blued drag pipes. Rigged with steering and wheel joints.",
};

// ---------------------------------------------------------------------------------------------------------------
// Types and small math helpers

type V = [number, number, number];
type C3 = readonly [number, number, number];
type Path = ReturnType<typeof catmull>;

const fract = (x: number) => x - Math.floor(x);
const tri = (x: number) => Math.abs(fract(x) * 2 - 1);
const rad = (d: number) => (d * Math.PI) / 180;
const polar = (c: V, R: number, deg: number, x = 0): V => [x, c[1] + R * Math.cos(rad(deg)), c[2] + R * Math.sin(rad(deg))];

// ---------------------------------------------------------------------------------------------------------------
// Palette

const ORANGE = "#ff8a1e";
const NAVY = "#1f2d4d";
const SLATE = "#34456b";
const GUNMETAL = "#4a5672";
const FINMETAL = "#8f9bb7";
const CREAM = "#f6eedb";
const CYAN = "#38e8ff";
const RED = "#ff3b2e";
const RUBBER = "#171a22";
const DARK = "#0d1018";

// ---------------------------------------------------------------------------------------------------------------
// Paint helpers: painterly toon lighting (warm top, cool shadow), wear and dust

function cool(c: C3): C3 {
  return [c[0] * 0.56, c[1] * 0.6, Math.min(1, c[2] * 0.76 + 0.08)];
}

function toon(base: string | C3, n: THREE.Vector3, hi = 0.14): C3 {
  const c = rgb(base);
  const l = n.y * 0.7 + n.z * 0.35 + n.x * 0.15;
  const lit = mix(cool(c), c, smoothstep(-0.5, 0.3, l));
  return mix(lit, [1, 0.96, 0.85], smoothstep(0.7, 0.96, l) * hi);
}

function finish(c: C3, p: THREE.Vector3, wear = 0.16): C3 {
  const k = smoothstep(0.63, 0.78, noise(p, 0.05, 7)) * wear;
  const out = mix(c, [0.06, 0.06, 0.09], k);
  const dust = smoothstep(0.38, 0.05, p.y) * (0.3 + 0.7 * noise(p, 0.08, 11));
  return mix(out, [0.5, 0.42, 0.32], dust * 0.45);
}

const solid = (base: string, hi = 0.14, wear = 0.12) => paint((p, n) => finish(toon(base, n, hi), p, wear));

function chromeC(n: THREE.Vector3): C3 {
  let c = mix([0.55, 0.5, 0.46], [0.78, 0.9, 1.0], smoothstep(-0.14, 0.14, n.y));
  c = mix(c, [0.16, 0.22, 0.36], (1 - smoothstep(0.0, 0.22, Math.abs(n.y))) * 0.85);
  c = mix(c, [1, 1, 1], smoothstep(0.8, 0.97, n.y) * 0.7);
  return c;
}

const CHROME = paint((p, n) => {
  const dust = smoothstep(0.25, 0.03, p.y) * 0.25 * noise(p, 0.06, 5);
  return mix(chromeC(n), [0.5, 0.42, 0.32], dust);
});

const ORANGE_P = solid(ORANGE, 0.24);
const NAVY_P = solid(NAVY, 0.16);
const SLATE_P = solid(SLATE, 0.2);
const GUN_P = solid(GUNMETAL, 0.18, 0.22);
const FIN_P = solid(FINMETAL, 0.2, 0.1);
const RUBBER_P = solid(RUBBER, 0.06, 0.05);

// Fuel tank: orange with a cream racing stripe on top and a jagged navy skirt.
const TANK = paint((p, n) => {
  const ax = Math.abs(p.x);
  let base = ORANGE;
  if (n.y > 0.4) {
    if (ax < 0.024) base = CREAM;
    else if (ax < 0.036) base = NAVY;
  } else if (n.y < -0.45) {
    base = NAVY;
  } else {
    const edge = 0.93 + 0.026 * tri(p.z / 0.09);
    if (p.y < edge) base = NAVY;
    else if (p.y < edge + 0.009) base = CREAM;
  }
  return finish(toon(base, n, 0.22), p, 0.14);
});

const fenderPaint = (half: number) =>
  paint((p, n) => {
    const ax = Math.abs(p.x);
    let base = ORANGE;
    if (ax < half * 0.2) base = CREAM;
    else if (ax < half * 0.3) base = NAVY;
    else if (ax > half * 0.84) base = NAVY;
    return finish(toon(base, n, 0.2), p, 0.2);
  });

// Quilted seat with orange stitching.
const SEAT = paint((p, n) => {
  const u = (p.x + p.z) / 0.07;
  const v = (p.x - p.z) / 0.07;
  const d = Math.min(Math.abs(fract(u) - 0.5), Math.abs(fract(v) - 0.5));
  if (n.y > 0.4 && d > 0.44) return toon(ORANGE, n, 0.1);
  const puff = 1 + 0.35 * (0.5 - d);
  const c = toon("#2b2433", n, 0.16);
  return [Math.min(c[0] * puff, 1), Math.min(c[1] * puff, 1), Math.min(c[2] * puff, 1)] as C3;
});

// Exhaust: chrome that blues and golds near the cylinder heads.
const PIPE = paint((p, n) => {
  const d = Math.hypot(p.x, p.y - 0.68, p.z + 0.02);
  const heat = smoothstep(0.5, 0.12, d);
  const hc = mix([0.92, 0.72, 0.28], [0.36, 0.3, 0.8], smoothstep(0.1, 0.32, d));
  return mix(chromeC(n), hc, heat * 0.85);
});

// ---------------------------------------------------------------------------------------------------------------
// Fork geometry constants (shared by paints and the build)

const WR = 0.39;
const WF = 0.37;
const SINK = 0.006;
const RAX: V = [0, WR - SINK, -0.88];
const FAX: V = [0, WF - SINK, 1.08];
const HEAD: V = [0, 1.02, 0.42];
const D = new THREE.Vector3(FAX[0] - HEAD[0], FAX[1] - HEAD[1], FAX[2] - HEAD[2]);
const FL = D.length();
D.normalize();
const onFork = (t: number, x = 0): V => [x, HEAD[1] + D.y * t, HEAD[2] + D.z * t];

const SLIDER = paint((p, n) => {
  const tt = (p.y - HEAD[1]) * D.y + (p.z - HEAD[2]) * D.z;
  let base = NAVY;
  if (tt > 0.8 && tt < 0.825) base = ORANGE;
  else if (tt > 0.835 && tt < 0.845) base = "#6ff0ff";
  else if (tt > 0.6 && tt < 0.62) base = CREAM;
  return finish(toon(base, n, 0.2), p, 0.15);
});

// ---------------------------------------------------------------------------------------------------------------
// Tire paint: chevron lugs, pin-stripes, fake lettering, road dust

const tirePaint = (cy: number, cz: number, R: number) =>
  paint((p, n, s) => {
    const rr = Math.hypot(p.y - cy, p.z - cz);
    let c: C3;
    if (Math.abs(n.x) < 0.5) {
      const lug = ((((s[1] + (s[0] > 0 ? 5.5 : 0)) % 11) + 11) % 11) < 6;
      c = lug ? toon("#2e323e", n, 0.1) : toon("#10131a", n, 0.02);
    } else {
      c = toon("#171a22", n, 0.05);
      const ang = Math.atan2(p.z - cz, p.y - cy);
      if (rr > R - 0.112 && rr < R - 0.1) c = toon(CREAM, n, 0);
      else if (rr > R - 0.128 && rr < R - 0.12) c = toon(ORANGE, n, 0);
      else if (rr > R - 0.078 && rr < R - 0.056 && fract(ang / 0.17) < 0.55) c = toon(CREAM, n, 0);
    }
    const dust = smoothstep(0.3, 0.03, p.y) * (0.35 + 0.65 * noise(p, 0.07, 3));
    return mix(c, [0.48, 0.4, 0.3], dust * 0.5);
  });

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EMBLEM = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="61" fill="#0e1730" stroke="#ff8a1e" stroke-width="6"/>
  <circle cx="64" cy="64" r="49" fill="#1f2d4d" stroke="#38e8ff" stroke-width="2.5"/>
  <path d="M10 68 L38 50 L44 59 L22 74 Z" fill="#ff8a1e" stroke="#0e1730" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M118 68 L90 50 L84 59 L106 74 Z" fill="#ff8a1e" stroke="#0e1730" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M73 15 L35 76 L58 76 L47 114 L95 52 L70 52 L84 15 Z" fill="#f6eedb" stroke="#0e1730" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M40 88 L88 88" stroke="#ff8a1e" stroke-width="3.5" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const gaugeTicks = (() => {
  let out = "";
  for (let i = 0; i <= 12; i++) {
    const a = rad(-135 + (i * 270) / 12);
    const r0 = i % 3 === 0 ? 32 : 36;
    out += `<path d="M${(50 + 41 * Math.sin(a)).toFixed(1)} ${(50 - 41 * Math.cos(a)).toFixed(1)} L${(50 + r0 * Math.sin(a)).toFixed(1)} ${(50 - r0 * Math.cos(a)).toFixed(1)}" stroke="${i > 9 ? "#ff5a3a" : "#38e8ff"}" stroke-width="${i % 3 === 0 ? 3.2 : 1.8}" stroke-linecap="round"/>`;
  }
  return out;
})();

const GAUGE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#0a1226"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#38e8ff" stroke-width="2.4"/>
  ${gaugeTicks}
  <path d="M50 50 L70 30" stroke="#ff8a1e" stroke-width="4.5" stroke-linecap="round"/>
  <text x="50" y="76" text-anchor="middle" font-size="10" font-weight="bold" font-family="sans-serif" fill="#f6eedb">KM/H</text>
  <circle cx="50" cy="50" r="5.5" fill="#f6eedb" stroke="#0a1226" stroke-width="1.5"/>
</svg>`,
  { size: 256 },
);

const LENS = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.45" cy="0.4" r="0.7">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#d6fbff"/><stop offset="1" stop-color="#4fdcf2"/>
  </radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="url(#g)"/>
  <path d="M50 4 L50 96 M4 50 L96 50 M17 17 L83 83 M83 17 L17 83" stroke="#9defff" stroke-width="1.6" opacity="0.7"/>
  <circle cx="50" cy="50" r="20" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.9"/>
</svg>`,
  { size: 192 },
);

const PLATE = svg(
  `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="156" height="76" rx="10" fill="#f1cf4b" stroke="#1f2d4d" stroke-width="5"/>
  <rect x="9" y="9" width="142" height="62" rx="6" fill="none" stroke="#1f2d4d" stroke-width="1.8"/>
  <text x="80" y="50" text-anchor="middle" font-size="31" font-weight="bold" font-family="monospace" fill="#1f2d4d">OVRDRV</text>
  <path d="M14 20 L24 14 L22 22 L32 16" stroke="#ff8a1e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <text x="80" y="66" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#1f2d4d" letter-spacing="3">ROAD HERO</text>
</svg>`,
  { size: 256 },
);

const CIRCUIT = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#38e8ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="12"/>
    <circle cx="50" cy="50" r="40" stroke-width="2.4"/>
    <path d="M50 38 L50 22 L68 22 L68 12"/>
    <path d="M62 50 L80 50 L80 66 L90 66"/>
    <path d="M50 62 L50 80 L32 80 L32 90"/>
    <path d="M38 50 L20 50 L20 34 L10 34"/>
    <path d="M59 41 L72 30"/><path d="M41 59 L28 70"/>
  </g>
  <g fill="#38e8ff"><circle cx="68" cy="12" r="4"/><circle cx="90" cy="66" r="4"/><circle cx="32" cy="90" r="4"/><circle cx="10" cy="34" r="4"/><circle cx="50" cy="50" r="5"/></g>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Glow: makes a part emit its own colours (standard emissive material properties)

const glowCache = new WeakMap<THREE.Material, Map<number, THREE.MeshStandardMaterial>>();
function glow<T>(target: T, strength = 1): T {
  const t = target as unknown as { mesh?: THREE.Mesh; meshes?: THREE.Mesh[] };
  const meshes = t.meshes ?? (t.mesh ? [t.mesh] : []);
  for (const mesh of meshes) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    let by = glowCache.get(mat);
    if (!by) {
      by = new Map();
      glowCache.set(mat, by);
    }
    let copy = by.get(strength);
    if (!copy) {
      copy = mat.clone();
      copy.emissive.copy(mat.color);
      copy.emissiveMap = mat.map;
      copy.emissiveIntensity = strength;
      by.set(strength, copy);
    }
    mesh.material = copy;
  }
  return target;
}

// ---------------------------------------------------------------------------------------------------------------

const tireProfile = (R: number, hw: number): [number, number][] => [
  [R - 0.15, -hw * 0.72],
  [R - 0.085, -hw * 0.98],
  [R - 0.03, -hw * 0.9],
  [R - 0.004, -hw * 0.5],
  [R - 0.004, hw * 0.5],
  [R - 0.03, hw * 0.9],
  [R - 0.085, hw * 0.98],
  [R - 0.15, hw * 0.72],
];

const annulus = (r0: number, r1: number, x0: number, x1: number): [number, number][] => [
  [r0, x0],
  [r1, x0],
  [r1, x1],
  [r0, x1],
];

const sprocketOutline = (n: number, r0: number, r1: number): [number, number, "sharp"][] => {
  const out: [number, number, "sharp"][] = [];
  const st = (Math.PI * 2) / n;
  const prof: [number, number][] = [
    [0, r0],
    [0.14, r1],
    [0.36, r1],
    [0.5, r0],
  ];
  for (let i = 0; i < n; i++) {
    for (const [da, r] of prof) {
      const ang = (i + da) * st;
      out.push([Math.sin(ang) * r, Math.cos(ang) * r, "sharp"]);
    }
  }
  return out;
};

export default function build() {
  const b = createBuilder({ name: "overdrive_chopper" });
  type J = ReturnType<typeof b.joint>;
  type Col = string | ReturnType<typeof paint>;
  type P = V | THREE.Vector3;

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton

  const chassis = b.joint("chassis", { at: [0, 0.6, -0.1], dir: [0, 0, 1] });
  const steering = b.joint("steering", { parent: chassis, at: HEAD, aim: FAX });
  const wheelF = b.joint("wheelF", { parent: steering, at: FAX, dir: [1, 0, 0] });
  const wheelR = b.joint("wheelR", { parent: chassis, at: RAX, dir: [1, 0, 0] });
  const KS0: V = [0.13, 0.27, -0.05];
  const KS1: V = [0.25, 0.235, 0.2];
  const kickstand = b.joint("kickstand", { parent: chassis, at: KS0, aim: KS1, role: "hinge" });

  // ------------------------------------------------------------------------------------------------------------
  // Placement helpers

  const cylG = (rTop: number, rBot: number, h: number, seg = 10) => new THREE.CylinderGeometry(rTop, rBot, h, seg);

  type PutOpts = {
    dir?: P;
    up?: P;
    axis?: "x" | "y" | "z";
    flat?: boolean;
    texture?: THREE.Texture;
    scale?: V;
  };
  const put = (g: THREE.BufferGeometry, col: Col, bone: J, at: P, o: PutOpts = {}) =>
    b.part(g, col, { bone, at, ...o, flat: o.flat ?? true });

  const rod = (
    a: P,
    c: P,
    r: number | [number, number],
    col: Col,
    bone: J,
    o: { sides?: number; caps?: "round" | "flat" | "point" | "none" } = {},
  ) => b.rod(a, c, r, col, { bone, sides: 8, ...o });

  const tube = (path: Path, r: number | number[], col: Col, bone: J, o: { sides?: number; caps?: "round" | "flat" | "point" | "none" } = {}) =>
    b.sweep(path, r, { color: col, bone, sides: 8, ...o });

  const cm = (pts: P[]) => catmull(pts);

  const cylAB = (a: V, c: V, r: number, col: Col, bone: J, seg = 10, r2 = r) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const m = A.clone().add(C).multiplyScalar(0.5);
    return put(cylG(r2, r, A.distanceTo(C), seg), col, bone, m, { dir: C.clone().sub(A) });
  };

  const ball = (at: P, r: number, col: Col, bone: J, seg = 8) =>
    put(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), col, bone, at);

  const box = (at: P, size: V, col: Col, bone: J, o: PutOpts = {}) =>
    put(new THREE.BoxGeometry(size[0], size[1], size[2]), col, bone, at, o);

  // ------------------------------------------------------------------------------------------------------------
  // Wheels

  const mkWheel = (j: J, c: V, R: number, hw: number, rear: boolean) => {
    b.lathe(tireProfile(R, hw), {
      at: c,
      axis: [1, 0, 0],
      bone: j,
      segments: 28,
      color: tirePaint(c[1], c[2], R),
    });
    const a = hw * 0.74;
    const rin = R - 0.24;
    const rout = R - 0.135;
    b.lathe(annulus(rin, rout, -a, a), { at: c, axis: [1, 0, 0], bone: j, segments: 28, color: SLATE_P });
    for (const s of [1, -1]) {
      const x0 = s > 0 ? a : -a - 0.006;
      glow(
        b.lathe(annulus(rin + 0.012, rin + 0.034, x0, x0 + 0.006), {
          at: c,
          axis: [1, 0, 0],
          bone: j,
          segments: 28,
          color: CYAN,
        }),
        1.4,
      );
    }

    // laced spokes
    const n = rear ? 8 : 7;
    const hubA = rear ? 0.09 : 0.05;
    const rimA = rear ? 0.07 : 0.035;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + (rear ? 0.2 : 0.1);
      const flip = i % 2 ? 1 : -1;
      const hubP: V = [c[0] + flip * hubA, c[1] + Math.cos(ang) * 0.05, c[2] + Math.sin(ang) * 0.05];
      const rimP: V = [c[0] - flip * rimA, c[1] + Math.cos(ang) * (rin + 0.012), c[2] + Math.sin(ang) * (rin + 0.012)];
      rod(hubP, rimP, [0.017, 0.011], CHROME, j, { sides: 6 });
    }

    // hub, flanges and emblem caps
    const len = rear ? 0.24 : 0.17;
    put(cylG(0.055, 0.055, len, 10), CHROME, j, c, { dir: [1, 0, 0] });
    for (const s of [1, -1]) {
      put(cylG(0.085, 0.085, 0.016, 10), NAVY_P, j, [c[0] + s * (len / 2 - 0.012), c[1], c[2]], { dir: [1, 0, 0] });
      put(cylG(0.05, 0.05, 0.012, 12), ORANGE_P, j, [c[0] + s * (len / 2 + 0.002), c[1], c[2]], { dir: [1, 0, 0] });
      put(new THREE.CircleGeometry(0.046, 16), "#ffffff", j, [c[0] + s * (len / 2 + 0.009), c[1], c[2]], {
        dir: [s, 0, 0],
        axis: "z",
        texture: EMBLEM,
        flat: false,
      });
    }

    // brake disc with a caliper
    const dx = rear ? -0.09 : 0.045;
    const r0 = rear ? 0.105 : 0.088;
    const r1 = rear ? 0.148 : 0.126;
    b.lathe(annulus(r0, r1, dx, dx + 0.007), { at: c, axis: [1, 0, 0], bone: j, segments: 20, color: CHROME });
    const cdir: V = [0, 0.6, -0.8];
    const rc = (r0 + r1) / 2;
    box(
      [c[0] + dx + 0.004, c[1] + cdir[1] * rc, c[2] + cdir[2] * rc],
      [0.034, 0.07, 0.05],
      ORANGE_P,
      rear ? chassis : steering,
    );
  };

  mkWheel(wheelR, RAX, WR, 0.13, true);
  mkWheel(wheelF, FAX, WF, 0.065, false);

  // axles
  rod([-0.25, RAX[1], RAX[2]], [0.25, RAX[1], RAX[2]], 0.02, CHROME, chassis, { sides: 8 });
  rod([-0.17, FAX[1], FAX[2]], [0.17, FAX[1], FAX[2]], 0.02, CHROME, steering, { sides: 8 });
  for (const s of [1, -1]) {
    put(cylG(0.032, 0.032, 0.022, 6), CHROME, chassis, [s * 0.255, RAX[1], RAX[2]], { dir: [1, 0, 0] });
    put(cylG(0.03, 0.03, 0.02, 6), CHROME, steering, [s * 0.175, FAX[1], FAX[2]], { dir: [1, 0, 0] });
  }

  // belt-drive sprocket on the rear wheel
  b.extrude(sprocketOutline(18, 0.1, 0.122), {
    at: [0.158, RAX[1], RAX[2]],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.018,
    color: CHROME,
    bone: wheelR,
  });
  // pulley on the transmission and the belt
  const PUL: V = [0.158, 0.36, -0.33];
  put(cylG(0.055, 0.055, 0.03, 12), CHROME, chassis, PUL, { dir: [1, 0, 0] });
  put(cylG(0.062, 0.062, 0.008, 12), NAVY_P, chassis, [0.178, PUL[1], PUL[2]], { dir: [1, 0, 0] });
  rod([0.158, RAX[1] + 0.12, RAX[2]], [0.158, PUL[1] + 0.055, PUL[2]], 0.011, RUBBER_P, chassis, { sides: 6 });
  rod([0.158, RAX[1] - 0.12, RAX[2]], [0.158, PUL[1] - 0.055, PUL[2]], 0.011, RUBBER_P, chassis, { sides: 6 });

  // ------------------------------------------------------------------------------------------------------------
  // Frame

  tube(cm([[0, 1.0, 0.4], [0, 0.93, 0.22], [0, 0.87, -0.05], [0, 0.82, -0.25], [0, 0.745, -0.46]]), 0.04, NAVY_P, chassis);
  tube(cm([[0, 0.98, 0.4], [0, 0.75, 0.33], [0, 0.5, 0.23], [0, 0.32, 0.12]]), 0.04, NAVY_P, chassis);
  for (const s of [1, -1]) {
    // cradle rail and chain stay
    tube(
      cm([[0, 0.31, 0.11], [s * 0.12, 0.28, 0.02], [s * 0.13, 0.28, -0.22], [s * 0.2, 0.34, -0.46], [s * 0.2, RAX[1], RAX[2]]]),
      0.028,
      NAVY_P,
      chassis,
    );
    // seat stay
    tube(
      cm([[0, 0.745, -0.46], [s * 0.1, 0.7, -0.49], [s * 0.19, 0.62, -0.55], [s * 0.2, 0.52, -0.72], [s * 0.2, RAX[1], RAX[2]]]),
      0.028,
      NAVY_P,
      chassis,
    );
    // dropout plates and glow strips along the cradle
    box([s * 0.205, RAX[1], RAX[2]], [0.028, 0.13, 0.13], ORANGE_P, chassis);
    glow(rod([s * 0.13, 0.252, 0.0], [s * 0.13, 0.252, -0.2], 0.007, CYAN, chassis, { sides: 5 }), 1.3);
  }
  // engine mount plates
  box([0, 0.66, -0.02], [0.05, 0.14, 0.05], NAVY_P, chassis);
  ball(onFork(0, 0), 0.0, NAVY_P, steering, 4);

  // ------------------------------------------------------------------------------------------------------------
  // Front fork, head tube, triple trees

  cylAB(onFork(-0.13), onFork(0.13), 0.05, NAVY_P, steering, 10);
  cylAB(onFork(-0.14), onFork(-0.115), 0.057, CHROME, steering, 10);
  cylAB(onFork(0.115), onFork(0.14), 0.057, CHROME, steering, 10);
  box(onFork(-0.095), [0.34, 0.042, 0.09], ORANGE_P, steering, { dir: D });
  box(onFork(0.12), [0.3, 0.04, 0.1], NAVY_P, steering, { dir: D });
  put(cylG(0.032, 0.032, 0.028, 6), CHROME, steering, onFork(-0.125), { dir: D });

  const FORK_X = 0.125;
  for (const s of [1, -1]) {
    const x = s * FORK_X;
    rod(onFork(-0.14, x), onFork(0.52, x), 0.026, CHROME, steering);
    rod(onFork(0.44, x), onFork(FL, x), 0.037, SLIDER, steering);
    for (let k = 0; k < 5; k++) put(cylG(0.034, 0.034, 0.012, 8), RUBBER_P, steering, onFork(0.37 + k * 0.016, x), { dir: D });
    put(cylG(0.03, 0.03, 0.03, 8), CHROME, steering, onFork(-0.15, x), { dir: D });
    box(onFork(FL - 0.012, x), [0.05, 0.1, 0.1], NAVY_P, steering, { dir: D });
    glow(rod(onFork(0.62, x + s * 0.034), onFork(0.78, x + s * 0.034), 0.006, CYAN, steering, { sides: 5 }), 1.3);
  }

  // headlight
  const HL0: V = [0, 0.93, 0.56];
  const HLdir = new THREE.Vector3(0, -0.08, 1).normalize();
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.088, 0.03],
      [0.088, 0.1],
      [0.076, 0.125],
      [0, 0.125],
    ],
    { at: HL0, axis: HLdir, bone: steering, segments: 14, color: ORANGE_P },
  );
  b.lathe(annulus(0.07, 0.096, 0.116, 0.138), { at: HL0, axis: HLdir, bone: steering, segments: 14, color: CHROME });
  glow(
    put(new THREE.CircleGeometry(0.074, 16), "#ffffff", steering, offset(HL0, HLdir, 0.139), {
      dir: HLdir,
      axis: "z",
      texture: LENS,
      flat: false,
    }),
    1.3,
  );
  for (const s of [1, -1]) rod([s * FORK_X, 0.945, 0.5], [s * 0.082, 0.935, 0.6], 0.012, CHROME, steering, { sides: 6 });

  // ------------------------------------------------------------------------------------------------------------
  // Handlebars (ape hangers), grips, levers, mirrors, cables

  for (const s of [1, -1]) {
    const bar = cm([
      [s * 0.09, 1.1, 0.34],
      [s * 0.12, 1.3, 0.29],
      [s * 0.17, 1.42, 0.24],
      [s * 0.3, 1.46, 0.2],
      [s * 0.4, 1.4, 0.12],
      [s * 0.43, 1.31, 0.03],
    ]);
    tube(bar, 0.018, CHROME, steering);
    tube(cm([bar.at(0.8), bar.at(0.9), bar.at(1)]), 0.028, RUBBER_P, steering);
    ball(bar.at(1), 0.02, CHROME, steering, 8);
    box([s * 0.09, 1.12, 0.335], [0.05, 0.045, 0.05], CHROME, steering);

    // lever
    const L0 = bar.at(0.78);
    const L1 = offset(L0, [s * 0.1, -0.25, 0.96], 0.13);
    rod(L0, L1, 0.007, CHROME, steering, { sides: 5 });
    ball(L1, 0.012, CHROME, steering, 6);

    // mirror on a stalk
    const M0 = bar.at(0.58);
    const M1 = offset(M0, [s * 0.35, 0.93, -0.12], 0.15);
    rod(M0, M1, 0.008, CHROME, steering, { sides: 5 });
    put(cylG(0.062, 0.062, 0.02, 12), NAVY_P, steering, offset(M1, [0, 0.5, 0.0], 0.04), {
      dir: [0, 0.25, -1],
      scale: [1.15, 1, 0.85],
    });
    put(cylG(0.052, 0.052, 0.022, 12), "#a8dcff", steering, offset(M1, [0, 0.5, -0.1], 0.04), {
      dir: [0, 0.25, -1],
      scale: [1.15, 1, 0.85],
    });

    // control cable
    tube(cm([L0, [s * 0.3, 1.3, 0.2], [s * 0.14, 1.12, 0.3], [s * 0.04, 1.0, 0.37]]), 0.005, DARK, steering, { sides: 5 });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Fenders

  // rear: crowned, bobbed
  const RF_R = WR + 0.035;
  const rearFenderPath = arc([0, RAX[1], RAX[2]], polar(RAX, RF_R, -72), [1, 0, 0], 125);
  b.sweep(rearFenderPath, () => [0.16, 0.028], {
    color: fenderPaint(0.16),
    bone: chassis,
    section: { ngon: 8 },
    caps: "flat",
  });
  for (const s of [1, -1]) {
    glow(
      b.sweep(
        arc([s * 0.168, RAX[1], RAX[2]], polar(RAX, RF_R + 0.005, -64, s * 0.168), [1, 0, 0], 100),
        0.006,
        { color: CYAN, bone: chassis, sides: 5 },
      ),
      1.3,
    );
    rod([s * 0.2, 0.62, -0.6], polar(RAX, RF_R, 30, s * 0.145), 0.013, CHROME, chassis, { sides: 6 });
    rod([s * 0.205, RAX[1], RAX[2]], polar(RAX, RF_R, -50, s * 0.145), 0.013, CHROME, chassis, { sides: 6 });
  }

  // taillight and plate
  box([0, 0.485, -1.3], [0.12, 0.052, 0.045], NAVY_P, chassis);
  glow(box([0, 0.485, -1.325], [0.1, 0.036, 0.012], RED, chassis), 1.5);
  box([0, 0.396, -1.343], [0.215, 0.115, 0.01], DARK, chassis);
  put(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", chassis, [0, 0.396, -1.35], {
    dir: [0, 0.05, -1],
    axis: "z",
    texture: PLATE,
    flat: false,
  });
  rod([0, 0.47, -1.3], [0, 0.44, -1.342], 0.01, CHROME, chassis, { sides: 5 });

  // front: small, between the sliders
  const FF_R = WF + 0.035;
  b.sweep(arc([0, FAX[1], FAX[2]], polar(FAX, FF_R, -42), [1, 0, 0], 118), () => [0.088, 0.024], {
    color: fenderPaint(0.088),
    bone: steering,
    section: { ngon: 8 },
    caps: "flat",
  });
  for (const s of [1, -1]) {
    rod([s * 0.1, FAX[1] + 0.05, FAX[2] - 0.06], polar(FAX, FF_R, 6, s * 0.075), 0.011, CHROME, steering, { sides: 6 });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Fuel tank, badge, gauge, cap

  const tank = b.loft(
    [
      { at: [0, 0.935, 0.28], w: 0.15, h: 0.15 },
      { at: [0, 0.96, 0.15], w: 0.27, h: 0.22 },
      { at: [0, 0.965, -0.02], w: 0.3, h: 0.23 },
      { at: [0, 0.935, -0.15], w: 0.24, h: 0.18 },
      { at: [0, 0.9, -0.24], w: 0.12, h: 0.11 },
    ],
    { bone: chassis, color: TANK, sides: 12 },
  );
  const tankSkin = b.surface(tank);

  for (const s of [1, -1]) {
    const h = tankSkin.ray([s * 1, 0.96, 0.06], [-s, 0, 0]);
    if (h) b.decal(tank, EMBLEM, { at: h, dir: [s, 0, 0], size: [0.15, 0.15], bone: chassis });
    glow(
      b.sweep(
        tankSkin.drape(cm([[s * 0.2, 0.895, 0.26], [s * 0.2, 0.895, 0.1], [s * 0.2, 0.895, -0.08], [s * 0.2, 0.9, -0.2]]), {
          lift: 0.004,
        }),
        0.0055,
        { color: CYAN, bone: chassis, sides: 5 },
      ),
      1.4,
    );
  }

  const gh = tankSkin.ray([0, 1.6, 0.17], [0, -1, 0]);
  if (gh) {
    put(cylG(0.048, 0.052, 0.03, 14), NAVY_P, chassis, offset(gh.at, gh.n, 0.006), { dir: gh.n });
    put(cylG(0.052, 0.052, 0.008, 14), CHROME, chassis, offset(gh.at, gh.n, 0.02), { dir: gh.n });
    glow(
      put(new THREE.CircleGeometry(0.039, 20), "#ffffff", chassis, offset(gh.at, gh.n, 0.0245), {
        dir: gh.n,
        axis: "z",
        up: [0, 0, 1],
        texture: GAUGE,
        flat: false,
      }),
      1.1,
    );
  }
  const ch = tankSkin.ray([0, 1.6, -0.08], [0, -1, 0]);
  if (ch) {
    put(cylG(0.045, 0.048, 0.026, 10), CHROME, chassis, offset(ch.at, ch.n, 0.004), { dir: ch.n });
    put(cylG(0.03, 0.03, 0.014, 10), ORANGE_P, chassis, offset(ch.at, ch.n, 0.02), { dir: ch.n });
    ball(offset(ch.at, ch.n, 0.03), 0.011, CHROME, chassis, 6);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Seat, springs, sissy bar

  const seat = b.loft(
    [
      { at: [0, 0.84, -0.55], w: 0.27, h: 0.1 },
      { at: [0, 0.835, -0.36], w: 0.34, h: 0.11 },
      { at: [0, 0.845, -0.16], w: 0.3, h: 0.1 },
      { at: [0, 0.855, -0.02], w: 0.14, h: 0.07 },
    ],
    { bone: chassis, color: SEAT, sides: 12 },
  );
  const seatSkin = b.surface(seat);
  for (const s of [1, -1]) {
    b.sweep(
      seatSkin.drape(cm([[s * 0.17, 0.82, -0.55], [s * 0.18, 0.82, -0.36], [s * 0.15, 0.83, -0.16], [s * 0.07, 0.84, -0.02]]), {
        lift: 0.004,
      }),
      0.007,
      { color: ORANGE_P, bone: chassis, sides: 5 },
    );
    // rear coil spring under the seat
    const c0: V = [s * 0.1, 0.7, -0.5];
    b.sweep(spiral(c0, [c0[0] + 0.03, c0[1], c0[2]], [0, 1, 0], { turns: 5, r1: 0.03, pitch: 0.025 }), 0.0065, {
      color: CHROME,
      bone: chassis,
      sides: 5,
    });
    cylAB([c0[0], 0.688, c0[2]], [c0[0], 0.7, c0[2]], 0.038, NAVY_P, chassis, 8);
  }

  // sissy bar and backrest pad
  for (const s of [1, -1]) {
    tube(cm([[s * 0.2, 0.6, -0.58], [s * 0.2, 0.8, -0.72], [s * 0.19, 1.0, -0.86], [s * 0.15, 1.14, -0.95]]), 0.014, CHROME, chassis);
    ball([s * 0.15, 1.14, -0.95], 0.019, CHROME, chassis, 8);
  }
  rod([0.15, 1.14, -0.95], [-0.15, 1.14, -0.95], 0.014, CHROME, chassis, { sides: 8 });
  box([0, 1.02, -0.93], [0.3, 0.17, 0.05], SEAT, chassis, { dir: [0, 1, -0.3] });
  box([0, 1.02, -0.905], [0.26, 0.012, 0.012], ORANGE_P, chassis, { dir: [0, 1, -0.3] });

  // ------------------------------------------------------------------------------------------------------------
  // Engine: crankcase, covers, V-twin cylinders, air cleaner, transmission

  const C: V = [0, 0.43, -0.03];
  box(C, [0.28, 0.26, 0.3], GUN_P, chassis);
  box([0, 0.37, -0.29], [0.22, 0.16, 0.2], GUN_P, chassis);

  const coverProfile: [number, number][] = [
    [0, 0],
    [0.125, 0],
    [0.13, 0.02],
    [0.12, 0.05],
    [0.11, 0.062],
    [0, 0.062],
  ];
  // left primary cover (orange, emblem)
  b.lathe(coverProfile, { at: [0.14, C[1], C[2]], axis: [1, 0, 0], bone: chassis, segments: 16, color: ORANGE_P });
  put(new THREE.CircleGeometry(0.075, 16), "#ffffff", chassis, [0.2045, C[1], C[2]], {
    dir: [1, 0, 0],
    axis: "z",
    texture: EMBLEM,
    flat: false,
  });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    ball([0.205, C[1] + Math.cos(a) * 0.097, C[2] + Math.sin(a) * 0.097], 0.0075, CHROME, chassis, 6);
  }
  // right cover (dark, glowing circuit)
  b.lathe(coverProfile, { at: [-0.14, C[1], C[2]], axis: [-1, 0, 0], bone: chassis, segments: 16, color: GUN_P });
  glow(
    put(new THREE.CircleGeometry(0.1, 20), "#ffffff", chassis, [-0.2045, C[1], C[2]], {
      dir: [-1, 0, 0],
      axis: "z",
      texture: CIRCUIT,
      flat: false,
    }),
    1.3,
  );

  // cylinders
  for (const dv of [
    [0, 0.866, 0.5],
    [0, 0.866, -0.5],
  ] as V[]) {
    const eng = (t: number): V => [0, C[1] + dv[1] * t, C[2] + dv[2] * t];
    cylAB(eng(0.08), eng(0.13), 0.082, NAVY_P, chassis, 10);
    cylAB(eng(0.12), eng(0.28), 0.06, GUN_P, chassis, 10);
    for (let k = 0; k < 6; k++) cylAB(eng(0.14 + k * 0.026), eng(0.152 + k * 0.026), 0.09, FIN_P, chassis, 12);
    cylAB(eng(0.28), eng(0.345), 0.076, SLATE_P, chassis, 10);
    box(eng(0.375), [0.16, 0.05, 0.13], ORANGE_P, chassis, { dir: dv });
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        const pos = new THREE.Vector3(...eng(0.4));
        pos.x += sx * 0.065;
        pos.add(new THREE.Vector3(0, -dv[2], dv[1]).multiplyScalar(sz * 0.05));
        ball(pos, 0.011, CHROME, chassis, 6);
      }
    // spark plug
    rod(eng(0.31), [0.1, eng(0.31)[1] + 0.03, eng(0.31)[2]], 0.01, CHROME, chassis, { sides: 6 });
  }

  // air cleaner
  const AC: V = [-0.1, 0.66, -0.02];
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.09, 0.02],
      [0.09, 0.058],
      [0.07, 0.075],
      [0, 0.075],
    ],
    { at: AC, axis: [-1, 0, 0], bone: chassis, segments: 14, color: CHROME },
  );
  put(new THREE.CircleGeometry(0.06, 14), "#ffffff", chassis, [AC[0] - 0.0765, AC[1], AC[2]], {
    dir: [-1, 0, 0],
    axis: "z",
    texture: EMBLEM,
    flat: false,
  });

  // energy cell under the seat
  cylAB([0, 0.54, -0.46], [0, 0.54, -0.3], 0.075, NAVY_P, chassis, 12);
  cylAB([0, 0.54, -0.468], [0, 0.54, -0.44], 0.082, ORANGE_P, chassis, 12);
  cylAB([0, 0.54, -0.32], [0, 0.54, -0.292], 0.082, ORANGE_P, chassis, 12);
  for (const z of [-0.42, -0.385, -0.35])
    glow(cylAB([0, 0.54, z - 0.01], [0, 0.54, z + 0.01], 0.079, CYAN, chassis, 12), 1.6);

  // ------------------------------------------------------------------------------------------------------------
  // Exhaust: two staggered drag pipes on the right

  const pipeR = (t: number) => 0.03 + 0.02 * t * t;
  const pipes: { pts: V[]; scale: number }[] = [
    {
      pts: [
        [-0.02, 0.66, 0.2],
        [-0.12, 0.6, 0.27],
        [-0.21, 0.48, 0.24],
        [-0.27, 0.34, 0.12],
        [-0.27, 0.3, -0.2],
        [-0.27, 0.29, -0.9],
        [-0.28, 0.3, -1.22],
      ],
      scale: 1,
    },
    {
      pts: [
        [-0.02, 0.66, -0.25],
        [-0.13, 0.62, -0.28],
        [-0.22, 0.52, -0.3],
        [-0.25, 0.47, -0.4],
        [-0.25, 0.46, -0.9],
        [-0.26, 0.48, -1.2],
      ],
      scale: 0.9,
    },
  ];
  for (const pp of pipes) {
    const path = cm(pp.pts);
    b.sweep(path, (t) => pipeR(t) * pp.scale, { color: PIPE, bone: chassis, sides: 8, caps: "flat" });
    let idx = 0;
    b.along(
      path,
      4,
      (at) => {
        const t = 0.45 + (idx++ / 3) * 0.45;
        put(cylG(pipeR(t) * pp.scale + 0.008, pipeR(t) * pp.scale + 0.008, 0.018, 8), "#232b40", chassis, at.at, {
          dir: at.axis,
        });
      },
      { from: 0.4, to: 0.95 },
    );
    const end = pp.pts[pp.pts.length - 1];
    const prev = pp.pts[pp.pts.length - 2];
    const tdir = new THREE.Vector3(end[0] - prev[0], end[1] - prev[1], end[2] - prev[2]).normalize();
    put(new THREE.CircleGeometry(pipeR(1) * pp.scale * 0.85, 10), "#07070b", chassis, offset(end, tdir, 0.003), {
      dir: tdir,
      axis: "z",
    });
    put(cylG(0.046 * pp.scale, 0.046 * pp.scale, 0.016, 10), CHROME, chassis, pp.pts[0], { dir: [0, 0.3, 0.9] });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Foot controls and kickstand

  for (const s of [1, -1]) {
    rod([0, 0.31, 0.14], [s * 0.2, 0.3, 0.36], 0.02, NAVY_P, chassis, { sides: 8 });
    cylAB([s * 0.2, 0.3, 0.36], [s * 0.34, 0.3, 0.36], 0.022, RUBBER, chassis, 8);
    cylAB([s * 0.34, 0.3, 0.36], [s * 0.352, 0.3, 0.36], 0.027, CHROME, chassis, 8);
  }
  rod(KS0, KS1, 0.016, CHROME, kickstand, { sides: 6 });
  box(KS1, [0.075, 0.02, 0.06], DARK, kickstand);
  ball(KS0, 0.024, CHROME, kickstand, 6);

  return b.root;
}
```