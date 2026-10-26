import * as THREE from "three";
import { createBuilder, mottle } from "../../../../src/index";

export const meta = {
  name: "Italian Pearl Piano Accordion",
  description:
    "A mother-of-pearl piano accordion with gold trim, 24 white and 17 black keys, a 88-button bass board, a red pleated bellows and a pearl-and-gold mosaic.",
};

type V = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "accordion" });

  // ---- palette ----
  const PEARL = mottle("#f7f2e9", "#d4e8ee", { size: 0.035, contrast: 0.9, seed: 3 });
  const PEARL2 = mottle("#f3dce6", "#e2f1ec", { size: 0.03, contrast: 0.9, seed: 8 });
  const PEARL_FLAT = "#f6f1e8";
  const IVORY = "#fdf9ee";
  const PINK = "#f2c4d4";
  const AQUA = "#9fddd8";
  const LILAC = "#cfc2f0";
  const GOLD = "#d4a437";
  const GOLD_D = "#8e6a1c";
  const RED = "#a5121c";
  const RED_L = "#c0232e";
  const RED_D = "#4f0a10";
  const BLACK = "#17141a";
  const LEATHER = "#2d1b14";
  const CHROME = "#c9d0d6";
  const STITCH = "#dccdaa";

  // ---- dimensions ----
  const XT = 0.225;
  const XB = -0.225;
  const BW = 0.2;
  const BH = 0.4;
  const BD = 0.26;
  const Y0 = 0.012;
  const CY = Y0 + BH / 2;
  const ZF = BD / 2;
  const TOP = Y0 + BH;

  // ---- helpers ----
  const box = (size: V, color: any, at: V) => b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at });
  const cyl = (r: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });
  const gem = (r: number, color: string, at: V) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), color, { at, flat: true });

  const diamondGeo = new THREE.OctahedronGeometry(0.5);
  const diamond = (color: string, at: V, axis: "x" | "y" | "z", s: number) => {
    const scale: V = axis === "z" ? [s * 0.7, s, s * 0.28] : axis === "x" ? [s * 0.28, s, s * 0.7] : [s * 0.7, s * 0.28, s];
    return b.part(diamondGeo, color, { at, scale, flat: true });
  };
  const diamonds = (p0: V, p1: V, n: number, axis: "x" | "y" | "z", s: number, cols: string[], offset = 0) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const at: V = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t];
      diamond(cols[(i + offset) % cols.length], at, axis, s);
    }
  };
  const frameEdges = (c: V, w: number, h: number, d: number, t: number, color: string) => {
    for (const sx of [1, -1])
      for (const sy of [1, -1])
        for (const sz of [1, -1]) {
          box([t, h + t, t], color, [c[0] + (sx * w) / 2, c[1], c[2] + (sz * d) / 2]);
          box([w + t, t, t], color, [c[0], c[1] + (sy * h) / 2, c[2] + (sz * d) / 2]);
          box([t, t, d + t], color, [c[0] + (sx * w) / 2, c[1] + (sy * h) / 2, c[2]]);
        }
  };
  const PALE = [PINK, AQUA, LILAC, PEARL_FLAT, GOLD];

  // ---- feet ----
  for (const cx of [XT, XB])
    for (const sx of [1, -1])
      for (const sz of [1, -1]) cyl(0.013, 0.012, 8, BLACK, [cx + sx * 0.07, 0.006, sz * 0.09]);

  // ---- boxes ----
  b.part(new THREE.BoxGeometry(BW, BH, BD), PEARL, { at: [XT, CY, 0] });
  b.part(new THREE.BoxGeometry(BW, BH, BD), PEARL2, { at: [XB, CY, 0] });
  frameEdges([XT, CY, 0], BW, BH, BD, 0.008, GOLD);
  frameEdges([XB, CY, 0], BW, BH, BD, 0.008, GOLD);

  // ---- bellows ----
  const BX = 0.125;
  const BCOREH = 0.32;
  box([BX * 2, BCOREH, 0.19], RED_D, [0, CY, 0]);
  const folds = 12;
  const pitch = (BX * 2) / folds;
  for (let i = 0; i < folds; i++) {
    const x = -BX + (i + 0.5) * pitch;
    box([0.011, 0.36, 0.23], i % 2 ? RED : RED_L, [x, CY, 0]);
    for (const sy of [1, -1])
      for (const sz of [1, -1]) {
        box([0.013, 0.03, 0.03], GOLD, [x, CY + sy * 0.18, sz * 0.115]);
      }
    // pearl pleat inlay on the front
    if (i % 2 === 0) box([0.006, 0.12, 0.002], PEARL_FLAT, [x, CY, 0.1165]);
  }
  for (const s of [1, -1]) {
    box([0.012, 0.38, 0.24], BLACK, [s * (BX - 0.004), CY, 0]);
    box([0.014, 0.04, 0.245], GOLD_D, [s * (BX - 0.004), CY + 0.19, 0]);
    box([0.014, 0.04, 0.245], GOLD_D, [s * (BX - 0.004), CY - 0.19, 0]);
  }

  // ---- treble keyboard (front, +Z) ----
  const P = 0.0155;
  const KY0 = 0.026;
  box([0.1, 0.385, 0.004], RED_D, [XT, CY, ZF + 0.002]);
  for (let i = 0; i < 24; i++) {
    box([0.085, 0.0145, 0.014], IVORY, [XT, KY0 + (i + 0.5) * P, ZF + 0.0075]);
  }
  for (let i = 0; i < 23; i++) {
    if (![0, 1, 3, 4, 5].includes(i % 7)) continue;
    const y = KY0 + (i + 1) * P;
    const x = XT + 0.0175;
    box([0.05, 0.009, 0.011], BLACK, [x, y, ZF + 0.0185]);
    box([0.032, 0.0035, 0.0012], PEARL_FLAT, [x, y, ZF + 0.0246]);
  }
  box([0.1, 0.006, 0.02], GOLD, [XT, KY0 - 0.004, ZF + 0.01]);
  box([0.1, 0.006, 0.02], GOLD, [XT, KY0 + 24 * P + 0.004, ZF + 0.01]);
  for (const s of [1, -1]) {
    box([0.005, 0.385, 0.02], GOLD, [XT + s * 0.0525, CY, ZF + 0.01]);
    diamonds([XT + s * 0.0765, 0.04, ZF], [XT + s * 0.0765, 0.385, ZF], 13, "z", 0.017, PALE, s > 0 ? 0 : 2);
  }

  // ---- bass buttons (front, +Z) ----
  for (let c = 0; c < 8; c++)
    for (let r = 0; r < 11; r++) {
      const x = XB - 0.075 + c * 0.0214;
      const y = 0.045 + r * 0.027 + (c % 2 ? 0.0135 : 0);
      cyl(0.0095, 0.003, 10, GOLD, [x, y, ZF + 0.0015], [0, 0, 1]);
      cyl(0.0072, 0.008, 8, r === 3 || r === 8 ? "#2b2530" : IVORY, [x, y, ZF + 0.005], [0, 0, 1]);
    }
  for (const s of [1, -1]) diamonds([XB + s * 0.0935, 0.04, ZF], [XB + s * 0.0935, 0.385, ZF], 14, "z", 0.013, PALE, s > 0 ? 1 : 3);

  // badge / nameplate
  const cartouche: [number, number][] = [
    [-0.05, 0],
    [-0.04, 0.018],
    [0, 0.022],
    [0.04, 0.018],
    [0.05, 0],
    [0.04, -0.018],
    [0, -0.022],
    [-0.04, -0.018],
  ];
  b.extrude(cartouche, { at: [XB, 0.375, ZF + 0.003], x: [1, 0, 0], thickness: 0.006, bevel: 0.002, smoothing: 2, color: GOLD });
  b.extrude(cartouche.map(([x, y]) => [x * 0.82, y * 0.78] as [number, number]), {
    at: [XB, 0.375, ZF + 0.006],
    x: [1, 0, 0],
    thickness: 0.004,
    smoothing: 2,
    color: PEARL_FLAT,
  });
  const nameTex = THREE_svg();
  b.part(new THREE.PlaneGeometry(0.075, 0.026), "#ffffff", {
    at: [XB, 0.375, ZF + 0.0085],
    dir: [0, 0, 1],
    axis: "z",
    texture: nameTex,
  });
  for (const s of [1, -1]) gem(0.0055, RED_L, [XB + s * 0.056, 0.375, ZF + 0.008]);

  // ---- mosaic on backs and tops ----
  for (const cx of [XT, XB])
    for (let r = 0; r < 5; r++)
      diamonds([cx - 0.07, 0.07 + r * 0.075, -ZF], [cx + 0.07, 0.07 + r * 0.075, -ZF], 5, "z", 0.022, PALE, r);
  diamonds([XT - 0.05, TOP, -0.1], [XT - 0.05, TOP, 0.1], 8, "y", 0.022, PALE);
  diamonds([XB + 0.05, TOP, -0.1], [XB + 0.05, TOP, 0.1], 8, "y", 0.022, PALE, 2);
  diamonds([XB, TOP, -0.1], [XB, TOP, 0.1], 8, "y", 0.016, [GOLD, PEARL_FLAT]);

  // ---- treble top: register switches ----
  box([0.045, 0.003, 0.2], BLACK, [XT + 0.05, TOP + 0.0005, 0]);
  for (let i = 0; i < 5; i++) {
    const z = -0.08 + i * 0.04;
    box([0.032, 0.007, 0.026], i % 2 ? PINK : PEARL_FLAT, [XT + 0.05, TOP + 0.004, z]);
    box([0.03, 0.0015, 0.006], GOLD, [XT + 0.05, TOP + 0.0081, z]);
  }

  // ---- treble +X grille ----
  const GX = XT + BW / 2;
  box([0.004, 0.33, 0.2], BLACK, [GX + 0.002, CY, 0]);
  for (let i = 0; i < 15; i++) box([0.006, 0.008, 0.185], GOLD, [GX + 0.0045, 0.05 + i * 0.0235, 0]);
  box([0.01, 0.012, 0.2], GOLD_D, [GX + 0.005, CY + 0.17, 0]);
  box([0.01, 0.012, 0.2], GOLD_D, [GX + 0.005, CY - 0.17, 0]);
  cyl(0.036, 0.008, 12, PEARL_FLAT, [GX + 0.009, CY, 0], [1, 0, 0]);
  b.part(new THREE.TorusGeometry(0.037, 0.004, 5, 14), GOLD, { at: [GX + 0.012, CY, 0], dir: [1, 0, 0], axis: "z" });
  cyl(0.012, 0.006, 8, RED_L, [GX + 0.015, CY, 0], [1, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    diamond(i % 2 ? AQUA : PINK, [GX + 0.012, CY + Math.cos(a) * 0.058, Math.sin(a) * 0.058], "x", 0.02);
  }

  // ---- bass -X end: strap ----
  const SX = XB - BW / 2;
  box([0.008, 0.22, 0.1], LEATHER, [SX - 0.004, CY, 0]);
  box([0.0085, 0.2, 0.003], STITCH, [SX - 0.0045, CY, 0.042]);
  box([0.0085, 0.2, 0.003], STITCH, [SX - 0.0045, CY, -0.042]);
  box([0.012, 0.045, 0.062], GOLD, [SX - 0.01, CY, 0]);
  box([0.014, 0.03, 0.042], LEATHER, [SX - 0.0105, CY, 0]);
  box([0.016, 0.006, 0.05], CHROME, [SX - 0.0115, CY + 0.005, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    diamond(PALE[i % 5], [SX, CY + 0.15 * Math.cos(a), 0.095 * Math.sin(a)], "x", 0.022);
  }

  // ---- back straps ----
  box([0.07, 0.2, 0.008], LEATHER, [XB, CY, -ZF - 0.004]);
  box([0.003, 0.2, 0.0085], STITCH, [XB + 0.025, CY, -ZF - 0.0045]);
  box([0.003, 0.2, 0.0085], STITCH, [XB - 0.025, CY, -ZF - 0.0045]);
  box([0.05, 0.02, 0.012], GOLD, [XB, CY + 0.08, -ZF - 0.01]);
  for (const sy of [0.12, -0.12])
    b.part(new THREE.TorusGeometry(0.014, 0.003, 5, 10), CHROME, { at: [XT, CY + sy, -ZF - 0.012] });
  box([0.03, 0.03, 0.01], GOLD_D, [XT, CY + 0.12, -ZF - 0.005]);
  box([0.03, 0.03, 0.01], GOLD_D, [XT, CY - 0.12, -ZF - 0.005]);

  // ---- carry handle on bass top ----
  b.sweep(
    [
      [-0.29, TOP, 0],
      [-0.285, TOP + 0.045, 0],
      [-0.225, TOP + 0.068, 0],
      [-0.165, TOP + 0.045, 0],
      [-0.16, TOP, 0],
    ],
    0.011,
    { color: LEATHER },
  );
  for (const x of [-0.29, -0.16]) {
    cyl(0.018, 0.008, 8, GOLD, [x, TOP + 0.004, 0]);
  }
  // air valve button
  cyl(0.013, 0.008, 8, GOLD, [XB + 0.05, TOP + 0.004, 0.09]);
  cyl(0.009, 0.01, 8, PEARL_FLAT, [XB + 0.05, TOP + 0.007, 0.09]);

  return b.root;
}

// small nameplate drawing
import { svg } from "../../../../src/index";
function THREE_svg() {
  return svg(
    `<svg viewBox="0 0 150 52" xmlns="http://www.w3.org/2000/svg">
      <text x="75" y="35" text-anchor="middle" font-family="serif" font-style="italic" font-weight="bold" font-size="32" fill="#4a1a28">ITALIA</text>
    </svg>`,
    { size: 256 },
  );
}
