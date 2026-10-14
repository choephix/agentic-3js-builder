```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  limb,
  bezier,
  catmull,
  vec,
  paint,
  countershade,
  stripes,
  spots,
  scales,
  mottle,
} from "agentic-3js-builder";

export const meta = {
  name: "Chameleon",
  description:
    "A stylized veiled chameleon in rest pose: arched, laterally flattened body with teal bands, orange spots and a dashed cream flank stripe, tall striped casque with beaded crest, independent ringed turret eyes, hinged jaw with gular crest and a tongue, mitten-like zygodactyl feet with claws, and a curled tail.",
};

// palette
const GREEN = "#3dbb4f";
const DEEP = "#1f7a3c";
const TEAL = "#22a497";
const LIME = "#a9e05a";
const BELLY = "#d9f08a";
const GOLD = "#f5c42c";
const ORANGE = "#ff7b2e";
const CREAM = "#fff4c9";
const EDGE = "#1d5f33";
const CLAW = "#3a2d24";
const BLACK = "#141414";
const WHITE = "#ffffff";
const CREST = "#f7e07a";
const LIP = "#ffe58a";
const PINK = "#f07a8a";
const FOOT = "#c6e25a";

export default function build() {
  const b = createBuilder({ name: "chameleon", paintSize: 2048 });

  // ---------- spine curve: tail tip (curled) -> neck end ----------
  const P: number[][] = [
    [0, 0.060, -0.304], // tail tip (inside the curl)
    [0, 0.043, -0.302],
    [0, 0.040, -0.325],
    [0, 0.062, -0.338],
    [0, 0.090, -0.315],
    [0, 0.108, -0.250],
    [0, 0.118, -0.180],
    [0, 0.125, -0.110], // tail base
    [0, 0.132, -0.075], // hips
    [0, 0.150, -0.020], // arched mid back
    [0, 0.148, 0.040],
    [0, 0.140, 0.075], // shoulders
    [0, 0.142, 0.100], // neck end
  ];
  const RX = [0.004, 0.0048, 0.0058, 0.0072, 0.009, 0.011, 0.013, 0.017, 0.020, 0.023, 0.023, 0.021, 0.018];
  const RY = [0.004, 0.0048, 0.0058, 0.0075, 0.0095, 0.012, 0.015, 0.022, 0.032, 0.046, 0.044, 0.034, 0.026];
  const body = catmull(P);
  const keyT = P.map((p) => body.closestT(p));
  const prof = (arr: number[], t: number) => {
    if (t <= keyT[0]) return arr[0];
    for (let i = 1; i < keyT.length; i++) {
      if (t <= keyT[i]) {
        const u = (t - keyT[i - 1]) / Math.max(1e-6, keyT[i] - keyT[i - 1]);
        const k = u * u * (3 - 2 * u);
        return arr[i - 1] + (arr[i] - arr[i - 1]) * k;
      }
    }
    return arr[arr.length - 1];
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: P[8], role: "spine" });
  const rootT = body.closestT(hips.at);
  const spine = b.chain("spine", body.slice(rootT, 1), {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "spine3", "neck"],
    role: "spine",
  });
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: hips, count: 8, role: "tail" });

  // ---------- paints ----------
  const bands = stripes(GREEN, TEAL, { size: 0.05, width: 0.35, wobble: 0.6, seed: 3 });
  const shaded = countershade(bands, BELLY, { level: -0.35 });
  const spotted = spots(shaded, ORANGE, { size: 0.028, amount: 0.12, seed: 9 });
  const skin = scales(spotted, EDGE, { size: 0.0045, seed: 2 });
  const tA = keyT[7];
  const tB = keyT[11] + 0.03;
  const bodyPaint = paint((p, _n, s) => {
    const t = s[0];
    const deg = ((s[1] % 360) + 360) % 360;
    const off = Math.abs(deg - 180);
    if (t > tA && t < tB && off > 58 && off < 70 && Math.sin(p.z * 260) > -0.4) return CREAM;
    return skin;
  });
  const legPaint = scales(mottle(GREEN, TEAL, { size: 0.02, seed: 4 }), EDGE, { size: 0.0035, seed: 6 });
  const footPaint = scales(FOOT, EDGE, { size: 0.003, seed: 12 });
  const headPaint = scales(
    countershade(mottle(GREEN, LIME, { size: 0.015, seed: 21 }), BELLY, { level: -0.25 }),
    EDGE,
    { size: 0.004, seed: 8 },
  );
  const jawPaint = scales(countershade(GREEN, BELLY, { level: 0.1 }), EDGE, { size: 0.0035, seed: 14 });
  const greenScales = scales(GREEN, EDGE, { size: 0.004, seed: 31 });
  const tealScales = scales(TEAL, EDGE, { size: 0.004, seed: 32 });
  const casquePaint = paint((_p, n, s) => {
    if (Math.abs(n.x) < 0.5) return GOLD; // rim walls
    const k = Math.floor((s[0] * 0.8 + s[1]) / 0.011);
    return ((k % 2) + 2) % 2 ? tealScales : greenScales;
  });

  // ---------- body + tail, one skinned tube ----------
  const bodySweep = b.sweep(body, (t: number) => [prof(RX, t), prof(RY, t)] as [number, number], {
    bone: [tail, hips, spine],
    shift: (t: number) => [0, -0.22 * prof(RY, t)] as [number, number],
    color: bodyPaint,
    sides: 10,
  });

  // dorsal crest of little cones
  const crestFrom = keyT[6];
  const crestTo = 0.955;
  b.along(
    bodySweep,
    22,
    (at) => {
      const u = (at.t - crestFrom) / (crestTo - crestFrom);
      const len = 0.0035 + 0.006 * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
      b.stick(new THREE.ConeGeometry(0.0024, len, 5), CREST, at, { embed: 0.25 });
    },
    { from: crestFrom, to: crestTo },
  );

  // raised tubercles on the flanks
  const bodySurf = b.surface(bodySweep);
  const tub = bodySurf.scatter(40, {
    rng: rng(11),
    minDist: 0.012,
    filter: (h) => {
      const q = vec(h.at);
      return q.z > -0.1 && q.z < 0.07 && Math.abs(h.n.x) > 0.55 && q.y > 0.11;
    },
  });
  tub.forEach((h, i) =>
    b.stick(new THREE.SphereGeometry(0.0024, 6, 4), i % 3 === 0 ? GOLD : ORANGE, h, { embed: 0.5 }),
  );

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root = front ? [s * 0.016, 0.118, 0.055] : [s * 0.016, 0.115, -0.07];
      const foot = front ? [s * 0.072, 0.022, 0.085] : [s * 0.075, 0.022, -0.095];
      const lens = front ? [0.062, 0.062] : [0.06, 0.06];
      const pts = limb(root, foot, lens, [[s * 0.5, 0.4, front ? -1 : 1]]);
      const names = front ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`] : [`hip${S}`, `knee${S}`, `ankle${S}`];
      const leg = b.chain(front ? `arm${S}` : `leg${S}`, pts, {
        parent: front ? spine.joints[2] : hips,
        names,
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, [0.0085, 0.0062, 0.0046], { color: legPaint, sides: 8 });

      // zygodactyl toe bundles: one forward-inward, one backward-outward
      const w = pts[pts.length - 1];
      const bundles = [
        { d: [-s * 0.35, 0, 1], n: front ? 3 : 2, tag: "In" },
        { d: [s * 0.6, 0, -1], n: front ? 2 : 3, tag: "Out" },
      ];
      for (const bd of bundles) {
        const d = new THREE.Vector3(bd.d[0], bd.d[1], bd.d[2]).normalize();
        const L = 0.024;
        const tip = new THREE.Vector3(w.x + d.x * L, 0.0028, w.z + d.z * L);
        const ctrl = new THREE.Vector3(w.x + d.x * L * 0.35, 0.006, w.z + d.z * L * 0.35);
        const path = bezier(w, ctrl, tip);
        const base = `${front ? "finger" : "toe"}${bd.tag}${S}`;
        const dig = b.chain(base, path, {
          parent: leg.tip!,
          count: 2,
          names: [`${base}1`, `${base}2`],
          role: "digit",
          up: [0, 1, 0],
        });
        const rx = bd.n === 3 ? 0.0056 : 0.0046;
        const nToes = bd.n;
        const toePaint = paint((_p, _n, st) => {
          const deg = ((st[1] % 360) + 360) % 360;
          const a = deg > 180 ? deg - 360 : deg;
          if (st[0] > 0.3) {
            if (nToes === 3 && Math.abs(Math.abs(a) - 25) < 4) return EDGE;
            if (nToes === 2 && Math.abs(a) < 4) return EDGE;
          }
          return footPaint;
        });
        b.sweep(dig, (t: number) => [rx * (1 - 0.35 * t), 0.0042 * (1 - 0.3 * t)] as [number, number], {
          color: toePaint,
          sides: 8,
        });
        for (let k = 0; k < bd.n; k++) {
          const off = k - (bd.n - 1) / 2;
          const cd = d.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), off * 0.45);
          const sideOff = new THREE.Vector3(-d.z, 0, d.x).multiplyScalar(off * 0.0022);
          const cb = tip.clone().add(sideOff).add(new THREE.Vector3(0, 0.0005, 0));
          b.spike(cb, cd, 0.0065, 0.0011, { color: CLAW, bone: dig.joints[1] });
        }
      }
    }
  }

  // ---------- head ----------
  const head = b.joint("head", { parent: spine.joints[3], at: P[12], dir: [0, -0.18, 1], role: "head" });
  const H = (x: number, y: number, z: number) => head.local({ left: x, up: y, forward: z });

  const skull = b.loft(
    [
      { at: H(0, 0.005, -0.012), w: 0.040, h: 0.048 },
      { at: H(0, 0.004, 0.018), w: 0.044, h: 0.044 },
      { at: H(0, -0.002, 0.040), w: 0.034, h: 0.028 },
      { at: H(0, -0.006, 0.058), w: 0.020, h: 0.016 },
    ],
    { bone: head, color: headPaint, sides: 10 },
  );
  const skullSurf = b.surface(skull);

  // jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0, -0.010, -0.004),
    aim: H(0, -0.022, 0.06),
    role: "jaw",
  });
  const jawLoft = b.loft(
    [
      { at: H(0, -0.016, 0.0), w: 0.036, h: 0.020 },
      { at: H(0, -0.020, 0.025), w: 0.034, h: 0.017 },
      { at: H(0, -0.020, 0.045), w: 0.025, h: 0.012 },
      { at: H(0, -0.017, 0.059), w: 0.015, h: 0.008 },
    ],
    { bone: jaw, color: jawPaint, sides: 10 },
  );
  const jawSurf = b.surface(jawLoft);

  // gular crest: white cones under the chin
  for (let i = 0; i < 7; i++) {
    const z = 0.004 + i * 0.008;
    const hit = jawSurf.ray(H(0, -0.08, z), [0, 1, 0]);
    if (hit) b.stick(new THREE.ConeGeometry(0.0018, 0.0068 - i * 0.0006, 5), CREAM, hit, { embed: 0.15, bone: jaw });
  }

  // lip lines and tongue
  for (const s of [1, -1]) {
    const lip = jawSurf.drape(
      bezier(H(s * 0.017, -0.017, 0.004), H(s * 0.016, -0.018, 0.032), H(s * 0.008, -0.017, 0.06)),
      { lift: 0.0006 },
    );
    b.sweep(lip, 0.0012, { color: LIP, bone: jaw, sides: 5 });
  }
  b.capsule(H(0, -0.012, 0.006), H(0, -0.014, 0.044), 0.0058, { color: PINK, bone: jaw });

  // nostrils
  for (const s of [1, -1]) {
    const nh = skullSurf.nearest(H(s * 0.006, 0.0, 0.062));
    b.stick(new THREE.SphereGeometry(0.0017, 6, 4), DEEP, nh, { embed: 0.5, bone: head });
  }

  // gold brow ridges running back toward the casque
  for (const s of [1, -1]) {
    const brow = skullSurf.drape(
      bezier(H(s * 0.012, 0.016, 0.046), H(s * 0.015, 0.024, 0.02), H(s * 0.010, 0.03, -0.006)),
      { lift: 0.0008 },
    );
    b.sweep(brow, 0.0018, { color: GOLD, bone: head, sides: 5 });
  }

  // casque: tall helmet, striped, beaded crest
  const casque = b.extrude(
    [
      [0.040, -0.004],
      [0.022, 0.012],
      [0.002, 0.030],
      [-0.018, 0.046, "sharp"],
      [-0.028, 0.036],
      [-0.031, 0.012],
      [-0.024, -0.010],
      [0.012, -0.013],
    ],
    { at: H(0, 0.012, 0), thickness: [0.028, 0.006], bevel: 0.002, smoothing: 1, color: casquePaint, bone: head },
  );
  const edges: number[][][] = [
    [[0.022, 0.012], [0.002, 0.030]],
    [[0.002, 0.030], [-0.018, 0.046]],
  ];
  for (const [a, c] of edges) {
    for (const t of [0.3, 0.5, 0.7]) {
      const x = a[0] + (c[0] - a[0]) * t;
      const y = a[1] + (c[1] - a[1]) * t;
      b.part(new THREE.SphereGeometry(0.0022, 6, 4), ORANGE, { bone: head, at: casque.local([x, y, 0]) });
    }
  }

  // turret eyes on their own joints
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const gaze = new THREE.Vector3(s, 0.22, 0.45).normalize();
    const eye = b.joint(`eye${S}`, { parent: head, at: H(s * 0.017, 0.008, 0.028), dir: [gaze.x, gaze.y, gaze.z] });
    const c = vec(eye.at);
    const rings = paint((p) => {
      const v = p.clone().sub(c).normalize();
      const a = Math.acos(Math.min(1, Math.max(-1, v.dot(gaze))));
      return Math.floor(a / 0.3) % 2 ? LIME : GREEN;
    });
    const turretPaint = scales(rings, EDGE, { size: 0.0028, seed: 40 });
    b.part(new THREE.SphereGeometry(0.012, 12, 8), turretPaint, { bone: eye, at: eye.at, dir: [gaze.x, gaze.y, gaze.z] });
    b.part(new THREE.CylinderGeometry(0.0048, 0.0048, 0.002, 12), GOLD, {
      bone: eye,
      at: eye.local([0, 0.0112, 0]),
      dir: [gaze.x, gaze.y, gaze.z],
    });
    b.part(new THREE.SphereGeometry(0.0028, 8, 6), BLACK, { bone: eye, at: eye.local([0, 0.0122, 0]) });
    b.part(new THREE.SphereGeometry(0.0009, 6, 4), WHITE, { bone: eye, at: eye.local([0.0012, 0.0146, 0.0012]) });
  }

  return b.root;
}
```