import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, offset } from "../../../../src/index";

export const meta = {
  "name": "Hydra of the Broken Pass",
  "description": "A five-headed hydra in a God of War style: a scarred, armoured swamp-beast with five fanged serpent necks, chained iron-shackled limbs, rune-lit scars and bronze-bound horns."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hideDark: "#2b3530",
  hide: "#3f4d44",
  hideLight: "#5d6e5f",
  belly: "#a89a78",
  bone: "#d9cfb4",
  boneDark: "#8a7f66",
  bloodRed: "#8e1f1a",
  mouthRed: "#a8322b",
  ember: "#ff6a1f",
  emberHot: "#ffc04a",
  eyeAmber: "#ffb81f",
  iron: "#3a3d44",
  ironLight: "#6b707a",
  bronze: "#8a5a2a",
  bronzeLight: "#c28a45",
  claw: "#c9bfa2",
  ink: "#15110f",
};
const M = {
  shoulders: [0, 2, 1.3] as [number, number, number],
  neckBase0: [0, 2.5, 1.5] as [number, number, number],
  neckBaseL1: [0.6, 2.45, 1.4] as [number, number, number],
  neckBaseL2: [1.1, 2.3, 1.25] as [number, number, number],
  neckBaseR1: [-0.6, 2.45, 1.4] as [number, number, number],
  neckBaseR2: [-1.1, 2.3, 1.25] as [number, number, number],
  hips: [0, 1.7, -1.5] as [number, number, number],
  tailRoot: [0, 1.6, -2.4] as [number, number, number],
  footFL: [1.3, 0, 1.6] as [number, number, number],
  footFR: [-1.3, 0, 1.6] as [number, number, number],
  footBL: [1.4, 0, -1.5] as [number, number, number],
  footBR: [-1.4, 0, -1.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const hips = J.hips, chest = J.chest;
  const stations = [
    { at: [0, 1.75, -2.2], w: 1.3, h: 1.1 },
    { at: [0, 1.8, -1.5], w: 2.9, h: 1.7 },
    { at: [0, 1.95, -0.5], w: 3.3, h: 1.9 },
    { at: [0, 2.05, 0.6], w: 3.6, h: 2.0 },
    { at: [0, 2.1, 1.5], w: 3.4, h: 1.9 },
    { at: [0, 2.05, 2.1], w: 2.2, h: 1.4 },
  ];
  const body = b.loft(stations as any, {
    bone: [hips, chest], color: P.hide, section: { ngon: 8 }, smooth: false,
  } as any);
  // pale belly
  b.loft(stations.map((s: any) => ({ at: [0, s.at[1] - s.h * 0.3, s.at[2]], w: s.w * 0.7, h: s.h * 0.45 })) as any,
    { bone: [hips, chest], color: P.belly, section: { ngon: 8 }, smooth: false } as any);
  // dorsal plates (hideLight)
  for (let i = 0; i < 6; i++) {
    const z = -1.9 + i * 0.8;
    b.part(new THREE.BoxGeometry(2.0, 0.18, 0.6), P.hideLight, { bone: z > 0.4 ? chest : hips, at: [0, 3.0 - Math.abs(z) * 0.02 - (z < -1 ? 0.3 : 0), z] });
  }
  // spine spikes
  for (let i = 0; i < 9; i++) {
    const z = -2.1 + i * 0.52;
    const y = (z > 1.7 ? 2.9 : z < -1.2 ? 2.55 : 3.0) + 0.05;
    const s = 0.35 + 0.25 * Math.sin((i / 8) * Math.PI);
    b.part(new THREE.ConeGeometry(0.13, s, 5), P.bone, { bone: z > 0.4 ? chest : hips, at: [0, y + s / 2, z] });
  }
  // armour mounds shoulders and hips
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.75, 8, 6), P.hideLight, { bone: chest, at: [s * 1.55, 2.4, 1.6], scale: [0.9, 0.85, 1.1] });
    b.part(new THREE.SphereGeometry(0.75, 8, 6), P.hideLight, { bone: hips, at: [s * 1.5, 2.35, -1.5], scale: [0.9, 0.85, 1.1] });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.11, 0.35, 5), P.bone, { bone: chest, at: [s * (1.5 + k * 0.12), 2.95 - k * 0.1, 1.3 + k * 0.3] });
      b.part(new THREE.ConeGeometry(0.1, 0.3, 5), P.bone, { bone: hips, at: [s * (1.45 + k * 0.1), 2.9 - k * 0.1, -1.7 + k * 0.3] });
    }
    // bronze bands + iron plates on the barrel
    for (const z of [-0.5, 0.5, 1.2]) {
      const bone = z > 0.4 ? chest : hips;
      b.part(new THREE.BoxGeometry(0.12, 1.5, 0.3), P.bronze, { bone, at: [s * 1.72, 1.95, z] });
      b.part(new THREE.BoxGeometry(0.2, 0.5, 0.4), P.iron, { bone, at: [s * 1.78, 2.1, z] });
      b.part(new THREE.SphereGeometry(0.07, 5, 4), P.bronzeLight, { bone, at: [s * 1.86, 2.3, z + 0.12] });
      b.part(new THREE.SphereGeometry(0.07, 5, 4), P.bronzeLight, { bone, at: [s * 1.86, 1.9, z - 0.12] });
    }
    // rune scars
    for (let k = 0; k < 4; k++) {
      const z = -1.6 + k * 0.9 + R() * 0.2, y = 2.0 + R() * 0.5;
      const bone = z > 0.4 ? chest : hips;
      b.part(new THREE.BoxGeometry(0.04, 0.4, 0.07), P.ember, { bone, at: [s * 1.84, y, z], rotation: [0, 0, 20 * s] } as any);
      b.part(new THREE.BoxGeometry(0.04, 0.07, 0.3), P.ember, { bone, at: [s * 1.84, y + 0.05, z], rotation: [20, 0, 0] } as any);
      b.part(new THREE.BoxGeometry(0.045, 0.12, 0.1), P.emberHot, { bone, at: [s * 1.85, y, z] });
    }
  }
  // chest wound
  b.part(new THREE.BoxGeometry(0.8, 0.9, 0.12), P.ink, { bone: chest, at: [0, 2.0, 2.3], rotation: [0, 0, 15] } as any);
  b.part(new THREE.BoxGeometry(0.55, 0.7, 0.1), P.ember, { bone: chest, at: [0, 2.0, 2.37], rotation: [0, 0, 15] } as any);
  b.part(new THREE.BoxGeometry(0.2, 0.4, 0.1), P.emberHot, { bone: chest, at: [0, 2.0, 2.42], rotation: [0, 0, 15] } as any);
  // neck-base collars
  for (const k of ["neckBase0", "neckBaseL1", "neckBaseL2", "neckBaseR1", "neckBaseR2"]) {
    const m = (M as any)[k];
    b.part(new THREE.SphereGeometry(0.62, 8, 6), P.hide, { bone: chest, at: [m[0], m[1] + 0.2, m[2]], scale: [1, 0.8, 1] });
    b.part(new THREE.TorusGeometry(0.5, 0.08, 5, 10), P.bronze, { bone: chest, at: [m[0], m[1] + 0.45, m[2]], rotation: [90, 0, 0] } as any);
  }
}
    return buildTorso;
  })(),
  // legsAndTail
  (() => {
function buildLegsAndTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- legs ----------
  const legs: Array<[string, number, number, boolean]> = [
    ["FL", 1, 1.6, true],
    ["FR", -1, 1.6, true],
    ["BL", 1, -1.5, false],
    ["BR", -1, -1.5, false],
  ];
  for (const [id, s, z, front] of legs) {
    const joint = J["leg" + id];
    const hipX = s * (front ? 1.3 : 1.4);
    const footX = s * (front ? 1.45 : 1.6);
    const hip = V(hipX, 1.55, z);
    const knee = V(hipX + s * 0.25, 0.95, z + (front ? 0.1 : -0.15));
    const ankle = V(footX, 0.3, z + (front ? 0.15 : -0.05));
    // thick mass
    b.part(new THREE.SphereGeometry(0.62, 8, 6), P.hide, { bone: joint, at: V(hipX, 1.5, z), scale: [0.9, 1.1, 1.05] });
    b.part(new THREE.SphereGeometry(0.4, 8, 6), P.hideLight, { bone: joint, at: V(hipX + s * 0.05, 1.8, z), scale: [1, 0.6, 1.1] });
    b.rod(hip, knee, [0.5, 0.4], P.hide, { bone: joint, sides: 8 });
    b.part(new THREE.SphereGeometry(0.42, 8, 6), P.hideDark, { bone: joint, at: knee });
    b.rod(knee, ankle, [0.38, 0.3], P.hide, { bone: joint, sides: 8 });
    // knee spike
    b.spike(knee, [s * 0.6, 0.2, front ? 0.7 : -0.7], 0.35, 0.1, P.bone, { bone: joint });
    // foot
    b.part(new THREE.BoxGeometry(0.75, 0.3, 0.9), P.hideDark, { bone: joint, at: V(footX, 0.15, z + 0.3), rotation: [0, s * 8, 0] });
    // toe bands
    b.part(new THREE.BoxGeometry(0.8, 0.12, 0.2), P.bronze, { bone: joint, at: V(footX, 0.2, z + 0.5) });
    b.part(new THREE.BoxGeometry(0.82, 0.05, 0.08), P.bronzeLight, { bone: joint, at: V(footX, 0.27, z + 0.5) });
    // claws
    for (let i = 0; i < 4; i++) {
      const cx = footX + (i - 1.5) * 0.19 + s * 0.05;
      b.spike(V(cx, 0.12, z + 0.7), [(i - 1.5) * 0.12, -0.15, 1], 0.3, 0.07, P.claw, { bone: joint });
    }
    // ankle band
    b.part(new THREE.CylinderGeometry(0.36, 0.38, 0.14, 8), P.bronze, { bone: joint, at: V(footX - s * 0.02, 0.5, z + 0.1) });
    // shackles on forelegs
    if (front) {
      const sh = V(hipX + s * 0.3, 0.78, z + 0.05);
      b.part(new THREE.TorusGeometry(0.4, 0.07, 5, 10), P.iron, { bone: joint, at: sh, rotation: [90, 0, 0] });
      b.part(new THREE.BoxGeometry(0.2, 0.2, 0.2), P.ironLight, { bone: joint, at: V(sh.x + s * 0.4, sh.y, sh.z + 0.05) });
      for (let k = 0; k < 4; k++) {
        b.part(new THREE.TorusGeometry(0.1, 0.03, 4, 8), k % 2 ? P.ironLight : P.iron, {
          bone: joint,
          at: V(sh.x + s * 0.5, sh.y - 0.12 - k * 0.15, sh.z + 0.08 + k * 0.02),
          rotation: [0, k % 2 ? 90 : 0, 0],
        });
      }
    }
    // ember scar
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.05), P.ember, { bone: joint, at: V(hipX + s * 0.5, 1.45, z + 0.1), rotation: [0, 0, s * 20] });
  }

  // ---------- tail ----------
  const T = [J.tail1, J.tail2, J.tail3];
  const pts = [V(0, 1.6, -2.4), V(0, 1.45, -3.0), V(0, 1.3, -3.4), V(0, 1.1, -3.9), V(0, 0.9, -4.4), V(0, 0.6, -5.4)];
  const path = pts;
  b.sweep(path, (t: number) => 0.55 * (1 - t) + 0.08, { bone: T, color: P.hide, sides: 8, caps: "round" });
  b.sweep(path, (t: number) => [0.35 * (1 - t) + 0.03, 0.05], {
    bone: T, color: P.belly, shift: (t: number) => [0, -(0.5 * (1 - t) + 0.05)], sides: 6, caps: "none",
  });
  // spikes along top
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const seg = Math.min(2, Math.floor(t * 3));
    const idx = t * (pts.length - 1);
    const a = Math.floor(idx), f = idx - a;
    const p = pts[a].clone().lerp(pts[Math.min(a + 1, pts.length - 1)], f);
    const r = 0.55 * (1 - t) + 0.08;
    b.spike(V(0, p.y + r * 0.85, p.z), [0, 1, -0.35], 0.5 * (1 - t) + 0.18, 0.12 * (1 - t) + 0.05, P.bone, { bone: T[seg] });
    if (i % 3 === 1)
      b.part(new THREE.BoxGeometry(0.06, 0.06, 0.22), P.ember, {
        bone: T[seg], at: V(0.4 * (1 - t) * (i % 2 ? 1 : -1), p.y + r * 0.5, p.z), rotation: [0, 0, 20],
      });
  }
  // bronze band
  b.part(new THREE.CylinderGeometry(0.4, 0.42, 0.16, 8), P.bronze, { bone: J.tail2, at: V(0, 1.15, -3.85), rotation: [90, 0, 0] });
  // blade tip
  const tip = V(0, 0.6, -5.4);
  b.extrude([[0, -0.2], [0.9, -0.1], [1.0, 0.0, "sharp"], [0.9, 0.1], [0, 0.2], [0.2, 0]], {
    at: tip, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.05, color: P.bloodRed, bone: J.tail3,
  });
  b.extrude([[0, -0.6], [0.5, -0.3], [0.9, 0, "sharp"], [0.5, 0.3], [0, 0.6]], {
    at: tip, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.08, color: P.bloodRed, bone: J.tail3,
  });
  for (const s of [1, -1])
    b.spike(V(s * 0.1, 0.6, -5.3), [s * 0.8, 0.3, -0.6], 0.5, 0.07, P.boneDark, { bone: J.tail3 });
}
    return buildLegsAndTail;
  })(),
  // centreAndInnerNecks
  (() => {
function buildCentreAndInnerNecks({ b, J, P, M }: any) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  function neck(a: any, bj: any, head: any, pts: number[][], rad: number[], tag: string) {
    const path = catmull(pts);
    const sw = b.sweep(path, rad, {
      bone: [a, bj, head],
      color: P.hide,
      sectors: [[125, 235, P.belly]],
    });
    // bone ridge spikes along the top
    b.along(sw, 6, (at: any) => {
      b.spike(at, at, 0.22, 0.07, { color: P.bone, bone: bj });
    });
    // bronze bands
    for (const t of [0.3, 0.62]) {
      const p = sw.at(t, 0);
      b.part(new THREE.CylinderGeometry(1, 1, 0.1, 8), P.bronze, {
        at: path.at(t),
        dir: path.tangentAt(t),
        scale: [p.radius * 1.12, 1, p.radius * 1.12],
        bone: bj,
      });
    }
    return sw;
  }

  function buildHead(head: any, jaw: any, s: number, tag: string) {
    const h = head;
    const L = (p: number[]) => h.local(p);
    const bone = h;
    // skull wedge
    b.frustumBox(L([0, 0, 0.0]), L([0, 0.7, -0.05]), [0.62, 0.5], [0.4, 0.3], { bone, color: P.hide });
    b.frustumBox(L([0, 0, 0.0]), L([0, 0.6, 0.0]), [0.5, 0.4], [0.5, 0.4], { bone, color: P.hideLight });
    // upper jaw / snout
    const u0 = L([0, 0.1, 0.05]);
    const u1 = L([0, 0.95, -0.02]);
    b.frustumBox(u0, u1, [0.5, 0.3], [0.32, 0.2], { bone, color: P.hide });
    // mouth interior
    b.frustumBox(L([0, 0.1, -0.08]), L([0, 0.9, -0.09]), [0.42, 0.06], [0.28, 0.05], { bone, color: P.mouthRed });
    // lower jaw
    b.frustumBox(jaw.local([0, 0, -0.1]), jaw.local([0, 0.9, -0.12]), [0.46, 0.16], [0.3, 0.12], {
      bone: jaw,
      color: P.hideDark,
    });
    // fangs
    for (const x of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const y = 0.25 + i * 0.2;
        b.spike(L([x * 0.2, y, -0.12]), [0, -1, 0], i === 1 ? 0.2 : 0.12, 0.035, { bone, color: P.bone });
        b.spike(jaw.local([x * 0.18, y + 0.05, -0.06]), [0, 1, 0], 0.1, 0.03, { bone: jaw, color: P.bone });
      }
    }
    // nostrils
    for (const x of [-1, 1])
      b.part(new THREE.SphereGeometry(0.04, 5, 4), P.ink, { bone, at: L([x * 0.1, 0.92, 0.08]) });
    // eyes
    for (const x of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.1, 6, 5), P.eyeAmber, { bone, at: L([x * 0.3, 0.4, 0.12]) });
      b.part(new THREE.BoxGeometry(0.02, 0.1, 0.14), P.ink, { bone, at: L([x * 0.3, 0.45, 0.2]) });
      // brow ridge
      b.rod(L([x * 0.18, 0.28, 0.24]), L([x * 0.42, 0.5, 0.2]), 0.05, { bone, color: P.boneDark });
      // swept horns
      const base = L([x * 0.3, 0.1, 0.24]);
      b.sweep(
        catmull([base, L([x * 0.5, -0.1, 0.4]), L([x * 0.62, -0.45, 0.45]), L([x * 0.58, -0.7, 0.6])]),
        [0.07, 0.01],
        { bone, color: P.bone, caps: { end: "point" } },
      );
      b.part(new THREE.TorusGeometry(0.075, 0.025, 4, 7), P.bronze, {
        bone,
        at: L([x * 0.5, -0.1, 0.4]),
        dir: [x * 0.5, 0.3, 0.2],
        axis: "z",
      });
    }
  }

  const specs = [
    { n: "0", s: 0, pts: [[0, 2.5, 1.5], [0, 3.1, 1.7], [0, 3.7, 1.95], [0, 4.2, 2.3]] },
    { n: "L1", s: 1, pts: [[0.6, 2.45, 1.4], [1.0, 3.0, 1.7], [1.5, 3.4, 2.0], [1.9, 3.8, 2.3]] },
    { n: "R1", s: -1, pts: [[-0.6, 2.45, 1.4], [-1.0, 3.0, 1.7], [-1.5, 3.4, 2.0], [-1.9, 3.8, 2.3]] },
  ];
  for (const sp of specs) {
    const a = J["neck" + sp.n + "a"];
    const bj = J["neck" + sp.n + "b"];
    const hd = J["head" + sp.n];
    const jw = J["jaw" + sp.n];
    neck(a, bj, hd, sp.pts, [0.42, 0.34, 0.28, 0.26], sp.n);
    buildHead(hd, jw, sp.s, sp.n);
  }

  // iron collar with hanging chain on centre neck
  const c = new THREE.Vector3(0, 3.1, 1.7);
  b.part(new THREE.TorusGeometry(0.42, 0.07, 5, 10), P.iron, {
    bone: J.neck0a, at: [0, 3.0, 1.68], dir: [0, 1, 0.3], axis: "z",
  });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.TorusGeometry(0.06, 0.02, 4, 6), P.ironLight, {
      bone: J.neck0a,
      at: [0.3, 2.9 - i * 0.1, 1.95],
      rotation: [0, i % 2 ? 90 : 0, 0],
    });
}
    return buildCentreAndInnerNecks;
  })(),
  // outerNecks
  (() => {
function buildOuterNecks({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const a = J["neck" + side + "2a"], nb = J["neck" + side + "2b"], head = J["head" + side + "2"], jaw = J["jaw" + side + "2"];
    const base = M["neckBase" + side + "2"];
    const p0 = V(base), p1 = V([s * 1.6, 2.75, 1.4]), p2 = V([s * 2.2, 3.15, 1.8]), p3 = V([s * 2.65, 3.2, 2.05]);
    const path = catmull([p0, p1, p2, p3]);
    const neck = b.sweep(path, [0.4, 0.24], { bone: [a, nb, head], color: P.hide, sectors: [[125, 235, P.belly]] });
    // ridge spikes
    b.along(neck, 6, (at) => b.spike(at, at, 0.2, 0.06, { color: P.bone }));
    // bronze bands
    for (const t of [0.25, 0.55, 0.85]) {
      const at = neck.at(t, 0);
      b.part(new THREE.CylinderGeometry(1, 1, 0.1, 8), P.bronze, {
        at: path.at(t), dir: path.tangentAt(t), bone: t > 0.6 ? nb : a, scale: [0.04 + 0.4 - t * 0.17, 1, 0.04 + 0.4 - t * 0.17] as any,
      });
      void at;
    }
    // ember rune scars
    for (const t of [0.35, 0.7]) {
      const h = neck.at(t, 70 * s);
      b.stick(new THREE.BoxGeometry(0.2, 0.025, 0.05), P.ember, h, { embed: 0.3 });
    }
    // head
    const hp = head.at.clone();
    const hd = head.local({ forward: 0.0 });
    void hd;
    const H = (f: number, u: number, r = 0) => head.local({ forward: f, up: u, left: r });
    const dir = (f: number, u: number, r = 0) => head.dir([r, f, u] as any);
    void dir;
    const skull = b.part(new THREE.BoxGeometry(0.46, 0.34, 0.6), P.hide, { bone: head, at: H(0.28, 0.02), dir: [s * 0.6, -0.1, 1], axis: "z" });
    b.part(new THREE.BoxGeometry(0.3, 0.2, 0.4), P.hideLight, { bone: head, at: H(0.62, -0.02), dir: [s * 0.6, -0.1, 1], axis: "z" });
    // brow ridges and eyes
    for (const e of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.15, 0.07, 0.3), P.hideDark, { bone: head, at: H(0.3, 0.2, e * 0.2), dir: [s * 0.6, -0.1, 1], axis: "z" });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.eyeAmber, { bone: head, at: H(0.4, 0.12, e * 0.24) });
      b.part(new THREE.BoxGeometry(0.014, 0.08, 0.02), P.ink, { bone: head, at: H(0.45, 0.12, e * 0.24) });
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.ink, { bone: head, at: H(0.83, 0.05, e * 0.08) });
      // horns
      const hs = H(0.08, 0.17, e * 0.2);
      const horn = b.spike(hs, offset(hs, [e * 0.5 * -1 + e * 0.3, 0.5, -1], 0.5), 0.55, 0.08, { bone: head, color: P.bone });
      void horn;
      b.part(new THREE.TorusGeometry(0.075, 0.02, 4, 8), P.bronze, { bone: head, at: H(0.06, 0.2, e * 0.21), dir: [0, 0.5, -1] });
    }
    // upper fangs
    for (const f of [0.55, 0.75]) for (const e of [1, -1])
      b.spike(H(f, -0.1, e * 0.13), [0, -1, 0], 0.17, 0.03, { bone: head, color: P.bone });
    // lower jaw
    b.part(new THREE.BoxGeometry(0.34, 0.1, 0.65), P.hideDark, { bone: jaw, at: H(0.45, -0.17), dir: [s * 0.6, -0.1, 1], axis: "z" });
    b.part(new THREE.BoxGeometry(0.26, 0.03, 0.55), P.mouthRed, { bone: jaw, at: H(0.45, -0.115), dir: [s * 0.6, -0.1, 1], axis: "z" });
    for (const f of [0.6, 0.8]) for (const e of [1, -1])
      b.spike(H(f, -0.13, e * 0.12), [0, 1, 0], 0.14, 0.025, { bone: jaw, color: P.bone });
    // torn frill
    for (const e of [1, -1]) for (let i = 0; i < 3; i++) {
      const fl = H(-0.05 - i * 0.05, 0.05 + i * 0.1, e * 0.25);
      b.spike(fl, [e * 1, 0.3 * i - 0.2, -0.4], 0.35 - i * 0.05, 0.07, { bone: head, color: i % 2 ? P.bloodRed : P.mouthRed });
    }
    if (s > 0) {
      // broken muzzle strap
      b.part(new THREE.BoxGeometry(0.4, 0.05, 0.07), P.iron, { bone: head, at: H(0.55, 0.1), dir: [s * 0.6, -0.1, 1], axis: "z", rotation: [0, 0, 8] });
      b.part(new THREE.BoxGeometry(0.4, 0.05, 0.07), P.iron, { bone: head, at: H(0.55, -0.08), dir: [s * 0.6, -0.1, 1], axis: "z" });
      b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 6), P.ironLight, { bone: head, at: H(0.55, -0.1, 0.22) });
      b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 6), P.ironLight, { bone: head, at: H(0.55, -0.2, 0.24), rotation: [0, 90, 0] });
    } else {
      // cracked scarred horn
      b.part(new THREE.BoxGeometry(0.02, 0.2, 0.03), P.ink, { bone: head, at: H(0.0, 0.3, 0.2) });
      b.part(new THREE.BoxGeometry(0.06, 0.03, 0.04), P.ember, { bone: head, at: H(0.0, 0.36, 0.2) });
    }
    void hp; void skull; void R; void frame;
  }
}
    return buildOuterNecks;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "godOfWarHydra" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,1.7,-1.5], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,1.9,0.4], dir: [0,0,1], role: "spine" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,1.6,-2.4], dir: [0,0,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.3,-3.4], dir: [0,-0.1,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.9,-4.4], dir: [0,-0.1,-1], role: "tail" });
  J["legFL"] = b.joint("legFL", { parent: J["chest"], at: [1.3,1.5,1.6], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legFR"] = b.joint("legFR", { parent: J["chest"], at: [-1.3,1.5,1.6], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legBL"] = b.joint("legBL", { parent: J["hips"], at: [1.4,1.5,-1.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legBR"] = b.joint("legBR", { parent: J["hips"], at: [-1.4,1.5,-1.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["neck0a"] = b.joint("neck0a", { parent: J["chest"], at: [0,2.5,1.5], dir: [0,1,0.3], role: "neck", group: "neck0" });
  J["neck0b"] = b.joint("neck0b", { parent: J["neck0a"], at: [0,3.2,1.8], dir: [0,1,0.3], role: "neck", group: "neck0" });
  J["head0"] = b.joint("head0", { parent: J["neck0b"], at: [0,4.2,2.3], dir: [0,0,1], role: "head", group: "neck0" });
  J["jaw0"] = b.joint("jaw0", { parent: J["head0"], at: [0,4.15,2.4], dir: [0,0,1], role: "jaw", group: "neck0" });
  J["neckL1a"] = b.joint("neckL1a", { parent: J["chest"], at: [0.6,2.45,1.4], dir: [0.5,1,0.4], role: "neck", group: "neckL1" });
  J["neckL1b"] = b.joint("neckL1b", { parent: J["neckL1a"], at: [1.2,3.1,1.8], dir: [0.5,1,0.4], role: "neck", group: "neckL1" });
  J["headL1"] = b.joint("headL1", { parent: J["neckL1b"], at: [1.9,3.8,2.3], dir: [0.3,0,1], role: "head", group: "neckL1" });
  J["jawL1"] = b.joint("jawL1", { parent: J["headL1"], at: [1.9,3.75,2.4], dir: [0.3,0,1], role: "jaw", group: "neckL1" });
  J["neckL2a"] = b.joint("neckL2a", { parent: J["chest"], at: [1.1,2.3,1.25], dir: [1,0.7,0.3], role: "neck", group: "neckL2" });
  J["neckL2b"] = b.joint("neckL2b", { parent: J["neckL2a"], at: [2,2.9,1.6], dir: [1,0.6,0.4], role: "neck", group: "neckL2" });
  J["headL2"] = b.joint("headL2", { parent: J["neckL2b"], at: [2.8,3.2,2.1], dir: [0.6,-0.1,1], role: "head", group: "neckL2" });
  J["jawL2"] = b.joint("jawL2", { parent: J["headL2"], at: [2.8,3.15,2.2], dir: [0.6,-0.1,1], role: "jaw", group: "neckL2" });
  J["neckR1a"] = b.joint("neckR1a", { parent: J["chest"], at: [-0.6,2.45,1.4], dir: [-0.5,1,0.4], role: "neck", group: "neckR1" });
  J["neckR1b"] = b.joint("neckR1b", { parent: J["neckR1a"], at: [-1.2,3.1,1.8], dir: [-0.5,1,0.4], role: "neck", group: "neckR1" });
  J["headR1"] = b.joint("headR1", { parent: J["neckR1b"], at: [-1.9,3.8,2.3], dir: [-0.3,0,1], role: "head", group: "neckR1" });
  J["jawR1"] = b.joint("jawR1", { parent: J["headR1"], at: [-1.9,3.75,2.4], dir: [-0.3,0,1], role: "jaw", group: "neckR1" });
  J["neckR2a"] = b.joint("neckR2a", { parent: J["chest"], at: [-1.1,2.3,1.25], dir: [-1,0.7,0.3], role: "neck", group: "neckR2" });
  J["neckR2b"] = b.joint("neckR2b", { parent: J["neckR2a"], at: [-2,2.9,1.6], dir: [-1,0.6,0.4], role: "neck", group: "neckR2" });
  J["headR2"] = b.joint("headR2", { parent: J["neckR2b"], at: [-2.8,3.2,2.1], dir: [-0.6,-0.1,1], role: "head", group: "neckR2" });
  J["jawR2"] = b.joint("jawR2", { parent: J["headR2"], at: [-2.8,3.15,2.2], dir: [-0.6,-0.1,1], role: "jaw", group: "neckR2" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
