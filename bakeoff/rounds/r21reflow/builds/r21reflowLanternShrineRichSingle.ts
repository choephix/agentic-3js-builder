import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import type { LatheOptions } from "../../../../src/outline";
import { cells, grain, noise, paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wayside Lantern Shrine",
  description:
    "A roadside hokora shrine under a red torii: shimenawa rope and paper streamers, glowing paper and stone lanterns, an offering table with persimmons, rice, incense and flowers, a maple tree, mossy rocks and a flagstone plinth.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const G = 0.18; // top of the flagstone plinth
const GOLD = "#e8b94a";
const GOLDD = "#b98a2e";
const CREAM = "#f4efe6";

// cel-shaded paints
const RED_V = cel(grain("#d2402e", "#b8301f", { size: 0.035, axis: "y", seed: 3 }));
const RED_H = cel(grain("#d2402e", "#b8301f", { size: 0.035, axis: "x", seed: 4 }));
const BLACK = cel("#2b2a30");
const POST = paint((p) => (p.y < 0.7 ? BLACK : p.y < 0.76 ? GOLD : RED_V));
const WOOD = cel(grain("#b07a45", "#8f5e33", { size: 0.03, axis: "y", seed: 8 }));
const WOOD_D = cel("#6e4a2c");
const WOOD_L = cel(grain("#c89a5e", "#a97a45", { size: 0.025, axis: "y", seed: 9 }));
const STONE = cel(
  paint((p, n) => {
    const m = noise(p, 0.35, 4);
    if (n.y > 0.4 && m > 0.58) return "#6f9446";
    return m < 0.4 ? "#8c8b86" : "#a7a59c";
  }),
);
const PAVE = cel(
  paint((p, n) => {
    const c = cells(p, 0.7, 3);
    if (n.y > 0.5 && c.d2 - c.d1 < 0.05) return "#6b6a66";
    const m = noise(p, 0.4, 6);
    if (n.y > 0.4 && m > 0.6) return "#6f9446";
    return c.id > 0.5 ? "#a5a39a" : "#98968e";
  }),
);
const ROOF = cel(
  paint((p) => {
    const c = cells(p, 0.12, 9);
    if (c.d2 - c.d1 < 0.03) return "#1f3d38";
    return noise(p, 0.3, 3) > 0.55 ? "#3a6a5a" : "#2e5a4b";
  }),
);
const ROPE = paint((_p, _n, s) => ((((s[1] - 900 * s[0]) % 90) + 90) % 90 < 42 ? "#e3c88a" : "#a98750"));
const CLOTH = paint((_p, _n, s) => {
  const e = Math.min(s[0], 1 - s[0], s[1], 1 - s[1]);
  return e < 0.07 ? "#d9703a" : "#f1e6cf";
});

function emblem(petal: string, heart: string) {
  const petals = [0, 90, 180, 270]
    .map(
      (a) =>
        `<g transform="rotate(${a} 32 32)"><path d="M32 30 C18 24 20 6 32 3 C44 6 46 24 32 30Z" fill="${petal}"/><path d="M32 26 C26 20 27 12 32 9 C37 12 38 20 32 26Z" fill="${heart}"/></g>`,
    )
    .join("");
  return svg(`<svg viewBox="0 0 64 64">${petals}<circle cx="32" cy="32" r="5" fill="${heart}"/></svg>`, { size: 128 });
}

export default function build() {
  const b = createBuilder({ name: "lanternShrine" });
  const R = rng(11);
  const root = b.joint("root", { at: [0, 0, 0] });

  const EMB_O = emblem("#e8643a", "#fff0c8");
  const EMB_G = emblem(GOLD, "#2b2a30");
  const EMB_C = emblem("#d9703a", "#f6d98a");
  const WIN = svg(
    `<svg viewBox="0 0 48 52"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff2b0"/><stop offset="1" stop-color="#ffb347"/></radialGradient></defs><rect width="48" height="52" fill="url(#g)"/><g transform="translate(8 10) scale(0.5)">${[0, 90, 180, 270]
      .map((a) => `<g transform="rotate(${a} 32 32)"><path d="M32 30 C18 24 20 6 32 3 C44 6 46 24 32 30Z" fill="#e8643a"/></g>`)
      .join("")}</g><rect x="1" y="1" width="46" height="50" fill="none" stroke="#7a4a1c" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 30 L16 22 L6 24 L10 16 L2 12 L11 10 L9 2 L16 8 L23 2 L21 10 L30 12 L22 16 L26 24 L16 22Z" fill="#d8402a"/></svg>`,
    { size: 64 },
  );
  const LEAF2 = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 30 L16 22 L6 24 L10 16 L2 12 L11 10 L9 2 L16 8 L23 2 L21 10 L30 12 L22 16 L26 24 L16 22Z" fill="#ee8a2e"/></svg>`,
    { size: 64 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 48 C14 30 8 14 4 2 C14 12 18 28 16 48Z" fill="#4f8f3a"/><path d="M16 48 C18 28 24 14 30 4 C24 22 22 36 16 48Z" fill="#6aa844"/><path d="M16 48 C15 34 15 22 16 8 C18 24 18 36 16 48Z" fill="#3f7a30"/></svg>`,
    { size: 96 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 32 32">${[0, 72, 144, 216, 288]
      .map((a) => `<ellipse cx="16" cy="8" rx="5" ry="8" fill="#fbf6ee" transform="rotate(${a} 16 16)"/>`)
      .join("")}<circle cx="16" cy="16" r="3.5" fill="#f0902a"/></svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: Fill, at: number[], o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: root, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: Fill, at: number[], o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: root, at, ...o });
  const ball = (r: number, c: Fill, at: number[], scale: number | number[] = 1, o: PartOptions = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone: root, at, scale, ...o });
  const turn = (pts: OutlinePoint[], c: Fill, at: number[], o: Partial<LatheOptions> = {}) =>
    b.lathe(pts, { at, bone: root, color: c, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], o: PartOptions = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: root, at, dir, axis: "z", texture: tex, ...o });

  const TASSEL: [number, number][] = [
    [0, 0],
    [0.025, 0],
    [0.025, -0.03],
    [0.012, -0.04],
    [0.016, -0.055],
    [0.045, -0.085],
    [0.05, -0.2],
    [0.035, -0.225],
    [0, -0.225],
  ];
  const tassel = (x: number, y: number, z: number, k: number, c: Fill, o: Partial<LatheOptions> = {}) =>
    b.lathe(
      TASSEL.map(([r, h]) => [r * k, h * k] as [number, number]),
      { at: [x, y, z], color: c, bone: root, segments: 6, ...o },
    );
  const shide = (x: number, y: number, z: number) => {
    const L: [number, number][] = [];
    const Rr: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const cx = (i % 2) * 0.05;
      L.push([cx - 0.035, -i * 0.07]);
      Rr.push([cx + 0.035, -i * 0.07]);
    }
    const outline: OutlinePoint[] = [...L, ...Rr.reverse()];
    b.extrude(outline, { at: [x, y, z], x: [1, 0, 0], thickness: 0.006, color: CREAM, bone: root });
  };

  // ---------- plinth ----------
  box(4.6, G, 3.6, PAVE, [0, G / 2, 0]);
  for (let i = 0; i < 9; i++) {
    const x = -2.2 + i * 0.55;
    box(0.5 + R() * 0.06, 0.14 + R() * 0.1, 0.32, STONE, [x, 0.1, 1.82], { rotation: [0, (R() - 0.5) * 12, 0] });
  }
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const z = -1.5 + i * 0.6;
      box(0.32, 0.14 + R() * 0.1, 0.5 + R() * 0.08, STONE, [s * 2.3, 0.1, z], { rotation: [0, (R() - 0.5) * 12, 0] });
    }
  for (let i = 0; i < 9; i++) {
    const x = -2.2 + i * 0.55;
    box(0.5 + R() * 0.06, 0.14 + R() * 0.12, 0.3, STONE, [x, 0.1, -1.82], { rotation: [0, (R() - 0.5) * 12, 0] });
  }
  // stepping stones leading up to the torii
  for (let i = 0; i < 4; i++)
    box(0.55, 0.02, 0.36, STONE, [(R() - 0.5) * 0.2, G + 0.01, 1.55 - i * 0.18 * 2.2], { rotation: [0, (R() - 0.5) * 14, 0] });

  // ---------- shrine steps and platform ----------
  box(1.9, 0.14, 0.5, STONE, [0, G + 0.07, -0.05]);
  box(1.7, 0.28, 0.5, STONE, [0, G + 0.14, -0.4]);
  box(1.4, 0.42, 0.9, STONE, [0, G + 0.21, -0.95]);
  const PT = G + 0.42;
  const cz = -0.95;

  // ---------- shrine (hokora) ----------
  box(0.96, 0.66, 0.64, WOOD_D, [0, PT + 0.33, cz]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.08, 0.72, 0.08, WOOD, [sx * 0.5, PT + 0.36, cz + sz * 0.34]);
  box(1.04, 0.06, 0.07, RED_H, [0, PT + 0.62, cz + 0.34]);
  box(1.04, 0.05, 0.07, WOOD, [0, PT + 0.03, cz + 0.34]);
  box(0.07, 0.06, 0.72, RED_V, [0.5, PT + 0.62, cz]);
  box(0.07, 0.06, 0.72, RED_V, [-0.5, PT + 0.62, cz]);
  for (const sx of [1, -1]) {
    box(0.3, 0.5, 0.03, WOOD_L, [sx * 0.17, PT + 0.32, cz + 0.335]);
    for (const dx of [-0.07, 0.07]) box(0.012, 0.5, 0.012, WOOD_D, [sx * 0.17 + dx, PT + 0.32, cz + 0.355]);
    for (const dy of [-0.15, 0, 0.15]) box(0.3, 0.012, 0.012, WOOD_D, [sx * 0.17, PT + 0.32 + dy, cz + 0.355]);
    box(0.02, 0.06, 0.02, GOLD, [sx * 0.03, PT + 0.32, cz + 0.36]);
  }
  plane(0.2, 0.2, EMB_G, [0, PT + 0.46, cz + 0.362], [0, 0, 1]);
  const roofY = PT + 0.7;
  const ROOFP: OutlinePoint[] = [
    [0, 0],
    [0.95, 0],
    [0.95, 0.03],
    [0.7, 0.14],
    [0.35, 0.36],
    [0, 0.56],
  ];
  turn(ROOFP, ROOF, [0, roofY, cz], { segments: 4, spin: 45 });
  const prof: [number, number][] = [
    [0.95, 0.03],
    [0.7, 0.14],
    [0.35, 0.36],
    [0, 0.56],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.sweep(
        catmull(prof.map(([r, h]) => [sx * r * 0.7071, roofY + h + 0.012, cz + sz * r * 0.7071])),
        0.014,
        { color: GOLD, bone: root },
      );
      box(0.09, 0.07, 0.09, GOLD, [sx * 0.68, roofY + 0.05, cz + sz * 0.68], { rotation: [0, 45, 0] });
    }
  turn(
    [
      [0, 0],
      [0.03, 0],
      [0.025, 0.04],
      [0.045, 0.08],
      [0.02, 0.15],
      [0, 0.18],
    ],
    GOLD,
    [0, roofY + 0.55, cz],
    { segments: 6 },
  );
  plane(0.2, 0.2, EMB_G, [0, roofY + 0.2, cz + 0.5], [0, 0.75, 0.665]);
  b.sweep(
    catmull([
      [-0.52, PT + 0.56, cz + 0.4],
      [-0.25, PT + 0.5, cz + 0.42],
      [0.25, PT + 0.5, cz + 0.42],
      [0.52, PT + 0.56, cz + 0.4],
    ]),
    0.02,
    { color: ROPE, bone: root },
  );
  tassel(0, PT + 0.5, cz + 0.42, 0.9, GOLD);
  for (const sx of [-0.2, 0.2]) shide(sx, PT + 0.5, cz + 0.43);

  // ---------- torii ----------
  const TZ = 1.0;
  for (const s of [1, -1]) {
    const x = s * 1.1;
    cyl(0.25, 0.27, 0.1, 8, STONE, [x, G + 0.04, TZ]);
    b.part(new THREE.CylinderGeometry(0.14, 0.17, 2.77, 10), POST, { bone: root, at: [x, G - 0.02 + 1.385, TZ] });
    cyl(0.155, 0.155, 0.04, 10, GOLD, [x, 2.84, TZ]);
    cyl(0.18, 0.18, 0.03, 10, GOLDD, [x, G + 0.62, TZ]);
    box(0.06, 0.3, 0.16, "#8a2a1c", [s * 1.29, 2.5, TZ]);
    box(0.06, 0.3, 0.16, "#8a2a1c", [s * 0.91, 2.5, TZ]);
  }
  box(3.6, 0.16, 0.13, RED_H, [0, 2.5, TZ]);
  for (const s of [1, -1]) box(0.03, 0.18, 0.15, GOLD, [s * 1.8, 2.5, TZ]);
  box(0.2, 0.3, 0.12, RED_V, [0, 2.73, TZ]);
  const kPath = catmull([-2.15, -1.1, 0, 1.1, 2.15].map((x) => [x, 2.96 + 0.18 * (x / 2.15) ** 2, TZ]));
  b.sweep(kPath, () => [0.17, 0.08] as const, { section: "box", caps: "flat", color: RED_H, up: [0, 1, 0], bone: root });
  b.sweep(kPath, () => [0.2, 0.045] as const, {
    section: "box",
    caps: "flat",
    color: BLACK,
    up: [0, 1, 0],
    shift: [0, 0.115],
    bone: root,
  });
  for (const s of [1, -1]) box(0.05, 0.28, 0.4, GOLD, [s * 2.17, 3.2, TZ], { rotation: [0, 0, -s * 18] });
  plane(0.22, 0.22, EMB_G, [0, 2.96, TZ + 0.174], [0, 0, 1]);

  // shimenawa rope with tassels and shide
  const ropeY = (x: number) => 2.12 + 0.28 * (x / 1.1) ** 2;
  b.sweep(
    catmull([-1.15, -0.6, 0, 0.6, 1.15].map((x) => [x, ropeY(x) + 0.02, TZ + 0.14])),
    0.045,
    { color: ROPE, bone: root },
  );
  tassel(0, ropeY(0) - 0.01, TZ + 0.14, 1.6, GOLD);
  for (const x of [-0.7, 0.7]) tassel(x, ropeY(x) - 0.02, TZ + 0.14, 1.0, GOLD);
  for (const x of [-0.35, 0.35]) shide(x, ropeY(x) - 0.03, TZ + 0.16);

  // hanging paper lanterns
  for (const s of [1, -1]) {
    const lj = b.joint(s > 0 ? "lanternL" : "lanternR", {
      parent: root,
      at: [s * 1.45, 2.42, TZ],
      dir: [0, -1, 0],
      role: "hinge",
    });
    const x = s * 1.45;
    const o = { bone: lj };
    b.rod([x, 2.42, TZ], [x, 2.33, TZ], 0.012, GOLDD, o);
    b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 8), GOLDD, { bone: lj, at: [x, 2.4, TZ], rotation: [0, 90, 0] });
    turn(
      [
        [0, 0],
        [0.12, 0],
        [0.14, 0.03],
        [0.1, 0.07],
        [0.04, 0.09],
        [0, 0.09],
      ],
      BLACK,
      [x, 2.24, TZ],
      { segments: 10, bone: lj },
    );
    glow(
      turn(
        [
          [0, 0],
          [0.13, 0],
          [0.17, 0.07],
          [0.19, 0.2],
          [0.17, 0.33],
          [0.13, 0.4],
          [0, 0.4],
        ],
        "#ffe6a8",
        [x, 1.84, TZ],
        { segments: 10, bone: lj },
      ),
      1.2,
    );
    for (const [h, r] of [
      [0.1, 0.178],
      [0.2, 0.19],
      [0.3, 0.18],
    ])
      cyl(r + 0.006, r + 0.006, 0.012, 10, "#c9a86a", [x, 1.84 + h, TZ], { bone: lj });
    turn(
      [
        [0, 0],
        [0.1, 0],
        [0.13, 0.02],
        [0.14, 0.04],
        [0, 0.04],
      ],
      BLACK,
      [x, 1.8, TZ],
      { segments: 10, bone: lj },
    );
    for (const f of [1, -1])
      glow(plane(0.2, 0.2, EMB_O, [x, 2.04, TZ + f * 0.2], [0, 0, f], { bone: lj }), 1.2);
    ball(0.02, GOLD, [x, 1.79, TZ], 1, { bone: lj });
    tassel(x, 1.78, TZ, 1.1, "#c8382a", { bone: lj });
    b.part(new THREE.TorusGeometry(0.025, 0.007, 4, 8), "#c8382a", { bone: lj, at: [x, 1.76, TZ], rotation: [0, 90, 0] });
  }

  // ---------- stone lanterns ----------
  const stoneLantern = (x: number, z: number) => {
    box(0.52, 0.12, 0.52, STONE, [x, G + 0.06, z]);
    cyl(0.09, 0.11, 0.5, 8, STONE, [x, G + 0.37, z]);
    turn(
      [
        [0, 0],
        [0.18, 0],
        [0.21, 0.03],
        [0.21, 0.07],
        [0.18, 0.1],
        [0, 0.1],
      ],
      STONE,
      [x, G + 0.62, z],
      { segments: 8 },
    );
    box(0.34, 0.03, 0.34, STONE, [x, G + 0.735, z]);
    box(0.34, 0.03, 0.34, STONE, [x, G + 1.005, z]);
    box(0.26, 0.26, 0.26, "#3a2a1c", [x, G + 0.87, z]);
    for (const d of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ])
      glow(plane(0.17, 0.19, WIN, [x + d[0] * 0.14, G + 0.87, z + d[1] * 0.14], [d[0], 0, d[1]]), 1.4);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.05, 0.3, 0.05, STONE, [x + sx * 0.15, G + 0.87, z + sz * 0.15]);
    turn(
      [
        [0, 0],
        [0.42, 0],
        [0.42, 0.025],
        [0.3, 0.07],
        [0.12, 0.19],
        [0, 0.22],
      ],
      STONE,
      [x, G + 1.02, z],
      { segments: 4, spin: 45 },
    );
    turn(
      [
        [0, 0],
        [0.05, 0],
        [0.04, 0.04],
        [0.06, 0.08],
        [0.03, 0.14],
        [0, 0.17],
      ],
      STONE,
      [x, G + 1.24, z],
      { segments: 8 },
    );
  };
  stoneLantern(1.9, 0.55);
  stoneLantern(-1.9, 0.55);

  // ---------- offering table ----------
  const T0 = G + 0.5;
  const TCz = 0.55;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.06, 0.44, 0.06, RED_V, [sx * 0.5, G + 0.22, TCz + sz * 0.21]);
      box(0.05, 0.05, 0.05, GOLD, [sx * 0.5, G + 0.03, TCz + sz * 0.21]);
      box(0.08, 0.04, 0.08, GOLD, [sx * 0.55, T0 - 0.01, TCz + sz * 0.25]);
    }
  box(1.14, 0.06, 0.54, RED_H, [0, G + 0.47, TCz]);
  box(1.0, 0.05, 0.03, RED_H, [0, G + 0.39, TCz + 0.21]);
  box(1.0, 0.05, 0.03, RED_H, [0, G + 0.39, TCz - 0.21]);
  box(0.46, 0.012, 0.54, CLOTH, [0, T0 + 0.006, TCz]);
  box(0.46, 0.24, 0.012, CLOTH, [0, G + 0.38, TCz + 0.276]);
  plane(0.14, 0.14, EMB_C, [0, G + 0.4, TCz + 0.285], [0, 0, 1]);
  for (const x of [-0.2, 0.2]) tassel(x, G + 0.26, TCz + 0.28, 0.6, GOLD);
  // persimmons on a plate
  turn(
    [
      [0, 0],
      [0.09, 0],
      [0.13, 0.03],
      [0.12, 0.035],
      [0.08, 0.015],
      [0, 0.015],
    ],
    "#f2eee6",
    [-0.42, T0, TCz + 0.05],
    { segments: 10 },
  );
  for (const [dx, dy, dz] of [
    [-0.04, 0.06, 0],
    [0.04, 0.06, 0.01],
    [0, 0.1, -0.03],
  ])
    ball(0.045, "#f08a2a", [-0.42 + dx, T0 + dy, TCz + 0.05 + dz], [1, 0.85, 1]);
  // vase and flowers
  const vz = TCz - 0.05;
  turn(
    [
      [0, 0],
      [0.05, 0],
      [0.06, 0.06],
      [0.045, 0.12],
      [0.03, 0.16],
      [0.04, 0.18],
      [0, 0.17],
    ],
    "#2f5f6b",
    [-0.24, T0, vz],
    { segments: 8 },
  );
  const tips: [number, number, number][] = [
    [-0.06, 0.4, 0.02],
    [0.05, 0.46, -0.02],
    [0.11, 0.33, 0.03],
    [-0.11, 0.3, -0.03],
    [0, 0.54, 0.01],
  ];
  for (const [dx, dy, dz] of tips) {
    b.rod([-0.24, T0 + 0.17, vz], [-0.24 + dx, T0 + dy, vz + dz], 0.004, "#4f8f3a", { bone: root });
    b.cards([frame([-0.24 + dx, T0 + dy - 0.03, vz + dz], [dx, 1, 0])], FLOWER, {
      size: 0.1,
      cross: true,
      lean: 0,
      sink: 0,
      bone: root,
    });
  }
  b.cards(
    [frame([-0.24, T0 + 0.17, vz], [-0.5, 1, 0]), frame([-0.24, T0 + 0.17, vz], [0.5, 1, 0.3]), frame([-0.24, T0 + 0.17, vz], [0, 1, -0.6])],
    GRASS,
    { size: [0.08, 0.2], lean: 25, cross: true, bone: root },
  );
  // rice sanbo
  box(0.14, 0.07, 0.14, WOOD_L, [0.05, T0 + 0.012 + 0.035, TCz]);
  box(0.2, 0.03, 0.2, WOOD_L, [0.05, T0 + 0.012 + 0.085, TCz]);
  box(0.2, 0.05, 0.012, WOOD, [0.05, T0 + 0.012 + 0.12, TCz + 0.1]);
  box(0.2, 0.05, 0.012, WOOD, [0.05, T0 + 0.012 + 0.12, TCz - 0.1]);
  box(0.012, 0.05, 0.2, WOOD, [-0.05, T0 + 0.012 + 0.12, TCz]);
  box(0.012, 0.05, 0.2, WOOD, [0.15, T0 + 0.012 + 0.12, TCz]);
  ball(0.085, "#fbf7ee", [0.05, T0 + 0.012 + 0.11, TCz], [1, 0.8, 1]);
  // incense burner
  turn(
    [
      [0, 0],
      [0.05, 0],
      [0.08, 0.03],
      [0.085, 0.07],
      [0.07, 0.08],
      [0.06, 0.07],
      [0, 0.06],
    ],
    INK,
    [0.42, T0, TCz],
    { segments: 8 },
  );
  for (const [dx, dz] of [
    [-0.02, 0],
    [0.01, 0.015],
    [0.025, -0.01],
  ]) {
    b.rod([0.42 + dx, T0 + 0.06, TCz + dz], [0.42 + dx * 2, T0 + 0.24, TCz + dz * 2], 0.004, "#b5472f", { bone: root });
    glow(ball(0.007, "#ff7a2a", [0.42 + dx * 2, T0 + 0.245, TCz + dz * 2], 1), 1.5);
  }
  b.sweep(
    catmull([
      [0.44, T0 + 0.26, TCz],
      [0.47, T0 + 0.4, TCz + 0.02],
      [0.43, T0 + 0.55, TCz - 0.02],
      [0.47, T0 + 0.7, TCz + 0.01],
    ]),
    [0.012, 0.003],
    { color: "#f3efe9", bone: root },
  );

  // ---------- maple tree ----------
  b.sweep(
    catmull([
      [-1.8, G - 0.02, -0.5],
      [-1.78, 0.7, -0.5],
      [-1.6, 1.3, -0.45],
      [-1.55, 1.8, -0.4],
    ]),
    [0.07, 0.03],
    { color: cel("#5a3a2a"), bone: root },
  );
  const branches: number[][][] = [
    [
      [-1.75, 0.8, -0.5],
      [-1.3, 1.4, -0.6],
    ],
    [
      [-1.65, 1.3, -0.45],
      [-2.0, 1.8, -0.5],
    ],
    [
      [-1.6, 1.6, -0.42],
      [-1.3, 2.0, -0.3],
    ],
  ];
  for (const [a, c] of branches) b.rod(a, c, [0.03, 0.012], "#5a3a2a", { bone: root });
  const crowns = [
    [-1.55, 1.9, -0.4],
    [-1.3, 1.45, -0.6],
    [-2.0, 1.85, -0.5],
    [-1.3, 2.05, -0.3],
    [-1.8, 1.4, -0.5],
    [-1.5, 1.6, -0.3],
  ];
  const leafFrames = crowns.flatMap((c) =>
    Array.from({ length: 16 }, () => {
      const d = [R() - 0.5, R() - 0.4, R() - 0.5];
      return frame([c[0] + d[0] * 0.6, c[1] + d[1] * 0.5, c[2] + d[2] * 0.6], d);
    }),
  );
  b.cards(leafFrames, [LEAF, LEAF2, LEAF], { size: 0.24, vary: 0.3, rng: R, spin: 180, lean: 50, bend: 20, bone: root });

  // ---------- rocks, moss, plants ----------
  const rocks: [number, number, number, number[]][] = [
    [1.7, G + 0.1, 1.3, [0.6, 0.45, 0.5]],
    [2.05, G + 0.15, 0.9, [0.4, 0.5, 0.35]],
    [-2.0, G + 0.1, -1.1, [0.5, 0.4, 0.45]],
    [-1.5, G + 0.05, 1.35, [0.3, 0.2, 0.25]],
    [1.2, G + 0.2, -1.5, [0.5, 0.5, 0.4]],
  ];
  for (const [x, y, z, sc] of rocks)
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: root,
      at: [x, y, z],
      scale: sc,
      rotation: [R() * 20, R() * 360, R() * 20],
      flat: true,
    });
  for (const [x, z, r] of [
    [1.7, 1.1, 0.4],
    [-1.9, -0.9, 0.35],
    [1.0, 1.55, 0.3],
    [-0.9, 1.5, 0.3],
    [0.9, -1.45, 0.35],
    [-0.6, 0.1, 0.25],
  ]) {
    cyl(r, r, 0.025, 7, "#6f9446", [x, G + 0.012, z]);
    cyl(r * 0.55, r * 0.55, 0.035, 6, "#86ad4f", [x + 0.05, G + 0.015, z - 0.03]);
  }
  const tuft = (x: number, z: number, n: number, size: number) =>
    b.cards(
      Array.from({ length: n }, () => frame([x + (R() - 0.5) * 0.25, G, z + (R() - 0.5) * 0.25], [0, 1, 0])),
      GRASS,
      {
        size: [size * 0.6, size],
        lean: 35,
        bend: 25,
        vary: 0.3,
        rng: R,
        spin: 180,
        sink: 0.05,
        flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
        bone: root,
      },
    );
  tuft(1.55, 1.05, 9, 0.28);
  tuft(-1.5, 1.25, 8, 0.25);
  tuft(1.9, -0.5, 9, 0.3);
  tuft(-0.9, -1.3, 8, 0.3);
  tuft(0.95, -1.3, 7, 0.26);
  tuft(-2.0, -0.3, 8, 0.28);
  tuft(1.25, 0.35, 5, 0.2);
  tuft(-1.35, 0.4, 5, 0.2);
  for (const [x, z] of [
    [-1.45, 1.15],
    [1.6, 0.95],
    [1.95, -0.45],
    [-0.9, -1.25],
  ]) {
    for (let i = 0; i < 3; i++) {
      const fx = x + (R() - 0.5) * 0.3;
      const fz = z + (R() - 0.5) * 0.3;
      b.rod([fx, G, fz], [fx, G + 0.16, fz], 0.004, "#4f8f3a", { bone: root });
      b.cards([frame([fx, G + 0.15, fz], [0, 1, 0])], FLOWER, { size: 0.08, cross: true, sink: 0, bone: root });
    }
  }
  b.cards(
    Array.from({ length: 26 }, () => frame([(R() - 0.5) * 4.2, G + 0.004, (R() - 0.5) * 3.2], [0, 1, 0])),
    [LEAF, LEAF2],
    {
      size: 0.13,
      lean: 90,
      mirror: true,
      sink: 0,
      rng: R,
      flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
      bone: root,
    },
  );

  return b.root;
}
