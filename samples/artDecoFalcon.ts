// Art Deco Falcon: a peregrine falcon cast as a 1920s hood ornament, 1.2 m across the wings, mounted on a stepped
// black-lacquer ziggurat. Style: streamlined geometry in polished gold and black lacquer with jade and ivory inlay.
// Every feather is an extruded stepped or arched blade whose paint carries the chevron lines, ribs and jewel inlays
// (the gold and lacquer are painted with a fake polished highlight); the breast is gold barred with lacquer chevrons,
// the back is lacquer, and the two meet along a jade zigzag inlay. The ziggurat's faces, the breast medallion, the
// shoulder rosettes and the eyes are `svg()` drawings: sunburst fans, zigzags, fluting and rays. The skeleton is
// spine, neck, head with an openable lower mandible, two wings (arm chain plus primary, secondary joints), a tail
// fan on group joints and two legs with four toes and talons each.
import { BoxGeometry, CircleGeometry, PlaneGeometry, Quaternion, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, DEG, lerp, offset } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { mix, paint, smoothstep } from "../src/paint";
import type { Paint, Rgb } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Art Deco Falcon",
  description:
    "A peregrine falcon as a 1920s hood ornament on a stepped ziggurat base, 1.2 m across the wings: polished gold and black lacquer with jade and ivory inlay, stepped chevron feathers, a jade zigzag along the flank, sunburst medallions and a hooked beak with an openable lower mandible.",
};

const GOLD = "#d9a92e";
const GOLD_DK = "#8a5f14";
const GOLD_LT = "#f3d36b";
const GOLD_HOT = "#fff3bd";
const LACQ = "#15110f";
const LACQ_MID = "#2b2320";
const LACQ_LT = "#5a4f4a";
const IVORY = "#f1e7cd";
const IVORY_DK = "#c9ba95";
const JADE = "#38a483";
const JADE_DK = "#1c6653";
const JADE_LT = "#86d6b6";
const WHITE = "#ffffff";

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

const fract = (x: number) => x - Math.floor(x);
/** Triangle wave: 1 at whole numbers, 0 at halves. */
const tri = (x: number) => Math.abs(fract(x) - 0.5) * 2;

// ---------------------------------------------------------------------------------------------------------------
// Materials: a colour for a surface normal, with a fake polished highlight so gold, lacquer and jade read as shiny.
type Mat = (n: Vector3) => Rgb;
const LIGHT = new Vector3(-0.35, 0.8, 0.5).normalize();
const lit = (n: Vector3) => n.dot(LIGHT) * 0.5 + 0.5;

const gold: Mat = (n) => {
  const k = lit(n);
  const c = mix(mix(GOLD_DK, GOLD, smoothstep(0.1, 0.55, k)), GOLD_LT, 0.55 * smoothstep(0.7, 0.95, k));
  return mix(c, GOLD_HOT, 0.7 * smoothstep(0.95, 1, k));
};
const lacq: Mat = (n) => {
  const k = lit(n);
  return mix(mix(LACQ, LACQ_MID, smoothstep(0.3, 0.8, k)), LACQ_LT, smoothstep(0.9, 1, k));
};
const jade: Mat = (n) => {
  const k = lit(n);
  return mix(mix(JADE_DK, JADE, smoothstep(0.1, 0.6, k)), JADE_LT, smoothstep(0.78, 0.99, k));
};
const ivory: Mat = (n) => mix(IVORY_DK, IVORY, smoothstep(0.15, 0.7, lit(n)));

const GOLDP = paint((_p, n) => gold(n));
const LACQP = paint((_p, n) => lacq(n));
const JADEP = paint((_p, n) => jade(n));

// ---------------------------------------------------------------------------------------------------------------
// Feather profiles: half of the outline as [x, y] going up the right side, mirrored on the left. The half width is
// kept for the paint, so trim lines follow the steps.
type Prof = { outline: OutlinePoint[]; half: (y: number) => number; len: number };

function profile(right: [number, number][], len: number): Prof {
  const pts: [number, number][] = [...right, [0, len]];
  const outline: OutlinePoint[] = [
    ...right.map(([x, y]) => [x, y] as OutlinePoint),
    [0, len, "sharp"],
    ...[...right].reverse().map(([x, y]) => [-x, y] as OutlinePoint),
  ];
  const half = (y: number) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      if (y1 > y0 && y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
    }
    return 0;
  };
  return { outline, half, len };
}

/** The ziggurat feather: three steps in, then a chevron point. */
const stepped = (len: number, w: number) =>
  profile(
    [
      [0.8 * w, 0],
      [w, 0.07 * len],
      [w, 0.36 * len],
      [0.82 * w, 0.36 * len],
      [0.82 * w, 0.58 * len],
      [0.6 * w, 0.58 * len],
      [0.6 * w, 0.8 * len],
    ],
    len,
  );

/** The arch feather for coverts: straight sides, then a pointed arch. */
const arch = (len: number, w: number) =>
  profile(
    [
      [0.8 * w, 0],
      [w, 0.05 * len],
      [w, 0.5 * len],
      [0.86 * w, 0.74 * len],
      [0.55 * w, 0.92 * len],
    ],
    len,
  );

/** The two-step spear used for the crest and the tail coverts. */
const spear = (len: number, w: number) =>
  profile(
    [
      [0.7 * w, 0],
      [w, 0.12 * len],
      [w, 0.45 * len],
      [0.6 * w, 0.45 * len],
      [0.6 * w, 0.72 * len],
    ],
    len,
  );

type Ink = {
  base: Mat;
  trim: Mat;
  line: Mat;
  rib?: Mat;
  tip?: Mat;
  jewel?: Mat;
  /** Distance between chevron lines; 0 for none. */
  period: number;
};

const INKS = {
  // black lacquer flight feathers with gold ribs and chevron lines, jade tips
  prim: { base: lacq, trim: gold, line: gold, rib: gold, tip: jade, period: 0.05 },
  // polished gold with lacquer lines and a jade jewel at the root
  sec: { base: gold, trim: lacq, line: lacq, rib: lacq, jewel: jade, period: 0.05 },
  // ivory inlay coverts with lacquer chevrons and gold trim
  gcov: { base: ivory, trim: gold, line: lacq, rib: lacq, period: 0.034 },
  // lacquer coverts with jade chevrons
  mcov: { base: lacq, trim: jade, line: jade, period: 0.03 },
  // solid marginal plates
  plateJ: { base: jade, trim: gold, line: jade, period: 0 },
  plateI: { base: ivory, trim: lacq, line: ivory, period: 0 },
  plateG: { base: gold, trim: lacq, line: gold, period: 0 },
  // tail
  tailL: { base: lacq, trim: gold, line: gold, rib: gold, jewel: jade, period: 0.045 },
  tailG: { base: gold, trim: lacq, line: lacq, rib: lacq, jewel: ivory, period: 0.045 },
  // crest rays: gold with a jade rib
  crest: { base: gold, trim: gold, line: gold, rib: jade, period: 0 },
} satisfies Record<string, Ink>;

const painted = new Map<string, Paint>();
function featherPaint(kind: keyof typeof INKS, prof: Prof) {
  const key = `${kind}:${prof.len.toFixed(3)}:${prof.half(prof.len * 0.2).toFixed(3)}`;
  let out = painted.get(key);
  if (!out) {
    const ink: Ink = INKS[kind];
    out = paint((_p, n, s) => {
      const [x, y] = s;
      const ax = Math.abs(x);
      if (prof.half(y) - ax < 0.0042) return ink.trim(n);
      if (ink.tip && y > 0.8 * prof.len) return ink.tip(n);
      if (ink.rib && ax < 0.0026) return ink.rib(n);
      if (ink.jewel && ax / 0.011 + Math.abs(y - 0.2 * prof.len) / 0.028 < 1) return ink.jewel(n);
      if (ink.period > 0 && fract((y + 1.15 * ax) / ink.period) < 0.15) return ink.line(n);
      return ink.base(n);
    });
    painted.set(key, out);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Body paint: lacquer back and gold barred belly, meeting on a jade zigzag; ivory throat with gold chevrons.
const PITCH = 35 * DEG;
const AX = new Vector3(0, Math.sin(PITCH), Math.cos(PITCH));
/** Chevron phase: lines run across the body, pointing forward. */
const chev = (p: Vector3, period: number) => fract((p.dot(AX) + 0.9 * Math.abs(p.x)) / period);

const trousers = paint((p, n) => (chev(p, 0.036) < 0.22 ? lacq(n) : gold(n)));

// ---------------------------------------------------------------------------------------------------------------
// Drawings. Panels are drawn in millimetres, so `sunPanel(0.42, 0.045)` is a 420 x 45 drawing.
const mm = (w: number, h: number) => [Math.round(w * 1000), Math.round(h * 1000)] as const;
const drawn = (W: number, H: number, body: string) =>
  svg(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, {
    size: Math.min(2048, Math.max(W, H) * 2),
  });

/** Lacquer panel with a gold border and rows of sunburst fans, one jade diamond between each. */
function sunPanel(w: number, h: number) {
  const [W, H] = mm(w, h);
  const n = Math.max(1, Math.round(W / (H * 2.6)));
  const R = Math.min(H - 6, W / n / 2 - 5);
  const out: string[] = [`<rect width="${W}" height="${H}" fill="${LACQ}"/>`];
  for (let i = 0; i < n; i++) {
    const cx = ((i + 0.5) * W) / n;
    const cy = H - 3;
    const P = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy - r * Math.sin(a)).toFixed(2)}`;
    for (let k = 0; k < 9; k++) {
      const a0 = (Math.PI * k) / 9;
      const a1 = (Math.PI * (k + 1)) / 9;
      out.push(
        `<path d="M${cx} ${cy} L${P(R, a0)} A${R} ${R} 0 0 0 ${P(R, a1)} Z" fill="${k % 2 ? IVORY : GOLD}" stroke="${LACQ}" stroke-width="0.9"/>`,
      );
    }
    const r = R * 0.33;
    out.push(
      `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="${JADE}" stroke="${GOLD}" stroke-width="1.2"/>`,
      `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="${GOLD}" stroke-width="1.4"/>`,
    );
  }
  for (let i = 0; i <= n; i++) {
    const x = (i * W) / n;
    const d = Math.min(9, H * 0.22);
    out.push(
      `<path d="M${x} ${H / 2 - d} L${x + d * 0.6} ${H / 2} L${x} ${H / 2 + d} L${x - d * 0.6} ${H / 2} Z" fill="${JADE}" stroke="${GOLD}" stroke-width="0.9"/>`,
    );
  }
  out.push(
    `<rect x="1.2" y="1.2" width="${W - 2.4}" height="${H - 2.4}" fill="none" stroke="${GOLD}" stroke-width="1.5"/>`,
  );
  return drawn(W, H, out.join(""));
}

/** Lacquer panel with a double zigzag in gold and ivory, jade beads on the peaks. */
function zigPanel(w: number, h: number) {
  const [W, H] = mm(w, h);
  const step = Math.max(6, H * 0.4);
  const n = Math.round(W / step / 2) * 2;
  const dx = W / n;
  const zig = (y0: number, y1: number) =>
    Array.from({ length: n + 1 }, (_, i) => `${(i * dx).toFixed(2)} ${i % 2 ? y1 : y0}`).join(" ");
  const out: string[] = [
    `<rect width="${W}" height="${H}" fill="${LACQ}"/>`,
    `<polyline points="${zig(H * 0.24, H * 0.78)}" fill="none" stroke="${GOLD}" stroke-width="2.2" stroke-linejoin="miter"/>`,
    `<polyline points="${zig(H * 0.36, H * 0.66)}" fill="none" stroke="${IVORY}" stroke-width="1.5" stroke-linejoin="miter"/>`,
  ];
  for (let i = 0; i <= n; i += 2)
    out.push(`<circle cx="${(i * dx).toFixed(2)}" cy="${H * 0.16}" r="${Math.max(1.6, H * 0.06)}" fill="${JADE}"/>`);
  out.push(
    `<rect x="1.2" y="1.2" width="${W - 2.4}" height="${H - 2.4}" fill="none" stroke="${GOLD}" stroke-width="1.4"/>`,
  );
  return drawn(W, H, out.join(""));
}

/** Lacquer panel with vertical gold flutes, jade caps top and bottom. */
function flutePanel(w: number, h: number) {
  const [W, H] = mm(w, h);
  const n = Math.round(W / 6);
  const dx = W / n;
  const out: string[] = [`<rect width="${W}" height="${H}" fill="${LACQ}"/>`];
  for (let i = 0; i < n; i++) {
    const x = i * dx + dx * 0.2;
    out.push(
      `<rect x="${x.toFixed(2)}" y="4" width="${(dx * 0.6).toFixed(2)}" height="${H - 8}" fill="${GOLD}"/>`,
      `<rect x="${(x + dx * 0.18).toFixed(2)}" y="4" width="${(dx * 0.16).toFixed(2)}" height="${H - 8}" fill="${GOLD_LT}"/>`,
    );
  }
  out.push(
    `<rect x="0" y="0" width="${W}" height="3.4" fill="${JADE}"/>`,
    `<rect x="0" y="${H - 3.4}" width="${W}" height="3.4" fill="${JADE}"/>`,
  );
  return drawn(W, H, out.join(""));
}

/** A round sunburst medallion: gold rim, alternating rays, ivory ring, jade boss. */
const MEDALLION = (() => {
  const rays: string[] = [];
  const P = (r: number, a: number) => `${(128 + r * Math.cos(a)).toFixed(2)} ${(128 - r * Math.sin(a)).toFixed(2)}`;
  for (let k = 0; k < 16; k++) {
    const a0 = (Math.PI * 2 * k) / 16;
    const a1 = (Math.PI * 2 * (k + 1)) / 16;
    rays.push(
      `<path d="M${P(34, a0)} L${P(100, a0)} A100 100 0 0 0 ${P(100, a1)} L${P(34, a1)} Z" fill="${k % 2 ? GOLD_LT : LACQ}"/>`,
    );
  }
  return svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <circle cx="128" cy="128" r="126" fill="${GOLD_DK}"/>
      <circle cx="128" cy="128" r="119" fill="${LACQ}"/>
      <circle cx="128" cy="128" r="112" fill="${GOLD}"/>
      ${rays.join("")}
      <circle cx="128" cy="128" r="102" fill="none" stroke="${LACQ}" stroke-width="4"/>
      <circle cx="128" cy="128" r="36" fill="${IVORY}" stroke="${LACQ}" stroke-width="4"/>
      <circle cx="128" cy="128" r="27" fill="${JADE}" stroke="${GOLD}" stroke-width="3"/>
      <circle cx="128" cy="128" r="10" fill="${GOLD_HOT}"/>
    </svg>`,
    { size: 256 },
  );
})();

/** A falcon's eye: gold ring, lacquer, a jade iris with radial lines, a black pupil and a highlight. */
const EYE = (() => {
  const lines: string[] = [];
  for (let k = 0; k < 14; k++) {
    const a = (Math.PI * 2 * k) / 14;
    lines.push(
      `<line x1="${64 + 16 * Math.cos(a)}" y1="${64 + 16 * Math.sin(a)}" x2="${64 + 40 * Math.cos(a)}" y2="${64 + 40 * Math.sin(a)}" stroke="${JADE_LT}" stroke-width="3"/>`,
    );
  }
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="63" fill="${GOLD}"/>
      <circle cx="64" cy="64" r="53" fill="${LACQ}"/>
      <circle cx="64" cy="64" r="44" fill="${JADE_DK}"/>
      ${lines.join("")}
      <circle cx="64" cy="64" r="19" fill="${LACQ}"/>
      <circle cx="47" cy="45" r="8" fill="${IVORY}"/>
    </svg>`,
    { size: 128 },
  );
})();

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "artDecoFalcon", paintSize: 2048 });

  // ---- Base geometry: the stepped ziggurat --------------------------------------------------------------------------
  const CAP = 0.007;
  const TIERS = [
    { hx: 0.25, hz: 0.17, h: 0.06, ch: 0.032 },
    { hx: 0.21, hz: 0.14, h: 0.05, ch: 0.028 },
    { hx: 0.17, hz: 0.11, h: 0.045, ch: 0.025 },
    { hx: 0.13, hz: 0.085, h: 0.04, ch: 0.02 },
  ];
  const TOP = TIERS.reduce((sum, t) => sum + t.h, 0);

  // ---- Skeleton and body loft ---------------------------------------------------------------------------------------
  const R = new Vector3(0, TOP + 0.115, -0.14);
  const UPV = new Vector3(0, Math.cos(PITCH), -Math.sin(PITCH));
  const along = (s: number, v = 0) => R.clone().addScaledVector(AX, s).addScaledVector(UPV, v);
  const n5 = along(0.39, 0.03);
  const n6 = n5.clone().add(new Vector3(0, 0.038, 0.03));
  const n7 = n6.clone().add(new Vector3(0, 0.032, 0.042));
  const stations = [
    { at: along(0, 0), w: 0.07, h: 0.07 },
    { at: along(0.07, 0), w: 0.15, h: 0.14 },
    { at: along(0.16, -0.005), w: 0.2, h: 0.19 },
    { at: along(0.25, 0.005), w: 0.2, h: 0.19 },
    { at: along(0.33, 0.012), w: 0.15, h: 0.15 },
    { at: n5, w: 0.11, h: 0.12 },
    { at: n6, w: 0.1, h: 0.105 },
    { at: n7, w: 0.09, h: 0.095 },
  ];
  const curve = catmull(stations.map((st) => st.at));
  const hipsT = curve.knots[2];
  const chestT = curve.knots[4];
  const hips = b.joint("hips", { at: stations[2].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, chestT), {
    parent: hips,
    count: 2,
    names: ["spine1", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[1];
  const neck = b.chain("neck", curve.slice(chestT, 1), {
    parent: chest,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
    group: "tail",
  });

  const bodyPaint = paint((p, n, s) => {
    const [t, deg] = s;
    const a = Math.abs(((((deg + 180) % 360) + 360) % 360) - 180);
    const zig = tri((t * curve.length) / 0.045);
    if (t > curve.knots[5]) {
      const edge = 100 + 20 * zig;
      if (Math.abs(a - edge) < 3) return jade(n);
      if (a < edge) return lacq(n);
      return chev(p, 0.024) < 0.24 ? gold(n) : ivory(n);
    }
    const edge = 98 + 18 * zig;
    if (Math.abs(a - edge) < 3.2) return jade(n);
    if (a < edge) return chev(p, 0.06) < 0.08 ? gold(n) : lacq(n);
    return chev(p, 0.036) < 0.22 ? lacq(n) : gold(n);
  });
  const body = b.loft(stations, {
    bone: [tail, hips, spine, neck],
    color: bodyPaint,
    sides: 8,
    group: "body",
  });

  // ---- The ziggurat -------------------------------------------------------------------------------------------------
  let y0 = 0;
  TIERS.forEach((t, i) => {
    const octagon = (hx: number, hz: number, ch: number): OutlinePoint[] => [
      [-hx + ch, -hz],
      [hx - ch, -hz],
      [hx, -hz + ch],
      [hx, hz - ch],
      [hx - ch, hz],
      [-hx + ch, hz],
      [-hx, hz - ch],
      [-hx, -hz + ch],
    ];
    const lay = { x: [1, 0, 0] as V3, y: [0, 0, -1] as V3, bone: hips, group: "base" };
    b.extrude(octagon(t.hx, t.hz, t.ch), {
      ...lay,
      at: [0, y0 + (t.h - CAP) / 2, 0],
      thickness: t.h - CAP,
      color: LACQP,
      name: `tier${i + 1}`,
    });
    b.extrude(octagon(t.hx + 0.006, t.hz + 0.006, t.ch + 0.004), {
      ...lay,
      at: [0, y0 + t.h - CAP / 2, 0],
      thickness: CAP,
      color: GOLDP,
      name: `tierCap${i + 1}`,
    });
    // Faces: a sunburst band, a zigzag, flutes; the top tier is plain lacquer under the gold cap.
    if (i < 3) {
      const H = t.h - CAP - 0.012;
      const yc = y0 + (t.h - CAP) / 2;
      const make = i === 0 ? sunPanel : i === 1 ? zigPanel : flutePanel;
      const wf = 2 * (t.hx - t.ch) - 0.022;
      const ws = 2 * (t.hz - t.ch) - 0.022;
      const front = make(wf, H);
      const side = make(ws, H);
      for (const s of [1, -1]) {
        b.part(new PlaneGeometry(wf, H), WHITE, {
          texture: front,
          bone: hips,
          at: [0, yc, s * (t.hz + 0.0012)],
          dir: [0, 0, s],
          axis: "z",
          up: [0, 1, 0],
          group: "base",
        });
        b.part(new PlaneGeometry(ws, H), WHITE, {
          texture: side,
          bone: hips,
          at: [s * (t.hx + 0.0012), yc, 0],
          dir: [s, 0, 0],
          axis: "z",
          up: [0, 1, 0],
          group: "base",
        });
      }
    }
    y0 += t.h;
  });
  // Stepped setback pylons on the four corners of the bottom ledge, like a skyscraper's towers.
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      [
        { w: 0.028, c: LACQP },
        { w: 0.02, c: GOLDP },
        { w: 0.012, c: JADEP },
      ].forEach(({ w, c }, k) =>
        b.part(new BoxGeometry(w, 0.02, w), c, {
          bone: hips,
          at: [sx * 0.227, TIERS[0].h + 0.01 + 0.02 * k, sz * 0.146],
          group: "base",
          name: "pylon",
        }),
      );
  // A jade plaque inlaid in the top step, under the feet.
  b.extrude(
    [
      [-0.085, -0.045],
      [0.085, -0.045],
      [0.095, -0.03],
      [0.095, 0.05],
      [0.085, 0.06],
      [-0.085, 0.06],
      [-0.095, 0.05],
      [-0.095, -0.03],
    ],
    {
      at: [0, TOP + 0.0007, 0],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.0014,
      color: JADEP,
      bone: hips,
      group: "base",
      name: "plaque",
    },
  );

  // Breast medallion: a sunburst disc on the front of the chest.
  const front = b.surface(body).around(along(0.28, 0)).at(0, -22);
  if (front)
    b.part(new CircleGeometry(0.046, 12), WHITE, {
      texture: MEDALLION,
      frame: front,
      at: offset(front, front.axis, 0.003),
      dir: front.axis,
      axis: "z",
      up: UPV,
      group: "body",
    });

  // A stepped gold collar at the base of the neck: three steps and a jade ring.
  const collarAt = neck.at(0.04);
  b.lathe(
    [
      [0.038, 0],
      [0.082, 0],
      [0.082, 0.007],
      [0.07, 0.007],
      [0.07, 0.014],
      [0.058, 0.014],
      [0.058, 0.021],
      [0.038, 0.021],
    ],
    {
      at: offset(collarAt, collarAt, -0.01),
      axis: collarAt.axis,
      bone: neck.joints[0],
      segments: 8,
      color: GOLDP,
      group: "neck",
      name: "collar",
    },
  );
  b.lathe(
    [
      [0.052, 0],
      [0.064, 0],
      [0.064, 0.006],
      [0.052, 0.006],
    ],
    {
      at: offset(collarAt, collarAt, 0.012),
      axis: collarAt.axis,
      bone: neck.joints[0],
      segments: 8,
      color: JADEP,
      group: "neck",
      name: "collarJade",
    },
  );

  // ---- Head ---------------------------------------------------------------------------------------------------------
  const headDir: V3 = [0, -0.1, 1];
  const skull = b.joint("head", { parent: neck.joints[2], at: neck.at(1), dir: headDir, role: "head", group: "head" });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const headPaint = paint((p, n, s) => {
    const [t, deg] = s;
    const a = Math.abs(((((deg + 180) % 360) + 360) % 360) - 180);
    const edge = 96 + 14 * tri((t * 0.135) / 0.03);
    if (Math.abs(a - edge) < 3) return gold(n);
    void p;
    return a < edge ? lacq(n) : ivory(n);
  });
  const cranium = b.loft(
    [
      { at: head.p([0, 0.005, -0.06]), w: 0.07, h: 0.075 },
      { at: head.p([0, 0.012, -0.01]), w: 0.086, h: 0.086 },
      { at: head.p([0, 0.0, 0.04]), w: 0.066, h: 0.068 },
      { at: head.p([0, -0.004, 0.075]), w: 0.04, h: 0.046 },
    ],
    { bone: skull, color: headPaint, sides: 8, group: "head" },
  );

  // Hooked beak: one tapering sweep along the culmen that curls into the hook, gold with a lacquer tip.
  const beakPath = bezier(
    head.p([0, 0.012, 0.05]),
    head.p([0, 0.022, 0.1]),
    head.p([0, 0.012, 0.135]),
    head.p([0, -0.028, 0.128]),
  );
  b.sweep(
    beakPath,
    (t) => {
      const k = Math.pow(1 - t, 0.85);
      return [0.024 * k + 0.002, 0.03 * k + 0.002];
    },
    {
      bone: skull,
      bands: [
        [0.78, GOLDP],
        [1, LACQP],
      ],
      caps: { start: "round", end: "point" },
      sides: 8,
      group: "head",
      name: "beak",
    },
  );
  const cereAxis = beakPath.tangentAt(0.12);
  b.lathe(
    [
      [0.024, 0],
      [0.032, 0.003],
      [0.031, 0.016],
      [0.026, 0.028],
      [0.021, 0.022],
      [0.023, 0.009],
    ],
    {
      at: offset(beakPath.at(0.08), cereAxis, -0.02),
      axis: cereAxis,
      bone: skull,
      segments: 8,
      color: JADEP,
      group: "head",
      name: "cere",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.018, -0.005],
    aim: [0, -0.02, 0.1],
    role: "jaw",
    group: "jaw",
  });
  b.sweep([jaw.at, head.p([0, -0.022, 0.1])], (t) => [0.021 - 0.014 * t, 0.012 - 0.006 * t], {
    bone: jaw,
    color: GOLDP,
    sides: 8,
    caps: { start: "round", end: "point" },
    group: "jaw",
    name: "mandible",
  });

  const face = b.surface(cranium);
  for (const [s, side] of SIDES) {
    const socket = face.ray(head.p([s * 0.3, 0.014, 0.012]), head.d([-s, 0, 0]));
    if (!socket) throw new Error("artDecoFalcon: no skull under the eye");
    const gaze = head.d([s * 0.85, 0.05, 0.5]).normalize();
    // Gold eye ring, lacquer dome and the drawn iris.
    b.lathe(
      [
        [0.012, 0],
        [0.022, 0],
        [0.021, 0.004],
        [0.017, 0.007],
      ],
      {
        at: offset(socket, gaze, -0.004),
        axis: gaze,
        bone: skull,
        segments: 6,
        color: GOLDP,
        group: "head",
        name: `eyeRing${side}`,
      },
    );
    b.lathe(
      [
        [0, 0],
        [0.016, 0],
        [0.015, 0.004],
        [0.009, 0.0085],
        [0, 0.0095],
      ],
      {
        at: offset(socket, gaze, -0.005),
        axis: gaze,
        bone: skull,
        segments: 6,
        color: LACQP,
        group: "head",
        name: `eye${side}`,
      },
    );
    b.part(new CircleGeometry(0.0128, 10), WHITE, {
      texture: EYE,
      bone: skull,
      at: offset(socket, gaze, 0.0049),
      dir: gaze,
      axis: "z",
      up: head.d([0, 1, 0]),
      group: "head",
    });
    // Brow: a stepped gold plate over the eye, and the malar stripe below it, lacquer edged in gold.
    b.extrude(
      [
        [-0.034, -0.005],
        [0.03, -0.005],
        [0.03, 0.0],
        [0.02, 0.0],
        [0.02, 0.006],
        [0.005, 0.006],
        [0.005, 0.011],
        [-0.034, 0.011],
      ],
      {
        at: offset(offset(socket, head.d([0, 1, 0]), 0.021), head.d([-s, 0, 0]), 0.004),
        x: head.d([0, 0, 1]),
        y: head.d([s * 0.35, 1, 0]),
        thickness: 0.007,
        bone: skull,
        color: GOLDP,
        group: "head",
        name: `brow${side}`,
      },
    );
    const cheek = face.ray(head.p([s * 0.3, -0.008, 0.02]), head.d([-s, 0, 0]));
    if (cheek)
      b.extrude(
        [
          [-0.012, 0],
          [0.014, 0],
          [0.012, 0.014],
          [0.004, 0.014],
          [0.004, 0.028],
          [-0.004, 0.028],
          [-0.004, 0.014],
          [-0.012, 0.014],
        ],
        {
          at: offset(cheek, cheek.axis, 0.001),
          x: head.d([0, 0, 1]),
          y: head.d([s * 0.25, -1, -0.35]),
          thickness: 0.006,
          bone: skull,
          color: LACQP,
          group: "head",
          name: `malar${side}`,
        },
      );
  }
  // A sunburst crown: seven spear rays fanned over the back of the head, swept back and up.
  for (let i = 0; i < 7; i++) {
    const yaw = (i - 3) * 20 * DEG;
    const el = (i === 3 ? 58 : 50) * DEG;
    const dirL = new Vector3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el));
    const xL = new Vector3().crossVectors(dirL, new Vector3(0, 1, 0)).normalize();
    const prof = spear(i === 3 ? 0.095 : 0.075 - 0.006 * Math.abs(i - 3), 0.0125);
    b.extrude(prof.outline, {
      at: head.p([Math.sin(yaw) * 0.014, 0.034, -0.04 - 0.004 * Math.abs(i - 3)]),
      x: head.d(xL),
      y: head.d(dirL),
      thickness: 0.004,
      bone: skull,
      color: featherPaint("crest", prof),
      group: "head",
      name: `crest${i + 1}`,
    });
  }

  // ---- Wings --------------------------------------------------------------------------------------------------------
  const DIHEDRAL = 28 * DEG;
  const INCIDENCE = 12 * DEG;
  const remigeDeg = [118, 104, 92, 24];
  for (const [s, side] of SIDES) {
    const g = `wing${side}`;
    const span = new Vector3(s * Math.cos(DIHEDRAL), Math.sin(DIHEDRAL), 0);
    const tilt = new Quaternion().setFromAxisAngle(span, -s * INCIDENCE);
    const normal = new Vector3(-s * Math.sin(DIHEDRAL), Math.cos(DIHEDRAL), 0).applyQuaternion(tilt);
    const back = new Vector3(0, 0, -1).applyQuaternion(tilt);
    const shoulder = new Vector3(s * 0.075, TOP + 0.335, 0.07);
    const onWing = (out: number, z: number) => shoulder.clone().addScaledVector(span, out).setZ(z);
    const keys = [onWing(0, 0.07), onWing(0.2, 0.055), onWing(0.35, 0.03), onWing(0.41, 0.0)];
    const arm = b.chain(g, keys, {
      parent: chest,
      up: normal,
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
      group: g,
    });
    b.sweep(arm, [0.017, 0.01], {
      bands: [
        [0.16, GOLDP],
        [0.2, LACQP],
        [0.36, GOLDP],
        [0.4, LACQP],
        [0.56, GOLDP],
        [0.6, LACQP],
        [0.76, GOLDP],
        [0.8, LACQP],
        [1, GOLDP],
      ],
      sides: 8,
      group: g,
      name: `arm${side}`,
    });

    const segment = (u: number) => Math.min(2, Math.floor(u));
    const atU = (u: number) => lerp(keys[segment(u)], keys[segment(u) + 1], u - segment(u));
    const degAt = (u: number) => {
      const i = segment(u);
      return remigeDeg[i] + (remigeDeg[i + 1] - remigeDeg[i]) * (u - i);
    };
    const toward = (deg: number) =>
      span
        .clone()
        .multiplyScalar(Math.cos(deg * DEG))
        .addScaledVector(back, Math.sin(deg * DEG));
    const feather = (
      u: number,
      behind: number,
      lift: number,
      prof: Prof,
      thickness: readonly [number, number],
      kind: keyof typeof INKS,
      bone: Joint,
    ) => {
      const y = toward(degAt(u));
      return b.extrude(prof.outline, {
        at: atU(u).addScaledVector(back, behind).addScaledVector(normal, lift),
        x: new Vector3().crossVectors(y, normal),
        y,
        thickness,
        bone,
        color: featherPaint(kind, prof),
        group: g,
      });
    };

    // Primaries: nine ziggurat blades in three steps of length, on three digit joints.
    const PRIM = [0.3, 0.3, 0.3, 0.27, 0.27, 0.27, 0.23, 0.225, 0.205];
    const primTh = [0.009, 0.004] as const;
    for (let k = 0; k < 3; k++) {
      const midU = 2.04 + ((3 * k + 1) / 8) * 0.92;
      const root = atU(midU);
      const digit = b.chain(`primaries${k + 1}${side}`, [root, offset(root, toward(degAt(midU)), PRIM[3 * k + 1])], {
        parent: arm.joints[2],
        up: normal,
        names: [`primaries${k + 1}${side}`],
        role: "digit",
        group: g,
      }).joints[0];
      for (let j = 0; j < 3; j++) {
        const i = 3 * k + j;
        const u = 2.04 + (i / 8) * 0.92;
        feather(u, 0, 0.0037 * (i % 2), stepped(PRIM[i], 0.03), primTh, "prim", digit);
      }
    }
    // Secondaries: nine blades along the forearm on two group joints, growing longer toward the wrist.
    const secTh = [0.01, 0.004] as const;
    for (let k = 0; k < 2; k++) {
      const midU = 1.04 + (k ? 0.72 : 0.26);
      const root = atU(midU);
      const group = b.chain(`secondaries${k + 1}${side}`, [root, offset(root, toward(degAt(midU)), 0.2)], {
        parent: arm.joints[1],
        up: normal,
        names: [`secondaries${k + 1}${side}`],
        role: "digit",
        group: g,
      }).joints[0];
      for (let j = 0; j < (k ? 5 : 4); j++) {
        const i = k ? 4 + j : j;
        const u = 1.04 + (i / 8) * 0.92;
        feather(u, 0, 0.0037 * (i % 2), stepped(0.22 + 0.02 * Math.floor(i / 3), 0.031), secTh, "sec", group);
      }
    }
    // Tertials along the humerus, angled in over the back.
    for (let i = 0; i < 4; i++) {
      const u = 0.12 + i * 0.22;
      feather(
        u,
        0,
        0.012 + 0.0037 * (i % 2),
        stepped(0.2 + 0.02 * Math.floor(i / 2), 0.031),
        secTh,
        "sec",
        arm.joints[0],
      );
    }
    // Coverts in three rows: ivory greater, lacquer median, jade / ivory / gold marginal plates.
    for (let i = 0; i < 17; i++) {
      const u = 0.22 + (i / 16) * 2.7;
      feather(
        u,
        0.035,
        0.02 + 0.003 * (i % 2),
        arch(u > 2 ? 0.14 : 0.16, 0.028),
        [0.008, 0.004],
        "gcov",
        arm.joints[segment(u)],
      );
    }
    for (let i = 0; i < 14; i++) {
      const u = 0.18 + (i / 13) * 2.55;
      feather(u, 0.002, 0.032 + 0.003 * (i % 2), arch(0.1, 0.024), [0.007, 0.003], "mcov", arm.joints[segment(u)]);
    }
    const plates = ["plateJ", "plateI", "plateG"] as const;
    for (let i = 0; i < 16; i++) {
      const u = 0.06 + (i / 15) * 2.86;
      feather(
        u,
        -0.03,
        0.043 + 0.003 * (i % 2),
        arch(0.066, 0.02),
        [0.006, 0.003],
        plates[i % 3],
        arm.joints[segment(u)],
      );
    }
    // The underwing repeats the fan: gold and ivory greater coverts, then a row of jade and lacquer plates.
    for (let i = 0; i < 15; i++) {
      const u = 0.2 + (i / 14) * 2.72;
      feather(
        u,
        0.03,
        -0.022 - 0.003 * (i % 2),
        arch(u > 2 ? 0.13 : 0.15, 0.03),
        [0.008, 0.004],
        i % 2 ? "plateG" : "gcov",
        arm.joints[segment(u)],
      );
    }
    for (let i = 0; i < 16; i++) {
      const u = 0.06 + (i / 15) * 2.86;
      feather(
        u,
        -0.026,
        -0.036 - 0.003 * (i % 2),
        arch(0.07, 0.02),
        [0.006, 0.003],
        i % 2 ? "plateJ" : "mcov",
        arm.joints[segment(u)],
      );
    }
    // Shoulder rosettes on both faces of the wing root.
    for (const face of [1, -1]) {
      b.part(new CircleGeometry(0.04, 12), WHITE, {
        texture: MEDALLION,
        bone: arm.joints[0],
        at: atU(0.24)
          .addScaledVector(normal, face * 0.058)
          .addScaledVector(back, 0.005),
        dir: normal.clone().multiplyScalar(face),
        axis: "z",
        up: [0, 0, 1],
        group: g,
        name: `rosette${side}`,
      });
    }
  }

  // ---- Tail fan -----------------------------------------------------------------------------------------------------
  const rump = along(0.005, 0.01);
  b.ring(
    frame(rump, [0, 1, 0]),
    { count: 9, fromDeg: 112, toDeg: 248, tilt: -24, joints: 3, name: "tailFan", parent: tail.joints[1] },
    (item) => {
      const prof = stepped(item.i === 4 ? 0.29 : 0.27 - 0.005 * Math.abs(item.i - 4), 0.034);
      const y = item.axis;
      return b.extrude(prof.outline, {
        at: offset(item, [0, 1, 0], 0.0032 * (item.i % 2)),
        bone: item.bone ?? undefined,
        x: new Vector3().crossVectors(y, new Vector3(0, 1, 0)).normalize(),
        y,
        thickness: [0.009, 0.004],
        color: featherPaint(item.i % 2 ? "tailG" : "tailL", prof),
        group: "tail",
        name: `tailFeather${item.i + 1}`,
      });
    },
  );
  // Stepped upper tail coverts over the root of the fan.
  for (let i = 0; i < 5; i++) {
    const a = (150 + i * 15) * DEG;
    const d = new Vector3(Math.cos(a) * 0.3, -0.42, Math.sin(a)).normalize();
    const prof = spear(0.1, 0.02);
    b.extrude(prof.outline, {
      at: offset(rump, [0, 1, 0], 0.018),
      x: new Vector3().crossVectors(d, new Vector3(0, 1, 0)).normalize(),
      y: d,
      thickness: [0.007, 0.003],
      bone: tail.joints[0],
      color: featherPaint(i % 2 ? "plateG" : "mcov", prof),
      group: "tail",
      name: `tailCovert${i + 1}`,
    });
  }

  // ---- Legs and talons ----------------------------------------------------------------------------------------------
  for (const [s, side] of SIDES) {
    const g = `leg${side}`;
    const foot = new Vector3(s * 0.07, TOP + 0.034, 0.035);
    const leg = b.chain(
      g,
      limb(
        [s * 0.065, TOP + 0.185, -0.005],
        foot,
        [0.07, 0.075, 0.05],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
      ),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`],
        role: "leg",
        contact: [foot.x, TOP, foot.z],
        group: g,
      },
    );
    const hock = leg.joints[2];
    const [, tk, th] = leg.ts;
    b.sweep(leg, (t) => (t < tk ? 0.05 - 0.014 * (t / tk) : t < th ? 0.036 - 0.02 * ((t - tk) / (th - tk)) : 0.012), {
      bands: [
        [th, trousers],
        [1, GOLDP],
      ],
      sides: 8,
      group: g,
      name: `leg${side}`,
    });
    // A stepped lacquer cuff where the feathered trousers end.
    const cuffAt = leg.at(th);
    b.lathe(
      [
        [0.012, 0],
        [0.03, 0],
        [0.03, 0.006],
        [0.022, 0.006],
        [0.022, 0.012],
        [0.012, 0.012],
      ],
      {
        at: offset(cuffAt, cuffAt, -0.004),
        axis: cuffAt.axis.clone().negate(),
        bone: leg.joints[1],
        segments: 8,
        color: LACQP,
        group: g,
        name: `cuff${side}`,
      },
    );
    // Feet: three toes forward, the hallux back, each on two joints, with a curved lacquer talon.
    const ball = leg.at(1).at;
    [
      { yaw: s * 32, len: 0.058 },
      { yaw: 0, len: 0.07 },
      { yaw: -s * 32, len: 0.058 },
      { yaw: 180 - s * 10, len: 0.046 },
    ].forEach(({ yaw, len }, k) => {
      const d = new Vector3(Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG));
      const knuckle = ball
        .clone()
        .addScaledVector(d, len * 0.5)
        .setY(TOP + 0.017);
      const end = ball
        .clone()
        .addScaledVector(d, len)
        .setY(TOP + 0.0095);
      const toe = b.chain(`toe${k + 1}${side}`, catmull([ball, knuckle, end]), {
        parent: hock,
        names: [`toe${k + 1}a${side}`, `toe${k + 1}b${side}`],
        role: "digit",
        group: g,
      });
      b.sweep(toe, [0.011, 0.009, 0.0075], { color: GOLDP, sides: 6, group: g, name: `toe${k + 1}${side}` });
      const tip = offset(end, d, k === 3 ? 0.034 : 0.03).setY(TOP + 0.0025);
      b.sweep(bezier(end, offset(end, d, 0.016).setY(TOP + 0.02), tip), [0.0075, 0], {
        bone: toe.joints[1],
        color: LACQP,
        caps: { start: "round", end: "point" },
        sides: 5,
        group: g,
        name: `talon${k + 1}${side}`,
      });
    });
  }

  // Rest pose: the beak just open so the two mandibles read apart.
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  return b.root;
}
