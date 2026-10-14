```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description:
    "A stylized low-poly koala standing on all fours in a neutral rest pose: faceted grey fur, huge fluffy ears, a big leathery nose, claws, a speckled rump and a eucalyptus sprig in its mouth.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(7);

  // ---------- palette ----------
  const FUR = "#8e939b";
  const FUR_DARK = "#6f747d";
  const FUR_LIGHT = "#b4b8bf";
  const CREAM = "#efe8dc";
  const WHITE = "#f7f5f0";
  const NOSE = "#2a292e";
  const NOSE_HI = "#5d5b63";
  const NOSTRIL = "#141316";
  const EYE = "#120f0e";
  const CLAW = "#3b3330";
  const PAD = "#4a4448";
  const LEAF = "#6c9a7b";
  const LEAF_DARK = "#4f7a62";
  const STEM = "#7a5a44";
  const MOUTH = "#5a3b3f";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.34, -0.14] });
  const spine = b.joint("spine", { at: [0, 0.36, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.37, 0.14], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.43, 0.22], parent: chest });
  const head = b.joint("head", { at: [0, 0.52, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.48, 0.38], parent: head });
  const earL = b.joint("earL", { at: [0.15, 0.66, 0.27], parent: head });
  const earR = b.joint("earR", { at: [-0.15, 0.66, 0.27], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.36, -0.3], parent: hips });

  const legs: Record<string, any> = {};
  for (const [s, sx] of [["L", 1], ["R", -1]] as [string, number][]) {
    const sh = b.joint("shoulder" + s, { at: [0.11 * sx, 0.33, 0.17], parent: chest });
    const el = b.joint("elbow" + s, { at: [0.13 * sx, 0.18, 0.2], parent: sh });
    const wr = b.joint("wrist" + s, { at: [0.14 * sx, 0.05, 0.21], parent: el });
    const hp = b.joint("hip" + s, { at: [0.13 * sx, 0.3, -0.17], parent: hips });
    const kn = b.joint("knee" + s, { at: [0.15 * sx, 0.17, -0.1], parent: hp });
    const an = b.joint("ankle" + s, { at: [0.15 * sx, 0.05, -0.16], parent: kn });
    legs[s] = { sh, el, wr, hp, kn, an, sx };
  }

  // ---------- helpers ----------
  const v = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);

  const blob = (c: V, r: V, color: string, bone: any, detail = 1) => {
    const g = new THREE.IcosahedronGeometry(1, detail);
    g.scale(r[0], r[1], r[2]);
    return b.part(g, color, { at: c, bone });
  };

  const seg = (a: V, c: V, r: number, color: string, bone: any) => {
    const A = v(a), B = v(c);
    const len = Math.max(0.001, A.distanceTo(B));
    const g = new THREE.CapsuleGeometry(r, len, 2, 7);
    const mid = A.clone().add(B).multiplyScalar(0.5);
    return b.part(g, color, {
      at: [mid.x, mid.y, mid.z],
      dir: [B.x - A.x, B.y - A.y, B.z - A.z],
      bone,
    });
  };

  const cone = (base: V, dir: V, r: number, h: number, color: string, bone: any, sides = 4) => {
    const g = new THREE.ConeGeometry(r, h, sides);
    g.translate(0, h / 2, 0); // base at origin, tip along +Y
    return b.part(g, color, { at: base, dir, bone });
  };

  const disc = (c: V, dir: V, r: number, thick: number, color: string, bone: any, sides = 9) => {
    const g = new THREE.CylinderGeometry(r, r, thick, sides);
    return b.part(g, color, { at: c, dir, bone });
  };

  // point + outward normal on an ellipsoid
  const onEllipsoid = (c: V, r: V, az: number, el: number) => {
    const u = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
    const p: V = [c[0] + r[0] * u[0], c[1] + r[1] * u[1], c[2] + r[2] * u[2]];
    const n = new THREE.Vector3(u[0] / r[0], u[1] / r[1], u[2] / r[2]).normalize();
    return { p, n: [n.x, n.y, n.z] as V };
  };

  // ---------- body ----------
  const bodyC: V = [0, 0.36, -0.02];
  const bodyR: V = [0.19, 0.17, 0.25];
  blob(bodyC, bodyR, FUR, spine);
  blob([0, 0.36, -0.18], [0.17, 0.16, 0.14], FUR, hips);
  blob([0, 0.38, 0.13], [0.15, 0.15, 0.13], FUR, chest);
  // pale belly + chest bib
  blob([0, 0.29, 0.03], [0.14, 0.09, 0.2], FUR_LIGHT, spine);
  blob([0, 0.33, 0.19], [0.1, 0.12, 0.07], CREAM, chest);
  blob([0, 0.43, 0.22], [0.12, 0.1, 0.1], FUR, neck);

  // back fur tufts
  for (let i = 0; i < 46; i++) {
    const az = rand() * Math.PI * 2;
    const el = 0.25 + rand() * 1.1;
    const { p, n } = onEllipsoid(bodyC, bodyR, az, el);
    const base: V = [p[0] - n[0] * 0.006, p[1] - n[1] * 0.006, p[2] - n[2] * 0.006];
    const bone = p[2] > 0.06 ? chest : p[2] > -0.1 ? spine : hips;
    const col = rand() < 0.5 ? FUR_DARK : FUR_LIGHT;
    cone(base, n, 0.016 + rand() * 0.008, 0.03 + rand() * 0.02, col, bone);
  }

  // speckled white rump (koala's sitting patch)
  const rumpC: V = [0, 0.36, -0.18];
  const rumpR: V = [0.17, 0.16, 0.14];
  for (let i = 0; i < 16; i++) {
    const az = Math.PI + (rand() - 0.5) * 1.6;
    const el = -0.4 + rand() * 0.9;
    const { p, n } = onEllipsoid(rumpC, rumpR, az, el);
    const g = new THREE.IcosahedronGeometry(1, 0);
    const s = 0.012 + rand() * 0.012;
    g.scale(s, s * 0.35, s * 1.2);
    b.part(g, rand() < 0.7 ? WHITE : CREAM, { at: p, dir: n, bone: hips });
  }

  // stubby tail
  blob([0, 0.37, -0.31], [0.035, 0.03, 0.03], FUR_LIGHT, tail1, 0);

  // chest fluff
  for (let i = 0; i < 9; i++) {
    const az = (i / 8 - 0.5) * 1.4;
    const el = -0.2 + (i % 3) * 0.25;
    const { p, n } = onEllipsoid([0, 0.33, 0.19], [0.1, 0.12, 0.07], az, el);
    cone(p, [n[0], n[1] - 0.6, n[2]], 0.014, 0.04, WHITE, chest);
  }

  // ---------- head ----------
  const headC: V = [0, 0.56, 0.3];
  const headR: V = [0.19, 0.16, 0.15];
  blob(headC, headR, FUR, head);
  // brow + crown in a slightly darker tone
  blob([0, 0.64, 0.3], [0.15, 0.06, 0.11], FUR_DARK, head);
  // cheek fluff
  for (const sx of [1, -1]) {
    blob([0.15 * sx, 0.5, 0.32], [0.06, 0.05, 0.06], FUR_LIGHT, head);
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.35;
      cone(
        [0.18 * sx, 0.5 + Math.sin(a) * 0.03, 0.32 + Math.cos(a) * 0.01],
        [sx, Math.sin(a) * 0.8 - 0.2, 0.1],
        0.013, 0.04, WHITE, head,
      );
    }
  }

  // muzzle
  blob([0, 0.5, 0.4], [0.08, 0.05, 0.06], FUR_LIGHT, head);
  // big leathery nose
  blob([0, 0.535, 0.455], [0.052, 0.072, 0.045], NOSE, head);
  blob([0, 0.585, 0.44], [0.035, 0.03, 0.03], NOSE, head);
  blob([0.014, 0.57, 0.493], [0.01, 0.022, 0.006], NOSE_HI, head, 0);
  for (const sx of [1, -1]) {
    blob([0.02 * sx, 0.49, 0.49], [0.012, 0.009, 0.008], NOSTRIL, head, 0);
  }
  // mouth line
  seg([-0.035, 0.468, 0.445], [0.035, 0.468, 0.445], 0.004, MOUTH, head);

  // eyes: small, dark, with a glint and a lid
  for (const sx of [1, -1]) {
    blob([0.085 * sx, 0.6, 0.425], [0.022, 0.022, 0.018], EYE, head);
    blob([0.092 * sx, 0.608, 0.443], [0.006, 0.006, 0.004], WHITE, head, 0);
    blob([0.085 * sx, 0.618, 0.42], [0.03, 0.012, 0.022], FUR_DARK, head, 0);
  }

  // lower jaw (separate, opens on `jaw`)
  blob([0, 0.455, 0.395], [0.06, 0.028, 0.05], CREAM, jaw);
  blob([0, 0.462, 0.41], [0.045, 0.012, 0.035], MOUTH, jaw, 0);
  cone([0, 0.44, 0.41], [0, -1, 0.3], 0.015, 0.03, WHITE, jaw);

  // eucalyptus sprig held in the mouth
  const stemA: V = [0.02, 0.462, 0.45];
  const stemB: V = [0.2, 0.43, 0.52];
  seg(stemA, stemB, 0.004, STEM, jaw);
  const leaves: [number, number, number][] = [
    [0.35, 1, 0.6], [0.55, -1, -0.4], [0.75, 1, 0.3], [0.95, -1, -0.2], [1.05, 0, 0],
  ];
  leaves.forEach(([t, side, tilt], i) => {
    const A = v(stemA), B = v(stemB);
    const p = A.clone().lerp(B, Math.min(t, 1));
    const along = B.clone().sub(A).normalize();
    const out = new THREE.Vector3(0, side * 0.8 + 0.2 * tilt, side === 0 ? 0 : 0.3)
      .add(along.clone().multiplyScalar(side === 0 ? 1 : 0.6))
      .normalize();
    const g = new THREE.IcosahedronGeometry(1, 1);
    g.scale(0.018, 0.055, 0.004);
    g.translate(0, 0.05, 0);
    b.part(g, i % 2 ? LEAF_DARK : LEAF, { at: [p.x, p.y, p.z], dir: [out.x, out.y, out.z], bone: jaw });
    const vein = new THREE.BoxGeometry(0.002, 0.09, 0.002);
    vein.translate(0, 0.05, 0.004);
    b.part(vein, "#a9c9a8", { at: [p.x, p.y, p.z], dir: [out.x, out.y, out.z], bone: jaw });
  });

  // ---------- ears: big fluffy discs ----------
  for (const [ear, sx] of [[earL, 1], [earR, -1]] as [any, number][]) {
    const c: V = [0.165 * sx, 0.67, 0.27];
    disc(c, [0.15 * sx, 0.1, 1], 0.095, 0.04, FUR, ear, 10);
    disc([c[0], c[1], c[2] + 0.018], [0.15 * sx, 0.1, 1], 0.07, 0.012, WHITE, ear, 10);
    disc([c[0], c[1] - 0.005, c[2] + 0.024], [0.15 * sx, 0.1, 1], 0.04, 0.006, CREAM, ear, 8);
    // rim tufts on the outer edge
    for (let i = 0; i < 11; i++) {
      const a = -0.9 + (i / 10) * 2.9; // from outer-low to top-inner
      const dx = Math.cos(a) * sx, dy = Math.sin(a);
      cone(
        [c[0] + dx * 0.08, c[1] + dy * 0.08, c[2] + 0.012],
        [dx, dy, 0.25],
        0.017, 0.045 + (i % 2) * 0.015, i % 3 === 0 ? CREAM : WHITE, ear,
      );
    }
  }

  // ---------- legs ----------
  for (const s of ["L", "R"]) {
    const { sh, el, wr, hp, kn, an, sx } = legs[s];
    // front
    const S: V = [0.11 * sx, 0.33, 0.17], E: V = [0.13 * sx, 0.18, 0.2], W: V = [0.14 * sx, 0.05, 0.21];
    blob([0.11 * sx, 0.3, 0.17], [0.065, 0.08, 0.07], FUR, sh);
    seg(S, E, 0.047, FUR, sh);
    seg(E, W, 0.042, FUR_LIGHT, el);
    const P: V = [0.14 * sx, 0.03, 0.225];
    blob(P, [0.048, 0.03, 0.058], FUR_LIGHT, wr);
    blob([P[0], 0.012, P[2] + 0.01], [0.03, 0.01, 0.03], PAD, wr, 0);
    for (let k = 0; k < 4; k++) {
      const dx = (k - 1.5) * 0.02;
      cone([P[0] + dx, 0.022, P[2] + 0.045], [dx * 3, -0.35, 1], 0.007, 0.032, CLAW, wr, 4);
    }
    // fur cuff
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      cone([E[0] + Math.cos(a) * 0.035, E[1] + 0.02, E[2] + Math.sin(a) * 0.035], [Math.cos(a), -0.6, Math.sin(a)], 0.013, 0.035, FUR_DARK, el);
    }

    // hind
    const H: V = [0.13 * sx, 0.3, -0.17], K: V = [0.15 * sx, 0.17, -0.1], A: V = [0.15 * sx, 0.05, -0.16];
    blob([0.14 * sx, 0.27, -0.15], [0.07, 0.1, 0.1], FUR, hp);
    seg(H, K, 0.052, FUR, hp);
    seg(K, A, 0.045, FUR_LIGHT, kn);
    const Q: V = [0.15 * sx, 0.03, -0.13];
    blob(Q, [0.05, 0.03, 0.065], FUR_LIGHT, an);
    blob([Q[0], 0.012, Q[2] + 0.01], [0.032, 0.01, 0.035], PAD, an, 0);
    for (let k = 0; k < 4; k++) {
      const dx = (k - 1.5) * 0.021;
      cone([Q[0] + dx, 0.022, Q[2] + 0.05], [dx * 3, -0.35, 1], 0.007, 0.03, CLAW, an, 4);
    }
  }

  return b.root;
}
```