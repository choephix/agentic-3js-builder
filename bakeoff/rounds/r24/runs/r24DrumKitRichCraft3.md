```ts
import * as THREE from "three";
import { createBuilder, frame, rng, paint, noise, cells, mix, smoothstep, DEG, svg, catmull } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Glam Rock Drum Kit",
  description:
    "A five-piece glam rock drum kit: harlequin glitter shells in magenta and violet, a gold and black snare, a neon-ringed kick drum with a lightning-bolt STARDUST logo, engraved gilt cymbals, a quilted throne with gold studs and a pink feather boa on the floor tom.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const MAGENTA = "#e0208f";
const PINK = "#ff5fb5";
const HOTPINK = "#ff4fb0";
const VIOLET = "#4b1b8f";
const DEEP = "#1e0b3d";
const CYAN = "#31e4f0";
const GOLD = "#f2b82e";
const CHROME = "#d9dfe9";
const IVORY = "#fbf3e2";
const BLACKHEAD = "#0e0a1a";
const RUBBER = "#1b1722";
const WOOD = "#d9a96a";

type P = THREE.Vector3 | [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const pol = (c: THREE.Vector3, rad: number, deg: number, y: number) =>
  V(c.x + rad * Math.sin(deg * DEG), y, c.z + rad * Math.cos(deg * DEG));

function starOutline(ro: number, ri: number, n = 5): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / n;
    const r = i % 2 ? ri : ro;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

// ---------------------------------------------------------------------------------------------------------------
// Textures
const sparkle = (cx: number, cy: number, r: number, fill: string) =>
  `<path d="M${cx} ${cy - r} L${cx + r * 0.2} ${cy - r * 0.2} L${cx + r} ${cy} L${cx + r * 0.2} ${cy + r * 0.2} L${cx} ${cy + r} L${cx - r * 0.2} ${cy + r * 0.2} L${cx - r} ${cy} L${cx - r * 0.2} ${cy - r * 0.2}Z" fill="${fill}"/>`;

const BOLT_PATH = "M58 9 L32 43 L46 43 L38 66 L70 29 L55 29 L66 9 Z";
const LOGO = (() => {
  let rays = "";
  for (let i = 0; i < 20; i++) {
    const a0 = i * 18 * DEG;
    const a1 = (i * 18 + 9) * DEG;
    rays += `<path d="M50 46 L${(50 + 70 * Math.sin(a0)).toFixed(2)} ${(46 - 70 * Math.cos(a0)).toFixed(2)} L${(50 + 70 * Math.sin(a1)).toFixed(2)} ${(46 - 70 * Math.cos(a1)).toFixed(2)}Z" fill="${i % 2 ? "#ff3fa8" : "#8a3df0"}" opacity="0.4"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#7a2bd0"/><stop offset="0.6" stop-color="#34107a"/><stop offset="1" stop-color="#12062a"/></radialGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset="0.5" stop-color="#ffc83a"/><stop offset="1" stop-color="#e0801c"/></linearGradient>
      </defs>
      <rect width="100" height="100" fill="#12062a"/>
      <circle cx="50" cy="50" r="50" fill="url(#bg)"/>
      ${rays}
      <circle cx="50" cy="50" r="45.5" fill="none" stroke="#ffc83a" stroke-width="2.6"/>
      <circle cx="50" cy="50" r="41.5" fill="none" stroke="#31e4f0" stroke-width="1.2" stroke-dasharray="2.4 2.4"/>
      <path transform="translate(2.4 2.4)" d="${BOLT_PATH}" fill="#ff2f9e"/>
      <path d="${BOLT_PATH}" fill="url(#gold)" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
      ${sparkle(24, 26, 7, "#ffffff")}${sparkle(78, 52, 8, "#31e4f0")}${sparkle(22, 58, 4.5, "#ffc83a")}${sparkle(80, 22, 4, "#ffffff")}
      <text x="50" y="82" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-weight="900" font-size="12.5" letter-spacing="0.6" stroke="#12062a" stroke-width="3.4" stroke-linejoin="round" fill="#12062a">STARDUST</text>
      <text x="50" y="82" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-weight="900" font-size="12.5" letter-spacing="0.6" fill="#ffd23f">STARDUST</text>
    </svg>`,
    { size: 512 },
  );
})();

const HEAD = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#fbf3e2"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#d6cab1" stroke-width="1.6"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#efe5cf" stroke-width="3"/>
    <circle cx="50" cy="50" r="13" fill="#eee3cb"/>
  </svg>`,
  { size: 128 },
);

const BOLT_TEX = svg(
  `<svg viewBox="0 0 50 66" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset="0.5" stop-color="#ffc83a"/><stop offset="1" stop-color="#e0801c"/></linearGradient></defs>
    <g transform="translate(-24 -3)">
      <path transform="translate(2 2)" d="${BOLT_PATH}" fill="#ff2f9e"/>
      <path d="${BOLT_PATH}" fill="url(#g)" stroke="#1e0b3d" stroke-width="2.2" stroke-linejoin="round"/>
    </g>
  </svg>`,
  { size: 256 },
);

const makeFluff = (a: string, bcol: string) => {
  let s = `<path d="M16 63 L16 6" stroke="${a}" stroke-width="3" stroke-linecap="round"/>`;
  for (let i = 0; i < 10; i++) {
    const y = 58 - i * 5.3;
    const len = 14 * (1 - i / 12) + 3;
    const col = i % 2 ? bcol : a;
    s += `<path d="M16 ${y} L${16 - len} ${y - 8}" stroke="${col}" stroke-width="3.2" stroke-linecap="round"/>`;
    s += `<path d="M16 ${y} L${16 + len} ${y - 8}" stroke="${col}" stroke-width="3.2" stroke-linecap="round"/>`;
  }
  return svg(`<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 128 });
};
const FLUFF_A = makeFluff("#ff4fb0", "#ffc2e6");
const FLUFF_B = makeFluff("#ff86c8", "#ffffff");

// ---------------------------------------------------------------------------------------------------------------
// Paints
function harlequin(r: number, A: string, B: string, seed: number, line: string): Paint {
  const circ = 2 * Math.PI * r;
  const w = circ / Math.max(4, Math.round(circ / 0.1));
  const glitter = [IVORY, CYAN, GOLD, PINK];
  return paint((p, _n, s) => {
    const x = s[1] * DEG * r;
    const y = s[0];
    const u = (x + y) / w;
    const v = (x - y) / w;
    const fu = u - Math.floor(u);
    const fv = v - Math.floor(v);
    const edge = Math.min(fu, 1 - fu, fv, 1 - fv) * w * 0.7071;
    if (edge < 0.0028) return line;
    const par = (((Math.floor(u) + Math.floor(v)) % 2) + 2) % 2;
    let col = mix(par ? B : A, "#ffffff", 0.2 * noise(p, 0.05, seed));
    const c = cells(p, 0.012, seed + 3);
    if (c.d1 < 0.3 && c.id > 0.5) col = mix(col, glitter[Math.floor(c.id * 100) % 4], 0.9);
    return col;
  });
}

function tuftPaint(cx: number, cz: number): Paint {
  const w = 0.075;
  return paint((p, n) => {
    if (n.y > 0.5) {
      const x = p.x - cx;
      const z = p.z - cz;
      const u = (x + z) / w;
      const v = (x - z) / w;
      const fu = u - Math.floor(u);
      const fv = v - Math.floor(v);
      if (Math.hypot(Math.min(fu, 1 - fu), Math.min(fv, 1 - fv)) * w < 0.011) return GOLD;
      const edge = Math.min(fu, 1 - fu, fv, 1 - fv) * w * 0.7071;
      if (edge < 0.003) return "#8f0f5c";
      const par = (((Math.floor(u) + Math.floor(v)) % 2) + 2) % 2;
      return mix(par ? MAGENTA : PINK, "#ffffff", 0.12 * noise(p, 0.04, 4));
    }
    return mix(MAGENTA, "#5a0a3a", smoothstep(0.2, -0.8, n.y) * 0.5);
  });
}

function cymbalPaint(c: THREE.Vector3, a: THREE.Vector3, R: number, kind: "brass" | "gilt" | "bronze", seed: number, fan: number): Paint {
  const base = metal(kind, { polish: 0.45, tarnish: 0.1, size: 0.05, seed });
  const u = new THREE.Vector3(1, 0, 0);
  if (Math.abs(a.x) > 0.9) u.set(0, 0, 1);
  u.sub(a.clone().multiplyScalar(u.dot(a))).normalize();
  const v = a.clone().cross(u);
  const br = R * 0.24;
  return paint((p, n) => {
    const d = p.clone().sub(c);
    const x = d.dot(u);
    const y = d.dot(v);
    const rr = Math.hypot(x, y);
    let col = base.at(p, n);
    const groove = 0.5 + 0.5 * Math.sin((rr / 0.012) * Math.PI * 2);
    col = mix(col, "#7a4a12", 0.22 * groove * smoothstep(br * 1.1, br * 1.4, rr));
    if (rr < br * 1.15) col = mix(col, "#fff2b8", 0.25);
    if (rr > R * 0.955) col = mix(col, "#fff0b0", 0.4);
    if (fan > 0 && rr > br * 1.6 && rr < R * 0.86) {
      const ang = (Math.atan2(y, x) / (2 * Math.PI)) * fan;
      if (Math.abs(ang - Math.round(ang)) < 0.05) col = mix(col, "#5a3208", 0.55);
    }
    return col;
  });
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "glamDrumKit", paintSize: 2048 });

  const rod = (p: P, q: P, r: number, color: string = CHROME, sides = 6) => b.rod(p, q, r, color, { sides });

  const SHELL = harlequin(0.15, MAGENTA, VIOLET, 3, GOLD);
  const SHELL_B = harlequin(0.165, MAGENTA, VIOLET, 3, GOLD);
  const SHELL_F = harlequin(0.2, MAGENTA, VIOLET, 3, GOLD);
  const SHELL_K = harlequin(0.29, MAGENTA, VIOLET, 3, GOLD);
  const SHELL_S = harlequin(0.18, GOLD, "#1b1228", 9, HOTPINK);

  // --- Tripod foot: three legs to the floor ---------------------------------------------------------------------
  function tripod(x: number, z: number, topY: number, spread: number, rotDeg: number, r = 0.009) {
    const top = V(x, topY, z);
    for (let i = 0; i < 3; i++) {
      const ang = (rotDeg + i * 120) * DEG;
      const foot = V(x + Math.sin(ang) * spread, 0.014, z + Math.cos(ang) * spread);
      rod(top, foot, r);
      b.part(new THREE.SphereGeometry(0.016, 6, 4), RUBBER, { at: foot });
    }
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), GOLD, { at: top });
  }

  // --- Generic drum ---------------------------------------------------------------------------------------------
  type DrumSpec = {
    c: THREE.Vector3;
    a: THREE.Vector3;
    r: number;
    d: number;
    lugs: number;
    shell: Paint;
    head: THREE.Texture | string; // at +a end
    back: THREE.Texture | string; // at -a end
    hoop: string;
    hoopR: number;
    doubleClaw?: boolean;
    segs?: number;
  };
  const LUG = new THREE.BoxGeometry(0.02, 0.018, 0.07);
  const CLAW = new THREE.BoxGeometry(0.02, 0.016, 0.014);
  function drum(o: DrumSpec) {
    const { c, r, d } = o;
    const a = o.a.clone().normalize();
    const shell = b.lathe(
      [
        [0, -d / 2],
        [r, -d / 2],
        [r, d / 2],
        [0, d / 2],
      ],
      { at: c, axis: a, segments: o.segs ?? 20, color: o.shell },
    );
    const ends: [number, THREE.Texture | string][] = [
      [1, o.head],
      [-1, o.back],
    ];
    for (const [sg, t] of ends) {
      const pos = c.clone().addScaledVector(a, (sg * d) / 2);
      const isTex = typeof t !== "string";
      b.part(new THREE.CylinderGeometry(r + 0.003, r + 0.003, 0.006, 24), isTex ? "#ffffff" : (t as string), {
        at: pos,
        dir: a,
        texture: isTex ? (t as THREE.Texture) : undefined,
      });
      b.part(new THREE.TorusGeometry(r + 0.004, o.hoopR, 6, 24), o.hoop, { at: pos, dir: a, axis: "z" });
    }
    const half = 180 / o.lugs;
    b.ring(frame(c, a), { count: o.lugs, radius: r + 0.006, fromDeg: half, toDeg: 360 - half }, (it) => {
      const p = it.at;
      const top = p.clone().addScaledVector(a, d / 2);
      const bot = p.clone().addScaledVector(a, -d / 2);
      rod(bot, top, 0.0035, CHROME, 5);
      b.stick(LUG, GOLD, it, { embed: 0.3 });
      b.stick(CLAW, GOLD, frame(top, it.outward, a), { embed: 0.3 });
      if (o.doubleClaw) b.stick(CLAW, GOLD, frame(bot, it.outward, a), { embed: 0.3 });
    });
    return shell;
  }

  // =============================================================================================================
  // KICK DRUM
  const KC = V(0, 0.283, 0.1);
  const KA = V(0, 0, 1);
  const KR = 0.29;
  const KD = 0.44;
  const kickShell = drum({
    c: KC,
    a: KA,
    r: KR,
    d: KD,
    lugs: 8,
    shell: SHELL_K,
    head: BLACKHEAD,
    back: HEAD,
    hoop: "#2a0f4d",
    hoopR: 0.02,
    doubleClaw: true,
    segs: 24,
  });
  const frontC = KC.clone().addScaledVector(KA, KD / 2);
  // Logo, glowing
  glow(
    b.part(new THREE.CircleGeometry(KR * 0.985, 32), "#ffffff", {
      at: frontC.clone().addScaledVector(KA, 0.0045),
      dir: KA,
      axis: "z",
      texture: LOGO,
    }),
    0.6,
  );
  // Neon ring
  glow(
    b.part(new THREE.TorusGeometry(KR - 0.034, 0.005, 6, 40), CYAN, {
      at: frontC.clone().addScaledVector(KA, 0.01),
      dir: KA,
      axis: "z",
    }),
    1.6,
  );
  // Gold stars on the front hoop
  const STAR = starOutline(0.027, 0.012);
  b.ring(frame(frontC, KA), { count: 12, radius: KR + 0.004 }, (it) => {
    const out = it.outward.clone();
    const tang = new THREE.Vector3().crossVectors(KA, out).normalize();
    b.extrude(STAR, { at: it.at.clone().addScaledVector(KA, 0.02), x: tang, y: out, thickness: 0.008, color: GOLD });
  });
  // Lightning bolt decals on the shell sides
  for (const s of [1, -1])
    b.decal(kickShell, BOLT_TEX, { at: V(s * KR, KC.y, KC.z), dir: [s, 0, 0], size: [0.14, 0.19] });
  // Spurs
  for (const s of [1, -1]) {
    const top = V(s * 0.26, 0.15, 0.25);
    const foot = V(s * 0.46, 0.012, 0.56);
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.05), GOLD, { at: top });
    rod(top, foot, 0.011, CHROME, 6);
    b.part(new THREE.SphereGeometry(0.02, 6, 4), RUBBER, { at: foot });
  }
  // Pedal
  b.part(new THREE.BoxGeometry(0.1, 0.014, 0.24), GOLD, { at: [-0.1, 0.05, -0.42], rotation: [6, 0, 0] });
  b.part(new THREE.BoxGeometry(0.16, 0.012, 0.1), CHROME, { at: [-0.1, 0.012, -0.3] });
  for (const x of [-0.16, -0.04]) rod(V(x, 0.02, -0.28), V(x, 0.18, -0.28), 0.008, CHROME, 6);
  rod(V(-0.16, 0.18, -0.28), V(-0.04, 0.18, -0.28), 0.007, CHROME, 6);
  rod(V(-0.1, 0.06, -0.33), V(-0.1, 0.18, -0.28), 0.004, CHROME, 5);
  rod(V(-0.1, 0.18, -0.28), V(-0.1, 0.31, -0.175), 0.006, CHROME, 6);
  b.part(new THREE.SphereGeometry(0.026, 8, 6), "#f6efe2", { at: [-0.1, 0.315, -0.158] });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), GOLD, { at: [-0.1, 0.18, -0.28] });

  // =============================================================================================================
  // RACK TOMS + MOUNT
  b.part(new THREE.BoxGeometry(0.13, 0.014, 0.1), GOLD, { at: [0, 0.58, 0.12] });
  rod(V(0, 0.58, 0.12), V(0, 0.77, 0.12), 0.014, CHROME, 6);
  b.part(new THREE.BoxGeometry(0.08, 0.05, 0.05), GOLD, { at: [0, 0.77, 0.12] });
  const toms: [number, number, number, Paint][] = [
    [1, 0.152, 0.2, SHELL],
    [-1, 0.165, 0.22, SHELL_B],
  ];
  for (const [s, r, d, shell] of toms) {
    const a = V(s * 0.12, 0.9, -0.4).normalize();
    drum({ c: V(s * 0.205, 0.84, 0.12), a, r, d, lugs: 5, shell, head: HEAD, back: HEAD, hoop: CHROME, hoopR: 0.008 });
    rod(V(0, 0.77, 0.12), V(s * 0.052, 0.82, 0.12), 0.009, CHROME, 6);
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, { at: [s * 0.052, 0.82, 0.12] });
  }

  // =============================================================================================================
  // FLOOR TOM
  const FC = V(-0.62, 0.42, -0.08);
  drum({ c: FC, a: V(0, 1, 0), r: 0.2, d: 0.4, lugs: 6, shell: SHELL_F, head: HEAD, back: HEAD, hoop: CHROME, hoopR: 0.009 });
  for (const deg of [30, 150, 270]) {
    const sp = pol(FC, 0.212, deg, 0.52);
    const foot = pol(FC, 0.3, deg, 0.014);
    b.part(new THREE.BoxGeometry(0.04, 0.07, 0.03), GOLD, { at: sp });
    rod(sp, foot, 0.011, CHROME, 6);
    b.part(new THREE.SphereGeometry(0.018, 6, 4), RUBBER, { at: foot });
  }
  // Feather boa on the floor tom rim
  const boaPts: THREE.Vector3[] = [
    pol(FC, 0.3, 36, 0.17),
    pol(FC, 0.275, 38, 0.33),
    pol(FC, 0.255, 38, 0.5),
    pol(FC, 0.235, 40, 0.655),
  ];
  for (let deg = 80; deg <= 320; deg += 40) boaPts.push(pol(FC, 0.235, deg, 0.658 + 0.006 * Math.sin(deg * DEG * 2)));
  boaPts.push(pol(FC, 0.26, 322, 0.5), pol(FC, 0.28, 322, 0.33), pol(FC, 0.31, 324, 0.14));
  const boa = b.sweep(catmull(boaPts), 0.03, { color: HOTPINK, sides: 8 });
  const boaHits = b.surface(boa).scatter(240, { rng: rng(21), minDist: 0.017 });
  b.cards(boaHits, [FLUFF_A, FLUFF_B], { size: [0.065, 0.085], lean: 35, bend: 20, vary: 0.3, spin: 180, rng: rng(22), cross: true });

  // =============================================================================================================
  // SNARE
  const SC = V(0.3, 0.64, -0.36);
  drum({ c: SC, a: V(0, 1, 0), r: 0.18, d: 0.14, lugs: 8, shell: SHELL_S, head: HEAD, back: HEAD, hoop: CHROME, hoopR: 0.008, doubleClaw: false });
  // snare wires
  for (let k = -2; k <= 2; k++) {
    const dz = k * 0.014;
    const hx = Math.sqrt(0.17 * 0.17 - dz * dz);
    rod(V(SC.x - hx, SC.y - 0.078, SC.z + dz), V(SC.x + hx, SC.y - 0.078, SC.z + dz), 0.0018, "#b9bcc8", 4);
  }
  // strainer
  b.part(new THREE.BoxGeometry(0.03, 0.05, 0.05), CHROME, { at: [SC.x + 0.195, SC.y - 0.01, SC.z] });
  rod(V(SC.x + 0.2, SC.y + 0.01, SC.z), V(SC.x + 0.25, SC.y + 0.03, SC.z), 0.005, GOLD, 5);
  b.part(new THREE.SphereGeometry(0.012, 6, 4), HOTPINK, { at: [SC.x + 0.25, SC.y + 0.03, SC.z] });
  // stand
  tripod(SC.x, SC.z, 0.3, 0.27, 75);
  rod(V(SC.x, 0.3, SC.z), V(SC.x, 0.545, SC.z), 0.012, CHROME, 6);
  for (const deg of [90, 210, 330]) {
    const e = pol(SC, 0.14, deg, 0.585);
    rod(V(SC.x, 0.545, SC.z), e, 0.007, CHROME, 5);
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.03), RUBBER, { at: e });
  }
  // sticks
  const sticks: [P, P][] = [
    [V(0.12, 0.728, -0.5), V(0.46, 0.728, -0.3)],
    [V(0.12, 0.745, -0.22), V(0.46, 0.745, -0.44)],
  ];
  for (const [p, q] of sticks) {
    b.rod(p, q, [0.0085, 0.0055], { color: WOOD, bands: [[0.1, MAGENTA]], sides: 6 });
    b.part(new THREE.SphereGeometry(0.0072, 6, 4), WOOD, { at: q });
  }

  // =============================================================================================================
  // HI-HAT
  const HX = 0.64;
  const HZ = -0.18;
  function cymbal(c: THREE.Vector3, a: THREE.Vector3, R: number, kind: "brass" | "gilt" | "bronze", seed: number, fan: number) {
    const bh = R * 0.2;
    const br = R * 0.24;
    const sag = R * 0.06;
    const t = 0.004;
    const top: [number, number][] = [
      [0, bh],
      [br * 0.5, bh * 0.97],
      [br * 0.9, bh * 0.6],
      [br * 1.2, bh * 0.22],
      [R * 0.6, -sag * 0.25],
      [R * 0.88, -sag * 0.7],
      [R, -sag],
    ];
    const outline: [number, number][] = [...top, ...top.slice().reverse().map(([x, y]): [number, number] => [x, y - t])];
    const an = a.clone().normalize();
    b.lathe(outline, { at: c, axis: an, segments: 28, color: cymbalPaint(c, an, R, kind, seed, fan) });
    return { bh, an };
  }
  const hhB = cymbal(V(HX, 0.92, HZ), V(0, -1, 0), 0.178, "brass", 11, 0);
  const hhT = cymbal(V(HX, 0.99, HZ), V(0, 1, 0), 0.178, "gilt", 12, 0);
  void hhB;
  void hhT;
  tripod(HX, HZ, 0.24, 0.25, 15);
  rod(V(HX, 0.24, HZ), V(HX, 1.1, HZ), 0.008, CHROME, 6);
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 8), "#7a1450", { at: [HX, 0.92 - 0.036 - 0.012, HZ] });
  b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.045, 8), GOLD, { at: [HX, 1.065, HZ] });
  b.part(new THREE.OctahedronGeometry(0.014), GOLD, { at: [HX, 1.1, HZ] });
  b.part(new THREE.BoxGeometry(0.036, 0.004, 0.009), GOLD, { at: [HX, 1.1, HZ] });
  // hi-hat pedal
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.2), GOLD, { at: [HX, 0.035, -0.4], rotation: [8, 0, 0] });
  rod(V(HX, 0.04, -0.3), V(HX, 0.24, HZ), 0.006, CHROME, 5);
  b.part(new THREE.BoxGeometry(0.12, 0.012, 0.07), CHROME, { at: [HX, 0.01, -0.3] });

  // =============================================================================================================
  // CRASHES + RIDE on boom stands
  function boomStand(bx: number, bz: number, postH: number, c: THREE.Vector3, a: THREE.Vector3, rot: number) {
    tripod(bx, bz, 0.24, 0.3, rot);
    rod(V(bx, 0.24, bz), V(bx, postH, bz), 0.011, CHROME, 6);
    const top = V(bx, postH, bz);
    const an = a.clone().normalize();
    const tip = c.clone().addScaledVector(an, -0.052);
    rod(top, tip, 0.0085, CHROME, 6);
    const back = top.clone().sub(tip).normalize();
    const end = top.clone().addScaledVector(back, 0.2);
    rod(top, end, 0.0085, CHROME, 6);
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 8), RUBBER, { at: end, dir: back });
    b.part(new THREE.SphereGeometry(0.024, 6, 4), GOLD, { at: top });
  }
  function mountOn(c: THREE.Vector3, a: THREE.Vector3, R: number) {
    const an = a.clone().normalize();
    const bh = R * 0.2;
    rod(c.clone().addScaledVector(an, -0.052), c.clone().addScaledVector(an, bh + 0.035), 0.0055, CHROME, 6);
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 8), "#7a1450", { at: c.clone().addScaledVector(an, bh + 0.006), dir: an });
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 8), "#7a1450", { at: c.clone().addScaledVector(an, -0.014), dir: an });
    b.part(new THREE.OctahedronGeometry(0.013), GOLD, { at: c.clone().addScaledVector(an, bh + 0.03) });
    b.part(new THREE.BoxGeometry(0.034, 0.004, 0.009), GOLD, { at: c.clone().addScaledVector(an, bh + 0.03), dir: an });
  }
  const cymbals: [number, number, number, number, number, number, number, number, number, number, "brass" | "gilt" | "bronze", number, number, number, number][] = [
    // cx, cy, cz, ax, ay, az, R, baseX, baseZ, postH, kind, seed, fan, rot, unused
    [0.5, 1.3, 0.1, -0.15, 1, -0.25, 0.2, 0.85, 0.35, 1.15, "gilt", 21, 16, 20, 0],
    [-0.28, 1.34, 0.28, 0.15, 1, -0.3, 0.22, -0.38, 0.55, 1.2, "brass", 22, 20, 50, 0],
    [-0.72, 1.06, 0.12, 0.12, 1, -0.22, 0.255, -0.98, 0.34, 0.95, "gilt", 23, 28, 15, 0],
  ];
  for (const [cx, cy, cz, ax, ay, az, R, bx, bz, ph, kind, seed, fan, rot] of cymbals) {
    const c = V(cx, cy, cz);
    const a = V(ax, ay, az).normalize();
    cymbal(c, a, R, kind, seed, fan);
    mountOn(c, a, R);
    boomStand(bx, bz, ph, c, a, rot);
  }

  // =============================================================================================================
  // DRUM THRONE
  const TZ = -0.72;
  tripod(0, TZ, 0.17, 0.24, 30, 0.011);
  rod(V(0, 0.15, TZ), V(0, 0.45, TZ), 0.016, CHROME, 8);
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16), CHROME, { at: [0, 0.452, TZ] });
  b.lathe(
    [
      [0, 0],
      [0.165, 0],
      [0.175, 0.025],
      [0.17, 0.05],
      [0.12, 0.068],
      [0, 0.072],
    ],
    { at: [0, 0.462, TZ], segments: 20, color: tuftPaint(0, TZ) },
  );
  b.part(new THREE.TorusGeometry(0.168, 0.007, 6, 24), GOLD, { at: [0, 0.464, TZ], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.TorusGeometry(0.172, 0.007, 6, 24), GOLD, { at: [0, 0.512, TZ], dir: [0, 1, 0], axis: "z" });
  b.ring(frame(V(0, 0.488, TZ), [0, 1, 0]), { count: 16, radius: 0.176 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.0085, 6, 4), GOLD, it, { embed: 0.4 }),
  );

  return b.root;
}
```