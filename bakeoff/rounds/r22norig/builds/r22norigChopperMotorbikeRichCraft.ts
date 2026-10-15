import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { arc, catmull } from "../../../../src/path";
import { mix, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Custom Chopper Motorbike",
  description:
    "Long-raked V-twin chopper with ape-hanger bars, hardtail frame, fat rear tyre and drag pipes, in a polished Overwatch-style graphite, white and orange colour-block finish.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type P = [number, number, number];

const GRAPH = "#2a303b";
const GRAPH2 = "#1a1e26";
const STEEL = "#7d8b9d";
const CHROME = "#d3dae3";
const ORANGE = "#ff7a14";
const RUBBER = "#14161b";
const SEAT = "#232a36";
const BODY_LO = "#c6d0dc";
const BODY_HI = "#f7fafc";

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });

  const L = (a: P, c: P, t: number): P => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  const cylX = (x: number, y: number, z: number, r: number, len: number, color: string, segs = 14) =>
    b.part(new THREE.CylinderGeometry(r, r, len, segs), color, { at: [x, y, z], rotation: [0, 0, 90] });
  const cylZ = (x: number, y: number, z: number, r: number, len: number, color: string, segs = 14) =>
    b.part(new THREE.CylinderGeometry(r, r, len, segs), color, { at: [x, y, z], rotation: [90, 0, 0] });
  const ringX = (x: number, y: number, z: number, R: number, r: number, color: string, segs = 24) =>
    b.part(new THREE.TorusGeometry(R, r, 5, segs), color, { at: [x, y, z], rotation: [0, 90, 0] });
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const bolt = (x: number, y: number, z: number, r = 0.008, color = CHROME) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at: [x, y, z] });
  const boltRingX = (x: number, cy: number, cz: number, R: number, n: number, r = 0.008) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      bolt(x, cy + R * Math.sin(a), cz + R * Math.cos(a), r);
    }
  };

  // painted-metal bodywork: light shading, orange centre stripe with a dark pin line, dark underside
  const bodyPaint = (stripeW: number) =>
    paint((p, n) => {
      if (n.y < -0.45) return GRAPH;
      const ax = Math.abs(p.x);
      if (ax < stripeW) return ORANGE;
      if (ax < stripeW + 0.008) return GRAPH2;
      return mix(BODY_LO, BODY_HI, smoothstep(-0.3, 0.8, n.y));
    });

  const tread = paint((_p, _n, s) => {
    const v = s[1];
    const sw = Math.min(Math.abs(v - 0.25), Math.abs(v - 0.75));
    if (sw < 0.02) return ORANGE;
    const crown = v < 0.14 || v > 0.86;
    const k = s[0] * 64 + (v < 0.5 ? v * 8 : -v * 8);
    if (crown && ((k % 1) + 1) % 1 < 0.3) return "#07080b";
    return RUBBER;
  });

  const seatPaint = paint((p, n) => {
    if (n.y > 0.6) {
      const m = Math.abs((p.z * 12) % 1);
      if (m < 0.05) return STEEL;
      if (Math.abs(p.x) < 0.004) return ORANGE;
    }
    return SEAT;
  });

  const rearDisc = paint((p, n) => {
    const dy = p.y - 0.36;
    const dz = p.z + 0.85;
    const r = Math.hypot(dy, dz);
    if (Math.abs(n.x) < 0.5 || r > 0.15) return ORANGE;
    if (r < 0.045) return CHROME;
    return Math.cos(Math.atan2(dy, dz) * 6) > 0.35 ? "#dfe6ee" : "#222833";
  });

  // ---------------------------------------------------------------- wheels
  const RZ = -0.85;
  const FZ = 1.05;
  // rear: fat tyre
  b.part(new THREE.TorusGeometry(0.27, 0.09, 8, 28), tread, { at: [0, 0.36, RZ], rotation: [0, 90, 0] });
  ringX(0, 0.36, RZ, 0.18, 0.012, CHROME, 28);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.175, 0.175, 0.02, 24), rearDisc, { at: [s * 0.07, 0.36, RZ], rotation: [0, 0, 90] });
    boltRingX(s * 0.082, 0.36, RZ, 0.03, 5, 0.007);
  }
  cylX(0, 0.36, RZ, 0.018, 0.34, CHROME, 8);
  // rear sprocket + belt (left, +X)
  cylX(0.13, 0.36, RZ, 0.1, 0.012, STEEL, 24);
  ringX(0.13, 0.36, RZ, 0.1, 0.01, GRAPH2, 24);
  b.rod([0.14, 0.54, -0.1], [0.13, 0.46, RZ], 0.014, RUBBER, { sides: 6 });
  b.rod([0.14, 0.36, -0.1], [0.13, 0.26, RZ], 0.014, RUBBER, { sides: 6 });
  // rear brake disc (right)
  cylX(-0.12, 0.36, RZ, 0.11, 0.008, STEEL, 20);
  box(-0.12, 0.45, RZ - 0.11, 0.04, 0.05, 0.07, ORANGE);

  // front: slim tyre, wire spokes, disc brake
  b.part(new THREE.TorusGeometry(0.28, 0.06, 6, 28), tread, { at: [0, 0.34, FZ], rotation: [0, 90, 0] });
  ringX(0, 0.34, FZ, 0.225, 0.016, CHROME, 28);
  ringX(0, 0.34, FZ, 0.208, 0.006, ORANGE, 28);
  cylX(0, 0.34, FZ, 0.034, 0.1, CHROME, 12);
  cylX(0, 0.34, FZ, 0.012, 0.28, CHROME, 8);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const s = i % 2 ? 1 : -1;
    const a2 = a + 0.35 * s;
    b.rod(
      [s * 0.04, 0.34 + 0.03 * Math.sin(a), FZ + 0.03 * Math.cos(a)],
      [0, 0.34 + 0.222 * Math.sin(a2), FZ + 0.222 * Math.cos(a2)],
      0.0045,
      CHROME,
      { sides: 4, caps: "flat" },
    );
  }
  cylX(0.055, 0.34, FZ, 0.135, 0.008, STEEL, 24);
  ringX(0.055, 0.34, FZ, 0.135, 0.008, GRAPH2, 24);
  box(0.07, 0.34 + 0.115, FZ - 0.07, 0.04, 0.06, 0.08, ORANGE);

  // ---------------------------------------------------------------- frame
  const H: P = [0, 0.9, 0.6];
  const dF: P = [0, -0.82, 0.57];
  b.sweep(
    catmull([
      [0, 0.86, 0.58],
      [0, 0.62, 0.46],
      [0, 0.42, 0.3],
      [0, 0.35, 0.18],
      [0, 0.34, -0.2],
      [0, 0.4, -0.45],
      [0, 0.58, -0.5],
      [0, 0.78, -0.5],
    ]),
    0.026,
    GRAPH,
    { sides: 8 },
  );
  b.rod([0, 0.9, 0.56], [0, 0.79, -0.5], 0.024, GRAPH, { sides: 8 });
  b.rod([H[0], H[1] - 0.82 * -0.11, H[2] - 0.57 * 0.11], [H[0], H[1] + dF[1] * 0.11, H[2] + dF[2] * 0.11], 0.034, GRAPH, { sides: 10 });
  ringTube();
  function ringTube() {
    // head tube collars
    for (const t of [-0.11, 0.11]) {
      b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.014, 12), ORANGE, {
        at: [0, H[1] + dF[1] * t, H[2] + dF[2] * t],
        dir: dF,
        axis: "y",
      });
    }
  }
  // rear stays
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.78, -0.5], [s * 0.12, 0.36, RZ], 0.017, GRAPH, { sides: 8 });
    b.rod([s * 0.1, 0.34, -0.35], [s * 0.12, 0.36, RZ], 0.017, GRAPH, { sides: 8 });
    b.rod([s * 0.1, 0.55, -0.5], [s * 0.12, 0.36, RZ], 0.012, GRAPH, { sides: 6 });
    cylX(s * 0.135, 0.36, RZ, 0.03, 0.02, CHROME, 10);
    // engine side plates
    box(s * 0.12, 0.5, 0.1, 0.012, 0.22, 0.3, STEEL);
    bolt(s * 0.128, 0.58, 0.2);
    bolt(s * 0.128, 0.58, 0.0);
    bolt(s * 0.128, 0.42, 0.2);
    bolt(s * 0.128, 0.42, 0.0);
  }

  // ---------------------------------------------------------------- front end
  const top: P[] = [];
  const axle: P[] = [];
  for (const s of [1, -1]) {
    const T0: P = [s * 0.1, 1.015, 0.52];
    const A: P = [s * 0.11, 0.34, FZ];
    top.push(T0);
    axle.push(A);
    b.rod(T0, L(T0, A, 0.45), 0.017, CHROME, { sides: 8 });
    b.rod(L(T0, A, 0.4), A, 0.026, GRAPH, { sides: 8 });
    b.rod(L(T0, A, 0.5), L(T0, A, 0.56), 0.029, ORANGE, { sides: 8 });
    b.rod(L(T0, A, 0.9), L(T0, A, 0.94), 0.029, CHROME, { sides: 8 });
    cylX(s * 0.135, 0.34, FZ, 0.032, 0.02, CHROME, 10);
    // headlamp bracket
    b.rod([s * 0.1, 0.95, 0.56], [s * 0.085, 0.99, 0.74], 0.012, CHROME, { sides: 6 });
  }
  b.part(new THREE.BoxGeometry(0.26, 0.035, 0.09), GRAPH, { at: [0, 1.0, 0.535], dir: dF, axis: "y" });
  b.part(new THREE.BoxGeometry(0.24, 0.035, 0.09), GRAPH, { at: [0, 0.8, 0.668], dir: dF, axis: "y" });
  bolt(0, 1.022, 0.52, 0.014, ORANGE);

  // front fender
  const FC: P = [0, 0.34, FZ];
  const fa = (55 * Math.PI) / 180;
  b.sweep(arc(FC, [0, 0.34 + 0.4 * Math.cos(fa), FZ + 0.4 * Math.sin(fa)], [1, 0, 0], -95), () => [0.08, 0.011], bodyPaint(0.02), {
    section: "box",
    caps: "flat",
  });

  // headlamp
  b.part(new THREE.SphereGeometry(0.1, 12, 8), "#d9e1ea", { at: [0, 0.99, 0.76], scale: [1, 1, 0.9] });
  glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 14), "#fff1c8", { at: [0, 0.99, 0.837], rotation: [90, 0, 0] }), 1.4);
  b.part(new THREE.TorusGeometry(0.082, 0.009, 5, 18), ORANGE, { at: [0, 0.99, 0.845] });
  b.part(new THREE.TorusGeometry(0.1, 0.007, 5, 18), GRAPH, { at: [0, 0.99, 0.78] });

  // handlebars
  const bars = b.surface;
  void bars;
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.02, 1.08, 0.52],
        [s * 0.12, 1.1, 0.52],
        [s * 0.26, 1.18, 0.5],
        [s * 0.36, 1.28, 0.45],
        [s * 0.4, 1.3, 0.4],
      ]),
      0.014,
      CHROME,
      { sides: 6 },
    );
    b.rod([s * 0.4, 1.3, 0.4], [s * 0.4, 1.3, 0.27], 0.02, RUBBER, { sides: 8 });
    cylZ(s * 0.4, 1.3, 0.262, 0.024, 0.012, ORANGE, 10);
    b.rod([s * 0.38, 1.29, 0.44], [s * 0.33, 1.25, 0.57], 0.007, CHROME, { sides: 5 });
    bolt(s * 0.33, 1.25, 0.575, 0.01, ORANGE);
    b.rod([s * 0.05, 1.0, 0.54], [s * 0.06, 1.09, 0.52], 0.02, CHROME, { sides: 8 });
    box(s * 0.06, 1.1, 0.52, 0.05, 0.025, 0.05, ORANGE);
    b.sweep(
      catmull([
        [s * 0.34, 1.26, 0.55],
        [s * 0.22, 1.12, 0.56],
        [s * 0.07, 0.99, 0.54],
      ]),
      0.005,
      RUBBER,
      { sides: 4 },
    );
  }
  // speedo
  b.rod([0, 1.1, 0.52], [0, 1.15, 0.5], 0.015, GRAPH, { sides: 6 });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 14), GRAPH, { at: [0, 1.16, 0.5], dir: [0, 0.45, -0.9], axis: "y" });
  glow(b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 14), "#ffb25a", { at: [0, 1.168, 0.483], dir: [0, 0.45, -0.9], axis: "y" }), 1.2);

  // ---------------------------------------------------------------- engine
  const CR: P = [0, 0.56, 0.1];
  box(0, 0.5, 0.1, 0.22, 0.26, 0.4, GRAPH);
  box(0, 0.46, -0.14, 0.2, 0.22, 0.22, GRAPH);
  box(0, 0.385, 0.1, 0.18, 0.05, 0.34, STEEL);
  for (let i = 0; i < 4; i++) box(0, 0.36, -0.02 + i * 0.08, 0.17, 0.012, 0.02, GRAPH2);
  for (const k of [1, -1]) {
    const d: P = [0, 0.766, 0.643 * k];
    const at = (t: number): P => [0, CR[1] + d[1] * t, CR[2] + d[2] * t];
    b.rod(at(0.04), at(0.3), 0.066, GRAPH, { sides: 10 });
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.014, 12), i % 2 ? GRAPH : STEEL, { at: at(0.07 + i * 0.04), dir: d, axis: "y" });
    }
    b.rod(at(0.28), at(0.36), 0.085, GRAPH, { sides: 10 });
    b.rod(at(0.36), at(0.405), 0.082, ORANGE, { sides: 10 });
    b.rod(at(0.405), at(0.44), 0.012, CHROME, { sides: 5 });
    for (const s of [1, -1]) {
      b.rod([s * 0.088, at(0.06)[1], at(0.06)[2]], [s * 0.088, at(0.36)[1], at(0.36)[2]], 0.008, CHROME, { sides: 5 });
    }
  }
  // intake / air cleaner (right, -X)
  cylX(-0.13, 0.66, 0.1, 0.03, 0.08, CHROME, 8);
  cylX(-0.19, 0.66, 0.1, 0.09, 0.06, CHROME, 18);
  ringX(-0.222, 0.66, 0.1, 0.075, 0.008, ORANGE, 18);
  cylX(-0.226, 0.66, 0.1, 0.03, 0.01, GRAPH, 10);
  // timing cover (right)
  cylX(-0.12, 0.52, 0.2, 0.07, 0.03, CHROME, 14);
  ringX(-0.136, 0.52, 0.2, 0.06, 0.006, ORANGE, 14);
  // primary cover (left)
  cylX(0.145, 0.45, -0.1, 0.115, 0.05, GRAPH, 20);
  ringX(0.172, 0.45, -0.1, 0.1, 0.01, ORANGE, 20);
  cylX(0.178, 0.45, -0.1, 0.045, 0.012, CHROME, 12);
  boltRingX(0.172, 0.45, -0.1, 0.075, 8, 0.008);

  // exhaust: drag pipes with heat shields
  for (const s of [1, -1]) {
    const pipe = catmull([
      [s * 0.04, 0.76, 0.38],
      [s * 0.14, 0.62, 0.47],
      [s * 0.2, 0.46, 0.42],
      [s * 0.22, 0.4, 0.2],
      [s * 0.23, 0.4, -0.3],
      [s * 0.24, 0.42, -0.8],
      [s * 0.25, 0.44, -1.1],
    ]);
    b.sweep(pipe, 0.032, CHROME, { sides: 8 });
    b.sweep(pipe.slice(0.3, 0.62), 0.04, GRAPH, { sides: 8, caps: "flat" });
    for (const t of [0.34, 0.42, 0.5, 0.58]) {
      const q = pipe.at(t);
      b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.01, 8), ORANGE, { at: q, dir: pipe.tangentAt(t), axis: "y" });
    }
    b.rod([s * 0.25, 0.44, -1.1], [s * 0.25, 0.445, -1.18], 0.042, GRAPH2, { sides: 8 });
    b.rod([s * 0.25, 0.445, -1.17], [s * 0.25, 0.445, -1.18], 0.034, ORANGE, { sides: 8 });
    // footpegs (forward) and rear pegs
    b.rod([s * 0.12, 0.42, 0.2], [s * 0.14, 0.4, 0.45], 0.02, GRAPH, { sides: 6 });
    b.rod([s * 0.14, 0.4, 0.45], [s * 0.3, 0.4, 0.45], 0.018, CHROME, { sides: 6 });
    b.rod([s * 0.2, 0.4, 0.45], [s * 0.29, 0.4, 0.45], 0.026, RUBBER, { sides: 8 });
    b.rod([s * 0.14, 0.5, -0.5], [s * 0.27, 0.5, -0.5], 0.016, CHROME, { sides: 6 });
    cylX(s * 0.27, 0.5, -0.5, 0.022, 0.03, ORANGE, 8);
  }

  // oil tank (right) and battery box (left)
  cylZ(-0.15, 0.6, -0.4, 0.075, 0.3, GRAPH, 12);
  cylZ(-0.15, 0.6, -0.24, 0.05, 0.02, ORANGE, 10);
  cylZ(-0.15, 0.6, -0.57, 0.077, 0.03, STEEL, 12);
  box(0.15, 0.6, -0.4, 0.09, 0.15, 0.22, GRAPH);
  box(0.197, 0.6, -0.4, 0.006, 0.12, 0.18, ORANGE);
  for (const z of [-0.3, -0.5]) bolt(0.2, 0.67, z);

  // ---------------------------------------------------------------- bodywork
  const tank = b.loft(
    [
      { at: [0, 0.96, 0.52], w: 0.12, h: 0.14 },
      { at: [0, 0.99, 0.4], w: 0.24, h: 0.22 },
      { at: [0, 1.0, 0.2], w: 0.3, h: 0.26 },
      { at: [0, 0.99, 0.0], w: 0.26, h: 0.24 },
      { at: [0, 0.96, -0.1], w: 0.14, h: 0.16 },
    ],
    { color: bodyPaint(0.03), sides: 12 },
  );
  const tsf = b.surface(tank);
  const badge = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 64">
      <polygon points="0,64 36,0 200,0 164,64" fill="#ff7a14"/>
      <polygon points="30,64 62,6 76,6 44,64" fill="#ffffff"/>
      <polygon points="82,64 114,6 122,6 90,64" fill="#1a1e26"/>
      <text x="110" y="44" font-size="26" font-weight="900" font-family="Arial, sans-serif" fill="#1a1e26">VX-9</text>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const hit = tsf.around([0, 1.0, 0.2]).at(90 * s, 4);
    if (hit) b.decal(tsf, badge, { at: hit, dir: [s, 0, 0], size: [0.28, 0.09] });
    // knee pads
    b.part(new THREE.SphereGeometry(0.05, 8, 6), GRAPH2, { at: [s * 0.15, 0.97, 0.12], scale: [0.35, 1.3, 2.0] });
  }
  // filler cap
  cylZ(0, 0, 0, 0.001, 0.001, GRAPH, 3).mesh.visible = false;
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 12), CHROME, { at: [0, 1.135, 0.3] });
  b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 12), ORANGE, { at: [0, 1.15, 0.3], rotation: [90, 0, 0] });
  b.rod([0, 1.14, 0.3], [0.03, 1.15, 0.3], 0.007, GRAPH2, { sides: 4 });

  // seat
  b.extrude(
    [
      [-0.35, 0.0],
      [0.25, 0.0],
      [0.3, 0.05],
      [0.1, 0.09],
      [-0.2, 0.07],
      [-0.35, 0.04],
    ],
    { at: [0, 0.82, -0.35], x: [0, 0, 1], thickness: 0.28, bevel: 0.03, smoothing: 1, color: seatPaint },
  );
  b.rod([0, 0.78, -0.55], [0, 0.82, -0.55], 0.03, STEEL, { sides: 8 });

  // rear fender
  const RC: P = [0, 0.36, RZ];
  const ra = (20 * Math.PI) / 180;
  b.sweep(arc(RC, [0, 0.36 + 0.42 * Math.cos(ra), RZ + 0.42 * Math.sin(ra)], [1, 0, 0], -110), () => [0.15, 0.012], bodyPaint(0.025), {
    section: "box",
    caps: "flat",
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.13, 0.36, RZ], [s * 0.13, 0.68, -1.12], 0.012, CHROME, { sides: 6 });
  }
  // tail light, plate
  b.part(new THREE.BoxGeometry(0.07, 0.025, 0.05), GRAPH2, { at: [0, 0.575, -1.235], dir: [0, 0.5, -0.866], axis: "y" });
  glow(b.part(new THREE.BoxGeometry(0.055, 0.012, 0.035), "#ff4a1f", { at: [0, 0.59, -1.245], dir: [0, 0.5, -0.866], axis: "y" }), 1.4);
  const plate = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">
      <rect x="2" y="2" width="156" height="86" rx="8" fill="#f4f6f8" stroke="#1a1e26" stroke-width="5"/>
      <rect x="10" y="10" width="140" height="14" fill="#ff7a14"/>
      <text x="80" y="68" font-size="40" font-weight="900" text-anchor="middle" font-family="Arial, sans-serif" fill="#1a1e26">VX-9</text>
    </svg>`,
    { size: 192 },
  );
  b.part(new THREE.PlaneGeometry(0.15, 0.085), "#ffffff", { at: [0, 0.38, -1.295], dir: [0, 0.1, -1], axis: "z", texture: plate });
  b.rod([0, 0.45, -1.27], [0, 0.4, -1.285], 0.008, GRAPH, { sides: 4 });

  return b.root;
}
