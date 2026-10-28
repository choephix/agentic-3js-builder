import * as THREE from "three";
import { createBuilder, type Builder, type Joint, limb, bezier, rng, aim } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A folk-art log hut with a carved, painted roof, perched on two huge scaly chicken legs, with a skull-topped fence, a ladder and a glowing window."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  log: "#a8672f",
  logDark: "#7a4420",
  logEnd: "#d9a05b",
  roof: "#3f7f6e",
  roofDark: "#2b5a50",
  carveRed: "#c8322b",
  carveYellow: "#f2b632",
  carveTeal: "#2f9aa0",
  cream: "#f4e6c4",
  legYellow: "#e8b53a",
  legDark: "#b07d1e",
  claw: "#5a3a1a",
  window: "#ffcf5c",
  bone: "#efe8d2",
  skullGlow: "#7dff9a",
  dark: "#2a1a12",
  ground: "#5b6b3a",
  wood: "#8a5628",
};
const M = {
  hutFloor: [0, 1.5, 0] as [number, number, number],
  legHipL: [0.7, 1.5, 0] as [number, number, number],
  legHipR: [-0.7, 1.5, 0] as [number, number, number],
  doorFront: [0, 2, 1.1] as [number, number, number],
  porchDeck: [0, 1.55, 1.45] as [number, number, number],
  eaveLine: [0, 3, 0] as [number, number, number],
  ridge: [0, 3.6, 0] as [number, number, number],
  groundPad: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const LIGHT = "#f6d36b"; // my own pale-yellow for raised scale plates
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  // A thin ring whose axis is local +Y, so it wraps around whatever bone/tangent it is aimed along.
  const ringGeo = (R: number, tube: number, sides = 10) =>
    new THREE.TorusGeometry(R, tube, 4, sides).rotateX(Math.PI / 2);
  const plateGeo = new THREE.OctahedronGeometry(0.05, 0).scale(1, 0.45, 1.15);
  const hubGeo = new THREE.SphereGeometry(0.115, 10, 8);
  const kneeGeo = new THREE.SphereGeometry(0.165, 10, 8);
  const knuckleGeo = new THREE.SphereGeometry(0.072, 8, 6);

  // Feather outline: a pointed, rounded-shoulder teardrop, drawn along +y.
  const featherOutline = (len: number, wid: number): ([number, number] | [number, number, "sharp"])[] => [
    [0, 0],
    [wid, 0.18 * len],
    [wid * 0.85, 0.62 * len],
    [0, len, "sharp"],
    [-wid * 0.85, 0.62 * len],
    [-wid, 0.18 * len],
  ];

  const thighR = (u: number) => 0.2 - 0.06 * u;
  const shinR = (s: number) => (s < 0.85 ? 0.13 - 0.047 * (s / 0.85) : 0.083 + 0.02 * ((s - 0.85) / 0.15));

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = s > 0 ? J.hipL : J.hipR;
    const hipArr = s > 0 ? M.legHipL : M.legHipR;
    const H = V(hipArr[0], hipArr[1], hipArr[2]);
    const A = V(hipArr[0] * 1.07, 0.13, 0.0); // ankle / heel hub, planted

    // Knee bends forward, shin runs back down to the heel.
    const pts = limb(H, [A.x, A.y, A.z], [0.8, 0.8], [[0, 0, 1]]);
    const K = V(pts[1].x, pts[1].y, pts[1].z);

    const shin = b.chain(`legs${side}Leg`, [K, A], {
      parent: hipJ,
      names: [`knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [A.x, 0, A.z],
    });
    const kneeJ = shin.joints[0];
    const ankleJ = shin.joints[1];

    const L1 = H.distanceTo(K);
    const L2 = K.distanceTo(A);
    const tk = L1 / (L1 + L2);

    // One skinned tube: thick thigh, knee, slim scaly shin, flared heel.
    b.sweep([H, K, A], (t: number) => (t < tk ? thighR(t / tk) : shinR((t - tk) / (1 - tk))), {
      bone: [hipJ, shin],
      color: P.legYellow,
      sides: 8,
      caps: { start: "flat", end: "round" },
      sectors: [[125, 235, P.legDark]],
    });

    // Knee knob and heel hub.
    b.part(kneeGeo, P.legYellow, { at: K, bone: kneeJ, flat: true });
    b.part(hubGeo, P.legYellow, { at: A, bone: ankleJ, flat: true });

    // Thigh feather pantaloons: overlapping teardrop feathers in red and cream.
    const a = K.clone().sub(H).normalize();
    const e1 = V(1, 0, 0).addScaledVector(a, -a.x).normalize();
    const e2 = a.clone().cross(e1).normalize();
    const layers = [
      { u: 0.07, len: 0.36, wid: 0.072, col: P.carveRed, ph: 0 },
      { u: 0.25, len: 0.31, wid: 0.068, col: P.cream, ph: 0.5 },
      { u: 0.45, len: 0.27, wid: 0.062, col: P.carveRed, ph: 0 },
      { u: 0.64, len: 0.23, wid: 0.056, col: P.cream, ph: 0.5 },
    ];
    const N = 8;
    for (const L of layers) {
      for (let i = 0; i < N; i++) {
        const phi = ((i + L.ph) / N) * Math.PI * 2;
        const radial = e1.clone().multiplyScalar(Math.cos(phi)).addScaledVector(e2, Math.sin(phi));
        const base = H.clone().addScaledVector(a, L.u * L1).addScaledVector(radial, thighR(L.u) * 0.9);
        const dirY = a.clone().multiplyScalar(0.85).addScaledVector(radial, 0.5).normalize();
        const dirX = a.clone().cross(radial).normalize();
        b.extrude(featherOutline(L.len, L.wid), {
          at: base,
          x: dirX,
          y: dirY,
          thickness: 0.024,
          smoothing: 1,
          color: L.col,
          bone: hipJ,
        });
      }
    }
    // Dark band just above the knee.
    b.part(ringGeo(thighR(0.9) * 1.1, 0.016), P.legDark, {
      at: H.clone().addScaledVector(a, 0.9 * L1),
      dir: a,
      bone: hipJ,
    });

    // Scale-ring bands (legDark) and raised plates (pale yellow) down the shin.
    for (const sT of [0.15, 0.39, 0.61, 0.83]) {
      b.part(ringGeo(shinR(sT) * 1.09, 0.014), P.legDark, { frame: shin.at(sT) });
    }
    for (const sT of [0.27, 0.5, 0.72]) {
      b.ring(shin.at(sT), { count: 4, radius: shinR(sT) * 0.95, fromDeg: -70, toDeg: 70 }, (item) =>
        b.stick(plateGeo, LIGHT, item, { embed: 0.35 }),
      );
    }

    // Heel spur at the back of the ankle.
    b.spike(A.clone().add(V(0, 0.07, -0.08)), [0, 0.35, -1], 0.2, 0.045, {
      color: P.claw,
      bone: ankleJ,
      sides: 6,
    });

    // Toes: three forward, one rear. Each lies flat on the floor.
    const toes = [
      { yaw: -28, len: 0.88 },
      { yaw: 0, len: 1.0 },
      { yaw: 28, len: 0.88 },
      { yaw: 180, len: 0.5 },
    ];
    toes.forEach((toe, k) => {
      const yaw = (toe.yaw * Math.PI) / 180;
      const d = V(Math.sin(yaw), 0, Math.cos(yaw));
      const S = A.clone().addScaledVector(d, 0.05);
      S.y = 0.082;
      const Mi = S.clone().addScaledVector(d, toe.len * 0.5);
      Mi.y = 0.068;
      const T = S.clone().addScaledVector(d, toe.len);
      T.y = 0.055;
      const nm = `legsToe${side}${k}`;
      const chain = b.chain(nm, [S, Mi, T], {
        parent: ankleJ,
        role: "digit",
        names: [`${nm}a`, `${nm}b`, `${nm}c`],
      });
      const tipJ = chain.joints[chain.joints.length - 1];
      b.sweep(chain, (t: number) => 0.082 - 0.03 * t, { color: P.legYellow, sides: 8 });
      for (const t of [0.2, 0.75]) {
        b.part(ringGeo((0.082 - 0.03 * t) * 1.1 + 0.002, 0.012, 8), P.legDark, { frame: chain.at(t) });
      }
      // Knuckle ball at the middle joint.
      b.part(knuckleGeo, P.legDark, { at: Mi, bone: chain.joints[1], flat: true });
      // Curved claw tipping the toe and gripping the ground.
      const T0 = T.clone().addScaledVector(d, -0.02);
      const p1 = T.clone().addScaledVector(d, 0.12).add(V(0, 0.015, 0));
      const p2 = T.clone().addScaledVector(d, 0.23).add(V(0, -0.038, 0));
      b.sweep(bezier(T0, p1, p2), [0.05, 0], {
        color: P.claw,
        bone: tipJ,
        sides: 6,
        caps: { start: "none", end: "point" },
      });
    });
  }
}
    return buildLegs;
  })(),
  // cabin
  (() => {
function buildCabin({ b, J, P, M }: any) {
  const hut = J.hut;
  const IRON = "#3c3c46";
  const WS = 1.055; // wall surface (log crest) distance from the centre line on all four walls
  const PI = Math.PI;
  const R = rng(11);

  // ---------------------------------------------------------------------------------------------
  // Door joint (hinge on the model's right edge of the door)
  const doorJ = b.joint("cabinDoor", {
    parent: hut,
    at: [-0.36, 2.15, WS + 0.03],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------------------------
  // Batching: every piece is placed in model space and merged per bone + colour
  const batches = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  type Eul = [number, number, number];
  const ANG: Record<string, number> = { f: 0, px: PI / 2, b: PI, nx: -PI / 2 };

  const put = (color: string, geo: THREE.BufferGeometry, pos: [number, number, number], ang = 0, eul: Eul = [0, 0, 0], bone: any = hut) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    const m = new THREE.Matrix4()
      .makeTranslation(pos[0], pos[1], pos[2])
      .multiply(new THREE.Matrix4().makeRotationY(ang))
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(eul[0], eul[1], eul[2])));
    g.applyMatrix4(m);
    const key = `${bone.name}|${color}`;
    let bt = batches.get(key);
    if (!bt) batches.set(key, (bt = { bone, color, geos: [] }));
    bt.geos.push(g);
  };
  // wall-local placement: u along the wall, v up, d out of the wall
  const W = (wl: string, color: string, geo: THREE.BufferGeometry, u: number, v: number, d: number, eul: Eul = [0, 0, 0], bone: any = hut) => {
    const a = ANG[wl];
    put(color, geo, [u * Math.cos(a) + d * Math.sin(a), v, -u * Math.sin(a) + d * Math.cos(a)], a, eul, bone);
  };

  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cy = (r: number, h: number, seg = 8) => new THREE.CylinderGeometry(r, r, h, seg);
  // box on a wall, `off` = distance of its back face past the wall surface
  const B = (wl: string, color: string, w: number, h: number, dp: number, u: number, v: number, off: number, bone: any = hut) =>
    W(wl, color, bx(w, h, dp), u, v, WS + off + dp / 2, [0, 0, 0], bone);
  // disc facing out of a wall
  const D = (wl: string, color: string, r: number, h: number, u: number, v: number, off: number, seg = 10, bone: any = hut) =>
    W(wl, color, cy(r, h, seg), u, v, WS + off + h / 2, [PI / 2, 0, 0], bone);

  const prism = (pts: number[][], t: number) => {
    const s = new THREE.Shape();
    pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
    g.translate(0, 0, -t / 2);
    return g;
  };
  const Pz = (wl: string, color: string, pts: number[][], t: number, u: number, v: number, off: number, eul: Eul = [0, 0, 0], bone: any = hut) =>
    W(wl, color, prism(pts, t), u, v, WS + off + t / 2, eul, bone);

  // a strip of triangular teeth hanging from y = 0
  const zigGeo = (w: number, n: number, depth: number, t: number) => {
    const pw = w / n;
    const val = depth * 0.18;
    const pts: number[][] = [[-w / 2, 0], [w / 2, 0], [w / 2, -val]];
    for (let i = n - 1; i >= 0; i--) {
      const x0 = -w / 2 + i * pw;
      pts.push([x0 + pw / 2, -depth], [x0, -val]);
    }
    return prism(pts, t);
  };

  // ---------------------------------------------------------------------------------------------
  // Floor slab, joists
  put(P.wood, bx(2.3, 0.06, 2.1), [0, 1.57, 0]);
  for (const z of [-0.7, 0, 0.7]) {
    put(P.logDark, cy(0.045, 2.4, 6), [0, 1.545, z], 0, [0, 0, PI / 2]);
    for (const sx of [1, -1]) put(P.logEnd, cy(0.038, 0.02, 6), [sx * 1.205, 1.545, z], 0, [0, 0, PI / 2]);
  }
  // yellow zigzag skirt hanging under the slab edge
  for (const [wl, wd, n, d] of [["f", 2.3, 20, 1.06], ["b", 2.3, 20, 1.06], ["px", 2.0, 18, 1.16], ["nx", 2.0, 18, 1.16]] as [string, number, number, number][])
    W(wl, P.carveYellow, zigGeo(wd, n, 0.085, 0.012), 0, 1.598, d);

  // ---------------------------------------------------------------------------------------------
  // Log walls
  const rL = 0.105;
  const logEnd = (pos: [number, number, number], axis: "x" | "z", sgn: number) => {
    const eul: Eul = axis === "x" ? [0, 0, PI / 2] : [PI / 2, 0, 0];
    const p = (extra: number): [number, number, number] =>
      axis === "x" ? [pos[0] + sgn * extra, pos[1], pos[2]] : [pos[0], pos[1], pos[2] + sgn * extra];
    put(P.logEnd, cy(0.1, 0.02, 8), p(0.002), 0, eul);
    put(P.logDark, cy(0.06, 0.026, 6), p(0.004), 0, eul);
  };
  for (let i = 0; i < 7; i++) {
    const y = 1.7 + 0.2 * i;
    const col = i % 2 ? P.logDark : P.log;
    for (const z of [0.95, -0.95]) {
      put(col, cy(rL, 2.4, 8), [0, y, z], 0, [0, 0, PI / 2]);
      for (const sx of [1, -1]) logEnd([sx * 1.2, y, z], "x", sx);
    }
  }
  for (let i = 0; i < 6; i++) {
    const y = 1.8 + 0.2 * i;
    const col = i % 2 ? P.log : P.logDark;
    for (const x of [0.95, -0.95]) {
      put(col, cy(rL, 2.2, 8), [x, y, 0], 0, [PI / 2, 0, 0]);
      for (const sz of [1, -1]) logEnd([x, y, sz * 1.1], "z", sz);
    }
  }
  // top plates under the roof
  for (const x of [0.95, -0.95]) put(P.logDark, bx(0.2, 0.1, 2.2), [x, 2.95, 0]);

  // knots
  for (let i = 0; i < 12; i++) {
    const wl = ["f", "b", "px", "nx"][i % 4];
    const sides = wl === "px" || wl === "nx";
    const u = (R() * 2 - 1) * 0.85;
    if (wl === "f" && Math.abs(u) < 0.55) continue;
    const v = sides ? 1.8 : R() > 0.5 ? 1.7 : 1.9;
    D(wl, P.logDark, 0.03, 0.012, u, v, 0.004, 7);
    D(wl, P.claw, 0.014, 0.014, u, v, 0.006, 6);
  }

  // ---------------------------------------------------------------------------------------------
  // Carved zigzag cornice on every wall
  const cornice = (wl: string, wd: number, n: number) => {
    B(wl, P.carveRed, wd, 0.06, 0.05, 0, 2.94, 0);
    W(wl, P.carveTeal, zigGeo(wd, n, 0.09, 0.03), 0, 2.91, WS + 0.015);
    const pw = wd / n;
    for (let i = 0; i <= n; i++) D(wl, P.carveYellow, 0.014, 0.012, -wd / 2 + i * pw, 2.875, 0.03, 6);
  };
  cornice("f", 2.3, 20);
  cornice("b", 2.3, 20);
  cornice("px", 2.0, 18);
  cornice("nx", 2.0, 18);

  // ---------------------------------------------------------------------------------------------
  // Side windows with teal shutters, sill flower boxes and carved pelmets
  const windowSet = (wl: string) => {
    B(wl, P.carveRed, 0.66, 0.66, 0.06, 0, 2.3, 0);
    B(wl, P.window, 0.5, 0.5, 0.04, 0, 2.3, 0.03);
    B(wl, P.dark, 0.035, 0.5, 0.03, 0, 2.3, 0.07);
    B(wl, P.dark, 0.5, 0.035, 0.03, 0, 2.3, 0.07);
    for (const su of [1, -1]) for (const sv of [1, -1]) D(wl, P.carveYellow, 0.02, 0.012, su * 0.3, 2.3 + sv * 0.3, 0.06, 6);
    // sill + flowers
    B(wl, P.carveTeal, 0.82, 0.06, 0.14, 0, 1.955, 0);
    for (let i = 0; i < 5; i++) {
      const u = -0.3 + i * 0.15;
      W(wl, i % 2 ? P.carveYellow : P.carveRed, new THREE.SphereGeometry(0.036, 6, 4), u, 2.02, WS + 0.09);
      W(wl, P.carveTeal, new THREE.ConeGeometry(0.025, 0.07, 4), u + 0.05, 2.0, WS + 0.07);
    }
    // shutters
    for (const s of [1, -1]) {
      const u = s * 0.49;
      B(wl, P.carveTeal, 0.26, 0.66, 0.035, u, 2.3, 0);
      B(wl, P.dark, 0.26, 0.03, 0.012, u, 2.58, 0.035);
      B(wl, P.dark, 0.26, 0.03, 0.012, u, 2.02, 0.035);
      D(wl, P.carveYellow, 0.058, 0.01, u, 2.45, 0.035);
      D(wl, P.carveRed, 0.032, 0.01, u, 2.45, 0.045);
      D(wl, P.carveRed, 0.075, 0.01, u, 2.22, 0.035, 4);
      D(wl, P.cream, 0.035, 0.01, u, 2.22, 0.045, 4);
      D(wl, P.cream, 0.014, 0.01, u, 2.1, 0.035, 6);
    }
    // carved pelmet
    Pz(wl, P.carveRed, [[-0.62, 0], [0.62, 0], [0, 0.16]], 0.05, 0, 2.64, 0);
    Pz(wl, P.carveYellow, [[-0.44, 0.02], [0.44, 0.02], [0, 0.12]], 0.015, 0, 2.64, 0.05);
    D(wl, P.carveTeal, 0.026, 0.012, 0, 2.69, 0.065, 8);
  };
  windowSet("px");
  windowSet("nx");

  // ---------------------------------------------------------------------------------------------
  // Round window at the back
  {
    const wl = "b";
    W(wl, P.carveRed, new THREE.TorusGeometry(0.27, 0.05, 6, 12), 0, 2.3, WS + 0.04);
    D(wl, P.window, 0.23, 0.04, 0, 2.3, 0.01, 12);
    B(wl, P.dark, 0.03, 0.46, 0.03, 0, 2.3, 0.05);
    B(wl, P.dark, 0.46, 0.03, 0.03, 0, 2.3, 0.05);
    for (let k = 0; k < 8; k++) {
      const a = (k * PI) / 4;
      Pz(wl, k % 2 ? P.carveTeal : P.carveYellow, [[-0.045, 0.31], [0.045, 0.31], [0, 0.45]], 0.025, 0, 2.3, 0.01, [0, 0, a]);
      const a2 = a + PI / 8;
      D(wl, P.cream, 0.017, 0.012, -Math.sin(a2) * 0.37, 2.3 + Math.cos(a2) * 0.37, 0.01, 6);
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Front: door (hinged on cabinDoor), red frame, hinges, handle, peephole
  {
    const wl = "f";
    // frame
    for (const s of [1, -1]) {
      B(wl, P.carveRed, 0.09, 1.22, 0.07, s * 0.405, 2.21, 0);
      for (let i = 0; i < 6; i++) D(wl, P.carveYellow, 0.014, 0.012, s * 0.405, 1.75 + i * 0.18, 0.07, 6);
    }
    B(wl, P.carveRed, 1.0, 0.12, 0.08, 0, 2.76, 0);
    B(wl, P.carveTeal, 0.88, 0.045, 0.01, 0, 2.76, 0.08);
    for (let i = 0; i < 5; i++) D(wl, P.carveYellow, 0.016, 0.012, -0.36 + i * 0.18, 2.76, 0.09, 6);

    // door leaf, on the door joint
    B(wl, P.wood, 0.72, 1.1, 0.05, 0, 2.15, 0, doorJ);
    for (const u of [-0.18, 0, 0.18]) B(wl, P.logDark, 0.012, 1.08, 0.012, u, 2.15, 0.05, doorJ);
    // peephole
    D(wl, P.carveTeal, 0.105, 0.02, 0, 2.45, 0.05, 10, doorJ);
    D(wl, P.window, 0.075, 0.02, 0, 2.45, 0.058, 10, doorJ);
    B(wl, P.dark, 0.012, 0.15, 0.012, 0, 2.45, 0.076, doorJ);
    B(wl, P.dark, 0.15, 0.012, 0.012, 0, 2.45, 0.076, doorJ);
    // hinge straps
    for (const v of [1.88, 2.62]) {
      B(wl, IRON, 0.34, 0.07, 0.02, -0.19, v, 0.05, doorJ);
      W(wl, IRON, cy(0.028, 0.1, 6), -0.365, v, WS + 0.045, [0, 0, 0], doorJ);
      for (const u of [-0.3, -0.2, -0.1]) D(wl, P.cream, 0.012, 0.012, u, v, 0.07, 6, doorJ);
    }
    // handle
    D(wl, IRON, 0.055, 0.02, 0.26, 2.1, 0.05, 8, doorJ);
    W(wl, IRON, new THREE.TorusGeometry(0.04, 0.011, 5, 8), 0.26, 2.1, WS + 0.075, [0, 0, 0], doorJ);
    // yellow zigzag on the lower door
    W(wl, P.carveYellow, zigGeo(0.6, 6, 0.1, 0.012), 0, 1.79, WS + 0.056, [0, 0, 0], doorJ);

    // painted sun disc beside the door
    const su = 0.78;
    const sv = 2.32;
    for (let k = 0; k < 12; k++) {
      const a = (k * PI) / 6;
      Pz(wl, P.carveYellow, [[-0.04, 0.2], [0.04, 0.2], [0, 0.31]], 0.02, su, sv, 0.004, [0, 0, a]);
      const a2 = a + PI / 12;
      Pz(wl, P.carveRed, [[-0.025, 0.2], [0.025, 0.2], [0, 0.26]], 0.02, su, sv, 0.004, [0, 0, a2]);
    }
    D(wl, P.carveRed, 0.2, 0.02, su, sv, 0.006, 12);
    D(wl, P.carveYellow, 0.165, 0.02, su, sv, 0.014, 12);
    D(wl, P.cream, 0.105, 0.02, su, sv, 0.022, 12);
    for (const s of [1, -1]) {
      D(wl, P.dark, 0.014, 0.012, su + s * 0.04, sv + 0.025, 0.04, 6);
      D(wl, P.carveRed, 0.02, 0.012, su + s * 0.07, sv - 0.015, 0.04, 6);
    }
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      D(wl, P.dark, 0.008, 0.012, su + Math.sin(a) * 0.055, sv - 0.01 - Math.cos(a) * 0.04, 0.04, 5);
    }

    // tulip panel on the other side of the door
    const tu = -0.78;
    B(wl, P.carveRed, 0.46, 0.58, 0.02, tu, 2.3, 0);
    B(wl, P.cream, 0.4, 0.52, 0.012, tu, 2.3, 0.02);
    B(wl, P.carveTeal, 0.026, 0.24, 0.012, tu, 2.18, 0.032);
    Pz(wl, P.carveTeal, [[0, 0], [0.11, 0.06], [0.01, 0.1]], 0.012, tu, 2.12, 0.032);
    Pz(wl, P.carveTeal, [[0, 0], [-0.11, 0.06], [-0.01, 0.1]], 0.012, tu, 2.12, 0.032);
    Pz(wl, P.carveRed, [[-0.05, 0], [0.05, 0], [0, 0.19]], 0.012, tu, 2.3, 0.032);
    Pz(wl, P.carveRed, [[-0.05, 0], [0.05, 0], [0, 0.17]], 0.012, tu, 2.3, 0.032, [0, 0, 0.7]);
    Pz(wl, P.carveRed, [[-0.05, 0], [0.05, 0], [0, 0.17]], 0.012, tu, 2.3, 0.032, [0, 0, -0.7]);
    D(wl, P.carveYellow, 0.025, 0.012, tu, 2.32, 0.044, 8);
    for (const s of [1, -1]) D(wl, P.carveTeal, 0.016, 0.012, tu + s * 0.15, 2.0 + 0.0, 0.032, 5);
  }

  // ---------------------------------------------------------------------------------------------
  // Flush batches into parts
  for (const bt of batches.values()) {
    const merged = mergeGeometries(bt.geos);
    if (!merged) continue;
    merged.computeVertexNormals();
    const part = b.part(merged, bt.color, {
      bone: bt.bone,
      at: [0, 0, 0],
      name: `cabin_${bt.bone.name}_${bt.color.replace("#", "")}`,
    });
    if (bt.color === P.window) glow(part, 1.4);
  }
}
    return buildCabin;
  })(),
  // roof
  (() => {
type Pt = [number, number] | [number, number, "sharp"];

function buildRoof({ b, J, P }: Ctx) {
  const bone = J.hut;
  const D = Math.PI / 180;
  const LIGHT_SHINGLE = "#58a892";

  // ---------- helpers ----------
  const Q = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D, y * D, z * D));
  const ID = new THREE.Quaternion();

  // Collects many small same-colour pieces and adds them as one part.
  const batch = (color: string) => {
    const list: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    return {
      add(geo: THREE.BufferGeometry, pos: number[], q?: THREE.Quaternion, s?: number[]) {
        const g = geo.index ? geo.toNonIndexed() : geo.clone();
        m.compose(
          new THREE.Vector3(pos[0], pos[1], pos[2]),
          q ?? ID,
          s ? new THREE.Vector3(s[0], s[1], s[2]) : new THREE.Vector3(1, 1, 1),
        );
        g.applyMatrix4(m);
        g.computeVertexNormals();
        list.push(g);
      },
      flush() {
        if (!list.length) return;
        const g = mergeGeometries(list);
        if (g) b.part(g, color, { bone, at: [0, 0, 0], flat: true });
      },
    };
  };

  // Centred triangle prism, apex +Y, thickness along Z.
  const triGeo = (w: number, h: number, t: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, -h / 2);
    sh.lineTo(w / 2, -h / 2);
    sh.lineTo(0, h / 2);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false });
    g.translate(0, 0, -t / 2);
    return g;
  };

  const sc = (pts: Pt[], f: number): Pt[] =>
    pts.map((p) => (p.length === 3 ? ([p[0] * f, p[1] * f, "sharp"] as Pt) : ([p[0] * f, p[1] * f] as Pt)));

  // ---------- roof geometry constants ----------
  const RISE = 0.47;
  const HALF = 1.55;
  const A = Math.atan2(RISE, HALF);
  const sA = Math.sin(A);
  const cA = Math.cos(A);
  const SL = Math.hypot(HALF, RISE);
  const ADEG = A / D;
  const EAVE_Y = 3.03;

  // ---------- roof slopes ----------
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(SL + 0.08, 0.07, 3.0), P.roofDark, {
      bone,
      at: [s * 0.775, 3.265, 0],
      rotation: [0, 0, -s * ADEG],
    });
    // eave log
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 3.04, 6), P.carveYellow, {
      bone,
      at: [s * 1.565, 3.04, 0],
      dir: [0, 0, 1],
    });
  }

  // ---------- fish-scale shingles ----------
  const shMain = batch(P.roof);
  const shLight = batch(LIGHT_SHINGLE);
  const shEdge = batch(P.roofDark);
  const shGeo = new THREE.CylinderGeometry(0.172, 0.172, 0.012, 8);
  const shGeoEdge = new THREE.CylinderGeometry(0.19, 0.19, 0.01, 8);
  for (const s of [1, -1]) {
    const nq = aim(new THREE.Vector3(s * sA, cA, 0));
    for (let r = 0; r < 6; r++) {
      const u = 0.17 + r * 0.25;
      const cnt = r % 2 === 0 ? 9 : 8;
      const z0 = -((cnt - 1) * 0.32) / 2;
      for (let i = 0; i < cnt; i++) {
        const z = z0 + i * 0.32;
        const lift = 0.047 + (5 - r) * 0.004;
        const px = s * HALF - s * cA * u + s * sA * lift;
        const py = EAVE_Y + sA * u + cA * lift;
        const eq = (lift - 0.004) / lift;
        shEdge.add(shGeoEdge, [s * HALF - s * cA * u + s * sA * (lift - 0.004), EAVE_Y + sA * u + cA * (lift - 0.004), z], nq);
        (void eq, ((r + i) % 2 === 0 ? shMain : shLight).add(shGeo, [px, py, z], nq));
      }
    }
  }
  shEdge.flush();
  shMain.flush();
  shLight.flush();

  // ---------- ridge beam ----------
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 2.9, 6), P.carveRed, {
    bone,
    at: [0, 3.515, 0],
    dir: [0, 0, 1],
  });
  const rings = batch(P.carveYellow);
  const ringGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.05, 6);
  for (let i = -4; i <= 4; i++) rings.add(ringGeo, [0, 3.515, i * 0.27], Q(90, 0, 0));
  rings.flush();

  // ---------- horse-head finials ----------
  const HEAD: Pt[] = [
    [-0.18, -0.08],
    [-0.14, 0.1],
    [-0.07, 0.2],
    [-0.05, 0.3, "sharp"],
    [0.0, 0.2],
    [0.06, 0.19],
    [0.17, 0.1],
    [0.25, 0.02],
    [0.25, -0.04],
    [0.17, -0.05],
    [0.12, -0.01],
    [0.06, -0.08],
  ];
  const BACKEDGE: number[][][] = [
    [[-0.18, -0.08], [-0.14, 0.1]],
    [[-0.14, 0.1], [-0.07, 0.2]],
    [[-0.07, 0.2], [-0.05, 0.3]],
  ];
  const F = 0.8;
  const FY = 3.52;
  const FZ = 1.36;
  for (const sz of [1, -1]) {
    const at = [0, FY, sz * FZ];
    b.extrude(sc(HEAD, F), { at, x: [0, 0, sz], thickness: 0.09, bevel: 0.012, color: P.carveYellow, bone });
    // red mane teeth along the back of the neck
    for (const [p0, p1] of BACKEDGE) {
      const e = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      const dx = p1[0] - p0[0];
      const dy = p1[1] - p0[1];
      const l = Math.hypot(dx, dy);
      const d = [dx / l, dy / l];
      const tooth: Pt[] = [
        [e[0] - d[0] * 0.04 + 0.012, e[1] - d[1] * 0.04],
        [e[0] + d[0] * 0.04 + 0.012, e[1] + d[1] * 0.04],
        [e[0] - 0.08, e[1] - 0.02],
      ];
      b.extrude(sc(tooth, F), { at, x: [0, 0, sz], thickness: 0.05, color: P.carveRed, bone });
    }
    // cheek rosette
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.1, 10), P.carveRed, {
      bone,
      at: [0, FY + 0.04 * F, sz * (FZ + 0.0)],
      dir: [1, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.104, 8), P.cream, {
      bone,
      at: [0, FY + 0.04 * F, sz * (FZ + 0.0)],
      dir: [1, 0, 0],
    });
    for (const e of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.016, 6, 4), P.dark, {
        bone,
        at: [e * 0.045, FY + 0.1 * F, sz * (FZ + 0.09 * F)],
      });
      b.part(new THREE.SphereGeometry(0.01, 5, 4), P.dark, {
        bone,
        at: [e * 0.045, FY + 0.0, sz * (FZ + 0.22 * F)],
      });
    }
  }

  // ---------- gable end boards (pozarnye) ----------
  const tearOutline: Pt[] = [
    [0, 0.14, "sharp"],
    [0.035, 0.07],
    [0.05, 0.02],
    [0.035, -0.015],
    [0, -0.03],
    [-0.035, -0.015],
    [-0.05, 0.02],
    [-0.035, 0.07],
  ];
  const wind = batch(P.carveRed);
  const sunRays = batch(P.carveRed);
  const zigRed = batch(P.carveRed);
  const zigTeal = batch(P.carveTeal);
  const dots = batch(P.cream);
  const studs = batch(P.carveRed);
  const eaveCaps = batch(P.carveRed);
  void wind;

  const rayGeo = triGeo(0.075, 0.075, 0.012);
  const zigGeo = triGeo(0.1, 0.055, 0.012);
  const dotGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.014, 6);
  const studGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8);
  const capGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.02, 8);

  for (const sz of [1, -1]) {
    const zf = (d: number) => sz * d;
    // cream backing board
    b.extrude(
      [
        [-1.55, 3.0],
        [1.55, 3.0],
        [0, 3.48, "sharp"],
      ],
      { at: [0, 0, zf(1.51)], x: [sz, 0, 0], thickness: 0.04, color: P.cream, bone },
    );
    // red chevron border
    b.extrude(
      [
        [-1.55, 3.0],
        [0, 3.5, "sharp"],
        [1.55, 3.0],
        [1.4, 3.0],
        [0, 3.4, "sharp"],
        [-1.4, 3.0],
      ],
      { at: [0, 0, zf(1.535)], x: [sz, 0, 0], thickness: 0.012, color: P.carveRed, bone },
    );
    // cream dots on the border
    for (const e of [1, -1])
      for (let i = 0; i < 8; i++) {
        const x = e * (0.15 + i * 0.17);
        const y = 3.45 - 0.304 * Math.abs(x);
        dots.add(dotGeo, [x, y, zf(1.542)], Q(90, 0, 0));
      }
    // sun
    const cy = 3.22;
    for (let k = 0; k < 12; k++) {
      const th = k * 30 * D;
      const rr = 0.1 + 0.0375;
      sunRays.add(rayGeo, [-Math.sin(th) * rr, cy + Math.cos(th) * rr, zf(1.536)], Q(0, 0, k * 30));
    }
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 16), P.carveYellow, { bone, at: [0, cy, zf(1.536)], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.012, 14), P.carveRed, { bone, at: [0, cy, zf(1.5415)], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 10), P.cream, { bone, at: [0, cy, zf(1.547)], dir: [0, 0, 1] });
    // teardrops
    for (const e of [1, -1]) {
      for (const [x, y, k] of [
        [0.5, 3.08, 1.0],
        [0.78, 3.07, 0.6],
      ]) {
        b.extrude(sc(tearOutline, k), {
          at: [e * x, y, zf(1.536)],
          x: [sz, 0, 0],
          thickness: 0.012,
          color: P.carveTeal,
          bone,
        });
        b.extrude(sc(tearOutline, k * 0.5), {
          at: [e * x, y + 0.02 * k, zf(1.5415)],
          x: [sz, 0, 0],
          thickness: 0.012,
          color: P.carveYellow,
          bone,
        });
      }
      // bottom zigzag
      for (let i = 0; i < 8; i++) {
        (i % 2 === 0 ? zigRed : zigTeal).add(zigGeo, [e * (0.3 + 0.1 * i), 3.03, zf(1.536)]);
      }
    }
    // wind boards along the slope edges with studs
    for (const s of [1, -1]) {
      const cx = s * (0.775 + 0.065 * sA);
      const cyb = 3.265 + 0.065 * cA;
      b.part(new THREE.BoxGeometry(SL, 0.07, 0.05), P.carveYellow, {
        bone,
        at: [cx, cyb, zf(1.52)],
        rotation: [0, 0, -s * ADEG],
      });
      for (let t = -0.7; t <= 0.71; t += 0.2) {
        studs.add(studGeo, [cx + -s * cA * -t * -1 * -1 * 1 + 0 * 0 + s * cA * t * -1 * -1 * 0 + (-s * cA) * t * -1 * -1 * 0, 0, 0].map((v, i) => (i === 0 ? cx - s * cA * t : i === 1 ? cyb + sA * t : zf(1.52))), Q(90, 0, 0));
      }
    }
    // eave log end caps
    for (const s of [1, -1]) eaveCaps.add(capGeo, [s * 1.565, 3.04, zf(1.525)], Q(90, 0, 0));
  }
  sunRays.flush();
  zigRed.flush();
  zigTeal.flush();
  dots.flush();
  studs.flush();
  eaveCaps.flush();

  // ---------- chimney: log footing, log crib, brick stack, cap, smoke ----------
  const CX = 1.1;
  const CZ = -0.55;
  b.part(new THREE.BoxGeometry(0.34, 0.16, 0.34), P.logDark, { bone, at: [CX, 3.22, CZ] });
  const logs = batch(P.log);
  const logEnds = batch(P.logEnd);
  const logGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.34, 6);
  const endGeo = new THREE.CylinderGeometry(0.027, 0.027, 0.006, 6);
  for (const o of [-0.09, 0.09]) {
    logs.add(logGeo, [CX + o, 3.33, CZ], Q(90, 0, 0));
    for (const e of [1, -1]) logEnds.add(endGeo, [CX + o, 3.33, CZ + e * 0.17], Q(90, 0, 0));
    logs.add(logGeo, [CX, 3.39, CZ + o], Q(0, 0, 90));
    for (const e of [1, -1]) logEnds.add(endGeo, [CX + e * 0.17, 3.39, CZ + o], Q(0, 0, 90));
  }
  logs.flush();
  logEnds.flush();

  b.part(new THREE.BoxGeometry(0.3, 0.14, 0.3), P.carveRed, { bone, at: [CX, 3.49, CZ] });
  const mortar = batch(P.cream);
  const ringBox = new THREE.BoxGeometry(0.308, 0.008, 0.308);
  mortar.add(ringBox, [CX, 3.4667, CZ]);
  mortar.add(ringBox, [CX, 3.5133, CZ]);
  const vz = new THREE.BoxGeometry(0.007, 0.045, 0.006);
  const vx = new THREE.BoxGeometry(0.006, 0.045, 0.007);
  [3.443, 3.49, 3.537].forEach((y, row) => {
    const offs = row % 2 === 0 ? [-0.05, 0.05] : [-0.1, 0, 0.1];
    for (const o of offs)
      for (const e of [1, -1]) {
        mortar.add(vz, [CX + o, y, CZ + e * 0.1505]);
        mortar.add(vx, [CX + e * 0.1505, y, CZ + o]);
      }
  });
  mortar.flush();
  b.part(new THREE.BoxGeometry(0.36, 0.04, 0.36), P.carveTeal, { bone, at: [CX, 3.58, CZ] });
  b.part(new THREE.BoxGeometry(0.14, 0.006, 0.14), P.dark, { bone, at: [CX, 3.603, CZ] });

  // smoke puff
  for (const [x, y, r] of [
    [CX, 3.69, 0.05],
    [CX + 0.07, 3.77, 0.07],
    [CX + 0.17, 3.86, 0.055],
  ])
    b.part(new THREE.IcosahedronGeometry(r, 1), P.cream, { bone, at: [x, y, CZ], flat: true });
}
    return buildRoof;
  })(),
  // porch
  (() => {
function buildPorch({ b, J, P, M }: Ctx) {
  const bone = J.hut;
  const D = Math.PI / 180;
  type V = [number, number, number];
  const R = rng(21);

  // own colours (kept to four)
  const HERB = "#5f8a3a";
  const HERB_DRY = "#c9a24a";
  const STONE = "#8d8a80";
  const IRON = P.dark;

  // ---------- batching: many small pieces merged into one part per colour ----------
  const batches = new Map<string, THREE.BufferGeometry[]>();
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: V,
    rot: V = [0, 0, 0],
    scale: V = [1, 1, 1],
  ) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)),
      new THREE.Vector3(...scale),
    );
    geo.applyMatrix4(m);
    if (!batches.has(color)) batches.set(color, []);
    batches.get(color)!.push(geo);
  };
  const box = (w: number, h: number, d: number, color: string, at: V, rot: V = [0, 0, 0]) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, rot);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: V, rot: V = [0, 0, 0], sc: V = [1, 1, 1]) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, rot, sc);
  const ball = (r: number, color: string, at: V, sc: V = [1, 1, 1]) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at, [0, 0, 0], sc);

  const deckY = M.porchDeck[1]; // 1.55
  const FRONT = 1.84; // z of the front posts / beam

  // ---------- deck ----------
  const plankW = 1.7 / 6;
  for (let i = 0; i < 6; i++) {
    const x = -0.85 + plankW / 2 + i * plankW;
    box(plankW - 0.012, 0.07, 0.84, i % 2 ? P.logDark : P.wood, [x, deckY - 0.035, 1.49]);
  }
  // front fascia log with round ends
  cyl(0.055, 0.055, 1.76, 8, P.log, [0, deckY - 0.045, 1.9], [0, 0, 90]);
  for (const s of [1, -1]) cyl(0.057, 0.057, 0.012, 8, P.logEnd, [s * 0.88, deckY - 0.045, 1.9], [0, 0, 90]);
  // joists under the deck
  for (const z of [1.28, 1.66]) {
    cyl(0.055, 0.055, 1.72, 8, P.logDark, [0, deckY - 0.14, z], [0, 0, 90]);
    for (const s of [1, -1]) cyl(0.057, 0.057, 0.012, 8, P.logEnd, [s * 0.865, deckY - 0.14, z], [0, 0, 90]);
  }
  // struts from the wall up to the deck front
  for (const s of [1, -1])
    b.rod([s * 0.55, 1.0, 1.1], [s * 0.55, deckY - 0.17, 1.68], 0.03, P.logDark, { bone });

  // door mat
  box(0.62, 0.012, 0.3, P.cream, [0, deckY + 0.006, 1.38]);
  for (const dz of [-0.09, 0, 0.09]) box(0.62, 0.014, 0.028, P.carveRed, [0, deckY + 0.007, 1.38 + dz]);
  for (const s of [1, -1]) box(0.028, 0.015, 0.3, P.carveTeal, [s * 0.295, deckY + 0.007, 1.38]);

  // ---------- carved posts ----------
  for (const s of [1, -1]) {
    const x = s * 0.8;
    cyl(0.045, 0.045, 0.7, 8, P.wood, [x, 1.9, FRONT]);
    box(0.13, 0.07, 0.13, P.cream, [x, deckY + 0.035, FRONT]);
    box(0.1, 0.03, 0.1, P.carveRed, [x, deckY + 0.085, FRONT]);
    for (const [y, col, h] of [
      [1.74, P.carveRed, 0.035],
      [1.81, P.carveYellow, 0.016],
      [2.12, P.carveYellow, 0.016],
      [2.19, P.carveRed, 0.035],
    ] as [number, string, number][])
      cyl(0.056, 0.056, h, 8, col, [x, y, FRONT]);
    // diamonds front and outer face
    box(0.07, 0.07, 0.014, P.carveTeal, [x, 1.96, FRONT + 0.047], [0, 0, 45]);
    box(0.034, 0.034, 0.016, P.carveYellow, [x, 1.96, FRONT + 0.052], [0, 0, 45]);
    box(0.014, 0.07, 0.07, P.carveTeal, [x + s * 0.047, 1.96, FRONT], [45, 0, 0]);
    box(0.016, 0.034, 0.034, P.carveYellow, [x + s * 0.052, 1.96, FRONT], [45, 0, 0]);
    // scroll bracket under the beam
    b.extrude(
      [
        [0, 0],
        [0.26, 0],
        [0.11, -0.04],
        [0.045, -0.1],
        [0, -0.24],
      ],
      { at: [s * 0.77, 2.23, FRONT + 0.0], x: [-s, 0, 0], y: [0, 1, 0], thickness: 0.035, color: P.carveRed, bone },
    );
    ball(0.016, P.carveYellow, [s * 0.77 - s * 0.035, 2.2, FRONT + 0.0]);
  }

  // tie beam
  box(1.86, 0.08, 0.1, P.logDark, [0, 2.27, FRONT]);
  for (const s of [1, -1]) cyl(0.042, 0.042, 0.014, 8, P.logEnd, [s * 0.935, 2.27, FRONT], [0, 0, 90]);
  box(1.7, 0.02, 0.104, P.carveYellow, [0, 2.27, FRONT]);

  // ---------- railing ----------
  for (const s of [1, -1]) {
    const x = s * 0.8;
    // side rails
    box(0.05, 0.05, 0.72, P.wood, [x, deckY + 0.38, 1.47]);
    box(0.05, 0.04, 0.72, P.wood, [x, deckY + 0.08, 1.47]);
    for (const z of [1.25, 1.46, 1.67]) cyl(0.02, 0.02, 0.32, 6, P.carveRed, [x, deckY + 0.23, z]);
    // front rails with a gap for the ladder
    box(0.44, 0.05, 0.05, P.wood, [s * 0.58, deckY + 0.38, FRONT]);
    box(0.44, 0.04, 0.05, P.wood, [s * 0.58, deckY + 0.08, FRONT]);
    for (const dx of [0.47, 0.62]) cyl(0.02, 0.02, 0.32, 6, P.carveRed, [s * dx, deckY + 0.23, FRONT]);
    // newel by the ladder opening
    cyl(0.032, 0.032, 0.44, 6, P.logDark, [s * 0.36, deckY + 0.22, FRONT]);
    ball(0.04, P.carveRed, [s * 0.36, deckY + 0.47, FRONT]);
    ball(0.016, P.carveYellow, [s * 0.36, deckY + 0.5, FRONT + 0.0], [1, 0.8, 1]);
  }

  // ---------- canopy ----------
  const th = Math.atan2(0.3, 0.95);
  const thD = th / D;
  const RIDGE_Y = 2.64;
  const slopePt = (s: number, u: number, z: number, lift: number): V => [
    s * (u * Math.cos(th) + Math.sin(th) * lift),
    RIDGE_Y - u * Math.sin(th) + Math.cos(th) * lift,
    z,
  ];
  for (const s of [1, -1]) {
    const rot: V = [0, 0, -s * thD];
    box(1.05, 0.05, 0.9, P.roofDark, slopePt(s, 0.5, 1.55, 0), rot);
    box(1.06, 0.07, 0.03, P.carveRed, slopePt(s, 0.5, 1.995, 0.045), rot);
    // shingle rows: rounded discs, alternating tones
    const rows = [0.2, 0.42, 0.64, 0.86];
    rows.forEach((u, r) => {
      const odd = r % 2;
      const n = odd ? 4 : 5;
      for (let c = 0; c < n; c++) {
        const z = (odd ? 1.265 : 1.17) + c * 0.19;
        cyl(0.092, 0.092, 0.012, 8, (c + r) % 2 ? P.roof : P.roofDark, slopePt(s, u, z, 0.03 + r * 0.004), rot);
      }
    });
    // yellow bead row on the barge board
    for (let i = 0; i < 4; i++) ball(0.016, P.carveYellow, slopePt(s, 0.15 + i * 0.23, 1.997, 0.085));
  }
  // ridge log and finial
  cyl(0.04, 0.04, 0.92, 8, P.carveYellow, [0, RIDGE_Y + 0.035, 1.55], [90, 0, 0]);
  ball(0.05, P.carveRed, [0, RIDGE_Y + 0.04, 2.0]);
  put(new THREE.ConeGeometry(0.035, 0.1, 4), P.carveYellow, [0, RIDGE_Y + 0.115, 2.0]);
  ball(0.035, P.carveTeal, [0, RIDGE_Y + 0.03, 1.12]);
  // inner rafters under the slopes
  for (const z of [1.3, 1.8]) for (const s of [1, -1]) {
    box(0.95, 0.04, 0.045, P.logDark, slopePt(s, 0.5, z, -0.04), [0, 0, -s * thD]);
  }

  // gable board with sun, drops and valance
  b.extrude(
    [
      [-0.93, 0],
      [0.93, 0],
      [0, 0.31],
    ],
    { at: [0, 2.3, 1.975], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: P.cream, bone },
  );
  const sunC: V = [0, 2.43, 1.995];
  cyl(0.075, 0.075, 0.012, 12, P.carveRed, sunC, [90, 0, 0]);
  cyl(0.05, 0.05, 0.014, 10, P.carveYellow, [0, 2.43, 1.998], [90, 0, 0]);
  cyl(0.022, 0.022, 0.016, 8, P.carveTeal, [0, 2.43, 2.0], [90, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const phi = i * 45 * D + Math.PI / 8 * 0;
    const rr = 0.108;
    put(
      new THREE.ConeGeometry(0.02, 0.05, 3),
      P.carveYellow,
      [Math.cos(phi) * rr, 2.43 + Math.sin(phi) * rr, 1.995],
      [0, 0, i * 45 - 90],
      [1, 1, 0.3],
    );
  }
  for (const s of [1, -1]) {
    ball(0.03, P.carveTeal, [s * 0.34, 2.39, 1.995], [1, 1.9, 0.4]);
    ball(0.022, P.carveRed, [s * 0.5, 2.37, 1.995], [1, 1.5, 0.4]);
    ball(0.03, P.carveTeal, [s * 0.66, 2.34, 1.995], [1, 1.9, 0.4]);
    ball(0.012, P.carveYellow, [s * 0.2, 2.35, 1.997]);
  }
  // zigzag valance
  for (let i = 0; i < 11; i++) {
    const x = -0.85 + i * 0.17;
    put(
      new THREE.ConeGeometry(0.058, 0.1, 4),
      i % 2 ? P.carveYellow : P.carveRed,
      [x, 2.26, 1.99],
      [180, 45, 0],
      [1, 1, 0.3],
    );
  }
  box(1.88, 0.025, 0.03, P.carveRed, [0, 2.305, 1.99]);

  // ---------- ladder ----------
  const ladZ = (y: number) => 1.93 + ((1.52 - y) / 1.12) * 0.05;
  for (const s of [1, -1])
    b.rod([s * 0.3, 1.52, 1.93], [s * 0.3, 0.4, 1.98], 0.03, P.logDark, { bone, section: "box", caps: "flat" });
  for (const y of [1.16, 0.98, 0.8, 0.62, 0.46]) {
    cyl(0.022, 0.022, 0.7, 6, P.wood, [0, y, ladZ(y)], [0, 0, 90]);
    for (const s of [1, -1]) ball(0.02, P.logEnd, [s * 0.35, y, ladZ(y)], [0.6, 1, 1]);
  }
  // cream painted step
  box(0.56, 0.05, 0.14, P.cream, [0, 1.38, ladZ(1.38)]);
  for (const x of [-0.17, 0, 0.17]) box(0.03, 0.03, 0.01, P.carveRed, [x, 1.38, ladZ(1.38) + 0.072], [0, 0, 45]);
  box(0.56, 0.012, 0.14, P.carveTeal, [0, 1.408, ladZ(1.38)]);
  // flat stone below the ladder foot
  cyl(0.28, 0.3, 0.08, 7, STONE, [0, 0.34, 1.8], [0, 10, 0], [1.4, 1, 0.75]);
  cyl(0.1, 0.11, 0.03, 6, "#a6a398", [0.32, 0.395, 1.78], [0, 20, 0]);

  // ---------- hanging herbs ----------
  const bundles: { x: number; len: number; col: string; inner: string }[] = [
    { x: -0.62, len: 0.24, col: HERB, inner: HERB_DRY },
    { x: -0.4, len: 0.18, col: HERB_DRY, inner: HERB },
    { x: -0.18, len: 0.22, col: HERB, inner: HERB },
  ];
  for (const h of bundles) {
    cyl(0.004, 0.004, 0.06, 4, P.claw, [h.x, 2.2, FRONT]);
    cyl(0.028, 0.028, 0.025, 6, P.carveRed, [h.x, 2.155, FRONT]);
    put(new THREE.ConeGeometry(0.06, h.len, 6), h.col, [h.x, 2.14 - h.len / 2, FRONT], [180, 0, 0]);
    put(new THREE.ConeGeometry(0.04, h.len * 1.1, 5), h.inner, [h.x + 0.01, 2.14 - h.len * 0.55, FRONT + 0.015], [180, 20, 0]);
    for (let i = 0; i < 3; i++)
      put(new THREE.ConeGeometry(0.012, 0.07, 4), h.col, [h.x + (R() - 0.5) * 0.08, 2.14 - h.len - 0.02, FRONT + (R() - 0.5) * 0.06], [180, 0, (R() - 0.5) * 40]);
  }
  // string of red peppers
  cyl(0.004, 0.004, 0.2, 4, P.claw, [0.0, 2.13, FRONT]);
  for (let i = 0; i < 4; i++) {
    put(new THREE.ConeGeometry(0.022, 0.07, 5), P.carveRed, [(i % 2) * 0.02 - 0.01, 2.2 - i * 0.045 - 0.04, FRONT + 0.015], [180, 0, 8]);
  }

  // ---------- lantern ----------
  const LX = 0.45;
  cyl(0.005, 0.005, 0.1, 4, IRON, [LX, 2.18, FRONT]);
  put(new THREE.TorusGeometry(0.02, 0.005, 4, 8), IRON, [LX, 2.125, FRONT], [90, 0, 0]);
  put(new THREE.ConeGeometry(0.085, 0.06, 4), IRON, [LX, 2.1, FRONT], [0, 45, 0]);
  box(0.11, 0.02, 0.11, IRON, [LX, 1.945, FRONT]);
  for (const dx of [-0.045, 0.045]) for (const dz of [-0.045, 0.045]) box(0.012, 0.12, 0.012, IRON, [LX + dx, 2.0, FRONT + dz]);
  box(0.1, 0.012, 0.1, IRON, [LX, 2.062, FRONT]);
  glow(b.part(new THREE.BoxGeometry(0.082, 0.1, 0.082), P.window, { bone, at: [LX, 2.0, FRONT] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.carveYellow, { bone, at: [LX, 1.99, FRONT] }), 2);

  // ---------- flush batches ----------
  for (const [color, geos] of batches) {
    const merged = mergeGeometries(geos);
    if (merged) b.part(merged, color, { bone, at: [0, 0, 0], flat: true });
  }
}
    return buildPorch;
  })(),
  // fence
  (() => {
function buildFence({ b, P }: Ctx) {
  const r = rng(41);
  const GRASS_LIGHT = "#7f9444";
  const GRASS_DARK = "#475a2a";
  const D2R = Math.PI / 180;

  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    rot?: [number, number, number],
    scale?: [number, number, number],
  ) => b.part(geo, color, { at, rotation: rot, scale });

  // ---- ground pad: a low grass disc with darker and lighter patches ----
  put(new THREE.CylinderGeometry(1.6, 1.6, 0.06, 20), P.ground, [0, 0.03, 0], undefined, [1, 1, 1.06]);
  put(new THREE.CylinderGeometry(1.2, 1.25, 0.012, 14), GRASS_LIGHT, [-0.1, 0.062, -0.35], undefined, [1, 1, 1.1]);
  put(new THREE.CylinderGeometry(0.5, 0.52, 0.012, 10), GRASS_DARK, [0.75, 0.062, -1.0], undefined, [1.3, 1, 0.8]);

  // ---- fence ring ----
  const RX = 1.45;
  const RZ = 1.55;
  const N = 19;
  const a0 = 70 * D2R;
  const a1 = 290 * D2R;
  type Pole = { x: number; z: number; a: number; h: number; skull: boolean };
  const poles: Pole[] = [];
  for (let i = 0; i < N; i++) {
    const a = a0 + ((a1 - a0) * i) / (N - 1);
    const skull = i % 3 === 0;
    const h = skull ? 1.22 + r() * 0.08 : 0.7 + r() * 0.45 + (i % 2) * 0.05;
    poles.push({ x: RX * Math.sin(a), z: RZ * Math.cos(a), a, h, skull });
  }

  const skullAt = (p: Pole) => {
    const { a } = p;
    const W = (rr: number, u: number, f: number): [number, number, number] => [
      p.x + rr * Math.cos(a) + f * Math.sin(a),
      p.h + u,
      p.z - rr * Math.sin(a) + f * Math.cos(a),
    ];
    const yaw: [number, number, number] = [0, a / D2R, 0];
    put(new THREE.SphereGeometry(0.085, 8, 6), P.bone, W(0, 0.095, 0), undefined, [1, 0.95, 1.05]);
    put(new THREE.BoxGeometry(0.09, 0.045, 0.07), P.bone, W(0, 0.058, 0.03), yaw);
    put(new THREE.BoxGeometry(0.082, 0.035, 0.072), P.bone, W(0, 0.02, 0.026), yaw);
    put(new THREE.BoxGeometry(0.075, 0.006, 0.01), P.dark, W(0, 0.038, 0.064), yaw);
    put(new THREE.BoxGeometry(0.016, 0.026, 0.012), P.dark, W(0, 0.066, 0.067), yaw);
    for (const s of [1, -1]) {
      put(new THREE.SphereGeometry(0.026, 6, 4), P.dark, W(s * 0.036, 0.1, 0.062));
      glow(put(new THREE.SphereGeometry(0.017, 6, 4), P.skullGlow, W(s * 0.036, 0.1, 0.078)), 1.6);
    }
  };

  poles.forEach((p, i) => {
    const col = i % 2 ? P.logDark : P.log;
    if (p.skull) {
      put(new THREE.CylinderGeometry(0.06, 0.066, p.h, 7), col, [p.x, p.h / 2, p.z]);
      put(new THREE.CylinderGeometry(0.063, 0.063, 0.012, 7), P.logEnd, [p.x, p.h + 0.002, p.z]);
      skullAt(p);
    } else {
      const shaft = p.h - 0.17;
      put(new THREE.CylinderGeometry(0.06, 0.066, shaft, 7), col, [p.x, shaft / 2, p.z]);
      put(new THREE.ConeGeometry(0.06, 0.18, 7), P.logEnd, [p.x, shaft + 0.09 - 0.005, p.z]);
    }
    // cream rope bands on some poles
    if (i % 3 === 2) {
      put(new THREE.CylinderGeometry(0.07, 0.07, 0.035, 7), P.cream, [p.x, 0.5, p.z]);
    }
  });

  // rope swags between neighbouring poles
  for (let i = 0; i < N - 1; i += 2) {
    const A = poles[i];
    const B = poles[i + 1];
    const mx = (A.x + B.x) / 2;
    const mz = (A.z + B.z) / 2;
    b.sweep(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(A.x, 0.62, A.z),
        new THREE.Vector3(mx, 0.54, mz),
        new THREE.Vector3(B.x, 0.62, B.z),
      ]).getPoints(6).map((v) => [v.x, v.y, v.z]),
      0.012,
      { color: P.cream, sides: 5, caps: "round" },
    );
  }

  // ---- grass tufts ----
  const tufts: [number, number][] = [
    [-1.28, 0.2], [1.3, -0.2], [0.9, -1.25], [-0.95, -1.2], [0.1, -1.38], [-1.38, -0.6], [1.35, 0.55],
  ];
  tufts.forEach(([x, z], k) => {
    for (let j = 0; j < 3; j++) {
      const hgt = 0.12 + r() * 0.07;
      const ox = (j - 1) * 0.025;
      const col = j === 1 ? GRASS_LIGHT : GRASS_DARK;
      put(
        new THREE.ConeGeometry(0.014, hgt, 4),
        col,
        [x + ox, 0.06 + hgt / 2 - 0.005, z + (k % 2 ? 0.01 : -0.01) * j],
        [(j - 1) * 14, 0, (1 - j) * 16],
      );
    }
  });

  // ---- mushrooms: red caps with cream dots ----
  const shrooms: [number, number, number][] = [
    [1.12, -1.02, 1],
    [-1.18, 0.82, 0.8],
    [-0.45, -1.2, 0.65],
  ];
  shrooms.forEach(([x, z, s]) => {
    put(new THREE.CylinderGeometry(0.02 * s, 0.026 * s, 0.07 * s, 6), P.cream, [x, 0.06 + 0.035 * s - 0.005, z]);
    const capY = 0.06 + 0.07 * s - 0.01;
    put(
      new THREE.SphereGeometry(0.07 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      P.carveRed,
      [x, capY, z],
    );
    for (const [dx, dz, dy] of [[0.035, 0.02, 0.04], [-0.03, 0.035, 0.038], [-0.005, -0.045, 0.035]] as const) {
      put(new THREE.SphereGeometry(0.011 * s, 5, 4), P.cream, [x + dx * s, capY + dy * s * 0.9, z + dz * s]);
    }
  });
}
    return buildFence;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "babaYagaHut" });
  const J: Record<string, Joint> = {};
  J["hut"] = b.joint("hut", { at: [0,1.5,0], dir: [0,1,0], role: "spine" });
  J["hipL"] = b.joint("hipL", { parent: J["hut"], at: [0.7,1.5,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hut"], at: [-0.7,1.5,0], dir: [0,-1,0], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
