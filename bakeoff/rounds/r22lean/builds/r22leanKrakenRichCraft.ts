import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { mottle, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A towering kraken rising from the shallows, eight tentacles spread wide, polished Overwatch-style sci-fi colour blocking with a cyan bioluminescent accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: navy + blue body, ONE strong accent (cyan glow), ivory horns.
const CYAN = "#3ff0ff";
const CYAN_SOFT = "#8ff4ff";
const NAVY = "#162052";
const BELLY = "#b9c8ff";
const SUCKER = "#e9dcf5";
const FOAM = "#e8f8ff";
const EYE = "#ffe96a";

const BASE = mottle("#2a46a0", "#3a5fc4", { size: 0.6, seed: 3 });
const MANTLE = cel(paint((p, n) => (n.z > 0.5 && p.y < 1.25 ? "#8fa8ee" : BASE)));
const SKIN = cel(paint((_p, _n, s) => ((s[0] * 18) % 1 < 0.16 ? "#3d63c8" : "#2745a3")));
const FIN = cel("#17b3d4");
const HORN = cel("#f5e6c4");
const BEAK = cel("#f0d9a0");
const BEAK_D = cel("#c9a867");

// Mantle outline: [radius, height]
const MY: Array<[number, number]> = [
  [0, 0],
  [1.5, 0],
  [1.85, 0.5],
  [1.7, 1.2],
  [1.5, 2.0],
  [1.35, 2.9],
  [1.0, 3.7],
  [0.45, 4.3],
  [0, 4.5],
];
function rAt(y: number): number {
  for (let k = 1; k < MY.length; k++) {
    const a = MY[k - 1]!;
    const c = MY[k]!;
    if (c[1] > a[1] && y >= a[1] && y <= c[1]) return a[0] + ((c[0] - a[0]) * (y - a[1])) / (c[1] - a[1]);
  }
  return 0;
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "kraken" });
  const rand = rng(11);

  // ---------- Mantle ----------
  const mantle = b.lathe(MY, { at: [0, 0, 0], smoothing: 1, segments: 14, color: MANTLE });

  // dark panel rings
  for (const y of [1.35, 2.95, 3.55]) {
    b.part(new THREE.TorusGeometry(rAt(y) + 0.03, 0.04, 6, 20), NAVY, { at: [0, y, 0], rotation: [90, 0, 0] });
  }
  // glowing back meridians
  for (const deg of [150, 170, 190, 210]) {
    const ph = (deg * Math.PI) / 180;
    const pts: number[][] = [];
    for (let y = 1.4; y <= 4.0; y += 0.45) {
      const r = rAt(y) + 0.04;
      pts.push([Math.sin(ph) * r, y, Math.cos(ph) * r]);
    }
    glow(b.sweep(pts, 0.03, CYAN, { sides: 4 }), 1.2);
  }
  // glowing blotches on the top surface
  const hits = b.surface(mantle).scatter(34, { rng: rng(5), minDist: 0.4, filter: (h) => h.n.y > 0.25 });
  for (const h of hits) {
    const sz = 0.07 + rand() * 0.07;
    glow(b.stick(new THREE.SphereGeometry(sz, 6, 4).scale(1, 0.35, 1), CYAN_SOFT, h));
  }

  // crown of horns
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    b.spike([Math.sin(a) * 0.5, 4.1, Math.cos(a) * 0.5], [Math.sin(a) * 0.6, 1, Math.cos(a) * 0.6], 0.75, 0.13, HORN, { sides: 6 });
  }
  // dorsal spikes
  [3.9, 3.3, 2.7, 2.1, 1.5].forEach((y, i) => {
    b.spike([0, y, -rAt(y) * 0.97], [0, 0.55, -1], 0.5 - i * 0.04, 0.1, HORN, { sides: 6 });
  });

  // ---------- Fins ----------
  const finOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0, 0],
    [0.7, -0.3],
    [1.5, 0.2],
    [1.9, 1.1],
    [1.0, 0.9, "sharp"],
    [0.6, 1.8],
    [0, 1.2],
  ];
  for (const s of [1, -1]) {
    b.extrude(finOutline, {
      at: [s * 1.25, 3.0, -0.2],
      x: [s, 0, 0],
      thickness: 0.14,
      bevel: 0.03,
      smoothing: 1,
      color: FIN,
    });
    for (const z of [0.085, -0.285]) {
      for (const [u, v] of [
        [1.3, 0.1],
        [1.7, 0.95],
        [0.75, 1.45],
      ] as const) {
        glow(b.rod([s * 1.3, 3.55, -0.2 + z - (z < 0 ? 0 : 0)], [s * (1.25 + u), 3.0 + v, -0.2 + z], 0.025, CYAN, { sides: 4 }), 1.2);
      }
    }
  }

  // ---------- Eyes ----------
  for (const s of [1, -1]) {
    const c = new THREE.Vector3(s * 0.85, 1.95, 1.3);
    const d = new THREE.Vector3(s * 0.5, 0, 0.85).normalize();
    glow(b.part(new THREE.SphereGeometry(0.4, 10, 8), EYE, { at: c }), 0.8);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), INK, {
      at: c.clone().addScaledVector(d, 0.37),
      dir: d,
      axis: "z",
      scale: [0.2, 0.75, 0.25],
    });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), "#ffffff", {
      at: c.clone().addScaledVector(d, 0.36).add(new THREE.Vector3(-s * 0.1, 0.14, 0)),
    });
    b.part(new THREE.SphereGeometry(0.43, 10, 6, 0, Math.PI * 2, 0, 1.2), NAVY, { at: c, rotation: [0, 0, -s * 20] });
    b.part(new THREE.TorusGeometry(0.45, 0.025, 5, 14), CYAN, {
      at: c.clone().addScaledVector(d, -0.05),
      dir: d,
      axis: "z",
    });
  }

  // ---------- Beak & mouth frills ----------
  b.spike([0, 1.1, 1.55], [0, 0.5, 2.2], null, 0.3, BEAK, { sides: 6 });
  b.spike([0, 0.8, 1.65], [0, 0.38, 2.05], null, 0.2, BEAK_D, { sides: 6 });
  for (const i of [1, 2, 3, 5, 6, 7]) {
    const ang = (i / 8) * Math.PI * 2;
    const sx = Math.sin(ang);
    const cy = Math.cos(ang);
    const ry = 0.72 + 0.4 * cy;
    const frill = catmull([
      [0.55 * sx, ry, 1.5],
      [0.85 * sx, Math.max(0.3, ry + 0.05), 1.95],
      [1.15 * sx, Math.max(0.25, ry - 0.05), 2.35],
      [1.35 * sx, 0.2, 2.6],
    ]);
    b.sweep(frill, [0.12, 0.09, 0.05, 0.015], SKIN, { sides: 6, sectors: [[125, 235, BELLY]] });
  }

  // ---------- Tentacles ----------
  const LOW: number[][] = [[1.2, 0.9], [2.2, 1.3], [3.3, 1.0], [4.2, 0.4], [4.9, 0.2], [5.4, 0.7], [5.5, 1.4]];
  const ARCH: number[][] = [[1.2, 0.9], [2.0, 1.6], [3.0, 2.2], [3.9, 1.6], [4.6, 0.6], [5.2, 0.18], [5.8, 0.5]];
  const HIGH: number[][] = [[1.3, 1.5], [2.4, 2.4], [3.4, 3.6], [4.0, 4.8], [3.9, 5.8], [3.3, 6.2]];
  const SWOOP: number[][] = [[1.3, 1.4], [2.5, 1.9], [3.8, 2.6], [5.0, 3.0], [5.9, 2.4], [6.2, 1.5]];
  const RAD = [0.46, 0.38, 0.3, 0.22, 0.15, 0.08, 0.025];

  const tentacle = (az: number, shape: number[][], sc: number, w: number) => {
    const a = (az * Math.PI) / 180;
    const pts = shape.map(([r, y]) => [Math.sin(a) * r! * sc, y!, Math.cos(a) * r! * sc]);
    const path = catmull(pts);
    const R = RAD.map((v) => v * w);
    b.sweep(path, R, SKIN, { sides: 10, sectors: [[125, 235, BELLY]] });
    const rad = (t: number) => {
      const f = t * (R.length - 1);
      const i = Math.min(R.length - 2, Math.floor(f));
      return R[i]! + (R[i + 1]! - R[i]!) * (f - i);
    };
    const top: THREE.BufferGeometry[] = [];
    const under: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 10; k++) {
      const t = 0.1 + k * 0.085;
      const p = path.at(t);
      const T = path.tangentAt(t).clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const n = up.clone().addScaledVector(T, -up.dot(T));
      if (n.length() < 0.3) n.set(Math.sin(a), 0, Math.cos(a));
      n.normalize();
      const r = rad(t);
      const tp = p.clone().addScaledVector(n, r * 0.95);
      top.push(new THREE.SphereGeometry(r * 0.38, 6, 4).translate(tp.x, tp.y, tp.z));
      const bp = p.clone().addScaledVector(n, -r * 0.92);
      under.push(new THREE.SphereGeometry(r * 0.32, 6, 4).translate(bp.x, bp.y, bp.z));
    }
    glow(b.part(mergeGeometries(top), CYAN, { at: [0, 0, 0] }), 1.3);
    b.part(mergeGeometries(under), SUCKER, { at: [0, 0, 0] });
  };

  tentacle(20, LOW, 1.0, 1.0);
  tentacle(65, HIGH, 1.0, 0.95);
  tentacle(110, LOW, 1.1, 1.0);
  tentacle(155, ARCH, 1.0, 0.95);
  tentacle(-160, HIGH, 1.0, 0.9);
  tentacle(-115, LOW, 1.05, 0.95);
  tentacle(-70, SWOOP, 1.0, 1.0);
  tentacle(-25, ARCH, 1.05, 1.0);

  // ---------- Water ripples & foam ----------
  for (const [r, t] of [
    [2.1, 0.06],
    [2.7, 0.045],
    [3.4, 0.03],
  ] as const) {
    b.part(new THREE.TorusGeometry(r, t, 5, 28), FOAM, { at: [0, 0.04, 0], rotation: [90, 0, 0] });
  }
  const foam: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 1.9 + rand() * 0.9;
    foam.push(
      new THREE.SphereGeometry(0.12 + rand() * 0.1, 6, 4).scale(1, 0.4, 1).translate(Math.sin(a) * rr, 0.05, Math.cos(a) * rr),
    );
  }
  b.part(mergeGeometries(foam), FOAM, { at: [0, 0, 0] });

  return b.root;
}
