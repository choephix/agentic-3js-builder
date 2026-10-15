import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { grain, noise, paint, scales, spots } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: gnarled bark legs, mossy shoulders with bark pauldrons, huge clawed fists, a glowing heartwood sigil, amber eyes and a leafy antler crown, in chunky hand-painted Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "ancientTreant" });
  const R = rng(11);

  // ---------- palette ----------
  const DARK = "#3a2412";
  const BARK_DK = "#4d3019";
  const GOLD = "#d9a441";
  const MOSS = cel("#6cbc3c", "#3f8a3a");
  const IVORY = "#efe3c4";
  const EYE = "#ffc233";

  const barkGrain = cel(grain("#8b5a2b", "#6a4020", { size: 0.06, axis: "y", seed: 2 }), "#3d2417");
  const mossy = (base: ReturnType<typeof cel>, ny: number, seed: number) =>
    paint((p, n) => (n.y > ny && noise(p, 0.3, seed) > 0.47 ? MOSS : base));
  const BODY = mossy(barkGrain, 0.55, 5);
  const SHOULDER = mossy(barkGrain, 0.25, 9);
  const LEG = cel(scales(["#7b4d27", "#8c5a2e", "#6d4322"], "#34200f", { size: 0.2, seed: 3 }), "#34200f");
  const LIMB = mossy(LEG, 0.5, 12);
  const BRANCH = cel(grain("#7a4d26", "#5c3819", { size: 0.04, axis: "y", seed: 4 }), "#35210f");
  const PLATE = cel(scales(["#7e5230", "#93653a"], "#2f1c0e", { size: 0.26, width: 0.03, seed: 8 }), "#3a2312");
  const TOE = cel("#a06a3a", "#5a3a22");

  // ---------- textures ----------
  const leafSvg = (dark: string, light: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 54 C2 40 2 14 20 2 C38 14 38 40 20 54Z" fill="${dark}"/>
        <path d="M20 54 C38 40 38 14 20 2 Z" fill="${light}"/>
        <path d="M20 54 L20 8 M20 40 L9 28 M20 40 L31 28 M20 26 L12 16 M20 26 L28 16" stroke="${vein}" stroke-width="2" fill="none"/>
      </svg>`,
      { size: 128 },
    );
  const LEAF_G = leafSvg("#3f8a2a", "#6cbc3c", "#2a5f1c");
  const LEAF_Y = leafSvg("#c98a1e", "#f0c040", "#8a5a10");
  const MOSS_TEX = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 32 L5 8 L9 32Z M8 32 L14 2 L19 32Z M16 32 L23 10 L26 32Z M22 32 L29 14 L31 32Z" fill="#5fae38"/>
      <path d="M8 32 L14 2 L13 32Z M16 32 L23 10 L20 32Z" fill="#3f8a2a"/>
    </svg>`,
    { size: 96 },
  );
  const VINE = svg(
    `<svg viewBox="0 0 16 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 64 C2 52 14 44 8 32 C3 22 12 12 8 0" stroke="#3f7d2a" stroke-width="3" fill="none"/>
      <ellipse cx="4" cy="48" rx="4" ry="2.5" fill="#5fae38" transform="rotate(-30 4 48)"/>
      <ellipse cx="12" cy="36" rx="4" ry="2.5" fill="#6cbc3c" transform="rotate(30 12 36)"/>
      <ellipse cx="4" cy="24" rx="4" ry="2.5" fill="#5fae38" transform="rotate(-30 4 24)"/>
      <ellipse cx="12" cy="12" rx="4" ry="2.5" fill="#6cbc3c" transform="rotate(30 12 12)"/>
    </svg>`,
    { size: 128 },
  );
  const SIGIL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="27" stroke="#ffb637" stroke-width="3" fill="none"/>
      <circle cx="32" cy="32" r="21" stroke="#ff7a1a" stroke-width="2" fill="none"/>
      <path d="M32 52 L32 22 M32 40 L21 30 M32 40 L43 30 M32 30 L24 20 M32 30 L40 20 M32 22 L32 12" stroke="#ffd35a" stroke-width="3" fill="none"/>
      <circle cx="21" cy="30" r="2.5" fill="#fff0a0"/><circle cx="43" cy="30" r="2.5" fill="#fff0a0"/>
      <circle cx="24" cy="20" r="2.5" fill="#fff0a0"/><circle cx="40" cy="20" r="2.5" fill="#fff0a0"/>
      <circle cx="32" cy="12" r="3" fill="#fff0a0"/>
    </svg>`,
    { size: 192 },
  );

  const leafFrames: ReturnType<typeof frame>[] = [];
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const leg = catmull([
      [s * 0.5, 2.05, 0],
      [s * 0.62, 1.15, 0.18],
      [s * 0.62, 0.4, 0.1],
    ]);
    b.sweep(leg, [0.46, 0.36, 0.27], { color: LEG, sides: 10 });
    b.part(sphere(0.5, 10, 8), LEG, { at: [s * 0.55, 1.75, 0], scale: [1, 0.9, 0.95] });
    b.part(sphere(0.22, 8, 6), BODY, { at: [s * 0.62, 1.15, 0.36], scale: [1, 1, 0.8] });
    b.part(sphere(0.45, 10, 6), TOE, { at: [s * 0.62, 0.22, 0.15], scale: [0.85, 0.5, 1.2] });
    for (let j = 0; j < 3; j++) {
      const x = s * 0.62 + (j - 1) * 0.24;
      b.spike([x, 0.17, 0.4], [x + (j - 1) * 0.12, 0.07, 1.05], null, 0.13, TOE);
      b.spike([x + (j - 1) * 0.12, 0.09, 0.92], [0, 0, 1], 0.2, 0.05, IVORY);
    }
    b.spike([s * 0.6, 0.2, -0.1], [s * 0.6, 0.05, -0.8], null, 0.15, TOE);
    b.spike([s * 0.35, 0.2, -0.05], [s * 0.2, 0.05, -0.65], null, 0.1, TOE);
    // knee wrap + studs
    b.part(new THREE.TorusGeometry(0.34, 0.045, 6, 14), GOLD, { at: leg.at(0.55), dir: [0, 1, 0], axis: "z" });
    // bark ridges on thigh
    for (let k = 0; k < 4; k++) {
      const y = 1.5 + k * 0.18;
      b.spike([s * (0.82 + 0.02 * k), y, 0.15], [s, 0.4, 0.2], 0.2, 0.06, DARK);
    }
  }

  // ---------- pelvis and torso ----------
  b.part(sphere(1, 12, 8), BODY, { at: [0, 2.0, 0], scale: [0.95, 0.55, 0.75] });
  const torsoPath = catmull([
    [0, 1.85, 0],
    [0, 2.5, 0.05],
    [0, 3.15, 0],
  ]);
  const torso = b.sweep(torsoPath, [0.64, 0.88, 0.82], { color: BODY, sides: 12 });
  b.part(sphere(0.46, 10, 8), BODY, { at: [0, 3.3, 0.15] });
  b.part(new THREE.TorusGeometry(0.8, 0.06, 6, 20), GOLD, { at: [0, 2.12, 0.02], rotation: [90, 0, 0], scale: [1, 0.95, 1] });
  b.part(new THREE.TorusGeometry(0.86, 0.04, 6, 20), GOLD, { at: [0, 2.9, 0.03], rotation: [90, 0, 0], scale: [1, 0.95, 1] });
  // belt buckle: heartwood gem
  glow(b.part(new THREE.OctahedronGeometry(0.1, 0), "#ff9a1f", { at: [0, 2.12, 0.86], scale: [1, 1.3, 0.6] }), 1.2);
  b.part(sphere(0.06, 6, 4), GOLD, { at: [0, 2.12, 0.84] });

  // chest sigil (glowing)
  const chestHit = b.surface(torso).around([0, 2.6, 0.05]).at(0, 0);
  if (chestHit) glow(b.decal(torso, SIGIL, { at: chestHit, dir: [0, 0, 1], size: [0.6, 0.6] }), 1.3);

  // knots with faces of old wood
  const surf = b.surface(torso);
  for (const [az, el, y] of [
    [-55, 0, 2.5],
    [60, 0, 2.7],
    [130, 0, 2.4],
    [-140, 0, 2.7],
  ] as const) {
    const hit = surf.around([0, y, 0.05]).at(az, el);
    if (!hit) continue;
    b.stick(sphere(0.17, 7, 4).scale(1, 0.4, 1), "#8a5e36", hit);
    b.stick(sphere(0.1, 7, 4).scale(1, 0.5, 1), INK, hit.moved([0, 0.01, 0]));
  }
  // cracks
  for (const az of [20, -35, 75, -85, 150, -150, 180]) {
    const pts = [0, 1, 2, 3, 4].map((i) => {
      const a = (az + (i % 2 ? 7 : -7)) * DEG;
      return [0.95 * Math.sin(a), 3.0 - i * 0.2, 0.05 + 0.95 * Math.cos(a)];
    });
    b.sweep(surf.drape(catmull(pts), { lift: 0.01 }), 0.02, { color: DARK, caps: "round", sides: 4 });
  }
  // bark shards
  for (const h of surf.scatter(36, { rng: R, minDist: 0.2, filter: (h) => Math.abs(h.n.y) < 0.5 })) {
    b.stick(new THREE.ConeGeometry(0.06, 0.24, 5), BARK_DK, h);
  }
  // shelf fungi
  for (const h of surf.scatter(7, { rng: R, minDist: 0.4, filter: (h) => Math.abs(h.n.y) < 0.4 })) {
    b.stick(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1), "#e0792e", h);
  }
  b.cards(
    surf.scatter(60, { rng: R, minDist: 0.14, filter: (h) => h.n.y > 0.1 }),
    MOSS_TEX,
    { size: [0.13, 0.16], lean: 55, bend: 20, vary: 0.3, rng: R, cross: true },
  );

  // ---------- shoulders, arms, hands ----------
  const rivets = (pts: number[][], r: number) =>
    mergeGeometries(pts.map((p) => sphere(r, 5, 4).translate(p[0], p[1], p[2])));
  for (const s of [1, -1]) {
    const shoulder = b.part(sphere(0.52, 10, 8), SHOULDER, { at: [s * 1.0, 3.1, 0], scale: [1, 0.85, 1] });
    // pauldron plates
    const studs: number[][] = [];
    for (let k = 0; k < 3; k++) {
      const x = s * (1.12 + 0.18 * k);
      const y = 3.5 - 0.24 * k;
      b.part(new THREE.BoxGeometry(0.78 - 0.1 * k, 0.12, 0.7 - 0.1 * k), PLATE, {
        at: [x, y, 0],
        rotation: [0, 0, -s * (22 + 10 * k)],
      });
      b.part(new THREE.BoxGeometry(0.8 - 0.1 * k, 0.04, 0.72 - 0.1 * k), GOLD, {
        at: [x + s * 0.01, y - 0.07, 0],
        rotation: [0, 0, -s * (22 + 10 * k)],
      });
      studs.push([x, y + 0.08, 0.2], [x, y + 0.08, -0.2]);
    }
    b.part(rivets(studs, 0.03), GOLD, { at: [0, 0, 0] });
    // thorns
    for (const d of [
      [s * 0.6, 0.8, -0.5],
      [s * 0.3, 0.9, -0.7],
      [s * 0.9, 0.5, 0.5],
      [s * 0.8, 0.6, -0.1],
    ]) {
      const dv = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      b.spike([s * 1.0 + dv.x * 0.4, 3.1 + dv.y * 0.4, dv.z * 0.4], [dv.x, dv.y, dv.z], 0.5, 0.1, BARK_DK);
    }
    if (s < 0) {
      // bird nest with eggs
      b.part(new THREE.TorusGeometry(0.22, 0.07, 6, 12), "#8a6a3a", { at: [-0.7, 3.52, 0.12], rotation: [90, 0, 0] });
      b.part(sphere(0.2, 8, 4), "#5a4020", { at: [-0.7, 3.5, 0.12], scale: [1, 0.35, 1] });
      for (const [ex, ez] of [
        [-0.64, 0.1],
        [-0.76, 0.15],
        [-0.71, 0.05],
      ]) {
        b.part(sphere(0.07, 6, 5), "#7fd0d8", { at: [ex, 3.6, ez], scale: [1, 1.3, 1] });
      }
    } else {
      mush(s * 0.8, 3.45, 0.2, 0.13, 0.04);
      mush(s * 0.7, 3.5, -0.15, 0.09, -0.03);
    }

    const arm = catmull([
      [s * 1.0, 3.1, 0],
      [s * 1.6, 2.3, 0],
      [s * 1.55, 1.4, 0.6],
    ]);
    const armSw = b.sweep(arm, [0.44, 0.38, 0.32], { color: LIMB, sides: 10 });
    b.part(sphere(0.34, 8, 6), LIMB, { at: [s * 1.6, 2.3, -0.1] });
    for (const t of [0.3, 0.88]) {
      const tan = arm.tangentAt(t);
      b.part(new THREE.TorusGeometry(t < 0.5 ? 0.43 : 0.35, 0.055, 6, 14), GOLD, {
        at: arm.at(t),
        dir: [tan.x, tan.y, tan.z],
        axis: "z",
      });
    }
    b.cards(
      b.surface(armSw).scatter(30, { rng: R, minDist: 0.12, filter: (h) => h.n.y > 0.2 }),
      MOSS_TEX,
      { size: [0.12, 0.15], lean: 55, bend: 20, vary: 0.3, rng: R, cross: true },
    );
    // vines
    const vf = [0.12, 0.25, 0.4, 0.55].map((t) => {
      const p = arm.at(t);
      return frame([p.x + s * 0.36, p.y, p.z + 0.05], [0, 1, 0]);
    });
    b.cards(vf, VINE, { size: [0.1, 0.55], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R, cross: true });

    // fist
    const H = [s * 1.55, 1.1, 0.8];
    b.part(sphere(0.4, 10, 8), LIMB, { at: H, scale: [1, 0.85, 1] });
    for (let i = 0; i < 4; i++) {
      const base = [H[0] + (i - 1.5) * 0.15, H[1] + 0.08, H[2] + 0.2];
      const pts = [base, [base[0], base[1] - 0.12, base[2] + 0.28], [base[0], base[1] - 0.38, base[2] + 0.36], [base[0], base[1] - 0.52, base[2] + 0.2]];
      b.sweep(catmull(pts), [0.11, 0.025], { color: TOE, sides: 6, caps: "point" });
      b.part(sphere(0.1, 6, 4), BARK_DK, { at: pts[1] });
      b.spike(pts[3], [0, -0.4, -0.5], 0.09, 0.035, IVORY, { sides: 5 });
    }
    b.sweep(
      catmull([
        [H[0] - s * 0.3, H[1] + 0.05, H[2] + 0.1],
        [H[0] - s * 0.5, H[1] - 0.1, H[2] + 0.3],
        [H[0] - s * 0.5, H[1] - 0.35, H[2] + 0.45],
      ]),
      [0.13, 0.03],
      { color: TOE, sides: 6, caps: "point" },
    );
    // fist moss
    b.cards(
      [0, 1, 2].map((i) => frame([H[0] + (i - 1) * 0.15, H[1] + 0.3, H[2] - 0.05], [0, 1, 0])),
      MOSS_TEX,
      { size: [0.14, 0.17], lean: 30, vary: 0.3, rng: R, cross: true },
    );
  }

  // ---------- head ----------
  const HC = [0, 3.85, 0.25];
  const skull = b.part(sphere(1, 14, 10), BODY, { at: HC, scale: [0.5, 0.48, 0.5] });
  b.part(sphere(0.3, 8, 6), BODY, { at: [0, 3.5, 0.5], scale: [1, 0.7, 0.9] }); // chin
  for (const s of [1, -1]) {
    b.part(sphere(0.16, 6, 5), BODY, { at: [s * 0.3, 3.74, 0.52] }); // cheekbone
    b.part(sphere(0.12, 8, 6), INK, { at: [s * 0.2, 3.92, 0.64] }); // socket
    glow(b.part(sphere(0.075, 8, 6), EYE, { at: [s * 0.2, 3.92, 0.69] }), 1.6);
    b.capsule([s * 0.4, 4.13, 0.55], [s * 0.08, 3.99, 0.74], 0.075, { color: BARK_DK });
    b.capsule([s * 0.45, 4.2, 0.4], [s * 0.2, 4.1, 0.65], 0.045, { color: DARK });
    b.spike([s * 0.2, 3.5, 0.62], [0, 1, 0.3], 0.24, 0.05, IVORY, { sides: 6 });
    b.spike([s * 0.52, 3.9, 0.2], [s, 0.2, -0.2], 0.3, 0.09, BARK_DK, { sides: 6 }); // ear thorns
  }
  b.spike([0, 3.82, 0.66], [0, -0.25, 1], 0.38, 0.11, BODY, { sides: 6 });
  b.sweep(
    catmull([
      [-0.26, 3.6, 0.52],
      [-0.12, 3.54, 0.66],
      [0.12, 3.54, 0.66],
      [0.26, 3.6, 0.52],
    ]),
    0.027,
    { color: INK, sides: 5 },
  );
  // forehead furrows
  for (const y of [4.22, 4.3]) {
    b.sweep(
      catmull([
        [-0.2, y, 0.62 - (y - 4.22) * 0.8],
        [0, y + 0.02, 0.68 - (y - 4.22) * 0.8],
        [0.2, y, 0.62 - (y - 4.22) * 0.8],
      ]),
      0.015,
      { color: DARK, sides: 4 },
    );
  }
  // beard roots and moss
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.12;
    b.sweep(
      catmull([
        [x, 3.45, 0.6 - Math.abs(x) * 0.5],
        [x * 1.3, 3.2, 0.82 - Math.abs(x) * 0.4],
        [x * 1.5, 2.95 - (i % 2) * 0.15, 0.9 - Math.abs(x) * 0.3],
      ]),
      [0.07, 0.015],
      { color: TOE, sides: 5, caps: "point" },
    );
  }
  b.cards(
    b.surface(skull).scatter(50, { rng: R, minDist: 0.12, filter: (h) => h.n.y > 0.3 }),
    [LEAF_G, MOSS_TEX],
    { size: [0.13, 0.17], lean: 45, vary: 0.3, rng: R, cross: true },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.55;
    b.spike([Math.sin(a) * 0.38, 4.2, 0.25 - Math.cos(a) * 0.1], [Math.sin(a) * 0.4, 1, -0.2], 0.3, 0.07, BARK_DK, { sides: 6 });
  }

  // ---------- mushrooms ----------
  function mush(x: number, y: number, z: number, r: number, tilt: number) {
    b.rod([x, y, z], [x + tilt, y + r * 1.4, z], r * 0.35, IVORY, { sides: 6 });
    b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAP, {
      at: [x + tilt, y + r * 1.35, z],
      scale: [1, 0.7, 1],
    });
  }
  const CAP = spots("#d9442b", "#fff0d4", { size: 0.05, amount: 0.5, seed: 3 });
  mush(0.6, 1.42, 0.4, 0.09, 0.01);
  mush(-0.6, 0.43, 0.35, 0.08, 0.01);
  mush(-1.3, 3.55, -0.15, 0.1, -0.02);

  // ---------- branches / crown ----------
  const branch = (pts: number[][], r0: number, twigs: Array<[number, number[]]>, leaves: number) => {
    const P = catmull(pts);
    b.sweep(P, [r0, r0 * 0.2], { color: BRANCH, sides: 7, caps: "point" });
    const all: ReturnType<typeof catmull>[] = [P];
    for (const [t, d] of twigs) {
      const p = P.at(t);
      const T = catmull([[p.x, p.y, p.z], [p.x + d[0] * 0.5, p.y + d[1] * 0.5 + 0.08, p.z + d[2] * 0.5], [p.x + d[0], p.y + d[1], p.z + d[2]]]);
      b.sweep(T, [r0 * 0.5, r0 * 0.12], { color: BRANCH, sides: 6, caps: "point" });
      all.push(T);
    }
    for (const Q of all) {
      for (let i = 0; i < leaves; i++) {
        const t = 0.4 + (0.6 * i) / Math.max(1, leaves - 1);
        const p = Q.at(t);
        const tg = Q.tangentAt(t);
        leafFrames.push(frame([p.x, p.y, p.z], [tg.x + (R() - 0.5) * 0.9, tg.y + R() * 0.7 + 0.1, tg.z + (R() - 0.5) * 0.9]));
      }
    }
    const tip = P.at(1);
    b.part(new THREE.IcosahedronGeometry(r0 * 2.2, 0), R() > 0.5 ? "#3f8a2a" : "#58a832", {
      at: [tip.x, tip.y + r0, tip.z],
      scale: [1, 0.8, 1],
    });
  };
  for (const s of [1, -1]) {
    branch(
      [[s * 0.6, 3.5, -0.3], [s * 1.0, 4.4, -0.4], [s * 1.3, 5.2, -0.2]],
      0.2,
      [[0.55, [s * 0.5, 0.5, 0.3]], [0.8, [s * 0.4, 0.4, -0.4]]],
      5,
    );
    branch(
      [[s * 0.3, 3.7, -0.1], [s * 0.45, 4.6, -0.1], [s * 0.25, 5.4, 0.05]],
      0.17,
      [[0.55, [s * 0.5, 0.5, 0.2]], [0.75, [-s * 0.3, 0.5, 0.3]]],
      5,
    );
    branch(
      [[s * 1.1, 3.4, -0.25], [s * 1.7, 3.95, -0.3], [s * 2.05, 4.7, -0.1]],
      0.16,
      [[0.5, [s * 0.4, 0.6, -0.3]], [0.75, [s * 0.5, 0.3, 0.4]]],
      4,
    );
  }
  branch(
    [[0, 3.5, -0.4], [0.1, 4.5, -0.7], [0, 5.3, -0.5]],
    0.2,
    [[0.5, [0.5, 0.4, -0.2]], [0.7, [-0.5, 0.4, -0.2]]],
    5,
  );
  b.cards(leafFrames, [LEAF_G, LEAF_G, LEAF_Y], {
    size: [0.26, 0.34],
    lean: 35,
    bend: 15,
    vary: 0.3,
    spin: 180,
    rng: R,
    cross: true,
  });

  return b.root;
}
