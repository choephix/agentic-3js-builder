import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "Candy-pink flamingo wading in shallow water: S-curved neck, bent two-tone beak, coral wings with black flight feathers, knobbly-kneed rose legs and webbed feet.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "flamingo" });
  const rand = rng(7);

  const PINK = "#f78fb0";
  const PINK2 = "#f9a3bf";
  const PINK3 = "#f47ba2";
  const CORAL = "#ff7060";
  const CORAL2 = "#ff5a52";
  const CORAL_LIGHT = "#ff8f86";
  const BLACK = "#1b1a20";
  const ROSE = "#e8708a";
  const ROSE_DARK = "#cf4d6c";
  const BEAK = "#f9cdd6";
  const EYE = "#f6ec9a";
  const WATER = "#8fd3e6";
  const WATER_LIGHT = "#c9eef6";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.85, 0] });
  const spine = b.joint("spine", { at: [0, 0.9, 0.15], parent: hips });
  const tail1 = b.joint("tail1", { at: [0, 0.84, -0.25], parent: hips });

  const neckPts: [number, number, number][] = [
    [0, 0.95, 0.22],
    [0, 1.1, 0.36],
    [0, 1.3, 0.34],
    [0, 1.47, 0.2],
    [0, 1.58, 0.18],
    [0, 1.66, 0.25],
  ];
  const neckJ: THREE.Object3D[] = [];
  let prev: any = spine;
  for (let i = 0; i < 5; i++) {
    const j = b.joint("neck" + (i + 1), { at: neckPts[i], parent: prev });
    neckJ.push(j);
    prev = j;
  }
  const head = b.joint("head", { at: neckPts[5], parent: prev });
  const jaw = b.joint("jaw", { at: [0, 1.63, 0.29], parent: head });

  const wingJ: Record<string, any> = {};
  const legJ: Record<string, any> = {};
  const sides: [number, string][] = [
    [1, "L"],
    [-1, "R"],
  ];
  for (const [s, n] of sides) {
    wingJ[n] = b.joint("shoulder" + n, { at: [s * 0.15, 0.95, 0.08], parent: hips });
    const hip = b.joint("hip" + n, { at: [s * 0.08, 0.8, -0.02], parent: hips });
    const knee = b.joint("knee" + n, { at: [s * 0.08, 0.42, 0.05], parent: hip });
    const foot = b.joint("foot" + n, { at: [s * 0.08, 0.04, 0.0], parent: knee });
    legJ[n] = { hip, knee, foot };
  }

  // ---------- helpers ----------
  const Y = new THREE.Vector3(0, 1, 0);
  const add = (geo: THREE.BufferGeometry, color: string, bone: any) => {
    b.part(geo, color, { bone });
  };
  const ell = (
    c: number[],
    s: number[],
    color: string,
    bone: any,
    rotY = 0,
    rotX = 0,
    rotZ = 0
  ) => {
    const g = new THREE.SphereGeometry(1, 10, 7);
    g.scale(s[0], s[1], s[2]);
    if (rotX) g.rotateX(rotX);
    if (rotZ) g.rotateZ(rotZ);
    if (rotY) g.rotateY(rotY);
    g.translate(c[0], c[1], c[2]);
    add(g, color, bone);
  };
  const seg = (
    a: number[],
    c: number[],
    r0: number,
    r1: number,
    color: string,
    bone: any,
    sides = 8
  ) => {
    const va = new THREE.Vector3(...(a as [number, number, number]));
    const vb = new THREE.Vector3(...(c as [number, number, number]));
    const d = vb.clone().sub(va);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides, 1);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()));
    const m = va.clone().add(vb).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    add(g, color, bone);
  };

  // ---------- water ----------
  add(new THREE.CylinderGeometry(0.95, 0.95, 0.03, 28).translate(0, 0.015, 0), WATER, hips);
  for (const [s] of sides) {
    for (const r of [0.1, 0.17]) {
      const t = new THREE.TorusGeometry(r, 0.006, 4, 20);
      t.rotateX(Math.PI / 2);
      t.translate(s * 0.08, 0.032, 0.02);
      add(t, WATER_LIGHT, hips);
    }
  }

  // ---------- body ----------
  ell([0, 0.88, 0], [0.17, 0.18, 0.3], PINK, hips);
  ell([0, 0.93, 0.17], [0.14, 0.16, 0.17], PINK, spine);
  ell([0, 0.84, -0.27], [0.09, 0.07, 0.17], PINK3, tail1, 0, -0.15);
  // tail feathers
  for (let i = -1; i <= 1; i++) {
    ell([i * 0.04, 0.82, -0.42], [0.025, 0.02, 0.1], i === 0 ? BLACK : PINK3, tail1, i * 0.12);
  }
  // breast / body feather scallops
  for (let i = 0; i < 26; i++) {
    const az = rand() * Math.PI * 2;
    const el = (rand() - 0.5) * 1.6;
    const px = Math.cos(el) * Math.sin(az) * 0.175;
    const py = Math.sin(el) * 0.185;
    const pz = Math.cos(el) * Math.cos(az) * 0.3;
    if (py < -0.08) continue;
    const col = [PINK2, PINK3, PINK][Math.floor(rand() * 3)];
    ell([px, 0.88 + py, pz], [0.05, 0.035, 0.07], col, hips, az, -el * 0.5);
  }
  // breast ruff
  for (let i = 0; i < 6; i++) {
    const a = (i / 5 - 0.5) * 1.8;
    ell([Math.sin(a) * 0.1, 0.99 - Math.abs(a) * 0.03, 0.3], [0.045, 0.05, 0.05], PINK2, spine, a);
  }

  // ---------- wings ----------
  for (const [s, n] of sides) {
    const w = wingJ[n];
    ell([s * 0.17, 0.97, 0.06], [0.035, 0.1, 0.15], CORAL_LIGHT, w);
    ell([s * 0.172, 0.9, -0.04], [0.04, 0.14, 0.26], CORAL, w, 0, 0.05);
    ell([s * 0.178, 0.86, -0.12], [0.035, 0.1, 0.22], CORAL2, w, 0, 0.08);
    ell([s * 0.165, 0.84, -0.2], [0.03, 0.07, 0.2], CORAL, w, s * 0.03, 0.1);
    // black flight feathers
    for (let k = 0; k < 4; k++) {
      ell(
        [s * (0.15 - k * 0.012), 0.82 - k * 0.012, -0.34 - k * 0.04],
        [0.022, 0.045, 0.17],
        BLACK,
        w,
        s * (0.04 + k * 0.03),
        0.04
      );
    }
  }

  // ---------- neck ----------
  const curve = new THREE.CatmullRomCurve3(
    neckPts.map((p) => new THREE.Vector3(...p)),
    false,
    "catmullrom",
    0.5
  );
  const N = 16;
  const rad = (t: number) => 0.048 - 0.018 * t;
  for (let i = 0; i < N; i++) {
    const t0 = i / N;
    const t1 = (i + 1) / N;
    const p0 = curve.getPoint(t0);
    const p1 = curve.getPoint(t1);
    const bone = neckJ[Math.min(4, Math.floor(((t0 + t1) / 2) * 5))];
    seg(p0.toArray(), p1.toArray(), rad(t0), rad(t1), i % 2 ? PINK2 : PINK, bone, 8);
    const sp = new THREE.SphereGeometry(rad(t1), 8, 6).translate(p1.x, p1.y, p1.z);
    add(sp, PINK, bone);
  }

  // ---------- head & beak ----------
  const H = neckPts[5];
  ell(H, [0.045, 0.045, 0.055], PINK, head);
  ell([H[0], H[1] - 0.02, H[2] - 0.02], [0.04, 0.04, 0.05], PINK2, head);
  const hb = (dx: number, dy: number, dz: number) => [H[0] + dx, H[1] + dy, H[2] + dz];
  // upper beak: bent down
  seg(hb(0, -0.005, 0.03), hb(0, -0.015, 0.11), 0.03, 0.028, BEAK, head, 6);
  seg(hb(0, -0.015, 0.11), hb(0, -0.06, 0.19), 0.028, 0.02, BEAK, head, 6);
  seg(hb(0, -0.06, 0.19), hb(0, -0.115, 0.215), 0.02, 0.004, BLACK, head, 6);
  // lower jaw
  seg(hb(0, -0.04, 0.03), hb(0, -0.05, 0.11), 0.022, 0.022, BEAK, jaw, 6);
  seg(hb(0, -0.05, 0.11), hb(0, -0.075, 0.175), 0.022, 0.016, BEAK, jaw, 6);
  seg(hb(0, -0.075, 0.175), hb(0, -0.1, 0.205), 0.016, 0.005, BLACK, jaw, 6);
  // eyes
  for (const [s] of sides) {
    ell(hb(s * 0.04, 0.012, 0.03), [0.02, 0.022, 0.022], EYE, head);
    ell(hb(s * 0.056, 0.012, 0.038), [0.008, 0.012, 0.012], BLACK, head);
    // brow patch
    ell(hb(s * 0.03, 0.04, 0.02), [0.025, 0.012, 0.03], PINK3, head);
  }

  // ---------- legs ----------
  for (const [s, n] of sides) {
    const { hip, knee, foot } = legJ[n];
    const hp = [s * 0.08, 0.8, -0.02];
    const kp = [s * 0.08, 0.42, 0.05];
    const fp = [s * 0.08, 0.04, 0.0];
    ell([s * 0.08, 0.8, -0.02], [0.05, 0.06, 0.07], PINK, hip);
    seg(hp, kp, 0.02, 0.016, ROSE, hip, 6);
    // knobbly knee
    ell(kp, [0.032, 0.035, 0.035], ROSE_DARK, knee);
    ell([kp[0] + s * 0.012, kp[1] + 0.02, kp[2] + 0.015], [0.016, 0.016, 0.016], ROSE, knee);
    ell([kp[0], kp[1] - 0.025, kp[2] - 0.02], [0.016, 0.016, 0.016], ROSE, knee);
    seg(kp, fp, 0.014, 0.012, ROSE, knee, 6);
    // ankle knob
    ell([fp[0], fp[1] + 0.012, fp[2]], [0.02, 0.02, 0.022], ROSE_DARK, foot);
    // toes
    const angs = [-0.55, 0, 0.55];
    angs.forEach((a, i) => {
      const tj = b.joint("toe" + (i + 1) + n, { at: [fp[0], 0.04, fp[2]], parent: foot });
      const tip = [fp[0] + Math.sin(a) * 0.15 * 1, 0.036, fp[2] + Math.cos(a) * 0.15];
      seg([fp[0], 0.042, fp[2]], tip, 0.011, 0.007, ROSE, tj, 5);
      ell(tip, [0.009, 0.007, 0.012], ROSE_DARK, tj);
    });
    // web
    const web = new THREE.CylinderGeometry(0.095, 0.095, 0.004, 3);
    web.rotateY(Math.PI);
    web.scale(1.1, 1, 1);
    web.translate(fp[0], 0.036, fp[2] + 0.06);
    add(web, ROSE_DARK, foot);
  }

  return b.root;
}
