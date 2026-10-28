import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull, bezier, spiral, offset, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Pandoran Glow-Spire",
  "description": "A 3.4 m bioluminescent alien plant in the Avatar/Pandora style: a mossy root mound, a twisting vein-lit stalk, a crown of arching teal fronds with glowing tips, curtains of drooping light-tendrils, and a glowing spore bloom."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  soil: "#161a26",
  mossDark: "#143536",
  moss: "#24634f",
  mossLight: "#3f9a6a",
  trunk: "#2a2748",
  trunkMid: "#3b3664",
  trunkLight: "#5a54a0",
  frond: "#1a5468",
  frondLight: "#2c8a98",
  frondDeep: "#12384f",
  glowCyan: "#2ff3e0",
  glowBlue: "#3aa0ff",
  glowMagenta: "#ee4bff",
  glowViolet: "#9b5cff",
  glowGreen: "#7dff9a",
  petal: "#b640d6",
  petalLight: "#e58bff",
  core: "#fff4b0",
  podShell: "#34306a",
};
const M = {
  groundCenter: [0, 0.4, 0] as [number, number, number],
  stalkBase: [0, 0.35, 0] as [number, number, number],
  stalkMid: [0, 1.35, 0] as [number, number, number],
  stalkTop: [0, 2.35, 0] as [number, number, number],
  branchL: [0.2, 1.25, 0.05] as [number, number, number],
  branchR: [-0.15, 1.6, -0.05] as [number, number, number],
  crownRingCenter: [0, 2.3, 0] as [number, number, number],
  crownRingRadius: [0, 0, 0] as [number, number, number],
  bloomCenter: [0, 2.5, 0] as [number, number, number],
  tendrilRingY: [0, 0, 0] as [number, number, number],
  tendrilRingRadius: [0, 0, 0] as [number, number, number],
  tendrilBottomY: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // rootMound
  (() => {
function buildRootMound({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const col = (k: string, d: string) => (P && (P as any)[k]) || d;
  const SOIL = col("soil", "#161a26"), MD = col("mossDark", "#143536"), MO = col("moss", "#24634f"), ML = col("mossLight", "#3f9a6a");
  const TR = col("trunk", "#2a2748"), TM = col("trunkMid", "#3b3664");
  const CY = col("glowCyan", "#2ff3e0"), BL = col("glowBlue", "#3aa0ff"), MG = col("glowMagenta", "#ee4bff"), GR = col("glowGreen", "#7dff9a");

  // Mound: faceted lathe in soil, with a darker moss cap on top
  b.lathe([[0, 0], [1.2, 0], [1.22, 0.05], [1.0, 0.22], [0.6, 0.36], [0.3, 0.42], [0, 0.43]],
    { at: [0, 0, 0], segments: 10, color: SOIL });
  b.lathe([[0, 0.2], [0.95, 0.2], [0.8, 0.3], [0.5, 0.39], [0.3, 0.435], [0, 0.445]],
    { at: [0, 0.0, 0], segments: 10, color: MD });

  // moss patches on upward faces
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28, r = 0.45 + R() * 0.6;
    const y = Math.max(0.1, 0.4 - r * 0.22);
    const s = 0.1 + R() * 0.12;
    b.part(new THREE.SphereGeometry(s, 6, 4), i % 2 ? MO : ML, {
      at: [Math.sin(a) * r, y, Math.cos(a) * r], scale: [1, 0.3, 1], });
  }

  // buttress roots
  const N = 7;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 6.283 + 0.2 * R();
    const dx = Math.sin(a), dz = Math.cos(a);
    const len = 0.9 + R() * 0.3;
    const pts: number[][] = [
      [dx * 0.2, 0.55, dz * 0.2],
      [dx * (0.2 + len * 0.35), 0.52, dz * (0.2 + len * 0.35)],
      [dx * (0.2 + len * 0.7), 0.3, dz * (0.2 + len * 0.7)],
      [dx * (0.2 + len), 0.04, dz * (0.2 + len)],
    ];
    b.sweep(pts, [0.15, 0.03], { color: i % 2 ? TM : TR, section: { ngon: 6 } });
    const top = pts.map((p) => [p[0], p[1] + 0.1 - (p === pts[3] ? 0.06 : 0), p[2]]);
    glow(b.sweep(top, 0.012, { color: CY, caps: "round" }), 1.2);
  }

  // mushrooms
  const caps = [GR, CY, BL, MG];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 6.283 + R() * 0.3;
    const r = 0.55 + R() * 0.6;
    const h = 0.05 + R() * 0.09;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const y = Math.max(0.05, 0.4 - r * 0.2);
    b.part(new THREE.CylinderGeometry(h * 0.12, h * 0.16, h, 5), TM, { at: [x, y + h / 2 - 0.02, z] });
    const c = i % 5 === 4 ? MG : caps[i % 3];
    const cap = b.lathe([[0, 0], [h * 0.55, 0], [h * 0.5, h * 0.25], [h * 0.25, h * 0.45], [0, h * 0.5]],
      { at: [x, y + h - 0.02, z], segments: 7, color: c });
    glow(cap, 1.3);
  }

  // moss tufts
  for (let i = 0; i < 7; i++) {
    const a = R() * 6.283, r = 0.4 + R() * 0.7;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    const y = Math.max(0.1, 0.4 - r * 0.2);
    for (let k = 0; k < 4; k++) {
      const ka = (k / 4) * 6.283;
      b.part(new THREE.ConeGeometry(0.02, 0.1 + R() * 0.05, 4), k % 2 ? ML : MO, {
        at: [x + Math.sin(ka) * 0.03, y + 0.04, z + Math.cos(ka) * 0.03],
        rotation: [Math.cos(ka) * 15, 0, -Math.sin(ka) * 15],
      });
    }
  }

  // rocks
  b.part(new THREE.IcosahedronGeometry(0.14, 0), SOIL, { at: [0.85, 0.1, -0.7], scale: [1, 0.7, 1.2], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.1, 0), TR, { at: [-0.7, 0.2, 0.8], scale: [1.2, 0.7, 1], flat: true });
}
    return buildRootMound;
  })(),
  // stalk
  (() => {
function buildStalk({ b, P, M }: any) {
  const R = rng(11);
  const spine = catmull([[0, 0.35, 0], [0.08, 1.0, 0.05], [-0.06, 1.7, -0.04], [0, 2.35, 0]]);
  const rad = (t: number) => 0.32 - 0.2 * t;
  const trunk = b.sweep(spine, rad, {
    section: { ngon: 8 },
    color: P.trunk,
    caps: "flat",
    sectors: [[-50, 50, P.trunkMid], [130, 230, P.trunkMid]],
  });

  // helical ridges and glowing veins
  const helix = (turns: number, ph: number, lift: number, from = 0.04, to = 0.96) => {
    const pts: number[][] = [];
    const n = 44;
    for (let i = 0; i <= n; i++) {
      const t = from + (to - from) * (i / n);
      const c = spine.at(t);
      const a = ph + turns * Math.PI * 2 * t;
      const r = rad(t) * 1.0 + lift;
      pts.push([c.x + Math.sin(a) * r, c.y, c.z + Math.cos(a) * r]);
    }
    return pts;
  };
  [0, 2.1, 4.2].forEach((ph) => {
    b.sweep(catmull(helix(1.5, ph, 0.012)), 0.02, { color: P.trunkLight, sides: 5, caps: "round" });
  });
  [[0.8, P.glowCyan], [3.9, P.glowBlue]].forEach(([ph, col]: any) => {
    const pts = helix(1.5, ph, 0.018);
    b.sweep(catmull(pts), 0.011, { color: col, sides: 5 });
    const path = catmull(pts);
    const k = Math.floor(path.length / 0.18);
    for (let i = 1; i < k; i++) {
      const p = path.at(i / k);
      glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), col, { at: p }), 1.3);
    }
  });

  // node rings
  [0.12, 0.28, 0.46, 0.62, 0.8, 0.94].forEach((t) => {
    const c = spine.at(t);
    const r = rad(t);
    b.part(new THREE.TorusGeometry(r + 0.01, 0.035, 5, 8), P.trunkLight, {
      at: c, rotation: [90, 0, 0], flat: true,
    });
  });

  // branches
  const pod = (tip: any, col: string, i: number) => {
    b.part(new THREE.IcosahedronGeometry(0.1, 1), P.podShell, { at: tip, flat: true });
    glow(b.part(new THREE.SphereGeometry(0.07, 8, 6), col, { at: tip }), 1.6);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + i;
      const p = [tip[0] + Math.cos(a) * 0.12, tip[1] - 0.04 + 0.03 * (k % 2), tip[2] + Math.sin(a) * 0.12];
      b.rod(tip, p, 0.012, P.podShell);
      glow(b.part(new THREE.SphereGeometry(0.028, 6, 4), k % 2 ? P.glowCyan : P.glowGreen, { at: p }), 1.4);
    }
    const c = spiral([tip[0], tip[1] + 0.1, tip[2]], [tip[0] + 0.05, tip[1] + 0.1, tip[2]], [0, 1, 0], { turns: 1.5, r1: 0.01, pitch: 0.03 });
    b.sweep(c, [0.008, 0.003], { color: P.glowViolet, sides: 4 });
  };
  const bl = [[0.2, 1.25, 0.05], [0.4, 1.4, 0.1], [0.6, 1.65, 0.12], [0.72, 1.85, 0.12]];
  b.sweep(catmull(bl), [0.09, 0.04], { color: P.trunkMid, sides: 6 });
  pod(bl[3], P.glowMagenta, 0);
  const br = [[-0.15, 1.6, -0.05], [-0.3, 1.7, -0.15], [-0.48, 1.85, -0.3], [-0.6, 1.95, -0.42]];
  b.sweep(catmull(br), [0.085, 0.035], { color: P.trunkMid, sides: 6 });
  pod(br[3], P.glowViolet, 2);

  // leaf stubs
  const leaf: any = [[0, 0], [0.05, 0.06], [0.06, 0.13], [0, 0.2, "sharp"], [-0.06, 0.13], [-0.05, 0.06]];
  for (let i = 0; i < 4; i++) {
    const t = 0.1 + i * 0.07;
    const c = spine.at(t);
    const a = i * 1.7 + 0.5;
    const d = [Math.sin(a), 0.7, Math.cos(a)];
    const r = rad(t);
    const base = [c.x + d[0] * r * 0.9, c.y, c.z + d[2] * r * 0.9];
    const x = [-d[2], 0, d[0]];
    const l = b.extrude(leaf, { at: base, x, y: d, thickness: 0.012, smoothing: 1, color: i % 2 ? P.frondLight : P.frond });
    const tip = [base[0] + d[0] * 0.2, base[1] + d[1] * 0.2, base[2] + d[2] * 0.2];
    glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), P.glowGreen, { at: tip }), 1.2);
    b.rod(base, tip, 0.006, P.glowGreen);
  }

  // collar
  b.lathe(
    [[0, 0], [0.13, 0], [0.15, 0.06], [0.22, 0.14], [0.23, 0.17], [0.18, 0.15], [0.1, 0.08], [0, 0.08]],
    { at: [0, 2.3, 0], color: P.trunkLight, segments: 8, smoothing: 0 },
  );
  glow(b.part(new THREE.TorusGeometry(0.21, 0.012, 4, 16), P.glowCyan, { at: [0, 2.46, 0], rotation: [90, 0, 0] }), 1.2);
}
    return buildStalk;
  })(),
  // frondCrown
  (() => {
function buildFrondCrown({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const C = M.crownRingCenter;
  const RING = 0.2;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const frond = (az: number, elev: number, reach: number, width: number, tier: number, big: boolean) => {
    const a = (az * Math.PI) / 180;
    const e = (elev * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const baseP = V(C[0] + dx * RING, C[1] + 0.02, C[2] + dz * RING);
    // arching midrib, built as points in radial/height coordinates
    const N = 7;
    const pts: THREE.Vector3[] = [];
    let rr = 0;
    let hh = 0;
    const seg = reach / N;
    for (let i = 0; i <= N; i++) {
      pts.push(V(baseP.x + dx * rr, baseP.y + hh, baseP.z + dz * rr));
      const t = i / N;
      const ang = e - t * (tier === 0 ? 0.85 : 0.6);
      rr += Math.cos(ang) * seg;
      hh += Math.sin(ang) * seg;
    }
    b.sweep(pts, [0.035, 0.004], { color: P.frondLight, sides: 6, caps: "point" });

    const side = V(dz, 0, -dx); // sideways direction
    const rim: THREE.Vector3[][] = [[], []];
    const half = (t: number) => width * 0.5 * Math.sin(Math.PI * Math.pow(t, 0.75)) * (0.15 + 0.85 * Math.min(1, t * 2.2)) * (1 - 0.2 * t);
    const glowEdge = big ? P.glowMagenta : P.glowCyan;
    // blade as slab segments between midrib stations
    const S = 6;
    const edgeAt = (t: number, s: number) => {
      const f = t * N;
      const i = Math.min(N - 1, Math.floor(f));
      const p = pts[i].clone().lerp(pts[i + 1], f - i);
      const lift = Math.abs(s) * 0.08 * (1 - t) ;
      return p.addScaledVector(side, s * half(t)).add(V(0, lift, 0));
    };
    for (let k = 0; k < S; k++) {
      const t0 = 0.06 + (k / S) * 0.92;
      const t1 = 0.06 + ((k + 1) / S) * 0.92;
      const col = k % 2 ? P.frond : P.frondDeep;
      for (const s of [1, -1]) {
        b.slab([pts[0].clone().lerp(pts[N], t0), edgeAt(t0, s), edgeAt(t1, s), pts[0].clone().lerp(pts[N], t1)].map((p, idx) => (idx === 0 || idx === 3 ? midAt(p, t0, t1, idx) : p)), {
          color: col,
          thickness: 0.012,
          bone: J ? undefined : undefined,
        });
      }
    }
    function midAt(_p: THREE.Vector3, t0: number, t1: number, idx: number) {
      const t = idx === 0 ? t0 : t1;
      const f = t * N;
      const i = Math.min(N - 1, Math.floor(f));
      return pts[i].clone().lerp(pts[i + 1], f - i);
    }
    // glowing veins
    const veins = 5 + (big ? 2 : 0);
    for (let v = 0; v < veins; v++) {
      const s = -0.8 + (1.6 * v) / (veins - 1);
      const vp: THREE.Vector3[] = [];
      for (let k = 0; k <= 6; k++) {
        const t = 0.08 + (k / 6) * 0.84;
        vp.push(edgeAt(t, s * Math.min(1, 0.25 + t * 0.9)).add(V(0, 0.012, 0)));
      }
      glow(b.sweep(vp, [0.007, 0.003], { color: P.glowCyan, sides: 4, caps: "none" }), 1.2);
    }
    // rim edges
    for (const s of [1, -1]) {
      const ep: THREE.Vector3[] = [];
      for (let k = 0; k <= 12; k++) ep.push(edgeAt(0.1 + (k / 12) * 0.88, s * 0.98).add(V(0, 0.012, 0)));
      glow(b.sweep(ep, 0.009, { color: glowEdge, sides: 4, caps: "none" }), 1.4);
      // scallop teardrops
      for (let k = 1; k < 8; k++) {
        const t = 0.15 + (k / 8) * 0.75;
        const p = edgeAt(t, s * 1.02);
        b.part(new THREE.SphereGeometry(0.03 + 0.012 * (1 - t), 6, 4), k % 2 ? P.frondLight : P.frond, {
          at: p,
          scale: [1, 0.5, 1.4],
        });
      }
    }
    // tip bead
    const tipC = big ? P.glowMagenta : tier === 0 ? P.glowBlue : P.glowGreen;
    glow(b.part(new THREE.SphereGeometry(0.045, 8, 6), tipC, { at: pts[N] }), 2);
    if (big) {
      for (let k = 0; k < 3; k++)
        glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.glowMagenta, { at: edgeAt(0.8 + k * 0.06, 0.55 * (k % 2 ? 1 : -1)).add(V(0, 0.02, 0)) }), 1.5);
    }
    // root bead at the collar
    b.part(new THREE.SphereGeometry(0.05, 6, 5), P.trunkLight, { at: baseP });
  };

  for (let i = 0; i < 5; i++) frond(i * 72, 35, i === 0 ? 1.45 : 1.3, i === 0 ? 0.62 : 0.5, 0, i === 0);
  for (let k = 0; k < 4; k++) frond(36 + 90 * k, 65, 0.95, 0.38, 1, false);

  // small glow buds at the collar between fronds
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.2;
    glow(
      b.part(new THREE.SphereGeometry(0.025, 6, 4), i % 2 ? P.glowViolet : P.glowGreen, {
        at: [C[0] + Math.sin(a) * 0.3, C[1] + 0.04, C[2] + Math.cos(a) * 0.3],
      }),
      1.3,
    );
  }
}
    return buildFrondCrown;
  })(),
  // lightTendrils
  (() => {
function buildLightTendrils({ b, P, M }: any) {
  const R = rng(77);
  const ringY = 2.3;
  const ringR = 0.25;
  const bottomMin = 0.7;
  const bulbCols = [P.glowCyan, P.glowMagenta, P.glowViolet];
  const beadCols = [P.glowCyan, P.glowBlue];
  const sph = (r: number) => new THREE.SphereGeometry(r, 6, 4);
  let bulbIdx = 0;

  const tendril = (
    start: number[],
    outDir: [number, number],
    bottom: number,
    curl: boolean,
    big: boolean,
  ) => {
    const arch = 0.1 + R() * 0.2;
    const drop = start[1] - bottom;
    const sx = start[0], sz = start[2];
    const pts: number[][] = [
      [sx, sy(start), sz],
      [sx + outDir[0] * arch * 0.6, start[1] + 0.06, sz + outDir[1] * arch * 0.6],
      [sx + outDir[0] * arch, start[1] - drop * 0.25, sz + outDir[1] * arch],
      [sx + outDir[0] * arch * 1.2, start[1] - drop * 0.6, sz + outDir[1] * arch * 1.2],
      [sx + outDir[0] * arch * 0.9, bottom, sz + outDir[1] * arch * 0.9],
    ];
    function sy(s: number[]) { return s[1]; }
    let path: any = catmull(pts);
    const end = pts[pts.length - 1];
    let tip = end;
    b.sweep(path, [0.022, 0.008], { color: P.trunkMid, sides: 6, caps: "round" });
    if (curl) {
      const c = spiral(
        [end[0], end[1] - 0.03, end[2] + 0.0],
        [end[0] + 0.05, end[1] - 0.03, end[2]],
        [0, 0, 1],
        { turns: 1.2, r1: 0.015, pitch: 0 },
      );
      b.sweep(c, [0.008, 0.005], { color: P.trunkMid, sides: 5 });
      tip = c.at(1).toArray ? c.at(1).toArray() : end;
    }
    const n = Math.max(3, Math.floor(drop / 0.12));
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1);
      const p = path.at(t);
      const r = 0.012 + 0.008 * t;
      glow(b.part(sph(r), beadCols[i % 2], { at: [p.x, p.y, p.z], bone: undefined }), 1 + t);
    }
    const col = bulbCols[bulbIdx++ % 3];
    const br = big ? 0.065 : 0.045;
    glow(b.part(new THREE.IcosahedronGeometry(br, 1), col, { at: [tip[0], tip[1] - br * 0.6, tip[2]] }), 1.6);
    if (big) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        glow(
          b.part(sph(0.014), "#e8ffff", {
            at: [tip[0] + Math.cos(a) * 0.1, tip[1] - br * 0.6, tip[2] + Math.sin(a) * 0.1],
          }),
          1.3,
        );
      }
    }
  };

  const N = 26;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (R() - 0.5) * 0.15;
    const front = (Math.cos(a - Math.PI / 2) + 1) / 2; // +Z side longer
    const bottom = bottomMin + 0.1 + R() * 0.5 + front * 0.35;
    const ry = ringR + (R() - 0.5) * 0.06;
    tendril(
      [Math.sin(a) * ry, ringY, Math.cos(a) * ry],
      [Math.sin(a), Math.cos(a)],
      Math.min(bottom, 1.8),
      i % 4 === 0,
      i % 3 === 0,
    );
  }

  const branches: [number[], number][] = [
    [M.branchL, 1],
    [M.branchR, -1],
  ];
  for (const [m, s] of branches) {
    const bx = m[0] + s * 0.45;
    const bz = m[2] + (s > 0 ? 0.05 : -0.25);
    for (let k = 0; k < 3; k++) {
      const dx = s * (0.5 + k * 0.5), dz = (k - 1) * 0.5;
      const l = Math.hypot(dx, dz);
      tendril(
        [bx + (k - 1) * 0.05, m[1] + 0.2, bz + (k - 1) * 0.05],
        [dx / l, dz / l],
        1.0 + R() * 0.3 + k * 0.05,
        k === 1,
        k === 0,
      );
    }
  }
}
    return buildLightTendrils;
  })(),
  // sporeBloom
  (() => {
function buildSporeBloom({ b, P, M }: Ctx) {
  const C = M.bloomCenter;
  const r = rng(77);
  const cx = C[0], cy = C[1], cz = C[2];
  const G = (g: THREE.BufferGeometry, col: string, at: number[], s = 1, o: any = {}) =>
    glow(b.part(g, col, { at, ...o }), s);
  const sphere = (rad: number, seg = 8) => new THREE.SphereGeometry(rad, seg, Math.max(3, seg - 3));

  // core and halo
  G(new THREE.IcosahedronGeometry(0.11, 1), P.core, [cx, cy + 0.08, cz], 2);
  G(sphere(0.17, 10), P.glowCyan, [cx, cy + 0.08, cz], 0.6, {});
  G(sphere(0.23, 10), P.glowGreen, [cx, cy + 0.08, cz], 0.35, {});

  // petal rings: [count, length, openDeg, color, rim, phase]
  const rings: [number, number, number, string, string, number][] = [
    [8, 0.2, 35, P.petalLight, P.glowViolet, 0],
    [8, 0.28, 55, P.petal, P.glowMagenta, 0.5],
    [6, 0.34, 70, P.petal, P.glowMagenta, 0.2],
  ];
  rings.forEach(([n, len, open, col, rim, ph], ri) => {
    const w = len * 0.42;
    const outline: [number, number, string?][] = [
      [0, 0], [w * 0.5, len * 0.25], [w * 0.5, len * 0.65], [0, len, "sharp"], [-w * 0.5, len * 0.65], [-w * 0.5, len * 0.25],
    ].map((p) => p as any);
    for (let i = 0; i < n; i++) {
      const a = ((i + ph) / n) * Math.PI * 2;
      const dx = Math.sin(a), dz = Math.cos(a);
      const el = (90 - open) * Math.PI / 180; // elevation from horizontal
      const dir = new THREE.Vector3(dx * Math.cos(el), Math.sin(el), dz * Math.cos(el)).normalize();
      const base = [cx + dx * 0.07, cy + 0.02 + ri * 0.015, cz + dz * 0.07];
      const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      b.extrude(outline as any, { at: base, x: side.toArray() as number[], y: dir.toArray() as number[], thickness: 0.012, bevel: 0.004, smoothing: 1, color: col });
      const tip = [base[0] + dir.x * len, base[1] + dir.y * len, base[2] + dir.z * len];
      const mid = [base[0] + dir.x * len * 0.5, base[1] + dir.y * len * 0.5, base[2] + dir.z * len * 0.5];
      glow(b.rod(mid, tip, 0.005, rim, { caps: "round" }), 1.2);
      G(sphere(0.014 + ri * 0.003, 6), rim, tip, 1.4);
    }
  });

  // stamens
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r() * 0.3;
    const h = 0.4 + r() * 0.2;
    const sp = 0.05 + r() * 0.12;
    const tip = [cx + Math.sin(a) * sp, cy + 0.1 + h, cz + Math.cos(a) * sp];
    const mid = [cx + Math.sin(a) * sp * 0.4, cy + 0.1 + h * 0.5, cz + Math.cos(a) * sp * 0.4];
    b.sweep([[cx, cy + 0.12, cz], mid, tip], [0.006, 0.003], { color: P.glowGreen, caps: "round" });
    G(sphere(0.02, 6), i % 2 ? P.glowCyan : P.core, tip, 1.5);
  }

  // spore motes
  const cols = [P.glowCyan, P.glowGreen, P.glowViolet, P.core];
  for (let i = 0; i < 38; i++) {
    const rad = Math.sqrt(r()) * 0.85;
    const a = r() * Math.PI * 2;
    const y = 2.7 + r() * 0.7;
    G(sphere(0.012 + r() * 0.018, 5), cols[i % 4], [Math.sin(a) * rad, y, Math.cos(a) * rad], 1.2);
  }

  // seedling puffs
  const puffs = [[0.3, 3.2, 0.15], [-0.25, 3.3, -0.2], [0.05, 3.15, -0.4]];
  puffs.forEach((p, k) => {
    G(sphere(0.025, 6), k % 2 ? P.glowMagenta : P.core, p, 1.6);
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2;
      const d = [Math.cos(a), Math.sin(a * 2) * 0.5, Math.sin(a)];
      glow(b.spike(p, d, 0.07, 0.006, { color: P.glowCyan }), 1.2);
    }
  });
}
    return buildSporeBloom;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "pandoranGlowSpire" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
