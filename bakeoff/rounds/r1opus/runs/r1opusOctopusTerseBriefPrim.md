```ts
import * as THREE from "three";

export const meta = {
  name: "Octopus",
  description:
    "A stylized low-poly common octopus in a rigging rest pose. Eight tapered, segmented arms splay flat across the floor with gently curled tips, and staggered cream suckers run along the underside. A spotted coral mantle billows up and back above a head with turreted golden eyes, bar pupils, brows and skin papillae. It has a webbed arm crown, a siphon, and a two-part beak with a separate jaw.",
};

type Jt = { name: string; bone: THREE.Bone; pos: THREE.Vector3; q: THREE.Quaternion };

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "octopus";

  // ---------- deterministic random ----------
  let seed = 1337 >>> 0;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const randUnit = () => {
    const z = rand() * 2 - 1;
    const p = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    return new THREE.Vector3(s * Math.cos(p), z, s * Math.sin(p));
  };

  // ---------- materials ----------
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (c: string, double = false) => {
    const key = c + (double ? "|d" : "");
    let m = mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.72,
        metalness: 0.04,
        flatShading: true,
        side: double ? THREE.DoubleSide : THREE.FrontSide,
      });
      mats.set(key, m);
    }
    return m;
  };

  const C = {
    body: "#d4473b",
    mantle: "#cc3d3a",
    dark: "#8f2a2e",
    speck: "#ffd8b5",
    cream: "#f7dfc6",
    suckerIn: "#c2655a",
    web: "#b5363a",
    eyeGold: "#f4c24f",
    iris: "#e08a2a",
    pupil: "#1b1416",
    white: "#ffffff",
    brow: "#a8303a",
    beak: "#2c2224",
    lip: "#e9a08c",
  };
  const armCols: string[] = [];
  {
    const a = new THREE.Color("#c9383a");
    const b2 = new THREE.Color("#f28a58");
    for (let i = 0; i < 9; i++) {
      armCols.push("#" + a.clone().lerp(b2, Math.min(i, 7) / 7).getHexString());
    }
  }

  // ---------- math helpers ----------
  const Y = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const vec = (p: THREE.Vector3 | number[]) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
  const qY = (d: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize());
  const qFrom = (a: THREE.Vector3, b: THREE.Vector3) =>
    new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize());
  const qBasis = (z: THREE.Vector3, up: THREE.Vector3) => {
    const zz = z.clone().normalize();
    const x = new THREE.Vector3().crossVectors(up, zz).normalize();
    const y = new THREE.Vector3().crossVectors(zz, x);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, zz));
  };

  // ---------- skeleton ----------
  function joint(
    name: string,
    pos: THREE.Vector3 | number[],
    parent: Jt | null,
    aimAt?: THREE.Vector3 | number[],
    role?: string
  ): Jt {
    const p = vec(pos);
    const q = new THREE.Quaternion();
    if (parent) q.copy(parent.q);
    if (aimAt) {
      const dir = vec(aimAt).sub(p).normalize();
      const cur = Y.clone().applyQuaternion(q);
      q.premultiply(new THREE.Quaternion().setFromUnitVectors(cur, dir));
    }
    const bone = new THREE.Bone();
    bone.name = name;
    if (parent) {
      const inv = parent.q.clone().invert();
      bone.position.copy(p.clone().sub(parent.pos).applyQuaternion(inv));
      bone.quaternion.copy(inv.multiply(q));
      parent.bone.add(bone);
    } else {
      bone.position.copy(p);
      bone.quaternion.copy(q);
      root.add(bone);
    }
    if (role) bone.userData.role = role;
    return { name, bone, pos: p, q };
  }

  // place a mesh given in model space onto a joint
  function put(
    geo: THREE.BufferGeometry,
    color: string,
    j: Jt,
    pos: THREE.Vector3 | number[],
    q?: THREE.Quaternion,
    scale?: number[],
    double = false
  ) {
    const m = new THREE.Mesh(geo, mat(color, double));
    const inv = j.q.clone().invert();
    m.position.copy(vec(pos).sub(j.pos).applyQuaternion(inv));
    m.quaternion.copy(inv.multiply(q ? q.clone() : new THREE.Quaternion()));
    if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    j.bone.add(m);
    return m;
  }

  function onEllipsoid(c: THREE.Vector3, R: number, S: THREE.Vector3, Q: THREE.Quaternion, n: THREE.Vector3) {
    const p = new THREE.Vector3(n.x * S.x, n.y * S.y, n.z * S.z).multiplyScalar(R).applyQuaternion(Q).add(c);
    const nr = new THREE.Vector3(n.x / S.x, n.y / S.y, n.z / S.z).applyQuaternion(Q).normalize();
    return { p, nr };
  }

  // ---------- core joints ----------
  const rootJ = joint("root", [0, 0, 0], null);
  const body = joint("body", [0, 0.12, 0], rootJ, undefined, "spine");
  const head = joint("head", [0, 0.19, 0.02], body, undefined, "head");
  const mantle1 = joint("mantle1", [0, 0.24, -0.03], body, [0, 0.35, -0.11], "spine");
  const mantle2 = joint("mantle2", [0, 0.35, -0.11], mantle1, [0, 0.5, -0.2], "spine");
  joint("mantle3", [0, 0.5, -0.2], mantle2, undefined, "spine");
  const jaw = joint("jaw", [0, 0.075, 0.005], body, [0, 0.035, 0.02], "jaw");

  // ---------- head & mantle ----------
  const headC = V(0, 0.18, 0.03);
  const headS = V(1.15, 0.85, 1.05);
  put(new THREE.SphereGeometry(0.1, 12, 9), C.body, head, headC, undefined, [headS.x, headS.y, headS.z]);

  const m1C = V(0, 0.27, -0.05);
  const m1S = V(1.05, 1, 1);
  put(new THREE.SphereGeometry(0.12, 12, 9), C.body, mantle1, m1C, undefined, [m1S.x, m1S.y, m1S.z]);

  const m2C = V(0, 0.37, -0.13);
  const m2R = 0.145;
  const m2S = V(0.95, 1.2, 1.05);
  const m2Q = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), -0.55);
  put(new THREE.SphereGeometry(m2R, 14, 10), C.mantle, mantle2, m2C, m2Q, [m2S.x, m2S.y, m2S.z]);

  // mantle spots, specks and papillae
  const I = new THREE.Quaternion();
  for (let i = 0; i < 26; i++) {
    let n = randUnit();
    if (n.y < -0.25) n.y = -n.y;
    const { p, nr } = onEllipsoid(m2C, m2R, m2S, m2Q, n);
    const r = 0.012 + rand() * 0.014;
    put(new THREE.SphereGeometry(r, 6, 4), C.dark, mantle2, p.addScaledVector(nr, 0.003), qY(nr), [1, 0.3, 1]);
  }
  for (let i = 0; i < 14; i++) {
    let n = randUnit();
    if (n.y < -0.2) n.y = -n.y;
    const { p, nr } = onEllipsoid(m2C, m2R, m2S, m2Q, n);
    put(new THREE.SphereGeometry(0.006 + rand() * 0.004, 5, 4), C.speck, mantle2, p.addScaledVector(nr, 0.003), qY(nr), [1, 0.35, 1]);
  }
  for (let i = 0; i < 10; i++) {
    let n = randUnit();
    if (n.y < 0) n.y = -n.y;
    const { p, nr } = onEllipsoid(m2C, m2R, m2S, m2Q, n);
    put(new THREE.ConeGeometry(0.008, 0.024, 5), C.mantle, mantle2, p.addScaledVector(nr, 0.01), qY(nr));
  }
  for (let i = 0; i < 8; i++) {
    let n = randUnit();
    if (n.y < 0) n.y = -n.y;
    if (n.z > 0) n.z = -n.z;
    const { p, nr } = onEllipsoid(m1C, 0.12, m1S, I, n);
    put(new THREE.SphereGeometry(0.01 + rand() * 0.008, 6, 4), C.dark, mantle1, p.addScaledVector(nr, 0.003), qY(nr), [1, 0.3, 1]);
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const E = V(0.07 * s, 0.235, 0.065);
    const d = V(0.62 * s, 0.2, 0.76).normalize();
    const eye = joint("eye" + side, E, head, E.clone().add(d));
    const t = new THREE.Vector3().crossVectors(Y, d).normalize();

    // turret
    put(new THREE.SphereGeometry(0.045, 10, 8), C.body, head, E.clone().addScaledVector(d, -0.012));
    // eyeball
    const ballC = E.clone().addScaledVector(d, 0.012);
    put(new THREE.SphereGeometry(0.034, 12, 9), C.eyeGold, eye, ballC);
    // iris disc
    put(new THREE.CylinderGeometry(0.024, 0.024, 0.006, 12), C.iris, eye, ballC.clone().addScaledVector(d, 0.029), qY(d));
    // bar pupil
    put(new THREE.BoxGeometry(0.034, 0.01, 0.006), C.pupil, eye, ballC.clone().addScaledVector(d, 0.033), qBasis(d, Y));
    // highlight
    put(
      new THREE.SphereGeometry(0.0065, 6, 4),
      C.white,
      eye,
      ballC.clone().addScaledVector(d, 0.032).add(V(0, 0.011, 0)).addScaledVector(t, -0.008 * s)
    );
    // brow
    const bt = t.clone().add(V(0, 0.25 * s, 0)).normalize();
    put(new THREE.CapsuleGeometry(0.011, 0.045, 3, 8), C.brow, head, E.clone().add(V(0, 0.043, 0)).addScaledVector(d, 0.006), qY(bt));
    // papillae "horns"
    const h1 = V(0.35 * s, 1, -0.15).normalize();
    put(new THREE.ConeGeometry(0.011, 0.04, 6), C.brow, head, E.clone().add(V(0, 0.05, -0.014)).addScaledVector(h1, 0.02), qY(h1));
    const h2 = V(0.7 * s, 0.8, -0.3).normalize();
    put(new THREE.ConeGeometry(0.007, 0.024, 5), C.brow, head, E.clone().add(V(0.022 * s, 0.038, -0.03)).addScaledVector(h2, 0.012), qY(h2));
  }

  // head spots (away from eyes)
  for (let i = 0; i < 12; i++) {
    const n = randUnit();
    if (n.y < 0.15) continue;
    const { p, nr } = onEllipsoid(headC, 0.1, headS, I, n);
    if (p.distanceTo(V(0.07, 0.235, 0.065)) < 0.06 || p.distanceTo(V(-0.07, 0.235, 0.065)) < 0.06) continue;
    put(new THREE.SphereGeometry(0.009 + rand() * 0.007, 6, 4), C.dark, head, p.addScaledVector(nr, 0.003), qY(nr), [1, 0.3, 1]);
  }

  // siphon on the right side
  {
    const sd = V(-0.85, -0.15, -0.45).normalize();
    const base = V(-0.095, 0.2, -0.04);
    put(new THREE.CylinderGeometry(0.013, 0.02, 0.055, 8, 1, true), C.body, head, base.clone().addScaledVector(sd, 0.027), qY(sd), undefined, true);
    put(
      new THREE.TorusGeometry(0.013, 0.004, 5, 10),
      C.brow,
      head,
      base.clone().addScaledVector(sd, 0.055),
      new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), sd)
    );
  }

  // ---------- beak (upper on body, lower on jaw) ----------
  put(new THREE.TorusGeometry(0.026, 0.008, 5, 12), C.lip, body, [0, 0.082, 0], new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2));
  put(new THREE.ConeGeometry(0.017, 0.04, 6), C.beak, body, [0, 0.066, -0.008], qY(V(0, -1, 0.15)));
  put(new THREE.ConeGeometry(0.013, 0.03, 6), C.beak, jaw, [0, 0.06, 0.012], qY(V(0, -1, 0.35)));

  // ---------- arms ----------
  const R = (i: number) => 0.045 * Math.pow(1 - i / 8, 0.85) + 0.007;
  const rs: number[] = [];
  for (let i = 0; i < 9; i++) rs.push(R(i));
  const rho0 = [0.05, 0.13, 0.22, 0.32, 0.42, 0.52, 0.6, 0.655, 0.64];
  const lat0 = [0, 0, 0, 0, 0, 0.005, 0.018, 0.045, 0.075];
  const hts = [0.12, 0.075, rs[2] * 1.05, rs[3] * 1.05, rs[4] * 1.05, rs[5] * 1.05, rs[6] * 1.05 + 0.006, 0.052, 0.088];
  const lenByIdx = [0.95, 1.05, 1.0, 0.92];

  type Arm = { name: string; ang: number; pts: THREE.Vector3[] };
  const arms: Arm[] = [];
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const ang = s * (22.5 + 45 * k) * (Math.PI / 180);
      arms.push({ name: `arm${s > 0 ? "L" : "R"}${k + 1}`, ang, pts: [] });
    }
  }
  arms.sort((a, b2) => a.ang - b2.ang);
  arms.forEach((arm, idx) => {
    const k = parseInt(arm.name.slice(4), 10) - 1;
    const Ls = lenByIdx[k] + (rand() - 0.5) * 0.06;
    const sgn = idx % 2 === 0 ? 1 : -1;
    const curl = 0.8 + rand() * 0.5;
    const u = V(Math.sin(arm.ang), 0, Math.cos(arm.ang));
    const t = V(Math.cos(arm.ang), 0, -Math.sin(arm.ang));
    for (let i = 0; i < 9; i++) {
      const rho = i === 0 ? rho0[0] : rho0[i] * Ls;
      arm.pts.push(
        u.clone().multiplyScalar(rho).addScaledVector(t, lat0[i] * sgn * Ls * curl).add(V(0, hts[i], 0))
      );
    }
  });

  const down = V(0, -1, 0);
  for (const arm of arms) {
    const P = arm.pts;
    const js: Jt[] = [];
    let parent = body;
    for (let i = 0; i < 9; i++) {
      const j = joint(`${arm.name}_${i}`, P[i], parent, i < 8 ? P[i + 1] : undefined, "tentacle");
      js.push(j);
      parent = j;
    }
    // directions and parallel-transported underside normals
    const ds: THREE.Vector3[] = [];
    for (let k = 0; k < 8; k++) ds.push(P[k + 1].clone().sub(P[k]).normalize());
    const ns: THREE.Vector3[] = [];
    let n = down.clone().addScaledVector(ds[0], -down.dot(ds[0])).normalize();
    ns.push(n);
    for (let k = 1; k < 8; k++) {
      n = n.clone().applyQuaternion(qFrom(ds[k - 1], ds[k]));
      n.addScaledVector(ds[k], -n.dot(ds[k])).normalize();
      ns.push(n);
    }

    let suckerSide = 1;
    for (let k = 0; k < 8; k++) {
      const len = P[k].distanceTo(P[k + 1]);
      const col = armCols[k];
      const nk = ns[k];
      const dk = ds[k];
      const sk = new THREE.Vector3().crossVectors(dk, nk).normalize();
      const rm = (rs[k] + rs[k + 1]) / 2;
      const mid = P[k].clone().lerp(P[k + 1], 0.5);

      // main segment (bone Y runs along the segment)
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(rs[k + 1], rs[k], len, 8), mat(col));
      seg.position.set(0, len / 2, 0);
      js[k].bone.add(seg);

      // cream underside band
      put(
        new THREE.CylinderGeometry(rs[k + 1] * 0.84, rs[k] * 0.84, len * 0.98, 8),
        C.cream,
        js[k],
        mid.clone().addScaledVector(nk, 0.3 * rm),
        js[k].q
      );

      // elbow sphere + belly sphere at next joint
      put(new THREE.SphereGeometry(rs[k + 1], 8, 6), armCols[Math.min(k + 1, 8)], js[k + 1], P[k + 1]);
      if (k < 7) {
        put(
          new THREE.SphereGeometry(rs[k + 1] * 0.84, 7, 5),
          C.cream,
          js[k + 1],
          P[k + 1].clone().addScaledVector(nk, 0.3 * rs[k + 1])
        );
      }

      // suckers: staggered double row
      const fracs = k === 0 ? [0.85] : [0.2, 0.5, 0.8];
      for (const f of fracs) {
        const rf = rs[k] + (rs[k + 1] - rs[k]) * f;
        const p = P[k].clone().lerp(P[k + 1], f);
        const th = 0.6;
        const out = nk.clone().multiplyScalar(Math.cos(th)).addScaledVector(sk, Math.sin(th) * suckerSide).normalize();
        suckerSide = -suckerSide;
        const sr = rf * 0.38;
        const c = p.clone().addScaledVector(out, rf * 0.95);
        put(new THREE.CylinderGeometry(sr, sr * 1.15, sr * 0.7, 7), C.cream, js[k], c, qY(out));
        put(new THREE.CylinderGeometry(sr * 0.5, sr * 0.5, sr * 0.3, 7), C.suckerIn, js[k], c.clone().addScaledVector(out, sr * 0.3), qY(out));
      }

      // dorsal spots and specks
      if (k >= 1 && k <= 6) {
        const top = nk.clone().negate();
        const sp = mid.clone().addScaledVector(top, rm * 0.95).addScaledVector(sk, rm * 0.2 * (k % 2 ? 1 : -1));
        put(new THREE.SphereGeometry(rm * 0.38, 6, 4), C.dark, js[k], sp, qY(top), [1, 0.3, 1]);
        if (k % 2 === 0) {
          const dir2 = top.clone().addScaledVector(sk, 0.7).normalize();
          const sp2 = P[k].clone().lerp(P[k + 1], 0.8).addScaledVector(dir2, rm * 0.97);
          put(new THREE.SphereGeometry(rm * 0.18, 5, 4), C.speck, js[k], sp2, qY(dir2), [1, 0.35, 1]);
        }
      }
    }
  }

  // ---------- web between neighbouring arms ----------
  {
    const f = [0.97, 0.84, 0.68];
    const positions: number[] = [];
    const pushTri = (a: THREE.Vector3, b2: THREE.Vector3, c: THREE.Vector3) => {
      for (const v of [a, b2, c]) {
        const l = v.clone().sub(body.pos); // body has identity orientation
        positions.push(l.x, l.y, l.z);
      }
    };
    for (let i = 0; i < arms.length; i++) {
      const A = arms[i].pts;
      const B = arms[(i + 1) % arms.length].pts;
      const rowA: THREE.Vector3[] = [];
      const rowB: THREE.Vector3[] = [];
      const rowM: THREE.Vector3[] = [];
      for (let j = 0; j < 3; j++) {
        const a = A[j].clone().add(V(0, rs[j] * 0.35, 0));
        const b2 = B[j].clone().add(V(0, rs[j] * 0.35, 0));
        const m = a.clone().lerp(b2, 0.5);
        // wrap-around pair (back arms) needs the midpoint pushed behind, not through the centre
        let mxz = V(m.x, 0, m.z);
        if (mxz.length() < 0.02) mxz = V(0, 0, 0);
        const want = (A[j].clone().setY(0).length() + B[j].clone().setY(0).length()) / 2;
        const dirM = V(Math.sin((arms[i].ang + arms[(i + 1) % arms.length].ang) / 2 + (i === arms.length - 1 ? Math.PI : 0)), 0,
          Math.cos((arms[i].ang + arms[(i + 1) % arms.length].ang) / 2 + (i === arms.length - 1 ? Math.PI : 0)));
        const mm = dirM.multiplyScalar(want * f[j] * Math.cos(Math.PI / 8));
        rowA.push(a);
        rowB.push(b2);
        rowM.push(V(mm.x, Math.max(m.y - 0.004, 0.012), mm.z));
      }
      for (let j = 0; j < 2; j++) {
        pushTri(rowA[j], rowM[j], rowA[j + 1]);
        pushTri(rowM[j], rowM[j + 1], rowA[j + 1]);
        pushTri(rowM[j], rowB[j], rowM[j + 1]);
        pushTri(rowB[j], rowB[j + 1], rowM[j + 1]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.computeVertexNormals();
    const web = new THREE.Mesh(g, mat(C.web, true));
    body.bone.add(web);
  }

  return root;
}
```