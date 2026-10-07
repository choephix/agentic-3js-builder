```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby mint-green hatchling dragon built from low-poly primitives: big amber slit-pupil eyes, cream belly plates, orange back spikes, ivory horns, purple scalloped bat wings spread in a rest pose, a striped tail ending in a spade, and a piece of eggshell still stuck on its head.",
};

type V = number[];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a: V): V => mul(a, 1 / (len(a) || 1));
const mix = (a: V, b: V, t: number): V => add(a, mul(sub(b, a), t));

// palette
const C = {
  body: "#3fbf9b",
  dark: "#23806f",
  belly: "#ffe3a3",
  plate: "#f4c46e",
  spike: "#ff8a3d",
  horn: "#fff1d0",
  wing1: "#9b5de5",
  wing2: "#d16bd6",
  white: "#ffffff",
  iris: "#ffc23a",
  pupil: "#1b1424",
  cheek: "#ff8fb1",
  nostril: "#1d4a40",
  shell: "#fff8ea",
  speck: "#c9a27a",
};

export default function build() {
  const b = createBuilder({ name: "babyDragon" });
  const B: any = b;

  // ---------- helpers ----------
  const J = (name: string, at: V, parent: any, role?: string, aimAt?: V) => {
    const o: any = { at: [...at] };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    if (aimAt) o.aim = [...aimAt];
    return B.joint(name, o);
  };
  const P = (geo: THREE.BufferGeometry, color: string, at: V, bone: any, dir?: V, scale?: V | number) => {
    const o: any = { at: [...at], bone };
    if (dir) o.dir = [...dir];
    if (scale !== undefined) o.scale = Array.isArray(scale) ? [...scale] : scale;
    return B.part(geo, color, o);
  };
  const ell = (c: V, semi: V, color: string, bone: any, ws = 10, hs = 8, dir?: V) =>
    P(new THREE.SphereGeometry(1, ws, hs), color, c, bone, dir, semi);
  const ball = (c: V, r: number, color: string, bone: any, ws = 8, hs = 6) =>
    P(new THREE.SphereGeometry(r, ws, hs), color, c, bone);
  const rod = (a: V, bb: V, r0: number, r1: number, color: string, bone: any, seg = 7) => {
    const d = sub(bb, a);
    return P(new THREE.CylinderGeometry(r1, r0, len(d), seg, 1), color, mix(a, bb, 0.5), bone, nrm(d));
  };
  const cone = (base: V, dir: V, L: number, r: number, color: string, bone: any, seg = 4) => {
    const d = nrm(dir);
    return P(new THREE.ConeGeometry(r, L, seg), color, add(base, mul(d, L / 2)), bone, d);
  };
  const box = (c: V, size: V, color: string, bone: any, dir?: V) =>
    P(new THREE.BoxGeometry(size[0], size[1], size[2]), color, c, bone, dir);
  // point + normal on an ellipsoid surface in direction u from centre
  const surf = (c: V, s: V, u0: V) => {
    const u = nrm(u0);
    const t = 1 / Math.sqrt((u[0] / s[0]) ** 2 + (u[1] / s[1]) ** 2 + (u[2] / s[2]) ** 2);
    const p = add(c, mul(u, t));
    const q = sub(p, c);
    const n = nrm([q[0] / (s[0] * s[0]), q[1] / (s[1] * s[1]), q[2] / (s[2] * s[2])]);
    return { p, n };
  };
  // double-sided thin sheet from model-space triangles
  const sheet = (tris: V[][], color: string, bone: any) => {
    let cx = 0, cy = 0, cz = 0, n = 0;
    for (const t of tris) for (const v of t) { cx += v[0]; cy += v[1]; cz += v[2]; n++; }
    const c: V = [cx / n, cy / n, cz / n];
    const pos: number[] = [];
    for (const t of tris) {
      const [a, bb, cc] = t.map((v) => sub(v, c));
      pos.push(...a, ...bb, ...cc);
      pos.push(...a, ...cc, ...bb);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return P(g, color, c, bone);
  };

  // ---------- skeleton ----------
  const hips = J("hips", [0, 0.28, -0.1], null, "spine", [0, 0.3, 0.03]);
  const spine = J("spine", [0, 0.3, 0.03], hips, "spine", [0, 0.33, 0.13]);
  const chest = J("chest", [0, 0.33, 0.13], spine, "spine", [0, 0.4, 0.19]);
  const neck = J("neck", [0, 0.4, 0.19], chest, "neck", [0, 0.5, 0.27]);
  const head = J("head", [0, 0.5, 0.27], neck, "head", [0, 0.49, 0.34]);
  const jaw = J("jaw", [0, 0.49, 0.34], head, "jaw", [0, 0.47, 0.5]);

  const T: V[] = [
    [0, 0.3, -0.2],
    [0, 0.25, -0.36],
    [0, 0.2, -0.52],
    [0, 0.16, -0.67],
    [0, 0.15, -0.8],
    [0, 0.17, -0.92],
  ];
  const TR = [0.11, 0.085, 0.065, 0.048, 0.036, 0.026];
  const tailJ: any[] = [hips];
  for (let i = 1; i < T.length; i++) {
    const nm = i === T.length - 1 ? "tailTip" : "tail" + i;
    tailJ.push(J(nm, T[i], tailJ[i - 1], "tail", i < T.length - 1 ? T[i + 1] : add(T[i], [0, 0, -0.08])));
  }

  // ---------- body ----------
  const BC: V = [0, 0.3, 0];
  const BS: V = [0.17, 0.16, 0.24];
  ell(BC, BS, C.body, spine, 12, 9);
  const BEC: V = [0, 0.275, 0.045];
  const BES: V = [0.14, 0.145, 0.22];
  ell(BEC, BES, C.belly, spine, 12, 9);

  // belly plates
  for (let i = 0; i < 7; i++) {
    const th = ((15 + i * 17) * Math.PI) / 180;
    const { p, n } = surf(BEC, BES, [0, -Math.sin(th), Math.cos(th)]);
    box(p, [0.13 - Math.abs(i - 3) * 0.008, 0.012, 0.03], C.plate, i < 2 ? chest : spine, n);
  }

  // back spikes
  const backPhis = [70, 88, 106, 124, 142, 160];
  backPhis.forEach((deg, i) => {
    const ph = (deg * Math.PI) / 180;
    const { p, n } = surf(BC, BS, [0, Math.sin(ph), Math.cos(ph)]);
    const L = 0.055 + 0.025 * Math.sin((i / (backPhis.length - 1)) * Math.PI);
    cone(sub(p, mul(n, 0.012)), add(n, [0, 0, -0.5]), L, 0.026, C.spike, i < 2 ? chest : spine);
  });

  // spots on flanks
  const spots: [V, number][] = [
    [[0.8, 0.45, 0.3], 1],
    [[0.9, 0.2, -0.15], 1.2],
    [[0.7, 0.6, -0.45], 0.9],
    [[0.85, 0.15, -0.65], 1.1],
    [[0.6, 0.75, 0.05], 0.8],
  ];
  for (const s of [1, -1]) {
    for (const [u, k] of spots) {
      const { p, n } = surf(BC, BS, [u[0] * s, u[1], u[2]]);
      ell(p, [0.03 * k, 0.008, 0.025 * k], C.dark, spine, 7, 4, n);
    }
  }

  // ---------- neck ----------
  const N0: V = [0, 0.33, 0.12];
  const N1: V = [0, 0.5, 0.27];
  {
    const d = sub(N1, N0);
    P(new THREE.CapsuleGeometry(0.08, len(d), 3, 9), C.body, mix(N0, N1, 0.5), neck, nrm(d));
    const ax = nrm(d);
    const front = nrm([0, -ax[2], ax[1]]);
    const back = mul(front, -1);
    [0.25, 0.5, 0.75].forEach((t) => {
      box(add(mix(N0, N1, t), mul(front, 0.078)), [0.09, 0.012, 0.03], C.plate, neck, front);
    });
    [0.3, 0.7].forEach((t, i) => {
      cone(add(mix(N0, N1, t), mul(back, 0.07)), add(back, [0, 0.3, 0]), 0.05 - i * 0.008, 0.022, C.spike, neck);
    });
  }

  // ---------- head ----------
  const HC: V = [0, 0.58, 0.3];
  const HS: V = [0.15, 0.135, 0.14];
  ell(HC, HS, C.body, head, 12, 9);
  const SC: V = [0, 0.525, 0.43];
  const SS: V = [0.105, 0.065, 0.11];
  ell(SC, SS, C.body, head, 10, 7);
  // nose horn nub
  cone([0, 0.575, 0.47], [0, 1, 0.35], 0.04, 0.018, C.horn, head, 5);
  // nostrils
  for (const s of [1, -1]) ell([0.035 * s, 0.552, 0.52], [0.013, 0.007, 0.011], C.nostril, head, 6, 4);
  // upper fangs
  for (const s of [1, -1]) cone([0.045 * s, 0.49, 0.5], [0, -1, 0], 0.032, 0.012, C.white, head);

  // lower jaw
  ell([0, 0.47, 0.42], [0.095, 0.04, 0.1], C.body, jaw, 10, 6);
  ell([0, 0.458, 0.41], [0.085, 0.034, 0.09], C.belly, jaw, 10, 6);
  for (const s of [1, -1]) cone([0.03 * s, 0.488, 0.49], [0, 1, 0], 0.022, 0.009, C.white, jaw);

  // crest spikes on top of head
  [100, 125, 150].forEach((deg, i) => {
    const ph = (deg * Math.PI) / 180;
    const { p, n } = surf(HC, HS, [0, Math.sin(ph), Math.cos(ph)]);
    cone(sub(p, mul(n, 0.01)), add(n, [0, 0, -0.6]), 0.05 - i * 0.008, 0.02, C.spike, head);
  });

  // eggshell cap
  {
    const cc: V = [0, 0.7, 0.34];
    const r = 0.068;
    P(new THREE.SphereGeometry(r, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.shell, cc, head, undefined, [1, 1.15, 1]);
    // jagged rim teeth pointing up around the rim
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.2;
      const base: V = add(cc, [Math.cos(a) * r * 0.97, 0, Math.sin(a) * r * 0.97]);
      cone(base, [Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3], 0.022, 0.014, C.shell, head, 3);
    }
    const sp: [number, number][] = [[0.4, 0.5], [1.7, 0.8], [2.9, 0.4], [4.2, 0.9], [5.3, 0.55], [0.9, 1.2], [3.6, 1.25]];
    for (const [az, el] of sp) {
      const u: V = [Math.cos(az) * Math.cos(el), Math.sin(el) * 1.15, Math.sin(az) * Math.cos(el)];
      const n = nrm([u[0], u[1] / 1.15, u[2]]);
      ell(add(cc, mul(u, r)), [0.009, 0.003, 0.007], C.speck, head, 5, 3, n);
    }
  }

  for (const s of [1, -1]) {
    const X = (p: V): V => [p[0] * s, p[1], p[2]];

    // eyes
    const E = X([0.08, 0.6, 0.405]);
    const d = nrm([0.35 * s, 0.12, 1]);
    ball(E, 0.055, C.white, head, 10, 8);
    ell(add(E, mul(d, 0.045)), [0.034, 0.012, 0.034], C.iris, head, 10, 5, d);
    ell(add(E, mul(d, 0.055)), [0.009, 0.006, 0.026], C.pupil, head, 6, 4, d);
    ball(add(add(E, mul(d, 0.056)), [0.016, 0.02, 0]), 0.011, C.white, head, 6, 4);
    ball(add(add(E, mul(d, 0.057)), [-0.012, -0.014, 0]), 0.005, C.white, head, 5, 3);
    // brow ridge
    box(X([0.085, 0.66, 0.4]), [0.075, 0.018, 0.035], C.dark, head, nrm([-0.35 * s, 1, 0.25]));
    // cheeks
    ell(X([0.118, 0.528, 0.362]), [0.03, 0.01, 0.024], C.cheek, head, 8, 4, nrm([0.65 * s, -0.1, 0.75]));

    // horns
    const h0 = X([0.07, 0.685, 0.25]);
    const h1 = X([0.1, 0.755, 0.18]);
    const h2 = X([0.12, 0.79, 0.11]);
    const h3 = X([0.13, 0.8, 0.05]);
    rod(h0, h1, 0.03, 0.024, C.horn, head, 6);
    rod(h1, h2, 0.024, 0.017, C.horn, head, 6);
    cone(h2, sub(h3, h2), len(sub(h3, h2)) + 0.01, 0.017, C.spike, head, 6);
    P(new THREE.TorusGeometry(0.026, 0.006, 4, 8).rotateX(Math.PI / 2), C.spike, mix(h0, h1, 0.35), head, nrm(sub(h1, h0)));

    // ear frills
    const fr = X([0.135, 0.6, 0.25]);
    const frDirs: V[] = [[1, 0.5, -0.6], [1, 0.05, -0.75], [0.9, -0.35, -0.55]];
    frDirs.forEach((fd, i) => {
      const dd = nrm([fd[0] * s, fd[1], fd[2]]);
      P(new THREE.ConeGeometry(0.026, 0.11 - i * 0.015, 4), i === 1 ? C.wing2 : C.wing1, add(fr, mul(dd, 0.05)), head, dd, [1, 1, 0.35]);
    });

    // ---------- front legs ----------
    const sf = s > 0 ? "L" : "R";
    const aP = X([0.11, 0.25, 0.14]);
    const fP = X([0.13, 0.13, 0.16]);
    const hP = X([0.13, 0.045, 0.17]);
    const arm = J("arm" + sf, aP, chest, "arm", fP);
    const fore = J("forearm" + sf, fP, arm, "arm", hP);
    const hand = J("hand" + sf, hP, fore, "arm", add(hP, [0, 0, 0.08]));
    ball(aP, 0.06, C.body, arm, 9, 7);
    rod(aP, fP, 0.055, 0.042, C.body, arm);
    ball(fP, 0.042, C.body, fore, 8, 6);
    rod(fP, hP, 0.042, 0.036, C.body, fore);
    P(new THREE.TorusGeometry(0.039, 0.008, 4, 10).rotateX(Math.PI / 2), C.dark, mix(fP, hP, 0.7), fore, nrm(sub(hP, fP)));
    ell(X([0.13, 0.035, 0.185]), [0.05, 0.035, 0.06], C.body, hand, 9, 6);
    for (const o of [-0.025, 0, 0.025]) cone(X([0.13 + o, 0.025, 0.232]), [0, -0.25, 1], 0.035, 0.011, C.horn, hand);

    // ---------- rear legs ----------
    const hipP = X([0.12, 0.26, -0.1]);
    const kP = X([0.15, 0.15, -0.04]);
    const anP = X([0.15, 0.06, -0.1]);
    const ftP = X([0.15, 0.035, -0.06]);
    const hipJ = J("hip" + sf, hipP, hips, "leg", kP);
    const knee = J("knee" + sf, kP, hipJ, "leg", anP);
    const ankle = J("ankle" + sf, anP, knee, "leg", ftP);
    const foot = J("foot" + sf, ftP, ankle, "leg", add(ftP, [0, 0, 0.09]));
    ell(X([0.15, 0.21, -0.08]), [0.07, 0.095, 0.105], C.body, hipJ, 10, 8);
    ell(X([0.2, 0.21, -0.07]), [0.012, 0.045, 0.05], C.dark, hipJ, 6, 4); // thigh spot
    ball(kP, 0.05, C.body, knee, 8, 6);
    rod(kP, anP, 0.048, 0.036, C.body, knee);
    ball(anP, 0.036, C.body, ankle, 8, 6);
    ell(X([0.15, 0.035, -0.05]), [0.055, 0.035, 0.08], C.body, foot, 9, 6);
    for (const o of [-0.028, 0, 0.028]) cone(X([0.15 + o, 0.025, 0.02]), [0, -0.25, 1], 0.035, 0.011, C.horn, foot);

    // ---------- wings ----------
    const S0 = X([0.1, 0.43, 0.04]);
    const EL = X([0.26, 0.5, 0.0]);
    const WR = X([0.42, 0.56, -0.04]);
    const F = [X([0.64, 0.6, -0.12]), X([0.6, 0.46, -0.25]), X([0.44, 0.38, -0.3])];
    const Bd = X([0.09, 0.38, -0.14]);
    const wing = J("wing" + sf, S0, chest, "wing", EL);
    const wElb = J("wingElbow" + sf, EL, wing, "wing", WR);
    const wWr = J("wingWrist" + sf, WR, wElb, "wing", F[0]);
    const fingerJ: any[] = [];
    F.forEach((tip, k) => {
      const base = mix(WR, tip, 0.12);
      const fj = J("wingF" + (k + 1) + sf, base, wWr, "digit", tip);
      J("wingF" + (k + 1) + "Tip" + sf, tip, fj, "digit");
      fingerJ.push(fj);
    });

    rod(S0, EL, 0.028, 0.022, C.body, wing);
    ball(EL, 0.027, C.spike, wElb, 7, 5);
    rod(EL, WR, 0.022, 0.018, C.body, wElb);
    ball(WR, 0.025, C.spike, wWr, 7, 5);
    cone(WR, [0.1 * s, 0.4, 1], 0.045, 0.012, C.horn, wWr); // thumb claw
    F.forEach((tip, k) => {
      rod(WR, tip, 0.013, 0.006, C.spike, fingerJ[k], 5);
    });

    const scal = (a: V, c: V, t = 0.22) => mix(mix(a, c, 0.5), WR, t);
    const sc1 = scal(F[0], F[1]);
    const sc2 = scal(F[1], F[2]);
    const sc3 = scal(F[2], Bd, 0.15);
    sheet([[WR, F[0], sc1], [WR, sc1, F[1]]], C.wing1, wWr);
    sheet([[WR, F[1], sc2], [WR, sc2, F[2]]], C.wing2, wWr);
    sheet([[WR, F[2], sc3], [WR, sc3, Bd]], C.wing1, wWr);
    sheet([[S0, EL, WR], [S0, WR, Bd]], C.wing2, wing);
  }

  // ---------- tail ----------
  for (let i = 0; i < T.length - 1; i++) {
    const bone = tailJ[i];
    rod(T[i], T[i + 1], TR[i], TR[i + 1], C.body, bone, 8);
    if (i > 0) ball(T[i], TR[i], C.body, bone, 8, 6);
    // stripe band near the start of each segment
    const dir = nrm(sub(T[i + 1], T[i]));
    if (i > 0) {
      const bp = mix(T[i], T[i + 1], 0.35);
      const br = TR[i] + (TR[i + 1] - TR[i]) * 0.35;
      P(new THREE.TorusGeometry(br, 0.011, 4, 10).rotateX(Math.PI / 2), C.dark, bp, bone, dir);
    }
    // spike on top
    const m = mix(T[i], T[i + 1], 0.6);
    const mr = TR[i] + (TR[i + 1] - TR[i]) * 0.6;
    const up = nrm([0, dir[2] < 0 ? -dir[2] : dir[2], Math.abs(dir[1])]);
    cone(add(m, mul(up, mr - 0.01)), add(up, [0, 0, -0.6]), 0.05 - i * 0.007, 0.022 - i * 0.002, C.spike, bone);
  }
  // spade tip
  {
    const tip = tailJ[T.length - 1];
    P(new THREE.OctahedronGeometry(1, 0), C.spike, [0, 0.17, -0.98], tip, undefined, [0.075, 0.02, 0.09]);
    P(new THREE.OctahedronGeometry(1, 0), C.wing2, [0, 0.172, -0.975], tip, undefined, [0.04, 0.024, 0.05]);
  }

  return b.root;
}
```