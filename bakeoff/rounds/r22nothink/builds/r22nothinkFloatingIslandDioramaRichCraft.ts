import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
import { catmull, polyline } from "../../../../src/path";
import { grain, mottle, paint, scales, stripes, gradient, noise, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Sky Island",
  description:
    "Genshin-style floating island with a gold-trimmed ruined shrine, a waterfall spilling into the sky, sakura and pine trees, glowing crystals and drifting rock islets.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------- palette (cel-shaded) ----------
const ROCK = cel("#9a8fa8", "#6a5f88");
const ROCK_DARK = cel("#6f6584", "#4a3f6c");
const ROCK_WARM = cel("#b3a38f", "#857099");
const STONE = cel("#e6dcc8", "#b9a6b8");
const STONE_DARK = cel("#c8bca8", "#9a88a6");
const GRASS = cel("#7fd35a", "#3fa56a");
const GRASS_LIGHT = cel("#b4ee6a", "#5cc070");
const SOIL = cel("#8a5a3c", "#5a3a52");
const GOLD = cel("#f2c14e", "#c27a2c");
const TEAL = cel("#2fc7c0", "#2a7fa8");
const BARK = cel("#7a4e38", "#4a3050");
const PINK = cel("#ffb6cf", "#e07fb0");
const PINK_DEEP = cel("#ff8fb4", "#d05a98");
const PINE = cel("#3fae6a", "#237a78");
const PINE_LIGHT = cel("#63cf7a", "#2f9a84");
const WHITE = cel("#ffffff", "#cfe2f5");
const RED = cel("#e2584f", "#a02f58");
const WATER = "#7fe3ff";
const WATER_LIGHT = "#d6f8ff";
const CRYSTAL = "#58e8ff";
const CRYSTAL2 = "#9ff4ff";
const FLAME = "#ffd36a";

// ---------- textures ----------
const SPRAY = svg(
  `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="38" rx="26" ry="20" fill="#ffffff" opacity="0.95"/><circle cx="14" cy="42" r="10" fill="#e6fbff"/><circle cx="50" cy="40" r="11" fill="#e6fbff"/><circle cx="32" cy="22" r="14" fill="#ffffff"/></svg>`,
  { size: 64 },
);
const LEAF_PINK = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 60 C6 44 6 14 32 4 C58 14 58 44 32 60Z" fill="#ffc2d8"/><path d="M32 58 L32 12" stroke="#ff8fb4" stroke-width="3" fill="none"/><path d="M32 40 L18 28 M32 40 L46 28 M32 28 L22 18 M32 28 L42 18" stroke="#ff9fc0" stroke-width="2.5" fill="none"/></svg>`,
  { size: 128 },
);
const LEAF_GREEN = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 60 C8 46 10 16 32 4 C54 16 56 46 32 60Z" fill="#8fe070"/><path d="M32 58 L32 10" stroke="#46b060" stroke-width="3" fill="none"/></svg>`,
  { size: 128 },
);
const NEEDLES = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 2 L58 60 L6 60Z" fill="#ffffff"/><path d="M32 22 L32 58 M20 40 L20 58 M44 40 L44 58" stroke="#c0c0c0" stroke-width="3"/></svg>`,
  { size: 128 },
);
const GRASS_TUFT = svg(
  `<svg viewBox="0 0 64 64"><path d="M6 64 Q12 30 8 8 Q24 30 26 64Z M22 64 Q28 24 32 2 Q40 28 42 64Z M38 64 Q46 30 56 10 Q54 40 58 64Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b3a4a"/><circle cx="32" cy="32" r="26" fill="none" stroke="#7ff6ff" stroke-width="4"/><circle cx="32" cy="32" r="17" fill="none" stroke="#7ff6ff" stroke-width="3"/><path d="M32 8 L32 56 M8 32 L56 32" stroke="#7ff6ff" stroke-width="3"/><path d="M32 18 L44 32 L32 46 L20 32Z" fill="#bffcff"/><circle cx="32" cy="32" r="4" fill="#0b3a4a"/></svg>`,
  { size: 192 },
);
const BANNER = svg(
  `<svg viewBox="0 0 48 96"><path d="M0 0 H48 V84 L24 70 L0 84Z" fill="#e2584f"/><path d="M0 0 H48 V8 H0Z" fill="#f2c14e"/><path d="M3 12 H45 V80 L24 66 L3 80Z" fill="none" stroke="#f2c14e" stroke-width="2"/><circle cx="24" cy="36" r="10" fill="none" stroke="#f2c14e" stroke-width="3"/><path d="M24 22 L28 36 L24 50 L20 36Z" fill="#f2c14e"/></svg>`,
  { size: 192 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 128 32"><path d="M0 16 Q16 0 32 16 T64 16 T96 16 T128 16" fill="none" stroke="#f2c14e" stroke-width="4"/><circle cx="16" cy="16" r="3" fill="#f2c14e"/><circle cx="48" cy="16" r="3" fill="#f2c14e"/><circle cx="80" cy="16" r="3" fill="#f2c14e"/><circle cx="112" cy="16" r="3" fill="#f2c14e"/></svg>`,
  { size: 256 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 24 64"><circle cx="12" cy="6" r="5" fill="#f2c14e"/><path d="M6 10 H18 L16 62 H8Z" fill="#e2584f"/><path d="M12 12 V60 M9 14 V60 M15 14 V60" stroke="#ffb0a0" stroke-width="1.5"/></svg>`,
  { size: 96 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "floatingIslandDiorama", paintSize: 2048 });
  const R = rng(7);

  const CY = 1.32; // island top height
  const RAD = 1.15; // island radius

  // ======================================================
  // ISLAND BODY: layered, hanging rock
  // ======================================================
  const rockPaint = paint((p, n, s) => {
    const nz = noise(p, 0.18, 3);
    const strata = Math.sin(p.y * 38 + nz * 4) > 0.55;
    const base = nz > 0.55 ? ROCK_WARM : nz > 0.3 ? ROCK : ROCK_DARK;
    void s;
    void n;
    return strata ? ROCK_DARK : base;
  });

  // main top plateau (soil rim) and grass cap
  b.lathe(
    [
      [0, CY - 0.18],
      [RAD * 0.98, CY - 0.18],
      [RAD * 1.02, CY - 0.06],
      [RAD, CY],
      [0, CY],
    ],
    { at: [0, 0, 0], segments: 14, color: SOIL },
  );
  // layered hanging rock: stacked frusta, jagged
  const layers: Array<[number, number, number, number, number]> = [
    // y0, y1, r0, r1, spin
    [CY - 0.18, CY - 0.5, RAD * 0.98, RAD * 0.86, 0],
    [CY - 0.5, CY - 0.82, RAD * 0.86, RAD * 0.66, 12],
    [CY - 0.82, CY - 1.0, RAD * 0.66, RAD * 0.46, 24],
    [CY - 1.0, CY - 1.15, RAD * 0.46, RAD * 0.26, 6],
  ];
  for (const [y0, y1, r0, r1, spin] of layers) {
    b.lathe(
      [
        [0, y0],
        [r0, y0],
        [r1, y1],
        [0, y1],
      ],
      { at: [0, 0, 0], segments: 9, spin, color: rockPaint },
    );
  }
  // sloping chunky ridges hanging down the rim
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + R() * 0.3;
    const r = RAD * (0.78 + R() * 0.15);
    const len = 0.45 + R() * 0.45;
    const top: [number, number, number] = [Math.sin(a) * r, CY - 0.28, Math.cos(a) * r];
    const tip: [number, number, number] = [Math.sin(a) * r * 0.55, CY - 0.28 - len - 0.25, Math.cos(a) * r * 0.55];
    b.spike(top, tip, null, 0.13 + R() * 0.07, { color: i % 2 ? ROCK_DARK : ROCK, sides: 5 });
  }
  // central stalactite, ends at the floor
  b.spike([0, CY - 1.1, 0], [0, 0, 0], null, 0.24, { color: ROCK_DARK, sides: 6 });
  b.spike([0.18, CY - 1.0, 0.1], [0.12, 0.08, 0.06], null, 0.1, { color: ROCK, sides: 5 });
  b.spike([-0.15, CY - 0.95, -0.12], [-0.12, 0.2, -0.1], null, 0.09, { color: ROCK_WARM, sides: 5 });

  // glowing crystals clustered on the underside
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const r = 0.28 + R() * 0.28;
    const baseY = CY - 0.9 - R() * 0.15;
    const base: [number, number, number] = [Math.sin(a) * r, baseY, Math.cos(a) * r];
    const dir: [number, number, number] = [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.35];
    glow(
      b.spike(base, dir, 0.3 + R() * 0.25, 0.045 + R() * 0.02, { color: i % 2 ? CRYSTAL : CRYSTAL2, sides: 5 }),
      1.2,
    );
  }
  // upward crystals on the grass edge
  const cr: Array<[number, number, number, number]> = [
    [-0.95, 0.18, 0.1, 0.2],
    [-0.88, 0.1, 0.24, 0.14],
    [-1.02, 0.22, -0.08, 0.12],
  ];
  for (const [x, z, , h] of cr) {
    glow(b.spike([x, CY, z], [0.05, 1, 0.1], h + 0.1, 0.045, { color: CRYSTAL, sides: 5 }), 1.2);
  }

  // grass cap: lumpy mounds of cel grass
  const grassPaint = paint((p, n) => {
    const t = noise(p, 0.22, 11);
    return n.y > 0.2 ? (t > 0.55 ? GRASS_LIGHT : GRASS) : SOIL;
  });
  b.lathe(
    [
      [0, CY + 0.06],
      [RAD * 0.88, CY + 0.06],
      [RAD * 1.01, CY + 0.0],
      [RAD * 1.0, CY - 0.07],
      [0, CY - 0.07],
    ],
    { at: [0, 0, 0], segments: 14, smoothing: 0, color: grassPaint },
  );
  // soil drips under rim
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R() * 0.2;
    const r = RAD * 0.99;
    b.spike(
      [Math.sin(a) * r, CY - 0.06, Math.cos(a) * r],
      [0, -1, 0],
      0.1 + R() * 0.1,
      0.045,
      { color: GRASS, sides: 5 },
    );
  }
  // gentle grassy hills
  const hills: Array<[number, number, number, number]> = [
    [0.55, -0.4, 0.42, 0.16],
    [-0.55, -0.6, 0.38, 0.14],
    [0.85, 0.35, 0.3, 0.1],
    [-0.2, 0.7, 0.34, 0.1],
  ];
  for (const [x, z, r, h] of hills) {
    b.part(new THREE.SphereGeometry(1, 10, 6), grassPaint, {
      at: [x, CY + 0.04, z],
      scale: [r, h, r],
    });
  }

  // ======================================================
  // RUINS: raised stone terrace, stairs, pillars, arch, rune plate
  // ======================================================
  const PX = -0.1;
  const PZ = 0.1;
  const TY = CY + 0.08;
  const stonePaint = paint((p, n) => {
    const e = scales([STONE, STONE_DARK], INK, { size: 0.14, width: 0.012 }).at(p, n);
    return e;
  });
  const stoneFlat = scales([STONE, STONE_DARK], "#8c7a8e", { size: 0.12, width: 0.01, seed: 4 });
  void stonePaint;
  // terrace slab: octagonal lathe
  b.lathe(
    [
      [0, TY - 0.08],
      [0.62, TY - 0.08],
      [0.6, TY + 0.04],
      [0, TY + 0.04],
    ],
    { at: [PX, 0, PZ], segments: 8, spin: 22, color: stoneFlat },
  );
  // gold inlay ring on terrace
  b.lathe(
    [
      [0.38, TY + 0.04],
      [0.41, TY + 0.04],
      [0.41, TY + 0.052],
      [0.38, TY + 0.052],
    ],
    { at: [PX, 0, PZ], segments: 24, color: GOLD },
  );
  b.lathe(
    [
      [0.1, TY + 0.04],
      [0.13, TY + 0.04],
      [0.13, TY + 0.052],
      [0.1, TY + 0.052],
    ],
    { at: [PX, 0, PZ], segments: 16, color: GOLD },
  );
  // rune plate (glowing)
  glow(
    b.part(new THREE.CircleGeometry(0.26, 20), "#ffffff", {
      at: [PX, TY + 0.056, PZ],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: RUNE,
    }),
    1,
  );
  // stairs on the front (+z) side
  for (let i = 0; i < 4; i++) {
    b.frustumBox(
      [PX, TY - 0.08 + i * 0.03, PZ + 0.74 - i * 0.07],
      [PX, TY - 0.08 + i * 0.03 + 0.06, PZ + 0.74 - i * 0.07],
      [0.56 - i * 0.04, 0.2 - i * 0.04],
      [0.56 - i * 0.04, 0.2 - i * 0.04],
      { color: i % 2 ? STONE : STONE_DARK },
    );
  }
  // stair side cheeks
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.3, 0],
        [0.3, 0.05],
        [0, 0.14],
      ],
      {
        at: [PX + s * 0.31, CY + 0.0, PZ + 0.55],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.04,
        bevel: 0.008,
        color: STONE_DARK,
      },
    );
  }

  // pillars
  const pillar = (x: number, z: number, h: number, broken: boolean) => {
    const base = TY + 0.04;
    b.rod([x, base, z], [x, base + 0.05, z], 0.11, { color: STONE_DARK, section: { ngon: 6 } });
    b.rod([x, base + 0.05, z], [x, base + h, z], [0.075, 0.068], {
      color: stoneFlat,
      section: { ngon: 8 },
    });
    // fluting rings
    for (let k = 1; k < 3; k++) {
      b.rod([x, base + k * (h / 3), z], [x, base + k * (h / 3) + 0.014, z], 0.085, {
        color: GOLD,
        section: { ngon: 8 },
      });
    }
    if (!broken) {
      b.rod([x, base + h, z], [x, base + h + 0.05, z], 0.1, { color: STONE_DARK, section: { ngon: 8 } });
      b.rod([x, base + h + 0.05, z], [x, base + h + 0.065, z], 0.115, { color: GOLD, section: { ngon: 8 } });
    } else {
      // jagged top
      b.spike([x, base + h - 0.02, z], [x + 0.02, 1, 0.02], 0.06, 0.05, { color: STONE, sides: 4 });
      // fallen drum
      b.rod([x + 0.16, TY + 0.06, z + 0.2], [x + 0.3, TY + 0.06, z + 0.32], 0.06, {
        color: STONE_DARK,
        section: { ngon: 8 },
      });
    }
  };
  pillar(PX - 0.4, PZ - 0.2, 0.62, false);
  pillar(PX + 0.4, PZ - 0.2, 0.62, false);
  pillar(PX - 0.4, PZ + 0.35, 0.42, true);
  pillar(PX + 0.4, PZ + 0.35, 0.3, true);

  // arch lintel spanning rear pillars, with gold trim and filigree
  const lintelY = TY + 0.04 + 0.62 + 0.065;
  b.frustumBox([PX - 0.5, lintelY, PZ - 0.2], [PX + 0.5, lintelY, PZ - 0.2], [0.12, 0.09], [0.12, 0.09], {
    color: stoneFlat,
  });
  b.frustumBox([PX - 0.5, lintelY + 0.06, PZ - 0.2], [PX + 0.5, lintelY + 0.06, PZ - 0.2], [0.15, 0.03], [0.15, 0.03], {
    color: GOLD,
  });
  // curved crest above the lintel
  b.extrude(
    [
      [-0.3, 0],
      [-0.26, 0.06],
      [-0.12, 0.12],
      [0, 0.2, "sharp"],
      [0.12, 0.12],
      [0.26, 0.06],
      [0.3, 0],
    ],
    {
      at: [PX, lintelY + 0.075, PZ - 0.2],
      x: [1, 0, 0],
      thickness: 0.05,
      bevel: 0.01,
      smoothing: 1,
      color: STONE,
    },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.125), "#ffffff", {
    at: [PX, lintelY - 0.02, PZ - 0.2 + 0.062],
    dir: [0, 0, 1],
    axis: "z",
    texture: FILIGREE,
  });
  // crest gem
  glow(b.part(new THREE.OctahedronGeometry(0.04, 0), CRYSTAL, { at: [PX, lintelY + 0.2, PZ - 0.17], scale: [1, 1.5, 0.8] }), 1.4);
  // banner hanging from lintel
  b.part(new THREE.PlaneGeometry(0.16, 0.32), "#ffffff", {
    at: [PX, lintelY - 0.22, PZ - 0.14],
    dir: [0, 0, 1],
    axis: "z",
    texture: BANNER,
  });
  b.cards([frame([PX, lintelY - 0.06, PZ - 0.13], [0, 1, 0])], TASSEL, { size: [0.03, 0.1], lean: 180, flow: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.cards([frame([PX + s * 0.5, lintelY - 0.04, PZ - 0.12], [0, 1, 0])], TASSEL, {
      size: [0.035, 0.12],
      lean: 180,
      flow: [0, 0, 1],
    });
  }

  // scattered rubble blocks
  const blocks: Array<[number, number, number, number, number]> = [
    [PX + 0.62, 0.55, 0.14, 0.08, 20],
    [PX - 0.7, 0.4, 0.1, 0.06, 55],
    [PX + 0.2, 0.9, 0.09, 0.05, 10],
    [PX - 0.45, 0.8, 0.12, 0.07, 70],
    [PX + 0.75, -0.1, 0.1, 0.07, 35],
  ];
  for (const [x, z, w, h, rot] of blocks) {
    b.part(new THREE.BoxGeometry(w, h, w * 0.8), STONE_DARK, {
      at: [x, CY + 0.04 + h / 2 - 0.02, z],
      rotation: [R() * 10, rot, R() * 10],
    });
  }

  // moss/vine paint cards on terrace: grass tufts on ruins
  const tuftFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.45 + R() * 0.2;
    tuftFrames.push(frame([PX + Math.sin(a) * r, TY + 0.03, PZ + Math.cos(a) * r], [0, 1, 0]));
  }
  b.cards(tuftFrames, GRASS_TUFT, { size: [0.07, 0.07], vary: 0.4, rng: rng(21), color: "#79d855", cross: true, flow: [0, 0, 1] });

  // ======================================================
  // WATERFALL: stream from a rock outcrop over the +x edge
  // ======================================================
  const WX = 0.78;
  const WZ = -0.58;
  const edgeA = Math.atan2(WX, WZ);
  const edgeR = RAD * 0.98;
  const lipX = Math.sin(edgeA) * edgeR;
  const lipZ = Math.cos(edgeA) * edgeR;
  // outcrop of rocks as a spring
  b.part(new THREE.IcosahedronGeometry(0.22, 0), ROCK, { at: [WX - 0.2, CY + 0.12, WZ - 0.18], scale: [1.2, 0.9, 1] });
  b.part(new THREE.IcosahedronGeometry(0.14, 0), ROCK_WARM, { at: [WX - 0.32, CY + 0.2, WZ - 0.34], scale: [1, 1.1, 1] });
  b.part(new THREE.IcosahedronGeometry(0.12, 0), ROCK_DARK, { at: [WX - 0.05, CY + 0.07, WZ - 0.38] });
  // winding stream across the grass
  const stream = catmull([
    [WX - 0.28, CY + 0.12, WZ - 0.28],
    [WX - 0.2, CY + 0.075, WZ - 0.15],
    [WX - 0.02, CY + 0.065, WZ + 0.02],
    [lipX * 0.92 - 0.02, CY + 0.06, lipZ * 0.92 + 0.08],
    [lipX * 1.0, CY + 0.045, lipZ * 1.0 + 0.04],
  ]);
  b.sweep(stream, [0.07, 0.1], { color: WATER, sides: 6, caps: "flat" });
  b.sweep(stream.slice(0.1, 0.9), 0.04, { color: WATER_LIGHT, sides: 5, caps: "flat", shift: [0, 0.03] });
  // grassy banks of the stream
  for (const sd of [1, -1]) {
    const bank = catmull(
      [0, 0.25, 0.5, 0.75, 1].map((t) => {
        const q = stream.at(t);
        return [q.x + sd * 0.11, q.y + 0.0, q.z - sd * 0.06 + 0.0];
      }),
    );
    b.sweep(bank, 0.035, { color: STONE_DARK, sides: 5, caps: "flat" });
  }
  // the fall: stacked water sheets with highlight streaks, to the sky
  const fallTop = CY + 0.05;
  const fallLen = 0.95;
  const fx = lipX * 1.0;
  const fz = lipZ * 1.0 + 0.04;
  const nrm: [number, number, number] = [Math.sin(edgeA), 0, Math.cos(edgeA)];
  const tang: [number, number, number] = [Math.cos(edgeA), 0, -Math.sin(edgeA)];
  const sheetFace = new THREE.Vector3(nrm[0], 0, nrm[2]);
  const sheetPaint = paint((p, _n, s) => {
    const streak = Math.sin((p.x * tang[0] + p.z * tang[2]) * 70 + noise(p, 0.2, 5) * 6) > 0.6;
    const fade = smoothstep(0.0, 1, s[1] ?? 0);
    void fade;
    return streak ? WATER_LIGHT : WATER;
  });
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.1, -fallLen * 0.5],
      [0.07, -fallLen],
      [-0.07, -fallLen],
      [-0.1, -fallLen * 0.5],
    ],
    {
      at: [fx + nrm[0] * 0.05, fallTop, fz + nrm[2] * 0.05],
      x: tang,
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.01,
      color: sheetPaint,
    },
  );
  // layered foam ribbons
  for (const off of [-0.07, 0.0, 0.07]) {
    const ribbon = polyline([
      [fx + nrm[0] * 0.09 + tang[0] * off, fallTop + 0.01, fz + nrm[2] * 0.09 + tang[2] * off],
      [fx + nrm[0] * 0.13 + tang[0] * off, fallTop - fallLen * 0.5, fz + nrm[2] * 0.13 + tang[2] * off],
      [fx + nrm[0] * 0.15 + tang[0] * off, fallTop - fallLen + 0.03, fz + nrm[2] * 0.15 + tang[2] * off],
    ]);
    b.sweep(ribbon, [0.014, 0.01], { color: WATER_LIGHT, sides: 4, caps: "flat" });
  }
  void sheetFace;
  // spray at the bottom of the fall and at the lip
  const sprayFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++) {
    const t = R();
    const off = (R() - 0.5) * 0.22;
    sprayFrames.push(
      frame(
        [
          fx + nrm[0] * (0.12 + R() * 0.1) + tang[0] * off,
          fallTop - fallLen + 0.03 + R() * 0.12 - t * 0.0,
          fz + nrm[2] * (0.12 + R() * 0.1) + tang[2] * off,
        ],
        [0, 1, 0],
      ),
    );
  }
  b.cards(sprayFrames, SPRAY, { size: [0.14, 0.14], vary: 0.4, rng: rng(5), color: "#f2fdff", cross: true, flow: [0, 0, 1] });
  // little cascade of droplets/orbs falling beneath
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.IcosahedronGeometry(0.018 + R() * 0.012, 0), WATER, {
      at: [fx + nrm[0] * (0.16 + R() * 0.08), 0.12 + R() * 0.2 + i * 0.01, fz + nrm[2] * (0.16 + R() * 0.08)],
    });
  }
  // mist ring at the end of the fall
  b.part(new THREE.SphereGeometry(1, 8, 5), "#e9fbff", {
    at: [fx + nrm[0] * 0.2, 0.22, fz + nrm[2] * 0.2],
    scale: [0.16, 0.07, 0.16],
  });

  // ======================================================
  // TREES
  // ======================================================
  // sakura tree
  const sakura = (x: number, z: number, h: number, s: number) => {
    const base: [number, number, number] = [x, CY + 0.04, z];
    const trunk = catmull([
      base,
      [x + 0.03 * s, CY + 0.04 + h * 0.35, z - 0.02 * s],
      [x - 0.02 * s, CY + 0.04 + h * 0.7, z + 0.03 * s],
      [x + 0.04 * s, CY + 0.04 + h, z],
    ]);
    b.sweep(trunk, [0.07 * s, 0.035 * s], { color: BARK, sides: 6, caps: "flat" });
    // roots
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      b.spike(
        [x, CY + 0.1, z],
        [Math.sin(a) * 0.1 * s + x, CY + 0.03, Math.cos(a) * 0.1 * s + z],
        null,
        0.025 * s,
        { color: BARK, sides: 4 },
      );
    }
    const top: [number, number, number] = [x + 0.04 * s, CY + 0.04 + h, z];
    // branches
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.5;
      const br = catmull([
        [x + 0.02 * s, CY + 0.04 + h * 0.6, z],
        [x + Math.sin(a) * 0.12 * s, CY + 0.04 + h * 0.75, z + Math.cos(a) * 0.12 * s],
        [x + Math.sin(a) * 0.24 * s, CY + 0.04 + h * 0.9, z + Math.cos(a) * 0.24 * s],
      ]);
      b.sweep(br, [0.02 * s, 0.01 * s], { color: BARK, sides: 5, caps: "round" });
    }
    // canopy blobs
    const blobs: Array<[number, number, number, number, boolean]> = [
      [0, 0.06, 0, 0.26, true],
      [0.2, -0.02, 0.05, 0.18, false],
      [-0.2, -0.04, -0.04, 0.19, true],
      [0.03, 0.02, 0.2, 0.17, false],
      [-0.04, -0.03, -0.2, 0.17, true],
      [0.0, 0.2, 0.0, 0.15, false],
    ];
    for (const [dx, dy, dz, r, alt] of blobs) {
      b.part(new THREE.IcosahedronGeometry(r * s, 1), alt ? PINK : PINK_DEEP, {
        at: [top[0] + dx * s, top[1] + dy * s + 0.1 * s, top[2] + dz * s],
        scale: [1, 0.8, 1],
      });
    }
    // leaf cards on canopy
    const lf: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 34; i++) {
      const a = R() * Math.PI * 2;
      const e = (R() - 0.3) * 1.3;
      const rr = (0.24 + R() * 0.1) * s;
      lf.push(
        frame(
          [top[0] + Math.sin(a) * Math.cos(e) * rr, top[1] + 0.1 * s + Math.sin(e) * rr * 0.8, top[2] + Math.cos(a) * Math.cos(e) * rr],
          [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)],
        ),
      );
    }
    b.cards(lf, LEAF_PINK, { size: [0.08 * s, 0.1 * s], vary: 0.4, rng: rng(33 + Math.floor(x * 10)), cross: true, lean: 30, bend: 20 });
    // fallen petals on the ground
    const pet: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 12; i++) {
      const a = R() * Math.PI * 2;
      const rr = 0.1 + R() * 0.3;
      pet.push(frame([x + Math.sin(a) * rr * s, CY + 0.065, z + Math.cos(a) * rr * s], [0, 1, 0]));
    }
    b.cards(pet, LEAF_PINK, { size: 0.045, lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, rng: rng(44) });
  };
  sakura(0.62, 0.52, 0.5, 1.0);
  sakura(-0.82, 0.3, 0.38, 0.8);

  // pine trees (stacked cones)
  const pine = (x: number, z: number, h: number) => {
    b.rod([x, CY + 0.04, z], [x, CY + 0.04 + h * 0.4, z], [0.035, 0.025], { color: BARK, sides: 6, caps: "flat" });
    const tiers = 4;
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      const y0 = CY + 0.04 + h * (0.18 + t * 0.62);
      const rr = 0.2 * (1 - t * 0.7) + 0.03;
      b.lathe(
        [
          [0, y0],
          [rr, y0],
          [rr * 0.6, y0 + h * 0.08],
          [rr * 0.85, y0 + h * 0.08],
          [0, y0 + h * 0.3],
        ],
        { at: [x, 0, z], segments: 7, spin: i * 20, color: i % 2 ? PINE : PINE_LIGHT, smoothing: 0 },
      );
    }
    b.spike([x, CY + 0.04 + h * 0.98, z], [0, 1, 0], 0.08, 0.02, { color: PINE_LIGHT, sides: 5 });
    // needle cards at tier edges
    const nf: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 12; i++) {
      const a = R() * Math.PI * 2;
      const tt = R();
      const rr = 0.2 * (1 - tt * 0.7);
      nf.push(
        frame(
          [x + Math.sin(a) * rr, CY + 0.04 + h * (0.2 + tt * 0.6), z + Math.cos(a) * rr],
          [Math.sin(a) * 0.7, -0.3, Math.cos(a) * 0.7],
        ),
      );
    }
    b.cards(nf, NEEDLES, { size: [0.06, 0.09], color: "#4fbf78", vary: 0.3, rng: rng(51), cross: true });
  };
  pine(0.2, -0.78, 0.65);
  pine(-0.55, -0.55, 0.5);
  pine(0.98, 0.0, 0.42);

  // ======================================================
  // SMALL DRESSING
  // ======================================================
  // flowers
  const flowerColors = ["#ffffff", "#ffe066", "#ff8fb4", "#a78bfa"];
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.3 + R() * 0.8;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (Math.hypot(x - PX, z - PZ) < 0.7) continue;
    if (Math.hypot(x - WX, z - WZ) < 0.35) continue;
    b.rod([x, CY + 0.03, z], [x, CY + 0.1, z], 0.006, { color: "#3fa56a", sides: 4, caps: "flat" });
    b.part(new THREE.IcosahedronGeometry(0.02, 0), flowerColors[i % 4]!, { at: [x, CY + 0.11, z], scale: [1, 0.6, 1] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffb347", { at: [x, CY + 0.125, z] });
  }
  // grass tufts everywhere
  const gt = b.surface(b.root.children.length ? b.root : new THREE.Object3D());
  void gt;
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2;
    const r = Math.sqrt(R()) * RAD * 0.94;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (Math.hypot(x - PX, z - PZ) < 0.66) continue;
    if (Math.hypot(x - WX, z - WZ) < 0.3) continue;
    tufts.push(frame([x, CY + 0.04, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASS_TUFT, { size: [0.08, 0.09], vary: 0.4, rng: rng(61), color: "#8fe05d", cross: true, flow: [0, 0, 1] });

  // stone lantern (Japanese-style toro) with glowing flame
  const lantern = (x: number, z: number) => {
    b.rod([x, CY + 0.04, z], [x, CY + 0.07, z], 0.05, { color: STONE_DARK, section: { ngon: 6 } });
    b.rod([x, CY + 0.07, z], [x, CY + 0.2, z], 0.022, { color: STONE, section: { ngon: 6 } });
    b.rod([x, CY + 0.2, z], [x, CY + 0.215, z], 0.045, { color: STONE_DARK, section: { ngon: 6 } });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 0.06), FLAME, { at: [x, CY + 0.25, z] }), 1.6);
    b.lathe(
      [
        [0, 0],
        [0.06, 0],
        [0.03, 0.03],
        [0, 0.045],
      ],
      { at: [x, CY + 0.28, z], segments: 6, color: GOLD },
    );
    b.part(new THREE.SphereGeometry(0.01, 5, 4), GOLD, { at: [x, CY + 0.33, z] });
  };
  lantern(PX - 0.62, PZ + 0.8);
  lantern(PX + 0.62, PZ + 0.8);

  // signpost/torii-like gold-trimmed marker near the stairs
  b.rod([0.4, CY + 0.04, 0.9], [0.4, CY + 0.34, 0.9], 0.015, { color: BARK, sides: 5, caps: "flat" });
  b.part(new THREE.BoxGeometry(0.12, 0.07, 0.015), BARK, { at: [0.4, CY + 0.3, 0.9], rotation: [0, 18, 0] });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.018), GOLD, { at: [0.4, CY + 0.337, 0.9], rotation: [0, 18, 0] });

  // clay pots + treasure chest
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.055, 0.04],
      [0.04, 0.08],
      [0.045, 0.09],
      [0, 0.09],
    ],
    { at: [-0.5, CY + 0.04, 0.82], segments: 8, smoothing: 1, color: paint((_p, n) => (n.y > 0.8 ? SOIL : TEAL)) },
  );
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.044, 0.03],
      [0.03, 0.06],
      [0, 0.06],
    ],
    { at: [-0.62, CY + 0.04, 0.9], segments: 8, smoothing: 1, color: RED },
  );
  const chestAt: [number, number, number] = [0.22, CY + 0.04, 0.55];
  b.part(new THREE.BoxGeometry(0.16, 0.08, 0.1), BARK, { at: [chestAt[0], chestAt[1] + 0.04, chestAt[2]], rotation: [0, -15, 0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 8, 1, false, 0, Math.PI), BARK, {
    at: [chestAt[0], chestAt[1] + 0.08, chestAt[2]],
    rotation: [0, -15, 90],
  });
  for (const dx of [-0.05, 0.05]) {
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.104), GOLD, { at: [chestAt[0] + dx * 0.97, chestAt[1] + 0.06, chestAt[2] + dx * 0.26], rotation: [0, -15, 0] });
  }
  glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), FLAME, { at: [chestAt[0] + 0.005, chestAt[1] + 0.075, chestAt[2] + 0.055] }), 1.2);

  // ======================================================
  // FLOATING ROCK ISLETS with tiny trees and crystals, drifting around
  // ======================================================
  const islet = (x: number, y: number, z: number, r: number, tree: boolean, spin: number) => {
    b.lathe(
      [
        [0, y],
        [r, y],
        [r * 0.95, y - 0.02],
        [r * 0.5, y - r * 0.9],
        [0, y - r * 1.25],
      ],
      { at: [x, 0, z], segments: 7, spin, color: rockPaint },
    );
    b.lathe(
      [
        [0, y + 0.03],
        [r * 0.95, y + 0.03],
        [r, y],
        [0, y],
      ],
      { at: [x, 0, z], segments: 7, spin, color: grassPaint },
    );
    if (tree) {
      b.rod([x, y + 0.03, z], [x, y + 0.1, z], 0.012, { color: BARK, sides: 5, caps: "flat" });
      b.part(new THREE.IcosahedronGeometry(0.06, 0), PINK, { at: [x, y + 0.14, z], scale: [1, 0.85, 1] });
      b.part(new THREE.IcosahedronGeometry(0.04, 0), PINK_DEEP, { at: [x + 0.04, y + 0.12, z + 0.02] });
    } else {
      glow(b.spike([x, y + 0.02, z], [0, 1, 0], 0.12, 0.025, { color: CRYSTAL, sides: 5 }), 1.2);
      glow(b.spike([x + 0.04, y + 0.02, z + 0.02], [0.3, 1, 0], 0.07, 0.018, { color: CRYSTAL2, sides: 5 }), 1.2);
    }
  };
  islet(-1.05, 1.0, 0.95, 0.17, true, 10);
  islet(1.1, 0.78, 0.85, 0.14, false, 30);
  islet(-0.6, 1.9, -1.0, 0.13, false, 5);
  islet(0.3, 1.78, 1.18, 0.1, true, 50);
  // tiny pebbles drifting
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.2 + R() * 0.55;
    b.part(new THREE.IcosahedronGeometry(0.025 + R() * 0.03, 0), i % 2 ? ROCK : ROCK_WARM, {
      at: [Math.sin(a) * r, 0.5 + R() * 1.3, Math.cos(a) * r],
      rotation: [R() * 90, R() * 90, 0],
    });
  }

  // hanging rope bridge fragment from island underside to an islet? small vines instead
  const vineFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 22; i++) {
    const a = R() * Math.PI * 2;
    const r = RAD * (0.9 + R() * 0.08);
    vineFrames.push(frame([Math.sin(a) * r, CY - 0.1, Math.cos(a) * r], [0, 1, 0]));
  }
  b.cards(vineFrames, LEAF_GREEN, { size: [0.07, 0.16], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: rng(71), cross: true });
  // gold trim ring around the island rim
  const rim = polyline(
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return [Math.sin(a) * RAD * 0.99, CY - 0.19, Math.cos(a) * RAD * 0.99] as [number, number, number];
    }),
    { closed: true },
  );
  b.sweep(rim, 0.012, { color: GOLD, sides: 4, caps: "none" });

  // grain on trunks etc. kept simple; unused imports guarded
  void grain;
  void mottle;
  void stripes;
  void gradient;
  void TEAL;
  void WHITE;
  void TEAL;

  return b.root;
}
