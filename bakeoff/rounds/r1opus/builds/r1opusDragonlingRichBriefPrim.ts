import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Hatchling Dragon",
  description:
    "A house-cat sized baby dragon sitting proudly beside its broken speckled egg: teal scales fading to a buttery belly, stubby horns, soft orange back spines, oversized amber-skinned wings, a chubby spade tail, big amber eyes, a toothy grin and a curl of smoke from one nostril.",
};

type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const vlen = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a: V3): V3 => {
  const l = vlen(a) || 1;
  return mul(a, 1 / l);
};
const lrp = (a: V3, b: V3, t: number): V3 => add(a, mul(sub(b, a), t));

const COL = {
  teal: "#2fb3a6",
  tealDark: "#1d7f86",
  tealDeep: "#155e66",
  mint: "#9ad9a6",
  butter: "#ffe49a",
  butterBand: "#f2c464",
  spine: "#ff8a3d",
  spineLight: "#ffb15e",
  horn: "#f5e8c8",
  hornDark: "#d6bf8e",
  eye: "#ffb21e",
  pupil: "#24140a",
  white: "#ffffff",
  tooth: "#fffaf0",
  mouth: "#7a2635",
  tongue: "#ff7f8e",
  blush: "#ff9a8b",
  claw: "#f6efe0",
  memOuter: "#ffa733",
  memInner: "#ffc766",
  nostril: "#123c42",
  smoke1: "#aaa4b5",
  smoke2: "#cfcbd8",
  smoke3: "#eeedf3",
  ember: "#ff6a2a",
  shell: "#f5ead2",
  shellIn: "#fff7e8",
  speck1: "#7b5e4a",
  speck2: "#5aa6a0",
  speck3: "#b98b62",
};

export default function build() {
  const bd: any = createBuilder({ name: "babyDragon" });

  // ---- deterministic random adapter ----
  const R: any = rng(1337);
  const rnd = (): number => {
    if (typeof R === "function") return R();
    if (R && typeof R.next === "function") {
      const v = R.next();
      return typeof v === "number" ? v : v.value;
    }
    if (R && typeof R.float === "function") return R.float();
    if (R && typeof R.random === "function") return R.random();
    return 0.5;
  };
  const rr = (a: number, b: number) => a + (b - a) * rnd();

  // ---- wrappers ----
  function J(name: string, at: V3, parent?: any, role?: string): any {
    const o: any = { at };
    if (parent) o.parent = parent;
    if (role) {
      try {
        return bd.joint(name, { ...o, role });
      } catch (e) {
        /* fall through */
      }
    }
    return bd.joint(name, o);
  }
  function part(geo: THREE.BufferGeometry, color: string, opts: any): any {
    try {
      return bd.part(geo, color, opts);
    } catch (e) {
      return bd.part({ geometry: geo, color, ...opts });
    }
  }
  function ball(c: V3, s: number | V3, color: string, bone: any, dir?: V3, ws = 12, hs = 9) {
    const g = new THREE.SphereGeometry(1, ws, hs);
    const S: V3 = typeof s === "number" ? [s, s, s] : s;
    g.scale(S[0], S[1], S[2]);
    const o: any = { at: c, bone };
    if (dir) o.dir = nrm(dir);
    return part(g, color, o);
  }
  function seg(a: V3, b: V3, r0: number, r1: number, color: string, bone: any, rs = 8) {
    const L = vlen(sub(b, a));
    const g = new THREE.CylinderGeometry(r1, r0, L, rs, 1);
    return part(g, color, { at: lrp(a, b, 0.5), dir: nrm(sub(b, a)), bone });
  }
  function cone(base: V3, d: V3, len: number, r: number, color: string, bone: any, rs = 6, flat = 1) {
    const g = new THREE.ConeGeometry(r, len, rs);
    if (flat !== 1) g.scale(flat, 1, 1);
    const dn = nrm(d);
    return part(g, color, { at: add(base, mul(dn, len / 2)), dir: dn, bone });
  }
  function ring(c: V3, axis: V3, radius: number, tube: number, color: string, bone: any) {
    const g = new THREE.TorusGeometry(radius, tube, 5, 14);
    g.rotateX(Math.PI / 2);
    return part(g, color, { at: c, dir: nrm(axis), bone });
  }
  function ell(C: V3, S: V3, u: V3) {
    const n = nrm(u);
    const t = 1 / Math.hypot(n[0] / S[0], n[1] / S[1], n[2] / S[2]);
    const p = add(C, mul(n, t));
    const nn = nrm([(p[0] - C[0]) / (S[0] * S[0]), (p[1] - C[1]) / (S[1] * S[1]), (p[2] - C[2]) / (S[2] * S[2])]);
    return { p, n: nn };
  }
  function softSpine(base: V3, d: V3, len: number, bone: any) {
    cone(base, d, len, len * 0.42, COL.spine, bone, 5, 0.55);
    // light tip bead keeps the spines soft and rubbery
    ball(add(base, mul(nrm(d), len * 0.92)), len * 0.09, COL.spineLight, bone, undefined, 6, 4);
  }
  function fanGeo(center: V3, rim: V3[], closed: boolean): THREE.BufferGeometry {
    const pos: number[] = [];
    const n = closed ? rim.length : rim.length - 1;
    for (let i = 0; i < n; i++) {
      const a = rim[i];
      const b = rim[(i + 1) % rim.length];
      pos.push(...center, ...a, ...b);
      pos.push(...center, ...b, ...a);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }

  // ================= SKELETON =================
  const hips = J("hips", [0, 0.12, 0], undefined, "spine");
  const spine = J("spine", [0, 0.2, 0.02], hips, "spine");
  const chest = J("chest", [0, 0.26, 0.04], spine, "spine");
  const neck = J("neck", [0, 0.31, 0.05], chest, "neck");
  const head = J("head", [0, 0.36, 0.07], neck, "head");
  const jaw = J("jaw", [0, 0.338, 0.09], head, "jaw");

  const T: V3[] = [
    [0, 0.075, -0.06],
    [-0.01, 0.052, -0.14],
    [-0.06, 0.04, -0.2],
    [-0.13, 0.03, -0.215],
    [-0.19, 0.022, -0.175],
    [-0.22, 0.016, -0.11],
  ];
  const TR = [0.058, 0.048, 0.04, 0.032, 0.024, 0.017];
  const tj: any[] = [];
  const tailNames = ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"];
  for (let i = 0; i < T.length; i++) tj.push(J(tailNames[i], T[i], i === 0 ? hips : tj[i - 1], "tail"));

  // ================= TORSO =================
  ball([0, 0.17, 0.02], [0.085, 0.11, 0.08], COL.teal, hips);
  ball([0, 0.168, 0.04], [0.072, 0.103, 0.063], COL.mint, hips);
  ball([0, 0.165, 0.045], [0.062, 0.095, 0.06], COL.butter, hips);
  for (let k = 0; k < 6; k++) {
    const y = 0.098 + k * 0.026;
    const oy = (y - 0.165) / 0.095;
    const f = Math.sqrt(Math.max(0, 1 - oy * oy));
    const z = 0.045 + 0.06 * f;
    const w = 2 * 0.062 * f * 0.82;
    part(new THREE.BoxGeometry(w, 0.005, 0.006), COL.butterBand, { at: [0, y, z - 0.001], bone: k < 4 ? hips : spine });
  }
  ball([0, 0.255, 0.035], [0.068, 0.07, 0.065], COL.teal, chest);
  ball([0, 0.262, 0.056], [0.044, 0.058, 0.05], COL.butter, chest);
  ball([0, 0.31, 0.048], 0.046, COL.teal, neck);
  ball([0, 0.305, 0.075], [0.03, 0.035, 0.025], COL.butter, neck);

  // scale bumps on back and shoulders
  for (let i = 0; i < 16; i++) {
    const a = rr(-1.1, 1.1);
    const e = rr(-0.5, 0.7);
    const u: V3 = [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)];
    const h = ell([0, 0.17, 0.02], [0.085, 0.11, 0.08], u);
    ball(h.p, [0.011, 0.004, 0.009], COL.tealDark, hips, h.n, 6, 4);
  }

  // ================= HEAD =================
  const Ch: V3 = [0, 0.385, 0.07];
  const Sh: V3 = [0.078, 0.068, 0.072];
  ball(Ch, Sh, COL.teal, head, undefined, 14, 10);
  const Cs: V3 = [0, 0.368, 0.135];
  const Ss: V3 = [0.052, 0.03, 0.05];
  ball(Cs, Ss, COL.teal, head);
  // snout ridge scales
  for (let i = 0; i < 3; i++) {
    const h = ell(Cs, Ss, [0, 1, 0.15 + i * 0.35]);
    ball(h.p, [0.012 - i * 0.002, 0.004, 0.009], COL.tealDark, head, h.n, 6, 4);
  }
  // mouth
  ball([0, 0.336, 0.122], [0.044, 0.016, 0.043], COL.mouth, head);
  ball([0, 0.31, 0.118], [0.046, 0.016, 0.048], COL.teal, jaw);
  ball([0, 0.304, 0.122], [0.036, 0.011, 0.04], COL.butter, jaw);
  ball([0, 0.326, 0.13], [0.022, 0.006, 0.022], COL.tongue, jaw, undefined, 8, 6);
  // upper teeth
  for (let i = 0; i < 7; i++) {
    const phi = ((-75 + i * 25) * Math.PI) / 180;
    const big = Math.abs(i - 3) === 2;
    const p: V3 = [0.024 * Math.sin(phi), 0.343, 0.135 + 0.023 * Math.cos(phi)];
    cone(p, [0, -1, 0.1], big ? 0.014 : 0.009, big ? 0.0045 : 0.0035, COL.tooth, head, 5);
  }
  // lower teeth
  for (let i = 0; i < 5; i++) {
    const phi = ((-60 + i * 30) * Math.PI) / 180;
    const p: V3 = [0.022 * Math.sin(phi), 0.323, 0.118 + 0.026 * Math.cos(phi)];
    cone(p, [0, 1, 0.1], 0.008, 0.0032, COL.tooth, jaw, 5);
  }
  // mouth corners
  for (const s of [1, -1]) ball([s * 0.044, 0.334, 0.118], 0.005, COL.tealDeep, head, undefined, 6, 4);

  // crown scales
  for (const [a, e] of [[-0.35, 0.75], [0.35, 0.75], [0, 0.95], [-0.2, 0.55], [0.2, 0.55]] as [number, number][]) {
    const h = ell(Ch, Sh, [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)]);
    ball(h.p, [0.012, 0.004, 0.01], COL.tealDark, head, h.n, 6, 4);
  }

  for (const s of [1, -1]) {
    // eyes
    const e = ell(Ch, Sh, [s * 0.6, 0.22, 0.77]);
    const ec = sub(e.p, mul(e.n, 0.012));
    ball(ec, 0.03, COL.eye, head, undefined, 14, 10);
    ring(add(ec, mul(e.n, 0.012)), e.n, 0.028, 0.0045, COL.tealDeep, head);
    ball(add(ec, mul(e.n, 0.027)), [0.0075, 0.006, 0.017], COL.pupil, head, e.n, 10, 6);
    ball(add(ec, mul(nrm(add(e.n, [-0.25 * s, 0.55, 0.1])), 0.029)), 0.0065, COL.white, head, undefined, 8, 6);
    ball(add(ec, mul(nrm(add(e.n, [0.3 * s, -0.35, 0])), 0.03)), 0.0035, COL.white, head, undefined, 6, 4);
    ball(add(ec, [0, 0.027, -0.004]), [0.027, 0.009, 0.018], COL.tealDark, head);

    // nostrils
    const n = ell(Cs, Ss, [s * 0.3, 0.6, 0.74]);
    ball(sub(n.p, mul(n.n, 0.002)), 0.0055, COL.nostril, head, undefined, 6, 4);
    if (s === 1) {
      // smoke wisp curling from the left nostril
      ball(add(n.p, mul(n.n, 0.003)), 0.004, COL.ember, head, undefined, 6, 4);
      const N = add(n.p, mul(n.n, 0.006));
      const puffs = 11;
      for (let i = 0; i < puffs; i++) {
        const t = i / (puffs - 1);
        const p = add(N, [0.03 * t + 0.022 * Math.sin(t * 6.5), 0.17 * t + 0.008, 0.035 * t + 0.02 * Math.sin(t * 6.5 + 1.6)]);
        const col = t < 0.3 ? COL.smoke1 : t < 0.65 ? COL.smoke2 : COL.smoke3;
        ball(p, 0.005 + 0.012 * t, col, head, undefined, 7, 5);
      }
    }

    // blush
    const ck = ell(Ch, Sh, [s * 0.72, -0.35, 0.6]);
    ball(ck.p, [0.018, 0.004, 0.013], COL.blush, head, ck.n, 8, 4);

    // stubby horns
    const hb = ell(Ch, Sh, [s * 0.45, 0.85, -0.25]);
    const hd = nrm(add(hb.n, [0, -0.1, -0.7]));
    seg(sub(hb.p, mul(hd, 0.006)), add(hb.p, mul(hd, 0.008)), 0.019, 0.017, COL.hornDark, head, 7);
    cone(hb.p, hd, 0.046, 0.016, COL.horn, head, 7);
    ring(add(hb.p, mul(hd, 0.018)), hd, 0.0105, 0.0028, COL.hornDark, head);

    // ear frills
    const ef = ell(Ch, Sh, [s, 0.15, -0.35]);
    const fd: V3 = [s, 0.45, -0.7];
    cone(sub(ef.p, mul(ef.n, 0.01)), fd, 0.052, 0.02, COL.tealDark, head, 5, 0.4);
    cone(sub(ef.p, mul(ef.n, 0.004)), add(fd, [0, 0.25, 0]), 0.034, 0.008, COL.spine, head, 5, 0.5);
  }

  // ================= BACK SPINES =================
  const spineRow: [V3, V3, number, number, any][] = [
    [Ch, Sh, 15, 0.02, head],
    [Ch, Sh, 50, 0.026, head],
    [Ch, Sh, 85, 0.028, head],
    [[0, 0.31, 0.048], [0.046, 0.046, 0.046], 95, 0.03, neck],
    [[0, 0.255, 0.035], [0.068, 0.07, 0.065], 105, 0.032, chest],
    [[0, 0.17, 0.02], [0.085, 0.11, 0.08], 100, 0.034, spine],
    [[0, 0.17, 0.02], [0.085, 0.11, 0.08], 125, 0.031, hips],
    [[0, 0.17, 0.02], [0.085, 0.11, 0.08], 150, 0.027, hips],
  ];
  for (const [C, S, deg, L, bone] of spineRow) {
    const th = (deg * Math.PI) / 180;
    const h = ell(C, S, [0, Math.cos(th), -Math.sin(th)]);
    softSpine(sub(h.p, mul(h.n, 0.004)), h.n, L, bone);
  }

  // ================= TAIL =================
  for (let i = 0; i < T.length; i++) {
    ball(T[i], TR[i], COL.teal, tj[Math.min(i, 4)], undefined, 10, 8);
    if (i < T.length - 1) {
      seg(T[i], T[i + 1], TR[i], TR[i + 1], COL.teal, tj[i], 9);
      const tan = nrm(sub(T[i + 1], T[i]));
      const mid = lrp(T[i], T[i + 1], 0.5);
      const rm = (TR[i] + TR[i + 1]) / 2;
      ring(mid, tan, rm * 0.98, 0.0045, COL.tealDark, tj[i]);
      const up = nrm(sub([0, 1, 0], mul(tan, 0.5)));
      softSpine(add(mid, [0, rm * 0.85, 0]), up, 0.026 - i * 0.004, tj[i]);
    }
  }
  // spade
  {
    const tan = nrm(sub(T[5], T[4]));
    const mk = (k: number, depth: number) => {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.lineTo(0.012 * k, 0.012 * k);
      sh.lineTo(0.042 * k, 0.022 * k);
      sh.lineTo(0.034 * k, 0.045 * k);
      sh.lineTo(0, 0.085 * k);
      sh.lineTo(-0.034 * k, 0.045 * k);
      sh.lineTo(-0.042 * k, 0.022 * k);
      sh.lineTo(-0.012 * k, 0.012 * k);
      sh.lineTo(0, 0);
      const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1 });
      g.translate(0, 0, -depth / 2);
      return g;
    };
    const base = sub(T[5], mul(tan, 0.008));
    part(mk(1, 0.008), COL.spine, { at: base, dir: tan, bone: tj[4] });
    part(mk(0.55, 0.012), COL.spineLight, { at: add(base, mul(tan, 0.016)), dir: tan, bone: tj[4] });
  }

  // ================= LIMBS =================
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    // hind legs
    const hip = J("hip" + S, [s * 0.055, 0.1, -0.005], hips, "leg");
    const knee = J("knee" + S, [s * 0.085, 0.085, 0.075], hip, "leg");
    const ankle = J("ankle" + S, [s * 0.1, 0.03, 0.05], knee, "leg");
    J("toe" + S, [s * 0.1, 0.012, 0.13], ankle, "leg");
    const HC: V3 = [s * 0.075, 0.068, 0.025];
    const HS: V3 = [0.046, 0.062, 0.072];
    ball(HC, HS, COL.teal, hip);
    const kp = ell(HC, HS, [s * 0.3, 0.45, 0.85]);
    ball(kp.p, [0.02, 0.005, 0.016], COL.tealDark, hip, kp.n, 8, 4);
    const kp2 = ell(HC, HS, [s * 0.75, 0.3, 0.5]);
    ball(kp2.p, [0.014, 0.004, 0.011], COL.tealDark, hip, kp2.n, 6, 4);
    seg([s * 0.085, 0.085, 0.075], [s * 0.1, 0.03, 0.05], 0.024, 0.019, COL.teal, knee);
    ball([s * 0.1, 0.02, 0.1], [0.032, 0.02, 0.048], COL.teal, ankle);
    for (const k of [-1, 0, 1]) {
      const x = s * 0.1 + k * 0.018;
      ball([x, 0.013, 0.142], 0.013, COL.teal, ankle, undefined, 8, 6);
      cone([x, 0.01, 0.152], [k * 0.15, -0.25, 1], 0.014, 0.0045, COL.claw, ankle, 5);
    }

    // front legs
    const sh = J("shoulder" + S, [s * 0.05, 0.24, 0.07], chest, "arm");
    const el = J("elbow" + S, [s * 0.055, 0.15, 0.1], sh, "arm");
    const wr = J("wrist" + S, [s * 0.04, 0.035, 0.135], el, "arm");
    J("hand" + S, [s * 0.04, 0.012, 0.17], wr, "arm");
    ball([s * 0.05, 0.24, 0.07], 0.027, COL.teal, sh);
    seg([s * 0.05, 0.24, 0.07], [s * 0.055, 0.15, 0.1], 0.021, 0.017, COL.teal, sh);
    ball([s * 0.055, 0.15, 0.1], 0.018, COL.teal, el, undefined, 8, 6);
    ball([s * 0.058, 0.15, 0.115], [0.012, 0.012, 0.004], COL.tealDark, el, undefined, 6, 4);
    seg([s * 0.055, 0.15, 0.1], [s * 0.04, 0.035, 0.135], 0.017, 0.014, COL.teal, el);
    ball([s * 0.04, 0.016, 0.152], [0.022, 0.016, 0.03], COL.teal, wr);
    for (const k of [-1, 0, 1]) {
      const x = s * 0.04 + k * 0.012;
      ball([x, 0.01, 0.175], 0.009, COL.teal, wr, undefined, 8, 6);
      cone([x, 0.008, 0.182], [k * 0.15, -0.3, 1], 0.012, 0.0035, COL.claw, wr, 5);
    }

    // ================= WINGS =================
    const W: Record<string, V3> = {
      root: [0.045, 0.28, -0.03],
      elbow: [0.13, 0.35, -0.07],
      wrist: [0.24, 0.4, -0.065],
      f1: [0.4, 0.46, -0.1],
      f2: [0.43, 0.33, -0.12],
      f3: [0.35, 0.2, -0.12],
      end: [0.07, 0.16, -0.055],
      thumb: [0.255, 0.435, -0.035],
    };
    const w = (k: string): V3 => [s * W[k][0], W[k][1], W[k][2]];
    const wRoot = J("wing" + S, w("root"), chest, "wing");
    const wElb = J("wingElbow" + S, w("elbow"), wRoot, "wing");
    const wWr = J("wingWrist" + S, w("wrist"), wElb, "wing");
    const fingers = ["f1", "f2", "f3"];
    const fJ: any[] = [];
    fingers.forEach((f, i) => {
      const fb = J("wingFinger" + (i + 1) + S, lrp(w("wrist"), w(f), 0.1), wWr, "digit");
      J("wingFinger" + (i + 1) + "Tip" + S, w(f), fb, "digit");
      fJ.push(fb);
    });

    ball(w("root"), 0.022, COL.teal, wRoot, undefined, 8, 6);
    seg(w("root"), w("elbow"), 0.016, 0.012, COL.teal, wRoot);
    ball(w("elbow"), 0.014, COL.teal, wElb, undefined, 8, 6);
    seg(w("elbow"), w("wrist"), 0.012, 0.009, COL.teal, wElb);
    ball(w("wrist"), 0.013, COL.tealDark, wWr, undefined, 8, 6);
    fingers.forEach((f, i) => {
      seg(w("wrist"), w(f), 0.0075, 0.0035, COL.tealDark, fJ[i], 6);
      cone(w(f), sub(w(f), w("wrist")), 0.01, 0.003, COL.claw, fJ[i], 5);
    });
    seg(w("wrist"), w("thumb"), 0.007, 0.0045, COL.tealDark, wWr, 6);
    cone(w("thumb"), sub(w("thumb"), w("wrist")), 0.014, 0.0045, COL.claw, wWr, 5);

    // outer membrane fan with scalloped trailing edge
    const scallop = (a: V3, b: V3, toward: V3, amt: number, n = 5): V3[] => {
      const out: V3[] = [];
      for (let i = 1; i < n; i++) {
        const t = i / n;
        out.push(lrp(lrp(a, b, t), toward, amt * Math.sin(Math.PI * t)));
      }
      return out;
    };
    const wr0 = w("wrist");
    const outerRim: V3[] = [w("f1"), ...scallop(w("f1"), w("f2"), wr0, 0.22), w("f2"), ...scallop(w("f2"), w("f3"), wr0, 0.22), w("f3")];
    part(fanGeo(wr0, outerRim, false), COL.memOuter, { at: [0, 0, 0], bone: wWr });

    const poly: V3[] = [w("wrist"), w("f3"), w("end"), w("root"), w("elbow")];
    const cen = mul(poly.reduce((acc, p) => add(acc, p), [0, 0, 0] as V3), 1 / poly.length);
    const innerRim: V3[] = [w("wrist"), w("f3"), ...scallop(w("f3"), w("end"), cen, 0.18, 6), w("end"), w("root"), w("elbow")];
    part(fanGeo(cen, innerRim, true), COL.memInner, { at: [0, 0, 0], bone: wElb });
  }

  // ================= EGG =================
  const EX = -0.25;
  const EZ = 0.08;
  const er = 0.085;
  const esy = 1.3;
  const WS = 14;
  const jag: number[] = [];
  for (let i = 0; i < WS; i++) jag.push((i % 2 === 0 ? -1 : 1) * rr(0.08, 0.2));
  const capJag: number[] = [];
  for (let i = 0; i < WS; i++) capJag.push((i % 2 === 0 ? -1 : 1) * rr(0.06, 0.15));

  function shellGeo(r: number, t0: number, t1: number, rimAtStart: boolean, jg: number[], inner: boolean) {
    const hs = 6;
    const g = new THREE.SphereGeometry(r, WS, hs, 0, Math.PI * 2, t0, t1 - t0);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const row = rimAtStart ? 0 : hs;
    for (let ix = 0; ix <= WS; ix++) {
      const i = row * (WS + 1) + ix;
      const phi = (ix / WS) * Math.PI * 2;
      const th = (rimAtStart ? t0 : t1) + jg[ix % WS];
      pos.setXYZ(i, -r * Math.cos(phi) * Math.sin(th), r * Math.cos(th), r * Math.sin(phi) * Math.sin(th));
    }
    g.scale(1, esy, 1);
    if (inner && g.index) {
      const idx = g.index;
      for (let k = 0; k < idx.count; k += 3) {
        const a = idx.getX(k + 1);
        idx.setX(k + 1, idx.getX(k + 2));
        idx.setX(k + 2, a);
      }
    }
    g.computeVertexNormals();
    return g;
  }
  const eggC: V3 = [EX, er * esy - 0.002, EZ];
  part(shellGeo(er, 0.42 * Math.PI, Math.PI, true, jag, false), COL.shell, { at: eggC, bone: hips });
  part(shellGeo(er * 0.93, 0.42 * Math.PI, Math.PI, true, jag, true), COL.shellIn, { at: eggC, bone: hips });
  const speckCols = [COL.speck1, COL.speck2, COL.speck3];
  for (let i = 0; i < 26; i++) {
    const th = rr(0.52, 0.93) * Math.PI;
    const ph = rr(0, Math.PI * 2);
    const p: V3 = [-er * Math.cos(ph) * Math.sin(th), er * Math.cos(th) * esy, er * Math.sin(ph) * Math.sin(th)];
    const n = nrm([p[0] / (er * er), p[1] / (er * esy * er * esy), p[2] / (er * er)]);
    const sz = rr(0.004, 0.009);
    ball(add(add(eggC, p), mul(n, 0.0008)), [sz, sz * 0.3, sz * 1.2], speckCols[i % 3], hips, n, 6, 4);
  }

  // broken cap, flipped like a little bowl
  {
    const capPos: V3 = [-0.33, 0, 0.21];
    const m = new THREE.Matrix4().makeRotationZ(0.5).multiply(new THREE.Matrix4().makeRotationX(Math.PI));
    const prep = (g: THREE.BufferGeometry) => {
      g.applyMatrix4(m);
      return g;
    };
    const gOut = prep(shellGeo(er, 0, 0.32 * Math.PI, false, capJag, false));
    gOut.computeBoundingBox();
    const lift = -gOut.boundingBox!.min.y - 0.0015;
    gOut.translate(0, lift, 0);
    const gIn = prep(shellGeo(er * 0.93, 0, 0.32 * Math.PI, false, capJag, true));
    gIn.translate(0, lift, 0);
    part(gOut, COL.shell, { at: capPos, bone: hips });
    part(gIn, COL.shellIn, { at: capPos, bone: hips });
    for (let i = 0; i < 9; i++) {
      const th = rr(0.04, 0.28) * Math.PI;
      const ph = rr(0, Math.PI * 2);
      const pl = new THREE.Vector3(-er * Math.cos(ph) * Math.sin(th), er * Math.cos(th) * esy, er * Math.sin(ph) * Math.sin(th));
      const nl = new THREE.Vector3(pl.x / (er * er), pl.y / (er * esy * er * esy), pl.z / (er * er)).normalize();
      pl.applyMatrix4(m);
      nl.applyMatrix4(m).normalize();
      const n: V3 = [nl.x, nl.y, nl.z];
      const p: V3 = add(capPos, [pl.x, pl.y + lift, pl.z]);
      const sz = rr(0.004, 0.008);
      ball(add(p, mul(n, 0.0008)), [sz, sz * 0.3, sz * 1.2], speckCols[(i + 1) % 3], hips, n, 6, 4);
    }
  }
  // scattered shell chips
  const chips: V3[] = [
    [-0.15, 0.002, 0.2],
    [-0.36, 0.002, 0.06],
    [-0.27, 0.002, 0.25],
    [-0.13, 0.002, 0.1],
    [-0.38, 0.002, 0.15],
    [-0.2, 0.002, 0.3],
  ];
  chips.forEach((c, i) => {
    const sz = rr(0.012, 0.02);
    const g = new THREE.CylinderGeometry(sz, sz, 0.004, 3);
    part(g, i % 2 ? COL.shellIn : COL.shell, { at: c, dir: nrm([rr(-0.25, 0.25), 1, rr(-0.25, 0.25)]), bone: hips });
    if (i % 2 === 0) ball(add(c, [0, 0.002, 0]), [0.004, 0.0015, 0.005], COL.speck1, hips, undefined, 6, 4);
  });

  return bd.root;
}
