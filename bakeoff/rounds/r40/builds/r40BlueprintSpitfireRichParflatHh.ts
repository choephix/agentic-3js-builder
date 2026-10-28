import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, polyline, aim, catmull, frame } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Spitfire Mk I Blueprint",
  "description": "A Supermarine Spitfire Mk I fighter in tail-down rest stance, built entirely in cyanotype blues with Prussian-blue skins, pale-blue undersides and white drafting linework picking out every panel, rivet row, control surface and roundel."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#14428a",
  skinAlt: "#1d56a8",
  skinLow: "#5f9be0",
  deep: "#071c45",
  ink: "#04122e",
  midBlue: "#1b4b94",
  lightBlue: "#2f6bbf",
  line: "#9cc7f2",
  chalk: "#cfe4fb",
  paper: "#f2f8ff",
  glass: "#a8d4ff",
  glassFrame: "#e8f3ff",
  steel: "#6fa3e0",
  steelDark: "#2a5a9e",
  exhaust: "#4a86d0",
  tyre: "#061638",
  hub: "#a9d0f5",
  propBlade: "#0a2557",
  propTip: "#f2f8ff",
  spinner: "#2f6bbf",
  roundelOuter: "#1b4b94",
  roundelWhite: "#f2f8ff",
  roundelMid: "#5f9be0",
  roundelCore: "#e8f3ff",
};
const M = {
  noseJoin: [0, 1.56, 2.3] as [number, number, number],
  spinnerBase: [0, 1.645, 3.5] as [number, number, number],
  propHub: [0, 1.66, 3.75] as [number, number, number],
  propAxis: [0, 0.07, 1] as [number, number, number],
  cockpitDeck: [0, 1.95, 0.4] as [number, number, number],
  canopyHinge: [0, 1.9, 0.8] as [number, number, number],
  wingRootL: [0.35, 1, -0.25] as [number, number, number],
  wingRootR: [-0.35, 1, -0.25] as [number, number, number],
  wingRootLE: [0.35, 1, 1] as [number, number, number],
  wingRootTE: [0.35, 1, -1.5] as [number, number, number],
  wingTipL: [5.6, 1.55, -0.55] as [number, number, number],
  wingTipR: [-5.6, 1.55, -0.55] as [number, number, number],
  gearHipL: [0.85, 0.95, 0.3] as [number, number, number],
  gearHipR: [-0.85, 0.95, 0.3] as [number, number, number],
  wheelL: [0.95, 0.35, 0.3] as [number, number, number],
  wheelR: [-0.95, 0.35, 0.3] as [number, number, number],
  tailJoin: [0, 1.17, -3.3] as [number, number, number],
  tailTip: [0, 1.05, -5] as [number, number, number],
  tailplaneRoot: [0, 1.095, -4.35] as [number, number, number],
  finRoot: [0, 1.3, -3.7] as [number, number, number],
  rudderHinge: [0, 1.3, -4.5] as [number, number, number],
  tailWheelAxle: [0, 0.1, -4.2] as [number, number, number],
  tailStrutTop: [0, 0.86, -4.15] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // nose
  (() => {
function buildNose({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const yc = (z: number) => 1.4 + 0.07 * z; // tilted fuselage axis
  const lerp = (a: number, c: number, t: number) => a + (c - a) * t;
  const fus = J.fuselage;
  const prop = J.propeller;

  const A = new THREE.Vector3().fromArray(M.propAxis).normalize();
  const hub = new THREE.Vector3().fromArray(M.propHub);
  const sBase = new THREE.Vector3().fromArray(M.spinnerBase);
  const RIGHT = V(1, 0, 0);
  const UP = new THREE.Vector3().crossVectors(A, RIGHT).normalize();
  const radial = (th: number) => UP.clone().multiplyScalar(Math.cos(th)).addScaledVector(RIGHT, Math.sin(th));

  // ------------------------------------------------------------------ cowling
  const cowlH = (z: number) => (z <= 2.9 ? lerp(1.02, 0.97, (z - 2.3) / 0.6) : lerp(0.97, 0.88, (z - 2.9) / 0.6));
  const yb = (z: number) => yc(z) - cowlH(z) / 2;

  const cowl = b.loft(
    [
      { at: [0, yc(2.3), 2.3], w: 0.9, h: 1.02 },
      { at: [0, yc(2.9), 2.9], w: 0.87, h: 0.97 },
      { at: [0, yc(3.5), 3.5], w: 0.8, h: 0.88 },
    ],
    {
      bone: fus,
      section: { ngon: 8 },
      caps: "flat",
      color: P.skin,
      sectors: [
        [132, 228, P.skinLow],
        [45, 90, P.skinAlt, 0.0, 0.5],
        [-90, -45, P.skinAlt, 0.45, 1.0],
        [-20, 20, P.skinAlt, 0.55, 0.85],
      ],
    },
  );
  const skin = b.surface(cowl);

  const sideHit = (s: number, z: number, dy: number) => skin.ray([s * 2, yc(z) + dy, z], [-s, 0, 0]);
  const topHit = (x: number, z: number) => skin.ray([x, 4, z], [0, -1, 0]);
  const lift = (h: any, d: number) => h.at.clone().addScaledVector(h.n, d);

  const seamLine = (pts: THREE.Vector3[], r: number, color: string, closed = false) =>
    b.sweep(polyline(pts, { closed }), r, { color, bone: fus });

  // Rings round the cowl: panel seams and the paper lip.
  for (const z of [2.9, 3.3]) {
    b.sweep(skin.loop([0, yc(z), z], { dir: [0, 0, 1], lift: 0.004 }), 0.007, { color: P.line, bone: fus });
  }
  b.sweep(skin.loop([0, yc(3.46), 3.46], { dir: [0, 0, 1], lift: 0.012 }), 0.024, { color: P.paper, bone: fus });

  // Dorsal seam along the cowl top.
  {
    const pts: THREE.Vector3[] = [];
    for (let z = 2.34; z <= 3.42; z += 0.08) {
      const h = topHit(0, z);
      if (h) pts.push(lift(h, 0.005));
    }
    if (pts.length > 2) seamLine(pts, 0.006, P.line);
  }

  // Dark cooling-ring face behind the spinner and a drafted ring on it.
  b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 12), P.deep, {
    at: sBase.clone().addScaledVector(A, 0.008),
    dir: A,
    bone: fus,
  });
  b.part(new THREE.TorusGeometry(0.32, 0.007, 4, 18), P.line, {
    at: sBase.clone().addScaledVector(A, 0.02),
    dir: A,
    axis: "z",
    bone: fus,
  });

  // Hinged-panel outlines and fastener studs on each flank.
  const rectOutline = (s: number, z0: number, z1: number, d0: number, d1: number) => {
    const corners: [number, number][] = [
      [z0, d0],
      [z1, d0],
      [z1, d1],
      [z0, d1],
    ];
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 4; k++) {
      const [za, da] = corners[k];
      const [zb, db] = corners[(k + 1) % 4];
      const len = Math.hypot(zb - za, db - da);
      const n = Math.max(2, Math.ceil(len / 0.06));
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const h = sideHit(s, lerp(za, zb, t), lerp(da, db, t));
        if (h) pts.push(lift(h, 0.005));
      }
    }
    if (pts.length > 3) seamLine(pts, 0.006, P.line, true);
  };
  const stud = new THREE.SphereGeometry(0.012, 5, 4);
  for (const s of [1, -1]) {
    rectOutline(s, 2.45, 3.25, 0.13, 0.29);
    rectOutline(s, 3.0, 3.38, -0.28, -0.1);
    for (const dy of [0.35, -0.16]) {
      for (let z = 2.42; z <= 3.4; z += 0.15) {
        const h = sideHit(s, z, dy);
        if (h) b.stick(stud, P.chalk, h, { embed: 0.4, bone: fus });
      }
    }
  }

  // Camouflage discs scattered on the upper surfaces.
  {
    const rr = rng(7);
    const hits = skin.scatter(14, {
      rng: rr,
      minDist: 0.11,
      filter: (h: any) =>
        h.n.y > 0.3 &&
        h.at.z < 3.35 &&
        h.at.z > 2.4 &&
        !(Math.abs(Math.abs(h.at.x) - 0.16) < 0.08 && h.at.z > 2.45),
    });
    for (const h of hits) {
      const r = 0.06 + rr() * 0.06;
      b.stick(new THREE.CylinderGeometry(r, r * 0.85, 0.014, 7), P.skinAlt, h, { embed: 0.5, bone: fus });
    }
  }

  // ------------------------------------------------------------------ exhaust stacks
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = 2.5 + i * 0.16;
      const h = sideHit(s, z, 0.05);
      if (!h) continue;
      const dir = V(s * 0.72, 0.12, -0.68).normalize();
      const base = h.at.clone().addScaledVector(V(s, 0, 0), -0.03);
      const len = 0.17 + (i % 2) * 0.02;
      const tip = base.clone().addScaledVector(dir, len);
      b.rod(base, tip, [0.026, 0.042], P.exhaust, { bone: fus, sides: 6 });
      b.rod(tip.clone().addScaledVector(dir, -0.004), tip.clone().addScaledVector(dir, 0.008), 0.033, P.deep, {
        bone: fus,
        sides: 6,
      });
    }
  }

  // ------------------------------------------------------------------ chin carburettor scoop
  b.loft(
    [
      { at: [0, yb(2.4) + 0.04, 2.4], w: 0.24, h: 0.12 },
      { at: [0, yb(2.75), 2.75], w: 0.34, h: 0.2 },
      { at: [0, yb(3.2) - 0.01, 3.2], w: 0.34, h: 0.22 },
    ],
    { bone: fus, section: "box", caps: "flat", color: P.skinLow },
  );
  {
    const my = yb(3.2) - 0.01;
    b.part(new THREE.BoxGeometry(0.26, 0.13, 0.02), P.deep, { at: [0, my, 3.205], bone: fus });
    const hw = 0.15;
    const hh = 0.085;
    const zc = 3.212;
    const c: [number, number][] = [
      [-hw, my - hh],
      [hw, my - hh],
      [hw, my + hh],
      [-hw, my + hh],
    ];
    for (let k = 0; k < 4; k++) {
      const a = c[k];
      const e = c[(k + 1) % 4];
      const dx = Math.sign(e[0] - a[0]) * 0.007;
      const dyy = Math.sign(e[1] - a[1]) * 0.007;
      b.rod([a[0] - dx, a[1] - dyy, zc], [e[0] + dx, e[1] + dyy, zc], 0.008, P.line, { bone: fus, sides: 5 });
    }
    for (const gx of [-0.07, 0, 0.07]) {
      b.rod([gx, my - 0.06, 3.216], [gx, my + 0.06, 3.216], 0.005, P.steelDark, { bone: fus, sides: 4 });
    }
  }

  // ------------------------------------------------------------------ gun-trough bulges
  for (const s of [1, -1]) {
    const x = s * 0.16;
    const h1 = topHit(x, 2.52);
    const h2 = topHit(x, 3.22);
    if (!h1 || !h2) continue;
    b.capsule(h1.at, h2.at, 0.045, P.skinAlt, { bone: fus, sides: 8 });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.ink, {
      at: h2.at.clone().add(V(0, 0.012, 0.038)),
      bone: fus,
    });
  }

  // ------------------------------------------------------------------ spinner
  const SP: [number, number][] = [
    [0, 0],
    [0.28, 0],
    [0.275, 0.06],
    [0.25, 0.2],
    [0.2, 0.35],
    [0.12, 0.5],
    [0.05, 0.6],
    [0, 0.65],
  ];
  const spinR = (y: number) => {
    for (let i = 1; i < SP.length; i++) {
      if (y <= SP[i][1]) return lerp(SP[i - 1][0], SP[i][0], (y - SP[i - 1][1]) / (SP[i][1] - SP[i - 1][1]));
    }
    return 0;
  };
  b.lathe(SP, { at: sBase, axis: A, segments: 10, color: P.spinner, bone: prop });
  // paper band near the base
  b.lathe(
    [
      [0.25, 0.08],
      [0.286, 0.08],
      [0.276, 0.14],
      [0.25, 0.14],
    ],
    { at: sBase, axis: A, segments: 10, color: P.paper, bone: prop },
  );
  for (const y of [0.3, 0.46]) {
    const r = spinR(y);
    b.lathe(
      [
        [r - 0.012, y - 0.006],
        [r + 0.007, y - 0.006],
        [r + 0.007, y + 0.006],
        [r - 0.012, y + 0.006],
      ],
      { at: sBase, axis: A, segments: 10, color: P.line, bone: prop },
    );
  }
  // meridian seams between the blades
  for (const deg of [60, 180, 300]) {
    const th = (deg * Math.PI) / 180;
    const pts: THREE.Vector3[] = [];
    for (const y of [0.15, 0.25, 0.35, 0.45, 0.55]) {
      pts.push(sBase.clone().addScaledVector(A, y).addScaledVector(radial(th), spinR(y) + 0.004));
    }
    b.sweep(polyline(pts), 0.005, { color: P.line, bone: prop, caps: "round" });
  }

  // ------------------------------------------------------------------ propeller hub
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.07, 12), P.steel, { at: hub, dir: A, bone: prop });
  for (let k = 0; k < 6; k++) {
    const th = ((k * 60 + 30) * Math.PI) / 180;
    b.part(new THREE.SphereGeometry(0.014, 5, 4), P.ink, {
      at: hub.clone().addScaledVector(A, 0.036).addScaledVector(radial(th), 0.275),
      bone: prop,
    });
  }

  // ------------------------------------------------------------------ blades
  const hwPts: [number, number][] = [
    [0.2, 0.055],
    [0.45, 0.105],
    [0.7, 0.125],
    [1.0, 0.115],
    [1.3, 0.085],
    [1.5, 0.04],
  ];
  const hw = (u: number) => {
    for (let i = 1; i < hwPts.length; i++) {
      if (u <= hwPts[i][0]) return lerp(hwPts[i - 1][1], hwPts[i][1], (u - hwPts[i - 1][0]) / (hwPts[i][0] - hwPts[i - 1][0]));
    }
    return 0.04;
  };
  const hi = (u: number) => 0.9 * hw(u);
  const lo = (u: number) => -1.1 * hw(u);
  const segs: [number, number, number, string][] = [
    [0.2, 0.62, 22, P.propBlade],
    [0.6, 1.05, 14, P.propBlade],
    [1.03, 1.32, 9, P.propBlade],
    [1.3, 1.5, 6, P.propTip],
  ];

  for (let k = 0; k < 3; k++) {
    const th = (k * 2 * Math.PI) / 3;
    const r = radial(th);
    const C = new THREE.Vector3().crossVectors(A, r).normalize();
    for (const [u0, u1, pitchDeg, col] of segs) {
      const p = (pitchDeg * Math.PI) / 180;
      const chord = C.clone().multiplyScalar(Math.cos(p)).addScaledVector(A, Math.sin(p));
      const outline: [number, number][] =
        u1 >= 1.5
          ? [
              [u0, lo(u0)],
              [1.47, -0.04],
              [1.5, -0.015],
              [1.5, 0.02],
              [1.47, 0.04],
              [u0, hi(u0)],
            ]
          : [
              [u0, lo(u0)],
              [u1, lo(u1)],
              [u1, hi(u1)],
              [u0, hi(u0)],
            ];
      b.extrude(outline, { at: hub, x: r, y: chord, thickness: 0.03, bevel: 0.006, color: col, bone: prop });
      if (u1 < 1.5) {
        const P0 = hub.clone().addScaledVector(r, u0).addScaledVector(chord, hi(u0));
        const P1 = hub.clone().addScaledVector(r, u1).addScaledVector(chord, hi(u1));
        b.rod(P0, P1, 0.007, P.line, { bone: prop, sides: 5 });
      }
    }
    // blade root collar
    b.part(new THREE.CylinderGeometry(0.08, 0.085, 0.13, 8), P.chalk, {
      at: hub.clone().addScaledVector(r, 0.3),
      dir: r,
      bone: prop,
    });
  }
}
    return buildNose;
  })(),
  // fuselage
  (() => {
function buildFuselage({ b, J, P, M }: Ctx) {
  const FUS = J.fuselage;
  const CAN = J.canopy;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rad = THREE.MathUtils.degToRad;

  // ---------------------------------------------------------------- body dimensions
  const cy = (z: number) => 1.4 + 0.07 * z;
  const ST: [number, number, number][] = [
    [M.noseJoin[2], 0.9, 1.02],
    [1.2, 0.92, 1.12],
    [0.2, 0.88, 1.15],
    [-0.8, 0.78, 1.08],
    [-2.0, 0.62, 0.9],
    [M.tailJoin[2], 0.42, 0.66],
  ];
  const dims = (z: number) => {
    if (z >= ST[0][0]) return { w: ST[0][1], h: ST[0][2] };
    for (let i = 0; i < ST.length - 1; i++) {
      if (z >= ST[i + 1][0]) {
        const t = (ST[i][0] - z) / (ST[i][0] - ST[i + 1][0]);
        return {
          w: ST[i][1] + (ST[i + 1][1] - ST[i][1]) * t,
          h: ST[i][2] + (ST[i + 1][2] - ST[i][2]) * t,
        };
      }
    }
    const l = ST[ST.length - 1];
    return { w: l[1], h: l[2] };
  };
  const apex = (z: number) => cy(z) + dims(z).h / 2;
  const shoulder = (z: number, x: number) => {
    const d = dims(z);
    return cy(z) + (d.h / 2) * Math.sqrt(Math.max(0, 1 - (x / (d.w / 2)) ** 2));
  };

  // ---------------------------------------------------------------- main loft
  const fus = b.loft(
    ST.map(([z, w, h]) => ({ at: [0, cy(z), z] as [number, number, number], w, h })),
    {
      bone: FUS,
      color: P.skin,
      sides: 12,
      sectors: [
        [92, 104, P.deep],
        [104, 256, P.skinLow],
        [256, 268, P.deep],
      ],
    } as any,
  );
  const skin = b.surface(fus);

  // ---------------------------------------------------------------- batching of tiny parts
  const makeBatch = (bone: any) => {
    const m = new Map<string, THREE.BufferGeometry[]>();
    return {
      add(color: string, g: THREE.BufferGeometry) {
        if (!g.getAttribute("uv"))
          g.setAttribute(
            "uv",
            new THREE.BufferAttribute(new Float32Array(g.getAttribute("position").count * 2), 2),
          );
        if (!m.has(color)) m.set(color, []);
        m.get(color)!.push(g);
      },
      flush() {
        for (const [color, gs] of m) {
          const merged = mergeGeometries(gs);
          if (merged) b.part(merged, color, { bone, at: [0, 0, 0], flat: true });
          else for (const g of gs) b.part(g, color, { bone, at: [0, 0, 0], flat: true });
        }
      },
    };
  };
  const fb = makeBatch(FUS);

  const boxAt = (
    color: string,
    size: [number, number, number],
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(rot[0]), rad(rot[1]), rad(rot[2])));
    g.applyMatrix4(new THREE.Matrix4().compose(V(pos[0], pos[1], pos[2]), q, V(1, 1, 1)));
    fb.add(color, g);
  };
  const geoAt = (
    color: string,
    g: THREE.BufferGeometry,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(rot[0]), rad(rot[1]), rad(rot[2])));
    g.applyMatrix4(new THREE.Matrix4().compose(V(pos[0], pos[1], pos[2]), q, V(1, 1, 1)));
    fb.add(color, g);
  };

  // ---------------------------------------------------------------- keel and dorsal seams
  b.sweep(fus.line(180, 0.004).slice(0.03, 0.97), [0.016, 0.016], {
    color: P.midBlue, sides: 5, bone: FUS, caps: "flat",
  } as any);
  b.sweep(fus.line(180, 0.012).slice(0.03, 0.97), 0.0045, {
    color: P.line, sides: 4, bone: FUS, caps: "flat",
  } as any);
  b.sweep(fus.line(0, 0.004).slice(0.01, 0.14), 0.006, { color: P.line, sides: 4, bone: FUS } as any);
  b.sweep(fus.line(0, 0.004).slice(0.64, 0.99), 0.006, { color: P.line, sides: 4, bone: FUS } as any);

  // ---------------------------------------------------------------- panel rings + rivet rows
  const rivetPos: THREE.Vector3[] = [];
  const collect = (path: any, count: number) => {
    b.along(path, count, (p: any) => {
      rivetPos.push(p.at.clone());
    });
  };
  for (const z of [1.9, 1.3, 0.7, 0.1, -0.5, -1.1, -1.7, -2.9]) {
    const lp = skin.loop(frame([0, cy(z), z], [0, 0, 1]), { lift: 0.004 });
    b.sweep(lp, 0.006, { color: P.line, sides: 4, bone: FUS } as any);
    const rl = skin.loop(frame([0, cy(z - 0.04), z - 0.04], [0, 0, 1]), { lift: 0.004 });
    collect(rl, 22);
  }

  // ---------------------------------------------------------------- hatches (draped outlines)
  const rectPts = (corners: number[][], n = 8) => {
    const out: number[][] = [];
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i];
      const c = corners[(i + 1) % corners.length];
      for (let k = 0; k < n; k++) {
        const t = k / n;
        out.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t]);
      }
    }
    return out;
  };
  const hatch = (corners: number[][], rivets: number, n = 8) => {
    const path = skin.drape(polyline(rectPts(corners, n), { closed: true }), { lift: 0.004 });
    b.sweep(path, 0.006, { color: P.line, sides: 4, bone: FUS } as any);
    collect(path, rivets);
    for (const c of corners) {
      const h = skin.nearest(c);
      fb.add(P.chalk, new THREE.OctahedronGeometry(0.016, 0).translate(
        h.at.x + h.n.x * 0.006, h.at.y + h.n.y * 0.006, h.at.z + h.n.z * 0.006));
    }
  };
  for (const s of [1, -1]) {
    const x = s * 0.6;
    hatch([[x, 1.37, 1.78], [x, 1.37, 1.3], [x, 1.62, 1.3], [x, 1.62, 1.78]], 16); // battery hatch
    hatch([[x, 1.3, -0.75], [x, 1.3, -1.3], [x, 1.56, -1.3], [x, 1.56, -0.75]], 14); // radio hatch
  }
  hatch([[0.17, 0.6, -0.55], [-0.17, 0.6, -0.55], [-0.17, 0.6, -1.25], [0.17, 0.6, -1.25]], 14); // fuel tank hatch
  hatch([[0.07, 0.6, -3.0], [-0.07, 0.6, -3.0], [-0.07, 0.6, -3.25], [0.07, 0.6, -3.25]], 8, 5); // tail wheel doors

  // ---------------------------------------------------------------- wing root fairing lines
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.55, 1.02, 1.0],
      [s * 0.55, 1.0, 0.5],
      [s * 0.55, 1.0, -0.5],
      [s * 0.55, 1.03, -1.0],
      [s * 0.55, 1.1, -1.5],
    ];
    const path = skin.drape(catmull(pts), { lift: 0.006 });
    b.sweep(path, 0.0075, { color: P.line, sides: 4, bone: FUS } as any);
    const path2 = skin.drape(catmull(pts.map((p) => [p[0], p[1] - 0.045, p[2]])), { lift: 0.004 });
    b.sweep(path2, 0.005, { color: P.chalk, sides: 4, bone: FUS } as any);
  }

  // ---------------------------------------------------------------- camouflage patches
  {
    const r = rng(11);
    const blobGeo = new THREE.SphereGeometry(1, 6, 3);
    const patches: THREE.BufferGeometry[] = [];
    const hits = skin.scatter(24, {
      rng: r,
      minDist: 0.3,
      filter: (h: any) => h.n.y > 0.4 && !(h.at.z < 1.5 && h.at.z > -1.3 && Math.abs(h.at.x) < 0.3),
    });
    for (const h of hits) {
      const q0 = aim(h.n);
      const tx = V(1, 0, 0).applyQuaternion(q0);
      const tz = V(0, 0, 1).applyQuaternion(q0);
      for (let i = 0; i < 3; i++) {
        const ox = (r() - 0.5) * 0.28;
        const oz = (r() - 0.5) * 0.34;
        const pt = h.at.clone().addScaledVector(tx, ox).addScaledVector(tz, oz);
        const nh = skin.nearest(pt);
        const q = aim(nh.n).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), r() * Math.PI));
        const pos = nh.at.clone().addScaledVector(nh.n, -0.015);
        const g = blobGeo.clone();
        g.applyMatrix4(
          new THREE.Matrix4().compose(pos, q, V(0.07 + r() * 0.12, 0.032, 0.09 + r() * 0.16)),
        );
        patches.push(g);
      }
    }
    const merged = mergeGeometries(patches);
    if (merged) b.part(merged, P.skinAlt, { bone: FUS, at: [0, 0, 0], flat: true });
  }

  // ---------------------------------------------------------------- conformed roundels
  const conform = (s: number, zc: number, yc: number, r0: number, r1: number, seg: number, lift: number) => {
    const pos: number[] = [];
    const nor: number[] = [];
    const idx: number[] = [];
    let ok = true;
    const vert = (r: number, a: number) => {
      const h = skin.ray([s * 1.6, yc + r * Math.sin(a), zc + r * Math.cos(a)], [-s, 0, 0]);
      if (!h) {
        ok = false;
        return 0;
      }
      pos.push(h.at.x + h.n.x * lift, h.at.y + h.n.y * lift, h.at.z + h.n.z * lift);
      nor.push(h.n.x, h.n.y, h.n.z);
      return pos.length / 3 - 1;
    };
    const ringIdx = (r: number) => {
      const a: number[] = [];
      for (let k = 0; k < seg; k++) a.push(vert(r, (k / seg) * Math.PI * 2));
      return a;
    };
    const tri = (i: number, j: number, k: number) => {
      const p = (n: number) => V(pos[n * 3], pos[n * 3 + 1], pos[n * 3 + 2]);
      const cr = p(j).sub(p(i)).cross(p(k).sub(p(i)));
      const nn = V(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]);
      if (cr.dot(nn) < 0) idx.push(i, k, j);
      else idx.push(i, j, k);
    };
    if (r0 === 0) {
      const c = vert(0, 0);
      const ring = ringIdx(r1);
      for (let k = 0; k < seg; k++) tri(c, ring[k], ring[(k + 1) % seg]);
    } else {
      const A = ringIdx(r0);
      const B = ringIdx(r1);
      for (let k = 0; k < seg; k++) {
        const k2 = (k + 1) % seg;
        tri(A[k], B[k], B[k2]);
        tri(A[k], B[k2], A[k2]);
      }
    }
    if (!ok) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
    g.setIndex(idx);
    return g;
  };
  const layers: [number, number, string][] = [
    [0, 0.07, P.roundelCore],
    [0.07, 0.14, P.roundelMid],
    [0.14, 0.21, P.roundelWhite],
    [0.21, 0.28, P.roundelOuter],
  ];
  for (const s of [1, -1]) {
    for (const [r0, r1, col] of layers) {
      const g = conform(s, -2.2, cy(-2.2), r0, r1, 20, 0.006);
      if (g) fb.add(col, g);
    }
  }

  // ---------------------------------------------------------------- code letters
  const GLYPH: Record<string, string[]> = {
    Q: ["111", "101", "101", "111", "011"],
    V: ["101", "101", "101", "101", "010"],
  };
  {
    const cell = 0.032;
    const text = "QV";
    const zStartFront = -1.26;
    const yTop = cy(-1.4) + 0.08;
    for (const s of [1, -1]) {
      const zStart = s > 0 ? zStartFront : zStartFront - (text.length * 4 - 1) * cell;
      for (let ci = 0; ci < text.length; ci++) {
        const gl = GLYPH[text[ci]];
        for (let row = 0; row < 5; row++)
          for (let col = 0; col < 3; col++) {
            if (gl[row][col] !== "1") continue;
            const k = (ci * 4 + col) * cell;
            const z = zStart - s * k;
            const y = yTop - row * cell;
            const h = skin.ray([s * 1.6, y, z], [-s, 0, 0]);
            if (!h) continue;
            const g = new THREE.BoxGeometry(0.014, cell * 0.92, cell * 0.92);
            g.translate(h.at.x + h.n.x * 0.002, h.at.y, h.at.z);
            fb.add(P.paper, g);
          }
      }
    }
  }

  // ---------------------------------------------------------------- radio mast + aerial
  {
    const mh = skin.ray([0, 3, -1.5], [0, -1, 0]);
    const base = mh ? mh.at.clone() : V(0, 1.68, -1.5);
    const top = V(0, base.y + 0.3, base.z - 0.05);
    boxAt(P.steelDark, [0.07, 0.03, 0.12], [0, base.y + 0.005, base.z]);
    b.rod(V(0, base.y, base.z), top, [0.016, 0.008], { color: P.steel, bone: FUS, sides: 6 } as any);
    geoAt(P.chalk, new THREE.OctahedronGeometry(0.022, 0), [top.x, top.y + 0.01, top.z]);
    const endP = V(0, 2.5, -4.7);
    const midP = V(0, (top.y + endP.y) / 2 - 0.03, (top.z + endP.z) / 2);
    b.sweep(catmull([top.toArray(), midP.toArray(), endP.toArray()]), 0.0035, {
      color: P.line, sides: 3, bone: FUS,
    } as any);
  }

  // ---------------------------------------------------------------- canopy geometry helpers
  const wb = (z: number) =>
    z > 1 ? 0.22 + (z - 1) * 0.11 : z > -0.4 ? 0.22 : Math.max(0.14, 0.22 - (-0.4 - z) * 0.1);
  const T = (z: number) =>
    z <= 0.05 ? 0.31 * Math.sqrt(Math.max(0, 1 - ((z - 0.05) / 1.28) ** 2)) : 0.31 - (0.07 * (z - 0.05)) / 0.95;
  const baseY = (z: number) => shoulder(z, wb(z)) - 0.02;
  const peakY = (z: number) => apex(z) + T(z) + 0.012;
  const archPt = (z: number, aDeg: number, s: number): [number, number, number] => {
    const a = rad(aDeg);
    const by = baseY(z);
    return [s * wb(z) * Math.cos(a), by + (peakY(z) - by) * Math.sin(a), z];
  };
  const ANG = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180];
  const hoop = (z: number, bone: any, r = 0.013) => {
    const pts = ANG.map((a) => archPt(z, a, 1));
    b.sweep(catmull(pts), r, { color: P.glassFrame, bone, sides: 5 } as any);
  };

  // windscreen (static on fuselage joint)
  {
    const zB = 1.45;
    const yb = shoulder(zB, wb(zB)) - 0.005;
    const bl: [number, number, number] = [wb(zB), yb, zB];
    const br: [number, number, number] = [-wb(zB), yb, zB];
    const tl = archPt(1.0, 62, 1);
    const tr = archPt(1.0, 62, -1);
    b.slab([bl, br, tr, tl], { color: P.glass, thickness: 0.01, bone: FUS } as any);
    for (const s of [1, -1]) {
      const bs: [number, number, number] = [s * wb(zB), yb, zB];
      b.slab([bs, archPt(1.0, 62, s), archPt(1.0, 8, s)], { color: P.glass, thickness: 0.008, bone: FUS } as any);
      b.rod(bs, archPt(1.0, 62, s), 0.012, { color: P.glassFrame, bone: FUS, sides: 5 } as any);
      b.rod(bs, archPt(1.0, 8, s), 0.012, { color: P.glassFrame, bone: FUS, sides: 5 } as any);
    }
    b.rod(bl, br, 0.012, { color: P.glassFrame, bone: FUS, sides: 5 } as any);
    b.rod([0, yb + 0.005, 1.44], [0, peakY(1.0) - 0.01, 1.0], 0.008, { color: P.glassFrame, bone: FUS, sides: 5 } as any);
    hoop(1.0, FUS, 0.014);
    // rear-view mirror
    boxAt(P.chalk, [0.008, 0.05, 0.008], [0, peakY(1.0) + 0.02, 1.0]);
    boxAt(P.paper, [0.09, 0.045, 0.012], [0, peakY(1.0) + 0.06, 1.0], [-10, 0, 0]);
  }

  // sliding canopy (on joint canopy)
  {
    for (const z of [0.55, 0.05, -0.5, -1.0]) hoop(z, CAN);
    const zs = [1.0, 0.6, 0.2, -0.2, -0.6, -1.0, -1.2];
    for (const s of [1, -1]) {
      const base = zs.map((z) => archPt(z, 0, s));
      b.sweep(catmull(base), 0.017, { color: P.glassFrame, bone: CAN, sides: 5 } as any);
      b.sweep(catmull(base.map((p) => [p[0] * 1.02, p[1] + 0.022, p[2]])), 0.006, {
        color: P.line, bone: CAN, sides: 4,
      } as any);
    }
    b.sweep(catmull(zs.map((z) => [0, peakY(z), z])), 0.012, { color: P.glassFrame, bone: CAN, sides: 5 } as any);
    b.sweep(catmull(zs.map((z) => [0, peakY(z) + 0.012, z])), 0.0045, { color: P.line, bone: CAN, sides: 4 } as any);
    const gaps = [1.0, 0.55, 0.05, -0.5, -1.0, -1.2];
    for (const s of [1, -1])
      for (let i = 0; i < gaps.length - 1; i++) {
        const z1 = gaps[i];
        const z2 = gaps[i + 1];
        const pts = [
          archPt(z1, 8, s), archPt(z1, 34, s), archPt(z1, 60, s),
          archPt(z2, 60, s), archPt(z2, 34, s), archPt(z2, 8, s),
        ];
        b.slab(pts, { color: P.glass, thickness: 0.008, bone: CAN } as any);
      }
    // canopy handle
    b.rod(archPt(0.9, 6, 1), [wb(0.9) + 0.07, baseY(0.9) + 0.03, 0.9], 0.008, { color: P.chalk, bone: CAN, sides: 4 } as any);
  }

  // ---------------------------------------------------------------- cockpit interior
  {
    const A = (z: number) => apex(z);
    // seat
    boxAt(P.midBlue, [0.34, 0.04, 0.3], [0, A(-0.12) + 0.02, -0.12]);
    boxAt(P.deep, [0.34, 0.22, 0.035], [0, A(-0.28) + 0.12, -0.28], [-12, 0, 0]);
    boxAt(P.midBlue, [0.36, 0.03, 0.04], [0, A(-0.28) + 0.015, -0.27]);
    // armoured headrest
    boxAt(P.deep, [0.27, 0.16, 0.03], [0, A(-0.45) + 0.19, -0.45], [-6, 0, 0]);
    boxAt(P.line, [0.28, 0.012, 0.034], [0, A(-0.45) + 0.275, -0.452], [-6, 0, 0]);
    boxAt(P.midBlue, [0.2, 0.06, 0.02], [0, A(-0.45) + 0.16, -0.425], [-6, 0, 0]);
    // harness straps
    for (const s of [1, -1]) boxAt(P.chalk, [0.025, 0.2, 0.006], [s * 0.07, A(-0.28) + 0.13, -0.256], [-12, 0, 0]);
    // control stick
    b.rod([0, A(0.5), 0.52], [0, A(0.5) + 0.28, 0.43], 0.012, { color: P.steel, bone: FUS, sides: 6 } as any);
    geoAt(P.ink, new THREE.SphereGeometry(0.03, 6, 4), [0, A(0.5) + 0.3, 0.425]);
    boxAt(P.chalk, [0.012, 0.012, 0.02], [0, A(0.5) + 0.31, 0.45]);
    // side consoles
    for (const s of [1, -1]) boxAt(P.deep, [0.06, 0.06, 1.1], [s * 0.19, A(0.2) + 0.0, 0.25]);
    // throttle quadrant on the left
    boxAt(P.midBlue, [0.05, 0.05, 0.2], [0.2, A(0.55) + 0.05, 0.55]);
    boxAt(P.chalk, [0.01, 0.1, 0.01], [0.2, A(0.55) + 0.1, 0.5], [-20, 0, 0]);
    geoAt(P.paper, new THREE.SphereGeometry(0.018, 6, 4), [0.2, A(0.55) + 0.145, 0.485]);
    // instrument panel with dials
    const zp = 1.29;
    const yp = A(zp) + 0.03;
    boxAt(P.deep, [0.34, 0.085, 0.03], [0, yp, zp]);
    for (const x of [-0.1, 0, 0.1]) {
      geoAt(P.paper, new THREE.TorusGeometry(0.03, 0.0055, 5, 10), [x, yp, zp - 0.017]);
      geoAt(P.ink, new THREE.CylinderGeometry(0.026, 0.026, 0.006, 10).rotateX(Math.PI / 2), [x, yp, zp - 0.016]);
      boxAt(P.chalk, [0.004, 0.022, 0.004], [x, yp + 0.008, zp - 0.02], [0, 0, 25 * (x > 0 ? 1 : x < 0 ? -1 : 0.4)]);
    }
    for (let k = 0; k < 7; k++) boxAt(P.chalk, [0.01, 0.01, 0.006], [-0.15 + k * 0.05, yp - 0.036, zp - 0.016]);
    // gunsight: ring + bead on the coaming
    const zg = 1.12;
    const yg = A(zg) + 0.115;
    boxAt(P.steelDark, [0.06, 0.02, 0.06], [0, A(zg) + 0.005, zg]);
    boxAt(P.chalk, [0.01, 0.08, 0.01], [0, A(zg) + 0.05, zg]);
    geoAt(P.chalk, new THREE.TorusGeometry(0.032, 0.004, 5, 12), [0, yg + 0.02, zg - 0.01]);
    geoAt(P.paper, new THREE.SphereGeometry(0.008, 5, 3), [0, yg + 0.02, zg - 0.01]);
    boxAt(P.glass, [0.07, 0.004, 0.004], [0, yg + 0.02, zg - 0.012]);
  }

  // ---------------------------------------------------------------- rivets and flush
  {
    const rg = new THREE.OctahedronGeometry(0.011, 0);
    for (const p of rivetPos) {
      const g = rg.clone();
      g.translate(p.x, p.y, p.z);
      fb.add(P.chalk, g);
    }
  }
  fb.flush();
}
    return buildFuselage;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P }: Ctx) {
  const V3 = THREE.Vector3;
  const v = (x: number, y: number, z: number) => new V3(x, y, z);

  // ---------------------------------------------------------------- planform tables
  const LE = [[0.35, 1.0], [2.5, 0.65], [4.5, 0.0], [5.3, -0.35], [5.45, -0.43], [5.6, -0.5]];
  const TE = [[0.35, -1.5], [2.5, -1.3], [4.5, -0.95], [5.3, -0.75], [5.45, -0.7], [5.6, -0.6]];
  const FUSE = [[-3.3, 0.21], [-2.0, 0.31], [-0.8, 0.39], [0.2, 0.44], [1.2, 0.46], [2.3, 0.45]];
  const CS = [0, 0.02, 0.06, 0.12, 0.2, 0.3, 0.45, 0.6, 0.75, 0.82, 0.9, 0.96, 1];
  const NODES = [0.35, 0.9, 2.5, 2.9, 3.0, 4.5, 5.2, 5.3, 5.45, 5.6];

  const tab = (t: number[][], x: number) => {
    if (x <= t[0][0]) return t[0][1];
    for (let i = 1; i < t.length; i++) {
      if (x <= t[i][0]) {
        const k = (x - t[i - 1][0]) / (t[i][0] - t[i - 1][0]);
        return t[i - 1][1] + k * (t[i][1] - t[i - 1][1]);
      }
    }
    return t[t.length - 1][1];
  };
  const le = (ax: number) => tab(LE, ax);
  const te = (ax: number) => tab(TE, ax);
  const thick = (ax: number) => 0.32 - 0.24 * Math.min(1, Math.max(0, (ax - 0.35) / 5.25));
  const yc = (ax: number) => 1.0 + (ax - 0.35) * 0.105;
  const foil = (c: number) => {
    const cc = Math.min(1, Math.max(0, c));
    const q = Math.sqrt(cc);
    return (0.2969 * q - 0.126 * cc - 0.3516 * cc * cc + 0.2843 * cc ** 3 - 0.1015 * cc ** 4) / 0.1;
  };
  const cOf = (ax: number, z: number) => (le(ax) - z) / (le(ax) - te(ax));

  /** point on the wing skin: ax = |x|, c = chord fraction (0 leading edge), up = top surface, lift outward */
  const pt = (s: number, ax: number, c: number, up: boolean, lift = 0) => {
    const L = le(ax);
    const z = L - c * (L - te(ax));
    const T = thick(ax);
    const f = foil(c);
    const y = up ? yc(ax) + 0.55 * T * f + lift : yc(ax) - 0.45 * T * f - lift;
    return v(s * ax, y, z);
  };
  const seat = (s: number, ax: number, c: number, up: boolean) => {
    const e = 0.02;
    const at = pt(s, ax, c, up);
    const tx = pt(s, ax + e, c, up).sub(pt(s, ax - e, c, up));
    const tc = pt(s, ax, c + e, up).sub(pt(s, ax, c - e, up));
    const n = tx.cross(tc).normalize();
    if (up ? n.y < 0 : n.y > 0) n.negate();
    return { at, n };
  };

  // ---------------------------------------------------------------- geometry helpers
  class Acc {
    p: number[] = [];
    add(a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3) {
      this.p.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
    }
    nrm(a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3) {
      return new V3().subVectors(bb, a).cross(new V3().subVectors(c, a));
    }
    up(a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, sgn: number) {
      if (this.nrm(a, bb, c).y * sgn < 0) this.add(a, c, bb);
      else this.add(a, bb, c);
    }
    out(a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, ref: THREE.Vector3) {
      const cen = a.clone().add(bb).add(c).divideScalar(3).sub(ref);
      if (this.nrm(a, bb, c).dot(cen) < 0) this.add(a, c, bb);
      else this.add(a, bb, c);
    }
    geo() {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
      g.computeVertexNormals();
      return g;
    }
    get empty() {
      return this.p.length === 0;
    }
  }
  const centroid = (pts: THREE.Vector3[]) => {
    const g = new V3();
    pts.forEach((p) => g.add(p));
    return g.divideScalar(pts.length);
  };

  type Set3 = { top: Acc; bot: Acc; edge: Acc };
  const newSet = (): Set3 => ({ top: new Acc(), bot: new Acc(), edge: new Acc() });

  function region(s: number, xa: number, xb: number, c0: number, c1: number, A: Set3) {
    const xs = [xa, ...NODES.filter((x) => x > xa + 1e-6 && x < xb - 1e-6), xb];
    const cl = CS.filter((c) => c >= c0 - 1e-6 && c <= c1 + 1e-6);
    const T = xs.map((x) => cl.map((c) => pt(s, x, c, true)));
    const B = xs.map((x) => cl.map((c) => pt(s, x, c, false)));
    const ref = centroid([...T.flat(), ...B.flat()]);
    for (let k = 0; k < xs.length - 1; k++) {
      for (let i = 0; i < cl.length - 1; i++) {
        A.top.up(T[k][i], T[k + 1][i], T[k + 1][i + 1], 1);
        A.top.up(T[k][i], T[k + 1][i + 1], T[k][i + 1], 1);
        A.bot.up(B[k][i], B[k + 1][i], B[k + 1][i + 1], -1);
        A.bot.up(B[k][i], B[k + 1][i + 1], B[k][i + 1], -1);
      }
      const last = cl.length - 1;
      A.edge.out(T[k][last], B[k][last], B[k + 1][last], ref);
      A.edge.out(T[k][last], B[k + 1][last], T[k + 1][last], ref);
      if (c0 > 0) {
        A.edge.out(T[k][0], B[k][0], B[k + 1][0], ref);
        A.edge.out(T[k][0], B[k + 1][0], T[k + 1][0], ref);
      }
    }
    for (const k of [0, xs.length - 1]) {
      const loop = [...T[k], ...B[k].slice().reverse()];
      const g = centroid(loop);
      for (let i = 0; i < loop.length; i++) A.edge.out(loop[i], loop[(i + 1) % loop.length], g, ref);
    }
  }

  function loopTube(secs: THREE.Vector3[][]) {
    const acc = new Acc();
    const ref = centroid(secs.flat());
    const m = secs[0].length;
    for (let k = 0; k < secs.length - 1; k++) {
      for (let i = 0; i < m; i++) {
        const a = secs[k][i];
        const bb = secs[k][(i + 1) % m];
        const c = secs[k + 1][(i + 1) % m];
        const d = secs[k + 1][i];
        acc.out(a, bb, c, ref);
        acc.out(a, c, d, ref);
      }
    }
    for (const sec of [secs[0], secs[secs.length - 1]])
      for (let i = 1; i < m - 1; i++) acc.out(sec[0], sec[i], sec[i + 1], ref);
    return acc.geo();
  }

  const mk = (g: THREE.BufferGeometry, color: string, bone: any) => b.part(g, color, { bone, at: [0, 0, 0] });
  const mergeAt = (gs: THREE.BufferGeometry[], color: string, bone: any) => {
    if (gs.length) mk(mergeGeometries(gs, false) as THREE.BufferGeometry, color, bone);
  };
  const line = (pts: THREE.Vector3[], color: string, bone: any, closed = false, r = 0.0065) =>
    b.sweep(polyline(pts, { closed }), r, {
      color,
      bone,
      section: { ngon: 4 },
      ...(closed ? {} : { caps: "flat" as const }),
    });

  /** closed rectangle in (span, chord-fraction) space, laid on the skin */
  const rectC = (s: number, x0: number, x1: number, c0: number, c1: number, up: boolean, lift: number) => {
    const xs = [x0, ...NODES.filter((x) => x > x0 + 1e-6 && x < x1 - 1e-6), x1];
    const cs = [c0, ...CS.filter((c) => c > c0 + 1e-6 && c < c1 - 1e-6), c1];
    const pts: THREE.Vector3[] = [];
    xs.forEach((x) => pts.push(pt(s, x, c0, up, lift)));
    cs.slice(1).forEach((c) => pts.push(pt(s, x1, c, up, lift)));
    xs.slice().reverse().slice(1).forEach((x) => pts.push(pt(s, x, c1, up, lift)));
    cs.slice().reverse().slice(1, -1).forEach((c) => pts.push(pt(s, x0, c, up, lift)));
    return pts;
  };

  const ROUND = { x: 3.4, z: -0.4 };

  const roundel = (s: number, ax: number, z: number, R: number, up: boolean, bone: any) => {
    const { at, n } = seat(s, ax, cOf(ax, z), up);
    const f = frame(at, n);
    const discs: [number, string][] = [
      [1.07, P.line],
      [1.0, P.roundelOuter],
      [0.75, P.roundelWhite],
      [0.5, P.roundelMid],
      [0.25, P.roundelCore],
    ];
    discs.forEach(([k, col], i) =>
      b.stick(new THREE.CylinderGeometry(R * k, R * k, 0.03, 16), col, f.moved([0, 0.004 * i, 0]), {
        embed: 0.5,
        bone,
      }),
    );
  };

  const blob = (r: () => number, rx: number, rz: number): [number, number][] => {
    const n = 8;
    const ph = r() * 6.28;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const k = 1 + 0.3 * Math.sin(3 * a + ph) + 0.18 * (r() - 0.5);
      return [Math.cos(a) * rx * k, Math.sin(a) * rz * k] as [number, number];
    });
  };

  // ---------------------------------------------------------------- one wing
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const wb = J["wing" + sd];
    const ab = J["aileron" + sd];
    const fb = J["flap" + sd];
    const r = rng(s > 0 ? 21 : 57);

    // --- skins
    const main = newSet();
    const spans: [number, number, number][] = [
      [0.35, 0.9, 1],
      [0.9, 2.9, 0.75],
      [2.9, 3.0, 1],
      [3.0, 5.2, 0.75],
      [5.2, 5.6, 1],
    ];
    spans.forEach(([xa, xb, c1]) => region(s, xa, xb, 0, c1, main));
    mk(main.top.geo(), P.skin, wb);
    mk(main.bot.geo(), P.skinLow, wb);
    mk(main.edge.geo(), P.deep, wb);

    const ail = newSet();
    region(s, 3.0, 5.2, 0.75, 1, ail);
    mk(ail.top.geo(), P.skinAlt, ab);
    mk(ail.bot.geo(), P.skinLow, ab);
    mk(ail.edge.geo(), P.deep, ab);

    const flp = newSet();
    region(s, 0.9, 2.9, 0.75, 1, flp);
    mk(flp.top.geo(), P.lightBlue, fb);
    mk(flp.bot.geo(), P.skinLow, fb);
    mk(flp.edge.geo(), P.deep, fb);

    // --- root fillets
    for (const up of [true, false]) {
      const secs: THREE.Vector3[][] = [];
      const N = 8;
      for (let i = 0; i <= N; i++) {
        const t = 0.05 + (0.9 * i) / N;
        const z = 0.88 - t * 2.26;
        const g = Math.pow(Math.sin(Math.PI * t), 0.5);
        const wf = tab(FUSE, z);
        const xin = wf - 0.05;
        const xout = wf + 0.06 + 0.16 * g;
        const yAt = (x: number) => pt(s, x, Math.min(0.97, Math.max(0.03, cOf(x, z))), up).y;
        const sg = up ? 1 : -1;
        secs.push([
          v(s * xin, yAt(xin) - 0.02 * sg, z),
          v(s * xout, yAt(xout) + 0.003 * sg, z),
          v(s * xin, yAt(xin) + (up ? 0.12 : 0.09) * g * sg, z),
        ]);
      }
      mk(loopTube(secs), up ? P.skin : P.skinLow, wb);
    }

    // --- camouflage patches (top)
    for (let i = 0; i < 8; i++) {
      const ax = 0.8 + i * 0.56 + (r() - 0.5) * 0.15;
      const c = 0.3 + 0.28 * r();
      const chord = le(ax) - te(ax);
      const rz = Math.min(0.1 + 0.2 * r(), chord * 0.13);
      const rx = 0.28 + 0.18 * r();
      const outline = blob(r, rx, rz);
      const { at, n } = seat(s, ax, c, true);
      if (Math.hypot(ax - ROUND.x, at.z - ROUND.z) < 0.75) continue;
      const xd = v(1, 0, 0).addScaledVector(n, -n.x).normalize();
      const yd = n.clone().cross(xd);
      b.extrude(outline, {
        at: at.clone().addScaledVector(n, 0.002),
        x: xd,
        y: yd,
        thickness: 0.014,
        smoothing: 1,
        color: P.skinAlt,
        bone: wb,
      });
    }

    // --- roundels
    roundel(s, ROUND.x, ROUND.z, 0.45, true, wb);
    roundel(s, 4.2, -0.4, 0.26, false, wb);

    // --- top rib seams
    const RIBC = [0.12, 0.2, 0.3, 0.45, 0.6, 0.74];
    for (let x = 0.5; x <= 5.01; x += 0.5) {
      line(RIBC.map((c) => pt(s, x, c, true, 0.003)), P.line, wb);
    }
    // spanwise seams
    const SPAN = [0.45, 0.9, 2.5, 2.9, 3.0, 4.5, 5.2, 5.3];
    for (const c of [0.12, 0.3, 0.6]) line(SPAN.map((x) => pt(s, x, c, true, 0.003)), P.line, wb);

    // --- rivet rows
    const rivets: THREE.BufferGeometry[] = [];
    for (const c of [0.2, 0.45, 0.6]) {
      for (let x = 0.5; x <= 5.1; x += 0.14) {
        const p = pt(s, x, c, true, 0.003);
        if (Math.hypot(x - ROUND.x, p.z - ROUND.z) < 0.5) continue;
        rivets.push(new THREE.OctahedronGeometry(0.011, 0).translate(p.x, p.y, p.z));
      }
    }
    mergeAt(rivets, P.chalk, wb);

    // --- gun-bay panel, hatches, walkway
    line(rectC(s, 1.4, 2.7, 0.14, 0.42, true, 0.003), P.line, wb, true);
    line(rectC(s, 3.9, 4.4, 0.2, 0.4, true, 0.003), P.line, wb, true);
    line(rectC(s, 0.5, 0.85, 0.3, 0.7, true, 0.003), P.chalk, wb, true, 0.005);

    // --- gun muzzles
    for (const ax of [1.6, 1.9, 2.2, 2.5]) {
      const L = le(ax);
      const y = yc(ax);
      const x = s * ax;
      b.rod([x, y, L - 0.04], [x, y, L + 0.014], 0.03, P.line, { bone: wb, sides: 8, caps: "flat" });
      b.rod([x, y, L - 0.05], [x, y, L + 0.07], 0.019, P.ink, { bone: wb, sides: 8, caps: "flat" });
    }

    // --- underside details
    for (const x of [1.5, 3.5, 4.7]) line(RIBC.map((c) => pt(s, x, c, false, 0.003)), P.line, wb);
    for (const c of [0.3, 0.6]) {
      line([0.45, 0.9, 2.5, 2.9, 3.0, 4.5, 5.2].map((x) => pt(s, x, c, false, 0.003)), P.line, wb);
    }
    const slots: THREE.BufferGeometry[] = [];
    for (const x of [1.3, 1.55, 1.8, 2.7]) {
      const p = pt(s, x, 0.2, false, 0);
      slots.push(new THREE.BoxGeometry(0.1, 0.01, 0.035).translate(p.x, p.y, p.z));
    }
    mergeAt(slots, P.ink, wb);

    // wheel well
    {
      const { at, n } = seat(s, 0.95, 0.29, false);
      const xd = v(1, 0, 0).addScaledVector(n, -n.x).normalize();
      const yd = n.clone().cross(xd);
      b.extrude(
        [[-0.3, -0.48], [0.3, -0.48], [0.3, 0.48], [-0.3, 0.48]],
        { at: at.clone().addScaledVector(n, 0.003), x: xd, y: yd, thickness: 0.012, color: P.deep, bone: wb },
      );
      line(rectC(s, 0.6, 1.3, 0.07, 0.51, false, 0.012), P.line, wb, true);
      line([0.12, 0.2, 0.3, 0.45].map((c) => pt(s, 0.95, c, false, 0.012)), P.line, wb);
    }

    // --- aileron detail
    line(rectC(s, 3.0, 5.2, 0.765, 0.97, true, 0.003), P.paper, ab, true);
    for (const x of [3.4, 3.8, 4.2, 4.6, 5.0]) {
      b.rod(pt(s, x, 0.78, true, 0.003), pt(s, x, 0.955, true, 0.003), 0.005, P.paper, {
        bone: ab,
        section: { ngon: 4 },
        caps: "flat",
      });
    }
    mergeAt(
      [3.4, 4.2, 4.9].map((x) => {
        const p = pt(s, x, 0.75, true, 0.004);
        return new THREE.BoxGeometry(0.08, 0.012, 0.07).translate(p.x, p.y, p.z);
      }),
      P.paper,
      ab,
    );

    // --- flap detail
    line(rectC(s, 0.9, 2.9, 0.765, 0.97, true, 0.003), P.paper, fb, true);
    for (const x of [1.3, 1.7, 2.1, 2.5]) {
      b.rod(pt(s, x, 0.78, true, 0.003), pt(s, x, 0.955, true, 0.003), 0.005, P.paper, {
        bone: fb,
        section: { ngon: 4 },
        caps: "flat",
      });
    }
    mergeAt(
      [1.2, 2.0, 2.7].map((x) => {
        const p = pt(s, x, 0.75, true, 0.004);
        return new THREE.BoxGeometry(0.08, 0.012, 0.07).translate(p.x, p.y, p.z);
      }),
      P.paper,
      fb,
    );

    // --- nav light bead
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.paper, {
      bone: wb,
      at: [s * 5.57, yc(5.6), -0.55],
    });

    // --- radiator (right) / oil cooler (left)
    if (s < 0) {
      const cx = -2.2;
      const zc = -0.15;
      const yy = 1.04;
      b.part(new THREE.BoxGeometry(0.62, 0.3, 0.8), P.steelDark, { bone: wb, at: [cx, yy, zc] });
      b.part(new THREE.BoxGeometry(0.5, 0.2, 0.016), P.deep, { bone: wb, at: [cx, 1.01, zc + 0.406] });
      const slat: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 5; k++)
        slat.push(new THREE.BoxGeometry(0.48, 0.007, 0.012).translate(cx, 0.94 + 0.035 * k, zc + 0.416));
      mergeAt(slat, P.line, wb);
      line(
        [
          v(cx - 0.265, 0.905, zc + 0.415),
          v(cx + 0.265, 0.905, zc + 0.415),
          v(cx + 0.265, 1.115, zc + 0.415),
          v(cx - 0.265, 1.115, zc + 0.415),
        ],
        P.line,
        wb,
        true,
        0.006,
      );
      b.part(new THREE.BoxGeometry(0.5, 0.015, 0.22), P.steel, {
        bone: wb,
        at: [cx, 0.9, zc - 0.47],
        rotation: [-25, 0, 0],
      });
      for (const dx of [-0.31, 0.31])
        b.rod([cx + dx, 0.89, zc - 0.4], [cx + dx, 0.89, zc + 0.4], 0.006, P.line, {
          bone: wb,
          section: { ngon: 4 },
          caps: "flat",
        });
    } else {
      const cx = 3.0;
      const yy = 1.16;
      b.rod([cx, yy, -0.55], [cx, yy, 0.12], 0.18, P.steelDark, { bone: wb, sides: 10, caps: "flat" });
      b.spike([cx, yy, -0.55], [0, 0, -1], 0.3, 0.18, { color: P.steelDark, bone: wb, sides: 10 });
      b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.03, 12), P.deep, {
        bone: wb,
        at: [cx, yy, 0.115],
        dir: [0, 0, 1],
      });
      b.part(new THREE.TorusGeometry(0.16, 0.009, 4, 14), P.line, {
        bone: wb,
        at: [cx, yy, 0.13],
        dir: [0, 0, 1],
        axis: "z",
      });
      b.part(new THREE.TorusGeometry(0.18, 0.007, 4, 14), P.line, {
        bone: wb,
        at: [cx, yy, -0.2],
        dir: [0, 0, 1],
        axis: "z",
      });
      const sl: THREE.BufferGeometry[] = [];
      for (const dx of [-0.07, 0, 0.07]) sl.push(new THREE.BoxGeometry(0.012, 0.25, 0.012).translate(cx + dx, yy, 0.138));
      mergeAt(sl, P.line, wb);

      // pitot tube under the left wing
      const L = le(4.1);
      b.rod([4.1, 1.38, L - 0.05], [4.1, 1.3, L + 0.08], 0.012, P.steel, { bone: wb, sides: 6, caps: "flat" });
      b.rod([4.1, 1.3, L + 0.05], [4.1, 1.3, L + 0.5], 0.01, P.steel, { bone: wb, sides: 6, caps: "flat" });
      b.part(new THREE.SphereGeometry(0.02, 6, 4), P.paper, { bone: wb, at: [4.1, 1.3, L + 0.51] });
    }
  }
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: any) {
  const fus = J.fuselage;
  const cy = (z: number) => 1.4 + 0.07 * z;
  type P2 = [number, number];

  // ---------- helpers ----------
  const lerpTable = (tbl: P2[], v: number) => {
    if (v <= tbl[0][0]) return tbl[0][1];
    for (let i = 1; i < tbl.length; i++) {
      if (v <= tbl[i][0]) {
        const [a, fa] = tbl[i - 1];
        const [c, fc] = tbl[i];
        return fa + ((fc - fa) * (v - a)) / (c - a);
      }
    }
    return tbl[tbl.length - 1][1];
  };
  const shrink = (pts: P2[], ku: number, kv: number): P2[] => {
    const cu = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cv = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return pts.map(([u, v]) => [cu + (u - cu) * ku, cv + (v - cv) * kv] as P2);
  };
  const line3 = (pts: any[], r: number, color: string, bone: any, closed = false) =>
    b.sweep(polyline(pts, { closed }), r, { color, bone, sides: 5 });
  const studGeo = (arr: THREE.BufferGeometry[], p: number[], r = 0.008) =>
    arr.push(new THREE.SphereGeometry(r, 5, 3).translate(p[0], p[1], p[2]));
  const flush = (arr: THREE.BufferGeometry[], color: string, bone: any) => {
    if (arr.length) b.part(mergeGeometries(arr), color, { bone, at: [0, 0, 0] });
  };

  // ---------- (1) tail cone ----------
  const cone = b.loft(
    [
      { at: [0, cy(-3.28), -3.28], w: 0.42, h: 0.66 },
      { at: [0, cy(-3.8), -3.8], w: 0.34, h: 0.56 },
      { at: [0, cy(-4.3), -4.3], w: 0.26, h: 0.46 },
      { at: [0, cy(-5.0), -5.0], w: 0.14, h: 0.28 },
    ],
    {
      bone: fus,
      color: P.skin,
      sectors: [[125, 235, P.skinLow]],
      caps: { start: "flat", end: "flat" },
      smooth: false,
      sides: 8,
    },
  );
  const coneT = (z: number) => (-3.28 - z) / 1.72;
  const cp = (t: number, deg: number, lift = 0.003) => cone.at(t, deg, lift).at;

  // paper cap on the tail tip
  b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.04, 10), P.paper, {
    bone: fus,
    at: [0, cy(-5.0), -4.99],
    dir: [0, 0.07, -1],
    scale: [0.5, 1, 1],
  });

  // seam rings and rivet crowns
  const studsFus: THREE.BufferGeometry[] = [];
  for (const z of [-3.6, -4.15, -4.7]) {
    const t = coneT(z);
    const ring: any[] = [];
    for (let a = 0; a < 360; a += 30) ring.push(cp(t, a));
    b.sweep(catmull(ring, { closed: true }), 0.0055, { color: P.line, bone: fus, sides: 5 });
    for (const dt of [-0.035, 0.035]) {
      for (let a = -120; a <= 120; a += 30) studGeo(studsFus, cp(t + dt, a, 0.002).toArray(), 0.006);
    }
  }
  // longitudinal seams
  for (const a of [0, 90, 270, 180]) {
    b.sweep(cone.line(a, 0.003), 0.0045, { color: a === 180 ? P.chalk : P.line, bone: fus, sides: 4 });
  }
  // rivet rows along side seams
  for (let t = 0.06; t < 0.95; t += 0.07) {
    for (const a of [78, 102, 258, 282]) studGeo(studsFus, cp(t, a, 0.002).toArray(), 0.006);
  }
  // access hatches
  const hatch = (t0: number, t1: number, a0: number, a1: number) => {
    const pts: any[] = [];
    for (let i = 0; i <= 4; i++) pts.push(cp(t0, a0 + ((a1 - a0) * i) / 4));
    for (let i = 1; i <= 4; i++) pts.push(cp(t0 + ((t1 - t0) * i) / 4, a1));
    for (let i = 1; i <= 4; i++) pts.push(cp(t1, a1 + ((a0 - a1) * i) / 4));
    for (let i = 1; i <= 3; i++) pts.push(cp(t1 + ((t0 - t1) * i) / 4, a0));
    line3(pts, 0.0045, P.paper, fus, true);
  };
  hatch(0.28, 0.42, 62, 118);
  hatch(0.28, 0.42, 242, 298);
  // camouflage patches on cone
  const patchGeo = new THREE.SphereGeometry(1, 8, 5);
  const patches: [number, number, number[]][] = [
    [0.2, 25, [0.07, 0.02, 0.2]],
    [0.52, -35, [0.05, 0.018, 0.18]],
    [0.78, 18, [0.035, 0.014, 0.12]],
    [0.4, 80, [0.04, 0.016, 0.16]],
  ];
  for (const [t, a, s] of patches) b.stick(patchGeo, P.skinAlt, cone.at(t, a), { embed: 0.55, scale: s });
  // underside nav-light bead
  b.part(new THREE.SphereGeometry(0.024, 6, 4), P.paper, { bone: fus, at: cp(0.91, 180, 0.004) });
  b.part(new THREE.TorusGeometry(0.03, 0.005, 4, 8), P.line, {
    bone: fus,
    at: cp(0.91, 180, 0.0),
    dir: [0, 1, 0],
    axis: "z",
  });

  // ---------- (2) fin ----------
  const finPts: P2[] = [
    [-3.3, 1.15],
    [-3.3, 1.36],
    [-3.45, 1.56],
    [-3.65, 1.82],
    [-3.9, 2.1],
    [-4.12, 2.31],
    [-4.32, 2.44],
    [-4.47, 2.495],
    [-4.55, 2.49],
    [-4.595, 2.45],
    [-4.496, 1.3],
    [-4.496, 1.15],
  ];
  b.extrude(finPts, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, color: P.skin, bone: fus });
  // fin flash bands
  const finTop = (z: number) =>
    lerpTable(
      [
        [-4.6, 2.45],
        [-4.47, 2.495],
        [-4.32, 2.44],
        [-4.12, 2.31],
        [-3.9, 2.1],
        [-3.65, 1.82],
      ].reverse() as P2[] as any,
      z,
    );
  // table must be ascending in key: use negated z
  const finTopY = (z: number) =>
    lerpTable(
      [
        [3.65, 1.82],
        [3.9, 2.1],
        [4.12, 2.31],
        [4.32, 2.44],
        [4.47, 2.495],
      ],
      -z,
    );
  void finTop;
  const bands: [number, number, string][] = [
    [-3.98, -4.1, P.roundelOuter],
    [-4.1, -4.22, P.roundelWhite],
    [-4.22, -4.34, P.roundelMid],
  ];
  for (const [z0, z1, c] of bands) {
    b.extrude(
      [
        [z0, 1.45],
        [z1, 1.45],
        [z1, finTopY(z1) - 0.06],
        [z0, finTopY(z0) - 0.06],
      ],
      { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.072, color: c, bone: fus },
    );
  }
  // fin outline lines + hinge line + rivets
  const finIn = shrink(finPts, 0.94, 0.97);
  for (const s of [1, -1]) {
    line3(
      finIn.map(([z, y]) => [s * 0.0375, y, z]),
      0.0042,
      P.line,
      fus,
      true,
    );
    b.rod([s * 0.0375, 1.32, -4.49], [s * 0.0375, 2.44, -4.585], 0.0042, P.paper, { bone: fus, sides: 4 });
    for (const [z0, z1] of [
      [-3.98, -4.34],
    ]) {
      b.rod([s * 0.0375, 1.45, z0], [s * 0.0375, 1.45, z1], 0.0035, P.chalk, { bone: fus, sides: 4 });
    }
  }
  const leLine = polyline(finPts.slice(1, 9).map(([z, y]) => [0, y, z]));
  for (let i = 0; i <= 14; i++) {
    const p = leLine.at(i / 14);
    for (const s of [1, -1]) studGeo(studsFus, [s * 0.0355, p.y - 0.04, p.z - 0.045], 0.007);
  }
  for (let y = 1.4; y < 2.4; y += 0.1) {
    const z = -4.496 - (0.099 * (y - 1.3)) / 1.15 - 0.025;
    for (const s of [1, -1]) studGeo(studsFus, [s * 0.0355, y, z], 0.007);
  }
  // dark slot at rudder hinge
  b.rod([0, 1.3, -4.5], [0, 2.45, -4.6], 0.008, P.deep, { bone: fus, sides: 4 });
  // aerial pin on fin top
  b.rod([0, 2.46, -4.54], [0, 2.54, -4.54], 0.008, P.steel, { bone: fus, sides: 4 });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), P.paper, { bone: fus, at: [0, 2.55, -4.54] });

  // ---------- (3) rudder ----------
  const rud = J.rudder;
  const rudPts: P2[] = [
    [-4.508, 1.12],
    [-4.508, 1.3],
    [-4.608, 2.44],
    [-4.72, 2.48],
    [-4.86, 2.44],
    [-4.95, 2.32],
    [-4.985, 1.95],
    [-5.0, 1.5],
    [-5.0, 1.12],
  ];
  b.extrude(rudPts, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, color: P.skinAlt, bone: rud });
  // trim tab
  b.extrude(
    [
      [-4.88, 1.55],
      [-5.005, 1.55],
      [-5.005, 1.85],
      [-4.88, 1.85],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.066, color: P.lightBlue, bone: rud },
  );
  const zHinge = (y: number) =>
    lerpTable(
      [
        [1.12, -4.508],
        [1.3, -4.508],
        [2.44, -4.608],
      ],
      y,
    );
  const zTrail = (y: number) =>
    lerpTable(
      [
        [1.12, -5.0],
        [1.5, -5.0],
        [1.95, -4.985],
        [2.32, -4.95],
        [2.44, -4.9],
      ],
      y,
    );
  const rudIn = shrink(rudPts, 0.9, 0.97);
  const studsRud: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    line3(
      rudIn.map(([z, y]) => [s * 0.0315, y, z]),
      0.0042,
      P.paper,
      rud,
      true,
    );
    for (const y of [1.6, 1.85, 2.1, 2.3]) {
      b.rod([s * 0.0315, y, zHinge(y) - 0.02], [s * 0.0315, y, zTrail(y) + 0.015], 0.0038, P.paper, {
        bone: rud,
        sides: 4,
      });
    }
    b.rod([s * 0.0345, 1.55, -4.88], [s * 0.0345, 1.85, -4.88], 0.0035, P.paper, { bone: rud, sides: 4 });
    for (let y = 1.3; y < 2.4; y += 0.1) studGeo(studsRud, [s * 0.0305, y, zHinge(y) - 0.03], 0.007);
    for (let y = 1.25; y < 2.3; y += 0.12) studGeo(studsRud, [s * 0.0305, y, zTrail(y) + 0.03], 0.006);
  }
  // aerial eyelet
  b.rod([0, 2.45, -4.7], [0, 2.5, -4.7], 0.007, P.steel, { bone: rud, sides: 4 });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), P.chalk, { bone: rud, at: [0, 2.505, -4.7] });

  // ---------- (4) tailplane ----------
  const leTbl: P2[] = [
    [0, -3.75],
    [0.6, -3.8],
    [1.0, -3.9],
    [1.3, -4.03],
    [1.46, -4.2],
    [1.5, -4.4],
  ];
  const teTbl: P2[] = [
    [0, -4.9],
    [0.6, -4.88],
    [1.0, -4.82],
    [1.3, -4.75],
    [1.46, -4.6],
    [1.5, -4.4],
  ];
  const zh = (x: number) => {
    const le = lerpTable(leTbl, x);
    const te = lerpTable(teTbl, x);
    return le + 0.65 * (te - le);
  };
  const fixed: P2[] = [];
  for (const [x, z] of [...leTbl].reverse()) fixed.push([-x, z]);
  for (const [x, z] of leTbl.slice(1)) fixed.push([x, z]);
  fixed.push([1.488, zh(1.5) - 0.055 + 0.004]);
  for (const x of [1.46, 1.3, 1.0, 0.6, 0, -0.6, -1.0, -1.3, -1.46]) fixed.push([x, zh(Math.abs(x)) + 0.004]);
  fixed.push([-1.488, zh(1.5) - 0.055 + 0.004]);
  const TP = { at: [0, 1.095, 0], x: [1, 0, 0], y: [0, 0, 1] };
  b.extrude(fixed, { ...TP, thickness: 0.06, color: P.skin, bone: fus });
  b.extrude(shrink(fixed, 0.992, 0.992), {
    ...TP,
    at: [0, 1.087, 0],
    thickness: 0.05,
    color: P.skinLow,
    bone: fus,
  });
  // top outline and rivets
  line3(
    shrink(fixed, 0.985, 0.94).map(([x, z]) => [x, 1.1285, z]),
    0.004,
    P.line,
    fus,
    true,
  );
  for (const x of [-1.46, -1.3, -1.0, -0.6, 0, 0.6, 1.0, 1.3, 1.46]) void x;
  for (let x = -1.35; x <= 1.36; x += 0.15) {
    if (Math.abs(x) < 0.14) continue;
    const ax = Math.abs(x);
    studGeo(studsFus, [x, 1.128, lerpTable(leTbl, ax) - 0.045], 0.0065);
    studGeo(studsFus, [x, 1.128, zh(ax) + 0.035], 0.0065);
  }
  // deep slot along the elevator hinge
  line3(
    [-1.46, -1.0, -0.5, 0, 0.5, 1.0, 1.46].map((x) => [x, 1.095, zh(Math.abs(x))]),
    0.007,
    P.deep,
    fus,
  );
  // camouflage patches on top
  const pA: P2[] = [
    [0.55, -3.95],
    [0.8, -3.93],
    [1.05, -4.02],
    [1.1, -4.15],
    [0.9, -4.2],
    [0.7, -4.14],
    [0.5, -4.08],
  ];
  const pB: P2[] = [
    [-0.5, -3.97],
    [-0.75, -3.94],
    [-0.95, -4.05],
    [-1.05, -4.18],
    [-0.8, -4.2],
    [-0.6, -4.12],
  ];
  b.extrude(pA, { at: [0, 1.128, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, smoothing: 2, color: P.skinAlt, bone: fus });
  b.extrude(pB.slice().reverse(), {
    at: [0, 1.128, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.012,
    smoothing: 2,
    color: P.skinAlt,
    bone: fus,
  });
  // bracing struts
  for (const s of [1, -1]) {
    b.rod([s * 0.04, 1.5, -3.8], [s * 0.8, 1.13, -4.1], 0.011, P.line, { bone: fus, sides: 5 });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.chalk, { bone: fus, at: [s * 0.04, 1.5, -3.8] });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.chalk, { bone: fus, at: [s * 0.8, 1.13, -4.1] });
  }

  // elevators
  for (const s of [1, -1]) {
    const bone = s > 0 ? J.elevatorL : J.elevatorR;
    const xs = [0.1, 0.6, 1.0, 1.3, 1.46];
    let el: P2[] = xs.map((x) => [x, zh(x) - 0.004] as P2);
    el.push([1.488, zh(1.5) - 0.055 - 0.004]);
    for (const x of [1.46, 1.3, 1.0, 0.6, 0.1]) el.push([x, lerpTable(teTbl, x)]);
    el = el.map(([x, z]) => [x * s, z] as P2);
    if (s < 0) el.reverse();
    b.extrude(el, { ...TP, thickness: 0.056, color: P.skinAlt, bone });
    b.extrude(shrink(el, 0.992, 0.992), { ...TP, at: [0, 1.089, 0], thickness: 0.05, color: P.skinLow, bone });
    const top = 1.095 + 0.029;
    line3(
      shrink(el, 0.97, 0.88).map(([x, z]) => [x, top, z]),
      0.004,
      P.paper,
      bone,
      true,
    );
    for (const x of [0.3, 0.55, 0.8, 1.05, 1.28]) {
      b.rod([s * x, top, zh(x) - 0.03], [s * x, top, lerpTable(teTbl, x) + 0.03], 0.0036, P.paper, {
        bone,
        sides: 4,
      });
    }
    const studsEl: THREE.BufferGeometry[] = [];
    for (let x = 0.2; x <= 1.4; x += 0.15) {
      studGeo(studsEl, [s * x, top, zh(x) - 0.05], 0.0065);
      studGeo(studsEl, [s * x, top, lerpTable(teTbl, x) + 0.05], 0.0065);
    }
    flush(studsEl, P.chalk, bone);
  }

  flush(studsFus, P.chalk, fus);
  flush(studsRud, P.chalk, rud);

  // ---------- (5) tail wheel ----------
  const ts = J.tailStrut;
  const tw = J.tailWheel;
  const top3 = M.tailStrutTop;
  const ax3 = M.tailWheelAxle;
  b.rod(top3, [0, 0.3, -4.19], 0.02, P.steel, { bone: ts, sides: 6 });
  b.rod([0, 0.86, -4.15], [0, 0.6, -4.17], 0.034, P.steelDark, { bone: ts, sides: 6 });
  b.part(new THREE.TorusGeometry(0.036, 0.006, 4, 8), P.paper, {
    bone: ts,
    at: [0, 0.6, -4.17],
    dir: [0, 1, 0.1],
    axis: "z",
  });
  for (const s of [1, -1]) {
    b.rod([0, 0.3, -4.19], [s * 0.047, ax3[1], ax3[2]], 0.013, P.steelDark, { bone: ts, sides: 5 });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.014, 8), P.steelDark, {
      bone: tw,
      at: [s * 0.056, ax3[1], ax3[2]],
      dir: [1, 0, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), P.tyre, { bone: tw, at: ax3, dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.064, 16), P.midBlue, { bone: tw, at: ax3, dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.068, 10), P.hub, { bone: tw, at: ax3, dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.072, 8), P.paper, { bone: tw, at: ax3, dir: [1, 0, 0] });
  const studsW: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let a = 0; a < 6; a++) {
      const an = (a / 6) * Math.PI * 2;
      studGeo(studsW, [s * 0.035, ax3[1] + 0.037 * Math.cos(an), ax3[2] + 0.037 * Math.sin(an)], 0.005);
    }
  flush(studsW, P.ink, tw);
  // tread ticks on the tyre
  const ticks: THREE.BufferGeometry[] = [];
  for (let a = 0; a < 16; a++) {
    const an = (a / 16) * Math.PI * 2 + Math.PI / 16;
    const g = new THREE.BoxGeometry(0.062, 0.012, 0.012);
    g.rotateX(-an);
    g.translate(0, ax3[1] + 0.1 * Math.cos(an), ax3[2] + 0.1 * Math.sin(an));
    ticks.push(g);
  }
  flush(ticks, P.line, tw);
}
    return buildTail;
  })(),
  // undercarriage
  (() => {
function buildUndercarriage({ b, J, P, M }: Ctx) {
  const D = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Bake a geometry into model space (rotation in degrees, XYZ, then translation).
  const mk = (g: THREE.BufferGeometry, p: number[], r: number[] = [0, 0, 0]) => {
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(p[0], p[1], p[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D, r[1] * D, r[2] * D)),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    return g;
  };
  // One part per bone and colour for small repeated pieces.
  const addMerged = (list: THREE.BufferGeometry[], color: string, bone: any) => {
    if (!list.length) return;
    const g = mergeGeometries(list, false);
    if (g) b.part(g, color, { bone, at: [0, 0, 0], flat: true });
  };

  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const gear = J["gear" + side];
    const wheel = J["wheel" + side];
    const C = V(...(M["wheel" + side] as [number, number, number]));
    const H = V(...(M["gearHip" + side] as [number, number, number]));

    // ------------------------------------------------------------------ wheel
    const tyreProfile = [
      [0.2, -0.08],
      [0.3, -0.08],
      [0.34, -0.055],
      [0.35, -0.03],
      [0.35, 0.03],
      [0.34, 0.055],
      [0.3, 0.08],
      [0.2, 0.08],
      [0.2, -0.08],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    b.part(new THREE.LatheGeometry(tyreProfile, 16), P.tyre, {
      bone: wheel,
      at: [C.x, C.y, C.z],
      rotation: [0, 0, 90],
      flat: true,
    });

    const bands: THREE.BufferGeometry[] = [];
    const hubs: THREE.BufferGeometry[] = [];
    const rings: THREE.BufferGeometry[] = [];
    const lines: THREE.BufferGeometry[] = [];
    const studs: THREE.BufferGeometry[] = [];
    for (const e of [1, -1]) {
      const wx = C.x + e * 0;
      bands.push(mk(new THREE.CylinderGeometry(0.285, 0.285, 0.004, 16), [wx + e * 0.0815, C.y, C.z], [0, 0, 90]));
      hubs.push(mk(new THREE.CylinderGeometry(0.185, 0.185, 0.014, 16), [wx + e * 0.086, C.y, C.z], [0, 0, 90]));
      hubs.push(mk(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 12), [wx + e * 0.097, C.y, C.z], [0, 0, 90]));
      rings.push(mk(new THREE.TorusGeometry(0.085, 0.009, 5, 16), [wx + e * 0.1, C.y, C.z], [0, 90, 0]));
      lines.push(mk(new THREE.TorusGeometry(0.165, 0.004, 4, 20), [wx + e * 0.0935, C.y, C.z], [0, 90, 0]));
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + 0.26;
        studs.push(
          mk(
            new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6),
            [wx + e * 0.099, C.y + Math.cos(a) * 0.14, C.z + Math.sin(a) * 0.14],
            [0, 0, 90],
          ),
        );
      }
    }
    // tread-notch ticks: at the 16 tyre vertices and the 16 face centres
    for (let k = 0; k < 32; k++) {
      const phi = k * 11.25;
      const rad = k % 2 === 0 ? 0.348 : 0.3435;
      lines.push(
        mk(
          new THREE.BoxGeometry(0.06, 0.012, 0.03),
          [C.x, C.y + Math.cos(phi * D) * rad, C.z + Math.sin(phi * D) * rad],
          [phi, 0, 0],
        ),
      );
    }
    addMerged(bands, P.midBlue, wheel);
    addMerged(hubs, P.hub, wheel);
    addMerged(rings, P.paper, wheel);
    addMerged(lines, P.line, wheel);
    addMerged(studs, P.ink, wheel);
    // tube valve stem on the inboard sidewall
    b.part(new THREE.CylinderGeometry(0.008, 0.01, 0.05, 6), P.steel, {
      bone: wheel,
      at: [C.x - s * 0.098, C.y + 0.25 * Math.cos(0.5), C.z + 0.25 * Math.sin(0.5)],
      rotation: [0, 0, 90],
    });

    // ------------------------------------------------------------------ leg
    const F = V(s * 1.085, 0.47, H.z);
    const dv = F.clone().sub(H);
    const len = dv.length();
    const u = dv.clone().normalize();
    const Q = (m: number) => V(H.x + u.x * m, H.y + u.y * m, H.z);
    const nOut = V(-u.y * s, u.x * s, 0).normalize(); // outward, perpendicular to the leg in the XY plane
    nOut.set(s * Math.abs(u.y), Math.abs(u.x), 0).normalize();
    const zh = V(0, 0, 1);
    const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number | number[], col: string, sides = 6) =>
      b.rod(a, c, r as any, col, { bone: gear, sides });

    // hinge fitting at the wing
    b.part(new THREE.BoxGeometry(0.2, 0.07, 0.24), P.deep, { bone: gear, at: [s * 0.86, 0.895, H.z] });
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 8), P.steelDark, {
      bone: gear,
      at: [s * 0.86, 0.872, H.z],
      rotation: [90, 0, 0],
    });
    const bolts: THREE.BufferGeometry[] = [];
    for (const zz of [0.122, -0.122])
      for (const dx of [-0.06, 0.06])
        bolts.push(mk(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 6), [s * 0.86 + dx, 0.895, H.z + zz], [90, 0, 0]));
    addMerged(bolts, P.chalk, gear);

    // oleo upper cylinder, collar, rings, piston
    rod(Q(0.03), Q(0.3), [0.05, 0.046], P.steel, 8);
    rod(Q(0.295), Q(0.325), 0.06, P.steelDark, 8);
    for (const m of [0.1, 0.2]) rod(Q(m), Q(m + 0.009), 0.05 - 0.005 * (m / 0.3) + 0.004, P.line, 8);
    rod(Q(0.31), Q(len), 0.03, P.paper, 8);
    rod(Q(0.45), Q(0.46), 0.036, P.line, 8);

    // fork on the outboard side
    const B = V(s * 1.077, C.y, C.z);
    b.part(new THREE.BoxGeometry(0.075, 0.06, 0.09), P.steelDark, { bone: gear, at: [F.x, F.y - 0.01, F.z] });
    for (const zz of [0.032, -0.032]) {
      rod(V(F.x, F.y - 0.03, F.z + zz), V(B.x, B.y + 0.015, B.z + zz * 1.9), 0.022, P.steelDark);
    }
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), P.steelDark, {
      bone: gear,
      at: [B.x + s * 0.0, B.y, B.z],
      rotation: [0, 0, 90],
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 6), P.paper, {
      bone: gear,
      at: [B.x + s * 0.024, B.y, B.z],
      rotation: [0, 0, 90],
    });

    // scissor torque link on the front face
    const T0 = Q(0.26).add(V(0, 0, 0.055));
    const T1 = Q(0.44).add(V(0, 0, 0.034));
    const TP = Q(0.35).add(V(0, 0, 0.125));
    rod(T0, TP, 0.011, P.line, 5);
    rod(T1, TP, 0.011, P.line, 5);
    for (const p of [T0, T1])
      b.part(new THREE.SphereGeometry(0.015, 6, 4), P.steelDark, { bone: gear, at: [p.x, p.y, p.z] });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), P.paper, { bone: gear, at: [TP.x, TP.y, TP.z] });

    // brake line down the rear face to the drum
    const brakePts = [
      V(s * 0.885, 0.9, 0.225),
      Q(0.1).add(V(0, 0, -0.062)),
      Q(0.28).add(V(0, 0, -0.062)),
      Q(0.38).add(V(0, 0, -0.046)),
      Q(0.48).add(V(0, 0, -0.06)),
      V(s * 1.065, 0.4, 0.185),
    ];
    b.sweep(catmull(brakePts), 0.008, { color: P.line, bone: gear, sides: 5 });
    for (const p of [brakePts[0], brakePts[5]])
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.paper, { bone: gear, at: [p.x, p.y, p.z] });
    // retraction jack
    const jackTop = V(s * 0.72, 0.9, 0.24);
    const jackEnd = Q(0.2).add(V(-s * Math.abs(u.y) * 0.05, -Math.abs(u.x) * 0.05, -0.0));
    rod(jackTop, jackEnd, 0.014, P.steelDark, 6);
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.steel, { bone: gear, at: [jackEnd.x, jackEnd.y, jackEnd.z] });

    // ------------------------------------------------------------------ outer wheel-well door (skinLow)
    const Cd = Q(0.22).add(nOut.clone().multiplyScalar(0.062));
    b.part(new THREE.BoxGeometry(0.012, 0.5, 0.22), P.skinLow, {
      bone: gear,
      at: [Cd.x, Cd.y, Cd.z],
      dir: [u.x, u.y, u.z],
    });
    const off = nOut.clone().multiplyScalar(0.0085);
    const corner = (a: number, c: number) =>
      Cd.clone().addScaledVector(u, a * 0.25).addScaledVector(zh, c * 0.11).add(off);
    const cs = [corner(1, 1), corner(1, -1), corner(-1, -1), corner(-1, 1)];
    for (let i = 0; i < 4; i++) rod(cs[i], cs[(i + 1) % 4], 0.0055, P.line, 5);
    // hinge brackets joining the door to the leg
    for (const m of [0.08, 0.38])
      rod(Q(m), Q(m).add(nOut.clone().multiplyScalar(0.058)), 0.012, P.steelDark, 5);
    // door rivets
    const rv: THREE.BufferGeometry[] = [];
    const zrot = Math.atan2(-nOut.x, nOut.y) / D;
    for (let k = -3; k <= 3; k++)
      for (const zz of [-0.088, 0.088]) {
        const p = Cd.clone().addScaledVector(u, k * 0.065).addScaledVector(zh, zz).add(off);
        rv.push(mk(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 6), [p.x, p.y, p.z], [0, 0, zrot]));
      }
    addMerged(rv, P.chalk, gear);

    // ------------------------------------------------------------------ inner door (skin), hung near the fuselage
    const ix = s * 0.58;
    b.part(new THREE.BoxGeometry(0.012, 0.3, 0.36), P.skin, { bone: gear, at: [ix, 0.75, H.z] });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 6), P.deep, {
      bone: gear,
      at: [ix, 0.905, H.z],
      rotation: [90, 0, 0],
    });
    const ox = ix + s * 0.0095;
    const ic = [
      V(ox, 0.9, H.z + 0.18),
      V(ox, 0.9, H.z - 0.18),
      V(ox, 0.6, H.z - 0.18),
      V(ox, 0.6, H.z + 0.18),
    ];
    for (let i = 0; i < 4; i++) rod(ic[i], ic[(i + 1) % 4], 0.0055, P.line, 5);
    const rv2: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 5; k++)
      for (const zz of [-0.16, 0.16])
        rv2.push(mk(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 6), [ox, 0.86 - k * 0.055, H.z + zz], [0, 0, -90 * s]));
    for (let k = -2; k <= 2; k++)
      rv2.push(mk(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 6), [ox, 0.64, H.z + k * 0.06], [0, 0, -90 * s]));
    addMerged(rv2, P.chalk, gear);
    // door arm from fitting down to the inner door
    rod(V(s * 0.8, 0.88, H.z - 0.06), V(ix, 0.8, H.z - 0.13), 0.011, P.steelDark, 5);
  }
}
    return buildUndercarriage;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "spitfireBlueprint" });
  const J: Record<string, Joint> = {};
  J["fuselage"] = b.joint("fuselage", { at: [0,1.45,0], dir: [0,0,-1], role: "spine" });
  J["canopy"] = b.joint("canopy", { parent: J["fuselage"], at: [0,1.9,0.8], dir: [0,0,-1], role: "hinge", group: "fuselage" });
  J["propeller"] = b.joint("propeller", { parent: J["fuselage"], at: [0,1.66,3.75], dir: [0,0.07,1], role: "hinge", group: "nose" });
  J["wingL"] = b.joint("wingL", { parent: J["fuselage"], at: [0.35,1,-0.25], dir: [1,0.1,0], role: "wing", group: "wings" });
  J["wingR"] = b.joint("wingR", { parent: J["fuselage"], at: [-0.35,1,-0.25], dir: [-1,0.1,0], role: "wing", group: "wings" });
  J["aileronL"] = b.joint("aileronL", { parent: J["wingL"], at: [3,1.28,-1.05], dir: [1,0.1,-0.1], role: "hinge", group: "wings" });
  J["aileronR"] = b.joint("aileronR", { parent: J["wingR"], at: [-3,1.28,-1.05], dir: [-1,0.1,-0.1], role: "hinge", group: "wings" });
  J["flapL"] = b.joint("flapL", { parent: J["wingL"], at: [0.9,1.06,-1.35], dir: [1,0.1,0], role: "hinge", group: "wings" });
  J["flapR"] = b.joint("flapR", { parent: J["wingR"], at: [-0.9,1.06,-1.35], dir: [-1,0.1,0], role: "hinge", group: "wings" });
  J["elevatorL"] = b.joint("elevatorL", { parent: J["fuselage"], at: [0.2,1.09,-4.55], dir: [1,0,0], role: "hinge", group: "tail" });
  J["elevatorR"] = b.joint("elevatorR", { parent: J["fuselage"], at: [-0.2,1.09,-4.55], dir: [-1,0,0], role: "hinge", group: "tail" });
  J["rudder"] = b.joint("rudder", { parent: J["fuselage"], at: [0,1.3,-4.5], dir: [0,1,-0.05], role: "hinge", group: "tail" });
  J["gearL"] = b.joint("gearL", { parent: J["wingL"], at: [0.85,0.95,0.3], dir: [0.1,-1,0], role: "leg", group: "gear" });
  J["gearR"] = b.joint("gearR", { parent: J["wingR"], at: [-0.85,0.95,0.3], dir: [-0.1,-1,0], role: "leg", group: "gear" });
  J["wheelL"] = b.joint("wheelL", { parent: J["gearL"], at: [0.95,0.35,0.3], dir: [1,0,0], role: "hinge", group: "gear" });
  J["wheelR"] = b.joint("wheelR", { parent: J["gearR"], at: [-0.95,0.35,0.3], dir: [-1,0,0], role: "hinge", group: "gear" });
  J["tailStrut"] = b.joint("tailStrut", { parent: J["fuselage"], at: [0,0.86,-4.15], dir: [0,-1,0], role: "leg", group: "tail" });
  J["tailWheel"] = b.joint("tailWheel", { parent: J["tailStrut"], at: [0,0.1,-4.2], dir: [1,0,0], role: "hinge", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
