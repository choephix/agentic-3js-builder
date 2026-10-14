import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "Typewriter",
  description:
    "A vintage manual typewriter with a teal enamel body, staggered round keys, a fan of chrome typebars, a ribbon with spools, and a sliding carriage with platen, paper and return lever.",
};

const BODY = "#2f5a55";
const BODY_DARK = "#24433f";
const CHROME = "#cfd3d6";
const KEY = "#1d1d20";
const CREAM = "#efe6cf";
const RUBBER = "#141414";
const BRASS = "#c8a24a";
const RIBBON = "#7a1f2b";

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const Y0 = 0.012; // body sits on the feet

  const base = b.joint("base", { at: [0, 0.1, 0] });
  const carriage = b.joint("carriage", {
    parent: base,
    at: [0, Y0 + 0.205, -0.06],
    aim: [1, Y0 + 0.205, -0.06],
    role: "hinge",
  });

  const P = (g: THREE.BufferGeometry, color: string, o: any = {}) =>
    b.part(g, color, { bone: base, ...o });
  const C = (g: THREE.BufferGeometry, color: string, o: any = {}) =>
    b.part(g, color, { bone: carriage, ...o });

  // ---- body shell (side profile: x = z, y = height)
  const outline: any = [
    [-0.17, 0],
    [0.18, 0],
    [0.18, 0.05],
    [0.1, 0.085],
    [0.085, 0.12],
    [0.075, 0.17],
    [-0.14, 0.17],
    [-0.17, 0.12],
  ];
  b.extrude(outline, { at: [0, Y0, 0], thickness: 0.34, bevel: 0.006, color: BODY, bone: base });

  // base plate trim
  P(new THREE.BoxGeometry(0.352, 0.008, 0.37), BODY_DARK, { at: [0, Y0 + 0.004, 0.005] });
  // top chrome strip on rear housing
  P(new THREE.BoxGeometry(0.344, 0.004, 0.02), CHROME, { at: [0, Y0 + 0.17, -0.15] });
  // feet
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      P(new THREE.CylinderGeometry(0.014, 0.016, 0.014, 8), RUBBER, { at: [sx * 0.14, 0.006, sz * 0.14] });

  // brand badge on the front
  const badge = svg(
    `<svg viewBox="0 0 80 24"><rect width="80" height="24" rx="4" fill="#c8a24a"/><rect x="2" y="2" width="76" height="20" rx="3" fill="none" stroke="#6b4f16" stroke-width="1.5"/><text x="40" y="17" font-size="13" font-family="serif" font-weight="bold" text-anchor="middle" fill="#3a2a08">REMINGTON</text></svg>`,
    { size: 256 },
  );
  P(new THREE.PlaneGeometry(0.1, 0.03), "#ffffff", {
    at: [0, Y0 + 0.022, 0.1815],
    dir: [0, 0, 1],
    axis: "z",
    texture: badge,
  });

  // ---- keyboard
  const slopeY = (z: number) => Y0 + 0.05 + (0.18 - z) * 0.4375;
  const n: [number, number, number] = [0, 0.91, 0.41];
  const rows = [
    { z: 0.165, count: 10, off: 0.0 },
    { z: 0.148, count: 11, off: -0.004 },
    { z: 0.131, count: 10, off: 0.003 },
    { z: 0.114, count: 9, off: 0.008 },
  ];
  const capGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.012, 10);
  const faceGeo = new THREE.CylinderGeometry(0.0062, 0.0062, 0.0016, 10);
  const stemGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.016, 5);
  for (const r of rows) {
    for (let i = 0; i < r.count; i++) {
      const x = (i - (r.count - 1) / 2) * 0.0215 + r.off;
      const sy = slopeY(r.z);
      const at = (d: number): [number, number, number] => [x, sy + n[1] * d, r.z + n[2] * d];
      P(stemGeo, CHROME, { at: at(0.0), dir: n });
      P(capGeo, KEY, { at: at(0.014), dir: n });
      P(faceGeo, CREAM, { at: at(0.0205), dir: n });
    }
  }
  // space bar
  P(new THREE.BoxGeometry(0.13, 0.009, 0.016), KEY, { at: [0, Y0 + 0.064, 0.179] });
  P(new THREE.BoxGeometry(0.126, 0.002, 0.012), CHROME, { at: [0, Y0 + 0.0695, 0.179] });

  // ---- typebar basket
  const cz = -0.03;
  const arcPts: number[][] = [];
  for (let k = 0; k <= 8; k++) {
    const a = ((-84 + (168 * k) / 8) * Math.PI) / 180;
    arcPts.push([0.082 * Math.sin(a), Y0 + 0.176, cz + 0.082 * Math.cos(a)]);
  }
  b.sweep(arcPts, 0.0045, { color: CHROME, bone: base, sides: 6 });
  const slugGeo = new THREE.BoxGeometry(0.006, 0.013, 0.003);
  for (let k = 0; k < 17; k++) {
    const a = ((-78 + (156 * k) / 16) * Math.PI) / 180;
    const bs: [number, number, number] = [0.078 * Math.sin(a), Y0 + 0.176, cz + 0.078 * Math.cos(a)];
    const tp: [number, number, number] = [0.03 * Math.sin(a), Y0 + 0.212, cz + 0.03 * Math.cos(a)];
    b.rod(bs, tp, 0.0018, { color: CHROME, bone: base, sides: 5 });
    P(slugGeo, KEY, { at: tp, dir: [-Math.sin(a), 0.4, -Math.cos(a)] });
  }
  // type guide
  P(new THREE.BoxGeometry(0.02, 0.01, 0.006), BRASS, { at: [0, Y0 + 0.213, cz + 0.012] });

  // ---- ribbon spools
  for (const s of [1, -1]) {
    const x = s * 0.125;
    P(new THREE.CylinderGeometry(0.036, 0.036, 0.003, 12), CHROME, { at: [x, Y0 + 0.1715, 0.0] });
    P(new THREE.CylinderGeometry(0.026, 0.026, 0.014, 10), RIBBON, { at: [x, Y0 + 0.18, 0.0] });
    P(new THREE.CylinderGeometry(0.036, 0.036, 0.003, 12), CHROME, { at: [x, Y0 + 0.1885, 0.0] });
    P(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 6), CHROME, { at: [x, Y0 + 0.19, 0.0] });
    P(new THREE.CylinderGeometry(0.009, 0.009, 0.004, 8), BRASS, { at: [x, Y0 + 0.207, 0.0] });
  }
  b.sweep(
    [
      [-0.095, Y0 + 0.18, 0.02],
      [-0.04, Y0 + 0.19, 0.06],
      [0.0, Y0 + 0.204, cz + 0.016],
      [0.04, Y0 + 0.19, 0.06],
      [0.095, Y0 + 0.18, 0.02],
    ],
    0.0025,
    { color: RIBBON, bone: base, sides: 4 },
  );

  // ---- carriage
  const PY = Y0 + 0.205;
  const PZ = -0.06;
  // platen
  C(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 14), RUBBER, { at: [0, PY, PZ], dir: [1, 0, 0] });
  // platen shaft
  C(new THREE.CylinderGeometry(0.004, 0.004, 0.44, 6), CHROME, { at: [0, PY, PZ], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    // end plates
    C(new THREE.BoxGeometry(0.01, 0.07, 0.15), BODY_DARK, { at: [s * 0.19, PY - 0.015, PZ - 0.01] });
    C(new THREE.CylinderGeometry(0.0125, 0.0125, 0.006, 10), CHROME, { at: [s * 0.2, PY, PZ], dir: [1, 0, 0] });
    // knobs
    C(new THREE.CylinderGeometry(0.019, 0.019, 0.02, 12), KEY, { at: [s * 0.218, PY, PZ], dir: [1, 0, 0] });
    C(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 10), CREAM, { at: [s * 0.229, PY, PZ], dir: [1, 0, 0] });
  }
  // rails
  C(new THREE.CylinderGeometry(0.005, 0.005, 0.38, 6), CHROME, { at: [0, Y0 + 0.186, PZ + 0.055], dir: [1, 0, 0] });
  C(new THREE.CylinderGeometry(0.005, 0.005, 0.38, 6), CHROME, { at: [0, Y0 + 0.186, PZ - 0.07], dir: [1, 0, 0] });
  // paper bail
  C(new THREE.CylinderGeometry(0.0025, 0.0025, 0.3, 5), CHROME, { at: [0, PY + 0.024, PZ + 0.026], dir: [1, 0, 0] });
  for (const s of [1, -1])
    b.rod([s * 0.15, PY + 0.024, PZ + 0.026], [s * 0.15, PY + 0.004, PZ + 0.02], 0.002, {
      color: CHROME,
      bone: carriage,
      sides: 4,
    });
  // paper
  const sheet = svg(
    `<svg viewBox="0 0 100 70"><rect width="100" height="70" fill="#f4efe0"/><text x="50" y="12" font-size="7" font-family="monospace" text-anchor="middle" fill="#2a2a2a">Dear Reader,</text>${[0, 1, 2, 3, 4, 5, 6]
      .map(
        (i) =>
          `<rect x="10" y="${20 + i * 7}" width="${80 - ((i * 23) % 30)}" height="2" fill="#303030"/>`,
      )
      .join("")}</svg>`,
    { size: 256 },
  );
  C(new THREE.BoxGeometry(0.21, 0.15, 0.002), "#f4efe0", { at: [0, PY + 0.09, PZ - 0.028], rotation: [-8, 0, 0] });
  C(new THREE.PlaneGeometry(0.205, 0.145), "#ffffff", {
    at: [0, PY + 0.0905, PZ - 0.0265],
    rotation: [-8, 0, 0],
    texture: sheet,
  });
  // paper support
  C(new THREE.BoxGeometry(0.22, 0.004, 0.012), CHROME, { at: [0, PY + 0.015, PZ - 0.042] });

  // carriage return lever
  b.sweep(
    [
      [0.19, PY + 0.03, PZ + 0.03],
      [0.205, PY + 0.065, PZ + 0.02],
      [0.225, PY + 0.08, PZ + 0.045],
      [0.24, PY + 0.085, PZ + 0.09],
    ],
    0.004,
    { color: CHROME, bone: carriage, sides: 6 },
  );
  C(new THREE.SphereGeometry(0.01, 8, 6), KEY, { at: [0.242, PY + 0.086, PZ + 0.097] });

  // margin stops
  for (const s of [1, -1])
    C(new THREE.BoxGeometry(0.01, 0.01, 0.01), BRASS, { at: [s * 0.12, Y0 + 0.19, PZ + 0.062] });

  // side detail: side screws & trim
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.01, 0.01, 0.004, 8), BRASS, { at: [s * 0.171, Y0 + 0.08, -0.06], dir: [1, 0, 0] });
    P(new THREE.BoxGeometry(0.003, 0.012, 0.2), CHROME, { at: [s * 0.1705, Y0 + 0.03, 0.0] });
  }

  return b.root;
}
