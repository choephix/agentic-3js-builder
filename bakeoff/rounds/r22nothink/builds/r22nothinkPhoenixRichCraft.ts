import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull, bezier, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { gradient, paint, noise, smoothstep, mix } from "../../../../src/paint";
import { animeEye, cel, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description:
    "A cel-shaded flame phoenix with wings spread, layered fire-feather cards, gold filigree trims, ember glow and a long flowing tail.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------- palette ----------
const CRIMSON = cel("#e8362a", "#a31a3a");
const ORANGE = cel("#ff8a1f", "#e0431f");
const AMBER = cel("#ffc23a", "#f28a22");
const CREAM = cel("#fff0b8", "#f6c27a");
const GOLD = cel("#ffd35a", "#c98a1e");
const DEEPGOLD = cel("#e0a52a", "#9a5f16");
const PLUM = cel("#4a1d3f", "#2a0f2e");

const G_GOLD = "#ffd35a";
const G_FLAME = "#ff9a2a";
const G_HOT = "#ffe58a";
const G_RED = "#ff4a2a";
const G_TEAL = "#4ff0d8";
const G_BEAK = "#f6b53a";

// ---------- feather textures ----------
const flameFeather = svg(
  `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 118 C6 96 2 62 12 34 C15 24 18 12 20 2 C22 12 25 24 28 34 C38 62 34 96 20 118 Z" fill="#ff5a24"/>
    <path d="M20 112 C10 92 8 62 15 38 C17 28 19 16 20 8 C21 16 23 28 25 38 C32 62 30 92 20 112 Z" fill="#ff9a2a"/>
    <path d="M20 104 C14 88 13 64 18 44 C19 34 20 24 20 16 C20 24 21 34 22 44 C27 64 26 88 20 104 Z" fill="#ffd35a"/>
    <path d="M20 96 C17 84 17 66 19.5 50 L20 30 L20.5 50 C23 66 23 84 20 96 Z" fill="#fff3b0"/>
    <path d="M20 118 L20 6" stroke="#c8301c" stroke-width="1.4" fill="none"/>
  </svg>`,
  { size: 128 },
);

const wingFeather = svg(
  `<svg viewBox="0 0 40 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 138 C4 110 2 60 10 30 C13 18 17 8 20 2 C23 8 27 18 30 30 C38 60 36 110 20 138 Z" fill="#d6261f"/>
    <path d="M20 130 C8 106 7 62 13 34 C15 22 18 12 20 6 C22 12 25 22 27 34 C33 62 32 106 20 130 Z" fill="#ff6a22"/>
    <path d="M20 120 C12 100 12 66 16 42 C18 30 19 20 20 12 C21 20 22 30 24 42 C28 66 28 100 20 120 Z" fill="#ffae33"/>
    <path d="M20 108 C16 94 16 70 19 52 L20 28 L21 52 C24 70 24 94 20 108 Z" fill="#ffe27a"/>
    <path d="M20 138 L20 8" stroke="#9a1c24" stroke-width="1.3" fill="none"/>
  </svg>`,
  { size: 128 },
);

const tailFeather = svg(
  `<svg viewBox="0 0 48 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 158 C8 130 2 84 10 46 C14 30 20 14 24 2 C28 14 34 30 38 46 C46 84 40 130 24 158 Z" fill="#c8202a"/>
    <path d="M24 150 C12 126 8 86 14 52 C17 36 21 20 24 8 C27 20 31 36 34 52 C40 86 36 126 24 150 Z" fill="#ff5a24"/>
    <path d="M24 140 C16 120 14 88 18 58 C20 42 23 28 24 16 C25 28 28 42 30 58 C34 88 32 120 24 140 Z" fill="#ff9a2a"/>
    <path d="M24 128 C19 112 19 90 22 64 L24 36 L26 64 C29 90 29 112 24 128 Z" fill="#ffd35a"/>
    <ellipse cx="24" cy="46" rx="7" ry="11" fill="#ffd35a"/>
    <ellipse cx="24" cy="46" rx="4" ry="7" fill="#ff5a24"/>
    <ellipse cx="24" cy="46" rx="2" ry="3.6" fill="#4ff0d8"/>
    <path d="M24 158 L24 6" stroke="#8a1424" stroke-width="1.3" fill="none"/>
  </svg>`,
  { size: 192 },
);

const crestFeather = svg(
  `<svg viewBox="0 0 24 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 98 C3 76 2 44 8 22 C9 14 11 8 12 2 C13 8 15 14 16 22 C22 44 21 76 12 98 Z" fill="#ff6a22"/>
    <path d="M12 90 C6 72 6 46 10 26 C11 18 12 12 12 8 C12 12 13 18 14 26 C18 46 18 72 12 90 Z" fill="#ffc23a"/>
    <path d="M12 80 C9 66 10 48 12 32 C14 48 15 66 12 80 Z" fill="#fff3b0"/>
  </svg>`,
  { size: 96 },
);

const downFeather = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 46 C4 36 2 20 8 10 C11 6 14 3 16 1 C18 3 21 6 24 10 C30 20 28 36 16 46 Z" fill="#ffb02e"/>
    <path d="M16 40 C8 32 7 20 11 12 C13 9 15 6 16 4 C17 6 19 9 21 12 C25 20 24 32 16 40 Z" fill="#ffe27a"/>
    <path d="M16 34 C12 28 12 20 16 12 C20 20 20 28 16 34 Z" fill="#fff8d0"/>
  </svg>`,
  { size: 64 },
);

const sparkTex = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13 Z" fill="#ffe27a"/>
    <path d="M16 8 L17.6 14.4 L24 16 L17.6 17.6 L16 24 L14.4 17.6 L8 16 L14.4 14.4 Z" fill="#ffffff"/>
  </svg>`,
  { size: 64 },
);

const flameTongue = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 63 C2 52 2 34 12 24 C10 16 14 8 18 1 C20 12 28 20 28 36 C28 50 22 58 16 63 Z" fill="#ff6a22"/>
    <path d="M16 58 C8 50 8 38 14 30 C13 24 15 18 18 12 C19 20 24 26 24 38 C24 48 20 54 16 58 Z" fill="#ffc23a"/>
    <path d="M16 52 C12 46 12 40 16 34 C20 40 20 46 16 52 Z" fill="#fff6c0"/>
  </svg>`,
  { size: 96 },
);

const filigreeBand = svg(
  `<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="20" fill="#d9a02a"/>
    <path d="M0 10 C10 0 20 0 30 10 C40 20 50 20 60 10 C70 0 80 0 90 10 C100 20 110 20 120 10" stroke="#fff0b0" stroke-width="2.4" fill="none"/>
    <circle cx="30" cy="10" r="2.4" fill="#4ff0d8"/>
    <circle cx="90" cy="10" r="2.4" fill="#4ff0d8"/>
    <path d="M0 2 H120 M0 18 H120" stroke="#8a5a14" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const sunEmblem = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#c98a1e"/>
    <circle cx="32" cy="32" r="27" fill="#ffd35a"/>
    <circle cx="32" cy="32" r="21" fill="none" stroke="#9a5f16" stroke-width="2.4"/>
    <path d="M32 9 L36 24 L51 20 L40 32 L51 44 L36 40 L32 55 L28 40 L13 44 L24 32 L13 20 L28 24 Z" fill="#ff6a22"/>
    <path d="M32 17 L35 28 L46 26 L38 32 L46 38 L35 36 L32 47 L29 36 L18 38 L26 32 L18 26 L29 28 Z" fill="#fff0b0"/>
    <circle cx="32" cy="32" r="5" fill="#4ff0d8"/>
    <circle cx="32" cy="32" r="2.4" fill="#e8fffb"/>
  </svg>`,
  { size: 128 },
);

// ---------- builder ----------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "phoenix", paintSize: 1024 });
  const R = rng(7);
  const BODY_R = 0.215;

  // plumage paints (cel-shaded, with hot gradient toward the belly)
  const breastPaint = paint((p, n) => {
    const t = smoothstep(0.55, 1.15, p.y);
    const base = mix("#ffb02e", "#ff6a22", t);
    const lit = n.dot(new THREE.Vector3(0.35, 0.8, 0.5).normalize()) > 0.1;
    return lit ? base : mix("#e0431f", "#a31a3a", t);
  });
  const backPaint = paint((p, n) => {
    const t = noise(p, 0.06, 3);
    const lit = n.dot(new THREE.Vector3(0.35, 0.8, 0.5).normalize()) > 0.1;
    const c = t > 0.55 ? "#ff7a22" : "#e8362a";
    return lit ? c : t > 0.55 ? "#e0431f" : "#a31a3a";
  });

  // ================= LEGS & TALONS =================
  // Standing pose: feet on y = 0, body about 0.95 m up.
  for (const s of [1, -1]) {
    const hip: [number, number, number] = [s * 0.13, 0.86, -0.02];
    const knee: [number, number, number] = [s * 0.17, 0.62, 0.07];
    const ankle: [number, number, number] = [s * 0.16, 0.12, -0.02];
    // feathered thigh
    b.capsule(hip, knee, [0.1, 0.075], ORANGE, { sides: 8 });
    // shin (gold scaled)
    b.rod(knee, ankle, [0.045, 0.036], DEEPGOLD, { sides: 6 });
    // shin plume tufts
    b.cards(
      [0.2, 0.4, 0.6].map((t) => ({
        at: [knee[0] + (ankle[0] - knee[0]) * t, knee[1] + (ankle[1] - knee[1]) * t, knee[2] + (ankle[2] - knee[2]) * t] as [number, number, number],
        axis: [s * 0.8, 0.2, 0.2] as [number, number, number],
      })) as never,
      flameFeather,
      { size: [0.07, 0.16], lean: 70, flow: [0, -1, -0.3], bend: 20, color: "#ff8a1f" },
    );
    // golden anklet rings
    b.part(new THREE.TorusGeometry(0.052, 0.012, 5, 10), GOLD, { at: [s * 0.16, 0.2, -0.015], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.048, 0.01, 5, 10), GOLD, { at: [s * 0.16, 0.3, -0.005], rotation: [90, 0, 0] });
    // foot pad
    b.capsule([s * 0.16, 0.05, -0.02], [s * 0.16, 0.05, 0.02], 0.05, DEEPGOLD, { sides: 6 });
    // three front toes + one back toe
    const toes: Array<[number, number]> = [
      [-0.3, 0.2],
      [0, 0.24],
      [0.3, 0.2],
    ];
    for (const [ang, len] of toes) {
      const tx = s * 0.16 + Math.sin(ang) * len;
      const tz = 0.02 + Math.cos(ang) * len;
      b.rod([s * 0.16, 0.04, 0.0], [tx, 0.032, tz], [0.032, 0.024], DEEPGOLD, { sides: 6 });
      b.spike([tx, 0.032, tz], [Math.sin(ang) * 0.5 * s * 0 + (tx - s * 0.16) * 0.5, -0.4, 1.0], 0.07, 0.024, PLUM, { sides: 6 });
      b.part(new THREE.SphereGeometry(0.026, 6, 4), GOLD, { at: [s * 0.16 + (tx - s * 0.16) * 0.55, 0.036, (tz + 0.0) * 0.55] });
    }
    b.rod([s * 0.16, 0.04, -0.03], [s * 0.16, 0.03, -0.17], [0.03, 0.022], DEEPGOLD, { sides: 6 });
    b.spike([s * 0.16, 0.03, -0.17], [0, -0.3, -1], 0.06, 0.022, PLUM, { sides: 6 });
  }

  // ================= BODY =================
  const body = b.loft(
    [
      { at: [0, 1.0, -0.38], w: 0.2, h: 0.2 },
      { at: [0, 0.98, -0.2], w: 0.36, h: 0.4 },
      { at: [0, 1.0, 0.0], w: 0.44, h: 0.48 },
      { at: [0, 1.07, 0.18], w: 0.4, h: 0.46 },
      { at: [0, 1.15, 0.3], w: 0.28, h: 0.34 },
    ],
    { color: breastPaint, sides: 10, caps: "round" },
  );
  // back mantle (darker crimson saddle)
  b.capsule([0, 1.12, -0.28], [0, 1.2, 0.12], [0.12, 0.17], backPaint, { sides: 8 });

  // chest ruff of down feathers
  const bodySurf = b.surface(body);
  const chestHits = bodySurf.scatter(140, { rng: R, minDist: 0.045, filter: (h) => h.n.z > 0.15 || h.n.y < -0.3 });
  b.cards(chestHits, downFeather, {
    size: [0.085, 0.12],
    lean: 62,
    bend: 25,
    vary: 0.25,
    rng: R,
    flow: [0, -1, -0.2],
    color: "#ffb02e",
  });
  const flankHits = bodySurf.scatter(120, { rng: R, minDist: 0.05, filter: (h) => Math.abs(h.n.x) > 0.5 });
  b.cards(flankHits, wingFeather, {
    size: [0.07, 0.17],
    lean: 75,
    bend: 25,
    vary: 0.25,
    rng: R,
    flow: [0, -0.4, -1],
    mirror: false,
    color: "#ff6a22",
  });

  // golden breast plate collar (filigree)
  b.lathe(
    [
      [0.1, 0],
      [0.19, 0.0],
      [0.2, 0.04],
      [0.17, 0.09],
      [0.11, 0.1],
    ],
    { at: [0, 1.21, 0.26], axis: [0, 0.55, 0.85], texture: filigreeBand as never, color: GOLD, segments: 12, smoothing: 0 } as never,
  );
  // sun emblem pendant on chest
  b.part(new THREE.CircleGeometry(0.075, 14), "#ffffff", {
    at: [0, 1.04, 0.44],
    dir: [0, -0.1, 1],
    axis: "z",
    texture: sunEmblem,
  });
  glow(b.part(new THREE.SphereGeometry(0.026, 8, 6), G_TEAL, { at: [0, 1.04, 0.455], scale: [1, 1, 0.5] }), 1.4);
  b.part(new THREE.TorusGeometry(0.08, 0.009, 5, 14), GOLD, { at: [0, 1.04, 0.435], rotation: [-5, 0, 0] });

  // ================= NECK & HEAD =================
  const neckPath = catmull(
    [
      [0, 1.12, 0.26],
      [0, 1.3, 0.38],
      [0, 1.5, 0.4],
      [0, 1.66, 0.34],
      [0, 1.78, 0.38],
    ],
    {},
  );
  const neck = b.sweep(neckPath, [0.14, 0.09, 0.075], breastPaint, { sides: 8, caps: "round", detail: 1 });
  // golden neck rings
  for (const t of [0.35, 0.62]) {
    const at = neckPath.at(t);
    const tan = neckPath.tangentAt(t);
    b.part(new THREE.TorusGeometry(0.1 - t * 0.03, 0.013, 5, 12), GOLD, { at: [at.x, at.y, at.z], dir: [tan.x, tan.y, tan.z], axis: "z" });
  }
  // neck ruff cards
  const neckHits = b.surface(neck).scatter(60, { rng: R, minDist: 0.045, filter: (h) => h.n.z < 0.6 });
  b.cards(neckHits, downFeather, { size: [0.06, 0.09], lean: 60, bend: 20, vary: 0.25, rng: R, flow: [0, -1, -0.3], color: "#ff9a2a" });

  // head
  const HEAD: [number, number, number] = [0, 1.82, 0.46];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), cel("#ff9a2a", "#e0431f"), {
    at: HEAD,
    scale: [0.105, 0.098, 0.12],
  });
  // cream cheek patches
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { at: [s * 0.075, 1.78, 0.5], scale: [0.04, 0.045, 0.055] });
  }
  // beak: upper & lower, hooked
  const beakUp = b.extrude(
    [
      [0, 0],
      [0.1, 0.0],
      [0.19, -0.03],
      [0.215, -0.085, "sharp"],
      [0.12, -0.05],
      [0.0, -0.05],
    ],
    { at: [0, 1.835, 0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: [0.06, 0.012], bevel: 0.006, color: cel(G_BEAK, "#c97a1c"), smoothing: 1 },
  );
  b.extrude(
    [
      [0, 0],
      [0.12, 0],
      [0.15, -0.02, "sharp"],
      [0.05, -0.04],
      [0, -0.035],
    ],
    { at: [0, 1.795, 0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: [0.04, 0.01], bevel: 0.004, color: cel("#e09a2a", "#a3561a") },
  );
  // nostrils
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.008, 5, 4), PLUM, { at: [s * 0.02, 1.835, 0.585] });
  void beakUp;

  // eyes: big anime eyes
  const EYE = animeEye({ iris: "#27dccb", irisLight: "#a8fff0", blush: false, brow: false });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD).at(s * 52, 8);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.062, 0.084], mirror: s > 0 });
  }
  // gold brow-crest circlet
  b.sweep(
    catmull(
      [
        [-0.1, 1.83, 0.42],
        [-0.07, 1.89, 0.52],
        [0, 1.905, 0.56],
        [0.07, 1.89, 0.52],
        [0.1, 1.83, 0.42],
      ],
      {},
    ),
    0.012,
    GOLD,
    { sides: 6 },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.026), G_TEAL, { at: [0, 1.905, 0.565], scale: [0.8, 1.2, 0.8] }), 1.5);

  // head crest: three curling flame plumes
  const crestBases: Array<[number, number, number, number]> = [
    [0, 1.9, 0.4, 1.0],
    [0.04, 1.89, 0.38, 0.85],
    [-0.04, 1.89, 0.38, 0.85],
    [0.075, 1.87, 0.37, 0.65],
    [-0.075, 1.87, 0.37, 0.65],
  ];
  for (const [cx, cy, cz, k] of crestBases) {
    const sx = Math.sign(cx);
    const path = bezier([cx, cy, cz], [cx + sx * 0.04, cy + 0.14 * k, cz - 0.05], [cx + sx * 0.08, cy + 0.2 * k, cz - 0.22 * k], [cx + sx * 0.12, cy + 0.14 * k, cz - 0.4 * k]);
    b.sweep(path, [0.022, 0.003], cel(G_FLAME, "#e0431f"), { sides: 5, caps: "point" });
    const frames = [0.35, 0.55, 0.75].map((t) => {
      const p = path.at(t);
      const tan = path.tangentAt(t);
      return { at: [p.x, p.y, p.z] as [number, number, number], axis: [tan.x, tan.y, tan.z] as [number, number, number] };
    });
    b.cards(frames as never, crestFeather, { size: [0.045, 0.12 * k], lean: 25, bend: 20, flow: [0, 0, -1], color: "#ffb02e", cross: true });
  }
  // cheek whisker plumes
  for (const s of [1, -1]) {
    const path = bezier([s * 0.09, 1.78, 0.42], [s * 0.15, 1.76, 0.36], [s * 0.19, 1.7, 0.26], [s * 0.2, 1.64, 0.12]);
    b.sweep(path, [0.016, 0.003], cel(AMBER as never, "#e0431f"), { sides: 5, caps: "point" });
    const p = path.at(0.7);
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [p.x, p.y, p.z] });
  }

  // ================= WINGS =================
  for (const s of [1, -1]) {
    const shoulder: [number, number, number] = [s * 0.2, 1.2, 0.05];
    const elbow: [number, number, number] = [s * 0.62, 1.42, -0.08];
    const wrist: [number, number, number] = [s * 1.12, 1.52, -0.18];
    const tip: [number, number, number] = [s * 1.55, 1.42, -0.3];

    // arm bones
    b.capsule(shoulder, elbow, [0.1, 0.07], cel("#e8362a", "#a31a3a"), { sides: 8 });
    b.capsule(elbow, wrist, [0.07, 0.05], cel("#e8362a", "#a31a3a"), { sides: 8 });
    b.capsule(wrist, tip, [0.05, 0.02], DEEPGOLD, { sides: 6 });
    // gold wing joint caps
    b.part(new THREE.SphereGeometry(0.075, 8, 6), GOLD, { at: elbow });
    b.part(new THREE.SphereGeometry(0.06, 8, 6), GOLD, { at: wrist });
    glow(b.part(new THREE.OctahedronGeometry(0.03), G_TEAL, { at: [wrist[0], wrist[1] + 0.05, wrist[2] + 0.04] }), 1.4);

    // coverts: shoulder -> wrist, three layered rows of cards
    const armPath = polyline([shoulder, elbow, wrist, tip]);
    const covertRows: Array<[number, number, number, number, string]> = [
      [0.14, 0.95, 0.12, 0.36, "#ffb02e"],
      [0.12, 0.8, 0.14, 0.4, "#ff8a1f"],
      [0.1, 0.7, 0.16, 0.44, "#e8362a"],
    ];
    covertRows.forEach(([w, endT, ln, , col], row) => {
      const n = 14 - row * 2;
      const frames = [];
      for (let i = 0; i < n; i++) {
        const t = 0.06 + (endT - 0.06) * (i / (n - 1));
        const p = armPath.at(t);
        frames.push({ at: [p.x, p.y - 0.03 * row, p.z - 0.02 - 0.03 * row] as [number, number, number], axis: [0, 0.25, -1] as [number, number, number] });
      }
      b.cards(frames as never, wingFeather, {
        size: [w, ln * 1.3 + 0.1 * (1 - row * 0.15)],
        lean: 20 + row * 10,
        bend: 25,
        vary: 0.12,
        rng: R,
        flow: [s * 0.3, -0.5, -1],
        mirror: s < 0,
        cross: false,
        color: col,
      });
    });

    // secondary flight feathers (extruded flame blades fanning backward)
    const nSec = 9;
    for (let i = 0; i < nSec; i++) {
      const t = 0.18 + (0.55 * i) / (nSec - 1);
      const root = armPath.at(t);
      const ang = (-0.15 + (i / (nSec - 1)) * 0.5) * s; // outward fan
      const len = 0.62 - 0.1 * Math.abs(i / (nSec - 1) - 0.4);
      const x0 = root.x,
        y0 = root.y - 0.02,
        z0 = root.z - 0.04;
      const dx = Math.sin(ang) * len * 0.55 * s * 0 + s * 0.12 * (i / nSec);
      const end: [number, number, number] = [x0 + dx, y0 - 0.1 - len * 0.18, z0 - len];
      const mid: [number, number, number] = [x0 + dx * 0.5, y0 + 0.04, z0 - len * 0.5];
      const path = bezier([x0, y0, z0], mid, [end[0], end[1] + 0.06, end[2] + len * 0.2], end);
      const col = i % 3 === 0 ? CRIMSON : i % 3 === 1 ? ORANGE : AMBER;
      b.sweep(path, [0.028, 0.004], col, { sides: 5, caps: "point", up: [0, 1, 0] });
      const mp = path.at(0.5);
      const mt = path.tangentAt(0.5);
      b.cards([{ at: [mp.x, mp.y, mp.z] as [number, number, number], axis: [mt.x, mt.y, mt.z] as [number, number, number] }] as never, wingFeather, {
        size: [0.14, len * 0.72],
        lean: 0,
        flow: [0, 1, 0.1],
        color: ["#ff8a1f", "#ffb02e", "#e8362a"][i % 3],
      });
    }

    // primary flight feathers: big extruded flame blades fanning out from the hand
    const nPrim = 9;
    for (let i = 0; i < nPrim; i++) {
      const u = i / (nPrim - 1);
      const rootP = armPath.at(0.72 + 0.28 * u);
      const dirAng = (-70 + u * 100) * (Math.PI / 180); // from sweeping back to pointing outward-forward
      const len = 0.85 - 0.2 * Math.abs(u - 0.45) + 0.12 * Math.sin(u * 3);
      const dx = s * Math.cos(dirAng + 1.2) * 0;
      const dir = new THREE.Vector3(s * (0.55 + 0.9 * u), -0.12 - 0.1 * (1 - u), -1.1 + 1.3 * u).normalize();
      const rootV: [number, number, number] = [rootP.x + dx, rootP.y, rootP.z - 0.02];
      const endV: [number, number, number] = [rootV[0] + dir.x * len, rootV[1] + dir.y * len + 0.05, rootV[2] + dir.z * len];
      const ctrl: [number, number, number] = [rootV[0] + dir.x * len * 0.55, rootV[1] + 0.08, rootV[2] + dir.z * len * 0.5];
      const path = bezier(rootV, ctrl, [ctrl[0] + dir.x * 0.1, ctrl[1] - 0.05, ctrl[2] + dir.z * 0.1], endV);
      const hot = i % 2 === 0;
      b.sweep(path, [0.03, 0.004], hot ? CRIMSON : ORANGE, { sides: 5, caps: "point", up: [0, 1, 0] });
      const frames = [0.3, 0.55, 0.8].map((t) => {
        const p = path.at(t);
        const tan = path.tangentAt(t);
        return { at: [p.x, p.y, p.z] as [number, number, number], axis: [tan.x, tan.y, tan.z] as [number, number, number] };
      });
      b.cards(frames as never, wingFeather, { size: [0.16 - 0.03 * u, len * 0.5], lean: 0, flow: [0, 1, 0.15], color: hot ? "#ff6a22" : "#ffb02e" });
      // ember tip glow
      glow(b.part(new THREE.OctahedronGeometry(0.022), G_HOT, { at: endV, scale: [0.8, 1.6, 0.8] }), 1.2);
    }

    // gold filigree wing-bracer along the forearm
    const bracerA = armPath.at(0.42);
    const bracerB = armPath.at(0.5);
    b.rod([bracerA.x, bracerA.y, bracerA.z], [bracerB.x, bracerB.y, bracerB.z], 0.082, GOLD, { sides: 8 });
    b.part(new THREE.TorusGeometry(0.086, 0.012, 5, 10), DEEPGOLD, {
      at: [bracerA.x, bracerA.y, bracerA.z],
      dir: [s, 0.2, -0.1],
      axis: "z",
    });
    b.part(new THREE.TorusGeometry(0.086, 0.012, 5, 10), DEEPGOLD, {
      at: [bracerB.x, bracerB.y, bracerB.z],
      dir: [s, 0.2, -0.1],
      axis: "z",
    });
    // wing claw
    b.spike(tip, [s, 0.1, 0.5], 0.09, 0.02, PLUM, { sides: 5 });
  }

  // ================= TAIL =================
  const tailBase: [number, number, number] = [0, 1.02, -0.36];
  // central tail core
  const tailCore = bezier(tailBase, [0, 1.05, -0.7], [0, 0.85, -1.0], [0, 0.55, -1.3]);
  b.sweep(tailCore, [0.08, 0.01], cel("#e8362a", "#a31a3a"), { sides: 6, caps: "round" });
  // long streaming tail feathers: fan of 9 with eye-spot textures
  const nTail = 9;
  for (let i = 0; i < nTail; i++) {
    const u = i / (nTail - 1) - 0.5; // -0.5..0.5
    const spread = u * 1.1;
    const len = 1.15 + 0.35 * (1 - Math.abs(u) * 2);
    const sideX = spread;
    const start: [number, number, number] = [u * 0.12, 1.02 - Math.abs(u) * 0.03, -0.38];
    const p1: [number, number, number] = [sideX * 0.35, 1.06 + 0.04 * Math.cos(i), -0.75];
    const p2: [number, number, number] = [sideX * 0.8 + u * 0.2, 0.8 - 0.05 * i * 0 - Math.abs(u) * 0.15, -1.1 - len * 0.25];
    const end: [number, number, number] = [sideX * 1.1 + u * 0.3, 0.12 + Math.abs(u) * 0.25 + (i % 2) * 0.08, -0.38 - len];
    const path = bezier(start, p1, p2, end);
    const col = i % 3 === 0 ? CRIMSON : i % 3 === 1 ? ORANGE : AMBER;
    b.sweep(path, [0.03, 0.004], col, { sides: 5, caps: "point", up: [0, 1, 0] });
    const frames = [0.35, 0.58, 0.8].map((t) => {
      const p = path.at(t);
      const tan = path.tangentAt(t);
      return { at: [p.x, p.y, p.z] as [number, number, number], axis: [tan.x, tan.y, tan.z] as [number, number, number] };
    });
    b.cards(frames as never, tailFeather, {
      size: [0.24 - Math.abs(u) * 0.08, len * 0.52],
      lean: 0,
      flow: [0, 1, 0.1],
      color: ["#ff6a22", "#ffb02e", "#e8362a"][i % 3],
    });
    glow(b.part(new THREE.OctahedronGeometry(0.03), G_HOT, { at: end, scale: [0.8, 1.8, 0.8] }), 1.2);
  }
  // tail cuff & base gold
  b.part(new THREE.TorusGeometry(0.1, 0.018, 5, 12), GOLD, { at: [0, 1.01, -0.42], dir: [0, 0.1, 1], axis: "z" });
  // rump plume cards
  const rumpHits = b.surface(body).scatter(70, { rng: R, minDist: 0.05, filter: (h) => h.n.z < -0.25 });
  b.cards(rumpHits, flameFeather, { size: [0.08, 0.2], lean: 70, bend: 25, vary: 0.25, rng: R, flow: [0, -0.3, -1], color: "#ff6a22" });

  // ================= FLAME HALO & EMBERS =================
  // rising flame tongues around the shoulders and drifting sparks
  const tongueFrames = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rad = 0.5 + 0.3 * R();
    tongueFrames.push({
      at: [Math.sin(a) * rad, 0.95 + 0.5 * R(), Math.cos(a) * rad * 0.8 - 0.1] as [number, number, number],
      axis: [Math.sin(a) * 0.3, 1, Math.cos(a) * 0.2] as [number, number, number],
    });
  }
  glow(
    b.cards(tongueFrames as never, flameTongue, { size: [0.1, 0.24], lean: 0, flow: [0, 0, 1], vary: 0.3, rng: R, cross: true }),
    1.1,
  );
  const sparkFrames = [];
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const rad = 0.3 + 0.9 * R();
    sparkFrames.push({
      at: [Math.sin(a) * rad, 0.6 + 1.5 * R(), Math.cos(a) * rad - 0.2] as [number, number, number],
      axis: [0, 1, 0] as [number, number, number],
    });
  }
  glow(b.cards(sparkFrames as never, sparkTex, { size: [0.05, 0.05], lean: 0, flow: [0, 0, 1], vary: 0.4, rng: R, cross: true }), 1.4);

  // gradient flame blush at the base of the tail core to read as heat
  void gradient;
  void inkLines;
  void INK;
  void CREAM;
  void PLUM;
  void BODY_R;
  void G_GOLD;
  void G_RED;

  return b.root;
}
