import * as THREE from "three";
import { createBuilder, type Builder, type Joint, bezier, catmull, rng, spiral, frame } from "../../../../src/index";

export const meta = {
  "name": "Baku, Dream-Eating Tapir Spirit",
  "description": "A stylized ukiyo-e woodblock-print baku: a tapir-bodied spirit with a trunk-like snout, tiger paws, an ox tail and swirling indigo cloud-wreathed mane, standing in rest pose."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  coat: "#1d2a4a",
  coatLight: "#2f4a7a",
  cream: "#f1e6c8",
  ink: "#14121a",
  vermilion: "#d6402a",
  gold: "#e8b53a",
  ivory: "#f7f0dc",
  cloudWhite: "#eef2f4",
  wave: "#3d7fa6",
  pink: "#e8908a",
  pawDark: "#2a2230",
  claw: "#e9dfc4",
};
const M = {
  neckBase: [0, 1.2, 0.85] as [number, number, number],
  headPivot: [0, 1.1, 1.35] as [number, number, number],
  jawHinge: [0, 0.85, 1.65] as [number, number, number],
  shoulderL: [0.35, 1.05, 0.7] as [number, number, number],
  hipL: [0.35, 1.05, -0.8] as [number, number, number],
  tailRoot: [0, 1.2, -1.35] as [number, number, number],
  spineTop: [0, 1.45, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildTorso({ b, J, P, M }: Ctx) {
  const rand = rng(11);

  // ------------------------------------------------------------------
  // Geometry helpers
  // ------------------------------------------------------------------
  // Half-annulus arc (seigaiha wave scale). Base sits on the surface, apex points along local +Z.
  const arcGeo = (ro: number, ri: number, d: number) => {
    const sh = new THREE.Shape();
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI * i) / n;
      if (i === 0) sh.moveTo(ro * Math.cos(a), ro * Math.sin(a));
      else sh.lineTo(ro * Math.cos(a), ro * Math.sin(a));
    }
    for (let i = n; i >= 0; i--) {
      const a = (Math.PI * i) / n;
      sh.lineTo(ri * Math.cos(a), ri * Math.sin(a));
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, -ro * 0.5, 0);
    g.rotateX(Math.PI / 2);
    g.translate(0, d, 0);
    return g;
  };

  // ------------------------------------------------------------------
  // Barrel body: one loft over hips and chest
  // ------------------------------------------------------------------
  const stations = [
    { at: [0, 1.13, -1.4], w: 0.6, h: 0.54 },
    { at: [0, 1.14, -1.1], w: 0.98, h: 0.7 },
    { at: [0, 1.12, -0.7], w: 1.08, h: 0.74 },
    { at: [0, 1.12, -0.2], w: 1.06, h: 0.74 },
    { at: [0, 1.13, 0.3], w: 1.04, h: 0.74 },
    { at: [0, 1.15, 0.7], w: 0.96, h: 0.72 },
    { at: [0, 1.17, 0.85], w: 0.78, h: 0.64 },
    { at: [0, 1.18, 0.95], w: 0.5, h: 0.46 },
  ];
  const spine = catmull(stations.map((s) => s.at));
  const tAt = (z: number) => spine.closestT([0, 1.13, z]);

  const SADDLE_A = -0.62;
  const SADDLE_B = -0.02;
  const t0 = tAt(SADDLE_A);
  const t1 = tAt(SADDLE_B);

  const body = b.loft(stations, {
    bone: [J.hips, J.chest],
    color: P.coat,
    caps: { start: "round", end: "flat" },
    bands: [
      [t0, P.coat],
      [t1, P.cream],
      [1, P.coat],
    ],
    sectors: [
      [115, 245, P.cream],
      [-40, 40, P.coatLight, 0.04, t0 - 0.02],
      [-40, 40, P.coatLight, t1 + 0.02, 0.96],
    ],
  });
  const surf = b.surface(body);

  // ink outline along the cream belly edge
  for (const ang of [115, 245]) {
    b.sweep(body.line(ang, 0.002), 0.007, { color: P.ink, sides: 5 });
  }

  // ------------------------------------------------------------------
  // Saddle band trim: ink edges, vermilion inset lines, gold bead row
  // ------------------------------------------------------------------
  const girth = (z: number, lift: number) => surf.loop([0, 1.13, z], { dir: [0, 0, 1], lift });
  for (const z of [SADDLE_A, SADDLE_B]) {
    b.sweep(girth(z, 0.002), 0.013, { color: P.ink, sides: 6 });
  }
  for (const z of [SADDLE_A + 0.05, SADDLE_B - 0.05]) {
    b.sweep(girth(z, 0.003), 0.008, { color: P.vermilion, sides: 6 });
  }
  const beadGeo = new THREE.SphereGeometry(0.018, 6, 4);
  b.along(girth((SADDLE_A + SADDLE_B) / 2, 0.004), 10, (at: any) => {
    b.part(beadGeo, P.gold, { at });
  });

  // ------------------------------------------------------------------
  // Wave (seigaiha) trim along both flanks
  // ------------------------------------------------------------------
  const arcInk = arcGeo(0.075, 0.04, 0.012);
  const arcWave = arcGeo(0.067, 0.048, 0.016);
  const arcWhite = arcGeo(0.044, 0.03, 0.02);
  for (const s of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const z = -1.1 + 0.2 * i;
      const h = surf.around([0, 1.13, z]).at(s * 90, -8);
      if (!h) continue;
      const o = { embed: 0.5, flow: [0, 1, 0], flat: true };
      b.stick(arcInk, P.ink, h, o);
      b.stick(arcWave, P.wave, h, o);
      b.stick(arcWhite, P.cloudWhite, h, o);
    }
  }

  // ------------------------------------------------------------------
  // Vermilion seal emblems (square + glyph) on shoulders and haunches
  // ------------------------------------------------------------------
  const sealInk = new THREE.BoxGeometry(0.19, 0.03, 0.19);
  const sealRed = new THREE.BoxGeometry(0.16, 0.03, 0.16);
  const barA = new THREE.BoxGeometry(0.06, 0.03, 0.014);
  const barB = new THREE.BoxGeometry(0.05, 0.03, 0.014);
  const barC = new THREE.BoxGeometry(0.095, 0.03, 0.014);
  const barV = new THREE.BoxGeometry(0.015, 0.03, 0.105);
  const seal = (s: number, z: number) => {
    const h = surf.around([0, 1.13, z]).at(s * 90, 25);
    if (!h) return;
    const flow = [0, 1, 0];
    b.stick(sealInk, P.ink, h, { embed: 0.7, flow, flat: true });
    b.stick(sealRed, P.vermilion, h, { embed: 0.55, flow, flat: true });
    const bars: [THREE.BufferGeometry, number][] = [
      [barA, 0.04],
      [barB, 0.0],
      [barC, -0.04],
    ];
    for (const [g, up] of bars) {
      const hp = surf.nearest(h.local({ up }));
      b.stick(g, P.ivory, hp, { embed: 0.4, flow, flat: true });
    }
    b.stick(barV, P.ivory, h, { embed: 0.4, flow, flat: true });
  };
  for (const s of [1, -1]) {
    seal(s, 0.45); // shoulder
    seal(s, -0.95); // haunch
  }

  // ------------------------------------------------------------------
  // Ox tail with vermilion / cloud-white tuft
  // ------------------------------------------------------------------
  const tip = new THREE.Vector3(0, 0.9, -1.8);
  const tailPath = catmull([M.tailRoot, J.tail2.at, tip]);
  const tailR = (t: number) => 0.085 * (1 - t) + 0.03;
  b.sweep(tailPath, tailR, {
    bone: [J.tail1, J.tail2],
    color: P.coat,
    sides: 8,
    caps: { start: "round", end: "round" },
  });

  const cuff = (t: number, w: number, color: string, bone: any) => {
    const r = tailR(t);
    const ri = r * 0.9;
    const ro = r * 1.1 + 0.008;
    b.lathe(
      [
        [ri, -w / 2],
        [ro, -w / 2],
        [ro, w / 2],
        [ri, w / 2],
      ],
      { at: tailPath.at(t), axis: tailPath.tangentAt(t), segments: 8, color, bone },
    );
  };
  cuff(0.52, 0.045, P.vermilion, J.tail1);
  cuff(0.52 - 0.04, 0.012, P.ink, J.tail1);
  cuff(0.52 + 0.04, 0.012, P.ink, J.tail2);
  cuff(0.74, 0.03, P.gold, J.tail2);

  // tuft: fan of flat blades hanging down and back
  const A = new THREE.Vector3(0, -0.85, -0.5).normalize();
  const U = new THREE.Vector3(1, 0, 0);
  const V = new THREE.Vector3().crossVectors(A, U).normalize();
  const blade = (color: string, a: number, spread: number, L: number, wMax: number) => {
    const side = U.clone().multiplyScalar(Math.cos(a)).add(V.clone().multiplyScalar(Math.sin(a)));
    const dir = A.clone().multiplyScalar(Math.cos(spread)).add(side.multiplyScalar(Math.sin(spread)));
    const end = tip.clone().addScaledVector(dir, L);
    const ctrl = tip.clone().addScaledVector(dir, L * 0.55).add(new THREE.Vector3(0, -0.025, 0.0));
    b.sweep(
      bezier(tip, ctrl, end),
      (t: number) => [wMax * Math.sin(Math.PI * Math.pow(Math.min(t, 1), 0.7)) * 0.9 + 0.004, 0.006],
      { color, bone: J.tail2, sides: 6, caps: { start: "flat", end: "point" } },
    );
  };
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    blade(P.vermilion, a, 0.6, 0.17 + (i % 2) * 0.03 + rand() * 0.01, 0.034);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    blade(P.cloudWhite, a, 0.28, 0.14 + rand() * 0.015, 0.026);
  }
  b.part(new THREE.SphereGeometry(0.036, 7, 5), P.gold, { at: tip, bone: J.tail2 });
}
    return buildTorso;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);

  // A flat leaf-shaped fur blade rooted at `base`, growing along `dir`, wide across `side`.
  const blade = (
    base: THREE.Vector3,
    dir: THREE.Vector3,
    L: number,
    w: number,
    color: string,
    bone: any,
    side: THREE.Vector3 = V(1, 0, 0),
  ) => {
    const y = dir.clone().normalize();
    let x = side.clone().addScaledVector(y, -side.dot(y));
    if (x.lengthSq() < 1e-4) x = V(0, 0, 1).addScaledVector(y, -y.z);
    x.normalize();
    return b.extrude(
      [
        [-0.35 * w, 0],
        [0.35 * w, 0],
        [0.5 * w, 0.3 * L],
        [0.28 * w, 0.7 * L],
        [0, L, "sharp"],
        [-0.28 * w, 0.7 * L],
        [-0.5 * w, 0.3 * L],
      ],
      { at: base, x, y, thickness: 0.012, color, bone },
    );
  };

  // Kumo cloud outline: five scalloped bumps, stretched sideways.
  const cloudOutline = (R: number) => {
    const out: [number, number][] = [];
    const N = 20;
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      const r = R * (0.78 + 0.22 * Math.abs(Math.sin(2.5 * th)));
      out.push([Math.cos(th) * r * 1.25, Math.sin(th) * r]);
    }
    return out;
  };

  for (const s of [1, -1]) {
    for (const front of [true, false]) {
      const tag = (front ? "F" : "B") + (s > 0 ? "L" : "R");
      const hipJ = J["hip" + tag];
      const kneeJ = J["knee" + tag];
      const x = s * 0.35;
      const z = front ? 0.7 : -0.8;

      // ---- leg path and sweep ----
      const pts: number[][] = front
        ? [
            [x, 1.1, z],
            [x, 0.85, z],
            [x, 0.6, z + 0.01],
            [x, 0.36, z + 0.02],
            [x, 0.16, z + 0.02],
          ]
        : [
            [x, 1.1, z],
            [x, 0.85, z + 0.03],
            [x, 0.6, z],
            [x, 0.38, z - 0.05],
            [x, 0.16, z - 0.03],
          ];
      const path = catmull(pts);
      const tOf = (y: number) => path.closestT(V(x, y, path.at(0.5).z));
      const k = front ? 1 : 1.1;
      const radii = [0.15, 0.14, 0.125, 0.11, 0.095, 0.088, 0.085, 0.09].map((r) => r * k);
      const tA = tOf(0.6);
      const tB = tOf(0.54);
      const sw = b.sweep(path, radii, {
        bone: [hipJ, kneeJ],
        color: P.cream,
        bands: [
          [tA, P.coat],
          [tB, P.coatLight],
          [1, P.cream],
        ],
        sides: 8,
        smooth: false,
      });

      // ---- cream fur fringe where indigo fades into cream ----
      const tF = tOf(0.64);
      for (let i = 0; i < 6; i++) {
        const ang = i * 60 + (front ? 0 : 30);
        const p = sw.at(tF, ang);
        const n = p.n.clone();
        const dir = V(0, -0.85, 0).addScaledVector(n, 0.5);
        const side = new THREE.Vector3().crossVectors(UP, n);
        blade(p.at.clone().addScaledVector(n, -0.012), dir, 0.14, 0.105, P.cream, kneeJ, side);
      }

      // ---- elbow (front) / hock (hind) tuft at the back of the leg ----
      const tT = tOf(front ? 0.84 : 0.68);
      for (let i = 0; i < 4; i++) {
        const p = sw.at(tT, 180 + (i - 1.5) * 28);
        const n = p.n.clone();
        const dir = V(0, -0.65, 0).addScaledVector(n, 0.75);
        blade(
          p.at.clone().addScaledVector(n, -0.02),
          dir,
          0.15 + 0.03 * (i % 2),
          0.07,
          P.cream,
          front ? hipJ : kneeJ,
        );
      }

      // ---- cloud-swirl motif on the outer thigh ----
      const zThigh = path.at(tOf(0.93)).z;
      const hit = b.surface(sw).ray([s * 1, 0.93, zThigh], [-s, 0, 0]);
      if (hit) {
        const n = hit.n.clone();
        const c = hit.at.clone();
        const xdir: [number, number, number] = [0, 0, -s];
        b.extrude(cloudOutline(0.062), {
          at: c.clone().addScaledVector(n, -0.012),
          x: xdir,
          y: [0, 1, 0],
          thickness: 0.03,
          color: P.ink,
          bone: hipJ,
        });
        b.extrude(cloudOutline(0.051), {
          at: c.clone().addScaledVector(n, -0.008),
          x: xdir,
          y: [0, 1, 0],
          thickness: 0.03,
          color: P.cloudWhite,
          bone: hipJ,
        });
        const cc = c.clone().addScaledVector(n, 0.008);
        const sp = spiral(cc, cc.clone().addScaledVector(UP, 0.026), n, { turns: 1.3, r1: 0.006 });
        b.sweep(sp, 0.0055, { color: P.wave, bone: hipJ, sides: 5 });
        b.part(new THREE.SphereGeometry(0.011, 6, 4), P.vermilion, {
          at: c.clone().addScaledVector(n, 0.011),
          bone: hipJ,
        });
      }

      // ---- vermilion anklet ring with ink edging and gold studs ----
      const cA = path.at(tOf(0.215));
      b.part(new THREE.TorusGeometry(0.1, 0.018, 5, 12), P.vermilion, {
        at: cA,
        bone: kneeJ,
        rotation: [90, 0, 0],
        flat: true,
      });
      for (const dy of [-0.027, 0.027]) {
        b.part(new THREE.TorusGeometry(0.097, 0.007, 4, 12), P.ink, {
          at: cA.clone().add(V(0, dy, 0)),
          bone: kneeJ,
          rotation: [90, 0, 0],
          flat: true,
        });
      }
      for (const a of [-38, 38]) {
        const r = (a * Math.PI) / 180;
        b.part(new THREE.SphereGeometry(0.016, 6, 4), P.gold, {
          at: cA.clone().add(V(Math.sin(r) * 0.114, 0, Math.cos(r) * 0.114)),
          bone: kneeJ,
        });
      }

      // ---- tiger paw ----
      const zAnk = path.at(1).z;
      const zp = zAnk + 0.04;
      b.part(new THREE.SphereGeometry(1, 8, 6), P.pawDark, {
        at: [x, 0.07, zp],
        scale: [0.125, 0.075, 0.17],
        bone: kneeJ,
        flat: true,
      });
      // sock fringe hanging over the paw
      const tS = tOf(0.18);
      for (let i = 0; i < 5; i++) {
        const p = sw.at(tS, i * 72 + (front ? 0 : 36));
        const n = p.n.clone();
        const dir = V(0, -0.8, 0).addScaledVector(n, 0.6);
        const side = new THREE.Vector3().crossVectors(UP, n);
        blade(p.at.clone().addScaledVector(n, -0.01), dir, 0.08, 0.07, P.cream, kneeJ, side);
      }
      // three toe bumps with pale claws
      for (const [i, dx] of [-0.055, 0, 0.055].entries()) {
        const tz = zp + 0.115 + (i === 1 ? 0.02 : 0);
        b.part(new THREE.SphereGeometry(1, 7, 5), P.pawDark, {
          at: [x + dx, 0.04, tz],
          scale: [0.044, 0.04, 0.05],
          bone: kneeJ,
          flat: true,
        });
        b.spike(V(x + dx, 0.03, tz + 0.04), V(dx * 2, -0.25, 1), 0.075, 0.014, {
          color: P.claw,
          bone: kneeJ,
          sides: 6,
        });
      }
    }
  }
}
    return buildLegs;
  })(),
  // headFace
  (() => {
function buildHeadFace({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const R = rng(11);

  const COAT = P.coat;
  const COATLIGHT = P.coatLight;
  const CREAM = P.cream;
  const INK = P.ink;
  const VERM = P.vermilion;
  const GOLD = P.gold;
  const IVORY = P.ivory;
  const CLOUD = P.cloudWhite;
  const WAVE = P.wave;
  const PINK = P.pink;
  const TONGUE = "#c9625f";

  const sph = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
  const cyl = (r: number, h: number, seg = 12) => new THREE.CylinderGeometry(r, r, h, seg);

  type Seat = { at: THREE.Vector3; axis: THREE.Vector3 };
  // Seats a part on a surface frame, `off` metres out along its facing axis.
  const seat = (
    f: Seat,
    geo: THREE.BufferGeometry,
    color: string,
    off: number,
    scale?: [number, number, number],
    bone = J.head,
  ) =>
    b.part(geo, color, {
      at: f.at.clone().addScaledVector(f.axis, off),
      dir: f.axis,
      bone,
      scale,
      flat: true,
    });

  // ------------------------------------------------------------------ neck
  const neckPath = catmull([
    [0, M.neckBase[1], M.neckBase[2] - 0.05],
    [0, 1.18, 1.1],
    [0, M.headPivot[1] + 0.02, M.headPivot[2] + 0.05],
  ]);
  const neck = b.sweep(neckPath, (t) => [0.275 - 0.075 * t, 0.28 - 0.08 * t], {
    color: COAT,
    bone: [J.neck1, J.head],
    sides: 10,
    caps: "flat",
    sectors: [
      [-55, 55, COATLIGHT],
      [125, 235, CREAM],
    ],
  });

  // seigaiha-style wave roundels on the neck flanks
  const neckSkin = b.surface(neck);
  const disc = (r: number, h = 0.01) => new THREE.CylinderGeometry(r, r, h, 8);
  const roundels = neckSkin.scatter(12, {
    rng: R,
    minDist: 0.1,
    filter: (h) => Math.abs(h.n.x) > 0.55 && h.at.z > 0.93 && h.at.z < 1.3,
  });
  for (const h of roundels) {
    b.stick(disc(0.049, 0.008), INK, h.moved([0, -0.002, 0]), { embed: 0.5 });
    b.stick(disc(0.042), WAVE, h, { embed: 0.5 });
    b.stick(disc(0.032), CLOUD, h.moved([0, 0.003, 0]), { embed: 0.5 });
    b.stick(disc(0.021), WAVE, h.moved([0, 0.006, 0]), { embed: 0.5 });
    b.stick(disc(0.009), INK, h.moved([0, 0.009, 0]), { embed: 0.5 });
  }

  // ------------------------------------------------------------------ skull
  const skullC = V(0, 1.14, 1.48);
  const skull = b.part(sph(14, 10), COAT, { at: skullC, scale: [0.23, 0.23, 0.27], bone: J.head, flat: true });
  const cheeks = [1, -1].map((s) =>
    b.part(sph(10, 8), COAT, { at: V(s * 0.09, 1.0, 1.52), scale: [0.13, 0.13, 0.16], bone: J.head, flat: true }),
  );
  const faceSurf = b.surface([skull, ...cheeks]);
  const HIT = (az: number, el: number) => faceSurf.around(skullC).at(az, el)!;

  // ------------------------------------------------------------------ upper jaw, mouth interior
  b.frustumBox([0, 0.99, 1.46], [0, 0.985, 1.8], [0.36, 0.2], [0.2, 0.14], { color: COAT, bone: J.head });
  b.part(new THREE.BoxGeometry(0.16, 0.01, 0.28), PINK, { at: [0, 0.9, 1.64], bone: J.head });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.01), INK, { at: [0, 0.9, 1.52], bone: J.head });
  for (const s of [1, -1])
    b.rod([s * 0.18, 0.89, 1.46], [s * 0.1, 0.915, 1.8], 0.006, INK, { bone: J.head, sides: 5 });

  // ------------------------------------------------------------------ lower jaw (on the jaw joint)
  b.frustumBox([0, 0.8, 1.5], [0, 0.8, 1.9], [0.26, 0.12], [0.17, 0.09], { color: COAT, bone: J.jaw });
  b.frustumBox([0, 0.8, 1.84], [0, 0.8, 1.915], [0.19, 0.105], [0.17, 0.1], { color: CREAM, bone: J.jaw });
  b.part(new THREE.BoxGeometry(0.15, 0.008, 0.3), PINK, { at: [0, 0.862, 1.68], bone: J.jaw });
  b.part(new THREE.BoxGeometry(0.07, 0.014, 0.2), TONGUE, { at: [0, 0.87, 1.7], bone: J.jaw });
  for (const s of [1, -1]) {
    b.rod([s * 0.13, 0.862, 1.5], [s * 0.085, 0.848, 1.9], 0.006, INK, { bone: J.jaw, sides: 5 });
    b.part(new THREE.BoxGeometry(0.025, 0.03, 0.02), IVORY, { at: [s * 0.035, 0.862, 1.88], bone: J.jaw });
  }
  for (const z of [1.86, 1.76, 1.66])
    b.spike([0, 0.76, z], [0, -1, -0.4], 0.075, 0.026, { color: CREAM, bone: J.jaw, sides: 5 });

  // ------------------------------------------------------------------ trunk-like snout
  const snoutPath = catmull([
    [0, 1.1, 1.58],
    [0, 1.08, 1.74],
    [0, 1.02, 1.85],
    [0, 0.92, 1.92],
  ]);
  const snout = b.sweep(snoutPath, [0.15, 0.125, 0.1, 0.082], {
    color: (t) => (t < 0.72 ? COAT : t < 0.86 ? CREAM : PINK),
    bone: J.head,
    sides: 10,
  });
  const snoutSkin = b.surface(snout);
  const snoutR = (t: number) => 0.15 - 0.068 * t;
  for (const t of [0.2, 0.33, 0.46, 0.59])
    b.part(new THREE.TorusGeometry(snoutR(t) * 1.04, 0.004, 4, 12), INK, {
      at: snoutPath.at(t),
      dir: snoutPath.tangentAt(t),
      axis: "z",
      bone: J.head,
    });
  for (const t of [0.72, 0.86])
    b.part(new THREE.TorusGeometry(snoutR(t) * 1.05, 0.005, 4, 12), INK, {
      at: snoutPath.at(t),
      dir: snoutPath.tangentAt(t),
      axis: "z",
      bone: J.head,
    });
  b.along(snout, 4, (at) => b.stick(new THREE.SphereGeometry(0.014, 6, 4), GOLD, at, { embed: 0.4 }), {
    from: 0.1,
    to: 0.6,
  });
  // nostrils
  const tip = snoutPath.at(0.93);
  for (const s of [1, -1]) {
    const nh = snoutSkin.around(tip).at(s * 32, -8);
    if (nh) {
      seat(nh, sph(8, 6), INK, -0.002, [0.02, 0.012, 0.028]);
      seat(nh, sph(6, 4), CLOUD, 0.004, [0.006, 0.004, 0.006]);
    }
  }
  // whiskers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const wh = snoutSkin.around(snoutPath.at(0.38)).at(s * 82, 10 - i * 16);
      if (!wh) continue;
      const p0 = wh.at;
      const c = p0.clone().add(V(s * 0.1, 0.03, 0.04));
      const e = p0.clone().add(V(s * 0.17, -0.05 - 0.03 * i, 0.07 + 0.02 * i));
      b.sweep(bezier(p0, c, e), [0.007, 0.0015], { color: CLOUD, bone: J.head, sides: 4 });
    }

  // ------------------------------------------------------------------ tusks (curved ivory, gold collars)
  for (const s of [1, -1]) {
    const p0 = V(s * 0.09, 0.84, 1.8);
    const p1 = V(s * 0.125, 0.93, 1.86);
    const p2 = V(s * 0.138, 1.03, 1.9);
    const p3 = V(s * 0.125, 1.12, 1.935);
    b.sweep(bezier(p0, p1, p2, p3), [0.026, 0.003], { color: IVORY, bone: J.jaw, sides: 6 });
    b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 8), GOLD, {
      at: p0.clone().lerp(p1, 0.4),
      dir: p1.clone().sub(p0),
      axis: "z",
      bone: J.jaw,
    });
  }

  // ------------------------------------------------------------------ eyes
  for (const s of [1, -1]) {
    const eh = HIT(s * 50, 12);
    seat(eh, sph(12, 8), INK, -0.006, [0.08, 0.022, 0.07]);
    seat(eh, sph(12, 8), GOLD, 0.002, [0.063, 0.018, 0.054]);
    seat(eh, sph(10, 6), INK, 0.014, [0.034, 0.012, 0.017]);
    seat({ at: eh.at.clone().add(V(-s * 0.012, 0.018, 0.014)), axis: eh.axis }, sph(6, 4), CLOUD, 0.02, [
      0.011, 0.008, 0.011,
    ]);
    // outer-corner ink flick
    let t = V(eh.axis.z, 0, -eh.axis.x).normalize();
    if (t.z > 0) t = t.negate();
    b.spike(eh.at.clone().addScaledVector(t, 0.068).addScaledVector(eh.axis, 0.002), t.clone().add(V(0, 0.35, 0)), 0.07, 0.014, {
      color: INK,
      bone: J.head,
      sides: 5,
    });

    // eyeshadow (vermilion) and heavy brow (ink)
    const arc = (azs: number[], els: number[], lift: number) =>
      faceSurf.drape(catmull(azs.map((a, i) => HIT(s * a, els[i]).at)), { lift });
    b.sweep(arc([22, 40, 58, 78], [30, 34, 33, 24], 0.004), (u) => 0.008 + 0.013 * Math.sin(Math.PI * u), {
      color: VERM,
      bone: J.head,
      sides: 6,
    });
    b.sweep(arc([24, 42, 62, 80], [39, 43, 39, 29], 0.01), (u) => 0.006 + 0.016 * Math.sin(Math.PI * u), {
      color: INK,
      bone: J.head,
      sides: 6,
    });
  }

  // ------------------------------------------------------------------ forehead third-eye flame
  const fh = HIT(0, 46);
  const fn = fh.n.clone();
  const up = V(0, 1, 0);
  const ey = up.clone().addScaledVector(fn, -up.dot(fn)).normalize();
  seat(fh, sph(10, 6), COATLIGHT, -0.012, [0.1, 0.02, 0.12]);
  const FLAME: [number, number][] = [
    [0, -0.045],
    [0.032, -0.03],
    [0.04, 0],
    [0.03, 0.03],
    [0.012, 0.055],
    [0, 0.095],
    [-0.016, 0.05],
    [-0.034, 0.02],
    [-0.04, -0.01],
    [-0.03, -0.032],
  ];
  const flame = (sc: number, color: string, off: number, dy = 0) =>
    b.extrude(
      FLAME.map(([x, y]) => [x * sc, y * sc] as [number, number]),
      {
        at: fh.at.clone().addScaledVector(fn, off).addScaledVector(ey, dy),
        x: [1, 0, 0],
        y: ey,
        thickness: 0.012,
        color,
        bone: J.head,
      },
    );
  flame(1.3, INK, 0.006, 0.006);
  flame(1.0, VERM, 0.01);
  flame(0.5, GOLD, 0.014, -0.012);

  // ------------------------------------------------------------------ ears
  for (const s of [1, -1]) {
    const eh = HIT(s * 100, 52);
    const ax = V(s * 0.8, 0.42, 0.28).normalize();
    const base = eh.at.clone().add(V(s * 0.02, 0.04, 0));
    b.part(cyl(0.07, 0.1, 8), COAT, { at: base.clone().addScaledVector(ax, -0.01), dir: ax, bone: J.head, flat: true });
    const layer = (r: number, col: string, off: number) =>
      b.part(cyl(r, 0.02, 14), col, { at: base.clone().addScaledVector(ax, off), dir: ax, bone: J.head, flat: true });
    layer(0.112, INK, 0.032);
    layer(0.1, CREAM, 0.042);
    layer(0.066, INK, 0.05);
    layer(0.03, COATLIGHT, 0.057);
    b.ring(
      frame(base.clone().addScaledVector(ax, 0.045), ax),
      { count: 12, radius: 0.1 },
      (it) => b.spike(it, it, 0.04, 0.016, { color: CREAM, bone: J.head, sides: 4 }),
    );
  }

  // ------------------------------------------------------------------ cheek ruffs and kumo swirls
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const rh = HIT(s * (70 + i * 14), -28 - i * 4);
      b.spike(rh, [s * 0.25, -0.45, -0.85], 0.1, 0.035, { color: CREAM, bone: J.head, sides: 5 });
    }
    const ch = HIT(s * 74, -12);
    const center = ch.at.clone().addScaledVector(ch.n, 0.008);
    const tangent = V(0, 1, 0).cross(ch.n).normalize();
    const from = center.clone().addScaledVector(tangent, 0.045);
    b.sweep(spiral(center, from, ch.n, { turns: 1.25, r1: 0.008 }), 0.007, {
      color: WAVE,
      bone: J.head,
      sides: 5,
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), CLOUD, { at: center, bone: J.head });
  }
}
    return buildHeadFace;
  })(),
  // maneClouds
  (() => {
function buildManeClouds({ b, J, P }: any) {
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const boneAt = (z: number) => (z > 0.85 ? J.neck1 : J.chest);
  const lerpN = (a: number, c: number, t: number) => a + (c - a) * t;

  // ---------------------------------------------------------------- spine path (rump -> crown)
  const spine = catmull([
    [0, 1.31, -1.38],
    [0, 1.39, -1.15],
    [0, 1.45, -0.8],
    [0, 1.47, -0.3],
    [0, 1.48, 0.2],
    [0, 1.47, 0.6],
    [0, 1.42, 0.95],
    [0, 1.31, 1.2],
  ]);

  // ---------------------------------------------------------------- kumo cloud outline
  // Scalloped dome (odd lobe count so the middle lobe is on top), flat base sunk below the origin.
  function cloud(w: number, h: number, n: number, sink: number, seg = 5): [number, number][] {
    const valley = 0.78;
    const amp = 0.25;
    const xr = (w / 2) * valley;
    const pts: [number, number][] = [
      [-xr, -sink],
      [xr, -sink],
    ];
    const total = n * seg;
    for (let i = 0; i <= total; i++) {
      const th = (Math.PI * i) / total;
      const r = valley + amp * Math.abs(Math.sin(n * th));
      pts.push([Math.cos(th) * (w / 2) * r, Math.max(0.0005, Math.sin(th) * h * r)]);
    }
    return pts;
  }

  // One stacked cloud: ink outline, main colour, cloudWhite inner, optional vermilion core.
  function kumo(
    origin: THREE.Vector3,
    T: THREE.Vector3,
    U: THREE.Vector3,
    w: number,
    h: number,
    n: number,
    main: string,
    bone: any,
    full: boolean,
  ) {
    const k = full ? 1 : 0.8;
    const at = (v: number) => origin.clone().addScaledVector(U, v);
    b.extrude(cloud(w + 0.05, h + 0.045, n, 0.08), {
      at: at(-0.012),
      x: T,
      y: U,
      thickness: 0.05 * k,
      color: P.ink,
      bone,
    });
    b.extrude(cloud(w, h, n, 0.05), { at: origin, x: T, y: U, thickness: 0.06 * k, color: main, bone });
    b.extrude(cloud(w * 0.72, h * 0.64, n, 0.004), {
      at: at(0.035),
      x: T,
      y: U,
      thickness: 0.07 * k,
      color: P.cloudWhite,
      bone,
    });
    if (full) {
      b.extrude(cloud(w * 0.42, h * 0.4, n, 0.004), {
        at: at(0.062),
        x: T,
        y: U,
        thickness: 0.08,
        color: P.vermilion,
        bone,
      });
    }
  }

  // ---------------------------------------------------------------- the mane along the spine
  const N = 12;
  const step = 0.93 / (N - 1);
  const frameAt = (t: number, leanBase: number) => {
    const p = spine.at(t) as THREE.Vector3;
    const tg = spine.tangentAt(t) as THREE.Vector3;
    const T = V(0, tg.y, tg.z).normalize();
    const lean = leanBase;
    const up = V(0, T.z, -T.y);
    const U = up.multiplyScalar(Math.cos(lean)).addScaledVector(T, -Math.sin(lean)).normalize();
    return { p: p.clone(), T, U };
  };

  for (let i = 0; i < N; i++) {
    const t = 0.035 + i * step;
    const lean = lerpN(0.12, 0.38, t);
    const { p, T, U } = frameAt(t, lean);
    const bone = boneAt(p.z);
    const w = 0.32 + 0.06 * R();
    let h = lerpN(0.19, 0.26, t) + 0.02 * R();
    h = Math.min(h, (1.69 - p.y) / (1.03 * Math.max(U.y, 0.3)));
    const n = i % 2 === 0 ? 5 : 3;
    const main = i % 2 === 0 ? P.coatLight : P.wave;
    kumo(p, T, U, w, h, n, main, bone, true);

    // gold swirl on the vermilion core, both faces; gold dots on the white lobes
    const N0 = V(0, 0, 0).crossVectors(T, U).normalize();
    for (const s of [1, -1]) {
      const face = N0.clone().multiplyScalar(s);
      const hc = h * 0.4;
      const center = p
        .clone()
        .addScaledVector(U, 0.062 + 0.45 * hc)
        .addScaledVector(face, 0.043);
      const from = center.clone().addScaledVector(U, Math.min(0.03, hc * 0.5));
      b.sweep(spiral(center, from, face, { turns: 1.25 * s, r1: 0.008, pitch: 0 }), 0.0055, {
        color: P.gold,
        bone,
        sides: 4,
      });
      if (i % 2 === 0) {
        for (const u of [-0.27, 0.27]) {
          const dp = p
            .clone()
            .addScaledVector(T, u * w)
            .addScaledVector(U, 0.035 + 0.3 * h)
            .addScaledVector(face, 0.036);
          b.part(new THREE.SphereGeometry(0.013, 6, 4), P.gold, { bone, at: dp });
        }
      }
    }
  }

  // ---------------------------------------------------------------- side clouds, rolled outward
  for (let i = 0; i < N - 2; i++) {
    const t = 0.035 + (i + 0.5) * step;
    const lean = lerpN(0.15, 0.4, t);
    const { p, T, U } = frameAt(t, lean);
    const bone = boneAt(p.z);
    for (const s of [1, -1]) {
      const roll = 0.5;
      const Ur = U.clone()
        .multiplyScalar(Math.cos(roll))
        .addScaledVector(V(s, 0, 0), Math.sin(roll))
        .normalize();
      const origin = p.clone().add(V(s * 0.11, -0.035, 0));
      let h = lerpN(0.14, 0.18, t);
      h = Math.min(h, (1.69 - origin.y) / (1.03 * Math.max(Ur.y, 0.3)));
      const main = (i + (s > 0 ? 0 : 1)) % 2 === 0 ? P.coat : P.wave;
      kumo(origin, T, Ur, 0.24 + 0.04 * R(), h, i % 2 === 0 ? 3 : 5, main, bone, false);
    }
  }

  // ---------------------------------------------------------------- vermilion swirl blades
  for (let i = 0; i < 10; i++) {
    const t = 0.07 + i * 0.095;
    const s = i % 2 === 0 ? 1 : -1;
    const { p, T, U } = frameAt(Math.min(t, 0.97), 0.2);
    const base = p.clone().add(V(s * 0.07, -0.03, 0));
    const p1 = base.clone().addScaledVector(U, 0.09).add(V(s * 0.04, 0, 0));
    const p2 = base.clone().addScaledVector(U, 0.14).addScaledVector(T, -0.1).add(V(s * 0.08, 0, 0));
    const tip = base.clone().addScaledVector(U, 0.1).addScaledVector(T, -0.25).add(V(s * 0.11, 0, 0));
    b.sweep(catmull([base, p1, p2, tip]), [0.03, 0], {
      color: i % 3 === 2 ? P.gold : P.vermilion,
      bone: boneAt(p.z),
      caps: { start: "flat", end: "point" },
      sides: 5,
    });
  }

  // ---------------------------------------------------------------- shoulder and haunch flame wisps
  const clusters = [0.7, -0.9];
  const kinds = [
    { dz: -0.1, f: 0.85 },
    { dz: 0, f: 1.0 },
    { dz: 0.1, f: 0.7 },
  ];
  for (const zc of clusters) {
    for (const s of [1, -1]) {
      for (const k of kinds) {
        const z0 = zc + k.dz;
        const base = V(s * 0.3, 1.31, z0);
        const mk = (scale: number, dx: number) =>
          catmull([
            [base.x + dx, base.y, base.z],
            [s * (0.33 + dx * 0.5), 1.31 + 0.12 * k.f * scale, z0 - 0.02],
            [s * (0.3 + dx * 0.5), 1.31 + 0.24 * k.f * scale, z0 - 0.09],
            [s * (0.35 + dx * 0.4), 1.31 + 0.35 * k.f * scale, z0 - 0.2],
          ]);
        const bone = boneAt(z0);
        b.sweep(mk(1, 0), [0.04, 0.036, 0.022, 0], {
          color: P.vermilion,
          bone,
          caps: { start: "flat", end: "point" },
          sides: 6,
        });
        b.sweep(mk(0.72, s * 0.028), [0.022, 0.02, 0.011, 0], {
          color: P.gold,
          bone,
          caps: { start: "flat", end: "point" },
          sides: 5,
        });
      }
    }
  }

  // ---------------------------------------------------------------- floating wave roundels on stems
  const roundels: [number, number, number][] = [
    [0.3, 1.6, 0.5],
    [-0.3, 1.58, -0.15],
    [0.31, 1.59, -0.75],
    [-0.29, 1.56, -1.25],
  ];
  for (const [x, y, z] of roundels) {
    const bone = boneAt(z);
    const sy = (spine.at(spine.closestT(V(0, 1.5, z))) as THREE.Vector3).y;
    const c = V(x, y, z);
    b.sweep(catmull([V(0, sy - 0.03, z), V(x * 0.4, y - 0.1, z), c]), 0.011, {
      color: P.gold,
      bone,
      sides: 5,
      caps: { start: "flat", end: "round" },
    });
    const discs: [number, number, string][] = [
      [0.085, 0.03, P.ink],
      [0.076, 0.034, P.wave],
      [0.06, 0.038, P.cloudWhite],
      [0.045, 0.042, P.wave],
      [0.03, 0.046, P.vermilion],
      [0.012, 0.05, P.gold],
    ];
    for (const [r, th, col] of discs) {
      b.part(new THREE.CylinderGeometry(r, r, th, 12), col, { bone, at: c, dir: [1, 0, 0] });
    }
  }
}
    return buildManeClouds;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bakuDreamEater" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,1.1,-0.7], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,1.15,0.5], dir: [0,0,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.2,0.85], dir: [0,0.2,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck1"], at: [0,1.1,1.35], dir: [0,-0.1,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.85,1.65], dir: [0,-0.1,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,1.2,-1.35], dir: [0,-0.3,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1,-1.7], dir: [0,-0.5,-1], role: "tail" });
  J["hipFL"] = b.joint("hipFL", { parent: J["chest"], at: [0.35,1.05,0.7], dir: [0,-1,0], role: "leg" });
  J["kneeFL"] = b.joint("kneeFL", { parent: J["hipFL"], at: [0.35,0.6,0.7], dir: [0,-1,0], role: "leg" });
  J["hipFR"] = b.joint("hipFR", { parent: J["chest"], at: [-0.35,1.05,0.7], dir: [0,-1,0], role: "leg" });
  J["kneeFR"] = b.joint("kneeFR", { parent: J["hipFR"], at: [-0.35,0.6,0.7], dir: [0,-1,0], role: "leg" });
  J["hipBL"] = b.joint("hipBL", { parent: J["hips"], at: [0.35,1.05,-0.8], dir: [0,-1,0], role: "leg" });
  J["kneeBL"] = b.joint("kneeBL", { parent: J["hipBL"], at: [0.35,0.6,-0.8], dir: [0,-1,0], role: "leg" });
  J["hipBR"] = b.joint("hipBR", { parent: J["hips"], at: [-0.35,1.05,-0.8], dir: [0,-1,0], role: "leg" });
  J["kneeBR"] = b.joint("kneeBR", { parent: J["hipBR"], at: [-0.35,0.6,-0.8], dir: [0,-1,0], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
