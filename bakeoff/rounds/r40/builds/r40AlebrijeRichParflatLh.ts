import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, spiral, offset, aim, bezier } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Alebrije Jaguar-Eagle",
  "description": "A painted-wood Oaxacan alebrije: a jaguar body with eagle head, folded-open wings and feathered tail, covered in dotted and swirled folk-art patterns in bright colours."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  jaguarYellow: "#f2b01e",
  spotBlack: "#1c1420",
  magenta: "#d6247a",
  turquoise: "#12b5b0",
  leafGreen: "#4aa83a",
  orange: "#f26a1f",
  violet: "#6a3fb0",
  skyBlue: "#2f7fe0",
  cream: "#fff1cf",
  red: "#d9262c",
  beakGold: "#f7c948",
  woodBrown: "#8a5a30",
  white: "#ffffff",
  pink: "#ff8fb8",
};
const M = {
  hips: [0, 0.85, -0.4] as [number, number, number],
  chest: [0, 0.9, 0.4] as [number, number, number],
  neckBase: [0, 1.05, 0.65] as [number, number, number],
  headCentre: [0, 1.5, 1.05] as [number, number, number],
  shoulderL: [0.35, 1.15, 0.3] as [number, number, number],
  shoulderR: [-0.35, 1.15, 0.3] as [number, number, number],
  tailRoot: [0, 0.95, -0.75] as [number, number, number],
  footFL: [0.3, 0, 0.55] as [number, number, number],
  footFR: [-0.3, 0, 0.55] as [number, number, number],
  footBL: [0.3, 0, -0.5] as [number, number, number],
  footBR: [-0.3, 0, -0.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const YEL = P.jaguarYellow;
  const BLACK = P.spotBlack;
  const MAG = P.magenta;
  const TURQ = P.turquoise;
  const ORANGE = P.orange;
  const CREAM = P.cream;
  const WHITE = P.white;
  const PINK = P.pink;
  const RED = P.red;
  const VIOLET = P.violet;

  // ---------- main body loft: rump, waist, chest bulge ----------
  const stations = [
    { at: [0, 0.92, -0.79], w: 0.3, h: 0.3 },
    { at: [0, 0.93, -0.62], w: 0.74, h: 0.58 }, // rump bulge
    { at: [0, 0.92, -0.35], w: 0.74, h: 0.54 },
    { at: [0, 0.9, -0.05], w: 0.68, h: 0.5 }, // waist
    { at: [0, 0.93, 0.25], w: 0.76, h: 0.58 },
    { at: [0, 0.94, 0.5], w: 0.82, h: 0.62 }, // chest bulge
    { at: [0, 0.97, 0.73], w: 0.5, h: 0.44 },
  ];
  const body = b.loft(stations, {
    bone: [J.hips, J.chest],
    color: YEL,
    sides: 12,
    sectors: [
      [100, 122, ORANGE],
      [122, 238, CREAM],
      [238, 260, ORANGE],
    ],
  });
  const skin = b.surface(body);

  // cream chest bib
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: J.chest,
    at: [0, 0.78, 0.6],
    scale: [0.27, 0.2, 0.2],
  });

  // ---------- helpers ----------
  const top = (x: number, z: number) => skin.ray([x, 2, z], [0, -1, 0]);
  const side = (s: number, y: number, z: number) => skin.ray([s * 1.2, y, z], [-s, 0, 0]);

  const rosette = (hit: any) => {
    if (!hit) return;
    const phase = R() * Math.PI * 2;
    const n = 5;
    for (let i = 0; i < n; i++) {
      const a = phase + (i / n) * Math.PI * 2;
      const p = hit.local([Math.cos(a) * 0.058, 0, Math.sin(a) * 0.058]);
      const h = skin.nearest(p);
      b.stick(new THREE.SphereGeometry(0.021, 6, 4), BLACK, h, { embed: 0.35 });
    }
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 8), MAG, hit, { embed: 0.2 });
    b.stick(new THREE.CylinderGeometry(0.013, 0.013, 0.02, 6), PINK, hit, { embed: 0.3 });
  };

  // ---------- rosettes on flanks and back ----------
  for (const s of [1, -1]) {
    for (const [z, y] of [
      [-0.22, 1.0],
      [0.02, 0.78],
      [0.3, 0.98],
    ]) {
      rosette(side(s, y, z));
    }
  }
  for (const s of [1, -1]) {
    rosette(top(s * 0.2, -0.64));
    rosette(top(s * 0.2, 0.5));
  }

  // ---------- haunch spirals ----------
  for (const s of [1, -1]) {
    const c = side(s, 0.95, -0.52);
    if (!c) continue;
    const cp = c.at;
    const path = spiral(
      [cp.x, cp.y, cp.z],
      [cp.x, cp.y + 0.11, cp.z],
      [s, 0, 0],
      { turns: -s * 1.5, r1: 0.02 },
    );
    b.sweep(skin.drape(path, { lift: 0.006 }), 0.02, { color: BLACK, bone: J.hips });
    b.sweep(skin.drape(path, { lift: 0.012 }), 0.012, { color: MAG, bone: J.hips });
    b.stick(new THREE.SphereGeometry(0.03, 8, 6), TURQ, c, { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), WHITE, c, { embed: -0.5 });
  }

  // ---------- spine ridge of diamonds ----------
  const diamond = new THREE.OctahedronGeometry(0.04, 0);
  const nD = 11;
  for (let i = 0; i < nD; i++) {
    const z = -0.62 + (i / (nD - 1)) * 1.1;
    const h = top(0, z);
    if (!h) continue;
    b.stick(diamond, BLACK, h, { embed: 0.3, scale: [1.05, 0.45, 1.55], flow: [0, 0, 1] });
    b.stick(diamond, i % 2 ? TURQ : MAG, h, { embed: 0.05, scale: [0.8, 0.6, 1.25], flow: [0, 0, 1] });
  }

  // ---------- saddle blanket: orange zigzag triangles + borders ----------
  const triOut = new THREE.CylinderGeometry(0.056, 0.056, 0.012, 3);
  const triIn = new THREE.CylinderGeometry(0.042, 0.042, 0.016, 3);
  const zs = [-0.34, -0.18, -0.02, 0.14, 0.28];
  for (const s of [1, -1]) {
    zs.forEach((z, i) => {
      const h = top(s * 0.19, z);
      if (!h) return;
      const spin = i % 2 ? 60 : 0;
      b.stick(triOut, BLACK, h, { embed: 0.2, spin });
      b.stick(triIn, i % 2 ? ORANGE : RED, h, { embed: 0.12, spin });
    });
    // border lines
    const pts: any[] = [];
    for (let i = 0; i <= 8; i++) {
      const h = top(s * 0.31, -0.42 + (i / 8) * 0.8);
      if (h) pts.push(offset(h.at, h.n, 0.004));
    }
    if (pts.length > 3) {
      b.sweep(catmull(pts), 0.016, { color: BLACK, bone: [J.hips, J.chest] });
      const pts2 = pts.map((p) => p.clone().add(new THREE.Vector3(0, 0.005, 0)));
      b.sweep(catmull(pts2), 0.009, { color: CREAM, bone: [J.hips, J.chest] });
    }
  }

  // ---------- collar band between torso and neck ----------
  const collarZ = 0.66;
  const band = skin.loop([0, 0.97, collarZ], { dir: [0, 0, 1], lift: -0.002 });
  b.sweep(band, 0.034, { color: BLACK, bone: J.chest });
  const band2 = skin.loop([0, 0.97, collarZ], { dir: [0, 0, 1], lift: 0.006 });
  b.sweep(band2, 0.026, { color: VIOLET, bone: J.chest });
  const dotsPath = skin.loop([0, 0.97, collarZ], { dir: [0, 0, 1], lift: 0.022 });
  let k = 0;
  b.along(dotsPath, 18, (at) => {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), k++ % 2 ? WHITE : TURQ, { at });
  });

  return body;
}
    return buildTorso;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const R = rng(11);
  const UP: [number, number, number] = [0, 1, 0];

  // Merged-detail helper: many small same-colour pieces on one bone become one part per colour.
  const makeBag = (bone: any) => {
    const lists = new Map<string, THREE.BufferGeometry[]>();
    return {
      add(color: string, g: THREE.BufferGeometry) {
        let l = lists.get(color);
        if (!l) lists.set(color, (l = []));
        l.push(g);
      },
      flush() {
        for (const [c, l] of lists) {
          const merged = mergeGeometries(l);
          if (merged) b.part(merged, c, { bone, at: [0, 0, 0], flat: true });
        }
      },
    };
  };
  type Bag = ReturnType<typeof makeBag>;

  // A flat disc seated on a surface point: centre sits `off` out along the normal.
  const disc = (bag: Bag, color: string, at: THREE.Vector3, n: THREE.Vector3, r: number, h: number, off: number, sides = 8) => {
    const g = new THREE.CylinderGeometry(r, r, h, sides);
    g.applyQuaternion(aim(n));
    const c = at.clone().addScaledVector(n, off);
    g.translate(c.x, c.y, c.z);
    bag.add(color, g);
  };
  const dot = (bag: Bag, color: string, at: THREE.Vector3, r: number) => {
    const g = new THREE.SphereGeometry(r, 6, 4);
    g.translate(at.x, at.y, at.z);
    bag.add(color, g);
  };
  // Rosette spot: black disc with an orange heart.
  const spot = (bag: Bag, h: any, r = 0.034) => {
    disc(bag, P.spotBlack, h.at, h.n, r, 0.014, 0.004);
    disc(bag, P.orange, h.at, h.n, r * 0.42, 0.014, 0.007, 6);
  };

  const legs = [
    { id: "FL", s: 1, front: true },
    { id: "FR", s: -1, front: true },
    { id: "BL", s: 1, front: false },
    { id: "BR", s: -1, front: false },
  ];

  for (const { id, s, front } of legs) {
    const [fx, , fz] = M["foot" + id];
    const hip = J["leg" + id];

    const hipP = V(fx, 0.6, fz);
    const kneeP = front ? V(fx, 0.38, fz - 0.04) : V(fx, 0.4, fz + 0.08);
    const ankP = front ? V(fx, 0.2, fz) : V(fx, 0.2, fz - 0.05);
    const pawC = V(fx, 0.111, ankP.z + (front ? 0.05 : 0.07));

    const knee = b.joint(`legsKnee${id}`, { parent: hip, at: kneeP, aim: ankP, role: "leg" });
    const ankle = b.joint(`legsAnkle${id}`, { parent: knee, at: ankP, aim: pawC, role: "leg" });

    const bagHip = makeBag(hip);
    const bagKnee = makeBag(knee);
    const bagAnkle = makeBag(ankle);

    // ---- Plinth disc with violet dotted rim ----
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 18), P.spotBlack, { bone: ankle, at: [fx, 0.005, pawC.z] });
    b.part(new THREE.CylinderGeometry(0.195, 0.195, 0.032, 18), P.woodBrown, { bone: ankle, at: [fx, 0.016, pawC.z] });
    b.part(new THREE.CylinderGeometry(0.198, 0.198, 0.008, 18), P.magenta, { bone: ankle, at: [fx, 0.016, pawC.z] });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const a2 = a + Math.PI / 12;
      dot(bagAnkle, P.violet, V(fx + Math.sin(a) * 0.172, 0.034, pawC.z + Math.cos(a) * 0.172), 0.018);
      dot(bagAnkle, P.cream, V(fx + Math.sin(a2) * 0.172, 0.034, pawC.z + Math.cos(a2) * 0.172), 0.008);
    }

    // ---- Leg volumes ----
    const thigh = b.capsule(hipP, kneeP, [0.135, 0.1], { color: P.jaguarYellow, bone: hip, sides: 8 });
    const bulgeC = front ? V(fx + s * 0.02, 0.56, fz) : V(fx + s * 0.02, 0.56, fz - 0.03);
    const bulge = b.part(new THREE.SphereGeometry(1, 12, 9), P.jaguarYellow, {
      bone: hip,
      at: bulgeC,
      scale: front ? [0.15, 0.15, 0.16] : [0.15, 0.15, 0.2],
    });
    const shin = b.capsule(kneeP, ankP, [0.092, 0.075], { color: P.jaguarYellow, bone: knee, sides: 8 });
    const paw = b.part(new THREE.SphereGeometry(1, 12, 9), P.jaguarYellow, {
      bone: ankle,
      at: pawC,
      scale: [0.14, 0.085, 0.17],
    });

    const thighSkin = b.surface(thigh);
    const bulgeSkin = b.surface(bulge);
    const wholeThigh = b.surface([thigh, bulge]);
    const shinSkin = b.surface(shin);
    const pawSkin = b.surface(paw);

    // ---- Knee stripe ring: black / cream / black ----
    const onThigh = (t: number) => new THREE.Vector3().lerpVectors(hipP, kneeP, t);
    const onShin = (t: number) => new THREE.Vector3().lerpVectors(kneeP, ankP, t);
    const stripes: [number, number, number, string][] = [
      [0.74, 0.012, 0.004, P.spotBlack],
      [0.81, 0.009, 0.008, P.cream],
      [0.88, 0.012, 0.004, P.spotBlack],
    ];
    for (const [t, r, lift, col] of stripes)
      b.sweep(thighSkin.loop(onThigh(t), { dir: UP, lift }), r, { color: col, bone: hip, sides: 6 });

    // ---- Anklet bands with dotted trim ----
    const bandA = shinSkin.loop(onShin(0.55), { dir: UP, lift: 0.006 });
    b.sweep(bandA, 0.014, { color: P.magenta, bone: knee, sides: 6 });
    const dotsA = shinSkin.loop(onShin(0.55), { dir: UP, lift: 0.016 });
    b.along(dotsA, 9, () => {}).forEach((f: any) => dot(bagKnee, P.cream, f.at, 0.008));

    b.sweep(shinSkin.loop(onShin(0.72), { dir: UP, lift: 0.008 }), 0.018, { color: P.turquoise, bone: knee, sides: 6 });
    const dotsB = shinSkin.loop(onShin(0.72), { dir: UP, lift: 0.024 });
    b.along(dotsB, 10, () => {}).forEach((f: any, i: number) =>
      dot(bagKnee, i % 2 ? P.white : P.magenta, f.at, 0.011),
    );

    b.sweep(shinSkin.loop(onShin(0.89), { dir: UP, lift: 0.005 }), 0.012, { color: P.violet, bone: knee, sides: 6 });

    // ---- Swirl motif on the thigh's outer face ----
    const sc = bulgeSkin.around(bulgeC).at(s * 90, 0)!;
    const sp = spiral(sc.at.clone(), sc.at.clone().add(V(0, 0.07, 0)), sc.n, { turns: s * 1.5, r1: 0.012, pitch: 0 });
    b.sweep(bulgeSkin.drape(sp, { lift: 0.003 }), 0.011, { color: P.spotBlack, bone: hip, sides: 6 });
    b.sweep(bulgeSkin.drape(sp, { lift: 0.0075 }), 0.006, { color: P.turquoise, bone: hip, sides: 6 });
    disc(bagHip, P.spotBlack, sc.at, sc.n, 0.03, 0.014, 0.004, 8);
    disc(bagHip, P.magenta, sc.at, sc.n, 0.02, 0.014, 0.008, 8);
    dot(bagHip, P.white, sc.at.clone().addScaledVector(sc.n, 0.016), 0.007);

    // ---- Black rosette spots on thigh and shin ----
    const thighSpots = wholeThigh.scatter(8, {
      rng: R,
      minDist: 0.075,
      filter: (h: any) => h.n.x * s > -0.15 && h.n.y > -0.5 && h.at.y > 0.45 && h.at.y < 0.6 && h.at.distanceTo(sc.at) > 0.1,
    });
    for (const h of thighSpots) spot(bagHip, h);
    const shinSpots = shinSkin.scatter(4, {
      rng: R,
      minDist: 0.06,
      filter: (h: any) => h.n.x * s > -0.1 && h.at.y > 0.29 && h.at.y < 0.37,
    });
    for (const h of shinSpots) spot(bagKnee, h, 0.028);

    // ---- Paw: toe discs, claws, top diamond, side spots ----
    for (const az of [-36, 0, 36]) {
      const h = pawSkin.around(pawC).at(az, 12)!;
      disc(bagAnkle, P.spotBlack, h.at, h.n, 0.046, 0.012, 0.002, 10);
      disc(bagAnkle, P.cream, h.at, h.n, 0.036, 0.014, 0.006, 10);
      const hc = pawSkin.around(pawC).at(az, -22)!;
      const a = (az * Math.PI) / 180;
      const dir = V(Math.sin(a) * 0.3, -0.25, 1).normalize();
      const claw = new THREE.ConeGeometry(0.02, 0.075, 6);
      claw.applyQuaternion(aim(dir));
      const cc = hc.at.clone().addScaledVector(dir, 0.025);
      claw.translate(cc.x, cc.y, cc.z);
      bagAnkle.add(P.spotBlack, claw);
    }
    const top = pawSkin.around(pawC).at(0, 62)!;
    disc(bagAnkle, P.spotBlack, top.at, top.n, 0.05, 0.012, 0.002, 4);
    disc(bagAnkle, P.magenta, top.at, top.n, 0.038, 0.012, 0.005, 4);
    dot(bagAnkle, P.white, top.at.clone().addScaledVector(top.n, 0.012), 0.011);
    for (const az of [-72, 72]) {
      const h = pawSkin.around(pawC).at(az, 30)!;
      spot(bagAnkle, h, 0.03);
    }

    bagHip.flush();
    bagKnee.flush();
    bagAnkle.flush();
  }
}
    return buildLegs;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const BLACK = P.spotBlack;
  const DARKGOLD = "#b8741c";

  // ---------- helpers ----------
  // A point + outward normal on an ellipsoid, by azimuth (0 = +Z, 90 = +X) and elevation.
  const ell = (c: number[], r: number[]) => (az: number, el: number) => {
    const a = (az * Math.PI) / 180;
    const e = (el * Math.PI) / 180;
    const d = [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
    const t = 1 / Math.sqrt((d[0] / r[0]) ** 2 + (d[1] / r[1]) ** 2 + (d[2] / r[2]) ** 2);
    const p = [c[0] + d[0] * t, c[1] + d[1] * t, c[2] + d[2] * t];
    const g = [(p[0] - c[0]) / r[0] ** 2, (p[1] - c[1]) / r[1] ** 2, (p[2] - c[2]) / r[2] ** 2];
    const l = Math.hypot(g[0], g[1], g[2]);
    return { p, n: [g[0] / l, g[1] / l, g[2] / l] };
  };

  type EllFn = ReturnType<typeof ell>;

  // A squashed sphere seated on an ellipsoid: a bump, dot or gem whose +Y follows the surface normal.
  const dome = (
    E: EllFn,
    az: number,
    el: number,
    rx: number,
    h: number,
    color: string,
    lift = 0,
    segs: [number, number] = [10, 6],
  ) => {
    const { p, n } = E(az, el);
    return b.part(new THREE.SphereGeometry(1, segs[0], segs[1]), color, {
      bone: J.head,
      at: [p[0] + n[0] * lift, p[1] + n[1] * lift, p[2] + n[2] * lift],
      dir: n,
      scale: [rx, h, rx],
    });
  };

  // Feather outline: width w (half), length L, optional outline padding.
  const feather = (w: number, L: number, pad = 0): Array<[number, number] | [number, number, "sharp"]> => [
    [-w * 0.6 - pad, -pad],
    [-w - pad, L * 0.45],
    [-w * 0.7 - pad, L * 0.8],
    [0, L + pad * 1.5, "sharp"],
    [w * 0.7 + pad, L * 0.8],
    [w + pad, L * 0.45],
    [w * 0.6 + pad, -pad],
  ];

  // ---------- head masses ----------
  const SC = [0, 1.5, 1.03];
  const SR = [0.2, 0.19, 0.2];
  const skullE = ell(SC, SR);
  b.part(new THREE.SphereGeometry(1, 18, 12), P.jaguarYellow, {
    bone: J.head,
    at: SC,
    scale: SR as [number, number, number],
  });

  const MC = [0, 1.495, 1.09];
  const MR = [0.2, 0.18, 0.19];
  const maskE = ell(MC, MR);
  b.part(new THREE.SphereGeometry(1, 18, 12), P.cream, {
    bone: J.head,
    at: MC,
    scale: MR as [number, number, number],
  });

  // ---------- neck ----------
  const neckPath = catmull([
    [0, 1.02, 0.6],
    [0, 1.2, 0.77],
    [0, 1.42, 0.98],
  ]);
  const neck = b.sweep(neckPath, [0.21, 0.2, 0.17, 0.15], {
    bone: J.neck1,
    color: P.jaguarYellow,
    sides: 10,
    sectors: [[125, 235, P.cream]],
  });
  // rosette-ish spots on the neck
  const spotSites: Array<[number, number]> = [
    [0.25, 45],
    [0.25, -45],
    [0.25, 115],
    [0.25, -115],
    [0.34, 0],
  ];
  for (const [t, deg] of spotSites) {
    const hit = neck.at(t, deg);
    b.stick(new THREE.CylinderGeometry(0.032, 0.032, 0.01, 8), BLACK, hit);
    b.stick(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 8), P.magenta, hit.moved([0, 0.004, 0]));
  }

  // ---------- feather collar (turquoise outer row, cream upper row) ----------
  const collarRow = (
    t: number,
    count: number,
    R: number,
    L: number,
    w: number,
    color: string,
    phase: number,
    dotColor: string | null,
  ) => {
    const Pt = neckPath.at(t);
    const T = neckPath.tangentAt(t).clone().normalize();
    const X = new THREE.Vector3(1, 0, 0);
    const V = T.clone().cross(X).normalize();
    for (let i = 0; i < count; i++) {
      const ph = phase + (i / count) * Math.PI * 2;
      const radial = X.clone().multiplyScalar(Math.cos(ph)).addScaledVector(V, Math.sin(ph));
      const base = Pt.clone().addScaledVector(radial, R + (i % 2) * 0.007);
      const dir = radial.clone().multiplyScalar(0.55).addScaledVector(T, -0.84).normalize();
      const tang = T.clone().cross(radial).normalize();
      b.extrude(feather(w, L), {
        at: base,
        x: tang,
        y: dir,
        thickness: 0.014,
        smoothing: 1,
        color,
        bone: J.neck1,
      });
      if (dotColor) {
        const thick = tang.clone().cross(dir);
        if (thick.dot(radial) < 0) thick.negate();
        b.part(new THREE.SphereGeometry(0.009, 6, 4), dotColor, {
          bone: J.neck1,
          at: base.clone().addScaledVector(dir, L * 0.62).addScaledVector(thick, 0.009),
        });
      }
    }
  };
  collarRow(0.6, 12, 0.185, 0.14, 0.058, P.turquoise, 0.2, null);
  collarRow(0.8, 12, 0.172, 0.12, 0.054, P.cream, 0, P.magenta);

  // ---------- beak: upper jaw on head ----------
  const upper = b.sweep(
    bezier([0, 1.485, 1.12], [0, 1.505, 1.27], [0, 1.47, 1.42], [0, 1.37, 1.47]),
    (t: number): [number, number] => [
      0.088 * Math.pow(1 - t, 0.75) + 0.004,
      0.078 * Math.pow(1 - t, 0.75) + 0.004,
    ],
    {
      bone: J.head,
      color: P.beakGold,
      caps: "point",
      sides: 10,
      bands: [
        [0.84, P.beakGold],
        [1, DARKGOLD],
      ],
    },
  );
  b.along(
    upper,
    4,
    (at) => b.stick(new THREE.SphereGeometry(0.009, 6, 4), P.orange, at),
    { from: 0.14, to: 0.62 },
  );
  for (const s of [1, -1]) {
    const hit = upper.at(0.2, -s * 72);
    b.stick(new THREE.SphereGeometry(1, 8, 5), P.orange, hit, { scale: [0.03, 0.013, 0.042] });
    b.stick(new THREE.SphereGeometry(1, 8, 5), BLACK, hit.moved([0, 0.008, 0]), { scale: [0.011, 0.007, 0.022] });
  }

  // ---------- lower jaw on jaw joint ----------
  const lower = b.sweep(
    catmull([
      [0, 1.375, 1.13],
      [0, 1.368, 1.28],
      [0, 1.39, 1.41],
    ]),
    (t: number): [number, number] => [
      0.064 * Math.pow(1 - t, 0.8) + 0.01,
      0.026 * Math.pow(1 - t, 0.6) + 0.009,
    ],
    { bone: J.jaw, color: P.orange, sides: 10 },
  );
  for (const s of [1, -1])
    for (const t of [0.3, 0.55])
      b.stick(new THREE.SphereGeometry(0.01, 6, 4), P.turquoise, lower.at(t, -s * 85));
  // cream chin base and pink tongue
  b.part(new THREE.SphereGeometry(1, 12, 8), P.cream, {
    bone: J.jaw,
    at: [0, 1.37, 1.12],
    scale: [0.085, 0.05, 0.085],
  });
  b.sweep(
    catmull([
      [0, 1.402, 1.17],
      [0, 1.4, 1.3],
      [0, 1.408, 1.38],
    ]),
    (t: number): [number, number] => [0.026 * (1 - t * 0.7), 0.008],
    { bone: J.jaw, color: P.pink, sides: 8 },
  );

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const az = s * 68;
    dome(maskE, az, 6, 0.078, 0.03, BLACK, -0.004, [12, 8]);
    dome(maskE, az, 6, 0.066, 0.03, P.white, 0, [12, 8]);
    dome(maskE, az, 6, 0.047, 0.03, P.turquoise, 0.004, [12, 8]);
    dome(maskE, az, 6, 0.026, 0.03, BLACK, 0.008, [10, 6]);
    dome(maskE, s * 63, 11, 0.011, 0.01, P.white, 0.033, [8, 5]);
    // brow ridge: black underlay then magenta bar
    const brow = (el: number, lift: number) => {
      const pts: THREE.Vector3[] = [];
      for (const a of [28, 48, 68, 88, 108]) {
        const { p, n } = maskE(s * a, el + (a > 90 ? -4 : 0));
        pts.push(new THREE.Vector3(p[0] + n[0] * lift, p[1] + n[1] * lift, p[2] + n[2] * lift));
      }
      return catmull(pts);
    };
    b.sweep(brow(34.5, 0.004), [0.01, 0.02, 0.022, 0.016, 0.008], { bone: J.head, color: BLACK, sides: 6 });
    b.sweep(brow(37, 0.01), [0.007, 0.014, 0.016, 0.011, 0.005], { bone: J.head, color: P.magenta, sides: 6 });
  }

  // ---------- cheek pattern ----------
  for (const s of [1, -1]) {
    [35, 52, 69, 86].forEach((a, i) => {
      dome(maskE, s * a, -26, 0.02, 0.012, BLACK, 0, [8, 5]);
      dome(maskE, s * a, -26, 0.013, 0.012, i % 2 ? P.turquoise : P.magenta, 0.003, [8, 5]);
    });
    // flower behind the eye
    const faz = 108;
    const fel = -4;
    dome(maskE, s * faz, fel, 0.042, 0.01, BLACK, -0.003, [10, 5]);
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * Math.PI * 2;
      dome(maskE, s * (faz + Math.cos(ang) * 7.5), fel + Math.sin(ang) * 7.5, 0.015, 0.012, P.pink, 0.002, [8, 5]);
    }
    dome(maskE, s * faz, fel, 0.012, 0.013, P.jaguarYellow, 0.006, [8, 5]);
  }

  // jaguar spots on the back of the skull
  for (const s of [1, -1])
    for (const [a, e] of [
      [135, 28],
      [160, 8],
    ]) {
      dome(skullE, s * a, e, 0.024, 0.012, BLACK, -0.002, [8, 5]);
    }

  // ---------- forehead diamonds ----------
  dome(maskE, 0, 50, 0.042, 0.014, BLACK, 0, [4, 2]);
  dome(maskE, 0, 50, 0.031, 0.016, P.magenta, 0.002, [4, 2]);
  dome(maskE, 0, 50, 0.015, 0.018, P.cream, 0.004, [4, 2]);
  for (const s of [1, -1]) {
    dome(maskE, s * 17, 42, 0.026, 0.012, BLACK, 0, [4, 2]);
    dome(maskE, s * 17, 42, 0.017, 0.014, P.turquoise, 0.002, [4, 2]);
  }

  // ---------- crest of seven feather blades ----------
  const crown = skullE(180, 68).p;
  b.part(new THREE.SphereGeometry(1, 10, 6), P.orange, {
    bone: J.head,
    at: [0, crown[1] - 0.012, crown[2] + 0.005],
    scale: [0.12, 0.05, 0.075],
  });
  const crestColor = (k: number) =>
    Math.abs(k) === 3 ? P.skyBlue : Math.abs(k) === 2 ? P.violet : Math.abs(k) === 1 ? P.magenta : P.red;
  const crestDot = (k: number) =>
    Math.abs(k) === 3 ? P.cream : Math.abs(k) === 2 ? P.pink : Math.abs(k) === 1 ? P.beakGold : P.cream;
  for (let k = -3; k <= 3; k++) {
    const ak = Math.abs(k);
    const dir = new THREE.Vector3(k * 0.32, 0.85 - 0.1 * ak, -0.5).normalize();
    const xw = new THREE.Vector3(dir.y, -dir.x, 0).normalize();
    const n = xw.clone().cross(dir).normalize();
    const base = new THREE.Vector3(crown[0] + k * 0.034, crown[1] - 0.02 - 0.004 * k * k, crown[2] + 0.004 * ak);
    const L = 0.26 - 0.025 * ak;
    const w = 0.047;
    b.extrude(feather(w, L, 0.007), {
      at: base,
      x: xw,
      y: dir,
      thickness: 0.014,
      smoothing: 1,
      color: BLACK,
      bone: J.head,
    });
    b.extrude(feather(w, L), {
      at: base,
      x: xw,
      y: dir,
      thickness: 0.022,
      smoothing: 1,
      color: crestColor(k),
      bone: J.head,
    });
    for (const f of [0.42, 0.74]) {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), crestDot(k), {
        bone: J.head,
        at: base.clone().addScaledVector(dir, L * f).addScaledVector(n, 0.011),
      });
    }
  }
}
    return buildHead;
  })(),
  // wings
  (() => {
type WingsCtx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, number[]>;
};

function buildWings({ b, J, P }: WingsCtx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const rand = rng(11);
  const DEG = Math.PI / 180;

  // ---------- merged decoration buckets (one part per bone + colour) ----------
  const buckets = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  const emit = (bone: any, color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) => {
    geo.applyMatrix4(m);
    const key = `${bone.name}|${color}`;
    let e = buckets.get(key);
    if (!e) buckets.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(geo);
  };
  const basis = (pos: THREE.Vector3, X: THREE.Vector3, Y: THREE.Vector3, Z: THREE.Vector3) =>
    new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(pos);
  const disc = (bone: any, color: string, r: number, seg: number, pos: any, X: any, Y: any, Z: any) =>
    emit(bone, color, new THREE.CircleGeometry(r, seg).rotateX(-Math.PI / 2), basis(pos, X, Y, Z));
  const diamond = (bone: any, color: string, size: number, pos: any, X: any, Y: any, Z: any) =>
    emit(
      bone,
      color,
      new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2).rotateY(Math.PI / 4),
      basis(pos, X, Y, Z),
    );

  // ---------- feather outline ----------
  const W = 0.12;
  const LEAD = 0.86;
  const hwTab = [
    [0, 0.5],
    [0.15, 0.88],
    [0.4, 1],
    [0.7, 0.97],
    [0.88, 0.74],
    [0.97, 0.36],
    [1, 0],
  ];
  const hwAt = (t: number) => {
    for (let k = 1; k < hwTab.length; k++) {
      if (t <= hwTab[k][0]) {
        const [t0, a] = hwTab[k - 1];
        const [t1, c] = hwTab[k];
        return a + ((c - a) * (t - t0)) / (t1 - t0);
      }
    }
    return 0;
  };
  const bladeOutline = (L: number, grow: number): any[] => {
    const ts = [0, 0.15, 0.4, 0.7, 0.88, 0.97];
    const lo = ts.map((t) => [t * L, -(hwAt(t) * W * LEAD + grow)]);
    const up = ts.map((t) => [t * L, hwAt(t) * W + grow]).reverse();
    return [...lo, [L + grow * 1.2, 0, "sharp"], ...up];
  };
  const patchOutline = (L: number, grow: number): any[] => {
    const ts = [0.78, 0.88, 0.97];
    const lo = ts.map((t) => [t * L, -(hwAt(t) * W * LEAD + grow)]);
    const up = ts.map((t) => [t * L, hwAt(t) * W + grow]).reverse();
    return [...lo, [L + grow * 1.2, 0, "sharp"], ...up, [0.72 * L, 0, "sharp"]];
  };

  const FE = [
    { blade: P.turquoise, dot: P.cream, hi: P.white, motif: P.magenta, acc: P.cream, dia: P.orange, patch: P.magenta, L: 0.8 },
    { blade: P.leafGreen, dot: P.cream, hi: P.white, motif: P.orange, acc: P.beakGold, dia: P.pink, patch: P.beakGold, L: 0.8 },
    { blade: P.skyBlue, dot: P.beakGold, hi: P.cream, motif: P.red, acc: P.cream, dia: P.magenta, patch: P.orange, L: 0.82 },
    { blade: P.violet, dot: P.pink, hi: P.white, motif: P.beakGold, acc: P.red, dia: P.turquoise, patch: P.pink, L: 0.74 },
    { blade: P.red, dot: P.beakGold, hi: P.white, motif: P.cream, acc: P.magenta, dia: P.turquoise, patch: P.beakGold, L: 0.62 },
  ];
  const ANG = [85, 68, 52, 36, 20];
  const T = 0.03;

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shJ = J[`shoulder${S}`];
    const elJ = J[`wing${S}2`];
    const sh: THREE.Vector3 = shJ.at.clone();
    const el: THREE.Vector3 = elJ.at.clone();
    const wr = el.clone().add(V(0.24 * s, 0.07, -0.04));
    const armPt = (t: number) =>
      t < 0.55
        ? sh.clone().lerp(el, t / 0.55)
        : el.clone().lerp(wr, (t - 0.55) / 0.45);
    const armBone = (t: number) => (t < 0.55 ? shJ : elJ);

    // ---------- feathers ----------
    FE.forEach((fe, i) => {
      const a = ANG[i] * DEG;
      const rise = 0.18 + 0.12 * i;
      const d = V(Math.cos(a) * s, rise, -Math.sin(a)).normalize();
      const n = UP.clone().addScaledVector(d, -UP.dot(d)).normalize();
      const w = n.clone().cross(d);
      const vT = w.clone().multiplyScalar(s);
      const ti = 0.12 + 0.2 * i;
      const R = sh.clone().lerp(el, ti).add(V(0, 0.02 + 0.014 * i, -0.035));
      const bone = i < 2 ? shJ : elJ;
      const L = fe.L;

      const blade = (outline: any[], thick: number, color: string) =>
        b.extrude(outline, { at: R, x: d, y: vT, thickness: thick, color, bone });
      blade(bladeOutline(L, 0.026), 0.022, P.spotBlack);
      blade(bladeOutline(L, 0.016), 0.026, P.cream);
      blade(bladeOutline(L, 0), T, fe.blade);
      blade(patchOutline(L, -0.004), 0.034, fe.patch);

      for (const side of [1, -1]) {
        const X = side > 0 ? w.clone() : w.clone().negate();
        const Y = side > 0 ? n.clone() : n.clone().negate();
        const Z = d.clone();
        const at = (u: number, v: number, lift: number) =>
          R.clone()
            .addScaledVector(d, u)
            .addScaledVector(vT, v)
            .addScaledVector(n, side * (T / 2 + lift));
        // centre line of dots
        for (let k = 0; k < 7; k++) {
          const u = L * (0.1 + 0.093 * k);
          disc(bone, P.spotBlack, 0.017, 5, at(u, 0, 0.002), X, Y, Z);
          disc(bone, fe.dot, 0.0125, 5, at(u, 0, 0.0045), X, Y, Z);
          if (side > 0) disc(bone, fe.hi, 0.005, 4, at(u, 0, 0.007), X, Y, Z);
        }
        for (const vs of [-1, 1]) {
          const v = vs * 0.06;
          const u = L * 0.34;
          if (i % 2 === 0) {
            // spiral motif
            disc(bone, P.spotBlack, 0.036, 7, at(u, v, 0.002), X, Y, Z);
            disc(bone, fe.motif, 0.031, 7, at(u, v, 0.0045), X, Y, Z);
            for (let k = 0; k < 11; k++) {
              const ang = k * 0.95 * vs;
              const rad = 0.004 + 0.0023 * k;
              disc(
                bone,
                fe.acc,
                0.0055,
                4,
                at(u + Math.cos(ang) * rad, v + Math.sin(ang) * rad, 0.007),
                X,
                Y,
                Z,
              );
            }
            disc(bone, P.spotBlack, 0.004, 4, at(u, v, 0.0095), X, Y, Z);
          } else {
            // diamond motif
            diamond(bone, P.spotBlack, 0.052, at(u, v, 0.002), X, Y, Z);
            diamond(bone, fe.motif, 0.04, at(u, v, 0.0045), X, Y, Z);
            diamond(bone, fe.acc, 0.022, at(u, v, 0.007), X, Y, Z);
            disc(bone, P.white, 0.006, 5, at(u, v, 0.0095), X, Y, Z);
          }
          // small second diamonds
          diamond(bone, P.spotBlack, 0.036, at(L * 0.56, v, 0.002), X, Y, Z);
          diamond(bone, fe.dia, 0.027, at(L * 0.56, v, 0.0045), X, Y, Z);
        }
        // tip patch dots
        for (const tt of [0.84, 0.92]) {
          disc(bone, P.spotBlack, 0.014, 5, at(L * tt, 0, 0.0045 + 0.002), X, Y, Z);
          disc(bone, P.cream, 0.0095, 5, at(L * tt, 0, 0.0095), X, Y, Z);
        }
      }
    });

    // ---------- arm ----------
    b.part(new THREE.SphereGeometry(0.125, 10, 8), P.magenta, { bone: shJ, at: sh, flat: true });
    const upper = b.capsule(sh, el, [0.1, 0.075], P.magenta, { bone: shJ });
    const fore = b.capsule(el, wr, [0.075, 0.055], P.magenta, { bone: elJ });
    b.part(new THREE.SphereGeometry(0.062, 8, 6), P.orange, { bone: elJ, at: wr, flat: true });
    b.spike(wr, V(s * 0.5, 0.1, 0.8), 0.13, 0.03, P.beakGold, { bone: elJ });

    // bumps (white dots with dark rim) on the shoulder ball
    const bumpDirs: THREE.Vector3[] = [V(0, 1, 0)];
    for (let k = 0; k < 6; k++) {
      const az = k * 60 * DEG;
      bumpDirs.push(V(Math.cos(az), Math.sin(40 * DEG), Math.sin(az)).normalize());
    }
    for (const dir of bumpDirs) {
      const q = aim(dir);
      const rot = new THREE.Matrix4().makeRotationFromQuaternion(q);
      const place = (r: number, rad: number, sy: number, color: string) => {
        const g = new THREE.SphereGeometry(r, 6, 4).scale(1, sy, 1);
        emit(shJ, color, g, new THREE.Matrix4().copy(rot).setPosition(sh.clone().addScaledVector(dir, rad)));
      };
      place(0.03, 0.122, 0.5, P.spotBlack);
      place(0.022, 0.124, 0.6, P.white);
    }

    // dots on the arm tubes
    const armDots = (sw: any, bone: any, ts: number[]) => {
      ts.forEach((t, k) => {
        const degs = k % 2 === 0 ? [-45, 45] : [0, -90, 90];
        for (const dg of degs) {
          const h = sw.at(t, dg);
          const q = aim(h.n);
          const rot = new THREE.Matrix4().makeRotationFromQuaternion(q);
          const place = (r: number, lift: number, color: string, seg: number) =>
            emit(
              bone,
              color,
              new THREE.CircleGeometry(r, seg).rotateX(-Math.PI / 2),
              new THREE.Matrix4().copy(rot).setPosition(h.at.clone().addScaledVector(h.n, lift)),
            );
          place(0.021, 0.003, P.spotBlack, 6);
          place(0.015, 0.0055, P.white, 6);
          place(0.005, 0.008, P.pink, 4);
        }
      });
    };
    armDots(upper, shJ, [0.3, 0.45, 0.72, 0.88]);
    armDots(fore, elJ, [0.25, 0.5, 0.8]);

    // bands
    const band = (a: THREE.Vector3, c: THREE.Vector3, t: number, r0: number, r1: number, bone: any, color: string) => {
      const Z = c.clone().sub(a).normalize();
      const X = Z.clone().cross(UP).normalize();
      const Y = Z.clone().cross(X);
      const r = (r0 + (r1 - r0) * t) * 1.06;
      emit(bone, color, new THREE.TorusGeometry(r, 0.012, 4, 10), basis(a.clone().lerp(c, t), X, Y, Z));
    };
    band(sh, el, 0.62, 0.1, 0.075, shJ, P.cream);
    band(sh, el, 0.9, 0.1, 0.075, shJ, P.turquoise);
    band(el, wr, 0.35, 0.075, 0.055, elJ, P.turquoise);
    band(el, wr, 0.65, 0.075, 0.055, elJ, P.cream);

    // ---------- coverts along the leading edge ----------
    for (let j = 0; j < 7; j++) {
      const t = 0.08 + 0.135 * j;
      const pt = armPt(t);
      const bone = armBone(t);
      const a = (85 - 60 * t) * DEG;
      const d = V(Math.cos(a) * s, 0.22 + 0.3 * t, -Math.sin(a)).normalize();
      const n = UP.clone().addScaledVector(d, -UP.dot(d)).normalize();
      const w = n.clone().cross(d);
      const k = 0.92 + rand() * 0.16;
      // back row: yellow
      emit(
        bone,
        P.jaguarYellow,
        new THREE.SphereGeometry(1, 6, 4).scale(0.052 * k, 0.011, 0.105 * k),
        basis(pt.clone().add(V(0, 0.04, -0.03)).addScaledVector(d, 0.07), w, n, d),
      );
      // front row: orange with a dotted centre
      const cB = pt.clone().add(V(0, 0.058, 0.01)).addScaledVector(d, 0.045);
      emit(
        bone,
        P.orange,
        new THREE.SphereGeometry(1, 6, 4).scale(0.04 * k, 0.011, 0.072 * k),
        basis(cB, w, n, d),
      );
      const top = cB.clone().addScaledVector(n, 0.012);
      disc(bone, P.spotBlack, 0.013, 5, top, w, n, d);
      disc(bone, P.cream, 0.0085, 5, top.clone().addScaledVector(n, 0.0025), w, n, d);
    }
  }

  // ---------- flush merged decoration ----------
  for (const e of buckets.values()) {
    const merged = mergeGeometries(e.geos);
    if (merged) b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
  }
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const X = new THREE.Vector3(1, 0, 0);
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);

  // ---------------------------------------------------------------- tail tube
  const root = M.tailRoot;
  const path = catmull([
    root,
    [0, 0.97, -0.92],
    [0, 1.0, -1.1],
    [0, 1.07, -1.28],
    [0, 1.2, -1.45],
    [0, 1.3, -1.52],
    [0, 1.36, -1.52],
  ]);

  // black ring bands over jaguar yellow
  const bandCentres = [0.12, 0.27, 0.42, 0.57, 0.72, 0.87];
  const tail = b.sweep(path, (t: number) => 0.078 - 0.038 * t, {
    bone: [J.tail1, J.tail2, J.tail3],
    sides: 8,
    color: (t: number) => (bandCentres.some((c) => Math.abs(t - c) < 0.04) ? P.spotBlack : P.jaguarYellow),
  });

  // row of white dots along the top, each with a dark outline
  b.along(
    tail,
    8,
    (at) => {
      b.stick(sph(0.019), P.spotBlack, at, { embed: 0.4, flat: true });
      b.stick(sph(0.012), P.white, at.moved([0, 0.009, 0]), { embed: 0.3, flat: true });
    },
    { from: 0.06, to: 0.88 },
  );

  // small rosettes on both flanks
  for (const a of [90, -90]) {
    for (const t of [0.2, 0.42, 0.64]) {
      const hit = tail.at(t, a);
      b.stick(sph(0.024), P.spotBlack, hit, { embed: 0.5, flat: true });
      b.stick(sph(0.011), P.magenta, hit.moved([0, 0.013, 0]), { embed: 0.3, flat: true });
    }
  }

  // ---------------------------------------------------------------- turquoise spiral curls
  for (const s of [1, -1]) {
    const p = path.at(0.55);
    const from: [number, number, number] = [s * 0.05, p.y + 0.01, p.z];
    const center: [number, number, number] = [s * 0.05, p.y + 0.07, p.z];
    const curl = spiral(center, from, [s, 0, 0], { turns: 1.4, r1: 0.018 });
    b.sweep(curl, [0.015, 0.006], { bone: J.tail2, color: P.turquoise, caps: { start: "flat", end: "round" } });
    b.part(sph(0.017), P.magenta, { bone: J.tail2, at: curl.at(1) });
  }

  // ---------------------------------------------------------------- tail feather fan
  const end = path.at(1);
  const tangent = path.tangentAt(1);
  const u = new THREE.Vector3(0, 0.82, -0.57).normalize();
  const n = X.clone().cross(u).normalize();
  const origin = end.clone().addScaledVector(u, -0.03);

  // root collar
  b.part(sph(0.064, 8, 6), P.skyBlue, { bone: J.tail3, at: end });
  b.ring(frame(end, tangent), { count: 8, radius: 0.058 }, (item) => {
    b.stick(sph(0.013), P.cream, item, { bone: J.tail3, embed: 0.5, flat: true });
  });

  const leaf = (L: number, w: number): [number, number, string?][] => [
    [0, -0.18 * w],
    [0.18 * L, -0.46 * w],
    [0.58 * L, -0.5 * w],
    [0.88 * L, -0.3 * w],
    [L, 0, "sharp"],
    [0.88 * L, 0.3 * w],
    [0.58 * L, 0.5 * w],
    [0.18 * L, 0.46 * w],
    [0, 0.18 * w],
  ];
  const featherColors = [P.red, P.orange, P.magenta, P.violet, P.turquoise];

  for (let i = 0; i < 5; i++) {
    const k = i - 2;
    const a = (k * 24 * Math.PI) / 180;
    const d = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(X, Math.sin(a)).normalize();
    const w = n.clone().cross(d).normalize();
    const L = 0.42 - 0.03 * Math.abs(k);
    const W = 0.17;
    const o = origin.clone().addScaledVector(n, 0.018 * Math.abs(k));
    const jt = b.joint(`tailFeather${i + 1}`, { parent: J.tail3, at: origin, dir: d, role: "fan" });
    const base = { x: d.toArray(), y: w.toArray(), bone: jt } as const;

    // dark outline, main blade, cream tip, cream centre strip
    b.extrude(leaf(L + 0.014, W * 1.16), {
      ...base,
      at: o.clone().addScaledVector(d, -0.007),
      thickness: 0.01,
      smoothing: 1,
      color: P.spotBlack,
    });
    b.extrude(leaf(L, W), { ...base, at: o, thickness: 0.016, smoothing: 1, color: featherColors[i] });
    b.extrude(
      [
        [0.74 * L, -0.33 * W],
        [0.87 * L, -0.24 * W],
        [0.955 * L, 0],
        [0.87 * L, 0.24 * W],
        [0.74 * L, 0.33 * W],
      ],
      { ...base, at: o, thickness: 0.02, color: P.cream },
    );
    b.extrude(
      [
        [0.08 * L, -0.008],
        [0.74 * L, -0.008],
        [0.74 * L, 0.008],
        [0.08 * L, 0.008],
      ],
      { ...base, at: o, thickness: 0.022, color: P.cream },
    );
    // dotted centre
    for (const t of [0.22, 0.38, 0.54]) {
      b.part(sph(0.017), P.spotBlack, {
        bone: jt,
        at: o.clone().addScaledVector(d, L * t),
        flat: true,
      });
    }
  }

  // ---------------------------------------------------------------- back-hip flowers
  const flowerN = new THREE.Vector3(0, 0.9, -0.4).normalize();
  const flowers: [number, number, number][] = [
    [0, 1.2, -0.74],
    [0.15, 1.14, -0.79],
    [-0.15, 1.14, -0.79],
  ];
  flowers.forEach((c, idx) => {
    const cv = new THREE.Vector3(...c);
    b.ring(frame(cv, flowerN), { count: 6, radius: 0.034 }, (item) => {
      b.stick(sph(0.03), P.pink, item, { bone: J.tail1, scale: [0.8, 1.5, 0.5], embed: 0.2, flat: true });
    });
    b.part(sph(0.03), P.beakGold, {
      bone: J.tail1,
      at: cv.clone().addScaledVector(flowerN, 0.012),
      flat: true,
    });
    // two green leaves lying out from each flower
    const sgn = idx === 0 ? 1 : Math.sign(c[0]);
    for (const m of [1, -1]) {
      const dir = new THREE.Vector3(m * (0.7 + 0.2 * rand()), 0.1, -0.5).normalize();
      const dirRot = idx === 0 ? dir : new THREE.Vector3(sgn * 0.8, 0.05, -0.25 * m).normalize();
      const pos = cv.clone().addScaledVector(dirRot, 0.1).addScaledVector(flowerN, -0.015);
      b.part(sph(0.04), P.leafGreen, {
        bone: J.tail1,
        at: pos,
        dir: dirRot.toArray(),
        scale: [0.4, 1.7, 0.16],
        flat: true,
      });
      if (idx !== 0) break;
    }
  });
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.85,-0.4], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.9,0.4], dir: [0,0,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.05,0.65], dir: [0,0.7,0.7], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck1"], at: [0,1.4,0.95], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.42,1.15], dir: [0,0,1], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.35,1.15,0.3], dir: [1,0.3,0], role: "wing" });
  J["wingL2"] = b.joint("wingL2", { parent: J["shoulderL"], at: [0.8,1.3,0.2], dir: [1,0.3,-0.1], role: "wing" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.35,1.15,0.3], dir: [-1,0.3,0], role: "wing" });
  J["wingR2"] = b.joint("wingR2", { parent: J["shoulderR"], at: [-0.8,1.3,0.2], dir: [-1,0.3,-0.1], role: "wing" });
  J["legFL"] = b.joint("legFL", { parent: J["chest"], at: [0.3,0.7,0.55], dir: [0,-1,0], role: "leg" });
  J["legFR"] = b.joint("legFR", { parent: J["chest"], at: [-0.3,0.7,0.55], dir: [0,-1,0], role: "leg" });
  J["legBL"] = b.joint("legBL", { parent: J["hips"], at: [0.3,0.7,-0.5], dir: [0,-1,0], role: "leg" });
  J["legBR"] = b.joint("legBR", { parent: J["hips"], at: [-0.3,0.7,-0.5], dir: [0,-1,0], role: "leg" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.95,-0.75], dir: [0,0.2,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1,-1.1], dir: [0,0.4,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.2,-1.45], dir: [0,0.8,-0.6], role: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
