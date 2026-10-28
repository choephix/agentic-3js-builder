import * as THREE from "three";
import { createBuilder, rng, limb, catmull, bezier } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan painted-wood alebrije: a rosette-spotted jaguar body with an eagle's hooked beak, ruff and crest, spread feathered wings and a fanned tail.",
};

const ORANGE = "#f28c1e";
const YELLOW = "#ffd23a";
const PINK = "#e0207a";
const TURQ = "#10b8b0";
const BLUE = "#2748c8";
const PURPLE = "#6a2a9a";
const GREEN = "#4aa83a";
const RED = "#d8302a";
const CREAM = "#fff1d0";
const BLACK = "#1d1020";
const GOLD = "#f6c026";
const BONE = "#f4ead0";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const SPH = new THREE.SphereGeometry(1, 8, 6);

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const rand = rng(11);

  // ---------- helpers ----------
  const disc = (hit: any, r: number, h: number, color: string, embed = 0.5) =>
    b.stick(new THREE.CylinderGeometry(r, r, h, 8), color, hit, { embed });

  const rosette = (hit: any, i: number) => {
    const rings = [TURQ, BLUE, GREEN, PURPLE];
    const c = rings[i % rings.length];
    disc(hit, 0.05, 0.026, c);
    disc(hit, 0.034, 0.034, i % 2 ? YELLOW : PINK);
    disc(hit, 0.017, 0.042, i % 2 ? BLACK : WHITE_());
  };
  function WHITE_() {
    return "#ffffff";
  }

  const feather = (
    p: THREE.Vector3,
    dir: number[],
    yDir: number[],
    len: number,
    wid: number,
    c1: string,
    c2: string,
    bone: any,
    thick = 0.016,
  ) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    const outline: any = [
      [0, -0.18 * wid],
      [0.3 * len, -0.5 * wid],
      [0.75 * len, -0.38 * wid],
      [len, 0, "sharp"],
      [0.75 * len, 0.38 * wid],
      [0.3 * len, 0.5 * wid],
      [0, 0.18 * wid],
    ];
    b.extrude(outline, { at: p, x: d, y: yDir, thickness: thick, color: c1, bone });
    const inner: any = [
      [0, -0.1 * wid],
      [0.25 * len, -0.26 * wid],
      [0.6 * len, -0.18 * wid],
      [0.7 * len, 0, "sharp"],
      [0.6 * len, 0.18 * wid],
      [0.25 * len, 0.26 * wid],
      [0, 0.1 * wid],
    ];
    const q = p.clone().addScaledVector(d, 0.12 * len);
    b.extrude(inner, { at: q, x: d, y: yDir, thickness: thick * 1.6, color: c2, bone });
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.66, -0.4] });
  const spine = b.chain("spine", catmull([[0, 0.66, -0.4], [0, 0.69, -0.05], [0, 0.72, 0.3]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 0.72, 0.3], [0, 0.88, 0.45], [0, 1.05, 0.58]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.08, 0.6], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.06, 0.7], aim: [0, 1.04, 0.9], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([[0, 0.66, -0.4], [0, 0.62, -0.8], [0, 0.66, -1.15], [0, 0.85, -1.4], [0, 1.1, -1.45]]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.sweep(
    spine,
    (t: number) => {
      const k = Math.sin(Math.PI * (0.15 + 0.7 * t));
      return [0.15 + 0.06 * k, 0.17 + 0.07 * k];
    },
    {
      color: ORANGE,
      sectors: [
        [-50, 50, PINK],
        [130, 230, YELLOW],
      ],
    },
  );
  const skin = b.surface(body);
  const hits = skin.scatter(26, { rng: rand, minDist: 0.13, filter: (h: any) => h.n.y > -0.25 && Math.abs(h.n.y) < 0.85 });
  hits.forEach((h: any, i: number) => rosette(h, i));

  let ci = 0;
  b.along(
    body,
    8,
    (at: any) => {
      b.stick(new THREE.ConeGeometry(0.035, 0.09, 4), [YELLOW, TURQ, PURPLE][ci++ % 3], at, { embed: 0.15 });
    },
    { from: 0.05, to: 0.95 },
  );

  // chest medallion
  const front = skin.around(V(0, 0.66, 0.3)).at(0, 0);
  if (front) {
    disc(front, 0.1, 0.03, PURPLE);
    disc(front, 0.07, 0.04, YELLOW);
    disc(front, 0.04, 0.05, RED);
  }

  // neck
  b.sweep(neck, [0.17, 0.1], { color: CREAM, sectors: [[130, 230, YELLOW]] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // forelegs
    const fp = limb(V(s * 0.17, 0.58, 0.22), V(s * 0.18, 0.05, 0.3), [0.3, 0.3], [[0, 0, -1]]);
    const fl = b.chain(`foreleg${S}`, fp, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `paw${S}`],
      role: "leg",
    });
    const fsw = b.sweep(fl, [0.09, 0.055], { color: ORANGE, sectors: [[150, 210, YELLOW]] });
    // hind legs
    const hp = limb(V(s * 0.17, 0.6, -0.4), V(s * 0.18, 0.05, -0.45), [0.27, 0.27, 0.16], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`hindleg${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
    });
    const hsw = b.sweep(hl, [0.12, 0.09, 0.06, 0.05], { color: ORANGE, sectors: [[150, 210, YELLOW]] });
    let k = 0;
    for (const sw of [fsw, hsw])
      b.along(sw, 4, (at: any) => {
        b.stick(new THREE.SphereGeometry(0.014, 6, 4), [BLUE, WHITE_(), PINK, GREEN][k++ % 4], at, { embed: 0.4 });
      }, { from: 0.15, to: 0.95 });

    // paws + claws
    const pawsAt: [THREE.Vector3, any][] = [
      [V(s * 0.18, 0.045, 0.33), fl.tip],
      [V(s * 0.18, 0.045, -0.42), hl.tip],
    ];
    for (const [pp, bone] of pawsAt) {
      b.part(SPH, YELLOW, { bone, at: pp, scale: [0.075, 0.045, 0.1] });
      for (const ox of [-0.035, 0, 0.035])
        b.spike([pp.x + ox, 0.04, pp.z + 0.1], [0, -0.15, 1], 0.07, 0.016, { color: BONE, bone });
      b.part(SPH, PINK, { bone, at: [pp.x, 0.038, pp.z + 0.01], scale: [0.04, 0.025, 0.04] });
    }
  }

  // ---------- head ----------
  const HC = V(0, 1.1, 0.63);
  const skull = b.part(SPH, CREAM, { bone: head, at: HC, scale: [0.115, 0.105, 0.12] });
  const hs = b.surface(skull);
  const headSpots: [number, number][] = [[60, 15], [95, 35], [45, 60], [120, 10]];
  headSpots.forEach(([az, el], i) => {
    for (const s of [1, -1]) {
      const h = hs.around(HC).at(s * az, el);
      if (h) {
        disc(h, 0.018, 0.016, [PINK, TURQ, BLUE, ORANGE][i]);
        disc(h, 0.008, 0.022, YELLOW);
      }
    }
  });
  // beak
  const upper = b.sweep(bezier([0, 1.11, 0.72], [0, 1.12, 0.84], [0, 1.09, 0.93], [0, 0.99, 0.96]), (t: number) => [
    0.05 * (1 - t) + 0.006,
    0.055 * (1 - t) + 0.006,
  ], { bone: head, color: GOLD, caps: { start: "flat", end: "point" } });
  void upper;
  b.sweep(bezier([0, 1.065, 0.7], [0, 1.05, 0.8], [0, 1.045, 0.9]), [0.04, 0.012], {
    bone: jaw,
    color: ORANGE,
    caps: { start: "flat", end: "round" },
  });
  for (const s of [1, -1]) {
    b.part(SPH, BLACK, { bone: head, at: [s * 0.032, 1.117, 0.79], scale: [0.009, 0.009, 0.012] });
    // eyes
    const E = V(s * 0.09, 1.13, 0.69);
    const out = V(s * 0.7, 0.05, 0.7).normalize();
    b.part(SPH, YELLOW, { bone: head, at: E, scale: [0.036, 0.036, 0.036] });
    b.part(SPH, BLACK, { bone: head, at: E.clone().addScaledVector(out, 0.026), scale: [0.02, 0.02, 0.02] });
    b.part(SPH, "#ffffff", {
      bone: head,
      at: E.clone().addScaledVector(out, 0.04).add(V(0, 0.01, 0)),
      scale: [0.006, 0.006, 0.006],
    });
    b.part(new THREE.TorusGeometry(0.042, 0.01, 5, 10), PINK, {
      bone: head,
      at: E.clone().addScaledVector(out, 0.004),
      dir: out,
      axis: "z",
    });
    b.rod([s * 0.06, 1.2, 0.64], [s * 0.1, 1.175, 0.77], 0.016, { bone: head, color: PURPLE });
  }
  // crest
  for (let k = -2; k <= 2; k++) {
    const d = [k * 0.3, 1, -0.7];
    feather(V(k * 0.025, 1.17, 0.58), d, [1, 0, 0], 0.2 - Math.abs(k) * 0.02, 0.08, [PINK, TURQ, ORANGE][Math.abs(k) % 3], YELLOW, head, 0.014);
  }

  // ---------- ruff ----------
  [
    { t: 0.1, r: 0.14, len: 0.22, cols: [TURQ, PINK] },
    { t: 0.5, r: 0.115, len: 0.17, cols: [BLUE, ORANGE] },
  ].forEach((row, ri) => {
    const cp: any = neck.at(row.t);
    const T = V(cp.tangent.x, cp.tangent.y, cp.tangent.z);
    b.ring(cp, { count: 10, radius: row.r }, (item: any) => {
      const o = new THREE.Vector3().copy(item.outward);
      const d = [o.x * 0.7, o.y * 0.7 - 0.5, o.z * 0.7 - 0.1];
      const y = new THREE.Vector3().crossVectors(T, o).normalize();
      feather(
        new THREE.Vector3().copy(item.at),
        d,
        [y.x, y.y, y.z],
        row.len,
        0.1,
        row.cols[item.i % 2],
        item.i % 2 ? YELLOW : CREAM,
        neck.joints[ri],
        0.014,
      );
    });
  });

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([[s * 0.18, 0.85, 0.18], [s * 0.7, 1.0, 0.1], [s * 1.2, 1.05, 0.0], [s * 1.7, 0.95, -0.15]]),
      { parent: chest, names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`, `wingHand${S}`], role: "wing" },
    );
    const wsw = b.sweep(wing, [0.07, 0.03], { color: PINK });
    let k = 0;
    b.along(wsw, 5, (at: any) => {
      b.stick(new THREE.SphereGeometry(0.016, 6, 4), [YELLOW, TURQ][k++ % 2], at, { embed: 0.3 });
    }, { from: 0.1, to: 0.95 });
    const cols = [TURQ, BLUE, GREEN, PURPLE];
    b.along(wing, 9, (at: any) => {
      const t = at.t as number;
      const p = V(at.at.x, at.at.y - 0.01, at.at.z);
      feather(p, [s * (0.08 + 0.5 * t), -0.05, -1], [1, 0, 0], 0.38 + 0.32 * t, 0.115, cols[Math.floor(t * 20) % 4], YELLOW, wing.nearestJoint(p));
    }, { from: 0.2, to: 1 });
    b.along(wing, 8, (at: any) => {
      const t = at.t as number;
      const p = V(at.at.x, at.at.y + 0.012, at.at.z - 0.06);
      feather(p, [s * (0.05 + 0.3 * t), -0.04, -1], [1, 0, 0], 0.24 + 0.1 * t, 0.1, [ORANGE, PINK, YELLOW][Math.floor(t * 20) % 3], [BLUE, WHITE_(), PURPLE][Math.floor(t * 20) % 3], wing.nearestJoint(p));
    }, { from: 0.15, to: 0.95 });
  }

  // ---------- tail ----------
  b.sweep(tail, [0.09, 0.04], {
    color: (t: number) => (Math.floor(t * 9) % 2 ? PURPLE : ORANGE),
  });
  const tipJ = tail.joints[tail.joints.length - 1];
  const fanC = V(0, 1.12, -1.45);
  const fcols = [TURQ, PINK, BLUE, ORANGE, GREEN];
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * (75 * Math.PI) / 180;
    const d = [Math.sin(a), Math.cos(a), -0.25];
    feather(fanC, d, [Math.cos(a), -Math.sin(a), 0], 0.42, 0.13, fcols[i % 5], i % 2 ? YELLOW : RED, tipJ, 0.016);
  }
  b.part(SPH, YELLOW, { bone: tipJ, at: fanC, scale: [0.06, 0.06, 0.06] });

  return b.root;
}
