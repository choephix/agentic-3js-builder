```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  polyline,
  spiral,
  limb,
  paint,
  gradient,
  noise,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A newborn unicorn foal on long wobbly legs: pearly lilac-shimmer coat, fluffy pastel mane and tail, a little twisted gold horn, big lashed eyes, silver hooves and a daisy chain around its neck.",
};

type RGB = [number, number, number];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const mixc = (a: RGB, c: RGB, t: number): RGB => {
  const k = clamp01(t);
  return [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
};
const key = (ks: number[], t: number) => {
  const f = clamp01(t) * (ks.length - 1);
  const i = Math.min(ks.length - 2, Math.floor(f));
  const u = f - i;
  const s = u * u * (3 - 2 * u);
  return ks[i] + (ks[i + 1] - ks[i]) * s;
};
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function build() {
  const b = createBuilder({ name: "unicornFoal" });
  const up = new THREE.Vector3(0, 1, 0);

  // ---------- palette ----------
  const PEARL: RGB = [0.975, 0.962, 0.99];
  const LILAC: RGB = [0.84, 0.78, 0.97];
  const ROSE: RGB = [0.99, 0.9, 0.95];
  const MINTY: RGB = [0.88, 0.97, 0.96];
  const PINK = "#f8b4d4";
  const MINT = "#a6ecd2";
  const LAV = "#c8b2f4";
  const PASTELS = [PINK, MINT, LAV];
  const EYE = "#22132e";
  const IRIS = "#6b46b0";
  const PUPIL = "#0f0816";
  const SHINE = "#ffffff";
  const LASH = "#2b1838";
  const BLUSH = "#ffb3cf";
  const NOSTRIL = "#c98aa8";
  const EARIN = "#f7bcd5";
  const THREAD = "#ffe48a";
  const GOLDRING = "#e8b830";
  const STEM = "#6cbf6a";
  const LEAF = "#86d47c";
  const YELLOW = "#ffcf33";
  const CORONET = "#cdb8f5";

  // pearly coat with a lilac shimmer
  const coat = paint((p, n) => {
    const k = noise(p, 0.18, 11);
    const sh = 0.5 + 0.5 * Math.sin(p.x * 11 + p.y * 17 + p.z * 9 + k * 6);
    let c = mixc(PEARL, LILAC, 0.1 + 0.42 * Math.max(0, -n.y) + 0.3 * (k - 0.4));
    c = mixc(c, sh > 0.5 ? ROSE : MINTY, Math.abs(sh - 0.5) * 0.7);
    return c;
  });
  const legPaint = gradient(coat, [0.86, 0.81, 0.95], [0, 0.42, 0], [0, 0.1, 0]);
  const pastelPick = paint((p) => {
    const k = noise(p, 0.05, 3);
    return k < 0.42 ? PINK : k < 0.6 ? MINT : LAV;
  });
  const hoofPaint = paint((_p, _n, s) =>
    s[0] < 0.012 ? "#9aa0b2" : s[0] > 0.048 ? "#f1f3f8" : Math.abs(s[1] - 180) < 30 ? "#e4e7ef" : "#c4c9d6",
  );
  const daisyPaint = paint((_p, _n, s) => {
    const r = Math.hypot(s[0], s[1]);
    return r < 0.0065 ? YELLOW : r > 0.016 ? "#ffd6ea" : "#ffffff";
  });

  // ---------- body & spine ----------
  const bodyPath = catmull([
    [0, 0.88, -0.38],
    [0, 0.86, -0.22],
    [0, 0.85, 0.0],
    [0, 0.87, 0.18],
    [0, 0.9, 0.3],
  ]);
  const hips = b.joint("hips", { at: [0, 0.86, -0.22], role: "spine" });
  const rootT = bodyPath.closestT(hips.at);
  const front = b.chain("spine", bodyPath.slice(rootT, 1), { parent: hips, count: 3, role: "spine" });
  const back = b.chain("pelvis", bodyPath.slice(rootT, 0), { parent: hips, count: 1, names: ["pelvis"] });
  const RX = [0.085, 0.118, 0.128, 0.125, 0.118, 0.098];
  const RY = [0.095, 0.125, 0.135, 0.14, 0.135, 0.108];
  const bodySweep = b.sweep(bodyPath, (t: number): [number, number] => [key(RX, t), key(RY, t)], {
    bone: [back, hips, front],
    color: coat,
    name: "body",
  });

  // ---------- neck ----------
  const neckPath = catmull([
    [0, 0.9, 0.19],
    [0, 1.02, 0.27],
    [0, 1.12, 0.33],
    [0, 1.19, 0.36],
  ]);
  const neck = b.chain("neck", neckPath, { parent: front, count: 3, role: "neck" });
  const neckSweep = b.sweep(neck, [0.098, 0.085, 0.07, 0.062], { color: coat, name: "neck" });

  // ---------- head ----------
  const head = b.joint("head", { parent: neck, at: neckPath.at(1), dir: [0, -0.55, 1], role: "head" });
  const hp = (x: number, y: number, z: number) => head.local([x, y, z]);
  const headPaint = gradient(coat, "#f7d3e4", hp(0, 0.1, 0), hp(0, 0.27, -0.01));
  const skull = b.loft(
    [
      { at: hp(0, -0.05, 0.015), w: 0.11, h: 0.12 },
      { at: hp(0, 0.03, 0.025), w: 0.158, h: 0.16 },
      { at: hp(0, 0.11, 0.002), w: 0.118, h: 0.115 },
      { at: hp(0, 0.18, -0.004), w: 0.092, h: 0.082 },
      { at: hp(0, 0.228, -0.006), w: 0.082, h: 0.068 },
    ],
    { bone: head, color: headPaint, name: "skull" },
  );
  const jaw = b.joint("jaw", { parent: head, at: hp(0, 0.07, -0.048), aim: hp(0, 0.22, -0.058), role: "jaw" });
  const jp = (x: number, y: number, z: number) => jaw.local([x, y, z]);
  b.loft(
    [
      { at: jp(0, 0, 0), w: 0.085, h: 0.045 },
      { at: jp(0, 0.08, 0.002), w: 0.068, h: 0.038 },
      { at: jp(0, 0.14, 0.006), w: 0.052, h: 0.028 },
    ],
    { bone: jaw, color: headPaint, name: "jawMesh" },
  );

  const headSurf = b.surface(skull);
  type Surf = ReturnType<typeof b.surface>;
  const hitOn = (s: Surf, origin: THREE.Vector3, dir: THREE.Vector3) => s.ray(origin, dir) ?? s.nearest(origin);

  // nostrils
  for (const sx of [1, -1]) {
    const h = hitOn(headSurf, hp(-sx * 0.022, 0.45, 0.004), head.dir([0, -1, 0]));
    b.stick(new THREE.SphereGeometry(0.0085, 8, 6), NOSTRIL, h, { embed: 0.6, bone: head });
  }

  // eyes, lids, lashes, blush
  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    const eyeHit = hitOn(headSurf, hp(-sx * 0.3, 0.165, 0.03), head.dir([sx, -0.35, 0]));
    const n = eyeHit.n.clone().normalize();
    const eye = b.stick(new THREE.SphereGeometry(0.034, 14, 10), EYE, eyeHit, {
      embed: 0.5,
      bone: head,
      name: `eye${L}`,
    });
    b.part(new THREE.SphereGeometry(0.023, 12, 8), IRIS, { at: eye.local([0, 0.0143, -0.003]), bone: head });
    b.part(new THREE.SphereGeometry(0.014, 10, 8), PUPIL, { at: eye.local([0, 0.0242, -0.004]), bone: head });
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), SHINE, { at: eye.local([sx * 0.01, 0.031, 0.012]), bone: head });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), SHINE, { at: eye.local([-sx * 0.01, 0.033, -0.011]), bone: head });

    const lid = b.joint(`lid${L}`, { parent: head, at: eye.at, dir: n, role: "hinge" });
    const lidDir = n.clone().multiplyScalar(0.25).add(up).normalize();
    b.part(new THREE.SphereGeometry(0.0375, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.3), coat, {
      at: eye.at,
      dir: lidDir,
      bone: lid,
      name: `lidMesh${L}`,
    });
    b.ring(
      frame(eye.at.clone().addScaledVector(n, 0.03), n),
      { count: 7, radius: 0.024, fromDeg: -85, toDeg: 85, tilt: 25 },
      (item) => {
        const base = item.at.clone();
        const out = item.axis.clone();
        const len = 0.024 + 0.024 * Math.max(0, -out.z);
        const p1 = base.clone().addScaledVector(out, len * 0.55);
        const p2 = base.clone().addScaledVector(out, len).addScaledVector(up, len * 0.4).addScaledVector(n, len * 0.2);
        b.sweep(bezier(base, p1, p2), [0.0032, 0.0006], {
          bone: lid,
          color: LASH,
          sides: 4,
          caps: { start: "round", end: "point" },
        });
      },
    );

    const cheek = hitOn(headSurf, hp(-sx * 0.3, 0.165, -0.022), head.dir([sx, 0, 0]));
    b.stick(new THREE.CylinderGeometry(0.019, 0.019, 0.004, 12), BLUSH, cheek, { embed: 0.5, bone: head });
  }

  // ears
  const EAR: OutlinePoint[] = [
    [-0.026, 0],
    [0.026, 0],
    [0.022, 0.05],
    [0, 0.09, "sharp"],
    [-0.022, 0.05],
  ];
  const EAR_IN: OutlinePoint[] = [
    [-0.015, 0],
    [0.015, 0],
    [0.012, 0.04],
    [0, 0.068, "sharp"],
    [-0.012, 0.04],
  ];
  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    const earY = new THREE.Vector3(sx * 0.35, 1, -0.2).normalize();
    const earX = new THREE.Vector3(sx, -0.35, 0).normalize();
    const earBase = hp(-sx * 0.048, -0.01, 0.06);
    const earJ = b.joint(`ear${L}`, { parent: head, at: earBase, dir: earY });
    const ear = b.extrude(EAR, {
      at: earBase,
      x: earX,
      y: earY,
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 2,
      color: coat,
      bone: earJ,
    });
    const out = ear.axis.z > 0 ? 1 : -1;
    b.extrude(EAR_IN, {
      at: ear.local([0, 0.012, out * 0.0075]),
      x: earX,
      y: earY,
      thickness: 0.004,
      smoothing: 2,
      color: EARIN,
      bone: earJ,
    });
  }

  // horn: twisted gold pentagon with a spiral thread
  const hornHit = hitOn(headSurf, hp(0, 0.075, 0.4), head.dir([0, 0, -1]));
  const hornDir = new THREE.Vector3(0, 0.8, 0.6).normalize();
  const hornBase = hornHit.at.clone();
  const hornTip = hornBase.clone().addScaledVector(hornDir, 0.125);
  const horn = b.sprout("horn", hornHit, hornTip, [0.021, 0.0025], {
    count: 1,
    color: gradient("#d39a1c", "#fff0a8", hornBase, hornTip),
    section: { ngon: 5 },
    twist: 540,
    caps: { start: "flat", end: "point" },
  });
  const hornJoint = horn.chain ? horn.chain.joints[0] : head;
  const perp = new THREE.Vector3().crossVectors(hornDir, new THREE.Vector3(1, 0, 0)).normalize();
  b.sweep(
    spiral(hornBase, hornBase.clone().addScaledVector(perp, 0.022), hornDir, { turns: 3, r1: 0.005, pitch: 0.034 }),
    0.0038,
    { bone: hornJoint, color: THREAD, sides: 5 },
  );
  b.part(new THREE.TorusGeometry(0.021, 0.0045, 5, 14), GOLDRING, {
    at: hornBase.clone().addScaledVector(hornDir, 0.003),
    dir: hornDir,
    axis: "z",
    bone: hornJoint,
    flat: true,
  });

  // ---------- mane ----------
  const puff = (r: number) => new THREE.IcosahedronGeometry(r, 1);
  const maneFrames = [];
  for (let i = 0; i < 10; i++) {
    const t = Math.min(0.985, 0.04 + i * 0.105);
    b.stick(puff(0.034 + 0.01 * rand(i)), PASTELS[i % 3], neckSweep.at(t, 0), { embed: 0.4, flat: true });
    b.stick(puff(0.027 + 0.006 * rand(i + 20)), PASTELS[(i + 1) % 3], neckSweep.at(t + 0.05, 40), {
      embed: 0.4,
      flat: true,
    });
    b.stick(puff(0.027 + 0.006 * rand(i + 40)), PASTELS[(i + 2) % 3], neckSweep.at(t + 0.05, -40), {
      embed: 0.4,
      flat: true,
    });
    if (i < 9) maneFrames.push(neckSweep.at(t + 0.05, 12 * (i % 2 ? 1 : -1)));
  }
  b.stick(puff(0.034), LAV, bodySweep.at(0.8, 0), { embed: 0.4, flat: true });
  b.stick(puff(0.03), PINK, bodySweep.at(0.74, 0), { embed: 0.45, flat: true });

  // forelock
  const fore: [number, number, number, string][] = [
    [0, -0.005, 0.03, PINK],
    [0.03, 0.025, 0.024, MINT],
    [-0.03, 0.025, 0.024, LAV],
  ];
  for (const [x, y, r, c] of fore) {
    const h = hitOn(headSurf, hp(x, y, 0.4), head.dir([0, 0, -1]));
    b.stick(puff(r), c, h, { embed: 0.4, flat: true });
    maneFrames.push(h);
  }

  const wisp = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 C6 54 4 38 10 26 C14 16 22 12 20 2 C28 10 30 26 24 38 C20 48 24 56 16 64 Z" fill="#ffffff"/><path d="M15 58 C10 50 10 40 14 32" stroke="#d6d6d6" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );
  b.cards(maneFrames, wisp, {
    size: [0.035, 0.07],
    lean: 60,
    bend: 35,
    flow: [0, -0.3, -1],
    vary: 0.25,
    rng: rng(9),
    color: pastelPick,
    cross: true,
  });

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 0.9, -0.4],
    [0, 0.89, -0.5],
    [0, 0.8, -0.58],
    [0, 0.7, -0.6],
  ]);
  const tail = b.chain("tail", tailPath, { parent: back, count: 3, role: "tail" });
  const tailSweep = b.sweep(tail, [0.04, 0.03, 0.022], { color: coat, name: "tailDock" });
  const tailFrames = b.along(tailSweep, 6, (at) => {
    const i = Math.round(at.t * 6 - 0.5);
    b.stick(puff(0.03 + 0.014 * at.t), PASTELS[i % 3], at, { embed: 0.45, flat: true });
    if (i >= 1) {
      b.stick(puff(0.024 + 0.01 * at.t), PASTELS[(i + 1) % 3], tailSweep.at(at.t, 100), { embed: 0.45, flat: true });
      b.stick(puff(0.024 + 0.01 * at.t), PASTELS[(i + 2) % 3], tailSweep.at(at.t, 260), { embed: 0.45, flat: true });
    }
  });
  const tipT = tailSweep.at(1, 180);
  b.stick(puff(0.04), PINK, tipT, { embed: 0.5, flat: true });
  b.cards(tailFrames, wisp, {
    size: [0.035, 0.07],
    lean: 50,
    bend: 30,
    flow: [0, -1, -0.3],
    vary: 0.25,
    rng: rng(13),
    color: pastelPick,
    cross: true,
  });

  // ---------- legs ----------
  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    const specs = [
      {
        id: "F",
        parent: front.joints[2],
        root: new THREE.Vector3(sx * 0.1, 0.8, 0.2),
        fet: new THREE.Vector3(sx * 0.17, 0.12, 0.24),
        hoof: new THREE.Vector3(sx * 0.172, 0.062, 0.262),
        lengths: [0.24, 0.26, 0.24],
        bends: [
          [0, 0, -1],
          [0, 0, 1],
        ],
        names: [`shoulder${L}`, `elbow${L}`, `knee${L}`, `fetlockF${L}`, `hoofF${L}`],
        radii: [0.064, 0.05, 0.04, 0.032, 0.03, 0.026, 0.025],
      },
      {
        id: "H",
        parent: hips,
        root: new THREE.Vector3(sx * 0.105, 0.82, -0.27),
        fet: new THREE.Vector3(sx * 0.16, 0.12, -0.31),
        hoof: new THREE.Vector3(sx * 0.162, 0.062, -0.29),
        lengths: [0.27, 0.28, 0.22],
        bends: [
          [0, 0, 1],
          [0, 0, -1],
        ],
        names: [`hip${L}`, `stifle${L}`, `hock${L}`, `fetlockH${L}`, `hoofH${L}`],
        radii: [0.074, 0.06, 0.044, 0.034, 0.03, 0.027, 0.025],
      },
    ];
    for (const sp of specs) {
      const pts = limb(sp.root, sp.fet, sp.lengths, sp.bends);
      const leg = b.chain(`leg${sp.id}${L}`, polyline([...pts, sp.hoof]), {
        parent: sp.parent,
        names: sp.names,
        role: "leg",
        contact: [sp.hoof.x, 0, sp.hoof.z],
      });
      b.sweep(leg, sp.radii, { color: legPaint, name: `leg${sp.id}${L}` });
      const knob = leg.joints[2];
      const fetJ = leg.joints[3];
      b.part(new THREE.SphereGeometry(0.036, 10, 8), legPaint, { at: knob.at, bone: knob });
      b.part(new THREE.SphereGeometry(0.031, 10, 8), legPaint, { at: fetJ.at, bone: fetJ });
      const hoofJ = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.lathe(
        [
          [0, 0],
          [0.04, 0],
          [0.041, 0.008],
          [0.034, 0.058],
          [0, 0.06],
        ],
        { at: [sp.hoof.x, 0, sp.hoof.z], bone: hoofJ, color: hoofPaint, segments: 10, name: `hoof${sp.id}${L}` },
      );
      b.part(new THREE.TorusGeometry(0.035, 0.009, 5, 10), CORONET, {
        at: [sp.hoof.x, 0.058, sp.hoof.z],
        dir: [0, 1, 0],
        axis: "z",
        bone: hoofJ,
        flat: true,
      });
    }
  }

  // ---------- daisy chain ----------
  const chainSurf = b.surface([neckSweep, bodySweep]);
  const loop = catmull(
    [
      [0, 1.045, 0.19],
      [0.105, 0.975, 0.28],
      [0, 0.885, 0.41],
      [-0.105, 0.975, 0.28],
    ],
    { closed: true },
  );
  const garland = chainSurf.drape(loop, { lift: 0.007 });
  b.sweep(garland, 0.0045, { color: STEM, sides: 5, name: "daisyStem" });

  const daisyOutline = (scale: number): OutlinePoint[] => {
    const o: OutlinePoint[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const r = (k % 2 === 0 ? 0.02 : 0.0075) * scale;
      o.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return o;
  };
  b.along(garland, 12, (at) => {
    const hit = chainSurf.nearest(at.at);
    const n = hit.n.clone().normalize();
    const T = at.axis.clone();
    T.addScaledVector(n, -T.dot(n)).normalize();
    const x = T.clone().applyAxisAngle(n, at.t * 37);
    const y = new THREE.Vector3().crossVectors(n, x);
    const big = 1 + 0.45 * Math.exp(-Math.pow((at.t - 0.5) / 0.09, 2));
    const c = at.at.clone().addScaledVector(n, 0.004);
    const bone = hit.bone ?? undefined;
    b.extrude(daisyOutline(big), { at: c, x, y, thickness: 0.004, smoothing: 1, color: daisyPaint, bone });
    b.part(new THREE.SphereGeometry(0.0068 * big, 8, 5).scale(1, 0.55, 1), YELLOW, {
      at: c.clone().addScaledVector(n, 0.002),
      dir: n,
      bone,
    });
  });
  const LEAF_O: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.007, 0.012],
    [0, 0.026, "sharp"],
    [-0.007, 0.012],
  ];
  b.along(
    garland,
    12,
    (at) => {
      const hit = chainSurf.nearest(at.at);
      const n = hit.n.clone().normalize();
      const T = at.axis.clone();
      T.addScaledVector(n, -T.dot(n)).normalize();
      const side = Math.round(at.t * 12) % 2 ? 1 : -1;
      const ly = T.clone().applyAxisAngle(n, side * 1.0);
      const lx = new THREE.Vector3().crossVectors(ly, n);
      b.extrude(LEAF_O, {
        at: at.at.clone().addScaledVector(n, 0.002),
        x: lx,
        y: ly,
        thickness: 0.003,
        smoothing: 1,
        color: LEAF,
        bone: hit.bone ?? undefined,
      });
    },
    { from: 0.042, to: 1 },
  );

  return b.root;
}
```