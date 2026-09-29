// Little lich: a pudgy, big-headed baby lich (about 0.9 m) in a cute chibi style: soft rounded low-poly volumes, flat
// colour fills only (no paints), a pastel purple and mint palette and bright glow accents. The head is as big as the
// body: a chubby bone skull with two huge glowing eyes, a heart-shaped nose hole, a toothy grin with a separate lower
// jaw, and a floppy oversize bone crown slipping over one eye socket. The oversized tattered robe pools around the feet
// in flat hem flaps; sleeves hang past stubby bone hands with five fingers each. The left hand hooks a soul-flame
// lantern with a trapped, happy ghost; a tiny spellbook swings on a chain, a bat clings to the right shoulder and four
// candles float about. Drawings (SVG): the face with its glowing eyes, cheeks and grin curls, robe patches, hem runes,
// the back sigil, the book cover, the ghost's and the bat's faces, lantern glints and sparkles. The rig is humanoid:
// hips, three spine joints, neck, head, jaw, arms with three-joint fingers, legs with toes, plus crown, lantern, book,
// bat and candle joints.
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { catmull, polyline } from "../src/path";
import type { Joint } from "../src/skeleton";
import type { Surface } from "../src/surface";
import { interpolate } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Little Lich",
  description:
    "A 0.9 m chibi baby lich: chubby skull with huge glowing eyes and a toothy grin, a too-big bone crown slipping over one eye, an oversized tattered purple robe pooling at its feet, a soul-flame lantern with a trapped ghost, a tiny chained spellbook, a shoulder bat and floating candles, on a humanoid rig with fingers.",
  builtBy: "Claude Sonnet 5.5",
};

// ---------------------------------------------------------------------------------------------------- palette
const PURPLE = "#a88ce9";
const PURPLE_LT = "#c6b3f6";
const PURPLE_DK = "#8468cf";
const PLUM = "#4b3889";
const DARK = "#2a1d4f";
const MINT = "#93f3d2";
const MINT_DK = "#54cfa9";
const GLOW = "#5bffd0";
const GLOW_LT = "#d8fff1";
const BONE = "#f7f0dc";
const BONE_DK = "#e7dbbc";
const TOOTH = "#fffdf1";
const PINK = "#ff9cc6";
const PINK_LT = "#ffc5de";
const GOLD = "#ffd66b";
const GOLD_DK = "#d8a840";
const FLAME = "#ffb84a";
const FLAME_LT = "#fff29a";
const WAX_CREAM = "#fff3d4";
const GHOST = "#ebfff8";
const GHOST_SH = "#bdf6e0";
const BAT = "#5b4b9c";
const BAT_LT = "#8676c8";
const BAT_WING = "#7767bd";
const BAT_DK = "#3b3072";
const IRON = "#54428f";

type V3 = [number, number, number];
const P = (x: number, y: number, z: number) => new Vector3(x, y, z);
const outlined = (d: string, color: string, w: number) =>
  `<path d="${d}" fill="none" stroke="${DARK}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// ------------------------------------------------------------------------------------------------ SVG drawings
// The face, drawn on a 300 x 200 sheet (1000 drawing units per meter): two big glowing eyes in dark sockets, a heart
// nose hole, blush, a forehead crack and the curls at the corners of the grin.
const eyeSvg = (cx: number) =>
  `<circle cx="${cx}" cy="50" r="46" fill="${DARK}"/>` +
  `<circle cx="${cx}" cy="50" r="35" fill="${MINT_DK}"/>` +
  `<circle cx="${cx}" cy="50" r="29" fill="${GLOW}"/>` +
  `<circle cx="${cx}" cy="52" r="17" fill="${GLOW_LT}"/>` +
  `<circle cx="${cx - 11}" cy="38" r="10" fill="#ffffff"/>` +
  `<circle cx="${cx + 12}" cy="62" r="4.5" fill="#ffffff"/>`;
const FACE = svg(
  `<svg viewBox="0 0 300 200">
    ${eyeSvg(75)}${eyeSvg(225)}
    <path d="M150 140 L135 124 C126 112 141 103 150 116 C159 103 174 112 165 124 Z" fill="${DARK}"/>
    <ellipse cx="42" cy="108" rx="24" ry="12" fill="${PINK}"/>
    <ellipse cx="258" cy="108" rx="24" ry="12" fill="${PINK}"/>
    <path d="M30 108 l6 -7 M44 110 l6 -7 M58 108 l6 -7 M242 108 l6 -7 M256 110 l6 -7 M270 108 l6 -7" stroke="#ff6fa8" stroke-width="3" stroke-linecap="round"/>
    <path d="M96 4 l9 15 l-9 7 l11 16" fill="none" stroke="${DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M55 158 Q43 172 52 188 M245 158 Q257 172 248 188" fill="none" stroke="${DARK}" stroke-width="6" stroke-linecap="round"/>
  </svg>`,
  { size: 768 },
);

const GHOST_FACE = svg(
  `<svg viewBox="0 0 100 70">
    <ellipse cx="30" cy="30" rx="9" ry="11" fill="${DARK}"/><ellipse cx="70" cy="30" rx="9" ry="11" fill="${DARK}"/>
    <circle cx="27" cy="25" r="3.6" fill="#ffffff"/><circle cx="67" cy="25" r="3.6" fill="#ffffff"/>
    <path d="M38 47 Q50 62 62 47 Z" fill="${DARK}"/>
    <path d="M42 53 Q50 58 58 53 Q50 50 42 53Z" fill="${PINK}"/>
    <ellipse cx="14" cy="47" rx="8" ry="5" fill="${PINK}"/><ellipse cx="86" cy="47" rx="8" ry="5" fill="${PINK}"/>
  </svg>`,
  { size: 192 },
);

const BAT_FACE = svg(
  `<svg viewBox="0 0 80 60">
    <circle cx="22" cy="24" r="13" fill="#ffe066"/><circle cx="58" cy="24" r="13" fill="#ffe066"/>
    <circle cx="24" cy="25" r="7" fill="${DARK}"/><circle cx="56" cy="25" r="7" fill="${DARK}"/>
    <circle cx="21" cy="21" r="3" fill="#ffffff"/><circle cx="53" cy="21" r="3" fill="#ffffff"/>
    <path d="M34 38 L46 38 L40 46 Z" fill="${PINK}"/>
    <path d="M27 47 Q40 58 53 47" fill="none" stroke="${DARK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M31 50 l3 8 l3 -6 Z M43 52 l3 6 l3 -8 Z" fill="#ffffff"/>
  </svg>`,
  { size: 192 },
);

const heartPatch = svg(
  `<svg viewBox="0 0 64 64">
    <polygon points="4,7 22,3 40,7 60,4 62,22 58,40 62,58 42,61 24,57 5,62 3,42 7,24" fill="${MINT}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="10" y="10" width="44" height="44" fill="none" stroke="${MINT_DK}" stroke-width="2.6" stroke-dasharray="6 4"/>
    <path d="M32 50 L18 35 C10 25 24 15 32 27 C40 15 54 25 46 35 Z" fill="${PINK}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);
const starPatch = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="${PINK_LT}" stroke="${DARK}" stroke-width="3"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="${PINK}" stroke-width="2.6" stroke-dasharray="6 4"/>
    <polygon points="32,10 38,26 55,27 42,38 46,55 32,45 18,55 22,38 9,27 26,26" fill="${GOLD}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);
const bandage = svg(
  `<svg viewBox="0 0 64 64">
    <g stroke="${DARK}" stroke-width="3" fill="#f8cdb0" stroke-linejoin="round">
      <rect x="22" y="4" width="20" height="56" rx="4"/><rect x="4" y="22" width="56" height="20" rx="4"/>
    </g>
    <rect x="23.5" y="23.5" width="17" height="17" fill="#f8cdb0"/>
    <path d="M27 27 l10 10 M37 27 l-10 10 M28 10 h8 M28 54 h8 M10 28 v8 M54 28 v8" stroke="${DARK}" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const runeSvg = (d: string) => svg(`<svg viewBox="0 0 40 50">${outlined(d, GLOW, 5)}</svg>`, { size: 128 });
const RUNES = [
  runeSvg("M14 6 V44 M14 12 L30 24 L14 34"),
  runeSvg("M20 5 V45 M8 16 L20 26 L32 16 M8 34 L20 44 L32 34"),
  runeSvg("M10 44 L20 6 L30 44 M13 30 H27"),
  runeSvg("M12 8 L30 24 L12 42 M30 8 V42"),
];
const SIGIL = svg(
  `<svg viewBox="0 0 100 100">
    ${outlined("M50 8 A42 42 0 1 1 49.9 8 Z", GLOW, 4)}
    ${outlined("M50 24 L61 58 L32 37 H68 L39 58 Z", MINT, 4)}
    ${outlined("M50 76 v10 M14 50 h10 M76 50 h10", GLOW, 4)}
    <circle cx="50" cy="47" r="5" fill="${GLOW_LT}" stroke="${DARK}" stroke-width="2.5"/>
  </svg>`,
  { size: 256 },
);

const BOOK_COVER = svg(
  `<svg viewBox="0 0 60 80">
    <rect x="5" y="5" width="50" height="70" rx="5" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <path d="M10 42 Q30 20 50 42 Q30 62 10 42 Z" fill="${GLOW_LT}" stroke="${DARK}" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="30" cy="42" r="9" fill="${GLOW}" stroke="${DARK}" stroke-width="2"/><circle cx="30" cy="42" r="4" fill="${DARK}"/>
    <path d="M30 8 v9 M17 14 l5 7 M43 14 l-5 7 M30 76 v-9 M17 70 l5 -7 M43 70 l-5 -7" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const GLINT = svg(
  `<svg viewBox="0 0 30 60"><polygon points="4,52 11,52 26,8 19,8" fill="#f2fffa"/><polygon points="0,40 3,40 10,22 7,22" fill="#f2fffa"/></svg>`,
  { size: 96 },
);
const SPARKLE_GOLD = svg(
  `<svg viewBox="0 0 40 40"><polygon points="20,1 24,16 39,20 24,24 20,39 16,24 1,20 16,16" fill="${GOLD}" stroke="${GOLD_DK}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  { size: 96 },
);
const SPARKLE_MINT = svg(
  `<svg viewBox="0 0 40 40"><polygon points="20,1 24,16 39,20 24,24 20,39 16,24 1,20 16,16" fill="${GLOW}" stroke="${MINT_DK}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  { size: 96 },
);

// ------------------------------------------------------------------------------------------------ decal helper
/**
 * A sheet of quads shrink-wrapped onto a surface by parallel rays along `-gaze`: a drawing that follows the skull, the
 * robe or the ghost. `right` is the viewer's right looking along -gaze; `roll` turns it counter-clockwise (degrees).
 */
function decal(skin: Surface, center: Vector3, gaze: Vector3, hw: number, hh: number, cols = 8, rows = 8, roll = 0) {
  const g = gaze.clone().normalize();
  let right = new Vector3().crossVectors(new Vector3(0, 1, 0), g);
  if (right.lengthSq() < 1e-6) right = new Vector3(1, 0, 0);
  right.normalize();
  let up = new Vector3().crossVectors(g, right).normalize();
  if (roll) {
    right = right.applyAxisAngle(g, roll * DEG);
    up = up.applyAxisAngle(g, roll * DEG);
  }
  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const v = j / rows;
      const flat = center
        .clone()
        .addScaledVector(right, (u - 0.5) * 2 * hw)
        .addScaledVector(up, (v - 0.5) * 2 * hh);
      const hit = skin.ray(flat.clone().addScaledVector(g, 0.25), g.clone().negate()) ?? skin.nearest(flat);
      pos.push(...hit.at.clone().addScaledVector(hit.n, 0.0014).toArray());
      uv.push(u, v);
    }
  const index: number[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      index.push(a, a + 1, a + cols + 2, a, a + cols + 2, a + cols + 1);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export default function build() {
  const b = createBuilder({ name: "littleLich" });
  const random = rng(11);

  // Wrap a decal sheet into a textured part.
  const wrap = (
    skin: Surface,
    tex: Texture,
    center: Vector3,
    gaze: Vector3,
    hw: number,
    hh: number,
    bone: Joint,
    o: { cols?: number; rows?: number; roll?: number; group?: string } = {},
  ) =>
    b.part(decal(skin, center, gaze, hw, hh, o.cols, o.rows, o.roll), "#ffffff", {
      bone,
      at: [0, 0, 0],
      texture: tex,
      group: o.group,
    });

  const HY = 0.675; // head centre height

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.2, 0], aim: [0, 0.25, 0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.25, 0],
      [0, 0.31, 0],
      [0, 0.37, 0],
      [0, 0.43, 0],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "body",
    },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.43, 0], aim: [0, 0.52, 0], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 0.52, 0], aim: [0, HY, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HY - 0.095, -0.03],
    aim: [0, HY - 0.12, 0.1],
    role: "jaw",
    group: "head",
  });

  // Crown: tilted plane whose low side dips over the left eye (front left).
  const tilt = 21 * DEG;
  const dLow = P(Math.sin(30 * DEG), 0, Math.cos(30 * DEG));
  const nCrown = P(0, Math.cos(tilt), 0).addScaledVector(dLow, Math.sin(tilt)).normalize();
  const uCrown = dLow
    .clone()
    .multiplyScalar(Math.cos(tilt))
    .addScaledVector(P(0, 1, 0), -Math.sin(tilt));
  const wCrown = new Vector3().crossVectors(nCrown, uCrown).normalize();
  const CC = P(0, HY + 0.08, 0).addScaledVector(dLow, 0.011);
  const crown = b.joint("crown", { parent: head, at: CC, dir: nCrown, group: "crown" });
  const ringPoint = (deg: number, r: number, along = 0) =>
    CC.clone()
      .addScaledVector(uCrown, r * Math.cos(deg * DEG))
      .addScaledVector(wCrown, r * Math.sin(deg * DEG))
      .addScaledVector(nCrown, along);
  const outward = (deg: number) =>
    uCrown
      .clone()
      .multiplyScalar(Math.cos(deg * DEG))
      .addScaledVector(wCrown, Math.sin(deg * DEG));

  const sides = [
    [1, "L"],
    [-1, "R"],
  ] as const;

  // Arms: shoulder, elbow, wrist; A-pose about 27 degrees below horizontal, palms down, thumbs forward.
  const arms = sides.map(([s, side]) => {
    const S = P(s * 0.115, 0.428, 0);
    const d1 = P(s * 0.94, -0.3, 0.1).normalize();
    const E = S.clone().addScaledVector(d1, 0.105);
    const f = P(s * 0.95, -0.24, 0.2).normalize();
    const W = E.clone().addScaledVector(f, 0.09);
    const H = W.clone().addScaledVector(f, 0.055);
    const palm = W.clone().addScaledVector(f, 0.05);
    const down = P(0, -1, 0);
    const pn = down.clone().addScaledVector(f, -down.dot(f)).normalize();
    const T = new Vector3().crossVectors(pn, f).normalize();
    if (T.z < 0) T.negate();
    const chain = b.chain(`arm${side}`, polyline([S, E, W, H]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    return { s, side, S, E, W, H, f, palm, pn, T, chain, wrist: chain.joints[2] };
  });

  // Legs: hidden under the robe; the bone feet peek out of the front hem.
  const legs = sides.map(([s, side]) => {
    const chain = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.07, 0.21, 0],
        [s * 0.075, 0.12, 0.06],
        [s * 0.075, 0.05, 0.13],
        [s * 0.075, 0.03, 0.22],
        [s * 0.075, 0.03, 0.3],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
        role: "leg",
        contact: [s * 0.075, 0, 0.26],
        group: `leg${side}`,
      },
    );
    return { s, side, chain };
  });
  for (const { s, chain, side } of legs) {
    b.sweep(chain, [0.036, 0.03], { to: chain.ts[2], color: BONE, sides: 6, group: `leg${side}` });
    const at = (z: number, y = 0.03) => P(s * 0.075, y, z);
    b.part(new SphereGeometry(1, 8, 6), BONE, {
      bone: chain.joints[2],
      at: at(0.14),
      scale: [0.034, 0.03, 0.04],
      group: `leg${side}`,
    });
    b.part(new SphereGeometry(1, 8, 6), BONE, {
      bone: chain.joints[3],
      at: at(0.26),
      scale: [0.038, 0.03, 0.066],
      group: `leg${side}`,
    });
    for (const dx of [-0.021, 0, 0.021])
      b.part(new SphereGeometry(0.0135, 6, 4), BONE_DK, {
        bone: chain.joints[3],
        at: at(0.315, 0.022).add(P(dx, 0, -Math.abs(dx) * 0.8)),
        group: `leg${side}`,
      });
  }

  // ------------------------------------------------------------------------------------------------ robe
  const ROBE_Y = [0, 0.02, 0.06, 0.13, 0.21, 0.29, 0.35, 0.4, 0.44, 0.475, 0.5];
  const ROBE_R = [0.305, 0.3, 0.275, 0.23, 0.185, 0.158, 0.15, 0.15, 0.135, 0.09, 0.05];
  const robeR = (y: number) => interpolate(ROBE_Y, ROBE_R, y);
  const robe = b.sweep(
    [
      [0, 0, 0],
      [0, 0.5, 0],
    ],
    (t) => robeR(t * 0.5),
    {
      bone: [hips, spine],
      color: (t) => (t * 0.5 < 0.028 ? PURPLE_DK : t * 0.5 < 0.05 ? MINT : PURPLE),
      sides: 10,
      caps: { start: "flat", end: "round" },
      group: "robe",
    },
  );
  const robeSkin = b.surface(robe);
  const robeHit = (azDeg: number, y: number) => {
    const a = azDeg * DEG;
    const hit = robeSkin.ray([Math.sin(a) * 0.8, y, Math.cos(a) * 0.8], [-Math.sin(a), 0, -Math.cos(a)]);
    if (!hit) throw new Error(`robe ray missed at ${azDeg}, ${y}`);
    return hit;
  };

  // Folds: shallow tapered ridges from the waist to the hem.
  [-150, -112, -74, -37, 0, 37, 74, 112, 150, 180].forEach((az, i) => {
    const pts = [0.28, 0.2, 0.13, 0.07, 0.03].map((y) => {
      const hit = robeHit(az + (i % 2 ? 2 : -2) * (0.28 - y) * 10, y);
      return hit.at.clone().addScaledVector(hit.n, -0.003);
    });
    b.sweep(catmull(pts), [0.004, 0.012], {
      bone: hips,
      color: i % 2 ? PURPLE_LT : PURPLE_DK,
      sides: 5,
      caps: { start: "point", end: "round" },
      group: "robe",
    });
  });

  // Pooling hem: flat torn flaps lying on the floor round the skirt.
  const FLAPS = 15;
  for (let i = 0; i < FLAPS; i++) {
    const a = ((i + 0.5 * (i % 2)) / FLAPS) * Math.PI * 2 + 0.2;
    const out = P(Math.sin(a), 0, Math.cos(a));
    const tan = P(Math.cos(a), 0, -Math.sin(a));
    const k = 0.9 + random() * 0.35;
    const thick = i % 2 ? 0.02 : 0.013;
    const flap: OutlinePoint[] = [
      [-0.03, -0.075],
      [0.07 * k, -0.08],
      [0.11 * k, -0.035],
      [0.095 * k, -0.012],
      [0.17 * k, 0.0, "sharp"],
      [0.1 * k, 0.018],
      [0.115 * k, 0.045],
      [0.075 * k, 0.078],
      [-0.03, 0.075],
    ];
    b.extrude(flap, {
      at: out
        .clone()
        .multiplyScalar(0.25)
        .setY(thick / 2),
      x: out,
      y: tan,
      thickness: thick,
      bevel: 0.003,
      color: i % 3 === 0 ? PURPLE_LT : i % 2 ? PURPLE : PURPLE_DK,
      bone: hips,
      group: "robe",
    });
  }

  // Capelet: a mint shoulder cape over the robe's shoulders.
  const capelet = b.lathe(
    [
      [0.05, 0.06],
      [0.115, 0.04],
      [0.17, -0.005],
      [0.19, -0.05],
      [0.175, -0.064],
      [0.15, -0.046],
      [0.1, -0.02],
      [0.05, -0.005],
    ],
    { at: [0, 0.43, 0], segments: 10, bone: chest, color: MINT, group: "robe" },
  );
  // Scalloped capelet rim: a ring of small mint drops.
  b.ring(frame([0, 0.375, 0], [0, 1, 0]), { count: 10, radius: 0.181 }, (item) =>
    b.part(new SphereGeometry(0.018, 6, 4), MINT_DK, { bone: chest, at: item.at, scale: [1, 0.8, 1], group: "robe" }),
  );

  // Belt with a gold buckle.
  const waist = 0.255;
  const belt = catmull(
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return P(Math.sin(a) * (robeR(waist) + 0.006), waist, Math.cos(a) * (robeR(waist) + 0.006));
    }),
    { closed: true },
  );
  b.sweep(belt, 0.013, { bone: spine.joints[0], color: MINT_DK, sides: 6, group: "robe" });
  const buckle = robeHit(0, waist);
  b.part(new BoxGeometry(0.036, 0.036, 0.012), GOLD, {
    bone: spine.joints[0],
    at: buckle.at,
    rotation: [0, 0, 45],
    group: "robe",
  });
  b.part(new IcosahedronGeometry(0.011, 0), GLOW, {
    bone: spine.joints[0],
    at: buckle.at.clone().add(P(0, 0, 0.008)),
    group: "robe",
  });

  // Robe decals: patches, hem runes and the back sigil.
  const patchAt = (az: number, y: number, tex: typeof heartPatch, size: number, roll: number) => {
    const h = robeHit(az, y);
    wrap(robeSkin, tex, h.at, h.n, size, size, hips, { cols: 6, rows: 6, roll, group: "robe" });
  };
  patchAt(24, 0.16, heartPatch, 0.036, 8);
  patchAt(-32, 0.1, starPatch, 0.03, -12);
  [-118, -74, 74, 118, 152, -152].forEach((az, i) => {
    const h = robeHit(az, 0.115);
    wrap(robeSkin, RUNES[i % RUNES.length], h.at, h.n, 0.02, 0.025, hips, {
      cols: 4,
      rows: 5,
      group: "robe",
    });
  });
  {
    const h = robeHit(180, 0.28);
    wrap(robeSkin, SIGIL, h.at, h.n, 0.06, 0.06, hips, { cols: 8, rows: 8, group: "robe" });
  }

  // Torn strips hanging from the belt, lying on the skirt.
  [46, -58, 98, -98, 138, -138].forEach((az, i) => {
    const top = robeHit(az, 0.24);
    const low = robeHit(az, 0.15);
    const upDir = top.at.clone().sub(low.at).normalize();
    const across = new Vector3().crossVectors(upDir, top.n).normalize();
    const strip: OutlinePoint[] = [
      [-0.026, 0],
      [0.026, 0],
      [0.027, -0.058],
      [0.013, -0.05],
      [0.009, -0.098, "sharp"],
      [-0.004, -0.062],
      [-0.013, -0.088, "sharp"],
      [-0.027, -0.05],
    ];
    b.extrude(strip, {
      at: top.at.clone().addScaledVector(top.n, 0.004 + 0.001 * (i % 2)),
      x: across,
      y: upDir,
      thickness: 0.006,
      bevel: 0.0015,
      detail: 0.34,
      color: i % 2 ? PLUM : PURPLE_LT,
      bone: hips,
      group: "robe",
    });
  });

  // ------------------------------------------------------------------------------------------------ sleeves and hands
  const SLEEVE_T = [0, 0.47, 0.87, 1];
  const SLEEVE_R = [0.056, 0.066, 0.082, 0.094];
  let leftIndex: Vector3[] = []; // the left index finger's points: the lantern hoop hangs on it
  for (const a of arms) {
    const end = a.W.clone().addScaledVector(a.f, 0.03);
    b.sweep(polyline([a.S, a.E, a.W, end]), (t) => interpolate(SLEEVE_T, SLEEVE_R, t), {
      bone: a.chain,
      color: PURPLE,
      bands: [
        [0.86, PURPLE],
        [1, MINT],
      ],
      sides: 10,
      caps: { start: "round", end: "none" },
      group: `arm${a.side}`,
    });
    // The dark inside of the sleeve, the rolled cuff and torn cuff points.
    b.part(new CylinderGeometry(0.086, 0.086, 0.005, 10), PLUM, {
      bone: a.wrist,
      at: end.clone().addScaledVector(a.f, -0.02),
      dir: a.f,
      group: `arm${a.side}`,
    });
    b.part(new TorusGeometry(0.094, 0.0085, 5, 12), MINT_DK, {
      bone: a.wrist,
      at: end,
      dir: a.f,
      axis: "z",
      group: `arm${a.side}`,
    });
    b.ring(frame(end, a.f), { count: 8, radius: 0.094 }, (item) =>
      b.spike(
        item,
        a.f
          .clone()
          .addScaledVector(item.axis, 0.3)
          .addScaledVector(P(0, -1, 0), 0.3)
          .normalize(),
        0.026,
        0.011,
        {
          bone: a.wrist,
          color: item.i % 2 ? PURPLE_DK : PURPLE_LT,
          sides: 3,
          group: `arm${a.side}`,
        },
      ),
    );

    // Palm and five three-joint fingers, relaxed and slightly curled.
    b.part(new SphereGeometry(0.03, 8, 6), BONE, { bone: a.wrist, at: a.palm, group: `arm${a.side}` });
    const bend = (base: Vector3, splayDeg: number, lens: number[], curls: number[]) => {
      const pts = [base.clone()];
      let sum = 0;
      lens.forEach((len, k) => {
        sum += curls[k] * DEG;
        const d0 = a.f.clone().applyAxisAngle(a.pn, splayDeg * DEG);
        const d = d0.multiplyScalar(Math.cos(sum)).addScaledVector(a.pn, Math.sin(sum));
        pts.push(pts[k].clone().addScaledVector(d, len));
      });
      return pts;
    };
    const across = (x: number) => a.palm.clone().addScaledVector(a.f, 0.02).addScaledVector(a.T, x);
    const specs = [
      ["index", across(0.021), 8, [0.013, 0.011, 0.009], [16, 30, 40]],
      ["middle", across(0.007), 2, [0.014, 0.012, 0.01], [12, 28, 38]],
      ["ring", across(-0.007), -4, [0.013, 0.011, 0.009], [12, 26, 36]],
      ["pinky", across(-0.021), -10, [0.01, 0.009, 0.008], [10, 24, 34]],
      [
        "thumb",
        a.palm.clone().addScaledVector(a.T, 0.024).addScaledVector(a.f, -0.004),
        40,
        [0.014, 0.013, 0.011],
        [6, 18, 30],
      ],
    ] as const;
    for (const [name, base, splay, lens, curls] of specs) {
      const pts = bend(base, splay, [...lens], [...curls]);
      if (name === "index" && a.s === 1) leftIndex = pts;
      const chain = b.chain(`${name}${a.side}`, polyline(pts), {
        parent: a.wrist,
        role: "digit",
        group: `arm${a.side}`,
      });
      b.sweep(chain, [0.0088, 0.0068], {
        color: BONE,
        sides: 5,
        caps: { start: "round", end: "round" },
        group: `arm${a.side}`,
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ lantern
  {
    const L = arms[0];
    const idx = leftIndex;
    const on = idx[1].clone().lerp(idx[2], 0.5);
    const fd = idx[2].clone().sub(idx[1]).normalize();
    const RING = 0.017;
    const hoopC = on.clone().add(P(0, -(RING - 0.0085 + 0.001), 0));
    const lantern = b.joint("lantern", { parent: L.wrist, at: hoopC, dir: [0, -1, 0], group: "lantern" });
    b.part(new TorusGeometry(RING, 0.0028, 4, 9), GOLD, {
      bone: lantern,
      at: hoopC,
      dir: fd,
      axis: "z",
      group: "lantern",
    });
    const HB = hoopC.clone().add(P(0, -RING, 0));
    const cx = HB.x;
    const cz = HB.z;
    const K = 1.25; // the lantern is drawn at 1 and scaled up here: a big lantern for a small lich
    const y0 = HB.y - 0.026 * K; // apex of the cap
    const CAP = 0.032 * K;
    const BODY = 0.105 * K;
    const topY = y0 - CAP;
    const botY = topY - BODY;
    b.rod(HB, [cx, y0 + 0.012, cz], 0.0028, { bone: lantern, color: GOLD, sides: 4, group: "lantern" });
    b.part(new TorusGeometry(0.008, 0.0024, 4, 8), GOLD, {
      bone: lantern,
      at: [cx, y0 + 0.008, cz],
      dir: fd,
      axis: "z",
      group: "lantern",
    });
    const at = (x: number, y: number, z: number) => new Vector3(cx + x * K, y, cz + z * K);
    b.lathe(
      [
        [0, 0],
        [0.058 * K, 0],
        [0.056 * K, 0.008 * K],
        [0.03 * K, 0.022 * K],
        [0.011 * K, 0.031 * K],
        [0.008 * K, CAP],
        [0, CAP],
      ],
      { at: [cx, topY, cz], segments: 6, bone: lantern, color: IRON, group: "lantern" },
    );
    b.lathe(
      [
        [0, 0],
        [0.058 * K, 0],
        [0.058 * K, 0.01 * K],
        [0.05 * K, 0.014 * K],
        [0, 0.014 * K],
      ],
      { at: [cx, botY - 0.014 * K, cz], segments: 6, bone: lantern, color: IRON, group: "lantern" },
    );
    b.lathe(
      [
        [0, 0],
        [0.036 * K, 0],
        [0.03 * K, 0.008 * K],
        [0, 0.008 * K],
      ],
      { at: [cx, botY - 0.022 * K, cz], segments: 6, bone: lantern, color: GOLD_DK, group: "lantern" },
    );
    for (let k = 0; k < 6; k++) {
      const a = (30 + k * 60) * DEG;
      const rim = (y: number) => new Vector3(cx + Math.sin(a) * 0.052 * K, y, cz + Math.cos(a) * 0.052 * K);
      b.rod(rim(topY + 0.004), rim(botY), 0.0036, { bone: lantern, color: GOLD, sides: 4, group: "lantern" });
    }
    // Glints on the side panels.
    for (const az of [90, -90, 150]) {
      const a = az * DEG;
      b.part(new PlaneGeometry(0.03 * K, 0.06 * K), "#ffffff", {
        bone: lantern,
        at: at(Math.sin(a) * 0.0505, topY - 0.052 * K, Math.cos(a) * 0.0505),
        dir: [Math.sin(a), 0, Math.cos(a)],
        axis: "z",
        texture: GLINT,
        group: "lantern",
      });
    }
    // Soul flame at the bottom of the lantern: mint tongues round the ghost.
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      b.lathe(
        [
          [0, 0],
          [0.011 * K, 0.006 * K],
          [0.011 * K, 0.016 * K],
          [0.005 * K, 0.03 * K],
          [0, 0.038 * K],
        ],
        {
          at: at(Math.sin(a) * 0.026, botY, Math.cos(a) * 0.026).setY(botY),
          axis: [Math.sin(a) * 0.35, 1, Math.cos(a) * 0.35],
          segments: 6,
          bone: lantern,
          color: k % 2 ? GLOW : MINT,
          group: "lantern",
        },
      );
    }
    // The ghost: a chubby teardrop with a curl of tail, tiny arms and a face.
    const gy = botY + 0.008 * K;
    const ghost = b.lathe(
      [
        [0, 0],
        [0.014 * K, 0.006 * K],
        [0.024 * K, 0.02 * K],
        [0.03 * K, 0.036 * K],
        [0.032 * K, 0.05 * K],
        [0.026 * K, 0.066 * K],
        [0.014 * K, 0.077 * K],
        [0, 0.08 * K],
      ],
      { at: [cx, gy, cz], segments: 8, bone: lantern, color: GHOST, group: "lantern" },
    );
    b.sweep(
      catmull([
        [cx, gy + 0.004, cz],
        [cx - 0.012 * K, gy - 0.001, cz - 0.02 * K],
        [cx - 0.03 * K, gy + 0.012 * K, cz - 0.03 * K],
      ]),
      [0.012 * K, 0.002],
      { bone: lantern, color: GHOST_SH, sides: 6, caps: { start: "flat", end: "point" }, group: "lantern" },
    );
    for (const s of [1, -1])
      b.capsule(at(s * 0.028, gy + 0.035 * K, 0.006), at(s * 0.05, gy + 0.05 * K, 0.014), 0.0065 * K, {
        bone: lantern,
        color: GHOST_SH,
        sides: 6,
        group: "lantern",
      });
    wrap(b.surface(ghost), GHOST_FACE, P(cx, gy + 0.05 * K, cz + 0.03 * K), P(0, 0, 1), 0.021 * K, 0.015 * K, lantern, {
      cols: 6,
      rows: 4,
      group: "lantern",
    });
  }

  // ------------------------------------------------------------------------------------------------ head
  const cranium = b.part(new SphereGeometry(1, 14, 10), BONE, {
    bone: head,
    at: [0, HY, 0],
    scale: [0.195, 0.175, 0.185],
    group: "head",
  });
  const midface = b.part(new SphereGeometry(1, 12, 8), BONE, {
    bone: head,
    at: [0, HY - 0.08, 0.05],
    scale: [0.14, 0.075, 0.12],
    group: "head",
  });
  const cheeks = sides.map(([s]) =>
    b.part(new SphereGeometry(0.06, 8, 6), BONE, { bone: head, at: [s * 0.105, HY - 0.075, 0.09], group: "head" }),
  );
  const skull = b.surface([cranium, midface, ...cheeks]);
  wrap(skull, FACE, P(0, HY - 0.04, 0.17), P(0, 0, 1), 0.15, 0.1, head, { cols: 20, rows: 14, group: "head" });

  // Ear holes and a bandage on the back of the head.
  const cranSkin = b.surface(cranium);
  for (const az of [92, -92]) {
    const hit = cranSkin.around([0, HY, 0]).at(az, -6);
    if (hit) b.stick(new SphereGeometry(0.02, 7, 5), DARK, hit, { embed: 0.7, bone: head, group: "head" });
  }
  {
    const h = cranSkin.around([0, HY, 0]).at(-160, 22);
    if (h) wrap(cranSkin, bandage, h.at, h.n, 0.035, 0.035, head, { cols: 6, rows: 6, roll: 20, group: "head" });
  }

  // Grin: an upper tooth row on the head, a lower one on the jaw, a dark mouth line between them.
  const toothRow = (
    bone: typeof head,
    y: number,
    cz: number,
    rx: number,
    rz: number,
    count: number,
    half: number,
    h: number,
    grin: number,
  ) => {
    for (let i = 0; i < count; i++) {
      const th = (-half + (2 * half * i) / (count - 1)) * DEG;
      const mid = Math.abs(th) < 12 * DEG;
      const x = rx * Math.sin(th);
      const z = cz + rz * Math.cos(th);
      const yy = y + grin * (th / (half * DEG)) ** 2;
      const height = h * (mid && bone === head ? 1.18 : 1);
      const tan = P(Math.cos(th), 0, -Math.sin(th));
      b.extrude(
        [
          [-0.0105, -height / 2],
          [0.0105, -height / 2],
          [0.0105, height / 2],
          [-0.0105, height / 2],
        ],
        {
          at: [x, yy - (height - h) / 2, z],
          x: tan,
          y: [0, 1, 0],
          thickness: 0.013,
          bevel: 0.0025,
          smoothing: 1,
          detail: 0.34,
          color: TOOTH,
          bone,
          group: "head",
        },
      );
    }
  };
  toothRow(head, HY - 0.108, 0.045, 0.108, 0.115, 8, 56, 0.024, 0.008);
  toothRow(jaw, HY - 0.137, 0.04, 0.098, 0.105, 7, 50, 0.022, 0.007);
  b.sweep(
    catmull(
      Array.from({ length: 9 }, (_, i) => {
        const th = (-72 + i * 18) * DEG;
        return P(0.1 * Math.sin(th), HY - 0.123 + 0.008 * (th / (72 * DEG)) ** 2, 0.045 + 0.098 * Math.cos(th));
      }),
    ),
    0.006,
    { bone: head, color: DARK, sides: 4, group: "head" },
  );

  // Lower jaw: chubby chin with a tongue.
  b.part(new SphereGeometry(1, 12, 8), BONE, {
    bone: jaw,
    at: [0, HY - 0.155, 0.04],
    scale: [0.105, 0.052, 0.1],
    group: "head",
  });
  b.part(new SphereGeometry(1, 8, 6), PINK, {
    bone: jaw,
    at: [0, HY - 0.118, 0.05],
    scale: [0.05, 0.014, 0.05],
    group: "head",
  });

  // Crown: a big tilted bone band with beads, club spikes and gems.
  b.lathe(
    [
      [0.19, -0.026],
      [0.206, -0.026],
      [0.206, 0.026],
      [0.19, 0.026],
    ],
    { at: CC, axis: nCrown, segments: 16, bone: crown, color: BONE_DK, group: "crown" },
  );
  for (let k = 0; k < 16; k++)
    b.part(new SphereGeometry(0.0105, 6, 4), BONE, {
      bone: crown,
      at: ringPoint((k / 16) * 360 + 11, 0.206, -0.026),
      group: "crown",
    });
  const SPIKE = 7;
  for (let k = 0; k < SPIKE; k++) {
    const deg = (k / SPIKE) * 360 + 20;
    const base = ringPoint(deg, 0.198, 0.02);
    const dir = nCrown.clone().addScaledVector(outward(deg), 0.2).normalize();
    const len = k % 2 ? 0.036 : 0.05;
    const tip = base.clone().addScaledVector(dir, len);
    b.rod(base, tip, [0.0135, 0.0085], { bone: crown, color: BONE, sides: 6, group: "crown" });
    b.part(new SphereGeometry(0.0125, 7, 5), BONE, { bone: crown, at: tip, group: "crown" });
  }
  // Gems on the band: the middle one faces front.
  let front = 0;
  for (let d = 0; d < 360; d += 2) if (ringPoint(d, 0.206).z > ringPoint(front, 0.206).z) front = d;
  [
    [front, GLOW, 0.017],
    [front + 52, PINK, 0.013],
    [front - 52, GOLD, 0.013],
    [front + 104, GOLD, 0.011],
    [front - 104, PINK, 0.011],
  ].forEach(([deg, color, size]) => {
    const dg = deg as number;
    b.part(new IcosahedronGeometry(size as number, 0), color as string, {
      bone: crown,
      at: ringPoint(dg, 0.209),
      dir: outward(dg),
      group: "crown",
    });
  });

  // ------------------------------------------------------------------------------------------------ spellbook
  {
    const anchor = P(0, 0.335, 0.17);
    const book = b.joint("book", { parent: chest, at: anchor, dir: [0, -1, 0], group: "book" });
    const loop = catmull(
      [
        [0, 0.485, -0.1],
        [-0.125, 0.445, -0.03],
        [-0.075, 0.395, 0.135],
        anchor.toArray() as V3,
        [0.075, 0.395, 0.135],
        [0.125, 0.445, -0.03],
      ],
      { closed: true },
    );
    const chain = b.surface([robe, capelet]).drape(loop, { lift: 0.007 });
    b.sweep(chain, 0.0042, { bone: chest, color: GOLD, sides: 5, group: "book" });
    b.along(chain, 9, (at) => b.part(new SphereGeometry(0.0072, 5, 4), GOLD_DK, { bone: chest, at, group: "book" }));
    const cz2 = 0.176;
    const cy = 0.29;
    b.part(new TorusGeometry(0.0085, 0.0026, 4, 8), GOLD, {
      bone: book,
      at: [0, anchor.y - 0.005, cz2 - 0.004],
      dir: [1, 0, 0],
      axis: "z",
      group: "book",
    });
    const rot: V3 = [-9, 0, 0];
    const at = (x: number, y: number, z: number) => P(x, cy + y, cz2 + z);
    b.part(new BoxGeometry(0.08, 0.098, 0.006), PLUM, { bone: book, at: at(0, 0, 0), rotation: rot, group: "book" });
    b.part(new BoxGeometry(0.072, 0.09, 0.016), WAX_CREAM, {
      bone: book,
      at: at(0.002, 0, 0.011),
      rotation: rot,
      group: "book",
    });
    b.part(new BoxGeometry(0.08, 0.098, 0.006), PURPLE_DK, {
      bone: book,
      at: at(0, 0, 0.022),
      rotation: rot,
      group: "book",
    });
    b.part(new BoxGeometry(0.01, 0.1, 0.03), PLUM, {
      bone: book,
      at: at(-0.04, 0, 0.011),
      rotation: rot,
      group: "book",
    });
    b.part(new BoxGeometry(0.014, 0.022, 0.032), GOLD, {
      bone: book,
      at: at(0.038, 0.0, 0.011),
      rotation: rot,
      group: "book",
    });
    b.part(new PlaneGeometry(0.06, 0.08), "#ffffff", {
      bone: book,
      at: at(0.002, 0, 0.0255),
      dir: [0, Math.sin(9 * DEG), Math.cos(9 * DEG)],
      axis: "z",
      texture: BOOK_COVER,
      group: "book",
    });
    b.rod(at(0.02, -0.048, 0.004), at(0.022, -0.08, 0.006), [0.005, 0.005], {
      bone: book,
      color: MINT,
      sides: 4,
      group: "book",
    });
    b.spike(at(0.022, -0.08, 0.006), [0, -1, 0.05], 0.014, 0.008, { bone: book, color: MINT, sides: 3, group: "book" });
  }

  // ------------------------------------------------------------------------------------------------ bat
  {
    const B = P(-0.195, 0.447, 0.015);
    const bat = b.joint("bat", { parent: chest, at: B.clone().add(P(0, 0.04, 0)), dir: [0, 1, 0], group: "bat" });
    const batHead = b.joint("batHead", {
      parent: bat,
      at: B.clone().add(P(0, 0.065, 0.006)),
      dir: [0, 1, 0.1],
      group: "bat",
    });
    b.part(new SphereGeometry(1, 10, 8), BAT, {
      bone: bat,
      at: B.clone().add(P(0, 0.042, 0)),
      scale: [0.03, 0.038, 0.028],
      group: "bat",
    });
    b.part(new SphereGeometry(1, 8, 6), BAT_LT, {
      bone: bat,
      at: B.clone().add(P(0, 0.036, 0.011)),
      scale: [0.021, 0.028, 0.019],
      group: "bat",
    });
    for (const s of [1, -1]) {
      b.part(new SphereGeometry(0.0085, 6, 4), BAT_DK, {
        bone: bat,
        at: B.clone().add(P(s * 0.012, 0.006, 0.008)),
        scale: [1, 0.7, 1.3],
        group: "bat",
      });
    }
    const bh = b.part(new SphereGeometry(0.03, 10, 8), BAT, {
      bone: batHead,
      at: B.clone().add(P(0, 0.085, 0.008)),
      group: "bat",
    });
    for (const s of [1, -1]) {
      const ear = B.clone().add(P(s * 0.017, 0.105, 0.002));
      b.spike(ear, [s * 0.35, 1, -0.1], 0.036, 0.013, { bone: batHead, color: BAT, sides: 4, group: "bat" });
      b.spike(ear.clone().add(P(0, 0.002, 0.005)), [s * 0.35, 1, -0.1], 0.028, 0.008, {
        bone: batHead,
        color: PINK,
        sides: 4,
        group: "bat",
      });
    }
    wrap(b.surface(bh), BAT_FACE, B.clone().add(P(0, 0.085, 0.03)), P(0, 0, 1), 0.021, 0.016, batHead, {
      cols: 6,
      rows: 5,
      group: "bat",
    });
    // Wings: an arm and wrist joint, dark finger rods and a scalloped membrane, spread part way.
    for (const [s, tag] of [
      [1, "In"],
      [-1, "Out"],
    ] as const) {
      const span = s === 1 ? 0.45 : 1; // the wing beside the head stays half folded
      const at = (x: number, y: number, z: number) => B.clone().add(P(s * x * span, y, z));
      const sh = at(0.026, 0.062, -0.008);
      const wr = at(0.078, 0.11, -0.03);
      const wing = b.chain(`batWing${tag}`, polyline([sh, wr, at(0.12, 0.095, -0.045)]), {
        parent: bat,
        names: [`batWingArm${tag}`, `batWingHand${tag}`],
        role: "wing",
        group: "bat",
      });
      const tips = [at(0.132, 0.078, -0.052), at(0.118, 0.04, -0.05), at(0.088, 0.02, -0.04)];
      const valleys = [at(0.118, 0.066, -0.048), at(0.1, 0.034, -0.046)];
      b.slab(
        [sh, wr, tips[0], valleys[0], tips[1], valleys[1], tips[2], at(0.05, 0.026, -0.024), at(0.028, 0.03, -0.014)],
        { color: BAT_WING, thickness: 0.004, bone: wing.joints[1], group: "bat" },
      );
      b.rod(sh, wr, 0.0045, { bone: wing.joints[0], color: BAT_DK, sides: 4, group: "bat" });
      for (const tip of tips) b.rod(wr, tip, 0.003, { bone: wing.joints[1], color: BAT_DK, sides: 4, group: "bat" });
    }
  }

  // ------------------------------------------------------------------------------------------------ candles
  const candles: Array<[V3, string]> = [
    [[0.34, 0.6, 0.11], MINT],
    [[-0.33, 0.7, 0.13], PINK_LT],
    [[0.25, 0.78, -0.13], WAX_CREAM],
    [[-0.26, 0.55, -0.22], GOLD],
  ];
  const sparkle = [SPARKLE_GOLD, SPARKLE_MINT];
  candles.forEach(([pos, wax], i) => {
    const base = P(...pos);
    const cj = b.joint(`candle${i + 1}`, { parent: chest, at: base, dir: [0, 1, 0], group: `candle${i + 1}` });
    const opt = { bone: cj, group: `candle${i + 1}` };
    b.lathe(
      [
        [0, 0],
        [0.03, 0.003],
        [0.032, 0.009],
        [0.022, 0.013],
        [0, 0.013],
      ],
      { at: base, segments: 8, color: GOLD_DK, ...opt },
    );
    b.lathe(
      [
        [0, 0],
        [0.018, 0],
        [0.018, 0.054],
        [0.014, 0.058],
        [0, 0.058],
      ],
      { at: base.clone().add(P(0, 0.013, 0)), segments: 8, color: wax, ...opt },
    );
    // wax drips
    for (const [a, len] of [
      [40, 0.024],
      [200, 0.016],
    ] as const) {
      const p = base.clone().add(P(Math.sin(a * DEG) * 0.017, 0.068, Math.cos(a * DEG) * 0.017));
      b.capsule(p, p.clone().add(P(0, -len, 0)), 0.0055, { color: wax, sides: 5, ...opt });
    }
    const tip = base.clone().add(P(0, 0.071, 0));
    b.rod(tip, tip.clone().add(P(0, 0.008, 0)), 0.0016, { color: DARK, sides: 4, ...opt });
    const flame = (r: number, h: number, color: string, y: number) =>
      b.lathe(
        [
          [0, 0],
          [r, h * 0.2],
          [r * 0.95, h * 0.45],
          [r * 0.45, h * 0.8],
          [0, h],
        ],
        { at: tip.clone().add(P(0, y, 0)), segments: 6, color, ...opt },
      );
    flame(0.0125, 0.044, FLAME, 0.006);
    flame(0.0068, 0.026, FLAME_LT, 0.008);
    const spots = [P(0.05, 0.03, 0.02), P(-0.045, 0.06, -0.02), P(0.02, -0.04, 0.05)].map((o, k) =>
      frame(
        base
          .clone()
          .add(o)
          .add(P(0, 0.01 * k, 0)),
        [0, 1, 0],
      ),
    );
    b.cards(spots, sparkle, { size: 0.036, cross: true, rng: rng(20 + i), bone: cj });
  });

  return b.root;
}
