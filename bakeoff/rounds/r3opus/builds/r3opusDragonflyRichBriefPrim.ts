import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly (Anax imperator) hovering above a pond: electric-blue abdomen with a black dorsal stripe, apple-green thorax, huge wraparound turquoise eyes, and four flat, glassy, gold-tinted wings netted with dark veins. Real scale, rigged in a rest pose.",
};

type V2 = [number, number];

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly" });

  const H = 0.3; // hover height of the body axis (m)
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const arr = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];

  // ---------- palette ----------
  const C = {
    blue: "#1593ff",
    blueBase: "#2bb3e6",
    black: "#0d1420",
    green: "#7ed957",
    greenDark: "#3f7a2c",
    greenPale: "#c4ea72",
    stripe: "#2c4a22",
    eye: "#26d0c9",
    eyeCap: "#1b6fa8",
    eyeGlint: "#f4ffff",
    pupil: "#0b2a3a",
    face: "#c9e04a",
    lip: "#dcd46a",
    labium: "#bfa85a",
    occiput: "#26352a",
    legFemur: "#2a2420",
    leg: "#151517",
    vein: "#2a2418",
    stigma: "#7a4b1d",
    glass: "#eadfa8",
    amber: "#e0a640",
    root: "#24331f",
    ocellus: "#f2e27a",
  };

  // ---------- helpers ----------
  function rod(
    a: THREE.Vector3,
    c: THREE.Vector3,
    r: number,
    color: string,
    bone: any,
    rTop: number = r,
    seg = 5
  ) {
    const d = new THREE.Vector3().subVectors(c, a);
    const len = d.length();
    if (len < 1e-6) return;
    d.normalize();
    const m = a.clone().add(c).multiplyScalar(0.5);
    const geo = new THREE.CylinderGeometry(rTop, r, len, seg, 1, false);
    b.part(geo, color, { at: arr(m), dir: arr(d), bone });
  }
  function ball(
    p: THREE.Vector3,
    r: number,
    color: string,
    bone: any,
    sx = 1,
    sy = 1,
    sz = 1,
    ws = 7,
    hs = 5
  ) {
    const geo = new THREE.SphereGeometry(r, ws, hs);
    geo.scale(sx, sy, sz);
    b.part(geo, color, { at: arr(p), bone });
  }
  function box(p: THREE.Vector3, w: number, h: number, d: number, color: string, bone: any) {
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: arr(p), bone });
  }
  function spike(p: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string, bone: any) {
    const d = dir.clone().normalize();
    const geo = new THREE.ConeGeometry(r, len, 3);
    b.part(geo, color, { at: arr(p.clone().addScaledVector(d, len * 0.5)), dir: arr(d), bone });
  }

  // ---------- skeleton ----------
  const thoraxC = V(0, H, 0.0115);
  const thorax = b.joint("thorax", { at: arr(thoraxC), aim: [0, H, 0.03], role: "spine" } as any);

  const headP = V(0, H + 0.0005, 0.0205);
  const head = b.joint("head", { at: arr(headP), parent: thorax, aim: [0, H + 0.0005, 0.04], role: "head" } as any);
  const jawP = V(0, H - 0.0028, 0.0282);
  const jaw = b.joint("jaw", { at: arr(jawP), parent: head, aim: [0, H - 0.0032, 0.034], role: "jaw" } as any);

  // abdomen
  const segLen = [0.003, 0.006, 0.006, 0.0062, 0.0062, 0.0062, 0.0062, 0.0062, 0.004, 0.003];
  const segR = [0.003, 0.0032, 0.0021, 0.002, 0.0019, 0.0019, 0.002, 0.0021, 0.002, 0.0018];
  const abdPts: THREE.Vector3[] = [];
  {
    let z = 0.0045;
    const total = segLen.reduce((s, v) => s + v, 0);
    let acc = 0;
    for (let i = 0; i <= segLen.length; i++) {
      const t = acc / total;
      abdPts.push(V(0, H - 0.0008 - 0.0025 * t * t, z));
      if (i < segLen.length) {
        z -= segLen[i];
        acc += segLen[i];
      }
    }
  }
  const abd: any[] = [];
  let parentJ: any = thorax;
  for (let i = 0; i < abdPts.length; i++) {
    const name = i < 10 ? `abdomen${i + 1}` : "abdomenTip";
    const opts: any = { at: arr(abdPts[i]), parent: parentJ, role: "tail" };
    if (i < abdPts.length - 1) opts.aim = arr(abdPts[i + 1]);
    else opts.aim = arr(abdPts[i].clone().add(V(0, 0, -0.01)));
    const j = b.joint(name, opts);
    abd.push(j);
    parentJ = j;
  }

  // ---------- head ----------
  for (const s of [1, -1]) {
    const ec = V(s * 0.0029, H + 0.0016, 0.0255);
    const er = 0.0044;
    ball(ec, er, C.eye, head, 1, 0.95, 1.05, 10, 8);
    // darker upper cap
    const cap = new THREE.SphereGeometry(er * 1.02, 10, 4, 0, Math.PI * 2, 0, Math.PI * 0.32);
    cap.scale(1, 0.95, 1.05);
    b.part(cap, C.eyeCap, { at: arr(ec), bone: head });
    // glint and pseudopupil
    const gN = V(s * 0.35, 0.65, 0.55).normalize();
    ball(ec.clone().addScaledVector(gN, er * 0.93), 0.0008, C.eyeGlint, head, 1, 0.6, 1, 6, 4);
    const pN = V(s * 0.85, 0.05, 0.45).normalize();
    ball(ec.clone().addScaledVector(pN, er * 0.95), 0.0007, C.pupil, head, 1, 1, 0.5, 6, 4);
  }
  ball(V(0, H + 0.0004, 0.0222), 0.0029, C.occiput, head, 1.3, 1.1, 0.8);
  // frons (face) with black T-mark
  ball(V(0, H - 0.0005, 0.0296), 0.0024, C.face, head, 1.35, 1, 0.75);
  box(V(0, H + 0.0011, 0.0312), 0.0022, 0.0004, 0.0006, C.black, head);
  box(V(0, H + 0.0002, 0.0316), 0.0005, 0.0016, 0.0004, C.black, head);
  // ocelli
  for (const [x, y] of [[0, 0.0026], [0.0007, 0.0021], [-0.0007, 0.0021]] as V2[]) {
    ball(V(x, H + y, 0.0298), 0.00028, C.ocellus, head, 1, 1, 1, 5, 4);
  }
  // upper jaw (clypeus + labrum)
  box(V(0, H - 0.0019, 0.0304), 0.0034, 0.001, 0.0016, C.lip, head);
  box(V(0, H - 0.0026, 0.0312), 0.0028, 0.0006, 0.0010, C.face, head);
  // lower jaw (labium + mandibles)
  box(V(0, H - 0.0036, 0.0294), 0.003, 0.0008, 0.0022, C.labium, jaw);
  for (const s of [1, -1]) {
    spike(V(s * 0.0009, H - 0.0031, 0.0305), V(-s * 0.4, -0.2, 1), 0.0011, 0.00035, C.black, jaw);
  }
  // antennae
  for (const s of [1, -1]) {
    rod(V(s * 0.0007, H + 0.0012, 0.0312), V(s * 0.0017, H + 0.0026, 0.0336), 0.00012, C.black, head, 0.00006, 3);
  }

  // ---------- thorax ----------
  ball(thoraxC, 1, C.green, thorax, 0.0047, 0.0053, 0.0078, 8, 6);
  ball(V(0, H - 0.0024, 0.0125), 1, C.greenPale, thorax, 0.0036, 0.0028, 0.0058, 7, 5);
  ball(V(0, H + 0.0003, 0.0186), 0.0026, C.greenDark, thorax, 1.2, 1, 0.8);
  box(V(0, H + 0.0049, 0.0105), 0.0016, 0.0008, 0.0075, C.greenDark, thorax);
  for (const s of [1, -1]) {
    rod(V(s * 0.0039, H + 0.0032, 0.0148), V(s * 0.0044, H - 0.0026, 0.0098), 0.00028, C.stripe, thorax, 0.00028, 4);
    rod(V(s * 0.0044, H + 0.0026, 0.0098), V(s * 0.0043, H - 0.0028, 0.0052), 0.00024, C.stripe, thorax, 0.00024, 4);
    ball(V(s * 0.0042, H + 0.001, 0.0172), 0.0006, C.black, thorax, 1, 1, 1, 5, 4); // spiracle
  }

  // ---------- abdomen ----------
  for (let i = 0; i < 10; i++) {
    const a = abdPts[i];
    const c = abdPts[i + 1];
    const r = segR[i];
    const rTop = i === 2 ? 0.002 : r * 0.94;
    const rBot = i === 2 ? 0.0027 : r;
    const col = i < 2 ? C.blueBase : C.blue;
    rod(a, c, rBot, col, abd[i], rTop, 8);
    // black intersegment ring
    const dir = c.clone().sub(a).normalize();
    rod(c.clone().addScaledVector(dir, -0.0003), c.clone().addScaledVector(dir, 0.0003), rTop * 1.06, C.black, abd[i], rTop * 1.06, 8);
    const mid = a.clone().add(c).multiplyScalar(0.5);
    const L = segLen[i];
    // dorsal line
    if (i >= 1) {
      rod(a.clone().add(V(0, rBot * 0.97, 0)), c.clone().add(V(0, rTop * 0.97, 0)), 0.00022, C.black, abd[i], 0.00022, 4);
    }
    // dorsal arrow marks
    if (i >= 2 && i <= 8) {
      const g = new THREE.OctahedronGeometry(1, 0);
      g.scale(r * 0.75, r * 0.32, L * 0.42);
      b.part(g, C.black, { at: arr(mid.clone().add(V(0, r * 0.9, -L * 0.08))), bone: abd[i] });
      for (const s of [1, -1]) {
        ball(mid.clone().add(V(s * r * 0.82, r * 0.35, -L * 0.22)), 1, C.black, abd[i], 0.00035, 0.0006, L * 0.18, 5, 4);
      }
    }
    if (i === 1) {
      // S2 "T" marking
      box(mid.clone().add(V(0, r * 0.95, 0.0012)), r * 1.3, 0.0004, 0.0007, C.black, abd[i]);
      box(mid.clone().add(V(0, r * 0.97, -0.0008)), 0.0006, 0.0004, 0.0032, C.black, abd[i]);
      // auricles
      for (const s of [1, -1]) ball(mid.clone().add(V(s * r * 0.95, 0, 0.0008)), 0.0006, C.blueBase, abd[i], 1, 0.7, 1, 5, 4);
    }
  }
  // tip: cerci + epiproct
  {
    const tip = abdPts[10];
    const tj = abd[9];
    for (const s of [1, -1]) {
      const p0 = tip.clone().add(V(s * 0.0006, 0.0003, 0.0004));
      const p1 = tip.clone().add(V(s * 0.0011, 0.0009, -0.0045));
      rod(p0, p1, 0.00035, C.black, tj, 0.00012, 5);
      ball(p1, 0.00016, C.black, tj, 1, 1, 1, 4, 3);
    }
    rod(tip.clone().add(V(0, -0.0004, 0.0003)), tip.clone().add(V(0, -0.0009, -0.0022)), 0.0003, C.black, tj, 0.0001, 4);
  }

  // ---------- wings ----------
  function interp(edge: V2[], u: number) {
    if (u <= edge[0][0]) return edge[0][1];
    for (let i = 0; i < edge.length - 1; i++) {
      const [u0, v0] = edge[i];
      const [u1, v1] = edge[i + 1];
      if (u <= u1) return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0);
    }
    return edge[edge.length - 1][1];
  }

  type WingDef = { key: string; L: number; root: number; sweep: number; dihedral: number; le: V2[]; te: V2[] };
  const fwL = 0.048;
  const hwL = 0.046;
  const wings: WingDef[] = [
    {
      key: "F",
      L: fwL,
      root: 0.0135,
      sweep: 0.07,
      dihedral: 0.03,
      le: [[0, 0.001], [0.25 * fwL, 0.0022], [0.6 * fwL, 0.0028], [0.9 * fwL, 0.0023], [fwL, 0.0004]],
      te: [[0, -0.0012], [0.15 * fwL, -0.004], [0.4 * fwL, -0.0062], [0.7 * fwL, -0.0062], [0.95 * fwL, -0.004], [fwL, 0.0004]],
    },
    {
      key: "H",
      L: hwL,
      root: 0.0075,
      sweep: -0.08,
      dihedral: 0.02,
      le: [[0, 0.0012], [0.3 * hwL, 0.0025], [0.65 * hwL, 0.0028], [0.92 * hwL, 0.002], [hwL, 0.0002]],
      te: [[0, -0.002], [0.06 * hwL, -0.009], [0.2 * hwL, -0.011], [0.45 * hwL, -0.0085], [0.75 * hwL, -0.0065], [0.96 * hwL, -0.0035], [hwL, 0.0002]],
    },
  ];

  const depth = 0.00018;
  for (const w of wings) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const R = V(s * 0.0018, H + 0.0042, w.root);
      const S = V(s, w.dihedral, w.sweep).normalize();
      const Z = V(0, 0, 1);
      const Cd = Z.clone().addScaledVector(S, -Z.dot(S)).normalize();
      const N = new THREE.Vector3().crossVectors(Cd, S).normalize();
      if (N.y < 0) N.negate();
      const P = (u: number, v: number, n = 0) =>
        R.clone().addScaledVector(S, u).addScaledVector(Cd, v).addScaledVector(N, n);

      const wj = b.joint(`wing${w.key}${side}`, { at: arr(R), parent: thorax, aim: arr(P(w.L, 0)), role: "wing" } as any);
      b.joint(`wing${w.key}${side}Tip`, { at: arr(P(w.L, 0)), parent: wj, aim: arr(P(w.L * 1.2, 0)), role: "wing" } as any);

      const makeSheet = (outline: V2[], nOff: number) => {
        const shape = new THREE.Shape(outline.map((p) => new THREE.Vector2(p[0], p[1])));
        const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
        const pos = g.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          const d = pos.getZ(i) - depth / 2 + nOff;
          const q = new THREE.Vector3().addScaledVector(S, u).addScaledVector(Cd, v).addScaledVector(N, d);
          pos.setXYZ(i, q.x, q.y, q.z);
        }
        g.computeVertexNormals();
        return g;
      };

      const outline: V2[] = [...w.le, ...w.te.slice(0, -1).reverse()];
      b.part(makeSheet(outline, 0), C.glass, { at: arr(R), bone: wj });

      // amber flush at the wing base
      const Lb = w.L;
      const patch: V2[] = [
        [0, interp(w.le, 0) * 0.9],
        [0.14 * Lb, interp(w.le, 0.14 * Lb) * 0.9],
        [0.1 * Lb, interp(w.te, 0.1 * Lb) * 0.6],
        [0.02 * Lb, interp(w.te, 0.02 * Lb) * 0.8],
      ];
      b.part(makeSheet(patch, depth * 1.6), C.amber, { at: arr(R), bone: wj });

      // vein net
      const vOn = depth * 0.5 + 0.00006;
      const fracs = [0, 0.18, 0.36, 0.55, 0.75, 1.0];
      const at = (u: number, f: number) => {
        const le = interp(w.le, u);
        const te = interp(w.te, u);
        const v = le + (te - le) * f;
        return P(u, f === 0 ? v - 0.00012 : f === 1 ? v + 0.00012 : v, vOn);
      };
      fracs.forEach((f, k) => {
        const uEnd = f === 0 ? 0.98 * w.L : f === 1 ? 0.96 * w.L : (0.93 - 0.04 * k) * w.L;
        const n = 5;
        const r = f === 0 ? 0.00013 : f === 1 ? 0.00006 : 0.00008;
        for (let i = 0; i < n; i++) {
          const u0 = 0.01 * w.L + ((uEnd - 0.01 * w.L) * i) / n;
          const u1 = 0.01 * w.L + ((uEnd - 0.01 * w.L) * (i + 1)) / n;
          rod(at(u0, f), at(u1, f), r, C.vein, wj, r, 3);
        }
      });
      for (let k = 0; k < fracs.length - 1; k++) {
        for (let j = 0; j < 6; j++) {
          const u = w.L * (0.1 + j * 0.13 + (k % 2) * 0.05 + ((k * 7 + j * 3) % 5) * 0.006);
          if (u > 0.9 * w.L) continue;
          const f0 = fracs[k];
          const f1 = fracs[k + 1];
          rod(at(u, f0), at(u + 0.0006 * ((j + k) % 2 ? 1 : -1), f1), 0.00005, C.vein, wj, 0.00005, 3);
        }
      }
      // nodus + pterostigma
      ball(at(0.48 * w.L, 0.02), 0.00028, C.vein, wj, 1, 0.6, 1, 4, 3);
      rod(at(0.82 * w.L, 0.08), at(0.9 * w.L, 0.08), 0.0003, C.stigma, wj, 0.0003, 4);
      // wing root knob
      ball(R.clone().addScaledVector(N, 0.0002), 0.0008, C.root, wj, 1.4, 0.7, 1.4, 6, 4);
    }
  }

  // ---------- legs (tucked under, basket pose) ----------
  const hipZ = [0.0172, 0.0142, 0.0112];
  const femurV = [V(0.003, -0.0015, 0.0035), V(0.0038, -0.0018, 0.0014), V(0.0045, -0.002, -0.0006)];
  const tibiaV = [V(0.0006, -0.0042, -0.0015), V(0.001, -0.0045, -0.002), V(0.0012, -0.005, -0.0028)];
  const tarsV = V(0.0004, -0.0009, 0.0016);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const mir = (v: THREE.Vector3) => V(v.x * s, v.y, v.z);
      const hipP = V(s * 0.0016, H - 0.0042, hipZ[i]);
      const kneeP = hipP.clone().add(mir(femurV[i]));
      const ankleP = kneeP.clone().add(mir(tibiaV[i]));
      const toeP = ankleP.clone().add(mir(tarsV));
      const n = i + 1;
      const hip = b.joint(`hip${side}${n}`, { at: arr(hipP), parent: thorax, aim: arr(kneeP), role: "leg" } as any);
      const knee = b.joint(`knee${side}${n}`, { at: arr(kneeP), parent: hip, aim: arr(ankleP), role: "leg" } as any);
      const ankle = b.joint(`ankle${side}${n}`, { at: arr(ankleP), parent: knee, aim: arr(toeP), role: "leg" } as any);
      b.joint(`toe${side}${n}`, { at: arr(toeP), parent: ankle, aim: arr(toeP.clone().add(mir(tarsV))), role: "leg" } as any);

      ball(hipP, 0.00045, C.legFemur, hip, 1, 1, 1, 5, 4);
      rod(hipP, kneeP, 0.00036, C.legFemur, hip, 0.0003, 5);
      ball(kneeP, 0.00032, C.leg, knee, 1, 1, 1, 5, 4);
      rod(kneeP, ankleP, 0.00027, C.leg, knee, 0.00022, 5);
      rod(ankleP, toeP, 0.00018, C.leg, ankle, 0.0001, 4);
      // tiny claw
      spike(toeP, mir(V(0.1, -0.6, 0.4)), 0.0005, 0.00008, C.leg, ankle);
      // tibial spines (prey basket)
      for (let k = 1; k <= 3; k++) {
        const p = kneeP.clone().lerp(ankleP, k / 4);
        spike(p, mir(V(-0.6, -0.2, 0.6)), 0.0008, 0.00007, C.leg, knee);
      }
    }
  }

  // ---------- glass wings: transparency and sheen ----------
  const glass = new THREE.Color(C.glass);
  const amber = new THREE.Color(C.amber);
  const close = (a: THREE.Color, c: THREE.Color) =>
    Math.abs(a.r - c.r) + Math.abs(a.g - c.g) + Math.abs(a.b - c.b) < 0.01;
  b.root.traverse((o: any) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    const m = o.material as THREE.MeshStandardMaterial;
    if (!m.color) return;
    if (close(m.color, glass)) {
      m.transparent = true;
      m.opacity = 0.3;
      m.depthWrite = false;
      m.side = THREE.DoubleSide;
      m.roughness = 0.12;
      m.metalness = 0.45;
      if (m.emissive) m.emissive = new THREE.Color("#3a3010");
      o.renderOrder = 2;
    } else if (close(m.color, amber)) {
      m.transparent = true;
      m.opacity = 0.45;
      m.depthWrite = false;
      m.side = THREE.DoubleSide;
      m.roughness = 0.2;
      m.metalness = 0.3;
      o.renderOrder = 3;
    }
  });

  return b.root;
}
