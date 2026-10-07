import * as THREE from "three";
import { createBuilder, rng, paint, spots, noise, svg, catmull } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully puffed pufferfish: a creamy yellow ball with brown leopard spots fading to a white belly, short spikes all over, a tiny pouting mouth, big worried eyes with golden rims, fluttering fan fins, a stubby fan tail and bubbles rising from its lips.",
};

const D2R = Math.PI / 180;

// palette
const CREAM = "#f2d77e";
const LIGHTCREAM = "#f8ebc4";
const BELLY = "#fcf9f0";
const BROWN = "#7a4a22";
const DARKBROWN = "#55311a";
const SPOT2 = "#93602d";
const SPIKE = "#fff3d4";
const GOLD = "#e3a838";
const EYEWHITE = "#fbfbf4";
const BROW = "#4a2b14";
const LIP = "#e9866a";
const MOUTH = "#4a1a1e";
const FINBASE = "#efc45a";
const FINMID = "#f8e3a2";
const RAY = "#c58c3a";
const FINEDGE = "#fff6dc";
const GILL = "#a87335";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "pufferfish" });

  const R = 0.15;
  const C = new THREE.Vector3(0, R, 0);
  const dirFrom = (az: number, el: number) =>
    new THREE.Vector3(
      Math.cos(el * D2R) * Math.sin(az * D2R),
      Math.sin(el * D2R),
      Math.cos(el * D2R) * Math.cos(az * D2R),
    );
  const pt = (d: THREE.Vector3, dist: number) => C.clone().addScaledVector(d, dist);
  const hash = (i: number) => {
    const x = Math.sin(i * 91.7 + 13.1) * 43758.5453;
    return x - Math.floor(x);
  };

  // ---------- paints ----------
  const spotted = spots(CREAM, [BROWN, DARKBROWN, SPOT2], { size: 0.034, amount: 0.42, seed: 11 });
  const sparse = spots(CREAM, [BROWN, SPOT2], { size: 0.034, amount: 0.18, seed: 11 });
  const coat = paint((p) => {
    const d = new THREE.Vector3(p.x, p.y - R, p.z).normalize();
    const k = d.y + (noise(p, 0.05, 5) - 0.5) * 0.3;
    if (k > 0.12) return spotted;
    if (k > -0.08) return sparse;
    if (k > -0.22) return CREAM;
    if (k > -0.38) return LIGHTCREAM;
    return BELLY;
  });
  const bubblePaint = paint((_p, n) => (n.y > 0.5 ? "#f2fbff" : n.y > -0.2 ? "#bfe9f7" : "#8fd3ea"));
  const fanPaint = (a0: number, L: number, rOut: number, edge: string) =>
    paint((_p, _n, s) => {
      const r = Math.hypot(s[0], s[1]);
      const ang = Math.atan2(s[1], s[0]) / D2R;
      const f = (ang - a0) / L;
      const dist = Math.abs(f - Math.round(f));
      if (r > rOut * 0.8) return edge;
      if (dist < 0.12 && r > 0.014) return RAY;
      return r < rOut * 0.4 ? FINBASE : FINMID;
    });
  const fan = (rOut: number, a0: number, a1: number, lobes: number, base: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [[-0.012, -base]];
    const n = lobes * 2;
    for (let k = 0; k <= n; k++) {
      const a = (a0 + ((a1 - a0) * k) / n) * D2R;
      const rr = k % 2 === 0 ? rOut : rOut * 0.88;
      pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
    }
    pts.push([-0.012, base]);
    return pts;
  };

  // ---------- skeleton ----------
  const body = b.joint("body", { at: C, dir: [0, 0, 1], role: "spine" });

  // ---------- body ball ----------
  const bodyPart = b.part(new THREE.SphereGeometry(R, 22, 16), coat, { bone: body, at: C, name: "bodyBall" });
  const surf = b.surface(bodyPart);

  // key directions
  const mouthDir = dirFrom(0, -6);
  const tailDir = dirFrom(180, 0);
  const keepOut: [THREE.Vector3, number][] = [
    [mouthDir, 22],
    [tailDir, 20],
    [dirFrom(180, 38), 15],
    [dirFrom(180, -38), 15],
  ];
  for (const s of [1, -1]) {
    keepOut.push([dirFrom(s * 38, 20), 26]);
    keepOut.push([dirFrom(s * 100, -4), 16]);
    keepOut.push([dirFrom(s * 32, 47), 14]);
    keepOut.push([dirFrom(s * 54, 2), 12]);
    keepOut.push([dirFrom(s * 86, -3), 10]);
  }

  // ---------- eyes ----------
  const irisTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#1c1410"/>
      <circle cx="50" cy="50" r="41" fill="#2a8a72"/>
      <circle cx="50" cy="50" r="32" fill="#63c7a2"/>
      <circle cx="50" cy="50" r="21" fill="#0b0b0b"/>
      <circle cx="64" cy="34" r="11" fill="#ffffff"/>
      <circle cx="37" cy="66" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const blushTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
      <ellipse cx="50" cy="30" rx="48" ry="28" fill="#f4a08c"/>
      <path d="M30 42 L40 18 M47 42 L57 18 M64 42 L74 18" stroke="#fcd3c6" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const dE = dirFrom(s * 38, 20);
    const eyeR = 0.04;
    const eyeCenter = pt(dE, R + 0.2 * eyeR);
    const gaze = dE.clone().add(new THREE.Vector3(0, 0.1, 0.55)).normalize();
    const eyeJ = b.joint(`eye${side}`, { parent: body, at: eyeCenter, dir: gaze });
    const sclera = b.part(new THREE.SphereGeometry(eyeR, 14, 10), EYEWHITE, {
      bone: eyeJ,
      at: eyeCenter,
      name: `sclera${side}`,
    });
    b.decal(sclera, irisTex, {
      at: eyeCenter.clone().addScaledVector(gaze, eyeR),
      dir: gaze,
      size: [0.05, 0.05],
      bone: eyeJ,
      name: `iris${side}`,
    });

    // golden rim around the eye
    const eyeHit = surf.around(C).at(s * 38, 20)!;
    const rimRing = b.ring(eyeHit, { count: 12, radius: 0.041 });
    const rim = surf.drape(catmull(rimRing.items, { closed: true }), { lift: 0.004 });
    b.sweep(rim, 0.0065, { color: GOLD, bone: body, name: `eyeRim${side}` });

    // worried brows: inner ends raised
    const browPts = [
      surf.around(C).at(s * 16, 50)!,
      surf.around(C).at(s * 32, 49)!,
      surf.around(C).at(s * 50, 41)!,
    ];
    const browPath = surf.drape(catmull(browPts), { lift: 0.006 });
    b.sweep(browPath, [0.0045, 0.0085, 0.005], { color: BROW, bone: body, name: `brow${side}` });

    // blush
    const dB = dirFrom(s * 54, 2);
    b.decal(bodyPart, blushTex, { at: pt(dB, R), dir: dB, size: [0.045, 0.028], bone: body, name: `blush${side}` });

    // gill slit
    const gillPts = [surf.around(C).at(s * 86, 8)!, surf.around(C).at(s * 84, -3)!, surf.around(C).at(s * 87, -14)!];
    b.sweep(surf.drape(catmull(gillPts), { lift: 0.002 }), 0.004, { color: GILL, bone: body, name: `gill${side}` });

    // pectoral fan fin
    const dF = dirFrom(s * 100, -4);
    const finDir = new THREE.Vector3(s * 0.72, 0, -0.69).normalize();
    const finJ = b.joint(`fin${side}`, { parent: body, at: pt(dF, R - 0.004), dir: finDir, role: "fan" });
    b.extrude(fan(0.058, -42, 42, 6, 0.011), {
      at: finJ.at,
      x: [finDir.x, finDir.y, finDir.z],
      y: [0, 1, 0],
      thickness: 0.0045,
      bevel: 0.0015,
      smoothing: 1,
      color: fanPaint(-42, 14, 0.058, FINEDGE),
      bone: finJ,
      name: `pectoral${side}`,
    });
  }

  // ---------- mouth ----------
  const snoutC = pt(mouthDir, R - 0.01);
  b.part(new THREE.SphereGeometry(0.036, 12, 8), coat, { bone: body, at: snoutC, name: "snout" });
  const L = pt(mouthDir, R + 0.02);
  const jaw = b.joint("jaw", {
    parent: body,
    at: pt(mouthDir, R + 0.012),
    aim: pt(mouthDir, R + 0.06),
    role: "jaw",
  });
  b.part(new THREE.TorusGeometry(0.016, 0.0075, 6, 12, Math.PI), LIP, {
    bone: body,
    at: L,
    dir: [mouthDir.x, mouthDir.y, mouthDir.z],
    axis: "z",
    up: [0, 1, 0],
    name: "upperLip",
  });
  b.part(new THREE.TorusGeometry(0.0165, 0.0085, 6, 12, Math.PI), LIP, {
    bone: jaw,
    at: L,
    dir: [mouthDir.x, mouthDir.y, mouthDir.z],
    axis: "z",
    up: [0, -1, 0],
    name: "lowerLip",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), LIP, {
      bone: body,
      at: L.clone().add(new THREE.Vector3(s * 0.0163, 0, 0)),
      name: `lipCorner${s > 0 ? "L" : "R"}`,
    });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), MOUTH, { bone: body, at: pt(mouthDir, R + 0.018), name: "mouthHole" });

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    [
      [0, R, -R + 0.02],
      [0, R + 0.003, -R - 0.015],
      [0, R + 0.006, -R - 0.04],
    ],
    { parent: body, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, [0.034, 0.024], { color: coat, name: "tailStub" });
  b.extrude(fan(0.078, -48, 48, 8, 0.016), {
    at: [0, R + 0.006, -R - 0.04],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.005,
    bevel: 0.0018,
    smoothing: 1,
    color: fanPaint(-48, 12, 0.078, BROWN),
    bone: tail.joints[1],
    name: "caudalFin",
  });

  // dorsal and anal fins
  b.extrude(fan(0.04, -34, 34, 4, 0.008), {
    at: pt(dirFrom(180, 38), R - 0.005),
    x: [0, 0.5, -1],
    y: [0, 1, 0.5],
    thickness: 0.004,
    bevel: 0.0014,
    smoothing: 1,
    color: fanPaint(-34, 17, 0.04, FINEDGE),
    bone: body,
    name: "dorsalFin",
  });
  b.extrude(fan(0.04, -34, 34, 4, 0.008), {
    at: pt(dirFrom(180, -38), R - 0.005),
    x: [0, -0.5, -1],
    y: [0, 1, -0.5],
    thickness: 0.004,
    bevel: 0.0014,
    smoothing: 1,
    color: fanPaint(-34, 17, 0.04, FINEDGE),
    bone: body,
    name: "analFin",
  });

  // ---------- spikes ----------
  const cosK = keepOut.map(([d, deg]) => [d, Math.cos(deg * D2R)] as [THREE.Vector3, number]);
  const hits = surf.scatter(190, {
    rng: rng(7),
    minDist: 0.032,
    filter: (h) => {
      const n = new THREE.Vector3(h.n.x, h.n.y, h.n.z);
      if (n.y < -0.72) return false;
      for (const [d, c] of cosK) if (n.dot(d) > c) return false;
      return true;
    },
  });
  hits.forEach((h, i) => {
    const n = new THREE.Vector3(h.n.x, h.n.y, h.n.z);
    const d = n
      .clone()
      .add(new THREE.Vector3((hash(i) - 0.5) * 0.2, 0.04, -0.3 + (hash(i + 50) - 0.5) * 0.1))
      .normalize();
    const len = 0.024 + 0.012 * hash(i + 100) + 0.008 * Math.max(0, n.y);
    b.spike(h.moved([0, -0.004, 0]), [d.x, d.y, d.z], len + 0.004, 0.0056, {
      color: SPIKE,
      bands: [
        [0.45, coat],
        [1, SPIKE],
      ],
      section: { ngon: 5 },
      name: `spike${i}`,
    });
  });

  // ---------- bubbles ----------
  const M = pt(mouthDir, R + 0.035);
  const bubbles: [number, number, number, number][] = [
    [0.004, 0.03, 0.035, 0.009],
    [-0.012, 0.075, 0.05, 0.013],
    [0.01, 0.135, 0.06, 0.018],
    [-0.008, 0.21, 0.055, 0.012],
    [0.016, 0.27, 0.07, 0.009],
    [-0.01, 0.32, 0.06, 0.006],
  ];
  bubbles.forEach(([x, y, z, r], i) => {
    const c = M.clone().add(new THREE.Vector3(x, y, z));
    b.part(new THREE.IcosahedronGeometry(r, 1), bubblePaint, { bone: body, at: c, flat: true, name: `bubble${i}` });
    b.part(new THREE.SphereGeometry(r * 0.28, 6, 4), WHITE, {
      bone: body,
      at: c.clone().add(new THREE.Vector3(-r * 0.35, r * 0.45, r * 0.62)),
      name: `bubbleShine${i}`,
    });
  });

  return b.root;
}
