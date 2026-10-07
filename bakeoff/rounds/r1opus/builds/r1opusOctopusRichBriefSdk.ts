import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust reef octopus with a soft faceted mantle, pale mottling and bumps, golden bar-pupil eyes under grumpy brows, eight curling arms lined with cream suckers, one arm proudly holding up an old verdigris-flecked brass key.",
};

type V3 = THREE.Vector3;
const Vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function makeRand(seed: number) {
  let s = seed >>> 0;
  const mul = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let src: any = null;
  try {
    src = rng(seed);
  } catch {
    src = null;
  }
  return () => {
    let x: any;
    try {
      if (typeof src === "function") x = src();
      else if (src && typeof src.next === "function") x = src.next();
      else if (src && typeof src.float === "function") x = src.float();
    } catch {
      x = undefined;
    }
    if (typeof x === "number" && isFinite(x) && x >= 0 && x < 1) return x;
    return mul();
  };
}

export default function build() {
  const b = createBuilder({ name: "reefOctopus" });
  const rnd = makeRand(4217);
  const rr = (a: number, c: number) => a + (c - a) * rnd();
  const D = Math.PI / 180;
  const Y = Vec(0, 1, 0);
  const XA = Vec(1, 0, 0);

  const C = {
    coral: "#e8765b",
    coralDeep: "#d4614a",
    lid: "#c9563f",
    rust: "#b4452e",
    rustDeep: "#8e3220",
    pale: "#f5cdb0",
    paleWarm: "#f0b893",
    cream: "#f8e8c8",
    gold: "#f3b52e",
    goldDeep: "#c9861b",
    pupil: "#1b1311",
    white: "#fffaf0",
    brass: "#d6a83e",
    brassDeep: "#94701f",
    verdigris: "#5fa88e",
    beak: "#2a1a14",
    web: "#d86a50",
  };
  const armShades = ["#e8765b", "#de6a51", "#d05e47", "#c2523d", "#b14631"];

  // Seat any geometry: its lowest point (along dir) goes on the anchor, so the
  // result is the same whether the SDK seats by origin or by base.
  const put = (geo: THREE.BufferGeometry, color: string, center: V3, dir: V3 = Y) => {
    const d = dir.clone().normalize();
    geo.computeBoundingBox();
    const minY = geo.boundingBox!.min.y;
    geo.translate(0, -minY, 0);
    const a = center.clone().addScaledVector(d, minY);
    return b.stick(geo, color, frame([a.x, a.y, a.z], [d.x, d.y, d.z]));
  };
  const spot = (p: V3, n: V3, s: number, color: string, flat = 0.22) => {
    const g = new THREE.SphereGeometry(1, 7, 4);
    g.scale(s, s * flat, s);
    put(g, color, p.clone().addScaledVector(n, -s * flat * 0.35), n);
  };
  const bump = (p: V3, n: V3, s: number, color: string) => {
    put(new THREE.IcosahedronGeometry(s, 0), color, p.clone().addScaledVector(n, -s * 0.3), n);
  };

  // ---------------- arm centrelines ----------------
  const NS = 9;
  const LEN = 0.34;
  const ds = LEN / NS;
  const R0 = 0.045;
  const radAt = (i: number) => 0.024 * (1 - 0.8 * (i / NS));
  const types = ["up", "side", "up", "side", "side", "up", "side", "key"];

  type Arm = { name: string; R: V3; T: V3; pts: V3[]; dirs: V3[]; ups: V3[]; type: string };
  const arms: Arm[] = [];
  for (let k = 0; k < 8; k++) {
    const th = (22.5 + 45 * k) * D;
    const R = Vec(Math.sin(th), 0, Math.cos(th));
    const T = Vec(Math.cos(th), 0, -Math.sin(th));
    const type = types[k];
    const sdir = k % 4 < 2 ? 1 : -1;
    let pitch: number[];
    let yaw: number[];
    if (type === "up") {
      pitch = [-40, -20, -3, 0, 0, 12, 45, 95, 150];
      yaw = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    } else if (type === "side") {
      pitch = [-40, -20, -3, 0, 0, 3, 8, 14, 20];
      yaw = [0, 0, 0, 0, 12, 35, 70, 115, 165].map((a) => a * sdir);
    } else {
      pitch = [-10, 20, 45, 65, 78, 85, 88, 90, 95];
      yaw = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    if (type !== "key") {
      for (let i = 0; i < NS; i++) {
        if (i >= 5) pitch[i] += (rnd() - 0.5) * (type === "up" ? 16 : 6);
        if (i >= 2) yaw[i] += (rnd() - 0.5) * 14;
      }
    }
    const pts: V3[] = [R.clone().multiplyScalar(R0)];
    const dirs: V3[] = [];
    const ups: V3[] = [];
    for (let i = 0; i < NS; i++) {
      const p = pitch[i] * D;
      const y = yaw[i] * D;
      const d = R.clone()
        .multiplyScalar(Math.cos(p) * Math.cos(y))
        .addScaledVector(Y, Math.sin(p))
        .addScaledVector(T, Math.cos(p) * Math.sin(y))
        .normalize();
      const u = R.clone()
        .multiplyScalar(-Math.sin(p) * Math.cos(y))
        .addScaledVector(Y, Math.cos(p))
        .addScaledVector(T, -Math.sin(p) * Math.sin(y))
        .normalize();
      dirs.push(d);
      ups.push(u);
      pts.push(pts[i].clone().addScaledVector(d, ds));
    }
    const name = k < 4 ? `armL${k + 1}` : `armR${8 - k}`;
    arms.push({ name, R, T, pts, dirs, ups, type });
  }

  // ground the whole creature on its arms
  let minB = Infinity;
  for (const a of arms) a.pts.forEach((p, i) => (minB = Math.min(minB, p.y - radAt(i))));
  const H = -minB - 0.002;
  for (const a of arms) a.pts.forEach((p) => (p.y += H));

  // ---------------- body layout ----------------
  const hc = Vec(0, H + 0.055, 0.025);
  const hr = Vec(0.066, 0.05, 0.062);
  const nc = Vec(0, H + 0.085, -0.02);
  const nr = Vec(0.062, 0.05, 0.06);
  const mc = Vec(0, H + 0.15, -0.06);
  const mr = Vec(0.072, 0.092, 0.085);
  const mTilt = -0.45;

  const eyeData = [1, -1].map((s) => {
    const a = 45 * D * s;
    const e = 32 * D;
    const n = Vec(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a));
    const p = Vec(hr.x * n.x, hr.y * n.y, hr.z * n.z).add(hc);
    return { s, a, e, n, p };
  });

  // ---------------- skeleton ----------------
  const body = b.joint("body", { at: [0, H, 0] });
  const head = b.joint("head", { at: [hc.x, hc.y, hc.z], parent: body });
  const m1 = b.joint("mantle1", { at: [0, H + 0.09, -0.03], parent: head });
  const m2 = b.joint("mantle2", { at: [0, H + 0.15, -0.06], parent: m1 });
  b.joint("mantle3", { at: [0, H + 0.23, -0.1], parent: m2 });
  for (const ed of eyeData) {
    b.joint(ed.s > 0 ? "eyeL" : "eyeR", { at: [ed.p.x, ed.p.y, ed.p.z], parent: head });
  }
  const beak = b.joint("beak", { at: [0, H - 0.012, 0.01], parent: body });
  b.joint("jaw", { at: [0, H - 0.018, -0.004], parent: beak });
  for (const a of arms) {
    let parent: any = body;
    a.pts.forEach((p, i) => {
      parent = b.joint(`${a.name}_${i}`, { at: [p.x, p.y, p.z], parent });
    });
  }

  // ---------------- body geometry ----------------
  {
    const g = new THREE.IcosahedronGeometry(1, 2);
    g.scale(mr.x, mr.y, mr.z);
    g.rotateX(mTilt);
    put(g, C.coral, mc.clone());
  }
  {
    const g = new THREE.IcosahedronGeometry(1, 2);
    g.scale(nr.x, nr.y, nr.z);
    put(g, C.coral, nc.clone());
  }
  {
    const g = new THREE.IcosahedronGeometry(1, 2);
    g.scale(hr.x, hr.y, hr.z);
    put(g, C.coral, hc.clone());
  }
  {
    // webbing skirt, octagon corners lined up with the arms
    const g = new THREE.CylinderGeometry(0.05, 0.088, 0.04, 8, 1);
    g.rotateY(22.5 * D);
    put(g, C.web, Vec(0, H - 0.005, 0));
    const g2 = new THREE.CylinderGeometry(0.03, 0.05, 0.01, 8, 1);
    g2.rotateY(22.5 * D);
    put(g2, C.coralDeep, Vec(0, H - 0.028, 0));
  }
  // beak peeking from underneath
  {
    const g = new THREE.ConeGeometry(0.008, 0.014, 6);
    g.rotateX(Math.PI);
    put(g, C.beak, Vec(0, H - 0.034, 0.008));
    const g2 = new THREE.ConeGeometry(0.006, 0.01, 6);
    g2.rotateX(Math.PI);
    put(g2, C.beak, Vec(0, H - 0.034, -0.004));
  }
  // siphon on the right flank
  {
    const sd = Vec(-0.9, -0.15, -0.25).normalize();
    const base = Vec(nc.x - nr.x * 0.95, nc.y - 0.005, nc.z - 0.01);
    put(new THREE.CylinderGeometry(0.008, 0.011, 0.03, 8, 1), C.coralDeep, base.clone().addScaledVector(sd, 0.012), sd);
    const lip = new THREE.TorusGeometry(0.008, 0.0028, 4, 10);
    lip.rotateX(Math.PI / 2);
    put(lip, C.rust, base.clone().addScaledVector(sd, 0.027), sd);
  }

  // ---------------- eyes & grumpy brows ----------------
  for (const { s, a, e, n, p } of eyeData) {
    const gc = p.clone().addScaledVector(n, 0.009);
    const outward = Vec(Math.cos(a), 0, -Math.sin(a)).multiplyScalar(s);
    put(new THREE.SphereGeometry(0.022, 10, 7), C.coralDeep, p.clone().addScaledVector(n, 0.002));
    put(new THREE.SphereGeometry(0.017, 12, 8), C.gold, gc.clone());
    const ir = new THREE.TorusGeometry(0.0125, 0.0016, 4, 16);
    ir.rotateX(-e);
    ir.rotateY(a);
    put(ir, C.goldDeep, gc.clone().addScaledVector(n, 0.0112));
    const pg = new THREE.CapsuleGeometry(0.0034, 0.012, 2, 6);
    pg.rotateZ(Math.PI / 2);
    pg.scale(1, 1, 0.45);
    pg.rotateX(-e);
    pg.rotateY(a);
    put(pg, C.pupil, gc.clone().addScaledVector(n, 0.0163));
    put(
      new THREE.SphereGeometry(0.0028, 6, 4),
      C.white,
      gc.clone().addScaledVector(n, 0.0148).addScaledVector(Y, 0.0065).addScaledVector(outward, 0.004)
    );
    // heavy lid, drooping toward the inner corner
    const lid = new THREE.SphereGeometry(0.0196, 12, 5, 0, Math.PI * 2, 0, 0.33 * Math.PI);
    lid.rotateX(0.26);
    lid.rotateZ(0.3 * s);
    lid.rotateX(-e);
    lid.rotateY(a);
    put(lid, C.lid, gc.clone());
    // slanted brow ridge
    const brow = new THREE.CapsuleGeometry(0.0055, 0.026, 2, 6);
    brow.rotateZ(Math.PI / 2 + 0.38 * s);
    brow.rotateY(a);
    put(brow, C.rustDeep, gc.clone().addScaledVector(Y, 0.019).addScaledVector(n, 0.004));
    // little papilla horn
    const hd = Y.clone().addScaledVector(n, 0.4).addScaledVector(outward, 0.3).normalize();
    const hb = gc.clone().addScaledVector(Y, 0.021).addScaledVector(outward, 0.012);
    put(new THREE.ConeGeometry(0.0045, 0.016, 5), C.rust, hb.addScaledVector(hd, 0.008), hd);
  }

  // ---------------- mantle & head texture ----------------
  const insideEll = (p: V3, c: V3, r: V3) => {
    const dx = (p.x - c.x) / r.x, dy = (p.y - c.y) / r.y, dz = (p.z - c.z) / r.z;
    return dx * dx + dy * dy + dz * dz < 0.98;
  };
  const ellPoint = (c: V3, r: V3, tilt: number, phi: number, cosT: number) => {
    const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
    const lp = Vec(r.x * sinT * Math.cos(phi), r.y * cosT, r.z * sinT * Math.sin(phi));
    const ln = Vec(lp.x / (r.x * r.x), lp.y / (r.y * r.y), lp.z / (r.z * r.z)).normalize();
    lp.applyAxisAngle(XA, tilt);
    ln.applyAxisAngle(XA, tilt);
    return { p: lp.add(c), n: ln };
  };

  // mantle mottles, rust patches and bumps
  let placed = 0;
  for (let i = 0; i < 400 && placed < 140; i++) {
    const h = ellPoint(mc, mr, mTilt, rr(0, Math.PI * 2), rr(-0.4, 1));
    if (insideEll(h.p, hc, hr) || insideEll(h.p, nc, nr)) continue;
    const kind = placed % 7;
    if (kind < 2) spot(h.p, h.n, rr(0.006, 0.013), rnd() < 0.7 ? C.pale : C.paleWarm);
    else if (kind === 2) spot(h.p, h.n, rr(0.01, 0.018), C.rust, 0.18);
    else bump(h.p, h.n, rr(0.0035, 0.0065), rnd() < 0.6 ? C.coralDeep : C.pale);
    placed++;
  }
  // pale dorsal spots along the mantle midline
  for (let i = 0; i < 7; i++) {
    const ang = 0.9 - (i / 6) * 2.3;
    const lp = Vec(0, mr.y * Math.cos(ang), mr.z * Math.sin(ang));
    const ln = Vec(0, lp.y / (mr.y * mr.y), lp.z / (mr.z * mr.z)).normalize();
    lp.applyAxisAngle(XA, mTilt);
    ln.applyAxisAngle(XA, mTilt);
    spot(lp.add(mc), ln, 0.008 - i * 0.0005, C.cream, 0.25);
  }
  // head / neck texture
  placed = 0;
  for (let i = 0; i < 300 && placed < 40; i++) {
    const useHead = rnd() < 0.6;
    const c = useHead ? hc : nc, r = useHead ? hr : nr;
    const h = ellPoint(c, r, 0, rr(0, Math.PI * 2), rr(-0.1, 0.9));
    if (eyeData.some((ed) => ed.p.distanceTo(h.p) < 0.032)) continue;
    if (insideEll(h.p, mc, Vec(mr.x * 0.97, mr.y * 0.97, mr.z * 0.97))) continue;
    if (useHead ? insideEll(h.p, nc, nr) : insideEll(h.p, hc, hr)) continue;
    if (placed % 3 === 0) spot(h.p, h.n, rr(0.005, 0.01), C.pale);
    else bump(h.p, h.n, rr(0.003, 0.0055), C.coralDeep);
    placed++;
  }

  // ---------------- arms ----------------
  for (const a of arms) {
    a.pts.forEach((p, i) => {
      const shade = armShades[Math.min(4, Math.floor((i / (NS + 1)) * 5))];
      put(new THREE.SphereGeometry(radAt(i), 8, 6), shade, p.clone());
    });
    for (let i = 0; i < NS; i++) {
      const d = a.dirs[i];
      const u = a.ups[i];
      const side = d.clone().cross(u).normalize();
      const shade = armShades[Math.min(4, Math.floor(((i + 0.5) / (NS + 1)) * 5))];
      const mid = a.pts[i].clone().addScaledVector(d, ds / 2);
      put(new THREE.CylinderGeometry(radAt(i + 1), radAt(i), ds, 8, 1), shade, mid, d);

      // sucker rows on both sides of the underside
      if (i >= 1) {
        const rows: [number, number[]][] = [
          [1, [0.25, 0.75]],
          [-1, [0.5, 1.0]],
        ];
        for (const [sg, fs] of rows) {
          for (const f of fs) {
            const c = a.pts[i].clone().addScaledVector(d, ds * f);
            const r = radAt(i) + (radAt(i + 1) - radAt(i)) * f;
            const n = u.clone().multiplyScalar(-Math.cos(55 * D)).addScaledVector(side, sg * Math.sin(55 * D)).normalize();
            const g = new THREE.TorusGeometry(r * 0.36, r * 0.15, 4, 8);
            g.rotateX(Math.PI / 2);
            put(g, C.cream, c.addScaledVector(n, r * 0.96), n);
          }
        }
      }
      // mottles and bumps on the dorsal side
      {
        const ang = (rnd() - 0.5) * 1.6;
        const n = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang)).normalize();
        const r = (radAt(i) + radAt(i + 1)) / 2;
        const c = a.pts[i].clone().addScaledVector(d, ds * rr(0.3, 0.7)).addScaledVector(n, r * 0.97);
        spot(c, n, r * rr(0.35, 0.6), rnd() < 0.75 ? C.pale : C.rustDeep);
        const ang2 = (rnd() - 0.5) * 2.2;
        const n2 = u.clone().multiplyScalar(Math.cos(ang2)).addScaledVector(side, Math.sin(ang2)).normalize();
        const c2 = a.pts[i].clone().addScaledVector(d, ds * rr(0.1, 0.9)).addScaledVector(n2, r * 0.97);
        bump(c2, n2, r * 0.17, C.coralDeep);
      }
    }
  }

  // ---------------- the old brass key ----------------
  const keyArm = arms.find((a) => a.type === "key")!;
  const G = keyArm.pts[8];
  const K = G.clone().addScaledVector(keyArm.T, radAt(8) + 0.0055);
  const at = (x: number, y: number, z: number) => K.clone().add(Vec(x, y, z));
  // shaft
  put(new THREE.CylinderGeometry(0.0042, 0.0042, 0.085, 8, 1), C.brass, at(0, -0.0075, 0));
  put(new THREE.SphereGeometry(0.0046, 8, 5), C.brass, at(0, -0.05, 0));
  // bow (facing the viewer) with an inner boss
  put(new THREE.TorusGeometry(0.014, 0.0038, 6, 14), C.brass, at(0, 0.051, 0));
  {
    const cross = new THREE.BoxGeometry(0.022, 0.0035, 0.004);
    put(cross, C.brassDeep, at(0, 0.051, 0));
    const cross2 = new THREE.BoxGeometry(0.0035, 0.022, 0.004);
    put(cross2, C.brassDeep, at(0, 0.051, 0));
    put(new THREE.SphereGeometry(0.0045, 8, 5), C.brass, at(0, 0.051, 0));
    put(new THREE.SphereGeometry(0.003, 6, 4), C.brass, at(0, 0.069, 0));
  }
  // collar rings
  for (const yy of [0.034, 0.028]) {
    const g = new THREE.TorusGeometry(0.006, 0.002, 4, 10);
    g.rotateX(Math.PI / 2);
    put(g, C.brassDeep, at(0, yy, 0));
  }
  // bit with teeth
  put(new THREE.BoxGeometry(0.016, 0.018, 0.0042), C.brass, at(-0.011, -0.039, 0));
  put(new THREE.BoxGeometry(0.0045, 0.007, 0.0042), C.brass, at(-0.007, -0.051, 0));
  put(new THREE.BoxGeometry(0.0045, 0.005, 0.0042), C.brass, at(-0.015, -0.050, 0));
  put(new THREE.BoxGeometry(0.003, 0.012, 0.0046), C.brassDeep, at(-0.012, -0.038, 0));
  // verdigris flecks from the shipwreck
  for (const q of [
    [0.012, 0.058, 0.002],
    [-0.01, 0.043, 0.002],
    [-0.016, -0.034, 0.0022],
    [0, -0.02, 0.0042],
    [-0.006, -0.045, 0.0022],
  ]) {
    put(new THREE.SphereGeometry(0.0022, 6, 4), C.verdigris, at(q[0], q[1], q[2]));
  }
  // the arm tip coiled round the shaft
  for (const yy of [-0.006, 0.006, 0.017]) {
    const g = new THREE.TorusGeometry(0.0085, 0.0042, 5, 10);
    g.rotateX(Math.PI / 2);
    put(g, armShades[4], at(0, yy, 0));
  }
  {
    const g = new THREE.TorusGeometry(0.0035, 0.0014, 4, 8);
    put(g, C.cream, at(0.004, -0.006, 0.0115));
    const g2 = new THREE.TorusGeometry(0.003, 0.0012, 4, 8);
    put(g2, C.cream, at(0.003, 0.006, 0.011));
  }

  return b.root;
}
