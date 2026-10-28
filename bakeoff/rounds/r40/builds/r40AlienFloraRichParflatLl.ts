import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";

export const meta = {
  "name": "Sporeglow Hometree Bloom",
  "description": "An Avatar-style Pandora bioluminescent plant: a twisting trunk with glowing fan-leaf fronds, a giant helicoid spiral-flower, drooping tendrils and a root-and-mushroom base."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  trunkDark: "#1d1a3a",
  trunkMid: "#2d2a5c",
  bark: "#3b3470",
  rootMoss: "#1f5a63",
  leafBlue: "#1e4f9a",
  leafTeal: "#18857f",
  leafEdge: "#0f2f5e",
  glowCyan: "#33f5ff",
  glowTeal: "#2cffc0",
  glowMagenta: "#ff4fd8",
  glowViolet: "#a06bff",
  glowPale: "#d8fdff",
  petalPink: "#d65cff",
  petalDeep: "#6a2fb8",
  stamen: "#fff27a",
  dirt: "#14122a",
};
const M = {
  rootBase: [0, 0, 0] as [number, number, number],
  trunkBase: [0, 0.45, 0] as [number, number, number],
  trunkMid: [0.12, 1.2, -0.05] as [number, number, number],
  crown: [0, 2.05, 0] as [number, number, number],
  flowerBase: [0, 2.1, 0] as [number, number, number],
  flowerTop: [0, 3.15, 0] as [number, number, number],
  frondRing: [0, 2, 0] as [number, number, number],
  tendrilRing: [0, 1.9, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // baseRoots
  (() => {
function buildBaseRoots({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const bone = J.root;
  const MOSS = P.rootMoss;

  // dirt disc
  b.part(new THREE.CylinderGeometry(1.2, 1.28, 0.06, 14), P.dirt, { bone, at: [0, 0.02, 0] });
  // central foot of trunk
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.5, 9), P.trunkDark, { bone, at: [0, 0.27, 0] });
  b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.14, 9), P.bark, { bone, at: [0, 0.5, 0] });

  const root: THREE.Vector3[] = [];
  const N = 7;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.2;
    const len = 1.0 + r() * 0.22;
    const dx = Math.sin(a), dz = Math.cos(a);
    const pts = [
      [dx * 0.2, 0.5, dz * 0.2],
      [dx * len * 0.35, 0.36, dz * len * 0.35],
      [dx * len * 0.7, 0.14, dz * len * 0.7],
      [dx * len, 0.03, dz * len],
    ];
    const col = i % 2 ? P.bark : P.trunkDark;
    const sw = b.sweep(pts, [0.2, 0.06], {
      bone,
      color: col,
      section: { ngon: 6 },
      caps: "round",
    });
    // moss on top
    for (const t of [0.3, 0.55, 0.8]) {
      const h = sw.at(t, 0);
      b.stick(new THREE.CylinderGeometry(0.07 - t * 0.03, 0.08 - t * 0.03, 0.025, 6), MOSS, h, { embed: 0.3, bone });
    }
    // glowing vein
    const vein = b.sweep(
      [0.3, 0.55, 0.8, 0.95].map((t) => {
        const h = sw.at(t, 0, 0.012);
        return [h.at.x, h.at.y, h.at.z];
      }),
      0.012,
      { bone, color: P.glowCyan, sides: 5 },
    );
    glow(vein, 1.3);
    // node dots
    for (const t of [0.4, 0.7]) {
      const h = sw.at(t, 0, 0.01);
      glow(b.stick(new THREE.SphereGeometry(0.025, 6, 4), P.glowPale, h, { bone }), 1.5);
    }
  }

  // mushrooms and sprouts between roots
  const caps = [P.glowTeal, P.glowMagenta, P.glowViolet];
  for (let i = 0; i < 14; i++) {
    const a = ((i + 0.5) / 14) * Math.PI * 2 + r() * 0.2;
    const d = 0.55 + r() * 0.6;
    const x = Math.sin(a) * d, z = Math.cos(a) * d;
    const s = 0.6 + r() * 0.7;
    if (i % 3 === 2) {
      const c = i % 2 ? P.glowPale : P.glowTeal;
      glow(b.part(new THREE.ConeGeometry(0.03 * s, 0.2 * s, 5), c, { bone, at: [x, 0.08 * s + 0.03, z] }), 1.3);
      glow(b.part(new THREE.SphereGeometry(0.025 * s, 5, 4), P.glowMagenta, { bone, at: [x, 0.2 * s + 0.04, z] }), 1.6);
    } else {
      b.part(new THREE.CylinderGeometry(0.02 * s, 0.03 * s, 0.14 * s, 5), P.glowPale, { bone, at: [x, 0.07 * s + 0.03, z] });
      const col = caps[i % 3];
      glow(
        b.part(new THREE.SphereGeometry(0.09 * s, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), col, {
          bone,
          at: [x, 0.14 * s + 0.03, z],
        }),
        1.2,
      );
      for (let k = 0; k < 3; k++) {
        const ka = k * 2.1;
        glow(
          b.part(new THREE.SphereGeometry(0.012 * s, 4, 3), P.glowPale, {
            bone,
            at: [x + Math.sin(ka) * 0.05 * s, 0.14 * s + 0.03 + 0.06 * s, z + Math.cos(ka) * 0.05 * s],
          }),
          1.6,
        );
      }
    }
  }
  // moss patches on ground
  for (let i = 0; i < 6; i++) {
    const a = r() * 6.28, d = 0.5 + r() * 0.6;
    b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 6), MOSS, { bone, at: [Math.sin(a) * d, 0.06, Math.cos(a) * d] });
  }
}
    return buildBaseRoots;
  })(),
  // trunk
  (() => {
function buildTrunk({ b, J, P, M }: any) {
  const R = rng(11);
  const g = glowKit ?? glow;
  const pts: number[][] = [
    [0, 0.4, 0],
    [0.06, 0.8, 0.04],
    [0.12, 1.2, -0.05],
    [0.05, 1.65, 0.04],
    [0, 2.05, 0],
  ];
  const path = catmull(pts);
  const radius = (t: number) => {
    const base = 0.38 - 0.18 * t;
    const swell = 0.08 * Math.exp(-Math.pow((t - 1) / 0.1, 2));
    return base + swell;
  };
  const trunk = b.sweep(path, radius, {
    bone: [J.trunk1, J.trunk2, J.crown],
    section: { ngon: 8 },
    color: P.trunkMid,
    sectors: [[-70, 70, P.bark], [140, 220, P.trunkDark]],
  });

  // ring bands
  const bandTs = [0.12, 0.3, 0.5, 0.7, 0.88];
  bandTs.forEach((t, i) => {
    const p = path.at(t);
    const r = radius(t);
    b.part(new THREE.CylinderGeometry(r * 1.06, r * 1.1, 0.04, 8), i % 2 ? P.bark : P.trunkDark, {
      at: p, bone: t < 0.4 ? J.trunk1 : t < 0.8 ? J.trunk2 : J.crown,
    });
  });

  // spiral glowing vein: dots winding up
  for (let i = 0; i < 40; i++) {
    const t = 0.05 + (i / 40) * 0.88;
    const ang = i * 0.55;
    const p = trunk.at(t, (ang * 180 / Math.PI) % 360);
    const col = i % 3 === 0 ? P.glowViolet : P.glowCyan;
    g(b.stick(new THREE.SphereGeometry(0.02 + 0.006 * (i % 2), 6, 4), col, p, { embed: 0.3 }), 1.4);
  }

  // bark ridges
  for (let i = 0; i < 12; i++) {
    const t = 0.1 + R() * 0.75;
    const a = R() * 360;
    const p = trunk.at(t, a);
    b.stick(new THREE.BoxGeometry(0.035, 0.22, 0.05), i % 2 ? P.bark : P.trunkDark, p, { embed: 0.3 });
  }

  // knots
  for (let i = 0; i < 5; i++) {
    const p = trunk.at(0.2 + i * 0.15, 40 + i * 70);
    b.stick(new THREE.IcosahedronGeometry(0.06, 0), P.bark, p, { embed: 0.4 });
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), P.glowTeal, p.moved([0, 0.05, 0]), { embed: 0.2 });
  }

  // moss on upward faces
  for (let i = 0; i < 9; i++) {
    const t = 0.05 + R() * 0.6;
    const p = trunk.at(t, -35 + R() * 70);
    b.stick(new THREE.BoxGeometry(0.12, 0.03, 0.09), P.rootMoss, p, { embed: 0.3 });
  }

  // crown collar
  const c = path.at(0.97);
  b.part(new THREE.CylinderGeometry(0.3, 0.27, 0.07, 10), P.trunkDark, { at: [c.x, 2.0, c.z], bone: J.crown });
  b.part(new THREE.CylinderGeometry(0.24, 0.3, 0.05, 10), P.bark, { at: [c.x, 2.05, c.z], bone: J.crown });
  const cols = [P.glowCyan, P.glowMagenta, P.glowTeal];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const col = cols[i % 3];
    g(
      b.part(new THREE.IcosahedronGeometry(0.04, 0), col, {
        at: [c.x + Math.sin(a) * 0.29, 2.04, c.z + Math.cos(a) * 0.29],
        bone: J.crown,
      }),
      1.6,
    );
  }
}
    return buildTrunk;
  })(),
  // fronds
  (() => {
function buildFronds({ b, J, P, M }: any) {
  const R = rng(11);
  const crown = J.crown;
  const NF = 6;
  for (let i = 0; i < NF; i++) {
    const a = (i / NF) * Math.PI * 2 + 0.2;
    const dx = Math.sin(a), dz = Math.cos(a);
    const px = -dz, pz = dx; // perpendicular, horizontal
    const P3 = (r: number, y: number): [number, number, number] => [M.frondRing[0] + dx * r, M.frondRing[1] + y, M.frondRing[2] + dz * r];
    const pts = [P3(0.1, 0), P3(0.28, 0.4), P3(0.6, 0.62), P3(0.95, 0.55)];
    b.sweep(pts, [0.06, 0.035], { bone: crown, color: P.trunkMid, sides: 6 });
    // knuckle at stalk base
    b.part(new THREE.SphereGeometry(0.08, 6, 5), P.bark, { bone: crown, at: P3(0.1, 0) });
    // leaf blade drawn in (u along frond, v sideways) hanging in a drooping plane
    const L = 0.75, W = 0.6;
    const outline: any = [
      [0, 0, "sharp"], [0.15, 0.2], [0.35, 0.5], [0.6, 0.6], [0.85, 0.35], [L, 0, "sharp"],
      [0.85, -0.35], [0.6, -0.6], [0.35, -0.5], [0.15, -0.2],
    ].map((p: any) => [p[0], p[1] * (W / 0.6) , p[2]].filter((v) => v !== undefined));
    const start = P3(0.95, 0.55);
    const droop = -0.55;
    const xd: [number, number, number] = [dx, droop, dz];
    const len = Math.hypot(...xd);
    const ux = [dx / len, droop / len, dz / len];
    const blade = b.extrude(outline, { at: start, x: ux, y: [px, 0, pz], thickness: 0.03, bevel: 0.008, color: P.leafBlue, bone: crown });
    const inner: any = outline.map((p: any) => [p[0] * 0.78 + 0.05, p[1] * 0.6]);
    b.extrude(inner, { at: blade.local([0, 0, 0.012]), x: ux, y: [px, 0, pz], thickness: 0.03, color: P.leafTeal, bone: crown });
    const rim: any = outline.map((p: any) => [p[0], p[1]]);
    b.extrude(rim, { at: blade.local([0, 0, -0.012]), x: ux, y: [px, 0, pz], thickness: 0.025, color: P.leafEdge, bone: crown });
    const pt = (u: number, v: number, h = 0.03) => blade.local([u, v, h]);
    // midrib
    glow(b.rod(pt(0, 0), pt(L - 0.03, 0), 0.012, { color: P.glowCyan, bone: crown, sides: 5 }), 1.2);
    // side veins
    for (let k = 1; k <= 4; k++) {
      const u = k * 0.14 + 0.05;
      const w = Math.min(0.5, 0.15 + (0.6 - Math.abs(u - 0.5)) * 0.8) * (W / 0.6);
      for (const s of [1, -1]) {
        glow(b.rod(pt(u, 0), pt(u + 0.14, s * w), 0.008, { color: k % 2 ? P.glowTeal : P.glowCyan, bone: crown, sides: 4 }), 1.1);
        glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), P.glowPale, { bone: crown, at: pt(u + 0.15, s * (w + 0.02), 0.02) }), 1.5);
      }
    }
    // rim dots
    for (let k = 0; k < 6; k++) {
      const u = 0.1 + k * 0.1;
      const w = Math.min(0.58, 0.2 + (0.6 - Math.abs(u - 0.4)) * 0.7) * (W / 0.6);
      for (const s of [1, -1]) glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), P.glowPale, { bone: crown, at: pt(u, s * w * 0.95, 0.02) }), 1.5);
    }
    // magenta tip
    glow(b.part(new THREE.ConeGeometry(0.035, 0.1, 6), P.glowMagenta, { bone: crown, at: pt(L + 0.03, 0, 0.0), dir: ux, axis: "y" }), 1.6);
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.glowMagenta, { bone: crown, at: pt(L + 0.1, 0, 0) }), 1.8);
    // stalk glow nodules
    for (let k = 1; k < 3; k++) {
      const t = k / 3;
      const p = [0, 1, 2].map((c) => pts[0][c] + (pts[3][c] - pts[0][c]) * t) as [number, number, number];
      p[1] += 0.12;
      glow(b.part(new THREE.SphereGeometry(0.02 + R() * 0.01, 5, 4), P.glowViolet, { bone: crown, at: p }), 1.2);
    }
  }
}
    return buildFronds;
  })(),
  // spiralFlower
  (() => {
function buildSpiralFlower({ b, J, P, M }: Ctx) {
  const bone = J.flower;
  const R = rng(11);
  const base = new THREE.Vector3(M.flowerBase[0], M.flowerBase[1], M.flowerBase[2]);
  const top = new THREE.Vector3(M.flowerTop[0], M.flowerTop[1], M.flowerTop[2]);
  const STEM = "#1f8a78";
  const g = (p: any, s = 1) => glow(p, s);

  // stem
  b.rod([base.x, base.y - 0.03, base.z], [0, 2.45, 0], [0.085, 0.06], STEM, { bone, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.05, 8), P.glowTeal, { bone, at: [0, 2.12, 0] });
  g(b.part(new THREE.TorusGeometry(0.11, 0.015, 5, 10), P.glowTeal, { bone, at: [0, 2.15, 0], rotation: [90, 0, 0] }), 1.2);

  // core bulb
  g(b.part(new THREE.IcosahedronGeometry(0.15, 0), P.glowCyan, { bone, at: [0, 2.78, 0], scale: [1, 1.7, 1] }), 1.6);

  // helix petals
  const N = 10;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const ang = i * 2.4;
    const y0 = 2.5 + t * 0.55;
    const r0 = 0.1 + (1 - t) * 0.1;
    const len = 0.62 - t * 0.2;
    const w = 0.2 - t * 0.07;
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const root = new THREE.Vector3(dir.x * r0, y0 - 0.35 + 0.1, dir.z * r0);
    const tip = new THREE.Vector3(dir.x * (r0 + 0.3 * (1 - t) + 0.05), y0 + len * 0.9, dir.z * (r0 + 0.3 * (1 - t) + 0.05));
    const mid = root.clone().lerp(tip, 0.5);
    mid.addScaledVector(dir, 0.14);
    const curve = [root.toArray(), mid.toArray(), tip.toArray()];
    const col = i % 2 ? P.petalPink : P.petalDeep;
    b.sweep(curve, (u: number) => [w * (1 - u) * 0.9 + 0.01, 0.018], { bone, color: col, section: { ngon: 4 }, caps: "point" });
    // inner deep layer
    b.sweep([root.clone().addScaledVector(dir, -0.03).toArray(), mid.clone().addScaledVector(dir, -0.03).toArray(), tip.clone().addScaledVector(dir, -0.02).toArray()],
      (u: number) => [w * (1 - u) * 0.5 + 0.005, 0.02], { bone, color: i % 2 ? P.petalDeep : P.petalPink, section: { ngon: 4 }, caps: "point" });
    // glowing edge line
    g(b.sweep([mid.clone().addScaledVector(dir, 0.015).add(new THREE.Vector3(0, 0.0, 0)).toArray(), tip.clone().addScaledVector(dir, 0.01).toArray()],
      0.008, { bone, color: P.glowMagenta, sides: 4 }), 1.4);
    g(b.part(new THREE.IcosahedronGeometry(0.02, 0), P.glowMagenta, { bone, at: tip.toArray() }), 1.5);
  }

  // stamens
  const S = 12;
  for (let i = 0; i < S; i++) {
    const a = (i / S) * Math.PI * 2;
    const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const p0 = new THREE.Vector3(d.x * 0.07, 3.0, d.z * 0.07);
    const p1 = new THREE.Vector3(d.x * 0.17, 3.17, d.z * 0.17);
    b.rod(p0.toArray(), p1.toArray(), [0.014, 0.006], P.stamen, { bone, sides: 5 });
    g(b.part(new THREE.IcosahedronGeometry(0.026, 0), i % 2 ? P.glowPale : P.stamen, { bone, at: p1.toArray() }), 1.5);
  }
  g(b.part(new THREE.IcosahedronGeometry(0.05, 0), P.glowPale, { bone, at: [0, 3.06, 0] }), 1.8);

  // spores
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.1 + R() * 0.45;
    const y = 3.0 + R() * 0.17;
    const s = 0.012 + R() * 0.014;
    g(b.part(new THREE.OctahedronGeometry(s, 0), i % 3 ? P.glowPale : P.glowCyan, { bone, at: [Math.sin(a) * rr, y, Math.cos(a) * rr] }), 1.5);
  }
  void top;
}
    return buildSpiralFlower;
  })(),
  // tendrils
  (() => {
function buildTendrils({ b, J, P, M }: any) {
  const R = rng(11);
  const crown = J.crown;
  const trunk2 = J.trunk2;

  const mkTendril = (
    base: number[],
    ang: number,
    reach: number,
    endY: number,
    bone: any,
    th: number,
    beads: number,
    tipCol: string,
  ) => {
    const dx = Math.sin(ang);
    const dz = Math.cos(ang);
    const pts = [
      base,
      [base[0] + dx * reach * 0.35, base[1] - 0.05, base[2] + dz * reach * 0.35],
      [base[0] + dx * reach * 0.8, base[1] - (base[1] - endY) * 0.35, base[2] + dz * reach * 0.8],
      [base[0] + dx * reach, base[1] - (base[1] - endY) * 0.75, base[2] + dz * reach],
      [base[0] + dx * reach * 1.05, endY, base[2] + dz * reach * 1.05],
    ];
    const path = catmull(pts);
    b.sweep(path, [th, th * 0.35], {
      bone,
      color: R() > 0.5 ? P.bark : P.trunkMid,
      sides: 6,
      caps: "round",
    });
    for (let i = 0; i < beads; i++) {
      const t = 0.15 + (0.7 * i) / Math.max(1, beads - 1);
      const p = path.at(t);
      glow(
        b.part(new THREE.SphereGeometry(th * 1.35, 6, 4), i % 2 ? P.glowTeal : P.glowViolet, {
          bone,
          at: [p.x, p.y, p.z],
        }),
        1.2,
      );
    }
    const e = path.at(1);
    glow(
      b.part(new THREE.SphereGeometry(th * 2.4, 7, 5), tipCol, { bone, at: [e.x, e.y - th, e.z] }),
      1.8,
    );
    return path;
  };

  // main crown tendrils
  const nMain = 9;
  for (let i = 0; i < nMain; i++) {
    const a = (i / nMain) * Math.PI * 2 + 0.2;
    const r0 = 0.24;
    const base = [Math.sin(a) * r0, M.tendrilRing[1] - 0.02, Math.cos(a) * r0];
    const reach = 0.7 + R() * 0.35;
    const endY = 0.6 + R() * 0.3;
    const path = mkTendril(base, a, reach, endY, crown, 0.02 + R() * 0.008, 5, i % 2 ? P.glowMagenta : P.glowCyan);
    // side tendril on some
    if (i % 3 === 0) {
      const p = path.at(0.45);
      const q = a + 0.6;
      const side = catmull([
        [p.x, p.y, p.z],
        [p.x + Math.sin(q) * 0.12, p.y - 0.1, p.z + Math.cos(q) * 0.12],
        [p.x + Math.sin(q) * 0.2, p.y - 0.28, p.z + Math.cos(q) * 0.2],
      ]);
      b.sweep(side, [0.012, 0.005], { bone: crown, color: P.trunkMid, sides: 5 });
      const e = side.at(1);
      glow(b.part(new THREE.SphereGeometry(0.022, 6, 4), P.glowTeal, { bone: crown, at: [e.x, e.y, e.z] }), 1.5);
    }
    // seed pod
    if (i % 3 === 1) {
      const p = path.at(0.7);
      b.rod([p.x, p.y, p.z], [p.x, p.y - 0.1, p.z], 0.006, P.bark, { bone: crown });
      glow(
        b.part(new THREE.OctahedronGeometry(0.04, 0), P.glowPale, { bone: crown, at: [p.x, p.y - 0.14, p.z], scale: [1, 1.5, 1] }),
        1.3,
      );
    }
  }

  // trunk nodules with lower tendrils
  const nLow = 5;
  for (let i = 0; i < nLow; i++) {
    const a = (i / nLow) * Math.PI * 2 + 0.7;
    const y = 1.3 + R() * 0.4;
    const r0 = 0.3;
    const cx = M.trunkMid[0] * 0.5;
    const base = [cx + Math.sin(a) * r0, y, Math.cos(a) * r0];
    glow(
      b.part(new THREE.IcosahedronGeometry(0.055, 0), P.glowViolet, { bone: trunk2, at: base }),
      1.2,
    );
    mkTendril(base, a, 0.45 + R() * 0.25, 0.65 + R() * 0.2, trunk2, 0.018, 4, i % 2 ? P.glowCyan : P.glowMagenta);
  }
}
    return buildTendrils;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "sporeglowBloom" });
  const J: Record<string, Joint> = {};
  J["root"] = b.joint("root", { at: [0,0.1,0], dir: [0,1,0], role: "spine" });
  J["trunk1"] = b.joint("trunk1", { parent: J["root"], at: [0,0.45,0], dir: [0,1,0], role: "spine" });
  J["trunk2"] = b.joint("trunk2", { parent: J["trunk1"], at: [0.12,1.2,-0.05], dir: [0,1,0], role: "spine" });
  J["crown"] = b.joint("crown", { parent: J["trunk2"], at: [0,2.05,0], dir: [0,1,0], role: "spine" });
  J["flower"] = b.joint("flower", { parent: J["crown"], at: [0,2.1,0], dir: [0,1,0], role: "spine", group: "flower" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
