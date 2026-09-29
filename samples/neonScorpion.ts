// A cyber scorpion, 0.8 m long, in synthwave / cyberpunk neon: glossy black-navy-purple armour plates edged and traced
// in magenta, cyan and electric orange. Plates are paints (hex panels on the tops, neon rims on every bevel, flank light
// strips, a magenta grid under the belly); the circuitry is a set of `svg()` drawings laid on the carapace, the tergites
// and the pincer hands; a sunset (flat bands of orange, pink and purple) sets the sun on the carapace, steps up the
// tail's belly, and dips each finger and toe. The tail arches over the back with a glowing stinger; the pincers have a
// fixed and a movable finger each, so the claws open.
import { CircleGeometry, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { OutlinePoint } from "../src/outline";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Neon Scorpion",
  description:
    "A cyber scorpion, 80 cm long, in synthwave neon: black-navy-purple armour plates with hex panels and glowing magenta, cyan and orange rims, SVG circuit traces on the carapace, tergites and pincers, a striped sunset sun on the back, a sunset-stepped tail arching over to a glowing stinger, two big openable pincers, pedipalp arms and eight legs.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. Armour is dark; the neons are the only bright colours.
const INK = "#06050f";
const NAVY = "#0b1236";
const PLUM = "#2b0f52";
const MAG = "#ff2fd0";
const CYAN = "#14f0ff";
const ORANGE = "#ff8a1a";
const PINK = "#ff4d94";
const HOT = "#fff1c9";
// The sunset, top to bottom: flat bands stepping from orange through pink to purple.
const SUNSET = ["#ffc21f", "#ff9a1f", "#ff6a3d", "#ff3d8b", "#e02bb8", "#a022d6", "#6b1fc8"];

const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
const UP = V(0, 1, 0);
const S3 = Math.sqrt(3);

// ---------------------------------------------------------------------------------------------------------------
// Paint helpers.

/** Distance in meters to the nearest border of a hex grid (pointy hexes, `size` across the flats), positive inside. */
function hexEdge(u: number, v: number, size: number) {
  const x = u / size;
  const y = v / size;
  const md = (a: number, m: number) => a - Math.floor(a / m) * m;
  const ax = md(x, 1) - 0.5;
  const ay = md(y, S3) - S3 / 2;
  const bx = md(x - 0.5, 1) - 0.5;
  const by = md(y - S3 / 2, S3) - S3 / 2;
  const [gx, gy] = ax * ax + ay * ay < bx * bx + by * by ? [ax, ay] : [bx, by];
  const px = Math.abs(gx);
  const py = Math.abs(gy);
  return (0.5 - Math.max(px * 0.5 + py * (S3 / 2), px)) * size;
}

/** The two model axes that lie in the plane of the face `n` looks at, so a pattern reads on tops and flanks alike. */
const across = (p: Vector3, n: Vector3): [number, number] =>
  Math.abs(n.y) > 0.6 ? [p.x, p.z] : Math.abs(n.x) > Math.abs(n.z) ? [p.z, p.y] : [p.x, p.y];

const fract = (x: number) => x - Math.floor(x);

/** 1 within `w` of zero, with a soft half-millimetre edge. */
const stroke = (d: number, w: number) => 1 - smoothstep(w - 0.0004, w + 0.0004, Math.abs(d));

/** 0 at the top of a tube (dorsal clock), 180 on the belly, in degrees. */
const fromTop = (deg: number) => Math.abs((((deg % 360) + 540) % 360) - 180);

/** Armour plate: near-black navy with a plum sheen on top, hex panels on the flat top, neon on every bevel. */
const plate = (rim: string, hexLine: string, seed: number, hex = 0.024, rimmed = true) =>
  paint((p, n) => {
    const up = smoothstep(0.3, 0.92, n.y);
    const sheen = smoothstep(0.35, 0.75, noise(p, 0.07, seed));
    let c: Rgb = mix(mix(INK, NAVY, 0.3 + 0.7 * up), PLUM, 0.65 * sheen * up);
    const [u, v] = across(p, n);
    const cellEdge = hexEdge(u, v, hex);
    c = mix(c, hexLine, 0.92 * stroke(cellEdge - 0.0017, 0.0009) * (rimmed ? smoothstep(0.75, 0.95, n.y) : 0.85));
    const bevel = rimmed ? smoothstep(0.08, 0.28, n.y) * (1 - smoothstep(0.9, 0.97, n.y)) : 0;
    return mix(c, rim, bevel);
  });

/** Body hull: the black under-plating with a magenta grid on the belly and a cyan light strip down each flank. */
const hull = paint((p, n) => {
  const up = smoothstep(-0.4, 0.9, n.y);
  let c: Rgb = mix(INK, NAVY, 0.25 + 0.6 * up);
  const belly = smoothstep(-0.35, -0.7, n.y);
  const gx = stroke(Math.abs(fract(p.x / 0.02) - 0.5) * 0.02 - 0.01, 0.0011);
  const gz = stroke(Math.abs(fract(p.z / 0.02) - 0.5) * 0.02 - 0.01, 0.0011);
  c = mix(c, MAG, belly * Math.max(gx, gz) * 0.9);
  const side = 1 - smoothstep(0.35, 0.6, Math.abs(n.y));
  const [u, v] = across(p, n);
  c = mix(c, "#7b2cff", 0.85 * side * stroke(hexEdge(u, v, 0.03) - 0.0017, 0.0009));
  const flank = side * stroke(p.y - 0.079, 0.0016);
  const dash = fract(p.z / 0.024) < 0.72 ? 1 : 0;
  return mix(c, CYAN, flank * dash);
});

/** Leg, arm: dark segments with a cyan trace down each, orange knuckle collars, a sunset dip on the toe. */
function limbPaint(ts: readonly number[], len: number, trace: string, collar: string, toe: boolean) {
  return paint((_p, n, s) => {
    const [t, deg] = s;
    const a = fromTop(deg);
    const up = smoothstep(-0.3, 0.9, n.y);
    let k = 0;
    while (k < ts.length - 2 && t >= ts[k + 1]) k++;
    let c: Rgb = mix(INK, k % 2 ? PLUM : NAVY, 0.45 + 0.55 * up);
    const m = (t - ts[k]) * len;
    const sl = (ts[k + 1] - ts[k]) * len;
    const inside = smoothstep(0.004, 0.008, m) * smoothstep(0.004, 0.008, sl - m);
    c = mix(c, trace, (1 - smoothstep(9, 17, a)) * inside);
    let dj = 1;
    for (let j = 1; j < ts.length - 1; j++) dj = Math.min(dj, Math.abs(t - ts[j]) * len);
    c = mix(c, collar, 1 - smoothstep(0.0028, 0.0042, dj));
    if (toe) {
      const tip = (1 - t) * len;
      if (tip < 0.007) return ORANGE;
      if (tip < 0.014) return PINK;
      if (tip < 0.021) return "#a022d6";
    }
    return c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings. Each trace is a saturated halo under a bright core, so it reads as neon from a distance.
type Neon = readonly [core: string, halo: string];
const N_MAG: Neon = ["#ff5fe0", "#8a0f7a"];
const N_CYAN: Neon = ["#5ff8ff", "#08728c"];
const N_ORG: Neon = ["#ffc247", "#9a3f05"];

const neon = (d: string, [core, halo]: Neon, w = 1.8) =>
  `<path d="${d}" fill="none" stroke="${halo}" stroke-width="${w * 2.3}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${core}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const node = (x: number, y: number, [core, halo]: Neon, r = 2.6) =>
  `<circle cx="${x}" cy="${y}" r="${r * 1.35}" fill="${halo}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${core}"/><circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#0b1236"/>`;

/** The sun: a cyan ring round a disc of sunset bands, cut by dark slits that widen toward the bottom. */
const SUN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="d"><circle cx="50" cy="50" r="41"/></clipPath></defs>
    <circle cx="50" cy="50" r="49.5" fill="#14f0ff"/>
    <circle cx="50" cy="50" r="46" fill="#0b1236"/>
    <g clip-path="url(#d)">
      ${SUNSET.map((c, i) => `<rect x="0" y="${9 + i * 11.4}" width="100" height="11.6" fill="${c}"/>`).join("")}
      <rect x="0" y="55" width="100" height="2.2" fill="#0b1236"/>
      <rect x="0" y="63" width="100" height="3.2" fill="#0b1236"/>
      <rect x="0" y="71" width="100" height="4.2" fill="#0b1236"/>
      <rect x="0" y="79" width="100" height="5.2" fill="#0b1236"/>
      <rect x="0" y="87" width="100" height="6.4" fill="#0b1236"/>
    </g>
  </svg>`,
  { size: 512 },
);

/** A chip in the middle with traces fanning out to both edges: laid across each tergite. */
const BUS = (() => {
  const half = (n: Neon, m: Neon) =>
    neon("M50 13 H36 L30 7 H6", n) +
    neon("M50 13 H40 L34 19 H16 L12 23 H4", m) +
    neon("M53 8 L46 3 H22", n, 1.5) +
    node(6, 7, m, 2) +
    node(4, 23, n, 2) +
    node(22, 3, m, 1.7);
  return svg(
    `<svg viewBox="0 0 120 26" xmlns="http://www.w3.org/2000/svg">
      <g>${half(N_CYAN, N_ORG)}</g>
      <g transform="translate(120 0) scale(-1 1)">${half(N_CYAN, N_ORG)}</g>
      <polygon points="60,3.5 68,8 68,18 60,22.5 52,18 52,8" fill="#0b1236" stroke="#8a0f7a" stroke-width="4.6"/>
      <polygon points="60,3.5 68,8 68,18 60,22.5 52,18 52,8" fill="none" stroke="#ff5fe0" stroke-width="1.8"/>
      <circle cx="60" cy="13" r="2.6" fill="#ffc247"/>
    </svg>`,
    { size: 512 },
  );
})();

/** Parallel traces running up the hand with jogs, ending in nodes; `seed` varies the routing. */
function traces(seed: number, w: number, h: number, lines: number, pal: readonly Neon[]) {
  const r = rng(seed);
  let out = "";
  const lane = w / (lines + 1);
  for (let i = 0; i < lines; i++) {
    let x = lane * (i + 1);
    let y = h - 4;
    const n = pal[i % pal.length];
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const endY = 6 + r() * h * 0.3;
    while (y > endY) {
      y = Math.max(y - (10 + r() * 14), endY);
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      if (y > endY + 8 && r() < 0.7) {
        const nx = Math.min(Math.max(x + (r() < 0.5 ? -1 : 1) * (5 + r() * 6), 5), w - 5);
        y = Math.max(y - Math.abs(nx - x), endY);
        x = nx;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
    out += neon(d, n, 1.9) + node(x, y, n, 2.6);
    out += `<rect x="${(lane * (i + 1) - 2.6).toFixed(1)}" y="${h - 5}" width="5.2" height="5" fill="${n[0]}"/>`;
  }
  return svg(`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`, { size: 512 });
}

const HAND = traces(11, 60, 80, 5, [N_CYAN, N_MAG, N_ORG]);
const HAND_R = traces(23, 60, 80, 5, [N_CYAN, N_ORG, N_MAG]);

/** A plane lying flat and facing up, its drawing's top toward +Z (forward). */
const flat = (g: BufferGeometry, yaw = 0) => {
  g.rotateX(-Math.PI / 2);
  g.rotateY(Math.PI + yaw);
  return g;
};

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "neonScorpion", paintSize: 2048 });

  const body = b.joint("body", { at: [0, 0.085, 0.12], dir: [0, 0, 1] });

  // ------------------------------------------------------------------------------------------------ Prosoma
  // The under-hull of the carapace region: a faceted tube that the legs and pedipalps root in.
  b.sweep(
    polyline([V(0, 0.076, 0.27), V(0, 0.076, 0.14), V(0, 0.076, 0.0)]),
    (t): [number, number] => [0.032 + 0.038 * smoothstep(0, 0.5, t), 0.03],
    { bone: body, sides: 8, smooth: false, up: UP, color: hull, group: "body" },
  );

  // The carapace: a shield plate, black glass with neon on the rim.
  const half: [number, number][] = [
    [0.032, 0.27],
    [0.058, 0.243],
    [0.078, 0.195],
    [0.088, 0.13],
    [0.09, 0.06],
    [0.08, 0.008],
  ];
  const carapace: OutlinePoint[] = [...half, ...[...half].reverse().map(([x, z]): [number, number] => [-x, z])];
  b.extrude(carapace, {
    at: [0, 0.1, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.03,
    bevel: 0.008,
    detail: 0.7,
    color: plate(MAG, CYAN, 3, 0.026),
    bone: body,
    group: "body",
  });
  const TOP = 0.115;
  b.part(flat(new CircleGeometry(0.044, 28)), "#ffffff", {
    bone: body,
    at: [0, TOP + 0.0012, 0.098],
    texture: SUN,
    group: "body",
  });
  b.part(flat(new PlaneGeometry(0.1, 0.0217)), "#ffffff", {
    bone: body,
    at: [0, TOP + 0.0012, 0.032],
    texture: BUS,
    group: "body",
  });

  // Eyes: a hex mound with two big glowing median eyes, and three small cyan eyes on each front corner.
  b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.017, 0.011],
      [0, 0.0135],
    ],
    { at: [0, TOP - 0.002, 0.195], bone: body, segments: 6, color: PLUM, group: "eyes" },
  );
  for (const s of [1, -1]) {
    b.part(new SphereGeometry(0.0105, 6, 4), MAG, {
      bone: body,
      at: [s * 0.0115, TOP + 0.0135, 0.197],
      group: "eyes",
    });
    b.part(new SphereGeometry(0.0038, 5, 4), HOT, {
      bone: body,
      at: [s * 0.0135, TOP + 0.02, 0.204],
      group: "eyes",
    });
    for (const [x, z, r] of [
      [0.04, 0.238, 0.0062],
      [0.05, 0.22, 0.0055],
      [0.058, 0.203, 0.005],
    ] as const)
      b.part(new SphereGeometry(r, 6, 4), CYAN, { bone: body, at: [s * x, TOP - 0.0005, z], group: "eyes" });
  }

  // Chelicerae: a boxy jaw in front of the shield, one fixed orange fang and one movable magenta one.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.frustumBox(V(s * 0.023, 0.088, 0.245), V(s * 0.023, 0.082, 0.288), [0.034, 0.03], [0.028, 0.024], {
      bone: body,
      color: PLUM,
      group: "jaws",
    });
    const jaw = b.joint(`mandible${L}`, {
      parent: body,
      at: V(s * 0.023, 0.078, 0.286),
      dir: [0, -0.15, 1],
      up: UP,
      role: "jaw",
    });
    b.spike(V(s * 0.023, 0.09, 0.286), [0, -0.3, 1], 0.03, 0.0085, { bone: body, color: ORANGE, group: "jaws" });
    b.spike(V(s * 0.023, 0.077, 0.286), [0, -0.2, 1], 0.03, 0.0085, { bone: jaw, color: MAG, group: "jaws" });
  }

  // ------------------------------------------------------------------------------------------------ Mesosoma
  const spine = b.chain("spine", polyline([V(0, 0.078, -0.005), V(0, 0.078, -0.19)]), {
    parent: body,
    count: 7,
    role: "spine",
    up: UP,
    group: "body",
  });
  b.sweep(spine, (t): [number, number] => [0.068 - 0.018 * t, 0.026], {
    sides: 8,
    smooth: false,
    color: hull,
    caps: { start: "flat", end: "round" },
    group: "body",
  });
  // Seven tergites, each a bevelled plate with a circuit chip laid on it; neon edges alternate cyan and magenta.
  for (let k = 0; k < 7; k++) {
    const hw = 0.077 - 0.0033 * k;
    const len = 0.0255;
    const zc = -0.0145 - k * 0.0263;
    const c = 0.009;
    const l = len / 2;
    const outline: OutlinePoint[] = [
      [-hw + c, l],
      [hw - c, l],
      [hw, l - c],
      [hw, -l + c],
      [hw - c, -l],
      [-hw + c, -l],
      [-hw, -l + c],
      [-hw, l - c],
    ];
    const bone = spine.joints[k];
    b.extrude(outline, {
      at: [0, 0.098, zc],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.014,
      bevel: 0.0045,
      detail: 0.7,
      color: plate(k % 2 ? MAG : CYAN, k % 2 ? CYAN : MAG, 5 + k, 0.02),
      bone,
      group: "body",
    });
    b.part(flat(new PlaneGeometry(hw * 1.5, hw * 1.5 * (26 / 120))), "#ffffff", {
      bone,
      at: [0, 0.105 + 0.0011, zc],
      texture: BUS,
      group: "body",
    });
  }

  // ------------------------------------------------------------------------------------------------ Tail
  const tail = b.chain(
    "tail",
    catmull([
      V(0, 0.09, -0.185),
      V(0, 0.108, -0.255),
      V(0, 0.165, -0.288),
      V(0, 0.245, -0.295),
      V(0, 0.325, -0.268),
      V(0, 0.378, -0.205),
      V(0, 0.395, -0.142),
    ]),
    { parent: spine.joints[6], role: "tail", up: UP, group: "tail" },
  );
  const T = tail.ts;
  const TL = tail.length;
  const seg = (t: number) => {
    let k = 0;
    while (k < 5 && t > T[k + 1]) k++;
    return [k, Math.min(Math.max((t - T[k]) / (T[k + 1] - T[k]), 0), 1)] as const;
  };
  const tailR = (t: number) => {
    const [k, u] = seg(t);
    if (k < 5) return (0.034 - 0.011 * Math.min(t / T[5], 1)) * (0.86 + 0.14 * Math.sin(Math.PI * u) ** 0.7);
    return u < 0.5 ? 0.022 + 0.016 * u : 0.03 - 0.036 * (u - 0.5);
  };
  const tailPaint = paint((_p, n, s) => {
    const [t, deg] = s;
    const [k] = seg(t);
    const a = fromTop(deg);
    const up = smoothstep(-0.3, 0.9, n.y);
    let c: Rgb = mix(INK, k % 2 ? PLUM : NAVY, 0.4 + 0.6 * up);
    c = mix(c, "#7b2cff", 0.75 * stroke(hexEdge(t * TL, deg * 0.00038, 0.022) - 0.0017, 0.0009));
    const m = (t - T[k]) * TL;
    const sl = (T[k + 1] - T[k]) * TL;
    // the sunset steps up the tail: the far end of each segment is one flat band of it
    const band = k < 5 && sl - m < 0.02 ? 1 : 0;
    if (band) c = mix(c, ["#6b1fc8", "#a022d6", "#e02bb8", "#ff4d94", "#ff6a3d"][k], 1);
    // the neon ring at each joint
    const ring = Math.min(m, sl - m);
    const ringHere = k < 5 || m < 0.004;
    if (ringHere) c = mix(c, k % 2 ? CYAN : MAG, 1 - smoothstep(0.0025, 0.0042, m));
    if (k < 5) c = mix(c, k % 2 ? MAG : CYAN, 1 - smoothstep(0.0025, 0.0042, sl - m));
    // the dorsal trace, and a dashed one along each shoulder
    const inside = smoothstep(0.006, 0.011, ring) * (1 - band);
    c = mix(c, CYAN, (1 - smoothstep(8, 15, a)) * inside * (k === 5 ? 0 : 1));
    const dash = fract(m / 0.014) < 0.62 ? 1 : 0;
    c = mix(c, ORANGE, (1 - smoothstep(1.5, 3.5, Math.abs(a - 52))) * dash * inside * (k === 5 ? 0 : 0.95));
    return c;
  });
  const tailSweep = b.sweep(tail, tailR, {
    sides: 8,
    smooth: false,
    color: tailPaint,
    sectors: [
      [156, 204, "#6b1fc8", T[0], T[1]],
      [156, 204, "#a022d6", T[1], T[2]],
      [156, 204, "#e02bb8", T[2], T[3]],
      [156, 204, "#ff4d94", T[3], T[4]],
      [156, 204, "#ff6a3d", T[4], T[5]],
      [156, 204, ORANGE, T[5], 1],
    ],
    group: "tail",
  });
  for (let k = 0; k < 5; k++) {
    const at = tailSweep.at((T[k] + T[k + 1]) / 2);
    b.spike(at, at, 0.03, 0.009, { color: k % 2 ? MAG : CYAN, group: "tail" });
  }
  // The stinger: a hooked cone stepping from magenta through orange to hot white at the point.
  const telson = tail.joints[5];
  const base = tail.at(1).at;
  const stinger = b.joint("stinger", {
    parent: telson,
    at: base,
    dir: [0, 0.35, 1],
    role: "tail",
  });
  const hook = catmull([base, V(0, 0.412, -0.105), V(0, 0.385, -0.075), V(0, 0.335, -0.06)]);
  b.sweep(hook, [0.0145, 0.0008], {
    bone: stinger,
    up: UP,
    sides: 6,
    smooth: false,
    caps: { start: "none", end: "point" },
    bands: [
      [0.28, MAG],
      [0.55, PINK],
      [0.75, ORANGE],
      [0.9, "#ffd23f"],
      [1, HOT],
    ],
    group: "tail",
  });

  // ------------------------------------------------------------------------------------------------ Legs
  const HIP_Z = [0.205, 0.145, 0.085, 0.028];
  const FAN = [34, 10, -14, -38];
  const REACH = [0.92, 1, 1, 0.94];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const ang = (FAN[i] * Math.PI) / 180;
      const d = V(s * Math.cos(ang), 0, Math.sin(ang));
      const k = REACH[i];
      const H = V(s * 0.052, 0.062, HIP_Z[i]);
      const at = (dist: number, y: number) =>
        H.clone()
          .addScaledVector(d, dist * k)
          .setY(y);
      const K1 = at(0.04, 0.122);
      const K2 = at(0.088, 0.134);
      const A = at(0.145, 0.062);
      const F = at(0.175, 0.0047);
      const leg = b.chain(`leg${L}${i + 1}`, polyline([H, K1, K2, A, F]), {
        parent: body,
        names: [`hip${L}${i + 1}`, `knee${L}${i + 1}`, `hock${L}${i + 1}`, `ankle${L}${i + 1}`],
        role: "leg",
        up: UP,
        contact: [F.x, 0, F.z],
        group: "legs",
      });
      const sweep = b.sweep(leg, (t) => 0.0125 - 0.0078 * t ** 0.8, {
        sides: 6,
        smooth: false,
        color: limbPaint(leg.ts, leg.length, i % 2 ? CYAN : MAG, i % 2 ? MAG : ORANGE, true),
        caps: { start: "round", end: "point" },
        group: "legs",
      });
      const knee = sweep.at(leg.ts[1]);
      b.spike(knee, knee, 0.02, 0.0075, { color: i % 2 ? MAG : CYAN, group: "legs" });
    }
  }

  // ------------------------------------------------------------------------------------------------ Pedipalps
  const HAND_LEN = 0.07;
  const FINGER = 0.1;
  // One finger's outline (x along the claw, y toward the outside), toothed on its inner edge. The movable finger is
  // this mirrored, so their tips curl toward each other across the gap.
  const finger = (): OutlinePoint[] => {
    const pts: OutlinePoint[] = [];
    const outer = (x: number) => 0.036 - 0.026 * (x / FINGER) ** 2;
    const inner = (x: number) => 0.0125 - 0.0075 * (x / FINGER);
    for (const x of [-0.014, 0.025, 0.055, 0.08, 0.096]) pts.push([x, outer(x)]);
    pts.push([FINGER + 0.004, 0.0065, "sharp"]);
    pts.push([0.097, inner(0.097)]);
    // teeth: each one a saw tooth pointing across the gap
    for (let j = 0; j < 6; j++) {
      const x = 0.09 - j * 0.0145;
      pts.push([x, inner(x) + 0.0005, "sharp"], [x - 0.0072, inner(x - 0.0072) - 0.0035, "sharp"]);
    }
    pts.push([-0.014, 0.012]);
    return pts.map((q): OutlinePoint => (q.length === 3 ? [q[0] * 0.9, q[1], "sharp"] : [q[0] * 0.9, q[1]]));
  };
  const FIN = finger();
  const FIN_MIRROR: OutlinePoint[] = FIN.map((q) => (q.length === 3 ? [q[0], -q[1], "sharp"] : [q[0], -q[1]]));

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const S = V(s * 0.04, 0.075, 0.245);
    const E1 = V(s * 0.082, 0.078, 0.274);
    const E2 = V(s * 0.126, 0.082, 0.296);
    const W = V(s * 0.156, 0.085, 0.325);
    const arm = b.chain(`palp${L}`, polyline([S, E1, E2, W]), {
      parent: body,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
      up: UP,
      group: "palps",
    });
    const armSweep = b.sweep(arm, [0.016, 0.0205, 0.0195, 0.0215], {
      sides: 6,
      smooth: false,
      color: limbPaint(arm.ts, arm.length, CYAN, MAG, false),
      caps: { start: "round", end: "flat" },
      group: "palps",
    });
    for (const t of [0.35, 0.68]) {
      const at = armSweep.at(t);
      b.spike(at, at, 0.022, 0.008, { color: MAG, group: "palps" });
    }

    // The claw's own frame: `a` runs forward and in, `out` across it, level.
    const a = V(-s * 0.3, 0, 1).normalize();
    const out = V(s * a.z, 0, -s * a.x);
    const hand = b.joint(`hand${L}`, { parent: arm.joints[2], at: W, aim: W.clone().add(a), up: UP, role: "arm" });
    const F = W.clone().addScaledVector(a, HAND_LEN);
    const manus = b.sweep(
      polyline([W.clone().addScaledVector(a, -0.012), F]),
      (t): [number, number] => [0.019 + 0.013 * Math.sin(Math.PI * (0.15 + 0.7 * t)), 0.02],
      {
        bone: hand,
        up: UP,
        sides: 6,
        smooth: false,
        color: plate(CYAN, "#7b2cff", 40 + s, 0.018, false),
        caps: { start: "round", end: "flat" },
        group: "claws",
      },
    );
    const yaw = Math.atan2(-s * 0.3, 1);
    b.part(flat(new PlaneGeometry(0.034, 0.046), yaw), "#ffffff", {
      bone: hand,
      at: W.clone()
        .addScaledVector(a, 0.036)
        .setY(W.y + 0.02 + 0.0011),
      texture: s > 0 ? HAND : HAND_R,
      group: "claws",
    });
    for (const t of [0.35, 0.7]) {
      const at = manus.at(t, 0);
      b.spike(at, at, 0.02, 0.007, { color: CYAN, group: "claws" });
    }

    const fixed = b.joint(`pincerOuter${L}`, { parent: hand, at: F, aim: F.clone().add(a), up: UP, role: "jaw" });
    const movable = b.joint(`pincerInner${L}`, { parent: hand, at: F, aim: F.clone().add(a), up: UP, role: "jaw" });
    // sunset bands from the knuckle to the tip, a hot bevel round each finger
    const fingerPaint = paint((_p, n, s2) => {
      const x = s2[0];
      const idx = Math.min(SUNSET.length - 1, Math.max(0, Math.floor((x + 0.014) / 0.0165)));
      const c = SUNSET[SUNSET.length - 1 - idx];
      const bevel = smoothstep(0.08, 0.3, n.y) * (1 - smoothstep(0.9, 0.97, n.y));
      return mix(c, HOT, 0.55 * bevel);
    });
    for (const [pts, bone] of [
      [FIN, fixed],
      [FIN_MIRROR, movable],
    ] as const)
      b.extrude(pts, {
        at: F,
        x: a,
        y: out,
        thickness: 0.02,
        bevel: 0.004,
        detail: 0.7,
        color: fingerPaint,
        bone,
        group: "claws",
      });
  }

  return b.root;
}
