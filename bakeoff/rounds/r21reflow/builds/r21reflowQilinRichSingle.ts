import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Jade-scaled hooved chimera with golden antlers, a cloud-swirl mane and tail, gold filigree trim, tassels and a jade medallion.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const NAVY = "#24505a";
const BEAD = "#e6b84a";
const DARK = "#2a1a30";

// palette (cel-shaded paints)
const SCALE_BACK = scales(["#5aa88a", "#4f9a7c", "#63b093"], "#2b6552", { size: 0.07, width: 0.15 });
const BELLY = scales(["#f6efd8", "#efe5c6"], "#d9cba4", { size: 0.07, width: 0.12 });
const COAT = cel(countershade(SCALE_BACK, BELLY, { level: -0.5, soft: 0.25 }));
const NECKCOAT = cel(furEdge(BELLY, SCALE_BACK, { axis: [0, 0, 1], level: 0.35, teeth: 0.25, period: 0.04, along: [1, 0, 0] }));
const HEADP = cel(
  furEdge("#5aa88a", "#f6efd8", { by: "position", axis: [0, 1, 0], level: 1.665, teeth: 0.02, period: 0.03, along: [1, 0, 0] }),
);
const CREAM = cel("#f6efd8", "#dccfa8");
const JADE = cel("#4f9a7c", "#2b6552");
const GOLD = cel("#e0aa3c", "#9a6a1c");
const NAVYC = cel(NAVY, "#142e36");
const LEG = cel(SCALE_BACK);

// textures
const spiral = (() => {
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const th = i * 0.28;
    const r = 2 + th * 1.7;
    d += `${i === 0 ? "M" : "L"}${(32 + r * Math.cos(th)).toFixed(1)} ${(32 + r * Math.sin(th)).toFixed(1)} `;
  }
  return d;
})();
const swirl = (stroke: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><path d="${spiral}" fill="none" stroke="${stroke}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
const tuft = (fill: string, line: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><g fill="${fill}" stroke="${line}" stroke-width="2"><circle cx="32" cy="44" r="19"/><circle cx="17" cy="34" r="12"/><circle cx="47" cy="34" r="12"/><circle cx="32" cy="22" r="13"/><circle cx="32" cy="10" r="7"/></g><path transform="translate(32 40) scale(0.45) translate(-32 -32)" d="${spiral}" fill="none" stroke="${line}" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
const TUFT_CREAM = tuft("#f6efd8", "#cdbd8f");
const TUFT_JADE = tuft("#58a88a", "#2b6552");
const SWIRL_CREAM = swirl("#cdbd8f");
const SWIRL_JADE = swirl("#2b6552");

const SCROLL: Array<[number, number]> = [
  [0, 0],
  [0.1, 0.08],
  [0.2, 0.06],
  [0.26, -0.02],
  [0.22, -0.06],
  [0.17, -0.01],
  [0.1, 0.01],
  [0.04, -0.05],
];

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const rand = rng(11);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.05, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.05, -0.4],
      [0, 1.07, -0.05],
      [0, 1.1, 0.3],
      [0, 1.14, 0.55],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chestJ = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.14, 0.55],
      [0, 1.42, 0.66],
      [0, 1.68, 0.8],
    ]),
    { parent: chestJ, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1).at, dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, 0.95], aim: [0, 1.6, 1.16], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.08, -0.55],
      [0, 1.1, -0.85],
      [0, 1.2, -1.05],
      [0, 1.3, -1.2],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailEnd = tail.joints[tail.joints.length - 1];

  // ---------------- body
  const body = b.loft(
    [
      { at: [0, 1.05, -0.66], w: 0.4, h: 0.46 },
      { at: [0, 1.05, -0.4], w: 0.5, h: 0.52 },
      { at: [0, 1.08, 0.0], w: 0.46, h: 0.5 },
      { at: [0, 1.1, 0.4], w: 0.46, h: 0.54 },
      { at: [0, 1.12, 0.6], w: 0.36, h: 0.5 },
    ],
    { bone: [hips, spine], color: COAT, sides: 10 },
  );
  const skin = b.surface(body);
  b.along(body, 9, (at) => b.spike(at, at, 0.05, 0.016, { color: GOLD, sides: 6 }));

  const neckTube = b.sweep(neck, [0.15, 0.115, 0.085], { color: NECKCOAT });
  b.sweep(tail, [0.07, 0.035], { color: COAT });

  // ---------------- legs
  const hoofGeo = new THREE.BoxGeometry(0.05, 0.09, 0.13);
  const legs: Array<{ sweep: ReturnType<typeof b.sweep> }> = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb(
      [s * 0.17, 1.02, 0.38],
      [s * 0.17, 0.07, 0.42],
      [0.42, 0.4, 0.18],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fl = b.chain(`legF${side}`, front, {
      parent: chestJ,
      names: [`shoulder${side}`, `elbow${side}`, `carpus${side}`, `fetlockF${side}`],
      role: "leg",
    });
    const fs = b.sweep(fl, [0.1, 0.085, 0.06, 0.05, 0.04, 0.036], {
      bands: [
        [0.6, LEG],
        [1, NAVYC],
      ],
    });
    b.sweep(fl, 0.058, { from: 0.62, to: 0.72, color: GOLD, caps: "flat", sides: 8 });
    b.sweep(fl, 0.05, { from: 0.8, to: 0.84, color: GOLD, caps: "flat", sides: 8 });
    legs.push({ sweep: fs });
    const fTip = fl.joints[fl.joints.length - 1];
    for (const o of [-1, 1])
      b.part(hoofGeo, GOLD, { bone: fTip, at: [s * 0.17 + o * 0.029, 0.045, 0.45], flat: true });

    const hind = limb(
      [s * 0.17, 1.02, -0.52],
      [s * 0.17, 0.07, -0.6],
      [0.5, 0.45, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`],
      role: "leg",
    });
    const hs = b.sweep(hl, [0.12, 0.1, 0.065, 0.05, 0.042, 0.036], {
      bands: [
        [0.6, LEG],
        [1, NAVYC],
      ],
    });
    b.sweep(hl, 0.062, { from: 0.74, to: 0.84, color: GOLD, caps: "flat", sides: 8 });
    legs.push({ sweep: hs });
    const hTip = hl.joints[hl.joints.length - 1];
    for (const o of [-1, 1])
      b.part(hoofGeo, GOLD, { bone: hTip, at: [s * 0.17 + o * 0.029, 0.045, -0.57], flat: true });
  }
  // cloud-fur puffs on elbows, hocks and fetlocks
  for (const l of legs)
    for (const [t, deg, r] of [
      [0.2, 180, 0.05],
      [0.55, 180, 0.045],
      [0.88, 180, 0.04],
    ] as const)
      b.stick(new THREE.SphereGeometry(1, 7, 5), CREAM, l.sweep.at(t, deg), { embed: 0.2, scale: r });

  // ---------------- mane: cloud puffs and swirl cards down the neck
  for (let i = 0; i < 11; i++) {
    const t = 0.05 + (i / 10) * 0.9;
    for (const [deg, k] of [
      [0, 1],
      [-40, 0.75],
      [40, 0.75],
    ] as const) {
      const r = (0.065 + 0.03 * Math.sin(i * 1.7) ** 2 + 0.01 * i * 0.2) * k;
      const col = (i + (deg === 0 ? 0 : 1)) % 3 === 1 ? JADE : CREAM;
      b.stick(new THREE.SphereGeometry(1, 8, 6), col, neckTube.at(t, deg, 0.0), { embed: 0.3, scale: r });
    }
  }
  const dorsal = Array.from({ length: 14 }, (_, i) => neckTube.at(0.04 + (i / 13) * 0.92, i % 2 ? 25 : -25));
  b.cards(dorsal, [TUFT_CREAM, TUFT_JADE, TUFT_CREAM], {
    size: [0.17, 0.2],
    lean: 35,
    flow: [0, 0, -1],
    bend: 30,
    vary: 0.3,
    spin: 20,
    rng: rng(5),
  });
  const ruff = Array.from({ length: 6 }, (_, i) => neckTube.at(0.15 + (i / 5) * 0.6, 180));
  b.cards(ruff, TUFT_CREAM, { size: [0.12, 0.14], lean: 70, flow: [0, -1, 0], vary: 0.25, rng: rng(8) });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [s * 0.1, 1.79, 0.72], scale: 0.07 });

  // ---------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, { bone: head, at: [0, 1.74, 0.9], scale: [0.1, 0.1, 0.13] });
  b.frustumBox([0, 1.7, 0.96], [0, 1.62, 1.2], [0.15, 0.13], [0.1, 0.08], { bone: head, color: HEADP });
  b.part(new THREE.SphereGeometry(1, 7, 5), DARK, { bone: head, at: [0, 1.625, 1.215], scale: [0.045, 0.03, 0.03] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 5, 4), DARK, { bone: head, at: [s * 0.025, 1.64, 1.235], scale: 0.01 });
  b.frustumBox([0, 1.64, 0.95], [0, 1.585, 1.17], [0.1, 0.04], [0.07, 0.03], { bone: jaw, color: CREAM });
  b.spike([0, 1.58, 1.12], [0, -0.7, -0.5], 0.12, 0.02, { bone: jaw, color: CREAM, sides: 6 });

  const EYE = animeEye({ iris: "#e0a020" });
  const headSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = headSkin.around(skull.at).at(s * 52, 6);
    if (hit) b.decal(headSkin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }

  // ears, frills, whiskers, cheek tufts
  for (const s of [1, -1]) {
    b.frustumBox([s * 0.08, 1.77, 0.82], [s * 0.2, 1.88, 0.7], [0.08, 0.03], [0.015, 0.01], { bone: head, color: JADE });
    b.frustumBox([s * 0.09, 1.775, 0.835], [s * 0.19, 1.875, 0.72], [0.045, 0.02], [0.01, 0.008], { bone: head, color: "#d98c7a" });
    for (let k = 0; k < 3; k++)
      b.spike([s * 0.1, 1.7 - k * 0.025, 0.88 - k * 0.04], [s, 0.05 - k * 0.15, -0.5], 0.09 - k * 0.012, 0.02, {
        bone: head,
        color: k === 1 ? GOLD : JADE,
        sides: 6,
      });
    for (const k of [0, 1])
      b.sweep(
        catmull([
          [s * 0.05, 1.63 - k * 0.02, 1.14],
          [s * 0.14, 1.6 - k * 0.04, 1.06 - k * 0.04],
          [s * 0.22, 1.5 - k * 0.07, 0.92 - k * 0.04],
        ]),
        [0.009, 0.003],
        { bone: head, color: "#f6efd8", sides: 5, caps: { start: "flat", end: "point" } },
      );
    b.cards([frame([s * 0.09, 1.69, 0.86], [s, -0.2, -0.3])], TUFT_CREAM, {
      size: [0.12, 0.14],
      lean: 70,
      flow: [0, -0.3, -1],
      bone: head,
      mirror: s > 0,
    });

    // antlers
    const beam = catmull([
      [s * 0.05, 1.78, 0.84],
      [s * 0.08, 1.92, 0.8],
      [s * 0.12, 2.06, 0.7],
      [s * 0.11, 2.18, 0.58],
    ]);
    b.sweep(beam, [0.03, 0.012], { bone: head, color: GOLD, sides: 6, caps: { start: "flat", end: "point" } });
    b.part(new THREE.SphereGeometry(1, 7, 5), GOLD, { bone: head, at: [s * 0.05, 1.78, 0.84], scale: 0.04 });
    for (const [t, dir, len] of [
      [0.3, [s * 0.5, 0.5, 0.9], 0.13],
      [0.55, [s * 0.8, 0.5, 0.3], 0.15],
      [0.78, [s * 0.2, 0.6, 0.9], 0.14],
    ] as const)
      b.spike(beam.at(t), dir, len, 0.016, { bone: head, color: GOLD, sides: 6 });
  }
  b.part(new THREE.OctahedronGeometry(1), GOLD, { bone: head, at: [0, 1.805, 0.965], scale: [0.032, 0.055, 0.014] });
  glow(b.part(new THREE.OctahedronGeometry(1), "#7fe8c8", { bone: head, at: [0, 1.805, 0.975], scale: [0.018, 0.034, 0.012] }), 1.2);

  // ---------------- gold trim, medallions, tassels
  for (const z of [0.4, 0.47])
    b.sweep(skin.loop([0, 1.1, z], { dir: [0, 0, 1], lift: 0.012 }), 0.02, { color: GOLD, sides: 6 });

  const medallion = (hit: { at: THREE.Vector3; axis: THREE.Vector3 }, r: number) => {
    b.part(new THREE.TorusGeometry(r, r * 0.16, 6, 14), GOLD, { bone: spine.joints[1], at: offset(hit.at, hit.axis, 0.012), dir: hit.axis, axis: "z" });
    glow(b.part(new THREE.CircleGeometry(r * 0.88, 12), "#7fe0b8", { bone: spine.joints[1], at: offset(hit.at, hit.axis, 0.016), dir: hit.axis, axis: "z" }), 0.6);
    for (const o of [-1, 1]) {
      const top = new THREE.Vector3(hit.at.x + hit.axis.x * 0.02, hit.at.y - r - 0.02, hit.at.z + hit.axis.z * 0.02 + o * 0.035);
      b.part(new THREE.SphereGeometry(1, 6, 5), BEAD, { bone: spine.joints[1], at: top, scale: 0.02 });
      b.spike(top, [0, -1, 0], 0.17, 0.03, { bone: spine.joints[1], color: NAVY, sides: 6 });
    }
  };
  const chestHit = skin.ray([0, 0.95, 1.5], [0, 0, -1]);
  if (chestHit) medallion(chestHit, 0.06);
  for (const s of [1, -1]) {
    const flank = skin.ray([s, 1.0, -0.05], [-s, 0, 0]);
    if (flank) medallion(flank, 0.07);
    const sh = skin.ray([s, 1.14, 0.22], [-s, 0, 0]);
    if (sh)
      b.extrude(SCROLL, {
        at: sh.at.clone().add(new THREE.Vector3(s * 0.004, -0.03, -0.12)),
        x: [0, 0, 1],
        thickness: 0.02,
        bevel: 0.004,
        smoothing: 1,
        color: GOLD,
        bone: spine.joints[2],
      });
  }
  b.extrude(SCROLL, { at: [0, 1.32, -0.08], x: [0, 0, 1], thickness: 0.02, bevel: 0.004, smoothing: 1, color: GOLD, bone: spine.joints[1] });
  b.extrude(SCROLL, { at: [0, 1.3, -0.6], x: [0, 0, 1], thickness: 0.02, bevel: 0.004, smoothing: 1, color: GOLD, bone: hips });

  // ---------------- tail cloud cluster
  const puffs: Array<[number, number, number, number, boolean]> = [
    [0, 1.38, -1.3, 0.17, false],
    [0.15, 1.3, -1.42, 0.13, true],
    [-0.15, 1.34, -1.4, 0.14, true],
    [0.05, 1.56, -1.4, 0.16, false],
    [-0.1, 1.5, -1.52, 0.13, false],
    [0.1, 1.28, -1.58, 0.12, false],
    [0, 1.22, -1.45, 0.12, true],
  ];
  for (const [x, y, z, r, jade] of puffs) {
    b.part(new THREE.SphereGeometry(1, 10, 8), jade ? JADE : CREAM, { bone: tailEnd, at: [x, y, z], scale: r });
    for (const s of [1, -1])
      b.part(new THREE.PlaneGeometry(1, 1), "#ffffff", {
        bone: tailEnd,
        at: [x + s * (r + 0.004), y, z],
        dir: [s, 0, 0],
        axis: "z",
        scale: r * 1.5,
        texture: jade ? SWIRL_JADE : SWIRL_CREAM,
      });
  }
  void rand;
  return b.root;
}
