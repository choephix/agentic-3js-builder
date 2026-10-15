import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/builder";
import { createBuilder } from "../../../../src/builder";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { mottle, paint, spots } from "../../../../src/paint";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A giant kraken rising from the sea on a tripod of arching tentacles, two arms raised high. Overwatch-style polished sci-fi monster: indigo hide, crisp white armor plating with rivets and panel rings, cyan glowing suckers, runes and eyes as the single accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const FIN: OutlinePoint[] = [
  [0, -0.2],
  [1.0, -0.1],
  [1.9, 0.6, "sharp"],
  [1.3, 1.4],
  [0.5, 1.6],
  [0, 1.1],
];

export default function build() {
  const b = createBuilder({ name: "kraken" });

  // Palette: indigo hide, white armor, one cyan accent.
  const CYAN = "#35e8ff";
  const DARKTRIM = "#1b1f52";
  const STUD = "#cfd8ee";
  const SUCK = "#ffe3cc";
  const FOAM = "#eafcff";
  const SKIN = cel(spots("#3b49b0", ["#6f82ff", "#2b2f88"], { size: 0.4, amount: 0.4, seed: 4 }));
  const BELLY = cel("#ffd9bc");
  const ARMOR = cel("#e6ebf6", "#a6b2d8");
  const BEAK = cel("#4a4f86");
  const WEB = cel("#8e9cf2");
  const WATER = cel(mottle("#1d7fb4", "#2aa6c4", { size: 0.9, seed: 2 }));
  const FINP = cel(
    paint((_p, _n, s) => {
      const ang = Math.atan2(s[1] + 0.3, s[0] + 0.3);
      return Math.abs((ang * 6) % 1) < 0.16 ? "#3fd0ff" : "#2b3496";
    }),
  );

  // Skeleton
  const core = b.joint("core", { at: [0, 1.7, 0.2] });
  b.joint("jaw", { parent: core, at: [0, 1.62, 0.95], aim: [0, 1.4, 1.4], role: "jaw" });
  const jawJoint = "jaw";

  const stem = b.chain(
    "stem",
    catmull([
      [0, 1.7, 0.2],
      [0, 0.9, 0.25],
      [0, 0.1, 0.3],
    ]),
    { parent: core, names: ["stemA", "stemB"] },
  );
  const stemSw = b.sweep(stem, (t) => 0.8 + 0.2 * t, { color: SKIN });

  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 2.1, 0],
      [0, 2.8, -0.5],
      [0, 3.6, -1.1],
      [0, 4.4, -1.9],
    ]),
    { parent: core, names: ["mantleA", "mantleB", "mantleC"], role: "spine" },
  );
  const mantleSw = b.sweep(mantle, [0.95, 1.05, 0.95, 0.55, 0.1], { color: SKIN });

  // Head, helmet, eyes, brows
  const H = [0, 2.0, 0.3];
  const head = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN, {
    bone: core,
    at: H,
    scale: [1.05, 0.85, 1.0],
    name: "head",
  });
  b.part(new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.16), ARMOR, {
    bone: core,
    at: H,
    dir: [0, 0.894, 0.447],
    scale: 0.97,
    name: "helmet",
  });
  glow(
    b.part(new THREE.TorusGeometry(0.47, 0.035, 6, 18), CYAN, {
      bone: core,
      at: [0, 2.759, 0.679],
      dir: [0, 0.894, 0.447],
      axis: "z",
      name: "helmetRim",
    }),
  );
  b.spike([0, 2.82, 0.72], [0, 0.894, 0.447], 0.55, 0.12, { color: ARMOR, bone: core });
  for (const s of [1, -1]) b.spike([s * 0.47, 2.759, 0.679], [s * 0.7, 0.6, 0.1], 0.75, 0.11, { color: ARMOR, bone: core });

  const skinS = b.surface(head);
  for (const s of [1, -1]) {
    const h = skinS.around(H).at(s * 48, 12)!;
    const E = offset(h, h, 0.05);
    glow(b.part(new THREE.SphereGeometry(0.3, 10, 8), CYAN, { bone: core, at: E }), 1.3);
    b.part(new THREE.TorusGeometry(0.33, 0.06, 6, 14), ARMOR, { bone: core, at: offset(h, h, 0.1), dir: h, axis: "z" });
    b.part(new THREE.CylinderGeometry(1, 1, 0.04, 8), DARKTRIM, {
      bone: core,
      at: offset(h, h, 0.05 + 0.265),
      dir: h,
      scale: [0.17, 1, 0.05],
    });
    const brow = [
      [70, 24],
      [56, 36],
      [40, 40],
      [24, 33],
    ].map(([az, el]) => skinS.around(H).at(s * az, el)!.moved([0, 0.06, 0]));
    b.sweep(catmull(brow), (t) => 0.11 - 0.05 * t, { color: ARMOR, bone: core });
  }

  // Beak: separate upper and lower jaw.
  b.part(new THREE.SphereGeometry(0.28, 8, 6), DARKTRIM, { bone: core, at: [0, 1.55, 1.05] });
  b.sweep(bezier([0, 1.78, 0.9], [0, 1.72, 1.65], [0, 1.2, 1.55]), (t) => [0.22 * (1 - t) + 0.03, 0.15 * (1 - t) + 0.03], {
    color: BEAK,
    bone: core,
    caps: { start: "flat", end: "point" },
    name: "beakUpper",
  });
  b.sweep(bezier([0, 1.58, 0.85], [0, 1.38, 1.4], [0, 1.42, 1.3]), (t) => [0.18 * (1 - t) + 0.03, 0.12 * (1 - t) + 0.03], {
    color: BEAK,
    bone: jawJoint,
    caps: { start: "flat", end: "point" },
    name: "beakLower",
  });

  // Mantle detail
  const mantleSkin = b.surface(mantleSw);
  for (const t of [0.28, 0.46, 0.64, 0.82]) {
    b.sweep(mantleSkin.loop(mantle.at(t), { lift: 0.03 }), 0.07, { color: ARMOR });
    b.along(mantleSkin.loop(mantle.at(t), { lift: 0.09 }), 12, (at) =>
      b.part(new THREE.SphereGeometry(0.03, 6, 4), STUD, { at }),
    );
  }
  for (let k = 0; k < 6; k++) {
    const h = mantleSw.at(0.18 + k * 0.13, 180);
    b.spike(h, h, 0.38 - 0.04 * k, 0.09 - 0.008 * k, { color: ARMOR });
  }
  b.sweep(mantleSw.line(0, 0.025).slice(0.08, 0.95), (t) => 0.14 * (1 - t) + 0.03, { color: ARMOR });
  for (const s of [1, -1])
    glow(b.sweep(mantleSw.line(s * 70, 0.02).slice(0.1, 0.9), 0.03, { color: CYAN }));
  const mp = mantle.at(0.5).at;
  for (const s of [1, -1])
    b.extrude(FIN, {
      at: [mp.x + s * 0.6, mp.y - 0.1, mp.z],
      x: [s, 0, 0],
      y: [0, 0.756, -0.655],
      thickness: 0.07,
      bevel: 0.02,
      smoothing: 1,
      color: FINP,
      bone: mantle.joints[1],
    });

  // Stem bands
  const stemSkin = b.surface(stemSw);
  glow(b.sweep(stemSkin.loop(stem.at(0.12), { lift: 0.015 }), 0.035, { color: CYAN }));
  for (const t of [0.38, 0.64]) b.sweep(stemSkin.loop(stem.at(t), { lift: 0.03 }), 0.07, { color: ARMOR });
  b.along(stemSkin.loop(stem.at(0.38), { lift: 0.1 }), 14, (at) =>
    b.part(new THREE.SphereGeometry(0.035, 6, 4), STUD, { at }),
  );

  // Tentacles
  const rad = (t: number) => 0.42 * Math.pow(1 - t, 1.1) + 0.04;
  const P = (a: number, r: number, y: number, side = 0) => [
    Math.sin(a) * r + Math.cos(a) * side,
    y,
    0.25 + Math.cos(a) * r - Math.sin(a) * side,
  ];
  const paths: ReturnType<typeof catmull>[] = [];
  const raisedArm = (i: number) => i === 2 || i === 5;
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4;
    const sg = i % 2 ? 1 : -1;
    const R = 5.0 + 0.45 * ((i * 5) % 4);
    const pts = raisedArm(i)
      ? [
          P(a, 0.75, 1.2),
          P(a, 1.9, 2.4),
          P(a, 3.1, 3.6, 0.3 * sg),
          P(a, 3.7, 4.9, 0.5 * sg),
          P(a, 3.3, 5.8, 0.4 * sg),
          P(a, 2.5, 6.2, 0.2 * sg),
        ]
      : [
          P(a, 0.75, 1.2),
          P(a, 1.8, 1.95),
          P(a, 3.2, 2.15, 0.15 * sg),
          P(a, 4.6, 1.25, 0.4 * sg),
          P(a, R, 0.09, 0.8 * sg),
          P(a, R + 0.9, 0.55, 1.5 * sg),
        ];
    const path = catmull(pts);
    paths.push(path);
    const chain = b.chain(`tent${i}`, path, { parent: stem.joints[0], count: 8, role: "tentacle" });
    const sw = b.sweep(chain, rad, { color: SKIN, sectors: [[125, 235, BELLY]] as const });

    for (let k = 0; k < 11; k++) {
      const t = 0.14 + k * 0.07;
      const h = sw.at(t, 180 + (k % 2 ? 26 : -26));
      const rr = Math.max(0.025, 0.42 * rad(t));
      b.stick(new THREE.CylinderGeometry(rr * 0.85, rr, 0.05, 8), SUCK, h, { embed: 0.5 });
      glow(b.stick(new THREE.CylinderGeometry(rr * 0.45, rr * 0.45, 0.07, 8), CYAN, h, { embed: 0.3 }));
    }

    const armSkin = b.surface(sw);
    b.sweep(armSkin.loop(chain.at(0.1), { lift: 0.02 }), 0.075, { color: ARMOR });
    b.along(armSkin.loop(chain.at(0.1), { lift: 0.1 }), 8, (at) =>
      b.part(new THREE.SphereGeometry(0.035, 6, 4), STUD, { at }),
    );
    glow(b.sweep(armSkin.loop(chain.at(0.2), { lift: 0.015 }), 0.035, { color: CYAN }));

    glow(
      b.part(new THREE.SphereGeometry(0.12, 8, 6), CYAN, {
        at: pts[5],
        bone: chain.joints[chain.joints.length - 1],
      }),
    );

    if (!raisedArm(i))
      b.lathe(
        [
          [0.14, 0],
          [0.24, 0.12],
          [0.36, 0.12],
          [0.46, 0],
        ],
        { at: [pts[4][0], 0.09, pts[4][2]], bone: core, color: FOAM, segments: 10 },
      );
  }

  // Webbing between neighbouring ground arms
  for (const [i, j] of [
    [0, 1],
    [3, 4],
    [6, 7],
    [7, 0],
  ]) {
    const ea = paths[i].slice(0, Math.min(0.5, 2.2 / paths[i].length));
    const eb = paths[j].slice(0, Math.min(0.5, 2.2 / paths[j].length));
    b.membrane(ea, eb, { color: WEB, thickness: 0.04, bone: stem.joints[0] });
  }

  // Water
  b.lathe(
    [
      [0, -0.06],
      [7.6, -0.06],
      [7.6, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, 0.6], bone: core, color: WATER, segments: 28 },
  );
  for (const R of [1.35, 2.1, 3.0])
    b.lathe(
      [
        [R - 0.16, 0],
        [R - 0.06, 0.13],
        [R + 0.06, 0.13],
        [R + 0.16, 0],
      ],
      { at: [0, 0.09, 0.25], bone: core, color: FOAM, segments: 28 },
    );
  const r = rng(5);
  for (let k = 0; k < 16; k++) {
    const ang = r() * Math.PI * 2;
    const rr = 1.6 + r() * 3.2;
    b.part(new THREE.SphereGeometry(1, 6, 4), FOAM, {
      bone: core,
      at: [Math.sin(ang) * rr, 0.5 + r() * 1.6, 0.25 + Math.cos(ang) * rr],
      scale: 0.05 + 0.08 * r(),
    });
  }

  return b.root;
}
