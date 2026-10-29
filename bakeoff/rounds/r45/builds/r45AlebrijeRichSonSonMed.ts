import * as THREE from "three";
import { createBuilder, type Builder, type Joint, aim, rng, bezier, catmull, frame } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Alebrije Jaguar-Eagle",
  "description": "A Oaxacan alebrije of painted wood: a jaguar-bodied, eagle-headed, eagle-winged beast with taloned hind feet and a feather-plumed tail, covered in dots, rosettes, flowers and zigzag bands in saturated colours."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  jaguarOrange: "#f08a1c",
  marigold: "#ffb81f",
  gold: "#ffd21f",
  indigo: "#2a1646",
  black: "#1a1018",
  cream: "#fff1cf",
  white: "#ffffff",
  magenta: "#e0287a",
  pink: "#ff7fb0",
  turquoise: "#13b5b0",
  deepTeal: "#0b6e70",
  cobalt: "#2457c5",
  sky: "#6fd0f0",
  leaf: "#3aa03c",
  lime: "#b6d63a",
  red: "#d92b2b",
  violet: "#7a3fc4",
  burnt: "#b8450f",
  rawWood: "#d9a56a",
  beakYellow: "#ffcf2e",
};
const M = {
  hipsCentre: [0, 0.86, -0.5] as [number, number, number],
  chestTop: [0, 1.12, 0.7] as [number, number, number],
  neckBase: [0, 1, 0.72] as [number, number, number],
  headCentre: [0, 1.42, 0.95] as [number, number, number],
  jawHinge: [0, 1.36, 1.02] as [number, number, number],
  beakBase: [0, 1.4, 1.14] as [number, number, number],
  beakTip: [0, 1.34, 1.5] as [number, number, number],
  tailRoot: [0, 0.9, -0.8] as [number, number, number],
  tailTip: [0, 1.2, -1.8] as [number, number, number],
  wingRootL: [0.3, 1.1, 0.25] as [number, number, number],
  wingRootR: [-0.3, 1.1, 0.25] as [number, number, number],
  shoulderFL: [0.27, 0.78, 0.5] as [number, number, number],
  shoulderFR: [-0.27, 0.78, 0.5] as [number, number, number],
  hipHL: [0.28, 0.78, -0.5] as [number, number, number],
  hipHR: [-0.28, 0.78, -0.5] as [number, number, number],
  pawFL: [0.25, 0.06, 0.66] as [number, number, number],
  pawFR: [-0.25, 0.06, 0.66] as [number, number, number],
  footHL: [0.28, 0.06, -0.5] as [number, number, number],
  footHR: [-0.28, 0.06, -0.5] as [number, number, number],
  backLine: [0, 1.2, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P }: Ctx) {
  const Y = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- batching: decorations are merged per bone + colour (few parts, skinned by region) ----------
  const bins = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  const boneFor = (z: number) => (z < -0.3 ? J.hips : z < 0.1 ? J.spine1 : z < 0.45 ? J.spine2 : J.chest);
  function put(
    geo: THREE.BufferGeometry,
    color: string,
    pos: THREE.Vector3,
    n: THREE.Vector3,
    spin = 0,
    lift = 0.004,
  ) {
    const nn = n.clone().normalize();
    const q = aim(nn.clone());
    q.multiply(new THREE.Quaternion().setFromAxisAngle(Y, spin));
    const m = new THREE.Matrix4().compose(pos.clone().addScaledVector(nn, lift), q, V(1, 1, 1));
    const g = geo.clone().applyMatrix4(m);
    const bone = boneFor(pos.z);
    const key = `${bone.name}|${color}`;
    let bin = bins.get(key);
    if (!bin) bins.set(key, (bin = { bone, color, geos: [] }));
    bin.geos.push(g);
  }
  const flush = () => {
    for (const bin of bins.values()) {
      const merged = mergeGeometries(bin.geos);
      if (merged) b.part(merged, bin.color, { bone: bin.bone, at: [0, 0, 0], flat: true });
    }
  };

  // ---------- small geometry helpers (local frame: +Y out of the surface) ----------
  const sph = (r: number, sx = 1, sy = 1, sz = 1) => new THREE.SphereGeometry(r, 6, 4).scale(sx, sy, sz);
  const disc = (r: number, h: number, seg = 8) => new THREE.CylinderGeometry(r, r, h, seg);
  const wedge = (r: number, h: number, flat = 0.3) =>
    new THREE.ConeGeometry(r, h, 3).rotateX(Math.PI / 2).scale(1, flat, 1);
  const merge = (list: THREE.BufferGeometry[]) => mergeGeometries(list)!;
  const ringOf = (count: number, radius: number, make: (i: number) => THREE.BufferGeometry, y = 0) =>
    merge(
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return make(i).translate(Math.cos(a) * radius, y, Math.sin(a) * radius);
      }),
    );

  // ---------- the body loft ----------
  const st = (z: number, y: number, w: number, h: number) => ({ at: [0, y, z] as [number, number, number], w, h });
  const body = b.loft(
    [
      st(-0.85, 0.86, 0.3, 0.4),
      st(-0.72, 0.88, 0.56, 0.62),
      st(-0.4, 0.88, 0.62, 0.68),
      st(-0.05, 0.88, 0.52, 0.6),
      st(0.3, 0.9, 0.56, 0.64),
      st(0.62, 0.9, 0.64, 0.68),
      st(0.85, 0.9, 0.4, 0.48),
    ],
    {
      bone: [J.hips, J.spine1, J.spine2, J.chest],
      color: P.jaguarOrange,
      sectors: [
        [105, 135, P.marigold],
        [135, 225, P.cream],
        [225, 255, P.marigold],
      ],
    },
  );
  const skin = b.surface(body);

  // ---------- shoulder & haunch masses ----------
  const masses: any[] = [];
  for (const s of [1, -1]) {
    masses.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), P.jaguarOrange, {
        bone: J.chest,
        at: [s * 0.28, 0.8, 0.5],
        scale: [0.16, 0.27, 0.28],
        flat: true,
      }),
    );
    masses.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), P.jaguarOrange, {
        bone: J.hips,
        at: [s * 0.28, 0.8, -0.5],
        scale: [0.16, 0.28, 0.3],
        flat: true,
      }),
    );
  }
  const mskin = b.surface(masses);

  // ---------- motifs ----------
  const rosRing = merge([
    ringOf(5, 0.042, () => sph(0.017)),
  ]);
  const rosCentreG = disc(0.024, 0.012, 6).translate(0, 0.004, 0);
  const rosCentreM = disc(0.012, 0.016, 6).translate(0, 0.006, 0);

  function flower(hit: any, R: number, cols: string[], petals = 8) {
    const p = hit.at.clone();
    const n = hit.n.clone();
    put(disc(R * 1.4, 0.01, 10), P.indigo, p, n, 0, 0.002);
    for (let ci = 0; ci < cols.length; ci++) {
      const list: THREE.BufferGeometry[] = [];
      for (let i = ci; i < petals; i += cols.length) {
        const a = (i / petals) * Math.PI * 2;
        list.push(sph(R * 0.42, 1.3, 0.4, 1).rotateY(-a).translate(Math.cos(a) * R * 0.95, 0.006, Math.sin(a) * R * 0.95));
      }
      if (list.length) put(merge(list), cols[ci], p, n, 0, 0.005);
    }
    put(sph(R * 0.42, 1, 0.6, 1).translate(0, 0.01, 0), P.gold, p, n, 0, 0.008);
    put(ringOf(10, R * 1.75, () => sph(R * 0.14)), P.white, p, n, 0, 0.004);
  }
  const flowerCols = [P.pink, P.magenta, P.sky, P.cobalt];

  // ---------- saddle strip, greca, dots, leaf ridge ----------
  const backLine = body.line(0, 0.004);
  b.sweep(backLine, () => [0.065, 0.014], {
    bone: [J.hips, J.spine1, J.spine2, J.chest],
    color: P.magenta,
    section: "box",
    caps: "flat",
  });
  const lineAt = (angle: number, t: number) => body.line(angle).at(t) as THREE.Vector3;
  const topAt = (t: number, dx = 0) => {
    const p = (backLine.at(t) as THREE.Vector3).clone();
    p.x += dx;
    return skin.nearest(p);
  };
  const GRECA = 18;
  for (let i = 0; i < GRECA; i++) {
    const t = 0.1 + (0.8 * i) / (GRECA - 1);
    const h = topAt(t);
    put(wedge(0.034, 0.05, 0.3), P.turquoise, h.at.clone(), h.n, i % 2 ? Math.PI : 0, 0.016);
  }
  for (let i = 0; i < 30; i++) {
    const t = 0.08 + (0.84 * i) / 29;
    for (const s of [1, -1]) {
      const h = topAt(t, s * 0.1);
      put(sph(0.013), P.white, h.at.clone(), h.n, 0, 0.003);
    }
  }
  const LEAVES = 14;
  for (let i = 0; i < LEAVES; i++) {
    const t = 0.1 + (0.8 * i) / (LEAVES - 1);
    for (const s of [1, -1]) {
      const h = topAt(t, s * 0.135);
      put(sph(0.035, 0.7, 0.5, 1.8), (i + (s > 0 ? 0 : 1)) % 2 ? P.lime : P.leaf, h.at.clone(), h.n, s * 0.5, 0.004);
    }
  }

  // ---------- belly & flank dot rows ----------
  const row = (angle: number, count: number, color: string, r: number, t0 = 0.05, t1 = 0.95, alt?: string) => {
    for (let i = 0; i < count; i++) {
      const t = t0 + ((t1 - t0) * i) / (count - 1);
      const h = skin.nearest(lineAt(angle, t));
      put(sph(r), alt && i % 2 ? alt : color, h.at.clone(), h.n, 0, 0.003);
    }
  };
  for (const a of [135, 225]) row(a, 26, P.white, 0.014);
  for (const a of [120, 240]) row(a, 20, P.indigo, 0.012, 0.08, 0.92, P.red);
  row(180, 24, P.cream, 0.012, 0.1, 0.9, P.magenta);

  // ---------- rosettes (jaguar markings) ----------
  const flankC = [V(0.3, 0.88, 0.0), V(-0.3, 0.88, 0.0)];
  const massC = [V(0.3, 0.8, 0.5), V(-0.3, 0.8, 0.5), V(0.3, 0.8, -0.5), V(-0.3, 0.8, -0.5)];
  const wingC = [V(0.3, 1.1, 0.25), V(-0.3, 1.1, 0.25)];
  const hits = skin.scatter(34, {
    rng: rng(5),
    minDist: 0.15,
    filter: (h: any) => {
      const p = h.at as THREE.Vector3;
      if (h.n.y < -0.1) return false;
      if (Math.abs(p.x) < 0.15 && h.n.y > 0.6) return false;
      if (flankC.some((c) => p.distanceTo(c) < 0.2)) return false;
      if (massC.some((c) => p.distanceTo(c) < 0.24)) return false;
      if (wingC.some((c) => p.distanceTo(c) < 0.17)) return false;
      if (Math.abs(p.z) > 0.78) return false;
      if (p.z > 0.55 && p.y < 0.78) return false; // keep the bib clear
      return true;
    },
  });
  hits.slice(0, 30).forEach((h: any, i: number) => {
    const sc = 0.85 + 0.3 * ((i * 37) % 10) / 10;
    const spin = i * 0.9;
    put(rosRing.clone().scale(sc, 1, sc), P.indigo, h.at.clone(), h.n, spin, 0.004);
    put((i % 2 ? rosCentreM : rosCentreG).clone().scale(sc, 1, sc), i % 2 ? P.magenta : P.gold, h.at.clone(), h.n, spin, 0.004);
  });

  // ---------- big flank flowers ----------
  for (const s of [1, -1]) {
    const h = skin.ray([s * 1, 0.9, 0.0], [-s, 0, 0]);
    if (h) flower(h, 0.075, flowerCols, 8);
  }
  // ---------- shoulder & haunch flowers with indigo dot rings ----------
  for (const s of [1, -1]) {
    for (const z of [0.5, -0.5]) {
      const y = 0.8;
      const h = mskin.ray([s * 1, y, z], [-s, 0, 0]);
      if (h) flower(h, 0.05, [P.pink, P.turquoise, P.gold, P.red], 6);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const d = mskin.ray([s * 1, y + 0.14 * Math.sin(a), z + 0.14 * Math.cos(a)], [-s, 0, 0]);
        if (d) put(sph(0.016), P.indigo, d.at.clone(), d.n, 0, 0.003);
      }
    }
    // haunch spots
    for (const [yy, zz] of [[0.95, -0.62], [0.68, -0.4], [0.7, -0.6]]) {
      const d = mskin.ray([s * 1, yy, zz], [-s, 0, 0]);
      if (d) put(sph(0.03, 1, 0.5, 1), P.indigo, d.at.clone(), d.n, 0, 0.002);
    }
  }

  // ---------- chest bib ----------
  const bibRows: [number, number[]][] = [
    [0.82, [-0.1, -0.05, 0, 0.05, 0.1]],
    [0.75, [-0.14, -0.07, 0, 0.07, 0.14]],
    [0.69, [-0.11, -0.055, 0, 0.055, 0.11]],
  ];
  for (const [y, xs] of bibRows)
    for (const x of xs) {
      const h = skin.ray([x, y, 1.6], [0, 0, -1]);
      if (h) put(disc(0.045, 0.014, 6), P.cream, h.at.clone(), h.n, 0.3, 0.002);
    }
  for (let i = 0; i < 7; i++) {
    const x = -0.15 + i * 0.05;
    const h = skin.ray([x, 0.62, 1.6], [0, 0, -1]);
    if (h) {
      put(wedge(0.032, 0.07, 0.3).rotateX(Math.PI), i % 2 ? P.turquoise : P.red, h.at.clone(), h.n, 0, 0.006);
      put(sph(0.01), P.white, h.at.clone().add(V(0, 0.045, 0)), h.n, 0, 0.012);
    }
  }

  // ---------- bead necklace round the chest base ----------
  const collar = skin.loop(V(0, 0.9, 0.72), { dir: [0, 0, 1], lift: 0.01 });
  const beadCols = [P.magenta, P.turquoise, P.gold, P.white, P.cobalt, P.red];
  const BEADS = 30;
  for (let i = 0; i < BEADS; i++) {
    const p = (collar.at(i / BEADS) as THREE.Vector3).clone();
    const h = skin.nearest(p);
    put(sph(0.022, 1, 1, 1.3), beadCols[i % beadCols.length], h.at.clone(), h.n, 0, 0.012);
  }
  b.sweep(collar, 0.008, { bone: J.chest, color: P.indigo });

  flush();
  return body;
}
    return buildTorso;
  })(),
  // headNeck
  (() => {
function buildHeadNeck({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const head = J.head;
  const jaw = J.jaw;
  const HC = M.headCentre;
  const RAINBOW = [P.red, P.marigold, P.lime, P.turquoise, P.cobalt, P.violet, P.magenta];
  const RUFF = [P.marigold, P.magenta, P.turquoise, P.cobalt];

  // ---- generic feather blade (extruded outline) with white tip and centre dots
  function blade(
    at: THREE.Vector3,
    yd: THREE.Vector3,
    len: number,
    wid: number,
    color: string,
    tip: string,
    bone: any,
    thick = 0.012,
    xdIn?: THREE.Vector3,
  ) {
    const y = yd.clone().normalize();
    const ref = Math.abs(y.z) > 0.9 ? V(1, 0, 0) : V(0, 0, 1);
    const xd = (xdIn ?? new THREE.Vector3().crossVectors(y, ref)).clone().normalize();
    const w = wid;
    const L = len;
    b.extrude(
      [
        [-w / 2, 0],
        [w / 2, 0],
        [w * 0.55, L * 0.5],
        [w * 0.35, L * 0.82],
        [0, L],
        [-w * 0.35, L * 0.82],
        [-w * 0.55, L * 0.5],
      ],
      { at, x: xd.toArray() as [number, number, number], y: y.toArray() as [number, number, number], thickness: thick, color, bone },
    );
    b.extrude(
      [
        [-w * 0.3, L * 0.8],
        [w * 0.3, L * 0.8],
        [0, L],
      ],
      { at, x: xd.toArray() as [number, number, number], y: y.toArray() as [number, number, number], thickness: thick * 1.5, color: tip, bone },
    );
    const n = new THREE.Vector3().crossVectors(xd, y).normalize();
    for (const sg of [1, -1]) {
      for (const f of [0.3, 0.55]) {
        const p = at.clone().addScaledVector(y, L * f).addScaledVector(n, (sg * thick) / 2);
        b.part(new THREE.SphereGeometry(0.009, 5, 4), P.white, { at: p, bone });
      }
    }
  }

  // ---- neck
  const neckPath = catmull([V(0, 0.98, 0.7), V(0, 1.18, 0.82), V(0, 1.37, 0.92)]);
  const neck = b.sweep(neckPath, [0.2, 0.15], {
    bone: [J.neck1, J.neck2],
    color: P.jaguarOrange,
    sectors: [[125, 235, P.cream]],
    sides: 10,
  });
  for (const t of [0.25, 0.45, 0.65, 0.85]) {
    for (const s of [1, -1]) {
      b.stick(new THREE.SphereGeometry(0.016, 6, 4), P.white, neck.at(t, s * 78));
      b.stick(new THREE.SphereGeometry(0.013, 6, 4), t > 0.5 ? P.magenta : P.turquoise, neck.at(t + 0.07, s * 100));
      b.stick(new THREE.SphereGeometry(0.012, 6, 4), P.marigold, neck.at(t, s * 55));
    }
  }
  // zigzag-ish indigo ticks on the cream front
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + i * 0.13;
    b.stick(new THREE.BoxGeometry(0.03, 0.012, 0.012), i % 2 ? P.red : P.turquoise, neck.at(t, 180), { spin: i % 2 ? 30 : -30 });
  }

  // ---- ruff collar
  const N = 16;
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    const sn = Math.sin(th);
    const cs = Math.cos(th);
    const r = 0.17 + (i % 2) * 0.012;
    const at = V(sn * r, 1.12 + (i % 2) * 0.02, 0.76 + cs * r);
    const yd = V(sn * 0.6, -0.7, cs * 0.6);
    blade(at, yd, 0.2, 0.095, RUFF[i % 4], i % 2 ? P.cream : P.white, J.neck1, 0.012, V(cs, 0, -sn));
  }

  // ---- skull
  b.part(new THREE.SphereGeometry(1, 8, 6), P.jaguarOrange, {
    at: HC, bone: head, scale: [0.17, 0.16, 0.2], flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), P.cream, {
    at: V(0, 1.39, 1.05), bone: head, scale: [0.125, 0.11, 0.1], flat: true,
  });
  // turquoise brow band
  b.part(new THREE.SphereGeometry(1, 8, 4), P.turquoise, {
    at: V(0, 1.545, 1.03), bone: head, scale: [0.15, 0.022, 0.075], flat: true,
  });
  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), P.white, {
      at: V(i * 0.04, 1.568, 1.04 - Math.abs(i) * 0.012), bone: head,
    });
  }

  // ---- upper beak
  const bb = M.beakBase;
  const bt = M.beakTip;
  const upper = bezier(V(bb[0], bb[1], bb[2] - 0.04), V(0, 1.43, 1.36), V(0, 1.40, 1.45), V(bt[0], bt[1], bt[2]));
  b.sweep(upper, (t) => [0.085 * (1 - t) + 0.004, 0.075 * (1 - t) + 0.004], {
    bone: head, color: P.beakYellow, sides: 6, caps: { start: "flat", end: "point" },
  });
  // raw wood ridge
  const ridge = bezier(V(0, 1.475, 1.1), V(0, 1.5, 1.34), V(0, 1.45, 1.44), V(0, 1.352, 1.495));
  b.sweep(ridge, [0.014, 0.004], { bone: head, color: P.rawWood, sides: 5 });
  // red outline stripes along lower edge of upper beak
  for (const s of [1, -1]) {
    const edge = bezier(V(s * 0.078, 1.37, 1.12), V(s * 0.06, 1.38, 1.3), V(s * 0.03, 1.36, 1.42), V(0, 1.345, 1.49));
    b.sweep(edge, [0.011, 0.003], { bone: head, color: P.red, sides: 5 });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), P.black, { at: V(s * 0.035, 1.455, 1.2), bone: head });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), P.white, { at: V(s * 0.05, 1.42, 1.16), bone: head });
  }

  // ---- lower jaw
  const lower = bezier(V(0, 1.345, 1.05), V(0, 1.31, 1.2), V(0, 1.31, 1.3), V(0, 1.325, 1.41));
  b.sweep(lower, (t) => [0.07 * (1 - t) + 0.006, 0.03 * (1 - t) + 0.006], {
    bone: jaw, color: P.beakYellow, sides: 6, caps: { start: "flat", end: "point" },
  });
  b.part(new THREE.BoxGeometry(0.06, 0.008, 0.16), P.red, { at: V(0, 1.338, 1.2), bone: jaw });
  b.part(new THREE.BoxGeometry(0.075, 0.01, 0.06), P.red, { at: V(0, 1.322, 1.2), bone: jaw, scale: [0.6, 1, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.014, 0.065, 6), P.white, { at: V(s * 0.062, 1.375, 1.1), bone: jaw });
    b.part(new THREE.ConeGeometry(0.012, 0.05, 6), P.white, { at: V(s * 0.06, 1.385, 1.12), bone: head, dir: [0, -1, 0] });
    const e = bezier(V(s * 0.065, 1.33, 1.06), V(s * 0.05, 1.315, 1.2), V(s * 0.03, 1.312, 1.3), V(0, 1.325, 1.4));
    b.sweep(e, [0.009, 0.003], { bone: jaw, color: P.burnt, sides: 5 });
  }

  // ---- eyes, brows, eyeliner, ears, cheeks
  for (const s of [1, -1]) {
    const eyeAt = V(s * 0.15, 1.47, 1.035);
    const d = V(s * 0.6, 0.05, 0.8).normalize();
    const layer = (r: number, h: number, c: string, k: number) =>
      b.part(new THREE.CylinderGeometry(r, r, h, 10), c, {
        at: eyeAt.clone().addScaledVector(d, k), bone: head, dir: d.toArray() as [number, number, number],
      });
    layer(0.062, 0.02, P.black, 0);
    layer(0.048, 0.02, P.gold, 0.008);
    layer(0.027, 0.02, P.indigo, 0.016);
    b.part(new THREE.SphereGeometry(0.009, 5, 4), P.white, {
      at: eyeAt.clone().addScaledVector(d, 0.03).add(V(s * -0.01, 0.014, 0.005)), bone: head,
    });
    // brow wedge
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.06), P.indigo, {
      at: V(s * 0.13, 1.54, 1.0), bone: head, rotation: [10, s * -25, s * -18],
    });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.SphereGeometry(0.01, 5, 4), P.white, {
        at: V(s * (0.1 + k * 0.035), 1.563 - k * 0.003, 1.03 - k * 0.025), bone: head,
      });
    // eyeliner swirl
    b.sweep(catmull([V(s * 0.155, 1.455, 1.07), V(s * 0.178, 1.46, 1.0), V(s * 0.178, 1.485, 0.94), V(s * 0.16, 1.5, 0.92)]),
      [0.01, 0.004], { bone: head, color: P.magenta, sides: 5 });
    // ears
    const ed = V(s * 0.35, 1, -0.15).normalize();
    const eat = V(s * 0.135, 1.575, 0.88);
    const el = (r: number, h: number, c: string, k: number) =>
      b.part(new THREE.CylinderGeometry(r, r, h, 10), c, {
        at: eat.clone().addScaledVector(ed, k), bone: head, dir: ed.toArray() as [number, number, number],
      });
    el(0.088, 0.045, P.indigo, 0);
    el(0.076, 0.05, P.jaguarOrange, 0.004);
    el(0.048, 0.056, P.cream, 0.008);
    // cheek pattern
    const cd = V(s, 0, 0.1).normalize();
    const cat = V(s * 0.155, 1.385, 1.0);
    const cl = (r: number, c: string, k: number) =>
      b.part(new THREE.CylinderGeometry(r, r, 0.012, 10), c, {
        at: cat.clone().addScaledVector(cd, k), bone: head, dir: cd.toArray() as [number, number, number],
      });
    cl(0.04, P.turquoise, 0);
    cl(0.028, P.white, 0.004);
    cl(0.017, P.magenta, 0.008);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.008, 5, 4), k % 2 ? P.white : P.turquoise, {
        at: cat.clone().add(V(s * 0.004, Math.sin(a) * 0.052, Math.cos(a) * 0.052)), bone: head,
      });
    }
    // cheek ruffs: 3 layers
    for (let L = 0; L < 3; L++)
      for (let k = 0; k < 3; k++) {
        blade(
          V(s * (0.12 + L * 0.005), 1.35 - L * 0.03, 1.08 - L * 0.07 - k * 0.0 ),
          V(s * (0.35 + k * 0.35), -0.8, -0.3 - k * 0.1),
          0.12 - L * 0.015, 0.06,
          RUFF[(L + k) % 4], P.white, head, 0.01,
        );
      }
  }

  // ---- crest
  const crestC = [P.red, P.marigold, P.lime, P.turquoise, P.cobalt, P.violet, P.magenta, P.marigold, P.red];
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 0.85;
    const len = 0.32 - Math.abs(i - 4) * 0.012;
    const yd = V(Math.sin(a) * 0.9, Math.cos(a), -0.35).normalize();
    blade(V(Math.sin(a) * 0.05, 1.555, 0.9 - Math.abs(a) * 0.03), yd, len, 0.075, crestC[i], P.white, head, 0.012);
  }
  // crest base boss
  b.part(new THREE.SphereGeometry(1, 8, 5), P.indigo, { at: V(0, 1.56, 0.9), bone: head, scale: [0.09, 0.03, 0.06], flat: true });
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.SphereGeometry(0.01, 5, 4), P.gold, { at: V(i * 0.032, 1.585, 0.91 ), bone: head });

  // forehead gold dot between eyes
  b.part(new THREE.SphereGeometry(0.014, 6, 4), P.gold, { at: V(0, 1.50, 1.13), bone: head });
}
    return buildHeadNeck;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rnd = rng(11);
  const ball = (at: THREE.Vector3, r: number, color: string, bone: any, seg = 6) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), color, { bone, at });
  const flower = (at: THREE.Vector3, bone: any, s: number, petals: string[]) => {
    const c = at.clone();
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), P.indigo, {
      bone, at: c, dir: [s, 0, 0],
    });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ball(c.clone().add(V(s * 0.012, Math.cos(a) * 0.032, Math.sin(a) * 0.032)), 0.014, petals[i % petals.length], bone);
    }
    ball(c.clone().add(V(s * 0.016, 0, 0)), 0.012, P.gold, bone);
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // ---------- FRONT LEG ----------
    const sh = J["shoulderF" + side], el = J["elbowF" + side], wr = J["wristF" + side], pw = J["pawF" + side];
    const S = sh.at.clone(), E = el.at.clone(), W = wr.at.clone();
    const legPath = catmull([S, E, W, V(s * 0.25, 0.14, 0.6)]);
    b.sweep(legPath, [0.1, 0.09, 0.078, 0.075], {
      bone: [sh, el, wr], color: P.jaguarOrange, sides: 8,
    });
    // spots
    [0.12, 0.28, 0.45, 0.62].forEach((t, i) => {
      const p = legPath.at(t);
      const bone = t > 0.4 ? el : sh;
      const r = 0.098 - t * 0.03;
      ball(V(p.x + s * r * 0.9, p.y + (i % 2) * 0.03, p.z + 0.02), 0.02, P.indigo, bone);
      ball(V(p.x + s * 0.02, p.y - 0.02, p.z + r * 0.9), 0.017, P.indigo, bone);
    });
    // flower on upper leg
    flower(V(S.x + s * 0.095, S.y - 0.1, S.z), sh, s, [P.pink, P.magenta, P.sky]);
    // cuff
    const dir = W.clone().sub(E).normalize();
    const u = V(1, 0, 0), v = new THREE.Vector3().crossVectors(dir, u).normalize();
    const rc = 0.082;
    const cuff: [number, string][] = [[-0.035, P.magenta], [0, P.cream], [0.035, P.magenta]];
    for (const [off, col] of cuff)
      b.part(new THREE.TorusGeometry(rc, 0.016, 5, 10), col, {
        bone: wr, at: W.clone().addScaledVector(dir, off + 0.02), dir: dir.toArray() as any, axis: "z",
      });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = W.clone().addScaledVector(dir, 0.02)
        .addScaledVector(u, Math.cos(a) * (rc + 0.014)).addScaledVector(v, Math.sin(a) * (rc + 0.014));
      ball(p, 0.008, P.white, wr, 5);
    }
    // paw
    const pc = V(s * 0.25, 0.075, 0.66);
    b.part(new THREE.SphereGeometry(1, 8, 6), P.cream, { bone: pw, at: pc, scale: [0.13, 0.077, 0.15] });
    // toe bumps + claws
    for (let i = 0; i < 4; i++) {
      const x = s * 0.25 + (i - 1.5) * 0.065;
      const tp = V(x, 0.06, 0.78 - Math.abs(i - 1.5) * 0.02);
      ball(tp, 0.035, P.cream, pw);
      b.part(new THREE.ConeGeometry(0.014, 0.07, 6), P.indigo, {
        bone: pw, at: tp.clone().add(V(0, -0.005, 0.045)), dir: [0, -0.15, 1],
      });
    }
    // toe stripes red / turquoise on top of paw
    for (let i = 0; i < 4; i++) {
      const x = s * 0.25 + (i - 1.5) * 0.065;
      b.part(new THREE.BoxGeometry(0.04, 0.012, 0.03), i % 2 ? P.turquoise : P.red, {
        bone: pw, at: V(x, 0.125, 0.76),
      });
    }
    // ankle dots over paw
    for (let i = 0; i < 5; i++)
      ball(V(s * 0.25 + (i - 2) * 0.04, 0.138, 0.64), 0.009, P.white, pw, 5);

    // ---------- HIND LEG ----------
    const hp = J["hipH" + side], kn = J["kneeH" + side], hk = J["hockH" + side], ft = J["footH" + side];
    const H = hp.at.clone(), K = kn.at.clone(), C = hk.at.clone();
    const tc = H.clone().lerp(K, 0.5).add(V(0, -0.02, 0));
    const rx = 0.17, ry = 0.21, rz = 0.26;
    b.part(new THREE.SphereGeometry(1, 9, 7), P.jaguarOrange, { bone: hp, at: tc, scale: [rx, ry, rz] });
    // feather rows
    const rowCols = [P.marigold, P.magenta, P.turquoise];
    for (let r = 0; r < 3; r++) {
      const dy = 0.1 - r * 0.09;
      const k = Math.sqrt(1 - (dy / ry) ** 2);
      for (let j = 0; j < 6; j++) {
        const a = -1.2 + j * 0.48 + (r % 2) * 0.2;
        const p = V(tc.x + s * rx * k * Math.cos(a) * 0.98, tc.y + dy, tc.z + rz * k * Math.sin(a) * 0.98);
        b.part(new THREE.SphereGeometry(1, 6, 4), rowCols[r], {
          bone: hp, at: p, dir: [0, -1, -0.15], scale: [0.02, 0.085, 0.052],
        });
        ball(p.clone().add(V(s * 0.016, -0.03, 0)), 0.009, P.white, hp, 5);
      }
    }
    flower(V(tc.x + s * 0.17, tc.y + 0.14, tc.z + 0.03), hp, s, [P.pink, P.cobalt, P.magenta]);
    ball(V(tc.x + s * 0.12, tc.y + 0.17, tc.z - 0.12), 0.02, P.indigo, hp);
    // shin
    const F = V(s * 0.28, 0.0, -0.5);
    const shin = catmull([K, C, V(F.x, 0.13, -0.52)]);
    b.sweep(shin, 0.055, { bone: [kn, hk], color: P.jaguarOrange, sides: 8 });
    ball(K, 0.065, P.jaguarOrange, kn, 7);
    // greca ring
    const gc = shin.at(0.55);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.014, 0.024, 0.032), i % 2 ? P.white : P.cobalt, {
        bone: hk,
        at: V(gc.x + Math.cos(a) * 0.06, gc.y + (i % 2 ? 0.012 : -0.012), gc.z + Math.sin(a) * 0.06),
        rotation: [0, (-a * 180) / Math.PI, 0],
      });
    }
    // heel pad
    ball(V(F.x, 0.08, -0.53), 0.058, P.beakYellow, ft, 7);
    // toes
    const toes: [number, number, number][] = [[0, 0.2, 0.03], [25, 0.2, 0.03], [-25, 0.2, 0.03], [180, 0.14, 0.028]];
    for (const [deg, len, rad] of toes) {
      const ps = (deg * Math.PI) / 180;
      const d = V(Math.sin(ps), 0, Math.cos(ps));
      const base = V(F.x, 0.038, -0.54);
      const end = base.clone().addScaledVector(d, len);
      b.capsule(base, end, rad, P.beakYellow, { bone: ft });
      for (const f of [0.38, 0.72]) ball(base.clone().addScaledVector(d, len * f), rad * 1.22, P.beakYellow, ft);
      for (const f of [0.22, 0.55]) {
        b.part(new THREE.CylinderGeometry(rad * 1.12, rad * 1.12, 0.012, 7), P.rawWood, {
          bone: ft, at: base.clone().addScaledVector(d, len * f), dir: d.toArray() as any,
        });
      }
      ball(end, rad * 0.95, P.rawWood, ft);
      // talon: two curved cones
      const t1 = end.clone().addScaledVector(d, 0.04);
      b.part(new THREE.ConeGeometry(0.026, 0.08, 6), P.indigo, {
        bone: ft, at: t1.clone().add(V(0, 0.002, 0)), dir: [d.x, -0.25, d.z],
      });
      const t2 = end.clone().addScaledVector(d, 0.085).add(V(0, -0.012, 0));
      b.part(new THREE.ConeGeometry(0.014, 0.06, 6), P.black, {
        bone: ft, at: t2, dir: [d.x, -0.9, d.z],
      });
    }
  }
}
    return buildLegs;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P }: Ctx) {
  const rand = rng(77);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);
  const CYCLE = [P.magenta, P.marigold, P.turquoise, P.cobalt, P.violet, P.leaf, P.red, P.sky, P.jaguarOrange];

  // Batched small round dots: one merged part per colour and bone.
  const batches = new Map<string, { color: string; joint: any; geos: THREE.BufferGeometry[] }>();
  const dot = (color: string, joint: any, p: THREE.Vector3, r: number) => {
    const key = color + "|" + joint.name;
    let e = batches.get(key);
    if (!e) batches.set(key, (e = { color, joint, geos: [] }));
    e.geos.push(new THREE.SphereGeometry(r, 5, 4).translate(p.x, p.y, p.z));
  };

  // Flower: dark disc, ring of petals, gold centre.
  const flower = (at: THREE.Vector3, dir: THREE.Vector3, r: number, joint: any, petals: string[], disc: boolean, whiteRing: boolean) => {
    const n = dir.clone().normalize();
    const ref = Math.abs(n.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(n, ref).normalize();
    const v = new THREE.Vector3().crossVectors(n, u).normalize();
    if (disc) b.part(new THREE.CylinderGeometry(r * 1.25, r * 1.25, r * 0.25, 10), P.indigo, { at, dir: n.toArray(), bone: joint });
    const base = at.clone().addScaledVector(n, disc ? r * 0.2 : 0.004);
    const count = petals.length;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const p = base.clone().addScaledVector(u, Math.cos(a) * r * 0.72).addScaledVector(v, Math.sin(a) * r * 0.72);
      dot(petals[i], joint, p, r * 0.36);
    }
    dot(P.gold, joint, base.clone().addScaledVector(n, r * 0.12), r * 0.32);
    if (whiteRing)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        dot(P.white, joint, at.clone().addScaledVector(u, Math.cos(a) * r * 1.2).addScaledVector(v, Math.sin(a) * r * 1.2).addScaledVector(n, r * 0.1), r * 0.1);
      }
  };

  const outline = (L: number, w: number): [number, number][] => [
    [0, -w / 2], [L * 0.7, -w / 2], [L * 0.9, -w * 0.35], [L, 0], [L * 0.9, w * 0.35], [L * 0.7, w / 2], [0, w / 2],
  ];
  const tipOutline = (L: number, w: number): [number, number][] => [
    [0, -w / 2], [0.1 * L, -w / 2], [0.18 * L, -w * 0.3], [0.2 * L, 0], [0.18 * L, w * 0.3], [0.1 * L, w / 2], [0, w / 2],
  ];

  type FOpt = { under?: boolean; rachis?: string; tip?: string; dots?: number; dotColor?: string };
  const feather = (root: THREE.Vector3, d: THREE.Vector3, L: number, w: number, color: string, joint: any, o: FOpt = {}) => {
    const x = d.toArray() as [number, number, number];
    if (o.under)
      b.extrude(outline(L + 0.03, w + 0.03), {
        at: root.clone().addScaledVector(d, -0.015).add(V(0, -0.008, 0)), x, thickness: 0.012, color: P.indigo, bone: joint,
      });
    b.extrude(outline(L, w), { at: root, x, thickness: 0.012, color, bone: joint });
    if (o.tip)
      b.extrude(tipOutline(L, w), {
        at: root.clone().addScaledVector(d, L * 0.8).add(V(0, 0.003, 0)), x, thickness: 0.014, color: o.tip, bone: joint,
      });
    if (o.rachis)
      b.rod(root.clone().addScaledVector(d, L * 0.05).add(V(0, 0.007, 0)), root.clone().addScaledVector(d, L * 0.93).add(V(0, 0.007, 0)), 0.005, o.rachis, { bone: joint });
    const nd = o.dots ?? 0;
    for (let i = 0; i < nd; i++) {
      const f = 0.25 + (0.6 * i) / Math.max(1, nd - 1);
      dot(o.dotColor ?? P.white, joint, root.clone().addScaledVector(d, L * f).add(V(0, 0.009, 0)), 0.008);
    }
  };

  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const jS = J["wingShoulder" + side], jE = J["wingElbow" + side], jW = J["wingWrist" + side], jT = J["wingTip" + side];
    const S = jS.at.clone(), E = jE.at.clone(), W = jW.at.clone(), T = jT.at.clone();
    const shift = s === 1 ? 0 : 4;

    // Arm
    b.capsule(S, E, [0.1, 0.085], P.jaguarOrange, { bone: jS });
    b.capsule(E, W, [0.085, 0.065], P.jaguarOrange, { bone: jE });
    b.capsule(W, T, [0.065, 0.05], P.jaguarOrange, { bone: jW });
    b.part(new THREE.SphereGeometry(0.055, 6, 5), P.indigo, { at: T, bone: jT });

    const segs: [THREE.Vector3, THREE.Vector3, any, number, number][] = [
      [S, E, jS, 0.1, 0.085], [E, W, jE, 0.085, 0.065], [W, T, jW, 0.065, 0.05],
    ];
    for (const [a, c, j, r0, r1] of segs) {
      for (let i = 0; i < 4; i++) {
        const t = (i + 0.5) / 4;
        const r = r0 + (r1 - r0) * t;
        dot(P.indigo, j, lerpV(a, c, t).add(V(0, r * 0.92, -r * 0.1)), r * 0.28);
        // leading-edge dots
        dot(P.white, j, lerpV(a, c, t).add(V(0, r * 0.1, r * 0.95)), 0.014);
        dot(P.white, j, lerpV(a, c, t + 0.12).add(V(0, r * 0.1, r * 0.95)), 0.014);
      }
    }

    // Zigzag band on forearm
    for (let i = 0; i < 9; i++) {
      const t = 0.08 + (0.84 * i) / 8;
      const r = 0.085 + (0.065 - 0.085) * t;
      const p = lerpV(E, W, t).add(V(0, r * 0.9, 0));
      const up = i % 2 === 0 ? 1 : -1;
      b.part(new THREE.ConeGeometry(0.03, 0.06, 4), i % 2 ? P.cobalt : P.turquoise, {
        at: p.add(V(0, 0, -up * 0.02)), dir: [0, 0, -up], bone: jE,
      });
    }

    // Lesser coverts
    for (let i = 0; i < 8; i++) {
      const t = 0.1 + (0.85 * i) / 7;
      const root = lerpV(S, W, t).add(V(0, 0.034 + (i % 2) * 0.013, 0.0));
      const d = V(s * 0.05, 0, -1).normalize();
      const col = (i + shift) % 2 ? P.pink : P.cream;
      const j = t < 0.4 ? jS : t < 0.8 ? jE : jW;
      feather(root, d, 0.2, 0.09, col, j, {});
      flower(root.clone().addScaledVector(d, 0.09).add(V(0, 0.007, 0)), V(0, 1, 0), 0.03, j, [P.magenta, P.indigo, P.magenta, P.indigo, P.magenta], false, false);
    }

    // Greater coverts
    const gc = [P.turquoise, P.cobalt, P.lime];
    for (let i = 0; i < 8; i++) {
      const t = 0.12 + (0.83 * i) / 7;
      const root = lerpV(S, W, t).add(V(0, 0.016 + (i % 2) * 0.013, -0.05));
      const d = V(s * 0.05, 0, -1).normalize();
      const j = t < 0.4 ? jS : t < 0.8 ? jE : jW;
      feather(root, d, 0.3, 0.1, gc[(i + shift) % 3], j, { dots: 3, tip: i % 2 ? P.cream : undefined });
    }

    // Secondaries
    for (let i = 0; i < 9; i++) {
      const t = 0.06 + (0.88 * i) / 8;
      const root = lerpV(E, W, t).add(V(0, -0.02 + (i % 2) * 0.013, -0.06));
      const d = V(s * 0.12 * (t - 0.5), -0.03, -1).normalize();
      const col = CYCLE[(i + shift) % CYCLE.length];
      feather(root, d, 0.7, 0.17, col, jE, { rachis: P.indigo, tip: P.white, dots: 4 });
    }

    // Primaries
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const root = lerpV(W, T, t).add(V(0, -0.02 + (i % 2) * 0.012, -0.05));
      const d = V(s * (-0.08 + 0.3 * t), -0.02, -1).normalize();
      const col = CYCLE[(i * 2 + shift + 1) % CYCLE.length];
      feather(root, d, 0.78, 0.12, col, i < 4 ? jW : jT, { under: true, rachis: P.black, tip: P.cream, dots: 3, dotColor: P.cream });
      dot(P.indigo, i < 4 ? jW : jT, root.clone().addScaledVector(d, 0.74).add(V(0, 0.01, 0)), 0.01 + rand() * 0.002);
    }

    // Shoulder flower boss
    const bossAt = V(s * 0.34, 1.2, 0.25);
    flower(bossAt, V(s * 0.5, 1, 0.1), 0.13, jS, [P.pink, P.magenta, P.sky, P.cobalt, P.pink, P.magenta, P.sky, P.cobalt], true, true);
  }

  for (const e of batches.values()) {
    const merged = mergeGeometries(e.geos);
    if (merged) b.part(merged, e.color, { bone: e.joint, at: [0, 0, 0] });
  }
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const ORANGE = P.jaguarOrange, INDIGO = P.indigo, CREAM = P.cream, MAG = P.magenta;
  const WHITE = P.white, GOLD = P.gold, TURQ = P.turquoise;

  // Tail path through the joint positions
  const pts: number[][] = [
    [0, 0.9, -0.7],
    [0, 0.9, -0.8],
    [0, 0.92, -1.2],
    [0, 1.02, -1.55],
    [0, 1.2, -1.8],
  ];
  const path = catmull(pts);
  const tube = b.sweep(path, [0.1, 0.05], {
    bone: [J.tail1, J.tail2, J.tail3, J.tail4],
    color: ORANGE,
    bands: [
      [0.2, ORANGE], [0.28, INDIGO], [0.4, ORANGE], [0.47, CREAM], [0.58, ORANGE],
      [0.65, MAG], [0.78, ORANGE], [0.85, INDIGO], [1, ORANGE],
    ],
    sides: 8,
  });

  // Indigo dots spiralling
  for (let i = 0; i < 14; i++) {
    const t = 0.1 + (i / 14) * 0.85;
    const ang = (i * 70) % 360;
    const h = tube.at(t, ang);
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), i % 3 === 0 ? WHITE : INDIGO, h, { embed: 0.4 });
  }

  // Turquoise zigzag wedges on top
  for (let i = 0; i < 9; i++) {
    const t = 0.12 + i * 0.09;
    const h = tube.at(t, 0, 0);
    b.stick(new THREE.ConeGeometry(0.022, 0.05, 4), TURQ, h, {
      embed: 0.3,
      spin: i % 2 ? 45 : 0,
    });
  }

  // Rump flower on top of tailRoot
  const rootTop = tube.at(0.05, 0);
  const petalCols = [MAG, P.pink];
  b.ring(rootTop, { count: 6, radius: 0.045 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), petalCols[it.i % 2], it, { embed: 0.3 }),
  );
  b.stick(new THREE.SphereGeometry(0.028, 6, 4), GOLD, rootTop, { embed: 0.1 });

  // Plume fan at tail4
  const base = new THREE.Vector3(0, 1.2, -1.8);
  const cols = [P.red, P.marigold, MAG, TURQ, P.cobalt, P.violet, P.lime, P.red, P.marigold];
  const inner = [P.marigold, P.cobalt, P.lime, MAG, P.sky, P.pink, P.violet, P.cobalt, P.red];
  const N = 9;
  const blade: [number, number, string?][] = [
    [-0.06, 0], [0.06, 0], [0.09, 0.18], [0.05, 0.36], [0.07, 0.5], [0, 0.6, "sharp"], [-0.05, 0.42], [-0.08, 0.2],
  ] as any;
  const small = blade.map(([x, y, s]) => (s ? [x * 0.5, y * 0.7, "sharp"] : [x * 0.5, y * 0.7])) as any;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1) - 0.5; // -0.5..0.5
    const fan = f * 2; // -1..1
    const len = 0.85 + 0.15 * (1 - Math.abs(fan));
    // direction in a plane: back and up, fanned by roll about the Z-ish axis
    const roll = fan * 0.9;
    const up = Math.cos(roll) * 0.55 + 0.1;
    const back = -0.8;
    const side = Math.sin(roll) * 0.55;
    const dir = new THREE.Vector3(side, up, back).normalize();
    const x = new THREE.Vector3(1, 0, 0);
    const y = dir.clone();
    const at = base.clone().addScaledVector(dir, 0.03);
    const thickX = x.clone().sub(dir.clone().multiplyScalar(x.dot(dir))).normalize();
    b.extrude(blade as any, {
      at: at.toArray() as number[], x: thickX.toArray() as number[], y: y.toArray() as number[],
      thickness: 0.02, bevel: 0.004, smoothing: 1, color: cols[i], bone: J.tail4,
      // scale length via outline already; adjust below by dir
    });
    const at2 = base.clone().addScaledVector(dir, 0.1).addScaledVector(new THREE.Vector3(0, 0, 1), 0).add(new THREE.Vector3(0, 0, 0));
    const nrm = thickX.clone().cross(y).normalize();
    b.extrude(small as any, {
      at: at2.clone().addScaledVector(nrm, 0.012).toArray() as number[],
      x: thickX.toArray() as number[], y: y.toArray() as number[],
      thickness: 0.012, color: inner[i], bone: J.tail4,
    });
    for (let k = 0; k < 4; k++) {
      const p = base.clone().addScaledVector(dir, 0.14 + k * 0.1).addScaledVector(nrm, 0.02);
      b.part(new THREE.SphereGeometry(0.014, 6, 4), WHITE, { at: p.toArray() as number[], bone: J.tail4 });
    }
    void len;
  }

  // Rosette boss at plume base
  const bossAt = [0, 1.2, -1.76];
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10), INDIGO, { at: bossAt, bone: J.tail4, dir: [0, 0.5, -1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.03, 6, 4), i % 2 ? P.pink : MAG, {
      at: [Math.cos(a) * 0.07, 1.2 + Math.sin(a) * 0.07, -1.78], bone: J.tail4,
    });
  }
  b.part(new THREE.SphereGeometry(0.04, 8, 6), GOLD, { at: [0, 1.2, -1.8], bone: J.tail4 });

  // Vine tendrils with leaves
  for (const s of [1, -1]) {
    const vine = catmull([
      [s * 0.04, 1.22, -1.72],
      [s * 0.14, 1.3, -1.7],
      [s * 0.2, 1.4, -1.74],
      [s * 0.14, 1.46, -1.8],
      [s * 0.1, 1.42, -1.84],
    ]);
    b.sweep(vine, 0.008, { color: s > 0 ? P.leaf : P.lime, bone: J.tail4, sides: 5 });
    for (let k = 0; k < 3; k++) {
      const p = vine.at(0.35 + k * 0.25);
      b.part(new THREE.ConeGeometry(0.025, 0.07, 4), k % 2 ? P.lime : P.leaf, {
        at: [p.x, p.y, p.z], bone: J.tail4, dir: [s * 0.8, 0.5, 0.2 * (k - 1)],
      });
    }
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.86,-0.5], dir: [0,0,1], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["hips"], at: [0,0.88,-0.1], dir: [0,0,1], role: "spine" });
  J["spine2"] = b.joint("spine2", { parent: J["spine1"], at: [0,0.9,0.3], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine2"], at: [0,0.93,0.62], dir: [0,0.3,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1,0.72], dir: [0,0.8,0.5], role: "neck" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.18,0.84], dir: [0,0.8,0.3], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.38,0.92], dir: [0,0.1,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.36,1.02], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.9,-0.8], dir: [0,0,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.92,-1.2], dir: [0,0.1,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.02,-1.55], dir: [0,0.4,-1], role: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,1.2,-1.8], dir: [0,0.6,-0.8], role: "tail" });
  J["wingShoulderL"] = b.joint("wingShoulderL", { parent: J["spine2"], at: [0.3,1.1,0.25], dir: [1,0.3,-0.1], role: "wing" });
  J["wingElbowL"] = b.joint("wingElbowL", { parent: J["wingShoulderL"], at: [0.85,1.28,0.1], dir: [1,0.3,-0.1], role: "wing" });
  J["wingWristL"] = b.joint("wingWristL", { parent: J["wingElbowL"], at: [1.35,1.42,0.05], dir: [1,0.15,-0.1], role: "wing" });
  J["wingTipL"] = b.joint("wingTipL", { parent: J["wingWristL"], at: [1.7,1.5,0], dir: [1,0.15,-0.1], role: "wing" });
  J["wingShoulderR"] = b.joint("wingShoulderR", { parent: J["spine2"], at: [-0.3,1.1,0.25], dir: [-1,0.3,-0.1], role: "wing" });
  J["wingElbowR"] = b.joint("wingElbowR", { parent: J["wingShoulderR"], at: [-0.85,1.28,0.1], dir: [-1,0.3,-0.1], role: "wing" });
  J["wingWristR"] = b.joint("wingWristR", { parent: J["wingElbowR"], at: [-1.35,1.42,0.05], dir: [-1,0.15,-0.1], role: "wing" });
  J["wingTipR"] = b.joint("wingTipR", { parent: J["wingWristR"], at: [-1.7,1.5,0], dir: [-1,0.15,-0.1], role: "wing" });
  J["shoulderFL"] = b.joint("shoulderFL", { parent: J["chest"], at: [0.27,0.78,0.5], dir: [0,-1,0.1], role: "leg" });
  J["elbowFL"] = b.joint("elbowFL", { parent: J["shoulderFL"], at: [0.26,0.5,0.46], dir: [0,-1,0.2], role: "leg" });
  J["wristFL"] = b.joint("wristFL", { parent: J["elbowFL"], at: [0.25,0.2,0.56], dir: [0,-1,0.3], role: "leg" });
  J["pawFL"] = b.joint("pawFL", { parent: J["wristFL"], at: [0.25,0.06,0.66], dir: [0,0,1], role: "leg" });
  J["shoulderFR"] = b.joint("shoulderFR", { parent: J["chest"], at: [-0.27,0.78,0.5], dir: [0,-1,0.1], role: "leg" });
  J["elbowFR"] = b.joint("elbowFR", { parent: J["shoulderFR"], at: [-0.26,0.5,0.46], dir: [0,-1,0.2], role: "leg" });
  J["wristFR"] = b.joint("wristFR", { parent: J["elbowFR"], at: [-0.25,0.2,0.56], dir: [0,-1,0.3], role: "leg" });
  J["pawFR"] = b.joint("pawFR", { parent: J["wristFR"], at: [-0.25,0.06,0.66], dir: [0,0,1], role: "leg" });
  J["hipHL"] = b.joint("hipHL", { parent: J["hips"], at: [0.28,0.78,-0.5], dir: [0,-0.6,0.8], role: "leg" });
  J["kneeHL"] = b.joint("kneeHL", { parent: J["hipHL"], at: [0.3,0.5,-0.28], dir: [0,-0.4,-1], role: "leg" });
  J["hockHL"] = b.joint("hockHL", { parent: J["kneeHL"], at: [0.28,0.3,-0.62], dir: [0,-1,0.3], role: "leg" });
  J["footHL"] = b.joint("footHL", { parent: J["hockHL"], at: [0.28,0.06,-0.5], dir: [0,0,1], role: "leg" });
  J["hipHR"] = b.joint("hipHR", { parent: J["hips"], at: [-0.28,0.78,-0.5], dir: [0,-0.6,0.8], role: "leg" });
  J["kneeHR"] = b.joint("kneeHR", { parent: J["hipHR"], at: [-0.3,0.5,-0.28], dir: [0,-0.4,-1], role: "leg" });
  J["hockHR"] = b.joint("hockHR", { parent: J["kneeHR"], at: [-0.28,0.3,-0.62], dir: [0,-1,0.3], role: "leg" });
  J["footHR"] = b.joint("footHR", { parent: J["hockHR"], at: [-0.28,0.06,-0.5], dir: [0,0,1], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
