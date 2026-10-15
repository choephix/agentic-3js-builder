import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import type { ColorInput } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "A dungeon prop group in pixel art: banded treasure chest with spilled coins, two caged standing torches with pixel flames, an upright and a cradled barrel, a skull with scattered bones and a bloodied spike trap on flagstones.",
  style: "pixel art",
  commit: "88fc1f0",
};

type V = [number, number, number];
const TEXEL = 0.02;
const F = 0.045; // flagstone floor height

const WOOD = ["#2e1a0e", "#4d2d15", "#6e4220", "#8c5a2b", "#aa7439"];
const WOOD_RED = ["#2a110e", "#472018", "#68321f", "#864430", "#a05a40"];
const WOOD_DARK = ["#1f120a", "#35200f", "#4d2f17", "#65401f", "#7a5028"];
const IRON = ["#12141a", "#21242d", "#343845", "#4b5061", "#6a7083"];
const STONE = ["#24221f", "#38352f", "#4d4942", "#655f55", "#7f786a"];
const STONE_DIRT = ["#2a2018", "#3f2f22", "#574232", "#715744", "#8a6c56"];
const STONE_DARK = ["#16151a", "#252429", "#35343b", "#47464e", "#5a5963"];
const BONE = ["#7d6e52", "#a8976f", "#cfc095", "#ebe0bd"];
const BLOOD = "#7a1212";

function plankTile(ramp: string[], seed: number) {
  return pixelTexture(48, 30, (g) => {
    const r = rng(seed);
    const joints = [0, 1, 2, 3, 4].map(() => Math.floor(r() * 48));
    g.fill((x, y) => {
      const row = Math.floor(y / 6);
      const ly = y % 6;
      if (ly === 0 || x === joints[row]) return ramp[0];
      if (ly === 1) return ramp[ramp.length - 1];
      const grain = (x * 7 + row * 13) % 11 === 0 ? -0.18 : 0;
      return pick(ramp, 0.4 + 0.3 * r() + grain - (ly === 5 ? 0.15 : 0), bayer(x, y));
    });
  });
}

function ironTile(seed: number) {
  return pixelTexture(16, 16, (g) => {
    const r = rng(seed);
    g.fill((x, y) => {
      const scratch = r() < 0.05 ? 0.25 : 0;
      return pick(IRON, 0.3 + 0.22 * r() + (y < 2 ? 0.28 : 0) - (y > 13 ? 0.2 : 0) + scratch, bayer(x, y));
    });
  });
}

function stoneTile(ramp: string[], seed: number) {
  return pixelTexture(48, 48, (g) => {
    const r = rng(seed);
    g.fill((x, y) => {
      const row = Math.floor(y / 12);
      const xo = (x + (row % 2) * 8) % 16;
      if (y % 12 === 0 || xo === 0) return ramp[0];
      const hi = y % 12 === 1 || xo === 1 ? 0.2 : 0;
      return pick(ramp, 0.4 + 0.25 * r() + hi - (y % 12 === 11 ? 0.15 : 0), bayer(x, y));
    });
  });
}

function boneTile(seed: number) {
  return pixelTexture(16, 16, (g) => {
    const r = rng(seed);
    g.fill((x, y) => pick(BONE, 0.55 + 0.3 * r() - (y > 12 ? 0.25 : 0) + (y < 2 ? 0.2 : 0), bayer(x, y)));
  });
}

const KEYPLATE = pixelArt(
  [
    "kkkkkkkkkk",
    "khhhhhhhhk",
    "kmmmmmmmmk",
    "kmmmddmmmk",
    "kmmddddmmk",
    "kmmddddmmk",
    "kmmmddmmmk",
    "kmmmddmmmk",
    "kmmmddmmmk",
    "kmmddddmmk",
    "kmmmmmmmmk",
    "kmmmmmmmmk",
    "kmmmmmmmmk",
    "kkkkkkkkkk",
  ],
  { k: "#101218", h: "#6a7083", m: "#3a3e4c", d: "#07080b" },
);

const FLAME = pixelArt(
  [
    "......o.....",
    "......o.....",
    ".....oo.....",
    ".....oo..r..",
    "....ooo..rr.",
    "..r.oyoo.rr.",
    "..rooyyoorr.",
    ".rooyyyyoor.",
    ".rooyyyyoor.",
    "rooyywwyyoor",
    "rooyywwyyoor",
    "rooyywwyyoor",
    ".rooyywwyoor",
    ".rrooyyyoorr",
    "..rroooorr..",
    "....rrrr....",
  ],
  { r: "#d8321a", o: "#ff8a1c", y: "#ffd23a", w: "#fff3a8" },
);

function woodPaint(c0: V, axis: "x" | "y" | "z", ramp: string[], staves: number) {
  return cellPaint(
    0.02,
    (c) => {
      const dx = c.at.x - c0[0];
      const dy = c.at.y - c0[1];
      const dz = c.at.z - c0[2];
      let ang: number;
      let across: number;
      let cap: boolean;
      if (axis === "y") {
        ang = Math.atan2(dx, dz);
        across = dx;
        cap = Math.abs(c.n.y) > 0.7;
      } else if (axis === "z") {
        ang = Math.atan2(dy, dx);
        across = dx;
        cap = Math.abs(c.n.z) > 0.7;
      } else {
        ang = Math.atan2(dy, dz);
        across = dy;
        cap = Math.abs(c.n.x) > 0.7;
      }
      const k = cap ? across / 0.07 : ((ang + Math.PI) / (2 * Math.PI)) * staves;
      const idx = Math.floor(k);
      const f = k - idx;
      if (f < 0.14) return ramp[0];
      const h = Math.abs(Math.sin(idx * 12.9898 + 7.1) * 43758.5453) % 1;
      let tone = 0.35 + 0.4 * h + 0.12 * (c.random(1) - 0.5);
      if (f < 0.28) tone += 0.14;
      if (c.random(2) < 0.07) tone -= 0.2;
      return c.pick(ramp, tone);
    },
    { dither: true },
  );
}

const ironPaint = cellPaint(
  0.02,
  (c) => c.pick(IRON, 0.3 + 0.25 * c.random(1) + 0.18 * c.n.y + (c.random(2) < 0.04 ? 0.3 : 0)),
  { dither: true },
);

function spikePaint(baseY: number, len: number) {
  return cellPaint(
    0.012,
    (c) => {
      const h = (c.at.y - baseY) / len;
      if (h > 0.5 && c.random(3) < 0.4 * h) return BLOOD;
      return c.pick(IRON, 0.62 - 0.32 * h + 0.15 * (c.random(1) - 0.5));
    },
    { dither: true },
  );
}

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const PLANK_A = plankTile(WOOD, 3);
  const PLANK_D = plankTile(WOOD_DARK, 5);
  const IRONT = ironTile(7);
  const STONE_F = stoneTile(STONE, 9);
  const STONE_T = stoneTile(STONE_DIRT, 13);
  const STONE_B = stoneTile(STONE_DARK, 17);
  const BONET = boneTile(19);

  const P = (p: V): V => [p[0], p[1] + F, p[2]];
  const tbox = (size: V, tile: THREE.Texture, at: V, rot?: V, step?: [number, number]) =>
    b.part(tileBox(size, tile, TEXEL, { rand: R, step }), "#ffffff", {
      texture: tile,
      bone: root,
      at: P(at),
      rotation: rot,
    });
  const cbox = (size: V, color: ColorInput, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: root, at: P(at), rotation: rot });
  const ry = (l: V, yaw: number, o: [number, number]): V => {
    const a = (yaw * Math.PI) / 180;
    return [o[0] + l[0] * Math.cos(a) + l[2] * Math.sin(a), l[1], o[1] - l[0] * Math.sin(a) + l[2] * Math.cos(a)];
  };

  const rivets: THREE.BufferGeometry[] = [];
  const stud = (x: number, y: number, z: number, yaw = 0, s = 0.03) => {
    const q = P([x, y, z]);
    rivets.push(new THREE.BoxGeometry(s, s, s * 0.8).rotateY(yaw).translate(q[0], q[1], q[2]));
  };
  const ringStuds = (x: number, y: number, z: number, rr: number, count: number, phase: number, s = 0.028) => {
    for (let k = 0; k < count; k++) {
      const a = phase + (k * 2 * Math.PI) / count;
      stud(x + rr * Math.sin(a), y, z + rr * Math.cos(a), a, s);
    }
  };

  // ---------------------------------------------------------------- floor
  b.part(new THREE.BoxGeometry(3.3, 0.03, 2.6), "#14110f", { bone: root, at: [0, 0.015, -0.1] });
  const fx = [-1.2, -0.4, 0.4, 1.2];
  const fz = [-0.95, -0.1, 0.75];
  for (const x of fx)
    for (const z of fz) {
      const h = 0.036 + 0.009 * R();
      b.part(tileBox([0.79, h, 0.84], STONE_F, TEXEL, { rand: R }), "#ffffff", {
        texture: STONE_F,
        bone: root,
        at: [x, h / 2, z],
      });
    }

  // ---------------------------------------------------------------- chest
  {
    const cx = 0.15;
    const cz = -0.6;
    tbox([0.94, 0.08, 0.6], IRONT, [cx, 0.04, cz]);
    tbox([0.88, 0.34, 0.54], PLANK_A, [cx, 0.25, cz], undefined, [1, 6]);
    const lidPaint = woodPaint(P([cx, 0.42, cz]), "x", WOOD, 10);
    const half = (len: number, r: number, color: ColorInput, x: number) =>
      b.part(new THREE.CylinderGeometry(r, r, len, 12, 1, false, 0, Math.PI), color, {
        bone: root,
        at: P([x, 0.42, cz]),
        rotation: [0, 0, 90],
      });
    half(0.88, 0.28, lidPaint, cx);
    for (const s of [1, -1]) {
      half(0.09, 0.296, ironPaint, cx + s * 0.33);
      half(0.03, 0.29, ironPaint, cx + s * 0.435);
      tbox([0.1, 0.34, 0.57], IRONT, [cx + s * 0.33, 0.25, cz]);
      tbox([0.08, 0.34, 0.58], IRONT, [cx + s * 0.425, 0.25, cz]);
      tbox([0.1, 0.06, 0.04], IRONT, [cx + s * 0.25, 0.46, cz - 0.285]);
      for (const y of [0.15, 0.33]) {
        stud(cx + s * 0.33, y, cz + 0.29);
        stud(cx + s * 0.425, y, cz + 0.295);
      }
      for (const ph of [15, 40, 65]) {
        const a = (ph * Math.PI) / 180;
        stud(cx + s * 0.33, 0.42 + 0.3 * Math.sin(a), cz + 0.3 * Math.cos(a), 0, 0.03);
      }
      stud(cx + s * 0.05, 0.27, cz + 0.318, 0, 0.026);
      stud(cx + s * 0.05, 0.41, cz + 0.318, 0, 0.026);
    }
    tbox([0.92, 0.05, 0.57], IRONT, [cx, 0.4, cz]);
    tbox([0.9, 0.04, 0.03], IRONT, [cx, 0.43, cz + 0.275]);
    tbox([0.14, 0.2, 0.03], IRONT, [cx, 0.34, cz + 0.3]);
    b.part(new THREE.PlaneGeometry(0.1, 0.14), "#ffffff", {
      texture: KEYPLATE,
      bone: root,
      at: P([cx, 0.34, cz + 0.3 + 0.017]),
    });
    tbox([0.08, 0.14, 0.025], IRONT, [cx, 0.5, cz + 0.285], [-15, 0, 0]);
    // spilled coins
    const coins: THREE.BufferGeometry[] = [];
    const coin = (x: number, y: number, z: number, tilt = 0) => {
      const q = P([x, y, z]);
      coins.push(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8).rotateX(tilt).translate(q[0], q[1], q[2]));
    };
    coin(cx + 0.3, 0.005, cz + 0.45);
    coin(cx + 0.36, 0.005, cz + 0.5);
    coin(cx + 0.25, 0.005, cz + 0.5);
    coin(cx + 0.3, 0.015, cz + 0.48, 0.15);
    coin(cx + 0.18, 0.005, cz + 0.42);
    coin(cx + 0.4, 0.005, cz + 0.4);
    coin(cx + 0.22, 0.05, cz + 0.33, 1.2);
    b.part(mergeGeometries(coins)!, "#f2b829", { bone: root, at: [0, 0, 0] });
    const rim: THREE.BufferGeometry[] = [];
    for (const [x, z] of [
      [cx + 0.3, cz + 0.45],
      [cx + 0.25, cz + 0.5],
    ]) {
      const q = P([x, 0.01, z]);
      rim.push(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 8).translate(q[0], q[1], q[2]));
    }
    b.part(mergeGeometries(rim)!, "#b57a14", { bone: root, at: [0, 0, 0] });
  }

  // ---------------------------------------------------------------- barrels
  {
    const prof: [number, number][] = [
      [0, 0.25],
      [0.04, 0.27],
      [0.2, 0.3],
      [0.4, 0.33],
      [0.6, 0.3],
      [0.76, 0.27],
      [0.8, 0.25],
    ];
    const rAt = (y: number) => {
      for (let i = 0; i < prof.length - 1; i++) {
        const [y0, r0] = prof[i];
        const [y1, r1] = prof[i + 1];
        if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
      }
      return prof[prof.length - 1][1];
    };
    const bx = -1.25;
    const bz = -0.15;
    const outline: [number, number][] = [
      [0, 0.03],
      [0.22, 0.03],
      [0.22, 0],
      ...prof.map(([y, r]) => [r, y] as [number, number]),
      [0.22, 0.8],
      [0.22, 0.77],
      [0, 0.77],
    ];
    b.lathe(outline, {
      at: P([bx, 0, bz]),
      segments: 10,
      color: woodPaint([bx, 0, bz], "y", WOOD, 10),
      bone: root,
    });
    for (const y of [0.09, 0.27, 0.53, 0.7]) {
      const ro = rAt(y) + 0.022;
      const ri = rAt(y) - 0.02;
      b.lathe(
        [
          [ri, y - 0.04],
          [ro, y - 0.04],
          [ro, y + 0.04],
          [ri, y + 0.04],
        ],
        { at: P([bx, 0, bz]), segments: 10, color: ironPaint, bone: root },
      );
      ringStuds(bx, y, bz, ro * 0.951 + 0.004, 10, Math.PI / 10);
    }
    b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.05, 6), "#8c5a2b", {
      bone: root,
      at: P([bx + 0.1, 0.795, bz - 0.05]),
    });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 8), "#4b5061", {
      bone: root,
      at: P([bx - 0.06, 0.776, bz + 0.07]),
    });

    // lying barrel on a cradle
    const lx = -0.7;
    const lz = 0.55;
    const cy = 0.35;
    const lo: [number, number][] = [
      [0, -0.25],
      [0.2, -0.25],
      [0.2, -0.28],
      [0.235, -0.28],
      [0.25, -0.2],
      [0.265, -0.1],
      [0.27, 0],
      [0.265, 0.1],
      [0.25, 0.2],
      [0.235, 0.28],
      [0.2, 0.28],
      [0.2, 0.25],
      [0, 0.25],
    ];
    b.lathe(lo, {
      at: P([lx, cy, lz]),
      axis: [0, 0, 1],
      segments: 10,
      color: woodPaint(P([lx, cy, lz]), "z", WOOD_RED, 10),
      bone: root,
    });
    for (const a of [-0.2, 0.2]) {
      const r = 0.27 - 0.5 * a * a;
      b.lathe(
        [
          [r - 0.02, -0.035],
          [r + 0.022, -0.035],
          [r + 0.022, 0.035],
          [r - 0.02, 0.035],
        ],
        { at: P([lx, cy, lz + a]), axis: [0, 0, 1], segments: 10, color: ironPaint, bone: root },
      );
      for (let k = 0; k < 10; k++) {
        const t = Math.PI / 10 + (k * 2 * Math.PI) / 10;
        const rr = (r + 0.022) * 0.951 + 0.004;
        const q = P([lx + rr * Math.cos(t), cy + rr * Math.sin(t), lz + a]);
        rivets.push(new THREE.BoxGeometry(0.022, 0.028, 0.028).rotateZ(t).translate(q[0], q[1], q[2]));
      }
    }
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), "#1b1510", {
      bone: root,
      at: P([lx + 0.07, cy + 0.06, lz + 0.255]),
      rotation: [90, 0, 0],
    });
    for (const s of [1, -1]) {
      tbox([0.36, 0.12, 0.1], PLANK_D, [lx, 0.06, lz + s * 0.2]);
      tbox([0.1, 0.04, 0.12], PLANK_D, [lx + 0.12, 0.14, lz + s * 0.2], [0, 0, -20]);
      tbox([0.1, 0.04, 0.12], PLANK_D, [lx - 0.12, 0.14, lz + s * 0.2], [0, 0, 20]);
    }
  }

  // ---------------------------------------------------------------- torches
  const embers: THREE.BufferGeometry[] = [];
  const torch = (x: number, z: number, phase: number) => {
    b.rod(P([x, 0.3, z]), P([x, 1.0, z]), 0.035, { color: ironPaint, sides: 6, smooth: false, bone: root });
    for (let i = 0; i < 3; i++) {
      const a = phase + (i * 2 * Math.PI) / 3;
      const s = Math.sin(a);
      const c = Math.cos(a);
      b.rod(P([x + 0.02 * s, 0.42, z + 0.02 * c]), P([x + 0.3 * s, 0.03, z + 0.3 * c]), 0.028, {
        color: ironPaint,
        sides: 4,
        smooth: false,
        bone: root,
      });
      cbox([0.11, 0.04, 0.11], "#343845", [x + 0.3 * s, 0.02, z + 0.3 * c], [0, (a * 180) / Math.PI, 0]);
    }
    cbox([0.1, 0.07, 0.1], "#343845", [x, 0.4, z]);
    cbox([0.09, 0.05, 0.09], "#4b5061", [x, 0.62, z]);
    cbox([0.12, 0.04, 0.12], "#343845", [x, 1.0, z]);
    stud(x, 0.4, z + 0.05, 0, 0.022);
    stud(x, 0.4, z - 0.05, Math.PI, 0.022);
    const y0 = 1.0;
    b.lathe(
      [
        [0, 0.02],
        [0.06, 0.02],
        [0.1, 0.06],
        [0.17, 0.17],
        [0.15, 0.17],
        [0.08, 0.09],
        [0, 0.09],
      ],
      { at: P([x, y0, z]), segments: 8, color: ironPaint, bone: root },
    );
    for (let i = 0; i < 8; i++) {
      const a = phase + (i * 2 * Math.PI) / 8 + Math.PI / 8;
      b.rod(
        P([x + 0.1 * Math.sin(a), y0 + 0.08, z + 0.1 * Math.cos(a)]),
        P([x + 0.19 * Math.sin(a), y0 + 0.3, z + 0.19 * Math.cos(a)]),
        0.014,
        { color: ironPaint, sides: 4, smooth: false, bone: root },
      );
    }
    for (const [h, r] of [
      [0.13, 0.125],
      [0.29, 0.19],
    ] as [number, number][]) {
      b.lathe(
        [
          [r - 0.012, y0 + h - 0.022],
          [r + 0.022, y0 + h - 0.022],
          [r + 0.022, y0 + h + 0.022],
          [r - 0.012, y0 + h + 0.022],
        ],
        { at: P([0 + x, 0, z]), segments: 8, color: ironPaint, bone: root },
      );
      ringStuds(x, y0 + h, z, (r + 0.022) * 0.924 + 0.004, 8, Math.PI / 8, 0.024);
    }
    glow(b.part(new THREE.BoxGeometry(0.16, 0.06, 0.16), "#ff8a1c", { bone: root, at: P([x, y0 + 0.11, z]) }), 1.3);
    glow(
      b.cards([frame(P([x, y0 + 0.1, z]), [0, 1, 0])], FLAME, {
        size: [0.36, 0.55],
        cross: true,
        flow: [0, 0, 1],
        sink: 0,
        name: "flame",
      }),
      1.2,
    );
    for (const [dx, dy, dz, s] of [
      [0.05, 0.72, 0.03, 0.022],
      [-0.07, 0.86, -0.02, 0.018],
      [0.02, 0.98, -0.05, 0.016],
      [-0.03, 0.78, 0.07, 0.014],
    ]) {
      const q = P([x + dx, y0 + dy, z + dz]);
      embers.push(new THREE.BoxGeometry(s, s, s).translate(q[0], q[1], q[2]));
    }
  };
  torch(-0.7, -0.95, 0.4);
  torch(1.2, -0.95, 1.1);
  glow(b.part(mergeGeometries(embers)!, "#ffcf4a", { bone: root, at: [0, 0, 0] }), 1.4);

  // ---------------------------------------------------------------- spike trap
  {
    const tx = 1.0;
    const tz = 0.35;
    tbox([0.82, 0.08, 0.82], STONE_T, [tx, 0.04, tz]);
    for (const s of [1, -1]) {
      tbox([1.0, 0.12, 0.09], STONE_B, [tx, 0.06, tz + s * 0.455]);
      tbox([0.09, 0.12, 0.82], STONE_B, [tx + s * 0.455, 0.06, tz]);
      for (const t of [1, -1]) {
        tbox([0.14, 0.17, 0.14], STONE_B, [tx + s * 0.46, 0.085, tz + t * 0.46]);
        cbox([0.06, 0.02, 0.06], "#6a7083", [tx + s * 0.46, 0.18, tz + t * 0.46]);
      }
    }
    cbox([0.2, 0.004, 0.16], BLOOD, [tx + 0.12, 0.082, tz - 0.12]);
    cbox([0.12, 0.004, 0.1], BLOOD, [tx - 0.3, 0.082, tz + 0.2]);
    for (let ix = -1; ix <= 1; ix++)
      for (let iz = -1; iz <= 1; iz++) {
        const x = tx + ix * 0.26;
        const z = tz + iz * 0.26;
        const len = 0.28 + 0.07 * (((ix + 1) * 3 + (iz + 1)) % 3);
        cbox([0.13, 0.03, 0.13], "#4b5061", [x, 0.095, z]);
        b.spike(P([x, 0.11, z]), [0, 1, 0], len, 0.055, {
          sides: 4,
          smooth: false,
          color: spikePaint(F + 0.11, len),
          bone: root,
        });
      }
  }

  // ---------------------------------------------------------------- bones
  {
    const so: [number, number] = [-0.1, 0.95];
    const yaw = 30;
    const sk = (l: V): V => ry(l, yaw, so);
    const rotS: V = [0, yaw, 0];
    tbox([0.15, 0.13, 0.17], BONET, sk([0, 0.065, -0.02]), rotS);
    tbox([0.11, 0.03, 0.12], BONET, sk([0, 0.145, -0.02]), rotS);
    tbox([0.1, 0.07, 0.08], BONET, sk([0, 0.04, 0.075]), rotS);
    tbox([0.14, 0.03, 0.05], BONET, sk([0, 0.07, 0.07]), rotS);
    tbox([0.095, 0.025, 0.085], BONET, sk([0, 0.0125, 0.06]), rotS);
    for (const s of [1, -1]) cbox([0.035, 0.035, 0.02], "#1b1510", sk([s * 0.037, 0.083, 0.097]), rotS);
    cbox([0.02, 0.03, 0.02], "#1b1510", sk([0, 0.04, 0.118]), rotS);
    for (const tx of [-0.03, -0.01, 0.01, 0.03]) cbox([0.018, 0.016, 0.012], "#efe6c8", sk([tx, 0.03, 0.118]), rotS);

    const bone = (o: [number, number], yw: number, len: number) => {
      const rot: V = [0, yw, 0];
      tbox([len, 0.035, 0.035], BONET, ry([0, 0.0225, 0], yw, o), rot);
      for (const e of [1, -1])
        for (const k of [1, -1]) tbox([0.045, 0.045, 0.045], BONET, ry([e * len * 0.5, 0.0225, k * 0.02], yw, o), rot);
    };
    bone([-0.6, 1.0], -40, 0.3);
    bone([0.2, 1.0], 20, 0.26);
    bone([0.2, 0.74], 80, 0.2);

    const rib = (o: [number, number], yw: number) => {
      const pts = ([
        [0, 0.012, 0],
        [0.05, 0.03, 0.015],
        [0.1, 0.03, 0.05],
        [0.12, 0.012, 0.1],
      ] as V[]).map((l) => P(ry(l, yw, o)));
      b.sweep(catmull(pts), 0.012, "#cfc095", { sides: 5, smooth: false, bone: root });
    };
    rib([-0.42, 0.82], 10);
    rib([-0.36, 0.86], 170);
    rib([0.08, 0.88], 60);

    const vert: THREE.BufferGeometry[] = [];
    for (const [x, z] of [
      [-0.3, 1.1],
      [-0.27, 1.14],
      [0.45, 1.05],
      [-0.4, 1.0],
    ]) {
      const q = P([x, 0.01, z]);
      vert.push(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 6).translate(q[0], q[1], q[2]));
    }
    b.part(mergeGeometries(vert)!, "#cfc095", { bone: root, at: [0, 0, 0] });
  }

  // ---------------------------------------------------------------- debris
  {
    const peb: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) {
      const x = -1.45 + 2.9 * R();
      const z = -1.2 + 2.3 * R();
      const s = 0.02 + 0.03 * R();
      const q = P([x, s / 2 - 0.004, z]);
      peb.push(new THREE.BoxGeometry(s, s * 0.7, s * 1.2).rotateY(R() * 3).translate(q[0], q[1], q[2]));
    }
    b.part(mergeGeometries(peb)!, "#4d4942", { bone: root, at: [0, 0, 0] });
  }

  b.part(mergeGeometries(rivets)!, "#8b91a3", { bone: root, at: [0, 0, 0] });

  return b.root;
}
