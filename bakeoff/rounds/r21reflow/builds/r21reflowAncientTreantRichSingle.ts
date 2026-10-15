import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import type { Frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import type { PointInput } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, grain, mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "Towering walking tree guardian: gnarled bark limbs with painted cracks and moss, antler crown of yellow leaves, lichen beard, glowing amber eyes and an emerald-lit chest crack, root feet, ivy and mushrooms.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const BARK_L = "#8a5e38";
const BARK_M = "#6a4527";
const BARK_D = "#3f2616";
const BARK_H = "#a77a4a";
const CRACK = "#2b1a0f";
const MOSS = "#4f7d22";
const MOSS_L = "#8bb938";
const VINE = "#3f6b1f";
const LICHEN = "#d8d0b0";
const LICHEN_D = "#b7ad8a";
const EMERALD = "#3dff9a";
const AMBER = "#ffb12a";

const IVY = svg(
  `<svg viewBox="0 0 48 48"><path d="M24 46 C10 40 4 30 8 22 C12 24 16 22 18 16 C20 10 24 4 24 2 C24 4 28 10 30 16 C32 22 36 24 40 22 C44 30 38 40 24 46Z" fill="#4f9a2c" stroke="#2f6a1c" stroke-width="2"/><path d="M24 44 L24 8 M24 34 L14 26 M24 34 L34 26 M24 22 L18 16 M24 22 L30 16" stroke="#9ccf4a" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);
const MAPLE = svg(
  `<svg viewBox="0 0 48 48"><path d="M24 46 L21 36 L6 38 L12 26 L2 18 L16 16 L14 4 L24 12 L34 4 L32 16 L46 18 L36 26 L42 38 L27 36Z" fill="#f1d23a" stroke="#c58a14" stroke-width="2"/><path d="M24 44 L24 14 M24 30 L10 24 M24 30 L38 24 M24 20 L16 10 M24 20 L32 10" stroke="#fff3a0" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 48 48"><path d="M8 48 C8 30 10 16 6 4 C16 16 18 32 18 48Z M20 48 C20 28 24 14 24 0 C30 14 32 30 30 48Z M32 48 C34 32 38 20 44 8 C44 24 42 36 42 48Z" fill="#6aa02a" stroke="#3f6b1f" stroke-width="2"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "ancientTreant" });

  const barkBase = grain(BARK_L, BARK_M, { size: 0.06, axis: "y" });
  const mossP = mottle(MOSS, MOSS_L, { size: 0.14, seed: 4 });
  const bark = paint((p, n) => {
    const c = cells(p, 0.24, 5);
    if (c.d2 - c.d1 < 0.05) return CRACK;
    if (n.y > 0.45 && noise(p, 0.6, 9) > 0.4) return mossP;
    if (n.y < -0.35) return BARK_D;
    return noise(p, 0.35, 2) > 0.62 ? BARK_H : barkBase;
  });

  const lp = (ts: number[], vs: number[], t: number) => {
    for (let i = 0; i < ts.length - 1; i++) {
      if (t <= ts[i + 1]) {
        const k = (t - ts[i]) / (ts[i + 1] - ts[i]);
        return vs[i] + (vs[i + 1] - vs[i]) * Math.max(0, k);
      }
    }
    return vs[vs.length - 1];
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 2.0, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.0, 0],
      [0, 2.7, 0.02],
      [0, 3.4, 0.1],
      [0, 3.95, 0.15],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestJ = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.95, 0.15],
      [0, 4.3, 0.25],
      [0, 4.5, 0.32],
    ]),
    { parent: chestJ, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 4.5, 0.32], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 4.45, 0.5], aim: [0, 4.25, 0.85], role: "jaw" });

  // ---------- torso ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), bark, { bone: hips, at: [0, 2.0, 0], scale: [0.8, 0.55, 0.65] });
  const torso = b.sweep(
    spine,
    (t) => [lp([0, 0.33, 0.7, 1], [0.7, 0.62, 1.05, 0.9], t), lp([0, 0.33, 0.7, 1], [0.55, 0.5, 0.7, 0.6], t)],
    { color: bark },
  );
  b.sweep(neck, [0.42, 0.3], { color: bark });

  // ---------- head ----------
  const C: [number, number, number] = [0, 4.72, 0.34];
  b.part(new THREE.SphereGeometry(1, 10, 8), bark, { bone: head, at: C, scale: [0.42, 0.5, 0.45] });
  b.part(new THREE.SphereGeometry(1, 9, 6), bark, { bone: jaw, at: [0, 4.3, 0.58], scale: [0.33, 0.17, 0.3] });
  b.spike([0, 4.62, 0.72], [0, 4.5, 0.97], null, 0.1, { bone: head, color: bark });
  for (const s of [1, -1]) {
    b.capsule([s * 0.05, 4.8, 0.76], [s * 0.42, 4.92, 0.6], 0.08, { bone: head, color: bark });
    b.part(new THREE.SphereGeometry(1, 7, 5), CRACK, { bone: head, at: [s * 0.19, 4.72, 0.7], scale: [0.11, 0.08, 0.06] });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), AMBER, { bone: head, at: [s * 0.19, 4.72, 0.75] }), 1.6);
    b.capsule([s * 0.05, 4.5, 0.86], [s * 0.3, 4.58, 0.7], 0.05, { bone: head, color: bark }); // cheek ridge
    b.sweep(
      catmull([
        [s * 0.05, 4.5, 0.86],
        [s * 0.3, 4.42, 0.82],
        [s * 0.5, 4.2, 0.72],
      ]),
      [0.06, 0.012],
      { bone: jaw, color: LICHEN, caps: { start: "flat", end: "point" } },
    );
  }
  b.rod([-0.2, 4.4, 0.89], [0.2, 4.4, 0.89], 0.014, { bone: jaw, color: CRACK });
  // forehead ridges
  for (let i = 0; i < 3; i++)
    b.capsule([-0.25, 4.98 + i * 0.06, 0.62 - i * 0.03], [0.25, 4.98 + i * 0.06, 0.62 - i * 0.03], 0.025, {
      bone: head,
      color: BARK_D,
    });
  // beard
  const rb = rng(21);
  for (let row = 0; row < 2; row++)
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      const x = (u - 0.5) * (0.56 - row * 0.1);
      const edge = Math.abs(u - 0.5) * 2;
      const by = 4.27 - row * 0.02;
      const bz = 0.6 + 0.22 * (1 - edge) + row * 0.08;
      const len = 0.95 - 0.5 * edge + rb() * 0.18 - row * 0.15;
      b.sweep(
        catmull([
          [x, by, bz],
          [x * 1.1, by - len * 0.5, bz + 0.05],
          [x * 0.5, by - len, bz + 0.12],
        ]),
        [0.075 - row * 0.015, 0.01],
        { bone: jaw, color: (i + row) % 2 ? LICHEN : LICHEN_D, caps: { start: "flat", end: "point" } },
      );
    }

  // ---------- antler crown ----------
  const crownF: Frame[] = [];
  const burst = (arr: Frame[], pt: PointInput, n: number, up: number) => {
    for (let k = 0; k < n; k++) {
      const a = r1() * 6.28;
      arr.push(frame(pt, [Math.cos(a) * 0.8, up + r1() * 0.6, Math.sin(a) * 0.8]));
    }
  };
  const r1 = rng(11);
  for (const s of [1, -1]) {
    const main = catmull([
      [s * 0.22, 5.0, 0.25],
      [s * 0.55, 5.4, 0.2],
      [s * 1.1, 5.65, 0.0],
      [s * 1.7, 5.6, -0.25],
      [s * 2.2, 5.95, -0.3],
    ]);
    b.sweep(main, [0.14, 0.025], { bone: head, color: bark, caps: { start: "flat", end: "point" } });
    [0.3, 0.5, 0.7, 0.88].forEach((t, k) => {
      const base = main.at(t);
      const dir = [s * 0.4, 1, k % 2 ? 0.5 : -0.5];
      const tip = offset(base, dir, 0.55 - k * 0.07);
      b.spike(base, tip, null, 0.06, { bone: head, color: bark });
      burst(crownF, tip, 4, 0.5);
    });
    burst(crownF, main.at(1), 7, 0.6);
    burst(crownF, main.at(0.6), 4, 0.4);
  }
  b.cards(crownF, MAPLE, { size: [0.3, 0.32], lean: 40, bend: 20, vary: 0.3, rng: rng(12), spin: 60, bone: head });

  // ---------- back branches ----------
  const backF: Frame[] = [];
  for (const s of [1, -1]) {
    const bp = catmull([
      [s * 0.5, 3.8, -0.4],
      [s * 1.0, 4.6, -0.8],
      [s * 1.4, 5.3, -0.9],
      [s * 1.7, 5.9, -0.8],
    ]);
    b.sweep(bp, [0.15, 0.03], { bone: chestJ, color: bark, caps: { start: "flat", end: "point" } });
    burst(backF, bp.at(1), 6, 0.6);
    burst(backF, bp.at(0.7), 4, 0.5);
    const sb = offset(bp.at(0.5), [s * 0.8, 0.8, -0.2], 0.6);
    b.spike(bp.at(0.5), sb, null, 0.07, { bone: chestJ, color: bark });
    burst(backF, sb, 4, 0.5);
  }
  b.cards(backF, MAPLE, { size: [0.3, 0.32], lean: 40, bend: 20, vary: 0.3, rng: rng(13), spin: 60, bone: chestJ });

  // ---------- arms ----------
  const armSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.95, 3.8, 0.05];
    const el = [s * 2.0, 3.65, 0.15];
    const wr = [s * 3.1, 3.25, 0.35];
    const arm = b.chain(`arm${S}`, catmull([sh, el, wr]), {
      parent: chestJ,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    armSweeps.push(b.sweep(arm, [0.46, 0.36, 0.4], { color: bark }));
    const wristJ = arm.joints[2];
    b.part(new THREE.SphereGeometry(1, 9, 7), bark, {
      bone: arm.joints[0],
      at: [s * 1.15, 4.1, 0.0],
      scale: [0.7, 0.55, 0.62],
    });
    for (let k = 0; k < 3; k++)
      b.spike([s * (0.95 + k * 0.2), 4.35, -0.15 + k * 0.15], [s * 0.4, 1, -0.1 + k * 0.1], 0.45, 0.09, {
        bone: arm.joints[0],
        color: bark,
      });
    b.spike([s * 2.0, 3.95, 0.1], [s * 0.1, 1, -0.4], 0.5, 0.12, { bone: arm.joints[1], color: bark });
    b.part(new THREE.SphereGeometry(1, 9, 7), bark, {
      bone: wristJ,
      at: [s * 3.3, 3.25, 0.4],
      scale: [0.38, 0.34, 0.2],
    });
    const handF: Frame[] = [];
    for (let i = 0; i < 4; i++) {
      const yo = (i - 1.5) * 0.14;
      const pts = [
        [s * 3.3, 3.25 + yo, 0.45],
        [s * 3.75, 3.25 + yo * 1.6, 0.58],
        [s * 4.1, 3.15 + yo * 2.2, 0.85],
      ];
      const f = b.chain(`finger${i}${S}`, catmull(pts), {
        parent: wristJ,
        names: [`finger${i}a${S}`, `finger${i}b${S}`, `finger${i}c${S}`],
        role: "digit",
      });
      b.sweep(f, [0.11, 0.08, 0.035], { color: bark, caps: { start: "round", end: "point" } });
      if (i % 2 === 0) burst(handF, pts[2], 3, 0.4);
    }
    const th = b.chain(
      `thumb${S}`,
      catmull([
        [s * 3.25, 3.05, 0.5],
        [s * 3.5, 2.8, 0.7],
        [s * 3.65, 2.65, 1.0],
      ]),
      { parent: wristJ, names: [`thumb1${S}`, `thumb2${S}`, `thumb3${S}`], role: "digit" },
    );
    b.sweep(th, [0.11, 0.08, 0.035], { color: bark, caps: { start: "round", end: "point" } });
    b.cards(handF, MAPLE, { size: [0.22, 0.24], lean: 30, vary: 0.3, rng: rng(14 + (s > 0 ? 0 : 1)), spin: 50, bone: wristJ });
  }

  // ---------- legs ----------
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  const rr = rng(31);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.6, 2.0, 0],
        [s * 0.85, 1.15, 0.4],
        [s * 0.95, 0.5, 0.1],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    legSweeps.push(b.sweep(leg, [0.5, 0.4, 0.36], { color: bark }));
    const ankleJ = leg.joints[2];
    const x = s * 0.95;
    b.loft(
      [
        { at: [x, 0.3, -0.1], w: 0.8, h: 0.6 },
        { at: [x, 0.26, 0.35], w: 0.85, h: 0.52 },
        { at: [x, 0.15, 0.85], w: 0.5, h: 0.3 },
      ],
      { bone: ankleJ, color: bark },
    );
    b.part(new THREE.SphereGeometry(1, 9, 7), bark, {
      bone: leg.joints[1],
      at: [s * 0.9, 1.15, 0.7],
      scale: [0.4, 0.4, 0.3],
    });
    for (let k = 0; k < 7; k++) {
      const ang = (-80 + k * (160 / 6)) * (Math.PI / 180);
      const len = 0.8 + rr() * 0.4;
      const sx = Math.sin(ang);
      const cz = Math.cos(ang);
      b.sweep(
        catmull([
          [x + sx * 0.2, 0.35, 0.2 + cz * 0.2],
          [x + sx * len * 0.5, 0.18, 0.2 + cz * len * 0.5],
          [x + sx * len, 0.05, 0.2 + cz * len],
        ]),
        [0.14, 0.03],
        { bone: ankleJ, color: bark, sides: 6, caps: { start: "flat", end: "point" } },
      );
    }
    for (const bk of [-1, 1])
      b.sweep(
        catmull([
          [x, 0.35, -0.1],
          [x + bk * 0.4, 0.17, -0.5],
          [x + bk * 0.7, 0.05, -0.9],
        ]),
        [0.13, 0.03],
        { bone: ankleJ, color: bark, sides: 6, caps: { start: "flat", end: "point" } },
      );
  }

  // ---------- surface dressing ----------
  const torsoS = b.surface(torso);
  const bodyS = b.surface([torso, ...armSweeps, ...legSweeps]);
  const legS = b.surface(legSweeps);

  // bark shards
  const shards = bodyS.scatter(60, { rng: rng(41), minDist: 0.3, filter: (h) => h.n.y > -0.5 });
  for (const h of shards)
    b.stick(new THREE.BoxGeometry(0.22, 0.05, 0.14), bark, h, { embed: 0.3, spin: (h.at.x * 97) % 180 });

  // chest eye-knot and glowing cracks
  const knot = torsoS.nearest([0, 3.4, 1.5]);
  b.stick(new THREE.CylinderGeometry(0.24, 0.28, 0.07, 10), BARK_D, knot, { embed: 0.2 });
  const k2 = knot.moved([0, 0.05, 0]);
  b.stick(new THREE.CylinderGeometry(0.16, 0.2, 0.07, 10), BARK_M, k2, { embed: 0.2 });
  glow(b.stick(new THREE.CylinderGeometry(0.08, 0.1, 0.07, 8), EMERALD, knot.moved([0, 0.1, 0]), { embed: 0.2 }), 1.4);
  const cracks = [
    [
      [-0.05, 3.9, 0.9],
      [0.12, 3.7, 0.9],
      [-0.08, 3.5, 0.9],
    ],
    [
      [0.1, 3.2, 0.9],
      [-0.12, 3.0, 0.9],
      [0.05, 2.75, 0.9],
    ],
    [
      [-0.35, 3.6, 0.85],
      [-0.55, 3.35, 0.8],
      [-0.5, 3.1, 0.8],
    ],
    [
      [0.35, 3.6, 0.85],
      [0.55, 3.4, 0.8],
      [0.5, 3.05, 0.8],
    ],
  ];
  for (const c of cracks) glow(b.sweep(torsoS.drape(catmull(c), { lift: 0.015 }), 0.022, { color: EMERALD }), 1.3);

  // vines with ivy
  const ivyF: Frame[] = [];
  const vines = [
    [
      [0.7, 4.2, 0.6],
      [0.5, 3.6, 0.85],
      [0.45, 3.0, 0.8],
      [0.55, 2.5, 0.7],
    ],
    [
      [-0.8, 4.1, 0.55],
      [-0.5, 3.5, 0.85],
      [-0.2, 3.0, 0.85],
      [-0.4, 2.4, 0.7],
    ],
    [
      [-0.2, 4.1, 0.65],
      [-0.4, 3.7, 0.85],
      [-0.6, 3.2, 0.8],
    ],
  ];
  for (const v of vines) {
    const path = torsoS.drape(catmull(v), { lift: 0.03 });
    b.sweep(path, 0.035, { color: VINE });
    const items = b.along(path, 7, () => {});
    for (const it of items) ivyF.push(torsoS.nearest(it.at));
  }
  b.cards(ivyF, IVY, { size: [0.24, 0.28], lean: 55, bend: 20, flow: [0, -1, 0], vary: 0.3, rng: rng(5), spin: 40 });

  const ivyHits = bodyS.scatter(70, { rng: rng(3), minDist: 0.25, filter: (h) => h.n.y > -0.4 });
  b.cards(ivyHits, IVY, { size: [0.22, 0.26], lean: 55, bend: 20, flow: [0, -1, 0], vary: 0.3, rng: rng(4), spin: 40 });

  const tufts = bodyS.scatter(80, { rng: rng(6), minDist: 0.15, filter: (h) => h.n.y > 0.55 });
  b.cards(tufts, TUFT, { size: [0.16, 0.16], lean: 0, cross: true, vary: 0.35, rng: rng(7), spin: 180 });

  // mushrooms on the legs
  const rm = rng(51);
  const mush = legS.scatter(12, { rng: rng(52), minDist: 0.5, filter: (h) => h.n.y > -0.2 && h.at.y < 1.7 });
  for (const h of mush) {
    const sz = 0.05 + rm() * 0.05;
    b.stick(new THREE.CylinderGeometry(sz * 0.35, sz * 0.45, sz * 2.4, 6), "#e8d8b0", h, { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(sz * 1.6, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#c4682c", h.moved([0, sz * 2, 0]), {
      embed: 0,
    });
  }

  return b.root;
}
