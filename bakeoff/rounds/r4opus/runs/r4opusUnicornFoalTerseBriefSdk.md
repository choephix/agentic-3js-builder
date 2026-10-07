```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A knobbly-kneed unicorn foal built from chunky primitives: pearl-white coat with a lilac belly, a rainbow brush mane and a banded rainbow tail, a gold-spiralled horn ringed by a flower crown, big glossy eyes with lashes, lilac socks with fluffy feathering, gold-rimmed hooves and sparkle marks on the haunches. Rigged with spine, neck, head, opening jaw, eyes, ears, horn, four legs and a five-joint tail.",
};

type Vec = THREE.Vector3;

export default function build(): THREE.Object3D {
  const b: any = createBuilder({ name: "unicornFoal" });

  // ---------- small math helpers (pure three.js) ----------
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const A = (p: Vec): [number, number, number] => [p.x, p.y, p.z];
  const add = (p: Vec, q: Vec, k = 1) => p.clone().addScaledVector(q, k);
  const lerpV = (p: Vec, q: Vec, t: number) => p.clone().lerp(q, t);

  // rotate geometry so its local +Y points along dir, local +Z as close to hint as possible
  const orient = (geo: THREE.BufferGeometry, dir: Vec, hint: Vec = V(0, 0, 1)) => {
    const y = dir.clone().normalize();
    let z = hint.clone().addScaledVector(y, -hint.dot(y));
    if (z.lengthSq() < 1e-6) {
      const alt = Math.abs(y.x) < 0.9 ? V(1, 0, 0) : V(0, 0, 1);
      z = alt.clone().addScaledVector(y, -alt.dot(y));
    }
    z.normalize();
    const x = new THREE.Vector3().crossVectors(y, z).normalize();
    geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
    return geo;
  };

  const ell = (rx: number, ry: number, rz: number, w = 10, h = 8) =>
    new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);

  const put = (geo: THREE.BufferGeometry, color: string, at: Vec, bone: any) =>
    b.part(geo, color, { at: A(at), bone });

  const cyl = (a: Vec, c: Vec, r0: number, r1: number, color: string, bone: any, radial = 8) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), radial, 1);
    orient(g, d);
    put(g, color, lerpV(a, c, 0.5), bone);
  };

  const cap = (a: Vec, c: Vec, r: number, color: string, bone: any, radial = 8) => {
    const d = c.clone().sub(a);
    const g = new THREE.CapsuleGeometry(r, d.length(), 3, radial);
    orient(g, d);
    put(g, color, lerpV(a, c, 0.5), bone);
  };

  // point + outward normal on an ellipsoid (centre c, radii s) in direction dir
  const ellPoint = (c: Vec, s: number[], dir: number[]) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const p = V(c.x + d.x * s[0], c.y + d.y * s[1], c.z + d.z * s[2]);
    const n = V(d.x / s[0], d.y / s[1], d.z / s[2]).normalize();
    return { p, n };
  };

  const joint = (name: string, at: Vec, parent?: any, role?: string) => {
    const o: any = { at: A(at) };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    return b.joint(name, o);
  };

  // ---------- palette ----------
  const C = {
    coat: "#fff7f1",
    shade: "#eee2f7",
    muzzle: "#ffd2dc",
    nostril: "#c97a92",
    blush: "#ffadc3",
    tongue: "#ff7fa6",
    earIn: "#ffbfd2",
    hoof: "#b48fe6",
    gold: "#ffc94d",
    horn: "#fff0cf",
    sock: "#dccaf7",
    fluff: "#ffffff",
    eye: "#2a1b3d",
    iris: "#7552dc",
    irisLight: "#b9a2ff",
    dapple: "#e6d5ff",
    star: "#ffd76a",
    leaf: "#8fd6a0",
    flowerHeart: "#ffb84d",
  };
  const MANE = ["#ff8fc0", "#ffb08a", "#ffe68a", "#93ebc0", "#8fcfff", "#b9a0ff"];
  const PETALS = ["#ffffff", "#ffc6dc", "#cdb8ff"];

  // ---------- skeleton ----------
  const hips = joint("hips", V(0, 0.88, -0.18), undefined, "spine");
  const spine = joint("spine", V(0, 0.88, 0.0), hips, "spine");
  const chest = joint("chest", V(0, 0.88, 0.16), spine, "spine");
  const A1 = V(0, 0.95, 0.22);
  const A2 = V(0, 1.13, 0.35);
  const A3 = V(0, 1.31, 0.45);
  const neck1 = joint("neck1", A1, chest, "neck");
  const neck2 = joint("neck2", A2, neck1, "neck");
  const head = joint("head", A3, neck2, "head");
  const jaw = joint("jaw", V(0, 1.25, 0.54), head, "jaw");

  // ---------- body ----------
  const chestC = V(0, 0.88, 0.15);
  const chestS = [0.17, 0.19, 0.22];
  put(ell(0.175, 0.19, 0.24, 12, 9), C.coat, V(0, 0.87, -0.17), hips);
  put(ell(0.17, 0.185, 0.2, 12, 9), C.coat, V(0, 0.86, 0.0), spine);
  put(ell(chestS[0], chestS[1], chestS[2], 12, 9), C.coat, chestC, chest);
  put(ell(0.155, 0.17, 0.3, 12, 8), C.shade, V(0, 0.81, -0.01), spine);
  put(ell(0.12, 0.12, 0.09, 9, 7), C.coat, V(0, 0.83, 0.3), chest);
  for (const s of [1, -1]) {
    put(ell(0.12, 0.135, 0.13, 10, 8), C.coat, V(0.085 * s, 0.9, -0.27), hips);
    put(ell(0.1, 0.13, 0.1, 9, 7), C.coat, V(0.09 * s, 0.86, 0.2), chest);
  }

  // ---------- neck ----------
  cyl(A1, A2, 0.12, 0.095, C.coat, neck1, 10);
  put(new THREE.SphereGeometry(0.097, 10, 8), C.coat, A2, neck2);
  cyl(A2, A3, 0.095, 0.08, C.coat, neck2, 10);

  // ---------- head ----------
  const HC = V(0, 1.37, 0.5);
  const HS = [0.125, 0.12, 0.13];
  put(ell(HS[0], HS[1], HS[2], 12, 9), C.coat, HC, head);
  put(ell(0.088, 0.085, 0.1, 10, 8), C.coat, V(0, 1.335, 0.6), head);
  const MC = V(0, 1.29, 0.69);
  const MS = [0.08, 0.066, 0.088];
  put(ell(MS[0], MS[1], MS[2], 10, 8), C.muzzle, MC, head);

  // lower jaw (separate so the mouth opens)
  put(ell(0.065, 0.042, 0.07, 9, 7), C.coat, V(0, 1.235, 0.585), jaw);
  put(ell(0.062, 0.032, 0.075, 9, 7), C.muzzle, V(0, 1.222, 0.67), jaw);
  put(ell(0.038, 0.012, 0.05, 8, 5), C.tongue, V(0, 1.245, 0.665), jaw);

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // cheeks + blush
    const cheekC = V(0.07 * s, 1.28, 0.53);
    const cheekS = [0.06, 0.065, 0.07];
    put(ell(cheekS[0], cheekS[1], cheekS[2], 9, 7), C.coat, cheekC, head);
    const bl = ellPoint(cheekC, cheekS, [0.85 * s, -0.05, 0.5]);
    put(orient(ell(0.028, 0.006, 0.022, 9, 5), bl.n, V(0, 1, 0)), C.blush, add(bl.p, bl.n, 0.001), head);

    // nostrils
    const ns = ellPoint(MC, MS, [0.42 * s, 0.3, 0.86]);
    put(orient(ell(0.009, 0.005, 0.014, 7, 5), ns.n, V(0.3 * s, 1, 0)), C.nostril, add(ns.p, ns.n, 0.001), head);

    // ---- eye ----
    const ep = ellPoint(HC, HS, [0.72 * s, 0.12, 0.66]);
    const p = ep.p;
    const n = ep.n;
    const eyeJ = joint("eye" + L, p, head);
    const up = V(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const fw = V(0, 0, 1).addScaledVector(n, -n.z);
    fw.addScaledVector(up, -fw.dot(up)).normalize();

    put(orient(ell(0.042, 0.018, 0.052, 12, 8), n, up), C.eye, add(p, n, 0.004), eyeJ);
    put(orient(ell(0.032, 0.012, 0.041, 12, 7), n, up), C.iris, add(add(p, n, 0.013), up, -0.003), eyeJ);
    put(orient(ell(0.022, 0.006, 0.014, 9, 5), n, up), C.irisLight, add(add(p, n, 0.022), up, -0.02), eyeJ);
    put(orient(ell(0.017, 0.008, 0.023, 9, 6), n, up), C.eye, add(p, n, 0.02), eyeJ);
    put(new THREE.SphereGeometry(0.0095, 7, 5), C.fluff, add(add(add(p, n, 0.029), up, 0.016), fw, 0.011), eyeJ);
    put(new THREE.SphereGeometry(0.005, 6, 4), C.fluff, add(add(add(p, n, 0.026), up, -0.014), fw, -0.01), eyeJ);
    // lashes on the upper-back rim
    const lashA = [0.3, 0.7, 1.1];
    const lashL = [0.032, 0.042, 0.036];
    lashA.forEach((a, i) => {
      const radial = up.clone().multiplyScalar(Math.cos(a)).addScaledVector(fw, -Math.sin(a));
      const base = add(add(add(p, n, 0.006), up, Math.cos(a) * 0.05), fw, -Math.sin(a) * 0.04);
      const dir = radial.clone().addScaledVector(n, 0.35).addScaledVector(V(0, 1, 0), 0.25).normalize();
      const g = new THREE.ConeGeometry(0.0065, lashL[i], 4).translate(0, lashL[i] / 2, 0);
      put(orient(g, dir), C.eye, base, eyeJ);
    });

    // ---- ear ----
    const er = ellPoint(HC, HS, [0.5 * s, 0.82, -0.22]);
    const earJ = joint("ear" + L, er.p, head);
    const ed = V(0.4 * s, 1, -0.1).normalize();
    const eh = V(0.45 * s, 0, 1);
    const outer = new THREE.ConeGeometry(0.045, 0.15, 6).translate(0, 0.075, 0).scale(1, 1, 0.5);
    const inner = new THREE.ConeGeometry(0.03, 0.085, 6).translate(0, 0.0425, 0).scale(1, 1, 0.45).translate(0, 0.045, 0.012);
    const earBase = add(er.p, ed, -0.015);
    put(orient(outer, ed, eh), C.coat, earBase, earJ);
    put(orient(inner, ed, eh), C.earIn, earBase, earJ);
  }

  // ---------- horn ----------
  const hb = ellPoint(HC, HS, [0, 0.84, 0.55]);
  const hbn = hb.n.clone();
  const hd = V(0, 1, 0.42).normalize();
  const hornJ = joint("horn", hb.p, head);
  joint("hornTip", add(hb.p, hd, 0.24), hornJ);
  const hornAt = add(hb.p, hd, -0.012);
  put(orient(new THREE.ConeGeometry(0.036, 0.25, 8, 1).translate(0, 0.125, 0), hd), C.horn, hornAt, hornJ);
  {
    const pts: Vec[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const y = 0.012 + t * 0.2;
      const r = 0.036 * (1 - y / 0.25) + 0.0015;
      const a = t * Math.PI * 2 * 3.2;
      pts.push(V(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.005, 5, false);
    put(orient(tube, hd), C.gold, hornAt, hornJ);
  }
  put(orient(new THREE.TorusGeometry(0.037, 0.009, 6, 16).rotateX(Math.PI / 2).translate(0, 0.006, 0), hd), C.gold, hornAt, hornJ);

  // ---------- flower crown around the horn ----------
  {
    const e1 = V(1, 0, 0);
    const e2 = new THREE.Vector3().crossVectors(hbn, e1).normalize();
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + 0.2;
      const d = hbn.clone().addScaledVector(e1, Math.cos(a) * 0.6).addScaledVector(e2, Math.sin(a) * 0.6);
      const f = ellPoint(HC, HS, [d.x, d.y, d.z]);
      const pc = PETALS[k % 3];
      put(new THREE.SphereGeometry(0.009, 6, 5), C.flowerHeart, add(f.p, f.n, 0.012), head);
      for (let q = 0; q < 5; q++) {
        const th = (q / 5) * Math.PI * 2 + k;
        const g = ell(0.012, 0.0045, 0.008, 7, 5).translate(0.012, 0, 0).rotateY(th);
        put(orient(g, f.n, V(1, 0, 0)), pc, add(f.p, f.n, 0.007), head);
      }
      const leaf = ell(0.007, 0.003, 0.016, 6, 4).translate(0, 0, 0.022).rotateY(k * 1.3 + 0.6);
      put(orient(leaf, f.n, V(1, 0, 0)), C.leaf, add(f.p, f.n, 0.004), head);
    }
  }

  // ---------- rainbow brush mane ----------
  {
    type Tuft = { p: Vec; dir: Vec; hint: Vec; bone: any; size: number };
    const tufts: Tuft[] = [];
    for (const dd of [[0, 0.75, -0.66], [0, 0.3, -0.95]]) {
      const t = ellPoint(HC, HS, dd);
      tufts.push({ p: t.p, dir: t.n.clone().add(V(0, 0.15, -0.45)).normalize(), hint: V(0, 1, 0), bone: head, size: 0.9 });
    }
    const segs = [
      { a: A2, c: A3, r0: 0.095, r1: 0.08, bone: neck2, ts: [0.8, 0.45, 0.1] },
      { a: A1, c: A2, r0: 0.12, r1: 0.095, bone: neck1, ts: [0.75, 0.4] },
    ];
    for (const sg of segs) {
      const d = sg.c.clone().sub(sg.a).normalize();
      const perp = V(0, d.z, -d.y);
      for (const t of sg.ts) {
        const c = lerpV(sg.a, sg.c, t);
        const r = sg.r0 + (sg.r1 - sg.r0) * t;
        tufts.push({ p: add(c, perp, r), dir: perp.clone().addScaledVector(d, -0.55).normalize(), hint: d, bone: sg.bone, size: 1 });
      }
    }
    const w = ellPoint(chestC, chestS, [0, 1, -0.15]);
    tufts.push({ p: w.p, dir: V(0, 0.8, -0.6).normalize(), hint: V(0, 0.6, 0.8), bone: chest, size: 0.75 });

    tufts.forEach((tf, i) => {
      const ci = Math.min(5, Math.floor((i * 6) / tufts.length));
      [1, -1].forEach((s, j) => {
        const dir = tf.dir.clone().addScaledVector(V(1, 0, 0), 0.3 * s).normalize();
        const h = 0.15 * tf.size;
        const g = new THREE.ConeGeometry(0.045 * tf.size, h, 6).translate(0, h / 2, 0).scale(0.55, 1, 1);
        const at = add(add(tf.p, V(1, 0, 0), 0.017 * s), dir, -0.015);
        put(orient(g, dir, tf.hint), MANE[(ci + j) % 6], at, tf.bone);
      });
    });
  }

  // ---------- tail ----------
  {
    const T = [V(0, 0.97, -0.39), V(0, 0.95, -0.5), V(0, 0.88, -0.6), V(0, 0.78, -0.67), V(0, 0.66, -0.71)];
    const tj: any[] = [];
    let parent = hips;
    T.forEach((p, i) => {
      parent = joint("tail" + (i + 1), p, parent, "tail");
      tj.push(parent);
    });
    cyl(T[0], T[1], 0.035, 0.03, C.coat, tj[0], 8);
    const rads = [0.04, 0.06, 0.068, 0.058];
    for (let i = 0; i < 4; i++) {
      const d = T[i + 1].clone().sub(T[i]);
      const len = d.length();
      d.normalize();
      const top = V(0, -d.z, d.y);
      const mid = lerpV(T[i], T[i + 1], 0.5);
      for (const j of [-1, 0, 1]) {
        const r = rads[i] * (j === 0 ? 0.95 : 0.8);
        const g = ell(r * 0.8, len * 0.72, r * 0.85, 9, 7);
        const at = add(add(mid, V(1, 0, 0), j * 0.03), top, j === 0 ? 0.015 : -0.008);
        put(orient(g, d, top), MANE[((j + 1) * 2 + i) % 6], at, tj[i]);
      }
    }
    const dl = T[4].clone().sub(T[3]).normalize();
    [-1, 0, 1].forEach((j, k) => {
      const dir = dl.clone().addScaledVector(V(1, 0, 0), j * 0.35).normalize();
      const g = new THREE.ConeGeometry(0.035, 0.13, 6).translate(0, 0.065, 0);
      put(orient(g, dir), MANE[(k * 2 + 4) % 6], add(T[4], V(1, 0, 0), j * 0.02), tj[4]);
    });
  }

  // ---------- legs ----------
  const leg = (s: number, front: boolean) => {
    const L = s > 0 ? "L" : "R";
    const x = 0.11 * s;
    const pts = front
      ? [V(x, 0.8, 0.22), V(x, 0.6, 0.2), V(x, 0.36, 0.22), V(x, 0.12, 0.23), V(x, 0.07, 0.245)]
      : [V(x, 0.84, -0.25), V(x * 1.08, 0.6, -0.16), V(x, 0.37, -0.3), V(x, 0.12, -0.27), V(x, 0.07, -0.255)];
    const names = front
      ? ["shoulder", "elbow", "wrist", "fetlockFront", "hoofFront"]
      : ["hip", "knee", "hock", "fetlockBack", "hoofBack"];
    const js: any[] = [];
    let par: any = front ? chest : hips;
    names.forEach((nm, i) => {
      par = joint(nm + L, pts[i], par, "leg");
      js.push(par);
    });

    // upper leg
    cap(pts[0], pts[1], front ? 0.06 : 0.078, C.coat, js[0], 9);
    put(new THREE.SphereGeometry(front ? 0.047 : 0.056, 9, 7), C.coat, pts[1], js[1]);
    // forearm / gaskin
    cyl(pts[1], pts[2], front ? 0.045 : 0.05, 0.03, C.coat, js[1], 8);
    // knobbly knee / hock
    put(ell(0.038, 0.042, 0.04, 9, 7), C.coat, pts[2], js[2]);
    if (!front) put(new THREE.SphereGeometry(0.022, 7, 5), C.coat, add(pts[2], V(0, 0.012, -0.032)), js[2]);
    // cannon with lilac sock
    const mid = lerpV(pts[2], pts[3], 0.48);
    cyl(pts[2], mid, 0.027, 0.026, C.coat, js[2], 8);
    cyl(mid, pts[3], 0.029, 0.029, C.sock, js[2], 8);
    const cdir = pts[3].clone().sub(pts[2]);
    put(orient(new THREE.TorusGeometry(0.03, 0.011, 6, 12).rotateX(Math.PI / 2), cdir), C.fluff, mid, js[2]);
    // fetlock + feathering
    put(new THREE.SphereGeometry(0.034, 9, 7), C.sock, pts[3], js[3]);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      const radial = V(Math.cos(a), 0, Math.sin(a));
      const base = add(add(pts[3], radial, 0.022), V(0, -0.012, 0));
      const dir = radial.clone().multiplyScalar(0.55).add(V(0, -1, 0)).normalize();
      const g = new THREE.ConeGeometry(0.017, 0.055, 5).translate(0, 0.0275, 0);
      put(orient(g, dir), C.fluff, base, js[3]);
    }
    cyl(pts[3], pts[4], 0.028, 0.03, C.sock, js[3], 8);
    // hoof
    const hp = pts[4];
    put(new THREE.CylinderGeometry(0.035, 0.045, 0.07, 9, 1), C.hoof, V(hp.x, 0.035, hp.z + 0.006), js[4]);
    put(new THREE.TorusGeometry(0.036, 0.006, 5, 14).rotateX(Math.PI / 2), C.gold, V(hp.x, 0.068, hp.z + 0.006), js[4]);
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // ---------- haunch dapples + sparkle marks ----------
  for (const s of [1, -1]) {
    const HCH = V(0.085 * s, 0.9, -0.27);
    const HSS = [0.12, 0.135, 0.13];
    const dap: [number[], number][] = [
      [[0.8 * s, 0.5, -0.45], 0.022],
      [[0.6 * s, 0.2, -0.8], 0.017],
      [[0.7 * s, -0.3, -0.6], 0.019],
      [[0.4 * s, 0.6, -0.7], 0.013],
      [[0.5 * s, -0.1, -0.9], 0.015],
      [[0.75 * s, 0.75, -0.1], 0.012],
    ];
    for (const [d, r] of dap) {
      const h = ellPoint(HCH, HSS, d);
      put(orient(ell(r, 0.004, r, 9, 4), h.n), C.dapple, add(h.p, h.n, 0.001), hips);
    }
    const stars: [number[], number][] = [
      [[s, 0.25, 0.15], 1],
      [[s, 0.6, -0.1], 0.55],
      [[s, -0.05, 0.45], 0.6],
    ];
    for (const [d, k] of stars) {
      const h = ellPoint(HCH, HSS, d);
      const at = add(h.p, h.n, 0.002);
      put(orient(new THREE.OctahedronGeometry(1, 0).scale(0.032 * k, 0.005, 0.009 * k), h.n, V(0, 1, 0)), C.star, at, hips);
      put(orient(new THREE.OctahedronGeometry(1, 0).scale(0.009 * k, 0.005, 0.032 * k), h.n, V(0, 1, 0)), C.star, at, hips);
    }
  }

  return b.root;
}
```