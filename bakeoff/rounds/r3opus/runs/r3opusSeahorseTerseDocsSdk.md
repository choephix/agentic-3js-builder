```ts
import * as THREE from "three";
import { createBuilder, catmull, offset, paint, spots } from "agentic-3js-builder";

export const meta = {
  name: "seahorse",
  description:
    "A stylized coral-orange seahorse in rest pose: ringed, spotted body with a curled prehensile tail, ray-striped dorsal and pectoral fins, crowned head, spiny brows and a split snout (upper and lower jaw).",
};

const ORANGE = "#f0873a";
const SPOT = "#fff1cf";
const LINE = "#b2432a";
const BELLY = "#ffd46a";
const BELLY_LINE = "#e79a3e";
const CORAL = "#d9542f";
const FIN = "#ffe08a";
const FIN_RAY = "#f19a3e";
const FIN_EDGE = "#fff6d8";
const GOLD = "#ffc23a";
const DARK = "#1c1a2c";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---------- centreline: tail tip (curl) up to the head base ----------
  const P: number[][] = [
    [0, 0.03, 0.003], // tail tip, inside the curl
    [0, 0.038, 0.012],
    [0, 0.03, 0.022],
    [0, 0.013, 0.02],
    [0, 0.0072, 0.0], // bottom of the curl, rests on the floor
    [0, 0.018, -0.02],
    [0, 0.045, -0.028],
    [0, 0.075, -0.022],
    [0, 0.1, -0.005], // hips
    [0, 0.13, 0.012], // belly / brood pouch
    [0, 0.16, 0.01], // chest
    [0, 0.185, -0.008], // neck
    [0, 0.205, -0.012], // head base
  ];
  const R = [0.002, 0.003, 0.004, 0.005, 0.0065, 0.008, 0.011, 0.015, 0.022, 0.026, 0.022, 0.014, 0.016];
  const bodyPath = catmull(P);
  const L = bodyPath.length;
  const keys = P.map((p, i) => [bodyPath.closestT(p), R[i]]);
  const rAt = (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, r0] = keys[i - 1];
        const [t1, r1] = keys[i];
        const u = (t - t0) / Math.max(1e-6, t1 - t0);
        const sm = u * u * (3 - 2 * u);
        return r0 + (r1 - r0) * sm;
      }
    }
    return keys[keys.length - 1][1];
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: P[8], role: "spine" });
  const rootT = bodyPath.closestT(hips.at);
  const spine = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "neck"],
    role: "spine",
  });
  const tail = b.chain("tail", bodyPath.slice(rootT, 0), { parent: hips, count: 8, role: "tail" });

  const snoutEnd = [0, 0.195, 0.056];
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: P[12],
    dir: [0, -0.01, 0.068],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.1925, 0.052],
    aim: [0, 0.192, 0.066],
    role: "jaw",
  });

  // ---------- paints ----------
  const skinBase = spots(ORANGE, SPOT, { size: 0.013, amount: 0.16, seed: 3 });
  const bodyPaint = paint((p, n, s) => {
    const ring = (((s[0] * L) / 0.0105) % 1 + 1) % 1;
    const front = n.z > 0.3 && p.y > 0.07;
    if (ring < 0.17) return front ? BELLY_LINE : LINE;
    return front ? BELLY : skinBase;
  });
  const headPaint = paint((_p, _n, s) =>
    s[0] > 0.55 && ((s[0] * 26) % 1) < 0.25 ? LINE : skinBase,
  );
  const finPaint = paint((_p, _n, s) => {
    const r = Math.hypot(s[0], s[1]);
    const ang = (Math.atan2(s[1], s[0]) * 180) / Math.PI;
    if (r > 0.0145) return FIN_EDGE;
    return ((ang % 11) + 11) % 11 < 2.6 ? FIN_RAY : FIN;
  });
  const pecPaint = paint((_p, _n, s) => {
    const ang = (Math.atan2(s[1], s[0]) * 180) / Math.PI;
    return ((ang % 14) + 14) % 14 < 3.5 ? FIN_RAY : FIN;
  });

  // ---------- body: one continuous skinned tube ----------
  const body = b.sweep(bodyPath, (t: number) => {
    const r = rAt(t);
    return [r * 0.78, r];
  }, { bone: [tail, hips, spine], color: bodyPaint, sides: 10, name: "body" });
  const bodySurf = b.surface(body);

  // ---------- head ----------
  const headLoft = b.loft(
    [
      { at: [0, 0.207, -0.022], w: 0.022, h: 0.026 },
      { at: [0, 0.208, -0.002], w: 0.026, h: 0.034 },
      { at: [0, 0.203, 0.018], w: 0.018, h: 0.022 },
      { at: [0, 0.198, 0.034], w: 0.009, h: 0.01 },
      { at: snoutEnd, w: 0.008, h: 0.0095 },
    ],
    { bone: head, color: headPaint, sides: 10, name: "skull" },
  );
  const headSurf = b.surface(headLoft);

  // upper jaw lip and lower jaw (separate, on the jaw joint)
  b.capsule([0, 0.1975, 0.053], [0, 0.1975, 0.066], 0.0038, { bone: head, color: CORAL, sides: 8, name: "upperJaw" });
  b.capsule(jaw.at, [0, 0.192, 0.065], 0.0032, { bone: jaw, color: CORAL, sides: 8, name: "lowerJaw" });

  // eyes with gold iris, pupil, highlight, and a brow of little spines
  for (const s of [1, -1]) {
    const eyeHit = headSurf.around([0, 0.207, 0.0]).at(s * 90, 12);
    if (!eyeHit) continue;
    b.stick(new THREE.SphereGeometry(0.0068, 10, 8), GOLD, eyeHit, { embed: 0.45, bone: head });
    b.stick(new THREE.SphereGeometry(0.0038, 8, 6), DARK, eyeHit.moved([0, 0.0042, 0]), { embed: 0.35, bone: head });
    b.stick(new THREE.SphereGeometry(0.0012, 6, 4), WHITE, eyeHit.moved([0.0015, 0.0068, 0.0018]), { embed: 0.3, bone: head });
    b.ring(eyeHit, { count: 5, radius: 0.0078, fromDeg: -70, toDeg: 70, tilt: 25 }, (item) =>
      b.spike(item, item, 0.004, 0.0012, { color: CORAL, sides: 5, bone: head }),
    );
    // gill-cover arc on the cheek
    const gill = headSurf.drape(
      [
        [s * 0.02, 0.219, -0.006],
        [s * 0.02, 0.208, 0.0],
        [s * 0.02, 0.196, -0.006],
      ],
      { lift: 0.0004 },
    );
    b.sweep(gill, 0.001, { color: LINE, bone: head, sides: 4 });
  }

  // coronet crown on the back of the head
  const crown = headSurf.around([0, 0.207, -0.005]).at(180, 58);
  if (crown) {
    b.lathe(
      [
        [0, 0],
        [0.0068, 0],
        [0.0056, 0.008],
        [0.0078, 0.0115],
        [0, 0.0108],
      ],
      { at: crown.at, axis: crown.n, segments: 6, color: CORAL, bone: head, name: "coronet" },
    );
    b.ring(crown.moved([0, 0.0108, 0]), { count: 5, radius: 0.006, tilt: 40 }, (item) =>
      b.spike(item, item, 0.0065, 0.0017, { color: GOLD, sides: 5, bone: head }),
    );
  }

  // ---------- bony knobs: back row and two side ridges ----------
  const tA = keys[5][0];
  const tB = keys[11][0];
  const N = 16;
  for (let i = 0; i < N; i++) {
    const t = tA + ((tB - tA) * (i + 0.5)) / N;
    const p = bodyPath.at(t);
    if (p.y < 0.035) continue;
    const back = bodySurf.ray([p.x, p.y, p.z - 0.1], [0, 0, 1]);
    if (back) b.spike(back, back, 0.0055, 0.0017, { color: CORAL, sides: 5 });
    if (t > keys[10][0]) continue;
    for (const s of [1, -1]) {
      const side = bodySurf.ray([s * 0.1, p.y, p.z - 0.002], [-s, 0, 0]);
      if (side) b.spike(side, side, 0.0032, 0.0013, { color: GOLD, sides: 5 });
    }
  }

  // ---------- dorsal fin (fan) ----------
  const dorsalY = 0.098;
  const dT = bodyPath.closestT([0, dorsalY, -0.006]);
  const dp = bodyPath.at(dT);
  const dHit = bodySurf.ray([0, dp.y, dp.z - 0.1], [0, 0, 1]);
  if (dHit) {
    const dorsal = b.joint("dorsalFin", {
      parent: dHit.bone ?? hips,
      at: dHit.at,
      dir: dHit.n,
      role: "fan",
    });
    const tan = bodyPath.tangentAt(dT);
    b.extrude(
      [
        [-0.018, 0, "sharp"],
        [0.018, 0, "sharp"],
        [0.016, 0.011],
        [0.008, 0.0175],
        [-0.004, 0.018],
        [-0.014, 0.012],
      ],
      {
        at: dHit.local([0, -0.004, 0]),
        x: tan,
        y: dHit.n,
        thickness: [0.0022, 0.0008],
        bevel: 0.0004,
        smoothing: 1,
        color: finPaint,
        bone: dorsal,
        name: "dorsalFin",
      },
    );
  }

  // ---------- pectoral fins behind the cheeks ----------
  for (const s of [1, -1]) {
    const np = bodyPath.at(bodyPath.closestT([0, 0.19, -0.01]));
    const hit = bodySurf.ray([s * 0.1, np.y, np.z], [-s, 0, 0]);
    if (!hit) continue;
    const pec = b.joint(s > 0 ? "pecFinL" : "pecFinR", {
      parent: hit.bone ?? spine.joints[2],
      at: hit.at,
      dir: [s, 0, -0.4],
      role: "fan",
    });
    b.extrude(
      [
        [-0.005, 0, "sharp"],
        [0.005, 0, "sharp"],
        [0.008, 0.007],
        [0.004, 0.0115],
        [-0.003, 0.0115],
        [-0.007, 0.006],
      ],
      {
        at: offset(hit.at, [-s, 0, 0], 0.002),
        x: [0, 1, 0],
        y: [s, 0, -0.4],
        thickness: [0.0016, 0.0006],
        smoothing: 1,
        color: pecPaint,
        bone: pec,
        name: s > 0 ? "pecFinL" : "pecFinR",
      },
    );
  }

  return b.root;
}
```