// Penguin Ice-Cream Cart: a chubby penguin vendor in a striped paper hat, a double-scoop cone in one flipper,
// beside a candy-mint pushcart with a striped parasol, tubs of pastel ice cream, a cone stack, a price sign and wheels.
// Cute flat low-poly: every mesh faceted, flat colours, SVG drawings for faces, stripes, sprinkles and signs.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Penguin Ice-Cream Cart",
  description:
    "A chibi penguin vendor (0.45 m) in a striped paper hat holds a double-scoop cone beside a 0.9 m mint pushcart with a scalloped striped parasol, pastel ice-cream tubs, a cone stack, a price sign and spoked wheels. Faceted flat low-poly with SVG faces, stripes, sprinkles and stickers.",
};

// ---------------------------------------------------------------- palette
const FEATHER = "#6b7ad1";
const FEATHER_DK = "#5d6cc6";
const CREAM = "#fff6ec";
const ORANGE = "#ffb04a";
const PINK = "#ff8fb4";
const HOT = "#ff6f9c";
const MINT = "#9ce9d1";
const MINT_DK = "#6fd3b6";
const LAV = "#c8b6ff";
const PEACH = "#ffbd96";
const WOOD = "#e5ab7c";
const WOOD_DK = "#c98a5c";
const PLUM = "#6a5680";
const STEEL = "#dfeaf2";
const CONE_A = "#f8d192";
const CONE_B = "#ecbb70";
const CHERRY = "#ff4f6e";

// ---------------------------------------------------------------- layout (meters)
const PX = 0.45; // penguin x
const CX = -0.22; // cart centre x
const c = (x: number, y: number, z: number): [number, number, number] => [CX + x, y, z];

// ---------------------------------------------------------------- drawings
const face = svg(
  `<svg viewBox="0 0 170 120">
    <path d="M85 20 C70 0 28 4 20 42 C14 78 50 112 85 117 C120 112 156 78 150 42 C142 4 100 0 85 20 Z" fill="#fff6ec"/>
    <ellipse cx="53" cy="60" rx="14" ry="17" fill="#2b2140"/>
    <ellipse cx="117" cy="60" rx="14" ry="17" fill="#2b2140"/>
    <circle cx="58" cy="52" r="6" fill="#ffffff"/>
    <circle cx="122" cy="52" r="6" fill="#ffffff"/>
    <circle cx="48" cy="67" r="2.8" fill="#ffffff"/>
    <circle cx="112" cy="67" r="2.8" fill="#ffffff"/>
    <ellipse cx="29" cy="83" rx="13" ry="7.5" fill="#ff9fb8"/>
    <ellipse cx="141" cy="83" rx="13" ry="7.5" fill="#ff9fb8"/>
    <path d="M38 37 Q53 28 68 36" fill="none" stroke="#2b2140" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M102 36 Q117 28 132 37" fill="none" stroke="#2b2140" stroke-width="3.4" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);

const hatStripes = svg(
  `<svg viewBox="0 0 128 32">${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 16}" y="0" width="16" height="32" fill="${i % 2 ? "#fff6ec" : "#ff8fb4"}"/>`).join("")}</svg>`,
  { size: 128 },
);

function canopyTexture(a: string, bb: string) {
  const stripes = Array.from({ length: 8 }, (_, i) => {
    const x = i * 32;
    return `<path d="M${x} 0 H${x + 32} V46 A16 16 0 0 1 ${x} 46 Z" fill="${i % 2 ? bb : a}"/>`;
  }).join("");
  return svg(`<svg viewBox="0 0 256 64">${stripes}</svg>`, { size: 512 });
}
const canopyTex = canopyTexture("#ff86ab", "#fff6ec");

const waffle = (() => {
  let lines = "";
  for (let i = -8; i <= 16; i++) {
    lines += `<path d="M${i * 8} 0 L${i * 8 + 64} 64" stroke="#d99a4d" stroke-width="2.6"/>`;
    lines += `<path d="M${i * 8 + 64} 0 L${i * 8} 64" stroke="#d99a4d" stroke-width="2.6"/>`;
  }
  return svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f3c47c"/>${lines}</svg>`, { size: 256 });
})();

type ScoopStyle = "sprinkles" | "chips" | "swirl" | "stars";
function scoopTexture(bg: string, mark: string, style: ScoopStyle, seed: number, extra = "#ffffff") {
  const r = rng(seed);
  let marks = "";
  if (style === "sprinkles") {
    for (let i = 0; i < 46; i++) {
      const x = r() * 128;
      const y = 6 + r() * 52;
      const a = r() * Math.PI;
      const col = [mark, extra, "#ffffff"][i % 3];
      marks += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * 5).toFixed(1)} ${(Math.sin(a) * 5).toFixed(1)}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
    }
  } else if (style === "chips") {
    for (let i = 0; i < 26; i++) {
      const x = r() * 128;
      const y = 8 + r() * 48;
      marks += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(3 + r() * 3).toFixed(1)} ${(r() * 3).toFixed(1)} l-2 4 z" fill="${mark}"/>`;
    }
  } else if (style === "swirl") {
    for (let k = 0; k < 3; k++)
      marks += `<path d="M0 ${14 + k * 18} Q16 ${6 + k * 18} 32 ${14 + k * 18} T64 ${14 + k * 18} T96 ${14 + k * 18} T128 ${14 + k * 18}" fill="none" stroke="${mark}" stroke-width="5" stroke-linecap="round"/>`;
  } else {
    for (let i = 0; i < 18; i++) {
      const x = r() * 128;
      const y = 8 + r() * 48;
      marks += `<path d="M${x.toFixed(1)} ${(y - 4).toFixed(1)} L${(x + 1.4).toFixed(1)} ${(y - 1.4).toFixed(1)} L${(x + 4).toFixed(1)} ${y.toFixed(1)} L${(x + 1.4).toFixed(1)} ${(y + 1.4).toFixed(1)} L${x.toFixed(1)} ${(y + 4).toFixed(1)} L${(x - 1.4).toFixed(1)} ${(y + 1.4).toFixed(1)} L${(x - 4).toFixed(1)} ${y.toFixed(1)} L${(x - 1.4).toFixed(1)} ${(y - 1.4).toFixed(1)} Z" fill="${mark}"/>`;
    }
  }
  return svg(`<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="${bg}"/>${marks}</svg>`, { size: 256 });
}
const S_PINK = scoopTexture("#ff9ec4", "#ffe27a", "sprinkles", 11, "#9ce9d1");
const S_MINT = scoopTexture("#a4efd6", "#7a5248", "chips", 12);
const S_LEMON = scoopTexture("#ffe88a", "#ffd04d", "swirl", 13);
const S_LAV = scoopTexture("#cdbcff", "#ffffff", "stars", 14);
const S_PEACH = scoopTexture("#ffc49d", "#ff9a7a", "sprinkles", 15, "#fff6ec");

const cartFront = svg(
  `<svg viewBox="0 0 760 190">
    <rect width="760" height="190" fill="#9ce9d1"/>
    <rect width="760" height="34" fill="#fff6ec"/>
    ${Array.from({ length: 20 }, (_, i) => `<circle cx="${19 + i * 38}" cy="34" r="19" fill="${i % 2 ? "#fff6ec" : "#ff8fb4"}"/>`).join("")}
    <g transform="translate(110 118)">
      <path d="M-22 -4 H22 L0 52 Z" fill="#f3c47c"/><path d="M-11 -4 L0 40 M11 -4 L0 40 M-18 14 H18" stroke="#d99a4d" stroke-width="3" fill="none"/>
      <circle cx="0" cy="-10" r="24" fill="#ff9ec4"/><circle cx="0" cy="-42" r="19" fill="#ffe88a"/><circle cx="-7" cy="-48" r="5" fill="#fff6ec"/>
    </g>
    <g transform="translate(380 118)">
      <path d="M-22 -4 H22 L0 52 Z" fill="#f3c47c"/><path d="M-11 -4 L0 40 M11 -4 L0 40 M-18 14 H18" stroke="#d99a4d" stroke-width="3" fill="none"/>
      <circle cx="0" cy="-10" r="24" fill="#cdbcff"/><circle cx="0" cy="-42" r="19" fill="#a4efd6"/><circle cx="-7" cy="-48" r="5" fill="#fff6ec"/>
    </g>
    <g transform="translate(650 118)">
      <path d="M-22 -4 H22 L0 52 Z" fill="#f3c47c"/><path d="M-11 -4 L0 40 M11 -4 L0 40 M-18 14 H18" stroke="#d99a4d" stroke-width="3" fill="none"/>
      <circle cx="0" cy="-10" r="24" fill="#ffc49d"/><circle cx="0" cy="-42" r="19" fill="#ff9ec4"/><circle cx="-7" cy="-48" r="5" fill="#fff6ec"/>
    </g>
    ${[245, 515].map((x) => `<path d="M${x} 92 l7 14 l15 2 l-11 11 l3 15 l-14 -8 l-14 8 l3 -15 l-11 -11 l15 -2 z" fill="#ffe27a"/>`).join("")}
    <path d="M12 176 Q32 160 52 176 T92 176 T132 176 T172 176 T212 176 T252 176 T292 176 T332 176 T372 176 T412 176 T452 176 T492 176 T532 176 T572 176 T612 176 T652 176 T692 176 T732 176" fill="none" stroke="#fff6ec" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 1024 },
);

const cartEnd = svg(
  `<svg viewBox="0 0 360 190">
    <rect width="360" height="190" fill="#9ce9d1"/>
    <rect width="360" height="34" fill="#fff6ec"/>
    ${Array.from({ length: 10 }, (_, i) => `<circle cx="${18 + i * 36}" cy="34" r="18" fill="${i % 2 ? "#fff6ec" : "#ff8fb4"}"/>`).join("")}
    <g transform="translate(180 124)">
      <path d="M-26 -4 H26 L0 58 Z" fill="#f3c47c"/><path d="M-13 -4 L0 44 M13 -4 L0 44 M-21 16 H21" stroke="#d99a4d" stroke-width="3" fill="none"/>
      <circle cx="0" cy="-10" r="28" fill="#ff9ec4"/><circle cx="0" cy="-46" r="22" fill="#ffe88a"/><circle cx="-8" cy="-53" r="6" fill="#fff6ec"/>
    </g>
  </svg>`,
  { size: 512 },
);

const fish = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><path d="M9 0 L20 -8 L20 8 Z" fill="#7fd6f2"/><ellipse cx="0" cy="0" rx="12" ry="8" fill="#7fd6f2"/><path d="M-2 -8 L4 -14 L7 -6 Z" fill="#5fbfe3"/><circle cx="-6" cy="-2" r="2" fill="#2b2140"/></g>`;
const priceSign = svg(
  `<svg viewBox="0 0 150 110">
    <rect width="150" height="110" rx="14" fill="#fff6ec"/>
    <rect x="7" y="7" width="136" height="96" rx="9" fill="#ff8fb4"/>
    <g transform="translate(36 52)">
      <path d="M-15 10 H15 L0 46 Z" fill="#f3c47c"/><path d="M-5 10 L0 34 M5 10 L0 34" stroke="#d99a4d" stroke-width="2.5" fill="none"/>
      <circle cx="0" cy="0" r="16" fill="#ffe88a"/><circle cx="0" cy="-22" r="13" fill="#cdbcff"/><circle cx="-5" cy="-27" r="3.4" fill="#fff6ec"/>
    </g>
    <text x="80" y="47" font-family="Verdana, sans-serif" font-weight="900" font-size="28" fill="#fff6ec">1</text>
    ${fish(108, 38)}
    <text x="72" y="88" font-family="Verdana, sans-serif" font-weight="900" font-size="28" fill="#ffffff">2</text>
    ${fish(97, 79)}${fish(124, 79)}
  </svg>`,
  { size: 512 },
);

const hubcap = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="32" fill="#ffe27a"/>
    ${Array.from({ length: 5 }, (_, i) => `<path d="M32 32 L${(32 + Math.sin((i * 72 * Math.PI) / 180) * 28).toFixed(1)} ${(32 - Math.cos((i * 72 * Math.PI) / 180) * 28).toFixed(1)}" stroke="#ff8fb4" stroke-width="7" stroke-linecap="round"/>`).join("")}
    <circle cx="32" cy="32" r="8" fill="#fff6ec"/><circle cx="32" cy="32" r="3.2" fill="#6a5680"/>
  </svg>`,
  { size: 192 },
);

const tummy = svg(
  `<svg viewBox="0 0 100 100">
    <path d="M50 88 C22 66 10 50 10 34 C10 18 24 10 36 12 C44 13 48 18 50 24 C52 18 56 13 64 12 C76 10 90 18 90 34 C90 50 78 66 50 88 Z" fill="#ff8fb4"/>
    <ellipse cx="32" cy="29" rx="8" ry="5.5" fill="#ffd0e0" transform="rotate(-28 32 29)"/>
  </svg>`,
  { size: 256 },
);
const sparkle = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 0 C35 24 40 29 64 32 C40 35 35 40 32 64 C29 40 24 35 0 32 C24 29 29 24 32 0 Z" fill="#fff3a0"/><circle cx="32" cy="32" r="5" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const pennant = (colour: string) =>
  svg(
    `<svg viewBox="0 0 48 64"><path d="M0 0 H48 L24 62 Z" fill="${colour}"/><circle cx="24" cy="18" r="6" fill="#fff6ec"/></svg>`,
    { size: 128 },
  );

// ---------------------------------------------------------------- geometry helpers
const sphere = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
const flipTriangles = (g: THREE.BufferGeometry) => {
  const index = g.index!;
  for (let i = 0; i < index.count; i += 3) {
    const t = index.getX(i + 1);
    index.setX(i + 1, index.getX(i + 2));
    index.setX(i + 2, t);
  }
  return g;
};

export default function build() {
  const b = createBuilder({ name: "penguinIceCreamCart" });
  const flat = { flat: true } as const;

  // ================================================================ skeleton: penguin
  const hips = b.joint("hips", { at: [PX, 0.12, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [PX, 0.17, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [PX, 0.22, 0.004], dir: [0, 1, 0.05], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [PX, 0.27, 0.008], dir: [0, 1, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [PX, 0.285, 0.01], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [PX, 0.276, 0.075], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    [
      [PX, 0.07, -0.1],
      [PX, 0.05, -0.15],
      [PX, 0.035, -0.2],
    ],
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  const LEFT_FLIPPER = [
    [PX + 0.108, 0.205, 0.0],
    [PX + 0.178, 0.175, 0.03],
    [PX + 0.205, 0.235, 0.088],
  ];
  const RIGHT_FLIPPER = [
    [PX - 0.108, 0.205, 0.0],
    [PX - 0.18, 0.192, 0.0],
    [PX - 0.255, 0.175, 0.0],
  ];
  const armL = b.chain("armL", LEFT_FLIPPER, { parent: chest, names: ["shoulderL", "elbowL", "handL"], role: "arm" });
  const armR = b.chain("armR", RIGHT_FLIPPER, { parent: chest, names: ["shoulderR", "elbowR", "handR"], role: "arm" });

  const legs = [1, -1].map((s) =>
    b.chain(
      s > 0 ? "legL" : "legR",
      [
        [PX + s * 0.055, 0.085, 0.0],
        [PX + s * 0.057, 0.055, 0.01],
        [PX + s * 0.058, 0.03, 0.022],
        [PX + s * 0.058, 0.012, 0.06],
      ],
      {
        parent: hips,
        names: s > 0 ? ["hipL", "kneeL", "ankleL", "toeL"] : ["hipR", "kneeR", "ankleR", "toeR"],
        role: "leg",
      },
    ),
  );

  // ================================================================ skeleton: cart
  const cart = b.joint("cart", { parent: hips, at: c(0, 0.2, 0), dir: [0, 1, 0] });
  const parasolBase = b.joint("parasolBase", { parent: cart, at: c(0, 0.375, -0.12), dir: [0, 1, 0], role: "hinge" });
  const parasolTop = b.joint("parasolTop", {
    parent: parasolBase,
    at: c(0, 0.7, -0.12),
    dir: [0, 1, 0],
    role: "hinge",
  });
  const wheels: Record<string, Joint> = {};
  const wheelSpots: Array<[string, number, number]> = [
    ["wheelFL", 0.27, 0.225],
    ["wheelFR", -0.27, 0.225],
    ["wheelBL", 0.27, -0.225],
    ["wheelBR", -0.27, -0.225],
  ];
  for (const [name, x, z] of wheelSpots)
    wheels[name] = b.joint(name, { parent: cart, at: c(x, 0.085, z), dir: [0, 0, 1], role: "hinge" });

  // ================================================================ penguin body
  const egg = (r: number, cy: number, half: number) => (t: number) => {
    const u = (0.006 + t * 0.304 - cy) / half;
    return r * Math.sqrt(Math.max(0, 1 - u * u));
  };
  const bodyPath = catmull([
    [PX, 0.006, 0],
    [PX, 0.11, 0],
    [PX, 0.21, 0.004],
    [PX, 0.31, 0.008],
  ]);
  const plump = egg(1, 0.158, 0.152);
  b.sweep(bodyPath, (t) => [0.128 * plump(t), 0.118 * plump(t)], {
    bone: [hips, spine, chest, neck],
    color: FEATHER,
    sides: 10,
    smooth: false,
    caps: "round",
  });
  const bellyFn = egg(1, 0.138, 0.127);
  const belly = b.sweep(bodyPath, (t) => [0.098 * bellyFn(t), 0.092 * bellyFn(t)], {
    bone: [hips, spine, chest, neck],
    color: CREAM,
    sides: 10,
    smooth: false,
    caps: "round",
    shift: [0, -0.036],
  });
  b.decal(belly, tummy, { at: [PX, 0.125, 0.13], dir: [0, 0, 1], size: [0.05, 0.05], segments: 6 });
  // tail wedge
  b.part(new THREE.ConeGeometry(0.04, 0.12, 5), FEATHER_DK, {
    ...flat,
    bone: tail.joints[0],
    at: [PX, 0.052, -0.14],
    dir: [0, -0.35, -1],
    scale: [1, 1, 0.5],
  });

  // head
  const skull = b.part(sphere(11, 8), FEATHER, {
    ...flat,
    bone: head,
    at: [PX, 0.3, 0.008],
    scale: [0.114, 0.1, 0.102],
  });
  b.decal(skull, face, { at: [PX, 0.296, 0.1], dir: [0, 0, 1], size: [0.17, 0.12], segments: [12, 9], bone: head });
  // bow tie
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.022, 0.04, 4), HOT, {
      ...flat,
      bone: neck,
      at: [PX + s * 0.02, 0.222, 0.101],
      dir: [s, 0, 0],
    });
  }
  b.part(sphere(6, 4), PINK, { ...flat, bone: neck, at: [PX, 0.222, 0.103], scale: 0.012 });

  // beak: separate upper and lower halves
  b.part(sphere(6, 4), ORANGE, { ...flat, bone: head, at: [PX, 0.29, 0.108], scale: [0.03, 0.0135, 0.027] });
  b.part(sphere(6, 4), ORANGE, { ...flat, bone: jaw, at: [PX, 0.272, 0.104], scale: [0.024, 0.009, 0.021] });
  b.part(sphere(5, 3), "#ff7f8f", { ...flat, bone: jaw, at: [PX, 0.276, 0.098], scale: [0.017, 0.004, 0.014] });

  // paper hat
  const hatY = 0.368;
  b.part(new THREE.CylinderGeometry(0.03, 0.074, 0.066, 8), "#ffffff", {
    ...flat,
    texture: hatStripes,
    bone: head,
    at: [PX, hatY + 0.033, 0.004],
    rotation: [0, 0, -7],
  });
  b.part(new THREE.CylinderGeometry(0.0775, 0.0775, 0.012, 8), CREAM, {
    ...flat,
    bone: head,
    at: [PX, hatY + 0.002, 0.004],
    rotation: [0, 0, -7],
  });
  b.part(sphere(6, 4), HOT, { ...flat, bone: head, at: [PX - 0.0065, hatY + 0.072, 0.004], scale: 0.0125 });

  // flippers: two paddles each, hinged at the elbow
  const paddle = (pts: number[][], i: number, ref: [number, number, number], w0: number, w1: number, bone: Joint) => {
    const a = new THREE.Vector3(...pts[i]);
    const e = new THREE.Vector3(...pts[i + 1]);
    const d = e.clone().sub(a);
    const len = d.length();
    d.normalize();
    const r = new THREE.Vector3(...ref);
    const y = r.sub(d.clone().multiplyScalar(d.dot(r))).normalize();
    return b.extrude(
      [
        [-w0 * 0.6, 0],
        [0, -w0],
        [len, -w1],
        [len + w1 * 0.7, 0],
        [len, w1],
        [0, w0],
      ],
      {
        at: a,
        x: d.toArray(),
        y: y.toArray(),
        thickness: 0.02,
        bevel: 0.005,
        smoothing: 1,
        detail: 0.5,
        color: FEATHER_DK,
        bone,
      },
    );
  };
  paddle(LEFT_FLIPPER, 0, [0, 0.7, 0.7], 0.03, 0.027, armL.joints[0]);
  paddle(LEFT_FLIPPER, 1, [1, 0, 0], 0.027, 0.022, armL.joints[1]);
  paddle(RIGHT_FLIPPER, 0, [0, 0.7, 0.7], 0.03, 0.027, armR.joints[0]);
  paddle(RIGHT_FLIPPER, 1, [0, 0.7, 0.7], 0.027, 0.022, armR.joints[1]);

  // feet
  const foot: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.018, 0],
    [-0.014, -0.016],
    [0.006, -0.03],
    [0.04, -0.034],
    [0.068, -0.033],
    [0.078, -0.022],
    [0.058, -0.013, "sharp"],
    [0.083, 0],
    [0.058, 0.013, "sharp"],
    [0.078, 0.022],
    [0.068, 0.033],
    [0.04, 0.034],
    [0.006, 0.03],
    [-0.014, 0.016],
  ];
  for (const [i, s] of [1, -1].entries())
    b.extrude(foot, {
      at: [PX + s * 0.058, 0.0075, 0.0],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.015,
      bevel: 0.003,
      smoothing: 0,
      detail: 0.34,
      color: ORANGE,
      bone: legs[i].joints[2],
    });
  for (const [i, s] of [1, -1].entries())
    b.part(new THREE.CylinderGeometry(0.014, 0.017, 0.05, 6), ORANGE, {
      ...flat,
      bone: legs[i].joints[0],
      at: [PX + s * 0.057, 0.05, 0.006],
    });

  // ================================================================ held double-scoop cone
  const handTip = LEFT_FLIPPER[2];
  const cone = [handTip[0], handTip[1] - 0.02, handTip[2] + 0.018];
  const held = armL.joints[2];
  b.part(new THREE.ConeGeometry(0.03, 0.09, 8, 1, false), "#ffffff", {
    ...flat,
    texture: waffle,
    bone: held,
    at: [cone[0], cone[1] + 0.045, cone[2]],
    dir: [0, -1, 0],
  });
  b.part(new THREE.CylinderGeometry(0.0375, 0.0375, 0.012, 8), PINK, {
    ...flat,
    bone: held,
    at: [cone[0], cone[1] + 0.094, cone[2]],
  });
  b.part(sphere(8, 6), "#ffffff", {
    ...flat,
    texture: S_PINK,
    bone: held,
    at: [cone[0], cone[1] + 0.112, cone[2]],
    scale: 0.038,
  });
  b.part(sphere(8, 6), "#ffffff", {
    ...flat,
    texture: S_LEMON,
    bone: held,
    at: [cone[0], cone[1] + 0.152, cone[2]],
    scale: 0.033,
  });
  b.part(sphere(6, 4), CHERRY, { ...flat, bone: held, at: [cone[0], cone[1] + 0.19, cone[2]], scale: 0.0135 });
  b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.025, 4), "#6a5680", {
    ...flat,
    bone: held,
    at: [cone[0] + 0.006, cone[1] + 0.205, cone[2]],
    rotation: [0, 0, -20],
  });

  // ================================================================ cart body
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  b.part(box(0.74, 0.03, 0.3), PLUM, { ...flat, bone: cart, at: c(0, 0.125, 0) });
  b.part(box(0.8, 0.215, 0.36), MINT, { ...flat, bone: cart, at: c(0, 0.2475, 0) });
  b.part(box(0.83, 0.028, 0.39), CREAM, { ...flat, bone: cart, at: c(0, 0.369, 0) });
  b.part(box(0.83, 0.014, 0.39), PINK, { ...flat, bone: cart, at: c(0, 0.349, 0) });
  // panels
  b.part(new THREE.PlaneGeometry(0.76, 0.19), "#ffffff", {
    texture: cartFront,
    bone: cart,
    at: c(0, 0.25, 0.1815),
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.76, 0.19), "#ffffff", {
    texture: cartFront,
    bone: cart,
    at: c(0, 0.25, -0.1815),
    dir: [0, 0, -1],
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.34, 0.19), "#ffffff", {
    texture: cartEnd,
    bone: cart,
    at: c(0.4015, 0.25, 0),
    dir: [1, 0, 0],
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.34, 0.19), "#ffffff", {
    texture: cartEnd,
    bone: cart,
    at: c(-0.4015, 0.25, 0),
    dir: [-1, 0, 0],
    axis: "z",
  });

  // axles
  for (const x of [0.27, -0.27])
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.46, 6), STEEL, {
      ...flat,
      bone: cart,
      at: c(x, 0.085, 0),
      dir: [0, 0, 1],
    });

  // wheels
  for (const [name, x, z] of wheelSpots) {
    const joint = wheels[name];
    const out = z > 0 ? 1 : -1;
    b.part(box(0.034, 0.05, 0.09), STEEL, { ...flat, bone: cart, at: c(x, 0.105, out * 0.165) });
    b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.032, 10), PLUM, {
      ...flat,
      bone: joint,
      at: c(x, 0.088, z),
      dir: [0, 0, 1],
      up: [0, 1, 0],
    });
    b.part(new THREE.CircleGeometry(0.066, 10), "#ffffff", {
      texture: hubcap,
      bone: joint,
      at: c(x, 0.088, z + out * 0.0175),
      dir: [0, 0, out],
      axis: "z",
    });
  }

  // handle at the -x end
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.1, 6), STEEL, {
      ...flat,
      bone: cart,
      at: c(-0.45, 0.3, s * 0.14),
      dir: [1, 0, 0],
    });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.36, 6), HOT, {
    ...flat,
    bone: cart,
    at: c(-0.5, 0.3, 0),
    dir: [0, 0, 1],
  });
  for (const s of [1, -1]) b.part(sphere(6, 4), HOT, { ...flat, bone: cart, at: c(-0.5, 0.3, s * 0.18), scale: 0.022 });

  // ================================================================ tubs of ice cream
  const tubs: Array<[number, THREE.Texture, string]> = [
    [-0.16, S_MINT, MINT_DK],
    [0.02, S_LAV, LAV],
    [0.2, S_PEACH, PEACH],
  ];
  for (const [x, tex, band] of tubs) {
    b.part(new THREE.CylinderGeometry(0.09, 0.08, 0.07, 8), STEEL, { ...flat, bone: cart, at: c(x, 0.41, 0.03) });
    b.part(new THREE.CylinderGeometry(0.0915, 0.0915, 0.02, 8), band, { ...flat, bone: cart, at: c(x, 0.41, 0.03) });
    b.part(new THREE.CylinderGeometry(0.096, 0.096, 0.01, 8), CREAM, { ...flat, bone: cart, at: c(x, 0.4425, 0.03) });
    b.part(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#ffffff", {
      ...flat,
      texture: tex,
      bone: cart,
      at: c(x, 0.44, 0.03),
      scale: [0.084, 0.055, 0.084],
    });
  }
  // scoop stuck in the middle tub
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.14, 5), HOT, {
    ...flat,
    bone: cart,
    at: c(0.04, 0.53, 0.04),
    rotation: [14, 0, -12],
  });
  b.part(sphere(6, 4), STEEL, { ...flat, bone: cart, at: c(0.058, 0.585, 0.07), scale: [0.026, 0.016, 0.026] });

  // ================================================================ cone stack in a holder
  b.part(new THREE.CylinderGeometry(0.056, 0.05, 0.07, 8), PINK, { ...flat, bone: cart, at: c(0.34, 0.41, -0.06) });
  for (let i = 0; i < 5; i++) {
    b.lathe(
      [
        [0, 0],
        [0.048, 0.1],
        [0.042, 0.1],
        [0, 0.012],
      ],
      { at: c(0.34, 0.435 + i * 0.03, -0.06), segments: 8, bone: cart, color: i % 2 ? CONE_B : CONE_A },
    );
  }

  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.13, 5), CONE_B, { ...flat, bone: cart, at: c(0.34, 0.5, -0.06) });

  // ================================================================ price sign
  const signAt = c(-0.32, 0.475, 0.115);
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.09, 5), WOOD_DK, {
      ...flat,
      bone: cart,
      at: [signAt[0] + s * 0.05, 0.42, 0.124],
      rotation: [-10, 0, 0],
    });
  b.part(box(0.17, 0.125, 0.02), WOOD, { ...flat, bone: cart, at: signAt, rotation: [-10, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.15, 0.11), "#ffffff", {
    texture: priceSign,
    bone: cart,
    at: [signAt[0], signAt[1] + 0.0018, signAt[2] + 0.0104],
    rotation: [-10, 0, 0],
    axis: "z",
  });

  // ================================================================ parasol
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.52, 6), WOOD, { ...flat, bone: parasolBase, at: c(0, 0.635, -0.12) });
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.03, 8), HOT, { ...flat, bone: parasolBase, at: c(0, 0.39, -0.12) });
  b.part(new THREE.ConeGeometry(0.46, 0.17, 8, 1, true), "#ffffff", {
    ...flat,
    texture: canopyTex,
    bone: parasolTop,
    at: c(0, 0.785, -0.12),
  });
  b.part(flipTriangles(new THREE.ConeGeometry(0.46, 0.17, 8, 1, true)), "#ffffff", {
    ...flat,
    texture: canopyTex,
    bone: parasolTop,
    at: c(0, 0.783, -0.12),
    scale: [0.985, 0.985, 0.985],
  });
  b.part(sphere(6, 4), HOT, { ...flat, bone: parasolTop, at: c(0, 0.885, -0.12), scale: 0.022 });
  // pennants along the canopy rim
  const tints = [pennant("#ffe27a"), pennant("#9ce9d1"), pennant("#cdbcff")];
  const rimPoints = Array.from({ length: 8 }, (_, i) => {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    return frame(c(Math.sin(a) * 0.43, 0.712, -0.12 + Math.cos(a) * 0.43), [0, 1, 0]);
  });
  tints.forEach((tex, k) =>
    b.cards(
      rimPoints.filter((_, i) => i % 3 === k),
      tex,
      { size: [0.055, 0.07], lean: 180, flow: [0, 0, 1], bone: parasolTop, cross: true },
    ),
  );

  // ================================================================ sprites: sparkles and cold mist
  const sparkles: Array<[number, number, number, number]> = [
    [PX + 0.29, 0.33, 0.12, 0.06],
    [PX + 0.17, 0.43, 0.1, 0.045],
    [PX + 0.3, 0.4, 0.14, 0.04],
  ];
  b.cards(
    sparkles.map(([x, y, z]) => frame([x, y, z], [0, 1, 0])),
    sparkle,
    { size: 0.05, cross: true, bone: held },
  );

  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
