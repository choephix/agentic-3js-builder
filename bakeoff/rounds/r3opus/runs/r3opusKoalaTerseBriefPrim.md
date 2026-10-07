```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description:
    "A stylized low-poly koala puppet standing upright in a rest pose: arms out, big fluffy-rimmed ears, a glossy leathery nose, sleepy beady eyes, double-thumbed clawed hands, and a eucalyptus sprig in its right paw.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(7);

  const C = {
    fur: "#8e9299",
    furDark: "#6c7078",
    furLight: "#c4c7cc",
    white: "#f2f0ea",
    cream: "#e6dfd2",
    nose: "#2a282c",
    noseHi: "#615d66",
    nostril: "#131214",
    eye: "#141215",
    glint: "#ffffff",
    claw: "#2e2927",
    pad: "#4d4044",
    leaf: "#7fa596",
    leafLight: "#a9c7b6",
    leafDark: "#5f8577",
    stem: "#8b5e3c",
    gumnut: "#9a7b4f",
  };

  const add = (a: V, d: V, k = 1): V => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
  const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
  const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a: V): V => {
    const l = len(a) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };

  const sph = (r: number, at: V, scale: V, color: string, bone: any, ws = 10, hs = 8, dir?: V) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), color, dir ? { at, scale, bone, dir } : { at, scale, bone });

  const ico = (r: number, at: V, color: string, bone: any) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), color, { at, bone });

  const seg = (a: V, c: V, r: number, color: string, bone: any, radial = 7) => {
    const d = sub(c, a);
    const l = Math.max(len(d), 0.001);
    return b.part(new THREE.CapsuleGeometry(r, l, 3, radial), color, {
      at: add(a, d, 0.5),
      dir: d,
      bone,
    });
  };

  const cone = (base: V, dir: V, l: number, r: number, color: string, bone: any, radial = 5) => {
    const n = norm(dir);
    return b.part(new THREE.ConeGeometry(r, l, radial), color, {
      at: add(base, n, l * 0.5),
      dir: n,
      bone,
    });
  };

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.28, 0] });
  const spine = b.joint("spine", { at: [0, 0.42, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.52, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.58, 0.005], parent: chest });
  const head = b.joint("head", { at: [0, 0.64, 0.02], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.615, 0.07], parent: head });
  const tail = b.joint("tail", { at: [0, 0.25, -0.12], parent: hips });

  // ---------------- torso ----------------
  sph(1, [0, 0.4, 0], [0.165, 0.205, 0.145], C.fur, spine, 12, 10);
  sph(1, [0, 0.31, -0.02], [0.15, 0.11, 0.13], C.fur, hips, 10, 8);
  // belly and chest bib
  sph(1, [0, 0.39, 0.075], [0.12, 0.15, 0.08], C.furLight, spine, 10, 8);
  sph(1, [0, 0.52, 0.075], [0.095, 0.075, 0.05], C.white, chest, 10, 8);
  // bib fluff tufts
  for (let i = 0; i < 7; i++) {
    const t = (i / 6) * Math.PI;
    const p: V = [Math.cos(t) * 0.085, 0.5 - Math.sin(t) * 0.035 + 0.02, 0.118];
    cone(p, [Math.cos(t) * 0.6, -0.8, 0.5], 0.035, 0.014, C.white, chest);
  }
  // tail stub
  sph(0.035, [0, 0.25, -0.13], [1, 0.9, 1], C.furLight, tail, 8, 6);

  // fur flecks over body
  const fleckCols = [C.furDark, C.furLight, C.furDark, C.fur];
  for (let i = 0; i < 46; i++) {
    const u = rand() * 2 - 1;
    const th = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const d: V = [s * Math.cos(th), u * 0.85, s * Math.sin(th)];
    if (d[2] > 0.35 && Math.abs(d[0]) < 0.6) continue; // keep the belly clean
    const p: V = [d[0] * 0.163, 0.4 + d[1] * 0.203, d[2] * 0.143];
    ico(0.01 + rand() * 0.006, p, fleckCols[i % fleckCols.length], spine);
  }
  // white mottled rump
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 1.6;
    const y = 0.26 + rand() * 0.08;
    const p: V = [Math.cos(a) * 0.135, y, Math.sin(a) * 0.125 - 0.02];
    ico(0.012 + rand() * 0.006, p, C.white, hips);
  }

  // ---------------- head ----------------
  const HC: V = [0, 0.68, 0.02];
  sph(0.13, HC, [1.15, 1, 1], C.fur, head, 12, 10);
  // lighter cheeks/muzzle
  sph(1, [0, 0.625, 0.07], [0.105, 0.06, 0.075], C.furLight, head, 10, 8);
  // cheek fluff
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const p: V = [s * (0.125 + i * 0.008), 0.6 + i * 0.022, 0.05 - i * 0.01];
      cone(p, [s, -0.35 + i * 0.15, 0.2], 0.04, 0.016, i % 2 ? C.furLight : C.white, head);
    }
  }
  // forehead fur flecks
  for (let i = 0; i < 14; i++) {
    const az = (rand() - 0.5) * 2.4;
    const el = 0.35 + rand() * 0.9;
    const d: V = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
    if (d[2] > 0.55 && d[1] < 0.6) continue;
    const p: V = [d[0] * 0.148, 0.68 + d[1] * 0.128, 0.02 + d[2] * 0.128];
    ico(0.009 + rand() * 0.005, p, i % 2 ? C.furDark : C.furLight, head);
  }

  // big leathery nose
  sph(0.045, [0, 0.66, 0.152], [0.95, 1.2, 0.75], C.nose, head, 10, 8);
  sph(0.016, [-0.012, 0.69, 0.18], [1.2, 1.6, 0.5], C.noseHi, head, 6, 4);
  sph(0.006, [0.014, 0.7, 0.178], [1, 1, 0.5], C.noseHi, head, 5, 4);
  for (const s of [1, -1]) {
    sph(0.009, [s * 0.017, 0.618, 0.168], [1.3, 0.6, 0.8], C.nostril, head, 6, 4);
  }
  // mouth line + lower jaw
  seg([-0.022, 0.598, 0.124], [0.022, 0.598, 0.124], 0.0035, C.nose, head, 5);
  sph(1, [0, 0.592, 0.1], [0.05, 0.026, 0.045], C.furLight, jaw, 8, 6);
  sph(1, [0, 0.585, 0.098], [0.032, 0.016, 0.03], C.white, jaw, 8, 6);

  // sleepy beady eyes
  for (const s of [1, -1]) {
    const E: V = [s * 0.07, 0.71, 0.128];
    sph(0.018, E, [1, 1, 0.8], C.eye, head, 8, 6);
    sph(0.0055, add(E, [s * -0.005 + 0.002, 0.007, 0.013]), [1, 1, 1], C.glint, head, 5, 4);
    // heavy lid for a drowsy look
    sph(0.021, add(E, [0, 0.009, 0.0]), [1.08, 0.55, 0.95], C.furDark, head, 8, 6);
    // brow tuft
    seg(add(E, [s * -0.015, 0.03, -0.006]), add(E, [s * 0.02, 0.036, -0.012]), 0.006, C.furLight, head, 5);
  }

  // ---------------- ears ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const E: V = [s * 0.148, 0.79, -0.005];
    const ear = b.joint("ear" + side, { at: E, parent: head });
    sph(1, E, [0.095, 0.085, 0.035], C.fur, ear, 10, 8);
    sph(1, add(E, [s * 0.006, 0, 0.022]), [0.066, 0.058, 0.02], C.white, ear, 10, 8);
    sph(1, add(E, [s * 0.008, -0.004, 0.034]), [0.035, 0.032, 0.008], C.cream, ear, 8, 6);
    const n = 12;
    for (let i = 0; i < n; i++) {
      const th = ((-55 + (i / (n - 1)) * 255) * Math.PI) / 180;
      const p: V = add(E, [s * Math.cos(th) * 0.086, Math.sin(th) * 0.076, 0.006]);
      cone(p, [s * Math.cos(th), Math.sin(th), 0.18], 0.045 + (i % 2) * 0.012, 0.017, i % 3 === 1 ? C.furLight : C.white, ear);
      if (i % 2 === 0) ico(0.016, add(p, [s * Math.cos(th), Math.sin(th), 0.3], 0.008), C.white, ear);
    }
  }

  // ---------------- arms ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S: V = [s * 0.13, 0.52, 0.0];
    const El: V = [s * 0.27, 0.5, 0.02];
    const W: V = [s * 0.4, 0.48, 0.03];
    const shoulder = b.joint("shoulder" + side, { at: S, parent: chest });
    const elbow = b.joint("elbow" + side, { at: El, parent: shoulder });
    const wrist = b.joint("wrist" + side, { at: W, parent: elbow });

    sph(0.06, S, [1, 1, 1], C.fur, shoulder, 8, 6);
    seg(S, El, 0.052, C.fur, shoulder, 8);
    seg(El, W, 0.042, C.fur, elbow, 8);
    // pale fur along the underside of the arm
    seg(add(S, [s * 0.04, -0.035, 0.015]), add(El, [0, -0.03, 0.012]), 0.03, C.furLight, shoulder, 6);
    seg(add(El, [s * 0.01, -0.026, 0.01]), add(W, [s * -0.02, -0.022, 0.008]), 0.024, C.furLight, elbow, 6);
    // elbow fluff
    for (let i = 0; i < 3; i++) {
      cone(add(El, [s * (i - 1) * 0.02, -0.03, -0.02]), [s * 0.2, -0.6, -0.8], 0.04, 0.016, C.white, elbow);
    }
    // wrist cuff of fur
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ico(0.014, add(W, [s * -0.012, Math.cos(a) * 0.04, Math.sin(a) * 0.04]), i % 2 ? C.furLight : C.fur, wrist);
    }

    // paw
    const P: V = [s * 0.435, 0.478, 0.03];
    sph(1, P, [0.045, 0.024, 0.045], C.fur, wrist, 8, 6);
    sph(1, add(P, [0, -0.016, 0]), [0.032, 0.01, 0.032], C.pad, wrist, 8, 6);

    // three fingers out, two thumbs forward (koala grip)
    const digits: { name: string; base: V; dir: V }[] = [
      { name: "finger" + side + "1", base: [s * 0.465, 0.478, 0.022], dir: [s, -0.12, 0.25] },
      { name: "finger" + side + "2", base: [s * 0.47, 0.478, 0.0], dir: [s, -0.12, 0.0] },
      { name: "finger" + side + "3", base: [s * 0.465, 0.478, -0.022], dir: [s, -0.12, -0.25] },
      { name: "thumb" + side + "1", base: [s * 0.448, 0.478, 0.058], dir: [s * 0.55, -0.12, 1] },
      { name: "thumb" + side + "2", base: [s * 0.428, 0.478, 0.064], dir: [s * 0.2, -0.12, 1] },
    ];
    for (const d of digits) {
      const n = norm(d.dir);
      const tip = add(d.base, n, 0.032);
      const j = b.joint(d.name, { at: d.base, parent: wrist });
      seg(d.base, tip, 0.012, C.fur, j, 6);
      sph(0.008, add(tip, [0, -0.008, 0]), [1, 0.6, 1], C.pad, j, 5, 4);
      cone(add(tip, n, 0.004), [n[0], n[1] - 0.6, n[2]], 0.026, 0.0065, C.claw, j);
    }
  }

  // ---------------- legs ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const H: V = [s * 0.09, 0.27, 0.0];
    const K: V = [s * 0.11, 0.14, 0.04];
    const A: V = [s * 0.11, 0.05, 0.0];
    const hip = b.joint("hip" + side, { at: H, parent: hips });
    const knee = b.joint("knee" + side, { at: K, parent: hip });
    const ankle = b.joint("ankle" + side, { at: A, parent: knee });
    const toe = b.joint("toe" + side, { at: [s * 0.11, 0.03, 0.1], parent: ankle });

    sph(1, add(H, [s * 0.015, -0.04, 0.02]), [0.075, 0.09, 0.08], C.fur, hip, 10, 8);
    seg(H, K, 0.06, C.fur, hip, 8);
    seg(K, A, 0.045, C.fur, knee, 8);
    // light inner thigh
    sph(1, add(K, [s * -0.03, 0.02, 0.03]), [0.03, 0.05, 0.03], C.furLight, hip, 8, 6);

    // foot
    sph(1, [s * 0.11, 0.03, 0.045], [0.05, 0.03, 0.075], C.fur, ankle, 10, 8);
    sph(1, [s * 0.11, 0.045, 0.03], [0.042, 0.02, 0.05], C.furLight, ankle, 8, 6);
    // toes: clawless inner big toe, fused pair, two outer
    const toes: { x: number; z: number; r: number; claw: boolean }[] = [
      { x: -0.042, z: 0.08, r: 0.017, claw: false },
      { x: -0.016, z: 0.112, r: 0.014, claw: true },
      { x: 0.006, z: 0.115, r: 0.014, claw: true },
      { x: 0.028, z: 0.108, r: 0.015, claw: true },
      { x: 0.046, z: 0.092, r: 0.014, claw: true },
    ];
    for (const t of toes) {
      const p: V = [s * 0.11 + s * t.x, t.r + 0.002, t.z];
      sph(t.r, p, [1, 0.9, 1.2], C.fur, toe, 6, 5);
      if (t.claw) cone(add(p, [0, -0.002, t.r]), [s * t.x * 2, -0.35, 1], 0.02, 0.006, C.claw, toe);
    }
  }

  // ---------------- eucalyptus sprig in right paw ----------------
  const wristR = "wristR";
  void wristR;
  const sprigBone = b.joint("prop", { at: [-0.44, 0.47, 0.05], parent: hips });
  const s0: V = [-0.445, 0.42, 0.055];
  const s1: V = [-0.47, 0.74, 0.08];
  seg(s0, s1, 0.006, C.stem, sprigBone, 5);
  const stemDir = norm(sub(s1, s0));
  const leafCols = [C.leaf, C.leafLight, C.leafDark];
  for (let i = 0; i < 9; i++) {
    const t = 0.25 + (i / 8) * 0.75;
    const p = add(s0, sub(s1, s0), t);
    const side = i % 2 ? 1 : -1;
    const ld: V = norm([side * 0.85, 0.55, (i % 3 - 1) * 0.35]);
    const l = 0.045 + rand() * 0.015;
    seg(p, add(p, ld, 0.012), 0.003, C.stem, sprigBone, 4);
    sph(1, add(p, ld, 0.012 + l), [0.016, l, 0.004], leafCols[i % 3], sprigBone, 6, 6, ld);
  }
  // top leaf + gumnuts
  sph(1, add(s1, stemDir, 0.045), [0.014, 0.05, 0.004], C.leafLight, sprigBone, 6, 6, stemDir);
  for (let i = 0; i < 3; i++) {
    const p = add(add(s0, sub(s1, s0), 0.45), [0.012 + i * 0.008, -0.012 - i * 0.01, 0.012]);
    sph(0.009, p, [1, 1.2, 1], C.gumnut, sprigBone, 6, 4);
  }

  return b.root;
}
```