```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  paint,
  mix,
  smoothstep,
  noise,
  interpolate,
  aim,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A cuddly long-legged unicorn foal: cream coat with pink socks, blush cheeks and a star cutie-mark, big violet glossy eyes, " +
    "a golden spiral horn, pastel rainbow mane, forelock and tail, gold hooves. Fully rigged (spine, neck, head, jaw, ears, horn, tail, four legs).",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------- palette ----------
const COAT = "#fffaf2";
const SHADE = "#efe2f5";
const SOCK = "#f8d9ea";
const MUZZLE = "#ffbfd8";
const BLUSH = "#ffb0cf";
const STAR = "#ff8cc0";
const PINK = "#ff8fc3";
const LILAC = "#b79bff";
const SKY = "#7fd3ff";
const MINT = "#8ff0c4";
const BUTTER = "#ffe37d";
const PEACH = "#ffb98f";
const GOLD = "#ffcf4d";
const HORN = "#fff1d9";
const HOOF = "#f3c562";
const EYE_DARK = "#241236";
const IRIS_OUT = "#5a37b0";
const IRIS_IN = "#9a6dff";
const PUPIL = "#12081d";
const WHITE = "#ffffff";
const NOSTRIL = "#a24f7f";
const TONGUE = "#ff7fa6";
const EAR_IN_COL = "#ffb8d4";

// ---------- head frame (poll, head axis, dorsal axis) ----------
const POLL = V(0, 1.12, 0.38);
const HD = V(0, -0.72, 0.69).normalize();
const UP_H = V(0, 0.69, 0.72).normalize();
/** A point in head coordinates: a along the head, d toward the forehead, x sideways (+x = left). */
const H = (a: number, d: number, x = 0) =>
  POLL.clone().addScaledVector(HD, a).addScaledVector(UP_H, d).add(V(x, 0, 0));

const REL = new THREE.Vector3();

// One coat paint for the whole foal: belly shade, soft dapples, socks, cutie-mark star, blush cheeks, pink muzzle.
const coat = paint((p, n) => {
  let c = mix(COAT, SHADE, smoothstep(0.15, -0.75, n.y) * 0.85);
  c = mix(c, SHADE, smoothstep(0.64, 0.82, noise(p, 0.14, 2)) * 0.45);

  if (p.y < 0.2) {
    const k = smoothstep(0.17, 0.12, p.y + (noise(p, 0.04, 5) - 0.5) * 0.05);
    c = mix(c, SOCK, k);
  }

  // cutie mark on both flanks
  if (Math.abs(n.x) > 0.3 && p.y > 0.62 && p.y < 0.95 && p.z > -0.13 && p.z < 0.1) {
    const dz = p.z + 0.015;
    const dy = p.y - 0.78;
    const rr = Math.hypot(dz, dy);
    if (rr < 0.075) {
      const th = Math.atan2(dy, dz);
      const f = 0.5 + 0.5 * Math.cos(5 * (th - Math.PI / 2));
      const R = 0.022 + 0.034 * f * f;
      c = mix(c, STAR, smoothstep(R + 0.004, R - 0.004, rr));
    }
  }

  // face: blush cheeks and a pink muzzle
  REL.copy(p).sub(POLL);
  const a = REL.dot(HD);
  if (a > 0.08 && a < 0.5) {
    const dv = REL.dot(UP_H);
    REL.addScaledVector(HD, -a);
    if (REL.length() < 0.12) {
      if (Math.abs(n.x) > 0.2) {
        const dd = Math.hypot(a - 0.17, dv + 0.04, Math.abs(p.x) - 0.07);
        c = mix(c, BLUSH, smoothstep(0.05, 0.025, dd) * 0.75);
      }
      c = mix(c, MUZZLE, smoothstep(0.265, 0.315, a));
    }
  }
  return c;
});

// ---------- flat outlines ----------
const EAR_OUT: Array<Array<number | string>> = [
  [-0.022, 0],
  [0.022, 0],
  [0.036, 0.05],
  [0.027, 0.1],
  [0, 0.155, "sharp"],
  [-0.027, 0.1],
  [-0.036, 0.05],
];
const EAR_IN: Array<Array<number | string>> = [
  [-0.012, 0.012],
  [0.012, 0.012],
  [0.022, 0.05],
  [0.016, 0.09],
  [0, 0.128, "sharp"],
  [-0.016, 0.09],
  [-0.022, 0.05],
];
const starPts = (R: number, r: number): Array<Array<number | string>> =>
  Array.from({ length: 10 }, (_, i) => {
    const ang = Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? R : r;
    const x = Math.cos(ang) * rad;
    const y = Math.sin(ang) * rad;
    return i % 2 === 0 ? [x, y, "sharp"] : [x, y];
  });

// ---------- legs ----------
const FRONT: number[][] = [
  [0.105, 0.7, 0.24],
  [0.105, 0.31, 0.27],
  [0.105, 0.105, 0.26],
  [0.105, 0.072, 0.28],
];
const HIND: number[][] = [
  [0.115, 0.72, -0.2],
  [0.125, 0.5, -0.14],
  [0.108, 0.26, -0.27],
  [0.108, 0.1, -0.245],
  [0.108, 0.072, -0.225],
];
const FRONT_PROFILE: Array<[number, number]> = [
  [0, 0.05],
  [0.45, 0.047],
  [0.85, 0.036],
  [1, 0.039],
  [1.2, 0.028],
  [1.7, 0.026],
  [2, 0.031],
  [2.5, 0.027],
  [3, 0.026],
];
const HIND_PROFILE: Array<[number, number]> = [
  [0, 0.078],
  [0.5, 0.066],
  [1, 0.048],
  [1.5, 0.04],
  [2, 0.04],
  [2.3, 0.028],
  [2.7, 0.026],
  [3, 0.031],
  [3.5, 0.027],
  [4, 0.026],
];
const knotAt = (knots: number[], u: number) => {
  const i = Math.min(Math.floor(u), knots.length - 2);
  return knots[i] + (knots[i + 1] - knots[i]) * (u - i);
};
const legRadius = (knots: number[], profile: Array<[number, number]>) => {
  const xs = profile.map(([u]) => knotAt(knots, u));
  const ys = profile.map(([, r]) => r);
  return (t: number) => interpolate(xs, ys, t);
};

export default function build() {
  const b = createBuilder({ name: "unicorn_foal", paintSize: 1024 });
  const rand = rng(11);

  const maneCols = [PINK, LILAC, SKY, MINT, BUTTER];
  const tailCols = [PINK, LILAC, SKY, MINT, BUTTER, PEACH];

  // =====================================================================
  // Spine and barrel
  // =====================================================================
  const hips = b.joint("hips", { at: [0, 0.76, -0.2], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.76, -0.2],
      [0, 0.775, -0.07],
      [0, 0.79, 0.07],
      [0, 0.8, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  b.sweep(
    spine,
    (t: number): [number, number] => [
      interpolate([0, 0.35, 0.7, 1], [0.15, 0.168, 0.166, 0.152], t),
      interpolate([0, 0.35, 0.7, 1], [0.19, 0.205, 0.212, 0.2], t),
    ],
    { color: coat, sides: 12, name: "body" },
  );

  // =====================================================================
  // Neck
  // =====================================================================
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.86, 0.15],
      [0, 0.95, 0.24],
      [0, 1.04, 0.32],
      [0, 1.12, 0.38],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const neckSweep = b.sweep(
    neck,
    (t: number): [number, number] => [
      interpolate([0, 1], [0.115, 0.075], t),
      interpolate([0, 0.5, 1], [0.14, 0.105, 0.088], t),
    ],
    { color: coat, sides: 10, name: "neck" },
  );

  // =====================================================================
  // Head, jaw
  // =====================================================================
  const head = b.joint("head", { parent: neck, at: POLL, dir: HD, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0.1, -0.07, 0), dir: HD, role: "jaw" });

  const headStations: number[][] = [
    [-0.02, 0.0, 0.13, 0.15],
    [0.05, 0.0, 0.17, 0.19],
    [0.13, 0.0, 0.165, 0.185],
    [0.22, 0.0, 0.115, 0.11],
    [0.285, -0.01, 0.095, 0.075],
    [0.335, -0.015, 0.088, 0.065],
  ];
  const headSweep = b.loft(
    headStations.map(([a, d, w, h]) => ({ at: H(a, d), w, h })),
    { color: coat, bone: head, sides: 10, name: "head" },
  );
  const headSurf = b.surface(headSweep);

  const jawStations: number[][] = [
    [0.09, -0.0725, 0.12, 0.085],
    [0.18, -0.08, 0.1, 0.07],
    [0.27, -0.0715, 0.082, 0.053],
    [0.335, -0.0665, 0.074, 0.043],
  ];
  b.loft(
    jawStations.map(([a, d, w, h]) => ({ at: H(a, d), w, h })),
    { color: coat, bone: jaw, sides: 8, name: "lowerJaw" },
  );
  // tongue: hidden while the mouth is closed
  b.part(new THREE.SphereGeometry(1, 8, 6), TONGUE, {
    at: H(0.22, -0.046, 0),
    quat: aim(HD, UP_H, "z"),
    scale: [0.02, 0.009, 0.085],
    bone: jaw,
    name: "tongue",
  });

  // =====================================================================
  // Eyes, lashes, nostrils
  // =====================================================================
  for (const s of [1, -1]) {
    const hit = headSurf.ray(H(0.115, 0.02, s * 0.5), [-s, 0, 0]) ?? headSurf.nearest(H(0.115, 0.02, s * 0.08));
    const n = hit.n;
    const q = aim(n);
    const up = V(0, 1, 0);
    const fwd = V(0, 0, 1);
    const layer = (r: number, sq: number, color: string, out: number, du = 0, df = 0, name = "eye") =>
      b.part(new THREE.SphereGeometry(r, 12, 8), color, {
        at: hit.at.addScaledVector(n, out).addScaledVector(up, du).addScaledVector(fwd, df),
        quat: q,
        scale: [1, sq, 1],
        bone: head,
        name,
      });
    layer(0.036, 0.4, EYE_DARK, -0.002, 0, 0, "eyeball");
    layer(0.028, 0.32, IRIS_OUT, 0.008, 0, 0, "irisOuter");
    layer(0.021, 0.3, IRIS_IN, 0.0115, 0, 0, "irisInner");
    layer(0.014, 0.3, PUPIL, 0.015, 0, 0, "pupil");
    layer(0.009, 0.5, WHITE, 0.0175, 0.009, 0.008, "glint");
    layer(0.0045, 0.8, WHITE, 0.0165, -0.008, -0.006, "glint");

    for (const deg of [-15, 25, 65]) {
      const a = (deg * Math.PI) / 180;
      const tdir = up.clone().multiplyScalar(Math.cos(a)).addScaledVector(fwd, -Math.sin(a));
      const base = hit.at.addScaledVector(n, 0.004).addScaledVector(tdir, 0.032);
      const dir = tdir.clone().multiplyScalar(0.8).addScaledVector(n, 0.45).normalize();
      b.spike(base, dir, 0.04, 0.0045, { color: EYE_DARK, bone: head, sides: 4, smooth: false, name: "lash" });
    }

    const nose = headSurf.ray(H(0.55, -0.012, s * 0.03), HD.clone().negate());
    if (nose) {
      b.part(new THREE.SphereGeometry(0.0125, 8, 6), NOSTRIL, {
        at: nose.at.addScaledVector(nose.n, -0.002),
        quat: aim(nose.n),
        scale: [1.1, 0.45, 1.4],
        bone: head,
        name: "nostril",
      });
    }
  }

  // =====================================================================
  // Ears
  // =====================================================================
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const base = H(0.045, 0.05, s * 0.05);
    const xd = V(0.97, -0.2 * s, 0).normalize();
    const yd = V(0.28 * s, 0.92, 0.22).normalize();
    yd.addScaledVector(xd, -yd.dot(xd)).normalize();
    const zd = new THREE.Vector3().crossVectors(xd, yd);
    const ear = b.joint(`ear${L}`, { parent: head, at: base, dir: yd });
    b.extrude(EAR_OUT, {
      color: coat,
      at: base,
      x: xd,
      y: yd,
      thickness: [0.018, 0.006],
      bevel: 0.003,
      smoothing: 1,
      bone: ear,
      name: `ear${L}`,
    });
    b.extrude(EAR_IN, {
      color: EAR_IN_COL,
      at: base.clone().addScaledVector(zd, 0.004),
      x: xd,
      y: yd,
      thickness: [0.012, 0.006],
      bone: ear,
      name: `earInner${L}`,
    });
  }

  // =====================================================================
  // Horn: pearly cone with a double golden spiral
  // =====================================================================
  const D = V(0, 0.84, 0.54).normalize();
  const hornBase = H(0.13, 0.082, 0);
  const hornLen = 0.27;
  const hornTip = hornBase.clone().addScaledVector(D, hornLen);
  const hornJ = b.joint("horn", { parent: head, at: hornBase, dir: D });
  b.spike(hornBase, hornTip, null, 0.036, { color: HORN, bone: hornJ, sides: 8, smooth: false, name: "horn" });
  {
    const ux = V(1, 0, 0);
    const vy = D.clone().cross(ux).normalize();
    for (const off of [0, Math.PI]) {
      const pts: THREE.Vector3[] = [];
      const N = 40;
      for (let i = 0; i <= N; i++) {
        const f = 0.04 + 0.9 * (i / N);
        const r = 0.036 * (1 - f) * 0.97;
        const ang = off + f * 3 * Math.PI * 2;
        pts.push(
          hornBase
            .clone()
            .addScaledVector(D, f * hornLen)
            .addScaledVector(ux, Math.cos(ang) * r)
            .addScaledVector(vy, Math.sin(ang) * r),
        );
      }
      b.sweep(catmull(pts), [0.0085, 0.008, 0.006, 0.0035, 0.0015], {
        color: GOLD,
        bone: hornJ,
        sides: 5,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: "hornSpiral",
      });
    }
  }
  b.part(new THREE.CylinderGeometry(0.044, 0.05, 0.03, 8), GOLD, {
    at: hornBase.clone().addScaledVector(D, 0.004),
    quat: aim(D),
    bone: hornJ,
    flat: true,
    name: "hornCollar",
  });

  // =====================================================================
  // Forelock: pastel fringe draping beside the horn
  // =====================================================================
  const forelock = (x0: number, scale: number, col: string) => {
    for (const s of [1, -1]) {
      const R = headSurf.ray(H(0.08, 0.35, s * x0), UP_H.clone().negate());
      if (!R) continue;
      const r0 = R.at;
      const n = R.n;
      const pts = [
        r0.clone().addScaledVector(n, -0.012),
        r0.clone().addScaledVector(n, 0.04 * scale).addScaledVector(HD, 0.012 * scale),
        r0.clone().addScaledVector(n, 0.07 * scale).addScaledVector(HD, 0.06 * scale),
        r0.clone().addScaledVector(n, 0.055 * scale).addScaledVector(HD, 0.12 * scale).addScaledVector(V(s, 0, 0), 0.01 * scale),
        r0.clone().addScaledVector(HD, 0.17 * scale).addScaledVector(V(s, 0, 0), 0.015 * scale),
      ];
      b.sweep(catmull(pts), [0.018, 0.026, 0.022, 0.014, 0], {
        color: col,
        bone: head,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
        name: "forelock",
      });
    }
  };
  forelock(0.045, 1, PINK);
  forelock(0.065, 0.65, SKY);

  // =====================================================================
  // Neck mane: a tousled V of pastel locks
  // =====================================================================
  const nMane = 9;
  for (let i = 0; i < nMane; i++) {
    const t = 0.07 + (0.86 * i) / (nMane - 1);
    const col = maneCols[Math.min(maneCols.length - 1, Math.floor((i * maneCols.length) / nMane))];
    for (const s of [1, -1]) {
      const root = neckSweep.at(t, 0, -0.012);
      const r0 = root.at;
      const dirv = root.n.multiplyScalar(0.55).add(V(0, 0.45, 0)).normalize();
      const L = 0.1 * (0.85 + 0.35 * rand());
      const S = V(s, 0, 0);
      const pts = [
        root,
        r0.clone().addScaledVector(dirv, 0.45 * L).addScaledVector(S, 0.1 * L),
        r0.clone().addScaledVector(dirv, 0.85 * L).addScaledVector(S, 0.55 * L),
        r0.clone().addScaledVector(dirv, 0.8 * L).addScaledVector(S, 1.0 * L).add(V(0, -0.35 * L, 0)),
      ];
      b.sweep(catmull(pts), [0.021, 0.026, 0.019, 0.01, 0], {
        color: col,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
        name: "mane",
      });
    }
  }
  // a little golden star clip pinned in the mane
  {
    const c = neckSweep.at(0.42, 0, 0).at;
    b.extrude(starPts(0.04, 0.017), {
      color: GOLD,
      at: c.addScaledVector(V(0, 1, 0), 0.075).add(V(0.12, 0, 0)),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      bone: neck.jointAt(0.42),
      name: "starClip",
    });
  }

  // =====================================================================
  // Tail: short coat-coloured dock with a rainbow brush
  // =====================================================================
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.86, -0.28],
      [0, 0.88, -0.39],
      [0, 0.83, -0.48],
      [0, 0.7, -0.52],
      [0, 0.57, -0.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, (t: number) => interpolate([0, 0.5, 1], [0.036, 0.03, 0.022], t), {
    color: coat,
    sides: 8,
    name: "tailDock",
  });
  const nTail = 8;
  for (let k = 0; k < nTail; k++) {
    const phi = (k / nTail) * Math.PI * 2;
    const cs = Math.cos(phi);
    const sn = Math.sin(phi);
    const ts = [0.15, 0.45, 0.75, 1.0];
    const spreads = [0.015, 0.035, 0.05, 0.06];
    const pts: THREE.Vector3[] = ts.map((t, j) => {
      const f = tail.at(t);
      return f.at.addScaledVector(f.binormal, cs * spreads[j]).addScaledVector(f.normal, sn * spreads[j]);
    });
    const fend = tail.at(1);
    const ext = 0.14 + 0.07 * rand();
    pts.push(
      fend.at
        .addScaledVector(fend.tangent, ext)
        .addScaledVector(fend.binormal, cs * 0.07)
        .addScaledVector(fend.normal, sn * 0.07),
    );
    b.sweep(catmull(pts), [0.02, 0.026, 0.024, 0.016, 0], {
      color: tailCols[k % tailCols.length],
      bone: tail,
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "point" },
      name: "tailLock",
    });
  }

  // =====================================================================
  // Legs: long, skinny, with gold hooves and pastel fetlock tufts
  // =====================================================================
  const legCols = [PINK, LILAC, SKY, MINT];
  let legIndex = 0;
  for (const front of [true, false]) {
    for (const s of [1, -1]) {
      const L = s > 0 ? "L" : "R";
      const src = front ? FRONT : HIND;
      const pts = src.map(([x, y, z]) => [x * s, y, z]);
      const last = pts.length - 1;
      const names = front
        ? [`shoulder${L}`, `knee${L}`, `fetlockF${L}`, `hoofF${L}`]
        : [`hip${L}`, `stifle${L}`, `hock${L}`, `fetlockH${L}`, `hoofH${L}`];
      const path = polyline(pts);
      const chain = b.chain(`leg${front ? "F" : "H"}${L}`, path, {
        parent: front ? spine : hips,
        names,
        role: "leg",
        contact: [pts[last][0], 0, pts[last][2] + 0.01],
      });
      const rad = legRadius(path.knots, front ? FRONT_PROFILE : HIND_PROFILE);
      const stretch = front ? 1.04 : 1.1;
      b.sweep(
        chain,
        (t: number): [number, number] => {
          const r = rad(t);
          return [r, r * stretch];
        },
        { color: coat, sides: 8, name: `leg${front ? "F" : "H"}${L}` },
      );

      // hoof
      b.part(new THREE.CylinderGeometry(0.027, 0.037, 0.072, 8), HOOF, {
        at: [pts[last][0], 0.036, pts[last][2] + 0.01],
        bone: chain.tip!,
        scale: [1, 1, 1.12],
        flat: true,
        name: `hoof${front ? "F" : "H"}${L}`,
      });

      // fetlock tufts
      const fi = front ? 2 : 3;
      const fj = chain.joints[fi];
      const fp = pts[fi];
      const tcol = legCols[legIndex % legCols.length];
      legIndex++;
      const base = V(fp[0], fp[1], fp[2] - 0.015);
      const dirs: number[][] = [
        [0, -0.75, -0.65],
        [0.55 * s, -0.8, -0.2],
        [-0.55 * s, -0.8, -0.2],
      ];
      for (const d of dirs) {
        b.spike(base, d, 0.065, 0.017, { color: tcol, bone: fj, sides: 5, smooth: false, name: "fetlockTuft" });
      }
    }
  }

  return b.root;
}
```