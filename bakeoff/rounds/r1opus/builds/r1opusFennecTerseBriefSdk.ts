import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

type V = [number, number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a: V): V => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lrp = (a: V, b: V, t: number): V => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const meta = {
  name: "Fennec Fox",
  description:
    "A stylized low-poly fennec fox puppet: oversized pink-lined ears, sandy two-tone coat, bushy black-tipped tail, rigged in a neutral rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "fennec" });

  // deterministic randomness
  const rr: any = rng(11);
  const rand = (): number =>
    typeof rr === "function"
      ? rr()
      : typeof rr.next === "function"
      ? rr.next()
      : typeof rr.float === "function"
      ? rr.float()
      : rr.random();

  // palette
  const SAND = "#e3b47a";
  const DEEP = "#c48a52";
  const TAN = "#9c6a3e";
  const CREAM = "#f4e2c2";
  const WHITE = "#fff8ec";
  const PINK = "#eda39a";
  const DARK = "#2a1d16";
  const RUST = "#6e4228";
  const EYE = "#140d0a";
  const NOSE = "#120c09";

  // ---------- skeleton ----------
  const J = (name: string, at: V, parent?: any, role?: string) =>
    (b.joint as any)(name, parent ? { at, parent, role } : { at, role });

  const hips = J("hips", [0, 0.2, -0.1], undefined, "spine");
  const spine = J("spine", [0, 0.205, -0.01], hips, "spine");
  const chest = J("chest", [0, 0.21, 0.075], spine, "spine");
  const neck = J("neck", [0, 0.235, 0.115], chest, "neck");
  const head = J("head", [0, 0.285, 0.15], neck, "head");
  const jaw = J("jaw", [0, 0.266, 0.178], head, "jaw");

  const tailPts: V[] = [
    [0, 0.21, -0.16],
    [0, 0.205, -0.22],
    [0, 0.196, -0.28],
    [0, 0.186, -0.34],
    [0, 0.176, -0.405],
  ];
  const tails: any[] = [];
  tailPts.forEach((p, i) => {
    tails.push(J(i === 4 ? "tailEnd" : `tail${i + 1}`, p, i === 0 ? hips : tails[i - 1], "tail"));
  });

  // ---------- geometry helpers (all built along +Y, base at origin) ----------
  const put = (geo: THREE.BufferGeometry, color: string, base: V, dir: V, bone?: any) => {
    const f = frame(base, nrm(dir));
    return bone ? (b.stick as any)(geo, color, f, { bone }) : b.stick(geo, color, f);
  };
  const cyl = (r0: number, r1: number, h: number, s = 7) =>
    new THREE.CylinderGeometry(r1, r0, h, s, 1).translate(0, h / 2, 0);
  const ell = (rxz: number, ry: number, ws = 8, hs = 6) =>
    new THREE.SphereGeometry(1, ws, hs).scale(rxz, ry, rxz).translate(0, ry, 0);

  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone?: any, s = 7) =>
    put(cyl(r0, r1, len(sub(c, a)), s), color, a, sub(c, a), bone);
  const blob = (c: V, rxz: number, ry: number, dir: V, color: string, bone?: any, ws = 8, hs = 6) => {
    const d = nrm(dir);
    return put(ell(rxz, ry, ws, hs), color, sub(c, scl(d, ry)), d, bone);
  };
  const cone = (base: V, dir: V, l: number, r: number, color: string, bone?: any, s = 5) =>
    put(cyl(r, 0, l, s), color, base, dir, bone);
  const ball = (c: V, r: number, color: string, bone?: any, ws = 6, hs = 4) =>
    blob(c, r, r, [0, 1, 0], color, bone, ws, hs);

  // ---------- torso ----------
  blob([0, 0.2, -0.1], 0.062, 0.07, [0, 0, 1], SAND, hips, 9, 7);
  blob([0, 0.2, -0.01], 0.058, 0.08, [0, 0, 1], SAND, spine, 9, 7);
  blob([0, 0.205, 0.07], 0.06, 0.058, [0, 0, 1], SAND, chest, 9, 7);
  // darker saddle on the back
  blob([0, 0.218, -0.04], 0.048, 0.1, [0, 0, 1], DEEP, spine, 8, 6);
  // pale belly and chest bib
  blob([0, 0.172, -0.02], 0.042, 0.1, [0, 0, 1], CREAM, spine, 8, 6);
  blob([0, 0.188, 0.1], 0.042, 0.048, [0, -0.35, 1], WHITE, chest, 8, 6);
  // chest fluff
  for (let k = -2; k <= 2; k++) {
    cone([k * 0.012, 0.172, 0.112 - Math.abs(k) * 0.006], [k * 0.35, -1, 0.6], 0.03, 0.01, WHITE, chest);
  }
  // spine tufts
  for (let i = 0; i < 6; i++) {
    const z = -0.13 + i * 0.035;
    cone([0, 0.258 + Math.sin(i) * 0.002, z], [0, 1, -0.9], 0.018, 0.008, i % 2 ? DEEP : TAN, i < 2 ? hips : i < 4 ? spine : chest);
  }

  // ---------- neck & head ----------
  seg([0, 0.2, 0.085], [0, 0.285, 0.152], 0.045, 0.038, SAND, neck, 8);
  blob([0, 0.22, 0.118], 0.032, 0.035, [0, -0.6, 1], WHITE, neck, 7, 5);

  blob([0, 0.29, 0.155], 0.048, 0.045, [0, 0, 1], SAND, head, 9, 7);
  blob([0, 0.318, 0.155], 0.03, 0.022, [0, 0.4, 1], DEEP, head, 7, 5); // forehead cap
  // cheeks
  for (const s of [1, -1]) {
    ball([s * 0.03, 0.272, 0.172], 0.024, WHITE, head, 7, 5);
    cone([s * 0.045, 0.27, 0.163], [s, -0.5, -0.25], 0.026, 0.01, WHITE, head);
    cone([s * 0.04, 0.258, 0.158], [s, -1, -0.3], 0.022, 0.009, CREAM, head);
  }
  // muzzle
  seg([0, 0.28, 0.18], [0, 0.272, 0.25], 0.026, 0.009, CREAM, head, 7);
  seg([0, 0.298, 0.18], [0, 0.283, 0.243], 0.013, 0.006, DEEP, head, 5); // sandy bridge
  ball([0, 0.275, 0.252], 0.009, NOSE, head);
  ball([0.004, 0.279, 0.258], 0.002, "#5a4a44", head, 4, 3); // nose shine
  // lower jaw
  seg([0, 0.262, 0.18], [0, 0.259, 0.24], 0.018, 0.006, WHITE, jaw, 6);
  seg([0, 0.266, 0.2], [0, 0.265, 0.238], 0.004, 0.003, "#c9706a", jaw, 4); // lip line

  for (const s of [1, -1]) {
    // eyes
    const ec: V = [s * 0.026, 0.298, 0.188];
    const ed: V = nrm([s * 0.45, 0.05, 1]);
    blob(sub(ec, scl(ed, 0.002)), 0.0135, 0.008, ed, RUST, head, 7, 4);
    blob(ec, 0.011, 0.009, ed, EYE, head, 7, 5);
    ball(add(ec, add(scl(ed, 0.008), [s * 0.002, 0.004, 0])), 0.0026, WHITE, head, 4, 3);
    // tear stripe
    seg([s * 0.016, 0.292, 0.198], [s * 0.015, 0.279, 0.226], 0.0032, 0.0022, RUST, head, 4);
    // brow tuft
    cone([s * 0.026, 0.31, 0.188], [s * 0.4, 1, 0.3], 0.012, 0.004, WHITE, head, 4);
    // whiskers
    const wo: V = [s * 0.016, 0.272, 0.233];
    for (const d of [
      [s, 0.15, -0.2],
      [s, 0, -0.1],
      [s, -0.15, 0],
    ] as V[]) {
      put(cyl(0.0008, 0.0004, 0.05, 3), DARK, wo, d, head);
    }

    // ears
    const side = s > 0 ? "L" : "R";
    const eb: V = [s * 0.028, 0.315, 0.148];
    const et: V = [s * 0.085, 0.44, 0.125];
    const ear = J(`ear${side}`, eb, head, "head");
    J(`earTip${side}`, et, ear, "head");
    const ed2 = sub(et, eb);
    const L = len(ed2);
    put(cyl(0.032, 0.002, L, 5), SAND, eb, ed2, ear);
    put(cyl(0.02, 0, L * 0.82, 5), PINK, add(eb, [0, 0.004, 0.016]), ed2, ear);
    put(cyl(0.007, 0, L * 0.19, 5), TAN, lrp(eb, et, 0.81), ed2, ear);
    for (let k = 0; k < 3; k++) {
      const jit: V = [s * (k - 1) * 0.02, 0, 0.02];
      cone(add(eb, [s * (k - 1) * 0.006, 0.006, 0.026]), add(nrm(ed2), jit), 0.04, 0.006, WHITE, ear, 4);
    }
    cone(add(eb, [s * 0.02, -0.004, 0.012]), [s, 0.2, 0.3], 0.02, 0.008, WHITE, head, 4);

    // ---------- front leg ----------
    const sh: V = [s * 0.04, 0.19, 0.075];
    const el: V = [s * 0.045, 0.115, 0.07];
    const wr: V = [s * 0.045, 0.035, 0.08];
    const pc: V = [s * 0.045, 0.016, 0.092];
    const shoulder = J(`shoulder${side}`, sh, chest, "arm");
    const elbow = J(`elbow${side}`, el, shoulder, "arm");
    const wrist = J(`wrist${side}`, wr, elbow, "arm");
    J(`hand${side}`, add(pc, [0, -0.004, 0.02]), wrist, "arm");
    blob(lrp(sh, el, 0.35), 0.026, 0.035, sub(el, sh), SAND, shoulder, 7, 5);
    seg(sh, el, 0.02, 0.015, SAND, shoulder);
    seg(el, wr, 0.014, 0.011, CREAM, elbow);
    seg(wr, pc, 0.011, 0.012, CREAM, wrist, 6);
    blob(pc, 0.016, 0.024, [0, 0, 1], CREAM, wrist, 7, 5);
    for (const dx of [-0.009, -0.003, 0.003, 0.009]) {
      ball([pc[0] + dx, 0.009, pc[2] + 0.017], 0.0065, CREAM, wrist, 5, 4);
      cone([pc[0] + dx, 0.008, pc[2] + 0.022], [0, -0.3, 1], 0.007, 0.002, DARK, wrist, 4);
    }

    // ---------- hind leg ----------
    const hp: V = [s * 0.042, 0.18, -0.11];
    const kn: V = [s * 0.05, 0.12, -0.07];
    const an: V = [s * 0.05, 0.055, -0.125];
    const fc: V = [s * 0.05, 0.016, -0.095];
    const hip = J(`hip${side}`, hp, hips, "leg");
    const knee = J(`knee${side}`, kn, hip, "leg");
    const ankle = J(`ankle${side}`, an, knee, "leg");
    J(`foot${side}`, add(fc, [0, -0.004, 0.02]), ankle, "leg");
    blob(lrp(hp, kn, 0.4), 0.03, 0.046, sub(kn, hp), SAND, hip, 8, 6);
    seg(kn, an, 0.017, 0.011, SAND, knee);
    seg(an, fc, 0.011, 0.012, CREAM, ankle, 6);
    blob(fc, 0.016, 0.024, [0, 0, 1], CREAM, ankle, 7, 5);
    cone(add(an, [0, 0, -0.008]), [0, -0.4, -1], 0.014, 0.006, TAN, ankle, 4); // hock tuft
    for (const dx of [-0.009, -0.003, 0.003, 0.009]) {
      ball([fc[0] + dx, 0.009, fc[2] + 0.017], 0.0065, CREAM, ankle, 5, 4);
      cone([fc[0] + dx, 0.008, fc[2] + 0.022], [0, -0.3, 1], 0.007, 0.002, DARK, ankle, 4);
    }
  }

  // ---------- bushy tail ----------
  const tr = [0.032, 0.042, 0.044, 0.034];
  const tc = [SAND, SAND, DEEP, TAN];
  for (let i = 0; i < 4; i++) {
    const a = tailPts[i];
    const c = tailPts[i + 1];
    const mid = lrp(a, c, 0.5);
    const d = sub(c, a);
    blob(mid, tr[i], len(d) * 0.75, d, tc[i], tails[i], 8, 6);
    for (let k = 0; k < 8; k++) {
      const ang = rand() * Math.PI * 2;
      const n: V = [Math.cos(ang), Math.sin(ang), 0];
      const along = (rand() - 0.5) * 0.04;
      const base = add(add(mid, scl(n, tr[i] * 0.8)), [0, 0, -along]);
      const col = i === 3 ? (k % 2 ? DARK : TAN) : k % 3 === 0 ? CREAM : tc[i];
      cone(base, add(n, [0, 0, -0.9]), 0.025 + rand() * 0.015, 0.009, col, tails[i], 4);
    }
  }
  // black tip
  blob(lrp(tailPts[3], tailPts[4], 0.75), 0.028, 0.035, sub(tailPts[4], tailPts[3]), DARK, tails[3], 7, 5);
  cone(add(tailPts[4], [0, 0, 0.005]), [0, -0.15, -1], 0.035, 0.018, DARK, tails[3], 5);
  // dark tail gland spot
  blob([0, 0.241, -0.2], 0.012, 0.004, [0, 1, 0.3], DARK, tails[0], 6, 3);

  return b.root;
}
