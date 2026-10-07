```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "A polished brass explorer's telescope on a mahogany tripod. It has leather-wrapped sections, engraved rings, a finder scope, a rubber eyecup and focusing knobs. A brass-fenced tray below holds a rolled star chart, an open sky map, a compass and a spare eyepiece.",
};

type V = THREE.Vector3 | [number, number, number];
const toV = (p: V) => (Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p.clone());
const arr = (v: V): [number, number, number] => {
  const t = toV(v);
  return [t.x, t.y, t.z];
};

// Rotate a geometry so its local +Y points along dir
function orient<G extends THREE.BufferGeometry>(geo: G, dir: V): G {
  const v = toV(dir).normalize();
  const a = Math.acos(Math.max(-1, Math.min(1, v.y)));
  const p = Math.atan2(-v.x, -v.z);
  geo.rotateX(-a);
  geo.rotateY(p);
  return geo;
}

export default function build() {
  const b = createBuilder({ name: "explorer_telescope" });

  // ---------- palette ----------
  const BRASS = "#c9962e";
  const BRASS_DK = "#8a6420";
  const BRASS_HI = "#f0cd62";
  const LEATHER = "#6a3218";
  const LEATHER_DK = "#3d1d10";
  const STITCH = "#ead9ae";
  const MAHOG = "#6e2716";
  const MAHOG_LT = "#8a3a20";
  const MAHOG_DK = "#4a170d";
  const RUBBER = "#1d1c1f";
  const LENS_DK = "#0d1624";
  const GLASS = "#2c5a8f";
  const GLASS_HI = "#bfe3ff";
  const PAPER = "#efe0b8";
  const PAPER_DK = "#cdb582";
  const NAVY = "#1d2a55";
  const STAR = "#ffd75e";
  const LINE = "#8fa6d8";
  const RIBBON = "#b0302a";
  const WHITE = "#f6f1e4";
  const STEEL = "#7d8794";

  // ---------- skeleton ----------
  const C = new THREE.Vector3(0, 1.36, 0); // telescope pivot
  const root = b.joint("root", { at: [0, 0, 0] });
  const yaw = b.joint("yaw", { at: [0, 1.18, 0], parent: root } as any);
  const tiltJ = b.joint("tilt", { at: arr(C), parent: yaw } as any);

  const put = (geo: THREE.BufferGeometry, color: string, at: V, bone: any = root) => {
    b.part(geo, color, { at: arr(at), bone } as any);
  };

  // ---------- telescope frame ----------
  const tiltA = (25 * Math.PI) / 180;
  const d = new THREE.Vector3(0, Math.sin(tiltA), Math.cos(tiltA)); // along tube (to objective)
  const u = new THREE.Vector3(0, Math.cos(tiltA), -Math.sin(tiltA)); // tube "up"
  const X = new THREE.Vector3(1, 0, 0);
  const P = (s: number, up = 0, side = 0) =>
    C.clone().addScaledVector(d, s).addScaledVector(u, up).addScaledVector(X, side);

  const tube = (s0: number, s1: number, r0: number, r1: number, color: string, n = 16, up = 0) => {
    const g = orient(new THREE.CylinderGeometry(r1, r0, Math.abs(s1 - s0), n, 1), d);
    put(g, color, P((s0 + s1) / 2, up), tiltJ);
  };
  const ringT = (s: number, R: number, t: number, color: string, up = 0, n = 20) => {
    const g = new THREE.TorusGeometry(R, t, 5, n);
    g.rotateX(Math.PI / 2);
    orient(g, d);
    put(g, color, P(s, up), tiltJ);
  };

  // --- main body ---
  tube(-0.5, 0.5, 0.042, 0.042, BRASS, 18);
  // objective cell and dew shield
  tube(0.5, 0.6, 0.05, 0.05, BRASS_HI, 18);
  ringT(0.5, 0.05, 0.004, BRASS_DK);
  tube(0.6, 0.66, 0.052, 0.057, BRASS, 18);
  ringT(0.66, 0.056, 0.0045, BRASS_HI);
  ringT(0.6, 0.053, 0.003, BRASS_DK);
  // lens
  tube(0.66, 0.664, 0.049, 0.049, GLASS, 18);
  ringT(0.664, 0.048, 0.0028, RUBBER);
  {
    const g = orient(new THREE.BoxGeometry(0.012, 0.002, 0.026), d);
    put(g, GLASS_HI, P(0.666, 0.02, -0.018), tiltJ);
    const g2 = orient(new THREE.BoxGeometry(0.006, 0.002, 0.01), d);
    put(g2, GLASS_HI, P(0.666, 0.006, -0.03), tiltJ);
  }

  // --- leather wraps with stitched seams ---
  const leather = (s0: number, s1: number) => {
    tube(s0, s1, 0.0465, 0.0465, LEATHER, 16);
    ringT(s0, 0.047, 0.003, LEATHER_DK);
    ringT(s1, 0.047, 0.003, LEATHER_DK);
    const n = Math.round((s1 - s0) / 0.022);
    for (let i = 0; i < n; i++) {
      const s = s0 + ((i + 0.5) * (s1 - s0)) / n;
      for (const side of [1, -1]) {
        const g = orient(new THREE.BoxGeometry(0.003, 0.009, 0.003), d);
        put(g, STITCH, P(s, 0, side * 0.0468), tiltJ);
      }
      const gt = orient(new THREE.BoxGeometry(0.003, 0.009, 0.003), d);
      put(gt, STITCH, P(s, -0.0468, 0), tiltJ);
    }
  };
  leather(0.12, 0.43);
  leather(-0.32, -0.07);

  // --- engraved rings ---
  const engraved = (s: number) => {
    tube(s - 0.008, s + 0.008, 0.045, 0.045, BRASS_DK, 18);
    ringT(s - 0.008, 0.045, 0.0018, BRASS_HI);
    ringT(s + 0.008, 0.045, 0.0018, BRASS_HI);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const g = orient(new THREE.BoxGeometry(0.003, 0.006, 0.003), d);
      put(g, BRASS_HI, P(s, Math.cos(a) * 0.0455, Math.sin(a) * 0.0455), tiltJ);
    }
  };
  engraved(-0.37);
  engraved(0.085);
  engraved(0.465);

  // --- cradle and trunnions ---
  tube(-0.035, 0.035, 0.05, 0.05, BRASS_DK, 18);
  ringT(-0.035, 0.05, 0.003, BRASS_HI);
  ringT(0.035, 0.05, 0.003, BRASS_HI);
  put(orient(new THREE.CylinderGeometry(0.013, 0.013, 0.2, 10), X), BRASS_HI, C, tiltJ);
  // altitude lock knob (+X)
  put(orient(new THREE.CylinderGeometry(0.024, 0.024, 0.014, 12), X), BRASS, [0.107, C.y, C.z], tiltJ);
  put(orient(new THREE.TorusGeometry(0.024, 0.003, 4, 12).rotateX(Math.PI / 2), X), BRASS_DK, [0.107, C.y, C.z], tiltJ);
  put(new THREE.BoxGeometry(0.01, 0.06, 0.012), MAHOG, [0.118, C.y, C.z], tiltJ);
  put(new THREE.SphereGeometry(0.008, 8, 6), BRASS_HI, [0.118, C.y + 0.032, C.z], tiltJ);
  put(new THREE.SphereGeometry(0.008, 8, 6), BRASS_HI, [0.118, C.y - 0.032, C.z], tiltJ);
  put(orient(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 10), X), BRASS_HI, [-0.105, C.y, C.z], tiltJ);

  // --- focuser ---
  tube(-0.5, -0.42, 0.047, 0.047, BRASS_DK, 16);
  ringT(-0.42, 0.047, 0.0025, BRASS_HI);
  ringT(-0.5, 0.047, 0.0025, BRASS_HI);
  put(orient(new THREE.BoxGeometry(0.032, 0.08, 0.024), d), BRASS, P(-0.46, -0.058), tiltJ);
  const pin = P(-0.46, -0.064);
  put(orient(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 8), X), BRASS_DK, pin, tiltJ);
  for (const sx of [1, -1]) {
    const kc = pin.clone().addScaledVector(X, sx * 0.075);
    put(orient(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 12), X), BRASS, kc, tiltJ);
    for (const o of [-0.005, 0.005]) {
      const g = new THREE.TorusGeometry(0.022, 0.0025, 4, 12);
      g.rotateX(Math.PI / 2);
      put(orient(g, X), BRASS_DK, kc.clone().addScaledVector(X, o), tiltJ);
    }
    put(
      orient(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 10), X),
      BRASS_HI,
      kc.clone().addScaledVector(X, sx * 0.01),
      tiltJ,
    );
  }

  // --- draw tube with graduations ---
  tube(-0.6, -0.5, 0.03, 0.03, BRASS_HI, 16);
  for (let i = 0; i < 6; i++) {
    const s = -0.59 + i * 0.015;
    const w = i % 2 === 0 ? 0.014 : 0.008;
    put(orient(new THREE.BoxGeometry(w, 0.002, 0.002), d), BRASS_DK, P(s, 0.0305), tiltJ);
  }
  // --- eyepiece ---
  tube(-0.64, -0.6, 0.022, 0.022, BRASS, 14);
  ringT(-0.6, 0.023, 0.0025, BRASS_HI, 0, 14);
  tube(-0.68, -0.64, 0.02, 0.02, BRASS_DK, 14);
  ringT(-0.65, 0.0205, 0.002, BRASS_HI, 0, 14);
  ringT(-0.665, 0.0205, 0.002, BRASS_HI, 0, 14);
  tube(-0.72, -0.68, 0.029, 0.021, RUBBER, 14);
  ringT(-0.72, 0.026, 0.005, RUBBER, 0, 14);
  tube(-0.726, -0.72, 0.014, 0.014, LENS_DK, 12);

  // --- finder scope ---
  const FU = 0.09;
  tube(-0.16, 0.1, 0.015, 0.015, BRASS, 12, FU);
  tube(0.1, 0.14, 0.015, 0.019, BRASS_HI, 12, FU);
  tube(0.14, 0.143, 0.016, 0.016, GLASS, 12, FU);
  put(orient(new THREE.BoxGeometry(0.004, 0.002, 0.008), d), GLASS_HI, P(0.144, FU + 0.006, -0.005), tiltJ);
  tube(-0.2, -0.16, 0.01, 0.01, BRASS_DK, 10, FU);
  tube(-0.23, -0.2, 0.013, 0.011, RUBBER, 10, FU);
  for (const s of [-0.1, 0.05]) {
    ringT(s, 0.019, 0.004, BRASS_DK, FU, 14);
    put(orient(new THREE.BoxGeometry(0.012, 0.032, 0.012), u), BRASS_DK, P(s, 0.058), tiltJ);
    put(orient(new THREE.BoxGeometry(0.03, 0.006, 0.026), u), BRASS, P(s, 0.044), tiltJ);
    for (const sx of [1, -1]) {
      put(orient(new THREE.CylinderGeometry(0.0035, 0.0035, 0.012, 6), X), BRASS_HI, P(s, FU, sx * 0.024), tiltJ);
    }
  }

  // ---------- mount yoke (yaw) ----------
  put(new THREE.BoxGeometry(0.17, 0.016, 0.07), BRASS_DK, [0, 1.198, 0], yaw);
  for (const sx of [1, -1]) {
    put(new THREE.BoxGeometry(0.016, 0.17, 0.04), BRASS, [sx * 0.07, 1.285, 0], yaw);
    put(orient(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 12), X), BRASS, [sx * 0.07, C.y, C.z], yaw);
    put(orient(new THREE.CylinderGeometry(0.01, 0.01, 0.022, 8), X), BRASS_HI, [sx * 0.07, C.y, C.z], yaw);
  }

  // ---------- tripod head ----------
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 6), MAHOG, [0, 1.145, 0]);
  put(new THREE.TorusGeometry(0.098, 0.006, 4, 6).rotateX(Math.PI / 2).rotateY(Math.PI / 6), BRASS, [0, 1.17, 0]);
  put(new THREE.TorusGeometry(0.098, 0.006, 4, 6).rotateX(Math.PI / 2).rotateY(Math.PI / 6), BRASS, [0, 1.12, 0]);
  put(new THREE.CylinderGeometry(0.068, 0.068, 0.02, 20), BRASS_HI, [0, 1.18, 0]);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const len = i % 6 === 0 ? 0.014 : 0.007;
    const g = new THREE.BoxGeometry(0.002, 0.002, len).rotateY(a);
    put(g, BRASS_DK, [Math.sin(a) * (0.064 - len / 2), 1.1905, Math.cos(a) * (0.064 - len / 2)]);
  }
  put(new THREE.ConeGeometry(0.032, 0.07, 6).rotateX(Math.PI), BRASS, [0, 1.085, 0]);
  put(new THREE.SphereGeometry(0.012, 8, 6), BRASS_HI, [0, 1.048, 0]);

  // ---------- legs ----------
  const R_TOP = 0.085,
    Y_TOP = 1.13,
    R_FOOT = 0.58;
  const TRAY_Y = 0.42;
  const TRAY_R = 0.32;
  for (let k = 0; k < 3; k++) {
    const phi = (k * 2 * Math.PI) / 3;
    const out = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi));
    const T = new THREE.Vector3(Math.cos(phi), 0, -Math.sin(phi));
    const top = out.clone().multiplyScalar(R_TOP).setY(Y_TOP);
    const foot = out.clone().multiplyScalar(R_FOOT);
    const down = foot.clone().sub(top);
    const L = down.length();
    down.normalize();
    const upDir = down.clone().negate();
    const alpha = Math.acos(upDir.y);
    const N = new THREE.Vector3(Math.cos(alpha) * Math.sin(phi), Math.sin(alpha), Math.cos(alpha) * Math.cos(phi));
    const at = (t: number) => top.clone().addScaledVector(down, t * L);
    const seg = (t0: number, t1: number, w: number, dpt: number, color: string, side = 0) => {
      const g = orient(new THREE.BoxGeometry(w, (t1 - t0) * L, dpt), upDir);
      put(g, color, at((t0 + t1) / 2).addScaledVector(T, side));
    };
    // hinge
    put(orient(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 10), T), BRASS, at(0.02));
    for (const sx of [1, -1])
      put(orient(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 8), T), BRASS_HI, at(0.02).addScaledVector(T, sx * 0.047));
    // twin upper slats
    for (const sx of [1, -1]) {
      seg(0.02, 0.6, 0.02, 0.032, MAHOG, sx * 0.022);
      seg(0.05, 0.57, 0.004, 0.034, MAHOG_DK, sx * 0.022); // grain line
      for (const t of [0.12, 0.35]) {
        put(new THREE.SphereGeometry(0.0055, 6, 4), BRASS_HI, at(t).addScaledVector(T, sx * 0.022).addScaledVector(N, 0.016));
      }
    }
    // lower sliding leg
    seg(0.5, 0.94, 0.022, 0.028, MAHOG_LT);
    seg(0.52, 0.92, 0.004, 0.03, MAHOG_DK);
    // clamp
    seg(0.56, 0.62, 0.074, 0.042, BRASS);
    seg(0.555, 0.565, 0.078, 0.046, BRASS_HI);
    seg(0.615, 0.625, 0.078, 0.046, BRASS_HI);
    const screw = at(0.59).addScaledVector(T, 0.045);
    put(orient(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 6), T), BRASS_DK, screw);
    put(orient(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 8), T), BRASS_HI, screw.clone().addScaledVector(T, 0.012));
    // ferrule and spike
    seg(0.925, 0.965, 0.03, 0.034, BRASS);
    const coneLen = 0.035 * L;
    put(orient(new THREE.ConeGeometry(0.014, coneLen, 8), down), BRASS_HI, at(1 - 0.035 / 2));

    // tray bracket + spreader arm
    const tT = (Y_TOP - TRAY_Y) / Y_TOP;
    const legPt = at(tT);
    put(orient(new THREE.BoxGeometry(0.032, 0.03, 0.036), upDir), BRASS, legPt);
    const rLeg = Math.hypot(legPt.x, legPt.z);
    const arm0 = TRAY_R - 0.01,
      arm1 = rLeg - 0.016;
    put(
      orient(new THREE.CylinderGeometry(0.006, 0.006, arm1 - arm0, 8), out),
      BRASS_DK,
      out.clone().multiplyScalar((arm0 + arm1) / 2).setY(TRAY_Y),
    );
    // corner cap on tray
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.032, 8), BRASS, out.clone().multiplyScalar(TRAY_R - 0.02).setY(TRAY_Y + 0.006));
    put(new THREE.SphereGeometry(0.008, 6, 4), BRASS_HI, out.clone().multiplyScalar(TRAY_R - 0.02).setY(TRAY_Y + 0.024));
  }

  // ---------- tray ----------
  put(new THREE.CylinderGeometry(TRAY_R, TRAY_R, 0.018, 3), MAHOG, [0, TRAY_Y, 0]);
  put(new THREE.CylinderGeometry(TRAY_R * 0.55, TRAY_R * 0.55, 0.0185, 3), MAHOG_LT, [0, TRAY_Y, 0]);
  const TOP = TRAY_Y + 0.009;
  for (let k = 0; k < 3; k++) {
    const pm = Math.PI / 3 + (k * 2 * Math.PI) / 3;
    const ri = TRAY_R / 2 - 0.006;
    const len = TRAY_R * Math.sqrt(3) * 0.86;
    put(new THREE.BoxGeometry(len, 0.02, 0.01).rotateY(pm), MAHOG_DK, [Math.sin(pm) * ri, TOP + 0.01, Math.cos(pm) * ri]);
    put(new THREE.BoxGeometry(len, 0.003, 0.012).rotateY(pm), BRASS, [Math.sin(pm) * ri, TOP + 0.0215, Math.cos(pm) * ri]);
  }

  // rolled star chart
  {
    const ry = 0.25;
    const rr = 0.026;
    const c = new THREE.Vector3(0.0, TOP + rr, -0.05);
    const A = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
    put(new THREE.CylinderGeometry(rr, rr, 0.24, 12).rotateZ(Math.PI / 2).rotateY(ry), PAPER, c);
    for (const e of [1, -1]) {
      const ec = c.clone().addScaledVector(A, e * 0.12);
      put(new THREE.TorusGeometry(rr, 0.003, 4, 12).rotateY(Math.PI / 2 + ry), PAPER_DK, ec);
      put(orient(new THREE.CylinderGeometry(0.018, 0.018, 0.002, 12), A), NAVY, ec.clone().addScaledVector(A, e * 0.001));
      put(orient(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 8), A), PAPER_DK, ec.clone().addScaledVector(A, e * 0.002));
      put(orient(new THREE.CylinderGeometry(0.0025, 0.0025, 0.004, 5), A), STAR, ec.clone().addScaledVector(A, e * 0.001).add(new THREE.Vector3(0, 0.011, 0)));
    }
    for (const o of [-0.03, 0.03]) {
      put(new THREE.TorusGeometry(rr + 0.002, 0.003, 4, 12).rotateY(Math.PI / 2 + ry), RIBBON, c.clone().addScaledVector(A, o));
    }
    // ribbon bow tails
    const bc = c.clone().addScaledVector(A, 0.03);
    for (const sgn of [1, -1]) {
      put(new THREE.BoxGeometry(0.01, 0.002, 0.045).rotateY(ry + sgn * 0.35), RIBBON, [bc.x + sgn * 0.008, TOP + 0.001, bc.z + 0.045]);
    }
    put(new THREE.SphereGeometry(0.006, 6, 4), RIBBON, [bc.x, TOP + 0.004, bc.z + rr]);
  }

  // open sky map with constellation
  {
    const ry = -0.2;
    const cx = -0.02,
      cz = 0.08;
    const loc = (x: number, z: number, y: number): [number, number, number] => [
      cx + x * Math.cos(ry) + z * Math.sin(ry),
      y,
      cz - x * Math.sin(ry) + z * Math.cos(ry),
    ];
    put(new THREE.BoxGeometry(0.16, 0.002, 0.12).rotateY(ry), PAPER, loc(0, 0, TOP + 0.001));
    put(new THREE.BoxGeometry(0.146, 0.002, 0.106).rotateY(ry), NAVY, loc(0, 0, TOP + 0.0025));
    // curled edge
    put(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8).rotateX(Math.PI / 2).rotateY(ry), PAPER, loc(0.082, 0, TOP + 0.008));
    const dip: [number, number][] = [
      [-0.058, -0.03],
      [-0.034, -0.036],
      [-0.012, -0.026],
      [0.008, -0.018],
      [0.016, 0.006],
      [0.05, 0.012],
      [0.046, -0.016],
    ];
    const ys = TOP + 0.0038;
    const linePairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ];
    for (const [i, j] of linePairs) {
      const a = dip[i],
        c2 = dip[j];
      const mx = (a[0] + c2[0]) / 2,
        mz = (a[1] + c2[1]) / 2;
      const len = Math.hypot(c2[0] - a[0], c2[1] - a[1]);
      const ang = Math.atan2(-(c2[1] - a[1]), c2[0] - a[0]);
      put(new THREE.BoxGeometry(len, 0.0008, 0.0012).rotateY(ang + ry), LINE, loc(mx, mz, ys));
    }
    for (const [x, z] of dip) put(new THREE.CylinderGeometry(0.0035, 0.0035, 0.0015, 5), STAR, loc(x, z, ys + 0.0005));
    const small: [number, number][] = [
      [-0.06, 0.03],
      [-0.03, 0.04],
      [0.0, 0.035],
      [0.03, 0.042],
      [-0.05, 0.005],
      [0.06, -0.04],
      [-0.015, 0.015],
      [0.035, 0.028],
    ];
    for (const [x, z] of small) put(new THREE.CylinderGeometry(0.0018, 0.0018, 0.0015, 4), WHITE, loc(x, z, ys + 0.0003));
    // crescent moon
    put(new THREE.CylinderGeometry(0.009, 0.009, 0.0012, 10), STAR, loc(-0.05, -0.012 + 0.04, ys));
    put(new THREE.CylinderGeometry(0.008, 0.008, 0.0016, 10), NAVY, loc(-0.046, -0.009 + 0.04, ys + 0.0003));
  }

  // compass
  {
    const cc = new THREE.Vector3(0.13, TOP + 0.007, 0.02);
    put(new THREE.CylinderGeometry(0.025, 0.025, 0.014, 14), BRASS, cc);
    put(new THREE.TorusGeometry(0.024, 0.003, 4, 14).rotateX(Math.PI / 2), BRASS_HI, [cc.x, cc.y + 0.007, cc.z]);
    put(new THREE.CylinderGeometry(0.021, 0.021, 0.002, 14), WHITE, [cc.x, cc.y + 0.007, cc.z]);
    put(new THREE.BoxGeometry(0.004, 0.0015, 0.018).rotateY(0.4), RIBBON, [cc.x + 0.0035, cc.y + 0.0085, cc.z + 0.008]);
    put(new THREE.BoxGeometry(0.004, 0.0015, 0.018).rotateY(0.4), STEEL, [cc.x - 0.0035, cc.y + 0.0085, cc.z - 0.008]);
    put(new THREE.CylinderGeometry(0.0025, 0.0025, 0.003, 6), BRASS_HI, [cc.x, cc.y + 0.009, cc.z]);
    put(new THREE.TorusGeometry(0.007, 0.0022, 4, 8), BRASS_HI, [cc.x, cc.y + 0.004, cc.z + 0.03]);
  }

  // spare eyepiece standing on the tray
  {
    const ex = -0.17,
      ez = -0.07;
    put(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 12), BRASS, [ex, TOP + 0.025, ez]);
    put(new THREE.TorusGeometry(0.0155, 0.002, 4, 12).rotateX(Math.PI / 2), BRASS_HI, [ex, TOP + 0.02, ez]);
    put(new THREE.TorusGeometry(0.0155, 0.002, 4, 12).rotateX(Math.PI / 2), BRASS_HI, [ex, TOP + 0.03, ez]);
    put(new THREE.CylinderGeometry(0.021, 0.016, 0.025, 12), RUBBER, [ex, TOP + 0.0625, ez]);
    put(new THREE.TorusGeometry(0.019, 0.004, 4, 12).rotateX(Math.PI / 2), RUBBER, [ex, TOP + 0.075, ez]);
    put(new THREE.CylinderGeometry(0.01, 0.01, 0.002, 10), LENS_DK, [ex, TOP + 0.076, ez]);
  }

  return b.root;
}
```