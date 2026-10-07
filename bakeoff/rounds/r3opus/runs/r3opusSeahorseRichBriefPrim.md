```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with ridged armour rings, thin dark lines and white freckles. Its curled tail grips a ribbon of seagrass rising from a little sandy mound. It has a spiky crown, a long tube snout, a pleated fluttering dorsal fin and big curious eyes.",
};

type V = THREE.Vector3;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (p: V): [number, number, number] => [p.x, p.y, p.z];

const COL = {
  body: "#ffc928",
  ridge: "#e9a11e",
  ridgeHi: "#ffe066",
  line: "#3a2414",
  freckle: "#fffaf0",
  belly: "#ffe48c",
  spike: "#ff9418",
  spikeTip: "#fff0c2",
  fin: "#fff3b8",
  fin2: "#ffe28e",
  ray: "#ef9f2f",
  eyeWhite: "#fff8e6",
  iris: "#c26e17",
  irisRim: "#7a3d0c",
  pupil: "#140d08",
  snoutTip: "#ea8a2a",
  sand: "#efdcaa",
  sandDark: "#d9c08a",
  pebble1: "#9fb5ba",
  pebble2: "#c9a98b",
  pebble3: "#7f8b86",
  grass1: "#2f7a3a",
  grass2: "#3f9443",
  grass3: "#5fae4a",
  grass4: "#8cc357",
  grassTip: "#b9b45a",
  rib: "#a9d97a",
  star: "#ff6f4e",
  starDot: "#ffd3b8",
};

export default function build() {
  const b: any = createBuilder({ name: "lined_seahorse" });
  const r0: any = rng(11);
  const rand = (): number =>
    typeof r0 === "function" ? r0() : typeof r0.next === "function" ? r0.next() : r0.float();

  // ---------- helpers ----------
  function basis(y: V, refHint?: V) {
    const Y = y.clone().normalize();
    let ref = refHint ? refHint.clone() : v(1, 0, 0);
    if (Math.abs(ref.clone().normalize().dot(Y)) > 0.92) ref = Math.abs(Y.z) < 0.9 ? v(0, 0, 1) : v(1, 0, 0);
    const X = ref.sub(Y.clone().multiplyScalar(ref.dot(Y))).normalize();
    const Z = new THREE.Vector3().crossVectors(X, Y).normalize();
    return new THREE.Matrix4().makeBasis(X, Y, Z);
  }
  function put(
    geo: THREE.BufferGeometry,
    color: string,
    pos: V,
    o: { y?: V; s?: number[]; bone?: any; ref?: V } = {}
  ) {
    if (o.s) geo.scale(o.s[0], o.s[1], o.s[2]);
    if (o.y) geo.applyMatrix4(basis(o.y, o.ref));
    const opts: any = { at: arr(pos) };
    if (o.bone) opts.bone = o.bone;
    return b.part(geo, color, opts);
  }
  function rod(a: V, c: V, r: number, color: string, bone: any, segs = 5, rTop?: number) {
    const d = c.clone().sub(a);
    const len = d.length();
    if (len < 1e-6) return;
    const g = new THREE.CylinderGeometry(rTop ?? r, r, len, segs, 1);
    put(g, color, a.clone().add(c).multiplyScalar(0.5), { y: d, bone });
  }
  function cone(base: V, dir: V, len: number, r: number, color: string, bone: any, segs = 5) {
    const d = dir.clone().normalize();
    const g = new THREE.ConeGeometry(r, len, segs);
    put(g, color, base.clone().add(d.clone().multiplyScalar(len / 2)), { y: d, bone });
  }
  function ball(p: V, r: number, color: string, bone: any, ws = 6, hs = 4, s?: number[], y?: V) {
    put(new THREE.SphereGeometry(r, ws, hs), color, p, { bone, s, y });
  }
  const roleOf = (j: any, role: string) => {
    const t = j && (j.bone ?? j);
    if (t && t.userData) t.userData.role = role;
  };
  function J(name: string, p: V, parent?: any, role?: string) {
    const o: any = { at: arr(p) };
    if (parent) o.parent = parent;
    const j = b.joint(name, o);
    if (role) roleOf(j, role);
    return j;
  }
  // double-sided pleated fan
  function fan(bases: V[], tips: V[], bone: any, rayR: number) {
    for (let i = 0; i < bases.length - 1; i++) {
      const a = bases[i], c = bases[i + 1], d = tips[i + 1], e = tips[i];
      const pts = [a, c, d, a, d, e, a, d, c, a, e, d];
      const center = a.clone().add(c).add(d).add(e).multiplyScalar(0.25);
      const pos: number[] = [];
      for (const p of pts) pos.push(p.x - center.x, p.y - center.y, p.z - center.z);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      put(g, i % 2 ? COL.fin : COL.fin2, center, { bone });
    }
    for (let i = 0; i < bases.length; i++) {
      rod(bases[i], tips[i], rayR, COL.ray, bone, 4, rayR * 0.6);
      ball(tips[i], rayR * 1.6, COL.spike, bone, 5, 3);
    }
  }

  // ---------- skeleton ----------
  const root = J("root", v(0, 0, 0));

  // seagrass strand
  const stemPts = [
    v(-0.014, 0.004, 0.01), v(-0.014, 0.06, 0.01), v(-0.014, 0.125, 0.01), v(-0.02, 0.19, 0.006),
    v(-0.031, 0.26, -0.003), v(-0.039, 0.33, -0.015), v(-0.037, 0.4, -0.028), v(-0.028, 0.45, -0.036),
  ];
  const stem = new THREE.CatmullRomCurve3(stemPts, false, "centripetal");
  const g0 = J("grass0", stem.getPointAt(0), root, "spine");
  const g1 = J("grass1", stem.getPointAt(0.3), g0);
  const g2 = J("grass2", stem.getPointAt(0.6), g1);
  const g3 = J("grass3", stem.getPointAt(0.85), g2);
  const grassBones = (s: number) => (s < 0.3 ? g0 : s < 0.6 ? g1 : s < 0.85 ? g2 : g3);

  // seahorse body
  const body = new THREE.CatmullRomCurve3(
    [v(0, 0.15, -0.004), v(0, 0.17, 0.003), v(0, 0.194, 0.007), v(0, 0.218, 0.002), v(0, 0.238, -0.008), v(0, 0.252, -0.014)],
    false,
    "centripetal"
  );
  const radii = [0.0085, 0.0128, 0.0148, 0.0138, 0.0108, 0.0078];
  const rAt = (t: number) => {
    const f = Math.min(0.9999, Math.max(0, t)) * (radii.length - 1);
    const i = Math.floor(f);
    return radii[i] + (radii[i + 1] - radii[i]) * (f - i);
  };
  const station = (t: number) => {
    const c = body.getPointAt(t);
    const T = body.getTangentAt(t).normalize();
    const X = v(1, 0, 0).sub(T.clone().multiplyScalar(T.x)).normalize();
    const F = new THREE.Vector3().crossVectors(X, T).normalize();
    return { c, T, X, F, r: rAt(t) };
  };
  const surf = (t: number, az: number, k = 1) => {
    const s = station(t);
    return s.c.clone()
      .add(s.F.clone().multiplyScalar(s.r * k * Math.cos(az)))
      .add(s.X.clone().multiplyScalar(0.8 * s.r * k * Math.sin(az)));
  };

  const hips = J("hips", body.getPointAt(0), root, "spine");
  const spine1 = J("spine1", body.getPointAt(0.35), hips, "spine");
  const spine2 = J("spine2", body.getPointAt(0.7), spine1, "spine");
  const neck = J("neck", body.getPointAt(1), spine2, "neck");
  const headP = v(0, 0.262, -0.01);
  const head = J("head", headP, neck, "head");
  const jaw = J("jaw", v(0, 0.2565, 0.0405), head, "jaw");
  const eyeL = J("eyeL", v(0.0076, 0.2672, -0.0035), head);
  const eyeR = J("eyeR", v(-0.0076, 0.2672, -0.0035), head);
  const crown = J("crown", v(0, 0.2765, -0.012), head);
  const dorsalFin = J("dorsalFin", surf(0.45, Math.PI, 0.95), spine1, "fan");
  const pecL = J("pectoralL", v(0.007, 0.2525, -0.012), neck, "fan");
  const pecR = J("pectoralR", v(-0.007, 0.2525, -0.012), neck, "fan");
  const bodyBone = (t: number) => (t < 0.35 ? hips : t < 0.7 ? spine1 : t < 0.93 ? spine2 : neck);

  // tail: down behind, then coiled 1.3 turns around the seagrass
  const sx = -0.014, sz = 0.01, Rh = 0.0085;
  const tailPts: V[] = [v(0, 0.15, -0.004), v(0, 0.138, -0.011), v(0, 0.125, -0.01), v(-0.002, 0.116, -0.002)];
  for (let k = 0; k <= 14; k++) {
    const th = Math.PI / 2 + 2.6 * Math.PI * (k / 14);
    tailPts.push(v(sx + Rh * Math.sin(th), 0.112 - 0.022 * (k / 14), sz - Rh * Math.cos(th)));
  }
  const tail = new THREE.CatmullRomCurve3(tailPts, false, "centripetal");
  const tailBones: any[] = [hips];
  for (let k = 1; k <= 10; k++) tailBones.push(J("tail" + k, tail.getPointAt(k / 10), tailBones[k - 1], "tail"));
  const tailBone = (t: number) => tailBones[Math.min(9, Math.floor(t * 10))];
  const rt = (t: number) => 0.0075 - 0.0053 * Math.pow(t, 0.8);

  // ---------- body ----------
  const NS = 9;
  for (let i = 0; i < NS; i++) {
    const t = i / (NS - 1);
    const s = station(t);
    const bone = bodyBone(t);
    ball(s.c, s.r, COL.body, bone, 8, 6, [0.8, 1, 1], s.T);
    // ridge ring
    const tor = new THREE.TorusGeometry(s.r * 1.0, s.r * 0.13, 4, 8);
    tor.rotateX(Math.PI / 2);
    put(tor, COL.ridge, s.c, { y: s.T, s: [0.8, 1, 1], bone });
    // knobs on the ring corners
    for (const az of [0.8, -0.8, 2.2, -2.2]) ball(surf(t, az, 1.12), s.r * 0.11, COL.ridgeHi, bone, 5, 3);
    // back spines
    if (i > 0) cone(surf(t, Math.PI, 1.05), s.F.clone().negate().add(s.T.clone().multiplyScalar(0.6)), 0.0042, 0.0012, COL.spike, bone, 4);
    if (i < NS - 1) {
      const t2 = (i + 1) / (NS - 1);
      const s2 = station(t2);
      const d = s2.c.clone().sub(s.c);
      const g = new THREE.CylinderGeometry(s2.r * 0.97, s.r * 0.97, d.length(), 8, 1);
      put(g, COL.body, s.c.clone().add(s2.c).multiplyScalar(0.5), { y: d, s: [0.8, 1, 1], bone });
      // thin dark lines running along the body
      for (const az of [0.55, -0.55, 1.25, -1.25, 1.95, -1.95, 2.6, -2.6]) {
        rod(surf(t, az, 1.02), surf(t2, az, 1.02), 0.00035, COL.line, bone, 4);
      }
      // belly scute
      const tm = (t + t2) / 2;
      const sm = station(tm);
      ball(surf(tm, 0, 0.88), sm.r * 0.42, COL.belly, bodyBone(tm), 6, 4, [1.3, 1.4, 0.55], sm.F);
    }
  }
  // freckles
  for (let i = 0; i < 18; i++) {
    const t = 0.08 + rand() * 0.84;
    const az = (0.7 + rand() * 1.7) * (rand() < 0.5 ? -1 : 1);
    ball(surf(t, az, 1.0), 0.0007 + rand() * 0.0005, COL.freckle, bodyBone(t), 5, 3);
  }

  // ---------- tail ----------
  const NT = 42;
  for (let i = 0; i <= NT; i++) {
    const t = i / NT;
    const p = tail.getPointAt(t);
    const T = tail.getTangentAt(t);
    const r = rt(t);
    const bone = tailBone(Math.min(t, 0.999));
    ball(p, r, COL.body, bone, 7, 5);
    const tor = new THREE.TorusGeometry(r, r * (i % 3 === 0 ? 0.12 : 0.17), 4, 7);
    tor.rotateX(Math.PI / 2);
    put(tor, i % 3 === 0 ? COL.line : COL.ridge, p, { y: T, bone });
    if (i < NT) {
      const t2 = (i + 1) / NT;
      const q = tail.getPointAt(t2);
      rod(p, q, r * 0.96, COL.body, tailBone((t + t2) / 2), 7, rt(t2) * 0.96);
    }
    if (i % 4 === 2 && t < 0.35) {
      const fr = p.clone().add(v(0.8, 0.2, -0.3).normalize().multiplyScalar(r * 0.95));
      ball(fr, 0.0007, COL.freckle, bone, 5, 3);
      const fl = p.clone().add(v(-0.8, 0.2, -0.3).normalize().multiplyScalar(r * 0.95));
      ball(fl, 0.0007, COL.freckle, bone, 5, 3);
    }
  }
  ball(tail.getPointAt(1), 0.0024, COL.ridge, tailBones[10], 6, 4);

  // ---------- head ----------
  const cranC = v(0, 0.266, -0.01);
  ball(cranC, 0.0105, COL.body, head, 10, 8, [0.72, 0.95, 1.0]);
  ball(v(0, 0.2635, -0.0175), 0.0068, COL.body, head, 8, 6, [0.8, 1, 1]);
  // cheek plates
  for (const sgn of [1, -1]) {
    ball(v(sgn * 0.0056, 0.2605, -0.0068), 0.0058, COL.ridgeHi, head, 8, 6, [0.5, 1, 1.15]);
    const tor = new THREE.TorusGeometry(0.0056, 0.00035, 3, 10);
    tor.rotateY(Math.PI / 2);
    put(tor, COL.line, v(sgn * 0.0085, 0.2605, -0.0068), { s: [1, 1, 1.15], bone: head });
  }
  // snout
  const snA = v(0, 0.2615, 0.008), snB = v(0, 0.2565, 0.0405);
  const snD = snB.clone().sub(snA);
  rod(v(0, 0.2645, -0.004), v(0, 0.2612, 0.012), 0.0064, COL.body, head, 7, 0.0034);
  rod(snA, snB, 0.0032, COL.body, head, 7, 0.0029);
  for (const f of [0.25, 0.5, 0.72]) {
    const tor = new THREE.TorusGeometry(0.0031, 0.0004, 3, 8);
    tor.rotateX(Math.PI / 2);
    put(tor, COL.line, snA.clone().lerp(snB, f), { y: snD, bone: head });
  }
  rod(snA.clone().add(v(0, 0.0031, 0)), snB.clone().add(v(0, 0.0028, 0)), 0.0003, COL.line, head, 3);
  // mouth: separate upper and lower jaw
  put(new THREE.BoxGeometry(0.0062, 0.0022, 0.0042), COL.snoutTip, v(0, 0.2577, 0.0428), { bone: head });
  put(new THREE.BoxGeometry(0.0056, 0.0018, 0.0038), COL.snoutTip, v(0, 0.2554, 0.0426), { bone: jaw });

  // crown (coronet)
  const cB = v(0, 0.2742, -0.011), cT = v(0, 0.2812, -0.0135);
  rod(cB, cT, 0.0034, COL.ridge, crown, 6, 0.0027);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const dir = v(Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6 - 0.15);
    const base = cT.clone().add(v(Math.cos(a) * 0.0021, -0.0004, Math.sin(a) * 0.0021));
    cone(base, dir, 0.0045, 0.0011, COL.spike, crown, 4);
    ball(base.clone().add(dir.clone().normalize().multiplyScalar(0.0045)), 0.0005, COL.spikeTip, crown, 4, 3);
  }
  cone(cT, v(0, 1, -0.25), 0.0055, 0.0012, COL.spike, crown, 4);
  ball(cT.clone().add(v(0, 1, -0.25).normalize().multiplyScalar(0.0055)), 0.0006, COL.spikeTip, crown, 4, 3);
  // spines on the back of the head and snout bridge
  cone(v(0, 0.2675, -0.023), v(0, 0.4, -1), 0.0035, 0.0011, COL.spike, head, 4);
  cone(v(0, 0.2655, 0.002), v(0, 1, 0.5), 0.0025, 0.0008, COL.spike, head, 4);

  // eyes
  for (const [sgn, eb] of [[1, eyeL], [-1, eyeR]] as [number, any][]) {
    const e = v(sgn * 0.0076, 0.2672, -0.0035);
    const d0 = v(sgn, 0.1, 0.25).normalize();
    ball(e, 0.0042, COL.eyeWhite, eb, 10, 8);
    const tor = new THREE.TorusGeometry(0.0041, 0.0009, 4, 10);
    tor.rotateX(Math.PI / 2);
    put(tor, COL.ridge, e.clone().add(d0.clone().multiplyScalar(0.0012)), { y: d0, bone: eb });
    const d = v(sgn, 0.15, 0.45).normalize();
    ball(e.clone().add(d.clone().multiplyScalar(0.0029)), 0.0033, COL.irisRim, eb, 10, 6, [1, 0.4, 1], d);
    ball(e.clone().add(d.clone().multiplyScalar(0.0032)), 0.0028, COL.iris, eb, 10, 6, [1, 0.4, 1], d);
    ball(e.clone().add(d.clone().multiplyScalar(0.0037)), 0.0018, COL.pupil, eb, 8, 6, [1, 0.4, 1], d);
    const hl = d.clone().add(v(0, 0.5, 0.15)).normalize();
    ball(e.clone().add(hl.multiplyScalar(0.0043)), 0.0007, COL.freckle, eb, 5, 3);
    // brow spike
    cone(e.clone().add(v(sgn * 0.0006, 0.0036, -0.0006)), v(sgn * 0.6, 1, -0.3), 0.0038, 0.0011, COL.spike, head, 4);
  }
  // freckles on head
  for (const dd of [v(0.6, 0.6, -0.5), v(-0.6, 0.6, -0.5), v(0.4, 0.85, 0.2), v(-0.45, 0.8, 0.25), v(0.7, -0.3, -0.6), v(-0.7, -0.3, -0.6)]) {
    const n = dd.clone().normalize();
    ball(cranC.clone().add(v(n.x * 0.0076, n.y * 0.01, n.z * 0.0105)), 0.0007, COL.freckle, head, 5, 3);
  }

  // ---------- fins ----------
  {
    const n = 10, bases: V[] = [], tips: V[] = [];
    for (let j = 0; j < n; j++) {
      const u = j / (n - 1);
      const t = 0.26 + 0.38 * u;
      const s = station(t);
      const base = surf(t, Math.PI, 0.95);
      const len = 0.006 + 0.009 * Math.pow(Math.sin(Math.PI * (0.15 + 0.75 * u)), 0.8);
      const tip = base.clone()
        .add(s.F.clone().multiplyScalar(-len))
        .add(s.T.clone().multiplyScalar(len * 0.35))
        .add(s.X.clone().multiplyScalar(j % 2 ? 0.0022 : -0.0022));
      bases.push(base);
      tips.push(tip);
    }
    fan(bases, tips, dorsalFin, 0.00035);
  }
  for (const [sgn, pb] of [[1, pecL], [-1, pecR]] as [number, any][]) {
    const bases: V[] = [], tips: V[] = [];
    for (let j = 0; j < 5; j++) {
      const p = v(sgn * 0.0068, 0.2555 - j * 0.0016, -0.0125 + j * 0.0003);
      bases.push(p);
      tips.push(p.clone().add(v(sgn * 0.0075, 0.0016 - j * 0.0012, -0.0035 + (j % 2 ? 0.001 : -0.001))));
    }
    fan(bases, tips, pb, 0.00025);
  }

  // ---------- seagrass ----------
  function ribbon(curve: THREE.CatmullRomCurve3, w0: number, w1: number, cols: string[], boneAt: (s: number) => any, tw0: number, twR: number) {
    const n = Math.max(6, Math.round(curve.getLength() / 0.018));
    const thick = 0.0012;
    for (let i = 0; i < n; i++) {
      const s0 = i / n, s1 = (i + 1) / n, sm = (s0 + s1) / 2;
      const a = curve.getPointAt(s0), c = curve.getPointAt(s1);
      const T = c.clone().sub(a);
      const len = T.length();
      const m = a.clone().add(c).multiplyScalar(0.5);
      const phi = tw0 + twR * sm;
      const W = v(Math.cos(phi), 0, Math.sin(phi));
      const w = w0 + (w1 - w0) * sm;
      const bone = boneAt(sm);
      const col = cols[Math.min(cols.length - 1, Math.floor(sm * cols.length))];
      if (i === n - 1) {
        const g = new THREE.ConeGeometry(w / 2, len * 1.6, 4);
        g.rotateY(Math.PI / 4);
        put(g, COL.grassTip, a.clone().add(T.clone().multiplyScalar(0.8)), { y: T, ref: W, s: [1, 1, thick / w], bone });
      } else {
        put(new THREE.BoxGeometry(w, len * 1.08, thick), col, m, { y: T, ref: W, bone });
        put(new THREE.BoxGeometry(0.0009, len * 1.08, thick + 0.0006), COL.rib, m, { y: T, ref: W, bone });
      }
    }
  }
  ribbon(stem, 0.0075, 0.0058, [COL.grass1, COL.grass2, COL.grass3, COL.grass4], grassBones, 1.5, 2.6);
  const blades: [V[], number, number][] = [
    [[v(0.03, 0.004, -0.02), v(0.034, 0.08, -0.024), v(0.046, 0.15, -0.032), v(0.064, 0.21, -0.03)], 0.3, 2.0],
    [[v(-0.04, 0.004, 0.03), v(-0.05, 0.06, 0.036), v(-0.066, 0.12, 0.03), v(-0.074, 0.15, 0.022)], 2.0, -1.8],
    [[v(0.012, 0.004, 0.042), v(0.016, 0.05, 0.05), v(0.027, 0.085, 0.058)], 0.9, 1.5],
    [[v(-0.02, 0.004, -0.04), v(-0.026, 0.07, -0.05), v(-0.022, 0.13, -0.066), v(-0.008, 0.17, -0.07)], 1.2, 2.2],
  ];
  for (const [pts, tw, twr] of blades) {
    ribbon(new THREE.CatmullRomCurve3(pts, false, "centripetal"), 0.0068, 0.005, [COL.grass1, COL.grass2, COL.grass3], () => root, tw, twr);
  }

  // ---------- sandy mound, pebbles, starfish ----------
  const mR = 0.085, mH = 0.024;
  put(new THREE.SphereGeometry(mR, 11, 4, 0, Math.PI * 2, 0, Math.PI / 2), COL.sand, v(-0.005, 0, 0), { s: [1, mH / mR, 0.85], bone: root });
  put(new THREE.CylinderGeometry(0.098, 0.1, 0.002, 11), COL.sandDark, v(-0.005, 0.001, 0), { s: [1, 1, 0.87], bone: root });
  const mHeight = (x: number, z: number) => {
    const dx = (x + 0.005) / mR, dz = z / (mR * 0.85);
    const q = 1 - dx * dx - dz * dz;
    return q > 0 ? mH * Math.sqrt(q) : 0;
  };
  const pcols = [COL.pebble1, COL.pebble2, COL.pebble3];
  for (let i = 0; i < 11; i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.05 + rand() * 0.045;
    const x = -0.005 + Math.cos(a) * d, z = Math.sin(a) * d * 0.85;
    const r = 0.004 + rand() * 0.005;
    const g = new THREE.DodecahedronGeometry(r, 0);
    g.rotateY(rand() * 3);
    put(g, pcols[i % 3], v(x, mHeight(x, z) + r * 0.25, z), { s: [1, 0.6, 1], bone: root });
  }
  // starfish
  const sc = v(0.062, 0.003, 0.074);
  ball(sc, 0.007, COL.star, root, 7, 4, [1, 0.45, 1]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const dir = v(Math.cos(a), 0, Math.sin(a));
    const g = new THREE.ConeGeometry(0.0055, 0.022, 5);
    put(g, COL.star, sc.clone().add(dir.clone().multiplyScalar(0.015)), { y: dir, ref: v(0, 1, 0), s: [0.5, 1, 1], bone: root });
    for (let k = 1; k <= 3; k++) {
      ball(sc.clone().add(dir.clone().multiplyScalar(0.004 + k * 0.0055)).add(v(0, 0.0026 - k * 0.0005, 0)), 0.0009, COL.starDot, root, 4, 3);
    }
  }
  ball(sc.clone().add(v(0, 0.003, 0)), 0.0016, COL.starDot, root, 5, 3);

  return b.root;
}
```