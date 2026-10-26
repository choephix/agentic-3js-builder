import * as THREE from "three";
import { createBuilder, polyline, rng, countershade, mottle, paint, svg, DEG } from "../../../../src/index";

export const meta = {
  name: "Strandbeest",
  description:
    "A wind-walking beach creature of yellow conduit tubes: eight Jansen-linkage legs on a crankshaft, a bottle-ballast spine, patched canvas sails and two stalk eyes.",
};

// ---------- palette ----------
const PVC = countershade(mottle("#f6cd22", "#d9a612", { size: 0.16, seed: 3 }), "#b98b12", { level: -0.1, soft: 0.5 });
const DARK = "#26262c";
const ZIP = "#2f6db5";
const CAP = "#e8553a";
const CAP2 = "#f2f2ea";
const SAND = "#d8c08a";
const BOTTLE = "#9fdcf0";
const LABEL = "#f4f0e0";
const SHOE = paint((p) => (p.y < 0.05 ? SAND : DARK));
const BOTTLE_PAINT = paint((_p, _n, s) => (s[0] > 0.1 && s[0] < 0.23 ? LABEL : BOTTLE));

// ---------- textures ----------
const SAIL = svg(
  `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="c"><path d="M6 118 L94 118 L85 16 Q50 2 15 16 Z"/></clipPath></defs>
  <path d="M6 118 L94 118 L85 16 Q50 2 15 16 Z" fill="#f1ead8"/>
  <g clip-path="url(#c)">
    <rect x="0" y="0" width="34" height="60" fill="#e6dcc0"/>
    <rect x="66" y="55" width="40" height="70" fill="#e3ebe4"/>
    <rect x="30" y="85" width="40" height="40" fill="#d6e6e4"/>
    <path d="M0 100 Q12 92 25 100 T50 100 T75 100 T100 100" stroke="#3a8f9c" stroke-width="3" fill="none"/>
    <path d="M0 108 Q12 100 25 108 T50 108 T75 108 T100 108" stroke="#3a8f9c" stroke-width="2" fill="none"/>
    <path d="M34 0 V120 M66 0 V120 M0 60 H100 M0 85 H100" stroke="#a69b7c" stroke-width="1.4" stroke-dasharray="3 2.5" fill="none"/>
  </g>
  <path d="M6 118 L94 118 L85 16 Q50 2 15 16 Z" fill="none" stroke="#8d8368" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="12" cy="112" r="2.5" fill="#555"/><circle cx="88" cy="112" r="2.5" fill="#555"/>
  <circle cx="20" cy="20" r="2.5" fill="#555"/><circle cx="80" cy="20" r="2.5" fill="#555"/>
</svg>`,
  { size: 256 },
);
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="#fffdf4" stroke="#26262c" stroke-width="5"/>
  <circle cx="54" cy="56" r="25" fill="#2d8aa6"/>
  <circle cx="54" cy="56" r="14" fill="#111"/>
  <circle cx="45" cy="46" r="7" fill="#fff"/><circle cx="62" cy="65" r="3.5" fill="#fff"/>
  <path d="M6 38 Q50 -2 94 38" stroke="#26262c" stroke-width="7" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

// ---------- Jansen linkage (2D, y up, x forward) ----------
type V = { x: number; y: number };
const O: V = { x: 0, y: 0 };
const A: V = { x: 38, y: 7.8 };
let ref: V[] | null = null;
const circ = (p: V, q: V, r1: number, r2: number): V[] => {
  const dx = q.x - p.x,
    dy = q.y - p.y;
  const d = Math.max(Math.hypot(dx, dy), 1e-6);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r1 * r1 - a * a, 0));
  const ux = dx / d,
    uy = dy / d;
  const mx = p.x + ux * a,
    my = p.y + uy * a;
  return [
    { x: mx - uy * h, y: my + ux * h },
    { x: mx + uy * h, y: my - ux * h },
  ];
};
const pickAt = (i: number, c: V[], rule: (c: V[]) => V): V => {
  if (!ref) return rule(c);
  const r = ref[i];
  return Math.hypot(c[0].x - r.x, c[0].y - r.y) <= Math.hypot(c[1].x - r.x, c[1].y - r.y) ? c[0] : c[1];
};
const maxY = (c: V[]) => (c[0].y > c[1].y ? c[0] : c[1]);
const minY = (c: V[]) => (c[0].y < c[1].y ? c[0] : c[1]);
const minX = (c: V[]) => (c[0].x < c[1].x ? c[0] : c[1]);
function leg(th: number) {
  const C: V = { x: A.x + 15 * Math.cos(th), y: A.y + 15 * Math.sin(th) };
  const P2 = pickAt(0, circ(O, C, 41.5, 50), maxY);
  const P3 = pickAt(1, circ(O, C, 39.3, 61.9), minY);
  const P4 = pickAt(2, circ(P2, P3, 55.8, 40.1), minX);
  const P5 = pickAt(3, circ(P3, P4, 39.4, 36.7), minY);
  const P6 = pickAt(4, circ(P4, P5, 65.7, 49), minY);
  if (!ref) ref = [P2, P3, P4, P5, P6];
  return { C, P2, P3, P4, P5, P6 };
}

export default function build() {
  const S = 0.0135;
  const R = rng(7);
  leg(0);
  const X_OFF = [0.42, 0.57, 0.72, 0.87];
  const PHASE = [0, 90, 180, 270];
  const sides = [1, -1];

  // pre-pass: floor height and fore-aft centering
  let minFoot = Infinity,
    sumX = 0,
    n = 0;
  for (const s of sides)
    for (let i = 0; i < 4; i++) {
      const L = leg((PHASE[i] + (s < 0 ? 45 : 0)) * DEG);
      minFoot = Math.min(minFoot, L.P6.y);
      sumX += L.P6.x;
      n++;
    }
  const yO = -minFoot * S + 0.02;
  const zO = -(sumX / n) * S;
  const yA = yO + A.y * S;
  const zA = zO + A.x * S;
  const YT = yO + 1.0;

  const b = createBuilder({ name: "strandbeest" });
  const body = b.joint("body", { at: [0, yO, 0], role: "spine" });

  const tube = (a: THREE.Vector3 | number[], c: THREE.Vector3 | number[], bone: any, r = 0.016, color: any = PVC) =>
    b.rod(a as any, c as any, r, color, { bone, sides: 8 });
  const bolt = (p: THREE.Vector3 | number[], bone: any, r = 0.02, len = 0.07) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), DARK, { bone, at: p as any, dir: [1, 0, 0] });
  const collar = (p: THREE.Vector3 | number[], d: number[], bone: any, r = 0.026) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.045, 8), ZIP, { bone, at: p as any, dir: d as any });
  const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- legs ----------
  for (const s of sides) {
    const t = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const L = leg((PHASE[i] + (s < 0 ? 45 : 0)) * DEG);
      const x = s * X_OFF[i];
      const W = (v: V) => V3(x, yO + v.y * S, zO + v.x * S);
      const [pO, pA, pC, p2, p3, p4, p5, p6] = [W(O), W(A), W(L.C), W(L.P2), W(L.P3), W(L.P4), W(L.P5), W(L.P6)];
      const ch = b.chain(`leg${t}${i}`, polyline([pO, p4, p6]), {
        parent: body,
        names: [`hip${t}${i}`, `knee${t}${i}`, `foot${t}${i}`],
        role: "leg",
        contact: [x, 0, p6.z],
      });
      const hip = ch.joints[0],
        knee = ch.joints[1],
        foot = ch.tip!;
      const crank = b.joint(`crank${t}${i}`, { parent: body, at: pA, dir: [s, 0, 0] });
      tube(pA, pC, crank, 0.013);
      bolt(pC, crank, 0.022, 0.08);
      tube(pO, p2, hip);
      tube(pO, p3, hip);
      tube(pC, p2, hip, 0.012);
      tube(pC, p3, hip, 0.012);
      tube(p2, p4, knee);
      tube(p3, p4, knee);
      tube(p3, p5, knee);
      tube(p4, p5, knee);
      tube(p4, p6, foot, 0.017);
      tube(p5, p6, foot, 0.014);
      for (const [p, bn] of [[pO, hip], [p2, hip], [p3, hip], [p4, knee], [p5, knee], [p6, foot]] as const) bolt(p, bn);
      // sand-dusted rubber shoe
      b.part(new THREE.BoxGeometry(0.075, 0.04, 0.17), SHOE, { bone: foot, at: p6.clone().add(V3(0, -0.005, 0.03)) });
      b.part(new THREE.BoxGeometry(0.06, 0.012, 0.05), DARK, { bone: foot, at: p6.clone().add(V3(0, 0.025, -0.03)) });
    }
  }

  // ---------- frame ----------
  const frames = [1.0, 0.28];
  for (const s of sides)
    for (const fx of frames) {
      const x = s * fx;
      const Bk = V3(x, YT, -1.25),
        Fr = V3(x, YT, 1.25),
        Ps = V3(x, yO, zO),
        Ac = V3(x, yA, zA);
      const r = fx > 0.5 ? 0.022 : 0.018;
      tube(Bk, Fr, body, r);
      tube(Bk, Ps, body, r);
      tube(Fr, Ac, body, r);
      tube(Ps, Ac, body, r);
      tube(Bk, Ac, body, 0.015);
      tube(Fr, Ps, body, 0.015);
      tube(Ps, V3(x, YT, zO), body, 0.015);
      tube(Ac, V3(x, YT, zA), body, 0.015);
      for (const p of [Bk, Fr, Ps, Ac]) collar(p, [0, 1, 0], body);
    }
  // cross beams (x direction)
  const crossZ = [-1.25, -0.4, 0.4, 1.25];
  for (const z of crossZ) {
    tube(V3(-1.0, YT, z), V3(1.0, YT, z), body, 0.02);
    for (const sx of [-1, 1]) for (const fx of frames) collar(V3(sx * fx, YT, z), [1, 0, 0], body, 0.028);
  }
  // pivot rod and crankshaft
  tube(V3(-1.08, yO, zO), V3(1.08, yO, zO), body, 0.024, "#c9ccd2");
  tube(V3(-1.08, yA, zA), V3(1.08, yA, zA), body, 0.03, "#c9ccd2");
  for (const sx of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12), DARK, { bone: body, at: V3(sx * 1.1, yA, zA), dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 10), DARK, { bone: body, at: V3(sx * 1.1, yO, zO), dir: [1, 0, 0] });
  }
  // spine beam with struts
  tube(V3(0, YT + 0.14, -1.25), V3(0, YT + 0.14, 1.25), body, 0.024);
  for (const z of [-1.25, -0.4, 0.4, 1.25]) {
    tube(V3(0, YT, z), V3(0, YT + 0.14, z), body, 0.015);
    collar(V3(0, YT + 0.14, z), [0, 0, 1], body, 0.03);
  }
  // low bracing between sides at the front and back
  tube(V3(-1.0, yO + 0.4, -1.25), V3(1.0, yO + 0.4, -1.25), body, 0.014);
  tube(V3(1.0, YT, -1.25), V3(1.0, yO + 0.4, -1.25), body, 0.014);
  tube(V3(-1.0, YT, -1.25), V3(-1.0, yO + 0.4, -1.25), body, 0.014);

  // ---------- bottle ballast ----------
  const bottleProfile: [number, number][] = [
    [0, 0], [0.072, 0], [0.075, 0.02], [0.075, 0.3], [0.045, 0.35], [0.025, 0.375], [0.025, 0.4], [0, 0.4],
  ];
  const bz = [-1.05, -0.63, -0.21, 0.21, 0.63, 1.05];
  for (const sx of [-1, 1])
    for (let k = 0; k < bz.length; k++) {
      const z0 = bz[k] - 0.2;
      const y = YT + 0.09;
      b.lathe(bottleProfile, { at: V3(sx * 0.64, y, z0), axis: [0, 0, 1], segments: 10, bone: body, color: BOTTLE_PAINT });
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), k % 2 ? CAP : CAP2, {
        bone: body, at: V3(sx * 0.64, y, z0 + 0.415), dir: [0, 0, 1],
      });
      // lashings
      b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.016, 10), ZIP, { bone: body, at: V3(sx * 0.64, y, z0 + 0.2 + (R() - 0.5) * 0.05), dir: [0, 0, 1] });
    }
  // sand-coloured ballast bags hanging from the crank frame
  for (const sx of [-1, 1])
    b.part(new THREE.SphereGeometry(0.1, 7, 5), SAND, { bone: body, at: V3(sx * 1.0, yA - 0.12, zA + 0.02), scale: [0.8, 1.1, 0.9], flat: true });

  // ---------- sails ----------
  for (const z of [-0.85, 0, 0.85]) {
    const base = YT + 0.14;
    tube(V3(0, base, z), V3(0, base + 0.95, z), body, 0.014);
    tube(V3(0, base + 0.95, z - 0.32), V3(0, base + 0.95, z + 0.32), body, 0.01);
    tube(V3(0, base + 0.1, z - 0.4), V3(0, base + 0.1, z + 0.4), body, 0.012);
    const pl = new THREE.PlaneGeometry(0.82, 0.98);
    const cy = base + 0.52;
    b.part(pl, "#ffffff", { bone: body, at: V3(0.006, cy, z), dir: [1, 0, 0], axis: "z", texture: SAIL });
    b.part(pl, "#ffffff", { bone: body, at: V3(-0.006, cy, z), dir: [-1, 0, 0], axis: "z", texture: SAIL });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), CAP, { bone: body, at: V3(0, base + 0.99, z) });
  }
  // stay lines
  for (const sx of [-1, 1]) for (const z of [-0.85, 0.85]) b.rod(V3(0, YT + 1.1, z), V3(sx * 0.64, YT + 0.2, z * 1.2), 0.004, "#d8c9a0", { bone: body, sides: 4 });

  // ---------- eyes ----------
  for (const sx of [-1, 1]) {
    const stalkBase = V3(sx * 0.3, YT + 0.14, 1.25);
    const eyeC = V3(sx * 0.34, YT + 0.46, 1.4);
    tube(stalkBase, eyeC.clone().add(V3(0, -0.06, -0.02)), body, 0.014);
    const ball = b.part(new THREE.SphereGeometry(0.11, 10, 8), "#fffdf4", { bone: body, at: eyeC });
    b.decal(ball, EYE, { at: eyeC.clone().add(V3(0, 0, 0.11)), dir: [0, 0, 1], size: [0.17, 0.17], mirror: sx > 0 });
  }
  // beak-like pennant on the nose
  b.spike(V3(0, YT + 0.14, 1.25), [0, 0.1, 1], 0.4, 0.03, { color: CAP, bone: body });

  return b.root;
}
