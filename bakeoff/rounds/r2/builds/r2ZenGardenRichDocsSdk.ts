import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, patches, mottle, countershade, grain } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden Diorama",
  description:
    "Square-based garden diorama: red arched bridge over a koi pond with three koi, stone lantern, cloud-pruned pine, blossoming cherry tree with falling petals, raked gravel, mossy rocks and stepping stones.",
};

export default function build() {
  const b = createBuilder({ name: "garden" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const V = THREE.Vector3;
  const P = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: root, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ico = (flat = true) => new THREE.IcosahedronGeometry(1, 1);
  const G = 0.08; // ground top

  // ---------- palette ----------
  const RED = "#c0291f", RED2 = "#a52019", DARKRED = "#7a1712", GOLD = "#d9a441";
  const STONE = "#8d8d86", STONE2 = "#9b9b94", STONE3 = "#767670";
  const stonePaint = mottle("#8f8f88", "#7a7a74", { size: 0.04, seed: 3 });
  const mossRock = countershade(mottle("#5f9440", "#4c8238", { size: 0.03, seed: 5 }), stonePaint, { level: 0.25, soft: 0.3 });

  // ---------- base ----------
  P(box(1.2, 0.05, 1.2), grain("#5a3b22", "#46301b", { size: 0.02, axis: "x" }), { at: [0, 0.025, 0] });
  P(box(1.14, 0.03, 1.14), mottle("#62a046", "#4f8c3b", { size: 0.08, seed: 1 }), { at: [0, 0.065, 0] });

  // ---------- pond ----------
  const cx = -0.1, cz = 0.05;
  P(new THREE.CylinderGeometry(1, 1, 0.008, 28), mottle("#2f7f9e", "#43a0b3", { size: 0.1, seed: 2 }), {
    at: [cx, 0.084, cz],
    scale: [0.36, 1, 0.25],
  });
  const rim = rng(21);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + rim() * 0.1;
    const x = cx + 0.37 * Math.cos(a), z = cz + 0.265 * Math.sin(a);
    if (Math.abs(z - cz) < 0.095 && Math.abs(Math.cos(a)) > 0.8) continue;
    const s = 0.028 + rim() * 0.022;
    P(ico(), i % 4 === 0 ? mossRock : stonePaint, {
      at: [x, G + s * 0.4, z],
      scale: [s * 1.3, s * 0.8, s],
      rotation: [0, rim() * 180, 0],
      flat: true,
    });
  }
  // lily pads
  for (const [x, z] of [[-0.3, -0.03], [0.12, -0.09], [-0.03, 0.2]]) {
    P(new THREE.CylinderGeometry(0.03, 0.03, 0.002, 10), "#4f9a3f", { at: [x, 0.0885, z] });
    P(new THREE.ConeGeometry(0.01, 0.014, 6), "#f7a8c4", { at: [x + 0.008, 0.096, z + 0.004] });
  }

  // ---------- koi ----------
  const ORANGE = "#f2661f", ORANGE2 = "#e0431a", WHITE = "#fbf6ea";
  function koi(id: number, x: number, z: number, hd: number, bend: number, seed: number) {
    const h = (hd * Math.PI) / 180;
    const d = new V(Math.sin(h), 0, Math.cos(h));
    const p = new V(Math.cos(h), 0, -Math.sin(h));
    const Y = 0.084;
    const pt = (s: number, l: number, y = Y): [number, number, number] => [
      x + d.x * s + p.x * l,
      y,
      z + d.z * s + p.z * l,
    ];
    const S = [0.08, 0.04, 0, -0.04, -0.08];
    const L = [0, 0.004, 0.006, -0.002, -0.012];
    const ch = b.chain(`fish${id}_`, catmull(S.map((s, i) => pt(s, L[i] * bend))), {
      parent: root,
      count: 4,
      role: "spine",
    });
    b.sweep(
      ch,
      (t: number) => {
        const r = t < 0.3 ? 0.009 + 0.008 * (t / 0.3) : 0.017 * (1 - (t - 0.3) / 0.7) + 0.003 * ((t - 0.3) / 0.7);
        return [r, r * 0.7];
      },
      { color: patches(WHITE, [ORANGE, ORANGE2], { size: 0.06, seed }), sides: 8 },
    );
    const nd = d.clone().negate();
    b.extrude(
      [[0, 0], [0.03, 0.024], [0.024, 0], [0.03, -0.024]],
      {
        at: pt(-0.078, L[4] * bend),
        x: nd.toArray(),
        y: p.toArray(),
        thickness: 0.002,
        smoothing: 1,
        color: "#ffe2cf",
        bone: ch.joints[3],
      },
    );
    for (const side of [1, -1]) {
      const xd = nd.clone().multiplyScalar(0.7).add(p.clone().multiplyScalar(0.7 * side)).normalize();
      const yd = new V(0, 1, 0).cross(xd);
      b.extrude([[0, 0], [0.022, 0.006], [0.016, -0.005]], {
        at: pt(0.04, side * 0.013, Y - 0.003),
        x: xd.toArray(),
        y: yd.toArray(),
        thickness: 0.0015,
        smoothing: 1,
        color: "#ffe6d5",
        bone: ch.joints[1],
      });
      P(new THREE.SphereGeometry(0.0032, 5, 4), "#222222", { at: pt(0.07, side * 0.008, Y + 0.004), bone: ch.joints[0] });
    }
    b.extrude([[0, 0], [0.04, 0], [0.03, 0.01], [0.01, 0.012]], {
      at: pt(0.03, 0, Y + 0.011),
      x: nd.toArray(),
      y: [0, 1, 0],
      thickness: 0.0016,
      color: "#ff8a4a",
      bone: ch.joints[1],
    });
    P(new THREE.TorusGeometry(0.045, 0.0012, 3, 20), "#c4e6ef", { at: [x, 0.0885, z], rotation: [90, 0, 0] });
  }
  koi(1, -0.28, 0.16, 70, 1, 4);
  koi(2, 0.0, 0.15, -120, -1, 9);
  koi(3, -0.12, -0.1, 200, 1, 15);

  // ---------- bridge ----------
  const bcx = -0.1, bhalf = 0.37, bz = 0.05;
  const by = (u: number) => 0.09 + 0.14 * (1 - u * u);
  const bx = (u: number) => bcx + bhalf * u;
  const N = 16;
  for (let i = 0; i < N; i++) {
    const u = -1 + ((i + 0.5) * 2) / N;
    const slope = (-0.28 * u) / bhalf;
    P(box(0.043, 0.01, 0.155), i % 2 ? RED : RED2, {
      at: [bx(u), by(u), bz],
      rotation: [0, 0, (Math.atan(slope) * 180) / Math.PI],
    });
  }
  for (const s of [1, -1]) {
    const pts = [-1, -0.7, -0.4, -0.1, 0.1, 0.4, 0.7, 1].map((u) => [bx(u), by(u) - 0.016, bz + s * 0.06]);
    b.sweep(catmull(pts), { radius: 0.01, color: DARKRED, bone: root });
    const posts = [-0.95, -0.63, -0.32, 0, 0.32, 0.63, 0.95];
    for (const u of posts) {
      P(box(0.016, 0.08, 0.016), RED, { at: [bx(u), by(u) + 0.04, bz + s * 0.073] });
      P(new THREE.SphereGeometry(0.011, 6, 5), GOLD, { at: [bx(u), by(u) + 0.088, bz + s * 0.073] });
    }
    for (const dy of [0.07, 0.04]) {
      b.sweep(
        catmull(posts.map((u) => [bx(u), by(u) + dy, bz + s * 0.073])),
        { radius: 0.0065, color: dy > 0.05 ? RED : RED2, bone: root },
      );
    }
  }

  // ---------- gravel ----------
  const gx = 0.15, gzc = -0.33;
  P(box(0.4, 0.008, 0.4), mottle("#f0ece1", "#dcd7c8", { size: 0.015, seed: 8 }), { at: [gx, 0.084, gzc] });
  for (let i = 0; i < 9; i++)
    P(box(0.007, 0.004, 0.38), "#cfc9b8", { at: [-0.03 + i * 0.045, 0.09, gzc] });
  for (const [w, d, x, z] of [[0.412, 0.01, gx, gzc + 0.205], [0.412, 0.01, gx, gzc - 0.205], [0.01, 0.4, gx + 0.205, gzc], [0.01, 0.4, gx - 0.205, gzc]] as number[][])
    P(box(w, 0.016, d), "#6b4a2c", { at: [x, 0.088, z] });

  // ---------- mossy rocks ----------
  const rockR = rng(33);
  const rock = (x: number, z: number, s: number, y = G) =>
    P(ico(), mossRock, {
      at: [x, y + s * 0.35, z],
      scale: [s * 1.2, s * 0.8, s],
      rotation: [0, rockR() * 180, 0],
      flat: true,
    });
  rock(0.2, -0.38, 0.07, 0.088);
  rock(0.05, -0.22, 0.04, 0.088);
  rock(0.28, -0.2, 0.035, 0.088);
  rock(-0.2, -0.2, 0.045);
  rock(-0.33, 0.43, 0.04);
  rock(0.5, 0.0, 0.045);

  // ---------- stepping stones ----------
  const stones = [[0.46, 0.52], [0.41, 0.4], [0.37, 0.29], [0.33, 0.17]];
  stones.forEach(([x, z], i) =>
    P(new THREE.CylinderGeometry(0.045 - i * 0.002, 0.05, 0.018, 7), countershade(mottle("#c0c0b8", "#a4a49c", { size: 0.03, seed: i }), stonePaint, { level: 0.5 }), {
      at: [x, G + 0.007, z],
      rotation: [0, i * 20, 0],
      flat: true,
    }),
  );

  // ---------- stone lantern ----------
  const lx = -0.46, lz = 0.33;
  const lan = mottle("#979790", "#82827b", { size: 0.03, seed: 6 });
  P(box(0.12, 0.025, 0.12), lan, { at: [lx, G + 0.0125, lz] });
  P(new THREE.CylinderGeometry(0.02, 0.025, 0.11, 8), lan, { at: [lx, G + 0.08, lz] });
  P(new THREE.CylinderGeometry(0.075, 0.05, 0.025, 6), lan, { at: [lx, G + 0.15, lz] });
  P(box(0.055, 0.06, 0.055), "#ffd27a", { at: [lx, G + 0.193, lz] });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) P(box(0.011, 0.062, 0.011), lan, { at: [lx + sx * 0.03, G + 0.193, lz + sz * 0.03] });
  P(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 6), lan, { at: [lx, G + 0.233, lz] });
  P(new THREE.ConeGeometry(0.115, 0.07, 6), lan, { at: [lx, G + 0.274, lz], flat: true });
  P(new THREE.SphereGeometry(0.016, 6, 5), lan, { at: [lx, G + 0.32, lz] });

  // ---------- pine ----------
  const px = 0.42, pz = -0.42;
  b.sweep(
    catmull([[px, 0.07, pz], [px - 0.02, 0.14, pz], [px + 0.03, 0.22, pz + 0.02], [px, 0.3, pz + 0.01]]),
    [0.03, 0.01],
    { color: grain("#5a3d2a", "#46301f", { size: 0.01 }), bone: root },
  );
  const pines = ["#2d5a3a", "#3a6b3f", "#244d33"];
  const pad = (x: number, y: number, z: number, s: number, k: number) => {
    P(ico(), pines[k % 3], { at: [x, y, z], scale: [s, s * 0.45, s * 0.85], flat: true });
    P(ico(), pines[(k + 1) % 3], { at: [x + s * 0.45, y + s * 0.15, z + s * 0.2], scale: [s * 0.6, s * 0.35, s * 0.55], flat: true });
    P(ico(), pines[(k + 2) % 3], { at: [x - s * 0.4, y + s * 0.12, z - s * 0.2], scale: [s * 0.55, s * 0.32, s * 0.5], flat: true });
  };
  b.sweep(bezier([px - 0.02, 0.14, pz], [px - 0.06, 0.15, pz], [px - 0.1, 0.19, pz]), [0.012, 0.005], { color: "#5a3d2a", bone: root });
  b.sweep(bezier([px + 0.03, 0.22, pz + 0.02], [px + 0.06, 0.22, pz], [px + 0.09, 0.25, pz]), [0.01, 0.004], { color: "#5a3d2a", bone: root });
  pad(px - 0.1, 0.2, pz, 0.075, 0);
  pad(px + 0.09, 0.27, pz, 0.065, 1);
  pad(px, 0.34, pz + 0.01, 0.07, 2);
  rock(px + 0.02, pz + 0.1, 0.035, 0.088);

  // ---------- cherry tree ----------
  const tx = -0.4, tz = -0.4;
  b.sweep(
    catmull([[tx, 0.07, tz], [tx - 0.01, 0.18, tz], [tx + 0.02, 0.28, tz + 0.02], [tx + 0.04, 0.34, tz + 0.04]]),
    [0.042, 0.03, 0.02, 0.012],
    { color: "#4a3a33", bone: root },
  );
  const tips: number[][] = [[tx - 0.13, 0.4, tz - 0.02], [tx + 0.1, 0.44, tz + 0.1], [tx - 0.06, 0.45, tz + 0.1], [tx + 0.04, 0.48, tz - 0.08]];
  const roots: number[][] = [[tx - 0.01, 0.2, tz], [tx + 0.02, 0.28, tz + 0.02], [tx + 0.03, 0.32, tz + 0.03], [tx + 0.04, 0.33, tz + 0.03]];
  tips.forEach((t, i) => {
    const r = roots[i];
    b.sweep(bezier(r, [(r[0] + t[0]) / 2, r[1] + 0.05, (r[2] + t[2]) / 2], t), [0.016, 0.005], { color: "#4a3a33", bone: root });
  });
  const pinks = ["#f6b8cf", "#f9cfdd", "#f2a3c0", "#fbdde6"];
  const cr = rng(77);
  const centers = [...tips, [tx + 0.03, 0.4, tz + 0.04]];
  centers.forEach((c, ci) => {
    for (let k = 0; k < 5; k++) {
      const s = 0.05 + cr() * 0.04;
      P(ico(), pinks[(ci + k) % 4], {
        at: [c[0] + (cr() - 0.5) * 0.12, c[1] + (cr() - 0.3) * 0.09, c[2] + (cr() - 0.5) * 0.12],
        scale: [s, s * 0.8, s],
        flat: true,
      });
    }
  });
  // petals
  const pr = rng(5);
  const inPond = (x: number, z: number) => ((x - cx) / 0.36) ** 2 + ((z - cz) / 0.25) ** 2 < 1;
  const inGravel = (x: number, z: number) => x > gx - 0.2 && x < gx + 0.2 && z > gzc - 0.2 && z < gzc + 0.2;
  for (let i = 0; i < 80; i++) {
    const falling = i >= 45;
    const x = falling ? tx + (pr() - 0.4) * 0.45 : -0.55 + pr() * 0.6;
    const z = falling ? tz + (pr() - 0.3) * 0.5 : -0.5 + pr() * 0.85;
    if (Math.abs(z - bz) < 0.09 && x > -0.48 && x < 0.28) continue;
    const y = falling ? 0.1 + pr() * 0.34 : inPond(x, z) ? 0.0888 : inGravel(x, z) ? 0.0885 : 0.0815;
    P(box(0.012, 0.0012, 0.009), pinks[i % 2 ? 3 : 0], {
      at: [x, y, z],
      rotation: falling ? [pr() * 90, pr() * 180, pr() * 90] : [0, pr() * 180, 0],
    });
  }

  // ---------- bushes ----------
  for (const [x, z, s] of [[0.5, 0.2, 0.05], [-0.52, 0.12, 0.045], [0.52, 0.42, 0.04]]) {
    P(ico(), "#3e7d3a", { at: [x, G + s * 0.5, z], scale: [s, s * 0.7, s], flat: true });
    P(ico(), "#4a8e42", { at: [x + s * 0.5, G + s * 0.4, z + s * 0.3], scale: [s * 0.6, s * 0.45, s * 0.6], flat: true });
  }

  return b.root;
}
