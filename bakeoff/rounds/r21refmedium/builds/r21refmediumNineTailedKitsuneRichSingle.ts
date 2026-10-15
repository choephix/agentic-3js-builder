// Nine-tailed kitsune: a pale, elegant spirit fox with red-and-gold tribal markings, a gold collar and orb, and nine
// fanned tails that each end in a cold blue spirit flame rimmed with gold. High-fantasy anime: cel-shaded coat,
// zig-zag fur edges, big shiny anime eyes, ornate gold trims and glowing flames.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { gradient, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A graceful white spirit fox with red and gold tribal markings, a gold collar and orb, and nine fanned tails tipped with blue spirit flames.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const RED = "#c8342a";
const GOLD = "#f0b84a";
const DEG = Math.PI / 180;

const FLAME_A = `<svg viewBox="0 0 64 128">
<path d="M32 126 C6 112 4 84 20 62 C26 52 18 36 30 2 C34 26 52 36 50 60 C62 78 58 110 32 126Z" fill="#ffc94d"/>
<path d="M32 124 C10 110 10 86 23 66 C29 56 23 40 31 14 C35 32 49 42 47 62 C57 80 53 108 32 124Z" fill="#6b5cff"/>
<path d="M32 120 C16 108 16 88 28 70 C32 60 30 50 34 36 C40 52 48 64 46 82 C50 100 44 114 32 120Z" fill="#9aa8ff"/>
<path d="M32 116 C24 106 26 92 32 80 C38 92 40 106 32 116Z" fill="#f4f6ff"/>
</svg>`;
const FLAME_B = `<svg viewBox="0 0 64 128">
<path d="M32 126 C10 100 40 80 24 52 C16 36 36 24 40 2 C44 30 58 44 48 70 C42 90 58 108 32 126Z" fill="#ffd36a"/>
<path d="M32 122 C14 100 42 82 28 56 C22 42 36 32 39 12 C42 34 53 46 44 70 C39 90 52 106 32 122Z" fill="#7a63ff"/>
<path d="M32 116 C20 100 38 86 31 66 C34 76 46 86 40 100 C38 108 36 112 32 116Z" fill="#a9b8ff"/>
</svg>`;
const SWIRL = `<svg viewBox="0 0 100 100">
<g fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round">
<path d="M12 88 C6 62 34 56 40 38 C44 24 28 14 18 24 C14 30 20 36 26 32"/>
<path d="M40 38 C52 46 60 40 66 28 C70 18 82 16 88 24"/>
<path d="M30 80 C40 70 58 74 62 58 C64 50 72 48 78 54"/>
</g>
<g fill="none" stroke="#f1c04f" stroke-width="2.4" stroke-linecap="round">
<path d="M16 84 C12 66 34 60 38 44"/><path d="M44 42 C54 48 62 44 68 34"/>
</g>
<circle cx="18" cy="24" r="4" fill="#f1c04f"/><circle cx="88" cy="24" r="3.5" fill="#f1c04f"/>
</svg>`;
const mark = (color: string, edge: string) => `<svg viewBox="0 0 40 120">
<path d="M20 116 C6 90 30 80 18 56 C10 40 24 24 20 6 C34 28 30 44 26 58 C22 74 34 92 20 116Z" fill="${color}"/>
<path d="M20 108 C12 90 28 78 20 58" stroke="${edge}" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;
const FORE = `<svg viewBox="0 0 40 70">
<path d="M20 2 L34 28 L20 68 L6 28Z" fill="${RED}"/>
<path d="M20 14 L27 28 L20 50 L13 28Z" fill="#f1c04f"/>
<circle cx="20" cy="30" r="3.2" fill="${RED}"/>
<path d="M6 28 L1 24 M34 28 L39 24" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
</svg>`;
const CHEEK = `<svg viewBox="0 0 60 40">
<g fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round">
<path d="M4 10 C24 4 40 12 56 5"/><path d="M8 22 C26 16 40 24 54 17"/><path d="M14 33 C28 28 38 34 48 29"/>
</g></svg>`;
const TUFT = `<svg viewBox="0 0 32 64">
<path d="M16 62 C2 40 6 18 16 2 C26 18 30 40 16 62Z" fill="#fff6e2"/>
<path d="M16 60 C10 40 12 24 16 8" stroke="#f0d7a8" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M16 2 C20 10 22 16 22 20 C19 14 17 10 16 2Z" fill="#f3c768"/>
</svg>`;
const TASSEL = `<svg viewBox="0 0 20 60">
<rect x="8" y="0" width="4" height="14" fill="${GOLD}"/>
<path d="M10 12 L17 22 L15 58 L5 58 L3 22Z" fill="${RED}"/>
<path d="M10 20 L10 56" stroke="${GOLD}" stroke-width="2" fill="none"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const R = rng(11);

  const COAT = cel(furEdge("#fff3dc", "#fffdf6", { level: -0.3, teeth: 0.22, period: 0.03 }));
  const SOCK = cel(RED);
  const LEG = paint((p) => (p.y < 0.16 + 0.025 * zigzag((p.x + p.z) / 0.035) ? SOCK : COAT));

  const flameA = svg(FLAME_A, { size: 256 });
  const flameB = svg(FLAME_B, { size: 256 });
  const swirl = svg(SWIRL, { size: 256 });
  const markRed = svg(mark(RED, "#f1c04f"), { size: 256 });
  const markGold = svg(mark("#f1c04f", RED), { size: 256 });
  const fore = svg(FORE, { size: 256 });
  const cheek = svg(CHEEK, { size: 256 });
  const tuft = svg(TUFT, { size: 128 });
  const tassel = svg(TASSEL, { size: 128 });
  const eyeTex = animeEye({ iris: "#ffb326", blush: false, brow: false, size: 384 });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.66, -0.3] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.3],
      [0, 0.69, 0.0],
      [0, 0.7, 0.3],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const spineEnd = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.7, 0.3],
      [0, 0.8, 0.4],
      [0, 0.93, 0.5],
    ]),
    { parent: spineEnd, count: 2, role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.93, 0.5], dir: [0, -0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.95, 0.66], aim: [0, 0.92, 0.82], role: "jaw" });

  // ---- body and neck ----
  const body = b.sweep(
    catmull([
      [0, 0.64, -0.5],
      [0, 0.66, -0.3],
      [0, 0.69, 0],
      [0, 0.71, 0.3],
      [0, 0.72, 0.42],
    ]),
    (t) => [0.1 + 0.045 * Math.sin(Math.PI * t * 0.9 + 0.2), 0.12 + 0.075 * Math.sin(Math.PI * t * 0.85 + 0.35)],
    { bone: spine, color: COAT, sides: 10 },
  );
  const neckSweep = b.sweep(neck, [0.1, 0.075], { color: COAT, sides: 10 });

  // ---- head ----
  const HC = [0, 0.99, 0.6];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), COAT, {
    bone: head,
    at: HC,
    scale: [0.078, 0.07, 0.085],
  });
  b.sweep(
    [
      [0, 0.985, 0.64],
      [0, 0.955, 0.85],
    ],
    (t) => [0.05 - 0.03 * t, 0.042 - 0.026 * t],
    { bone: head, color: COAT, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(1, 6, 4), INK, {
    bone: head,
    at: [0, 0.957, 0.862],
    scale: [0.022, 0.017, 0.02],
  });
  b.sweep(
    [
      [0, 0.95, 0.67],
      [0, 0.928, 0.83],
    ],
    (t) => [0.035 - 0.02 * t, 0.018 - 0.007 * t],
    { bone: jaw, color: "#fff8ea", sides: 8 },
  );
  b.part(new THREE.BoxGeometry(0.04, 0.004, 0.14), "#7a2438", { bone: jaw, at: [0, 0.937, 0.76] });
  for (const s of [1, -1]) {
    b.spike([s * 0.018, 0.943, 0.8], [0, -1, 0], 0.02, 0.005, { color: "#ffffff", bone: head });
    for (let k = 0; k < 3; k++)
      b.rod(
        [s * 0.03, 0.962 - k * 0.006, 0.79],
        [s * 0.14, 0.97 - k * 0.025, 0.8 - k * 0.03],
        0.002,
        { color: "#ffffff", bone: head },
      );
  }

  // ears
  for (const s of [1, -1]) {
    const ear = b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.055, 1.05, 0.56],
      dir: [0, 1, -0.25],
      role: "hinge",
    });
    const X = [s, 0, 0];
    const Y = [0, 0.97, -0.24];
    b.extrude(
      [
        [-0.055, 0],
        [0.055, 0],
        [0.04, 0.12],
        [0, 0.25, "sharp"],
        [-0.035, 0.12],
      ],
      {
        at: [s * 0.055, 1.045, 0.56],
        x: X,
        y: Y,
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        bone: ear,
        color: paint((_p, _n, c) => (c[1] > 0.17 ? RED : "#fff1d8")),
      },
    );
    b.extrude(
      [
        [-0.032, 0.012],
        [0.032, 0.012],
        [0.022, 0.12],
        [0, 0.2, "sharp"],
        [-0.02, 0.12],
      ],
      { at: [s * 0.055, 1.045, 0.56], x: X, y: Y, thickness: 0.02, smoothing: 1, bone: ear, color: "#f2a58f" },
    );
    b.pose(ear, { axis: [0, 0, 1], deg: -s * 14 });
  }

  // face decals
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 42, 6);
    if (hit)
      b.decal(skullSkin, eyeTex, { at: hit, size: [0.042, 0.058], mirror: s > 0, roll: s * 18 });
    const cheekHit = skullSkin.around(HC).at(s * 72, -6);
    if (cheekHit) b.decal(skullSkin, cheek, { at: cheekHit, size: [0.05, 0.04], mirror: s > 0 });
  }
  const foreHit = skullSkin.around(HC).at(0, 62);
  if (foreHit) b.decal(skullSkin, fore, { at: foreHit, size: [0.04, 0.07], up: [0, 0, -1] });
  const cheekCards = skullSkin
    .scatter(36, { rng: R, minDist: 0.025, filter: (h) => Math.abs(h.at.x) > 0.04 && h.at.z < 0.62 })
    .map((h) => h);
  b.cards(cheekCards, tuft, {
    size: [0.05, 0.1],
    lean: 70,
    bend: 20,
    flow: [0, -0.2, -1],
    vary: 0.3,
    spin: 20,
    rng: R,
  });

  // ---- collar, pendant, ruff ----
  const neckSkin = b.surface(neckSweep);
  const collar = neckSkin.loop([0, 0.8, 0.4], { dir: [0, 0.6, 0.5], lift: 0.012 });
  b.sweep(collar, 0.014, { color: GOLD });
  b.along(collar, 9, (at) => {
    b.part(new THREE.SphereGeometry(0.022, 6, 4), RED, { at });
  });
  const front = b.surface([body, neckSweep]);
  const pend = front.nearest([0, 0.76, 0.58]);
  glow(b.stick(new THREE.SphereGeometry(0.03, 8, 6), GOLD, pend, { embed: 0.3 }), 1);
  b.cards([frame(pend.at, [0, 1, 0])], tassel, { size: [0.04, 0.13], lean: 180, flow: [0, 0, 1] });
  const ruff = front.scatter(110, { rng: R, minDist: 0.035, filter: (h) => h.at.z > 0.12 && h.n.y < 0.75 });
  b.cards(ruff, tuft, {
    size: [0.06, 0.12],
    lean: 55,
    bend: 25,
    flow: [0, -1, -0.3],
    vary: 0.3,
    spin: 25,
    rng: R,
  });
  const coatCards = front.scatter(70, { rng: R, minDist: 0.05, filter: (h) => h.at.z < 0.1 && h.n.y > -0.2 });
  b.cards(coatCards, tuft, {
    size: [0.05, 0.1],
    lean: 70,
    bend: 20,
    flow: [0, -0.2, -1],
    vary: 0.3,
    spin: 20,
    rng: R,
  });

  // ---- body decals and orb ----
  for (const s of [1, -1]) {
    b.decal(body, swirl, { at: [s * 0.12, 0.68, -0.05], dir: [s, 0, 0], size: [0.38, 0.3], mirror: s < 0 });
    b.decal(body, swirl, { at: [s * 0.13, 0.72, 0.24], dir: [s, 0, 0], size: [0.18, 0.18], mirror: s > 0 });
  }
  glow(b.part(new THREE.SphereGeometry(0.035, 8, 6), GOLD, { bone: hips, at: [0.125, 0.6, -0.22] }), 1.2);
  b.part(new THREE.TorusGeometry(0.048, 0.006, 5, 12), GOLD, {
    bone: hips,
    at: [0.12, 0.6, -0.22],
    rotation: [0, 0, 90],
  });

  // ---- legs ----
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";

    const fp = limb([s * 0.1, 0.6, 0.28], [s * 0.1, 0.05, 0.33], [0.31, 0.31], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${side}`, fp, {
      parent: spineEnd,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    const fSweep = b.sweep(fLeg, [0.062, 0.05, 0.036, 0.03], { color: LEG, sides: 8 });
    b.decal(fSweep, markRed, { at: [s * 0.1, 0.36, 0.3], dir: [s, 0, 0], size: [0.05, 0.2], mirror: s < 0 });
    const fSkin = b.surface(fSweep);
    b.cards(fSkin.scatter(18, { rng: R, minDist: 0.05, filter: (h) => h.at.y > 0.25 }), tuft, {
      size: [0.05, 0.1],
      lean: 60,
      bend: 20,
      flow: [0, -1, 0],
      vary: 0.3,
      spin: 20,
      rng: R,
    });

    const hp = limb(
      [s * 0.11, 0.62, -0.33],
      [s * 0.11, 0.05, -0.42],
      [0.26, 0.26, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const hSweep = b.sweep(hLeg, [0.1, 0.075, 0.045, 0.032], { color: LEG, sides: 8 });
    b.decal(hSweep, swirl, { at: [s * 0.12, 0.5, -0.33], dir: [s, 0, 0], size: [0.2, 0.22], mirror: s < 0 });
    const hSkin = b.surface(hSweep);
    b.cards(hSkin.scatter(22, { rng: R, minDist: 0.05, filter: (h) => h.at.y > 0.25 }), tuft, {
      size: [0.05, 0.1],
      lean: 60,
      bend: 20,
      flow: [0, -1, 0],
      vary: 0.3,
      spin: 20,
      rng: R,
    });

    for (const [x, z] of [
      [s * 0.1, 0.36],
      [s * 0.11, -0.39],
    ]) {
      b.part(new THREE.SphereGeometry(1, 8, 6), RED, { at: [x, 0.032, z], scale: [0.038, 0.032, 0.06] });
      for (let k = -1; k <= 1; k++)
        b.spike([x + k * 0.022, 0.025, z + 0.05], [0, -0.25, 1], 0.045, 0.008, { color: GOLD });
    }
    for (const [x, y, z] of [
      [s * 0.1, 0.14, 0.32],
      [s * 0.11, 0.14, -0.42],
    ])
      b.part(new THREE.TorusGeometry(0.04, 0.007, 5, 10), GOLD, { at: [x, y, z], rotation: [90, 0, 0] });
  }

  // ---- nine tails ----
  const wisps: Array<{ at: THREE.Vector3 }> = [];
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) * 17 * DEG;
    const e = (14 + 42 * Math.cos(a * 1.1) + (i % 2) * 9) * DEG;
    const d = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e));
    const len = 0.78 + 0.1 * Math.cos(a) + (i % 2) * 0.04;
    const B0 = new THREE.Vector3(Math.sin(a) * 0.05, 0.66, -0.5);
    const P1 = B0.clone().addScaledVector(d, len * 0.36);
    const P2 = B0.clone().addScaledVector(d, len * 0.7);
    P2.y += 0.1;
    const P3 = P2.clone().addScaledVector(d, len * 0.28);
    P3.y += 0.2;
    const path = catmull([B0, P1, P2, P3]);
    const tail = b.chain(`tail${i + 1}`, path, { parent: hips, count: 5, role: "tail" });
    const coat = cel(gradient("#fff3dc", "#cfd4ff", path.at(0.55), path.at(1)));
    const tSweep = b.sweep(tail, [0.04, 0.09, 0.125, 0.115, 0.07, 0.0], { color: coat, sides: 10 });
    const tSkin = b.surface(tSweep);

    const flip = i % 2 === 0 ? 1 : -1;
    for (const [t, ang, tex, w, h] of [
      [0.4, 80 * flip, markRed, 0.08, 0.28],
      [0.64, -80 * flip, markGold, 0.065, 0.22],
      [0.22, -75 * flip, markGold, 0.05, 0.16],
    ] as const) {
      const hit = tSweep.at(t, ang);
      b.decal(tSkin, tex, { at: hit, dir: hit.n, up: hit.tangent, size: [w, h], mirror: ang < 0 });
    }
    b.cards(tSkin.scatter(26, { rng: R, minDist: 0.05 }), tuft, {
      size: [0.07, 0.14],
      lean: 60,
      bend: 25,
      flow: d,
      vary: 0.3,
      spin: 20,
      rng: R,
    });

    // spirit flames at the tip
    const ringItems = b.ring(tail.at(0.93), { count: 5, radius: 0.07, tilt: 35 }).items;
    glow(
      b.cards(ringItems, [flameA, flameB], {
        size: [0.14, 0.3],
        lean: 20,
        bend: 35,
        flow: [0, 1, 0],
        vary: 0.25,
        rng: R,
      }),
      1.3,
    );
    glow(
      b.cards([tail.at(1)], flameA, { size: [0.22, 0.5], flow: [0, 1, 0], bend: 30, cross: true, rng: R }),
      1.4,
    );
    const tip = P3.clone();
    for (let k = 0; k < 3; k++)
      wisps.push({
        at: new THREE.Vector3(tip.x + (R() - 0.5) * 0.3, tip.y + 0.38 + k * 0.12, tip.z + (R() - 0.5) * 0.3),
      });
  }

  // floating embers above the tails and loose spirit-fire around the fox
  glow(
    b.cards(
      wisps.map((w) => frame(w.at, [0, 1, 0])),
      [flameA, flameB],
      { size: [0.06, 0.12], cross: true, flow: [0, 1, 0], bend: 25, vary: 0.3, rng: R },
    ),
    1.3,
  );
  const loose = [
    [-0.55, 0.5, 0.55],
    [0.6, 0.9, 0.5],
    [-0.35, 1.3, 0.35],
    [0.4, 1.2, 0.0],
    [0.8, 0.35, 0.3],
    [-0.75, 0.95, 0.1],
    [0.1, 1.55, -0.3],
    [-0.3, 0.3, 0.9],
  ];
  glow(
    b.cards(
      loose.map((p) => frame(p, [0, 1, 0])),
      [flameA, flameB],
      { size: [0.1, 0.22], cross: true, flow: [0, 1, 0], bend: 30, vary: 0.3, rng: R },
    ),
    1.4,
  );

  return b.root;
}
