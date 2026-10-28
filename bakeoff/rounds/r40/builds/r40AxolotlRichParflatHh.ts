import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, rng, bezier } from "../../../../src/index";

export const meta = {
  "name": "Chibi Axolotl",
  "description": "A chubby chibi axolotl: a pink leucistic body with an oversized head, glossy black eyes, a wide smile, stubby limbs, a finned tail and six frilly hot-pink gill plumes."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#f7b9c8",
  skinBack: "#f1a3b7",
  belly: "#fde0e5",
  freckle: "#e68aa3",
  blush: "#ff8fa8",
  eye: "#1a1220",
  eyeShine: "#ffffff",
  eyeRing: "#5a3a52",
  brow: "#f09cb2",
  mouthInside: "#c4435f",
  tongue: "#ff8a9e",
  mouthLine: "#d9647f",
  nostril: "#d9708a",
  fin: "#f9a9bc",
  finEdge: "#ff7da0",
  finRay: "#f48aa8",
  gillStalk: "#ee5f8c",
  gillRoot: "#ff3d7a",
  gillMid: "#ff6b9a",
  gillTip: "#ffb3cb",
  toe: "#ffc6d2",
  toePad: "#ec8aa4",
};
const M = {
  headBack: [0, 0.06, 0.035] as [number, number, number],
  neckJoin: [0, 0.05, 0.045] as [number, number, number],
  mouthFront: [0, 0.045, 0.168] as [number, number, number],
  jawHinge: [0, 0.03, 0.07] as [number, number, number],
  eyeL: [0.048, 0.1, 0.125] as [number, number, number],
  eyeR: [-0.048, 0.1, 0.125] as [number, number, number],
  cheekL: [0.07, 0.06, 0.1] as [number, number, number],
  cheekR: [-0.07, 0.06, 0.1] as [number, number, number],
  nostrilTop: [0, 0.09, 0.165] as [number, number, number],
  dorsalStart: [0, 0.1, 0.04] as [number, number, number],
  hipsTop: [0, 0.092, -0.07] as [number, number, number],
  tailRoot: [0, 0.05, -0.075] as [number, number, number],
  tailTip: [0, 0.038, -0.255] as [number, number, number],
  shoulderL: [0.045, 0.045, 0.04] as [number, number, number],
  shoulderR: [-0.045, 0.045, 0.04] as [number, number, number],
  hipL: [0.045, 0.042, -0.06] as [number, number, number],
  hipR: [-0.045, 0.042, -0.06] as [number, number, number],
  gillTopRootL: [0.05, 0.085, 0.04] as [number, number, number],
  gillMidRootL: [0.065, 0.065, 0.04] as [number, number, number],
  gillLowRootL: [0.06, 0.045, 0.04] as [number, number, number],
  gillTopRootR: [-0.05, 0.085, 0.04] as [number, number, number],
  gillMidRootR: [-0.065, 0.065, 0.04] as [number, number, number],
  gillLowRootR: [-0.06, 0.045, 0.04] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: any) {
  const head = J.head;
  const jaw = J.jaw;
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  // ---------- helpers ----------
  // A squashed, faceted sphere used as a body mass.
  const blob = (c: number[], r: number[], color: string, bone: any, seg: [number, number] = [14, 10], flat = true) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { bone, at: c, scale: r, flat });

  // A partial sphere shell (a cap) laid over a blob, to carry a second colour on top or underneath.
  const cap = (c: number[], r: number[], color: string, bone: any, top: boolean, theta: number) =>
    b.part(
      new THREE.SphereGeometry(1, 14, 5, 0, Math.PI * 2, top ? 0 : Math.PI - theta, theta),
      color,
      { bone, at: c, scale: r, flat: true },
    );

  // A flat oval lying on a surface hit, facing out of it. size = [across, thickness, along].
  const patch = (hit: any, color: string, size: number[], bone: any, lift = 0.0006, seg = 8) => {
    const at = hit.at.clone().addScaledVector(hit.n, lift);
    return b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, {
      bone,
      at,
      dir: hit.n.clone(),
      scale: size,
      flat: true,
    });
  };

  // ---------- upper head ----------
  const SK_C = [0, 0.077, 0.088];
  const SK_R = [0.078, 0.048, 0.058];
  const skull = blob(SK_C, SK_R, P.skin, head, [18, 12]);
  // darker top cap
  const topCap = cap(SK_C, SK_R.map((v) => v * 1.014), P.skinBack, head, true, 1.05);
  // blunt snout
  const snout = blob([0, 0.068, 0.125], [0.05, 0.034, 0.045], P.skin, head, [14, 10]);
  // back flank bulges (they hold the gill roots)
  const flanks = [1, -1].map((s) => blob([s * 0.04, 0.065, 0.058], [0.032, 0.035, 0.028], P.skin, head, [10, 8]));
  // puffy cheeks
  const CHEEK_C = (s: number) => [s * 0.052, 0.055, 0.095];
  const cheeks = [1, -1].map((s) => blob(CHEEK_C(s), [0.027, 0.025, 0.03], P.skin, head, [12, 9]));

  // ---------- lower jaw ----------
  const JAW_C = [0, 0.04, 0.1];
  const JAW_R = [0.058, 0.024, 0.064];
  const jawBody = blob(JAW_C, JAW_R, P.skin, jaw, [14, 9]);
  cap(JAW_C, JAW_R.map((v) => v * 1.014), P.belly, jaw, false, 1.0);
  // mouth interior hint: dark floor and a small tongue, tucked inside the closed mouth
  blob([0, 0.058, 0.1], [0.048, 0.006, 0.05], P.mouthInside, jaw, [10, 5]);
  blob([0, 0.06, 0.125], [0.015, 0.005, 0.022], P.tongue, jaw, [8, 5]);
  // chin bump
  blob([0, 0.03, 0.15], [0.02, 0.012, 0.012], P.belly, jaw, [8, 5]);

  // ---------- smile ----------
  const union = b.surface([skull, snout, jawBody, ...cheeks]);
  const MC = [0, 0.052, 0.1];
  const azs = [-98, -82, -64, -46, -28, -10, 10, 28, 46, 64, 82, 98];
  const smilePts = (elShift: number, lift: number) => {
    const pts: THREE.Vector3[] = [];
    // include curling ends beyond the cheeks
    const list = [-106, ...azs, 106];
    for (const az of list) {
      const t = Math.min(1, Math.abs(az) / 98);
      const el = -2 + 14 * t * t + (Math.abs(az) > 100 ? 6 : 0) + elShift;
      const h = union.around(MC).at(az, el);
      if (h) pts.push(h.at.clone().addScaledVector(h.n, lift));
    }
    return pts;
  };
  const inner = smilePts(-3.8, 0.0008);
  if (inner.length > 3) {
    b.sweep(catmull(inner), 0.0034, { color: P.mouthInside, bone: jaw, sides: 5, caps: "round" });
  }
  const line = smilePts(0, 0.0012);
  if (line.length > 3) {
    b.sweep(catmull(line), 0.0024, { color: P.mouthLine, bone: head, sides: 5, caps: "round" });
    // dimple dots at the mouth corners
    for (const end of [line[0], line[line.length - 1]]) {
      b.part(new THREE.SphereGeometry(0.0038, 6, 4), P.mouthLine, { bone: head, at: end });
    }
  }

  // ---------- nostrils ----------
  const snoutSurf = b.surface([skull, snout]);
  for (const s of [1, -1]) {
    const h = snoutSurf.nearest([s * 0.012, 0.088, 0.162]);
    patch(h, P.nostril, [0.0042, 0.0018, 0.0032], head, 0.0004, 6);
  }

  // ---------- eyes ----------
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const m = s > 0 ? M.eyeL : M.eyeR;
    const hit = skullSurf.nearest(m);
    const at: THREE.Vector3 = hit.at.clone();
    const n: THREE.Vector3 = hit.n.clone();
    // tangent frame on the surface
    const upT = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const mid = new THREE.Vector3(-s, 0, 0).addScaledVector(n, n.x * s).normalize();

    // dark rim disc behind the bead
    b.part(new THREE.CylinderGeometry(0.0225, 0.0225, 0.004, 12), P.eyeRing, {
      bone: head,
      at: at.clone().addScaledVector(n, 0.0004),
      dir: n.clone(),
    });
    // glossy bead
    const center = at.clone().addScaledVector(n, 0.0045);
    b.part(new THREE.SphereGeometry(0.017, 12, 9), P.eye, { bone: head, at: center });
    // big highlight
    const d1 = n.clone().addScaledVector(upT, 0.6).addScaledVector(mid, 0.4).normalize();
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), P.eyeShine, {
      bone: head,
      at: center.clone().addScaledVector(d1, 0.0145),
    });
    // small highlight
    const d2 = n.clone().addScaledVector(upT, -0.5).addScaledVector(mid, -0.55).normalize();
    b.part(new THREE.SphereGeometry(0.0028, 6, 5), P.eyeShine, {
      bone: head,
      at: center.clone().addScaledVector(d2, 0.0158),
    });
    // brow bump above the eye
    const bh = skullSurf.nearest(at.clone().add(new THREE.Vector3(-s * 0.002, 0.026, -0.006)));
    patch(bh, P.brow, [0.015, 0.0055, 0.009], head, 0.0004, 8);
  }

  // ---------- cheeks: blush and freckles ----------
  [1, -1].forEach((s, i) => {
    const cs = b.surface(cheeks[i]);
    const c = CHEEK_C(s);
    const bh = cs.around(c).at(s * 58, 8);
    if (bh) b.part(new THREE.CylinderGeometry(0.0145, 0.0145, 0.003, 10), P.blush, {
      bone: head,
      at: bh.at.clone().addScaledVector(bh.n, 0.0003),
      dir: bh.n.clone(),
      scale: [1, 1, 0.82],
    });
    [[38, 34], [52, 40], [66, 34]].forEach(([az, el]) => {
      const fh = cs.around(c).at(s * az, el);
      if (fh) patch(fh, P.freckle, [0.003, 0.0012, 0.003], head, 0.0004, 6);
    });
  });

  // ---------- forehead freckles ----------
  const topSurf = b.surface(topCap);
  const spots: [number, number, number][] = [
    [0.0, 0.105, 0.0034],
    [0.017, 0.09, 0.0028],
    [-0.018, 0.098, 0.003],
    [0.031, 0.077, 0.0026],
    [-0.032, 0.082, 0.0028],
    [0.008, 0.07, 0.0026],
    [-0.009, 0.122, 0.0024],
    [0.02, 0.118, 0.0022],
  ];
  for (const [x, z, r] of spots) {
    const h = topSurf.ray([x, 0.3, z], [0, -1, 0]);
    if (h) patch(h, P.freckle, [r, 0.0012, r], head, 0.0004, 6);
  }

  // ---------- neck taper: a soft collar where the head meets the body ----------
  blob([0, 0.055, 0.042], [0.05, 0.036, 0.016], P.skin, head, [10, 7]);
}
    return buildHead;
  })(),
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  // ---------- helpers ----------
  const smooth = (x: number) => x * x * (3 - 2 * x);
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  // piecewise smooth interpolation over [z, value] keys
  const keyed = (keys: [number, number][], z: number) => {
    if (z <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (z <= keys[i][0]) {
        const [za, va] = keys[i - 1];
        const [zb, vb] = keys[i];
        return va + (vb - va) * smooth((z - za) / (zb - za));
      }
    }
    return keys[keys.length - 1][1];
  };

  // ---------- torso ----------
  const Z0 = -0.058;
  const Z1 = 0.07;
  const L = Z1 - Z0;
  const rxKeys: [number, number][] = [
    [-0.058, 0.024],
    [-0.04, 0.037],
    [-0.01, 0.047],
    [0.02, 0.05],
    [0.07, 0.046],
  ];
  const ryKeys: [number, number][] = [
    [-0.058, 0.028],
    [-0.04, 0.037],
    [-0.01, 0.0425],
    [0.02, 0.0425],
    [0.07, 0.038],
  ];
  const spine = [
    [0, 0.05, Z0],
    [0, 0.048, -0.02],
    [0, 0.047, 0.03],
    [0, 0.047, Z1],
  ];
  const torso = b.sweep(spine, (t) => [keyed(rxKeys, Z0 + L * t), keyed(ryKeys, Z0 + L * t)], {
    bone: [J.hips, J.chest],
    color: P.skin,
    sides: 12,
    caps: { start: "round", end: "flat" },
    sectors: [
      [-70, 70, P.skinBack],
      [120, 240, P.belly],
    ],
  });
  const skin = b.surface(torso);

  // ---------- costal grooves on the flanks ----------
  const GROOVE = "#ec97ae";
  for (const s of [1, -1]) {
    for (const t of [0.24, 0.35, 0.46, 0.57]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 4; i++) {
        const deg = 42 + i * 26;
        const a = -s * deg;
        pts.push(torso.at(t + 0.018 * i, a, 0.0004).at.clone());
      }
      b.sweep(pts, 0.0012, {
        color: GROOVE,
        sides: 5,
        bone: t < 0.4 ? J.hips : J.chest,
        caps: "round",
      });
    }
  }

  // ---------- dorsal fin ----------
  const hCache = new Map<number, number>();
  const h = (z: number) => {
    const key = Math.round(z * 10000);
    let v = hCache.get(key);
    if (v === undefined) {
      const hit = skin.ray([0, 0.25, z], [0, -1, 0]);
      v = hit ? hit.at.y : 0.047 + keyed(ryKeys, z);
      hCache.set(key, v);
    }
    return v;
  };
  const STEP = 0.006;
  const rise = (z: number) => {
    const k = Math.round(z / STEP);
    const peak = (((k % 2) + 2) % 2) === 0;
    const base = 0.006 + (peak ? 0.008 : 0);
    const env = 1 - 0.45 * clamp01(z / 0.042);
    const extra = 0.014 * smooth(clamp01((-0.035 - z) / 0.037));
    return base * env + extra;
  };
  const topY = (z: number) => h(z) + rise(z);

  const finPiece = (k0: number, k1: number, bone: any) => {
    const zs: number[] = [];
    for (let k = k0; k <= k1; k++) zs.push(k * STEP);
    const outline: [number, number][] = [];
    for (const z of zs) outline.push([z, topY(z)]);
    for (const z of zs.slice().reverse()) outline.push([z, h(z) - 0.007]);
    b.extrude(outline, {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.004,
      color: P.fin,
      bone,
    });
    // rim along the frilled top edge
    b.sweep(
      zs.map((z) => [0, topY(z) + 0.0005, z]),
      0.0018,
      { color: P.finEdge, sides: 5, bone },
    );
  };
  finPiece(-12, 0, J.hips);
  finPiece(0, 7, J.chest);

  // fin ray ridges on both faces
  for (let k = -12; k <= 7; k++) {
    const z = k * STEP;
    const bone = k < 0 ? J.hips : J.chest;
    for (const s of [1, -1]) {
      b.rod([s * 0.0019, h(z) - 0.002, z], [s * 0.0019, topY(z) - 0.0015, z - 0.0025], 0.0009, P.finRay, {
        bone,
        sides: 4,
      });
    }
  }

  // ---------- shoulder and hip mounds ----------
  const moundGeo = new THREE.SphereGeometry(1, 10, 7);
  for (const s of [1, -1]) {
    b.part(moundGeo, P.skin, {
      at: [s * 0.042, 0.043, 0.04],
      scale: [0.011, 0.014, 0.016],
      bone: J.chest,
    });
    b.part(moundGeo, P.skin, {
      at: [s * 0.034, 0.043, -0.052],
      scale: [0.013, 0.015, 0.017],
      bone: J.hips,
    });
  }
  const moundCenters = [
    [0.042, 0.043, 0.04],
    [-0.042, 0.043, 0.04],
    [0.034, 0.043, -0.052],
    [-0.034, 0.043, -0.052],
  ];

  // ---------- freckles ----------
  const r = rng(11);
  const hits = skin.scatter(18, {
    rng: r,
    minDist: 0.017,
    filter: (hit) => {
      const p = hit.at;
      if (hit.n.y < -0.1) return false;
      if (Math.abs(p.x) < 0.009 && hit.n.y > 0.9) return false;
      if (p.z > 0.045 || p.z < -0.052) return false;
      for (const c of moundCenters) if (Math.hypot(p.x - c[0], p.y - c[1], p.z - c[2]) < 0.024) return false;
      return true;
    },
  });
  for (const hit of hits) {
    const rad = 0.0032 + r() * 0.003;
    b.stick(new THREE.CylinderGeometry(rad, rad, 0.003, 7), P.freckle, hit, { embed: 0.5 });
  }

  // ---------- cloaca bump ----------
  const under = skin.ray([0, -0.05, -0.045], [0, 1, 0]);
  if (under) {
    b.stick(new THREE.SphereGeometry(0.0065, 8, 6), P.brow, under, { embed: 0.35, scale: [1, 0.7, 1.2] });
    b.stick(new THREE.BoxGeometry(0.002, 0.0016, 0.009), P.mouthLine, under.moved([0, 0.0034, 0]), {
      embed: 0.3,
    });
  }
}
    return buildBody;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P }: Ctx) {
  const R = rng(11);
  const bones = [J.tail1, J.tail2, J.tail3, J.tail4];

  // ---- centreline profile (z runs back, so the tail heads toward -Z)
  const Z = [-0.06, -0.115, -0.16, -0.205, -0.248];
  const Y = [0.05, 0.048, 0.045, 0.04, 0.038];
  const cy = (z: number) => {
    for (let i = 0; i < Z.length - 1; i++) {
      if (z <= Z[i] && z >= Z[i + 1]) {
        const k = (Z[i] - z) / (Z[i] - Z[i + 1]);
        return Y[i] + (Y[i + 1] - Y[i]) * k;
      }
    }
    return z > Z[0] ? Y[0] : Y[Y.length - 1];
  };
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const f = (z: number) => clamp((-z - 0.075) / 0.173, 0, 1); // 0 at the root, 1 at the tip
  const rxAt = (z: number) => 0.0045 + 0.0125 * Math.pow(1 - f(z), 1.1);
  const ryAt = (z: number) => 0.006 + 0.014 * Math.pow(1 - f(z), 1.1);

  // ---- the tube: flattened oval, skin pink, darker back and pale belly
  const path = Z.map((z, i) => [0, Y[i], z]);
  const tube = b.sweep(path, (t) => {
    const z = -0.06 - 0.188 * t;
    return [rxAt(z), ryAt(z)];
  }, {
    bone: bones,
    color: P.skin,
    sides: 10,
    caps: "round",
    sectors: [
      [-60, 60, P.skinBack],
      [125, 235, P.belly],
    ],
  });

  // ---- fins, one rigid skirt per tail joint
  const zs = [-0.07, -0.115, -0.16, -0.205, -0.248];
  const N = 4;
  const lerp = (a: number, c: number, t: number) => a + (c - a) * t;
  const dip = (z: number) => 0.003 * (1 - f(z) * 0.5);
  const topY = (z: number, valley: boolean) =>
    cy(z) + ryAt(z) + 0.03 * (1 - f(z)) + 0.005 - (valley ? dip(z) : 0);
  const botY = (z: number, valley: boolean) =>
    cy(z) - ryAt(z) - 0.02 * (1 - f(z)) - 0.004 + (valley ? dip(z) * 0.8 : 0);

  for (let k = 0; k < 4; k++) {
    const bone = bones[k];
    const za = zs[k];
    const zb = zs[k + 1];
    const zAt = (i: number) => lerp(za, zb, i / N);

    // dorsal skirt
    const topOutline: [number, number][] = [];
    for (let i = 0; i <= N; i++) topOutline.push([-zAt(i), cy(zAt(i)) + ryAt(zAt(i)) * 0.7]);
    const topEdge: number[][] = [];
    for (let i = N; i >= 0; i--) {
      const z = zAt(i);
      const y = topY(z, i % 2 === 0);
      topOutline.push([-z, y]);
      topEdge.push([0, y, z]);
    }
    b.extrude(topOutline, {
      at: [0, 0, 0],
      x: [0, 0, -1],
      thickness: 0.004,
      bevel: 0.0008,
      color: P.fin,
      bone,
    });
    b.sweep(topEdge.slice().reverse(), 0.0018, {
      color: P.finEdge,
      bone,
      sides: 5,
    });

    // ventral skirt
    const botOutline: [number, number][] = [];
    const botEdge: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const z = zAt(i);
      const y = botY(z, i % 2 === 0);
      botOutline.push([-z, y]);
      botEdge.push([0, y, z]);
    }
    for (let i = N; i >= 0; i--) botOutline.push([-zAt(i), cy(zAt(i)) - ryAt(zAt(i)) * 0.7]);
    b.extrude(botOutline, {
      at: [0, 0, 0],
      x: [0, 0, -1],
      thickness: 0.004,
      bevel: 0.0008,
      color: P.fin,
      bone,
    });
    b.sweep(botEdge, 0.0018, { color: P.finEdge, bone, sides: 5 });

    // fin rays: thin ribs showing through both faces, fanning slightly back
    for (let i = 1; i < N; i++) {
      const z = zAt(i);
      const valley = i % 2 === 0;
      const lean = 0.012 * (1 - f(z) * 0.5);
      // top
      const tb = [0, cy(z) + ryAt(z) * 0.85, z];
      const tt = [0, topY(z, valley) - 0.0015, z - lean];
      // bottom
      const bb = [0, cy(z) - ryAt(z) * 0.85, z];
      const bt = [0, botY(z, valley) + 0.0015, z - lean * 0.8];
      for (const [p0, p1] of [
        [tb, tt],
        [bb, bt],
      ]) {
        const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        const len = Math.hypot(d[0], d[1], d[2]);
        b.part(new THREE.BoxGeometry(0.0064, len, 0.0012), P.finRay, {
          bone,
          at: [0, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2],
          dir: d,
        });
      }
    }
  }

  // ---- rose freckles along the tail sides
  const spots: [number, number][] = [
    [0.1, 55],
    [0.16, -70],
    [0.24, 85],
    [0.3, -50],
    [0.36, 65],
    [0.43, -85],
    [0.5, 50],
    [0.57, -60],
    [0.66, 75],
    [0.76, -55],
  ];
  for (const [t, ang] of spots) {
    const r = 0.0026 + R() * 0.0012;
    b.stick(new THREE.SphereGeometry(r, 6, 4), P.freckle, tube.at(t, ang), {
      embed: 0.5,
      scale: [1, 0.45, 1],
    });
  }
}
    return buildTail;
  })(),
  // limbs
  (() => {
function buildLimbs({ b, J, P }: Ctx) {
  const DEG = Math.PI / 180;
  const rand = rng(41);

  // One limb: the tapered arm/leg sweep, joint caps, a flat palm paddle, and four fanned digits.
  const makeLimb = (
    side: "L" | "R",
    kind: "arm" | "leg",
  ) => {
    const s = side === "L" ? 1 : -1;
    const big = kind === "arm" ? 1 : 0.9; // front limbs slightly bigger
    const names =
      kind === "arm"
        ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
        : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const [root, mid, end] = names.map((n) => J[n]);
    const digitName = kind === "arm" ? "finger" : "toe";

    // Limb tube: fat taper, smooth skin across the three joints.
    const path = catmull([root.at.clone(), mid.at.clone(), end.at.clone()]);
    const tube = b.sweep(path, [0.016 * big, 0.0145 * big, 0.011 * big], {
      color: P.skin,
      bone: [root, mid, end],
      sides: 8,
      caps: "round",
    });

    // Rounded joint caps: shoulder/hip where it meets the body, plus a knuckly elbow/knee.
    b.part(new THREE.SphereGeometry(0.0195 * big, 8, 6), P.skin, { bone: root, at: root.at });
    b.part(new THREE.SphereGeometry(0.0148 * big, 8, 6), P.skin, { bone: mid, at: mid.at });

    // Freckles on the upper limb.
    [
      [0.22, 15],
      [0.4, -28],
    ].forEach(([t, ang]) => {
      const hit = tube.at(t, ang);
      b.stick(new THREE.SphereGeometry(0.0028, 5, 4), P.freckle, hit, { embed: 0.5 });
    });

    // Palm / sole paddle on the floor.
    const base = new THREE.Vector3(s * 0.45, 0, 1).normalize();
    const wristAt = end.at.clone();
    const palmAt = wristAt.clone().addScaledVector(base, 0.008 * big);
    palmAt.y = 0.0045;
    b.part(new THREE.CylinderGeometry(0.02 * big, 0.021 * big, 0.009, 10), P.skin, {
      bone: end,
      at: palmAt,
      scale: [1, 1, 0.9],
    });
    // Rosy pad on top of the palm's centre.
    b.part(new THREE.CylinderGeometry(0.009 * big, 0.01 * big, 0.002, 7), P.toePad, {
      bone: end,
      at: [palmAt.x, 0.0095, palmAt.z],
    });

    // Digits, fanned about 70 degrees, inner to outer.
    const fan = [-35, -12, 12, 35];
    const lens = [0.026, 0.032, 0.032, 0.026];
    fan.forEach((k, i) => {
      const th = s * k * DEG;
      const c = Math.cos(th);
      const sn = Math.sin(th);
      const dir = new THREE.Vector3(base.x * c + base.z * sn, 0, -base.x * sn + base.z * c).normalize();
      const len = lens[i] * big;
      const start = new THREE.Vector3(wristAt.x, 0.0078, wristAt.z).addScaledVector(dir, 0.01);
      const tip = start.clone().addScaledVector(dir, len);
      const joint = b.joint(`${digitName}${side}${i + 1}`, {
        parent: end,
        at: start,
        dir: dir.clone(),
        role: "digit",
        group: "limbs",
      });
      b.capsule(start, tip, [0.0062 * big, 0.0052 * big], P.skin, { bone: joint, sides: 6 });
      // Fat rounded toe tip.
      const tipC = tip.clone().addScaledVector(dir, 0.002);
      tipC.y = 0.0078;
      b.part(new THREE.SphereGeometry(0.0076 * big, 8, 6), P.toe, { bone: joint, at: tipC });
      // Darker pad on the underside of the tip.
      b.part(new THREE.CylinderGeometry(0.0042 * big, 0.0042 * big, 0.002, 6), P.toePad, {
        bone: joint,
        at: [tipC.x, 0.0014, tipC.z],
      });
      // Tiny highlight bump on top of the tip.
      const jitter = 0.0005 * rand();
      b.part(new THREE.SphereGeometry(0.0026 * big, 5, 4), P.toe, {
        bone: joint,
        at: [tipC.x, 0.0136 + jitter, tipC.z],
      });
    });
  };

  makeLimb("L", "arm");
  makeLimb("R", "arm");
  makeLimb("L", "leg");
  makeLimb("R", "leg");
}
    return buildLimbs;
  })(),
  // gills
  (() => {
function buildGills({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const Z = new THREE.Vector3(0, 0, 1);

  type PlumeSpec = {
    key: "Top" | "Mid" | "Low";
    tipOff: [number, number, number]; // from joint 2, x is mirrored per side
    termLen: number;
    fil: number; // base filament length
  };
  const plumes: PlumeSpec[] = [
    { key: "Top", tipOff: [0.022, 0.03, -0.02], termLen: 0.027, fil: 0.046 },
    { key: "Mid", tipOff: [0.025, 0.01, -0.02], termLen: 0.027, fil: 0.05 },
    { key: "Low", tipOff: [0.028, -0.004, -0.02], termLen: 0.026, fil: 0.044 },
  ];

  // One tapered filament with a tip bulb, seated on a stalk point.
  const filament = (
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    bone: any,
    baseColor: string,
    r0: number,
  ) => {
    const d = dir.clone().normalize();
    const mid = origin.clone().addScaledVector(d, len * 0.55);
    const tip = origin
      .clone()
      .addScaledVector(d, len)
      .add(new THREE.Vector3(0, len * 0.3, -len * 0.14));
    b.sweep(bezier(origin, mid, tip), [r0, r0 * 0.38], {
      bone,
      color: baseColor,
      caps: "round",
      sides: 5,
    });
    b.part(new THREE.SphereGeometry(r0 * 1.15, 6, 4), P.gillTip, { bone, at: tip });
  };

  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    for (const pl of plumes) {
      const j1 = J[`gill${pl.key}${side}1`];
      const j2 = J[`gill${pl.key}${side}2`];
      const rootM = M[`gill${pl.key}Root${side}`];
      const root = new THREE.Vector3(rootM[0], rootM[1], rootM[2]);
      const mid = new THREE.Vector3().copy(j2.at);
      const tip = mid.clone().add(new THREE.Vector3(pl.tipOff[0] * s, pl.tipOff[1], pl.tipOff[2]));

      const path = catmull([root, mid, tip]);
      const tJ = path.closestT(mid);

      // Stalk and collar
      b.sweep(path, [0.009, 0.004], {
        bone: [j1, j2],
        color: P.gillStalk,
        sides: 6,
        caps: "round",
      });
      b.part(new THREE.SphereGeometry(0.0125, 8, 6), P.gillRoot, {
        bone: j1,
        at: root,
        scale: [1, 1, 0.9],
      });

      // Two rows of filaments along the stalk
      const stations = 6;
      for (let i = 0; i < stations; i++) {
        const t = 0.16 + (0.74 * i) / (stations - 1);
        const p = path.at(t) as THREE.Vector3;
        const T = (path.tangentAt(t) as THREE.Vector3).clone().normalize();
        const N = new THREE.Vector3().crossVectors(Z, T).normalize();
        const bone = t < tJ ? j1 : j2;
        const shape = Math.sin(Math.PI * Math.min(1, 0.25 + t * 0.85));
        for (const k of [1, -1]) {
          const a = ((k === 1 ? 44 : 56) + rand() * 8) * (Math.PI / 180);
          const dir = T.clone()
            .multiplyScalar(Math.cos(a))
            .addScaledVector(N, k * Math.sin(a));
          dir.z += k === 1 ? 0.28 : -0.38;
          dir.z -= 0.08;
          const len = pl.fil * (0.55 + 0.45 * shape) * (0.92 + rand() * 0.16);
          const base = i < 2 ? P.gillRoot : P.gillMid;
          filament(p, dir, len, bone, base, 0.0046 - i * 0.00015);
        }
      }

      // Terminal bunch of three
      const Tend = (path.tangentAt(1) as THREE.Vector3).clone().normalize();
      const Nend = new THREE.Vector3().crossVectors(Z, Tend).normalize();
      for (const k of [-1, 0, 1]) {
        const a = k * 0.62;
        const dir = Tend.clone()
          .multiplyScalar(Math.cos(a))
          .addScaledVector(Nend, Math.sin(a));
        dir.z += k * 0.18 - 0.1;
        const start = tip.clone().addScaledVector(Tend, -0.003);
        filament(start, dir, pl.termLen * (k === 0 ? 1.1 : 0.9), j2, P.gillMid, 0.0042);
      }
    }
  }
}
    return buildGills;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "chibiAxolotl" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.05,-0.05], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.05,0], dir: [0,0,1], role: "spine" });
  J["head"] = b.joint("head", { parent: J["chest"], at: [0,0.06,0.07], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.03,0.07], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.05,-0.075], dir: [0,0,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.048,-0.115], dir: [0,0,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.045,-0.16], dir: [0,0,-1], role: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,0.04,-0.205], dir: [0,0,-1], role: "tail" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.045,0.045,0.04], dir: [1,-0.4,0.25], role: "arm", group: "limbs" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.085,0.03,0.05], dir: [1,-0.6,0.8], role: "arm", group: "limbs" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.115,0.012,0.075], dir: [0.5,-0.1,1], role: "arm", group: "limbs" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.045,0.045,0.04], dir: [-1,-0.4,0.25], role: "arm", group: "limbs" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.085,0.03,0.05], dir: [-1,-0.6,0.8], role: "arm", group: "limbs" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.115,0.012,0.075], dir: [-0.5,-0.1,1], role: "arm", group: "limbs" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.045,0.042,-0.06], dir: [1,-0.3,-0.5], role: "leg", group: "limbs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.09,0.03,-0.085], dir: [1,-0.6,0.8], role: "leg", group: "limbs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.12,0.012,-0.06], dir: [0.5,-0.1,1], role: "leg", group: "limbs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.045,0.042,-0.06], dir: [-1,-0.3,-0.5], role: "leg", group: "limbs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.09,0.03,-0.085], dir: [-1,-0.6,0.8], role: "leg", group: "limbs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.12,0.012,-0.06], dir: [-0.5,-0.1,1], role: "leg", group: "limbs" });
  J["gillTopL1"] = b.joint("gillTopL1", { parent: J["head"], at: [0.05,0.085,0.04], dir: [0.7,1,-0.5], role: "fan", group: "gills" });
  J["gillTopL2"] = b.joint("gillTopL2", { parent: J["gillTopL1"], at: [0.075,0.12,0.02], dir: [0.6,1,-0.4], role: "fan", group: "gills" });
  J["gillMidL1"] = b.joint("gillMidL1", { parent: J["head"], at: [0.065,0.065,0.04], dir: [1,0.4,-0.4], role: "fan", group: "gills" });
  J["gillMidL2"] = b.joint("gillMidL2", { parent: J["gillMidL1"], at: [0.115,0.085,0.02], dir: [1,0.3,-0.3], role: "fan", group: "gills" });
  J["gillLowL1"] = b.joint("gillLowL1", { parent: J["head"], at: [0.06,0.045,0.04], dir: [1,-0.1,-0.4], role: "fan", group: "gills" });
  J["gillLowL2"] = b.joint("gillLowL2", { parent: J["gillLowL1"], at: [0.105,0.04,0.02], dir: [1,-0.2,-0.3], role: "fan", group: "gills" });
  J["gillTopR1"] = b.joint("gillTopR1", { parent: J["head"], at: [-0.05,0.085,0.04], dir: [-0.7,1,-0.5], role: "fan", group: "gills" });
  J["gillTopR2"] = b.joint("gillTopR2", { parent: J["gillTopR1"], at: [-0.075,0.12,0.02], dir: [-0.6,1,-0.4], role: "fan", group: "gills" });
  J["gillMidR1"] = b.joint("gillMidR1", { parent: J["head"], at: [-0.065,0.065,0.04], dir: [-1,0.4,-0.4], role: "fan", group: "gills" });
  J["gillMidR2"] = b.joint("gillMidR2", { parent: J["gillMidR1"], at: [-0.115,0.085,0.02], dir: [-1,0.3,-0.3], role: "fan", group: "gills" });
  J["gillLowR1"] = b.joint("gillLowR1", { parent: J["head"], at: [-0.06,0.045,0.04], dir: [-1,-0.1,-0.4], role: "fan", group: "gills" });
  J["gillLowR2"] = b.joint("gillLowR2", { parent: J["gillLowR1"], at: [-0.105,0.04,0.02], dir: [-1,-0.2,-0.3], role: "fan", group: "gills" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
