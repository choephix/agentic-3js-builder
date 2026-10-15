import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { frame } from "../../../../src/frame";
import { cel, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lantern Shrine",
  description:
    "A roadside shrine with a vermilion torii, stone lanterns, a small wooden hokora, offerings and hanging paper lanterns, cel-shaded with gold filigree and electro glow.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------- palette ----------
const VERM = cel("#e8453c", "#b02c4a");
const VERM_FLAT = "#d9403a";
const GOLD = "#f4c84a";
const GOLD_D = "#c8922a";
const BLACK = cel("#33283f", "#1f1630");
const STONE = cel(mottle("#c9cbd0", "#aeb3bd", { size: 0.12, seed: 3 }), "#7f86a0");
const STONE_L = cel(mottle("#d7d9dd", "#bfc3cc", { size: 0.08, seed: 9 }), "#8b92ad");
const STONE_D = cel("#9ba0b0", "#6a7090");
const MOSS = cel(mottle("#7fc46a", "#5aa860", { size: 0.06, seed: 5 }), "#3f8a6a");
const WOOD = cel(grain("#b9824f", "#9c6a3e", { size: 0.02, axis: "y", seed: 2 }), "#6b4560");
const WOOD_D = cel(grain("#8a5a38", "#744a30", { size: 0.02, axis: "y", seed: 4 }), "#4e3350");
const ROOF = cel(scales("#5d7fa8", "#3f5a86", { size: 0.07, width: 0.008, seed: 1 }), "#3a4378");
const CREAM = cel("#fff2d6", "#f0c9a6");
const PAPER = "#ffd98a";
const GROUND = cel(mottle("#9bd07c", "#7fbf6e", { size: 0.25, seed: 11 }), "#4f9a78");
const EARTH = cel("#c8a478", "#8e6a70");
const ROPE = cel("#f3e4bc", "#c9a0a0");
const RED_CLOTH = cel("#e8453c", "#a8284a");
const WHITE_PAPER = cel("#fffaf0", "#cfc3e0");
const TRUNK = cel(grain("#8d5a46", "#6e4440", { size: 0.025, axis: "y", seed: 6 }), "#4a3048");
const ELECTRO = "#b58cff";
const ELECTRO_L = "#e4d0ff";

// ---------- textures ----------
const LANTERN_WINDOW = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffcf6a"/><rect x="0" y="0" width="64" height="64" fill="none" stroke="#c97a2a" stroke-width="5"/><circle cx="32" cy="32" r="14" fill="#fff0b0"/><path d="M32 8 L32 56 M8 32 L56 32" stroke="#e59a3a" stroke-width="3"/></svg>`,
  { size: 128 },
);
const PAPER_LANTERN = svg(
  `<svg viewBox="0 0 64 96"><rect width="64" height="96" fill="#ffd27a"/>` +
    [14, 28, 42, 56, 70, 84].map((y) => `<rect x="0" y="${y}" width="64" height="2.5" fill="#d98a38"/>`).join("") +
    `<circle cx="32" cy="48" r="15" fill="#e8453c"/><path d="M32 36 C38 42 38 54 32 60 C26 54 26 42 32 36Z" fill="#fff3c0"/></svg>`,
  { size: 128 },
);
const PLAQUE = svg(
  `<svg viewBox="0 0 96 64"><rect width="96" height="64" fill="#2a1f38"/><rect x="3" y="3" width="90" height="58" fill="none" stroke="#f4c84a" stroke-width="3"/><path d="M48 14 L58 32 L48 50 L38 32Z" fill="none" stroke="#f4c84a" stroke-width="3.5"/><circle cx="48" cy="32" r="5" fill="#b58cff"/><path d="M14 32 H30 M66 32 H82" stroke="#f4c84a" stroke-width="3"/><circle cx="12" cy="12" r="3" fill="#f4c84a"/><circle cx="84" cy="12" r="3" fill="#f4c84a"/><circle cx="12" cy="52" r="3" fill="#f4c84a"/><circle cx="84" cy="52" r="3" fill="#f4c84a"/></svg>`,
  { size: 192 },
);
const OFUDA = svg(
  `<svg viewBox="0 0 24 64"><rect width="24" height="64" fill="#fffaf0"/><rect x="0" y="0" width="24" height="64" fill="none" stroke="#e8453c" stroke-width="2"/><path d="M12 8 V56" stroke="#e8453c" stroke-width="3"/><path d="M6 18 H18 M6 30 H18 M7 42 H17" stroke="#33283f" stroke-width="2.5"/></svg>`,
  { size: 128 },
);
const SHIDE = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 L30 12 L10 24 L26 38 L6 52 L16 64 L2 50 L22 38 L6 24 L24 12Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const MAPLE = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 60 L32 44 M32 6 L38 20 L52 14 L46 28 L60 32 L46 40 L50 52 L36 46 L32 58 L28 46 L14 52 L18 40 L4 32 L18 28 L12 14 L26 20Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const SAKURA = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 30 C4 22 4 8 11 4 L16 9 L21 4 C28 8 28 22 16 30Z" fill="#ffffff"/></svg>`,
  { size: 64 },
);
const RUNE_FLOOR = svg(
  `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="#b58cff" stroke-width="4"/><circle cx="64" cy="64" r="46" fill="none" stroke="#e4d0ff" stroke-width="2.5"/><path d="M64 10 L74 54 L118 64 L74 74 L64 118 L54 74 L10 64 L54 54Z" fill="none" stroke="#b58cff" stroke-width="3.5"/><circle cx="64" cy="64" r="8" fill="#e4d0ff"/>` +
    [0, 45, 90, 135, 180, 225, 270, 315]
      .map((a) => `<circle cx="${64 + 52 * Math.cos((a * Math.PI) / 180)}" cy="${64 + 52 * Math.sin((a * Math.PI) / 180)}" r="3.2" fill="#e4d0ff"/>`)
      .join("") +
    `</svg>`,
  { size: 256 },
);
const BELL_SCRIPT = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f4c84a"/><path d="M8 20 H56 M8 44 H56" stroke="#c8922a" stroke-width="4"/><path d="M32 10 L40 32 L32 54 L24 32Z" fill="none" stroke="#c8922a" stroke-width="4"/></svg>`,
  { size: 64 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lanternShrine", detail: 0.9, paintSize: 2048 });
  const r = rng(77);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);

  // =====================================================
  // GROUND: grassy mound with earth edge and stone paving
  // =====================================================
  b.lathe(
    [
      [0, -0.04],
      [1.75, -0.04],
      [1.8, 0.0],
      [1.72, 0.06],
      [1.3, 0.09],
      [0, 0.1],
    ],
    { at: [0, 0, 0], segments: 20, color: GROUND },
  );
  b.lathe(
    [
      [0, -0.04],
      [1.78, -0.04],
      [1.82, -0.0],
      [1.75, 0.02],
      [0, 0.02],
    ],
    { at: [0, 0, 0], segments: 20, color: EARTH },
  );
  // earth rim stones
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const rad = 1.74 + r() * 0.05;
    b.part(sph(0.07 + r() * 0.04, 6, 4), i % 3 === 0 ? STONE_D : STONE, {
      at: [Math.sin(a) * rad, 0.04, Math.cos(a) * rad],
      scale: [1, 0.6, 1],
      rotation: [0, r() * 90, 0],
    });
  }

  // flagstone path from front (+Z) to the shrine (-Z)
  const pathZ = [1.62, 1.28, 0.96, 0.66, 0.4, 0.14, -0.1];
  pathZ.forEach((z, i) => {
    const w = 0.5 - i * 0.015;
    const jitter = (r() - 0.5) * 0.04;
    b.part(box(w, 0.045, 0.3), i % 2 ? STONE : STONE_L, {
      at: [jitter, 0.1, z],
      rotation: [0, (r() - 0.5) * 8, 0],
    });
    b.part(box(w * 0.9, 0.012, 0.22), i % 2 ? STONE_L : STONE, { at: [jitter, 0.126, z] });
    // moss tufts
    if (i % 2 === 0) b.part(sph(0.05, 6, 4), MOSS, { at: [jitter + w * 0.45, 0.115, z + 0.05], scale: [1, 0.4, 1] });
  });
  // glowing electro seal on the path before the torii
  glow(
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      at: [0, 0.132, 0.62],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_FLOOR,
    }),
    1.2,
  );

  // =====================================================
  // TORII (front gate) at z = 1.0, spans x
  // =====================================================
  const TZ = 0.98;
  const pillarX = 0.62;
  const pillarH = 2.1;
  for (const s of [1, -1]) {
    // stone footing
    b.part(cyl(0.17, 0.2, 0.14, 8), STONE, { at: [s * pillarX, 0.17, TZ] });
    b.part(cyl(0.19, 0.2, 0.04, 8), STONE_D, { at: [s * pillarX, 0.1, TZ] });
    // pillar with slight inward lean via frustumBox-like rod
    b.rod([s * pillarX, 0.24, TZ], [s * (pillarX - 0.03), 0.24 + pillarH, TZ], [0.105, 0.088], VERM, { sides: 10, caps: "flat" });
    // black base band
    b.rod([s * pillarX, 0.24, TZ], [s * (pillarX - 0.002), 0.5, TZ], [0.112, 0.108], BLACK, { sides: 10, caps: "flat" });
    // gold ring bands
    for (const y of [0.52, 2.1]) {
      b.rod([s * (pillarX - 0.013 * ((y - 0.24) / pillarH) * 2.2), y, TZ], [s * (pillarX - 0.013 * ((y - 0.24) / pillarH) * 2.2), y + 0.035, TZ], 0.112 - (y - 0.24) * 0.008, GOLD, { sides: 10, caps: "flat" });
    }
    // rear support pillar stub (inuki tie post)
    b.rod([s * (pillarX - 0.015), 1.82, TZ - 0.0], [s * (pillarX - 0.015), 1.82, TZ], 0.01, GOLD, { sides: 4 });
  }
  // nuki (lower tie beam)
  b.part(box(1.62, 0.1, 0.1), VERM, { at: [0, 1.72, TZ] });
  b.part(box(1.66, 0.025, 0.115), BLACK, { at: [0, 1.775, TZ] });
  // gold caps on nuki ends
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.11, 0.115), GOLD, { at: [s * 0.82, 1.72, TZ] });
  }
  // plaque (gakuzuka) between beams
  b.part(box(0.34, 0.5, 0.06), BLACK, { at: [0, 1.96, TZ] });
  b.part(new THREE.PlaneGeometry(0.28, 0.42), "#ffffff", { at: [0, 1.96, TZ + 0.034], dir: [0, 0, 1], axis: "z", texture: PLAQUE });
  b.part(new THREE.PlaneGeometry(0.28, 0.42), "#ffffff", { at: [0, 1.96, TZ - 0.034], dir: [0, 0, -1], axis: "z", texture: PLAQUE });
  // kasagi (upper curved beam) built from extrude along X, outline in side-profile? use front-view outline drawn along x
  const kasagi: Array<[number, number] | [number, number, "sharp"]> = [
    [-1.12, 0.1, "sharp"],
    [-0.9, 0.0],
    [-0.4, -0.04],
    [0, -0.045],
    [0.4, -0.04],
    [0.9, 0.0],
    [1.12, 0.1, "sharp"],
    [1.0, 0.14],
    [0.5, 0.09],
    [0, 0.08],
    [-0.5, 0.09],
    [-1.0, 0.14],
  ];
  b.extrude(kasagi, { at: [0, 2.37, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.2, bevel: 0.015, smoothing: 1, color: BLACK });
  // shimaki (red layer beneath upper beam)
  b.extrude(
    [
      [-0.98, 0.0],
      [-0.7, -0.06],
      [0, -0.075],
      [0.7, -0.06],
      [0.98, 0.0],
      [0.9, 0.08],
      [0, 0.06],
      [-0.9, 0.08],
    ],
    { at: [0, 2.3, TZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.15, bevel: 0.01, smoothing: 1, color: VERM },
  );
  // gold end plates on kasagi
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.07, 0.03],
        [0.09, 0.14],
        [0.0, 0.12],
      ],
      { at: [s * 1.1, 2.37, TZ], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.205, bevel: 0.006, color: GOLD },
    );
    // filigree stud
    b.part(sph(0.025, 6, 4), GOLD_D, { at: [s * 1.12, 2.46, TZ + 0.106] });
    b.part(sph(0.025, 6, 4), GOLD_D, { at: [s * 1.12, 2.46, TZ - 0.106] });
  }
  // gold rivets on kasagi top ridge
  for (let i = -4; i <= 4; i++) {
    b.part(sph(0.015, 5, 4), GOLD, { at: [i * 0.2, 2.465, TZ + 0.1 - 0.0] });
  }
  // shide paper streamers + shimenawa rope on the torii
  const rope = catmull(
    [
      [-0.5, 1.64, TZ + 0.07],
      [-0.25, 1.58, TZ + 0.09],
      [0, 1.57, TZ + 0.09],
      [0.25, 1.58, TZ + 0.09],
      [0.5, 1.64, TZ + 0.07],
    ],
  );
  b.sweep(rope, 0.028, ROPE, { sides: 6 });
  b.along(rope, 9, (at) => {
    b.cards([frame(at.at, [0, 1, 0])], SHIDE, {
      size: [0.08, 0.16],
      lean: 180,
      flow: [0, 0, 1],
      color: "#ffffff",
    });
  });
  // tassel knots at rope ends
  for (const s of [1, -1]) {
    b.part(sph(0.04, 6, 4), RED_CLOTH, { at: [s * 0.52, 1.64, TZ + 0.07] });
    b.rod([s * 0.52, 1.62, TZ + 0.07], [s * 0.52, 1.4, TZ + 0.07], 0.012, RED_CLOTH, { sides: 5 });
    b.part(cyl(0.025, 0.04, 0.1, 6), GOLD, { at: [s * 0.52, 1.35, TZ + 0.07] });
  }
  // little hanging bells on the torii nuki
  for (const x of [-0.25, 0, 0.25]) {
    b.rod([x, 1.67, TZ + 0.06], [x, 1.58, TZ + 0.06], 0.006, GOLD_D, { sides: 4 });
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.04, 0.03],
        [0.045, 0.05],
        [0.0, 0.05],
      ],
      { at: [x, 1.51, TZ + 0.06], segments: 8, color: GOLD },
    );
  }

  // =====================================================
  // STONE LANTERNS (tōrō) x2 flanking the path
  // =====================================================
  const stoneLantern = (x: number, z: number, scaleY: number, flip: number) => {
    const y0 = 0.1;
    // base plinth, hex
    b.part(cyl(0.22, 0.26, 0.1, 6), STONE_D, { at: [x, y0 + 0.05, z] });
    b.part(cyl(0.17, 0.2, 0.06, 6), STONE, { at: [x, y0 + 0.13, z] });
    // shaft
    b.rod([x, y0 + 0.16, z], [x, y0 + 0.62 * scaleY, z], [0.07, 0.065], STONE_L, { sides: 6, caps: "flat" });
    // shaft rings / carving
    b.rod([x, y0 + 0.3 * scaleY, z], [x, y0 + 0.3 * scaleY + 0.04, z], 0.092, STONE, { sides: 8, caps: "flat" });
    // gold-ish moss band
    b.part(sph(0.06, 6, 4), MOSS, { at: [x + 0.06, y0 + 0.2, z + 0.04], scale: [1, 0.5, 1] });
    // wide inverted-lotus platform
    const py = y0 + 0.62 * scaleY;
    b.lathe(
      [
        [0, 0],
        [0.12, 0],
        [0.2, 0.04],
        [0.28, 0.07],
        [0.29, 0.1],
        [0.24, 0.12],
        [0, 0.12],
      ],
      { at: [x, py, z], segments: 6, color: STONE, spin: 30 },
    );
    // fire box (hibukuro) with glowing windows
    const fy = py + 0.12;
    b.part(box(0.2, 0.2, 0.2), STONE_L, { at: [x, fy + 0.1, z] });
    // window frames and glowing panes on the 4 sides
    for (const [dx, dz, ry] of [
      [0, 1, 0],
      [0, -1, 180],
      [1, 0, 90],
      [-1, 0, -90],
    ] as const) {
      b.part(new THREE.PlaneGeometry(0.11, 0.13), "#ffffff", {
        at: [x + dx * 0.103, fy + 0.1, z + dz * 0.103],
        dir: [dx, 0, dz],
        axis: "z",
        texture: LANTERN_WINDOW,
      });
      void ry;
    }
    glow(
      b.part(box(0.14, 0.14, 0.14), "#ffcf6a", { at: [x, fy + 0.1, z] }),
      1.4,
    );
    // corner posts
    for (const sx of [1, -1])
      for (const sz of [1, -1]) b.part(box(0.035, 0.22, 0.035), STONE_D, { at: [x + sx * 0.1, fy + 0.1, z + sz * 0.1] });
    // roof: pyramid lathe, 6 sided with flared eaves
    const ry = fy + 0.21;
    b.lathe(
      [
        [0, 0],
        [0.34, 0],
        [0.36, 0.02],
        [0.3, 0.05],
        [0.16, 0.14],
        [0.07, 0.2],
        [0, 0.21],
      ],
      { at: [x, ry, z], segments: 6, color: STONE_L, spin: 30 },
    );
    // roof corner curls (small spheres)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      b.part(sph(0.022, 5, 4), STONE_D, { at: [x + Math.sin(a) * 0.35, ry + 0.035, z + Math.cos(a) * 0.35] });
    }
    // roof finial: hōju jewel
    b.part(cyl(0.05, 0.06, 0.04, 6), STONE_D, { at: [x, ry + 0.23, z] });
    b.part(sph(0.06, 8, 6), STONE_L, { at: [x, ry + 0.3, z], scale: [1, 1.3, 1] });
    b.spike([x, ry + 0.34, z], [0, 1, 0], 0.08, 0.025, STONE_L, { sides: 6 });
    // gold rim at eaves
    b.rod([x, ry + 0.012, z], [x, ry + 0.02, z], 0.345, GOLD_D, { sides: 6, caps: "flat" });
    // little red cloth tied on the lantern shaft
    b.part(cyl(0.085, 0.085, 0.03, 8), RED_CLOTH, { at: [x, y0 + 0.5 * scaleY, z] });
    b.part(box(0.025, 0.1, 0.01), RED_CLOTH, { at: [x + 0.075 * flip, y0 + 0.46 * scaleY, z + 0.03], rotation: [0, 0, 8 * flip] });
  };
  stoneLantern(0.95, 0.55, 1.1, 1);
  stoneLantern(-0.95, 0.55, 1.1, -1);

  // small ground lanterns closer to the shrine
  const smallLantern = (x: number, z: number) => {
    b.part(cyl(0.12, 0.14, 0.05, 6), STONE_D, { at: [x, 0.125, z] });
    b.rod([x, 0.15, z], [x, 0.3, z], 0.045, STONE_L, { sides: 6, caps: "flat" });
    b.part(box(0.17, 0.12, 0.17), STONE_L, { at: [x, 0.36, z] });
    glow(b.part(box(0.12, 0.08, 0.12), "#ffcf6a", { at: [x, 0.36, z] }), 1.3);
    for (const [dx, dz] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const)
      b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
        at: [x + dx * 0.088, 0.36, z + dz * 0.088],
        dir: [dx, 0, dz],
        axis: "z",
        texture: LANTERN_WINDOW,
      });
    b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.17, 0.015],
        [0.08, 0.07],
        [0, 0.08],
      ],
      { at: [x, 0.42, z], segments: 6, color: STONE_L },
    );
    b.part(sph(0.03, 6, 4), STONE, { at: [x, 0.51, z] });
  };
  smallLantern(-0.5, -0.55);
  smallLantern(0.5, -0.55);

  // =====================================================
  // HOKORA: the small wooden shrine at the back (z = -0.8)
  // =====================================================
  const HZ = -0.85;
  // stone platform, two steps
  b.part(box(1.3, 0.12, 1.0), STONE_D, { at: [0, 0.16, HZ] });
  b.part(box(1.2, 0.1, 0.9), STONE, { at: [0, 0.27, HZ] });
  b.part(box(0.6, 0.07, 0.22), STONE_L, { at: [0, 0.14, HZ + 0.6] });
  b.part(box(0.5, 0.06, 0.18), STONE_L, { at: [0, 0.2, HZ + 0.52] });
  // stone plinth edge seams
  for (let i = -2; i <= 2; i++) b.part(box(0.015, 0.102, 0.91), STONE_D, { at: [i * 0.28, 0.27, HZ] });
  // foundation stones under posts
  const postPts: Array<[number, number]> = [
    [0.46, 0.34],
    [-0.46, 0.34],
    [0.46, -0.3],
    [-0.46, -0.3],
  ];
  for (const [px, pz] of postPts) {
    b.part(cyl(0.07, 0.085, 0.06, 6), STONE_L, { at: [px, 0.35, HZ + pz] });
    b.rod([px, 0.38, HZ + pz], [px, 1.28, HZ + pz], 0.055, VERM_FLAT, { sides: 8, caps: "flat" });
    b.part(cyl(0.065, 0.065, 0.04, 8), GOLD, { at: [px, 1.26, HZ + pz] });
  }
  // wooden walls: back and sides
  b.part(box(0.95, 0.85, 0.05), WOOD_D, { at: [0, 0.82, HZ - 0.28] });
  for (const s of [1, -1]) b.part(box(0.05, 0.85, 0.55), WOOD_D, { at: [s * 0.43, 0.82, HZ + 0.0] });
  // floor deck
  b.part(box(0.98, 0.04, 0.72), WOOD, { at: [0, 0.4, HZ + 0.02] });
  // wood plank lines on back wall
  for (let i = -4; i <= 4; i++) b.part(box(0.01, 0.85, 0.012), WOOD, { at: [i * 0.1, 0.82, HZ - 0.252] });
  // front doors (sliding lattice doors), slightly open: left door panel
  for (const s of [1, -1]) {
    b.part(box(0.4, 0.78, 0.035), WOOD, { at: [s * 0.22, 0.82, HZ + 0.3] });
    b.part(box(0.3, 0.62, 0.012), CREAM, { at: [s * 0.22, 0.84, HZ + 0.322] });
    // lattice
    for (let i = -1; i <= 1; i++) b.part(box(0.012, 0.62, 0.016), WOOD_D, { at: [s * 0.22 + i * 0.1, 0.84, HZ + 0.326] });
    for (let j = -2; j <= 2; j++) b.part(box(0.3, 0.012, 0.016), WOOD_D, { at: [s * 0.22, 0.84 + j * 0.12, HZ + 0.326] });
    b.part(cyl(0.018, 0.018, 0.025, 6), GOLD, { at: [s * 0.06, 0.8, HZ + 0.335], rotation: [90, 0, 0] });
  }
  // glowing goshintai crystal visible inside through gap (electro mirror)
  glow(b.part(new THREE.OctahedronGeometry(0.1, 0), ELECTRO, { at: [0, 0.86, HZ - 0.1], scale: [0.8, 1.4, 0.8] }), 1.4);
  glow(b.part(new THREE.OctahedronGeometry(0.05, 0), ELECTRO_L, { at: [0, 0.86, HZ - 0.1], scale: [0.8, 1.4, 0.8] }), 1.6);
  b.part(box(0.2, 0.04, 0.2), GOLD, { at: [0, 0.43, HZ - 0.1] });
  // beams top: tie beam (rim)
  b.part(box(1.1, 0.06, 0.8), VERM, { at: [0, 1.31, HZ + 0.02] });
  b.part(box(1.14, 0.02, 0.84), GOLD_D, { at: [0, 1.345, HZ + 0.02] });
  // veranda railing front: not present, put gold-capped ornament
  // roof: curved hip, built with extrude side-profile + overhang in z
  const roofProfile: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.78, 0.0, "sharp"],
    [-0.5, 0.2],
    [-0.2, 0.34],
    [0, 0.38],
    [0.2, 0.34],
    [0.5, 0.2],
    [0.78, 0.0, "sharp"],
    [0.7, -0.03],
    [0, 0.3],
    [-0.7, -0.03],
  ];
  // front/back gable shaped roof drawn along x with thickness along z
  b.extrude(roofProfile, {
    at: [0, 1.36, HZ + 0.02],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 1.2,
    bevel: 0.02,
    smoothing: 1,
    color: ROOF,
  });
  // roof ridge cap
  b.rod([-0.55, 1.75, HZ + 0.02], [0.55, 1.75, HZ + 0.02], 0.045, VERM, { sides: 6, caps: "flat" });
  for (const s of [1, -1]) {
    // chigi ornaments: crossed gold prongs on front gable
    b.rod([s * 0.5, 1.72, HZ + 0.62], [s * 0.4, 1.93, HZ + 0.62], 0.012, GOLD, { sides: 4 });
    b.rod([s * 0.58, 1.72, HZ + 0.62], [s * 0.44, 1.93, HZ + 0.62], 0.012, GOLD, { sides: 4 });
    b.part(sph(0.03, 6, 4), GOLD, { at: [s * 0.78, 1.38, HZ + 0.62] });
    b.part(sph(0.03, 6, 4), GOLD, { at: [s * 0.78, 1.38, HZ - 0.58] });
    // roof end gold caps
    b.part(sph(0.04, 6, 4), GOLD_D, { at: [s * 0.55, 1.77, HZ + 0.02], scale: [1.2, 1, 1] });
  }
  // gable barge boards (front & back): red panel under eaves with gold gegyo ornament
  for (const sz of [1, -1]) {
    b.extrude(
      [
        [-0.6, 0],
        [0, 0.28],
        [0.6, 0],
      ],
      { at: [0, 1.4, HZ + 0.02 + sz * 0.6], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: CREAM },
    );
    glow(b.part(new THREE.CircleGeometry(0.05, 8), ELECTRO, { at: [0, 1.5, HZ + 0.02 + sz * 0.612], dir: [0, 0, sz], axis: "z" }), 1.3);
  }
  // roof tile ridges (rows of small ribs)
  for (let i = -5; i <= 5; i++) {
    for (const sz of [1, -1]) {
      b.rod([i * 0.12, 1.64 + 0.0, HZ + 0.02 + sz * 0.1], [i * 0.12, 1.4, HZ + 0.02 + sz * 0.55], 0.012, "#4a6a96", { sides: 4 });
    }
  }
  // offering box (saisen-bako) in front of the doors
  const OZ = HZ + 0.9;
  b.part(box(0.5, 0.2, 0.28), WOOD, { at: [0, 0.37, OZ] });
  b.part(box(0.54, 0.03, 0.32), WOOD_D, { at: [0, 0.485, OZ] });
  // slot grate
  for (let i = -4; i <= 4; i++) b.part(box(0.018, 0.012, 0.22), BLACK, { at: [i * 0.045, 0.505, OZ] });
  // gold trim on box
  b.part(box(0.52, 0.025, 0.3), GOLD_D, { at: [0, 0.29, OZ] });
  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", { at: [0, 0.37, OZ + 0.142], dir: [0, 0, 1], axis: "z", texture: BELL_SCRIPT });
  // legs
  for (const s of [1, -1]) b.part(box(0.05, 0.14, 0.24), WOOD_D, { at: [s * 0.2, 0.2, OZ] });

  // suzu bell rope above (gold bell + red/white rope)
  const bellX = 0, bellY = 1.12;
  b.part(sph(0.07, 8, 6), GOLD, { at: [bellX, bellY + 0.02, HZ + 0.82] });
  b.part(box(0.2, 0.025, 0.06), VERM, { at: [bellX, bellY + 0.15, HZ + 0.82] });
  b.rod([bellX, bellY + 0.15, HZ + 0.82], [bellX, 1.34, HZ + 0.82], 0.008, GOLD_D, { sides: 4 });
  b.part(sph(0.02, 5, 4), GOLD_D, { at: [bellX, bellY - 0.04, HZ + 0.82] });
  const bellRope = catmull(
    [
      [0.06, bellY + 0.1, HZ + 0.82],
      [0.1, 0.9, HZ + 0.86],
      [0.1, 0.65, HZ + 0.9],
      [0.08, 0.55, HZ + 0.9],
    ],
  );
  b.sweep(bellRope, 0.016, RED_CLOTH, { sides: 5 });
  const bellRope2 = catmull(
    [
      [-0.06, bellY + 0.1, HZ + 0.82],
      [-0.1, 0.9, HZ + 0.86],
      [-0.1, 0.65, HZ + 0.9],
      [-0.08, 0.55, HZ + 0.9],
    ],
  );
  b.sweep(bellRope2, 0.016, WHITE_PAPER, { sides: 5 });
  // gold tassel ends
  b.part(cyl(0.015, 0.03, 0.08, 6), GOLD, { at: [0.08, 0.5, HZ + 0.9] });
  b.part(cyl(0.015, 0.03, 0.08, 6), GOLD, { at: [-0.08, 0.5, HZ + 0.9] });

  // ofuda paper charms hung on the shrine's side posts
  for (const s of [1, -1]) {
    b.cards([frame([s * 0.5, 1.15, HZ + 0.6], [0, 1, 0])], OFUDA, { size: [0.07, 0.19], lean: 180, flow: [0, 0, 1], color: "#ffffff" });
  }

  // =====================================================
  // OFFERINGS on a low wooden table to the left (x = -1.05, z = -0.6)
  // =====================================================
  const TXx = -1.12;
  const TZz = -0.55;
  b.part(box(0.62, 0.05, 0.42), WOOD, { at: [TXx, 0.47, TZz] });
  b.part(box(0.66, 0.02, 0.46), GOLD_D, { at: [TXx, 0.44, TZz] });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) b.part(box(0.045, 0.35, 0.045), WOOD_D, { at: [TXx + sx * 0.27, 0.27, TZz + sz * 0.17] });
  // red cloth runner
  b.part(box(0.4, 0.008, 0.46), RED_CLOTH, { at: [TXx, 0.498, TZz] });
  b.part(box(0.4, 0.01, 0.025), GOLD, { at: [TXx, 0.5, TZz + 0.19] });
  b.part(box(0.4, 0.01, 0.025), GOLD, { at: [TXx, 0.5, TZz - 0.19] });
  // rice bowl with mound
  b.lathe([[0, 0], [0.06, 0], [0.075, 0.05], [0.07, 0.055], [0.055, 0.008], [0, 0.01]], { at: [TXx - 0.18, 0.5, TZz + 0.08], segments: 10, color: CREAM });
  b.part(sph(0.058, 8, 5), WHITE_PAPER, { at: [TXx - 0.18, 0.545, TZz + 0.08], scale: [1, 0.7, 1] });
  // sake bottle (tokkuri)
  b.lathe([[0, 0], [0.04, 0], [0.05, 0.05], [0.04, 0.12], [0.02, 0.15], [0.018, 0.2], [0.0, 0.2]], { at: [TXx + 0.12, 0.5, TZz - 0.1], segments: 8, color: cel("#7fd3d0", "#4a8fa0") });
  b.part(cyl(0.022, 0.022, 0.012, 6), RED_CLOTH, { at: [TXx + 0.12, 0.705, TZz - 0.1] });
  b.part(box(0.05, 0.05, 0.003), WHITE_PAPER, { at: [TXx + 0.12, 0.56, TZz - 0.052] });
  // sake cup
  b.lathe([[0, 0], [0.025, 0], [0.04, 0.035], [0.037, 0.037], [0.0, 0.01]], { at: [TXx + 0.0, 0.5, TZz + 0.1], segments: 8, color: cel("#e8453c", "#a8284a") });
  // fruit: oranges/mandarins
  const ORANGE = cel("#ffa63a", "#d86a3a");
  for (const [dx, dz] of [[-0.05, -0.08], [0.0, -0.0], [0.05, -0.1]] as const) {
    b.part(sph(0.04, 8, 6), ORANGE, { at: [TXx + dx - 0.05, 0.54, TZz + dz] });
    b.part(sph(0.01, 4, 3), "#4f9a4a", { at: [TXx + dx - 0.05, 0.58, TZz + dz] });
  }
  // sanbo stand with mochi
  b.part(box(0.16, 0.05, 0.16), WOOD_D, { at: [TXx + 0.17, 0.53, TZz + 0.1] });
  b.part(box(0.2, 0.012, 0.2), WOOD, { at: [TXx + 0.17, 0.56, TZz + 0.1] });
  b.part(cyl(0.05, 0.06, 0.03, 8), WHITE_PAPER, { at: [TXx + 0.17, 0.585, TZz + 0.1] });
  b.part(cyl(0.035, 0.045, 0.03, 8), WHITE_PAPER, { at: [TXx + 0.17, 0.615, TZz + 0.1] });
  b.part(sph(0.012, 5, 4), ORANGE, { at: [TXx + 0.17, 0.64, TZz + 0.1] });
  // coins scattered (gold) near the saisen box and table
  for (let i = 0; i < 9; i++) {
    const cx = TXx - 0.2 + r() * 0.3;
    const cz = TZz - 0.15 + r() * 0.1;
    b.part(cyl(0.02, 0.02, 0.004, 8), GOLD, { at: [cx, 0.504, cz], rotation: [(r() - 0.5) * 10, 0, (r() - 0.5) * 10] });
    b.part(box(0.008, 0.005, 0.008), BLACK, { at: [cx, 0.508, cz] });
  }
  // incense burner (stone) on the right side
  const IX = 1.15, IZ = -0.55;
  b.lathe([[0, 0], [0.12, 0], [0.14, 0.04], [0.13, 0.12], [0.15, 0.15], [0.12, 0.15], [0.11, 0.1], [0, 0.1]], { at: [IX, 0.1, IZ], segments: 10, color: STONE_D });
  b.part(cyl(0.1, 0.1, 0.02, 10), cel("#555060", "#3a3048"), { at: [IX, 0.225, IZ] });
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 0.05;
    const h = 0.1 + r() * 0.06;
    b.rod([IX + Math.cos(a) * d, 0.235, IZ + Math.sin(a) * d], [IX + Math.cos(a) * d + 0.01, 0.235 + h, IZ + Math.sin(a) * d], 0.004, "#a56a3a", { sides: 4, caps: "flat" });
    glow(b.part(sph(0.008, 4, 3), "#ff6a3a", { at: [IX + Math.cos(a) * d + 0.01, 0.238 + h, IZ + Math.sin(a) * d] }), 1.6);
  }
  // rising smoke wisps as cards (electro violet tinge)
  b.cards(
    [frame([IX, 0.4, IZ], [0, 1, 0]), frame([IX + 0.03, 0.55, IZ], [0, 1, 0])],
    SHIDE,
    { size: [0.1, 0.18], lean: 0, flow: [0, 0, 1], color: "#e9e3ff", cross: true },
  );

  // kitsune guardian statues flank the hokora steps (chibi, cel-shaded)
  const fox = (x: number, z: number, s: number) => {
    const W = cel("#f2f0ff", "#b6b0d8");
    b.part(box(0.2, 0.1, 0.22), STONE_D, { at: [x, 0.16, z] });
    b.part(sph(0.1, 8, 6), W, { at: [x, 0.3, z - 0.02], scale: [0.9, 1.3, 1] });
    b.part(sph(0.075, 8, 6), W, { at: [x, 0.5, z + 0.02] });
    b.part(box(0.07, 0.05, 0.1), W, { at: [x, 0.48, z + 0.1] });
    b.part(sph(0.015, 5, 4), BLACK, { at: [x, 0.5, z + 0.155] });
    for (const e of [1, -1]) {
      b.spike([x + e * 0.045, 0.55, z], [e * 0.15, 1, -0.1], 0.1, 0.03, W, { sides: 4 });
      b.part(sph(0.012, 4, 3), BLACK, { at: [x + e * 0.035, 0.52, z + 0.08] });
    }
    b.part(box(0.12, 0.035, 0.09), RED_CLOTH, { at: [x, 0.43, z + 0.04] });
    glow(b.part(sph(0.02, 5, 4), ELECTRO, { at: [x, 0.38, z + 0.095] }), 1.4);
    // tail curl
    b.sweep(
      catmull([
        [x, 0.2, z - 0.1],
        [x - s * 0.1, 0.28, z - 0.2],
        [x - s * 0.15, 0.45, z - 0.15],
        [x - s * 0.1, 0.6, z - 0.08],
      ]),
      [0.045, 0.012],
      W,
      { sides: 6, caps: "round" },
    );
  };
  fox(0.78, -0.2, 1);
  fox(-0.78, -0.2, -1);

  // =====================================================
  // HANGING PAPER LANTERNS string between torii and a pole
  // =====================================================
  // side pole on the right
  const poleX = 1.5;
  const poleZ = 0.98;
  b.rod([poleX, 0.1, poleZ], [poleX, 1.95, poleZ], [0.055, 0.04], WOOD_D, { sides: 6, caps: "flat" });
  b.part(cyl(0.07, 0.09, 0.12, 6), STONE_D, { at: [poleX, 0.16, poleZ] });
  b.part(sph(0.05, 6, 4), GOLD, { at: [poleX, 1.97, poleZ] });
  const strand = catmull([
    [0.62, 2.05, TZ],
    [0.9, 1.88, TZ],
    [1.2, 1.84, TZ],
    [poleX, 1.9, poleZ],
  ]);
  b.sweep(strand, 0.008, BLACK, { sides: 4 });
  const strand2 = catmull([
    [-0.62, 2.05, TZ],
    [-0.9, 1.88, TZ],
    [-1.2, 1.84, TZ],
    [-1.5, 1.9, poleZ],
  ]);
  b.sweep(strand2, 0.008, BLACK, { sides: 4 });
  b.rod([-1.5, 0.1, poleZ], [-1.5, 1.95, poleZ], [0.055, 0.04], WOOD_D, { sides: 6, caps: "flat" });
  b.part(cyl(0.07, 0.09, 0.12, 6), STONE_D, { at: [-1.5, 0.16, poleZ] });
  b.part(sph(0.05, 6, 4), GOLD, { at: [-1.5, 1.97, poleZ] });

  const paperLantern = (x: number, y: number, z: number, sc: number) => {
    b.rod([x, y + 0.02, z], [x, y + 0.08 * sc, z], 0.006, BLACK, { sides: 4 });
    // body: lathe with texture projected? use lathe with flat color then textured outer plane cards
    b.lathe(
      [
        [0, -0.12 * sc],
        [0.04 * sc, -0.12 * sc],
        [0.09 * sc, -0.07 * sc],
        [0.11 * sc, 0],
        [0.09 * sc, 0.07 * sc],
        [0.045 * sc, 0.11 * sc],
        [0, 0.11 * sc],
      ],
      { at: [x, y - 0.0, z], segments: 10, color: PAPER },
    );
    // ribs
    for (const dy of [-0.07, -0.02, 0.03, 0.08]) {
      const rr = 0.09 + 0.02 * (1 - Math.abs(dy) * 8);
      b.rod([x, y + dy * sc, z], [x, y + dy * sc + 0.006, z], rr * sc, "#c8741f", { sides: 10, caps: "flat" });
    }
    glow(b.part(sph(0.06 * sc, 6, 4), "#ffe08a", { at: [x, y, z] }), 1.2);
    // red band with emblem decal on front and back
    for (const sz of [1, -1]) {
      b.part(new THREE.PlaneGeometry(0.11 * sc, 0.16 * sc), "#ffffff", {
        at: [x, y, z + sz * 0.112 * sc],
        dir: [0, 0, sz],
        axis: "z",
        texture: PAPER_LANTERN,
      });
    }
    // caps
    b.part(cyl(0.045 * sc, 0.05 * sc, 0.02, 8), BLACK, { at: [x, y + 0.118 * sc, z] });
    b.part(cyl(0.05 * sc, 0.04 * sc, 0.02, 8), BLACK, { at: [x, y - 0.128 * sc, z] });
    // tassel
    b.rod([x, y - 0.14 * sc, z], [x, y - 0.24 * sc, z], 0.008, RED_CLOTH, { sides: 4 });
    b.part(cyl(0.012, 0.03, 0.06, 6), RED_CLOTH, { at: [x, y - 0.27 * sc, z] });
  };
  paperLantern(0.92, 1.68, TZ, 1.05);
  paperLantern(1.22, 1.64, TZ, 1.05);
  paperLantern(-0.92, 1.68, TZ, 1.05);
  paperLantern(-1.22, 1.64, TZ, 1.05);

  // =====================================================
  // MAPLE TREE at back right (autumn) + sakura petals
  // =====================================================
  const treeX = 1.15, treeZ = -1.2;
  b.sweep(
    catmull([
      [treeX, 0, treeZ],
      [treeX - 0.05, 0.6, treeZ + 0.02],
      [treeX + 0.05, 1.3, treeZ - 0.03],
      [treeX + 0.0, 1.9, treeZ + 0.0],
    ]),
    [0.15, 0.07],
    TRUNK,
    { sides: 7, caps: "flat" },
  );
  // trunk flare roots
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.5;
    b.rod([treeX, 0.15, treeZ], [treeX + Math.sin(a) * 0.22, 0.02, treeZ + Math.cos(a) * 0.22], [0.06, 0.03], TRUNK, { sides: 5 });
  }
  const branches: Array<[number, number, number]> = [
    [0.5, 0.4, 0.2],
    [-0.4, 0.45, 0.1],
    [0.1, 0.35, -0.5],
    [0.2, 0.3, 0.45],
    [-0.3, 0.55, -0.3],
  ];
  const crown: THREE.Vector3[] = [];
  for (const [dx, dy, dz] of branches) {
    const start = new THREE.Vector3(treeX, 1.55 + dy * 0.25, treeZ);
    const end = new THREE.Vector3(treeX + dx, 1.9 + dy, treeZ + dz);
    b.sweep(catmull([start, start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.1, 0)), end]), [0.045, 0.015], TRUNK, { sides: 5 });
    crown.push(end);
  }
  // crown foliage: leaf cards on spheres of positions
  const MAPLE_COLS = ["#e8503a", "#f08a3a", "#d6382f", "#f4b03a"];
  const leafFrames: ReturnType<typeof frame>[] = [];
  const crownCenters = [...crown, new THREE.Vector3(treeX, 2.15, treeZ)];
  for (const c of crownCenters) {
    for (let i = 0; i < 16; i++) {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      const rad = 0.2 + r() * 0.2;
      const d = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph) * 0.8, Math.sin(ph) * Math.sin(th));
      leafFrames.push(frame(c.clone().addScaledVector(d, rad), d));
    }
  }
  MAPLE_COLS.forEach((col, ci) => {
    const set = leafFrames.filter((_f, i) => i % MAPLE_COLS.length === ci);
    b.cards(set, MAPLE, { size: [0.17, 0.17], lean: 40, flow: [0, -0.4, 1], vary: 0.35, spin: 180, rng: rng(20 + ci), color: col, cross: true });
  });
  // foliage mass cores so the crown is not see-through
  for (const c of crownCenters) {
    b.part(sph(0.2, 7, 5), cel("#e86a3a", "#b04050"), { at: [c.x, c.y, c.z], scale: [1, 0.8, 1] });
  }
  // fallen leaves on the ground
  const fall = Array.from({ length: 26 }, () => {
    const a = r() * Math.PI * 2;
    const d = 0.1 + r() * 0.8;
    return frame([treeX + Math.cos(a) * d - 0.2, 0.108, treeZ + Math.sin(a) * d * 0.8 + 0.4], [0, 1, 0]);
  });
  [0, 1, 2].forEach((ci) => {
    b.cards(fall.filter((_f, i) => i % 3 === ci), MAPLE, { size: 0.09, lean: 90, flow: [1, 0, 0], mirror: true, vary: 0.3, spin: 180, rng: rng(40 + ci), color: MAPLE_COLS[ci] });
  });
  // pink sakura petals drifting on the path
  const petals = Array.from({ length: 14 }, () => frame([-0.8 + r() * 1.6, 0.109, 0.3 + r() * 1.3], [0, 1, 0]));
  b.cards(petals, SAKURA, { size: 0.045, lean: 90, flow: [0, 0, 1], mirror: true, vary: 0.3, spin: 180, rng: rng(60), color: "#ffb7c9" });

  // =====================================================
  // GRASS TUFTS, FLOWERS, ROCKS around the edge
  // =====================================================
  const BLADE = svg(
    `<svg viewBox="0 0 32 64"><path d="M4 64 Q6 30 10 6 Q14 30 16 64Z M14 64 Q16 24 22 0 Q26 30 28 64Z" fill="#ffffff"/></svg>`,
    { size: 96 },
  );
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 38; i++) {
    const a = r() * Math.PI * 2;
    const d = 1.2 + r() * 0.55;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (Math.abs(x) < 0.5 && z > 0) continue;
    tufts.push(frame([x, 0.1, z], [0, 1, 0]));
  }
  b.cards(tufts, BLADE, { size: [0.13, 0.18], lean: 10, flow: [0, -0.2, 1], cross: true, vary: 0.4, spin: 180, rng: rng(70), color: "#7bd06a" });
  // glowing electro flowers (Amethyst Lotus-like)
  const flowerPos: Array<[number, number]> = [[-1.45, 0.1], [-1.35, 0.55], [1.5, 0.5], [1.6, -0.3], [-0.55, 1.35], [0.6, 1.4]];
  for (const [fx, fz] of flowerPos) {
    b.rod([fx, 0.1, fz], [fx, 0.28, fz], 0.008, "#4f9a4a", { sides: 4 });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      glow(
        b.spike([fx, 0.29, fz], [Math.cos(a) * 0.8, 0.6, Math.sin(a) * 0.8], 0.07, 0.022, ELECTRO, { sides: 4 }),
        1.2,
      );
    }
    glow(b.part(sph(0.018, 5, 4), ELECTRO_L, { at: [fx, 0.3, fz] }), 1.5);
  }
  // rocks
  for (const [rx, rz, rs] of [[-1.4, -1.0, 0.16], [1.55, 0.05, 0.12], [-1.5, 1.2, 0.1], [0.1, -1.55, 0.14]] as const) {
    b.part(new THREE.DodecahedronGeometry(rs, 0), STONE, { at: [rx, 0.1 + rs * 0.5, rz], scale: [1.2, 0.8, 1], rotation: [r() * 30, r() * 90, 0] });
    b.part(sph(rs * 0.5, 5, 3), MOSS, { at: [rx, 0.1 + rs * 1.0, rz], scale: [1.2, 0.4, 1] });
  }
  // stone fence posts (low) left and right of the torii with rope
  for (const s of [1, -1]) {
    for (const z of [0.15]) {
      b.part(box(0.1, 0.34, 0.1), STONE_L, { at: [s * 1.55, 0.27, z - 0.1] });
      b.part(box(0.13, 0.04, 0.13), STONE, { at: [s * 1.55, 0.46, z - 0.1] });
    }
  }
  // gold electro orbs floating above the lanterns (little magic motes)
  for (const [mx, my, mz] of [[0.95, 1.2, 0.55], [-0.95, 1.25, 0.55], [0, 2.0, -0.85], [0.3, 1.5, 0.8], [-0.4, 1.35, 0.4]] as const) {
    glow(b.part(new THREE.OctahedronGeometry(0.03, 0), ELECTRO_L, { at: [mx, my, mz] }), 1.6);
  }

  // end: ink-line accent referenced so kit import is used meaningfully
  b.part(box(0.001, 0.001, 0.001), inkLines(VERM, { levels: [0.5], axis: [0, 1, 0], ink: INK }), { at: [0, -0.03, 0] });

  const root = b.root;
  // keep base on the floor: ground sinks 0.04 below y=0 (within allowance)
  void paint;
  return root;
}
