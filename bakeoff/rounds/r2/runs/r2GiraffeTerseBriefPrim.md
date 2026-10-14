```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Giraffe",
  description: "A stylized, rigged giraffe built from primitives: patchwork coat, long neck, ossicones, separate jaw, tufted tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "giraffe" });
  const R = rng(7);

  const COAT = "#e9b95a", BELLY = "#f5e2b0", PATCH = "#9a5522", PATCH2 = "#7d3f19";
  const DARK = "#2b1b13", MANE = "#6b3a1a", PINK = "#c98f78";

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const J = (name: string, at: number[], parent?: any, role?: string) =>
    (b as any).joint(name, parent ? { at, parent, role } : { at, role });

  // ---------- skeleton ----------
  const hips = J("hips", [0, 2.8, -0.6], undefined, "spine");
  const spine = J("spine", [0, 2.9, 0.2], hips, "spine");
  const chest = J("chest", [0, 3.0, 0.8], spine, "spine");

  const N0 = V(0, 3.2, 0.95), N1 = V(0, 5.0, 1.85);
  const N = (t: number) => N0.clone().lerp(N1, t);
  const neck: any[] = [];
  let prev: any = chest;
  [0, 0.25, 0.5, 0.75].forEach((t, i) => {
    const p = N(t);
    prev = J("neck" + (i + 1), [p.x, p.y, p.z], prev, "neck");
    neck.push(prev);
  });
  const head = J("head", [N1.x, N1.y, N1.z], prev, "head");
  const jaw = J("jaw", [0, 4.9, 2.0], head, "jaw");

  const tail1 = J("tail1", [0, 3.0, -1.2], hips, "tail");
  const tail2 = J("tail2", [0, 2.6, -1.27], tail1, "tail");
  const tail3 = J("tail3", [0, 2.2, -1.3], tail2, "tail");

  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const x = s * 0.27;
    const sh = J("shoulder" + k, [x, 2.6, 0.7], chest, "leg");
    const wr = J("wrist" + k, [x, 1.25, 0.7], sh, "leg");
    const ff = J("fetlockF" + k, [x, 0.32, 0.7], wr, "leg");
    const hp = J("hip" + k, [x, 2.5, -0.65], hips, "leg");
    const hk = J("hock" + k, [x, 1.25, -0.65], hp, "leg");
    const fb = J("fetlockB" + k, [x, 0.32, -0.65], hk, "leg");
    legs[k] = { sh, wr, ff, hp, hk, fb };
  }

  // ---------- helpers ----------
  function seg(a: THREE.Vector3, c: THREE.Vector3, r1: number, r2: number, color: string, bone: any, rs = 8) {
    const len = a.distanceTo(c);
    const g = new THREE.CylinderGeometry(r2, r1, len, rs);
    b.part(g, color, { at: a.clone().add(c).multiplyScalar(0.5), dir: c.clone().sub(a), bone } as any);
  }
  function ell(c: THREE.Vector3, rx: number, ry: number, rz: number, color: string, bone: any, seg_ = 10) {
    const g = new THREE.SphereGeometry(1, seg_, Math.max(6, seg_ - 2));
    g.scale(rx, ry, rz);
    b.part(g, color, { at: c, bone } as any);
  }
  function patch(p: THREE.Vector3, n: THREE.Vector3, r: number, color: string, bone: any) {
    const g = new THREE.IcosahedronGeometry(1, 0);
    g.scale(r, 0.03, r * (0.7 + R() * 0.5));
    b.part(g, color, { at: p, dir: n, bone } as any);
  }

  // ---------- torso ----------
  ell(V(0, 2.85, -0.55), 0.42, 0.5, 0.7, COAT, hips);
  ell(V(0, 2.95, 0.65), 0.45, 0.58, 0.7, COAT, chest);
  ell(V(0, 2.82, 0.05), 0.42, 0.5, 0.6, COAT, spine);
  ell(V(0, 2.55, 0.05), 0.3, 0.2, 0.9, BELLY, spine, 8);
  // withers hump
  ell(V(0, 3.4, 0.8), 0.25, 0.2, 0.4, COAT, chest, 8);

  // torso patches
  const c0 = V(0, 2.9, 0.05), rr = [0.47, 0.58, 1.4];
  for (let i = 0; i < 46; i++) {
    const u = (R() * 2 - 1) * 0.82;
    const a = -0.25 * Math.PI + R() * 1.5 * Math.PI;
    const q = Math.sqrt(1 - u * u);
    const lx = rr[0] * q * Math.cos(a), ly = rr[1] * q * Math.sin(a), lz = rr[2] * u;
    const p = c0.clone().add(V(lx, ly, lz));
    const n = V(lx / rr[0] ** 2, ly / rr[1] ** 2, lz / rr[2] ** 2).normalize();
    p.addScaledVector(n, -0.03);
    const bone = lz < -0.5 ? hips : lz > 0.55 ? chest : spine;
    patch(p, n, 0.1 + R() * 0.08, R() > 0.5 ? PATCH : PATCH2, bone);
  }

  // ---------- neck ----------
  const nd = N1.clone().sub(N0).normalize();
  for (let i = 0; i < 4; i++) {
    const t0 = i / 4, t1 = (i + 1) / 4;
    const r = (t: number) => 0.27 - 0.12 * t;
    seg(N(t0), N(t1 + (i === 3 ? 0 : 0.02)), r(t0), r(t1), COAT, neck[i], 9);
  }
  const side = V(1, 0, 0);
  const w = nd.clone().cross(side).normalize();
  for (let i = 0; i < 30; i++) {
    const t = 0.05 + R() * 0.9;
    const a = R() * Math.PI * 2;
    const n = side.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a)).normalize();
    const rad = 0.27 - 0.12 * t;
    const p = N(t).addScaledVector(n, rad - 0.015);
    patch(p, n, 0.07 + R() * 0.05 + (1 - t) * 0.03, R() > 0.5 ? PATCH : PATCH2, neck[Math.min(3, Math.floor(t * 4))]);
  }
  // mane
  const up = V(0, nd.z, -nd.y).normalize();
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const rad = 0.27 - 0.12 * t;
    const p = N(t).addScaledVector(up, rad + 0.02);
    const g = new THREE.BoxGeometry(0.05, 0.1, 0.1);
    b.part(g, MANE, { at: p, dir: up, bone: neck[Math.min(3, Math.floor(t * 4))] } as any);
  }

  // ---------- head ----------
  const H = N1.clone();
  const hp = (x: number, y: number, z: number) => H.clone().add(V(x, y, z));
  ell(hp(0, 0, 0.08), 0.17, 0.19, 0.3, COAT, head);
  b.part(new THREE.BoxGeometry(0.2, 0.17, 0.36), COAT, { at: hp(0, -0.1, 0.38), bone: head } as any);
  b.part(new THREE.BoxGeometry(0.21, 0.07, 0.1), PINK, { at: hp(0, -0.13, 0.58), bone: head } as any);
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), DARK, { at: hp(s * 0.06, -0.06, 0.58), bone: head } as any);
    // eyes
    ell(hp(s * 0.15, 0.07, 0.17), 0.05, 0.055, 0.055, DARK, head, 7);
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#ffffff", { at: hp(s * 0.19, 0.09, 0.2), bone: head } as any);
    // brow
    b.part(new THREE.BoxGeometry(0.07, 0.025, 0.12), PATCH2, { at: hp(s * 0.14, 0.14, 0.17), bone: head } as any);
    // ears
    const eg = new THREE.SphereGeometry(1, 7, 5); eg.scale(0.04, 0.13, 0.07);
    b.part(eg, COAT, { at: hp(s * 0.27, 0.13, -0.04), dir: V(s * 0.9, 0.5, 0), bone: head } as any);
    const eg2 = new THREE.SphereGeometry(1, 6, 4); eg2.scale(0.02, 0.09, 0.045);
    b.part(eg2, PINK, { at: hp(s * 0.29, 0.13, -0.035), dir: V(s * 0.9, 0.5, 0), bone: head } as any);
    // ossicones
    seg(hp(s * 0.08, 0.17, 0.06), hp(s * 0.09, 0.47, 0.03), 0.035, 0.028, COAT, head, 6);
    ell(hp(s * 0.09, 0.5, 0.03), 0.055, 0.06, 0.055, DARK, head, 6);
    // cheek patch
    patch(hp(s * 0.168, 0.0, 0.1), V(s, 0, 0), 0.07, PATCH, head);
  }
  // jaw
  b.part(new THREE.BoxGeometry(0.17, 0.07, 0.34), COAT, { at: V(0, 4.87, 2.2), bone: jaw } as any);
  b.part(new THREE.BoxGeometry(0.18, 0.05, 0.08), PINK, { at: V(0, 4.87, 2.4), bone: jaw } as any);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const L = legs[k];
    const x = s * 0.27;
    const front = [0.7, 2.6, 1.25, 0.32] as const;
    // front
    seg(V(x, 2.65, 0.7), V(x, 1.25, 0.7), 0.17, 0.11, COAT, L.sh);
    ell(V(x, 1.25, 0.7), 0.115, 0.1, 0.115, COAT, L.wr, 7);
    seg(V(x, 1.25, 0.7), V(x, 0.32, 0.7), 0.1, 0.075, COAT, L.wr);
    ell(V(x, 0.32, 0.7), 0.085, 0.08, 0.09, BELLY, L.ff, 7);
    seg(V(x, 0.32, 0.7), V(x, 0.12, 0.7), 0.075, 0.08, BELLY, L.ff);
    b.part(new THREE.BoxGeometry(0.17, 0.12, 0.2), DARK, { at: V(x, 0.06, 0.72), bone: L.ff } as any);
    // rear
    seg(V(x, 2.55, -0.65), V(x, 1.25, -0.65), 0.2, 0.11, COAT, L.hp);
    ell(V(x, 1.25, -0.65), 0.115, 0.1, 0.125, COAT, L.hk, 7);
    seg(V(x, 1.25, -0.65), V(x, 0.32, -0.65), 0.1, 0.075, COAT, L.hk);
    ell(V(x, 0.32, -0.65), 0.085, 0.08, 0.09, BELLY, L.fb, 7);
    seg(V(x, 0.32, -0.65), V(x, 0.12, -0.65), 0.075, 0.08, BELLY, L.fb);
    b.part(new THREE.BoxGeometry(0.17, 0.12, 0.2), DARK, { at: V(x, 0.06, -0.63), bone: L.fb } as any);
    // leg patches
    for (const [z, bone, yy] of [[0.7, L.sh, 2.2], [0.7, L.sh, 1.7], [-0.65, L.hp, 2.1], [-0.65, L.hp, 1.7]] as any) {
      patch(V(x + s * 0.145, yy + R() * 0.1, z), V(s, 0, 0), 0.09, PATCH, bone);
      patch(V(x + s * 0.12, yy - 0.3, z + 0.05), V(s, 0, 0), 0.06, PATCH2, bone);
    }
  }

  // ---------- tail ----------
  seg(V(0, 3.05, -1.18), V(0, 2.6, -1.27), 0.045, 0.035, COAT, tail1, 6);
  seg(V(0, 2.6, -1.27), V(0, 2.2, -1.3), 0.035, 0.03, COAT, tail2, 6);
  seg(V(0, 2.2, -1.3), V(0, 1.95, -1.3), 0.03, 0.025, COAT, tail3, 6);
  const tg = new THREE.ConeGeometry(0.08, 0.35, 7);
  b.part(tg, DARK, { at: V(0, 1.85, -1.3), dir: V(0, -1, 0), bone: tail3 } as any);

  return b.root;
}
```