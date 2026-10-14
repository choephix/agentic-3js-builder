```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  gradient,
  scales,
  countershade,
  cells,
} from "agentic-3js-builder";

export const meta = {
  name: "Blue Dasher Dragonfly",
  description:
    "A life-size stylized dragonfly standing on six splayed legs. It has four outstretched lace-veined wings with amber bases and dark pterostigmas, big faceted turquoise eyes, a striped green thorax and a banded powder-blue abdomen. It is rigged with head, jaw, wings, legs and an abdomen chain.",
};

const MM = 0.001;
const P = (x: number, y: number, z: number): [number, number, number] => [x * MM, y * MM, z * MM];

// palette
const INK = "#16161d";
const THX = "#5cc45a";
const THX_TOP = "#2f7a3a";
const THX_LOW = "#a6d86a";
const BLUE = "#3d8fe8";
const LBLUE = "#a6dcff";
const BELLY = "#24324a";
const FACE = "#d6e36a";
const LIP = "#e6d77a";
const LEG = "#1d1c24";
const VEIN = "#2b2d3a";
const GLASS = "#e3f6fb";
const GLASS2 = "#cfe6f7";
const AMBER = "#f0b85a";
const SMOKE = "#b4c8dc";
const STIGMA = "#5a3a22";
const WHITE = "#ffffff";
const DARKG = "#1c2e24";

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // ---------- skeleton ----------
  const thorax = b.joint("thorax", { at: P(0, 14.4, 8), role: "spine" });
  const head = b.joint("head", { parent: thorax, at: P(0, 15, 14), dir: [0, 0, 1], role: "head" });
  const jawAt = P(0, 12.2, 17.6);
  const jawEnd = P(0, 10.6, 19.4);
  const jaw = b.joint("jaw", { parent: head, at: jawAt, aim: jawEnd, role: "jaw" });

  const abdPath = catmull([P(0, 14, 3), P(0, 13.6, -8), P(0, 14.2, -25), P(0, 15.2, -40), P(0, 16.6, -50)]);
  const abd = b.chain("abdomen", abdPath, {
    parent: thorax,
    count: 6,
    names: ["abdomen1", "abdomen2", "abdomen3", "abdomen4", "abdomen5", "abdomen6", "abdomenTip"],
    role: "tail",
  });

  // ---------- thorax ----------
  const thoraxPaint = paint((p, n) => {
    const v = (p.z * 0.8 - p.y * 0.6) / 0.0032;
    const f = v - Math.floor(v);
    if (n.y > 0.75) return THX_TOP;
    if (Math.abs(n.x) > 0.35 && f < 0.28) return INK;
    return n.y < -0.5 ? THX_LOW : THX;
  });
  b.loft(
    [
      { at: P(0, 13.4, 2), w: 5.5 * MM, h: 6.5 * MM },
      { at: P(0, 14.2, 5), w: 8 * MM, h: 9.5 * MM },
      { at: P(0, 14.6, 9), w: 8.5 * MM, h: 10 * MM },
      { at: P(0, 14.2, 12.5), w: 6.5 * MM, h: 7.5 * MM },
      { at: P(0, 14.3, 14), w: 3.5 * MM, h: 4 * MM },
    ],
    { bone: thorax, color: thoraxPaint },
  );
  b.capsule(P(0, 19.2, 10), P(0, 18.8, 5.5), 0.7 * MM, { bone: thorax, color: DARKG });
  b.rod(P(0, 14.4, 13.2), P(0, 15, 15.4), 1.7 * MM, { bone: head, color: INK });

  // ---------- head ----------
  const eyePaint = scales(countershade("#4fe6c6", "#1f8f86", { level: -0.2 }), "#0d3b3a", { size: 0.0009 });
  const eyeR = 3.6;
  for (const s of [1, -1]) {
    const c = new THREE.Vector3(...P(s * 2.4, 16.8, 16.6));
    b.part(new THREE.SphereGeometry(eyeR * MM, 12, 9), eyePaint, { bone: head, at: c });
    // glints
    const d1 = new THREE.Vector3(s * 0.35, 0.65, 0.68).normalize();
    b.part(new THREE.SphereGeometry(0.55 * MM, 6, 4), WHITE, {
      bone: head,
      at: c.clone().addScaledVector(d1, eyeR * 0.97 * MM),
    });
    const d2 = new THREE.Vector3(s * 0.6, 0.2, 0.77).normalize();
    b.part(new THREE.SphereGeometry(0.3 * MM, 6, 4), WHITE, {
      bone: head,
      at: c.clone().addScaledVector(d2, eyeR * 0.98 * MM),
    });
    // antennae
    b.spike(P(s * 0.8, 15.6, 19.4), [s * 0.3, 0.8, 0.5], 2.4 * MM, 0.18 * MM, { bone: head, color: INK, sides: 5 });
    // mandible tips
    b.spike(P(s * 0.9, 12.0, 19.6), [-s * 0.4, -1, 0.3], 1.1 * MM, 0.35 * MM, { bone: head, color: INK, sides: 5 });
  }
  // occiput
  b.part(new THREE.SphereGeometry(1, 8, 6), DARKG, { bone: head, at: P(0, 16.4, 14.4), scale: [1.6 * MM, 1.2 * MM, 1.2 * MM] });
  // frons / face
  b.part(new THREE.SphereGeometry(1, 10, 7), FACE, { bone: head, at: P(0, 13.7, 19.2), scale: [2.6 * MM, 2.0 * MM, 1.8 * MM] });
  b.part(new THREE.BoxGeometry(2.2 * MM, 0.5 * MM, 0.8 * MM), INK, { bone: head, at: P(0, 15.3, 19.6) });
  // ocelli
  for (const o of [P(0, 15.9, 19.0), P(0.7, 16.3, 18.5), P(-0.7, 16.3, 18.5)])
    b.part(new THREE.SphereGeometry(0.32 * MM, 6, 4), "#7a4a1a", { bone: head, at: o });
  // upper lip (labrum) on the head
  b.part(new THREE.BoxGeometry(2.4 * MM, 0.9 * MM, 1.2 * MM), LIP, { bone: head, at: P(0, 12.1, 19.7) });
  // lower lip (labium) on the jaw
  b.part(new THREE.BoxGeometry(2.8 * MM, 2.4 * MM, 0.8 * MM), "#cfc670", {
    bone: jaw,
    at: P(0, 11.4, 18.5),
    aim: jawEnd,
  });

  // ---------- abdomen ----------
  const abdPaint = paint((_p, _n, s) => {
    const t = s[0];
    const d = ((s[1] % 360) + 360) % 360;
    const off = Math.min(d, 360 - d);
    const seg = t * 10;
    const k = Math.floor(seg);
    const f = seg - k;
    if (f > 0.86 || f < 0.04) return INK;
    if (off > 125) return BELLY;
    if (k >= 7) return off < 55 && f > 0.25 && f < 0.6 ? LBLUE : INK;
    if (off < 12) return INK;
    if (off > 70 && f < 0.3) return LBLUE;
    return BLUE;
  });
  b.sweep(abd, [2.5, 2.7, 2.0, 1.45, 1.55, 1.65, 1.7, 1.65, 1.6, 1.4].map((r) => r * MM), {
    color: abdPaint,
  });
  const tipJ = abd.tip!;
  const tipPt = abdPath.at(1);
  for (const s of [1, -1])
    b.spike(tipPt, [s * 0.25, 0.12, -1], 2.4 * MM, 0.32 * MM, { bone: tipJ, color: INK, sides: 5 });
  b.spike(tipPt, [0, -0.35, -1], 1.4 * MM, 0.26 * MM, { bone: tipJ, color: INK, sides: 5 });

  // ---------- wings ----------
  const wings = [
    {
      kind: "forewing",
      rootZ: 10.5,
      y: 18.4,
      L: 46.5,
      amber: 5,
      stigmaY: 1.1,
      outline: [
        [0, 1.2], [8, 2.3], [22, 2.8], [36, 2.8], [43, 2.0], [46.5, 0.2],
        [45, -2.6], [38, -4.6], [24, -6.0], [12, -6.2], [4, -4.2], [0, -1.6],
      ],
      costa: [[0.5, 1.2], [8, 2.25], [22, 2.75], [36, 2.75], [43, 1.95]],
    },
    {
      kind: "hindwing",
      rootZ: 5.5,
      y: 18.0,
      L: 44.5,
      amber: 9,
      stigmaY: 0.8,
      outline: [
        [0, 1.0], [8, 2.0], [22, 2.4], [35, 2.3], [41, 1.6], [44.5, -0.4],
        [43, -3.4], [35, -6.0], [22, -8.6], [11, -10.6], [4, -9.6], [1, -5], [0, -2],
      ],
      costa: [[0.5, 1.0], [8, 1.95], [22, 2.35], [35, 2.25], [41, 1.55]],
    },
  ];

  for (const w of wings) {
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const rx = 1.6;
      const root = P(s * rx, w.y, w.rootZ);
      const tip = P(s * (rx + w.L), w.y, w.rootZ);
      const ch = b.chain(w.kind + S, [root, tip], {
        parent: thorax,
        names: [w.kind + S, w.kind + "Tip" + S],
        role: "wing",
      });
      const bone = ch.joints[0];
      const L = w.L;
      const base = gradient(AMBER, GLASS, root, P(s * (rx + w.amber), w.y, w.rootZ));
      const wp = paint((_p, n, c) => {
        if (Math.abs(n.y) < 0.5) return VEIN;
        const x = c[0] / MM;
        const y = c[1] / MM;
        const u = x / L;
        if (u > 0.79 && u < 0.86 && y > w.stigmaY) return STIGMA;
        if (Math.abs(u - 0.5) < 0.006 && y > -0.5) return VEIN;
        for (const vy of [1.5, 0.3, -1.6, -3.6]) if (Math.abs(y - vy * (1 - 0.45 * u)) < 0.13) return VEIN;
        const cl = cells(new THREE.Vector3(x * MM, y * MM, 0), 0.0017 * (1 - 0.35 * u), 11);
        if (cl.d2 - cl.d1 < 0.00022) return VEIN;
        if (u > 0.91) return SMOKE;
        if (u > 0.55 && y < -2.5) return GLASS2;
        return base;
      });
      b.extrude(
        w.outline.map(([x, y]) => [x * MM, y * MM]) as [number, number][],
        {
          at: root,
          x: [s, 0, 0],
          y: [0, 0, 1],
          thickness: 0.3 * MM,
          smoothing: 1,
          color: wp,
          bone,
        },
      );
      // leading-edge costa vein
      b.sweep(
        catmull(w.costa.map(([x, y]) => P(s * (rx + x), w.y + 0.1, w.rootZ + y))),
        [0.32 * MM, 0.15 * MM],
        { bone, color: VEIN, sides: 6 },
      );
      // wing root sclerite
      b.part(new THREE.BoxGeometry(1.6 * MM, 0.9 * MM, 3.2 * MM), DARKG, {
        bone,
        at: P(s * (rx + 0.6), w.y, w.rootZ - 0.8),
      });
    }
  }

  // ---------- legs ----------
  const legs = [
    { k: "F", root: [1.2, 11, 11.5], foot: [7, 0.25, 19], len: [6.5, 7.5, 3], sole: [0.4, 0, 1] },
    { k: "M", root: [1.6, 10.8, 8.5], foot: [10, 0.25, 9], len: [6.5, 7.5, 3.5], sole: [1, 0, 0.2] },
    { k: "H", root: [1.8, 10.8, 5.5], foot: [10, 0.25, -4], len: [7, 8, 4], sole: [0.6, 0, -0.8] },
  ];
  for (const lg of legs) {
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const id = lg.k + S;
      const sole = new THREE.Vector3(s * lg.sole[0], 0, lg.sole[2]).normalize();
      const pts = limb(
        P(s * lg.root[0], lg.root[1], lg.root[2]),
        P(s * lg.foot[0], lg.foot[1], lg.foot[2]),
        lg.len.map((l) => l * MM),
        [[s * 0.5, 1, 0]],
        { sole: [sole.x, sole.y, sole.z] },
      );
      const ch = b.chain("leg" + id, pts, {
        parent: thorax,
        names: ["hip" + id, "knee" + id, "ankle" + id, "foot" + id],
        role: "leg",
        contact: [pts[3].x, 0, pts[3].z],
      });
      const sw = b.sweep(ch, [0.5, 0.42, 0.34, 0.25].map((r) => r * MM), { color: LEG, sides: 6 });
      // spiny bristles on femur and tibia
      for (const t of [0.18, 0.32, 0.5, 0.64]) {
        for (const deg of [150, 210]) {
          b.spike(sw.at(t, deg), sw.at(t, deg), 1.1 * MM, 0.12 * MM, { color: LEG, sides: 4 });
        }
      }
      // claws
      const side = new THREE.Vector3(0, 1, 0).cross(sole).normalize();
      const fp = pts[3].clone().add(new THREE.Vector3(0, 0.15 * MM, 0));
      for (const c of [1, -1]) {
        const d = sole.clone().addScaledVector(side, c * 0.4).add(new THREE.Vector3(0, -0.2, 0)).normalize();
        b.spike(fp, [d.x, d.y, d.z], 0.9 * MM, 0.14 * MM, { bone: ch.tip!, color: INK, sides: 4 });
      }
    }
  }

  return b.root;
}
```