import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mix, mottle, noise, paint, smoothstep, spots } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Part, PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A cel-shaded floating island: mossy rock underside with glowing anemo crystals, a spring pond feeding a waterfall that spills off the rim, a ruined gold-trimmed temple with a broken arch and a floating crystal, a round fruit tree, a sakura with wind chimes, pines, a lantern post, signpost, flowers, islets, clouds and drifting wind ribbons.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "floatingIslandDiorama" });
  const R = rng(20240611);
  const root = b.joint("island", { at: [0, 0, 0] });

  const PI2 = Math.PI * 2;
  const DEG = Math.PI / 180;
  const TOP = 1.6;
  const O = (...pts: OutlinePoint[]) => pts;

  // ---- flat (glow) colours ------------------------------------------------------------------------------------
  const CR_A = "#3ee8de";
  const CR_B = "#9af3ff";
  const CR_C = "#b9a4ff";
  const WARM = "#ffd88a";

  // ---- paints --------------------------------------------------------------------------------------------------
  const grassBase = mottle("#9be563", "#6ed05c", { size: 0.32, contrast: 1.2, seed: 3 });
  const GRASS = cel(grassBase);
  const CAP = cel(
    paint((p, n) => {
      if (n.y > 0.55) return grassBase;
      const edge = 1.515 + 0.045 * zigzag(Math.atan2(p.x, p.z) * 1.9);
      if (p.y > edge) return "#7fd25c";
      return noise(p, 0.07, 9) > 0.62 ? "#a58061" : "#86654a";
    }),
  );
  const ISLET_CAP = cel(paint((_p, n) => (n.y > 0.55 ? grassBase : "#8d6a4e")));

  const MOSS = "#79c64f";
  const ROCK = cel(
    paint((p, n) => {
      const w = p.y * 16 + noise(p, 0.4, 5) * 3;
      const f = w - Math.floor(w);
      const c: string = f < 0.16 ? "#a79078" : f < 0.6 ? "#d6c2a4" : "#c0a98c";
      let col = mix(c, "#8f7f93", smoothstep(0.9, 0.5, p.y) * 0.6);
      const mossAmt = smoothstep(1.2, 1.5, p.y + (noise(p, 0.15, 7) - 0.5) * 0.4) * (n.y > -0.2 ? 1 : 0.3);
      col = mix(col, MOSS, mossAmt);
      return col;
    }),
  );

  const stoneBase = (lines: boolean) =>
    paint((p, n) => {
      let c = mix("#f1e9d8", "#d9ceb6", smoothstep(0.35, 0.7, noise(p, 0.14, 11)));
      if (lines && n.y < 0.6 && (((p.y / 0.12) % 1) + 1) % 1 < 0.07) c = mix(c, "#b3a68c", 0.8);
      const moss = Math.max(
        smoothstep(1.76, 1.64, p.y + (noise(p, 0.07, 4) - 0.5) * 0.12),
        n.y > 0.6 ? smoothstep(0.64, 0.8, noise(p, 0.16, 2)) * 0.8 : 0,
      );
      return mix(c, "#78bd4c", moss * 0.9);
    });
  const STONE = cel(stoneBase(true));
  const STONE_PLAIN = cel(stoneBase(false));

  const GOLD = cel("#ffd35a", "#d08a2c");
  const CLOUD = cel("#ffffff", "#bcd4f5");
  const BARK = cel(grain("#8a6040", "#5f4030", { size: 0.03, axis: "y" }));
  const BARK_PINK = cel(grain("#8a5a62", "#5e3a46", { size: 0.03, axis: "y" }));
  const WOOD = cel(grain("#a87448", "#7f5236", { size: 0.025, axis: "y" }));
  const PLANK = cel(mottle("#b98657", "#a47046", { size: 0.05, seed: 17 }));
  const LEAF_A = cel(mottle("#8be35a", "#5cc95e", { size: 0.18, seed: 21 }));
  const LEAF_B = cel(mottle("#6fd05a", "#3fb15e", { size: 0.2, seed: 22 }));
  const LEAF_L = cel("#c4f27a", "#76c85a");
  const PINK_A = cel(mottle("#ffc2da", "#ff9cc2", { size: 0.15, seed: 31 }));
  const PINK_B = cel(mottle("#ffb0cf", "#f783b4", { size: 0.15, seed: 32 }));
  const PINE_A = cel(mottle("#3fb070", "#2f9a66", { size: 0.12, seed: 71 }));
  const PINE_B = cel(mottle("#46b86a", "#35a362", { size: 0.12, seed: 72 }));
  const SUNSET = cel("#ff9a3c", "#e0605a");
  const CHIME = cel("#bfeeff", "#7fb7e0");
  const STREAM = cel("#7cdcf6", "#52b5e8");
  const MUSH_STEM = cel("#fff0d8", "#e8c9b0");
  const MUSH_CAP = cel(spots("#ff7f8f", "#fff0dc", { size: 0.035, amount: 0.4, seed: 51 }));
  const REED = cel("#6cc255", "#3f9a55");
  const CATTAIL = cel("#8a5a3a", "#5a3a30");
  const PAD = cel("#6fd05a", "#3fa85a");
  const LOTUS = cel("#ffb7d3", "#f27fae");

  const FALL = cel(
    paint((_p, _n, s) => {
      const k = noise(new THREE.Vector3(s[0], s[1] * 0.12, 0.5), 0.06, 41);
      const c = mix("#6fd3f2", "#c9f4ff", smoothstep(0.42, 0.7, k));
      return mix(c, "#ffffff", Math.max(smoothstep(-0.8, -1.05, s[1]), smoothstep(-0.06, 0.02, s[1]) * 0.7));
    }),
  );

  // ---- textures ------------------------------------------------------------------------------------------------
  const TUFT = svg(
    `<svg viewBox="0 0 48 64"><path d="M6 64 Q8 34 2 10 Q15 30 19 64Z" fill="#59bd54"/><path d="M16 64 Q22 28 24 2 Q30 30 32 64Z" fill="#7fd95c"/><path d="M28 64 Q34 36 44 14 Q42 40 40 64Z" fill="#4aa84f"/><path d="M20 64 Q24 44 24 24 Q27 44 30 64Z" fill="#a4ec6c"/></svg>`,
    { size: 128 },
  );
  const petals = (n: number, rx: number, ry: number, cy: number, fill: string) =>
    Array.from({ length: n }, (_, i) => `<ellipse cx="0" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${(360 / n) * i})"/>`).join("");
  const flowerSvg = (petal: string, tip: string, core: string) =>
    svg(
      `<svg viewBox="0 0 40 56"><path d="M20 56 Q19 40 20 28" stroke="#4aa84f" stroke-width="3" fill="none"/><path d="M20 46 q-10 -2 -13 -11 q10 -1 13 11z" fill="#5fc65a"/><g transform="translate(20 20)">${petals(5, 6.4, 9.5, -9, petal)}${petals(5, 3.2, 4.5, -10, tip)}</g><circle cx="20" cy="20" r="4.6" fill="${core}"/></svg>`,
      { size: 96 },
    );
  const FLOWERS = [
    flowerSvg("#ffffff", "#ffd6e6", "#ffcf4a"),
    flowerSvg("#ffe45c", "#fff3a8", "#f59a2a"),
    flowerSvg("#8defff", "#d8fbff", "#ffffff"),
    flowerSvg("#ff9ac4", "#ffd0e4", "#ffe27a"),
  ];
  const leafSvg = (a: string, bb: string, c: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 64 64"><g transform="rotate(-38 32 60)"><path d="M32 60 Q15 38 32 8 Q49 38 32 60Z" fill="${a}"/><path d="M32 56 L32 16" stroke="${vein}" stroke-width="2"/></g><g transform="rotate(38 32 60)"><path d="M32 60 Q15 38 32 8 Q49 38 32 60Z" fill="${bb}"/><path d="M32 56 L32 16" stroke="${vein}" stroke-width="2"/></g><path d="M32 62 Q14 40 32 2 Q50 40 32 62Z" fill="${c}"/><path d="M32 58 L32 12" stroke="${vein}" stroke-width="2"/></svg>`,
      { size: 128 },
    );
  const LEAVES = [leafSvg("#4fbf5c", "#5fcb5c", "#7fdc5c", "#a8ee74"), leafSvg("#6fd05a", "#88e060", "#a6ee66", "#d4fa8a")];
  const blossom = (cx: number, cy: number, r: number) =>
    `<g transform="translate(${cx} ${cy}) scale(${r / 12})">${petals(5, 5.2, 7.2, -7, "#ffc4dc")}${petals(5, 2.4, 3.6, -7.5, "#ffe3ee")}<circle r="3" fill="#ff7fae"/><circle r="1.3" fill="#ffd35a"/></g>`;
  const BLOSSOM = svg(`<svg viewBox="0 0 64 64">${blossom(20, 22, 13)}${blossom(44, 26, 14)}${blossom(30, 47, 13)}</svg>`, { size: 128 });
  const PETAL = svg(`<svg viewBox="0 0 24 32"><path d="M12 30 Q1 18 5 6 Q9 0 12 6 Q15 0 19 6 Q23 18 12 30Z" fill="#ffb7d3"/></svg>`, { size: 64 });
  const IVY = svg(
    `<svg viewBox="0 0 24 96"><path d="M12 0 Q3 28 12 48 Q21 68 12 94" stroke="#3b8f47" stroke-width="2.6" fill="none"/>` +
      [
        [6, 20, -30],
        [18, 34, 30],
        [6, 52, -25],
        [18, 66, 35],
        [8, 80, -30],
        [15, 90, 25],
      ]
        .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="6.2" ry="3.8" fill="#62c45a" transform="rotate(${r} ${x} ${y})"/>`)
        .join("") +
      `</svg>`,
    { size: 192 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 24 80"><circle cx="12" cy="8" r="6" fill="#ffd35a"/><rect x="9" y="12" width="6" height="14" fill="#e8504a"/><path d="M5 26 Q12 22 19 26 L21 74 L3 74 Z" fill="#e8504a"/><path d="M8 30 L7 74 M12 28 L12 74 M16 30 L17 74" stroke="#ffd35a" stroke-width="1.6" fill="none"/><rect x="3" y="70" width="18" height="4" fill="#ffd35a"/></svg>`,
    { size: 160 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" stroke="#5cf5ee" stroke-width="4" fill="none" stroke-dasharray="120 31"/><path d="M32 16 C46 16 48 34 36 36 C27 38 24 27 32 27" stroke="#5cf5ee" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 40 L32 52 M22 46 L42 46" stroke="#5cf5ee" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="#ffffff"/></svg>`,
    { size: 192 },
  );
  const circleTicks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * PI2;
    const r0 = i % 2 ? 52 : 50;
    return `<path d="M${64 + Math.sin(a) * r0} ${64 + Math.cos(a) * r0} L${64 + Math.sin(a) * 58} ${64 + Math.cos(a) * 58}" stroke="#ffd35a" stroke-width="2" stroke-linecap="round"/>`;
  }).join("");
  const tri = (rot: number) => {
    const pts = [0, 1, 2].map((k) => {
      const a = rot * DEG + (k * PI2) / 3;
      return `${64 + Math.sin(a) * 40} ${64 + Math.cos(a) * 40}`;
    });
    return `<polygon points="${pts.join(" ")}" stroke="#5cf5ee" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`;
  };
  const MAGIC = svg(
    `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" stroke="#ffd35a" stroke-width="2.4" fill="none"/><circle cx="64" cy="64" r="48" stroke="#5cf5ee" stroke-width="2" fill="none" stroke-dasharray="10 5"/><circle cx="64" cy="64" r="16" stroke="#ffd35a" stroke-width="2" fill="none"/>${tri(0)}${tri(180)}${circleTicks}<circle cx="64" cy="64" r="5" fill="#ffffff"/></svg>`,
    { size: 512 },
  );
  const spark = (core: string, rim: string) =>
    svg(
      `<svg viewBox="0 0 32 32"><path d="M16 0 Q18 14 32 16 Q18 18 16 32 Q14 18 0 16 Q14 14 16 0Z" fill="${rim}"/><path d="M16 6 Q17 14 26 16 Q17 18 16 26 Q15 18 6 16 Q15 14 16 6Z" fill="${core}"/></svg>`,
      { size: 64 },
    );
  const SPARK_G = spark("#ffffff", "#ffd96a");
  const SPARK_T = spark("#ffffff", "#7ff2ee");

  // ---- helpers -------------------------------------------------------------------------------------------------
  const put = (geo: THREE.BufferGeometry, color: string | Paint, at: V, o: PartOptions = {}): Part =>
    b.part(geo, color, { bone: root, flat: true, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ico = (detail = 0) => new THREE.IcosahedronGeometry(1, detail);
  const rnd3 = (): V => [R() * 360, R() * 360, R() * 360];

  const rimR = (a: number) => 1.28 + 0.08 * Math.sin(3 * a) + 0.05 * Math.sin(5 * a + 1);
  const rimPt = (a: number, k = 1, y = TOP): V => [Math.sin(a) * rimR(a) * k, y, Math.cos(a) * rimR(a) * k];

  // ---- island body: rock ---------------------------------------------------------------------------------------
  const prof: Array<[number, number]> = [
    [0, 0.5],
    [0.1, 0.52],
    [0.25, 0.68],
    [0.5, 0.92],
    [0.78, 1.15],
    [0.98, 1.32],
    [1.08, 1.46],
  ];
  const rockR = (y: number) => {
    for (let i = 1; i < prof.length; i++) {
      if (y <= prof[i][1]) {
        const [r0, y0] = prof[i - 1];
        const [r1, y1] = prof[i];
        return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
      }
    }
    return prof[prof.length - 1][0];
  };
  b.lathe(
    O([0, 0.5, "sharp"], [0.1, 0.52], [0.25, 0.68], [0.5, 0.92], [0.78, 1.15], [0.98, 1.32], [1.08, 1.46], [0.98, 1.52], [0, 1.52, "sharp"]),
    { at: [0, 0, 0], segments: 10, color: ROCK, bone: root, name: "rock" },
  );

  // grassy cap with a ragged outline
  const capOutline: Array<[number, number]> = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * PI2;
    const r = rimR(a);
    return [Math.sin(a) * r, -Math.cos(a) * r];
  });
  b.extrude(capOutline, {
    at: [0, TOP - 0.1, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.2,
    bevel: 0.035,
    smoothing: 1,
    color: CAP,
    bone: root,
    name: "cap",
  });

  // rock chunks over the body
  for (let i = 0; i < 28; i++) {
    const a = R() * PI2;
    const y = 0.75 + R() * 0.7;
    const rr = rockR(y) * 0.95;
    const s = 0.1 + R() * 0.13;
    put(ico(0), ROCK, [Math.sin(a) * rr, y, Math.cos(a) * rr], { scale: [s * 1.3, s, s * 1.3], rotation: rnd3() });
  }
  // stalactites
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * PI2 + R() * 0.3;
    const y = 0.88 + R() * 0.3;
    const rr = rockR(y) * 0.85;
    put(new THREE.ConeGeometry(0.08 + R() * 0.05, 0.3 + R() * 0.15, 6, 1), ROCK, [Math.sin(a) * rr, y, Math.cos(a) * rr], {
      rotation: [180, R() * 360, 0],
    });
  }

  // crystals under the island
  const crystal = (base: V, tip: V, r: number, color: string, strength = 1.2) =>
    glow(b.spike(base, tip, null, r, { color, bone: root, sides: 6, smooth: false }), strength);
  crystal([0, 0.72, 0], [0, 0, 0], 0.13, CR_A, 1.3);
  for (let i = 0; i < 4; i++) {
    const a = i * 1.5708 + 0.5;
    crystal([Math.sin(a) * 0.17, 0.85, Math.cos(a) * 0.17], [Math.sin(a) * 0.34, 0.3 + 0.05 * (i % 2), Math.cos(a) * 0.34], 0.06, i % 2 ? CR_B : CR_A);
  }
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + 0.9;
    crystal(
      [Math.sin(a) * 0.55, 1.15, Math.cos(a) * 0.55],
      [Math.sin(a) * 0.98, 0.95 - 0.05 * (i % 2), Math.cos(a) * 0.98],
      0.05 + 0.01 * (i % 3),
      i % 2 ? CR_C : CR_B,
    );
  }

  // roots and ivy hanging from the rim
  const AF = 0.95;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * PI2 + R() * 0.2;
    if (Math.abs(a - AF) < 0.3) continue;
    const rr = rimR(a);
    const pt = (k: number, y: number): V => [Math.sin(a) * rr * k, y, Math.cos(a) * rr * k];
    b.sweep(catmull([pt(0.9, 1.44), pt(0.92, 1.26), pt(0.84, 1.08), pt(0.72, 0.98)]), [0.03, 0.018, 0.008], {
      color: BARK,
      sides: 5,
      bone: root,
    });
  }
  const ivyAngles = Array.from({ length: 24 }, (_, i) => (i / 24) * PI2 + R() * 0.12).filter((a) => Math.abs(a - AF) > 0.3);
  b.cards(
    ivyAngles.map((a) => frame(rimPt(a, 0.93, TOP - 0.16), [0, 1, 0])),
    [IVY],
    {
      size: [0.1, 0.34],
      lean: 180,
      vary: 0.35,
      flow: (_f, i) => [Math.sin(ivyAngles[i]), 0, Math.cos(ivyAngles[i])],
      rng: R,
      bone: root,
      sink: 0,
    },
  );

  // ---- ruins ---------------------------------------------------------------------------------------------------
  const Cx = -0.45;
  const Cz = 0.05;
  const PT = TOP - 0.01 + 0.1;
  b.lathe(O([0, 0, "sharp"], [0.56, 0], [0.56, 0.05], [0.46, 0.05], [0.46, 0.1], [0, 0.1, "sharp"]), {
    at: [Cx, TOP - 0.01, Cz],
    segments: 8,
    spin: 22.5,
    color: STONE_PLAIN,
    bone: root,
    name: "platform",
  });
  put(new THREE.TorusGeometry(0.54, 0.008, 4, 32), GOLD, [Cx, TOP - 0.01 + 0.052, Cz], { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.44, 0.007, 4, 32), GOLD, [Cx, PT + 0.002, Cz], { rotation: [90, 0, 0] });
  glow(
    b.part(new THREE.PlaneGeometry(0.98, 0.98), "#ffffff", {
      bone: root,
      at: [Cx, PT + 0.004, Cz],
      dir: [0, 1, 0],
      axis: "z",
      texture: MAGIC,
    }),
    1,
  );

  const column = (x: number, z: number, y0: number, h: number, full: boolean, face: V) => {
    put(box(0.17, 0.05, 0.17), STONE_PLAIN, [x, y0 + 0.025, z]);
    const shaftH = full ? h - 0.14 : h - 0.05;
    put(cyl(0.052, 0.062, shaftH, 8), STONE, [x, y0 + 0.05 + shaftH / 2, z]);
    put(new THREE.TorusGeometry(0.064, 0.009, 4, 8), GOLD, [x, y0 + 0.07, z], { rotation: [90, 0, 0] });
    if (full) {
      put(new THREE.TorusGeometry(0.056, 0.009, 4, 8), GOLD, [x, y0 + h - 0.1, z], { rotation: [90, 0, 0] });
      put(cyl(0.095, 0.058, 0.05, 8), STONE_PLAIN, [x, y0 + h - 0.065, z]);
      put(box(0.2, 0.04, 0.2), STONE_PLAIN, [x, y0 + h - 0.02, z]);
      put(box(0.205, 0.008, 0.205), GOLD, [x, y0 + h - 0.002, z]);
      glow(
        b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
          bone: root,
          at: [x + face[0] * 0.058, y0 + 0.27, z + face[2] * 0.058],
          dir: face,
          axis: "z",
          texture: RUNE,
        }),
        1,
      );
    } else {
      put(ico(0), STONE, [x, y0 + 0.05 + shaftH, z], { scale: [0.062, 0.04, 0.062], rotation: rnd3() });
    }
  };
  column(Cx + 0.36 * Math.sin(140 * DEG), Cz + 0.36 * Math.cos(140 * DEG), PT, 0.5, true, [0, 0, 1]);
  column(Cx + 0.36 * Math.sin(220 * DEG), Cz + 0.36 * Math.cos(220 * DEG), PT, 0.5, true, [0, 0, 1]);
  column(Cx + 0.36 * Math.sin(80 * DEG), Cz + 0.36 * Math.cos(80 * DEG), PT, 0.5, true, [Math.sin(80 * DEG), 0, Math.cos(80 * DEG)]);
  column(Cx + 0.36 * Math.sin(320 * DEG), Cz + 0.36 * Math.cos(320 * DEG), PT, 0.28, false, [0, 0, 1]);

  // the broken arch between the two back columns
  const archZ = Cz + 0.36 * Math.cos(140 * DEG);
  const archR = 0.36 * Math.sin(40 * DEG);
  const springY = PT + 0.5;
  const archPos = (deg: number, rad: number, dz = 0): V => [Cx + Math.cos(deg * DEG) * rad, springY + Math.sin(deg * DEG) * rad, archZ + dz];
  const present = [0, 1, 2, 3, 4, 5, 6, 10, 11];
  for (const k of present) {
    const deg = 7.5 + 15 * k;
    const [px, py, pz] = archPos(deg, archR);
    put(box(0.068, 0.08, 0.14), STONE_PLAIN, [px, py, pz], { dir: [Math.cos(deg * DEG), Math.sin(deg * DEG), 0], up: [0, 0, 1] });
  }
  glow(
    b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
      bone: root,
      at: archPos(52.5, archR, 0.0715),
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1,
  );
  const arcPts = (d0: number, d1: number, rad: number, dz: number) => {
    const n = Math.max(3, Math.round((d1 - d0) / 10));
    return Array.from({ length: n + 1 }, (_, i) => archPos(d0 + ((d1 - d0) * i) / n, rad, dz));
  };
  for (const [d0, d1] of [
    [2, 100],
    [155, 180],
  ] as Array<[number, number]>) {
    b.sweep(catmull(arcPts(d0, d1, archR + 0.042, 0.073)), 0.007, { color: GOLD, sides: 5, bone: root });
    b.sweep(catmull(arcPts(d0, d1, archR - 0.042, 0.073)), 0.006, { color: GOLD, sides: 5, bone: root });
  }
  // fallen voussoirs
  for (const [fx, fz, rot] of [
    [-0.3, -0.12, 35],
    [-0.22, -0.02, 110],
    [-0.38, 0.2, 70],
  ]) {
    put(box(0.068, 0.08, 0.14), STONE_PLAIN, [fx, PT + 0.036, fz], { rotation: [90, rot, R() * 20] });
  }
  // tassels hanging in the arch
  b.cards(
    [archPos(97.5, archR - 0.045), archPos(172.5, archR - 0.045)].map((p) => frame(p, [0, 1, 0])),
    [TASSEL],
    { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], bone: root, sink: 0 },
  );
  // ivy on the arch
  b.cards(
    [archPos(30, archR + 0.045, 0.07), archPos(75, archR + 0.045, 0.07), archPos(165, archR + 0.045, 0.07)].map((p) => frame(p, [0, 1, 0])),
    [IVY],
    { size: [0.08, 0.3], lean: 180, vary: 0.2, flow: [0, 0, 1], rng: R, bone: root, sink: 0 },
  );

  // central pedestal with a floating crystal and gold rings
  b.lathe(
    O([0, 0, "sharp"], [0.17, 0], [0.17, 0.06], [0.12, 0.1], [0.1, 0.22], [0.14, 0.26], [0.14, 0.3], [0, 0.3, "sharp"]),
    { at: [Cx, PT - 0.005, Cz], segments: 6, color: STONE_PLAIN, bone: root, name: "pedestal" },
  );
  put(new THREE.TorusGeometry(0.125, 0.012, 4, 12), GOLD, [Cx, PT + 0.1, Cz], { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.145, 0.01, 4, 12), GOLD, [Cx, PT + 0.28, Cz], { rotation: [90, 0, 0] });
  const P: V = [Cx, PT + 0.62, Cz];
  const crystalJ = b.joint("crystal", { parent: root, at: P, role: "hinge" });
  const ringA = b.joint("ringA", { parent: crystalJ, at: P, role: "hinge" });
  const ringB = b.joint("ringB", { parent: crystalJ, at: P, role: "hinge" });
  glow(b.part(new THREE.OctahedronGeometry(0.1, 0), CR_B, { bone: crystalJ, at: P, scale: [1, 1.6, 1], flat: true }), 1.4);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.4;
    glow(
      b.part(new THREE.OctahedronGeometry(0.03, 0), CR_A, {
        bone: crystalJ,
        at: [P[0] + Math.sin(a) * 0.17, P[1] + 0.05 * (i - 1), P[2] + Math.cos(a) * 0.17],
        flat: true,
      }),
      1.2,
    );
  }
  b.part(new THREE.TorusGeometry(0.21, 0.012, 5, 24), GOLD, { bone: ringA, at: P, rotation: [70, 0, 0], flat: true });
  b.part(new THREE.TorusGeometry(0.25, 0.01, 5, 24), GOLD, { bone: ringB, at: P, rotation: [-30, 0, 60], flat: true });

  // fallen column and rubble
  put(cyl(0.058, 0.058, 0.4, 8), STONE, [-1.0, TOP + 0.058, Cz], { rotation: [0, 0, 90] });
  put(new THREE.TorusGeometry(0.06, 0.009, 4, 8), GOLD, [-0.88, TOP + 0.058, Cz], { rotation: [0, 90, 0] });
  put(ico(0), STONE, [-1.2, TOP + 0.04, Cz + 0.01], { scale: [0.06, 0.05, 0.06], rotation: rnd3() });
  put(cyl(0.095, 0.058, 0.05, 8), STONE_PLAIN, [-1.1, TOP + 0.04, Cz + 0.22], { rotation: [90, 20, 0] });
  put(box(0.2, 0.04, 0.2), STONE_PLAIN, [-0.85, TOP + 0.02, Cz + 0.32], { rotation: [0, 30, 0] });
  for (let i = 0; i < 5; i++) {
    const s = 0.03 + R() * 0.03;
    put(ico(0), STONE, [-0.75 + R() * 0.25, TOP + s * 0.5, -0.45 + R() * 0.1], { scale: [s, s * 0.8, s], rotation: rnd3() });
  }

  // ---- pond and waterfall --------------------------------------------------------------------------------------
  const PC = [0.55, 0.2];
  const pondOutline: Array<[number, number]> = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * PI2;
    const r = 0.27 + 0.012 * Math.sin(3 * a + 1);
    return [PC[0] + Math.sin(a) * r, -(PC[1] + Math.cos(a) * r)];
  });
  const POND = cel(
    paint((p) => {
      const d = Math.hypot(p.x - PC[0], p.z - PC[1]);
      const ring = Math.sin(d * 46 + noise(p, 0.12, 61) * 3) * 0.5 + 0.5;
      let c = mix("#63cdf0", "#a6ecff", smoothstep(0.7, 0.95, ring));
      c = mix(c, "#3fa5e0", smoothstep(0.22, 0, d) * 0.7);
      return mix(c, "#ffffff", smoothstep(0.24, 0.28, d) * 0.6);
    }),
  );
  b.extrude(pondOutline, {
    at: [0, TOP + 0.01, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.04,
    smoothing: 1,
    color: POND,
    bone: root,
    name: "pond",
  });
  for (let i = 0; i < 13; i++) {
    const a = (i / 13) * PI2 + R() * 0.15;
    const s = 0.045 + R() * 0.03;
    put(ico(0), STONE, [PC[0] + Math.sin(a) * 0.3, TOP + 0.03, PC[1] + Math.cos(a) * 0.3], { scale: [s * 1.2, s, s * 1.2], rotation: rnd3() });
  }
  for (const [dx, dz, s] of [
    [-0.08, 0.05, 1],
    [0.1, -0.1, 0.8],
    [-0.1, -0.12, 0.7],
  ]) {
    put(cyl(0.05 * s, 0.05 * s, 0.008, 9), PAD, [PC[0] + dx, TOP + 0.034, PC[1] + dz]);
  }
  put(new THREE.SphereGeometry(0.03, 7, 4, 0, PI2, 0, Math.PI / 2), LOTUS, [PC[0] - 0.08, TOP + 0.04, PC[1] + 0.05], { flat: false, scale: [1, 1.3, 1] });
  put(new THREE.ConeGeometry(0.03, 0.05, 6, 1), LOTUS, [PC[0] - 0.08, TOP + 0.065, PC[1] + 0.05]);
  // cattails
  for (let i = 0; i < 5; i++) {
    const a = 3.0 + i * 0.35;
    const x = PC[0] + Math.sin(a) * 0.3;
    const z = PC[1] + Math.cos(a) * 0.3;
    const lean = 0.03 + R() * 0.04;
    const top: V = [x + lean, TOP + 0.36 + R() * 0.08, z - lean];
    b.sweep(catmull([[x, TOP, z], [x + lean * 0.4, TOP + 0.18, z - lean * 0.4], top]), 0.006, { color: REED, sides: 5, bone: root });
    b.capsule([top[0], top[1] - 0.02, top[2]], [top[0], top[1] + 0.04, top[2]], 0.014, CATTAIL, { sides: 6, bone: root });
  }

  // stream from the pond to the rim
  const fRim = rimPt(AF + 0.2);
  const fa = AF + 0.2;
  const rad: V = [Math.sin(fa), 0, Math.cos(fa)];
  const tan: V = [Math.cos(fa), 0, -Math.sin(fa)];
  const dirX = fRim[0] - PC[0];
  const dirZ = fRim[2] - PC[1];
  const dl = Math.hypot(dirX, dirZ);
  const E: V = [PC[0] + (dirX / dl) * 0.25, TOP + 0.016, PC[1] + (dirZ / dl) * 0.25];
  const streamPts = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    const w = 0.04 * Math.sin(t * 9) * (1 - t * 0.3);
    return [
      E[0] + (fRim[0] * 1.0 - E[0]) * t + (-dirZ / dl) * w,
      TOP + 0.016,
      E[2] + (fRim[2] * 1.0 - E[2]) * t + (dirX / dl) * w,
    ];
  });
  b.sweep(catmull(streamPts), (t) => [0.05 + 0.07 * t, 0.012], { section: "box", caps: "flat", color: STREAM, bone: root, name: "stream" });
  // the fall
  const fallAt = (off: number, dx: number): V => [
    fRim[0] + rad[0] * off + tan[0] * dx,
    TOP - 0.02,
    fRim[2] + rad[2] * off + tan[2] * dx,
  ];
  const fallOutline: Array<[number, number]> = [
    [-0.15, 0.05],
    [0.15, 0.05],
    [0.16, -0.25],
    [0.13, -0.6],
    [0.15, -0.9],
    [0.11, -1.02],
    [0.06, -0.96],
    [0.0, -1.08],
    [-0.06, -0.97],
    [-0.11, -1.04],
    [-0.15, -0.88],
    [-0.12, -0.55],
    [-0.16, -0.25],
  ];
  b.extrude(fallOutline, { at: fallAt(0.05, 0), x: tan, y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: FALL, bone: root, name: "fall" });
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.045, -0.4],
      [0.03, -0.7],
      [0.0, -0.78],
      [-0.035, -0.65],
      [-0.045, -0.35],
    ],
    { at: fallAt(0.085, 0.2), x: tan, y: [0, 1, 0], thickness: 0.03, bevel: 0.006, color: FALL, bone: root, name: "fallR" },
  );
  b.extrude(
    [
      [-0.035, 0],
      [0.035, 0],
      [0.04, -0.35],
      [0.0, -0.55],
      [-0.04, -0.3],
    ],
    { at: fallAt(0.085, -0.2), x: tan, y: [0, 1, 0], thickness: 0.03, bevel: 0.006, color: FALL, bone: root, name: "fallL" },
  );
  // lip stones
  for (const dx of [-0.22, 0.22, -0.3, 0.3]) {
    const p = fallAt(0.0, dx);
    const s = 0.05 + R() * 0.03;
    put(ico(0), ROCK, [p[0], TOP + 0.0, p[2]], { scale: [s * 1.2, s * 0.8, s], rotation: rnd3() });
  }
  // mist and spray at the foot
  const mist: V = [fRim[0] + rad[0] * 0.1, 0.48, fRim[2] + rad[2] * 0.1];
  for (const [dx, dy, dz, r] of [
    [0, 0, 0, 0.16],
    [0.15, -0.02, 0.04, 0.12],
    [-0.16, -0.02, -0.02, 0.12],
    [0.05, 0.07, 0.1, 0.11],
    [-0.04, 0.06, -0.1, 0.11],
    [0.25, -0.03, -0.04, 0.08],
    [-0.27, -0.03, 0.03, 0.08],
  ]) {
    put(new THREE.SphereGeometry(1, 9, 6), CLOUD, [mist[0] + dx, mist[1] + dy, mist[2] + dz], { scale: [r * 1.2, r * 0.8, r * 1.1] });
  }
  for (let i = 0; i < 12; i++) {
    const r = 0.012 + R() * 0.016;
    put(new THREE.SphereGeometry(r, 6, 4), CLOUD, [mist[0] + (R() - 0.5) * 0.3, 0.14 + R() * 0.28, mist[2] + (R() - 0.5) * 0.3]);
  }

  // ---- trees ---------------------------------------------------------------------------------------------------
  const canopy = (c: V, balls: Array<[number, number, number, number]>, paints: Paint[]) =>
    balls.map(([dx, dy, dz, r], i) =>
      put(ico(1), paints[i % paints.length], [c[0] + dx, c[1] + dy, c[2] + dz], { scale: [r, r * 0.88, r], rotation: rnd3() }),
    );

  // round fruit tree
  const TA: V = [0.3, TOP, -0.55];
  b.sweep(
    catmull([
      [TA[0], TOP - 0.06, TA[2]],
      [TA[0] - 0.03, TOP + 0.22, TA[2] - 0.01],
      [TA[0] + 0.05, TOP + 0.45, TA[2] + 0.03],
      [TA[0], TOP + 0.7, TA[2]],
    ]),
    [0.15, 0.1, 0.075, 0.06],
    { color: BARK, sides: 7, bone: root, caps: "round", name: "trunkA" },
  );
  for (let i = 0; i < 5; i++) {
    const a = i * 1.256 + 0.3;
    b.sweep(
      catmull([
        [TA[0] + Math.sin(a) * 0.06, TOP + 0.16, TA[2] + Math.cos(a) * 0.06],
        [TA[0] + Math.sin(a) * 0.2, TOP + 0.04, TA[2] + Math.cos(a) * 0.2],
        [TA[0] + Math.sin(a) * 0.34, TOP - 0.01, TA[2] + Math.cos(a) * 0.34],
      ]),
      [0.06, 0.03, 0.012],
      { color: BARK, sides: 5, bone: root },
    );
  }
  const cA: V = [TA[0], TOP + 0.82, TA[2]];
  for (const e of [
    [0.32, TOP + 0.5, -0.54, 0.55, TOP + 0.78, -0.5],
    [0.28, TOP + 0.5, -0.56, 0.05, TOP + 0.8, -0.55],
    [0.3, TOP + 0.55, -0.55, 0.3, TOP + 0.78, -0.28],
    [0.3, TOP + 0.55, -0.55, 0.3, TOP + 0.75, -0.82],
  ]) {
    b.rod([e[0], e[1], e[2]], [e[3], e[4], e[5]], [0.04, 0.015], BARK, { bone: root, sides: 5 });
  }
  const blobsA = canopy(
    cA,
    [
      [0, 0.05, 0, 0.3],
      [0.28, -0.05, 0.05, 0.23],
      [-0.27, -0.02, 0, 0.24],
      [0.05, -0.04, 0.28, 0.22],
      [-0.05, -0.02, -0.28, 0.22],
      [0.1, 0.26, 0.05, 0.22],
      [-0.17, 0.2, 0.15, 0.18],
      [0.2, 0.14, -0.2, 0.2],
      [0.3, 0.12, 0.22, 0.16],
      [-0.3, 0.12, -0.18, 0.16],
    ],
    [LEAF_A, LEAF_B, LEAF_A, LEAF_L, LEAF_B],
  );
  const skinA = b.surface(blobsA);
  b.cards(skinA.scatter(80, { rng: R, minDist: 0.09, filter: (h) => h.n.y > -0.35 }), LEAVES, {
    size: [0.22, 0.22],
    lean: 55,
    vary: 0.3,
    spin: 180,
    rng: R,
    bone: root,
  });
  for (const h of skinA.scatter(10, { rng: R, minDist: 0.2, filter: (hh) => hh.n.y < 0.4 && hh.n.y > -0.4 })) {
    b.stick(new THREE.SphereGeometry(0.05, 8, 6), SUNSET, h, { bone: root, embed: 0.1 });
  }

  // sakura tree with wind chimes
  const TB: V = [-0.8, TOP, 0.7];
  b.sweep(
    catmull([
      [TB[0], TOP - 0.05, TB[2]],
      [TB[0] - 0.05, TOP + 0.25, TB[2] + 0.02],
      [TB[0] + 0.05, TOP + 0.5, TB[2] - 0.02],
      [TB[0], TOP + 0.68, TB[2]],
    ]),
    [0.1, 0.065, 0.055, 0.045],
    { color: BARK_PINK, sides: 6, bone: root, caps: "round", name: "trunkB" },
  );
  for (let i = 0; i < 4; i++) {
    const a = i * 1.57 + 0.6;
    b.sweep(
      catmull([
        [TB[0] + Math.sin(a) * 0.04, TOP + 0.1, TB[2] + Math.cos(a) * 0.04],
        [TB[0] + Math.sin(a) * 0.14, TOP + 0.02, TB[2] + Math.cos(a) * 0.14],
        [TB[0] + Math.sin(a) * 0.24, TOP - 0.01, TB[2] + Math.cos(a) * 0.24],
      ]),
      [0.04, 0.02, 0.01],
      { color: BARK_PINK, sides: 5, bone: root },
    );
  }
  const cB: V = [TB[0], TOP + 0.86, TB[2]];
  const hook: V = [-0.5, TOP + 0.52, 0.82];
  b.rod([TB[0] + 0.03, TOP + 0.42, TB[2]], hook, [0.03, 0.014], BARK_PINK, { bone: root, sides: 5 });
  for (const e of [
    [0.3, 0.2],
    [-0.3, 0.2],
    [0.0, -0.3],
  ]) {
    b.rod([TB[0], TOP + 0.55, TB[2]], [cB[0] + e[0], cB[1] + 0.0, cB[2] + e[1]], [0.03, 0.012], BARK_PINK, { bone: root, sides: 5 });
  }
  const blobsB = canopy(
    cB,
    [
      [0, 0.05, 0, 0.3],
      [0.32, -0.04, 0.05, 0.24],
      [-0.32, -0.02, 0, 0.24],
      [0.06, -0.03, 0.32, 0.23],
      [-0.04, 0, -0.32, 0.23],
      [0.2, 0.2, -0.1, 0.2],
      [-0.2, 0.18, 0.12, 0.2],
      [0.38, -0.06, -0.2, 0.16],
      [-0.36, -0.08, 0.22, 0.16],
    ],
    [PINK_A, PINK_B, PINK_A],
  );
  b.cards(b.surface(blobsB).scatter(90, { rng: R, minDist: 0.08, filter: (h) => h.n.y > -0.4 }), [BLOSSOM], {
    size: [0.2, 0.2],
    lean: 50,
    vary: 0.3,
    spin: 180,
    rng: R,
    bone: root,
  });
  // petals on the ground
  const petalFrames = Array.from({ length: 50 }, () => {
    const a = R() * PI2;
    const rr = 0.1 + R() * 0.55;
    return frame([TB[0] + Math.sin(a) * rr, TOP + 0.003, TB[2] + Math.cos(a) * rr], [0, 1, 0]);
  });
  b.cards(petalFrames, [PETAL], {
    size: 0.045,
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    mirror: true,
    sink: 0,
    vary: 0.3,
    rng: R,
    bone: root,
  });
  // chimes
  const chimes = b.joint("chimes", { parent: root, at: hook, role: "hinge" });
  b.part(cyl(0.04, 0.04, 0.012, 8), GOLD, { bone: chimes, at: [hook[0], hook[1] - 0.006, hook[2]], flat: true });
  for (let i = 0; i < 5; i++) {
    const a = i * 1.2566;
    const len = 0.1 + 0.035 * (i % 3);
    const hx = hook[0] + Math.sin(a) * 0.03;
    const hz = hook[2] + Math.cos(a) * 0.03;
    b.part(cyl(0.007, 0.007, len, 6), CHIME, { bone: chimes, at: [hx, hook[1] - 0.02 - len / 2, hz], flat: true });
    b.part(cyl(0.0015, 0.0015, 0.02, 4), GOLD, { bone: chimes, at: [hx, hook[1] - 0.01, hz], flat: true });
  }
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: chimes, at: [hook[0], hook[1] - 0.12, hook[2]], flat: true });
  b.part(box(0.05, 0.07, 0.004), CHIME, { bone: chimes, at: [hook[0], hook[1] - 0.2, hook[2]], flat: true });

  // pines
  const pine = (x: number, z: number, k: number) => {
    put(cyl(0.03 * k, 0.045 * k, 0.25 * k, 6), BARK, [x, TOP + 0.1 * k, z]);
    for (let i = 0; i < 4; i++) {
      put(new THREE.ConeGeometry(k * (0.25 - 0.045 * i), k * 0.3, 7, 1), i % 2 ? PINE_A : PINE_B, [x, TOP + k * (0.14 + 0.15 * i + 0.15), z], {
        rotation: [0, i * 20, 0],
      });
    }
  };
  pine(-0.85, -0.72, 1.0);
  pine(-0.62, -0.95, 0.75);

  // ---- lantern post --------------------------------------------------------------------------------------------
  const LX = 0.38;
  const LZ = 0.95;
  put(cyl(0.025, 0.035, 0.66, 6), WOOD, [LX, TOP + 0.33, LZ]);
  put(box(0.09, 0.03, 0.09), STONE_PLAIN, [LX, TOP + 0.015, LZ]);
  b.rod([LX, TOP + 0.64, LZ], [LX + 0.2, TOP + 0.64, LZ], 0.014, WOOD, { bone: root, sides: 5 });
  b.rod([LX, TOP + 0.5, LZ], [LX + 0.12, TOP + 0.63, LZ], 0.008, GOLD, { bone: root, sides: 5 });
  put(new THREE.ConeGeometry(0.04, 0.05, 6, 1), GOLD, [LX, TOP + 0.69, LZ]);
  const H: V = [LX + 0.2, TOP + 0.62, LZ];
  const lamp = b.joint("lantern", { parent: root, at: H, role: "hinge" });
  b.rod(H, [H[0], H[1] - 0.06, H[2]], 0.004, GOLD, { bone: lamp, sides: 4 });
  const LC: V = [H[0], H[1] - 0.12, H[2]];
  glow(b.part(box(0.07, 0.09, 0.07), WARM, { bone: lamp, at: LC }), 1.4);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      b.part(box(0.012, 0.11, 0.012), GOLD, { bone: lamp, at: [LC[0] + sx * 0.037, LC[1], LC[2] + sz * 0.037], flat: true });
    }
  b.part(new THREE.ConeGeometry(0.065, 0.05, 4, 1), GOLD, { bone: lamp, at: [LC[0], LC[1] + 0.07, LC[2]], rotation: [0, 45, 0], flat: true });
  b.part(box(0.085, 0.012, 0.085), GOLD, { bone: lamp, at: [LC[0], LC[1] - 0.05, LC[2]], flat: true });
  b.part(new THREE.TorusGeometry(0.014, 0.004, 4, 8), GOLD, { bone: lamp, at: [LC[0], LC[1] + 0.1, LC[2]], flat: true });
  b.cards([frame([LC[0], LC[1] - 0.056, LC[2]], [0, 1, 0])], [TASSEL], {
    size: [0.04, 0.16],
    lean: 180,
    flow: [0, 0, 1],
    bone: lamp,
    sink: 0,
  });

  // ---- signpost ------------------------------------------------------------------------------------------------
  const SX = 0.28;
  const SZ = 0.55;
  put(box(0.05, 0.55, 0.05), WOOD, [SX, TOP + 0.275, SZ]);
  put(new THREE.ConeGeometry(0.04, 0.05, 4, 1), GOLD, [SX, TOP + 0.575, SZ], { rotation: [0, 45, 0] });
  for (const [h, phi, len] of [
    [0.44, 0.6, 0.3],
    [0.33, -2.3, 0.26],
  ]) {
    const x: V = [Math.sin(phi), 0, Math.cos(phi)];
    b.extrude(
      [
        [0.0, -0.04],
        [len, -0.04],
        [len + 0.06, 0],
        [len, 0.04],
        [0.0, 0.04],
      ],
      { at: [SX + x[0] * 0.03, TOP + h, SZ + x[2] * 0.03], x, y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: PLANK, bone: root },
    );
    put(new THREE.SphereGeometry(0.008, 5, 4), GOLD, [SX + x[0] * (0.03 + len * 0.85), TOP + h, SZ + x[2] * (0.03 + len * 0.85)], {
      flat: false,
    });
  }

  // ---- stepping stones, mushrooms, boulders -------------------------------------------------------------------
  const pave = (pts: Array<[number, number]>) => {
    for (const [x, z] of pts) {
      put(cyl(0.075 + R() * 0.03, 0.085 + R() * 0.03, 0.03, 6), STONE_PLAIN, [x, TOP + 0.005, z], { rotation: [0, R() * 360, 0] });
    }
  };
  pave([
    [0.1, 0.34],
    [0.2, 0.3],
    [0.0, 0.5],
    [0.08, 0.63],
    [0.16, 0.76],
    [0.26, 0.86],
  ]);
  const mushroom = (x: number, z: number, s: number) => {
    put(cyl(0.018 * s, 0.024 * s, 0.07 * s, 6), MUSH_STEM, [x, TOP + 0.035 * s, z]);
    put(new THREE.SphereGeometry(0.06 * s, 8, 5, 0, PI2, 0, Math.PI / 2), MUSH_CAP, [x, TOP + 0.065 * s, z], { flat: false, scale: [1, 0.8, 1] });
  };
  mushroom(0.62, -0.38, 1);
  mushroom(0.7, -0.45, 0.7);
  mushroom(0.55, -0.32, 0.55);
  mushroom(-0.55, -0.62, 0.8);
  for (const [x, z, s] of [
    [0.9, -0.2, 0.12],
    [-0.1, -0.75, 0.1],
    [0.15, 0.1, 0.07],
    [-0.5, 0.95, 0.08],
  ]) {
    put(ico(0), ROCK, [x, TOP + s * 0.4, z], { scale: [s * 1.3, s, s * 1.2], rotation: rnd3() });
  }

  // ---- grass tufts and flowers --------------------------------------------------------------------------------
  const taken: Array<[number, number, number]> = [
    [Cx, Cz, 0.7],
    [0.3, -0.55, 0.22],
    [PC[0], PC[1], 0.4],
    [-0.8, 0.7, 0.12],
    [LX, LZ, 0.1],
    [SX, SZ, 0.1],
    [-0.85, -0.72, 0.15],
    [-0.62, -0.95, 0.12],
    [0.1, 0.4, 0.15],
    [0.1, 0.65, 0.2],
    [0.2, 0.8, 0.15],
    [0.95, 0.4, 0.3],
    [-1.0, Cz, 0.25],
    [0.62, -0.38, 0.12],
  ];
  const spot = (margin: number): [number, number] | null => {
    for (let k = 0; k < 40; k++) {
      const a = R() * PI2;
      const rr = Math.sqrt(R()) * 1.35;
      const x = Math.sin(a) * rr;
      const z = Math.cos(a) * rr;
      if (rr > rimR(a) - margin) continue;
      if (taken.some(([tx, tz, tr]) => Math.hypot(x - tx, z - tz) < tr)) continue;
      return [x, z];
    }
    return null;
  };
  const tuftFrames = [];
  for (let i = 0; i < 160; i++) {
    const s = spot(0.1);
    if (s) tuftFrames.push(frame([s[0], TOP, s[1]], [0, 1, 0]));
  }
  // ring of tufts round the ruin platform
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * PI2 + R() * 0.2;
    const rr = 0.6 + R() * 0.06;
    tuftFrames.push(frame([Cx + Math.sin(a) * rr, TOP, Cz + Math.cos(a) * rr], [0, 1, 0]));
  }
  b.cards(tuftFrames, [TUFT], { size: [0.1, 0.13], vary: 0.4, spin: 180, cross: true, rng: R, bone: root });
  const flowerFrames = [];
  for (let i = 0; i < 70; i++) {
    const s = spot(0.12);
    if (s) flowerFrames.push(frame([s[0], TOP, s[1]], [0, 1, 0]));
  }
  b.cards(flowerFrames, FLOWERS, { size: [0.065, 0.09], vary: 0.3, spin: 180, cross: true, rng: R, bone: root });

  // ---- floating islets and debris -----------------------------------------------------------------------------
  const islet = (cx: number, cy: number, cz: number, s: number) => {
    b.lathe(
      O([0, 0, "sharp"], [0.25 * s, 0.5 * s], [0.65 * s, 1.0 * s], [0.95 * s, 1.4 * s], [1.0 * s, 1.62 * s], [0, 1.62 * s, "sharp"]),
      { at: [cx, cy, cz], segments: 8, color: ROCK, bone: root },
    );
    put(cyl(1.12 * s, 1.04 * s, 0.2 * s, 9), ISLET_CAP, [cx, cy + 1.62 * s, cz]);
    crystal([cx, cy + 0.5 * s, cz], [cx, cy + 0.02, cz], 0.2 * s, CR_A, 1.1);
    return cy + 1.72 * s;
  };
  // islet 1: a little tree
  {
    const [cx, cy, cz] = [-1.45, 1.0, 0.35];
    const top = islet(cx, cy, cz, 0.28);
    put(cyl(0.015, 0.025, 0.18, 6), BARK, [cx, top + 0.09, cz]);
    canopy(
      [cx, top + 0.24, cz],
      [
        [0, 0, 0, 0.1],
        [0.08, -0.03, 0.02, 0.07],
        [-0.08, -0.02, 0, 0.07],
        [0, 0.07, 0.02, 0.06],
      ],
      [LEAF_A, LEAF_B],
    );
    mushroom(cx + 0.12, cz + 0.1, 0.5);
  }
  // islet 2: crystal cluster and a lantern
  {
    const [cx, cy, cz] = [1.45, 1.9, -0.3];
    const top = islet(cx, cy, cz, 0.22);
    crystal([cx, top - 0.02, cz], [cx, top + 0.22, cz], 0.04, CR_C, 1.3);
    crystal([cx + 0.04, top - 0.02, cz], [cx + 0.12, top + 0.12, cz + 0.03], 0.025, CR_B, 1.3);
    crystal([cx - 0.04, top - 0.02, cz], [cx - 0.1, top + 0.1, cz - 0.04], 0.022, CR_A, 1.3);
    put(box(0.05, 0.05, 0.05), STONE_PLAIN, [cx + 0.1, top + 0.025, cz - 0.1]);
    glow(b.part(box(0.03, 0.03, 0.03), WARM, { bone: root, at: [cx + 0.1, top + 0.07, cz - 0.1] }), 1.3);
  }
  // islet 3: a miniature ruin
  {
    const [cx, cy, cz] = [0.55, 0.75, -1.3];
    const top = islet(cx, cy, cz, 0.3);
    column(cx - 0.14, cz, top, 0.34, true, [0, 0, 1]);
    column(cx + 0.14, cz, top, 0.26, false, [0, 0, 1]);
    put(box(0.34, 0.04, 0.14), STONE_PLAIN, [cx - 0.0, top + 0.36, cz], { rotation: [0, 0, 6] });
    put(box(0.35, 0.008, 0.145), GOLD, [cx, top + 0.386, cz], { rotation: [0, 0, 6] });
    put(new THREE.IcosahedronGeometry(1, 1), LEAF_A, [cx + 0.0, top + 0.05, cz + 0.16], { scale: [0.09, 0.06, 0.08] });
  }
  for (const [x, y, z, r] of [
    [-1.1, 1.95, -0.2, 0.06],
    [-0.75, 2.45, 0.5, 0.045],
    [1.0, 2.55, 0.4, 0.05],
    [1.7, 1.45, 0.4, 0.04],
    [-1.7, 1.7, -0.5, 0.05],
    [0.0, 3.0, 0.9, 0.04],
    [0.9, 0.55, 1.15, 0.05],
    [-0.5, 0.45, -1.1, 0.06],
  ]) {
    put(ico(0), ROCK, [x, y, z], { scale: [r * 1.3, r, r * 1.1], rotation: rnd3() });
  }

  // ---- clouds --------------------------------------------------------------------------------------------------
  const cloud = (cx: number, cy: number, cz: number, s: number) => {
    const puffs: Array<[number, number, number, number]> = [
      [0, 0, 0, 0.26],
      [0.26, -0.03, 0.05, 0.2],
      [-0.27, -0.04, -0.02, 0.19],
      [0.1, 0.1, -0.06, 0.2],
      [-0.1, 0.07, 0.12, 0.17],
      [0.48, -0.06, 0.0, 0.13],
      [-0.5, -0.07, 0.05, 0.12],
    ];
    for (const [dx, dy, dz, r] of puffs) {
      put(new THREE.SphereGeometry(1, 9, 6), CLOUD, [cx + dx * s, cy + dy * s, cz + dz * s], { scale: [r * s * 1.2, r * s * 0.75, r * s * 1.1] });
    }
  };
  cloud(-0.95, 0.5, 0.95, 1.0);
  cloud(1.05, 0.4, -0.65, 1.1);
  cloud(0.2, 0.32, 1.2, 0.9);
  cloud(-1.5, 1.9, -0.9, 0.7);
  cloud(1.75, 1.3, 0.8, 0.6);
  cloud(-0.1, 0.45, -1.25, 1.0);

  // ---- wind ribbons and sparkles ------------------------------------------------------------------------------
  const ribbon = (a0: number, a1: number, r0: number, y0: number, y1: number) => {
    const pts = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const a = a0 + (a1 - a0) * t;
      const rr = r0 + 0.08 * Math.sin(t * 6);
      return [Math.sin(a) * rr, y0 + (y1 - y0) * t + 0.05 * Math.sin(t * 9), Math.cos(a) * rr];
    });
    glow(
      b.sweep(catmull(pts), (t) => 0.004 + 0.016 * Math.sin(Math.PI * t), { color: "#d4fff6", bone: root, sides: 5, caps: "point" }),
      1,
    );
  };
  ribbon(2.4, 5.0, 1.55, 0.7, 1.3);
  ribbon(3.6, 5.8, 1.65, 1.6, 2.2);
  ribbon(-1.5, -0.3, 1.55, 0.6, 0.95);
  const sparkFrames = (n: number) =>
    Array.from({ length: n }, () => {
      const a = R() * PI2;
      const rr = 0.8 + R() * 1.1;
      return frame([Math.sin(a) * rr, 0.6 + R() * 2.3, Math.cos(a) * rr], [R() - 0.5, R() - 0.5, R() - 0.3]);
    });
  glow(b.cards(sparkFrames(20), SPARK_G, { size: [0.09, 0.09], sink: 0.5, vary: 0.4, spin: 180, rng: R, bone: root }), 1);
  glow(b.cards(sparkFrames(16), SPARK_T, { size: [0.08, 0.08], sink: 0.5, vary: 0.4, spin: 180, rng: R, bone: root }), 1);

  return b.root;
}
