import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, spiral, offset } from "../../../../src/index";

export const meta = {
  "name": "Baku, Dream-Eating Spirit",
  "description": "A tapir-bodied baku with a drooping trunk, ivory tusks, tiger paws, an ox tail and a flame mane. It is built as a stylized ukiyo-e woodblock print: flat indigo, vermilion, cream and ochre, inked contours, scalloped wave bands and layered colour blades."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  ink: "#1b1626",
  indigoDeep: "#162a52",
  indigo: "#2a4f86",
  indigoLight: "#5b86b8",
  skyPale: "#a9c9dc",
  cream: "#efe2bd",
  paperWhite: "#fbf5e2",
  ivory: "#f1e8cf",
  vermilion: "#d8432a",
  vermilionDeep: "#a82a1f",
  coral: "#ea8a6b",
  ochre: "#d9a23f",
  gold: "#e6bb4a",
  tigerBrown: "#9a5a2c",
  straw: "#c9b06a",
  moss: "#5f8a58",
  sumi: "#4a4a5c",
  rose: "#e58fa0",
};
const M = {
  hipsPivot: [0, 0.95, -0.6] as [number, number, number],
  chest: [0, 1.05, 0.4] as [number, number, number],
  withers: [0, 1.4, 0.45] as [number, number, number],
  rumpTop: [0, 1.43, -0.65] as [number, number, number],
  neckBase: [0, 1.1, 0.85] as [number, number, number],
  neckTop: [0, 1.4, 1.15] as [number, number, number],
  skullCentre: [0, 1.4, 1.3] as [number, number, number],
  foreheadDisc: [0, 1.64, 1.38] as [number, number, number],
  jawHinge: [0, 1.2, 1.25] as [number, number, number],
  trunkRoot: [0, 1.28, 1.5] as [number, number, number],
  trunkTip: [0, 0.88, 1.85] as [number, number, number],
  earBaseL: [0.22, 1.62, 1.12] as [number, number, number],
  earBaseR: [-0.22, 1.62, 1.12] as [number, number, number],
  shoulderL: [0.3, 0.95, 0.55] as [number, number, number],
  shoulderR: [-0.3, 0.95, 0.55] as [number, number, number],
  haunchL: [0.33, 0.95, -0.6] as [number, number, number],
  haunchR: [-0.33, 0.95, -0.6] as [number, number, number],
  pawFrontL: [0.3, 0, 0.7] as [number, number, number],
  pawFrontR: [-0.3, 0, 0.7] as [number, number, number],
  pawHindL: [0.33, 0, -0.6] as [number, number, number],
  pawHindR: [-0.33, 0, -0.6] as [number, number, number],
  tailRoot: [0, 1.1, -0.98] as [number, number, number],
  tailTip: [0, 0.95, -1.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const hips = J.hips, s1 = J.spine1, s2 = J.spine2;

  // Body loft: pear cross-section stations along z
  const st = [
    { at: [0, 1.0, -0.98], w: 0.3, h: 0.3 },
    { at: [0, 1.0, -0.7], w: 0.8, h: 0.9 },
    { at: [0, 0.98, -0.3], w: 0.84, h: 0.84 },
    { at: [0, 0.94, 0.0], w: 0.85, h: 0.78 },
    { at: [0, 0.98, 0.35], w: 0.8, h: 0.75 },
    { at: [0, 1.0, 0.65], w: 0.75, h: 0.72 },
    { at: [0, 1.02, 0.93], w: 0.3, h: 0.3 },
  ];
  const body = b.loft(st, {
    bone: [hips, s1, s2],
    color: P.indigo,
    sides: 10,
    bands: [
      [0.28, P.indigo],
      [0.72, P.cream],
      [1, P.indigo],
    ],
    sectors: [
      [-70, 70, P.cream, 0.28, 0.72],
      [150, 210, P.indigoDeep, 0, 1],
      [172, 188, P.cream, 0.1, 0.9],
    ],
  } as any);

  const skin = b.surface(body);
  const ink = P.ink;

  // Key-lines
  for (const [deg, c] of [[0, ink], [180, ink], [90, ink], [-90, ink]] as [number, string][]) {
    try {
      b.sweep(body.line(deg, 0.006), 0.006, { color: c, bone: [hips, s1, s2], sides: 6 } as any);
    } catch (e) {}
  }

  // Scalloped saddle borders (seigaiha half discs)
  const disc = [] as [number, number][];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI;
    disc.push([Math.cos(a) * 0.04, Math.sin(a) * 0.04]);
  }
  const cols = [P.cream, P.skyPale, P.paperWhite];
  for (const side of [1, -1]) {
    for (const zEdge of [0.3, -0.4]) {
      for (let i = 0; i < 14; i++) {
        const el = -60 + i * 12 + (i % 2) * 3;
        const hit = skin.around([0, 0.98, zEdge]).at(side * 90, el);
        if (!hit) continue;
        const hz = hit.at.z;
        const rim = new THREE.CylinderGeometry(0.046, 0.046, 0.006, 8);
        b.stick(rim, ink, hit, { embed: 0.3 });
        b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 8), cols[i % 3], hit, { embed: 0.2 });
        void hz;
      }
    }
  }

  // Saddle pattern per flank
  for (const side of [1, -1]) {
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 4; k++) {
        const h = skin.around([0, 0.98, 0]).at(side * 90, 12 - row * 22 + 0);
        if (!h) continue;
        const p = h.moved([0, 0.004, 0]);
        const at = offset(p.at, [0, 0, 1], -0.25 + k * 0.17 + (row % 2) * 0.08);
        const hh = skin.nearest(at);
        for (const [r, c] of [[0.05, ink], [0.036, P.skyPale], [0.022, ink]] as [number, string][])
          b.stick(new THREE.CylinderGeometry(r, r, 0.006, 8), c, hh, { embed: 0.3 });
      }
    }
    for (let i = 0; i < 5; i++) {
      const h = skin.around([0, 0.98, 0]).at(side * 90, 35 + R() * 25);
      if (!h) continue;
      const hh = skin.nearest(offset(h.at, [0, 0, 1], -0.25 + i * 0.12));
      b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.gold, hh, { embed: 0.3 });
    }
    // kasumi band low on flank
    const kh = skin.around([0, 0.9, 0]).at(side * 90, -45);
    if (kh) {
      const o: [number, number][] = [];
      for (let i = 0; i <= 8; i++) o.push([-0.3 + i * 0.075, 0.025 + (i % 2) * 0.015]);
      for (let i = 8; i >= 0; i--) o.push([-0.3 + i * 0.075, -0.02 - (i % 2) * 0.01]);
      b.extrude(o, {
        at: kh.moved([0, 0.003, 0]).at,
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.008,
        color: P.vermilion,
        bone: s1,
      });
    }
  }

  // Roundels
  const roundel = (x: number, z: number, s: number) => {
    const h = skin.around([0, 1.0, z]).at(s * 90, 15);
    if (!h) return;
    const c = h.at;
    const sp = spiral(c, offset(c, [0, 0, 1], 0.07), [s, 0, 0], { turns: 1.25, r1: 0.015 });
    b.sweep(sp, [0.014, 0.004], { color: P.vermilion, bone: z > 0 ? s2 : hips, sides: 6 } as any);
    b.stick(new THREE.SphereGeometry(0.018, 6, 4), P.gold, h, { embed: 0.2, bone: z > 0 ? s2 : hips } as any);
  };
  for (const s of [1, -1]) {
    roundel(0.4, 0.5, s);
    roundel(0.42, -0.6, s);
  }

  // Fur strokes
  const hits = skin.scatter(40, { rng: R, minDist: 0.1, filter: (h) => Math.abs(h.at.z - 0.0) > 0.45 && h.n.y > -0.4 });
  for (const h of hits) {
    b.stick(new THREE.ConeGeometry(0.008, 0.07, 5), ink, h, { embed: 0.3, flow: [0, -0.5, -1] } as any);
  }

  // Chest bib
  const bib = skin.around([0, 1.0, 0.65]).at(0, -25);
  if (bib) {
    b.stick(new THREE.BoxGeometry(0.34, 0.012, 0.3), P.vermilion, bib, { embed: 0.4 });
    b.stick(new THREE.BoxGeometry(0.2, 0.014, 0.18), P.coral, bib, { embed: 0.3 });
  }

  // Hip band with studs
  try {
    const loop = skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(loop, 0.03, { color: P.vermilion, bone: hips, sides: 6 } as any);
    b.sweep(skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: 0.036 }), 0.007, { color: P.gold, bone: hips, sides: 6 } as any);
    b.sweep(skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: -0.01 }), 0.007, { color: P.gold, bone: hips, sides: 6 } as any);
    b.along(skin.loop([0, 1.0, -0.35], { dir: [0, 0, 1], lift: 0.04 }), 6, (at: any) =>
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), P.gold, at, { embed: 0.2 }),
    );
  } catch (e) {}
}
    return buildTorso;
  })(),
  // neckMane
  (() => {
function buildNeckMane({ b, J, P, M }: Ctx) {
  const n1 = J.neck1, n2 = J.neck2, sp = J.spine2;
  const INK = P.ink;

  // ---- NECK ----
  const path = catmull([M.neckBase, [0, 1.25, 1.0], M.neckTop]);
  const neck = b.sweep(path, (t: number) => [0.3 - 0.08 * t, 0.27 - 0.05 * t], {
    bone: [n1, n2], color: P.indigo, sides: 8,
    sectors: [[125, 235, P.cream]],
  });
  b.sweep(neck.line(0, 0.004), 0.007, { color: INK, bone: n1 });

  // fur strokes on the sides
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const t = 0.15 + i * 0.13;
      for (const k of [60, 90]) {
        const h = neck.at(t, s * k);
        b.spike(h, h, 0.05, 0.005, { color: INK, bone: t < 0.5 ? n1 : n2 });
      }
    }

  // ---- MANE ----
  const flame = (len: number, w: number): [number, number, string?][] => [
    [0, 0], [w * 0.5, len * 0.35], [w * 0.3, len * 0.7], [-w * 0.2, len * 1.0, "sharp"],
    [-w * 0.1, len * 0.6], [-w * 0.6, len * 0.35], [-w * 0.5, 0],
  ] as any;
  const bands = [P.indigoDeep, P.indigo, P.indigoLight, P.skyPale];
  const rows = [{ x: 0, dy: 0 }, { x: 0.07, dy: -0.06 }, { x: -0.07, dy: -0.06 }];
  let alt = 0;
  rows.forEach((row, ri) => {
    const N = 12;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const z = 1.12 - t * 0.92 + (ri ? 0.03 : 0);
      const y0 = 1.62 - t * 0.2 + row.dy - (ri ? 0 : 0);
      const len = 0.34 - 0.14 * t;
      const w = 0.07;
      const bone = z > 0.9 ? n2 : z > 0.55 ? n1 : sp;
      const base: [number, number, number] = [row.x * (1 - 0.3 * t), Math.min(y0, 1.62) - 0.02, z];
      const o = outlineScale(flame(len, w), 1.12);
      b.extrude(o as any, {
        at: [base[0], base[1] - 0.008, base[2] + 0.012], x: [0, 0, -1], y: [0, 1, 0],
        thickness: 0.03, color: INK, bone,
      });
      const tip = alt++ % 2 ? P.cream : P.vermilion;
      for (let L = 0; L < 4; L++) {
        const k = 1 - L * 0.18;
        b.extrude(flame(len * k, w * k) as any, {
          at: [base[0], base[1] + L * 0.012, base[2] - L * 0.004], x: [0, 0, -1], y: [0, 1, 0],
          thickness: 0.026 - L * 0.002, bevel: 0.003,
          color: L === 3 ? tip : bands[L], bone,
        });
      }
    }
  });

  // vermilion spiral locks
  for (const s of [1, -1]) {
    const c = [s * 0.1, 1.55, 1.0];
    const sp3 = catmull([
      [c[0], c[1], c[2]], [c[0] + s * 0.05, c[1] + 0.05, c[2] - 0.04],
      [c[0] + s * 0.07, c[1] + 0.1, c[2] - 0.1], [c[0] + s * 0.03, c[1] + 0.13, c[2] - 0.12],
    ]);
    b.sweep(sp3, [0.018, 0.006], { color: P.vermilion, bone: n2, sides: 6 });
  }

  // ---- ROPE COLLAR ----
  const cz = 1.0, cy = 1.28;
  const ring = (ph: number, col: string) => {
    const pts: number[][] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const w = 0.025 * Math.sin(a * 6 + ph);
      pts.push([Math.sin(a) * (0.28 + w), cy + Math.cos(a) * (0.255 + w), cz - Math.sin(a) * 0 + 0.0]);
    }
    return b.sweep(catmull(pts, { closed: true }), 0.025, { color: col, bone: n1, sides: 6 });
  };
  ring(0, P.straw);
  ring(Math.PI, P.paperWhite);

  // shide
  const zig: [number, number][] = [[-0.02, 0], [0.02, 0], [0.02, -0.05], [-0.01, -0.08], [0.02, -0.11], [-0.02, -0.15], [-0.02, -0.08], [0.0, -0.05]] as any;
  const shide: [number, number][] = [[-0.025, 0], [0.025, 0], [0.025, -0.06], [-0.005, -0.09], [0.025, -0.12], [-0.025, -0.17], [-0.005, -0.1], [-0.025, -0.06]];
  void zig;
  [-60, -25, 25, 60].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    const x = Math.sin(a) * 0.3, y = cy + Math.cos(a) * 0.27 - 0.03;
    b.extrude(shide as any, { at: [x, y, cz + 0.02], x: [1, 0, 0], thickness: 0.004, color: P.paperWhite, bone: n1 });
    b.rod([x, y - 0.06, cz + 0.024], [x, y - 0.06, cz + 0.024].map((v, i) => (i === 0 ? v + 0.03 : v)) as any, 0.003, INK, { bone: n1 });
  });

  // bell at throat
  const bellAt: [number, number, number] = [0, cy - 0.3, cz + 0.06];
  b.part(new THREE.SphereGeometry(0.035, 8, 6), P.gold, { bone: n1, at: bellAt });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.004), INK, { bone: n1, at: [0, bellAt[1] - 0.012, bellAt[2] + 0.034] });

  // ribbon tails with tassels
  for (const s of [1, -1]) {
    const x = s * 0.07;
    b.extrude([[-0.018, 0], [0.018, 0], [0.018, -0.2], [0, -0.17], [-0.018, -0.2]] as any, {
      at: [x, bellAt[1] - 0.03, bellAt[2] + 0.02], x: [1, 0, 0], thickness: 0.006, color: P.vermilion, bone: n1,
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.gold, { bone: n1, at: [x, bellAt[1] - 0.25, bellAt[2] + 0.02] });
    b.spike([x, bellAt[1] - 0.25, bellAt[2] + 0.02], [0, -1, 0], 0.05, 0.014, { color: P.gold, bone: n1 });
  }

  function outlineScale(o: any[], k: number) {
    return o.map(([x, y, f]) => (f ? [x * k, y * k - 0.01, f] : [x * k, y * k - 0.01]));
  }
}
    return buildNeckMane;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw, t1 = J.trunk1, t2 = J.trunk2, t3 = J.trunk3;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const disc = (r: number, th: number, seg = 14) => new THREE.CylinderGeometry(r, r, th, seg);

  // skull
  put(sph(0.27, 10, 7), P.indigo, [0, 1.42, 1.3], head, { scale: [0.95, 0.95, 1.05] });
  put(sph(0.2, 8, 6), P.indigoLight, [0, 1.56, 1.34], head, { scale: [1.05, 0.6, 1] });
  b.frustumBox([0, 1.33, 1.35], [0, 1.28, 1.56], [0.42, 0.34], [0.2, 0.22], { bone: head, color: P.indigo });
  b.rod([0, 1.7, 1.2], [0, 1.52, 1.5], 0.006, { bone: head, color: P.ink });
  b.rod([0, 1.52, 1.5], [0, 1.3, 1.6], 0.006, { bone: head, color: P.ink });

  // trunk
  const tp = catmull([[0, 1.28, 1.5], [0, 1.24, 1.68], [0, 1.1, 1.8], [0, 0.88, 1.85], [0, 0.82, 1.86]]);
  b.sweep(tp, [0.09, 0.035], {
    bone: [t1, t2, t3], color: P.indigo, sides: 8,
    sectors: [[110, 250, P.coral]], caps: "round",
  });
  for (let i = 1; i <= 8; i++) {
    const p = tp.at(i / 9);
    put(new THREE.TorusGeometry(0.075 - i * 0.005, 0.006, 4, 8), P.ink, [p.x, p.y, p.z], i < 3 ? t1 : i < 6 ? t2 : t3, {
      dir: tp.tangentAt(i / 9).toArray(), axis: "z",
    });
  }
  const te = tp.at(1);
  put(sph(0.032, 6, 4), P.vermilion, [te.x, te.y - 0.005, te.z + 0.005], t3);
  for (const s of [1, -1]) put(sph(0.009, 4, 3), P.ink, [s * 0.015, te.y - 0.01, te.z + 0.03], t3);
  put(sph(0.01, 4, 3), P.gold, [0, te.y - 0.035, te.z + 0.01], t3);

  // tusks
  for (const s of [1, -1]) {
    const tu = catmull([[s * 0.11, 1.2, 1.5], [s * 0.125, 1.15, 1.58], [s * 0.14, 1.07, 1.63]]);
    b.sweep(tu, [0.03, 0.002], { bone: head, color: P.ink, sides: 6 });
    b.sweep(tu, [0.024, 0], { bone: head, color: P.ivory, sides: 6, caps: "point" });
    put(disc(0.036, 0.03, 8), P.cream, [s * 0.11, 1.2, 1.5], head, { rotation: [90, 0, 0] });
  }

  // jaw
  put(new THREE.BoxGeometry(0.34, 0.08, 0.3), P.cream, [0, 1.15, 1.38], jaw);
  put(new THREE.BoxGeometry(0.28, 0.07, 0.2), P.cream, [0, 1.16, 1.55], jaw);
  put(new THREE.BoxGeometry(0.3, 0.02, 0.4), P.vermilionDeep, [0, 1.2, 1.4], jaw);
  b.rod([-0.17, 1.19, 1.3], [-0.14, 1.19, 1.62], 0.006, { bone: jaw, color: P.ink });
  b.rod([0.17, 1.19, 1.3], [0.14, 1.19, 1.62], 0.006, { bone: jaw, color: P.ink });
  for (const s of [1, -1]) put(new THREE.ConeGeometry(0.012, 0.045, 5), P.ivory, [s * 0.09, 1.22, 1.6], jaw);
  const bl = [P.cream, P.paperWhite, P.cream];
  bl.forEach((c, i) => {
    const x = (i - 1) * 0.07;
    put(new THREE.ConeGeometry(0.035, 0.16, 5), P.ink, [x, 1.04, 1.5], jaw, { rotation: [180, 0, 0], scale: [1.2, 1.1, 1.2] });
    put(new THREE.ConeGeometry(0.028, 0.14, 5), c, [x, 1.05, 1.5], jaw, { rotation: [180, 0, 0] });
  });

  // cheek ruffs
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    put(new THREE.ConeGeometry(0.04, 0.14, 5), P.ink, [s * 0.26, 1.28 - i * 0.04, 1.3 + i * 0.05], head, { rotation: [0, 0, s * -105], scale: [1.2, 1, 1.2] });
    put(new THREE.ConeGeometry(0.033, 0.13, 5), P.cream, [s * 0.265, 1.28 - i * 0.04, 1.3 + i * 0.05], head, { rotation: [0, 0, s * -105] });
    put(sph(0.05, 6, 4), P.rose, [s * 0.215, 1.36, 1.5], head, { scale: [0.3, 1, 1] });
  }

  // eyes
  for (const s of [1, -1]) {
    const d = [s * 0.5, 0.1, 0.85];
    const layers: [number, string, number][] = [[0.085, P.ink, 0], [0.075, P.paperWhite, 0.004], [0.06, P.vermilion, 0.008], [0.05, P.gold, 0.012], [0.028, P.ink, 0.016]];
    for (const [r, c, o] of layers)
      put(disc(r, 0.01, 14), c, [s * (0.2 + o * 0.5), 1.46, 1.48 + o], head, { dir: d, axis: "y" });
    put(sph(0.008, 4, 3), P.paperWhite, [s * 0.225, 1.48, 1.51], head);
    // brows
    for (let k = 0; k < 3; k++) {
      put(new THREE.BoxGeometry(0.1, 0.025, 0.04), k % 2 ? P.indigoDeep : P.ink, [s * (0.18 + k * 0.03), 1.56 + k * 0.015, 1.46], head, { rotation: [0, 0, s * (20 + k * 8)] });
    }
    b.rod([s * 0.14, 1.4, 1.54], [s * 0.26, 1.42, 1.44], 0.005, { bone: head, color: P.vermilion });
    // whiskers
    for (const dy of [0, -0.04]) b.sweep(catmull([[s * 0.1, 1.28 + dy, 1.55], [s * 0.25, 1.26 + dy, 1.6], [s * 0.4, 1.2 + dy, 1.6]]), 0.003, { bone: head, color: P.ink, sides: 5 });
    // ears
    const ej = s > 0 ? J.earL : J.earR;
    const ed = [s * 0.45, 0.1, 0.1];
    put(disc(0.13, 0.05, 14), P.ink, [s * 0.22, 1.66, 1.1], ej, { dir: ed, axis: "y" });
    put(disc(0.115, 0.06, 14), P.indigo, [s * 0.225, 1.665, 1.11], ej, { dir: ed });
    put(new THREE.TorusGeometry(0.11, 0.012, 4, 14), P.cream, [s * 0.26, 1.67, 1.13], ej, { dir: ed, axis: "z" });
    put(disc(0.07, 0.065, 12), P.coral, [s * 0.23, 1.665, 1.12], ej, { dir: ed });
  }

  // forehead sun disc
  const fd = [0, 0.5, 0.85];
  put(new THREE.TorusGeometry(0.085, 0.012, 5, 14), P.gold, [0, 1.64, 1.38], head, { dir: fd, axis: "z" });
  put(disc(0.08, 0.01, 14), P.vermilion, [0, 1.64, 1.38], head, { dir: fd });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    put(sph(0.022, 5, 4), i % 2 ? P.cream : P.ink, [Math.sin(a) * 0.04, 1.645 + Math.cos(a) * 0.035, 1.39 + Math.cos(a) * 0.01], head);
  }
  put(sph(0.01, 4, 3), P.gold, [0, 1.65, 1.4], head);
}
    return buildHead;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const R = rng(5);
  const bandsFn = (cols: string[], cuts: number[]) => (t: number) => {
    for (let i = 0; i < cuts.length; i++) if (t < cuts[i]) return cols[i];
    return cols[cols.length - 1];
  };

  // flame-blade cuff ring around a leg point
  const cuff = (at: number[], bone: any, r: number, n: number, col: string) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const dir = [Math.sin(a) * 0.8, -0.6, Math.cos(a) * 0.8];
      const base = [at[0] + Math.sin(a) * r, at[1], at[2] + Math.cos(a) * r];
      b.spike(base, dir, 0.09, 0.022, { color: P.ink, bone, sides: 6 });
      b.spike([base[0], base[1] + 0.005, base[2]], dir, 0.075, 0.016, { color: col, bone, sides: 6 });
    }
  };

  const ring = (at: number[], bone: any, r: number, w: number, col: string) => {
    b.part(new THREE.TorusGeometry(r, w, 5, 10), col, { bone, at, dir: [0, 1, 0], axis: "z" });
  };

  const paw = (x: number, z: number, bone: any, s: number) => {
    const pz = z + 0.05;
    b.part(new THREE.BoxGeometry(0.17, 0.1, 0.2), P.cream, { bone, at: [x, 0.05, pz] });
    b.part(new THREE.BoxGeometry(0.17, 0.08, 0.2), P.ochre, { bone, at: [x, 0.1, pz] });
    b.part(new THREE.SphereGeometry(0.085, 6, 4), P.ochre, { bone, at: [x, 0.1, pz - 0.02], scale: [1, 0.9, 1.2] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.coral, { bone, at: [x, 0.015, pz - 0.06], scale: [1.6, 0.4, 1.3] });
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.042;
      const tz = pz + 0.115 - Math.abs(i - 1.5) * 0.01;
      b.part(new THREE.SphereGeometry(0.04, 6, 4), P.ochre, { bone, at: [tx, 0.045, tz] });
      b.spike([tx, 0.03, tz + 0.035], [0, -0.5, 1], 0.045, 0.012, { color: P.ivory, bone, sides: 5 });
      if (i < 3)
        b.rod([tx + 0.021, 0.02, tz - 0.01], [tx + 0.021, 0.075, tz + 0.035], 0.004, P.ink, { bone, sides: 5 });
    }
  };

  const leg = (s: number, front: boolean) => {
    const sfx = s > 0 ? "L" : "R";
    const up = front ? J["fUpper" + sfx] : J["hUpper" + sfx];
    const lo = front ? J["fLower" + sfx] : J["hLower" + sfx];
    const pw = front ? J["fPaw" + sfx] : J["hPaw" + sfx];
    const x = s * (front ? 0.3 : 0.33);
    const zT = front ? 0.55 : -0.6;
    const zK = front ? 0.6 : -0.5;
    const zW = front ? 0.62 : -0.62;
    const rTop = front ? 0.1 : 0.14;
    const top = [x, 0.95, zT];
    const knee = [x, front ? 0.55 : 0.52, zK];
    const wrist = [x, 0.17, zW];

    // upper segment: indigo
    b.sweep([top, knee], [rTop, front ? 0.085 : 0.1], { color: P.indigo, bone: [up, lo], sides: 8 });
    b.capsule(knee, [x, 0.5, zK], front ? 0.085 : 0.1, { color: P.indigo, bone: lo, sides: 8 });
    // lower: ochre
    b.sweep([knee, wrist], [front ? 0.08 : 0.075, 0.07], { color: P.ochre, bone: [lo, pw], sides: 8 });
    // stripes
    for (let i = 0; i < 5; i++) {
      const y = knee[1] - 0.06 - i * 0.065;
      const t = (knee[1] - y) / (knee[1] - wrist[1]);
      const z = zK + (zW - zK) * t;
      ring([x, y, z], lo, 0.082 - t * 0.008, 0.007, i % 2 ? P.ink : P.tigerBrown);
    }
    ring([x, 0.2, zW], pw, 0.075, 0.009, P.vermilion);
    ring([x, 0.2, zW], pw, 0.077, 0.004, P.gold);
    cuff([x, knee[1] + 0.02, zK], lo, 0.085, 5, P.cream);
    // key line down front edge
    b.rod([x, 0.9, zT + rTop * 0.95], [x, knee[1], zK + 0.09], 0.006, P.ink, { bone: up, sides: 6 });
    b.rod([x, knee[1], zK + 0.085], [x, 0.17, zW + 0.07], 0.006, P.ink, { bone: lo, sides: 6 });
    // hock bump on hind legs
    if (!front) {
      b.part(new THREE.SphereGeometry(0.09, 6, 4), P.indigoDeep, { bone: lo, at: [x, 0.52, zK - 0.1], scale: [0.9, 1.1, 1] });
      // vermilion spiral on outer thigh
      const cx = x + s * 0.13;
      const pts: number[][] = [];
      for (let i = 0; i <= 14; i++) {
        const a = i * 0.55;
        const r = 0.05 - i * 0.003;
        pts.push([cx, 0.85 + Math.sin(a) * r, zT + Math.cos(a) * r]);
      }
      b.sweep(pts, [0.01, 0.004], { color: P.vermilion, bone: up, sides: 5 });
      b.part(new THREE.SphereGeometry(0.012, 5, 4), P.gold, { bone: up, at: [cx + s * 0.005, 0.85, zT] });
    } else {
      b.part(new THREE.SphereGeometry(0.012, 5, 4), P.gold, { bone: up, at: [x + s * 0.09, 0.8, zT + 0.02] });
    }
    paw(x, zW, pw, s);
  };

  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }
  void R; void M; void bandsFn;
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const tj = [J.tail1, J.tail2, J.tail3, J.tail4];

  // ---- tail sweep ----
  const pts: number[][] = [
    [0, 1.1, -0.98],
    [0, 1.06, -1.2],
    [0, 0.9, -1.4],
    [0, 0.93, -1.52],
    [0, 1.0, -1.58],
  ];
  const path = catmull(pts);
  const rad = (t: number) => 0.07 - 0.04 * t;
  b.sweep(path, rad, {
    bone: tj,
    color: P.indigo,
    sides: 8,
    caps: "round",
    bands: [
      [0.3, P.indigo],
      [0.6, P.indigoDeep],
      [1, P.indigo],
    ],
  });
  b.sweep(path, (t: number) => rad(t) * 0.12 + 0.005, {
    bone: tj,
    color: P.ink,
    sides: 6,
    shift: (t: number) => [0, rad(t)] as [number, number],
  });
  // ring bands
  const ring = (t: number, col: string, k: number) => {
    const p = path.at(t);
    const d = path.tangentAt(t);
    b.part(new THREE.CylinderGeometry(rad(t) * k, rad(t) * k, 0.03, 8), col, {
      at: p,
      dir: d,
      bone: J.tail1,
    });
  };
  ring(0.04, P.gold, 1.2);
  ring(0.1, P.vermilion, 1.18);
  for (const t of [0.35, 0.5, 0.65]) ring(t, P.skyPale, 1.12);

  // ---- flame blade helper ----
  const blade = (
    at: number[],
    x: number[],
    len: number,
    w: number,
    cols: string[],
    bone: any,
    up: number[] = [0, 1, 0],
  ) => {
    const o: [number, number, "sharp"?][] = [
      [0, -w * 0.5],
      [len * 0.5, -w * 0.6],
      [len * 0.85, -w * 0.2],
      [len, w * 0.4, "sharp"],
      [len * 0.6, w * 0.5],
      [len * 0.2, w * 0.6],
    ] as any;
    const bw = w * 0.14;
    const outline = o.map(([a, c, s]) => [a * 1.0, c * 1.18, s] as any);
    b.extrude(outline.map(([a, c]: number[]) => [a, c + 0.0] as any), {
      at: [at[0], at[1], at[2]], x, y: up, thickness: 0.012, color: P.ink, bone,
    });
    cols.forEach((c, i) => {
      const f = 1 - i * 0.22;
      const lay = o.map(([a, cc, s]) => [a * f + (1 - f) * 0 + 0, cc * f, s] as any);
      // later layers shrink toward the tip: keep root, shrink length
      const lay2 = o.map(([a, cc, s]) => [a * (1 - i * 0.2), cc * (1 - i * 0.15), s] as any);
      void lay;
      b.extrude(lay2, {
        at: [at[0] + (i + 1) * 0.0015, at[1], at[2]],
        x, y: up, thickness: 0.016, color: c, bone,
      });
    });
    void bw;
  };

  // ---- tuft fan ----
  const tip = [0, 1.0, -1.58];
  const bok = [P.vermilionDeep, P.vermilion, P.coral, P.cream];
  for (let i = 0; i < 10; i++) {
    const a = -0.9 + (i / 9) * 1.8;
    const ang = a;
    const dir = [Math.sin(ang) * 0.5, 0.55 + 0.25 * Math.cos(ang), -0.8];
    const len = 0.2 + 0.1 * R();
    const up = [Math.sin(ang), 0.3, 0];
    blade(tip, dir, len, 0.07, bok, J.tail4, [0, 0, 1]);
    void up;
  }
  // centre tongue
  blade([0, 1.0, -1.58], [0, 0.7, -0.5], 0.34, 0.1, [P.indigoLight, P.skyPale], J.tail4, [1, 0, 0]);
  // spiral curls
  for (const s of [1, -1]) {
    const c = catmull([
      [s * 0.04, 1.0, -1.58],
      [s * 0.11, 1.08, -1.6],
      [s * 0.14, 1.16, -1.58],
      [s * 0.1, 1.2, -1.55],
      [s * 0.07, 1.17, -1.55],
    ]);
    b.sweep(c, [0.012, 0.005], { bone: J.tail4, color: P.vermilion, sides: 6 });
  }

  // ---- rump crest ----
  const crestCols = [P.indigoDeep, P.indigo, P.skyPale];
  for (let i = 0; i < 5; i++) {
    const z = -0.66 - i * 0.07;
    const y = 1.43 - i * 0.045;
    blade([0, y, z], [0, 0.4, -1], 0.12 + 0.02 * (4 - i), 0.05, crestCols, J.hips, [1, 0, 0]);
  }

  // ---- kasumi mist ----
  for (const s of [1, -1]) {
    const o: [number, number][] = [];
    for (let k = 0; k <= 6; k++) o.push([k * 0.05, 0.02 * (k % 2 ? 1 : -1)]);
    for (let k = 6; k >= 0; k--) o.push([k * 0.05, 0.05 + 0.02 * (k % 2 ? -1 : 1)]);
    const bigO = o.map(([a, c]) => [a, c * 1.0] as [number, number]);
    b.extrude(bigO, {
      at: [s * 0.44, 0.9, -0.78], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006, color: P.ink, bone: J.hips,
    });
    b.extrude(bigO.map(([a, c]) => [a * 0.95 + 0.005, c * 0.9 + 0.003] as [number, number]), {
      at: [s * 0.447, 0.9, -0.78], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006,
      color: s > 0 ? P.skyPale : P.paperWhite, bone: J.hips,
    });
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bakuDreamEater" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.95,-0.6], dir: [0,0,1], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["hips"], at: [0,1,-0.1], dir: [0,0,1], role: "spine" });
  J["spine2"] = b.joint("spine2", { parent: J["spine1"], at: [0,1.05,0.4], dir: [0,0,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["spine2"], at: [0,1.1,0.85], dir: [0,0.5,1], role: "neck" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.28,1], dir: [0,0.3,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.4,1.15], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.2,1.25], dir: [0,0,1], role: "jaw" });
  J["trunk1"] = b.joint("trunk1", { parent: J["head"], at: [0,1.28,1.5], dir: [0,-0.1,1], role: "tentacle", group: "trunk" });
  J["trunk2"] = b.joint("trunk2", { parent: J["trunk1"], at: [0,1.2,1.7], dir: [0,-0.5,1], role: "tentacle", group: "trunk" });
  J["trunk3"] = b.joint("trunk3", { parent: J["trunk2"], at: [0,1.05,1.8], dir: [0,-1,0.3], role: "tentacle", group: "trunk" });
  J["earL"] = b.joint("earL", { parent: J["head"], at: [0.22,1.62,1.12], dir: [0.4,1,-0.2], role: "hinge", group: "ears" });
  J["earR"] = b.joint("earR", { parent: J["head"], at: [-0.22,1.62,1.12], dir: [-0.4,1,-0.2], role: "hinge", group: "ears" });
  J["fUpperL"] = b.joint("fUpperL", { parent: J["spine2"], at: [0.3,0.95,0.55], dir: [0,-1,0], role: "leg", group: "legs" });
  J["fLowerL"] = b.joint("fLowerL", { parent: J["fUpperL"], at: [0.3,0.55,0.6], dir: [0,-1,0], role: "leg", group: "legs" });
  J["fPawL"] = b.joint("fPawL", { parent: J["fLowerL"], at: [0.3,0.14,0.62], dir: [0,0,1], role: "leg", group: "legs" });
  J["fUpperR"] = b.joint("fUpperR", { parent: J["spine2"], at: [-0.3,0.95,0.55], dir: [0,-1,0], role: "leg", group: "legs" });
  J["fLowerR"] = b.joint("fLowerR", { parent: J["fUpperR"], at: [-0.3,0.55,0.6], dir: [0,-1,0], role: "leg", group: "legs" });
  J["fPawR"] = b.joint("fPawR", { parent: J["fLowerR"], at: [-0.3,0.14,0.62], dir: [0,0,1], role: "leg", group: "legs" });
  J["hUpperL"] = b.joint("hUpperL", { parent: J["hips"], at: [0.33,0.95,-0.6], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["hLowerL"] = b.joint("hLowerL", { parent: J["hUpperL"], at: [0.33,0.52,-0.5], dir: [0,-1,-0.2], role: "leg", group: "legs" });
  J["hPawL"] = b.joint("hPawL", { parent: J["hLowerL"], at: [0.33,0.14,-0.62], dir: [0,0,1], role: "leg", group: "legs" });
  J["hUpperR"] = b.joint("hUpperR", { parent: J["hips"], at: [-0.33,0.95,-0.6], dir: [0,-1,0.2], role: "leg", group: "legs" });
  J["hLowerR"] = b.joint("hLowerR", { parent: J["hUpperR"], at: [-0.33,0.52,-0.5], dir: [0,-1,-0.2], role: "leg", group: "legs" });
  J["hPawR"] = b.joint("hPawR", { parent: J["hLowerR"], at: [-0.33,0.14,-0.62], dir: [0,0,1], role: "leg", group: "legs" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,1.1,-0.98], dir: [0,-0.1,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.05,-1.2], dir: [0,-0.4,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.88,-1.4], dir: [0,0.3,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,0.92,-1.55], dir: [0,0.8,-0.6], role: "tail", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
