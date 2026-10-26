import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, paint, cells, countershade, mottle, svg } from "../../../../src/index";
import { frame } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan painted-wood alebrije: a jaguar body with rosette dots, an eagle's hooked beak, crest and ruff, spread feathered wings, talon feet and a feather-fan tail.",
};

// ---------- palette ----------
const ORANGE = "#f08a1c";
const MAG = "#d81b7a";
const TURQ = "#14b8b0";
const YEL = "#ffd21f";
const BLUE = "#2a3fbf";
const GREEN = "#2aa84a";
const CREAM = "#fff0c2";
const BLACK = "#1b1020";
const PINK = "#ff6fa8";
const PURPLE = "#6a2aa0";
const RED = "#e03a1e";
const GOLD = "#e8a21a";
const CYC = [MAG, TURQ, YEL, BLUE, ORANGE, GREEN, PINK, PURPLE];

// ---------- vector helpers ----------
type V = [number, number, number];
const norm = (a: number[]): V => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: number[], c: number[]): V => [
  a[1] * c[2] - a[2] * c[1],
  a[2] * c[0] - a[0] * c[2],
  a[0] * c[1] - a[1] * c[0],
];

// ---------- paints ----------
function dotted(base: any, dot: string, size: number, seed: number, r = 0.22) {
  return paint((p) => (cells(p, size, seed).d1 < r ? dot : base));
}
const BODY = paint((p, n) => {
  if (n.y < -0.25) return cells(p, 0.05, 9).d1 < 0.25 ? PINK : CREAM;
  const c = cells(p, 0.13, 3);
  if (c.id < 0.62) {
    if (c.d1 < 0.13) return YEL;
    if (c.d1 < 0.25) return MAG;
    if (c.d1 < 0.33) return BLUE;
    return ORANGE;
  }
  return c.d1 < 0.12 ? RED : ORANGE;
});
const HEAD = paint((p, n) => (cells(p, 0.05, 5).d1 < 0.2 ? YEL : n.y > 0.3 ? BLUE : TURQ));
const NECK = dotted(MAG, YEL, 0.05, 6);
const LEG = paint((_p, _n, s) => [ORANGE, MAG, TURQ, YEL][Math.floor(s[0] * 8) % 4]);
const TAIL = paint((p, _n, s) => {
  const k = Math.floor(s[0] * 12);
  const base = [MAG, YEL, TURQ, ORANGE][k % 4];
  return cells(p, 0.04, 2).d1 < 0.14 ? BLACK : base;
});
const WINGARM = dotted(BLUE, YEL, 0.06, 4);

const fpCache = new Map<string, any>();
function fp(base: string, accent: string, L: number, w: number) {
  const key = `${base}${accent}${L}${w}`;
  let v = fpCache.get(key);
  if (!v) {
    v = paint((_p, _n, s) => {
      const u = s[0] / L;
      if (Math.abs(s[1]) < 0.004 && u > 0.05 && u < 0.9) return accent;
      if (Math.hypot(s[0] - L * 0.72, s[1]) < w * 0.42) return accent;
      if (u > 0.9) return BLACK;
      return base;
    });
    fpCache.set(key, v);
  }
  return v;
}

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#fff6dc" stroke="${MAG}" stroke-width="5"/>
  <circle cx="50" cy="50" r="34" fill="${YEL}" stroke="${BLACK}" stroke-width="4"/>
  <circle cx="50" cy="50" r="22" fill="${ORANGE}"/>
  <circle cx="50" cy="50" r="14" fill="${BLACK}"/>
  <circle cx="42" cy="42" r="6" fill="#ffffff"/>
  <circle cx="58" cy="60" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 100 100">
  <g transform="translate(50 50)">
  ${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((a, i) => `<ellipse cx="0" cy="-30" rx="11" ry="19" fill="${[MAG, TURQ, YEL, PINK][i % 4]}" stroke="${BLACK}" stroke-width="3" transform="rotate(${a})"/>`)
    .join("")}
  <circle r="17" fill="${BLUE}" stroke="${BLACK}" stroke-width="3"/>
  <circle r="10" fill="${YEL}"/>
  <circle r="4" fill="${RED}"/>
  </g></svg>`,
  { size: 192 },
);
const featherTex = (a: string, c: string) =>
  svg(
    `<svg viewBox="0 0 40 100">
    <path d="M20 98 C2 70 2 30 20 2 C38 30 38 70 20 98Z" fill="${a}" stroke="${BLACK}" stroke-width="3"/>
    <path d="M20 96 L20 10" stroke="${c}" stroke-width="3.5"/>
    <circle cx="20" cy="30" r="6" fill="${c}"/><circle cx="20" cy="52" r="4.5" fill="${c}"/>
    </svg>`,
    { size: 128 },
  );
const FA = featherTex(MAG, YEL);
const FB = featherTex(TURQ, PINK);

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.8, -0.5] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.5],
      [0, 0.82, -0.12],
      [0, 0.86, 0.28],
      [0, 0.88, 0.5],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const spineEnd = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.88, 0.5],
      [0, 1.02, 0.62],
      [0, 1.2, 0.74],
    ]),
    { parent: spineEnd, names: ["neck1", "neck2"], role: "neck" },
  );

  // head
  const C: V = [0, 1.27, 0.82];
  const P = (x: number, y: number, z: number): V => [C[0] + x, C[1] + y, C[2] + z];
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: P(0, -0.02, -0.02), dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, -0.07, 0.07), aim: P(0, -0.1, 0.3), role: "jaw" });

  // ---------- body ----------
  const body = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * (0.15 + 0.7 * t));
      return [0.15 + 0.08 * k, 0.17 + 0.08 * k];
    },
    { color: BODY },
  );
  const neckTube = b.sweep(neck, [0.15, 0.11], { color: NECK });

  // flank flowers and back dots
  for (const s of [1, -1]) {
    b.decal(body, FLOWER, { at: [s * 0.26, 0.84, -0.06], dir: [s, 0, 0], size: [0.26, 0.26], segments: 8 });
  }
  for (let i = 0; i < 10; i++) {
    const t = 0.06 + i * 0.09;
    b.stick(new THREE.SphereGeometry(0.024, 6, 4), CYC[i % CYC.length], body.at(t, 0), { embed: 0.4 });
    for (const a of [55, -55]) {
      b.stick(new THREE.SphereGeometry(0.014, 6, 4), CYC[(i + 2) % CYC.length], body.at(t, a), { embed: 0.4 });
    }
  }

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), HEAD, { bone: head, at: C, scale: [0.125, 0.12, 0.14] });
  // upper beak (hooked)
  const upper = b.sweep(bezier(P(0, -0.01, 0.09), P(0, 0.01, 0.29), P(0, -0.14, 0.31)), (t) => [0.07 * (1 - t) + 0.004, 0.08 * (1 - t) + 0.004], {
    bone: head,
    bands: [
      [0.7, GOLD],
      [1, BLACK],
    ],
    caps: "point",
    sides: 8,
  });
  // lower beak
  b.rod(P(0, -0.07, 0.1), P(0, -0.1, 0.28), [0.05, 0.015], { bone: jaw, color: GOLD, caps: "point" });
  b.part(new THREE.SphereGeometry(1, 6, 4), PINK, { bone: jaw, at: P(0, -0.055, 0.17), scale: [0.035, 0.012, 0.07] });
  const surf = b.surface(upper);
  for (const s of [1, -1]) {
    const h = surf.nearest(P(s * 0.04, 0.0, 0.19));
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), BLACK, h, { embed: 0.3, bone: head });
  }

  for (const s of [1, -1]) {
    // eye
    const dir = norm([s * 0.85, 0.05, 0.5]);
    const eyeC: V = P(s * 0.095, 0.04, 0.07);
    b.part(new THREE.SphereGeometry(0.036, 8, 6), CREAM, { bone: head, at: eyeC });
    b.part(new THREE.CircleGeometry(0.037, 16), "#ffffff", {
      bone: head,
      at: [eyeC[0] + dir[0] * 0.034, eyeC[1] + dir[1] * 0.034, eyeC[2] + dir[2] * 0.034],
      dir,
      axis: "z",
      texture: EYE,
    });
    b.ring(frame(eyeC, dir), { count: 9, radius: 0.054 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.009, 6, 4), CYC[it.i % CYC.length], it, { embed: 0.3, bone: head }),
    );
    // brow
    b.rod(P(s * 0.05, 0.085, 0.12), P(s * 0.115, 0.08, 0.03), 0.017, { bone: head, color: BLUE });
    // jaguar ears
    const ed = norm([s * 0.3, 0.3, 1]);
    const ec: V = P(s * 0.085, 0.105, -0.06);
    b.part(new THREE.SphereGeometry(1, 8, 6), ORANGE, { bone: head, at: ec, scale: [0.058, 0.062, 0.03], dir: ed, axis: "z" });
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, {
      bone: head,
      at: [ec[0] + ed[0] * 0.018, ec[1] + ed[1] * 0.018, ec[2] + ed[2] * 0.018],
      scale: [0.04, 0.043, 0.02],
      dir: ed,
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), YEL, { bone: head, at: P(s * 0.13, 0.02, -0.03) });
  }

  // eagle crest: fan of feathers
  function feather(at: any, d: number[], wd: number[], L: number, w: number, base: string, accent: string, opts: any = {}) {
    return b.extrude(
      [
        [0, 0, "sharp"],
        [L * 0.25, w * 0.8],
        [L * 0.7, w],
        [L, 0, "sharp"],
        [L * 0.7, -w],
        [L * 0.25, -w * 0.8],
      ],
      { at, x: d, y: wd, thickness: 0.012, smoothing: 1, color: fp(base, accent, L, w), ...opts },
    );
  }
  [-15, 10, 35, 60, 85].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    feather(P(0, 0.1, -0.02), [0, Math.cos(a), -Math.sin(a)], [1, 0, 0], 0.22 - i * 0.015, 0.032, CYC[i], i % 2 ? YEL : PINK, { bone: head });
  });

  // neck ruff of feather cards
  for (const [t, rad] of [
    [0.1, 0.12],
    [0.55, 0.1],
  ]) {
    const ring = b.ring(neck.at(t), { count: 12, radius: rad, tilt: -30 });
    b.cards(ring.items, [FA, FB], { size: [0.09, 0.2], lean: 60, flow: [0, -0.3, -1], rng: R, vary: 0.2 });
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.5],
      [0, 0.76, -0.95],
      [0, 0.6, -1.35],
      [0, 0.72, -1.75],
      [0, 0.98, -1.95],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );
  b.sweep(tail, (t) => [0.09 * (1 - t) + 0.03, 0.09 * (1 - t) + 0.03], { color: TAIL });
  const tp = tail.at(1);
  [-60, -30, 0, 30, 60].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const d = norm([Math.sin(a), Math.cos(a) * 0.6 + 0.4, -0.5 * Math.cos(a)]);
    feather(tp, d, norm(cross(d, [0, 0, 1])), 0.42, 0.05, CYC[i], i % 2 ? PINK : YEL);
  });

  // ---------- legs ----------
  const legs: Array<[number, number, number, number]> = [
    [0.17, 0.74, 0.4, 0.44], // front
    [0.18, 0.76, -0.5, -0.54], // hind
  ];
  legs.forEach(([x, hy, hz, fz], li) => {
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const pre = li === 0 ? "front" : "hind";
      const foot: V = [s * x, 0.06, fz];
      const pts = limb([s * x, hy, hz], foot, li === 0 ? [0.4, 0.34] : [0.42, 0.38], [li === 0 ? [0, 0, -1] : [0, 0, 1]]);
      const leg = b.chain(`${pre}Leg${S}`, pts, {
        parent: li === 0 ? spine.joints[2] : hips,
        names: [`${pre}Hip${S}`, `${pre}Knee${S}`, `${pre}Ankle${S}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, [0.095, 0.055], { color: LEG });
      const tipJ = leg.tip!;
      b.part(new THREE.SphereGeometry(1, 8, 6), BLUE, { bone: tipJ, at: [foot[0], 0.056, foot[2] + 0.02], scale: [0.075, 0.056, 0.095] });
      for (const k of [-1, 0, 1]) {
        const base: V = [foot[0] + k * 0.04, 0.032, foot[2] + 0.06];
        const d = norm([k * 0.25, -0.15, 1]);
        b.spike(base, d, 0.1, 0.022, { color: GOLD, bone: tipJ, caps: "round" });
        const cb: V = [base[0] + d[0] * 0.1, base[1] + d[1] * 0.1, base[2] + d[2] * 0.1];
        b.spike(cb, norm([k * 0.2, -0.5, 1]), 0.07, 0.016, { color: BLACK, bone: tipJ });
      }
      // knee/hip dot
      b.part(new THREE.SphereGeometry(0.035, 6, 4), YEL, { bone: leg.joints[0], at: [s * (x + 0.07), hy - 0.02, hz] });
    }
  });

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wpts = [
      [s * 0.2, 0.98, 0.2],
      [s * 0.5, 1.2, 0.05],
      [s * 0.95, 1.4, -0.1],
      [s * 1.4, 1.45, -0.25],
    ];
    const wing = b.chain(`wing${S}`, catmull(wpts), {
      parent: spine.joints[2],
      names: [`wingA${S}`, `wingB${S}`, `wingC${S}`, `wingTip${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.07, 0.03], { color: WINGARM });
    // primaries
    for (let i = 0; i < 9; i++) {
      const t = 0.25 + (0.75 * i) / 8;
      const cp = wing.at(t);
      const d = norm([s * (0.1 + 0.8 * t * t), -0.18, -(1 - 0.5 * t * t)]);
      const wd = norm(cross(d, [0, 1, 0]));
      feather(cp, d, wd, 0.6, 0.05, CYC[i % 4], i % 2 ? YEL : PINK);
    }
    // coverts
    for (let i = 0; i < 8; i++) {
      const t = 0.12 + (0.8 * i) / 7;
      const cp = wing.at(t);
      const d = norm([s * (0.1 + 0.7 * t * t), -0.25, -(1 - 0.5 * t * t)]);
      const wd = norm(cross(d, [0, 1, 0]));
      feather(cp.moved(cp.local({ up: 0.02 })), d, wd, 0.3, 0.045, CYC[(i + 2) % 8], i % 2 ? CREAM : YEL);
    }
    // wing joint studs
    for (let i = 0; i < 4; i++) {
      const cp = wing.at(0.1 + i * 0.28);
      b.part(new THREE.SphereGeometry(0.03 - i * 0.004, 6, 4), CYC[(i + 3) % 8], { at: cp.moved(cp.local({ up: 0.05 })) });
    }
  }

  return b.root;
}
