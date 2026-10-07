```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, gradient, countershade, rng } from "agentic-3js-builder";

export const meta = {
  name: "Phoenix",
  description:
    "A phoenix rising with wings flung open: crimson-to-gold flame feathers, a plume crest, ribbon tail feathers trailing to the floor, amber eyes, a golden hooked beak and drifting embers.",
};

const DEG = Math.PI / 180;
const STOPS = ["#6e0812", "#b8101c", "#ee3f18", "#ff8a1c", "#ffbf26", "#ffe45c"];
function ramp(u: number): string {
  const x = Math.min(1, Math.max(0, u)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const c = new THREE.Color(STOPS[i]).lerp(new THREE.Color(STOPS[i + 1]), x - i);
  return "#" + c.getHexString();
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const GOLD = "#f6b81a";
  const TALON = "#7a4a10";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 1.2, -0.45] });
  const spinePts: number[][] = [
    [0, 1.2, -0.45],
    [0, 1.3, -0.15],
    [0, 1.5, 0.12],
    [0, 1.78, 0.36],
    [0, 2.0, 0.5],
  ];
  const spine = b.chain("spine", catmull(spinePts), {
    parent: root,
    names: ["pelvis", "spine1", "spine2", "neck1", "neck2"],
    role: "spine",
  });
  const chest = spine.joints[2];

  const body = b.sweep(spine, [0.07, 0.17, 0.25, 0.2, 0.1, 0.075], {
    color: countershade("#9b1018", "#ff7a1a", { level: -0.1 }),
  });

  // feather helper: flat flame-leaf lying on a plane with normal `nrm`
  function feather(
    base: THREE.Vector3, dir: THREE.Vector3, nrm: THREE.Vector3,
    L: number, w: number, cA: string, cB: string, bone: any, th: number,
  ) {
    const x = dir.clone().normalize();
    const n = nrm.clone().sub(x.clone().multiplyScalar(nrm.dot(x))).normalize();
    const y = n.clone().cross(x).normalize();
    const tip = base.clone().addScaledVector(x, L);
    const outline: any = [
      [0, 0],
      [0.2 * L, 0.5 * w],
      [0.5 * L, 0.36 * w],
      [0.7 * L, 0.5 * w],
      [L, 0.05 * w, "sharp"],
      [0.72 * L, -0.36 * w],
      [0.45 * L, -0.46 * w],
      [0.2 * L, -0.5 * w],
    ];
    return b.extrude(outline, {
      at: base, x: [x.x, x.y, x.z], y: [y.x, y.y, y.z], thickness: th,
      color: gradient(cA, cB, base.toArray(), tip.toArray()), bone,
    });
  }

  // ---------- head ----------
  const head = b.joint("head", { parent: spine.joints[spine.joints.length - 1], at: [0, 2.0, 0.5], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head, at: head.local({ forward: 0.06, down: 0.05 }), aim: head.local({ forward: 0.3, down: 0.05 }), role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.11, 8, 6), "#e8401a", { bone: head, at: head.local({ forward: 0.06 }), scale: [1, 0.95, 1.15] });
  b.sweep(bezier(head.local({ forward: 0.1 }), head.local({ forward: 0.3, up: 0.04 }), head.local({ forward: 0.37, down: 0.08 })), [0.06, 0.004], {
    bone: head, color: GOLD, sides: 6, caps: { start: "round", end: "point" },
  });
  b.rod(jaw.at, head.local({ forward: 0.27, down: 0.06 }), [0.04, 0.006], { bone: jaw, color: "#d9981a", sides: 6 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.036, 7, 5), "#ffb000", { bone: head, at: head.local({ left: s * 0.085, forward: 0.1, up: 0.03 }) });
    b.part(new THREE.SphereGeometry(0.019, 6, 4), "#2a0400", { bone: head, at: head.local({ left: s * 0.105, forward: 0.112, up: 0.03 }) });
  }
  // flame crest
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) / 3;
    const base = head.local({ left: a * 0.04, up: 0.1, forward: 0.03 });
    const dir = V(a * 0.55, 0.9, -0.5);
    const L = 0.55 - Math.abs(a) * 0.17;
    feather(base, dir, V(0, 0, 1), L, 0.13, ramp(0.35), ramp(0.8 + 0.2 * (1 - Math.abs(a))), head, 0.012);
  }
  for (const s of [1, -1]) {
    const pts: number[][] = [
      [s * 0.04, 2.1, 0.45], [s * 0.07, 2.28, 0.12], [s * 0.1, 2.2, -0.3], [s * 0.14, 1.95, -0.75],
    ];
    b.sweep(catmull(pts), (t: number) => [0.01 + 0.03 * Math.sin(Math.PI * Math.pow(t, 0.8)), 0.006], {
      bone: head, section: "box", caps: "point", color: gradient("#ee3f18", "#ffd84a", pts[0], pts[3]),
    });
  }

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 1.2, -0.45], [0, 1.1, -0.85], [0, 0.9, -1.3]]), {
    parent: spine.joints[0], names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  for (let k = -3; k <= 3; k++) {
    const ak = Math.abs(k);
    const wob = k % 2 === 0 ? 0.1 : -0.1;
    const pts: number[][] = [
      [k * 0.02, 1.18, -0.5],
      [k * 0.14, 1.0 - ak * 0.02, -1.0],
      [k * 0.3 + wob, 0.55 + ak * 0.08, -1.9 + ak * 0.12],
      [k * 0.42, ak === 0 ? 0.01 : 0.12 + ak * 0.13, -3.2 + ak * 0.27],
    ];
    const gm = pts[2];
    const col = gradient("#8e0f16", gradient("#ff6a18", "#ffd84a", gm, pts[3]), pts[0], gm);
    b.sweep(catmull(pts), (t: number) => [0.012 + 0.055 * Math.sin(Math.PI * Math.pow(t, 0.9)) * (k === 0 ? 1.2 : 1), 0.006], {
      bone: tail.joints[0], section: "box", caps: "point", color: col,
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([[s * 0.12, 1.15, -0.3], [s * 0.15, 1.0, 0.0], [s * 0.14, 0.82, -0.28]]),
      { parent: spine.joints[0], names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.05, 0.03], { color: GOLD, sides: 6 });
    for (const a of [-30, 0, 30]) {
      b.spike(leg.tip!, [Math.sin(a * DEG) * 0.8, -0.5, 0.8], 0.15, 0.018, { color: TALON, bone: leg.tip!, sides: 5 });
    }
    b.spike(leg.tip!, [0, -0.5, -0.8], 0.11, 0.016, { color: TALON, bone: leg.tip!, sides: 5 });
  }

  // ---------- wings ----------
  const Bz = V(0, 0, -1);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts: number[][] = [
      [s * 0.2, 1.55, 0.1], [s * 0.75, 1.9, -0.05], [s * 1.4, 2.3, -0.15], [s * 1.85, 2.85, -0.2],
    ];
    const armPath = catmull(pts);
    const wing = b.chain(`wing${side}`, armPath, {
      parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "wing",
    });
    b.sweep(wing, [0.07, 0.05, 0.035, 0.02], { color: "#8e0f16", sides: 6 });

    const rows = [
      { n: 15, sc: 1.0, lift: 0.0, w: 0.2, th: 0.012, off: 0.0, c0: 0.05, c1: 0.3 },
      { n: 13, sc: 0.6, lift: 0.03, w: 0.17, th: 0.011, off: 0.5, c0: 0.0, c1: 0.2 },
      { n: 10, sc: 0.32, lift: 0.055, w: 0.13, th: 0.01, off: 0.3, c0: 0.0, c1: 0.1 },
    ];
    for (const row of rows) {
      for (let i = 0; i < row.n; i++) {
        const u = Math.min(1, (i + row.off) / (row.n - (row.off > 0 ? 0.5 : 1)));
        const t = 0.08 + 0.92 * u;
        const base = new THREE.Vector3().copy(armPath.at(t) as any);
        const T = new THREE.Vector3().copy(armPath.tangentAt(t) as any).normalize();
        const Bp = Bz.clone().sub(T.clone().multiplyScalar(T.dot(Bz))).normalize();
        const phi = (8 + 72 * Math.pow(u, 1.4)) * DEG;
        const dir = Bp.multiplyScalar(Math.cos(phi)).addScaledVector(T, Math.sin(phi));
        dir.y -= 0.05;
        const Nw = new THREE.Vector3().crossVectors(T, Bz).normalize();
        if (Nw.y < 0) Nw.negate();
        base.addScaledVector(Nw, row.lift + (i % 2) * 0.014);
        const L = (0.5 + 0.65 * Math.pow(u, 0.8)) * row.sc;
        const bone = t < 0.33 ? wing.joints[0] : t < 0.66 ? wing.joints[1] : wing.joints[2];
        feather(base, dir, Nw, L, row.w, ramp(row.c0 + 0.5 * u), ramp(row.c1 + 0.7 * u), bone, row.th);
      }
    }
  }

  // ---------- breast and body plumage ----------
  const skin = b.surface(body);
  const hits = skin.scatter(90, { rng: rng(3), minDist: 0.07, filter: (h: any) => h.n.y > -0.3 });
  for (const h of hits as any[]) {
    const n = new THREE.Vector3().copy(h.n).normalize();
    const B = V(0, -0.15, -1);
    B.sub(n.clone().multiplyScalar(n.dot(B))).normalize();
    const base = new THREE.Vector3().copy(h.at).addScaledVector(n, -0.01);
    const u = Math.min(1, Math.max(0, (h.at.z + 0.5) / 1.1));
    feather(base, B, n, 0.16, 0.09, ramp(0.1 + 0.4 * u), ramp(0.3 + 0.5 * u), h.bone ?? chest, 0.01);
  }

  // ---------- embers ----------
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const sparkCols = ["#ffd24a", "#ff8a1c", "#fff1b0", "#ff5a14"];
  for (let i = 0; i < 44; i++) {
    const s = rnd() < 0.5 ? 1 : -1;
    const x = s * (0.5 + rnd() * 2.8);
    const y = 0.4 + rnd() * 3.4;
    const z = -1.2 + rnd() * 1.6;
    const r = 0.012 + rnd() * 0.018;
    const geo = rnd() < 0.5 ? new THREE.OctahedronGeometry(r, 0) : new THREE.TetrahedronGeometry(r * 1.3, 0);
    b.part(geo, sparkCols[i % sparkCols.length], { bone: root, at: [x, y, z], rotation: [rnd() * 180, rnd() * 180, 0] });
  }

  return b.root;
}
```