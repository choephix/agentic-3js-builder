import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng, vec } from "../src/math";
import { catmull } from "../src/path";
import { mottle, scales, stripes } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Crystal Tortoise",
  description:
    "A giant tortoise, about two and a half metres from nose to tail, carrying a geode shell of amethyst and aqua crystal clusters on a jade shell with gold filigree bands, tassels and a glowing crown.",
  style: "Genshin Impact",
  commit: "b816db2",
};

// Palette: a bright jade shell, warm cream plastron and skin, gold trims, violet geode rock and two glowing crystal colours.
const TEAL = "#7fd9c8";
const GOLD = "#ffd66b";
const GOLD_DEEP = "#e0a13c";
const CREAM = "#fbecc0";
const SKIN = "#fbd9a6";
const SKIN_DEEP = "#e8a676";
const CLAW = "#fff4dc";
const BEAK = "#ffc46b";
const BEAK_DEEP = "#d98a3c";
const ROCK = "#b59ce6";
const ROCK_DEEP = "#7660a8";
const AMETHYST = "#b58bff";
const AQUA = "#8ff7ff";
const TASSEL = "#6fe6d4";
const TASSEL_DEEP = "#3aa9b8";

const FILIGREE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#ffe27a" stroke-width="5" stroke-linecap="round">
    <circle cx="50" cy="50" r="42"/>
    <path d="M50 50 C50 36 62 30 68 40 C74 50 62 62 50 58 C38 54 38 38 50 34"/>
    <path d="M50 50 C36 50 30 62 40 68 C50 74 60 66 58 54"/>
    <path d="M12 50 C20 40 30 46 26 56"/>
    <path d="M88 50 C80 40 70 46 74 56"/>
    <path d="M50 8 C40 16 44 26 50 22"/>
    <path d="M50 92 C60 84 56 74 50 78"/>
  </g>
</svg>`,
  { size: 256 },
);

// Shell: jade scutes outlined in gold, with a cream plastron underneath and a gold seam where they meet.
const shellPaint = cel(
  furEdge(
    scales(TEAL, GOLD, { size: 0.14 }),
    inkLines(CREAM, { levels: [-0.55, -0.85], axis: [0, 1, 0], width: 0.05, ink: GOLD_DEEP }),
    { axis: [0, 1, 0], level: -0.22, teeth: 0.1, period: 0.05, ink: GOLD_DEEP },
  ),
);
const skinPaint = cel(mottle(SKIN, "#f4c48f", { size: 0.09 }));
const scalyPaint = cel(scales(SKIN, SKIN_DEEP, { size: 0.06 }));
const tailPaint = cel(stripes(SKIN, SKIN_DEEP, { size: 0.12 }));
const gold = cel(GOLD, GOLD_DEEP);
const clawPaint = cel(CLAW, "#e9c9a0");
const beakPaint = cel(BEAK, BEAK_DEEP);
const rockPaint = cel(mottle(ROCK, ROCK_DEEP, { size: 0.12 }));
const tasselPaint = cel(TASSEL, TASSEL_DEEP);

// [azimuth, elevation, crystal count, size]: crystal clusters on the shell, seen from the shell centre.
const CLUSTERS: [number, number, number, number][] = [
  [0, 88, 12, 1.25],
  [-30, 70, 8, 1.0],
  [30, 70, 8, 1.0],
  [-65, 50, 8, 0.9],
  [65, 50, 8, 0.9],
  [-150, 62, 7, 0.9],
  [150, 62, 7, 0.9],
  [-100, 25, 5, 0.7],
  [100, 25, 5, 0.7],
  [180, 30, 5, 0.6],
];

export default function build() {
  const rnd = rng(31);
  const b = createBuilder({ name: "crystalTortoise", detail: 1.4, paintSize: 2048 });

  // Skeleton: a hips root, a tail back, a spine forward into a neck and head, and four legs.
  const hips = b.joint("hips", { at: [0, 0.6, -0.12], role: "spine" });
  const tail = b.chain("tail", catmull([[0, 0.6, -0.22], [0, 0.56, -0.5], [0, 0.5, -0.8], [0, 0.46, -1.08]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });
  const spine = b.chain("spine", catmull([[0, 0.6, 0], [0, 0.63, 0.25], [0, 0.66, 0.48], [0, 0.74, 0.62]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.74, 0.62], [0, 0.8, 0.74], [0, 0.86, 0.84], [0, 0.9, 0.9]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 0.92, 0.92], aim: [0, 0.95, 1.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.88, 1.02], aim: [0, 0.875, 1.3], role: "jaw" });

  // Shell: a closed loft skinned to the tail, hips and spine, so it moves with the body.
  const shell = b.loft(
    [
      { at: [0, 0.56, -0.8], w: 0.42, h: 0.46 },
      { at: [0, 0.6, -0.5], w: 0.84, h: 0.6 },
      { at: [0, 0.625, -0.15], w: 0.98, h: 0.66 },
      { at: [0, 0.625, 0.2], w: 1.0, h: 0.66 },
      { at: [0, 0.6, 0.5], w: 0.88, h: 0.58 },
      { at: [0, 0.55, 0.74], w: 0.52, h: 0.44 },
    ],
    { bone: [tail, hips, spine], color: shellPaint },
  );
  const shellSkin = b.surface(shell);

  // Gold filigree hoops across the shell, and a gold rim band along its base studded with gold beads.
  for (const z of [-0.6, -0.2, 0.2, 0.55]) {
    b.sweep(shellSkin.loop([0, 0.62, z], { dir: [0, 0, 1], lift: 0.012 }), 0.013, { color: gold });
  }
  const rim = shellSkin.loop([0, 0.36, 0], { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(rim, 0.014, { color: gold });
  b.along(rim, 24, (at) => b.part(new THREE.SphereGeometry(0.018, 6, 4), gold, { at }));

  // Filigree medallions on each flank.
  for (const s of [1, -1]) {
    const hit = shellSkin.around([0, 0.62, 0]).at(s * 90, 4);
    if (hit) b.decal(shellSkin, FILIGREE, { at: hit, dir: [s, 0, 0], size: [0.4, 0.4] });
  }

  // Geode crystal clusters: a violet rock lump sits on the shell, and each cluster grows hex prisms with pointed tips
  // from it, all riding the shell's skin so they move with the body.
  for (const [az, el, n, size] of CLUSTERS) {
    const c = shellSkin.around([0, 0.62, 0]).at(az, el);
    if (!c) continue;
    b.stick(new THREE.SphereGeometry(0.11 * size, 8, 6).scale(1, 0.6, 1), rockPaint, c, { embed: 0.3 });
    b.part(new THREE.TorusGeometry(0.06 * size, 0.012, 4, 10), gold, {
      bone: c.bone,
      at: c.at,
      dir: c.axis,
      axis: "z",
    });
    for (let i = 0; i < n; i++) {
      const h = shellSkin.around([0, 0.62, 0]).at(az + (rnd() - 0.5) * 22, el + (rnd() - 0.5) * 12);
      if (!h) continue;
      const height = size * (0.22 + 0.2 * rnd());
      const r = size * (0.035 + 0.015 * rnd());
      const d = h.axis
        .clone()
        .add(new THREE.Vector3((rnd() - 0.5) * 0.5, 0, (rnd() - 0.5) * 0.5))
        .normalize();
      const color = i % 2 ? AQUA : AMETHYST;
      glow(
        b.part(new THREE.CylinderGeometry(r * 0.72, r, height * 0.55, 6), color, {
          bone: h.bone,
          at: h.at.clone().addScaledVector(d, height * 0.3),
          dir: d,
        }),
      );
      glow(
        b.part(new THREE.ConeGeometry(r * 0.72, height * 0.45, 6), color, {
          bone: h.bone,
          at: h.at.clone().addScaledVector(d, height * 0.8),
          dir: d,
        }),
      );
    }
  }
  // Small aqua sparkles scattered over the shell.
  for (const h of shellSkin.scatter(36, { rng: rng(9), minDist: 0.1, filter: (q) => q.n.y > 0.2 })) {
    glow(b.stick(new THREE.ConeGeometry(0.018, 0.07, 5), AQUA, h, { embed: 0.25 }));
  }

  // Tassels hanging from the shell rim: a teal cord, a gold bead and a fringe.
  const dangle = (x: number, y: number, z: number, len: number) => {
    b.sweep(
      [
        [x, y, z],
        [x, y - len * 0.5, z],
        [x, y - len, z],
      ],
      0.009,
      { color: tasselPaint },
    );
    b.part(new THREE.SphereGeometry(0.022, 8, 6), gold, { at: [x, y - len - 0.02, z] });
    for (const k of [-1, 0, 1]) {
      b.sweep(
        [
          [x, y - len - 0.03, z],
          [x + k * 0.025, y - len - 0.09, z + k * 0.006],
        ],
        0.005,
        { color: tasselPaint },
      );
    }
  };
  for (const s of [1, -1]) {
    for (const [x, z] of [
      [0.5, -0.55],
      [0.42, 0.6],
    ] as const) {
      const p = vec(shellSkin.nearest([s * x, 0.34, z]).at);
      dangle(p.x, p.y, p.z, 0.22);
    }
  }

  // Legs: four stout legs with scale wrinkles, gold ankle bangles, a foot pad and three claws each.
  const legDefs = [
    { id: "F", hip: [0.3, 0.47, 0.3], knee: [0.37, 0.24, 0.33], ankle: [0.34, 0.1, 0.3], toe: [0.34, 0.06, 0.42] },
    { id: "H", hip: [0.3, 0.46, -0.36], knee: [0.37, 0.24, -0.4], ankle: [0.34, 0.1, -0.4], toe: [0.34, 0.06, -0.3] },
  ];
  for (const L of legDefs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const p = (q: number[]) => [s * q[0], q[1], q[2]];
      const leg = b.chain(`leg${L.id}${side}`, catmull([p(L.hip), p(L.knee), p(L.ankle), p(L.toe)]), {
        parent: hips,
        names: [`hip${L.id}${side}`, `knee${L.id}${side}`, `ankle${L.id}${side}`, `foot${L.id}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.1, 0.075, 0.055], { color: scalyPaint });
      const foot = leg.tip!;
      const toe = p(L.toe);
      b.part(new THREE.SphereGeometry(1, 10, 6), scalyPaint, {
        bone: foot,
        at: [toe[0], 0.045, toe[2] - 0.02],
        scale: [0.08, 0.045, 0.1],
      });
      for (const dx of [-0.035, 0, 0.035]) {
        b.part(new THREE.ConeGeometry(0.018, 0.06, 5), clawPaint, {
          bone: foot,
          at: [toe[0] + dx, 0.035, toe[2] + 0.085],
          dir: [0, 0.3, 1],
        });
      }
      const bangle = b.ring(leg.joints[2], { count: 12, radius: 0.085 }).items;
      b.sweep(catmull(bangle, { closed: true }), 0.012, { color: gold });
    }
  }

  // Neck, with a gold collar.
  b.sweep(neck, [0.13, 0.1, 0.095], { color: scalyPaint });
  const collar = b.ring(neck.joints[1], { count: 14, radius: 0.115 }).items;
  b.sweep(catmull(collar, { closed: true }), 0.014, { color: gold });

  // Head: a lofted skull with a hooked upper beak, a lower jaw, anime eyes and a glowing crown.
  const headLoft = b.loft(
    [
      { at: [0, 0.93, 0.84], w: 0.22, h: 0.22 },
      { at: [0, 0.96, 0.98], w: 0.36, h: 0.31 },
      { at: [0, 0.94, 1.1], w: 0.27, h: 0.23 },
      { at: [0, 0.92, 1.2], w: 0.14, h: 0.14 },
    ],
    { bone: head, color: skinPaint },
  );
  const headSkin = b.surface(headLoft);
  b.frustumBox([0, 0.96, 1.07], [0, 0.92, 1.36], [0.16, 0.12], [0.04, 0.035], { bone: head, color: beakPaint });
  b.frustumBox([0, 0.9, 1.0], [0, 0.87, 1.25], [0.12, 0.06], [0.035, 0.03], { bone: jaw, color: beakPaint });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 5, 4), INK, { bone: head, at: [s * 0.018, 0.945, 1.26] });
  }

  const EYE = animeEye({ iris: "#5fd8ff" });
  for (const s of [1, -1]) {
    const hit = headSkin.around([0, 0.96, 0.98]).at(s * 50, 10);
    if (hit) b.decal(headSkin, EYE, { at: hit, size: [0.095, 0.13], mirror: s > 0 });
  }
  const gem = headSkin.around([0, 0.96, 0.98]).at(0, 72);
  if (gem) glow(b.stick(new THREE.SphereGeometry(0.026, 8, 6), AQUA, gem, { embed: 0.35 }));
  for (const s of [1, -1]) {
    const crown = headSkin.around([0, 0.96, 0.98]).at(s * 32, 60);
    if (crown) glow(b.stick(new THREE.ConeGeometry(0.022, 0.07, 6), AMETHYST, crown, { embed: 0.25 }));
  }

  // Tail: a tapering striped tail with a glowing aqua collar and an amethyst crystal tip.
  b.sweep(tail, [0.1, 0.03], { color: tailPaint });
  glow(b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.12, 6), AQUA, { bone: tail.joints[2], at: [0, 0.46, -1.1], dir: [0, 0.1, -1] }));
  glow(b.part(new THREE.ConeGeometry(0.05, 0.2, 6), AMETHYST, { bone: tail.joints[2], at: [0, 0.46, -1.24], dir: [0, 0.12, -1] }));

  return b.root;
}
