// Mochi Cat Baker: a round chibi cat pâtissier, 0.6 m with the hat, standing on two stubby legs. Cute flat low-poly:
// every mesh faceted, flat colours only, and SVG drawings for the face, apron, hat band, doily, cakes and sprites.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import type { Chain } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Mochi Cat Baker",
  description:
    "A round chibi cat pâtissier in a toque and pink apron, a whisk in one paw and a tray of tiny kawaii cakes in the other.",
};

// ── palette (flat colours) ───────────────────────────────────────────────────────────────────────────────────────
const FUR = "#ffc18c";
const FUR_D = "#f29a66";
const CREAM = "#fff2df";
const INNER = "#ffaec4";
const NOSE = "#ff6f94";
const INK = "#4a2c4a";
const WHISKER = "#9a7596";
const MOUTH = "#d9476a";
const TONGUE = "#ff8fa8";
const APRON = "#ff9fc2";
const APRON_D = "#ff78a6";
const WHITE = "#ffffff";
const HAT_SHADE = "#f6ead6";
const MINT = "#a6e8cf";
const MINT_D = "#78d0ae";
const LILAC = "#cbb4ff";
const LILAC_D = "#a98ef0";
const BUTTER = "#ffe38c";
const GOLD = "#ffd24f";
const CHERRY = "#ff4d6d";
const LEAF = "#7ed98c";
const STEEL = "#dfe9f4";
const COOKIE = "#e5ab6a";

// ── drawings ─────────────────────────────────────────────────────────────────────────────────────────────────────
const S = (body: string, vb: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;

const circlesPath = (pts: Array<[number, number, number]>) =>
  pts.map(([x, y, r]) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join("");

const EYE = svg(
  S(
    `<ellipse cx="30" cy="40" rx="28" ry="38" fill="${INK}"/>
     <ellipse cx="30" cy="56" rx="22" ry="20" fill="#7a4468"/>
     <ellipse cx="30" cy="63" rx="14" ry="10" fill="#b8689a"/>
     <ellipse cx="20" cy="24" rx="11" ry="12.5" fill="#ffffff"/>
     <circle cx="41" cy="50" r="5.5" fill="#ffffff"/>
     <circle cx="36" cy="61" r="2.6" fill="#ffffff"/>`,
    "0 0 60 80",
  ),
  { size: 192 },
);

const BLUSH = svg(
  S(
    `<ellipse cx="30" cy="16" rx="28" ry="14" fill="#ff8fab"/>
     <path d="M15 8l6 12M28 6l6 12M41 8l6 12" stroke="#ffc6d6" stroke-width="3.6" stroke-linecap="round" fill="none"/>`,
    "0 0 60 32",
  ),
  { size: 240 },
);

const MOUTH_SVG = svg(
  S(
    `<path d="M40 3V15" stroke="${INK}" stroke-width="4.6" stroke-linecap="round" fill="none"/>
     <path d="M40 15Q31 33 17 21M40 15Q49 33 63 21" stroke="${INK}" stroke-width="4.6" stroke-linecap="round" fill="none"/>`,
    "0 0 80 40",
  ),
  { size: 320 },
);

const BROW = svg(
  S(
    `<path d="M30 0V22M14 4L19 21M46 4L41 21" stroke="${FUR_D}" stroke-width="6.5" stroke-linecap="round" fill="none"/>`,
    "0 0 60 26",
  ),
  { size: 240 },
);

const FLOUR = svg(
  S(
    `<path d="M6 18Q8 6 20 8Q28 0 38 8Q50 6 52 18Q54 28 40 28Q28 34 16 28Q4 28 6 18Z" fill="${WHITE}"/>
     <circle cx="60" cy="10" r="3" fill="${WHITE}"/><circle cx="4" cy="30" r="2.4" fill="${WHITE}"/>`,
    "0 0 64 36",
  ),
  { size: 192 },
);

const TOES = svg(
  S(`<path d="M13 2V13M27 2V13" stroke="#e7b48a" stroke-width="3.6" stroke-linecap="round" fill="none"/>`, "0 0 40 16"),
  { size: 200 },
);

// Apron drawing: 100 × 106 units = 0.2 × 0.212 m on the body front, top edge at y = 0.324: world y = 0.324 − 0.002 · svgY.
const SCALLOPS = [10, 24, 38, 52, 66, 80, 94].map((x) => `<circle cx="${x}" cy="97" r="7.5" fill="${WHITE}"/>`).join("");
const DOTS = [
  [26, 82],
  [22, 92],
  [10, 88],
  [74, 80],
  [78, 92],
  [90, 88],
  [34, 93],
  [66, 93],
]
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#ffd0e2"/>`)
  .join("");
const APRON_SVG = svg(
  S(
    `<path d="M22 0H78Q84 18 72 34L50 46L28 34Q16 18 22 0Z" fill="${CREAM}"/>
     <path d="M32 30H68L72 74L94 98H6L28 74Z" fill="${APRON}"/>
     ${SCALLOPS}
     <path d="M27 66H73L75 76H25Z" fill="${APRON_D}"/>
     <path d="M36 34H64L66 64H34Z" fill="#ffb3d0"/>
     <path d="M50 58C38 48 42 38 50 44C58 38 62 48 50 58Z" fill="${WHITE}"/>
     <path d="M37 37H63M24 82L12 94M76 82L88 94" stroke="${WHITE}" stroke-width="1.8" stroke-dasharray="4 3" fill="none"/>
     ${DOTS}
     <circle cx="92" cy="80" r="1.8" fill="${WHITE}"/><circle cx="14" cy="80" r="1.6" fill="${WHITE}"/>`,
    "0 0 100 106",
  ),
  { size: 500 },
);

const POCKET_SVG = svg(
  S(
    `<path d="M10 12H90" stroke="${WHITE}" stroke-width="4" stroke-dasharray="9 7" stroke-linecap="round" fill="none"/>
     <path d="M50 60C31 47 36 29 50 38C64 29 69 47 50 60Z" fill="${WHITE}"/>
     <circle cx="20" cy="38" r="4" fill="#ffd0e2"/><circle cx="80" cy="38" r="4" fill="#ffd0e2"/>`,
    "0 0 100 66",
  ),
  { size: 240 },
);

const HAT_BAND = svg(
  S(
    `<path d="M14 0V45M34 0V45M54 0V45M74 0V45M94 0V45M114 0V45M134 0V45" stroke="${HAT_SHADE}" stroke-width="5" fill="none"/>
     <rect x="0" y="28" width="140" height="11" fill="${APRON}"/>
     <path d="M70 37C61 30 64 23 70 27C76 23 79 30 70 37Z" fill="${WHITE}"/>
     <path d="M44 33L46 29L48 33L44 33ZM92 33L94 29L96 33Z" fill="${WHITE}"/>`,
    "0 0 140 45",
  ),
  { size: 420 },
);

const DOILY = (() => {
  const ring = (n: number, R: number, r: number, off = 0) =>
    Array.from({ length: n }, (_, i): [number, number, number] => {
      const a = off + (i / n) * Math.PI * 2;
      return [50 + R * Math.cos(a), 50 + R * Math.sin(a), r];
    });
  const holes = [...ring(14, 33, 3), ...ring(8, 22, 3.6, 0.2), [50, 50, 4.2] as [number, number, number]];
  const disc = `M${50 - 36} 50a36 36 0 1 0 72 0a36 36 0 1 0 -72 0`;
  const lace = circlesPath(ring(18, 40, 8));
  return svg(S(`<path fill-rule="evenodd" fill="${WHITE}" d="${disc}${circlesPath(holes)}"/><path fill="${WHITE}" d="${lace}"/>`, "0 0 100 100"), {
    size: 320,
  });
})();

const FACE_SVG = svg(
  S(
    `<circle cx="22" cy="30" r="5.5" fill="${INK}"/><circle cx="58" cy="30" r="5.5" fill="${INK}"/>
     <circle cx="20" cy="28" r="1.8" fill="#fff"/><circle cx="56" cy="28" r="1.8" fill="#fff"/>
     <path d="M32 40Q40 50 48 40" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
     <ellipse cx="12" cy="42" rx="6" ry="3.5" fill="#ff8fab"/><ellipse cx="68" cy="42" rx="6" ry="3.5" fill="#ff8fab"/>`,
    "0 0 80 64",
  ),
  { size: 256 },
);

const SPARKLE = svg(
  S(
    `<path d="M32 2Q36 28 62 32Q36 36 32 62Q28 36 2 32Q28 28 32 2Z" fill="${GOLD}"/>
     <path d="M32 18Q34 30 46 32Q34 34 32 46Q30 34 18 32Q30 30 32 18Z" fill="#fff6c8"/>`,
    "0 0 64 64",
  ),
  { size: 128 },
);
const SPARKLE_PINK = svg(
  S(`<path d="M32 4Q35 29 60 32Q35 35 32 60Q29 35 4 32Q29 29 32 4Z" fill="#ff9fc2"/>`, "0 0 64 64"),
  { size: 128 },
);
const STEAM = svg(
  S(
    `<path d="M20 60C8 46 32 38 20 24C12 14 22 6 26 4" stroke="#c6d8ff" stroke-width="9" stroke-linecap="round" fill="none"/>`,
    "0 0 40 64",
  ),
  { size: 160 },
);
const TUFT = svg(S(`<path d="M3 40L5 8L15 24L22 0L29 24L39 8L41 40Z" fill="${FUR}"/>`, "0 0 44 40"), { size: 132 });
const TUFT_CREAM = svg(S(`<path d="M3 40L5 8L15 24L22 0L29 24L39 8L41 40Z" fill="${CREAM}"/>`, "0 0 44 40"), { size: 132 });
const SPRINKLE = svg(
  S(`<rect x="8" y="26" width="48" height="12" rx="6" fill="#ffffff" transform="rotate(-25 32 32)"/>`, "0 0 64 64"),
  { size: 64 },
);

// ── helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────
const ball = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "mochiCatBaker" });
  const rnd = rng(11);

  // ── skeleton ────────────────────────────────────────────────────────────────────────────────────────────────────
  const hips = b.joint("hips", { at: [0, 0.14, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.18, 0],
      [0, 0.235, 0.004],
      [0, 0.29, 0.008],
    ]),
    { parent: hips, names: ["spine1", "spine2", "neck"], role: "spine" },
  );
  const neck = spine.tip!;
  const chest = spine.joints[1];
  const HEAD_C: [number, number, number] = [0, 0.385, 0.008];
  const head = b.joint("head", { parent: neck, at: [0, 0.3, 0.008], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.33, 0.05], aim: [0, 0.33, 0.14], role: "jaw" });

  // ── body: a faceted egg with a chest patch and the apron on its front ─────────────────────────────────────────────
  const body = b.sweep(spine, (t) => [0.118 - 0.03 * t * t, 0.106 - 0.012 * t], {
    sides: 8,
    smooth: false,
    color: FUR,
  });
  const bodySkin = b.surface(body);
  b.decal(bodySkin, APRON_SVG, { at: [0, 0.218, 0.2], dir: [0, 0, -1], size: [0.2, 0.212], segments: [20, 22], lift: 0.003 });

  // a thin waist band all round the body, straps over the shoulders, and a bow at the back
  const waist = bodySkin.loop([0, 0.184, 0], { lift: 0.003 });
  b.sweep(waist, 0.0038, { color: APRON_D, sides: 4, smooth: false });
  for (const s of [1, -1]) {
    // apron neck straps: over each shoulder to the back, then down to the waist bow
    const strap = bodySkin.drape(
      catmull([
        [s * 0.05, 0.25, 0.1],
        [s * 0.095, 0.3, 0.02],
        [s * 0.06, 0.29, -0.09],
        [s * 0.04, 0.21, -0.125],
      ]),
      { lift: 0.0035 },
    );
    b.sweep(strap, 0.0055, { color: APRON_D, sides: 4, smooth: false, bone: spine });
  }
  const back = bodySkin.ray([0, 0.183, -0.4], [0, 0, 1]);
  const bowZ = back ? back.at.z - 0.002 : -0.11;
  for (const s of [1, -1]) {
    const wing: OutlinePoint[] = [
      [0, 0],
      [s * 0.05, 0.028],
      [s * 0.058, -0.004],
      [s * 0.046, -0.03],
    ];
    b.extrude(wing, {
      at: [0, 0.186, bowZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.013,
      smoothing: 1,
      color: APRON_D,
      bone: chest,
    });
    b.extrude(
      [
        [0, 0],
        [s * 0.02, -0.004],
        [s * 0.034, -0.05],
        [s * 0.012, -0.046],
      ],
      { at: [0, 0.184, bowZ - 0.003], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.009, color: APRON, bone: chest },
    );
  }
  b.part(ball(0.013, 6, 4), APRON_D, { bone: chest, at: [0, 0.186, bowZ - 0.002], scale: [1, 1, 0.8], flat: true });

  // the pocket, with a cookie peeking out
  const front = bodySkin.ray([0, 0.145, 0.4], [0, 0, -1]);
  const pz = front ? front.at.z : 0.1;
  b.extrude(
    [
      [-0.026, 0.017],
      [0.026, 0.017],
      [0.027, -0.011],
      [0.01, -0.017],
      [-0.01, -0.017],
      [-0.027, -0.011],
    ],
    { at: [0, 0.148, pz + 0.004], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, detail: 0.34, color: APRON_D, bone: chest },
  );
  b.part(new THREE.PlaneGeometry(0.05, 0.033), "#ffffff", {
    bone: chest,
    at: [0, 0.148, pz + 0.0125],
    dir: [0, 0, 1],
    axis: "z",
    texture: POCKET_SVG,
  });
  b.extrude(
    [
      [0, -0.012],
      [0.014, 0.004],
      [0.008, 0.016],
      [0, 0.009],
      [-0.008, 0.016],
      [-0.014, 0.004],
    ],
    { at: [0.01, 0.164, pz + 0.002], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, smoothing: 1, color: COOKIE, bone: chest },
  );

  // ── tail: curled up in a question mark, ringed in stripes with a cream tip ──────────────────────────────────────
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.105, -0.085],
      [0.01, 0.088, -0.17],
      [0.04, 0.115, -0.24],
      [0.085, 0.19, -0.265],
      [0.12, 0.275, -0.23],
      [0.12, 0.335, -0.17],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );
  b.sweep(tail, (t) => 0.035 - 0.013 * t, {
    sides: 6,
    smooth: false,
    bands: [
      [0.16, FUR],
      [0.27, FUR_D],
      [0.43, FUR],
      [0.54, FUR_D],
      [0.7, FUR],
      [0.8, FUR_D],
      [0.88, FUR],
      [1, CREAM],
    ],
  });

  // ── legs: two stubby legs with cream paw-socks ─────────────────────────────────────────────────────────────────
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.07, 0.092, 0],
        [s * 0.072, 0.058, 0.01],
        [s * 0.072, 0.034, 0.018],
        [s * 0.072, 0.03, 0.055],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`], role: "leg" },
    );
    b.sweep(leg, [0.04, 0.034], { sides: 6, smooth: false, color: FUR, to: 0.72 });
    const foot = b.part(ball(0.05, 8, 5), CREAM, {
      bone: leg.tip!,
      at: [s * 0.072, 0.03, 0.04],
      scale: [0.95, 0.6, 1.25],
      flat: true,
    });
    b.decal(b.surface(foot), TOES, { at: [s * 0.072, 0.03, 0.2], dir: [0, -0.35, -1], size: [0.04, 0.016] });
  }

  // ── head: a wide faceted ball with ears, hat, muzzle and face ──────────────────────────────────────────────────
  const skull = b.part(ball(1, 10, 7), FUR, {
    bone: head,
    at: HEAD_C,
    scale: [0.165, 0.115, 0.14],
    flat: true,
  });
  const skin = b.surface(skull);

  // ears, each with its own joint
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.112, 0.455, 0.0], dir: [s * 0.3, 1, 0], role: "hinge" });
    const outer: OutlinePoint[] = [
      [-0.05, 0],
      [0.05, 0],
      [s * 0.022, 0.095, "sharp"],
    ];
    b.extrude(outer, {
      at: [s * 0.112, 0.45, 0.0],
      x: [1, 0, 0],
      y: [0, 1, 0.22],
      thickness: [0.034, 0.008],
      smoothing: 1,
      color: FUR,
      bone: ear,
    });
    const inner: OutlinePoint[] = [
      [-0.03, 0.01],
      [0.03, 0.01],
      [s * 0.02, 0.07, "sharp"],
    ];
    b.extrude(inner, {
      at: [s * 0.112, 0.45, 0.008],
      x: [1, 0, 0],
      y: [0, 1, 0.22],
      thickness: [0.032, 0.008],
      smoothing: 1,
      color: INNER,
      bone: ear,
    });
  }

  // chef's toque: pleated band, cloud puffs
  const HAT_Y = 0.468;
  const band = b.lathe(
    [
      [0, 0],
      [0.094, 0],
      [0.104, 0.048],
      [0, 0.048],
    ],
    { at: [0, HAT_Y, 0.004], bone: head, segments: 8, color: WHITE },
  );
  b.decal(b.surface(band), HAT_BAND, { at: [0, HAT_Y + 0.024, 0.2], dir: [0, 0, -1], size: [0.15, 0.048], segments: [14, 4] });
  b.lathe(
    [
      [0.1, 0],
      [0.12, 0.018],
      [0.122, 0.038],
      [0.09, 0.052],
      [0, 0.056],
    ],
    { at: [0, HAT_Y + 0.048, 0.004], bone: head, segments: 8, color: WHITE },
  );
  const puffs: Array<[number, number, number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * DEG + 0.3;
    puffs.push([0.088 * Math.cos(a), 0.038, 0.088 * Math.sin(a), 0.046]);
  }
  puffs.push([0, 0.044, 0, 0.056]);
  for (const [x, y, z, r] of puffs)
    b.part(ball(r, 7, 5), WHITE, { bone: head, at: [x, HAT_Y + 0.048 + y, 0.004 + z], scale: [1, 0.9, 1], flat: true });

  // muzzle, nose, forehead stripes and face drawings
  const muzzle = [1, -1].map((s) =>
    b.part(ball(0.042, 7, 5), CREAM, { bone: head, at: [s * 0.03, 0.343, 0.118], scale: [1.1, 0.85, 0.95], flat: true }),
  );
  b.part(ball(0.0125, 5, 3), NOSE, { bone: head, at: [0, 0.362, 0.153], scale: [1.25, 0.85, 0.8], flat: true });
  b.decal(b.surface(muzzle), MOUTH_SVG, { at: [0, 0.336, 0.2], dir: [0, 0, -1], size: [0.07, 0.035], segments: [12, 6] });
  b.decal(skin, BROW, { at: [0, 0.445, 0.2], dir: [0, -0.15, -1], size: [0.05, 0.022], segments: [8, 4] });
  for (const s of [1, -1]) {
    b.decal(skin, EYE, { at: [s * 0.074, 0.39, 0.2], dir: [0, 0, -1], size: [0.052, 0.069], segments: [8, 10] });
    b.decal(skin, BLUSH, { at: [s * 0.105, 0.352, 0.2], dir: [-s * 0.45, 0, -1], size: [0.05, 0.027], segments: [10, 5] });
  }
  b.decal(skin, FLOUR, { at: [-0.115, 0.36, 0.2], dir: [0.45, 0, -1], size: [0.03, 0.017], segments: [6, 4] });

  // cheek fluff: fur and cream tufts sticking out sideways at each cheek, facing front
  for (const [tex, az, el] of [
    [TUFT, 88, -1],
    [TUFT_CREAM, 84, -15],
  ] as const) {
    const hits = [1, -1].map((s) => skin.around(HEAD_C).at(s * az, el)!);
    b.cards(hits, tex, { size: [0.046, 0.05], lean: 12, flow: [0, 0, 1], bone: head, sink: 0.25 });
  }

  // whiskers
  for (const s of [1, -1])
    for (const dy of [0.022, 0, -0.022])
      b.sweep(
        catmull([
          [s * 0.065, 0.345 + dy * 0.2, 0.125],
          [s * 0.13, 0.35 + dy * 0.8, 0.15],
          [s * 0.19, 0.356 + dy * 1.4, 0.142],
        ]),
        [0.0024, 0.0008],
        { color: WHISKER, sides: 3, smooth: false, bone: head, caps: "point" },
      );

  // ── lower jaw: chin, mouth floor and tongue ride the jaw bone ──────────────────────────────────────────────────
  b.part(ball(0.052, 8, 5), CREAM, { bone: jaw, at: [0, 0.306, 0.098], scale: [0.95, 0.42, 0.9], flat: true });
  b.part(ball(0.036, 7, 4), MOUTH, { bone: jaw, at: [0, 0.32, 0.096], scale: [1, 0.3, 1], flat: true });
  b.part(ball(0.018, 6, 4), TONGUE, { bone: jaw, at: [0, 0.322, 0.104], scale: [1, 0.35, 1.2], flat: true });
  b.part(ball(0.032, 7, 4), MOUTH, { bone: head, at: [0, 0.336, 0.1], scale: [1.05, 0.22, 1], flat: true });

  // ── arms: out to the sides, cream mitt paws ────────────────────────────────────────────────────────────────────
  const arms: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.094, 0.232, 0.012],
        [s * 0.15, 0.216, 0.04],
        [s * 0.2, 0.213, 0.072],
        [s * 0.228, 0.214, 0.09],
      ]),
      { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "arm" },
    );
    arms[side] = arm;
    b.sweep(arm, [0.034, 0.027], { sides: 6, smooth: false, color: FUR });
    b.part(ball(0.038, 7, 5), CREAM, {
      bone: arm.tip!,
      at: [s * 0.236, 0.214, 0.092],
      scale: [1, 0.92, 1.05],
      flat: true,
    });
  }

  // ── left paw: the whisk ────────────────────────────────────────────────────────────────────────────────────────
  const handL = arms.L.tip!;
  const WX = 0.236;
  const WZ = 0.092;
  b.sweep(
    polyline([
      [WX, 0.158, WZ],
      [WX, 0.258, WZ],
    ]),
    0.0125,
    {
      sides: 6,
      smooth: false,
      bone: handL,
      bands: [
        [0.3, BUTTER],
        [0.42, MINT],
        [0.78, BUTTER],
        [0.9, MINT],
        [1, BUTTER],
      ],
    },
  );
  b.rod([WX, 0.254, WZ], [WX, 0.276, WZ], [0.016, 0.011], { color: STEEL, sides: 6, smooth: false, bone: handL });
  const loopProfile: Array<[number, number]> = [
    [0, 0.274],
    [0.024, 0.288],
    [0.041, 0.317],
    [0.034, 0.35],
    [0, 0.376],
    [-0.034, 0.35],
    [-0.041, 0.317],
    [-0.024, 0.288],
  ];
  for (let k = 0; k < 5; k++) {
    const a = k * 36 * DEG;
    const pts = loopProfile.map(([r, y]) => [WX + r * Math.cos(a), y, WZ + r * Math.sin(a)]);
    b.sweep(catmull(pts, { closed: true }), 0.0032, { color: STEEL, sides: 4, smooth: false, bone: handL });
  }
  for (const dx of [-0.017, 0, 0.017])
    b.part(ball(0.0115, 5, 3), CREAM, {
      bone: handL,
      at: [WX + dx, 0.218, WZ + 0.037 - Math.abs(dx) * 0.4],
      scale: [1, 1.3, 1],
      flat: true,
    });

  // ── right paw: the tray of tiny cakes ──────────────────────────────────────────────────────────────────────────
  const handR = arms.R.tip!;
  const TX = -0.265;
  const TZ = 0.098;
  const TY = 0.252;
  b.lathe(
    [
      [0, 0],
      [0.078, 0],
      [0.094, 0.014],
      [0.094, 0.022],
      [0.086, 0.022],
      [0.074, 0.009],
      [0, 0.009],
    ],
    { at: [TX, TY, TZ], bone: handR, segments: 10, color: MINT },
  );
  b.part(new THREE.CircleGeometry(0.068, 10), "#ffffff", {
    bone: handR,
    at: [TX, TY + 0.0105, TZ],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: DOILY,
  });
  // a thumb gripping the tray from below
  b.part(ball(0.013, 5, 3), CREAM, { bone: handR, at: [-0.212, 0.243, 0.12], scale: [1, 0.9, 1.4], flat: true });

  const CY = TY + 0.0115;
  const slot = (i: number, R = 0.05) => {
    const a = (90 + i * 72) * DEG;
    return [TX + R * Math.cos(a), TZ + R * Math.sin(a)] as const;
  };
  const cupcake = (i: number, wrap: string, wrapD: string, ice: string, iceD: string) => {
    const [x, z] = slot(i);
    b.lathe(
      [
        [0, 0],
        [0.014, 0],
        [0.021, 0.02],
        [0, 0.02],
      ],
      { at: [x, CY, z], bone: handR, segments: 8, color: wrap },
    );
    b.lathe(
      [
        [0.0225, 0.0002],
        [0.0235, 0.005],
        [0.0205, 0.0052],
        [0.0205, 0.0002],
      ],
      { at: [x, CY + 0.012, z], bone: handR, segments: 8, color: wrapD },
    );
    const frost = b.lathe(
      [
        [0, 0],
        [0.025, 0],
        [0.026, 0.008],
        [0.019, 0.016],
        [0.012, 0.025],
        [0.005, 0.033],
        [0, 0.036],
      ],
      { at: [x, CY + 0.019, z], bone: handR, segments: 8, color: ice },
    );
    b.lathe(
      [
        [0.0205, 0.004],
        [0.027, 0.0055],
        [0.0265, 0.0105],
        [0.0195, 0.0105],
      ],
      { at: [x, CY + 0.019, z], bone: handR, segments: 8, color: iceD },
    );
    b.part(ball(0.008, 6, 4), CHERRY, { bone: handR, at: [x, CY + 0.0565, z], flat: true });
    b.cards(
      b.surface(frost).scatter(6, { rng: rnd, minDist: 0.012 }),
      SPRINKLE,
      { size: 0.011, lean: 75, bone: handR, color: i % 2 ? "#ffffff" : BUTTER },
    );
  };
  cupcake(0, WHITE, "#ffd0e2", "#ffb3d1", "#ff93bd");
  cupcake(1, "#ffd0e2", WHITE, LILAC, LILAC_D);
  cupcake(3, WHITE, MINT, "#c9f4e2", MINT_D);

  // a face-cube petit four and a macaron
  {
    const [x, z] = slot(2);
    b.part(new THREE.BoxGeometry(0.038, 0.034, 0.038), "#ffe0ef", { bone: handR, at: [x, CY + 0.017, z], rotation: [0, 14, 0], flat: true });
    b.part(new THREE.BoxGeometry(0.04, 0.008, 0.04), WHITE, { bone: handR, at: [x, CY + 0.038, z], rotation: [0, 14, 0], flat: true });
    b.part(ball(0.0085, 5, 3), CHERRY, { bone: handR, at: [x, CY + 0.047, z], flat: true });
    b.part(new THREE.PlaneGeometry(0.03, 0.024), "#ffffff", {
      bone: handR,
      at: [x + 0.0038, CY + 0.017, z + 0.0196],
      dir: [0.24, 0, 1],
      axis: "z",
      texture: FACE_SVG,
    });
  }
  {
    const [x, z] = slot(4);
    b.part(ball(0.024, 8, 4), LILAC, { bone: handR, at: [x, CY + 0.007, z], scale: [1, 0.3, 1], flat: true });
    b.part(ball(0.0215, 8, 4), BUTTER, { bone: handR, at: [x, CY + 0.0135, z], scale: [1, 0.22, 1], flat: true });
    b.part(ball(0.024, 8, 4), LILAC, { bone: handR, at: [x, CY + 0.021, z], scale: [1, 0.32, 1], flat: true });
  }
  // a strawberry in the middle
  b.part(ball(0.017, 6, 4), CHERRY, { bone: handR, at: [TX, CY + 0.014, TZ], scale: [1, 1.05, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.011, 0.008, 5), LEAF, { bone: handR, at: [TX, CY + 0.03, TZ], flat: true });

  // ── sprites: sparkles and steam ────────────────────────────────────────────────────────────────────────────────
  const up = (x: number, y: number, z: number) => frame([x, y, z], [0, 1, 0]);
  b.cards([up(0.255, 0.405, 0.145), up(0.335, 0.33, 0.085), up(0.2, 0.46, 0.06)], SPARKLE, {
    size: [0.045, 0.045],
    flow: [0, 0, 1],
    bone: handL,
    vary: 0.25,
    rng: rnd,
    sink: 0,
  });
  b.cards([up(-0.36, 0.385, 0.145), up(-0.19, 0.41, 0.17), up(0.0, 0.0 + 0.1, 0.0)].slice(0, 2), SPARKLE_PINK, {
    size: [0.04, 0.04],
    flow: [0, 0, 1],
    bone: handR,
    vary: 0.25,
    rng: rnd,
    sink: 0,
  });
  b.cards([up(-0.3, 0.34, 0.11), up(-0.245, 0.35, 0.12)], STEAM, {
    size: [0.035, 0.055],
    flow: [0, 0, 1],
    bone: handR,
    vary: 0.15,
    rng: rnd,
    sink: 0,
  });

  return b.root;
}
