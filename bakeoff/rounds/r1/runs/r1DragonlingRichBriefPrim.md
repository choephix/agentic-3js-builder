```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon with Egg",
  description:
    "A house-cat-sized teal hatchling sitting beside its broken speckled egg: cream belly, orange back spines, stubby horns, toothy grin, tiny wings with amber membranes, a spade-tipped tail and a wisp of smoke.",
};

export default function build() {
  const b = createBuilder({ name: "baby_dragon" });
  const root = b.root;

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.13, -0.05] });
  const spine = b.joint("spine1", { at: [0, 0.18, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.23, 0.05], parent: spine });
  const neck = b.joint("neck1", { at: [0, 0.29, 0.07], parent: chest });
  const head = b.joint("head", { at: [0, 0.35, 0.11], parent: neck });
  b.joint("jaw", { at: [0, 0.325, 0.15], parent: head });
  let tp = hips;
  const tailPts: [number, number, number][] = [
    [0, 0.09, -0.14], [-0.07, 0.05, -0.25], [-0.2, 0.035, -0.29], [-0.31, 0.03, -0.2], [-0.32, 0.025, -0.07],
  ];
  tailPts.forEach((p, i) => { tp = b.joint("tail" + (i + 1), { at: p, parent: tp }); });
  const sides = [{ n: "L", s: 1 }, { n: "R", s: -1 }];
  for (const { n, s } of sides) {
    const sh = b.joint("shoulder" + n, { at: [s * 0.085, 0.23, 0.05], parent: chest });
    const el = b.joint("elbow" + n, { at: [s * 0.1, 0.15, 0.1], parent: sh });
    b.joint("hand" + n, { at: [s * 0.085, 0.04, 0.15], parent: el });
    const hp = b.joint("hip" + n, { at: [s * 0.095, 0.09, -0.04], parent: hips });
    const kn = b.joint("knee" + n, { at: [s * 0.1, 0.06, 0.04], parent: hp });
    b.joint("foot" + n, { at: [s * 0.09, 0.02, 0.1], parent: kn });
    const wsh = b.joint("wingShoulder" + n, { at: [s * 0.09, 0.26, -0.03], parent: chest });
    const wr = b.joint("wingWrist" + n, { at: [s * 0.17, 0.36, -0.07], parent: wsh });
    b.joint("wingFinger1" + n, { at: [s * 0.3, 0.42, -0.1], parent: wr });
    b.joint("wingFinger2" + n, { at: [s * 0.33, 0.31, -0.16], parent: wr });
    b.joint("wingFinger3" + n, { at: [s * 0.27, 0.2, -0.2], parent: wr });
  }

  // ---------- helpers ----------
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (c: number, extra: any = {}) => {
    const key = c + JSON.stringify(extra);
    if (!mats[key])
      mats[key] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.03, flatShading: true, ...extra });
    return mats[key];
  };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[]) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    root.add(me);
    return me;
  };
  const sphG = new THREE.SphereGeometry(1, 12, 8);
  const ell = (p: number[], sc: number[], c: number, rot?: number[], m?: THREE.Material) => {
    const me = add(sphG, m ?? mat(c), p);
    me.scale.set(sc[0], sc[1], sc[2]);
    if (rot) me.rotation.set(rot[0], rot[1], rot[2]);
    return me;
  };
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const rod = (a: number[], bb: number[], r: number, c: number, seg = 6) => {
    const d = V(bb).sub(V(a));
    const len = d.length();
    const me = add(new THREE.CylinderGeometry(r, r, len, seg), mat(c), [(a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2, (a[2] + bb[2]) / 2]);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return me;
  };
  const cone = (a: number[], tip: number[], r: number, c: number, seg = 5, m?: THREE.Material) => {
    const d = V(tip).sub(V(a));
    const len = d.length();
    const me = add(new THREE.ConeGeometry(r, len, seg), m ?? mat(c), [(a[0] + tip[0]) / 2, (a[1] + tip[1]) / 2, (a[2] + tip[2]) / 2]);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return me;
  };

  const TEAL = 0x2aa6a0, DTEAL = 0x1b7c83, BELLY = 0xf7e4a4, ORANGE = 0xf28c38, AMBER = 0xffb81c;
  const HORN = 0xf1dba3, CLAW = 0xfff1cf, DARK = 0x2b1a1a;

  // ---------- body ----------
  ell([0, 0.15, -0.01], [0.1, 0.11, 0.12], TEAL);
  ell([0, 0.22, 0.05], [0.08, 0.09, 0.08], TEAL);
  ell([0, 0.15, 0.04], [0.078, 0.1, 0.082], BELLY);
  for (let i = 0; i < 5; i++) {
    ell([0, 0.1 + i * 0.03, 0.118 - i * 0.002 + (i > 2 ? 0.004 : 0)], [0.07 - i * 0.004, 0.006, 0.012], 0xe9cf86);
  }
  ell([0, 0.29, 0.08], [0.05, 0.07, 0.05], TEAL);
  ell([0, 0.285, 0.112], [0.036, 0.06, 0.03], BELLY);

  // ---------- head ----------
  ell([0, 0.365, 0.13], [0.085, 0.07, 0.08], TEAL);
  ell([0, 0.355, 0.195], [0.052, 0.032, 0.065], TEAL);
  ell([0, 0.318, 0.19], [0.043, 0.012, 0.055], DARK);
  ell([0, 0.304, 0.182], [0.045, 0.017, 0.058], BELLY, [0.12, 0, 0]);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.165 + i * 0.022;
      const x = s * (0.034 - i * 0.002);
      cone([x, 0.327, z], [x, 0.309, z], 0.006, 0xffffff, 4);
    }
    for (let i = 0; i < 2; i++) {
      const z = 0.19 + i * 0.03;
      cone([s * 0.03, 0.31, z], [s * 0.03, 0.327, z], 0.005, 0xffffff, 4);
    }
    // nostrils, eyes, brows, horns
    ell([s * 0.02, 0.362, 0.257], [0.007, 0.006, 0.006], DARK);
    const eyeP = [s * 0.05, 0.392, 0.172];
    const dir = new THREE.Vector3(s * 0.35, 0.05, 1).normalize();
    ell(eyeP, [0.029, 0.029, 0.027], AMBER);
    ell([eyeP[0] + dir.x * 0.019, eyeP[1] + dir.y * 0.019, eyeP[2] + dir.z * 0.019], [0.016, 0.019, 0.01], 0x1a0d0a);
    ell([eyeP[0] + dir.x * 0.027 - s * 0.004, eyeP[1] + 0.008, eyeP[2] + dir.z * 0.027], [0.005, 0.005, 0.004], 0xffffff);
    ell([s * 0.05, 0.422, 0.165], [0.035, 0.009, 0.025], DTEAL, [0.2, 0, -s * 0.3]);
    cone([s * 0.04, 0.425, 0.1], [s * 0.065, 0.485, 0.045], 0.017, HORN, 5);
    cone([s * 0.085, 0.37, 0.09], [s * 0.125, 0.385, 0.05], 0.014, DTEAL, 4);
    cone([s * 0.085, 0.35, 0.09], [s * 0.12, 0.34, 0.055], 0.011, DTEAL, 4);
    ell([s * 0.075, 0.345, 0.2], [0.01, 0.008, 0.008], 0xf7a28b);
  }

  // smoke wisp from left nostril
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshStandardMaterial({
      color: 0xdedede, transparent: true, opacity: 0.7 - i * 0.09, roughness: 1, flatShading: true, depthWrite: false,
    });
    ell(
      [0.025 + 0.025 * Math.sin(i * 1.2), 0.385 + 0.032 * i, 0.262 + 0.01 * i + 0.012 * Math.cos(i * 1.2)],
      [0.01 + 0.005 * i, 0.01 + 0.005 * i, 0.01 + 0.005 * i], 0xdedede, undefined, m
    );
  }

  // ---------- limbs ----------
  for (const s of [1, -1]) {
    rod([s * 0.085, 0.23, 0.05], [s * 0.1, 0.15, 0.1], 0.025, TEAL);
    rod([s * 0.1, 0.15, 0.1], [s * 0.088, 0.045, 0.15], 0.021, TEAL);
    ell([s * 0.088, 0.03, 0.16], [0.03, 0.022, 0.042], TEAL);
    for (let k = -1; k <= 1; k++)
      cone([s * (0.088 + k * 0.016), 0.028, 0.188], [s * (0.088 + k * 0.022), 0.02, 0.222], 0.008, CLAW, 4);
    // haunch + foot
    ell([s * 0.095, 0.085, -0.04], [0.065, 0.07, 0.08], DTEAL);
    ell([s * 0.092, 0.022, 0.1], [0.04, 0.024, 0.06], TEAL);
    rod([s * 0.1, 0.07, 0.0], [s * 0.092, 0.025, 0.09], 0.024, TEAL);
    for (let k = -1; k <= 1; k++)
      cone([s * (0.092 + k * 0.02), 0.02, 0.145], [s * (0.092 + k * 0.027), 0.012, 0.185], 0.009, CLAW, 4);
  }

  // ---------- tail ----------
  const curve = new THREE.CatmullRomCurve3(
    [[0, 0.1, -0.12], [-0.05, 0.06, -0.22], [-0.17, 0.045, -0.29], [-0.3, 0.04, -0.23], [-0.33, 0.03, -0.1], [-0.28, 0.02, 0.0]].map(V)
  );
  const N = 11;
  const tailSamples: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = curve.getPoint(t);
    const r = 0.062 * (1 - t) + 0.016 * t;
    p.y = r * 0.95 + (1 - t) * 0.03;
    tailSamples.push(p);
    ell([p.x, p.y, p.z], [r, r * 0.95, r * 1.25], t > 0.5 ? DTEAL : TEAL);
    if (i % 2 === 0 && i > 0 && i < N) ell([p.x, p.y - r * 0.45, p.z], [r * 0.7, r * 0.6, r * 0.9], BELLY, undefined, mat(BELLY));
  }
  // spade
  {
    const end = tailSamples[N];
    const tan = curve.getTangent(1);
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.01);
    shape.lineTo(-0.014, 0.02);
    shape.lineTo(-0.04, 0.045);
    shape.lineTo(0, 0.115);
    shape.lineTo(0.04, 0.045);
    shape.lineTo(0.014, 0.02);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    const m = add(g, mat(ORANGE), [end.x, 0.008, end.z]);
    m.rotation.y = Math.atan2(-tan.x, -tan.z);
  }

  // ---------- dorsal spines ----------
  const dorsal = new THREE.CatmullRomCurve3(
    [[0, 0.355, 0.06], [0, 0.31, 0.025], [0, 0.255, -0.045], [0, 0.2, -0.11], [0, 0.135, -0.13]].map(V)
  );
  const spinePts: { p: THREE.Vector3; s: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const p = dorsal.getPoint(i / 7);
    spinePts.push({ p, s: 1 - Math.abs(i - 3) * 0.08 });
  }
  for (let i = 1; i < N - 1; i += 2) {
    const p = tailSamples[i].clone();
    p.y += 0.055 * (1 - i / N) + 0.01;
    spinePts.push({ p, s: 0.8 - (i / N) * 0.4 });
  }
  spinePts.forEach(({ p, s }, i) => {
    const h = 0.05 * s + 0.01;
    const back = i < 8 ? 0.35 : 0.1;
    cone([p.x, p.y - 0.008, p.z], [p.x, p.y + h, p.z - h * back], 0.014 * s + 0.004, i % 2 ? ORANGE : 0xf7a24e, 4);
  });

  // ---------- wings ----------
  const memMat = new THREE.MeshStandardMaterial({
    color: 0xffb347, transparent: true, opacity: 0.72, roughness: 0.5,
    side: THREE.DoubleSide, depthWrite: false, flatShading: true,
  });
  for (const s of [1, -1]) {
    const S = [s * 0.09, 0.26, -0.03], W = [s * 0.17, 0.36, -0.07];
    const F1 = [s * 0.3, 0.42, -0.1], F2 = [s * 0.33, 0.31, -0.16], F3 = [s * 0.27, 0.2, -0.2];
    const B = [s * 0.08, 0.14, -0.1];
    rod(S, W, 0.017, TEAL);
    ell(W, [0.02, 0.02, 0.02], DTEAL);
    for (const F of [F1, F2, F3]) rod(W, F, 0.008, DTEAL, 5);
    rod(F3, B, 0.006, DTEAL, 4);
    cone([W[0], W[1] + 0.01, W[2]], [W[0] + s * 0.01, W[1] + 0.055, W[2] + 0.01], 0.01, CLAW, 4);
    for (const F of [F1, F2, F3]) cone(F, [F[0] + s * 0.012, F[1] + 0.004, F[2] - 0.016], 0.006, CLAW, 4);
    const poly = [W, F1, F2, F3, B, S];
    const pos: number[] = [];
    for (let i = 1; i < poly.length - 1; i++) pos.push(...W, ...poly[i], ...poly[i + 1]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    add(g, memMat, [0, 0, 0]);
  }

  // ---------- egg ----------
  const ex = 0.32, ez = 0.07, ea = 0.095, ery = 0.13, ecy = 0.128;
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xf3ead2, roughness: 0.8, side: THREE.DoubleSide, flatShading: true,
  });
  const t0 = 0.42 * Math.PI;
  const shellG = new THREE.SphereGeometry(1, 14, 9, 0, Math.PI * 2, t0, Math.PI - t0);
  const shell = add(shellG, shellMat, [ex, ecy, ez]);
  shell.scale.set(ea, ery, ea);
  const rimR = ea * Math.sin(t0), rimY = ecy + ery * Math.cos(t0);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const h = i % 3 === 0 ? 0.07 : i % 3 === 1 ? 0.035 : 0.05;
    const bx = ex + Math.cos(a) * rimR, bz = ez + Math.sin(a) * rimR;
    cone(
      [bx, rimY - 0.006, bz],
      [bx - Math.cos(a) * 0.012, rimY + h, bz - Math.sin(a) * 0.012],
      0.024, 0xf3ead2, 3, shellMat
    );
  }
  ell([ex, rimY - 0.025, ez], [rimR * 0.9, 0.006, rimR * 0.9], 0xf2c35c); // yolk-ish goo
  const rnd = (() => { let st = 7; return () => ((st = (st * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 34; i++) {
    const t = t0 + 0.05 + rnd() * (Math.PI - t0 - 0.2);
    const p = rnd() * Math.PI * 2;
    const x = ea * Math.sin(t) * Math.cos(p), y = ery * Math.cos(t), z = ea * Math.sin(t) * Math.sin(p);
    const n = new THREE.Vector3(x / (ea * ea), y / (ery * ery), z / (ea * ea)).normalize();
    const sp = ell(
      [ex + x * 1.005, ecy + y * 1.005, ez + z * 1.005],
      [0.007 + rnd() * 0.007, 0.007 + rnd() * 0.006, 0.0035],
      rnd() > 0.45 ? 0x7a4a2a : 0x2b8d8a
    );
    sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  }
  // loose shell fragments
  const frag = (x: number, z: number, ry: number, tilt: number, sc: number) => {
    const m = add(new THREE.SphereGeometry(0.05, 7, 4, 0, Math.PI * 1.3, 0, Math.PI * 0.35), shellMat, [x, 0.012, z]);
    m.scale.set(sc, sc * 0.6, sc);
    m.rotation.set(tilt, ry, 0);
  };
  frag(0.2, 0.2, 0.5, 0.0, 1);
  frag(0.43, 0.2, 2.2, 0.35, 0.8);
  frag(0.28, 0.27, 4, 0.1, 0.6);

  // straw nest ring
  const nest = add(new THREE.TorusGeometry(0.17, 0.02, 5, 18), mat(0xc9a45c), [ex, 0.016, ez]);
  nest.rotation.x = Math.PI / 2;
  const nest2 = add(new THREE.TorusGeometry(0.14, 0.015, 5, 16), mat(0xb08a45), [ex, 0.024, ez]);
  nest2.rotation.x = Math.PI / 2;

  return root;
}
```