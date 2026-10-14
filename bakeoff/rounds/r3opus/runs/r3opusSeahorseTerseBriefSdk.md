```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized coral-orange seahorse built from faceted bony rings: a crowned head with a long tube snout (split jaw), big cartoon eyes, belly plates, cream speckles, a banded prehensile tail curling to the floor, and teal dorsal and pectoral fans.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---------- deterministic random ----------
  const r0: any = rng(11);
  const rand: () => number =
    typeof r0 === "function"
      ? r0
      : () => (r0.next?.() ?? r0.random?.() ?? r0.float?.() ?? 0.5);

  // ---------- palette ----------
  const BODY = "#ff8a2a";
  const BODY2 = "#ff6f3c";
  const TAILC = "#e8452f";
  const RIDGE = "#b8401c";
  const BELLY = "#ffd36b";
  const SPOT = "#fff1cf";
  const FIN = "#5fd6d0";
  const FINRAY = "#1f9aa6";
  const IRIS = "#ffcf3d";
  const PUPIL = "#1a1f36";
  const WHITE = "#ffffff";
  const LID = "#c94a1f";
  const CROWN = "#ffb03b";

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const X = V(1, 0, 0);

  // ---------- body centreline (head base -> tail tip), in (y, z) ----------
  const raw: [number, number][] = [
    [0.3, -0.012],
    [0.272, -0.03],
    [0.235, -0.02],
    [0.195, 0.0],
    [0.155, 0.005],
    [0.118, -0.01],
    [0.085, -0.025],
    [0.055, -0.03],
    [0.03, -0.022],
    [0.012, -0.005],
    [0.006, 0.018],
    [0.014, 0.036],
    [0.03, 0.04],
    [0.04, 0.03],
    [0.036, 0.02],
  ];

  const keys: [number, number][] = [
    [0, 0.02],
    [0.08, 0.019],
    [0.2, 0.03],
    [0.3, 0.036],
    [0.38, 0.032],
    [0.46, 0.02],
    [0.6, 0.013],
    [0.75, 0.009],
    [0.9, 0.006],
    [1, 0.003],
  ];
  const R = (t: number) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const [ta, ra] = keys[i];
      const [tb, rb] = keys[i + 1];
      if (t <= tb) return ra + ((rb - ra) * (t - ta)) / (tb - ta);
    }
    return keys[keys.length - 1][1];
  };

  // lift so the lowest point just touches y = 0
  const curve0 = new THREE.CatmullRomCurve3(raw.map(([y, z]) => V(0, y, z)));
  let minY = Infinity;
  for (let i = 0; i <= 300; i++) {
    const t = i / 300;
    minY = Math.min(minY, curve0.getPointAt(t).y - R(t));
  }
  const lift = -minY - 0.002;
  const curve = new THREE.CatmullRomCurve3(raw.map(([y, z]) => V(0, y + lift, z)));

  const P = (t: number) => curve.getPointAt(t);
  const T = (t: number) => curve.getTangentAt(t).normalize();
  const Nf = (t: number) => T(t).cross(X).normalize(); // belly / inside-of-curl side

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: P(0.42), role: "spine" } as any);
  const spine1 = b.joint("spine1", { at: P(0.3), parent: hips, role: "spine" } as any);
  const spine2 = b.joint("spine2", { at: P(0.18), parent: spine1, role: "spine" } as any);
  const neck = b.joint("neck", { at: P(0.07), parent: spine2, role: "neck" } as any);
  const hb = P(0);
  const H = (dx: number, dy: number, dz: number) => hb.clone().add(V(dx, dy, dz));
  const head = b.joint("head", { at: hb, parent: neck, role: "head" } as any);
  const jaw = b.joint("jaw", { at: H(0, 0.004, 0.086), parent: head, role: "jaw" } as any);

  let prev: any = hips;
  const tailTs = [0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 0.97];
  tailTs.forEach((t, i) => {
    prev = b.joint(`tail${i + 1}`, { at: P(t), parent: prev, role: "tail" } as any);
  });

  const tf = 0.4;
  const finBase = P(tf).add(Nf(tf).multiplyScalar(-R(tf) * 0.85));
  const dorsal = b.joint("dorsalFin", { at: finBase, parent: hips, role: "fan" } as any);

  // ---------- body rings ----------
  const N = 44;
  for (let i = 0; i < N; i++) {
    const t0 = i / N;
    const t1 = (i + 1) / N;
    const p0 = P(t0);
    const p1 = P(t1);
    const mid = p0.clone().add(p1).multiplyScalar(0.5);
    const d = p1.clone().sub(p0);
    const len = d.length() * 1.1;
    let col = t0 < 0.3 ? BODY : t0 < 0.5 ? BODY2 : TAILC;
    if (t0 >= 0.5 && i % 3 === 0) col = BELLY; // tail bands
    b.part(new THREE.CylinderGeometry(R(t1) * 0.97, R(t0), len, 6), col, { at: mid, dir: d });

    // bony plate ridge
    if (i > 0) {
      const r = R(t0);
      const g = new THREE.TorusGeometry(r * 0.99, Math.max(0.0011, r * 0.08), 3, 6);
      g.rotateX(Math.PI / 2);
      b.part(g, RIDGE, { at: p0, dir: T(t0) });
    }

    const tm = (t0 + t1) / 2;
    const rm = R(tm);
    const n = Nf(tm);

    // belly plates
    if (tm > 0.1 && tm < 0.47) {
      b.part(
        new THREE.CylinderGeometry(rm * 0.5, rm * 0.56, rm * 0.4, 6),
        BELLY,
        { at: mid.clone().add(n.clone().multiplyScalar(rm * 0.82)), dir: n }
      );
    }

    // knobs: dorsal and lateral
    if (i % 2 === 0 && tm < 0.92) {
      const kr = Math.max(0.0012, rm * 0.18);
      const kh = Math.max(0.003, rm * 0.45);
      const back = n.clone().multiplyScalar(-1);
      b.part(new THREE.ConeGeometry(kr, kh, 4), RIDGE, {
        at: mid.clone().add(back.clone().multiplyScalar(rm * 0.95 + kh * 0.3)),
        dir: back,
      });
      for (const s of [1, -1]) {
        const sd = V(s, 0, 0);
        b.part(new THREE.ConeGeometry(kr * 0.8, kh * 0.7, 4), CROWN, {
          at: mid.clone().add(sd.clone().multiplyScalar(rm * 0.92 + kh * 0.2)),
          dir: sd,
        });
      }
    }
  }

  // speckles on the flanks
  for (let k = 0; k < 46; k++) {
    const t = 0.04 + rand() * 0.55;
    const s = rand() < 0.5 ? 1 : -1;
    const a = (rand() - 0.5) * 1.3;
    const n = Nf(t);
    const dir = V(s * Math.cos(a), 0, 0).add(n.clone().multiplyScalar(Math.sin(a))).normalize();
    const pos = P(t).add(dir.clone().multiplyScalar(R(t) * 0.97));
    b.part(new THREE.IcosahedronGeometry(0.0013 + rand() * 0.0012, 0), SPOT, { at: pos });
  }

  // ---------- head ----------
  const skull = new THREE.IcosahedronGeometry(0.025, 1);
  skull.scale(0.8, 1, 1.15);
  b.part(skull, BODY, { at: H(0, 0.018, 0.012), bone: head });

  // snout
  const sA = H(0, 0.016, 0.03);
  const sB = H(0, 0.006, 0.088);
  const sd = sB.clone().sub(sA);
  b.part(new THREE.CylinderGeometry(0.0068, 0.009, sd.length(), 7), BODY, {
    at: sA.clone().add(sB).multiplyScalar(0.5),
    dir: sd,
    bone: head,
  });
  for (const f of [0.3, 0.55, 0.8]) {
    const g = new THREE.TorusGeometry(0.009 - 0.0022 * f, 0.0011, 3, 7);
    g.rotateX(Math.PI / 2);
    b.part(g, RIDGE, { at: sA.clone().lerp(sB, f), dir: sd, bone: head });
  }
  // upper lip on head, lower jaw on its own bone
  b.part(new THREE.CylinderGeometry(0.0072, 0.0068, 0.007, 7), RIDGE, {
    at: H(0, 0.009, 0.091),
    dir: V(0, -0.17, 1),
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.011, 0.004, 0.01), BELLY, {
    at: H(0, 0.0025, 0.092),
    bone: jaw,
  });

  for (const s of [1, -1]) {
    // eye
    b.part(new THREE.SphereGeometry(0.0085, 10, 8), WHITE, { at: H(s * 0.018, 0.024, 0.014), bone: head });
    b.part(new THREE.CylinderGeometry(0.0056, 0.0056, 0.002, 10), IRIS, {
      at: H(s * 0.0262, 0.024, 0.0145),
      dir: V(s, 0, 0.15),
      bone: head,
    });
    b.part(new THREE.CylinderGeometry(0.0032, 0.0032, 0.0024, 8), PUPIL, {
      at: H(s * 0.0269, 0.024, 0.015),
      dir: V(s, 0, 0.15),
      bone: head,
    });
    b.part(new THREE.IcosahedronGeometry(0.0013, 0), WHITE, {
      at: H(s * 0.0279, 0.0262, 0.0172),
      bone: head,
    });
    const lid = new THREE.TorusGeometry(0.0088, 0.0016, 4, 10);
    lid.rotateX(Math.PI / 2);
    b.part(lid, LID, { at: H(s * 0.0205, 0.024, 0.014), dir: V(s, 0, 0.1), bone: head });

    // brow spines
    b.part(new THREE.ConeGeometry(0.003, 0.009, 4), CROWN, {
      at: H(s * 0.013, 0.039, 0.013),
      dir: V(s * 0.4, 1, 0.3),
      bone: head,
    });

    // gill cheek with stripes
    const cheek = new THREE.IcosahedronGeometry(0.012, 1);
    cheek.scale(0.45, 1, 1);
    b.part(cheek, BODY2, { at: H(s * 0.014, 0.006, -0.002), bone: head });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.CylinderGeometry(0.0009, 0.0009, 0.009, 4), RIDGE, {
        at: H(s * 0.0193, 0.002 + k * 0.004, -0.002),
        dir: V(0, -0.35, 1),
        bone: head,
      });
    }
  }

  // coronet
  const crownTop = H(0, 0.053, -0.008);
  b.part(new THREE.CylinderGeometry(0.0062, 0.0085, 0.017, 6), CROWN, {
    at: H(0, 0.044, -0.004),
    dir: V(0, 1, -0.3),
    bone: head,
  });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const o = V(Math.cos(a), 0, Math.sin(a));
    b.part(new THREE.ConeGeometry(0.0022, 0.008, 4), RIDGE, {
      at: crownTop.clone().add(o.clone().multiplyScalar(0.005)).add(V(0, 0.003, 0)),
      dir: o.clone().multiplyScalar(0.5).add(V(0, 1, 0)),
      bone: head,
    });
  }

  // ---------- dorsal fin ----------
  const fg = new THREE.CylinderGeometry(0.028, 0.028, 0.0025, 9, 1, false, Math.PI / 2, Math.PI);
  fg.rotateZ(Math.PI / 2);
  b.part(fg, FIN, { at: finBase, bone: dorsal });
  for (let k = 0; k < 7; k++) {
    const a = Math.PI * (0.12 + (0.76 * k) / 6);
    const d = V(0, Math.cos(a), -Math.sin(a));
    b.part(new THREE.CylinderGeometry(0.0016, 0.0012, 0.027, 4), FINRAY, {
      at: finBase.clone().add(d.clone().multiplyScalar(0.0135)),
      dir: d,
      bone: dorsal,
    });
  }

  // ---------- pectoral fins ----------
  for (const s of [1, -1]) {
    const tp = 0.06;
    const root = P(tp).add(V(s * R(tp), 0, 0)).add(Nf(tp).multiplyScalar(-0.004));
    const pj = b.joint(s > 0 ? "pectoralL" : "pectoralR", { at: root, parent: neck, role: "fan" } as any);
    const at = root.clone().add(V(s * 0.008, 0.002, 0));
    const dir = V(s * 0.25, 0.3, -1);
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.002, 9), FIN, { at, dir, bone: pj });
    const rim = new THREE.TorusGeometry(0.011, 0.0013, 3, 9);
    rim.rotateX(Math.PI / 2);
    b.part(rim, FINRAY, { at, dir, bone: pj });
  }

  return b.root;
}
```