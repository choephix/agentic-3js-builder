import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { countershade, grain, noise, paint, scales } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: mossy gnarled bark, huge root-fingered hands, bronze bracers and belt, glowing amber eyes and rune, antler-branch crown with painted leaf cards.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const MOSS = "#5d9a2c";
const BRONZE = "#b0782c";
const AMBER = "#ffb21a";
const DARKWOOD = "#2f1d0f";

const LEAF = svg(
  `<svg viewBox="0 0 32 48"><path d="M16 46 C2 34 2 14 16 2 C30 14 30 34 16 46Z" fill="#3f8a22"/><path d="M16 46 C4 30 5 16 16 2 C12 16 12 32 16 46Z" fill="#74c63c"/><path d="M16 46 L16 8" stroke="#245d14" stroke-width="2"/><path d="M16 34 L8 26 M16 26 L24 18 M16 20 L9 14" stroke="#245d14" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);
const LEAF_GOLD = svg(
  `<svg viewBox="0 0 32 48"><path d="M16 46 C2 34 2 14 16 2 C30 14 30 34 16 46Z" fill="#d9962a"/><path d="M16 46 C4 30 5 16 16 2 C12 16 12 32 16 46Z" fill="#f2c94a"/><path d="M16 46 L16 8" stroke="#8a4f12" stroke-width="2"/><path d="M16 34 L8 26 M16 26 L24 18" stroke="#8a4f12" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);
const STRAND = svg(
  `<svg viewBox="0 0 16 48"><path d="M8 46 C0 32 2 12 8 2 C14 12 16 32 8 46Z" fill="#6aa83a"/><path d="M8 46 C4 30 5 14 8 4 C9 16 9 32 8 46Z" fill="#9fd464"/></svg>`,
  { size: 96 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ffb21a" stroke-width="3.5"/><circle cx="32" cy="32" r="21" fill="none" stroke="#ffd36a" stroke-width="2.5"/><path d="M32 12 L32 52 M32 32 L18 20 M32 32 L46 20 M32 42 L22 50 M32 42 L42 50" stroke="#ffb21a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
  { size: 256 },
);

type P3 = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "ancientTreant" });
  const R = rng(11);

  const BARK = grain("#7c5330", "#4b2f18", { size: 0.06, seed: 3 });
  const MOSSY = paint((p, n) => {
    const m = noise(p, 0.32, 7) + n.y * 0.5;
    if (m > 0.95) return "#76b83a";
    if (m > 0.78) return MOSS;
    return p.y < 0.9 ? "#3f2a16" : BARK;
  });
  const TORSO = countershade(MOSSY, "#3a2512", { level: -0.35, soft: 0.3 });
  const LIMB = scales(grain("#80583a", "#553620", { size: 0.05, seed: 5 }), "#2c1a0c", { size: 0.24, width: 0.04, seed: 9 });
  const HEADP = countershade(MOSSY, "#4a2f18", { level: -0.2 });

  const ball = (r: number, c: P3, color: string | ReturnType<typeof paint>, sc: P3 = [1, 1, 1], w = 8, h = 6) =>
    b.part(new THREE.SphereGeometry(r, w, h), color, { at: c, scale: sc });

  const leafy = (target: Parameters<typeof b.surface>[0], count: number, tex: typeof LEAF, size: [number, number], dist = 0.13) => {
    const hits = b.surface(target).scatter(count, { rng: R, minDist: dist, filter: (h) => h.n.y > -0.3 });
    b.cards(hits, tex, { size, lean: 55, bend: 25, vary: 0.35, spin: 40, rng: R, cross: true });
  };

  // ---------- legs & feet ----------
  for (const s of [1, -1]) {
    const leg = b.sweep(
      catmull([
        [s * 0.45, 2.1, 0],
        [s * 0.62, 1.15, 0.2],
        [s * 0.55, 0.38, 0.1],
      ]),
      [0.44, 0.34, 0.27],
      { color: LIMB, sides: 8, caps: "round" },
    );
    ball(0.32, [s * 0.66, 1.15, 0.42], MOSSY, [1, 1, 0.8]);
    ball(1, [s * 0.55, 0.22, 0.3], LIMB, [0.44, 0.22, 0.62]);
    for (const dx of [-0.5, 0, 0.5]) {
      const x = s * 0.55 + dx * 0.4;
      b.capsule([x, 0.14, 0.55], [s * 0.55 + dx * 0.9, 0.14, 1.1], [0.14, 0.1], { color: LIMB, sides: 6 });
      b.spike([s * 0.55 + dx * 0.9, 0.13, 1.1], [dx * 0.4, -0.05, 1], 0.2, 0.08, "#d8c28c", { sides: 5 });
    }
    // heel roots spilling back
    b.sweep(
      catmull([
        [s * 0.5, 0.35, -0.1],
        [s * 0.8, 0.14, -0.5],
        [s * 1.1, 0.1, -0.9],
      ]),
      [0.13, 0.04],
      { color: LIMB, sides: 6 },
    );
    leafy(leg, 6, LEAF, [0.14, 0.2], 0.3);
    // bronze greave rings
    for (const y of [0.78, 0.62]) {
      b.rod([s * 0.58, y, 0.15], [s * 0.58, y + 0.07, 0.15], 0.32 - (y - 0.62) * 0.1, BRONZE, { sides: 10 });
    }
  }

  // ---------- pelvis & torso ----------
  ball(0.62, [0, 1.95, 0], TORSO, [1.1, 0.8, 1], 10, 6);
  const torso = b.sweep(
    catmull([
      [0, 1.8, 0],
      [0, 2.5, 0.04],
      [0, 3.3, 0.08],
    ]),
    [0.62, 0.86, 0.72],
    { color: TORSO, sides: 10, caps: "round" },
  );
  // belt
  const ringPts = (y: number, r: number): number[][] => {
    const out: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      out.push([Math.sin(a) * r, y, 0.01 + Math.cos(a) * r]);
    }
    return out;
  };
  b.sweep(catmull(ringPts(2.02, 0.7), { closed: true }), 0.07, { color: BRONZE, sides: 6 });
  b.sweep(catmull(ringPts(1.9, 0.67), { closed: true }), 0.045, { color: "#5a3a18", sides: 6 });
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.08), BRONZE, { at: [0, 2.0, 0.74] });
  glow(ball(0.065, [0, 2.0, 0.8], AMBER, [1, 1, 0.7], 6, 4), 1.6);
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 9) * 2.2;
    ball(0.025, [Math.sin(a) * 0.71, 2.02, 0.01 + Math.cos(a) * 0.71], "#d9a04a", [1, 1, 1], 5, 4);
  }
  // hanging belt tassels of root
  for (const x of [-0.35, -0.2, 0.2, 0.35]) {
    b.sweep(
      catmull([
        [x, 1.95, 0.7 - Math.abs(x) * 0.2],
        [x * 1.1, 1.6, 0.76 - Math.abs(x) * 0.2],
        [x * 1.2, 1.3, 0.72 - Math.abs(x) * 0.2],
      ]),
      [0.05, 0.02],
      { color: "#5a3a18", sides: 5 },
    );
  }
  // chest rune
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [0, 2.75, 0.96], dir: [0, 0, 1], axis: "z", texture: RUNE }), 1.4);
  ball(0.34, [0, 2.75, 0.84], "#3a2512", [1.2, 1.2, 0.35]);

  // bark stubs, moss mounds, bracket fungi on the trunk
  const tsurf = b.surface(torso);
  for (const hit of tsurf.scatter(14, { rng: R, minDist: 0.32, filter: (h) => h.n.y > -0.3 && h.n.z > -0.2 })) {
    b.stick(new THREE.ConeGeometry(0.07, 0.26, 5), "#3a2412", hit);
  }
  for (const hit of tsurf.scatter(12, { rng: R, minDist: 0.4, filter: (h) => h.n.y > 0.2 })) {
    b.stick(new THREE.SphereGeometry(0.22, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1), "#68a932", hit);
  }
  for (const hit of tsurf.scatter(5, { rng: R, minDist: 0.6, filter: (h) => Math.abs(h.n.y) < 0.5 && h.n.z < 0.3 })) {
    b.stick(new THREE.SphereGeometry(0.24, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35, 1), "#d9822b", hit);
    b.stick(new THREE.SphereGeometry(0.15, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1), "#f0b25a", hit);
  }
  leafy(torso, 14, LEAF, [0.16, 0.22], 0.3);

  // ---------- arms & hands ----------
  for (const s of [1, -1]) {
    ball(0.52, [s * 1.0, 3.1, 0], MOSSY, [1, 0.9, 1], 10, 7);
    ball(0.3, [s * 1.1, 3.4, -0.05], "#68a932", [1.2, 0.5, 1], 7, 4);
    const armPath = catmull([
      [s * 1.0, 3.05, 0],
      [s * 1.45, 2.4, 0.15],
      [s * 1.52, 1.65, 0.5],
    ]);
    const arm = b.sweep(armPath, [0.36, 0.3, 0.26], { color: LIMB, sides: 8, caps: "round" });
    // bracer
    b.rod(armPath.at(0.7), armPath.at(0.9), 0.31, BRONZE, { sides: 10 });
    b.rod(armPath.at(0.68), armPath.at(0.71), 0.335, "#8a5a1e", { sides: 10 });
    b.rod(armPath.at(0.89), armPath.at(0.92), 0.325, "#8a5a1e", { sides: 10 });
    for (let i = 0; i < 4; i++) {
      const a = armPath.at(0.74 + i * 0.045);
      ball(0.025, [a.x + s * 0.03, a.y, a.z + 0.3], "#e6c07a", [1, 1, 1], 5, 4);
    }
    // elbow burl & shelf fungus
    ball(0.22, [s * 1.62, 2.35, 0.12], MOSSY, [1, 1, 1], 7, 5);
    b.stick(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1), "#d9822b", b.surface(arm).around([s * 1.45, 2.4, 0.15]).at(s * 90, 20)!);
    leafy(arm, 8, LEAF, [0.14, 0.2], 0.3);
    // huge palm and root fingers
    ball(0.4, [s * 1.52, 1.4, 0.62], LIMB, [1.1, 1.0, 0.85], 9, 6);
    for (let i = 0; i < 4; i++) {
      const x = s * 1.52 + (i - 1.5) * s * 0.17;
      const f = b.sweep(
        catmull([
          [x, 1.25, 0.72],
          [x, 0.95, 1.0 + (i === 1 || i === 2 ? 0.08 : 0)],
          [x, 0.62, 1.04],
        ]),
        [0.1, 0.05],
        { color: LIMB, sides: 6, caps: "round" },
      );
      b.spike([x, 0.62, 1.04], [0, -0.7, 0.5], 0.17, 0.05, "#d8c28c", { sides: 5 });
      if (i === 0) leafy(f, 2, LEAF, [0.1, 0.14], 0.1);
    }
    b.sweep(
      catmull([
        [s * 1.2, 1.4, 0.7],
        [s * 1.06, 1.2, 0.95],
        [s * 1.0, 0.95, 1.1],
      ]),
      [0.1, 0.055],
      { color: LIMB, sides: 6 },
    );
  }

  // ---------- neck & head ----------
  b.rod([0, 3.2, 0.1], [0, 3.55, 0.2], [0.48, 0.42], MOSSY, { sides: 8 });
  const head = ball(1, [0, 3.78, 0.3], HEADP, [0.56, 0.6, 0.56], 10, 8);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.36, 0.14, 0.24), BARK, { at: [s * 0.2, 3.96, 0.72], rotation: [0, 0, -s * 14] });
    ball(0.1, [s * 0.2, 3.82, 0.77], DARKWOOD, [1.4, 1.0, 0.6], 6, 4);
    glow(ball(0.065, [s * 0.2, 3.82, 0.8], AMBER, [1.3, 0.75, 0.6], 6, 4), 1.8);
    ball(0.14, [s * 0.6, 3.8, 0.28], MOSSY, [0.5, 1.1, 0.8], 6, 4); // ears/burls
    b.spike([s * 0.2, 3.44, 0.76], [s * 0.1, 1, 0.45], 0.28, 0.06, "#e6d8b0", { sides: 5 });
    b.sweep(
      catmull([
        [s * 0.3, 4.02, 0.6],
        [s * 0.5, 4.0, 0.45],
      ]),
      [0.04, 0.03],
      { color: "#3a2412", sides: 5 },
    );
  }
  b.spike([0, 3.76, 0.8], [0, -0.35, 1], 0.36, 0.11, BARK, { sides: 6 });
  b.sweep(
    catmull([
      [-0.2, 3.47, 0.68],
      [0, 3.44, 0.76],
      [0.2, 3.47, 0.68],
    ]),
    0.03,
    { color: "#1a0f08", sides: 5 },
  );
  // bark ridge lines across forehead
  for (const y of [4.08, 4.16]) {
    b.sweep(
      catmull([
        [-0.25, y, 0.58 - (y - 4.08) * 1.5],
        [0, y + 0.02, 0.66 - (y - 4.08) * 1.5],
        [0.25, y, 0.58 - (y - 4.08) * 1.5],
      ]),
      0.022,
      { color: DARKWOOD, sides: 5 },
    );
  }
  leafy(head, 14, LEAF_GOLD, [0.14, 0.2], 0.16);

  // beard of roots and moss
  for (const x of [-0.3, -0.15, 0, 0.15, 0.3]) {
    const z = 0.7 - Math.abs(x) * 0.5;
    b.sweep(
      catmull([
        [x, 3.4, z],
        [x * 1.2, 3.0, z + 0.12],
        [x * 1.5, 2.65 - Math.abs(x) * 0.3, z + 0.1],
      ]),
      [0.07, 0.025],
      { color: BARK, sides: 5 },
    );
  }
  b.cards(
    [-0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36].map((x) => frame([x, 3.4, 0.7 - Math.abs(x) * 0.5], [0, 1, 0])),
    STRAND,
    { size: [0.13, 0.45], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R },
  );

  // ---------- antler-branch crown ----------
  const limbs: Array<{ pts: number[][]; r: [number, number]; sub: number }> = [];
  for (const s of [1, -1]) {
    limbs.push({
      pts: [
        [s * 0.35, 4.2, 0.1],
        [s * 0.8, 4.9, 0.05],
        [s * 1.1, 5.6, -0.05],
        [s * 0.8, 6.2, -0.15],
      ],
      r: [0.15, 0.04],
      sub: 4,
    });
    limbs.push({
      pts: [
        [s * 0.7, 3.5, -0.5],
        [s * 1.3, 4.3, -0.8],
        [s * 1.9, 5.0, -0.7],
        [s * 2.2, 5.6, -0.5],
      ],
      r: [0.2, 0.05],
      sub: 3,
    });
    limbs.push({
      pts: [
        [s * 0.3, 3.5, -0.6],
        [s * 0.4, 4.4, -0.9],
        [s * 0.3, 5.3, -1.0],
      ],
      r: [0.18, 0.05],
      sub: 3,
    });
  }
  for (const l of limbs) {
    const path = catmull(l.pts);
    const main = b.sweep(path, l.r, { color: BARK, sides: 6, caps: "round" });
    const mats = [LEAF, LEAF_GOLD];
    leafy(main, 12, mats[Math.floor(R() * 2)], [0.24, 0.32], 0.2);
    for (let k = 0; k < l.sub; k++) {
      const t = 0.3 + (0.6 * k) / Math.max(1, l.sub - 1);
      const base = path.at(t);
      const side = k % 2 ? 1 : -1;
      const tip: P3 = [base.x + side * 0.55, base.y + 0.35 + R() * 0.25, base.z + (R() - 0.5) * 0.6];
      const midp: P3 = [base.x + side * 0.25, base.y + 0.12, base.z + (tip[2] - base.z) * 0.4];
      const sb = b.sweep(catmull([[base.x, base.y, base.z], midp, tip]), [0.07, 0.02], { color: BARK, sides: 5 });
      leafy(sb, 7, mats[(k + 1) % 2], [0.22, 0.3], 0.14);
      b.cards([frame(tip, [0, 1, 0])], mats[k % 2], { size: [0.26, 0.34], lean: 20, vary: 0.2, rng: R, cross: true });
    }
    b.cards([frame(path.at(1), [0, 1, 0])], LEAF, { size: [0.3, 0.4], lean: 10, cross: true });
  }

  // ---------- trailing vines and root tendrils off the back ----------
  for (const s of [1, -1]) {
    for (const k of [0, 1]) {
      const x = s * (0.45 + k * 0.4);
      const v = b.sweep(
        catmull([
          [x, 3.2 - k * 0.3, -0.7],
          [x * 1.1, 2.6 - k * 0.3, -0.9],
          [x * 1.2, 1.9 - k * 0.4, -0.8],
        ]),
        [0.07, 0.025],
        { color: "#4a3a1a", sides: 5 },
      );
      leafy(v, 5, LEAF, [0.1, 0.15], 0.15);
    }
  }
  // back of the trunk: burl knots and fungus tiers
  ball(0.3, [0.2, 2.6, -0.8], MOSSY, [1, 1, 0.7], 7, 5);
  ball(0.22, [-0.35, 2.3, -0.72], MOSSY, [1, 1, 0.7], 7, 5);

  return b.root;
}
