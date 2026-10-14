```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description:
    "A stylized low-poly lion built from primitives: a blocky puppet body, a layered faceted mane in three tones, an amber-eyed face with a hinged jaw, and a tufted tail. It stands in a neutral rest pose ready for rigging.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });

  // ---------- palette ----------
  const TAWNY = "#d69a52";
  const TAWNY_DK = "#b97a3a";
  const CREAM = "#f1dcb0";
  const BELLY = "#e8c48a";
  const MANE_IN = "#c06a2a";
  const MANE_MID = "#8e4a1e";
  const MANE_OUT = "#5a2c14";
  const NOSE = "#4a2a24";
  const EYE = "#f2b33d";
  const PUPIL = "#1a1210";
  const WHITE = "#fffaf0";
  const CLAW = "#efe6d2";
  const DARK = "#3a2218";
  const PINK = "#c9706a";

  // ---------- randomness ----------
  const R: any = rng(7);
  const rand = (): number => (typeof R === "function" ? R() : R.next());

  // ---------- helpers ----------
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  const ball = (at: number[], s: number[], color: string, bone: any, w = 10, h = 8) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(s[0], s[1], s[2]);
    return b.part(g, color, { at, bone });
  };
  const box = (at: number[], s: number[], color: string, bone: any) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at, bone });

  const seg = (a: number[], c: number[], r1: number, r2: number, color: string, bone: any, n = 8) => {
    const A = V(a), B = V(c);
    const len = A.distanceTo(B);
    const m = A.clone().add(B).multiplyScalar(0.5);
    const d = B.clone().sub(A).normalize();
    return b.part(new THREE.CylinderGeometry(r2, r1, len, n), color, {
      at: m.toArray(),
      dir: d.toArray(),
      bone,
    });
  };

  // cone whose base sits at `base`, pointing along `dir`
  const cone = (base: number[], dir: number[], len: number, r: number, color: string, bone: any, n = 5) => {
    const d = V(dir).normalize();
    const c = V(base).add(d.clone().multiplyScalar(len / 2));
    return b.part(new THREE.ConeGeometry(r, len, n), color, {
      at: c.toArray(),
      dir: d.toArray(),
      bone,
    });
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.0, -0.5] });
  const spine = b.joint("spine", { at: [0, 1.02, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.02, 0.45], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.15, 0.7], parent: chest });
  const head = b.joint("head", { at: [0, 1.38, 0.95], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.3, 1.08], parent: head });

  const legs: Record<string, any> = {};
  for (const side of ["L", "R"]) {
    const x = side === "L" ? 0.2 : -0.2;
    const sh = b.joint("shoulder" + side, { at: [x, 0.95, 0.5], parent: chest });
    const el = b.joint("elbow" + side, { at: [x, 0.58, 0.47], parent: sh });
    const wr = b.joint("wrist" + side, { at: [x, 0.16, 0.55], parent: el });
    const fp = b.joint("frontPaw" + side, { at: [x, 0.06, 0.6], parent: wr });
    const hp = b.joint("hip" + side, { at: [x, 0.92, -0.55], parent: hips });
    const kn = b.joint("knee" + side, { at: [x, 0.58, -0.42], parent: hp });
    const hk = b.joint("hock" + side, { at: [x, 0.28, -0.7], parent: kn });
    const rp = b.joint("rearPaw" + side, { at: [x, 0.06, -0.64], parent: hk });
    legs[side] = { x, sh, el, wr, fp, hp, kn, hk, rp };
  }

  const tailPts = [
    [0, 1.02, -0.9],
    [0, 0.92, -1.12],
    [0, 0.72, -1.32],
    [0, 0.54, -1.52],
    [0, 0.5, -1.72],
  ];
  const tail = b.chain("tail", tailPts, { parent: hips, role: "tail" });

  // ---------- torso ----------
  ball([0, 1.0, -0.02], [0.34, 0.33, 0.62], TAWNY, spine);
  ball([0, 1.0, 0.42], [0.36, 0.38, 0.34], TAWNY, chest);
  ball([0, 0.98, -0.5], [0.33, 0.33, 0.32], TAWNY, hips);
  ball([0, 0.8, 0.02], [0.26, 0.16, 0.55], BELLY, spine);
  ball([0, 0.84, 0.42], [0.25, 0.18, 0.25], BELLY, chest);
  // back ridge stripe
  for (let i = 0; i < 6; i++) {
    const z = -0.6 + i * 0.2;
    const y = 1.31 - Math.abs(z + 0.05) * 0.06;
    box([0, y, z], [0.07, 0.03, 0.16], TAWNY_DK, z < -0.3 ? hips : z < 0.25 ? spine : chest);
  }
  // muscles
  for (const side of ["L", "R"]) {
    const s = side === "L" ? 1 : -1;
    ball([0.17 * s, 0.98, -0.55], [0.17, 0.24, 0.26], TAWNY, hips);
    ball([0.19 * s, 0.98, 0.5], [0.15, 0.22, 0.2], TAWNY, chest);
  }

  // ---------- legs ----------
  for (const side of ["L", "R"]) {
    const L = legs[side];
    const x = L.x;
    // front
    seg([x, 0.95, 0.5], [x, 0.58, 0.47], 0.1, 0.085, TAWNY, L.sh);
    ball([x, 0.58, 0.47], [0.085, 0.085, 0.085], TAWNY, L.el);
    seg([x, 0.58, 0.47], [x, 0.16, 0.55], 0.075, 0.06, TAWNY, L.el);
    ball([x, 0.16, 0.55], [0.062, 0.062, 0.062], TAWNY, L.wr);
    seg([x, 0.16, 0.55], [x, 0.07, 0.6], 0.062, 0.062, TAWNY, L.wr);
    // rear
    seg([x, 0.92, -0.55], [x, 0.58, -0.42], 0.13, 0.09, TAWNY, L.hp);
    ball([x, 0.58, -0.42], [0.09, 0.09, 0.09], TAWNY, L.kn);
    seg([x, 0.58, -0.42], [x, 0.28, -0.7], 0.075, 0.055, TAWNY, L.kn);
    ball([x, 0.28, -0.7], [0.058, 0.058, 0.058], TAWNY_DK, L.hk);
    seg([x, 0.28, -0.7], [x, 0.07, -0.64], 0.055, 0.055, TAWNY, L.hk);

    // paws
    for (const [pz, bone, big] of [
      [0.6, L.fp, 1.0],
      [-0.64, L.rp, 0.92],
    ] as [number, any, number][]) {
      ball([x, 0.055, pz + 0.04], [0.09 * big, 0.055, 0.115 * big], CREAM, bone, 8, 6);
      for (let t = 0; t < 4; t++) {
        const tx = x + (t - 1.5) * 0.04 * big;
        const tz = pz + 0.13 * big - Math.abs(t - 1.5) * 0.015;
        ball([tx, 0.035, tz], [0.026, 0.03, 0.03], CREAM, bone, 6, 5);
        cone([tx, 0.03, tz + 0.025], [0, -0.35, 1], 0.03, 0.008, CLAW, bone, 4);
      }
    }
  }

  // ---------- neck & mane body ----------
  seg([0, 1.0, 0.55], [0, 1.38, 0.95], 0.2, 0.17, TAWNY, neck);
  const MC = [0, 1.3, 0.72];
  const MR = [0.38, 0.42, 0.34];
  ball(MC, MR, MANE_MID, neck, 9, 7);
  const maneCols = [MANE_IN, MANE_MID, MANE_OUT];
  let placed = 0;
  for (let i = 0; i < 400 && placed < 54; i++) {
    const d = V([rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1]);
    if (d.lengthSq() > 1 || d.lengthSq() < 0.05) continue;
    d.normalize();
    if (d.z > 0.55 || d.y < -0.55) continue;
    const base = [MC[0] + d.x * MR[0] * 0.8, MC[1] + d.y * MR[1] * 0.8, MC[2] + d.z * MR[2] * 0.8];
    const dir = [d.x, d.y + 0.1, d.z - 0.6];
    const col = maneCols[placed % 3];
    cone(base, dir, 0.18 + rand() * 0.14, 0.075 + rand() * 0.03, col, neck, 5);
    placed++;
  }
  // chest beard
  for (let i = 0; i < 7; i++) {
    const t = (i - 3) / 3;
    cone([t * 0.15, 1.12, 0.92 - Math.abs(t) * 0.08], [t * 0.4, -1, 0.35], 0.24 - Math.abs(t) * 0.06, 0.06, i % 2 ? MANE_OUT : MANE_MID, neck, 5);
  }

  // ---------- head ----------
  const H = [0, 1.42, 1.02];
  box(H, [0.3, 0.3, 0.3], TAWNY, head);
  box([0, 1.55, 1.04], [0.24, 0.06, 0.24], TAWNY, head); // flat crown
  for (const s of [1, -1]) ball([0.12 * s, 1.36, 1.1], [0.07, 0.07, 0.07], TAWNY, head, 7, 6); // cheeks

  // face ring mane (three tiers, light to dark)
  const tiers = [
    { n: 14, r: 0.2, len: 0.16, z: 0.98, col: MANE_IN, rad: 0.06 },
    { n: 18, r: 0.27, len: 0.22, z: 0.93, col: MANE_MID, rad: 0.07 },
    { n: 22, r: 0.34, len: 0.26, z: 0.87, col: MANE_OUT, rad: 0.075 },
  ];
  tiers.forEach((T, li) => {
    for (let i = 0; i < T.n; i++) {
      const a = (i / T.n) * Math.PI * 2 + li * 0.21 + (rand() - 0.5) * 0.12;
      const ca = Math.cos(a), sa = Math.sin(a);
      cone(
        [H[0] + ca * T.r, H[1] + sa * T.r, T.z],
        [ca, sa, -0.45],
        T.len * (0.85 + rand() * 0.3),
        T.rad,
        T.col,
        head,
        5,
      );
    }
  });

  // ears
  for (const s of [1, -1]) {
    ball([0.14 * s, 1.6, 1.0], [0.065, 0.065, 0.025], TAWNY_DK, head, 7, 5);
    ball([0.14 * s, 1.6, 1.022], [0.04, 0.04, 0.01], DARK, head, 6, 4);
  }

  // brow and eyes
  box([0, 1.51, 1.165], [0.26, 0.04, 0.03], TAWNY_DK, head);
  for (const s of [1, -1]) {
    const ex = 0.08 * s;
    ball([ex, 1.432, 1.168], [0.04, 0.022, 0.015], CREAM, head, 7, 5); // pale patch under eye
    ball([ex, 1.47, 1.165], [0.035, 0.03, 0.02], EYE, head, 8, 6);
    ball([ex, 1.47, 1.183], [0.011, 0.022, 0.006], PUPIL, head, 6, 5);
    ball([ex + 0.012 * s, 1.482, 1.188], [0.007, 0.007, 0.004], WHITE, head, 5, 4);
    box([ex + 0.01 * s, 1.497, 1.17], [0.06, 0.012, 0.02], DARK, head); // eyeliner lid
  }

  // muzzle & nose
  box([0, 1.36, 1.24], [0.2, 0.13, 0.16], CREAM, head);
  box([0, 1.44, 1.19], [0.09, 0.04, 0.16], TAWNY_DK, head); // bridge
  box([0, 1.415, 1.315], [0.09, 0.05, 0.04], NOSE, head);
  box([0, 1.37, 1.322], [0.012, 0.05, 0.01], NOSE, head); // philtrum
  box([0, 1.299, 1.25], [0.19, 0.012, 0.15], DARK, head); // lip line
  for (const s of [1, -1]) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        ball([s * (0.045 + c * 0.017), 1.345 + r * 0.016, 1.322], [0.006, 0.006, 0.004], DARK, head, 4, 3);
      }
    }
    cone([0.052 * s, 1.297, 1.3], [0, -1, 0.05], 0.045, 0.012, WHITE, head, 5); // upper canines
  }

  // lower jaw
  box([0, 1.26, 1.2], [0.16, 0.06, 0.15], CREAM, jaw);
  box([0, 1.285, 1.19], [0.12, 0.012, 0.11], PINK, jaw); // tongue
  for (const s of [1, -1]) cone([0.04 * s, 1.29, 1.255], [0, 1, 0], 0.03, 0.009, WHITE, jaw, 5);
  ball([0, 1.235, 1.2], [0.06, 0.03, 0.06], MANE_IN, jaw, 6, 4); // chin tuft

  // ---------- tail ----------
  b.sweep(tail, 0.04, { color: TAWNY });
  const tip = [0, 0.5, -1.76];
  ball(tip, [0.06, 0.06, 0.09], MANE_OUT, undefined, 7, 6);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    cone(tip, [Math.cos(a) * 0.6, Math.sin(a) * 0.6, -1], 0.12, 0.035, i % 2 ? MANE_OUT : MANE_MID, undefined, 4);
  }

  return b.root;
}
```