import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

export const meta = {
  name: "Battle-worn Griffin Knight",
  description:
    "A stylized low-poly knight in dented, scratched plate: great helm with a narrow eye slit and gold cross, tall crimson plume, tiered pauldrons with gold filigree, deep-blue surcoat with a silver griffin, a kite shield bearing the same griffin (an arrow still stuck in it), a broadsword, and a torn crimson cape. Built on a T-pose rig.",
};

const C = {
  steel: "#8f99a5",
  steelDk: "#5d6570",
  blade: "#c8d0d9",
  fuller: "#737c87",
  scratch: "#eef3f8",
  dent: "#4b525b",
  gold: "#d9a634",
  goldDk: "#a5781d",
  blue: "#1c3580",
  blueDk: "#0f1f4d",
  rip: "#070e24",
  silver: "#e6eaf0",
  crimson: "#b5162c",
  crimsonDk: "#6b0a18",
  leather: "#5b3a22",
  leatherDk: "#33210f",
  mail: "#6e7680",
  black: "#0b0d11",
  wood: "#6a4a2c",
  feather: "#efe9dc",
  gem: "#d0102e",
};

function makeRand(seed: number): () => number {
  let s = seed >>> 0;
  const fallback = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  try {
    const r: any = (rng as any)(seed);
    const cands: Array<() => any> = [];
    if (typeof r === "function") cands.push(() => r());
    if (r && typeof r.next === "function") cands.push(() => r.next());
    if (r && typeof r.float === "function") cands.push(() => r.float());
    if (r && typeof r.random === "function") cands.push(() => r.random());
    for (const c of cands) {
      const v = c();
      if (typeof v === "number" && v >= 0 && v < 1) {
        return () => {
          const x = c();
          return typeof x === "number" ? x : fallback();
        };
      }
    }
  } catch (e) {
    /* fall through */
  }
  return fallback;
}

export default function build() {
  const b = createBuilder({ name: "griffinKnight" });
  const rand = makeRand(4242);
  const PI = Math.PI;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const spine = b.joint("spine", { at: [0, 1.18, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.36, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.56, 0], parent: chest });
  const head = b.joint("head", { at: [0, 1.66, 0], parent: neck });
  b.joint("headTop", { at: [0, 1.97, 0], parent: head });

  const sides: Array<[number, string]> = [
    [1, "L"],
    [-1, "R"],
  ];
  const handJ: Record<string, any> = {};
  const elbowJ: Record<string, any> = {};
  for (const [s, n] of sides) {
    const clav = b.joint("clavicle" + n, { at: [s * 0.1, 1.5, 0], parent: chest });
    const sh = b.joint("shoulder" + n, { at: [s * 0.26, 1.5, 0], parent: clav });
    const el = b.joint("elbow" + n, { at: [s * 0.56, 1.5, 0], parent: sh });
    const wr = b.joint("wrist" + n, { at: [s * 0.83, 1.5, 0], parent: el });
    b.joint("hand" + n, { at: [s * 0.97, 1.5, 0], parent: wr });
    handJ[n] = wr;
    elbowJ[n] = el;
    const hip = b.joint("hip" + n, { at: [s * 0.11, 0.96, 0], parent: hips });
    const knee = b.joint("knee" + n, { at: [s * 0.12, 0.52, 0], parent: hip });
    const ankle = b.joint("ankle" + n, { at: [s * 0.13, 0.1, 0], parent: knee });
    b.joint("toe" + n, { at: [s * 0.13, 0.03, 0.17], parent: ankle });
  }
  const cape0 = b.joint("cape0", { at: [0, 1.52, -0.2], parent: chest });
  const cape1 = b.joint("cape1", { at: [0, 1.12, -0.27], parent: cape0 });
  const cape2 = b.joint("cape2", { at: [0, 0.72, -0.32], parent: cape1 });
  b.joint("cape3", { at: [0, 0.3, -0.37], parent: cape2 });
  const sword = b.joint("sword", { at: [-0.9, 1.5, 0], parent: handJ["R"] });
  b.joint("swordTip", { at: [-0.9, 0.5, 0], parent: sword });
  const shieldJ = b.joint("shield", { at: [0.84, 1.88, 0.14], parent: elbowJ["L"] });
  b.joint("shieldTip", { at: [0.84, 0.78, 0.14], parent: shieldJ });

  // ---------------------------------------------------------------- helpers
  const add = (geo: THREE.BufferGeometry, color: string) => {
    geo.clearGroups();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const ax = (bb.min.x + bb.max.x) / 2;
    const ay = bb.min.y;
    const az = (bb.min.z + bb.max.z) / 2;
    geo.translate(-ax, -ay, -az);
    b.stick(geo, color, frame([ax, ay, az], [0, 1, 0]));
  };

  const basisZ = (nIn: THREE.Vector3) => {
    const z = nIn.clone().normalize();
    const hint = Math.abs(z.y) > 0.95 ? V(1, 0, 0) : V(0, 1, 0);
    const x = new THREE.Vector3().crossVectors(hint, z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x);
    return new THREE.Matrix4().makeBasis(x, y, z);
  };
  const basisY = (dIn: THREE.Vector3) => {
    const y = dIn.clone().normalize();
    const hint = Math.abs(y.z) > 0.9 ? V(0, 1, 0) : V(0, 0, 1);
    const x = new THREE.Vector3().crossVectors(y, hint).normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    return new THREE.Matrix4().makeBasis(x, y, z);
  };
  const placeZ = (g: THREE.BufferGeometry, p: THREE.Vector3, n: THREE.Vector3, spin = 0) => {
    g.rotateZ(spin);
    g.applyMatrix4(basisZ(n));
    g.translate(p.x, p.y, p.z);
    return g;
  };

  const tube = (
    a: number[],
    c: number[],
    ra: number,
    rc: number,
    seg: number,
    color: string,
    zs = 1,
    open = false,
  ) => {
    const A = V(a[0], a[1], a[2]);
    const B = V(c[0], c[1], c[2]);
    const d = B.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(rc, ra, len, seg, 1, open, PI / seg);
    g.translate(0, len / 2, 0);
    if (zs !== 1) g.scale(1, 1, zs);
    g.applyMatrix4(basisY(d));
    g.translate(A.x, A.y, A.z);
    add(g, color);
  };
  const box = (size: number[], at: number[], color: string, rot: number[] = [0, 0, 0]) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
    g.translate(at[0], at[1], at[2]);
    add(g, color);
  };
  const ball = (at: number[], r: number, color: string, ws = 6, hs = 4, sc: number[] = [1, 1, 1]) => {
    const g = new THREE.SphereGeometry(r, ws, hs);
    g.scale(sc[0], sc[1], sc[2]);
    g.translate(at[0], at[1], at[2]);
    add(g, color);
  };
  const ringX = (x: number, y: number, z: number, r: number, t: number, color: string) => {
    const g = new THREE.TorusGeometry(r, t, 3, 12);
    g.rotateY(PI / 2);
    g.translate(x, y, z);
    add(g, color);
  };
  const ringY = (x: number, y: number, z: number, r: number, t: number, color: string, zs = 1) => {
    const g = new THREE.TorusGeometry(r, t, 3, 14);
    g.rotateX(PI / 2);
    g.scale(1, 1, zs);
    g.translate(x, y, z);
    add(g, color);
  };
  const scratch = (p: THREE.Vector3, n: THREE.Vector3, len: number, ang: number) => {
    const g = new THREE.BoxGeometry(len, 0.0035, 0.003);
    add(placeZ(g, p.clone().addScaledVector(n.clone().normalize(), 0.001), n, ang), C.scratch);
  };
  const dent = (p: THREE.Vector3, n: THREE.Vector3, r: number) => {
    const g = new THREE.SphereGeometry(r, 7, 3);
    g.scale(1, 1, 0.15);
    add(placeZ(g, p, n, rand() * 3), C.dent);
    const h = new THREE.TorusGeometry(r * 0.95, 0.0025, 3, 6, PI * 0.9);
    add(placeZ(h, p.clone().addScaledVector(n.clone().normalize(), 0.001), n, 0.4 + rand()), C.scratch);
  };
  const flip = (g: THREE.BufferGeometry) => {
    const n = g.index ? g.toNonIndexed() : g.clone();
    const p = n.getAttribute("position") as THREE.BufferAttribute;
    const uv = n.getAttribute("uv") as THREE.BufferAttribute | undefined;
    for (let i = 0; i < p.count; i += 3) {
      const x = p.getX(i + 1), y = p.getY(i + 1), z = p.getZ(i + 1);
      p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2));
      p.setXYZ(i + 2, x, y, z);
      if (uv) {
        const u = uv.getX(i + 1), v = uv.getY(i + 1);
        uv.setXY(i + 1, uv.getX(i + 2), uv.getY(i + 2));
        uv.setXY(i + 2, u, v);
      }
    }
    n.deleteAttribute("normal");
    n.computeVertexNormals();
    return n;
  };

  // griffin rampant silhouette (unit box), facing dexter when flipped
  const griffinPts: number[][] = [
    [0.84, 0.84], [0.76, 0.8], [0.68, 0.78], [0.64, 0.68], [0.6, 0.6], [0.76, 0.7], [0.84, 0.76],
    [0.86, 0.7], [0.8, 0.66], [0.7, 0.6], [0.62, 0.52], [0.74, 0.46], [0.8, 0.5], [0.81, 0.44],
    [0.66, 0.4], [0.58, 0.34], [0.64, 0.2], [0.72, 0.1], [0.76, 0.04], [0.6, 0.04], [0.54, 0.16],
    [0.47, 0.26], [0.42, 0.12], [0.44, 0.02], [0.3, 0.02], [0.33, 0.14], [0.34, 0.28], [0.2, 0.24],
    [0.1, 0.3], [0.06, 0.42], [0.1, 0.5], [0.12, 0.4], [0.16, 0.33], [0.22, 0.32], [0.35, 0.4],
    [0.4, 0.52], [0.3, 0.6], [0.16, 0.9], [0.28, 0.84], [0.3, 0.98], [0.4, 0.86], [0.46, 0.98],
    [0.52, 0.82], [0.52, 0.7], [0.56, 0.8], [0.58, 0.9], [0.62, 0.97], [0.66, 0.92], [0.74, 0.91],
    [0.8, 0.88],
  ];
  const griffin = (scale: number, flipX: boolean) => {
    const f = flipX ? -1 : 1;
    const sh = new THREE.Shape(griffinPts.map((p) => new THREE.Vector2((p[0] - 0.46) * scale * f, (p[1] - 0.5) * scale)));
    const eye = new THREE.Path();
    eye.absarc((0.665 - 0.46) * scale * f, (0.86 - 0.5) * scale, 0.022 * scale, 0, PI * 2, false);
    sh.holes.push(eye);
    return sh;
  };

  // ---------------------------------------------------------------- legs
  for (const [s] of sides) {
    const x0 = s * 0.13;
    // sabaton
    box([0.118, 0.022, 0.3], [x0, 0.011, 0.045], C.leatherDk);
    box([0.11, 0.08, 0.11], [x0, 0.062, -0.035], C.steel);
    for (let k = 0; k < 3; k++) {
      const z = 0.035 + k * 0.05;
      const h = 0.07 - k * 0.013;
      const w = 0.108 - k * 0.006;
      box([w, h, 0.06], [x0, 0.022 + h / 2, z], C.steel);
      box([w + 0.002, 0.008, 0.008], [x0, 0.022 + h - 0.003, z + 0.03], C.gold);
    }
    {
      const g = new THREE.ConeGeometry(0.05, 0.075, 4);
      g.rotateY(PI / 4);
      g.rotateX(PI / 2);
      g.scale(1, 0.5, 1);
      g.translate(x0, 0.046, 0.2);
      add(g, C.steel);
    }
    ball([x0 + s * 0.056, 0.06, -0.02], 0.012, C.gold);
    // ankle mail + greave
    tube([x0, 0.09, 0], [x0, 0.15, 0], 0.052, 0.05, 8, C.mail);
    tube([x0, 0.12, 0], [s * 0.122, 0.5, 0], 0.058, 0.072, 8, C.steel);
    box([0.009, 0.34, 0.006], [s * 0.126, 0.31, 0.062], C.steelDk);
    ringY(s * 0.123, 0.485, 0, 0.073, 0.007, C.gold);
    ringY(s * 0.129, 0.15, 0, 0.06, 0.006, C.gold);
    scratch(V(s * 0.115, 0.28, 0.06), V(0, 0, 1), 0.06, 0.6 * s);
    scratch(V(s * 0.135, 0.36, 0.062), V(0, 0, 1), 0.04, -0.4);
    if (s < 0) dent(V(s * 0.126, 0.22, 0.058), V(0, 0, 1), 0.018);
    // knee
    ball([s * 0.12, 0.53, 0.03], 0.072, C.steel, 8, 5, [1, 0.9, 1]);
    {
      const g = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8);
      g.rotateZ(PI / 2);
      g.translate(s * 0.192, 0.53, 0.02);
      add(g, C.steel);
      const r = new THREE.TorusGeometry(0.05, 0.006, 3, 12);
      r.rotateY(PI / 2);
      r.translate(s * 0.199, 0.53, 0.02);
      add(r, C.gold);
    }
    ball([s * 0.12, 0.54, 0.1], 0.013, C.gold);
    // cuisse
    tube([s * 0.118, 0.58, 0], [s * 0.112, 0.93, 0], 0.072, 0.088, 8, C.steel);
    ringY(s * 0.118, 0.6, 0, 0.074, 0.006, C.gold);
  }

  // ---------------------------------------------------------------- torso
  // mail skirt halves
  for (const [s] of sides) {
    const g = new THREE.CylinderGeometry(0.19, 0.225, 0.24, 4, 1, false, s > 0 ? 0 : PI, PI);
    g.scale(1, 1, 0.76);
    g.translate(0, 0.9, 0);
    add(g, C.mail);
  }
  // surcoat skirt flaps, torn hem
  const flapCenters = [PI / 4, (3 * PI) / 4, (5 * PI) / 4, (7 * PI) / 4];
  for (const fc of flapCenters) {
    const half = (40 * PI) / 180;
    const g = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 3, 2, true, fc - half, half * 2);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) < -0.24) p.setY(i, p.getY(i) - rand() * 0.09);
    }
    g.computeVertexNormals();
    g.translate(0, 0.77, 0);
    g.scale(1, 1, 0.78);
    const lining = g.clone();
    lining.scale(0.965, 1, 0.965);
    add(g, C.blue);
    add(flip(lining), C.blueDk);
    for (const e of [fc - half, fc + half]) {
      tube(
        [0.204 * Math.sin(e), 1.02, 0.204 * Math.cos(e) * 0.78],
        [0.307 * Math.sin(e), 0.57, 0.307 * Math.cos(e) * 0.78],
        0.007, 0.007, 4, C.gold,
      );
    }
    // gold lozenge embroidery
    const yl = 0.72;
    const rl = 0.2 + 0.1 * ((1.02 - yl) / 0.5) + 0.004;
    const pp = V(rl * Math.sin(fc), yl, rl * Math.cos(fc) * 0.78);
    const nn = V(Math.sin(fc), 0.2, Math.cos(fc) * 1.28).normalize();
    const lz = new THREE.CylinderGeometry(0.032, 0.032, 0.006, 4);
    lz.rotateX(PI / 2);
    add(placeZ(lz, pp, nn), C.gold);
  }
  // surcoat body (hexagonal, blocky)
  const rAt = (y: number) => 0.22 + 0.03 * ((y - 1.02) / 0.48);
  tube([0, 1.02, 0], [0, 1.28, 0], rAt(1.02), rAt(1.28), 6, C.blue, 0.72);
  tube([0, 1.26, 0], [0, 1.5, 0], rAt(1.26), rAt(1.5), 6, C.blue, 0.72);
  tube([0, 1.485, 0], [0, 1.51, 0], 0.2535, 0.2535, 6, C.gold, 0.72);
  // steel shoulder cap and gorget
  tube([0, 1.49, 0], [0, 1.58, 0], 0.252, 0.15, 6, C.steel, 0.72);
  tube([0, 1.53, 0], [0, 1.65, 0], 0.118, 0.1, 8, C.steel);
  ringY(0, 1.645, 0, 0.1, 0.007, C.gold);
  // chest griffin emblem
  {
    const fz = (y: number) => rAt(y) * Math.cos(PI / 6) * 0.72;
    const gz = fz(1.27);
    const g = new THREE.ExtrudeGeometry(griffin(0.2, true), { depth: 0.012, bevelEnabled: false });
    g.translate(0, 1.36, gz);
    add(g, C.silver);
    const ring = new THREE.TorusGeometry(0.108, 0.007, 3, 18);
    ring.translate(0, 1.36, fz(1.36) + 0.003);
    add(ring, C.gold);
    // a slash in the surcoat
    box([0.07, 0.006, 0.004], [-0.07, 1.12, fz(1.12) + 0.001], C.rip, [0, 0, 0.5]);
    box([0.04, 0.005, 0.004], [-0.05, 1.09, fz(1.09) + 0.001], C.rip, [0, 0, 0.35]);
  }
  // belt, buckle, studs, pouch, scabbard
  tube([0, 0.99, 0], [0, 1.06, 0], 0.232, 0.232, 6, C.leather, 0.72);
  {
    const fz = 0.232 * Math.cos(PI / 6) * 0.72;
    box([0.075, 0.06, 0.012], [0, 1.025, fz + 0.004], C.gold);
    box([0.045, 0.034, 0.012], [0, 1.025, fz + 0.007], C.leatherDk);
    box([0.006, 0.04, 0.014], [0.0, 1.025, fz + 0.009], C.gold);
    for (const sx of [-0.09, -0.06, 0.06, 0.09]) ball([sx, 1.025, fz + 0.002], 0.009, C.gold);
    box([0.03, 0.12, 0.008], [0.055, 0.95, fz + 0.004], C.leather);
    box([0.032, 0.02, 0.01], [0.055, 0.89, fz + 0.004], C.gold);
  }
  box([0.05, 0.1, 0.09], [-0.258, 0.955, 0.04], C.leather);
  box([0.054, 0.04, 0.094], [-0.26, 0.995, 0.04], C.leatherDk);
  ball([-0.287, 0.98, 0.04], 0.01, C.gold);
  tube([0.27, 1.0, 0.03], [0.36, 0.33, -0.09], 0.032, 0.026, 4, C.leatherDk);
  tube([0.268, 0.98, 0.028], [0.276, 0.92, 0.018], 0.036, 0.036, 4, C.gold);
  {
    const g = new THREE.ConeGeometry(0.03, 0.07, 4);
    g.rotateX(PI);
    const d = V(0.09, -0.67, -0.12).normalize();
    g.applyMatrix4(basisY(d.clone().negate()));
    g.translate(0.365, 0.3, -0.095);
    add(g, C.gold);
  }

  // ---------------------------------------------------------------- arms
  for (const [s, n] of sides) {
    tube([s * 0.2, 1.5, 0], [s * 0.6, 1.5, 0], 0.058, 0.054, 8, C.mail);
    // pauldron dome + filigree
    const Md = new THREE.Matrix4().compose(
      V(s * 0.27, 1.535, 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -s * 0.4)),
      V(1.18, 0.85, 1.12),
    );
    const Nm = new THREE.Matrix3().getNormalMatrix(Md);
    add(new THREE.SphereGeometry(0.13, 10, 4, 0, PI * 2, 0, PI / 2).applyMatrix4(Md), C.steel);
    {
      const rim = new THREE.TorusGeometry(0.13, 0.009, 3, 20);
      rim.rotateX(PI / 2);
      add(rim.applyMatrix4(Md), C.gold);
      const crest = new THREE.TorusGeometry(0.132, 0.008, 3, 10, PI);
      add(crest.applyMatrix4(Md), C.gold);
    }
    const onDome = (az: number, el: number) => {
      const d = V(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
      const p = d.clone().multiplyScalar(0.13).applyMatrix4(Md);
      const nn = d.clone().applyMatrix3(Nm).normalize();
      return { p, n: nn };
    };
    const curls: number[][] = [
      [0.35, 0.5], [-0.35, 0.5], [PI - 0.35, 0.5], [PI + 0.35, 0.5], [s * PI / 2, 0.42], [s * PI / 2 + 0.5, 0.95],
    ];
    for (const [az, el] of curls) {
      const h = onDome(az, el);
      const t1 = new THREE.TorusGeometry(0.022, 0.0042, 3, 8, PI * 1.5);
      add(placeZ(t1, h.p.clone().addScaledVector(h.n, 0.001), h.n, rand() * 6), C.gold);
      const tangent = new THREE.Vector3().crossVectors(h.n, V(0, 1, 0)).normalize();
      const p2 = h.p.clone().addScaledVector(tangent, 0.03).addScaledVector(h.n, -0.001);
      const t2 = new THREE.TorusGeometry(0.011, 0.0035, 3, 6, PI * 1.3);
      add(placeZ(t2, p2, h.n, rand() * 6), C.gold);
      const dot = new THREE.SphereGeometry(0.007, 4, 3);
      add(placeZ(dot, h.p, h.n), C.gold);
    }
    {
      const h = onDome(s * 1.1, 0.75);
      dent(h.p, h.n, 0.022);
      const h2 = onDome(-0.2, 0.3);
      scratch(h2.p, h2.n, 0.05, 0.8);
    }
    // layered lames
    const lx = [0.42, 0.48, 0.535];
    const lr = [0.098, 0.088, 0.079];
    lx.forEach((x, k) => {
      tube([s * (x - 0.035), 1.5, 0], [s * (x + 0.035), 1.5, 0], lr[k], lr[k] * 0.95, 8, C.steel);
      ringX(s * (x + 0.032), 1.5, 0, lr[k] * 0.93, 0.0065, C.gold);
      ball([s * x, 1.5, lr[k] * 0.93], 0.009, C.gold);
      ball([s * x, 1.5 + lr[k] * 0.93, 0], 0.009, C.gold);
    });
    scratch(V(s * 0.47, 1.5, 0.083), V(0, 0, 1), 0.05, 1.0);
    // couter
    ball([s * 0.575, 1.5, 0], 0.068, C.steel, 8, 5);
    {
      const g = new THREE.CylinderGeometry(0.055, 0.055, 0.012, 8);
      g.rotateX(PI / 2);
      g.translate(s * 0.575, 1.5, -0.075);
      add(g, C.steel);
      const r = new THREE.TorusGeometry(0.055, 0.006, 3, 12);
      r.translate(s * 0.575, 1.5, -0.082);
      add(r, C.gold);
    }
    // vambrace
    tube([s * 0.6, 1.5, 0], [s * 0.8, 1.5, 0], 0.062, 0.052, 8, C.steel);
    ringX(s * 0.78, 1.5, 0, 0.053, 0.006, C.gold);
    box([0.18, 0.008, 0.006], [s * 0.7, 1.5, 0.056], C.steelDk);
    scratch(V(s * 0.66, 1.49, 0.056), V(0, 0, 1), 0.05, 0.5);
    scratch(V(s * 0.72, 1.515, 0.054), V(0, 0, 1), 0.035, -0.7);
    if (s > 0) dent(V(s * 0.68, 1.5, 0.055), V(0, 0, 1), 0.016);
    // gauntlet
    tube([s * 0.78, 1.5, 0], [s * 0.855, 1.5, 0], 0.056, 0.073, 8, C.steel);
    box([0.1, 0.085, 0.095], [s * 0.905, 1.5, 0.005], C.steel);
    box([0.1, 0.012, 0.09], [s * 0.905, 1.548, 0.005], C.steelDk);
    for (let k = 0; k < 4; k++) {
      box([0.022, 0.08, 0.016], [s * (0.87 + k * 0.024), 1.5, 0.058], C.steel);
      ball([s * (0.87 + k * 0.024), 1.53, 0.068], 0.006, C.gold);
    }
    box([0.05, 0.022, 0.04], [s * 0.875, 1.552, 0.035], C.steel);
    void n;
  }

  // ---------------------------------------------------------------- helm
  {
    const fr = (y: number) => (0.135 + 0.005 * ((y - 1.6) / 0.3)) * Math.cos(PI / 8);
    const g = new THREE.CylinderGeometry(0.14, 0.135, 0.3, 8, 1, false, PI / 8);
    g.translate(0, 1.75, 0);
    add(g, C.steel);
    const top = new THREE.CylinderGeometry(0.06, 0.14, 0.05, 8, 1, false, PI / 8);
    top.translate(0, 1.925, 0);
    add(top, C.steel);
    const brim = new THREE.CylinderGeometry(0.139, 0.139, 0.025, 8, 1, false, PI / 8);
    brim.translate(0, 1.612, 0);
    add(brim, C.steelDk);
    const brow = new THREE.CylinderGeometry(0.1435, 0.1435, 0.03, 8, 1, false, PI / 8);
    brow.translate(0, 1.845, 0);
    add(brow, C.gold);
    // narrow eye slit wrapping three facets
    const slit = new THREE.CylinderGeometry(0.142, 0.142, 0.022, 3, 1, false, -3 * PI / 8, 3 * PI / 4);
    slit.translate(0, 1.8, 0);
    add(slit, C.black);
    // gold cross strip below the slit
    box([0.03, 0.17, 0.012], [0, 1.704, fr(1.7) + 0.004], C.gold);
    for (const y of [1.64, 1.69, 1.74]) ball([0, y, fr(y) + 0.011], 0.007, C.goldDk);
    // breath holes on the right cheek facet
    const nB = V(Math.sin(-PI / 4), 0, Math.cos(-PI / 4));
    const tB = V(Math.cos(-PI / 4), 0, -Math.sin(-PI / 4));
    for (const y of [1.66, 1.7, 1.74]) {
      for (const o of [-0.03, 0, 0.03]) {
        const h = new THREE.CylinderGeometry(0.0075, 0.0075, 0.006, 6);
        h.rotateX(PI / 2);
        const p = nB.clone().multiplyScalar(fr(y)).add(tB.clone().multiplyScalar(o)).setY(y);
        add(placeZ(h, p, nB), C.black);
      }
    }
    // battle damage
    const nL = V(Math.sin(PI / 4), 0, Math.cos(PI / 4));
    dent(nL.clone().multiplyScalar(fr(1.72)).setY(1.72), nL, 0.026);
    scratch(V(0.04, 1.7, fr(1.7)), V(0, 0, 1), 0.07, 0.55);
    scratch(V(-0.03, 1.66, fr(1.66)), V(0, 0, 1), 0.05, -0.3);
    scratch(V(0.02, 1.88, fr(1.88)), V(0, 0, 1), 0.06, 0.15);
    // plume holder
    tube([0, 1.945, 0], [0, 1.995, 0], 0.028, 0.022, 6, C.gold);
    ringY(0, 1.95, 0, 0.03, 0.006, C.goldDk);
  }
  // plume
  {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const L = 0.42 - 0.12 * t + rand() * 0.04;
      const w = 0.032 + rand() * 0.01;
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.bezierCurveTo(w, L * 0.2, w * 0.9, L * 0.7, 0, L);
      sh.bezierCurveTo(-w * 0.9, L * 0.7, -w, L * 0.2, 0, 0);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false, curveSegments: 4 });
      g.translate(0, 0, -0.006);
      const p = g.getAttribute("position") as THREE.BufferAttribute;
      for (let k = 0; k < p.count; k++) {
        const yy = p.getY(k) / L;
        p.setZ(k, p.getZ(k) - 0.22 * yy * yy * L);
      }
      g.computeVertexNormals();
      g.rotateY((rand() - 0.5) * 0.6);
      g.rotateX(-0.05 - 1.15 * t);
      g.rotateZ(((i % 3) - 1) * 0.17 + (rand() - 0.5) * 0.08);
      g.translate(0, 1.985, -0.005);
      add(g, i % 2 === 0 ? C.crimson : C.crimsonDk);
    }
  }

  // ---------------------------------------------------------------- cape
  {
    const N = 12;
    const Mr = 9;
    const Ls: number[] = [];
    for (let i = 0; i <= N; i++) {
      let L = 1.22 - rand() * 0.16;
      if (i === 3 || i === 9) L -= 0.26;
      if (i === 6) L -= 0.1;
      Ls.push(L);
    }
    const capePos = (i: number, j: number, inner: boolean) => {
      const u = i / N;
      const v = j / Mr;
      const y = 1.57 - v * Ls[i];
      const w = 0.44 + (0.82 - 0.44) * v;
      const x = (u - 0.5) * w;
      let z =
        -0.175 - 0.22 * Math.pow(v, 1.2) - 0.07 * Math.cos((u - 0.5) * PI) * (0.4 + v) +
        0.028 * Math.sin(u * PI * 5 + 0.6) * v;
      if (inner) z += 0.009;
      return [x, y, z];
    };
    const band = (j0: number, j1: number, inner: boolean) => {
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      const cols = N + 1;
      for (let j = j0; j <= j1; j++) {
        for (let i = 0; i <= N; i++) {
          const q = capePos(i, j, inner);
          pos.push(q[0], q[1], q[2]);
          uv.push(i / N, 1 - j / Mr);
        }
      }
      for (let j = 0; j < j1 - j0; j++) {
        for (let i = 0; i < N; i++) {
          const a = j * cols + i, bb = a + 1, c = a + cols, d = c + 1;
          if (!inner) idx.push(a, bb, c, bb, d, c);
          else idx.push(a, c, bb, bb, c, d);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };
    for (const [j0, j1] of [[0, 3], [3, 6], [6, 9]]) {
      add(band(j0, j1, false), C.crimson);
      add(band(j0, j1, true), C.crimsonDk);
    }
    // rolled collar and brooches
    const col = new THREE.TorusGeometry(0.2, 0.025, 4, 10, PI);
    col.rotateX(-PI / 2);
    col.scale(1, 1, 0.8);
    col.translate(0, 1.568, 0);
    add(col, C.crimson);
    const capFront = 0.2067 * Math.cos(PI / 6) * 0.72;
    const nb = V(0, 0.7, 1).normalize();
    for (const s of [1, -1]) {
      const p = V(s * 0.075, 1.53, capFront + 0.004);
      const d = new THREE.CylinderGeometry(0.026, 0.026, 0.01, 8);
      d.rotateX(PI / 2);
      add(placeZ(d, p, nb), C.gold);
      const gm = new THREE.SphereGeometry(0.011, 6, 4);
      add(placeZ(gm, p.clone().addScaledVector(nb, 0.007), nb), C.gem);
      tube([s * 0.075, 1.525, capFront + 0.006], [0, 1.502, 0.162], 0.004, 0.004, 4, C.gold);
    }
  }

  // ---------------------------------------------------------------- sword (right hand)
  {
    const x = -0.9;
    tube([x, 1.41, 0], [x, 1.605, 0], 0.017, 0.017, 6, C.leatherDk);
    for (const y of [1.425, 1.59]) tube([x, y - 0.006, 0], [x, y + 0.006, 0], 0.021, 0.021, 6, C.gold);
    const pom = new THREE.CylinderGeometry(0.036, 0.036, 0.028, 8);
    pom.rotateX(PI / 2);
    pom.translate(x, 1.64, 0);
    add(pom, C.gold);
    const gem = new THREE.CylinderGeometry(0.014, 0.014, 0.036, 6);
    gem.rotateX(PI / 2);
    gem.translate(x, 1.64, 0);
    add(gem, C.gem);
    box([0.26, 0.026, 0.036], [x, 1.395, 0], C.gold);
    box([0.05, 0.05, 0.048], [x, 1.395, 0], C.goldDk);
    ball([x, 1.395, 0.026], 0.011, C.gem);
    for (const s of [1, -1]) {
      const o = new THREE.OctahedronGeometry(0.022);
      o.translate(x + s * 0.135, 1.395, 0);
      add(o, C.gold);
    }
    const bl = new THREE.CylinderGeometry(0.034, 0.027, 0.78, 4);
    bl.scale(1, 1, 0.22);
    bl.translate(x, 0.6 + 0.39, 0);
    add(bl, C.blade);
    const tip = new THREE.ConeGeometry(0.027, 0.12, 4);
    tip.rotateX(PI);
    tip.scale(1, 1, 0.22);
    tip.translate(x, 0.54, 0);
    add(tip, C.blade);
    for (const sz of [1, -1]) box([0.01, 0.56, 0.004], [x, 1.06, sz * 0.0062], C.fuller);
    for (const [y, sx] of [[0.92, 1], [1.14, -1], [0.74, -1]]) {
      const r = 0.027 + 0.007 * ((y - 0.6) / 0.78);
      box([0.013, 0.013, 0.012], [x + sx * r, y, 0], C.steelDk, [0, 0, PI / 4]);
    }
    scratch(V(x + 0.01, 1.2, 0.007), V(0, 0, 1), 0.05, 1.2);
  }

  // ---------------------------------------------------------------- kite shield (left arm)
  {
    const CS = V(0.84, 1.36, 0.13);
    const base = new THREE.Shape();
    base.moveTo(-0.32, 0.4);
    base.quadraticCurveTo(0, 0.5, 0.32, 0.4);
    base.bezierCurveTo(0.34, 0.0, 0.2, -0.32, 0, -0.6);
    base.bezierCurveTo(-0.2, -0.32, -0.34, 0.0, -0.32, 0.4);
    let pts = base.getPoints(5);
    if (pts.length > 2 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-6) pts = pts.slice(0, -1);
    const kite = (s: number) => new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x * s, p.y * s)));
    const kitePath = (s: number) => new THREE.Path(pts.map((p) => new THREE.Vector2(p.x * s, p.y * s)));
    const ext = (sh: THREE.Shape, depth: number, z: number, color: string, dx = 0, dy = 0) => {
      const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 });
      g.translate(CS.x + dx, CS.y + dy, z);
      add(g, color);
    };
    ext(kite(1.0), 0.02, CS.z, C.wood);
    const rim = kite(1.0);
    rim.holes.push(kitePath(0.9));
    ext(rim, 0.016, CS.z + 0.02, C.steel);
    ext(kite(0.91), 0.008, CS.z + 0.02, C.blue);
    ext(griffin(0.42, true), 0.01, CS.z + 0.028, C.silver, 0, 0.0);
    const fz = CS.z + 0.028;
    // rivets on the rim
    const rp = base.getSpacedPoints(20);
    for (let i = 0; i < rp.length - 1; i++) {
      ball([CS.x + rp[i].x * 0.95, CS.y + rp[i].y * 0.95, CS.z + 0.036], 0.011, C.gold);
    }
    // gashes and scratches
    box([0.16, 0.009, 0.004], [CS.x - 0.1, CS.y - 0.2, fz + 0.001], C.blueDk, [0, 0, 0.7]);
    box([0.16, 0.003, 0.003], [CS.x - 0.097, CS.y - 0.193, fz + 0.002], C.scratch, [0, 0, 0.7]);
    scratch(V(CS.x + 0.1, CS.y + 0.22, fz + 0.01), V(0, 0, 1), 0.12, -0.4);
    scratch(V(CS.x - 0.02, CS.y + 0.05, fz + 0.01), V(0, 0, 1), 0.1, 2.3);
    scratch(V(CS.x + 0.05, CS.y - 0.35, fz), V(0, 0, 1), 0.08, 0.9);
    dent(V(CS.x - 0.27, CS.y + 0.2, CS.z + 0.036), V(0, 0, 1), 0.02);
    dent(V(CS.x + 0.2, CS.y - 0.3, CS.z + 0.036), V(0, 0, 1), 0.018);
    // straps to the forearm
    for (const sx of [0.66, 0.84]) box([0.035, 0.15, 0.085], [sx, 1.5, 0.075], C.leather);
    // an arrow still lodged in the shield
    const P = V(CS.x + 0.13, CS.y - 0.1, fz + 0.01);
    const d = V(0.3, 0.32, 1).normalize();
    const A = P.clone().addScaledVector(d, -0.02);
    const B = P.clone().addScaledVector(d, 0.36);
    tube([A.x, A.y, A.z], [B.x, B.y, B.z], 0.006, 0.006, 5, C.wood);
    const Bm = basisY(d);
    for (let k = 0; k < 3; k++) {
      const v = new THREE.BoxGeometry(0.022, 0.075, 0.002);
      v.translate(0.014, 0, 0);
      v.rotateY((k * 2 * PI) / 3);
      v.translate(0, 0.31, 0);
      v.applyMatrix4(Bm);
      v.translate(A.x, A.y, A.z);
      add(v, k === 0 ? C.crimson : C.feather);
    }
    const nockP = A.clone().addScaledVector(d, 0.375);
    ball([nockP.x, nockP.y, nockP.z], 0.009, C.leatherDk);
    // broken stub
    const P2 = V(CS.x - 0.14, CS.y + 0.2, fz + 0.01);
    const d2 = V(-0.2, 0.1, 1).normalize();
    const B2 = P2.clone().addScaledVector(d2, 0.09);
    tube([P2.x, P2.y, P2.z], [B2.x, B2.y, B2.z], 0.006, 0.006, 5, C.wood);
    const spl = new THREE.ConeGeometry(0.007, 0.03, 4);
    spl.translate(0, 0.015, 0);
    spl.applyMatrix4(basisY(d2.clone().add(V(0.3, 0.2, 0)).normalize()));
    spl.translate(B2.x, B2.y, B2.z);
    add(spl, C.feather);
  }

  return b.root;
}
