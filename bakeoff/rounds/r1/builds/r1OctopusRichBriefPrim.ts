import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A grumpy coral-and-rust reef octopus with bumpy mottled skin, golden bar-pupil eyes, eight curling suckered arms and an old brass key held aloft.",
};

const CORAL = "#e2765a";
const RUST = "#b5472b";
const PALE = "#f0c3a0";
const CREAM = "#f7e9c9";
const GOLD = "#f2b61f";
const BRASS = "#c9a227";
const DARK = "#1a1210";

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const R = rng(7);

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 0.4, 0] });
  const head = b.joint("head", { at: [0, 0.42, 0.02], parent: body });

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const P = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];

  // ---------- head and mantle ----------
  b.part(new THREE.SphereGeometry(1, 14, 10), CORAL, {
    at: [0, 0.42, 0.02], scale: [0.2, 0.19, 0.22], bone: head,
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), CORAL, {
    at: [0, 0.56, -0.1], scale: [0.18, 0.24, 0.21], bone: head,
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), PALE, {
    at: [0, 0.27, 0.02], scale: [0.17, 0.09, 0.18], bone: body,
  });
  // siphon
  b.part(new THREE.ConeGeometry(0.025, 0.08, 7), RUST, {
    at: [0.12, 0.3, 0.12], dir: [0.6, -0.3, 0.8], bone: head,
  });

  // bumps and mottling over the head/mantle
  const ells = [
    { c: V(0, 0.42, 0.02), r: V(0.2, 0.19, 0.22) },
    { c: V(0, 0.56, -0.1), r: V(0.18, 0.24, 0.21) },
  ];
  for (let i = 0; i < 90; i++) {
    const e = ells[i % 2];
    const d = V(R() * 2 - 1, R() * 1.4 - 0.2, R() * 2 - 1).normalize();
    if (d.y < -0.1) continue;
    const p = e.c.clone().add(d.clone().multiply(e.r));
    const kind = i % 3;
    const s = 0.012 + R() * 0.014;
    if (kind === 0) {
      b.part(new THREE.SphereGeometry(1, 6, 5), PALE, {
        at: P(p), scale: [s * 1.8, s * 1.2, s * 1.8], bone: head,
      });
    } else {
      b.part(new THREE.SphereGeometry(1, 6, 5), kind === 1 ? RUST : CORAL, {
        at: P(p), scale: [s, s, s], bone: head,
      });
    }
  }

  // ---------- eyes ----------
  for (const sx of [1, -1]) {
    const n = V(sx * 0.75, 0.22, 0.62).normalize();
    const surf = V(0, 0.42, 0.02).add(n.clone().multiply(V(0.2, 0.19, 0.22)));
    const eyeC = surf.clone().add(n.clone().multiplyScalar(0.015));
    b.part(new THREE.SphereGeometry(0.06, 10, 8), RUST, {
      at: P(surf.clone().add(n.clone().multiplyScalar(-0.005))), scale: [1.25, 1.25, 1.25], bone: head,
    });
    b.part(new THREE.SphereGeometry(0.058, 10, 8), GOLD, { at: P(eyeC), bone: head });
    const pup = eyeC.clone().add(n.clone().multiplyScalar(0.052));
    b.part(new THREE.BoxGeometry(0.014, 0.014, 0.06), DARK, { at: P(pup), bone: head });
    // grumpy brow: inner end lower
    const browC = eyeC.clone().add(V(0, 0.05, 0)).add(n.clone().multiplyScalar(0.025));
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.15, 6), RUST, {
      at: P(browC), dir: [-sx * 1, -0.45, 0.35], bone: head,
    });
  }

  // ---------- arms ----------
  const lifts = [0.08, 0.6, 0.3, 0.0, 0.38, 0.12, 0.32, 0.05];
  const curls = [0.8, 0.2, -0.9, 0.7, -0.6, 0.9, 0.5, -0.8];
  const N = 7;
  const up = V(0, 1, 0);
  let keyTip: THREE.Vector3 | null = null;

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const isKey = i === 1;
    const pts: THREE.Vector3[] = [];
    const rad: number[] = [];
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const r = 0.052 * (1 - t) + 0.011;
      rad.push(r);
      const dist = 0.13 + (isKey ? 0.33 : 0.5 + (i % 3) * 0.04) * t;
      const ang = a + (isKey ? 0.2 : curls[i]) * t * t;
      const lt = Math.max(0, (t - 0.4) / 0.6);
      const y = r + 0.17 * (1 - Math.min(1, t / 0.4)) + lifts[i] * lt * lt;
      pts.push(V(Math.sin(ang) * dist, y, Math.cos(ang) * dist));
    }
    const joints: THREE.Object3D[] = [];
    let parent: any = body;
    for (let k = 0; k <= N; k++) {
      const j = b.joint(`arm${i}_${k}`, { at: P(pts[k]), parent });
      joints.push(j);
      parent = j;
    }
    for (let k = 0; k < N; k++) {
      const A = pts[k], B = pts[k + 1];
      const d = B.clone().sub(A);
      const len = d.length();
      d.normalize();
      const m = A.clone().add(B).multiplyScalar(0.5);
      const bone = joints[k];
      b.part(new THREE.CylinderGeometry(rad[k + 1], rad[k], len, 8, 1), CORAL, {
        at: P(m), dir: P(d), bone,
      });
      b.part(new THREE.SphereGeometry(rad[k + 1] * 1.0, 8, 6), CORAL, { at: P(B), bone });
      const side = d.clone().cross(up);
      if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
      side.normalize();
      const r = (rad[k] + rad[k + 1]) * 0.5;
      // bumps on top
      const topN = up.clone().sub(d.clone().multiplyScalar(d.y)).normalize();
      for (let q = 0; q < 2; q++) {
        const f = 0.25 + q * 0.5;
        const c = A.clone().lerp(B, f).add(topN.clone().multiplyScalar(r * 0.92))
          .add(side.clone().multiplyScalar((R() - 0.5) * r));
        const s = r * (0.2 + R() * 0.15);
        b.part(new THREE.SphereGeometry(1, 6, 5), (k + q) % 2 ? PALE : RUST, {
          at: P(c), scale: [s, s * 0.8, s], bone,
        });
      }
      // two rows of suckers underneath
      for (const f of [0.3, 0.75]) {
        for (const sg of [-1, 1]) {
          const c = A.clone().lerp(B, f)
            .add(side.clone().multiplyScalar(sg * r * 0.5))
            .add(topN.clone().multiplyScalar(-r * 0.78));
          const s = r * 0.3;
          b.part(new THREE.SphereGeometry(1, 7, 5), CREAM, {
            at: P(c), scale: [s, s * 0.6, s], bone,
          });
          b.part(new THREE.SphereGeometry(1, 6, 4), RUST, {
            at: P(c.clone().add(topN.clone().multiplyScalar(-s * 0.35))),
            scale: [s * 0.45, s * 0.3, s * 0.45], bone,
          });
        }
      }
    }
    if (isKey) keyTip = pts[N].clone();
  }

  // ---------- brass key ----------
  if (keyTip) {
    const tipBone = b.root.getObjectByName("arm1_7") ?? undefined;
    const o: any = tipBone ? { bone: tipBone } : {};
    const base = keyTip.clone().add(V(0, 0.02, 0));
    const shaftTop = base.clone().add(V(0, 0.24, 0));
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.26, 8), BRASS, {
      at: P(base.clone().add(V(0, 0.12, 0))), ...o,
    });
    b.part(new THREE.TorusGeometry(0.045, 0.012, 6, 12), BRASS, {
      at: P(shaftTop.clone().add(V(0, 0.04, 0))), ...o,
    });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 8), BRASS, {
      at: P(shaftTop.clone().add(V(0, -0.01, 0))), ...o,
    });
    b.part(new THREE.BoxGeometry(0.05, 0.018, 0.014), BRASS, {
      at: P(base.clone().add(V(0.027, 0.05, 0))), ...o,
    });
    b.part(new THREE.BoxGeometry(0.036, 0.018, 0.014), BRASS, {
      at: P(base.clone().add(V(0.02, 0.085, 0))), ...o,
    });
    b.part(new THREE.BoxGeometry(0.014, 0.05, 0.014), BRASS, {
      at: P(base.clone().add(V(0.043, 0.065, 0))), ...o,
    });
    // tiny verdigris patches
    b.part(new THREE.SphereGeometry(0.01, 6, 5), "#4f8f7a", {
      at: P(shaftTop.clone().add(V(0.0, 0.0, 0.012))), ...o,
    });
  }

  return b.root;
}
