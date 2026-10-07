```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description:
    "A stylized low-poly male lion in a neutral rest pose: a blocky golden body, a layered, faceted mane in rust tones, an amber stare, and a tufted tail.",
};

type V = [number, number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / (len(a) || 1));

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(7);

  // ---------- palette ----------
  const GOLD = "#d9a54a";
  const GOLD_DK = "#bf8a36";
  const SADDLE = "#c9913d";
  const CREAM = "#f3dfb2";
  const MUZZLE = "#f8ead0";
  const TOE = "#e8c27c";
  const MANE1 = "#d98d33";
  const MANE2 = "#b35f22";
  const MANE3 = "#84401b";
  const MANE4 = "#5c2a14";
  const MANE_BASE = "#7a3a1a";
  const NOSE = "#6e3430";
  const DARK = "#24130a";
  const IRIS = "#e9a51c";
  const WHITE = "#fffaf0";
  const TUFT = "#4a2412";
  const EAR_IN = "#3e2112";

  // ---------- helpers ----------
  const J = (name: string, at: V, parent?: any, role?: string) => {
    const o: any = { at };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    return (b as any).joint(name, o);
  };
  const P = (geo: THREE.BufferGeometry, color: string, at: V, bone: any, dir?: V) => {
    const o: any = { at, bone };
    if (dir) o.dir = dir;
    return (b as any).part(geo, color, o);
  };
  const ell = (at: V, s: V, color: string, bone: any, w = 10, h = 8, dir?: V) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(s[0], s[1], s[2]);
    return P(g, color, at, bone, dir);
  };
  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone: any, sides = 8) => {
    const d = sub(c, a);
    const L = len(d);
    const g = new THREE.CylinderGeometry(r1, r0, L, sides, 1);
    return P(g, color, mul(add(a, c), 0.5), bone, norm(d));
  };
  const cone = (base: V, dir: V, length: number, r: number, color: string, bone: any, sides = 5) => {
    const d = norm(dir);
    const g = new THREE.ConeGeometry(r, length, sides);
    return P(g, color, add(base, mul(d, length / 2)), bone, d);
  };

  // ---------- skeleton ----------
  const H: V = [0, 1.3, 0.86];
  const hipsP: V = [0, 0.98, -0.55];
  const spineP: V = [0, 1.0, -0.1];
  const chestP: V = [0, 1.02, 0.32];
  const neckP: V = [0, 1.1, 0.56];

  const hips = J("hips", hipsP, undefined, "spine");
  const spine = J("spine", spineP, hips);
  const chest = J("chest", chestP, spine);
  const neck = J("neck", neckP, chest, "neck");
  const head = J("head", H, neck, "head");
  const jaw = J("jaw", add(H, [0, -0.09, 0.04]), head, "jaw");
  const earL = J("earL", add(H, [0.13, 0.15, 0.0]), head);
  const earR = J("earR", add(H, [-0.13, 0.15, 0.0]), head);

  // tail
  const tailPts: V[] = [
    [0, 0.98, -0.85],
    [0, 0.9, -1.1],
    [0, 0.78, -1.32],
    [0, 0.67, -1.52],
    [0, 0.59, -1.71],
    [0, 0.56, -1.88],
  ];
  const tail: any[] = [];
  tailPts.forEach((p, i) => tail.push(J(`tail${i}`, p, i === 0 ? hips : tail[i - 1], i === 0 ? "tail" : undefined)));

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = 0.2 * s;
    // front
    const shP: V = [x, 0.95, 0.42];
    const elP: V = [x * 1.05, 0.56, 0.35];
    const wrP: V = [x * 1.05, 0.17, 0.42];
    const pwP: V = [x * 1.05, 0.06, 0.47];
    const sh = J(`shoulder${side}`, shP, chest, "leg");
    const el = J(`elbow${side}`, elP, sh);
    const wr = J(`wrist${side}`, wrP, el);
    const pw = J(`paw${side}`, pwP, wr);
    // hind
    const hpP: V = [x, 0.95, -0.6];
    const knP: V = [x, 0.56, -0.45];
    const hkP: V = [x, 0.3, -0.76];
    const hpwP: V = [x, 0.06, -0.69];
    const hp = J(`hip${side}`, hpP, hips, "leg");
    const kn = J(`knee${side}`, knP, hp);
    const hk = J(`hock${side}`, hkP, kn);
    const hpw = J(`hindPaw${side}`, hpwP, hk);

    // ---- front leg geometry ----
    ell([x * 0.85, 0.9, 0.38], [0.13, 0.22, 0.17], GOLD, sh);
    seg(shP, elP, 0.1, 0.08, GOLD, sh);
    ell(elP, [0.08, 0.08, 0.085], GOLD, el, 8, 6);
    ell(add(elP, [0, -0.02, -0.06]), [0.045, 0.05, 0.04], GOLD_DK, el, 6, 5); // elbow tuft
    seg(elP, wrP, 0.075, 0.058, GOLD, el);
    ell(wrP, [0.058, 0.055, 0.06], GOLD, wr, 8, 6);
    seg(wrP, pwP, 0.056, 0.052, GOLD, wr);
    // paw
    ell(add(pwP, [0, -0.01, 0.03]), [0.08, 0.05, 0.095], TOE, pw);
    for (let t = 0; t < 4; t++) {
      const tx = (t - 1.5) * 0.034;
      const tz = 0.1 - Math.abs(t - 1.5) * 0.012;
      ell(add(pwP, [tx, -0.025, tz]), [0.03, 0.028, 0.036], TOE, pw, 7, 5);
      cone(add(pwP, [tx, -0.035, tz + 0.03]), [0, -0.4, 1], 0.018, 0.006, WHITE, pw, 4);
    }

    // ---- hind leg geometry ----
    ell([x * 0.85, 0.86, -0.55], [0.14, 0.25, 0.23], GOLD, hp);
    seg(hpP, knP, 0.11, 0.08, GOLD, hp);
    ell(knP, [0.075, 0.075, 0.08], GOLD, kn, 8, 6);
    seg(knP, hkP, 0.07, 0.052, GOLD, kn);
    ell(hkP, [0.05, 0.055, 0.06], GOLD_DK, hk, 8, 6);
    seg(hkP, hpwP, 0.05, 0.046, GOLD, hk);
    ell(add(hpwP, [0, -0.01, 0.03]), [0.072, 0.05, 0.09], TOE, hpw);
    for (let t = 0; t < 4; t++) {
      const tx = (t - 1.5) * 0.031;
      const tz = 0.095 - Math.abs(t - 1.5) * 0.012;
      ell(add(hpwP, [tx, -0.025, tz]), [0.028, 0.027, 0.033], TOE, hpw, 7, 5);
    }
  }

  // ---------- torso ----------
  ell([0, 0.98, 0.3], [0.3, 0.38, 0.38], GOLD, chest, 12, 9);
  ell([0, 0.98, -0.12], [0.27, 0.31, 0.44], GOLD, spine, 12, 9);
  ell([0, 0.98, -0.55], [0.27, 0.32, 0.33], GOLD, hips, 12, 9);
  ell([0, 1.08, -0.2], [0.2, 0.22, 0.5], SADDLE, spine, 10, 7); // darker back saddle
  ell([0, 0.78, -0.05], [0.21, 0.15, 0.4], CREAM, spine, 10, 7); // belly
  ell([0, 0.74, 0.3], [0.2, 0.14, 0.26], CREAM, chest, 10, 7); // chest underside
  ell([0, 0.92, -0.78], [0.18, 0.2, 0.12], GOLD, hips, 8, 6); // rump
  seg(neckP, H, 0.2, 0.17, GOLD, neck, 9);

  // ---------- tail ----------
  for (let i = 0; i < tailPts.length - 1; i++) {
    const r0 = 0.055 - i * 0.006;
    seg(tailPts[i], tailPts[i + 1], r0, r0 - 0.006, GOLD, tail[i], 7);
  }
  const tEnd = tailPts[tailPts.length - 1];
  const tBone = tail[tail.length - 1];
  ell(add(tEnd, [0, 0, -0.04]), [0.06, 0.06, 0.09], TUFT, tBone, 8, 6);
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    const spread = 0.55 + R() * 0.2;
    cone(add(tEnd, [0, 0, -0.06]), [Math.cos(a) * spread, Math.sin(a) * spread, -1], 0.1 + R() * 0.04, 0.035, k % 2 ? TUFT : MANE4, tBone);
  }

  // ---------- head ----------
  ell(H, [0.19, 0.18, 0.19], GOLD, head, 12, 9);
  for (const s of [1, -1]) ell(add(H, [0.11 * s, -0.04, 0.06]), [0.09, 0.1, 0.11], MANE1, head, 9, 7); // cheek ruffs
  // nose bridge
  {
    const g = new THREE.BoxGeometry(0.08, 0.18, 0.06);
    P(g, GOLD_DK, add(H, [0, 0.01, 0.17]), head, norm([0, -0.45, 1]));
  }
  // muzzle (upper jaw)
  ell(add(H, [0, -0.065, 0.15]), [0.1, 0.07, 0.1], MUZZLE, head, 10, 7);
  for (const s of [1, -1]) {
    const pad = add(H, [0.045 * s, -0.068, 0.215]);
    ell(pad, [0.052, 0.042, 0.048], MUZZLE, head, 9, 7);
    // whisker dots
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++)
        ell(add(pad, [s * (0.012 + c * 0.012), 0.008 - r * 0.014, 0.04 - c * 0.008]), [0.0055, 0.0055, 0.0055], DARK, head, 4, 3);
    // whiskers
    for (const k of [-0.15, 0, 0.15]) {
      const d = norm([s, k, 0.35]);
      const st = add(pad, [0.035 * s, k * 0.05, 0.015]);
      const g = new THREE.CylinderGeometry(0.0022, 0.0022, 0.15, 3);
      P(g, WHITE, add(st, mul(d, 0.075)), head, d);
    }
    // fangs
    cone(add(H, [0.026 * s, -0.098, 0.235]), [0, -1, 0.15], 0.032, 0.009, WHITE, head, 5);
  }
  // nose
  ell(add(H, [0, -0.02, 0.265]), [0.043, 0.026, 0.03], NOSE, head, 8, 6);
  ell(add(H, [0, -0.012, 0.28]), [0.02, 0.008, 0.012], "#9a5a4e", head, 6, 4); // nose sheen
  {
    const g = new THREE.BoxGeometry(0.006, 0.035, 0.006);
    P(g, DARK, add(H, [0, -0.055, 0.27]), head);
  }
  // lower jaw
  ell(add(H, [0, -0.118, 0.16]), [0.07, 0.034, 0.09], MUZZLE, jaw, 9, 6);
  {
    const g = new THREE.BoxGeometry(0.1, 0.006, 0.05);
    P(g, DARK, add(H, [0, -0.098, 0.2]), jaw); // mouth line
  }
  for (let k = 0; k < 5; k++) {
    const x = (k - 2) * 0.022;
    cone(add(H, [x, -0.13, 0.15 - Math.abs(k - 2) * 0.015]), [x * 2, -1, 0.25], 0.07 + R() * 0.03, 0.022, k % 2 ? MANE3 : MANE2, jaw);
  }

  // eyes
  for (const s of [1, -1]) {
    const E = add(H, [0.072 * s, 0.045, 0.165]);
    ell(add(E, [0, 0, -0.006]), [0.037, 0.028, 0.022], DARK, head, 8, 6);
    ell(E, [0.026, 0.024, 0.02], IRIS, head, 8, 6);
    ell(add(E, [0.003 * s, 0, 0.017]), [0.008, 0.016, 0.006], DARK, head, 6, 4);
    ell(add(E, [0.009 * s, 0.009, 0.021]), [0.005, 0.005, 0.004], WHITE, head, 4, 3);
    ell(add(E, [0, -0.031, -0.002]), [0.034, 0.012, 0.018], MUZZLE, head, 6, 4); // white under-eye patch
    const g = new THREE.BoxGeometry(0.018, 0.078, 0.026);
    P(g, GOLD_DK, add(E, [0.002 * s, 0.032, 0.006]), head, norm([s, 0.28, -0.15])); // stern brow
  }

  // ears
  for (const [ear, s] of [[earL, 1], [earR, -1]] as [any, number][]) {
    const E = add(H, [0.13 * s, 0.15, 0.0]);
    ell(E, [0.062, 0.06, 0.026], GOLD_DK, ear, 8, 6);
    ell(add(E, [0, -0.005, 0.018]), [0.038, 0.038, 0.012], EAR_IN, ear, 7, 5);
  }

  // ---------- mane ----------
  ell(add(H, [0, -0.1, -0.22]), [0.3, 0.36, 0.3], MANE_BASE, neck, 10, 8);
  const C = add(H, [0, -0.03, -0.08]);
  const layers = [
    { z: 0.02, r: 0.17, l: 0.15, rad: 0.06, tilt: 0.25, n: 16, colors: [MANE1, MANE2], bone: head },
    { z: -0.06, r: 0.2, l: 0.22, rad: 0.08, tilt: 0.6, n: 16, colors: [MANE2, MANE1], bone: head },
    { z: -0.16, r: 0.21, l: 0.27, rad: 0.09, tilt: 1.1, n: 14, colors: [MANE3, MANE2], bone: neck },
    { z: -0.28, r: 0.19, l: 0.25, rad: 0.09, tilt: 1.8, n: 12, colors: [MANE4, MANE3], bone: neck },
  ];
  layers.forEach((L, li) => {
    for (let k = 0; k < L.n; k++) {
      const a = (k / L.n) * Math.PI * 2 + li * 0.2 + (R() - 0.5) * 0.15;
      const down = Math.max(0, -Math.sin(a));
      const rr = L.r * (1 + 0.3 * down);
      const ll = L.l * (1 + 0.5 * down) * (0.85 + R() * 0.3);
      const base = add(C, [Math.cos(a) * rr, Math.sin(a) * rr, L.z]);
      const dir: V = [Math.cos(a), Math.sin(a) - 0.25 * down, -L.tilt];
      cone(base, dir, ll, L.rad, L.colors[k % 2], L.bone);
    }
  });
  // chest bib
  for (let k = 0; k < 9; k++) {
    const x = (k - 4) * 0.035;
    const base: V = [x, 1.02 + R() * 0.06, 0.66 - Math.abs(x) * 0.6];
    cone(base, [x * 1.5, -1, 0.3], 0.22 + R() * 0.1, 0.06, [MANE2, MANE3, MANE1][k % 3], neck);
  }
  // mane down the back of the neck
  for (let k = 0; k < 7; k++) {
    const t = k / 6;
    const base: V = [(R() - 0.5) * 0.12, 1.32 - t * 0.22, 0.58 - t * 0.28];
    cone(base, [(R() - 0.5) * 0.6, 0.6, -1], 0.2 + R() * 0.06, 0.07, k % 2 ? MANE4 : MANE3, k < 4 ? neck : chest);
  }

  return b.root;
}
```