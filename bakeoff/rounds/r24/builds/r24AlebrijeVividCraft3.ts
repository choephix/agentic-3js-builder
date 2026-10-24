import * as THREE from "three";
import { createBuilder, catmull, cells, grain, limb, paint, rng, svg } from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle-Serpent",
  description:
    "An Oaxacan alebrije carved from copal wood: a jaguar with eagle wings and a curling serpent tail, faceted by knife cuts and painted all over in dots, zigzags and petals of hot pink, turquoise, lime and orange.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const PINK = "#ff2f92";
const TURQ = "#12c8c0";
const LIME = "#a4e21c";
const ORANGE = "#ff8a1e";
const YELLOW = "#ffd53a";
const PURPLE = "#7a2da0";
const DEEP = "#2e0c3f";
const CREAM = "#fff1d0";
const RED = "#e8213f";
const WOOD = "#e6c48e";
const HOT = [PINK, TURQ, LIME, ORANGE];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const fract = (x: number) => x - Math.floor(x);
const zig = (x: number) => Math.abs(fract(x) * 2 - 1);
const last = <T,>(a: T[]): T => a[a.length - 1];

type Pt = [number, number] | [number, number, "sharp"];

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Scatter little painted dots over any base colour or paint. */
const dotted = (base: string | Paint, size: number, seed: number, pal: string[], amount = 0.5): Paint =>
  paint((p) => {
    const q = cells(p, size, seed);
    if (q.d1 < 0.2 && q.id < amount) return pal[Math.floor((q.id / amount) * pal.length) % pal.length];
    return base;
  });

/** Zigzag chevron bands wrapping a tube (s = [t, deg]). */
const bandPaint = (len: number, period: number, a: string, m: string, c: string, seed: number, pal: string[]) =>
  dotted(
    paint((_p, _n, s) => {
      const f = fract((s[0] * len) / period + 0.5 * zig(s[1] / 70));
      return f < 0.42 ? a : f < 0.5 ? DEEP : f < 0.92 ? m : c;
    }),
    0.026,
    seed,
    pal,
    0.45,
  );

const WOODP = grain("#ecd2a2", "#d0a066", { size: 0.012, axis: "z", seed: 3 });

/** Jaguar coat: orange back, pink flanks, rosettes, dots, a zigzag border and bare copal wood underneath. */
const COAT = paint((p, n) => {
  const edge = -0.4 + 0.2 * zig(p.z / 0.05);
  if (n.y < edge - 0.08) return WOODP;
  if (n.y < edge - 0.04) return DEEP;
  if (n.y < edge + 0.06) return TURQ;
  if (n.y < edge + 0.1) return DEEP;
  const top = n.y > 0.45 + 0.2 * zig(p.z / 0.07 + 0.5);
  const c = cells(p, 0.13, 11);
  if (c.id < 0.8) {
    const d = c.d1;
    if (d < 0.1) return DEEP;
    if (d < 0.17) return YELLOW;
    if (d < 0.26) return top ? TURQ : LIME;
    if (d < 0.3) return PURPLE;
  }
  const q = cells(p, 0.03, 23);
  if (q.d1 < 0.2 && q.id < 0.55) return q.id < 0.2 ? CREAM : q.id < 0.38 ? PURPLE : YELLOW;
  return top ? ORANGE : PINK;
});

const SKULLP = dotted(
  paint((p, n) => {
    if (n.y > 0.2 && Math.abs(p.x) < 0.014 + 0.012 * zig(p.z / 0.03)) return DEEP;
    return n.y > -0.2 ? ORANGE : PINK;
  }),
  0.024,
  5,
  [CREAM, YELLOW, TURQ],
  0.5,
);
const MUZZLEP = dotted(TURQ, 0.024, 6, [CREAM, PINK, YELLOW], 0.55);
const JAWP = dotted(PINK, 0.024, 7, [CREAM, LIME, YELLOW], 0.5);

const TL_PLACEHOLDER = 1;
void TL_PLACEHOLDER;

// Blade paint: feathers, petals and ruff leaves. s = [x, y] in meters along the drawn outline.
const bladeCache = new Map<string, Paint>();
const bladePaint = (ci: number, L: number): Paint => {
  const key = `${ci % 4}_${L.toFixed(3)}`;
  let p = bladeCache.get(key);
  if (!p) {
    const A = HOT[ci % 4];
    const B = HOT[(ci + 1) % 4];
    const C = HOT[(ci + 2) % 4];
    p = paint((_p, _n, s) => {
      const x = s[0] / L;
      const y = s[1];
      if (x > 0.04 && Math.abs(y) < 0.004) return DEEP;
      if (x > 0.9) return YELLOW;
      const zz = zig(y / 0.03);
      const band = Math.abs(x - 0.62 - 0.06 * zz);
      if (band < 0.035) return B;
      if (band < 0.05) return DEEP;
      if (x < 0.5) {
        const gx = s[0] / 0.032;
        const gy = y / 0.032 + (Math.floor(gx) % 2) * 0.5;
        if (Math.hypot(fract(gx) - 0.5, fract(gy) - 0.5) < 0.2) return C;
      }
      return A;
    });
    bladeCache.set(key, p);
  }
  return p;
};

const leafOutline = (L: number, W: number, round: boolean): Pt[] =>
  round
    ? [
        [0, -0.2 * W],
        [0.35 * L, -0.5 * W],
        [0.85 * L, -0.35 * W],
        [L, 0],
        [0.85 * L, 0.35 * W],
        [0.35 * L, 0.5 * W],
        [0, 0.2 * W],
      ]
    : [
        [0, -0.14 * W],
        [0.3 * L, -0.5 * W],
        [0.78 * L, -0.42 * W],
        [L, 0, "sharp"],
        [0.78 * L, 0.42 * W],
        [0.3 * L, 0.5 * W],
        [0, 0.14 * W],
      ];

// ---------------------------------------------------------------------------------------------------------------
// Textures

const petalRing = (n: number, cy: number, rx: number, ry: number, cols: string[], rot0 = 0) =>
  Array.from(
    { length: n },
    (_, i) =>
      `<ellipse cx="100" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cols[i % cols.length]}" stroke="${DEEP}" stroke-width="3" transform="rotate(${rot0 + (i * 360) / n} 100 100)"/>`,
  ).join("");

const zigzagRing = () => {
  const pts: string[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI * 2) / 48;
    const r = i % 2 ? 29 : 36;
    pts.push(`${(100 + r * Math.sin(a)).toFixed(1)},${(100 - r * Math.cos(a)).toFixed(1)}`);
  }
  return pts.join(" ");
};

const tipDots = () =>
  Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI * 2) / 16;
    return `<circle cx="${(100 + 93 * Math.sin(a)).toFixed(1)}" cy="${(100 - 93 * Math.cos(a)).toFixed(1)}" r="4.5" fill="${CREAM}" stroke="${DEEP}" stroke-width="1.5"/>`;
  }).join("");

const MANDALA = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    ${petalRing(16, 24, 12, 22, [PINK, TURQ])}
    ${petalRing(12, 50, 11, 19, [ORANGE, LIME], 15)}
    ${petalRing(8, 74, 8, 13, [PURPLE, PINK])}
    <polygon points="${zigzagRing()}" fill="${YELLOW}" stroke="${DEEP}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="100" cy="100" r="22" fill="${TURQ}" stroke="${DEEP}" stroke-width="3"/>
    <circle cx="100" cy="100" r="13" fill="${PINK}" stroke="${DEEP}" stroke-width="3"/>
    <circle cx="100" cy="100" r="5" fill="${YELLOW}"/>
    ${tipDots()}
  </svg>`,
  { size: 512 },
);

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${Array.from(
      { length: 10 },
      (_, i) =>
        `<ellipse cx="50" cy="13" rx="8" ry="13" fill="${i % 2 ? ORANGE : PINK}" stroke="${DEEP}" stroke-width="2.4" transform="rotate(${i * 36} 50 50)"/>`,
    ).join("")}
    <circle cx="50" cy="50" r="31" fill="${DEEP}"/>
    <circle cx="50" cy="50" r="27" fill="${CREAM}"/>
    <circle cx="50" cy="50" r="20" fill="${TURQ}" stroke="${DEEP}" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="14" fill="${LIME}"/>
    <circle cx="50" cy="50" r="8" fill="${DEEP}"/>
    <circle cx="44" cy="43" r="4.2" fill="#ffffff"/>
    <circle cx="57" cy="57" r="2" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const petalSvg = (c1: string, c2: string, c3: string) =>
  svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <path d="M20 78 C2 56 4 24 20 2 C36 24 38 56 20 78Z" fill="url(#g)" stroke="${DEEP}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M20 74 L20 14" stroke="${DEEP}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="12" cy="48" r="2.8" fill="${c3}"/><circle cx="28" cy="48" r="2.8" fill="${c3}"/>
      <circle cx="11" cy="32" r="2.4" fill="${c3}"/><circle cx="29" cy="32" r="2.4" fill="${c3}"/>
      <circle cx="20" cy="9" r="3" fill="${YELLOW}"/>
    </svg>`,
    { size: 128 },
  );
const PETAL_A = petalSvg(PINK, ORANGE, CREAM);
const PETAL_B = petalSvg(TURQ, LIME, YELLOW);

// ---------------------------------------------------------------------------------------------------------------
// Helpers

function radial(axis: THREE.Vector3, count: number, cb: (r: THREE.Vector3, a: THREE.Vector3, i: number) => void, phase = 0) {
  const a = axis.clone().normalize();
  const ref = Math.abs(a.y) < 0.9 ? V(0, 1, 0) : V(0, 0, 1);
  const u = ref.sub(a.clone().multiplyScalar(ref.dot(a))).normalize();
  const w = a.clone().cross(u);
  for (let i = 0; i < count; i++) {
    const ang = phase + (i * Math.PI * 2) / count;
    const r = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
    cb(r, a, i);
  }
}

export default function build() {
  const b = createBuilder({ name: "alebrije", paintSize: 2048 });

  /** A flat leaf-shaped blade: drawn along x, widened along `up` (made square to x). */
  const blade = (
    outline: Pt[],
    at: THREE.Vector3,
    x: THREE.Vector3,
    up: THREE.Vector3,
    thickness: number,
    color: string | Paint,
    bone: Joint,
  ) => {
    const xd = x.clone().normalize();
    const yd = up.clone().sub(xd.clone().multiplyScalar(up.dot(xd))).normalize();
    return b.extrude(outline, { at, x: xd, y: yd, thickness, smoothing: 1, color, bone });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: spine, body
  const hips = b.joint("hips", { at: [0, 0.66, -0.4], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.4],
      [0, 0.67, -0.12],
      [0, 0.7, 0.18],
      [0, 0.73, 0.42],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = last(spine.joints);
  const body = b.sweep(spine, (t: number) => [0.19 + 0.035 * t, 0.205 + 0.03 * t - 0.025 * Math.sin(Math.PI * t)], {
    color: COAT,
    sides: 8,
    smooth: false,
  });

  // Neck
  const neckPath = catmull([
    [0, 0.73, 0.4],
    [0, 0.83, 0.55],
    [0, 0.92, 0.7],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const neckSweep = b.sweep(neck, [0.16, 0.13], {
    color: bandPaint(0.35, 0.05, ORANGE, PINK, TURQ, 33, [CREAM, YELLOW, PURPLE]),
    sides: 8,
    smooth: false,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.92, 0.7], dir: [0, 0.08, 1], role: "head" });
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const hAxis = V(0, 0.08, 1).normalize();

  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), SKULLP, {
    bone: head,
    at: hp(0.08, 0.05),
    scale: [0.16, 0.145, 0.155],
    flat: true,
  });
  b.frustumBox(hp(0.14, 0.0), hp(0.38, -0.015), [0.19, 0.12], [0.15, 0.08], { bone: head, color: MUZZLEP });
  b.part(new THREE.BoxGeometry(0.085, 0.045, 0.045), PINK, { bone: head, at: hp(0.395, 0.015) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 6, 4), DEEP, { bone: head, at: hp(0.42, 0.018, s * 0.022), flat: true });
  }
  // nose bridge dots and whisker pads
  for (let i = 0; i < 5; i++) {
    const f = 0.18 + i * 0.045;
    b.part(new THREE.SphereGeometry(0.009, 6, 4), i % 2 ? LIME : YELLOW, {
      bone: head,
      at: hp(f, 0.06 - (f - 0.14) * 0.083),
      flat: true,
    });
  }
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const f = 0.27 + k * 0.04;
      const half = 0.095 - ((f - 0.14) / 0.24) * 0.02;
      b.part(new THREE.SphereGeometry(0.011, 6, 4), k % 2 ? PINK : CREAM, {
        bone: head,
        at: hp(f, -0.012 - k * 0.006, s * half),
        flat: true,
      });
      b.rod(hp(f, -0.01, s * (half - 0.005)), hp(f - 0.05, -0.04 + k * 0.035, s * 0.3), 0.004, LIME, { bone: head, sides: 4 });
    }
  }
  // fangs
  for (const s of [1, -1]) {
    b.spike(hp(0.34, -0.05, s * 0.045), [0, -1, 0], 0.06, 0.016, { color: CREAM, bone: head, sides: 5 });
  }
  // eyes
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.around(skull.at).at(s * 42, 10);
    if (hit) {
      const dir = hit.n.clone().add(V(0, 0, 0.9)).normalize();
      b.decal(skull, EYE, { at: hit, dir, size: [0.13, 0.13] });
    }
    // brows
    blade(
      leafOutline(0.1, 0.05, false),
      hp(0.12, 0.165, s * 0.07),
      V(s * 0.7, 0.3, -0.15),
      V(0, 1, 0),
      0.014,
      bladePaint(s > 0 ? 1 : 3, 0.1),
      head,
    );
  }
  const fore = skullSurf.around(skull.at).at(0, 60);
  if (fore) b.decal(skull, MANDALA, { at: fore, dir: fore.n, size: [0.12, 0.12] });

  // ears
  for (const s of [1, -1]) {
    const base = hp(-0.03, 0.12, s * 0.125);
    const dir = V(s * 0.35, 0.6, 0.7).normalize();
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.05, 8), TURQ, { bone: head, at: base, dir: [dir.x, dir.y, dir.z] });
    const inner = base.clone().addScaledVector(dir, 0.022);
    b.part(new THREE.CylinderGeometry(0.048, 0.05, 0.02, 8), PINK, { bone: head, at: inner, dir: [dir.x, dir.y, dir.z] });
    radial(dir, 8, (r, a, i) => {
      b.part(new THREE.SphereGeometry(0.01, 6, 4), i % 2 ? YELLOW : LIME, {
        bone: head,
        at: base.clone().addScaledVector(a, 0.026).addScaledVector(r, 0.064),
        flat: true,
      });
    });
  }
  // horns
  for (const s of [1, -1]) {
    const hornPath = catmull([hp(0.0, 0.12, s * 0.05), hp(-0.01, 0.22, s * 0.08), hp(-0.07, 0.3, s * 0.1), hp(-0.13, 0.3, s * 0.08)]);
    b.sweep(hornPath, [0.04, 0.008], {
      bone: head,
      color: WOOD,
      bands: [
        [0.3, WOOD],
        [0.55, TURQ],
        [0.8, PINK],
        [1, LIME],
      ],
      sides: 6,
      smooth: false,
      caps: { start: "flat", end: "point" },
    });
  }
  // cheek tufts
  for (const s of [1, -1]) {
    const tufts: [number, number, number][] = [
      [s, 0.1, -0.4],
      [s, -0.15, -0.5],
      [0.9 * s, -0.4, -0.4],
    ];
    tufts.forEach((d, k) => {
      blade(leafOutline(0.13 - k * 0.015, 0.06, false), hp(0.0, -0.01 - k * 0.025, s * 0.13), V(d[0], d[1], d[2]), V(0, 1, 0), 0.014, bladePaint(k + (s > 0 ? 0 : 2), 0.13 - k * 0.015), head);
    });
  }
  // ruff round the neck
  const ruff = (f: number, count: number, rad: number, L: number, Wd: number, tilt: number, phase: number, ci0: number, round: boolean) => {
    const center = hp(f, 0);
    const t = (tilt * Math.PI) / 180;
    radial(
      hAxis,
      count,
      (r, a, i) => {
        const x = r.clone().multiplyScalar(Math.cos(t)).addScaledVector(a, -Math.sin(t));
        const up = r.clone().multiplyScalar(Math.sin(t)).addScaledVector(a, Math.cos(t));
        blade(leafOutline(L, Wd, round), center.clone().addScaledVector(r, rad), x, up, 0.016, bladePaint(ci0 + i, L), head);
      },
      phase,
    );
  };
  ruff(-0.1, 14, 0.1, 0.22, 0.11, 28, 0, 0, false);
  ruff(-0.06, 12, 0.115, 0.15, 0.09, 12, Math.PI / 12, 1, true);

  // jaw
  const jaw = b.joint("jaw", { parent: head, at: hp(0.03, -0.06), aim: hp(0.3, -0.09), role: "jaw" });
  b.frustumBox(hp(0.05, -0.09), hp(0.34, -0.09), [0.15, 0.05], [0.11, 0.04], { bone: jaw, color: JAWP });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), PINK, { bone: jaw, at: hp(0.34, -0.09), flat: true });
  for (const s of [1, -1]) {
    b.spike(hp(0.32, -0.07, s * 0.035), [0, 1, 0], 0.05, 0.014, { color: CREAM, bone: jaw, sides: 5 });
    for (let k = 0; k < 3; k++)
      b.spike(hp(0.15 + k * 0.05, -0.07, s * 0.06), [0, 1, 0], 0.025, 0.009, { color: CREAM, bone: jaw, sides: 4 });
  }
  b.part(new THREE.BoxGeometry(0.09, 0.012, 0.18), RED, { bone: jaw, at: hp(0.2, -0.068) });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  const frontPaint = bandPaint(0.64, 0.07, TURQ, ORANGE, LIME, 31, [CREAM, PINK, YELLOW]);
  const hindPaint = bandPaint(0.68, 0.07, PINK, TURQ, YELLOW, 32, [CREAM, LIME, PURPLE]);

  const paw = (tip: Joint, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, { bone: tip, at: [x, 0.045, z + 0.035], scale: [0.065, 0.045, 0.09], flat: true });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.SphereGeometry(0.03, 6, 5), k === 0 ? YELLOW : ORANGE, {
        bone: tip,
        at: [x + k * 0.045, 0.03, z + 0.1 - Math.abs(k) * 0.012],
        flat: true,
      });
      b.spike([x + k * 0.045, 0.03, z + 0.13 - Math.abs(k) * 0.012], [0, -0.25, 1], 0.045, 0.012, { color: CREAM, bone: tip, sides: 5 });
    }
  };

  const lumps: { part: ReturnType<typeof b.part>; s: number }[] = [];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // front
    const fp = limb(V(s * 0.2, 0.6, 0.36), V(s * 0.2, 0.05, 0.5), [0.26, 0.24, 0.14], [[0, 0, -1], [0, 0, 1]]);
    const fl = b.chain(`legF${sd}`, fp, {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `pawF${sd}`],
      role: "leg",
      contact: [s * 0.2, 0, 0.53],
    });
    b.sweep(fl, [0.082, 0.045], { color: frontPaint, sides: 6, smooth: false });
    paw(last(fl.joints), s * 0.2, 0.5);
    lumps.push({
      part: b.part(new THREE.SphereGeometry(1, 9, 7), COAT, { bone: chest, at: [s * 0.2, 0.6, 0.36], scale: [0.1, 0.19, 0.19], flat: true }),
      s,
    });
    // hind
    const hpts = limb(V(s * 0.2, 0.6, -0.4), V(s * 0.2, 0.05, -0.55), [0.28, 0.26, 0.14], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${sd}`, hpts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `pawH${sd}`],
      role: "leg",
      contact: [s * 0.2, 0, -0.52],
    });
    b.sweep(hl, [0.085, 0.045], { color: hindPaint, sides: 6, smooth: false });
    paw(last(hl.joints), s * 0.2, -0.55);
    lumps.push({
      part: b.part(new THREE.SphereGeometry(1, 9, 7), COAT, { bone: hips, at: [s * 0.2, 0.58, -0.4], scale: [0.105, 0.2, 0.19], flat: true }),
      s,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Body adornment: belts of dots, flank flowers, dorsal petals, knife chips
  const skin = b.surface(body);
  const beltCols = [PINK, YELLOW, TURQ, LIME];
  [0, 1, 2].forEach((k) => {
    const joint = spine.joints[k];
    b.sweep(skin.loop(joint, { lift: 0.004 }), 0.009, { color: DEEP, sides: 5, smooth: false });
    let c = k;
    b.along(skin.loop(joint, { lift: 0.012 }), 30, (at) => {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), beltCols[c++ % 4], { at, flat: true });
    });
  });
  const neckSkin = b.surface(neckSweep);
  let nc = 0;
  b.along(neckSkin.loop(neck.joints[1], { lift: 0.012 }), 22, (at) => {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), beltCols[nc++ % 4], { at, flat: true });
  });

  for (const s of [1, -1]) {
    const hit = skin.around(V(0, 0.68, 0.0)).at(s * 90, 4);
    if (hit) b.decal(body, MANDALA, { at: hit, size: [0.3, 0.3] });
  }
  for (const l of lumps) {
    const hit = b.surface(l.part).around(l.part.at).at(l.s * 90, 0);
    if (hit) b.decal(l.part, MANDALA, { at: hit, size: [0.22, 0.22] });
  }

  const backHits = skin.scatter(60, {
    rng: rng(5),
    minDist: 0.06,
    filter: (h) => h.n.y > 0.7 && Math.abs(h.at.x) < 0.07,
  });
  b.cards(backHits, [PETAL_A, PETAL_B], { size: [0.07, 0.15], lean: 55, bend: 20, vary: 0.25, rng: rng(6), flow: [0, 0.1, -1] });

  const chipHits = skin.scatter(14, { rng: rng(9), minDist: 0.12, filter: (h) => h.n.y > -0.2 });
  for (const h of chipHits) b.stick(new THREE.TetrahedronGeometry(0.03), "#f1d7a0", h, { embed: 0.5, scale: [1, 0.35, 1.6] });

  // -------------------------------------------------------------------------------------------------------------
  // Eagle wings
  const buildWing = (s: number) => {
    const sd = s > 0 ? "L" : "R";
    const S = V(s * 0.15, 0.92, 0.2);
    const E = V(s * 0.5, 1.06, 0.0);
    const Wr = V(s * 0.85, 1.26, 0.2);
    const H = V(s * 1.02, 1.37, 0.28);
    const armPath = catmull([S, E, Wr, H]);
    const arm = b.chain(`wing${sd}`, armPath, {
      parent: chest,
      names: [`wingShoulder${sd}`, `wingElbow${sd}`, `wingWrist${sd}`, `wingHand${sd}`],
      role: "wing",
    });
    b.sweep(arm, [0.07, 0.03], {
      color: bandPaint(armPath.length, 0.06, PINK, TURQ, LIME, 41, [CREAM, YELLOW, PURPLE]),
      sides: 6,
      smooth: false,
    });
    const N0 = Wr.clone().sub(S).normalize().cross(V(0, 0, -1));
    if (N0.y < 0) N0.negate();
    N0.normalize();
    const boneAt = (t: number) => (t < 0.39 ? arm.joints[0] : t < 0.79 ? arm.joints[1] : arm.joints[2]);
    const feather = (t: number, d: THREE.Vector3, L: number, Wd: number, ci: number, lift: number, round: boolean) => {
      const dir = d.clone().normalize();
      const N = N0.clone().sub(dir.clone().multiplyScalar(N0.dot(dir))).normalize();
      const root = armPath.at(t).clone().addScaledVector(N, lift);
      blade(leafOutline(L, Wd, round), root, dir, N.clone().cross(dir), 0.014, bladePaint(ci, L), boneAt(t));
    };

    // tertials near the body
    for (let i = 0; i < 4; i++) {
      const t = 0.14 + i * 0.07;
      feather(t, V(-s * 0.05, -0.03, -1), 0.44 + i * 0.02, 0.12, i + 1, (i % 2) * 0.006, false);
      feather(t, V(-s * 0.05, -0.03, -1), 0.24, 0.11, i + 2, 0.02 + (i % 2) * 0.004, true);
    }
    // secondaries
    for (let i = 0; i < 9; i++) {
      const t = 0.41 + i * 0.044;
      const d = V(s * (0.1 + 0.02 * i), -0.03, -1);
      feather(t, d, 0.5, 0.115, i, (i % 2) * 0.006, false);
      feather(t, d, 0.26, 0.11, i + 1, 0.02 + (i % 2) * 0.004, true);
    }
    // primaries fan out from the wrist and hand
    const primL = [0.6, 0.66, 0.7, 0.72, 0.7, 0.64, 0.55];
    for (let i = 0; i < 7; i++) {
      const t = 0.8 + i * 0.033;
      const phi = ((10 + i * 11) * Math.PI) / 180;
      const d = V(s * Math.sin(phi), 0.1, -Math.cos(phi));
      feather(t, d, primL[i], 0.1, i + 2, (i % 2) * 0.006, false);
      feather(t, d, 0.28, 0.09, i + 3, 0.02 + (i % 2) * 0.004, true);
    }
    // scapular scale row over the arm
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + i * 0.1;
      feather(t, V(s * 0.2, -0.02, -1), 0.15, 0.12, i + 2, 0.034, true);
    }
    // alula
    feather(0.78, V(s * 0.5, 0.1, 0.8), 0.2, 0.06, 3, 0.012, false);
    feather(0.84, V(s * 0.7, 0.1, 0.6), 0.17, 0.055, 0, 0.012, false);
  };
  buildWing(1);
  buildWing(-1);

  // -------------------------------------------------------------------------------------------------------------
  // Serpent tail
  const tailPath = catmull([
    [0, 0.64, -0.5],
    [0, 0.5, -0.82],
    [0, 0.25, -1.08],
    [0, 0.11, -1.35],
    [0, 0.1, -1.62],
    [0, 0.22, -1.88],
    [0, 0.55, -1.95],
    [0, 0.82, -1.8],
    [0, 0.95, -1.55],
    [0, 0.93, -1.3],
  ]);
  const TL = tailPath.length;
  const TAILP = dotted(
    paint((_p, _n, s) => {
      if (s[1] > 135 && s[1] < 225) return fract((s[0] * TL) / 0.03) < 0.2 ? DEEP : YELLOW;
      const u = (s[0] * TL) / 0.075;
      const f = fract(u * 0.5 + 0.5 * zig((s[1] / 360) * 6));
      return f < 0.42 ? PINK : f < 0.5 ? DEEP : f < 0.88 ? TURQ : LIME;
    }),
    0.024,
    51,
    [CREAM, YELLOW, ORANGE],
    0.4,
  );
  const tail = b.chain("tail", tailPath, { parent: hips, count: 10, role: "tail" });
  const tailSweep = b.sweep(tail, (t: number) => 0.085 - 0.042 * t, { color: TAILP, sides: 6, smooth: false });
  for (let i = 0; i < 13; i++) {
    const t = 0.06 + i * 0.068;
    const pt = tailSweep.at(t, 0);
    const L = 0.1 - 0.05 * t;
    blade(
      leafOutline(L, L * 0.55, true),
      pt.at.clone().addScaledVector(pt.n, -0.012),
      pt.n,
      pt.tangent,
      0.014,
      bladePaint(i, L),
      (pt.bone ?? tail.joints[0]) as Joint,
    );
  }

  // snake head
  const tEnd = tailPath.at(1);
  const snake = b.joint("tailHead", { parent: last(tail.joints), at: tEnd, dir: tailPath.tangentAt(1) });
  const sp = (f: number, u: number, l = 0) => snake.local({ forward: f, up: u, left: l });
  const sAxis = tailPath.tangentAt(1).clone().normalize();
  b.part(new THREE.SphereGeometry(1, 8, 6), bandPaint(0.3, 0.05, PINK, TURQ, LIME, 61, [CREAM, YELLOW]), {
    bone: snake,
    at: sp(0.03, 0),
    scale: [0.06, 0.05, 0.085],
    flat: true,
  });
  b.frustumBox(sp(0.08, 0.0), sp(0.19, -0.005), [0.09, 0.06], [0.06, 0.04], { bone: snake, color: dotted(LIME, 0.02, 62, [DEEP, PINK], 0.5) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 7, 5), YELLOW, { bone: snake, at: sp(0.06, 0.035, s * 0.045), flat: true });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), DEEP, { bone: snake, at: sp(0.075, 0.04, s * 0.052), scale: [0.5, 1.3, 1], flat: true });
    b.spike(sp(0.18, -0.025, s * 0.02), [0, -1, 0], 0.045, 0.01, { color: CREAM, bone: snake, sides: 4 });
  }
  radial(
    sAxis,
    9,
    (r, a, i) => {
      const t = (35 * Math.PI) / 180;
      const x = r.clone().multiplyScalar(Math.cos(t)).addScaledVector(a, -Math.sin(t));
      const up = r.clone().multiplyScalar(Math.sin(t)).addScaledVector(a, Math.cos(t));
      blade(leafOutline(0.12, 0.06, false), sp(-0.01, 0).clone().addScaledVector(r, 0.045), x, up, 0.012, bladePaint(i + 1, 0.12), snake);
    },
    0.2,
  );
  const tailJaw = b.joint("tailJaw", { parent: snake, at: sp(0.03, -0.035), aim: sp(0.2, -0.04), role: "jaw" });
  b.frustumBox(sp(0.05, -0.045), sp(0.19, -0.05), [0.075, 0.025], [0.05, 0.02], { bone: tailJaw, color: YELLOW });
  b.extrude(
    [
      [0, -0.006],
      [0.12, -0.006],
      [0.16, -0.03],
      [0.17, -0.025],
      [0.14, 0],
      [0.17, 0.025],
      [0.16, 0.03],
      [0.12, 0.006],
      [0, 0.006],
    ],
    { at: sp(0.14, -0.04), x: [0, -0.03, 1], y: [1, 0, 0], thickness: 0.006, color: RED, bone: tailJaw },
  );
  b.pose(tailJaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
