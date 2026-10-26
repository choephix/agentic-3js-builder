import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Wind Strider",
  description:
    "A Theo Jansen style beach beast: yellow PVC tube frame, sixteen Jansen-linkage legs on a phased crankshaft, bottle wings and canvas sails.",
};

type P2 = [number, number];
const S = 0.0085; // cm -> m for the linkage

// ---- Jansen linkage -------------------------------------------------------
function circ(a: P2, b: P2, r1: number, r2: number): [P2, P2] {
  let dx = b[0] - a[0], dy = b[1] - a[1];
  let d = Math.hypot(dx, dy) || 1e-6;
  const tot = r1 + r2;
  if (d > tot) { r1 *= d / tot * 1.0001; r2 *= d / tot * 1.0001; }
  const x = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r1 * r1 - x * x, 0));
  const ux = dx / d, uy = dy / d;
  const m: P2 = [a[0] + ux * x, a[1] + uy * x];
  return [[m[0] - uy * h, m[1] + ux * h], [m[0] + uy * h, m[1] - ux * h]];
}
const up = (p: [P2, P2]) => (p[0][1] > p[1][1] ? p[0] : p[1]);
const down = (p: [P2, P2]) => (p[0][1] < p[1][1] ? p[0] : p[1]);

type Leg = { O: P2; Cc: P2; P: P2; B: P2; C: P2; D: P2; E: P2; F: P2 };
function linkage(theta: number): Leg {
  const O: P2 = [0, 0];
  const Cc: P2 = [38, 7.8];
  const P: P2 = [Cc[0] + 15 * Math.cos(theta), Cc[1] + 15 * Math.sin(theta)];
  const B = up(circ(O, P, 41.5, 50));
  const C = down(circ(O, P, 39.3, 61.9));
  const D = down(circ(B, C, 55.8, 40.1));
  const E = down(circ(C, D, 39.4, 36.7));
  const F = down(circ(D, E, 65.7, 49));
  return { O, Cc, P, B, C, D, E, F };
}

// ---- palette --------------------------------------------------------------
const PVC = paint((p, n) => {
  const base = mix("#e8b710", "#ffd93a", smoothstep(0.2, 0.8, noise(p, 0.5, 3)));
  const dirt = smoothstep(0.55, 0.9, noise(p, 0.12, 8)) * smoothstep(0.6, -0.4, n.y) * 0.35;
  const sandy = smoothstep(0.5, 0.0, p.y) * 0.35;
  return mix(mix(base, "#6b4f20", dirt), "#d9c08a", sandy);
});
const PVC_DARK = "#b88a0c";
const WHITE = "#f4f1e6";
const STEEL = "#4a4f58";
const FOOT = "#2d2a28";
const BOTTLE = paint((p, n) => mix("#bfe3ea", "#eaf8fa", smoothstep(-0.3, 0.9, n.y) * 0.6 + noise(p, 0.1, 2) * 0.4));
const CAP = "#2d78c8";
const SAIL = paint((p, n, s) => {
  const weave = noise(p, 0.03, 4) * 0.08;
  const band = Math.abs(((s[0] * 2.2) % 1 + 1) % 1 - 0.5) < 0.05;
  const base = mix("#f6f1de", "#e3d8b5", smoothstep(0, 1.5, s[1] + weave) * 0.7);
  return band ? mix(base, "#c8553a", 0.7) : base;
});

const LABEL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
   <circle cx="32" cy="32" r="28" fill="none" stroke="#1d3d6b" stroke-width="3"/>
   <path d="M12 38 Q22 18 32 38 T52 38" fill="none" stroke="#c8553a" stroke-width="4" stroke-linecap="round"/>
   <path d="M14 46 Q24 30 32 46 T50 46" fill="none" stroke="#1d3d6b" stroke-width="3" stroke-linecap="round"/>
   <circle cx="32" cy="18" r="4" fill="#1d3d6b"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "wind-strider" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: any = PVC) =>
    b.rod(a, c, r, col, { sides: 6 } as any);
  const ball = (p: THREE.Vector3, r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), col, { at: p });

  // ---- phases and ride height --------------------------------------------
  const slots = 8;
  const xs = Array.from({ length: slots }, (_, i) => -1.0 + (i * 2.0) / (slots - 1));
  const phase = (i: number, k: number) => ((i * 135 + k * 180) * Math.PI) / 180;
  let minF = Infinity;
  for (let i = 0; i < slots; i++)
    for (const k of [0, 1]) minF = Math.min(minF, linkage(phase(i, k)).F[1]);
  const H = -minF * S + 0.02; // shaft height
  const yc = H - 7.8 * S; // fixed pivot line

  // ---- shaft and crank pins ----------------------------------------------
  rod(V(-1.45, H, 0), V(1.45, H, 0), 0.028, PVC_DARK);
  for (const s of [1, -1]) {
    ball(V(s * 1.47, H, 0), 0.04, STEEL);
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), STEEL, { at: V(s * 1.38, H, 0), dir: [1, 0, 0] });
  }

  // ---- legs ---------------------------------------------------------------
  for (let i = 0; i < slots; i++) {
    for (const k of [0, 1]) {
      const dir = k === 0 ? 1 : -1;
      const x = xs[i] + (k === 0 ? 0.035 : -0.035);
      const L = linkage(phase(i, k));
      const toW = (p: P2) => V(x, yc + p[1] * S, -dir * 38 * S + dir * p[0] * S);
      const pt = { O: toW(L.O), Cc: toW(L.Cc), P: toW(L.P), B: toW(L.B), C: toW(L.C), D: toW(L.D), E: toW(L.E), F: toW(L.F) };
      const r = 0.0085;
      const pairs: [keyof typeof pt, keyof typeof pt][] = [
        ["O", "B"], ["O", "C"], ["P", "B"], ["P", "C"], ["B", "D"], ["C", "D"],
        ["C", "E"], ["D", "E"], ["D", "F"], ["E", "F"],
      ];
      for (const [a, c] of pairs) rod(pt[a], pt[c], r);
      rod(pt.Cc, pt.P, 0.01, PVC_DARK); // crank arm
      for (const key of ["O", "B", "C", "D", "E", "P"] as const) ball(pt[key], 0.016, WHITE);
      // foot pad
      b.part(new THREE.SphereGeometry(0.03, 6, 4), FOOT, { at: pt.F, scale: [0.7, 0.6, 1.3] });
      b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), STEEL, { at: pt.F, dir: [1, 0, 0] });
    }
  }

  // ---- frame ----------------------------------------------------------------
  const zO = 38 * S;
  const topY = H + 0.62;
  for (const z of [zO, -zO]) rod(V(-1.25, yc, z), V(1.25, yc, z), 0.016);
  for (const s of [1, -1]) {
    const x = s * 1.25;
    rod(V(x, yc, -1.5), V(x, yc, 1.5), 0.016);
    rod(V(x, topY, -1.5), V(x, topY, 1.5), 0.02);
    for (const z of [-1.5, -zO, zO, 1.5]) rod(V(x, yc, z), V(x, topY, z), 0.014);
    rod(V(x, yc, -zO), V(x, topY, -1.5), 0.012);
    rod(V(x, yc, zO), V(x, topY, 1.5), 0.012);
    rod(V(x, yc, -zO), V(x, topY, zO), 0.012);
    rod(V(x, yc, zO), V(x, topY, -zO), 0.012);
    for (const z of [-1.5, 1.5]) ball(V(x, topY, z), 0.03, WHITE);
    for (const z of [-1.5, 1.5]) ball(V(x, yc, z), 0.025, WHITE);
    // end braces to the cross tubes
    rod(V(x, yc, -1.5), V(x * 0.9, yc, -zO), 0.012);
    rod(V(x, yc, 1.5), V(x * 0.9, yc, zO), 0.012);
  }
  for (const z of [-1.5, 1.5]) rod(V(-1.25, topY, z), V(1.25, topY, z), 0.018);
  rod(V(-1.25, topY, 0), V(1.25, topY, 0), 0.016);

  // ---- bottle wings ---------------------------------------------------------
  const bottleProfile: [number, number][] = [
    [0, 0], [0.04, 0], [0.046, 0.03], [0.046, 0.2], [0.032, 0.26], [0.016, 0.3], [0.017, 0.34], [0, 0.34],
  ];
  for (const s of [1, -1])
    for (let i = 0; i < 15; i++) {
      const z = -1.45 + (i * 2.9) / 14;
      for (const dx of [0, 0.1 * -s]) {
        const x = s * 1.25 + dx;
        b.lathe(bottleProfile, { at: V(x, topY + 0.01, z), segments: 7, color: BOTTLE } as any);
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 6), CAP, { at: V(x, topY + 0.355, z) });
      }
    }
  // bottle labels
  for (const s of [1, -1])
    for (let i = 1; i < 15; i += 4)
      b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
        at: V(s * 1.25 + s * 0.049, topY + 0.13, -1.45 + (i * 2.9) / 14),
        dir: [s, 0, 0],
        axis: "z",
        texture: LABEL,
      });

  // ---- masts and sails ----------------------------------------------------
  for (const s of [1, -1]) {
    const mx = s * 0.6;
    const mastTop = topY + 1.3;
    rod(V(mx, H, 0), V(mx, mastTop, 0), 0.02);
    rod(V(mx, topY, 0), V(mx, topY, 0), 0.01);
    ball(V(mx, mastTop, 0), 0.035, CAP);
    rod(V(mx, topY, 0), V(s * 1.25, topY, 0), 0.012);
    // stays
    for (const z of [-1.5, 1.5]) rod(V(mx, mastTop - 0.15, 0), V(s * 1.25, topY, z), 0.006, WHITE);
    for (const z of [-1.5, 1.5]) rod(V(mx, topY + 0.1, 0), V(mx, topY + 0.1, 0), 0.001);
    // boom
    rod(V(mx, topY + 0.18, -0.9), V(mx, topY + 0.18, 0.95), 0.014);
    const sail = b.extrude(
      [
        [-0.9, 0], [0.95, 0], [0.8, 0.5], [0.35, 1.0], [-0.1, 1.22], [-0.55, 0.8], [-0.8, 0.35],
      ],
      { at: V(mx, topY + 0.2, 0), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.008, smoothing: 1, color: SAIL } as any,
    );
    for (const side of [1, -1])
      b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
        at: V(mx + side * 0.006, topY + 0.55, 0.15),
        dir: [side, 0, 0],
        axis: "z",
        texture: LABEL,
      });
    // sail ribs
    rod(V(mx, topY + 0.2, -0.9), V(mx, topY + 1.42, -0.1), 0.007, WHITE);
    rod(V(mx, topY + 0.2, 0.95), V(mx, topY + 1.42, -0.1), 0.007, WHITE);
    void sail;
  }
  // pennant at the mast tops
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.4, 0.05], [0, 0.1]], {
      at: V(s * 0.6, topY + 1.3, 0), x: [0, 0, -1], thickness: 0.004, color: "#c8553a",
    } as any);
  }

  // ---- weights: sand ballast hangs under the shaft --------------------------
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), "#3a6fb8", { at: V(s * 1.15, H - 0.02, 0), dir: [1, 0, 0] });

  return b.root;
}
