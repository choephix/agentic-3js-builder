import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, noise, paint, patches, stripes } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Floating Island Ruins",
  description:
    "A cel-shaded sky island hanging over the clouds: mossy rock underside with glowing crystals, a ruined wind-shrine arch with a rune platform, a pond whose stream spills off the edge as a waterfall, a sakura, a round tree and a pine.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const GY = 1.42; // ground height of the island top

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "floatingIslandDiorama", paintSize: 2048 });
  const R = rng(11);

  // ---------- palette ----------
  const MOSS = cel("#68c04e");
  const ROCKC = cel(patches("#5f5262", ["#a08d7e", "#8c7a73", "#b09d8a"], { size: 0.3, gap: 0.02, seed: 2 }));
  const DEEPROCK = cel(patches("#3f3550", ["#7a6a78", "#6c5f70", "#86767c"], { size: 0.3, gap: 0.02, seed: 6 }));
  const ROCK = paint((p, n) => (n.y > 0.6 && noise(p, 0.22, 4) > 0.42 ? MOSS : p.y < 0.55 ? DEEPROCK : ROCKC));
  const STONEC = cel(patches("#b8ad98", ["#e9e1cf", "#ddd3bd", "#f1ead8"], { size: 0.14, gap: 0.015, seed: 5 }));
  const STONE = paint((p, n) => (n.y > 0.7 && noise(p, 0.13, 8) > 0.58 ? MOSS : STONEC));
  const DIRT = cel("#a87348", "#7d4f3c");
  const GRASS = cel(mottle("#86d95a", "#63c24f", { size: 0.28, seed: 3 }));
  const BARK = cel(grain("#8a5a3a", "#6b4330", { size: 0.02 }));
  const LEAF_G = cel(mottle("#76d658", "#4faa4a", { size: 0.18, seed: 9 }));
  const LEAF_G2 = cel(mottle("#9be466", "#62be4e", { size: 0.16, seed: 12 }));
  const LEAF_P = cel(mottle("#ffbfd6", "#ff94b8", { size: 0.15, seed: 3 }));
  const PINE = cel(mottle("#3f9a5a", "#2f7e52", { size: 0.15, seed: 4 }));
  const CLOUD = cel("#ffffff", "#bdd0f4");
  const GOLD = "#e8b84a";
  const GOLD_D = "#b9842f";
  const TEAL = "#4fe3d6";
  const TEAL_D = "#2c9fa8";
  const WATER = "#59cfee";

  // ---------- drawings ----------
  const ticks: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r0 = i % 2 ? 72 : 66;
    ticks.push(
      `<line x1="${100 + Math.cos(a) * r0}" y1="${100 + Math.sin(a) * r0}" x2="${100 + Math.cos(a) * 80}" y2="${100 + Math.sin(a) * 80}" stroke="#7ff3ea" stroke-width="3"/>`,
    );
  }
  const tri = (rot: number) => {
    const pts = [0, 1, 2].map((k) => {
      const a = rot + (k / 3) * Math.PI * 2;
      return `${100 + Math.cos(a) * 56},${100 + Math.sin(a) * 56}`;
    });
    return `<polygon points="${pts.join(" ")}" fill="none" stroke="#7ff3ea" stroke-width="2.5"/>`;
  };
  const RUNE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="none" stroke="#7ff3ea" stroke-width="3"/><circle cx="100" cy="100" r="86" fill="none" stroke="#e8b84a" stroke-width="2.5"/>${ticks.join("")}<circle cx="100" cy="100" r="60" fill="none" stroke="#7ff3ea" stroke-width="2.5"/>${tri(-Math.PI / 2)}${tri(Math.PI / 2)}<circle cx="100" cy="100" r="14" fill="none" stroke="#e8b84a" stroke-width="3"/><circle cx="100" cy="100" r="5" fill="#7ff3ea"/></svg>`,
    { size: 512 },
  );
  const RIPPLE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#e6fbff" stroke-width="2.5" stroke-dasharray="40 14"/><circle cx="50" cy="50" r="26" fill="none" stroke="#e6fbff" stroke-width="2.5" stroke-dasharray="28 12"/><circle cx="50" cy="50" r="12" fill="none" stroke="#e6fbff" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const TUFT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50"><path d="M4 50 Q8 26 3 6 Q15 24 17 50Z" fill="#5dbb46"/><path d="M15 50 Q18 22 22 0 Q26 24 27 50Z" fill="#8fe063"/><path d="M25 50 Q30 28 37 10 Q35 32 37 50Z" fill="#5dbb46"/></svg>`,
    { size: 128 },
  );
  const VINE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 100"><path d="M12 0 Q6 20 12 40 Q18 60 11 100" fill="none" stroke="#4a9a3f" stroke-width="3"/><ellipse cx="6" cy="24" rx="5" ry="3" fill="#79d160"/><ellipse cx="18" cy="46" rx="5" ry="3" fill="#8fe063"/><ellipse cx="6" cy="66" rx="5" ry="3" fill="#79d160"/><ellipse cx="17" cy="84" rx="4" ry="3" fill="#8fe063"/></svg>`,
    { size: 256 },
  );
  const PETAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 1 Q19 8 10 19 Q1 8 10 1Z" fill="#ffb3cf"/><path d="M10 3 Q11 10 10 17" stroke="#ff8fb5" stroke-width="1.5" fill="none"/></svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  const P = (g: THREE.BufferGeometry, color: Parameters<typeof b.part>[1], at: number[], o: object = {}) =>
    b.part(g, color, { at, ...o });
  const free = (x: number, z: number) =>
    Math.hypot(x - 0.35, z - 0.45) > 0.5 &&
    Math.hypot(x + 0.55, z + 0.3) > 0.85 &&
    !(Math.abs(x - 0.33) < 0.15 && z > 0.6) &&
    Math.hypot(x, z) < 1.12 &&
    Math.hypot(x - 0.65, z + 0.6) > 0.2 &&
    Math.hypot(x + 0.7, z - 0.6) > 0.15;
  const WA = Math.atan2(0.35, 1.29);
  const nearFall = (a: number) => Math.abs(Math.atan2(Math.sin(a - WA), Math.cos(a - WA))) < 0.2;

  // ---------- island body ----------
  b.lathe(
    [
      [0, 0],
      [0.1, 0.12],
      [0.28, 0.34],
      [0.5, 0.56],
      [0.75, 0.78],
      [0.98, 0.98],
      [1.15, 1.12],
      [1.24, 1.26],
      [0, 1.26],
    ],
    { at: [0, 0, 0], color: ROCK, segments: 10, spin: 8 },
  );
  const cap = b.lathe(
    [
      [0, GY - 0.22],
      [1.18, GY - 0.22],
      [1.33, GY - 0.12],
      [1.31, GY - 0.03],
      [1.0, GY - 0.005],
      [0, GY],
    ],
    {
      at: [0, 0, 0],
      color: paint((_p, n) => (n.y > 0.45 ? GRASS : DIRT)),
      segments: 18,
    },
  );

  // hanging rock spikes and glowing crystals on the underside
  const coneR = (y: number) => 0.1 + (y / 1.26) * 1.14;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.4;
    const y = 0.5 + R() * 0.6;
    const r = coneR(y) - 0.06;
    b.spike([Math.sin(a) * r, y, Math.cos(a) * r], [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.35], 0.3 + R() * 0.25, 0.09 + R() * 0.05, ROCK, { sides: 6 });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const y = 0.4 + (i % 3) * 0.2;
    const r = coneR(y) - 0.04;
    const dir = [Math.sin(a) * 0.8, -0.35, Math.cos(a) * 0.8];
    glow(b.spike([Math.sin(a) * r, y, Math.cos(a) * r], dir, 0.2 + (i % 2) * 0.06, 0.04, TEAL, { sides: 5 }), 1.2);
    b.spike([Math.sin(a + 0.18) * (r + 0.01), y + 0.04, Math.cos(a + 0.18) * (r + 0.01)], [Math.sin(a) * 0.9, -0.1, Math.cos(a) * 0.9], 0.11, 0.025, TEAL_D, { sides: 5 });
  }
  // gold-banded strata ring on the cliff
  const bandPts: number[][] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const r = coneR(1.05) + 0.015;
    bandPts.push([Math.sin(a) * r, 1.05, Math.cos(a) * r]);
  }
  b.sweep(catmull(bandPts, { closed: true }), 0.012, { color: GOLD_D, sides: 4 });

  // rim stones
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + R() * 0.1;
    if (nearFall(a)) continue;
    const s = 0.07 + R() * 0.07;
    P(new THREE.IcosahedronGeometry(1, 0), ROCK, [Math.sin(a) * 1.29, GY - 0.04, Math.cos(a) * 1.29], {
      scale: [s * 1.2, s * 0.8, s],
      rotation: [R() * 50, R() * 360, R() * 40],
    });
  }
  // vines hanging from the rim
  const vf: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 + R() * 0.1;
    if (nearFall(a)) continue;
    vf.push(frame([Math.sin(a) * 1.3, GY - 0.12, Math.cos(a) * 1.3], [0, 1, 0]));
  }
  b.cards(vf, VINE, { size: [0.07, 0.1 + 0.3], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: rng(5), spin: 180 });

  // mounds
  for (const [x, z, s] of [
    [-1.0, 0.2, 0.35],
    [0.9, -0.8, 0.3],
    [-0.2, 0.9, 0.3],
    [-0.1, -0.95, 0.35],
  ]) {
    P(new THREE.SphereGeometry(1, 10, 6), GRASS, [x, GY - 0.01, z], { scale: [s, s * 0.28, s * 0.85] });
  }

  // grass tufts
  const hits = b.surface(cap).scatter(260, {
    rng: rng(7),
    minDist: 0.065,
    filter: (h) => h.n.y > 0.85 && free(h.at.x, h.at.z),
  });
  b.cards(hits, TUFT, { size: [0.07, 0.1], vary: 0.3, rng: rng(8), cross: true, spin: 180 });

  // flowers
  const FL = ["#fff3b0", "#ff9ccf", "#ffffff", "#ffd23f", "#b99bff"];
  let fc = 0;
  for (let k = 0; k < 120 && fc < 24; k++) {
    const x = (R() - 0.5) * 2.2;
    const z = (R() - 0.5) * 2.2;
    if (!free(x, z)) continue;
    const h = 0.07 + R() * 0.05;
    b.rod([x, GY - 0.01, z], [x + 0.01, GY + h, z], 0.004, "#4fa63f", { sides: 4 });
    const col = FL[fc % FL.length];
    P(new THREE.SphereGeometry(0.026, 6, 4), col, [x + 0.01, GY + h + 0.01, z], { scale: [1, 0.7, 1] });
    P(new THREE.SphereGeometry(0.01, 5, 3), "#ffb02e", [x + 0.01, GY + h + 0.022, z]);
    fc++;
  }

  // ---------- ruins ----------
  const RC: [number, number] = [-0.55, -0.3];
  const PY = GY + 0.08;
  b.lathe(
    [
      [0, 0],
      [0.66, 0],
      [0.66, 0.05],
      [0.61, 0.08],
      [0, 0.08],
    ],
    { at: [RC[0], GY - 0.02, RC[1]], color: STONE, segments: 16 },
  );
  b.lathe(
    [
      [0.655, 0.03],
      [0.675, 0.03],
      [0.675, 0.065],
      [0.655, 0.065],
    ],
    { at: [RC[0], GY - 0.02, RC[1]], color: GOLD, segments: 16 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.1, 1.1), "#ffffff", {
      at: [RC[0], PY + 0.004, RC[1]],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: RUNE,
    }),
    1,
  );
  // steps
  P(new THREE.BoxGeometry(0.5, 0.05, 0.12), STONE, [RC[0] + 0.02, GY + 0.02, 0.42]);
  P(new THREE.BoxGeometry(0.4, 0.03, 0.1), STONE, [RC[0] + 0.02, GY + 0.01, 0.5]);
  // stepping stones to the bridge
  for (const [x, z] of [
    [-0.1, 0.55],
    [0.05, 0.7],
    [0.0, 0.9],
  ]) {
    P(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 7), STONE, [x, GY, z], { rotation: [0, R() * 60, 0] });
  }

  const column = (x: number, z: number, h: number, broken: boolean) => {
    const y0 = PY - 0.005;
    b.lathe(
      broken
        ? [
            [0, 0],
            [0.115, 0],
            [0.115, 0.05],
            [0.085, 0.08],
            [0.08, h],
            [0.02, h + 0.05],
            [0, h - 0.02],
          ]
        : [
            [0, 0],
            [0.115, 0],
            [0.115, 0.05],
            [0.085, 0.08],
            [0.08, h - 0.09],
            [0.105, h - 0.05],
            [0.105, h],
            [0, h],
          ],
      { at: [x, y0, z], color: STONE, segments: 8 },
    );
    b.lathe(
      [
        [0.09, 0],
        [0.1, 0],
        [0.1, 0.018],
        [0.09, 0.018],
      ],
      { at: [x, y0 + 0.1, z], color: GOLD, segments: 8 },
    );
    if (!broken) {
      b.lathe(
        [
          [0.09, 0],
          [0.1, 0],
          [0.1, 0.018],
          [0.09, 0.018],
        ],
        { at: [x, y0 + h - 0.16, z], color: GOLD, segments: 8 },
      );
    }
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      b.rod([x + Math.sin(a) * 0.084, y0 + 0.14, z + Math.cos(a) * 0.084], [x + Math.sin(a) * 0.084, y0 + (broken ? h - 0.02 : h - 0.2), z + Math.cos(a) * 0.084], 0.005, "#a99f8a", { sides: 4 });
    }
    glow(P(new THREE.BoxGeometry(0.035, 0.05, 0.012), TEAL, [x, y0 + 0.3, z + 0.088]), 1.2);
  };
  column(-0.25, -0.58, 0.85, false);
  column(-0.88, -0.58, 0.48, true);
  // second pair, lower stumps
  column(-0.95, -0.05, 0.3, true);
  column(0.0, -0.45, 0.4, true);
  // lintel
  P(new THREE.BoxGeometry(0.62, 0.1, 0.2), STONE, [-0.46, PY + 0.9, -0.58], { rotation: [0, 0, -4] });
  P(new THREE.BoxGeometry(0.62, 0.03, 0.012), GOLD, [-0.46, PY + 0.9, -0.478], { rotation: [0, 0, -4] });
  for (let i = 0; i < 3; i++) {
    glow(P(new THREE.BoxGeometry(0.04, 0.025, 0.012), TEAL, [-0.3 - i * 0.15, PY + 0.9 - i * 0.01, -0.474], { rotation: [0, 0, -4] }), 1.2);
  }
  // banner under the lintel
  const bannerPaint = stripes("#2fbfc4", "#f4e6a8", { size: 0.04, axis: "y", width: 0.18, seed: 2 });
  b.extrude(
    [
      [-0.06, 0],
      [0.06, 0],
      [0.06, -0.3],
      [0, -0.23, "sharp"],
      [-0.06, -0.3],
    ],
    { at: [-0.4, PY + 0.84, -0.47], x: [1, 0, 0], thickness: 0.012, color: bannerPaint },
  );
  P(new THREE.SphereGeometry(0.018, 6, 4), GOLD, [-0.4, PY + 0.5, -0.47]);
  // fallen pieces
  P(new THREE.CylinderGeometry(0.08, 0.085, 0.32, 8), STONE, [-1.0, GY + 0.08, 0.15], { rotation: [0, 25, 90] });
  P(new THREE.BoxGeometry(0.18, 0.1, 0.16), STONE, [-0.3, PY + 0.05, -0.05], { rotation: [0, 30, 10] });
  P(new THREE.BoxGeometry(0.22, 0.09, 0.14), STONE, [-0.85, GY + 0.04, -0.1], { rotation: [5, 70, 8] });
  for (let i = 0; i < 8; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.45 + R() * 0.3;
    const s = 0.03 + R() * 0.035;
    P(new THREE.BoxGeometry(s * 2, s, s * 1.6), STONE, [RC[0] + Math.sin(a) * r, PY + s / 2, RC[1] + Math.cos(a) * r], {
      rotation: [R() * 40, R() * 360, R() * 40],
    });
  }
  // wind crystal with gold rings over the platform
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.03],
      [0.06, 0.06],
      [0.05, 0.14],
      [0, 0.14],
    ],
    { at: [RC[0], PY, RC[1]], color: STONE, segments: 8 },
  );
  b.lathe(
    [
      [0.052, 0.08],
      [0.07, 0.08],
      [0.07, 0.1],
      [0.052, 0.1],
    ],
    { at: [RC[0], PY, RC[1]], color: GOLD, segments: 8 },
  );
  const CY = PY + 0.5;
  glow(P(new THREE.OctahedronGeometry(0.13, 0), "#8ff5ec", [RC[0], CY, RC[1]], { scale: [0.8, 1.7, 0.8] }), 1.5);
  glow(P(new THREE.OctahedronGeometry(0.05, 0), TEAL, [RC[0] + 0.24, CY + 0.15, RC[1] + 0.05], { scale: [0.8, 1.5, 0.8] }), 1.4);
  glow(P(new THREE.OctahedronGeometry(0.04, 0), TEAL, [RC[0] - 0.22, CY - 0.1, RC[1] - 0.1], { scale: [0.8, 1.5, 0.8] }), 1.4);
  for (const [tx, tz, rad] of [
    [20, 0, 0.3],
    [-35, 60, 0.38],
  ]) {
    const pts: number[][] = [];
    const q = new THREE.Euler((tx * Math.PI) / 180, 0, (tz * Math.PI) / 180);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * rad, 0, Math.sin(a) * rad).applyEuler(q);
      pts.push([RC[0] + v.x, CY + v.y, RC[1] + v.z]);
    }
    b.sweep(catmull(pts, { closed: true }), 0.009, { color: GOLD, sides: 4 });
  }

  // ---------- pond, stream, bridge, waterfall ----------
  const POND: [number, number] = [0.35, 0.45];
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.36, 0.035],
      [0, 0.035],
    ],
    { at: [POND[0], GY - 0.01, POND[1]], color: WATER, segments: 14 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
    at: [POND[0] - 0.05, GY + 0.03, POND[1] - 0.02],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: RIPPLE,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    if (Math.abs(a) < 0.35 || Math.abs(a - Math.PI * 2) < 0.35) continue; // keep the stream mouth open
    const s = 0.05 + R() * 0.03;
    P(new THREE.IcosahedronGeometry(1, 0), ROCK, [POND[0] + Math.sin(a) * 0.38, GY + 0.01, POND[1] + Math.cos(a) * 0.38], {
      scale: [s, s * 0.8, s],
      rotation: [R() * 40, R() * 360, 0],
    });
  }
  for (const [dx, dz, s] of [
    [-0.12, 0.08, 0.055],
    [0.1, -0.1, 0.045],
    [0.05, 0.14, 0.04],
  ]) {
    P(new THREE.CylinderGeometry(s, s, 0.008, 8), "#56b84a", [POND[0] + dx, GY + 0.032, POND[1] + dz]);
  }
  P(new THREE.SphereGeometry(0.02, 6, 4), "#ff9ccf", [POND[0] - 0.12, GY + 0.045, POND[1] + 0.08], { scale: [1, 0.7, 1] });
  const sy = GY + 0.012;
  b.sweep(
    catmull([
      [0.35, sy, 0.7],
      [0.32, sy, 0.95],
      [0.36, sy, 1.15],
      [0.35, sy, 1.31],
    ]),
    () => [0.07, 0.012],
    { color: WATER, section: "box", caps: "flat" },
  );
  // banks along the stream
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = 0.78 + i * 0.1;
      const x = 0.34 + s * (0.1 + R() * 0.02);
      const sz = 0.03 + R() * 0.02;
      P(new THREE.IcosahedronGeometry(1, 0), ROCK, [x, GY, z], { scale: [sz, sz * 0.7, sz], rotation: [0, R() * 90, 0] });
    }
  }
  // lip stone and fall
  P(new THREE.BoxGeometry(0.1, 0.06, 0.1), ROCK, [0.2, GY - 0.03, 1.25], { rotation: [0, 8, 0] });
  P(new THREE.BoxGeometry(0.1, 0.06, 0.1), ROCK, [0.5, GY - 0.03, 1.22], { rotation: [0, -10, 0] });
  const fallPaint = paint((p, _n, _s) => {
    const base = stripes("#6fd6f2", "#eefcff", { size: 0.05, axis: "x", width: 0.35, seed: 4 });
    return p.y < 0.6 ? "#e6fbff" : base;
  });
  b.extrude(
    [
      [-0.09, 0],
      [0.09, 0],
      [0.1, 0.99],
      [-0.1, 0.99],
    ],
    { at: [0.35, 0.42, 1.31], x: [1, 0, 0], thickness: 0.05, color: fallPaint },
  );
  for (const dx of [-0.05, 0.05]) {
    b.rod([0.35 + dx, 1.4, 1.34], [0.35 + dx * 1.2, 0.5, 1.34], 0.008, "#d9f7ff", { sides: 4 });
  }
  // mist
  for (const [dx, dy, dz, s] of [
    [0, 0.42, 0, 0.17],
    [-0.14, 0.4, 0.04, 0.12],
    [0.14, 0.41, 0.02, 0.13],
    [0.05, 0.5, 0.06, 0.1],
    [-0.06, 0.34, 0.08, 0.1],
  ]) {
    P(new THREE.SphereGeometry(1, 8, 6), CLOUD, [0.35 + dx, dy, 1.33 + dz], { scale: [s * 1.2, s * 0.7, s] });
  }
  // bridge
  for (let i = 0; i < 7; i++) {
    const x = 0.14 + i * 0.065;
    const arch = Math.sin((i / 6) * Math.PI) * 0.03;
    P(new THREE.BoxGeometry(0.05, 0.02, 0.17), "#b27a4c", [x, GY + 0.035 + arch, 0.95]);
  }
  for (const s of [1, -1]) {
    for (const x of [0.13, 0.35, 0.57]) {
      b.rod([x, GY, 0.95 + s * 0.09], [x, GY + 0.12 + (x === 0.35 ? 0.03 : 0), 0.95 + s * 0.09], 0.01, "#8a5a3a", { sides: 5 });
    }
    b.rod([0.13, GY + 0.11, 0.95 + s * 0.09], [0.35, GY + 0.15, 0.95 + s * 0.09], 0.007, "#d8a070", { sides: 4 });
    b.rod([0.35, GY + 0.15, 0.95 + s * 0.09], [0.57, GY + 0.11, 0.95 + s * 0.09], 0.007, "#d8a070", { sides: 4 });
  }

  // ---------- lanterns ----------
  const lantern = (x: number, z: number) => {
    P(new THREE.CylinderGeometry(0.07, 0.08, 0.03, 6), STONE, [x, GY + 0.01, z]);
    P(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 6), STONE, [x, GY + 0.085, z]);
    P(new THREE.CylinderGeometry(0.075, 0.06, 0.02, 6), STONE, [x, GY + 0.16, z]);
    glow(P(new THREE.BoxGeometry(0.07, 0.06, 0.07), "#ffcf6a", [x, GY + 0.2, z]), 1.3);
    P(new THREE.ConeGeometry(0.1, 0.06, 6), STONE, [x, GY + 0.26, z]);
    P(new THREE.SphereGeometry(0.014, 6, 4), GOLD, [x, GY + 0.3, z]);
  };
  lantern(0.7, 0.85);
  lantern(-0.1, 0.35);
  lantern(-1.12, -0.5);

  // ---------- trees ----------
  const trunk = (x: number, z: number, h: number, lean: number, r: number) => {
    b.sweep(
      catmull([
        [x, GY - 0.03, z],
        [x + lean * 0.2, GY + h * 0.4, z + 0.02],
        [x + lean * 0.7, GY + h * 0.75, z - 0.02],
        [x + lean, GY + h, z],
      ]),
      [r, r * 0.5],
      { color: BARK, sides: 6, caps: "flat" },
    );
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      b.spike([x + Math.sin(a) * 0.02, GY + 0.05, z + Math.cos(a) * 0.02], [Math.sin(a), -0.5, Math.cos(a)], r * 3, r * 0.6, BARK, { sides: 5 });
    }
  };
  const canopy = (cx: number, cy: number, cz: number, r: number, c1: object, c2: object, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + R();
      const rr = r * (0.35 + R() * 0.35);
      const s = r * (0.5 + R() * 0.3);
      const up = i % 3 === 0 ? r * 0.35 : (R() - 0.3) * r * 0.3;
      P(new THREE.IcosahedronGeometry(1, 1), i % 2 ? c1 : c2, [cx + Math.sin(a) * rr, cy + up, cz + Math.cos(a) * rr], {
        scale: [s, s * 0.85, s],
        rotation: [R() * 90, R() * 90, 0],
      });
    }
    P(new THREE.IcosahedronGeometry(1, 1), c1, [cx, cy + r * 0.2, cz], { scale: r * 0.75 });
  };
  // sakura
  const SK = [0.65, -0.62];
  trunk(SK[0], SK[1], 0.9, 0.12, 0.07);
  b.rod([SK[0] + 0.05, GY + 0.55, SK[1]], [SK[0] - 0.2, GY + 0.9, SK[1] + 0.05], [0.03, 0.015], BARK, { sides: 5 });
  b.rod([SK[0] + 0.07, GY + 0.65, SK[1]], [SK[0] + 0.32, GY + 0.95, SK[1] - 0.08], [0.028, 0.014], BARK, { sides: 5 });
  canopy(SK[0] + 0.12, GY + 1.12, SK[1], 0.5, LEAF_P, cel(mottle("#ffd0e2", "#ffa5c4", { size: 0.14, seed: 7 })), 9);
  canopy(SK[0] - 0.22, GY + 0.95, SK[1] + 0.05, 0.26, LEAF_P, LEAF_P, 4);
  canopy(SK[0] + 0.33, GY + 0.98, SK[1] - 0.08, 0.24, LEAF_P, LEAF_P, 4);
  const pf: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 40; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.1 + R() * 0.7;
    pf.push(frame([SK[0] + 0.1 + Math.sin(a) * r, GY + 0.1 + R() * 1.2, SK[1] + Math.cos(a) * r], [0, 1, 0]));
  }
  b.cards(pf, PETAL, { size: 0.045, lean: 90, flow: [1, 0, 0], spin: 180, rng: rng(21), vary: 0.3 });
  // roots mound
  P(new THREE.SphereGeometry(1, 8, 5), DIRT, [SK[0], GY - 0.02, SK[1]], { scale: [0.16, 0.05, 0.16] });
  // round green tree
  const GT = [-0.7, 0.62];
  trunk(GT[0], GT[1], 0.6, -0.06, 0.05);
  canopy(GT[0] - 0.06, GY + 0.78, GT[1], 0.32, LEAF_G, LEAF_G2, 7);
  // pine
  const PT = [0.98, -0.1];
  b.rod([PT[0], GY - 0.02, PT[1]], [PT[0], GY + 0.2, PT[1]], 0.035, BARK, { sides: 6 });
  [
    [0.2, 0.32, 0.24],
    [0.17, 0.28, 0.4],
    [0.13, 0.25, 0.55],
    [0.09, 0.22, 0.7],
  ].forEach(([rad, hh, yy]) => {
    P(new THREE.ConeGeometry(rad, hh, 7), PINE, [PT[0], GY + yy, PT[1]]);
  });
  glow(P(new THREE.OctahedronGeometry(0.03, 0), "#fff0a0", [PT[0], GY + 0.92, PT[1]], { scale: [1, 1.5, 1] }), 1.3);
  // bushes
  for (const [x, z, s] of [
    [0.1, -0.75, 0.13],
    [-0.4, 0.75, 0.1],
    [0.95, 0.35, 0.11],
    [-1.05, -0.75, 0.12],
    [0.45, -0.1, 0.09],
  ]) {
    P(new THREE.IcosahedronGeometry(1, 1), LEAF_G2, [x, GY + s * 0.5, z], { scale: [s, s * 0.8, s] });
    P(new THREE.IcosahedronGeometry(1, 0), LEAF_G, [x + s * 0.6, GY + s * 0.3, z + s * 0.3], { scale: s * 0.6 });
  }

  // ---------- clouds ----------
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const r = 1.0 + R() * 0.35;
    const cx = Math.sin(a) * r;
    const cz = Math.cos(a) * r;
    const cy = 0.35 + R() * 0.3;
    if (Math.hypot(cx - 0.35, cz - 1.33) < 0.45) continue;
    const base = 0.12 + R() * 0.06;
    for (let k = 0; k < 4; k++) {
      const s = base * (0.7 + R() * 0.5);
      P(new THREE.SphereGeometry(1, 8, 6), CLOUD, [cx + (k - 1.5) * base * 0.9, cy + (k % 2) * 0.03, cz + (R() - 0.5) * 0.1], {
        scale: [s * 1.2, s * 0.7, s],
      });
    }
  }

  // ---------- floating islets ----------
  const islet = (x: number, y: number, z: number, s: number, tree: boolean) => {
    b.lathe(
      [
        [0, 0],
        [0.1 * s, 0.1 * s],
        [0.22 * s, 0.2 * s],
        [0.3 * s, 0.3 * s],
        [0, 0.3 * s],
      ],
      { at: [x, y, z], color: ROCK, segments: 7 },
    );
    b.lathe(
      [
        [0, 0.26 * s],
        [0.31 * s, 0.26 * s],
        [0.3 * s, 0.33 * s],
        [0, 0.35 * s],
      ],
      { at: [x, y, z], color: GRASS, segments: 7 },
    );
    if (tree) {
      b.rod([x, y + 0.33 * s, z], [x, y + 0.5 * s, z], 0.015, BARK, { sides: 5 });
      P(new THREE.IcosahedronGeometry(1, 1), LEAF_G2, [x, y + 0.6 * s, z], { scale: [0.2 * s, 0.17 * s, 0.2 * s] });
    } else {
      glow(P(new THREE.OctahedronGeometry(0.06 * s, 0), TEAL, [x, y + 0.45 * s, z], { scale: [0.8, 1.7, 0.8] }), 1.4);
    }
    glow(b.spike([x, y + 0.02 * s, z], [0, -1, 0], 0.12 * s, 0.03 * s, TEAL, { sides: 5 }), 1.2);
  };
  islet(-1.1, 1.85, 0.75, 0.9, true);
  islet(1.35, 2.0, -0.35, 0.7, false);
  islet(-0.1, 2.45, -1.0, 0.55, true);

  return b.root;
}
