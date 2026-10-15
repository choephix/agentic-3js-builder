// Dungeon props in pixel art: a brick wall with torches and manacles, an open treasure chest, barrels, a bone pile
// and a spike trap on a flagstone floor. Everything is boxes, lathes and rods with hard square texels (kits/pixel).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import type { SweepOptions } from "../../../../src/sweep";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon prop group on a flagstone floor: brick wall with lit torches and manacles, open treasure chest with gold and gems, barrels, a skull and bone pile, a bloodied spike trap and a fallen torch.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const S = (c: string) => snapColor(c, 32);

const WOOD = ["#2a1810", "#432716", "#5e3a1f", "#7c5029", "#9a6a38"].map(S);
const IRON = ["#16181e", "#262a34", "#3a404e", "#575f72", "#7e879c"].map(S);
const GOLD = ["#5a3a0c", "#9a6414", "#d09a22", "#f2c93c", "#fff0a0"].map(S);
const STONE = ["#23222b", "#32313d", "#444352", "#575668", "#6c6b80"].map(S);
const BRICK = ["#26252e", "#34333f", "#444352", "#575668", "#6c6b80"].map(S);
const MOSS = ["#1c3a1a", "#2c5a22", "#4a8a2e"].map(S);
const BONE = ["#6e6249", "#9a8d6c", "#c9bc98", "#ece3c6"].map(S);
const CLOTH = ["#1c1410", "#2e2016", "#46301f", "#5e4228"].map(S);
const BLOODS = ["#3a0c0c", "#5c1212", "#7a1a1a", "#9a2424"].map(S);

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const r = rng(7);
  const FL = 0.04;

  const P = (geo: THREE.BufferGeometry, color: string | Paint, o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, ...o });
  const BX = (w: number, h: number, d: number, color: string | Paint, at: number[], o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const R = (a: number[], c: number[], rad: number, color: string | Paint, o: SweepOptions = {}) =>
    b.rod(a, c, rad, color, { bone: root, ...o });
  const place = (g: THREE.BufferGeometry, p: number[], rot: number[] = [0, 0, 0], s = 1) => {
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(p[0], p[1], p[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
        new THREE.Vector3(s, s, s),
      ),
    );
    return g;
  };
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ----------------------------------------------------------------------------------------------- paints
  const woodPaint = (seed: number, plank = 3) =>
    cellPaint(
      TEXEL,
      (c) => {
        const row = ((c.v % plank) + plank) % plank;
        if (row === 0) return WOOD[0];
        const j = (((c.u + 5 * Math.floor(c.v / plank)) % 14) + 14) % 14;
        if (j === 0) return WOOD[0];
        const n = noise(c.at, 0.25, seed);
        const base = 0.5 + 0.7 * (n - 0.5) + (c.random(seed) < 0.12 ? -0.25 : 0) + (row === 1 ? 0.16 : 0);
        return c.pick(WOOD, base);
      },
      { dither: true },
    );
  const ironPaint = cellPaint(
    TEXEL,
    (c) => {
      if (c.random(9) < 0.04) return "#7a3d1c";
      return c.pick(IRON, 0.45 + 0.6 * (noise(c.at, 0.12, 3) - 0.5) + (c.n.y > 0.5 ? 0.12 : 0));
    },
    { dither: true },
  );
  const goldPaint = cellPaint(
    0.015,
    (c) => c.pick(GOLD, 0.55 + 0.7 * (c.random(3) - 0.5) + (c.n.y > 0.5 ? 0.15 : -0.1)),
    { dither: true },
  );
  const stonePaint = cellPaint(TEXEL, (c) => c.pick(STONE, 0.5 + 0.8 * (noise(c.at, 0.15, 6) - 0.5)), {
    dither: true,
  });
  const trapPaint = cellPaint(
    TEXEL,
    (c) => {
      const bl = noise(c.at, 0.22, 4);
      if (bl > 0.62 && c.random(2) < 0.85) return c.pick(BLOODS, (bl - 0.6) * 3);
      return c.pick(IRON, 0.2 + 0.3 * (noise(c.at, 0.1, 5) - 0.5));
    },
    { dither: true },
  );
  const clothPaint = (lit: boolean) =>
    cellPaint(
      0.015,
      (c) => {
        if (lit && c.random(5) < 0.12) return "#e8741c";
        return c.pick(CLOTH, 0.3 + 0.6 * c.random(6) - (lit ? 0 : 0.2));
      },
      { dither: true },
    );

  // ------------------------------------------------------------------------------------------- textures
  const STONE_T = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      let v = 0.45 + (r() - 0.5) * 0.55;
      if (x < 2 || y < 2) v += 0.2;
      if (x > 29 || y > 29) v -= 0.22;
      return pick(STONE, v, bayer(x, y));
    });
    for (let k = 0; k < 3; k++) {
      let cx = Math.floor(r() * 30) + 1;
      let cy = Math.floor(r() * 8);
      for (let i = 0; i < 18; i++) {
        g.set(cx, cy, STONE[0]);
        cx += r() < 0.35 ? -1 : r() < 0.7 ? 1 : 0;
        cy += r() < 0.8 ? 1 : 0;
      }
    }
    for (let k = 0; k < 12; k++) {
      const mx = Math.floor(r() * 32);
      const my = Math.floor(r() * 32);
      g.set(mx, my, pick(MOSS, r()));
      g.set(mx + 1, my, pick(MOSS, r()));
      if (r() < 0.5) g.set(mx, my + 1, pick(MOSS, r()));
    }
  });

  const BRICK_T = pixelTexture(48, 48, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 6);
      const off = (row % 2) * 6;
      const bx = Math.floor((x + off) / 12);
      if (y % 6 === 0 || (x + off) % 12 === 0) return r() < 0.5 ? "#1a1a20" : "#22222a";
      const bv = ((bx * 7 + row * 13) % 5) / 5;
      let v = 0.2 + 0.5 * bv + (r() - 0.5) * 0.3;
      if (y % 6 === 1) v += 0.18;
      if (y % 6 === 5) v -= 0.16;
      if (y > 38 && r() < ((y - 38) / 10) * 0.45) return pick(MOSS, r());
      return pick(BRICK, v, bayer(x, y));
    });
    for (let k = 0; k < 2; k++) {
      let cx = Math.floor(r() * 44) + 2;
      let cy = Math.floor(r() * 14);
      for (let i = 0; i < 20; i++) {
        g.set(cx, cy, BRICK[0]);
        cx += r() < 0.4 ? -1 : r() < 0.7 ? 1 : 0;
        cy += 1;
      }
    }
  });

  const SOOT = pixelTexture(12, 16, (g) =>
    g.fill((x, y) => {
      const dx = (x - 5.5) / 6;
      const dy = (y - 13) / 13;
      const k = 1 - Math.sqrt(dx * dx + dy * dy);
      if (k <= bayer(x, y) * 0.9) return "";
      return k > 0.5 ? "#14110f" : "#221d1a";
    }),
  );

  const WEB = pixelTexture(10, 10, (g) =>
    g.fill((x, y) => {
      const dx = 9 - x;
      const dy = y;
      const spoke = dy === 0 || dx === 0 || dx === dy || dx === 2 * dy || dy === 2 * dx;
      const ringLine = Math.max(dx, dy) === 4 || Math.max(dx, dy) === 8;
      return spoke || (ringLine && (x + y) % 3 !== 0) ? "#cfd0d8" : "";
    }),
  );

  const BLOOD_T = pixelTexture(12, 12, (g) =>
    g.fill((x, y) => {
      const d = Math.hypot(x - 5.5, y - 5.5) / 6;
      return d + r() * 0.45 < 0.85 ? pick(BLOODS, r()) : "";
    }),
  );

  const FLAME = pixelArt(
    [
      "....yy....",
      "....yy....",
      "...ooy....",
      "...ooy.o..",
      "..ooyyoo..",
      "..ooyyyoo.",
      ".rooyyyooo",
      ".rooywyooo",
      ".rroywwyoo",
      ".rrooyyoor",
      "..rrooorr.",
      "...rrrrr..",
    ],
    { y: "#ffe45a", o: "#ff9a24", r: "#d8431c", w: "#fff6c0" },
  );

  const KEYHOLE = pixelArt(
    [
      "hhhhhhhhs",
      "hgggggggs",
      "hggkkkggs",
      "hggkkkggs",
      "hgggkgggs",
      "hgggkgggs",
      "hgggggggs",
      "sssssssss",
    ],
    { h: "#fff0a0", g: "#d09a22", s: "#9a6414", k: "#1a1410" },
  );

  const layout = skinLayout({ skull: [8, 7, 8], jaw: [6, 3, 6] }, 48);
  const SKULL_T = pixelTexture(layout.size[0], layout.size[1], (g) => {
    for (const faces of Object.values(layout.faces))
      for (const rect of Object.values(faces))
        g.fill((x, y, _w, h) => pick(BONE, 0.62 + 0.3 * (r() - 0.5) - 0.2 * (y / h), bayer(x, y)), rect);
    const f = layout.faces.skull.pz;
    const eyes = { k: "#140e0c" };
    g.stamp(f[0], f[1] + 2, [".kk..kk.", ".kk..kk."], eyes);
    g.stamp(f[0], f[1] + 4, ["...kk..."], eyes);
    g.stamp(f[0], f[1] + 6, ["wkwkwkwk"], { k: "#2a2218", w: "#efe6cc" });
    const jf = layout.faces.jaw.pz;
    g.stamp(jf[0], jf[1], ["wkwwkw"], { k: "#2a2218", w: "#efe6cc" });
    const py = layout.faces.skull.py;
    for (const [dx, dy] of [
      [3, 2],
      [4, 3],
      [4, 4],
      [5, 5],
    ])
      g.set(py[0] + dx, py[1] + dy, "#3a3024");
  });

  // merged small pieces, one part per colour
  const golds: THREE.BufferGeometry[] = [];
  const bones: THREE.BufferGeometry[] = [];
  const irons: THREE.BufferGeometry[] = [];
  const rivet = () => new THREE.BoxGeometry(0.014, 0.014, 0.014);

  // ------------------------------------------------------------------------------------------ floor
  BX(3.0, 0.03, 2.5, "#14131a", [0, 0.015, 0.25]);
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 5; j++) {
      const h = 0.034 + r() * 0.008;
      const w = 0.46 + r() * 0.02;
      P(tileBox([w, h, 0.46 + r() * 0.02], STONE_T, TEXEL, { rand: r }), "#ffffff", {
        texture: STONE_T,
        at: [-1.25 + i * 0.5 + (r() - 0.5) * 0.02, h / 2, -0.75 + j * 0.5 + (r() - 0.5) * 0.02],
        rotation: [0, (r() - 0.5) * 5, 0],
      });
    }

  // ------------------------------------------------------------------------------------------- wall
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++)
      P(tileBox([0.9, 0.9, 0.2], BRICK_T, TEXEL, { rand: r, step: [6, 6] }), "#ffffff", {
        texture: BRICK_T,
        at: [-0.9 + i * 0.9, 0.45 + j * 0.9, -1.0],
      });
  BX(2.8, 0.08, 0.3, stonePaint, [0, 1.84, -1.0]);
  BX(2.8, 0.12, 0.26, stonePaint, [0, 0.06, -0.99]);
  for (let k = 0; k < 7; k++) {
    const s = 0.05 + r() * 0.07;
    BX(s, s * 0.8, s, stonePaint, [0.95 + r() * 0.4, s * 0.4 + 0.03, -0.8 + r() * 0.2], {
      rotation: [r() * 20, r() * 90, r() * 20],
    });
  }
  P(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { texture: WEB, at: [1.2, 1.65, -0.897], dir: [0, 0, 1], axis: "z" });

  // manacles
  BX(0.34, 0.05, 0.03, ironPaint, [-0.15, 1.36, -0.885]);
  for (const [mx, n] of [
    [-0.25, 6],
    [-0.05, 4],
  ] as const) {
    for (let i = 0; i < n; i++)
      irons.push(place(new THREE.TorusGeometry(0.028, 0.007, 4, 6), [mx, 1.33 - i * 0.045, -0.865], [0, i % 2 ? 90 : 0, 0]));
    irons.push(place(new THREE.TorusGeometry(0.05, 0.012, 5, 8), [mx, 1.33 - n * 0.045 - 0.05, -0.855]));
    for (const dx of [-0.07, 0.07]) irons.push(place(rivet(), [mx + dx * 0.0 + (mx + 0.15 > 0 ? 0.07 : -0.07), 1.36, -0.868]));
  }

  // -------------------------------------------------------------------------------------- torches
  const flame = (p: THREE.Vector3, size: number) =>
    glow(
      b.cards([frame(p.toArray(), [0, 1, 0])], FLAME, {
        size: [0.17 * size, 0.27 * size],
        cross: true,
        bone: root,
        sink: 0,
        flow: [0, 0, -1],
      }),
      1,
    );

  const torch = (p0: THREE.Vector3, d: THREE.Vector3, len: number, lit: boolean, wallX: number | null) => {
    const dn = d.clone().normalize();
    const p1 = p0.clone().addScaledVector(dn, len);
    R(p0.toArray(), p1.toArray(), 0.026, woodPaint(7, 2), { sides: 6 });
    const ring = (t: number) =>
      b.lathe(
        [
          [0.03, -0.01],
          [0.05, -0.01],
          [0.05, 0.01],
          [0.03, 0.01],
        ],
        { at: p0.clone().addScaledVector(dn, t).toArray(), axis: dn.toArray(), segments: 8, color: ironPaint, bone: root },
      );
    ring(0.08);
    if (wallX !== null) {
      const c = p0.clone().addScaledVector(dn, 0.22);
      ring(0.22);
      R([wallX, c.y, -0.88], c.toArray(), 0.012, ironPaint, { sides: 5 });
      BX(0.12, 0.16, 0.04, ironPaint, [wallX, c.y, -0.88]);
      for (const [dx, dy] of [
        [-0.04, -0.06],
        [0.04, -0.06],
        [-0.04, 0.06],
        [0.04, 0.06],
      ])
        irons.push(place(rivet(), [wallX + dx, c.y + dy, -0.857]));
    }
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.058, 0.05],
        [0.064, 0.065],
        [0.052, 0.065],
        [0, 0.045],
      ],
      { at: p1.toArray(), axis: dn.toArray(), segments: 8, color: ironPaint, bone: root },
    );
    b.lathe(
      [
        [0, 0.04],
        [0.05, 0.04],
        [0.056, 0.085],
        [0.042, 0.125],
        [0, 0.14],
      ],
      { at: p1.toArray(), axis: dn.toArray(), segments: 8, color: clothPaint(lit), bone: root },
    );
    b.lathe(
      [
        [0.051, 0.062],
        [0.06, 0.062],
        [0.06, 0.076],
        [0.051, 0.076],
      ],
      { at: p1.toArray(), axis: dn.toArray(), segments: 8, color: "#a08850", bone: root },
    );
    if (lit) {
      const top = p1.clone().addScaledVector(dn, 0.13);
      glow(BX(0.07, 0.07, 0.07, "#ff9a2a", top.toArray(), { rotation: [20, 30, 10] }), 1.2);
      flame(top.clone().add(v3(0, 0.0, 0)), 1);
      flame(top.clone().add(v3(0.045, -0.01, 0.03)), 0.6);
      flame(top.clone().add(v3(-0.04, -0.02, -0.03)), 0.5);
      P(new THREE.PlaneGeometry(0.34, 0.45), "#ffffff", {
        texture: SOOT,
        at: [wallX ?? 0, top.y + 0.26, -0.897],
        dir: [0, 0, 1],
        axis: "z",
      });
    }
  };
  const tilt = 18 * DEG;
  torch(v3(-0.85, 0.9, -0.8), v3(0, Math.cos(tilt), Math.sin(tilt)), 0.5, true, -0.85);
  torch(v3(0.55, 0.9, -0.8), v3(0, Math.cos(tilt), Math.sin(tilt)), 0.5, true, 0.55);
  torch(v3(-0.9, FL + 0.055, 1.25), v3(1, 0, -0.1), 0.55, false, null);

  // ---------------------------------------------------------------------------------------- barrels
  const PR: [number, number][] = [
    [0.2, 0],
    [0.235, 0.07],
    [0.27, 0.28],
    [0.278, 0.42],
    [0.27, 0.56],
    [0.235, 0.77],
    [0.215, 0.84],
  ];
  const rAt = (y: number) => {
    for (let i = 0; i < PR.length - 1; i++)
      if (y <= PR[i + 1][1]) return PR[i][0] + ((PR[i + 1][0] - PR[i][0]) * (y - PR[i][1])) / (PR[i + 1][1] - PR[i][1]);
    return PR[PR.length - 1][0];
  };
  const barrel = (base: number[], dirIn: number[], s: number, seed: number) => {
    const D = new THREE.Vector3(dirIn[0], dirIn[1], dirIn[2]).normalize();
    const B = new THREE.Vector3(base[0], base[1], base[2]);
    const helper = Math.abs(D.y) < 0.9 ? v3(0, 1, 0) : v3(1, 0, 0);
    const E1 = D.clone().cross(helper).normalize();
    const E2 = D.clone().cross(E1).normalize();
    const body = cellPaint(
      TEXEL,
      (c) => {
        const v = c.at.clone().sub(B);
        const a = Math.atan2(v.dot(E1), v.dot(E2));
        const f = ((a + Math.PI) / (Math.PI * 2)) * 12;
        const frac = f - Math.floor(f);
        if (frac < 0.14) return WOOD[0];
        const sv = ((Math.floor(f) * 37 + seed * 11) % 7) / 7;
        const n = noise(c.at, 0.2, seed);
        return c.pick(WOOD, 0.3 + 0.35 * sv + 0.6 * (n - 0.5) + (frac < 0.3 ? 0.12 : 0) + (c.random(seed) < 0.06 ? -0.2 : 0));
      },
      { dither: true },
    );
    const profile: [number, number][] = [
      [0, 0],
      ...PR,
      [0.195, 0.84],
      [0.195, 0.815],
      [0, 0.815],
    ].map(([x, y]) => [x * s, y * s] as [number, number]);
    b.lathe(profile, { at: B.toArray(), axis: D.toArray(), segments: 12, color: body, bone: root });
    b.lathe(
      [
        [0, 0.8 * s],
        [0.2 * s, 0.8 * s],
        [0.2 * s, 0.83 * s],
        [0, 0.83 * s],
      ],
      { at: B.toArray(), axis: D.toArray(), segments: 12, color: woodPaint(seed + 4, 3), bone: root },
    );
    for (const y of [0.1, 0.27, 0.57, 0.74]) {
      const rr = rAt(y) * s;
      b.lathe(
        [
          [rr - 0.02 * s, -0.022 * s],
          [rr + 0.014 * s, -0.022 * s],
          [rr + 0.014 * s, 0.022 * s],
          [rr - 0.02 * s, 0.022 * s],
        ],
        { at: B.clone().addScaledVector(D, y * s).toArray(), axis: D.toArray(), segments: 12, color: ironPaint, bone: root },
      );
    }
  };
  barrel([-1.1, 0, -0.58], [0, 1, 0], 1, 1);
  barrel([-0.62, 0, -0.66], [0, 1, 0], 0.9, 2);
  barrel([-1.0, 0, -0.08], [0, 1, 0], 1.05, 3);
  barrel([-1.3, 0.25, 0.47], [0.94, 0, 0.34], 0.9, 4);
  P(new THREE.CylinderGeometry(0.25, 0.25, 0.004, 10), "#3a1c2e", {
    at: [-0.45, FL + 0.002, 0.78],
    scale: [1, 1, 0.7],
  });
  // candle on the first barrel
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), "#e8dcc0", { at: [-1.1, 0.836, -0.58] });
  P(new THREE.CylinderGeometry(0.022, 0.026, 0.1, 6), "#e8dcc0", { at: [-1.1, 0.88, -0.58] });
  glow(P(new THREE.BoxGeometry(0.012, 0.012, 0.012), "#ffb347", { at: [-1.1, 0.935, -0.58] }), 1);
  flame(v3(-1.1, 0.935, -0.58), 0.4);

  // ------------------------------------------------------------------------------------------ chest
  const cx = 0.8;
  const cz = -0.4;
  const W = 0.72;
  const H = 0.34;
  const Dp = 0.44;
  BX(W, H, Dp, woodPaint(1), [cx, H / 2, cz]);
  BX(W, 0.06, 0.04, woodPaint(2), [cx, 0.37, cz + Dp / 2 - 0.02]);
  BX(W, 0.06, 0.04, woodPaint(2), [cx, 0.37, cz - Dp / 2 + 0.02]);
  for (const sx of [-1, 1]) BX(0.04, 0.06, Dp - 0.08, woodPaint(2), [cx + sx * (W / 2 - 0.02), 0.37, cz]);
  BX(W + 0.02, 0.04, Dp + 0.02, ironPaint, [cx, 0.02, cz]);
  for (const sx of [-0.22, 0.22]) {
    BX(0.07, H, Dp + 0.02, ironPaint, [cx + sx, H / 2, cz]);
    for (const y of [0.07, 0.17, 0.27])
      for (const sz of [1, -1]) irons.push(place(rivet(), [cx + sx, y, cz + sz * (Dp / 2 + 0.012)]));
  }
  // gold mound
  BX(0.62, 0.04, 0.34, goldPaint, [cx, 0.36, cz]);
  BX(0.5, 0.04, 0.26, goldPaint, [cx, 0.4, cz]);
  BX(0.34, 0.04, 0.18, goldPaint, [cx, 0.44, cz]);
  for (let i = 0; i < 24; i++) {
    const dx = (r() - 0.5) * 0.52;
    const dz = (r() - 0.5) * 0.28;
    const top = Math.abs(dx) < 0.17 && Math.abs(dz) < 0.09 ? 0.46 : Math.abs(dx) < 0.25 && Math.abs(dz) < 0.13 ? 0.42 : 0.38;
    golds.push(
      place(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), [cx + dx, top + 0.004, cz + dz], [(r() - 0.5) * 40, r() * 90, (r() - 0.5) * 40]),
    );
  }
  glow(P(new THREE.OctahedronGeometry(0.034, 0), "#d02040", { at: [cx - 0.1, 0.49, cz + 0.02], flat: true }), 0.7);
  glow(P(new THREE.OctahedronGeometry(0.03, 0), "#20c060", { at: [cx + 0.12, 0.47, cz - 0.03], flat: true }), 0.7);
  glow(P(new THREE.OctahedronGeometry(0.026, 0), "#3a7cf0", { at: [cx + 0.03, 0.5, cz + 0.05], flat: true }), 0.7);
  // lock plate
  BX(0.14, 0.15, 0.012, "#9a6414", [cx, 0.27, cz + Dp / 2 + 0.006]);
  P(new THREE.PlaneGeometry(0.1125, 0.1), "#ffffff", { texture: KEYHOLE, at: [cx, 0.27, cz + Dp / 2 + 0.014] });
  // lid on its hinge
  const lid = b.joint("chestLid", { parent: root, at: [cx, 0.4, cz - Dp / 2], role: "hinge" });
  const arch = (k: number): [number, number][] =>
    Array.from({ length: 13 }, (_, i) => {
      const a = (Math.PI * i) / 12;
      return [(Dp / 2 + k) * Math.cos(a), (0.16 + k) * Math.sin(a)] as [number, number];
    });
  b.extrude(arch(0), { at: [cx, 0.4, cz], x: [0, 0, 1], thickness: W, color: woodPaint(3), bone: lid });
  for (const sx of [-0.22, 0.22]) {
    b.extrude(arch(0.012), { at: [cx + sx, 0.4, cz], x: [0, 0, 1], thickness: 0.07, color: ironPaint, bone: lid });
  }
  BX(0.1, 0.1, 0.022, ironPaint, [cx, 0.44, cz + Dp / 2 + 0.012], { bone: lid });
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });
  // coins on the floor in front
  for (let i = 0; i < 10; i++)
    golds.push(
      place(
        new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8),
        [cx - 0.3 + r() * 0.7, FL + 0.005, cz + Dp / 2 + 0.08 + r() * 0.22],
        [(r() - 0.5) * 16, r() * 90, (r() - 0.5) * 16],
      ),
    );
  for (let i = 0; i < 5; i++) golds.push(place(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), [1.3, FL + 0.005 + i * 0.008, 0.05], [0, i * 20, 0]));

  // ------------------------------------------------------------------------------------- spike trap
  const tx = 0.15;
  const tz = 0.6;
  for (const sz of [-1, 1]) BX(0.9, 0.05, 0.1, ironPaint, [tx, 0.045, tz + sz * 0.4]);
  for (const sx of [-1, 1]) BX(0.1, 0.05, 0.7, ironPaint, [tx + sx * 0.4, 0.045, tz]);
  BX(0.7, 0.02, 0.7, trapPaint, [tx, 0.05, tz]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) irons.push(place(rivet(), [tx + sx * 0.4, 0.073, tz + sz * 0.4], [0, 45, 0], 1.3));
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) {
      const x = tx - 0.26 + i * 0.13;
      const z = tz - 0.26 + j * 0.13;
      BX(0.07, 0.025, 0.07, ironPaint, [x, 0.0725, z]);
      const roll = r();
      const len = roll < 0.55 ? 0.28 - r() * 0.06 : roll < 0.8 ? 0.14 : 0.045;
      const bloody = r() < 0.4;
      b.spike([x, 0.08, z], [0, 1, 0], len, 0.03, {
        sides: 4,
        bone: root,
        color: bloody ? "#8a1c1c" : "#9aa3b8",
        bands: bloody ? [[0.55, "#9aa3b8"]] : undefined,
      });
    }
  P(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", { texture: BLOOD_T, at: [tx + 0.1, FL + 0.004, tz + 0.7], dir: [0, 1, 0], axis: "z" });

  // ------------------------------------------------------------------------------------------ bones
  const sk = { x: 0.92, z: 0.55, yaw: 30 };
  const rot2 = (ox: number, oz: number) => [
    sk.x + ox * Math.cos(sk.yaw * DEG) + oz * Math.sin(sk.yaw * DEG),
    sk.z - ox * Math.sin(sk.yaw * DEG) + oz * Math.cos(sk.yaw * DEG),
  ];
  const [jx, jz] = rot2(0, 0.02);
  P(skinBox(SKULL_T, layout.faces.jaw, TEXEL), "#ffffff", { texture: SKULL_T, at: [jx, FL + 0.03, jz], rotation: [0, sk.yaw, 0] });
  P(skinBox(SKULL_T, layout.faces.skull, TEXEL), "#ffffff", {
    texture: SKULL_T,
    at: [sk.x, FL + 0.13, sk.z],
    rotation: [0, sk.yaw, 0],
  });
  const longBone = (a: number[], c: number[], rad: number) => {
    const y = FL + 0.03;
    R([a[0], y, a[1]], [c[0], y, c[1]], rad, "#d9cfae", { sides: 6 });
    const dx = c[0] - a[0];
    const dz = c[1] - a[1];
    const l = Math.hypot(dx, dz);
    const px = -dz / l;
    const pz = dx / l;
    for (const e of [a, c])
      for (const sgn of [-1, 1])
        bones.push(place(new THREE.SphereGeometry(rad * 1.4, 6, 4), [e[0] + px * sgn * rad * 0.9, y, e[1] + pz * sgn * rad * 0.9]));
  };
  longBone([0.75, 1.0], [1.15, 0.85], 0.016);
  longBone([0.9, 0.15], [1.3, 0.28], 0.016);
  longBone([1.2, 1.1], [1.42, 1.2], 0.012);
  longBone([-1.1, 1.0], [-0.85, 1.15], 0.013);
  // ribcage lying on its back
  const rz = 0.5;
  const y0 = FL + 0.02;
  R([1.1, y0 + 0.01, rz], [1.42, y0 + 0.01, rz], 0.016, "#d9cfae", { sides: 6 });
  for (let k = 0; k < 6; k++) {
    const x = 1.13 + k * 0.05;
    const L = 1 - 0.1 * Math.abs(k - 2);
    bones.push(place(new THREE.BoxGeometry(0.034, 0.026, 0.034), [x, y0 + 0.02, rz]));
    for (const sgn of [-1, 1]) {
      const pts = [
        [x, y0 + 0.01, rz + sgn * 0.012],
        [x + 0.008, y0 + 0.055, rz + sgn * 0.07 * L],
        [x + 0.012, y0 + 0.09, rz + sgn * 0.12 * L],
        [x + 0.016, y0 + 0.07, rz + sgn * 0.16 * L],
      ];
      b.sweep(catmull(pts), [0.011, 0.006], { color: "#d9cfae", sides: 5, bone: root });
    }
  }
  bones.push(place(new THREE.BoxGeometry(0.05, 0.03, 0.09), [1.45, y0 + 0.015, rz - 0.05], [0, 20, 0]));
  bones.push(place(new THREE.BoxGeometry(0.05, 0.03, 0.09), [1.45, y0 + 0.015, rz + 0.05], [0, -20, 0]));
  for (let i = 0; i < 16; i++)
    bones.push(
      place(new THREE.BoxGeometry(0.02 + r() * 0.02, 0.012, 0.012), [0.6 + r() * 0.85, FL + 0.007, 0.05 + r() * 1.2], [0, r() * 180, 0]),
    );

  // ----------------------------------------------------------------------------------- merged pieces
  const flush = (list: THREE.BufferGeometry[], color: string) => {
    const m = list.length ? mergeGeometries(list) : null;
    if (m) b.part(m, color, { bone: root, at: [0, 0, 0] });
  };
  flush(golds, "#e5b02c");
  flush(bones, "#d9cfae");
  flush(irons, "#9aa2b6");

  return b.root;
}
