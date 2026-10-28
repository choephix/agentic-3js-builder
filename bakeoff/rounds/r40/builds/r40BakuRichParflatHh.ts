import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull, spiral, bezier, line, aim } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Baku, the Dream-Eating Spirit",
  "description": "A stylized ukiyo-e woodblock baku: a tapir-bodied spirit in indigo and cream with an elephant trunk, ivory tusks, tiger paws, an ox tail and a flame mane, shown in a neutral rig-ready rest pose."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  indigo: "#1f3a68",
  indigoDeep: "#142748",
  indigoLight: "#3f67a0",
  paper: "#f1e3bf",
  paperShadow: "#d9c394",
  vermilion: "#d9421f",
  vermilionDeep: "#a82a14",
  gold: "#e0a732",
  sumi: "#16131a",
  sumiSoft: "#3a3640",
  teal: "#3f7a6e",
  waveWhite: "#eef3ee",
  sakura: "#e79aa6",
  ivory: "#f4ead0",
  straw: "#c8a560",
  brass: "#c9962e",
  dreamPurple: "#7b5aa6",
  dreamPale: "#cfc2ec",
  moon: "#f6dd7a",
  eyeWhite: "#fbf6e6",
  shideWhite: "#fffdf5",
};
const M = {
  hips: [0, 0.88, -0.5] as [number, number, number],
  chestCenter: [0, 0.95, 0.3] as [number, number, number],
  neckBase: [0, 1.02, 0.58] as [number, number, number],
  headSocket: [0, 1.22, 0.92] as [number, number, number],
  jawHinge: [0, 1.1, 0.98] as [number, number, number],
  foreheadCrest: [0, 1.45, 0.95] as [number, number, number],
  trunkRoot: [0, 1.2, 1.2] as [number, number, number],
  trunkTip: [0, 0.72, 1.62] as [number, number, number],
  tuskRootL: [0.1, 1.08, 1.18] as [number, number, number],
  tuskRootR: [-0.1, 1.08, 1.18] as [number, number, number],
  eyeL: [0.17, 1.3, 1.03] as [number, number, number],
  eyeR: [-0.17, 1.3, 1.03] as [number, number, number],
  earRootL: [0.17, 1.42, 0.88] as [number, number, number],
  earRootR: [-0.17, 1.42, 0.88] as [number, number, number],
  shoulderL: [0.27, 0.82, 0.4] as [number, number, number],
  shoulderR: [-0.27, 0.82, 0.4] as [number, number, number],
  haunchL: [0.27, 0.84, -0.5] as [number, number, number],
  haunchR: [-0.27, 0.84, -0.5] as [number, number, number],
  pawFL: [0.28, 0.08, 0.5] as [number, number, number],
  pawFR: [-0.28, 0.08, 0.5] as [number, number, number],
  pawHL: [0.28, 0.08, -0.5] as [number, number, number],
  pawHR: [-0.28, 0.08, -0.5] as [number, number, number],
  tailRoot: [0, 0.95, -0.82] as [number, number, number],
  tailTuft: [0, 0.98, -1.4] as [number, number, number],
  spineLineStart: [0, 1.4, 0.95] as [number, number, number],
  spineLineEnd: [0, 1.2, -0.75] as [number, number, number],
  collarRing: [0, 1.04, 0.62] as [number, number, number],
  dreamCloudBase: [0.2, 0.95, 1.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torsoCoat
  (() => {
function buildTorsoCoat({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const ALONG = new THREE.Vector3(0, 0, 1);

  // ---------------------------------------------------------------- body loft
  type St = { at: [number, number, number]; w: number; h: number };
  const stations: St[] = [
    { at: [0, 0.86, -0.85], w: 0.5, h: 0.5 },
    { at: [0, 0.87, -0.6], w: 0.6, h: 0.6 },
    { at: [0, 0.88, -0.3], w: 0.72, h: 0.68 },
    { at: [0, 0.88, 0.0], w: 0.78, h: 0.72 },
    { at: [0, 0.9, 0.25], w: 0.78, h: 0.72 },
    { at: [0, 0.93, 0.5], w: 0.68, h: 0.68 },
    { at: [0, 0.99, 0.66], w: 0.5, h: 0.52 },
  ];
  const spinePath = catmull(stations.map((s) => s.at));
  const tOf = (z: number) => spinePath.closestT([0, 0.88, z]);
  const tA = tOf(-0.3);
  const tB = tOf(0.2);

  const body = b.loft(stations, {
    bone: [J.hips, J.spine1, J.chest],
    color: P.indigo,
    sectors: [
      [-95, 95, P.paper, tA, tB],
      [95, 125, P.indigoDeep],
      [-125, -95, P.indigoDeep],
      [125, 235, P.paperShadow],
    ],
  });
  const skin = b.surface(body);

  // ---------------------------------------------------------------- neck
  const neckPath = catmull([
    [0, 0.99, 0.5],
    V(M.neckBase).toArray() as [number, number, number],
    [0, 1.12, 0.76],
    V(M.headSocket).toArray() as [number, number, number],
  ]);
  const neck = b.sweep(neckPath, [0.24, 0.2], {
    bone: [J.chest, J.neck1, J.neck2],
    color: P.indigo,
    sectors: [[100, 260, P.indigoDeep]],
  });
  const nSkin = b.surface(neck);

  // ---------------------------------------------------------------- batching of small seated parts
  type Group = { color: string; bone: any; geos: THREE.BufferGeometry[] };
  const groups = new Map<string, Group>();
  const boneFor = (z: number) => (z < -0.3 ? J.hips : z < 0.1 ? J.spine1 : z < 0.44 ? J.chest : J.neck1);
  const axes = (n: THREE.Vector3, along: THREE.Vector3) => {
    const y = n.clone().normalize();
    let z = along.clone().addScaledVector(y, -along.dot(y));
    if (z.lengthSq() < 1e-6) z = new THREE.Vector3(0, 0, 1).addScaledVector(y, -y.z);
    if (z.lengthSq() < 1e-6) z = new THREE.Vector3(1, 0, 0);
    z.normalize();
    const x = new THREE.Vector3().crossVectors(y, z);
    return { x, y, z };
  };
  const stamp = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, n: THREE.Vector3, along: THREE.Vector3) => {
    const a = axes(n, along);
    const m = new THREE.Matrix4().makeBasis(a.x, a.y, a.z).setPosition(at);
    geo.applyMatrix4(m);
    const bone = boneFor(at.z);
    const key = color + bone.name;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { color, bone, geos: [] }));
    g.geos.push(geo);
  };
  const disc = (rad: number, top: number, sink: number, seg = 8) => {
    const h = top + sink;
    return new THREE.CylinderGeometry(rad, rad, h, seg).translate(0, h / 2 - sink, 0);
  };
  const tooth = (len: number, rad: number, flat: number, lift: number) => {
    const g = new THREE.ConeGeometry(rad, len, 4);
    g.rotateX(Math.PI / 2);
    g.scale(1, flat, 1);
    g.translate(0, lift, len / 2);
    return g;
  };
  const sideRay = (sf: any, s: number, y: number, z: number) => sf.ray([s * 1.6, y, z], [-s, 0, 0]);
  const reHit = (sf: any, p: THREE.Vector3, n: THREE.Vector3) => {
    const o = p.clone().addScaledVector(n, 0.3);
    return sf.ray(o.toArray(), n.clone().negate().toArray());
  };

  // ---------------------------------------------------------------- seigaiha wave scallops on the saddle
  const scallop = (hit: any, rad: number, rowOff: number) => {
    const layers: [string, number][] = [
      [P.sumi, 1],
      [P.teal, 0.9],
      [P.waveWhite, 0.68],
      [P.teal, 0.46],
      [P.waveWhite, 0.24],
    ];
    layers.forEach(([c, k], i) =>
      stamp(disc(rad * k, 0.002 + rowOff + i * 0.0008, 0.006), c, hit.at, hit.n, ALONG),
    );
  };
  for (const s of [1, -1]) {
    const rows = [1.04, 0.98, 0.92];
    rows.forEach((y, row) => {
      const zs = row % 2 === 0 ? [-0.25, -0.15, -0.05, 0.05, 0.15] : [-0.2, -0.1, 0.0, 0.1];
      for (const z of zs) {
        const h = sideRay(skin, s, y, z);
        if (h) scallop(h, 0.045, row * 0.0035);
      }
    });
  }

  // ---------------------------------------------------------------- kumo roundels (shoulder + haunch)
  const roundel = (hit: any, rad: number) => {
    const a = axes(hit.n, ALONG);
    stamp(disc(rad, 0.004, 0.006, 10), P.sumi, hit.at, hit.n, ALONG);
    stamp(disc(rad * 0.9, 0.0058, 0.006, 10), P.vermilion, hit.at, hit.n, ALONG);
    stamp(disc(rad * 0.78, 0.0076, 0.006, 10), P.gold, hit.at, hit.n, ALONG);
    stamp(disc(rad * 0.7, 0.0094, 0.006, 10), P.vermilion, hit.at, hit.n, ALONG);
    for (let arm = 0; arm < 2; arm++)
      for (let k = 0; k < 7; k++) {
        const ang = arm * Math.PI + k * 0.62;
        const rr = rad * (0.22 + 0.065 * k);
        const p = hit.at
          .clone()
          .addScaledVector(a.x, Math.cos(ang) * rr)
          .addScaledVector(a.z, Math.sin(ang) * rr);
        const h2 = reHit(skin, p, hit.n) ?? hit;
        stamp(disc(rad * 0.1, 0.0112, 0.006, 6), P.paper, h2.at, h2.n, ALONG);
      }
    stamp(disc(rad * 0.17, 0.0125, 0.006, 8), P.gold, hit.at, hit.n, ALONG);
  };
  for (const s of [1, -1]) {
    for (const [z, y] of [
      [0.4, 0.99],
      [-0.55, 0.97],
    ]) {
      const h = sideRay(skin, s, y, z);
      if (h) roundel(h, 0.082);
    }
  }

  // ---------------------------------------------------------------- indigoLight highlight patches
  const patch = (hit: any, along: THREE.Vector3, len = 2.4) => {
    const g = disc(0.03, 0.004, 0.006, 6);
    g.scale(1, 1, len);
    stamp(g, P.indigoLight, hit.at, hit.n, along);
  };
  for (const s of [1, -1]) {
    for (const [y, z] of [
      [1.12, 0.3],
      [1.15, 0.48],
      [1.1, -0.58],
    ]) {
      const h = sideRay(skin, s, y, z);
      if (h) patch(h, ALONG);
    }
    for (const z of [-0.7, -0.52, 0.38, 0.5]) {
      const h = skin.ray([s * 0.15, 2, z], [0, -1, 0]);
      if (h) patch(h, ALONG, 2);
    }
    // neck highlights
    for (const t of [0.35, 0.6, 0.85]) {
      const sp = neck.at(t, -s * 55);
      patch(sp, sp.tangent, 1.6);
    }
  }

  // ---------------------------------------------------------------- zigzag fur-edge teeth along saddle lower edge
  for (const d of [1, -1]) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = tA + ((tB - tA) * (i + 0.5)) / n;
      const sp = body.at(t, d * 92);
      const down = new THREE.Vector3(0, -1, 0);
      stamp(tooth(0.085, 0.038, 0.18, -0.005), P.sumi, sp.at.clone(), sp.n, down);
      stamp(tooth(0.075, 0.032, 0.3, -0.003), P.paper, sp.at.clone(), sp.n, down);
    }
  }

  // ---------------------------------------------------------------- neck hair marks
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const t = 0.2 + 0.15 * i;
      const p = neckPath.at(t);
      const off = i % 2 ? 0.07 : -0.05;
      const h = sideRay(nSkin, s, p.y + off, p.z + (r() - 0.5) * 0.02);
      if (!h) continue;
      stamp(tooth(0.07, 0.012, 0.5, -0.002), P.sumiSoft, h.at, h.n, new THREE.Vector3(0, -0.25, -1));
    }
  }

  // ---------------------------------------------------------------- sumi contour lines
  const ringLine = (z: number) => {
    const lp = skin.loop(V([0, 0.88, z]), { dir: [0, 0, 1], lift: 0.004 });
    return lp.slice(0.736, 1).concat(lp.slice(0, 0.264));
  };
  b.sweep(ringLine(-0.3), 0.007, { color: P.sumi });
  b.sweep(ringLine(0.2), 0.007, { color: P.sumi });
  for (const d of [1, -1]) {
    const edge = body.line(d * 95, 0.004);
    const a = edge.closestT(body.at(tA, d * 95).at);
    const c = edge.closestT(body.at(tB, d * 95).at);
    b.sweep(edge.slice(Math.min(a, c), Math.max(a, c)), 0.006, { color: P.sumi });
    b.sweep(body.line(d * 125, 0.003), 0.005, { color: P.sumiSoft });
  }
  b.sweep(body.line(180, 0.003), 0.006, { color: P.sumi });

  // ---------------------------------------------------------------- flush merged parts
  for (const g of groups.values()) {
    const merged = mergeGeometries(g.geos);
    if (merged) b.part(merged, g.color, { bone: g.bone, at: [0, 0, 0], flat: true });
  }
}
    return buildTorsoCoat;
  })(),
  // headFace
  (() => {
function buildHeadFace({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const arr = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];
  const H = J.head;
  const JAW = J.jaw;
  const R = rng(11);
  type Pt = [number, number] | [number, number, "sharp"];

  // ---------------------------------------------------------------- skull, dome, muzzle
  const skull = b.loft(
    [
      { at: [0, 1.19, 0.8], w: 0.4, h: 0.44 },
      { at: [0, 1.215, 0.95], w: 0.4, h: 0.46 },
      { at: [0, 1.2, 1.06], w: 0.34, h: 0.4 },
      { at: [0, 1.19, 1.14], w: 0.29, h: 0.34 },
    ],
    { bone: H, color: P.indigo },
  );
  const dome = b.part(new THREE.SphereGeometry(1, 10, 7), P.indigo, {
    bone: H,
    at: [0, 1.29, 0.97],
    scale: [0.17, 0.16, 0.19],
    flat: true,
  });
  // sumi underline of the muzzle (sits under the indigo block, shows as a rim at the bottom)
  b.frustumBox([0, 1.1715, 1.05], [0, 1.1715, 1.262], [0.22, 0.255], [0.18, 0.19], { bone: H, color: P.sumi });
  const muzzle = b.frustumBox([0, 1.18, 1.04], [0, 1.18, 1.27], [0.26, 0.24], [0.22, 0.18], {
    bone: H,
    color: P.indigo,
  });
  // cream lip pad at the front-low of the muzzle
  b.frustumBox([0, 1.105, 1.1], [0, 1.105, 1.272], [0.2, 0.04], [0.19, 0.04], { bone: H, color: P.paper });
  // cream ring round trunk root, with sumi outline behind it
  const tr = M.trunkRoot;
  b.part(new THREE.TorusGeometry(0.126, 0.034, 5, 12), P.sumi, {
    bone: H,
    at: [tr[0], tr[1], 1.232],
    scale: [1, 0.92, 0.7],
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.115, 0.03, 5, 12), P.paper, {
    bone: H,
    at: [tr[0], tr[1], 1.248],
    scale: [1, 0.92, 0.7],
    flat: true,
  });

  const surf = b.surface([skull, dome, muzzle]);
  const sideHit = (s: number, y: number, z: number): any => {
    const o = V(s * 0.7, y, z + 0.5);
    const t = V(s * 0.1, y, z);
    const d = t.clone().sub(o).normalize();
    return surf.ray(o, d) ?? surf.nearest(t);
  };

  // ---------------------------------------------------------------- helpers
  const circ = (r: number, n = 10): Pt[] => {
    const out: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    return out;
  };
  const almond = (w: number, h: number): Pt[] => [
    [-w, 0.1 * h, "sharp"],
    [-0.55 * w, 0.8 * h],
    [0.25 * w, h],
    [0.7 * w, 0.55 * h],
    [w, -0.1 * h, "sharp"],
    [0.4 * w, -0.75 * h],
    [-0.4 * w, -0.8 * h],
  ];

  // a flat drawn shape seated on a surface hit; +u runs forward, +v up
  const flat = (
    outline: Pt[],
    hit: any,
    color: string,
    o: { layer?: number; th?: number; sx?: number; sy?: number; dx?: number; dy?: number; rot?: number; sm?: number } = {},
  ) => {
    const n = (hit.n as THREE.Vector3).clone().normalize();
    const ref = Math.abs(n.y) > 0.97 ? V(0, 0, -1) : V(0, 1, 0);
    const yv = ref.clone().addScaledVector(n, -ref.dot(n)).normalize();
    const xv = yv.clone().cross(n);
    if (xv.z < 0) xv.negate();
    const th = o.th ?? 0.012;
    const lift = (o.layer ?? 0) * 0.005 + 0.002;
    const p = new THREE.Vector3().copy(hit.at as THREE.Vector3).addScaledVector(n, lift);
    const rot = ((o.rot ?? 0) * Math.PI) / 180;
    const c = Math.cos(rot);
    const sn = Math.sin(rot);
    const pts = outline.map((q) => {
      const x = q[0] * (o.sx ?? 1);
      const y = q[1] * (o.sy ?? 1);
      const rx = x * c - y * sn + (o.dx ?? 0);
      const ry = x * sn + y * c + (o.dy ?? 0);
      return q.length === 3 ? ([rx, ry, "sharp"] as Pt) : ([rx, ry] as Pt);
    });
    return b.extrude(pts as any, {
      at: arr(p),
      x: arr(xv),
      y: arr(yv),
      thickness: th,
      color,
      bone: H,
      smoothing: o.sm ?? 0,
    });
  };

  // a broad flame-like blade, optional sumi outline duplicate behind it
  const leaf = (
    at: THREE.Vector3,
    dir: THREE.Vector3,
    out: THREE.Vector3,
    len: number,
    wid: number,
    color: string,
    o: { th?: number; curl?: number; outline?: string; bone?: any } = {},
  ) => {
    const x = dir.clone().normalize();
    const n = out.clone().normalize();
    n.addScaledVector(x, -n.dot(x)).normalize();
    const y = n.clone().cross(x);
    const th = o.th ?? 0.012;
    const curl = o.curl ?? 0.15;
    const make = (L: number, w: number, col: string, p: THREE.Vector3) =>
      b.extrude(
        [
          [0, -0.4 * w],
          [0.3 * L, -0.5 * w],
          [0.7 * L, -0.15 * w],
          [L, curl * L, "sharp"],
          [0.65 * L, 0.3 * w],
          [0.3 * L, 0.55 * w],
          [0, 0.4 * w],
        ] as any,
        { at: arr(p), x: arr(x), y: arr(y), thickness: th, color: col, bone: o.bone ?? H, smoothing: 1 },
      );
    if (o.outline) {
      const p = at.clone().addScaledVector(n, -0.004).addScaledVector(x, -0.01);
      make(len * 1.16, wid * 1.38, o.outline, p);
    }
    return make(len, wid, color, at.clone().addScaledVector(n, th * 0.25));
  };

  // ---------------------------------------------------------------- lower jaw
  b.frustumBox([0, 1.0, 1.0], [0, 1.0, 1.225], [0.25, 0.118], [0.17, 0.118], { bone: JAW, color: P.sumi });
  b.frustumBox([0, 1.0, 1.0], [0, 1.0, 1.225], [0.27, 0.1], [0.18, 0.1], { bone: JAW, color: P.paper });
  // vermilion mouth interior
  b.frustumBox([0, 1.055, 1.03], [0, 1.055, 1.205], [0.22, 0.02], [0.15, 0.02], { bone: JAW, color: P.vermilion });
  // small ivory teeth
  const teeth: [number, number][] = [
    [-0.06, 1.2], [-0.02, 1.215], [0.02, 1.215], [0.06, 1.2],
    [-0.1, 1.09], [0.1, 1.09], [-0.105, 1.14], [0.105, 1.14],
  ];
  for (const [x, z] of teeth)
    b.spike([x, 1.048, z], [0, 1, 0], 0.036, 0.013, { color: P.ivory, bone: JAW, sides: 5 });
  // chin tufts
  for (let i = 0; i < 3; i++) {
    leaf(V(0, 0.955, 1.07 + i * 0.055), V(0, -0.45, -0.9), V(1, 0, 0), 0.085 - i * 0.012, 0.045, P.paper, {
      outline: P.sumi,
      bone: JAW,
      curl: 0.2,
    });
  }

  // ---------------------------------------------------------------- eyes, brows
  for (const s of [1, -1]) {
    const eyeM = s === 1 ? M.eyeL : M.eyeR;
    const e = sideHit(s, eyeM[1], eyeM[2]);
    // vermilion corner accent (kumadori) behind the eye
    flat([[0.02, 0.012], [-0.04, 0.034], [-0.11, 0.018, "sharp"], [-0.04, -0.006]], e, P.vermilion, {
      layer: 0,
      dx: -0.07,
      dy: 0.005,
      rot: -10,
    });
    flat(almond(0.094, 0.072), e, P.sumi, { layer: 0, rot: -10, sm: 1 });
    flat(almond(0.08, 0.058), e, P.eyeWhite, { layer: 1, rot: -10, sm: 1 });
    flat(circ(0.043), e, P.gold, { layer: 2, dx: 0.012 });
    flat(circ(0.024), e, P.sumi, { layer: 3, dx: 0.016 });
    flat(circ(0.009, 8), e, P.eyeWhite, { layer: 4, dx: 0.008, dy: 0.014 });

    // heavy sumi brow bar
    const bh = sideHit(s, eyeM[1] + 0.082, eyeM[2] - 0.02);
    flat([[-0.1, 0.012, "sharp"], [-0.09, 0.047, "sharp"], [0.095, 0.002, "sharp"], [0.09, -0.024, "sharp"]], bh, P.sumi, {
      layer: 0,
      th: 0.016,
    });
    // indigoLight brow ridge highlight
    const bh2 = sideHit(s, eyeM[1] + 0.118, eyeM[2] - 0.03);
    flat(circ(1, 8), bh2, P.indigoLight, { layer: 0, sx: 0.07, sy: 0.014, rot: -8 });
    // vermilion brow tufts
    for (let i = 0; i < 3; i++) {
      const th = sideHit(s, eyeM[1] + 0.105, 0.93 + i * 0.065);
      leaf(
        new THREE.Vector3().copy(th.at),
        V(s * (0.2 + i * 0.05), 0.75 - i * 0.1, -0.5 + i * 0.05),
        th.n,
        0.1 - i * 0.012,
        0.04,
        P.vermilion,
        { outline: P.sumi, curl: 0.2 },
      );
    }
  }

  // ---------------------------------------------------------------- forehead roundel with tomoe
  const fh = surf.ray(V(0, 1.8, 1.5), V(0, -0.43, -0.43).normalize()) ?? surf.nearest(V(0, 1.4, 1.08));
  flat(circ(0.076, 14), fh, P.sumi, { layer: 0 });
  flat(circ(0.067, 14), fh, P.gold, { layer: 1 });
  flat(circ(0.054, 14), fh, P.indigoDeep, { layer: 2 });
  const tomoe: Pt[] = [
    [-0.03, 0.07, "sharp"], [-0.005, 0.048], [0.014, 0.024], [0.03, 0.0], [0.026, -0.024],
    [0.005, -0.036], [-0.02, -0.032], [-0.036, -0.012], [-0.038, 0.014], [-0.046, 0.04],
  ];
  flat(tomoe, fh, P.sumi, { layer: 2.6, sx: 0.62, sy: 0.62, dy: -0.004, sm: 1, th: 0.01 });
  flat(tomoe, fh, P.vermilion, { layer: 3.4, sx: 0.52, sy: 0.52, dy: -0.004, sm: 1, th: 0.01 });
  flat(circ(0.007, 6), fh, P.gold, { layer: 4.6, dx: -0.006, dy: -0.01 });

  // nose-bridge line
  const bridge: THREE.Vector3[] = [];
  for (const z of [1.17, 1.2, 1.23, 1.26]) {
    const h = surf.ray(V(0, 2, z), V(0, -1, 0));
    if (h) bridge.push(new THREE.Vector3().copy(h.at).addScaledVector(h.n, 0.003));
  }
  if (bridge.length >= 3)
    b.sweep(bridge.map(arr), 0.007, { color: P.sumi, bone: H, sides: 4, caps: "flat" });

  // ---------------------------------------------------------------- ears
  for (const s of [1, -1]) {
    const ear = s === 1 ? J.earL : J.earR;
    const c = V(s * 0.19, 1.47, 0.875);
    const ax = V(s * 0.75, 0.2, 0.5).normalize();
    const disc = (r: number, h: number, color: string, k: number) =>
      b.part(new THREE.CylinderGeometry(r, r, h, 12), color, {
        bone: ear,
        at: arr(c.clone().addScaledVector(ax, k)),
        dir: arr(ax),
        flat: true,
      });
    b.capsule([s * 0.14, 1.34, 0.9], arr(c.clone().addScaledVector(V(0, -0.02, 0), 1)), 0.045, {
      color: P.indigo,
      bone: ear,
    });
    disc(0.1, 0.02, P.indigo, -0.013); // back
    disc(0.125, 0.024, P.sumi, 0); // outline
    disc(0.11, 0.028, P.paper, 0.004); // rim
    disc(0.095, 0.03, P.indigo, 0.012); // body
    disc(0.055, 0.03, P.vermilion, 0.02); // inner
    disc(0.022, 0.03, P.vermilionDeep, 0.026);
  }

  // ---------------------------------------------------------------- tusks (sumi outline shifted behind)
  for (const s of [1, -1]) {
    const pts = [V(s * 0.1, 1.1, 1.19), V(s * 0.13, 1.0, 1.33), V(s * 0.2, 0.98, 1.36), V(s * 0.215, 0.92, 1.31)];
    b.sweep(
      pts.map((p) => arr(p.clone().add(V(s * 0.008, -0.004, -0.018)))),
      [0.047, 0.014],
      { color: P.sumi, bone: H, sides: 6, caps: { start: "flat", end: "point" } },
    );
    b.sweep(pts.map(arr), [0.036, 0.006], {
      color: P.ivory,
      bone: H,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    // gold band near the root
    b.part(new THREE.TorusGeometry(0.036, 0.007, 4, 8), P.gold, {
      bone: H,
      at: [s * 0.112, 1.075, 1.225],
      dir: [s * 0.4, -0.5, 0.75],
      axis: "z",
      flat: true,
    });
  }

  // ---------------------------------------------------------------- cheek ruffs
  for (const s of [1, -1]) {
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 5; i++) {
        const h = sideHit(s, 1.17 - r * 0.075, 0.92 + i * 0.05 + r * 0.02);
        const dir = V(s * 0.1, -0.28 - r * 0.1 + (i - 2) * 0.06, -1);
        leaf(
          new THREE.Vector3().copy(h.at),
          dir,
          h.n,
          0.13 - r * 0.02 + i * 0.005 + R() * 0.01,
          0.05,
          r === 0 ? P.paper : P.paperShadow,
          { outline: P.sumi, curl: 0.12 },
        );
      }
    }
  }

  // ---------------------------------------------------------------- whiskers and pores
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const y0 = 1.1 + i * 0.03;
      const k = i - 1.5;
      const p0 = V(s * 0.12, y0, 1.17);
      const p1 = V(s * 0.28, y0 + 0.04 + i * 0.02, 1.12);
      const p2 = V(s * 0.4, y0 + k * 0.05, 1.0);
      const p3 = V(s * 0.44, y0 - 0.05 + k * 0.09, 0.82);
      b.sweep([p0, p1, p2, p3].map(arr).length ? (undefined as any) ?? bezierPts(p0, p1, p2, p3) : [], [0.007, 0.002], {
        color: i % 2 ? P.sumi : P.paper,
        bone: H,
        sides: 4,
        caps: "point",
      });
      const dot = surf.ray(V(s * 0.5, y0, 1.17), V(-s, 0, 0));
      if (dot) b.stick(new THREE.SphereGeometry(0.013, 6, 4), P.sumi, dot, { embed: 0.4 });
    }
  }

  // ---------------------------------------------------------------- indigoLight muzzle highlights
  for (const s of [1, -1]) {
    const mh = surf.ray(V(s * 0.35, 1.5, 1.2), V(-s * 0.35, -0.23, 0).normalize());
    if (mh) flat(circ(1, 8), mh, P.indigoLight, { layer: 0, sx: 0.06, sy: 0.016, rot: 8 });
  }

  // cubic bezier sampled to points (whiskers)
  function bezierPts(a: THREE.Vector3, c1: THREE.Vector3, c2: THREE.Vector3, d: THREE.Vector3) {
    const out: number[][] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const u = 1 - t;
      const p = a
        .clone()
        .multiplyScalar(u * u * u)
        .addScaledVector(c1, 3 * u * u * t)
        .addScaledVector(c2, 3 * u * t * t)
        .addScaledVector(d, t * t * t);
      out.push(arr(p));
    }
    return out;
  }
}
    return buildHeadFace;
  })(),
  // trunkDream
  (() => {
function buildTrunkDream({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- the trunk
  const pts: number[][] = [M.trunkRoot, [0, 1.14, 1.38], [0, 1.0, 1.52], [0, 0.86, 1.58], M.trunkTip];
  const path = catmull(pts);
  const KEYS = [0.1, 0.093, 0.082, 0.072, 0.065];
  const rAt = (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (KEYS.length - 1);
    const i = Math.min(Math.floor(x), KEYS.length - 2);
    return KEYS[i] + (KEYS[i + 1] - KEYS[i]) * (x - i);
  };
  const bones = [J.trunk1, J.trunk2, J.trunk3, J.trunk4];
  const knotT = [J.trunk2, J.trunk3, J.trunk4].map((j: any) => path.closestT(j.at));
  const jointFor = (t: number) => (t < knotT[0] ? J.trunk1 : t < knotT[1] ? J.trunk2 : t < knotT[2] ? J.trunk3 : J.trunk4);

  const trunk = b.sweep(path, KEYS, {
    bone: bones,
    color: P.indigo,
    bands: [
      [0.9, P.indigo],
      [1, P.paper],
    ],
    sectors: [
      [-16, 16, P.indigoLight, 0.05, 0.88],
      [125, 235, P.indigoDeep, 0, 0.88],
    ],
    sides: 12,
    smooth: false,
    caps: "round",
  });

  // a closed ring round the trunk at path fraction t; `out` is the ring centre's lift above the skin
  const ring = (t: number, rad: number, color: string, out: number) => {
    const tt = Math.min(Math.max(t, 0.01), 0.99);
    const c = path.at(tt);
    const T = path.tangentAt(tt).clone().normalize();
    const u = V(1, 0, 0);
    const v = new THREE.Vector3().crossVectors(T, u).normalize();
    const R = rAt(tt) * 1.02 + out;
    const ps: THREE.Vector3[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ps.push(c.clone().addScaledVector(u, Math.cos(a) * R).addScaledVector(v, Math.sin(a) * R));
    }
    return b.sweep(catmull(ps, { closed: true }), rad, { color, sides: 6, smooth: false, bone: jointFor(tt) });
  };

  // wave-ring bands: sumi flanks, paper body, teal crest
  for (const t of [0.2, 0.4, 0.6, 0.78]) {
    ring(t - 0.03, 0.005, P.sumi, 0.004);
    ring(t + 0.03, 0.005, P.sumi, 0.004);
    ring(t, 0.011, P.paper, 0.006);
    ring(t, 0.004, P.teal, 0.0165);
  }
  // paper tip seams
  ring(0.9, 0.006, P.sumi, 0.004);
  ring(0.95, 0.005, P.paperShadow, 0.003);

  // gold collar at the root, vermilion studs
  ring(0.07, 0.016, P.gold, 0.008);
  ring(0.07 - 0.045, 0.006, P.sumi, 0.004);
  ring(0.07 + 0.045, 0.006, P.sumi, 0.004);
  {
    const t = 0.07;
    const c = path.at(t);
    const T = path.tangentAt(t).clone().normalize();
    const u = V(1, 0, 0);
    const v = new THREE.Vector3().crossVectors(T, u).normalize();
    const R = rAt(t) * 1.02 + 0.024;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = c.clone().addScaledVector(u, Math.cos(a) * R).addScaledVector(v, Math.sin(a) * R);
      b.part(new THREE.OctahedronGeometry(0.011, 0), P.vermilion, { at: p, bone: J.trunk1 });
    }
  }

  // mini seigaiha scallops on both flanks between the bands
  for (const t of [0.3, 0.5, 0.69]) {
    for (const deg of [90, -90]) {
      const hit = trunk.at(t, deg);
      const stack: [number, string][] = [
        [0.027, P.sumi],
        [0.024, P.waveWhite],
        [0.0185, P.teal],
        [0.0125, P.waveWhite],
        [0.006, P.teal],
      ];
      stack.forEach(([r, col], i) => {
        b.stick(new THREE.CylinderGeometry(r, r, 0.010 + 0.002 * i, 10), col, hit, { embed: 0.5 });
      });
    }
  }

  // nostril dots on the paper tip
  const surf = b.surface(trunk);
  const end = path.at(1);
  const Tend = path.tangentAt(1).clone().normalize();
  for (const s of [1, -1]) {
    const probe = end.clone().addScaledVector(Tend, 0.05).add(V(s * 0.027, 0, 0.02));
    const hit = surf.nearest(probe);
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.sumi, hit, { embed: 0.4, scale: [1, 0.55, 1.3] });
  }

  // ---------------------------------------------------------------- dream cloud
  const n = V(0.5, 0, 0.866).normalize();
  const xd = V(0.866, 0, -0.5).normalize();
  const C = V(0.27, 1.16, 1.52);
  const W = (u: number, v: number, w = 0) =>
    C.clone().addScaledVector(xd, u).add(V(0, v, 0)).addScaledVector(n, w);
  const bone = J.trunk4;
  const NEG_N = n.clone().negate();

  const puffs: [number, number, number][] = [
    [-0.12, -0.08, 0.065],
    [-0.03, -0.11, 0.075],
    [0.06, -0.095, 0.07],
    [0.13, -0.05, 0.055],
    [-0.09, 0.0, 0.07],
    [0.02, -0.01, 0.085],
    [0.11, 0.03, 0.055],
    [-0.04, 0.1, 0.075],
    [0.05, 0.13, 0.055],
  ];
  for (const [u, v, r] of puffs) {
    b.part(new THREE.CylinderGeometry(r + 0.012, r + 0.012, 0.03, 10), P.sumi, { at: W(u, v), dir: n, bone });
    b.part(new THREE.CylinderGeometry(r, r, 0.036, 10), P.dreamPale, { at: W(u, v), dir: n, bone });
  }
  // dreamPurple scroll arcs on both faces
  puffs.forEach(([u, v, r], i) => {
    if (i % 3 === 2) return;
    for (const side of [1, -1]) {
      const g = new THREE.TorusGeometry(r * 0.6, 0.006, 4, 10, Math.PI * 1.1);
      g.rotateZ((i * 1.1) % (Math.PI * 2));
      b.part(g, P.dreamPurple, { at: W(u, v, side * 0.019), dir: side > 0 ? n : NEG_N, axis: "z", bone });
    }
  });

  // curling kumo scroll at the top right
  {
    const cen = W(0.1, 0.2);
    const from = W(0.06, 0.15);
    const sp = spiral(cen, from, n, { turns: 1.0, r1: 0.026, pitch: 0 });
    b.sweep(sp, 0.015, { color: P.sumi, sides: 6, smooth: false, bone, caps: "round" });
    const cen2 = cen.clone().addScaledVector(n, 0.008);
    const from2 = from.clone().addScaledVector(n, 0.008);
    const sp2 = spiral(cen2, from2, n, { turns: 1.0, r1: 0.026, pitch: 0 });
    b.sweep(sp2, 0.009, { color: P.dreamPurple, sides: 6, smooth: false, bone, caps: "round" });
  }

  // crescent moon
  const crescent = (R: number, k = 1) => {
    const d = 0.35 * R;
    const r2 = 0.8 * R;
    const a0 = (46.4 * Math.PI) / 180;
    const b0 = (64.9 * Math.PI) / 180;
    const out: Array<[number, number] | [number, number, "sharp"]> = [];
    const N = 9;
    for (let i = 0; i <= N; i++) {
      const a = a0 + (2 * Math.PI - 2 * a0) * (i / N);
      const x = R * Math.cos(a) * k;
      const y = R * Math.sin(a) * k;
      out.push(i === 0 || i === N ? [x, y, "sharp"] : [x, y]);
    }
    const M2 = 7;
    for (let j = 1; j < M2; j++) {
      const a = 2 * Math.PI - b0 - (2 * Math.PI - 2 * b0) * (j / M2);
      out.push([(d + r2 * Math.cos(a)) * k, r2 * Math.sin(a) * k]);
    }
    return out;
  };
  const MOON_AT: [number, number] = [-0.03, -0.02];
  const xdir: [number, number, number] = [xd.x, xd.y, xd.z];
  b.extrude(crescent(0.055, 1.22), {
    at: W(MOON_AT[0] - 0.004, MOON_AT[1]),
    x: xdir,
    thickness: 0.05,
    color: P.sumi,
    bone,
  });
  glow(
    b.extrude(crescent(0.055), {
      at: W(MOON_AT[0], MOON_AT[1]),
      x: xdir,
      thickness: 0.06,
      color: P.moon,
      bone,
    }),
    1.2,
  );

  // gold four-point stars
  const star = (R: number, k = 1) => {
    const out: Array<[number, number, "sharp"]> = [];
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 4;
      const r = (i % 2 === 0 ? R : R * 0.38) * k;
      out.push([Math.cos(a) * r, Math.sin(a) * r, "sharp"]);
    }
    return out;
  };
  const stars: [number, number, number][] = [
    [0.085, -0.02, 0.028],
    [0.05, 0.12, 0.022],
    [-0.1, 0.09, 0.02],
  ];
  for (const [u, v, R] of stars) {
    b.extrude(star(R, 1.4), { at: W(u, v), x: xdir, thickness: 0.05, color: P.sumi, bone });
    glow(b.extrude(star(R), { at: W(u, v), x: xdir, thickness: 0.06, color: P.gold, bone }), 1.4);
  }

  // ---------------------------------------------------------------- vapour wisp
  const wisp = catmull([
    [0, 0.71, 1.63],
    [0.05, 0.7, 1.69],
    [0.14, 0.76, 1.66],
    [0.2, 0.85, 1.6],
    W(-0.03, -0.15, 0).toArray(),
  ]);
  b.sweep(wisp, [0.014, 0.008], { color: P.dreamPale, sides: 6, smooth: false, bone, caps: "round" });
  for (const [t, r] of [
    [0.35, 0.018],
    [0.6, 0.024],
    [0.82, 0.03],
  ] as [number, number][]) {
    const p = wisp.at(t);
    b.part(new THREE.CylinderGeometry(r + 0.007, r + 0.007, 0.018, 8), P.sumi, { at: p, dir: n, bone });
    b.part(new THREE.CylinderGeometry(r, r, 0.022, 8), P.dreamPale, { at: p, dir: n, bone });
  }
}
    return buildTrunkDream;
  })(),
  // legsPaws
  (() => {
function buildLegsPaws({ b, J, P, M }: Ctx) {
  const INDIGO = P.indigo;
  const INDIGO_DEEP = P.indigoDeep;
  const PAPER = P.paper;
  const SUMI = P.sumi;
  const TEAL = P.teal;
  const WHITE = P.waveWhite;
  const IVORY = P.ivory;
  const VERMILION = P.vermilion;
  const GOLD = P.gold;

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const pt = (j: any): [number, number, number] => [j.at.x, j.at.y, j.at.z];

  // ---------------------------------------------------------------- seigaiha wave scallop (half-disc arcs)
  const scallop = (hit: any, r: number) => {
    if (!hit) return;
    const layers: [number, string, number][] = [
      [1.0, SUMI, 0.022],
      [0.86, TEAL, 0.026],
      [0.62, WHITE, 0.03],
      [0.36, TEAL, 0.034],
    ];
    for (const [k, c, h] of layers) {
      b.stick(new THREE.CylinderGeometry(r * k, r * k, h, 8, 1, false, -Math.PI / 2, Math.PI), c, hit, {
        embed: 0.5,
        flow: [0, 1, 0],
      });
    }
  };

  // ---------------------------------------------------------------- fur cuff: paper collar, gold stitch, zigzag tufts
  const cuff = (joint: any, pawJ: any) => {
    const base = joint.moved({ up: 0.04 });
    const ring = b.ring(line(base, pawJ), { count: 8, radius: 0.088 });
    // collar body
    const collar = b.ring(line(base, pawJ), { count: 8, radius: 0.098 });
    b.sweep(catmull(collar.items.map((it: any) => [it.at.x, it.at.y, it.at.z]), { closed: true }), 0.022, {
      color: PAPER,
      bone: joint,
      sides: 6,
    });
    // gold stitch ring above
    const gold = b.ring(line(joint.moved({ up: 0.068 }), pawJ), { count: 8, radius: 0.108 });
    b.sweep(catmull(gold.items.map((it: any) => [it.at.x, it.at.y, it.at.z]), { closed: true }), 0.007, {
      color: GOLD,
      bone: joint,
      sides: 5,
    });
    // tufts, alternating long and short for the zigzag edge
    for (const it of ring.items) {
      const a = it.at.clone();
      const dir = it.axis.clone().multiplyScalar(0.32).add(V(0, -1, 0)).normalize();
      const len = it.i % 2 ? 0.085 : 0.12;
      const tip = a.clone().addScaledVector(dir, len);
      b.sweep([a, tip], [0.025, 0], {
        color: PAPER,
        bands: [
          [0.62, PAPER],
          [1, SUMI],
        ],
        bone: joint,
        sides: 5,
        caps: { start: "flat", end: "point" },
      });
    }
  };

  // ---------------------------------------------------------------- tiger paw
  const paw = (pawJ: any, pc: number[], nToes: number, toeR: number, spacing: number) => {
    const [px, , pz] = pc;
    const cz = pz - 0.01;
    // sumi outline rim, chunky pad, dome
    b.part(new THREE.CylinderGeometry(0.108, 0.128, 0.045, 10), SUMI, {
      bone: pawJ,
      at: [px, 0.0225, cz],
      scale: [1, 1, 1.2],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.095, 0.115, 0.07, 10), INDIGO_DEEP, {
      bone: pawJ,
      at: [px, 0.035, cz],
      scale: [1, 1, 1.2],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.1, 8, 5), INDIGO_DEEP, {
      bone: pawJ,
      at: [px, 0.065, cz],
      scale: [1, 0.5, 1.3],
      flat: true,
    });
    // vermilion toe-bean with sumi outline
    b.part(new THREE.SphereGeometry(0.031, 7, 4), SUMI, {
      bone: pawJ,
      at: [px, 0.094, pz + 0.072],
      scale: [1, 0.4, 0.8],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.026, 7, 4), VERMILION, {
      bone: pawJ,
      at: [px, 0.099, pz + 0.075],
      scale: [1, 0.45, 0.8],
      flat: true,
    });
    // toes: merged ivory bumps, merged sumi outlines and toe lines
    const ivory: THREE.BufferGeometry[] = [];
    const sumi: THREE.BufferGeometry[] = [];
    const toePos: [number, number][] = [];
    for (let i = 0; i < nToes; i++) {
      const xo = (i - (nToes - 1) / 2) * spacing;
      const tx = px + xo;
      const tz = pz + 0.1 - 0.6 * Math.abs(xo);
      toePos.push([tx, tz]);
      ivory.push(new THREE.SphereGeometry(toeR, 7, 5).scale(1, 0.85, 1.1).translate(tx, 0.035, tz));
      sumi.push(
        new THREE.SphereGeometry(toeR + 0.008, 7, 5).scale(1, 0.85, 1.1).translate(tx, 0.037, tz - 0.004),
      );
    }
    for (let i = 0; i < nToes - 1; i++) {
      const mx = (toePos[i][0] + toePos[i + 1][0]) / 2;
      const mz = (toePos[i][1] + toePos[i + 1][1]) / 2 + 0.02;
      sumi.push(new THREE.BoxGeometry(0.006, 0.05, 0.06).translate(mx, 0.055, mz));
    }
    const mi = mergeGeometries(ivory);
    const ms = mergeGeometries(sumi);
    if (ms) b.part(ms, SUMI, { bone: pawJ, at: [0, 0, 0], flat: true });
    if (mi) b.part(mi, IVORY, { bone: pawJ, at: [0, 0, 0], flat: true });
    // curved ivory claws
    for (const [tx, tz] of toePos) {
      b.sweep(bezier([tx, 0.04, tz + 0.03], [tx, 0.046, tz + 0.075], [tx, 0.018, tz + 0.098]), [0.013, 0], {
        color: IVORY,
        bone: pawJ,
        sides: 5,
        caps: { start: "flat", end: "point" },
      });
    }
  };

  // ---------------------------------------------------------------- legs
  for (const [S, s] of [
    ["L", 1],
    ["R", -1],
  ] as [string, number][]) {
    // ---- front leg
    {
      const sh = J["shoulderF" + S];
      const el = J["elbowF" + S];
      const wr = J["wristF" + S];
      const pw = J["pawF" + S];
      const pc = M["pawF" + S];
      const bones = [sh, el, wr, pw];
      const pts = [[sh.at.x, 0.95, sh.at.z], pt(sh), pt(el), pt(wr), [pc[0], 0.13, pc[2] - 0.04]];
      const leg = b.sweep(catmull(pts), [0.15, 0.15, 0.125, 0.098, 0.09], {
        color: INDIGO,
        bone: bones,
        sides: 8,
        smooth: false,
      });
      const skin = b.surface(leg);
      // sumi contour down the front edge
      const rough = catmull([
        [sh.at.x, 0.9, sh.at.z + 0.16],
        [sh.at.x, 0.7, sh.at.z + 0.15],
        [el.at.x, 0.5, el.at.z + 0.13],
        [wr.at.x, 0.32, wr.at.z + 0.11],
      ]);
      b.sweep(skin.drape(rough, { lift: 0.004 }), 0.006, { color: SUMI, bone: bones, sides: 4 });
      // two seigaiha scallops on the forearm
      for (const [t, off] of [
        [0.35, -25],
        [0.68, 25],
      ] as [number, number][]) {
        const c = V(
          el.at.x + (wr.at.x - el.at.x) * t,
          el.at.y + (wr.at.y - el.at.y) * t,
          el.at.z + (wr.at.z - el.at.z) * t,
        );
        scallop(skin.around(c).at(s * (90 + off), 0), 0.033);
      }
      cuff(wr, pw);
      paw(pw, pc, 4, 0.034, 0.052);
    }

    // ---- hind leg
    {
      const hip = J["hipH" + S];
      const knee = J["kneeH" + S];
      const hock = J["hockH" + S];
      const pw = J["pawH" + S];
      const pc = M["pawH" + S];
      const bones = [hip, knee, hock, pw];
      const pts = [[hip.at.x - 0.02 * s, 0.97, hip.at.z - 0.02], pt(hip), pt(knee), pt(hock), [pc[0], 0.13, pc[2] - 0.03]];
      const leg = b.sweep(catmull(pts), [0.16, 0.16, 0.13, 0.1, 0.09], {
        color: INDIGO,
        bone: bones,
        sides: 8,
        smooth: false,
      });
      const skin = b.surface(leg);
      const rough = catmull([
        [hip.at.x, 0.92, hip.at.z + 0.15],
        [hip.at.x + 0.01 * s, 0.7, -0.44 + 0.17],
        [knee.at.x, 0.54, knee.at.z + 0.15],
        [(knee.at.x + hock.at.x) / 2, 0.4, -0.5 + 0.12],
        [hock.at.x, 0.34, hock.at.z + 0.1],
      ]);
      b.sweep(skin.drape(rough, { lift: 0.004 }), 0.006, { color: SUMI, bone: bones, sides: 4 });
      // two seigaiha scallops on the thigh
      for (const [t, off] of [
        [0.3, -25],
        [0.62, 25],
      ] as [number, number][]) {
        const c = V(
          hip.at.x + (knee.at.x - hip.at.x) * t,
          hip.at.y + (knee.at.y - hip.at.y) * t,
          hip.at.z + (knee.at.z - hip.at.z) * t,
        );
        scallop(skin.around(c).at(s * (90 + off), 0), 0.036);
      }
      cuff(hock, pw);
      paw(pw, pc, 3, 0.04, 0.058);
    }
  }
}
    return buildLegsPaws;
  })(),
  // maneTailRegalia
  (() => {
function buildManeTailRegalia({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = THREE.Vector3;
  const SUMI = P.sumi;
  const STRAW = P.straw;
  const STRAW_D = "#9a7634";
  const BACK = new V(0, 0, -1);

  type Layer = { col: string; v0: number; k: number; top: number };
  type Pt = [number, number] | [number, number, "sharp"];

  // ---------------------------------------------------------------- flame blade outline
  // u runs backward (the way the flame blows), v runs up the blade. Left/right edges are single-valued in v,
  // so the polygon never crosses itself; the tip is the one sharp corner.
  const flameOutline = (L: number, w: number, S: number, wig: number, v0: number, k: number, top: number): Pt[] => {
    const cen = (v: number) => S * Math.pow(Math.max(v, 0), 1.6) + wig * Math.sin(v * 5.5) * v;
    const hw = (v: number) => Math.pow(Math.max((top - v) / top, 0), 0.75);
    const vEnd = top * 0.88;
    const n = Math.max(2, Math.round((vEnd - v0) / 0.2) + 1);
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const v = v0 + ((vEnd - v0) * i) / (n - 1);
      const c = cen(v);
      const h = hw(v) * w * k;
      left.push([c - 0.4 * h, v * L]);
      right.push([c + 0.6 * h, v * L]);
    }
    return [...left, [cen(top), top * L, "sharp"], ...right.reverse()];
  };

  // A layered blade: sumi outline behind, then colour layers root to tip, each a little narrower and proud.
  const blade = (o: {
    at: THREE.Vector3;
    y: THREE.Vector3;
    L: number;
    w: number;
    S: number;
    wig: number;
    layers: Layer[];
    sumi?: boolean;
    bone: any;
    thick?: number;
  }) => {
    const y = o.y.clone().normalize();
    const x = BACK.clone().sub(y.clone().multiplyScalar(BACK.dot(y))).normalize();
    const base = o.thick ?? 0.016;
    if (o.sumi) {
      b.extrude(flameOutline(o.L + 0.02, o.w + 0.026, o.S, o.wig, 0, 1, 1), {
        at: o.at.clone().addScaledVector(y, -0.012).toArray(),
        x: x.toArray(),
        y: y.toArray(),
        thickness: base - 0.004,
        color: SUMI,
        bone: o.bone,
      });
    }
    o.layers.forEach((ly, j) => {
      b.extrude(flameOutline(o.L, o.w, o.S, o.wig, ly.v0, ly.k, ly.top), {
        at: o.at.toArray(),
        x: x.toArray(),
        y: y.toArray(),
        thickness: base + 0.003 * j,
        color: ly.col,
        bone: o.bone,
      });
    });
  };

  const lerpTbl = (t: number[][], z: number) => {
    if (z >= t[0][0]) return t[0][1];
    for (let i = 0; i < t.length - 1; i++) {
      const a = t[i];
      const c = t[i + 1];
      if (z >= c[0]) return a[1] + (c[1] - a[1]) * ((a[0] - z) / (a[0] - c[0]));
    }
    return t[t.length - 1][1];
  };

  const boneAt = (z: number) =>
    z >= 0.88 ? J.head : z >= 0.67 ? J.neck2 : z >= 0.44 ? J.neck1 : z >= 0.1 ? J.chest : z >= -0.3 ? J.spine1 : J.hips;

  // ---------------------------------------------------------------- (1) flame mane
  const crestTbl = [
    [1.0, 1.46], [0.9, 1.44], [0.8, 1.4], [0.68, 1.355], [0.55, 1.31], [0.4, 1.28],
    [0.2, 1.265], [0, 1.25], [-0.3, 1.235], [-0.55, 1.2], [-0.8, 1.14],
  ];
  const heightTbl = [
    [1.0, 0.17], [0.9, 0.2], [0.75, 0.25], [0.55, 0.28], [0.35, 0.27], [0.15, 0.2],
    [-0.2, 0.17], [-0.5, 0.15], [-0.8, 0.12],
  ];
  const crestY = (z: number) => lerpTbl(crestTbl, z);

  // solid crest ridge, one capsule per bone
  const ridgeZ = [0.98, 0.88, 0.67, 0.44, 0.1, -0.3, -0.8];
  const ridgeR = [0.035, 0.045, 0.045, 0.04, 0.035, 0.03, 0.025];
  for (let i = 0; i < ridgeZ.length - 1; i++) {
    const za = ridgeZ[i];
    const zb = ridgeZ[i + 1];
    b.capsule([0, crestY(za) - 0.012, za], [0, crestY(zb) - 0.012, zb], [ridgeR[i], ridgeR[i + 1]], {
      color: P.indigoDeep,
      bone: boneAt((za + zb) / 2),
    });
  }

  const N = 32;
  const NLARGE = 12;
  const medTips = [P.vermilion, P.gold, P.vermilion, P.paper];
  for (let i = 0; i < N; i++) {
    const z = 0.98 - (i * 1.76) / (N - 1);
    const side = i % 2 ? 1 : -1;
    const large = i < NLARGE;
    const L = lerpTbl(heightTbl, z) * (0.92 + 0.16 * R());
    const tilt = z > 0.3 ? 0.65 : 0.9;
    const at = new V(side * 0.014, crestY(z) - 0.025, z);
    const y = new V(side * 0.22, 1, -tilt);
    const layers: Layer[] = large
      ? [
          { col: P.indigo, v0: 0, k: 1, top: 1 },
          { col: P.teal, v0: 0.3, k: 0.86, top: 0.97 },
          { col: P.paper, v0: 0.52, k: 0.72, top: 0.94 },
          { col: P.vermilion, v0: 0.7, k: 0.56, top: 0.91 },
        ]
      : [
          { col: i % 2 ? P.indigo : P.indigoDeep, v0: 0, k: 1, top: 1 },
          { col: medTips[i % 4], v0: 0.42, k: 0.7, top: 0.95 },
        ];
    blade({
      at,
      y,
      L,
      w: large ? 0.098 : 0.088,
      S: L * 0.5,
      wig: 0.015 + 0.01 * R(),
      layers,
      sumi: large,
      bone: boneAt(z),
    });
  }

  // ---------------------------------------------------------------- (2) flame wisps on shoulders and haunches
  for (const s of [1, -1]) {
    const groups: { x: number; zs: number[]; bone: any }[] = [
      { x: s * 0.265, zs: [0.5, 0.38, 0.26], bone: J.chest },
      { x: s * 0.225, zs: [-0.38, -0.5, -0.62], bone: J.hips },
    ];
    for (const g of groups) {
      g.zs.forEach((z, j) => {
        const L = [0.3, 0.4, 0.25][j];
        const layers: Layer[] = [{ col: P.vermilion, v0: 0, k: 1, top: 1 }];
        if (j === 1) layers.push({ col: P.gold, v0: 0.08, k: 0.5, top: 0.72 });
        blade({
          at: new V(g.x, 1.09, z),
          y: new V(s * [0.4, 0.3, 0.45][j], 1, -[0.5, 0.7, 0.9][j]),
          L,
          w: 0.1,
          S: L * 0.5,
          wig: 0.035,
          layers,
          sumi: true,
          bone: g.bone,
          thick: 0.018,
        });
      });
    }
  }

  // ---------------------------------------------------------------- (3) ox tail and flame tuft
  const tailPath = catmull([
    [0, 0.93, -0.74],
    M.tailRoot,
    J.tail2.at.toArray(),
    J.tail3.at.toArray(),
    J.tail4.at.toArray(),
  ]);
  b.sweep(tailPath, [0.07, 0.04], {
    color: P.indigo,
    bone: [J.tail1, J.tail2, J.tail3, J.tail4],
    sides: 8,
  });
  const ringAt = (t: number, r: number, tube: number, bone: any) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 10), P.gold, {
      at: tailPath.at(t).toArray(),
      dir: tailPath.tangentAt(t).toArray(),
      axis: "z",
      bone,
    });
  ringAt(0.5, 0.06, 0.01, J.tail2);
  ringAt(0.98, 0.046, 0.014, J.tail4);

  const tuftBase = new V(0, 0.99, -1.39);
  const tuftSets: [string, string][] = [
    [P.paper, P.vermilion],
    [P.teal, P.paper],
    [P.vermilion, P.gold],
  ];
  for (let j = 0; j < 12; j++) {
    const phi = ((j - 5.5) * 11 * Math.PI) / 180;
    const d = new V(Math.sin(phi) * 0.9, -Math.cos(phi) * 0.9 + 0.1, -0.3);
    const L = 0.38 - 0.1 * (Math.abs(phi) / ((60 * Math.PI) / 180));
    const [c0, c1] = tuftSets[j % 3];
    blade({
      at: tuftBase,
      y: d,
      L,
      w: 0.1,
      S: 0.08,
      wig: 0.02,
      layers: [
        { col: c0, v0: 0, k: 1, top: 1 },
        { col: c1, v0: 0.5, k: 0.7, top: 0.96 },
      ],
      sumi: true,
      bone: J.tail4,
      thick: 0.014,
    });
  }

  // ---------------------------------------------------------------- (4) shimenawa collar
  const C = new V(M.collarRing[0], M.collarRing[1], M.collarRing[2]);
  const axN = new V(0, 0.4, 1).normalize();
  const rightV = new V(1, 0, 0);
  const upV = new V().crossVectors(axN, rightV).normalize();
  const RING = 0.268;
  // phi 0 = throat (bottom front of the ring), turning toward +X
  const ringP = (phi: number, r = RING) =>
    C.clone().addScaledVector(upV, -Math.cos(phi) * r).addScaledVector(rightV, Math.sin(phi) * r);
  const ringTan = (phi: number) =>
    upV.clone().multiplyScalar(Math.sin(phi)).addScaledVector(rightV, Math.cos(phi)).normalize();
  const ringOut = (phi: number) =>
    upV.clone().multiplyScalar(-Math.cos(phi)).addScaledVector(rightV, Math.sin(phi)).normalize();

  const ropePts: number[][] = [];
  for (let i = 0; i < 20; i++) ropePts.push(ringP((i / 20) * Math.PI * 2).toArray());
  b.sweep(catmull(ropePts, { closed: true }), 0.036, { color: STRAW, bone: J.neck1, sides: 6 });

  // diagonal binding wraps, merged into one part
  const wraps: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const phi = (i / 24) * Math.PI * 2;
    const q = aim(ringTan(phi), upV, "z").clone();
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new V(1, 0, 0), 0.55));
    const g = new THREE.TorusGeometry(0.037, 0.0055, 4, 8);
    g.applyMatrix4(new THREE.Matrix4().compose(ringP(phi), q, new V(1, 1, 1)));
    wraps.push(g);
  }
  const wrapGeo = mergeGeometries(wraps);
  if (wrapGeo) b.part(wrapGeo, STRAW_D, { bone: J.neck1, at: [0, 0, 0] });

  // zigzag paper shide with sumi edging
  const shideOutline = (hw: number, pad: number): Pt[] => {
    const xs = [0, -0.02, 0.02, -0.02, 0];
    const ys = [0.0, -0.05, -0.1, -0.15, -0.2];
    ys[0] += pad;
    ys[4] -= pad;
    const left: Pt[] = xs.map((x, i) => [x - hw, ys[i]] as Pt);
    const right: Pt[] = xs.map((x, i) => [x + hw, ys[i]] as Pt).reverse();
    return [...left, ...right];
  };
  for (const deg of [-74, -52, -30, 30, 52, 74]) {
    const phi = (deg * Math.PI) / 180;
    const p = ringP(phi).addScaledVector(ringOut(phi), 0.014);
    const t = ringTan(phi);
    const xh = new V(t.x, 0, t.z).normalize().toArray();
    b.extrude(shideOutline(0.029, 0.007), {
      at: p.clone().add(new V(0, -0.002, 0)).toArray(),
      x: xh,
      y: [0, 1, 0],
      thickness: 0.004,
      color: SUMI,
      bone: J.neck1,
    });
    b.extrude(shideOutline(0.022, 0), {
      at: p.toArray(),
      x: xh,
      y: [0, 1, 0],
      thickness: 0.007,
      color: P.shideWhite,
      bone: J.neck1,
    });
  }

  // vermilion tassels between the shide
  for (const deg of [-63, -41, -17, 17, 41, 63]) {
    const phi = (deg * Math.PI) / 180;
    const p = ringP(phi).addScaledVector(ringOut(phi), 0.016).add(new V(0, -0.012, 0));
    b.spike(p.toArray(), [0, -1, 0], 0.1, 0.017, { color: P.vermilion, bone: J.neck1 });
  }

  // brass bell with sumi slot at the throat
  const pb = ringP(0);
  const bellO = new V(pb.x, pb.y - 0.115, pb.z);
  b.capsule([pb.x, pb.y - 0.012, pb.z], [pb.x, bellO.y + 0.08, pb.z], 0.007, { color: P.gold, bone: J.neck1 });
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.046, 0.02],
      [0.036, 0.045],
      [0.02, 0.068],
      [0, 0.075],
    ],
    { at: bellO.toArray(), axis: [0, 1, 0], segments: 8, color: P.brass, bone: J.neck1 },
  );
  b.part(new THREE.TorusGeometry(0.05, 0.007, 4, 8), P.gold, {
    at: [bellO.x, bellO.y + 0.004, bellO.z],
    dir: [0, 1, 0],
    axis: "z",
    bone: J.neck1,
  });
  b.part(new THREE.BoxGeometry(0.009, 0.03, 0.01), SUMI, {
    at: [bellO.x, bellO.y + 0.022, bellO.z + 0.045],
    bone: J.neck1,
  });
}
    return buildManeTailRegalia;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bakuDreamEater" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.88,-0.5], dir: [0,0,1], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["hips"], at: [0,0.9,-0.1], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine1"], at: [0,0.95,0.3], dir: [0,0.1,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.02,0.58], dir: [0,0.4,1], role: "neck" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.12,0.76], dir: [0,0.25,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.22,0.92], dir: [0,-0.05,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.1,0.98], dir: [0,-0.08,1], role: "jaw" });
  J["earL"] = b.joint("earL", { parent: J["head"], at: [0.17,1.42,0.88], dir: [0.5,1,-0.2], role: "hinge", group: "head" });
  J["earR"] = b.joint("earR", { parent: J["head"], at: [-0.17,1.42,0.88], dir: [-0.5,1,-0.2], role: "hinge", group: "head" });
  J["trunk1"] = b.joint("trunk1", { parent: J["head"], at: [0,1.2,1.2], dir: [0,-0.15,1], role: "tentacle", group: "trunk" });
  J["trunk2"] = b.joint("trunk2", { parent: J["trunk1"], at: [0,1.14,1.38], dir: [0,-0.5,1], role: "tentacle", group: "trunk" });
  J["trunk3"] = b.joint("trunk3", { parent: J["trunk2"], at: [0,1,1.52], dir: [0,-1,0.6], role: "tentacle", group: "trunk" });
  J["trunk4"] = b.joint("trunk4", { parent: J["trunk3"], at: [0,0.86,1.58], dir: [0,-1,0.5], role: "tentacle", group: "trunk" });
  J["shoulderFL"] = b.joint("shoulderFL", { parent: J["chest"], at: [0.27,0.82,0.4], dir: [0,-1,0], role: "leg", group: "legs" });
  J["elbowFL"] = b.joint("elbowFL", { parent: J["shoulderFL"], at: [0.28,0.5,0.4], dir: [0,-1,0], role: "leg", group: "legs" });
  J["wristFL"] = b.joint("wristFL", { parent: J["elbowFL"], at: [0.28,0.24,0.42], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["pawFL"] = b.joint("pawFL", { parent: J["wristFL"], at: [0.28,0.08,0.5], dir: [0,0,1], role: "leg", group: "legs" });
  J["shoulderFR"] = b.joint("shoulderFR", { parent: J["chest"], at: [-0.27,0.82,0.4], dir: [0,-1,0], role: "leg", group: "legs" });
  J["elbowFR"] = b.joint("elbowFR", { parent: J["shoulderFR"], at: [-0.28,0.5,0.4], dir: [0,-1,0], role: "leg", group: "legs" });
  J["wristFR"] = b.joint("wristFR", { parent: J["elbowFR"], at: [-0.28,0.24,0.42], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["pawFR"] = b.joint("pawFR", { parent: J["wristFR"], at: [-0.28,0.08,0.5], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipHL"] = b.joint("hipHL", { parent: J["hips"], at: [0.27,0.84,-0.5], dir: [0.1,-1,0.3], role: "leg", group: "legs" });
  J["kneeHL"] = b.joint("kneeHL", { parent: J["hipHL"], at: [0.3,0.52,-0.38], dir: [0,-1,-0.4], role: "leg", group: "legs" });
  J["hockHL"] = b.joint("hockHL", { parent: J["kneeHL"], at: [0.28,0.3,-0.62], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["pawHL"] = b.joint("pawHL", { parent: J["hockHL"], at: [0.28,0.08,-0.5], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipHR"] = b.joint("hipHR", { parent: J["hips"], at: [-0.27,0.84,-0.5], dir: [-0.1,-1,0.3], role: "leg", group: "legs" });
  J["kneeHR"] = b.joint("kneeHR", { parent: J["hipHR"], at: [-0.3,0.52,-0.38], dir: [0,-1,-0.4], role: "leg", group: "legs" });
  J["hockHR"] = b.joint("hockHR", { parent: J["kneeHR"], at: [-0.28,0.3,-0.62], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["pawHR"] = b.joint("pawHR", { parent: J["hockHR"], at: [-0.28,0.08,-0.5], dir: [0,0,1], role: "leg", group: "legs" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.95,-0.82], dir: [0,0.25,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.02,-1.05], dir: [0,0.1,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.04,-1.25], dir: [0,-0.3,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,0.98,-1.4], dir: [0,-0.6,-1], role: "tail", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
