import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Spitfire Blueprint",
  "description": "A Supermarine Spitfire Mk I fighter drawn as a cyanotype blueprint: deep Prussian-blue airframe with white-line panel seams, rivets, roundels as outline rings and a chalk-white annotation frame of ribs and spars."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  prussian: "#0b3a73",
  deepBlue: "#082a56",
  midBlue: "#1c5ba6",
  paleBlue: "#5d9ad6",
  cyanLine: "#a9dcff",
  chalk: "#f2f8ff",
  inkBlue: "#051c3a",
  glass: "#7fb8ec",
  rubber: "#06182f",
};
const M = {
  noseTip: [0, 1.55, 3] as [number, number, number],
  propHub: [0, 1.55, 3.6] as [number, number, number],
  cockpitCenter: [0, 1.95, -0.3] as [number, number, number],
  wingRootL: [0.5, 1.35, 0.2] as [number, number, number],
  wingRootR: [-0.5, 1.35, 0.2] as [number, number, number],
  tailRoot: [0, 1.6, -3.6] as [number, number, number],
  fuselageEnd: [0, 1.75, -4.5] as [number, number, number],
  gearL: [1.4, 1, 0.7] as [number, number, number],
  gearR: [-1.4, 1, 0.7] as [number, number, number],
  tailWheel: [0, 0.3, -4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // fuselage
  (() => {
function buildFuselage({ b, J, P, M }: Ctx) {
  const bone = J.fuselage;
  const C = { deep: P.deepBlue, pru: P.prussian, mid: P.midBlue, pale: P.paleBlue, line: P.cyanLine, chalk: P.chalk, ink: P.inkBlue, glass: P.glass };

  // Fuselage stations: z, centre y, half width, half height
  const st: [number, number, number, number][] = [
    [3.0, 1.55, 0.22, 0.24],
    [2.4, 1.58, 0.36, 0.38],
    [1.6, 1.62, 0.5, 0.5],
    [0.8, 1.66, 0.56, 0.58],
    [0.0, 1.7, 0.54, 0.62],
    [-0.9, 1.72, 0.46, 0.55],
    [-2.0, 1.74, 0.35, 0.42],
    [-3.2, 1.76, 0.24, 0.3],
    [-4.5, 1.78, 0.08, 0.12],
  ];
  const body = b.loft(
    st.map(([z, y, w, h]) => ({ at: [0, y, z] as [number, number, number], w: w * 2, h: h * 2 })),
    { bone, color: C.pru, name: "fuselageSkin" },
  );
  // paler belly
  b.loft(
    st.slice(0, 8).map(([z, y, w, h]) => ({ at: [0, y - h * 0.62, z] as [number, number, number], w: w * 1.5, h: h * 0.5 })),
    { bone, color: C.mid, name: "fuselageBelly" },
  );
  // dark upper cowl strip
  b.loft(
    st.slice(0, 4).map(([z, y, w, h]) => ({ at: [0, y + h * 0.82, z] as [number, number, number], w: w * 0.9, h: h * 0.3 })),
    { bone, color: C.deep, name: "cowlTop" },
  );

  const at = (z: number) => {
    let i = 0;
    while (i < st.length - 2 && z < st[i + 1][0]) i++;
    const a = st[i], c = st[i + 1];
    const t = (a[0] - z) / (a[0] - c[0]);
    return { y: a[1] + (c[1] - a[1]) * t, w: a[2] + (c[2] - a[2]) * t, h: a[3] + (c[3] - a[3]) * t };
  };

  // station rings in chalk
  for (const z of [2.7, 2.0, 1.2, 0.4, -1.4, -2.4, -3.0, -3.8]) {
    const s = at(z);
    const g = new THREE.TorusGeometry(1, 0.008, 4, 20);
    b.part(g, z > 1.2 ? C.line : C.chalk, { bone, at: [0, s.y, z], scale: [s.w * 1.02, s.h * 1.02, 1], dir: [0, 0, 1], axis: "z" });
  }
  // side panel seams (long lines) both sides
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 1.55, 3.0], [s * 0.5, 1.62, 1.0], 0.007, C.line, { bone });
    b.rod([s * 0.5, 1.62, 1.0], [s * 0.45, 1.7, -2], 0.006, C.chalk, { bone });
    b.rod([s * 0.45, 1.7, -2], [s * 0.2, 1.77, -4.4], 0.006, C.chalk, { bone });
    b.rod([s * 0.45, 1.98, 0.9], [s * 0.3, 2.08, 2.8], 0.006, C.line, { bone });
  }
  // rivets on cowl
  const r = rng(11);
  for (const s of [1, -1])
    for (let i = 0; i < 12; i++) {
      const z = 2.8 - i * 0.2;
      const q = at(z);
      b.part(new THREE.SphereGeometry(0.014, 5, 4), C.chalk, { bone, at: [s * q.w * 0.98, q.y + 0.12 + r() * 0.01, z] });
    }
  // exhaust stacks
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const z = 2.55 - i * 0.14;
      const q = at(z);
      b.spike([s * (q.w * 0.95), q.y + 0.1, z], [s, 0.2, -0.5], 0.14, 0.03, { bone, color: C.ink });
    }

  // cockpit
  b.part(new THREE.BoxGeometry(0.7, 0.04, 1.2), C.deep, { bone, at: [0, 2.28, -0.3] });
  const canopy = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(canopy, C.glass, { bone, at: [0, 2.25, -0.25], scale: [0.36, 0.38, 0.85] });
  // canopy frame ribs
  for (const z of [0.4, 0.0, -0.4, -0.8]) {
    const k = Math.sqrt(Math.max(0, 1 - ((z + 0.25) / 0.85) ** 2));
    b.part(new THREE.TorusGeometry(1, 0.012, 4, 14, Math.PI), C.chalk, { bone, at: [0, 2.25, z], scale: [0.365 * k, 0.385 * k, 1], dir: [0, 0, 1], axis: "z" });
  }
  for (const s of [1, -1]) b.rod([s * 0.36, 2.25, -0.25 + 0.0], [s * 0.05, 2.62, -0.25], 0.0001, C.chalk, { bone });
  b.rod([0, 2.63, 0.55], [0, 2.63, -1.0], 0.012, C.chalk, { bone });
  // windscreen
  b.part(new THREE.BoxGeometry(0.5, 0.01, 0.3), C.glass, { bone, at: [0, 2.34, 0.62], rotation: [-35, 0, 0] });
  // headrest, seat, gunsight, stick
  b.part(new THREE.BoxGeometry(0.28, 0.3, 0.1), C.mid, { bone, at: [0, 2.05, -0.75] });
  b.part(new THREE.BoxGeometry(0.34, 0.06, 0.34), C.pale, { bone, at: [0, 1.95, -0.4] });
  b.part(new THREE.BoxGeometry(0.34, 0.3, 0.05), C.pale, { bone, at: [0, 2.1, -0.58] });
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 8), C.ink, { bone, at: [0, 2.33, 0.4] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), C.line, { bone, at: [0, 2.39, 0.4] });
  b.rod([0, 1.95, 0.1], [0, 2.15, 0.0], 0.012, C.chalk, { bone });

  // roundels: concentric rings each side
  for (const s of [1, -1]) {
    const q = at(-2.3);
    const dir: [number, number, number] = [s, 0, 0];
    [0.2, 0.14, 0.08].forEach((rad, i) => {
      b.part(new THREE.TorusGeometry(rad, 0.01, 4, 20), i == 1 ? C.line : C.chalk, { bone, at: [s * (q.w * 0.97), q.y, -2.3], dir, axis: "z" });
    });
    b.part(new THREE.CircleGeometry(0.035, 8), C.chalk, { bone, at: [s * (q.w * 0.99), q.y, -2.3], dir, axis: "z" });
  }
  // fin base fillet line and tail cap
  b.part(new THREE.SphereGeometry(0.06, 6, 4), C.chalk, { bone, at: [0, 1.78, -4.5] });
  // nose ring
  b.part(new THREE.TorusGeometry(0.23, 0.02, 5, 14), C.chalk, { bone, at: [0, 1.55, 2.98], dir: [0, 0, 1], axis: "z" });
  // chin intake
  b.part(new THREE.BoxGeometry(0.3, 0.14, 0.4), C.deep, { bone, at: [0, 1.15, 2.1] });
  return body;
}
    return buildFuselage;
  })(),
  // wings
  (() => {
type Ctx = { b: any; J: any; P: any; M: any };

function buildWings({ b, J, P, M }: Ctx) {
  const bone = J.fuselage;
  const R = rng(5);
  const TOP = P.midBlue, BOT = P.paleBlue, LINE = P.chalk, INK = P.inkBlue, DEEP = P.deepBlue, CY = P.cyanLine;
  const SPAN = 5.6;
  const rootX = 0.5, rootY = 1.35;
  const chordAt = (u: number) => 2.7 * Math.sqrt(Math.max(0.0, 1 - u * u * 0.97)) + 0.05; // u = 0..1 along span
  const ledge = (u: number) => 0.55 - 0.45 * u * u - 0.3 * u * 0.4; // leading edge z
  const yAt = (x: number) => rootY + (x - rootX) * 0.07;

  for (const s of [1, -1]) {
    // Wing planform drawn in (x along span, z). Built as stacked slabs: bottom + top skin.
    const N = 9;
    const lead: number[][] = [], trail: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = rootX + u * (SPAN - rootX);
      const c = chordAt(u);
      const zl = 0.95 + 0.0 - 0.55 * u * u;
      lead.push([x, zl]);
      trail.push([x, zl - c * (1 - 0.15 * u)]);
    }
    const outline: [number, number][] = [];
    for (const p of lead) outline.push([p[0] - rootX, p[1]]);
    for (let i = N; i >= 0; i--) outline.push([trail[i][0] - rootX, trail[i][1]]);
    const o = outline.map(([x, z]) => [x, z] as [number, number]);
    // extrude: outline x along span, y along model z. thickness runs along vertical.
    const mk = (y: number, th: number, col: string) =>
      b.extrude(o, {
        at: [s * rootX, y, 0],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: th,
        smoothing: 0,
        color: col,
        bone,
      });
    // dihedral by splitting into sections would be heavy; use tilted slab via panels
    const panels = 3;
    for (let k = 0; k < panels; k++) {
      const u0 = k / panels, u1 = (k + 1) / panels;
      const seg: [number, number][] = [];
      const a = Math.round(u0 * N), c2 = Math.round(u1 * N);
      for (let i = a; i <= c2; i++) seg.push([lead[i][0] - rootX - (lead[a][0] - rootX), lead[i][1]]);
      for (let i = c2; i >= a; i--) seg.push([trail[i][0] - rootX - (lead[a][0] - rootX), trail[i][1]]);
      const x0 = lead[a][0];
      const y0 = yAt(x0);
      const x1 = lead[c2][0];
      const slope = (yAt(x1) - y0) / (x1 - x0);
      b.extrude(seg, { at: [s * x0, y0 - 0.03, 0], x: [s, slope, 0], y: [0, 0, 1], thickness: 0.07, color: BOT, bone });
      b.extrude(seg, { at: [s * x0, y0 + 0.03, 0], x: [s, slope, 0], y: [0, 0, 1], thickness: 0.05, color: TOP, bone });
    }
    void mk;

    // Leading edge outline, trailing edge, tip outline
    const edgeL = lead.map((p) => [s * p[0], yAt(p[0]) + 0.065, p[1]]);
    const edgeT = trail.map((p) => [s * p[0], yAt(p[0]) + 0.065, p[1]]);
    b.sweep(edgeL, 0.014, { color: LINE, bone, caps: "round" });
    b.sweep(edgeT, 0.012, { color: LINE, bone, caps: "round" });
    // wingtip cap
    const tl = lead[N], tt = trail[N];
    b.rod([s * tl[0], yAt(tl[0]) + 0.02, tl[1]], [s * tt[0], yAt(tt[0]) + 0.02, tt[1]], 0.05, { color: DEEP, bone });
    b.sphere?.call;

    // Ribs
    for (let i = 1; i < N; i++) {
      const l = lead[i], t = trail[i];
      const zl = l[1] - 0.05, zt = t[1] + 0.05 + (i > 4 ? 0.05 : 0);
      const y = yAt(l[0]) + 0.062;
      b.rod([s * l[0], y, zl], [s * l[0], y, zt], 0.007, { color: LINE, bone });
    }
    // Spar lines (main spar at 30% chord, rear at 70%)
    for (const f of [0.3, 0.7]) {
      const pts = lead.map((p, i) => {
        const zz = p[1] + (trail[i][1] - p[1]) * f;
        return [s * p[0], yAt(p[0]) + 0.063, zz];
      });
      b.sweep(pts.slice(0, 9), 0.008, { color: CY, bone, caps: "round" });
    }
    // Aileron and flap hinge seams
    const hz = (i: number) => lead[i][1] + (trail[i][1] - lead[i][1]) * 0.8;
    b.sweep([2, 3, 4, 5, 6, 7].map((i) => [s * lead[i][0], yAt(lead[i][0]) + 0.064, hz(i)]), 0.009, { color: LINE, bone });
    b.sweep([0, 1, 2].map((i) => [s * lead[i][0], yAt(lead[i][0]) + 0.064, hz(i)]), 0.009, { color: CY, bone });
    // aileron-flap divider
    {
      const i = 2;
      b.rod([s * lead[i][0], yAt(lead[i][0]) + 0.064, hz(i)], [s * lead[i][0], yAt(lead[i][0]) + 0.064, trail[i][1] + 0.02], 0.008, { color: LINE, bone });
    }
    // Rivet rows along spar
    for (let i = 0; i < 18; i++) {
      const u = 0.06 + i * 0.05;
      const x = rootX + u * (SPAN - rootX);
      const zz = 0.95 - 0.55 * u * u - chordAt(u) * 0.3 * (1 - 0.15 * u);
      b.part(new THREE.SphereGeometry(0.018, 5, 4), CY, { bone, at: [s * x, yAt(x) + 0.062, zz] });
    }

    // Cannon barrels (3), poking from leading edge
    for (let k = 0; k < 3; k++) {
      const x = 2.0 + k * 0.45;
      const u = (x - rootX) / (SPAN - rootX);
      const zl = 0.95 - 0.55 * u * u;
      const y = yAt(x) + 0.0;
      const len = k === 0 ? 0.5 : 0.35;
      b.rod([s * x, y, zl - 0.2], [s * x, y, zl + len], 0.032, { color: INK, bone });
      b.rod([s * x, y, zl + len - 0.02], [s * x, y, zl + len + 0.05], 0.042, { color: LINE, bone });
    }

    // Roundel rings on top surface
    {
      const x = 3.2, y = yAt(x) + 0.062, z = -0.5;
      const rings: [number, number, string][] = [[0.42, 0.34, LINE], [0.3, 0.2, DEEP], [0.16, 0.0, LINE]];
      for (const [ro, ri, col] of rings) {
        const g = new THREE.RingGeometry(ri, ro, 24);
        b.part(g, col, { bone, at: [s * x, y + (ro < 0.2 ? 0.006 : 0.003), z], dir: [0, 1, 0], axis: "z" });
      }
    }

    // Radiator scoops underneath
    {
      const x = 2.2, y = yAt(x) - 0.28, z = 0.0;
      b.frustumBox([s * x, y, z + 0.5], [s * x, y, z - 0.5], [0.4, 0.28], [0.34, 0.3], { color: DEEP, bone });
      b.part(new THREE.BoxGeometry(0.3, 0.2, 0.03), INK, { bone, at: [s * x, y - 0.02, z + 0.52] });
      b.part(new THREE.BoxGeometry(0.4, 0.015, 0.8), LINE, { bone, at: [s * x, y - 0.15, z + 0.0] });
    }

    // Landing gear bay outline (underside)
    {
      const x0 = 1.4, y = yAt(x0) - 0.08;
      const bx = s * x0, hw = 0.3, z0 = 0.35, z1 = 1.0 - 0.0;
      const c: number[][] = [
        [bx - hw, y, z0], [bx + hw, y, z0], [bx + hw, y, z1 - 0.2], [bx - hw, y, z1 - 0.2],
      ];
      for (let i = 0; i < 4; i++) {
        const a = c[i], d = c[(i + 1) % 4];
        b.rod(a, d, 0.01, { color: LINE, bone });
      }
      b.part(new THREE.BoxGeometry(0.56, 0.01, 0.4), INK, { bone, at: [bx, y + 0.003, (z0 + z1 - 0.2) / 2] });
    }
    void R;
  }
  void frame; void M;
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const fus = J.fuselage;
  const tw = J.tailWheel;
  const R = rng(5);

  // Tail cone end section (fuselage tail taper), sweep along z
  const cone = b.loft(
    [
      { at: [0, 1.65, -3.2], w: 0.5, h: 0.62 },
      { at: [0, 1.72, -3.9], w: 0.3, h: 0.4 },
      { at: [0, 1.78, -4.45], w: 0.1, h: 0.14 },
    ],
    { bone: fus, color: P.prussian },
  );
  // end cap and lamp
  b.part(new THREE.SphereGeometry(0.06, 6, 4), P.chalk, { bone: fus, at: [0, 1.78, -4.52] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), P.cyanLine, { bone: fus, at: [0, 1.8, -4.58] });

  // station rings on the cone
  [-3.4, -3.75, -4.1].forEach((z, i) => {
    const w = [0.22, 0.16, 0.09][i];
    b.part(new THREE.TorusGeometry(w, 0.006, 4, 12), P.cyanLine, {
      bone: fus, at: [0, 1.7 + i * 0.04, z], rotation: [0, 0, 0],
    });
  });

  const outlineFin = (pts: number[][], bone: any, col: string) => {
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], c = pts[(i + 1) % pts.length];
      b.rod(a, c, 0.009, col, { bone });
    }
  };

  // Fin (profile in z,y), drawn with x along z
  const finPts: [number, number][] = [
    [0, 0], [0.75, 0], [0.55, 0.5], [0.3, 1.0], [0.1, 1.3], [-0.1, 1.35],
  ];
  // fin outline in (z-back, y): origin at base front
  const finOutline: [number, number][] = [
    [0.0, 0.0], [1.0, 0.0], [0.7, 0.9], [0.45, 1.45], [0.2, 1.5], [-0.05, 0.9],
  ];
  const finOrigin: [number, number, number] = [0, 1.8, -3.25];
  const fin = b.extrude(finOutline.map(([x, y]) => [x, y] as [number, number]), {
    at: finOrigin, x: [0, 0, -1], thickness: [0.07, 0.025], bevel: 0.01, color: P.midBlue, bone: fus,
  });
  // rudder (rear piece)
  const rudder = b.extrude(
    [[0, 0], [0.35, 0], [0.18, 0.9], [0.05, 1.3], [-0.05, 0.9]],
    { at: [0, 1.85, -4.22], x: [0, 0, -1], thickness: 0.05, bevel: 0.006, color: P.prussian, bone: fus },
  );
  // hinge line, ribs
  b.rod([0.045, 1.85, -4.22], [0.045, 3.2, -4.17], 0.008, P.chalk, { bone: fus });
  b.rod([-0.045, 1.85, -4.22], [-0.045, 3.2, -4.17], 0.008, P.chalk, { bone: fus });
  for (const s of [1, -1]) {
    for (let i = 1; i <= 4; i++) {
      const y = 1.85 + i * 0.28;
      b.rod([s * 0.03, y, -4.24 - 0.0 - (0.0)], [s * 0.03, y + 0.01, -4.55 + i * 0.07], 0.005, P.cyanLine, { bone: fus });
    }
    // fin outline stripe along leading edge
    b.rod([s * 0.04, 1.8, -3.25], [s * 0.03, 3.3, -3.7], 0.007, P.chalk, { bone: fus });
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.SphereGeometry(0.008, 4, 3), P.chalk, {
        bone: fus, at: [s * 0.04, 1.9 + i * 0.22, -3.35 - i * 0.07],
      });
    }
  }
  b.part(new THREE.SphereGeometry(0.03, 5, 4), P.chalk, { bone: fus, at: [0, 3.28, -3.98] });

  // tailplanes
  for (const s of [1, -1]) {
    const plan: [number, number][] = [
      [0, 0], [0.18, 0.7], [0.1, 1.3], [-0.08, 1.45], [-0.45, 1.3], [-0.65, 0.7], [-0.7, 0],
    ];
    // drawn: x outward, y forward-ish via (u,v) -> x:u?? use x outward, y=z forward
    const outline: [number, number][] = [
      [0, 0.35], [0.8, 0.25], [1.4, 0.05], [1.55, -0.15], [1.3, -0.4], [0.7, -0.55], [0, -0.6],
    ];
    b.extrude(outline, {
      at: [s * 0.1, 1.82, -4.0], x: [s, 0, 0], y: [0, 0, 1], thickness: [0.05, 0.02], bevel: 0.008,
      color: P.midBlue, bone: fus,
    });
    // elevator
    b.extrude(
      [[0.05, -0.28], [0.7, -0.35], [1.25, -0.28], [1.2, -0.4], [0.7, -0.55], [0.05, -0.6]],
      { at: [s * 0.1, 1.84, -4.0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.03, color: P.prussian, bone: fus },
    );
    b.rod([s * 0.1, 1.87, -4.28], [s * 1.35, 1.87, -4.3], 0.008, P.chalk, { bone: fus });
    b.rod([s * 0.1, 1.87, -3.65], [s * 1.55, 1.87, -3.85], 0.008, P.cyanLine, { bone: fus });
    b.rod([s * 1.55, 1.87, -4.15], [s * 1.3, 1.87, -4.4], 0.007, P.chalk, { bone: fus });
    for (let i = 1; i < 6; i++) {
      const x = s * (0.1 + i * 0.24);
      b.rod([x, 1.875, -3.7 - i * 0.03], [x, 1.875, -4.35 + i * 0.03], 0.005, P.cyanLine, { bone: fus });
    }
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.01, 4, 3), P.chalk, { bone: fus, at: [s * (0.3 + i * 0.2), 1.88, -4.1 - R() * 0.0] });
  }

  // tailwheel strut, fork, wheel
  b.rod([0, 1.7, -3.95], [0, 0.62, -4.0], 0.04, P.deepBlue, { bone: tw });
  b.rod([0, 1.3, -3.96], [0, 0.65, -4.0], 0.014, P.chalk, { bone: tw });

  for (const s of [1, -1]) b.rod([s * 0.06, 0.62, -4.0], [s * 0.06, 0.26, -4.0], 0.014, P.prussian, { bone: tw });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 10), P.rubber, { bone: tw, at: [0, 0.13, -4.0], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 8), P.chalk, { bone: tw, at: [0, 0.13, -4.0], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 6), P.deepBlue, { bone: tw, at: [0, 0.13, -4.0], rotation: [0, 0, 90] });
  // fairing
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.3), P.midBlue, { bone: fus, at: [0, 1.5, -3.95] });
}
    return buildTail;
  })(),
  // gear
  (() => {
function buildGear({ b, J, P, M }: Ctx) {
  const r = rng(5);
  const RUB = P.rubber, CH = P.chalk, DB = P.deepBlue, MB = P.midBlue, PB = P.paleBlue, INK = P.inkBlue;
  const R = 0.38; // wheel radius
  const W = 0.2; // tyre width
  const sides: [string, number][] = [["gearL", 1], ["gearR", -1]];

  for (const [name, s] of sides) {
    const bone = J[name];
    const top = new THREE.Vector3(s * 1.4, 1.25, 0.7);
    const splay = 0.12; // outward splay
    const hub = new THREE.Vector3(s * (1.4 + splay * 0.9), R, 0.7);
    const dir = hub.clone().sub(top).normalize();
    const along = (t: number) => top.clone().lerp(hub, t);

    // oleo strut: upper housing and lower piston
    b.rod(top, along(0.55), 0.06, DB, { bone, sides: 8 });
    b.rod(along(0.5), along(0.85), 0.04, CH, { bone, sides: 8 });
    // collar rings
    for (const t of [0.2, 0.52]) {
      b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), PB, { bone, at: along(t), dir });
    }
    // top attachment block
    b.part(new THREE.BoxGeometry(0.16, 0.1, 0.22), INK, { bone, at: top.clone().add(new THREE.Vector3(0, 0.03, 0)) });

    // fork: two prongs either side of wheel, along z-fixed x offsets
    const axle = hub.clone();
    for (const k of [-1, 1]) {
      const px = hub.x + k * (W / 2 + 0.035);
      b.rod(along(0.85), [px, hub.y, hub.z], 0.028, MB, { bone, sides: 6 });
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), CH, { bone, at: [px + k * 0.012, hub.y, hub.z], dir: [1, 0, 0] });
    }
    // axle
    b.rod([hub.x - 0.17, hub.y, hub.z], [hub.x + 0.17, hub.y, hub.z], 0.022, INK, { bone, sides: 6 });

    // scissor link: two arms with a pivot
    const a1 = along(0.3).add(new THREE.Vector3(0, 0, 0.07));
    const a2 = along(0.62).add(new THREE.Vector3(0, 0, 0.07));
    const piv = a1.clone().lerp(a2, 0.5).add(new THREE.Vector3(0, 0, 0.1));
    b.rod(a1, piv, 0.016, CH, { bone, sides: 6 });
    b.rod(piv, a2, 0.016, CH, { bone, sides: 6 });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), PB, { bone, at: piv });

    // tyre: torus lying on x axis
    const wheelDir: [number, number, number] = [1, 0, 0];
    b.part(new THREE.TorusGeometry(R - 0.1, 0.1, 8, 16), RUB, { bone, at: hub, dir: wheelDir, axis: "z" });
    // tyre sidewalls
    for (const k of [-1, 1]) {
      const at: [number, number, number] = [hub.x + k * (W / 2 - 0.01), hub.y, hub.z];
      b.part(new THREE.CylinderGeometry(R - 0.08, R - 0.08, 0.025, 16), DB, { bone, at, dir: wheelDir });
      // chalk hub ring
      b.part(new THREE.TorusGeometry(R - 0.17, 0.011, 4, 16), CH, { bone, at: [hub.x + k * (W / 2 + 0.005), hub.y, hub.z], dir: wheelDir, axis: "z" });
      // outer tyre outline ring
      b.part(new THREE.TorusGeometry(R - 0.02, 0.008, 4, 20), CH, { bone, at: [hub.x + k * (W / 2 - 0.03), hub.y, hub.z], dir: wheelDir, axis: "z" });
      // hub cap
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), MB, { bone, at: [hub.x + k * (W / 2 + 0.01), hub.y, hub.z], dir: wheelDir });
      // spokes
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const e: [number, number, number] = [hub.x + k * (W / 2 + 0.012), hub.y + Math.sin(a) * 0.17, hub.z + Math.cos(a) * 0.17];
        b.rod([hub.x + k * (W / 2 + 0.012), hub.y, hub.z], e, 0.008, CH, { bone, sides: 4 });
      }
      // rivet bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.012, 4, 3), CH, { bone, at: [hub.x + k * (W / 2 + 0.014), hub.y + Math.sin(a) * 0.1, hub.z + Math.cos(a) * 0.1] });
      }
    }
    // tread ticks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.1;
      const rr = R + 0.0;
      b.part(new THREE.BoxGeometry(W * 0.7, 0.012, 0.03), INK, {
        bone, at: [hub.x, hub.y + Math.sin(a) * rr, hub.z + Math.cos(a) * rr],
        dir: [0, Math.sin(a), Math.cos(a)], axis: "y",
      });
    }

    // gear door: thin panel hanging from leg, outline in chalk
    const dx = top.x + s * 0.28;
    const doorTop = new THREE.Vector3(dx, 1.2, 0.7);
    const doorBot = new THREE.Vector3(dx + s * 0.12, 0.62, 0.7);
    b.slab([
      [doorTop.x - 0.02 * s, doorTop.y, 0.45], [doorTop.x - 0.02 * s, doorTop.y, 0.95],
      [doorBot.x, doorBot.y, 0.92], [doorBot.x, doorBot.y, 0.48],
    ], { color: MB, thickness: 0.02, bone });
    const c: [number, number, number][] = [
      [doorTop.x + 0.012 * s, doorTop.y, 0.45], [doorTop.x + 0.012 * s, doorTop.y, 0.95],
      [doorBot.x + 0.012 * s, doorBot.y, 0.92], [doorBot.x + 0.012 * s, doorBot.y, 0.48],
    ];
    for (let i = 0; i < 4; i++) b.rod(c[i], c[(i + 1) % 4], 0.008, CH, { bone, sides: 4, caps: "none" });
    b.rod(c[0].map((v, i) => (v + c[3][i]) / 2) as number[], c[1].map((v, i) => (v + c[2][i]) / 2) as number[], 0.006, CH, { bone, sides: 4 });

    // chock: wedge in front of and behind wheel, resting on floor
    for (const zo of [0.46, -0.46]) {
      b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 3), PB, {
        bone, at: [hub.x, 0.07, hub.z + zo], dir: [1, 0, 0], rotation: [0, 0, 0],
      });
      b.part(new THREE.BoxGeometry(0.2, 0.012, 0.03), CH, { bone, at: [hub.x, 0.135, hub.z + zo] });
    }
    void r; void axle; void frame;
  }
}
    return buildGear;
  })(),
  // propNose
  (() => {
function buildPropNose({ b, J, P, M }: Ctx) {
  const hub = M.propHub;
  const prop = J.propeller;
  const fus = J.fuselage;
  const R = rng(5);

  // Spinner: lathe along +Z
  const spinnerPts: [number, number][] = [
    [0, 0], [0.26, 0], [0.25, 0.12], [0.2, 0.32], [0.11, 0.5], [0, 0.66],
  ];
  b.lathe(spinnerPts, {
    at: [hub[0], hub[1], hub[2] - 0.05], axis: [0, 0, 1], segments: 12,
    color: P.midBlue, bone: prop, name: "propNoseSpinner",
  });
  // Spiral chalk line on spinner
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const z = hub[2] + 0.05 + t * 0.5;
    const r = 0.26 * (1 - t * 0.9) * 0.9 + 0.012;
    const a = t * Math.PI * 2.2;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.chalk, {
      at: [hub[0] + Math.sin(a) * r, hub[1] + Math.cos(a) * r, z],
      bone: prop, name: "propNoseSpiral",
    });
  }

  // Hub ring of bolts
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.cyanLine, {
      at: [hub[0] + Math.sin(a) * 0.23, hub[1] + Math.cos(a) * 0.23, hub[2] - 0.01],
      dir: [0, 0, 1], bone: prop, name: "propNoseBolt",
    });
  }
  b.part(new THREE.TorusGeometry(0.27, 0.014, 5, 20), P.chalk, {
    at: [hub[0], hub[1], hub[2] - 0.03], axis: "z", dir: [0, 0, 1], bone: prop, name: "propNoseHubRing",
  });

  // Three blades
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const dx = Math.sin(a), dy = Math.cos(a);
    const outline: [number, number][] = [
      [-0.07, 0.2], [0.09, 0.2], [0.13, 0.7], [0.1, 1.2], [0.03, 1.5, ] as any, [-0.05, 1.5], [-0.1, 1.1], [-0.08, 0.6],
    ] as any;
    const base = [hub[0] + dx * 0.0, hub[1] + dy * 0.0, hub[2] - 0.02] as [number, number, number];
    // blade drawn: x across (tangent), y along radius
    const tangent: [number, number, number] = [dy, -dx, 0];
    const radial: [number, number, number] = [dx, dy, 0];
    const blade = b.extrude(outline, {
      at: base, x: tangent, y: radial, thickness: [0.035, 0.012],
      bevel: 0.006, smoothing: 1, color: P.paleBlue, bone: prop, name: "propNoseBlade",
    });
    // twist: tilt the blade mesh slightly about the radial axis
    blade.mesh.rotateOnAxis(new THREE.Vector3(...radial), 0.35);
    // tip stripe
    const tipPos: [number, number, number] = [hub[0] + dx * 1.38, hub[1] + dy * 1.38, hub[2] - 0.02];
    b.part(new THREE.BoxGeometry(0.2, 0.012, 0.05), P.chalk, {
      at: [tipPos[0], tipPos[1], tipPos[2] + 0.002], aim: radial, axis: "y", dir: radial, bone: prop,
      scale: [1, 1, 1], name: "propNoseTip",
    });
    // root outline
    b.part(new THREE.BoxGeometry(0.2, 0.012, 0.05), P.cyanLine, {
      at: [hub[0] + dx * 0.34, hub[1] + dy * 0.34, hub[2] - 0.02], dir: radial, bone: prop, name: "propNoseRoot",
    });
  }

  // Cowl front ring
  b.part(new THREE.TorusGeometry(0.42, 0.025, 5, 24), P.chalk, {
    at: [0, hub[1], hub[2] - 0.62], dir: [0, 0, 1], axis: "z", bone: fus, name: "propNoseCowlRing",
  });
  b.part(new THREE.TorusGeometry(0.36, 0.015, 5, 24), P.cyanLine, {
    at: [0, hub[1], hub[2] - 0.45], dir: [0, 0, 1], axis: "z", bone: fus, name: "propNoseCowlRing2",
  });

  // Exhaust nubs: six, three each side
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      b.spike([s * 0.4, 1.7 - i * 0.02, 2.5 - i * 0.2], [s, 0.2, 0], 0.14, 0.04, {
        color: P.inkBlue, bone: fus, name: "propNoseExhaust",
      });
    }

  // Oil cooler chin intake
  b.part(new THREE.BoxGeometry(0.4, 0.2, 0.5), P.deepBlue, { at: [0, 1.12, 3.1 - 0.4], bone: fus, name: "propNoseChin" });
  b.part(new THREE.BoxGeometry(0.3, 0.12, 0.02), P.inkBlue, { at: [0, 1.12, 3.0 - 0.14], bone: fus, name: "propNoseChinHole" });
  b.part(new THREE.TorusGeometry(0.17, 0.012, 4, 12), P.chalk, {
    at: [0, 1.12, 3.0 - 0.13], axis: "z", dir: [0, 0, 1], bone: fus, scale: [1, 0.6, 1], name: "propNoseChinRim",
  });

  // Dimension lines at floor level
  const dim = (a: [number, number, number], c: [number, number, number]) => {
    b.rod(a, c, 0.012, P.chalk, { bone: fus, name: "propNoseDim" });
    for (const p of [a, c]) {
      const d = a[0] !== c[0] ? [0, 0, 1] : [1, 0, 0];
      b.rod([p[0] - d[0] * 0.15, p[1], p[2] - d[2] * 0.15], [p[0] + d[0] * 0.15, p[1], p[2] + d[2] * 0.15], 0.012, P.chalk, { bone: fus, name: "propNoseTick" });
    }
  };
  dim([-1.45, 0.02, 3.8], [1.45, 0.02, 3.8]);
}
    return buildPropNose;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "spitfireBlueprint" });
  const J: Record<string, Joint> = {};
  J["fuselage"] = b.joint("fuselage", { at: [0,1.5,0], dir: [0,0,1], role: "spine" });
  J["propeller"] = b.joint("propeller", { parent: J["fuselage"], at: [0,1.55,3.6], dir: [0,0,1], role: "hinge", group: "prop" });
  J["gearL"] = b.joint("gearL", { parent: J["fuselage"], at: [1.4,1.2,0.7], dir: [0,-1,0], role: "leg", group: "gear" });
  J["gearR"] = b.joint("gearR", { parent: J["fuselage"], at: [-1.4,1.2,0.7], dir: [0,-1,0], role: "leg", group: "gear" });
  J["tailWheel"] = b.joint("tailWheel", { parent: J["fuselage"], at: [0,0.6,-4], dir: [0,-1,0], role: "leg", group: "gear" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
