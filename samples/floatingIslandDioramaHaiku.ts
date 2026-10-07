import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { grain, mottle, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { cel, furEdge, inkLines, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A cel-shaded sky island over a cloud sea: a ruined pillared shrine around a floating hydro crystal, glowing lanterns and vines on its arch, a waterfall pouring off the front lip, green and blossom trees, and two smaller floating islets.",
  style: "Genshin Impact",
  commit: "b816db2",
};

type V = [number, number, number];
const P = (x: number, y: number, z: number): V => [x, y, z];
const DEG = Math.PI / 180;

const TOP = 1.08; // grass plateau height
const SHRINE_X = -0.25; // centre of the ruined shrine
const SHRINE_Z = -0.2;
const PILLAR_R = 0.44;

// Palette: cel paints for every solid; flat colours for the self-lit water, crystal and lanterns (glow needs flat or textured parts).
const ROCK = cel(stripes("#f7dfae", "#e3b98a", { size: 0.14, axis: "y", width: 0.5, wobble: 0.4, seed: 5 }), "#b98ab0");
const GRASS = cel(mottle("#aaf26f", "#6fd670", { size: 0.14, seed: 3 }), "#3fae80");
const BODY = furEdge(GRASS, inkLines(ROCK, { levels: [-0.6], axis: [0, 1, 0], width: 0.05 }), {
  axis: [0, 1, 0],
  by: "normal",
  level: 0.42,
  teeth: 0.22,
  period: 0.07,
  ink: INK,
});
const RUIN = cel(mottle("#fff4de", "#f0d8b6", { size: 0.22, seed: 9 }), "#c9a0c6");
const GOLD = cel("#ffe27a", "#dd9a44");
const TRUNK = cel(grain("#d8985f", "#a66a4c", { size: 0.03, axis: "y", seed: 2 }), "#7d5180");
const CANOPY = cel(mottle("#8cec70", "#d9fa9a", { size: 0.13, seed: 6 }), "#3aa87a");
const BLOSSOM = cel(mottle("#ffc7e4", "#fff2f9", { size: 0.1, seed: 8 }), "#e48fc6");
const BUSH = cel(mottle("#6fdc6a", "#b8f282", { size: 0.09, seed: 12 }), "#3aa57a");
const CLOUD = cel("#ffffff", "#d6e4ff");
const WATER = "#8ef2ff";
const FOAM = "#f4feff";
const CRYSTAL = "#9ff6ff";
const CRYSTAL_CORE = "#eaffff";
const LANTERN = "#ffdc8c";

// Rock profile of a floating island, in units of its radius: top at 0, underside tapering to a point at -0.48.
const ROCK_PROFILE = [
  [0, 0],
  [0.8, 0],
  [0.95, -0.05],
  [1, -0.16],
  [0.92, -0.3],
  [0.76, -0.38],
  [0.5, -0.44],
  [0.25, -0.47],
  [0, -0.48],
];
const STALAC = [
  [0, 0],
  [0.24, 0],
  [0.2, -0.16],
  [0.13, -0.36],
  [0.05, -0.5],
  [0, -0.54],
];

export default function build() {
  const b = createBuilder({ name: "floatingIslandDioramaHaiku" });
  const root = b.joint("island", { at: P(0, 0, 0) });
  const islet1 = b.joint("islet1", { parent: root, at: P(0.92, 1.62, -0.5) });
  const islet2 = b.joint("islet2", { parent: root, at: P(-0.85, 1.95, 0.35) });
  const yC = TOP + 0.85; // crystal height
  const crystal = b.joint("crystal", { parent: root, at: P(SHRINE_X, yC, SHRINE_Z) });

  // ---- textures (SVG drawings on cards and decals)
  const leaf = (fill: string, vein: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48"><path d="M16 2C30 14 31 34 16 46C1 34 2 14 16 2Z" fill="${fill}"/><path d="M16 7V42" stroke="${vein}" stroke-width="2" fill="none"/></svg>`,
      { size: 128 },
    );
  const flower = (petal: string, centre: string) => {
    const dots = [0, 1, 2, 3, 4]
      .map((i) => {
        const a = (i * 72 * Math.PI) / 180;
        return `<circle cx="${(16 + 8 * Math.sin(a)).toFixed(2)}" cy="${(16 - 8 * Math.cos(a)).toFixed(2)}" r="6" fill="${petal}"/>`;
      })
      .join("");
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${dots}<circle cx="16" cy="16" r="4" fill="${centre}"/></svg>`,
      { size: 128 },
    );
  };
  const LEAF_G = leaf("#7fe06a", "#3f9f6a");
  const LEAF_L = leaf("#c6f47e", "#6fbf5a");
  const LEAF_P = leaf("#ffb8dc", "#e27fb4");
  const BLADE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48"><path d="M1 48Q5 22 7 0Q10 24 15 48Z" fill="#94ea66"/><path d="M4 46Q7 22 8 6" stroke="#4fb065" stroke-width="1.2" fill="none"/></svg>`,
    { size: 128 },
  );
  const VINE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64"><path d="M8 0Q5 32 8 64" stroke="#3f9f5a" stroke-width="1.6" fill="none"/><ellipse cx="4.5" cy="12" rx="4" ry="2" fill="#86e46a" transform="rotate(-35 4.5 12)"/><ellipse cx="11.5" cy="24" rx="4" ry="2" fill="#9cf07a" transform="rotate(35 11.5 24)"/><ellipse cx="4.5" cy="38" rx="4" ry="2" fill="#86e46a" transform="rotate(-35 4.5 38)"/><ellipse cx="11.5" cy="52" rx="4" ry="2" fill="#9cf07a" transform="rotate(35 11.5 52)"/></svg>`,
    { size: 256 },
  );
  const FLOWERS = [flower("#fffdf5", "#ffc93c"), flower("#ffa9d6", "#fff06a"), flower("#ffe16a", "#ff9a3c")];
  const FILI = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M2 32C10 12 22 12 28 32S46 52 62 32" fill="none" stroke="#e39a3c" stroke-width="3"/><path d="M32 2C12 10 12 22 32 28S52 46 32 62" fill="none" stroke="#ffd65a" stroke-width="2.6"/><circle cx="28" cy="32" r="3.5" fill="#fff0b0"/><circle cx="36" cy="32" r="3.5" fill="#fff0b0"/></svg>`,
    { size: 256 },
  );
  const RUNE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#7ff6ff" stroke-width="2.6"/><circle cx="32" cy="32" r="20" fill="none" stroke="#7ff6ff" stroke-width="1.6"/><path d="M32 5V14M32 50V59M5 32H14M50 32H59" stroke="#7ff6ff" stroke-width="2.6"/><path d="M26 26H38L32 38Z" fill="none" stroke="#d6feff" stroke-width="1.6"/></svg>`,
    { size: 256 },
  );
  const TASSEL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48"><path d="M3 0L4 40M6.5 0L6.5 40M10 0L9 40M13 0L12 40" stroke="#e8474f" stroke-width="2" fill="none"/><rect x="4" y="40" width="8" height="8" rx="2" fill="#ffd65a"/></svg>`,
    { size: 128 },
  );

  // ---- shapes
  const circle = (cx: number, y: number, cz: number, r: number, n = 14) =>
    catmull(
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return P(cx + r * Math.sin(a), y, cz + r * Math.cos(a));
      }),
      { closed: true },
    );

  const rock = (at: V, r: number, segments: number, bone?: typeof root) =>
    b.lathe(
      ROCK_PROFILE.map(([x, y]) => [x * r, y * r]),
      { at, color: BODY, segments, smoothing: 1, bone },
    );

  const stalactite = (x: number, y: number, z: number, s: number, bone?: typeof root) =>
    b.lathe(
      STALAC.map(([x2, y2]) => [x2 * s, y2 * s]),
      { at: P(x, y, z), color: ROCK, segments: 6, bone },
    );

  const tree = (
    bx: number,
    by: number,
    bz: number,
    h: number,
    lean: number,
    crownR: number,
    crown: typeof CANOPY,
    leaves: THREE.Texture[],
    count: number,
    seed: number,
  ) => {
    const branch = P(bx + lean * 0.55, by + h * 0.72, bz + lean * 0.2);
    const top = P(bx + lean, by + h, bz + lean * 0.35);
    b.sweep(catmull([P(bx, by - 0.04, bz), P(bx + 0.015, by + h * 0.4, bz + 0.01), branch, top]), [0.075, 0.04], {
      color: TRUNK,
    });
    b.rod(branch, P(top[0] - 0.3 * crownR, top[1] - 0.06, top[2] + 0.1), [0.03, 0.012], { color: TRUNK });
    b.rod(branch, P(top[0] + 0.28 * crownR, top[1] + 0.02, top[2] - 0.2), [0.03, 0.012], { color: TRUNK });
    const crowns = [
      [0, 0.1, 0, 1],
      [-0.62, -0.18, 0.18, 0.72],
      [0.6, -0.12, -0.12, 0.7],
      [0.1, 0.42, -0.36, 0.66],
    ].map(([dx, dy, dz, k]) =>
      b.part(new THREE.SphereGeometry(crownR * k, b.segments(10), b.segments(7)), crown, {
        at: P(top[0] + dx * crownR, top[1] + dy * crownR, top[2] + dz * crownR),
      }),
    );
    b.cards(b.surface(crowns).scatter(count, { rng: rng(seed), minDist: 0.055, filter: (h) => h.n.y > -0.3 }), leaves, {
      size: [0.1, 0.13],
      lean: 35,
      bend: 15,
      vary: 0.25,
      rng: rng(seed + 1),
    });
  };

  const pillar = (deg: number, H: number, broken: boolean, mark: "rune" | "fili" | null) => {
    const s = Math.sin(deg * DEG);
    const c = Math.cos(deg * DEG);
    const px = SHRINE_X + PILLAR_R * s;
    const pz = SHRINE_Z + PILLAR_R * c;
    const shaft = broken
      ? [
          [0, 0],
          [0.11, 0],
          [0.11, 0.05],
          [0.085, 0.07],
          [0.075, 0.09],
          [0.072, H - 0.2],
          [0.085, H - 0.16],
          [0.08, H - 0.08],
          [0.05, H - 0.02],
          [0.03, H + 0.02],
          [0, H - 0.04],
        ]
      : [
          [0, 0],
          [0.11, 0],
          [0.11, 0.05],
          [0.085, 0.07],
          [0.075, 0.09],
          [0.072, H - 0.14],
          [0.095, H - 0.12],
          [0.095, H - 0.07],
          [0.08, H - 0.05],
          [0.08, H],
          [0, H],
        ];
    const column = b.lathe(shaft, { at: P(px, TOP, pz), color: RUIN, segments: 8 });
    b.part(new THREE.BoxGeometry(0.3, 0.06, 0.3), RUIN, { at: P(px, TOP + 0.03, pz), flat: true });
    if (broken) {
      b.part(new THREE.BoxGeometry(0.16, 0.09, 0.14), RUIN, {
        at: P(px + 0.2 * s, TOP + 0.045, pz + 0.2 * c),
        rotation: [0, deg, 14],
        flat: true,
      });
    } else {
      b.part(new THREE.BoxGeometry(0.24, 0.07, 0.24), RUIN, { at: P(px, TOP + H - 0.02, pz), flat: true });
      b.part(new THREE.BoxGeometry(0.26, 0.025, 0.26), GOLD, { at: P(px, TOP + H + 0.015, pz), flat: true });
      b.sweep(circle(px, TOP + 0.13, pz, 0.08), 0.011, { color: GOLD });
      b.sweep(circle(px, TOP + H - 0.13, pz, 0.09), 0.011, { color: GOLD });
    }
    if (mark === "rune") {
      glow(
        b.decal(column, RUNE, {
          at: P(px + 0.09 * s, TOP + H * 0.5, pz + 0.09 * c),
          dir: P(s, 0, c),
          size: [0.12, 0.12],
        }),
        1.0,
      );
    } else if (mark === "fili") {
      b.decal(column, FILI, {
        at: P(px + 0.085 * s, TOP + H * 0.45, pz + 0.085 * c),
        dir: P(s, 0, c),
        size: [0.13, 0.26],
      });
    }
  };

  // ---- the island body: grass top, striped rock underside, zig-zag grass edge
  const body = rock(P(0, TOP, 0), 1.2, 12);
  for (const [x, y, z, s] of [
    [0.55, 0.78, -0.45, 1.0],
    [-0.7, 0.8, 0.3, 0.85],
    [0.25, 0.8, 0.85, 0.6],
    [-0.2, 0.84, -0.9, 0.7],
  ]) {
    stalactite(x, y, z, s);
  }

  // hanging grass over the rim, skipping the waterfall
  const rimFrames = [];
  for (let i = 0; i < 33; i++) {
    const a = i * 11 * DEG;
    const x = 1.15 * Math.sin(a);
    const z = 1.15 * Math.cos(a);
    if (z > 0.4 && Math.abs(x - 0.3) < 0.35) continue;
    rimFrames.push(frame(P(x, TOP - 0.12, z), P(Math.sin(a) * 0.9, -1, Math.cos(a) * 0.9)));
  }
  b.cards(rimFrames, BLADE, { size: [0.05, 0.16], lean: 0, bend: 20, vary: 0.25, rng: rng(61) });

  // ---- river on the grass and the waterfall off the front lip
  const river = b.sweep(
    catmull([
      P(0.5, TOP, -0.85),
      P(0.6, TOP, -0.5),
      P(0.7, TOP, -0.2),
      P(0.5, TOP, 0.12),
      P(0.44, TOP, 0.5),
      P(0.4, TOP, 0.82),
      P(0.3, TOP, 1.1),
    ]),
    (t: number): [number, number] => [0.085 - 0.03 * t, 0.012],
    { color: WATER },
  );
  glow(river, 0.6);

  const fall = b.extrude(
    [
      [-0.1, 1.02],
      [0.1, 1.02],
      [0.13, 0.9],
      [0.16, 0.7],
      [0.18, 0.5],
      [0.2, 0.32],
      [0.14, 0.24],
      [0.06, 0.3],
      [0, 0.2],
      [-0.06, 0.28],
      [-0.14, 0.24],
      [-0.2, 0.34],
      [-0.18, 0.52],
      [-0.16, 0.72],
      [-0.13, 0.9],
    ],
    { at: P(0.3, 0, 1.13), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: WATER },
  );
  glow(fall, 0.8);
  for (const [x, top, bottom] of [
    [0.22, 0.96, 0.42],
    [0.31, 0.98, 0.36],
    [0.38, 0.94, 0.46],
  ]) {
    glow(b.rod(P(x, top, 1.165), P(x + 0.01, bottom, 1.165), [0.011, 0.006], { color: FOAM }), 1.0);
  }
  for (const [x, z, r] of [
    [0.3, 1.22, 0.16],
    [0.16, 1.2, 0.12],
    [0.44, 1.22, 0.12],
  ]) {
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(6)), FOAM, {
      at: P(x, r * 0.55, z),
      scale: [1.4, 0.55, 1.2],
    });
  }

  // ---- ruined shrine: platform, pillars, arch with lanterns and vines, fallen column, altar, floating crystal
  const platform = b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.6, 0.03],
      [0.58, 0.07],
      [0.5, 0.08],
      [0, 0.08],
    ],
    { at: P(SHRINE_X, TOP - 0.01, SHRINE_Z), color: RUIN, segments: 12, smoothing: 1 },
  );
  b.sweep(circle(SHRINE_X, TOP + 0.075, SHRINE_Z, 0.5), 0.011, { color: GOLD });
  glow(
    b.decal(platform, RUNE, {
      at: P(SHRINE_X, TOP + 0.07, SHRINE_Z),
      dir: P(0, 1, 0),
      up: P(0, 0, 1),
      size: [0.9, 0.9],
    }),
    0.9,
  );
  b.part(new THREE.BoxGeometry(0.4, 0.03, 0.14), RUIN, { at: P(SHRINE_X, TOP + 0.015, SHRINE_Z + 0.8), flat: true });
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.14), RUIN, { at: P(SHRINE_X, TOP + 0.045, SHRINE_Z + 0.66), flat: true });

  pillar(0, 1.25, false, "rune");
  pillar(60, 1.25, false, "fili");
  pillar(120, 0.7, true, null);
  pillar(180, 1.1, false, "fili");
  pillar(240, 0.55, true, null);

  // arch over the two tall pillars at 0 and 60 degrees, gold keystone at the apex
  const A = P(SHRINE_X, TOP + 1.25, SHRINE_Z + PILLAR_R);
  const Bp = P(SHRINE_X + PILLAR_R * Math.sin(60 * DEG), TOP + 1.25, SHRINE_Z + PILLAR_R * Math.cos(60 * DEG));
  const M = P((A[0] + Bp[0]) / 2, TOP + 1.25, (A[2] + Bp[2]) / 2);
  const u = [A[0] - M[0], 0, A[2] - M[2]];
  const archR = Math.hypot(u[0], u[2]);
  const archAt = (th: number, k = 1): V =>
    P(M[0] + u[0] * Math.cos(th) * k, TOP + 1.25 + archR * Math.sin(th) * k, M[2] + u[2] * Math.cos(th) * k);
  const arch = catmull(Array.from({ length: 11 }, (_, k) => archAt((k / 10) * Math.PI)));
  b.sweep(arch, 0.05, { color: RUIN });
  b.sweep(arch.slice(0.36, 0.64), 0.056, { color: GOLD });

  // vines hanging from the underside of the arch
  const archVines = [];
  for (let k = 2; k <= 8; k++) {
    archVines.push(frame(archAt((k / 10) * Math.PI, 0.9), P(0, -1, 0)));
  }
  b.cards(archVines, VINE, { size: [0.05, 0.22], lean: 0, bend: 8, vary: 0.2, rng: rng(71) });

  // two glowing lanterns on gold chains from the arch
  for (const th of [0.25 * Math.PI, 0.75 * Math.PI]) {
    const anchor = archAt(th);
    const lx = anchor[0];
    const lz = anchor[2];
    const ly = anchor[1] - 0.44;
    b.rod(anchor, P(lx, ly + 0.22, lz), 0.007, { color: GOLD });
    glow(
      b.lathe(
        [
          [0, 0],
          [0.07, 0],
          [0.095, 0.05],
          [0.085, 0.13],
          [0.055, 0.2],
          [0, 0.22],
        ],
        { at: P(lx, ly, lz), color: LANTERN, segments: 7 },
      ),
      1.2,
    );
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.03, 7), GOLD, { at: P(lx, ly + 0.23, lz), flat: true });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 7), GOLD, { at: P(lx, ly - 0.01, lz), flat: true });
  }

  // fallen column lying on the grass
  b.rod(P(-0.62, TOP + 0.095, 0.1), P(-0.42, TOP + 0.095, 0.5), [0.1, 0.1], { section: { ngon: 8 }, color: RUIN });
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.2), RUIN, { at: P(-0.4, TOP + 0.09, 0.56), rotation: [0, 30, 0], flat: true });

  const altar = b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.22, 0.04],
      [0.18, 0.06],
      [0.18, 0.12],
      [0.13, 0.14],
      [0.13, 0.18],
      [0, 0.18],
    ],
    { at: P(SHRINE_X, TOP + 0.07, SHRINE_Z), color: RUIN, segments: 8 },
  );
  glow(b.decal(altar, RUNE, { at: P(SHRINE_X, TOP + 0.13, SHRINE_Z + 0.19), dir: P(0, 0, 1), size: [0.1, 0.1] }), 1.0);
  b.decal(altar, FILI, { at: P(SHRINE_X + 0.2, TOP + 0.12, SHRINE_Z), dir: P(1, 0, 0), size: [0.09, 0.1] });
  b.decal(altar, FILI, { at: P(SHRINE_X - 0.2, TOP + 0.12, SHRINE_Z), dir: P(-1, 0, 0), size: [0.09, 0.1] });

  // rubble
  [
    [-0.52, -0.5, 1],
    [-0.44, -0.66, 0.7],
    [0.02, -0.58, 0.9],
    [0.2, -0.3, 0.6],
    [-0.8, -0.2, 0.8],
    [-0.45, 0.42, 0.6],
    [0.25, 0.25, 0.5],
  ].forEach(([x, z, s], i) => {
    b.part(new THREE.DodecahedronGeometry(0.055 * s, 0), RUIN, {
      at: P(x, TOP + 0.045 * s, z),
      rotation: [(i * 37) % 90, (i * 53) % 90, (i * 29) % 90],
      flat: true,
    });
  });

  // floating crystal: a flat hydro gem with a gold halo, tassels and motes
  const gem = b.part(new THREE.OctahedronGeometry(0.15, 0).scale(0.75, 1.7, 0.75), CRYSTAL, {
    bone: crystal,
    at: P(SHRINE_X, yC, SHRINE_Z),
    flat: true,
    name: "crystal",
  });
  glow(gem, 1.3);
  for (const [dx, dy, dz] of [
    [0.3, 0.08, 0],
    [-0.2, 0.22, 0.15],
    [0, -0.16, -0.28],
  ]) {
    glow(
      b.part(new THREE.SphereGeometry(0.03, 6, 4), CRYSTAL_CORE, {
        bone: crystal,
        at: P(SHRINE_X + dx, yC + dy, SHRINE_Z + dz),
        flat: true,
      }),
      1.0,
    );
  }
  b.sweep(circle(SHRINE_X, yC, SHRINE_Z, 0.24), 0.011, { color: GOLD, bone: crystal });
  b.sweep(
    catmull(
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return P(SHRINE_X + 0.27 * Math.cos(a), yC + 0.27 * Math.sin(a), SHRINE_Z);
      }),
      { closed: true },
    ),
    0.008,
    { color: GOLD, bone: crystal },
  );
  const tassels = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return frame(P(SHRINE_X + 0.24 * Math.sin(a), yC - 0.02, SHRINE_Z + 0.24 * Math.cos(a)), P(0, 1, 0));
  });
  b.cards(tassels, TASSEL, { size: [0.03, 0.13], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: rng(21) });

  // ---- trees
  tree(-0.72, TOP, -0.5, 1.0, -0.1, 0.36, CANOPY, [LEAF_G, LEAF_L], 170, 61);
  tree(0.7, TOP, 0.22, 0.85, 0.1, 0.34, BLOSSOM, [LEAF_P], 150, 71);
  tree(-0.9, TOP, 0.5, 0.5, 0.05, 0.22, CANOPY, [LEAF_L], 60, 81);
  tree(0.2, TOP, -1.0, 0.6, -0.08, 0.26, BLOSSOM, [LEAF_P], 80, 91);

  // bushes
  for (const [x, z, r] of [
    [-0.42, 0.92, 0.15],
    [0.92, -0.4, 0.13],
    [-0.62, -0.95, 0.12],
  ]) {
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(7)), BUSH, {
      at: P(x, TOP + r * 0.6, z),
      scale: [1.1, 0.8, 1.1],
    });
  }

  // grass blades and flowers scattered over the meadow
  b.cards(
    b.surface(body).scatter(330, {
      rng: rng(41),
      minDist: 0.035,
      filter: (h) =>
        h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) < 1.05 && Math.hypot(h.at.x - SHRINE_X, h.at.z - SHRINE_Z) > 0.62,
    }),
    BLADE,
    { size: [0.05, 0.11], lean: 12, bend: 10, vary: 0.35, rng: rng(42) },
  );
  b.cards(
    b.surface(body).scatter(90, {
      rng: rng(51),
      minDist: 0.05,
      filter: (h) =>
        h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) < 1.05 && Math.hypot(h.at.x - SHRINE_X, h.at.z - SHRINE_Z) > 0.62,
    }),
    FLOWERS,
    { size: 0.06, rng: rng(52) },
  );

  // ---- floating islets
  const islandRock1 = rock(P(0.92, 1.62, -0.5), 0.3, 8, islet1);
  stalactite(0.92, 1.52, -0.5, 0.45, islet1);
  b.part(new THREE.SphereGeometry(0.13, b.segments(10), b.segments(7)), BUSH, {
    at: P(0.92, 1.62 + 0.09, -0.5),
    bone: islet1,
    scale: [1.1, 0.8, 1.1],
  });
  const islandRock2 = rock(P(-0.85, 1.95, 0.35), 0.24, 8, islet2);
  stalactite(-0.85, 1.88, 0.35, 0.38, islet2);
  tree(-0.85, 1.95, 0.35, 0.4, 0.04, 0.2, BLOSSOM, [LEAF_P], 40, 101);
  b.cards(b.surface(islandRock1).scatter(22, { rng: rng(111), minDist: 0.05, filter: (h) => h.n.y > 0.6 }), BLADE, {
    size: [0.04, 0.09],
    lean: 12,
    rng: rng(112),
  });
  b.cards(b.surface(islandRock2).scatter(16, { rng: rng(113), minDist: 0.05, filter: (h) => h.n.y > 0.6 }), BLADE, {
    size: [0.04, 0.09],
    lean: 12,
    rng: rng(114),
  });

  // glowing hydro motes drifting round the island
  for (const [x, y, z, r] of [
    [1.25, 1.3, 0.4, 0.03],
    [-1.2, 1.1, -0.5, 0.025],
    [0.2, 1.45, 1.25, 0.03],
    [-0.4, 2.05, -1.2, 0.022],
    [1.05, 0.9, 0.95, 0.025],
    [-1.15, 1.55, -0.9, 0.03],
  ]) {
    glow(b.part(new THREE.SphereGeometry(r, 6, 4), CRYSTAL_CORE, { at: P(x, y, z), flat: true }), 1.2);
  }

  // ---- cloud sea at the floor: flattened puffs that touch y = 0, plus a layer under the island
  const cr = rng(31);
  for (let i = 0; i < 30; i++) {
    const a = cr() * Math.PI * 2;
    const d = 0.2 + Math.sqrt(cr()) * 0.68;
    const s = 0.24 + cr() * 0.1;
    b.part(new THREE.SphereGeometry(s, b.segments(12), b.segments(7)), CLOUD, {
      at: P(d * Math.cos(a), s * 0.45, d * Math.sin(a)),
      scale: [1.25, 0.45, 1.15],
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const d = 0.9 + (i % 2) * 0.15;
    b.part(new THREE.SphereGeometry(0.15, b.segments(10), b.segments(6)), CLOUD, {
      at: P(d * Math.cos(a), 0.3, d * Math.sin(a)),
      scale: [1.3, 0.6, 1.3],
    });
  }

  return b.root;
}
