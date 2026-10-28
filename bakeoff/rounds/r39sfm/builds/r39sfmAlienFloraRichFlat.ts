import * as THREE from "three";
import { createBuilder, rng, bezier, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pandoran Lumen Bloom",
  description:
    "A bioluminescent alien plant in an Avatar/Pandora style: a glowing stalk with arching veined fronds, a petal crown with luminous stamens, root buttresses, spore pods and hanging glow strands.",
};

// Palette: deep indigo foliage, neon cyan/teal veins, magenta blooms.
const STEM = "#241a4d";
const STEM_LIGHT = "#33276e";
const BLADES = ["#1c3a7a", "#243f94", "#2a2f86", "#173e72"];
const RIM = "#58f0ff";
const TEAL = "#2cf5d8";
const CYAN = "#7fe9ff";
const MAGENTA = "#d64cff";
const PINK = "#ff7ad9";
const PETAL = ["#7a2cc4", "#9a38d8"];
const HUSK = "#2a1860";
const ROOT = "#1a1440";

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (v: THREE.Vector3) => v.toArray() as number[];

export default function build() {
  const b = createBuilder({ name: "lumenBloom" });
  const R = rng(11);
  const g = <T,>(t: T, s = 1) => glow(t as any, s) as T;

  const orb = (at: number[] | THREE.Vector3, r: number, color: string, s = 1.2, sc: number[] = [1, 1, 1]) =>
    g(b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: Array.isArray(at) ? at : arr(at), scale: sc as any, flat: true }), s);

  // ---------- Stalk ----------
  const STALK_H = 1.15;
  const stalkPath = catmull([
    [0, -0.02, 0],
    [0.03, 0.4, -0.02],
    [-0.02, 0.8, 0.03],
    [0, STALK_H, 0.02],
  ]);
  b.sweep(stalkPath, [0.075, 0.035], { color: STEM, sides: 8 });
  // paler ridge on the front of the stalk
  b.sweep(stalkPath.slice(0.05, 0.95), [0.02, 0.01], {
    color: STEM_LIGHT,
    sides: 5,
    shift: [0, 0.055],
  });
  const stalkR = (t: number) => 0.075 - 0.04 * t;

  // glowing rings along the stalk
  for (let i = 0; i < 7; i++) {
    const t = 0.1 + i * 0.125;
    const p = stalkPath.at(t);
    const tan = stalkPath.tangentAt(t);
    g(
      b.part(new THREE.TorusGeometry(stalkR(t) * 1.02, 0.008, 5, 12), i % 2 ? TEAL : CYAN, {
        at: arr(p),
        dir: arr(tan),
        axis: "z",
        flat: true,
      }),
      1.2,
    );
  }

  // ---------- Roots ----------
  for (let i = 0; i < 6; i++) {
    const a = i * (Math.PI / 3) + 0.3;
    const o = v3(Math.sin(a), 0, Math.cos(a));
    const rp = catmull([
      arr(o.clone().multiplyScalar(0.03).setY(0.2)),
      arr(o.clone().multiplyScalar(0.18).setY(0.11)),
      arr(o.clone().multiplyScalar(0.38).setY(0.04)),
      arr(o.clone().multiplyScalar(0.55 + R() * 0.1).setY(-0.005)),
    ]);
    b.sweep(rp, [0.06, 0.012], { color: ROOT, sides: 6 });
    g(b.sweep(rp.slice(0.25, 0.92), [0.007, 0.003], { color: TEAL, sides: 4, shift: [0, 0.03] } as any), 1.2);
    for (const t of [0.4, 0.7]) {
      const p = rp.at(t);
      orb(p.clone().add(v3(0, 0.03, 0)), 0.014 + 0.008 * (1 - t), t < 0.5 ? CYAN : TEAL, 1.4);
    }
  }
  // base collar
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.12, 0.07],
      [0.07, 0.15],
      [0, 0.15],
    ],
    { at: [0, -0.01, 0], color: ROOT, segments: 8 },
  );

  // ---------- Fronds ----------
  const tips: { p: THREE.Vector3; side: THREE.Vector3; out: THREE.Vector3 }[] = [];
  for (let i = 0; i < 9; i++) {
    const az = i * 2.4 + 0.4;
    const h = 0.28 + i * 0.077;
    const len = 0.92 - i * 0.05;
    const lift = 0.3 + i * 0.01;
    const droop = 0.3 - i * 0.026;
    const W = 0.18 - i * 0.009;
    const out = v3(Math.sin(az), 0, Math.cos(az));
    const side = v3(Math.cos(az), 0, -Math.sin(az));
    const base = stalkPath.at(Math.min(1, h / STALK_H)).clone().add(out.clone().multiplyScalar(0.035));
    const mk = (d: number, y: number) => base.clone().add(out.clone().multiplyScalar(len * d)).add(v3(0, y, 0));
    const curve = bezier(arr(base), arr(mk(0.4, lift)), arr(mk(0.8, lift * 0.85)), arr(mk(1, lift - droop)));
    const N = 10;
    const mid: THREE.Vector3[] = [];
    const eL: THREE.Vector3[] = [];
    const eR: THREE.Vector3[] = [];
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const p = curve.at(t).clone();
      const w = W * Math.pow(Math.sin(Math.PI * Math.min(0.98, t * 0.92 + 0.06)), 0.75) * (1 + 0.15 * Math.sin(t * 9 + i)) + 0.004;
      mid.push(p);
      const up = v3(0, w * 0.28, 0);
      eL.push(p.clone().add(side.clone().multiplyScalar(w)).add(up));
      eR.push(p.clone().sub(side.clone().multiplyScalar(w)).add(up));
    }
    const blade = BLADES[i % BLADES.length];
    b.membrane(eL.map(arr), eR.map(arr), { color: blade, thickness: 0.01, rows: 4 });
    // rim glow
    g(b.sweep(catmull(eL.map((p) => arr(p.clone().add(v3(0, 0.006, 0))))), 0.0045, { color: RIM, sides: 4 }), 0.8);
    g(b.sweep(catmull(eR.map((p) => arr(p.clone().add(v3(0, 0.006, 0))))), 0.0045, { color: RIM, sides: 4 }), 0.8);
    // midrib + glowing vein
    b.sweep(catmull(mid.map(arr)), [0.016, 0.004], { color: STEM, sides: 6 });
    g(
      b.sweep(catmull(mid.slice(1).map((p) => arr(p.clone().add(v3(0, 0.014, 0))))), [0.006, 0.0025], { color: TEAL, sides: 4 }),
      1.4,
    );
    // side veins
    for (let k = 2; k < N - 1; k++) {
      const a0 = mid[k].clone().add(v3(0, 0.012, 0));
      for (const [e, s] of [
        [eL, 1],
        [eR, -1],
      ] as [THREE.Vector3[], number][]) {
        const tgt = e[Math.min(N, k + 1)].clone().lerp(mid[Math.min(N, k + 1)], 0.2).add(v3(0, 0.008, 0));
        b.rod(arr(a0), arr(tgt), 0.0035, k % 2 ? TEAL : CYAN, { sides: 4 } as any);
        void s;
      }
    }
    // glowing bead nodes along the veins
    for (const k of [3, 5, 7]) {
      orb(mid[k].clone().add(v3(0, 0.026, 0)), 0.01, PINK, 1.3);
    }
    orb(mid[N].clone().add(v3(0, 0.01, 0)), 0.017, MAGENTA, 1.5);
    tips.push({ p: mid[N].clone(), side, out });
  }

  // ---------- Hanging glow strands ----------
  for (const tp of tips) {
    for (let k = -1; k <= 1; k++) {
      const s0 = tp.p.clone().add(tp.side.clone().multiplyScalar(k * 0.045)).add(tp.out.clone().multiplyScalar(-0.02 * Math.abs(k)));
      const L = Math.max(0.12, Math.min(0.34, tp.p.y - 0.04)) * (0.8 + R() * 0.3);
      const sway = (R() - 0.5) * 0.05;
      const sp = catmull([
        arr(s0),
        arr(s0.clone().add(v3(sway, -L * 0.35, 0))),
        arr(s0.clone().add(v3(-sway, -L * 0.7, 0.01))),
        arr(s0.clone().add(v3(sway * 0.5, -L, 0))),
      ]);
      g(b.sweep(sp, [0.004, 0.0025], { color: k === 0 ? CYAN : TEAL, sides: 4 }), 1.0);
      orb(sp.at(0.55), 0.008, PINK, 1.3);
      orb(sp.at(1).clone().add(v3(0, -0.004, 0)), 0.014, k === 0 ? MAGENTA : CYAN, 1.5);
    }
  }

  // ---------- Spore pods on the stalk ----------
  [
    [0.3, 0.5],
    [0.5, 3.4],
    [0.62, 1.7],
    [0.42, 5.2],
  ].forEach(([t, az]) => {
    const sp = stalkPath.at(t);
    const o = v3(Math.sin(az), 0, Math.cos(az));
    const pos = sp.clone().add(o.clone().multiplyScalar(0.14)).add(v3(0, 0.02, 0));
    b.sweep(catmull([arr(sp), arr(sp.clone().add(o.clone().multiplyScalar(0.08)).add(v3(0, 0.0, 0))), arr(pos)]), [0.014, 0.01], {
      color: STEM_LIGHT,
      sides: 5,
    });
    orb(pos, 0.045, MAGENTA, 1.1, [1, 1.25, 1]);
    orb(pos.clone().add(o.clone().multiplyScalar(0.025)).add(v3(0.0, 0.01, 0)), 0.022, "#ffd6fa", 1.5);
    b.part(new THREE.ConeGeometry(0.05, 0.07, 6), HUSK, { at: arr(pos.clone().add(v3(0, 0.06, 0))), dir: [0, 1, 0], flat: true });
    g(
      b.part(new THREE.TorusGeometry(0.047, 0.006, 4, 10), PINK, { at: arr(pos.clone().add(v3(0, 0.02, 0))), dir: [0, 1, 0], axis: "z", flat: true }),
      1.0,
    );
  });

  // ---------- Crown ----------
  const crown = stalkPath.at(1).clone();
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.11, 0.06],
      [0.12, 0.12],
      [0.09, 0.1],
      [0.05, 0.04],
      [0, 0.04],
    ],
    { at: arr(crown.clone().add(v3(0, -0.03, 0))), color: HUSK, segments: 8 },
  );
  g(
    b.part(new THREE.TorusGeometry(0.1, 0.007, 4, 12), TEAL, { at: arr(crown.clone().add(v3(0, 0.08, 0))), dir: [0, 1, 0], axis: "z", flat: true }),
    1.2,
  );
  // petals
  for (let i = 0; i < 6; i++) {
    const a = i * (Math.PI / 3);
    const o = v3(Math.sin(a), 0, Math.cos(a));
    const p0 = crown.clone().add(o.clone().multiplyScalar(0.085)).add(v3(0, 0.06, 0));
    const p1 = p0.clone().add(o.clone().multiplyScalar(0.12)).add(v3(0, 0.14, 0));
    const p2 = p0.clone().add(o.clone().multiplyScalar(0.2)).add(v3(0, 0.3, 0));
    const pp = bezier(arr(p0), arr(p1), arr(p2));
    b.sweep(pp, (t: number) => [0.045 * Math.sin(Math.PI * (t * 0.85 + 0.12)) + 0.004, 0.006], {
      color: PETAL[i % 2],
      sides: 4,
      caps: "point",
    } as any);
    g(b.sweep(pp.slice(0.1, 0.85), [0.006, 0.002], { color: PINK, sides: 4, shift: [0, 0.007] } as any), 1.2);
    orb(pp.at(1), 0.014, PINK, 1.5);
  }
  // luminous stamen filaments
  for (let i = 0; i < 11; i++) {
    const a = i * 2.4;
    const o = v3(Math.sin(a), 0, Math.cos(a));
    const hgt = 0.2 + (i % 4) * 0.08;
    const spread = 0.05 + (i % 3) * 0.045;
    const s0 = crown.clone().add(v3(0, 0.08, 0)).add(o.clone().multiplyScalar(0.02));
    const sp = catmull([
      arr(s0),
      arr(s0.clone().add(v3(0, hgt * 0.5, 0)).add(o.clone().multiplyScalar(spread * 0.4))),
      arr(s0.clone().add(v3(0, hgt, 0)).add(o.clone().multiplyScalar(spread))),
      arr(s0.clone().add(v3(0, hgt * 0.95, 0)).add(o.clone().multiplyScalar(spread * 1.9))),
    ]);
    g(b.sweep(sp, [0.006, 0.003], { color: i % 2 ? CYAN : TEAL, sides: 4 }), 1.0);
    const tip = sp.at(1);
    orb(tip, 0.02, i % 2 ? PINK : CYAN, 1.6);
    orb(tip.clone().add(v3(0, 0.025, 0)), 0.008, "#ffffff", 1.6);
  }
  // central spire
  const spire = catmull([
    arr(crown.clone().add(v3(0, 0.05, 0))),
    arr(crown.clone().add(v3(0.01, 0.25, 0))),
    arr(crown.clone().add(v3(-0.01, 0.5, 0.01))),
  ]);
  g(b.sweep(spire, [0.024, 0.006], { color: CYAN, sides: 6, caps: "point" } as any), 1.2);
  orb(spire.at(1).clone().add(v3(0, 0.02, 0)), 0.04, MAGENTA, 1.8);
  orb(spire.at(1).clone().add(v3(0, 0.025, 0.012)), 0.014, "#ffffff", 1.8);
  for (let i = 0; i < 4; i++) {
    orb(spire.at(0.25 + i * 0.2), 0.012, i % 2 ? PINK : TEAL, 1.5);
  }

  return b.root;
}
