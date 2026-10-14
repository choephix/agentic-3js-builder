import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin",
  description:
    "A stylized low-poly emperor penguin in a rig-ready rest pose: a faceted pear-shaped body, crisp white belly with slate trim, golden ear patches, a split beak with jaw and flippers held out to the sides.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // ---------- palette ----------
  const C = {
    back: "#222a37",
    head: "#111318",
    belly: "#f8f6ef",
    trim: "#3e4859",
    chest: "#ffe7a3",
    neckGold: "#ffcd55",
    ear: "#ffa91c",
    beak: "#16181c",
    jawOrange: "#ff7a3a",
    feet: "#2a2b31",
    claw: "#0f1013",
    flipUnder: "#eef1f5",
    eye: "#1b0f0a",
    shine: "#ffffff",
    scallop: "#dfe6ee",
    backScale: "#2d3646",
  };

  // ---------- skeleton ----------
  const J = (name: string, at: V, parent?: any, role?: string) => {
    const o: any = { at };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    return b.joint(name, o);
  };

  const hips = J("hips", [0, 0.3, 0], undefined, "spine");
  const spine = J("spine", [0, 0.5, 0], hips, "spine");
  const chest = J("chest", [0, 0.68, 0], spine, "spine");
  const neck = J("neck", [0, 0.84, 0.02], chest, "neck");
  const head = J("head", [0, 0.93, 0.04], neck, "head");
  const jaw = J("jaw", [0, 0.9, 0.15], head, "jaw");
  const headTop = J("headTop", [0, 1.06, 0.03], head, "head");
  const tail1 = J("tail1", [0, 0.14, -0.18], hips, "tail");
  const tail2 = J("tail2", [0, 0.07, -0.3], tail1, "tail");
  void headTop;
  void tail2;

  // ---------- helpers ----------
  const ell = (rx: number, ry: number, rz: number, w = 10, h = 7) =>
    new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);
  const add = (a: V, d: V, k: number): V => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
  const part = (g: THREE.BufferGeometry, color: string, at: V, bone: any) =>
    b.part(g, color, { at, bone } as any);

  // body profile (radius, y)
  const prof: [number, number][] = [
    [0.0, 0.03],
    [0.13, 0.04],
    [0.21, 0.1],
    [0.255, 0.22],
    [0.262, 0.35],
    [0.243, 0.5],
    [0.2, 0.63],
    [0.15, 0.75],
    [0.11, 0.85],
    [0.06, 0.9],
    [0.0, 0.925],
  ];
  const rAt = (y: number) => {
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, y0] = prof[i];
      const [r1, y1] = prof[i + 1];
      if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0;
  };
  const lathe = (pts: [number, number][], seg: number, phiStart = 0, phiLen = Math.PI * 2) =>
    new THREE.LatheGeometry(
      pts.map(([r, y]) => new THREE.Vector2(r, y)),
      seg,
      phiStart,
      phiLen
    );

  // ---------- body ----------
  const lowerPts = prof.slice(0, 5);
  const upperPts = prof.slice(4);
  part(lathe(lowerPts, 12), C.back, [0, 0, 0], hips);
  part(lathe(upperPts, 12), C.back, [0, 0, 0], chest);

  // white belly shield on the front
  const bellyArc = 1.25;
  const bellyLow: [number, number][] = [0.06, 0.1, 0.22, 0.35].map((y) => [rAt(y) * 1.016, y]);
  const bellyHigh: [number, number][] = [0.35, 0.5, 0.63, 0.72].map((y) => [rAt(y) * 1.016, y]);
  bellyHigh.push([rAt(0.77) * 0.97, 0.77]);
  bellyLow.unshift([rAt(0.045) * 0.95, 0.045]);
  part(lathe(bellyLow, 10, -bellyArc, bellyArc * 2), C.belly, [0, 0, 0], hips);
  part(lathe(bellyHigh, 10, -bellyArc, bellyArc * 2), C.belly, [0, 0, 0], chest);

  // slate trim bands where black meets white
  const trimPts: [number, number][] = [0.12, 0.22, 0.35, 0.5, 0.63, 0.7].map((y) => [rAt(y) * 1.026, y]);
  for (const s of [1, -1]) {
    const start = s > 0 ? bellyArc - 0.03 : -bellyArc - 0.05;
    part(lathe(trimPts, 2, start, 0.08), C.trim, [0, 0, 0], spine);
  }

  // feather scallops on the belly
  const rows = [0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.63];
  rows.forEach((y, ri) => {
    const off = ri % 2 ? 0.14 : 0;
    for (let p = -0.84 + off; p <= 0.85; p += 0.28) {
      const r = rAt(y) * 1.024;
      const g = ell(0.017, 0.009, 0.003, 6, 4).rotateY(p);
      part(g, C.scallop, [Math.sin(p) * r, y, Math.cos(p) * r], y < 0.4 ? hips : chest);
    }
  });
  // subtle scale pattern on the back
  [0.22, 0.34, 0.46, 0.58].forEach((y, ri) => {
    const off = ri % 2 ? 0.17 : 0;
    for (let p = Math.PI - 0.85 + off; p <= Math.PI + 0.86; p += 0.34) {
      const r = rAt(y) * 1.012;
      const g = ell(0.022, 0.011, 0.003, 6, 4).rotateY(p);
      part(g, C.backScale, [Math.sin(p) * r, y, Math.cos(p) * r], y < 0.4 ? hips : chest);
    }
  });

  // golden upper breast and neck streaks
  part(ell(0.12, 0.065, 0.06), C.chest, [0, 0.72, 0.115], chest);
  part(ell(0.07, 0.04, 0.04, 8, 6), C.neckGold, [0, 0.765, 0.105], neck);
  for (const s of [1, -1]) {
    part(ell(0.032, 0.075, 0.04, 8, 6).rotateZ(s * 0.35), C.neckGold, [s * 0.098, 0.8, 0.065], neck);
  }

  // ---------- head ----------
  const HC: V = [0, 0.93, 0.04];
  const HR = 0.13;
  part(ell(HR, HR * 0.95, HR * 1.02, 12, 8), C.head, HC, head);
  // little crest tuft
  [-0.45, 0, 0.45].forEach((t, i) => {
    const g = new THREE.ConeGeometry(0.012, 0.055 - Math.abs(t) * 0.02, 5).rotateZ(-t).rotateX(-0.25);
    part(g, C.head, [Math.sin(t) * 0.02, 1.07 - (i === 1 ? 0 : 0.005), 0.02], head);
  });

  // ear patches
  for (const s of [1, -1]) {
    part(ell(0.028, 0.06, 0.045, 8, 6).rotateZ(s * 0.25).rotateY(s * 0.2), C.ear, [s * 0.117, 0.9, 0.0], head);
    part(ell(0.02, 0.035, 0.03, 6, 5), C.neckGold, [s * 0.112, 0.86, 0.035], head);
  }

  // eyes
  for (const s of [1, -1]) {
    const d: V = [s * 0.6, 0.3, 0.74];
    const ep = add(HC, d, HR * 0.97);
    part(ell(0.019, 0.019, 0.012, 8, 6).rotateY(s * 0.68), C.eye, ep, head);
    part(ell(0.006, 0.006, 0.004, 5, 4), C.shine, add(ep, [s * 0.35, 0.55, 0.75], 0.013), head);
    // tiny lid line above
    part(ell(0.022, 0.005, 0.01, 6, 4).rotateY(s * 0.68).rotateZ(-s * 0.15), C.trim, add(ep, [0, 1, 0.1], 0.02), head);
  }

  // beak: upper on head, lower on jaw
  {
    const up = new THREE.ConeGeometry(0.026, 0.12, 6).rotateX(Math.PI / 2).scale(0.85, 0.55, 1).rotateX(0.14);
    part(up, C.beak, [0, 0.913, 0.2], head);
    const lo = new THREE.ConeGeometry(0.022, 0.1, 6).rotateX(Math.PI / 2).scale(0.85, 0.5, 1).rotateX(0.1);
    part(lo, C.jawOrange, [0, 0.894, 0.193], jaw);
    // orange mandible stripes on the upper beak sides
    for (const s of [1, -1]) {
      part(ell(0.004, 0.006, 0.03, 5, 4).rotateY(-s * 0.18), C.jawOrange, [s * 0.016, 0.903, 0.18], jaw);
    }
  }

  // ---------- flippers ----------
  const deg = Math.PI / 180;
  for (const [s, sfx] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const sh: V = [s * 0.17, 0.66, 0];
    const d1: V = [s * Math.cos(-35 * deg), Math.sin(-35 * deg), 0];
    const el = add(sh, d1, 0.15);
    const d2: V = [s * Math.cos(-48 * deg), Math.sin(-48 * deg), 0];
    const tp = add(el, d2, 0.16);
    const shoulder = J("shoulder" + sfx, sh, chest, "arm");
    const elbow = J("elbow" + sfx, el, shoulder, "arm");
    J("flipperTip" + sfx, tp, elbow, "arm");

    const seg = (a: V, d: V, L: number, w: number, bone: any) => {
      const ang = Math.atan2(d[1], d[0]);
      const mid = add(a, d, L / 2);
      part(ell((L / 2) * 1.12, 0.02, w, 10, 6).rotateZ(ang), C.back, mid, bone);
      // pale underside
      let n: V = [-d[1], d[0], 0];
      if (n[1] > 0) n = [d[1], -d[0], 0];
      part(ell((L / 2) * 1.0, 0.012, w * 0.82, 10, 5).rotateZ(ang), C.flipUnder, add(mid, n, 0.011), bone);
      // trailing edge trim
      part(ell((L / 2) * 0.95, 0.008, 0.008, 8, 4).rotateZ(ang), C.trim, add(mid, [0, 0, -1], w * 0.9), bone);
    };
    seg(sh, d1, 0.15, 0.07, shoulder);
    seg(el, d2, 0.16, 0.052, elbow);
  }

  // ---------- legs & feet ----------
  for (const [s, sfx] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const hip = J("hip" + sfx, [s * 0.09, 0.2, 0.02], hips, "leg");
    const knee = J("knee" + sfx, [s * 0.1, 0.11, 0.04], hip, "leg");
    const ankle = J("ankle" + sfx, [s * 0.1, 0.035, 0.06], knee, "leg");
    part(new THREE.CapsuleGeometry(0.034, 0.06, 2, 7).rotateX(0.25), C.feet, [s * 0.1, 0.075, 0.05], knee);

    const base: V = [s * 0.1, 0.012, 0.07];
    part(ell(0.05, 0.012, 0.045, 8, 5), C.feet, add(base, [0, 0, 1], 0.03), ankle);
    [-0.45, 0, 0.45].forEach((t, i) => {
      const a = t + s * 0.15;
      const dir: V = [Math.sin(a), 0, Math.cos(a)];
      const toe = J(`toe${sfx}${i + 1}`, [base[0], 0.01, base[2]], ankle, "digit");
      const len = i === 1 ? 0.075 : 0.062;
      const tg = new THREE.CapsuleGeometry(0.014, len, 2, 6).rotateX(Math.PI / 2).scale(1, 0.62, 1).rotateY(a);
      const tc = add(base, dir, 0.012 + len / 2);
      part(tg, C.feet, [tc[0], 0.0095, tc[2]], toe);
      const cg = new THREE.ConeGeometry(0.0075, 0.022, 5).rotateX(Math.PI / 2).rotateY(a);
      const cp = add(base, dir, 0.03 + len);
      part(cg, C.claw, [cp[0], 0.008, cp[2]], toe);
    });
  }

  // ---------- tail ----------
  {
    const ang = Math.atan2(-0.89, -0.45);
    const g = new THREE.ConeGeometry(0.06, 0.13, 6).scale(1.6, 1, 0.45).rotateX(ang);
    part(g, C.back, [0, 0.1, -0.24], tail1);
    const g2 = new THREE.ConeGeometry(0.035, 0.08, 5).scale(1.6, 1, 0.45).rotateX(ang);
    part(g2, C.trim, [0, 0.07, -0.3], tail1);
  }

  return b.root;
}
