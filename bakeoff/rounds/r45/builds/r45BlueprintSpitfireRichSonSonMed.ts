import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, polyline, frame, aim, rng } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Spitfire Blueprint",
  "description": "A Supermarine Spitfire Mk I at real size, built as a cyanotype blueprint: every surface is a flat Prussian blue, and panel seams, rivets, ribs and roundels are drawn on in white and pale cyan line-work."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skinTop: "#1b5aa8",
  skinMid: "#14468a",
  skinUnder: "#0d3270",
  skinDeep: "#071f4a",
  inkNavy: "#04132e",
  lineWhite: "#f0f8ff",
  lineCyan: "#8fd0f5",
  lineFaint: "#4f95d6",
  glass: "#a9def8",
  steel: "#3b7fc9",
  steelLight: "#7fb8ea",
  spinner: "#d4ecfc",
  navGlow: "#bff4ff",
};
const M = {
  propHub: [0, 1.85, 3.55] as [number, number, number],
  spinnerTip: [0, 1.85, 4.15] as [number, number, number],
  cowlFront: [0, 1.85, 3.45] as [number, number, number],
  cowlRear: [0, 1.85, 1.9] as [number, number, number],
  windscreenBase: [0, 2.4, 1.25] as [number, number, number],
  canopyApex: [0, 2.62, -0.1] as [number, number, number],
  canopyRear: [0, 2.3, -1.35] as [number, number, number],
  cockpitSeat: [0, 1.75, -0.35] as [number, number, number],
  fuselageMid: [0, 1.82, -0.9] as [number, number, number],
  fuselageTail: [0, 1.52, -4.6] as [number, number, number],
  wingRootL: [0, 1.25, -0.3] as [number, number, number],
  wingRootR: [0, 1.25, -0.3] as [number, number, number],
  wingTipL: [5.62, 1.8, 0.2] as [number, number, number],
  wingTipR: [-5.62, 1.8, 0.2] as [number, number, number],
  aileronHingeInL: [2.9, 1.53, -0.62] as [number, number, number],
  aileronHingeInR: [-2.9, 1.53, -0.62] as [number, number, number],
  radiatorL: [2.4, 1, -0.15] as [number, number, number],
  radiatorR: [-2.4, 1, -0.15] as [number, number, number],
  legTopL: [1, 1.2, 0.35] as [number, number, number],
  legTopR: [-1, 1.2, 0.35] as [number, number, number],
  axleL: [1.12, 0.34, 0.4] as [number, number, number],
  axleR: [-1.12, 0.34, 0.4] as [number, number, number],
  tailplaneRootL: [0.15, 1.62, -4.1] as [number, number, number],
  tailplaneRootR: [-0.15, 1.62, -4.1] as [number, number, number],
  elevatorHingeL: [0.15, 1.62, -4.5] as [number, number, number],
  elevatorHingeR: [-0.15, 1.62, -4.5] as [number, number, number],
  finBase: [0, 1.75, -3.9] as [number, number, number],
  rudderHingeBase: [0, 1.75, -4.55] as [number, number, number],
  rudderTop: [0, 3, -4.8] as [number, number, number],
  tailStrutTop: [0, 1.38, -3.95] as [number, number, number],
  tailWheelAxle: [0, 0.14, -4.02] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // nose
  (() => {
function buildNose({ b, J, P, M }: any) {
  const AX = 1.85;
  const D2R = Math.PI / 180;

  // ---------- Cowl ----------
  const st: [number, number, number][] = [
    [3.45, 0.4, 0.4],
    [2.9, 0.45, 0.46],
    [2.2, 0.47, 0.5],
    [1.9, 0.46, 0.48],
  ];
  const cowl = b.loft(
    st.map(([z, hw, hh]) => ({ at: [0, AX, z], w: hw * 2, h: hh * 2 })),
    {
      bone: J.body,
      color: P.skinMid,
      sides: 16,
      caps: "none",
      sectors: [[-85, 85, P.skinTop]],
    },
  );
  const skin = b.surface(cowl);

  // point on the cowl at station z, angle (deg from top, + toward +X), lifted along the normal
  const onCowl = (z: number, adeg: number, lift = 0.003): number[] => {
    const a = adeg * D2R;
    const out = [Math.sin(a), Math.cos(a), 0];
    const o = [out[0], AX + out[1], z];
    const hit = skin.ray([o[0] + out[0], o[1] + out[1], z], [-out[0], -out[1], 0]);
    if (!hit) return [out[0] * 0.4, AX + out[1] * 0.4, z];
    return [hit.at.x + hit.n.x * lift, hit.at.y + hit.n.y * lift, hit.at.z + hit.n.z * lift];
  };

  const line = (path: any, color: string, r = 0.003) =>
    b.sweep(path, r, { color, bone: J.body, sides: 4 });

  const rivets: THREE.BufferGeometry[] = [];
  const rivet = (p: number[]) => rivets.push(new THREE.SphereGeometry(0.005, 5, 3).translate(p[0], p[1], p[2]));

  // front opening
  b.part(new THREE.CylinderGeometry(0.385, 0.385, 0.02, 20), P.skinDeep, {
    bone: J.body, at: [0, AX, 3.445], dir: [0, 0, 1],
  });
  b.part(new THREE.TorusGeometry(0.39, 0.012, 5, 24), P.lineCyan, { bone: J.body, at: [0, AX, 3.455] });
  b.part(new THREE.TorusGeometry(0.34, 0.008, 4, 20), P.lineWhite, { bone: J.body, at: [0, AX, 3.452] });

  // ring seams with rivets
  for (const z of [3.1, 2.6, 2.2]) {
    const pts: number[][] = [];
    for (let i = 0; i < 28; i++) pts.push(onCowl(z, (i * 360) / 28, 0.003));
    line(catmull(pts, { closed: true }), P.lineWhite);
    pts.forEach((p, i) => {
      if (i % 1 === 0) rivet(p);
    });
  }

  // side horizontal seams
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (let i = 0; i <= 12; i++) pts.push(onCowl(3.3 - (i * 1.38) / 12, s * 90, 0.003));
    line(catmull(pts), P.lineWhite);
    pts.forEach((p, i) => {
      if (i % 1 === 0) rivet(p);
    });
  }

  // hatch outlines
  const rectPts = (z0: number, z1: number, a0: number, a1: number) => {
    const pts: number[][] = [];
    const n = 4;
    for (let i = 0; i < n; i++) pts.push(onCowl(z0 + ((z1 - z0) * i) / n, a0, 0.003));
    for (let i = 0; i < n; i++) pts.push(onCowl(z1, a0 + ((a1 - a0) * i) / n, 0.003));
    for (let i = 0; i < n; i++) pts.push(onCowl(z1 + ((z0 - z1) * i) / n, a1, 0.003));
    for (let i = 0; i < n; i++) pts.push(onCowl(z0, a1 + ((a0 - a1) * i) / n, 0.003));
    return pts;
  };
  for (const s of [1, -1]) {
    for (const [za, zb] of [[2.7, 3.0], [2.25, 2.5]]) {
      for (const [a0, a1] of [[35, 78], [102, 140]]) {
        line(polyline(rectPts(za, zb, s * a0, s * a1), { closed: true }), P.lineFaint, 0.0025);
      }
    }
  }

  // gun troughs
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (let i = 0; i <= 5; i++) pts.push(onCowl(3.2 - (i * 1.3) / 5, s * 19, 0.012));
    b.sweep(catmull(pts), [0.03, 0.05, 0.058, 0.05], { color: P.skinTop, bone: J.body, sides: 8 });
    const crest = pts.map((p) => [p[0], p[1] + 0.05, p[2]]);
    line(catmull(crest.slice(1, 5)), P.lineCyan, 0.003);
  }

  // carburettor hump
  const top = onCowl(2.15, 0, 0)[1];
  b.part(new THREE.SphereGeometry(1, 8, 5), P.skinTop, {
    bone: J.body, at: [0, top - 0.01, 2.15], scale: [0.16, 0.07, 0.25],
  });
  b.part(new THREE.BoxGeometry(0.14, 0.03, 0.02), P.skinDeep, { bone: J.body, at: [0, top + 0.015, 2.36] });
  b.part(new THREE.BoxGeometry(0.15, 0.006, 0.006), P.lineWhite, { bone: J.body, at: [0, top + 0.036, 2.375] });

  // ---------- Exhausts ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = 3.2 - i * 0.18;
      b.frustumBox([s * 0.43, 2.0, z], [s * 0.54, 2.0, z - 0.03], [0.05, 0.07], [0.1, 0.03], {
        bone: J.body, color: P.skinDeep,
      });
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 6), P.steelLight, {
        bone: J.body, at: [s * 0.47, 2.0, z], dir: [s, 0, 0],
      });
    }
    const pts: number[][] = [];
    for (let i = 0; i <= 6; i++) pts.push(onCowl(3.28 - (i * 1.0) / 6, s * 66, 0.01));
    line(catmull(pts), P.lineCyan, 0.01);
  }

  // ---------- Chin scoop ----------
  b.part(new THREE.BoxGeometry(0.34, 0.2, 0.7), P.skinUnder, { bone: J.body, at: [0, 1.34, 2.55] });
  b.part(new THREE.BoxGeometry(0.26, 0.13, 0.01), P.skinDeep, { bone: J.body, at: [0, 1.34, 2.903] });
  const fr = (w: number, h: number, x: number, y: number) =>
    b.part(new THREE.BoxGeometry(w, h, 0.008), P.lineWhite, { bone: J.body, at: [x, y, 2.905] });
  fr(0.32, 0.012, 0, 1.415);
  fr(0.32, 0.012, 0, 1.265);
  fr(0.012, 0.16, 0.16, 1.34);
  fr(0.012, 0.16, -0.16, 1.34);
  for (const x of [-0.07, 0, 0.07])
    b.part(new THREE.BoxGeometry(0.008, 0.11, 0.006), P.lineCyan, { bone: J.body, at: [x, 1.34, 2.909] });
  b.part(new THREE.BoxGeometry(0.34, 0.006, 0.5), P.lineWhite, { bone: J.body, at: [0, 1.443, 2.6] });

  // ---------- Spinner ----------
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 20), P.skinDeep, {
    bone: J.body, at: [0, AX, 3.5], dir: [0, 0, 1],
  });
  b.lathe(
    [[0, 0], [0.3, 0], [0.29, 0.12], [0.24, 0.28], [0.15, 0.45], [0.06, 0.58], [0, 0.63]],
    { at: [0, AX, 3.52], axis: [0, 0, 1], segments: 12, color: P.spinner, bone: J.prop },
  );
  b.part(new THREE.TorusGeometry(0.276, 0.007, 4, 16), P.lineWhite, { bone: J.prop, at: [0, AX, 3.7] });

  // ---------- Propeller ----------
  const hub = M.propHub;
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 8), P.steelLight, {
    bone: J.prop, at: [hub[0], hub[1], hub[2] + 0.07], dir: [0, 0, 1],
  });
  const bz = hub[2] + 0.03;
  const bladeMain: [number, number][] = [
    [0, -0.07], [0.1, -0.1], [0.42, -0.1], [0.9, -0.075], [1.04, -0.06],
    [1.04, 0.06], [0.9, 0.075], [0.42, 0.1], [0.1, 0.09], [0, 0.07],
  ];
  const bladeTip: [number, number][] = [
    [0, -0.06], [0.12, -0.055], [0.18, -0.03], [0.18, 0.03], [0.12, 0.055], [0, 0.06],
  ];
  const rect = (u0: number, u1: number, v: number): [number, number][] => [
    [u0, -v], [u1, -v], [u1, v], [u0, v],
  ];
  const pitch = 20 * D2R;
  for (let k = 0; k < 3; k++) {
    const th = k * 120 * D2R;
    const d = [Math.sin(th), Math.cos(th), 0];
    const w = [Math.cos(th), -Math.sin(th), 0];
    const yv = [w[0] * Math.sin(pitch), w[1] * Math.sin(pitch), Math.cos(pitch)];
    const at = (u: number) => [hub[0] + d[0] * (0.28 + u), hub[1] + d[1] * (0.28 + u), bz];
    const ex = (o: [number, number][], u: number, th2: number, color: string) =>
      b.extrude(o, { at: at(u), x: d, y: yv, thickness: th2, color, bone: J.prop });
    ex(bladeMain, 0, 0.03, P.skinTop);
    ex(bladeTip, 1.04, 0.036, P.lineWhite);
    ex(rect(0.08, 0.15, 0.075), 0, 0.036, P.lineWhite);
    ex(rect(0.2, 1.0, 0.006), 0, 0.036, P.lineCyan);
    ex(rect(0.5, 0.54, 0.04), 0, 0.036, P.lineCyan);
    ex(rect(0.58, 0.62, 0.025), 0, 0.036, P.lineCyan);
    const sc = [hub[0] + d[0] * 0.34, hub[1] + d[1] * 0.34, bz];
    b.part(new THREE.CylinderGeometry(0.05, 0.045, 0.16, 6), P.steelLight, {
      bone: J.prop, at: sc, dir: d,
    });
  }

  // ---------- merged rivets ----------
  const merged = mergeGeometries(rivets);
  if (merged) b.part(merged, P.lineWhite, { bone: J.body, at: [0, 0, 0] });
}
    return buildNose;
  })(),
  // fuselage
  (() => {
function buildFuselage({ b, J, P, M }: Ctx) {
  const body = J.body;
  const cabin = J.canopy;
  const DEG = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- fuselage stations: [z, centre y, half width, half height] ----------
  const ST: number[][] = [
    [2.0, 1.85, 0.465, 0.49],
    [1.9, 1.85, 0.46, 0.48],
    [1.0, 1.85, 0.44, 0.52],
    [0.2, 1.84, 0.43, 0.58],
    [-0.9, 1.82, 0.38, 0.5],
    [-2.0, 1.76, 0.3, 0.38],
    [-3.0, 1.68, 0.22, 0.3],
    [-4.0, 1.58, 0.15, 0.22],
    [-4.6, 1.52, 0.07, 0.12],
  ];
  const fs = (z: number) => {
    z = Math.max(-4.6, Math.min(2.0, z));
    for (let i = 0; i < ST.length - 1; i++) {
      const a = ST[i];
      const c = ST[i + 1];
      if (z <= a[0] && z >= c[0]) {
        const t = (a[0] - z) / (a[0] - c[0]);
        return { cy: a[1] + (c[1] - a[1]) * t, hw: a[2] + (c[2] - a[2]) * t, hh: a[3] + (c[3] - a[3]) * t };
      }
    }
    return { cy: 1.85, hw: 0.4, hh: 0.4 };
  };

  // ---------- main loft ----------
  const hull = b.loft(
    ST.map(([z, y, w, h]) => ({ at: [0, y, z] as [number, number, number], w: w * 2, h: h * 2 })),
    {
      bone: body,
      color: P.skinMid,
      detail: 1.5,
      sectors: [
        [-70, 70, P.skinTop],
        [110, 250, P.skinUnder],
      ],
    } as any,
  );
  const skin = b.surface(hull);
  const R = (o: number[], d: number[]) => skin.ray(o as any, d as any);
  const top = (z: number) => R([0, 4, z], [0, -1, 0])!.at.y;

  // ---------- turtle deck + dorsal fillet ----------
  const deckPts: number[][] = [];
  for (let z = -1.3; z >= -3.91; z -= 0.435) deckPts.push([0, top(z) - 0.03, z]);
  const deck = b.sweep(catmull(deckPts as any), (t: number) => [0.15 * (1 - 0.55 * t) + 0.01, 0.05 + 0.04 * Math.sin(Math.PI * Math.min(1, t * 0.95))], {
    bone: body,
    color: P.skinTop,
    caps: "round",
  } as any);
  const skin2 = b.surface([hull, deck]);
  const top2 = (z: number) => skin2.ray([0, 4, z] as any, [0, -1, 0] as any)!.at.y;

  // ---------- generic merged-detail helpers ----------
  const lists: Record<string, THREE.BufferGeometry[]> = { white: [], cyan: [], deep: [], faint: [] };
  const COL: Record<string, string> = { white: P.lineWhite, cyan: P.lineCyan, deep: P.skinDeep, faint: P.lineFaint };
  const put = (list: THREE.BufferGeometry[], g: THREE.BufferGeometry, pos: THREE.Vector3, q: THREE.Quaternion) => {
    g.applyMatrix4(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(1, 1, 1)));
    list.push(g);
  };
  const hv = (h: any) => ({ at: new THREE.Vector3().copy(h.at), n: new THREE.Vector3().copy(h.n).normalize(), q: new THREE.Quaternion().copy(h.quat) });
  const stroke = (list: THREE.BufferGeometry[], ha: any, hb: any, w: number, t: number, lift: number, extra = w) => {
    const A = hv(ha);
    const B = hv(hb);
    const d = B.at.clone().sub(A.at);
    const len = d.length() + extra;
    if (d.length() < 1e-5) return;
    d.normalize();
    const n = A.n.clone().add(B.n).normalize();
    const mid = A.at.clone().add(B.at).multiplyScalar(0.5).addScaledVector(n, lift);
    put(list, new THREE.BoxGeometry(w, t, len), mid, aim(d, n, "z") as THREE.Quaternion);
  };
  const flush = (key: string, bone = body) => {
    if (lists[key].length) b.part(mergeGeometries(lists[key])!, COL[key], { bone, at: [0, 0, 0] });
  };

  // ---------- circumferential seams + rivets ----------
  const rivetGeo = () => new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 5);
  for (const z of [0.8, -0.6, -1.5, -2.4, -3.2, -3.9]) {
    const f = fs(z);
    const lp = skin.loop(frame([0, f.cy, z], [0, 0, 1]), { lift: 0.004 });
    b.sweep(lp, 0.0035, { color: P.lineWhite, bone: body } as any);
    const lp2 = skin.loop(frame([0, fs(z + 0.03).cy, z + 0.03], [0, 0, 1]), { lift: 0.0015 });
    const n = Math.max(8, Math.round(lp2.length / 0.09));
    for (let i = 0; i < n; i++) {
      const p = lp2.at(i / n);
      const h = hv(skin.nearest(p as any));
      put(lists.cyan, rivetGeo(), h.at.clone().addScaledVector(h.n, 0.0005), h.q);
    }
  }

  // ---------- long lines draped on the flanks ----------
  const lineOn = (s: number, dy: number, z0: number, z1: number, color: string, r: number, lift = 0.004) => {
    const pts: number[][] = [];
    const n = Math.max(3, Math.round(Math.abs(z1 - z0) / 0.3));
    for (let i = 0; i <= n; i++) {
      const z = z0 + ((z1 - z0) * i) / n;
      const f = fs(z);
      pts.push([s * (f.hw + 0.06), f.cy + dy, z]);
    }
    b.sweep(skin.drape(catmull(pts as any), { lift }), r, { color, bone: body } as any);
  };
  for (const s of [1, -1]) {
    lineOn(s, -0.1, 1.8, -1.2, P.lineWhite, 0.0035);
    lineOn(s, -0.1, -2.85, -4.4, P.lineWhite, 0.0035);
    lineOn(s, -0.22, 1.8, -1.9, P.lineFaint, 0.003);
    lineOn(s, -0.2, -2.9, -4.3, P.lineFaint, 0.003);
  }

  // cockpit door outline (left) + handle
  {
    const pts: number[][] = [];
    const X = (z: number) => fs(z).hw + 0.08;
    const zs = [0.55, 0.35, 0.15, -0.05, -0.25];
    for (const z of zs) pts.push([X(z), 1.93, z]);
    for (const y of [2.04, 2.15, 2.24]) pts.push([X(-0.25), y, -0.25]);
    for (const z of [...zs].reverse().slice(1)) pts.push([X(z), 2.24, z]);
    for (const y of [2.15, 2.04]) pts.push([X(0.55), y, 0.55]);
    b.sweep(skin.drape(polyline(pts as any, { closed: true }), { lift: 0.004 }), 0.0035, { color: P.lineWhite, bone: body } as any);
    const hh = R([2, 2.05, 0.4], [-1, 0, 0]);
    if (hh) stroke(lists.cyan, hh, R([2, 2.05, 0.28], [-1, 0, 0])!, 0.012, 0.01, 0.005);
  }

  // ---------- roundels ----------
  const roundel = (s: number) => {
    const yc = 1.72;
    const zc = -2.4;
    const c = R([s * 2, yc, zc], [-s, 0, 0]);
    if (!c) return;
    const C = hv(c);
    put(lists.deep, new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16), C.at.clone().addScaledVector(C.n, -0.006), C.q);
    const rings: [number, number, number, string][] = [
      [0.15, 0.065, 16, "white"],
      [0.215, 0.075, 20, "cyan"],
      [0.275, 0.05, 24, "white"],
    ];
    for (const [r, w, N, key] of rings)
      for (let k = 0; k < N; k++) {
        const ph = (2 * Math.PI * k) / N;
        const h = R([s * 2, yc + r * Math.sin(ph), zc + r * Math.cos(ph)], [-s, 0, 0]);
        if (!h) continue;
        const H = hv(h);
        const along = V(0, Math.cos(ph), -Math.sin(ph));
        put(lists[key], new THREE.BoxGeometry(w, 0.008, ((2 * Math.PI * r) / N) * 1.12), H.at.clone().addScaledVector(H.n, 0.005), aim(along, H.n, "z") as THREE.Quaternion);
      }
  };
  roundel(1);
  roundel(-1);

  // ---------- block lettering ----------
  const GL: Record<string, number[][]> = {
    Z: [[0, 1, 0.6, 1], [0.6, 1, 0, 0], [0, 0, 0.6, 0]],
    P: [[0, 0, 0, 1], [0, 1, 0.6, 1], [0.6, 1, 0.6, 0.5], [0.6, 0.5, 0, 0.5]],
    K: [[0, 0, 0, 1], [0.6, 1, 0, 0.5], [0, 0.5, 0.6, 0]],
    "2": [[0, 1, 0.6, 1], [0.6, 1, 0.6, 0.5], [0.6, 0.5, 0, 0.5], [0, 0.5, 0, 0], [0, 0, 0.6, 0]],
    "0": [[0, 0, 0, 1], [0, 1, 0.6, 1], [0.6, 1, 0.6, 0], [0.6, 0, 0, 0]],
  };
  const text = (str: string, s: number, zc: number, yc: number, h: number, w: number) => {
    let u = 0;
    for (const ch of str) {
      for (const st of GL[ch]) {
        const a = R([s * 2, yc + (st[1] - 0.5) * h, zc - s * (u + st[0] * h)], [-s, 0, 0]);
        const c = R([s * 2, yc + (st[3] - 0.5) * h, zc - s * (u + st[2] * h)], [-s, 0, 0]);
        if (a && c) stroke(lists.white, a, c, w, 0.008, 0.003);
      }
      u += 0.85 * h;
    }
  };
  for (const s of [1, -1]) {
    text("ZP", s, -1.38, fs(-1.5).cy - 0.02, 0.22, 0.03);
    text("K200", s, -3.3, fs(-3.5).cy + 0.02, 0.08, 0.012);
  }

  // ---------- centreline dash-dot + ruler ticks ----------
  for (let z = 1.8; z > -4.45; z -= 0.4) {
    if (z < 1.05 && z > -1.45) continue;
    const a = skin2.ray([0, 4, z] as any, [0, -1, 0] as any);
    const c = skin2.ray([0, 4, z - 0.17] as any, [0, -1, 0] as any);
    if (a && c) stroke(lists.cyan, a, c, 0.012, 0.004, 0.0005, 0);
    const d1 = skin2.ray([0, 4, z - 0.25] as any, [0, -1, 0] as any);
    const d2 = skin2.ray([0, 4, z - 0.28] as any, [0, -1, 0] as any);
    if (d1 && d2) stroke(lists.cyan, d1, d2, 0.012, 0.004, 0.0005, 0.01);
  }
  for (let z = 1.75; z > -4.5; z -= 0.5) {
    if (z < 1.3 && z > -1.45) continue;
    const l = skin2.ray([0.06, 4, z] as any, [0, -1, 0] as any);
    const r = skin2.ray([-0.06, 4, z] as any, [0, -1, 0] as any);
    if (l && r) stroke(lists.cyan, l, r, 0.008, 0.004, 0.0005, 0.02);
  }

  // ---------- belly hatch + tail-wheel slot ----------
  const belly = (x: number, z: number) => skin.ray([x, 0.5, z] as any, [0, 1, 0] as any);
  const outlineBelly = (x0: number, x1: number, z0: number, z1: number, key: string, w: number) => {
    const cs: [number, number][] = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    for (let i = 0; i < 4; i++) {
      const [ax, az] = cs[i];
      const [bx, bz] = cs[(i + 1) % 4];
      const m = 3;
      for (let k = 0; k < m; k++) {
        const ha = belly(ax + ((bx - ax) * k) / m, az + ((bz - az) * k) / m);
        const hb = belly(ax + ((bx - ax) * (k + 1)) / m, az + ((bz - az) * (k + 1)) / m);
        if (ha && hb) stroke(lists[key], ha, hb, w, 0.006, 0.002);
      }
    }
  };
  outlineBelly(-0.09, 0.09, -1.9, -2.7, "deep", 0.008);
  {
    const sc = belly(0, -3.95);
    if (sc) {
      const S = hv(sc);
      put(lists.deep, new THREE.BoxGeometry(0.1, 0.012, 0.3), S.at.clone().addScaledVector(S.n, 0.001), aim(V(0, 0, 1), S.n, "z") as THREE.Quaternion);
    }
    outlineBelly(-0.065, 0.065, -3.78, -4.12, "white", 0.006);
  }

  // ---------- cockpit ----------
  const yb = (z: number) => top(z) + 0.01;
  const rxT = (t: number) => 0.03 + 0.16 * Math.sqrt(Math.sin(Math.PI * t));
  const tubPts: number[][] = [];
  for (let i = 0; i <= 6; i++) {
    const z = 0.95 - (1.8 * i) / 6;
    tubPts.push([0, top(z) - 0.02, z]);
  }
  b.sweep(catmull(tubPts as any), (t: number) => [rxT(t), 0.03], { bone: body, color: P.skinDeep, caps: "round" } as any);
  const rim: number[][] = [];
  for (let i = 0; i <= 6; i++) {
    const t = 0.04 + (0.92 * i) / 6;
    rim.push([rxT(t) - 0.005, yb(0.95 - 1.8 * t) + 0.005, 0.95 - 1.8 * t]);
  }
  for (let i = 6; i >= 0; i--) {
    const t = 0.04 + (0.92 * i) / 6;
    rim.push([-rxT(t) + 0.005, yb(0.95 - 1.8 * t) + 0.005, 0.95 - 1.8 * t]);
  }
  b.sweep(catmull(rim as any, { closed: true }), 0.006, { bone: body, color: P.lineWhite } as any);

  const box = (w: number, h: number, d: number, color: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at: at as any, rotation: rot as any });
  // seat, back, headrest, pilot
  box(0.3, 0.05, 0.3, P.skinMid, [0, yb(-0.35) + 0.04, -0.35]);
  box(0.3, 0.24, 0.03, P.skinMid, [0, yb(-0.5) + 0.15, -0.52], [-12, 0, 0]);
  box(0.26, 0.18, 0.02, P.steelLight, [0, yb(-0.72) + 0.1, -0.72], [-8, 0, 0]);
  box(0.34, 0.14, 0.16, P.skinMid, [0, yb(-0.45) + 0.12, -0.42]);
  b.part(new THREE.SphereGeometry(0.085, 8, 6), P.skinMid, { bone: body, at: [0, yb(-0.45) + 0.24, -0.45] });
  box(0.17, 0.025, 0.02, P.lineCyan, [0, yb(-0.45) + 0.255, -0.36]);
  // rudder pedals, throttle quadrant
  for (const s of [1, -1]) box(0.07, 0.03, 0.1, P.steel, [s * 0.09, yb(0.6) + 0.03, 0.6], [-25, 0, 0]);
  box(0.04, 0.05, 0.14, P.steelLight, [0.17, yb(0.1) + 0.03, 0.1]);
  for (let i = 0; i < 3; i++) b.part(new THREE.SphereGeometry(0.014, 5, 4), P.lineWhite, { bone: body, at: [0.17, yb(0.1) + 0.07, 0.05 + i * 0.05] });
  // control column + spade grip
  const colBase = V(0, yb(0.3), 0.3);
  const colTop = V(0, yb(0.3) + 0.26, 0.2);
  b.rod(colBase, colTop, 0.011, P.steel, { bone: body } as any);
  b.part(new THREE.TorusGeometry(0.04, 0.009, 5, 10), P.steelLight, { bone: body, at: [0, colTop.y + 0.03, colTop.z], rotation: [0, 0, 0] });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), P.skinDeep, { bone: body, at: [0, colTop.y + 0.01, colTop.z] });
  // instrument panel + dials
  box(0.34, 0.09, 0.03, P.skinMid, [0, yb(1.0) + 0.035, 1.0], [-20, 0, 0]);
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++)
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 8), P.lineCyan, {
        bone: body,
        at: [(c - 1) * 0.095, yb(1.0) + 0.02 + r * 0.04, 0.982 - r * 0.008],
        rotation: [90 - 20, 0, 0],
      });
  // reflector gunsight
  box(0.06, 0.05, 0.08, P.steel, [0, yb(1.12) + 0.025, 1.12]);
  glow(b.part(new THREE.TorusGeometry(0.03, 0.005, 5, 12), P.navGlow, { bone: body, at: [0, yb(1.12) + 0.075, 1.12] }), 1.4);

  // ---------- canopy ----------
  const CS: number[][] = [
    [1.2, 0.15, 2.3, 2.47],
    [0.6, 0.29, 2.28, 2.58],
    [-0.1, 0.31, 2.26, 2.62],
    [-0.8, 0.27, 2.22, 2.56],
    [-1.35, 0.14, 2.2, 2.4],
  ];
  const cs = (z: number) => {
    z = Math.max(-1.35, Math.min(1.2, z));
    for (let i = 0; i < CS.length - 1; i++) {
      const a = CS[i];
      const c = CS[i + 1];
      if (z <= a[0] && z >= c[0]) {
        const t = (a[0] - z) / (a[0] - c[0]);
        return { a: a[1] + (c[1] - a[1]) * t, c: a[2] + (c[2] - a[2]) * t, T: a[3] + (c[3] - a[3]) * t };
      }
    }
    return { a: 0.2, c: 2.3, T: 2.5 };
  };
  const cp = (z: number, deg: number, s = 1, grow = 0): number[] => {
    const k = cs(z);
    return [s * (k.a + grow) * Math.cos(deg * DEG), k.c + (k.T - k.c + grow) * Math.sin(deg * DEG), z];
  };
  const hoop = (z: number, r: number) => {
    const pts: number[][] = [];
    for (let d = 3; d <= 177; d += 12) pts.push(cp(z, d, 1, 0.008));
    b.sweep(catmull(pts as any), r, { bone: cabin, color: P.lineWhite, caps: "round" } as any);
  };
  [0.62, -0.1, -0.8].forEach((z) => hoop(z, 0.012));
  hoop(1.2, 0.01);
  hoop(-1.35, 0.01);
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (const z of [1.2, 0.6, -0.1, -0.8, -1.35]) pts.push(cp(z, 3, s, 0.008));
    b.sweep(catmull(pts as any), 0.012, { bone: cabin, color: P.lineWhite, caps: "round" } as any);
    const mid: number[][] = [];
    for (const z of [0.62, -0.1, -0.8]) mid.push(cp(z, 40, s, 0.01));
    b.sweep(catmull(mid as any), 0.006, { bone: cabin, color: P.lineCyan } as any);
  }
  const pane = (pts: number[][]) => b.slab(pts as any, { color: P.glass, thickness: 0.01, bone: cabin } as any);
  for (const s of [1, -1]) {
    pane([cp(1.2, 6, s), cp(1.2, 34, s), cp(0.62, 34, s), cp(0.62, 6, s)]);
    pane([cp(-0.8, 6, s), cp(-0.8, 75, s), cp(-1.35, 75, s), cp(-1.35, 6, s)]);
  }
  pane([cp(-0.8, 78, 1), cp(-0.8, 78, -1), cp(-1.35, 78, -1), cp(-1.35, 78, 1)]);
  // windscreen + bullet-proof panel
  const wA = [-0.15, 2.4, 1.25];
  const wB = [0.15, 2.4, 1.25];
  const wC = [0.17, 2.53, 0.62];
  const wD = [-0.17, 2.53, 0.62];
  pane([wA, wB, wC, wD]);
  const bp = [[-0.09, 2.445, 1.2], [0.09, 2.445, 1.2], [0.1, 2.5, 0.95], [-0.1, 2.5, 0.95]];
  pane(bp);
  for (let i = 0; i < 4; i++) b.rod(bp[i] as any, bp[(i + 1) % 4] as any, 0.005, P.lineCyan, { bone: cabin } as any);
  b.rod(wA as any, wD as any, 0.01, P.lineWhite, { bone: cabin } as any);
  b.rod(wB as any, wC as any, 0.01, P.lineWhite, { bone: cabin } as any);
  b.rod(wD as any, wC as any, 0.01, P.lineWhite, { bone: cabin } as any);
  b.rod(wA as any, wB as any, 0.01, P.lineWhite, { bone: cabin } as any);

  // ---------- aerial mast, wire, ID light ----------
  const mastBase = V(0, top(1.55) - 0.02, 1.55);
  const mastTop = V(0, 2.72, 1.55);
  b.rod(mastBase, mastTop, [0.016, 0.006], P.steelLight, { bone: body } as any);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 6), P.lineWhite, { bone: body, at: [0, 2.6, 1.55] });
  b.sweep(catmull([mastTop, V(0, 2.76, -1.5), V(0, 2.88, -4.3)] as any), 0.003, { bone: body, color: P.lineWhite, caps: "round" } as any);
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.lineCyan, { bone: body, at: [0, top2(-2.3) + 0.012, -2.3] }), 1.2);

  // ---------- flush merged line-work ----------
  flush("white");
  flush("cyan");
  flush("deep");
  flush("faint");
}
    return buildFuselage;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const body = J.body;
  type Bone = typeof body;

  // ---------------------------------------------------------------- planform formulas
  const SPAN = 5.62;
  const ch = (x: number) => 2.5 * Math.sqrt(Math.max(0, 1 - (Math.abs(x) / SPAN) ** 2));
  const leZ = (x: number) => 0.3 + 0.25 * ch(x);
  const yc = (x: number) => 1.25 + 0.098 * Math.abs(x);
  const thick = (x: number) => 0.05 + 0.32 * Math.pow(Math.max(0, 1 - Math.abs(x) / SPAN), 0.8);
  const poly = (s: number) =>
    0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s ** 3 - 0.1015 * s ** 4;
  const half = (x: number, s: number) => ((thick(x) / 2) * Math.max(0, poly(s))) / 0.1;
  const pt = (x: number, s: number, side: number, lift = 0) =>
    V(x, yc(x) + side * (half(x, s) + lift), leZ(x) - s * ch(x));
  const sAt = (x: number, z: number) => {
    const c = ch(x);
    return c > 1e-6 ? Math.min(1, Math.max(0, (leZ(x) - z) / c)) : 0;
  };
  const wp = (x: number, z: number, side: number) => pt(x, sAt(x, z), side);
  const nrm = (x: number, s: number, side: number) => {
    const e = 0.02;
    const ss = Math.min(Math.max(s, 0.04), 0.96);
    const a = pt(x + e, ss, side).sub(pt(x - e, ss, side));
    const c = pt(x, ss + 0.02, side).sub(pt(x, ss - 0.02, side));
    const n = a.cross(c).normalize();
    if (n.y * side < 0) n.negate();
    return n;
  };
  const lin = (a: number, c: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((c - a) * i) / n);
  const xr = (a: number, c: number, deg = 5) => {
    const pa = Math.asin(a / SPAN);
    const pb = Math.asin(c / SPAN);
    const n = Math.max(1, Math.ceil(Math.abs(pb - pa) / ((deg * Math.PI) / 180)));
    return Array.from({ length: n + 1 }, (_, i) => SPAN * Math.sin(pa + ((pb - pa) * i) / n));
  };

  // ---------------------------------------------------------------- geometry collector (merged per bone + colour)
  const bag = new Map<string, { bone: Bone; color: string; geos: THREE.BufferGeometry[] }>();
  const add = (bone: Bone, color: string, g: THREE.BufferGeometry) => {
    const ng = g.index ? g.toNonIndexed() : g;
    if (ng.getAttribute("uv")) ng.deleteAttribute("uv");
    const key = `${bone.name}|${color}`;
    let e = bag.get(key);
    if (!e) bag.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(ng);
  };
  const ONE = V(1, 1, 1);
  const prim = (bone: Bone, color: string, g: THREE.BufferGeometry, pos: THREE.Vector3, q?: THREE.Quaternion) => {
    g.applyMatrix4(new THREE.Matrix4().compose(pos, q ?? new THREE.Quaternion(), ONE));
    add(bone, color, g);
  };
  const eul = (x: number, y: number, z: number) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler((x * Math.PI) / 180, (y * Math.PI) / 180, (z * Math.PI) / 180));

  // generic grid surface, winding fixed against a hint direction
  const grid = (
    xs: number[],
    vs: number[],
    f: (x: number, v: number) => THREE.Vector3,
    hint: THREE.Vector3,
  ) => {
    const pos: number[] = [];
    const tri = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3) => {
      const n = bb.clone().sub(a).cross(c.clone().sub(a));
      if (n.lengthSq() < 1e-12) return;
      if (n.dot(hint) < 0) [bb, c] = [c, bb];
      pos.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
    };
    for (let i = 0; i < xs.length - 1; i++)
      for (let j = 0; j < vs.length - 1; j++) {
        const a = f(xs[i], vs[j]);
        const bb = f(xs[i + 1], vs[j]);
        const c = f(xs[i + 1], vs[j + 1]);
        const d = f(xs[i], vs[j + 1]);
        tri(a, bb, c);
        tri(a, c, d);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  };

  // ---------------------------------------------------------------- drawing helpers
  const strip = (bone: Bone, color: string, p0: THREE.Vector3, p1: THREE.Vector3, w: number, side = 1, lift = 0.0015) => {
    const d = p1.clone().sub(p0);
    const len = d.length();
    if (len < 1e-4) return;
    const z = d.normalize();
    const ref = Math.abs(z.x) > Math.abs(z.z) ? V(0, 0, 1) : V(1, 0, 0);
    const n = ref.clone().cross(z).normalize();
    if (n.y * side < 0) n.negate();
    const x = n.clone().cross(z).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, n, z));
    const mid = p0.clone().add(p1).multiplyScalar(0.5).addScaledVector(n, lift);
    prim(bone, color, new THREE.BoxGeometry(w, 0.003, len + w), mid, q);
  };
  const polyStrip = (bone: Bone, color: string, pts: THREE.Vector3[], w: number, side = 1, lift = 0.0015) => {
    for (let i = 0; i < pts.length - 1; i++) strip(bone, color, pts[i], pts[i + 1], w, side, lift);
  };
  const cx = (x0: number, x1: number, s: number, side: number) => {
    const n = Math.max(1, Math.ceil(Math.abs(x1 - x0) / 0.35));
    return lin(x0, x1, n).map((x) => pt(x, s, side));
  };
  const cs = (x: number, s0: number, s1: number, side: number, n = 3) => lin(s0, s1, n).map((s) => pt(x, s, side));
  const lineXZ = (bone: Bone, color: string, side: number, pts: number[][], w: number, lift = 0.0015) => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [xa, za] = pts[i];
      const [xb, zb] = pts[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(xb - xa, zb - za) / 0.3));
      for (let k = 0; k < n; k++) out.push(wp(xa + ((xb - xa) * k) / n, za + ((zb - za) * k) / n, side));
    }
    const last = pts[pts.length - 1];
    out.push(wp(last[0], last[1], side));
    polyStrip(bone, color, out, w, side, lift);
  };
  const rivetGeo = () => new THREE.ConeGeometry(0.0065, 0.004, 5, 1, true);
  const rivet = (bone: Bone, color: string, p: THREE.Vector3, n: THREE.Vector3) =>
    prim(bone, color, rivetGeo(), p.clone().addScaledVector(n, 0.0005), aim(n));
  const rivetsX = (bone: Bone, color: string, x0: number, x1: number, s: number, side: number, sp = 0.09) => {
    const n = Math.max(1, Math.round(Math.abs(x1 - x0) / sp));
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      rivet(bone, color, pt(x, s, side), nrm(x, s, side));
    }
  };
  const rivetsXZ = (bone: Bone, color: string, side: number, xa: number, za: number, xb: number, zb: number, sp = 0.09) => {
    const n = Math.max(1, Math.round(Math.hypot(xb - xa, zb - za) / sp));
    for (let i = 0; i <= n; i++) {
      const x = xa + ((xb - xa) * i) / n;
      const z = za + ((zb - za) * i) / n;
      rivet(bone, color, wp(x, z, side), nrm(x, sAt(x, z), side));
    }
  };
  const disc = (bone: Bone, color: string, x0: number, z0: number, r: number, side: number, lift: number) => {
    const angs = lin(0, 16, 16);
    const g = grid(
      angs,
      [0, r * 0.5, r],
      (ai, rv) => {
        const a = (ai / 16) * Math.PI * 2;
        const x = x0 + rv * Math.cos(a);
        const z = z0 + rv * Math.sin(a);
        return pt(x, sAt(x, z), side, lift);
      },
      V(0, side, 0),
    );
    add(bone, color, g);
  };

  // ---------------------------------------------------------------- main wing skin
  const intervals: [number, number, boolean][] = [
    [-5.62, -5.0, false],
    [-5.0, -2.9, true],
    [-2.9, -2.8, false],
    [-2.8, -0.75, true],
    [-0.75, 0.75, false],
    [0.75, 2.8, true],
    [2.8, 2.9, false],
    [2.9, 5.0, true],
    [5.0, 5.62, false],
  ];
  const SL = [0.1225, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const SLcut = SL.filter((s) => s <= 0.7 + 1e-9);
  const SC = [0.7, 0.8, 0.9, 1.0];
  const up = V(0, 1, 0);
  const dn = V(0, -1, 0);
  const webFn = (bonus: number) => (x: number, v: number) => {
    const t = pt(x, 0.7, 1);
    const u = pt(x, 0.7, -1);
    return V(x, u.y + (t.y - u.y) * v, t.z + bonus);
  };
  const capFn = (x: number) => (s: number, v: number) => {
    const t = pt(x, s, 1);
    const u = pt(x, s, -1);
    return V(x, u.y + (t.y - u.y) * v, t.z);
  };
  const allX: number[] = [];
  for (const [a, c, cut] of intervals) {
    const xs = xr(a, c, 5);
    for (const x of xs) if (!allX.some((q) => Math.abs(q - x) < 1e-9)) allX.push(x);
    const vs = cut ? SLcut : SL;
    add(body, P.skinTop, grid(xs, vs, (x, s) => pt(x, s, 1), up));
    add(body, P.skinUnder, grid(xs, vs, (x, s) => pt(x, s, -1), dn));
    if (cut) {
      add(body, P.skinDeep, grid(xs, [0, 1], webFn(0), V(0, 0, -1)));
      add(body, P.skinDeep, grid([0.7, 0.85, 1.0], [0, 1], (s, v) => capFn(a)(s, v), V(1, 0, 0)));
      add(body, P.skinDeep, grid([0.7, 0.85, 1.0], [0, 1], (s, v) => capFn(c)(s, v), V(-1, 0, 0)));
    }
  }
  allX.sort((p, q) => p - q);
  add(
    body,
    P.skinMid,
    grid(allX, lin(-0.35, 0.35, 8), (x, w) => pt(x, w * w, w >= 0 ? 1 : -1), V(0, 0, 1)),
  );

  // ---------------------------------------------------------------- root fillet fairings
  for (const sg of [1, -1]) {
    prim(body, P.skinMid, new THREE.BoxGeometry(0.17, 0.17, 2.3), V(sg * 0.5, 1.45, -0.3), eul(0, 0, 45));
    prim(body, P.lineWhite, new THREE.BoxGeometry(0.008, 0.004, 2.0), V(sg * 0.5, 1.572, -0.3));
  }

  // ---------------------------------------------------------------- control surfaces
  const ctrls = [
    { bone: J.aileronL, x0: 2.9, x1: 5.0, rib: 7, br: 6, tab: true },
    { bone: J.aileronR, x0: -5.0, x1: -2.9, rib: 7, br: 6, tab: true },
    { bone: J.flapL, x0: 0.75, x1: 2.8, rib: 5, br: 5, tab: false },
    { bone: J.flapR, x0: -2.8, x1: -0.75, rib: 5, br: 5, tab: false },
  ];
  for (const c of ctrls) {
    const bn = c.bone;
    const xs = xr(c.x0, c.x1, 5);
    add(bn, P.skinTop, grid(xs, SC, (x, s) => pt(x, s, 1), up));
    add(bn, P.skinUnder, grid(xs, SC, (x, s) => pt(x, s, -1), dn));
    add(bn, P.skinDeep, grid(xs, [0, 1], webFn(0), V(0, 0, 1)));
    add(bn, P.skinMid, grid([0.7, 0.85, 1.0], [0, 1], (s, v) => capFn(c.x0)(s, v), V(-1, 0, 0)));
    add(bn, P.skinMid, grid([0.7, 0.85, 1.0], [0, 1], (s, v) => capFn(c.x1)(s, v), V(1, 0, 0)));
    // outline on top and underside
    for (const side of [1, -1]) {
      polyStrip(bn, P.lineWhite, cx(c.x0, c.x1, 0.7, side), 0.012, side);
      polyStrip(bn, P.lineWhite, cx(c.x0, c.x1, 0.985, side), 0.008, side);
      polyStrip(bn, P.lineWhite, cs(c.x0, 0.7, 0.985, side), 0.01, side);
      polyStrip(bn, P.lineWhite, cs(c.x1, 0.7, 0.985, side), 0.01, side);
    }
    // fabric ribs
    for (let i = 1; i <= c.rib; i++) {
      const x = c.x0 + ((c.x1 - c.x0) * i) / (c.rib + 1);
      polyStrip(bn, P.lineFaint, cs(x, 0.72, 0.97, 1, 2), 0.009, 1);
    }
    // hinge brackets
    for (let i = 0; i < c.br; i++) {
      const x = c.x0 + 0.12 + ((c.x1 - c.x0 - 0.24) * i) / (c.br - 1);
      const p = pt(x, 0.7, -1);
      prim(bn, P.steelLight, new THREE.BoxGeometry(0.07, 0.03, 0.12), p.clone().add(V(0, -0.012, 0)));
      prim(bn, P.steel, new THREE.CylinderGeometry(0.01, 0.01, 0.09, 6), p.clone().add(V(0, -0.028, 0)), eul(0, 0, 90));
    }
    // rivets along hinge line
    rivetsX(body, P.lineWhite, c.x0 + 0.05, c.x1 - 0.05, 0.665, 1, 0.1);
    // trim tab
    if (c.tab) {
      const sg = Math.sign(c.x0);
      const ta = sg * 4.4;
      const tb = sg * 4.8;
      const xa = Math.min(ta, tb);
      const xb = Math.max(ta, tb);
      add(
        bn,
        P.skinMid,
        grid(lin(0, 1, 4), lin(0, 1, 2), (u, v) => pt(xa + (xb - xa) * u, 0.8 + 0.17 * v, 1, 0.0035), up),
      );
      const o: [number, number][] = [
        [xa, 0.8],
        [xb, 0.8],
        [xb, 0.97],
        [xa, 0.97],
        [xa, 0.8],
      ];
      polyStrip(
        bn,
        P.lineWhite,
        o.flatMap(([x, s], i) => (i < o.length - 1 ? [pt(x, s, 1)] : [pt(x, s, 1)])),
        0.008,
        1,
        0.004,
      );
    }
  }

  // ---------------------------------------------------------------- surface drawing
  for (const sg of [1, -1]) {
    const xa = sg * 0.55;
    const xb = sg * 5.4;
    // spars
    polyStrip(body, P.lineFaint, cx(xa, xb, 0.18, 1), 0.012, 1);
    polyStrip(body, P.lineFaint, cx(xa, xb, 0.62, 1), 0.012, 1);
    // leading-edge panel seams (top and bottom) + rivets
    for (const side of [1, -1]) {
      polyStrip(body, P.lineWhite, cx(xa, xb, 0.1225, side), 0.008, side);
      rivetsX(body, P.lineWhite, xa, xb, 0.155, side, 0.09);
    }
    // 12 ribs
    for (let i = 0; i < 12; i++) {
      const x = sg * (0.9 + 0.38 * i);
      polyStrip(body, P.lineFaint, cs(x, 0.14, 0.66, 1, 3), 0.008, 1);
    }
    // dash-dot centre line on the quarter chord
    let x = 0.5;
    while (x < 5.4) {
      const dash = Math.min(0.14, 5.45 - x);
      strip(body, P.lineCyan, pt(sg * x, 0.25, 1), pt(sg * (x + dash), 0.25, 1), 0.009, 1, 0.0025);
      x += dash + 0.05;
      if (x < 5.4) strip(body, P.lineCyan, pt(sg * x, 0.25, 1), pt(sg * (x + 0.02), 0.25, 1), 0.009, 1, 0.0025);
      x += 0.07;
    }
    // ruler ticks along the leading edge
    for (let i = 0; i <= 19; i++) {
      const xt = sg * (0.5 + 0.25 * i);
      if (Math.abs(xt) > 5.45) continue;
      const long = i % 4 === 0;
      strip(body, P.lineCyan, pt(xt, 0.03, 1), pt(xt, long ? 0.1 : 0.062, 1), 0.006, 1, 0.0018);
    }
    // gun-bay hatches
    const hatches: [number, number][] = [
      [1.2, 2.0],
      [2.1, 2.8],
    ];
    for (const [h0, h1] of hatches) {
      const a = sg * h0;
      const c = sg * h1;
      const rect = [
        [a, 0.55],
        [c, 0.55],
        [c, 0.0],
        [a, 0.0],
        [a, 0.55],
      ];
      lineXZ(body, P.lineWhite, 1, rect, 0.012, 0.002);
      rivetsXZ(body, P.lineWhite, 1, a, 0.52, c, 0.52, 0.1);
      rivetsXZ(body, P.lineWhite, 1, a, 0.03, c, 0.03, 0.1);
    }
    // ammunition bulge panel
    {
      const xa2 = sg * 1.3;
      const xb2 = sg * 2.7;
      const g = grid(
        lin(0, 1, 6),
        lin(0, 1, 3),
        (u, v) => {
          const xx = xa2 + (xb2 - xa2) * u;
          const zz = -0.12 + (-0.26) * v;
          return pt(xx, sAt(xx, zz), 1, 0.003 + 0.02 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v));
        },
        up,
      );
      add(body, P.skinMid, g);
      lineXZ(
        body,
        P.lineWhite,
        1,
        [
          [xa2, -0.12],
          [xb2, -0.12],
          [xb2, -0.38],
          [xa2, -0.38],
          [xa2, -0.12],
        ],
        0.008,
        0.0035,
      );
    }
    // registration cross near the tip
    {
      const xc = sg * 5.25;
      const zc = leZ(xc) - 0.4 * ch(xc);
      lineXZ(body, P.lineWhite, 1, [[xc - 0.14, zc], [xc + 0.14, zc]], 0.018, 0.0028);
      lineXZ(body, P.lineWhite, 1, [[xc, zc + 0.14], [xc, zc - 0.14]], 0.018, 0.0028);
    }
    // roundels, upper and lower
    for (const side of [1, -1]) {
      const rings: [number, string, number][] = [
        [0.4, P.lineWhite, 0.0045],
        [0.3, P.lineCyan, 0.006],
        [0.2, P.lineWhite, 0.0075],
        [0.1, P.skinDeep, 0.009],
      ];
      for (const [r, col, l] of rings) disc(body, col, sg * 3.3, -0.1, r, side, l);
    }
    // wheel well recess + outline
    {
      const wx0 = sg * 0.75;
      const wx1 = sg * 1.5;
      const g = grid(
        lin(0, 1, 4),
        lin(0, 1, 4),
        (u, v) => {
          const xx = wx0 + (wx1 - wx0) * u;
          const zz = 0.88 + (-0.1 - 0.88) * v;
          return pt(xx, Math.max(0.012, sAt(xx, zz)), -1, 0.003);
        },
        dn,
      );
      add(body, P.skinDeep, g);
      lineXZ(
        body,
        P.lineWhite,
        -1,
        [
          [wx0, 0.86],
          [wx1, 0.86],
          [wx1, -0.1],
          [wx0, -0.1],
          [wx0, 0.86],
        ],
        0.012,
        0.0045,
      );
      // inner ribs of the well
      lineXZ(body, P.lineFaint, -1, [[wx0 + (wx1 - wx0) * 0.5, 0.82], [wx0 + (wx1 - wx0) * 0.5, -0.06]], 0.01, 0.0045);
    }
    // ejection slots below each gun
    for (const gx of [1.9, 2.3, 2.7, 3.1]) {
      const x = sg * gx;
      strip(body, P.skinDeep, pt(x, 0.2, -1), pt(x, 0.28, -1), 0.022, -1, 0.002);
    }
    // gun muzzles
    for (const gx of [1.9, 2.3, 2.7, 3.1]) {
      const x = sg * gx;
      const zle = leZ(x);
      const y = yc(x) - 0.004;
      prim(body, P.steel, new THREE.CylinderGeometry(0.022, 0.022, 0.14, 6), V(x, y, zle + 0.03), aim(V(0, 0, 1)));
      prim(body, P.steelLight, new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), V(x, y, zle + 0.002), aim(V(0, 0, 1)));
      prim(body, P.skinDeep, new THREE.CylinderGeometry(0.0135, 0.0135, 0.004, 6), V(x, y, zle + 0.1005), aim(V(0, 0, 1)));
    }
    // wing-tip navigation lens
    {
      const lens = b.part(new THREE.SphereGeometry(0.06, 6, 4), P.navGlow, {
        bone: body,
        at: [sg * 5.575, 1.8, 0.3],
        scale: [0.55, 0.8, 1.2],
      });
      glow(lens, 1.5);
    }
  }

  // ---------------------------------------------------------------- pitot tube (left wing)
  {
    const x = 4.1;
    const zle = leZ(x);
    const y = yc(x) - 0.02;
    prim(body, P.steelLight, new THREE.CylinderGeometry(0.011, 0.011, 0.45, 6), V(x, y, zle + 0.125), aim(V(0, 0, 1)));
    prim(body, P.steel, new THREE.ConeGeometry(0.014, 0.05, 6), V(x, y, zle + 0.375), aim(V(0, 0, 1)));
    prim(body, P.lineCyan, new THREE.CylinderGeometry(0.0125, 0.0125, 0.012, 6), V(x, y, zle + 0.2), aim(V(0, 0, 1)));
    prim(body, P.steelLight, new THREE.BoxGeometry(0.014, 0.05, 0.05), V(x, y + 0.02, zle + 0.0));
  }

  // ---------------------------------------------------------------- radiators
  const rads: { m: number[]; main: boolean }[] = [
    { m: M.radiatorL, main: false },
    { m: M.radiatorR, main: true },
  ];
  for (const r of rads) {
    const rx = r.m[0];
    const rz = r.m[2];
    const yMid = 1.25;
    const zf = rz + 0.4;
    const zr = rz - 0.4;
    prim(body, P.skinUnder, new THREE.BoxGeometry(0.55, 0.35, 0.8), V(rx, yMid, rz));
    // chamfered nose lip
    prim(body, P.skinMid, new THREE.BoxGeometry(0.55, 0.04, 0.06), V(rx, yMid - 0.17, zf - 0.01), eul(-25, 0, 0));
    // intake face
    prim(body, P.skinDeep, new THREE.BoxGeometry(0.46, 0.27, 0.006), V(rx, yMid - 0.01, zf + 0.003));
    // frame
    const fz = zf + 0.0065;
    prim(body, P.lineWhite, new THREE.BoxGeometry(0.49, 0.012, 0.004), V(rx, yMid + 0.13, fz));
    prim(body, P.lineWhite, new THREE.BoxGeometry(0.49, 0.012, 0.004), V(rx, yMid - 0.15, fz));
    prim(body, P.lineWhite, new THREE.BoxGeometry(0.012, 0.28, 0.004), V(rx - 0.245, yMid - 0.01, fz));
    prim(body, P.lineWhite, new THREE.BoxGeometry(0.012, 0.28, 0.004), V(rx + 0.245, yMid - 0.01, fz));
    // honeycomb
    const nv = r.main ? 6 : 5;
    for (let i = 0; i < nv; i++) {
      const dx = (i - (nv - 1) / 2) * (r.main ? 0.075 : 0.09);
      prim(body, P.lineCyan, new THREE.BoxGeometry(0.01, 0.25, 0.004), V(rx + dx, yMid - 0.01, fz + 0.0015));
    }
    for (const dy of r.main ? [-0.07, 0.0, 0.07] : [-0.04, 0.04])
      prim(body, P.lineCyan, new THREE.BoxGeometry(0.43, 0.008, 0.004), V(rx, yMid - 0.01 + dy, fz + 0.0015));
    // side seams
    for (const sx of [-1, 1]) {
      prim(body, P.lineWhite, new THREE.BoxGeometry(0.004, 0.006, 0.7), V(rx + sx * 0.2755, yMid - 0.05, rz - 0.02));
    }
    // adjustable rear flap
    const hp = V(rx, yMid - 0.175, zr);
    const dir = V(0, -0.342, -0.94);
    prim(body, P.skinMid, new THREE.BoxGeometry(0.5, 0.014, 0.17), hp.clone().addScaledVector(dir, 0.085), eul(-20, 0, 0));
    prim(body, P.steelLight, new THREE.BoxGeometry(0.5, 0.01, 0.01), hp);
    prim(body, P.lineWhite, new THREE.BoxGeometry(0.4, 0.004, 0.012), hp.clone().addScaledVector(dir, 0.09).add(V(0, 0.01, 0)), eul(-20, 0, 0));
    // underside access line
    prim(body, P.lineWhite, new THREE.BoxGeometry(0.3, 0.003, 0.012), V(rx, yMid - 0.1755, rz + 0.1));
  }

  // ---------------------------------------------------------------- build the parts
  for (const e of bag.values()) {
    const merged = mergeGeometries(e.geos, false);
    if (merged) b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
  }
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P }: Ctx) {
  const e = 0.0015;
  type Pt = [number, number, number];

  // ---- accumulators: all drawing is merged per bone and colour ----
  const acc = new Map<string, { bone: any; color: string; g: THREE.BufferGeometry[] }>();
  const put = (bone: any, color: string, g: THREE.BufferGeometry) => {
    const k = bone.name + "|" + color;
    if (!acc.has(k)) acc.set(k, { bone, color, g: [] });
    acc.get(k)!.g.push(g);
  };
  const seg = (a: Pt, c: Pt, r = 0.003) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const g = new THREE.BoxGeometry(r * 2, d.length(), r * 2);
    g.applyQuaternion(aim(d.clone().normalize()));
    const m = A.clone().add(B).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return g;
  };
  const line = (bone: any, color: string, a: Pt, c: Pt, r = 0.003) => put(bone, color, seg(a, c, r));
  const polyline = (bone: any, color: string, pts: Pt[], closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) line(bone, color, pts[i], pts[i + 1]);
    if (closed) line(bone, color, pts[pts.length - 1], pts[0]);
  };
  const rivet = (bone: any, color: string, p: Pt) =>
    put(bone, color, new THREE.SphereGeometry(0.006, 5, 3).translate(p[0], p[1], p[2]));
  const sample = (pts: [number, number][], step: number) => {
    const out: [number, number][] = [];
    let carry = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i];
      const [x1, z1] = pts[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      let t = carry;
      while (t <= L) {
        out.push([x0 + ((x1 - x0) * t) / L, z0 + ((z1 - z0) * t) / L]);
        t += step;
      }
      carry = t - L;
    }
    return out;
  };

  // ---- fin / rudder formulas (z as function of y) ----
  const finLe = (y: number) => -3.3 - 0.88 * (y - 1.75);
  const hz = (y: number) => -4.55 - 0.1083 * (y - 1.75);
  const fx = (y: number) => 0.04 - (0.02 * (y - 1.55)) / 1.45;
  const RH = 0.025; // rudder half thickness

  // ---- Fin ----
  b.extrude(
    [[-3.3, 1.55], [-3.3, 1.75], [-4.4, 3.0], [-4.68, 2.95], [-4.55, 1.55]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: [0.08, 0.04], color: P.skinTop, bone: J.body, name: "fin" },
  );
  b.extrude(
    [[-3.3, 1.55], [-3.3, 1.75], [-4.4, 3.0], [-4.52, 2.99], [-3.52, 1.75], [-3.52, 1.55]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: [0.084, 0.044], color: P.skinMid, bone: J.body, name: "finLeadingStrip" },
  );

  // ---- Rudder ----
  const rudderOutline: [number, number][] = [
    [-4.54, 1.78], [-4.67, 2.95], [-4.82, 3.0], [-4.93, 2.92], [-4.97, 2.7], [-4.97, 2.1], [-4.92, 1.85], [-4.8, 1.72],
  ];
  b.extrude(rudderOutline, {
    at: [0, 0, 0], x: [0, 0, 1], thickness: RH * 2, color: P.skinTop, bone: J.rudder, name: "rudder",
  });
  const tabOutline: [number, number][] = [[-4.8, 1.78], [-4.95, 1.84], [-4.95, 2.0], [-4.8, 2.0]];
  b.extrude(tabOutline, {
    at: [0, 0, 0], x: [0, 0, 1], thickness: 0.056, color: P.skinMid, bone: J.rudder, name: "rudderTab",
  });
  // nav light at rudder trailing tip
  glow(
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.navGlow, { bone: J.rudder, at: [0, 2.42, -4.955], name: "tailLight" }),
    1.4,
  );
  // hinge brackets
  for (const y of [1.95, 2.25, 2.55, 2.85]) {
    put(J.rudder, P.steelLight, new THREE.BoxGeometry(0.07, 0.07, 0.07).translate(0, y, hz(y)));
  }

  // ---- Fin markings per side ----
  for (const s of [1, -1]) {
    const xf = (y: number) => s * (fx(y) + e);
    const xb = (y: number) => s * (fx(y) + 0.002 + e); // on leading strip
    const xr = s * (RH + e);
    // leading strip seam, rivets
    line(J.body, P.lineWhite, [xb(1.75), 1.75, -3.52], [xb(2.99), 2.99, -4.52]);
    const leadPts = sample([[1.75, 0], [3.0, 0]].map(([y]) => [y, 0] as [number, number]), 1); // placeholder y list
    void leadPts;
    for (let y = 1.8; y < 2.95; y += 0.075) rivet(J.body, P.lineWhite, [xb(y), y, finLe(y) - 0.045]);
    // fin silhouette outline
    line(J.body, P.lineWhite, [xf(3.0), 3.0, -4.4], [xf(2.95), 2.95, -4.68]);
    line(J.body, P.lineWhite, [xf(2.95), 2.95, -4.68], [xf(1.6), 1.6, -4.56]);
    // rudder outline + ribs
    polyline(J.rudder, P.lineWhite, rudderOutline.map(([z, y]) => [xr, y, z] as Pt), true);
    for (let i = 0; i < 8; i++) {
      const y = 1.97 + i * 0.1;
      line(J.rudder, P.lineFaint, [xr, y, hz(y) - 0.02], [xr, y, y > 2.85 ? -4.8 : -4.945]);
    }
    // rudder trim tab outline
    line(J.rudder, P.lineWhite, [s * (0.028 + e), 2.0, -4.8], [s * (0.028 + e), 2.0, -4.95]);
    line(J.rudder, P.lineWhite, [s * (0.028 + e), 1.8, -4.8], [s * (0.028 + e), 2.0, -4.8]);
    // centreline dash-dot on fin (above the flash)
    const cz = (y: number) => finLe(y) - 0.3 * (finLe(y) - hz(y));
    for (let y = 2.46; y < 2.9; y += 0.18) {
      const y1 = Math.min(y + 0.09, 2.92);
      line(J.body, P.lineCyan, [xf(y), y, cz(y)], [xf(y1), y1, cz(y1)]);
      if (y + 0.14 < 2.92) {
        const yd = y + 0.135;
        line(J.body, P.lineCyan, [xf(yd), yd, cz(yd)], [xf(yd + 0.015), yd + 0.015, cz(yd + 0.015)], 0.004);
      }
    }
    // registration cross near the tip
    const cy = 2.75;
    const czc = finLe(cy) - 0.75 * (finLe(cy) - hz(cy));
    const cx = xf(cy);
    line(J.body, P.lineWhite, [cx, cy - 0.06, czc], [cx, cy + 0.06, czc]);
    line(J.body, P.lineWhite, [cx, cy, czc - 0.06], [cx, cy, czc + 0.06]);
    // fin flash: three stripes, tilted to follow fin taper
    const cols = [P.lineWhite, P.lineCyan, P.lineFaint];
    cols.forEach((c, i) => {
      const z = -3.95 - i * 0.1;
      const g = new THREE.BoxGeometry(0.003, Math.hypot(0.5, 0.01), 0.1);
      const d = new THREE.Vector3(fx(2.4) - fx(1.9), 0.5, 0).multiplyScalar(1);
      d.x *= s;
      g.applyQuaternion(aim(d.clone().normalize(), [0, 0, 1]));
      g.translate(s * (fx(2.15) + 0.0015), 2.15, z);
      put(J.body, c, g);
    });
  }

  // ---- Tailplanes ----
  const fixedOutline: [number, number][] = [
    [0, -3.7], [1.3, -3.95], [1.6, -4.1], [1.67, -4.25], [1.62, -4.42], [1.5, -4.5], [0, -4.5],
  ];
  const elevOutline: [number, number][] = [
    [0, -4.5], [1.5, -4.5], [1.6, -4.46], [1.67, -4.55], [1.66, -4.72], [1.55, -4.83], [1.3, -4.85], [0, -4.85],
  ];
  const leZ = (x: number) => {
    const pts = fixedOutline.slice(0, 4);
    for (let i = 0; i < pts.length - 1; i++) {
      if (x <= pts[i + 1][0]) {
        const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        return pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
      }
    }
    return pts[3][1];
  };
  const hTop = (z: number) => (z >= -4.5 ? (0.03 + (0.05 * (z + 4.5)) / 0.8) / 2 : 0.015);
  const yTop = (z: number) => 1.62 + hTop(z) + e;

  for (const s of [1, -1]) {
    const elev = s > 0 ? J.elevatorL : J.elevatorR;
    const X = (x: number) => s * x;
    const T = (x: number, z: number): Pt => [X(x), yTop(z), z];
    const dir = { x: [s, 0, 0] as [number, number, number], y: [0, 0, 1] as [number, number, number] };

    b.extrude(fixedOutline, { at: [0, 1.62, 0], ...dir, thickness: [0.03, 0.08], color: P.skinTop, bone: J.body, name: "tailplane" });
    b.extrude(fixedOutline, { at: [0, 1.614, 0], ...dir, thickness: [0.034, 0.084], color: P.skinUnder, bone: J.body, name: "tailplaneUnder" });
    b.extrude(elevOutline, { at: [0, 1.62, 0], ...dir, thickness: 0.03, color: P.skinTop, bone: elev, name: "elevator" });
    b.extrude(elevOutline, { at: [0, 1.616, 0], ...dir, thickness: 0.034, color: P.skinUnder, bone: elev, name: "elevatorUnder" });
    b.extrude([[0.5, -4.78], [0.9, -4.78], [0.9, -4.85], [0.5, -4.85]], {
      at: [0, 1.62, 0], ...dir, thickness: 0.038, color: P.skinMid, bone: elev, name: "elevatorTab",
    });

    // outlines
    polyline(J.body, P.lineWhite, [0.1, 1.3, 1.6, 1.67, 1.62, 1.5].map((x, i) => {
      const z = [leZ(0.1), -3.95, -4.1, -4.25, -4.42, -4.5][i];
      return T(x, z);
    }));
    line(J.body, P.lineWhite, T(0.1, -4.5), T(1.5, -4.5));
    polyline(elev, P.lineWhite, elevOutline.slice(1).map(([x, z]) => [X(x), 1.62 + 0.015 + e, z] as Pt));
    line(elev, P.lineWhite, [X(0.5), 1.636, -4.78], [X(0.9), 1.636, -4.78]);

    // ribs
    for (let x = 0.3; x < 1.55; x += 0.2) line(J.body, P.lineFaint, T(x, leZ(x) - 0.03), T(x, -4.49));
    for (const x of [0.3, 0.6, 0.95, 1.25, 1.5]) {
      line(elev, P.lineFaint, [X(x), 1.636, -4.51], [X(x), 1.636, x > 1.4 ? -4.78 : -4.84]);
    }
    // leading-edge rivets
    const lePts: [number, number][] = [[0.1, leZ(0.1)], [1.3, -3.95], [1.6, -4.1], [1.67, -4.25]];
    for (const [x, z] of sample(lePts, 0.1)) rivet(J.body, P.lineWhite, T(x, z - 0.03));
    // hinge brackets
    for (const x of [0.3, 0.7, 1.1, 1.4]) {
      put(elev, P.steelLight, new THREE.BoxGeometry(0.06, 0.03, 0.07).translate(X(x), 1.62, -4.5));
    }
    // horn balance mark
    rivet(elev, P.lineCyan, [X(1.6), 1.638, -4.55]);
    // bracing strut under tailplane
    b.rod([X(0.2), 1.45, -3.9], [X(0.95), 1.6, -4.2], 0.018, P.steel, { bone: J.body, sides: 4, name: "tailStrut" });
  }

  // ---- flush merged drawing parts ----
  const merge = (list: THREE.BufferGeometry[]): THREE.BufferGeometry => {
    let out: THREE.BufferGeometry | null = null;
    const step = 400;
    // chunk to keep merges manageable
    const chunks: THREE.BufferGeometry[] = [];
    for (let i = 0; i < list.length; i += step) {
      const m = mergeGeoms(list.slice(i, i + step));
      if (m) chunks.push(m);
    }
    out = chunks.length === 1 ? chunks[0] : mergeGeoms(chunks);
    return out!;
  };
  for (const { bone, color, g } of acc.values()) {
    const geo = merge(g);
    b.part(geo, color, { bone, at: [0, 0, 0], name: "tailDraw" });
  }
}

function mergeGeoms(list: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  return mergeGeometries(list);
}
    return buildTail;
  })(),
  // gear
  (() => {
function buildGear({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const R = rng(5);

  // Cylinder between two points, on a bone
  const rod = (a: number[], c: number[], r0: number, r1: number, col: string, bone: any, seg = 8) => {
    const A = V(a[0], a[1], a[2]);
    const C = V(c[0], c[1], c[2]);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    return b.part(g, col, { bone, at: A.clone().add(C).multiplyScalar(0.5), dir: d.clone().normalize(), flat: true });
  };
  const box = (sx: number, sy: number, sz: number, at: number[], col: string, bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), col, { bone, at, rotation: rot });

  // Wheel axle along x (cylinder default axis y -> dir x)
  const wheel = (side: number, joint: any, ctr: number[], R0: number, W: number, seg: number, holes: boolean) => {
    const [cx, cy, cz] = ctr;
    const ax: [number, number, number] = [1, 0, 0];
    b.part(new THREE.CylinderGeometry(R0, R0, W, seg), P.inkNavy, { bone: joint, at: ctr, dir: ax, flat: true });
    // tread ring facets
    const n = seg;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const y = cy + Math.cos(a) * R0;
      const z = cz + Math.sin(a) * R0;
      b.part(new THREE.BoxGeometry(W * 0.8, 0.012, R0 * 0.35), i % 2 ? P.lineFaint : P.skinDeep, {
        bone: joint, at: [cx, y, z], rotation: [(-a * 180) / Math.PI + 90 - 90 + 0, 0, 0].map((v, k) => (k === 0 ? (a * 180) / Math.PI : 0)),
      });
    }
    for (const s of [1, -1]) {
      const fx = cx + s * (W / 2 + 0.002);
      // sidewall ring
      b.part(new THREE.TorusGeometry(R0 * 0.82, 0.008, 4, seg), P.lineFaint, { bone: joint, at: [fx, cy, cz], dir: ax, axis: "z" });
      // hub disc
      b.part(new THREE.CylinderGeometry(R0 * 0.55, R0 * 0.55, 0.012, seg), P.spinner, { bone: joint, at: [fx + s * 0.005, cy, cz], dir: ax, flat: true });
      b.part(new THREE.TorusGeometry(R0 * 0.56, 0.007, 4, seg), P.lineWhite, { bone: joint, at: [fx + s * 0.012, cy, cz], dir: ax, axis: "z" });
      if (holes) {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          b.part(new THREE.CylinderGeometry(R0 * 0.1, R0 * 0.1, 0.006, 8), P.skinDeep, {
            bone: joint, at: [fx + s * 0.013, cy + Math.cos(a) * R0 * 0.33, cz + Math.sin(a) * R0 * 0.33], dir: ax, flat: true,
          });
        }
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.26;
          b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 5), P.lineWhite, {
            bone: joint, at: [fx + s * 0.014, cy + Math.cos(a) * R0 * 0.46, cz + Math.sin(a) * R0 * 0.46], dir: ax, flat: true,
          });
        }
      }
      // centre cap
      b.part(new THREE.CylinderGeometry(R0 * 0.12, R0 * 0.12, 0.02, 6), P.steelLight, { bone: joint, at: [fx + s * 0.014, cy, cz], dir: ax, flat: true });
    }
    // ground contact tick (outer face side)
    const ox = cx + side * (W / 2 + 0.004);
    box(0.006, 0.07, 0.012, [ox, 0.035, cz], P.lineCyan, joint);
    box(0.006, 0.012, 0.09, [ox, 0.006, cz], P.lineCyan, joint);
  };

  for (const s of [1, -1]) {
    const leg = s > 0 ? J.legL : J.legR;
    const wh = s > 0 ? J.wheelL : J.wheelR;
    const top = [s * 1.0, 1.2, 0.35];
    const ax = [s * 1.12, 0.34, 0.4];
    const mid = [s * 1.065, 0.78, 0.375];
    // oleo
    rod(top, mid, 0.07, 0.07, P.steel, leg, 8);
    rod(mid, [ax[0], ax[1] + 0.04, ax[2]], 0.045, 0.045, P.steelLight, leg, 8);
    b.part(new THREE.TorusGeometry(0.075, 0.012, 4, 8), P.lineWhite, { bone: leg, at: mid, dir: [0, 1, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 8), P.steel, { bone: leg, at: top, flat: true });
    // axle stub
    rod([s * 0.98, 0.34, 0.4], [s * 1.2, 0.34, 0.4], 0.035, 0.035, P.steelLight, leg, 8);
    // fork
    box(0.03, 0.34, 0.03, [s * 1.045, 0.5, 0.4], P.steel, leg);
    // scissor links
    rod([s * 1.07, 0.7, 0.4], [s * 1.1, 0.55, 0.5], 0.014, 0.014, P.steelLight, leg, 5);
    rod([s * 1.1, 0.55, 0.5], [s * 1.09, 0.42, 0.42], 0.014, 0.014, P.steelLight, leg, 5);
    rod([s * 1.07, 0.7, 0.3], [s * 1.1, 0.55, 0.22], 0.014, 0.014, P.steel, leg, 5);
    rod([s * 1.1, 0.55, 0.22], [s * 1.09, 0.42, 0.34], 0.014, 0.014, P.steel, leg, 5);
    b.part(new THREE.SphereGeometry(0.025, 5, 4), P.lineWhite, { bone: leg, at: [s * 1.1, 0.55, 0.5] });
    // brake line
    b.sweep([[s * 1.03, 1.1, 0.32], [s * 1.0, 0.8, 0.28], [s * 1.06, 0.5, 0.3], [s * 1.1, 0.36, 0.34]] as any, 0.007, { color: P.lineCyan, bone: leg } as any);
    // ruler ticks
    for (let i = 0; i < 6; i++) {
      const y = 0.55 + i * 0.1;
      box(0.004, 0.006, i % 2 ? 0.04 : 0.07, [s * 1.0 + (1.2 - y) * -0.0, y, 0.435], P.lineCyan, leg);
    }
    // outer door
    const dx = s * 1.2;
    box(0.03, 0.7, 0.4, [dx, 0.9, 0.35], P.skinMid, leg, [0, 0, -s * 4]);
    const ox = dx + s * 0.017;
    box(0.006, 0.7, 0.012, [ox, 0.9, 0.55], P.lineWhite, leg);
    box(0.006, 0.7, 0.012, [ox, 0.9, 0.15], P.lineWhite, leg);
    box(0.006, 0.012, 0.4, [ox, 1.25, 0.35], P.lineCyan, leg);
    box(0.006, 0.012, 0.4, [ox, 0.55, 0.35], P.lineWhite, leg);
    for (let i = 0; i < 7; i++) {
      b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 5), P.lineWhite, { bone: leg, at: [ox + s * 0.002, 0.6 + i * 0.09, 0.45], dir: [s, 0, 0], flat: true });
    }
    for (let i = 0; i < 3; i++) box(0.008, 0.04, 0.03, [ox + s * 0.003, 1.2, 0.2 + i * 0.15], P.lineCyan, leg);
    // inner door
    box(0.025, 0.5, 0.22, [s * 0.8, 1.05, 0.35], P.skinMid, leg);
    box(0.006, 0.5, 0.01, [s * 0.8 - s * 0.014, 1.05, 0.46], P.lineWhite, leg);
    box(0.006, 0.5, 0.01, [s * 0.8 - s * 0.014, 1.05, 0.24], P.lineWhite, leg);
    // wheel
    wheel(s, wh, ax, 0.34, 0.18, 16, true);
  }

  // Tail gear
  const T = J.tailLeg;
  const TW = J.tailWheel;
  rod([0, 1.38, -3.95], [0, 0.55, -4.0], 0.04, 0.04, P.steel, T, 8);
  rod([0, 0.55, -4.0], [0, 0.26, -4.02], 0.026, 0.026, P.steelLight, T, 8);
  b.part(new THREE.TorusGeometry(0.045, 0.008, 4, 8), P.lineWhite, { bone: T, at: [0, 0.55, -4.0], dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1]) box(0.015, 0.2, 0.03, [s * 0.065, 0.2, -4.02], P.steel, T);
  box(0.16, 0.025, 0.04, [0, 0.3, -4.02], P.steel, T);
  rod([-0.07, 0.14, -4.02], [0.07, 0.14, -4.02], 0.012, 0.012, P.steelLight, T, 6);
  for (let i = 0; i < 5; i++) {
    const y = 0.5 + i * 0.17;
    box(i % 2 ? 0.05 : 0.08, 0.005, 0.005, [0, y, -3.95 + 0.04], P.lineCyan, T);
  }
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.09, 12), P.inkNavy, { bone: TW, at: [0, 0.14, -4.02], dir: [1, 0, 0], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.01, 10), P.spinner, { bone: TW, at: [s * 0.047, 0.14, -4.02], dir: [1, 0, 0], flat: true });
    b.part(new THREE.TorusGeometry(0.1, 0.005, 4, 12), P.lineFaint, { bone: TW, at: [s * 0.046, 0.14, -4.02], dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 5), P.steelLight, { bone: TW, at: [s * 0.052, 0.14, -4.02], dir: [1, 0, 0], flat: true });
  }
  box(0.004, 0.03, 0.006, [0.048, 0.015, -4.02], P.lineCyan, TW);
  void R; void frame; void M;
}
    return buildGear;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "spitfireBlueprint" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.85,0], dir: [0,0,1], role: "spine" });
  J["prop"] = b.joint("prop", { parent: J["body"], at: [0,1.85,3.55], dir: [0,0,1], role: "hinge", group: "nose" });
  J["canopy"] = b.joint("canopy", { parent: J["body"], at: [0,2.3,0.8], dir: [0,0,-1], role: "hinge", group: "fuselage" });
  J["aileronL"] = b.joint("aileronL", { parent: J["body"], at: [2.9,1.53,-0.62], dir: [1,0.1,0.22], role: "hinge", group: "wings" });
  J["aileronR"] = b.joint("aileronR", { parent: J["body"], at: [-2.9,1.53,-0.62], dir: [-1,0.1,0.22], role: "hinge", group: "wings" });
  J["flapL"] = b.joint("flapL", { parent: J["body"], at: [0.75,1.33,-0.9], dir: [1,0.1,0.05], role: "hinge", group: "wings" });
  J["flapR"] = b.joint("flapR", { parent: J["body"], at: [-0.75,1.33,-0.9], dir: [-1,0.1,0.05], role: "hinge", group: "wings" });
  J["rudder"] = b.joint("rudder", { parent: J["body"], at: [0,1.75,-4.55], dir: [0,1,-0.1], role: "hinge", group: "tail" });
  J["elevatorL"] = b.joint("elevatorL", { parent: J["body"], at: [0.15,1.62,-4.5], dir: [1,0,0], role: "hinge", group: "tail" });
  J["elevatorR"] = b.joint("elevatorR", { parent: J["body"], at: [-0.15,1.62,-4.5], dir: [-1,0,0], role: "hinge", group: "tail" });
  J["legL"] = b.joint("legL", { parent: J["body"], at: [1,1.2,0.35], dir: [0.1,-1,0.05], role: "leg", group: "gear" });
  J["wheelL"] = b.joint("wheelL", { parent: J["legL"], at: [1.12,0.34,0.4], dir: [1,0,0], role: "hinge", group: "gear" });
  J["legR"] = b.joint("legR", { parent: J["body"], at: [-1,1.2,0.35], dir: [-0.1,-1,0.05], role: "leg", group: "gear" });
  J["wheelR"] = b.joint("wheelR", { parent: J["legR"], at: [-1.12,0.34,0.4], dir: [-1,0,0], role: "hinge", group: "gear" });
  J["tailLeg"] = b.joint("tailLeg", { parent: J["body"], at: [0,1.38,-3.95], dir: [0,-1,-0.05], role: "leg", group: "gear" });
  J["tailWheel"] = b.joint("tailWheel", { parent: J["tailLeg"], at: [0,0.14,-4.02], dir: [1,0,0], role: "hinge", group: "gear" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
