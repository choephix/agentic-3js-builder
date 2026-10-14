import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion standing tall with his head held high: a huge shaggy mane fading from golden blond to dark chocolate, tawny body, cream belly and muzzle, amber eyes, broad black nose, a scar across the left brow, big padded paws and a long tail with a dark tuft.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "oldLion" });

  const R: any = rng(1977);
  const rand = (): number =>
    typeof R === "function" ? R() : R.next ? R.next() : R.float ? R.float() : Math.random();
  const jit = (s: number) => (rand() * 2 - 1) * s;

  // ---------- palette ----------
  const TAWNY = "#c99a5b";
  const TAWNY_L = "#dcb27a";
  const TAWNY_D = "#a97a42";
  const CREAM = "#f1e0bb";
  const DARK = "#2b1a10";
  const NOSE = "#1a1212";
  const AMBER = "#e9a224";
  const WHITE = "#fbf6ea";
  const SCAR = "#d38c7c";
  const SCAR_D = "#8e4a3c";
  const MANE = ["#efc964", "#dda340", "#bb7a2e", "#8e5222", "#5e3218", "#3a2010"];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.97, -0.55] });
  const spine = b.joint("spine", { at: [0, 1.0, -0.05], parent: hips } as any);
  const chest = b.joint("chest", { at: [0, 1.03, 0.45], parent: spine } as any);
  const neck = b.joint("neck", { at: [0, 1.22, 0.72], parent: chest } as any);
  const head = b.joint("head", { at: [0, 1.45, 0.95], parent: neck } as any);
  const jaw = b.joint("jaw", { at: [0, 1.42, 1.08], parent: head } as any);

  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = b.joint("shoulder" + L, { at: [0.2 * s, 1.0, 0.5], parent: chest } as any);
    const el = b.joint("elbow" + L, { at: [0.22 * s, 0.55, 0.47], parent: sh } as any);
    const wr = b.joint("wrist" + L, { at: [0.22 * s, 0.16, 0.53], parent: el } as any);
    const fp = b.joint("frontPaw" + L, { at: [0.22 * s, 0.07, 0.62], parent: wr } as any);
    const hp = b.joint("hip" + L, { at: [0.18 * s, 0.95, -0.62], parent: hips } as any);
    const kn = b.joint("knee" + L, { at: [0.21 * s, 0.55, -0.45], parent: hp } as any);
    const hk = b.joint("hock" + L, { at: [0.21 * s, 0.28, -0.72], parent: kn } as any);
    const hpw = b.joint("hindPaw" + L, { at: [0.21 * s, 0.07, -0.63], parent: hk } as any);
    legs[L] = { sh, el, wr, fp, hp, kn, hk, hpw };
  }

  const tailPts: V[] = [
    [0, 1.0, -0.92],
    [0, 0.95, -1.2],
    [0, 0.85, -1.45],
    [0, 0.73, -1.68],
    [0, 0.63, -1.9],
    [0, 0.58, -2.08],
    [0, 0.6, -2.22],
  ];
  const tail: any[] = [];
  tailPts.forEach((p, i) => {
    tail.push(
      b.joint(i === tailPts.length - 1 ? "tailTip" : "tail" + (i + 1), {
        at: p,
        parent: i === 0 ? hips : tail[i - 1],
      } as any)
    );
  });

  // ---------- helpers ----------
  const sph = (at: V, scale: V, color: string, bone: any, ws = 10, hs = 8) =>
    b.part(new THREE.SphereGeometry(1, ws, hs), color, { at, bone, scale } as any);

  const seg = (a: V, c: V, r: number, color: string, bone: any, radial = 8) => {
    const va = new THREE.Vector3(...a);
    const vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const len = Math.max(d.length(), 0.001);
    const m = va.clone().add(vc).multiplyScalar(0.5);
    return b.part(new THREE.CapsuleGeometry(r, len, 3, radial), color, {
      at: [m.x, m.y, m.z],
      dir: [d.x, d.y, d.z],
      bone,
    } as any);
  };

  const cone = (base: V, dir: V, r: number, len: number, color: string, bone: any, sides = 5) => {
    const d = new THREE.Vector3(...dir).normalize();
    const at = new THREE.Vector3(...base).addScaledVector(d, len * 0.5);
    return b.part(new THREE.ConeGeometry(r, len, sides), color, {
      at: [at.x, at.y, at.z],
      dir: [d.x, d.y, d.z],
      bone,
    } as any);
  };

  const box = (at: V, scale: V, color: string, bone: any) =>
    b.part(new THREE.BoxGeometry(1, 1, 1), color, { at, bone, scale } as any);

  // ---------- body ----------
  sph([0, 1.0, -0.05], [0.3, 0.31, 0.72], TAWNY, spine, 12, 9);
  sph([0, 1.0, 0.42], [0.32, 0.37, 0.36], TAWNY, chest, 12, 9);
  sph([0, 0.99, -0.62], [0.27, 0.29, 0.3], TAWNY, hips, 12, 9);
  sph([0, 0.8, 0.02], [0.21, 0.15, 0.55], CREAM, spine, 10, 8); // pale belly
  sph([0, 0.84, 0.42], [0.2, 0.18, 0.25], CREAM, chest, 10, 8);
  seg([0, 1.3, 0.25], [0, 1.27, -0.7], 0.05, TAWNY_D, spine); // darker saddle line
  for (const s of [1, -1]) {
    sph([0.16 * s, 0.94, -0.6], [0.15, 0.26, 0.26], TAWNY, hips); // haunch
    sph([0.21 * s, 1.03, 0.48], [0.12, 0.23, 0.16], TAWNY, chest); // shoulder blade
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const g = legs[L];
    const x = (v: number) => v * s;
    // front
    seg([x(0.21), 0.95, 0.5], [x(0.22), 0.55, 0.47], 0.1, TAWNY, g.sh);
    seg([x(0.22), 0.55, 0.47], [x(0.22), 0.15, 0.53], 0.075, TAWNY, g.el);
    cone([x(0.22), 0.57, 0.4], [0.15 * s, -0.5, -1], 0.04, 0.12, DARK, g.el); // elbow tuft
    cone([x(0.23), 0.6, 0.41], [0.1 * s, -0.9, -0.8], 0.035, 0.1, MANE[4], g.el);
    sph([x(0.22), 0.075, 0.6], [0.12, 0.075, 0.14], TAWNY_L, g.wr);
    for (let t = 0; t < 4; t++) {
      const tx = x(0.22) + (t - 1.5) * 0.055;
      sph([tx, 0.045, 0.71 - Math.abs(t - 1.5) * 0.02], [0.038, 0.04, 0.045], TAWNY_L, g.fp, 8, 6);
      sph([tx, 0.06, 0.745 - Math.abs(t - 1.5) * 0.02], [0.012, 0.01, 0.01], "#e9dcc4", g.fp, 6, 4); // claw tip
    }
    // hind
    seg([x(0.18), 0.95, -0.62], [x(0.21), 0.55, -0.45], 0.12, TAWNY, g.hp);
    seg([x(0.21), 0.55, -0.45], [x(0.21), 0.28, -0.72], 0.07, TAWNY, g.kn);
    seg([x(0.21), 0.28, -0.72], [x(0.21), 0.1, -0.64], 0.058, TAWNY, g.hk);
    sph([x(0.21), 0.072, -0.6], [0.105, 0.072, 0.13], TAWNY_L, g.hk);
    for (let t = 0; t < 4; t++) {
      const tx = x(0.21) + (t - 1.5) * 0.05;
      sph([tx, 0.042, -0.5 - Math.abs(t - 1.5) * 0.02], [0.034, 0.038, 0.04], TAWNY_L, g.hpw, 8, 6);
    }
  }

  // ---------- tail ----------
  for (let i = 0; i < tailPts.length - 1; i++) {
    const r = 0.048 - i * 0.004;
    seg(tailPts[i], tailPts[i + 1], r, i < 4 ? TAWNY : TAWNY_D, tail[i], 7);
  }
  // dark tuft
  const tuftC: V = [0, 0.6, -2.26];
  sph(tuftC, [0.07, 0.07, 0.11], DARK, tail[6], 8, 6);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    cone(
      [tuftC[0] + Math.cos(a) * 0.03, tuftC[1] + Math.sin(a) * 0.03, tuftC[2]],
      [Math.cos(a) * 0.5, Math.sin(a) * 0.5, -1],
      0.035,
      0.14 + jit(0.03),
      i % 3 === 0 ? MANE[5] : DARK,
      tail[6]
    );
  }

  // ---------- mane ----------
  // fill volumes so the tufts never show gaps
  sph([0, 1.42, 0.78], [0.38, 0.4, 0.32], MANE[3], neck, 12, 9);
  sph([0, 1.33, 0.58], [0.36, 0.38, 0.3], MANE[4], neck, 12, 9);
  sph([0, 1.5, 0.95], [0.29, 0.31, 0.15], MANE[1], head, 12, 9);

  const ring = (
    cy: number, cz: number, rad: number, n: number, r: number, len: number,
    colors: string[], back: number, bone: any, phase: number
  ) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + phase + jit(0.08);
      const ox = Math.cos(a), oy = Math.sin(a);
      const ry = oy > 0 ? 0.88 : 1.05;
      const base: V = [ox * rad, cy + oy * rad * ry, cz + jit(0.02)];
      const dir: V = [ox, oy * ry - 0.15, -back + jit(0.1)];
      cone(base, dir, r * (0.85 + rand() * 0.3), len * (0.8 + rand() * 0.4),
        colors[Math.floor(rand() * colors.length)], bone);
    }
  };
  ring(1.5, 1.03, 0.235, 16, 0.065, 0.15, [MANE[0], MANE[0], MANE[1]], 0.25, head, 0);
  ring(1.48, 0.95, 0.31, 18, 0.085, 0.22, [MANE[0], MANE[1], MANE[1]], 0.45, head, 0.17);
  ring(1.44, 0.84, 0.37, 20, 0.1, 0.26, [MANE[1], MANE[2], MANE[2]], 0.7, neck, 0.05);
  ring(1.39, 0.7, 0.4, 20, 0.11, 0.28, [MANE[2], MANE[3], MANE[3]], 1.0, neck, 0.2);
  ring(1.33, 0.56, 0.37, 18, 0.105, 0.27, [MANE[3], MANE[4], MANE[4]], 1.4, neck, 0.1);
  ring(1.27, 0.43, 0.3, 14, 0.09, 0.24, [MANE[4], MANE[5]], 2.0, neck, 0.3);

  // chest mane hanging down between the forelegs
  for (let i = 0; i < 8; i++) {
    const xx = -0.2 + (i / 7) * 0.4;
    cone([xx, 1.08 + jit(0.03), 0.82 - Math.abs(xx) * 0.3], [jit(0.15), -1, 0.25],
      0.07, 0.3 + jit(0.05), i % 2 ? MANE[4] : MANE[3], chest);
  }
  for (let i = 0; i < 6; i++) {
    const xx = -0.15 + (i / 5) * 0.3;
    cone([xx, 0.92, 0.72], [jit(0.1), -1, 0.1], 0.055, 0.24 + jit(0.04), MANE[5], chest);
  }
  // crest along the back of the neck
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    cone([jit(0.04), 1.72 - t * 0.38, 0.72 - t * 0.38], [jit(0.2), 1, -0.9 - t * 0.6],
      0.08, 0.24, t > 0.5 ? MANE[5] : MANE[4], neck);
  }

  // ---------- head ----------
  sph([0, 1.5, 1.0], [0.2, 0.19, 0.22], TAWNY, head, 12, 9);
  sph([0, 1.43, 1.18], [0.14, 0.1, 0.12], TAWNY_L, head);
  seg([0, 1.6, 1.1], [0, 1.495, 1.255], 0.056, TAWNY_L, head); // nose bridge
  box([0, 1.482, 1.305], [0.11, 0.046, 0.055], NOSE, head); // broad black nose
  cone([0, 1.46, 1.315], [0, -1, 0.15], 0.022, 0.03, NOSE, head, 4);
  seg([0, 1.455, 1.31], [0, 1.41, 1.3], 0.006, DARK, head, 5); // philtrum
  for (const s of [1, -1]) {
    sph([0.055 * s, 1.405, 1.25], [0.07, 0.055, 0.06], CREAM, head); // muzzle pads
    for (let k = 0; k < 3; k++)
      for (let j = 0; j < 2; j++)
        sph([(0.04 + k * 0.022) * s, 1.42 - j * 0.02, 1.302 - k * 0.012], [0.005, 0.005, 0.004], DARK, head, 5, 4);
    for (let k = 0; k < 3; k++) {
      const base: V = [0.09 * s, 1.41 - k * 0.018, 1.27];
      const tip: V = [0.27 * s, 1.44 - k * 0.05, 1.23 - k * 0.02];
      seg(base, tip, 0.003, WHITE, head, 4);
    }
    // canine peeking out
    cone([0.04 * s, 1.37, 1.275], [0, -1, 0.1], 0.009, 0.03, WHITE, head, 5);
    // cheeks cream
    sph([0.12 * s, 1.43, 1.1], [0.06, 0.06, 0.06], CREAM, head, 8, 6);
  }
  // lower jaw (separate)
  sph([0, 1.355, 1.18], [0.085, 0.045, 0.09], CREAM, jaw);
  seg([-0.07, 1.375, 1.22], [0.07, 1.375, 1.22], 0.007, DARK, jaw, 5); // mouth line

  // eyes
  for (const s of [1, -1]) {
    const ex = 0.075 * s;
    sph([ex, 1.56, 1.183], [0.034, 0.03, 0.022], DARK, head, 10, 8); // dark rim
    sph([ex, 1.56, 1.19], [0.028, 0.025, 0.02], AMBER, head, 10, 8);
    sph([ex, 1.56, 1.207], [0.011, 0.012, 0.006], NOSE, head, 8, 6);
    sph([ex + 0.008, 1.567, 1.211], [0.004, 0.004, 0.003], WHITE, head, 6, 4);
    sph([ex, 1.53, 1.17], [0.035, 0.016, 0.02], CREAM, head, 8, 6); // pale under-eye
    // heavy brow
    seg([0.04 * s, 1.598, 1.175], [0.115 * s, 1.588, 1.152], 0.019, TAWNY_D, head, 6);
    // dark tear line
    seg([0.06 * s, 1.545, 1.195], [0.05 * s, 1.49, 1.215], 0.005, DARK, head, 4);
    // ears
    sph([0.15 * s, 1.69, 1.0], [0.06, 0.065, 0.03], DARK, head, 8, 6);
    sph([0.15 * s, 1.69, 1.015], [0.052, 0.057, 0.025], TAWNY, head, 8, 6);
    sph([0.15 * s, 1.685, 1.03], [0.032, 0.036, 0.012], CREAM, head, 8, 6);
  }
  // scar across the left (+X) eyebrow, past the eye
  seg([0.045, 1.66, 1.168], [0.08, 1.603, 1.198], 0.008, SCAR, head, 5);
  seg([0.08, 1.603, 1.198], [0.112, 1.54, 1.196], 0.008, SCAR, head, 5);
  seg([0.05, 1.652, 1.172], [0.11, 1.548, 1.2], 0.003, SCAR_D, head, 4);
  for (const t of [0.25, 0.55, 0.8]) {
    const px = 0.045 + (0.112 - 0.045) * t;
    const py = 1.66 + (1.54 - 1.66) * t;
    seg([px - 0.012, py - 0.006, 1.195], [px + 0.012, py + 0.006, 1.196], 0.0035, SCAR, head, 4); // stitch marks
  }
  // grizzled forehead lines of an old lion
  for (let i = 0; i < 3; i++) {
    seg([-0.05, 1.63 + i * 0.018, 1.16 - i * 0.012], [0.03, 1.635 + i * 0.018, 1.16 - i * 0.012], 0.004, TAWNY_D, head, 4);
  }

  return b.root;
}
