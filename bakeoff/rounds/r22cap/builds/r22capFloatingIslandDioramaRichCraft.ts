import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { gradient, grain, mottle, paint, scales, spots, stripes } from "../../../../src/paint";
import { arc, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A Genshin-style floating island: cel-shaded rock underside, grassy top with a glowing rune-gate ruin, broken pillars, a pond feeding a waterfall, blossom and green trees, stone lantern, crystals and small drifting islets.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const TOP = 1.3;

function leafSvg(a: string, b: string): string {
  return `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg"><path d="M16 46 C2 30 4 12 16 2 C28 12 30 30 16 46 Z" fill="${a}"/><path d="M16 46 C10 30 10 14 16 2 C16 14 18 30 16 46 Z" fill="${b}"/><path d="M16 44 L16 8" stroke="${b}" stroke-width="2" fill="none"/></svg>`;
}
const petalSvg = (a: string, b: string): string =>
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 38 C2 26 2 8 10 3 L16 9 L22 3 C30 8 30 26 16 38 Z" fill="${a}"/><path d="M16 36 L16 14" stroke="${b}" stroke-width="2.5" fill="none"/></svg>`;
const BLADES = `<svg viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg"><path d="M4 40 C4 24 6 12 3 2 C10 12 11 26 11 40 Z" fill="#7fe05a"/><path d="M9 40 C10 22 14 10 13 0 C19 10 17 26 16 40 Z" fill="#a6f06a"/><path d="M15 40 C17 28 20 18 22 10 C24 22 21 32 21 40 Z" fill="#5cc85a"/></svg>`;
const PORTAL = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
<circle cx="64" cy="64" r="58" fill="none" stroke="#ffd36a" stroke-width="5"/>
<circle cx="64" cy="64" r="46" fill="none" stroke="#5ff0ff" stroke-width="4"/>
<circle cx="64" cy="64" r="22" fill="none" stroke="#ffd36a" stroke-width="3"/>
<path d="M64 20 L102 86 L26 86 Z" fill="none" stroke="#5ff0ff" stroke-width="3"/>
<path d="M64 108 L26 42 L102 42 Z" fill="none" stroke="#5ff0ff" stroke-width="3"/>
<g stroke="#ffd36a" stroke-width="4" fill="none" stroke-linecap="round">
<path d="M64 6 L64 18"/><path d="M64 110 L64 122"/><path d="M6 64 L18 64"/><path d="M110 64 L122 64"/>
<path d="M23 23 L31 31"/><path d="M105 23 L97 31"/><path d="M23 105 L31 97"/><path d="M105 105 L97 97"/>
</g>
<circle cx="64" cy="64" r="6" fill="#ffffff"/></svg>`;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "floatingIslandDiorama", paintSize: 2048 });
  const R = rng(7);

  // ---------- palette ----------
  const STONE = cel(scales(["#e3dcc6", "#d6cfb8"], "#8f8a78", { size: 0.14, width: 0.012, seed: 3 }));
  const STONE_DK = cel(mottle("#b9b19c", "#a29a88", { size: 0.08, seed: 5 }));
  const ROCK = cel(
    gradient(mottle("#9b8c9e", "#7f7288", { size: 0.22, seed: 2 }), "#4d4663", [0, 1.1, 0], [0, 0.05, 0]),
  );
  const GRASS = cel(mottle("#86e862", "#5cc862", { size: 0.22, seed: 9 }));
  const DIRT = cel(grain("#b07a4a", "#8e5e3a", { size: 0.03 }));
  const TOPPAINT = paint((_p, n) => (n.y > 0.6 ? GRASS : DIRT));
  const BARK = cel(grain("#8a5a3c", "#654029", { size: 0.025, seed: 4 }));
  const WATER = "#47d3f2";
  const GOLD = "#ffcf5a";
  const MOSS = cel("#79d85c");
  const VINE = "#4fb85a";
  const FALL = cel(stripes("#8fe8ff", "#f0feff", { size: 0.06, axis: "z", seed: 3 }));

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string | ReturnType<typeof cel>, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: [0, ry, 0] });
  const ball = (r: number, x: number, y: number, z: number, color: string | ReturnType<typeof cel>, sx = 1, sy = 1, sz = 1) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), color, { at: [x, y, z], scale: [sx, sy, sz] });
  const cyl = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, color: string | ReturnType<typeof cel>) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z] });
  const rock = (r: number, x: number, y: number, z: number, color: string | ReturnType<typeof cel> = STONE_DK) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), color, {
      at: [x, y, z],
      rotation: [R() * 90, R() * 360, R() * 90],
      scale: [1, 0.7, 1.1],
    });

  // ---------- main island ----------
  b.lathe(
    [
      [0, 0],
      [0.14, 0.06],
      [0.4, 0.3],
      [0.62, 0.5],
      [1.0, 0.72],
      [1.3, 0.95],
      [1.42, 1.15],
      [0, 1.15],
    ],
    { at: [0, 0, 0], segments: 10, color: ROCK },
  );
  const top = b.lathe(
    [
      [0, 1.1],
      [1.52, 1.12],
      [1.52, 1.22],
      [1.4, 1.3],
      [0, 1.31],
    ],
    { at: [0, 0, 0], segments: 14, color: TOPPAINT },
  );
  // ring of strata stones on the lip
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const rr = 1.5;
    rock(0.07 + R() * 0.04, Math.cos(a) * rr, 1.13 + R() * 0.03, Math.sin(a) * rr, STONE_DK);
  }
  // stalactites under the rim
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.35;
    const y0 = 0.78 - (i % 3) * 0.08;
    const r0 = 0.95 + (i % 3) * 0.04;
    const sx = Math.cos(a);
    const sz = Math.sin(a);
    b.spike([sx * r0, y0, sz * r0], [-sx * 0.25, -1, -sz * 0.25], 0.38 - (i % 2) * 0.08, 0.1, ROCK, { sides: 6 });
  }
  // glowing strata cracks
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.9;
    const y = 0.55 + (i % 2) * 0.12;
    const rr = 0.62 + (y - 0.5) * 1.8;
    glow(
      b.rod(
        [Math.cos(a) * rr, y, Math.sin(a) * rr],
        [Math.cos(a + 0.15) * (rr - 0.02), y - 0.12, Math.sin(a + 0.15) * (rr - 0.02)],
        0.012,
        "#5ff0ff",
        { sides: 4 },
      ),
    );
  }
  // hanging vines with leaves
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.1;
    if (Math.abs(a - 0) < 0.3 || Math.abs(a - Math.PI * 2) < 0.3) continue;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const path = catmull([
      [c * 1.45, 1.2, s * 1.45],
      [c * 1.44, 1.02, s * 1.44],
      [c * 1.2, 0.8 - (i % 3) * 0.05, s * 1.2],
    ]);
    b.sweep(path, 0.012, VINE, { sides: 4 });
    for (let k = 1; k <= 4; k++) {
      const p = path.at(k / 4.5);
      ball(0.035, p.x + c * 0.02, p.y, p.z + s * 0.02, MOSS, 1.2, 0.5, 1.2);
    }
  }

  // ---------- floating islets ----------
  const islet = (x: number, y: number, z: number, s: number) => {
    b.lathe(
      [
        [0, 0],
        [0.5, 0.45],
        [0.62, 0.58],
        [0.55, 0.66],
        [0, 0.68],
      ],
      { at: [x, y, z], segments: 8, scale: s, color: paint((_p, n) => (n.y > 0.75 ? GRASS : ROCK)) },
    );
  };
  islet(1.85, 0.75, -1.0, 0.36);
  islet(-1.75, 0.6, 0.85, 0.3);
  islet(-0.5, 0.35, 1.7, 0.2);
  glow(b.spike([1.85, 0.75 + 0.25, -1.0], [0.1, 1, 0], 0.22, 0.045, "#7ff6ff", { section: { ngon: 5 } }), 1.2);
  glow(b.spike([-1.75, 0.6 + 0.2, 0.85], [-0.1, 1, 0.05], 0.18, 0.04, "#ffd36a", { section: { ngon: 5 } }), 1.2);
  ball(0.05, -0.5, 0.35 + 0.15, 1.7, MOSS);
  b.rod([1.85, 0.99, -1.0], [1.88, 1.1, -1.0], 0.012, BARK);
  ball(0.09, 1.88, 1.17, -1.0, cel("#ff9cc0"));

  // ---------- pond and river ----------
  cyl(0.4, 0.4, 0.05, 12, 0.45, TOP + 0.01, -0.2, STONE_DK);
  cyl(0.35, 0.35, 0.04, 12, 0.45, TOP + 0.045, -0.2, WATER);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rock(0.06 + R() * 0.03, 0.45 + Math.cos(a) * 0.4, TOP + 0.04, -0.2 + Math.sin(a) * 0.4);
  }
  for (const [px, pz, ps] of [
    [0.3, -0.1, 0.07],
    [0.6, -0.3, 0.06],
    [0.5, -0.05, 0.05],
  ] as const) {
    b.part(new THREE.CylinderGeometry(ps, ps, 0.008, 7), "#4fc06a", { at: [px, TOP + 0.07, pz] });
    ball(0.02, px + 0.01, TOP + 0.085, pz, "#ffc2dc", 1, 0.7, 1);
  }
  const river = catmull([
    [0.8, TOP + 0.02, -0.15],
    [1.05, TOP + 0.02, -0.05],
    [1.3, TOP + 0.0, 0.08],
    [1.55, TOP - 0.04, 0.1],
  ]);
  b.sweep(river, () => [0.1, 0.012], WATER, { section: "box", caps: "flat", up: [0, 1, 0] });
  for (const t of [0.2, 0.45, 0.7]) {
    const p = river.at(t);
    rock(0.05, p.x + 0.03, TOP + 0.03, p.z + 0.12, STONE_DK);
    rock(0.045, p.x - 0.04, TOP + 0.03, p.z - 0.12, STONE_DK);
  }
  // waterfall
  const fallOutline: Array<[number, number]> = [
    [-0.12, 0],
    [0.12, 0],
    [0.09, -0.62],
    [-0.09, -0.62],
  ];
  b.extrude(fallOutline, { at: [1.56, 1.26, 0.1], x: [0, 0, 1], thickness: 0.05, color: FALL });
  glow(b.extrude([[-0.05, 0], [0.05, 0], [0.035, -0.55], [-0.035, -0.55]], { at: [1.6, 1.24, 0.1], x: [0, 0, 1], thickness: 0.02, color: "#d8fbff" }), 0.8);
  b.extrude([[-0.13, 0.0], [0.13, 0.0], [0.1, -0.05], [-0.1, -0.05]], { at: [1.56, 1.27, 0.1], x: [0, 0, 1], thickness: 0.09, color: "#e9fdff" });
  for (const [mx, my, mz, mr] of [
    [1.6, 0.6, 0.1, 0.1],
    [1.52, 0.55, 0.0, 0.07],
    [1.65, 0.52, 0.2, 0.08],
    [1.55, 0.45, 0.12, 0.09],
    [1.7, 0.4, 0.05, 0.06],
    [1.5, 0.35, 0.18, 0.06],
  ] as const)
    ball(mr, mx, my, mz, "#f4feff", 1, 0.8, 1);

  // ---------- ruined gate ----------
  const AX = -0.65;
  const AZ = -0.45;
  const Ro = 0.46;
  const Ri = 0.3;
  const C = 0.5;
  const arch: Array<[number, number]> = [[Ro, 0]];
  for (let a = 0; a <= 180; a += 20) arch.push([Ro * Math.cos((a * Math.PI) / 180), C + Ro * Math.sin((a * Math.PI) / 180)]);
  arch.push([-Ro, 0], [-Ri, 0]);
  for (let a = 180; a >= 0; a -= 20) arch.push([Ri * Math.cos((a * Math.PI) / 180), C + Ri * Math.sin((a * Math.PI) / 180)]);
  arch.push([Ri, 0]);
  b.extrude(arch, { at: [AX, TOP - 0.01, AZ], x: [1, 0, 0], thickness: 0.22, bevel: 0.012, color: STONE });
  // gold trim around inner arch
  b.sweep(arc([AX + Ri, TOP + C, AZ + 0.125], [AX + Ri, TOP + C, AZ + 0.125], [0, 0, 1], 180), 0.014, GOLD, { sides: 6 });
  for (const s of [1, -1]) {
    b.rod([AX + s * (Ri + 0.005), TOP, AZ + 0.125], [AX + s * (Ri + 0.005), TOP + C, AZ + 0.125], 0.014, GOLD, { sides: 6 });
    box(0.5 * 0.5, 0.06, 0.28, AX + s * 0.38, TOP + 0.03, AZ, STONE_DK);
    box(0.17, 0.05, 0.26, AX + s * 0.38, TOP + 0.45, AZ, STONE_DK);
  }
  // keystone and ornaments
  box(0.1, 0.12, 0.26, AX, TOP + C + Ri + 0.04, AZ + 0.01, "#f3ecd6");
  b.part(new THREE.OctahedronGeometry(0.045, 0), GOLD, { at: [AX, TOP + C + Ri + 0.05, AZ + 0.14], scale: [1, 1.4, 0.5] });
  ball(0.04, AX, TOP + C + Ri + 0.15, AZ, GOLD, 1, 1.4, 1);
  for (const s of [1, -1]) {
    b.part(new THREE.OctahedronGeometry(0.035, 0), GOLD, { at: [AX + s * 0.4, TOP + 0.62, AZ + 0.12], scale: [1, 1.5, 0.5] });
  }
  // glowing rune portal
  const portal = svg(PORTAL, { size: 512 });
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.56, 0.56), "#ffffff", {
        at: [AX, TOP + C + 0.04, AZ + s * 0.012],
        dir: [0, 0, s],
        axis: "z",
        texture: portal,
      }),
      1.3,
    );
  }
  // tassels hanging from the arch
  for (const s of [1, -1]) {
    const x = AX + s * 0.4;
    b.rod([x, TOP + 0.6, AZ + 0.12], [x, TOP + 0.44, AZ + 0.12], 0.006, "#ff5a6a", { sides: 4 });
    b.capsule([x, TOP + 0.44, AZ + 0.12], [x, TOP + 0.38, AZ + 0.12], 0.016, "#ff5a6a", { sides: 5 });
    b.rod([x, TOP + 0.37, AZ + 0.12], [x, TOP + 0.3, AZ + 0.12], 0.012, GOLD, { sides: 5 });
  }
  // moss on the arch
  for (const [mx, my, mz] of [
    [-0.25, 0.97, 0.05],
    [0.2, 0.93, 0.05],
    [0.0, 1.05, 0.05],
    [-0.4, 0.4, 0.1],
    [0.4, 0.28, 0.1],
  ] as const)
    ball(0.06, AX + mx, TOP + my + 0.1, AZ + mz, MOSS, 1.5, 0.5, 1);
  // steps
  for (let i = 0; i < 3; i++) box(1.0 - i * 0.1, 0.045, 0.2, AX, TOP + 0.02 + i * 0.045, AZ + 0.4 - i * 0.07, i % 2 ? STONE : STONE_DK);

  // ---------- pillars ----------
  const pillar = (x: number, z: number, h: number, broken: boolean) => {
    const o: Array<[number, number]> = [
      [0, 0],
      [0.12, 0],
      [0.12, 0.05],
      [0.09, 0.07],
      [0.09, h],
    ];
    if (!broken) o.push([0.115, h + 0.03], [0.115, h + 0.07]);
    else o.push([0.08, h + 0.03]);
    o.push([0, h + (broken ? 0.03 : 0.07)]);
    b.lathe(o, { at: [x, TOP - 0.01, z], segments: 8, color: STONE });
    b.rod([x, TOP + 0.08, z], [x, TOP + 0.08 + 0.12, z], 0.095, GOLD, { sides: 8 });
    if (!broken) {
      box(0.3, 0.05, 0.3, x, TOP + h + 0.09, z, STONE_DK);
      ball(0.06, x, TOP + h + 0.14, z, "#7ff6ff", 1, 1, 1);
    } else {
      for (let k = 0; k < 3; k++) b.spike([x + (k - 1) * 0.04, TOP + h, z], [0, 1, 0], 0.07 + k * 0.03, 0.03, STONE, { sides: 4 });
      ball(0.07, x, TOP + h + 0.02, z, MOSS, 1.4, 0.45, 1.4);
    }
  };
  pillar(-1.15, 0.1, 0.55, true);
  pillar(-0.25, 0.3, 0.8, false);
  pillar(-1.1, -0.85, 0.35, true);
  // fallen drums
  for (const [x, z, ry] of [
    [-0.85, 0.65, 20],
    [-0.5, 0.8, 70],
    [-0.62, 0.72, 10],
  ] as const)
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), STONE, { at: [x, TOP + 0.09, z], rotation: [0, ry, 90] });
  // path tiles
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 6), i % 2 ? STONE : STONE_DK, {
      at: [0.1 - t * 0.7 + Math.sin(i * 2) * 0.04, TOP + 0.01, 1.2 - t * 1.0],
      rotation: [0, i * 23, 0],
    });
  }
  // rubble
  for (let i = 0; i < 16; i++) rock(0.03 + R() * 0.04, -1.3 + R() * 1.1, TOP + 0.02, -0.9 + R() * 1.8, i % 3 ? STONE : STONE_DK);

  // ---------- stone lantern ----------
  const LX = 0.05;
  const LZ = 0.75;
  cyl(0.09, 0.11, 0.05, 6, LX, TOP + 0.02, LZ, STONE_DK);
  cyl(0.035, 0.04, 0.26, 6, LX, TOP + 0.17, LZ, STONE);
  cyl(0.09, 0.07, 0.04, 6, LX, TOP + 0.32, LZ, STONE_DK);
  glow(b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), "#ffcf6a", { at: [LX, TOP + 0.39, LZ] }), 1.5);
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.12, 0.04],
      [0.05, 0.1],
      [0, 0.11],
    ],
    { at: [LX, TOP + 0.44, LZ], segments: 6, color: STONE },
  );
  ball(0.025, LX, TOP + 0.57, LZ, GOLD);

  // ---------- crystals ----------
  const crystals = (x: number, z: number, hue: string) => {
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      glow(
        b.spike([x + Math.cos(a) * 0.06, TOP, z + Math.sin(a) * 0.06], [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3], 0.14 + (i % 3) * 0.07, 0.04, hue, { section: { ngon: 5 } }),
        1.2,
      );
    }
    rock(0.07, x, TOP + 0.02, z, STONE_DK);
  };
  crystals(-0.2, 1.05, "#7ff6ff");
  crystals(1.0, -0.8, "#ffd36a");
  crystals(-1.3, -0.4, "#7ff6ff");

  // ---------- trees ----------
  const tree = (x: number, z: number, h: number, lean: number, blobs: Array<[number, number, number, number]>, fill: string, fillDk: string, canopyTop: string, canopyBase: string, petal: boolean) => {
    const trunk = b.sweep(
      catmull([
        [x, TOP - 0.02, z],
        [x + lean * 0.3, TOP + h * 0.45, z + 0.03],
        [x + lean, TOP + h * 0.8, z],
      ]),
      [0.075, 0.03],
      BARK,
      { sides: 6 },
    );
    void trunk;
    // roots
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + 0.4;
      b.spike([x, TOP + 0.08, z], [Math.cos(a), -0.45, Math.sin(a)], 0.16, 0.035, BARK, { sides: 5 });
    }
    const tex = svg(petal ? petalSvg(fill, fillDk) : leafSvg(fill, fillDk), { size: 128 });
    for (const [bx, by, bz, br] of blobs) {
      const cx = x + lean + bx;
      const cy = TOP + h + by;
      const cz = z + bz;
      b.rod([x + lean, TOP + h * 0.75, z], [cx, cy - br * 0.4, cz], 0.02, BARK, { sides: 5 });
      const blob = b.part(new THREE.IcosahedronGeometry(br, 1), cel(mottle(canopyTop, canopyBase, { size: 0.12, seed: 11 })), {
        at: [cx, cy, cz],
        scale: [1.15, 0.8, 1.15],
      });
      const hits = b.surface(blob).scatter(34, { rng: rng(21 + Math.floor(br * 100)), minDist: 0.05 });
      b.cards(hits, tex, { size: [0.1, 0.13], lean: 55, bend: 20, vary: 0.3, rng: rng(5), spin: 40 });
    }
  };
  tree(
    0.15,
    -0.9,
    0.75,
    0.12,
    [
      [0, 0.1, 0, 0.38],
      [-0.3, -0.05, 0.1, 0.28],
      [0.3, -0.02, -0.08, 0.3],
      [0.05, 0.3, 0.05, 0.24],
    ],
    "#ffb0cc",
    "#ff7fa8",
    "#ffc4da",
    "#ff97bb",
    true,
  );
  tree(
    0.95,
    0.7,
    0.5,
    -0.06,
    [
      [0, 0.1, 0, 0.3],
      [0.22, -0.04, 0.08, 0.2],
      [-0.2, -0.02, -0.06, 0.2],
    ],
    "#7be05a",
    "#3ea550",
    "#7be05f",
    "#3fb55a",
    false,
  );
  tree(
    -1.1,
    -0.35,
    0.35,
    0.05,
    [
      [0, 0.05, 0, 0.22],
      [0.12, -0.04, 0.05, 0.14],
    ],
    "#9af06a",
    "#4fb858",
    "#9af06a",
    "#58c05a",
    false,
  );

  // ---------- grass tufts, flowers, mushrooms ----------
  const blades = svg(BLADES, { size: 128 });
  const gh = b.surface(top).scatter(110, { rng: rng(33), minDist: 0.1, filter: (h) => h.n.y > 0.8 });
  b.cards(gh, blades, { size: [0.08, 0.09], cross: true, vary: 0.35, rng: rng(6), spin: 180 });
  const FLOWERS = ["#ffffff", "#ffd36a", "#ff9cc0", "#b9a0ff"];
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.3 + R() * 1.0;
    const fx = Math.cos(a) * rr;
    const fz = Math.sin(a) * rr;
    if (Math.hypot(fx - 0.45, fz + 0.2) < 0.5) continue;
    if (Math.hypot(fx - AX, fz - AZ) < 0.6) continue;
    b.rod([fx, TOP, fz], [fx, TOP + 0.1, fz], 0.007, "#4fb85a", { sides: 4 });
    ball(0.032, fx, TOP + 0.11, fz, FLOWERS[i % 4], 1, 0.6, 1);
    ball(0.014, fx, TOP + 0.125, fz, "#ffcf3a");
  }
  for (const [mx, mz] of [
    [0.45, -1.0],
    [0.35, -0.95],
    [0.75, 0.55],
  ] as const) {
    cyl(0.015, 0.02, 0.07, 6, mx, TOP + 0.035, mz, "#f6ecd6");
    b.part(new THREE.SphereGeometry(0.05, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), spots("#ff6a6a", "#ffffff", { size: 0.025, amount: 0.5 }), { at: [mx, TOP + 0.065, mz] });
  }

  return b.root;
}
