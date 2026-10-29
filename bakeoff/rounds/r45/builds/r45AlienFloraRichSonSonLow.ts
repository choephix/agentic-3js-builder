import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull, frame } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";

export const meta = {
  "name": "Pandoran Lumen Bloom",
  "description": "A bioluminescent alien plant in the Avatar/Pandora style: an S-curved indigo stalk with glowing veins, a crown of eight arching veined fronds, hanging glowing tendrils and pods, and a ring of spiral fan flowers at its base."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  ink: "#0a1020",
  trunkDark: "#1a2540",
  trunkMid: "#2a4263",
  trunkLight: "#3d6a88",
  rootDark: "#141a2c",
  rootMid: "#27304f",
  moss: "#1e5a4a",
  mossLight: "#33966e",
  leafDeep: "#0e3550",
  leafMid: "#17788a",
  leafTip: "#3bd0c2",
  podShell: "#34276a",
  podMid: "#6347c2",
  glowCyan: "#35f3ff",
  glowTeal: "#2ee6c0",
  glowViolet: "#b06cff",
  glowMagenta: "#ff4fd8",
  glowPink: "#ffa0ea",
  glowLime: "#a8ff5c",
  sporeWhite: "#e8fffc",
};
const M = {
  base: [0, 0.1, 0] as [number, number, number],
  stalk1: [0.06, 0.8, 0] as [number, number, number],
  stalk2: [0.12, 1.5, 0.04] as [number, number, number],
  stalk3: [0, 2.1, 0.1] as [number, number, number],
  crown: [0, 2.55, 0.12] as [number, number, number],
  crownRim: [0, 2.6, 0.12] as [number, number, number],
  tendrilRing: [0, 2.3, 0.12] as [number, number, number],
  rootCollar: [0, 0.55, 0] as [number, number, number],
  fanArc: [0, 0, 0.8] as [number, number, number],
  budTop: [0, 3.15, 0.12] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // rootBase
  (() => {
function buildRootBase({ b, J, P, M }: Ctx) {
  const bone = J.base;
  const R = rng(11);
  const g = glowKit ?? glow;
  const N = 5;
  const angles = [0.35, 1.35, 2.5, 3.7, 4.9].map((a, i) => a + (i === 1 ? 0.3 : 0) + (i === 2 ? 0.7 : 0));
  // Root directions biased away from +Z front (z>0.5)
  const dirs = [
    [1, 0.1], [0.55, -0.85], [-0.6, -0.8], [-1, 0.15], [0.05, -1],
  ];
  const ST = 0.3;

  // collar: knobbly ring
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.2, 10), P.rootDark, { bone, at: [0, 0.5, 0], flat: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = 0.46 + R() * 0.04;
    b.part(new THREE.IcosahedronGeometry(0.075 + R() * 0.03, 0), i % 2 ? P.rootMid : P.rootDark, {
      bone, at: [Math.cos(a) * r, 0.52 + R() * 0.08, Math.sin(a) * r], flat: true,
    });
  }
  g(b.part(new THREE.TorusGeometry(0.46, 0.012, 5, 20), P.glowTeal, { bone, at: [0, 0.62, 0], rotation: [90, 0, 0] }), 1.2);

  dirs.forEach(([dx, dz], i) => {
    const l = Math.hypot(dx, dz);
    const ux = dx / l, uz = dz / l;
    const len = 1.0 + R() * 0.2;
    const pts = [
      [ux * 0.2, 0.62, uz * 0.2],
      [ux * 0.45, 0.5, uz * 0.45],
      [ux * 0.75, 0.24, uz * 0.75],
      [ux * (len + 0.1), 0.03, uz * (len + 0.1)],
    ];
    const path = catmull(pts);
    b.sweep(path, [0.16, 0.012], { bone, color: P.rootDark, sides: 7, caps: { start: "round", end: "point" } });
    // highlight ridge
    b.sweep(path.slice(0.05, 0.8), [0.05, 0.01], { bone, color: P.rootMid, sides: 5, caps: "round" });
    // glowing vein on top
    const vein = catmull(pts.map((p, k) => [p[0], p[1] + 0.12 - k * 0.025, p[2]]));
    g(b.sweep(vein.slice(0.05, 0.85), [0.016, 0.004], { bone, color: P.glowTeal, sides: 5 }), 1.3);
    for (let k = 0; k < 7; k++) {
      const t = 0.12 + k * 0.1;
      const p = path.at(t);
      const rr = 0.16 * (1 - t) + 0.02;
      g(b.part(new THREE.SphereGeometry(0.014, 5, 4), P.glowCyan, { bone, at: [p.x, p.y + rr * 0.95, p.z] }), 1.4);
    }
    // moss
    for (let k = 0; k < 3; k++) {
      const t = 0.25 + k * 0.2;
      const p = path.at(t);
      const rr = 0.16 * (1 - t) + 0.02;
      b.part(new THREE.SphereGeometry(0.06 - k * 0.01, 6, 4), P.moss, {
        bone, at: [p.x + (R() - 0.5) * 0.05, p.y + rr * 0.7, p.z + (R() - 0.5) * 0.05], scale: [1, 0.4, 1], flat: true,
      });
      b.part(new THREE.SphereGeometry(0.03, 5, 3), P.mossLight, {
        bone, at: [p.x, p.y + rr * 0.7 + 0.02, p.z], scale: [1, 0.5, 1], flat: true,
      });
    }
    // rootlet
    const side = i % 2 ? 1 : -1;
    const q = path.at(0.6);
    const rl = catmull([
      [q.x, q.y, q.z],
      [q.x - uz * side * 0.15, q.y - 0.04, q.z + ux * side * 0.15],
      [q.x - uz * side * 0.3, 0.02, q.z + ux * side * 0.3],
    ]);
    b.sweep(rl, [0.035, 0.005], { bone, color: P.rootMid, sides: 5, caps: "point" });
  });

  // veins running down trunk base
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowCyan, {
      bone, at: [Math.cos(a) * 0.5, 0.6, Math.sin(a) * 0.5],
    }), 1.4);
  }
}
    return buildRootBase;
  })(),
  // stalk
  (() => {
function buildStalk({ b, J, P, M }: any) {
  const r = rng(11);
  const pts = [M.base, M.stalk1, M.stalk2, M.stalk3, M.crown].map((p: number[]) => [p[0], p[1], p[2]]);
  pts[0] = [0, 0.45, 0];
  const path = catmull(pts);
  const bones = [J.base, J.stalk1, J.stalk2, J.stalk3, J.crown];
  const rad = [0.36, 0.3, 0.2, 0.15, 0.17, 0.2, 0.2];
  const tube = b.sweep(path, rad, {
    bone: bones,
    color: P.trunkDark,
    sides: 10,
    caps: "flat",
    sectors: [
      [-30, 30, P.trunkLight],
      [60, 100, P.trunkMid],
      [260, 300, P.trunkMid],
    ],
  });

  // knuckle rings
  for (const [t, j] of [[0.3, J.stalk1], [0.6, J.stalk2]] as any) {
    const at = tube.at(t);
    b.part(new THREE.TorusGeometry(0.2, 0.05, 6, 12), P.trunkMid, {
      at: at.at, dir: at.tangent, axis: "z", bone: j, scale: [1, 1, 1],
    });
  }

  // crown cup
  const c = M.crown;
  b.lathe(
    [[0, 0], [0.16, 0], [0.26, 0.1], [0.34, 0.22], [0.32, 0.24], [0.22, 0.12], [0.1, 0.06], [0, 0.06]],
    { at: [c[0], c[1] - 0.1, c[2]], bone: J.crown, color: P.trunkMid, segments: 12 },
  );
  glow(b.part(new THREE.TorusGeometry(0.31, 0.025, 5, 16), P.glowViolet, {
    at: [c[0], c[1] + 0.12, c[2]], dir: [0, 1, 0], axis: "z", bone: J.crown,
  }), 1.4);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowMagenta, {
      at: [c[0] + Math.cos(a) * 0.325, c[1] + 0.03, c[2] + Math.sin(a) * 0.325], bone: J.crown,
    }), 1.5);
  }

  // spiral glowing veins
  const cols = [P.glowCyan, P.glowTeal, P.glowCyan, P.glowTeal];
  for (let k = 0; k < 4; k++) {
    const vp: number[][] = [];
    for (let i = 0; i <= 24; i++) {
      const t = 0.08 + (i / 24) * 0.9;
      const s = tube.at(t, ((k * 90 + t * 540) % 360));
      vp.push([s.at.x + s.n.x * 0.008, s.at.y + s.n.y * 0.008, s.at.z + s.n.z * 0.008]);
    }
    const vein = catmull(vp);
    glow(b.sweep(vein, [0.006, 0.014], { color: cols[k], sides: 4, bone: bones }), 1.2);
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + (i / 8) * 0.88;
      const s = vein.at(t);
      glow(b.part(new THREE.SphereGeometry(0.012 + t * 0.012, 5, 4), cols[k], { at: s, bone: bones[Math.min(4, Math.floor(t * 5))] }), 1.4);
    }
  }

  // knuckle beads
  for (const t of [0.3, 0.6]) {
    for (let i = 0; i < 6; i++) {
      const s = tube.at(t, i * 60 + 30, 0.045);
      glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowTeal, { at: s.at, bone: t < 0.45 ? J.stalk1 : J.stalk2 }), 1.4);
    }
  }

  // leaf-scale bumps
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + r() * 0.7;
    const s = tube.at(t, r() * 360);
    b.stick(new THREE.ConeGeometry(0.04, 0.09, 5), P.leafDeep, s, { embed: 0.3 });
  }
  // moss tufts at the lower trunk
  for (let i = 0; i < 4; i++) {
    const s = tube.at(0.05 + r() * 0.1, i * 90 + 20);
    b.stick(new THREE.ConeGeometry(0.05, 0.1, 5), P.moss, s, { embed: 0.2 });
    b.stick(new THREE.ConeGeometry(0.025, 0.07, 5), P.mossLight, s, { embed: 0.1 });
  }
}
    return buildStalk;
  })(),
  // fronds
  (() => {
function buildFronds({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const G = (t: any, s = 1) => glowKit(t, s);
  const names = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const crownJ = J.crown;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  names.forEach((n, i) => {
    const ang = (i * Math.PI) / 4;
    const dx = Math.sin(ang);
    const dz = Math.cos(ang);
    const px = -dz;
    const pz = dx;
    const pt = (r: number, y: number) => V(dx * r, y, 0.12 + dz * r);
    const root = J["frond" + n];
    const pts = [pt(0.2, 2.6), pt(0.5, 2.95), pt(0.85, 3.08), pt(1.15, 2.85), pt(1.38, 2.35)];
    const path = catmull(pts);
    const ch = b.chain("frond" + n, path, {
      parent: root,
      names: [`frond${n}1`, `frond${n}2`, `frond${n}3`, `frond${n}4`],
      role: "arm",
      group: "fronds",
    });
    const accent = i % 2 === 0 ? P.glowViolet : P.glowTeal;
    // leaf blade as a wide flat loft
    const stations = [0, 0.15, 0.35, 0.55, 0.75, 0.92].map((t) => {
      const w = [0.1, 0.34, 0.5, 0.44, 0.24, 0.05][[0, 0.15, 0.35, 0.55, 0.75, 0.92].indexOf(t)];
      return { at: path.at(t), w, h: 0.02 };
    });
    const bands: [number, string][] = [
      [0.3, P.leafDeep],
      [0.7, P.leafMid],
      [1, P.leafTip],
    ];
    b.loft(stations, { bone: root, color: P.leafMid, group: "fronds" });
    // underside tint
    b.loft(
      stations.map((s) => ({ at: [s.at.x, s.at.y - 0.02, s.at.z] as any, w: s.w * 0.96, h: 0.015 })),
      { bone: root, color: "#2c2a6a", group: "fronds" },
    );
    // colour sections as overlays on top
    b.loft(
      stations.slice(0, 2).map((s) => ({ at: [s.at.x, s.at.y + 0.012, s.at.z] as any, w: s.w * 0.9, h: 0.012 })),
      { bone: root, color: P.leafDeep, group: "fronds" },
    );
    b.loft(
      stations.slice(4).map((s) => ({ at: [s.at.x, s.at.y + 0.012, s.at.z] as any, w: s.w * 0.9, h: 0.012 })),
      { bone: root, color: P.leafTip, group: "fronds" },
    );
    const top = (t: number, off = 0, lift = 0.03) => {
      const p = path.at(t);
      return V(p.x + px * off, p.y + lift, p.z + pz * off);
    };
    // midrib
    b.sweep(catmull(pts.map((p) => V(p.x, p.y + 0.03, p.z))), [0.022, 0.008], {
      bone: root,
      color: P.trunkLight,
      group: "fronds",
    });
    G(
      b.sweep(catmull([0.05, 0.3, 0.55, 0.8, 0.96].map((t) => top(t, 0, 0.05))), [0.01, 0.005], {
        bone: root,
        color: P.glowCyan,
        group: "fronds",
      }),
    );
    // side veins + dots
    [0.2, 0.35, 0.5, 0.65, 0.8].forEach((t, k) => {
      const wmax = [0.3, 0.45, 0.4, 0.3, 0.16][k];
      for (const s of [1, -1]) {
        const a = top(t, 0, 0.04);
        const m = top(t + 0.07, s * wmax * 0.55, 0.035);
        const e = top(t + 0.14, s * wmax, 0.02);
        G(b.sweep(catmull([a, m, e]), [0.007, 0.003], { bone: root, color: accent, group: "fronds" }));
        G(
          b.part(new THREE.SphereGeometry(0.014, 5, 4), i % 3 === 0 ? P.glowLime : P.glowCyan, {
            bone: root,
            at: m,
            group: "fronds",
          }),
        );
      }
    });
    // edge trim
    for (const s of [1, -1]) {
      const edge = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.96].map((t, k) => {
        const w = [0.2, 0.4, 0.5, 0.42, 0.28, 0.12, 0.02][k];
        return top(t, s * w * 0.95, 0.02);
      });
      G(b.sweep(catmull(edge), 0.007, { bone: root, color: P.glowCyan, group: "fronds" }));
    }
    // tip bead
    const tip = path.at(1);
    G(
      b.part(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? P.glowCyan : P.glowPink, {
        bone: root,
        at: [tip.x, tip.y - 0.02, tip.z],
        group: "fronds",
      }),
      1.5,
    );
    b.spike(V(tip.x, tip.y, tip.z), [dx * 0.8, -0.5, dz * 0.8], 0.1, 0.03, {
      bone: root,
      color: P.leafTip,
      group: "fronds",
    });
  });

  // central bud
  const bc = V(0, 2.6, 0.12);
  G(b.part(new THREE.IcosahedronGeometry(0.1, 1), P.glowPink, { bone: crownJ, at: [0, 2.85, 0.12], group: "fronds" }), 1.4);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const base = V(dx * 0.1, 2.6, 0.12 + dz * 0.1);
    const mid = V(dx * 0.13, 2.85, 0.12 + dz * 0.13);
    const tp = V(dx * 0.04, 3.15, 0.12 + dz * 0.04);
    b.sweep(catmull([base, mid, tp]), [0.07, 0.0], {
      bone: crownJ,
      color: k % 2 ? P.leafTip : P.leafMid,
      caps: { end: "point" },
      group: "fronds",
    });
    G(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.glowMagenta, { bone: crownJ, at: tp, group: "fronds" }), 1.5);
  }
  for (let k = 0; k < 6; k++) {
    G(
      b.part(new THREE.IcosahedronGeometry(0.016, 0), P.sporeWhite, {
        bone: crownJ,
        at: [(R() - 0.5) * 0.6, 3.0 + R() * 0.2, 0.12 + (R() - 0.5) * 0.6],
        group: "fronds",
      }),
    );
  }
}
    return buildFronds;
  })(),
  // tendrilsPods
  (() => {
function buildTendrilsPods({ b, J, P, M }: any) {
  const R = rng(11);
  const g = (x: any, s = 1) => glowKit(x, s);
  const ringY = M.tendrilRing[1];
  const cz = M.tendrilRing[2];

  // collar ring on the stalk
  b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 10), P.trunkMid, { bone: J.stalk3, at: [0, ringY, cz] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    g(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.glowViolet, {
      bone: J.stalk3, at: [Math.sin(a) * 0.225, ringY + 0.02, cz + Math.cos(a) * 0.225],
    }));
  }

  // tendrils
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.15;
    const len = 1.0 + R() * 0.45;
    const out = 0.6 + R() * 0.5;
    const sx = Math.sin(a), sz = Math.cos(a);
    const pts: number[][] = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      const r = 0.3 + (out - 0.3) * Math.sin(t * Math.PI * 0.5);
      pts.push([sx * r, Math.max(1.0, ringY - 0.05 - len * t), cz + sz * r]);
    }
    const path = catmull(pts);
    const names = [0, 1, 2, 3].map((k) => `tendrilsPodsTendril${i}${k}`);
    const ch = b.chain(`tendrilsPodsT${i}`, path, { parent: J.stalk3, names, role: "tentacle", group: "tendrils" });
    const sw = b.sweep(ch, [0.03, 0.01], {
      color: (t: number) => (t < 0.5 ? P.trunkMid : P.leafMid),
    });
    void sw;
    for (let k = 1; k <= 7; k++) {
      const t = k / 8;
      const p = path.at(t);
      const s2 = 0.045 * (1 - t * 0.5);
      const ang = t * 9 + i;
      g(b.part(new THREE.SphereGeometry(0.02, 6, 4), k % 2 ? P.glowCyan : P.glowViolet, {
        bone: ch.joints[Math.min(3, Math.floor(t * 4))],
        at: [p.x + Math.cos(ang) * s2 * 0.6, p.y, p.z + Math.sin(ang) * s2 * 0.6],
      }));
    }
    const tip = path.at(1);
    const tb = ch.joints[3];
    g(b.part(new THREE.IcosahedronGeometry(0.065, 0), i % 2 ? P.glowMagenta : P.glowTeal, { bone: tb, at: [tip.x, tip.y - 0.04, tip.z] }));
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2;
      g(b.part(new THREE.SphereGeometry(0.012, 5, 4), P.sporeWhite, {
        bone: tb, at: [tip.x + Math.cos(aa) * 0.075, tip.y - 0.04, tip.z + Math.sin(aa) * 0.075],
      }));
    }
  }

  // seed pods
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    const sx = Math.sin(a), sz = Math.cos(a);
    const y = 1.6 + R() * 0.6;
    const top = [sx * 0.7, y + 0.3, cz + sz * 0.7];
    const base = [sx * 0.9, y + 0.05, cz + sz * 0.9];
    b.sweep(catmull([[sx * 0.3, ringY + 0.1, cz + sz * 0.3], [sx * 0.55, ringY + 0.25, cz + sz * 0.55], top, base]), 0.012, {
      color: P.trunkMid, bone: J.stalk3,
    });
    const px = base[0], pz = base[2];
    const body = new THREE.SphereGeometry(0.1, 8, 6);
    b.part(body, P.podShell, { bone: J.stalk3, at: [px, y - 0.08, pz], scale: [1, 1.5, 1] });
    b.part(new THREE.ConeGeometry(0.06, 0.14, 8), P.podShell, { bone: J.stalk3, at: [px, y - 0.26, pz], rotation: [180, 0, 0] });
    b.part(new THREE.TorusGeometry(0.075, 0.015, 5, 10), P.trunkDark, { bone: J.stalk3, at: [px, y + 0.04, pz], rotation: [90, 0, 0] });
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.012, 0.22, 0.012), P.podMid, {
        bone: J.stalk3, at: [px + Math.sin(aa) * 0.095, y - 0.1, pz + Math.cos(aa) * 0.095],
      });
    }
    const fx = Math.sin(a), fz = Math.cos(a);
    g(b.part(new THREE.BoxGeometry(0.025, 0.2, 0.012), i % 2 ? P.glowMagenta : P.glowLime, {
      bone: J.stalk3, at: [px + fx * 0.105, y - 0.08, pz + fz * 0.105], rotation: [0, a * 57.3, 0],
    }));
  }

  // spore motes
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.3 + R() * 0.85;
    g(b.part(new THREE.IcosahedronGeometry(0.012 + R() * 0.012, 0), i % 2 ? P.sporeWhite : P.glowCyan, {
      bone: J.stalk3, at: [Math.sin(a) * r, 1.0 + R() * 1.6, cz + Math.cos(a) * r],
    }));
  }
}
    return buildTendrilsPods;
  })(),
  // helicoradians
  (() => {
function buildHelicoradians({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const plants = [
    { j: "helixA", h: 0.5, glowC: P.glowCyan, lean: [-0.08, 0.04] },
    { j: "helixB", h: 0.7, glowC: P.glowViolet, lean: [-0.04, 0.05] },
    { j: "helixC", h: 0.9, glowC: P.glowMagenta, lean: [0, 0.08] },
    { j: "helixD", h: 0.7, glowC: P.glowLime, lean: [0.04, 0.05] },
    { j: "helixE", h: 0.5, glowC: P.glowCyan, lean: [0.08, 0.04] },
  ];
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const tuft = (x: number, z: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + R();
      const dx = Math.cos(a) * 0.05, dz = Math.sin(a) * 0.05;
      b.spike([x + dx, 0, z + dz], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.09 + R() * 0.05, 0.016, {
        color: i % 2 ? P.moss : P.mossLight, bone: J.base,
      });
    }
  };
  for (const p of plants) {
    const jt = J[p.j];
    const bx = jt.at.x, bz = jt.at.z;
    const top: [number, number, number] = [bx + p.lean[0] * p.h * 3, p.h, bz + p.lean[1] * p.h * 3];
    const mid: [number, number, number] = [bx + p.lean[0] * p.h * 1.2 + 0.04, p.h * 0.5, bz + p.lean[1] * p.h];
    const stemPath = [[bx, 0.06, bz], mid, top];
    const stem = b.chain(p.j + "S", stemPath as any, { parent: jt, names: [p.j + "1", p.j + "2", p.j + "3"], role: "fan", group: "helix" });
    b.sweep(stem, [0.035, 0.018], { color: P.trunkMid });
    // bulb base in moss
    b.part(sph(0.08, 8, 6), P.moss, { bone: jt, at: [bx, 0.06, bz], scale: [1, 0.8, 1] });
    b.part(sph(0.05, 6, 4), P.mossLight, { bone: jt, at: [bx, 0.12, bz], scale: [1, 0.6, 1] });
    tuft(bx, bz, 4);
    // glow dots on stem
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const y = p.h * t;
      glow(b.part(sph(0.012, 5, 3), P.glowTeal, {
        bone: jt, at: [mid[0] + (top[0] - mid[0]) * Math.max(0, t - 0.5) * 2 * 0.5 + 0.03, y, bz + p.lean[1] * y],
      }), 1);
    }
    // fan
    const n = 12;
    const c = new THREE.Vector3(...top);
    const tipBone = stem.tip ?? stem.joints[stem.joints.length - 1];
    for (let i = 0; i < n; i++) {
      const a = i * 2.4 + 0.3; // spiral phase
      const rr = 0.04 + (i / n) * 0.03;
      const dx = Math.cos(a), dz = Math.sin(a);
      const base: [number, number, number] = [c.x + dx * rr, c.y + 0.01, c.z + dz * rr];
      const len = 0.17 + (i % 3) * 0.02;
      const tip: [number, number, number] = [c.x + dx * (rr + len), c.y + 0.1 + len * 0.45, c.z + dz * (rr + len)];
      const ctl: [number, number, number] = [c.x + dx * (rr + len * 0.4), c.y + 0.1 + len * 0.45, c.z + dz * (rr + len * 0.4)];
      const bl = b.sweep([base, ctl, tip] as any, [0.011, 0.003], {
        bone: tipBone, color: (t: number) => (t < 0.35 ? P.leafDeep : t < 0.7 ? P.leafMid : P.glowTeal),
      });
      glow(bl, 0.6);
      glow(b.part(sph(0.016, 6, 4), p.glowC, { bone: tipBone, at: tip }), 1.4);
    }
    glow(b.part(sph(0.04, 7, 5), P.glowPink, { bone: tipBone, at: [c.x, c.y + 0.045, c.z] }), 1.5);
    b.part(new THREE.CylinderGeometry(0.05, 0.03, 0.03, 8), P.leafDeep, { bone: tipBone, at: [c.x, c.y, c.z] });
  }
  // ground sprouts
  const sp: [number, number][] = [[-0.8, 0.9], [-0.3, 0.7], [0.3, 0.65], [0.8, 0.95], [-0.25, 1.2], [0.3, 1.25], [1.2, 0.8]];
  for (const [x, z] of sp) {
    b.part(new THREE.ConeGeometry(0.05, 0.14, 6), P.moss, { bone: J.base, at: [x, 0.07 - 0.01, z] });
    glow(b.part(sph(0.015, 5, 3), P.glowLime, { bone: J.base, at: [x, 0.15, z] }), 1.3);
  }
  tuft(-0.4, 0.5, 3);
  tuft(0.45, 0.5, 3);
}
    return buildHelicoradians;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "pandoranLumenBloom" });
  const J: Record<string, Joint> = {};
  J["base"] = b.joint("base", { at: [0,0.1,0], dir: [0.05,1,0], role: "spine", group: "stalk" });
  J["stalk1"] = b.joint("stalk1", { parent: J["base"], at: [0.06,0.8,0], dir: [0.05,1,0.03], role: "spine", group: "stalk" });
  J["stalk2"] = b.joint("stalk2", { parent: J["stalk1"], at: [0.12,1.5,0.04], dir: [-0.1,1,0.05], role: "spine", group: "stalk" });
  J["stalk3"] = b.joint("stalk3", { parent: J["stalk2"], at: [0,2.1,0.1], dir: [0,1,0.05], role: "spine", group: "stalk" });
  J["crown"] = b.joint("crown", { parent: J["stalk3"], at: [0,2.55,0.12], dir: [0,1,0], role: "head", group: "stalk" });
  J["frondA"] = b.joint("frondA", { parent: J["crown"], at: [0,2.6,0.32], dir: [0,0.45,0.9], role: "arm", group: "fronds" });
  J["frondB"] = b.joint("frondB", { parent: J["crown"], at: [0.14,2.6,0.26], dir: [0.63,0.45,0.63], role: "arm", group: "fronds" });
  J["frondC"] = b.joint("frondC", { parent: J["crown"], at: [0.2,2.6,0.12], dir: [0.9,0.45,0], role: "arm", group: "fronds" });
  J["frondD"] = b.joint("frondD", { parent: J["crown"], at: [0.14,2.6,-0.02], dir: [0.63,0.45,-0.63], role: "arm", group: "fronds" });
  J["frondE"] = b.joint("frondE", { parent: J["crown"], at: [0,2.6,-0.08], dir: [0,0.45,-0.9], role: "arm", group: "fronds" });
  J["frondF"] = b.joint("frondF", { parent: J["crown"], at: [-0.14,2.6,-0.02], dir: [-0.63,0.45,-0.63], role: "arm", group: "fronds" });
  J["frondG"] = b.joint("frondG", { parent: J["crown"], at: [-0.2,2.6,0.12], dir: [-0.9,0.45,0], role: "arm", group: "fronds" });
  J["frondH"] = b.joint("frondH", { parent: J["crown"], at: [-0.14,2.6,0.26], dir: [-0.63,0.45,0.63], role: "arm", group: "fronds" });
  J["helixA"] = b.joint("helixA", { parent: J["base"], at: [-1,0.05,0.55], dir: [-0.15,1,0.1], role: "fan", group: "helix" });
  J["helixB"] = b.joint("helixB", { parent: J["base"], at: [-0.55,0.05,0.95], dir: [-0.05,1,0.15], role: "fan", group: "helix" });
  J["helixC"] = b.joint("helixC", { parent: J["base"], at: [0,0.05,1.1], dir: [0,1,0.2], role: "fan", group: "helix" });
  J["helixD"] = b.joint("helixD", { parent: J["base"], at: [0.55,0.05,0.95], dir: [0.05,1,0.15], role: "fan", group: "helix" });
  J["helixE"] = b.joint("helixE", { parent: J["base"], at: [1,0.05,0.55], dir: [0.15,1,0.1], role: "fan", group: "helix" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
