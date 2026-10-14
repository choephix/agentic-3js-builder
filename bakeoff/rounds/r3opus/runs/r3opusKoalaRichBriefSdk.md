```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy ash-grey koala sitting on a mossy base, one arm and foot hugging a pale eucalyptus branch, the other paw feeding a sprig of blue-green gum leaves into its mouth mid-munch.",
};

export default function build() {
  const b = createBuilder({ name: "sleepy-koala" });

  // ---------- randomness (deterministic) ----------
  const r0: any = rng(4217);
  const rand: () => number =
    typeof r0 === "function"
      ? () => r0()
      : typeof r0?.next === "function"
      ? () => r0.next()
      : () => r0.float();
  const rr = (a: number, c: number) => a + (c - a) * rand();

  // ---------- palette ----------
  const C = {
    fur: "#9b9ea6",
    furDark: "#7f828b",
    furLight: "#b6b8bf",
    paw: "#6e7078",
    cream: "#efe5cf",
    creamWhite: "#faf5ea",
    creamShade: "#ddd2bb",
    nose: "#232026",
    nostril: "#0c0b0d",
    noseShine: "#5f5a68",
    claw: "#2a2327",
    eye: "#6b3f1e",
    pupil: "#140d0a",
    lid: "#80838c",
    lash: "#3a3337",
    mouth: "#5a2c34",
    jaw: "#c8c2b6",
    bark: "#dcd3c3",
    barkGreen: "#a7b297",
    barkTan: "#c79a6f",
    barkPale: "#f1ebdf",
    twig: "#9c5a44",
    leaf1: "#6f9c95",
    leaf2: "#5a8781",
    leaf3: "#8db5aa",
    leafDry: "#b9b58a",
    gumnut: "#7d6a4a",
    blossom: "#f2e6a2",
    moss: "#7f9a5a",
    mossDark: "#647e45",
    pebble: "#a59d90",
  };

  // ---------- helpers ----------
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const arr = (p: THREE.Vector3): [number, number, number] => [p.x, p.y, p.z];

  function orient(geo: THREE.BufferGeometry, dir: THREE.Vector3) {
    const d = dir.clone().normalize();
    const axis = new THREE.Vector3().crossVectors(UP, d);
    const l = axis.length();
    if (l < 1e-6) {
      if (d.y < 0) geo.rotateX(Math.PI);
      return geo;
    }
    axis.divideScalar(l);
    const ang = Math.acos(THREE.MathUtils.clamp(d.y, -1, 1));
    geo.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axis, ang));
    return geo;
  }
  const put = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, bone: any) =>
    b.part(geo, color, { at: arr(at), bone } as any);

  function blob(
    at: THREE.Vector3,
    s: [number, number, number],
    color: string,
    bone: any,
    ws = 10,
    hs = 7,
    rotY = 0,
    rotX = 0,
    rotZ = 0
  ) {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(s[0], s[1], s[2]);
    if (rotZ) g.rotateZ(rotZ);
    if (rotX) g.rotateX(rotX);
    if (rotY) g.rotateY(rotY);
    put(g, color, at, bone);
  }
  function seg(a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, bone: any, rs = 8) {
    const d = c.clone().sub(a);
    const g = new THREE.CapsuleGeometry(r, Math.max(d.length(), 0.001), 3, rs);
    orient(g, d);
    put(g, color, a.clone().add(c).multiplyScalar(0.5), bone);
  }
  function cyl(a: THREE.Vector3, c: THREE.Vector3, r1: number, r2: number, color: string, bone: any, rs = 9) {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), rs, 1);
    orient(g, d);
    put(g, color, a.clone().add(c).multiplyScalar(0.5), bone);
  }
  function cone(base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string, bone: any, rs = 5) {
    const g = new THREE.ConeGeometry(r, len, rs);
    g.translate(0, len / 2, 0);
    orient(g, dir);
    put(g, color, base, bone);
  }
  function leaf(base: THREE.Vector3, dir: THREE.Vector3, len: number, color: string, bone: any, twist = 0) {
    const g = new THREE.SphereGeometry(1, 8, 4);
    g.scale(len * 0.14, len / 2, 0.0035);
    g.translate(0, len / 2, 0);
    g.rotateY(twist);
    orient(g, dir);
    put(g, color, base, bone);
    // little stalk
    const st = new THREE.CylinderGeometry(0.0022, 0.0022, len * 0.15, 4);
    st.translate(0, -len * 0.05, 0);
    orient(st, dir);
    put(st, C.twig, base, bone);
  }
  function tuft(at: THREE.Vector3, r: number, color: string, bone: any) {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.scale(rr(0.85, 1.15), rr(0.85, 1.2), rr(0.85, 1.15));
    g.rotateY(rr(0, Math.PI));
    g.rotateX(rr(-0.5, 0.5));
    put(g, color, at, bone);
  }
  const ellPoint = (c: THREE.Vector3, s: [number, number, number], u: number, v: number, k = 1) => {
    const th = 2 * Math.PI * u;
    const ph = Math.acos(2 * v - 1);
    return V(
      c.x + Math.sin(ph) * Math.cos(th) * s[0] * k,
      c.y + Math.cos(ph) * s[1] * k,
      c.z + Math.sin(ph) * Math.sin(th) * s[2] * k
    );
  };
  const J = (name: string, at: THREE.Vector3, parent?: any, role?: string) =>
    b.joint(name, (parent ? { at: arr(at), parent, role } : { at: arr(at), role }) as any);

  // paw: palm + 5 digits (2 thumbs + 3 fingers) with dark claws
  function paw(w: THREE.Vector3, f0: THREE.Vector3, s0: THREE.Vector3, c0: THREE.Vector3, bone: any, k = 1) {
    const f = f0.clone().normalize();
    const s = s0.clone().normalize();
    const c = c0.clone().normalize();
    const p = w.clone().addScaledVector(f, 0.035 * k);
    blob(p, [0.042 * k, 0.036 * k, 0.042 * k], C.paw, bone, 9, 6);
    blob(p.clone().addScaledVector(c, 0.02 * k), [0.03 * k, 0.026 * k, 0.03 * k], C.furDark, bone, 7, 5);
    const offs = [-2.6, -1.6, 0, 1, 2];
    for (const o of offs) {
      const base = p.clone().addScaledVector(s, o * 0.016 * k).addScaledVector(f, 0.026 * k);
      const tip = base.clone().addScaledVector(f, 0.03 * k).addScaledVector(c, 0.018 * k);
      seg(base, tip, 0.013 * k, C.paw, bone, 6);
      const dir = tip.clone().sub(base).normalize().addScaledVector(c, 0.6);
      cone(tip.clone().addScaledVector(dir.clone().normalize(), 0.004), dir, 0.03 * k, 0.0085 * k, C.claw, bone);
    }
  }

  // ---------- skeleton ----------
  const root = J("root", V(0, 0, 0), undefined, "spine");
  const hips = J("hips", V(0, 0.2, 0), root, "spine");
  const spine1 = J("spine1", V(0, 0.34, 0), hips, "spine");
  const chest = J("chest", V(0, 0.46, 0.01), spine1, "spine");
  const neck = J("neck", V(0, 0.52, 0.02), chest, "neck");
  const head = J("head", V(0, 0.6, 0.03), neck, "head");
  const headTop = J("headTop", V(0, 0.77, 0.03), head, "head");
  const jaw = J("jaw", V(0, 0.54, 0.11), head, "jaw");
  const jawTip = J("jawTip", V(0, 0.51, 0.18), jaw, "jaw");
  const earL = J("earL", V(0.15, 0.71, 0.02), head, "hinge");
  const earLTip = J("earLTip", V(0.23, 0.75, 0.03), earL, "hinge");
  const earR = J("earR", V(-0.15, 0.71, 0.02), head, "hinge");
  const earRTip = J("earRTip", V(-0.23, 0.75, 0.03), earR, "hinge");

  const shL = V(0.13, 0.46, 0.03), elL = V(0.22, 0.36, 0.15), wrL = V(0.1, 0.49, 0.22);
  const shR = V(-0.13, 0.46, 0.03), elR = V(-0.2, 0.42, 0.12), wrR = V(-0.24, 0.44, 0.29);
  const shoulderL = J("shoulderL", shL, chest, "arm");
  const elbowL = J("elbowL", elL, shoulderL, "arm");
  const wristL = J("wristL", wrL, elbowL, "arm");
  const handL = J("handL", V(0.07, 0.53, 0.25), wristL, "digit");
  const shoulderR = J("shoulderR", shR, chest, "arm");
  const elbowR = J("elbowR", elR, shoulderR, "arm");
  const wristR = J("wristR", wrR, elbowR, "arm");
  const handR = J("handR", V(-0.31, 0.44, 0.27), wristR, "digit");

  const hpL = V(0.1, 0.18, 0.05), knL = V(0.21, 0.15, 0.17), anL = V(0.23, 0.065, 0.28);
  const hpR = V(-0.1, 0.18, 0.05), knR = V(-0.2, 0.14, 0.15), anR = V(-0.24, 0.07, 0.29);
  const hipL = J("hipL", hpL, hips, "leg");
  const kneeL = J("kneeL", knL, hipL, "leg");
  const ankleL = J("ankleL", anL, kneeL, "leg");
  const toeL = J("toeL", V(0.25, 0.05, 0.37), ankleL, "digit");
  const hipR = J("hipR", hpR, hips, "leg");
  const kneeR = J("kneeR", knR, hipR, "leg");
  const ankleR = J("ankleR", anR, kneeR, "leg");
  const toeR = J("toeR", V(-0.31, 0.07, 0.27), ankleR, "digit");
  void headTop; void jawTip; void earLTip; void earRTip; void handL; void handR; void toeL; void toeR;

  // ---------- mossy base (prop) ----------
  {
    const g = new THREE.CylinderGeometry(0.47, 0.5, 0.03, 16);
    put(g, C.moss, V(0, 0.015, 0.02), root);
    for (let i = 0; i < 22; i++) {
      const a = rr(0, Math.PI * 2), d = rr(0.15, 0.46);
      const p = V(Math.cos(a) * d, 0.03, 0.02 + Math.sin(a) * d);
      blob(p, [rr(0.03, 0.06), rr(0.012, 0.022), rr(0.03, 0.06)], i % 2 ? C.mossDark : C.moss, root, 7, 4);
    }
    for (let i = 0; i < 5; i++) {
      const a = rr(0, Math.PI * 2), d = rr(0.3, 0.45);
      blob(V(Math.cos(a) * d, 0.035, 0.02 + Math.sin(a) * d), [rr(0.018, 0.03), 0.016, rr(0.018, 0.03)], C.pebble, root, 6, 4);
    }
    // fallen leaves
    for (let i = 0; i < 7; i++) {
      const a = rr(0, Math.PI * 2), d = rr(0.25, 0.44);
      const p = V(Math.cos(a) * d, 0.034, 0.02 + Math.sin(a) * d);
      const dir = V(Math.cos(a + rr(-1, 1)), 0.02, Math.sin(a + rr(-1, 1)));
      leaf(p, dir, rr(0.07, 0.1), i % 3 === 0 ? C.leafDry : C.leaf2, root, Math.PI / 2);
    }
  }

  // ---------- eucalyptus branch (prop) ----------
  {
    const pts = [V(-0.3, 0.0, 0.2), V(-0.31, 0.35, 0.2), V(-0.29, 0.7, 0.19), V(-0.25, 1.0, 0.17), V(-0.2, 1.22, 0.15)];
    const rad = [0.075, 0.066, 0.058, 0.046, 0.03];
    for (let i = 0; i < pts.length - 1; i++) {
      cyl(pts[i], pts[i + 1], rad[i], rad[i + 1], C.bark, root, 10);
      if (i > 0) blob(pts[i], [rad[i], rad[i], rad[i]], C.bark, root, 10, 6);
    }
    blob(pts[4], [0.03, 0.03, 0.03], C.barkTan, root, 8, 5);
    // base flare and roots
    put(new THREE.CylinderGeometry(0.075, 0.12, 0.08, 10), C.bark, V(-0.3, 0.06, 0.2), root);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      const s = V(-0.3, 0.05, 0.2), e = V(-0.3 + Math.cos(a) * 0.18, 0.025, 0.2 + Math.sin(a) * 0.18);
      cyl(s, e, 0.04, 0.012, C.bark, root, 7);
    }
    // peeling eucalyptus bark patches
    const patchCols = [C.barkGreen, C.barkTan, C.barkPale, C.barkGreen];
    for (let i = 0; i < pts.length - 1; i++) {
      for (let k = 0; k < 7; k++) {
        const t = rr(0.1, 0.9);
        const c = pts[i].clone().lerp(pts[i + 1], t);
        const r = THREE.MathUtils.lerp(rad[i], rad[i + 1], t);
        const a = rr(0, Math.PI * 2);
        const p = c.clone().add(V(Math.cos(a) * r, 0, Math.sin(a) * r));
        blob(p, [rr(0.015, 0.03), rr(0.03, 0.07), 0.006], patchCols[(i + k) % 4], root, 6, 4, Math.PI / 2 - a);
      }
    }
    // side branch arching over the koala
    const sb = [V(-0.29, 0.72, 0.19), V(-0.14, 0.9, 0.22), V(0.05, 1.0, 0.24), V(0.22, 1.04, 0.24)];
    const sr = [0.034, 0.027, 0.02, 0.012];
    for (let i = 0; i < sb.length - 1; i++) {
      cyl(sb[i], sb[i + 1], sr[i], sr[i + 1], i === 0 ? C.bark : C.twig, root, 7);
      blob(sb[i + 1], [sr[i + 1], sr[i + 1], sr[i + 1]], C.twig, root, 6, 4);
    }
    // drooping leaf clusters
    const leafCols = [C.leaf1, C.leaf2, C.leaf3];
    const cluster = (p: THREE.Vector3, n: number, bias: THREE.Vector3) => {
      for (let i = 0; i < n; i++) {
        const dir = V(rr(-0.7, 0.7), rr(-1, -0.3), rr(-0.6, 0.7)).add(bias);
        leaf(p.clone().add(V(rr(-0.02, 0.02), rr(-0.01, 0.01), rr(-0.02, 0.02))), dir, rr(0.09, 0.13), leafCols[i % 3], root, rr(0, Math.PI));
      }
    };
    cluster(sb[1], 6, V(0, 0, 0.2));
    cluster(sb[2], 7, V(0, 0, 0.3));
    cluster(sb[3], 8, V(0.3, 0.3, 0.2));
    cluster(pts[4], 9, V(0, 0.9, 0));
    cluster(pts[3], 5, V(-0.4, 0.2, 0));
    // gum nuts and fluffy blossoms
    const nutSpots = [sb[2].clone().add(V(0.02, -0.03, 0.02)), sb[3].clone().add(V(-0.03, -0.03, 0.01)), pts[4].clone().add(V(0.03, -0.02, 0.02))];
    for (const n of nutSpots) {
      for (let i = 0; i < 3; i++) {
        const p = n.clone().add(V(i * 0.016 - 0.016, -i * 0.006, 0));
        const g = new THREE.CylinderGeometry(0.009, 0.005, 0.016, 6);
        put(g, C.gumnut, p, root);
        blob(p.clone().add(V(0, 0.009, 0)), [0.009, 0.004, 0.009], C.leafDry, root, 6, 3);
      }
    }
    for (const p of [sb[2].clone().add(V(-0.04, 0.02, 0.03)), pts[4].clone().add(V(-0.04, 0.0, 0.03))]) {
      for (let i = 0; i < 6; i++) tuft(p.clone().add(V(rr(-0.02, 0.02), rr(-0.01, 0.02), rr(-0.02, 0.02))), 0.013, C.blossom, root);
    }
  }

  // ---------- body ----------
  const bodyC = V(0, 0.27, 0), bodyS: [number, number, number] = [0.19, 0.24, 0.17];
  blob(bodyC, bodyS, C.fur, spine1, 14, 10);
  blob(V(0, 0.19, -0.01), [0.205, 0.15, 0.17], C.fur, hips, 12, 8);
  blob(V(0, 0.44, 0.01), [0.16, 0.1, 0.13], C.fur, chest, 10, 7);
  // cream chest + belly
  blob(V(0, 0.38, 0.1), [0.11, 0.15, 0.075], C.cream, chest, 12, 8);
  blob(V(0, 0.24, 0.1), [0.12, 0.1, 0.075], C.creamShade, spine1, 10, 7);
  for (let i = 0; i < 12; i++) {
    const a = rr(-1.2, 1.2);
    const p = V(Math.sin(a) * 0.1, 0.38 + Math.cos(a) * 0.12 * rr(0.6, 1.1), 0.155);
    tuft(p, rr(0.016, 0.024), i % 2 ? C.creamWhite : C.cream, chest);
  }
  // little tail nub + speckled rump
  blob(V(0, 0.1, -0.16), [0.04, 0.035, 0.035], C.furLight, hips, 7, 5);
  for (let i = 0; i < 8; i++) {
    blob(V(rr(-0.1, 0.1), rr(0.12, 0.22), -0.16 + rr(-0.01, 0.01)), [0.014, 0.012, 0.01], C.creamWhite, hips, 6, 4);
  }
  // fur tufts over back and flanks
  for (let i = 0; i < 46; i++) {
    const p = ellPoint(bodyC, bodyS, rand(), rr(0.25, 0.97), 0.97);
    if (p.y < 0.1) continue;
    if (p.z > 0.06 && Math.abs(p.x) < 0.12) continue;
    const bone = p.y > 0.4 ? chest : p.y > 0.24 ? spine1 : hips;
    tuft(p, rr(0.022, 0.034), [C.fur, C.furLight, C.furDark][i % 3], bone);
  }

  // ---------- head ----------
  const headC = V(0, 0.62, 0.03), headS: [number, number, number] = [0.17, 0.15, 0.145];
  blob(headC, headS, C.fur, head, 14, 10);
  blob(V(0, 0.5, 0.09), [0.09, 0.045, 0.06], C.cream, neck, 9, 6); // chin ruff
  for (let i = 0; i < 7; i++) tuft(V(rr(-0.08, 0.08), rr(0.48, 0.51), rr(0.1, 0.13)), 0.018, C.creamWhite, neck);
  // fluffy cheeks
  for (const sx of [1, -1]) {
    blob(V(0.12 * sx, 0.56, 0.08), [0.07, 0.06, 0.06], C.furLight, head, 9, 6);
    for (let i = 0; i < 4; i++) tuft(V(sx * rr(0.15, 0.18), rr(0.52, 0.58), rr(0.04, 0.1)), 0.02, C.furLight, head);
  }
  for (let i = 0; i < 24; i++) {
    const p = ellPoint(headC, headS, rand(), rr(0.1, 0.95), 0.98);
    if (p.z > 0.07) continue;
    tuft(p, rr(0.018, 0.028), i % 2 ? C.fur : C.furDark, head);
  }
  // muzzle + big leathery nose
  blob(V(0, 0.55, 0.15), [0.058, 0.038, 0.045], C.furLight, head, 9, 6);
  blob(V(0, 0.6, 0.185), [0.05, 0.07, 0.045], C.nose, head, 12, 8);
  blob(V(0, 0.66, 0.17), [0.035, 0.03, 0.03], C.nose, head, 8, 5); // nose bridge
  for (const sx of [1, -1]) blob(V(0.02 * sx, 0.545, 0.21), [0.013, 0.008, 0.01], C.nostril, head, 6, 4, 0, 0, 0.4 * sx);
  blob(V(-0.012, 0.645, 0.219), [0.011, 0.02, 0.005], C.noseShine, head, 6, 4);
  blob(V(0.016, 0.62, 0.226), [0.006, 0.01, 0.004], C.noseShine, head, 5, 3);

  // mouth: upper gap on head, lower jaw on jaw bone, mid-munch
  blob(V(0, 0.524, 0.16), [0.04, 0.011, 0.03], C.mouth, head, 8, 5);
  blob(V(0, 0.505, 0.15), [0.045, 0.022, 0.04], C.jaw, jaw, 9, 6);
  leaf(V(0.018, 0.52, 0.185), V(1, -0.35, 0.55), 0.055, C.leaf1, jaw, 0.3);
  blob(V(-0.022, 0.522, 0.18), [0.01, 0.006, 0.008], C.leaf2, jaw, 5, 3);

  // drowsy half-closed eyes
  for (const sx of [1, -1]) {
    const e = V(0.065 * sx, 0.66, 0.15);
    blob(e, [0.022, 0.022, 0.022], C.eye, head, 10, 7);
    blob(e.clone().add(V(0, -0.004, 0.017)), [0.009, 0.01, 0.007], C.pupil, head, 6, 4);
    blob(e.clone().add(V(0.006 * sx, -0.011, 0.016)), [0.004, 0.003, 0.003], C.creamWhite, head, 5, 3);
    const lidTilt = 0.42;
    const lid = new THREE.SphereGeometry(0.026, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    lid.rotateX(lidTilt);
    lid.rotateZ(-0.12 * sx);
    put(lid, C.lid, e, head);
    const lash = new THREE.TorusGeometry(0.026, 0.0035, 4, 10, Math.PI);
    lash.rotateX(Math.PI / 2);
    lash.rotateX(lidTilt);
    lash.rotateZ(-0.12 * sx);
    put(lash, C.lash, e, head);
    // sleepy brow and under-eye pouch
    blob(e.clone().add(V(0.004 * sx, 0.03, -0.005)), [0.028, 0.01, 0.014], C.furDark, head, 7, 4, 0, 0, -0.25 * sx);
    blob(e.clone().add(V(0.004 * sx, -0.026, 0.004)), [0.022, 0.009, 0.012], C.furLight, head, 7, 4);
  }

  // big fluffy cream-lined ears
  for (const [sx, earJ] of [[1, earL], [-1, earR]] as [number, any][]) {
    const ec = V(0.17 * sx, 0.73, 0.0);
    const yaw = 0.35 * sx;
    blob(ec, [0.1, 0.09, 0.04], C.fur, earJ, 12, 7, yaw);
    const inner = V(0, -0.005, 0.026).applyAxisAngle(UP, yaw).add(ec);
    blob(inner, [0.07, 0.062, 0.02], C.cream, earJ, 10, 6, yaw);
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a = -0.6 + (i / (n - 1)) * (Math.PI + 1.0);
      const local = V(sx * Math.cos(a) * 0.095, Math.sin(a) * 0.088, rr(0.008, 0.02));
      const p = local.applyAxisAngle(UP, yaw).add(ec);
      tuft(p, rr(0.022, 0.03), i % 2 ? C.creamWhite : C.cream, earJ);
    }
    for (let i = 0; i < 6; i++) {
      const local = V(sx * rr(-0.03, 0.05), rr(-0.03, 0.04), 0.038);
      tuft(local.applyAxisAngle(UP, yaw).add(ec), rr(0.016, 0.022), C.creamWhite, earJ);
    }
  }

  // ---------- arms ----------
  seg(shL, elL, 0.054, C.fur, shoulderL);
  seg(elL, wrL, 0.046, C.fur, elbowL);
  blob(shL.clone().add(V(0.02, -0.01, 0)), [0.065, 0.07, 0.065], C.fur, shoulderL, 9, 6);
  seg(shR, elR, 0.054, C.fur, shoulderR);
  seg(elR, wrR, 0.046, C.fur, elbowR);
  blob(shR.clone().add(V(-0.02, -0.01, 0)), [0.065, 0.07, 0.065], C.fur, shoulderR, 9, 6);
  // fluffy cuffs
  for (let i = 0; i < 5; i++) {
    tuft(elL.clone().lerp(wrL, 0.85).add(V(rr(-0.03, 0.03), rr(-0.03, 0.03), rr(-0.03, 0.03))), 0.022, C.furLight, elbowL);
    tuft(elR.clone().lerp(wrR, 0.85).add(V(rr(-0.03, 0.03), rr(-0.03, 0.03), rr(-0.03, 0.03))), 0.022, C.furLight, elbowR);
  }

  // left paw feeds a sprig
  const fL = V(-0.35, 0.45, 0.35).normalize();
  const sL = new THREE.Vector3().crossVectors(fL, V(0, 0, 1)).normalize();
  const cL = new THREE.Vector3().crossVectors(sL, fL).normalize().negate();
  paw(wrL, fL, sL, cL, wristL);
  {
    const palm = wrL.clone().addScaledVector(fL, 0.035);
    const s0 = palm.clone().add(V(0.01, -0.05, 0.01));
    const s1 = palm.clone().add(V(0.03, 0.06, 0.03));
    const s2 = palm.clone().add(V(0.08, 0.18, 0.06));
    cyl(s0, s1, 0.006, 0.005, C.twig, wristL, 5);
    cyl(s1, s2, 0.005, 0.003, C.twig, wristL, 5);
    const cols = [C.leaf1, C.leaf3, C.leaf2];
    for (let i = 0; i < 7; i++) {
      const t = 0.15 + i * 0.13;
      const p = s1.clone().lerp(s2, Math.min(t, 1));
      const side = i % 2 ? 1 : -1;
      const dir = V(side * 0.9, rr(-0.2, 0.4), rr(0.1, 0.6));
      leaf(p, dir, rr(0.065, 0.085), cols[i % 3], wristL, rr(0, Math.PI));
    }
    leaf(s2, V(0.2, 1, 0.2), 0.06, C.leaf3, wristL, 0.4);
    // leaf trailing into the mouth
    leaf(palm.clone().add(V(-0.01, 0.0, 0.0)), V(-0.06, 0.02, -0.02).sub(V(0, 0, 0)), 0.065, C.leaf2, wristL, 1.2);
  }

  // right paw grips the trunk
  paw(wrR, V(-1, 0, -0.25), UP, V(0, 0, -1), wristR);

  // ---------- legs ----------
  seg(hpL, knL, 0.062, C.fur, hipL);
  seg(knL, anL, 0.048, C.fur, kneeL);
  blob(V(0.12, 0.17, 0.07), [0.09, 0.08, 0.1], C.fur, hipL, 9, 6);
  seg(hpR, knR, 0.062, C.fur, hipR);
  seg(knR, anR, 0.048, C.fur, kneeR);
  blob(V(-0.12, 0.17, 0.07), [0.09, 0.08, 0.1], C.fur, hipR, 9, 6);
  for (let i = 0; i < 4; i++) {
    tuft(knL.clone().add(V(rr(-0.03, 0.04), rr(0.02, 0.05), rr(-0.03, 0.03))), 0.024, C.furLight, kneeL);
    tuft(knR.clone().add(V(rr(-0.04, 0.03), rr(0.02, 0.05), rr(-0.03, 0.03))), 0.024, C.furLight, kneeR);
  }
  paw(anL, V(0.15, -0.05, 1), V(1, 0, -0.15), V(0, -1, 0), ankleL, 1.15);
  paw(anR, V(-1, 0.1, -0.2), UP, V(0, 0, -1), ankleR, 1.15);

  return b.root;
}
```