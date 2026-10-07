import * as THREE from "three";
import { aim, catmull, cells, createBuilder, frame, interpolate, noise, paint, smoothstep } from "../../../../src/index";
import type { Chain, Joint } from "../../../../src/index";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A newborn unicorn foal on wobbly long legs: pearly white coat with a lilac shimmer, short fluffy pastel pink/mint/lavender mane and tail, a small spiralled gold horn, big dark lashed eyes, silver hooves and a daisy chain around its neck.",
};

type C3 = [number, number, number];
const hex = (h: string): C3 => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const mixc = (a: C3, b: C3, t: number): C3 => {
  const k = Math.min(Math.max(t, 0), 1);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "unicorn_foal", paintSize: 1024 });
  const DEG = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- palette
  const PINK = "#f6b3d3", PINK2 = "#fbd1e5";
  const MINT = "#9fe3cb", MINT2 = "#c6f3e2";
  const LAV = "#bfa3f0", LAV2 = "#dccbf9";
  const HAIR = [PINK, MINT, LAV, PINK2, MINT2, LAV2];
  const LASH = "#2a1a3d";

  const PEARL = hex("#fffbfe"), LILAC = hex("#e2d1fa"), ROSE = hex("#fddff0");
  const MINTC = hex("#d9f6ec"), SPARK = hex("#cbb5ff");
  const GOLD = hex("#eeb22f"), GOLD_L = hex("#ffe48f"), GOLD_D = hex("#c98a1e");

  // ---------------------------------------------------------------- paints
  const coat = paint((p, n) => {
    const cloud = noise(p, 0.3, 4);
    const fine = noise(p, 0.09, 9);
    const mintN = noise(p, 0.17, 21);
    const under = smoothstep(0.25, -0.85, n.y);
    const low = smoothstep(0.4, 0.06, p.y);
    let c = mixc(PEARL, LILAC, 0.5 * under + 0.28 * low + 0.34 * smoothstep(0.5, 0.78, cloud));
    c = mixc(c, ROSE, 0.36 * smoothstep(0.56, 0.8, fine) * (1 - under));
    c = mixc(c, MINTC, 0.28 * smoothstep(0.58, 0.82, mintN) * (1 - under));
    if (fine > 0.6) {
      const sp = cells(p, 0.045, 7);
      if (sp.id > 0.8 && sp.d1 < 0.12) c = mixc(c, SPARK, 0.75);
    }
    return c;
  });

  const hornPaint = paint((_p, _n, s) => {
    let ph = s[1] / 360 + s[0] * 3.5;
    ph -= Math.floor(ph);
    const band = smoothstep(0.3, 0.42, ph) * smoothstep(0.78, 0.66, ph);
    let c = mixc(GOLD_D, GOLD, 0.55 + 0.35 * smoothstep(0, 0.4, s[0]));
    c = mixc(c, GOLD_L, band);
    return mixc(c, GOLD_L, 0.55 * smoothstep(0.82, 1, s[0]));
  });

  const hoofPaint = paint((p) =>
    mixc(hex("#a9b2c6"), hex("#e6ebf5"), 0.8 * smoothstep(0.015, 0.07, p.y) + 0.12 * noise(p, 0.02, 3)),
  );

  // ---------------------------------------------------------------- helpers
  const blob = (rx: number, ry: number, rz: number, w = 10, h = 7) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(rx, ry, rz);
    return g;
  };

  const daisyGeo = (R: number) => {
    const shape = new THREE.Shape();
    const P = 8;
    const da = Math.PI / P;
    const pts: Array<[number, number]> = [];
    for (let k = 0; k < P; k++) {
      const a = (k / P) * Math.PI * 2;
      pts.push([Math.cos(a - da) * R * 0.34, Math.sin(a - da) * R * 0.34]);
      pts.push([Math.cos(a - da * 0.6) * R * 0.88, Math.sin(a - da * 0.6) * R * 0.88]);
      pts.push([Math.cos(a) * R, Math.sin(a) * R]);
      pts.push([Math.cos(a + da * 0.6) * R * 0.88, Math.sin(a + da * 0.6) * R * 0.88]);
    }
    shape.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.004, bevelEnabled: false, curveSegments: 1 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.002, 0);
    return g;
  };

  const leafGeo = (L: number, W: number) => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(L * 0.4, W, L, 0);
    s.quadraticCurveTo(L * 0.4, -W, 0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.003, bevelEnabled: false, curveSegments: 3 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.0015, 0);
    return g;
  };

  // A fluffy tapering lock of hair.
  const lockR = (m: number) => (t: number): number =>
    Math.max(0.003, m * Math.sin(Math.PI * (0.12 + 0.82 * t)));
  const lock = (pts: THREE.Vector3[], color: string, m: number, bone: Joint | Chain) =>
    b.sweep(catmull(pts), lockR(m), {
      color,
      sides: 5,
      smooth: false,
      bone,
      caps: { start: "none", end: "round" },
    });

  // ---------------------------------------------------------------- skeleton: spine, neck
  b.joint("root", { at: [0, 0.82, 0], dir: [0, 0, 1] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.28],
      [0, 0.805, -0.14],
      [0, 0.81, 0],
      [0, 0.815, 0.1],
      [0, 0.82, 0.17],
    ]),
    { parent: "root", names: ["pelvis", "spine1", "spine2", "chest"], role: "spine" },
  );
  const sts = spine.ts;
  b.sweep(
    spine,
    (t: number): [number, number] => [
      interpolate(sts, [0.1, 0.135, 0.145, 0.145, 0.125], t),
      interpolate(sts, [0.155, 0.19, 0.2, 0.215, 0.2], t),
    ],
    { color: coat, sides: 10, name: "body" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.16],
      [0, 0.98, 0.265],
      [0, 1.07, 0.36],
      [0, 1.14, 0.415],
    ]),
    { parent: "chest", names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const nts = neck.ts;
  const neckSweep = b.sweep(
    neck,
    (t: number): [number, number] => [
      interpolate(nts, [0.088, 0.072, 0.062, 0.058], t),
      interpolate(nts, [0.112, 0.097, 0.084, 0.08], t),
    ],
    { color: coat, sides: 9, name: "neck" },
  );

  // ---------------------------------------------------------------- head frame (nose pitched down 40 deg)
  const PHI = 40 * DEG;
  const cp = Math.cos(PHI);
  const sp = Math.sin(PHI);
  const HEAD0 = V(0, 1.16, 0.43);
  const hp = (x: number, y: number, z: number) => V(x, HEAD0.y + y * cp - z * sp, HEAD0.z + y * sp + z * cp);
  const hd = (x: number, y: number, z: number) => V(x, y * cp - z * sp, y * sp + z * cp);
  const headFwd = hd(0, 0, 1);
  const headUp = hd(0, 1, 0);

  const head = b.joint("head", { parent: "neck3", at: HEAD0, dir: headFwd, up: headUp, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.05, 0.04), dir: headFwd, up: headUp, role: "jaw" });

  // upper head: cranium to muzzle
  const hk = [0, 0.25, 0.5, 0.8, 1];
  b.sweep(
    [hp(0, 0, 0.03), hp(0, 0, 0.22)],
    (t: number): [number, number] => [
      interpolate(hk, [0.075, 0.095, 0.075, 0.05, 0.045], t),
      interpolate(hk, [0.085, 0.105, 0.092, 0.058, 0.052], t),
    ],
    { color: coat, sides: 10, bone: head, name: "skull" },
  );
  // lower jaw (separate so the mouth can open)
  b.sweep(
    [hp(0, -0.063, 0.06), hp(0, -0.06, 0.22)],
    (t: number): [number, number] => [0.05 - 0.02 * t, 0.036 - 0.011 * t],
    { color: coat, sides: 8, bone: jaw, name: "lowerJaw" },
  );
  b.part(blob(0.028, 0.02, 0.02), "#f3c4da", { at: hp(0, -0.064, 0.234), bone: jaw, name: "chinPad" });

  // nose pad + nostrils
  b.part(blob(0.031, 0.012, 0.031, 10, 5), "#f5c6dc", {
    at: hp(0, 0.004, 0.262),
    dir: hd(0, 0.05, 1),
    bone: head,
    name: "nosePad",
  });
  for (const s of [1, -1]) {
    b.part(blob(0.0105, 0.005, 0.0075, 8, 5), "#a3719b", {
      at: hp(s * 0.0135, 0.011, 0.2715),
      dir: hd(s * 0.35, 0.1, 1),
      bone: head,
    });
    // cheek blush
    b.part(blob(0.024, 0.006, 0.02, 10, 4), "#fbbbd6", {
      at: hp(s * 0.071, -0.04, 0.115),
      dir: hd(s * 0.95, -0.25, 0.15),
      bone: head,
    });
  }

  // ---------------------------------------------------------------- eyes + lashes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const E = hp(s * 0.083, 0.03, 0.07);
    const G = hd(s * 0.88, 0.1, 0.42).normalize();
    const U = headUp.clone().addScaledVector(G, -headUp.dot(G)).normalize();
    const F = headFwd.clone().addScaledVector(G, -headFwd.dot(G)).normalize();
    const eyeJ = b.joint("eye" + side, { parent: head, at: E, dir: G });
    const gp = (d: number) => E.clone().addScaledVector(G, d);

    b.part(blob(0.036, 0.036, 0.036, 12, 9), "#2a1b46", { at: E, bone: eyeJ, name: "eyeball" + side });
    b.part(blob(0.026, 0.012, 0.026, 12, 5), "#5a3a8c", { at: gp(0.0285), dir: G, bone: eyeJ, name: "iris" + side });
    b.part(blob(0.014, 0.007, 0.014, 10, 4), "#0c0714", { at: gp(0.0345), dir: G, bone: eyeJ, name: "pupil" + side });
    b.part(blob(0.0085, 0.0085, 0.0085, 8, 6), "#ffffff", {
      at: gp(0.0375).addScaledVector(U, 0.012).addScaledVector(F, 0.01),
      bone: eyeJ,
    });
    b.part(blob(0.0045, 0.0045, 0.0045, 6, 4), "#ffffff", {
      at: gp(0.036).addScaledVector(U, -0.012).addScaledVector(F, -0.008),
      bone: eyeJ,
    });
    // sleepy lilac eyelid
    b.part(new THREE.SphereGeometry(0.0385, 10, 4, 0, Math.PI * 2, 0, 0.86), "#d4bdf5", {
      at: E,
      dir: U,
      bone: eyeJ,
      name: "eyelid" + side,
    });

    // long curled lashes along the upper lid
    b.ring(
      frame(E.clone().addScaledVector(G, 0.013), G),
      { count: 6, radius: 0.0345, fromDeg: s > 0 ? -95 : -70, toDeg: s > 0 ? 70 : 95, tilt: 22 },
      (it) => {
        const back = s > 0 ? 1 - it.t : it.t;
        const len = 0.036 + 0.026 * back;
        const p0 = it.local([0, -0.004, 0]);
        const p1 = it.local([0, len * 0.5, len * 0.08]);
        const p2 = it.local([0, len, len * 0.4]);
        b.sweep(catmull([p0, p1, p2]), [0.0034, 0.0004], {
          color: LASH,
          sides: 3,
          bone: eyeJ,
          caps: { start: "none", end: "none" },
        });
      },
    );
  }

  // ---------------------------------------------------------------- ears
  const earOutline = [
    [-0.028, -0.03],
    [0.028, -0.03],
    [0.034, 0.035],
    [0.025, 0.085],
    [0, 0.12, "sharp"],
    [-0.025, 0.085],
    [-0.034, 0.035],
  ];
  const innerOutline = [
    [-0.016, 0],
    [0.016, 0],
    [0.022, 0.038],
    [0.015, 0.082],
    [0, 0.103, "sharp"],
    [-0.015, 0.082],
    [-0.022, 0.038],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base = hp(s * 0.042, 0.052, 0);
    const up = V(s * 0.3, 0.92, -0.12).normalize();
    const face = V(s * 0.45, 0.05, 1).normalize();
    const n = face.addScaledVector(up, -face.dot(up)).normalize();
    const xdir = up.clone().cross(n).normalize();
    const earJ = b.joint("ear" + side, { parent: head, at: base, dir: up, role: "hinge" });
    b.extrude(earOutline, {
      color: coat,
      at: base,
      x: xdir,
      y: up,
      thickness: [0.018, 0.005],
      bevel: 0.002,
      smoothing: 1,
      bone: earJ,
      name: "ear" + side,
    });
    b.extrude(innerOutline, {
      color: "#f6b4d0",
      at: base.clone().addScaledVector(n, 0.0035),
      x: xdir,
      y: up,
      thickness: [0.016, 0.006],
      smoothing: 1,
      bone: earJ,
      name: "earInner" + side,
    });
  }

  // ---------------------------------------------------------------- horn
  const hornBase = hp(0, 0.085, 0.075);
  const hornDir = V(0, 0.82, 0.57).normalize();
  const hornTip = hornBase.clone().addScaledVector(hornDir, 0.19);
  b.sweep([hornBase, hornTip], (t: number) => 0.022 * Math.pow(1 - t, 0.9) + 0.0007, {
    color: hornPaint,
    section: { ngon: 6 },
    twist: 420,
    caps: { start: "flat", end: "round" },
    bone: head,
    name: "horn",
  });
  b.sweep(
    [hornBase.clone().addScaledVector(hornDir, 0.012), hornBase.clone().addScaledVector(hornDir, 0.03)],
    [0.031, 0.025],
    { color: "#d69a26", sides: 8, caps: "flat", bone: head, name: "hornCollar" },
  );

  // ---------------------------------------------------------------- forelock
  for (const s of [1, -1]) {
    lock(
      [hp(s * 0.03, 0.088, 0.035), hp(s * 0.047, 0.128, 0.07), hp(s * 0.062, 0.125, 0.125), hp(s * 0.068, 0.09, 0.17)],
      s > 0 ? PINK : MINT,
      0.016,
      head,
    );
  }
  lock([hp(0, 0.095, 0), hp(0, 0.14, 0.03), hp(0, 0.168, -0.02), hp(0, 0.152, -0.085)], LAV, 0.017, head);

  // ---------------------------------------------------------------- mane
  for (let i = 0; i < 11; i++) {
    const t = 0.1 + 0.86 * (i / 10);
    for (const ang of [-26, 26]) {
      const pt = neckSweep.at(t, ang, 0);
      const n = pt.n.clone();
      const T = pt.tangent.clone();
      const sd = pt.at.x >= 0 ? 1 : -1;
      const k = 1 + 0.22 * Math.sin(i * 1.9 + (ang > 0 ? 1 : 0));
      const root = pt.at.clone().addScaledVector(n, -0.012);
      const p1 = root.clone().addScaledVector(n, 0.035 * k).add(V(sd * 0.01, 0, 0));
      const p2 = root.clone().addScaledVector(n, 0.062 * k).addScaledVector(T, -0.03 * k).add(V(sd * 0.032 * k, 0, 0));
      const p3 = root
        .clone()
        .addScaledVector(n, 0.05 * k)
        .addScaledVector(T, -0.075 * k)
        .add(V(sd * 0.058 * k, -0.035 * k, 0));
      lock([root, p1, p2, p3], HAIR[(i + (ang > 0 ? 3 : 0)) % 6], 0.021 + 0.004 * Math.sin(i), pt.bone!);
    }
  }

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.87, -0.38],
      [0, 0.86, -0.5],
      [0, 0.78, -0.58],
      [0, 0.66, -0.61],
      [0, 0.54, -0.6],
    ]),
    { parent: "pelvis", names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.034 - 0.014 * t, { color: LAV, sides: 7, name: "tailCore" });
  for (let i = 0; i < 16; i++) {
    const th = i * 2.399;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    const r0 = 0.012 + 0.008 * ((i * 5) % 3);
    const rad = (t: number) => r0 + 0.055 * t;
    const ext = 0.07 + (0.05 * ((i * 7) % 4)) / 3;
    const pts = [0.16, 0.42, 0.7, 1].map((t) => tail.at(t).local([c * rad(t), 0, sn * rad(t)]));
    pts.push(tail.at(1).local([c * (rad(1) + 0.025), ext, sn * (rad(1) + 0.025)]));
    lock(pts, HAIR[i % 6], 0.02 + 0.006 * ((i * 3) % 3), tail);
  }

  // ---------------------------------------------------------------- legs
  const legR = (ts: readonly number[], v: number[]) => {
    const xs = [ts[0], ts[1], (ts[1] + ts[2]) / 2, ts[2], (ts[2] + ts[3]) / 2, ts[3], ts[4]];
    return (t: number): [number, number] => {
      const r = interpolate(xs, v, t);
      return [r, r];
    };
  };
  const hoof = (joint: Joint, at: THREE.Vector3, name: string) =>
    b.lathe(
      [
        [0, 0],
        [0.047, 0],
        [0.048, 0.012],
        [0.041, 0.05],
        [0.037, 0.066],
        [0, 0.066],
      ],
      { color: hoofPaint, at, segments: 8, spin: 22.5, bone: joint, name },
    );
  const tufts = (fet: Joint, s: number, name: string) => {
    const fj = fet.at;
    [-1, 0, 1].forEach((k, j) => {
      const root = fj.clone().add(V(k * 0.012, -0.004, -0.022));
      lock(
        [
          root,
          root.clone().add(V(k * 0.006, -0.025, -0.012)),
          root.clone().add(V(k * 0.012 + s * 0.004, -0.055, -0.016)),
          root.clone().add(V(k * 0.016 + s * 0.006, -0.08, -0.012)),
        ],
        [MINT, PINK, LAV][(j + (name === "H" ? 1 : 0)) % 3],
        0.011,
        fet,
      );
    });
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // front leg
    const fl = b.chain(
      "legF" + sd,
      catmull([
        [s * 0.115, 0.74, 0.2],
        [s * 0.125, 0.58, 0.16],
        [s * 0.145, 0.37, 0.215],
        [s * 0.158, 0.15, 0.235],
        [s * 0.165, 0.068, 0.255],
      ]),
      {
        parent: "chest",
        names: ["shoulder" + sd, "elbow" + sd, "knee" + sd, "fetlock" + sd, "hoof" + sd],
        role: "leg",
        contact: [s * 0.165, 0, 0.255],
      },
    );
    b.sweep(fl, legR(fl.ts, [0.062, 0.05, 0.038, 0.034, 0.022, 0.029, 0.026]), {
      color: coat,
      sides: 8,
      name: "legF" + sd,
    });
    hoof(fl.joints[4], V(s * 0.165, -0.002, 0.255), "hoofF" + sd);
    tufts(fl.joints[3], s, "F");

    // hind leg
    const hl = b.chain(
      "legH" + sd,
      catmull([
        [s * 0.105, 0.74, -0.27],
        [s * 0.14, 0.56, -0.19],
        [s * 0.15, 0.37, -0.36],
        [s * 0.155, 0.15, -0.33],
        [s * 0.16, 0.068, -0.31],
      ]),
      {
        parent: "pelvis",
        names: ["hip" + sd, "stifle" + sd, "hock" + sd, "fetlockH" + sd, "hoofH" + sd],
        role: "leg",
        contact: [s * 0.16, 0, -0.31],
      },
    );
    b.sweep(hl, legR(hl.ts, [0.08, 0.062, 0.044, 0.036, 0.023, 0.03, 0.026]), {
      color: coat,
      sides: 8,
      name: "legH" + sd,
    });
    hoof(hl.joints[4], V(s * 0.16, -0.002, -0.31), "hoofH" + sd);
    tufts(hl.joints[3], s, "H");
  }

  // ---------------------------------------------------------------- daisy chain
  const LN = 20;
  const loop: THREE.Vector3[] = [];
  const loopN: THREE.Vector3[] = [];
  for (let k = 0; k < LN; k++) {
    const a = (k / LN) * 360;
    const w = (1 - Math.cos(a * DEG)) / 2;
    const pt = neckSweep.at(0.52 - 0.24 * w, a, 0.016 + 0.02 * w);
    loop.push(pt.at.clone());
    loopN.push(pt.n.clone());
  }
  b.sweep(catmull(loop, { closed: true }), 0.0055, {
    color: "#74b886",
    sides: 5,
    bone: "neck2",
    name: "daisyString",
  });

  const petals = ["#ffffff", "#fff3f9", "#f6efff"];
  for (let k = 2; k < LN; k += 2) {
    const i = k / 2;
    const n = loopN[k];
    const R = k === 10 ? 0.037 : k % 4 === 2 ? 0.029 : 0.023;
    const q = new THREE.Quaternion().setFromAxisAngle(n, i * 0.7).multiply(aim(n));
    const at = loop[k].clone().addScaledVector(n, 0.006);
    b.part(daisyGeo(R), petals[i % 3], { at, quat: q, bone: "neck2" });
    b.part(new THREE.CylinderGeometry(R * 0.34, R * 0.36, 0.008, 8, 1), "#ffcb3d", {
      at: at.clone().addScaledVector(n, 0.005),
      quat: q,
      bone: "neck2",
    });
  }
  const leaf = leafGeo(0.036, 0.02);
  for (let k = 1; k < LN; k += 2) {
    const n = loopN[k];
    const tan = loop[(k + 1) % LN].clone().sub(loop[(k - 1 + LN) % LN]);
    tan.addScaledVector(n, -tan.dot(n)).normalize();
    for (const ang of [60 * DEG, -60 * DEG]) {
      const Tt = tan.clone().applyAxisAngle(n, ang);
      const q = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(Tt, n, Tt.clone().cross(n)),
      );
      b.part(leaf, k % 4 === 1 ? "#7fcf95" : "#9ddfa8", {
        at: loop[k].clone().addScaledVector(n, 0.004),
        quat: q,
        bone: "neck2",
      });
    }
  }

  // a daisy tucked into the mane near the left ear
  for (const ang of [55, -55]) {
    const pt = neckSweep.at(0.9, ang, 0.014);
    if (pt.at.x <= 0) continue;
    const n = pt.n.clone();
    const q = aim(n);
    b.part(daisyGeo(0.03), "#ffffff", { at: pt.at.clone(), quat: q, bone: pt.bone! });
    b.part(new THREE.CylinderGeometry(0.0102, 0.011, 0.008, 8, 1), "#ffcb3d", {
      at: pt.at.clone().addScaledVector(n, 0.005),
      quat: q,
      bone: pt.bone!,
    });
  }

  return b.root;
}
