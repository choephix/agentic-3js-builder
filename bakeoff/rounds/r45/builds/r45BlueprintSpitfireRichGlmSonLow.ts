import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Blueprint Spitfire Mk V",
  "description": "A Supermarine Spitfire fighter built as a living cyanotype blueprint: deep Prussian-blue surfaces traced with pale-cyan panel lines, glowing cyan roundels and bright technical linework on every part."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  paper: "#16324f",
  paperShade: "#0f2438",
  panel: "#234e7a",
  line: "#cfeaff",
  glow: "#5fe8ff",
  ink: "#081524",
  steel: "#9fc2e0",
  steelDark: "#5d7fa0",
  brass: "#e3c06a",
  white: "#f5fbff",
  red: "#d85050",
  roundelBlue: "#3a7ec2",
  glass: "#8fd8ff",
  seat: "#5a4638",
  trim: "#e0c25a",
};
const M = {
  firewall: [0, 1.8, 2.55] as [number, number, number],
  deckTop: [0, 2.15, 1] as [number, number, number],
  wingRootL: [0.6, 1.5, 1.8] as [number, number, number],
  wingRootR: [-0.6, 1.5, 1.8] as [number, number, number],
  tailRoot: [0, 1.7, -3.45] as [number, number, number],
  gearMountL: [1.05, 1.3, 2.5] as [number, number, number],
  gearMountR: [-1.05, 1.3, 2.5] as [number, number, number],
  tailWheelMount: [0, 0.55, -4.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // nose
  (() => {
function buildNose({ b, J, P, M }: Ctx) {
  const air = J.airframe;
  const hub = J.propHub;
  const Z0 = 2.55, Z1 = 4.1, CY = 2.0;
  const radAt = (z: number) => {
    const t = (z - Z0) / (Z1 - Z0);
    return 0.62 + (0.42 - 0.62) * Math.pow(t, 1.3);
  };

  // Cowling: stacked frustum sections (lofted look), slightly taller than wide
  const N = 8;
  for (let i = 0; i < N; i++) {
    const za = Z0 + ((Z1 - Z0) * i) / N, zb = Z0 + ((Z1 - Z0) * (i + 1)) / N;
    const ra = radAt(za), rb = radAt(zb);
    const g = new THREE.CylinderGeometry(rb, ra, zb - za + 0.005, 16, 1, true);
    b.part(g, P.paper, {
      bone: air, at: [0, CY, (za + zb) / 2], dir: [0, 0, 1], scale: [1, 1, 1.0],
    });
  }
  // back cap closing the cowling
  b.part(new THREE.CircleGeometry(0.6, 16), P.paperShade, { bone: air, at: [0, CY, Z0 + 0.01], dir: [0, 0, -1], axis: "z" });
  b.part(new THREE.CircleGeometry(0.42, 16), P.paperShade, { bone: air, at: [0, CY, Z1 - 0.005], dir: [0, 0, 1], axis: "z" });

  // seam strips at two stations
  for (const z of [2.75, 3.85]) {
    const r = radAt(z) + 0.012;
    b.part(new THREE.TorusGeometry(r, 0.01, 4, 24), P.line, { bone: air, at: [0, CY, z] });
  }

  // cooling gills
  for (const s of [1, -1]) {
    for (let i = 0; i < 10; i++) {
      const z = 2.9 + (0.7 * i) / 9;
      const r = radAt(z);
      const x = s * (r + 0.006);
      b.part(new THREE.BoxGeometry(0.02, 0.22, 0.04), P.paperShade, { bone: air, at: [x, CY, z] });
      b.part(new THREE.BoxGeometry(0.008, 0.24, 0.008), P.line, { bone: air, at: [x + s * 0.008, CY, z + 0.022] });
    }
  }

  // access panels on top
  for (const z of [3.0, 3.55]) {
    const r = radAt(z);
    b.part(new THREE.BoxGeometry(0.3, 0.015, 0.35), P.panel, { bone: air, at: [0, CY + r + 0.003, z] });
    const y = CY + r + 0.012;
    b.part(new THREE.BoxGeometry(0.32, 0.006, 0.01), P.line, { bone: air, at: [0, y, z - 0.18] });
    b.part(new THREE.BoxGeometry(0.32, 0.006, 0.01), P.line, { bone: air, at: [0, y, z + 0.18] });
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.01, 0.006, 0.36), P.line, { bone: air, at: [s * 0.16, y, z] });
  }

  // exhaust stubs
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 2.85 + i * 0.27;
      const x = s * 0.64;
      b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.2, 8), P.steelDark, {
        bone: air, at: [x, CY - 0.08 - 0.03 * i, z], dir: [s, -0.15, 0],
      });
      b.part(new THREE.TorusGeometry(0.05, 0.01, 4, 8), P.line, {
        bone: air, at: [x + s * 0.1, CY - 0.11 - 0.03 * i, z], dir: [s, 0, 0], axis: "z",
      });
    }
  }

  // spinner
  b.lathe([[0, 4.1], [0.42, 4.1], [0.36, 4.3], [0.22, 4.55], [0.07, 4.78], [0, 4.82]].map(([r, z]) => [r, z - 4.1] as [number, number]), {
    at: [0, 2.05, 4.1], axis: [0, 0, 1], bone: hub, color: P.paper, segments: 16, smoothing: 1,
  });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), P.brass, { bone: hub, at: [0, 2.05, 4.8] });
  b.part(new THREE.TorusGeometry(0.425, 0.012, 4, 24), P.glow, { bone: hub, at: [0, 2.05, 4.11] });

  // propeller blades
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + Math.PI / 2;
    const d = [Math.cos(a), Math.sin(a), 0];
    const base = (r: number, dz = 0): [number, number, number] => [d[0] * r, 2.05 + d[1] * r, 4.2 + dz];
    const sl = (r0: number, r1: number, w0: number, w1: number, c: string, dz = 0) =>
      b.frustumBox(base(r0, dz), base(r1, dz), [w0, 0.035], [w1, 0.025], { bone: hub, color: c });
    sl(0.2, 0.83, 0.2, 0.12, P.paperShade);
    sl(0.83, 0.95, 0.12, 0.1, P.glow);
    // leading edge strip
    const lead = (r0: number, r1: number, w: number, c: string) => {
      const p0 = base(r0), p1 = base(r1);
      const nx = -d[1], ny = d[0];
      const off = 0.5 * w;
      b.rod([p0[0] + nx * off, p0[1] + ny * off, 4.2 + 0.02], [p1[0] + nx * off, p1[1] + ny * off, 4.2 + 0.02], 0.007, { bone: hub, color: c });
    };
    lead(0.2, 0.83, 0.17, P.line);
  }
  // prop disc annotation ring
  b.part(new THREE.TorusGeometry(0.95, 0.007, 4, 48), P.glow, { bone: hub, at: [0, 2.05, 4.2] });
}
    return buildNose;
  })(),
  // fuselage
  (() => {
function buildFuselage({ b, J, P, M }: Ctx) {
  const bone = J.airframe;
  // Section stations: z, half width, half height, centre y
  const st: [number, number, number, number][] = [
    [2.55, 0.31, 0.36, 1.82],
    [1.8, 0.325, 0.38, 1.85],
    [1.0, 0.33, 0.4, 1.88],
    [0.0, 0.31, 0.37, 1.88],
    [-1.2, 0.26, 0.32, 1.9],
    [-2.3, 0.2, 0.25, 1.93],
    [-3.45, 0.15, 0.19, 1.95],
  ];
  const stations = st.map(([z, w, h, y]) => ({ at: [0, y, z] as [number, number, number], w: w * 2, h: h * 2 }));
  const hull = b.loft(stations, { bone, color: P.paper, sides: 12 } as any);

  // Interpolated section at z
  const sec = (z: number) => {
    for (let i = 0; i < st.length - 1; i++) {
      const a = st[i], c = st[i + 1];
      if (z <= a[0] && z >= c[0]) {
        const t = (a[0] - z) / (a[0] - c[0]);
        return { w: a[1] + (c[1] - a[1]) * t, h: a[2] + (c[2] - a[2]) * t, y: a[3] + (c[3] - a[3]) * t };
      }
    }
    return { w: st[6][1], h: st[6][2], y: st[6][3] };
  };

  // Flat spine deck
  b.part(new THREE.BoxGeometry(0.34, 0.03, 4.6), P.paperShade, { bone, at: [0, 2.17, -0.6] });
  b.part(new THREE.BoxGeometry(0.04, 0.02, 4.6), P.line, { bone, at: [0, 2.195, -0.6] });

  // Frame station strips (rings)
  const zs = [2.4, 1.8, 1.2, 0.5, -0.5, -1.5, -2.4, -3.3];
  for (const z of zs) {
    const s = sec(z);
    const rx = s.w + 0.006, ry = s.h + 0.006;
    const pts: number[][] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push([Math.sin(a) * rx, s.y + Math.cos(a) * ry, z]);
    }
    for (let i = 0; i < 16; i++) {
      const p = pts[i], q = pts[(i + 1) % 16];
      b.rod(p, q, 0.006, P.line, { bone });
    }
  }

  // Longitudinal stringers and flank patches
  for (const sd of [1, -1]) {
    for (const ang of [0.5, -0.45]) {
      const path: number[][] = [];
      for (let z = 2.4; z >= -3.3; z -= 0.45) {
        const s = sec(z);
        path.push([sd * Math.sin(1.2 + ang) * (s.w + 0.006), s.y + Math.cos(1.2 + ang) * (s.h + 0.006) - 0.0, z]);
      }
      for (let i = 0; i < path.length - 1; i++) b.rod(path[i], path[i + 1], 0.005, P.line, { bone });
    }
    for (const [z0, len] of [[1.6, 0.9], [-0.4, 1.2], [-2.0, 1.0]] as [number, number][]) {
      const s = sec(z0);
      b.part(new THREE.BoxGeometry(0.012, s.h * 0.7, len), P.panel, { bone, at: [sd * (s.w - 0.002), s.y + 0.02, z0] });
    }
    // Roundel on flank
    const s = sec(0.3);
    const x = sd * (s.w + 0.004);
    const rd: [number, string][] = [[0.22, P.roundelBlue], [0.15, P.white], [0.07, P.red]];
    b.part(new THREE.CylinderGeometry(0.23, 0.23, 0.006, 20), P.ink, { bone, at: [x, 1.85, 0.3], dir: [sd, 0, 0] });
    rd.forEach(([r, c], i) =>
      b.part(new THREE.CylinderGeometry(r, r, 0.006, 20), c, { bone, at: [x + sd * 0.004 * (i + 1), 1.85, 0.3], dir: [sd, 0, 0] }),
    );
  }

  // Vent and filler dots
  const r = rng(5);
  for (let i = 0; i < 6; i++) {
    const z = 2.2 - r() * 4.5;
    const s = sec(z);
    const sd = i % 2 ? 1 : -1;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.ink, { bone, at: [sd * (s.w - 0.002), s.y + 0.1 + r() * 0.1, z] });
  }

  // Antenna mast and wire
  b.rod([0, 2.17, -0.2], [0, 2.5, -0.25], 0.012, P.steel, { bone });
  b.rod([0, 2.5, -0.25], [0, 2.3, -2.6], 0.004, P.ink, { bone });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), P.steel, { bone, at: [0, 2.5, -0.25] });

  // Belly breather scoops
  for (const sd of [1, -1]) {
    const s = sec(1.6);
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.2), P.ink, { bone, at: [sd * 0.12, s.y - s.h + 0.0, 1.6] });
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.03), P.line, { bone, at: [sd * 0.12, s.y - s.h - 0.03, 1.72] });
  }
}
    return buildFuselage;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const air = J.airframe;
  const rand = rng(5);
  // chord/leading edge z and thickness as function of span fraction u (elliptical)
  const chordAt = (u: number) => 1.1 + 1.9 * Math.sqrt(Math.max(0, 1 - u * u * 0.97));
  const xOf = (u: number) => 0.6 + u * 5.0;
  const yOf = (u: number) => 1.5 + u * 0.25;
  const zc = (u: number) => 1.8 - 0.0 * u + (u * u) * 0.0; // quarter-chord-ish centre
  const leadZ = (u: number) => zc(u) + chordAt(u) * 0.38 + 0.0;
  const trailZ = (u: number) => leadZ(u) - chordAt(u);
  for (const s of [1, -1]) {
    const N = 9;
    const stations: { at: number[]; w: number; h: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const c = chordAt(u);
      const th = Math.max(0.1, c * 0.13 * (1 - 0.25 * u));
      stations.push({ at: [s * xOf(u), yOf(u), (leadZ(u) + trailZ(u)) / 2], w: th, h: c } as any);
    }
    // loft: w = across x?? use box frustums per segment for reliable orientation
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N;
      const c0 = chordAt(u0), c1 = chordAt(u1);
      b.frustumBox(
        [s * xOf(u0), yOf(u0), (leadZ(u0) + trailZ(u0)) / 2],
        [s * xOf(u1), yOf(u1), (leadZ(u1) + trailZ(u1)) / 2],
        [c0, Math.max(0.1, c0 * 0.13)],
        [c1, Math.max(0.08, c1 * 0.13 * 0.8)],
        { color: P.paper, bone: air },
      );
    }
    // rounded tip
    b.part(new THREE.SphereGeometry(0.55, 10, 8), P.paper, { at: [s * 5.6, yOf(1), (leadZ(1) + trailZ(1)) / 2], scale: [0.2, 0.1, 1], bone: air });
    // panel patches on top
    for (const [u, w] of [[0.2, 0.9], [0.45, 0.8], [0.7, 0.6]] as number[][]) {
      const c = chordAt(u);
      b.part(new THREE.BoxGeometry(0.9, 0.012, c * 0.45), P.panel, {
        at: [s * xOf(u), yOf(u) + c * 0.065 + 0.004, (leadZ(u) + trailZ(u)) / 2 + c * 0.1],
        bone: air,
      });
    }
    // ribs
    for (let k = 1; k <= 5; k++) {
      const u = (k * 0.5) / 5.0 * 1.0 * 0.9;
      const x = 0.6 + k * 0.5 + 0.3;
      const uu = (x - 0.6) / 5.0;
      const c = chordAt(uu);
      b.part(new THREE.BoxGeometry(0.02, 0.01, c * 0.85), P.ink, {
        at: [s * x, yOf(uu) + Math.max(0.1, c * 0.13 * (1 - 0.25 * uu)) / 2 * 0.8 + 0.01, (leadZ(uu) + trailZ(uu)) / 2],
        bone: air,
      });
    }
    // spar strip
    for (let i = 0; i < 8; i++) {
      const u0 = i / 9 * 0.9, u1 = (i + 1) / 9 * 0.9;
      const z0 = leadZ(u0) - chordAt(u0) * 0.3, z1 = leadZ(u1) - chordAt(u1) * 0.3;
      const c = chordAt(u0);
      b.rod([s * xOf(u0), yOf(u0) + c * 0.065 + 0.012, z0], [s * xOf(u1), yOf(u1) + chordAt(u1) * 0.065 + 0.012, z1], 0.012, P.line, { bone: air });
    }
    // rivets
    for (let k = 0; k < 8; k++)
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.line, { at: [s * (0.8 + k * 0.1), 1.5 + 0.2 + 0.0, 1.0 + k * 0.0 + (k % 2) * 0.0 + 0.4 * 0 + 1.2 + 0], bone: air });
    // cannon
    for (const x of [1.7, 2.6]) {
      const u = (x - 0.6) / 5.0;
      const lz = leadZ(u);
      const y = yOf(u);
      const hz = lz + 0.0;
      b.rod([s * x, y, hz - 0.1], [s * x, y, hz + 0.55], 0.045, P.steel, { bone: air });
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), P.brass, { at: [s * x, y, hz + 0.5], dir: [0, 0, 1], bone: air });
      b.part(new THREE.SphereGeometry(0.03, 6, 4), P.glow, { at: [s * x, y, hz + 0.57], bone: air });
      const c = chordAt(u);
      const ty = y + c * 0.065 + 0.01;
      b.part(new THREE.SphereGeometry(0.07, 8, 5), P.ink, { at: [s * x, ty, lz - 0.25], scale: [1, 0.15, 2], bone: air });
    }
    // roundel on top
    {
      const u = (2.4 - 0.6) / 5.0;
      const c = chordAt(u);
      const y = yOf(u) + c * 0.065 + 0.02;
      const z = 2.3;
      const rs: [number, string][] = [[0.31, P.ink], [0.3, P.roundelBlue], [0.2, P.white], [0.09, P.red]];
      rs.forEach(([r, col], i) =>
        b.part(new THREE.CylinderGeometry(r, r, 0.01, 20), col, { at: [s * 2.4, y + i * 0.004, z], bone: air }),
      );
    }
    // walkway
    b.part(new THREE.BoxGeometry(0.5, 0.012, 1.2), P.trim, { at: [s * 1.0, 1.5 + 0.2 + 0.0, 1.2], bone: air });
    // landing light
    b.part(new THREE.SphereGeometry(0.08, 8, 6), P.glow, { at: [s * 1.2, yOf(0.12), leadZ(0.12) - 0.02], scale: [1, 0.8, 0.6], bone: air });
  }
  // pitot
  {
    const u = 0.95;
    const x = 0.6 + u * 5.0 - 0.3;
    const y = yOf(u) - 0.1, z = leadZ(u) - 0.05;
    b.rod([x, y, z - 0.05], [x, y, z + 0.35], 0.014, P.steel, { bone: air });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), P.glow, { at: [x, y, z + 0.37], bone: air });
  }
  // ailerons visual strips
  for (const [s, j] of [[1, J.aileronL], [-1, J.aileronR]] as [number, any][]) {
    b.part(new THREE.BoxGeometry(1.6, 0.03, 0.04), P.line, { at: [s * 3.7, 1.5 + 0.25 * 0.6 + 0.07, 1.0], bone: j });
  }
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const L = P.line, G = P.glow, INK = P.ink;

  // Fin outline in (z-forward-to-back as x, y). Drawn with x running toward -Z (aft).
  // origin at z=-3.45 deck, y=1.7
  const finOutline: [number, number][] = [
    [0, 0], [0.95, 0], [1.0, 0.5], [0.9, 1.1], [0.75, 1.55], [0.55, 1.75], [0.3, 1.7], [0.1, 1.2], [-0.1, 0.6], [-0.15, 0.1],
  ];
  const finAt: [number, number, number] = [0, 1.7, -3.45];
  const fin = b.extrude(finOutline, {
    at: finAt, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.09, bevel: 0.02, smoothing: 1,
    color: P.paper, bone: J.airframe,
  });
  // outline strip along leading edge and top
  const lead: number[][] = [[-0.15, 0.1], [-0.1, 0.6], [0.1, 1.2], [0.3, 1.7], [0.55, 1.75]];
  const pts = lead.map(([u, v]) => [0, finAt[1] + v, finAt[2] - u]);
  b.sweep(pts.map((p) => [p[0], p[1], p[2]]), 0.014, { color: L, bone: J.airframe, sides: 6 });
  b.rod([0, 1.7, -3.55], [0, 1.7, -4.4], 0.014, L, { bone: J.airframe, sides: 6 });
  // fin flash stripes
  const cols = [P.roundelBlue, P.white, P.roundelBlue];
  cols.forEach((c, i) => {
    const z = -3.45 + 0.1 - (-0.0) + 0; // base
    b.part(new THREE.BoxGeometry(0.1, 0.42, 0.1), c, {
      bone: J.airframe, at: [0, 3.0, -3.52 - 0.1 * i - 0.04], rotation: [0, 0, 0],
    });
  });
  // frame station strips around fin
  [[0.3, 2.0, 1.0], [0.5, 2.5, 0.8], [0.75, 3.0, 0.55]].forEach(([u, y]) => {
    b.part(new THREE.BoxGeometry(0.12, 0.014, 0.014), L, { bone: J.airframe, at: [0, y, -3.45 - u - 0.0] });
    b.part(new THREE.BoxGeometry(0.1, 0.014, 0.014), L, { bone: J.airframe, at: [0, y + 0.0, -3.45 - u] });
  });
  [-3.75, -3.95, -4.15].forEach((z, i) => {
    const y = 1.95 + i * 0.4;
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.016), L, { bone: J.airframe, at: [0, y, z] });
  });
  // tail lamp
  b.part(new THREE.SphereGeometry(0.035, 6, 4), G, { bone: J.airframe, at: [0, 3.46, -3.95] });

  // Rudder
  const rud: [number, number][] = [[0, 0], [0.45, 0], [0.55, 0.35], [0.6, 0.9], [0.5, 1.4], [0.3, 1.5], [0, 1.3]];
  b.extrude(rud, {
    at: [0, 1.95, -4.0], x: [0, 0, -1], thickness: 0.055, bevel: 0.01, smoothing: 1,
    color: P.panel, bone: J.rudderHinge,
  });
  b.rod([0, 1.95, -4.0], [0, 3.3, -4.0], 0.012, L, { bone: J.rudderHinge, sides: 6 });
  b.rod([0, 1.95, -4.46], [0, 2.4, -4.5], 0.012, L, { bone: J.rudderHinge, sides: 6 });
  // horn balance
  b.part(new THREE.BoxGeometry(0.05, 0.18, 0.14), P.panel, { bone: J.rudderHinge, at: [0, 2.0, -4.0] });
  // trim tab
  b.part(new THREE.BoxGeometry(0.04, 0.2, 0.12), P.paperShade, { bone: J.rudderHinge, at: [0, 2.15, -4.6] });
  b.part(new THREE.BoxGeometry(0.045, 0.2, 0.012), L, { bone: J.rudderHinge, at: [0, 2.15, -4.54] });

  // Tailplanes and elevators
  for (const s of [1, -1]) {
    const el = s > 0 ? J.elevatorL : J.elevatorR;
    const plane: [number, number][] = [[0, 0], [0.5, -0.0], [1.35, 0.2], [1.9, 0.38], [1.9, 0.5], [1.6, 0.7], [0.5, 0.9], [0, 0.9]];
    // front half (fixed): span along x, chord along -z mapped as y of outline
    const fixed: [number, number][] = [[0.2, 0], [1.1, 0], [1.1, 0.45], [0.2, 0.45]];
    b.extrude(fixed, {
      at: [s * 0.0, 2.1, -3.5], x: [s, 0.12, 0], y: [0, 0, -1], thickness: 0.06, bevel: 0.01,
      color: P.paper, bone: J.airframe,
    });
    const tipFixed: [number, number][] = [[1.1, 0], [1.6, 0.05], [1.9, 0.22], [1.9, 0.45], [1.1, 0.45]];
    b.extrude(tipFixed, {
      at: [0, 2.1, -3.5], x: [s, 0.12, 0], y: [0, 0, -1], thickness: 0.06, bevel: 0.01, smoothing: 1,
      color: P.paper, bone: J.airframe,
    });
    // elevator
    const ele: [number, number][] = [[0.35, 0.45], [1.1, 0.45], [1.75, 0.45], [1.85, 0.6], [1.6, 0.9], [0.35, 0.9]];
    b.extrude(ele, {
      at: [0, 2.1, -3.5], x: [s, 0.12, 0], y: [0, 0, -1], thickness: 0.05, bevel: 0.008, smoothing: 1,
      color: P.panel, bone: el,
    });
    // horn balance
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.14), P.panel, { bone: el, at: [s * 1.3, 2.31, -3.5 - 0.95] });
    // edge lines
    b.rod([s * 0.35, 2.1, -3.95], [s * 1.8, 2.32, -3.95], 0.012, L, { bone: el, sides: 6 });
    b.rod([s * 0.2, 2.1, -4.4], [s * 1.7, 2.32, -4.4], 0.012, L, { bone: el, sides: 6 });
    b.rod([s * 0.2, 2.1, -3.5], [s * 1.9, 2.33, -3.72], 0.01, INK, { bone: J.airframe, sides: 6 });
    // ribs
    for (let i = 0; i < 3; i++) {
      const x = s * (0.6 + i * 0.5);
      b.rod([x, 2.14 + i * 0.03, -3.55], [x, 2.14 + i * 0.03, -4.35], 0.008, INK, { bone: J.airframe, sides: 5 });
    }
  }
  void R; void frame; void M;
}
    return buildTail;
  })(),
  // cockpit
  (() => {
function buildCockpit({ b, J, P, M }: Ctx) {
  const bone = J.airframe;
  const Y0 = M.deckTop[1];
  const R = rng(5);

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const rod = (a: number[], c2: number[], r: number, c: string) => b.rod(a, c2, r, c, { bone, sides: 6 });

  // canopy profile: z -> half width, height above deck
  const prof = (z: number) => {
    const t = Math.min(Math.max((z - 0.5) / 1.25, 0), 1);
    const h = 0.5 * Math.sin(Math.PI * Math.pow(t, 0.8)) ** 0.7;
    const w = 0.44 * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.1)));
    return { h, w };
  };

  // hoop frames
  const hoop = (z: number, r: number) => {
    const { h, w } = prof(z);
    const hh = Math.max(h, 0.2);
    const pts: number[][] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI;
      pts.push([Math.cos(a) * w, Y0 + Math.sin(a) * hh, z]);
    }
    b.sweep(pts, r, { bone, color: P.steel, sides: 6 });
  };
  hoop(0.95, 0.018);
  hoop(1.35, 0.018);
  hoop(0.55, 0.022);

  // windscreen
  const wsH = 0.3;
  box(0.62, wsH, 0.02, P.glass, [0, Y0 + wsH / 2 + 0.02, 0.52], [-28, 0, 0]);
  box(0.66, 0.025, 0.04, P.steel, [0, Y0 + wsH + 0.04, 0.46], [-28, 0, 0]);
  for (const s of [1, -1]) rod([s * 0.31, Y0, 0.6], [s * 0.31, Y0 + wsH + 0.03, 0.46], 0.015, P.steel);

  // side glass panes and roof panes
  for (const s of [1, -1]) {
    for (const [z0, z1] of [[0.55, 0.95], [0.95, 1.35], [1.35, 1.75]]) {
      const zm = (z0 + z1) / 2;
      const a = prof(zm);
      b.part(new THREE.BoxGeometry(0.012, a.h * 0.8, z1 - z0 - 0.04), P.glass, {
        bone,
        at: [s * (a.w * 0.9), Y0 + a.h * 0.45, zm],
        rotation: [0, 0, s * -12],
      });
    }
    // roof pane
    b.part(new THREE.BoxGeometry(0.28, 0.012, 0.8), P.glass, {
      bone,
      at: [s * 0.16, Y0 + 0.5, 1.15],
      rotation: [0, 0, s * -10],
    });
    // side rails
    rod([s * 0.5, Y0 + 0.02, 0.4], [s * 0.5, Y0 + 0.02, 1.7], 0.02, P.steel);
    rod([s * 0.47, Y0 + 0.06, 0.4], [s * 0.47, Y0 + 0.06, 1.7], 0.008, P.line);
    // longitudinal canopy rail
    const pts: number[][] = [];
    for (let z = 0.5; z <= 1.76; z += 0.1) {
      const a = prof(z);
      pts.push([s * a.w, Y0 + a.h * 0.95 + 0.02, z]);
    }
    b.sweep(pts, 0.014, { bone, color: P.steel, sides: 6 });
  }
  // roof ridge and rear fairing
  const ridge: number[][] = [];
  for (let z = 0.5; z <= 1.76; z += 0.1) ridge.push([0, Y0 + prof(z).h + 0.02, z]);
  b.sweep(ridge, 0.016, { bone, color: P.steel, sides: 6 });
  box(0.5, 0.2, 0.08, P.paper, [0, Y0 + 0.05, 1.74], [-20, 0, 0]);
  box(0.36, 0.05, 0.3, P.paperShade, [0, Y0 + 0.02, 1.6]);

  // base rail seam
  box(1.0, 0.012, 0.015, P.line, [0, Y0 + 0.01, 0.4]);
  box(1.0, 0.012, 0.015, P.line, [0, Y0 + 0.01, 1.74]);

  // seat, rail, headrest
  box(0.4, 0.07, 0.3, P.seat, [0, Y0 + 0.14, 1.05]);
  box(0.4, 0.3, 0.06, P.seat, [0, Y0 + 0.3, 1.22], [-10, 0, 0]);
  box(0.26, 0.14, 0.08, P.seat, [0, Y0 + 0.5, 1.28]);
  for (const s of [1, -1]) {
    box(0.03, 0.03, 0.34, P.ink, [s * 0.22, Y0 + 0.1, 1.05]);
    box(0.03, 0.12, 0.03, P.ink, [s * 0.22, Y0 + 0.05, 0.9]);
  }
  // control stick
  rod([0, Y0 + 0.02, 0.7], [0, Y0 + 0.25, 0.78], 0.012, P.steelDark);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), P.ink, { bone, at: [0, Y0 + 0.26, 0.79] });

  // instrument panel cowl
  box(0.6, 0.14, 0.24, P.ink, [0, Y0 + 0.07, 0.4], [-8, 0, 0]);
  box(0.6, 0.02, 0.1, P.paperShade, [0, Y0 + 0.16, 0.34]);
  const dials = [[-0.12, 0.1], [0.12, 0.1], [-0.12, 0.04], [0.12, 0.04]];
  dials.forEach(([x, y], i) => {
    const at = [x, Y0 + 0.01 + y + 0.04, 0.505];
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 10), P.line, { bone, at, dir: [0, 0.1, 1] });
    b.part(new THREE.BoxGeometry(0.004, 0.028, 0.004), P.ink, {
      bone,
      at: [x, at[1], 0.512],
      rotation: [0, 0, i * 50 + R() * 30],
    });
  });

  // gun sight
  rod([0, Y0 + 0.14, 0.52], [0, Y0 + 0.28, 0.55], 0.012, P.steel);
  box(0.09, 0.07, 0.07, P.brass, [0, Y0 + 0.31, 0.56]);
  box(0.085, 0.07, 0.01, P.glass, [0, Y0 + 0.35, 0.6], [-35, 0, 0]);
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.glow, { bone, at: [0, Y0 + 0.35, 0.595] });
}
    return buildCockpit;
  })(),
  // gear
  (() => {
type Ctx = { b: any; J: any; P: any; M: any };

function buildGear({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const cyl = (r0: number, r1: number, h: number, s = 10) => new THREE.CylinderGeometry(r0, r1, h, s);

  for (const s of [1, -1]) {
    const wj = s > 0 ? J.wheelFL : J.wheelFR;
    const top = [s * 1.05, 1.3, 2.5];
    const mid = [s * 1.1, 0.8, 2.42];
    const hub = [s * 1.15, 0.33, 2.35];

    // main leg
    b.rod(top, hub, 0.065, P.steel, { bone: J.airframe });
    b.rod(top, mid, 0.09, P.steelDark, { bone: J.airframe });
    // seam strip
    b.rod([s * 1.08, 1.05, 2.46], [s * 1.1, 0.95, 2.44], 0.072, P.ink, { bone: J.airframe });
    b.rod([s * 1.12, 0.62, 2.39], [s * 1.13, 0.5, 2.37], 0.072, P.ink, { bone: J.airframe });
    // fairing collar on top
    b.part(cyl(0.11, 0.09, 0.12, 8), P.steelDark, { bone: J.airframe, at: [s * 1.05, 1.27, 2.5] });
    // drag strut
    b.rod(mid, [s * 0.55, 1.2, 1.7], 0.04, P.steel, { bone: J.airframe });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.steelDark, { bone: J.airframe, at: mid });
    // torque link
    b.rod([s * 1.14, 0.78, 2.46], [s * 1.14, 0.55, 2.3], 0.02, P.steelDark, { bone: J.airframe });
    b.rod([s * 1.14, 0.55, 2.3], [s * 1.14, 0.42, 2.36], 0.02, P.line, { bone: J.airframe });
    // axle
    b.rod([s * 1.1, 0.33, 2.35], [s * 1.26, 0.33, 2.35], 0.035, P.steel, { bone: wj });

    // wheel (axis X)
    const ax = [0, 0, s > 0 ? -90 : 90];
    const rot = (a: number[]) => a.map((d) => (d * Math.PI) / 180);
    const place = (g: THREE.BufferGeometry, c: string, off: number, bone = wj) =>
      b.part(g, c, { bone, at: [hub[0] + s * off, hub[1], hub[2]], rotation: ax });
    b.part(new THREE.TorusGeometry(0.27, 0.06, 6, 16), P.ink, {
      bone: wj, at: hub, quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
    });
    place(cyl(0.33, 0.33, 0.14, 16), P.ink, 0);
    place(cyl(0.3, 0.3, 0.145, 16), P.paperShade, 0);
    place(cyl(0.325, 0.325, 0.1, 16), P.ink, 0);
    place(cyl(0.2, 0.2, 0.15, 14), P.steel, 0.0);
    place(cyl(0.2, 0.2, 0.03, 14), P.line, 0.07 * 1.02 + 0.0);
    place(cyl(0.07, 0.07, 0.19, 8), P.steelDark, 0.0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(cyl(0.022, 0.022, 0.03, 6), P.ink, {
        bone: wj,
        at: [hub[0] + s * 0.078, hub[1] + Math.cos(a) * 0.13, hub[2] + Math.sin(a) * 0.13],
        rotation: ax,
      });
    }
    // tire tread lines
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + R() * 0.1;
      b.part(new THREE.BoxGeometry(0.15, 0.035, 0.05), P.paperShade, {
        bone: wj,
        at: [hub[0], hub[1] + Math.cos(a) * 0.33, hub[2] + Math.sin(a) * 0.33],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
      });
    }
  }

  // tailwheel
  const tw = J.tailWheel;
  const tc = [0, 0.16, -4.35];
  b.rod([0, 0.55, -4.3], [0, 0.34, -4.33], 0.05, P.steel, { bone: J.airframe });
  b.part(cyl(0.07, 0.06, 0.1, 8), P.steelDark, { bone: J.airframe, at: [0, 0.55, -4.3] });
  for (const s of [1, -1]) b.rod([0, 0.34, -4.33], [s * 0.1, 0.16, -4.35], 0.025, P.steel, { bone: J.airframe });
  b.part(cyl(0.16, 0.16, 0.09, 12), P.ink, { bone: tw, at: tc, rotation: [0, 0, 90] });
  b.part(cyl(0.11, 0.11, 0.095, 10), P.steel, { bone: tw, at: tc, rotation: [0, 0, 90] });
  b.part(cyl(0.04, 0.04, 0.12, 6), P.line, { bone: tw, at: tc, rotation: [0, 0, 90] });
}
    return buildGear;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cyanotypeSpitfire" });
  const J: Record<string, Joint> = {};
  J["airframe"] = b.joint("airframe", { at: [0,1.7,0], dir: [0,1,0], role: "spine" });
  J["propHub"] = b.joint("propHub", { parent: J["airframe"], at: [0,2.05,4.15], dir: [0,0,1], role: "hinge", group: "prop" });
  J["aileronL"] = b.joint("aileronL", { parent: J["airframe"], at: [2.9,1.55,0.95], dir: [1,0,0], role: "hinge", group: "controls" });
  J["aileronR"] = b.joint("aileronR", { parent: J["airframe"], at: [-2.9,1.55,0.95], dir: [-1,0,0], role: "hinge", group: "controls" });
  J["rudderHinge"] = b.joint("rudderHinge", { parent: J["airframe"], at: [0,2.4,-4.45], dir: [0,1,0], role: "hinge", group: "controls" });
  J["elevatorL"] = b.joint("elevatorL", { parent: J["airframe"], at: [1.1,2.1,-4.3], dir: [1,0,0], role: "hinge", group: "controls" });
  J["elevatorR"] = b.joint("elevatorR", { parent: J["airframe"], at: [-1.1,2.1,-4.3], dir: [-1,0,0], role: "hinge", group: "controls" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["airframe"], at: [1.15,0.33,2.35], dir: [1,0,0], role: "hinge", group: "gear" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["airframe"], at: [-1.15,0.33,2.35], dir: [-1,0,0], role: "hinge", group: "gear" });
  J["tailWheel"] = b.joint("tailWheel", { parent: J["airframe"], at: [0,0.16,-4.35], dir: [0,1,0], role: "hinge", group: "gear" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
