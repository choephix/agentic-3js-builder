import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { cellPaint, pixelArt, pixelTexture, pick, bayer, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A pixel-art koala hugging a eucalyptus trunk on a stone plinth: dithered grey fur, big fluffy ears, black nose, gripping paws and blue-green leaf cards.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.012;
const GREY = ["#3f4247", "#5c6067", "#7b8089", "#9aa0a8", "#bcc1c7", "#dcdfe2"].map((c) => snapColor(c, 64));
const BARK = ["#3a2a20", "#59402e", "#7a5a40", "#9b7a58", "#b89a76"].map((c) => snapColor(c, 64));
const STONE = ["#4b4a52", "#63626c", "#7c7b86", "#96959f"].map((c) => snapColor(c, 64));
const CLAW = "#e8dcc0";
const NOSE = "#14110f";
const PINK = "#d99aa0";
const CREAM = "#efe6d2";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const R = rng(11);

  const fur = (lift = 0) =>
    cellPaint(
      TEXEL,
      (c) => {
        let v = 0.5 + 0.22 * c.n.y + 0.4 * (noise(c.at, 0.07, 2) - 0.5) + lift;
        if (c.random(5) < 0.07) v += 0.2;
        return c.pick(GREY, Math.max(0, Math.min(1, v)));
      },
      { dither: true },
    );
  const belly = cellPaint(
    TEXEL,
    (c) => {
      let v = 0.78 + 0.35 * (noise(c.at, 0.06, 4) - 0.5);
      if (c.random(7) < 0.08) v -= 0.2;
      return c.pick(GREY, Math.max(0, Math.min(1, v)));
    },
    { dither: true },
  );
  const bark = cellPaint(
    0.014,
    (c) => {
      const streak = noise(new THREE.Vector3(c.at.x * 6, c.at.y * 0.5, c.at.z * 6), 0.05, 3);
      let v = 0.35 + 0.5 * streak + 0.15 * (c.random(1) - 0.5);
      if (c.random(9) < 0.05) v = 0.05;
      return c.pick(BARK, Math.max(0, Math.min(1, v)));
    },
    { dither: true },
  );
  const stonePaint = cellPaint(
    0.02,
    (c) => {
      const v = 0.4 + 0.35 * c.n.y + 0.5 * (noise(c.at, 0.12, 6) - 0.5);
      return c.pick(STONE, Math.max(0, Math.min(1, v)));
    },
    { dither: true },
  );
  const mossPaint = cellPaint(
    0.016,
    (c) =>
      c.pick(
        ["#233d1a", "#35602a", "#4d8238", "#7aae52"],
        Math.max(0, Math.min(1, 0.3 + 0.7 * noise(c.at, 0.09, 8) + 0.1 * (c.random(2) - 0.5))),
      ),
    { dither: true },
  );

  const ell = (at: number[], r: number[], color: any, seg: [number, number] = [8, 6], extra: any = {}) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, scale: r, ...extra });

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.34, 0.05],
      [0.3, 0.085],
      [0, 0.085],
    ],
    { at: [0, 0, 0], segments: 8, color: stonePaint },
  );
  const rim = pixelTexture(16, 4, (g) => {
    g.fill((x, y) => (y === 3 || x % 4 === 0 ? "#3a3940" : pick(STONE, 0.55, bayer(x, y))));
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(tileBox([0.1, 0.04, 0.012], rim, 0.006), "#ffffff", {
      texture: rim,
      at: [Math.sin(a) * 0.335, 0.025, Math.cos(a) * 0.335],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28;
    const d = 0.12 + R() * 0.16;
    ell([Math.sin(a) * d, 0.087, Math.cos(a) * d], [0.035 + R() * 0.03, 0.012, 0.035 + R() * 0.03], mossPaint, [6, 4]);
  }
  for (let i = 0; i < 6; i++) {
    const a = R() * 6.28;
    const d = 0.15 + R() * 0.14;
    ell([Math.sin(a) * d, 0.09, Math.cos(a) * d], [0.02, 0.014, 0.017], stonePaint, [5, 4]);
  }

  // ---------- eucalyptus trunk ----------
  const trunkPts: number[][] = [
    [0, 0.07, -0.05],
    [0.012, 0.45, -0.052],
    [-0.008, 0.8, -0.056],
    [0, 1.02, -0.06],
  ];
  b.sweep(trunkPts, [0.075, 0.052], { color: bark, section: { ngon: 8 }, caps: "flat" });
  b.spike([0, 0.085, -0.05], [0, 1, 0], 0.14, 0.1, { color: bark, section: { ngon: 8 }, caps: "none" });
  const peel = pixelArt(["..cc", ".ccc", "cccc", "ccc.", "cc..", "cc..", "c..."], { c: "#c9ad86" });
  const peelFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 10; i++) {
    const y = 0.15 + R() * 0.85;
    const a = R() * 6.28;
    peelFrames.push(frame([Math.sin(a) * 0.058, y, -0.05 + Math.cos(a) * 0.058], [Math.sin(a), 0.1, Math.cos(a)]));
  }
  b.cards(peelFrames, peel, { size: [0.03, 0.07], lean: 40, bend: 20, flow: [0, -1, 0], rng: R, color: "#d8bfa0" });

  const limbs: number[][][] = [
    [[0, 0.88, -0.058], [0.14, 1.0, -0.07], [0.3, 1.14, -0.06]],
    [[0, 0.95, -0.06], [-0.12, 1.1, -0.05], [-0.26, 1.24, -0.06]],
    [[0, 0.99, -0.06], [0.03, 1.15, -0.05], [0.06, 1.32, -0.06]],
    [[0.01, 0.3, -0.055], [-0.1, 0.34, -0.07], [-0.2, 0.42, -0.08]],
  ];
  const leaf = pixelArt(
    [
      "...gg...",
      "..gGg...",
      "..gGgg..",
      ".gGGGg..",
      ".gGhGg..",
      ".gGhGgg.",
      "gGGhGGg.",
      "gGhhGGg.",
      ".gGhGg..",
      ".gGhGg..",
      "..gGg...",
      "..gGg...",
      "...gg...",
      "...s....",
    ],
    { g: "#2f6b57", G: "#4a9a7c", h: "#8cd1a8", s: "#59402e" },
  );
  const leafB = pixelArt(
    [
      "...dd...",
      "..dDd...",
      ".dDDDd..",
      ".dDhDd..",
      "dDDhDDd.",
      "dDhhDDd.",
      ".dDhDd..",
      ".dDhDd..",
      "..dDd...",
      "...s....",
    ],
    { d: "#3d7f7a", D: "#69b5a6", h: "#b4e4cc", s: "#59402e" },
  );
  const leafFrames: ReturnType<typeof frame>[] = [];
  for (const lp of limbs) {
    b.sweep(lp, [0.03, 0.012], { color: bark, section: { ngon: 6 }, caps: "round" });
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / n;
      const x = lp[0][0] + (lp[2][0] - lp[0][0]) * t;
      const y = lp[0][1] + (lp[2][1] - lp[0][1]) * t;
      const z = lp[0][2] + (lp[2][2] - lp[0][2]) * t;
      const sgn = i % 2 ? 1 : -1;
      const tip: number[] = [x + sgn * 0.07 + (R() - 0.5) * 0.03, y + 0.02 + R() * 0.04, z + (R() - 0.5) * 0.08];
      b.rod([x, y, z], tip, [0.007, 0.004], { color: bark, caps: "flat", section: { ngon: 4 } });
      leafFrames.push(frame(tip, [sgn * 0.5, -0.1, (R() - 0.5) * 0.6]));
      leafFrames.push(frame(tip, [sgn * 0.3, 0.4, (R() - 0.5) * 0.8]));
    }
    const tipP = lp[2];
    for (let k = 0; k < 3; k++) leafFrames.push(frame(tipP, [(k - 1) * 0.5, 0.7, (R() - 0.5) * 0.5]));
  }
  b.cards(leafFrames.filter((_, i) => i % 2 === 0), leaf, {
    size: [0.065, 0.16],
    lean: 55,
    bend: 25,
    flow: (_f: any, i: number) => [Math.sin(i * 1.7), -0.5, Math.cos(i * 2.3)],
    vary: 0.25,
    spin: 30,
    rng: R,
    cross: true,
  });
  b.cards(leafFrames.filter((_, i) => i % 2 === 1), leafB, {
    size: [0.05, 0.12],
    lean: 65,
    bend: 20,
    flow: (_f: any, i: number) => [Math.cos(i * 1.3), -0.4, Math.sin(i * 2.1)],
    vary: 0.25,
    spin: 30,
    rng: R,
  });
  for (const p of [[0.2, 1.06, -0.06], [-0.18, 1.17, -0.06], [0.05, 1.22, -0.04]]) {
    ell(p, [0.012, 0.012, 0.012], "#6b4d36", [6, 4]);
    ell([p[0], p[1] + 0.008, p[2]], [0.008, 0.005, 0.008], "#8a6a4a", [6, 3]);
  }

  // ---------- koala ----------
  const FURC = fur();
  ell([0, 0.52, 0.065], [0.165, 0.235, 0.14], FURC, [10, 8]);
  ell([0, 0.34, 0.04], [0.17, 0.13, 0.14], fur(-0.05), [10, 6]);
  ell([0, 0.55, 0.15], [0.115, 0.17, 0.06], belly, [8, 6]);
  for (let i = 0; i < 7; i++) {
    const y = 0.42 + i * 0.03;
    const x = (R() - 0.5) * 0.12;
    b.spike([x, y, 0.19], [0, -0.3, 1], 0.03, 0.012, { color: CREAM, section: { ngon: 4 }, caps: "point" });
  }

  const hy = 0.82;
  ell([0, hy, 0.12], [0.135, 0.115, 0.115], FURC, [10, 8]);
  for (const s of [1, -1]) {
    ell([s * 0.11, hy - 0.04, 0.12], [0.045, 0.045, 0.04], belly, [6, 4]);
    b.spike([s * 0.13, hy - 0.05, 0.12], [s, -0.5, 0.2], 0.04, 0.015, { color: CREAM, section: { ngon: 4 }, caps: "point" });
    b.spike([s * 0.12, hy - 0.07, 0.15], [s * 0.6, -1, 0.3], 0.035, 0.014, { color: CREAM, section: { ngon: 4 }, caps: "point" });
  }
  ell([0, hy + 0.06, 0.15], [0.09, 0.035, 0.07], fur(-0.12), [8, 4]);
  ell([0, hy - 0.03, 0.215], [0.07, 0.06, 0.05], belly, [8, 6]);
  ell([0, hy + 0.005, 0.255], [0.036, 0.05, 0.028], NOSE, [8, 6]);
  ell([0.01, hy + 0.025, 0.282], [0.008, 0.01, 0.004], "#6a6a72", [4, 3]);
  b.rod([0, hy - 0.045, 0.255], [0, hy - 0.075, 0.255], 0.004, { color: NOSE, caps: "flat", section: { ngon: 4 } });
  b.sweep([[-0.035, hy - 0.09, 0.235], [0, hy - 0.083, 0.255], [0.035, hy - 0.09, 0.235]], 0.0035, { color: NOSE, section: { ngon: 4 } });
  for (const s of [1, -1]) {
    ell([s * 0.06, hy + 0.035, 0.222], [0.017, 0.019, 0.01], NOSE, [6, 4]);
    ell([s * 0.057, hy + 0.043, 0.231], [0.005, 0.005, 0.004], "#ffffff", [4, 3]);
    b.rod([s * 0.04, hy + 0.07, 0.215], [s * 0.085, hy + 0.062, 0.195], 0.005, { color: GREY[1], caps: "flat", section: { ngon: 4 } });
  }
  for (const s of [1, -1]) {
    const ex = s * 0.135;
    const ey = hy + 0.075;
    ell([ex, ey, 0.085], [0.075, 0.075, 0.04], FURC, [10, 8], { rotation: [0, s * 25, 0] });
    ell([ex + s * 0.008, ey, 0.1], [0.052, 0.054, 0.02], belly, [8, 6], { rotation: [0, s * 25, 0] });
    ell([ex + s * 0.008, ey - 0.005, 0.114], [0.03, 0.032, 0.01], PINK, [6, 4], { rotation: [0, s * 25, 0] });
    for (let k = 0; k < 6; k++) {
      const a = (-0.2 + k * 0.5) * 1.0;
      b.spike(
        [ex + s * (0.058 * Math.cos(a + 0.4)), ey + 0.06 * Math.sin(a + 0.4), 0.1],
        [s * Math.cos(a + 0.4), Math.sin(a + 0.4), 0.2],
        0.032,
        0.011,
        { color: CREAM, section: { ngon: 4 }, caps: "point" },
      );
    }
  }

  for (const s of [1, -1]) {
    b.sweep([[s * 0.15, 0.68, 0.07], [s * 0.17, 0.62, 0.02], [s * 0.1, 0.65, -0.07]], [0.048, 0.034], { color: fur(-0.04), section: { ngon: 8 } });
    ell([s * 0.085, 0.665, -0.095], [0.04, 0.04, 0.034], fur(-0.1), [6, 5]);
    for (let f = 0; f < 3; f++) {
      const fy = 0.635 + f * 0.032;
      b.sweep(
        [[s * 0.085, fy, -0.1], [s * 0.05, fy, -0.125], [s * 0.012, fy, -0.12]],
        0.0125,
        { color: "#3a3d42", section: { ngon: 5 }, caps: "round" },
      );
      b.spike([s * 0.012, fy, -0.12], [-s * 0.4, 0, 0.9], 0.02, 0.007, { color: CLAW, section: { ngon: 4 }, caps: "point" });
    }
  }
  for (const s of [1, -1]) {
    ell([s * 0.13, 0.33, 0.07], [0.085, 0.085, 0.09], fur(-0.05), [8, 6]);
    b.sweep([[s * 0.14, 0.33, 0.1], [s * 0.15, 0.25, 0.06], [s * 0.09, 0.26, -0.06]], [0.05, 0.036], { color: fur(-0.08), section: { ngon: 8 } });
    ell([s * 0.085, 0.255, -0.09], [0.042, 0.04, 0.036], fur(-0.12), [6, 5]);
    for (let f = 0; f < 3; f++) {
      const fy = 0.225 + f * 0.034;
      b.sweep(
        [[s * 0.085, fy, -0.1], [s * 0.05, fy, -0.125], [s * 0.012, fy, -0.12]],
        0.0135,
        { color: "#3a3d42", section: { ngon: 5 }, caps: "round" },
      );
      b.spike([s * 0.012, fy, -0.12], [-s * 0.4, 0, 0.9], 0.022, 0.007, { color: CLAW, section: { ngon: 4 }, caps: "point" });
    }
  }
  const tuft = pixelArt(["..w..", ".wgw.", ".wgw.", "wgggw", "wggg.", ".gg.."], { w: GREY[5], g: GREY[3] });
  const tf: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 26; i++) {
    const a = R() * 6.28;
    const y = 0.3 + R() * 0.45;
    const rx = 0.16;
    const rz = 0.13;
    tf.push(frame([Math.sin(a) * rx * 0.92, y, 0.065 + Math.cos(a) * rz * 0.92], [Math.sin(a), 0.2, Math.cos(a)]));
  }
  b.cards(tf, tuft, { size: [0.035, 0.045], lean: 50, flow: [0, -1, 0], bend: 15, vary: 0.3, rng: R, cross: true });
  ell([0, 0.27, -0.03], [0.035, 0.03, 0.03], fur(-0.1), [6, 4]);

  return b.root;
}
