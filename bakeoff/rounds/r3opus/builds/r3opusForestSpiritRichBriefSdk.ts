import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Mossback Fawn Spirit",
  description:
    "A small forest spirit: a grey river-stone deer body under a quilt of moss, slender wooden legs on little hooves, a pale carved mask with glowing green eyes, flowering antlers and a halo of fireflies.",
};

type P = THREE.Vector3 | number[];

export default function build() {
  const bld: any = createBuilder({ name: "mossbackFawn" });
  const R: any = rng(1337);
  const rand = (): number =>
    typeof R === "function"
      ? R()
      : typeof R.next === "function"
      ? R.next()
      : typeof R.float === "function"
      ? R.float()
      : R.random();
  const rr = (a: number, b: number) => a + (b - a) * rand();
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length) % arr.length];

  // ---------- palette ----------
  const C = {
    stone: "#8e959a",
    stoneDark: "#6c7479",
    stoneLight: "#b4b9b8",
    quartz: "#f2efe4",
    lichen: "#cfc47a",
    moss: ["#5f8f3a", "#77a843", "#4a7a32", "#8fbf4e"],
    mossCap: "#5d8c38",
    wood: "#7a5638",
    woodDark: "#4f3626",
    antler: "#8b6b4b",
    pale: "#efe4c8",
    pale2: "#d6c6a2",
    ochre: "#b4532f",
    eye: "#7dff7a",
    eyeSocket: "#14261a",
    white: "#ffffff",
    nose: "#2a201a",
    hoof: "#2b221d",
    leaf: "#6fb04a",
    leaf2: "#a2d05e",
    petal: "#fbfaf2",
    pollen: "#f4d34a",
    shroom: "#c8442f",
    stem: "#efe6d2",
    innerEar: "#d9a59a",
  };

  // ---------- small math helpers ----------
  const V = (a: P) =>
    a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
  const Yv = new THREE.Vector3(0, 1, 0);
  function orient(geo: THREE.BufferGeometry, dir: P) {
    const d = V(dir).normalize();
    const dot = Math.min(1, Math.max(-1, Yv.dot(d)));
    const ax = new THREE.Vector3().crossVectors(Yv, d);
    if (ax.lengthSq() < 1e-10) {
      if (dot < 0) geo.rotateX(Math.PI);
      return geo;
    }
    ax.normalize();
    geo.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(ax, Math.acos(dot)));
    return geo;
  }
  function basis(n: P) {
    const N = V(n).normalize();
    const ref = Math.abs(N.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const t1 = new THREE.Vector3().crossVectors(N, ref).normalize();
    const t2 = new THREE.Vector3().crossVectors(N, t1).normalize();
    return { N, t1, t2 };
  }
  const part = (geo: THREE.BufferGeometry, color: string, at: P, bone: any) =>
    bld.part(geo, color, { at: V(at), bone });
  function seg(a: P, b: P, r1: number, r2: number, color: string, bone: any, sides = 6) {
    const A = V(a), B = V(b);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), sides, 1);
    orient(g, d);
    return part(g, color, A.add(B).multiplyScalar(0.5), bone);
  }
  function blob(at: P, r: number, color: string, bone: any, normal: P = [0, 1, 0], flat = 0.6) {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.scale(1, flat, 1);
    orient(g, normal);
    return part(g, color, at, bone);
  }
  function ball(at: P, r: number, color: string, bone: any, w = 6, h = 4) {
    return part(new THREE.SphereGeometry(r, w, h), color, at, bone);
  }
  function flower(at: P, normal: P, s: number, bone: any) {
    const { N, t1, t2 } = basis(normal);
    const c = V(at);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + rand();
      const p = c.clone()
        .addScaledVector(t1, Math.cos(a) * s)
        .addScaledVector(t2, Math.sin(a) * s);
      const g = new THREE.SphereGeometry(s * 0.75, 5, 3);
      g.scale(1, 0.35, 1);
      orient(g, N);
      part(g, C.petal, p, bone);
    }
    ball(c.clone().addScaledVector(N, s * 0.2), s * 0.45, C.pollen, bone, 5, 3);
  }
  function leaf(at: P, dir: P, len: number, bone: any, color = C.leaf) {
    const d = V(dir).normalize();
    const g = new THREE.OctahedronGeometry(1, 0);
    g.scale(len * 0.38, len * 0.5, len * 0.08);
    orient(g, d);
    part(g, color, V(at).addScaledVector(d, len * 0.5), bone);
  }

  // ---------- skeleton ----------
  const H = new THREE.Vector3(0, 0.84, 0.34);
  const hips = bld.joint("hips", { at: [0, 0.5, -0.18], role: "spine" });
  const spine = bld.joint("spine", { at: [0, 0.52, 0.02], parent: hips, role: "spine" });
  const chest = bld.joint("chest", { at: [0, 0.55, 0.18], parent: spine, role: "spine" });
  const neck = bld.joint("neck", { at: [0, 0.62, 0.22], parent: chest, role: "neck" });
  const head = bld.joint("head", { at: H, parent: neck, role: "head" });
  const jaw = bld.joint("jaw", { at: H.clone().add(new THREE.Vector3(0, -0.04, 0.05)), parent: head, role: "jaw" });
  const antlerBaseL = H.clone().add(new THREE.Vector3(0.035, 0.07, -0.005));
  const antlerBaseR = H.clone().add(new THREE.Vector3(-0.035, 0.07, -0.005));
  const antlerL = bld.joint("antlerL", { at: antlerBaseL, parent: head, role: "head" });
  const antlerR = bld.joint("antlerR", { at: antlerBaseR, parent: head, role: "head" });
  const earL = bld.joint("earL", { at: H.clone().add(new THREE.Vector3(0.06, 0.035, -0.01)), parent: head, role: "hinge" });
  const earR = bld.joint("earR", { at: H.clone().add(new THREE.Vector3(-0.06, 0.035, -0.01)), parent: head, role: "hinge" });
  const tail1 = bld.joint("tail1", { at: [0, 0.56, -0.29], parent: hips, role: "tail" });
  const tail2 = bld.joint("tail2", { at: [0, 0.62, -0.36], parent: tail1, role: "tail" });

  // legs
  type Leg = { top: THREE.Vector3; mid: THREE.Vector3; low: THREE.Vector3; foot: THREE.Vector3; j: any[] };
  const legs: Leg[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fx = 0.12 * s, lx = 0.13 * s;
    const fTop = new THREE.Vector3(fx, 0.46, 0.18);
    const fMid = new THREE.Vector3(lx, 0.26, 0.2);
    const fLow = new THREE.Vector3(lx, 0.075, 0.19);
    const fFoot = new THREE.Vector3(lx, 0.035, 0.2);
    const sh = bld.joint("shoulder" + L, { at: fTop, parent: chest, role: "leg" });
    const el = bld.joint("elbow" + L, { at: fMid, parent: sh, role: "leg" });
    const wr = bld.joint("wrist" + L, { at: fLow, parent: el, role: "leg" });
    const hf = bld.joint("hoofF" + L, { at: fFoot, parent: wr, role: "leg" });
    legs.push({ top: fTop, mid: fMid, low: fLow, foot: fFoot, j: [sh, el, wr, hf] });

    const hTop = new THREE.Vector3(fx, 0.46, -0.18);
    const hMid = new THREE.Vector3(lx, 0.3, -0.14);
    const hLow = new THREE.Vector3(lx, 0.16, -0.24);
    const hFoot = new THREE.Vector3(lx, 0.035, -0.21);
    const hp = bld.joint("hip" + L, { at: hTop, parent: hips, role: "leg" });
    const kn = bld.joint("knee" + L, { at: hMid, parent: hp, role: "leg" });
    const hk = bld.joint("hock" + L, { at: hLow, parent: kn, role: "leg" });
    const hh = bld.joint("hoofH" + L, { at: hFoot, parent: hk, role: "leg" });
    legs.push({ top: hTop, mid: hMid, low: hLow, foot: hFoot, j: [hp, kn, hk, hh] });
  }

  // ---------- stone body ----------
  const BC = new THREE.Vector3(0, 0.52, 0);
  const BR = new THREE.Vector3(0.2, 0.17, 0.3);
  const ell = (az: number, el: number, s = 1) => {
    const ce = Math.cos(el), se = Math.sin(el);
    const p = new THREE.Vector3(BR.x * ce * Math.sin(az) * s, BR.y * se * s, BR.z * ce * Math.cos(az) * s).add(BC);
    const n = new THREE.Vector3(
      (ce * Math.sin(az)) / BR.x,
      se / BR.y,
      (ce * Math.cos(az)) / BR.z
    ).normalize();
    return { p, n };
  };
  const boneFor = (z: number) => (z > 0.1 ? chest : z < -0.1 ? hips : spine);

  {
    const g = new THREE.IcosahedronGeometry(1, 1);
    g.scale(BR.x, BR.y, BR.z);
    part(g, C.stone, BC, spine);
    // darker river-wet belly
    const g2 = new THREE.IcosahedronGeometry(1, 1);
    g2.scale(BR.x * 0.9, BR.y * 0.75, BR.z * 0.9);
    part(g2, C.stoneDark, BC.clone().add(new THREE.Vector3(0, -0.045, 0)), spine);
  }
  // quartz veins wrapping the stone
  for (const z0 of [-0.09, 0.05]) {
    const f = Math.sqrt(1 - (z0 / BR.z) ** 2);
    const g = new THREE.TorusGeometry(1, 0.012, 4, 22);
    g.scale(BR.x * f * 1.0, BR.y * f * 1.0, 1);
    part(g, C.quartz, new THREE.Vector3(0, BC.y, z0), spine);
  }
  // lichen spots and embedded pebbles on the flanks
  for (let i = 0; i < 16; i++) {
    const az = rr(0, Math.PI * 2), el = rr(-0.35, 0.3);
    const { p, n } = ell(az, el, 0.995);
    const g = new THREE.CylinderGeometry(rr(0.012, 0.026), rr(0.012, 0.026), 0.014, 7);
    orient(g, n);
    part(g, i % 3 === 0 ? C.stoneLight : C.lichen, p, boneFor(p.z));
  }
  for (let i = 0; i < 6; i++) {
    const az = rr(0, Math.PI * 2), el = rr(-0.5, 0.1);
    const { p, n } = ell(az, el, 0.99);
    blob(p, rr(0.018, 0.03), pick([C.stoneLight, C.stoneDark, C.quartz]), boneFor(p.z), n, 0.55);
  }

  // ---------- moss blanket ----------
  {
    const g = new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.4);
    g.scale(BR.x * 1.04, BR.y * 1.06, BR.z * 1.04);
    part(g, C.mossCap, BC, spine);
  }
  // fluffy tufts over the back
  for (let i = 0; i < 70; i++) {
    const az = rr(0, Math.PI * 2), el = rr(0.4, 1.5);
    const { p, n } = ell(az, el, 1.05);
    blob(p, rr(0.022, 0.045), pick(C.moss), boneFor(p.z), n, 0.55);
  }
  // drippy moss rim
  for (let i = 0; i < 26; i++) {
    const az = (i / 26) * Math.PI * 2 + rr(-0.08, 0.08);
    const { p, n } = ell(az, rr(0.22, 0.34), 1.035);
    blob(p, rr(0.02, 0.034), pick(C.moss), boneFor(p.z), n, 0.7);
    if (i % 3 === 0) {
      const d = ell(az, 0.08, 1.02);
      blob(d.p, rr(0.012, 0.018), pick(C.moss), boneFor(d.p.z), d.n, 0.9);
    }
  }
  // flowers and toadstools nestled in the moss
  for (const [az, el] of [[0.9, 1.0], [-2.2, 0.8], [2.7, 0.7], [-0.6, 1.2]]) {
    const { p, n } = ell(az, el, 1.07);
    flower(p, n, 0.014, boneFor(p.z));
  }
  for (const [az, el, h] of [[2.1, 0.75, 0.045], [2.35, 0.65, 0.03], [-1.2, 0.9, 0.038]]) {
    const { p, n } = ell(az, el, 1.04);
    const bone = boneFor(p.z);
    const top = p.clone().addScaledVector(n, h);
    seg(p, top, 0.007, 0.006, C.stem, bone, 5);
    const cap = new THREE.SphereGeometry(h * 0.55, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.scale(1, 0.75, 1);
    orient(cap, n);
    part(cap, C.shroom, top, bone);
    const { t1, t2 } = basis(n);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7;
      const dp = top.clone()
        .addScaledVector(n, h * 0.3)
        .addScaledVector(t1, Math.cos(a) * h * 0.28)
        .addScaledVector(t2, Math.sin(a) * h * 0.28);
      ball(dp, h * 0.07, C.petal, bone, 4, 3);
    }
  }

  // ---------- neck ----------
  const N0 = new THREE.Vector3(0, 0.6, 0.2);
  const N1 = H.clone().add(new THREE.Vector3(0, -0.04, -0.04));
  seg(N0, N1, 0.095, 0.06, C.stone, neck, 7);
  {
    const nd = N1.clone().sub(N0).normalize();
    const { t1, t2 } = basis(nd);
    // moss ruff around the neck base
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const c = N0.clone().lerp(N1, 0.22);
      const rad = new THREE.Vector3().addScaledVector(t1, Math.cos(a)).addScaledVector(t2, Math.sin(a));
      blob(c.clone().addScaledVector(rad, 0.085), rr(0.026, 0.036), pick(C.moss), neck, rad, 0.6);
    }
    // quartz fleck on the throat
    blob(N0.clone().lerp(N1, 0.55).add(new THREE.Vector3(0, -0.02, 0.07)), 0.016, C.quartz, neck, [0, -0.3, 1], 0.4);
  }

  // ---------- head & mask ----------
  {
    const skull = new THREE.IcosahedronGeometry(1, 1);
    skull.scale(0.075, 0.07, 0.08);
    part(skull, C.woodDark, H.clone().add(new THREE.Vector3(0, 0.005, -0.01)), head);

    // pale carved mask (pentagonal, flat face up)
    const mA = H.clone().add(new THREE.Vector3(0, 0.01, 0.0));
    const mB = H.clone().add(new THREE.Vector3(0, -0.035, 0.17));
    const mr1 = 0.078, mr2 = 0.034;
    seg(mA, mB, mr1, mr2, C.pale, head, 5);
    const md = mB.clone().sub(mA).normalize();
    const up = Yv.clone().addScaledVector(md, -Yv.dot(md)).normalize();
    const side = new THREE.Vector3().crossVectors(up, md).normalize(); // points +X
    const onMask = (t: number, upAmt: number, sideAmt: number) => {
      const r = mr1 + (mr2 - mr1) * t;
      return mA.clone().lerp(mB, t).addScaledVector(up, r * upAmt).addScaledVector(side, r * sideAmt);
    };
    // forehead ochre stripe and dots
    const fh = new THREE.BoxGeometry(0.012, 0.006, 0.07);
    orient(fh, up);
    for (let k = 0; k < 3; k++) {
      const p = onMask(0.2 + k * 0.18, 0.84, 0);
      const g = new THREE.CylinderGeometry(0.009 - k * 0.002, 0.009 - k * 0.002, 0.008, 5);
      orient(g, up);
      part(g, C.ochre, p, head);
    }
    // eyes: dark socket, glowing iris, sparkle
    for (const s of [1, -1]) {
      const sock = onMask(0.3, 0.38, 0.8 * s);
      const n = up.clone().multiplyScalar(0.35).addScaledVector(side, s).addScaledVector(md, 0.25).normalize();
      const sg = new THREE.CylinderGeometry(0.024, 0.026, 0.012, 7);
      orient(sg, n);
      part(sg, C.eyeSocket, sock, head);
      ball(sock.clone().addScaledVector(n, 0.008), 0.017, C.eye, head, 8, 6);
      ball(sock.clone().addScaledVector(n, 0.021).addScaledVector(up, 0.006).addScaledVector(md, 0.004), 0.0045, C.white, head, 4, 3);
      // cheek tear marks
      for (let k = 0; k < 3; k++) {
        const p = onMask(0.42 + k * 0.1, 0.0, 0.83 * s);
        const g = new THREE.CylinderGeometry(0.005, 0.005, 0.006, 5);
        orient(g, side.clone().multiplyScalar(s));
        part(g, C.ochre, p, head);
      }
    }
    // nose
    ball(mB.clone().addScaledVector(md, 0.006).addScaledVector(up, 0.012), 0.016, C.nose, head, 6, 4);
    // lower jaw
    const jA = H.clone().add(new THREE.Vector3(0, -0.05, 0.05));
    const jB = H.clone().add(new THREE.Vector3(0, -0.065, 0.155));
    seg(jA, jB, 0.034, 0.018, C.pale2, jaw, 5);
    // moss tuft between antlers + forelock
    for (let i = 0; i < 6; i++) {
      blob(H.clone().add(new THREE.Vector3(rr(-0.03, 0.03), 0.07, rr(-0.05, 0.02))), rr(0.018, 0.026), pick(C.moss), head);
    }
    flower(H.clone().add(new THREE.Vector3(0.012, 0.088, -0.03)), [0.2, 1, -0.2], 0.01, head);
  }
  // leaf-shaped ears
  for (const [s, ej] of [[1, earL], [-1, earR]] as [number, any][]) {
    const base = H.clone().add(new THREE.Vector3(0.06 * s, 0.035, -0.01));
    const dir = new THREE.Vector3(1 * s, 0.45, -0.25).normalize();
    const len = 0.1;
    const g = new THREE.ConeGeometry(0.03, len, 4);
    g.scale(1, 1, 0.35);
    orient(g, dir);
    part(g, C.pale2, base.clone().addScaledVector(dir, len * 0.5), ej);
    const g2 = new THREE.ConeGeometry(0.018, len * 0.75, 4);
    g2.scale(1, 1, 0.3);
    orient(g2, dir);
    part(g2, C.innerEar, base.clone().addScaledVector(dir, len * 0.42).add(new THREE.Vector3(0, 0, 0.007)), ej);
  }

  // ---------- antlers ----------
  function antler(start: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number, bone: any, s: number) {
    const end = start.clone().addScaledVector(dir, len);
    seg(start, end, r, r * 0.72, C.antler, bone, 5);
    ball(end, r * 0.78, C.antler, bone, 5, 3);
    if (depth === 0) {
      flower(end.clone().addScaledVector(dir, 0.006), dir, 0.013, bone);
      return;
    }
    if (rand() < 0.75) {
      const ld = dir.clone().add(new THREE.Vector3(rr(-0.8, 0.8), rr(-0.2, 0.5), rr(-0.8, 0.8))).normalize();
      leaf(start.clone().lerp(end, rr(0.4, 0.8)), ld, rr(0.03, 0.045), bone, rand() < 0.5 ? C.leaf : C.leaf2);
    }
    const d1 = dir.clone().add(new THREE.Vector3(0.28 * s + rr(-0.08, 0.08), 0.12, -0.12 + rr(-0.06, 0.06))).normalize();
    const d2 = dir.clone().add(new THREE.Vector3(0.08 * s, -0.05 + rr(-0.05, 0.05), 0.5 + rr(-0.1, 0.1))).normalize();
    antler(end, d1, len * 0.82, r * 0.75, depth - 1, bone, s);
    antler(end, d2, len * 0.58, r * 0.62, depth - 1, bone, s);
  }
  antler(antlerBaseL, new THREE.Vector3(0.35, 1, -0.15).normalize(), 0.085, 0.012, 3, antlerL, 1);
  antler(antlerBaseR, new THREE.Vector3(-0.35, 1, -0.15).normalize(), 0.085, 0.012, 3, antlerR, -1);
  // burr rings at the antler bases
  for (const [p, j] of [[antlerBaseL, antlerL], [antlerBaseR, antlerR]] as [THREE.Vector3, any][]) {
    const g = new THREE.TorusGeometry(0.014, 0.006, 4, 7);
    g.rotateX(Math.PI / 2);
    part(g, C.woodDark, p.clone().add(new THREE.Vector3(0, 0.006, 0)), j);
  }

  // ---------- legs ----------
  legs.forEach((lg, i) => {
    const [jTop, jMid, jLow, jFoot] = lg.j;
    seg(lg.top, lg.mid, 0.03, 0.019, C.wood, jTop, 6);
    ball(lg.mid, 0.022, C.woodDark, jMid, 6, 4);
    seg(lg.mid, lg.low, 0.017, 0.012, C.wood, jMid, 6);
    ball(lg.low, 0.014, C.woodDark, jLow, 6, 4);
    seg(lg.low, lg.foot, 0.012, 0.012, C.wood, jLow, 6);
    // bark rings
    for (const t of [0.35, 0.65]) {
      const p = lg.mid.clone().lerp(lg.low, t);
      const g = new THREE.TorusGeometry(0.015 - t * 0.003, 0.003, 3, 7);
      g.rotateX(Math.PI / 2);
      orient(g, lg.low.clone().sub(lg.mid));
      part(g, C.woodDark, p, jMid);
    }
    // moss garter where the leg leaves the stone
    {
      const p = lg.top.clone().lerp(lg.mid, 0.48);
      const g = new THREE.TorusGeometry(0.025, 0.011, 4, 8);
      g.rotateX(Math.PI / 2);
      orient(g, lg.mid.clone().sub(lg.top));
      part(g, pick(C.moss), p, jTop);
    }
    // little sprouting leaf on the shin
    const sx = Math.sign(lg.top.x);
    leaf(lg.mid.clone().lerp(lg.low, 0.25).add(new THREE.Vector3(0.012 * sx, 0, 0)), [sx, 0.9, i % 2 ? -0.3 : 0.3], 0.032, jMid, C.leaf2);
    // hoof
    const hoof = new THREE.CylinderGeometry(0.016, 0.023, 0.035, 6);
    part(hoof, C.hoof, new THREE.Vector3(lg.foot.x, 0.0175, lg.foot.z + 0.004), jFoot);
    const cleft = new THREE.BoxGeometry(0.003, 0.03, 0.02);
    part(cleft, C.woodDark, new THREE.Vector3(lg.foot.x, 0.016, lg.foot.z + 0.018), jFoot);
  });

  // ---------- tail: a mossy stone tuft ----------
  {
    const t0 = new THREE.Vector3(0, 0.56, -0.29);
    const t1p = new THREE.Vector3(0, 0.62, -0.36);
    const g = new THREE.ConeGeometry(0.045, 0.1, 6);
    orient(g, t1p.clone().sub(t0));
    part(g, C.stoneLight, t0.clone().lerp(t1p, 0.55), tail1);
    for (let i = 0; i < 5; i++) {
      blob(t1p.clone().add(new THREE.Vector3(rr(-0.025, 0.025), rr(-0.03, 0.01), rr(-0.02, 0.02))), rr(0.018, 0.026), pick(C.moss), tail2);
    }
    ball(t1p.clone().add(new THREE.Vector3(0, -0.06, -0.01)), 0.022, C.petal, tail1, 6, 4);
    flower(t1p.clone().add(new THREE.Vector3(0, 0.02, 0)), [0, 1, -0.4], 0.012, tail2);
  }

  // ---------- fireflies (hovering, glowing) ----------
  const glowMat = new THREE.MeshStandardMaterial({ color: "#fff6a0", emissive: "#d8ff5a", emissiveIntensity: 2.2 });
  const haloMat = new THREE.MeshStandardMaterial({
    color: "#efff9a", emissive: "#c8ff4a", emissiveIntensity: 1.2, transparent: true, opacity: 0.22, depthWrite: false,
  });
  const bodyMat = new THREE.MeshStandardMaterial({ color: "#2b2a1e", roughness: 0.8 });
  const wingMat = new THREE.MeshStandardMaterial({ color: "#e8f4ff", transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const fc = H.clone().add(new THREE.Vector3(0, 0.12, -0.02));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rr(-0.2, 0.2);
    const rad = rr(0.2, 0.3);
    const p = fc.clone().add(new THREE.Vector3(Math.cos(a) * rad, rr(-0.1, 0.14), Math.sin(a) * rad));
    const g = new THREE.Group();
    g.position.copy(p);
    g.rotation.y = -a;
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.006, 5, 4), bodyMat);
    body.position.set(0, 0.004, 0.006);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 4), glowMat);
    const halo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 1), haloMat);
    g.add(body, glow, halo);
    for (const s of [1, -1]) {
      const w = new THREE.Mesh(new THREE.CircleGeometry(0.009, 5), wingMat);
      w.position.set(0.008 * s, 0.01, 0.004);
      w.rotation.set(-Math.PI / 2 + 0.5, 0, 0.5 * s);
      g.add(w);
    }
    bld.root.add(g);
  }

  return bld.root;
}
