import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { aim, DEG, mid } from "../src/math";
import { catmull } from "../src/path";
import { noise, paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Tandem Attack Helicopter",
  description:
    "Low-poly tandem-seat attack helicopter: faceted olive camouflage hull, stub wings with rocket pods and missile racks, chin cannon, nose sensor ball, four-blade main rotor and crossed tail rotor, open cockpit doors with crew.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const C = {
  OLIVE: "#566240",
  OLIVE_D: "#363f29",
  OLIVE_L: "#6d7b4f",
  TAN: "#8d7f56",
  BELLY: "#8e9885",
  GREY_D: "#2b2f34",
  GREY: "#4b525a",
  GREY_L: "#8a929a",
  BLACK: "#16181b",
  METAL: "#b0b8be",
  GLASS: "#2c6479",
  GLASS2: "#4d93a8",
  GLINT: "#bde8f2",
  ACCENT: "#ff6a1f",
  RED: "#d0372a",
  WHITE: "#ecefe8",
  YELLOW: "#f0c93a",
  SEAT: "#5e4a36",
  SUIT: "#47563a",
  HELMET: "#d6d9cb",
  VISOR: "#e8a23a",
  BLADE: "#2a2d32",
};

// ---------------------------------------------------------------- geometry helpers (model space)
type P3 = [number, number, number];
type Pt = THREE.Vector3 | P3;
const V = (p: Pt) => (p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]));
const ID = new THREE.Quaternion();
const ONE = new THREE.Vector3(1, 1, 1);
const m4 = new THREE.Matrix4();

function place(g: THREE.BufferGeometry, at: Pt, q: THREE.Quaternion = ID, s?: P3) {
  m4.compose(V(at), q, s ? V(s) : ONE);
  return g.applyMatrix4(m4);
}
const eul = (r: P3) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG));
const box = (size: P3, at: Pt, rot?: P3) =>
  place(new THREE.BoxGeometry(size[0], size[1], size[2]), at, rot ? eul(rot) : ID);
const bar = (a: Pt, b: Pt, w: number, h: number, up: P3 = [0, 1, 0]) => {
  const d = V(b).sub(V(a));
  return place(new THREE.BoxGeometry(w, h, d.length()), mid(V(a), V(b)), aim(d, up, "z"));
};
const cyl = (a: Pt, b: Pt, r0: number, r1: number, sides = 6) => {
  const d = V(b).sub(V(a));
  return place(new THREE.CylinderGeometry(r1, r0, d.length(), sides, 1), mid(V(a), V(b)), aim(d));
};
const sph = (r: number, at: Pt, scale?: P3, ws = 8, hs = 6) => place(new THREE.SphereGeometry(r, ws, hs), at, ID, scale);


function fromTris(pos: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
function triPrism(a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, t: number) {
  const n = bb.clone().sub(a).cross(c.clone().sub(a)).normalize().multiplyScalar(t / 2);
  const top = [a, bb, c].map((p) => p.clone().add(n));
  const bot = [a, bb, c].map((p) => p.clone().sub(n));
  const pos: number[] = [];
  const tri = (x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) => pos.push(x.x, x.y, x.z, y.x, y.y, y.z, z.x, z.y, z.z);
  tri(top[0]!, top[1]!, top[2]!);
  tri(bot[0]!, bot[2]!, bot[1]!);
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    tri(bot[i]!, bot[j]!, top[j]!);
    tri(bot[i]!, top[j]!, top[i]!);
  }
  return fromTris(pos);
}

type Ring = { z: number; xc?: number; yb: number; yt: number; w: number; wb: number; wt: number };
const RING_N = 8;
function ringPts(r: Ring) {
  const H = r.yt - r.yb;
  const x0 = r.xc ?? 0;
  const prof: [number, number][] = [
    [r.wb, r.yb],
    [r.w, r.yb + 0.28 * H],
    [r.w, r.yb + 0.64 * H],
    [r.wt, r.yt],
    [-r.wt, r.yt],
    [-r.w, r.yb + 0.64 * H],
    [-r.w, r.yb + 0.28 * H],
    [-r.wb, r.yb],
  ];
  return prof.map(([x, y]) => new THREE.Vector3(x0 + x, y, r.z));
}
/** Faceted octagonal-section hull through rings ordered nose to tail. */
function ringLoft(rings: Ring[], capFront = true, capRear = true) {
  const pts = rings.map(ringPts);
  const pos: number[] = [];
  const tri = (x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) => pos.push(x.x, x.y, x.z, y.x, y.y, y.z, z.x, z.y, z.z);
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i]!;
    const B = pts[i + 1]!;
    for (let j = 0; j < RING_N; j++) {
      const k = (j + 1) % RING_N;
      tri(A[j]!, B[j]!, A[k]!);
      tri(A[k]!, B[j]!, B[k]!);
    }
  }
  const cap = (ring: THREE.Vector3[], front: boolean) => {
    const c = new THREE.Vector3();
    ring.forEach((p) => c.add(p));
    c.multiplyScalar(1 / ring.length);
    for (let j = 0; j < RING_N; j++) {
      const k = (j + 1) % RING_N;
      if (front) tri(c, ring[j]!, ring[k]!);
      else tri(c, ring[k]!, ring[j]!);
    }
  };
  if (capFront) cap(pts[0]!, true);
  if (capRear) cap(pts[pts.length - 1]!, false);
  return fromTris(pos);
}

function prep(g: THREE.BufferGeometry) {
  const r = g.index ? g.toNonIndexed() : g;
  if (!r.getAttribute("normal")) r.computeVertexNormals();
  if (!r.getAttribute("uv")) {
    const n = r.getAttribute("position").count;
    r.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  }
  return r;
}

export default function build() {
  const b = createBuilder({ name: "attackHelicopter", paintSize: 2048 });

  // ------------------------------------------------------------ merge buckets (one part per bone and colour)
  const buckets = new Map<string, { bone: Joint; color: string; geos: THREE.BufferGeometry[] }>();
  const put = (bone: Joint, color: string, ...geos: THREE.BufferGeometry[]) => {
    const key = `${bone.name}|${color}`;
    let e = buckets.get(key);
    if (!e) {
      e = { bone, color, geos: [] };
      buckets.set(key, e);
    }
    for (const g of geos) e.geos.push(prep(g));
  };

  // quad of 4 corners as two thin prisms in two glass tones
  const glassQuad = (bone: Joint, q: P3[], t = 0.03, c1 = C.GLASS, c2 = C.GLASS2) => {
    const [a, bb, c, d] = q.map(V) as [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
    put(bone, c1, triPrism(a, bb, c, t));
    put(bone, c2, triPrism(a, c, d, t));
  };
  const solidQuad = (bone: Joint, color: string, q: P3[], t = 0.05) => {
    const [a, bb, c, d] = q.map(V) as [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
    put(bone, color, triPrism(a, bb, c, t), triPrism(a, c, d, t));
  };
  // bilinear point on a quad (a=bottom-front, b=bottom-rear, c=top-rear, d=top-front): u front->rear, v bottom->top
  const bil = (q: P3[], u: number, v: number) => {
    const [a, bb, c, d] = q.map(V) as [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
    const lo = a.clone().lerp(bb, u);
    const hi = d.clone().lerp(c, u);
    return lo.lerp(hi, v);
  };
  const glint = (bone: Joint, q: P3[], out: P3, uv: [number, number][]) => {
    const pts = uv.map(([u, v]) => bil(q, u, v));
    const n = pts[1]!.clone().sub(pts[0]!).cross(pts[3]!.clone().sub(pts[0]!)).normalize();
    if (n.dot(V(out)) < 0) n.negate();
    const sh = n.multiplyScalar(0.018);
    const p = pts.map((x) => x.add(sh)) as [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
    put(bone, C.GLINT, triPrism(p[0], p[1], p[2], 0.012), triPrism(p[0], p[2], p[3], 0.012));
  };

  // ------------------------------------------------------------ skeleton
  const fus = b.joint("fuselage", { at: [0, 1.8, 0] });
  const ROT_C: P3 = [0, 3.95, -0.1];
  const rotor = b.joint("rotor", { parent: fus, at: [0, 3.78, -0.1], role: "hinge" });
  const blades: Joint[] = [];
  const bladeDirs: P3[] = [];
  for (let i = 0; i < 4; i++) {
    const th = (45 + 90 * i) * DEG;
    const d: P3 = [Math.sin(th), 0, Math.cos(th)];
    bladeDirs.push(d);
    blades.push(
      b.joint(`blade${i + 1}`, {
        parent: rotor,
        at: [ROT_C[0] + d[0] * 0.3, ROT_C[1], ROT_C[2] + d[2] * 0.3],
        aim: [ROT_C[0] + d[0] * 3, ROT_C[1], ROT_C[2] + d[2] * 3],
        role: "hinge",
      }),
    );
  }
  const tailRotor = b.joint("tailRotor", { parent: fus, at: [0.4, 2.95, -8.35], dir: [1, 0, 0], role: "hinge" });
  const stabilator = b.joint("stabilator", { parent: fus, at: [0, 2.3, -7.45], dir: [1, 0, 0], role: "hinge" });
  const gunYaw = b.joint("gunYaw", { parent: fus, at: [0, 0.9, 4.35], role: "hinge" });
  const gunPitch = b.joint("gunPitch", { parent: gunYaw, at: [0, 0.72, 4.45], dir: [0, 0, 1], role: "hinge" });
  const sensorYaw = b.joint("sensorYaw", { parent: fus, at: [0, 1.42, 5.55], role: "hinge" });
  const sensorPitch = b.joint("sensorPitch", { parent: sensorYaw, at: [0, 1.48, 5.7], dir: [0, 0, 1], role: "hinge" });

  // canopy corners (left side, +x): bottom-front, bottom-rear, top-rear, top-front
  const GQ: P3[] = [
    [0.34, 1.5, 4.95],
    [0.58, 1.78, 3.0],
    [0.28, 2.42, 3.4],
    [0.22, 2.4, 4.45],
  ];
  const PQ: P3[] = [
    [0.6, 2.22, 2.8],
    [0.62, 2.3, 0.65],
    [0.32, 3.0, 1.15],
    [0.3, 3.0, 2.45],
  ];
  const doorG = b.joint("doorGunnerL", { parent: fus, at: GQ[3]!, aim: GQ[2]!, role: "hinge" });
  const doorP = b.joint("doorPilotL", { parent: fus, at: PQ[3]!, aim: PQ[2]!, role: "hinge" });

  const gearJ: Record<string, Joint> = {};
  const wheelJ: Record<string, Joint> = {};
  const flapJ: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    gearJ[L] = b.joint(`gear${L}`, { parent: fus, at: [s * 0.78, 1.05, 0.85], aim: [s * 1.1, 0.62, 0.7], role: "hinge" });
    wheelJ[L] = b.joint(`wheel${L}`, { parent: gearJ[L]!, at: [s * 1.25, 0.38, 0.45], dir: [s, 0, 0], role: "hinge" });
    flapJ[L] = b.joint(`flap${L}`, { parent: fus, at: [s * 0.8, 1.6, 0.1], aim: [s * 2.72, 1.6, 0.1], role: "hinge" });
  }
  const tailFork = b.joint("tailFork", { parent: fus, at: [0, 0.6, -7.0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: tailFork, at: [0, 0.27, -7.0], dir: [1, 0, 0], role: "hinge" });

  // ------------------------------------------------------------ textures
  const panelSvg = (w: number, h: number, seed: number, label?: string) => {
    const r = ((): (() => number) => {
      let a = seed * 9301 + 49297;
      return () => {
        a = (a * 9301 + 49297) % 233280;
        return a / 233280;
      };
    })();
    const U = 200; // units per metre
    const W = w * U;
    const H = h * U;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">`;
    const ink = "#1d2316";
    // horizontal seams
    for (const y of [0.3, 0.72]) s += `<rect x="0" y="${H * y}" width="${W}" height="3" fill="${ink}"/>`;
    // vertical seams and hatches
    let x = 14;
    while (x < W - 30) {
      const wd = 70 + r() * 150;
      s += `<rect x="${x}" y="0" width="3" height="${H}" fill="${ink}"/>`;
      if (r() < 0.65) {
        const hy = H * (0.1 + r() * 0.15);
        const hh = H * (0.28 + r() * 0.18);
        s += `<rect x="${x + 12}" y="${hy}" width="${wd - 26}" height="${hh}" fill="none" stroke="${ink}" stroke-width="3"/>`;
        s += `<rect x="${x + wd / 2 - 4}" y="${hy + hh / 2 - 3}" width="8" height="6" fill="${ink}"/>`;
      }
      // rivet rows
      for (let k = 0; k < 6; k++) s += `<circle cx="${x + 9}" cy="${H * (0.06 + k * 0.16)}" r="2.2" fill="${ink}"/>`;
      x += wd;
    }
    if (label) s += `<text x="${W * 0.08}" y="${H * 0.9}" font-family="Arial, sans-serif" font-weight="700" font-size="${H * 0.16}" fill="#eeeedd">${label}</text>`;
    return svg(`${s}</svg>`, { size: 2048 });
  };
  const sharkSvg = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
      <path d="M6 62 C80 20 200 22 294 70 C220 112 90 116 6 78 Z" fill="#1a1010"/>
      <path d="M16 64 C90 34 200 36 280 70 C210 100 100 104 16 76 Z" fill="#c7261c"/>
      <path d="M30 60 L48 46 L62 58 L80 42 L96 56 L116 40 L134 55 L156 40 L174 56 L196 44 L212 58 L234 48 L246 62 Z" fill="#f6f0df"/>
      <path d="M40 80 L56 92 L70 80 L90 94 L106 82 L128 96 L146 84 L168 96 L186 84 L208 92 L224 80 L244 86 Z" fill="#f6f0df"/>
      <path d="M150 62 C190 56 230 66 248 74 C210 90 160 86 150 62 Z" fill="#ee6a6a"/>
      <circle cx="244" cy="30" r="15" fill="#f6f0df" stroke="#1a1010" stroke-width="5"/>
      <circle cx="248" cy="32" r="7" fill="#1a1010"/>
      <path d="M222 14 L268 24" stroke="#1a1010" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );
  const tailNumber = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <rect x="0" y="0" width="160" height="14" fill="#ff6a1f"/>
      <rect x="0" y="86" width="160" height="14" fill="#ff6a1f"/>
      <text x="80" y="68" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="58" fill="#ecefe8">0417</text>
    </svg>`,
    { size: 512 },
  );
  const finMark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M0 8 L70 8 L100 38 L100 62 L70 92 L0 92 L30 62 L30 38 Z" fill="#1a1d14"/>
      <path d="M6 20 L64 20 L88 42 L88 58 L64 80 L6 80 L28 58 L28 42 Z" fill="#ff6a1f"/>
      <path d="M14 34 L56 34 L72 46 L72 54 L56 66 L14 66 Z" fill="#ecefe8"/>
    </svg>`,
    { size: 256 },
  );
  const warnStripes = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40">
      <rect width="120" height="40" fill="#f0c93a"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${i * 24 - 10} 40 L${i * 24 + 6} 0 L${i * 24 + 18} 0 L${i * 24 + 2} 40 Z" fill="#16181b"/>`).join("")}
    </svg>`,
    { size: 256 },
  );
  const noStep = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
      <rect x="3" y="3" width="114" height="54" fill="none" stroke="#ecefe8" stroke-width="5"/>
      <text x="60" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="20" fill="#ecefe8">NO</text>
      <text x="60" y="49" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="20" fill="#ecefe8">STEP</text>
    </svg>`,
    { size: 256 },
  );
  const rocketFace = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#2b2f34"/>
      ${[
        [50, 50],
        ...[0, 1, 2, 3, 4, 5].map((i) => [50 + 20 * Math.cos((i * Math.PI) / 3), 50 + 20 * Math.sin((i * Math.PI) / 3)]),
        ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => [50 + 38 * Math.cos((i * Math.PI) / 6 + 0.26), 50 + 38 * Math.sin((i * Math.PI) / 6 + 0.26)]),
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#0c0d0f" stroke="#7b8d55" stroke-width="2.5"/>`)
        .join("")}
    </svg>`,
    { size: 128 },
  );
  const instr = (hue: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 50">
      <rect width="140" height="50" fill="#1b1e22"/>
      <rect x="5" y="6" width="38" height="38" rx="2" fill="#0a1a14" stroke="#555" stroke-width="2"/>
      <path d="M9 36 L18 22 L26 30 L34 14 L40 24" stroke="${hue}" stroke-width="2.5" fill="none"/>
      <rect x="51" y="6" width="38" height="38" rx="2" fill="#0a1a14" stroke="#555" stroke-width="2"/>
      <circle cx="70" cy="25" r="13" fill="none" stroke="${hue}" stroke-width="2.5"/>
      <path d="M70 25 L78 15" stroke="#ff6a1f" stroke-width="2.5"/>
      <rect x="97" y="6" width="38" height="38" rx="2" fill="#0a1a14" stroke="#555" stroke-width="2"/>
      <path d="M101 14 H131 M101 22 H125 M101 30 H131 M101 38 H119" stroke="${hue}" stroke-width="2.5"/>
      <circle cx="48" cy="46" r="1.8" fill="#ff6a1f"/><circle cx="94" cy="46" r="1.8" fill="#f0c93a"/>
    </svg>`,
      { size: 256 },
    );
  const grille = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 84">
      <rect width="80" height="84" fill="#0e0f11"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="4" y="${6 + i * 9.5}" width="72" height="4.5" fill="#3d4249"/>`).join("")}
      <rect x="37" y="2" width="6" height="80" fill="#2b2f34"/>
      <circle cx="40" cy="42" r="9" fill="#5a6068"/><circle cx="40" cy="42" r="4" fill="#161719"/>
    </svg>`,
    { size: 192 },
  );

  const rescue = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 60">
      <rect x="2" y="2" width="186" height="56" fill="#ecefe8" stroke="#1a1a1a" stroke-width="3"/>
      <path d="M18 46 L38 14 L58 46 L48 46 L48 52 L28 52 L28 46 Z" fill="#d0372a"/>
      <text x="125" y="41" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="23" fill="#d0372a">RESCUE</text>
    </svg>`,
    { size: 512 },
  );
  // ------------------------------------------------------------ paints
  const camo = paint((p, n) => {
    if (n.y < -0.5) return C.BELLY;
    const v = noise(p, 2.4, 3) * 0.75 + noise(p, 0.9, 9) * 0.25;
    return v < 0.42 ? C.OLIVE_D : v < 0.58 ? C.OLIVE : v < 0.66 ? C.OLIVE_L : C.TAN;
  });
  const bladePaint = paint((_p, _n, s) => {
    const x = s[0];
    const y = s[1];
    if (x > 6.55) return C.ACCENT;
    if (x > 6.3) return C.WHITE;
    if (x < 0.8) return C.GREY;
    if (y > 0.22) return C.METAL;
    if (y < -0.2) return "#3b4048";
    if ((x > 1.9 && x < 2.02) || (x > 4.1 && x < 4.22)) return C.WHITE;
    return C.BLADE;
  });
  const tailBladePaint = paint((_p, _n, s) => (Math.abs(s[0]) > 1.12 ? C.ACCENT : Math.abs(s[0]) < 0.25 ? C.GREY : C.BLADE));

  // ------------------------------------------------------------ hull
  const hullRings: Ring[] = [
    { z: 5.75, yb: 1.02, yt: 1.42, w: 0.22, wb: 0.13, wt: 0.17 },
    { z: 5.05, yb: 0.9, yt: 1.28, w: 0.46, wb: 0.26, wt: 0.38 },
    { z: 3.95, yb: 0.84, yt: 1.25, w: 0.7, wb: 0.46, wt: 0.66 },
    { z: 3.0, yb: 0.82, yt: 1.25, w: 0.74, wb: 0.5, wt: 0.72 },
    { z: 2.92, yb: 0.82, yt: 1.7, w: 0.78, wb: 0.52, wt: 0.74 },
    { z: 1.0, yb: 0.8, yt: 1.7, w: 0.8, wb: 0.55, wt: 0.74 },
    { z: 0.5, yb: 0.8, yt: 1.7, w: 0.82, wb: 0.55, wt: 0.76 },
    { z: 0.45, yb: 0.8, yt: 2.52, w: 0.92, wb: 0.58, wt: 0.7 },
    { z: -1.2, yb: 0.85, yt: 2.62, w: 0.98, wb: 0.62, wt: 0.9 },
    { z: -2.6, yb: 1.0, yt: 2.7, w: 0.86, wb: 0.5, wt: 0.6 },
    { z: -3.7, yb: 1.7, yt: 2.65, w: 0.5, wb: 0.3, wt: 0.34 },
  ];
  const hull = b.part(ringLoft(hullRings), camo, { bone: fus, at: [0, 0, 0], name: "hull", flat: true });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // cockpit sill walls
    const gw: Ring[] = [
      { z: 4.98, xc: s * 0.32, yb: 1.2, yt: 1.55, w: 0.11, wb: 0.11, wt: 0.085 },
      { z: 4.6, xc: s * 0.4, yb: 1.2, yt: 1.7, w: 0.12, wb: 0.12, wt: 0.095 },
      { z: 3.8, xc: s * 0.52, yb: 1.2, yt: 1.76, w: 0.13, wb: 0.13, wt: 0.1 },
      { z: 3.0, xc: s * 0.58, yb: 1.2, yt: 1.78, w: 0.13, wb: 0.13, wt: 0.1 },
    ];
    b.part(ringLoft(gw), C.OLIVE, { bone: fus, at: [0, 0, 0], name: `sillG${L}`, flat: true });
    const pw: Ring[] = [
      { z: 2.8, xc: s * 0.6, yb: 1.65, yt: 2.22, w: 0.13, wb: 0.13, wt: 0.1 },
      { z: 1.5, xc: s * 0.61, yb: 1.65, yt: 2.26, w: 0.13, wb: 0.13, wt: 0.1 },
      { z: 0.58, xc: s * 0.62, yb: 1.65, yt: 2.3, w: 0.13, wb: 0.13, wt: 0.1 },
    ];
    b.part(ringLoft(pw), C.OLIVE, { bone: fus, at: [0, 0, 0], name: `sillP${L}`, flat: true });

    // engine nacelle
    const nac: Ring[] = [
      { z: 0.25, xc: s * 0.92, yb: 2.45, yt: 2.95, w: 0.3, wb: 0.22, wt: 0.2 },
      { z: -0.05, xc: s * 0.92, yb: 2.4, yt: 3.2, w: 0.38, wb: 0.26, wt: 0.28 },
      { z: -1.4, xc: s * 0.92, yb: 2.4, yt: 3.28, w: 0.4, wb: 0.26, wt: 0.3 },
      { z: -2.6, xc: s * 0.92, yb: 2.42, yt: 3.1, w: 0.34, wb: 0.24, wt: 0.24 },
      { z: -3.2, xc: s * 0.92, yb: 2.5, yt: 2.95, w: 0.24, wb: 0.18, wt: 0.2 },
    ];
    const nacP = b.part(ringLoft(nac), camo, { bone: fus, at: [0, 0, 0], name: `nacelle${L}`, flat: true });
    b.decal(nacP, panelSvg(4.0, 0.7, 3 + (s > 0 ? 0 : 7)), {
      at: [s * 1.3, 2.85, -1.5],
      dir: [s, 0, 0],
      size: [4.0, 0.7],
      segments: [24, 4],
      name: `nacPanels${L}`,
    });

    // hull side panel lines
    b.decal(hull, panelSvg(6.4, 0.9, 11 + (s > 0 ? 0 : 5)), {
      at: [s * 0.85, 1.25, 2.0],
      dir: [s, 0, 0],
      size: [6.4, 0.9],
      segments: [48, 6],
      name: `hullPanels${L}`,
    });
    // shark mouth nose art
    b.decal(hull, sharkSvg, {
      at: [s * 0.4, 1.12, 4.85],
      dir: [s, 0, 0],
      size: [1.35, 0.54],
      segments: [16, 6],
      mirror: s < 0,
      name: `shark${L}`,
    });
  }
  // note: right-side decal faces the other way so mirror keeps the nose on the right of the drawing

  // ------------------------------------------------------------ tail boom, fin, stabilator
  const boom = b.sweep(
    catmull([
      [0, 2.2, -3.5],
      [0, 2.3, -5.2],
      [0, 2.42, -6.9],
      [0, 2.5, -8.5],
    ]),
    [0.5, 0.4, 0.27, 0.16],
    { section: { ngon: 8 }, caps: "flat", bone: fus, color: camo, name: "boom" },
  );
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.decal(boom, tailNumber, { at: [s * 0.3, 2.4, -6.1], dir: [s, 0, 0], size: [1.15, 0.72], segments: [8, 6], lift: 0.004, name: `boomNumber${L}` });
    b.decal(boom, panelSvg(1.6, 0.55, 21 + (s > 0 ? 0 : 4)), { at: [s * 0.4, 2.3, -4.65], dir: [s, 0, 0], size: [1.6, 0.55], segments: [10, 4], name: `boomPanels${L}` });
  }
  b.extrude(
    [
      [-6.4, 2.36],
      [-7.75, 4.3],
      [-8.6, 4.3],
      [-8.75, 2.62],
      [-8.75, 2.3],
    ] as OutlinePoint[],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.16, bevel: 0.025, color: camo, bone: fus, name: "fin" },
  );
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
      bone: fus,
      at: [s * 0.088, 3.62, -8.2],
      dir: [s, 0, 0],
      axis: "z",
      texture: finMark,
      name: `finMark${L}`,
    });
  }
  // stabilator
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0.42],
        [1.85, 0.26],
        [1.85, -0.4],
        [0, -0.5],
      ] as OutlinePoint[],
      {
        at: [0, 2.3, -7.45],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.07,
        bevel: 0.015,
        color: camo,
        bone: stabilator,
        name: `stabilator${s > 0 ? "L" : "R"}`,
      },
    );
    put(stabilator, C.GREY_D, box([0.04, 0.09, 0.5], [s * 1.87, 2.3, -7.7]));
    put(stabilator, C.ACCENT, box([0.05, 0.1, 0.12], [s * 1.88, 2.3, -7.35]));
  }
  put(stabilator, C.GREY_D, cyl([-0.3, 2.3, -7.5], [0.3, 2.3, -7.5], 0.12, 0.12, 8));

  // tail details
  for (const s of [1, -1]) {
    put(fus, C.GREY_D, box([0.14, 0.2, 0.9], [s * 0.34, 2.28, -4.9]), box([0.15, 0.04, 0.96], [s * 0.34, 2.4, -4.9]));
    for (let k = 0; k < 5; k++) put(fus, C.ACCENT, box([0.16, 0.018, 0.06], [s * 0.345, 2.2 + k * 0.03, -5.15 + k * 0.2]));
  }
  put(fus, C.OLIVE_D, bar([0, 2.68, -3.7], [0, 2.72, -8.1], 0.1, 0.12));
  put(fus, C.GREY_D, cyl([0, 2.7, -4.7], [0, 2.9, -4.7], 0.13, 0.1, 8));
  put(fus, C.METAL, bar([0, 4.3, -8.1], [0, 4.62, -8.35], 0.02, 0.1)); // fin antenna
  put(fus, C.GREY_D, box([0.16, 0.08, 0.3], [0, 4.33, -8.15]));
  // tail rotor gearbox
  put(fus, C.OLIVE_D, cyl([0.07, 2.95, -8.35], [0.34, 2.95, -8.35], 0.2, 0.15, 8));
  put(fus, C.GREY_D, bar([0.1, 2.6, -8.2], [0.1, 2.95, -8.35], 0.07, 0.07));
  // tail wheel and strut
  put(fus, C.GREY_D, cyl([0, 2.12, -6.25], [0, 0.66, -7.0], 0.07, 0.055, 6));
  put(fus, C.METAL, cyl([0, 1.55, -6.55], [0, 0.9, -6.9], 0.045, 0.045, 6));
  put(fus, C.GREY, bar([0, 2.0, -5.6], [0, 1.5, -6.6], 0.05, 0.05));
  put(tailFork, C.GREY_D, bar([0.12, 0.62, -7.0], [0.12, 0.27, -7.0], 0.04, 0.04), bar([-0.12, 0.62, -7.0], [-0.12, 0.27, -7.0], 0.04, 0.04), box([0.3, 0.05, 0.1], [0, 0.63, -7.0]));
  put(tailWheel, C.BLACK, cyl([-0.07, 0.27, -7.0], [0.07, 0.27, -7.0], 0.27, 0.27, 10));
  put(tailWheel, C.METAL, cyl([-0.09, 0.27, -7.0], [0.09, 0.27, -7.0], 0.14, 0.14, 8));

  // tail rotor: two crossed bars of two blades each
  for (const [k, ang] of [20, 75].entries()) {
    const r: P3 = [0, Math.cos(ang * DEG), Math.sin(ang * DEG)];
    const c: P3 = [0, -Math.sin(ang * DEG), Math.cos(ang * DEG)]; // X x r
    b.extrude(
      [
        [-1.3, 0.1],
        [1.3, 0.1],
        [1.3, -0.1],
        [-1.3, -0.1],
      ] as OutlinePoint[],
      { at: [0.46, 2.95, -8.35], x: r, y: [-c[0], -c[1], -c[2]], thickness: 0.035, bevel: 0.008, color: tailBladePaint, bone: tailRotor, name: `tailBlade${k + 1}` },
    );
  }
  put(tailRotor, C.GREY, cyl([0.34, 2.95, -8.35], [0.52, 2.95, -8.35], 0.15, 0.15, 8));
  put(tailRotor, C.ACCENT, cyl([0.52, 2.95, -8.35], [0.58, 2.95, -8.35], 0.1, 0.06, 8));

  // ------------------------------------------------------------ wings, flaps, pylons, weapons
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0.8, 0.55],
        [2.72, 0.4],
        [2.72, -0.05],
        [0.8, -0.05],
      ] as OutlinePoint[],
      { at: [0, 1.6, 0.15], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.02, color: camo, bone: fus, name: `wing${L}` },
    );
    b.extrude(
      [
        [0, 0],
        [1.92, 0],
        [1.92, -0.28],
        [0, -0.52],
      ] as OutlinePoint[],
      { at: [s * 0.8, 1.6, 0.1], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.012, color: camo, bone: flapJ[L]!, name: `flap${L}` },
    );
    for (const hx of [0.15, 1.0, 1.8]) put(flapJ[L]!, C.GREY_D, box([0.12, 0.09, 0.07], [s * (0.8 + hx), 1.6, 0.1]));
    // wingtip fairing + nav light
    put(fus, C.GREY_D, box([0.22, 0.14, 0.62], [s * 2.78, 1.6, 0.14]));
    glow(
      b.part(new THREE.SphereGeometry(0.05, 6, 4), s > 0 ? "#ff3030" : "#30ff70", { bone: fus, at: [s * 2.9, 1.6, 0.14], name: `navLight${L}` }),
      1.6,
    );
    b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone: fus, at: [s * 1.5, 1.662, -0.06], dir: [0, 1, 0], axis: "z", texture: noStep, up: [0, 0, s > 0 ? 1 : 1], name: `noStep${L}` });
    // rocket pod
    const px = s * 1.75;
    put(fus, C.OLIVE_D, bar([px, 1.57, 0.55], [px, 1.3, 0.45], 0.1, 0.01), box([0.08, 0.3, 0.5], [px, 1.45, 0.2]), box([0.14, 0.06, 0.9], [px, 1.31, 0.3]));
    put(fus, C.OLIVE, cyl([px, 1.1, -0.65], [px, 1.1, 1.1], 0.2, 0.2, 10));
    put(fus, C.OLIVE_D, cyl([px, 1.1, -0.9], [px, 1.1, -0.65], 0.12, 0.2, 10));
    put(fus, C.GREY_D, cyl([px, 1.1, -0.95], [px, 1.1, -0.9], 0.1, 0.12, 10));
    put(fus, C.ACCENT, cyl([px, 1.1, 0.85], [px, 1.1, 0.97], 0.208, 0.208, 10), cyl([px, 1.1, -0.4], [px, 1.1, -0.3], 0.208, 0.208, 10));
    put(fus, C.WHITE, cyl([px, 1.1, 0.97], [px, 1.1, 1.05], 0.205, 0.205, 10));
    b.part(new THREE.CircleGeometry(0.2, 10), "#ffffff", { bone: fus, at: [px, 1.1, 1.102], dir: [0, 0, 1], axis: "z", texture: rocketFace, name: `rocketFace${L}` });
    // quad missile rack
    const mx = s * 2.45;
    put(fus, C.GREY_D, box([0.1, 0.78, 0.9], [mx, 1.2, 0.25]), bar([mx, 1.57, -0.1], [mx, 1.5, 0.6], 0.2, 0.04));
    for (const dx of [-0.2, 0.2])
      for (const dy of [1.32, 1.04]) {
        const x = mx + dx;
        put(fus, C.GREY_D, bar([x - Math.sign(dx) * 0.1, dy, -0.1], [x - Math.sign(dx) * 0.1, dy, 0.7], 0.03, 0.2));
        put(fus, C.METAL, cyl([x, dy, -0.55], [x, dy, 1.0], 0.082, 0.082, 8));
        put(fus, C.WHITE, cyl([x, dy, 0.8], [x, dy, 0.88], 0.087, 0.087, 8));
        put(fus, C.ACCENT, cyl([x, dy, 0.6], [x, dy, 0.66], 0.087, 0.087, 8));
        put(fus, C.OLIVE_D, cyl([x, dy, 1.0], [x, dy, 1.24], 0.082, 0.02, 8));
        put(fus, C.GLASS2, sph(0.03, [x, dy, 1.25], undefined, 6, 4));
        put(fus, C.GREY_D, cyl([x, dy, -0.65], [x, dy, -0.55], 0.06, 0.082, 8));
        put(fus, C.OLIVE_D, box([0.34, 0.015, 0.18], [x, dy, -0.42]), box([0.015, 0.34, 0.18], [x, dy, -0.42]), box([0.2, 0.015, 0.14], [x, dy, 0.35]), box([0.015, 0.2, 0.14], [x, dy, 0.35]));
      }
  }
  // wing top stencils / hazard stripes on pods are drawn on parts above

  // ------------------------------------------------------------ landing gear
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const g = gearJ[L]!;
    const w = wheelJ[L]!;
    const M: P3 = [s * 0.78, 1.05, 0.85];
    const K: P3 = [s * 1.1, 0.62, 0.7];
    const A: P3 = [s * 1.25, 0.38, 0.45];
    put(g, C.GREY_D, cyl(M, K, 0.09, 0.075, 8));
    put(g, C.METAL, cyl([M[0] + (K[0] - M[0]) * 0.45, M[1] + (K[1] - M[1]) * 0.45, M[2] + (K[2] - M[2]) * 0.45], K, 0.055, 0.055, 6));
    put(g, C.GREY, bar(K, A, 0.09, 0.1), bar([s * 0.85, 1.35, 0.15], K, 0.06, 0.06), box([0.2, 0.14, 0.2], [s * 0.78, 1.05, 0.85]));
    put(g, C.ACCENT, cyl([M[0] + (K[0] - M[0]) * 0.3, M[1] + (K[1] - M[1]) * 0.3, M[2] + (K[2] - M[2]) * 0.3], [M[0] + (K[0] - M[0]) * 0.4, M[1] + (K[1] - M[1]) * 0.4, M[2] + (K[2] - M[2]) * 0.4], 0.095, 0.095, 8));
    // wheel
    const xin = A[0] - s * 0.14;
    const xout = A[0] + s * 0.14;
    put(w, C.BLACK, cyl([xin, A[1], A[2]], [xout, A[1], A[2]], 0.38, 0.38, 10));
    put(w, C.GREY_D, cyl([xin, A[1], A[2]], [xout + s * 0.01, A[1], A[2]], 0.31, 0.31, 10));
    put(w, C.METAL, cyl([xin - s * 0.01, A[1], A[2]], [xout + s * 0.03, A[1], A[2]], 0.2, 0.2, 10));
    put(w, C.GREY, cyl([xout + s * 0.02, A[1], A[2]], [xout + s * 0.07, A[1], A[2]], 0.08, 0.05, 8));
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      put(w, C.GREY_D, cyl([xout + s * 0.03, A[1] + 0.14 * Math.cos(a), A[2] + 0.14 * Math.sin(a)], [xout + s * 0.06, A[1] + 0.14 * Math.cos(a), A[2] + 0.14 * Math.sin(a)], 0.02, 0.02, 6));
    }
    put(w, C.GREY, bar([xin - s * 0.02, A[1], A[2]], [xin - s * 0.02, K[1], K[2]], 0.03, 0.05));
  }

  // ------------------------------------------------------------ engines, intakes, deck details
  for (const s of [1, -1]) {
    const x = s * 0.92;
    // intake mouth
    put(fus, C.BLACK, box([0.5, 0.52, 0.06], [x, 2.68, 0.255]));
    b.part(new THREE.PlaneGeometry(0.46, 0.48), "#ffffff", { bone: fus, at: [x, 2.68, 0.2875], dir: [0, 0, 1], axis: "z", texture: grille, name: `grille${s > 0 ? "L" : "R"}` });
    put(fus, C.ACCENT, bar([x - 0.28, 2.42, 0.26], [x + 0.28, 2.42, 0.26], 0.04, 0.04), bar([x - 0.28, 2.94, 0.26], [x + 0.28, 2.94, 0.26], 0.04, 0.04), bar([x - 0.28, 2.42, 0.26], [x - 0.28, 2.94, 0.26], 0.04, 0.04), bar([x + 0.28, 2.42, 0.26], [x + 0.28, 2.94, 0.26], 0.04, 0.04));
    for (let k = 0; k < 3; k++) put(fus, C.GREY, box([0.46, 0.02, 0.1], [x, 2.5 + k * 0.17, 0.3]));
    // louvres
    for (let k = 0; k < 5; k++) put(fus, C.GREY_D, box([0.32, 0.02, 0.12], [x, 3.255 - Math.abs(k - 2) * 0.004, -0.7 - k * 0.22]));
    for (let k = 0; k < 3; k++) put(fus, C.OLIVE_D, box([0.34, 0.025, 0.2], [x, 3.28, -1.9 - k * 0.25]));
    // exhaust
    put(fus, C.GREY_D, cyl([x, 2.72, -3.15], [x + s * 0.06, 2.8, -3.75], 0.2, 0.25, 8));
    put(fus, C.BLACK, cyl([x + s * 0.06, 2.8, -3.72], [x + s * 0.065, 2.805, -3.78], 0.2, 0.2, 8));
    put(fus, C.METAL, cyl([x + s * 0.055, 2.79, -3.6], [x + s * 0.06, 2.8, -3.7], 0.27, 0.27, 8));
    // nacelle accent band + handles
    put(fus, C.ACCENT, bar([x, 3.285, -2.5], [x, 3.285, -2.8], 0.3, 0.03));
    put(fus, C.GREY_D, bar([s * 1.31, 2.9, -0.5], [s * 1.31, 2.9, -0.9], 0.03, 0.03));
  }
  // raised access hatches, grilles and strakes on nacelles and hull
  for (const s of [1, -1]) {
    const nx = s * 1.322;
    for (const z of [-0.38, -0.92, -1.46]) {
      put(fus, C.OLIVE_L, box([0.03, 0.24, 0.4], [nx, 2.78, z]));
      put(fus, C.GREY_D, box([0.045, 0.04, 0.07], [nx, 2.78, z + 0.12]), box([0.045, 0.04, 0.07], [nx, 2.78, z - 0.12]));
    }
    put(fus, C.GREY_D, box([0.03, 0.22, 0.5], [s * 1.298, 2.78, -2.05]));
    for (let k = 0; k < 5; k++) put(fus, C.OLIVE_D, box([0.04, 0.018, 0.46], [s * 1.3, 2.7 + k * 0.04, -2.05]));
    put(fus, C.OLIVE_L, box([0.03, 0.26, 0.34], [s * 1.275, 2.78, -2.5]));
    const hx1 = s * 0.957;
    const hx2 = s * 0.889;
    put(fus, C.OLIVE_L, box([0.03, 0.4, 0.5], [hx1, 1.7, -1.75]), box([0.03, 0.34, 0.4], [hx2, 1.75, -2.38]));
    put(fus, C.GREY_D, box([0.045, 0.05, 0.08], [hx1, 1.7, -1.55]), box([0.045, 0.05, 0.08], [hx2, 1.75, -2.23]));
    for (const z of [-1.2, -2.05]) put(fus, C.OLIVE_D, box([0.04, 0.5, 0.04], [s * (0.97 - 0.06 * (-z - 1.2)), 1.7, z]));
    // wing-root fairing and hull strakes
    put(fus, C.OLIVE_D, box([0.32, 0.22, 1.05], [s * 0.86, 1.6, 0.18]));
    put(fus, C.GREY_D, box([0.04, 0.05, 0.4], [s * 0.9, 1.08, 1.7]), box([0.04, 0.05, 0.4], [s * 0.9, 1.08, 2.4]));
  }
  // gearbox fairing and mast
  put(fus, C.OLIVE_D, box([0.62, 0.32, 1.1], [0, 2.78, -0.15]), box([0.5, 0.1, 0.5], [0, 2.95, -0.1]));
  put(fus, C.OLIVE, cyl([0, 2.9, -0.1], [0, 3.45, -0.1], 0.5, 0.2, 8));
  put(fus, C.GREY_D, cyl([0, 3.4, -0.1], [0, 3.78, -0.1], 0.14, 0.14, 8));
  put(fus, C.GREY, cyl([0, 3.5, -0.1], [0, 3.55, -0.1], 0.36, 0.36, 12));
  put(fus, C.GREY_L, cyl([0, 3.55, -0.1], [0, 3.6, -0.1], 0.3, 0.3, 12));
  // rotor head
  put(rotor, C.GREY, cyl([0, 3.78, -0.1], [0, 3.82, -0.1], 0.34, 0.34, 12));
  put(rotor, C.GREY_L, cyl([0, 3.82, -0.1], [0, 4.08, -0.1], 0.3, 0.3, 8));
  put(rotor, C.ACCENT, cyl([0, 4.08, -0.1], [0, 4.2, -0.1], 0.22, 0.05, 8));
  put(rotor, C.GREY_D, cyl([0, 3.6, -0.1], [0, 3.66, -0.1], 0.32, 0.32, 12));
  for (let i = 0; i < 4; i++) {
    const d = bladeDirs[i]!;
    const at = (r: number, y: number): P3 => [ROT_C[0] + d[0] * r, y, ROT_C[2] + d[2] * r];
    const ph: P3 = [-d[2], 0, d[0]];
    put(rotor, C.GREY_D, cyl(at(0.25, 3.95), at(0.6, 3.95), 0.1, 0.1, 8));
    put(rotor, C.OLIVE_D, cyl(at(0.3, 3.95), at(0.5, 3.95), 0.13, 0.13, 8));
    // pitch link and horn
    const lp = at(0.55, 3.97);
    const base = at(0.34, 3.64);
    put(rotor, C.METAL, cyl([base[0] + ph[0] * 0.08, base[1], base[2] + ph[2] * 0.08], [lp[0] + ph[0] * 0.1, 3.9, lp[2] + ph[2] * 0.1], 0.016, 0.016, 5));
    put(rotor, C.GREY, bar(at(0.45, 3.95), [lp[0] + ph[0] * 0.14, 3.93, lp[2] + ph[2] * 0.14], 0.03, 0.03));
    // lead-lag damper
    put(rotor, C.GREY_D, cyl(at(0.2, 3.86), at(0.52, 3.9), 0.025, 0.025, 6));
    put(blades[i]!, C.GREY, cyl(at(0.5, 3.95), at(0.95, 3.95), 0.075, 0.07, 8));
    put(blades[i]!, C.ACCENT, cyl(at(0.88, 3.95), at(0.94, 3.95), 0.078, 0.078, 8));

    // blade: x radial, y chord (up x radial gives the chord, leading edge on +y)
    const chord: P3 = [-d[2], 0, d[0]];
    b.extrude(
      [
        [0, 0.28],
        [6.4, 0.27],
        [6.8, 0.2],
        [6.8, -0.14],
        [0.9, -0.27],
        [0, -0.27],
      ] as OutlinePoint[],
      {
        at: at(0.5, 3.95),
        x: d,
        y: [-chord[0], -chord[1], -chord[2]],
        thickness: 0.05,
        bevel: 0.012,
        color: bladePaint,
        bone: blades[i]!,
        name: `blade${i + 1}`,
      },
    );
  }
  // swashplate links
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + 0.4;
    put(fus, C.METAL, cyl([0.3 * Math.cos(a), 3.52, -0.1 + 0.3 * Math.sin(a)], [0.3 * Math.cos(a + 0.5), 3.62, -0.1 + 0.3 * Math.sin(a + 0.5)], 0.014, 0.014, 5));
  }

  // ------------------------------------------------------------ nose: sensor turret and chin gun
  put(sensorYaw, C.GREY_D, cyl([0, 1.42, 5.55], [0, 1.5, 5.55], 0.28, 0.24, 8));
  put(sensorPitch, C.OLIVE, sph(0.29, [0, 1.52, 5.95], [1, 0.9, 1.1], 8, 6));
  put(sensorPitch, C.GREY_D, cyl([0, 1.6, 6.12], [0, 1.6, 6.3], 0.15, 0.15, 8), cyl([0, 1.36, 6.08], [0, 1.36, 6.24], 0.1, 0.1, 8));
  put(sensorPitch, C.GLASS2, cyl([0, 1.6, 6.3], [0, 1.6, 6.33], 0.11, 0.11, 8), cyl([0, 1.36, 6.24], [0, 1.36, 6.27], 0.075, 0.075, 8));
  put(sensorPitch, C.GLINT, cyl([0.04, 1.64, 6.33], [0.04, 1.64, 6.335], 0.03, 0.03, 5));
  put(sensorPitch, C.OLIVE_D, box([0.5, 0.05, 0.1], [0, 1.52, 5.7]), box([0.12, 0.12, 0.08], [0.28, 1.52, 5.7]), box([0.12, 0.12, 0.08], [-0.28, 1.52, 5.7]));
  put(sensorPitch, C.ACCENT, bar([-0.15, 1.8, 5.85], [0.15, 1.8, 5.85], 0.04, 0.03));
  // night sensor on top
  put(sensorYaw, C.OLIVE_D, sph(0.14, [0, 1.78, 5.5], [1, 0.9, 1.1], 8, 6));
  put(sensorYaw, C.GREY_D, cyl([0, 1.78, 5.58], [0, 1.78, 5.68], 0.07, 0.07, 8));
  put(sensorYaw, C.GLASS2, cyl([0, 1.78, 5.68], [0, 1.78, 5.7], 0.052, 0.052, 8));
  put(sensorYaw, C.GREY, cyl([0, 1.55, 5.5], [0, 1.7, 5.5], 0.07, 0.07, 6));
  // chin gun
  put(gunYaw, C.GREY_D, cyl([0, 0.82, 4.35], [0, 0.94, 4.35], 0.26, 0.26, 10));
  put(gunPitch, C.GREY, box([0.4, 0.28, 0.8], [0, 0.7, 4.5]), box([0.5, 0.06, 0.5], [0, 0.82, 4.4]));
  put(gunPitch, C.GREY_D, box([0.16, 0.24, 0.4], [0.28, 0.7, 4.3]), box([0.12, 0.2, 0.5], [-0.26, 0.74, 4.5]));
  put(gunPitch, C.GREY_D, cyl([0, 0.7, 4.9], [0, 0.67, 6.15], 0.07, 0.07, 6));
  put(gunPitch, C.GREY, cyl([0, 0.7, 4.9], [0, 0.69, 5.5], 0.13, 0.11, 8));
  put(gunPitch, C.METAL, cyl([0, 0.675, 5.95], [0, 0.67, 6.22], 0.1, 0.1, 6));
  put(gunPitch, C.BLACK, box([0.025, 0.12, 0.1], [0.08, 0.67, 6.1]), box([0.025, 0.12, 0.1], [-0.08, 0.67, 6.1]));
  put(gunPitch, C.ACCENT, cyl([0, 0.69, 5.5], [0, 0.69, 5.56], 0.135, 0.135, 8));
  // nose bay sponsons and lights
  for (const s of [1, -1]) {
    put(fus, C.OLIVE_D, bar([s * 0.5, 0.88, 4.9], [s * 0.64, 0.86, 3.6], 0.14, 0.2));
    put(fus, C.GREY_D, box([0.1, 0.12, 0.34], [s * 0.4, 1.15, 5.15]));
    put(fus, C.ACCENT, box([0.02, 0.14, 0.3], [s * 0.7, 1.15, 3.7]));
  }
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), "#fff6d0", { bone: fus, at: [0, 0.92, 5.3], name: "landingLight" }), 1.4);
  put(fus, C.GREY_D, box([0.16, 0.06, 0.16], [0, 0.96, 5.3]));
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), "#ff3030", { bone: fus, at: [0, 2.84, -4.6], name: "strobeTop" }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), "#ff3030", { bone: fus, at: [0, 1.62, -3.4], name: "strobeBelly" }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), "#fff6d0", { bone: fus, at: [0, 4.28, -8.68], name: "tailLight" }), 1.4);
  // pitot
  put(fus, C.METAL, cyl([-0.32, 1.26, 5.3], [-0.32, 1.26, 6.0], 0.02, 0.012, 6), sph(0.03, [-0.32, 1.26, 6.02], undefined, 5, 4));
  put(fus, C.RED, bar([-0.32, 1.33, 5.5], [-0.32, 1.33, 5.85], 0.01, 0.12));
  // belly antennas + steps
  put(fus, C.GREY_D, box([0.02, 0.2, 0.16], [0, 0.72, 2.2], [-12, 0, 0]), box([0.02, 0.22, 0.16], [0, 0.78, -1.5], [12, 0, 0]));
  for (const s of [1, -1]) {
    put(fus, C.GREY_D, box([0.22, 0.03, 0.22], [s * 0.86, 1.0, 1.3]), box([0.22, 0.03, 0.22], [s * 0.86, 1.3, 1.3]));
    put(fus, C.METAL, bar([s * 0.8, 2.05, 2.25], [s * 0.8, 2.0, 1.6], 0.03, 0.03), bar([s * 0.8, 2.02, 1.0], [s * 0.8, 2.02, 0.7], 0.03, 0.03));
  }

  // ------------------------------------------------------------ canopies
  const mir = (q: P3[]) => q.map((p): P3 => [-p[0], p[1], p[2]]);
  const GQr = mir(GQ);
  const PQr = mir(PQ);
  const rod = (bone: Joint, p: P3, q: P3, r = 0.028, color = C.OLIVE_D) => put(bone, color, cyl(p, q, r, r, 6));

  // --- gunner canopy
  {
    const [bfl, brl, trl, tfl] = GQ as [P3, P3, P3, P3];
    const [bfr, brr, trr, tfr] = GQr as [P3, P3, P3, P3];
    // windscreen (a=BFR b=BFL c=TFL d=TFR), roof, right side
    const wind: P3[] = [bfr, bfl, tfl, tfr];
    glassQuad(fus, wind);
    glint(fus, wind, [0, 0.5, 1], [
      [0.12, 0.08],
      [0.24, 0.08],
      [0.5, 0.92],
      [0.38, 0.92],
    ]);
    glint(fus, wind, [0, 0.5, 1], [
      [0.64, 0.08],
      [0.7, 0.08],
      [0.82, 0.92],
      [0.76, 0.92],
    ]);
    glassQuad(fus, [tfr, tfl, trl, trr]);
    glassQuad(fus, GQr, 0.03); // right side
    glint(fus, GQr, [-1, 0.3, 0], [
      [0.3, 0.12],
      [0.4, 0.12],
      [0.6, 0.88],
      [0.5, 0.88],
    ]);
    solidQuad(fus, C.OLIVE_D, [brr, brl, trl, trr], 0.06);
    // door (left)
    glassQuad(doorG, GQ);
    glint(doorG, GQ, [1, 0.3, 0], [
      [0.3, 0.12],
      [0.4, 0.12],
      [0.6, 0.88],
      [0.5, 0.88],
    ]);
    // frames
    for (const [p, q] of [
      [bfl, tfl],
      [bfr, tfr],
      [tfl, tfr],
      [tfr, trr],
      [trl, trr],
      [bfl, bfr],
    ] as [P3, P3][])
      rod(fus, p, q);
    rod(fus, bfr, brr, 0.032);
    rod(fus, brr, trr);
    rod(doorG, bfl, brl, 0.032);
    rod(doorG, brl, trl);
    rod(doorG, tfl, trl);
    const m: P3 = [(bfl[0] + trl[0]) / 2, (bfl[1] + trl[1]) / 2, (bfl[2] + trl[2]) / 2];
    const m2: P3 = [(bfl[0] + tfl[0]) / 2, (bfl[1] + tfl[1]) / 2, (bfl[2] + tfl[2]) / 2];
    rod(doorG, [m2[0], m2[1], m2[2]], [(brl[0] + trl[0]) / 2, (brl[1] + trl[1]) / 2, (brl[2] + trl[2]) / 2], 0.02);
    put(doorG, C.GREY_D, box([0.04, 0.04, 0.12], [m[0] + 0.02, m[1] - 0.2, m[2] + 0.1]));
    put(doorG, C.GREY_D, box([0.05, 0.05, 0.08], [tfl[0], tfl[1], tfl[2] - 0.2]), box([0.05, 0.05, 0.08], [trl[0], trl[1], trl[2] + 0.2]));
    rod(fus, [-0.28, 2.43, 3.4], [-0.28, 2.43, 4.4], 0.02, C.GREY_D);
  }
  // --- pilot canopy
  {
    const [bfl, brl, trl, tfl] = PQ as [P3, P3, P3, P3];
    const [bfr, brr, trr, tfr] = PQr as [P3, P3, P3, P3];
    const wind: P3[] = [bfr, bfl, tfl, tfr];
    glassQuad(fus, wind);
    glint(fus, wind, [0, 0.5, 1], [
      [0.12, 0.08],
      [0.24, 0.08],
      [0.5, 0.92],
      [0.38, 0.92],
    ]);
    glassQuad(fus, [tfr, tfl, trl, trr]);
    glint(fus, [tfr, tfl, trl, trr], [0, 1, 0], [
      [0.12, 0.2],
      [0.22, 0.2],
      [0.45, 0.8],
      [0.35, 0.8],
    ]);
    glassQuad(fus, PQr);
    glint(fus, PQr, [-1, 0.3, 0], [
      [0.25, 0.12],
      [0.36, 0.12],
      [0.6, 0.88],
      [0.49, 0.88],
    ]);
    solidQuad(fus, C.OLIVE_D, [brr, brl, trl, trr], 0.07);
    glassQuad(doorP, PQ);
    glint(doorP, PQ, [1, 0.3, 0], [
      [0.25, 0.12],
      [0.36, 0.12],
      [0.6, 0.88],
      [0.49, 0.88],
    ]);
    for (const [p, q] of [
      [bfl, tfl],
      [bfr, tfr],
      [tfl, tfr],
      [tfr, trr],
      [trl, trr],
      [bfl, bfr],
    ] as [P3, P3][])
      rod(fus, p, q);
    rod(fus, bfr, brr, 0.032);
    rod(fus, brr, trr);
    rod(doorP, bfl, brl, 0.032);
    rod(doorP, brl, trl);
    rod(doorP, tfl, trl);
    rod(doorP, [(bfl[0] + tfl[0]) / 2 - 0.0, (bfl[1] + tfl[1]) / 2, (bfl[2] + tfl[2]) / 2], [(brl[0] + trl[0]) / 2, (brl[1] + trl[1]) / 2, (brl[2] + trl[2]) / 2], 0.02);
    put(doorP, C.GREY_D, box([0.05, 0.05, 0.08], [tfl[0], tfl[1], tfl[2] - 0.2]), box([0.05, 0.05, 0.08], [trl[0], trl[1], trl[2] + 0.2]), box([0.04, 0.04, 0.12], [0.56, 2.45, 1.7]));
  }
  // blast shield / partition between seats
  put(fus, C.OLIVE_D, box([1.1, 0.6, 0.2], [0, 2.0, 2.9]), box([0.9, 0.05, 0.3], [0, 2.33, 2.88]));
  solidQuad(fus, C.OLIVE_D, [[-0.6, 2.22, 2.8], [0.6, 2.22, 2.8], [0.62, 2.25, 3.0], [-0.62, 2.25, 3.0]], 0.04);

  // ------------------------------------------------------------ cockpit interior
  const crew = (hx: number, hy: number, hz: number, seatTop: number, stickTo: P3) => {
    put(fus, C.HELMET, sph(0.15, [hx, hy, hz], [1, 1.05, 1.1], 8, 6));
    put(fus, C.VISOR, sph(0.105, [hx, hy - 0.01, hz + 0.095], [1.12, 0.62, 0.55], 8, 5));
    put(fus, C.GREY_D, box([0.05, 0.1, 0.1], [hx + 0.155, hy - 0.02, hz]), box([0.05, 0.1, 0.1], [hx - 0.155, hy - 0.02, hz]));
    put(fus, C.GREY_D, box([0.1, 0.08, 0.06], [hx, hy - 0.1, hz + 0.16]));
    put(fus, C.SUIT, box([0.44, 0.52, 0.26], [hx, hy - 0.36, hz - 0.08]), box([0.4, 0.14, 0.4], [hx, seatTop + 0.12, hz + 0.0]));
    put(fus, C.ACCENT, bar([hx - 0.12, hy - 0.15, hz + 0.06], [hx - 0.12, hy - 0.62, hz + 0.06], 0.045, 0.02), bar([hx + 0.12, hy - 0.15, hz + 0.06], [hx + 0.12, hy - 0.62, hz + 0.06], 0.045, 0.02));
    put(fus, C.GREY_D, box([0.3, 0.05, 0.04], [hx, hy - 0.5, hz + 0.07]));
    // arms to the stick, legs to the pedals
    for (const sx of [1, -1]) {
      const sh: P3 = [hx + sx * 0.25, hy - 0.22, hz - 0.08];
      const el: P3 = [hx + sx * 0.3, hy - 0.5, hz + 0.12];
      put(fus, C.SUIT, cyl(sh, el, 0.055, 0.045, 6), cyl(el, [stickTo[0] + sx * 0.03, stickTo[1], stickTo[2]], 0.045, 0.04, 6));
      put(fus, C.GREY_D, sph(0.045, [stickTo[0] + sx * 0.03, stickTo[1], stickTo[2]], undefined, 5, 4));
      const kn: P3 = [hx + sx * 0.13, seatTop + 0.2, hz + 0.42];
      put(fus, C.SUIT, cyl([hx + sx * 0.13, seatTop + 0.14, hz - 0.02], kn, 0.08, 0.065, 6), cyl(kn, [hx + sx * 0.13, seatTop - 0.12, hz + 0.78], 0.065, 0.055, 6));
      put(fus, C.GREY_D, box([0.12, 0.08, 0.2], [hx + sx * 0.13, seatTop - 0.15, hz + 0.86]));
    }
  };
  // gunner (front, low)
  put(fus, C.GREY_D, box([0.52, 0.16, 0.52], [0, 1.33, 3.6]), box([0.5, 0.74, 0.08], [0, 1.87, 3.28], [-10, 0, 0]), box([0.28, 0.2, 0.07], [0, 2.28, 3.23]));
  put(fus, C.SEAT, box([0.46, 0.07, 0.44], [0, 1.44, 3.62]), box([0.42, 0.6, 0.05], [0, 1.85, 3.34], [-10, 0, 0]));
  crew(0, 2.2, 3.58, 1.44, [0, 1.7, 4.02]);
  put(fus, C.GREY, cyl([0, 1.26, 4.05], [0, 1.72, 4.03], 0.03, 0.025, 6));
  put(fus, C.GREY_D, sph(0.04, [0, 1.72, 4.03], undefined, 5, 4));
  put(fus, C.GREY_D, bar([0.4, 1.35, 3.4], [0.4, 1.6, 3.9], 0.04, 0.04), box([0.06, 0.06, 0.2], [0.4, 1.6, 3.95]));
  put(fus, C.OLIVE_D, box([0.82, 0.26, 0.55], [0, 1.6, 4.55]), box([0.72, 0.05, 0.5], [0, 1.75, 4.5]));
  put(fus, C.BLACK, box([0.72, 0.03, 0.12], [0, 1.77, 4.2]));
  // pilot (rear, high)
  put(fus, C.GREY_D, box([0.54, 0.2, 0.54], [0, 1.8, 1.5]), box([0.52, 0.8, 0.08], [0, 2.3, 1.2], [-10, 0, 0]), box([0.28, 0.22, 0.07], [0, 2.74, 1.14]));
  put(fus, C.SEAT, box([0.48, 0.07, 0.46], [0, 1.92, 1.52]), box([0.44, 0.64, 0.05], [0, 2.28, 1.25], [-10, 0, 0]));
  crew(0, 2.66, 1.5, 1.92, [0, 2.2, 1.95]);
  put(fus, C.GREY, cyl([0, 1.72, 1.97], [0, 2.2, 1.95], 0.03, 0.025, 6));
  put(fus, C.GREY_D, sph(0.04, [0, 2.2, 1.95], undefined, 5, 4));
  put(fus, C.GREY_D, bar([0.45, 1.95, 1.45], [0.45, 2.1, 1.95], 0.04, 0.04), box([0.06, 0.06, 0.2], [0.45, 2.1, 2.0]));
  put(fus, C.OLIVE_D, box([0.82, 0.3, 0.5], [0, 2.05, 2.55]), box([0.74, 0.05, 0.46], [0, 2.22, 2.5]));
  put(fus, C.BLACK, box([0.74, 0.03, 0.1], [0, 2.25, 2.2]));
  // instrument faces, facing the crew (-z)
  b.part(new THREE.PlaneGeometry(0.7, 0.22), "#ffffff", { bone: fus, at: [0, 1.62, 4.273], dir: [0, 0, -1], axis: "z", texture: instr("#44ff99"), name: "instrGunner" });
  b.part(new THREE.PlaneGeometry(0.7, 0.24), "#ffffff", { bone: fus, at: [0, 2.05, 2.298], dir: [0, 0, -1], axis: "z", texture: instr("#55ccff"), name: "instrPilot" });
  // floor mats
  put(fus, C.BLACK, box([0.8, 0.02, 0.9], [0, 1.27, 3.9]), box([0.8, 0.02, 0.9], [0, 1.72, 2.1]));
  // interior side consoles, switches, HUD combiners, mirrors
  for (const s of [1, -1]) {
    put(fus, C.GREY_D, box([0.1, 0.18, 0.8], [s * 0.32, 1.38, 3.85]), box([0.1, 0.16, 0.7], [s * 0.4, 1.8, 1.7]));
    put(fus, C.YELLOW, box([0.03, 0.03, 0.05], [s * 0.32, 1.49, 3.6]), box([0.03, 0.03, 0.05], [s * 0.4, 1.89, 1.5]));
    put(fus, C.RED, box([0.03, 0.03, 0.05], [s * 0.32, 1.49, 3.95]), box([0.03, 0.03, 0.05], [s * 0.4, 1.89, 1.85]));
    put(fus, C.METAL, box([0.03, 0.025, 0.1], [s * 0.32, 1.485, 4.1]), box([0.03, 0.025, 0.1], [s * 0.4, 1.885, 2.05]));
    put(fus, C.GREY_D, box([0.05, 0.05, 0.08], [s * 0.2, 3.07, 2.4]), box([0.04, 0.04, 0.08], [s * 0.2, 2.48, 4.35]));
    put(fus, C.GLASS2, box([0.1, 0.08, 0.012], [s * 0.2, 3.1, 2.33], [-20, 0, 0]), box([0.09, 0.07, 0.012], [s * 0.2, 2.51, 4.28], [-20, 0, 0]));
    put(fus, C.WHITE, box([0.06, 0.2, 0.012], [s * 0.7, 1.4, 3.0]));
  }
  put(fus, C.GLASS2, box([0.24, 0.16, 0.012], [0, 2.07, 3.95], [-25, 0, 0]), box([0.24, 0.16, 0.012], [0, 2.58, 2.0], [-25, 0, 0]));
  put(fus, C.GREY_D, bar([0, 1.75, 4.3], [0, 2.0, 3.95], 0.03, 0.03), bar([0, 2.22, 2.4], [0, 2.5, 2.0], 0.03, 0.03));
  // ejection handles and seat belts
  put(fus, C.YELLOW, box([0.22, 0.03, 0.03], [0, 2.32, 3.22]), box([0.22, 0.03, 0.03], [0, 2.82, 1.1]));
  put(fus, C.BLACK, box([0.5, 0.01, 0.2], [0, 1.455, 3.78]), box([0.5, 0.01, 0.2], [0, 1.945, 1.7]));
  // canopy cross bows
  for (const [z, x, y] of [
    [3.9, 0.27, 2.41],
    [1.8, 0.31, 3.0],
  ] as P3[]) put(fus, C.OLIVE_D, cyl([-x, y, z], [x, y, z], 0.026, 0.026, 6));
  // belly armour plate, wing walkways, dorsal wire antenna
  put(fus, C.OLIVE_D, box([0.72, 0.05, 2.3], [0, 0.79, 1.7]), box([0.5, 0.05, 1.0], [0, 0.86, 4.4]));
  for (const s of [1, -1]) put(fus, C.BLACK, box([0.5, 0.012, 0.28], [s * 1.25, 1.667, 0.38]));
  put(fus, C.GREY_D, cyl([0, 4.3, -8.1], [0, 3.2, -0.1], 0.007, 0.007, 4));
  // accent hazard bars on nacelle tops
  for (const s of [1, -1]) put(fus, C.WHITE, box([0.4, 0.015, 0.05], [s * 0.92, 3.11, -2.7]));
  // service decals
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.decal(hull, rescue, { at: [s * 0.76, 1.38, 1.9], dir: [s, 0, 0], size: [0.95, 0.3], segments: [10, 3], lift: 0.004, name: `rescue${L}` });
  }
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.34, 0.12), "#ffffff", { bone: fus, at: [s * 2.0, 1.662, -0.28], dir: [0, 1, 0], axis: "z", texture: warnStripes, name: `warn${s > 0 ? "L" : "R"}` });

  // ------------------------------------------------------------ flush merged buckets
  for (const e of buckets.values()) {
    b.part(mergeGeometries(e.geos)!, e.color, { bone: e.bone, at: [0, 0, 0], flat: true, name: `${e.bone.name}.${e.color.slice(1)}` });
  }

  // rest pose: crew doors open on the left
  b.pose(doorG, { axis: V(GQ[2]!).sub(V(GQ[3]!)), deg: -100 });
  b.pose(doorP, { axis: V(PQ[2]!).sub(V(PQ[3]!)), deg: -96 });

  return b.root;
}
