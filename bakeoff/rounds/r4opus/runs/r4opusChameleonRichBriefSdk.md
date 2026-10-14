```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Panther Chameleon on a Twig",
  description:
    "A stylized panther chameleon walking along a twig on a mossy base. The body shifts from turquoise at the head through lime to sunset orange at the tail. It has a white lateral stripe, red bars, a serrated casque, turret eyes looking two ways, mitten feet gripping the twig and a tightly coiled banded tail. Rigged with named joints and a separate jaw.",
};

type P3 = [number, number, number];
type Ell = { c: P3; r: P3 };

const T = 0.15; // twig axis height
const TW = 0.011; // twig radius
const DEG = Math.PI / 180;

// ---------- palette ----------
const STOPS: [number, string][] = [
  [0.0, "#14c4d8"], // turquoise
  [0.16, "#22d0b0"], // teal
  [0.3, "#86dd38"], // lime
  [0.44, "#cde22a"], // yellow-lime
  [0.58, "#ffc11f"], // amber
  [0.76, "#ff861c"], // orange
  [1.0, "#ff4a32"], // sunset
];
function grad(s0: number, band = false): string {
  const s = Math.min(1, Math.max(0, Math.round(s0 * 16) / 16));
  let i = 0;
  while (i < STOPS.length - 2 && s > STOPS[i + 1][0]) i++;
  const [sa, ca] = STOPS[i];
  const [sb, cb] = STOPS[i + 1];
  const t = Math.min(1, Math.max(0, (s - sa) / (sb - sa)));
  const c = new THREE.Color(ca).lerp(new THREE.Color(cb), t);
  if (band) c.lerp(new THREE.Color("#b81c2c"), 0.38).multiplyScalar(0.72);
  return "#" + c.getHexString();
}
const sOfZ = (z: number) => Math.min(0.45, Math.max(0, ((0.165 - z) / 0.225) * 0.45));

const WHITE = "#fbfff4";
const RED = "#e3263a";
const ACCENT = "#ff8f3a";
const BLACK = "#10151a";
const GOLD = "#f2c230";
const CLAW = "#f3e3c3";
const SPECK_A = "#c6f6ff";
const SPECK_B = "#fff2a8";
const CREST = "#109fc4";
const DORSAL = "#eaff8a";

function makeRand(seed: number): () => number {
  const r: any = rng(seed);
  if (typeof r === "function") return () => r();
  if (r && typeof r.next === "function")
    return () => {
      const v = r.next();
      return typeof v === "number" ? v : v.value;
    };
  if (r && typeof r.float === "function") return () => r.float();
  if (r && typeof r.random === "function") return () => r.random();
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const v = (p: P3) => new THREE.Vector3(p[0], p[1], p[2]);

export default function build() {
  const b = createBuilder({ name: "pantherChameleon" });
  const rand = makeRand(7);

  const J = (name: string, at: P3, parent?: any, role?: string): any => {
    const j: any = parent ? b.joint(name, { at, parent } as any) : b.joint(name, { at } as any);
    if (role && j && j.userData) j.userData.role = role;
    return j;
  };

  // ---------- geometry helpers ----------
  type PatchOpts = { a0?: number; a1?: number; t0?: number; t1?: number; ws?: number; hs?: number; k?: number };
  // ellipsoid (or patch of it). theta: 0 at front (+Z) .. PI at back; alpha: around body axis from +X toward +Y
  const patch = (e: Ell, color: string, bone: any, o: PatchOpts = {}) => {
    const a0 = o.a0 ?? 0, a1 = o.a1 ?? Math.PI * 2;
    const t0 = o.t0 ?? 0, t1 = o.t1 ?? Math.PI;
    const k = o.k ?? 1;
    const g = new THREE.SphereGeometry(1, o.ws ?? 10, o.hs ?? 6, a0 - Math.PI, a1 - a0, t0, t1 - t0);
    g.rotateX(Math.PI / 2);
    g.scale(e.r[0] * k, e.r[1] * k, e.r[2] * k);
    return b.part(g, color, { at: e.c, bone });
  };
  const sideA = (a0: number, a1: number, s: number): [number, number] =>
    s > 0 ? [a0, a1] : [Math.PI - a1, Math.PI - a0];
  const ellPoint = (e: Ell, al: number, th: number, k = 1) =>
    new THREE.Vector3(
      e.c[0] + e.r[0] * k * Math.sin(th) * Math.cos(al),
      e.c[1] + e.r[1] * k * Math.sin(th) * Math.sin(al),
      e.c[2] + e.r[2] * k * Math.cos(th),
    );
  const ellNormal = (e: Ell, al: number, th: number) =>
    new THREE.Vector3(
      (Math.sin(th) * Math.cos(al)) / e.r[0],
      (Math.sin(th) * Math.sin(al)) / e.r[1],
      Math.cos(th) / e.r[2],
    ).normalize();
  const thetaAtZ = (e: Ell, z: number) => Math.acos(Math.min(1, Math.max(-1, (z - e.c[2]) / e.r[2])));

  const rod = (a: THREE.Vector3 | P3, c: THREE.Vector3 | P3, r: number, color: string, bone: any, radial = 6) => {
    const A = Array.isArray(a) ? v(a) : a.clone();
    const B = Array.isArray(c) ? v(c) : c.clone();
    const len = Math.max(1e-4, A.distanceTo(B));
    return b.part(new THREE.CapsuleGeometry(r, len, 2, radial), color, {
      at: A.clone().add(B).multiplyScalar(0.5),
      dir: B.clone().sub(A),
      bone,
    });
  };
  const ball = (at: THREE.Vector3 | P3, r: number, color: string, bone: any, detail = 0) =>
    b.part(new THREE.IcosahedronGeometry(r, detail), color, { at, bone });

  // ---------- skeleton ----------
  const hips = J("hips", [0, T + 0.056, -0.035], undefined, "spine");
  const spine1 = J("spine1", [0, T + 0.06, 0.005], hips, "spine");
  const chest = J("chest", [0, T + 0.06, 0.045], spine1, "spine");
  const neck = J("neck", [0, T + 0.063, 0.08], chest, "neck");
  const head = J("head", [0, T + 0.068, 0.098], neck, "head");
  J("headTip", [0, T + 0.062, 0.165], head, "head");
  const jaw = J("jaw", [0, T + 0.052, 0.099], head, "jaw");
  J("jawTip", [0, T + 0.047, 0.158], jaw, "jaw");

  // ---------- torso ----------
  const torso: Ell = { c: [0, T + 0.056, 0.01], r: [0.02, 0.034, 0.07] };
  const boneZ = (z: number) => (z > 0.042 ? chest : z > -0.012 ? spine1 : hips);
  const NB = 9;
  for (let i = 0; i < NB; i++) {
    const t0 = (i * Math.PI) / NB, t1 = ((i + 1) * Math.PI) / NB, tm = (t0 + t1) / 2;
    const z = torso.c[2] + torso.r[2] * Math.cos(tm);
    const bone = boneZ(z);
    patch(torso, grad(sOfZ(z)), bone, { t0, t1, ws: 10, hs: 2 });
    if (i >= 1 && i <= NB - 2) {
      for (const s of [1, -1]) {
        const [a0, a1] = sideA(-26 * DEG, -13 * DEG, s);
        patch(torso, WHITE, bone, { t0, t1, a0, a1, ws: 2, hs: 2, k: 1.035 });
      }
      patch(torso, WHITE, bone, { t0, t1, a0: 252 * DEG, a1: 288 * DEG, ws: 2, hs: 2, k: 1.02 });
    }
  }
  // red bars across the flanks
  for (const zc of [0.058, 0.034, 0.01, -0.014, -0.036]) {
    const t0 = thetaAtZ(torso, zc + 0.0055), t1 = thetaAtZ(torso, zc - 0.0055);
    for (const s of [1, -1]) {
      const [a0, a1] = sideA(-52 * DEG, 72 * DEG, s);
      patch(torso, RED, boneZ(zc), { t0, t1, a0, a1, ws: 6, hs: 2, k: 1.022 });
    }
  }
  // dorsal crest of tubercles
  for (let j = 0; j < 15; j++) {
    const th = (0.1 + (0.8 * j) / 14) * Math.PI;
    const p = ellPoint(torso, 90 * DEG, th, 0.98);
    const n = ellNormal(torso, 90 * DEG, th);
    const h = 0.0068 - 0.0035 * (j / 14);
    b.part(new THREE.ConeGeometry(0.0022, h, 4), DORSAL, {
      at: p.clone().addScaledVector(n, h * 0.4),
      dir: n,
      bone: boneZ(p.z),
    });
  }
  // speckles
  for (let i = 0; i < 46; i++) {
    const s = rand() < 0.5 ? 1 : -1;
    const upper = rand() < 0.62;
    const al0 = upper ? (12 + rand() * 66) * DEG : (-74 + rand() * 42) * DEG;
    const al = s > 0 ? al0 : Math.PI - al0;
    const th = (0.18 + rand() * 0.66) * Math.PI;
    const p = ellPoint(torso, al, th, 1.012);
    ball(p, 0.0013 + rand() * 0.001, rand() < 0.6 ? SPECK_A : SPECK_B, boneZ(p.z));
  }
  // hips and shoulders
  patch({ c: [0, T + 0.046, -0.038], r: [0.019, 0.019, 0.021] }, grad(sOfZ(-0.038)), hips, { ws: 9, hs: 5 });
  for (const s of [1, -1])
    patch({ c: [s * 0.012, T + 0.043, 0.055], r: [0.008, 0.009, 0.01] }, grad(sOfZ(0.055)), chest, { ws: 7, hs: 4 });

  // ---------- neck & head ----------
  patch({ c: [0, T + 0.063, 0.086], r: [0.0165, 0.025, 0.02] }, grad(sOfZ(0.086)), neck, { ws: 10, hs: 6 });
  const headE: Ell = { c: [0, T + 0.068, 0.114], r: [0.0175, 0.021, 0.029] };
  patch(headE, grad(sOfZ(0.13)), head, { t0: 0, t1: Math.PI / 2, ws: 10, hs: 4 });
  patch(headE, grad(sOfZ(0.1)), head, { t0: Math.PI / 2, t1: Math.PI, ws: 10, hs: 4 });
  const snout: Ell = { c: [0, T + 0.061, 0.141], r: [0.0118, 0.0112, 0.024] };
  patch(snout, grad(0), head, { ws: 9, hs: 5 });
  const jawE: Ell = { c: [0, T + 0.0485, 0.128], r: [0.0128, 0.0082, 0.031] };
  patch(jawE, grad(0.05), jaw, { ws: 9, hs: 4 });
  for (const s of [1, -1]) {
    // white lips: start of the lateral stripe
    const [l0, l1] = sideA(-15 * DEG, 40 * DEG, s);
    patch(jawE, WHITE, jaw, { a0: l0, a1: l1, t0: 0.12 * Math.PI, t1: 0.82 * Math.PI, ws: 3, hs: 5, k: 1.03 });
    // orange bars radiating from the eye
    const [h0, h1] = sideA(-38 * DEG, 28 * DEG, s);
    patch(headE, ACCENT, head, {
      a0: h0, a1: h1, t0: thetaAtZ(headE, 0.103), t1: thetaAtZ(headE, 0.097), ws: 4, hs: 1, k: 1.025,
    });
    patch(snout, ACCENT, head, {
      a0: h0, a1: h1, t0: thetaAtZ(snout, 0.155), t1: thetaAtZ(snout, 0.15), ws: 4, hs: 1, k: 1.03,
    });
    // nostril
    ball([s * 0.0062, T + 0.066, 0.158], 0.0013, BLACK, head);
    // canthal ridge over the eye toward the casque
    const A: P3 = [s * 0.004, T + 0.068, 0.158];
    const B: P3 = [s * 0.0092, T + 0.083, 0.128];
    const C: P3 = [s * 0.0035, T + 0.089, 0.094];
    rod(A, B, 0.0016, ACCENT, head, 5);
    rod(B, C, 0.0016, ACCENT, head, 5);
    for (let k = 1; k <= 3; k++) {
      const p = v(A).lerp(v(B), k / 4);
      b.part(new THREE.ConeGeometry(0.0012, 0.003, 4), DORSAL, { at: p.add(new THREE.Vector3(0, 0.0015, 0)), dir: [s * 0.4, 1, 0], bone: head });
    }
  }
  patch(jawE, WHITE, jaw, { a0: 240 * DEG, a1: 300 * DEG, t0: 0.15 * Math.PI, t1: 0.85 * Math.PI, ws: 2, hs: 4, k: 1.02 });
  // head speckles
  for (let i = 0; i < 10; i++) {
    const s = rand() < 0.5 ? 1 : -1;
    const al0 = (-10 + rand() * 60) * DEG;
    const th = (0.55 + rand() * 0.35) * Math.PI;
    ball(ellPoint(headE, s > 0 ? al0 : Math.PI - al0, th, 1.01), 0.0011, SPECK_A, head);
  }

  // casque: serrated crest
  const crestPts: [number, number][] = [
    [0.13, 0.077], [0.13, 0.086], [0.124, 0.0915], [0.12, 0.0895], [0.114, 0.096], [0.109, 0.094],
    [0.103, 0.1], [0.098, 0.0975], [0.092, 0.1035], [0.087, 0.101], [0.081, 0.105], [0.077, 0.099], [0.079, 0.08],
  ];
  const sh = new THREE.Shape();
  sh.moveTo(crestPts[0][0], crestPts[0][1]);
  for (let i = 1; i < crestPts.length; i++) sh.lineTo(crestPts[i][0], crestPts[i][1]);
  sh.closePath();
  const crestG = new THREE.ExtrudeGeometry(sh, { depth: 0.0036, bevelEnabled: false });
  crestG.rotateY(-Math.PI / 2);
  crestG.translate(0.0018, 0, 0);
  b.part(crestG, CREST, { at: [0, T, 0], bone: head });

  // ---------- turret eyes ----------
  const ER = 0.0105;
  const eye = (name: string, s: number, look: P3) => {
    const E = new THREE.Vector3(s * 0.0155, T + 0.073, 0.12);
    const ej = J(name, [E.x, E.y, E.z], head, "head");
    const L = v(look).normalize();
    ball(E, ER, grad(0.02), ej, 1);
    const ringAt = (d: number, rho: number, tube: number, color: string) => {
      const g = new THREE.TorusGeometry(rho, tube, 4, 12);
      g.rotateX(Math.PI / 2);
      b.part(g, color, { at: E.clone().addScaledVector(L, d), dir: L, bone: ej });
    };
    ringAt(0.0, ER * 1.01, 0.0012, ACCENT);
    ringAt(0.0038, Math.sqrt(ER * ER - 0.0038 * 0.0038) * 1.01, 0.0011, SPECK_B);
    ringAt(0.0068, Math.sqrt(ER * ER - 0.0068 * 0.0068) * 1.02, 0.0011, ACCENT);
    ringAt(0.0094, 0.0045, 0.001, GOLD);
    ball(E.clone().addScaledVector(L, 0.0094), 0.0031, BLACK, ej, 1);
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(L, -L.y).normalize();
    ball(E.clone().addScaledVector(L, 0.0122).addScaledVector(up, 0.0011), 0.0008, WHITE, ej);
  };
  eye("eyeL", 1, [0.55, -0.14, 0.83]); // looking ahead along the twig
  eye("eyeR", -1, [-0.62, 0.45, -0.64]); // looking back and up

  // ---------- limbs with mitten feet ----------
  const R = TW + 0.0029, TUBE = 0.0029;
  const grip = (prefix: string, sfx: string, sgn: number, wrist: any, zf: number, color: string) => {
    patch({ c: [sgn * 0.0015, T + TW + 0.0016, zf], r: [0.0068, 0.0036, 0.0072] }, color, wrist, { ws: 7, hs: 4 });
    const jPos = J(`${prefix}${sgn > 0 ? "Out" : "In"}${sfx}`, [0.012, T + 0.004, zf], wrist, "digit");
    const jNeg = J(`${prefix}${sgn > 0 ? "In" : "Out"}${sfx}`, [-0.012, T + 0.004, zf], wrist, "digit");
    const bundles = [
      { xs: 1, jt: jPos },
      { xs: -1, jt: jNeg },
    ];
    for (const { xs, jt } of bundles) {
      const start = xs > 0 ? -50 * DEG : 90 * DEG;
      const arcLen = 140 * DEG;
      const aEnd = xs > 0 ? start : start + arcLen;
      for (const dz of [-0.0027, 0.0027]) {
        const g = new THREE.TorusGeometry(R, TUBE, 5, 8, arcLen);
        g.rotateZ(start);
        b.part(g, color, { at: [0, T, zf + dz], bone: jt });
        const end = new THREE.Vector3(R * Math.cos(aEnd), T + R * Math.sin(aEnd), zf + dz);
        const cd = xs > 0
          ? new THREE.Vector3(Math.sin(aEnd), -Math.cos(aEnd), 0)
          : new THREE.Vector3(-Math.sin(aEnd), Math.cos(aEnd), 0);
        ball(end, TUBE * 1.05, color, jt);
        b.part(new THREE.ConeGeometry(0.0011, 0.004, 4), CLAW, {
          at: end.clone().addScaledVector(cd, 0.0028),
          dir: cd,
          bone: jt,
        });
      }
    }
  };
  const limbSet = (front: boolean, sfx: string, sgn: number, root: P3, mid: P3, end: P3, parent: any) => {
    const names = front ? ["shoulder", "elbow", "wrist"] : ["hip", "knee", "ankle"];
    const role = front ? "arm" : "leg";
    const j0 = J(names[0] + sfx, root, parent, role);
    const j1 = J(names[1] + sfx, mid, j0, role);
    const j2 = J(names[2] + sfx, end, j1, role);
    const col = grad(sOfZ(root[2]) + 0.04);
    rod(root, mid, 0.0057, col, j0);
    ball(mid, 0.0062, col, j1, 1);
    rod(mid, end, 0.0046, col, j1);
    // a red band and a pale speck on each limb
    const g = new THREE.TorusGeometry(0.0058, 0.0012, 4, 8);
    g.rotateX(Math.PI / 2);
    b.part(g, RED, { at: v(root).lerp(v(mid), 0.55), dir: v(mid).sub(v(root)), bone: j0 });
    ball(v(mid).lerp(v(end), 0.45).add(new THREE.Vector3(0, 0.0042, 0)), 0.0012, SPECK_A, j1);
    grip(front ? "finger" : "toe", sfx, sgn, j2, end[2], col);
  };
  // staggered walking placement on the twig
  limbSet(true, "L", 1, [0.016, T + 0.042, 0.057], [0.045, T + 0.032, 0.067], [0.008, T + 0.016, 0.075], chest);
  limbSet(true, "R", -1, [-0.016, T + 0.042, 0.053], [-0.045, T + 0.032, 0.052], [-0.008, T + 0.016, 0.055], chest);
  limbSet(false, "L", 1, [0.016, T + 0.042, -0.037], [0.047, T + 0.036, -0.05], [0.008, T + 0.016, -0.046], hips);
  limbSet(false, "R", -1, [-0.016, T + 0.042, -0.033], [-0.047, T + 0.036, -0.022], [-0.008, T + 0.016, -0.026], hips);

  // ---------- coiled tail ----------
  const tailCtrl: THREE.Vector3[] = [new THREE.Vector3(0, T + 0.054, -0.052), new THREE.Vector3(0, T + 0.05, -0.08)];
  const r0 = 0.036, kk = 0.158, phi0 = 100 * DEG;
  const S = new THREE.Vector3(0, T + 0.036, -0.105);
  const Cz = S.z - r0 * Math.cos(phi0), Cy = S.y - r0 * Math.sin(phi0);
  for (let i = 0; i <= 40; i++) {
    const d = (11 * i) / 40;
    const r = r0 * Math.exp(-kk * d);
    const ph = phi0 + d;
    tailCtrl.push(new THREE.Vector3(0, Cy + r * Math.sin(ph), Cz + r * Math.cos(ph)));
  }
  const NT = 36;
  const tp = new THREE.CatmullRomCurve3(tailCtrl).getSpacedPoints(NT - 1);
  const tailJ: any[] = [];
  for (let j = 0; j * 2 < NT; j++) {
    const p = tp[j * 2];
    tailJ.push(J(`tail${j}`, [p.x, p.y, p.z], j === 0 ? hips : tailJ[j - 1], "tail"));
  }
  for (let i = 0; i < NT - 1; i++) {
    const u = i / (NT - 2);
    const r = 0.0028 + 0.0078 * Math.pow(1 - u, 1.15);
    const bone = tailJ[Math.min(Math.floor(i / 2), tailJ.length - 1)];
    const banded = Math.floor(i / 2) % 2 === 1;
    rod(tp[i], tp[i + 1], r, grad(0.45 + 0.55 * u, banded), bone, 7);
    if (i % 2 === 0 && i < NT - 4) {
      const n = new THREE.Vector3(0, tp[i].y - Cy, tp[i].z - Cz).normalize();
      ball(tp[i].clone().addScaledVector(n, r * 0.9), r * 0.3, SPECK_B, bone);
    }
  }

  // ---------- twig & mossy base (props on the root joint) ----------
  const BARK = "#6e4a2e", GROOVE = "#4d321f";
  const twigCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.025, 0.02, 0.19),
    new THREE.Vector3(0.018, 0.075, 0.215),
    new THREE.Vector3(0.006, T - 0.004, 0.212),
    new THREE.Vector3(0, T, 0.17),
    new THREE.Vector3(0, T, 0.1),
    new THREE.Vector3(0, T, 0.0),
    new THREE.Vector3(0, T, -0.06),
  ]);
  b.part(new THREE.TubeGeometry(twigCurve, 48, TW, 7, false), BARK, { at: [0, 0, 0], bone: hips });
  b.part(new THREE.CylinderGeometry(TW * 0.98, TW * 0.98, 0.002, 7), "#e0c08f", { at: [0, T, -0.06], dir: [0, 0, -1], bone: hips });
  b.part(new THREE.CylinderGeometry(TW * 0.45, TW * 0.45, 0.0024, 7), "#b48a5a", { at: [0, T, -0.0605], dir: [0, 0, -1], bone: hips });
  for (const z of [0.125, 0.008]) {
    const g = new THREE.TorusGeometry(TW + 0.0002, 0.0016, 4, 9);
    b.part(g, GROOVE, { at: [0, T, z], bone: hips });
  }
  ball([0.0095, T - 0.003, 0.1], 0.0042, GROOVE, hips);
  ball([-0.0095, T + 0.002, 0.14], 0.0036, BARK, hips);

  // side shoot with leaves
  const shoot = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.004, T, 0.208),
    new THREE.Vector3(-0.012, T + 0.05, 0.225),
    new THREE.Vector3(-0.025, T + 0.1, 0.212),
    new THREE.Vector3(-0.03, T + 0.13, 0.19),
  ]);
  b.part(new THREE.TubeGeometry(shoot, 16, 0.0055, 6, false), BARK, { at: [0, 0, 0], bone: hips });
  const leaf = (base: THREE.Vector3, yaw: number, pitch: number, len: number, color: string) => {
    const g = new THREE.SphereGeometry(1, 8, 4);
    g.scale(len * 0.36, len * 0.06, len * 0.5);
    g.translate(0, 0, len * 0.5);
    g.rotateX(-pitch);
    g.rotateY(yaw);
    b.part(g, color, { at: base, bone: hips });
  };
  const tip = new THREE.Vector3(-0.03, T + 0.13, 0.19);
  leaf(tip, -2.4, 0.5, 0.05, "#3fae4c");
  leaf(tip, -0.9, 0.35, 0.045, "#78d05a");
  leaf(tip, 2.6, 0.6, 0.04, "#3fae4c");
  leaf(new THREE.Vector3(-0.018, T + 0.075, 0.222), 0.5, 0.3, 0.035, "#78d05a");
  leaf(new THREE.Vector3(0.02, 0.06, 0.205), 1.4, 0.4, 0.03, "#3fae4c");

  // base
  b.part(new THREE.CylinderGeometry(0.2, 0.215, 0.026, 9), "#5a3a26", { at: [0, 0.013, 0.03], bone: hips });
  b.part(new THREE.CylinderGeometry(0.192, 0.2, 0.01, 9), "#4c8a3a", { at: [0, 0.031, 0.03], bone: hips });
  const mossCols = ["#5fa544", "#3f7a33", "#7cbf4f"];
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2, d = 0.04 + rand() * 0.13;
    const r = 0.012 + rand() * 0.014;
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.scale(1, 0.5, 1);
    b.part(g, mossCols[i % 3], { at: [Math.cos(a) * d, 0.035, 0.03 + Math.sin(a) * d], bone: hips });
  }
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2, d = 0.06 + rand() * 0.11;
    const r = 0.007 + rand() * 0.008;
    const g = new THREE.DodecahedronGeometry(r, 0);
    g.scale(1, 0.7, 1);
    b.part(g, i % 2 ? "#8c8f88" : "#b1ad9f", { at: [Math.cos(a) * d, 0.035 + r * 0.3, 0.03 + Math.sin(a) * d], bone: hips });
  }
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2, d = 0.05 + rand() * 0.12;
    const g = new THREE.SphereGeometry(1, 7, 3);
    g.scale(0.011, 0.0015, 0.018);
    g.rotateY(rand() * Math.PI);
    b.part(g, i % 2 ? "#ff7a2a" : "#d84a2e", { at: [Math.cos(a) * d, 0.0365, 0.03 + Math.sin(a) * d], bone: hips });
  }

  return b.root;
}
```