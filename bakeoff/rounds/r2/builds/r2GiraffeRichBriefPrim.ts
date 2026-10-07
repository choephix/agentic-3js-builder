import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Young reticulated giraffe",
  description:
    "Low-poly rigged giraffe calf with chestnut patches outlined in cream, a stiff mane, fuzzy ossicones, big ears, lashes, a dark tongue and cream socks.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  const CREAM = "#f0dcae", CHEST = "#9b4a1f", CHEST2 = "#82391a", TAN = "#c88a4a";
  const DARK = "#2a1a12", MANE = "#4a2a14", HOOF = "#2b2321", PINK = "#d9958c";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.5, -0.55] });
  const spine = b.joint("spine", { at: [0, 1.65, 0.3], parent: hips });
  const neckPts = [V(0, 1.9, 0.6), V(0, 2.4, 0.85), V(0, 2.9, 1.08), V(0, 3.3, 1.3)];
  const neck1 = b.joint("neck1", { at: neckPts[0].toArray() as [number, number, number], parent: spine });
  const neck2 = b.joint("neck2", { at: neckPts[1].toArray() as [number, number, number], parent: neck1 });
  const neck3 = b.joint("neck3", { at: neckPts[2].toArray() as [number, number, number], parent: neck2 });
  const head = b.joint("head", { at: neckPts[3].toArray() as [number, number, number], parent: neck3 });
  const jaw = b.joint("jaw", { at: [0, 3.34, 1.55], parent: head });
  const earL = b.joint("earL", { at: [0.15, 3.55, 1.38], parent: head });
  const earR = b.joint("earR", { at: [-0.15, 3.55, 1.38], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 1.85, -0.9], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 1.4, -1.0], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.95, -1.02], parent: tail2 });

  type Leg = { hip: THREE.Object3D | any; knee: any; ank: any };
  const legs: Record<string, Leg> = {};
  const legDef = [
    ["F", 0.55, spine, 1.45, 0.72, 0.13, 0.03],
    ["H", -0.75, hips, 1.5, 0.85, 0.15, -0.1],
  ] as const;
  for (const [fr, z, par, hy, ky, ay, dz] of legDef) {
    for (const [sn, s] of [["L", 1], ["R", -1]] as const) {
      const hip = b.joint(`hip${fr}${sn}`, { at: [0.2 * s, hy, z], parent: par });
      const knee = b.joint(`knee${fr}${sn}`, { at: [0.2 * s, ky, z + dz * 0.6], parent: hip });
      const ank = b.joint(`ankle${fr}${sn}`, { at: [0.2 * s, ay, z + dz], parent: knee });
      legs[fr + sn] = { hip, knee, ank };
    }
  }

  // ---------- helpers ----------
  const qY = (d: THREE.Vector3) =>
    new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
  const qZ = (d: THREE.Vector3) =>
    new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), d.clone().normalize());
  const P = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, bone: any) =>
    b.part(geo, color, { at: at.toArray() as [number, number, number], bone });
  const seg = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, color: string, bone: any, sides = 7) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), sides);
    g.applyQuaternion(qY(d));
    return P(g, color, a.clone().add(c).multiplyScalar(0.5), bone);
  };
  const ball = (c: THREE.Vector3, r: [number, number, number], color: string, bone: any, detail = 1) => {
    const g = new THREE.IcosahedronGeometry(1, detail);
    g.scale(r[0], r[1], r[2]);
    return P(g, color, c, bone);
  };
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // patch: cream outline plate with chestnut plate on top, lying on surface
  const patch = (pos: THREE.Vector3, n: THREE.Vector3, s: number, bone: any) => {
    const q = qZ(n);
    const rot = rnd() * Math.PI * 2;
    const sq = rnd() * 0.3 + 0.8;
    const mk = (k: number, lift: number, color: string) => {
      const g = new THREE.IcosahedronGeometry(1, 0);
      g.scale(s * k, s * k * sq, 0.03);
      g.rotateZ(rot);
      g.applyQuaternion(q);
      P(g, color, pos.clone().addScaledVector(n, lift), bone);
    };
    mk(1.0, 0.0, CREAM);
    mk(0.8, 0.012, rnd() > 0.5 ? CHEST : CHEST2);
  };

  // ---------- body ----------
  const BC = V(0, 1.62, 0.0), BR: [number, number, number] = [0.38, 0.42, 0.95];
  ball(BC, BR, CREAM, spine, 2);
  ball(V(0, 1.6, 0.55), [0.36, 0.42, 0.4], CREAM, spine, 1);
  ball(V(0, 1.55, -0.5), [0.34, 0.38, 0.4], CREAM, hips, 1);
  // sloping back hump at shoulder
  ball(V(0, 1.9, 0.45), [0.2, 0.18, 0.3], CHEST2, spine, 1);

  const E = [-0.15, 0.4, 0.85];
  E.forEach((el, ei) => {
    const n = 12 - ei * 2;
    for (let i = 0; i < n; i++) {
      const A = ((i + (ei % 2) * 0.5) / n) * Math.PI * 2;
      const p = V(BR[0] * Math.cos(el) * Math.sin(A), BR[1] * Math.sin(el), BR[2] * Math.cos(el) * Math.cos(A));
      const nn = V(p.x / BR[0] ** 2, p.y / BR[1] ** 2, p.z / BR[2] ** 2).normalize();
      const bone = p.z > -0.1 ? spine : hips;
      patch(BC.clone().add(p).addScaledVector(nn, -0.01), nn, 0.115 + rnd() * 0.04, bone);
    }
  });

  // ---------- neck ----------
  const nb = [neck1, neck2, neck3];
  const nr = [0.2, 0.16, 0.13, 0.095];
  for (let i = 0; i < 3; i++) seg(neckPts[i], neckPts[i + 1], nr[i], nr[i + 1], CREAM, nb[i], 8);
  for (let i = 0; i < 3; i++) {
    const a = neckPts[i + 1].clone().sub(neckPts[i]).normalize();
    const back = V(0, a.z, -a.y).normalize();
    for (let row = 0; row < 2; row++) {
      const t = 0.25 + row * 0.5;
      const c = neckPts[i].clone().lerp(neckPts[i + 1], t);
      const r = nr[i] + (nr[i + 1] - nr[i]) * t;
      const cnt = 6;
      for (let k = 0; k < cnt; k++) {
        const th = ((k + row * 0.5) / cnt) * Math.PI * 2;
        const dir = V(Math.cos(th), 0, 0).addScaledVector(back, Math.sin(th)).normalize();
        patch(c.clone().addScaledVector(dir, r * 0.93), dir, 0.085 - i * 0.006, nb[i]);
      }
    }
    // mane tufts down the back of the neck
    for (let k = 0; k < 5; k++) {
      const t = (k + 0.5) / 5;
      const c = neckPts[i].clone().lerp(neckPts[i + 1], t);
      const r = nr[i] + (nr[i + 1] - nr[i]) * t;
      const pos = c.clone().addScaledVector(back, r + 0.025);
      const g = new THREE.BoxGeometry(0.035, 0.12, 0.06);
      g.applyQuaternion(qY(back.clone().add(a.clone().multiplyScalar(-0.2))));
      P(g, MANE, pos, nb[i]);
    }
  }

  // ---------- head ----------
  const H = V(0, 3.45, 1.45);
  ball(V(0, 3.42, 1.42), [0.14, 0.15, 0.2], TAN, head, 1);
  seg(V(0, 3.42, 1.55), V(0, 3.3, 1.88), 0.1, 0.085, TAN, head, 6);
  ball(V(0, 3.29, 1.9), [0.085, 0.07, 0.06], DARK, head, 1);
  ball(V(0.035, 3.3, 1.94), [0.02, 0.02, 0.02], "#000000", head, 0);
  ball(V(-0.035, 3.3, 1.94), [0.02, 0.02, 0.02], "#000000", head, 0);
  // cream muzzle band and cheeks
  ball(V(0, 3.26, 1.8), [0.09, 0.05, 0.1], CREAM, head, 1);
  // lower jaw
  seg(V(0, 3.31, 1.58), V(0, 3.22, 1.86), 0.07, 0.06, CREAM, jaw, 6);
  // tongue, long and dark, peeking out
  const tg = new THREE.BoxGeometry(0.045, 0.018, 0.2);
  P(tg, "#3d2330", V(0.0, 3.26, 1.92), jaw);
  ball(V(0, 3.255, 2.03), [0.026, 0.012, 0.03], "#3d2330", jaw, 0);
  // a couple of head patches
  patch(V(0.13, 3.46, 1.38), V(1, 0.1, 0), 0.06, head);
  patch(V(-0.13, 3.46, 1.38), V(-1, 0.1, 0), 0.06, head);

  for (const s of [1, -1]) {
    // eyes + lashes
    const ep = V(0.12 * s, 3.48, 1.56);
    ball(ep, [0.045, 0.05, 0.05], DARK, head, 1);
    ball(ep.clone().add(V(0.02 * s, 0.015, 0.02)), [0.012, 0.012, 0.012], "#ffffff", head, 0);
    for (let k = 0; k < 4; k++) {
      const ang = -0.2 + k * 0.45;
      const d = V(0.5 * s, Math.sin(ang) + 0.5, Math.cos(ang) * 0.6).normalize();
      const g = new THREE.BoxGeometry(0.006, 0.075, 0.006);
      g.applyQuaternion(qY(d));
      P(g, "#000000", ep.clone().add(V(0.015 * s, 0.045, -0.035 + k * 0.035)).addScaledVector(d, 0.03), head);
    }
    // ears
    const eb = s > 0 ? earL : earR;
    const ec = V(0.28 * s, 3.62, 1.36);
    const eg = new THREE.ConeGeometry(0.1, 0.34, 5);
    eg.scale(1, 1, 0.35);
    eg.applyQuaternion(qY(V(s * 0.9, 0.35, -0.1)));
    P(eg, TAN, ec, eb);
    const ig = new THREE.ConeGeometry(0.065, 0.26, 5);
    ig.scale(1, 1, 0.3);
    ig.applyQuaternion(qY(V(s * 0.9, 0.35, -0.1)));
    P(ig, PINK, ec.clone().add(V(0, 0, 0.025)), eb);
    ball(ec.clone().add(V(-0.13 * s, -0.04, 0)), [0.04, 0.04, 0.04], TAN, eb, 0);
    // ossicones
    const ob = V(0.075 * s, 3.57, 1.36), ot = V(0.085 * s, 3.88, 1.3);
    seg(ob, ot, 0.032, 0.024, TAN, head, 6);
    ball(ot.clone().add(V(0, 0.03, 0)), [0.05, 0.06, 0.05], DARK, head, 1);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.012, 0.06, 0.012);
      g.applyQuaternion(qY(V(Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6)));
      P(g, DARK, ot.clone().add(V(Math.cos(a) * 0.035, 0.08, Math.sin(a) * 0.035)), head);
    }
    // fuzz on the shaft
    ball(ob.clone().lerp(ot, 0.5), [0.036, 0.1, 0.036], "#7a4a28", head, 0);
  }

  // ---------- legs ----------
  for (const fr of ["F", "H"]) {
    for (const [sn, s] of [["L", 1], ["R", -1]] as const) {
      const L = legs[fr + sn];
      const hp = V(...(L.hip.position.toArray() as [number, number, number]));
      const hipPos = V(0.2 * s, fr === "F" ? 1.45 : 1.5, fr === "F" ? 0.55 : -0.75);
      const kneePos = V(0.2 * s, fr === "F" ? 0.72 : 0.85, fr === "F" ? 0.58 : -0.7);
      const ankPos = V(0.2 * s, 0.13, fr === "F" ? 0.58 : -0.85);
      void hp;
      seg(hipPos, kneePos, fr === "F" ? 0.13 : 0.15, 0.085, TAN, L.hip, 7);
      ball(kneePos, [0.09, 0.09, 0.09], CREAM, L.knee, 1);
      const mid = kneePos.clone().lerp(ankPos, 0.45);
      seg(kneePos, mid, 0.075, 0.06, "#e3c58f", L.knee, 7);
      seg(mid, ankPos, 0.06, 0.055, CREAM, L.knee, 7);
      ball(ankPos, [0.07, 0.06, 0.07], CREAM, L.ank, 1);
      // hoof
      P(new THREE.BoxGeometry(0.13, 0.11, 0.17), HOOF, V(0.2 * s, 0.055, ankPos.z + 0.015), L.ank);
      // patches on upper leg
      for (let k = 0; k < 2; k++) {
        const pp = hipPos.clone().lerp(kneePos, 0.25 + k * 0.4);
        pp.x += 0.1 * s;
        patch(pp, V(s, 0, 0), 0.07 - k * 0.012, L.hip);
      }
      const pf = hipPos.clone().lerp(kneePos, 0.5);
      pf.z += 0.1;
      patch(pf.clone().add(V(0.02 * s, 0, 0)), V(0.2 * s, 0, 1).normalize(), 0.055, L.hip);
    }
  }

  // ---------- tail ----------
  seg(V(0, 1.85, -0.9), V(0, 1.4, -1.0), 0.05, 0.04, TAN, tail1, 6);
  seg(V(0, 1.4, -1.0), V(0, 0.98, -1.02), 0.04, 0.032, TAN, tail2, 6);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const g = new THREE.BoxGeometry(0.02, 0.2, 0.02);
    g.applyQuaternion(qY(V(Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3)));
    P(g, DARK, V(Math.cos(a) * 0.03, 0.88, -1.02 + Math.sin(a) * 0.03), tail3);
  }
  ball(V(0, 0.98, -1.02), [0.04, 0.06, 0.04], DARK, tail3, 0);

  return b.root;
}
