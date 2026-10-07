```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Red Rock Crab",
  description: "Feisty brick-red rock crab with one oversized raised claw, stalked eyes, eight pointed legs, a barnacle and a strand of seaweed.",
};

export default function build() {
  const b = createBuilder({ name: "rockcrab" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const RED = "#a8322a", DRED = "#7d2220", ORANGE = "#e8832f", CREAM = "#f1dfc0", DARK = "#2a1714", BELLY = "#d9a679";

  const body = b.joint("body", { at: [0, 0.12, 0] });

  // segment between two points, tapering
  const seg = (a: THREE.Vector3, c: THREE.Vector3, r1: number, r2: number, color: string, bone: any, sides = 6) => {
    const d = c.clone().sub(a);
    const len = d.length();
    const m = a.clone().add(c).multiplyScalar(0.5);
    b.part(new THREE.CylinderGeometry(r2, r1, len, sides), color, { at: m.toArray() as any, dir: d.clone().normalize().toArray() as any, bone });
  };
  const ball = (p: THREE.Vector3, r: number, color: string, bone: any, sc: [number, number, number] = [1, 1, 1], seg_ = 8) =>
    b.part(new THREE.SphereGeometry(r, seg_, 6), color, { at: p.toArray() as any, bone, scale: sc } as any);

  // ---- shell ----
  ball(V(0, 0.13, 0), 1, RED, body, [0.29, 0.085, 0.22], 14);
  ball(V(0, 0.1, 0.0), 1, DRED, body, [0.3, 0.05, 0.225], 14); // rim
  ball(V(0, 0.07, 0), 1, BELLY, body, [0.25, 0.04, 0.19], 10); // underside
  // front brow ridge
  b.part(new THREE.BoxGeometry(0.3, 0.03, 0.04), DRED, { at: [0, 0.17, 0.19], bone: body });

  // knobs and speckles on the carapace
  const R = rng(7);
  for (let i = 0; i < 120; i++) {
    const th = R() * Math.PI * 2;
    const el = Math.acos(1 - R() * 0.85); // from top
    const nx = Math.sin(el) * Math.cos(th), ny = Math.cos(el), nz = Math.sin(el) * Math.sin(th);
    const p = V(0.29 * nx, 0.13 + 0.09 * ny, 0.22 * nz);
    if (p.y < 0.115) continue;
    const big = R() < 0.2;
    const col = big ? DRED : R() < 0.55 ? ORANGE : CREAM;
    const r = big ? 0.018 + R() * 0.01 : 0.007 + R() * 0.007;
    ball(p, r, col, body, [1, big ? 0.8 : 0.5, 1], 5);
  }
  // spiky edge teeth on front of shell
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.04;
    const z = 0.2 * Math.sqrt(Math.max(0, 1 - (x / 0.29) ** 2)) * 1.0;
    b.part(new THREE.ConeGeometry(0.014, 0.04, 5), CREAM, { at: [x, 0.14, z + 0.005], dir: [0, 0.3, 1], bone: body });
  }

  // ---- eyes on stalks ----
  for (const s of [1, -1]) {
    const e = b.joint(s > 0 ? "eyeStalkL" : "eyeStalkR", { at: [s * 0.075, 0.19, 0.17], parent: body });
    seg(V(s * 0.075, 0.18, 0.17), V(s * 0.085, 0.27, 0.2), 0.012, 0.01, ORANGE, e);
    ball(V(s * 0.085, 0.285, 0.205), 0.026, CREAM, e);
    ball(V(s * 0.085, 0.29, 0.228), 0.015, DARK, e);
  }
  // mouthparts
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), DRED, { at: [0, 0.1, 0.205], bone: body });
  b.part(new THREE.BoxGeometry(0.06, 0.015, 0.03), ORANGE, { at: [0, 0.085, 0.215], bone: body });

  // ---- walking legs ----
  const zs = [0.1, 0.02, -0.06, -0.13];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    zs.forEach((z, i) => {
      const n = i + 1;
      const fan = (i - 1.5) * -0.07; // front legs forward, rear back
      const hipP = V(s * 0.24, 0.12, z * 1.1);
      const kneeP = V(s * 0.42, 0.25, z + fan * 0.8);
      const footP = V(s * 0.56, -0.004, z + fan * 1.8);
      const hip = b.joint(`hip${side}${n}`, { at: hipP.toArray() as any, parent: body });
      const knee = b.joint(`knee${side}${n}`, { at: kneeP.toArray() as any, parent: hip });
      const ankle = b.joint(`ankle${side}${n}`, { at: footP.toArray() as any, parent: knee });
      seg(hipP, kneeP, 0.024, 0.02, RED, hip);
      ball(kneeP, 0.027, DRED, knee, [1, 1, 1], 6);
      // lower segment: pointed
      const d = footP.clone().sub(kneeP);
      const len = d.length();
      b.part(new THREE.ConeGeometry(0.022, len, 6), ORANGE, {
        at: kneeP.clone().add(footP).multiplyScalar(0.5).toArray() as any,
        dir: d.clone().multiplyScalar(-1).normalize().toArray() as any,
        bone: knee,
      });
      // dark tip
      const tipC = footP.clone().lerp(kneeP, 0.1);
      b.part(new THREE.ConeGeometry(0.0075, len * 0.2, 5), DARK, {
        at: tipC.toArray() as any,
        dir: d.clone().multiplyScalar(-1).normalize().toArray() as any,
        bone: ankle,
      });
      // cream band at the knee
      ball(kneeP.clone().lerp(footP, 0.18), 0.02, CREAM, knee, [1, 0.5, 1], 6);
    });
  }

  // ---- claws ----
  const claw = (side: string, s: number, shoulder: THREE.Vector3, elbow: THREE.Vector3, wrist: THREE.Vector3,
    f: THREE.Vector3, n: THREE.Vector3, k: number) => {
    f = f.clone().normalize(); n = n.clone().normalize();
    const sh = b.joint(`shoulder${side}`, { at: shoulder.toArray() as any, parent: body });
    const el = b.joint(`elbow${side}`, { at: elbow.toArray() as any, parent: sh });
    const wr = b.joint(`wrist${side}`, { at: wrist.toArray() as any, parent: el });
    const palmC = wrist.clone().add(f.clone().multiplyScalar(0.09 * k));
    const jawP = palmC.clone().add(f.clone().multiplyScalar(0.07 * k)).add(n.clone().multiplyScalar(0.03 * k));
    const jaw = b.joint(`jaw${side}`, { at: jawP.toArray() as any, parent: wr });
    seg(shoulder, elbow, 0.03, 0.026, RED, sh);
    ball(elbow, 0.032, DRED, el);
    seg(elbow, wrist, 0.026, 0.03, RED, el);
    ball(wrist, 0.032, DRED, wr);
    // palm (propodus)
    b.part(new THREE.SphereGeometry(1, 10, 7), RED, {
      at: palmC.toArray() as any, dir: f.toArray() as any, bone: wr,
      scale: [0.08 * k, 0.1 * k, 0.065 * k],
    } as any);
    // knobs on palm
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9;
      const side2 = V(Math.cos(a), 0, Math.sin(a));
      ball(palmC.clone().add(V(side2.x * 0.06 * k * s, 0.03 * k * (i % 3 - 1), 0).add(n.clone().multiplyScalar(-0.04 * k)).add(f.clone().multiplyScalar(0.02 * k * (i % 3 - 1)))),
        0.012 * k, i % 2 ? ORANGE : CREAM, wr, [1, 1, 1], 5);
    }
    // fixed finger
    const fb = palmC.clone().add(f.clone().multiplyScalar(0.06 * k)).add(n.clone().multiplyScalar(-0.025 * k));
    const fm = fb.clone().add(f.clone().multiplyScalar(0.1 * k));
    const ft = fm.clone().add(f.clone().multiplyScalar(0.07 * k)).add(n.clone().multiplyScalar(0.035 * k));
    seg(fb, fm, 0.032 * k, 0.022 * k, RED, wr);
    seg(fm, ft, 0.022 * k, 0.007 * k, DARK, wr, 5);
    // moving finger
    const mb = jawP.clone();
    const mm = mb.clone().add(f.clone().multiplyScalar(0.1 * k)).add(n.clone().multiplyScalar(0.012 * k));
    const mt = mm.clone().add(f.clone().multiplyScalar(0.065 * k)).add(n.clone().multiplyScalar(-0.03 * k));
    seg(mb, mm, 0.026 * k, 0.02 * k, RED, jaw);
    seg(mm, mt, 0.02 * k, 0.007 * k, DARK, jaw, 5);
    // teeth
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const pf = fb.clone().lerp(fm, t).add(n.clone().multiplyScalar(0.015 * k));
      b.part(new THREE.ConeGeometry(0.008 * k, 0.02 * k, 4), CREAM, { at: pf.toArray() as any, dir: n.toArray() as any, bone: wr });
      const pm = mb.clone().lerp(mm, t).add(n.clone().multiplyScalar(-0.013 * k));
      b.part(new THREE.ConeGeometry(0.008 * k, 0.02 * k, 4), CREAM, { at: pm.toArray() as any, dir: n.clone().multiplyScalar(-1).toArray() as any, bone: jaw });
    }
  };

  // big raised claw (left, +X)
  claw("L", 1, V(0.21, 0.14, 0.14), V(0.38, 0.2, 0.26), V(0.38, 0.34, 0.34), V(0, 1, 0.25), V(0, -0.25, 1), 1.6);
  // small claw (right)
  claw("R", -1, V(-0.2, 0.13, 0.15), V(-0.34, 0.17, 0.27), V(-0.38, 0.17, 0.38), V(0, 0.1, 1), V(0, 1, -0.1), 0.85);

  // ---- barnacle cluster on the back ----
  const bar = b.joint("barnacle", { at: [-0.1, 0.2, -0.08], parent: body });
  const bc: [number, number, number, number][] = [[-0.1, -0.08, 0.03, 0.04], [-0.14, -0.04, 0.02, 0.025], [-0.07, -0.12, 0.018, 0.02]];
  for (const [x, z, r, h] of bc) {
    b.part(new THREE.CylinderGeometry(r * 0.6, r, h, 7), "#d8d3c8", { at: [x, 0.19 + h * 0.4, z], bone: bar });
    b.part(new THREE.CylinderGeometry(r * 0.3, r * 0.4, h * 0.3, 6), DARK, { at: [x, 0.19 + h * 0.9, z], bone: bar });
  }

  // ---- seaweed strand ----
  const weedBase = V(0.07, 0.205, -0.1);
  let prev = weedBase.clone();
  let wj: any = b.joint("weed0", { at: prev.toArray() as any, parent: body });
  const weedCol = ["#2f7a3a", "#3f9446"];
  for (let i = 0; i < 6; i++) {
    const t = i + 1;
    const next = prev.clone().add(V(0.02 * Math.sin(t * 1.3), t < 3 ? 0.035 : -0.01, -0.035 - 0.005 * t));
    if (next.y < 0.02) next.y = 0.02;
    seg(prev, next, 0.012, 0.008, weedCol[i % 2], wj, 4);
    // leaf blade
    b.part(new THREE.BoxGeometry(0.05, 0.004, 0.025), weedCol[(i + 1) % 2], {
      at: next.clone().add(V(i % 2 ? 0.025 : -0.025, 0, 0)).toArray() as any, bone: wj,
    });
    if (i < 5) wj = b.joint(`weed${i + 1}`, { at: next.toArray() as any, parent: wj });
    prev = next;
  }

  return b.root;
}
```