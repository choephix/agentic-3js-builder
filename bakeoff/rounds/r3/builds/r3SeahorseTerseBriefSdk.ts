import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized, rigged seahorse: S-curved ringed body, curled prehensile tail, coronet, tubular snout with a separate jaw, dorsal fan, brood pouch and golden eyes.",
};

type V = [number, number, number];
const V3 = THREE.Vector3;
const UP = new V3(0, 1, 0);

function rodGeo(a: V, b: V, r0: number, r1: number, seg = 6) {
  const A = new V3(...a);
  const B = new V3(...b);
  const d = B.clone().sub(A);
  const len = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()));
  const at = A.clone().add(B).multiplyScalar(0.5).toArray() as V;
  return { g, at };
}

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---------- palette ----------
  const ORANGE = "#e88a2e";
  const DARK = "#a8431a";
  const CREAM = "#f6e0ab";
  const YELLOW = "#f7cf55";
  const GOLD = "#f2b81c";
  const BLACK = "#16110f";
  const WHITE = "#ffffff";

  // ---------- body path (neck -> hips -> tail curl) ----------
  const pts: V[] = [
    [0, 0.135, 0.006], // neck
    [0, 0.108, 0.022], // chest
    [0, 0.08, 0.02], // belly
    [0, 0.05, -0.002], // hips
    [0, 0.034, -0.02], // tail1
    [0, 0.018, -0.03], // tail2
    [0, 0.0085, -0.02], // tail3
    [0, 0.0085, -0.005], // tail4
    [0, 0.015, 0.005], // tail5
    [0, 0.024, 0.003], // tail6
    [0, 0.027, -0.005], // tail7
  ];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: pts[3], role: "spine" });
  const belly = b.joint("belly", { at: pts[2], parent: hips, role: "spine" });
  const chest = b.joint("chest", { at: pts[1], parent: belly, role: "spine" });
  const neck = b.joint("neck", { at: pts[0], parent: chest, role: "neck" });
  const head = b.joint("head", { at: [0, 0.148, 0.016], parent: neck, role: "head" });
  const jaw = b.joint("jaw", { at: [0, 0.14, 0.028], parent: head, role: "jaw" });
  let prev = hips;
  for (let i = 4; i < pts.length; i++) {
    prev = b.joint("tail" + (i - 3), { at: pts[i], parent: prev, role: "tail" });
  }

  // ---------- body ----------
  const table: [number, number][] = [
    [0, 0.009],
    [0.1, 0.016],
    [0.24, 0.024],
    [0.38, 0.021],
    [0.48, 0.015],
    [0.6, 0.011],
    [0.8, 0.0068],
    [1, 0.0028],
  ];
  const rad = (t: number) => {
    for (let i = 1; i < table.length; i++) {
      if (t <= table[i][0]) {
        const [t0, r0] = table[i - 1];
        const [t1, r1] = table[i];
        return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
      }
    }
    return table[table.length - 1][1];
  };
  b.sweep(pts, rad, { color: ORANGE });

  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new V3(...p)), false, "centripetal");
  const frameAt = (t: number) => {
    const p = curve.getPointAt(t);
    const T = curve.getTangentAt(t).normalize();
    const back = new V3().crossVectors(new V3(1, 0, 0), T).normalize(); // dorsal side
    return { p, T, back };
  };

  const ringAt = (pos: V3, dir: V3, R: number, tube: number, color: string, bone?: any) => {
    const g = new THREE.TorusGeometry(R, tube, 4, 10);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V3(0, 0, 1), dir.clone().normalize()));
    b.part(g, color, bone ? { at: pos.toArray() as V, bone } : { at: pos.toArray() as V });
  };

  // dark bands along torso and tail
  for (let t = 0.12; t < 0.96; t += t < 0.5 ? 0.05 : 0.055) {
    const { p, T } = frameAt(t);
    ringAt(p, T, rad(t) * 1.0, 0.0018, DARK);
  }

  // cream belly stripe + brood pouch
  for (const t of [0.1, 0.17, 0.24, 0.31, 0.38, 0.44]) {
    const { p, back } = frameAt(t);
    const r = rad(t);
    const g = new THREE.SphereGeometry(r * 0.8, 7, 5);
    g.scale(0.62, 1.0, 0.95);
    // orient so squashing is front/back: sphere already symmetric, offset to front
    const at = p.clone().addScaledVector(back, -r * 0.3);
    b.part(g, CREAM, { at: at.toArray() as V });
  }
  {
    const { p, back } = frameAt(0.3);
    const g = new THREE.SphereGeometry(0.014, 8, 6);
    g.scale(0.85, 1.15, 0.9);
    b.part(g, CREAM, { at: p.clone().addScaledVector(back, -0.013).toArray() as V });
  }

  // dorsal ridge nubs
  for (let t = 0.04; t < 0.62; t += 0.035) {
    const { p, T, back } = frameAt(t);
    const r = rad(t);
    const base = p.clone().addScaledVector(back, r * 0.92);
    const tip = p.clone().addScaledVector(back, r + 0.006).addScaledVector(T, 0.003);
    const { g, at } = rodGeo(base.toArray() as V, tip.toArray() as V, 0.0028, 0, 5);
    b.part(g, DARK, { at });
  }

  // dorsal fan fin
  {
    const { p, back } = frameAt(0.4);
    const r = rad(0.4);
    const s = new THREE.Shape();
    s.moveTo(0, 0.013);
    s.lineTo(0.008, 0.018);
    s.lineTo(0.015, 0.016);
    s.lineTo(0.021, 0.011);
    s.lineTo(0.024, 0.004);
    s.lineTo(0.022, -0.003);
    s.lineTo(0.016, -0.009);
    s.lineTo(0.009, -0.012);
    s.lineTo(0, -0.012);
    s.lineTo(0, 0.013);
    const depth = 0.0016;
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    g.rotateY(Math.PI / 2); // shape x -> back (-z)
    const at = new V3(0, p.y, p.z + back.z * r * 0.85);
    b.part(g, YELLOW, { at: at.toArray() as V });
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      const dirv = new V3(0, Math.sin(a) * 0.9, -Math.cos(a));
      const st = at.clone().add(new V3(0.0012, 0.0, -0.001));
      const en = st.clone().addScaledVector(dirv, 0.021);
      const rr = rodGeo(st.toArray() as V, en.toArray() as V, 0.0007, 0.0005, 4);
      b.part(rr.g, GOLD, { at: rr.at });
      const st2 = st.clone(); st2.x = -0.0012;
      const en2 = en.clone(); en2.x = -0.0012;
      const r2 = rodGeo(st2.toArray() as V, en2.toArray() as V, 0.0007, 0.0005, 4);
      b.part(r2.g, GOLD, { at: r2.at });
    }
  }

  // pectoral fins
  for (const sx of [1, -1]) {
    const { p } = frameAt(0.1);
    const g = new THREE.SphereGeometry(1, 6, 5);
    g.scale(0.0014, 0.007, 0.006);
    b.part(g, YELLOW, { at: [sx * (rad(0.1) + 0.0005), p.y + 0.003, p.z - 0.008] });
  }

  // ---------- head ----------
  {
    const g = new THREE.SphereGeometry(0.0145, 8, 6);
    g.scale(0.9, 1, 1.2);
    b.part(g, ORANGE, { at: [0, 0.148, 0.016], bone: head });
  }
  // cheek patch
  for (const sx of [1, -1]) {
    const g = new THREE.SphereGeometry(0.006, 6, 5);
    g.scale(0.5, 0.9, 1);
    b.part(g, CREAM, { at: [sx * 0.0112, 0.141, 0.022], bone: head });
  }
  // snout (upper jaw) and lower jaw
  const sA: V = [0, 0.146, 0.026];
  const sB: V = [0, 0.1355, 0.063];
  {
    const r = rodGeo(sA, sB, 0.0078, 0.0042, 6);
    b.part(r.g, ORANGE, { at: r.at, bone: head });
    const lowA: V = [0, 0.1385, 0.028];
    const lowB: V = [0, 0.1315, 0.0595];
    const l = rodGeo(lowA, lowB, 0.0048, 0.0028, 6);
    b.part(l.g, CREAM, { at: l.at, bone: jaw });
    // snout bands
    for (const f of [0.3, 0.62]) {
      const pos = new V3(...sA).lerp(new V3(...sB), f);
      const rr = 0.0078 + (0.0042 - 0.0078) * f;
      ringAt(pos, new V3(...sB).sub(new V3(...sA)), rr, 0.0014, DARK, head);
    }
    // nostril dots
    for (const sx of [1, -1]) {
      const g = new THREE.SphereGeometry(0.0014, 4, 4);
      b.part(g, BLACK, { at: [sx * 0.0035, 0.1405, 0.0535], bone: head });
    }
  }
  // eyes
  for (const sx of [1, -1]) {
    const gold = new THREE.SphereGeometry(0.0055, 7, 6);
    gold.scale(0.5, 1, 1);
    b.part(gold, GOLD, { at: [sx * 0.0125, 0.1525, 0.0215], bone: head });
    const pup = new THREE.SphereGeometry(0.0034, 6, 5);
    pup.scale(0.5, 1, 1);
    b.part(pup, BLACK, { at: [sx * 0.0145, 0.1525, 0.0225], bone: head });
    const hl = new THREE.SphereGeometry(0.0010, 4, 4);
    b.part(hl, WHITE, { at: [sx * 0.0156, 0.1545, 0.0242], bone: head });
    // brow bump
    const br = new THREE.SphereGeometry(0.0035, 5, 4);
    br.scale(0.8, 0.6, 1.3);
    b.part(br, DARK, { at: [sx * 0.0095, 0.1585, 0.0215], bone: head });
    // cheek spine
    const sp = rodGeo([sx * 0.011, 0.1385, 0.008], [sx * 0.0145, 0.1335, 0.001], 0.0028, 0, 5);
    b.part(sp.g, DARK, { at: sp.at, bone: head });
  }
  // coronet
  const crown: [V, V, number][] = [
    [[0, 0.16, 0.008], [0, 0.1745, 0.002], 0.0036],
    [[0.005, 0.1595, 0.01], [0.0105, 0.1705, 0.007], 0.003],
    [[-0.005, 0.1595, 0.01], [-0.0105, 0.1705, 0.007], 0.003],
    [[0, 0.1615, 0.017], [0, 0.169, 0.0235], 0.003],
    [[0, 0.159, -0.001], [0, 0.1665, -0.0085], 0.003],
  ];
  for (const [a, c, r] of crown) {
    const rr = rodGeo(a, c, r, 0, 5);
    b.part(rr.g, YELLOW, { at: rr.at, bone: head });
  }

  // tail tip tuft
  {
    const tip = pts[pts.length - 1];
    const g = new THREE.SphereGeometry(0.0032, 5, 4);
    b.part(g, DARK, { at: [tip[0], tip[1] - 0.001, tip[2] - 0.001] });
  }

  return b.root;
}
