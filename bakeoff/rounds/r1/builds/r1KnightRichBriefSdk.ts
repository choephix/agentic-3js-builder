import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Battle-worn Knight",
  description:
    "A knight in dented plate: great helm with crimson plume, layered gold-filigree pauldrons, blue surcoat and kite shield with a silver griffin, broadsword, and a torn crimson cape.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "knight" });
  const R = rng(7);

  const C = {
    steel: "#a3acb6",
    steelD: "#667079",
    steelL: "#c9d0d8",
    gold: "#d6aa3a",
    blue: "#1e3d8c",
    blueD: "#17316f",
    crim: "#a3121f",
    crimD: "#7f0d19",
    silver: "#e3e6ea",
    leather: "#4a3322",
    dark: "#16161b",
    dent: "#7a838c",
  };

  // ---------- materials / helpers ----------
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (c: string, metal = 0.55, rough = 0.38) => {
    const k = c + metal + rough;
    let m = mats.get(k);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: c,
        metalness: metal,
        roughness: rough,
        flatShading: true,
        side: THREE.DoubleSide,
      });
      mats.set(k, m);
    }
    return m;
  };
  const cloth = (c: string) => mat(c, 0.03, 0.85);

  // ---------- skeleton ----------
  const J: Record<string, any> = {};
  const H: Record<string, { o: THREE.Object3D; p: THREE.Vector3 }> = {};
  const mk = (name: string, at: [number, number, number], parent?: string) => {
    const j = parent ? b.joint(name, { at, parent: J[parent] }) : b.joint(name, { at });
    J[name] = j;
    const a: any = j;
    const o: THREE.Object3D =
      a instanceof THREE.Object3D
        ? a
        : a?.bone instanceof THREE.Object3D
          ? a.bone
          : a?.object instanceof THREE.Object3D
            ? a.object
            : b.root;
    H[name] = { o, p: o === b.root ? new THREE.Vector3() : new THREE.Vector3(...at) };
  };

  mk("hips", [0, 0.98, 0]);
  mk("spine", [0, 1.15, 0], "hips");
  mk("chest", [0, 1.35, 0], "spine");
  mk("neck", [0, 1.57, 0], "chest");
  mk("head", [0, 1.68, 0], "neck");
  const sides = [
    { s: 1, n: "L" },
    { s: -1, n: "R" },
  ];
  for (const { s, n } of sides) {
    mk("hip" + n, [s * 0.11, 0.95, 0], "hips");
    mk("knee" + n, [s * 0.11, 0.52, 0.01], "hip" + n);
    mk("ankle" + n, [s * 0.11, 0.09, 0], "knee" + n);
    mk("toe" + n, [s * 0.11, 0.04, 0.14], "ankle" + n);
    mk("shoulder" + n, [s * 0.27, 1.48, 0], "chest");
    mk("elbow" + n, [s * 0.41, 1.2, 0], "shoulder" + n);
    mk("wrist" + n, [s * 0.51, 0.95, 0.02], "elbow" + n);
  }

  const put = (jn: string, obj: THREE.Object3D, w: [number, number, number]) => {
    const h = H[jn];
    obj.position.set(w[0] - h.p.x, w[1] - h.p.y, w[2] - h.p.z);
    h.o.add(obj);
    return obj;
  };
  const add = (
    jn: string,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    pos: [number, number, number],
    rot?: [number, number, number],
    scl?: [number, number, number],
  ) => {
    const me = new THREE.Mesh(geo, m);
    if (rot) me.rotation.set(rot[0], rot[1], rot[2]);
    if (scl) me.scale.set(scl[0], scl[1], scl[2]);
    return put(jn, me, pos) as THREE.Mesh;
  };
  const box = (jn: string, w: number, h: number, d: number, m: THREE.Material, pos: [number, number, number], rot?: [number, number, number]) =>
    add(jn, new THREE.BoxGeometry(w, h, d), m, pos, rot);
  const ball = (jn: string, r: number, m: THREE.Material, pos: [number, number, number], scl?: [number, number, number], seg = 8) =>
    add(jn, new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), m, pos, undefined, scl);
  const seg = (jn: string, a: number[], c: number[], r1: number, r2: number, m: THREE.Material, sd = 8) => {
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const B = new THREE.Vector3(...(c as [number, number, number]));
    const dir = B.clone().sub(A);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r2, r1, len, sd);
    const me = new THREE.Mesh(g, m);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return put(jn, me, [(A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2]) as THREE.Mesh;
  };
  const shapeGeo = (pts: number[][], depth: number) => {
    const s = new THREE.Shape();
    pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  };
  const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 10) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    });
  const dent = (jn: string, pos: [number, number, number], r: number, rot?: [number, number, number]) => {
    ball(jn, r, mat(C.dent, 0.4, 0.7), pos, [1, 1, 0.3], 6).rotation.set(...(rot ?? [0, 0, 0]));
  };
  const scratch = (jn: string, pos: [number, number, number], len: number, ang: number, rotY = 0) => {
    const m = box(jn, len, 0.004, 0.003, mat(C.steelL, 0.6, 0.3), pos);
    m.rotation.set(0, rotY, ang);
  };

  // griffin emblem (faces +x, drawn in XY, extruded along +Z)
  const griffin = (color: string, depth: number) => {
    const g = new THREE.Group();
    const m = mat(color, 0.7, 0.28);
    const part = (pts: number[][], z = 0) => {
      const me = new THREE.Mesh(shapeGeo(pts, depth), m);
      me.position.z = z;
      g.add(me);
    };
    part(ellipse(0, -0.05, 0.13, 0.2, 10)); // body
    part(ellipse(0.1, 0.27, 0.07, 0.065, 8)); // head
    part([[0.15, 0.31], [0.3, 0.24], [0.16, 0.2]]); // beak
    part([[0.06, 0.32], [0.04, 0.42], [0.11, 0.34]]); // ear tuft
    part([[0.0, 0.1], [-0.12, 0.28], [-0.3, 0.46], [-0.22, 0.3], [-0.38, 0.34], [-0.26, 0.18], [-0.4, 0.16], [-0.22, 0.02], [-0.28, -0.07], [-0.04, -0.08]]); // wing
    part([[0.08, 0.0], [0.28, 0.1], [0.3, 0.04], [0.22, 0.0], [0.26, -0.06], [0.12, -0.08]]); // foreleg
    part([[-0.02, -0.18], [0.0, -0.4], [0.16, -0.44], [0.14, -0.4], [0.07, -0.38], [0.1, -0.15]]); // hindleg
    part([[-0.1, -0.15], [-0.28, -0.26], [-0.36, -0.12], [-0.3, -0.28], [-0.14, -0.28]]); // tail
    return g;
  };

  // ---------- legs ----------
  for (const { s, n } of sides) {
    const x = s * 0.11;
    seg("hip" + n, [x, 0.97, 0], [x, 0.54, 0.01], 0.088, 0.07, mat(C.steel));
    seg("hip" + n, [x, 0.8, 0.0], [x, 0.78, 0.0], 0.095, 0.095, mat(C.gold, 0.7, 0.3), 8); // trim ring
    ball("knee" + n, 0.075, mat(C.steelL), [x, 0.52, 0.045], [1, 1, 0.9]);
    box("knee" + n, 0.04, 0.04, 0.05, mat(C.gold, 0.7, 0.3), [x, 0.52, 0.1], [0.5, 0, 0.78]);
    seg("knee" + n, [x, 0.5, 0.0], [x, 0.11, 0.0], 0.068, 0.052, mat(C.steel));
    box("knee" + n, 0.09, 0.3, 0.02, mat(C.steelD), [x, 0.3, 0.06], [-0.03, 0, 0]);
    seg("knee" + n, [x, 0.22, 0.0], [x, 0.205, 0.0], 0.07, 0.07, mat(C.gold, 0.7, 0.3));
    // sabaton
    box("ankle" + n, 0.105, 0.07, 0.17, mat(C.steelD), [x, 0.045, 0.085]);
    add("toe" + n, new THREE.ConeGeometry(0.052, 0.1, 6), mat(C.steelD), [x, 0.04, 0.2], [Math.PI / 2, 0, 0], [1, 1, 0.7]);
    box("ankle" + n, 0.09, 0.05, 0.1, mat(C.steel), [x, 0.1, 0.03]);
    box("ankle" + n, 0.1, 0.02, 0.08, mat(C.dark, 0.1, 0.9), [x, 0.012, -0.05]);
  }
  dent("kneeL", [0.12, 0.35, 0.075], 0.022);
  dent("kneeR", [-0.1, 0.25, 0.07], 0.018);
  scratch("kneeL", [0.115, 0.28, 0.072], 0.07, 0.6);
  scratch("kneeR", [-0.115, 0.4, 0.07], 0.06, -0.5);

  // ---------- pelvis, torso ----------
  add("hips", new THREE.CylinderGeometry(0.19, 0.17, 0.16, 10), mat(C.steelD), [0, 0.98, 0], undefined, [1, 1, 0.8]);
  add("chest", new THREE.CylinderGeometry(0.235, 0.19, 0.32, 10), mat(C.steel), [0, 1.35, 0], undefined, [1, 1, 0.78]);
  add("spine", new THREE.CylinderGeometry(0.19, 0.175, 0.2, 10), mat(C.steelD), [0, 1.12, 0], undefined, [1, 1, 0.8]);
  // gorget
  add("neck", new THREE.CylinderGeometry(0.09, 0.12, 0.1, 10), mat(C.steel), [0, 1.56, 0]);
  add("neck", new THREE.TorusGeometry(0.105, 0.012, 4, 12), mat(C.gold, 0.7, 0.3), [0, 1.52, 0], [Math.PI / 2, 0, 0]);

  // surcoat
  const tabF = shapeGeo([[-0.17, 0.78], [0.17, 0.78], [0.21, 0.12], [0, 0], [-0.21, 0.12]], 0.012);
  const tf = new THREE.Mesh(tabF, cloth(C.blue));
  put("spine", tf, [0, 0.74, 0.2]);
  const tb = new THREE.Mesh(tabF, cloth(C.blueD));
  tb.rotation.y = Math.PI;
  put("spine", tb, [0, 0.74, -0.2]);
  // gold hem trim front
  for (const sx of [-1, 1]) {
    box("spine", 0.012, 0.7, 0.016, mat(C.gold, 0.6, 0.35), [sx * 0.17, 1.15, 0.206], [0, 0, sx * -0.075]);
  }
  // side straps
  for (const { s } of sides) box("chest", 0.04, 0.42, 0.34, cloth(C.blueD), [s * 0.22, 1.3, 0], undefined);

  // griffin on surcoat
  const gs = griffin(C.silver, 0.012);
  gs.scale.setScalar(0.42);
  put("spine", gs, [0.0, 1.2, 0.21]);
  // belt
  add("spine", new THREE.CylinderGeometry(0.218, 0.218, 0.05, 12), mat(C.leather, 0.1, 0.8), [0, 0.99, 0], undefined, [1, 1, 0.97]);
  box("spine", 0.06, 0.055, 0.02, mat(C.gold, 0.8, 0.25), [0, 0.99, 0.222]);
  box("spine", 0.03, 0.03, 0.022, mat(C.dark), [0, 0.99, 0.224]);
  // tassets
  for (const { s } of sides) {
    box("hips", 0.1, 0.12, 0.03, mat(C.steel), [s * 0.19, 0.88, 0.07], [0.15, s * 0.3, 0]);
    box("hips", 0.1, 0.12, 0.03, mat(C.steelD), [s * 0.19, 0.8, 0.075], [0.2, s * 0.3, 0]);
  }
  // dents on torso sides
  dent("chest", [0.2, 1.4, 0.12], 0.025, [0, 0.7, 0]);
  dent("chest", [-0.22, 1.3, 0.08], 0.02, [0, -0.8, 0]);

  // ---------- arms & pauldrons ----------
  for (const { s, n } of sides) {
    const sh: [number, number, number] = [s * 0.27, 1.48, 0];
    const el: [number, number, number] = [s * 0.41, 1.2, 0];
    const wr: [number, number, number] = [s * 0.51, 0.95, 0.02];
    seg("shoulder" + n, [sh[0], sh[1] - 0.03, 0], [el[0], el[1], el[2]], 0.062, 0.055, cloth(C.steelD)); // arm
    seg("shoulder" + n, [sh[0] + s * 0.02, sh[1] - 0.12, 0], [el[0] - s * 0.01, el[1] + 0.06, 0], 0.075, 0.065, mat(C.steel));
    ball("elbow" + n, 0.06, mat(C.steelL), [el[0] + s * 0.012, el[1], -0.02]);
    box("elbow" + n, 0.02, 0.08, 0.05, mat(C.gold, 0.7, 0.3), [el[0] + s * 0.07, el[1], -0.02], [0, 0, s * 0.3]);
    seg("elbow" + n, [el[0], el[1] - 0.04, el[2]], [wr[0], wr[1] + 0.03, wr[2]], 0.058, 0.05, mat(C.steel));
    seg("elbow" + n, [el[0] + s * 0.03, el[1] - 0.14, el[2]], [el[0] + s * 0.04, el[1] - 0.13, el[2]], 0.062, 0.062, mat(C.gold, 0.7, 0.3));
    // gauntlet
    box("wrist" + n, 0.075, 0.09, 0.07, mat(C.steelD), [wr[0], wr[1] - 0.02, wr[2]]);
    for (let f = 0; f < 4; f++) {
      box("wrist" + n, 0.014, 0.05, 0.016, mat(C.steel), [wr[0] - 0.026 + f * 0.0175, wr[1] - 0.085, wr[2] + 0.03]);
    }
    box("wrist" + n, 0.02, 0.05, 0.02, mat(C.steel), [wr[0] - s * 0.045, wr[1] - 0.05, wr[2] + 0.02], [0, 0, s * 0.4]);

    // layered pauldron
    for (let i = 0; i < 4; i++) {
      const r = 0.12 + i * 0.013;
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat(i % 2 ? C.steelD : C.steel));
      g.add(body);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0075, 4, 14), mat(C.gold, 0.8, 0.25));
      rim.rotation.x = Math.PI / 2;
      g.add(rim);
      // filigree rings & studs
      for (const a of [0.55, 1.0]) {
        const rr = r * Math.sin(a);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(rr * 0.995, 0.0035, 3, 14), mat(C.gold, 0.8, 0.25));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = r * Math.cos(a) * 0.99;
        g.add(ring);
      }
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2 + i * 0.3;
        const rr = r * Math.sin(0.78);
        const st = new THREE.Mesh(new THREE.SphereGeometry(0.008, 4, 3), mat(C.gold, 0.8, 0.25));
        st.position.set(Math.cos(ang) * rr, r * Math.cos(0.78), Math.sin(ang) * rr);
        g.add(st);
        // radial filigree spoke
        const sp = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.003, r * 0.45), mat(C.gold, 0.8, 0.25));
        const a2 = 0.35;
        sp.position.set(Math.cos(ang) * r * Math.sin(a2) * 1.0, r * Math.cos(a2) * 0.98, Math.sin(ang) * r * Math.sin(a2));
        sp.rotation.y = -ang + Math.PI / 2;
        sp.rotation.order = "YXZ";
        sp.rotation.x = 0.7;
        g.add(sp);
      }
      g.scale.set(1, 0.62, 1.05);
      g.rotation.z = -s * (0.28 + i * 0.08);
      put("shoulder" + n, g, [s * (0.28 + i * 0.022), 1.55 - i * 0.047, 0]);
    }
    ball("shoulder" + n, 0.012, mat(C.gold, 0.8, 0.25), [s * 0.28, 1.6, 0]);
  }
  dent("shoulderL", [0.36, 1.5, 0.07], 0.025, [0.6, 0.3, 0]);
  dent("shoulderR", [-0.34, 1.52, -0.04], 0.022, [0.2, 0.9, 0]);
  scratch("shoulderL", [0.3, 1.575, 0.07], 0.09, 0.2, 0.9);
  scratch("shoulderR", [-0.32, 1.54, 0.08], 0.08, -0.3, -0.7);

  // ---------- head: great helm ----------
  const hm = mat(C.steel);
  add("head", new THREE.CylinderGeometry(0.108, 0.118, 0.27, 12), hm, [0, 1.73, 0], undefined, [1, 1, 1.03]);
  add("head", new THREE.CylinderGeometry(0.025, 0.108, 0.075, 12), mat(C.steelL), [0, 1.905, 0]);
  add("head", new THREE.CylinderGeometry(0.12, 0.12, 0.018, 12), mat(C.gold, 0.8, 0.25), [0, 1.6, 0], undefined, [1, 1, 1.03]);
  add("head", new THREE.TorusGeometry(0.11, 0.007, 4, 14), mat(C.gold, 0.8, 0.25), [0, 1.86, 0], [Math.PI / 2, 0, 0]);
  // eye slit
  box("head", 0.15, 0.017, 0.02, mat(C.dark, 0, 1), [0, 1.775, 0.115]);
  box("head", 0.17, 0.012, 0.014, mat(C.gold, 0.8, 0.25), [0, 1.79, 0.118]);
  box("head", 0.17, 0.012, 0.014, mat(C.gold, 0.8, 0.25), [0, 1.76, 0.118]);
  // vertical ridge
  box("head", 0.022, 0.26, 0.02, mat(C.steelL), [0, 1.74, 0.125]);
  // breath holes
  for (const sx of [-1, 1]) {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 2; c++) {
        const x = sx * (0.04 + c * 0.03);
        const z = Math.sqrt(0.12 * 0.12 - x * x);
        box("head", 0.012, 0.012, 0.01, mat(C.dark, 0, 1), [x, 1.70 - r * 0.026, z * 1.02]);
      }
  }
  dent("head", [-0.07, 1.84, 0.075], 0.02, [0.3, -0.7, 0]);
  dent("head", [0.1, 1.68, 0.06], 0.016, [0, 1.0, 0]);
  scratch("head", [0.05, 1.82, 0.105], 0.07, 0.6, 0.35);
  scratch("head", [-0.06, 1.66, 0.11], 0.06, -0.8, -0.5);

  // plume
  const crest = box("head", 0.04, 0.03, 0.14, mat(C.gold, 0.8, 0.25), [0, 1.945, -0.01]);
  void crest;
  const pc = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.95, 0.06),
    new THREE.Vector3(0, 2.08, 0.04),
    new THREE.Vector3(0, 2.17, -0.07),
    new THREE.Vector3(0, 2.14, -0.22),
    new THREE.Vector3(0, 2.0, -0.35),
    new THREE.Vector3(0, 1.84, -0.4),
  ]);
  const N = 16;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = pc.getPoint(t);
    const tg = pc.getTangent(t);
    const w = 0.04 + Math.sin(t * Math.PI) * 0.03 + t * 0.01;
    const len = 0.1;
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, 0.045, len), cloth(i % 2 ? C.crim : C.crimD));
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg);
    put("head", me, [p.x, p.y, p.z]);
    if (i > 2) {
      for (const sx of [-1, 1]) {
        const tf2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, len * 0.9), cloth(C.crim));
        tf2.quaternion.copy(me.quaternion);
        tf2.rotateZ(sx * 0.5);
        put("head", tf2, [p.x + sx * (w * 0.5 + 0.005), p.y - 0.01, p.z]);
      }
    }
  }

  // ---------- cape ----------
  const nStrip = 11;
  for (let i = 0; i < nStrip; i++) {
    const u = i / (nStrip - 1) - 0.5; // -0.5..0.5
    const x = u * 0.62;
    const L = 0.75 + R() * 0.38 - Math.abs(u) * 0.1;
    const w = 0.068;
    const pts = [
      [-w / 2, 0],
      [w / 2, 0],
      [w / 2, -L + 0.12 * R()],
      [w * 0.2, -L],
      [-w * 0.1, -L + 0.06 + 0.05 * R()],
      [-w * 0.3, -L + 0.02],
      [-w / 2, -L + 0.14 * R()],
    ];
    const me = new THREE.Mesh(shapeGeo(pts, 0.012), cloth(i % 2 ? C.crim : C.crimD));
    me.rotation.x = 0.1 + R() * 0.08 + (1 - Math.abs(u) * 2) * 0.02;
    me.rotation.z = u * 0.12;
    me.rotation.y = u * 0.25;
    put("chest", me, [x, 1.54, -0.215 - 0.03 * (1 - 4 * u * u) - 0.03 * Math.abs(u)]);
  }
  // collar & clasp
  for (const { s } of sides) {
    box("chest", 0.17, 0.04, 0.1, cloth(C.crimD), [s * 0.16, 1.56, -0.08], [0.5, s * 0.5, s * 0.2]);
    box("chest", 0.17, 0.035, 0.08, cloth(C.crim), [s * 0.17, 1.55, 0.05], [-0.4, -s * 0.4, s * 0.2]);
    ball("chest", 0.016, mat(C.gold, 0.8, 0.25), [s * 0.1, 1.5, 0.15]);
  }
  box("chest", 0.2, 0.008, 0.008, mat(C.gold, 0.8, 0.25), [0, 1.485, 0.165]);

  // ---------- shield (left) ----------
  const sh = new THREE.Group();
  const rimM = new THREE.Mesh(
    shapeGeo([[-0.28, 0.48], [-0.14, 0.51], [0.14, 0.51], [0.28, 0.48], [0.27, 0.1], [0.18, -0.2], [0, -0.5], [-0.18, -0.2], [-0.27, 0.1]], 0.035),
    mat(C.silver, 0.7, 0.35),
  );
  sh.add(rimM);
  const field = new THREE.Mesh(
    shapeGeo([[-0.28, 0.48], [-0.14, 0.51], [0.14, 0.51], [0.28, 0.48], [0.27, 0.1], [0.18, -0.2], [0, -0.5], [-0.18, -0.2], [-0.27, 0.1]], 0.012),
    cloth(C.blue),
  );
  field.scale.set(0.86, 0.88, 1);
  field.position.set(0, 0.0, 0.035);
  sh.add(field);
  const gsh = griffin(C.silver, 0.012);
  gsh.scale.setScalar(0.62);
  gsh.position.set(0.0, 0.05, 0.047);
  sh.add(gsh);
  // rivets
  for (let k = 0; k < 10; k++) {
    const t = k / 10;
    const rv = new THREE.Mesh(new THREE.SphereGeometry(0.011, 5, 4), mat(C.gold, 0.8, 0.25));
    const ang = t * Math.PI * 2;
    rv.position.set(Math.cos(ang) * 0.245 * (Math.sin(ang) < 0 ? 0.85 : 1), Math.sin(ang) * 0.42 - (Math.sin(ang) < 0 ? 0.04 : 0), 0.038);
    sh.add(rv);
  }
  // battle damage
  for (let k = 0; k < 4; k++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), mat(C.blueD, 0.1, 0.9));
    d.scale.set(1, 1.4, 0.2);
    d.position.set(-0.14 + k * 0.09, 0.28 - ((k * 37) % 5) * 0.14, 0.049);
    d.rotation.z = k;
    sh.add(d);
  }
  const gash = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.012, 0.004), mat(C.steelL, 0.6, 0.3));
  gash.position.set(0.02, -0.16, 0.0505);
  gash.rotation.z = 0.7;
  sh.add(gash);
  const gash2 = gash.clone();
  gash2.scale.x = 0.5;
  gash2.position.set(-0.1, 0.32, 0.0505);
  gash2.rotation.z = -0.5;
  sh.add(gash2);
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.05), mat(C.dark, 0, 1));
  chip.position.set(0.26, 0.44, 0.02);
  chip.rotation.z = 0.7;
  sh.add(chip);
  sh.rotation.set(0.0, 0.22, -0.04);
  put("elbowL", sh, [0.56, 1.05, 0.17]);

  // ---------- sword (right) ----------
  const sw = new THREE.Group();
  const gold = mat(C.gold, 0.8, 0.25);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.17, 8), mat(C.leather, 0.1, 0.8));
  sw.add(grip);
  for (let k = 0; k < 4; k++) {
    const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.004, 3, 8), mat(C.dark, 0.1, 0.8));
    wrap.rotation.x = Math.PI / 2;
    wrap.position.y = -0.06 + k * 0.04;
    sw.add(wrap);
  }
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), gold);
  pom.position.y = -0.11;
  sw.add(pom);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.026, 0.035), gold);
  guard.position.y = 0.1;
  sw.add(guard);
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), gold);
    e.position.set(sx * 0.14, 0.1, 0);
    sw.add(e);
    const dr = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.05, 5), gold);
    dr.position.set(sx * 0.135, 0.075, 0);
    dr.rotation.z = Math.PI + sx * 0.3;
    sw.add(dr);
  }
  const blade = new THREE.Mesh(shapeGeo([[-0.032, 0], [0.032, 0], [0.03, 0.68], [0, 0.82], [-0.03, 0.68]], 0.012), mat(C.steelL, 0.85, 0.2));
  blade.position.set(0, 0.11, -0.006);
  sw.add(blade);
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.58, 0.016), mat(C.steelD, 0.7, 0.3));
  fuller.position.set(0, 0.42, 0);
  sw.add(fuller);
  for (let k = 0; k < 3; k++) {
    const nick = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.014, 0.016), mat(C.dark, 0, 1));
    nick.position.set(k % 2 ? 0.03 : -0.03, 0.45 + k * 0.13, 0);
    sw.add(nick);
  }
  sw.rotation.set(0.05, 0, 0.07);
  put("wristR", sw, [-0.51, 0.93, 0.03]);

  // ---------- ground-contact check feet at y=0 (sabaton box bottom: 0.045-0.035=0.01) ----------
  return b.root;
}
