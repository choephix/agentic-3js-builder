import * as THREE from "three";
import { createBuilder, catmull, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Vanguard Chopper",
  description:
    "A long-raked custom chopper in a clean heroic-shooter style: orange and navy tank with emblem, chrome V-twin, ape-hanger bars, and glowing cyan wheel rings and engine cores.",
};

const OR = "#ff8a1c";
const ORD = "#c9560a";
const NAVY = "#1d2433";
const CHAR = "#2b3140";
const CREAM = "#fff1d0";
const CY = "#35e6ff";
const RED = "#ff3b3b";
const TIRE = "#15171c";
const STEEL = "#9aa3b0";
const LEATHER = "#232733";

const CHROME = metal("steel", { polish: 0.7, tarnish: 0.05 });
const IRON = metal("iron");
const GILT = metal("gilt");

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
    <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="#1d2433" stroke="#fff1d0" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="30" fill="#ff8a1c"/>
    <path d="M26 62 L50 24 L74 62 L62 62 L50 42 L38 62Z" fill="#fff1d0"/>
    <rect x="42" y="66" width="16" height="7" rx="2" fill="#1d2433"/>
  </svg>`,
  { size: 192 },
);

const DIAL = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#10141c" stroke="#35e6ff" stroke-width="4"/>
    <path d="M18 66 A36 36 0 1 1 82 66" fill="none" stroke="#35e6ff" stroke-width="5" stroke-linecap="round" stroke-dasharray="6 5"/>
    <path d="M50 50 L68 32" stroke="#ff8a1c" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="6" fill="#fff1d0"/>
  </svg>`,
  { size: 128 },
);

const TANK = paint((p) => {
  const edge = 0.9 + 0.012 * Math.sin(p.z * 28);
  if (Math.abs(p.y - edge) < 0.007) return CREAM;
  if (p.y < edge) return NAVY;
  if (Math.abs(p.x) < 0.022) return CREAM;
  if (Math.abs(p.x) < 0.04) return NAVY;
  return OR;
});
const FENDER = paint((p, n) => (n.y > 0.7 && Math.abs(p.x) < 0.015 ? CREAM : OR));
const SEAT = paint((p, n) => (Math.abs(p.x) < 0.004 || (n.y > 0.5 && Math.abs(Math.sin(p.z * 40)) < 0.06) ? "#3a4154" : LEATHER));

export default function build() {
  const b = createBuilder({ name: "chopper" });

  const tube = (a: number[], c: number[], r = 0.022, col: any = STEEL) =>
    b.rod(a, c, r, col, { sides: 6 });
  const cyl = (r: number, h: number, col: any, at: number[], dir: number[], seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { at, dir });
  const box = (w: number, h: number, d: number, col: any, at: number[], dir?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at, dir });

  // ---------- wheels ----------
  const wheel = (cy: number, cz: number, major: number, tubeR: number, wscale: number, rimR: number, spokes: number) => {
    b.part(new THREE.TorusGeometry(major, tubeR, 8, 22), TIRE, { at: [0, cy, cz], dir: [1, 0, 0], axis: "z", scale: [1, 1, wscale] });
    b.part(new THREE.TorusGeometry(rimR, 0.028, 6, 22), CHROME, { at: [0, cy, cz], dir: [1, 0, 0], axis: "z", scale: [1, 1, 1.2] });
    for (const x of [-1, 1]) {
      glow(b.part(new THREE.TorusGeometry(rimR - 0.035, 0.011, 4, 26), CY, { at: [x * 0.045, cy, cz], dir: [1, 0, 0], axis: "z" }), 1.4);
    }
    cyl(0.05, 0.16, CHROME, [0, cy, cz], [1, 0, 0]);
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      b.rod([0, cy, cz], [0, cy + Math.cos(a) * (rimR - 0.01), cz + Math.sin(a) * (rimR - 0.01)], 0.014, CHROME, { sides: 6 });
    }
  };
  wheel(0.33, 1.22, 0.27, 0.06, 1, 0.21, 7);
  wheel(0.39, -1.0, 0.3, 0.09, 1.6, 0.23, 8);

  // axles, discs, sprocket
  tube([-0.13, 0.33, 1.22], [0.13, 0.33, 1.22], 0.016, CHROME);
  tube([-0.22, 0.39, -1.0], [0.22, 0.39, -1.0], 0.02, CHROME);
  cyl(0.15, 0.01, STEEL, [0.075, 0.33, 1.22], [1, 0, 0], 14);
  box(0.03, 0.06, 0.08, ORD, [0.09, 0.45, 1.12]);
  cyl(0.12, 0.012, STEEL, [0.17, 0.39, -1.0], [1, 0, 0], 12);
  cyl(0.06, 0.012, STEEL, [0.17, 0.43, -0.1], [1, 0, 0], 10);
  tube([0.17, 0.49, -0.1], [0.17, 0.51, -1.0], 0.01, CHAR);
  tube([0.17, 0.37, -0.1], [0.17, 0.27, -1.0], 0.01, CHAR);

  // ---------- front fork ----------
  const headTop = [0, 1.0, 0.57];
  for (const s of [1, -1]) {
    const T = [s * 0.1, 1.04, 0.54];
    const A = [s * 0.1, 0.33, 1.22];
    const M = [T[0], (T[1] + A[1]) / 2 + 0.06, (T[2] + A[2]) / 2 - 0.04];
    tube(T, M, 0.03, GILT);
    tube(M, A, 0.022, CHROME);
    // fork gaiters
    cyl(0.036, 0.05, NAVY, [M[0], M[1], M[2]], [0, -0.67, 0.67], 8);
    // handlebar
    const bar = b.sweep(
      catmull([[s * 0.08, 1.04, 0.54], [s * 0.13, 1.25, 0.5], [s * 0.3, 1.36, 0.42], [s * 0.52, 1.3, 0.28]]),
      0.014,
      { color: CHROME, sides: 6 },
    );
    void bar;
    b.rod([s * 0.4, 1.34, 0.36], [s * 0.54, 1.29, 0.27], 0.024, LEATHER, { sides: 6 });
    // mirror
    tube([s * 0.46, 1.32, 0.32], [s * 0.5, 1.46, 0.36], 0.008, CHROME);
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), CHROME, { at: [s * 0.5, 1.48, 0.36], dir: [0, 0.3, -1] });
    // lever
    tube([s * 0.46, 1.31, 0.31], [s * 0.5, 1.27, 0.42], 0.007, CHROME);
    // footpeg
    tube([s * 0.1, 0.4, 0.3], [s * 0.3, 0.32, 0.62], 0.016, CHROME);
    cyl(0.026, 0.12, LEATHER, [s * 0.3, 0.32, 0.64], [0, 0, 1], 8);
    // swingarm + shock
    tube([s * 0.13, 0.46, -0.3], [s * 0.18, 0.39, -1.0], 0.026, STEEL);
    tube([s * 0.17, 0.42, -0.78], [s * 0.12, 0.8, -0.52], 0.012, CHAR);
    b.sweep(
      catmull(Array.from({ length: 29 }, (_, i) => {
        const t = i / 28;
        const a = t * Math.PI * 2 * 7;
        const cx = s * (0.17 - 0.05 * t);
        return [cx + Math.cos(a) * 0.028, 0.42 + 0.38 * t, -0.78 + 0.26 * t + Math.sin(a) * 0.028];
      })),
      0.006,
      { color: OR, sides: 5 },
    );
    // exhaust
    const ex = b.sweep(
      catmull([[s * 0.07, 0.68, 0.3], [s * 0.2, 0.5, 0.33], [s * 0.27, 0.38, 0.1], [s * 0.28, 0.4, -0.4], [s * 0.28, 0.5, -0.95]]),
      [0.034, 0.052],
      { color: CHROME, sides: 8, caps: "flat" },
    );
    void ex;
    glow(cyl(0.048, 0.025, ORD, [s * 0.28, 0.5, -0.96], [0, 0.1, -1], 8), 1.6);
    cyl(0.058, 0.06, CHAR, [s * 0.27, 0.41, -0.2], [0, 0, 1], 8);
    // side panel
    b.extrude([[0, 0], [0.42, 0.03], [0.52, 0.2], [0.36, 0.3, "sharp"], [0.04, 0.26]], {
      at: [s * 0.19, 0.5, -0.62],
      x: [0, 0, 1],
      thickness: 0.03,
      bevel: 0.006,
      color: OR,
    });
    // engine core badge
    glow(cyl(0.075, 0.016, CY, [s * 0.165, 0.46, 0.06], [1, 0, 0], 12), 1.6);
    cyl(0.1, 0.02, CHAR, [s * 0.155, 0.46, 0.06], [1, 0, 0], 12);
    // sissy bar
    b.sweep(catmull([[s * 0.1, 0.7, -0.8], [s * 0.11, 0.95, -0.9], [s * 0.1, 1.1, -0.95], [0, 1.15, -0.96]]), 0.014, { color: CHROME, sides: 6 });
  }
  b.rod([0, 1.0, 0.57], [0, 1.08, 0.57], 0.03, CHAR);
  box(0.28, 0.05, 0.1, CHAR, [0, 1.02, 0.55]);
  // head tube
  b.rod(headTop, [0, 0.78, 0.79], 0.036, CHAR, { sides: 8 });

  // dial
  cyl(0.06, 0.04, CHAR, [0, 1.09, 0.5], [0, 0.7, -0.7], 10);
  glow(
    b.part(new THREE.CircleGeometry(0.052, 16), "#ffffff", { at: [0, 1.113, 0.477], dir: [0, 0.7, -0.7], axis: "z", texture: DIAL }),
    0.9,
  );

  // headlight
  b.part(new THREE.CylinderGeometry(0.1, 0.085, 0.1, 12), OR, { at: [0, 0.9, 0.8], dir: [0, 0, 1] });
  b.part(new THREE.TorusGeometry(0.09, 0.012, 6, 16), CHROME, { at: [0, 0.9, 0.86], dir: [0, 0, 1], axis: "z" });
  glow(b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.02, 12), CREAM, { at: [0, 0.9, 0.86], dir: [0, 0, 1] }), 1.6);

  // front fender
  const fcy = 0.33;
  const fcz = 1.22;
  const fpts = [-25, 0, 25, 50, 75].map((d) => {
    const a = (d * Math.PI) / 180;
    return [0, fcy + Math.cos(a) * 0.37, fcz + Math.sin(a) * 0.37];
  });
  b.sweep(catmull(fpts), () => [0.075, 0.012], { section: "box", color: FENDER, caps: "flat" });

  // ---------- frame ----------
  tube([0, 0.8, 0.5], [0, 0.78, -0.2], 0.035, CHAR);
  tube([0, 0.78, -0.2], [0, 0.68, -0.8], 0.03, CHAR);
  tube([0, 0.78, 0.79], [0, 0.36, 0.35], 0.032, CHAR);
  tube([0, 0.36, 0.35], [0, 0.34, -0.3], 0.03, CHAR);
  tube([0, 0.34, -0.3], [0, 0.55, -0.35], 0.03, CHAR);
  glow(b.rod([0.0, 0.3, 0.3], [0.0, 0.3, -0.25], 0.012, CY), 1.5);
  // kickstand
  tube([0.2, 0.4, -0.2], [0.36, 0.02, -0.1], 0.014, STEEL);
  cyl(0.03, 0.03, CHAR, [0.36, 0.02, -0.1], [0, 1, 0], 6);

  // ---------- engine ----------
  b.part(new THREE.BoxGeometry(0.3, 0.28, 0.42), IRON, { at: [0, 0.46, 0.06] });
  for (const [dz, dy] of [[0.6, 1], [-0.6, 1]] as number[][]) {
    const d = new THREE.Vector3(0, 0.8 * dy, dz).normalize();
    const base = new THREE.Vector3(0, 0.58, 0.06 + (dz > 0 ? 0.08 : -0.08));
    const dd = [d.x, d.y, d.z];
    for (let i = 0; i < 6; i++) {
      const p = base.clone().addScaledVector(d, 0.04 + i * 0.032);
      cyl(0.1, 0.012, IRON, [p.x, p.y, p.z], dd, 10);
    }
    const c = base.clone().addScaledVector(d, 0.1);
    cyl(0.07, 0.2, CHROME, [c.x, c.y, c.z], dd, 8);
    const h = base.clone().addScaledVector(d, 0.25);
    cyl(0.09, 0.07, OR, [h.x, h.y, h.z], dd, 8);
    cyl(0.1, 0.02, CHROME, [h.x, h.y, h.z], dd, 8);
  }
  // air cleaner
  cyl(0.11, 0.07, CHROME, [0.2, 0.6, 0.3], [1, 0, 0], 12);
  glow(cyl(0.07, 0.01, CY, [0.24, 0.6, 0.3], [1, 0, 0], 10), 1.3);
  tube([0.1, 0.6, 0.3], [0.18, 0.6, 0.3], 0.03, CHROME);

  // ---------- tank ----------
  const tank = b.part(new THREE.SphereGeometry(1, 16, 10), TANK, { at: [0, 0.95, 0.12], scale: [0.19, 0.16, 0.4] });
  cyl(0.045, 0.02, CHROME, [0, 1.11, 0.2], [0, 1, 0], 10);
  cyl(0.02, 0.025, ORD, [0, 1.125, 0.2], [0, 1, 0], 6);
  for (const s of [1, -1])
    b.decal(tank, EMBLEM, { at: [s * 0.19, 0.97, 0.12], dir: [s, 0, 0], size: [0.2, 0.2], mirror: s < 0 });

  // ---------- seat + rear fender ----------
  b.loft(
    [
      { at: [0, 0.76, 0.0], w: 0.2, h: 0.06 },
      { at: [0, 0.73, -0.35], w: 0.3, h: 0.09 },
      { at: [0, 0.78, -0.7], w: 0.2, h: 0.07 },
    ],
    { color: SEAT },
  );
  const rcy = 0.39;
  const rcz = -1.0;
  const rpts = [-55, -25, 0, 30, 60, 85].map((d) => {
    const a = (d * Math.PI) / 180;
    return [0, rcy + Math.cos(a) * 0.46, rcz - Math.sin(a) * 0.46];
  });
  b.sweep(catmull(rpts), () => [0.14, 0.014], { section: "box", color: FENDER, caps: "flat" });
  glow(box(0.2, 0.05, 0.04, RED, [0, rcy + 0.04, rcz - 0.46]), 1.8);
  box(0.16, 0.1, 0.012, CREAM, [0, rcy - 0.04, rcz - 0.5]);
  tube([0, 0.82, -0.7], [0, 0.78, -0.95], 0.02, CHAR);

  return b.root;
}
