import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, offset } from "../../../../src/index";

export const meta = {
  "name": "Alebrije Jaguar-Eagle",
  "description": "A chunky painted-wood Oaxacan alebrije: a jaguar's body, legs and tail carrying an eagle's hooked-beak head and two spread feathered wings, covered in rosettes, dot rings, zigzag bands and swirls in saturated flat colours."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  coatOrange: "#ff8a1f",
  coatYellow: "#ffc61a",
  belly: "#fff1d0",
  inkBlack: "#1a1020",
  magenta: "#e0197d",
  pink: "#ff8fc0",
  turquoise: "#12b5b0",
  skyBlue: "#4cc3ff",
  deepBlue: "#1f3fa8",
  violet: "#7a2fb5",
  leafGreen: "#2fa84f",
  lime: "#9be02a",
  red: "#d6202a",
  beakYellow: "#ffd23f",
  beakOrange: "#f2780c",
  cream: "#fff7e0",
  woodBare: "#d9a566",
  eyeAmber: "#ffb000",
  gold: "#f2a900",
};
const M = {
  neckBase: [0, 1.15, 0.5] as [number, number, number],
  headCentre: [0, 1.7, 0.98] as [number, number, number],
  beakRoot: [0, 1.66, 1.12] as [number, number, number],
  jawHinge: [0, 1.6, 1.02] as [number, number, number],
  spineTop: [0, 1.42, 0] as [number, number, number],
  chestFront: [0, 1.1, 0.58] as [number, number, number],
  shoulderL: [0.3, 1.3, 0.25] as [number, number, number],
  shoulderR: [-0.3, 1.3, 0.25] as [number, number, number],
  foreShoulderL: [0.28, 0.98, 0.3] as [number, number, number],
  foreShoulderR: [-0.28, 0.98, 0.3] as [number, number, number],
  hindHipL: [0.28, 0.98, -0.6] as [number, number, number],
  hindHipR: [-0.28, 0.98, -0.6] as [number, number, number],
  footFL: [0.3, 0.07, 0.4] as [number, number, number],
  footFR: [-0.3, 0.07, 0.4] as [number, number, number],
  footBL: [0.3, 0.07, -0.42] as [number, number, number],
  footBR: [-0.3, 0.07, -0.42] as [number, number, number],
  tailRoot: [0, 0.98, -0.85] as [number, number, number],
  tailTip: [0, 1.35, -1.45] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const body = b.loft(
    [
      { at: [0, 1.0, -0.85], w: 0.4, h: 0.4 },
      { at: [0, 1.0, -0.55], w: 0.62, h: 0.58 },
      { at: [0, 1.03, -0.1], w: 0.5, h: 0.52 },
      { at: [0, 1.08, 0.3], w: 0.68, h: 0.7 },
      { at: [0, 1.1, 0.58], w: 0.5, h: 0.55 },
    ],
    {
      bone: [J.hips, J.spine, J.chest],
      color: P.coatOrange,
      sectors: [
        [-70, 70, P.coatYellow],
        [130, 230, P.belly],
      ],
    },
  );
  const skin = b.surface(body);
  const R = rng(5);

  const disc = (r: number, h: number, c: string, hit: any, e = 0.3) =>
    b.stick(new THREE.CylinderGeometry(r, r, h, 8), c, hit, { embed: e });

  const rosette = (hit: any, s: number) => {
    disc(0.075 * s, 0.014, P.inkBlack, hit, 0.5);
    const top = hit.moved([0, 0.006, 0]);
    const n = 6;
    b.ring(top, { count: n, radius: 0.047 * s }, (it: any) =>
      b.stick(new THREE.CylinderGeometry(0.014 * s, 0.014 * s, 0.01, 6), R() > 0.5 ? P.magenta : P.deepBlue, it, { embed: 0.2 }),
    );
    disc(0.024 * s, 0.012, P.turquoise, hit.moved([0, 0.012, 0]), 0.2);
  };

  // flank rosettes
  for (const s of [1, -1]) {
    const hits = skin.scatter(14, {
      rng: rng(10 + (s > 0 ? 1 : 0)),
      minDist: 0.15,
      filter: (h: any) =>
        h.n.x * s > 0.55 &&
        Math.abs(h.n.y) < 0.6 &&
        h.at.y > 0.95 &&
        h.at.z > -0.7 &&
        h.at.z < 0.5 &&
        !(h.at.y > 1.2 && h.at.z > 0.1) &&
        !(h.at.y < 1.1 && (h.at.z > 0.15 || h.at.z < -0.4)),
    });
    for (const h of hits) rosette(h, 0.9);
  }

  // saddle stripe with trim and studs
  const pts = [0.4, 0.2, 0, -0.2, -0.4, -0.7];
  for (let i = 0; i < pts.length - 1; i++) {
    const z0 = pts[i],
      z1 = pts[i + 1];
    const a = skin.around([0, 1.05, (z0 + z1) / 2]).at(0, 89);
    if (a) {
      b.stick(new THREE.BoxGeometry(0.2, 0.012, Math.abs(z0 - z1) + 0.01), P.deepBlue, a, { embed: 0.5 });
    }
  }
  for (let i = 0; i < 12; i++) {
    const z = 0.4 - i * 0.092;
    const c = [0, 1.05, z] as [number, number, number];
    const top = skin.around(c).at(0, 89);
    if (top) {
      b.stick(new THREE.ConeGeometry(0.025, 0.06, 6), P.gold, top, { embed: 0.2 });
    }
    for (const s of [1, -1]) {
      const e = skin.around(c).at(s * 38, 62);
      if (e) {
        b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.cream, e, { embed: 0.3 });
        const t = skin.around([0, 1.05, z - 0.046]).at(s * 28, 66);
        if (t) b.stick(new THREE.ConeGeometry(0.03, 0.04, 3), P.magenta, t, { embed: 0.3 });
      }
    }
  }

  // belly zigzag bands
  for (let i = 0; i < 7; i++) {
    const z = -0.5 + i * 0.15;
    const h = skin.around([0, 1.05, z]).at(180, -80);
    if (h) b.stick(new THREE.BoxGeometry(0.28, 0.01, 0.045), i % 2 ? P.violet : P.skyBlue, h, { embed: 0.4 });
  }

  // chest collar of leaves
  const loop = skin.loop([0, 1.1, 0.5], { dir: [0, 0, 1], lift: 0.01 });
  let k = 0;
  b.along(loop, 16, (at: any) => {
    b.stick(new THREE.ConeGeometry(0.04, 0.12, 4), k % 2 ? P.lime : P.leafGreen, at, { embed: 0.2 });
    b.stick(new THREE.SphereGeometry(0.012, 5, 4), P.cream, at.moved([0, 0.1, 0]), { embed: 0 });
    k++;
  });

  // shoulder swirl and socket dots
  for (const s of [1, -1]) {
    const path = [
      [s * 0.3, 1.25, 0.25],
      [s * 0.33, 1.22, 0.05],
      [s * 0.31, 1.15, -0.2],
      [s * 0.28, 1.1, -0.35],
    ];
    b.sweep(skin.drape(path, { lift: 0.008 }), 0.012, { color: P.magenta });
    for (const sock of [M.foreShoulderL, M.hindHipL]) {
      const h = skin.nearest([s * sock[0], sock[1], sock[2]]);
      b.ring(h, { count: 8, radius: 0.13 }, (it: any) =>
        b.stick(new THREE.SphereGeometry(0.014, 5, 4), P.cream, it, { embed: 0.3 }),
      );
    }
    const hh = skin.around([0, 1.0, -0.55]).at(s * 80, 25);
    if (hh) rosette(hh, 0.6);
  }
}
    return buildTorso;
  })(),
  // eagleHead
  (() => {
function buildEagleHead({ b, J, P, M }: any) {
  const head = J.head, jaw = J.jaw;
  const geo = (g: THREE.BufferGeometry) => g;
  const part = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const sph = (r: number, c: string, at: number[], bone: any, sc?: number[]) =>
    part(new THREE.SphereGeometry(r, 8, 6), c, at, bone, sc ? { scale: sc } : {});

  // neck sweep
  b.sweep([M.neckBase, [0, 1.4, 0.72], [0, 1.62, 0.9]], [0.25, 0.2], {
    bone: [J.neck1, J.neck2, head], color: P.turquoise, sides: 8,
  });

  // ruff of feather blades in rings
  const ringCols = [P.cream, P.beakYellow, P.magenta, P.violet];
  const blade = new THREE.ConeGeometry(0.07, 0.24, 4);
  const edge = new THREE.ConeGeometry(0.085, 0.27, 4);
  ringCols.forEach((col, k) => {
    const y = 1.2 + k * 0.1, z = 0.5 + k * 0.1, rad = 0.3 - k * 0.025;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + k * 0.3;
      const p = [Math.sin(a) * rad, y, z + Math.cos(a) * rad * 0.9];
      const dir: number[] = [Math.sin(a), -0.7, Math.cos(a)];
      part(edge, P.inkBlack, p, J.neck1, { dir });
      part(blade, col, [p[0] * 1.02, p[1] + 0.005, p[2]], J.neck1, { dir });
    }
  });

  // skull
  const HC = M.headCentre;
  sph(0.21, P.turquoise, HC, head);
  for (const s of [1, -1]) {
    // brow ridge
    part(new THREE.BoxGeometry(0.12, 0.04, 0.12), P.skyBlue, [s * 0.14, 1.82, 1.07], head, { rotation: [0, 0, -s * 15] });
    // eye
    const ex = s * 0.155, ey = 1.74, ez = 1.07;
    const d = [s * 0.8, 0.1, 0.6];
    const eye = (r: number, c: string, off: number, h = 0.02) =>
      part(new THREE.CylinderGeometry(r, r, h, 10), c, [ex + s * off * 0.8, ey, ez + off * 0.6], head, { dir: d });
    eye(0.075, P.inkBlack, 0);
    eye(0.062, P.cream, 0.01);
    eye(0.046, P.eyeAmber, 0.02);
    eye(0.028, P.inkBlack, 0.03);
    part(new THREE.SphereGeometry(0.01, 5, 4), P.cream, [ex + s * 0.05, ey + 0.02, ez + 0.05], head);
    // eyebrow blade
    part(new THREE.ConeGeometry(0.035, 0.2, 4), P.magenta, [s * 0.14, 1.87, 1.1], head, { dir: [s * 0.6, 0.2, -0.6] });
    // cheek discs
    const cx = s * 0.19, cy = 1.62, cz = 1.0, cd = [s, 0, 0.3];
    part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 10), P.pink, [cx, cy, cz], head, { dir: cd });
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), P.deepBlue, [cx + s * 0.005, cy, cz], head, { dir: cd });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * 6.283;
      part(new THREE.SphereGeometry(0.012, 5, 4), P.deepBlue, [cx + s * 0.01, cy + Math.sin(a) * 0.052, cz + Math.cos(a) * 0.052], head);
    }
    // neck side swirl dots
    for (let i = 0; i < 5; i++)
      sph(0.016, i % 2 ? P.pink : P.magenta, [s * (0.225 - i * 0.004), 1.5 - i * 0.07, 0.84 - i * 0.05 + Math.sin(i) * 0.03], J.neck2);
    // nostrils
    part(new THREE.SphereGeometry(0.014, 5, 4), P.inkBlack, [s * 0.04, 1.69, 1.27], head);
  }

  // upper beak
  part(new THREE.ConeGeometry(0.15, 0.4, 6), P.beakOrange, [0, 1.66, 1.2], head, { dir: [0, 0, 1] });
  part(new THREE.ConeGeometry(0.12, 0.42, 6), P.beakYellow, [0, 1.65, 1.32], head, { dir: [0, 0, 1] });
  part(new THREE.ConeGeometry(0.05, 0.14, 6), P.beakYellow, [0, 1.6, 1.58], head, { dir: [0, -0.8, 0.6] });
  // lower beak
  part(new THREE.ConeGeometry(0.1, 0.4, 6), P.beakOrange, [0, 1.57, 1.27], jaw, { dir: [0, 0, 1], scale: [1, 1, 0.8] });
  b.rod([0.0, 1.605, 1.1], [0, 1.605, 1.44], 0.01, P.inkBlack, { bone: head });

  // crest
  const cols = [P.magenta, P.beakYellow, P.lime, P.skyBlue];
  for (let i = 0; i < 8; i++) {
    const t = i / 7, ang = (t - 0.5) * 2.0;
    const len = 0.3 - Math.abs(t - 0.5) * 0.12;
    const dir = [Math.sin(ang) * 0.5, 1, -0.25 - Math.abs(t - 0.5) * 0.2];
    const base = [Math.sin(ang) * 0.1, 1.84, 0.95];
    part(new THREE.ConeGeometry(0.06, len + 0.03, 4), P.inkBlack, base, head, { dir });
    part(new THREE.ConeGeometry(0.052, len, 4), cols[i % 4], [base[0], base[1] + 0.01, base[2]], head, { dir });
    part(new THREE.SphereGeometry(0.018, 5, 4), P.cream, [base[0] + dir[0] * len * 0.45, base[1] + len * 0.5, base[2] + dir[2] * len * 0.45], head);
  }
}
    return buildEagleHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const cyc = [P.coatOrange, P.red, P.magenta, P.violet, P.leafGreen, P.lime, P.turquoise];
  const leaf = (len: number, w: number): [number, number][] => [
    [0, 0], [w * 0.5, len * 0.25], [w * 0.5, len * 0.7], [0, len], [-w * 0.5, len * 0.7], [-w * 0.5, len * 0.25],
  ];
  const sph = (r: number) => new THREE.SphereGeometry(r, 6, 4);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = J["wingShoulder" + S], el = J["wingElbow" + S], wr = J["wingWrist" + S], tip = J["wingTip" + S];
    const sec = J["secondaries" + S], pri = J["primaries" + S];
    const pts: [number, number, number][] = [
      [s * 0.32, 1.3, 0.25], [s * 0.85, 1.45, 0.15], [s * 1.3, 1.6, 0.1], [s * 1.62, 1.68, 0.05],
    ];
    const chain = pts.map((p) => new THREE.Vector3(...p));
    b.sweep(pts, [0.1, 0.05], { color: P.magenta, bone: [sh, el, wr, tip], sides: 8 });

    // feather helper: flat blade lying in the horizontal plane, pointing along dir
    const blade = (at: THREE.Vector3, dir: number[], len: number, w: number, col: string, bone: any, dots?: string, stripe?: string) => {
      const d = new THREE.Vector3(...dir).normalize();
      const n = new THREE.Vector3(0, 1, 0);
      const x = new THREE.Vector3().crossVectors(d, n).normalize();
      const ink = b.extrude(leaf(len + 0.03, w + 0.03), { at: at.clone().addScaledVector(n, -0.004).addScaledVector(d, -0.015), x: x.toArray() as any, y: d.toArray() as any, thickness: 0.016, color: P.inkBlack, bone, smoothing: 1 });
      b.extrude(leaf(len, w), { at, x: x.toArray() as any, y: d.toArray() as any, thickness: 0.02, bevel: 0.004, color: col, bone, smoothing: 1 });
      if (stripe)
        b.rod(at.clone().addScaledVector(d, len * 0.1).addScaledVector(n, 0.012), at.clone().addScaledVector(d, len * 0.85).addScaledVector(n, 0.012), 0.008, stripe, { bone });
      if (dots)
        b.part(sph(w * 0.17), dots, { bone, at: at.clone().addScaledVector(d, len * 0.82).addScaledVector(n, 0.014) });
    };

    // secondaries
    const eo = chain[1], wo = chain[2];
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const at = eo.clone().lerp(wo, t).add(new THREE.Vector3(0, -0.02 + 0.002 * i, -0.06));
      const dir = [s * (0.15 + 0.1 * t), 0, -1];
      const len = 0.55 - 0.03 * Math.abs(t - 0.5);
      blade(at, dir, len, 0.17, i % 2 ? P.deepBlue : P.skyBlue, sec, P.cream, P.violet);
      const d = new THREE.Vector3(...dir).normalize();
      b.part(sph(0.03), P.violet, { bone: sec, at: at.clone().addScaledVector(d, len * 0.95).add(new THREE.Vector3(0, 0.012, 0)) });
    }
    // primaries
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const at = wo.clone().lerp(chain[3], t * 0.6).add(new THREE.Vector3(0, -0.015, -0.03));
      const a = (0.1 + t * 1.0) ;
      const dir = [s * Math.sin(a) * 1.0 + s * 0.05, 0, -Math.cos(a) * 0.9 - 0.1];
      const len = 0.9 - 0.2 * Math.abs(t - 0.3);
      blade(at, dir, len, 0.15, cyc[i], pri, P.cream, P.inkBlack);
    }
    // thumb feathers
    for (let i = 0; i < 3; i++) {
      const at = wo.clone().add(new THREE.Vector3(s * 0.05 * i, 0.05, 0.05));
      blade(at, [s * (0.6 + 0.3 * i), 0, 0.5 - 0.3 * i], 0.22, 0.08, P.lime, wr, P.cream);
    }
    // coverts: 3 rows
    const rows = [P.coatYellow, P.turquoise, P.magenta];
    for (let r = 0; r < 3; r++) {
      const n = 5 - r;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const p = chain[0].clone().lerp(chain[2], 0.12 + 0.8 * t);
        const at = p.clone().add(new THREE.Vector3(0, 0.07 + r * 0.012, 0.06 - r * 0.07));
        const len = 0.2 - r * 0.02;
        const d = new THREE.Vector3(0, 0, -1);
        const x = new THREE.Vector3(1, 0, 0);
        const bone = i < 2 ? sh : el;
        b.extrude(leaf(len + 0.025, 0.2), { at: at.clone().add(new THREE.Vector3(0, -0.003, 0.012)), x: x.toArray() as any, y: d.toArray() as any, thickness: 0.016, color: P.inkBlack, bone, smoothing: 1 });
        b.extrude(leaf(len, 0.19), { at, x: x.toArray() as any, y: d.toArray() as any, thickness: 0.02, bevel: 0.004, color: rows[r], bone, smoothing: 1 });
        b.part(sph(0.012), P.cream, { bone, at: at.clone().add(new THREE.Vector3(0, 0.014, -len * 0.75)) });
      }
    }
    // shoulder rosette
    const c = new THREE.Vector3(s * 0.34, 1.42, 0.25);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), P.inkBlack, { bone: sh, at: c });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(sph(0.02), k % 2 ? P.magenta : P.skyBlue, { bone: sh, at: c.clone().add(new THREE.Vector3(Math.cos(a) * 0.052, 0.012, Math.sin(a) * 0.052)) });
    }
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.026, 8), P.turquoise, { bone: sh, at: c.clone().add(new THREE.Vector3(0, 0.004, 0)) });
  }
}
    return buildWings;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const lerp = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);

  // dots in a ring around a segment axis
  function ringDots(c: THREE.Vector3, dir: THREE.Vector3, rad: number, n: number, size: number, color: string, bone: any, phase = 0) {
    const d = dir.clone().normalize();
    const ref = Math.abs(d.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(d, ref).normalize();
    const w = new THREE.Vector3().crossVectors(d, u).normalize();
    for (let i = 0; i < n; i++) {
      const a = phase + (i / n) * Math.PI * 2;
      const p = c.clone().addScaledVector(u, Math.cos(a) * rad).addScaledVector(w, Math.sin(a) * rad);
      b.part(new THREE.SphereGeometry(size, 6, 4), color, { at: p, bone });
    }
  }
  function band(a: THREE.Vector3, c: THREE.Vector3, t: number, r0: number, r1: number, color: string, bone: any) {
    const ctr = lerp(a, c, t);
    const r = r0 + (r1 - r0) * t + 0.012;
    const dir = c.clone().sub(a);
    b.part(new THREE.CylinderGeometry(r + 0.006, r + 0.006, 0.014, 8), P.inkBlack, { at: lerp(a, c, t - 0.075), dir, bone });
    b.part(new THREE.CylinderGeometry(r + 0.006, r + 0.006, 0.014, 8), P.inkBlack, { at: lerp(a, c, t + 0.075), dir, bone });
    b.part(new THREE.CylinderGeometry(r + 0.012, r + 0.012, 0.11, 8), color, { at: ctr, dir, bone });
  }
  function seg(a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, bone: any, color: string) {
    b.rod(a, c, [r0, r1], color, { bone, sides: 8, caps: "round" });
  }

  const legs = [
    { n: "FL", s: 1, f: "footFL", pts: ["shoulderFL", "elbowFL", "wristFL", "pawFL"], hind: false },
    { n: "FR", s: -1, f: "footFR", pts: ["shoulderFR", "elbowFR", "wristFR", "pawFR"], hind: false },
    { n: "BL", s: 1, f: "footBL", pts: ["hipBL", "kneeBL", "ankleBL", "pawBL"], hind: true },
    { n: "BR", s: -1, f: "footBR", pts: ["hipBR", "kneeBR", "ankleBR", "pawBR"], hind: true },
  ];

  for (const L of legs) {
    const js = L.pts.map((k) => J[k]);
    const p = js.map((j: any) => j.at.clone() as THREE.Vector3);
    const foot = V(M[L.f]);
    const pawC = new THREE.Vector3(foot.x, 0.08, foot.z + 0.04);
    p[3] = pawC.clone();

    // joint balls
    b.part(new THREE.SphereGeometry(0.19, 8, 6), P.coatYellow, { at: p[0], bone: js[0] });
    ringDots(p[0], new THREE.Vector3(0, -1, 0), 0.17, 8, 0.016, P.cream, js[0]);

    // limb segments
    seg(p[0], p[1], 0.15, 0.11, js[0], P.coatOrange);
    seg(p[1], p[2], 0.11, 0.1, js[1], P.coatOrange);
    seg(p[2], p[3], 0.1, 0.1, js[2], P.beakYellow);
    b.part(new THREE.SphereGeometry(0.115, 8, 6), P.coatOrange, { at: p[1], bone: js[1] });

    // socks
    band(p[1], p[2], 0.3, 0.11, 0.1, P.turquoise, js[1]);
    band(p[1], p[2], 0.7, 0.11, 0.1, P.magenta, js[1]);
    band(p[0], p[1], 0.82, 0.15, 0.11, P.cream, js[0]);
    ringDots(lerp(p[1], p[2], 0.5), p[2].clone().sub(p[1]), 0.118, 8, 0.012, P.cream, js[1], 0.2);
    ringDots(lerp(p[0], p[1], 0.62), p[1].clone().sub(p[0]), 0.135, 8, 0.012, P.cream, js[0], 0.2);

    // rosette on outer side of upper leg
    const rc = lerp(p[0], p[1], 0.4);
    const outN = new THREE.Vector3(L.s, 0, 0);
    const rBase = rc.clone().addScaledVector(outN, 0.13);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.016, 10), P.inkBlack, { at: rBase, dir: outN, bone: js[0] });
    const nd = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const q = rBase.clone().add(new THREE.Vector3(0, Math.cos(a) * 0.052, Math.sin(a) * 0.052)).addScaledVector(outN, 0.01);
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.014, 6), i % 2 ? P.deepBlue : P.magenta, { at: q, dir: outN, bone: js[0] });
    }
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 8), P.turquoise, { at: rBase.clone().addScaledVector(outN, 0.012), dir: outN, bone: js[0] });
    void nd;

    // violet zigzag on inside edge of lower leg
    const inN = new THREE.Vector3(-L.s, 0, 0);
    const zs = lerp(p[1], p[2], 0.1), ze = lerp(p[1], p[2], 0.9);
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const q = lerp(zs, ze, t).addScaledVector(inN, 0.1 + 0.0);
      q.z += (i % 2 ? 0.02 : -0.02);
      b.part(new THREE.BoxGeometry(0.014, 0.05, 0.03), i % 2 ? P.violet : P.skyBlue, { at: q, rotation: [0, 0, (i % 2 ? 25 : -25)], bone: js[1] });
    }
    // upper inside zigzag
    for (let i = 0; i < 5; i++) {
      const q = lerp(p[0], p[1], 0.15 + i * 0.14).addScaledVector(inN, 0.13);
      q.z += (i % 2 ? 0.02 : -0.02);
      b.part(new THREE.BoxGeometry(0.014, 0.05, 0.03), P.violet, { at: q, rotation: [0, 0, i % 2 ? 25 : -25], bone: js[0] });
    }

    // paw
    const pawBone = js[3];
    b.part(new THREE.SphereGeometry(1, 8, 6), P.beakYellow, { at: pawC, scale: [0.13, 0.08, 0.17], bone: pawBone });
    // underside pad
    b.part(new THREE.CylinderGeometry(0.085, 0.09, 0.012, 8), P.woodBare, { at: [pawC.x, 0.004, pawC.z - 0.01], bone: pawBone });
    b.part(new THREE.CylinderGeometry(0.05, 0.055, 0.014, 6), P.inkBlack, { at: [pawC.x, 0.007, pawC.z - 0.02], bone: pawBone });
    // toes + claws
    for (let i = -1; i <= 1; i++) {
      const tx = foot.x + i * 0.07;
      const tz = foot.z + 0.17 - Math.abs(i) * 0.025;
      b.part(new THREE.SphereGeometry(0.048, 7, 5), P.beakYellow, { at: [tx, 0.055, tz], bone: pawBone });
      b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.01, 7), P.inkBlack, { at: [tx, 0.052, tz + 0.001], scale: [1, 1, 1], bone: pawBone, rotation: [0, 0, 0] });
      b.part(new THREE.SphereGeometry(0.04, 7, 5), P.beakYellow, { at: [tx, 0.06, tz], bone: pawBone });
      b.part(new THREE.ConeGeometry(0.025, 0.1, 6), P.cream, { at: [tx, 0.04, tz + 0.07], dir: [0, -0.45, 1], bone: pawBone });
      b.part(new THREE.ConeGeometry(0.012, 0.04, 6), P.woodBare, { at: [tx, 0.016, tz + 0.115], dir: [0, -0.45, 1], bone: pawBone });
    }
    // cream dots across top of paw
    for (let i = 0; i < 5; i++) {
      const tx = foot.x + (i - 2) * 0.045;
      b.part(new THREE.SphereGeometry(0.011, 6, 4), P.cream, { at: [tx, 0.153 - Math.abs(i - 2) * 0.012, foot.z - 0.01], bone: pawBone });
    }
    // ankle ruff band above paw
    band(p[2], p[3], 0.25, 0.1, 0.1, P.magenta, js[2]);
    void R;
  }
}
    return buildLegs;
  })(),
  // tailPlume
  (() => {
function buildTailPlume({ b, J, P, M }: any) {
  const R = rng(5);
  const pts = [
    [0, 0.98, -0.85],
    [0, 0.95, -1.1],
    [0, 1.0, -1.28],
    [0, 1.15, -1.42],
    [0, 1.35, -1.45],
  ];
  const path = catmull(pts);
  const chain = [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5];
  const tail = b.sweep(path, (t: number) => 0.13 - 0.06 * t, {
    bone: chain,
    sides: 8,
    color: P.coatOrange,
    bands: [
      [0.3, P.coatOrange],
      [0.55, P.coatOrange],
      [1, P.coatOrange],
    ],
  });

  // ink ring bands with colored zigzag bands between
  const cols = [P.turquoise, P.magenta];
  for (let i = 0; i < 7; i++) {
    const t = 0.1 + i * 0.12;
    const at = tail.at(t, 0);
    const r = at.radius;
    const ring = b.ring(frame(path.at(t), path.tangentAt(t)), { count: 8, radius: r * 0.98 });
    const ink = new THREE.TorusGeometry(r * 1.02, 0.012, 4, 10);
    b.part(ink, P.inkBlack, { at: path.at(t), dir: path.tangentAt(t), axis: "z", bone: J.tail2 });
    if (i < 6) {
      const t2 = t + 0.06;
      const rr = tail.at(t2, 0).radius;
      b.part(new THREE.TorusGeometry(rr * 1.02, 0.018, 4, 8), cols[i % 2], {
        at: path.at(t2),
        dir: path.tangentAt(t2),
        axis: "z",
        bone: J.tail3,
      });
      ring.items.forEach((it: any, k: number) => {
        if (k % 2 === 0) b.stick(new THREE.SphereGeometry(0.014, 5, 3), P.cream, it, { bone: J.tail3 });
      });
    }
  }

  // gold studs on tail root
  for (let i = 0; i < 4; i++) {
    const h = tail.at(0.04 + i * 0.07, 0);
    b.stick(new THREE.ConeGeometry(0.03, 0.05, 6), P.gold, h);
  }

  // gold cuff at tail5
  const cp = path.at(0.92);
  const ct = path.tangentAt(0.92);
  b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 8), P.gold, { at: cp, dir: ct, bone: J.tail5 });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.012, 4, 3), P.cream, {
      at: [cp.x + Math.sin(a) * 0.112, cp.y + Math.cos(a) * 0.112, cp.z - 0.0],
      bone: J.tail5,
    });
  }

  // feather fan
  const base = [0, 1.37, -1.46];
  const fc = [P.leafGreen, P.turquoise, P.deepBlue, P.lime, P.violet];
  const n = 10;
  const outline: any = [
    [0, 0],
    [0.07, 0.12],
    [0.08, 0.3],
    [0.05, 0.43],
    [0, 0.48],
    [-0.05, 0.43],
    [-0.08, 0.3],
    [-0.07, 0.12],
  ];
  for (let i = 0; i < n; i++) {
    const a = ((i - (n - 1) / 2) / (n - 1)) * 2.2; // side angle
    const dirv = new THREE.Vector3(Math.sin(a) * 0.9, 0.55 + Math.cos(a) * 0.3, -0.7 * Math.cos(a)).normalize();
    const xdir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a) * 0.6).normalize();
    const c = fc[i % fc.length];
    const f = b.extrude(outline, {
      at: base,
      x: xdir.toArray(),
      y: dirv.toArray(),
      thickness: 0.018,
      bevel: 0.005,
      smoothing: 1,
      color: c,
      bone: J.plume,
    });
    const put = (u: number, v: number, sx: number, sy: number, col: string, z: number) =>
      b.part(new THREE.CylinderGeometry(1, 1, 0.006, 8), col, {
        at: f.local([u, v, z]),
        dir: f.axis,
        scale: [sx, 1, sy],
        bone: J.plume,
      });
    b.rod(f.local([0, 0.05, 0.011]), f.local([0, 0.4, 0.011]), 0.006, P.inkBlack, { bone: J.plume });
    put(0, 0.36, 0.05, 0.065, P.inkBlack, 0.011);
    put(0, 0.36, 0.038, 0.05, P.skyBlue, 0.014);
    put(0, 0.36, 0.026, 0.034, P.magenta, 0.017);
    put(0, 0.36, 0.01, 0.014, P.cream, 0.02);
  }
}
    return buildTailPlume;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,1,-0.55], dir: [0,0.1,1], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,1.05,-0.1], dir: [0,0.05,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,1.1,0.3], dir: [0,0.1,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.15,0.5], dir: [0,0.6,0.8], role: "neck" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.4,0.72], dir: [0,0.5,0.85], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.62,0.9], dir: [0,0.05,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.6,1.02], dir: [0,0,1], role: "jaw" });
  J["shoulderFL"] = b.joint("shoulderFL", { parent: J["chest"], at: [0.28,0.98,0.3], dir: [0.05,-0.9,-0.05], role: "leg", group: "legs" });
  J["elbowFL"] = b.joint("elbowFL", { parent: J["shoulderFL"], at: [0.3,0.55,0.25], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["wristFL"] = b.joint("wristFL", { parent: J["elbowFL"], at: [0.3,0.22,0.3], dir: [0,-0.3,1], role: "leg", group: "legs" });
  J["pawFL"] = b.joint("pawFL", { parent: J["wristFL"], at: [0.3,0.1,0.4], dir: [0,0,1], role: "leg", group: "legs" });
  J["shoulderFR"] = b.joint("shoulderFR", { parent: J["chest"], at: [-0.28,0.98,0.3], dir: [-0.05,-0.9,-0.05], role: "leg", group: "legs" });
  J["elbowFR"] = b.joint("elbowFR", { parent: J["shoulderFR"], at: [-0.3,0.55,0.25], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["wristFR"] = b.joint("wristFR", { parent: J["elbowFR"], at: [-0.3,0.22,0.3], dir: [0,-0.3,1], role: "leg", group: "legs" });
  J["pawFR"] = b.joint("pawFR", { parent: J["wristFR"], at: [-0.3,0.1,0.4], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipBL"] = b.joint("hipBL", { parent: J["hips"], at: [0.28,0.98,-0.6], dir: [0.05,-0.9,0.35], role: "leg", group: "legs" });
  J["kneeBL"] = b.joint("kneeBL", { parent: J["hipBL"], at: [0.3,0.58,-0.45], dir: [0,-0.6,-0.8], role: "leg", group: "legs" });
  J["ankleBL"] = b.joint("ankleBL", { parent: J["kneeBL"], at: [0.3,0.3,-0.68], dir: [0,-0.5,0.85], role: "leg", group: "legs" });
  J["pawBL"] = b.joint("pawBL", { parent: J["ankleBL"], at: [0.3,0.1,-0.5], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipBR"] = b.joint("hipBR", { parent: J["hips"], at: [-0.28,0.98,-0.6], dir: [-0.05,-0.9,0.35], role: "leg", group: "legs" });
  J["kneeBR"] = b.joint("kneeBR", { parent: J["hipBR"], at: [-0.3,0.58,-0.45], dir: [0,-0.6,-0.8], role: "leg", group: "legs" });
  J["ankleBR"] = b.joint("ankleBR", { parent: J["kneeBR"], at: [-0.3,0.3,-0.68], dir: [0,-0.5,0.85], role: "leg", group: "legs" });
  J["pawBR"] = b.joint("pawBR", { parent: J["ankleBR"], at: [-0.3,0.1,-0.5], dir: [0,0,1], role: "leg", group: "legs" });
  J["wingShoulderL"] = b.joint("wingShoulderL", { parent: J["chest"], at: [0.32,1.3,0.25], dir: [1,0.25,-0.05], role: "wing", group: "wings" });
  J["wingElbowL"] = b.joint("wingElbowL", { parent: J["wingShoulderL"], at: [0.85,1.45,0.15], dir: [1,0.15,0], role: "wing", group: "wings" });
  J["wingWristL"] = b.joint("wingWristL", { parent: J["wingElbowL"], at: [1.3,1.6,0.1], dir: [1,0.1,0], role: "wing", group: "wings" });
  J["wingTipL"] = b.joint("wingTipL", { parent: J["wingWristL"], at: [1.6,1.68,0.05], dir: [1,0.1,0], role: "wing", group: "wings" });
  J["secondariesL"] = b.joint("secondariesL", { parent: J["wingElbowL"], at: [0.85,1.45,0.1], dir: [0.2,0,-1], role: "fan", group: "wings" });
  J["primariesL"] = b.joint("primariesL", { parent: J["wingWristL"], at: [1.3,1.6,0.05], dir: [0.5,0,-1], role: "fan", group: "wings" });
  J["wingShoulderR"] = b.joint("wingShoulderR", { parent: J["chest"], at: [-0.32,1.3,0.25], dir: [-1,0.25,-0.05], role: "wing", group: "wings" });
  J["wingElbowR"] = b.joint("wingElbowR", { parent: J["wingShoulderR"], at: [-0.85,1.45,0.15], dir: [-1,0.15,0], role: "wing", group: "wings" });
  J["wingWristR"] = b.joint("wingWristR", { parent: J["wingElbowR"], at: [-1.3,1.6,0.1], dir: [-1,0.1,0], role: "wing", group: "wings" });
  J["wingTipR"] = b.joint("wingTipR", { parent: J["wingWristR"], at: [-1.6,1.68,0.05], dir: [-1,0.1,0], role: "wing", group: "wings" });
  J["secondariesR"] = b.joint("secondariesR", { parent: J["wingElbowR"], at: [-0.85,1.45,0.1], dir: [-0.2,0,-1], role: "fan", group: "wings" });
  J["primariesR"] = b.joint("primariesR", { parent: J["wingWristR"], at: [-1.3,1.6,0.05], dir: [-0.5,0,-1], role: "fan", group: "wings" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.98,-0.85], dir: [0,0,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.95,-1.1], dir: [0,0.05,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1,-1.28], dir: [0,0.4,-1], role: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,1.15,-1.42], dir: [0,1,-0.2], role: "tail" });
  J["tail5"] = b.joint("tail5", { parent: J["tail4"], at: [0,1.35,-1.45], dir: [0,1,-0.2], role: "tail" });
  J["plume"] = b.joint("plume", { parent: J["tail5"], at: [0,1.35,-1.45], dir: [0,0.6,-0.8], role: "fan" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
