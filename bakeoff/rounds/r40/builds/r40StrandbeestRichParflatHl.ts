import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Strandbeest Windwalker",
  "description": "A Theo Jansen-style kinetic beach creature: a yellow PVC-tube skeleton with eight Jansen-linkage legs, a rack of pressure bottles for lungs, a tube-and-sail rig on its back, and a sniffing snout with a hinged jaw."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  tubeYellow: "#f2c91e",
  tubeYellowDark: "#c79a0e",
  tubeYellowLight: "#ffe266",
  sleeveBlack: "#1d1d24",
  cableTie: "#ece8da",
  bolt: "#8b909a",
  boltDark: "#4f535c",
  rubberFoot: "#2b2b31",
  sandDust: "#d9c48f",
  wetSand: "#8a7650",
  bottleBlue: "#9bd7ea",
  bottleBlueDark: "#5aa7c4",
  capRed: "#d9432f",
  sailWhite: "#f5f1e4",
  sailSeam: "#cfc7ab",
  sailPatch: "#e8a33a",
  tapeTeal: "#2a9d9a",
  rope: "#b89a5a",
  eyeGlow: "#ffb43a",
  eyeWhite: "#fffaf0",
  pupil: "#1a1a20",
  mouthInside: "#7a2a2a",
};
const M = {
  crankAxis: [0, 1, 0] as [number, number, number],
  frameFront: [0, 1.2, 1.2] as [number, number, number],
  frameRear: [0, 1.15, -1.9] as [number, number, number],
  rackBase: [0, 1.35, 0.4] as [number, number, number],
  mastBase: [0, 1.35, -1] as [number, number, number],
  neckBase: [0, 1.2, 1.2] as [number, number, number],
  snoutTip: [0, 1.45, 2.2] as [number, number, number],
  tailBase: [0, 1.15, -1.9] as [number, number, number],
  hipL1: [0.95, 1, 1.2] as [number, number, number],
  hipL2: [1.12, 1, 0.4] as [number, number, number],
  hipL3: [0.95, 1, -0.4] as [number, number, number],
  hipL4: [1.12, 1, -1.2] as [number, number, number],
  hipR1: [-0.95, 1, 1.2] as [number, number, number],
  hipR2: [-1.12, 1, 0.4] as [number, number, number],
  hipR3: [-0.95, 1, -0.4] as [number, number, number],
  hipR4: [-1.12, 1, -1.2] as [number, number, number],
  floorLine: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // frame
  (() => {
function buildFrame({ b, J, P, M }: any) {
  const body = J.body;
  const crank = J.crank;
  const R = rng(5);
  const Y = P.tubeYellow, YD = P.tubeYellowDark, YL = P.tubeYellowLight;

  const tube = (a: number[], c: number[], r: number, col: string, bone: any = body) =>
    b.rod(a, c, r, col, { bone, sides: 8 });
  const ball = (p: number[], r: number, col: string, bone: any = body) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at: p });
  const box = (p: number[], s: number[], col: string, bone: any = body) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: p });

  const zA = -1.9, zB = 1.2;
  const railY = 0.85, ridgeY = 1.3;

  // rails and ridge
  for (const s of [1, -1]) {
    tube([s * 0.5, railY, zA], [s * 0.5, railY, zB], 0.035, Y);
    for (const z of [zA, zB]) {
      b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8), YD, {
        bone: body, at: [s * 0.5, railY, z + (z === zA ? 0.03 : -0.03)], dir: [0, 0, 1],
      });
    }
  }
  tube([0, ridgeY, zA], [0, ridgeY, zB], 0.035, Y);
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8), YD, { bone: body, at: [0, ridgeY, zA + 0.03], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8), YD, { bone: body, at: [0, ridgeY, zB - 0.03], dir: [0, 0, 1] });

  // bottom cross tube and V braces every 0.4
  for (let i = 0; i <= 8; i++) {
    const z = zA + i * 0.4 + 0.0;
    if (z > zB + 0.01) break;
    tube([-0.5, railY, z], [0.5, railY, z], 0.025, Y);
    for (const s of [1, -1]) {
      tube([s * 0.5, railY, z], [0, ridgeY, z + 0.2], 0.022, Y);
      tube([s * 0.5, railY, z + 0.4], [0, ridgeY, z + 0.2], 0.022, Y);
      ball([s * 0.5, railY, z], 0.05, YD);
      box([s * 0.5, railY + 0.05, z], [0.035, 0.035, 0.035], P.sleeveBlack);
    }
    ball([0, ridgeY, z + 0.2], 0.05, YD);
    box([0.0, ridgeY + 0.05, z + 0.2], [0.03, 0.03, 0.05], P.sleeveBlack);
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6), P.bolt, { bone: body, at: [0, ridgeY, z + 0.2], dir: [1, 0, 0] });
  }

  // sand stains on lower rails
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = -1.6 + i * 0.6 + R() * 0.2;
      box([s * 0.5, railY - 0.03, z], [0.08, 0.02, 0.22], P.sandDust);
    }

  // teal tape band mid-body
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.1, 8), P.tapeTeal, { bone: body, at: [0, ridgeY, -0.3], dir: [0, 0, 1] });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), P.tapeTeal, { bone: body, at: [s * 0.5, railY, -0.3], dir: [0, 0, 1] });

  // rope loop over ridge
  const rp = [[0.08, 1.2, 0.0], [0.07, 1.36, 0.0], [-0.07, 1.36, 0.0], [-0.08, 1.2, 0.0]];
  for (let i = 0; i < 3; i++) tube(rp[i], rp[i + 1], 0.012, P.rope);
  tube([0.08, 1.2, 0], [0.5, 0.88, 0], 0.01, P.rope);
  tube([-0.08, 1.2, 0], [-0.5, 0.88, 0], 0.01, P.rope);

  // crankshaft
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 2.4, 10), P.boltDark, { bone: crank, at: [0, 1, 0], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), P.bolt, { bone: crank, at: [s * 1.2, 1, 0], dir: [1, 0, 0] });
    // bearing blocks + struts to rails
    box([s * 0.5, 0.93, 0], [0.12, 0.2, 0.14], P.boltDark);
    tube([s * 0.5, railY, 0], [s * 0.5, 0.97, 0], 0.03, YD);
  }
  box([0, 1.0, 0], [0.1, 0.16, 0.14], P.boltDark);
  tube([0, ridgeY, 0], [0, 1.06, 0], 0.03, YD);

  // crank discs and pins at 8 lanes
  const lanes: [number, number, number][] = [
    [0.95, 1.2, 0], [1.12, 0.4, 1], [0.95, -0.4, 2], [1.12, -1.2, 3],
    [-0.95, 1.2, 4], [-1.12, 0.4, 5], [-0.95, -0.4, 6], [-1.12, -1.2, 7],
  ];
  for (const [x, z, k] of lanes) {
    const s = Math.sign(x);
    const ang = (k * Math.PI) / 4 + (s < 0 ? Math.PI : 0);
    const cy = 1 + Math.cos(ang) * 0.0, cz = z;
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), YL, { bone: crank, at: [x, 1, 0], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 6), P.bolt, {
      bone: crank, at: [x, 1 + Math.cos(ang) * 0.07, Math.sin(ang) * 0.07], dir: [1, 0, 0],
    });
    // hip pin at lane mount
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), P.bolt, { bone: body, at: [x, 1.0, z], dir: [1, 0, 0] });
    ball([x, 1.0, z], 0.04, YD);
    void cy; void cz;
  }
  // lane support tubes from rail to hip mounts
  for (const [x, z] of lanes) {
    const s = Math.sign(x);
    tube([s * 0.5, railY, z], [x, 1.0, z], 0.02, YD);
  }

  // front/rear mounts
  ball(M.frameFront, 0.06, YD);
  ball(M.frameRear, 0.06, YD);
  ball([0, ridgeY, 0.4], 0.05, YD);
  ball([0, ridgeY, -1.0], 0.05, YD);
}
    return buildFrame;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const tube = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 8 });
  const ball = (p: number[], r: number, col: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, bone });
  const peg = (p: number[], x: number, bone: any) => {
    b.rod([p[0] - 0.12 * x * 0 - 0.06, p[1], p[2]], [p[0] + 0.14, p[1], p[2]], 0.012, P.bolt, { bone, sides: 6 });
  };
  const tie = (p: number[], bone: any) =>
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.03), P.sleeveBlack, { at: p, bone });

  const legs: [string, number, number][] = [
    ["L1", 1, 1.2], ["L2", 1, 0.4], ["L3", 1, -0.4], ["L4", 1, -1.2],
    ["R1", -1, 1.2], ["R2", -1, 0.4], ["R3", -1, -0.4], ["R4", -1, -1.2],
  ];
  for (const [id, s] of legs) {
    const hip = J["hip" + id], knee = J["knee" + id], foot = J["foot" + id];
    const h = [hip.at.x, hip.at.y, hip.at.z];
    const k = [knee.at.x, knee.at.y, knee.at.z];
    const f = [foot.at.x, foot.at.y, foot.at.z];
    const o = 0.07 * s;
    const off = (p: number[], d: number) => [p[0] + d, p[1], p[2]];
    for (const d of [0, o]) {
      tube(off(h, d), off(k, d), 0.032, P.tubeYellow, hip);
      tube(off(k, d), off(f, d), 0.032, P.tubeYellow, knee);
    }
    // cross pegs and sleeves
    for (const [p, bone] of [[h, hip], [k, knee]] as any[]) {
      b.rod([p[0] - 0.02 * s, p[1], p[2]], [p[0] + o + 0.02 * s, p[1], p[2]], 0.045, P.tubeYellowDark, { bone, sides: 8 });
      b.rod([p[0] - 0.05 * s, p[1], p[2]], [p[0] + o + 0.09 * s, p[1], p[2]], 0.014, P.bolt, { bone, sides: 6 });
      tie([p[0] + o / 2, p[1] + 0.05, p[2]], bone);
    }
    // upper triangle brace: hip to point on thigh
    const tp = [k[0] + (h[0] - k[0]) * 0.3, k[1] + (h[1] - k[1]) * 0.3 - 0.0, k[2] + (h[2] - k[2]) * 0.3];
    const tp2 = [h[0], h[1] - 0.12, h[2] + (k[2] > h[2] ? -0.3 : 0.3)];
    tube(off(h, o / 2), off(tp2, o / 2), 0.015, P.tubeYellowLight, hip);
    tube(off(tp2, o / 2), off(tp, o / 2), 0.015, P.tubeYellowLight, hip);
    // strut parallel to shin
    const sa = [k[0] + (f[0] - k[0]) * 0.2, k[1] + (f[1] - k[1]) * 0.2, k[2] + (f[2] - k[2]) * 0.2];
    const sb = [k[0] + (f[0] - k[0]) * 0.75, k[1] + (f[1] - k[1]) * 0.75, k[2] + (f[2] - k[2]) * 0.75];
    const dz = 0.06 * (k[2] > h[2] ? 1 : -1);
    tube(off([sa[0], sa[1], sa[2] + dz], o / 2), off([sb[0], sb[1], sb[2] + dz], o / 2), 0.016, P.tubeYellowLight, knee);
    // mid-shin sleeve
    const ms = [(k[0] + f[0]) / 2, (k[1] + f[1]) / 2, (k[2] + f[2]) / 2];
    b.rod(off(ms, -0.02 * s), off(ms, o + 0.02 * s), 0.042, P.tubeYellowDark, { bone: knee, sides: 8 });
    tie([ms[0] + o / 2, ms[1] + 0.06, ms[2]], knee);
    // shin end sand smear
    const sm = [k[0] + (f[0] - k[0]) * 0.88, k[1] + (f[1] - k[1]) * 0.88, k[2] + (f[2] - k[2]) * 0.88];
    b.rod(off(sm, 0), off(sm, o), 0.037, P.sandDust, { bone: knee, sides: 8 });
    // foot pad: rounded toe, bottom at y=0
    const fz = f[2];
    const padC = [f[0] + o / 2, 0.04, fz + 0.03];
    const pad = b.part(new THREE.BoxGeometry(0.2, 0.08, 0.28), P.rubberFoot, { at: padC, bone: foot });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), P.rubberFoot, {
      at: [padC[0], 0.04, fz + 0.17], bone: foot, rotation: [0, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.205, 0.015, 0.2), P.wetSand, { at: [padC[0], 0.085, fz], bone: foot });
    b.rod(off([f[0], 0.075, fz], -0.02 * s), off([f[0], 0.075, fz], o + 0.02 * s), 0.04, P.tubeYellowDark, { bone: foot, sides: 8 });
    ball([f[0] + o / 2, 0.02, fz + 0.2], 0.01 + R() * 0.005, P.sandDust, foot);
  }
}
    return buildLegs;
  })(),
  // lungs
  (() => {
function buildLungs({ b, J, P }: any) {
  const bone = J.body;
  const R = rng(5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const rod = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { bone });

  // base frame: two long rails + cross rails at y=1.38
  for (const s of [1, -1]) {
    rod([s * 0.7, 1.38, -0.28], [s * 0.7, 1.38, 1.12], 0.025, P.tubeYellow);
    rod([s * 0.7, 1.9, -0.28], [s * 0.7, 1.9, 1.12], 0.02, P.tubeYellow);
    for (const z of [-0.28, 1.12]) part(new THREE.SphereGeometry(0.04, 6, 5), P.tubeYellowDark, [s * 0.7, 1.38, z]);
  }
  const rows = [-0.28, 0.1, 0.5, 0.9, 1.12];
  for (const z of rows) {
    rod([-0.7, 1.38, z], [0.7, 1.38, z], 0.022, P.tubeYellow);
    part(new THREE.BoxGeometry(0.05, 0.04, 0.04), P.sleeveBlack, [0.7, 1.4, z]);
    part(new THREE.BoxGeometry(0.05, 0.04, 0.04), P.sleeveBlack, [-0.7, 1.4, z]);
  }
  // ring rack at y≈1.85
  for (const z of [0.0, 0.5, 1.0]) rod([-0.7, 1.85, z], [0.7, 1.85, z], 0.018, P.tubeYellow);
  // bottles
  const pos: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const z = -0.2 + i * 0.3;
    pos.push([0.4, z], [-0.4, z + 0.12]);
  }
  pos.length = 11;
  const caps: number[][] = [];
  pos.forEach(([x, z], i) => {
    const y0 = 1.4;
    part(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 8), P.bottleBlue, [x, y0 + 0.19, z]);
    part(new THREE.CylinderGeometry(0.083, 0.083, 0.04, 8), P.bottleBlueDark, [x, y0 + 0.04, z]);
    part(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 8), P.sandDust, [x, y0 + 0.012, z]);
    part(new THREE.CylinderGeometry(0.03, 0.08, 0.1, 8), P.bottleBlue, [x, y0 + 0.43, z]);
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 8), P.bottleBlue, [x, y0 + 0.5, z]);
    part(new THREE.CylinderGeometry(0.036, 0.036, 0.04, 8), P.capRed, [x, y0 + 0.57, z]);
    part(new THREE.BoxGeometry(0.02, 0.3, 0.012), P.bottleBlueDark, [x + (x > 0 ? -0.07 : 0.07) * 0.0, y0 + 0.2, z + 0.08]);
    part(new THREE.BoxGeometry(0.015, 0.28, 0.01), "#d6f1fa", [x + 0.04, y0 + 0.2, z + 0.074]);
    if (i % 3 === 0) part(new THREE.CylinderGeometry(0.084, 0.084, 0.07, 8), P.tapeTeal, [x, y0 + 0.2, z]);
    if (i === 4) part(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 8), P.sailPatch, [x, y0 + 0.3, z]);
    caps.push([x, y0 + 0.6, z]);
    // cable tie on ring rack
    part(new THREE.BoxGeometry(0.04, 0.03, 0.03), P.sleeveBlack, [x, 1.85, z]);
    part(new THREE.TorusGeometry(0.09, 0.012, 5, 10), P.tubeYellow, [x, 1.85, z], { rotation: [90, 0, 0] });
  });
  // manifold at y≈2.0
  for (const s of [1, -1]) {
    rod([s * 0.4, 2.0, -0.2], [s * 0.4, 2.0, 1.1], 0.014, P.tubeYellowDark);
    rod([s * 0.4, 2.0, 0.45], [0, 2.0, 0.45], 0.014, P.tubeYellowDark);
    part(new THREE.SphereGeometry(0.025, 6, 5), P.tubeYellowDark, [s * 0.4, 2.0, 0.45]);
  }
  caps.forEach(([x, y, z]) => rod([x, y, z], [x, 1.99, z], 0.008, P.tubeYellowDark));
  // valve block
  part(new THREE.BoxGeometry(0.12, 0.08, 0.1), P.boltDark, [0, 2.0, 0.45]);
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), P.bolt, [0, 2.07, 0.45]);
  part(new THREE.SphereGeometry(0.03, 6, 5), P.bolt, [0, 2.11, 0.45]);
  rod([0, 1.96, 0.45], [0, 1.4, 0.45], 0.012, P.tubeYellowDark);
  // hoses between bottles
  for (let i = 0; i + 2 < pos.length; i += 2)
    rod([caps[i][0], 1.93, caps[i][2]], [caps[i + 2][0], 1.93, caps[i + 2][2]], 0.007, P.tubeYellowDark);
  // pumps
  for (const s of [1, -1]) {
    rod([s * 0.74, 1.45, 0.3], [s * 0.64, 1.8, 0.3], 0.03, P.tubeYellowDark);
    rod([s * 0.64, 1.8, 0.3], [s * 0.56, 2.05, 0.3], 0.011, P.bolt);
    part(new THREE.SphereGeometry(0.02, 6, 5), P.bolt, [s * 0.56, 2.06, 0.3]);
  }
  // rope tie
  part(new THREE.TorusGeometry(0.4, 0.012, 5, 16), P.rope, [0, 1.68, 0.5], { rotation: [90, 0, 0], scale: [1.1, 1, 0.5] });
  void R;
}
    return buildLungs;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const Y = P.tubeYellow, YD = P.tubeYellowDark, BK = P.sleeveBlack;
  const tube = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 8 });
  const ball = (p: number[], r: number, col: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, bone });
  const box = (p: number[], s: number[], col: string, bone: any) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at: p, bone });
  const cyl = (p: number[], r: number, h: number, col: string, bone: any, dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 12), col, { at: p, bone, dir });

  // neck
  const n0 = [0, 1.2, 1.2], n1 = [0, 1.35, 1.5], n2 = [0, 1.45, 1.75];
  tube(n0, n1, 0.05, Y, J.neck1);
  tube(n1, n2, 0.045, Y, J.neck2);
  ball(n1, 0.07, YD, J.neck2);
  ball(n0, 0.065, YD, J.neck1);
  for (const [a, c, bone] of [[n0, n1, J.neck1], [n1, n2, J.neck2]] as any[]) {
    const m = [(a[0] * 2 + c[0]) / 3, (a[1] * 2 + c[1]) / 3 + 0.0, (a[2] * 2 + c[2]) / 3];
    cyl(m, 0.06, 0.07, YD, bone, [0, 0.3, 1]);
    box([0.055, m[1] + 0.03, m[2]], [0.02, 0.03, 0.03], BK, bone);
    box([-0.055, m[1] + 0.03, m[2]], [0.02, 0.03, 0.03], BK, bone);
  }
  ball([0.05, 1.37, 1.5], 0.018, P.bolt, J.neck2);
  b.rod([0, 1.26, 1.22], [0, 1.52, 1.76], 0.01, P.rope, { bone: J.neck1, sides: 5 });

  // skull frame 
  const H = J.head;
  const x = 0.2;
  const corners: number[][] = [];
  for (const sx of [1, -1]) for (const y of [1.4, 1.72]) for (const z of [1.75, 2.0]) corners.push([sx * x, y, z]);
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    let d = 0;
    for (let k = 0; k < 3; k++) if (corners[i][k] !== corners[j][k]) d++;
    if (d === 1) tube(corners[i], corners[j], 0.025, Y, H);
  }
  for (const c of corners) ball(c, 0.037, YD, H);
  for (const s of [1, -1]) {
    box([s * 0.2, 1.56, 1.875], [0.012, 0.28, 0.22], P.sailWhite, H);
    box([s * 0.2, 1.56, 1.875], [0.016, 0.03, 0.2], P.sailSeam, H);
  }
  box([0, 1.73, 1.875], [0.4, 0.012, 0.25], P.sailWhite, H);
  // snout
  const sn = [[-0.14, 1.48], [0.14, 1.48], [0.14, 1.64], [-0.14, 1.64]];
  tube([0.14, 1.64, 2.0], [0.07, 1.55, 2.2], 0.025, Y, H);
  tube([-0.14, 1.64, 2.0], [-0.07, 1.55, 2.2], 0.025, Y, H);
  tube([0.12, 1.45, 2.0], [0.07, 1.45, 2.2], 0.025, Y, H);
  tube([-0.12, 1.45, 2.0], [-0.07, 1.45, 2.2], 0.025, Y, H);
  void sn;
  box([0, 1.55, 2.12], [0.2, 0.2, 0.05], Y, H);
  cyl([0, 1.5, 2.2], 0.1, 0.05, YD, H, [0, 0, 1]);
  for (const s of [1, -1]) {
    cyl([s * 0.04, 1.55, 2.24], 0.018, 0.06, BK, H, [0, 0, 1]);
    // eyes
    const e = [s * 0.2, 1.62, 1.9];
    cyl([e[0] + s * 0.02, e[1], e[2]], 0.09, 0.04, P.capRed, H, [1, 0, 0]);
    cyl([e[0] + s * 0.045, e[1], e[2]], 0.07, 0.03, P.eyeWhite, H, [1, 0, 0]);
    cyl([e[0] + s * 0.065, e[1], e[2]], 0.045, 0.02, P.eyeGlow, H, [1, 0, 0]);
    cyl([e[0] + s * 0.08, e[1], e[2] + 0.005], 0.02, 0.02, P.pupil, H, [1, 0, 0]);
    tube([s * 0.12, 1.74, 1.95], [s * 0.15, 1.95 - 0.05, 2.08], 0.012, Y, H);
    ball([s * 0.15, 1.9, 2.08], 0.02, P.capRed, H);
    box([s * 0.23, 1.54, 1.76], [0.03, 0.03, 0.03], BK, H);
  }
  tube([-0.2, 1.62, 1.9], [0.2, 1.62, 1.9], 0.012, P.bolt, H);
  // teeth upper
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5), P.cableTie, { at: [s * (0.04 + i * 0.025 - 0.02), 1.43, 2.0 + i * 0.03], bone: H, dir: [0, -1, 0] });

  // jaw
  const Jw = J.jaw;
  tube([0.14, 1.34, 1.85], [0.1, 1.3, 2.15], 0.022, Y, Jw);
  tube([-0.14, 1.34, 1.85], [-0.1, 1.3, 2.15], 0.022, Y, Jw);
  tube([0.1, 1.3, 2.15], [-0.1, 1.3, 2.15], 0.022, Y, Jw);
  tube([0.14, 1.34, 1.85], [-0.14, 1.34, 1.85], 0.022, Y, Jw);
  box([0, 1.325, 2.0], [0.2, 0.012, 0.28], P.mouthInside, Jw);
  for (let i = 0; i < 4; i++) for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.013, 0.045, 5), P.cableTie, { at: [s * 0.1, 1.35, 1.92 + i * 0.07], bone: Jw, dir: [0, 1, 0] });
  for (const s of [1, -1]) {
    cyl([s * 0.25, 1.36, 1.85], 0.03, 0.05, BK, Jw, [1, 0, 0]);
    ball([s * 0.28, 1.36, 1.85], 0.016, P.bolt, Jw);
  }
  b.pose(Jw, { axis: [1, 0, 0], deg: 12 });
}
    return buildHead;
  })(),
  // sailsTail
  (() => {
function buildSailsTail({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const tube = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const ball = (p: number[], r: number, col: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at: p, bone });
  const box = (p: number[], s: number[], col: string, bone: any) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at: p, bone });

  // Mast
  const mb = M.mastBase;
  tube(mb, [0, 2.4, mb[2]], 0.04, P.tubeYellow, J.mast);
  tube([0, 1.75, mb[2]], [0, 1.9, mb[2]], 0.058, P.tubeYellowDark, J.mast);
  ball([0, 2.43, mb[2]], 0.06, P.tubeYellowDark, J.mast);
  ball([0, 2.43, mb[2]], 0.035, P.capRed, J.mast);
  tube([0, 2.25, -1], [0, 1.2, -1.6], 0.008, P.rope, J.mast);
  tube([0, 2.25, -1], [0, 1.2, -0.4], 0.008, P.rope, J.mast);
  tube([0, 2.25, -1], [0.5, 1.2, -1.6], 0.006, P.rope, J.mast);
  tube([0, 2.25, -1], [-0.5, 1.2, -1.6], 0.006, P.rope, J.mast);
  for (const z of [-1.6, -0.4]) ball([0, 1.2, z], 0.03, P.boltDark, J.mast);

  // Wings
  for (const s of [1, -1]) {
    const w1 = s > 0 ? J.wingL1 : J.wingR1;
    const w2 = s > 0 ? J.wingL2 : J.wingR2;
    const root = [s * 0.1, 2.0, -1];
    const mid = [s * 0.7, 2.2, -1];
    const tip = [s * 1.3, 2.2, -1.0];
    const back1 = [s * 0.1, 1.55, -1.45];
    const back2 = [s * 0.75, 1.5, -1.55];
    const back3 = [s * 1.3, 1.5, -1.4];
    tube(root, mid, 0.03, P.tubeYellow, w1);
    tube(mid, tip, 0.028, P.tubeYellow, w2);
    tube(back1, back2, 0.022, P.tubeYellow, w1);
    tube(back2, back3, 0.022, P.tubeYellow, w2);
    tube(tip, back3, 0.022, P.tubeYellow, w2);
    tube(root, back1, 0.022, P.tubeYellow, w1);
    const lerp = (a: number[], c: number[], t: number) => a.map((v, i) => v + (c[i] - v) * t);
    // sail panels (two quads as slabs)
    b.slab([root, mid, back2, back1], { color: P.sailWhite, thickness: 0.01, bone: w1 });
    b.slab([mid, tip, back3, back2], { color: P.sailWhite, thickness: 0.01, bone: w2 });
    // scalloped trailing bumps
    for (let i = 0; i < 4; i++) {
      const p = lerp(back1, back3, (i + 0.5) / 4);
      ball([p[0], p[1] - 0.02, p[2] - 0.01], 0.07, P.sailWhite, i < 2 ? w1 : w2);
    }
    // battens
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const top = lerp(root, tip, t);
      const bot = lerp(back1, back3, t);
      const bn = i < 3 ? w1 : w2;
      tube(top, bot, 0.016, P.tubeYellowLight, bn);
      const sm = b.rod(lerp(top, bot, 0.02), lerp(top, bot, 0.98), 0.008, P.sailSeam, { bone: bn });
      ball(top, 0.028, P.tubeYellowDark, bn);
      box(lerp(top, bot, 0.5), [0.03, 0.03, 0.03], P.sleeveBlack, bn);
      ball(lerp(top, bot, 0.8), 0.015, P.bolt, bn);
    }
    // corner loops
    for (const c of [tip, back3, back1]) {
      b.part(new THREE.TorusGeometry(0.035, 0.007, 5, 8), P.cableTie, { at: c, bone: w2 });
    }
    // patches
    const pc = lerp(lerp(root, mid, 0.5), lerp(back1, back2, 0.5), 0.45);
    box([pc[0], pc[1], pc[2] - 0.012], [0.22, 0.15, 0.006], P.sailPatch, w1);
    const tc = lerp(lerp(mid, tip, 0.5), lerp(back2, back3, 0.5), 0.6);
    box([tc[0], tc[1], tc[2] - 0.012], [0.3, 0.05, 0.006], P.tapeTeal, w2);
    ball(mid, 0.04, P.tubeYellowDark, w2);
    ball(root, 0.045, P.tubeYellowDark, w1);
  }

  // Tail
  const pts = [
    [0, 1.15, -1.9],
    [0, 1.25, -2.05],
    [0, 1.33, -2.13],
    [0, 1.42, -2.18],
  ];
  const tb = [J.tail1, J.tail2, J.tail3];
  const rad = [0.04, 0.032, 0.024];
  for (let i = 0; i < 3; i++) {
    tube(pts[i], pts[i + 1], rad[i], P.tubeYellow, tb[i]);
    ball(pts[i], rad[i] * 1.5, P.tubeYellowDark, tb[i]);
    box([0, pts[i][1] + 0.03, (pts[i][2] + pts[i + 1][2]) / 2], [0.03, 0.03, 0.03], P.sleeveBlack, tb[i]);
  }
  tube(pts[3], [0, 1.52, -2.18], 0.01, P.rope, J.tail3);
  b.slab([[0, 1.52, -2.18], [0, 1.64, -2.19], [0, 1.58, -2.0]], {
    color: P.capRed,
    thickness: 0.012,
    bone: J.tail3,
  });
  ball([0, 1.42, -2.18], 0.03, P.bolt, J.tail3);
}
    return buildSailsTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "strandbeestWindwalker" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.1,0], dir: [0,0,1], role: "spine" });
  J["crank"] = b.joint("crank", { parent: J["body"], at: [0,1,0], dir: [1,0,0], role: "hinge", group: "legs" });
  J["hipL1"] = b.joint("hipL1", { parent: J["body"], at: [0.95,1,1.2], dir: [0,-0.74,0.67], role: "leg", group: "legs" });
  J["kneeL1"] = b.joint("kneeL1", { parent: J["hipL1"], at: [0.95,0.5,1.65], dir: [0,-0.67,-0.74], role: "leg", group: "legs" });
  J["footL1"] = b.joint("footL1", { parent: J["kneeL1"], at: [0.95,0.05,1.15], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipL2"] = b.joint("hipL2", { parent: J["body"], at: [1.12,1,0.4], dir: [0,-0.78,-0.62], role: "leg", group: "legs" });
  J["kneeL2"] = b.joint("kneeL2", { parent: J["hipL2"], at: [1.12,0.5,0], dir: [0,-0.79,0.61], role: "leg", group: "legs" });
  J["footL2"] = b.joint("footL2", { parent: J["kneeL2"], at: [1.12,0.05,0.35], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipL3"] = b.joint("hipL3", { parent: J["body"], at: [0.95,1,-0.4], dir: [0,-0.78,0.62], role: "leg", group: "legs" });
  J["kneeL3"] = b.joint("kneeL3", { parent: J["hipL3"], at: [0.95,0.5,0], dir: [0,-0.79,-0.61], role: "leg", group: "legs" });
  J["footL3"] = b.joint("footL3", { parent: J["kneeL3"], at: [0.95,0.05,-0.45], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipL4"] = b.joint("hipL4", { parent: J["body"], at: [1.12,1,-1.2], dir: [0,-0.74,-0.67], role: "leg", group: "legs" });
  J["kneeL4"] = b.joint("kneeL4", { parent: J["hipL4"], at: [1.12,0.5,-1.65], dir: [0,-0.75,0.66], role: "leg", group: "legs" });
  J["footL4"] = b.joint("footL4", { parent: J["kneeL4"], at: [1.12,0.05,-1.25], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipR1"] = b.joint("hipR1", { parent: J["body"], at: [-0.95,1,1.2], dir: [0,-0.74,-0.67], role: "leg", group: "legs" });
  J["kneeR1"] = b.joint("kneeR1", { parent: J["hipR1"], at: [-0.95,0.5,0.75], dir: [0,-0.67,0.74], role: "leg", group: "legs" });
  J["footR1"] = b.joint("footR1", { parent: J["kneeR1"], at: [-0.95,0.05,1.25], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipR2"] = b.joint("hipR2", { parent: J["body"], at: [-1.12,1,0.4], dir: [0,-0.78,0.62], role: "leg", group: "legs" });
  J["kneeR2"] = b.joint("kneeR2", { parent: J["hipR2"], at: [-1.12,0.5,0.8], dir: [0,-0.79,-0.61], role: "leg", group: "legs" });
  J["footR2"] = b.joint("footR2", { parent: J["kneeR2"], at: [-1.12,0.05,0.45], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipR3"] = b.joint("hipR3", { parent: J["body"], at: [-0.95,1,-0.4], dir: [0,-0.78,-0.62], role: "leg", group: "legs" });
  J["kneeR3"] = b.joint("kneeR3", { parent: J["hipR3"], at: [-0.95,0.5,-0.8], dir: [0,-0.7,0.71], role: "leg", group: "legs" });
  J["footR3"] = b.joint("footR3", { parent: J["kneeR3"], at: [-0.95,0.05,-0.35], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipR4"] = b.joint("hipR4", { parent: J["body"], at: [-1.12,1,-1.2], dir: [0,-0.74,0.67], role: "leg", group: "legs" });
  J["kneeR4"] = b.joint("kneeR4", { parent: J["hipR4"], at: [-1.12,0.5,-0.75], dir: [0,-0.75,-0.66], role: "leg", group: "legs" });
  J["footR4"] = b.joint("footR4", { parent: J["kneeR4"], at: [-1.12,0.05,-1.15], dir: [0,-1,0], role: "leg", group: "legs" });
  J["neck1"] = b.joint("neck1", { parent: J["body"], at: [0,1.2,1.2], dir: [0,0.45,1], role: "neck", group: "head" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.35,1.5], dir: [0,0.3,1], role: "neck", group: "head" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.45,1.75], dir: [0,0,1], role: "head", group: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.35,1.85], dir: [0,0,1], role: "jaw", group: "head" });
  J["mast"] = b.joint("mast", { parent: J["body"], at: [0,1.35,-1], dir: [0,1,0], role: "hinge", group: "sails" });
  J["wingL1"] = b.joint("wingL1", { parent: J["mast"], at: [0.1,2,-1], dir: [1,0.3,0], role: "wing", group: "sails" });
  J["wingL2"] = b.joint("wingL2", { parent: J["wingL1"], at: [0.7,2.2,-1], dir: [1,0.1,0], role: "wing", group: "sails" });
  J["wingR1"] = b.joint("wingR1", { parent: J["mast"], at: [-0.1,2,-1], dir: [-1,0.3,0], role: "wing", group: "sails" });
  J["wingR2"] = b.joint("wingR2", { parent: J["wingR1"], at: [-0.7,2.2,-1], dir: [-1,0.1,0], role: "wing", group: "sails" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,1.15,-1.9], dir: [0,0.15,-1], role: "tail", group: "sails" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.25,-2.2], dir: [0,0.2,-1], role: "tail", group: "sails" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.35,-2.4], dir: [0,0.2,-1], role: "tail", group: "sails" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
